'use client';

import { Navbar } from '@/components/home/sections/navbar';
import { FooterSection } from '@/components/home/sections/footer-section';
import { FlickeringGrid } from '@/components/home/ui/flickering-grid';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useEffect, useState } from 'react';

export default function AboutPage() {
  const tablet = useMediaQuery('(max-width: 1024px)');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="pt-32 pb-24 bg-white relative overflow-hidden">
          {/* Background gradients - same as main home */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-white to-blue-100/30 -z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/20 via-transparent to-blue-50/30 -z-10"></div>
          
          {/* Left side flickering grid */}
          <div className="hidden sm:block absolute left-0 top-0 h-full w-1/4 sm:w-1/3 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background z-10" />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background via-background/90 to-transparent z-10" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/90 to-transparent z-10" />
            {mounted && (
              <FlickeringGrid
                className="h-full w-full"
                squareSize={tablet ? 2 : 2.5}
                gridGap={tablet ? 2 : 2.5}
                color="var(--secondary)"
                maxOpacity={tablet ? 0.2 : 0.4}
                flickerChance={tablet ? 0.015 : 0.03}
              />
            )}
          </div>

          {/* Right side flickering grid */}
          <div className="hidden sm:block absolute right-0 top-0 h-full w-1/4 sm:w-1/3 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-background z-10" />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background via-background/90 to-transparent z-10" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/90 to-transparent z-10" />
            {mounted && (
              <FlickeringGrid
                className="h-full w-full"
                squareSize={tablet ? 2 : 2.5}
                gridGap={tablet ? 2 : 2.5}
                color="var(--secondary)"
                maxOpacity={tablet ? 0.2 : 0.4}
                flickerChance={tablet ? 0.015 : 0.03}
              />
            )}
          </div>

          {/* Center content background */}
          <div className="absolute inset-x-0 sm:inset-x-1/6 md:inset-x-1/4 top-0 h-full -z-20 bg-background"></div>
          <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">S</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-tight">
                Suna AI Platform
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
                Enterprise-grade AI assistant platform designed for intelligent automation <br/>
                across all business domains
              </p>
              
              <div className="flex flex-wrap justify-center gap-12 mt-16">
                <div className="text-center">
                  <div className="text-2xl font-light text-gray-900">10+</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider">Tools</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light text-gray-900">4</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider">Layers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light text-gray-900">∞</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider">Possibilities</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section className="py-24 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light text-gray-900 mb-4">
                How Suna Works
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
                Intelligent AI assistant process from user request to result delivery
              </p>
            </div>
            
            {/* Main Workflow Diagram */}
            <div className="bg-white rounded-2xl p-8 lg:p-12 border-2 border-purple-200 shadow-xl mb-16 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full -ml-12 -mb-12 opacity-50"></div>
              
              <div className="relative">
                {/* Top Row - User to AI */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 mb-12">
                  {/* User */}
                  <div className="flex flex-col items-center group">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-4 border-2 border-blue-300 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">사용자</h3>
                      <p className="text-sm text-gray-600">요청 → 분석</p>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="flex items-center text-purple-400">
                    <div className="hidden lg:flex items-center">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                        <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Core */}
                  <div className="relative group">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-1">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                            <span className="text-blue-600 text-lg font-bold">S</span>
                          </div>
                          <div className="text-2xl font-bold">AiBee</div>
                        </div>
                        <div className="text-sm text-blue-200">Agent Runtime</div>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center text-purple-400">
                    <div className="hidden lg:flex items-center">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                        <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-green-400 rounded-full"></div>
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="flex flex-col items-center">
                    <div className="bg-gradient-to-br from-green-100 to-teal-100 p-6 rounded-2xl border-2 border-green-300 shadow-lg mb-4">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">자료 및 결과</h3>
                        <div className="flex items-center justify-center space-x-3 text-sm">
                          <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs">SupabaseDB</span>
                          <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs">Storage</span>
                          <span className="px-2 py-1 bg-red-200 text-red-800 rounded-full text-xs">WebSocket</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tools Section */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="text-center mb-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">통합된 AI 도구들</h4>
                    <p className="text-sm text-gray-600">다양한 업무를 처리하는 스마트 도구들</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200 hover:shadow-md transition-all duration-300 group">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                          </svg>
                        </div>
                        <div className="font-semibold text-gray-900 text-sm">Browser Tool</div>
                        <div className="text-xs text-gray-600">웹 자동화</div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300 group">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <div className="font-semibold text-gray-900 text-sm">Search Tool</div>
                        <div className="text-xs text-gray-600">실시간 API 검색</div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-300 group">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <div className="font-semibold text-gray-900 text-sm">Vision Tool</div>
                        <div className="text-xs text-gray-600">이미지 분석</div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 hover:shadow-md transition-all duration-300 group">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="font-semibold text-gray-900 text-sm">Files Tool</div>
                        <div className="text-xs text-gray-600">파일 관리</div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200 hover:shadow-md transition-all duration-300 group">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div className="font-semibold text-gray-900 text-sm">Sheets Tool</div>
                        <div className="text-xs text-gray-600">데이터 처리</div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200 hover:shadow-md transition-all duration-300 group">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <div className="font-semibold text-gray-900 text-sm">Deploy Tool</div>
                        <div className="text-xs text-gray-600">배포 관리</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Process Description */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">처리 과정</h4>
                      <p className="text-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        1. 사용자 요청을 자연어로 분석하고 의도를 파악합니다 <br/>
                        2. 최적의 도구를 자동 선택하여 실시간으로 작업을 수행합니다 <br/>
                        3. 처리 결과를 안전하게 저장하고 실시간으로 전달합니다 <br/>
                        4. 지속적인 모니터링을 통해 품질을 보장합니다
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Process Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Request Processing</h4>
                <p className="text-gray-600 text-sm">Natural language understanding and intent analysis with automated tool selection</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Real-time Execution</h4>
                <p className="text-gray-600 text-sm">Browser automation, web search, and image analysis with instant processing</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Response Delivery</h4>
                <p className="text-gray-600 text-sm">Secure database storage with WebSocket-based real-time result transmission</p>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light text-gray-900 mb-4">
                System Architecture
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
                Four-layer enterprise architecture for scalable AI operations
              </p>
            </div>
            
            {/* Architecture Layers */}
            <div className="bg-gray-50 rounded-lg p-8 lg:p-12 mb-16">
              <div className="space-y-6">
                {/* Application Layer */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">01</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Application Layer</h3>
                        <p className="text-gray-600 text-sm">User interface and security management</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Interactive UX • API Gateway • Enterprise Security</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>

                {/* Agent Orchestration Layer */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">02</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Agent Orchestration Layer</h3>
                        <p className="text-gray-600 text-sm">Intelligent agent coordination and execution</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Planning & Tools • Memory & Context • Evaluation</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>

                {/* Model Serving Layer */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">03</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Model Serving Layer</h3>
                        <p className="text-gray-600 text-sm">AI model serving and inference engine</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Retrieval/Reranker • Model Serving • Policy Guidelines</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>

                {/* Data & Platform Layer */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">04</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Data & Platform Layer</h3>
                        <p className="text-gray-600 text-sm">Data management and infrastructure platform</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Data Collection • Vector Storage • Platform/Infra</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 border border-gray-200">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Scalability</h4>
                <p className="text-gray-600 text-sm">Modular architecture for flexible expansion</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 border border-gray-200">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Security</h4>
                <p className="text-gray-600 text-sm">Enterprise-grade security framework</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 border border-gray-200">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Accuracy</h4>
                <p className="text-gray-600 text-sm">Context-based precise processing</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 border border-gray-200">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Efficiency</h4>
                <p className="text-gray-600 text-sm">Optimized resource management</p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Strengths Section */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light text-gray-900 mb-4">
                Key Strengths
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
                Differentiated AI solutions for enterprises and public institutions
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6 border border-gray-200">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h4 className="text-xl font-medium text-gray-900 mb-4">Smart Orchestration</h4>
                <p className="text-gray-600">Coordinate multiple AI agents to intelligently automate complex business tasks</p>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6 border border-gray-200">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h4 className="text-xl font-medium text-gray-900 mb-4">Enterprise Ready</h4>
                <p className="text-gray-600">Support both on-premises and cloud environments for secure enterprise deployment</p>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6 border border-gray-200">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-xl font-medium text-gray-900 mb-4">Domain Customization</h4>
                <p className="text-gray-600">Integration with groupware and enterprise systems for optimized organizational services</p>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6 border border-gray-200">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-xl font-medium text-gray-900 mb-4">Real-time AI Processing</h4>
                <p className="text-gray-600">Stable data processing with PostgreSQL and real-time AI analysis capabilities</p>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-gray-200 md:col-span-2">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6 border border-gray-200">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <h4 className="text-xl font-medium text-gray-900 mb-4">On-Premise & Hybrid Cloud Support</h4>
                <p className="text-gray-600">Flexible integration with existing infrastructure based on VMware, Kubernetes, and OpenShift. Safe operation in security-critical government and enterprise environments.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  );
}