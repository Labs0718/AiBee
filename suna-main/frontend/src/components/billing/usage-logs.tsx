'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { OpenInNewWindowIcon } from '@radix-ui/react-icons';
import { useUsageLogs } from '@/hooks/react-query/subscriptions/use-billing';
import { UsageLogEntry } from '@/lib/api';
import { useUserProfile } from '@/hooks/react-query/user/use-user-profile';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';



interface DailyUsage {
  date: string;
  logs: UsageLogEntry[];
  totalTokens: number;
  totalCost: number;
  requestCount: number;
  models: string[];
}

interface Props {
  accountId: string;
}

export default function UsageLogs({ accountId }: Props) {
  const [page, setPage] = useState(0);
  const [allLogs, setAllLogs] = useState<UsageLogEntry[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 1000;

  // Get current user profile to check admin status
  const { data: currentUserProfile } = useUserProfile();
  const isAdmin = currentUserProfile?.user_role === 'admin' || currentUserProfile?.user_role === 'operator';

  // Use React Query hook for the current page
  const { data: currentPageData, isLoading, error, refetch } = useUsageLogs(page, ITEMS_PER_PAGE);

  // Update accumulated logs when new data arrives
  useEffect(() => {
    if (currentPageData) {
      if (page === 0) {
        // First page - replace all logs
        setAllLogs(currentPageData.logs || []);
      } else {
        // Subsequent pages - append to existing logs
        setAllLogs(prev => [...prev, ...(currentPageData.logs || [])]);
      }
      setHasMore(currentPageData.has_more || false);
    }
  }, [currentPageData, page]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCost = (cost: number | string) => {
    if (typeof cost === 'string' || cost === 0) {
      return typeof cost === 'string' ? cost : '$0.0000';
    }
    return `$${cost.toFixed(4)}`;
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleThreadClick = (threadId: string, projectId: string) => {
    // Navigate to the thread using the correct project_id
    const threadUrl = `/projects/${projectId}/thread/${threadId}`;
    window.open(threadUrl, '_blank');
  };

  // Group usage logs by date
  const groupLogsByDate = (logs: UsageLogEntry[]): DailyUsage[] => {
    const grouped = logs.reduce(
      (acc, log) => {
        const date = new Date(log.created_at).toDateString();

        if (!acc[date]) {
          acc[date] = {
            date,
            logs: [],
            totalTokens: 0,
            totalCost: 0,
            requestCount: 0,
            models: [],
          };
        }

        acc[date].logs.push(log);
        acc[date].totalTokens += log.total_tokens;
        acc[date].totalCost +=
          typeof log.estimated_cost === 'number' ? log.estimated_cost : 0;
        acc[date].requestCount += 1;

        if (!acc[date].models.includes(log.content.model)) {
          acc[date].models.push(log.content.model);
        }

        return acc;
      },
      {} as Record<string, DailyUsage>,
    );

    return Object.values(grouped).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  };



  if (isLoading && page === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Logs</CardTitle>
          <CardDescription>Loading your token usage history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              Error: {error.message || 'Failed to load usage logs'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle local development mode message
  if (currentPageData?.message) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted/30 border border-border rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              {currentPageData.message}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const dailyUsage = groupLogsByDate(allLogs);
  const totalUsage = allLogs.reduce(
    (sum, log) =>
      sum + (typeof log.estimated_cost === 'number' ? log.estimated_cost : 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Daily Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>일별 사용량 추이</CardTitle>
          <CardDescription>
            최근 사용량 변화를 한눈에 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dailyUsage.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">차트를 표시할 데이터가 없습니다.</p>
            </div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[...dailyUsage].reverse()}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
                    }}
                    className="text-sm"
                  />
                  <YAxis
                    yAxisId="left"
                    className="text-sm"
                    tickFormatter={(value) => `${(value / 1000).toFixed(1)}K`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    className="text-sm"
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg shadow-lg p-3">
                            <p className="font-medium mb-2">
                              {new Date(label).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                weekday: 'long'
                              })}
                            </p>
                            <div className="space-y-1 text-sm">
                              <p className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                토큰: {data.totalTokens.toLocaleString()}개
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                비용: {formatCost(data.totalCost)}
                              </p>
                              <p className="text-muted-foreground">
                                요청 수: {data.requestCount}회
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="totalTokens"
                    stroke="#8884d8"
                    strokeWidth={2}
                    fillOpacity={0.6}
                    fill="url(#colorTokens)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="totalCost"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    fillOpacity={0.4}
                    fill="url(#colorCost)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Logs Accordion */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Usage Logs</CardTitle>
          <CardDescription>
            <div className='flex justify-between items-center'>
              {isAdmin
                ? "All users' token usage organized by day, sorted by most recent."
                : "Your token usage organized by day, sorted by most recent."
              }{" "}
              <Button variant='outline' asChild className='text-sm ml-4'>
                <Link href="/model-pricing">
                  View Model Pricing <OpenInNewWindowIcon className='w-4 h-4' />
                </Link>
              </Button>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dailyUsage.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No usage logs found.</p>
            </div>
          ) : (
            <>
              <Accordion type="single" collapsible className="w-full">
                {dailyUsage.map((day) => (
                  <AccordionItem key={day.date} value={day.date}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex justify-between items-center w-full mr-4">
                        <div className="text-left">
                          <div className="font-semibold">
                            {formatDateOnly(day.date)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {day.requestCount} request
                            {day.requestCount !== 1 ? 's' : ''} •{' '}
                            {day.models.join(', ')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-semibold">
                            {formatCost(day.totalCost)}
                          </div>
                          <div className="text-sm text-muted-foreground font-mono">
                            {day.totalTokens.toLocaleString()} tokens
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="rounded-md border mt-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Time</TableHead>
                              <TableHead>User</TableHead>
                              <TableHead>Model</TableHead>
                              <TableHead className="text-right">
                                Tokens
                              </TableHead>
                              <TableHead className="text-right">Cost</TableHead>
                              <TableHead className="text-center">
                                Thread
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {day.logs.map((log) => (
                              <TableRow key={log.message_id}>
                                <TableCell className="font-mono text-sm">
                                  {new Date(
                                    log.created_at,
                                  ).toLocaleTimeString()}
                                </TableCell>
                                <TableCell className="text-sm">
                                  <Badge
                                    variant="outline"
                                    className="text-xs text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                                  >
                                    {log.user_name || log.user_email || (log.account_id ? `User ${log.account_id.slice(0, 8)}` : '익명 사용자')}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="font-mono text-xs bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950
                                               text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700
                                               hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900 dark:hover:to-indigo-900"
                                  >
                                    {log.content.model.replace('claude-sonnet-4-', 'Claude Sonnet 4 ')}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right font-mono font-medium text-sm">
                                  <div className="flex flex-col items-end">
                                    <span className="text-green-600 dark:text-green-400 text-xs">
                                      ↗ {log.content.usage.prompt_tokens.toLocaleString()} 입력
                                    </span>
                                    <span className="text-blue-600 dark:text-blue-400 text-xs">
                                      ↙ {log.content.usage.completion_tokens.toLocaleString()} 출력
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-mono font-medium text-sm">
                                  {formatCost(log.estimated_cost)}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleThreadClick(
                                        log.thread_id,
                                        log.project_id,
                                      )
                                    }
                                    className="h-8 w-8 p-0"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {hasMore && (
                <div className="flex justify-center pt-6">
                  <Button
                    onClick={loadMore}
                    disabled={isLoading}
                    variant="outline"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
