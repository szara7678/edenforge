import { Material } from '../types';
import { RNG, uuid } from './utils';
import { Logger } from './utils/logger';

export class MaterialSystem {
  private materials: Material[] = [];
  private rng: RNG;
  private logger: Logger;

  constructor(logger: Logger) {
    this.rng = new RNG();
    this.logger = logger;
    this.initializePrimitiveMaterials();
  }

  private initializePrimitiveMaterials(): void {
    const primitives: Material[] = [
      { id: 'stone', name: '돌', tier: 1, props: { hardness: 0.8, weight: 0.9, durability: 0.7 } },
      { id: 'wood', name: '나무', tier: 1, props: { hardness: 0.3, weight: 0.4, flexibility: 0.8 } },
      { id: 'grass', name: '풀', tier: 1, props: { softness: 0.9, weight: 0.1, flexibility: 0.9 } },
      { id: 'water', name: '물', tier: 1, props: { fluidity: 1.0, weight: 0.2, temperature: 0.5 } },
      { id: 'clay', name: '점토', tier: 1, props: { malleability: 0.9, weight: 0.6, heat_resistance: 0.8 } },
      { id: 'flint', name: '부싯돌', tier: 1, props: { hardness: 0.9, sharpness: 0.8, weight: 0.3 } }
    ];

    this.materials.push(...primitives);
  }

  getMaterials(): Material[] {
    return [...this.materials];
  }

  getMaterial(id: string): Material | undefined {
    return this.materials.find(m => m.id === id);
  }

  // 재료 조합 시스템
  combineMaterials(materialA: Material, materialB: Material): Material | null {
    const score = this.calculateCombinationScore(materialA, materialB);
    
    if (score < 0.3) { // 조합 임계값
      this.logger.warning('material', `${materialA.name}과 ${materialB.name}의 조합이 실패했습니다.`, undefined, undefined, { score });
      return null;
    }

    const newProps = this.mixProperties(materialA.props, materialB.props);
    const newName = this.generateCombinedName(materialA.name, materialB.name);
    const newTier = Math.max(materialA.tier, materialB.tier) + 1;

    const newMaterial: Material = {
      id: uuid(),
      name: newName,
      tier: newTier,
      props: newProps,
      parents: [materialA.id, materialB.id]
    };

    this.materials.push(newMaterial);
    
    this.logger.success('material', `새로운 재료 발견: ${newName}!`, undefined, undefined, { 
      tier: newTier, 
      parents: [materialA.name, materialB.name] 
    });

    return newMaterial;
  }

  private calculateCombinationScore(a: Material, b: Material): number {
    // 속성 호환성 계산
    const aProps = Object.keys(a.props);
    const bProps = Object.keys(b.props);
    
    let score = 0;
    
    // 공통 속성이 있으면 점수 증가
    const commonProps = aProps.filter(prop => bProps.includes(prop));
    score += commonProps.length * 0.2;
    
    // 티어 차이가 적으면 점수 증가
    const tierDiff = Math.abs(a.tier - b.tier);
    score += (3 - tierDiff) * 0.1;
    
    // 랜덤 요소
    score += this.rng.range(0, 0.3);
    
    return Math.min(1, score);
  }

  private mixProperties(propsA: Record<string, number>, propsB: Record<string, number>): Record<string, number> {
    const mixedProps: Record<string, number> = {};
    
    // 모든 속성 키 수집
    const allProps = new Set([...Object.keys(propsA), ...Object.keys(propsB)]);
    
    for (const prop of allProps) {
      const valueA = propsA[prop] || 0;
      const valueB = propsB[prop] || 0;
      
      // 가중 평균 + 약간의 변이
      const avgValue = (valueA + valueB) / 2;
      const variation = this.rng.range(-0.1, 0.1);
      mixedProps[prop] = Math.max(0, Math.min(1, avgValue + variation));
    }
    
    return mixedProps;
  }

  private generateCombinedName(nameA: string, nameB: string): string {
    const suffixes = ['합금', '혼합물', '화합물', '재료', '물질'];
    const suffix = this.rng.pick(suffixes);
    
    // 간단한 조합 이름 생성
    if (nameA.length <= 2 && nameB.length <= 2) {
      return nameA + nameB + suffix;
    } else {
      return nameA.substring(0, 2) + nameB.substring(0, 2) + suffix;
    }
  }

  // 랜덤 재료 조합 시도
  attemptRandomCombination(): Material | null {
    if (this.materials.length < 2) return null;
    
    const materialA = this.rng.pick(this.materials);
    const materialB = this.rng.pick(this.materials.filter(m => m.id !== materialA.id));
    
    return this.combineMaterials(materialA, materialB);
  }

  // 티어별 재료 조합 가능성 계산
  getCombinationPossibilities(tier: number): number {
    const materialsInTier = this.materials.filter(m => m.tier === tier);
    return (materialsInTier.length * (materialsInTier.length - 1)) / 2;
  }
} 