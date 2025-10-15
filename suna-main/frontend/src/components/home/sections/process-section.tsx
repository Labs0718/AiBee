'use client';

import Image from 'next/image';

export function ProcessSection() {
  const processItems = [
    {
      id: 1,
      icon: '📄',
      title: 'AI 정책보고서 생성',
      description: 'RAG 기반으로 방대한 정부 정책문서와 법령 데이터를 분석하여 법적·윤리적 쟁점을 포함한 전문 보고서를 자동 생성합니다.',
      features: [
        '정책 문서 및 법령 분석',
        'Self-Evaluation 기반 품질 검증',
        '법적·윤리적 쟁점 도출'
      ],
      footerNote: '✓ 정책 분석 시간을 80% 단축하고 보고서 품질 향상'
    },
    {
      id: 2,
      icon: '📋',
      title: '스케줄러 기능 ',
      description: '스케줄러를 통해 자동으로 사전에 세팅해놓은 특정 작업을 실행합니다.',
      features: [
        '프로젝트 구조 자동 분석',
        '업무 단계별 분류',
        '일정 및 자원 배분'
      ],
      footerNote: '✓ 프로젝트 기획 단계의 업무 효율성 3배 향상'
    },
    {
      id: 3,
      icon: '📝',
      title: '회의록 작성 자동화',
      description: '회의 내용을 실시간으로 분석하여 핵심 안건, 결정사항, 후속 조치를 정리한 회의록을 자동 생성합니다.',
      features: [
        '회의 내용 자동 요약',
        '결정사항 및 Action Item 추출',
        '참석자별 발언 정리'
      ],
      footerNote: '✓ 회의 후 문서화 시간 90% 절감 및 누락 방지'
    },
    {
      id: 4,
      icon: '💬',
      title: '내부 데이터 기반 Q&A',
      description: '조직 내부의 프로세스 문서, 매뉴얼을 학습하여 직원들의 질문에 정확한 답변을 즉시 제공합니다.',
      features: [
        '내부 문서 RAG 검색',
        '맥락 기반 답변 생성',
        '매뉴얼 기반 업무 안내'
      ],
      footerNote: '✓ 24시간 즉시 응답으로 업무 지연 시간 제거'
    },
    {
      id: 5,
      icon: '🔍',
      title: '문서 비교 분석',
      description: '정부 정책문서, 계약서 등의 버전 간 변경사항을 자동으로 비교·분석하여 핵심 차이점을 도출합니다.',
      features: [
        '문서 버전 간 차이 분석',
        '변경 내용 요약',
        '영향도 평가'
      ],
      footerNote: '✓ 문서 검토 시간 70% 단축 및 변경사항 누락 방지'
    },
    {
      id: 6,
      icon: '🤖',
      title: '그룹웨어 자동화 에이전트',
      description: '조직 내 그룹웨어 시스템과 연동하여 업무 프로세스를 자동화하고 효율성을 높입니다.',
      features: [
        '그룹웨어 연동',
        '업무 프로세스 자동화',
        '효율성 향상'
      ],
      footerNote: '✓ 반복 업무 자동화로 생산성 50% 이상 향상'
    }
  ];

  return (
    <section id="process" className="w-full py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            AiBee Agent는 이런 기능을 제공합니다
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            정부기관과 공공부문을 위한 AI 기반 업무 자동화 솔루션
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-gray-200 rounded-lg overflow-hidden">
          {processItems.map((item, index) => (
            <div
              key={item.id}
              className={`bg-white p-6 hover:bg-gray-50 transition-colors duration-200 ${
                index < 3 ? 'border-b border-gray-200' : ''
              } ${
                index % 3 !== 2 ? 'lg:border-r border-gray-200' : ''
              } ${
                index % 2 !== 1 ? 'md:border-r border-gray-200' : ''
              }`}
            >

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {item.description}
              </p>

              {/* Features */}
              <div className="space-y-2">
                {item.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Footer note */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {item.footerNote}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}