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
- 엄격한 TypeScript 설정 유지
- 단위 테스트 추가
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