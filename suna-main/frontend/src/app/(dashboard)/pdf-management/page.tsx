'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Trash2,
  RotateCcw,
  Search,
  FileText,
  ArrowLeft,
  Check,
  Users,
  AlertTriangle,
  CheckCircle,
  Eye,
  Clock,
  ArrowUpDown,
  Building,
  FileImage,
  ChevronDown,
  Filter,
  Download,
  MoreVertical,
  Grid3X3,
  List,
  Star,
  Share2,
  FolderOpen,
  Plus,
  Settings,
  Bell,
  User,
  Sparkles,
  Zap,
  TrendingUp,
  ChevronRight,
  BarChart3,
  Activity,
  Database,
  Shield,
  Calendar,
  Tag,
  Archive,
  ExternalLink,
  Bookmark,
  History,
  Globe,
  Lock,
  FileCheck,
  AlertCircle,
  Layers,
  MonitorSpeaker,
  Cpu,
  HardDrive
} from 'lucide-react';
import DocumentMetadataPanel from './DocumentMetadataPanel';

// 타입 정의
interface UserInfo {
  id: string;
  name: string;
  email: string;
  department: string;
  is_admin: boolean;
}

interface NormalizedPDF {
  id: string;
  fileName: string;
  original: string;
  docType: string;
  dept: string;
  createdAt: string;
  size: string;
  status: string;
  version: string;
  accessLevel: string;
  tags: string[];
  downloadCount: number;
  category?: string;
  description?: string;
}

const DOC_TYPE = {
  COMMON: 'common',
  DEPT: 'dept',
} as const;

// 파일 크기 포맷팅
const formatStorageSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 날짜 포맷팅
const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

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

// 빠른 액션 버튼 컴포넌트
interface QuickActionButtonProps {
  icon: React.ComponentType<any>;
  label: string;
  onClick: () => void;
  variant?: "default" | "primary" | "success";
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon: Icon, label, onClick, variant = "default" }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed transition-all duration-200 group ${
      variant === 'primary' 
        ? 'border-blue-300 hover:border-blue-400 hover:bg-blue-50/50 text-blue-700' 
        : variant === 'success'
        ? 'border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50/50 text-emerald-700'
        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700'
    }`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
      variant === 'primary' 
        ? 'bg-blue-100 group-hover:bg-blue-200' 
        : variant === 'success'
        ? 'bg-emerald-100 group-hover:bg-emerald-200'
        : 'bg-gray-100 group-hover:bg-gray-200'
    }`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="text-left">
      <p className="font-semibold text-sm">{label.split(' - ')[0]}</p>
      <p className="text-xs opacity-75">{label.split(' - ')[1] || ''}</p>
    </div>
    <Upload className="w-4 h-4 opacity-40 group-hover:opacity-60 transition-opacity ml-auto" />
  </button>
);

export default function PDFManagement() {
  // 가짜 사용자 데이터
  const userInfo: UserInfo = {
    id: '1',
    name: '김철수',
    email: 'kimcs@company.com',
    department: '개발팀',
    is_admin: true
  };

  const [pdfList, setPdfList] = useState<NormalizedPDF[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'success' | 'error' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at',
    direction: 'desc' as 'asc' | 'desc'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterTag, setFilterTag] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [totalCount, setTotalCount] = useState(0);
  const [totalStats, setTotalStats] = useState({
    all: 15,
    common: 8,
    dept: 7
  });

  // 패널 관련 state
  const [panelMode, setPanelMode] = useState<'upload' | 'edit' | 'hidden'>('hidden');
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [editingDocument, setEditingDocument] = useState<any>(null);
  
  // 부서 목록 상태
  const departments = ['개발팀', '기획팀', '디자인팀', '영업팀', '마케팅팀'];

  const deptFileInputRef = useRef<HTMLInputElement>(null);
  const commonFileInputRef = useRef<HTMLInputElement>(null);

  // 가짜 PDF 데이터
  const generateMockPDFs = (): NormalizedPDF[] => {
    const mockData = [
      {
        id: '1',
        fileName: '2024년 1분기 개발 보고서',
        original: '2024_Q1_development_report.pdf',
        docType: '부서문서',
        dept: '개발팀',
        createdAt: '2024-03-15 14:30',
        size: '2.4 MB',
        status: '활성',
        version: 'v1.0',
        accessLevel: 'restricted',
        tags: ['보고서', '개발', '분기'],
        downloadCount: 45,
        category: '보고서',
        description: '1분기 개발팀 성과 및 목표 달성 현황'
      },
      {
        id: '2',
        fileName: '전사 보안 가이드라인',
        original: 'company_security_guideline.pdf',
        docType: '전사공통',
        dept: 'IT팀',
        createdAt: '2024-02-20 10:15',
        size: '5.2 MB',
        status: '활성',
        version: 'v2.1',
        accessLevel: 'public',
        tags: ['보안', '가이드라인', '정책'],
        downloadCount: 128,
        category: '정책/가이드라인',
        description: '전사 보안 정책 및 준수 사항'
      },
      {
        id: '3',
        fileName: 'API 설계 문서',
        original: 'api_design_document.pdf',
        docType: '부서문서',
        dept: '개발팀',
        createdAt: '2024-03-22 16:45',
        size: '1.8 MB',
        status: '활성',
        version: 'v1.2',
        accessLevel: 'restricted',
        tags: ['API', '설계', '개발'],
        downloadCount: 23,
        category: '기술문서',
        description: 'RESTful API 설계 및 구현 가이드'
      },
      {
        id: '4',
        fileName: '마케팅 전략 기획서',
        original: 'marketing_strategy_2024.pdf',
        docType: '부서문서',
        dept: '마케팅팀',
        createdAt: '2024-01-10 09:20',
        size: '3.7 MB',
        status: '활성',
        version: 'v1.0',
        accessLevel: 'restricted',
        tags: ['마케팅', '전략', '기획'],
        downloadCount: 67,
        category: '기획서',
        description: '2024년 마케팅 전략 및 실행 계획'
      },
      {
        id: '5',
        fileName: '신입사원 교육 매뉴얼',
        original: 'new_employee_manual.pdf',
        docType: '전사공통',
        dept: '인사팀',
        createdAt: '2024-01-05 11:30',
        size: '4.1 MB',
        status: '활성',
        version: 'v3.0',
        accessLevel: 'public',
        tags: ['교육', '매뉴얼', '신입사원'],
        downloadCount: 89,
        category: '교육/훈련',
        description: '신입사원 온보딩 및 교육 과정'
      }
    ];

    return mockData;
  };

  // 데이터 초기화
  useEffect(() => {
    const mockPdfs = generateMockPDFs();
    setPdfList(mockPdfs);
    setTotalCount(mockPdfs.length);
  }, []);

  // 파일 업로드 처리
  const handleFileUpload = async (files: FileList | null, type: 'common' | 'dept') => {
    if (!files || files.length === 0) return;

    if (type === 'common' && !userInfo.is_admin) {
      alert('전사공통 문서는 관리자만 업로드할 수 있습니다.');
      return;
    }

    const file = files[0];
    setUploadingFile(file);
    setPanelMode('upload');
  };

  // 문서 수정 처리
  const handleDocumentEdit = (doc: NormalizedPDF) => {
    setEditingDocument(doc);
    setPanelMode('edit');
  };

  // 문서 삭제 처리
  const handleDocumentDelete = async (documentId: string) => {
    if (!confirm('정말로 이 문서를 삭제하시겠습니까?')) {
      return;
    }

    setIsLoading(true);
    
    // 시뮬레이션
    setTimeout(() => {
      setPdfList(prev => prev.filter(pdf => pdf.id !== documentId));
      setUploadStatus('success');
      setIsLoading(false);
      setTimeout(() => setUploadStatus(null), 3000);
    }, 1000);
  };

  // 문서 다운로드 처리
  const handleDocumentDownload = async (documentId: string, fileName: string) => {
    // 시뮬레이션
    console.log(`다운로드: ${fileName}`);
    alert(`${fileName} 다운로드 시작`);
  };

  // 선택된 문서들 다운로드 처리
  const handleSelectedDownload = async () => {
    if (selectedFiles.length === 0) {
      alert('다운로드할 문서를 선택해주세요.');
      return;
    }

    alert(`${selectedFiles.length}개 문서 다운로드 시작`);
    setSelectedFiles([]);
  };

  // 선택된 문서들 삭제 처리
  const handleSelectedDelete = async () => {
    if (selectedFiles.length === 0) {
      alert('삭제할 문서를 선택해주세요.');
      return;
    }

    const confirmMessage = selectedFiles.length === 1 
      ? '선택한 문서를 삭제하시겠습니까?' 
      : `선택한 ${selectedFiles.length}개의 문서를 삭제하시겠습니까?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsLoading(true);
    
    // 시뮬레이션
    setTimeout(() => {
      setPdfList(prev => prev.filter(pdf => !selectedFiles.includes(pdf.id)));
      setSelectedFiles([]);
      setUploadStatus('success');
      setIsLoading(false);
      setTimeout(() => setUploadStatus(null), 3000);
    }, 1000);
  };

  // 체크박스 선택 처리
  const handleSelectFile = (fileId: string, checked: boolean) => {
    if (checked) {
      setSelectedFiles(prev => [...prev, fileId]);
    } else {
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
    }
  };

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFiles(currentItems.map(item => item.id));
    } else {
      setSelectedFiles([]);
    }
  };

  // 데이터 처리
  const filteredPdfs = pdfList.filter(pdf => {
    const matchesSearch = searchTerm === '' || 
      pdf.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pdf.dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pdf.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'common' && pdf.docType === '전사공통') ||
      (activeTab === 'dept' && pdf.docType === '부서문서');

    return matchesSearch && matchesTab;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredPdfs.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredPdfs.length / itemsPerPage);

  const getAccessLevelBadge = (level: string) => {
    switch(level) {
      case 'public':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Globe className="w-3 h-3 mr-1" />공개
        </span>;
      case 'restricted':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Lock className="w-3 h-3 mr-1" />제한
        </span>;
      case 'confidential':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Shield className="w-3 h-3 mr-1" />기밀
        </span>;
      default:
        return null;
    }
  };

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
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Enterprise Document Hub</h1>
                    <p className="text-sm text-gray-500 font-medium">통합 문서 관리 플랫폼 • v2.1.4</p>
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
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-semibold">3</span>
                </button>
                
                <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                  <Settings className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{userInfo.name.charAt(0)}</span>
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">{userInfo.name}</p>
                    <p className="text-gray-500 text-xs">{userInfo.department}</p>
                    <p className="text-gray-400 text-xs">{userInfo.email} • {userInfo.is_admin ? '관리자' : '사용자'}</p>
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
              title="Total Documents" 
              value={totalStats.all.toLocaleString()} 
              change={12}
              icon={Archive}
              color="blue"
              subtitle="지난 30일간 활동"
            />
            <AdvancedStatsCard 
              title="Enterprise Shared" 
              value={totalStats.common.toLocaleString()} 
              change={8}
              icon={Globe}
              color="emerald"
              subtitle="전사 공통 문서"
            />
            <AdvancedStatsCard 
              title="Department Files" 
              value={totalStats.dept.toLocaleString()} 
              change={-3}
              icon={Building}
              color="purple"
              subtitle="부서별 전용 문서"
            />
            <AdvancedStatsCard 
              title="Storage Usage" 
              value={formatStorageSize(pdfList.reduce((total, pdf) => total + (parseInt(pdf.size.replace(/[^\d.]/g, '')) * 1024 * 1024), 0))} 
              change={15}
              icon={HardDrive}
              color="orange"
              subtitle={`총 ${pdfList.length}개 파일`}
            />
          </div>

          {/* 탭 네비게이션 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
            <div className="border-b border-gray-200 px-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'all', label: '전체 문서', count: totalStats.all },
                  { id: 'common', label: '전사 공통', count: totalStats.common },
                  { id: 'dept', label: '부서 문서', count: totalStats.dept }
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
                      placeholder="문서명, 작성자, 부서, 태그로 검색..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm placeholder:text-gray-400"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                    <Filter className="w-4 h-4" />
                    고급 필터
                  </button>
                  
                  <button className="flex items-center gap-2 px-4 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                    <Calendar className="w-4 h-4" />
                    날짜 범위
                  </button>
                  
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

          {/* 업로드 액션 섹션 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">문서 업로드</h3>
                <p className="text-sm text-gray-500 mt-1">새로운 PDF 문서를 시스템에 추가하세요</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Cpu className="w-4 h-4" />
                <span>최대 50MB • PDF 전용</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuickActionButton
                icon={Users}
                label="부서 문서 업로드 - 팀 내부 문서 및 보고서"
                onClick={() => deptFileInputRef.current?.click()}
                variant="primary"
              />
              <input
                ref={deptFileInputRef}
                type="file"
                multiple
                accept=".pdf"
                onChange={(e) => handleFileUpload(e.target.files, 'dept')}
                className="hidden"
              />

              {userInfo.is_admin && (
                <>
                  <QuickActionButton
                    icon={Globe}
                    label="전사 공통 문서 - 정책, 가이드라인 등"
                    onClick={() => commonFileInputRef.current?.click()}
                    variant="success"
                  />
                  <input
                    ref={commonFileInputRef}
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(e.target.files, 'common')}
                    className="hidden"
                  />
                </>
              )}
            </div>
          </div>

          {/* 상태 알림 */}
          {isLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-blue-600 animate-spin" />
              <div>
                <p className="text-blue-800 font-medium">문서를 처리하고 있습니다</p>
                <p className="text-blue-600 text-sm">파일을 처리하고 메타데이터를 추출하는 중...</p>
              </div>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-emerald-800 font-medium">작업이 완료되었습니다</p>
                <p className="text-emerald-600 text-sm">문서가 성공적으로 처리되었습니다</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-red-800 font-medium">오류가 발생했습니다</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* 고급 데이터 테이블 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                    checked={currentItems.length > 0 && selectedFiles.length === currentItems.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    총 {filteredPdfs.length}개 문서 • {currentItems.length}개 표시 중
                    {selectedFiles.length > 0 && (
                      <span className="ml-2 text-blue-600">
                        • {selectedFiles.length}개 선택됨
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
                      selectedFiles.length > 0 
                        ? 'text-blue-700 bg-blue-50 hover:bg-blue-100' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={handleSelectedDownload}
                    disabled={selectedFiles.length === 0 || isLoading}
                  >
                    <Download className="w-4 h-4" />
                    선택 다운로드 ({selectedFiles.length})
                  </button>
                  <button 
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedFiles.length > 0 
                        ? 'text-red-700 bg-red-50 hover:bg-red-100' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={handleSelectedDelete}
                    disabled={selectedFiles.length === 0 || isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                    선택 삭제 ({selectedFiles.length})
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                        checked={currentItems.length > 0 && selectedFiles.length === currentItems.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">문서 정보</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">분류</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">소유 부서</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">업로드 일시</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">크기</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">접근 권한</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">다운로드</th>
                    <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map((pdf, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={() => handleDocumentEdit(pdf)}
                    >
                      <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                          checked={selectedFiles.includes(pdf.id)}
                          onChange={(e) => handleSelectFile(pdf.id, e.target.checked)}
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center border border-red-200 shadow-sm">
                            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" 
                                    fill="#fca5a5" stroke="#dc2626" strokeWidth="1.5"/>
                              <path d="M14 2v6h6" stroke="#dc2626" strokeWidth="1.5" fill="none"/>
                              <text x="12" y="16" textAnchor="middle" className="text-xs font-bold fill-red-700">PDF</text>
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 text-sm truncate">{pdf.fileName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500">{pdf.version}</p>
                              {pdf.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {pdf.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                      {tag}
                                    </span>
                                  ))}
                                  {pdf.tags.length > 2 && (
                                    <span className="text-xs text-gray-400">+{pdf.tags.length - 2}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          pdf.docType === '전사공통' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {pdf.docType === '전사공통' ? (
                            <Globe className="w-3 h-3 mr-1" />
                          ) : (
                            <Building className="w-3 h-3 mr-1" />
                          )}
                          {pdf.docType}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Building className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{pdf.dept}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900">{pdf.createdAt.split(' ')[0]}</div>
                        <div className="text-xs text-gray-500">{pdf.createdAt.split(' ')[1]}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-mono text-gray-600">{pdf.size}</span>
                      </td>
                      <td className="py-4 px-6">
                        {getAccessLevelBadge(pdf.accessLevel)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{pdf.downloadCount}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="미리보기"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            onClick={() => handleDocumentDownload(pdf.id, pdf.original)}
                            title="다운로드"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            onClick={() => handleDocumentDelete(pdf.id)}
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 고급 페이지네이션 */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}</span>
                    -
                    <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filteredPdfs.length)}</span>
                    개 표시 중 • 총 
                    <span className="font-medium text-gray-900"> {filteredPdfs.length}</span>개
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      이전
                    </button>
                    
                    <div className="flex gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, index) => {
                        const pageNum = currentPage <= 3 ? index + 1 : currentPage - 2 + index;
                        if (pageNum > totalPages) return null;
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      다음
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 오른쪽 패널 */}
      <DocumentMetadataPanel
        mode={panelMode}
        uploadingFile={uploadingFile}
        editingDocument={editingDocument}
        userDepartment={userInfo.department}
        userName={userInfo.name}
        isAdmin={userInfo.is_admin}
        departments={departments}
        onSave={async (metadata) => {
          console.log('저장된 메타데이터:', metadata);
          
          if (panelMode === 'upload' && uploadingFile) {
            // 새 문서 추가 시뮬레이션
            const newDoc: NormalizedPDF = {
              id: String(Date.now()),
              fileName: uploadingFile.name.replace('.pdf', ''),
              original: uploadingFile.name,
              docType: metadata.type === 'common' ? '전사공통' : '부서문서',
              dept: metadata.department,
              createdAt: formatDate(new Date()),
              size: formatStorageSize(uploadingFile.size),
              status: '활성',
              version: metadata.version || 'v1.0',
              accessLevel: metadata.accessLevel || 'public',
              tags: metadata.tags || [],
              downloadCount: 0,
              category: metadata.category,
              description: metadata.description
            };
            
            setPdfList(prev => [newDoc, ...prev]);
            setUploadStatus('success');
            setTimeout(() => setUploadStatus(null), 3000);
          } else if (panelMode === 'edit' && editingDocument) {
            // 기존 문서 수정 시뮬레이션
            setPdfList(prev => prev.map(pdf => 
              pdf.id === editingDocument.id 
                ? {
                    ...pdf,
                    fileName: metadata.fileName || pdf.fileName,
                    docType: metadata.type === 'common' ? '전사공통' : '부서문서',
                    dept: metadata.department || pdf.dept,
                    version: metadata.version || pdf.version,
                    accessLevel: metadata.accessLevel || pdf.accessLevel,
                    tags: metadata.tags || pdf.tags,
                    category: metadata.category,
                    description: metadata.description
                  }
                : pdf
            ));
            setUploadStatus('success');
            setTimeout(() => setUploadStatus(null), 3000);
          }
          
          setPanelMode('hidden');
          setUploadingFile(null);
          setEditingDocument(null);
        }}
        onCancel={() => {
          setPanelMode('hidden');
          setUploadingFile(null);
          setEditingDocument(null);
        }}
      />
    </div>
  );
}