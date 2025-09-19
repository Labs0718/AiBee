'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bot, Menu, Store, Plus, Zap, Plug, ChevronRight, Loader2, Plane } from 'lucide-react';

import { NavAgents } from '@/components/sidebar/nav-agents';
import { NavUserWithTeams } from '@/components/sidebar/nav-user-with-teams';
import { KortixLogo } from '@/components/sidebar/kortix-logo';
import { CTACard } from '@/components/sidebar/cta';
import { SpreadsheetAutomationThreads } from '@/components/sidebar/spreadsheet-automation-threads';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { NewAgentDialog } from '@/components/agents/new-agent-dialog';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { usePathname, useSearchParams } from 'next/navigation';
import { useFeatureFlags } from '@/lib/feature-flags';
import posthog from 'posthog-js';
// Floating mobile menu button component
function FloatingMobileMenuButton() {
  const { setOpenMobile, openMobile } = useSidebar();
  const isMobile = useIsMobile();

  if (!isMobile || openMobile) return null;

  return (
    <div className="fixed top-6 left-4 z-50 md:hidden">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setOpenMobile(true)}
            size="icon"
            className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Open menu
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { state, setOpen, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar: string;
    department_name?: string;
  }>({
    name: 'Loading...',
    email: 'loading@example.com',
    avatar: '',
  });

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { flags, loading: flagsLoading } = useFeatureFlags(['custom_agents', 'agent_marketplace']);
  const customAgentsEnabled = flags.custom_agents;
  const marketplaceEnabled = flags.agent_marketplace;
  const [showNewAgentDialog, setShowNewAgentDialog] = useState(false);

  // Close mobile menu on page navigation
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [pathname, searchParams, isMobile, setOpenMobile]);

  
  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        // Get access token for API call
        const { data: session } = await supabase.auth.getSession();
        const accessToken = session.session?.access_token;

        if (accessToken) {
          // Fetch user profile from backend API
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/profile`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const profile = await response.json();
              setUser({
                name: profile.display_name || profile.name || data.user.email?.split('@')[0] || 'User',
                email: profile.email || data.user.email || '',
                avatar: data.user.user_metadata?.avatar_url || '',
                department_name: profile.department_name,
              });
            } else {
              // Fallback to user metadata if API call fails
              setUser({
                name:
                  data.user.user_metadata?.full_name ||
                  data.user.user_metadata?.name ||
                  data.user.email?.split('@')[0] ||
                  'User',
                email: data.user.email || '',
                avatar: data.user.user_metadata?.avatar_url || '',
              });
            }
          } catch (error) {
            // Fallback to user metadata if API call fails
            setUser({
              name:
                data.user.user_metadata?.full_name ||
                data.user.user_metadata?.name ||
                data.user.email?.split('@')[0] ||
                'User',
              email: data.user.email || '',
              avatar: data.user.user_metadata?.avatar_url || '',
            });
          }
        }
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
        event.preventDefault();
        setOpen(!state.startsWith('expanded'));
        window.dispatchEvent(
          new CustomEvent('sidebar-left-toggled', {
            detail: { expanded: !state.startsWith('expanded') },
          }),
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, setOpen]);




  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0 bg-background/95 backdrop-blur-sm [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
      {...props}
    >
      <SidebarHeader className="px-2 py-2">
        <div className="flex h-[40px] items-center px-1 relative">
          <Link href="/dashboard" className="flex-shrink-0" onClick={() => isMobile && setOpenMobile(false)}>
            <KortixLogo size={24} />
          </Link>
          {state !== 'collapsed' && (
            <div className="ml-2 transition-all duration-200 ease-in-out whitespace-nowrap">
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            {state !== 'collapsed' && !isMobile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarTrigger className="h-8 w-8" />
                </TooltipTrigger>
                <TooltipContent>Toggle sidebar (CMD+B)</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <SidebarGroup>
          <Link href="/dashboard">
            <SidebarMenuButton 
              className={cn('touch-manipulation', {
                'bg-accent text-accent-foreground font-medium': pathname === '/dashboard',
              })} 
              onClick={() => {
                posthog.capture('new_task_clicked');
                if (isMobile) setOpenMobile(false);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="flex items-center justify-between w-full">
                새 작업
              </span>
            </SidebarMenuButton>
          </Link>
         
        </SidebarGroup>
        <NavAgents />

        {/* 스프레드시트 자동화 섹션 */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <Collapsible defaultOpen>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="w-full justify-between touch-manipulation">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>스프레드시트 자동화</span>
                    </div>
                    <ChevronRight className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SpreadsheetAutomationThreads />
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      {state !== 'collapsed' && (
        <div className="px-3 py-2">
          <CTACard />
        </div>
      )}
      <SidebarFooter>
        {state === 'collapsed' && (
          <div className="mt-2 flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger className="h-8 w-8" />
              </TooltipTrigger>
              <TooltipContent>Expand sidebar (CMD+B)</TooltipContent>
            </Tooltip>
          </div>
        )}
        <NavUserWithTeams user={user} />
      </SidebarFooter>
      <SidebarRail />
      <NewAgentDialog 
        open={showNewAgentDialog} 
        onOpenChange={setShowNewAgentDialog}
      />
    </Sidebar>
  );
}

// Export the floating button so it can be used in the layout
export { FloatingMobileMenuButton };
