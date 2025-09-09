'use client';

import { Navbar } from '@/components/home/sections/navbar';
import { FooterSection } from '@/components/home/sections/footer-section';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50/30">
          <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                AiBee의 <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">기술 아키텍처</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                정부기관과 기업을 위한 차세대 AI 에이전트 플랫폼의 워크플로우와 핵심 기술을 소개합니다
              </p>
            </div>
          </div>
        </section>
        
        {/* AiBee Workflow Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
            <div className="text-center mb-16">
              <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full text-lg font-bold mb-8">
                AiBee Workflow
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                사용자 요청부터 결과 도출까지의 지능형 워크플로우
              </p>
            </div>
            
            {/* Main Workflow Diagram */}
            <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50/30 rounded-3xl p-8 lg:p-12 shadow-sm border border-gray-200 mb-16">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12">
                {/* User */}
                <div className="flex flex-col items-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border-2 border-blue-200">
                    <span className="text-3xl">👤</span>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">사용자</h3>
                    <p className="text-sm text-blue-600 font-medium">요청 → 분석</p>
                  </div>
                </div>
                
                <div className="flex items-center text-blue-400">
                  <div className="hidden lg:flex items-center">
                    <div className="w-16 h-0.5 bg-blue-300"></div>
                    <div className="text-2xl ml-2">→</div>
                  </div>
                </div>
                
                {/* AiBee Agent - Enhanced */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white p-8 rounded-3xl shadow-2xl group-hover:scale-105 transition-all duration-300 border-2 border-blue-500">
                    <div className="text-center relative">
                      <div className="text-2xl font-bold mb-2">AiBee</div>
                      <div className="text-sm opacity-90 bg-white/20 px-3 py-1 rounded-full">Agent Runner</div>
                      
                      {/* Connection lines to tools */}
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-blue-300 hidden lg:block"></div>
                    </div>
                  </div>
                  
                  {/* Tools positioned below AiBee */}
                  <div className="mt-8 grid grid-cols-2 gap-3 max-w-xs mx-auto">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 rounded-xl border-2 border-emerald-200 hover:shadow-md transition-all hover:scale-105">
                      <div className="text-center">
                        <div className="text-xs font-bold text-emerald-800 mb-1">Browser Tool</div>
                        <div className="text-[10px] text-emerald-600">• Playwright</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl border-2 border-purple-200 hover:shadow-md transition-all hover:scale-105">
                      <div className="text-center">
                        <div className="text-xs font-bold text-purple-800 mb-1">Search Tool</div>
                        <div className="text-[10px] text-purple-600">• Tavily API</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-xl border-2 border-amber-200 hover:shadow-md transition-all hover:scale-105">
                      <div className="text-center">
                        <div className="text-xs font-bold text-amber-800 mb-1">Vision Tool</div>
                        <div className="text-[10px] text-amber-600">• Claude Vision</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-3 rounded-xl border-2 border-cyan-200 hover:shadow-md transition-all hover:scale-105">
                      <div className="text-center">
                        <div className="text-xs font-bold text-cyan-800 mb-1">File Tool</div>
                        <div className="text-[10px] text-cyan-600">• 파일 관리</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-blue-400">
                  <div className="hidden lg:flex items-center">
                    <div className="w-16 h-0.5 bg-blue-300"></div>
                    <div className="text-2xl ml-2">→</div>
                  </div>
                </div>
                
                {/* Results */}
                <div className="flex flex-col items-center group">
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 rounded-2xl mb-4 group-hover:scale-105 transition-transform shadow-lg border-2 border-orange-400">
                    <div className="text-center">
                      <div className="text-lg font-bold mb-2">작업 & 결과</div>
                      <div className="text-sm opacity-90">
                        결과 보고<br/>
                        데이터 저장
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">결과 도출</h3>
                    <p className="text-sm text-orange-600 font-medium">실시간 전송 • 자동 저장</p>
                  </div>
                </div>
              </div>
              
              {/* Features List */}
              <div className="bg-white rounded-2xl p-6 border-2 border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  <span className="text-blue-600">AiBee 핵심 프로세스 특징</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">정확성</div>
                      <div className="text-xs text-gray-600">RAG 기반 정보 이해와 작업 정확 수행</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">자동화</div>
                      <div className="text-xs text-gray-600">다중 브라우저 실행 및 업무 자동화</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">보안성</div>
                      <div className="text-xs text-gray-600">안전한 샌드박스 환경에서 작업</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">실시간성</div>
                      <div className="text-xs text-gray-600">WebSocket 기반 즉시 결과 확인</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional Features Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border-2 border-blue-200 hover:shadow-lg transition-all hover:scale-105">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl">🎯</span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4 text-center">사용자 요청 이해</h4>
                <ul className="text-gray-700 space-y-2 text-sm">
                  <li>• 자연어 이해 및 의도 파악</li>
                  <li>• Agent Runner가 요청 분석</li>
                  <li>• 적합한 도구 선택 및 실행</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border-2 border-green-200 hover:shadow-lg transition-all hover:scale-105">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl">⚡</span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4 text-center">실시간 전송 처리</h4>
                <ul className="text-gray-700 space-y-2 text-sm">
                  <li>• Browser Tool로 크롬 제어</li>
                  <li>• Search Tool로 실시간 검색</li>
                  <li>• Vision Tool로 이미지 분석</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border-2 border-purple-200 hover:shadow-lg transition-all hover:scale-105">
                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl">📊</span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4 text-center">실시간 응답 전달</h4>
                <ul className="text-gray-700 space-y-2 text-sm">
                  <li>• Supabase DB/Storage에 저장</li>
                  <li>• WebSocket을 통해 실시간 전송</li>
                  <li>• 작업 결과의 즉시 확인</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* AiBee Architecture Section */}
        <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
          <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
            <div className="text-center mb-16">
              <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full text-lg font-bold mb-8">
                AiBee Architecture
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                확장 가능하고 안전한 4계층 아키텍처
              </p>
            </div>
            
            {/* Architecture Visual */}
            <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg border-2 border-gray-200 mb-16">
              <div className="space-y-6">
                {/* Application Layer */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Application Layer</h3>
                        <p className="text-blue-100 text-sm">사용자 인터페이스 및 보안 관리</p>
                      </div>
                    </div>
                    <div className="text-right text-sm space-y-1">
                      <div className="bg-white/20 px-3 py-1 rounded-full">Interactive UX, API Gateway, Observability & Governance, Enterprise Security</div>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="text-4xl text-blue-400">↓</div>
                </div>

                {/* Agent Orchestration Layer */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Agent Orchestration Layer</h3>
                        <p className="text-purple-100 text-sm">지능형 에이전트 조율 및 실행</p>
                      </div>
                    </div>
                    <div className="text-right text-sm space-y-1">
                      <div className="bg-white/20 px-3 py-1 rounded-full">Planning & Tools Execute, Memory & Context, Evaluation & Validation</div>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="text-4xl text-blue-400">↓</div>
                </div>

                {/* Model Serving Layer */}
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">🤖</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Model Serving Layer</h3>
                        <p className="text-emerald-100 text-sm">AI 모델 서빙 및 추론 엔진</p>
                      </div>
                    </div>
                    <div className="text-right text-sm space-y-1">
                      <div className="bg-white/20 px-3 py-1 rounded-full">Retrieval/Reranker, Prompt/Context Engine, Model Serving (vLLM), Policy Guideline</div>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="text-4xl text-blue-400">↓</div>
                </div>

                {/* Data & Platform Layer */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">💾</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Data & Platform Layer</h3>
                        <p className="text-orange-100 text-sm">데이터 관리 및 인프라 플랫폼</p>
                      </div>
                    </div>
                    <div className="text-right text-sm space-y-1">
                      <div className="bg-white/20 px-3 py-1 rounded-full">Data Source Collect/Refining, Vector Index & Storage, Platform/Infra, Monitor & DevOps</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Architecture Features */}
              <div className="mt-12 bg-gray-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  <span className="text-blue-600">AiBee</span> 아키텍처 주요 특징
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl">⚡</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">확장성</h4>
                    <p className="text-gray-600 text-sm">모듈형 아키텍처로 유연한 확장</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl">🔒</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">보안성</h4>
                    <p className="text-gray-600 text-sm">엔터프라이즈급 보안 체계</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl">🎯</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">정확성</h4>
                    <p className="text-gray-600 text-sm">컨텍스트 기반 정확한 처리</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl">⚙️</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">효율성</h4>
                    <p className="text-gray-600 text-sm">최적화된 리소스 관리</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Layer Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Layer Details */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white">👤</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Application Layer</h4>
                  </div>
                  <ul className="text-gray-700 space-y-2 text-sm">
                    <li>• 사용자 인터페이스 관리</li>
                    <li>• 엔터프라이즈급 보안 (API Gateway)</li>
                    <li>• 실시간 모니터링 & 거버넌스</li>
                    <li>• 옵저버빌리티 및 기업 정책 관리</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white">🎯</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Agent Orchestration Layer</h4>
                  </div>
                  <ul className="text-gray-700 space-y-2 text-sm">
                    <li>• 지능형 작업 계획 및 도구 실행</li>
                    <li>• 메모리 & 컨텍스트 관리</li>
                    <li>• 결과 검증 및 품질 평가</li>
                    <li>• 에이전트 간 협업 조율</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <span className="text-white">🤖</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Model Serving Layer</h4>
                  </div>
                  <ul className="text-gray-700 space-y-2 text-sm">
                    <li>• Claude, GPT 등 멀티 모델 지원</li>
                    <li>• vLLM 기반 고성능 추론 엔진</li>
                    <li>• RAG 기반 리트리벌 & 리랭커</li>
                    <li>• 정책 가이드라인 준수</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white">💾</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Data & Platform Layer</h4>
                  </div>
                  <ul className="text-gray-700 space-y-2 text-sm">
                    <li>• 데이터 수집 및 정제 파이프라인</li>
                    <li>• 벡터 인덱스 & 스토리지 최적화</li>
                    <li>• 플랫폼 인프라 자동화</li>
                    <li>• DevOps 및 모니터링</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AiBee 핵심 강점 Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                AiBee <span className="text-blue-600">핵심 강점</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                기업과 공공기관을 위한 차별화된 AI 솔루션
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="group hover:scale-105 transition-transform">
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-8 rounded-2xl border border-yellow-200 h-full">
                  <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-white text-2xl">🏆</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">스마트 오케스트레이션</h4>
                  <p className="text-gray-700">여러 AI 에이전트를 조율하여 복잡한 업무를 스마트하게 자동화합니다.</p>
                </div>
              </div>
              
              <div className="group hover:scale-105 transition-transform">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 h-full">
                  <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-white text-2xl">🔧</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">기업 환경 친화적</h4>
                  <p className="text-gray-700">온프레미스와 클라우드 환경을 모두 지원하여 기업에서 안전하게 활용할 수 있습니다.</p>
                </div>
              </div>
              
              <div className="group hover:scale-105 transition-transform">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200 h-full">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-white text-2xl">🚀</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">도메인 맞춤화</h4>
                  <p className="text-gray-700">그룹웨어와 기업 시스템을 연동하여 각 조직에 최적화된 서비스를 제공합니다.</p>
                </div>
              </div>
              
              <div className="group hover:scale-105 transition-transform">
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-8 rounded-2xl border border-purple-200 h-full">
                  <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-white text-2xl">📊</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">실시간 AI 처리</h4>
                  <p className="text-gray-700">RDB/PostgreSQL 기반의 안정적인 데이터 처리와 실시간 AI 분석을 제공합니다.</p>
                </div>
              </div>
              
              <div className="group hover:scale-105 transition-transform md:col-span-2 lg:col-span-2">
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-8 rounded-2xl border border-gray-200 h-full">
                  <div className="w-16 h-16 bg-gray-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-white text-2xl">☁️</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">On-Premise & Hybrid Cloud 지원</h4>
                  <p className="text-gray-700">VMware, Kubernetes, OpenShift 기반으로 기존 인프라에 유연하게 통합할 수 있습니다. 보안이 중요한 정부기관과 대기업 환경에서도 안전하게 운영 가능합니다.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  );
}