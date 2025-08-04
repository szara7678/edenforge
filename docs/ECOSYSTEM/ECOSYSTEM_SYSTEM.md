# 생태계 시스템 (Ecosystem System)

## 📁 파일 위치
- **메인 시스템**: `src/core/ecosystem.ts`
- **파라미터**: `src/parameters/ecosystem.ts`
- **동물 파라미터**: `src/parameters/animal.ts`
- **식물 파라미터**: `src/parameters/plant.ts`
- **타입 정의**: `src/types/index.ts`

## 🌿 식물 시스템

### 1. 식물 생성
**파일**: `src/core/world.ts` - `createPlant()`

```typescript
const plant: Plant = {
  id: uuid(),
  name: this.nameGenerator.generatePlantName(species),
  species, // 'tree' | 'grass' | 'bush' | 'flower' | 'mushroom'
  pos,
  growth: this.rng.range(0.3, 0.8),
  resilience: this.rng.range(0.2, 0.9),
  seedDispersion: this.rng.range(0.1, 0.7),
  age: 0,
  hp: 100,
  maxHp: 100,
  size: this.rng.range(0.1, 1.0),
  yield: this.rng.range(0.2, 0.9),
  isMature: false,
  isDead: false
};
```

### 2. 식물 성장
**파일**: `src/core/ecosystem.ts` - `updatePlants()`

```typescript
for (const plant of this.plants) {
  if (plant.isDead) continue;
  
  // 성장
  plant.growth = Math.min(1, plant.growth + growthRate);
  plant.age += 0.01;
  
  // 성숙 체크
  if (plant.growth >= 0.8 && !plant.isMature) {
    plant.isMature = true;
    this.logger.info('ecosystem', `${plant.name}이(가) 성숙했습니다.`, plant.id, plant.name);
  }
  
  // 사망 체크
  if (plant.age > 1000 || plant.hp <= 0) {
    plant.isDead = true;
    this.logger.warning('ecosystem', `${plant.name}이(가) 죽었습니다.`, plant.id, plant.name);
  }
}
```

### 3. 식물 소비
**파일**: `src/core/ecosystem.ts` - `handlePlantConsumption()`

```typescript
public handlePlantConsumption(consumer: Entity, plant: Plant): boolean {
  if (plant.isDead || plant.hp <= 0) return false;
  
  const gatherSkill = consumer.skills.gather || 0;
  const hungerFactor = consumer.hunger / 100;
  
  // 소비량 계산
  const consumption = 20 + gatherSkill * 15 + hungerFactor * 25;
  
  // 식물 HP 감소
  plant.hp = Math.max(0, plant.hp - consumption);
  
  // 소비자 효과
  consumer.hunger = Math.max(0, consumer.hunger - consumption * 1.2);
  consumer.hp = Math.min(100, consumer.hp + consumption * 0.15);
  
  // 스킬 향상
  consumer.skills.gather = Math.min(100, consumer.skills.gather + 1);
  
  return true;
}
```

## 🦌 동물 시스템

### 1. 동물 생성
**파일**: `src/core/world.ts` - `createAnimal()`

```typescript
const animal: Animal = {
  id: uuid(),
  name: this.nameGenerator.generateAnimalName(species),
  species, // 'wolf' | 'deer' | 'rabbit' | 'bear' | 'fox'
  stats: {
    str: this.rng.range(20, 80),
    agi: this.rng.range(20, 80),
    end: this.rng.range(20, 80),
    int: this.rng.range(20, 80),
    per: this.rng.range(20, 80),
    cha: this.rng.range(20, 80)
  },
  genes: { /* 유전자 */ },
  epi: { /* 후성유전 */ },
  skills: { /* 스킬 */ },
  knowledge: {},
  hp: 100,
  stamina: 100,
  hunger: 0,
  morale: 50,
  pos,
  age: 0,
  inventory: { items: {}, maxCapacity: 50 },
  
  // 동물 특성
  size: this.rng.range(0.1, 1.0),
  speed: this.rng.range(0.3, 0.9),
  senses: this.rng.range(0.2, 0.8),
  threat: this.rng.range(0.1, 0.9),
  fear: this.rng.range(0.1, 0.7),
  pulseRadius: this.rng.range(10, 50)
};
```

### 2. 동물 행동
**파일**: `src/core/ecosystem.ts` - `updateAnimals()`

```typescript
for (const animal of this.animals) {
  if (animal.hp <= 0) continue;
  
  // 기본 상태 업데이트
  animal.stamina = Math.max(0, animal.stamina - 0.3);
  animal.hunger = Math.min(100, animal.hunger + 0.1);
  animal.age += 0.002;
  
  // Pulse 생성
  this.createPulse(animal);
  
  // 사망 체크
  if (animal.age > 500 || animal.hunger >= 100) {
    animal.hp = 0;
    this.logger.warning('ecosystem', `${animal.name}이(가) 죽었습니다.`, animal.id, animal.name);
  }
}
```

## 🦁 포식 시스템

### 1. 포식 처리
**파일**: `src/core/ecosystem.ts` - `handlePredation()`

```typescript
public handlePredation(predator: Entity, prey: Animal): boolean {
  const predatorCombatSkill = predator.skills.combat || 0;
  const baseChance = 0.6; // 기본 60% 성공률
  const skillBonus = predatorCombatSkill / 100;
  const successChance = Math.max(0.3, Math.min(0.9, baseChance + skillBonus));
  
  if (this.rng.bool(successChance)) {
    // 포식 성공
    prey.hp = 0; // 사냥감 사망
    
    // 포식자 효과
    predator.hunger = Math.max(0, predator.hunger - 40);
    predator.hp = Math.min(100, predator.hp + 25);
    
    // 식량 획득
    const foodYield = Math.floor(5 + prey.size * 10);
    predator.inventory.items['food'] = (predator.inventory.items['food'] || 0) + foodYield;
    
    // 스킬 향상
    predator.skills.combat = Math.min(100, predator.skills.combat + 2);
    predator.skills.gather = Math.min(100, predator.skills.gather + 1);
    
    this.logger.success('hunting', `${predator.name}이(가) ${prey.name}을(를) 사냥하여 ${foodYield}개 식량을 획득했습니다!`, predator.id, predator.name);
    return true;
  } else {
    // 포식 실패
    predator.stamina = Math.max(0, predator.stamina - 8);
    this.logger.info('hunting', `${prey.name}이(가) ${predator.name}으로부터 도망쳤습니다.`, prey.id, prey.name);
    return false;
  }
}
```

### 2. 사냥 대상 선택
**파일**: `src/core/entity.ts` - `performCombat()`

```typescript
// 근처의 동물이나 다른 엔티티 찾기 (사냥 대상)
const nearbyTargets = world.entities.filter((e: Entity) => 
  e.id !== entity.id && e.hp > 0 && 
  this.calculateDistance(entity.pos, e.pos) < 30 &&
  e.species !== 'human' // 인간은 인간을 사냥하지 않음
);

if (nearbyTargets.length > 0) {
  const target = this.rng.pick(nearbyTargets) as Entity;
  
  // 생태계 시스템을 통한 사냥
  const success = world.ecosystemSystem.handlePredation(entity, target);
  return success;
}
```

## 🌊 Pulse 시스템

### 1. Pulse 생성
**파일**: `src/core/ecosystem.ts` - `createPulse()`

```typescript
private createPulse(animal: Animal): void {
  const pulseTypes: Array<'fear' | 'attraction' | 'danger' | 'food'> = ['fear', 'attraction', 'danger', 'food'];
  const pulseType = this.rng.pick(pulseTypes);
  
  const pulse: Pulse = {
    id: uuid(),
    type: pulseType,
    source: animal,
    pos: { ...animal.pos },
    intensity: this.rng.range(0.3, 0.9),
    radius: animal.pulseRadius,
    age: 0,
    maxAge: 100
  };
  
  this.pulses.push(pulse);
}
```

### 2. Pulse 업데이트
**파일**: `src/core/ecosystem.ts` - `updatePulses()`

```typescript
for (let i = this.pulses.length - 1; i >= 0; i--) {
  const pulse = this.pulses[i];
  pulse.age++;
  
  // 강도 감소
  pulse.intensity *= 0.98;
  
  // 수명 초과 시 제거
  if (pulse.age > pulse.maxAge || pulse.intensity < 0.1) {
    this.pulses.splice(i, 1);
  }
}
```

## 🌍 생태계 상호작용

### 1. 인간-식물 상호작용
**파일**: `src/core/ecosystem.ts` - `checkInteractionsWithHumans()`

```typescript
public checkInteractionsWithHumans(humanEntities: Entity[]): void {
  for (const human of humanEntities) {
    if (human.hp <= 0) continue;
    
    // 근처 식물 찾기
    const nearbyPlants = this.plants.filter(plant => 
      !plant.isDead && this.calculateDistance(human.pos, plant.pos) < 15
    );
    
    for (const plant of nearbyPlants) {
      // 80% 확률로 식물 소비 시도
      if (this.rng.bool(0.8)) {
        this.handlePlantConsumption(human, plant);
      }
    }
  }
}
```

### 2. 동식물 생성
**파일**: `src/core/world.ts` - `attemptAnimalSpawn()`, `attemptPlantSpawn()`

```typescript
// 동물 생성 (5% 확률)
if (this.rng.bool(0.05)) {
  const pos: Vec2 = {
    x: this.rng.range(0, 1000),
    y: this.rng.range(0, 1000)
  };
  
  const species = this.rng.bool(0.8) ? 'rabbit' : 'deer';
  this.createAnimal(species, pos);
}

// 식물 생성 (3% 확률)
if (this.rng.bool(0.03)) {
  const pos: Vec2 = {
    x: this.rng.range(0, 1000),
    y: this.rng.range(0, 1000)
  };
  
  const rand = this.rng.range(0, 1);
  let species: Plant['species'];
  if (rand < 0.6) species = 'grass';
  else if (rand < 0.9) species = 'flower';
  else species = 'bush';
  
  this.createPlant(species, pos);
}
```

## 📊 생태계 통계

### 1. 동물 통계
```typescript
const animalStats = {
  totalAnimals: this.animals.length,
  aliveAnimals: this.animals.filter(a => a.hp > 0).length,
  speciesCount: {
    rabbit: this.animals.filter(a => a.species === 'rabbit').length,
    deer: this.animals.filter(a => a.species === 'deer').length,
    wolf: this.animals.filter(a => a.species === 'wolf').length,
    bear: this.animals.filter(a => a.species === 'bear').length,
    fox: this.animals.filter(a => a.species === 'fox').length
  }
};
```

### 2. 식물 통계
```typescript
const plantStats = {
  totalPlants: this.plants.length,
  alivePlants: this.plants.filter(p => !p.isDead).length,
  maturePlants: this.plants.filter(p => p.isMature).length,
  speciesCount: {
    grass: this.plants.filter(p => p.species === 'grass').length,
    flower: this.plants.filter(p => p.species === 'flower').length,
    bush: this.plants.filter(p => p.species === 'bush').length,
    tree: this.plants.filter(p => p.species === 'tree').length,
    mushroom: this.plants.filter(p => p.species === 'mushroom').length
  }
};
```

## 🔧 파라미터 설정

### 생태계 파라미터 (`src/parameters/ecosystem.ts`):
- **동물 생성 확률**: `animalSpawnProbability`
- **식물 생성 확률**: `plantSpawnProbability`
- **포식 기본 성공률**: `predationBaseChance`
- **식물 소비 확률**: `plantConsumptionProbability`

### 동물 파라미터 (`src/parameters/animal.ts`):
- **초기 스탯 범위**: `minStat`, `maxStat`
- **생존 관련**: `hungerIncreaseRate`, `staminaDecreaseRate`
- **특성 범위**: `minSize`, `maxSize`, `minSpeed`, `maxSpeed`

### 식물 파라미터 (`src/parameters/plant.ts`):
- **성장 속도**: `growthRate`
- **수명**: `maxAge`
- **수확량**: `yieldRange`

## 🚀 확장 포인트

### 새로운 동물 종 추가:
1. `Animal['species']`에 새 종 추가
2. `createAnimal()`에서 종별 특성 설정
3. 관련 파라미터 추가

### 새로운 식물 종 추가:
1. `Plant['species']`에 새 종 추가
2. `createPlant()`에서 종별 특성 설정
3. 관련 파라미터 추가

### 새로운 상호작용 추가:
1. `checkInteractionsWithHumans()`에 새 상호작용 로직 추가
2. 관련 로그 카테고리 추가
3. 관련 파라미터 추가 