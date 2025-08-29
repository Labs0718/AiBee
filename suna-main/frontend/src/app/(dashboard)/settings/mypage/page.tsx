'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useUserProfile } from '@/hooks/react-query/user/use-user-profile';
import { AccountDeletionDialog } from '@/components/settings/mypage/account-deletion-dialog';
import { PasswordChangeDialog } from '@/components/settings/mypage/password-change-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Trash2, 
  AlertTriangle, 
  User, 
  Mail, 
  Building, 
  Shield, 
  Calendar,
  ChevronDown,
  Settings,
  Bell,
  Lock,
  Eye
} from 'lucide-react';

export default function MyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // API로 사용자 프로필 정보 가져오기
  const { data: userProfile, isLoading: profileLoading, error: profileError } = useUserProfile();

  // 비밀번호 변경 다이얼로그 상태
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);


  // 비밀번호 마스킹
  const getMaskedPassword = () => {
    return '••••••••';
  };


  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">인증이 필요합니다</h2>
          <p className="text-gray-600">마이페이지에 접근하려면 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">프로필 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">프로필 로드 실패</h2>
          <p className="text-gray-600">프로필 정보를 불러올 수 없습니다. 새로고침 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1">
        {/* 향상된 네비게이션 헤더 */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-[1440px] ml-8 mr-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">마이페이지</h1>
                    <p className="text-sm text-gray-500 font-medium">개인 정보 관리 • 계정 설정</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">개인 정보</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                
                <button className="relative p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-semibold">1</span>
                </button>
                
                <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                  <Settings className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {(userProfile?.display_name || userProfile?.name || userProfile?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {userProfile?.display_name || userProfile?.name || userProfile?.email?.split('@')[0] || '사용자'}
                      </p>
                      {userProfile?.department_name && (
                        <span className="text-gray-500 text-xs">• {userProfile?.department_name}</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs">{userProfile?.email} • {
                      userProfile?.user_role === 'operator' ? '운영자' : 
                      userProfile?.user_role === 'admin' ? '관리자' : '일반사용자'
                    }</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="max-w-[1440px] ml-8 mr-auto px-8 py-8">
          <div className="space-y-8">
            {/* 프로필 개요 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">프로필 개요</h3>
                  <p className="text-sm text-gray-500 mt-1">계정의 기본 정보를 확인하세요</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 이메일 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">이메일 주소</Label>
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-medium">{userProfile?.email}</span>
                    <span className="ml-auto text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">인증됨</span>
                  </div>
                </div>

                {/* 이름 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">사용자 이름</Label>
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-medium">
                      {userProfile?.display_name || userProfile?.name || '이름 미설정'}
                    </span>
                  </div>
                </div>

                {/* 비밀번호 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">비밀번호</Label>
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <Lock className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-mono">
                      {getMaskedPassword()}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-auto text-xs"
                      onClick={() => setIsPasswordDialogOpen(true)}
                    >
                      변경
                    </Button>
                  </div>
                </div>

                {/* 부서 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">부서</Label>
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <Building className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-medium">
                      {userProfile?.department_name || '부서 미지정'}
                    </span>
                  </div>
                </div>

                {/* 가입일 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">가입일</Label>
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-medium">
                      {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : '-'}
                    </span>
                  </div>
                </div>

                {/* 권한 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">계정 권한</Label>
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-medium">
                      {userProfile?.user_role === 'operator' ? '운영자' : 
                       userProfile?.user_role === 'admin' ? '관리자' : '일반사용자'}
                    </span>
                    {userProfile?.user_role === 'operator' && (
                      <span className="ml-auto text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">OPERATOR</span>
                    )}
                    {userProfile?.user_role === 'admin' && (
                      <span className="ml-auto text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">ADMIN</span>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* 계정 보안 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">계정 보안</h3>
                  <p className="text-sm text-gray-500 mt-1">계정의 보안 설정을 관리합니다</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">2단계 인증</h4>
                  <p className="text-sm text-gray-500 mt-1">활성화됨</p>
                </div>
                
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">로그인 기록</h4>
                  <p className="text-sm text-gray-500 mt-1">최근 활동 확인</p>
                </div>
                
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <Settings className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">개인정보 설정</h4>
                  <p className="text-sm text-gray-500 mt-1">프라이버시 관리</p>
                </div>
              </div>
            </div>

            {/* 위험한 작업 */}
            <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-red-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    위험한 작업
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">이 작업들은 되돌릴 수 없습니다. 신중하게 진행해주세요.</p>
                </div>
              </div>
              
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <h4 className="font-semibold text-red-900 mb-2">계정 영구 삭제</h4>
                <p className="text-sm text-red-700 mb-4">
                  계정을 삭제하면 모든 데이터가 영구적으로 삭제되며, 이 작업은 되돌릴 수 없습니다.
                </p>
                
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  계정 삭제
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* 비밀번호 변경 다이얼로그 */}
        <PasswordChangeDialog
          open={isPasswordDialogOpen}
          onOpenChange={setIsPasswordDialogOpen}
        />
        
        {/* 계정 삭제 다이얼로그 */}
        <AccountDeletionDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        />
      </div>
    </div>
  );
} 