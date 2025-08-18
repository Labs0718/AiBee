'use client';

import React from 'react';
import { Shield, Eye, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const AccountSecurity = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">계정 보안</CardTitle>
        <CardDescription>계정의 보안 설정을 관리합니다</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 2단계 인증 */}
          <Card className="border-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
                  활성화됨
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground mb-2">2단계 인증</h3>
              <p className="text-sm text-muted-foreground">
                추가 보안을 위해 2단계 인증이 활성화되어 있습니다.
              </p>
            </CardContent>
          </Card>

          {/* 로그인 기록 */}
          <Card className="border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-2">로그인 기록</h3>
              <p className="text-sm text-muted-foreground">
                최근 활동 확인
              </p>
            </CardContent>
          </Card>

          {/* 개인정보 설정 */}
          <Card className="border-2 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-950/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-2">개인정보 설정</h3>
              <p className="text-sm text-muted-foreground">
                프라이버시 관리
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
