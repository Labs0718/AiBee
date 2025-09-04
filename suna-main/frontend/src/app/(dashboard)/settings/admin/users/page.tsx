'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useUserProfile } from '@/hooks/react-query/user/use-user-profile';
import { useAdminUsers, AdminUserData } from '@/hooks/react-query/admin/use-admin-users';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Edit, 
  Trash2, 
  Shield, 
  Mail, 
  Building,
  Calendar,
  AlertTriangle,
  Check,
  X,
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  UserCheck,
  UserX,
  Power,
  PowerOff,
  Settings,
  Activity,
  TrendingUp,
  ChevronDown,
  Bell,
  Archive,
  Globe,
  Database,
  HardDrive,
  Layers,
  Cpu,
  MonitorSpeaker,
  Grid3X3,
  List,
  Eye,
  BarChart3,
  ChevronRight,
  ArrowLeft,
  MoreVertical,
  Sparkles,
  Gauge
} from 'lucide-react';
import { toast } from 'sonner';

// Use AdminUserData from the hook instead
type UserData = AdminUserData;

interface Department {
  id: string;
  name: string;
  display_name: string;
}

// 고급 통계 카드 컴포넌트
interface AdvancedStatsCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<any>;
  trend?: string;
  color?: "blue" | "emerald" | "purple" | "orange";
  subtitle?: string;
}

const AdvancedStatsCard: React.FC<AdvancedStatsCardProps> = ({ title, value, change, icon: Icon, trend, color = "blue", subtitle }) => (
  <div className="relative bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 overflow-hidden group">
    <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${
      color === 'blue' ? 'from-blue-500 to-blue-600' :
      color === 'emerald' ? 'from-emerald-500 to-emerald-600' :
      color === 'purple' ? 'from-purple-500 to-purple-600' :
      'from-orange-500 to-orange-600'
    }`}></div>
    
    <div className="relative">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          color === 'blue' ? 'bg-blue-50 text-blue-600' :
          color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
          color === 'purple' ? 'bg-purple-50 text-purple-600' :
          'bg-orange-50 text-orange-600'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
          change >= 0 
            ? 'bg-emerald-50 text-emerald-700' 
            : 'bg-red-50 text-red-700'
        }`}>
          <TrendingUp className={`w-3 h-3 ${change < 0 ? 'rotate-180' : ''}`} />
          {Math.abs(change)}%
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  </div>
);

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: userProfile, isLoading: profileLoading, error: profileError } = useUserProfile();
  
  // State for filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Fetch users with current filters
  const { data: users, isLoading, error, refetch } = useAdminUsers({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
    department: departmentFilter !== 'all' ? departmentFilter : undefined,
    role: activeTab !== 'all' && ['admin', 'operator', 'user'].includes(activeTab) ? activeTab : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  
  // 권한 체크
  useEffect(() => {
    if (!profileLoading && userProfile) {
      const userRole = userProfile.user_role;
      if (userRole !== 'admin' && userRole !== 'operator') {
        router.push('/dashboard');
        return;
      }
    }
  }, [userProfile, profileLoading, router]);

  // 로딩 중이거나 권한이 없는 경우
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (userProfile && userProfile.user_role !== 'admin' && userProfile.user_role !== 'operator') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">접근 권한이 없습니다</h1>
          <p className="text-gray-600 mb-4">이 페이지는 관리자 및 운영자만 접근할 수 있습니다.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const [departments, setDepartments] = useState<Department[]>([]);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [editForm, setEditForm] = useState({
    display_name: '',
    department_id: '',
    is_admin: false
  });

  // 현재 로그인한 관리자 정보
  const adminInfo = {
    name: userProfile?.display_name || '관리자',
    email: userProfile?.email || 'admin@suna.com',
    department: userProfile?.department_name || 'IT팀',
    is_admin: userProfile?.user_role === 'admin' || userProfile?.user_role === 'operator' || false
  };


  // Loading state handling
  const loadingState = profileLoading || isLoading;

  // 사용자 상태 변경
  const handleStatusChange = (userId: string, newStatus: 'active' | 'inactive') => {
    // TODO: Implement actual status change API call
    toast.success(`사용자 상태가 ${newStatus === 'active' ? '활성' : '비활성'}으로 변경되었습니다.`);
    refetch(); // Refetch data after change
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setEditForm({
      display_name: user.display_name || '',
      department_id: departments.find(d => d.name === user.department_name)?.id || '',
      is_admin: user.is_admin
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    // TODO: Implement actual user update API call
    toast.success('사용자 정보가 성공적으로 업데이트되었습니다.');
    setIsEditDialogOpen(false);
    setEditingUser(null);
    refetch(); // Refetch data after update
  };

  const handleDeleteUser = (user: UserData) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    // TODO: Implement actual user deletion API call
    toast.success('사용자가 성공적으로 삭제되었습니다.');
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
    refetch(); // Refetch data after deletion
  };

  // 선택된 사용자들 일괄 삭제
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      toast.error('삭제할 사용자를 선택해주세요.');
      return;
    }

    const confirmMessage = selectedUsers.length === 1 
      ? '선택한 사용자를 삭제하시겠습니까?' 
      : `선택한 ${selectedUsers.length}명의 사용자를 삭제하시겠습니까?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    // TODO: Implement actual bulk deletion API call
    toast.success(`${selectedUsers.length}명의 사용자가 성공적으로 삭제되었습니다.`);
    setSelectedUsers([]);
    refetch(); // Refetch data after bulk deletion
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && users) {
      setSelectedUsers(users.map(user => user.user_id));
    } else {
      setSelectedUsers([]);
    }
  };

  // 통계 계산
  const totalUsers = users?.length || 0;
  const verifiedUsers = users?.filter(u => u.email_confirmed_at).length || 0;
  const adminUsers = users?.filter(u => u.is_admin).length || 0;
  const recentUsers = users?.filter(u => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(u.created_at) > oneWeekAgo;
  }).length || 0;

  if (loadingState) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-64"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-96"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-32 animate-pulse"></div>
              ))}
            </div>
            <div className="bg-white rounded-xl h-96 animate-pulse"></div>
          </div>
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
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Enterprise User Management</h1>
                    <p className="text-sm text-gray-500 font-medium">통합 사용자 관리 플랫폼 • v2.1.4</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                  <MonitorSpeaker className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">시스템 정상</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                
                <button className="relative p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-semibold">2</span>
                </button>
                
                <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                  <Settings className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{adminInfo.name.charAt(0)}</span>
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">{adminInfo.name}</p>
                    <p className="text-gray-500 text-xs">{adminInfo.department}</p>
                    <p className="text-gray-400 text-xs">{adminInfo.email} • 관리자</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] ml-8 mr-auto px-8 py-8">
          {/* 고급 KPI 대시보드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <AdvancedStatsCard 
              title="Total Users" 
              value={totalUsers.toString()} 
              change={0}
              icon={Archive}
              color="blue"
              subtitle="전체 등록 사용자"
            />
            <AdvancedStatsCard 
              title="Admin Users" 
              value={adminUsers.toString()} 
              change={0}
              icon={Shield}
              color="emerald"
              subtitle="관리자 권한 사용자"
            />
            <AdvancedStatsCard 
              title="Verified Users" 
              value={verifiedUsers.toString()} 
              change={0}
              icon={UserCheck}
              color="purple"
              subtitle="이메일 인증 완료"
            />
            <AdvancedStatsCard 
              title="Recent Joins" 
              value={recentUsers.toString()} 
              change={0}
              icon={TrendingUp}
              color="orange"
              subtitle="최근 7일 신규 가입"
            />
          </div>

          {/* 탭 네비게이션 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
            <div className="border-b border-gray-200 px-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'all', label: '전체 사용자', count: totalUsers },
                  { id: 'admin', label: '관리자', count: adminUsers },
                  { id: 'regular', label: '일반 사용자', count: totalUsers - adminUsers },
                  { id: 'verified', label: '인증 완료', count: verifiedUsers },
                  { id: 'unverified', label: '미인증', count: totalUsers - verifiedUsers }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setCurrentPage(1);
                    }}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* 고급 검색 및 필터 */}
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="이메일, 이름, 부서로 검색..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm placeholder:text-gray-400"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="부서 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 부서</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`p-3 transition-colors ${
                        viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-3 border-l border-gray-200 transition-colors ${
                        viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 고급 데이터 테이블 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                    checked={(users?.length || 0) > 0 && selectedUsers.length === (users?.length || 0)}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    총 {totalUsers}명 사용자 • {users?.length || 0}명 표시 중
                    {selectedUsers.length > 0 && (
                      <span className="ml-2 text-blue-600">
                        • {selectedUsers.length}명 선택됨
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    실시간 동기화됨
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedUsers.length > 0 
                        ? 'text-red-700 bg-red-50 hover:bg-red-100' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={handleBulkDelete}
                    disabled={selectedUsers.length === 0 || isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                    선택 삭제 ({selectedUsers.length})
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-gray-700 font-semibold">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                        checked={(users?.length || 0) > 0 && selectedUsers.length === (users?.length || 0)}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold">사용자 정보</TableHead>
                    <TableHead className="text-gray-700 font-semibold">부서</TableHead>
                    <TableHead className="text-gray-700 font-semibold">권한</TableHead>
                    <TableHead className="text-gray-700 font-semibold">인증 상태</TableHead>
                    <TableHead className="text-gray-700 font-semibold">가입일</TableHead>
                    <TableHead className="text-center text-gray-700 font-semibold">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow 
                      key={user.user_id} 
                      className="border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={() => handleEditUser(user)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                          checked={selectedUsers.includes(user.user_id)}
                          onChange={(e) => handleSelectUser(user.user_id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center border border-blue-200 shadow-sm">
                            <span className="text-blue-700 font-bold text-sm">
                              {(user.display_name || user.account_name || user.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 text-sm">{user.display_name || user.account_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Building className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{user.department_name || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.is_admin 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.is_admin ? (
                            <>
                              <Shield className="w-3 h-3 mr-1" />
                              관리자
                            </>
                          ) : (
                            <>
                              <Users className="w-3 h-3 mr-1" />
                              일반사용자
                            </>
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.email_confirmed_at ? 'default' : 'destructive'} 
                          className={user.email_confirmed_at 
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200'
                          }
                        >
                          {user.email_confirmed_at ? (
                            <><Check className="h-3 w-3 mr-1" />인증완료</>
                          ) : (
                            <><X className="h-3 w-3 mr-1" />미인증</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">{new Date(user.created_at).toLocaleDateString('ko-KR')}</div>
                        <div className="text-xs text-gray-500">{new Date(user.created_at).toLocaleTimeString('ko-KR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</div>
                      </TableCell>
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="편집"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className={`p-2.5 text-gray-400 rounded-lg transition-all ${
                              user.status === 'active' 
                                ? 'hover:text-orange-600 hover:bg-orange-50' 
                                : 'hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={user.status === 'active' ? '비활성화' : '활성화'}
                            onClick={() => handleStatusChange(user.user_id, user.status === 'active' ? 'inactive' : 'active')}
                          >
                            {user.status === 'active' ? (
                              <PowerOff className="w-4 h-4" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </button>
                          <button 
                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            onClick={() => handleDeleteUser(user)}
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* TODO: Implement pagination when needed */}
          </div>
        </div>
      </div>

      {/* 편집 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              사용자 정보 수정
            </DialogTitle>
            <DialogDescription>
              {editingUser ? (
                <div className="mt-2 space-y-1">
                  <p><strong>{editingUser.email}</strong> 사용자의 정보를 수정합니다.</p>
                  <p className="text-xs text-gray-500">현재 이름: {editingUser.display_name || editingUser.account_name || '미설정'}</p>
                  <p className="text-xs text-gray-500">현재 부서: {editingUser.department_name || '미지정'}</p>
                </div>
              ) : (
                '사용자의 정보를 수정할 수 있습니다.'
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="display_name" className="text-right">
                이름
              </Label>
              <Input
                id="display_name"
                value={editForm.display_name}
                onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                부서
              </Label>
              <Select 
                value={editForm.department_id} 
                onValueChange={(value) => setEditForm(prev => ({ ...prev, department_id: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="부서를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_admin" className="text-right">
                관리자
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="is_admin"
                  checked={editForm.is_admin}
                  onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, is_admin: checked }))}
                />
                <Label htmlFor="is_admin" className="text-sm">
                  {editForm.is_admin ? '관리자' : '일반사용자'}
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleUpdateUser}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-[240px] w-[240px] p-4">
          <DialogHeader className="pb-3">
            <DialogTitle className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="h-3 w-3" />
              사용자 삭제 확인
            </DialogTitle>
            <DialogDescription className="text-xs mt-2">
              정말로 <strong>{userToDelete?.email}</strong> 사용자를 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 text-xs px-2 py-1.5 h-8">
              취소
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser} className="flex-1 text-xs px-2 py-1.5 h-8">
              <Trash2 className="h-3 w-3 mr-1" />
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}