'use client';

import React from 'react';
import { MyPageHeader } from '@/components/settings/mypage/header';
import { ProfileOverview } from '@/components/settings/mypage/profile-overview';
import { AccountSecurity } from '@/components/settings/mypage/account-security';
import { DangerousOperations } from '@/components/settings/mypage/dangerous-operations';

export default function MyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <MyPageHeader />
        
        <div className="space-y-8 mt-8">
          <ProfileOverview />
          <AccountSecurity />
          <DangerousOperations />
        </div>
      </div>
    </div>
  );
}
