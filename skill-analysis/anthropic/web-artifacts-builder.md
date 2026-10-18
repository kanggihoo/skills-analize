# web-artifacts-builder 분석

## 원본

- 원본 경로: `.agents/skills/web-artifacts-builder/`
- 핵심 파일: `SKILL.md`
- 보조 파일: `scripts/init-artifact.sh`, `scripts/bundle-artifact.sh`, `scripts/shadcn-components.tar.gz`, `LICENSE.txt`
- 확인한 규모: 5개 파일, 약 653줄
- 성격: React, TypeScript, Vite, Tailwind, shadcn/ui로 복잡한 claude.ai HTML artifact를 만들고 단일 HTML로 번들링하는 스킬

## 적용 조건

복잡한 web artifact가 필요할 때 사용한다. 예를 들어 state management, routing, shadcn/ui components, 다중 component 구조가 필요한 interactive artifact가 대상이다.

단순 single-file HTML/JSX artifact에는 사용하지 않는 것이 원칙이다.

## 동작 과정

1. `scripts/init-artifact.sh <project-name>`으로 React project를 초기화한다.

2. 생성된 project로 이동해 artifact를 개발한다.
   stack은 React 18, TypeScript, Vite, Tailwind CSS 3.4.1, shadcn/ui, Radix UI, Parcel이다.

3. 개발 중에는 excessive centered layout, purple gradient, uniform rounded corners, Inter font 같은 흔한 AI-slop 시각 요소를 피한다.

4. `scripts/bundle-artifact.sh`를 실행한다.
   Parcel build 후 html-inline으로 JS/CSS/dependencies를 단일 `bundle.html`에 inlining한다.

5. bundle HTML을 사용자에게 artifact로 보여준다.

6. 테스트는 optional이다.
   요청되었거나 문제가 생긴 경우에 Playwright/Puppeteer 등으로 확인한다.

## 보조 스크립트 역할

- `init-artifact.sh`: project name 확인, Node version 감지, Vite version pinning, pnpm 확인, Vite project 생성, Tailwind/shadcn 설정, path alias, component tarball 추출, `components.json` 생성
- `bundle-artifact.sh`: project directory 확인, `index.html` 확인, Parcel/html-inline 의존성 설치, `.parcelrc` 작성, build, asset inline, `bundle.html` 생성
- `shadcn-components.tar.gz`: 사전 패키징된 shadcn/ui component 묶음

## 핵심 규칙

- 복잡한 artifact에만 사용한다.
- 초기화 스크립트로 project scaffold를 만든다.
- 최종 공유물은 self-contained `bundle.html`이다.
- `index.html`이 project root에 있어야 bundle 가능하다.
- testing은 기본 필수가 아니라 optional이다.
- 디자인은 generic AI artifact처럼 보이지 않게 의도적으로 잡는다.

## 산출물 특성

- React/TypeScript artifact project
- Tailwind/shadcn 기반 component code
- 단일 HTML artifact `bundle.html`

## 주의점

- 단순 artifact에 이 스킬을 쓰면 overhead가 크다.
- bundling script는 dependency install과 build를 수행하므로 네트워크/시간이 필요할 수 있다.
- `bundle.html`이 최종 전달 단위이므로 외부 asset 참조가 남지 않게 해야 한다.
