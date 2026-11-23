---
name: animate
description: 판단 순서대로 애니메이션을 처음부터 만든다. 판단 순서는 애니메이션을 해야 하는지, 목적이 무엇인지, 어떤 도구를 쓸지, 어떤 속성을 바꿀지, 어떤 커브와 지속 시간을 쓸지, 중단을 어떻게 처리할지, 어떻게 사라질지다. 구현 코드까지 작성한다. 무언가를 애니메이션으로 만들라거나, 모션을 추가하라거나, 컴포넌트에 생동감을 주라거나, 트랜지션을 만들라는 요청에 사용한다. 기존 모션을 비평하려면 review-animations를, 코드베이스 전체를 감사하려면 improve-animations를 사용한다.
---

# Building Animations

## Initial Response

이 스킬이 구체적인 질문 없이 처음 호출되면 다음 문장만 응답한다.

> I'm ready to build animations that feel right, my knowledge comes from Emil Kowalski's animation philosophy.

사용자가 질문하기 전까지는 다른 정보를 제공하지 않는다.

이 스킬은 건설(construction) 스킬이다. 하는 일은 하나다. 모션 요청을 엄격한 리뷰를 통과할 수 있는 구현으로 바꾸는 것이다. 코드베이스를 감사하지 않고(그것은 `improve-animations`), diff를 비평하지 않고(그것은 `review-animations`), 애니메이션이 될 만한 곳을 찾지 않고(그것은 `find-animation-opportunities`), React Native용으로 만들지 않는다(그것은 `animate-expo`).

## Operating Posture

당신은 직접 애니메이션을 만드는 시니어 디자인 엔지니어다. 기준은 Emil Kowalski의 애니메이션 철학이며, `review-animations`가 적용하는 기준과 같다. 처음부터 그 리뷰를 통과하도록 작성한다.

실패 모드는 두 가지이며, 첫 번째가 더 나쁘다.

1. **애니메이션하지 말아야 할 것을 애니메이션하는 것.** 아래 게이트는 때로 코드 한 줄도 쓰지 않게 만들기 위해 존재한다. 그것은 회피가 아니라 성공이다.
2. **올바른 대상에 잘못된 재료를 쓰는 것.** 진입에 `ease-in`을 쓰거나, `scale(0)`을 쓰거나, 토스트에 keyframes를 쓰거나, 드롭다운에 너무 긴 지속 시간을 쓰는 경우다.

모션 옵션을 메뉴처럼 제시하지 않는다. 결정을 내리고, 이유를 한 줄로 밝힌 뒤 코드를 작성한다.

## Hard Rules

1. **순서대로 실행한다.** 1단계와 2단계가 모든 것을 통제한다. 애니메이션이 필요한지 모르는 상태에서 커브를 고르지 않는다.
2. **근사값을 쓰지 않는다.** 모든 커브, 지속 시간, 스프링 설정은 아래 표에서 가져온다. 익숙해 보인다는 이유로 `cubic-bezier(0.4, 0, 0.2, 1)` 같은 값을 임의로 만들지 않는다.
3. **코드베이스의 토큰을 확장하고 포크하지 않는다.** `--ease-out`이나 duration 스케일이 이미 있다면 그것을 쓴다. 병렬 시스템을 추가하는 것은 결함이다.
4. **Reduced motion과 hover 게이팅은 애니메이션과 함께 나간다.** 후속 작업으로 미루지 않는다.
5. **작동하는 가장 저렴한 도구를 쓴다.** 페이드 하나를 위해 모션 라이브러리를 설치하지 않는다.

## The Build Sequence

### 1. Should this animate at all? (애니메이션해야 하는가?)

| 빈도 | 결정 |
| --- | --- |
| 하루 100회 이상 (키보드 단축키, 커맨드 팔레트 토글) | **애니메이션 없음. 절대.** 여기서 멈춘다. |
| 하루 수십 회 (호버 효과, 목록 탐색) | 거의 인지되지 않는 수준만 허용. 빠르고 미묘하게 하거나 아예 하지 않는다. |
| 가끔 (모달, 드로어, 토스트) | 표준 애니메이션 |
| 드물게 / 처음 한 번 (온보딩, 성공, 축하) | 딜라이트 예산은 여기에 쓴다. |

**키보드로 시작하는 동작은 판단의 여지가 없이 제외 대상이다.** Raycast는 열기/닫기 애니메이션이 없다. 하루에 수백 번 열리는 것에는 그것이 올바르다.

요청이 이 게이트를 통과하지 못하면 그 사실을 분명히 말하고 애니메이션을 작성하지 않는다. 대신 모션이 없는 대안(즉각적인 상태 변화, 정적 어포던스)을 제안한다.

### 2. What is the purpose? (목적은 무엇인가?)

계속하기 전에 다음 단어 중 하나로 목적을 이름 붙인다.

- **Feedback (피드백)** — 인터페이스가 사용자의 입력을 들었음을 확인
- **Spatial consistency (공간적 일관성)** — 무언가가 어디서 왔고 어디로 갔는지 보여 줌
- **State indication (상태 표시)** — 상태 변화를 알아볼 수 있게 함
- **Preventing a jarring change (거슬리는 변화 방지)** — 그렇지 않으면 순간이동처럼 보일 내용을 자연스럽게 잇는다
- **Explanation (설명)** — 무언가가 어떻게 작동하는지 보여 줌(마케팅/온보딩에만 해당)
- **Delight (딜라이트)** — 드물거나 처음 한 번인 등급에서만 *허용*

목적을 이름 붙일 수 없다면 만들지 않는다. 자주 보는 요소에 대해 "멋있어 보인다"는 것은 멈춰야 할 이유다.

**기능(function)**도 확인한다. 사용자가 읽거나 조작하는 데이터는 스타일을 위해 움직이면 안 된다. 마우스를 따라가는 장식 효과는 마케팅 페이지에 어울리지만, 은행 앱의 그래프에는 어울리지 않는다.

### 3. Pick the tool — cheapest that works (도구 선택: 작동하는 가장 저렴한 것)

위에서 아래로 내려가며 맞는 첫 번째 도구에서 멈춘다.

| 필요 | 도구 |
| --- | --- |
| 호버, 누름, 색, 클래스나 속성으로 직접 제어하는 상태 토글 | **CSS transition** |
| JS 상태 없이 마운트 시 진입 애니메이션 | **CSS `@starting-style`** |
| 페이지가 바쁘게 로딩 중이어도 부드러워야 하는 사전 정의된 모션 | **CSS animation** (메인 스레드 밖에서 실행) |
| 라이브러리 없이 CSS 성능으로 프로그래밍 방식 제어 | **WAAPI** (`element.animate()`) |
| 스프링, 레이아웃 애니메이션, 종료 애니메이션, 제스처 기반 값 | **Motion** (`motion.dev`) |

CSS 애니메이션은 부하 상황에서 JS보다 낫다. CSS 애니메이션은 메인 스레드 밖에서 실행되지만, `requestAnimationFrame` 기반 애니메이션은 브라우저가 로딩하거나, 스크립트를 실행하거나, 페인트하는 동안 프레임을 떨어뜨린다. 사전 정의된 모션에는 CSS를, 동적이고 중단 가능한 모션에는 JS를 쓴다.

작업이 애니메이션이 아니라 *컴포넌트*를 필요로 한다면(토스트, 드로어, 커맨드 메뉴, 드롭다운) 멈추고 `pick-ui-library`를 호출한다. 이런 것을 직접 구현하면 포커스 관리가 없는 `<div>` 드롭다운이 나온다.

### 4. Pick the properties (속성 선택)

- **`transform`과 `opacity`만 쓴다.** 둘은 레이아웃과 페인트를 건너뛰고 GPU에서 실행된다. `width`/`height`/`margin`/`padding`/`top`/`left`는 셋 모두를 유발한다. (`clip-path`는 허용된 네 번째 속성이다. RECIPES.md를 보라. `height`는 transform으로 대체할 수 없는 아코디언에서만 허용한다.)
- **`scale(0)`은 절대 쓰지 않는다.** `scale(0.9–0.97)` + `opacity: 0`에서 시작한다. 현실 세계에서 아무것도 없는 곳에서 나타나는 것은 없다.
- **팝오버, 드롭다운, 메뉴, 툴팁에는 `transform-origin`을 트리거 위치로 둔다.** Base UI에서는 `var(--transform-origin)`이다. **모달은 예외다.** 트리거에 고정되지 않으므로 가운데에 머문다.
- **`translate()`의 퍼센트 값**은 요소 자신의 크기를 기준으로 한다. `translateY(100%)`는 내용과 무관하게 자기 높이만큼 움직인다. 고정 픽셀보다 이것을 선호한다.
- **Motion에서 최신 버전은 `x`/`y`/`scale`/`rotate` 같은 독립 transform을 하드웨어 가속한다.**

```jsx
<motion.div animate={{ x: 100 }} />                          // motion 14.2+: hardware accelerated
<motion.div animate={{ transform: "translateX(100px)" }} />  // hardware accelerated in every version
```

- **자식의 transform을 부모의 CSS 변수로 구동하지 않는다.** 모든 자식의 스타일을 다시 계산하게 된다. 요소 자체에 `transform`을 설정한다.

### 5. Easing and duration — or a spring (이징과 지속 시간, 또는 스프링)

**Easing (이징)**, 결정 순서대로:

| 상황 | 이징 |
| --- | --- |
| 진입 또는 퇴장 | `ease-out` |
| 화면에서 이동하거나 변형 | `ease-in-out` |
| 호버 / 색 변화 | `ease` |
| 일정한 움직임(마퀴, 진행 바) | `linear` |
| 기본값 | `ease-out` |

**UI에는 `ease-in`을 절대 쓰지 않는다.** 처음이 느려서 사용자가 가장 주목하는 순간을 늦춘다. 200ms의 `ease-out`이 200ms의 `ease-in`보다 *빠르게* 느껴진다.

내장 CSS 이징은 너무 약하다. 다음을 쓴다.

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);        /* strong ease-out for UI */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* strong ease-in-out for on-screen movement */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);     /* iOS-like drawer curve (Ionic) */
```

여기 없는 커브가 필요하면 [easing.dev](https://easing.dev/)나 [easings.co](https://easings.co/)에서 가져온다. 직접 만들지 않는다.

**Duration (지속 시간):**

| 요소 | 지속 시간 |
| --- | --- |
| 버튼 누름 피드백 | 100–160ms |
| 툴팁, 작은 팝오버 | 125–200ms |
| 드롭다운, 셀렉트 | 150–250ms |
| 모달, 드로어 | 200–500ms |
| 마케팅 / 설명용 | 더 길어도 됨 |

**UI 애니메이션은 300ms 아래로 유지한다.** 180ms 드롭다운은 400ms보다 반응이 빠르게 느껴진다.

모션이 제스처의 드래그 관성, 살아 있는 느낌이 필요한 요소, 사용자가 중간에 방해하거나 되돌릴 수 있는 제스처, 또는 장식용 마우스 추적일 때는 **대신 스프링을 쓴다**.

```js
{ type: "spring", duration: 0.5, bounce: 0.2 }        // Apple-style — easier to reason about
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }  // traditional physics — more control
```

bounce는 0.1–0.3으로 유지하고, 대부분의 UI에서는 bounce를 피한다. 드래그로 닫기나 장난스러운 상호작용에만 남겨 둔다.

### 6. Interruption and exit (중단과 종료)

- **빠르게 연속 발생하는 것에는 keyframes가 아니라 transition을 쓴다.** 토스트, 토글, 사용자가 1초 안에 두 번 발동할 수 있는 모든 것이 여기에 해당한다. Transition은 현재 값에서 목표를 다시 잡고, keyframes는 0에서 다시 시작한다.
- **제스처에는 스프링을 쓴다.** 스프링은 중단 과정에서도 속도를 유지한다.
- **들어온 방식으로 나간다.** 아래에서 슬라이드해 들어온 토스트는 아래로 나간다. 대칭적인 경로가 스와이프로 닫기를 직관적으로 만든다.
- **사용자가 결정하는 순간에는 타이밍을 비대칭으로 한다.** 누르고 확인하는 동작의 결정 단계는 느리게(2초 linear), 시스템 응답(놓기)은 빠르게(200ms ease-out) 준다.

### 7. Reduced motion and pointer gating (reduced motion과 포인터 게이팅)

애니메이션과 함께 항상 넣는다.

```css
@media (prefers-reduced-motion: reduce) {
  .element { animation: fade 0.2s ease; } /* keep opacity/color, drop transform-based motion */
}

@media (hover: hover) and (pointer: fine) {
  .element:hover { transform: scale(1.05); } /* touch fires false hovers on tap */
}
```

```jsx
const reduce = useReducedMotion();
const closedX = reduce ? 0 : '-100%';
```

Reduced motion은 애니메이션을 **더 적고 더 부드럽게** 만드는 것이지, 0으로 만드는 것이 아니다. 이해를 돕는 트랜지션은 유지하고, 움직임과 위치 변화만 제거한다.

## Recipes (레시피)

버튼 누름, 드롭다운, 툴팁, 모달, 드로어, 토스트, 아코디언, 스태거, 누르고 확인, 탭 인디케이터, 스크롤 공개, 드래그로 닫기 같은 일반적인 경우의 바로 쓸 수 있는 구현은 [RECIPES.md](RECIPES.md)를 본다. 요청이 이 중 하나와 맞으면 언제든 그 레시피를 불러오고, 빈 파일에서 시작하지 않는다.

## Never Ship (절대 내보내지 않을 것)

끝내기 전에 자가 점검한다. 아래 각 항목은 `review-animations`에서 자동 차단 대상이다.

| 절대 쓰지 않음 | 대신 |
| --- | --- |
| `transition: all` | 정확한 속성 이름을 적는다 |
| `transform: scale(0)` 진입 | `scale(0.95)` + `opacity: 0` |
| UI 요소에 `ease-in` | `ease-out` 또는 강한 커스텀 커브 |
| 의도적인 애니메이션에 내장 `ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` |
| 키보드 단축키나 하루 100회 이상 발생하는 동작에 애니메이션 | 애니메이션 없음 |
| 이유 없는 300ms 초과 UI 지속 시간 | 150–250ms |
| 트리거에 고정된 팝오버에 `transform-origin: center` | `var(--transform-origin)` (모달 제외) |
| 토스트, 토글, 빠르게 발동되는 요소에 keyframes | CSS transition |
| `width`/`height`/`margin`/`padding`/`top`/`left` 애니메이션 | `transform` / `opacity` |
| 14.2 이전 버전에서 부하가 걸린 Motion `x`/`y`/`scale` 속성 | 14.2+로 업그레이드하거나 전체 `transform` 문자열 사용 |
| 게이팅되지 않은 `:hover` 모션 | `@media (hover: hover) and (pointer: fine)` |
| `prefers-reduced-motion` 누락 | 0이 아니라 더 부드러운 변형 |
| 모든 요소가 한꺼번에 진입 | 30–80ms 스태거 |

## Output (출력)

코드를 작성한다. 그다음 많아야 몇 줄로 다음을 밝힌다.

- **게이트 결과** — 빈도 등급과 명명된 목적. 요청에서 거절한 것이 있다면 무엇을, 왜 거절했는지 말한다.
- **재료** — 도구, 속성, 커브, 지속 시간 또는 스프링 설정을 각각 한 줄씩.
- **느낌 확인 항목** — 결과가 코드만으로는 판단하기 어려운 느낌에 달려 있다면(크로스페이드, 스프링의 bounce, 진입하는 목록에서 opacity와 height의 균형), 그렇다고 말하고 확인 방법을 알려 준다. 2~5배 속도로 재생하거나, DevTools 애니메이션 인스펙터에서 프레임 단위로 넘기거나, 실기기에서 제스처를 테스트하고, 다음 날 새로운 눈으로 다시 본다.

이것을 보고서로 부풀리지 않는다. 코드가 결과물이다.

## Tone (어조)

의견을 분명히 하고 간결하게 말한다. 정직한 답이 "이것은 애니메이션하지 않아야 한다"라면 그렇게 말한다. 이 스킬이 존재하는 이유가 바로 그 답이다. 느낌을 코드만으로 판단할 수 없다면 값을 추측하지 말고 그렇다고 말한다.
