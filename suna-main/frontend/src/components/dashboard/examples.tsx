'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Bot,
  Briefcase,
  Settings,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Target,
  Brain,
  Globe,
  Heart,
  PenTool,
  Code,
  Camera,
  Calendar,
  DollarSign,
  Rocket,
  Plane,
} from 'lucide-react';

type PromptExample = {
  title: string;
  query: string;
  icon: React.ReactNode;
  hiddenPrompt?: string; // 숨겨진 가이드 프롬프트
};

const allPrompts: PromptExample[] = [
  {
    title: '최고의 베이커리 지도 찾기',
    query: '1. Search Google Maps for "best bakeries in {{city}}"\n2. Create a custom list with top {{number}} bakeries\n3. For each bakery, gather:\n   - Customer ratings and popular items\n   - Hours, location, and specialties\n   - Price range and must-try pastries\n4. Generate a summary with recommendations',
    icon: <Globe className="text-blue-700 dark:text-blue-400" size={16} />,
  },
  {
    title: '교육 데이터 조사',
    query: '1. Access UNESCO database for {{topic}} education statistics\n2. Compile data on:\n   - Student enrollment ratios by region\n   - Teacher-to-student ratios globally\n   - Education spending as % of GDP\n3. Create structured spreadsheet with trends\n4. Generate executive summary with key insights',
    icon: <BarChart3 className="text-purple-700 dark:text-purple-400" size={16} />,
  },
  {
    title: 'Plan travel itinerary',
    query: '1. Research {{destination}} on TripAdvisor for {{duration}} day trip\n2. Find top attractions, restaurants, and activities\n3. Optimize daily schedule by location and hours\n4. Include transportation, weather, and backup plans\n5. Create day-by-day itinerary with time blocks',
    icon: <Calendar className="text-rose-700 dark:text-rose-400" size={16} />,
  },
  {
    title: 'Analyze news coverage',
    query: '1. Search {{news_outlet}} for {{topic}} articles from past {{time_period}}\n2. Categorize coverage and identify key themes\n3. Track expert sources and data points\n4. Create timeline of major developments\n5. Generate report with insights and coverage gaps',
    icon: <PenTool className="text-indigo-700 dark:text-indigo-400" size={16} />,
  },
  // {
  //   title: 'Book restaurant reservations',
  //   query: '1. Search OpenTable for restaurants in {{city}} for {{occasion}}\n2. Filter by date, party size, and cuisine preferences\n3. Check reviews and menu highlights\n4. Make reservations at {{number}} restaurants\n5. Create itinerary with confirmation details',
  //   icon: <Users className="text-emerald-700 dark:text-emerald-400" size={16} />,
  // },
  {
    title: 'Build financial model',
    query: '1. Create {{model_type}} model for {{company_type}} business\n2. Gather historical data and industry benchmarks\n3. Build revenue forecasts and expense projections\n4. Include DCF, LTV/CAC, or NPV analysis\n5. Design Excel dashboard with scenarios',
    icon: <DollarSign className="text-orange-700 dark:text-orange-400" size={16} />,
  },
  {
    title: 'Develop market strategy',
    query: '1. Create go-to-market strategy for {{product_type}} launch\n2. Analyze target market and competitive landscape\n3. Design market entry and pricing strategy\n4. Build financial projections and timeline\n5. Create presentation with recommendations',
    icon: <Target className="text-cyan-700 dark:text-cyan-400" size={16} />,
  },
  {
    title: '기업 정보 조사',
    query: '1. Research {{company_name}} comprehensively\n2. Gather recent news, funding, and leadership info\n3. Analyze competitive position and market share\n4. Research key personnel background\n5. Create detailed profile with actionable insights',
    icon: <Briefcase className="text-teal-700 dark:text-teal-400" size={16} />,
  },
  {
    title: '캘린더 생산성 분석',
    query: '1. Analyze {{calendar_app}} data from past {{months}} months\n2. Assess meeting frequency and focus time\n3. Identify optimization opportunities\n4. Analyze meeting effectiveness patterns\n5. Generate recommendations and implementation plan',
    icon: <Calendar className="text-violet-700 dark:text-violet-400" size={16} />,
  },
  {
    title: 'Research industry trends',
    query: '1. Research {{industry}} trends from {{data_sources}}\n2. Gather investment activity and technology developments\n3. Analyze market drivers and opportunities\n4. Identify emerging themes and gaps\n5. Create comprehensive report with recommendations',
    icon: <TrendingUp className="text-pink-700 dark:text-pink-400" size={16} />,
  },
  {
    title: 'Automate support tickets',
    query: '1. Monitor {{support_platform}} for incoming tickets\n2. Categorize issues and assess urgency\n3. Search {{knowledge_base}} for solutions\n4. Auto-respond or escalate based on confidence\n5. Track metrics and generate daily reports',
    icon: <Shield className="text-yellow-600 dark:text-yellow-300" size={16} />,
  },
  {
    title: 'Research legal compliance',
    query: '1. Research {{legal_topic}} across {{jurisdictions}}\n2. Compare state requirements and fees\n3. Analyze decision factors and implications\n4. Gather practical implementation details\n5. Create comparison spreadsheet with recommendations',
    icon: <Settings className="text-red-700 dark:text-red-400" size={16} />,
  },
  {
    title: 'Compile data analysis',
    query: '1. Gather {{data_topic}} from {{data_sources}}\n2. Clean and standardize datasets\n3. Analyze patterns and calculate trends\n4. Create spreadsheet with visualizations\n5. Provide strategic recommendations',
    icon: <BarChart3 className="text-slate-700 dark:text-slate-400" size={16} />,
  },
  {
    title: 'Plan social media content',
    query: '1. Create {{duration}} social strategy for {{brand}}\n2. Research trending topics and competitor content\n3. Develop content calendar with {{posts_per_week}} posts\n4. Create platform-specific content and scheduling\n5. Set up analytics and monthly reporting',
    icon: <Camera className="text-stone-700 dark:text-stone-400" size={16} />,
  },
  {
    title: 'Compare products',
    query: '1. Research {{product_category}} options comprehensively\n2. Gather scientific studies and expert opinions\n3. Analyze benefits, drawbacks, and costs\n4. Research current expert consensus\n5. Create comparison report with personalized recommendations',
    icon: <Brain className="text-fuchsia-700 dark:text-fuchsia-400" size={16} />,
  },
  {
    title: 'Analyze market opportunities',
    query: '1. Research {{market_topic}} for investment opportunities\n2. Analyze market size, growth, and key players\n3. Identify investment themes and risks\n4. Assess market challenges and barriers\n5. Create investment presentation with recommendations',
    icon: <Rocket className="text-green-600 dark:text-green-300" size={16} />,
  },
  {
    title: 'Process invoices & documents',
    query: '1. Scan {{document_folder}} for PDF invoices\n2. Extract key data: numbers, dates, amounts, vendors\n3. Organize data with standardized fields\n4. Build comprehensive tracking spreadsheet\n5. Generate monthly financial reports',
    icon: <Heart className="text-amber-700 dark:text-amber-400" size={16} />,
  },
  {
    title: 'Source talent & candidates',
    query: '1. Search for {{job_title}} candidates in {{location}}\n2. Use LinkedIn, GitHub, and job boards\n3. Evaluate skills, experience, and culture fit\n4. Create ranked candidate pipeline\n5. Develop personalized outreach strategy',
    icon: <Users className="text-blue-600 dark:text-blue-300" size={16} />,
  },
  {
    title: 'Build professional website',
    query: '1. Research {{person_name}} online comprehensively\n2. Analyze professional brand and achievements\n3. Design website structure and content\n4. Create optimized pages with portfolio\n5. Implement SEO and performance features',
    icon: <Globe className="text-red-600 dark:text-red-300" size={16} />,
  },
  {
    title: '그룹웨어 연차사용',
    query: `연차 사용일(예: 5월5일) : 
연차사용종류(예: 오전반차, 연차 등) : `,
    hiddenPrompt: `

## 연차 신청 자동화 가이드

1. 그룹웨어 접속 : https://gw.goability.co.kr/login

2. 처음에 창 열리면 "결재 특이사항" 창때문에 내용이 안보이니까 꺽쇠? 클릭해서 닫아줘. "제목"입력칸이 보이도록 잘 닫아졌는지 "꼭" 확인후 다음단계 진행해.

3. "제목"： 연차 휴가 신청합니다. 입력

4. "일정등록" 옆에 "선택" 드롭다운 클릭 > 2번 단계에서 확인한 사용자명에 맞게 "개인캘린더.사용자명" 클릭

5. "연차구분" 오른쪽 드롭다운 : 사용자가 요청한 연차 종류로 선택. (예: "연차", "오전반차", "오후반차" 중 선택)

6. "신청일자": 사용자가 요청한 날짜로 설정해야함. 
 - 신정일자 선택방법 : 
   예) 2025-08-25  랑 2025-08-25 이런식으로 있을건데,  각 날짜 오른쪽에 보면 "달력아이콘"이있음. 달력아이콘 **클릭**
	각각 알맞는 날짜로 선택하기 : 첫번째 날짜는 연차 시작날짜고, 두번째 날짜는 연차 종료 날짜임.
 	**너가 가끔 실수로 8월인데 7월 날짜로 선택할 때 있음. 사용자가 말한  월, 일자가 맞는지 한번 더 확인한 뒤 적용필수. **

 * 8월5일 오전 반차일 경우: 08월05일,08월05일로 선택
 * 8월5일 연차일 경우: 08월5일,08월05일로 선택
 * 8월5일, 8월6일 연차일 경우: 08월05일, 08월06일로 선택

7. "비고" 오른쪽 빈 칸에 "개인사유" 입력

8. "저장" 버튼 클릭

9. 새 탭에서 https://gw.goability.co.kr/workflow 접속

10. 상단에 "새결재" 버튼 클릭

11. "휴가원 (취소) 신청서" 클릭

12. "기안" 버튼 클릭

13. 결재함 아이콘 클릭 > 왼쪽 결재 메뉴들 확인하기

14. 열린 상신함... 미결함.. 전결함.... 등등 중에서  "미결함" 클릭

15. 제목에 "연차 휴가 신청합니다." 우리가 작성한 문서임 : "연차 휴가 신청합니다." 클릭

16. "휴가 (취소) 신청서" 열렸는지 확인`,
    icon: <Plane className="text-green-600 dark:text-green-400" size={16} />,
  },
  {
    title: '그룹웨어 자원예약',
    query: `- 예약명(예: AI 커뮤니티 Zoom) : 
- 종일 여부(Ex : 예/아니오) :
- 예약 기간(Ex : 8월28일 ) : N월 N일  NN시 NN분 ~ N월 N일 NN시 NN분
- 자원명(EX : 본사 대회의실, 본사 소회의실, 본사 제안룸1(小), ZOOM계정 사용) : `,
    hiddenPrompt: `

## 자원예약 자동화 가이드

1. 그룹웨어 접속 : https://gw.goability.co.kr/login
2. 왼쪽에 "자원관리" 클릭 > 바로 아래 드롭다운으로 뜨는 "자원캘린더" 탭 클릭
3. 사용자가 원하는 날짜에 예약된 내용(예: 12일에 "13:30[정가람]본사-대회의실 등)이 만약 있다면: 하나씩 "클릭"해서 사용자가 예약할 날짜랑 겹치는지, 안겹치는지 확인해야함: 만약 안겹치거나 따로 예약된 내용이 없는 경우 바로 다음단계 진행/ 겹칠 경우 작업 중단 후 사용자에게 "n월 n일 n시는 ooooo예약이 있습니다. 다른 시간대로 예약을 잡아주세요!" 라고 대답하고 끝내기
4. 이전 단계에서 예약할 날짜, 시간 다른사람과 안겹치는지 확인 끝났다면: https://gw.goability.co.kr/schedule/Views/Common/resource/resRegist?goFromDate=2025-08-27&goEndDate=2025-08-27 링크 접속
 - 여기서 goFromDate=2025-08-27&goEndDate=2025-08-27의 경우, goFromDate는 사용자가 요청한 예약시작날짜에 맞게, goEndDate는 사용자가 요청한 예약종료 날짜에 맞게 수정해서 링크 접속하면 됨. 
 Ex) 8월28일로 예약했다면 둘 다 2025-08-28로 해서 링크 접속하기
5. "예약명" 오른쪽 인풋칸에 : 사용자가 요청한 이름으로 입력
6. "종일" 오른쪽에 예/아니오 버튼은 : 사용자가 요청한 정보로 **선택**
7. "예약기간"은 : 사용자가 요청한 날짜와 시간대로 **선택**
 - 예약기간의 달력 날짜 설정 방법: 날짜 오른쪽에 "달력아이콘 클릭" > 원하는 날짜 선택(앞 뒤날짜 둘다 사용자가 요청한 날짜로 맞추면됨) : 선택한 날짜의 월, 일이 제대로 들어갔는지 꼭 확인해야함.
 - 예약기간의 시간 설정 방법: 각 시간 클릭해서 > 스크롤바로 원하는 시간대 찾은 뒤 클릭(앞 뒤 시간 둘다 사용자가 요청한 시간으로 맞추면됨)
8. "자원명" 선택방법은 인풋칸 오른쪽에 "선택" 버튼 클릭해서 그 안에있는 요소들을 선택한 후 확인버튼 누르면 선택됨.`,
    icon: <Calendar className="text-orange-600 dark:text-orange-400" size={16} />,
  },
];

// Function to get random prompts
const getRandomPrompts = (count: number = 3): PromptExample[] => {
  const shuffled = [...allPrompts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const Examples = ({
  onSelectPrompt,
  count = 3,
}: {
  onSelectPrompt?: (query: string, hiddenPrompt?: string) => void;
  count?: number;
}) => {
  const [displayedPrompts, setDisplayedPrompts] = useState<PromptExample[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize with random prompts on mount
  useEffect(() => {
    setDisplayedPrompts(getRandomPrompts(count));
  }, [count]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setDisplayedPrompts(getRandomPrompts(count));
    setTimeout(() => setIsRefreshing(false), 300);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="group relative">
        <div className="flex gap-2 justify-center py-2 flex-wrap">
          {displayedPrompts.map((prompt, index) => (
            <motion.div
              key={`${prompt.title}-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: index * 0.03,
                ease: "easeOut"
              }}
            >
              <Button
                variant="outline"
                className="w-fit h-fit px-3 py-2 rounded-full border-neutral-200 dark:border-neutral-800 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-sm font-normal text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => onSelectPrompt && onSelectPrompt(prompt.query, prompt.hiddenPrompt)}
              >
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0">
                    {React.cloneElement(prompt.icon as React.ReactElement, { size: 14 })}
                  </div>
                  <span className="whitespace-nowrap">{prompt.title}</span>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Refresh button that appears on hover */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="absolute -top-4 right-1 h-5 w-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <RefreshCw size={10} className="text-muted-foreground" />
          </motion.div>
        </Button>
      </div>
    </div>
  );
};