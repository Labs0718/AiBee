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
                AiBee AI Platform
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
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light text-gray-900 mb-4">
                AiBee 작동 방식
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
                사용자 요청부터 결과 전달까지의 지능형 AI 어시스턴트 처리 과정
              </p>
            </div>
            
            {/* Main Workflow Diagram */}
            <div className="bg-white rounded-lg p-8 lg:p-12 border border-gray-300 shadow-sm mb-16 relative overflow-hidden">
              
              <div className="relative">
                {/* Top Row - User to AI */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 mb-12">
                  {/* User */}
                  <div className="flex flex-col items-center group">
                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center mb-4 border border-gray-300 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                      <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">사용자</h3>
                      <p className="text-sm text-gray-600">요청 → 분석</p>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="flex items-center text-gray-500">
                    <div className="hidden lg:flex items-center">
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-1 bg-gray-400 rounded-full"></div>
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Core */}
                  <div className="relative group">
                    <div className="bg-gray-800 text-white p-8 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                            <span className="text-gray-800 text-lg font-bold">S</span>
                          </div>
                          <div className="text-2xl font-bold">AiBee</div>
                        </div>
                        <div className="text-sm text-gray-300">Agent Runtime</div>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center text-gray-500">
                    <div className="hidden lg:flex items-center">
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-1 bg-gray-400 rounded-full"></div>
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-100 p-6 rounded-xl border border-gray-300 shadow-sm mb-4">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">자료 및 결과</h3>
                        <div className="flex flex-col items-center space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700">SupabaseDB</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-700">Storage</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-gray-700">WebSocket</span>
                          </div>
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
                  
                  <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 hover:shadow-md transition-all duration-300 group">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                          </svg>
                        </div>
                        <div className="font-semibold text-gray-900 text-sm">Browser Tool</div>
                        <div className="text-xs text-gray-600">웹 자동화</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 hover:shadow-md transition-all duration-300 group">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <div className="font-semibold text-gray-900 text-sm">Search Tool</div>
                        <div className="text-xs text-gray-600">실시간 API 검색</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 hover:shadow-md transition-all duration-300 group">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <div className="font-semibold text-gray-900 text-sm">Vision Tool</div>
                        <div className="text-xs text-gray-600">이미지 분석</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Process Description */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900 mb-4">처리 과정</h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-gray-700 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                          <p className="text-sm text-gray-700">사용자 요청을 자연어로 분석하고 의도를 파악합니다</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-gray-700 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                          <p className="text-sm text-gray-700">최적의 도구를 자동 선택하여 실시간으로 작업을 수행합니다</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-gray-700 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                          <p className="text-sm text-gray-700">처리 결과를 안전하게 저장하고 실시간으로 전달합니다</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-gray-700 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                          <p className="text-sm text-gray-700">지속적인 모니터링을 통해 품질을 보장합니다</p>
                        </div>
                      </div>
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
                <h4 className="text-lg font-medium text-gray-900 mb-2">요청 처리</h4>
                <p className="text-gray-600 text-sm">자연어 이해와 의도 분석을 통한 자동 도구 선택</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">실시간 실행</h4>
                <p className="text-gray-600 text-sm">브라우저 자동화, 웹 검색, 이미지 분석을 통한 즉시 처리</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">결과 전달</h4>
                <p className="text-gray-600 text-sm">WebSocket 기반 실시간 결과 전송과 보안 데이터베이스 저장</p>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light text-gray-900 mb-4">
                시스템 아키텍처
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
                확장 가능한 AI 운영을 위한 4계층 엔터프라이즈 아키텍처
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
                        <p className="text-gray-600 text-sm">사용자 인터페이스 및 보안 관리</p>
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
                        <p className="text-gray-600 text-sm">지능형 에이전트 조정 및 실행</p>
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
                        <p className="text-gray-600 text-sm">AI 모델 서빙 및 추론 엔진</p>
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
                        <p className="text-gray-600 text-sm">데이터 관리 및 인프라 플랫폼</p>
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
                <h4 className="font-medium text-gray-900 mb-2">확장성</h4>
                <p className="text-gray-600 text-sm">유연한 확장을 위한 모듈형 아키텍처</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 border border-gray-200">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">보안</h4>
                <p className="text-gray-600 text-sm">엔터프라이즈급 보안 프레임워크</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 border border-gray-200">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">정확성</h4>
                <p className="text-gray-600 text-sm">컨텍스트 기반 정밀 처리</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 border border-gray-200">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">효율성</h4>
                <p className="text-gray-600 text-sm">최적화된 리소스 관리</p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Strengths Section */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light text-gray-900 mb-4">
                주요 장점
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
                기업 및 공공기관을 위한 차별화된 AI 솔루션
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6 border border-gray-200">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h4 className="text-xl font-medium text-gray-900 mb-4">스마트 오케스트레이션</h4>
                <p className="text-gray-600">복잡한 비즈니스 작업을 지능적으로 자동화하기 위한 다중 AI 에이전트 조정</p>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6 border border-gray-200">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h4 className="text-xl font-medium text-gray-900 mb-4">엔터프라이즈 준비 완료</h4>
                <p className="text-gray-600">보안 엔터프라이즈 배포를 위한 온프레미스 및 클라우드 환경 모두 지원</p>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6 border border-gray-200">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-xl font-medium text-gray-900 mb-4">도메인 맞춤화</h4>
                <p className="text-gray-600">최적화된 조직 서비스를 위한 그룹웨어 및 엔터프라이즈 시스템 통합</p>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6 border border-gray-200">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-xl font-medium text-gray-900 mb-4">실시간 AI 처리</h4>
                <p className="text-gray-600">PostgreSQL을 통한 안정적인 데이터 처리 및 실시간 AI 분석 기능</p>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-gray-200 md:col-span-2">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6 border border-gray-200">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <h4 className="text-xl font-medium text-gray-900 mb-4">온프레미스 및 하이브리드 클라우드 지원</h4>
                <p className="text-gray-600">VMware, Kubernetes, OpenShift 기반 기존 인프라와의 유연한 통합. 보안이 중요한 정부 및 기업 환경에서의 안전한 운영.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  );
}