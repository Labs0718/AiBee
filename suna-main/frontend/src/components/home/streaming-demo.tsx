'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Globe, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';

const demoMessages = [
  {
    id: 1,
    type: 'user',
    content: '현재 나스닥 주요 지수와 상위 종목들의 실시간 데이터를 분석해서 엑셀 파일로 다운로드할 수 있게 정리해줘',
    delay: 0
  },
  {
    id: 2, 
    type: 'thinking',
    content: 'Searching Web',
    delay: 800
  },
  {
    id: 3,
    type: 'assistant',
    content: '네, 나스닥의 실시간 시장 데이터를 분석해서 포괄적인 엑셀 보고서를 생성하겠습니다. 먼저 현재 시장 상황부터 확인해보겠습니다.',
    delay: 2000
  },
  {
    id: 4,
    type: 'thinking', 
    content: 'Analyzing Market Data',
    delay: 3200
  },
  {
    id: 5,
    type: 'assistant',
    content: '📈 **현재 나스닥 시장 분석 완료**\n\n**나스닥 종합지수 (IXIC)**\n• 현재가: 21,700.39 (+1.2%)\n• 거래량: 4.2B shares\n• 시가총액: $26.8T\n• 52주 최고: 21,713.14\n\n**Magnificent 7 실시간 현황:**\n• AAPL: $234.85 (+2.3%) | 시총: $3.6T\n• MSFT: $441.28 (+1.8%) | 시총: $3.3T  \n• GOOGL: $178.42 (-0.5%) | 시총: $2.2T\n• TSLA: $389.67 (+4.2%) | 시총: $1.2T\n• META: $518.33 (+2.1%) | 시총: $1.3T\n• AMZN: $189.45 (+1.6%) | 시총: $2.0T\n• NVDA: $138.77 (+3.8%) | 시총: $3.4T\n\n상세 분석을 위한 추가 데이터를 수집 중입니다...',
    delay: 4500
  },
  {
    id: 6,
    type: 'thinking',
    content: 'Generating Excel Report',
    delay: 7800
  },
  {
    id: 7,
    type: 'assistant', 
    content: '📊 **Excel 분석 보고서 생성 완료**\n\n**포함된 데이터:**\n• 나스닥 상위 100개 종목 실시간 가격\n• 섹터별 성과 분석 (Tech: +2.1%, Healthcare: +0.8%)\n• 거래량 기반 모멘텀 분석\n• P/E, P/B 비율 등 밸류에이션 지표\n• 52주 고점/저점 대비 현재 위치\n• 기관 투자자 보유 비중 분석\n\n**주요 인사이트:**\n✅ AI/반도체 섹터가 시장을 주도 (+3.2%)\n✅ 거래량이 평균 대비 15% 증가\n⚠️ 일부 메가캡 주식에 과도한 집중 현상\n\n📁 **NASDAQ_Comprehensive_Analysis_2025.xlsx** 다운로드 준비 완료',
    delay: 9500
  }
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
      <Search className="w-4 h-4" />
      <TypedText text="Searching Web" speed={3} />
      <div className="flex gap-1 ml-2">
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
      </div>
    </div>
  );
}

function TypedText({ text, speed = 20, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return <span>{displayText}</span>;
}

export function StreamingDemo() {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [currentTyping, setCurrentTyping] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showInputDemo, setShowInputDemo] = useState(true);
  const [typedText, setTypedText] = useState('');
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const demoRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const searchResults = [
    {
      title: "나스닥 종합지수 실시간 시세 | Yahoo Finance",
      url: "https://finance.yahoo.com/quote/%5EIXIC",
      content: "지수: 21,700.39 (+1.2% ↗️)\n\n📊 시장 개요:\n• 시가: 21,456.23\n• 고가: 21,713.14 (52주 최고가)\n• 저가: 21,455.55\n• 거래량: 42.4억 주\n• 평균 거래량: 38억 주\n\n🕐 최종 업데이트: 오후 4:00 EST\n⚡ 시간외 거래: 21,695.22 (-0.02%)\n\n📈 기술적 지표:\n• RSI: 68.4 (강세)\n• MACD: 긍정적 교차\n• 50일 이평선: 21,234.67\n• 200일 이평선: 20,891.45",
      type: "market_data"
    },
    {
      title: "나스닥 주요 종목 - 실시간 시장 데이터 | CNBC",
      url: "https://www.cnbc.com/markets/",
      content: "🔝 빅테크 7 종목 현황:\n\n📱 AAPL: $234.85 (+2.3%)\n   거래량: 4,520만 주 | 시총: $3.6T\n   PER: 28.4 | 배당수익률: 0.44%\n\n💻 MSFT: $441.28 (+1.8%)\n   거래량: 2,210만 주 | 시총: $3.3T\n   PER: 34.2 | 배당수익률: 0.68%\n\n🔍 GOOGL: $178.42 (-0.5%)\n   거래량: 1,890만 주 | 시총: $2.2T\n   PER: 24.1 | 매출 성장률: 11%\n\n🚗 TSLA: $389.67 (+4.2%)\n   거래량: 6,780만 주 | 시총: $1.2T\n   PER: 45.6 | 인도량 증가율: 6%\n\n📈 상승률 TOP 3:\n1. NVDA: +3.8%\n2. TSLA: +4.2%\n3. AAPL: +2.3%",
      type: "stock_data"
    },
    {
      title: "엑셀 금융 데이터 생성기 - 전문 리포트",
      url: "https://financialtools.ai/excel-generator",
      content: "🔧 나스닥 종합 분석 보고서 생성 중...\n\n📋 리포트 구조:\n├── 📊 지수 요약\n├── 📈 상위 100개 종목\n├── 🏭 섹터 분석\n├── 📊 기술적 지표\n├── 💰 밸류에이션 지표\n└── 📑 경영진 요약\n\n⚙️ 처리 현황:\n✅ 시장 데이터 수집 (100%)\n✅ 종목 분석 (100%)\n✅ 섹터 분류 (100%)\n🔄 차트 생성 (78%)\n⏳ 엑셀 서식 작업 (45%)\n\n📊 생성된 차트:\n• 주가 추세 (30일)\n• 거래량 분석\n• 섹터 성과 파이 차트\n• PER 비교 분석\n\n💾 파일 크기: ~2.8MB\n📅 데이터 기준시간: 2025-09-09 16:00 EST",
      type: "tool_execution"
    },
    {
      title: "나스닥 시장 분석 완료 | 다운로드 준비됨",
      url: "https://downloads.aibee.com/reports/",
      content: "✅ **리포트 생성 완료!**\n\n📁 파일명: NASDAQ_종합분석_2025.xlsx\n📏 크기: 2.83 MB\n🕐 생성 시간: 2025-09-09 오후 4:03 EST\n\n📋 **포함된 시트:**\n1. 경영진 요약\n2. 지수 성과\n3. 상위 100 종목 상세\n4. 섹터별 분석\n5. 기술적 분석\n6. 리스크 지표\n7. 투자 추천\n\n📊 **주요 하이라이트:**\n• 47개 종목이 2% 이상 상승\n• 기술주 섹터가 시장 주도 (+2.1%)\n• 평균 PER: 31.2배\n• 시장 변동성: 18.4%\n\n🔗 **다운로드 링크:**\n📊 엑셀 보고서 (2.83MB)\n📈 PDF 요약본 (847KB)\n📱 모바일 대시보드 링크\n\n⚡ 자동 새로고침: 15분마다",
      type: "download_ready"
    }
  ];

  const nextResult = () => {
    setCurrentResultIndex((prev) => (prev + 1) % searchResults.length);
  };

  const prevResult = () => {
    setCurrentResultIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
  };

  const calculateIndexFromPosition = (clientX: number) => {
    if (!progressBarRef.current) return currentResultIndex;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newIndex = Math.round(percentage * (searchResults.length - 1));
    return Math.max(0, Math.min(newIndex, searchResults.length - 1));
  };

  const handleProgressBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const newIndex = calculateIndexFromPosition(event.clientX);
    setCurrentResultIndex(newIndex);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    event.preventDefault();
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging) return;
    const newIndex = calculateIndexFromPosition(event.clientX);
    setCurrentResultIndex(newIndex);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const startDemo = () => {
    setVisibleMessages([]);
    setCurrentTyping(null);
    setIsPlaying(true);
    setHasStarted(true);
    setShowInputDemo(true);
    setTypedText('');
    
    // Step 1: Show typing animation in input
    const inputText = '현재 나스닥 주요 지수와 상위 종목들의 실시간 데이터를 분석해서 엑셀 파일로 다운로드할 수 있게 정리해줘';
    let currentIndex = 0;
    
    const typeInterval = setInterval(() => {
      if (currentIndex <= inputText.length) {
        setTypedText(inputText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        // Step 2: Wait then switch to chat view
        setTimeout(() => {
          setShowInputDemo(false);
          setTimeout(() => {
            startChatDemo();
          }, 200);
        }, 300);
      }
    }, 5);
  };
  
  const startChatDemo = () => {
    demoMessages.forEach((message, index) => {
      setTimeout(() => {
        setVisibleMessages(prev => [...prev, message.id]);
        
        // Auto advance right panel based on message progression
        if (message.id === 3) { // After first assistant response
          setCurrentResultIndex(0); // Market data
        } else if (message.id === 5) { // After detailed market analysis  
          setCurrentResultIndex(1); // Stock data
        } else if (message.id === 6) { // "Generating Excel Report"
          setCurrentResultIndex(2); // Tool execution
        } else if (message.id === 7) { // Final response
          setCurrentResultIndex(3); // Download ready
        }
        
        if (message.type === 'thinking' || message.type === 'assistant') {
          setCurrentTyping(message.id);
          
          const typingDuration = message.type === 'thinking' ? 500 : 800;
          
          setTimeout(() => {
            setCurrentTyping(null);
            if (index === demoMessages.length - 1) {
              setIsPlaying(false);
            }
          }, typingDuration);
        }
      }, message.delay);
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasStarted) {
          setTimeout(() => {
            startDemo();
          }, 800);
        }
      },
      {
        threshold: 0.3,
      }
    );

    if (demoRef.current) {
      observer.observe(demoRef.current);
    }

    return () => {
      if (demoRef.current) {
        observer.unobserve(demoRef.current);
      }
    };
  }, [hasStarted]);

  const renderMessage = (message: any) => {
    if (message.type === 'thinking') {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <img src="/logo2.png" alt="AiBee" className="w-6 h-6" />
          </div>
          {currentTyping === message.id ? <TypingIndicator /> : (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
              <Search className="w-4 h-4" />
              <span>Searching Web</span>
            </div>
          )}
        </motion.div>
      );
    }

    if (message.type === 'user') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end mb-4"
        >
          <div className="max-w-[80%] bg-white border border-gray-200 rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
            <p className="text-sm text-gray-800">{message.content}</p>
          </div>
        </motion.div>
      );
    }

    if (message.type === 'assistant') {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-3 mb-4"
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <img src="/logo2.png" alt="AiBee" className="w-6 h-6" />
          </div>
          <div className="flex-1 max-w-[80%]">
            <div className="text-sm text-gray-800">
              {currentTyping === message.id ? (
                <TypedText text={message.content} speed={20} />
              ) : (
                message.content
              )}
            </div>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  if (showInputDemo) {
    return (
      <div ref={demoRef} className="w-full px-24 lg:px-40">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src="/logo2.png" alt="AiBee Logo" className="w-12 h-12" />
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              AiBee in Action
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            AiBee가 실시간으로 데이터를 분석하고 인사이트를 제공하는 과정을 확인해보세요
          </p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8">
            <div className="text-center text-lg text-gray-600 mb-8">
              오늘 무엇을 도와드릴까요?
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={typedText}
                  placeholder="어떤 도움이 필요하신지 설명해주세요..."
                  className="w-full px-6 py-4 text-base border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  readOnly
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={demoRef} className="w-full px-24 lg:px-40">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-4">
          <img src="/logo2.png" alt="AiBee Logo" className="w-12 h-12" />
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
            AiBee in Action
          </h2>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          AiBee가 실시간으로 데이터를 분석하고 인사이트를 제공하는 과정을 확인해보세요
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <img src="/logo2.png" alt="AiBee" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-gray-900 font-medium text-base">AiBee</h3>
              <p className="text-gray-500 text-sm">AI Assistant</p>
            </div>
          </div>
        </div>

        {/* Split View */}
        <div className="flex h-[800px]">
          {/* Left Panel - Chat */}
          <div className="w-1/2 flex flex-col bg-gray-50">
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="popLayout">
                {demoMessages
                  .filter(message => visibleMessages.includes(message.id))
                  .map((message) => (
                    <div key={message.id}>
                      {renderMessage(message)}
                    </div>
                  ))}
              </AnimatePresence>
            </div>
            
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  readOnly
                />
                <button className="px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors text-sm">
                  전송
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - AiBee's Computer */}
          <div className="w-1/2 bg-white border-l border-gray-200 flex flex-col">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">AiBee's Computer</span>
              </div>
            </div>

            {/* Browser-like interface */}
            <div className="bg-white p-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <ArrowLeft className="w-3 h-3 text-gray-500" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <ArrowRight className="w-3 h-3 text-gray-500" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <RefreshCw className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
                <div className="flex-1 bg-gray-100 rounded px-3 py-1.5 text-sm text-gray-600">
                  {searchResults[currentResultIndex]?.url}
                </div>
              </div>
            </div>

            {/* Content Area with Scrollbar */}
            <div className="flex-1 overflow-y-auto p-6">
              <motion.div
                key={currentResultIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {searchResults[currentResultIndex]?.title}
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {searchResults[currentResultIndex]?.content}
                  </pre>
                </div>

              </motion.div>
            </div>

            {/* Bottom Navigation Bar - Fixed at bottom */}
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 h-[80px] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <button 
                  onClick={prevResult}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  disabled={currentResultIndex === 0}
                >
                  <ArrowLeft className="w-4 h-4 text-gray-600" />
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {currentResultIndex + 1}/{searchResults.length}
                  </span>
                </div>

                <button 
                  onClick={nextResult}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  disabled={currentResultIndex === searchResults.length - 1}
                >
                  <ArrowRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="flex-1 mx-6">
                <div className="relative">
                  <div 
                    ref={progressBarRef}
                    className="w-full bg-gray-200 rounded-full h-2 cursor-pointer hover:bg-gray-300 transition-colors"
                    onClick={handleProgressBarClick}
                  >
                    <div 
                      className={`bg-gray-400 h-2 rounded-full ${isDragging ? '' : 'transition-all duration-300'}`} 
                      style={{width: `${((currentResultIndex + 1) / searchResults.length) * 100}%`}}
                    ></div>
                  </div>
                  <div 
                    className={`absolute -top-1 cursor-grab active:cursor-grabbing hover:scale-110 ${isDragging ? 'scale-110 cursor-grabbing' : ''} ${isDragging ? '' : 'transition-all duration-300'}`}
                    style={{left: `${((currentResultIndex + 1) / searchResults.length) * 100}%`, transform: 'translateX(-50%)'}}
                    onMouseDown={handleMouseDown}
                  >
                    <div className={`w-4 h-4 bg-gray-500 rounded-full border-2 border-white shadow-sm hover:shadow-md transition-shadow ${isDragging ? 'shadow-lg' : ''}`}></div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-500">
                  {currentResultIndex === searchResults.length - 1 ? 'Task Completion' : 'Processing'}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {currentResultIndex === searchResults.length - 1 ? 'Latest Tool' : 'Web Search'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StreamingDemo;