'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Globe, ArrowLeft, ArrowRight, RefreshCw, ListTodo, CheckCircle, Circle, Clock, Download } from 'lucide-react';

const demoMessages = [
  {
    id: 1,
    type: 'user',
    content: '현재 나스닥 주요 지수와 상위 종목들의 실시간 데이터를 분석해서 마크다운 보고서로 정리해줘',
    delay: 0
  },
  {
    id: 2,
    type: 'tasks',
    content: JSON.stringify({
      title: '작업 계획 수립',
      sections: [{
        id: 'planning',
        title: '초기 분석 계획',
        tasks: [
          { id: 'data-collection', content: '나스닥 지수 및 주요 종목 실시간 데이터 수집', status: 'pending' },
          { id: 'market-analysis', content: '시장 동향 및 섹터 분석 수행', status: 'pending' },
          { id: 'stock-screening', content: '상위 종목 스크리닝 및 기초 분석', status: 'pending' },
          { id: 'risk-assessment', content: '시장 리스크 및 변동성 평가', status: 'pending' },
          { id: 'report-generation', content: '종합 분석 마크다운 보고서 생성', status: 'pending' }
        ]
      }],
      total_tasks: 5
    }),
    delay: 500
  },
  {
    id: 3, 
    type: 'thinking',
    content: 'Searching Web',
    delay: 1300
  },
  {
    id: 4,
    type: 'assistant',
    content: '나스닥 종합 금융 분석을 시작하겠습니다. 실시간 시장 데이터 수집부터 상세 분석 보고서 생성까지 체계적으로 진행하겠습니다.\n\n**STEP 1: 실시간 시장 데이터 수집 (필수 첫 단계)**\n먼저 나스닥 종합지수와 주요 구성 종목들의 실시간 데이터를 수집하겠습니다.',
    delay: 2500
  },
  {
    id: 5,
    type: 'tasks',
    content: JSON.stringify({
      title: '작업 진행 상황',
      sections: [{
        id: 'planning',
        title: '초기 분석 계획',
        tasks: [
          { id: 'data-collection', content: '나스닥 지수 및 주요 종목 실시간 데이터 수집', status: 'completed' },
          { id: 'market-analysis', content: '시장 동향 및 섹터 분석 수행', status: 'pending' },
          { id: 'stock-screening', content: '상위 종목 스크리닝 및 기초 분석', status: 'pending' },
          { id: 'risk-assessment', content: '시장 리스크 및 변동성 평가', status: 'pending' },
          { id: 'report-generation', content: '종합 분석 마크다운 보고서 생성', status: 'pending' }
        ]
      }],
      total_tasks: 5
    }),
    delay: 4000
  },
  {
    id: 6,
    type: 'thinking', 
    content: 'Market Data Analysis',
    delay: 4500
  },
  {
    id: 7,
    type: 'assistant',
    content: '📊 **실시간 데이터 수집 완료**\n\n**나스닥 종합지수 (NASDAQ Composite)**\n• 현재가: 21,700.39 (+260.45, +1.22%)\n• 거래량: 4.24B shares (평균 대비 +12%)\n• 시가총액: $26.8T\n• 52주 최고/최저: 21,713.14 / 18,592.57\n• VIX(변동성): 18.4 (보통 수준)\n\n**섹터별 성과 분석:**\n🔸 Technology: +2.1% (시장 주도)\n🔸 Communication Services: +1.8%\n🔸 Consumer Discretionary: +1.3%\n🔸 Healthcare: +0.8%\n🔸 Industrial: +0.5%\n🔸 Energy: -0.3%\n🔸 Utilities: -0.8%\n\n이제 개별 종목 심화 분석을 진행하겠습니다.',
    delay: 5000
  },
  {
    id: 8,
    type: 'tasks',
    content: JSON.stringify({
      title: '작업 진행 상황',
      sections: [{
        id: 'planning',
        title: '초기 분석 계획',
        tasks: [
          { id: 'data-collection', content: '나스닥 지수 및 주요 종목 실시간 데이터 수집', status: 'completed' },
          { id: 'market-analysis', content: '시장 동향 및 섹터 분석 수행', status: 'completed' },
          { id: 'stock-screening', content: '상위 종목 스크리닝 및 기초 분석', status: 'pending' },
          { id: 'risk-assessment', content: '시장 리스크 및 변동성 평가', status: 'pending' },
          { id: 'report-generation', content: '종합 분석 마크다운 보고서 생성', status: 'pending' }
        ]
      }],
      total_tasks: 5
    }),
    delay: 8500
  },
  {
    id: 9,
    type: 'thinking',
    content: 'Deep Stock Analysis',
    delay: 9000
  },
  {
    id: 10,
    type: 'assistant',
    content: '🔍 **Magnificent 7 + 주요 종목 심화 분석 완료**\n\n**TOP 10 종목 상세 분석:**\n\n**1. AAPL (Apple Inc.)**\n• 현재가: $234.85 (+5.21, +2.27%)\n• 시총: $3.67T | P/E: 28.4 | PEG: 1.8\n• 52주 수익률: +18.2%\n• 기관보유: 89.4%\n• 분석: iPhone 16 Pro Max 판매 호조, 서비스 매출 성장\n\n**2. NVDA (NVIDIA Corp.)**\n• 현재가: $138.77 (+5.12, +3.83%)\n• 시총: $3.41T | P/E: 65.2 | PEG: 2.1\n• AI 칩 수요 급증, 데이터센터 매출 전년대비 +206%\n• 목표주가: $150 (Goldman Sachs)\n\n**3. MSFT (Microsoft Corp.)**\n• 현재가: $441.28 (+7.84, +1.81%)\n• 시총: $3.28T | P/E: 34.2\n• Azure 클라우드 성장률 +29% QoQ\n• 생성AI 통합으로 생산성 도구 혁신\n\n**4. GOOGL (Alphabet Class A)**\n• 현재가: $178.42 (-0.89, -0.50%)\n• 시총: $2.19T | P/E: 24.1\n• 광고 매출 회복, YouTube Shorts 수익화 가속\n• 클라우드 부문 영업이익률 개선\n\n**5. AMZN (Amazon.com Inc.)**\n• 현재가: $189.45 (+2.98, +1.60%)\n• 시총: $1.97T | P/E: 42.8\n• AWS 성장률 +19%, 광고 사업 확대\n• 물류 효율성 개선으로 수익성 향상\n\n종합 리스크 분석을 진행하겠습니다.',
    delay: 10500
  },
  {
    id: 11,
    type: 'tasks',
    content: JSON.stringify({
      title: '작업 진행 상황',
      sections: [{
        id: 'planning',
        title: '초기 분석 계획',
        tasks: [
          { id: 'data-collection', content: '나스닥 지수 및 주요 종목 실시간 데이터 수집', status: 'completed' },
          { id: 'market-analysis', content: '시장 동향 및 섹터 분석 수행', status: 'completed' },
          { id: 'stock-screening', content: '상위 종목 스크리닝 및 기초 분석', status: 'completed' },
          { id: 'risk-assessment', content: '시장 리스크 및 변동성 평가', status: 'pending' },
          { id: 'report-generation', content: '종합 분석 마크다운 보고서 생성', status: 'pending' }
        ]
      }],
      total_tasks: 5
    }),
    delay: 13500
  },
  {
    id: 12,
    type: 'thinking',
    content: 'Risk Assessment',
    delay: 14000
  },
  {
    id: 13,
    type: 'assistant',
    content: '⚠️ **시장 리스크 및 기회 요인 분석**\n\n**긍정적 요인:**\n✅ AI 혁신 지속: 생성AI, 자율주행, 로보틱스 분야 투자 급증\n✅ 금리 안정화: Fed 기준금리 동결로 성장주 밸류에이션 회복\n✅ 소비 회복세: 개인소비지출 +0.8% MoM, 고용지표 개선\n✅ 기업 실적 개선: S&P 500 EPS 성장률 +8.2% 예상\n\n**위험 요인:**\n⚠️ 지정학적 리스크: 중국 반도체 규제, 대만 해협 긴장\n⚠️ 인플레이션 압력: 핵심 PCE 3.2% 유지, 서비스업 인플레이션\n⚠️ 기술주 과열: 나스닥 PER 28.5배로 역사적 고평가\n⚠️ 유동성 우려: 10년 국채수익률 4.8% 상승\n\n**투자 전략 권고:**\n🎯 단기 (1-3개월): 실적 발표 시즌 대비 포지션 조정\n🎯 중기 (3-12개월): AI 테마주 선별 투자, 밸류에이션 고려\n🎯 장기 (12개월+): 구조적 성장 테마 중심 포트폴리오\n\n이제 상세한 분석 보고서를 생성하겠습니다.',
    delay: 15500
  },
  {
    id: 14,
    type: 'tasks',
    content: JSON.stringify({
      title: '작업 진행 상황',
      sections: [{
        id: 'planning',
        title: '초기 분석 계획',
        tasks: [
          { id: 'data-collection', content: '나스닥 지수 및 주요 종목 실시간 데이터 수집', status: 'completed' },
          { id: 'market-analysis', content: '시장 동향 및 섹터 분석 수행', status: 'completed' },
          { id: 'stock-screening', content: '상위 종목 스크리닝 및 기초 분석', status: 'completed' },
          { id: 'risk-assessment', content: '시장 리스크 및 변동성 평가', status: 'completed' },
          { id: 'report-generation', content: '종합 분석 마크다운 보고서 생성', status: 'pending' }
        ]
      }],
      total_tasks: 5
    }),
    delay: 18500
  },
  {
    id: 15,
    type: 'thinking',
    content: 'Markdown Report Generation',
    delay: 19000
  },
  {
    id: 16,
    type: 'assistant',
    content: '📊 **나스닥 종합 분석 보고서 생성 완료**\n\n**생성된 마크다운 보고서 구성:**\n\n**📋 Section 1: Executive Summary**\n• 시장 개요 및 핵심 지표\n• 투자 등급 및 목표 수익률\n• 리스크 요약 및 투자 전략\n\n**📈 Section 2: Index Performance**\n• 나스닥 종합지수 30일 성과 추이\n• 섹터별 기여도 분석\n• 거래량 패턴 및 변동성 지표\n\n**🏢 Section 3: Top 100 Stocks Detail**\n• 종목별 실시간 가격 및 변동률\n• 밸류에이션 지표 (P/E, P/B, PEG)\n• 기술적 분석 (RSI, MACD, 볼린저밴드)\n• 애널리스트 목표주가 컨센서스\n\n**🏭 Section 4: Sector Analysis**\n• 11개 섹터별 성과 매트릭스\n• 섹터 로테이션 트렌드 분석\n• 업종별 PER/PBR 밴드 분석\n\n**📊 Section 5: Technical Charts**\n• 주요 지수 차트 (일봉, 주봉, 월봉)\n• 이동평균선 분석\n• 지지/저항 구간 표시\n\n**⚖️ Section 6: Risk Metrics**\n• VaR (Value at Risk) 계산\n• 상관관계 매트릭스\n• 베타 계수 및 샤프 비율\n\n**💡 Section 7: Investment Recommendations**\n• Buy/Hold/Sell 종목 리스트\n• 포트폴리오 최적화 제안\n• 리밸런싱 타이밍 가이드\n\n**📁 NASDAQ_Professional_Analysis_2025_0909.md**\n📏 파일 크기: 1.2MB\n📊 차트 수: 24개\n📋 데이터 포인트: 50,000+개\n\n✅ **마크다운 보고서 준비 완료**',
    delay: 21000
  },
  {
    id: 17,
    type: 'tasks',
    content: JSON.stringify({
      title: '작업 완료',
      sections: [{
        id: 'planning',
        title: '초기 분석 계획',
        tasks: [
          { id: 'data-collection', content: '나스닥 지수 및 주요 종목 실시간 데이터 수집', status: 'completed' },
          { id: 'market-analysis', content: '시장 동향 및 섹터 분석 수행', status: 'completed' },
          { id: 'stock-screening', content: '상위 종목 스크리닝 및 기초 분석', status: 'completed' },
          { id: 'risk-assessment', content: '시장 리스크 및 변동성 평가', status: 'completed' },
          { id: 'report-generation', content: '종합 분석 마크다운 보고서 생성', status: 'completed' }
        ]
      }],
      total_tasks: 5
    }),
    delay: 24000
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
  const [availableResults, setAvailableResults] = useState(0); // Start with no results available
  const [showNoActivity, setShowNoActivity] = useState(true); // Show "No tool activity" initially
  const [isDragging, setIsDragging] = useState(false);
  const demoRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const searchResults = [
    {
      title: "나스닥 종합지수 실시간 데이터 | 블룸버그 터미널",
      url: "https://bloomberg.com/quote/CCMP:IND",
      content: "**나스닥 종합지수 (CCMP)**\n현재가: 21,700.39 (+260.45, +1.22%)\n\n📈 **실시간 성과 지표:**\n• 시가: 21,456.23 (갭업 +0.89%)\n• 고가: 21,713.14 ⭐ 52주 신고가\n• 저가: 21,455.55\n• 거래량: 42.4억주 (평균 38억주 대비 +12%)\n• 거래대금: 4,872억달러\n\n💹 **주요 동향:**\n• 기관투자자 순매수: +124억달러 (3거래일 연속)\n• 개인투자자: +28억달러\n• 외국인투자자: -12억달러 (차익실현)\n• 옵션 풋콜비율: 0.64 (낙관적 심리)\n\n🏆 **섹터 기여도 (상위 5개):**\n1. 기술주: +156pt (전체 상승의 60% 기여)\n2. 통신서비스: +42pt\n3. 소비재: +28pt\n4. 헬스케어: +18pt\n5. 산업재: +12pt\n\n⚡ **실시간 뉴스 영향:**\n• 애플 아이폰 16 사전주문 예상치 초과\n• 엔비디아 H200 칩 공급 확대 발표\n• 연준 위원 비둘기파 발언\n\n📊 **변동성 지표:**\n공포지수: 18.4 (-2.1, 보통 수준)\n기간구조: 정배열 상태 유지",
      type: "market_data"
    },
    {
      title: "나스닥 주요 구성종목 분석 | 모닝스타 다이렉트",
      url: "https://direct.morningstar.com/research/nasdaq-holdings",
      content: "🔍 **나스닥 상위 구성종목 심층 분석**\n\n**빅테크 7개 종목 성과 매트릭스:**\n\n📱 **애플 (AAPL)** - $234.85 (+2.27%) 🟢\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n목표가: 매수 $245 | 보유 $235 | 매도 $210\n• 4분기 아이폰 매출 가이던스 상향 (+8%)\n• 서비스 연간반복매출 1,000억달러 돌파 임박\n• 중국 매출 회복세 (+12% 전년동기대비)\n• 잉여현금흐름 수익률: 3.2%\n\n🔋 **엔비디아 (NVDA)** - $138.77 (+3.83%) 🟢\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• H100/H200 대기주문 600억달러 이상 추정\n• 데이터센터 매출 전망 상향 조정\n• 매출총이익률 75% 이상 유지\n• 선행 주가수익비율: 32.8배 (프리미엄 정당화)\n\n☁️ **마이크로소프트 (MSFT)** - $441.28 (+1.81%) 🟢\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• 애저 성장률 29% (예상 27% 상회)\n• 코파일럿 가입자 300만명 돌파\n• 상업용 클라우드 연간매출 1,500억달러\n• 영업레버리지 개선 지속\n\n🔍 **구글 (GOOGL)** - $178.42 (-0.50%) 🔴\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• 검색 광고 매출 둔화 우려\n• 유튜브 쇼츠 수익화 지연\n• 구글클라우드 성장률 35% (아마존 대비 열세)\n• 자율주행 웨이모 투자 확대\n\n📦 **아마존 (AMZN)** - $189.45 (+1.60%) 🟢\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• AWS 마진 개선 지속 (32.4%)\n• 프라임데이 매출 신기록 달성\n• 물류 자동화 투자 수익률 개선\n• 당일배송 서비스 확대\n\n**업종별 모멘텀 점수:**\n🥇 반도체: 9.2/10\n🥈 클라우드 소프트웨어: 8.7/10\n🥉 전자상거래: 7.9/10",
      type: "stock_data"
    },
    {
      title: "금융 리포트 생성기 | 팩트셋 워크스테이션",
      url: "https://workstation.factset.com/excel-reports",
      content: "🏗️ **나스닥 전문 분석 보고서 생성 중**\n\n**📊 보고서 생성 진행 현황:**\n\n**1단계: 데이터 수집 ✅ 완료**\n├─ 실시간 가격 데이터: 나스닥 종합지수 및 주요 종목\n├─ 기초 데이터: Big Tech 7개 종목 중심\n├─ 기술적 지표: RSI, MACD, 볼린저밴드 등\n├─ 뉴스 감성 분석: 시장 동향 분석\n└─ 섹터 분석: 7개 주요 섹터\n\n**2단계: 분석 엔진 ✅ 완료**\n├─ 지수 성과 분석: 나스닥 종합지수\n├─ 상위 구성 종목: Big Tech 7종목 중심\n├─ 위험 지표: VaR, 베타계수, 샤프비율\n├─ 섹터 분석: 반도체, 소프트웨어 등\n└─ 투자 전략: 단기/중기/장기 권고안\n\n**3단계: 보고서 편집 🔄 진행 중**\n├─ Executive Summary: ✅ 완료\n├─ 지수 분석: ✅ 완료  \n├─ 종목 분석: ✅ 완료\n├─ 섹터 분석: ✅ 완료\n├─ 리스크 분석: ✅ 완료\n├─ 투자 전략: ✅ 완료\n├─ 결론 및 요약: ✅ 완료\n└─ 최종 검토: ⏳ 대기 중\n\n**📈 생성된 분석 내용:**\n• 시장 개요 및 핵심 지표\n• 섹터별 기여도 분석\n• 상위 종목 심층 분석\n• 투자 등급 및 목표 수익률\n• 리스크 요약 및 투자 전략\n• 포트폴리오 최적화 제안\n\n**🎯 계산된 핵심 지표:**\n• 현재 지수: 21,700.39 (+1.22%)\n• 투자 등급: 매수 적극 권고\n• 목표 수익률: 12-15% (12개월)\n• VaR (95% 신뢰구간): -8.4%\n• 베타 계수: 1.15\n\n⏱️ **예상 완료 시간: 1분 30초**\n💾 **예상 파일 크기: 약 12KB (마크다운)**\n📄 **보고서 섹션: 7개 주요 섹션**\n📋 **분석 종목: Big Tech 7개 + 나스닥 지수**",
      type: "tool_execution"
    },
    {
      title: "나스닥 종합 분석 보고서 | 마크다운 형식",
      url: "https://reports.aibee.com/nasdaq/analysis-report.md",
      content: "# 나스닥 종합 분석 보고서\n\n📄 **나스닥_전문분석_2025_0909.md**\n⏰ 생성 시간: 2025-09-09 오후 4:05:47\n\n## 📊 Executive Summary\n\n### 시장 개요\n- **현재 지수**: 21,700.39 (+1.22%)\n- **시장 상태**: 상승 추세 지속\n- **투자 등급**: **매수 적극 권고**\n- **목표 수익률**: 12-15% (12개월)\n\n## 📈 나스닥 지수 분석\n\n### 성과 지표 (2025년 기준)\n| 구분 | 1주일 | 1개월 | 3개월 | YTD |\n|------|-------|-------|-------|-----|\n| 수익률 | +2.4% | +5.8% | +12.3% | +28.7% |\n| 변동성 | 14.2% | 16.8% | 19.1% | 22.4% |\n| 샤프비율 | 1.45 | 1.38 | 1.41 | 1.52 |\n\n### 섹터 기여도 분석\n```\n기술주        ████████████████ 60.0% (+156pt)\n통신서비스    ████             16.1% (+42pt)\n소비재        ███              10.7% (+28pt)\n헬스케어      ██               6.9% (+18pt)\n산업재        █                4.6% (+12pt)\n기타          █                1.7% (+4pt)\n```\n\n## 🏢 상위 구성 종목 분석\n\n### Big Tech 7 종목\n\n#### 🥇 Apple (AAPL) - $234.85 (+2.27%)\n- **투자의견**: 매수 유지\n- **목표주가**: $245\n- **핵심 동력**: iPhone 16 시리즈 성공, 서비스 매출 1,000억 돌파 임박\n- **리스크**: 중국 시장 규제 불확실성\n\n#### 🥈 NVIDIA (NVDA) - $138.77 (+3.83%)\n- **투자의견**: 매수 적극 권고\n- **목표주가**: $165\n- **핵심 동력**: H100/H200 대기주문 600억달러, 데이터센터 매출 성장\n- **밸류에이션**: PER 32.8배 (프리미엄 정당화)\n\n#### 🥉 Microsoft (MSFT) - $441.28 (+1.81%)\n- **투자의견**: 매수\n- **목표주가**: $480\n- **핵심 동력**: Azure 29% 성장, Copilot 가입자 300만명\n- **경쟁 우위**: 클라우드 + AI 통합 솔루션\n\n## 📊 섹터별 심층 분석\n\n### 반도체 섹터 (⭐⭐⭐⭐⭐)\n**모멘텀 점수: 9.2/10**\n\n**긍정 요인:**\n- AI 칩 수요 폭발적 증가\n- 데이터센터 인프라 투자 확대\n- 메모리 반도체 가격 상승세\n\n**위험 요인:**\n- 중국 반도체 규제 강화\n- 공급망 지정학적 리스크\n- 과도한 기대감으로 인한 밸류에이션 부담\n\n### 소프트웨어 섹터 (⭐⭐⭐⭐)\n**모멘텀 점수: 8.7/10**\n\n**핵심 트렌드:**\n- SaaS 모델 확산 지속\n- AI 통합 솔루션 프리미엄\n- 구독 경제 안정성\n\n## ⚠️ 리스크 분석\n\n### 주요 위험 요인\n1. **밸류에이션 리스크** (High)\n   - 나스닥 PER 28.5배 (역사적 고평가)\n   - 성장주 집중도 과도\n\n2. **거시경제 리스크** (Medium)\n   - 금리 인상 압력\n   - 인플레이션 재점화 가능성\n\n3. **지정학적 리스크** (Medium)\n   - 미중 기술 패권 경쟁\n   - 대만 해협 긴장\n\n### 포트폴리오 위험 지표\n- **VaR (95% 신뢰구간)**: -8.4%\n- **최대 손실 예상**: -15.2%\n- **베타 계수**: 1.15\n\n## 💡 투자 전략 권고\n\n### 단기 전략 (1-3개월)\n```markdown\n🎯 **포지션 조정**\n- 실적 발표 시즌 대비 선별 투자\n- 변동성 증가 대비 현금 보유 비중 확대\n- 기술적 지지선 근처 매수 기회 포착\n```\n\n### 중기 전략 (3-12개월)\n```markdown\n📈 **성장 테마 중심**\n- AI 인프라 관련주 비중 확대\n- 클라우드 선도 기업 장기 보유\n- 밸류에이션 매력적인 2차 수혜주 발굴\n```\n\n### 장기 전략 (12개월+)\n```markdown\n🚀 **구조적 성장 투자**\n- 디지털 전환 가속화 수혜주\n- ESG 및 지속가능성 테마\n- 신흥 기술 (양자컴퓨팅, 로보틱스) 선점\n```\n\n## 📋 결론 및 요약\n\n### 핵심 투자 포인트\n✅ **강세 요인들이 우세**: AI 혁신, 금리 안정화, 기업 실적 개선\n✅ **기술주 모멘텀 지속**: 구조적 성장 동력 확보\n✅ **선별적 접근 필요**: 밸류에이션 고려한 종목 선택\n\n### 최종 투자 의견\n**🎯 투자등급: 매수 (BUY)**\n**📈 12개월 목표 수익률: 12-15%**\n**⚖️ 리스크 수준: 중간**\n\n---\n*본 보고서는 2025년 9월 9일 오후 4시 05분 기준으로 작성되었습니다.*\n*투자 결정은 개인의 책임이며, 본 보고서는 참고용으로만 활용하시기 바랍니다.*",
      type: "markdown_report"
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
    setAvailableResults(0);
    setShowNoActivity(true);
    setCurrentResultIndex(0);
    
    // Step 1: Show typing animation in input
    const inputText = '현재 나스닥 주요 지수와 상위 종목들의 실시간 데이터를 분석해서 마크다운 보고서로 정리해줘';
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
    }, 50);
  };
  
  const startChatDemo = () => {
    demoMessages.forEach((message, index) => {
      setTimeout(() => {
        setVisibleMessages(prev => [...prev, message.id]);
        
        // Auto advance right panel based on message progression
        if (message.id === 3) { // When search starts (thinking: "Searching Web")
          setTimeout(() => {
            setShowNoActivity(false);
            setAvailableResults(1); // Show first result
            setCurrentResultIndex(0);
          }, 800);
        } else if (message.id === 10) { // After detailed stock analysis (Magnificent 7 분석)
          setTimeout(() => {
            setAvailableResults(2); // Now show 2 results
            setCurrentResultIndex(1);
          }, 1200);
        } else if (message.id === 15) { // Excel report generation starts
          setTimeout(() => {
            setAvailableResults(3); // Now show 3 results
            setCurrentResultIndex(2);
          }, 1500);
        } else if (message.id === 16) { // Final response - report complete
          setTimeout(() => {
            setAvailableResults(4); // Show all 4 results
            setCurrentResultIndex(3);
          }, 2000);
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
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <img src="/new-logo.png" alt="AiBee" className="w-10 h-10" />
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
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <img src="/new-logo.png" alt="AiBee" className="w-10 h-10" />
          </div>
          <div className="flex-1 max-w-[80%]">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                {currentTyping === message.id ? (
                  <TypedText text={message.content} speed={20} />
                ) : (
                  message.content
                )}
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    if (message.type === 'tasks') {
      const taskData = JSON.parse(message.content);
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 mb-4"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <img src="/new-logo.png" alt="AiBee" className="w-10 h-10" />
          </div>
          <div className="flex-1 max-w-[80%]">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm overflow-hidden">
              {/* Task Header */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20">
                    <ListTodo className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-green-800">{taskData.title}</h4>
                    <p className="text-xs text-green-600">{taskData.sections[0]?.tasks.filter((t: any) => t.status === 'completed').length} / {taskData.total_tasks} 작업 완료</p>
                  </div>
                </div>
              </div>
              {/* Task List */}
              <div className="p-3">
                {taskData.sections[0]?.tasks.map((task: any, index: number) => (
                  <div key={task.id} className="flex items-center gap-3 py-2 px-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex-shrink-0">
                      {task.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {task.status === 'pending' && <Circle className="h-4 w-4 text-gray-400" />}
                      {task.status === 'in_progress' && <Clock className="h-4 w-4 text-blue-500 animate-pulse" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${
                        task.status === 'completed' ? 'text-gray-900' : 
                        task.status === 'in_progress' ? 'text-blue-700 font-medium' :
                        'text-gray-600'
                      }`}>
                        {task.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  if (showInputDemo) {
    return (
      <div ref={demoRef} className="w-full px-32 lg:px-48 xl:px-56">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src="/new-logo.png" alt="AiBee Logo" className="w-12 h-12" />
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              AiBee in Action
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            아이비가 데이터를 분석하고 인사이트를 제공하는 과정을 확인해보세요
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
                  placeholder="어떤 도움이 필요하신지 설명해주세요."
                  className="w-full px-6 py-5 text-base border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  readOnly
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center">
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
    <div ref={demoRef} className="w-full px-32 lg:px-48 xl:px-56">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-4">
          <img src="/new-logo.png" alt="AiBee Logo" className="w-24 h-24" />
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
            AiBee in Action
          </h2>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          아이비가 데이터를 분석하고 인사이트를 제공하는 과정을 확인해보세요
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <img src="/new-logo.png" alt="AiBee" className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-gray-900 font-medium text-base">AiBee</h3>
              <p className="text-gray-500 text-sm">AI Assistant</p>
            </div>
          </div>
        </div>

        {/* Split View */}
        <div className="flex h-[900px]">
          {/* Left Panel - Chat */}
          <div className="w-1/2 flex flex-col bg-gray-50">
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="popLayout">
                {demoMessages
                  .filter(message => visibleMessages.includes(message.id))
                  .map((message) => (
                    <motion.div 
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {renderMessage(message)}
                    </motion.div>
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
                <button className="px-4 py-3 bg-gray-400 text-white rounded-xl hover:bg-gray-500 transition-colors text-sm">
                  전송
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - AiBee's Computer */}
          <AnimatePresence mode="wait">
            <motion.div 
              className="w-1/2 bg-white border-l border-gray-200 flex flex-col"
              initial={{ opacity: showNoActivity ? 0.3 : 0, x: showNoActivity ? 0 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                opacity: { duration: 0.3 },
                x: { duration: 0.4, ease: "easeOut" }
              }}
            >
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
            <div className="flex-1 overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                {showNoActivity ? (
                  // No tool activity state
                  <motion.div 
                    key="no-activity"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-center h-full"
                  >
                    <div className="text-center">
                      <div className="text-gray-400 text-lg font-medium mb-2">No tool activity</div>
                      <div className="text-gray-400 text-sm">AiBee가 도구를 사용하면 여기에 표시됩니다</div>
                    </div>
                  </motion.div>
                ) : (
                <motion.div
                  key="search-results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <motion.div
                    key={currentResultIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                {/* Search Status */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Search className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">Web Search</span>
                  <div className="ml-auto">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Search completed successfully
                    </span>
                  </div>
                </div>

                {/* Images Section for market data */}
                {searchResults[currentResultIndex]?.type === 'market_data' && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Charts</span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="space-y-3">
                        <div className="group cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => window.open('https://finance.yahoo.com/quote/%5EIXIC/', '_blank')}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium text-gray-900">NASDAQ</div>
                              <div className="text-sm text-gray-500">Composite</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900">21,700.39</div>
                              <div className="text-xs text-green-600">+260.45 (+1.22%)</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="group cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => window.open('https://finance.yahoo.com/quote/AAPL/', '_blank')}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium text-gray-900">AAPL</div>
                              <div className="text-sm text-gray-500">Apple Inc.</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900">$234.85</div>
                              <div className="text-xs text-green-600">+5.21 (+2.27%)</div>
                            </div>
                          </div>
                        </div>

                        <div className="group cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => window.open('https://finance.yahoo.com/quote/NVDA/', '_blank')}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium text-gray-900">NVDA</div>
                              <div className="text-sm text-gray-500">NVIDIA Corp.</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900">$138.77</div>
                              <div className="text-xs text-green-600">+5.12 (+3.83%)</div>
                            </div>
                          </div>
                        </div>

                        <div className="group cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => window.open('https://finance.yahoo.com/quote/MSFT/', '_blank')}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium text-gray-900">MSFT</div>
                              <div className="text-sm text-gray-500">Microsoft Corp.</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900">$441.28</div>
                              <div className="text-xs text-green-600">+7.84 (+1.81%)</div>
                            </div>
                          </div>
                        </div>

                        <div className="group cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => window.open('https://finance.yahoo.com/quote/GOOGL/', '_blank')}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium text-gray-900">GOOGL</div>
                              <div className="text-sm text-gray-500">Alphabet Class A</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900">$178.42</div>
                              <div className="text-xs text-red-600">-0.89 (-0.50%)</div>
                            </div>
                          </div>
                        </div>

                        <div className="group cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => window.open('https://finance.yahoo.com/quote/AMZN/', '_blank')}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium text-gray-900">AMZN</div>
                              <div className="text-sm text-gray-500">Amazon.com Inc.</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900">$189.45</div>
                              <div className="text-xs text-green-600">+2.98 (+1.60%)</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search Results */}
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-3">
                    Search Results ({availableResults})
                    <span className="ml-auto text-xs text-gray-500 float-right">
                      2025. 9. 9.
                    </span>
                  </div>
                </div>

                {/* Individual Search Result */}
                <div className="space-y-3">
                  <div 
                    className="group cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                    onClick={() => window.open(searchResults[currentResultIndex]?.url, '_blank')}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Globe className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-xs text-gray-500">Website</span>
                        </div>
                        <h3 className="text-sm font-medium text-blue-600 group-hover:text-blue-700 mb-1 line-clamp-2">
                          {searchResults[currentResultIndex]?.title}
                        </h3>
                        <div className="text-xs text-gray-500 mb-2 truncate">
                          {searchResults[currentResultIndex]?.url}
                        </div>
                        <div className="text-xs text-gray-700 line-clamp-3 leading-relaxed">
                          {searchResults[currentResultIndex]?.content.split('\n')[0]}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="mt-4 text-sm text-gray-800 leading-relaxed">
                  <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-line max-h-96 overflow-y-auto">
                    {searchResults[currentResultIndex]?.content}
                  </div>
                </div>
                  </motion.div>
                </motion.div>
                )}
              </AnimatePresence>
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
                
                <div className="text-xs text-gray-600">
                  {currentResultIndex + 1}/{searchResults.length}
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
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                    {searchResults.length} results
                  </span>
                  {searchResults[currentResultIndex]?.type === 'markdown_report' && (
                    <button 
                      className="text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-full flex items-center gap-1 transition-colors cursor-default opacity-50"
                      title="마크다운 보고서 보기"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Markdown
                    </button>
                  )}
                  <button className="text-xs text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                    🔄 Jump to Latest
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  2025. 9. 9. 오전 10:09:20
                </div>
              </div>
            </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default StreamingDemo;