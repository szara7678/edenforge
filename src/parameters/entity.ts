// ParameterValue 타입 정의 (순환 참조 방지)
export interface ParameterValue {
  value: number;
  min: number;
  max: number;
  step: number;
  description: string;
  category: string;
}

// 엔티티 기본 파라미터
export const ENTITY_PARAMETERS: Record<string, ParameterValue> = {
  // 기본 스탯
  initialHp: {
    value: 100,
    min: 50,
    max: 200,
    step: 10,
    description: '초기 HP',
    category: '기본 스탯'
  },
  initialStamina: {
    value: 100,
    min: 50,
    max: 200,
    step: 10,
    description: '초기 스태미나',
    category: '기본 스탯'
  },
  initialHunger: {
    value: 0,
    min: 0,
    max: 100,
    step: 5,
    description: '초기 배고픔',
    category: '기본 스탯'
  },
  initialMorale: {
    value: 50,
    min: 0,
    max: 100,
    step: 5,
    description: '초기 사기',
    category: '기본 스탯'
  },

  // 스탯 범위
  minStat: {
    value: 0,
    min: 0,
    max: 50,
    step: 5,
    description: '최소 스탯',
    category: '스탯 범위'
  },
  maxStat: {
    value: 100,
    min: 50,
    max: 200,
    step: 10,
    description: '최대 스탯',
    category: '스탯 범위'
  },
  defaultStat: {
    value: 50,
    min: 20,
    max: 100,
    step: 5,
    description: '기본 스탯',
    category: '스탯 범위'
  },

  // 스킬 범위
  minSkill: {
    value: 0,
    min: 0,
    max: 50,
    step: 5,
    description: '최소 스킬',
    category: '스킬 범위'
  },
  maxSkill: {
    value: 100,
    min: 50,
    max: 200,
    step: 10,
    description: '최대 스킬',
    category: '스킬 범위'
  },
  defaultSkill: {
    value: 30,
    min: 10,
    max: 100,
    step: 5,
    description: '기본 스킬',
    category: '스킬 범위'
  },

  // 인벤토리
  initialInventoryCapacity: {
    value: 100,
    min: 50,
    max: 500,
    step: 10,
    description: '초기 인벤토리 용량',
    category: '인벤토리'
  },

  // 생존 관련
  hungerIncreaseRate: {
    value: 0.05, // 0.5 → 0.05로 대폭 감소
    min: 0.01,
    max: 1.0,
    step: 0.01,
    description: '배고픔 증가 속도',
    category: '생존'
  },
  staminaDecreaseRate: {
    value: 0.3,
    min: 0.1,
    max: 1.0,
    step: 0.1,
    description: '스태미나 감소 속도',
    category: '생존'
  },
  hpRegenRate: {
    value: 0.1,
    min: 0.01,
    max: 1.0,
    step: 0.01,
    description: 'HP 회복 속도',
    category: '생존'
  },
  staminaRegenRate: {
    value: 0.2,
    min: 0.01,
    max: 1.0,
    step: 0.01,
    description: '스태미나 회복 속도',
    category: '생존'
  },

  // 나이 관련
  ageIncreaseRate: {
    value: 0.001,
    min: 0.0001,
    max: 0.01,
    step: 0.0001,
    description: '나이 증가 속도',
    category: '나이'
  },
  maxAge: {
    value: 1000,
    min: 100,
    max: 5000,
    step: 100,
    description: '최대 나이',
    category: '나이'
  },

  // 이동 관련
  moveSpeed: {
    value: 1.0,
    min: 0.1,
    max: 5.0,
    step: 0.1,
    description: '이동 속도',
    category: '이동'
  },
  moveStaminaCost: {
    value: 0.5,
    min: 0.1,
    max: 2.0,
    step: 0.1,
    description: '이동 시 스태미나 소모',
    category: '이동'
  },

  // 연구 관련
  researchStaminaCost: {
    value: 15,
    min: 5,
    max: 30,
    step: 1,
    description: '연구 시 스태미나 소모',
    category: '연구'
  },
  researchFailStaminaCost: {
    value: 8,
    min: 3,
    max: 15,
    step: 1,
    description: '연구 실패 시 스태미나 소모',
    category: '연구'
  },
  researchBaseSuccessRate: {
    value: 0.5,
    min: 0.1,
    max: 0.9,
    step: 0.05,
    description: '연구 기본 성공률',
    category: '연구'
  },
  researchSkillBonus: {
    value: 0.3,
    min: 0.1,
    max: 0.5,
    step: 0.05,
    description: '연구 스킬 보너스',
    category: '연구'
  },
  researchMaterialDiscoveryChance: {
    value: 0.4,
    min: 0.1,
    max: 0.8,
    step: 0.05,
    description: '연구 중 재료 발견 확률',
    category: '연구'
  },
  researchSkillGain: {
    value: 5,
    min: 1,
    max: 10,
    step: 1,
    description: '연구 성공 시 스킬 향상량',
    category: '연구'
  },
  researchNormalSkillGain: {
    value: 2,
    min: 1,
    max: 5,
    step: 1,
    description: '일반 연구 성공 시 스킬 향상량',
    category: '연구'
  },

  // 제작 관련
  craftStaminaCost: {
    value: 20,
    min: 10,
    max: 40,
    step: 2,
    description: '제작 시 스태미나 소모',
    category: '제작'
  },
  craftFailStaminaCost: {
    value: 10,
    min: 5,
    max: 20,
    step: 1,
    description: '제작 실패 시 스태미나 소모',
    category: '제작'
  },
  craftBaseSuccessRate: {
    value: 0.4,
    min: 0.1,
    max: 0.8,
    step: 0.05,
    description: '제작 기본 성공률',
    category: '제작'
  },
  craftSkillBonus: {
    value: 0.4,
    min: 0.1,
    max: 0.6,
    step: 0.05,
    description: '제작 스킬 보너스',
    category: '제작'
  },
  craftMaterialDiscoveryChance: {
    value: 0.3,
    min: 0.1,
    max: 0.6,
    step: 0.05,
    description: '제작 중 재료 발견 확률',
    category: '제작'
  },
  craftSkillGain: {
    value: 3,
    min: 1,
    max: 8,
    step: 1,
    description: '제작 성공 시 스킬 향상량',
    category: '제작'
  },
  craftNormalSkillGain: {
    value: 2,
    min: 1,
    max: 5,
    step: 1,
    description: '일반 제작 성공 시 스킬 향상량',
    category: '제작'
  },

  // 욕구 관련
  curiosityIntelligenceBonus: {
    value: 0.3,
    min: 0.1,
    max: 0.5,
    step: 0.05,
    description: '호기심 지능 보너스',
    category: '욕구'
  },
  curiosityAnalyzeBonus: {
    value: 0.2,
    min: 0.1,
    max: 0.4,
    step: 0.05,
    description: '호기심 분석 스킬 보너스',
    category: '욕구'
  },
  curiosityMaxStim: {
    value: 0.8,
    min: 0.5,
    max: 1.0,
    step: 0.05,
    description: '호기심 최대 자극',
    category: '욕구'
  },
  curiosityResearchChance: {
    value: 0.6,
    min: 0.3,
    max: 0.9,
    step: 0.05,
    description: '호기심 높을 때 연구 선택 확률',
    category: '욕구'
  },
  curiosityThreshold: {
    value: 0.4,
    min: 0.2,
    max: 0.7,
    step: 0.05,
    description: '호기심 행동 임계값',
    category: '욕구'
  },

  // 행동 결정 관련
  randomActionChance: {
    value: 0.1,
    min: 0.05,
    max: 0.3,
    step: 0.02,
    description: '랜덤 행동 선택 확률',
    category: '행동 결정'
  },
  combatHungerFactor: {
    value: 0.2,
    min: 0.1,
    max: 0.4,
    step: 0.02,
    description: '전투 배고픔 인자',
    category: '행동 결정'
  },
  combatBaseChance: {
    value: 0.15,
    min: 0.05,
    max: 0.3,
    step: 0.02,
    description: '전투 기본 확률',
    category: '행동 결정'
  },
  eatHungerThreshold: {
    value: 60,
    min: 40,
    max: 80,
    step: 5,
    description: 'Eat 행동 배고픔 임계값',
    category: '행동 결정'
  },
  eatPriorityChance: {
    value: 0.8,
    min: 0.6,
    max: 0.95,
    step: 0.05,
    description: 'Eat 행동 우선 확률',
    category: '행동 결정'
  },
  gatherPriorityChance: {
    value: 0.7,
    min: 0.5,
    max: 0.9,
    step: 0.05,
    description: 'Gather 행동 우선 확률',
    category: '행동 결정'
  },

  // 번식 관련
  reproductionBaseChance: {
    value: 0.1,
    min: 0.05,
    max: 0.3,
    step: 0.02,
    description: '번식 기본 확률',
    category: '번식'
  },
  reproductionDesireMultiplier: {
    value: 0.3,
    min: 0.1,
    max: 0.5,
    step: 0.05,
    description: '번식 욕구 승수',
    category: '번식'
  },
  reproductionMaxChance: {
    value: 0.4,
    min: 0.2,
    max: 0.6,
    step: 0.05,
    description: '번식 최대 확률',
    category: '번식'
  },
  mateCompatibilityThreshold: {
    value: 0.3,
    min: 0.1,
    max: 0.5,
    step: 0.05,
    description: '번식 호환성 임계값',
    category: '번식'
  },
  mateSuccessChance: {
    value: 0.8,
    min: 0.6,
    max: 0.95,
    step: 0.05,
    description: '번식 성공 확률',
    category: '번식'
  },
  mateStaminaRequirement: {
    value: 15,
    min: 10,
    max: 25,
    step: 1,
    description: '번식 스태미나 요구사항',
    category: '번식'
  },
  mateStaminaCost: {
    value: 6,
    min: 3,
    max: 10,
    step: 1,
    description: '번식 스태미나 소모',
    category: '번식'
  },

  // 수집 활동 관련
  gatherStaminaCost: {
    value: 4,
    min: 2,
    max: 8,
    step: 1,
    description: '수집 성공 시 스태미나 소모',
    category: '수집 활동'
  },
  gatherStaminaCostFail: {
    value: 2,
    min: 1,
    max: 5,
    step: 1,
    description: '수집 실패 시 스태미나 소모',
    category: '수집 활동'
  },
  gatherHungerReduction: {
    value: 15,
    min: 10,
    max: 25,
    step: 2,
    description: '수집 시 배고픔 감소량',
    category: '수집 활동'
  },
  gatherRandomStaminaCost: {
    value: 6,
    min: 3,
    max: 10,
    step: 1,
    description: '랜덤 수집 스태미나 소모',
    category: '수집 활동'
  },
  gatherRandomStaminaCostFail: {
    value: 3,
    min: 1,
    max: 6,
    step: 1,
    description: '랜덤 수집 실패 시 스태미나 소모',
    category: '수집 활동'
  },
  gatherRandomHungerReduction: {
    value: 8,
    min: 5,
    max: 15,
    step: 1,
    description: '랜덤 수집 시 배고픔 감소량',
    category: '수집 활동'
  },

  // 생존 관련
  survivalDesireThreshold: {
    value: 0.3,
    min: 0.2,
    max: 0.5,
    step: 0.05,
    description: '생존 욕구 행동 임계값',
    category: '생존'
  },
  highHungerThreshold: {
    value: 70,
    min: 50,
    max: 90,
    step: 5,
    description: '높은 배고픔 임계값',
    category: '생존'
  },
  highHungerEatChance: {
    value: 0.7,
    min: 0.5,
    max: 0.9,
    step: 0.05,
    description: '높은 배고픔 시 먹기 확률',
    category: '생존'
  },
  lowStaminaThreshold: {
    value: 30,
    min: 20,
    max: 50,
    step: 5,
    description: '낮은 스태미나 임계값',
    category: '생존'
  },

  // 랜덤 행동 관련
  randomActionMultiplier: {
    value: 1.5,
    min: 1.0,
    max: 2.5,
    step: 0.1,
    description: '랜덤 행동 확률 승수',
    category: '랜덤 행동'
  }
};

// 엔티티 파라미터 초기화 함수
export function initializeEntityParameters(parameterManager: any): void {
  Object.entries(ENTITY_PARAMETERS).forEach(([key, param]) => {
    parameterManager.parameters.entity.parameters[key] = param;
  });
} 