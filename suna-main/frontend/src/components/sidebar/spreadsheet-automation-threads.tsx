'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { ChevronRight, MessageSquare, FolderOpen, Settings } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { TaskManagement } from '@/components/work-management/task-management';

interface AutomationThread {
  thread_id: string;
  created_at: string;
  metadata: {
    task_name: string;
    execution_date: string;
    folder_structure: {
      main_folder: string;
      task_folder: string;
      date_folder: string;
    };
  };
}

interface DateFolder {
  date: string;
  threads: AutomationThread[];
}

interface TaskFolder {
  taskName: string;
  dateFolders: DateFolder[];
}

export function SpreadsheetAutomationThreads() {
  const [taskFolders, setTaskFolders] = useState<TaskFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskManagement, setShowTaskManagement] = useState(false);
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchAutomationThreads();
  }, []);

  const fetchAutomationThreads = async () => {
    try {
      const supabase = createClient();
      const { data: session } = await supabase.auth.getSession();

      if (!session.session) return;

      // 스프레드시트 자동화 채팅방들 조회
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/threads`,
        {
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const responseData = await response.json();

        // API 응답에서 threads 배열 추출
        const allThreads = responseData.threads || [];

        // 스프레드시트 자동화 카테고리만 필터링
        const automationThreads: AutomationThread[] = allThreads.filter(
          (thread: any) => thread.metadata?.category === 'spreadsheet_automation'
        );

        // 작업별 -> 날짜별로 그룹화
        const grouped = automationThreads.reduce((acc, thread) => {
          const taskName = thread.metadata?.task_name || '알 수 없는 작업';
          const executionDate = thread.metadata?.execution_date || '미상';

          // 1. 작업 폴더 찾기/생성
          let taskFolder = acc.find(folder => folder.taskName === taskName);
          if (!taskFolder) {
            taskFolder = {
              taskName,
              dateFolders: []
            };
            acc.push(taskFolder);
          }

          // 2. 날짜 폴더 찾기/생성
          let dateFolder = taskFolder.dateFolders.find(df => df.date === executionDate);
          if (!dateFolder) {
            dateFolder = {
              date: executionDate,
              threads: []
            };
            taskFolder.dateFolders.push(dateFolder);
          }

          dateFolder.threads.push(thread);

          return acc;
        }, [] as TaskFolder[]);

        // 정렬: 날짜별 폴더는 최신순, 각 폴더 내 스레드도 최신순
        grouped.forEach(taskFolder => {
          taskFolder.dateFolders.sort((a, b) => b.date.localeCompare(a.date));
          taskFolder.dateFolders.forEach(dateFolder => {
            dateFolder.threads.sort((a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
          });
        });

        setTaskFolders(grouped);
      }
    } catch (error) {
      console.error('Error fetching automation threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThreadClick = (threadId: string) => {
    router.push(`/threads/${threadId}`);
    if (isMobile) setOpenMobile(false);
  };

  const handleManageAutomation = () => {
    // 자동화 관리 모달 열기
    setShowTaskManagement(true);
    if (isMobile) setOpenMobile(false);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (createdAt: string) => {
    try {
      const date = new Date(createdAt);
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '시간 미상';
    }
  };

  if (loading) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton className="cursor-default">
          <div className="text-xs text-muted-foreground">로딩 중...</div>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  return (
    <>
      {/* 자동화 관리 버튼 */}
      <SidebarMenuSubItem>
        <SidebarMenuSubButton onClick={handleManageAutomation} className="w-full justify-start touch-manipulation">
          <Settings className="h-4 w-4 text-blue-500" />
          <span className="text-sm">작업 관리</span>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>

      {taskFolders.length > 0 && (
        taskFolders.map((taskFolder) => {
          const totalThreads = taskFolder.dateFolders.reduce((sum, df) => sum + df.threads.length, 0);

          return (
            <SidebarMenuSubItem key={taskFolder.taskName}>
              <Collapsible defaultOpen={totalThreads <= 5}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuSubButton className="w-full justify-between touch-manipulation">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{taskFolder.taskName}</span>
                      <span className="text-xs text-muted-foreground">
                        ({totalThreads})
                      </span>
                    </div>
                    <ChevronRight className="h-3 w-3 transition-transform duration-200 data-[state=open]:rotate-90" />
                  </SidebarMenuSubButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-4 space-y-1">
                    {taskFolder.dateFolders.map((dateFolder) => (
                      <div key={dateFolder.date}>
                        <Collapsible defaultOpen={dateFolder.threads.length <= 3}>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuSubButton className="w-full justify-between touch-manipulation">
                              <div className="flex items-center gap-2">
                                <FolderOpen className="h-3 w-3 text-orange-500" />
                                <span className="text-xs">{formatDate(dateFolder.date)}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({dateFolder.threads.length})
                                </span>
                              </div>
                              <ChevronRight className="h-2 w-2 transition-transform duration-200 data-[state=open]:rotate-90" />
                            </SidebarMenuSubButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="ml-4 space-y-1">
                              {dateFolder.threads.map((thread) => (
                                <SidebarMenuSubButton
                                  key={thread.thread_id}
                                  onClick={() => handleThreadClick(thread.thread_id)}
                                  className="w-full justify-start text-xs touch-manipulation hover:bg-accent"
                                >
                                  <MessageSquare className="h-3 w-3 flex-shrink-0 text-blue-500" />
                                  <span className="truncate text-xs">
                                    {formatTime(thread.created_at)}
                                  </span>
                                </SidebarMenuSubButton>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuSubItem>
          );
        })
      )}

      {/* 자동화 관리 모달 */}
      <TaskManagement
        open={showTaskManagement}
        onOpenChange={(open) => {
          setShowTaskManagement(open);
          if (!open) {
            // 모달 닫힐 때 목록 새로고침
            fetchAutomationThreads();
          }
        }}
      />
    </>
  );
}