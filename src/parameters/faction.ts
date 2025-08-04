import { ParameterValue } from './index';

// 파벌 기본 파라미터
export const FACTION_PARAMETERS: Record<string, ParameterValue> = {
  // 기본 특성
  defaultFactionAggression: {
    value: 0.5,
    min: 0.0,
    max: 1.0,
    step: 0.1,
    description: '기본 파벌 공격성',
    category: '기본 특성'
  },
  defaultFactionCooperation: {
    value: 0.5,
    min: 0.0,
    max: 1.0,
    step: 0.1,
    description: '기본 파벌 협력성',
    category: '기본 특성'
  },
  defaultFactionInnovation: {
    value: 0.5,
    min: 0.0,
    max: 1.0,
    step: 0.1,
    description: '기본 파벌 혁신성',
    category: '기본 특성'
  },
  defaultFactionTradition: {
    value: 0.5,
    min: 0.0,
    max: 1.0,
    step: 0.1,
    description: '기본 파벌 전통성',
    category: '기본 특성'
  },

  // 통계
  defaultFactionPopulation: {
    value: 6,
    min: 1,
    max: 20,
    step: 1,
    description: '기본 파벌 인구',
    category: '통계'
  },
  defaultFactionMilitary: {
    value: 50,
    min: 0,
    max: 100,
    step: 5,
    description: '기본 파벌 군사력',
    category: '통계'
  },
  defaultFactionEconomy: {
    value: 50,
    min: 0,
    max: 100,
    step: 5,
    description: '기본 파벌 경제력',
    category: '통계'
  },
  defaultFactionTechnology: {
    value: 50,
    min: 0,
    max: 100,
    step: 5,
    description: '기본 파벌 기술력',
    category: '통계'
  },

  // 생성 관련
  initialFactionCount: {
    value: 4,
    min: 1,
    max: 10,
    step: 1,
    description: '초기 파벌 수',
    category: '생성'
  },
  maxFactionCount: {
    value: 10,
    min: 5,
    max: 20,
    step: 1,
    description: '최대 파벌 수',
    category: '생성'
  }
};

// 파벌 파라미터 초기화 함수
export function initializeFactionParameters(parameterManager: any): void {
  Object.entries(FACTION_PARAMETERS).forEach(([key, param]) => {
    parameterManager.parameters.faction.parameters[key] = param;
  });
} 