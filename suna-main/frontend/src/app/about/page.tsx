'use client';

import { Navbar } from '@/components/home/sections/navbar';
import { FooterSection } from '@/components/home/sections/footer-section';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="pt-32 pb-24 bg-white border-b border-gray-100">
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
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light text-gray-900 mb-4">
                How Suna Works
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
                Intelligent AI assistant process from user request to result delivery
              </p>
            </div>
            
            {/* Process Flow */}
            <div className="bg-white rounded-lg p-8 lg:p-12 border border-gray-200 mb-16">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-12">
                {/* User */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4 border border-gray-200">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">User</h3>
                    <p className="text-sm text-gray-500">Request & Analysis</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-300">
                  <div className="hidden lg:flex items-center">
                    <div className="w-12 h-px bg-gray-300"></div>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                
                {/* AI Processing */}
                <div className="relative">
                  <div className="bg-gray-900 text-white p-6 rounded-lg">
                    <div className="text-center">
                      <div className="text-xl font-medium mb-1">Suna AI</div>
                      <div className="text-sm text-gray-300">Processing Engine</div>
                    </div>
                  </div>
                  
                  {/* Integrated Tools */}
                  <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-3 max-w-lg mx-auto">
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-700">Browser</div>
                        <div className="text-xs text-gray-500">Automation</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-700">Search</div>
                        <div className="text-xs text-gray-500">Web Search</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-700">Vision</div>
                        <div className="text-xs text-gray-500">Analysis</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-700">Files</div>
                        <div className="text-xs text-gray-500">Management</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-700">Sheets</div>
                        <div className="text-xs text-gray-500">Data</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-700">Deploy</div>
                        <div className="text-xs text-gray-500">Release</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-300">
                  <div className="hidden lg:flex items-center">
                    <div className="w-12 h-px bg-gray-300"></div>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                
                {/* Results */}
                <div className="flex flex-col items-center">
                  <div className="bg-gray-800 text-white p-6 rounded-lg mb-4">
                    <div className="text-center">
                      <div className="text-lg font-medium mb-1">Results</div>
                      <div className="text-sm text-gray-300">
                        Report & Storage
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Output</h3>
                    <p className="text-sm text-gray-500">Real-time • Auto-save</p>
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