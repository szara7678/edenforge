// ParameterValue 타입 정의 (순환 참조 방지)
export interface ParameterValue {
  value: number;
  min: number;
  max: number;
  step: number;
  description: string;
  category: string;
}

// 생태계 기본 파라미터
export const ECOSYSTEM_PARAMETERS: Record<string, ParameterValue> = {
  // 상호작용
  interactionDistance: {
    value: 10,
    min: 5,
    max: 50,
    step: 5,
    description: '상호작용 거리',
    category: '상호작용'
  },
  maxInteractionPerTick: {
    value: 5,
    min: 1,
    max: 20,
    step: 1,
    description: '틱당 최대 상호작용 수',
    category: '상호작용'
  },

  // 환경
  temperatureEffect: {
    value: 0.1,
    min: 0.0,
    max: 1.0,
    step: 0.1,
    description: '온도 영향',
    category: '환경'
  },
  humidityEffect: {
    value: 0.1,
    min: 0.0,
    max: 1.0,
    step: 0.1,
    description: '습도 영향',
    category: '환경'
  },
  lightEffect: {
    value: 0.1,
    min: 0.0,
    max: 1.0,
    step: 0.1,
    description: '조명 영향',
    category: '환경'
  },

  // 밸런스
  predatorPreyRatio: {
    value: 0.2,
    min: 0.1,
    max: 0.5,
    step: 0.05,
    description: '포식자-먹이 비율',
    category: '밸런스'
  },
  herbivorePlantRatio: {
    value: 0.3,
    min: 0.1,
    max: 0.8,
    step: 0.1,
    description: '초식동물-식물 비율',
    category: '밸런스'
  },
  carryingCapacity: {
    value: 1000,
    min: 100,
    max: 10000,
    step: 100,
    description: '환경 수용력',
    category: '밸런스'
  }
};

// 생태계 파라미터 초기화 함수
export function initializeEcosystemParameters(parameterManager: any): void {
  Object.entries(ECOSYSTEM_PARAMETERS).forEach(([key, param]) => {
    parameterManager.parameters.ecosystem.parameters[key] = param;
  });
} 