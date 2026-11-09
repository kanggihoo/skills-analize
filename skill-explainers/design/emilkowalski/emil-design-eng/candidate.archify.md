# emil-design-eng 스킬은 에이전트를 어떻게 바꾸나 {#emil-design-eng-skill}

`emil-design-eng`를 쓰면 에이전트는 UI 코드를 짤 때와 리뷰할 때 Emil Kowalski의 판단 기준을 적용한다. 애니메이션은 코드를 쓰기 전에 네 질문(움직일지, 왜, 어떤 easing, 얼마나 빨리)에 차례로 답한다. UI 코드를 리뷰하면 지적을 반드시 `Before | After | Why` 표 하나로 낸다.[](source:ede-freq)[](source:ede-review)

- 켜지는 때: 호출 제한 필드가 없어 모델이 `description`을 참고해 켤 수 있다. 질문 없이 불리면 정해진 한 문장만 답하고 질문을 기다린다.[](source:ede-fm)[](source:ede-init)
- 강제하는 것: 리뷰 결과는 표로만 낸다. 키보드로 시작한 동작은 애니메이션하지 않는다. UI 애니메이션에 `ease-in`을 쓰지 않는다.[](source:ede-review)[](source:ede-freq)[](source:ede-easing)
- 수치 기준: UI 애니메이션은 300ms 미만, 버튼 누름은 `scale(0.97)`, stagger 간격은 30~80ms다.[](source:ede-dur)[](source:ede-button)[](source:ede-stagger)
- 쓰면 안 되는 때: 원문에 명시 없음. 같은 저자의 다른 스킬은 최악 데이터 검사와 모션 리뷰를 각자 맡는다고 선을 긋는다.[](source:bu-scope)

@answer scope="design/emilkowalski/emil-design-eng · 원본 텍스트 1개 27,509B · 커밋 4e3fc89 · 번역본(SKILL.ko.stale.md) 제외 · 원칙형 스킬이라 지시상 동작만 서술 · 예시 코드는 실행하지 않음"
@meta locale=ko
@source ede-fm title="design/emilkowalski/emil-design-eng/SKILL.md · 27509B · frontmatter" path=design/emilkowalski/emil-design-eng/SKILL.md lines=1:4
@source ede-init title="SKILL.md · 첫 응답 규칙과 역할" path=design/emilkowalski/emil-design-eng/SKILL.md lines=8:16
@source ede-phil title="SKILL.md · 핵심 철학 세 가지" path=design/emilkowalski/emil-design-eng/SKILL.md lines=18:36
@source ede-review title="SKILL.md · 리뷰 형식(필수)" path=design/emilkowalski/emil-design-eng/SKILL.md lines=38:60
@source ede-freq title="SKILL.md · 1. 움직일 것인가(빈도 표)" path=design/emilkowalski/emil-design-eng/SKILL.md lines=62:79
@source ede-purpose title="SKILL.md · 2. 목적" path=design/emilkowalski/emil-design-eng/SKILL.md lines=81:93
@source ede-easing title="SKILL.md · 3. easing 고르기와 커스텀 곡선" path=design/emilkowalski/emil-design-eng/SKILL.md lines=95:123
@source ede-dur title="SKILL.md · 4. duration 표와 300ms 규칙" path=design/emilkowalski/emil-design-eng/SKILL.md lines=125:135
@source ede-perc title="SKILL.md · 체감 성능" path=design/emilkowalski/emil-design-eng/SKILL.md lines=137:145
@source ede-spring title="SKILL.md · spring 쓸 때와 마우스 추적" path=design/emilkowalski/emil-design-eng/SKILL.md lines=147:175
@source ede-springcfg title="SKILL.md · spring 설정과 끊김 이점" path=design/emilkowalski/emil-design-eng/SKILL.md lines=177:195
@source ede-button title="SKILL.md · 버튼 누름 피드백" path=design/emilkowalski/emil-design-eng/SKILL.md lines=199:213
@source ede-scale0 title="SKILL.md · scale(0)에서 시작하지 않기" path=design/emilkowalski/emil-design-eng/SKILL.md lines=215:232
@source ede-origin title="SKILL.md · popover 기준점" path=design/emilkowalski/emil-design-eng/SKILL.md lines=234:245
@source ede-tooltip title="SKILL.md · tooltip 두 번째부터 지연 없음" path=design/emilkowalski/emil-design-eng/SKILL.md lines=247:267
@source ede-trans title="SKILL.md · keyframes보다 transition" path=design/emilkowalski/emil-design-eng/SKILL.md lines=269:288
@source ede-blur title="SKILL.md · blur로 전환 가리기" path=design/emilkowalski/emil-design-eng/SKILL.md lines=290:317
@source ede-start title="SKILL.md · @starting-style" path=design/emilkowalski/emil-design-eng/SKILL.md lines=319:344
@source ede-transform title="SKILL.md · CSS transform" path=design/emilkowalski/emil-design-eng/SKILL.md lines=346:391
@source ede-clip title="SKILL.md · clip-path 애니메이션" path=design/emilkowalski/emil-design-eng/SKILL.md lines=393:437
@source ede-gesture title="SKILL.md · 제스처와 드래그" path=design/emilkowalski/emil-design-eng/SKILL.md lines=439:475
@source ede-perf title="SKILL.md · transform·opacity만, CSS 변수 상속" path=design/emilkowalski/emil-design-eng/SKILL.md lines=477:493
@source ede-motion title="SKILL.md · Motion 하드웨어 가속 주의" path=design/emilkowalski/emil-design-eng/SKILL.md lines=495:509
@source ede-cssjs title="SKILL.md · 부하 중 CSS 우선, WAAPI" path=design/emilkowalski/emil-design-eng/SKILL.md lines=511:525
@source ede-a11y title="SKILL.md · reduced motion과 터치 hover" path=design/emilkowalski/emil-design-eng/SKILL.md lines=527:557
@source ede-sonner title="SKILL.md · Sonner 원칙 6개" path=design/emilkowalski/emil-design-eng/SKILL.md lines=559:573
@source ede-cohesion title="SKILL.md · 어울림, opacity와 height" path=design/emilkowalski/emil-design-eng/SKILL.md lines=575:583
@source ede-nextday title="SKILL.md · 다음 날 다시 보기" path=design/emilkowalski/emil-design-eng/SKILL.md lines=585:587
@source ede-asym title="SKILL.md · 누름과 놓음의 비대칭 시간" path=design/emilkowalski/emil-design-eng/SKILL.md lines=589:603
@source ede-stagger title="SKILL.md · stagger" path=design/emilkowalski/emil-design-eng/SKILL.md lines=605:637
@source ede-debug title="SKILL.md · 애니메이션 디버깅" path=design/emilkowalski/emil-design-eng/SKILL.md lines=639:658
@source ede-check title="SKILL.md · 리뷰 체크리스트 표" path=design/emilkowalski/emil-design-eng/SKILL.md lines=660:676
@source bu-desc title="design/emilkowalski/break-ui/SKILL.md · r17 확인용 description" path=design/emilkowalski/break-ui/SKILL.md lines=3:3
@source bu-scope title="design/emilkowalski/break-ui/SKILL.md · r17 확인용 역할 구분" path=design/emilkowalski/break-ui/SKILL.md lines=16:16
@source ad-desc title="design/emilkowalski/apple-design/SKILL.md · r47 확인용 description" path=design/emilkowalski/apple-design/SKILL.md lines=3:3
@source ra-desc title="design/emilkowalski/review-animations/SKILL.md · r48 확인용 description" path=design/emilkowalski/review-animations/SKILL.md lines=3:4

## 언제 켜지고, 사람은 어디서 개입하나 {#trigger}

@code source=ede-fm language=yaml

`description`은 이 스킬이 무엇을 담는지만 말한다. UI 다듬기, 컴포넌트 설계, 애니메이션 결정, 눈에 띄지 않는 세부가 대상이다. 호출 제한 필드(`disable-model-invocation` 등)는 없다.[](source:ede-fm)

판정: 언제 쓰라는 문장이 없어서, 모델은 UI나 애니메이션 작업이라는 주제만 보고 켤지 정한다. `description`은 판단용 설명이고 특정 단어로 켜지는 목록이 아니다.[](source:ede-fm)

사람이 개입하는 곳은 한 군데다.

| 지점 | 에이전트가 하는 일 | 사람의 몫 |
| --- | --- | --- |
| 질문 없이 불렸을 때 | 정해진 한 문장만 답한다. "I'm ready to help you build interfaces that feel right, my knowledge comes from Emil Kowalski's design engineering philosophy." 그 밖의 정보는 주지 않는다[](source:ede-init) | {caution:질문을 한다} |

원문은 승인 지점이나 종료 조건을 따로 두지 않는다(`원문에 명시 없음`). 리뷰는 표를 내면 끝난다.

**쓰면 안 되는 때**도 `원문에 명시 없음`이다. 원문 안의 규칙 수준 금지는 아래 규칙표에 있다. 예를 들어 은행 앱의 기능 그래프처럼 장식이 아닌 화면에는 마우스 추적 spring을 쓰지 말라고 한다.[](source:ede-spring)

이 스킬은 다른 스킬 이름을 부르지 않는다. 원장(`design/relations.md`)에 있는 관계는 다른 스킬이 이 스킬을 가리키거나, 목적이 같아 묶은 것이다.

| rel-id | 상대 | 종류 | 내용 |
| --- | --- | --- | --- |
| r17 | `break-ui` → 이 스킬 | 참고 | `break-ui`는 시각 디자인 비평이 필요하면 이 스킬을 쓰라고 한다. 자기는 취향을 비평하지 않는다고 선을 긋는다[](source:bu-desc)[](source:bu-scope) |
| r47 | `apple-design` | 같은 계열 | 둘 다 UI 다듬기와 모션 원칙을 담는다. `apple-design`은 Apple의 유체 인터페이스 원칙을 웹으로 옮긴 것이다. 서로 이름을 부르지 않는다[](source:ede-fm)[](source:ad-desc) |
| r48 | `review-animations` | 같은 계열 | `review-animations`는 기준이 Emil Kowalski의 디자인 엔지니어링 철학에서 나왔다고 한다. 이 스킬을 이름으로 부르지는 않는다. `review-animations`는 `disable-model-invocation: true`라 사용자가 직접 불러야 한다[](source:ra-desc) |

판정: 원문들이 긋는 역할 구분은 다음과 같다.[](source:bu-scope)[](source:ra-desc)

- 디자인 취향과 애니메이션 판단: 이 스킬
- 최악 데이터로 UI를 깨 보기: `break-ui`
- 모션 코드의 엄격한 리뷰: 사용자가 부르는 `review-animations`

이 스킬은 묶음에 속하지 않는 독립 스킬이다. 다른 스킬 페이지는 `design/index.html`에서 찾는다.

## 애니메이션 코드를 쓰기 전에 무엇을 묻나 {#decision}

원문은 애니메이션 코드를 쓰기 전에 네 질문에 순서대로 답하라고 한다.[](source:ede-freq) 앞 두 질문에서 걸리면 애니메이션을 넣지 않는다.

@workflow id=anim-decision title="애니메이션 결정 네 질문"
| q1 | 1 움직일 것인가? | backend |
| q2 | 2 목적이 있나? | backend |
| q3 | 3 easing 고르기 | backend |
| q4 | 4 duration 고르기 | backend |
| code | 코드 작성 | backend |
| none | 애니메이션 없음 | external |
| q1 > q2 | 예 |
| q1 > none | 아니오 |
| q2 > q3 | 예 | emphasis |
| q2 > none | 아니오 |
| q3 > q4 | |
| q4 > code | |

@steps id=anim-decision-steps
| q1 | 1 움직일 것인가? | 사용자가 이 애니메이션을 얼마나 자주 보는지 묻는다. 하루 100번 이상 보거나 키보드로 시작한 동작이면 아니오다. 원문의 예는 Raycast다. 하루 수백 번 쓰니 열고 닫는 애니메이션이 없다.[](source:ede-freq) | anim-decision | q1 |
| q2 | 2 목적이 있나? | "왜 움직이나"에 답해야 한다. 인정하는 목적은 공간 일관성, 상태 표시, 설명, 피드백, 갑작스러운 변화 막기다. 목적이 "멋있어서"뿐이고 자주 보는 것이면 움직이지 않는다.[](source:ede-purpose) | anim-decision | q2 |
| q3 | 3 easing 고르기 | 들어오거나 나가는 요소는 `ease-out`, 화면 안에서 움직이거나 모양이 바뀌면 `ease-in-out`, hover와 색 변화는 `ease`, 계속 도는 것(marquee, progress bar)은 `linear`다. 기본값은 `ease-out`이다. 내장 곡선 대신 커스텀 곡선을 쓴다.[](source:ede-easing) | anim-decision | q3 |
| q4 | 4 duration 고르기 | 요소별 표에서 고르고, UI 애니메이션은 300ms 미만으로 둔다.[](source:ede-dur) | anim-decision | q4 |
| code | 코드 작성 | 아래 규칙표의 컴포넌트·성능·접근성 규칙을 함께 적용한다. | anim-decision | code |
| none | 애니메이션 없음 | 넣지 않거나, 하루 수십 번 보는 것이면 크게 줄인다.[](source:ede-freq) | anim-decision | none |

1단계의 빈도 기준은 이렇다.[](source:ede-freq)

| 사용자가 보는 빈도 | 결정 |
| --- | --- |
| 하루 100번 이상(키보드 단축키, command palette 열고 닫기) | {bad:절대 넣지 않는다} |
| 하루 수십 번(hover 효과, 목록 이동) | 없애거나 크게 줄인다 |
| 가끔(modal, drawer, toast) | 표준 애니메이션 |
| 드물거나 처음(온보딩, 피드백 폼, 축하) | {good:즐거움을 더해도 된다} |

4단계의 duration 표다. 값은 원문이 요소별로 준 범위다.[](source:ede-dur)

| 요소 | duration |
| --- | --- |
| 버튼 누름 피드백 | 100~160ms |
| tooltip, 작은 popover | 125~200ms |
| dropdown, select | 150~250ms |
| modal, drawer | 200~500ms |
| 마케팅·설명용 | 더 길어도 된다 |

3단계에서 원문이 주는 커스텀 곡선은 세 개다. 곡선을 직접 만들지 말고 easing.dev나 easings.co에서 찾으라고 한다.[](source:ede-easing)

```css title="원문의 커스텀 easing 곡선"
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);        /* UI 상호작용용 강한 ease-out */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* 화면 안 이동용 */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);     /* iOS 같은 drawer 곡선(Ionic) */
```

원문이 `ease-in`을 막는 이유는 체감 속도다. 같은 300ms라도 `ease-in` dropdown은 처음 움직임이 늦어서 `ease-out`보다 느리게 느껴진다.[](source:ede-easing) 같은 이유로 180ms select가 400ms보다 빠르게 느껴지고, 빨리 도는 spinner는 로딩이 같아도 빨라 보인다고 한다.[](source:ede-perc)

## 어떤 규칙을 강제하고, 적용하면 무엇이 바뀌나 {#rules}

UI 코드를 리뷰할 때 에이전트는 `| Before | After | Why |` 열을 가진 Markdown 표 하나에 지적을 한 행씩 쓴다. "Before:"와 "After:"를 줄마다 나열하는 형식은 금지다.[](source:ede-review) 아래가 원문이 든 적용 전후 사례다.

| 적용 전 | 적용 후 | 이유 |
| --- | --- | --- |
| `transition: all 300ms` | `transition: transform 200ms ease-out` | 속성을 정확히 적고 `all`을 쓰지 않는다[](source:ede-review) |
| `transform: scale(0)` | `transform: scale(0.95); opacity: 0` | 현실에서는 아무것도 없는 데서 나타나지 않는다[](source:ede-review) |
| dropdown에 `ease-in` | 커스텀 곡선의 `ease-out` | `ease-in`은 굼뜨고 `ease-out`은 바로 반응한다[](source:ede-review) |
| 버튼에 `:active` 상태 없음 | `:active`에 `transform: scale(0.97)` | 버튼은 누름에 반응해야 한다[](source:ede-review) |
| popover에 `transform-origin: center` | `transform-origin: var(--transform-origin)` | popover는 trigger에서 커진다. modal은 예외로 가운데를 유지한다[](source:ede-review) |

리뷰 체크리스트는 위 표에 몇 줄을 더한다. 키보드 동작의 애니메이션은 없애고, 300ms를 넘는 UI 요소는 150~250ms로 줄인다. hover 애니메이션은 media query 안에 넣고, 빠르게 반복되는 요소는 keyframes 대신 transition을 쓴다. 나가는 쪽을 들어오는 쪽보다 빠르게 하고(예: 2s와 200ms), 한꺼번에 나타나는 요소에는 30~80ms stagger를 준다.[](source:ede-check)

리뷰가 아닌 구현에도 같은 원칙이 적용된다. 원문 표현의 강도를 그대로 구분했다.

| 영역 | 규칙 | 강도 |
| --- | --- | --- |
| 리뷰 형식 | `Before \| After \| Why` 표 하나, 지적마다 한 행[](source:ede-review) | {bad:의무(MUST)} |
| 빈도 | 키보드로 시작한 동작은 애니메이션하지 않는다[](source:ede-freq) | {bad:금지(Never)} |
| easing | UI 애니메이션에 `ease-in`을 쓰지 않는다. 커스텀 곡선을 쓴다[](source:ede-easing) | {bad:금지(Never)} |
| duration | UI 애니메이션은 300ms 미만[](source:ede-dur) | 규칙(Rule) |
| 등장 | `scale(0)`에서 시작하지 않는다. `scale(0.9)` 이상에서 opacity와 함께 시작한다[](source:ede-scale0) | {bad:금지(Never)} |
| 버튼 | 누를 수 있는 모든 요소에 `:active` `scale(0.97)`. 범위는 0.95~0.98[](source:ede-button) | 의무(must) |
| popover | trigger 쪽에서 커지게 `transform-origin`을 맞춘다. modal은 가운데 유지[](source:ede-origin) | 권고(should) |
| tooltip | 첫 tooltip은 지연을 두고, 하나가 열린 뒤 옆 tooltip은 지연과 애니메이션 없이 연다(`transition-duration: 0ms`)[](source:ede-tooltip) | 권고(should) |
| 끊김 | 빠르게 반복되는 UI(toast 추가, 상태 토글)는 keyframes 대신 CSS transition. transition은 중간에 방향을 바꾸고 keyframes는 0부터 다시 시작한다[](source:ede-trans) | 권고 |
| 등장 구현 | JS 없이 `@starting-style`로 등장을 만들고, 지원이 안 되면 `data-mounted` 패턴으로 대체한다[](source:ede-start) | 권고 |
| 크로스페이드 | easing과 duration을 바꿔도 어색하면 전환 중 `filter: blur(2px)`를 더한다. blur는 20px 미만(Safari에서 비싸다)[](source:ede-blur) | 권고 |
| transform | 위치는 고정 px보다 `translateY(100%)` 같은 백분율로 준다[](source:ede-transform) | 권고(Prefer) |
| 성능 | transform과 opacity만 애니메이션한다. `padding`, `margin`, `height`, `width`는 layout과 paint를 다시 일으킨다[](source:ede-perf) | 원칙 |
| 성능(CSS 변수) | 부모의 CSS 변수(예: `--swipe-amount`)를 바꾸지 말고 그 요소의 `transform`을 직접 바꾼다. 변수는 자식 전체의 스타일을 다시 계산하게 한다[](source:ede-perf) | 권고 |
| 성능(CSS와 JS) | 정해진 애니메이션은 CSS, 동적이고 끊을 수 있는 것은 JS. 코드로 CSS 애니메이션을 다루려면 WAAPI(`element.animate`)를 쓴다[](source:ede-cssjs) | 권고 |
| 접근성 | `prefers-reduced-motion`이면 움직임과 위치 애니메이션은 없애고, 이해를 돕는 opacity·색 전환은 남긴다[](source:ede-a11y) | 권고 |
| 접근성(터치 hover) | hover 애니메이션은 `@media (hover: hover) and (pointer: fine)` 안에 둔다. 터치 기기는 탭할 때 hover를 일으킨다[](source:ede-a11y) | 권고 |
| 제스처 | 거리 문턱 대신 속도로 닫는다. 경계 밖으로 끌면 감쇠를 주고, 드래그 중에는 pointer capture를 하고, 추가 터치는 무시한다[](source:ede-gesture) | 권고 |
| stagger | 함께 들어오는 요소는 30~80ms 간격으로 차례로 띄운다. stagger 중에도 상호작용을 막지 않는다[](source:ede-stagger) | 권고, 막지 않기는 금지(never) |
| 시간 비대칭 | 사용자가 결정하는 동작은 느리게(hold-to-delete 2s `linear`), 시스템이 응답하는 놓음은 빠르게(200ms `ease-out`)[](source:ede-asym) | 원칙(always) |

spring은 드래그 관성, Dynamic Island처럼 살아 있는 느낌, 중간에 끊길 수 있는 제스처, 장식용 마우스 추적에 쓴다.[](source:ede-spring) spring은 끊겨도 속도를 유지한다. 예를 들어 펼친 항목을 누르고 바로 Escape 키를 누르면 지금 위치에서 부드럽게 되돌아간다.[](source:ede-springcfg)

이 밖에 원문은 clip-path 활용법(탭 색 전환, hold-to-delete, 스크롤 이미지 공개, 비교 슬라이더)과 3D transform 예시를 기법으로 소개한다.[](source:ede-clip)[](source:ede-transform) Sonner를 만든 경험에서 나온 원칙 여섯 개도 있다. 설정 없이 쓰는 개발 경험, 옵션보다 좋은 기본값, 이름이 만드는 정체성, 보이지 않게 처리하는 엣지 케이스, 동적 UI의 transition, 좋은 문서 사이트다.[](source:ede-sonner) 작업을 마친 뒤에는 다음 날 다시 보고, 느린 재생이나 프레임 단위로 확인하라고 한다.[](source:ede-nextday)[](source:ede-debug)

## 수치는 어디까지 의무인가 {#numbers}

원문의 수치는 규칙, 권장 범위, 예시 코드 값으로 나뉜다. 예시 코드 값을 규칙으로 읽으면 안 된다.

| 값 | 성격 | 적용 조건 |
| --- | --- | --- |
| 300ms 미만 | 규칙("Rule") | UI 애니메이션. 체크리스트는 넘으면 150~250ms로 줄이라고 한다[](source:ede-dur)[](source:ede-check) |
| 100~160 / 125~200 / 150~250 / 200~500ms | 요소별 권장 범위 | 버튼 / tooltip·작은 popover / dropdown·select / modal·drawer[](source:ede-dur) |
| 하루 100번 이상 | 판단 기준 | 이 빈도면 애니메이션을 넣지 않는다[](source:ede-freq) |
| `scale(0.97)`, 범위 0.95~0.98 | 의무 값과 범위 | 누를 수 있는 요소의 `:active`. 예시는 `transition: transform 160ms ease-out`[](source:ede-button) |
| `scale(0.9)` 이상 | 하한 | 등장 시작 크기. 원문 예시와 리뷰 표는 `scale(0.95)`를 쓴다[](source:ede-scale0) |
| `bounce` 0.1~0.3 | 권장 범위 | spring을 쓸 때. 대부분의 UI에서는 `bounce`를 피하고 drag-to-dismiss와 놀이성 상호작용에 쓴다[](source:ede-springcfg) |
| `{ duration: 0.5, bounce: 0.2 }` | 예시(권장 방식) | Apple식 spring 설정. 물리식은 `mass: 1, stiffness: 100, damping: 10`[](source:ede-springcfg) |
| 속도 0.11 초과 | 기준값("~0.11") | 드래그 거리 ÷ 경과 시간. 넘으면 거리와 상관없이 닫는다. 단위는 원문에 명시 없음이고 예시 코드는 밀리초를 쓴다[](source:ede-gesture) |
| blur 20px 미만 | 상한 | 예시 값은 2px[](source:ede-blur) |
| stagger 30~80ms | 권장 범위 | 예시 코드는 50ms 간격, `translateY(8px)`, 300ms[](source:ede-stagger) |
| 2s `linear` / 200ms `ease-out` | 예시 값 | hold-to-delete의 누름과 놓음[](source:ede-asym) |
| 0ms | 예시 값 | 두 번째 tooltip부터. 첫 tooltip 예시는 125ms[](source:ede-tooltip) |
| `motion` 14.2 | 버전 경계 | 14.2부터 `x`, `y`, `scale`, `rotate` 줄임 속성이 HTML 요소에서 하드웨어 가속된다. 그 전 버전은 main thread라 전체 `transform` 문자열을 쓴다[](source:ede-motion) |
| 2~5배 | 디버깅 권고 | 느린 재생 확인을 위해 duration을 잠시 늘리는 배율[](source:ede-debug) |
| `margin: "-100px"`, `once: true` | 예시 값 | 스크롤 이미지 공개의 `useInView` 옵션[](source:ede-clip) |

`motion` 14.2 이상에서도 main thread에서 도는 애니메이션이 있다. layout 애니메이션(`layout`, `layoutId`), `onUpdate`나 `transformTemplate`를 쓰는 것, 관성, 매 프레임 motion value로 움직이는 값(drag, `useTransform`)이다.[](source:ede-motion) 원문은 Vercel 대시보드의 탭 애니메이션이 페이지 로딩 중 프레임을 놓쳤고, CSS 애니메이션으로 바꿔 고쳤다는 사례를 든다.[](source:ede-motion)

@callout level=warning title="원문 안에서 수치가 서로 부딪치는 곳"
원문은 이 충돌의 우선순위를 정하지 않는다. 그래서 정리하지 않고 그대로 옮긴다.
- 300ms 규칙과 modal·drawer 범위(200~500ms)가 겹친다. 체크리스트는 300ms를 넘으면 150~250ms로 줄이라고 한다.[](source:ede-dur)[](source:ede-check)
- Sonner는 일반 UI보다 조금 느리고 `ease-out` 대신 `ease`를 쓴다고 한다. 3단계는 들어오고 나가는 요소에 `ease-out`을 고르라고 한다. toast 예시 코드는 `400ms ease`다.[](source:ede-cohesion)[](source:ede-easing)[](source:ede-trans)
- 체크리스트의 "enter 2s, exit 200ms" 예시는 본문에서 hold-to-delete의 누름과 놓음 값이다. 등장 애니메이션의 값이 아니다.[](source:ede-check)[](source:ede-asym)

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 1개다. `design/emilkowalski/emil-design-eng/SKILL.md` 27,509B를 1~676줄 전부 읽었다. 이 폴더에 `references/`, `scripts/`, 바이너리는 없다.
- 관계 확인을 위해 `break-ui/SKILL.md` 3·16줄, `apple-design/SKILL.md` 3줄, `review-animations/SKILL.md` 3~4줄만 읽었다. 이 파일들은 각자의 스킬 페이지에서 분석한다.
- 제외한 파일: `SKILL.ko.stale.md`(31,099B)는 원본이 바뀐 뒤 남은 낡은 번역본이라 열지 않았다.
- 원문 대조 범위: 활성화 제한 1개(호출 제한 필드 없음), 첫 응답 규칙 1개, 의무·금지 문장 7개(리뷰 형식, 키보드 동작, `ease-in`, `scale(0)`, 버튼 반응, stagger 중 상호작용, 300ms 규칙), 수치 15행, 리뷰 사례 5행과 체크리스트 11행을 원문과 대조했다. 관계 행 r17, r47, r48은 원장과 원문을 다시 대조했고 같다.
- 원문의 사실 주장(Sonner 주간 다운로드 1,300만 이상, Raycast에 애니메이션이 없다는 것, Vercel 사례, `motion` 14.2 동작)은 외부에서 확인하지 않았다. 원문이 적은 그대로다.[](source:ede-sonner)[](source:ede-motion)
- 분석 중 바뀐 파일: 없음. `design/` 작업 트리는 commit `4e3fc89` 그대로다.

@callout level=open-question title="확인하지 못한 것"
- `description`에 사용 조건이 없어서, 실제로 어떤 요청에서 모델이 이 스킬을 켜는지는 확인하지 않았다. 실행해 보지 않았다.
- 첫 응답 규칙이 "질문 없이 불렸을 때"를 어떻게 가르는지 원문에 기준이 없다. 예를 들어 파일만 붙여 부른 경우가 질문인지는 `원문에 명시 없음`이다.[](source:ede-init)
- 리뷰 형식은 UI 코드 리뷰에만 걸린다. 리뷰가 아닌 구현 요청의 출력 형식은 `원문에 명시 없음`이다.[](source:ede-review)
