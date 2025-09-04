'use client';

import { createQueryHook } from '@/hooks/use-query';
import { apiClient } from '@/lib/api-client';

export interface AdminUserData {
  user_id: string;
  id: string;
  email: string;
  display_name: string;
  name: string;
  account_name: string;
  department_name?: string;
  is_admin: boolean;
  user_role: 'operator' | 'admin' | 'user';
  email_confirmed_at?: string;
  created_at: string;
  status: 'active' | 'inactive';
}

interface AdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  role?: string;
  status?: string;
}

const fetchAdminUsers = async (params: AdminUsersParams = {}): Promise<AdminUserData[]> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.department) queryParams.append('department', params.department);
  if (params.role) queryParams.append('role', params.role);
  if (params.status) queryParams.append('status', params.status);
  
  const url = `/user/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiClient.get(url);
  return response.data;
};

export const useAdminUsers = (params: AdminUsersParams = {}) =>
  createQueryHook(
    ['admin', 'users', params],
    () => fetchAdminUsers(params),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      retry: 1,
    }
  )();