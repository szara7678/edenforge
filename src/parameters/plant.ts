import { ParameterValue } from './index';

// 식물 기본 파라미터
export const PLANT_PARAMETERS: Record<string, ParameterValue> = {
  // 기본 스탯
  initialPlantHp: {
    value: 100,
    min: 50,
    max: 200,
    step: 10,
    description: '식물 초기 HP',
    category: '기본 스탯'
  },
  initialPlantMaxHp: {
    value: 100,
    min: 50,
    max: 200,
    step: 10,
    description: '식물 초기 최대 HP',
    category: '기본 스탯'
  },
  initialPlantGrowth: {
    value: 0.1,
    min: 0.0,
    max: 0.5,
    step: 0.05,
    description: '식물 초기 성장도',
    category: '기본 스탯'
  },
  initialPlantSize: {
    value: 0.5,
    min: 0.1,
    max: 1.0,
    step: 0.1,
    description: '식물 초기 크기',
    category: '기본 스탯'
  },

  // 식물 특성
  defaultPlantResilience: {
    value: 0.5,
    min: 0.1,
    max: 1.0,
    step: 0.1,
    description: '기본 식물 저항력',
    category: '식물 특성'
  },
  defaultPlantSeedDispersion: {
    value: 0.5,
    min: 0.1,
    max: 1.0,
    step: 0.1,
    description: '기본 식물 씨앗 분산',
    category: '식물 특성'
  },
  defaultPlantYield: {
    value: 0.5,
    min: 0.1,
    max: 1.0,
    step: 0.1,
    description: '기본 식물 수확량',
    category: '식물 특성'
  },

  // 성장 관련
  plantGrowthRate: {
    value: 0.002,
    min: 0.0001,
    max: 0.01,
    step: 0.0001,
    description: '식물 성장 속도',
    category: '성장'
  },
  plantMaturityThreshold: {
    value: 0.8,
    min: 0.5,
    max: 1.0,
    step: 0.1,
    description: '식물 성숙 임계값',
    category: '성장'
  },
  plantAgeIncreaseRate: {
    value: 0.001,
    min: 0.0001,
    max: 0.01,
    step: 0.0001,
    description: '식물 나이 증가 속도',
    category: '성장'
  },
  plantMaxAge: {
    value: 100,
    min: 50,
    max: 500,
    step: 10,
    description: '식물 최대 나이',
    category: '성장'
  },

  // 번식 관련
  plantReproductionProbability: {
    value: 0.002,
    min: 0.0001,
    max: 0.01,
    step: 0.0001,
    description: '식물 번식 확률',
    category: '번식'
  },
  plantReproductionDistance: {
    value: 30,
    min: 5,
    max: 100,
    step: 5,
    description: '식물 번식 거리',
    category: '번식'
  },
  plantDensityLimit: {
    value: 5,
    min: 1,
    max: 20,
    step: 1,
    description: '식물 밀도 제한',
    category: '번식'
  },
  plantDensityRadius: {
    value: 50,
    min: 10,
    max: 200,
    step: 10,
    description: '식물 밀도 체크 반경',
    category: '번식'
  },

  // 사망 관련
  plantNaturalDeathProbability: {
    value: 0.001,
    min: 0.0001,
    max: 0.01,
    step: 0.0001,
    description: '식물 자연사 확률',
    category: '사망'
  },

  // 생성 관련
  plantSpawnProbability: {
    value: 0.005,
    min: 0.0001,
    max: 0.05,
    step: 0.0001,
    description: '식물 생성 확률',
    category: '생성'
  },
  initialPlantCountRatio: {
    value: 0.5,
    min: 0.1,
    max: 2.0,
    step: 0.1,
    description: '초기 식물 수 비율 (인간 대비)',
    category: '생성'
  },
  grassSpawnRatio: {
    value: 0.4,
    min: 0.1,
    max: 0.8,
    step: 0.1,
    description: '풀 생성 비율',
    category: '생성'
  },
  flowerSpawnRatio: {
    value: 0.3,
    min: 0.1,
    max: 0.7,
    step: 0.1,
    description: '꽃 생성 비율',
    category: '생성'
  },
  bushSpawnRatio: {
    value: 0.2,
    min: 0.1,
    max: 0.6,
    step: 0.1,
    description: '덤불 생성 비율',
    category: '생성'
  },
  treeSpawnRatio: {
    value: 0.1,
    min: 0.0,
    max: 0.4,
    step: 0.1,
    description: '나무 생성 비율',
    category: '생성'
  },

  // 소비 관련
  plantConsumptionProbability: {
    value: 0.3,
    min: 0.1,
    max: 0.8,
    step: 0.1,
    description: '식물 소비 확률 (동물)',
    category: '소비'
  },
  humanPlantConsumptionProbability: {
    value: 0.4,
    min: 0.1,
    max: 0.9,
    step: 0.1,
    description: '식물 소비 확률 (인간)',
    category: '소비'
  },
  plantConsumptionDistance: {
    value: 10,
    min: 5,
    max: 50,
    step: 5,
    description: '식물 소비 거리',
    category: '소비'
  },
  plantConsumptionAmount: {
    value: 15,
    min: 5,
    max: 50,
    step: 5,
    description: '식물 소비량',
    category: '소비'
  }
};

// 식물 파라미터 초기화 함수
export function initializePlantParameters(parameterManager: any): void {
  Object.entries(PLANT_PARAMETERS).forEach(([key, param]) => {
    parameterManager.parameters.plant.parameters[key] = param;
  });
} 