import { ParameterValue } from './index';

// 유전 시스템 기본 파라미터
export const GENETICS_PARAMETERS: Record<string, ParameterValue> = {
  // 유전자
  geneMutationRate: {
    value: 0.01,
    min: 0.001,
    max: 0.1,
    step: 0.001,
    description: '유전자 돌연변이 확률',
    category: '유전자'
  },
  geneInheritanceRate: {
    value: 0.5,
    min: 0.1,
    max: 0.9,
    step: 0.1,
    description: '유전자 상속 확률',
    category: '유전자'
  },
  geneDominanceRate: {
    value: 0.7,
    min: 0.5,
    max: 0.9,
    step: 0.1,
    description: '우성 유전자 확률',
    category: '유전자'
  },

  // 후성유전
  epigeneticMutationRate: {
    value: 0.005,
    min: 0.001,
    max: 0.05,
    step: 0.001,
    description: '후성유전 돌연변이 확률',
    category: '후성유전'
  },
  epigeneticInheritanceRate: {
    value: 0.3,
    min: 0.1,
    max: 0.8,
    step: 0.1,
    description: '후성유전 상속 확률',
    category: '후성유전'
  },
  epigeneticExpressionRate: {
    value: 0.8,
    min: 0.5,
    max: 1.0,
    step: 0.1,
    description: '후성유전 발현 확률',
    category: '후성유전'
  },

  // 표현형
  phenotypeExpressionRate: {
    value: 0.9,
    min: 0.7,
    max: 1.0,
    step: 0.1,
    description: '표현형 발현 확률',
    category: '표현형'
  },
  phenotypeVariationRate: {
    value: 0.1,
    min: 0.01,
    max: 0.3,
    step: 0.01,
    description: '표현형 변이 확률',
    category: '표현형'
  }
};

// 유전 파라미터 초기화 함수
export function initializeGeneticsParameters(parameterManager: any): void {
  Object.entries(GENETICS_PARAMETERS).forEach(([key, param]) => {
    parameterManager.parameters.genetics.parameters[key] = param;
  });
} 