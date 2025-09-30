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
  Power,
  PowerOff,
  MoreVertical,
  Loader2,
  Link,
  Mail,
  FileText
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

  // 사용자에게 보이는 깔끔한 프롬프트
  const visiblePrompt = `오늘 날짜는 ${today}입니다.

작업 내용: ${task.task_prompt}

스프레드시트 URL: ${task.sheet_url}`;

  const emailRecipients = task.email_recipients && task.email_recipients.length > 0
    ? `\n\n작업 완료 후 다음 이메일 주소로 결과를 알려주세요: ${task.email_recipients.join(', ')}`
    : '';

  const hiddenPrompt = `

# MCP 자동화 작업 가이드 (v2.0)

당신은 MCP(Model Context Protocol) 도구를 활용한 자동화 전문 에이전트입니다.

## 필수 실행 순서

** 절대로 브라우저도구를 사용하지말고, MCP만 사용해서 스프레드시트에 접근하세요 **
**STEP 1: MCP 도구 검색 및 준비**
- "Searching MCP Servers" → googlesheets/gmail 검색
- 스프레드시트 ID 추출 (URL에서)
- 기준 날짜 명확히 확인 (오늘 날짜를 정확히 파악)

**STEP 2: Google Sheets 데이터 정확한 추출**
- "GOOGLESHEETS: GET SPREADSHEET INFO" 사용하여 시트 목록 확인
- **중요**: URL의 정확한 gid 값 그대로 사용 (임의 변경 금지)
- "GOOGLESHEETS: BATCH GET" 사용하여 실제 데이터 추출
- **반드시 실제 스프레드시트 내용만 사용** - 임시/가상 데이터 생성 절대 금지
- **담당자/PM 필드**: 반드시 스프레드시트에 실제로 기재된 이름만 사용 (임의 생성/추론 금지)

**STEP 3: 데이터 정확성 검증**
- 추출된 데이터의 행/열 수 확인
- 데이터 타입 검증

**STEP 4: 결과 정리 및 메일 발송** (요청 시에만)
- 조직도 시트는 **이메일 주소 찾기 용도로만** 사용
- **메일 발송 대상**: WBS 시트에 실제로 기재된 담당자/PM만 해당
- **절대 금지**: WBS에 없고 조직도에만 있는 사람에게 메일 발송
- 이메일 주소를 찾을 수 없는 경우: 해당 담당자 이름과 함께 "이메일 주소 없음" 명시

## 작업 제한사항
- **절대 금지**: 임시/로그/JSON 파일 생성, 가상 데이터 생성
- **반드시 실행**: 각 단계별 데이터 검증
- **에러 발생시**: 다른 MCP 서버 재시도, 상세한 에러 로그 제공
- **결과 불일치시**: 분석 과정 재검토 및 재실행

## 품질 보증
- 모든 숫자는 두 번 계산하여 검증
- 담당자별 건수는 반드시 원본 데이터와 대조
- **담당자/PM 이름**: 스프레드시트에서 추출한 실제 이름만 사용 (존재하지 않는 이름 절대 금지)
- 최종 결과는 단계별 로그와 함께 제시

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
      return `🔄 매일 ${time}`;
    } else if (type === 'weekly') {
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      return `📅 매주 ${days[parseInt(day)]}요일 ${time}`;
    } else if (type === 'monthly') {
      return `📆 매월 ${day}일 ${time}`;
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
        <DialogContent className="max-w-5xl max-h-[85vh] bg-white border-0 shadow-2xl flex flex-col">
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
                                  <PowerOff className="h-4 w-4 mr-2" />
                                  비활성화
                                </>
                              ) : (
                                <>
                                  <Power className="h-4 w-4 mr-2" />
                                  활성화
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
                      <div className="mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">실행 주기</p>
                            <p className="text-sm font-medium text-gray-900">{formatSchedule(task.schedule_config)}</p>
                          </div>
                        </div>
                      </div>

                      {/* 작업 정보를 깔끔하게 표시 */}
                      <div className="space-y-3">
                        {/* 작업 내용 */}
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs text-blue-700 font-medium mb-1">작업 내용</p>
                              <p className="text-sm text-gray-800 leading-relaxed">
                                {task.task_prompt}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 스프레드시트 링크 */}
                        {task.sheet_url && (
                          <div className="bg-green-50 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <Link className="h-4 w-4 text-green-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs text-green-700 font-medium mb-1">대상 스프레드시트</p>
                                <a
                                  href={task.sheet_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline truncate block"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {task.sheet_url.split('/').find(part => part.includes('spreadsheets')) ?
                                    'Google 스프레드시트' : task.sheet_url}
                                </a>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 이메일 수신자 */}
                        {task.email_recipients && task.email_recipients.length > 0 && (
                          <div className="bg-purple-50 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <Mail className="h-4 w-4 text-purple-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs text-purple-700 font-medium mb-1">결과 수신</p>
                                <div className="flex flex-wrap gap-1">
                                  {task.email_recipients.map((email, idx) => (
                                    <span
                                      key={idx}
                                      className="text-sm bg-white text-gray-700 px-2 py-0.5 rounded-md"
                                    >
                                      {email}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
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