'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
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

interface PasswordChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PasswordChangeDialog: React.FC<PasswordChangeDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { supabase } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 비밀번호 유효성 검증
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('비밀번호는 최소 8자 이상이어야 합니다.');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('대문자를 하나 이상 포함해야 합니다.');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('소문자를 하나 이상 포함해야 합니다.');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('숫자를 하나 이상 포함해야 합니다.');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('특수문자를 하나 이상 포함해야 합니다.');
    }
    
    return errors;
  };

  // 새 비밀번호 입력 시 실시간 유효성 검증
  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    if (value) {
      setValidationErrors(validatePassword(value));
    } else {
      setValidationErrors([]);
    }
  };

  // 초기화
  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setError('');
    setValidationErrors([]);
  };

  // 비밀번호 변경 처리
  const handlePasswordChange = async () => {
    setError('');

    // 입력 검증
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    // 새 비밀번호 유효성 검증
    const errors = validatePassword(newPassword);
    if (errors.length > 0) {
      setError('비밀번호가 보안 요구사항을 충족하지 않습니다.');
      return;
    }

    // 비밀번호 확인 일치 검증
    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    // 현재 비밀번호와 새 비밀번호가 같은지 검증
    if (currentPassword === newPassword) {
      setError('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. 먼저 현재 비밀번호로 재인증 (보안 강화)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email!,
        password: currentPassword,
      });

      if (signInError) {
        setError('현재 비밀번호가 올바르지 않습니다.');
        setIsLoading(false);
        return;
      }

      // 2. 비밀번호 변경
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
        console.error('Password update error:', updateError);
      } else {
        // 성공
        toast.success('비밀번호가 성공적으로 변경되었습니다.', {
          description: '보안을 위해 다시 로그인해주세요.',
          icon: <CheckCircle className="h-4 w-4" />,
        });
        
        resetForm();
        onOpenChange(false);
        
        // 3초 후 자동 로그아웃 (선택사항)
        setTimeout(async () => {
          await supabase.auth.signOut();
          window.location.href = '/auth';
        }, 3000);
      }
    } catch (err) {
      console.error('Password change error:', err);
      setError('예상치 못한 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            비밀번호 변경
          </DialogTitle>
          <DialogDescription>
            계정 보안을 위해 안전한 비밀번호를 설정해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 에러 메시지 */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 현재 비밀번호 */}
          <div className="space-y-2">
            <Label htmlFor="current-password">현재 비밀번호</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
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
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* 새 비밀번호 */}
          <div className="space-y-2">
            <Label htmlFor="new-password">새 비밀번호</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => handleNewPasswordChange(e.target.value)}
                placeholder="새 비밀번호를 입력하세요"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* 비밀번호 유효성 검증 메시지 */}
            {newPassword && validationErrors.length > 0 && (
              <div className="mt-2 space-y-1">
                {validationErrors.map((err, index) => (
                  <p key={index} className="text-xs text-red-500 flex items-center gap-1">
                    <span className="text-red-400">•</span> {err}
                  </p>
                ))}
              </div>
            )}
            
            {/* 모든 조건 충족 시 체크 표시 */}
            {newPassword && validationErrors.length === 0 && (
              <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                <CheckCircle className="h-3 w-3" />
                안전한 비밀번호입니다
              </p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호를 다시 입력하세요"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* 비밀번호 일치 여부 표시 */}
            {confirmPassword && (
              <p className={`text-xs flex items-center gap-1 mt-2 ${
                newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'
              }`}>
                {newPassword === confirmPassword ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    비밀번호가 일치합니다
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    비밀번호가 일치하지 않습니다
                  </>
                )}
              </p>
            )}
          </div>

          {/* 비밀번호 요구사항 안내 */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-xs font-medium mb-2">비밀번호 요구사항:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• 최소 8자 이상</li>
              <li>• 대문자, 소문자, 숫자, 특수문자 각 1개 이상 포함</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            onClick={handlePasswordChange}
            disabled={isLoading || validationErrors.length > 0 || !newPassword || !confirmPassword}
          >
            {isLoading ? '변경 중...' : '비밀번호 변경'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};