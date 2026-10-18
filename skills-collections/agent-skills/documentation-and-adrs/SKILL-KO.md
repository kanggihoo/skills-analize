---
name: documentation-and-adrs
description: 결정 사항과 문서를 기록합니다. 아키텍처 결정을 내리거나, 공개 API를 변경하거나, 기능을 출시할 때, 또는 미래의 엔지니어와 에이전트가 코드베이스를 이해하는 데 필요한 맥락을 기록해야 할 때 사용합니다.
---

# 문서화 및 ADR (Documentation and ADRs)

## 개요 (Overview)

단순히 코드뿐만 아니라 **결정(decisions)**을 문서화하세요. 가장 가치 있는 문서는 **'이유(Why)'** — 즉, 그 결정으로 이끈 맥락, 제약 조건, 트레이드오프를 담고 있습니다. 코드는 *무엇(What)*이 만들어졌는지를 보여주지만, 문서는 *왜 그런 방식으로 만들어졌는지*, *어떤 대안들이 고려되었는지*를 설명합니다. 이 맥락은 미래에 이 코드베이스에서 작업할 사람과 에이전트 모두에게 필수적입니다.

## 사용 시점 (When to Use)

- 중요한 아키텍처 결정을 내릴 때
- 여러 경쟁 접근 방식 중 하나를 선택할 때
- 공개(Public) API를 추가하거나 변경할 때
- 사용자에게 노출되는 동작을 변경하는 기능을 출시할 때
- 프로젝트에 새 팀원(또는 에이전트)을 온보딩할 때
- 동일한 내용을 반복해서 설명하고 있는 자신을 발견했을 때

**사용하지 않는 경우:** 뻔한 코드에는 문서를 달지 마세요. 코드가 이미 말하고 있는 내용을 그대로 읊는 주석을 달지 마세요. 곧 버려질 일회성 프로토타입에는 문서를 작성하지 마세요.

## 아키텍처 결정 기록 (Architecture Decision Records - ADRs)

ADR은 중요한 기술적 결정 뒤에 숨은 근거를 포착합니다. 작성할 수 있는 가장 가치 높은 문서 형태입니다.

### ADR을 작성해야 하는 시점

- 프레임워크, 라이브러리, 주요 의존성을 선택할 때
- 데이터 모델이나 데이터베이스 스키마를 설계할 때
- 인증 전략을 선택할 때
- API 아키텍처(REST vs GraphQL vs tRPC)를 결정할 때
- 빌드 도구, 호스팅 플랫폼, 인프라를 선택할 때
- 되돌리기(reverse)에 비용이 많이 드는 모든 결정

### 기존 컨벤션 먼저 확인

ADR을 생성하기 전에 리포지토리의 기존 컨벤션(기존 ADR, 프로젝트 지침, `.adr-dir` 같은 ADR 설정 파일 등)을 먼저 확인하세요. 확립된 기존 컨벤션이 있다면 아래 기본값보다 우선합니다:

- **위치 및 포맷:** 예: `docs/adr/*.md`, `Documentation/Decisions/*.rst`, MADR 레이아웃, `adr-tools` 구조 등. 기존 디렉터리, 확장자, 마크업 언어(Markdown vs reStructuredText)를 일치시키세요.
- **번호 매기기 및 명명 규칙:** 기존 순번 및 파일명 패턴(`ADR-004-Title.rst`, `0004-title.md` 등)을 이어가세요. 001부터 다시 시작하거나 다른 규칙을 도입하지 마세요.
- **섹션 제목:** 임의의 템플릿을 강요하지 말고 프로젝트의 기존 제목 구성을 재사용하세요.

기존 관례가 충돌한다면 임의로 새 방식을 도입하지 말고 사용자에게 질문하세요. 프로젝트에 아무런 관례가 없을 때만 아래 기본 템플릿을 사용하세요.

### ADR 기본 템플릿

별도 위치가 없다면 `docs/decisions/` 디렉터리에 순차적 번호를 붙여 저장합니다:

```markdown
# ADR-001: 주 데이터베이스로 PostgreSQL 사용

## 상태 (Status)
승인됨(Accepted) | ADR-XXX로 대체됨(Superseded) | 폐기됨(Deprecated)

## 일자 (Date)
2025-01-15

## 맥락 (Context)
작업 관리 애플리케이션을 위한 주 데이터베이스가 필요합니다. 주요 요구사항:
- 관계형 데이터 모델 (사용자, 작업, 팀 간의 관계)
- 작업 상태 변경에 대한 ACID 트랜잭션 보장
- 작업 내용에 대한 전체 텍스트 검색(Full-text search) 지원
- 매니지드 호스팅 지원 (소규모 팀, 제한된 운영 역량)

## 결정 (Decision)
Prisma ORM과 함께 PostgreSQL을 사용합니다.

## 고려한 대안들 (Alternatives Considered)

### MongoDB
- 장점: 유연한 스키마, 빠른 시작
- 단점: 우리 데이터는 본질적으로 관계형임; 관계를 애플리케이션 레벨에서 수동 관리해야 함
- 채택하지 않은 이유: 문서 저장소의 관계형 데이터는 복잡한 조인이나 데이터 중복을 유발함

### SQLite
- 장점: 설정 불필요, 내장형, 빠른 읽기
- 단점: 제한된 동시 쓰기 지원, 프로덕션용 매니지드 호스팅 부재
- 채택하지 않은 이유: 프로덕션 다중 사용자 웹 애플리케이션에 부적합

### MySQL
- 장점: 성숙도 높음, 광범위한 지원
- 단점: PostgreSQL이 더 우수한 JSON 지원, 전문 검색, 생태계 도구를 보유함
- 채택하지 않은 이유: 우리 기능 요구사항에는 PostgreSQL이 더 적합함

## 결과 및 영향 (Consequences)
- Prisma를 통해 타입 안정성이 보장된 DB 접근 및 마이그레이션 관리 가능
- Elasticsearch 추가 없이 PostgreSQL의 내장 전문 검색 활용 가능
- 팀 내 PostgreSQL 지식 필요 (표준적인 기술 스택으로 위험도 낮음)
- 매니지드 서비스(Supabase, Neon, RDS 등)에서 호스팅
```

### ADR 라이프사이클

```
제안됨(PROPOSED) → 승인됨(ACCEPTED) → (대체됨(SUPERSEDED) 또는 폐기됨(DEPRECATED))
```

- **오래된 ADR을 절대 삭제하지 마세요.** 과거의 맥락을 보존해야 합니다.
- 결정이 변경되면, 이전 ADR을 참조하고 대체(supersede)하는 새로운 ADR을 작성하세요.

## 인라인 코드 문서화 (주석) (Inline Documentation)

### 주석을 작성해야 할 때

*무엇(what)*이 아니라 **이유(why)**를 주석으로 남기세요:

```typescript
// 나쁨: 코드를 그대로 읊음
// 카운터를 1 증가시킴
counter += 1;

// 좋음: 직관적이지 않은 의도를 설명함
// 슬라이딩 윈도우 레이트 리밋 적용 — 윈도우 경계 시점에 폭발적인 요청(burst attack)이
// 몰리는 것을 방지하기 위해 고정 일정이 아닌 윈도우 경계에서 카운터를 리셋함
if (now - windowStart > WINDOW_SIZE_MS) {
  counter = 0;
  windowStart = now;
}
```

### 주석을 작성하지 말아야 할 때

```typescript
// 자체 설명적인 뻔한 코드에는 주석을 달지 마세요
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// 지금 바로 할 수 있는 일에 TODO 주석을 남기지 마세요
// TODO: 에러 처리 추가  ← 그냥 지금 추가하세요

// 주석 처리된 코드를 남겨두지 마세요
// const oldImplementation = () => { ... }  ← 삭제하세요, git 기록에 남아있습니다
```

### 알려진 함정(Gotchas) 문서화

```typescript
/**
 * 중요: 이 함수는 첫 번째 렌더링 이전에 반드시 호출되어야 합니다.
 * 하이드레이션(hydration) 이후에 호출되면 SSR 중에 테마 컨텍스트를
 * 사용할 수 없어 스타일되지 않은 콘텐츠가 깜빡이는 현상(FOUC)이 발생합니다.
 *
 * 전체 설계 근거는 ADR-003을 참조하세요.
 */
export function initializeTheme(theme: Theme): void {
  // ...
}
```

## API 문서화 (API Documentation)

공개 API(REST, GraphQL, 라이브러리 인터페이스)의 경우:

### 타입과 함께 인라인 문서화 (TypeScript 권장)

```typescript
/**
 * 새 작업을 생성합니다.
 *
 * @param input - 작업 생성 데이터 (제목 필수, 설명 선택)
 * @returns 서버에서 생성된 ID와 타임스탬프가 포함된 생성된 작업 객체
 * @throws {ValidationError} 제목이 비어있거나 200자를 초과할 때
 * @throws {AuthenticationError} 사용자가 인증되지 않았을 때
 *
 * @example
 * const task = await createTask({ title: '식료품 사기' });
 * console.log(task.id); // "task_abc123"
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  // ...
}
```

### REST API용 OpenAPI / Swagger

```yaml
paths:
  /api/tasks:
    post:
      summary: 작업 생성
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTaskInput'
      responses:
        '201':
          description: 작업 생성 성공
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'
        '422':
          description: 유효성 검사 오류
```

## README 구조 (README Structure)

모든 프로젝트는 다음을 포함하는 README를 갖추어야 합니다:

```markdown
# 프로젝트 이름

이 프로젝트가 무엇을 하는지 설명하는 한 문단 요약.

## 빠른 시작 (Quick Start)
1. 리포지토리 클론
2. 의존성 설치: `npm install`
3. 환경 변수 설정: `cp .env.example .env`
4. 개발 서버 실행: `npm run dev`

## 주요 명령어 (Commands)
| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 시작 |
| `npm test` | 테스트 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | 린터 실행 |

## 아키텍처 (Architecture)
프로젝트 구조와 핵심 설계 결정에 대한 간략한 개요.
자세한 내용은 ADR 문서 링크 참조.

## 기여하기 (Contributing)
기여 방법, 코딩 표준, PR 절차 안내.
```

## 변경 로그 관리 (Changelog Maintenance)

출시된 기능의 경우:

```markdown
# Changelog

## [1.2.0] - 2025-01-20
### 추가됨 (Added)
- 작업 공유: 팀원과 작업을 공유할 수 있는 기능 추가 (#123)
- 작업 할당 시 이메일 알림 기능 (#124)

### 수정됨 (Fixed)
- 생성 버튼을 빠르게 연타할 때 중복 작업이 생성되던 버그 수정 (#125)

### 변경됨 (Changed)
- 더 나은 사용자 경험을 위해 작업 목록 페이지당 로딩 개수를 20개에서 50개로 변경 (#126)
```

## 에이전트를 위한 문서화 (Documentation for Agents)

AI 에이전트의 컨텍스트를 고려한 특별한 팁:

- **CLAUDE.md / 규칙 파일** — 에이전트가 따를 수 있도록 프로젝트 컨벤션을 문서화
- **사양(Spec) 파일** — 에이전트가 올바른 결과물을 만들 수 있도록 사양을 항상 최신으로 유지
- **ADR** — 에이전트가 과거의 결정 이유를 이해하도록 도움 (동일한 결정을 번복하는 것 방지)
- **인라인 주의사항(Gotchas)** — 에이전트가 알려진 함정에 빠지는 것을 방지

## 흔한 합리화 및 반박 (Common Rationalizations)

| 합리화 (Rationalization) | 실제 현실 (Reality) |
|---|---|
| "코드가 스스로를 문서화한다" | 코드는 무엇(What)만 보여줍니다. 왜(Why), 어떤 대안이 거절되었는지, 어떤 제약이 있었는지는 보여주지 못합니다. |
| "API가 안정화되면 문서를 쓰겠다" | 문서를 작성할 때 API가 더 빨리 안정화됩니다. 문서는 설계의 첫 번째 테스트입니다. |
| "아무도 문서를 읽지 않는다" | 에이전트가 읽습니다. 미래의 엔지니어가 읽습니다. 3개월 후의 당신이 읽습니다. |
| "ADR은 오버헤드다" | 10분의 ADR 작성이 6개월 뒤 동일한 결정에 대한 2시간의 소모적 논쟁을 막아줍니다. |
| "주석은 쉽게 낡는다" | '이유'에 대한 주석은 변하지 않고 안정적입니다. 낡는 것은 '무엇'을 적은 주석이며, 그래서 '이유'만 작성해야 합니다. |

## 위험 신호 (Red Flags)

- 문서화된 근거가 없는 중요한 아키텍처 결정
- 문서나 타입 정의가 없는 공개 API
- 프로젝트 실행 방법을 설명하지 못하는 README
- 코드를 삭제하지 않고 주석 처리해 둔 것
- 몇 주 동안 방치된 TODO 주석
- 중요한 기술적 선택이 많은 프로젝트에 ADR이 전무한 경우
- 의도를 설명하지 않고 코드를 그대로 받아 적은 주석

## 최종 검증 체크리스트 (Verification)

문서화 작업 완료 후:

- [ ] 모든 중요한 아키텍처 결정에 대해 ADR이 존재함
- [ ] README에 빠른 시작, 명령어, 아키텍처 개요가 포함됨
- [ ] API 함수에 파라미터 및 반환 타입 문서화가 적용됨
- [ ] 중요한 위치에 알려진 함정(Gotchas)이 인라인으로 문서화됨
- [ ] 주석 처리된 코드가 남아있지 않음
- [ ] 규칙 파일(CLAUDE.md 등)이 최신 상태이며 정확함
