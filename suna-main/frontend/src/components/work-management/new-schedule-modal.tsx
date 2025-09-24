'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Calendar, Clock, Link, FileText, Loader2 } from 'lucide-react';

interface FormData {
  name: string;
  description: string;
  sheet_url: string;
  task_prompt: string;
  schedule_type: string;
  schedule_time: string;
  schedule_day: string;
  email_recipients: string;
}

interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  sheet_url: string;
  task_prompt: string;
  schedule_config: {
    type: string;
    time: string;
    day?: string;
  };
  email_recipients: string[];
  is_active: boolean;
}

interface NewScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask?: ScheduledTask | null;
}

export function NewScheduleModal({ open, onOpenChange, editingTask }: NewScheduleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    sheet_url: '',
    task_prompt: '',
    schedule_type: 'daily',
    schedule_time: '17:00',
    schedule_day: '',
    email_recipients: '',
  });

  // editingTask가 변경될 때 폼 데이터 업데이트
  useEffect(() => {
    if (editingTask) {
      setFormData({
        name: editingTask.name,
        description: editingTask.description || '',
        sheet_url: editingTask.sheet_url,
        task_prompt: editingTask.task_prompt,
        schedule_type: editingTask.schedule_config.type,
        schedule_time: editingTask.schedule_config.time,
        schedule_day: editingTask.schedule_config.day || '',
        email_recipients: editingTask.email_recipients.join(', '),
      });
    } else {
      // 새 작업일 때 초기화
      setFormData({
        name: '',
        description: '',
        sheet_url: '',
        task_prompt: '',
        schedule_type: 'daily',
        schedule_time: '17:00',
        schedule_day: '',
        email_recipients: '',
      });
    }
  }, [editingTask]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Basic validation
      if (!formData.name || !formData.sheet_url || !formData.task_prompt) {
        toast.error('필수 항목을 모두 입력해주세요');
        return;
      }

      const supabase = createClient();
      const { data: session } = await supabase.auth.getSession();

      if (!session.session) {
        toast.error('로그인이 필요합니다');
        return;
      }

      const scheduleData = {
        name: formData.name,
        description: formData.description || '',
        sheet_url: formData.sheet_url,
        task_prompt: formData.task_prompt,
        schedule_config: {
          type: formData.schedule_type,
          time: formData.schedule_time,
          day: formData.schedule_day,
        },
        email_recipients: formData.email_recipients?.split(',').map(email => email.trim()).filter(Boolean) || [],
        is_active: true,
      };

      const isEditing = !!editingTask;
      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/scheduler/scheduled-tasks/${editingTask.id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/scheduler/scheduled-tasks`;

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });

      if (response.ok) {
        toast.success(isEditing ? '자동화 작업이 수정되었습니다' : '자동화 작업이 생성되었습니다');

        if (!isEditing) {
          // 새 작업일 때만 폼 초기화
          setFormData({
            name: '',
            description: '',
            sheet_url: '',
            task_prompt: '',
            schedule_type: 'daily',
            schedule_time: '17:00',
            schedule_day: '',
            email_recipients: '',
          });
        }

        onOpenChange(false);
      } else {
        const error = await response.json();
        toast.error(error.detail || `작업 ${isEditing ? '수정' : '생성'}에 실패했습니다`);
      }
    } catch (error) {
      console.error('Error creating scheduled task:', error);
      toast.error('작업 생성 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {editingTask ? '자동화 작업 수정' : '새 자동화 작업 생성'}
          </DialogTitle>
          <DialogDescription>
            스프레드시트를 정기적으로 모니터링하고 작업을 자동화할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">기본 정보</h3>

            <div className="space-y-2">
              <Label htmlFor="name">작업명 *</Label>
              <Input
                id="name"
                placeholder="예: WBS 마감일 체크"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                placeholder="작업에 대한 간단한 설명을 입력하세요"
                className="resize-none"
                rows={2}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>

          {/* 작업 설정 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              작업 설정
            </h3>

            <div className="space-y-2">
              <Label htmlFor="sheet_url" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                스프레드시트 링크 *
              </Label>
              <Input
                id="sheet_url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={formData.sheet_url}
                onChange={(e) => handleInputChange('sheet_url', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Google Sheets 링크를 입력해주세요
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task_prompt">요청할 작업 *</Label>
              <Textarea
                id="task_prompt"
                placeholder="예: WBS에서 종료일이 내일인 작업들을 찾아서 담당자별로 정리해주세요. 각 작업의 진행상태도 함께 확인해주세요."
                className="resize-none"
                rows={4}
                maxLength={500}
                value={formData.task_prompt}
                onChange={(e) => handleInputChange('task_prompt', e.target.value)}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>에이전트가 수행할 작업을 구체적으로 설명해주세요</span>
                <span className={formData.task_prompt.length > 450 ? 'text-orange-500' : ''}>
                  {formData.task_prompt.length}/500자
                </span>
              </div>
            </div>
          </div>

          {/* 스케줄 설정 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              스케줄 설정
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule_type">실행 주기 *</Label>
                <Select onValueChange={(value) => handleInputChange('schedule_type', value)} value={formData.schedule_type}>
                  <SelectTrigger>
                    <SelectValue placeholder="주기 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">매일</SelectItem>
                    <SelectItem value="weekly">매주</SelectItem>
                    <SelectItem value="monthly">매월</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule_time">실행 시간 *</Label>
                <Input
                  id="schedule_time"
                  type="time"
                  value={formData.schedule_time}
                  onChange={(e) => handleInputChange('schedule_time', e.target.value)}
                />
              </div>
            </div>

            {(formData.schedule_type === 'weekly' || formData.schedule_type === 'monthly') && (
              <div className="space-y-2">
                <Label htmlFor="schedule_day">
                  {formData.schedule_type === 'weekly' ? '요일' : '날짜'}
                </Label>
                <Select onValueChange={(value) => handleInputChange('schedule_day', value)} value={formData.schedule_day}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      formData.schedule_type === 'weekly' ? '요일 선택' : '날짜 선택'
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.schedule_type === 'weekly' ? (
                      <>
                        <SelectItem value="0">일요일</SelectItem>
                        <SelectItem value="1">월요일</SelectItem>
                        <SelectItem value="2">화요일</SelectItem>
                        <SelectItem value="3">수요일</SelectItem>
                        <SelectItem value="4">목요일</SelectItem>
                        <SelectItem value="5">금요일</SelectItem>
                        <SelectItem value="6">토요일</SelectItem>
                      </>
                    ) : (
                      Array.from({ length: 31 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}일
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* 알림 설정 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">알림 설정</h3>

            <div className="space-y-2">
              <Label htmlFor="email_recipients">결과 수신 이메일</Label>
              <Input
                id="email_recipients"
                placeholder="email1@company.com, email2@company.com"
                value={formData.email_recipients}
                onChange={(e) => handleInputChange('email_recipients', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                작업 결과를 받을 이메일 주소들을 콤마(,)로 구분하여 입력하세요.
                비워두면 본인 이메일로 발송됩니다.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingTask ? '수정' : '생성'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}