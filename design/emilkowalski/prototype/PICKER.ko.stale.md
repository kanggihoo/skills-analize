# 피커

피커의 모양은 **디자인 결정 사항이 아닙니다.** 아래 명세가 정답입니다. 마크업, CSS, 연결 코드를 그대로 복사합니다. 실행마다 바뀌는 값은 변형 이름과 개수뿐입니다. 모든 프로젝트에서 피커를 똑같이 유지해야 디자인을 평가하는 대상이 아니라 하네스의 크롬으로 읽힙니다. 프로젝트의 토큰, 글꼴, 색상으로 피커를 다시 꾸미지 않습니다.

피커는 화면 아래 중앙에 놓인 어두운 떠 있는 pill입니다. 어두운 유리는 밝은 페이지와 어두운 페이지 모두 위에 잘 보이므로 테마에 따라 바꾸지 않습니다.

## 마크업

미끄러지는 강조 표시 span이 먼저 오고, 변형마다 버튼 하나, 가는 구분선, 다시 실행할 애니메이션이 있는 변형이 최소 하나일 때만 다시 재생 버튼이 옵니다.

```html
<nav class="proto-picker" aria-label="Prototype variants">
  <span class="proto-picker-highlight" aria-hidden="true"></span>
  <button class="proto-picker-item" data-active aria-current="true">Quiet</button>
  <button class="proto-picker-item">Editorial</button>
  <button class="proto-picker-item">Playful</button>
  <span class="proto-picker-divider" aria-hidden="true"></span>
  <button class="proto-picker-item proto-picker-replay" aria-label="Replay animation (R)">↻</button>
</nav>
```


프레임워크를 사용하는 경우 클래스 이름과 구조는 그대로 두고 렌더링 문법만 바꿉니다.

## 스타일

```css
.proto-picker {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(10, 10, 10, 0.82);
  -webkit-backdrop-filter: blur(12px) saturate(1.4);
  backdrop-filter: blur(12px) saturate(1.4);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08) inset,
    0 8px 24px rgba(0, 0, 0, 0.24),
    0 2px 6px rgba(0, 0, 0, 0.12);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 13px;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  -webkit-user-select: none;
}

.proto-picker-highlight {
  position: absolute;
  top: 4px;
  left: 0;
  height: 28px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  will-change: transform;
}

/* The slide is enabled only after first paint (data-ready), so load doesn't animate. */
.proto-picker[data-ready] .proto-picker-highlight {
  transition:
    transform 250ms cubic-bezier(0.23, 1, 0.32, 1),
    width 250ms cubic-bezier(0.23, 1, 0.32, 1);
}

@media (prefers-reduced-motion: reduce) {
  .proto-picker[data-ready] .proto-picker-highlight { transition: none; }
}

.proto-picker-item {
  position: relative; /* sits above the highlight */
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font: inherit;
  cursor: pointer;
  transition: color 150ms ease-out;
}

.proto-picker-item:hover {
  color: rgba(255, 255, 255, 0.85);
}

.proto-picker-item:active {
  transform: scale(0.97);
}

.proto-picker-item:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.4);
  outline-offset: 2px;
}

.proto-picker-item[data-active] {
  color: #fff;
}

.proto-picker-divider {
  width: 1px;
  height: 16px;
  margin: 0 4px;
  background: rgba(255, 255, 255, 0.12);
}

.proto-picker-replay {
  padding: 0 10px;
  font-size: 14px;
}

.proto-picker[data-position="top"] {
  bottom: auto;
  top: 24px;
}
```


## 규칙

- **원문 그대로 사용합니다.** 다음 값이 명세입니다. 프로젝트 글꼴, 브랜드 색상, 테마 전환, 추가 그림자나 테두리를 적용하지 않습니다.
- **강조 표시만 슬라이드하고 변형 교체는 즉시 이루어집니다.** 활성 pill은 피커 자체에 공간 피드백을 주기 위해 버튼 사이를 애니메이션합니다(250ms, 강한 ease-out). 미리보기 변형은 트랜지션 없이 바뀝니다. `width` 트랜지션은 transform/opacity 원칙에서 의도적으로 허용한 예외입니다. 요소가 높이 28px이고 절대 위치이며 레이아웃에 영향을 받는 자식이 없어 페인트 비용이 작습니다.
- **수정 가능한 경우는 한 가지뿐입니다.** 변형이 화면 아래 중앙 영역(토스트 묶음, 바텀 시트, dock)을 차지한다면 `data-position="top"`을 설정해 피커가 작업을 가리지 않게 합니다. 그 외의 위치나 스타일은 바꾸지 않습니다.
- **다시 재생은 조건부입니다.** 진입 애니메이션이나 다시 실행할 상태 애니메이션이 변형 중 하나 이상에 있을 때만 replay 버튼과 구분선을 표시합니다. 정적인 비교라면 pill을 더 짧게 만듭니다.

## 동작 계약

하네스 구현 방식과 관계없이 다음 동작을 지켜야 합니다.

- 숫자 키 `1–N`과 `←` / `→`로 변형을 바꾸고 `R`로 다시 재생합니다. 포커스가 input, textarea, select, contenteditable 안에 있거나 수정 키를 누른 상태라면 키 이벤트를 무시합니다.
- 항목을 클릭하면 해당 변형을 선택합니다. 항상 정확히 하나의 항목에 `data-active`와 `aria-current="true"`가 있어야 하고 강조 표시가 해당 항목으로 움직입니다.
- 선택 상태는 URL 매개변수(`?v=2`)를 통해 새로고침 후에도 유지하고, 값이 없으면 1번 변형을 선택합니다. 강조 표시는 처음에는 애니메이션하지 않고 첫 페인트 뒤 `data-ready`를 추가합니다.
- 변형을 선택하면 해당 변형을 다시 마운트해 진입 애니메이션을 재실행합니다. replay 키는 선택을 바꾸지 않고 현재 변형만 다시 마운트합니다.

## 기준 연결 코드

단독 HTML 경로에서는 아래 코드를 그대로 사용합니다. 프레임워크에서는 동작을 유지하되 해당 방식에 맞게 표현합니다(예: `innerHTML` 대신 state, `requestAnimationFrame` 대신 key를 바꿔 다시 마운트, 강조 표시 측정에는 ref와 layout effect).

```js
// `variants` is an array of render functions, one per variant, in picker order.
const stage = document.getElementById('stage');
const picker = document.querySelector('.proto-picker');
const highlight = picker.querySelector('.proto-picker-highlight');
const items = [...picker.querySelectorAll('.proto-picker-item:not(.proto-picker-replay)')];
const replay = picker.querySelector('.proto-picker-replay');
let current = 0;

function moveHighlight() {
  const el = items[current];
  highlight.style.width = el.offsetWidth + 'px';
  highlight.style.transform = `translateX(${el.offsetLeft}px)`;
}

function mount(i) {
  stage.innerHTML = '';
  // Clear first, render next frame, so entrance animations re-run.
  requestAnimationFrame(() => { stage.innerHTML = variants[i](); });
}

function setActive(i) {
  if (i < 0 || i >= variants.length) return;
  current = i;
  items.forEach((el, j) => {
    el.toggleAttribute('data-active', j === i);
    if (j === i) el.setAttribute('aria-current', 'true');
    else el.removeAttribute('aria-current');
  });
  moveHighlight();
  const url = new URL(location);
  url.searchParams.set('v', i + 1);
  history.replaceState(null, '', url);
  mount(i);
}

items.forEach((el, i) => el.addEventListener('click', () => setActive(i)));
replay?.addEventListener('click', () => mount(current));
window.addEventListener('resize', moveHighlight);

document.addEventListener('keydown', (e) => {
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const num = parseInt(e.key, 10);
  if (num >= 1 && num <= variants.length) setActive(num - 1);
  else if (e.key === 'ArrowRight') setActive((current + 1) % variants.length);
  else if (e.key === 'ArrowLeft') setActive((current - 1 + variants.length) % variants.length);
  else if (e.key === 'r' || e.key === 'R') mount(current);
});

setActive((parseInt(new URLSearchParams(location.search).get('v'), 10) || 1) - 1);
// Enable the slide only after first paint, so load doesn't animate.
requestAnimationFrame(() => requestAnimationFrame(() => picker.setAttribute('data-ready', '')));
```

