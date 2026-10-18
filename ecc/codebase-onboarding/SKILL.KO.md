---
name: codebase-onboarding
description: 낯선 코드베이스를 분석하여 아키텍처 지도, 주요 진입점, 컨벤션, 그리고 초기 CLAUDE.md를 포함한 구조화된 온보딩 가이드를 생성합니다. 새 프로젝트에 합류할 때, 또는 저장소에서 처음으로 Claude Code를 설정할 때 사용합니다.
metadata:
  origin: ECC
---

# Codebase Onboarding

낯선 코드베이스를 체계적으로 분석하고 구조화된 온보딩 가이드를 만듭니다. 새 프로젝트에 합류하는 개발자나, 기존 저장소에서 처음으로 Claude Code를 설정하는 개발자를 위해 설계되었습니다.

## 사용 시점

- Claude Code로 프로젝트를 처음 열었을 때
- 새 팀이나 새 저장소에 합류했을 때
- 사용자가 "이 코드베이스를 이해하게 도와줘"라고 물을 때
- 사용자가 프로젝트용 CLAUDE.md 생성을 요청할 때
- 사용자가 "온보딩 시켜 줘" 또는 "이 저장소를 안내해 줘"라고 말할 때

## 동작 방식

### 1단계: 정찰

모든 파일을 읽지 않고 프로젝트에 관한 원시 신호를 모읍니다. 다음 점검을 병렬로 실행합니다.

```
1. Package manifest detection
   → package.json, go.mod, Cargo.toml, pyproject.toml, pom.xml, build.gradle,
     Gemfile, composer.json, mix.exs, pubspec.yaml

2. Framework fingerprinting
   → next.config.*, nuxt.config.*, angular.json, vite.config.*,
     django settings, flask app factory, fastapi main, rails config

3. Entry point identification
   → main.*, index.*, app.*, server.*, cmd/, src/main/

4. Directory structure snapshot
   → Top 2 levels of the directory tree, ignoring node_modules, vendor,
     .git, dist, build, __pycache__, .next

5. Config and tooling detection
   → .eslintrc*, .prettierrc*, tsconfig.json, Makefile, Dockerfile,
     docker-compose*, .github/workflows/, .env.example, CI configs

6. Test structure detection
   → tests/, test/, __tests__/, *_test.go, *.spec.ts, *.test.js,
     pytest.ini, jest.config.*, vitest.config.*
```

### 2단계: 아키텍처 매핑

정찰 데이터로부터 다음을 파악합니다.

**기술 스택**
- 언어와 버전 제약
- 프레임워크와 주요 라이브러리
- 데이터베이스와 ORM
- 빌드 도구와 번들러
- CI/CD 플랫폼

**아키텍처 패턴**
- 모놀리스, 모노레포, 마이크로서비스, 또는 서버리스
- 프론트엔드/백엔드 분리 또는 풀스택
- API 방식: REST, GraphQL, gRPC, tRPC

**주요 디렉터리**
최상위 디렉터리를 그 목적에 대응시킵니다.

<!-- Example for a React project — replace with detected directories -->
```
src/components/  → React UI components
src/api/         → API route handlers
src/lib/         → Shared utilities
src/db/          → Database models and migrations
tests/           → Test suites
scripts/         → Build and deployment scripts
```

**데이터 흐름**
요청 하나를 진입점에서 응답까지 따라갑니다.
- 요청은 어디로 들어오는가? (라우터, 핸들러, 컨트롤러)
- 어떻게 검증되는가? (미들웨어, 스키마, 가드)
- 비즈니스 로직은 어디에 있는가? (서비스, 모델, 유스케이스)
- 데이터베이스에는 어떻게 도달하는가? (ORM, 원시 쿼리, 리포지토리)

### 3단계: 컨벤션 감지

코드베이스가 이미 따르고 있는 패턴을 찾습니다.

**명명 규칙**
- 파일 이름: kebab-case, camelCase, PascalCase, snake_case
- 컴포넌트/클래스 이름 패턴
- 테스트 파일 이름: `*.test.ts`, `*.spec.ts`, `*_test.go`

**코드 패턴**
- 오류 처리 방식: try/catch, Result 타입, 오류 코드
- 의존성 주입 또는 직접 import
- 상태 관리 방식
- 비동기 패턴: 콜백, Promise, async/await, 채널

**Git 컨벤션**
- 최근 브랜치에서 본 브랜치 이름 규칙
- 최근 커밋에서 본 커밋 메시지 스타일
- PR 워크플로 (squash, merge, rebase)
- 저장소에 커밋이 아직 없거나 히스토리가 얕으면(예: `git clone --depth 1`), 이 섹션을 건너뛰고 "Git history unavailable or too shallow to detect conventions"라고 적으세요

### 4단계: 온보딩 산출물 생성

두 가지 결과물을 만듭니다.

#### 결과물 1: 온보딩 가이드

```markdown
# Onboarding Guide: [Project Name]

## Overview
[2-3 sentences: what this project does and who it serves]

## Tech Stack
<!-- Example for a Next.js project — replace with detected stack -->
| Layer | Technology | Version |
|-------|-----------|---------|
| Language | TypeScript | 5.x |
| Framework | Next.js | 14.x |
| Database | PostgreSQL | 16 |
| ORM | Prisma | 5.x |
| Testing | Jest + Playwright | - |

## Architecture
[Diagram or description of how components connect]

## Key Entry Points
<!-- Example for a Next.js project — replace with detected paths -->
- **API routes**: `src/app/api/` — Next.js route handlers
- **UI pages**: `src/app/(dashboard)/` — authenticated pages
- **Database**: `prisma/schema.prisma` — data model source of truth
- **Config**: `next.config.ts` — build and runtime config

## Directory Map
[Top-level directory → purpose mapping]

## Request Lifecycle
[Trace one API request from entry to response]

## Conventions
- [File naming pattern]
- [Error handling approach]
- [Testing patterns]
- [Git workflow]

## Common Tasks
<!-- Example for a Node.js project — replace with detected commands -->
- **Run dev server**: `npm run dev`
- **Run tests**: `npm test`
- **Run linter**: `npm run lint`
- **Database migrations**: `npx prisma migrate dev`
- **Build for production**: `npm run build`

## Where to Look
<!-- Example for a Next.js project — replace with detected paths -->
| I want to... | Look at... |
|--------------|-----------|
| Add an API endpoint | `src/app/api/` |
| Add a UI page | `src/app/(dashboard)/` |
| Add a database table | `prisma/schema.prisma` |
| Add a test | `tests/` matching the source path |
| Change build config | `next.config.ts` |
```

#### 결과물 2: 초기 CLAUDE.md

감지된 컨벤션을 바탕으로 프로젝트 전용 CLAUDE.md를 생성하거나 갱신합니다. `CLAUDE.md`가 이미 있다면 먼저 읽고 보강하세요. 기존의 프로젝트 전용 지침은 보존하고, 무엇이 추가되었거나 바뀌었는지 분명히 표시하세요.

```markdown
# Project Instructions

## Tech Stack
[Detected stack summary]

## Code Style
- [Detected naming conventions]
- [Detected patterns to follow]

## Testing
- Run tests: `[detected test command]`
- Test pattern: [detected test file convention]
- Coverage: [if configured, the coverage command]

## Build & Run
- Dev: `[detected dev command]`
- Build: `[detected build command]`
- Lint: `[detected lint command]`

## Project Structure
[Key directory → purpose map]

## Conventions
- [Commit style if detectable]
- [PR workflow if detectable]
- [Error handling patterns]
```

## 모범 사례

1. **모든 것을 읽지 마세요** — 정찰에는 Read를 파일마다 쓰지 말고 Glob과 Grep을 사용하세요. 모호한 신호가 있을 때만 선택적으로 읽으세요.
2. **추측하지 말고 검증하세요** — 설정에서 프레임워크가 감지되었더라도 실제 코드가 다른 것을 쓰고 있다면 코드를 믿으세요.
3. **기존 CLAUDE.md를 존중하세요** — 이미 있다면 교체하지 말고 보강하세요. 무엇이 새로운 것이고 무엇이 기존 것인지 구분해서 밝히세요.
4. **간결하게 유지하세요** — 온보딩 가이드는 2분 안에 훑어볼 수 있어야 합니다. 세부 사항은 가이드가 아니라 코드에 있어야 합니다.
5. **불확실한 부분은 명시하세요** — 어떤 컨벤션을 확신할 수 없다면 추측하지 말고 그렇다고 말하세요. "테스트 러너를 판별할 수 없음"이 틀린 답보다 낫습니다.

## 피해야 할 안티패턴

- 100줄을 넘는 CLAUDE.md 생성 — 핵심에 집중하세요
- 모든 의존성 나열 — 코드 작성 방식을 바꾸는 것만 강조하세요
- 자명한 디렉터리 이름 설명 — `src/`에는 설명이 필요 없습니다
- README 복사 — 온보딩 가이드는 README에 없는 구조적 통찰을 더해야 합니다

## 예시

### 예시 1: 새 저장소에 처음 들어왔을 때
**사용자**: "Onboard me to this codebase"
**동작**: 4단계 전체 워크플로를 실행 → 온보딩 가이드와 초기 CLAUDE.md 생성
**결과**: 온보딩 가이드를 대화에 바로 출력하고, `CLAUDE.md`를 프로젝트 루트에 작성

### 예시 2: 기존 프로젝트에 대해 CLAUDE.md 생성
**사용자**: "Generate a CLAUDE.md for this project"
**동작**: 1~3단계를 실행하고, 온보딩 가이드는 건너뛰어 CLAUDE.md만 생성
**결과**: 감지된 컨벤션을 담은 프로젝트 전용 `CLAUDE.md`

### 예시 3: 기존 CLAUDE.md 보강
**사용자**: "Update the CLAUDE.md with current project conventions"
**동작**: 기존 CLAUDE.md를 읽고, 1~3단계를 실행한 뒤, 새로운 발견 사항을 병합
**결과**: 추가된 내용이 분명히 표시된 갱신된 `CLAUDE.md`
