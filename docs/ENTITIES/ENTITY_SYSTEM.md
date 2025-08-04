# 엔티티 시스템 (Entity System)

## 📁 파일 위치
- **메인 시스템**: `src/core/entity.ts`
- **파라미터**: `src/parameters/entity.ts`
- **타입 정의**: `src/types/index.ts`
- **유틸리티**: `src/core/utils/index.ts`

## 🧠 AI 의사결정 시스템

### 1. Stim-Desire 기반 AI
```typescript
// src/core/entity.ts - updateEntity()
const stim = calculateStim(entity);        // 자극 계산
const desires = calculateDesire(entity, stim); // 욕구 계산
const action = this.decideAction(entity, desires, world); // 행동 결정
```

### 2. 자극(Stim) 계산
**파일**: `src/core/utils/index.ts` - `calculateStim()`

```typescript
const stim: Record<StimKey, number> = {
  survival: survivalStim,    // 생존 욕구 (HP, 스태미나, 배고픔 기반)
  reproduction: 0,           // 번식 욕구 (미구현)
  curiosity: curiosityStim,  // 호기심 (지능, 분석 스킬 기반)
  social: 0.2,              // 사회적 욕구
  prestige: 0.1,            // 명예욕
  fatigue: 1 - entity.stamina / 100 // 피로도
};
```

**파라미터 연관**:
- `curiosityIntelligenceBonus`: 지능에 따른 호기심 보너스
- `curiosityAnalyzeBonus`: 분석 스킬에 따른 호기심 보너스
- `curiosityMaxStim`: 호기심 최대 자극

### 3. 욕구(Desire) 계산
**파일**: `src/core/utils/index.ts` - `calculateDesire()`

```typescript
const danger = stim.survival;
const damp = math.lerp(1, 0.3, danger); // 생존 위험이 높으면 다른 욕구 약화
```

### 4. 행동 결정
**파일**: `src/core/entity.ts` - `decideAction()`

#### 우선순위 시스템:
1. **전투 확률** (배고픔 기반)
   ```typescript
   const combatChance = combatBaseChance + hungerFactor * combatHungerFactor;
   ```

2. **생존 우선 행동**
   ```typescript
   if (entity.hunger > eatHungerThreshold) {
     if (this.rng.bool(eatPriorityChance)) return 'Eat';
   }
   ```

3. **호기심 기반 연구**
   ```typescript
   if (desires.curiosity > curiosityThreshold) {
     if (this.rng.bool(curiosityResearchChance)) return 'Research';
   }
   ```

**파라미터 연관**:
- `combatBaseChance`: 전투 기본 확률
- `combatHungerFactor`: 전투 배고픔 인자
- `eatHungerThreshold`: Eat 행동 배고픔 임계값
- `curiosityThreshold`: 호기심 행동 임계값

## 🎯 행동 실행 시스템

### 1. 연구(Research) 액션
**파일**: `src/core/entity.ts` - `performResearch()`

```typescript
const successRate = researchBaseSuccessRate + skillBonus * researchSkillBonus;
if (this.rng.bool(successRate)) {
  // 재료 발견 시도
  const materialDiscoveryChance = Math.min(researchMaterialDiscoveryChance, entity.skills.analyze / 150);
  if (this.rng.bool(materialDiscoveryChance)) {
    const newMaterial = world.materialSystem.attemptResearchBasedCombination(entity);
    // 분석 스킬 향상
    entity.skills.analyze += researchSkillGain;
  }
}
```

**파라미터 연관**:
- `researchStaminaCost`: 연구 스태미나 소모
- `researchBaseSuccessRate`: 연구 기본 성공률
- `researchSkillBonus`: 연구 스킬 보너스
- `researchMaterialDiscoveryChance`: 재료 발견 확률
- `researchSkillGain`: 재료 발견 시 스킬 향상량

### 2. 제작(Craft) 액션
**파일**: `src/core/entity.ts` - `performCraft()`

```typescript
const successRate = craftBaseSuccessRate + skillBonus * craftSkillBonus;
if (this.rng.bool(successRate)) {
  // 재료 발견 시도
  const materialDiscoveryChance = Math.min(craftMaterialDiscoveryChance, entity.skills.craft / 200);
  if (this.rng.bool(materialDiscoveryChance)) {
    const newMaterial = world.materialSystem.attemptResearchBasedCombination(entity);
    // 제작 스킬 향상
    entity.skills.craft += craftSkillGain;
  }
}
```

**파라미터 연관**:
- `craftStaminaCost`: 제작 스태미나 소모
- `craftBaseSuccessRate`: 제작 기본 성공률
- `craftSkillBonus`: 제작 스킬 보너스
- `craftMaterialDiscoveryChance`: 재료 발견 확률
- `craftSkillGain`: 재료 발견 시 스킬 향상량

### 3. 수집(Gather) 액션
**파일**: `src/core/entity.ts` - `performGather()`

```typescript
// 근처 식물 찾기
const nearbyPlants = world.plants.filter(plant => 
  this.calculateDistance(entity.pos, plant.pos) < 15
);

if (nearbyPlants.length > 0) {
  const plant = this.rng.pick(nearbyPlants);
  // 식물 소비 처리
  world.ecosystemSystem.handlePlantConsumption(entity, plant);
}
```

### 4. 전투(Combat) 액션
**파일**: `src/core/entity.ts` - `performCombat()`

```typescript
// 사냥 대상 찾기 (인간 제외)
const nearbyTargets = world.entities.filter(e => 
  e.species !== 'human' && this.calculateDistance(entity.pos, e.pos) < 30
);

if (nearbyTargets.length > 0) {
  const target = this.rng.pick(nearbyTargets);
  // 생태계 시스템을 통한 사냥
  const success = world.ecosystemSystem.handlePredation(entity, target);
}
```

## 💀 생존 시스템

### 1. 기본 상태 업데이트
**파일**: `src/core/entity.ts` - `updateBasicStats()`

```typescript
const staminaDecreaseRate = parameterManager.getParameter('entity', 'staminaDecreaseRate');
const hungerIncreaseRate = parameterManager.getParameter('entity', 'hungerIncreaseRate');
const ageIncreaseRate = parameterManager.getParameter('entity', 'ageIncreaseRate');
const hpRegenRate = parameterManager.getParameter('entity', 'hpRegenRate');

entity.stamina = Math.max(0, entity.stamina - staminaDecreaseRate);
entity.hunger = Math.min(100, entity.hunger + hungerIncreaseRate);
entity.age += ageIncreaseRate;
```

### 2. 생존 체크
**파일**: `src/core/entity.ts` - `checkSurvival()`

```typescript
// 사망 조건 체크
if (entity.hp <= 0) {
  this.logDeath(entity, 'HP 부족', { hp: entity.hp });
  return false;
}

if (entity.hunger >= 100) {
  this.logDeath(entity, '극심한 배고픔', { hunger: entity.hunger });
  return false;
}

if (entity.age >= 100) {
  this.logDeath(entity, '노화', { age: entity.age });
  return false;
}
```

## 📊 스킬 시스템

### 1. 스킬 종류
```typescript
type SkillKey = 'gather' | 'analyze' | 'craft' | 'build' | 'cook' | 'combat' | 'trade' | 'lead';
```

### 2. 스킬 향상
**파일**: `src/core/entity.ts` - `updateLearning()`

```typescript
// 행동에 따른 스킬 향상
switch (action) {
  case 'Gather':
    entity.skills.gather = Math.min(100, entity.skills.gather + 1);
    break;
  case 'Research':
    entity.skills.analyze = Math.min(100, entity.skills.analyze + 2);
    break;
  case 'Craft':
    entity.skills.craft = Math.min(100, entity.skills.craft + 2);
    break;
  // ... 기타 행동들
}
```

## 🧬 유전 시스템

### 1. 유전자 구조
```typescript
genes: {
  survival: number,    // 생존 욕구
  reproduction: number, // 번식 욕구
  curiosity: number,   // 호기심
  social: number,      // 사회성
  prestige: number,    // 명예욕
  fatigue: number      // 피로도
}
```

### 2. 후성유전(Epigenetics)
```typescript
epi: {
  survival: number,    // 생존 후성유전
  reproduction: number, // 번식 후성유전
  curiosity: number,   // 호기심 후성유전
  social: number,      // 사회성 후성유전
  prestige: number,    // 명예욕 후성유전
  fatigue: number      // 피로도 후성유전
}
```

## 📝 로그 시스템

### 1. 로그 카테고리
```typescript
type LogCategory = 'entity' | 'material' | 'combat' | 'research' | 'system' | 'genetics' | 'learning' | 'emotion' | 'faction' | 'ecosystem' | 'hunting';
```

### 2. 사망 로그
```typescript
this.logDeath(entity, 'HP 부족', { 
  cause: 'HP 부족',
  hp: entity.hp, 
  stamina: entity.stamina, 
  hunger: entity.hunger 
});
```

## 🔧 파라미터 설정

### 주요 파라미터들:
- **생존 관련**: `hungerIncreaseRate`, `staminaDecreaseRate`, `hpRegenRate`
- **행동 결정**: `combatBaseChance`, `eatHungerThreshold`, `curiosityThreshold`
- **연구 관련**: `researchBaseSuccessRate`, `researchMaterialDiscoveryChance`
- **제작 관련**: `craftBaseSuccessRate`, `craftMaterialDiscoveryChance`
- **욕구 관련**: `curiosityIntelligenceBonus`, `curiosityMaxStim`

### 파라미터 변경 방법:
```typescript
// src/parameters/entity.ts에서 값 수정
hungerIncreaseRate: {
  value: 0.05,  // 현재 값
  min: 0.01,    // 최소값
  max: 1.0,     // 최대값
  step: 0.01,   // 조정 단위
  description: '배고픔 증가 속도',
  category: '생존'
}
```

## 🚀 확장 포인트

### 새로운 행동 추가:
1. `ActionType`에 새 행동 추가
2. `perform[Action]()` 메서드 구현
3. `decideAction()`에서 행동 매핑 추가
4. 관련 파라미터 추가

### 새로운 스킬 추가:
1. `SkillKey`에 새 스킬 추가
2. `updateLearning()`에서 스킬 향상 로직 추가
3. 관련 파라미터 추가

### 새로운 욕구 추가:
1. `StimKey`에 새 욕구 추가
2. `calculateStim()`에서 계산 로직 추가
3. `decideAction()`에서 행동 매핑 추가 