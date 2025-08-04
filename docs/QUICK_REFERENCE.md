# EdenForge 빠른 참조 가이드

## 🚀 빠른 시작

### 프로젝트 실행
```bash
npm install
npm run dev
```

### 주요 파일 위치
- **메인 앱**: `src/App.tsx`
- **게임 월드**: `src/core/world.ts`
- **엔티티 AI**: `src/core/entity.ts`
- **생태계**: `src/core/ecosystem.ts`
- **재료 시스템**: `src/core/material.ts`
- **UI 맵**: `src/components/CanvasLayer.tsx`

## 📁 문서 구조

```
docs/
├── PROJECT_STRUCTURE.md     # 프로젝트 전체 구조
├── QUICK_REFERENCE.md       # 현재 파일 (빠른 참조)
├── ENTITIES/
│   └── ENTITY_SYSTEM.md     # 엔티티 시스템 상세
├── ECOSYSTEM/
│   └── ECOSYSTEM_SYSTEM.md  # 생태계 시스템 상세
├── SYSTEMS/
│   └── MATERIAL_SYSTEM.md   # 재료 시스템 상세
└── UI_COMPONENTS/
    └── UI_SYSTEM.md         # UI 시스템 상세
```

## 🎯 주요 기능별 파일 매핑

### 엔티티 관련
| 기능 | 파일 | 함수/메서드 |
|------|------|-------------|
| AI 의사결정 | `src/core/entity.ts` | `decideAction()` |
| 행동 실행 | `src/core/entity.ts` | `perform[Action]()` |
| 생존 체크 | `src/core/entity.ts` | `checkSurvival()` |
| 스킬 향상 | `src/core/entity.ts` | `updateLearning()` |
| 욕구 계산 | `src/core/utils/index.ts` | `calculateStim()` |

### 생태계 관련
| 기능 | 파일 | 함수/메서드 |
|------|------|-------------|
| 동물 사냥 | `src/core/ecosystem.ts` | `handlePredation()` |
| 식물 소비 | `src/core/ecosystem.ts` | `handlePlantConsumption()` |
| 생태계 업데이트 | `src/core/ecosystem.ts` | `updateEcosystemWithHumans()` |
| 동물 생성 | `src/core/world.ts` | `createAnimal()` |
| 식물 생성 | `src/core/world.ts` | `createPlant()` |

### 재료 관련
| 기능 | 파일 | 함수/메서드 |
|------|------|-------------|
| 재료 조합 | `src/core/material.ts` | `combineMaterials()` |
| 연구 기반 발견 | `src/core/material.ts` | `attemptResearchBasedCombination()` |
| 조합 점수 계산 | `src/core/material.ts` | `calculateCombinationScore()` |
| 속성 혼합 | `src/core/material.ts` | `mixProperties()` |

### UI 관련
| 기능 | 파일 | 함수/메서드 |
|------|------|-------------|
| 맵 렌더링 | `src/components/CanvasLayer.tsx` | `render()` |
| 클릭 처리 | `src/components/CanvasLayer.tsx` | `handleClick()` |
| 로그 표시 | `src/components/LogPanel.tsx` | `filteredLogs` |
| 통계 표시 | `src/components/StatsPanel.tsx` | `tabs` |
| 차트 표시 | `src/components/ChartsPanel.tsx` | `renderChart()` |

## ⚙️ 파라미터 설정

### 엔티티 파라미터 (`src/parameters/entity.ts`)
```typescript
// 생존 관련
hungerIncreaseRate: 0.05,        // 배고픔 증가 속도
staminaDecreaseRate: 0.3,        // 스태미나 감소 속도
hpRegenRate: 0.1,               // HP 회복 속도

// 행동 결정 관련
combatBaseChance: 0.15,         // 전투 기본 확률
eatHungerThreshold: 60,         // Eat 행동 배고픔 임계값
curiosityThreshold: 0.4,        // 호기심 행동 임계값

// 연구 관련
researchBaseSuccessRate: 0.5,   // 연구 기본 성공률
researchMaterialDiscoveryChance: 0.4, // 재료 발견 확률
researchSkillGain: 5,           // 재료 발견 시 스킬 향상량

// 제작 관련
craftBaseSuccessRate: 0.4,      // 제작 기본 성공률
craftMaterialDiscoveryChance: 0.3, // 재료 발견 확률
craftSkillGain: 3,              // 재료 발견 시 스킬 향상량
```

### 재료 파라미터 (`src/parameters/material.ts`)
```typescript
// 조합 관련
combinationThreshold: 0.3,       // 조합 임계값
combinationRandomFactor: 0.3,    // 조합 랜덤 요소
combinationCommonPropBonus: 0.2, // 공통 속성 보너스

// 연구 기반 조합 관련
researchBaseChance: 0.6,        // 연구 기반 조합 기본 확률
researchIntelligenceBonus: 0.2, // 연구 지능 보너스
researchSkillDivisor: 150,      // 연구 스킬 나누기 값
researchPropertyVariation: 0.1, // 연구 속성 변이
```

## 🔧 주요 시스템 수정 방법

### 새로운 행동 추가
1. `src/types/index.ts`의 `ActionType`에 새 행동 추가
2. `src/core/entity.ts`에 `perform[Action]()` 메서드 구현
3. `src/core/entity.ts`의 `decideAction()`에서 행동 매핑 추가
4. `src/parameters/entity.ts`에 관련 파라미터 추가

### 새로운 스킬 추가
1. `src/types/index.ts`의 `SkillKey`에 새 스킬 추가
2. `src/core/entity.ts`의 `updateLearning()`에서 스킬 향상 로직 추가
3. `src/parameters/entity.ts`에 관련 파라미터 추가

### 새로운 재료 속성 추가
1. `src/types/index.ts`의 `Material` 타입에 새 속성 추가
2. `src/core/material.ts`의 `initializePrimitiveMaterials()`에서 기본값 설정
3. `src/core/material.ts`의 `mixProperties()`에서 혼합 로직 추가

### 새로운 UI 탭 추가
1. `src/types/index.ts`의 `TabType`에 새 탭 타입 추가
2. 해당 탭 컴포넌트 생성
3. `src/components/UnifiedPanel.tsx`에 탭 버튼과 내용 추가

## 🐛 디버깅 가이드

### 로그 확인
- **로그 패널**: `src/components/LogPanel.tsx`
- **로그 카테고리**: `src/types/index.ts`의 `LogCategory`
- **로그 레벨**: `info`, `warning`, `error`, `success`

### 엔티티 상태 확인
```typescript
// 엔티티 생존 상태
if (entity.hp <= 0) // HP 부족으로 사망
if (entity.hunger >= 100) // 배고픔으로 사망
if (entity.age >= 100) // 노화로 사망
```

### 생태계 상태 확인
```typescript
// 동물 수
const aliveAnimals = worldState.animals.filter(a => a.hp > 0).length;

// 식물 수
const alivePlants = worldState.plants.filter(p => !p.isDead).length;

// 재료 수
const totalMaterials = worldState.materials.length;
```

### 파라미터 변경
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

## 📊 모니터링 도구

### 통계 패널
- **개요**: 전체 게임 상태 요약
- **엔티티**: 엔티티별 상세 정보
- **파벌**: 파벌별 통계
- **생태계**: 동식물 통계
- **재료**: 재료별 정보
- **차트**: 시계열 데이터 시각화

### 차트 종류
- **인구 추이**: 엔티티 수 변화
- **스킬 분포**: 스킬별 분포
- **파벌 통계**: 파벌별 인구
- **사망 이유**: 사망 원인별 통계

### 로그 필터링
- **카테고리**: entity, material, combat, hunting, research, system
- **레벨**: info, warning, error, success
- **검색**: 엔티티 이름, 메시지 내용

## 🚀 성능 최적화

### 렌더링 최적화
- `useCallback`을 사용한 렌더링 함수 메모이제이션
- `useMemo`를 사용한 데이터 필터링 메모이제이션
- 불필요한 리렌더링 방지

### 메모리 최적화
- 로그 수 제한 (최근 100개만 표시)
- 오래된 Pulse 자동 제거
- 사망한 엔티티/동식물 정리

### 게임 루프 최적화
- 100ms 간격으로 게임 상태 업데이트
- UI는 별도 스레드에서 렌더링
- 상태 변경 시에만 리렌더링

## 📝 개발 팁

### 코드 구조
- **핵심 로직**: `src/core/` 폴더
- **UI 컴포넌트**: `src/components/` 폴더
- **파라미터**: `src/parameters/` 폴더
- **타입 정의**: `src/types/index.ts`

### 네이밍 컨벤션
- **함수**: camelCase (`performResearch`)
- **클래스**: PascalCase (`EntitySystem`)
- **상수**: UPPER_SNAKE_CASE (`MAX_AGE`)
- **타입**: PascalCase (`ActionType`)

### 로그 작성
```typescript
// 성공 로그
this.logger.success('research', `${entity.name}이(가) 연구를 완료했습니다.`, entity.id, entity.name);

// 경고 로그
this.logger.warning('entity', `${entity.name}이(가) 배고픔으로 사망했습니다.`, entity.id, entity.name);

// 오류 로그
this.logger.error('system', '게임 상태 업데이트 중 오류 발생', undefined, undefined, { error: e.message });
```

### 파라미터 사용
```typescript
// 파라미터 가져오기
const hungerIncreaseRate = parameterManager.getParameter('entity', 'hungerIncreaseRate');

// 파라미터 설정
parameterManager.setParameter('entity', 'hungerIncreaseRate', 0.1);
```

이 문서를 통해 EdenForge 프로젝트의 구조와 작동 방식을 빠르게 이해하고 개발할 수 있습니다! 