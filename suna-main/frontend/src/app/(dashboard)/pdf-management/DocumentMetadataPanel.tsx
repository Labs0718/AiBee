import React, { useState, useEffect } from 'react';
import {
  Upload,
  Trash2,
  Save,
  X,
  Tag,
  Building,
  Globe,
  Lock,
  Shield,
  Calendar,
  FileText,
  Edit3,
  Info,
  AlertCircle,
  CheckCircle,
  Plus,
  ChevronDown,
  RotateCcw,
  User
} from 'lucide-react';

interface PDFFile {
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

interface DocumentMetadataPanelProps {
  mode: 'upload' | 'edit' | 'hidden';
  uploadingFile?: File | null;
  editingDocument?: PDFFile | null;
  userDepartment: string;
  userName: string;
  isAdmin: boolean;
  onSave: (metadata: any) => void;
  onCancel: () => void;
  departments: string[];
  initialDocumentType?: 'common' | 'dept';
}

const DocumentMetadataPanel: React.FC<DocumentMetadataPanelProps> = ({
  mode,
  uploadingFile,
  editingDocument,
  userDepartment,
  userName,
  isAdmin,
  onSave,
  onCancel,
  departments,
  initialDocumentType = 'dept'
}) => {
  const [formData, setFormData] = useState({
    fileName: '',
    type: initialDocumentType,
    department: userDepartment,
    accessLevel: 'public' as 'public' | 'restricted' | 'confidential',
    tags: [] as string[],
    version: 'v1.0',
    category: '',
    description: '',
    creator: userName
  });

  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 미리 정의된 태그들
  const predefinedTags = [
    '사업계획', '전략', '가이드', '월간보고서', '분기보고서', '연간보고서',
    'AI', '디지털혁신', '프로젝트', '제안서', '정책', '가이드라인',
    '인사', '재무', '마케팅', '영업', 'IT', '개발', '운영', '품질',
    '기획', '분석', '연구', '교육', '매뉴얼', '프로세스'
  ];

  const categories = [
    '경영전략', '사업계획', '재무관리', '인사관리', '마케팅',
    'IT/디지털', '운영관리', '품질관리', '연구개발', '법무/컴플라이언스',
    '교육/훈련', '프로젝트', '보고서', '정책/가이드라인', '기타'
  ];

  // initialDocumentType이 변경될 때 formData 업데이트
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      type: initialDocumentType
    }));
  }, [initialDocumentType]);

  useEffect(() => {
    if (mode === 'upload' && uploadingFile) {
      setFormData(prev => ({
        ...prev,
        fileName: uploadingFile.name.replace('.pdf', ''),
        type: initialDocumentType,
        department: userDepartment,
        accessLevel: 'restricted',
        creator: userName
      }));
    } else if (mode === 'edit' && editingDocument) {
      setFormData({
        fileName: editingDocument.fileName || '',
        type: editingDocument.docType === '전사공통' ? 'common' : 'dept',
        department: editingDocument.dept || '',
        accessLevel: editingDocument.accessLevel as 'public' | 'restricted' | 'confidential' || 'public',
        tags: editingDocument.tags || [],
        version: editingDocument.version || 'v1.0',
        category: editingDocument.category || '',
        description: editingDocument.description || '',
        creator: userName
      });
    }
  }, [mode, uploadingFile, editingDocument, userDepartment, userName]);

  // 문서 분류 변경 시 접근 권한 자동 설정
  useEffect(() => {
    if (formData.type === 'common') {
      setFormData(prev => ({ ...prev, accessLevel: 'public' }));
    } else if (formData.type === 'dept') {
      setFormData(prev => ({ ...prev, accessLevel: 'restricted' }));
    }
  }, [formData.type]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션
      onSave(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const getAccessLevelIcon = (level: string) => {
    switch(level) {
      case 'public': return <Globe className="w-4 h-4" />;
      case 'restricted': return <Lock className="w-4 h-4" />;
      case 'confidential': return <Shield className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch(level) {
      case 'public': return 'text-green-600 bg-green-50 border-green-200';
      case 'restricted': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  if (mode === 'hidden') return null;

  return (
    <div className="w-1/4 bg-white border-l border-gray-200 shadow-lg flex flex-col h-full">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              mode === 'upload' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-orange-100 text-orange-600'
            }`}>
              {mode === 'upload' ? <Upload className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {mode === 'upload' ? '문서 업로드' : '문서 정보 수정'}
              </h3>
              <p className="text-sm text-gray-500">
                {mode === 'upload' ? '메타데이터를 입력하세요' : '문서 정보를 수정하세요'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 내용 */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* 파일 정보 */}
        {mode === 'upload' && uploadingFile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">{uploadingFile.name}</p>
                <p className="text-sm text-blue-600">
                  {(uploadingFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 문서명 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            문서명 *
          </label>
          <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>{formData.fileName || (uploadingFile ? uploadingFile.name.replace('.pdf', '') : '문서명')}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">PDF 파일의 원본 이름이 자동으로 설정됩니다</p>
        </div>

        {/* 문서 타입 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            문서 분류 *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleInputChange('type', 'dept')}
              disabled={!isAdmin && formData.type === 'common'}
              className={`p-3 border-2 rounded-lg transition-all ${
                formData.type === 'dept'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Building className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xs font-medium">부서 문서</div>
            </button>
            <button
              onClick={() => isAdmin && handleInputChange('type', 'common')}
              disabled={!isAdmin}
              className={`p-3 border-2 rounded-lg transition-all ${
                formData.type === 'common'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 hover:border-gray-300'
              } ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Globe className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xs font-medium">전사 공통</div>
            </button>
          </div>
          {!isAdmin && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
              <AlertCircle className="w-3 h-3 inline mr-1" />
              전사 공통 문서는 관리자만 업로드할 수 있습니다
            </p>
          )}
        </div>

        {/* 업로드 부서 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            업로드 부서 *
          </label>
          <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-gray-400" />
              <span>{userDepartment}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {formData.type === 'dept' 
              ? `부서 문서는 ${userDepartment}에서만 접근 가능합니다`
              : '전사 공통 문서는 모든 부서에서 접근 가능합니다'
            }
          </p>
        </div>

        {/* 접근 권한 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            접근 권한 *
          </label>
          <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getAccessLevelColor(formData.accessLevel)}`}>
                {getAccessLevelIcon(formData.accessLevel)}
              </div>
              <div>
                <div className="font-medium">
                  {formData.accessLevel === 'public' ? '공개' : '제한'}
                </div>
                <div className="text-xs text-gray-500">
                  {formData.accessLevel === 'public' 
                    ? '모든 직원이 접근 가능' 
                    : '부서 내 또는 권한자만'
                  }
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            문서 분류에 따라 자동으로 설정됩니다 (전사공통: 공개, 부서문서: 제한)
          </p>
        </div>

        {/* 카테고리 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            카테고리
          </label>
          <div className="relative">
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none"
            >
              <option value="">카테고리 선택</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* 태그 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            태그
          </label>
          
          {/* 현재 태그들 */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* 태그 입력 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag(newTag)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="새 태그 입력"
            />
            <button
              onClick={() => addTag(newTag)}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* 미리 정의된 태그들 */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500">추천 태그:</p>
            <div className="flex flex-wrap gap-1">
              {predefinedTags.filter(tag => !formData.tags.includes(tag)).slice(0, 12).map(tag => (
                <button
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 버전 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            버전
          </label>
          <input
            type="text"
            value={formData.version}
            onChange={(e) => handleInputChange('version', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="예: v1.0, v2.1"
          />
        </div>

        {/* 작성자 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            작성자 *
          </label>
          <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span>{userName}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            작성자는 현재 로그인한 사용자로 자동 설정됩니다
          </p>
        </div>

        {/* 비고 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            비고
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
            placeholder="문서에 대한 추가 정보나 메모를 입력하세요"
          />
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.fileName || isLoading}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                처리중...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {mode === 'upload' ? '업로드' : '저장'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentMetadataPanel;