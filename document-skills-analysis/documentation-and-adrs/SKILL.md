---
name: documentation-and-adrs
description: 의사 결정 및 문서화를 기록합니다. 아키텍처 결정을 내리거나, 공개 API를 변경하거나, 기능을 출시하거나, 향후 엔지니어와 에이전트가 코드베이스를 이해하는 데 필요한 맥락을 기록해야 할 때 사용합니다.
---

# 문서화 및 ADR (Documentation and ADRs)

## 개요 (Overview)

코드가 아닌 의사 결정을 문서화하세요. 가장 가치 있는 문서화는 의사 결정으로 이어진 *이유(Why)* — 즉 맥락, 제약 조건, 트레이드오프 — 를 포착하는 것입니다. 코드는 *무엇(What)*이 구현되었는지 보여주며, 문서는 *왜 이렇게 작성되었는지* 그리고 *어떤 대안이 검토되었는지*를 설명합니다. 이 맥락은 향후 해당 코드베이스에서 작업할 사람과 에이전트 모두에게 필수적입니다.

## 사용 시점 (When to Use)

- 중요한 아키텍처 결정을 내릴 때
- 경합하는 여러 접근 방식 중 하나를 선택할 때
- 공개 API를 추가하거나 변경할 때
- 사용자에게 노출되는 동작을 변경하는 기능을 출시할 때
- 프로젝트에 신규 팀원(또는 에이전트)을 온보딩할 때
- 동일한 내용을 반복해서 설명하고 있는 자신을 발견했을 때

**사용하지 않아야 할 시점:** 명백한 코드를 문서화하지 마세요. 코드가 이미 보여주는 내용을 단순히 재진술하는 주석을 추가하지 마세요. 일회성 프로토타입을 위한 문서를 작성하지 마세요.

## 아키텍처 결정 기록 (Architecture Decision Records - ADRs)

ADR은 중요한 기술적 결정 뒤에 숨은 추론을 기록합니다. 이는 여러분이 작성할 수 있는 가장 가치 높은 문서화입니다.

### ADR을 작성해야 하는 시점

- 프레임워크, 라이브러리 또는 주요 의존성을 선택할 때
- 데이터 모델 또는 데이터베이스 스키마를 설계할 때
- 인증 전략을 선택할 때
- API 아키텍처를 결정할 때 (REST vs GraphQL vs tRPC)
- 빌드 도구, 호스팅 플랫폼 또는 인프라를 선택할 때
- 뒤집거나 철회하기에 비용이 많이 드는 모든 결정을 내릴 때

### 기존 컨벤션을 먼저 맞추세요

ADR을 생성하기 전에, 수립된 컨벤션이 있는지 기존 리포지토리 맥락을 조사하세요 — 기존 ADR, 프로젝트 지침, ADR 관련 설정 또는 도구(예: `.adr-dir` 파일 등). 수립된 컨벤션이 있다면 아래의 기본값보다 우선 적용됩니다. 다음에 맞추세요:

- **위치 및 포맷** — 예: `docs/adr/*.md`, `Documentation/Decisions/*.rst`, MADR 레이아웃 또는 `adr-tools` 설정. 기존 디렉토리, 파일 확장자, 마크업(Markdown vs reStructuredText)을 따르세요.
- **번호 및 명명 규칙** — 기존 순서 및 파일명 패턴(`ADR-004-Title.rst`, `0004-title.md` 등)을 계속 유지하세요. 001부터 다시 시작하거나 두 번째 명명 체계를 도입하지 마세요.
- **섹션 헤딩** — 이 템플릿의 헤딩을 강제하기보다는 프로젝트의 기존 헤딩 세트를 재사용하세요.

이용 가능한 증거가 충돌하는 경우, 암묵적으로 또 다른 체계를 도입하지 말고 충돌 사항을 표면화하세요. 수립된 컨벤션을 확인할 수 없을 때만 아래의 기본값을 적용하세요.

### ADR 템플릿

ADR은 순차적 번호를 붙여 `docs/decisions/`에 저장하세요 (프로젝트에서 이미 다른 위치를 사용 중이지 않은 경우 — 위 내용 참조):

```markdown
# ADR-001: 주 데이터베이스로 PostgreSQL 사용

## 상태 (Status)
Accepted(승인됨) | Superseded by ADR-XXX(ADR-XXX로 대체됨) | Deprecated(폐기됨)

## 날짜 (Date)
2025-01-15

## 맥락 (Context)
태스크 관리 애플리케이션을 위한 주 데이터베이스가 필요합니다. 핵심 요구사항:
- 관계형 데이터 모델 (관계가 존재하는 사용자, 태스크, 팀)
- 태스크 상태 변경을 위한 ACID 트랜잭션
- 태스크 콘텐츠에 대한 전문 검색(Full-text search) 지원
- 관리형 호스팅 이용 가능 (소규모 팀, 제한된 운영 역량)

## 결정 (Decision)
Prisma ORM과 함께 PostgreSQL을 사용합니다.

## 검토한 대안들 (Alternatives Considered)

### MongoDB
- 장점: 유연한 스키마, 시작하기 쉬움
- 단점: 우리 데이터는 본질적으로 관계형임; 관계를 수동으로 관리해야 함
- 기각 사유: 문서 저장소에 관계형 데이터를 두면 복잡한 조인이나 데이터 중복이 발생함

### SQLite
- 장점: 설정 필요 없음, 임베디드, 빠른 읽기 속도
- 단점: 제한적인 동시 쓰기 지원, 프로덕션용 관리형 호스팅 부재
- 기각 사유: 프로덕션 환경의 다중 사용자 웹 애플리케이션에 적합하지 않음

### MySQL
- 장점: 성숙함, 광범위하게 지원됨
- 단점: PostgreSQL이 더 뛰어난 JSON 지원, 전문 검색, 생태계 도구를 제공함
- 기각 사유: PostgreSQL이 우리 기능 요구사항에 더 잘 부합함

## 결과 및 파급효과 (Consequences)
- Prisma를 통해 타입 안정성이 보장되는 데이터베이스 접근 및 마이그레이션 관리가 가능함
- Elasticsearch를 별도로 추가하는 대신 PostgreSQL의 전문 검색을 사용할 수 있음
- 팀에 PostgreSQL 지식이 필요함 (표준적인 기술, 낮은 위험)
- 관리형 서비스(Supabase, Neon 또는 RDS)에서 호스팅함
```

### ADR 수명 주기 (ADR Lifecycle)

```
PROPOSED(제안됨) → ACCEPTED(승인됨) → (SUPERSEDED(대체됨) 또는 DEPRECATED(폐기됨))
```

- **오래된 ADR을 삭제하지 마세요.** 과거의 맥락을 담고 있습니다.
- 결정 사항이 변경되면, 기존 ADR을 참조하고 이를 대체(supersede)하는 새 ADR을 작성하세요.

## 코드 내 문서화 (Inline Documentation)

### 주석을 작성해야 하는 시점

*무엇(What)*이 아니라 *이유(Why)*를 주석으로 작성하세요:

```typescript
// 나쁜 예: 코드를 그대로 재진술함
// 카운터를 1 증가시킴
counter += 1;

// 좋은 예: 명확하지 않은 의도를 설명함
// 처리율 제한(Rate limit)은 슬라이딩 윈도우를 사용함 — 윈도우 경계에서의
// 버스트 공격을 방지하기 위해 고정 일정이 아닌 윈도우 경계 시점에 카운터를 초기화함
if (now - windowStart > WINDOW_SIZE_MS) {
  counter = 0;
  windowStart = now;
}
```

### 주석을 작성하지 말아야 하는 시점

```typescript
// 설명이 필요 없는 자명한 코드에는 주석을 달지 마세요
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// 지금 바로 해결해야 할 일에 TODO 주석을 남겨두지 마세요
// TODO: 에러 처리 추가  ← 그냥 지금 추가하세요

// 주석 처리된 코드를 남겨두지 마세요
// const oldImplementation = () => { ... }  ← 삭제하세요, Git에 이력이 남아있습니다
```

### 알려진 주의사항(Gotchas) 문서화

```typescript
/**
 * 중요: 이 함수는 첫 번째 렌더링 이전에 호출되어야 합니다.
 * 하이드레이션(Hydration) 이후에 호출되면 SSR 동안 테마 맥락을
 * 사용할 수 없으므로 스타일이 적용되지 않은 콘텐츠가 깜빡이는 현상(FOUC)이 발생합니다.
 *
 * 전체 설계 추론은 ADR-003을 참조하세요.
 */
export function initializeTheme(theme: Theme): void {
  // ...
}
```

## API 문서화 (API Documentation)

공개 API (REST, GraphQL, 라이브러리 인터페이스 등) 대상:

### 타입과 함께 인라인으로 작성 (TypeScript 권장)

```typescript
/**
 * 새로운 태스크를 생성합니다.
 *
 * @param input - 태스크 생성 데이터 (제목 필수, 설명 선택)
 * @returns 서버에서 생성된 ID와 타임스탬프가 포함된 생성된 태스크
 * @throws {ValidationError} 제목이 비어있거나 200자를 초과하는 경우
 * @throws {AuthenticationError} 사용자가 인증되지 않은 경우
 *
 * @example
 * const task = await createTask({ title: '장보기' });
 * console.log(task.id); // "task_abc123"
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  // ...
}
```

### REST API를 위한 OpenAPI / Swagger

```yaml
paths:
  /api/tasks:
    post:
      summary: 태스크 생성
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTaskInput'
      responses:
        '201':
          description: 태스크 생성됨
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'
        '422':
          description: 유효성 검사 에러
```

## README 구조

모든 프로젝트에는 다음 내용을 다루는 README가 있어야 합니다:

```markdown
# 프로젝트 이름

이 프로젝트가 무엇을 하는지 설명하는 한 단락의 요약.

## 빠른 시작 (Quick Start)
1. 리포지토리 클론
2. 의존성 설치: `npm install`
3. 환경 설정: `cp .env.example .env`
4. 개발 서버 실행: `npm run dev`

## 명령어 (Commands)
| 명령어 | 설명 |
|---------|-------------|
| `npm run dev` | 개발 서버 시작 |
| `npm test` | 테스트 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | 린터 실행 |

## 아키텍처 (Architecture)
프로젝트 구조 및 핵심 설계 결정에 대한 간략한 개요.
자세한 내용은 ADR 링크 참조.

## 기여하기 (Contributing)
기여 방법, 코딩 스타일 컨벤션, PR 프로세스.
```

## 변경 이력(Changelog) 유지 관리

출시된 기능 대상:

```markdown
# 변경 이력 (Changelog)

## [1.2.0] - 2025-01-20
### 추가됨 (Added)
- 태스크 공유: 사용자가 팀원과 태스크를 공유할 수 있음 (#123)
- 태스크 할당 시 이메일 알림 기능 (#124)

### 수정됨 (Fixed)
- 생성 버튼을 빠르게 연타할 때 중복 태스크가 생성되던 현상 수정 (#125)

### 변경됨 (Changed)
- 더 나은 UX를 위해 태스크 목록이 페이지당 50개씩 로드됨 (기존 20개) (#126)
```

## 에이전트를 위한 문서화 (Documentation for Agents)

AI 에이전트 맥락을 위한 특별 고려사항:

- **CLAUDE.md / 규칙 파일들** — 에이전트가 따를 수 있도록 프로젝트 컨벤션을 문서화
- **명세(Spec) 파일들** — 에이전트가 올바른 제품을 빌드하도록 명세를 최신으로 유지
- **ADR 문서들** — 에이전트가 과거 결정 이유를 이해하도록 도움 (재논의 방지)
- **인라인 주의사항(Gotchas)** — 에이전트가 알려진 함정에 빠지는 것을 방지

## 흔한 합리화와 실제 (Common Rationalizations)

| 합리화 | 실제 |
|---|---|
| "코드가 스스로를 문서화합니다" | 코드는 '무엇'을 보여줄 뿐입니다. '왜', 어떤 대안이 기각되었는지, 어떤 제약이 적용되는지는 보여주지 못합니다. |
| "API가 안점됨을 찾으면 문서를 작성하겠습니다" | 문서를 작성할 때 API가 더 빠르게 안정화됩니다. 문서가 곧 디자인의 첫 번째 테스트입니다. |
| "아무도 문서를 읽지 않습니다" | 에이전트는 읽습니다. 미래의 엔지니어도 읽습니다. 3달 뒤의 자신도 읽습니다. |
| "ADR은 오버헤드입니다" | 10분짜리 ADR 하나가 6개월 뒤 동일한 결정으로 2시간 동안 논쟁하는 것을 막아줍니다. |
| "주석은 구식이 됩니다" | *이유(Why)*에 대한 주석은 안정적입니다. *무엇(What)*에 대한 주석이 구식이 되며, 그것이 오직 전자의 주석만 작성해야 하는 이유입니다. |

## 레드 플래그 (Red Flags)

- 서면 추론이 없는 아키텍처 결정
- 문서나 타입이 없는 공개 API
- 프로젝트 실행 방법을 설명하지 않는 README
- 코드 삭제 대신 주석 처리된 코드
- 수주일 동안 방치된 TODO 주석
- 중요한 아키텍처 선택이 있음에도 ADR이 없는 프로젝트
- 의도를 설명하는 대신 코드를 그대로 재진술하는 문서

## 검증 체크리스트 (Verification)

문서화 작업 완료 후:

- [ ] 모든 중요한 아키텍처 결정에 대해 ADR이 존재하는가?
- [ ] README가 빠른 시작, 명령어, 아키텍처 개요를 다루고 있는가?
- [ ] API 함수에 파라미터 및 리턴 타입 문서가 존재하는가?
- [ ] 알려진 주의사항(Gotchas)이 필요한 위치에 인라인으로 문서화되었는가?
- [ ] 주석 처리된 코드가 남아있지 않은가?
- [ ] 규칙 파일들(CLAUDE.md 등)이 최신 상태이며 정확한가?
