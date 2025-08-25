import { useQuery } from '@tanstack/react-query';

interface BrowserStatus {
  isActive: boolean;
  lastUpdate: number;
  screenshot?: string;
  url?: string;
}

export const useBrowserStatus = (
  projectId?: string,
  threadId?: string,
  enabled: boolean = true
) => {
  return useQuery<BrowserStatus>({
    queryKey: ['browser-status', projectId, threadId],
    queryFn: async () => {
      if (!projectId || !threadId) {
        throw new Error('Project ID and Thread ID are required');
      }
      
      try {
        // Check if browser sandbox is healthy
        const healthResponse = await fetch('/api/sandboxes/browser/health');
        const healthData = await healthResponse.json();
        
        return {
          isActive: healthData.browser_sandbox_healthy || false,
          lastUpdate: Date.now(),
          ...healthData,
        };
      } catch (error) {
        return {
          isActive: false,
          lastUpdate: Date.now(),
        };
      }
    },
    enabled: enabled && !!projectId && !!threadId,
    refetchInterval: 1000, // Poll every second
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchIntervalInBackground: true,
  });
};

// Hook for forcing browser screenshot refresh
export const useBrowserRefresh = () => {
  const refreshBrowser = async () => {
    try {
      // Clear React Query cache for browser-related queries
      const queryClient = (window as any).__REACT_QUERY_CLIENT__;
      if (queryClient) {
        await queryClient.invalidateQueries({
          queryKey: ['browser-status'],
        });
        await queryClient.invalidateQueries({
          queryKey: ['messages'],
        });
      }
      
      // Force page refresh if needed
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('browser-refresh'));
      }
    } catch (error) {
      console.error('Failed to refresh browser status:', error);
    }
  };

  return { refreshBrowser };
};