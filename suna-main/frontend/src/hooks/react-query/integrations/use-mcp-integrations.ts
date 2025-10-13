import { useQuery } from '@tanstack/react-query';
import { useAgents } from '../agents/use-agents';

export interface MCPIntegration {
  qualifiedName: string;
  name: string;
  type: 'composio' | 'http' | 'sse' | 'custom';
  config: Record<string, any>;
  enabledTools: string[];
  agentId: string;
  agentName: string;
  profileImageUrl?: string;
}

export interface MCPIntegrationsData {
  integrations: MCPIntegration[];
  totalCount: number;
  agentsCount: number;
}

/**
 * Hook to fetch all MCP integrations across all agents
 * This aggregates configured_mcps and custom_mcps from all user's agents
 */
export const useMCPIntegrations = () => {
  const { data: agentsData, isLoading: agentsLoading, error: agentsError } = useAgents({});

  return useQuery<MCPIntegrationsData>({
    queryKey: ['mcp-integrations'],
    queryFn: async () => {
      if (!agentsData?.agents) {
        return {
          integrations: [],
          totalCount: 0,
          agentsCount: 0,
        };
      }

      const integrations: MCPIntegration[] = [];
      const agentsWithMCP = new Set<string>();

      agentsData.agents.forEach((agent) => {
        const hasIntegrations =
          (agent.configured_mcps && agent.configured_mcps.length > 0) ||
          (agent.custom_mcps && agent.custom_mcps.length > 0);

        if (hasIntegrations) {
          agentsWithMCP.add(agent.agent_id);
        }

        // Process configured_mcps (Composio integrations)
        if (agent.configured_mcps) {
          agent.configured_mcps.forEach((mcp: any) => {
            integrations.push({
              qualifiedName: mcp.qualifiedName || mcp.name,
              name: mcp.name,
              type: mcp.customType || 'composio',
              config: mcp.config || {},
              enabledTools: mcp.enabledTools || [],
              agentId: agent.agent_id,
              agentName: agent.name,
              profileImageUrl: agent.profile_image_url,
            });
          });
        }

        // Process custom_mcps (HTTP/SSE custom integrations)
        if (agent.custom_mcps) {
          agent.custom_mcps.forEach((mcp: any) => {
            integrations.push({
              qualifiedName: mcp.qualifiedName || mcp.name,
              name: mcp.name,
              type: mcp.customType || mcp.type || 'custom',
              config: mcp.config || {},
              enabledTools: mcp.enabledTools || [],
              agentId: agent.agent_id,
              agentName: agent.name,
              profileImageUrl: agent.profile_image_url,
            });
          });
        }
      });

      return {
        integrations,
        totalCount: integrations.length,
        agentsCount: agentsWithMCP.size,
      };
    },
    enabled: !agentsLoading && !!agentsData,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Get unique MCP integrations (deduplicated by qualifiedName)
 */
export const useUniqueMCPIntegrations = () => {
  const { data, ...rest } = useMCPIntegrations();

  const uniqueIntegrations = data?.integrations.reduce((acc, integration) => {
    const existing = acc.find(i => i.qualifiedName === integration.qualifiedName);
    if (!existing) {
      acc.push(integration);
    }
    return acc;
  }, [] as MCPIntegration[]);

  return {
    ...rest,
    data: {
      ...data,
      integrations: uniqueIntegrations || [],
      totalCount: uniqueIntegrations?.length || 0,
    } as MCPIntegrationsData,
  };
};
