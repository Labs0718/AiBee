'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

interface Department {
  id: string;
  name: string;
  display_name: string;
}

export default function MyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 프로필 관련 상태 - 가짜 데이터로 시뮬레이션
  const [userProfile, setUserProfile] = useState<any>({
    display_name: '김철수',
    name: '김철수',
    email: 'kim.chulsoo@suna.com',
    department_name: '개발팀',
    is_admin: false,
    created_at: '2024-01-15'
  });
  const [departments, setDepartments] = useState<Department[]>([
    { id: '1', name: '개발팀', display_name: '개발팀' },
    { id: '2', name: '기획팀', display_name: '기획팀' },
    { id: '3', name: '디자인팀', display_name: '디자인팀' }
  ]);
  const [profileLoading, setProfileLoading] = useState(false);

  // 비밀번호 변경 관련 상태
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 사용자 프로필 정보 로드 - 시뮬레이션
  useEffect(() => {
    // 실제 API 호출 대신 가짜 데이터 사용
    setProfileLoading(false);
  }, [user]);

  // 비밀번호 마스킹
  const getMaskedPassword = () => {
    return '••••••••';
  };

  // 비밀번호 변경 - 시뮬레이션
  const handleChangePassword = async () => {
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      toast.error('새 비밀번호는 최소 6자리 이상이어야 합니다.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsChangingPassword(true);
    
    // 시뮬레이션
    setTimeout(() => {
      toast.success('비밀번호가 성공적으로 변경되었습니다.');
      setIsPasswordDialogOpen(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswords({
        current: false,
        new: false,
        confirm: false
      });
      setIsChangingPassword(false);
    }, 1500);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '계정삭제') {
      toast.error('정확히 "계정삭제"를 입력해주세요.');
      return;
    }

    setIsDeleting(true);
    
    // 시뮬레이션
    setTimeout(() => {
      toast.success('계정 삭제 요청이 접수되었습니다.');
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      router.push('/');
    }, 2000);
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
                      {(userProfile?.display_name || userProfile?.name || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">
                      {userProfile?.display_name || userProfile?.name || user?.email?.split('@')[0] || '사용자'}
                    </p>
                    <p className="text-gray-500 text-xs">{userProfile?.department_name || '부서 미지정'}</p>
                    <p className="text-gray-400 text-xs">{userProfile?.email || user?.email} • {userProfile?.is_admin ? '관리자' : '사용자'}</p>
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
                    <span className="text-gray-900 font-medium">{userProfile?.email || user?.email}</span>
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
                    <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-auto text-xs">변경</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            비밀번호 변경
                          </DialogTitle>
                          <DialogDescription>
                            새로운 비밀번호를 입력해주세요. 최소 6자리 이상이어야 합니다.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="new-password">새 비밀번호</Label>
                            <div className="relative">
                              <Input
                                id="new-password"
                                type={showPasswords.new ? "text" : "password"}
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                placeholder="새 비밀번호를 입력하세요"
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
                            <div className="relative">
                              <Input
                                id="confirm-password"
                                type={showPasswords.confirm ? "text" : "password"}
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder="새 비밀번호를 다시 입력하세요"
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsPasswordDialogOpen(false);
                              setPasswordForm({
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: ''
                              });
                              setShowPasswords({
                                current: false,
                                new: false,
                                confirm: false
                              });
                            }}
                          >
                            취소
                          </Button>
                          <Button
                            onClick={handleChangePassword}
                            disabled={isChangingPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                          >
                            {isChangingPassword ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                변경 중...
                              </>
                            ) : (
                              '비밀번호 변경'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
                      }) : '2024년 1월 15일'}
                    </span>
                  </div>
                </div>

                {/* 권한 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">계정 권한</Label>
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-medium">
                      {userProfile?.is_admin ? '관리자' : '일반 사용자'}
                    </span>
                    {userProfile?.is_admin && (
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
                
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      계정 삭제
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        계정을 정말 삭제하시겠습니까?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>
                          이 작업은 <strong>되돌릴 수 없습니다</strong>. 계정 삭제 시:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>모든 개인 데이터가 영구적으로 삭제됩니다</li>
                          <li>생성한 모든 에이전트와 프로젝트가 삭제됩니다</li>
                          <li>업로드한 모든 파일이 삭제됩니다</li>
                          <li>결제 정보 및 구독이 취소됩니다</li>
                        </ul>
                        <div className="pt-4">
                          <Label htmlFor="confirm-delete" className="text-sm font-medium">
                            계속하려면 <code className="bg-muted px-1 rounded">계정삭제</code>를 정확히 입력하세요:
                          </Label>
                          <Input
                            id="confirm-delete"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="계정삭제"
                            className="mt-2"
                          />
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>
                        취소
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmText !== '계정삭제' || isDeleting}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        {isDeleting ? '삭제 중...' : '계정 삭제'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 