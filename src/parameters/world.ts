// ParameterValue 타입 정의 (순환 참조 방지)
export interface ParameterValue {
  value: number;
  min: number;
  max: number;
  step: number;
  description: string;
  category: string;
}

// 월드 기본 파라미터
export const WORLD_PARAMETERS: Record<string, ParameterValue> = {
  // 월드 크기
  worldWidth: {
    value: 1000,
    min: 500,
    max: 2000,
    step: 100,
    description: '월드 너비',
    category: '월드 크기'
  },
  worldHeight: {
    value: 1000,
    min: 500,
    max: 2000,
    step: 100,
    description: '월드 높이',
    category: '월드 크기'
  },

  // 초기 생성
  initialHumanCount: {
    value: 50,
    min: 5,
    max: 100,
    step: 1,
    description: '초기 인간 수',
    category: '초기 생성'
  },
  initialAnimalCountRatio: {
    value: 1.5,
    min: 0.2,
    max: 2.0,
    step: 0.1,
    description: '초기 동물 수 비율 (인간 대비)',
    category: '초기 생성'
  },
  initialPlantCountRatio: {
    value: 1.0,
    min: 0.1,
    max: 2.0,
    step: 0.1,
    description: '초기 식물 수 비율 (인간 대비)',
    category: '초기 생성'
  },
  initialFactionCount: {
    value: 4,
    min: 1,
    max: 10,
    step: 1,
    description: '초기 파벌 수',
    category: '초기 생성'
  },

  // 생성 확률
  animalSpawnProbability: {
    value: 0.01,
    min: 0.001,
    max: 0.1,
    step: 0.001,
    description: '동물 생성 확률',
    category: '생성 확률'
  },
  plantSpawnProbability: {
    value: 0.005,
    min: 0.0001,
    max: 0.05,
    step: 0.0001,
    description: '식물 생성 확률',
    category: '생성 확률'
  },

  // 게임 속도
  defaultGameSpeed: {
    value: 0.2,
    min: 0.1,
    max: 2.0,
    step: 0.1,
    description: '기본 게임 속도',
    category: '게임 속도'
  },
  maxGameSpeed: {
    value: 2.0,
    min: 1.0,
    max: 5.0,
    step: 0.5,
    description: '최대 게임 속도',
    category: '게임 속도'
  },
  minGameSpeed: {
    value: 0.1,
    min: 0.01,
    max: 1.0,
    step: 0.01,
    description: '최소 게임 속도',
    category: '게임 속도'
  },

  // 시뮬레이션
  tickRate: {
    value: 60,
    min: 30,
    max: 120,
    step: 10,
    description: '틱 속도 (FPS)',
    category: '시뮬레이션'
  },
  maxEntities: {
    value: 1000,
    min: 100,
    max: 5000,
    step: 100,
    description: '최대 엔티티 수',
    category: '시뮬레이션'
  },
  maxAnimals: {
    value: 500,
    min: 50,
    max: 2000,
    step: 50,
    description: '최대 동물 수',
    category: '시뮬레이션'
  },
  maxPlants: {
    value: 10000,
    min: 1000,
    max: 50000,
    step: 1000,
    description: '최대 식물 수',
    category: '시뮬레이션'
  },

  // 로깅
  logRetentionCount: {
    value: 1000,
    min: 100,
    max: 10000,
    step: 100,
    description: '로그 보관 수',
    category: '로깅'
  },
  logLevel: {
    value: 1,
    min: 0,
    max: 3,
    step: 1,
    description: '로그 레벨 (0: 없음, 1: 기본, 2: 상세, 3: 모든)',
    category: '로깅'
  }
};

// 월드 파라미터 초기화 함수
export function initializeWorldParameters(parameterManager: any): void {
  Object.entries(WORLD_PARAMETERS).forEach(([key, param]) => {
    parameterManager.parameters.world.parameters[key] = param;
  });
} 