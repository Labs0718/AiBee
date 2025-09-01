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
  const departmentIdStr = formData.get('department') as string;
  const departmentId = departmentIdStr ? parseInt(departmentIdStr, 10) : null;  // Convert to integer!
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

  const { error, data } = await supabase.auth.signUp({
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

  // 회원가입이 성공하면 user 정보가 있을 것임
  if (data && data.user) {
    // RPC 함수로 프로필 업데이트 (기본 권한: user)
    const { error: updateError } = await supabase.rpc('update_user_profile_after_signup', {
      p_user_id: data.user.id,
      p_display_name: name.trim(),
      p_department_id: departmentId,
      p_user_role: 'user'  // 기본값: 일반사용자
    });

    if (updateError) {
      console.error('Failed to update user profile:', updateError);
      return { message: 'Account created but failed to update profile: ' + updateError.message };
    } else {
      console.log('User profile updated successfully:', {
        display_name: name.trim(),
        department_id: departmentId
      });
    }

    sendWelcomeEmail(email, name.trim());
    
    // Store groupware password using Supabase RPC
    try {
      console.log('🔑 Storing groupware password via Supabase RPC for user:', data.user?.id);
      
      const { error: rpcError } = await supabase.rpc('store_groupware_password_on_signup', {
        p_user_id: data.user?.id,
        p_password: password
      });

      if (rpcError) {
        console.error('❌ Failed to store groupware password via RPC:', rpcError);
      } else {
        console.log('✅ Groupware password stored successfully via RPC');
      }
    } catch (error) {
      console.error('❌ Error storing groupware password:', error);
    }
    
    // 이메일 확인이 필요한지 체크
    if (data.user.email_confirmed_at) {
      // 이미 확인된 경우 자동 로그인 시도
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!signInError) {
        return { success: true, redirectTo: returnUrl || '/dashboard' };
      }
    }
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
