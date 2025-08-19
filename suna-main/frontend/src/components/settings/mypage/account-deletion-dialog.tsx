'use client';

import React, { useState } from 'react';
import { AlertTriangle, Eye, EyeOff, Loader2, Shield, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface AccountDeletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DeletionPreview {
  data_summary: {
    threads?: number;
    messages?: number;
    agents?: number;
    projects?: number;
    devices?: number;
    api_keys?: number;
  };
  total_records: number;
  account_ids: string[];
}

export const AccountDeletionDialog: React.FC<AccountDeletionDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [error, setError] = useState('');
  const [deletionPreview, setDeletionPreview] = useState<DeletionPreview | null>(null);
  const [step, setStep] = useState<'preview' | 'confirmation' | 'final'>('preview');

  // 초기화
  const resetDialog = () => {
    setCurrentPassword('');
    setConfirmationText('');
    setShowPassword(false);
    setError('');
    setDeletionPreview(null);
    setStep('preview');
    setIsLoading(false);
    setIsLoadingPreview(false);
  };

  // 삭제 미리보기 로드
  const loadDeletionPreview = async () => {
    if (deletionPreview) return; // 이미 로드됨

    setIsLoadingPreview(true);
    try {
      const supabase = (await import('@/lib/supabase/client')).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/account/deletion-preview`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load deletion preview');
      }

      const preview: DeletionPreview = await response.json();
      setDeletionPreview(preview);
    } catch (err) {
      console.error('Failed to load deletion preview:', err);
      setError('삭제 미리보기를 불러올 수 없습니다.');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // 다이얼로그 열림 시 미리보기 로드
  React.useEffect(() => {
    if (open && step === 'preview') {
      loadDeletionPreview();
    }
  }, [open, step]);

  // 계정 삭제 실행
  const executeAccountDeletion = async () => {
    setError('');
    setIsLoading(true);

    try {
      // 먼저 프론트엔드에서 비밀번호 검증
      const supabase = (await import('@/lib/supabase/client')).createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser?.email) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }

      // 비밀번호 재인증
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: currentPassword,
      });

      if (authError) {
        throw new Error('현재 비밀번호가 올바르지 않습니다.');
      }

      // 비밀번호 검증 성공, 백엔드 API 호출
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/account/delete-permanently`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          password: currentPassword,
          confirmation_text: confirmationText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Account deletion failed');
      }

      // 성공
      toast.success('계정이 성공적으로 삭제되었습니다.', {
        description: '이용해 주셔서 감사했습니다.',
        duration: 5000,
      });

      // 로그아웃 및 리디렉션
      setTimeout(() => {
        window.location.href = '/auth';
      }, 2000);

    } catch (err: any) {
      console.error('Account deletion failed:', err);
      setError(err.message || '계정 삭제에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 'preview') {
      setStep('confirmation');
    } else if (step === 'confirmation') {
      setStep('final');
    }
  };

  const handleBack = () => {
    if (step === 'final') {
      setStep('confirmation');
    } else if (step === 'confirmation') {
      setStep('preview');
    }
  };

  const canProceedFromConfirmation = currentPassword.trim() && confirmationText === 'DELETE';
  const canExecuteDeletion = canProceedFromConfirmation && step === 'final';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetDialog();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            계정 영구 삭제
          </DialogTitle>
          <DialogDescription className="text-red-500">
            이 작업은 되돌릴 수 없습니다. 신중하게 진행해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 에러 메시지 */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: 삭제 미리보기 */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  삭제될 데이터 미리보기
                </h3>
                
                {isLoadingPreview ? (
                  <div className="flex items-center gap-2 text-red-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    데이터를 분석하고 있습니다...
                  </div>
                ) : deletionPreview ? (
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(deletionPreview.data_summary).map(([key, count]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize text-red-700 dark:text-red-300">
                            {key === 'threads' && '대화 스레드'}
                            {key === 'messages' && '메시지'}
                            {key === 'agents' && 'AI 에이전트'}
                            {key === 'projects' && '프로젝트'}
                            {key === 'devices' && '디바이스'}
                            {key === 'api_keys' && 'API 키'}
                          </span>
                          <span className="font-medium text-red-800 dark:text-red-200">
                            {count}개
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-red-200 dark:border-red-800 pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span className="text-red-700 dark:text-red-300">총 데이터</span>
                        <span className="text-red-800 dark:text-red-200">
                          {deletionPreview.total_records}개
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-600">데이터를 불러올 수 없습니다.</div>
                )}
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  계정 삭제 시 다음이 영구적으로 삭제됩니다:
                  <ul className="mt-2 ml-4 list-disc text-sm space-y-1">
                    <li>모든 대화 기록 및 메시지</li>
                    <li>생성한 모든 AI 에이전트</li>
                    <li>프로젝트 및 파일</li>
                    <li>API 키 및 연동 정보</li>
                    <li>계정 정보 및 설정</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Step 2: 확인 정보 입력 */}
          {step === 'confirmation' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  계속하려면 현재 비밀번호와 확인 텍스트를 입력해주세요.
                </AlertDescription>
              </Alert>

              {/* 현재 비밀번호 */}
              <div className="space-y-2">
                <Label htmlFor="current-password">현재 비밀번호</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="현재 비밀번호를 입력하세요"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* 확인 텍스트 */}
              <div className="space-y-2">
                <Label htmlFor="confirmation-text">
                  확인을 위해 <code className="bg-red-100 dark:bg-red-900 px-1 rounded text-red-800 dark:text-red-200">DELETE</code>를 입력하세요
                </Label>
                <Input
                  id="confirmation-text"
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="DELETE"
                  disabled={isLoading}
                />
                {confirmationText && confirmationText !== 'DELETE' && (
                  <p className="text-xs text-red-500">
                    정확히 "DELETE"를 입력해주세요.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: 최종 확인 */}
          {step === 'final' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="space-y-2">
                  <p className="font-semibold">최종 확인</p>
                  <p>정말로 계정을 영구적으로 삭제하시겠습니까?</p>
                  <p>이 작업은 <strong>절대 되돌릴 수 없습니다</strong>.</p>
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">삭제 요청 정보:</h4>
                <div className="text-sm space-y-1">
                  <p>계정: {user?.email}</p>
                  <p>요청 시간: {new Date().toLocaleString('ko-KR')}</p>
                  <p>삭제 대상: {deletionPreview?.total_records || 0}개 데이터</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0">
          <div className="flex gap-2 w-full">
            {step !== 'preview' && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
                className="flex-1"
              >
                이전
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              취소
            </Button>

            {step === 'final' ? (
              <Button
                variant="destructive"
                onClick={executeAccountDeletion}
                disabled={!canExecuteDeletion || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    삭제 중...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    계정 영구 삭제
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={
                  isLoadingPreview || 
                  (step === 'confirmation' && !canProceedFromConfirmation)
                }
                className="flex-1"
              >
                {step === 'preview' && '다음'}
                {step === 'confirmation' && '최종 확인'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};