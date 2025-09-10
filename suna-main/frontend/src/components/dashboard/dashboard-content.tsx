'use client';

import React, { useState, Suspense, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChatInput,
  ChatInputHandles,
} from '@/components/thread/chat-input/chat-input';
import {
  BillingError,
  AgentRunLimitError,
} from '@/lib/api';
import { useIsMobile } from '@/hooks/use-mobile';
import { useBillingError } from '@/hooks/useBillingError';
import { BillingErrorAlert } from '@/components/billing/usage-limit-alert';
import { useAccounts } from '@/hooks/use-accounts';
import { config } from '@/lib/config';
import { useInitiateAgentWithInvalidation } from '@/hooks/react-query/dashboard/use-initiate-agent';
import { ModalProviders } from '@/providers/modal-providers';
import { useUserProfile } from '@/hooks/react-query/user/use-user-profile';
import { useAgents } from '@/hooks/react-query/agents/use-agents';
import { cn } from '@/lib/utils';
import { useModal } from '@/hooks/use-modal-store';
import { useAgentSelection } from '@/lib/stores/agent-selection-store';
import { Examples } from './examples';
import { useThreadQuery } from '@/hooks/react-query/threads/use-threads';
import { normalizeFilenameToNFC } from '@/lib/utils/unicode';
import { KortixLogo } from '../sidebar/kortix-logo';
import { AgentRunLimitDialog } from '@/components/thread/agent-run-limit-dialog';
import { useFeatureFlag } from '@/lib/feature-flags';
import { CustomAgentsSection } from './custom-agents-section';
import { toast } from 'sonner';
import { ReleaseBadge } from '../auth/release-badge';
import { createClient } from '@/lib/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const PENDING_PROMPT_KEY = 'pendingAgentPrompt';

export function DashboardContent() {
  const [inputValue, setInputValue] = useState('');
  const [hiddenPrompt, setHiddenPrompt] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [isSimpleMode, setIsSimpleMode] = useState(false);
  const [simpleResponse, setSimpleResponse] = useState<string | null>(null);
  const [showSimpleResponse, setShowSimpleResponse] = useState(false);
  const { 
    selectedAgentId, 
    setSelectedAgent, 
    initializeFromAgents,
    getCurrentAgent
  } = useAgentSelection();
  const [initiatedThreadId, setInitiatedThreadId] = useState<string | null>(null);
  const { billingError, handleBillingError, clearBillingError } =
    useBillingError();
  const [showAgentLimitDialog, setShowAgentLimitDialog] = useState(false);
  const [agentLimitData, setAgentLimitData] = useState<{
    runningCount: number;
    runningThreadIds: string[];
  } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const { data: userProfile } = useUserProfile();
  const templateType = searchParams.get('template');
  const [hasUserModified, setHasUserModified] = useState(false);
  const { data: accounts } = useAccounts();
  const personalAccount = accounts?.find((account) => account.personal_account);
  const chatInputRef = useRef<ChatInputHandles>(null);
  const initiateAgentMutation = useInitiateAgentWithInvalidation();
  const { onOpen } = useModal();

  // Feature flag for custom agents section
  const { enabled: customAgentsEnabled } = useFeatureFlag('custom_agents');

  // Fetch agents to get the selected agent's name
  const { data: agentsResponse } = useAgents({
    limit: 100,
    sort_by: 'name',
    sort_order: 'asc'
  });

  const agents = agentsResponse?.agents || [];
  const selectedAgent = selectedAgentId
    ? agents.find(agent => agent.agent_id === selectedAgentId)
    : null;
  const displayName = selectedAgent?.name || 'AiBee';
  const agentAvatar = undefined;
  const isSunaAgent = selectedAgent?.metadata?.is_suna_default || false;

  const threadQuery = useThreadQuery(initiatedThreadId || '');

  useEffect(() => {
    console.log('🚀 Dashboard effect:', { 
      agentsLength: agents.length, 
      selectedAgentId, 
      agents: agents.map(a => ({ id: a.agent_id, name: a.name, isDefault: a.metadata?.is_suna_default })) 
    });
    
    if (agents.length > 0) {
      console.log('📞 Calling initializeFromAgents');
      initializeFromAgents(agents, undefined, setSelectedAgent);
    }
  }, [agents, initializeFromAgents, setSelectedAgent]);

  useEffect(() => {
    const agentIdFromUrl = searchParams.get('agent_id');
    
    if (agentIdFromUrl && agentIdFromUrl !== selectedAgentId) {
      setSelectedAgent(agentIdFromUrl);
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('agent_id');
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    }
    
    // 템플릿에 따라 미리 텍스트 입력 (사용자가 수정하지 않았을 때만)
    if (templateType === 'annual-leave' && !hasUserModified) {
      const annualLeaveTemplate = `연차 사용일(예: 5월5일) : 
연차사용종류(예: 오전반차, 연차 등) : `;
      if (inputValue !== annualLeaveTemplate) {
        setInputValue(annualLeaveTemplate);
      }
    } else if (templateType === 'resource-booking' && !hasUserModified) {
      const resourceBookingTemplate = `- 예약명(예: AI 커뮤니티 Zoom) : 
- 종일 여부(Ex : 예/아니오) :
- 예약 기간(Ex : 8월28일 ) : N월 N일  NN시 NN분 ~ N월 N일 NN시 NN분
- 자원명(EX : 본사 대회의실, 본사 소회의실, 본사 제안룸1(小), ZOOM계정 사용) : `;
      if (inputValue !== resourceBookingTemplate) {
        setInputValue(resourceBookingTemplate);
      }
    } else if (templateType === null && !hasUserModified && (inputValue.includes('연차 사용일') || inputValue.includes('예약명'))) {
      // 일반 페이지로 돌아갔을 때 템플릿 텍스트 제거 (사용자가 수정하지 않았을 때만)
      setInputValue('');
      setHasUserModified(false);
    }
    
  }, [searchParams, selectedAgentId, router, setSelectedAgent, templateType, inputValue, hasUserModified]);

  // 템플릿 타입이 변경되면 hasUserModified 리셋
  useEffect(() => {
    setHasUserModified(false);
  }, [templateType]);

  useEffect(() => {
    if (threadQuery.data && initiatedThreadId) {
      const thread = threadQuery.data;
      if (thread.project_id) {
        router.push(`/projects/${thread.project_id}/thread/${initiatedThreadId}`);
      } else {
        router.push(`/agents/${initiatedThreadId}`);
      }
      setInitiatedThreadId(null);
    }
  }, [threadQuery.data, initiatedThreadId, router]);

  const handleSimpleModeSubmit = async (
    message: string,
    options?: {
      model_name?: string;
      enable_thinking?: boolean;
      reasoning_effort?: string;
    }
  ) => {
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const supabase = createClient();
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      if (!token) {
        throw new Error('인증이 필요합니다.');
      }

      const response = await fetch(`${backendUrl}/simple-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          model_name: options?.model_name || 'gpt-3.5-turbo',
          enable_thinking: options?.enable_thinking || false,
          reasoning_effort: options?.reasoning_effort || 'low'
        }),
      });

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      const result = await response.json();
      
      // 응답을 상태에 저장하고 모달로 표시
      setSimpleResponse(result.response || result.content || JSON.stringify(result));
      setShowSimpleResponse(true);
      
      // 입력창 초기화
      setInputValue('');
      
    } catch (error: any) {
      console.error('Simple mode error:', error);
      const errorMessage = error instanceof Error ? error.message : '요청 처리 중 오류가 발생했습니다.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (
    message: string,
    options?: {
      model_name?: string;
      enable_thinking?: boolean;
      reasoning_effort?: string;
      stream?: boolean;
      enable_context_manager?: boolean;
    },
  ) => {
    if (
      (!message.trim() && !chatInputRef.current?.getPendingFiles().length) ||
      isSubmitting
    )
      return;

    // 실제 전송될 메시지에 숨겨진 프롬프트 추가
    const actualMessage = hiddenPrompt ? message + hiddenPrompt : message;

    setIsSubmitting(true);

    try {
      const files = chatInputRef.current?.getPendingFiles() || [];
      localStorage.removeItem(PENDING_PROMPT_KEY);

      // hiddenPrompt가 있으면 추가 + 사용자 정보 변수 처리
      let finalMessage = actualMessage;
      if (hiddenPrompt) {
        // 사용자 정보에서 그룹웨어 로그인 정보 추출
        const userEmail = userProfile?.email || '';
        const groupwareId = userEmail.split('@')[0] || 'defaultuser'; // 이메일 @ 앞 부분을 그룹웨어 아이디로 사용
        
        // 그룹웨어 비밀번호 가져오기 (DB 직접 접근)
        let groupwarePassword = '{사용자_패스워드}';
        try {
          const supabase = createClient();
          const { data: user } = await supabase.auth.getUser();
          
          if (user.user) {
            // 백엔드 API를 통해 복호화된 비밀번호 가져오기
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
            const { data: session } = await supabase.auth.getSession();
            const token = session.session?.access_token;
            
            if (!token) {
              console.error('No access token available');
              groupwarePassword = '{사용자_패스워드}';
            } else {
              const response = await fetch(`${backendUrl}/groupware/password`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
            
              if (response.ok) {
                const data = await response.json();
                groupwarePassword = data.password;
              } else {
                console.error('Failed to get groupware password:', response.status, response.statusText);
                console.error('Response:', await response.text());
                // API 실패시에도 변수 형태로 표시
                groupwarePassword = '{사용자_패스워드}';
              }
            }
          }
        } catch (error) {
          console.error('Failed to get groupware password:', error);
          // 오류 발생시에도 변수 형태로 표시
          groupwarePassword = '{사용자_패스워드}';
        }
        
        // hiddenPrompt에서 변수를 실제 값으로 치환
        let processedHiddenPrompt = hiddenPrompt
          .replace(/{사용자_아이디}/g, groupwareId)
          .replace(/{사용자_패스워드}/g, groupwarePassword);
        
        finalMessage = actualMessage + processedHiddenPrompt;
      }

      const formData = new FormData();
      formData.append('prompt', finalMessage);

      // Add selected agent if one is chosen
      if (selectedAgentId) {
        formData.append('agent_id', selectedAgentId);
      }

      files.forEach((file, index) => {
        const normalizedName = normalizeFilenameToNFC(file.name);
        formData.append('files', file, normalizedName);
      });

      if (options?.model_name) formData.append('model_name', options.model_name);
      formData.append('enable_thinking', String(options?.enable_thinking ?? false));
      formData.append('reasoning_effort', options?.reasoning_effort ?? 'low');
      formData.append('stream', String(options?.stream ?? true));
      formData.append('enable_context_manager', String(options?.enable_context_manager ?? false));

      const result = await initiateAgentMutation.mutateAsync(formData);

      if (result.thread_id) {
        setInitiatedThreadId(result.thread_id);
      } else {
        throw new Error('Agent initiation did not return a thread_id.');
      }
      chatInputRef.current?.clearPendingFiles();
    } catch (error: any) {
      console.error('Error during submission process:', error);
      if (error instanceof BillingError) {
        onOpen("paymentRequiredDialog");
      } else if (error instanceof AgentRunLimitError) {
        const { running_thread_ids, running_count } = error.detail;
        setAgentLimitData({
          runningCount: running_count,
          runningThreadIds: running_thread_ids,
        });
        setShowAgentLimitDialog(true);
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Operation failed';
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
      setHiddenPrompt(undefined); // 전송 후 숨겨진 프롬프트 초기화
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const pendingPrompt = localStorage.getItem(PENDING_PROMPT_KEY);

      if (pendingPrompt) {
        setInputValue(pendingPrompt);
        setAutoSubmit(true);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (autoSubmit && inputValue && !isSubmitting) {
      const timer = setTimeout(() => {
        handleSubmit(inputValue);
        setAutoSubmit(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [autoSubmit, inputValue, isSubmitting]);

  return (
    <>
      <ModalProviders />
      <div className="flex flex-col h-screen w-full overflow-hidden">

        <div className={cn(
          "flex flex-col h-full px-4 items-center justify-center",
          customAgentsEnabled ? "pt-16 md:pt-20" : "justify-center"
        )}>
          <div className="w-full max-w-[650px] flex flex-col items-center justify-center space-y-4 md:space-y-6">
            <div className="flex flex-col items-center text-center w-full">
              <p className="tracking-tight text-2xl md:text-3xl font-normal text-muted-foreground/80">
                {isSimpleMode ? '간단한 질문을 해보세요' : '오늘 무엇을 도와드릴까요?'}
              </p>
            </div>
            <div className="w-full relative">
              {/* 단순 모드 토글 버튼 */}
              <button
                onClick={() => setIsSimpleMode(!isSimpleMode)}
                className={`absolute top-2 right-2 z-50 w-10 h-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center text-sm font-bold shadow-lg hover:shadow-xl ${
                  isSimpleMode 
                    ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-600'
                }`}
                title={isSimpleMode ? "고급 모드로 전환 (현재: 단순 모드)" : "단순 모드로 전환 (현재: 고급 모드)"}
              >
                {isSimpleMode ? 'S' : 'A'}
              </button>
              <ChatInput
                ref={chatInputRef}
                onSubmit={isSimpleMode ? handleSimpleModeSubmit : handleSubmit}
                loading={isSubmitting}
                placeholder="어떤 도움이 필요하신지 설명해 주세요..."
                value={inputValue}
                onChange={(value) => {
                  setInputValue(value);
                  setHasUserModified(true);
                }}
                hideAttachments={isSimpleMode}
                selectedAgentId={isSimpleMode ? undefined : selectedAgentId}
                onAgentSelect={isSimpleMode ? undefined : setSelectedAgent}
                enableAdvancedConfig={!isSimpleMode}
                onConfigureAgent={(agentId) => router.push(`/agents/config/${agentId}`)}
                hideAgentSelection={isSimpleMode}
              />
            </div>
            {!isSimpleMode && (
              <div className="w-full">
                <Examples onSelectPrompt={(query, hidden) => {
                  setInputValue(query);
                  setHiddenPrompt(hidden);
                  setHasUserModified(true); // Examples에서 선택했음을 표시
                }} count={isMobile ? 3 : 5} />
              </div>
            )}
          </div>
          
          {/* {customAgentsEnabled && (
            <div className="w-full max-w-none mt-16 mb-8">
              <CustomAgentsSection 
                onAgentSelect={setSelectedAgent}
              />
            </div>
          )} */}
        </div>
        <BillingErrorAlert
          message={billingError?.message}
          currentUsage={billingError?.currentUsage}
          limit={billingError?.limit}
          accountId={personalAccount?.account_id}
          onDismiss={clearBillingError}
          isOpen={!!billingError}
        />
      </div>

      {agentLimitData && (
        <AgentRunLimitDialog
          open={showAgentLimitDialog}
          onOpenChange={setShowAgentLimitDialog}
          runningCount={agentLimitData.runningCount}
          runningThreadIds={agentLimitData.runningThreadIds}
          projectId={undefined}
        />
      )}

      {/* 단순 모드 응답 모달 */}
      <Dialog open={showSimpleResponse} onOpenChange={setShowSimpleResponse}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>AI 응답</DialogTitle>
          </DialogHeader>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">{simpleResponse}</pre>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setShowSimpleResponse(false)}>
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
