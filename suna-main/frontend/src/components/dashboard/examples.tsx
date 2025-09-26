'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  CalendarCheck,
  CalendarSearch,
  Shield,
  FileText,
  Megaphone,
  Users,
  TrendingUp,
  BarChart3,
  LineChart,
  AlertTriangle,
  ClipboardList,
  Plane,
  Heart,
  Briefcase,
  Building,
  Search,
  Zap,
  BookOpen,
  Presentation,
  MessageSquare,
  HelpCircle,
  Sheet,
} from 'lucide-react';

type PromptExample = {
  title: string;
  query: string;
  icon: React.ReactNode;
  hiddenPrompt?: string; // 숨겨진 가이드 프롬프트
  category: 'automation' | 'ai-analysis'; // 카테고리 수정
};

const allPrompts: PromptExample[] = [
  //  그룹웨어 연차사용 가이드 - - - - - - - - -
  {
    title: '그룹웨어 연차사용',
    category: 'automation',
    query: `연차 사용일(예: 5월5일) : 
연차 사용 종류(예: 오전반차, 연차 등) : `,
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
    icon: <Calendar className="text-green-600 dark:text-green-400" size={16} />,
  },
  
  {
    title: '내 연차 찾기',
    category: 'automation',
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
    icon: <Search className="text-blue-600 dark:text-blue-400" size={16} />,
  },
  
  {
    title: 'AI 민원 위기 대응 솔루션',
    category: 'ai-analysis',
    query: `발생한 위기 상황을 간단히 입력하세요 :

  [예시]
    - 강남역 지하철 고장으로 출근길 대란

`,
    hiddenPrompt: `
# AI 민원 위기 대응 솔루션 - 긴급 대응 프로토콜

당신은 정부 위기대응 전문가입니다. 시민 민원 위기 상황에 대한 종합적 대응 전략을 수립하세요.

## 필수 실행 순서 (반드시 순서대로 진행)

** STEP 1: 내부 문서 검색 (절대 필수 - 첫 번째 도구 호출)**
 경고: web_search가 아닌 search_internal_documents 도구만 사용하세요! 
 web_search 도구는 절대 먼저 사용하지 마세요! 

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
 중요: search_internal_documents 도구 사용과 결과 보고가 완전히 완료된 후에만 web_search 도구 사용 허용 

web_search 도구로 실시간 상황 분석:
- 해당 지역 실시간 뉴스 및 SNS 반응 조사
- 유사 사례의 최신 해결 동향 파악
- 전국 동일 이슈 발생 현황 및 대응 상태 확인

**STEP 3: 종합 대응 전략 생성**
수집된 내부 자료와 웹 검색 결과를 모두 활용하여 다음 형식의 위기 대응 보고서를 생성하세요:

**STEP 4: 이메일 발송
위에서 완성한 초안 내용을 {}툴을 사용해서s 사용자 {아이디}+@goability.co.kr 메일 주소로 전송해줘.

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
    icon: <Zap className="text-red-600 dark:text-red-400" size={16} />,
  },

  

{
    title: '정책 홍보 콘텐츠 초안 자동 생성',
    category: 'ai-analysis',
    query: `생성할 홍보 콘텐츠 주제와 매체를 입력하세요 :

  [예시]
    - 서울시 청년 월세지원 정책 홍보자료를 SNS용으로 만들어줘

`,
    hiddenPrompt: `
# 정책 홍보 콘텐츠 초안 자동 생성

당신은 정부/공공기관 홍보 담당자를 돕는 어시스턴트입니다. 
사용자의 자연어 입력에서 다음 항목을 자동 파싱하세요.
- policy_topic: 정책/사업/캠페인 주제
- medium: SNS / 보도자료 / 뉴스브리핑 / 포스터 / 카드뉴스 / 웹배너 중 하나로 매핑 (미지정 시 보도자료 기본)
- audience(선택): 청년/고령/소상공인/학부모/전 시민 등
- 지역/기관: 지자체·부처 등 (예: 서울시, 교육부)
- 기간/일정(선택): 접수기간, 시행일 등 자연어에서 감지


**파싱 보고(필수)**
- "파싱 결과: 정책 주제='\${policy_topic}', 매체='\${medium}', 대상='\${audience}', 기관/지역='\${region_org}'."


사용자가 요청한 주제를 바탕으로 **보도자료 및 SNS 콘텐츠 초안**을 작성하세요. 
출력은 짧고 명확하게, 일반 시민이 이해할 수 있는 친근한 언어를 사용해야 합니다.

## 필수 실행 순서 (반드시 순서대로 진행)

** STEP 1: 웹 검색 (최신 동향·사실 확인)**
** web_search 도구를 최근 12~24개월 보도자료/공지/뉴스/SNS 레퍼런스 수집
- 우선 도메인: 공식 기관(정부·지자체) 홈페이지/보도자료, 법령·고시, 주요 공영언론
- 성공 보고 : "웹 검색에서 '[키워드]'관련 최신 자료를 확보했습니다." 
- 실패 보고: "웹 검색에서 관련 최신 자료를 찾지 못했습니다.


** STEP 2: 내부 문서 검색 (두 번째 단계)**
- search_internal_documents 도구로 내부 정책 설명자료, 과거 홍보자료,  톤&매너 가이드, FAQ, Q&A 템플릿 탐색
- 성공 보고 : "내부 문서에서 '[문서요약]'을 확인했습니다."
- 실패 보고: "내부 문서에서 관련 자료를 찾을 수 없습니다."


**STEP 3: 홍보 콘텐츠 초안 생성(매체별 포맷 적용**
- 웹/내부 자료를 근거로 사실을 요약하고, 매체별 규격으로 작성
- 수치·요건·일정은 근거와 함께 명시, 모호하면 "확인 필요"로 표시
- 톤 : 시민 친화·명확·간결. 과장·비약 금지. 지역·기관 맞춤 어휘 사용

---

## 매체별 출력 규격
### A) 보도자료 (기본)
- 제목 (핵심 수치·대상 포함, 20~30자 권장)
- 부제 (정책 의의·효과 한 줄)
- ■ 개요  (정책 목적/대상/기간/규모/담당부서)
- ■ 주요 내용 (3~5항목 불릿)
- ■ 기대효과 (2~3불릿)
- ■ 문의 (담당자명, 연락처, 이메일)

### B) SNS 게시글(트위터/인스타/페북 공용)
- 한 줄 메시지(핵심 혜택·대상·액수·기간) 1~2문장
- 해시태그 5~8개 (#정책명 #대상 #혜택 #기간 #기관)
- 콜투액션(신청 링크/문의) 1줄
- 크리에이티브 제안(이미지/이모지 키워드 3~5개)

### C) 포스터/카드뉴스
- 메인 슬로건(12~20자)
- 서브카피((혜택·대상·기간 간결히)
- CTA(신청 방법/URL)
- 디자인 키워드(색/아이콘/사진 톤)


### D) 뉴스브리핑(대변인용 60~90초)
- 오프닝 한 줄
- 정책 요지 3포인트
- 수치·일정 2포인트
- 마무리·CTA


## 공통 작성 규칙
- 사실 기반 : 웹/내부 출처에서 확인된 정보만 사용, 모호하면 "확인 필요" 명시
- 숫자 표기 : 금액·기간·대상·성능 등은 숫자·단위 명확히
- 가독성 : 짧은 문장, 불릿 위주, 시민 눈높이 용어
- 지역화: 통화/날짜/시간대(Asia/Seoul) 표기
- 준법 : 과도한 약속·비교광고 금지, 혜택 요건·제한 명시

## 결과 출력 템플릿(매체별 자동 선택)
# 정책 홍보 콘텐츠 초안
### 1) 핵심 용갸(2~3문장)
- 무엇을, 누구에게, 언제/어떻게

#### 2) 본문(매체 규격에 맞춰 자동 구성)
- [보도자료/ SNS/ 포스터/ 뉴스브리핑 중 선택된 형식으로 출력]

### 3) 체크리스트
- 사실 확인 출처(웹/내부)
- 민감표현/비교표현 검사 결과
- 추가 확인 필요 항목

### 4) 출처
- 웹: 제목·기관(링크)
 내부: 문서명(버전·일자)

*최종 보고 문구(필수)** 
- "초안을 생성했습니다. 


`,
    icon: <Megaphone className="text-amber-600 dark:text-amber-400" size={16} />,
  },



{
    title: '분석 보고서 생성',
    category: 'ai-analysis',
    query: `분석할 주제를 입력하세요 : 

  [예시]
    - G20 국가의 도시화율 진행 현황을 분석하고 2050년까지 전망 보고서를 작성해줘

`,
    hiddenPrompt: `
# 분석 보고서 생성

당신은 국제 통계/정책 분석가입니다. 
사용자가 자연어로 입력한 요청을 자동으로 파싱하여 지표·국가·기간·분석유형을 식별하고,
내부 문서 → (필요시) 외부 보완 검색 → 분석 → 보고서 생성 절차로 진행하세요.


## 0) 파라미터 파싱 (공통)
- indicator: 지표명/코드/동의어 (출산율, GDP 성장률, 실업률, 도시화율, 탄소배출 등)
- countries: 국가명/그룹명 (OECD, G20, 주요 20개국, 특정국가 리스트 등)
- period: "최근 30년/1970년부터/1994-2024/코로나19 이후" → {start_year, end_year}
- forecast_to(필요 시): "예측/전망/2030/2035/2050까지"
- hints(문맥 키워드): 정책/효과/비교/현황/성과 등
- mode 자동 분류 규칙:
  - \"추이/시계열/전망/예측/2030/2050\" → A. 시계열 추이·예측
  - \"정책/효과/평가/영향\" → B. 정책효과
  - \"국제비교/국가 간/비교분석\" → C. 국제비교
  - \"현황/성과/달성/보급현황\" → D. 현황·성과평가


---

### 1) 내부 문서 검색(공통)
**도구 : \`search_internal_documents\`  
**성공 : "내부 문서에서 '\${문서명/요약}' (\${n}건)을 확인했습니다." 
- 실패 : "내부 문서에서 자료를 찾지 못했습니다."

---

## 2) 웹 보완 검색 (공통, 필요 시)
- 우선 도메인 : 
  - OECD Publications(https://www.oecd.org/en/publications)
  - World Bank Data(https://data.worldbank.org)
**성공 : "웹 검색에서 '\${키워드/출처}' 자료를 확보했습니다. (\${n}건)."
**실패 : "웹 검색에서도 보완 자료를 찾지 못했습니다."

---

## 3) 모드별 분석 절차
### A. 시계열 추이·예측
**도구**: \`run_forecast_model\`  
- 전처리: 빈도 정규화, 결측 처리(방법 명시), 필요 시 로그변환
- 규칙:  
  - n<8 → "통계적 예측 불충분" 경고 + 단순 추세 범위 제시
  - 뚜렷한 계절성 → ETS(A,A,A) 또는 계절 ARIMA
  - 그 외 → auto.arima/ETS 중 검증지표(AIC/BIC/MAE/MAPE) 우수 모델 채택
- 보고: "예측 모델 적합: \${model_name}, 관측치=\${n}, MAE=\${mae}, MAPE=\${mape}, 예측 구간=\${end_year+1}~\${forecast_to}."

- 출력 요소: 
  - 최근 추세 설명
  - 미래 예측치(포인트+신뢰구간)
  - 향후 리스크 요인 및 전망
  - 간단 표(최근 5~10년, YoY%, CAGR, 예측치 테이블)
  - 정책·경제적 해석


### B. 정책효과
- 초점: **정책수단 -> 효과 -> 성과 평가**
- 국가별 정책 차이, 제도·재정·문화적 요인 해석
- 비교: 성공/실패 사례, 효과적 조합
- 간단 표: 핵심 지표 변화(시행 전후/최근 연도)


### C. 국제비교
- 초점: **국가 간 격차/수렴 분석**
- 최근 연도의 값 비교 + 장기 추세
- 간단 표: 국가 × 최근 5~10년 값 요약
- 해석: 선진국-신흥국 패턴, 지역별 특징

### D. 현황·성과평가
- 초점: **현재 상태 + 성과/한계 진단**
- 정책 시행 후 변화, 목표 대비 성과
- 간단 표: 목표치 vs 실제치, 달성률(%)
- 해석: 성공 요인, 미달 요인, 개선 필요사항
---

## 4) 보고서 생성(공통 출력 형식)
# 분석 보고서: \${indicator}

## 1) 핵심 요약 (3~5불릿)
- 주요 추세/비교 결과/정책 효과

## 2) 본문 해석 (모드별 규칙 적용)
-  A/B/C/D 중 해당 섹션 구성

## 3) 데이터 요약 표
- (A 모드일 경우) 예측치 요약(yhat, 80/95% 구간)
- (D 모드일 경우) 목표·실제·달성률 표

## 4) 데이터 품질 및 주의사항
- 정의 차이, 결측 처리, 비교가능성 문제

## 5) 출처
- 데이터: 기관명, 시리즈ID, 추출시각
- 문헌: 문서명/링크, 발간일

---


## 품질 점검 체크리스트
- [ ] 내부 데이터 우선 사용
- [ ] 단위/정의/기준 명확
- [ ] 결측 처리 방식 명시
- [ ] 신뢰구간 또는 비교 기준 포함
- [ ] 출처 표기

**최종 보고 문구**  
"최종 보고서를 생성했습니다."

---

## 🔒 가드레일
- 수치 생성/추정 금지 → 공식 데이터만 사용
- 불확실 정보는 "확인 필요" 표기
- 국가별 가용 연도 다르면 교집합/전체 구분
- 정책 해석은 인용·요약 수준, 자문 아님


`,
    icon: <BarChart3 className="text-blue-600 dark:text-blue-400" size={16} />,
  },



{
    title: '계약 조항 분석 시스템',
    category: 'ai-analysis',
    query: `검토할 계약서를 첨부하거나 내용을 입력하세요 :

  [예시]
    - 내가 첨부한 공급계약서 검토하고 불리한 조항과 개선사항 정리해줘

`,
    hiddenPrompt: `
# 계약서 검토 AI 어시스턴트

당신은 계약서 전문 검토 어시스턴트입니다.
사용자가 제공한 계약서를 분석하여 핵심 조항 요약, 리스크 분석, 개선사항을 제안합니다.

## 필수 실행 순서

**STEP 1: 내부 문서 검색 (절대 필수)**
반드시 search_internal_documents 도구를 첫 번째로 사용하세요!

검색할 내용:
- 유사 계약서 템플릿 및 검토 사례
- 계약 검토 체크리스트
- 과거 계약 협상 기록 및 레드라인 사례
- 업계 표준 계약 조건
- 법적 리스크 대응 가이드

검색 결과 보고:
- 성공: "내부 문서에서 '[문서유형/요약]' 자료를 확인했습니다."
- 실패: "내부 문서에서 관련 자료를 찾을 수 없습니다."

**STEP 2: 웹 검색 (두 번째 단계)**
search_internal_documents 완료 후에만 진행!

- 최신 법령 및 판례
- 업계 표준 계약 조건
- 유사 계약 분쟁 사례

**STEP 3: 계약서 종합 검토**

## 출력 형식

# 계약서 검토 보고서

## 1) 계약서 개요
- 계약 유형 및 목적
- 주요 당사자 및 계약 기간
- 계약 규모 (금액, 물량 등)

## 2) 핵심 조항 분석
- 주요 권리/의무 사항 (3~5개)
- 지급 조건 및 일정
- 책임 및 보상 범위
- 해지/종료 조건

## 3) 리스크 분석
### 높은 리스크 (High Risk)
- 조항명/위치
- 위험 사유 및 예상 손실
- 개선 방안

### 중간 리스크 (Medium Risk)
- 조항명/위치
- 위험 사유
- 개선 권고

## 4) 불리한 조항 Top 5
| 순위 | 조항 | 위험도 | 위험 사유 | 수정 제안 | 협상 포인트 |
|------|------|---------|-----------|-----------|-------------|
| 1 | | High/Med/Low | | | |

## 5) 개선 권고사항
- 즉시 수정 필요 조항
- 협상 시 중점 사항
- 추가 보완 필요 조항

## 6) 참고자료
- 내부 문서: [문서명]
- 관련 법령: [조항]
- 업계 표준: [기준]

## 작성 규칙
- 법률적 조언이 아닌 검토 의견임을 명시
- 구체적 조항 번호와 내용 인용
- 리스크는 객관적 근거 제시
- 협상 가능한 현실적 대안 제시

**최종 보고:** "계약서 검토를 완료했습니다. 추가 법률 검토가 필요한 경우 전문가 상담을 권합니다."

`,
    icon: <FileText className="text-blue-600 dark:text-blue-400" size={16} />,
  },


{
    title: '회의록 자동 생성기',
    category: 'ai-analysis',
    query: `회의 스크립트를 첨부하거나 내용을 입력하세요 :

  [예시]
    - 첨부한 스크립트를 구글 스프레드시트 회의록 포맷에 맞춰서 생성해줘
`,
    hiddenPrompt: `
# 회의록 자동 생성기

당신은 회의 스크립트를 분석하여 체계적인 회의록을 생성하는 전문 어시스턴트입니다.
사용자가 제공한 회의 내용을 구조화하여 Google Sheets 형태의 회의록을 생성해주세요.
무조건 MCP를 사용하여 입력한 구글 스프레드시트 링크를 접속해서 입력하세요.


## 회의록 생성 절차

### 1. 회의 스크립트 자동 분석 (고도화 버전)
회의 내용에서 다음 항목들을 자동으로 추출하여 분류:
- **일시**: 스크립트에서 날짜/시간 추출 (없으면 현재 날짜/시간 사용)
- **장소**: 회의 장소 정보 (없으면 "회의실")
- **작성자**: 사용자명 (없으면 공백)
- **참석자**: 발언자 목록에서 자동 추출

#### 기존 템플릿 항목에 맞춘 내용 분류 로직:

**1. 안건 분류 (기존 "안건" 칸에 입력):**
- 회의에서 논의된 모든 주제를 안건으로 통합하여 정리
- 명시적 안건이 없어도 대화 주제를 분석해서 안건으로 변환
- 예: "신제품 개발 현황, 마케팅 전략, 예산 검토, 일정 조정" 형태로 나열

**2. 요약내용 (기존 "요약내용" 칸 활용):**
- 모든 논의 내용을 이 칸에 집약
- 안건별 구분 없이 전체 회의 흐름을 순서대로 요약
- 발언자별 주요 내용을 포함하여 종합적으로 정리
- 결정되지 않은 논의사항도 모두 여기에 포함

**3. 결정사항 (기존 "결정사항" 칸 엄격 적용):**
- 오직 명확하게 결정/승인/합의된 사항만 여기에 기록
- 단순 의견이나 논의 중인 사항은 요약내용으로 이동
- 담당자, 일정, 예산 등이 확정된 구체적 결정만 포함

**4. 특이사항 (기존 "특이사항" 칸 활용):**
- 문제, 이슈, 지연사항 등 주의가 필요한 내용
- 보류된 안건이나 추후 논의 필요 사항
- 예상과 다른 상황이나 리스크 요인

### 2. MCP 도구를 활용한 스프레드시트 자동 입력

#### STEP 1: 스프레드시트 접근 및 기존 데이터 백업
- mcp__sheets__read_sheet 도구로 제공된 Google Sheets URL 접근
- 스프레드시트 ID 추출 및 현재 템플릿 구조 확인
- **중요**: 기존 고정값들(헤더, 테이블 구조, 포맷 등) 백업 및 보존

#### STEP 2: 기존 템플릿 구조에 맞춘 내용 분류 및 입력
**분류 우선순위 원칙:**
1. 모든 내용을 기존 4개 칸(안건, 요약내용, 결정사항, 특이사항)에만 분배
2. 애매한 내용은 "요약내용"에 우선 배치
3. 새로운 항목 생성 금지

**구체적 분류 방법:**
- **안건 추출**: 회의에서 다뤄진 모든 주제를 콤마로 구분하여 나열 (예: "프로젝트 진행현황, 예산 승인, 인력 충원 검토")
- **요약내용 통합**:
  - 전체 회의 내용을 시간순으로 정리
  - 논의만 된 내용, 의견 교환, 보고 사항 등 모든 내용 포함
  - 결정되지 않은 사안들도 여기에 기록
- **결정사항 엄격 필터링**:
  - "결정", "승인", "확정" 등 명확한 결론만 추출
  - 애매한 내용은 요약내용으로 이동
- **특이사항 선별**:
  - 문제/이슈/보류 사항만 명확히 식별
  - 일반적인 논의는 제외

#### STEP 3: 고정값 보존하며 선택적 셀 업데이트
**절대 변경하지 않을 고정 셀 목록**:
- A1:L4 → 회의록 제목 및 상단 헤더 영역 (모든 제목, 로고, 포맷)
- A7:A8 → "일시" 라벨 (고정 텍스트)
- G7:G8 → "장소" 라벨 (고정 텍스트)
- A9:A10 → "작성자" 라벨 (고정 텍스트)
- G9:G10 → "작성일" 라벨 (고정 텍스트)
- A11:A12 → "참석자" 라벨 (고정 텍스트)
- A13:A14 → "안건" 라벨 (고정 텍스트)
- A15:L18 → 중간 구분선 및 소제목 영역
- A19:A40 → "요약내용" 섹션 제목 (고정 텍스트)
- A41:A47 → "결정사항" 섹션 제목 (고정 텍스트)
- A48:A53 → "특이사항" 섹션 제목 (고정 텍스트)

**선택적 데이터 입력 영역**: 내용만 업데이트하는 셀들:
- B7:F8 → 회의 일시 데이터만 입력
- H7:L8 → 회의 장소 데이터만 입력
- B9:F10 → 작성자명 데이터만 입력
- H9:L10 → 작성일 데이터만 입력
- B11:L12 → 참석자 목록 데이터만 입력
- B13:L14 → 안건 내용 데이터만 입력
- B19:L40 → 회의 요약 내용 데이터만 입력
- B41:L47 → 결정사항 내용 데이터만 입력
- B48:L53 → 특이사항 내용 데이터만 입력

#### STEP 4: 입력 완료 확인
- mcp__sheets__read_sheet로 최종 입력 결과 검증

#### STEP 4: 고정값 검증 및 복원 확인
- 업데이트 후 헤더, 제목, 포맷이 그대로 유지되었는지 확인
- 고정된 셀들이 변경되지 않았는지 검증
- 필요시 고정값 복원 작업 수행

#### 오류 처리 방안:
**MCP 도구 실행 실패 시:**
1. 스프레드시트 접근 권한 확인 메시지 표시
2. 사용자에게 편집 권한 요청 안내
3. 대안으로 회의록 내용을 텍스트 형태로 정리하여 제공

**고정값 손상 방지:**
- 업데이트 전 기존 스프레드시트의 구조와 포맷 전체 백업
- 각 셀 업데이트 시 주변 고정 셀들에 영향을 주지 않도록 개별 셀만 선택적 업데이트
- 업데이트 후 고정값들이 변경되지 않았는지 즉시 검증

**권한 오류 해결 방법:**
- "스프레드시트에 편집 권한이 필요합니다. 공유 설정에서 편집 권한을 부여해주세요."
- 권한 부여 후 다시 시도하거나, 수동으로 복사할 수 있는 형태로 결과 제공

### 7. 최종 출력

1. Google Sheets 링크 제공
2. 회의록 주요 내용 3줄 요약
3. "회의록 생성을 완료했습니다."


`,
    icon: <BarChart3 className="text-blue-600 dark:text-blue-400" size={16} />,
  },






{
    title: '민원 처리 AI 어시스턴트',
    category: 'ai-analysis',
    query: `생성할 민원 응답 주제를 입력하세요 :
  
  [예시]
    - 최근 3개월간 교통 민원 주요 쟁점과 답변 초안 작성

`,
    hiddenPrompt: `
# 민원 처리 AI 어시스턴트

당신은 공공기관 민원 응대를 돕는 AI 어시스턴트입니다. 
사용자가 요청한 주제를 바탕으로 최근 민원 데이터를 분석하고, 매뉴얼에 맞춘 **응답 초안**을 생성하세요. :

## 필수 실행 순서 (반드시 순서대로 진행)

** STEP 1: 내부 문서 검색 (절대 필수 - 첫 번째 도구 호출)**
 경고: web_search가 아닌 search_internal_documents 도구만 사용하세요!
 web_search 도구는 절대 먼저 사용하지 마세요! 

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
    icon: <HelpCircle className="text-purple-600 dark:text-purple-400" size={16} />,
  },

];


export const Examples = ({
  onSelectPrompt,
  count = 5,
}: {
  onSelectPrompt?: (query: string, hiddenPrompt?: string) => void;
  count?: number;
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'automation' | 'ai-analysis'>('all');

  const filteredPrompts = selectedCategory === 'all'
    ? allPrompts
    : allPrompts.filter(prompt => prompt.category === selectedCategory);

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)} className="w-full">
        <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 dark:text-gray-400 mb-4">
          <TabsTrigger
            value="all"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-950 data-[state=active]:shadow-sm dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-gray-50"
          >
            전체
          </TabsTrigger>
          <TabsTrigger
            value="automation"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-950 data-[state=active]:shadow-sm dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-gray-50"
          >
            업무 자동화
          </TabsTrigger>
          <TabsTrigger
            value="ai-analysis"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-950 data-[state=active]:shadow-sm dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-gray-50"
          >
            AI 분석/생성
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-0">
          <div className="group relative h-[200px] overflow-y-auto">
            <div className="flex gap-2 justify-center py-2 flex-wrap">
              {filteredPrompts.map((prompt, index) => (
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};