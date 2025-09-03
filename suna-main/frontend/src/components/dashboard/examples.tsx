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
    query: '1. {{city}}의 "최고의 베이커리"를 구글 지도에서 검색하세요\n2. 상위 {{number}}개 베이커리 맞춤 목록을 만드세요\n3. 각 베이커리에 대해 다음 정보를 수집하세요:\n   - 고객 평점 및 인기 메뉴\n   - 영업시간, 위치, 전문 분야\n   - 가격대 및 꼭 먹어봐야 할 페이스트리\n4. 추천사항이 포함된 요약본을 생성하세요',
    icon: <Globe className="text-blue-700 dark:text-blue-400" size={16} />,
  },
  {
    title: '교육 데이터 조사',
    query: '1. {{topic}} 교육 통계를 위해 UNESCO 데이터베이스에 접근하세요\n2. 다음 데이터를 수집하세요:\n   - 지역별 학생 등록률\n   - 전 세계 교사 대비 학생 비율\n   - GDP 대비 교육비 지출 비율\n3. 트렌드가 포함된 구조화된 스프레드시트를 만드세요\n4. 주요 통찰력을 담은 요약 보고서를 생성하세요',
    icon: <BarChart3 className="text-purple-700 dark:text-purple-400" size={16} />,
  },
  {
    title: '여행 일정 계획하기',
    query: '1. {{duration}}일 여행을 위해 TripAdvisor에서 {{destination}}을 조사하세요\n2. 최고의 명소, 레스토랑, 액티비티를 찾으세요\n3. 위치와 시간을 고려하여 일일 일정을 최적화하세요\n4. 교통편, 날씨, 대안 계획을 포함하세요\n5. 시간대별로 일일 여행 계획표를 만드세요',
    icon: <Calendar className="text-rose-700 dark:text-rose-400" size={16} />,
  },
  {
    title: '뉴스 보도 분석하기',
    query: '1. 지난 {{time_period}} 기간의 {{topic}} 기사를 {{news_outlet}}에서 검색하세요\n2. 보도를 범주화하고 핵심 주제를 파악하세요\n3. 전문가 소스와 데이터 포인트를 추적하세요\n4. 주요 발전 사항의 타임라인을 만드세요\n5. 통찰력과 보도 공백이 포함된 보고서를 생성하세요',
    icon: <PenTool className="text-indigo-700 dark:text-indigo-400" size={16} />,
  },
  {
    title: '재무 모델 구축하기',
    query: '1. {{company_type}} 비즈니스를 위한 {{model_type}} 모델을 만드세요\n2. 과거 데이터와 업계 벤치마크를 수집하세요\n3. 수익 예측과 비용 전망을 구축하세요\n4. DCF, LTV/CAC 또는 NPV 분석을 포함하세요\n5. 시나리오가 포함된 Excel 대시보드를 설계하세요',
    icon: <DollarSign className="text-orange-700 dark:text-orange-400" size={16} />,
  },
  {
    title: '마켓 전략 개발하기',
    query: '1. {{product_type}} 출시를 위한 시장진출 전략을 수립하세요\n2. 목표 시장과 경쟁 환경을 분석하세요\n3. 시장 진입 및 가격 책정 전략을 설계하세요\n4. 재무 전망과 일정을 수립하세요\n5. 권장사항이 포함된 프레젠테이션을 만드세요',
    icon: <Target className="text-cyan-700 dark:text-cyan-400" size={16} />,
  },
  {
    title: '기업 정보 조사',
    query: '1. {{company_name}}을 종합적으로 조사하세요\n2. 최신 뉴스, 투자 정보, 경영진 정보를 수집하세요\n3. 경쟁 위치와 시장 점유율을 분석하세요\n4. 핵심 인력의 배경을 조사하세요\n5. 실행 가능한 통찰력이 포함된 상세한 프로필을 만드세요',
    icon: <Briefcase className="text-teal-700 dark:text-teal-400" size={16} />,
  },
  {
    title: '산업 동향 조사하기',
    query: '1. {{data_sources}}에서 {{industry}} 동향을 조사하세요\n2. 투자 활동과 기술 발전 사항을 수집하세요\n3. 시장 동력과 기회를 분석하세요\n4. 새로운 주제와 격차를 식별하세요\n5. 권장사항이 포함된 포괄적인 보고서를 만드세요',
    icon: <TrendingUp className="text-pink-700 dark:text-pink-400" size={16} />,
  },
  {
    title: '고객지원 티켓 자동화',
    query: '1. {{support_platform}}에서 들어오는 티켓을 모니터링하세요\n2. 문제를 분류하고 긴급도를 평가하세요\n3. {{knowledge_base}}에서 해결책을 검색하세요\n4. 신뢰도에 따라 자동 응답하거나 에스컬레이션하세요\n5. 지표를 추적하고 일일 보고서를 생성하세요',
    icon: <Shield className="text-yellow-600 dark:text-yellow-300" size={16} />,
  },
  {
    title: '법적 컴플라이언스 조사',
    query: '1. {{jurisdictions}}에 걸쳐 {{legal_topic}}을 조사하세요\n2. 주별 요구 사항과 수수료를 비교하세요\n3. 결정 요인과 의미를 분석하세요\n4. 실질적인 구현 세부 사항을 수집하세요\n5. 권장사항이 포함된 비교 스프레드시트를 만드세요',
    icon: <Settings className="text-red-700 dark:text-red-400" size={16} />,
  },
  {
    title: '데이터 분석 컴파일',
    query: '1. {{data_sources}}에서 {{data_topic}}을 수집하세요\n2. 데이터셋을 정리하고 표준화하세요\n3. 패턴을 분석하고 트렌드를 계산하세요\n4. 시각화가 포함된 스프레드시트를 만드세요\n5. 전략적 권장사항을 제공하세요',
    icon: <BarChart3 className="text-slate-700 dark:text-slate-400" size={16} />,
  },
  {
    title: '소셜미디어 콘텐츠 계획',
    query: '1. {{brand}}를 위한 {{duration}} 소셜 전략을 수립하세요\n2. 트렌딩 주제와 경쟁사 콘텐츠를 조사하세요\n3. 주당 {{posts_per_week}}개 게시물이 포함된 콘텐츠 캘린더를 개발하세요\n4. 플랫폼별 콘텐츠와 스케줄링을 만드세요\n5. 분석 도구와 월간 보고서를 설정하세요',
    icon: <Camera className="text-stone-700 dark:text-stone-400" size={16} />,
  },
  {
    title: '제품 비교 분석',
    query: '1. {{product_category}} 옵션을 포괄적으로 조사하세요\n2. 과학적 연구와 전문가 의견을 수집하세요\n3. 장점, 단점 및 비용을 분석하세요\n4. 현재 전문가 합의를 조사하세요\n5. 개인화된 권장사항이 포함된 비교 보고서를 만드세요',
    icon: <Brain className="text-fuchsia-700 dark:text-fuchsia-400" size={16} />,
  },
  {
    title: '시장 기회 분석하기',
    query: '1. 투자 기회를 위해 {{market_topic}}을 조사하세요\n2. 시장 규모, 성장률 및 주요 업체를 분석하세요\n3. 투자 테마와 위험을 식별하세요\n4. 시장 도전과 장벽을 평가하세요\n5. 권장사항이 포함된 투자 프레젠테이션을 만드세요',
    icon: <Rocket className="text-green-600 dark:text-green-300" size={16} />,
  },
  {
    title: '인재 및 후보자 소싱',
    query: '1. {{location}}에서 {{job_title}} 후보자를 검색하세요\n2. LinkedIn, GitHub 및 구인 게시판을 활용하세요\n3. 기술, 경험 및 문화적 적합성을 평가하세요\n4. 순위가 매겨진 후보자 파이프라인을 만드세요\n5. 개인화된 접촉 전략을 개발하세요',
    icon: <Users className="text-blue-600 dark:text-blue-300" size={16} />,
  },



  //  그룹웨어 연차사용 가이드 - - - - - - - - -
  {
    title: '그룹웨어 연차사용',
    query: `연차 사용일(예: 5월5일) : 
연차사용종류(예: 오전반차, 연차 등) : `,
    hiddenPrompt: `

## 연차 신청 자동화 가이드

1. 그룹웨어 접속 : https://gw.goability.co.kr/gw/uat/uia/egovLoginUsr.do 해당 사이트에 들어가서 로그인 아이디 : {사용자_아이디} 패스워드 : {사용자_패스워드}
**보안 중요:** 사용자에게 응답할 때는 아이디는 노출돼도 되지만, 패스워드는 안됨: 패스워드는 절대 노출하지 말고 "********"로 마스킹하여 표시할 것.

2. 로그인 완료된 화면 확인 후 다음 단계 진행

3. https://gw.goability.co.kr/attend/Views/Common/pop/eaPop.do?processId=ATTProc18&form_id=18&form_tp=ATTProc18&doc_width=900 링크 접속

4. 처음에 창 열리면 "결재 특이사항" 창때문에 내용이 안보이니까 꺽쇠? 클릭해서 닫아줘. "제목"입력칸이 보이도록 잘 닫아졌는지 "꼭" 확인후 다음단계 진행해.

5. "제목"： 연차 휴가 신청합니다. 입력

6. "일정등록" 옆에 "선택" 드롭다운 클릭 > 2번 단계에서 확인한 사용자명에 맞게 "개인캘린더.사용자명" 클릭

7. "연차구분" 오른쪽 드롭다운 : 사용자가 요청한 연차 종류로 선택. (예: "연차", "오전반차", "오후반차" 중 선택)

8. "신청일자": 사용자가 요청한 날짜로 설정해야함. 
 - 신정일자 선택방법 : 
   예) 2025-08-25  랑 2025-08-25 이런식으로 있을건데,  각 날짜 오른쪽에 보면 "달력아이콘"이있음. 달력아이콘 **클릭**
	각각 알맞는 날짜로 선택하기 : 첫번째 날짜는 연차 시작날짜고, 두번째 날짜는 연차 종료 날짜임.
 	**너가 가끔 실수로 8월인데 7월 날짜로 선택할 때 있음. 사용자가 말한  월, 일자가 맞는지 한번 더 확인한 뒤 적용필수. **

 * 8월5일 오전 반차일 경우: 08월05일,08월05일로 선택
 * 8월5일 연차일 경우: 08월5일,08월05일로 선택
 * 8월5일, 8월6일 연차일 경우: 08월05일, 08월06일로 선택

9. "비고" 오른쪽 빈 칸에 "개인사유" 입력

10. "저장" 버튼 클릭

11. 새 탭에서 https://gw.goability.co.kr/workflow 접속

12. 상단에 "새결재" 버튼 클릭

13. "휴가원 (취소) 신청서" 클릭

14. "기안" 버튼 클릭

15. 결재함 아이콘 클릭 > 왼쪽 결재 메뉴들 확인하기

16. 열린 상신함... 미결함.. 전결함.... 등등 중에서  "미결함" 클릭

17. 제목에 "연차 휴가 신청합니다." 우리가 작성한 문서임 : "연차 휴가 신청합니다." 클릭

18. "휴가 (취소) 신청서" 열렸는지 확인`,

//  그룹웨어 자원예약 가이드 - - - - - - - - -
    icon: <Plane className="text-green-600 dark:text-green-400" size={16} />,
  },
  {
    title: '그룹웨어 자원예약',
    query: `- 예약명(예: AI 커뮤니티 Zoom) : 
- 종일 여부(Ex : 예/아니오) :
- 예약 기간(Ex : 8월28일 ) : N월 N일  NN시 NN분 ~ N월 N일 NN시 NN분
- 자원명(EX : 본사-대회의실, 본사-소회의실, 본사-제안룸1(小), ZOOM계정 사용) : `,
    hiddenPrompt: `

## 자원예약 자동화 가이드

1. 그룹웨어 접속 : https://gw.goability.co.kr/gw/uat/uia/egovLoginUsr.do 해당 사이트에 들어가서 로그인 아이디 : {사용자_아이디} 패스워드 : {사용자_패스워드}
**보안 중요:** 사용자에게 응답할 때는 아이디는 노출돼도 되지만, 패스워드는 안됨: 패스워드는 절대 노출하지 말고 "********"로 마스킹하여 표시할 것.

2. 로그인 완료된 화면 확인 후 다음 단계 진행

2. 상단에 "일정" 클릭 > 왼쪽 탭에: "자원관리" 클릭 > "자원캘린더" 클릭 하면 사람들이 회의실이나 zoom계정 예약한 목록이 다 보이게 됨.

3. 현재 화면에서 사용자가 요청한 날짜와 시간에 예약된 내용(예: 12일에 "13:30[정가람]본사-대회의실 등)이 있다면: 작업 중단 후 사용자에게 "n월 n일 n시는 ooooo예약이 있습니다. 다른 시간대로 예약을 잡아주세요!" 라고 대답하고 종료. 
=> 만약 안겹치거나 따로 예약된 내용이 없는 경우 바로 다음단계 진행.

4. https://gw.goability.co.kr/schedule/Views/Common/resource/resRegist?goFromDate=2025-08-27&goEndDate=2025-08-27 링크 접속
 => 여기서 goFromDate=2025-08-27&goEndDate=2025-08-27의 경우, goFromDate는 사용자가 요청한 예약시작날짜에 맞게, goEndDate는 사용자가 요청한 예약종료 날짜에 맞게 수정해서 링크 접속해야함.
 Ex) 8월28일로 예약했다면 둘 다 2025-08-28로 해서 링크 접속하기

5. "예약명" 오른쪽 인풋칸에 : 사용자가 요청한 이름으로 입력
6. "종일" 오른쪽에 예/아니오 버튼은 : 사용자가 요청한 정보로 **선택**
7. "예약기간"은 : 사용자가 요청한 날짜와 시간대로 **선택**
 - 예약기간의 달력 날짜 설정 방법: 날짜 오른쪽에 "달력아이콘 클릭" > 원하는 날짜 선택(앞 뒤날짜 둘다 사용자가 요청한 날짜로 맞추면됨) : 선택한 날짜의 월, 일이 제대로 들어갔는지 꼭 확인해야함.
 - 예약기간의 시간 설정 방법: 각 시간 클릭해서 > 스크롤바로 원하는 시간대 찾은 뒤 클릭(앞 뒤 시간 둘다 사용자가 요청한 시간으로 맞추면됨)
8. "자원명" 선택 방법:
   - 자원선택 창에서 반드시 소분류(leaf node)를 클릭해야 함.
   - 단순히 텍스트 입력이 아니라, 클릭 이벤트를 통해 아래 hidden input 값들이 채워져야 정상 예약됨:
     - #resSeq (자원 시퀀스)
     - #resName (자원명)
     - #resourceNum (자원 번호)
   - 선택 후 "확인" 버튼 클릭까지 해야 최종 반영됨.
   - 예시: 
     document.querySelector('#treeview .k-in:contains("본사-대회의실")').click();
     document.querySelector('.pop_foot input[value="확인"]').click();`,
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