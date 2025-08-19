'use client';

import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AccountDeletionDialog } from './account-deletion-dialog';

export const DangerousOperations = () => {
  const [isAccountDeletionDialogOpen, setIsAccountDeletionDialogOpen] = useState(false);

  return (
    <Card className="border-2 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-red-800 dark:text-red-200">
              위험한 작업
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              이 작업들은 되돌릴 수 없습니다. 신중하게 진행해주세요.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  계정 영구 삭제
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  계정을 삭제하면 모든 데이터가 영구적으로 삭제되며, 이 작업은 되돌릴 수 없습니다.
                </p>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                className="ml-4 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => setIsAccountDeletionDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                계정 삭제
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* 계정 삭제 다이얼로그 */}
      <AccountDeletionDialog
        open={isAccountDeletionDialogOpen}
        onOpenChange={setIsAccountDeletionDialogOpen}
      />
    </Card>
  );
};
