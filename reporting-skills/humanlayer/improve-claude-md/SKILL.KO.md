---
name: improve-claude-md
description: <important if> 블록을 사용해 CLAUDE.md 파일을 개선하여 지시 준수율을 높입니다
---

사용자가 CLAUDE.md 파일을 제공하거나 개선을 요청하면, 아래 원칙과 구조에 따라 다시 작성하세요.

## 핵심 문제

Claude Code는 모든 CLAUDE.md와 함께 다음과 같은 시스템 리마인더를 주입합니다.

> "this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task."

즉, Claude는 관련이 없다고 판단한 CLAUDE.md 부분을 무시할 것입니다. 현재 작업에 해당하지 않는 내용이 많아질수록, Claude가 중요한 부분까지 포함해 전체를 무시할 가능성이 커집니다.

## 해결책: `<important if="condition">` 블록

조건부로만 관련 있는 CLAUDE.md 섹션은 `<important if="condition">` XML 태그로 감싸세요. 이는 Claude Code 자체 시스템 프롬프트에서 쓰이는 것과 같은 XML 태그 패턴을 활용하는 방식이며, "관련이 있을 수도 없을 수도 있다"는 프레이밍을 뚫고 모델에게 명시적인 관련성 신호를 줍니다.

## 원칙

### 1. 기본 맥락은 그대로 두고, 도메인 지침만 감싸기

모든 내용을 `<important if>` 블록에 넣을 필요는 없습니다. 거의 모든 작업과 관련된 맥락, 즉 프로젝트 정체성, 프로젝트 맵, 기술 스택은 파일 상단에 일반 마크다운으로 두세요. 이것은 에이전트에게 항상 필요한 온보딩 맥락입니다.

특정 작업에서만 중요한 도메인 지침, 예를 들어 테스트 패턴, API 규칙, 상태 관리, i18n은 구체적인 조건을 가진 `<important if>` 블록으로 감싸세요.

경험칙: 90% 이상의 작업과 관련 있으면 그대로 두세요. 특정 종류의 작업과만 관련 있으면 감싸세요.

### 2. 조건은 구체적이고 명확해야 합니다

나쁜 예 - 거의 모든 것에 매칭되는 지나치게 넓은 조건:
```
<important if="you are writing or modifying any code">
- Use absolute imports
- Use functional components
- Use camelCase filenames
</important>
```

좋은 예 - 각 규칙이 자신만의 좁은 트리거를 가짐:
```
<important if="you are adding or modifying imports">
- Use `@/` absolute imports (see tsconfig.json for path aliases)
- Avoid default exports except in route files
</important>

<important if="you are creating new components">
- Use functional components with explicit prop interfaces
</important>

<important if="you are creating new files or directories">
- Use camelCase for file and directory names
</important>
```

### 3. 짧게 유지하고, 점진적 공개는 드물게 사용하기

에이전트가 도구 호출로 찾아봐야 하는 별도 파일로 쪼개지 마세요. 추가 맥락이 지나치게 길거나 복잡한 경우에만 예외입니다.

`<important if>` 블록의 핵심은 모든 내용이 인라인으로 있지만 조건부로 가중치가 주어진다는 점입니다. 에이전트는 전부 보지만 매칭되는 것에만 주의를 기울입니다.

파일은 가능한 한 간결하게 유지하세요.

### 4. 적을수록 좋습니다

- 최신 모델은 수백 개의 지시도 안정적으로 따를 수 있습니다. Claude Code의 시스템 프롬프트와 도구들이 이미 약 50개를 사용하고 있습니다. CLAUDE.md는 가능한 한 가볍게 유지하세요.
- 린터, 포매터, pre-commit 훅이 강제할 수 있는 지시는 삭제하세요.
- 에이전트가 기존 코드 패턴에서 알아낼 수 있는 지시는 삭제하세요. LLM은 문맥 내 학습자입니다. 코드베이스가 일관되게 어떤 패턴을 쓴다면, 에이전트는 몇 번 검색한 뒤 그 패턴을 따를 것입니다.
- 코드 스니펫은 삭제하세요. 금방 낡고 파일을 부풀립니다. 대신 파일 경로 참조를 사용하세요(예: "패턴은 `src/utils/example.ts`를 참고").

### 5. 모든 명령어 유지하기

원본 파일의 명령어를 삭제하지 마세요. 명령어 표는 기본 참조 자료입니다. 에이전트는 덜 자주 쓰이는 명령어라도 무엇이 가능한지 알아야 합니다.

## 출력 구조

CLAUDE.md를 다시 작성할 때는 다음 구조를 만드세요.

```
# CLAUDE.md

[한 줄 프로젝트 정체성 — 무엇인지, 무엇으로 만들어졌는지]

## Project map
[간단한 설명이 붙은 디렉터리 목록]

<important if="you need to run commands to build, test, lint, or generate code">
[명령어 표 — 원본의 모든 명령어]
</important>

<important if="<specific trigger for rule 1>">
[규칙 1]
</important>

<important if="<specific trigger for rule 2>">
[규칙 2]
</important>

... 더 많은 규칙, 각각 자신의 블록을 가짐 ...

<important if="<specific trigger for domain area 1>">

[지침]

</important>

... 더 많은 도메인 섹션 ...
```

## 적용 방법

기존 CLAUDE.md를 개선할 때는 다음 순서를 따르세요.

1. **프로젝트 정체성 파악** — 이것이 무엇인지 설명하는 한 문장을 추출하세요. 파일 상단에 감싸지 않고 둡니다.
2. **디렉터리 맵 추출** — `<important if>` 래퍼 없이 둡니다. 기본 맥락입니다.
3. **기술 스택 추출** — 있다면 상단 근처에 감싸지 않고 둡니다. 한두 줄로 줄이세요.
4. **명령어 추출** — 원본의 모든 명령어를 유지하세요. 단일 `<important if>` 블록으로 감싸세요.
5. **규칙 분리** — 규칙 목록은 각각 구체적인 조건을 가진 개별 `<important if>` 블록으로 나누세요. 규칙을 묶을 수는 있지만, 서로 관련 없는 규칙을 넓은 조건 하나로 묶어서는 안 됩니다.
6. **도메인 섹션 감싸기** — 테스트, API 패턴, 상태 관리, i18n 등은 각각 그 지식이 언제 중요한지 설명하는 조건을 가진 자신의 블록으로 감싸세요.
7. **린터 영역 삭제** — 스타일 가이드라인, 포매팅 규칙, 도구로 강제 가능한 모든 것을 제거하세요. pre-push 또는 pre-commit 훅으로 대체할 것을 제안하세요.
8. **코드 스니펫 삭제** — 파일 경로 참조로 바꾸세요.
9. **모호한 지시 삭제** — "X 에이전트를 활용하라"거나 "모범 사례를 따르라"처럼 구체적이고 실행 가능하지 않은 내용을 제거하세요.

## 예시

입력:
```markdown
# CLAUDE.md

This is an Express API with a React frontend in a Turborepo monorepo.

## Commands

| Command | Description |
|---|---|
| `turbo build` | Build all packages |
| `turbo test` | Run all tests |
| `turbo lint` | Lint all packages |
| `turbo dev` | Start dev server |
| `turbo storybook` | Start Storybook |
| `turbo db:generate` | Generate Prisma client |
| `turbo db:migrate` | Run database migrations |
| `turbo analyze` | Bundle analyzer |

## Project Structure

- `apps/api/` - Express REST API
- `apps/web/` - React SPA
- `packages/db/` - Prisma schema and client
- `packages/ui/` - Shared component library
- `packages/config/` - Shared configuration

## Coding Standards

- Use named exports
- Use functional components with TypeScript interfaces for props
- Use camelCase for variables, PascalCase for components
- Prefer `const` over `let`
- Always use strict equality (`===`)
- Use template literals instead of string concatenation
- Write JSDoc comments for all public functions
- Use barrel exports in index.ts files

## API Development

- All routes go in `apps/api/src/routes/`
- Use Zod for request validation
- Use Prisma for database access
- Error responses follow RFC 7807 format
- Authentication via JWT middleware

## Testing

- Jest + Supertest for API tests
- Vitest + Testing Library for frontend
- Test fixtures in `__fixtures__/` directories
- Use `createTestClient()` helper for API integration tests
- Mock database with `prismaMock` from `packages/db/test`

## State Management

- Zustand for global client state
- React Query for server state
- URL state via `nuqs`
```

출력:
```markdown
# CLAUDE.md

Express API + React frontend in a Turborepo monorepo.

## Project map

- `apps/api/` - Express REST API
- `apps/web/` - React SPA
- `packages/db/` - Prisma schema and client
- `packages/ui/` - Shared component library
- `packages/config/` - Shared configuration

<important if="you need to run commands to build, test, lint, or generate code">

Run with `turbo` from the repo root.

| Command | What it does |
|---|---|
| `turbo build` | Build all packages |
| `turbo test` | Run all tests |
| `turbo lint` | Lint all packages |
| `turbo dev` | Start dev server |
| `turbo storybook` | Start Storybook |
| `turbo db:generate` | Regenerate Prisma client after schema changes |
| `turbo db:migrate` | Run database migrations |
| `turbo analyze` | Bundle analyzer |
</important>

<important if="you are adding or modifying imports or exports">
- Use named exports (no default exports)
</important>

<important if="you are creating new components">
- Use functional components with TypeScript interfaces for props
</important>

<important if="you are adding or modifying API routes">

- All routes go in `apps/api/src/routes/`
- Use Zod for request validation
- Use Prisma for database access
- Error responses follow RFC 7807 format
- Authentication via JWT middleware
</important>

<important if="you are writing or modifying tests">

- API: Jest + Supertest
- Frontend: Vitest + Testing Library
- Test fixtures in `__fixtures__/` directories
- Use `createTestClient()` helper for API integration tests
- Mock database with `prismaMock` from `packages/db/test`
</important>

<important if="you are working with state management, stores, or URL parameters">

- Zustand for global client state
- React Query for server state
- URL state via `nuqs`
</important>
```

제거된 항목과 이유:
- camelCase/PascalCase, const vs let, strict equality, template literals, JSDoc, barrel exports — 린터와 포매터의 영역이거나, 기존 코드 패턴에서 알아낼 수 있음
- Coding Standards를 하나로 묶은 섹션 — 트리거 조건별 블록으로 나눔

유지된 항목:
- 모든 명령어 유지 (dev, storybook, analyze 포함)
- 프로젝트 맵은 감싸지 않고 유지 (모든 작업과 관련된 기본 맥락)
