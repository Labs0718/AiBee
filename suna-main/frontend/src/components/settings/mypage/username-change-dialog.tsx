'use client';

import React, { useState } from 'react';
import { User, CheckCircle, AlertCircle } from 'lucide-react';
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

interface UsernameChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UsernameChangeDialog: React.FC<UsernameChangeDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { supabase, user } = useAuth();
  const [newUsername, setNewUsername] = useState(
    user?.user_metadata?.full_name || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 사용자 이름 유효성 검증
  const validateUsername = (username: string): string[] => {
    const errors: string[] = [];
    
    if (!username.trim()) {
      errors.push('사용자 이름을 입력해주세요.');
    } else if (username.trim().length < 2) {
      errors.push('사용자 이름은 최소 2자 이상이어야 합니다.');
    } else if (username.trim().length > 20) {
      errors.push('사용자 이름은 최대 20자까지 가능합니다.');
    }
    
    // 특수문자 검증 (일부 허용)
    const allowedPattern = /^[가-힣a-zA-Z0-9\s._-]+$/;
    if (!allowedPattern.test(username.trim())) {
      errors.push('한글, 영문, 숫자, 공백, ., _, - 만 사용 가능합니다.');
    }
    
    return errors;
  };

  // 사용자 이름 입력 시 실시간 유효성 검증
  const handleUsernameChange = (value: string) => {
    setNewUsername(value);
    if (value) {
      setValidationErrors(validateUsername(value));
    } else {
      setValidationErrors([]);
    }
  };

  // 초기화
  const resetForm = () => {
    setNewUsername(user?.user_metadata?.full_name || '');
    setError('');
    setValidationErrors([]);
  };

  // 사용자 이름 변경 처리
  const handleUsernameUpdate = async () => {
    setError('');

    const trimmedUsername = newUsername.trim();
    
    // 입력 검증
    if (!trimmedUsername) {
      setError('사용자 이름을 입력해주세요.');
      return;
    }

    // 유효성 검증
    const errors = validateUsername(trimmedUsername);
    if (errors.length > 0) {
      setError('사용자 이름이 유효하지 않습니다.');
      return;
    }

    // 현재 이름과 동일한 경우
    if (trimmedUsername === user?.user_metadata?.full_name) {
      toast.info('현재 사용자 이름과 동일합니다.');
      return;
    }

    setIsLoading(true);

    try {
      // Supabase user_metadata 업데이트
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: trimmedUsername
        }
      });

      if (updateError) {
        setError('사용자 이름 변경에 실패했습니다. 다시 시도해주세요.');
        console.error('Username update error:', updateError);
      } else {
        // 성공
        toast.success('사용자 이름이 성공적으로 변경되었습니다.', {
          description: `새 사용자 이름: ${trimmedUsername}`,
          icon: <CheckCircle className="h-4 w-4" />,
        });
        
        resetForm();
        onOpenChange(false);
        
        // 1초 후 페이지 새로고침으로 UI 업데이트
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      console.error('Username change error:', err);
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            사용자 이름 변경
          </DialogTitle>
          <DialogDescription>
            표시될 사용자 이름을 설정해주세요.
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

          {/* 현재 사용자 이름 표시 */}
          {user?.user_metadata?.full_name && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                현재 사용자 이름: <span className="font-medium text-foreground">
                  {user.user_metadata.full_name}
                </span>
              </p>
            </div>
          )}

          {/* 새 사용자 이름 입력 */}
          <div className="space-y-2">
            <Label htmlFor="new-username">새 사용자 이름</Label>
            <Input
              id="new-username"
              type="text"
              value={newUsername}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="사용자 이름을 입력하세요"
              disabled={isLoading}
              maxLength={20}
            />
            
            {/* 실시간 유효성 검증 메시지 */}
            {newUsername && validationErrors.length > 0 && (
              <div className="mt-2 space-y-1">
                {validationErrors.map((err, index) => (
                  <p key={index} className="text-xs text-red-500 flex items-center gap-1">
                    <span className="text-red-400">•</span> {err}
                  </p>
                ))}
              </div>
            )}
            
            {/* 모든 조건 충족 시 체크 표시 */}
            {newUsername && validationErrors.length === 0 && newUsername.trim() !== user?.user_metadata?.full_name && (
              <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                <CheckCircle className="h-3 w-3" />
                사용 가능한 사용자 이름입니다
              </p>
            )}
          </div>

          {/* 사용자 이름 규칙 안내 */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-xs font-medium mb-2">사용자 이름 규칙:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• 2자 이상 20자 이하</li>
              <li>• 한글, 영문, 숫자, 공백, ., _, - 사용 가능</li>
              <li>• 사이드바와 프로필에 표시됩니다</li>
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
            onClick={handleUsernameUpdate}
            disabled={isLoading || validationErrors.length > 0 || !newUsername.trim() || newUsername.trim() === user?.user_metadata?.full_name}
          >
            {isLoading ? '변경 중...' : '사용자 이름 변경'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};