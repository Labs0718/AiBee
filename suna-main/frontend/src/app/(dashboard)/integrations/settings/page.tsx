'use client';

import React, { useEffect } from 'react';
import { Server } from 'lucide-react';
import { MCPIntegrationsList } from '../../../../components/integrations/mcp-integrations-list';
import { useRouter } from 'next/navigation';
import { useFeatureFlag } from '@/lib/feature-flags';
import { PageHeader } from '@/components/ui/page-header';

export default function IntegrationsSettingsPage() {
  const { enabled: customAgentsEnabled, loading: flagLoading } = useFeatureFlag("custom_agents");
  const router = useRouter();

  useEffect(() => {
    if (!flagLoading && !customAgentsEnabled) {
      router.replace("/dashboard");
    }
  }, [flagLoading, customAgentsEnabled, router]);

  if (flagLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-6 py-6">
        <div className="space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-3xl"></div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!customAgentsEnabled) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl px-6 py-6">
      <div className="space-y-8">
        <div className="space-y-4">
          <PageHeader icon={Server}>
            <span className="text-primary">MCP Integrations</span>
          </PageHeader>
          <p className="text-sm text-muted-foreground">
            View all Model Context Protocol (MCP) integrations connected to your agents
          </p>
          <MCPIntegrationsList />
        </div>
      </div>
    </div>
  );
}