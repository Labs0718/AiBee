'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Globe, 
  Database, 
  BarChart3, 
  TrendingUp,
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  ExternalLink,
  FileSpreadsheet,
  Activity,
  Calculator,
  LineChart,
  PieChart,
  DollarSign,
  Target,
  Briefcase,
  Sparkles,
  Bot,
  Brain,
  Code2,
  User,
  ChevronRight,
  Layers,
  Cpu,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Shield,
  Gauge
} from 'lucide-react';

// Fake chart data
const chartData = {
  nasdaq: [
    { time: '09:30', value: 15820 },
    { time: '10:00', value: 15835 },
    { time: '10:30', value: 15810 },
    { time: '11:00', value: 15845 },
    { time: '11:30', value: 15860 },
    { time: '12:00', value: 15847 },
  ],
  volume: [
    { time: '09:30', value: 1200 },
    { time: '10:00', value: 1450 },
    { time: '10:30', value: 1380 },
    { time: '11:00', value: 1600 },
    { time: '11:30', value: 1550 },
    { time: '12:00', value: 1420 },
  ]
};

// Mini chart component
function MiniChart({ data, color = "blue", height = 60 }: { data: any[], color?: string, height?: number }) {
  const colorMap = {
    blue: { stroke: "#3b82f6", fill: "#3b82f6" },
    green: { stroke: "#10b981", fill: "#10b981" },
    red: { stroke: "#ef4444", fill: "#ef4444" },
    purple: { stroke: "#8b5cf6", fill: "#8b5cf6" }
  };
  
  const colors = colorMap[color as keyof typeof colorMap] || colorMap.blue;
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min;

  return (
    <div className="relative" style={{ height }}>
      <svg className="w-full h-full">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.fill} stopOpacity="0.3" />
            <stop offset="100%" stopColor={colors.fill} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          d={`M ${data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = ((max - d.value) / range) * height;
            return `${x},${y}`;
          }).join(' L ')}`}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="2"
        />
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          d={`M ${data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = ((max - d.value) / range) * height;
            return `${x},${y}`;
          }).join(' L ')} L 100,${height} L 0,${height} Z`}
          fill={`url(#gradient-${color})`}
        />
      </svg>
    </div>
  );
}

// Stock card component
function StockCard({ symbol, price, change, volume, trend }: any) {
  const isPositive = change > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">{symbol}</h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${price}</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
          isPositive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
        }`}>
          {isPositive ? (
            <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400" />
          )}
          <span className={`font-semibold text-sm ${
            isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {Math.abs(change)}%
          </span>
        </div>
      </div>
      <div className="h-12 mb-2">
        <MiniChart data={trend} color={isPositive ? "blue" : "green"} height={48} />
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Vol: {volume}</span>
        <span>24h</span>
      </div>
    </motion.div>
  );
}

// Market overview component
function MarketOverview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          글로벌 테크 인덱스 분석
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">실시간</span>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">15,847.23</span>
            <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              +1.24%
            </span>
          </div>
          
          {/* Main Price Chart */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">주가 추이</span>
            </div>
            <MiniChart data={chartData.nasdaq} height={60} />
          </div>
          
          {/* Daily High/Low Charts */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpRight className="w-3 h-3 text-green-600" />
                <span className="text-xs font-medium text-green-600">일일 최고 (15,862)</span>
              </div>
              <MiniChart data={[
                { time: '09:30', value: 15820 },
                { time: '10:00', value: 15840 },
                { time: '10:30', value: 15855 },
                { time: '11:00', value: 15862 },
                { time: '11:30', value: 15850 },
                { time: '12:00', value: 15847 },
              ]} color="green" height={40} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownRight className="w-3 h-3 text-red-600" />
                <span className="text-xs font-medium text-red-600">일일 최저 (15,798)</span>
              </div>
              <MiniChart data={[
                { time: '09:30', value: 15800 },
                { time: '10:00', value: 15798 },
                { time: '10:30', value: 15810 },
                { time: '11:00', value: 15820 },
                { time: '11:30', value: 15815 },
                { time: '12:00', value: 15830 },
              ]} color="red" height={40} />
            </div>
          </div>
          
          {/* Volume Chart */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-3 h-3 text-purple-600" />
              <span className="text-xs font-medium text-purple-600">거래량 (4.2B)</span>
            </div>
            <MiniChart data={chartData.volume} color="purple" height={35} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2">
            <p className="text-gray-500 dark:text-gray-400">일일 최고</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">15,862</p>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2">
            <p className="text-gray-500 dark:text-gray-400">일일 최저</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">15,798</p>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2">
            <p className="text-gray-500 dark:text-gray-400">거래량</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">4.2B</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Heatmap component
function SectorHeatmap() {
  const sectors = [
    { name: 'Tech', change: 2.1, color: 'bg-green-500' },
    { name: 'Finance', change: 0.8, color: 'bg-green-400' },
    { name: 'Health', change: 1.2, color: 'bg-green-400' },
    { name: 'Energy', change: -0.5, color: 'bg-red-400' },
    { name: 'Retail', change: -0.8, color: 'bg-red-500' },
    { name: 'Auto', change: 0.3, color: 'bg-green-300' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
        <PieChart className="w-4 h-4" />
        섹터별 히트맵
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {sectors.map((sector, i) => (
          <motion.div
            key={sector.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`${sector.color} bg-opacity-20 dark:bg-opacity-30 rounded-lg p-3 text-center`}
          >
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{sector.name}</p>
            <p className={`text-sm font-bold ${
              sector.change > 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
            }`}>
              {sector.change > 0 ? '+' : ''}{sector.change}%
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

const streamingMessages = [
  {
    id: 1,
    type: 'user',
    content: '현재 나스닥 주요 지수와 상위 종목들의 실시간 데이터를 분석해서 엑셀 파일로 다운로드할 수 있게 정리해줘',
    delay: 0
  },
  {
    id: 2,
    type: 'thinking',
    content: 'AiBee가 요청을 분석하고 있습니다...',
    delay: 1000
  },
  {
    id: 3,
    type: 'tool',
    toolName: 'web_search',
    toolCategory: 'Data Collection',
    content: 'AiBee가 실시간 나스닥 지수 데이터를 검색하고 있습니다...',
    delay: 2500,
    icon: Search,
    progress: true
  },
  {
    id: 4,
    type: 'tool',
    toolName: 'market_data_api',
    toolCategory: 'API Integration',
    content: 'AiBee가 NASDAQ API에서 실시간 데이터를 수집하고 있습니다...',
    delay: 4000,
    icon: Database,
    progress: true
  },
  {
    id: 5,
    type: 'assistant',
    content: 'NASDAQ Composite Index의 실시간 데이터 수집을 완료했습니다.\n\n**📊 현재 시장 상황 (UTC+9)**\n• 지수: 15,847.23 (+197.12, +1.24%)\n• 거래량: 4,236,847,293 shares\n• 시가총액: $21.3T\n• P/E 비율: 26.4\n• 52주 최고/최저: 16,212.33 / 13,045.12\n• 변동성(VIX): 18.4\n• 베타: 1.12\n\n**🔍 기술적 분석 초기 지표**\n• RSI(14): 58.3 (중립)\n• MACD: 양전환 신호\n• 볼린저 밴드: 중간선 근처\n\n다음 단계: 개별 종목 스크리닝 시작...',
    delay: 5500,
    icon: BarChart3,
    hasLinks: true,
    showChart: 'market'
  },
  {
    id: 6,
    type: 'tool',
    toolName: 'stock_screener',
    toolCategory: 'Analysis',
    content: '시가총액 상위 100개 종목 스크리닝...',
    delay: 7000,
    icon: Target,
    progress: true
  },
  {
    id: 7,
    type: 'assistant',
    content: '시가총액 상위 100개 기업 분석이 완료되었습니다.\n\n**🏆 TOP 5 종목 상세 분석**\n```\n티커   가격      변동률   시총      거래량     P/E   베타\nAAPL  $175.23  +2.1%   $2.84T   52.3M    28.4  1.21\nMSFT  $412.45  +1.8%   $3.06T   28.7M    32.1  0.89\nGOOGL $142.87  +3.2%   $1.78T   31.2M    24.8  1.05\nAMZN  $151.94  +0.9%   $1.58T   45.8M    58.2  1.33\nTSLA  $248.73  +4.7%   $789B    89.4M    62.1  2.04\n```\n\n**📈 섹터별 성과 요약**\n• Technology: +2.31% (가중평균)\n• Communication: +1.87%\n• Consumer Discretionary: +0.94%\n• Healthcare: +0.78%\n• Energy: -0.52%\n\n**⚡ 실시간 모멘텀 분석**\n• 상승 종목: 347개 (69.4%)\n• 하락 종목: 153개 (30.6%)\n• 신고가: 23개\n• 신저가: 7개\n\n고급 기술적 지표 계산을 시작합니다...',
    delay: 8500,
    icon: Briefcase,
    hasLinks: true,
    hasCode: true,
    showChart: 'stocks'
  },
  {
    id: 8,
    type: 'thinking',
    content: 'AiBee가 RSI, MACD, 볼린저 밴드를 계산하고 있습니다...',
    delay: 10000
  },
  {
    id: 9,
    type: 'tool',
    toolName: 'technical_analysis',
    toolCategory: 'Calculation',
    content: '기술적 분석 지표 연산 수행...',
    delay: 11000,
    icon: LineChart,
    progress: true
  },
  {
    id: 10,
    type: 'assistant',
    content: '11개 주요 섹터에 대한 심층 분석을 완료했습니다.\n\n**🔬 섹터별 상세 분석 결과**\n\n**Technology (+2.31%)**\n├ 반도체: +3.44% | 평균거래량: ↑127%\n│ └ NVDA: +4.2%, AMD: +3.8%, QCOM: +2.1%\n├ 소프트웨어: +1.83% | 클라우드 강세\n│ └ CRM: +2.4%, ADBE: +1.9%, NOW: +3.1%\n└ 하드웨어: +0.97%\n\n**Healthcare (+0.78%)**\n├ 바이오텍: +1.24% | mRNA 테마 지속\n│ └ MRNA: +5.2%, BNTX: +4.1%\n├ 제약: +0.52%\n└ 의료기기: +0.81%\n\n**Consumer Discretionary (-0.31%)**\n├ 전자상거래: +0.94%\n├ 소매: -0.83% | 인플레이션 우려\n└ 자동차: +2.14% | EV 관련 강세\n\n**📊 핫 세그먼트**\n• AI/ML: +4.2% (27개 종목)\n• 사이버보안: +2.8% (15개 종목)\n• 클린에너지: +3.1% (19개 종목)\n• 핀테크: +1.6% (22개 종목)',
    delay: 12500,
    icon: PieChart,
    hasLinks: true,
    showChart: 'heatmap'
  },
  {
    id: 11,
    type: 'tool',
    toolName: 'sentiment_analysis',
    toolCategory: 'AI Analysis',
    content: 'AiBee가 시장 심리를 분석하고 있습니다...',
    delay: 14000,
    icon: Brain,
    progress: true
  },
  {
    id: 12,
    type: 'assistant',
    content: '멀티소스 센티먼트 분석이 완료되었습니다.\n\n**🧠 AI 기반 시장 심리 지수**\n• Fear & Greed Index: 67.3/100 (탐욕 구간)\n• 소셜 미디어 지수: 72.1/100 (강한 긍정)\n• 뉴스 센티먼트: 68.4/100 (긍정)\n• 옵션 Put/Call 비율: 0.83 (낙관적)\n\n**📰 실시간 뉴스 임팩트 분석**\n\n🔹 **연준 정책 (임팩트: +1.24%)**\n├ 기준금리 동결 확정\n├ 인플레이션 둔화 신호\n└ 2024 Q4 금리인하 가능성 ↑\n\n🔹 **AI 반도체 (임팩트: +2.78%)**\n├ 엔비디아 GPU 수요 급증\n├ 중국 수출 규제 완화 기대\n└ 데이터센터 투자 확대\n\n🔹 **유가/원자재 (임팩트: -0.31%)**\n├ WTI 원유: -2.4% → $78.24/배럴\n├ 달러 인덱스: -0.8%\n└ 금: +0.6% → $1,943/온스\n\n**💰 스마트머니 플로우 (24시간)**\n• 기관투자자: 순매수 $2.14B\n• 개인투자자: 순매도 $892M\n• 외국인: 순매수 $1.33B\n• ETF 자금유입: +$847M',
    delay: 15500,
    icon: Activity,
    hasLinks: true
  },
  {
    id: 13,
    type: 'tool',
    toolName: 'risk_calculator',
    toolCategory: 'Risk Management',
    content: '포트폴리오 리스크 계산...',
    delay: 17000,
    icon: AlertTriangle,
    progress: true
  },
  {
    id: 14,
    type: 'assistant',
    content: '고급 리스크 관리 분석을 완료했습니다.\n\n**⚠️ 다차원 리스크 평가**\n\n**변동성 프로파일**\n• VIX (공포지수): 18.4 → 보통 위험\n• 실현변동성 (20일): 16.2%\n• 내재변동성: 19.7%\n• 변동성 스큐: -0.23\n\n**포트폴리오 리스크 지표**\n• VaR (95%, 1일): -2.14%\n• CVaR (조건부 VaR): -3.28%\n• 예상 최대낙폭 (MDD): -8.31%\n• 샤프 비율: 1.47\n• 소르티노 비율: 2.03\n• 최대 드로다운 기간: 23일\n\n**📊 시나리오 분석**\n\n**불곰장 시나리오 (-15% 조정)**\n├ 확률: 12.4%\n├ 기간: 45-90일\n└ 회복 기간: 120-180일\n\n**횡보장 시나리오 (±5%)**\n├ 확률: 68.2%\n├ 기간: 30-60일\n└ 브레이크아웃 대기\n\n**강황장 시나리오 (+20% 상승)**\n├ 확률: 19.4%\n├ 기간: 90-150일\n└ 신고점 갱신 가능\n\n**🎯 전략적 포지셔닝 권고**\n✅ **매수 적기**: 현재가 기준 -2~3% 하락시\n✅ **핵심 지지선**: 15,000p (강력), 14,750p (최종)\n✅ **목표가**: 16,500p (1차), 17,200p (2차)\n⚠️ **손절라인**: 14,500p 이하 진입시',
    delay: 18500,
    icon: Calculator,
    hasLinks: true
  },
  {
    id: 15,
    type: 'thinking',
    content: 'AiBee가 엑셀 파일 생성을 준비하고 있습니다...',
    delay: 20000
  },
  {
    id: 16,
    type: 'tool',
    toolName: 'excel_generator',
    toolCategory: 'File Generation',
    content: '데이터 정리 및 엑셀 파일 생성...',
    delay: 21000,
    icon: FileSpreadsheet,
    progress: true
  },
  {
    id: 17,
    type: 'assistant',
    content: '🎉 **NASDAQ 종합 분석 리포트 v2.1 완성!**\n\n**📋 Excel 파일 구성 (총 7개 시트)**\n\n**📊 Sheet 1: 실시간 대시보드**\n├ 주요 지수 현황 (15분 지연)\n├ 상위 100개 종목 실시간 데이터\n├ 섹터별 히트맵\n└ 뉴스 임팩트 스코어\n\n**📈 Sheet 2: 기술적 분석**\n├ 30+ 기술지표 (RSI, MACD, 볼밴 등)\n├ 피보나치 되돌림 레벨\n├ 지지/저항 라인 자동 계산\n└ 패턴 인식 결과\n\n**🎯 Sheet 3: 개별 종목 분석**\n├ Top 50 종목 상세 프로파일\n├ 실적 대비 주가 분석\n├ 애널리스트 컨센서스\n└ 목표주가 추정치\n\n**🌍 Sheet 4: 섹터/산업 분석**\n├ 11개 섹터 심층 분석\n├ 산업별 밸류에이션\n├ 성장률 vs 위험도 매트릭스\n└ 테마주 분석 (AI, ESG, 핀테크 등)\n\n**⚠️ Sheet 5: 리스크 관리**\n├ 포트폴리오 VaR 계산기\n├ 상관관계 분석 매트릭스\n├ 시나리오 스트레스 테스트\n└ 최적 포지션 사이징\n\n**💡 Sheet 6: 투자 아이디어**\n├ 스크리닝 결과 (10개 조건)\n├ 페어 트레이딩 기회\n├ 이벤트 드리븐 전략\n└ 롱/숏 포지션 제안\n\n**📅 Sheet 7: 캘린더 & 일정**\n├ 주요 경제지표 발표일\n├ 실적 발표 캘린더\n├ 연준 회의 일정\n└ 옵션 만료일\n\n**🔥 핵심 투자 인사이트**\n🎯 **AI 테마주**: 6개월 목표수익률 +25%\n📊 **기술적 분석**: RSI 55-65, 적정 매수구간\n💼 **포트폴리오**: 기술주 60%, 방어주 40% 권장\n⚡ **단기 전략**: 15,000-16,500 박스권 매매\n🌟 **장기 전망**: 2024년 목표 18,000p\n\n**📄 보고서 요약 (2페이지 PDF 포함)**\n• 투자 등급: **매수 (BUY)**\n• 신뢰도: 94.7% (AI 검증)\n• 업데이트: 매 15분 (실시간)\n\n파일 다운로드가 준비되었습니다! 📥',
    delay: 22500,
    icon: CheckCircle,
    status: 'complete',
    showDownload: true,
    hasLinks: true
  }
];

export function StreamingDemo() {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [currentTyping, setCurrentTyping] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [messageRef, setMessageRef] = useState<any>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const startDemo = () => {
    setVisibleMessages([]);
    setCurrentTyping(null);
    setIsPlaying(true);
    setHasStarted(true);

    streamingMessages.forEach((message, index) => {
      setTimeout(() => {
        setVisibleMessages(prev => [...prev, message.id]);
        setCurrentTyping(message.id);
        
        // Enhanced streaming speeds for more messages
        const typingDuration = message.type === 'thinking' ? 1200 : 
                             message.type === 'tool' ? 1800 : 
                             message.type === 'user' ? 0 : 2500;
        
        setTimeout(() => {
          setCurrentTyping(null);
          if (index === streamingMessages.length - 1) {
            setIsPlaying(false);
          }
        }, typingDuration);
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

  // Auto scroll during demo playback
  useEffect(() => {
    if (isPlaying && (leftPanelRef.current || rightPanelRef.current)) {
      const scrollToBottom = () => {
        if (leftPanelRef.current) {
          leftPanelRef.current.scrollTo({
            top: leftPanelRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
        if (rightPanelRef.current) {
          rightPanelRef.current.scrollTo({
            top: rightPanelRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      };
      
      // Small delay to ensure content is rendered
      const timeoutId = setTimeout(scrollToBottom, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [visibleMessages, currentTyping, isPlaying]);

  const renderMessage = (message: any) => {
    if (!message || !message.type || !message.content) return null;
    
    if (message.type === 'thinking') {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-start gap-3 max-w-4xl"
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-xl">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 pt-2">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </motion.div>
              {currentTyping === message.id ? (
                <TypingText text={message.content} speed={60} />
              ) : (
                message.content
              )}
            </div>
          </div>
        </motion.div>
      );
    }

    if (message.type === 'tool') {
      return (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-start gap-3 max-w-4xl"
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-xl">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  {message.icon && (
                    <message.icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                  {message.toolCategory}
                </span>
                <ChevronRight className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {message.toolName}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {currentTyping === message.id ? (
                  <>
                    <TypingText text={message.content} speed={25} />
                    {message.progress && (
                      <motion.div className="mt-3 space-y-2">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>진행률</span>
                          <span className="font-medium">처리 중...</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                          <motion.div
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2.2, ease: "easeInOut" }}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded">
                            <div className="text-indigo-600 dark:text-indigo-400 font-medium">API 호출</div>
                            <div className="text-indigo-800 dark:text-indigo-200 font-bold">24/27</div>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                            <div className="text-purple-600 dark:text-purple-400 font-medium">데이터 처리</div>
                            <div className="text-purple-800 dark:text-purple-200 font-bold">847KB</div>
                          </div>
                          <div className="bg-pink-50 dark:bg-pink-900/20 p-2 rounded">
                            <div className="text-pink-600 dark:text-pink-400 font-medium">지연시간</div>
                            <div className="text-pink-800 dark:text-pink-200 font-bold">1.2ms</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <>
                    {message.content}
                    {message.progress && (
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>진행률</span>
                          <span className="font-medium text-green-600">완료</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded">
                            <div className="text-indigo-600 dark:text-indigo-400 font-medium">API 호출</div>
                            <div className="text-indigo-800 dark:text-indigo-200 font-bold">27/27</div>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                            <div className="text-purple-600 dark:text-purple-400 font-medium">데이터 처리</div>
                            <div className="text-purple-800 dark:text-purple-200 font-bold">1.2MB</div>
                          </div>
                          <div className="bg-pink-50 dark:bg-pink-900/20 p-2 rounded">
                            <div className="text-pink-600 dark:text-pink-400 font-medium">평균 지연</div>
                            <div className="text-pink-800 dark:text-pink-200 font-bold">0.9ms</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      );
    }

    if (message.type === 'user') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-start gap-3 justify-end"
        >
          <div className="max-w-3xl">
            <div className="bg-white dark:bg-gray-100 border border-gray-200 dark:border-gray-300 text-gray-800 dark:text-gray-900 rounded-2xl rounded-br-sm px-5 py-3.5 shadow-lg">
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center flex-shrink-0 shadow-lg">
            <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </div>
        </motion.div>
      );
    }

    if (message.type === 'assistant') {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-xl">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="max-w-none text-gray-700 dark:text-gray-300">
              {currentTyping === message.id ? (
                <div className="space-y-2">
                  <StreamingText 
                    text={message.content} 
                    speed={15}
                    onComplete={() => setMessageRef(message)}
                  />
                </div>
              ) : (
                <FormattedContent 
                  content={message.content} 
                  hasLinks={message.hasLinks}
                  hasCode={message.hasCode}
                />
              )}
            </div>

            {message.showDownload && currentTyping !== message.id && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4"
              >
                <div className="flex flex-wrap gap-3">
                  <motion.a 
                    href="/downloads/NASDAQ_Analysis_2025.xlsx"
                    download="NASDAQ_Analysis_2025.xlsx"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-5 py-3 rounded-xl text-sm font-medium transition-all shadow-xl hover:shadow-2xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="w-4 h-4" />
                    Excel 다운로드
                  </motion.a>
                  <motion.a
                    href="https://www.nasdaq.com/market-activity"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 text-gray-700 dark:text-gray-300 px-5 py-3 rounded-xl text-sm font-medium transition-all shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Globe className="w-4 h-4" />
                    실시간 데이터
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </motion.a>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      );
    }

    return null;
  };

  // Get the current chart to show in right panel
  const getCurrentChart = () => {
    const currentMessage = streamingMessages.find(m => visibleMessages.includes(m.id) && m.showChart);
    if (!currentMessage) return null;
    
    if (currentMessage.showChart === 'market') return <MarketOverview />;
    if (currentMessage.showChart === 'stocks') {
      return (
        <div className="grid grid-cols-1 gap-3">
          <StockCard 
            symbol="AAPL" 
            price="175.23" 
            change={2.1} 
            volume="52M"
            trend={[
              { value: 172 },
              { value: 173.5 },
              { value: 174 },
              { value: 173 },
              { value: 175.23 }
            ]}
          />
          <StockCard 
            symbol="MSFT" 
            price="412.45" 
            change={1.8} 
            volume="28M"
            trend={[
              { value: 408 },
              { value: 410 },
              { value: 409 },
              { value: 411 },
              { value: 412.45 }
            ]}
          />
        </div>
      );
    }
    if (currentMessage.showChart === 'heatmap') return <SectorHeatmap />;
    return null;
  };

  return (
    <div ref={demoRef} className="w-full px-1 flex justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 w-full max-w-none" style={{width: 'calc(100vw - 2rem)'}}>
        {/* Refined Chat Header */}
        <div className="bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-850 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"></div>
              </div>
              <div>
                <h3 className="text-gray-900 dark:text-white font-semibold text-lg">
                  AiBee
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  Financial AI Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-1.5 border border-emerald-200 dark:border-emerald-700/30">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>
                  <span className="text-emerald-700 dark:text-emerald-400 text-xs font-medium">Live Analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Panel Layout */}
        <div className="flex h-[800px]">
          {/* Left Panel - AI Conversation */}
          <div ref={leftPanelRef} className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
            <div className="p-6 space-y-6">
              <AnimatePresence mode="popLayout">
                {streamingMessages
                  .filter(message => visibleMessages.includes(message.id))
                  .map((message) => {
                    if (!message || !message.id) return null;
                    return (
                      <motion.div
                        key={message.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {renderMessage(message)}
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
              
              {currentTyping && streamingMessages.find(m => m.id === currentTyping)?.type === 'assistant' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <motion.div
                      className="w-2.5 h-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div
                      className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2.5 h-2.5 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Panel - AI Thinking & Analysis */}
          <div ref={rightPanelRef} className="w-[500px] bg-slate-50 dark:bg-slate-900 overflow-y-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <Brain className="w-4 h-4 text-blue-600" />
                  AI 사고 과정
                </div>
                <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">실시간</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">머신러닝 모델을 통한 실시간 분석</p>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Show different content based on demo state */}
              {!hasStarted ? (
                /* Before demo starts - Empty/waiting state */
                <div className="space-y-6">
                  <div className="text-center py-20">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="mx-auto w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                    >
                      <Brain className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-2">
                      데모를 시작해보세요
                    </h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
                      아래 "데모 시작" 버튼을 클릭하면 AI의 실시간 분석 과정을 확인할 수 있습니다.
                    </p>
                  </div>
                </div>
              ) : !visibleMessages.some(id => {
                const message = streamingMessages.find(m => m.id === id);
                return message && message.type === 'user';
              }) ? (
                /* Before user question - Simple waiting state */
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl"
                    >
                      <Brain className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
                      AI 대기 중
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                      질문을 입력하시면 AI 분석 엔진이 실시간으로 데이터를 처리하고 인사이트를 제공합니다.
                    </p>
                    <div className="mt-6 flex justify-center gap-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-blue-400 rounded-full"
                          animate={{
                            opacity: [0.3, 1, 0.3],
                            scale: [0.8, 1.2, 0.8]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* After user question - Full analysis interface */
                <>
                  {/* Real-time Data Processing */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <Activity className="w-4 h-4 text-purple-600" />
                      실시간 데이터 처리 엔진
                    </h4>
                
                {/* API Endpoints Status */}
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h5 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    API 엔드포인트 상태
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600 dark:text-slate-400">NASDAQ API</span>
                      <span className="flex items-center gap-1 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Active
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600 dark:text-slate-400">Yahoo Finance</span>
                      <span className="flex items-center gap-1 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Active
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600 dark:text-slate-400">Bloomberg API</span>
                      <span className="flex items-center gap-1 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Active
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600 dark:text-slate-400">Reuters Feed</span>
                      <span className="flex items-center gap-1 text-yellow-600">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        Syncing
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Memory & Cache Status */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-1 mb-1">
                      <Layers className="w-3 h-3 text-purple-600" />
                      <span className="text-xs font-medium text-purple-700 dark:text-purple-300">메모리</span>
                    </div>
                    <div className="text-sm font-bold text-purple-800 dark:text-purple-200">2.1GB</div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">/ 8GB</div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-1 mb-1">
                      <Cpu className="w-3 h-3 text-orange-600" />
                      <span className="text-xs font-medium text-orange-700 dark:text-orange-300">CPU</span>
                    </div>
                    <div className="text-sm font-bold text-orange-800 dark:text-orange-200">23%</div>
                    <div className="text-xs text-orange-600 dark:text-orange-400">사용률</div>
                  </div>
                  <div className="bg-cyan-50 dark:bg-cyan-900/20 p-2 rounded border border-cyan-200 dark:border-cyan-800">
                    <div className="flex items-center gap-1 mb-1">
                      <Database className="w-3 h-3 text-cyan-600" />
                      <span className="text-xs font-medium text-cyan-700 dark:text-cyan-300">캐시</span>
                    </div>
                    <div className="text-sm font-bold text-cyan-800 dark:text-cyan-200">94%</div>
                    <div className="text-xs text-cyan-600 dark:text-cyan-400">히트률</div>
                  </div>
                </div>
              </div>

              {/* Advanced Chart Analysis */}
              {getCurrentChart() && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                    <BarChart3 className="w-4 h-4 text-orange-600" />
                    차트 분석 엔진
                  </h4>
                  
                  {/* Professional Trading Dashboard */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 p-4 rounded-xl border border-slate-700 shadow-2xl backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-500/30">
                          <TrendingUp className="w-5 h-5 text-cyan-400" />
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-white">Quantum AI Analytics Engine</h5>
                          <p className="text-xs text-cyan-400">Neural Network Processing • 247ms latency</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-3 py-1 rounded-full border border-green-500/30">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
                          <span className="text-xs font-medium text-green-400">STREAMING</span>
                        </div>
                      </div>
                    </div>
                    {/* Real-time Market Metrics */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-slate-800/50 backdrop-blur-sm p-3 rounded-lg border border-slate-700/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">RSI(14)</span>
                            <Activity className="w-3 h-3 text-cyan-400" />
                          </div>
                          <div className="flex items-baseline gap-1">
                            <div className="text-2xl font-bold text-white">58.3</div>
                            <span className="text-xs text-cyan-400">+2.4</span>
                          </div>
                          <div className="mt-2 h-8">
                            <svg width="100%" height="100%" viewBox="0 0 100 32" preserveAspectRatio="none">
                              <path d="M0,16 L10,12 L20,18 L30,8 L40,14 L50,10 L60,16 L70,13 L80,19 L90,15 L100,12" stroke="#06b6d4" strokeWidth="2" fill="none" />
                              <path d="M0,16 L10,12 L20,18 L30,8 L40,14 L50,10 L60,16 L70,13 L80,19 L90,15 L100,12 L100,32 L0,32 Z" fill="url(#gradient1)" opacity="0.2" />
                              <defs>
                                <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#06b6d4" />
                                  <stop offset="100%" stopColor="transparent" />
                                </linearGradient>
                              </defs>
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/50 backdrop-blur-sm p-3 rounded-lg border border-slate-700/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">MACD</span>
                            <TrendingUp className="w-3 h-3 text-green-400" />
                          </div>
                          <div className="flex items-baseline gap-1">
                            <div className="text-2xl font-bold text-white">+0.24</div>
                            <span className="text-xs text-green-400">↑ BUY</span>
                          </div>
                          <div className="mt-2 flex items-end h-8 gap-0.5">
                            {[4, 6, 3, 8, 5, 9, 6, 7, 10, 8, 12, 9].map((height, i) => (
                              <div key={i} className="flex-1 bg-gradient-to-t from-green-500/40 to-green-500/20 rounded-t" style={{height: `${height * 2.5}px`}}></div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/50 backdrop-blur-sm p-3 rounded-lg border border-slate-700/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">BB %B</span>
                            <BarChart3 className="w-3 h-3 text-blue-400" />
                          </div>
                          <div className="flex items-baseline gap-1">
                            <div className="text-2xl font-bold text-white">0.47</div>
                            <span className="text-xs text-blue-400">NEUTRAL</span>
                          </div>
                          <div className="mt-2 relative h-8">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-green-500/20 rounded"></div>
                            <div className="absolute top-1/2 -translate-y-1/2 left-[47%] w-0.5 h-full bg-blue-400"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/50 backdrop-blur-sm p-3 rounded-lg border border-slate-700/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">STOCH RSI</span>
                            <Gauge className="w-3 h-3 text-purple-400" />
                          </div>
                          <div className="flex items-baseline gap-1">
                            <div className="text-2xl font-bold text-white">67.2</div>
                            <span className="text-xs text-yellow-400">⚠ HEAT</span>
                          </div>
                          <div className="mt-2 relative h-8">
                            <svg width="100%" height="100%" viewBox="0 0 100 32">
                              <circle cx="67" cy="16" r="12" fill="url(#radialGradient)" opacity="0.6" />
                              <circle cx="67" cy="16" r="4" fill="#a855f7" />
                              <defs>
                                <radialGradient id="radialGradient">
                                  <stop offset="0%" stopColor="#a855f7" />
                                  <stop offset="100%" stopColor="transparent" />
                                </radialGradient>
                              </defs>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Market Intelligence Data */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-slate-800/50 backdrop-blur-sm p-3 rounded-lg border border-slate-700/50">
                        <h6 className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Target className="w-3 h-3 text-amber-400" />
                          CRITICAL LEVELS
                        </h6>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">Support S1</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs text-green-400">15,012</span>
                              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">Resistance R1</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs text-red-400">16,180</span>
                              <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">Fib 61.8%</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs text-amber-400">15,847</span>
                              <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/50 backdrop-blur-sm p-3 rounded-lg border border-slate-700/50">
                        <h6 className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-cyan-400" />
                          MARKET BREADTH
                        </h6>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">Advancing</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full w-[69%] bg-gradient-to-r from-green-500 to-green-400"></div>
                              </div>
                              <span className="font-mono text-xs text-green-400">69.4%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">Declining</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full w-[31%] bg-gradient-to-r from-red-500 to-red-400"></div>
                              </div>
                              <span className="font-mono text-xs text-red-400">30.6%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">New Highs</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs text-cyan-400">23</span>
                              <span className="text-[10px] text-cyan-400/60">↑ +5</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Real-time Data Feed Status */}
                    <div className="border-t border-slate-700/50 pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">DATA FEEDS</span>
                        <span className="text-[10px] text-green-400 flex items-center gap-1">
                          <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                          ALL SYSTEMS OPERATIONAL
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                          <div className="flex items-center gap-1 mb-1">
                            <Globe className="w-2.5 h-2.5 text-cyan-400" />
                            <span className="text-[9px] text-slate-400">NYSE</span>
                          </div>
                          <div className="text-[10px] font-mono text-white">247ms</div>
                        </div>
                        <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                          <div className="flex items-center gap-1 mb-1">
                            <BarChart3 className="w-2.5 h-2.5 text-blue-400" />
                            <span className="text-[9px] text-slate-400">NASDAQ</span>
                          </div>
                          <div className="text-[10px] font-mono text-white">189ms</div>
                        </div>
                        <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                          <div className="flex items-center gap-1 mb-1">
                            <TrendingUp className="w-2.5 h-2.5 text-green-400" />
                            <span className="text-[9px] text-slate-400">LSE</span>
                          </div>
                          <div className="text-[10px] font-mono text-white">312ms</div>
                        </div>
                        <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                          <div className="flex items-center gap-1 mb-1">
                            <Activity className="w-2.5 h-2.5 text-amber-400" />
                            <span className="text-[9px] text-slate-400">CRYPTO</span>
                          </div>
                          <div className="text-[10px] font-mono text-white">94ms</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Advanced Trading Chart */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 rounded-xl border border-slate-700 shadow-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-cyan-400" />
                        Real-time Market Visualization
                      </h4>
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-slate-400 hover:text-white transition-colors">1D</button>
                        <button className="text-xs text-cyan-400 font-medium">1W</button>
                        <button className="text-xs text-slate-400 hover:text-white transition-colors">1M</button>
                        <button className="text-xs text-slate-400 hover:text-white transition-colors">YTD</button>
                      </div>
                    </div>
                    <div className="relative h-48 bg-slate-900/50 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 p-4">
                        {getCurrentChart()}
                      </div>
                      {/* Grid overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="h-full w-full" style={{backgroundImage: 'linear-gradient(to right, rgba(148, 163, 184, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.05) 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Pattern Recognition Engine */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 rounded-xl border border-slate-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-bold text-white flex items-center gap-2">
                          <Brain className="w-4 h-4 text-purple-400" />
                          Neural Pattern Detection
                        </h5>
                        <span className="text-[10px] text-purple-400 flex items-center gap-1">
                          <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
                          ANALYZING
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded flex items-center justify-center">
                              <span className="text-xs font-bold text-green-400">↑</span>
                            </div>
                            <div>
                              <span className="text-xs text-white font-medium">Ascending Triangle</span>
                              <div className="text-[10px] text-slate-400">High probability breakout</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-green-400">87%</div>
                            <div className="text-[10px] text-slate-400">confidence</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-400">⇄</span>
                            </div>
                            <div>
                              <span className="text-xs text-white font-medium">Volume Divergence</span>
                              <div className="text-[10px] text-slate-400">Accumulation phase detected</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-blue-400">72%</div>
                            <div className="text-[10px] text-slate-400">confidence</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-500/20 to-amber-500/10 rounded flex items-center justify-center">
                              <span className="text-xs font-bold text-amber-400">⚡</span>
                            </div>
                            <div>
                              <span className="text-xs text-white font-medium">Momentum Shift</span>
                              <div className="text-[10px] text-slate-400">Bullish trend continuation</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-amber-400">65%</div>
                            <div className="text-[10px] text-slate-400">confidence</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* AI Analysis Sources */}
                    <div className="border-t border-slate-300 dark:border-slate-600 pt-2 mt-3">
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">분석 모델 및 참고:</div>
                      <div className="flex flex-wrap gap-2">
                        <a 
                          href="https://www.marketwatch.com/investing/index/comp" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer z-10 relative"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open('https://www.marketwatch.com/investing/index/comp', '_blank', 'noopener,noreferrer');
                          }}
                        >
                          <Activity className="w-2.5 h-2.5" />
                          MarketWatch
                        </a>
                        <a 
                          href="https://www.investing.com/indices/nasdaq-composite-technical" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer z-10 relative"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open('https://www.investing.com/indices/nasdaq-composite-technical', '_blank', 'noopener,noreferrer');
                          }}
                        >
                          <LineChart className="w-2.5 h-2.5" />
                          Investing.com
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Advanced AI Processing Pipeline */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  AI 처리 파이프라인
                </h4>
                
                {/* Neural Network Layers */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <h5 className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-3 flex items-center gap-2">
                    <Brain className="w-3 h-3" />
                    다층 뉴럴 네트워크 처리 상태
                  </h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-indigo-600 dark:text-indigo-400">입력층 (Input Layer)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-indigo-200 dark:bg-indigo-800 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-indigo-500" initial={{width:"0%"}} animate={{width:"100%"}} transition={{duration:0.8}} />
                        </div>
                        <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">512</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-indigo-600 dark:text-indigo-400">숨긴층 1 (Hidden Layer)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-indigo-200 dark:bg-indigo-800 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-indigo-500" initial={{width:"0%"}} animate={{width:"89%"}} transition={{duration:1.2,delay:0.3}} />
                        </div>
                        <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">256</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-indigo-600 dark:text-indigo-400">숨긴층 2 (Hidden Layer)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-indigo-200 dark:bg-indigo-800 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-indigo-500" initial={{width:"0%"}} animate={{width:"76%"}} transition={{duration:1.5,delay:0.6}} />
                        </div>
                        <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">128</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-indigo-600 dark:text-indigo-400">출력층 (Output Layer)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-indigo-200 dark:bg-indigo-800 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-green-500" initial={{width:"0%"}} animate={{width:"94%"}} transition={{duration:1.8,delay:0.9}} />
                        </div>
                        <span className="text-xs font-medium text-green-700 dark:text-green-300">8</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Processing Steps with Enhanced Detail */}
                <div className="space-y-3">
                  {visibleMessages.slice(-4).map((msgId, index) => {
                    const msg = streamingMessages.find(m => m.id === msgId);
                    if (!msg || msg.type === 'user') return null;
                    
                    const getStepColor = (type: string) => {
                      switch(type) {
                        case 'thinking': return 'indigo';
                        case 'tool': return 'purple';
                        case 'assistant': return 'green';
                        default: return 'gray';
                      }
                    };
                    
                    const color = getStepColor(msg.type);
                    
                    return (
                      <motion.div
                        key={msgId}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.15 }}
                        className={`relative p-4 bg-${color}-50 dark:bg-${color}-900/20 rounded-lg border border-${color}-200 dark:border-${color}-800`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full bg-${color}-100 dark:bg-${color}-800 flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            {msg.type === 'thinking' && <Sparkles className={`w-4 h-4 text-${color}-600`} />}
                            {msg.type === 'tool' && msg.icon && <msg.icon className={`w-4 h-4 text-${color}-600`} />}
                            {msg.type === 'assistant' && <CheckCircle className={`w-4 h-4 text-${color}-600`} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className={`text-sm font-semibold text-${color}-800 dark:text-${color}-200`}>
                                {msg.type === 'thinking' ? '인지 처리 엔진' :
                                 msg.type === 'tool' ? msg.toolCategory || '도구 실행 층' :
                                 '결과 생성 모듈'}
                              </div>
                              <div className={`px-2 py-1 bg-${color}-100 dark:bg-${color}-800 rounded-full`}>
                                <span className={`text-xs font-medium text-${color}-700 dark:text-${color}-300`}>
                                  {msg.type === 'thinking' ? '처리중' :
                                   msg.type === 'tool' ? '실행중' :
                                   '완료'}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                              {msg.type === 'thinking' ? msg.content :
                               msg.type === 'tool' ? `${msg.toolName} • ${msg.content}` :
                               '분석 결과 생성 및 검증 완료'}
                            </div>
                            
                            {/* Enhanced Progress Bar */}
                            {msg.type === 'tool' && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className={`text-${color}-600 dark:text-${color}-400`}>진행률</span>
                                  <span className={`font-medium text-${color}-700 dark:text-${color}-300`}>100%</span>
                                </div>
                                <div className={`h-2 bg-${color}-200 dark:bg-${color}-800 rounded-full overflow-hidden`}>
                                  <motion.div
                                    className={`h-full bg-gradient-to-r from-${color}-400 to-${color}-600`}
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2, ease: "easeInOut" }}
                                  />
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                                  <div className="flex justify-between">
                                    <span className={`text-${color}-600 dark:text-${color}-400`}>지연시간</span>
                                    <span className="font-medium">1.2ms</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={`text-${color}-600 dark:text-${color}-400`}>API 호출</span>
                                    <span className="font-medium">247</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={`text-${color}-600 dark:text-${color}-400`}>성공률</span>
                                    <span className="font-medium text-green-600">99.8%</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Premium Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" />
                <span className="font-medium">멀티모달 분석</span>
              </div>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5" />
                <span className="font-medium">빅데이터 처리</span>
              </div>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <div className="flex items-center gap-2">
                <Brain className="w-3.5 h-3.5" />
                <span className="font-medium">딥러닝 예측</span>
              </div>
            </div>
            <motion.button
              onClick={startDemo}
              disabled={isPlaying}
              className="relative bg-slate-800 hover:bg-slate-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-xl hover:shadow-2xl disabled:shadow-none overflow-hidden"
              whileHover={{ scale: isPlaying ? 1 : 1.02 }}
              whileTap={{ scale: isPlaying ? 1 : 0.98 }}
            >
              {isPlaying && (
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  animate={{ x: ["0%", "100%"] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {isPlaying ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    분석 중...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    데모 시작
                  </>
                )}
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormattedContent({ content, hasLinks, hasCode }: { content: string; hasLinks?: boolean; hasCode?: boolean }) {
  if (!content || typeof content !== 'string') return null;

  // Split content by newlines to handle paragraphs
  const lines = content.split('\n');
  
  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        if (!line.trim()) return null;

        // Handle code blocks
        if (line.startsWith('```')) {
          return null; // Skip code fence markers
        }
        
        // Check if this line is part of a code block
        const codeMatch = content.match(/```[\s\S]*?```/g);
        if (hasCode && codeMatch) {
          const codeContent = codeMatch[0].replace(/```/g, '').trim();
          if (line.trim() && codeContent.includes(line)) {
            return (
              <div key={index} className="my-3">
                <pre className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 overflow-x-auto shadow-inner">
                  <code className="text-xs font-mono text-gray-800 dark:text-gray-200">
                    {line}
                  </code>
                </pre>
              </div>
            );
          }
        }

        // Handle bold text
        const boldRegex = /\*\*(.*?)\*\*/g;
        let formattedLine = line.replace(boldRegex, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>');

        // Handle links if enabled
        if (hasLinks) {
          const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
          formattedLine = formattedLine.replace(linkRegex, (match, text, url) => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline decoration-indigo-300 hover:decoration-indigo-500 transition-colors inline-flex items-center gap-1">${text}<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>`;
          });
        }

        // Handle list items
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <div key={index} className="flex items-start gap-2 ml-2">
              <span className="text-indigo-400 mt-1">•</span>
              <span 
                className="text-sm text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }}
              />
            </div>
          );
        }

        return (
          <p 
            key={index} 
            className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        );
      })}
    </div>
  );
}

function StreamingText({ text, speed = 8, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
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

  return <FormattedContent content={displayText} hasLinks={true} hasCode={true} />;
}

function TypingText({ text, speed = 15 }: { text: string; speed?: number }) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let i = 0;
    setDisplayText('');
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayText}</span>;
}export default StreamingDemo;
