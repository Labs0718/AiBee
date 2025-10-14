'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Server,
  Zap,
  ChevronRight,
  Loader2,
  Package,
  AlertCircle
} from 'lucide-react';
import { useMCPIntegrations } from '@/hooks/react-query/integrations/use-mcp-integrations';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const MCPIntegrationsList: React.FC = () => {
  const { data, isLoading, error } = useMCPIntegrations();
  const router = useRouter();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'composio':
        return <Zap className="h-4 w-4 text-primary" />;
      case 'http':
      case 'sse':
      case 'custom':
        return <Server className="h-4 w-4 text-blue-500" />;
      default:
        return <Package className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'composio':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'http':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'sse':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'custom':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load MCP integrations. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!data || data.totalCount === 0) {
    return (
      <div className="text-center py-12 px-6 bg-muted/30 rounded-xl border-2 border-dashed border-border">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4 border">
          <Server className="h-6 w-6 text-muted-foreground" />
        </div>
        <h4 className="text-sm font-semibold text-foreground mb-2">
          No MCP Integrations Found
        </h4>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          You haven't configured any MCP integrations yet. Create an agent and add integrations to get started.
        </p>
        <Button onClick={() => router.push('/agents')}>
          Add MCP Integration
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Integrations</p>
              <p className="text-2xl font-semibold">{data.totalCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Agents Connected</p>
              <p className="text-2xl font-semibold">{data.agentsCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Composio Apps</p>
              <p className="text-2xl font-semibold">
                {data.integrations.filter(i => i.type === 'composio').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Integrations List */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">All Integrations</h3>
        {data.integrations.map((integration, index) => (
          <Card
            key={`${integration.agentId}-${integration.qualifiedName}-${index}`}
            className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => router.push(`/agents/config/${integration.agentId}`)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                  {getTypeIcon(integration.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {integration.name}
                    </h4>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getTypeBadgeColor(integration.type)}`}
                    >
                      {integration.type.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2 truncate">
                    Connected to: <span className="font-medium">{integration.agentName}</span>
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {integration.enabledTools.length} tools enabled
                    </span>
                    {integration.config?.url && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground truncate max-w-xs">
                          {integration.config.url}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
