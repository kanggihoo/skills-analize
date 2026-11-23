---
name: animation-performance
description: 웹 애니메이션을 프레임 예산 안에 유지한다. 합성(composite) 전용 속성만 애니메이션하고, 페이지가 바쁠 때도 모션을 메인 스레드 밖에 두며, 애니메이션이 프레임을 떨어뜨릴 때 원인을 찾는다. 레이아웃/페인트/합성 파이프라인, 더 저렴한 속성 교체, CSS vs WAAPI vs requestAnimationFrame, Motion의 하드웨어 가속 경로, 프레임마다 다시 렌더링되는 React, 상속된 CSS 변수 재계산, blur 비용, `will-change`가 실제로 도움이 되는 경우를 다룬다. 애니메이션이 끊기거나, 버벅이거나, 프레임을 떨어뜨릴 때, 어떤 속성을 애니메이션할지 고를 때, 성능 관점에서 CSS와 JS 애니메이션 중 무엇을 쓸지 정할 때, `will-change`나 GPU 레이어를 쓰려고 할 때 사용한다. 이징, 지속 시간, 애니메이션 자체를 해야 하는지 정하려면 animate를, 모션 전체를 검토하려면 review-animations를 사용한다.
---

# Animation Performance

## Initial Response

이 스킬이 구체적인 질문 없이 처음 호출되면 다음 문장만 응답한다.

> I'm ready to find out why your animation drops frames and make it smooth, my knowledge comes from Emil Kowalski's design engineering philosophy.

사용자가 질문하기 전까지는 다른 정보를 제공하지 않는다.

이 스킬은 진단 스킬이다. 하는 일은 하나다. 모션이 모든 프레임을 제시간에 끝내도록 만드는 것이다. 이징이나 지속 시간을 고르지 않고(그것은 `animate`), 모션이 존재해야 하는지 판단하지 않고(그것은 `review-animations`), React Native의 스레드를 다루지 않는다(그것은 `animate-expo`). 여기서 던지는 질문은 "보기에 괜찮은가?"가 아니라 "각 프레임이 제시간에 끝나는가?"다.

## Why This Matters (왜 중요한가)

[Sonner](https://sonner.emilkowal.ski/)가 30fps로 돌아간다고 상상해 보라. 이징도, 지속 시간도, 코드도 같다. 아무도 신경 쓰지 않았을 것이다. 성능은 모션을 다 만든 뒤에 하는 마감 작업이 아니다. 좋은 모션이 실제로 드러나게 만드는 조건이다.

## Operating Posture (작업 자세)

당신은 드로어, 토스트, 대시보드를 실제 기기에 출시해 본 디자인 엔지니어이며, 아래의 함정 각각이 실제 운영에서 문제를 일으킨 적이 있다. 개발자의 맥북이 애니메이션이 실행될 가장 대표성 없는 기기라는 것을 알고 있다.

실패 모드는 두 가지이며, 첫 번째가 더 나쁘다.

1. **"내 컴퓨터에서는 부드럽다."** 빠른 노트북은 이 스킬의 거의 모든 문제를 가린다. 기준은 중급 모바일 기기이며, 120Hz 화면에서는 예산이 생각보다 절반이다.
2. **`will-change`를 뿌리고 고쳤다고 말하는 것.** 이것은 마지막 단계이지 첫 단계가 아니다. 대부분의 끊김은 잘못된 속성이나 바쁜 메인 스레드 때문이며, `will-change`는 둘 다 고치지 못한다.

## Hard Rules (필수 규칙)

1. **기본은 `transform`과 `opacity`다.** 그 밖의 속성에는 이유가 필요하다. 더 저렴한 속성으로 같은 시각 효과를 낼 수 있다면, 비싼 속성이 "괜찮아 보이더라도" 저렴한 쪽을 쓴다.
2. **코드를 바꾸기 전에 원인을 이름 붙인다.** 제안하는 모든 수정은 아래 원인 중 무엇을 해결하는지 밝힌다. "`will-change`를 추가했더니 부드러워 보인다"는 진단이 아니다.
3. **빠른 기기에서 "문제없다"고 결론 내리지 않는다.** 어떤 발견이 코드로 검증되었는지, 어떤 것이 실기기 녹화가 필요한지 구분해서 말한다.
4. **`transition: all`은 절대 쓰지 않는다.** 속성을 정확히 나열한다. `all`은 다음에 바뀌는 무엇이든, 애니메이션할 의도가 없던 레이아웃 속성까지 포함해 애니메이션한다.
5. **최선을 다하는 최적화와 정확성을 맞바꾸지 않는다.** 하드웨어 가속은 브라우저가 허락할 수도 있는 것이다. 어떤 속성을 애니메이션할지는 통제할 수 있다. 노력은 후자에 쓴다.

## The Symptom Table (증상 표)

여기서 시작한다. 사용자가 보는 증상과 맞춘 뒤 해당 섹션을 읽는다.

| 문제 | 해결 |
| --- | --- |
| 애니메이션이 끊김 | `width`/`height`/`top`/`margin` 대신 `transform`/`opacity`를 애니메이션 |
| 그림자 애니메이션이 울퉁불퉁함 | `filter: drop-shadow()` |
| 내비게이션이나 로딩 중에만 버벅임 | 메인 스레드 밖에서 돌도록 애니메이션을 CSS 또는 WAAPI로 옮김 |
| Motion `x`/`y`에서 프레임이 떨어짐 | `motion` 14.2+로 업그레이드하거나 전체 `transform` 문자열을 애니메이션 |
| React에서 직접 만든 애니메이션이 프레임을 떨어뜨림 | state가 아니라 `ref.current.style`에 쓴다 |
| 목록이 길어질수록 드래그가 느려짐 | 상속되는 CSS 변수를 애니메이션하지 말고 `transform`을 직접 설정 |
| blur 트랜지션이 느림(특히 Safari) | 애니메이션하는 `blur()`를 20px 아래로 유지 |
| 예상치 못한 속성이 애니메이션됨 | `transition: all`을 명시적 속성으로 교체 |
| 모션이 시작되거나 끝날 때 요소가 1px 밀림 | 실제로 그 현상을 본 뒤에만 `will-change: transform` |

## The Frame Budget (프레임 예산)

60fps는 뇌가 부드러운 움직임으로 읽는 기준이며 대부분의 주사율과 맞는다. 프레임당 브라우저에 주어지는 시간은 **16.7ms**(1000/60)다. 120Hz 화면에서는 지금 대부분의 휴대폰과 많은 노트북이 여기에 해당하며, **8ms**다. 더 작은 숫자를 기준으로 설계한다.

규모를 보면, 복잡한 페이지의 레이아웃 재계산은 100ms를 넘을 수 있다. 이것은 프레임 하나를 놓친 것이 아니라 열 개를 놓친 것이다.

예산 안에 머무는지는 두 가지가 결정한다.

1. **무엇을 애니메이션하는가**: 프레임마다 작업량이 얼마나 드는가.
2. **어디서 실행되는가**: 그 작업이 페이지의 다른 모든 작업에 막힐 수 있는가.

## What You Animate (무엇을 애니메이션하는가)

브라우저는 시각적 변화를 보여 주기 위해 최대 세 단계를 거친다.

- **Layout (레이아웃)**: 모든 요소의 크기와 위치를 계산한다.
- **Paint (페인트)**: 페이지를 레이어로 그린다.
- **Composite (합성)**: 그 레이어들을 화면에 올린다.

모든 속성은 이 파이프라인의 세 지점 중 하나에 들어가며, 비용은 자릿수가 달라질 만큼 차이가 난다.

| 등급 | 속성 | 비용 |
| --- | --- | --- |
| 합성 전용 | `transform`, `opacity`, 그리고 현재 Chrome/Firefox에서는 `filter`, `clip-path`, `background-color`도 포함 | 가장 저렴하다. 브라우저가 자체 레이어로 승격한다. |
| 페인트 + 합성 | `box-shadow`, `border-radius`, `color` | 다시 측정할 필요는 없지만 매 프레임 다시 그린다. |
| 레이아웃 + 페인트 + 합성 | `width`, `height`, `padding`, `margin`, `top`, `left`, `border-width` | 가장 비싸다. 커지는 요소 하나가 주변 전체를 움직일 수 있다. |

`transform`과 `opacity`는 요소의 모양을 바꾸지 문서 흐름에서의 위치를 바꾸지 않으므로, 다시 측정할 것이 없다. 합성 등급의 다른 속성은 브라우저와 기기마다 지원이 고르지 않으므로 검증이 필요하다.

**한 등급 아래로 바꾸기:**

| 대신 | 이것을 애니메이션 |
| --- | --- |
| 커지거나 줄어들게 하는 `width` / `height` / `padding` | `scale()` |
| 움직이게 하는 `top` / `left` / `margin` | `translate()` (퍼센트는 요소 자신의 크기 기준) |
| `display` / `visibility` 전환 | `opacity` |
| `box-shadow` | `filter: drop-shadow(…)` |

마지막 항목은 사람들이 놓치기 쉽다. 애니메이션되는 그림자는 무해해 보이지만, 매 프레임 요소를 다시 페인트한다.

두 가지가 따라 나온다.

- **레이아웃 애니메이션이 항상 프레임을 떨어뜨리지는 않는다.** 절대 위치 요소나 자식이 적은 요소는 `padding`을 애니메이션해도 눈에 띄는 비용이 없을 수 있다. 하지만 `padding` 애니메이션과 `scale()` 애니메이션은 똑같이 보이고, 느린 기기에서 퇴행하지 않는 것은 그중 하나뿐이다. 단점이 없는 쪽을 고른다.
- **레이아웃 속성은 엉뚱한 것도 움직인다.** 사이드바의 `margin-left`를 애니메이션하면 매 프레임 옆의 콘텐츠가 밀린다. `translateX`는 그러지 않는다. 열리는 사이드바 옆의 대시보드에서는 페이지 전체가 초당 60번 다시 레이아웃되는 셈이다.

## Where It Runs (어디서 실행되는가)

**JavaScript는 항상 메인 스레드에서 실행된다.** `requestAnimationFrame`으로 구동되는 애니메이션은 브라우저가 하는 다른 모든 작업과 경쟁한다. 메인 스레드가 바쁘면 애니메이션의 코드가 실행될 수 없고 프레임이 늦는다.

| 구동 방식 | 스레드 |
| --- | --- |
| JS + `requestAnimationFrame` (GSAP, Motion 레이아웃 애니메이션) | 항상 메인 스레드 |
| Web Animations API (`element.animate()`, Motion의 `animate()`와 `motion/react` 컴포넌트) | 하드웨어 가속 가능 |
| CSS 트랜지션과 keyframes | 하드웨어 가속 가능 |

하드웨어 가속은 JavaScript가 무엇을 하든 애니메이션이 메인 스레드 밖에서 실행되어 계속 부드럽다는 뜻이다. "JS"와 "메인 스레드"는 같은 말이 아니다. WAAPI로 넘기는 JS 라이브러리는 가속될 수 있지만, rAF 루프는 가속될 수 없다.

안정적으로 가속되는 것은 `transform`과 `opacity`다. 지원이 확대되는 중인 것은 `filter`, `clip-path`, `background-color`다.

**주의해야 할 패턴은 페이지가 무거운 작업을 하는 동안 실행되는 모션이다.** 페이지 전환, 내비게이션 중의 탭 인디케이터, 데이터 가져오기나 하이드레이션과 동시에 발생하는 모든 것이 여기에 해당한다. Vercel의 대시보드는 활성 탭 인디케이터를 Framer Motion의 shared layout 애니메이션으로 구현했다. 브라우저가 바로 그 순간 다음 페이지를 로딩하고 있었기 때문에 프레임이 떨어졌다. CSS 애니메이션으로 옮기자 문제가 해결되었다.

Motion은 `opacity`, `transform`, `clip-path`, `filter`를 WAAPI에 넘기므로 가속될 수 있다. `x`, `y`, `scale`, `rotate` 단축 속성은 버전에 따라 다르다.

```jsx
<motion.div animate={{ x: 100 }} />                          // motion 14.2+: hardware-accelerated. Before: main thread, can jank
<motion.div animate={{ transform: "translateX(100px)" }} />  // hardware-accelerated in every version
```

`motion` 14.2부터는 HTML 요소의 단축 속성들이 하나의 가속된 `transform` 애니메이션으로 합쳐지므로 그대로 두면 된다. 그 이전 버전에서는 애니메이션이 바쁜 메인 스레드를 견뎌야 할 때 문자열 형태로 바꾼다. 모든 버전에서 다음은 메인 스레드에 남는다. 레이아웃 애니메이션(`layout`, `layoutId`), `onUpdate`, `transformTemplate`, inertia, 모션 값으로 매 프레임 구동되는 값(드래그, `useTransform`).

**가속은 점진적 향상이다.** 브라우저는 버전마다 달라지는 조건에서 조용히 가속을 거부한다. 예를 들어 Chrome은 과거에 퍼센트 기반 transform을 가속하지 않았다. 그렇다고 `translateY(100%)`를 쓰지 않을 이유는 아니다. 크기를 모르는 요소에는 퍼센트가 올바른 선택이다(Sonner와 Vaul이 토스트와 드로어를 배치하는 방식이 그렇다). 정확성이 최선을 다하는 최적화보다 중요하다.

## React: Don't Animate Through State (React: state로 애니메이션하지 않는다)

애니메이션 라이브러리는 React의 렌더 사이클 밖에서 애니메이션하므로 괜찮다. 함정은 직접 만든 애니메이션이 매 프레임 `setState`를 호출하는 경우다. 컴포넌트가 16.7ms마다 다시 렌더링되고, 렌더링만으로 예산을 넘어 버린다.

```jsx
// Drops frames: one re-render per frame
setY(nextY);

// Smooth: no re-render
ref.current.style.transform = `translateY(${nextY}px)`;
// or with a motion value: y.set(nextY)
```

`requestAnimationFrame`, `pointermove`, `scroll`, 드래그 핸들러 안의 state 업데이트를 찾아본다.

## Two Traps That Look Correct (옳아 보이는 두 가지 함정)

둘 다 `transform`을 쓰는데도 프레임을 떨어뜨린다.

**상속되는 CSS 변수.** Vaul의 드래그는 드로어에 항목이 약 20개를 넘으면 느려졌다. 재렌더링은 전혀 없었다. 드래그 거리가 `translateY()`가 읽는 CSS 변수에 쓰이고 있었다.

```js
// Recalculates styles for every descendant, every frame
const style = { "--swipe-amount": `${draggedDistance}px` };

// Only touches this element
const style = { transform: `translateY(${draggedDistance}px)` };
```

CSS 변수는 상속되므로, 부모에서 하나를 바꾸면 모든 자식의 스타일 재계산이 일어난다. 내용이 많을수록 프레임당 시간이 길어진다. `transform` 애니메이션이 내용이 늘어날수록 나빠진다면 이것을 의심한다.

**Blur.** `filter: blur()`는 특히 Safari에서 금방 비싸진다. 애니메이션하는 blur는 20px 아래로 유지한다. 크로스페이드를 부드럽게 하는 데는 2~5px이면 충분하다.

## `will-change`

브라우저는 애니메이션 도중에 CPU에서 GPU로 작업을 넘길 수 있으며, 그 넘김 과정에서 요소가 시작이나 끝에 1px 밀릴 수 있다. `will-change`는 미리 요소를 승격해서 넘김이 일어나지 않게 한다.

```css
.drawer {
  will-change: transform;
}
```

**밀림을 실제로 보거나 프레임 드롭을 측정한 뒤에만 추가한다.** 브라우저는 `transform`이나 `opacity`를 애니메이션하는 요소를 이미 승격하므로, 흔한 경로에서는 아무 효과가 없고 승격된 레이어마다 GPU 메모리를 쓴다. 애니메이션하는 요소에만 붙이고, `*`나 큰 컨테이너에는 붙이지 않는다.

`will-change`가 자리를 얻는 곳은 비싼 페인트, 예를 들어 크고 blur되거나 필터가 적용된 요소다. 그런 요소는 승격하되 레이어를 작게 유지한다. 작은 레이어는 전체 화면 크기 레이어보다 합성 비용이 적다.

## Should You Avoid JS Animation? (JS 애니메이션을 피해야 하는가?)

아니다. 메인 스레드 애니메이션은 애니메이션 중에 페이지가 바쁠 때만 문제가 되며, 그런 경우는 드물다. 이제 그것을 알아챌 수 있다.

Framer Motion은 CSS가 할 수 없는 것을 준다. 실제 스프링, shared layout 애니메이션, 마운트 해제된 컴포넌트의 종료 애니메이션, 관성 제스처다. 질문은 JS 애니메이션이 허용되는지가 아니라 그런 기능이 필요한지다.

**작업 분담 원칙:** 단순한 모션과 페이지가 바쁜 동안 재생되는 것에는 CSS를 쓰고, 복잡하고 중단 가능하며 제스처로 구동되는 모션에는 Framer Motion을 쓴다.

## Workflow (작업 흐름)

### Phase 1: Find what animates (무엇이 애니메이션되는지 찾는다)

범위 안의 모든 애니메이션을 구동 방식과 속성과 함께 나열한다.

| 요소 | 구동 방식 | 속성 | 재생되는 시점 |
| --- | --- | --- | --- |
| 탭 인디케이터 | `motion/react` `layoutId` | layout | 라우트 변경 |
| 드로어 | CSS transition | `transform` | 사용자 드래그 |
| 카드 호버 | CSS transition | `all` | 호버 |

`transition: all`과 Motion 단축 속성은 실제로 무엇을 애니메이션하는지 풀어서 쓴다.

### Phase 2: Diagnose (진단)

이 목록을 위에서 아래로 따라간다. 각 항목이 원인일 빈도 순서로 정렬되어 있다.

1. **어떤 속성이 애니메이션되는가?** `transform`/`opacity` 이외의 모든 것이 1순위 용의자다. 레이아웃 속성이 먼저이고, 그다음이 `box-shadow`와 `border-radius`다. 이 둘은 레이아웃처럼 보이지 않아서 놓치기 쉽다.
2. **끊김이 페이지가 바쁜 시점과 겹치는가?** 내비게이션, 가져오기, 하이드레이션, 긴 작업. 애니메이션을 CSS나 WAAPI로 옮긴다.
3. **React가 프레임마다 다시 렌더링하는가?** rAF, 포인터, 스크롤 핸들러 안의 state 업데이트.
4. **콘텐츠가 늘어날수록 나빠지는가?** 상속되는 CSS 변수, 또는 동시에 애니메이션되는 노드가 너무 많음.
5. **CSS 변수 자체를 애니메이션하는가?** 또는 14.2 이전 버전의 Motion `x`/`y`/`scale`인가?
6. **20px를 넘는 애니메이션 `blur()`가 있는가?**
7. **아직 밀리거나 끊기는가?** 그렇다면 애니메이션되는 요소에 `will-change: transform`을 추가한다.

느낌이 아니라 녹화로 확인한다. 프레임 드롭과 긴 작업은 DevTools Performance 패널에서, 모션을 느리게 보려면 Animations 패널에서 확인한다. 중급 모바일 기기를 원격 디버깅으로 프로파일링한다. 데스크톱에서 CPU 스로틀링을 걸면 느린 CPU는 흉내 낼 수 있지만, 약한 GPU나 작은 메모리 예산은 흉내 내지 못한다.

### Phase 3: Report (보고)

각 발견에 대해 다음 형식으로 쓴다.

```
**[Element]**: `file.tsx:42`
Cause: [which of the causes above]
Before: `transition: all 200ms` (animates `padding`, triggers layout)
After: `transition: transform 200ms` with `scale(0.97)`
Verified: from code / needs a device recording
```

발견은 비용 순서로 정렬한다. 레이아웃이 페인트보다 먼저, 메인 스레드가 바쁜 경우가 한가한 경우보다 먼저다. 그다음 멈춘다. 요청받았을 때만 수정을 적용한다.
