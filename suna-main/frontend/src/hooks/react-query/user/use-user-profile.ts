'use client';

import { createQueryHook } from '@/hooks/use-query';
import { apiClient } from '@/lib/api-client';

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  name?: string;
  department_name?: string;
  is_admin: boolean;
  created_at: string;
}

const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get('/user/profile');
  return response.data;
};

export const useUserProfile = createQueryHook(
  ['user', 'profile'],
  fetchUserProfile,
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  }
);