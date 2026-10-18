---
name: test-driven-development
description: 테스트를 통해 개발을 주도합니다. 로직을 구현하거나, 버그를 수정하거나, 동작을 변경할 때 사용합니다. 코드가 작동함을 증명해야 할 때, 버그 리포트가 접수되었을 때, 또는 기존 기능을 수정하려 할 때 사용합니다.
---

# 테스트 주도 개발 (Test-Driven Development)

## 개요 (Overview)

코드를 통과시키기 위한 코드를 작성하기 전에, **먼저 실패하는 테스트(failing test)**를 작성하세요. 버그를 수정할 때는 수정을 시도하기 전에 테스트로 버그를 먼저 재현하세요. 테스트는 '증거'입니다 — "잘 동작하는 것 같다"는 완료가 아닙니다. 훌륭한 테스트가 갖춰진 코드베이스는 AI 에이전트의 초능력이 되지만, 테스트가 없는 코드베이스는 거대한 부채입니다.

## 사용 시점 (When to Use)

- 새로운 로직이나 동작을 구현할 때
- 모든 버그를 수정할 때 (증명 패턴 - Prove-It Pattern)
- 기존 기능을 수정할 때
- 엣지 케이스 처리를 추가할 때
- 기존 동작을 깨뜨릴 수 있는 모든 변경 사항

**사용하지 않는 경우:** 순수 설정 변경, 문서 업데이트, 또는 동작에 영향을 주지 않는 정적 콘텐츠 변경.

## 먼저 스택을 파악할 것 (Discover the Stack First)

TDD 사이클은 보편적이지만, 실행 명령어는 프로젝트마다 다릅니다. 첫 테스트를 작성하기 전에 *이 리포지토리*가 어떻게 테스트하는지 먼저 확인하고, 모든 RED, GREEN, 검증 단계에서 그 명령어를 사용하세요:

- **언어 및 빌드 시스템:** `package.json`, `pom.xml`/`build.gradle`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `Makefile` 등
- **포함된 래퍼 스크립트:** 전역 도구 대신 `./gradlew`, `./mvnw`, `make test`, 리포지토리 스크립트를 우선 사용
- **테스트 프레임워크 및 설정:** 단일 타깃 테스트 실행 방법 vs 전체 스위트 실행 방법 파악
- **기존 컨벤션:** 테스트 위치, 파일 명명 규칙, 인접 테스트들의 패턴
- **문서화된 명령어:** README, CONTRIBUTING, CI 워크플로우에 명시된 실제 병합 게이트 명령어

`npm test`와 같은 기본값을 성급히 가정하지 마세요 — 프로젝트에 맞는 명령어를 찾아 사용해야 합니다.

## TDD 사이클 (The TDD Cycle)

```
       RED                 GREEN               REFACTOR
  실패하는 테스트    ──→  이를 통과시키는  ──→   구현 코드를   ──→  (반복)
    먼저 작성             최소한의 코드 작성       깔끔하게 리팩터링
       │                    │                     │
       ▼                    ▼                     ▼
  테스트 실패           테스트 통과           테스트 계속 통과
```

### 1단계: RED — 실패하는 테스트 작성

테스트를 먼저 작성합니다. 이 테스트는 반드시 실패해야 합니다. 처음부터 통과하는 테스트는 아무것도 증명하지 못합니다.

```typescript
// RED: createTask 함수가 아직 없으므로 이 테스트는 실패함
describe('TaskService', () => {
  it('제목과 기본 상태를 가진 작업을 생성한다', async () => {
    const task = await taskService.createTask({ title: '식료품 사기' });

    expect(task.id).toBeDefined();
    expect(task.title).toBe('식료품 사기');
    expect(task.status).toBe('pending');
    expect(task.createdAt).toBeInstanceOf(Date);
  });
});
```

### 2단계: GREEN — 테스트를 통과시킴

테스트를 통과시키기 위한 최소한의 코드만 작성합니다. 과도한 엔지니어링을 하지 마세요:

```typescript
// GREEN: 최소한의 구현
export async function createTask(input: { title: string }): Promise<Task> {
  const task = {
    id: generateId(),
    title: input.title,
    status: 'pending' as const,
    createdAt: new Date(),
  };
  await db.tasks.insert(task);
  return task;
}
```

### 3단계: REFACTOR — 코드 정리

테스트가 성공(Green)한 상태에서, 동작을 변경하지 않고 코드를 개선합니다:
- 공통 로직 추출
- 명명 개선
- 중복 제거
- 필요한 경우 최적화

리팩터링할 때마다 테스트를 실행하여 깨진 부분이 없는지 확인하세요.

## 증명 패턴 (버그 수정용) (The Prove-It Pattern)

버그 리포트가 들어왔을 때, **수정부터 하려고 덤벼들지 마세요.** 버그를 재현하는 테스트를 작성하는 것부터 시작하세요.

```
버그 리포트 접수
       │
       ▼
버그를 재현하는 테스트 작성
       │
       ▼
테스트 실패 (버그의 존재를 명확히 확인)
       │
       ▼
수정 코드 구현
       │
       ▼
테스트 통과 (수정이 작동함을 증명)
       │
       ▼
전체 테스트 스위트 실행 (회귀 버그 없음 확인)
```

**예시:**

```typescript
// 버그: "작업을 완료해도 completedAt 타임스탬프가 갱신되지 않음"

// 1단계: 재현 테스트 작성 (실패해야 함)
it('작업이 완료되면 completedAt이 설정된다', async () => {
  const task = await taskService.createTask({ title: '테스트' });
  const completed = await taskService.completeTask(task.id);

  expect(completed.status).toBe('completed');
  expect(completed.completedAt).toBeInstanceOf(Date);  // 실패함 → 버그 확인
});

// 2단계: 버그 수정
export async function completeTask(id: string): Promise<Task> {
  return db.tasks.update(id, {
    status: 'completed',
    completedAt: new Date(),  // 누락되었던 부분 추가
  });
}

// 3단계: 테스트 통과 → 버그 수정 및 향후 회귀 방지 완료
```

## 테스트 피라미드 (The Test Pyramid)

피라미드 구조에 따라 테스트 노력을 분배하세요 — 대부분의 테스트는 작고 빨라야 하며, 상위 레벨로 갈수록 테스트 수가 적어야 합니다:

```
          ╱╲
         ╱  ╲         E2E 테스트 (~5%)
        ╱    ╲        전체 사용자 흐름, 실제 브라우저
       ╱──────╲
      ╱        ╲      통합 테스트 (~15%)
     ╱          ╲     컴포넌트 간 상호작용, API 경계
    ╱────────────╲
   ╱              ╲   단위 테스트 (~80%)
  ╱                ╲  순수 로직, 격리된 환경, 밀리초 단위 실행
 ╱──────────────────╲
```

**비욘세의 법칙 (The Beyonce Rule):** 마음에 드는 기능이라면 테스트를 걸어두었어야 했습니다 ("If you liked it, then you should have put a test on it"). 인프라 변경, 리팩터링, 마이그레이션이 당신의 버그를 잡아줄 책임은 없습니다. 변경으로 인해 코드가 깨졌는데 테스트가 없었다면 그것은 작성자의 책임입니다.

### 테스트 크기 분류 (Resource Model)

| 크기 | 제약 조건 | 실행 속도 | 예시 |
|---|---|---|---|
| **Small** | 단일 프로세스, I/O 없음, 네트워크/DB 없음 | 밀리초(ms) | 순수 함수 테스트, 데이터 변환 로직 |
| **Medium** | 다중 프로세스 허용, localhost 전용, 외부 서비스 없음 | 초(s) | 테스트 DB를 포함한 API 테스트, 컴포넌트 테스트 |
| **Large** | 다중 머신 허용, 외부 서비스 연동 | 분(min) | E2E 테스트, 성능 벤치마크, 스테이징 통합 테스트 |

## 좋은 테스트 작성법 (Writing Good Tests)

### 상호작용이 아닌 상태를 테스트할 것 (Test State, Not Interactions)

내부적으로 어떤 메서드가 호출되었는지가 아니라, 작업의 **결과(Outcome/State)**를 검증하세요. 호출 순서를 검증하는 테스트는 동작이 바뀌지 않아도 내부 리팩터링 시 깨지기 쉽습니다.

```typescript
// 좋음: 함수가 무엇을 하는지 검증 (상태 기반)
it('작업 목록을 생성일 최신순으로 정렬하여 반환한다', async () => {
  const tasks = await listTasks({ sortBy: 'createdAt', sortOrder: 'desc' });
  expect(tasks[0].createdAt.getTime())
    .toBeGreaterThan(tasks[1].createdAt.getTime());
});

// 나쁨: 내부 구현 방식을 검증 (상호작용 기반)
it('ORDER BY created_at DESC 쿼리를 호출한다', async () => {
  await listTasks({ sortBy: 'createdAt', sortOrder: 'desc' });
  expect(db.query).toHaveBeenCalledWith(
    expect.stringContaining('ORDER BY created_at DESC')
  );
});
```

### 테스트에서는 DRY보다 DAMP (DAMP Over DRY in Tests)

프로덕션 코드에서는 DRY(Don't Repeat Yourself)가 맞지만, 테스트에서는 **DAMP(Descriptive And Meaningful Phrases - 서술적이고 의미 있는 문구)**가 더 좋습니다. 테스트는 사양서처럼 읽혀야 합니다 — 공유 헬퍼를 뒤적거리지 않고도 테스트 하나만 읽고 전체 맥락을 이해할 수 있어야 합니다.

### Mock보다 실제 구현을 우선할 것 (Prefer Real Implementations Over Mocks)

작업을 수행할 수 있는 가장 단순한 테스트 더블을 사용하세요:

```
선호 순서 (위에서 아래로):
1. 실제 구현 (Real implementation) → 가장 높은 신뢰도, 실제 버그 발견
2. 페이크 (Fake)                   → 메모리 내 대체제 (예: 인메모리 DB)
3. 스텁 (Stub)                     → 고정된 가짜 데이터 반환
4. 모의 객체 (Mock)                → 메서드 호출 검증 — 최소한으로만 사용
```

실제 구현이 너무 느리거나, 비결정적이거나, 제어할 수 없는 외부 부작용(외부 결제 API, 이메일 발송 등)이 있을 때만 Mock을 사용하세요. 과도한 Mocking은 테스트는 통과하지만 프로덕션은 깨지는 허상의 테스트를 만듭니다.

### AAA 패턴 (Arrange-Act-Assert) 준수

```typescript
it('마감일이 지난 작업은 기한 초과로 표시된다', () => {
  // Arrange (준비): 테스트 시나리오 설정
  const task = createTask({
    title: '테스트 작업',
    deadline: new Date('2025-01-01'),
  });

  // Act (실행): 테스트 대상 동작 수행
  const result = checkOverdue(task, new Date('2025-01-02'));

  // Assert (검증): 결과 확인
  expect(result.isOverdue).toBe(true);
});
```

### 하나의 개념당 하나의 단언 (One Assertion Per Concept)

각 테스트는 하나의 동작만을 명확히 검증해야 합니다. 모호한 이름(`test 1`, `works`) 대신 사양서처럼 읽히는 서술적인 이름을 사용하세요.

## DevTools를 활용한 브라우저 테스트 (Browser Testing)

브라우저에서 실행되는 모든 것은 단위 테스트만으로 부족하며 런타임 검증이 필요합니다. Chrome DevTools MCP를 활용하여 DOM 검사, 콘솔 오류, 네트워크 응답, 성능 트레이스, 스크린샷을 확인하세요 (자세한 내용은 `browser-testing-with-devtools` 참조).

## 흔한 합리화 및 반박 (Common Rationalizations)

| 합리화 (Rationalization) | 실제 현실 (Reality) |
|---|---|
| "코드가 작동한 후에 테스트를 쓰겠다" | 결국 안 쓰게 됩니다. 그리고 사후에 작성된 테스트는 동작이 아닌 구현을 테스트하게 됩니다. |
| "너무 간단한 코드라 테스트가 필요 없다" | 간단한 코드도 시간이 지나면 복잡해집니다. 테스트는 기대 동작을 문서화합니다. |
| "테스트 작성이 나를 느리게 만든다" | 지금은 조금 느릴지 몰라도, 향후 코드를 수정할 때마다 몇 배로 속도를 높여줍니다. |
| "수동으로 직접 테스트해봤다" | 수동 테스트는 영속성이 없습니다. 내일의 변경이 코드를 깨뜨려도 알 방법이 없습니다. |
| "그냥 안심하기 위해 같은 테스트를 한 번 더 돌려보겠다" | 코드가 바뀌지 않았다면 동일한 테스트를 연속 실행하는 것은 신뢰도를 높여주지 않습니다. |

## 위험 신호 (Red Flags)

- 대응하는 테스트 없이 코드를 작성하는 것
- 리포지토리의 실제 검사 명령어를 확인하지 않고 기본 `npm test`만 실행하는 것
- 첫 실행에 바로 통과하는 테스트 (검증 대상을 잘못 작성했을 가능성 높음)
- 재현 테스트 없는 버그 수정
- 애플리케이션 동작이 아닌 프레임워크 자체의 동작을 테스트하는 것
- 기대 동작을 설명하지 못하는 모호한 테스트 이름
- 테스트 스위트를 통과시키기 위해 테스트를 skip하거나 삭제하는 것
- 코드 변경 없이 동일한 테스트 명령을 연속으로 두 번 실행하는 것

## 최종 검증 체크리스트 (Verification)

구현 완료 후:

- [ ] 모든 새로운 동작에 대응하는 테스트가 존재함
- [ ] 리포지토리 자체의 테스트 명령어로 전체 테스트 스위트가 통과함
- [ ] 버그 수정의 경우 수정 전에 실패했던 재현 테스트가 포함됨
- [ ] 테스트 이름이 검증 대상 동작을 명확히 설명함
- [ ] 테스트가 임의로 스킵되거나 비활성화되지 않음
- [ ] 커버리지가 감소하지 않음
