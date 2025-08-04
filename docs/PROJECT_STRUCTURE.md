# EdenForge 프로젝트 구조

## 📁 폴더 구조

```
EdenForge/
├── docs/                    # 📚 문서화 폴더
│   ├── PROJECT_STRUCTURE.md # 현재 파일
│   ├── SYSTEMS/             # 시스템별 상세 문서
│   ├── ENTITIES/            # 엔티티 관련 문서
│   ├── ECOSYSTEM/           # 생태계 관련 문서
│   └── UI_COMPONENTS/       # UI 컴포넌트 문서
├── src/
│   ├── core/               # 🧠 핵심 게임 시스템
│   ├── components/         # 🎨 UI 컴포넌트
│   ├── parameters/         # ⚙️ 게임 파라미터
│   ├── types/             # 📝 TypeScript 타입 정의
│   └── utils/             # 🔧 유틸리티 함수
├── public/                # 🌐 정적 파일
└── README.md              # 📖 프로젝트 개요
```

## 🎮 게임 시스템 개요

### 핵심 시스템
- **World System** (`src/core/world.ts`) - 게임 월드 관리
- **Entity System** (`src/core/entity.ts`) - 엔티티 AI 및 행동
- **Ecosystem System** (`src/core/ecosystem.ts`) - 동식물 생태계
- **Material System** (`src/core/material.ts`) - 재료 조합 및 발견
- **Combat System** (`src/core/combat.ts`) - 전투 및 사냥
- **Faction System** (`src/core/faction.ts`) - 파벌 시스템
- **Genetics System** (`src/core/genetics.ts`) - 유전 시스템
- **Learning System** (`src/core/learning.ts`) - 학습 시스템
- **Emotion System** (`src/core/emotion.ts`) - 감정 시스템

### UI 시스템
- **CanvasLayer** (`src/components/CanvasLayer.tsx`) - 게임 맵 렌더링
- **UnifiedPanel** (`src/components/UnifiedPanel.tsx`) - 통합 패널
- **LogPanel** (`src/components/LogPanel.tsx`) - 로그 표시
- **StatsPanel** (`src/components/StatsPanel.tsx`) - 통계 표시
- **ChartsPanel** (`src/components/ChartsPanel.tsx`) - 차트 표시

### 파라미터 시스템
- **ParameterManager** (`src/parameters/index.ts`) - 중앙 파라미터 관리
- **Entity Parameters** (`src/parameters/entity.ts`) - 엔티티 관련 설정
- **Material Parameters** (`src/parameters/material.ts`) - 재료 관련 설정
- **Ecosystem Parameters** (`src/parameters/ecosystem.ts`) - 생태계 설정

## 🔄 게임 루프

1. **World.tick()** - 메인 게임 루프
2. **EntitySystem.updateEntity()** - 엔티티 업데이트
3. **EcosystemSystem.updateEcosystemWithHumans()** - 생태계 업데이트
4. **UI 렌더링** - 상태 변화를 화면에 표시

## 📊 데이터 플로우

```
World State → Entity System → Action Execution → State Update → UI Render
     ↓              ↓              ↓              ↓            ↓
  Game State → AI Decision → Combat/Gather → Log System → Visual Update
```

## 🎯 주요 기능별 파일 매핑

### 엔티티 관련
- **AI 행동 결정**: `src/core/entity.ts` - `decideAction()`
- **스킬 시스템**: `src/core/entity.ts` - `updateLearning()`
- **생존 체크**: `src/core/entity.ts` - `checkSurvival()`

### 생태계 관련
- **동물 사냥**: `src/core/ecosystem.ts` - `handlePredation()`
- **식물 소비**: `src/core/ecosystem.ts` - `handlePlantConsumption()`
- **생태계 업데이트**: `src/core/ecosystem.ts` - `updateEcosystemWithHumans()`

### 재료 시스템
- **재료 조합**: `src/core/material.ts` - `combineMaterials()`
- **연구 기반 발견**: `src/core/material.ts` - `attemptResearchBasedCombination()`
- **조합 점수 계산**: `src/core/material.ts` - `calculateCombinationScore()`

### 전투 시스템
- **전투 실행**: `src/core/combat.ts` - `executeCombat()`
- **데미지 계산**: `src/core/combat.ts` - `calculateDamage()`
- **사망 처리**: `src/core/combat.ts` - `handleDeath()`

### UI 시스템
- **맵 렌더링**: `src/components/CanvasLayer.tsx` - `useEffect()`
- **클릭 처리**: `src/components/CanvasLayer.tsx` - `handleClick()`
- **로그 필터링**: `src/components/LogPanel.tsx` - `filteredLogs`

## 🔧 설정 및 파라미터

### 엔티티 설정
- **초기 스탯**: `src/parameters/entity.ts` - `minStat`, `maxStat`
- **스킬 범위**: `src/parameters/entity.ts` - `minSkill`, `maxSkill`
- **생존 관련**: `src/parameters/entity.ts` - `hungerIncreaseRate`, `staminaDecreaseRate`

### 재료 설정
- **조합 임계값**: `src/parameters/material.ts` - `combinationThreshold`
- **연구 확률**: `src/parameters/material.ts` - `researchBaseChance`
- **속성 변이**: `src/parameters/material.ts` - `researchPropertyVariation`

## 📈 모니터링 및 디버깅

### 로그 시스템
- **로그 카테고리**: `src/types/index.ts` - `LogCategory`
- **로그 레벨**: `src/types/index.ts` - `LogLevel`
- **로그 필터링**: `src/components/LogPanel.tsx`

### 통계 시스템
- **인구 추이**: `src/components/ChartsPanel.tsx` - `populationData`
- **사망 이유**: `src/components/ChartsPanel.tsx` - `deathData`
- **스킬 분포**: `src/components/ChartsPanel.tsx` - `skillData`

## 🚀 확장 포인트

### 새로운 시스템 추가
1. `src/core/` 폴더에 새 시스템 클래스 생성
2. `src/parameters/` 폴더에 관련 파라미터 추가
3. `src/core/world.ts`에 시스템 통합
4. `src/types/index.ts`에 타입 정의 추가

### 새로운 UI 컴포넌트 추가
1. `src/components/` 폴더에 새 컴포넌트 생성
2. `src/App.tsx`에 컴포넌트 통합
3. 필요한 타입을 `src/types/index.ts`에 추가

### 새로운 파라미터 추가
1. `src/parameters/` 폴더의 해당 파일에 파라미터 정의
2. `src/core/` 폴더의 관련 시스템에서 파라미터 사용
3. `src/components/SettingsPanel.tsx`에 UI 추가 (선택사항) 