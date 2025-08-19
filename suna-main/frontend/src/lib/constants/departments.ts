/**
 * 회사 부서 목록 상수
 */
export const DEPARTMENTS = [
  '대표이사',
  'AI_labs',
  '경영지원팀',
  '자율주행물류사업',
  'IT운영사업팀',
  '웹서비스팀',
  '컨버지드팀',
  '개발1팀',
  '개발2팀',
  '개발3팀',
  '개발4팀',
  '기획관리팀',
  '기술영업팀',
  'M-BcN운영팀',
  'SI사업부',
  'Veeam사업팀',
  'ioT사업팀',
  '파트너본부'
] as const;

export type Department = typeof DEPARTMENTS[number];