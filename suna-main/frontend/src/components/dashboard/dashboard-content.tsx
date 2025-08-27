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

const PENDING_PROMPT_KEY = 'pendingAgentPrompt';

export function DashboardContent() {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [currentPreset, setCurrentPreset] = useState<string | null>(null);
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
    const preset = searchParams.get('preset');
    
    if (agentIdFromUrl && agentIdFromUrl !== selectedAgentId) {
      setSelectedAgent(agentIdFromUrl);
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('agent_id');
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    }
    
    // Handle preset templates
    if (preset === 'vacation-automation') {
      setCurrentPreset('vacation-automation');
      setInputValue(`연차사용일(예: 8월 5일~8월6일 또는 8월6일만): 
연차사용종류(예: 오전반차, 연차 등): 
 `);
      
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('preset');
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    } else if (preset === 'expense-automation') {
      setCurrentPreset('expense-automation');
      // For expense automation, just clear the input as it's an empty chat
      setInputValue('');
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('preset');
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    }
  }, [searchParams, selectedAgentId, router, setSelectedAgent]);

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

    setIsSubmitting(true);

    try {
      const files = chatInputRef.current?.getPendingFiles() || [];
      localStorage.removeItem(PENDING_PROMPT_KEY);

      const formData = new FormData();
      
      // For vacation automation, append display prompt and hidden prompt separately
      if (currentPreset === 'vacation-automation' && message.includes('연차사용일:')) {
        // Append the user's visible input as 'display_prompt'
        formData.append('display_prompt', message);
        
        // Append the full prompt (with hidden instructions) as 'prompt'
        const hiddenPrompt = `

아래는 작업메뉴얼 입니다.

1. https://gw.goability.co.kr/gw/uat/uia/egovLoginUsr.do 해당 사이트에 들어가서 로그인 아이디 : ejlee01 패스워드 : sxr932672@ 로그인 완료된 화면에서 사용자 명 확인 후, https://gw.goability.co.kr/attend/Views/Common/pop/eaPop.do?processId=ATTProc18&form_id=18&form_tp=ATTProc18&doc_width=900 해당 링크 접속

2. 처음에 창 열리면 "결재 특이사항" 창때문에 내용이 안보이니까 꺽쇠? 클릭해서 닫아줘. "제목"입력칸이 보이도록 잘 닫아졌는지 "꼭" 확인후 다음단계 진행해.

3. “제목”： 연차 휴가 신청합니다. 입력

4. “일정등록” 옆에 “선택” 드롭다운 클릭 > 2번 단계에서 확인한 사용자명에 맞게 "개인캘린더.사용자명" 클릭

5. "근태구분" 오른쪽에 "선택" 드롭다운 클릭 > 사용자가 요청한 거에 맞춰서 알맞는 구분 클릭

6. "신청일자": 사용자가 요청한 날짜로 설정해야함. 
 - 신정일자 선택방법 : 
   예) 2025-08-25  랑 2025-08-25 이런식으로 있을건데,  각 날짜 오른쪽에 보면 "달력아이콘"이있음. 달력아이콘 **클릭**
	각각 알맞는 날짜로 선택하기 : 첫번째 날짜는 연차 시작날짜고, 두번째 날짜는 연차 종료 날짜임.
 	**너가 가끔 실수로 8월인데 7월 날짜로 선택할 때 있음. 사용자가 말한  월, 일자가 맞는지 한번 더 확인한 뒤 적용필수. **

 * 8월5일 오전 반차일 경우: 08월05일,08월05일로 선택
 * 8월5일 연차일 경우: 08월5일,08월05일로 선택
 * 8월5일, 8월6일 연차일 경우: 08월05일, 08월06일로 선택

7. "비고" 오른쪽 빈 칸에 "개인사유" 입력

8. "내역추가" 버튼 클릭
 - 내역추가 버튼 클릭 잘안되니까: 아래 구조 참고해서 "내역추가" 버튼 클릭 시도해서 아래 표 새로 생성되는지 확인해야함.
<button style="height:75px;width:75px;line-height:18px;" onclick="javascript:addAnnualLeave()" data-role="button" class="k-button" role="button" aria-disabled="false" tabindex="0">…</button>

9. "결재상신" 클릭

10. 오른쪽 위에 "상신" 버튼 클릭

10-1. 이후 갑자기 브라우저 에러가 나면, 중단하지말고 새로 다시 연결해서 로그인부터 시도하고, 아래 단계 이어서 계속 진행. 무조건 모든 단계를 마무리지어야함.

11. https://gw.goability.co.kr/gw/userMain.do 접속

12. 상단에 "전자결재" 클릭

13. 좌측에 "결재문서" 클릭

14. 열린 상신함... 미결함.. 전결함.... 등등 중에서  "미결함" 클릭

15. 제목에 "연차 휴가 신청합니다." 우리가 작성한 문서임 : "연차 휴가 신청합니다." 클릭

16. "휴가 (취소) 신청서" 열렸는지 확인

17. 스크롤 내려서 "사용 신청" 오른쪽에 "체크박스" 클릭

18. 상단에 결재... 내용수정.... 결재라인수정 ...있는데 "결재" 클릭

19. 입력 다 했으면 상단에 "결재"클릭

20. "승인" 클릭
`;
        formData.append('prompt', message + hiddenPrompt);
        setCurrentPreset(null); // Reset preset after use
      } else {
        // For normal messages, just append the prompt
        formData.append('prompt', message);
      }

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

        {customAgentsEnabled && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 md:top-20 w-full max-w-[calc(100vw-2rem)] flex justify-center">
            <ReleaseBadge text="Custom Agents, Playbooks, and more!" link="/agents?tab=my-agents" />
          </div>
        )}
        <div className={cn(
          "flex flex-col h-full px-4 items-center justify-center",
          customAgentsEnabled ? "pt-16 md:pt-20" : "justify-center"
        )}>
          <div className="w-full max-w-[650px] flex flex-col items-center justify-center space-y-4 md:space-y-6">
            <div className="flex flex-col items-center text-center w-full">
              <p className="tracking-tight text-2xl md:text-3xl font-normal text-muted-foreground/80">
                What would you like to do today?
              </p>
            </div>
            <div className="w-full">
              <ChatInput
                ref={chatInputRef}
                onSubmit={handleSubmit}
                loading={isSubmitting}
                placeholder="Describe what you need help with..."
                value={inputValue}
                onChange={setInputValue}
                hideAttachments={false}
                selectedAgentId={selectedAgentId}
                onAgentSelect={setSelectedAgent}
                enableAdvancedConfig={true}
                onConfigureAgent={(agentId) => router.push(`/agents/config/${agentId}`)}
              />
            </div>
            <div className="w-full">
              <Examples onSelectPrompt={setInputValue} count={isMobile ? 3 : 4} />
            </div>
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
    </>
  );
}
