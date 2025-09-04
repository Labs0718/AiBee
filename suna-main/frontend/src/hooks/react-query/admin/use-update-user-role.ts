'use client';

import { createMutationHook } from '@/hooks/use-query';
import { apiClient } from '@/lib/api-client';

export interface UpdateUserRoleRequest {
  user_role: 'admin' | 'operator' | 'user';
}

export interface UpdateUserRoleResponse {
  message: string;
  user_id: string;
  new_role: string;
}

const updateUserRole = async ({
  userId,
  roleData,
}: {
  userId: string;
  roleData: UpdateUserRoleRequest;
}): Promise<UpdateUserRoleResponse> => {
  const response = await apiClient.put(`/user/users/${userId}/role`, roleData);
  return response.data;
};

export const useUpdateUserRole = () =>
  createMutationHook(updateUserRole, {
    errorContext: {
      operation: 'update user role',
      resource: 'user role',
    },
  })();