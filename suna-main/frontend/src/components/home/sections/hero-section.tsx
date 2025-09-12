'use client';
import { HeroVideoSection } from '@/components/home/sections/hero-video-section';
import { siteConfig } from '@/lib/home';
import { ArrowRight, Github, X, AlertCircle, Square } from 'lucide-react';
import { FlickeringGrid } from '@/components/home/ui/flickering-grid';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useState, useEffect, useRef, FormEvent } from 'react';
import { useScroll } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  BillingError,
  AgentRunLimitError,
} from '@/lib/api';
import { useInitiateAgentMutation } from '@/hooks/react-query/dashboard/use-initiate-agent';
import { useThreadQuery } from '@/hooks/react-query/threads/use-threads';
import { generateThreadName } from '@/lib/actions/threads';
import GoogleSignIn from '@/components/GoogleSignIn';
import { useAgents } from '@/hooks/react-query/agents/use-agents';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from '@/components/ui/dialog';
import { BillingErrorAlert } from '@/components/billing/usage-limit-alert';
import { useBillingError } from '@/hooks/useBillingError';
import { useAccounts } from '@/hooks/use-accounts';
import { isLocalMode, config } from '@/lib/config';
import { toast } from 'sonner';
import { useModal } from '@/hooks/use-modal-store';
import GitHubSignIn from '@/components/GithubSignIn';
import { ChatInput, ChatInputHandles } from '@/components/thread/chat-input/chat-input';
import { normalizeFilenameToNFC } from '@/lib/utils/unicode';
import { createQueryHook } from '@/hooks/use-query';
import { agentKeys } from '@/hooks/react-query/agents/keys';
import { getAgents } from '@/hooks/react-query/agents/utils';
import { AgentRunLimitDialog } from '@/components/thread/agent-run-limit-dialog';
import { Examples } from '@/components/dashboard/examples';

// Custom dialog overlay with blur effect
const BlurredDialogOverlay = () => (
  <DialogOverlay className="bg-background/40 backdrop-blur-md" />
);

// Constant for localStorage key to ensure consistency
const PENDING_PROMPT_KEY = 'pendingAgentPrompt';



export function HeroSection() {
  const { hero } = siteConfig;
  const tablet = useMediaQuery('(max-width: 1024px)');
  const [mounted, setMounted] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const { scrollY } = useScroll();
  const [inputValue, setInputValue] = useState('');
  const [hiddenPrompt, setHiddenPrompt] = useState<string | undefined>(undefined);
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { billingError, handleBillingError, clearBillingError } =
    useBillingError();
  const { data: accounts } = useAccounts();
  const personalAccount = accounts?.find((account) => account.personal_account);
  const { onOpen } = useModal();
  const initiateAgentMutation = useInitiateAgentMutation();
  const [initiatedThreadId, setInitiatedThreadId] = useState<string | null>(null);
  const threadQuery = useThreadQuery(initiatedThreadId || '');
  const chatInputRef = useRef<ChatInputHandles>(null);
  const [showAgentLimitDialog, setShowAgentLimitDialog] = useState(false);
  const [agentLimitData, setAgentLimitData] = useState<{
    runningCount: number;
    runningThreadIds: string[];
  } | null>(null);

  // Fetch agents for selection
  const { data: agentsResponse } = createQueryHook(
    agentKeys.list({
      limit: 100,
      sort_by: 'name',
      sort_order: 'asc'
    }),
    () => getAgents({
      limit: 100,
      sort_by: 'name',
      sort_order: 'asc'
    }),
    {
      enabled: !!user && !isLoading,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    }
  )();

  const agents = agentsResponse?.agents || [];

  // Auth dialog state
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect when scrolling is active to reduce animation complexity
  useEffect(() => {
    const unsubscribe = scrollY.on('change', () => {
      setIsScrolling(true);

      // Clear any existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Set a new timeout
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 300); // Wait 300ms after scroll stops
    });

    return () => {
      unsubscribe();
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [scrollY]);

  useEffect(() => {
    if (authDialogOpen && inputValue.trim()) {
      localStorage.setItem(PENDING_PROMPT_KEY, inputValue.trim());
    }
  }, [authDialogOpen, inputValue]);

  useEffect(() => {
    if (authDialogOpen && user && !isLoading) {
      setAuthDialogOpen(false);
      router.push('/dashboard');
    }
  }, [user, isLoading, authDialogOpen, router]);

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

  // Handle ChatInput submission
  const handleChatInputSubmit = async (
    message: string,
    options?: { model_name?: string; enable_thinking?: boolean }
  ) => {
    if ((!message.trim() && !chatInputRef.current?.getPendingFiles().length) || isSubmitting) return;

    // 실제 전송될 메시지에 숨겨진 프롬프트 추가
    const actualMessage = hiddenPrompt ? message + hiddenPrompt : message;

    // If user is not logged in, save prompt and show auth dialog
    if (!user && !isLoading) {
      localStorage.setItem(PENDING_PROMPT_KEY, actualMessage.trim());
      setAuthDialogOpen(true);
      return;
    }

    // User is logged in, create the agent with files like dashboard does
    setIsSubmitting(true);
    try {
      const files = chatInputRef.current?.getPendingFiles() || [];
      localStorage.removeItem(PENDING_PROMPT_KEY);

      const formData = new FormData();
      formData.append('prompt', actualMessage);

      // Add selected agent if one is chosen
      if (selectedAgentId) {
        formData.append('agent_id', selectedAgentId);
      }

      // Add files if any
      files.forEach((file) => {
        const normalizedName = normalizeFilenameToNFC(file.name);
        formData.append('files', file, normalizedName);
      });

      if (options?.model_name) formData.append('model_name', options.model_name);
      formData.append('enable_thinking', String(options?.enable_thinking ?? false));
      formData.append('reasoning_effort', 'low');
      formData.append('stream', 'true');
      formData.append('enable_context_manager', 'false');

      const result = await initiateAgentMutation.mutateAsync(formData);

      if (result.thread_id) {
        setInitiatedThreadId(result.thread_id);
      } else {
        throw new Error('Agent initiation did not return a thread_id.');
      }

      chatInputRef.current?.clearPendingFiles();
      setInputValue('');
    } catch (error: any) {
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
        const isConnectionError =
          error instanceof TypeError &&
          error.message.includes('Failed to fetch');
        if (!isLocalMode() || isConnectionError) {
          toast.error(
            error.message || 'Failed to create agent. Please try again.',
          );
        }
      }
    } finally {
      setIsSubmitting(false);
      setHiddenPrompt(undefined); // 전송 후 숨겨진 프롬프트 초기화
    }
  };

  return (
    <section id="hero" className="w-full relative overflow-hidden bg-white">
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-white to-blue-100/30 -z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/20 via-transparent to-blue-50/30 -z-10"></div>
      <div className="relative flex flex-col items-center w-full px-4 sm:px-6">
        {/* Left side flickering grid with gradient fades */}
        <div className="hidden sm:block absolute left-0 top-0 h-[500px] sm:h-[600px] md:h-[800px] w-1/4 sm:w-1/3 -z-10 overflow-hidden">
          {/* Horizontal fade from left to right */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background z-10" />

          {/* Vertical fade from top */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background via-background/90 to-transparent z-10" />

          {/* Vertical fade to bottom */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/90 to-transparent z-10" />

          {mounted && (
            <FlickeringGrid
              className="h-full w-full"
              squareSize={tablet ? 2 : 2.5}
              gridGap={tablet ? 2 : 2.5}
              color="var(--secondary)"
              maxOpacity={tablet ? 0.2 : 0.4}
              flickerChance={isScrolling ? 0.005 : (tablet ? 0.015 : 0.03)} // Lower performance impact on mobile
            />
          )}
        </div>

        {/* Right side flickering grid with gradient fades */}
        <div className="hidden sm:block absolute right-0 top-0 h-[500px] sm:h-[600px] md:h-[800px] w-1/4 sm:w-1/3 -z-10 overflow-hidden">
          {/* Horizontal fade from right to left */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-background z-10" />

          {/* Vertical fade from top */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background via-background/90 to-transparent z-10" />

          {/* Vertical fade to bottom */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/90 to-transparent z-10" />

          {mounted && (
            <FlickeringGrid
              className="h-full w-full"
              squareSize={tablet ? 2 : 2.5}
              gridGap={tablet ? 2 : 2.5}
              color="var(--secondary)"
              maxOpacity={tablet ? 0.2 : 0.4}
              flickerChance={isScrolling ? 0.005 : (tablet ? 0.015 : 0.03)} // Lower performance impact on mobile
            />
          )}
        </div>

        {/* Center content background with rounded bottom */}
        <div className="absolute inset-x-0 sm:inset-x-1/6 md:inset-x-1/4 top-0 h-[500px] sm:h-[600px] md:h-[800px] -z-20 bg-background rounded-b-xl"></div>

        <div className="relative z-10 pt-16 sm:pt-24 md:pt-32 mx-auto h-full w-full max-w-6xl flex flex-col items-center justify-center">
          {/* <p className="border border-border bg-accent rounded-full text-sm h-8 px-3 flex items-center gap-2">
            {hero.badgeIcon}
            {hero.badge}
          </p> */}

          {/* <Link
            href={hero.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group border border-border/50 bg-background hover:bg-accent/20 hover:border-secondary/40 rounded-full text-sm h-8 px-3 flex items-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 hover:-translate-y-0.5"
          >
            {hero.badgeIcon}
            <span className="font-medium text-muted-foreground text-xs tracking-wide group-hover:text-primary transition-colors duration-300">
              {hero.badge}
            </span>
            <span className="inline-flex items-center justify-center size-3.5 rounded-full bg-muted/30 group-hover:bg-secondary/30 transition-colors duration-300">
              <svg
                width="8"
                height="8"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-muted-foreground group-hover:text-primary"
              >
                <path
                  d="M7 17L17 7M17 7H8M17 7V16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link> */}
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 pt-8 sm:pt-12 max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium tracking-tighter text-balance text-center px-2">
              <span className="text-primary">AiBee Agent는</span>
              <span className="text-secondary"> 이런 기능을 제공합니다</span>
            </h1>
            <h2 className="text-lg md:text-xl lg:text-2xl text-center text-gray-600 font-medium px-2 mt-2">
              기업과 공공을 위한 AI 기반 업무 자동화 솔루션
            </h2>
            <p className="text-base md:text-lg text-center text-muted-foreground font-medium text-balance leading-relaxed tracking-tight max-w-2xl px-2">
            복잡한 업무를 간단하게, AI 에이전트가 자동으로 처리합니다
            </p>
          </div>

          <div className="flex flex-col items-center w-full max-w-3xl mx-auto gap-2 flex-wrap justify-center px-2 sm:px-0">
            <div className="w-full relative">
              <div className="relative z-10">
                <ChatInput
                  ref={chatInputRef}
                  onSubmit={handleChatInputSubmit}
                  placeholder="만들고 싶은 에이전트나 완료하고 싶은 작업을 설명해주세요..."
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  value={inputValue}
                  onChange={setInputValue}
                  isLoggedIn={!!user}
                  selectedAgentId={selectedAgentId}
                  onAgentSelect={setSelectedAgentId}
                  autoFocus={false}
                />
              </div>
              {/* Watercolor-like blue glow effects */}
              {/* Main glow under input */}
              <div className="absolute -bottom-4 inset-x-0 h-6 bg-secondary/20 blur-xl rounded-full -z-10 opacity-70"></div>
              
              {/* Left side watercolor splashes */}
              <div className="absolute -bottom-2 -left-12 w-16 h-4 bg-blue-400/10 blur-lg rounded-full -z-10 opacity-60"></div>
              <div className="absolute -bottom-6 -left-20 w-10 h-8 bg-indigo-300/15 blur-xl rounded-full -z-10 opacity-50"></div>
              <div className="absolute -bottom-3 -left-32 w-12 h-5 bg-sky-300/12 blur-lg rounded-full -z-10 opacity-45"></div>
              
              {/* Right side watercolor splashes */}
              <div className="absolute -bottom-2 -right-12 w-16 h-4 bg-blue-400/10 blur-lg rounded-full -z-10 opacity-60"></div>
              <div className="absolute -bottom-6 -right-20 w-10 h-8 bg-indigo-300/15 blur-xl rounded-full -z-10 opacity-50"></div>
              <div className="absolute -bottom-3 -right-32 w-12 h-5 bg-sky-300/12 blur-lg rounded-full -z-10 opacity-45"></div>
              
              {/* Additional subtle splashes for more organic feel */}
              <div className="absolute -bottom-8 left-1/4 w-8 h-6 bg-blue-200/8 blur-xl rounded-full -z-10 opacity-40"></div>
              <div className="absolute -bottom-8 right-1/4 w-8 h-6 bg-blue-200/8 blur-xl rounded-full -z-10 opacity-40"></div>
              
              {/* Agent Robot Figure - Left side */}
              <div className="absolute -left-24 -bottom-12 w-16 h-20 -z-20 opacity-30">
                {/* Robot body */}
                <div className="absolute bottom-2 left-4 w-8 h-12 bg-gradient-to-b from-blue-400/20 to-blue-600/25 rounded-lg border border-blue-300/15"></div>
                {/* Robot head */}
                <div className="absolute bottom-12 left-5 w-6 h-6 bg-gradient-to-b from-blue-300/20 to-blue-500/25 rounded-full border border-blue-300/15"></div>
                {/* Robot eyes */}
                <div className="absolute bottom-14 left-6 w-1 h-1 bg-blue-500/40 rounded-full"></div>
                <div className="absolute bottom-14 left-8 w-1 h-1 bg-blue-500/40 rounded-full"></div>
                {/* Robot arms */}
                <div className="absolute bottom-8 left-2 w-3 h-1 bg-blue-400/20 rounded-full"></div>
                <div className="absolute bottom-8 right-2 w-3 h-1 bg-blue-400/20 rounded-full"></div>
                {/* Robot legs */}
                <div className="absolute bottom-0 left-5 w-1 h-3 bg-blue-400/20 rounded-full"></div>
                <div className="absolute bottom-0 left-8 w-1 h-3 bg-blue-400/20 rounded-full"></div>
                {/* Agent glow */}
                <div className="absolute -inset-2 bg-blue-400/5 blur-lg rounded-full"></div>
              </div>
              
              {/* Agent Robot Figure - Right side */}
              <div className="absolute -right-24 -bottom-12 w-16 h-20 -z-20 opacity-25">
                {/* Robot body */}
                <div className="absolute bottom-2 left-4 w-8 h-12 bg-gradient-to-b from-indigo-400/20 to-indigo-600/25 rounded-lg border border-indigo-300/15"></div>
                {/* Robot head */}
                <div className="absolute bottom-12 left-5 w-6 h-6 bg-gradient-to-b from-indigo-300/20 to-indigo-500/25 rounded-full border border-indigo-300/15"></div>
                {/* Robot eyes */}
                <div className="absolute bottom-14 left-6 w-1 h-1 bg-indigo-500/40 rounded-full"></div>
                <div className="absolute bottom-14 left-8 w-1 h-1 bg-indigo-500/40 rounded-full"></div>
                {/* Robot arms */}
                <div className="absolute bottom-8 left-2 w-3 h-1 bg-indigo-400/20 rounded-full"></div>
                <div className="absolute bottom-8 right-2 w-3 h-1 bg-indigo-400/20 rounded-full"></div>
                {/* Robot legs */}
                <div className="absolute bottom-0 left-5 w-1 h-3 bg-indigo-400/20 rounded-full"></div>
                <div className="absolute bottom-0 left-8 w-1 h-3 bg-indigo-400/20 rounded-full"></div>
                {/* Agent glow */}
                <div className="absolute -inset-2 bg-indigo-400/5 blur-lg rounded-full"></div>
              </div>
              
              {/* Floating AI elements */}
              <div className="absolute -top-8 left-8 w-4 h-4 -z-20 opacity-20">
                <div className="w-full h-full bg-gradient-to-br from-cyan-300/30 to-blue-400/30 rounded-full border border-cyan-300/20"></div>
                <div className="absolute inset-1 bg-cyan-400/20 rounded-full animate-pulse"></div>
              </div>
              
              <div className="absolute -top-12 right-12 w-3 h-3 -z-20 opacity-15">
                <div className="w-full h-full bg-gradient-to-br from-sky-300/30 to-indigo-400/30 rounded-full border border-sky-300/20"></div>
                <div className="absolute inset-0.5 bg-sky-400/20 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              </div>
              
              <div className="absolute -top-6 left-1/3 w-2 h-2 -z-20 opacity-18">
                <div className="w-full h-full bg-gradient-to-br from-blue-300/30 to-purple-400/30 rounded-full border border-blue-300/20"></div>
                <div className="absolute inset-0.5 bg-blue-400/20 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>
            </div>
            
            {/* Examples section - right after chat input */}
            <div className="w-full pt-2">
              <Examples onSelectPrompt={(query, hidden) => {
                setInputValue(query);
                setHiddenPrompt(hidden);
              }} count={tablet ? 2 : 4} />
            </div>
          </div>

        </div>

      </div>
        <div className="mb-8 sm:mb-16 sm:mt-32 mx-auto"></div>

      {/* Auth Dialog */}
      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <BlurredDialogOverlay />
        <DialogContent className="sm:max-w-md rounded-xl bg-background border border-border">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-medium">
                Sign in to continue
              </DialogTitle>
              {/* <button 
                onClick={() => setAuthDialogOpen(false)}
                className="rounded-full p-1 hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button> */}
            </div>
            <DialogDescription className="text-muted-foreground">
              Sign in or create an account to talk with Suna
            </DialogDescription>
          </DialogHeader>



          {/* OAuth Sign In */}
          <div className="w-full">
            <GoogleSignIn returnUrl="/dashboard" />
            <GitHubSignIn returnUrl="/dashboard" />
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#F3F4F6] dark:bg-[#F9FAFB]/[0.02] text-muted-foreground">
                or continue with email
              </span>
            </div>
          </div>

          {/* Sign in options */}
          <div className="space-y-4 pt-4">
            <Link
              href={`/auth?returnUrl=${encodeURIComponent('/dashboard')}`}
              className="flex h-12 items-center justify-center w-full text-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md"
              onClick={() => setAuthDialogOpen(false)}
            >
              Sign in with email
            </Link>

            <Link
              href={`/auth?mode=signup&returnUrl=${encodeURIComponent('/dashboard')}`}
              className="flex h-12 items-center justify-center w-full text-center rounded-full border border-border bg-background hover:bg-accent/20 transition-all"
              onClick={() => setAuthDialogOpen(false)}
            >
              Create new account
            </Link>
          </div>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Billing Error Alert here */}
      <BillingErrorAlert
        message={billingError?.message}
        currentUsage={billingError?.currentUsage}
        limit={billingError?.limit}
        accountId={personalAccount?.account_id}
        onDismiss={clearBillingError}
        isOpen={!!billingError}
      />

      {agentLimitData && (
        <AgentRunLimitDialog
          open={showAgentLimitDialog}
          onOpenChange={setShowAgentLimitDialog}
          runningCount={agentLimitData.runningCount}
          runningThreadIds={agentLimitData.runningThreadIds}
          projectId={undefined} // Hero section doesn't have a specific project context
        />
      )}
    </section>
  );
}
