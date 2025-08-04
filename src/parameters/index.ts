// 파라미터 초기화 함수들을 직접 import
import { initializeEntityParameters } from './entity';
import { initializeAnimalParameters } from './animal';

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
      try {
        this.parameters = JSON.parse(saved);
        console.log('저장된 파라미터 로드됨');
        console.log('저장된 파라미터 내용:', this.parameters);
        
        // 저장된 파라미터에 필수 값들이 없으면 기본값 로드
        if (!this.parameters.world?.parameters?.initialHumanCount) {
          console.log('저장된 파라미터에 initialHumanCount 없음, 기본값 로드');
          this.loadDefaultParameters();
        }
      } catch (error) {
        console.error('저장된 파라미터 로드 실패:', error);
        // 로드 실패 시 기본값 사용
        this.loadDefaultParameters();
      }
    } else {
      console.log('저장된 파라미터 없음, 기본값 로드');
      // 저장된 파라미터가 없으면 기본값 로드
      this.loadDefaultParameters();
    }
  }

  // 기본값으로 리셋
  resetToDefaults(): void {
    // 각 카테고리별 기본값 설정
    this.loadDefaultParameters();
  }

  // 동기적으로 기본값 로드 (즉시 실행)
  resetToDefaultsSync(): void {
    // 각 파라미터 파일에서 기본값들을 즉시 로드
    this.loadDefaultParameters();
  }

  private loadDefaultParameters(): void {
    // 각 파라미터 파일에서 기본값들을 동기적으로 로드
    try {
      // 동기적으로 파라미터 초기화
      this.initializeAllParameters();
    } catch (error) {
      console.error('기본 파라미터 로드 실패:', error);
      // 실패 시 기본값 직접 설정
      this.setDefaultValues();
    }
  }

  private initializeAllParameters(): void {
    // 각 파라미터 초기화 함수들을 동기적으로 호출
    initializeEntityParameters(this);
    initializeAnimalParameters(this);
    
    // 나머지는 기본값으로 설정
    this.setDefaultValues();
    
    console.log('기본 파라미터 로드 완료');
  }

  private setDefaultValues(): void {
    // 월드 파라미터 기본값 설정
    this.parameters.world.parameters = {
      initialHumanCount: { value: 50, min: 10, max: 200, step: 5, description: '초기 인간 수', category: '초기 설정' },
      initialAnimalCountRatio: { value: 1.5, min: 0.5, max: 3.0, step: 0.1, description: '초기 동물 수 비율', category: '초기 설정' },
      initialPlantCountRatio: { value: 1.0, min: 0.5, max: 2.0, step: 0.1, description: '초기 식물 수 비율', category: '초기 설정' }
    };
    
    // 엔티티 활동성 관련 기본값 설정
    this.parameters.entity.parameters = {
      ...this.parameters.entity.parameters,
      // 번식 관련
      reproductionBaseChance: { value: 0.1, min: 0.05, max: 0.3, step: 0.02, description: '번식 기본 확률', category: '번식' },
      reproductionDesireMultiplier: { value: 0.3, min: 0.1, max: 0.5, step: 0.05, description: '번식 욕구 승수', category: '번식' },
      reproductionMaxChance: { value: 0.4, min: 0.2, max: 0.6, step: 0.05, description: '번식 최대 확률', category: '번식' },
      mateCompatibilityThreshold: { value: 0.3, min: 0.1, max: 0.5, step: 0.05, description: '번식 호환성 임계값', category: '번식' },
      mateSuccessChance: { value: 0.8, min: 0.6, max: 0.95, step: 0.05, description: '번식 성공 확률', category: '번식' },
      mateStaminaRequirement: { value: 15, min: 10, max: 25, step: 1, description: '번식 스태미나 요구사항', category: '번식' },
      mateStaminaCost: { value: 6, min: 3, max: 10, step: 1, description: '번식 스태미나 소모', category: '번식' },
      
      // 수집 활동 관련
      gatherStaminaCost: { value: 4, min: 2, max: 8, step: 1, description: '수집 성공 시 스태미나 소모', category: '수집 활동' },
      gatherStaminaCostFail: { value: 2, min: 1, max: 5, step: 1, description: '수집 실패 시 스태미나 소모', category: '수집 활동' },
      gatherHungerReduction: { value: 15, min: 10, max: 25, step: 2, description: '수집 시 배고픔 감소량', category: '수집 활동' },
      gatherRandomStaminaCost: { value: 6, min: 3, max: 10, step: 1, description: '랜덤 수집 스태미나 소모', category: '수집 활동' },
      gatherRandomStaminaCostFail: { value: 3, min: 1, max: 6, step: 1, description: '랜덤 수집 실패 시 스태미나 소모', category: '수집 활동' },
      gatherRandomHungerReduction: { value: 8, min: 5, max: 15, step: 1, description: '랜덤 수집 시 배고픔 감소량', category: '수집 활동' },
      
      // 생존 관련
      survivalDesireThreshold: { value: 0.3, min: 0.2, max: 0.5, step: 0.05, description: '생존 욕구 행동 임계값', category: '생존' },
      highHungerThreshold: { value: 70, min: 50, max: 90, step: 5, description: '높은 배고픔 임계값', category: '생존' },
      highHungerEatChance: { value: 0.7, min: 0.5, max: 0.9, step: 0.05, description: '높은 배고픔 시 먹기 확률', category: '생존' },
      lowStaminaThreshold: { value: 30, min: 20, max: 50, step: 5, description: '낮은 스태미나 임계값', category: '생존' },
      
      // 랜덤 행동 관련
      randomActionMultiplier: { value: 1.5, min: 1.0, max: 2.5, step: 0.1, description: '랜덤 행동 확률 승수', category: '랜덤 행동' }
    };
    
    console.log('기본값 직접 설정 완료');
  }
}

// 전역 파라미터 매니저 인스턴스
export const parameterManager = new ParameterManager(); 