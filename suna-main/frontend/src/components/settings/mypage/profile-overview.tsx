'use client';

import React, { useState } from 'react';
import { Mail, Lock, Calendar, User, Building, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { PasswordChangeDialog } from './password-change-dialog';
import { DepartmentChangeDialog } from './department-change-dialog';

export const ProfileOverview = () => {
  const { user } = useAuth();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">프로필 개요</CardTitle>
        <CardDescription>계정의 기본 정보를 확인하세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 이메일 주소 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">이메일 주소</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={user?.email || ''}
                  readOnly
                  className="pl-10 bg-muted/50"
                />
              </div>
              <Badge variant="secondary" className="px-3 py-2">
                인증됨
              </Badge>
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">비밀번호</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value="••••••••"
                  readOnly
                  className="pl-10 bg-muted/50"
                />
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setIsPasswordDialogOpen(true)}
              >
                변경
              </Button>
            </div>
          </div>

          {/* 가입일 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">가입일</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={formatDate(user?.created_at || new Date().toISOString())}
                readOnly
                className="pl-10 bg-muted/50"
              />
            </div>
          </div>

          {/* 사용자 이름 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">사용자 이름</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={user?.user_metadata?.full_name || '이름 미설정'}
                readOnly
                className="pl-10 bg-muted/50"
              />
            </div>
          </div>

          {/* 부서 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">부서</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={user?.user_metadata?.department || '부서 미지정'}
                  readOnly
                  className="pl-10 bg-muted/50"
                />
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setIsDepartmentDialogOpen(true)}
              >
                변경
              </Button>
            </div>
          </div>

          {/* 계정 권한 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">계정 권한</label>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">일반 사용자</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* 비밀번호 변경 다이얼로그 */}
      <PasswordChangeDialog 
        open={isPasswordDialogOpen} 
        onOpenChange={setIsPasswordDialogOpen} 
      />
      
      {/* 부서 변경 다이얼로그 */}
      <DepartmentChangeDialog
        open={isDepartmentDialogOpen}
        onOpenChange={setIsDepartmentDialogOpen}
      />
    </Card>
  );
};
