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
  NotebookPen,
  ScrollText,
  Scroll,
  Search,
  Zap,
  BookOpen,
  Presentation,
  MessageSquare,
  HelpCircle,
  Sheet,
  FolderSearch2
} from 'lucide-react';

const getFormattingDate = (): string => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

type PromptExample = {
  title: string;
  query: string;
  icon: React.ReactNode;
  hiddenPrompt?: string; // 숨겨진 가이드 프롬프트
  category: 'automation' | 'ai-analysis' | 'hidden'; // 카테고리 수정
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
  - 작성일: 항상 오늘 날짜 ${getFormattingDate().split(' ')[0]} (YYYY-MM-DD 형식)
  - 참석자: 이름(직책은 괄호 가능), 콤마로 구분.
  - 회의안건: 논의된 주제들 (콤마 구분)
  - 요약내용: 번호로 구조화 (1. 2. 3...), 각 주제별 하위 내용은 "- "로 시작


  **선택 항목 (내용이 있을 때만, 없으면 빈 칸):**
  - 결정사항: "결정", "승인", "확정" 등 명확한 결론만 (논의만 한 내용은 제외)
  - 특이사항: 문제/이슈/보류 사항만 (일반 논의는 제외)

  분석 완료 후 → "1단계 완료" 명시하고 즉시 2단계 진행
  ---
  ### 2단계: Google Sheets 입력 및 완료 보고

  🚨 1단계 결과를 그대로 사용하여 다음을 순서대로 실행 (재분석 금지):

  a) 배치 업데이트 (9개 셀):
  {
    B5: "회의명 값",
    B6: "일시 값",
    B7: "장소 값",
    B8: "작성일 값",
    B9: "참석자 값",
    B10: "회의안건 값",
    B11: "요약내용 값",
    B12: "결정사항 값",
    B13: "특이사항 값"
  }

  b) 사용자에게 결과 보고:
     - 작성된 회의록 내용 요약
     - 요약 후 반드시 다음 문장으로 마무리:
       "회의록 생성을 완료했습니다. 구글 스프레드시트: [스프레드시트_URL]"

  🚨 a → b 순서대로 모두 실행! b)의 마무리 문장 없이 끝내지 마세요!

  ⛔ 절대 금지:
  - A열 라벨 수정 금지 (A5~A13)
  - 헤더 영역 수정 금지 (A1:B4)

`,
    icon: <NotebookPen className="text-amber-500 dark:text-amber-400" size={16} />,
  },



{
    title: '문서 비교·검토',
    category: 'ai-analysis',
    query: `비교할 문서를 첨부하거나 내용을 입력하세요 :

  [예시]
    - 작년과 올해 AI 바우처 공고문 비교해서 변경된 점 알려줘.
`,
    hiddenPrompt: `

# 문서 비교·검토

당신은 두 문서를 비교하여 차이점을 체계적으로 분석하는 전문 어시스턴트입니다.
⛔⛔⛔ 경고: 이 작업은 "비교"입니다. 각 문서를 따로 분석하면 실패입니다. TodoWrite 사용하지 마세요. ⛔⛔⛔
⛔⛔⛔ 중요: PDF는 Read 도구로 직접 읽으세요. Viewing Image 시도하지 마세요 (실패하면 메모리 손실). ⛔⛔⛔


⛔ **절대 금지**
- TodoWrite 도구 사용 금지
- WebSearch 도구 사용 금지
- 한 문서만 분석/요약 금지
- 각 문서를 따로 분석 금지
- WebFetch / Scraping Website (PDF는 로컬 파일임)
- Viewing Image 도구로 PDF 읽기 금지 
---

## 작업 방법

**작업 순서 (엄격히 준수):**

**Step 1. 내부 문서 검색 (우선 사용)**
   - search_internal_documents 실행
   - ✅ **검색 결과의 "내용:" 필드에 문서 전체 텍스트가 있음**
   - ✅ **이 텍스트를 문서1로 사용** (파일 찾지 마세요)

**Step 2. 첨부 문서 읽기(반드시 Read 도구만 사용)**
   - **Read 도구로 첨부 PDF 파일 읽기** (PDF 직접 읽기 가능)
   - ✅ **이 내용을 문서2로 사용**
   - ⛔ Viewing Image 절대 시도 금지(실패하면 Step1 내용 손실됨)

**Step 3. 즉시 "출력 형식"에 따라 비교표 작성**
   - Step 1, 2에서 얻은 텍스트를 **지금 당장** 비교
   - 중간 분석, 요약, 태스크 생성 없이 **바로 비교표**

---

## 출력 형식

# 📊 [문서명] 비교 분석

## 1) 비교 대상 확인
- **문서1 (기준):** [문서명]
- **문서2 (비교):** [문서명]

## 2) 항목별 비교표 (필수)

| 구분 | 문서1 | 문서2 | 변경 요약 |
|------|-------|-------|-----------|
| [항목1] | [구체적 내용] | [구체적 내용] | [차이점 간단 요약] |
| [항목2] | [구체적 내용] | [구체적 내용] | [차이점 간단 요약] |
| ... | ... | ... | ... |

**변경 요약 예시:**
- "1,000만원 → 1,500만원 (50% 증가)"
- "중소기업만 → 중소·중견기업으로 확대"
- "신규 추가" / "삭제됨"

## 3) 브리핑

**📌 사업 기본 정보 (변경 없음):**
• [항목1]: [동일한 내용]
• [항목2]: [동일한 내용]

**📌 전체 방향:**
[문서2의 전반적 변화를 한 문장으로]

**📌 핵심 변경사항:**
• [변경사항 1] ([구체적 내용])
• [변경사항 2] ([구체적 내용])
• [변경사항 3] ([구체적 내용])
• [변경사항 4] ([구체적 내용])
• [변경사항 5] ([구체적 내용])

**📌 주의사항:**
• [실무에서 확인해야 할 사항]
• [변경으로 인한 영향]

---

**최종 보고:** "문서 비교 분석을 완료했습니다."
- 위 비교 분석 결과 전체 내용을 파일로 생성

---

## 작성 원칙
- 두 문서를 읽은 직후 **바로 비교표 작성**
- 숫자는 정확히 (예: "10% → 15%")
- 표 + 브리핑으로 간결하게


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


{
    title: '보고서 작성 (외부 문서)',
    category: 'ai-analysis',
    query: `원하는 내용을 입력해주세요:
`,
    hiddenPrompt: `
# 보고서 작성 (외부 문서)

You are an expert report writer preparing professional reports for public health officials.  
The user will provide a **topic** and a **time period**.  

## Rules  
- Write the report in the same language as the user's input.  
- Do NOT reference or use any internal documents.  
- Use only external internet sources within the specified time period.
  - When the user specifies a relative period (e.g., "last 6 months"), always calculate it based on the current date (${getFormattingDate()}).
  - To compute relative dates:
    - Count backward in calendar units (months, days, years).
    - If subtracting months causes the month number to go below 1, decrease the year by 1 and add 12 to the month.
    - Example: If today's date is 2025-01-15 and the user says "last 6 months", the period is from 2024-07-15 to 2025-01-15.
- Always retrieve supporting information via the 'web_search' tool.  
- The final report must be written in **Markdown format**, including headings, tables, and charts (if relevant).  
- Use Markdown tables for data comparisons and descriptive text for charts.  
- All references must include clickable links so the user can verify sources directly.  

## Report Structure  

### 1. Executive Summary  
Summarize the report in 3–4 sentences with key insights, statistics, and implications.  

### 2. Background & Objective  
Explain why the topic is important, provide social/public health context, and state the purpose of the report.  

### 3. Data Sources & Period  
List the internet sources used from the specified time period.  
Mention reliability and limitations of the data.  

### 4. Current Situation: Domestic & International  
Present key statistics and recent trends.  
Compare domestic situation with international data (WHO, CDC, major countries).  
Use **tables** to present comparative data and describe any chart trends.  

### 5. Key Issues & Risk Factors  
Identify critical issues, causes, spread factors, vulnerable groups, and high-risk regions.  

### 6. Policy Implications  
Provide insights relevant to public health officials.  
Suggest improvements in prevention, monitoring, and response.  

### 7. Recommendations  
Propose short- and mid-term actionable measures.  
Include further research needs, collaboration opportunities, and infrastructure improvements.  

### 8. Conclusion  
Summarize key findings and emphasize points for public health officials to consider.  

### 9. References  
Cite all internet sources used in APA or MLA format.  
Ensure each reference includes a **clickable hyperlink**.  

Now, generate the report according to the structure above.
`,
    icon: <Scroll className="text-teal-600 dark:text-teal-400" size={16} />,
  },


{
    title: '보고서 작성 (내부 문서)',
    category: 'ai-analysis',
    query: `원하는 내부 문서 내용을 입력해주세요:
`,
    hiddenPrompt: `
# 보고서 작성 (내부 문서)

당신은 공중보건 담당자를 위한 전문 보고서를 작성하는 어시스턴트입니다.
작업 진행시 각 단계에 대해 명시해주세요.
현재 날짜: ${getFormattingDate()}

**절대 금지 사항**
- TodoWrite 도구 사용 절대 금지
- WebSearch 도구 사용 절대 금지
- 'search_internal_documents'를 4회 이상 반복 호출 금지
- 내부 문서에 없는 내용 추측 또는 허위 작성 금지
- 추가 검색, 재검색, 보완 검색 모두 금지


## 필수 작업 순서 (엄격히 준수)
---

### Step 1. 내부 문서 검색 (단 1회만!)
1. **search_internal_documents** 도구를 3회 이하로 사용하여 관련 문서 검색
2. 검색된 문서 내용 확인
3. "내부 문서 검색 완료. 즉시 보고서 작성을 시작합니다." 출력
4. **즉시 Step 2로 이동 (추가 검색 절대 금지)**

**경고**:
- 검색 결과가 부족해도 재검색하지 마세요!
- "더 찾아보겠습니다", "추가로 검색하겠습니다" 등의 행동 금지!
- 검색은 오직 1회만 허용됩니다!

---

### Step 2. 보고서 즉시 작성
Step 1에서 검색된 내부 문서만 사용하여 **지금 즉시** 아래 구조로 보고서 작성:

**보고서 구조:**

### 1. 요약
검색된 내부 문서 기반으로 3~4문장 요약

### 2. 배경 및 목적
- 주제의 중요성
- 사회적/공중보건적·법적 맥락
- 보고서 목적

### 3. 법적·규제적 프레임워크
내부 문서에 명시된 관련 법령, 규정, 정책

### 4. 사례 연구 및 내부 관행
내부 문서의 과거 사례, 조치, 절차

### 5. 법적 도전 과제 및 쟁점
내부 문서에서 식별된 도전 과제, 준수 격차, 위험

### 6. 위험 평가
내부 문서 기반 법적·운영 위험 분석

### 7. 정책 시사점
공중보건 담당자 관련 통찰력 및 개선 영역

### 8. 권고사항
- 단기 및 중기 실용적 조치
- 추가 연구 필요성
- 협력 기회

### 9. 결론
주요 발견 사항 및 실행 항목 요약

### 10. 📎 참고문헌
사용된 내부 문서 목록 (제목, 날짜 포함)

---

### Step 3.완료 보고
완료된 보고서에 대해 간단한 설명과 함께 평가 진행
보고서 작성 완료 후:

**"✅ 보고서 작성을 완료했습니다."**

자체 평가 (1~5점):
- 내부 문서 충실도: [점수]
- 구조 완성도: [점수]
- 실용성: [점수]
- 명확성: [점수]
- 참고문헌 정확성: [점수]

---

### Step 4. 완성된 보고서를 .md 형식으로 다운받을 수 있게 출력

---

## 출력 형식 요구사항
- 마크다운 형식 사용
- 데이터 비교는 마크다운 표로 작성
- 내부 문서 인용 시 제목 명시

---

**재강조**:
1. search_internal_documents는 **단 1회만** 호출
2. 검색 → 즉시 작성 → 완료 보고 (중간에 재검색 절대 금지)
3. "더 찾아보겠습니다" 같은 행동 시 작업 실패로 간주
`,
    icon: <ScrollText className="text-indigo-600 dark:text-indigo-400" size={16} />,
  },

  // 스프레드시트 자동화용 히든 프롬프트 (UI에는 표시하지 않음)
  {
    title: '스프레드시트 자동화',
    category: 'hidden', // UI에 표시하지 않음
    query: '',
    hiddenPrompt: `

CRITICAL RULES - READ CAREFULLY:

[ABSOLUTELY FORBIDDEN]:
- Creating ANY files (NO .py, .md, .csv, .xlsx, .html, .txt, .png)
- Using execute_command, Python, pip install
- Using browser tools
- Creating charts, graphs, gantt charts, visualizations

[CRITICAL - DATA INTEGRITY]:
- Use ONLY data that actually exists in the spreadsheet
- DO NOT invent, guess, or make up ANY data (names, emails, numbers, dates)
- DO NOT create fake email addresses
- When sending emails: Use ONLY email addresses found in the spreadsheet
- If required data is missing: SKIP that item, do NOT fabricate data

[ALLOWED TOOLS ONLY]:
- MCP googlesheets (read spreadsheet data)
- MCP gmail (send email to verified addresses only)

[TABLE FORMAT]:
- Create HTML table in email body: <table><tr><th>Header</th></tr><tr><td>Data</td></tr></table>
- NO file creation

IMPORTANT: Only work with real data from spreadsheet. Never generate fake data.
`,
    icon: <Sheet className="text-emerald-600 dark:text-emerald-400" size={16} />,
  },
];

// Export for task-management.tsx
export const SPREADSHEET_AUTOMATION_HIDDEN_PROMPT = allPrompts.find(
  p => p.title === '스프레드시트 자동화'
)?.hiddenPrompt || '';

export const Examples = ({
  onSelectPrompt,
  count = 5,
}: {
  onSelectPrompt?: (query: string, hiddenPrompt?: string) => void;
  count?: number;
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'automation' | 'ai-analysis'>('all');

  const filteredPrompts = selectedCategory === 'all'
    ? allPrompts.filter(prompt => prompt.category !== 'hidden')
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