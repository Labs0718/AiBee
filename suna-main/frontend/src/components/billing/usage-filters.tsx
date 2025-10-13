'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UsageLogsFilters, UsageLogsResponse } from '@/lib/api';

interface UsageFiltersProps {
  filters: UsageLogsFilters;
  onFiltersChange: (filters: UsageLogsFilters) => void;
  currentPageData: UsageLogsResponse | null | undefined;
  isAdmin: boolean;
}

export default function UsageFilters({
  filters,
  onFiltersChange,
  currentPageData,
  isAdmin
}: UsageFiltersProps) {
  const updateFilter = (key: keyof UsageLogsFilters, value: string | undefined) => {
    try {
      const newFilters = { ...filters, [key]: value };
      onFiltersChange(newFilters);
    } catch (error) {
      console.error('Error updating filter:', error);
    }
  };

  const hasActiveFilters = Object.keys(filters).some(key => filters[key as keyof UsageLogsFilters]);

  return (
    <div className="space-y-4">
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">적용된 필터:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.start_date && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                시작일: {filters.start_date}
              </span>
            )}
            {filters.end_date && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                종료일: {filters.end_date}
              </span>
            )}
            {filters.user_id && (
              <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                사용자: {currentPageData?.available_users?.find(u => u.id === filters.user_id)?.name || filters.user_id}
              </span>
            )}
            {filters.department_id && (
              <span className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                부서: {currentPageData?.available_departments?.find(d => d.id === filters.department_id)?.display_name || filters.department_id}
              </span>
            )}
            {filters.model && (
              <span className="inline-flex items-center px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded-full">
                모델: {filters.model.replace('claude-sonnet-4-', 'Claude Sonnet 4 ')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <Label htmlFor="start-date" className="text-sm font-medium">📅 시작일</Label>
          <Input
            id="start-date"
            type="date"
            value={filters.start_date || ''}
            onChange={(e) => updateFilter('start_date', e.target.value || undefined)}
            className="h-9"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-date" className="text-sm font-medium">📅 종료일</Label>
          <Input
            id="end-date"
            type="date"
            value={filters.end_date || ''}
            onChange={(e) => updateFilter('end_date', e.target.value || undefined)}
            className="h-9"
          />
        </div>

        {/* User Filter (Admin Only) */}
        {isAdmin && currentPageData?.available_users && Array.isArray(currentPageData.available_users) && currentPageData.available_users.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="user-filter" className="text-sm font-medium">👤 사용자</Label>
            <Select
              value={filters.user_id || ''}
              onValueChange={(value) => updateFilter('user_id', value || undefined)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="사용자 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">모든 사용자</SelectItem>
                {currentPageData.available_users.map((user) => (
                  <SelectItem key={user?.id || ''} value={user?.id || ''}>
                    {user?.name || 'Unknown'} ({user?.email || 'No email'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Department Filter - Available to all users, not just admins */}
        {currentPageData?.available_departments && Array.isArray(currentPageData.available_departments) && currentPageData.available_departments.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="department-filter" className="text-sm font-medium">🏢 부서</Label>
            <Select
              value={filters.department_id || ''}
              onValueChange={(value) => updateFilter('department_id', value || undefined)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="부서 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">모든 부서</SelectItem>
                {currentPageData.available_departments.map((dept) => (
                  <SelectItem key={dept?.id || ''} value={dept?.id || ''}>
                    {dept?.display_name || 'Unknown Department'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Model Filter */}
        {currentPageData?.available_models && Array.isArray(currentPageData.available_models) && currentPageData.available_models.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="model-filter" className="text-sm font-medium">🤖 모델</Label>
            <Select
              value={filters.model || ''}
              onValueChange={(value) => updateFilter('model', value || undefined)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="모델 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">모든 모델</SelectItem>
                {currentPageData.available_models.map((model) => (
                  <SelectItem key={model || ''} value={model || ''}>
                    {model ? model.replace('claude-sonnet-4-', 'Claude Sonnet 4 ') : 'Unknown Model'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        <span className="text-sm text-muted-foreground mr-2">빠른 설정:</span>
        <button
          onClick={() => {
            const today = new Date();
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);
            updateFilter('start_date', sevenDaysAgo.toISOString().split('T')[0]);
            updateFilter('end_date', today.toISOString().split('T')[0]);
          }}
          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          최근 7일
        </button>
        <button
          onClick={() => {
            const today = new Date();
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            updateFilter('start_date', thirtyDaysAgo.toISOString().split('T')[0]);
            updateFilter('end_date', today.toISOString().split('T')[0]);
          }}
          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          최근 30일
        </button>
        <button
          onClick={() => {
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            updateFilter('start_date', firstDayOfMonth.toISOString().split('T')[0]);
            updateFilter('end_date', today.toISOString().split('T')[0]);
          }}
          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          이번 달
        </button>
      </div>
    </div>
  );
}