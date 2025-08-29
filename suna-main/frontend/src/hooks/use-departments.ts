import { useQuery } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export interface Department {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

const fetchDepartments = async (): Promise<Department[]> => {
  const response = await fetch(`${API_URL}/departments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch departments: ${response.status}`);
  }
  
  return response.json();
};

interface DepartmentOption {
  id: string;
  name: string;
}

const fetchDepartmentNames = async (): Promise<DepartmentOption[]> => {
  const response = await fetch(`${API_URL}/departments/names`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch department names: ${response.status}`);
  }
  
  return response.json();
};

export const useDepartments = (options?: {
  enabled?: boolean;
  staleTime?: number;
}) => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
    retry: 2,
  });
};

export const useDepartmentNames = (options?: {
  enabled?: boolean;
  staleTime?: number;
}) => {
  return useQuery({
    queryKey: ['departmentNames'],
    queryFn: fetchDepartmentNames,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
    retry: 2,
  });
};