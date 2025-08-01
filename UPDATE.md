# EdenForge 업데이트 내역

## 2025-01-XX - 프로젝트 초기 설정

### 추가된 파일들
- `package.json`: 프로젝트 의존성 및 스크립트 정의
- `vite.config.ts`: Vite 빌드 설정
- `tsconfig.json`, `tsconfig.node.json`: TypeScript 설정
- `public/index.html`, `index.html`: HTML 진입점
- `src/types/index.ts`: 핵심 TypeScript 인터페이스 정의 (로그 시스템, 액션 타입, 파벌 시스템 추가)
- `src/core/utils/index.ts`: 유틸리티 함수들 (RNG, 벡터 연산, 수학 함수)
- `src/core/utils/logger.ts`: 로그 시스템 유틸리티
- `src/core/world.ts`: 월드 시스템 핵심 로직 (엔티티 시스템, 파벌 시스템 통합)
- `src/core/material.ts`: 재료 시스템 (조합, 발견)
- `src/core/entity.ts`: 고도화된 엔티티 시스템 (Stim/욕구 기반 AI)
- `src/core/combat.ts`: 전투 시스템 (무기/방어구, 전투 스킬)
- `src/core/faction.ts`: 파벌 시스템 (파벌 관리, 관계, 전투)
- `src/core/genetics.ts`: 유전 시스템 (유전자 전달, 돌연변이, 특성)
- `src/core/learning.ts`: 학습 시스템 (경험 기반 학습, 가르치기)
- `src/core/ecosystem.ts`: 생태계 시스템 (동물/식물, Pulse, 바이옴)
- `src/main.tsx`: React 앱 진입점
- `src/App.tsx`: 메인 App 컴포넌트 (통합 패널, 파벌 패널, 유전 패널, 생태계 패널 추가)
- `src/components/CanvasLayer.tsx`: 캔버스 렌더링 컴포넌트 (파벌 색상 구분, 동물/식물/Pulse 렌더링)
- `src/components/HUD.tsx`: 게임 HUD 컴포넌트
- `src/components/LogPanel.tsx`: 실시간 로그 표시 패널
- `src/components/UnifiedPanel.tsx`: 통합 패널 (재료/엔티티 탭, 검색/필터링)
- `src/components/FactionPanel.tsx`: 파벌 관리 패널 (파벌 정보, 멤버, 관계, 통계)
- `src/components/GeneticsPanel.tsx`: 유전 관리 패널 (유전 특성, 학습 경험, 스킬)
- `src/components/EcosystemPanel.tsx`: 생태계 관리 패널 (동물/식물 정보, Pulse, 바이옴)
- `src/components/DraggablePanel.tsx`: 드래그 가능한 패널 컴포넌트 (상단바 드래그, 닫기 버튼)
- `src/components/TabManager.tsx`: 하단 탭 관리 컴포넌트 (5개 패널 관리)
- `src/core/emotion.ts`: 감정 시스템 (감정 상태 계산, 이모지 말풍선)
- `src/styles/index.css`: 기본 CSS 스타일
- `src/styles/App.css`: App 컴포넌트 전용 스타일 (드래그 패널, 탭 바, 패널 스타일 추가)
- `README.md`: 프로젝트 문서

### 구현된 기능
1. **기본 프로젝트 구조**: Vite + React + TypeScript 설정
2. **월드 시스템**: 엔티티 생성, 기본 AI 행동 (Gather, Rest, Move)
3. **캔버스 렌더링**: 엔티티를 색상별로 표시, HP 상태 표시
4. **HUD**: 엔티티 수, Tick, 일시정지/재생, 속도 조절
5. **타입 시스템**: Entity, Material, WorldState 등 핵심 타입 정의
6. **유틸리티**: RNG, 벡터 연산, 수학 함수들
7. **로그 시스템**: 실시간 게임 이벤트 로깅 및 표시
8. **재료 시스템**: 기본 재료 + 자동 조합 시스템
9. **재료 도감**: 발견된 재료들을 티어별로 표시
10. **통합 패널**: 재료와 엔티티 정보를 탭으로 구분, 검색/필터링 기능
11. **고도화된 엔티티 시스템**: Stim/욕구 기반 AI 의사결정
12. **다양한 행동**: Gather, Eat, Rest, Move, Craft, Build, Research, Social, Trade, Mate
13. **학습 시스템**: 행동에 따른 스킬 향상 및 성향 변화
14. **사망 시스템**: HP, 배고픔, 나이에 따른 사망 처리
15. **전투 시스템**: 엔티티 간 전투, 무기/방어구 시스템, 전투 스킬
16. **파벌 시스템**: 파벌 생성/관리, 멤버 관리, 파벌 간 관계, 전투
17. **파벌 UI**: 파벌 정보 표시, 멤버 목록, 관계 표시, 통계
18. **파벌 렌더링**: 캔버스에서 파벌별 색상 구분, 리더 표시
19. **유전 시스템**: 유전자 전달, 돌연변이, 유전 특성, 세대 간 전승
20. **학습 시스템**: 경험 기반 학습, 가르치기, 스킬 향상, 지식 획득
21. **유전 UI**: 유전 특성, 학습 경험, 스킬 수준, 후성유전 표시
22. **생태계 시스템**: 동물/식물 시스템, Pulse 시스템, 포식/경쟁 관계
23. **생태계 UI**: 동물/식물 정보, Pulse 상태, 바이옴 정보 표시
24. **생태계 렌더링**: 캔버스에서 동물/식물/Pulse 시각화
25. **드래그 가능한 패널 시스템**: 상단바 드래그, 우상단 닫기 버튼
26. **하단 탭 관리 시스템**: 5개 패널을 하단 탭으로 관리
27. **감정 시스템**: 엔티티 감정 상태 계산, 이모지 말풍선 생성
28. **이모지 말풍선 렌더링**: 행동/감정/생각/대화 말풍선 시각화
29. **상세 모달 시스템**: 엔티티/물질/파벌/동물/식물 상세 정보 표시
30. **패널 드래그 기능 개선**: 실시간 위치 업데이트 및 저장
31. **말풍선 시스템 최적화**: 상호작용 시에만 말풍선 표시
32. **성능 최적화**: 말풍선 생성 제한, 렌더링 최적화, 틱 속도 조정

### 다음 단계
- Web Worker 마이그레이션
- 성능 최적화
- UI/UX 개선
- 밸런싱 패스

### 기술적 세부사항
- **성능**: 현재 24개 엔티티로 기본 테스트
- **렌더링**: Canvas 2D 사용, 60fps 목표
- **아키텍처**: 순수 로직(core/)과 UI(components/) 분리
- **타입 안전성**: TypeScript로 모든 핵심 타입 정의

### 해결된 문제들
- `yield` 예약어 충돌 해결 (yieldAmount로 변경)
- 기본 폴더 구조 생성
- 의존성 설치 완료
- 개발 서버 실행 가능

--- 