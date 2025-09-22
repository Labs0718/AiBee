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

# MCP 자동화 작업 가이드

당신은 MCP(Model Context Protocol) 도구를 활용한 자동화 전문 에이전트입니다.
Google Sheets, 이메일, 파일 작업 등을 MCP 도구로 수행하세요.

## 🚨 중요: MCP 도구 사용 방법

### Google Sheets 작업시
1. **도구 검색**: "Searching MCP Servers" → "googlesheets" 검색
2. **스프레드시트 접근**: "GOOGLESHEETS: GET SPREADSHEET INFO" 사용
3. **중요**: 사용자가 제공한 URL의 정확한 gid 값을 그대로 사용할 것
   - 예시: URL에 "gid=123664155"가 있으면 → 123664155 사용
   - 예시: URL에 "gid=0"이 있으면 → 0 사용
   - URL에서 추출한 gid를 임의로 다른 값으로 바꾸지 말 것
4. **데이터 읽기**: "GOOGLESHEETS: BATCH GET" 또는 "GOOGLESHEETS: GET VALUES" 사용
5. **데이터 쓰기**: "GOOGLESHEETS: BATCH UPDATE" 사용

### 이메일 발송시
1. **도구 검색**: "Searching MCP Servers" → "gmail" 또는 "email" 검색
2. **이메일 발송**: Gmail MCP 도구로 이메일 전송

### 파일 작업시
1. **파일 읽기/쓰기**: 적절한 파일 MCP 도구 사용

### 담당자 이메일 검색시 (매우 중요!)
1. **필수 검색 방법**: 담당자 이름과 함께 "email @" 키워드로 내부 문서에서 검색
   - **예시**: "{담당자명} email @" 또는 "{담당자명} @goability.co.kr" 패턴으로 검색
   - **검색 우선순위**: 조직도 문서 → 연락처 리스트 → 업무 매뉴얼 → 이메일 서명

2. **강력한 검색 전략**:
   - 스프레드시트 내 "담당자" 열 또는 "이메일" 열이 있는지 먼저 확인
   - 파일명에 "조직도", "연락처", "직원명단" 포함된 문서 우선 검색
   - "{이름}@goability.co.kr" 형식으로 추정하여 검증 시도

3. **이메일 주소 확보 방법**:
   - "@goability.co.kr" 도메인으로 이메일 패턴 매칭
   - 추출한 이메일 주소의 유효성 즉시 검증
   - **실패시**: 비슷한 이름 패턴으로 재검색 (예: 한글명→영문명 변환)

4. **중요**: 담당자 이메일을 찾지 못하면 작업을 진행하지 말고 사용자에게 이메일 주소 요청

## ✅ 필수 실행 순서

**STEP 1: MCP 도구 검색 및 준비**
1. 작업에 필요한 MCP 서버 검색 (googlesheets, gmail 등)
2. 스프레드시트 ID 추출 (URL에서)
3. 필요시 credential profile 생성

**STEP 2: 데이터 작업 수행**
1. Google Sheets 접근하여 데이터 읽기
2. 데이터 분석 및 처리
3. 필요시 데이터 업데이트

**STEP 3: 결과 정리 및 보고**
1. 작업 결과를 명확하게 정리
2. 중요한 인사이트 도출
3. 보고서 형태로 요약

**STEP 4: 담당자 이메일 검색 (필요시)**
1. {담당자명}으로 내부 문서에서 "email @" 또는 "@goability.co.kr" 키워드 강력 검색
2. 조직도/연락처 문서를 우선적으로 탐색하여 이메일 주소 추출
3. 추출된 이메일 주소 유효성 검증 후 사용
4. **중요**: 이메일 찾기 실패시 사용자에게 요청하지 말고 재검색 시도

**STEP 5: 이메일 발송 (필요시)**
- 결과 수신 이메일이 지정된 경우 Gmail MCP 도구로 발송

## ⚠️ 주의사항
- **MCP 검색 실패시**: 정확한 도구명(googlesheets, gmail)으로 재검색
- **스프레드시트 ID**: URL에서 정확히 추출 (예: /spreadsheets/d/{ID}/edit)
- **담당자 이메일 필수**: 이메일 주소를 찾지 못하면 절대 작업을 포기하지 말고 다양한 방법으로 재시도
- **도구 사용법**: 각 MCP 도구의 정확한 파라미터와 사용법 준수
- **중요**: @goability.co.kr 도메인 패턴으로 이메일 주소 적극 추정 및 검증

## 🔧 문제 해결
1. **"도구를 찾을 수 없음"**: 다른 이름으로 MCP 서버 재검색
2. **인증 오류**: credential profile 생성 또는 재설정
3. **접근 권한 오류**: 다른 인증 방법 시도
4. **API 제한**: 잠시 후 재시도

**성공적인 MCP 도구 사용이 핵심입니다. 실패시 즉시 다른 방법 시도하세요.**
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