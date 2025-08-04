// 파라미터 시스템 메인 인덱스
export * from './entity';
export * from './animal';
export * from './plant';
export * from './material';
export * from './faction';
export * from './ecosystem';
export * from './world';
export * from './genetics';
export * from './learning';

// 파라미터 타입 정의
export interface ParameterCategory {
  name: string;
  description: string;
  parameters: Record<string, ParameterValue>;
}

export interface ParameterValue {
  value: number;
  min: number;
  max: number;
  step: number;
  description: string;
  category: string;
}

export interface ParameterSet {
  entity: ParameterCategory;
  animal: ParameterCategory;
  plant: ParameterCategory;
  material: ParameterCategory;
  faction: ParameterCategory;
  ecosystem: ParameterCategory;
  world: ParameterCategory;
  genetics: ParameterCategory;
  learning: ParameterCategory;
}

// 파라미터 관리자 클래스
export class ParameterManager {
  private parameters: ParameterSet;

  constructor() {
    this.parameters = {
      entity: {
        name: '엔티티',
        description: '인간 엔티티 관련 파라미터',
        parameters: {}
      },
      animal: {
        name: '동물',
        description: '동물 관련 파라미터',
        parameters: {}
      },
      plant: {
        name: '식물',
        description: '식물 관련 파라미터',
        parameters: {}
      },
      material: {
        name: '재료',
        description: '재료 관련 파라미터',
        parameters: {}
      },
      faction: {
        name: '파벌',
        description: '파벌 관련 파라미터',
        parameters: {}
      },
      ecosystem: {
        name: '생태계',
        description: '생태계 관련 파라미터',
        parameters: {}
      },
      world: {
        name: '월드',
        description: '월드 생성 및 관리 파라미터',
        parameters: {}
      },
      genetics: {
        name: '유전',
        description: '유전 시스템 파라미터',
        parameters: {}
      },
      learning: {
        name: '학습',
        description: '학습 시스템 파라미터',
        parameters: {}
      }
    };
  }

  // 파라미터 설정
  setParameter(category: keyof ParameterSet, name: string, value: number): void {
    if (this.parameters[category]?.parameters[name]) {
      this.parameters[category].parameters[name].value = value;
    }
  }

  // 파라미터 가져오기
  getParameter(category: keyof ParameterSet, name: string): number {
    return this.parameters[category]?.parameters[name]?.value || 0;
  }

  // 모든 파라미터 가져오기
  getAllParameters(): ParameterSet {
    return this.parameters;
  }

  // 파라미터 저장
  saveParameters(): void {
    localStorage.setItem('edenforge_parameters', JSON.stringify(this.parameters));
  }

  // 파라미터 불러오기
  loadParameters(): void {
    const saved = localStorage.getItem('edenforge_parameters');
    if (saved) {
      this.parameters = JSON.parse(saved);
    }
  }

  // 기본값으로 리셋
  resetToDefaults(): void {
    // 각 카테고리별 기본값 설정
    this.loadDefaultParameters();
  }

  private loadDefaultParameters(): void {
    // 각 파라미터 파일에서 기본값들을 로드
    import('./entity').then(({ initializeEntityParameters }) => {
      initializeEntityParameters(this);
    });
    import('./animal').then(({ initializeAnimalParameters }) => {
      initializeAnimalParameters(this);
    });
    import('./plant').then(({ initializePlantParameters }) => {
      initializePlantParameters(this);
    });
    import('./material').then(({ initializeMaterialParameters }) => {
      initializeMaterialParameters(this);
    });
    import('./faction').then(({ initializeFactionParameters }) => {
      initializeFactionParameters(this);
    });
    import('./ecosystem').then(({ initializeEcosystemParameters }) => {
      initializeEcosystemParameters(this);
    });
    import('./world').then(({ initializeWorldParameters }) => {
      initializeWorldParameters(this);
    });
    import('./genetics').then(({ initializeGeneticsParameters }) => {
      initializeGeneticsParameters(this);
    });
    import('./learning').then(({ initializeLearningParameters }) => {
      initializeLearningParameters(this);
    });
  }
}

// 전역 파라미터 매니저 인스턴스
export const parameterManager = new ParameterManager(); 