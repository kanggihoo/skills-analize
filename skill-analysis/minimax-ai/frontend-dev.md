# frontend-dev 분석

## 원본

- 경로: `.agents/skills/frontend-dev/SKILL.md`
- 성격: 고급 프론트엔드 페이지 제작을 위한 통합 스튜디오 스킬
- 주요 영역: 디자인 엔지니어링, 모션, MiniMax 자산 생성, 카피라이팅, 제너러티브 아트

## 적용 조건

랜딩 페이지, 마케팅 사이트, 제품 페이지, 대시보드, 미디어 자산 생성, 전환 카피, 시네마틱 스크롤 애니메이션, 생성형 아트를 만들 때 사용한다.

## 동작 과정

1. 요청을 분석하고 페이지 유형과 맥락을 정한다.
   page type, target, conversion goal, 필요한 이미지/영상/오디오 자산을 파악한다.

2. 디자인 아키텍처를 잡는다.
   `DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`를 조정하고 섹션 구성을 설계한다.

3. 모션 아키텍처를 고른다.
   Framer Motion, GSAP, Lottie, Three.js/R3F, CSS scroll-driven animation 중 섹션별로 맞는 도구를 선택한다.

4. 자산을 생성한다.
   MiniMax scripts로 이미지/비디오/오디오/TTS를 만들며, placeholder URL은 금지된다. prompt를 사용자에게 보여주고 확인받은 뒤 로컬 assets 디렉토리에 저장한다.

5. 카피를 작성한다.
   AIDA, PAS, FAB 프레임워크로 실제 문구를 작성한다. Lorem ipsum은 금지다.

6. UI를 구현한다.
   React/Next.js, Tailwind, 로컬 assets, copy, 모션을 통합한다. interactive component는 client leaf로 격리한다.

7. 품질 게이트를 통과한다.
   mobile collapse, `min-h-[100dvh]`, loading/empty/error, 모션 cleanup, reduced motion, placeholder URL grep, 로컬 asset 존재 여부 등을 확인한다.

## 핵심 규칙

- 외부 placeholder 이미지 URL을 쓰지 않는다.
- 모든 미디어는 로컬 assets 폴더에 저장되어야 한다.
- 새 라이브러리 import 전 `package.json`을 확인한다.
- Tailwind v3/v4 문법을 섞지 않는다.
- GSAP와 Framer Motion을 같은 컴포넌트에서 섞지 않는다.
- heavy library는 lazy-load한다.
- `useState`로 연속 pointer/mouse motion을 추적하지 않는다.
- 모든 asset prompt는 생성 전 사용자 확인이 필요하다.

## 산출물 특성

결과물은 단순 UI가 아니라 실제 이미지/영상/오디오 자산, 전환 카피, 모션 시스템까지 포함한 완성형 프론트엔드 페이지다. `assets/` 구조와 프레임워크별 asset 위치까지 명시한다.

## 주의점

이 스킬은 외부 생성 API와 로컬 scripts 사용을 전제로 한다. 네트워크, API 키, 자산 생성 비용, 사용자 확인 절차가 실제 작업 흐름에 영향을 준다.
