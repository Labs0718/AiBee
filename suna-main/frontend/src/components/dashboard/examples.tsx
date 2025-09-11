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

4. 처음에 창 열리면 "결재 특이사항" 창때문에 내용이 안보이니까 꺽쇠 클릭해서 닫아줘. "제목"입력칸이 보이도록 잘 닫아졌는지 "꼭" 확인후 다음단계 진행해.

5. "제목"： 연차 휴가 신청합니다. 입력

6. "일정등록" 옆에 "선택" 드롭다운 클릭

6-1. 2번 단계에서 확인한 사용자명에 맞게 "개인캘린더.사용자명" 클릭

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

10. "내역추가" 버튼 클릭

11. 상단에 "결재상신" 버튼 클릭 > "상신" 버튼 클릭

** 브라우저 오류 처리 가이드 **
상신 버튼 클릭 후 브라우저 오류 발생 시:

[자동 복구 시도]
1. 브라우저 프로세스 강제 종료 (taskkill /f /im chrome.exe)
2. 5초 대기
3. 새 브라우저 인스턴스로 재시작
4. 그룹웨어 재접속 및 로그인

12. 브라우저 정상 복구 후 진행:
   - https://gw.goability.co.kr/gw/userMain.do 접속
   - 로그인 재수행

13. "전자결재" 메뉴 클릭

14. "결재문서" > "미결함" > "연차 휴가 신청합니다." 클릭

15. "휴가(취소)신청서" 확인

16. "사용신청" 체크 > "결재" > "승인"

** 참고: 브라우저 도구 한계로 인해 11단계 후 수동 개입 필요할 수 있음 **
`,

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

2. 로그인 완료 후 상단 메뉴에서 "일정" 클릭
  - 왼쪽 메뉴에서 "자원관리" 클릭 
  - 반드시 "자원관리" 바로 아래 "자원캘린더" 항목을 반드시 클릭해야 함
  - 단순 .click()으로는 동작하지 않으므로 아래 우선순위 단계별 방식을 따라야 함
  - 단계별 동작
    1. jstree select_node 호출 (우선 방식)
    $("#sub_nav_jstree").jstree("select_node", "#302020000");
    성공 시 Network 탭에서 GetCalResourceListFull Ajax 요청이 발생해야 함
    이 요청이 발생해야만 내부 상태가 맞춰지고, 정상적으로 자원캘린더 화면으로 전환됨
    2. 실패 시 이벤트 시퀀스 dispatch (대체 방식)
    const el = document.querySelector("#302020000_anchor");
    ["mousedown","mouseup","click"].forEach(ev => {
      el.dispatchEvent(new MouseEvent(ev, {bubbles:true, cancelable:true, view:window}));
    });
    - 이렇게 해야 jstree 내부 이벤트 핸들러가 호출되어 Ajax 요청이 트리거될 수 있음
    3. 그래도 실패 시 Ajax 요청 직접 호출 후 URL 이동 (최후 수단)
    네트워크 탭에서 확인된 Ajax 요청(GetCalResourceListFull)을 동일하게 실행해야 합니다.
    예:

    $.ajax({
      url: "/gw/schdule/GetCalResourceListFull.do",
      method: "POST",
      data: { ...필수 파라미터... },
      async: false
    });
    window.location.href = "/gw/resource/calendarMain.do";
    Ajax 요청이 선행되지 않으면 /gw/resource/calendarMain.do 접근 시 **“권한 오류”**가 발생함
    - 성공기준 : 
    1) 화면에 회의실/Zoom 계정 자원 달력이 표시되어야 합니다.
    2) GetCalResourceListFull Ajax 요청 성공 → /gw/resource/calendarMain.do 정상 로딩 → 달력 표시.
    3) 이 조건이 만족될 때까지 위 단계들을 반복 시도해야 합니다.


3. 자원캘린더 화면에서 사용자가 요청한 날짜와 시간의 예약 현황 확인
  - 만약 같은 날짜/시간대에 이미 예약된 내용(예: 12일에 "13:30[정가람]본사-대회의실 등)이 있다면:
  -> 작업 중단 후 사용자에게 "N월 N일 N시는 [예약자명] [자원명] 예약이 있습니다. 다른 시간대로 예약을 잡아주세요!" 라고 안내하고 종료.
  - 예약이 없거나 시간이 겹치지 않으면 다음 단계 진행.

4. "자원예약" 등록 페이지 접속
  - URL: https://gw.goability.co.kr/schedule/Views/Common/resource/resRegist  
  - 따라서 반드시 페이지 내에서 "예약기간"을 직접 설정해야 함 

5. "예약기간" 설정
  - 날짜 : 달력 아이콘 클릭 -> 요청한 날짜 선택 (이때 시작일/종료일 모두 사용자가 요청한 날짜로 달력에서 직접 선택)
  - 첫번째 날짜는 예약 시작 날짜고, 두번째 날짜는 에약 종료 날짜임.
 	**너가 가끔 실수로 8월인데 7월 날짜로 선택할 때 있음. 사용자가 말한 월, 일자가 맞는지 한번 더 확인한 뒤 적용필수. **
  - 시간 : 시작/종료 시간을 드롭다운 클릭해서 스크롤에서 정확히 선택(사용자가 요청한 시간으로 맞추면됨)
  - 선택 후 화면에 올바른 월/일/시/분 값이 반영되었는지 반드시 확인 

6. "예약명" 입력
  - 예약명은 오른쪽 input에 사용자가 요청한 이름을 그대로 작성

7. "종일" 여부 선택
  - 사용자가 요청한 값(예/아니오)에 따라 버튼 클릭  
   
8. "자원명" 선택
   - 자원명 입력칸 오른쪽 끝에 있는 "선택" 버튼 클릭
   - "자원선택" 팝업창이 뜨면, 반드시 소분류(leaf node)를 클릭해야 함
   - (예: 본사-대회의실, 본사-소회의실, 본사-제안룸1(小), ZOOM계정 사용 등)
   - 단순히 텍스트 입력이 아니라, 클릭 이벤트를 통해 아래 hidden input 값들이 채워져야 정상 예약됨:
     - #resSeq (자원 시퀀스 ID)
     - #resName (자원명)
     - #resourceNum (자원 번호)
   - 사용자가 요청한 자원(leaf node) 선택한 후, 팝업창 하단의 "확인" 버튼 클릭해야 최종 반영됨.
   - 자원명 선택 시 단순히 .click()만 하지 말고, 반드시 Kendo TreeView의 내부 이벤트(selectResource 등)를 트리거해야 함.
   - 방법: (1) MouseEvent(mousedown → mouseup → click) 순서로 dispatch 하거나,
          (2) $("#treeview").data("kendoTreeView").select(node) 호출
   - 선택이 완료되어야만 (#resSeq, #resName, #resourceNum 값이 채워지고 파란색 highlight 표시)
   - 선택이 정상 반영된 경우에만 팝업창 하단의 "확인" 버튼 클릭
      
  9. "저장" 버튼 클릭`,

    icon: <Calendar className="text-orange-600 dark:text-orange-400" size={16} />,
  },
  
  {
    title: '내 연차 찾기',
    query: '내 연차 찾기',
    hiddenPrompt: `
## 내 연차 찾기 자동화 가이드

1. 그룹웨어 접속 : https://gw.goability.co.kr/gw/uat/uia/egovLoginUsr.do 해당 사이트에 들어가서 로그인 아이디 : {사용자_아이디} 패스워드 : {사용자_패스워드}
**보안 중요:** 사용자에게 응답할 때는 아이디는 노출돼도 되지만, 패스워드는 안됨: 패스워드는 절대 노출하지 말고 "********"로 마스킹하여 표시할 것.

2. 상단 메뉴에서 "인사/근태" 클릭

3. "근태관리" >  개인근태현황.... 개인연차현황... 근태신청현황 있을 건데, 그중에서 "개인연차현황" 클릭해야함.

3. 개인연차현황 페이지가 열리면 가로 스크롤바를 오른쪽으로 움직여서 테이블의 제목행 중: "잔여연차" 컬럼과, "사용" 컬럼 찾기 

4. 각 컬럼의 확실한 숫자를 사용자에게 다음 형식으로 알려주기 : "{사용자명}님의 연차 사용 조회 결과: {현재연도}년 현재 ["사용"컬럼 숫자]개 사용하였으며, 잔여연차는 ["잔여연차" 숫자]개입니다."
 - 나의 총 연차: 부여(A)의 "소계"의 [숫자값]임
 - 나의 연차 사용일수: 소진(B)의 "소계"의 [숫자값]임
 - 잔여연차: 가로스크롤로 오른쪽으로 화면 옮겨보면 "잔여연차"컬럼있음. "잔여연차"의 [숫자값]임
 ** 귀속년도는 가장 최근으로 띄워져있는 게 "올해" 라고 보면됨

`,
    icon: <Heart className="text-red-600 dark:text-red-400" size={16} />,
  },
  
  {
    title: 'AI 민원 위기 대응 솔루션',
    query: `발생한 위기 상황을 간단히 입력하세요:
예시: "강남역 지하철 고장으로 출근길 대란", "한강공원 수질 오염 신고 급증", "아파트 층간소음 집단 민원"
→ `,
    hiddenPrompt: `
# AI 민원 위기 대응 솔루션 - 긴급 대응 프로토콜

당신은 정부 위기대응 전문가입니다. 시민 민원 위기 상황에 대한 종합적 대응 전략을 수립하세요.

## 필수 실행 순서 (반드시 순서대로 진행)

** STEP 1: 내부 문서 검색 (절대 필수 - 첫 번째 도구 호출)**
🛑 경고: web_search가 아닌 search_internal_documents 도구만 사용하세요! 🛑
🚫 web_search 도구는 절대 먼저 사용하지 마세요! 🚫

반드시 search_internal_documents 도구를 첫 번째로 호출하여:

**검색 수행 내용:**
- 사용자 입력에서 핵심 키워드를 추출하여 검색 실행
- 과거 유사 위기 대응 사례, 매뉴얼, 정책 문서 우선 수집
- 검색 전략: "{핵심이슈} 대응 사례", "{지역} 위기 관리", "{이슈유형} 해결 방안"

** 검색 결과 보고 (필수)**
search_internal_documents 도구 사용 후 반드시 결과를 명확히 보고하세요:
- 검색이 성공한 경우: "내부 문서에서 '[검색된 내용 요약]'에 대한 자료를 찾았습니다."
- 검색이 실패한 경우: "내부 문서에서 관련 자료를 찾을 수 없습니다."

** STEP 2: 웹 검색 (두 번째 단계 - search_internal_documents 완료 후에만!)**
⚠️ 중요: search_internal_documents 도구 사용과 결과 보고가 완전히 완료된 후에만 web_search 도구 사용 허용 ⚠️

web_search 도구로 실시간 상황 분석:
- 해당 지역 실시간 뉴스 및 SNS 반응 조사
- 유사 사례의 최신 해결 동향 파악
- 전국 동일 이슈 발생 현황 및 대응 상태 확인

**STEP 3: 종합 대응 전략 생성**
수집된 내부 자료와 웹 검색 결과를 모두 활용하여 다음 형식의 위기 대응 보고서를 생성하세요:

#  긴급 민원 위기 대응 보고서

##  참고 자료 현황
- 내부 문서 검색 결과: [검색 성공/실패 및 주요 내용]
- 웹 검색을 통한 실시간 상황: [주요 발견 사항]

##  즉시 대응 (1시간 내)
- 상황 통제를 위한 긴급 조치사항
- 언론 및 SNS 대응 방안
- 시민 안전 확보 우선 조치

##  단기 대응 (24시간 내)
- 근본 원인 해결을 위한 실행 계획
- 관련 부서 협조 체계 구축
- 시민 소통 및 사과 방안

##  중장기 대응 (1주-1개월)
- 재발 방지를 위한 시스템 개선
- 정책 및 제도 보완 방안
- 유사 지역 확산 방지 대책

##  예상 질의 및 표준 답변
- 언론 브리핑용 핵심 메시지
- 시민 문의 대응 스크립트
- 정치권 질의 대응 방안

##  성공 지표 및 모니터링
- 상황 종료 판단 기준
- 대응 효과 측정 방법
- 추가 확산 방지 체크포인트

**중요: 반드시 내부 문서 검색 → 웹 검색 → 보고서 생성 순서로 진행하며, 각 단계의 결과를 명확히 사용자에게 보고하세요.**
`,
    icon: <Shield className="text-amber-600 dark:text-amber-400" size={16} />,
  },

  {
    title: 'AI 정책보고서 생성',
    query: `생성할 정책보고서 주제를 입력하세요:
예시: "최근 AI 정책 동향에 대해 브리핑 문서를 만들어줘", "OECD와 EU AI 법안 주요 내용 차이를 분석해줘" → `,
    hiddenPrompt: `
# AI 정책보고서 생성

당신은 정부 정책 분석 어시스턴트입니다. 사용자가 요청한 "AI 정책 보고서"를 생성하기 위해 다음 단계를 수행하세요 :

## 필수 실행 순서 (반드시 순서대로 진행)

** STEP 1: 내부 문서 검색 (절대 필수 - 첫 번째 도구 호출)**
🛑 경고: web_search가 아닌 search_internal_documents 도구만 사용하세요! 🛑
🚫 web_search 도구는 절대 먼저 사용하지 마세요! 🚫

반드시 search_internal_documents 도구를 첫 번째로 호출하여:

**검색 수행 내용:**
- 사용자 입력에서 핵심 키워드를 추출하여 내부 문서 검색
- 예 : "AI 정책", "OECD AI 법안", "EU AI 규제" 등
- 내부 정책 문서 전반을 우선 확보(예 : 기존 규정, 정책 가이드라인 등)
- 검색 전략: "{정책명/기관명} 주요 내용", "{연도} 정책 계획", "{분야} 가이드라인"

** 검색 결과 보고 (필수)**
search_internal_documents 도구 사용 후 반드시 결과를 명확히 보고하세요:
- 검색이 성공한 경우: "내부 문서에서 '[검색된 내용 요약]'에 대한 자료를 찾았습니다."
- 검색이 실패한 경우: "내부 문서에서 관련 자료를 찾을 수 없습니다."

** STEP 2: 웹 검색 (두 번째 단계 - search_internal_documents 완료 후에만!)**
⚠️ 중요: search_internal_documents 도구 사용과 결과 보고가 완전히 완료된 후에만 web_search 도구 사용 허용 ⚠️

web_search 도구로 실시간 상황 분석:
- 과기정통부, NIA, OECD, EU AI 법안 관련 최근 보도자료·발표문 확보
- 국내외 정책 변화 및 주요 논의 동향 정리
- 언론 및 연구기관 발표 비교

**STEP 3: 정책 보고서 생성**
수집된 내부 자료와 웹 검색 결과를 모두 활용하여 다음 형식의 정책 보고서를 생성하세요:

#  AI 정책 보고서

##  참고 자료 현황
- 내부 문서 검색 결과: [검색 성공/실패 및 주요 내용]
- 웹 검색 주요 결과 : [최신 정책 및 발견 사항]

## 정책 동향 요약
- 국내 정책 주요 내용
- 국제 정책 비교 (OECD, EU 등)
- 최근 법안 및 규제 변화

## 비교 분석
- 신규 정책 vs 기존 정책의 차이점
- 예상되는 영향 및 쟁점
- 우리 부처/기관 대응 필요 포인트

## 대응 방향 제안
- 단기 대응 방안
- 중장기 정책 개선 방향
- 관련 부서 협업 및 추진 체계

## 예상 질의 및 답변
- 국회/언론 질의 예상 및 표준 답변
- 내부 간부 보고용 주요 Q&A
- 대외 홍보용 핵심 메시지


**중요: 반드시 내부 문서 검색 → 웹 검색 → 최종 보고서 생성 순서로 진행하며, 각 단계의 결과를 명확히 사용자에게 보고하세요.**
`,
    icon: <Shield className="text-amber-600 dark:text-amber-400" size={16} />,
  },


{
    title: 'AI 정책 브리핑 생성기',
    query: `생성할 브리핑 주제를 입력하세요:
예시: "최근 AI 정책 동향을 간단히 브리핑해줘", "OECD와 EU AI 법안 주요 차이를 요약해줘" → `,
    hiddenPrompt: `
# AI 정책 브리핑 생성기

당신은 정부 정책 분석 어시스턴트입니다. 사용자가 요청한 "AI 정책 브리핑"을 핵심 요약 중심(2~3쪽 이내)** 으로 생성하세요. :

## 필수 실행 순서 (반드시 순서대로 진행)

** STEP 1: 내부 문서 검색 (절대 필수 - 첫 번째 도구 호출)**
🛑 경고: web_search가 아닌 search_internal_documents 도구만 사용하세요! 🛑
🚫 web_search 도구는 절대 먼저 사용하지 마세요! 🚫

반드시 search_internal_documents 도구를 첫 번째로 호출하여:

**검색 수행 내용:**
- 사용자 입력에서 핵심 키워드를 추출하여 내부 문서 검색
- 예 : "AI 정책", "OECD AI 법안", "EU AI 규제" 등
- 내부 정책 문서 전반을 우선 확보
- 사용자 입력에서 연관된 보조 키워드도 함께 추출(예 : "투자 규모", "주요국", "국제 비교", "산업별" 등)
- 조합 전략: "{핵심 키워드} + {보조 키워드}" 형태로 확장 검색
  - 예: "AI 정책 동향", "AI 정책 투자 규모", "주요국 AI 정책", "AI 정책 국제 비교

** 검색 결과 보고 (필수)**
search_internal_documents 도구 사용 후 반드시 결과를 명확히 보고하세요:
- 검색이 성공한 경우: "내부 문서에서 '[검색된 내용 요약]'에 대한 자료를 찾았습니다."
- 검색이 실패한 경우: "내부 문서에서 관련 자료를 찾을 수 없습니다."

** STEP 2: 웹 검색 (두 번째 단계 - search_internal_documents 완료 후에만!)**
⚠️ 중요: search_internal_documents 도구 사용과 결과 보고가 완전히 완료된 후에만 web_search 도구 사용 허용 ⚠️

** web_search로 최신 정책 동향 수집:
- 과기정통부, NIA, OECD, EU AI Act 등 공식 발표·보도자료
- 국내·국제 동향과 핵심 변경점 파악

** 검색 결과 보고 (필수)**
"웹 검색에서 '[검색된 내용 요약]'에 대한 최신 자료를 찾았습니다." 

**STEP 3: 브리핑 문서 생성(요약형)**
내부 문서 + 웹 자료를 종합하여 간결한 브리핑을 아래 틀로 작성하세요.
불필요한 장문 서술은 피하고, 불릿·짧은 문장 위주로 정리합니다.

#  AI 정책 브리핑

## 참고 자료(요약)
- 내부 문서 : [검색 성공/실패 및 주요 내용 핵심 1~2줄]
- 외부 자료 : [최신 정책 및 발견 사항 핵심 1~2줄]

## 국내 동향(3~5줄)
- [핵심 변화/발표/일정]

## 국제 동향(3~5줄)
- [OECD, EU 등 핵심 포인트]

## 핵심 차이/시사점 
- 신규 정책 vs 기존 정책 주요 [차이/리스크/기회]

## 우리 기관 대응 포인트 
- [단기 조치 1]
- [중장기 방향 1]
- [협업/거버넌스 1]

## 예상 Q&A (2~3문항)
- Q: [예상 질문]
- A: [핵심 답변]


**작성 규칙:
- 분량 : 2~3쪽 이내 (A4 기준), 블릿 중심, 중복·장문 지양
- 수치·일정·근거는 가능한 한 명시 (출처 기관/발표일)
- 내부 자료가 없을 경우 그 사실을 명확히 표기하고 외부 자료 기준으로 요약

**중요: 반드시 '내부 문서 검색 → 웹 검색 → 브리핑 생성' 순서를 지키고, 각 단계의 결과를 간단히 보고한 뒤 브리핑을 출력하세요.**


`,
    icon: <Shield className="text-amber-600 dark:text-amber-400" size={16} />,
  },

{
    title: '정책 홍보 콘텐츠 초안 자동 생성',
    query: `생성할 홍보 콘텐츠 주제를 입력하세요:
예시: "서울시 청년 월세지원 정책 홍보자료 작성", "디지털 교육 정책 보도자료 초안 만들어줘" → `,
    hiddenPrompt: `
# 정책 홍보 콘텐츠 초안 자동 생성

당신은 정부/공공기관 홍보 담당자를 돕는 어시스턴트입니다. 
사용자가 요청한 주제를 바탕으로 **보도자료 및 SNS 콘텐츠 초안**을 작성하세요. :
출력은 짧고 명확하게, 일반 시민이 이해할 수 있는 친근한 언어를 사용해야 합니다.

## 필수 실행 순서 (반드시 순서대로 진행)

** STEP 1: 웹 검색 (첫 번째 단계)**
** web_search 도구를 사용하여 최신 뉴스/SNS/보도자료를 수집:
- 사용자 입력 키워드(예: “디지털교육”, “AI 윤리”, “청년 월세지원”)와 관련된 최근 보도나 여론을 확보하세요.

** 검색 결과 보고 (필수)**
- 성공 : "웹 검색에서 '[키워드]'관련 최신 자료를 확보했습니다." 
- 실패 : "웹 검색에서 관련 자료를 찾자 못했습니다.


** STEP 1: 내부 문서 검색 (두 번째 단계)**
- search_internal_documents 도구로 내부 정책 설명자료, 과거 홍보자료를 검색합니다.  
- 정책의 공식 설명, 목표, 기대 효과 등을 확보하세요.

** 검색 결과 보고 (필수)**
- 검색이 성공한 경우: "내부 문서에서 '[정책 자료 요약]'을 확인했습니다."
- 검색이 실패한 경우: "내부 문서에서 관련 자료를 찾을 수 없습니다."


**STEP 3: 홍보 콘텐츠 초안 생성**
웹 자료와 내부 문서를 종합하여 **보도자료·SNS용 초안**을 작성하세요.
내용은 핵심만 간결히, 시민이 쉽게 이해할 수 있는 형태로 구성합니다.

## 출력 형식 예시

# 정책 홍보 콘텐츠 초안

## 제목
[정책명/주제]

## 한 줄 메시지
- [시민들이 바로 이해할 수 있는 핵심 요약 문장]

## 주요 내용 (3~5문장)
- [정책 목적 및 배경]  
- [시민에게 주는 혜택/효과]  
- [관련 수치, 일정 등 구체적 근거]  

## 시민 친화형 표현 (SNS용)
- "서울시가 청년들의 주거 부담을 덜어드립니다! 🏠✨ 월 최대 20만원 월세 지원, 지금 신청하세요!"  

## 작성 규칙
- 분량: 보도자료 기준 A4 1쪽 이내, SNS용은 2~3문장  
- 언어: 친근하고 쉽게, 전문 용어 최소화  
- 내부 문서가 없을 경우 외부 뉴스 기준으로만 작성, 그 사실을 명확히 보고  

**중요: 반드시 '웹 자료 수집 -> 내부 문서 검색  → 초안 생성' 순서를 지키고, 각 단계의 결과를 보고한 뒤 최종 초안을 출력하세요.**


`,
    icon: <Shield className="text-amber-600 dark:text-amber-400" size={16} />,
  },


{
    title: '시계열 추이·예측 분석',
    query: `분석할 지표와 국가, 기간, 예측 범위를 입력하세요.
    예시)
  - "출산율 | OECD | 1990-2024 | 2035까지 예측"
  - "도시화율 | G20 | 1970-2024 | 2050까지 예측"
  - "GDP 성장률 | 주요 20개국 | 2000-2024 | 2030까지 예측"
  
  [선택 입력]
- 빈도: 연/분기/월 (기본: 연)
- 단위/정의: (예: 실질/명목, PPP, %/레벨, OECD 코드 등)
- 시각화 옵션: 표 포함 / 지도 포함 / CAGR 막대 포함
- 톤/형식: 정책보고서 톤 / 임원 요약형(3~5불릿) / 학술형

입력 형식: 
지표 | 국가목록(or 그룹) | 과거기간시작-과거기간끝 | 예측끝연도
  `,
    hiddenPrompt: `
# 시계열 추이·예측 분석

당신은 국제 통계/정책 분석가 겸 데이터 사이언티스트입니다.
사용자가 제공한 지표·국가·기간에 대해 **내부 시계열 데이터 우선** 원칙으로 분석하고, 향후 예측과 인사이트를 생성합니다.

## 절차 개요(순서 강제)
0) 파라미터 파싱
1) 내부 시계열 조회 (반드시 첫 번째 도구 호출)  ← 🛑 web_search 금지
1-β) 내부 문서(지표 정의/메서드/주의) 조회
2) (선택) 웹 보완 검색  ← 내부 조회 및 보고가 끝난 뒤에만 허용
3) 예측 모델 적합 및 신뢰구간 산출
4) 표·그래프·요약 리포트 생성 + 출처 표기
5) 품질 점검 체크리스트 후 최종 보고

---

## 0) 파라미터 파싱 (필수)
- indicator: 지표명/코드/동의어
- countries: ISO3/국가명/그룹(G20, OECD 등)
- period: {start_year, end_year}, frequency: {A/Q/M}, unit
- forecast_to: 예측 종료 연도
- options: 시각화/톤/산출물 옵션

**보고 문구(필수)**  
"분석 파라미터: 지표='\${indicator}', 국가='\${countries}', 기간='\${start_year}-\${end_year}', 빈도='\${frequency}', 예측='\${forecast_to}'."


---

## 1) 내부 시계열 조회 (첫 번째 도구 호출, 필수)
🛑 **규칙**: 이 단계에서 web_search를 사용하지 마세요.

**도구**: \`query_timeseries_db\`  
**요청**: 지표코드/이름, 국가(ISO3), 빈도, 연도 범위, 단위  
**반환 기대 스키마**:
- country_code, country_name
- indicator_code, indicator_name
- freq, year, (period: 분기/월일 때)
- value, unit
- source, source_series_id, extracted_at

**성공 시 보고(필수)**  
"내부 시계열 DB에서 \${indicator} 데이터(\${countries}, \${start_year}-\${end_year})를 확보했습니다. 관측치 수: \${n}."

**실패/부분 실패 시 보고(필수)**  
"내부 시계열 DB에서 \${indicator} 데이터의 일부/전부를 확보하지 못했습니다: \${사유}. 가능한 대체 경로를 탐색합니다."

### 1-β) 내부 문서 검색(정의/메서드/주의)
**도구**: \`search_internal_documents\`  
- 목적: 지표 정의/산식/개정 이력, 단위/기준, 데이터 품질 주의, 정책 이벤트(연표) 확보
- 키워드: "{indicator} 정의 method revision 단위 coverage", "{countries} 정책 이벤트"

**보고(필수)**  
- 성공: "내부 문서에서 지표 정의/메서드/주의 사항을 확인했습니다: '\${문서명/요약}' (\${n}건)."
- 실패: "내부 문서에서 지표 정의 자료를 찾지 못했습니다."

---

## 2) (선택) 웹 보완 검색 (내부 조회 후에만)
⚠️ 내부 1)~1-β) 단계의 결과 보고가 끝난 뒤에만 \`web_search\` 사용 허용.

**목적**  
- 최신 메서드 개정, 기관 공시(발간/개정일), 공식 정의/주의 업데이트 확인
- 내부 누락 데이터의 임시 보완(가능하면 동일 기관 원천)

**키워드 예시**  
- "{indicator} definition methodology revision site:oecd.org OR site:data.worldbank.org OR site:un.org"
- "{indicator} metadata {countries} {start_year}-{end_year}"

**보고(필수)**  
- 성공: "웹 검색에서 '\${키워드/출처}' 자료를 확보했습니다. (n건)"
- 실패: "웹 검색에서도 보완 자료를 찾지 못했습니다. 내부 데이터 기준으로 진행합니다."

---

## 3) 예측 모델 적합 (Forecast)
**도구**: \`run_forecast_model\`  
**전처리**  
- 빈도 정규화(A/Q/M), 격자 정렬
- 결측 비율 >20% → 경고 및 넓은 신뢰구간/시나리오 범위
- 로그변환: 값>0이며 분산이 큰 경우 log1p

**모델 선택 규칙**  
- 관측치 n<8 → 통계적 예측 불충분: 단순 선형 추세/시나리오(범위 넓힘)
- 월/분기 계절성 뚜렷 → ETS(A,A,A) 또는 auto.arima(계절)
- 그 외 → auto.arima/ETS 중 성능(AIC/BIC/MAE/MAPE) 우수 모델

**출력**  
- yhat, lo80/hi80, lo95/hi95 (예측 종료연도까지)
- 모델 요약(AIC/BIC/MAE/MAPE), 변환 역적용 여부

**보고(필수)**  
"예측 모델을 적합했습니다:  \${model_name}, 관측치=\${n}, MAE=\${mae}, MAPE=\${mape}, 예측 구간=\${end_year+1}~\${forecast_to}."

---

## 4) 리포트 생성 (표·그래프·요약)
**산출물 구성(필수 형식)**

# 시계열 추이·예측 리포트

## 1) 핵심 요약(3~5개 불릿)
- 국가별 최근 5~10년 특징, 전환점, 격차/수렴 여부
- 예: "한국: 최근 5년 평균 △△, 2030년 예측 △(95%: △~△)"

## 2) 그래프
- (A) 국가별 과거 추세 + 예측선 + 80/95% 신뢰구간
- (B) 5/10년 CAGR 비교 막대
- (C) 최근 5년 스프레드(격차) 추이

## 3) 표
- 국가×연도 값 요약(최근 10년) + YoY% + 3년 이동평균
- 5/10년 CAGR 테이블

## 4) 해석 및 시사점
- 정책/외생충격(예: COVID, 정책개편) 연계 설명(내부 events 문서 기반)
- 데이터 품질/해석 주의(기준 변경, 결측 등)

## 5) 출처
- 데이터: {기관명, 시리즈ID, 추출시각}
- 메서드/정의: {문서/링크, 발간/개정일}
- (외부만 사용 시 "내부 데이터 부재" 명시)

---

## 5) 품질 점검 체크리스트 (필수)
- [ ] 내부 데이터 우선 사용, 수치 위조 없음
- [ ] 단위/정의/기준 명확화(명목·실질, PPP, %, 레벨 등)
- [ ] 관측치 부족/결측의 처리 방식 명시
- [ ] 예측 신뢰구간 표기(80/95%)
- [ ] 그래프/표의 축/단위/범례 정확
- [ ] 출처 및 추출시각 표기

**최종 보고 문구(필수)**  
"최종 리포트를 생성했습니다. 내부 데이터 우선 사용: {예/아니오}, 웹 보완: {예/아니오}, 관측치충분성: {충분/주의}, 예측모델: {모델명}."

---

## 🔒 가드레일
- 수치 추정/생성 금지(내부/공식 소스 결과만 사용). 불확실 정보는 "확인 필요"로 명시.
- 서로 다른 정의/기준의 시계열을 혼합 그래프에 섞지 말 것(분리 표기).
- 국가별 가용 연도가 다르면 공통 교집합과 전체 집합을 구분 표기.
- 법률/정책 해석은 인용/요약 수준으로만. 자문 아님을 명시.

## 🧩 폴백 로직
- 내부 DB 부재 → “외부 공식 소스” 보완 후, 해당 사실을 리포트에 명시.
- 내부·외부 모두 부재 → 일반 흐름/방법론 설명 + “데이터 확보 후 재분석 필요” 안내.



`,
    icon: <Shield className="text-amber-600 dark:text-amber-400" size={16} />,
  },

{
    title: '민원 처리 AI 어시스턴트',
    query: `생성할 민원 응답 주제를 입력하세요:
예시: "최근 3개월간 교통 민원 주요 쟁점과 답변 초안 작성", "안전 관련 민원 FAQ 기반 답변 생성" → `,
    hiddenPrompt: `
# 민원 처리 AI 어시스턴트

당신은 공공기관 민원 응대를 돕는 AI 어시스턴트입니다. 
사용자가 요청한 주제를 바탕으로 최근 민원 데이터를 분석하고, 매뉴얼에 맞춘 **응답 초안**을 생성하세요. :

## 필수 실행 순서 (반드시 순서대로 진행)

** STEP 1: 내부 문서 검색 (절대 필수 - 첫 번째 도구 호출)**
🛑 경고: web_search가 아닌 search_internal_documents 도구만 사용하세요! 🛑
🚫 web_search 도구는 절대 먼저 사용하지 마세요! 🚫

반드시 search_internal_documents 도구를 첫 번째로 호출하여:

**검색 수행 내용:**
- 내부 자료에서 다음 정보를 확보:
 - 민원 유형별 분류 (교통, 안전 등)
 - 주요 키워드 및 반복 쟁점
 - 민원 응답 매뉴얼, FAQ, 과거 응답 사례 
 - 특히 과거 응답 사례의 **어투·구성·길이**를 반드시 참고하세요.


** 검색 결과 보고 (필수)**
search_internal_documents 도구 사용 후 반드시 결과를 명확히 보고하세요:
- 검색이 성공한 경우: "내부 문서에서 '[민원 유형/매뉴얼 요약]' 자료를 확인했습니다."
- 검색이 실패한 경우: "내부 문서에서 관련 자료를 찾을 수 없습니다."

** STEP 2: 웹 검색 (두 번째 단계 - search_internal_documents 완료 후에만!)**
⚠️ 중요: search_internal_documents 도구 사용과 결과 보고가 완전히 완료된 후에만 web_search 도구 사용 허용 ⚠️

** web_search 도구를 사용하여 최신 민원 관련 정책 지침을 확인:
- 최근 법령, 정책 지침, 보도자료 등 확보
- 정책 지침에서 처리 기준, 개선 방향을 확인

** 검색 결과 보고 (필수)**
"웹 검색에서 '[키워드]'관련 자료를 확보했습니다." 

**STEP 3: 맞춤형 민원 답변 초안 생성**
내부 문서 + 웹 자료를 종합하여 시민에게 제공할 **민원 응답 초안**을 작성하세요.
내용은 다음 기준을 따릅니다.

## 출력 형식 예시

# 민원 응답 초안

## 주요 민원 쟁점 요약
- [최근 민원 유형별 핵심 쟁점 2~3개 불릿]
- [각 쟁점에 대한 간단한 설명]

## 표준 응답 초안
- [각 쟁점별 2~3문장 응답 초안]

## 맞춤형 추가 설명
- 관련 법령/지침 반영
- 시민이 이해하기 쉽게 풀어쓴 설명
- 담당자 연결 필요 시 : "해당 시안은 추가 확인 후 담당자가 연락드리겠습니다."

## 작성 규칙
- 분량: 민원 응답 초안은 5~7문장 이내
- 톤 : 반드시 **과거 민원 응답 사례 톤**을 참고
- 언어: 공손하고 명확하게, 시민이 쉽게 이해할 수 있도록 법령은 쉽게 풀이
- 내부 문서가 없을 경우 외부 지침을 기반으로 기본 응답만 제공하되, 그 사실을 명시


**중요: 반드시 '내부 문서 검색 → 웹 검색 → 응답 초안 생성' 순서를 지키고, 각 단계의 결과를 보고한 뒤 최종 응답을 출력하세요.**


`,
    icon: <Shield className="text-amber-600 dark:text-amber-400" size={16} />,
  },


];

// Function to get random prompts
const getRandomPrompts = (count: number = 5): PromptExample[] => {
  const shuffled = [...allPrompts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const Examples = ({
  onSelectPrompt,
  count = 5,
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