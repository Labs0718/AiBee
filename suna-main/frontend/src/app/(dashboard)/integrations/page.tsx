'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAgents } from '@/hooks/react-query/agents/use-agents';
import { Loader2 } from 'lucide-react';

export default function IntegrationsPage() {
  const router = useRouter();
  const { data: agentsData, isLoading } = useAgents();

  useEffect(() => {
    if (!isLoading && agentsData?.agents) {
      // Find the default agent
      const defaultAgent = agentsData.agents.find(agent => agent.is_default);

      if (defaultAgent) {
        // Redirect to the default agent's config page
        router.replace(`/agents/config/${defaultAgent.agent_id}`);
      } else if (agentsData.agents.length > 0) {
        // If no default agent, redirect to the first agent
        router.replace(`/agents/config/${agentsData.agents[0].agent_id}`);
      } else {
        // If no agents at all, redirect to dashboard
        router.replace('/dashboard');
      }
    }
  }, [agentsData, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading agent configuration...</p>
      </div>
    </div>
  );
}
