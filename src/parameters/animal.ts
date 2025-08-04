// ParameterValue 타입 정의 (순환 참조 방지)
export interface ParameterValue {
  value: number;
  min: number;
  max: number;
  step: number;
  description: string;
  category: string;
}

// 동물 기본 파라미터
export const ANIMAL_PARAMETERS: Record<string, ParameterValue> = {
  // 기본 스탯
  initialAnimalHp: {
    value: 100,
    min: 50,
    max: 200,
    step: 10,
    description: '동물 초기 HP',
    category: '기본 스탯'
  },
  initialAnimalStamina: {
    value: 100,
    min: 50,
    max: 200,
    step: 10,
    description: '동물 초기 스태미나',
    category: '기본 스탯'
  },
  initialAnimalHunger: {
    value: 0,
    min: 0,
    max: 100,
    step: 5,
    description: '동물 초기 배고픔',
    category: '기본 스탯'
  },
  initialAnimalMorale: {
    value: 50,
    min: 0,
    max: 100,
    step: 5,
    description: '동물 초기 사기',
    category: '기본 스탯'
  },

  // 동물 특성
  defaultAnimalSize: {
    value: 0.5,
    min: 0.1,
    max: 1.0,
    step: 0.1,
    description: '기본 동물 크기',
    category: '동물 특성'
  },
  defaultAnimalSpeed: {
    value: 1.0,
    min: 0.1,
    max: 2.0,
    step: 0.1,
    description: '기본 동물 속도',
    category: '동물 특성'
  },
  defaultAnimalSenses: {
    value: 1.0,
    min: 0.1,
    max: 2.0,
    step: 0.1,
    description: '기본 동물 감지',
    category: '동물 특성'
  },
  defaultAnimalThreat: {
    value: 1.0,
    min: 0.1,
    max: 2.0,
    step: 0.1,
    description: '기본 동물 위협도',
    category: '동물 특성'
  },
  defaultAnimalFear: {
    value: 0.0,
    min: 0.0,
    max: 1.0,
    step: 0.1,
    description: '기본 동물 공포',
    category: '동물 특성'
  },
  defaultPulseRadius: {
    value: 50,
    min: 10,
    max: 200,
    step: 10,
    description: '기본 Pulse 반경',
    category: '동물 특성'
  },

  // 동물별 특성
  wolfSize: {
    value: 0.7,
    min: 0.3,
    max: 1.0,
    step: 0.1,
    description: '늑대 크기',
    category: '동물별 특성'
  },
  wolfSpeed: {
    value: 0.8,
    min: 0.3,
    max: 1.5,
    step: 0.1,
    description: '늑대 속도',
    category: '동물별 특성'
  },
  wolfThreat: {
    value: 0.8,
    min: 0.3,
    max: 1.5,
    step: 0.1,
    description: '늑대 위협도',
    category: '동물별 특성'
  },
  deerSize: {
    value: 0.8,
    min: 0.4,
    max: 1.2,
    step: 0.1,
    description: '사슴 크기',
    category: '동물별 특성'
  },
  deerSpeed: {
    value: 0.9,
    min: 0.4,
    max: 1.6,
    step: 0.1,
    description: '사슴 속도',
    category: '동물별 특성'
  },
  deerThreat: {
    value: 0.3,
    min: 0.1,
    max: 1.0,
    step: 0.1,
    description: '사슴 위협도',
    category: '동물별 특성'
  },
  rabbitSize: {
    value: 0.3,
    min: 0.1,
    max: 0.6,
    step: 0.1,
    description: '토끼 크기',
    category: '동물별 특성'
  },
  rabbitSpeed: {
    value: 0.9,
    min: 0.4,
    max: 1.6,
    step: 0.1,
    description: '토끼 속도',
    category: '동물별 특성'
  },
  rabbitThreat: {
    value: 0.1,
    min: 0.0,
    max: 0.5,
    step: 0.1,
    description: '토끼 위협도',
    category: '동물별 특성'
  },
  bearSize: {
    value: 1.0,
    min: 0.6,
    max: 1.5,
    step: 0.1,
    description: '곰 크기',
    category: '동물별 특성'
  },
  bearSpeed: {
    value: 0.6,
    min: 0.2,
    max: 1.2,
    step: 0.1,
    description: '곰 속도',
    category: '동물별 특성'
  },
  bearThreat: {
    value: 1.0,
    min: 0.5,
    max: 1.8,
    step: 0.1,
    description: '곰 위협도',
    category: '동물별 특성'
  },
  foxSize: {
    value: 0.5,
    min: 0.2,
    max: 0.8,
    step: 0.1,
    description: '여우 크기',
    category: '동물별 특성'
  },
  foxSpeed: {
    value: 0.8,
    min: 0.3,
    max: 1.4,
    step: 0.1,
    description: '여우 속도',
    category: '동물별 특성'
  },
  foxThreat: {
    value: 0.6,
    min: 0.2,
    max: 1.2,
    step: 0.1,
    description: '여우 위협도',
    category: '동물별 특성'
  },

  // 생존 관련
  animalHungerIncreaseRate: {
    value: 0.3,
    min: 0.1,
    max: 1.0,
    step: 0.1,
    description: '동물 배고픔 증가 속도',
    category: '생존'
  },
  animalStaminaDecreaseRate: {
    value: 0.2,
    min: 0.1,
    max: 0.8,
    step: 0.1,
    description: '동물 스태미나 감소 속도',
    category: '생존'
  },
  animalHpRegenRate: {
    value: 0.05,
    min: 0.01,
    max: 0.5,
    step: 0.01,
    description: '동물 HP 회복 속도',
    category: '생존'
  },
  animalStaminaRegenRate: {
    value: 0.1,
    min: 0.01,
    max: 0.5,
    step: 0.01,
    description: '동물 스태미나 회복 속도',
    category: '생존'
  },

  // 나이 관련
  animalAgeIncreaseRate: {
    value: 0.002,
    min: 0.0001,
    max: 0.01,
    step: 0.0001,
    description: '동물 나이 증가 속도',
    category: '나이'
  },
  animalMaxAge: {
    value: 500,
    min: 100,
    max: 2000,
    step: 100,
    description: '동물 최대 나이',
    category: '나이'
  },

  // 생성 관련
  animalSpawnProbability: {
    value: 0.01,
    min: 0.001,
    max: 0.1,
    step: 0.001,
    description: '동물 생성 확률',
    category: '생성'
  },
  rabbitSpawnRatio: {
    value: 0.6,
    min: 0.1,
    max: 0.9,
    step: 0.1,
    description: '토끼 생성 비율',
    category: '생성'
  },
  deerSpawnRatio: {
    value: 0.3,
    min: 0.1,
    max: 0.8,
    step: 0.1,
    description: '사슴 생성 비율',
    category: '생성'
  },
  otherAnimalSpawnRatio: {
    value: 0.1,
    min: 0.0,
    max: 0.5,
    step: 0.1,
    description: '기타 동물 생성 비율',
    category: '생성'
  }
};

// 동물 파라미터 초기화 함수
export function initializeAnimalParameters(parameterManager: any): void {
  Object.entries(ANIMAL_PARAMETERS).forEach(([key, param]) => {
    parameterManager.parameters.animal.parameters[key] = param;
  });
} 