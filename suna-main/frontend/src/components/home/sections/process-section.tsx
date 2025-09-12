'use client';

import Image from 'next/image';

export function ProcessSection() {
  const processItems = [
    {
      id: 1,
      icon: '📄',
      title: 'AI 정책보고서 생성',
      description: '방대한 정부 정책문서를 분석해 핵심 내용을 요약하고, 정책의 영향과 개선방안을 자동으로 생성합니다.',
      features: [
        '정책 분석 및 요약',
        '영향도 평가',
        '개선방안 제시'
      ]
    },
    {
      id: 2,
      icon: '📊',
      title: '민원 대응 전략 수립',
      description: '시민들의 다양한 민원을 분석하고, 효과적인 대응전략과 해결방안을 제시합니다.',
      features: [
        '민원 분류 및 분석',
        '대응 전략 수립',
        '해결방안 제시'
      ]
    },
    {
      id: 3,
      icon: '📝',
      title: '정책 홍보 콘텐츠 초안 자동 생성',
      description: '정책의 핵심 내용을 바탕으로 시민들이 이해하기 쉬운 홍보 콘텐츠를 자동 생성합니다.',
      features: [
        '홍보 콘텐츠 생성',
        '시민 친화적 표현',
        '다양한 매체 대응'
      ]
    },
    {
      id: 4,
      icon: '👥',
      title: '민원처리 AI 어시스턴트',
      description: '민원 접수부터 처리까지 전 과정을 지원하는 AI 어시스턴트로 업무 효율성을 높입니다.',
      features: [
        '민원 접수 지원',
        '처리 과정 안내',
        '자동 응답 생성'
      ]
    },
    {
      id: 5,
      icon: '🔗',
      title: '외부 서비스 연동(MCP)',
      description: '다양한 외부 시스템과 연동하여 종합적인 정보 처리와 업무 자동화를 실현합니다.',
      features: [
        '시스템 연동',
        '데이터 통합',
        '업무 자동화'
      ]
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
      ]
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
                  ✓ 정부기관 특화 AI 솔루션으로 업무 효율성 향상
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}