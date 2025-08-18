'use client';

import React from 'react';
import { User, Bell, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/AuthProvider';

export const MyPageHeader = () => {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-full">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">마이페이지</h1>
          <p className="text-muted-foreground">개인 정보 관리 • 계정 설정</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">개인 정보</span>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
        
        <div className="relative">
          <Bell className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white">
            1
          </Badge>
        </div>

        <Settings className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(user?.user_metadata?.full_name || user?.email || 'U')}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">
                  {user?.user_metadata?.full_name || '사용자'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.user_metadata?.department || '부서 미지정'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuItem className="gap-2 p-2">
              <User className="h-4 w-4" />
              <span>사용자</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <span className="text-xs text-muted-foreground">Personal Account</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 p-2">
              <span className="text-sm font-medium">
                {user?.user_metadata?.full_name || '사용자'}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">⌘1</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
