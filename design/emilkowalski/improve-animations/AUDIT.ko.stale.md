# Animation Audit Playbook (애니메이션 감사 플레이북)

여덟 가지 감사 범주, 각 범주에서 찾아야 할 것, 발견 사항과 계획에서 인용할 정확한 목표 값을 정리한다. Emil Kowalski의 디자인 엔지니어링 철학([emilkowal.ski](https://emilkowal.ski/))에서 추출했다. 여기 나온 값은 근사하지 말고 그대로 옮긴다.

## 1. Purpose & frequency (목적과 빈도)

모든 애니메이션은 "왜 이것이 움직이는가?"에 답해야 한다. 공간적 일관성, 상태 표시, 피드백, 설명, 거슬리는 변화 방지 중 하나여야 한다. 자주 보는 요소에 대한 "그냥 멋있어 보인다"는 목적이 아니다.

| 빈도 | 결정 |
| --- | --- |
| 하루 100회 이상 (키보드 단축키, 커맨드 팔레트 토글) | 애니메이션 없음. 절대. |
| 하루 수십 회 (호버 효과, 목록 탐색) | 제거하거나 크게 줄인다 |
| 가끔 (모달, 드로어, 토스트) | 표준 애니메이션 |
| 드물게 / 처음 한 번 (온보딩, 피드백, 축하) | 딜라이트를 더할 수 있다 |

찾아볼 것: 키보드로 시작하는 동작의 애니메이션, 열기/닫기 전환이 있는 커맨드 팔레트(Raycast에는 없으며, 이것이 올바르다), 자주 마주치는 목록 항목이나 호버 상태의 장식 모션. 가장 강력한 수정은 흔히 **애니메이션을 삭제하는 것**이다.

## 2. Easing & duration (이징과 지속 시간)

이징의 결정 순서:

- 진입 또는 퇴장 → **`ease-out`** (처음이 빨라서 반응이 좋게 느껴진다)
- 화면에서 움직이거나 모프 → **`ease-in-out`**
- 호버 / 색 변화 → **`ease`**
- 일정한 움직임(마퀴, 진행 바) → **`linear`**
- 기본값 → **`ease-out`**

**UI의 `ease-in`은 항상 발견 사항이다.** 처음이 느려서 사용자가 가장 주목하는 순간을 늦춘다. 내장 CSS 이징은 의도적인 모션에 너무 약하므로, 계획에서는 강한 커스텀 커브를 도입해야 한다(저장소의 관례에 맞춰 토큰으로).

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);        /* strong ease-out for UI */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* strong ease-in-out for on-screen movement */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);     /* iOS-like drawer curve */
```

지속 시간 예산 — **UI 애니메이션은 300ms 아래로 유지한다**:

| 요소 | 지속 시간 |
| --- | --- |
| 버튼 누름 피드백 | 100–160ms |
| 툴팁, 작은 팝오버 | 125–200ms |
| 드롭다운, 셀렉트 | 150–250ms |
| 모달, 드로어 | 200–500ms |
| 마케팅 / 설명용 | 더 길어도 됨 |

찾아볼 것: 어디에서든 `ease-in`, 진입에 쓰인 기본 `ease`/`linear`, UI 요소의 300ms 초과 지속 시간, 툴바의 모든 툴팁에 붙은 지연과 애니메이션(첫 번째 이후에는 즉시 나타나야 한다).

## 3. Physicality & origin (물리성과 기준점)

- **`scale(0)` 금지** — 현실 세계에서 아무것도 없는 곳에서 나타나는 것은 없다. 목표: `scale(0.9–0.97)` + `opacity: 0`.
- **팝오버, 드롭다운, 툴팁은 가운데가 아니라 트리거에서 scale된다**:
  ```css
  .popover { transform-origin: var(--transform-origin); } /* Base UI */
  ```
  **모달은 예외다** — 가운데에 나타나므로 `transform-origin: center`가 여기서는 올바르다. 발견 사항으로 보고하지 않는다.
- **누름 피드백**: `:active`에서 `transform: scale(0.97)`, `transition: transform 160ms ease-out`. 미묘하게(0.95–0.98) 준다.

찾아볼 것: `scale(0)`, 초기 transform이 없는 순수 페이드 진입, 트리거에 고정된 요소의 `transform-origin: center`(또는 아예 없음), 누름 피드백이 없는 누를 수 있는 요소.

## 4. Interruptibility (중단 가능성)

CSS **transition**은 애니메이션 도중에 현재 상태에서 목표를 다시 잡고, **keyframes**는 0에서 다시 시작한다. 빠르게 발동되거나 애니메이션 도중에 되돌릴 수 있는 것(쌓이는 토스트, 토글, 드래그, 펼치기/접기)은 transition이나 스프링을 써야 한다.

- JS 없는 진입: `@starting-style` (구형 대체: `useEffect`에서 설정하는 `data-mounted` 속성).
- 제스처로 구동되는 모션은 스프링을 써야 한다. 중단될 때 속도를 유지하기 때문이다.
- 스프링 설정, Apple 방식(권장): `{ type: "spring", duration: 0.5, bounce: 0.2 }`. bounce는 미묘하게(0.1–0.3) 유지한다. 눈에 띄는 bounce는 드래그로 닫기와 장난스러운 순간에만 남긴다.
- **비대칭 타이밍**: 의도적인 단계(누르기, 길게 누르기, 파괴적 확인)는 더 느리게 애니메이션하고, 시스템의 응답은 빠르게 끊어 준다. 누르기와 떼기에 대칭적인 타이밍을 두는 것은 발견 사항이다.

찾아볼 것: 토스트, 토글, 빠르게 발동되는 UI의 `@keyframes`, 고정 지속 시간 keyframes로 보간하는 제스처 핸들러, 속도 기반 닫기 없이 거리 임계값에만 의존하는 드래그(`Math.abs(distance)/elapsedMs > ~0.11`로 닫아야 하며 거리 임계값만 쓰면 안 된다), 점점 커지는 마찰 대신 드래그 경계에서의 단단한 정지.

## 5. Performance (성능)

- **`transform`과 `opacity`만 애니메이션한다.** `width`/`height`/`margin`/`padding`/`top`/`left`는 레이아웃 + 페인트 + 합성을 유발한다.
- **`transition: all`**은 의도하지 않은 속성을 GPU 밖에서 애니메이션하므로, 항상 발견 사항이다.
- **`motion` 14.2 이전의 Motion `x`/`y`/`scale` 단축 속성은 하드웨어 가속되지 않는다** — 메인 스레드에서 실행되어 부하 상황에서 프레임을 떨어뜨린다. 목표: 14.2+로 업그레이드하면 HTML 요소에서 가속된다. 그 이전 버전에서는 전체 transform 문자열, `animate={{ transform: "translateX(100px)" }}`를 쓴다. 레이아웃 애니메이션(`layout`, `layoutId`)은 모든 버전에서 여전히 메인 스레드에서 실행된다.
- **부모의 CSS 변수로 자식 transform을 구동하지 않는다** — 모든 자식의 스타일을 다시 계산한다. 요소에 `transform`을 직접 설정한다.
- CSS(및 WAAPI)는 부하 상황에서 rAF 기반 JS보다 낫다 — 사전에 정해진 모션에는 CSS를, 동적이고 제스처로 구동되는 모션에는 JS/스프링을 쓴다.
- 전환 중의 `filter: blur()`는 20px 아래로 유지한다 — 강한 blur는 비싸며, 특히 Safari에서 그렇다.

찾아볼 것: `transition: all`, 레이아웃 속성 애니메이션, 바쁜 페이지의 Motion 단축 속성(14.2 이전 버전), 바쁜 페이지의 레이아웃 애니메이션, 자식 transform을 구동하는 `setProperty('--x', …)`, CSS가 할 수 있는 일을 하는 rAF 루프.

## 6. Accessibility (접근성)

```css
@media (prefers-reduced-motion: reduce) {
  .element { animation: fade 0.2s ease; } /* keep opacity/color, drop movement */
}
@media (hover: hover) and (pointer: fine) {
  .element:hover { transform: scale(1.05); } /* touch fires false hovers on tap */
}
```

Reduced motion은 애니메이션을 더 적고 부드럽게 만드는 것이지 **0으로 만드는 것이 아니다**. 이해를 돕는 트랜지션은 유지하고 위치 변화는 제거한다. JS에서는 `useReducedMotion()`을 쓰고 transform 값을 분기한다.

찾아볼 것: `prefers-reduced-motion` 처리 없이 움직이는 모션, 게이팅되지 않은 `:hover` 모션, 모든 피드백을 없애 버리는 reduced-motion 구현.

## 7. Cohesion & tokens (응집력과 토큰)

- 모션은 제품의 성격과 맞아야 한다 — 장난스러운 것은 더 튀어도 되고, 대시보드는 간결하게 유지된다. 컴포넌트 사이에서 성격이 어긋나면 발견 사항이다.
- 커브와 지속 시간은 공유 토큰으로 두어야 한다. 거의 비슷한 cubic-bezier를 손으로 다섯 개 쓰는 것은 통합의 발견 사항이다.
- 모든 것이 한꺼번에 나타나는 그룹 진입은 **30–80ms 스태거**가 필요한 곳이다. 스태거는 장식이며, 상호작용을 막아서는 안 된다.
- 두 상태가 겹쳐 보이는 거슬리는 크로스페이드는 전환 중에 은은한 `filter: blur(2px)`로 가릴 수 있다.

찾아볼 것: 거의 같은 이징과 지속 시간의 중복, 차분한 앱에 있는 튀는 컴포넌트 하나, 스태거가 없는 목록/그리드 진입, 두 번 겹쳐 노출되는 크로스페이드.

## 8. Missed opportunities (놓친 기회)

추가하는 범주다. 애니메이션이 없지만 있어야 하는 곳을 찾는다.

- 순간 이동처럼 바뀌는 상태 변화(내용 교체, 레이아웃 점프)는 짧은 전환으로 거슬리는 변화를 막을 수 있다.
- 트리거에서 나타나는 패널처럼 공간적으로 연결된 UI에 어디서 왔는지 설명하는 모션이 없다.
- 첫 실행, 성공, 축하처럼 드물고 감정이 강한 순간이 허용된 딜라이트 예산을 전혀 쓰지 않는다.
- 이런 곳에 쓸 도구로서 `translate` 퍼센트(`translateY(100%)` = 요소 자신의 높이)와 `clip-path: inset()` 공개. 고정 픽셀 오프셋은 쓰지 않는다.

관찰한 실제 UX 이음새에 근거해서 최대 몇 개만 보고한다. 바라는 목록이 되지 않게 한다.
