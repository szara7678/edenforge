// ParameterValue 타입 정의 (순환 참조 방지)
export interface ParameterValue {
  value: number;
  min: number;
  max: number;
  step: number;
  description: string;
  category: string;
}

// 재료 기본 파라미터
export const MATERIAL_PARAMETERS: Record<string, ParameterValue> = {
  // 기본 특성
  defaultMaterialHardness: {
    value: 0.5,
    min: 0.1,
    max: 1.0,
    step: 0.1,
    description: '기본 재료 경도',
    category: '기본 특성'
  },
  defaultMaterialFlexibility: {
    value: 0.5,
    min: 0.1,
    max: 1.0,
    step: 0.1,
    description: '기본 재료 유연성',
    category: '기본 특성'
  },
  defaultMaterialDurability: {
    value: 0.5,
    min: 0.1,
    max: 1.0,
    step: 0.1,
    description: '기본 재료 내구성',
    category: '기본 특성'
  },
  defaultMaterialConductivity: {
    value: 0.5,
    min: 0.1,
    max: 1.0,
    step: 0.1,
    description: '기본 재료 전도성',
    category: '기본 특성'
  },
  defaultMaterialFlammability: {
    value: 0.5,
    min: 0.1,
    max: 1.0,
    step: 0.1,
    description: '기본 재료 가연성',
    category: '기본 특성'
  },
  defaultMaterialToxicity: {
    value: 0.0,
    min: 0.0,
    max: 1.0,
    step: 0.1,
    description: '기본 재료 독성',
    category: '기본 특성'
  },

  // 티어별 특성
  tier1Value: {
    value: 1,
    min: 1,
    max: 10,
    step: 1,
    description: '티어 1 가치',
    category: '티어별 특성'
  },
  tier2Value: {
    value: 5,
    min: 2,
    max: 20,
    step: 1,
    description: '티어 2 가치',
    category: '티어별 특성'
  },
  tier3Value: {
    value: 15,
    min: 5,
    max: 50,
    step: 5,
    description: '티어 3 가치',
    category: '티어별 특성'
  },
  tier4Value: {
    value: 50,
    min: 20,
    max: 100,
    step: 10,
    description: '티어 4 가치',
    category: '티어별 특성'
  },
  tier5Value: {
    value: 100,
    min: 50,
    max: 200,
    step: 25,
    description: '티어 5 가치',
    category: '티어별 특성'
  },

  // 생성 관련
  materialSpawnProbability: {
    value: 0.1,
    min: 0.01,
    max: 0.5,
    step: 0.01,
    description: '재료 생성 확률',
    category: '생성'
  },
  maxMaterialCount: {
    value: 1000,
    min: 100,
    max: 5000,
    step: 100,
    description: '최대 재료 수',
    category: '생성'
  },

  // 조합 관련
  combinationThreshold: {
    value: 0.3,
    min: 0.1,
    max: 0.8,
    step: 0.05,
    description: '재료 조합 임계값',
    category: '조합'
  },
  combinationRandomFactor: {
    value: 0.3,
    min: 0.1,
    max: 0.5,
    step: 0.05,
    description: '조합 랜덤 요소',
    category: '조합'
  },
  combinationCommonPropBonus: {
    value: 0.2,
    min: 0.1,
    max: 0.4,
    step: 0.02,
    description: '공통 속성 보너스',
    category: '조합'
  },
  combinationTierDiffPenalty: {
    value: 0.1,
    min: 0.05,
    max: 0.2,
    step: 0.01,
    description: '티어 차이 페널티',
    category: '조합'
  },

  // 연구 기반 조합 관련
  researchBaseChance: {
    value: 0.6,
    min: 0.3,
    max: 0.9,
    step: 0.05,
    description: '연구 기반 조합 기본 확률',
    category: '연구 조합'
  },
  researchIntelligenceBonus: {
    value: 0.2,
    min: 0.1,
    max: 0.4,
    step: 0.02,
    description: '연구 지능 보너스',
    category: '연구 조합'
  },
  researchSkillDivisor: {
    value: 150,
    min: 100,
    max: 300,
    step: 10,
    description: '연구 스킬 나누기 값',
    category: '연구 조합'
  },
  researchMaxDiscoveryChance: {
    value: 0.4,
    min: 0.2,
    max: 0.8,
    step: 0.05,
    description: '연구 최대 발견 확률',
    category: '연구 조합'
  },
  researchTierSkillDivisor: {
    value: 20,
    min: 10,
    max: 50,
    step: 2,
    description: '연구 티어 스킬 나누기 값',
    category: '연구 조합'
  },
  researchWeightMultiplier: {
    value: 1.0,
    min: 0.5,
    max: 2.0,
    step: 0.1,
    description: '연구 가중치 배수',
    category: '연구 조합'
  },
  researchPropertyVariation: {
    value: 0.1,
    min: 0.05,
    max: 0.2,
    step: 0.01,
    description: '연구 속성 변이',
    category: '연구 조합'
  }
};

// 재료 파라미터 초기화 함수
export function initializeMaterialParameters(parameterManager: any): void {
  Object.entries(MATERIAL_PARAMETERS).forEach(([key, param]) => {
    parameterManager.parameters.material.parameters[key] = param;
  });
} 