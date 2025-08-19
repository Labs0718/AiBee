'use client';

import React, { useState } from 'react';
import { Building, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { DEPARTMENTS } from '@/lib/constants/departments';

interface DepartmentChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DepartmentChangeDialog: React.FC<DepartmentChangeDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { supabase, user } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    user?.user_metadata?.department || ''
  );
  const [isLoading, setIsLoading] = useState(false);

  // 부서 변경 처리
  const handleDepartmentChange = async () => {
    if (!selectedDepartment) {
      toast.error('부서를 선택해주세요.');
      return;
    }

    // 현재 부서와 동일한 경우
    if (selectedDepartment === user?.user_metadata?.department) {
      toast.info('현재 부서와 동일합니다.');
      return;
    }

    setIsLoading(true);

    try {
      // Supabase user_metadata 업데이트
      const { error } = await supabase.auth.updateUser({
        data: {
          department: selectedDepartment
        }
      });

      if (error) {
        toast.error('부서 변경에 실패했습니다.');
        console.error('Department update error:', error);
      } else {
        toast.success('부서가 성공적으로 변경되었습니다.', {
          description: `변경된 부서: ${selectedDepartment}`,
          icon: <CheckCircle className="h-4 w-4" />,
        });

        // 다이얼로그 닫기
        onOpenChange(false);

        // 페이지 새로고침 (user 정보 업데이트 반영)
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      console.error('Department change error:', err);
      toast.error('예상치 못한 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 다이얼로그 닫을 때 선택값 리셋
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedDepartment(user?.user_metadata?.department || '');
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            부서 변경
          </DialogTitle>
          <DialogDescription>
            소속 부서를 선택해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="department">부서 선택</Label>
            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
              disabled={isLoading}
            >
              <SelectTrigger id="department" className="w-full">
                <SelectValue placeholder="부서를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 현재 부서 표시 */}
          {user?.user_metadata?.department && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                현재 부서: <span className="font-medium text-foreground">
                  {user.user_metadata.department}
                </span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            onClick={handleDepartmentChange}
            disabled={isLoading || !selectedDepartment}
          >
            {isLoading ? '변경 중...' : '부서 변경'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};