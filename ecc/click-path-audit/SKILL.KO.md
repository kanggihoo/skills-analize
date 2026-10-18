---
name: click-path-audit
description: "사용자에게 보이는 모든 버튼과 접점을 전체 상태 변경 순서에 따라 추적하여, 개별 함수는 정상 동작하지만 서로 상쇄하거나 잘못된 최종 상태를 만들거나 UI를 일관성 없는 상태로 남기는 버그를 찾습니다. 사용 시점: 체계적인 디버깅으로 버그를 찾지 못했는데 사용자가 버튼이 고장 났다고 보고할 때, 또는 공유 상태 저장소에 영향을 주는 대규모 리팩터링 이후."
metadata:
  origin: community
---

# /click-path-audit — 동작 흐름 감사

정적 코드 읽기로는 놓치는 버그를 찾습니다. 상태 상호작용의 부수 효과, 연속 호출 사이의 경쟁 조건, 말없이 서로의 작업을 되돌리는 핸들러가 대상입니다.

## 이 스킬이 해결하는 문제

전통적인 디버깅은 다음을 확인합니다.
- 함수가 존재하는가? (누락된 연결)
- 충돌하는가? (런타임 오류)
- 올바른 타입을 반환하는가? (데이터 흐름)

하지만 다음은 확인하지 못합니다.
- **최종 UI 상태가 버튼 라벨이 약속한 내용과 일치하는가?**
- **함수 B가 방금 함수 A가 한 작업을 말없이 되돌리는가?**
- **공유 상태(Zustand/Redux/context)에 의도한 동작을 상쇄하는 부수 효과가 있는가?**

실제 사례: "New Email" 버튼이 `setComposeMode(true)`를 호출한 뒤 `selectThread(null)`을 호출했습니다. 두 함수는 개별적으로 정상 동작했습니다. 하지만 `selectThread`에는 `composeMode: false`로 재설정하는 부수 효과가 있었습니다. 그 결과 버튼은 아무 일도 하지 않았습니다. 체계적인 디버깅으로 54개의 버그를 찾았지만, 이 버그는 놓쳤습니다.

---

## 동작 방식

대상 영역의 모든 대화형 접점에 대해 다음을 수행합니다.

```
1. IDENTIFY the handler (onClick, onSubmit, onChange, etc.)
2. TRACE every function call in the handler, IN ORDER
3. For EACH function call:
   a. What state does it READ?
   b. What state does it WRITE?
   c. Does it have SIDE EFFECTS on shared state?
   d. Does it reset/clear any state as a side effect?
4. CHECK: Does any later call UNDO a state change from an earlier call?
5. CHECK: Is the FINAL state what the user expects from the button label?
6. CHECK: Are there race conditions (async calls that resolve in wrong order)?
```

---

## 실행 단계

### 1단계: 상태 저장소 매핑

어떤 접점을 감사하기 전에, 모든 상태 저장소 액션의 부수 효과 맵을 만드세요.

```
For each Zustand store / React context in scope:
  For each action/setter:
    - What fields does it set?
    - Does it RESET other fields as a side effect?
    - Document: actionName → {sets: [...], resets: [...]}
```

이것이 핵심 참고 자료입니다. "New Email" 버그는 `selectThread`가 `composeMode`를 재설정한다는 사실을 알지 못하면 보이지 않았습니다.

**출력 형식:**
```
STORE: emailStore
  setComposeMode(bool) → sets: {composeMode}
  selectThread(thread|null) → sets: {selectedThread, selectedThreadId, messages, drafts, selectedDraft, summary} RESETS: {composeMode: false, composeData: null, redraftOpen: false}
  setDraftGenerating(bool) → sets: {draftGenerating}
  ...

DANGEROUS RESETS (actions that clear state they don't own):
  selectThread → resets composeMode (owned by setComposeMode)
  reset → resets everything
```

### 2단계: 각 접점 감사

대상 영역의 각 버튼/토글/폼 제출에 대해 다음을 수행합니다.

```
TOUCHPOINT: [Button label] in [Component:line]
  HANDLER: onClick → {
    call 1: functionA() → sets {X: true}
    call 2: functionB() → sets {Y: null} RESETS {X: false}  ← CONFLICT
  }
  EXPECTED: User sees [description of what button label promises]
  ACTUAL: X is false because functionB reset it
  VERDICT: BUG — [description]
```

**다음 버그 패턴을 각각 확인하세요.**

#### 패턴 1: 순차적 되돌리기
```
handler() {
  setState_A(true)     // sets X = true
  setState_B(null)     // side effect: resets X = false
}
// Result: X is false. First call was pointless.
```

#### 패턴 2: 비동기 경쟁
```
handler() {
  fetchA().then(() => setState({ loading: false }))
  fetchB().then(() => setState({ loading: true }))
}
// Result: final loading state depends on which resolves first
```

#### 패턴 3: 오래된 클로저
```
const [count, setCount] = useState(0)
const handler = useCallback(() => {
  setCount(count + 1)  // captures stale count
  setCount(count + 1)  // same stale count — increments by 1, not 2
}, [count])
```

#### 패턴 4: 누락된 상태 전이
```
// Button says "Save" but handler only validates, never actually saves
// Button says "Delete" but handler sets a flag without calling the API
// Button says "Send" but the API endpoint is removed/broken
```

#### 패턴 5: 조건부 도달 불가 경로
```
handler() {
  if (someState) {        // someState is ALWAYS false at this point
    doTheActualThing()    // never reached
  }
}
```

#### 패턴 6: useEffect 간섭
```
// Button sets stateX = true
// A useEffect watches stateX and resets it to false
// User sees nothing happen
```

### 3단계: 보고

발견한 각 버그에 대해 다음을 작성합니다.

```
CLICK-PATH-NNN: [severity: CRITICAL/HIGH/MEDIUM/LOW]
  Touchpoint: [Button label] in [file:line]
  Pattern: [Sequential Undo / Async Race / Stale Closure / Missing Transition / Dead Path / useEffect Interference]
  Handler: [function name or inline]
  Trace:
    1. [call] → sets {field: value}
    2. [call] → RESETS {field: value}  ← CONFLICT
  Expected: [what user expects]
  Actual: [what actually happens]
  Fix: [specific fix]
```

---

## 범위 조정

이 감사는 비용이 많이 듭니다. 적절한 범위로 한정하세요.

- **전체 앱 감사:** 앱을 새로 출시하거나 대규모 리팩터링을 마친 뒤에 사용합니다. 페이지별로 병렬 에이전트를 실행합니다.
- **단일 페이지 감사:** 새 페이지를 만든 뒤나, 사용자가 버튼이 고장 났다고 보고했을 때 사용합니다.
- **저장소 중심 감사:** Zustand 저장소를 수정한 뒤에 사용합니다. 변경된 액션을 사용하는 모든 소비자를 감사하세요.

### 전체 앱에 대한 권장 에이전트 분할:

```
Agent 1: Map ALL state stores (Step 1) — this is shared context for all other agents
Agent 2: Dashboard (Tasks, Notes, Journal, Ideas)
Agent 3: Chat (DanteChatColumn, JustChatPage)
Agent 4: Emails (ThreadList, DraftArea, EmailsPage)
Agent 5: Projects (ProjectsPage, ProjectOverviewTab, NewProjectWizard)
Agent 6: CRM (all sub-tabs)
Agent 7: Profile, Settings, Vault, Notifications
Agent 8: Management Suite (all pages)
```

Agent 1이 반드시 먼저 완료되어야 합니다. 그 출력이 다른 모든 에이전트의 입력이 됩니다.

---

## 사용 시점

- 체계적인 디버깅으로 "버그 없음"이 나왔는데 사용자는 UI가 고장 났다고 보고할 때
- Zustand 저장소 액션을 수정한 뒤에는 (모든 호출자를 확인하세요)
- 공유 상태를 건드리는 모든 리팩터링 뒤에
- 출시 전, 핵심 사용자 흐름에 대해
- 버튼이 "아무 동작도 하지 않을" 때 — 이것이 바로 그럴 때 쓰는 도구입니다

## 사용하지 말아야 할 때

- API 수준 버그(잘못된 응답 형태, 누락된 엔드포인트)에는 systematic-debugging을 사용하세요
- 스타일링/레이아웃 문제는 시각적으로 점검하세요
- 성능 문제는 프로파일링 도구를 사용하세요

---

## 다른 스킬과의 연계

- `/superpowers:systematic-debugging` 실행 **후**에 실행하세요(다른 54가지 버그 유형을 찾아냅니다)
- `/superpowers:verification-before-completion` 실행 **전**에 실행하세요(수정이 동작하는지 검증합니다)
- `/superpowers:test-driven-development`로 이어집니다 — 여기서 찾은 모든 버그에는 테스트가 추가되어야 합니다

---

## 예시: 이 스킬의 계기가 된 버그

**ThreadList.tsx "New Email" 버튼:**
```
onClick={() => {
  useEmailStore.getState().setComposeMode(true)   // ✓ sets composeMode = true
  useEmailStore.getState().selectThread(null)      // ✗ RESETS composeMode = false
}}
```

저장소 정의:
```
selectThread: (thread) => set({
  selectedThread: thread,
  selectedThreadId: thread?.id ?? null,
  messages: [],
  drafts: [],
  selectedDraft: null,
  summary: null,
  composeMode: false,     // ← THIS silent reset killed the button
  composeData: null,
  redraftOpen: false,
})
```

**체계적인 디버깅이 놓친 이유:**
- 버튼에는 onClick 핸들러가 있다(죽은 코드가 아니다)
- 두 함수 모두 존재한다(누락된 연결이 아니다)
- 어느 함수도 충돌하지 않는다(런타임 오류가 아니다)
- 데이터 타입도 올바르다(타입 불일치가 아니다)

**클릭 경로 감사가 잡아낸 이유:**
- 1단계에서 `selectThread`가 `composeMode`를 재설정한다는 것을 매핑했다
- 2단계에서 핸들러를 추적했다: 첫 호출은 true로 설정하고, 두 번째 호출은 false로 되돌린다
- 판정: 순차적 되돌리기 — 최종 상태가 버튼의 의도와 모순된다
