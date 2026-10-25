# 애니메이션 레시피

자주 등장하는 사례를 바로 구현할 수 있는 예제입니다. 레시피를 바탕으로 조정하고, 처음부터 다시 만들지 마세요.

곡선은 SKILL.md에 정의된 `--ease-out`, `--ease-in-out`, `--ease-drawer` 토큰을 사용합니다.

---

## 버튼 누르기

누를 수 있는 모든 요소에 적용합니다. 인터페이스가 사용자의 입력을 인식했다는 즉각적인 피드백을 줍니다.

```css
.button {
  transition: transform 160ms var(--ease-out);
}

.button:active {
  transform: scale(0.97);
}
```

`scale()`은 자식 요소도 함께 확대하거나 축소합니다. 레이블과 아이콘도 따라 움직이므로 실제로 눌리는 듯한 느낌이 납니다.

여기에는 호버 게이팅이 필요하지 않습니다. `:active`는 터치에서 실제 누름 동작입니다. `:hover` 스타일은 별도로 제한하세요.

---

## 드롭다운, 팝오버, 메뉴, 선택 상자

허공에서 나타나는 것이 아니라 트리거에서 커지며 나옵니다.

```css
.popover {
  transform-origin: var(--transform-origin); /* Base UI supplies this */
  transition:
    opacity 200ms var(--ease-out),
    transform 200ms var(--ease-out);
}

.popover[data-starting-style],
.popover[data-ending-style] {
  opacity: 0;
  transform: scale(0.95);
}
```

핵심은 `transform-origin`입니다. 패널이 사용자가 클릭한 요소에서 나온 것처럼 보여야 합니다.

---

## 툴팁

팝오버와 같은 형태를 더 빠르게 적용하며, 많은 구현에서 놓치는 세부 동작도 포함합니다.

```css
.tooltip {
  transform-origin: var(--transform-origin);
  transition:
    transform 125ms var(--ease-out),
    opacity 125ms var(--ease-out);
}

.tooltip[data-starting-style],
.tooltip[data-ending-style] {
  opacity: 0;
  transform: scale(0.97);
}

/* Once one tooltip is open, neighbours open instantly */
.tooltip[data-instant] {
  transition-duration: 0ms;
}
```

초기 지연은 실수로 툴팁이 나타나는 것을 막습니다. 그 뒤에는 지연과 애니메이션을 모두 건너뛰면 도구 모음 전체가 더 빠르게 느껴집니다.

---

## 모달

중앙에 머무는 유일한 팝오버입니다.

```css
.modal {
  transform-origin: center; /* exempt — not anchored to a trigger */
  transition:
    opacity 250ms var(--ease-out),
    transform 250ms var(--ease-out);
}

.modal[data-starting-style],
.modal[data-ending-style] {
  opacity: 0;
  transform: scale(0.96);
}

.backdrop {
  transition: opacity 250ms var(--ease-out);
}
```

배경도 함께 투명도를 애니메이션해 모달과 배경이 하나의 표면처럼 느껴지게 합니다.

---

## 드로어 / 시트

```css
.drawer {
  transform: translateY(0);
  transition: transform 500ms var(--ease-drawer);
}

.drawer[data-closed] {
  transform: translateY(100%);
}
```

Vaul은 드로어가 나타나기 전에 이 방식으로 숨깁니다.

드래그 동작을 추가하면 제스처 문제도 다뤄야 합니다. 아래의 **드래그해서 닫기**를 참고하세요.

---

## 토스트

```css
.toast {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity 400ms ease,
    transform 400ms ease;

  @starting-style {
    opacity: 0;
    transform: translateY(100%);
  }
}
```

- `ease-out` 대신 `ease`를 사용합니다. 일반적인 UI보다 조금 느립니다. Sonner의 우아한 인상은 움직임을 보편적인 UI 예산이 아니라 컴포넌트의 개성에 맞게 조정한 데서 일부 비롯됩니다.
- `@starting-style`을 사용할 수 없다면 마운트 플래그를 대안으로 씁니다.

```jsx
useEffect(() => { setMounted(true); }, []);
// <div data-mounted={mounted}>
```

토스트가 쌓여 목록이 재배치될 때는 투명도 변화와 높이 변화가 서로 영향을 줍니다. 두 변화를 조정할 공식은 없습니다. 자연스럽게 느껴질 때까지 조정한 다음, 다음 날 다시 확인하세요.

---

## 아코디언 / 접기

```css
.content {
  overflow: hidden;
  transition:
    height 200ms var(--ease-out),
    opacity 200ms var(--ease-out);
}
```

짧게 유지하세요. 프레임마다 레이아웃을 다시 계산해야 하는 몇 안 되는 애니메이션 중 하나이므로, 지속 시간이 길면 느려질 뿐 아니라 비용도 커집니다. `auto`로 애니메이션하는 대신 JS로 콘텐츠 높이를 측정하거나, 높이를 제공하는 헤드리스 프리미티브를 사용하세요.

---

## 그룹 진입에 시차 주기

사용자가 가끔 보는 목록이나 그리드에 사용하세요. 하루 종일 지나치며 스크롤하는 목록에는 사용하지 마세요.

```css
.item {
  opacity: 0;
  transform: translateY(8px);
  animation: fadeIn 300ms var(--ease-out) forwards;
}

.item:nth-child(2) { animation-delay: 50ms; }
.item:nth-child(3) { animation-delay: 100ms; }
.item:nth-child(4) { animation-delay: 150ms; }

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

시차는 장식입니다. 애니메이션이 재생되는 동안 상호작용을 절대로 막아서는 안 됩니다.

---

## 길게 눌러 확인

단순 클릭만으로 실행하기에는 실수로 작동할 가능성이 높은 파괴적 작업에 사용합니다.

```css
.overlay {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 200ms var(--ease-out); /* release: snappy */
}

.button:active .overlay {
  clip-path: inset(0 0 0 0);
  transition: clip-path 2s linear;             /* press: slow and deliberate */
}

.button:active {
  transform: scale(0.97);
}
```

여기서는 `linear`가 맞습니다. 채워지는 애니메이션은 진행 상태를 나타내므로 속도가 완화되어서는 안 됩니다.

---

## 색상 전환이 있는 탭 표시기

탭 목록의 색상 전환을 각각 타이밍에 맞춰 조정하면 좀처럼 자연스러워지지 않습니다. 대신 클립을 사용하세요.

탭 목록을 복제합니다. 복사본에는 다른 배경과 텍스트 색상으로 활성 상태를 지정합니다. 복사본을 잘라 활성 탭만 보이게 하고, 탭이 바뀔 때 클립을 애니메이션합니다.

```css
.tabs-active-copy {
  clip-path: inset(0 60% 0 20%); /* driven by the active tab's position */
  transition: clip-path 250ms var(--ease-in-out);
}
```

두 가지 색상을 보간하는 대신 하나의 요소를 드러내기 때문에 텍스트와 배경이 완벽하게 동기화되어 함께 바뀝니다.

---

## 스크롤 진입 효과

마케팅 페이지에만 사용하세요. 사용자가 매일 방문하는 기능성 UI에는 적용하지 마세요.

```css
.reveal {
  clip-path: inset(0 0 100% 0);
  transition: clip-path 600ms var(--ease-in-out);
}

.reveal[data-visible] {
  clip-path: inset(0 0 0 0);
}
```

`IntersectionObserver` 또는 Motion의 `useInView`와 `{ once: true, margin: "-100px" }`를 사용해 실행하세요. 한 번만 실행합니다. 스크롤할 때마다 다시 애니메이션하면 인터페이스가 읽는 사람과 맞서게 됩니다.

---

## 드래그해서 닫기

제스처 레시피입니다. 사용자가 움직임 도중에 방향을 바꿀 수 있으므로 지속 시간이 아니라 스프링을 사용합니다.

```js
// Dismiss on a flick, not just on distance
const timeTaken = Date.now() - dragStartTime.current;
const velocity = Math.abs(swipeAmount) / timeTaken;

if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) {
  dismiss();
}
```

```js
// Set transform on the dragged element directly.
// Driving it through a CSS variable on the parent recalcs styles for every child.
element.style.transform = `translateY(${distance}px)`;
```

좋은 드래그와 나쁜 드래그를 가르는 네 가지 세부 사항:

- **드래그가 시작되면 포인터 캡처**를 사용해 포인터가 요소의 경계를 벗어나도 드래그를 계속합니다.
- **멀티터치 보호**를 적용합니다. 새 터치가 들어왔을 때 `if (isDragging) return`로 무시하거나, 드래그 도중 손가락을 바꾸지 않으면 요소가 갑자기 튀는 현상을 막을 수 있습니다.
- **경계 밖에서 감쇠**시킵니다. 자연스러운 경계를 넘어 끌수록 요소가 이동하는 거리를 줄입니다. 실제 물체는 멈추기 전에 속도가 줄어듭니다.
- **벽처럼 막지 말고 마찰을 적용**합니다. 초과 드래그를 거부하지 말고 저항을 높여 허용합니다.

중단된 드래그의 속도를 유지할 수 있도록 스프링으로 안착시킵니다.

```js
{ type: "spring", duration: 0.5, bounce: 0.2 }
```

---

## 자연스럽게 끝나지 않는 크로스페이드 마스킹

전환 중 두 상태가 눈에 띄게 겹치고 이징이나 지속 시간을 아무리 조정해도 해결되지 않는다면 경계선을 흐리게 하세요.

```css
.content {
  transition:
    filter 200ms ease,
    opacity 200ms ease;
}

.content.transitioning {
  filter: blur(2px);
  opacity: 0.7;
}
```

블러가 없으면 눈은 서로 다른 두 객체가 바뀌는 것으로 인식합니다. 블러는 두 객체를 하나의 변형으로 보이게 섞어 줍니다. 20px 미만으로 유지하세요. 강한 블러는 특히 Safari에서 비용이 큽니다.

---

## 라이브러리 없이 프로그래밍 방식으로 구현

모션을 JS로 제어해야 하지만 의존성은 추가하고 싶지 않을 때 WAAPI를 사용하면 CSS 수준의 성능을 얻을 수 있습니다.

```js
element.animate(
  [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }],
  { duration: 1000, fill: 'forwards', easing: 'cubic-bezier(0.77, 0, 0.175, 1)' }
);
```

하드웨어 가속, 중단 가능, 번들 비용 없음.
