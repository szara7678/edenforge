import { ParameterValue } from './index';

// 학습 시스템 기본 파라미터
export const LEARNING_PARAMETERS: Record<string, ParameterValue> = {
  // 학습
  learningRate: {
    value: 0.1,
    min: 0.01,
    max: 0.5,
    step: 0.01,
    description: '학습 속도',
    category: '학습'
  },
  skillImprovementRate: {
    value: 0.01,
    min: 0.001,
    max: 0.1,
    step: 0.001,
    description: '스킬 향상 속도',
    category: '학습'
  },
  experienceGainRate: {
    value: 0.1,
    min: 0.01,
    max: 1.0,
    step: 0.01,
    description: '경험 획득 속도',
    category: '학습'
  },

  // 기억
  memoryRetentionRate: {
    value: 0.8,
    min: 0.5,
    max: 1.0,
    step: 0.1,
    description: '기억 보존 확률',
    category: '기억'
  },
  memoryDecayRate: {
    value: 0.01,
    min: 0.001,
    max: 0.1,
    step: 0.001,
    description: '기억 감쇠 속도',
    category: '기억'
  },
  maxMemoryCapacity: {
    value: 100,
    min: 10,
    max: 1000,
    step: 10,
    description: '최대 기억 용량',
    category: '기억'
  },

  // 적응
  adaptationRate: {
    value: 0.05,
    min: 0.01,
    max: 0.2,
    step: 0.01,
    description: '적응 속도',
    category: '적응'
  },
  adaptationThreshold: {
    value: 0.5,
    min: 0.1,
    max: 1.0,
    step: 0.1,
    description: '적응 임계값',
    category: '적응'
  }
};

// 학습 파라미터 초기화 함수
export function initializeLearningParameters(parameterManager: any): void {
  Object.entries(LEARNING_PARAMETERS).forEach(([key, param]) => {
    parameterManager.parameters.learning.parameters[key] = param;
  });
} 