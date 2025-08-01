# 🧠 EdenForge 엔티티 시스템 상세 문서

## 📋 목차

1. [기본 엔티티 구조](#기본-엔티티-구조)
2. [Stim/욕구 시스템](#stim욕구-시스템)
3. [행동 시스템](#행동-시스템)
4. [유전 시스템](#유전-시스템)
5. [학습 시스템](#학습-시스템)
6. [감정 시스템](#감정-시스템)
7. [파벌 시스템](#파벌-시스템)
8. [전투 시스템](#전투-시스템)
9. [생태계 상호작용](#생태계-상호작용)

---

## 🏗️ 기본 엔티티 구조

### 핵심 속성

```typescript
interface Entity {
  id: string;                    // 고유 식별자
  name: string;                  // 이름
  species: 'human';              // 종족 (현재는 human만)
  pos: Vec2;                     // 위치 (x, y)
  age: number;                   // 나이 (틱 단위)
  
  // 생존 관련
  hp: number;                    // 체력 (0-100)
  stamina: number;               // 스태미나 (0-100)
  hunger: number;                // 배고픔 (0-100)
  morale: number;                // 사기 (0-100)
  
  // 능력치
  stats: {
    str: number;                 // 힘 (20-80)
    agi: number;                 // 민첩 (20-80)
    end: number;                 // 체력 (20-80)
    int: number;                 // 지능 (20-80)
    per: number;                 // 지각 (20-80)
    cha: number;                 // 매력 (20-80)
  };
  
  // 스킬
  skills: Record<SkillKey, number>; // 8가지 스킬 (0-100)
  
  // 유전자
  genes: GeneWeights;            // 유전자 가중치 (0-1)
  epi: EpiDelta;                 // 후성유전 변화 (-0.5~+0.5)
  
  // 지식
  knowledge: Knowledge;           // 획득한 지식들
  
  // 파벌
  factionId?: string;            // 소속 파벌 ID
  
  // 인벤토리
  inventory: Inventory;          // 보유 아이템들
}
```

### 생명 주기

1. **생성**: 랜덤한 능력치와 스킬로 생성
2. **생존**: HP, 스태미나, 배고픔 관리
3. **성장**: 경험을 통한 스킬 향상
4. **번식**: 다른 엔티티와 교배
5. **사망**: HP 0, 배고픔 100, 나이 100 이상

---

## 🧠 Stim/욕구 시스템

### Stim 계산

```typescript
type StimKey = 'survival' | 'reproduction' | 'curiosity' | 'social' | 'prestige' | 'fatigue';

// 각 Stim의 계산 방식
const stims = {
  survival: (entity.hp < 50 ? 1 : 0) + (entity.hunger > 50 ? 1 : 0),
  reproduction: (entity.age > 20 && entity.age < 80 ? 1 : 0),
  curiosity: Math.random(), // 랜덤 호기심
  social: (entity.morale < 50 ? 1 : 0),
  prestige: (entity.skills.lead > 50 ? 1 : 0),
  fatigue: (entity.stamina < 30 ? 1 : 0)
};
```

### 욕구 점수 계산

```typescript
// 욕구 = Stim × (유전자 + 후성유전)
const desire = stims[key] * (entity.genes[key] + entity.epi[key]);
```

### 행동 결정

가장 높은 욕구 점수를 가진 행동을 선택합니다.

---

## 🎯 행동 시스템

### 12가지 행동

| 행동 | 설명 | 조건 | 효과 |
|------|------|------|------|
| **Gather** | 자원 채집 | 스태미나 > 20 | 스태미나 -10, 배고픔 +5, gather 스킬 +1 |
| **Eat** | 음식 섭취 | 인벤토리에 음식 | HP +20, 배고픔 -30, cook 스킬 +1 |
| **Rest** | 휴식 | 스태미나 < 50 | 스태미나 +30, HP +5 |
| **Move** | 이동 | 스태미나 > 10 | 스태미나 -5, 랜덤 위치 이동 |
| **Craft** | 제작 | 재료 보유 | 재료 소모, 새 아이템 생성, craft 스킬 +1 |
| **Build** | 건설 | 재료 보유 | 건물 생성, build 스킬 +1 |
| **Research** | 연구 | 스태미나 > 30 | 지식 획득, analyze 스킬 +1 |
| **Social** | 사회 활동 | 다른 엔티티 근처 | 사기 +10, social 스킬 +1 |
| **Trade** | 거래 | 다른 엔티티와 | 아이템 교환, trade 스킬 +1 |
| **Mate** | 교배 | 호환성 > 0.5 | 자식 생성, reproduction 스킬 +1 |
| **Combat** | 전투 | 적대적 엔티티 | 전투 실행, combat 스킬 +1 |
| **Explore** | 탐험 | 스태미나 > 20 | 새로운 재료 발견, per 스킬 +1 |

### 행동 실행 과정

1. **조건 체크**: 행동 가능 여부 확인
2. **자원 소모**: 스태미나, 아이템 등 소모
3. **효과 적용**: HP, 스킬, 아이템 변화
4. **결과 로그**: 성공/실패 로그 생성
5. **말풍선**: 이모지 말풍선 표시

---

## 🧬 유전 시스템

### 유전자 구조

```typescript
interface GeneWeights {
  survival: number;      // 생존 본능 (0-1)
  reproduction: number;  // 번식 본능 (0-1)
  curiosity: number;     // 호기심 (0-1)
  social: number;        // 사회성 (0-1)
  prestige: number;      // 명예욕 (0-1)
  fatigue: number;       // 피로도 민감성 (0-1)
}
```

### 유전 전달

```typescript
// 자식의 유전자 = (부모1 유전자 + 부모2 유전자) / 2 + 돌연변이
const childGenes = {
  [key]: (parent1.genes[key] + parent2.genes[key]) / 2 + random(-0.1, 0.1)
};
```

### 돌연변이

- **확률**: 10% 확률로 돌연변이 발생
- **강도**: -0.1 ~ +0.1 범위의 랜덤 변화
- **제한**: 0-1 범위로 클램핑

### 후성유전

```typescript
interface EpiDelta {
  survival: number;      // 환경에 따른 생존 적응
  reproduction: number;  // 번식 성향 변화
  curiosity: number;     // 학습에 따른 호기심 변화
  social: number;        // 사회 경험에 따른 변화
  prestige: number;      // 성취에 따른 명예욕 변화
  fatigue: number;       // 경험에 따른 피로도 민감성
}
```

---

## 📚 학습 시스템

### 스킬 향상

```typescript
// 행동 성공 시 스킬 향상
const skillGain = success ? 1 : 0.5;
entity.skills[actionSkill] += skillGain;

// 스킬 상한선: 100
entity.skills[actionSkill] = Math.min(100, entity.skills[actionSkill]);
```

### 경험 학습

```typescript
interface LearningExperience {
  id: string;
  type: 'skill' | 'knowledge' | 'behavior';
  target: string;
  value: number;
  timestamp: number;
  description: string;
}
```

### 가르치기 시스템

```typescript
// 가르치기 조건
const canTeach = teacher.skills[subject] > 30;
const canLearn = student.skills[subject] < teacher.skills[subject];

// 학습 효과
const learningRate = 0.1;
student.skills[subject] += teacher.skills[subject] * learningRate;
```

---

## 💭 감정 시스템

### 감정 상태 계산

```typescript
interface EmotionState {
  happiness: number;    // 행복도 (0-1)
  fear: number;         // 공포 (0-1)
  anger: number;        // 분노 (0-1)
  curiosity: number;    // 호기심 (0-1)
  satisfaction: number; // 만족도 (0-1)
  stress: number;       // 스트레스 (0-1)
}
```

### 감정 계산 공식

```typescript
// 행복도 = (HP + 스태미나 + 사기) / 300
const happiness = (entity.hp + entity.stamina + entity.morale) / 300;

// 공포 = 낮은 HP + 높은 배고픔
const fear = (100 - entity.hp) / 100 + entity.hunger / 100;

// 분노 = 낮은 사기 + 전투 경험
const anger = (100 - entity.morale) / 100 + combatExperience / 100;

// 호기심 = 랜덤 요소 + 학습 경험
const curiosity = Math.random() + learningExperience / 100;

// 만족도 = 성취감 + 사회적 상호작용
const satisfaction = achievements / 100 + socialInteractions / 100;

// 스트레스 = 생존 압박 + 피로도
const stress = survivalPressure / 100 + fatigue / 100;
```

### 이모지 말풍선

```typescript
// 행동별 이모지
const actionEmojis = {
  'Gather': { success: '🌾', failure: '😤', message: '채집 성공!' },
  'Eat': { success: '🍖', failure: '😵', message: '맛있어!' },
  'Combat': { success: '⚔️', failure: '😵', message: '전투 승리!' },
  // ... 기타 행동들
};

// 감정별 추가 이모지
const emotionEmojis = {
  happiness: '😊',
  fear: '😨',
  anger: '😠',
  curiosity: '🤔',
  satisfaction: '😌',
  stress: '😰'
};
```

---

## ⚔️ 파벌 시스템

### 파벌 구조

```typescript
interface Faction {
  id: string;
  name: string;
  leader: Entity | null;
  members: Entity[];
  color: string;
  territory: Vec2[];
  resources: Record<string, number>;
  relations: Record<string, number>; // -100 ~ 100
  culture: {
    aggression: number;    // 공격성 (0-100)
    cooperation: number;   // 협력성 (0-100)
    innovation: number;    // 혁신성 (0-100)
    tradition: number;     // 전통성 (0-100)
  };
  stats: {
    population: number;
    military: number;
    economy: number;
    technology: number;
  };
}
```

### 파벌 생성 조건

1. **리더 선정**: 높은 리더십 스킬을 가진 엔티티
2. **멤버 모집**: 가까운 위치의 엔티티들
3. **문화 형성**: 리더의 성향에 따른 문화 발전

### 파벌 간 관계

```typescript
// 관계 변화 요인
const relationFactors = {
  trade: +10,        // 거래 시 관계 개선
  combat: -20,       // 전투 시 관계 악화
  alliance: +30,     // 동맹 시 관계 개선
  betrayal: -50      // 배신 시 관계 악화
};
```

### 전투 시스템

```typescript
// 전투 조건
const canFight = relation < -30 && military > 50;

// 전투 결과
const battleResult = {
  winner: attacker.military > defender.military ? attacker : defender,
  casualties: Math.min(attacker.military, defender.military) * 0.3,
  territoryChange: winner.gainsTerritory,
  relationChange: -20
};
```

---

## 🛡️ 전투 시스템

### 전투 능력 계산

```typescript
// 전투력 = 스탯 + 스킬 + 장비
const combatPower = {
  attack: entity.stats.str + entity.skills.combat + weapon.bonus,
  defense: entity.stats.end + entity.skills.combat + armor.bonus,
  accuracy: entity.stats.per + entity.skills.combat,
  speed: entity.stats.agi + entity.skills.combat
};
```

### 전투 과정

1. **전투 시작**: 적대적 엔티티 발견
2. **능력 비교**: 공격력 vs 방어력
3. **데미지 계산**: (공격력 - 방어력) × 랜덤 팩터
4. **HP 감소**: 계산된 데미지만큼 HP 감소
5. **결과 처리**: 승리/패배에 따른 보상/페널티

### 무기/방어구 시스템

```typescript
interface Weapon {
  id: string;
  name: string;
  damage: number;
  accuracy: number;
  durability: number;
}

interface Armor {
  id: string;
  name: string;
  defense: number;
  weight: number;
  durability: number;
}
```

---

## 🌿 생태계 상호작용

### 동물과의 상호작용

```typescript
// 포식 관계
const predation = {
  predator: 'wolf',    // 포식자
  prey: 'rabbit',      // 피식자
  successRate: 0.7,    // 성공률
  energyGain: 30       // 에너지 획득
};

// 경쟁 관계
const competition = {
  species1: 'deer',
  species2: 'rabbit',
  resource: 'grass',
  intensity: 0.5
};
```

### 식물과의 상호작용

```typescript
// 채집 시스템
const gathering = {
  plant: 'tree',
  yield: plant.yield * gatherer.skills.gather,
  regrowthTime: 100,  // 재생 시간
  sustainability: plant.resilience > 0.5
};
```

### Pulse 시스템

```typescript
interface Pulse {
  type: 'fear' | 'danger' | 'attraction' | 'food';
  source: Animal;
  pos: Vec2;
  intensity: number;  // 0-1
  radius: number;
  age: number;
  maxAge: number;
}

// Pulse 영향
const pulseInfluence = {
  fear: nearbyAnimals.filter(a => a.threat > 0.5).length,
  danger: nearbyPredators.length,
  attraction: nearbyFood.length,
  food: nearbyPlants.filter(p => p.isMature).length
};
```

---

## 🔄 시스템 간 상호작용

### 유전 ↔ 학습

- **유전**: 기본 성향 결정
- **학습**: 환경 적응을 통한 성향 변화
- **상호작용**: 학습 경험이 후성유전에 반영

### 감정 ↔ 행동

- **감정**: 행동 선택에 영향
- **행동**: 감정 상태 변화
- **피드백**: 행동 결과가 감정에 반영

### 파벌 ↔ 개체

- **파벌**: 개체의 행동 제약
- **개체**: 파벌의 문화 형성
- **상승작용**: 파벌 발전이 개체 성장에 도움

### 생태계 ↔ 문명

- **자원**: 생태계에서 문명으로 자원 흐름
- **영향**: 문명 활동이 생태계에 영향
- **균형**: 지속가능한 발전을 위한 균형

---

## 📊 성능 최적화

### 메모리 관리

```typescript
// 엔티티 풀링
const entityPool = {
  maxEntities: 5000,
  cleanupInterval: 1000,  // 1000틱마다 정리
  removeDead: true,
  removeOld: true
};

// 말풍선 제한
const bubbleLimit = {
  maxBubbles: 15,
  maxPerEntity: 3,
  cleanupAge: 20
};
```

### 렌더링 최적화

```typescript
// 화면 밖 엔티티 렌더링 제외
const inViewport = entity.pos.x >= 0 && entity.pos.x <= canvas.width &&
                   entity.pos.y >= 0 && entity.pos.y <= canvas.height;

// 레벨 오브 디테일
const LOD = {
  far: { detail: 'low', updateRate: 5 },   // 멀리 있는 엔티티
  medium: { detail: 'medium', updateRate: 2 }, // 중간 거리
  near: { detail: 'high', updateRate: 1 }   // 가까운 엔티티
};
```

---

## 🎯 향후 개발 계획

### 단기 목표 (1-2개월)

1. **Web Worker 마이그레이션**
   - 메인 스레드 부하 감소
   - 5,000 엔티티 지원
   - 60fps 성능 보장

2. **차트 시스템 구현**
   - 실시간 통계 시각화
   - 히스토리 그래프
   - 예측 분석

### 중기 목표 (3-6개월)

1. **저장/로드 시스템**
   - 5MB 이하 압축 저장
   - 자동 저장 기능
   - 여러 세이브 슬롯

2. **UI/UX 개선**
   - 더 직관적인 인터페이스
   - 키보드 단축키
   - 커스터마이징 옵션

### 장기 목표 (6개월+)

1. **모바일 지원**
   - 터치 인터페이스
   - 반응형 디자인
   - 성능 최적화

2. **멀티플레이어**
   - 실시간 협력/경쟁
   - 서버 아키텍처
   - 동기화 시스템

---

*이 문서는 EdenForge의 엔티티 시스템을 상세히 설명합니다. 지속적으로 업데이트됩니다.* 