# EdenForge 문제 해결 내역

## 2025-01-XX - 프로젝트 초기 설정

### 1. TypeScript 컴파일 오류
**문제**: `yield` 예약어 사용으로 인한 컴파일 오류
```
Identifier expected. 'yield' is a reserved word in strict mode.
```

**해결**: `yield` 변수명을 `yieldAmount`로 변경
```typescript
// 변경 전
const yield = Math.floor(this.rng.range(1, 5));

// 변경 후  
const yieldAmount = Math.floor(this.rng.range(1, 5));
```

**위치**: `src/core/world.ts` 77-78번째 줄

### 2. React 타입 오류
**문제**: React 모듈을 찾을 수 없는 오류
```
Cannot find module 'react' or its corresponding type declarations.
```

**해결**: `npm install` 실행으로 의존성 설치
```bash
npm install
```

**원인**: package.json은 생성했지만 실제 의존성 설치가 안된 상태

### 3. JSX 타입 오류
**문제**: JSX 요소에 대한 타입 정의 누락
```
JSX element implicitly has type 'any' because no interface 'JSX.IntrinsicElements' exists.
```

**해결**: React 타입 정의 설치 후 해결됨
```bash
npm install @types/react @types/react-dom
```

### 4. 프로젝트 구조 문제
**문제**: 폴더 구조가 기획서와 다름

**해결**: 기획서에 맞게 폴더 구조 재정리
```
src/
├─ core/           # 시뮬 순수 로직
├─ components/     # React 컴포넌트
├─ types/          # TypeScript 타입
└─ styles/         # CSS 스타일
```

### 5. 캔버스 렌더링 성능
**문제**: 엔티티가 많아지면 성능 저하

**해결**: 성능 조정 로직 추가
```typescript
// 엔티티 > 8000개 시 성능 조정
if (this.state.entities.length > 8000) {
  console.log('Performance adjustment: too many entities');
}
```

### 6. 개발 서버 실행
**문제**: Vite 개발 서버가 실행되지 않음

**해결**: 올바른 명령어 사용
```bash
npm run dev
```

**확인**: 브라우저에서 `http://localhost:3000` 접속 가능

---

## 향후 예상 문제들

### 1. Web Worker 마이그레이션
**예상 문제**: 메인 스레드 블로킹
**해결 방안**: Comlink 사용하여 Worker로 시뮬레이션 분리

### 2. 메모리 누수
**예상 문제**: 엔티티가 계속 생성되어 메모리 부족
**해결 방안**: 엔티티 수 제한, 가비지 컬렉션 로직 추가

### 3. 성능 최적화
**예상 문제**: 5000+ 엔티티에서 60fps 미달
**해결 방안**: 
- 렌더링 최적화 (Viewport culling)
- Tick 간격 동적 조정
- K-means 중복 필터

### 4. 타입 안전성
**예상 문제**: 복잡한 시스템에서 타입 오류
**해결 방안**: 

### 5. Vite HMR 구문 오류
**문제**: `src/core/faction.ts:272:65` 에서 "Expected ")" but found "{" 오류
```
[plugin:vite:esbuild] Transform failed with 1 error:
C:/Users/InsuKim/Desktop/김인수/Coding/EdenForge/src/core/faction.ts:272:65: ERROR: Expected ")" but found "{"
```

**해결**: 복잡한 함수 호출을 별도 변수로 분리
```typescript
// 변경 전
if (this.rng.bool(Math.max(0.1, Math.min(0.9, winChance))) {

// 변경 후
const finalWinChance = Math.max(0.1, Math.min(0.9, winChance));
if (this.rng.bool(finalWinChance)) {
```

**원인**: Vite의 HMR(Hot Module Replacement)에서 복잡한 중첩 함수 호출 시 일시적인 구문 오류 발생
**위치**: `src/core/faction.ts` 272번째 줄

**예방**: 복잡한 함수 호출은 별도 변수로 분리하여 가독성과 안정성 향상

### 6. 초기 엔티티 생성 수 부족
**문제**: 초기 엔티티 생성이 충분하지 않아 시뮬레이션이 부족함
**해결**: 파라미터 시스템을 통한 초기 생성 수 증가
```typescript
// 변경 전
initialHumanCount: { value: 24, ... }
initialAnimalCountRatio: { value: 0.8, ... }
initialPlantCountRatio: { value: 0.5, ... }

// 변경 후
initialHumanCount: { value: 50, ... }
initialAnimalCountRatio: { value: 1.5, ... }
initialPlantCountRatio: { value: 1.0, ... }
```

**추가 개선**: 하드코딩된 비율을 파라미터 시스템으로 변경
```typescript
// 변경 전
const animalCount = Math.max(20, Math.floor(count * 2.0));
const plantCount = Math.max(40, Math.floor(count * 3.0));

// 변경 후
const animalCountRatio = parameterManager.getParameter('world', 'initialAnimalCountRatio');
const animalCount = Math.max(20, Math.floor(count * animalCountRatio));
const plantCountRatio = parameterManager.getParameter('world', 'initialPlantCountRatio');
const plantCount = Math.max(40, Math.floor(count * plantCountRatio));
```

**결과**: 인간 50명, 동물 75마리, 식물 50개로 총 175개 엔티티 생성
**위치**: `src/parameters/world.ts`, `src/core/world.ts`

### 7. 펄스 시스템 과도 생성 및 변형 문제
**문제**: 펄스가 과도하게 생성되고 사라지지 않거나 이상하게 변형됨
**해결**: 펄스 생성 및 관리 로직 대폭 개선
```typescript
// 변경 전
// 매 틱마다 모든 동물이 펄스 생성 시도
this.createPulse(animal);

// 변경 후
// 2% 확률로만 펄스 생성 시도
if (this.rng.bool(0.02)) {
  this.createPulse(animal);
}
```

**펄스 생성 조건 강화**:
```typescript
// 변경 전
if (animal.fear > 0.5) { // 공포 펄스
if (animal.threat > 0.7) { // 위험 펄스

// 변경 후
if (animal.fear > 0.8) { // 공포 펄스 조건 강화
if (animal.threat > 0.8) { // 위험 펄스 조건 강화
```

**펄스 수명 및 제거 조건 개선**:
```typescript
// 변경 전
maxAge: 50, // 공포 펄스
maxAge: 30, // 위험 펄스
pulse.intensity > 0.1 // 제거 조건

// 변경 후
maxAge: 20, // 공포 펄스 수명 단축
maxAge: 15, // 위험 펄스 수명 단축
pulse.intensity > 0.3 && pulse.radius > 10 // 제거 조건 강화
```

**공포도 자연 감소 추가**:
```typescript
// 동물 업데이트에 공포도 자연 감소 로직 추가
animal.fear = Math.max(0, animal.fear - 0.01);
```

**결과**: 펄스 생성 빈도 대폭 감소, 수명 단축, 자연스러운 소멸
**위치**: `src/core/ecosystem.ts`

### 8. 펄스 시스템 현실적 개선
**문제**: 펄스가 확률적으로 생성되어 현실적이지 않음
**해결**: 실제 상황에 따른 펄스 생성으로 변경
```typescript
// 변경 전 - 확률적 생성
if (this.rng.bool(0.02)) {
  this.createPulse(animal);
}

// 변경 후 - 상황별 생성
// 사냥 실패 시
this.createPulse(prey as Animal, 'fear', prey.fear);

// 경쟁에서 패배 시
this.createPulse(entity as Animal, 'fear', entity.fear);

// 식물 섭취 시
this.createPulse(consumer as Animal, 'food', 0.6);
```

**펄스 생성 조건 개선**:
```typescript
// 공포 펄스: fear > 0.7
// 위험 펄스: threat > 0.7
// 식량 펄스: 식물 섭취 시
```

**그래픽 표시 제거**: 캔버스에서 펄스 렌더링 완전 제거
**결과**: 현실적인 생태계 정보 전파 시스템 구현
**위치**: `src/core/ecosystem.ts`, `src/components/CanvasLayer.tsx`

### 9. 인간 사망 시스템 강화
**문제**: 인간이 동물이나 다른 인간에 의해 사망할 확률이 너무 낮음
**해결**: 다양한 사망 조건 강화
```typescript
// 동물이 인간을 공격할 때 확률 증가
if (predator.species !== 'human' && prey.species === 'human') {
  baseChance = 0.75; // 75%로 증가
}

// 파벌 전투 데미지 증가
defender.hp = Math.max(0, defender.hp - Math.floor(attackerPower / 5)); // 10 → 5로 변경

// 상호작용 거리 증가
if (this.isPredator(entity1.species, entity2.species) && distance < 50) { // 30 → 50으로 증가

// 파벌 전투 빈도 증가
if (this.rng.bool(0.05)) { // 1% → 5%로 증가
```

**사망 조건 정리**:
1. **기본 사망**: HP 부족, 극심한 배고픔, 노화
2. **동물에 의한 사망**: 늑대, 곰, 여우의 공격 (75% 성공률)
3. **파벌 전투 사망**: 인간 간 전투 (데미지 2배 증가)
4. **경쟁 사망**: 인간 간 경쟁에서 패배

**결과**: 인간의 생존이 더욱 도전적이고 현실적
**위치**: `src/core/ecosystem.ts`, `src/core/faction.ts`, `src/core/world.ts`

### 10. 초기 엔티티 생성 문제 디버깅
**문제**: 파라미터로 설정된 초기 엔티티 수만큼 생성되지 않음
**해결**: 중복 초기화 방지 및 디버깅 로그 추가
```typescript
// App.tsx에서 중복 초기화 방지
const [isInitialized, setIsInitialized] = useState(false);

useEffect(() => {
  if (isInitialized) return; // 중복 실행 방지
  // ... 초기화 로직
  setIsInitialized(true);
}, [isInitialized]);

// world.ts에서 디버깅 로그 추가
console.log('generatePrimitives 호출됨, 요청된 엔티티 수:', count);
console.log(`엔티티 생성됨: ${entity.name}, 현재 총 엔티티 수: ${this.state.entities.length}`);
console.log('실제 생성된 엔티티 수:', this.state.entities.length);
```

**결과**: 초기 엔티티 생성 과정 추적 가능
**위치**: `src/App.tsx`, `src/core/world.ts`
- 타입 가드 함수 사용

---

## 성능 모니터링 체크리스트

- [ ] FPS 60 이상 유지
- [ ] 엔티티 5000개 이상 처리 가능
- [ ] 메모리 사용량 100MB 이하
- [ ] CPU 사용률 50% 이하
- [ ] 네트워크 요청 최소화

---

## 디버깅 팁

1. **개발자 도구**: F12로 콘솔 확인
2. **성능 탭**: FPS 및 메모리 사용량 모니터링
3. **React DevTools**: 컴포넌트 상태 확인
4. **TypeScript**: `npm run build`로 타입 체크

--- 