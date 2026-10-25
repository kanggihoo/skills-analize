# 애니메이션 검토 기준 참조

검토의 근거가 되는 정확한 값, 곡선, 규칙을 정리했습니다. 어림잡지 말고 발견 사항에서 이 값을 인용합니다. Emil Kowalski의 디자인 엔지니어링 철학에서 추렸습니다.

## 애니메이션이 필요한가? (사용 빈도 표)

| 빈도 | 결정 |
| --- | --- |
| 하루 100회 이상(키보드 단축키, 커맨드 팔레트 토글) | 애니메이션하지 않음. 절대로. |
| 하루 수십 회(호버 효과, 목록 탐색) | 제거하거나 크게 줄임 |
| 가끔(모달, 드로어, 토스트) | 표준 애니메이션 |
| 드물게 / 처음 한 번(온보딩, 피드백, 축하) | 즐거움을 더할 수 있음 |

**키보드로 시작되는 동작에는 절대 애니메이션하지 않습니다.** 하루에도 수백 번 반복되는 동작에 애니메이션을 넣으면 느리고 사용자 입력과 단절된 느낌을 줍니다. Raycast에는 열기 / 닫기 애니메이션이 없습니다. 매일 수백 번 쓰는 기능에는 그게 맞습니다.

움직임의 정당한 목적은 공간적 일관성, 상태 표시, 설명, 피드백, 갑작스러운 변화 방지입니다. 자주 보는 요소에 “멋져 보여서”는 타당한 이유가 아닙니다.

## 이징

선택 순서:

- 진입 또는 퇴장 → **`ease-out`**(빠르게 시작해 반응이 빠르게 느껴짐)
- 화면에서 이동 / 모핑 → **`ease-in-out`**
- 호버 / 색상 변경 → **`ease`**
- 일정한 움직임(마퀴, 진행 표시) → **`linear`**
- 기본값 → **`ease-out`**

**UI에서 `ease-in`을 절대 사용하지 않습니다.** 시작이 느려 사용자가 지켜보는 순간을 지연시킵니다. 200ms `ease-out`이 200ms `ease-in`보다 빠르게 느껴집니다.

내장 CSS 이징은 너무 약합니다. 강한 사용자 지정 곡선을 사용합니다.

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);        /* strong ease-out for UI */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* strong ease-in-out for on-screen movement */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);     /* iOS-like drawer curve (Ionic) */
```

곡선은 [easing.dev](https://easing.dev/) 또는 [easings.co](https://easings.co/)에서 찾습니다. 처음부터 직접 만들지 않습니다.

## 지속 시간

| 요소 | 지속 시간 |
| --- | --- |
| 버튼 누름 피드백 | 100–160ms |
| 툴팁, 작은 팝오버 | 125–200ms |
| 드롭다운, 선택 상자 | 150–250ms |
| 모달, 드로어 | 200–500ms |
| 마케팅 / 설명용 | 더 길어도 됨 |

**규칙: UI 애니메이션은 300ms 미만으로 유지합니다.** 180ms 드롭다운이 400ms보다 반응이 빠르게 느껴집니다. 스피너가 빨리 돌면 실제로 걸리는 시간은 같아도 로딩이 더 빠르게 느껴집니다. 첫 툴팁 뒤의 툴팁은 지연과 애니메이션을 생략해 도구 모음 전체를 빠르게 느끼게 합니다.

## 물리감

- **`scale(0)`은 절대 사용하지 않습니다.** `scale(0.9–0.97)` + `opacity: 0`에서 시작합니다. 현실 세계에서 아무것도 없는 곳에서 나타나는 것은 없습니다.
- **시작점이 트리거를 따르는 팝오버.** 중앙이 아니라 트리거에서 확대합니다.
  ```css
  .popover { transform-origin: var(--transform-origin); } /* Base UI */
  ```
  **모달은 예외입니다.** 뷰포트 중앙에 나타나므로 `transform-origin: center`를 유지합니다.
- **버튼 누름 피드백.** `:active`에 `transform: scale(0.97)`과 `transition: transform 160ms ease-out`을 적용합니다. 미묘한 범위(0.95–0.98)로 유지하며 모든 누를 수 있는 요소에 적용합니다.

## 스프링

물리 법칙을 흉내 내므로 자연스럽게 느껴집니다. 고정된 지속 시간은 없고 설정값에 따라 안착합니다. 관성이 있는 드래그, 살아 있는 느낌의 요소(Dynamic Island), 중단 가능한 제스처, 장식용 마우스 추적에 사용합니다.

```js
// Apple-style (easier to reason about) — recommended
{ type: "spring", duration: 0.5, bounce: 0.2 }

// Traditional physics (more control)
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }
```

바운스는 약하게(0.1–0.3) 유지합니다. 대부분의 UI에서는 피하고 드래그 닫기와 장난스러운 상호작용에 남겨 둡니다. 스프링은 중단 시 속도를 이어받지만 키프레임은 처음부터 다시 시작하므로 사용자가 움직임 중 방향을 바꿀 수 있는 제스처에 적합합니다.

마우스 상호작용에서는 값을 포인터 위치에 바로 연결하지 말고 `useSpring`으로 보간합니다(직접 연결하면 관성이 없어 인위적임). 장식용 움직임일 때만 사용합니다.

## 중단 가능성

CSS **트랜지션**은 애니메이션 중간에도 목표를 바꿀 수 있지만 **키프레임**은 처음부터 다시 시작합니다. 토스트 추가나 토글처럼 빠르게 실행되는 요소에는 트랜지션이 더 부드럽습니다.

```css
/* Interruptible — good for dynamic UI */
.toast { transition: transform 400ms ease; }

/* Not interruptible — avoid for dynamic UI */
@keyframes slideIn { from { transform: translateY(100%); } to { transform: translateY(0); } }
```

JS 없이 진입시킬 때는 `@starting-style`을 사용합니다.

```css
.toast {
  opacity: 1; transform: translateY(0);
  transition: opacity 400ms ease, transform 400ms ease;
  @starting-style { opacity: 0; transform: translateY(100%); }
}
```

레거시 대안: `useEffect(() => setMounted(true), [])` + `data-mounted` 속성.

## 시간 비대칭

사용자가 판단하는 구간은 느리게, 시스템이 반응하는 구간은 빠르게 합니다.

```css
.overlay { transition: clip-path 200ms ease-out; }            /* release: fast */
.button:active .overlay { transition: clip-path 2s linear; }  /* press: slow, deliberate */
```

## 성능

- **`transform`과 `opacity`만 애니메이션합니다.** 레이아웃 / 페인트를 건너뛰고 GPU에서 실행됩니다. `padding`/`margin`/`height`/`width`/`top`/`left`는 세 렌더링 단계를 모두 유발합니다.
- **부모 CSS 변수로 자식 transform을 제어하지 않습니다.** 모든 자식의 스타일을 다시 계산합니다. 요소에 `transform`을 직접 지정합니다.
    ```js
  element.style.setProperty('--swipe-amount', `${d}px`); // bad: recalc on all children
  element.style.transform = `translateY(${d}px)`;        // good: only this element
  ```
- **Framer Motion 축약 속성은 하드웨어 가속되지 않습니다.** `x`/`y`/`scale`은 메인 스레드의 rAF로 실행되어 부하가 있으면 프레임을 놓칩니다. 전체 transform 문자열을 사용합니다.
    ```jsx
  <motion.div animate={{ x: 100 }} />                          // drops frames under load
  <motion.div animate={{ transform: "translateX(100px)" }} />  // hardware accelerated
  ```
- **부하가 있을 때 CSS 애니메이션은 JS보다 유리합니다.** 메인 스레드 밖에서 실행되며, 브라우저가 로드 / 스크립트 / 페인트 작업을 하는 중에도 rAF 기반 애니메이션처럼 끊기지 않습니다. 미리 정해진 동작에는 CSS를, 동적이고 중단 가능한 움직임에는 JS를 사용합니다.
- **WAAPI**는 CSS 성능을 유지하며 JS로 제어할 수 있습니다(하드웨어 가속, 중단 가능, 라이브러리 불필요).
    ```js
  element.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }],
    { duration: 1000, fill: 'forwards', easing: 'cubic-bezier(0.77, 0, 0.175, 1)' });
  ```

## transform과 clip-path

- **`translate` 백분율**은 요소 자체 크기를 기준으로 합니다. 크기에 관계없이 `translateY(100%)`는 요소 높이만큼 움직입니다(Sonner / Vaul의 토스트와 드로어 배치 방식). 픽셀 고정보다 우선합니다.
- **`scale()`은 자식도 확대 / 축소**합니다(글꼴, 아이콘, 콘텐츠). 누름 피드백에서는 장점입니다.
- **3D:** `rotateX/Y` + `transform-style: preserve-3d`로 JavaScript 없이 깊이 / 궤도 / 뒤집기 효과를 구현합니다.
- **`clip-path: inset(t r b l)`**는 강력한 애니메이션 도구입니다. 각 값이 해당 변에서 요소를 잘라냅니다. 스크롤 진입(`inset(0 0 100% 0)` → `inset(0 0 0 0)`), 길게 눌러 삭제 오버레이, 매끄러운 탭 색상 전환(복제 후 활성 복사본 클립), 비교 슬라이더 등에 사용합니다.

## 제스처와 드래그

- **관성 기반 닫기:** 거리 임계값을 넘기도록 요구하지 말고 속도(`Math.abs(distance)/elapsedMs`)를 계산합니다. `> ~0.11`이면 닫습니다. 플릭만으로도 충분해야 합니다.
- **경계 감쇠:** 자연스러운 경계를 넘어 끌수록 요소의 움직임을 줄입니다(실제 물체는 멈추기 전에 느려짐).
- **포인터 캡처:** 드래그가 시작되면 포인터가 경계를 벗어나도 이어지도록 캡처합니다.
- **멀티터치 보호:** 드래그 시작 뒤 추가 터치 지점을 무시합니다(`if (isDragging) return`). 요소가 튀는 현상을 막습니다.
- **딱 막는 대신 마찰 적용** — 초과 드래그를 거부하지 말고 저항을 높여 허용합니다.

## 어색한 크로스페이드 가리기

이징과 지속 시간을 조정해도 크로스페이드에서 상태가 겹쳐 보이면 전환 중 은은한 `filter: blur(2px)`를 적용해 하나의 변형처럼 보이게 합니다. 블러는 20px 미만으로 유지합니다(강한 블러는 특히 Safari에서 비용이 큼).

## 시차

그룹 요소를 30–80ms 간격으로 진입시킵니다. 지연이 길면 느리게 느껴집니다. 시차는 장식이므로 재생 중 상호작용을 막으면 안 됩니다.

```css
.item { opacity: 0; transform: translateY(8px); animation: fadeIn 300ms ease-out forwards; }
.item:nth-child(2) { animation-delay: 50ms; }
.item:nth-child(3) { animation-delay: 100ms; }
@keyframes fadeIn { to { opacity: 1; transform: translateY(0); } }
```

## 접근성

```css
@media (prefers-reduced-motion: reduce) {
  .element { animation: fade 0.2s ease; } /* keep opacity/color, drop transform-based motion */
}
@media (hover: hover) and (pointer: fine) {
  .element:hover { transform: scale(1.05); } /* gate hover motion — touch fires false hovers on tap */
}
```

```jsx
const reduce = useReducedMotion();
const closedX = reduce ? 0 : '-100%';
```

움직임 줄이기는 애니메이션을 없애는 게 아니라 수와 강도를 낮추는 것입니다. 이해를 돕는 트랜지션은 유지하고 움직임 / 위치 변화는 제거합니다.

## 디버깅(느낌을 판단하기 어려울 때 검토 중 권장)

- **느린 재생:** 지속 시간을 2–5배로 늘리거나 DevTools 애니메이션 검사기를 사용합니다. 색상 크로스페이드, 갑작스러운 이징, `transform-origin`, 여러 속성 간 동기화를 확인합니다.
- **프레임 단위 확인:** Chrome DevTools Animations 패널에서 조율된 속성 사이의 타이밍 차이를 확인합니다.
- **제스처는 실제 기기에서 확인:** 드로어나 스와이프를 테스트하려면 휴대폰을 연결해 IP로 개발 서버에 접속하고 Safari 원격 개발자 도구를 사용합니다.
- **다음 날 새로운 눈으로 검토:** 개발 중 보이지 않던 결함이 드러납니다.

## 응집력

움직임을 컴포넌트의 성격과 맞춥니다. 장난스러운 요소는 더 튀어도 되지만 전문적인 대시보드는 명료하고 빨라야 합니다. Sonner는 이징, 지속 시간, 디자인, 이름까지 서로 어울려 적절하게 느껴집니다. 우아한 느낌을 위해 약간 느리게 움직이고 `ease-out` 대신 `ease`를 씁니다. 진입 / 퇴장 목록의 opacity와 height는 직접 시험하며 조정해야 합니다. 공식은 없습니다. 자연스러워질 때까지 맞춥니다.
