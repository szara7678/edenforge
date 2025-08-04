# 재료 시스템 (Material System)

## 📁 파일 위치
- **메인 시스템**: `src/core/material.ts`
- **파라미터**: `src/parameters/material.ts`
- **타입 정의**: `src/types/index.ts`

## 🧪 재료 조합 시스템

### 1. 기본 재료 초기화
**파일**: `src/core/material.ts` - `initializePrimitiveMaterials()`

```typescript
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
```

### 2. 조합 점수 계산
**파일**: `src/core/material.ts` - `calculateCombinationScore()`

```typescript
private calculateCombinationScore(a: Material, b: Material): number {
  const aProps = Object.keys(a.props);
  const bProps = Object.keys(b.props);
  
  let score = 0;
  
  // 공통 속성이 있으면 점수 증가
  const commonProps = aProps.filter(prop => bProps.includes(prop));
  const combinationCommonPropBonus = parameterManager.getParameter('material', 'combinationCommonPropBonus');
  score += commonProps.length * combinationCommonPropBonus;
  
  // 티어 차이가 적으면 점수 증가
  const tierDiff = Math.abs(a.tier - b.tier);
  const combinationTierDiffPenalty = parameterManager.getParameter('material', 'combinationTierDiffPenalty');
  score += (3 - tierDiff) * combinationTierDiffPenalty;
  
  // 랜덤 요소
  const combinationRandomFactor = parameterManager.getParameter('material', 'combinationRandomFactor');
  score += this.rng.range(0, combinationRandomFactor);
  
  return Math.min(1, score);
}
```

**파라미터 연관**:
- `combinationCommonPropBonus`: 공통 속성 보너스
- `combinationTierDiffPenalty`: 티어 차이 페널티
- `combinationRandomFactor`: 랜덤 요소

### 3. 재료 조합 실행
**파일**: `src/core/material.ts` - `combineMaterials()`

```typescript
combineMaterials(materialA: Material, materialB: Material): Material | null {
  const score = this.calculateCombinationScore(materialA, materialB);
  const combinationThreshold = parameterManager.getParameter('material', 'combinationThreshold');
  
  if (score < combinationThreshold) {
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
```

### 4. 속성 혼합
**파일**: `src/core/material.ts` - `mixProperties()`

```typescript
private mixProperties(propsA: Record<string, number>, propsB: Record<string, number>): Record<string, number> {
  const mixedProps: Record<string, number> = {};
  const allProps = new Set([...Object.keys(propsA), ...Object.keys(propsB)]);
  
  // 속성 변이 - 파라미터 사용
  const researchPropertyVariation = parameterManager.getParameter('material', 'researchPropertyVariation');
  
  for (const prop of allProps) {
    const valueA = propsA[prop] || 0;
    const valueB = propsB[prop] || 0;
    
    // 가중 평균 + 약간의 변이
    const avgValue = (valueA + valueB) / 2;
    const variation = this.rng.range(-researchPropertyVariation, researchPropertyVariation);
    mixedProps[prop] = Math.max(0, Math.min(1, avgValue + variation));
  }
  
  return mixedProps;
}
```

**파라미터 연관**:
- `researchPropertyVariation`: 속성 변이 범위

### 5. 조합 이름 생성
**파일**: `src/core/material.ts` - `generateCombinedName()`

```typescript
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
```

## 🔬 연구 기반 재료 발견

### 1. 엔티티 기반 조합 시도
**파일**: `src/core/material.ts` - `attemptResearchBasedCombination()`

```typescript
attemptResearchBasedCombination(entity: any): Material | null {
  if (this.materials.length < 2) return null;
  
  // 엔티티의 분석 스킬에 따른 조합 가능성 계산
  const analyzeSkill = entity.skills.analyze || 0;
  const researchBaseChance = parameterManager.getParameter('material', 'researchBaseChance');
  const baseChance = Math.min(researchBaseChance, analyzeSkill / 100);
  
  // 지능과 분석 스킬이 높을수록 더 나은 재료 조합 가능
  const intelligenceBonus = (entity.stats.int || 0) / 100;
  const researchIntelligenceBonus = parameterManager.getParameter('material', 'researchIntelligenceBonus');
  const totalChance = baseChance + intelligenceBonus * researchIntelligenceBonus;
  
  if (!this.rng.bool(totalChance)) {
    return null;
  }
  
  // 스킬에 따른 재료 선택 (높은 스킬일수록 더 나은 재료 선택)
  const researchTierSkillDivisor = parameterManager.getParameter('material', 'researchTierSkillDivisor');
  const availableMaterials = this.materials.filter(m => m.tier <= Math.floor(analyzeSkill / researchTierSkillDivisor) + 1);
  
  if (availableMaterials.length < 2) {
    return null;
  }
  
  // 스킬에 따른 가중치 적용
  const researchWeightMultiplier = parameterManager.getParameter('material', 'researchWeightMultiplier');
  const weightedMaterials = availableMaterials.map(material => ({
    material,
    weight: material.tier * (analyzeSkill / 100) * researchWeightMultiplier
  }));
  
  // 가중치 기반 선택
  const totalWeight = weightedMaterials.reduce((sum, item) => sum + item.weight, 0);
  let randomWeight = this.rng.range(0, totalWeight);
  
  let materialA: Material | null = null;
  for (const item of weightedMaterials) {
    randomWeight -= item.weight;
    if (randomWeight <= 0) {
      materialA = item.material;
      break;
    }
  }
  
  if (!materialA) {
    materialA = this.rng.pick(availableMaterials);
  }
  
  // 두 번째 재료 선택 (첫 번째와 다른 것)
  const remainingMaterials = availableMaterials.filter(m => m.id !== materialA.id);
  const materialB = this.rng.pick(remainingMaterials);
  
  return this.combineMaterials(materialA, materialB);
}
```

**파라미터 연관**:
- `researchBaseChance`: 연구 기반 조합 기본 확률
- `researchIntelligenceBonus`: 연구 지능 보너스
- `researchTierSkillDivisor`: 연구 티어 스킬 나누기 값
- `researchWeightMultiplier`: 연구 가중치 배수

## 🎯 엔티티 연동 시스템

### 1. 연구 액션에서 재료 발견
**파일**: `src/core/entity.ts` - `performResearch()`

```typescript
// 재료 발견 시도 (분석 스킬이 높을수록 확률 증가)
const materialDiscoveryChance = Math.min(researchMaterialDiscoveryChance, entity.skills.analyze / 150);

if (this.rng.bool(materialDiscoveryChance)) {
  // 새로운 재료 발견
  const newMaterial = world.materialSystem.attemptResearchBasedCombination(entity);
  if (newMaterial) {
    this.logger.success('research', `${entity.name}이(가) 연구를 통해 새로운 재료 "${newMaterial.name}"을(를) 발견했습니다!`, entity.id, entity.name, { 
      materialName: newMaterial.name,
      tier: newMaterial.tier,
      skillUsed: entity.skills.analyze
    });
    
    // 분석 스킬 향상
    entity.skills.analyze = Math.min(100, entity.skills.analyze + researchSkillGain);
    return true;
  }
}
```

### 2. 제작 액션에서 재료 발견
**파일**: `src/core/entity.ts` - `performCraft()`

```typescript
// 제작 중 재료 발견 시도 (제작 스킬이 높을수록 확률 증가)
const materialDiscoveryChance = Math.min(craftMaterialDiscoveryChance, entity.skills.craft / 200);

if (this.rng.bool(materialDiscoveryChance)) {
  // 새로운 재료 발견
  const newMaterial = world.materialSystem.attemptResearchBasedCombination(entity);
  if (newMaterial) {
    this.logger.success('material', `${entity.name}이(가) 제작 과정에서 새로운 재료 "${newMaterial.name}"을(를) 발견했습니다!`, entity.id, entity.name, { 
      materialName: newMaterial.name,
      tier: newMaterial.tier,
      skillUsed: entity.skills.craft
    });
    
    // 제작 스킬 향상
    entity.skills.craft = Math.min(100, entity.skills.craft + craftSkillGain);
    return true;
  }
}
```

## 📊 재료 통계

### 1. 티어별 재료 수
```typescript
const tierStats = {
  tier1: this.materials.filter(m => m.tier === 1).length,
  tier2: this.materials.filter(m => m.tier === 2).length,
  tier3: this.materials.filter(m => m.tier === 3).length,
  tier4: this.materials.filter(m => m.tier === 4).length,
  tier5: this.materials.filter(m => m.tier === 5).length
};
```

### 2. 조합 가능성 계산
**파일**: `src/core/material.ts` - `getCombinationPossibilities()`

```typescript
getCombinationPossibilities(tier: number): number {
  const materialsInTier = this.materials.filter(m => m.tier === tier);
  return (materialsInTier.length * (materialsInTier.length - 1)) / 2;
}
```

## 🔧 파라미터 설정

### 조합 관련 파라미터:
- **`combinationThreshold`**: 조합 임계값 (0.3)
- **`combinationRandomFactor`**: 조합 랜덤 요소 (0.3)
- **`combinationCommonPropBonus`**: 공통 속성 보너스 (0.2)
- **`combinationTierDiffPenalty`**: 티어 차이 페널티 (0.1)

### 연구 기반 조합 파라미터:
- **`researchBaseChance`**: 연구 기반 조합 기본 확률 (0.6)
- **`researchIntelligenceBonus`**: 연구 지능 보너스 (0.2)
- **`researchSkillDivisor`**: 연구 스킬 나누기 값 (150)
- **`researchMaxDiscoveryChance`**: 연구 최대 발견 확률 (0.4)
- **`researchTierSkillDivisor`**: 연구 티어 스킬 나누기 값 (20)
- **`researchWeightMultiplier`**: 연구 가중치 배수 (1.0)
- **`researchPropertyVariation`**: 연구 속성 변이 (0.1)

### 파라미터 변경 방법:
```typescript
// src/parameters/material.ts에서 값 수정
combinationThreshold: {
  value: 0.3,    // 현재 값
  min: 0.1,      // 최소값
  max: 0.8,      // 최대값
  step: 0.05,    // 조정 단위
  description: '재료 조합 임계값',
  category: '조합'
}
```

## 🚀 확장 포인트

### 새로운 재료 속성 추가:
1. `Material` 타입의 `props`에 새 속성 추가
2. `initializePrimitiveMaterials()`에서 기본값 설정
3. `mixProperties()`에서 혼합 로직 추가

### 새로운 조합 알고리즘 추가:
1. `calculateCombinationScore()`에 새 점수 계산 로직 추가
2. 관련 파라미터 추가
3. 조합 성공률 조정

### 새로운 발견 방식 추가:
1. `attempt[NewMethod]BasedCombination()` 메서드 구현
2. 엔티티 액션에서 호출
3. 관련 파라미터 추가

## 📝 로그 시스템

### 재료 발견 로그:
```typescript
this.logger.success('material', `새로운 재료 발견: ${newName}!`, undefined, undefined, { 
  tier: newTier, 
  parents: [materialA.name, materialB.name] 
});
```

### 조합 실패 로그:
```typescript
this.logger.warning('material', `${materialA.name}과 ${materialB.name}의 조합이 실패했습니다.`, undefined, undefined, { score });
```

### 연구 기반 발견 로그:
```typescript
this.logger.success('research', `${entity.name}이(가) 연구를 통해 새로운 재료 "${newMaterial.name}"을(를) 발견했습니다!`, entity.id, entity.name, { 
  materialName: newMaterial.name,
  tier: newMaterial.tier,
  skillUsed: entity.skills.analyze
});
``` 