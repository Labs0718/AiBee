'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

async function sendWelcomeEmail(email: string, name?: string) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const adminApiKey = process.env.KORTIX_ADMIN_API_KEY;
    
    if (!adminApiKey) {
      console.error('KORTIX_ADMIN_API_KEY not configured');
      return;
    }
    
    const response = await fetch(`${backendUrl}/api/send-welcome-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Api-Key': adminApiKey,
      },
      body: JSON.stringify({
        email,
        name,
      }),
    });

    if (response.ok) {
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Failed to queue welcome email for ${email}:`, errorData);
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}

export async function signIn(prevState: any, formData: FormData) {
  const emailInput = formData.get('email') as string;
  const password = formData.get('password') as string;
  const returnUrl = formData.get('returnUrl') as string | undefined;

  // Construct full email address
  const email = emailInput.includes('@') ? emailInput : `${emailInput}@goability.co.kr`;

  if (!emailInput) {
    return { message: 'Please enter your username' };
  }

  if (!password || password.length < 6) {
    return { message: 'Password must be at least 6 characters' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { message: error.message || 'Could not authenticate user' };
  }

  // Use client-side navigation instead of server-side redirect
  return { success: true, redirectTo: returnUrl || '/dashboard' };
}

export async function signUp(prevState: any, formData: FormData) {
  const origin = formData.get('origin') as string;
  const emailInput = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const name = formData.get('name') as string;
  const departmentId = formData.get('department') as string;  // Now this is the department ID
  const returnUrl = formData.get('returnUrl') as string | undefined;

  // Construct full email address
  const email = emailInput.includes('@') ? emailInput : `${emailInput}@goability.co.kr`;

  if (!emailInput) {
    return { message: 'Please enter your username' };
  }

  if (!name || name.trim().length < 2) {
    return { message: 'Please enter your name (at least 2 characters)' };
  }

  if (!departmentId) {
    return { message: 'Please select your department' };
  }

  if (!password || password.length < 6) {
    return { message: 'Password must be at least 6 characters' };
  }

  if (password !== confirmPassword) {
    return { message: 'Passwords do not match' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?returnUrl=${returnUrl}`,
      data: {
        name: name.trim(),
        dept_id: departmentId,  // Store department ID in metadata
      },
    },
  });

  if (error) {
    return { message: error.message || 'Could not create account' };
  }

  const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInData && signInData.user) {
    // Now departmentId is already the ID from the form, no need to look it up

    // Create basejump.accounts entry for the new user
    const { error: accountError } = await supabase
      .schema('basejump')
      .from('accounts')
      .insert({
        primary_owner_user_id: signInData.user.id,
        display_name: name.trim(),  // 실명은 display_name에만 저장
        department_id: departmentId,
        role: 'user', // default role
        personal_account: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (accountError) {
      console.error('Failed to create basejump account:', accountError);
    } else {
      console.log('Basejump account created with department_id:', departmentId);
    }

    sendWelcomeEmail(email, name.trim());
  }

  if (signInError) {
    return {
      message:
        'Account created! Check your email to confirm your registration.',
    };
  }

  // Use client-side navigation instead of server-side redirect
  return { success: true, redirectTo: returnUrl || '/dashboard' };
}

export async function forgotPassword(prevState: any, formData: FormData) {
  const emailInput = formData.get('email') as string;
  const origin = formData.get('origin') as string;

  // Construct full email address
  const email = emailInput.includes('@') ? emailInput : `${emailInput}@goability.co.kr`;

  if (!emailInput) {
    return { message: 'Please enter your username' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-password`,
  });

  if (error) {
    return { message: error.message || 'Could not send password reset email' };
  }

  return {
    success: true,
    message: 'Check your email for a password reset link',
  };
}

export async function resetPassword(prevState: any, formData: FormData) {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || password.length < 6) {
    return { message: 'Password must be at least 6 characters' };
  }

  if (password !== confirmPassword) {
    return { message: 'Passwords do not match' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { message: error.message || 'Could not update password' };
  }

  return {
    success: true,
    message: 'Password updated successfully',
  };
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { message: error.message || 'Could not sign out' };
  }

  return redirect('/');
}
