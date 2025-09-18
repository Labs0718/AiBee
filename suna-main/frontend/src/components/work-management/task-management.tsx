'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar,
  Clock,
  Edit,
  Trash2,
  Play,
  Pause,
  MoreVertical,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { NewScheduleModal } from './new-schedule-modal';

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
  created_at: string;
  last_run_at: string | null;
  next_run_at: string | null;
  run_count: number;
}

interface TaskManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const createFullPrompt = (task: ScheduledTask): string => {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const visiblePrompt = `링크: ${task.sheet_url}

요청할 작업: 오늘 날짜는 ${today}이고, ${task.task_prompt} 링크는 ${task.sheet_url}이다.`;

  const emailRecipients = task.email_recipients && task.email_recipients.length > 0
    ? `\n\n결과 수신 이메일: ${task.email_recipients.join(', ')}`
    : '';

  const hiddenPrompt = `

# MCP 자동화 작업 가이드

당신은 MCP 도구를 활용한 자동화 전문 에이전트입니다.
사용자가 제공한 작업 요청을 바탕으로 MCP 도구들을 사용하여 자동화를 수행하세요.

## 필수 실행 순서

**STEP 1: 작업 분석**
1. 사용자 요청 내용 파악
2. 필요한 MCP 도구 식별
3. 작업 순서 계획 수립

**STEP 2: MCP 도구 실행**
1. 적절한 MCP 도구 선택하여 실행
2. 도구 실행 결과 확인
3. 필요시 추가 도구 연계 실행

**STEP 3: 결과 정리**
1. 수행한 작업의 상세 내역
2. 결과 데이터 정리 및 요약
3. 추가 권장 사항 (있는 경우)

**STEP 4: 이메일 발송 (필요시)**
작업 완료 후 다음 규칙에 따라 이메일을 발송하세요:

### 상황 1: 결과 수신 이메일이 지정된 경우
- 작업 결과를 정리하여 보고서 형태로 작성
- 지정된 이메일 주소로 보고서 발송
- 작업 내용과 결과를 상세하고 명확하게 정리하여 전달

## 주의사항
- MCP 도구 사용 시 정확한 파라미터 전달
- 작업 완료 후 변경사항 명확히 보고
- 오류 발생 시 적절한 대안 제시
- 이메일 발송 실패 시 재시도 또는 대체 방안 제시

## 오류 처리
- MCP 도구 실행 오류 시 해결 방법 안내
- 네트워크 오류 시 재시도 절차 안내
- 이메일 발송 실패 시 재시도 또는 대체 방안 제시
`;

  return visiblePrompt + emailRecipients + hiddenPrompt;
};

export function TaskManagement({ open, onOpenChange }: TaskManagementProps) {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);


  useEffect(() => {
    if (open) {
      fetchTasks();
    }
  }, [open]);

  const fetchTasks = async () => {
    try {
      const supabase = createClient();
      const { data: session } = await supabase.auth.getSession();

      if (!session.session) {
        toast.error('로그인이 필요합니다');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/scheduler/scheduled-tasks`,
        {
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const tasksData = await response.json();
        setTasks(tasksData);
      } else {
        toast.error('작업 목록을 불러오는데 실패했습니다');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('작업 목록을 불러오는 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task: ScheduledTask) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleToggleActive = async (task: ScheduledTask) => {
    try {
      const supabase = createClient();
      const { data: session } = await supabase.auth.getSession();

      if (!session.session) {
        toast.error('로그인이 필요합니다');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/scheduler/scheduled-tasks/${task.id}/toggle`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast.success(`작업을 ${result.is_active ? '활성화' : '비활성화'}했습니다`);
        fetchTasks(); // 목록 새로고침
      } else {
        toast.error('작업 상태 변경에 실패했습니다');
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      toast.error('작업 상태 변경 중 오류가 발생했습니다');
    }
  };

  const handleDeleteTask = async (task: ScheduledTask) => {
    if (!confirm(`"${task.name}" 작업을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const supabase = createClient();
      const { data: session } = await supabase.auth.getSession();

      if (!session.session) {
        toast.error('로그인이 필요합니다');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/scheduler/scheduled-tasks/${task.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        toast.success('작업을 삭제했습니다');
        fetchTasks(); // 목록 새로고침
      } else {
        toast.error('작업 삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('작업 삭제 중 오류가 발생했습니다');
    }
  };

  const handleRunNow = async (task: ScheduledTask) => {
    try {
      const supabase = createClient();
      const { data: session } = await supabase.auth.getSession();

      if (!session.session) {
        toast.error('로그인이 필요합니다');
        return;
      }

      // 1. 새 스레드 생성
      const threadResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/threads`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            name: `MCP 자동화: ${task.name}`
          }),
        }
      );

      if (!threadResponse.ok) {
        toast.error('채팅방 생성에 실패했습니다');
        return;
      }

      const threadData = await threadResponse.json();
      const threadId = threadData.thread_id;

      // 2. 기존 채팅 페이지로 이동하면서 자동 전송할 질문을 전달
      const fullPrompt = createFullPrompt(task);
      const encodedPrompt = encodeURIComponent(fullPrompt);

      if (threadData.project_id) {
        window.location.href = `/projects/${threadData.project_id}/thread/${threadId}?autoSend=${encodedPrompt}`;
      } else {
        window.location.href = '/dashboard';
      }

      toast.success('새 채팅방으로 이동하여 자동으로 질문을 전송합니다');

    } catch (error) {
      console.error('Error running task:', error);
      toast.error('작업 실행 중 오류가 발생했습니다');
    }
  };

  const formatSchedule = (schedule_config: any) => {
    const { type, time, day } = schedule_config;

    if (type === 'daily') {
      return `매일 ${time}`;
    } else if (type === 'weekly') {
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      return `매주 ${days[parseInt(day)]}요일 ${time}`;
    } else if (type === 'monthly') {
      return `매월 ${day}일 ${time}`;
    }

    return '알 수 없음';
  };

  const formatLastRun = (lastRun: string | null) => {
    if (!lastRun) return '실행 기록 없음';

    try {
      return new Date(lastRun).toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '날짜 오류';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden bg-white border-0 shadow-2xl">
          <DialogHeader className="border-b pb-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    작업 관리
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-600 mt-1">
                    자동화 작업을 생성하고 관리할 수 있습니다.
                  </DialogDescription>
                </div>
              </div>
              <Button
                onClick={() => setShowEditModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                새 작업 생성
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="text-gray-600">작업 목록을 불러오는 중...</span>
                </div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-medium mb-2">아직 생성된 작업이 없습니다</p>
                <p className="text-gray-500 text-sm mb-6">새 작업 생성 버튼을 클릭하여 첫 번째 자동화 작업을 만들어보세요</p>
                <Button
                  onClick={() => setShowEditModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  첫 작업 생성하기
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <Card
                    key={task.id}
                    className="border-0 shadow-sm hover:shadow-lg transition-all duration-200 bg-white rounded-xl"
                  >
                    <CardHeader className="pb-4 px-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 cursor-pointer" onClick={() => handleEditTask(task)}>
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg font-semibold text-gray-900">
                              {task.name}
                            </CardTitle>
                            <Badge
                              variant={task.is_active ? "default" : "secondary"}
                              className={task.is_active
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                              }
                            >
                              {task.is_active ? '활성' : '비활성'}
                            </Badge>
                          </div>
                          {task.description && (
                            <CardDescription className="text-gray-600 text-sm">
                              {task.description}
                            </CardDescription>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-gray-100 rounded-lg">
                              <MoreVertical className="h-4 w-4 text-gray-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border shadow-lg rounded-lg">
                            <DropdownMenuItem onClick={() => handleEditTask(task)}>
                              <Edit className="h-4 w-4 mr-2" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(task)}>
                              {task.is_active ? (
                                <>
                                  <Pause className="h-4 w-4 mr-2" />
                                  일시정지
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  재시작
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRunNow(task)}
                              className="text-blue-600 focus:text-blue-700 focus:bg-blue-50"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              지금 실행
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTask(task)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <CardContent
                      className="px-6 pb-6 cursor-pointer"
                      onClick={() => handleEditTask(task)}
                    >
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">실행 주기</p>
                            <p className="text-sm font-medium text-gray-900">{formatSchedule(task.schedule_config)}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">실행 회수</p>
                          <p className="text-sm font-medium text-gray-900">{task.run_count}회</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">마지막 실행</p>
                          <p className="text-sm font-medium text-gray-900">{formatLastRun(task.last_run_at)}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">작업 내용</p>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {task.task_prompt}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 수정 모달 */}
      <NewScheduleModal
        open={showEditModal}
        onOpenChange={(open) => {
          setShowEditModal(open);
          if (!open) {
            setEditingTask(null);
            fetchTasks(); // 수정 후 목록 새로고침
          }
        }}
        editingTask={editingTask}
      />
    </>
  );
}