# Animation Standards Reference (애니메이션 기준 참조)

리뷰의 정확한 값, 커브, 규칙이다. 발견 사항에서는 근사하지 말고 이 값을 인용한다. Emil Kowalski의 디자인 엔지니어링 철학에서 추출했다.

## Should it animate? (애니메이션해야 하는가?) (빈도 표)

| 빈도 | 결정 |
| --- | --- |
| 하루 100회 이상 (키보드 단축키, 커맨드 팔레트 토글) | 애니메이션 없음. 절대. |
| 하루 수십 회 (호버 효과, 목록 탐색) | 제거하거나 크게 줄인다 |
| 가끔 (모달, 드로어, 토스트) | 표준 애니메이션 |
| 드물게 / 처음 한 번 (온보딩, 피드백, 축하) | 딜라이트를 더할 수 있다 |

**키보드로 시작하는 동작에는 애니메이션을 주지 않는다.** 하루에 수백 번 반복되며, 애니메이션은 그것을 느리고 동떨어져 보이게 만든다. (Raycast에는 열기/닫기 애니메이션이 없다. 하루에 수백 번 쓰는 것에는 그것이 올바르다.)

모션의 타당한 목적: 공간적 일관성, 상태 표시, 설명, 피드백, 거슬리는 변화 방지. 자주 보는 요소에 대한 "멋있어 보인다"는 타당하지 않다.

## Easing (이징)

결정 순서:
- 진입 또는 퇴장 → **`ease-out`** (처음이 빨라서 반응이 좋게 느껴진다)
- 화면에서 움직이거나 모프 → **`ease-in-out`**
- 호버 / 색 변화 → **`ease`**
- 일정한 움직임(마퀴, 진행 바) → **`linear`**
- 기본값 → **`ease-out`**

**UI에는 `ease-in`을 절대 쓰지 않는다.** 처음이 느려서 사용자가 가장 주목하는 순간을 늦춘다. `ease-out`이 200ms일 때 `ease-in`이 200ms보다 *빠르게* 느껴진다.

내장 CSS 이징은 너무 약하다. 강한 커스텀 커브를 쓴다.

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);        /* strong ease-out for UI */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* strong ease-in-out for on-screen movement */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);     /* iOS-like drawer curve (Ionic) */
```

커브는 [easing.dev](https://easing.dev/)나 [easings.co](https://easings.co/)에서 찾는다. 처음부터 직접 만들지 않는다.

## Duration (지속 시간)

| 요소 | 지속 시간 |
| --- | --- |
| 버튼 누름 피드백 | 100–160ms |
| 툴팁, 작은 팝오버 | 125–200ms |
| 드롭다운, 셀렉트 | 150–250ms |
| 모달, 드로어 | 200–500ms |
| 마케팅 / 설명용 | 더 길어도 됨 |

**규칙: UI 애니메이션은 300ms 아래로 유지한다.** 180ms 드롭다운은 400ms보다 반응이 빠르게 느껴진다. 스피너가 빠르면 실제 시간이 같아도 로딩이 빠르게 느껴진다. 첫 번째 이후의 툴팁을 즉시 나타나게 하면(지연과 애니메이션 건너뛰기) 툴바가 더 빠르게 느껴진다.

## Physicality (물리성)

- **`scale(0)` 금지.** `scale(0.9–0.97)` + `opacity: 0`에서 시작한다. 현실 세계에서 아무것도 없는 곳에서 나타나는 것은 없다.
- **기준점을 인식하는 팝오버.** 가운데가 아니라 트리거에서 scale한다:
  ```css
  .popover { transform-origin: var(--transform-origin); } /* Base UI */
  ```
  **모달은 예외다** — 뷰포트 가운데에 나타나므로 `transform-origin: center`를 유지한다.
- **누름 피드백.** `:active`에서 `transform: scale(0.97)`, `transition: transform 160ms ease-out`. 미묘하게(0.95–0.98). 누를 수 있는 모든 요소에 적용한다.

## Springs (스프링)

물리를 흉내 내기 때문에 자연스럽게 느껴진다. 고정된 지속 시간이 없고, 파라미터에 따라 안정된다. 다음에 쓴다: 관성이 있는 드래그, "살아 있는" 요소(Dynamic Island), 중단 가능한 제스처, 장식용 마우스 추적.

```js
// Apple-style (easier to reason about) — recommended
{ type: "spring", duration: 0.5, bounce: 0.2 }

// Traditional physics (more control)
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }
```

bounce는 미묘하게(0.1–0.3) 유지한다. UI에서는 대부분 bounce를 피하고, 드래그로 닫기와 장난스러운 상호작용에만 남긴다. 스프링은 중단되어도 속도를 유지한다(keyframes는 0에서 다시 시작한다). 그래서 사용자가 모션 도중에 되돌릴 수 있는 제스처에 이상적이다.

마우스 상호작용: 값을 마우스 위치에 직접 연결하지 말고 `useSpring`으로 보간한다(직접 연결은 인위적이며 관성이 없다). 이것은 모션이 장식일 때만 한다.

## Interruptibility (중단 가능성)

CSS **transition**은 애니메이션 도중에 중단되고 목표가 바뀔 수 있다. **keyframes**는 0에서 다시 시작한다. 빠르게 발동되는 것(추가되는 토스트, 토글)에는 transition이 더 부드럽다.

```css
/* Interruptible — good for dynamic UI */
.toast { transition: transform 400ms ease; }

/* Not interruptible — avoid for dynamic UI */
@keyframes slideIn { from { transform: translateY(100%); } to { transform: translateY(0); } }
```

JS 없이 진입할 때는 `@starting-style`을 쓴다.

```css
.toast {
  opacity: 1; transform: translateY(0);
  transition: opacity 400ms ease, transform 400ms ease;
  @starting-style { opacity: 0; transform: translateY(100%); }
}
```

구형 대체: `useEffect(() => setMounted(true), [])` + `data-mounted` 속성.

## Asymmetric timing (비대칭 타이밍)

사용자가 결정하는 곳은 느리게, 시스템이 응답하는 곳은 빠르게 한다.

```css
.overlay { transition: clip-path 200ms ease-out; }            /* release: fast */
.button:active .overlay { transition: clip-path 2s linear; }  /* press: slow, deliberate */
```

## Performance (성능)

- **`transform`과 `opacity`만 애니메이션한다** — 레이아웃과 페인트를 건너뛰고 GPU에서 실행된다. `padding`/`margin`/`height`/`width`/`top`/`left`는 세 가지 렌더링 단계를 모두 유발한다.
- **부모의 CSS 변수로 자식 transform을 구동하지 않는다** — 모든 자식의 스타일을 다시 계산한다. 요소에 `transform`을 직접 설정한다.
  ```js
  element.style.setProperty('--swipe-amount', `${d}px`); // bad: recalc on all children
  element.style.transform = `translateY(${d}px)`;        // good: only this element
  ```
- **Motion 단축 속성은 `motion` 14.2부터 하드웨어 가속된다.** 14.2 이전에는 `x`/`y`/`scale`이 rAF를 통해 메인 스레드에서 실행되어 부하 상황에서 프레임을 떨어뜨리므로, 그 버전에서는 업그레이드하거나 전체 transform 문자열을 쓴다. 레이아웃 애니메이션(`layout`, `layoutId`)은 모든 버전에서 메인 스레드에서 실행된다.
  ```jsx
  <motion.div animate={{ x: 100 }} />                          // motion 14.2+: hardware accelerated
  <motion.div animate={{ transform: "translateX(100px)" }} />  // hardware accelerated in every version
  ```
- **CSS 애니메이션은 부하 상황에서 JS보다 낫다** — 메인 스레드 밖에서 실행된다. rAF 기반 애니메이션은 브라우저가 로딩, 스크립트 실행, 페인트를 하는 동안 끊긴다. 사전에 정해진 모션에는 CSS를, 동적이고 중단 가능한 모션에는 JS를 쓴다.
- **WAAPI**는 CSS 성능으로 JS 제어를 준다(하드웨어 가속, 중단 가능, 라이브러리 불필요):
  ```js
  element.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }],
    { duration: 1000, fill: 'forwards', easing: 'cubic-bezier(0.77, 0, 0.175, 1)' });
  ```

## Transforms & clip-path (Transform과 clip-path)

- **`translate` 퍼센트**는 요소 자신의 크기를 기준으로 한다. `translateY(100%)`는 크기와 상관없이 요소의 높이만큼 움직인다(Sonner와 Vaul이 토스트와 드로어를 배치하는 방식). 하드코딩된 px보다 퍼센트를 선호한다.
- **`scale()`은 자식도 scale한다**(폰트, 아이콘, 내용). 누름 피드백에서는 장점이다.
- **3D**: `rotateX/Y` + `transform-style: preserve-3d`로 JS 없이 깊이, 궤도, 뒤집기를 만든다.
- **`clip-path: inset(t r b l)`**은 강력한 애니메이션 도구다. 각 값이 그 쪽에서 요소를 먹어 들어온다. 용도: 스크롤 공개(`inset(0 0 100% 0)` → `inset(0 0 0 0)`), 누르고 삭제하는 오버레이, 매끄러운 탭 색 전환(복제하고 활성 복사본을 클리핑), 비교 슬라이더.

## Gestures & drag (제스처와 드래그)

- **관성 닫기**: 거리 임계값을 넘도록 요구하지 않는다. 속도(`Math.abs(distance)/elapsedMs`)를 계산해서 `> ~0.11`이면 닫는다. 빠른 플릭만으로 충분해야 한다.
- **경계에서의 감쇠**: 자연스러운 가장자리를 넘어 끌면 더 많이 끌수록 덜 움직인다(실제 사물도 멈추기 전에 먼저 느려진다).
- **포인터 캡처**: 드래그가 시작되면 경계를 벗어나도 계속되도록 한다.
- **멀티터치 보호**: 드래그가 시작된 뒤의 추가 터치 지점은 무시한다(`if (isDragging) return`). 점프를 막는다.
- **단단한 정지보다 마찰**: 점점 커지는 저항과 함께 과한 드래그를 허용한다. 보이지 않는 벽을 두지 않는다.

## Masking imperfect crossfades (불완전한 크로스페이드 가리기)

이징과 지속 시간을 조정했는데도 크로스페이드에서 두 상태가 겹쳐 보이면, 전환 중에 은은한 `filter: blur(2px)`를 더해 두 상태를 하나의 인지된 변형으로 섞는다. blur는 20px 아래로 유지한다(강한 blur는 비싸며, 특히 Safari에서 그렇다).

## Stagger (스태거)

그룹 진입은 스태거한다. 항목 사이 30–80ms. 더 긴 지연은 느리게 느껴진다. 스태거는 장식이며, 재생 중에도 상호작용을 막지 않는다.

```css
.item { opacity: 0; transform: translateY(8px); animation: fadeIn 300ms ease-out forwards; }
.item:nth-child(2) { animation-delay: 50ms; }
.item:nth-child(3) { animation-delay: 100ms; }
@keyframes fadeIn { to { opacity: 1; transform: translateY(0); } }
```

## Accessibility (접근성)

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

Reduced motion은 애니메이션을 더 적고 부드럽게 만드는 것이지 0이 아니다. 이해를 돕는 트랜지션은 유지하고, 움직임과 위치 변화는 제거한다.

## Debugging (디버깅, 리뷰에서 느낌이 불확실할 때 권장)

- **느린 화면**: 지속 시간을 2–5배로 늘리거나 DevTools 애니메이션 인스펙터를 쓴다. 색이 깔끔하게 크로스페이드하는지, 이징이 갑자기 멈추지 않는지, `transform-origin`이 맞는지, 함께 움직이는 속성이 동기화되어 있는지 확인한다.
- **프레임 단위**: Chrome DevTools의 Animations 패널은 함께 움직이는 속성 사이의 타이밍 어긋남을 드러낸다.
- **실기기**: 제스처(드로어, 스와이프)는 실제 기기에서 확인한다. 휴대폰을 연결하고, IP로 개발 서버에 접속하고, Safari 원격 devtools를 쓴다.
- **다음 날 새로운 눈으로**: 개발 중에는 보이지 않던 불완전함이 나중에 드러난다.

## Cohesion (응집력)

모션을 컴포넌트의 성격에 맞춘다. 장난스러운 것은 더 튀어도 되고, 전문적인 대시보드는 간결하고 빨라야 한다. Sonner가 제대로 느껴지는 이유는 이징, 지속 시간, 디자인, 심지어 이름까지 조화를 이루기 때문이다. 우아하게 느껴지도록 약간 느리고 `ease-out`이 아니라 `ease`를 쓴다. 진입하거나 퇴장하는 목록의 opacity와 height는 시행착오다. 공식은 없으며 제대로 느껴질 때까지 조정한다.
