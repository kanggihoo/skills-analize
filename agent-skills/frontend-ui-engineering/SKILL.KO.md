---
name: frontend-ui-engineering
description: 프로덕션 품질의 접근 가능하고 반응형인 사용자 대상 UI를 구축합니다. 인터페이스와 페이지를 만들거나 수정할 때, 컴포넌트를 만들 때, 레이아웃을 구현할 때, WCAG 접근성 요구사항을 충족할 때, 상태를 관리할 때, 또는 결과물이 AI가 생성한 것처럼 보이지 않고 프로덕션 품질로 보이고 느껴져야 할 때 사용합니다.
---

# 프론트엔드 UI 엔지니어링

## 개요

접근 가능하고, 성능이 좋으며, 시각적으로 다듬어진 프로덕션 품질의 사용자 인터페이스를 만듭니다. 목표는 최고 기업의 디자인 감각을 갖춘 엔지니어가 만든 것처럼 보이는 UI이지, AI가 생성한 것처럼 보이는 UI가 아닙니다. 이는 실제 디자인 시스템을 따르고, 제대로 된 접근성을 갖추고, 신중하게 고른 상호작용 패턴을 쓰며, 흔한 "AI 미학"을 피하는 것을 뜻합니다.

## 사용 시점

- 새 UI 컴포넌트나 페이지를 만들 때
- 기존 사용자 대상 인터페이스를 수정할 때
- 반응형 레이아웃을 구현할 때
- 상호작용이나 상태 관리를 추가할 때
- 시각적 또는 UX 문제를 고칠 때

## 컴포넌트 아키텍처

### 파일 구조

컴포넌트와 관련된 모든 것을 한 곳에 모으세요.

```
src/components/
  TaskList/
    TaskList.tsx          # 컴포넌트 구현
    TaskList.test.tsx     # 테스트
    TaskList.stories.tsx  # Storybook 스토리(사용하는 경우)
    use-task-list.ts      # 커스텀 훅(상태가 복잡한 경우)
    types.ts              # 컴포넌트 전용 타입(필요한 경우)
```

### 컴포넌트 패턴

**설정보다 합성을 선호하세요.**

```tsx
// 좋음: 합성 가능
<Card>
  <CardHeader>
    <CardTitle>Tasks</CardTitle>
  </CardHeader>
  <CardBody>
    <TaskList tasks={tasks} />
  </CardBody>
</Card>

// 피함: 과하게 설정됨
<Card
  title="Tasks"
  headerVariant="large"
  bodyPadding="md"
  content={<TaskList tasks={tasks} />}
/>
```

**컴포넌트를 한 가지 일에 집중시키세요.**

```tsx
// 좋음: 한 가지 일만 함
export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <li className="flex items-center gap-3 p-3">
      <Checkbox checked={task.done} onChange={() => onToggle(task.id)} />
      <span className={task.done ? 'line-through text-muted' : ''}>{task.title}</span>
      <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
        <TrashIcon />
      </Button>
    </li>
  );
}
```

**데이터 가져오기와 표현을 분리하세요.**

```tsx
// 컨테이너: 데이터를 처리함
export function TaskListContainer() {
  const { tasks, isLoading, error, refetch } = useTasks();

  if (isLoading) return <TaskListSkeleton />;
  if (error) return <ErrorState message="작업을 불러오지 못했습니다" retry={refetch} />;
  if (tasks.length === 0) return <EmptyState message="아직 작업이 없습니다" />;

  return <TaskList tasks={tasks} />;
}

// 프레젠테이션: 렌더링을 처리함
export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <ul role="list" className="divide-y">
      {tasks.map(task => <TaskItem key={task.id} task={task} />)}
    </ul>
  );
}
```

## 상태 관리

**동작하는 가장 단순한 방법을 고르세요.**

```
로컬 상태(useState)              → 컴포넌트 전용 UI 상태
끌어올린 상태(Lifted state)       → 형제 컴포넌트 2~3개가 공유하는 상태
Context                          → 테마, 인증, 로캘(읽기는 많고 쓰기는 드묾)
URL 상태(searchParams)           → 필터, 페이지네이션, 공유 가능한 UI 상태
서버 상태(React Query, SWR)      → 캐싱이 있는 원격 데이터
전역 스토어(Zustand, Redux)      → 앱 전체가 공유하는 복잡한 클라이언트 상태
```

**props drilling을 3단계보다 깊게 하지 마세요.** 사용하지 않는 컴포넌트를 거쳐 props를 전달하고 있다면 Context를 도입하거나 컴포넌트 트리를 재구성하세요.

## 디자인 시스템 준수

### 참조 기반 UI 품질

제품이 뚜렷한 시각적 방향을 필요로 한다면, 레이아웃을 고르기 전에 근거를 모으세요.

1. 신뢰할 수 있는 참조 카탈로그에서 검색하거나, 제품팀이 제공한 참조를 사용하세요.
2. 관련 화면 두세 개를 살펴보세요. 계층 구조, 밀도, 내비게이션, 컨트롤, 반응형 동작, 상호작용 상태에 대한 결정을 기록하세요.
3. 구현 전에 그 결정을 짧은 디자인 계약으로 바꾸세요. 화면의 역할, 주요 액션, 필요한 상태, 반응형 규칙, 거부할 패턴을 명시하세요.
4. 유용한 구조를 제품 자체의 컴포넌트, 토큰, 콘텐츠, 시각 언어로 다시 만드세요. 다른 제품의 브랜딩, 독점 텍스트, 이미지, 정확한 레이아웃을 절대 복사하지 마세요.

참조는 템플릿이 아니라 근거로 사용하세요. 참조를 쓸 수 없다면 가정을 문서화하고, 결과를 제품의 기존 디자인 시스템에 대해 검증하세요.

### AI 미학 피하기

AI가 생성한 UI에는 알아볼 수 있는 패턴이 있습니다. 모두 피하세요.

| AI의 기본값 | 왜 문제인가 | 프로덕션 품질 |
|---|---|---|
| 모든 곳에 보라색/남색 | 모델은 시각적으로 "안전한" 팔레트를 기본값으로 쓰므로, 모든 앱이 똑같아 보이게 됨 | 프로젝트의 실제 색 팔레트를 사용 |
| 과도한 그라데이션 | 그라데이션은 시각적 노이즈를 더하고 대부분의 디자인 시스템과 충돌함 | 디자인 시스템에 맞는 평평하거나 은은한 그라데이션 |
| 모든 것에 둥근 모서리(rounded-2xl) | 최대 둥글기는 "친근함"을 뜻하지만, 실제 디자인의 모서리 반경 계층을 무시함 | 디자인 시스템의 일관된 border-radius |
| 일반적인 히어로 섹션 | 실제 콘텐츠나 사용자 요구와 연결되지 않은 템플릿 중심 레이아웃 | 콘텐츠 우선 레이아웃 |
| Lorem ipsum식 문구 | 자리표시자 텍스트는 실제 콘텐츠가 드러내는 레이아웃 문제(길이, 줄바꿈, 넘침)를 숨김 | 현실적인 자리표시자 콘텐츠 |
| 어디에나 과도한 패딩 | 똑같이 넉넉한 패딩은 시각적 계층을 망치고 화면 공간을 낭비함 | 일관된 간격 체계 |
| 뻔한 카드 그리드 | 균일한 그리드는 정보의 우선순위와 훑어보는 패턴을 무시하는 레이아웃 지름길임 | 목적에 맞춘 레이아웃 |
| 그림자 위주 디자인 | 겹겹이 쌓인 그림자는 콘텐츠와 경쟁하고 저사양 기기에서 렌더링을 느리게 함 | 디자인 시스템이 명시하지 않는 한 은은하거나 그림자 없음 |

### 간격과 레이아웃

일관된 간격 체계를 사용하세요. 값을 임의로 만들어 내지 마세요.

```css
/* 체계를 사용: 0.25rem 단위 증가(또는 프로젝트가 쓰는 단위) */
/* 좋음 */  padding: 1rem;      /* 16px */
/* 좋음 */  gap: 0.75rem;       /* 12px */
/* 나쁨 */  padding: 13px;      /* 어떤 체계에도 없음 */
/* 나쁨 */  margin-top: 2.3rem; /* 어떤 체계에도 없음 */
```

### 타이포그래피

타입 계층을 존중하세요.

```
h1 → 페이지 제목(페이지당 하나)
h2 → 섹션 제목
h3 → 하위 섹션 제목
body → 기본 텍스트
small → 보조/도움말 텍스트
```

제목 레벨을 건너뛰지 마세요. 제목 스타일을 제목이 아닌 콘텐츠에 쓰지 마세요.

### 색

- 원시 hex 값 대신 `text-primary`, `bg-surface`, `border-default` 같은 의미 기반 색 토큰을 사용하세요.
- 충분한 대비를 확보하세요(일반 텍스트 4.5:1, 큰 텍스트 3:1).
- 정보를 전달할 때 색에만 의존하지 마세요(아이콘, 텍스트, 패턴도 함께 사용).

## 접근성(WCAG 2.1 AA)

모든 컴포넌트는 다음 기준을 충족해야 합니다.

### 키보드 내비게이션

```tsx
// 모든 상호작용 요소는 키보드로 접근 가능해야 함
<button onClick={handleClick}>Click me</button>        // ✓ 기본적으로 포커스 가능
<div onClick={handleClick}>Click me</div>               // ✗ 포커스 불가
<div role="button" tabIndex={0} onClick={handleClick}    // ✓ 하지만 <button>을 선호
     onKeyDown={e => {
       if (e.key === 'Enter') handleClick();
       if (e.key === ' ') e.preventDefault();
     }}
     onKeyUp={e => {
       if (e.key === ' ') handleClick();
     }}>
  Click me
</div>
```

### ARIA 레이블

```tsx
// 보이는 텍스트가 없는 상호작용 요소에 레이블을 붙이세요
<button aria-label="대화상자 닫기"><XIcon /></button>

// 폼 입력에 레이블을 붙이세요
<label htmlFor="email">이메일</label>
<input id="email" type="email" />

// 보이는 레이블이 없을 때는 aria-label을 사용하세요
<input aria-label="작업 검색" type="search" />
```

### 포커스 관리

```tsx
// 콘텐츠가 바뀔 때 포커스를 옮기세요
function Dialog({ isOpen, onClose }: DialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  // 열려 있을 때 포커스를 대화상자 안에 가둠
  return (
    <dialog open={isOpen}>
      <button ref={closeRef} onClick={onClose}>닫기</button>
      {/* 대화상자 콘텐츠 */}
    </dialog>
  );
}
```

### 의미 있는 빈 상태와 오류 상태

```tsx
// 빈 화면을 보여주지 마세요
function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div role="status" className="text-center py-12">
        <TasksEmptyIcon className="mx-auto h-12 w-12 text-muted" />
        <h3 className="mt-2 text-sm font-medium">작업 없음</h3>
        <p className="mt-1 text-sm text-muted">새 작업을 만들어 시작하세요.</p>
        <Button className="mt-4" onClick={onCreateTask}>작업 만들기</Button>
      </div>
    );
  }

  return <ul role="list">...</ul>;
}
```

## 반응형 디자인

모바일 우선으로 설계한 뒤 넓혀 가세요.

```tsx
// Tailwind: 모바일 우선 반응형
<div className="
  grid grid-cols-1      /* 모바일: 단일 열 */
  sm:grid-cols-2        /* 작은 화면: 2열 */
  lg:grid-cols-3        /* 큰 화면: 3열 */
  gap-4
">
```

다음 브레이크포인트에서 테스트하세요: 320px, 768px, 1024px, 1440px.

## 로딩과 전환

```tsx
// 스켈레톤 로딩(콘텐츠에는 스피너를 쓰지 않음)
function TaskListSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="작업 불러오는 중">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-12 bg-muted animate-pulse rounded" />
      ))}
    </div>
  );
}

// 체감 속도를 위한 낙관적 업데이트
function useToggleTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleTask,
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks'], (old: Task[]) =>
        old.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
      );

      return { previous };
    },
    onError: (_err, _taskId, context) => {
      queryClient.setQueryData(['tasks'], context?.previous);
    },
  });
}
```

## 함께 보기

자세한 접근성 요구사항과 테스트 도구는 `../../references/accessibility-checklist.md`를 참조하세요.

## 흔한 합리화

| 합리화 | 현실 |
|---|---|
| "접근성은 있으면 좋은 정도예요" | 많은 관할권에서 법적 요구사항이며, 엔지니어링 품질 기준이기도 합니다. |
| "반응형은 나중에 만들게요" | 나중에 반응형을 덧붙이는 것은 처음부터 만드는 것보다 3배 어렵습니다. |
| "디자인이 확정되지 않았으니 스타일링은 건너뛸게요" | 디자인 시스템의 기본값을 쓰세요. 스타일이 없는 UI는 리뷰어에게 망가진 첫인상을 줍니다. |
| "이건 그냥 프로토타입이에요" | 프로토타입은 프로덕션 코드가 됩니다. 기반을 제대로 만드세요. |
| "AI 미학은 당분간 괜찮아요" | 낮은 품질의 신호입니다. 처음부터 프로젝트의 실제 디자인 시스템을 사용하세요. |

## 위험 신호

- 200줄을 넘는 컴포넌트(분리하세요)
- 인라인 스타일이나 임의의 픽셀 값
- 오류 상태, 로딩 상태, 빈 상태가 빠져 있음
- 키보드 내비게이션 테스트가 없음
- 상태를 나타내는 유일한 지표로서의 색(텍스트나 아이콘 없이 빨강/초록만 사용)
- 일반적인 "AI 느낌"(보라색 그라데이션, 과장된 카드, 뻔한 레이아웃)

## 검증

UI를 만든 뒤에는 다음을 확인하세요.

- [ ] 컴포넌트가 콘솔 오류 없이 렌더링됨
- [ ] 모든 상호작용 요소가 키보드로 접근 가능함(Tab으로 페이지 전체를 순회)
- [ ] 스크린 리더가 페이지의 콘텐츠와 구조를 전달할 수 있음
- [ ] 반응형: 320px, 768px, 1024px, 1440px에서 동작함
- [ ] 해당되는 경우 로딩, 빈, 오류, 성공, 권한 상태가 처리됨
- [ ] 프로젝트의 디자인 시스템(간격, 색, 타이포그래피)을 따름
- [ ] 완성된 결과가 UI 전용 최종 완료 게이트 리뷰를 통과함
- [ ] 개발자 도구나 axe-core에서 접근성 경고가 없음
