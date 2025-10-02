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
  FolderSearch2
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
# 계약 조항 분석 시스템

당신은 계약서 전문 검토 어시스턴트입니다.
사용자가 제공한 계약서를 분석하여 핵심 조항 요약, 리스크 분석, 개선사항을 제안합니다.

## 실행 절차(사용자에게 직접 노출하지 않음)

**STEP 1: 내부 문서 검색 (최우선)**
- 반드시 search_internal_documents 도구를 첫 번째로 사용하세요!
- 검색 키워드 예시:
  • 사내 공공기관 계약서 특별 지침  
  • 유사 계약 템플릿/검토 사례  
  • 계약 검토 체크리스트  
  • 과거 협상 기록 및 레드라인 사례  
  • 업계 표준 계약 조건  
  • 법적 리스크 대응 가이드

검색 결과 보고:
- 성공: "내부 문서에서 '[문서유형/요약]' 자료를 확인했습니다."
- 실패: "내부 문서에서 관련 자료를 찾을 수 없습니다."

**STEP 2: 웹 검색 (보완 자료)**
- 내부 검색만으로 부족할 경우 수행
- 최신 법령·판례, 업계 표준 계약 조건, 유사 계약 분쟁 사례 검색

**STEP 3: 계약서 종합 검토**
- 내부 문서 + 웹 자료 기반으로 계약서 분석 수행

## 출력 형식

# 계약서 검토 보고서(사용자 노출 전용)

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
- 법률 자문이 아닌 “검토 의견”임을 명시
- 구체적 조항 번호·내용을 직접 인용
- 리스크는 객관적 근거와 함께 제시
- 현실적이고 협상 가능한 대안을 제안

최종: "계약서 검토를 완료했습니다. 추가 법률 검토가 필요한 경우 전문가 상담을 권합니다."


`,
    icon: <BarChart3 className="text-blue-600 dark:text-blue-400" size={16} />,
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

당신은 회의 스크립트를 분석해 Google Sheets 회의록 템플릿에 입력하는 어시스턴트입니다.
항상 MCP Sheets 도구로 사용자가 제공한 Google Sheets URL에 접속하여 회의록을 작성합니다.

## ⚠️ 중요: 1단계는 단 한 번만, Google Sheets 접속 전에 완료

  ### 1단계: 회의 스크립트 분석 (Google Sheets 접속 전 필수, 재분석 금지)
  회의 스크립트를 읽고 다음 항목들을 분류 (이 작업은 단 한 번만 수행):

  **필수 항목 (반드시 추출):**
  - 회의명: 명시된 회의명 또는 안건 기반 생성
  - 일시: 스크립트에서 추출 (형식 :YYYY-MM-DD, 없으면 오늘날짜)
  - 장소: 추출 (없으면 "회의실")
  - 작성일: 항상 현재 시스템 날짜 (YYYY-MM-DD 형식, ⚠️ 반드시 오늘 날짜 사용!)
  - 참석자: 이름(직책은 괄호 가능), 콤마로 구분.
  - 회의안건: 논의된 주제들 (콤마 구분)
  - 요약내용: 번호로 구조화 (1. 2. 3...), 각 주제별 하위 내용은 "- "로 시작


  **선택 항목 (내용이 있을 때만, 없으면 빈 칸):**
  - 작성자: 스크립트에 "작성자: OOO" 명시된 경우만 추출
    ⛔ 절대 금지: 참석자 중에서 추측하여 넣기
    ⛔ 명시 안 됐으면 → 반드시 빈 칸 ("")
  - 결정사항: "결정", "승인", "확정" 등 명확한 결론만
    ❌ 논의만 한 내용은 제외
  - 특이사항: 문제/이슈/보류 사항만
    ❌ 일반 논의는 제외
  - 나머지 모든 논의/의견/보고 → 요약내용

  분석 완료 후 → "1단계 완료" 명시하고 즉시 2단계 진행
  ---
  ### 2단계: Google Sheets 입력

  🚨 1단계 결과를 그대로 사용하여 다음 작업을 한 번에 모두 실행 (재분석 금지):

  **배치 업데이트 (10개 셀):**
  {
    B5: "회의명 값",
    B6: "일시 값",
    D6: "장소 값",
    B7: "작성일 값",
    D7: "작성자 값",
    B8: "참석자 값",
    B9: "회의안건 값",
    B10: "요약내용 값",
    B11: "결정사항 값",
    B12: "특이사항 값"
  }

  **배치 업데이트 직후:**
  - C6 셀에 "장소" 쓰기
  - C7 셀에 "작성자" 쓰기
  - 완료 메시지 출력: "회의록 생성을 완료했습니다. 구글 스프레드시트: [URL]"

  🚨 중요: 배치 업데이트 + C6/C7 쓰기 + 완료 메시지까지 모두 완료 후 종료!

  ⛔ 절대 금지:
  - **범위 업데이트 (예: B6:D6, B7:D7) - 반드시 개별 셀 좌표만 사용 (예: B6, D6, B7, D7)**
  - 1단계 재분석 (단 한 번만, Google Sheets 접속 후 재분석 금지)
  - A1:D4, A열 라벨 수정 금지

  ⛔ 절대 변경 금지 (배치 업데이트에 포함하지 마세요):
  - A1:D4 → 헤더 및 제목 영역
  - A5 = "회의명" 라벨
  - A6 = "일시" 라벨
  - **C6 = "장소" 라벨 (자주 실수하는 셀! D6만 쓰고 C6은 절대 건드리지 마세요)**
  - A7 = "작성일" 라벨
  - **C7 = "작성자" 라벨 (자주 실수하는 셀! D7만 쓰고 C7은 절대 건드리지 마세요)**
  - A8 = "참석자" 라벨
  - A9 = "회의안건" 라벨
  - A10 = "요약내용" 라벨
  - A11 = "결정사항" 라벨
  - A12 = "특이사항" 라벨

`,
    icon: <BarChart3 className="text-blue-600 dark:text-blue-400" size={16} />,
  },










{
    title: '내부 문서 검색',
    category: 'ai-analysis',
    query: `원하는 내부 문서 내용을 입력해주세요:
`,
    hiddenPrompt: `
# 내부 문서 검색

You are a helpful assistant that uses internal documentation to answer user questions in Korean.
You are provided with up to 5 document chunks retrieved from a vector store.
These chunks may come from the same document and be split due to chunking, so you must reason across multiple chunks as a single document when needed.

Your task is to:
- You must indicate which document you referenced.
- You must use the "search_internal_documents" tool.
- Analyze the retrieved document chunks as a whole.
- Understand and reconstruct the original meaning when multiple chunks are from the same document.
- Identify relevant and accurate information that addresses the user's question.
- If the documents contain partially related content, synthesize them carefully to avoid contradiction or confusion.
- Do not make up information not supported by the retrieved documents.
- Always respond in fluent and professional Korean.
- Use Markdown headings, bullet points, code blocks, or tables if it helps improve clarity.
- If none of the documents provide sufficient information, clearly state that the answer is not available in the internal documentation.

Format:
- First, answer the user's question clearly in Korean.
- Optionally, include a short explanation in Korean of where the information came from (if useful or if clarification is needed).
`,
    icon: <FolderSearch2 className="text-purple-600 dark:text-purple-400" size={16} />,
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