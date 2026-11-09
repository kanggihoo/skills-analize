# animation-performance 스킬은 에이전트를 어떻게 바꾸나 {#animation-performance-skill}

`animation-performance`를 쓰면 에이전트는 끊기는 웹 애니메이션을 "좋아 보이나"로 보지 않고 "각 프레임이 제시간에 끝나나"로 본다. 증상 표에서 원인 후보를 고르고, 자주 나오는 원인부터 7단계로 좁힌 뒤, 원인마다 Before/After와 확인 방법을 적은 보고서를 낸다. 그리고 멈춘다. 코드 수정은 사용자가 요청할 때만 한다.[](source:pf-scope)[](source:pf-diag)[](source:pf-report)

- 켜지는 때: 애니메이션이 버벅이거나 프레임이 떨어질 때, 어떤 속성을 움직일지나 CSS와 JS 중 무엇을 쓸지 성능 기준으로 정할 때, `will-change`나 GPU layer를 쓰려 할 때다. 호출 제한 필드는 없다.[](source:pf-fm)
- 강제하는 것: 코드를 바꾸기 전에 원인의 이름을 댄다. 빠른 기계에서 "괜찮다"고 결론 내지 않는다. `transition: all`을 쓰지 않는다.[](source:pf-hard)
- 대표 수치: 60Hz 프레임 예산 16.7ms, 120Hz는 8ms이고 작은 쪽에 맞춘다. 움직이는 `blur()`는 20px 미만이다.[](source:pf-budget)[](source:pf-traps)
- 쓰면 안 되는 때: easing·duration·애니메이션 여부를 정할 때(`animate`), 모션 전체를 리뷰할 때(`review-animations`), React Native 스레드 문제(`animate-expo`)다.[](source:pf-scope)

@answer scope="design/emilkowalski/animation-performance · 원본 텍스트 1개 14,269B · 커밋 4e3fc89 · 지시상 동작 · 성능을 실제로 측정하지 않음"
@meta locale=ko
@source pf-fm title="design/emilkowalski/animation-performance/SKILL.md · 14269B · frontmatter" path=design/emilkowalski/animation-performance/SKILL.md lines=1:4
@source pf-init title="SKILL.md · 첫 응답" path=design/emilkowalski/animation-performance/SKILL.md lines=8:14
@source pf-scope title="SKILL.md · 하는 일과 하지 않는 일" path=design/emilkowalski/animation-performance/SKILL.md lines=16:16
@source pf-why title="SKILL.md · 왜 중요한가" path=design/emilkowalski/animation-performance/SKILL.md lines=18:20
@source pf-posture title="SKILL.md · 작업 자세와 두 실패" path=design/emilkowalski/animation-performance/SKILL.md lines=22:29
@source pf-hard title="SKILL.md · Hard Rules 5개" path=design/emilkowalski/animation-performance/SKILL.md lines=31:37
@source pf-symptom title="SKILL.md · 증상 표" path=design/emilkowalski/animation-performance/SKILL.md lines=39:53
@source pf-budget title="SKILL.md · 프레임 예산" path=design/emilkowalski/animation-performance/SKILL.md lines=55:64
@source pf-tier title="SKILL.md · 속성 단계 표" path=design/emilkowalski/animation-performance/SKILL.md lines=66:82
@source pf-swap title="SKILL.md · 한 단계 싼 속성으로 바꾸기" path=design/emilkowalski/animation-performance/SKILL.md lines=84:98
@source pf-thread title="SKILL.md · 어느 스레드에서 도나" path=design/emilkowalski/animation-performance/SKILL.md lines=100:114
@source pf-motion title="SKILL.md · Motion 14.2와 가속 조건" path=design/emilkowalski/animation-performance/SKILL.md lines=116:125
@source pf-react title="SKILL.md · React 상태로 움직이지 않기" path=design/emilkowalski/animation-performance/SKILL.md lines=127:140
@source pf-traps title="SKILL.md · 맞아 보이는 함정 둘" path=design/emilkowalski/animation-performance/SKILL.md lines=142:158
@source pf-will title="SKILL.md · will-change" path=design/emilkowalski/animation-performance/SKILL.md lines=160:172
@source pf-js title="SKILL.md · JS 애니메이션을 피해야 하나" path=design/emilkowalski/animation-performance/SKILL.md lines=174:180
@source pf-p1 title="SKILL.md · 1단계 움직이는 것 목록" path=design/emilkowalski/animation-performance/SKILL.md lines=184:194
@source pf-diag title="SKILL.md · 2단계 진단 순서와 확인 방법" path=design/emilkowalski/animation-performance/SKILL.md lines=196:208
@source pf-report title="SKILL.md · 3단계 보고 형식과 멈춤" path=design/emilkowalski/animation-performance/SKILL.md lines=210:222
@source an-desc title="design/emilkowalski/animate/SKILL.md · r07 확인용 description" path=design/emilkowalski/animate/SKILL.md lines=3:3
@source an-motion title="design/emilkowalski/animate/SKILL.md · Motion 14.2 입장 비교용" path=design/emilkowalski/animate/SKILL.md lines=89:94
@source rv-gpu title="design/emilkowalski/review-animations/SKILL.md · Motion 14.2 입장 비교용, r08 확인용 frontmatter" path=design/emilkowalski/review-animations/SKILL.md lines=1:5
@source rv-std7 title="design/emilkowalski/review-animations/SKILL.md · 7번 기준" path=design/emilkowalski/review-animations/SKILL.md lines=43:43
@source ex-desc title="design/emilkowalski/animate-expo/SKILL.md · r09 확인용 description" path=design/emilkowalski/animate-expo/SKILL.md lines=3:3

## 언제 켜지고, 언제 쓰면 안 되나 {#trigger}

@code source=pf-fm language=yaml

이 스킬에는 호출 제한 필드가 없어서, 모델이 `description`을 참고해 스스로 켤 수 있다.[](source:pf-fm) 판정: `description`은 판단용 설명이라, "janky", "stutters" 같은 단어가 나온다고 반드시 켜지지는 않는다.

구체적인 질문 없이 처음 불리면, 에이전트는 정해진 한 문장("I'm ready to find out why your animation drops frames…")만 답하고 사용자가 물을 때까지 기다린다.[](source:pf-init)

원문은 이 스킬을 진단 스킬로 좁힌다. 질문은 "보기에 맞나"가 아니고 "각 프레임이 제시간에 끝나나"다.[](source:pf-scope) 성능이 중요한 이유로는 Sonner가 30fps로 돌았다면 같은 easing과 시간이어도 아무도 관심을 두지 않았을 것이라는 예를 든다.[](source:pf-why)

| 이런 작업이면 | 원문이 가리키는 곳 | rel-id |
| --- | --- | --- |
| easing, duration, 애니메이션을 넣을지 정하기 | `animate` | r07[](source:pf-fm)[](source:pf-scope) |
| 모션 전체 리뷰, "움직여야 하나" 판단 | `review-animations` | r08[](source:pf-fm)[](source:pf-scope) |
| React Native의 스레드 문제 | `animate-expo` | r09[](source:pf-scope) |

원문은 두 실패를 경계한다. 더 나쁜 것은 "내 기계에서는 부드럽다"다. 빠른 노트북은 이 스킬의 문제를 거의 다 가리고, 기준은 중간급 휴대폰이다.[](source:pf-posture)

두 번째 실패는 `will-change`를 뿌리고 고쳤다고 하는 것이다. 대부분의 끊김은 잘못된 속성이나 바쁜 main thread 때문이고, `will-change`는 둘 다 고치지 못한다.[](source:pf-posture)

## 에이전트는 어떤 순서로 원인을 찾나 {#workflow}

@workflow id=perf-flow title="animation-performance 진단 흐름"
| lane find | 찾기 |
| lane diag | 진단 1~3 |
| lane diag2 | 진단 4~7 |
| lane report | 보고 |
| p1 | 1 움직이는 것 목록 | backend | find |
| d1 | 어떤 속성이 움직이나 | backend | diag |
| d2 | 페이지가 바쁠 때인가 | backend | diag |
| d3 | 매 프레임 re-render인가 | backend | diag |
| d4 | 내용이 늘면 나빠지나 | backend | diag2 |
| d5 | CSS 변수·옛 Motion인가 | backend | diag2 |
| d6 | blur가 20px 이상인가 | backend | diag2 |
| d7 | 아직 밀리나 | backend | diag2 |
| rec | 기록으로 확인 | external | diag2 |
| rep | 3 원인별 보고 후 멈춤 | backend | report |
| fix | 요청 시 수정 | external | report |
| p1 > d1 | |
| d1 > d2 | |
| d2 > d3 | |
| d3 > d4 | |
| d4 > d5 | |
| d5 > d6 | |
| d6 > d7 | |
| d7 > rec | |
| rec > rep | |
| rep > fix | 사용자 요청 | dashed |

@steps id=perf-steps
| p1 | 1 움직이는 것 목록 | 범위 안의 애니메이션마다 요소, driver, 속성, 언제 도는지를 표로 적는다. `transition: all`과 Motion 축약 prop은 실제로 움직이는 속성으로 풀어 적는다. 원문 예는 route change 중 `layoutId`로 도는 tab indicator, hover에 `all`로 도는 card다.[](source:pf-p1) | perf-flow | p1 |
| d1 | 어떤 속성이 움직이나 | `transform`·`opacity`가 아닌 것이 첫 용의자다. layout 속성을 먼저 보고, layout처럼 보이지 않아 놓치기 쉬운 `box-shadow`와 `border-radius`를 그다음에 본다.[](source:pf-diag) | perf-flow | d1 |
| d2 | 페이지가 바쁠 때인가 | 끊김이 navigation, fetch, hydration, long task와 겹치면 애니메이션을 CSS나 WAAPI로 옮긴다.[](source:pf-diag) | perf-flow | d2 |
| d3 | 매 프레임 re-render인가 | rAF, pointer, scroll handler 안의 상태 업데이트를 찾는다.[](source:pf-diag) | perf-flow | d3 |
| d4 | 내용이 늘면 나빠지나 | 상속되는 CSS 변수나, 한꺼번에 너무 많은 node가 움직이는지 본다.[](source:pf-diag) | perf-flow | d4 |
| d5 | CSS 변수·옛 Motion인가 | CSS 변수를 직접 움직이는지, 14.2 이전 Motion의 `x`/`y`/`scale`인지 본다.[](source:pf-diag) | perf-flow | d5 |
| d6 | blur가 20px 이상인가 | 움직이는 `blur()`가 20px를 넘는지 본다.[](source:pf-diag) | perf-flow | d6 |
| d7 | 아직 밀리나 | 그래도 밀리거나 끊기면 그때 움직이는 요소에 `will-change: transform`을 더한다.[](source:pf-diag) | perf-flow | d7 |
| rec | 기록으로 확인 | 느낌이 아니라 기록으로 확인한다. DevTools Performance panel로 떨어진 프레임과 long task를, Animations panel로 느리게 재생해 본다. 중간급 실제 휴대폰을 remote debugging으로 연결해 성능을 기록한다. 데스크톱 CPU throttling은 느린 CPU만 흉내 내고, 약한 GPU나 작은 메모리는 흉내 내지 못한다.[](source:pf-diag) | perf-flow | rec |
| rep | 3 원인별 보고 후 멈춤 | 발견마다 요소와 `file.tsx:42` 같은 위치, 원인, Before, After, 확인 방식(코드로 확인 / 기기 기록 필요)을 적는다. layout을 paint보다, 바쁜 main thread를 한가한 쪽보다 앞에 두고 멈춘다.[](source:pf-report) | perf-flow | rep |
| fix | 요청 시 수정 | 원문 마지막 문장은 "요청받으면 수정을 적용한다"다. 보고에서 수정으로 넘어가는 것은 사용자의 결정이다.[](source:pf-report) | perf-flow | fix |

진단 순서는 원문이 "원인일 가능성이 높은 순서"라고 밝힌 순서 그대로다.[](source:pf-diag) 증상이 분명하면 먼저 증상 표에서 맞는 칸을 찾고 해당 절을 읽으라고 한다.[](source:pf-symptom)

| 증상 | 원문의 해결 |
| --- | --- |
| 애니메이션이 끊긴다 | `width`/`height`/`top`/`margin` 대신 `transform`/`opacity` |
| 그림자 애니메이션이 거칠다 | `filter: drop-shadow()` |
| navigation이나 로딩 중에만 끊긴다 | CSS나 WAAPI로 옮겨 main thread 밖에서 돌게 한다 |
| Motion `x`/`y`가 프레임을 떨어뜨린다 | `motion` 14.2 이상으로 올리거나 `transform` 문자열 전체 |
| React에서 직접 만든 애니메이션이 끊긴다 | state 대신 `ref.current.style`에 쓴다 |
| 목록이 길수록 drag가 느려진다 | 상속되는 CSS 변수를 그만 움직이고 `transform`을 직접 준다 |
| blur 전환이 늦다(특히 Safari) | 움직이는 `blur()`를 20px 미만으로 |
| 뜻밖의 속성이 움직인다 | `transition: all`을 명시 속성으로 |
| 시작·끝에 요소가 1px 밀린다 | 그것을 본 뒤에만 `will-change: transform` |

증상 표 9행을 그대로 옮겼다.[](source:pf-symptom)

## 무엇을 강제하고 수치는 무엇인가 {#rules}

| 강제 규칙 | 에이전트의 행동 |
| --- | --- |
| 기본은 `transform`과 `opacity` | 다른 속성은 이유가 필요하다. 더 싼 속성으로 같은 모습이 나오면 비싼 쪽이 "괜찮아 보여도" 싼 쪽을 쓴다[](source:pf-hard) |
| 코드를 바꾸기 전에 원인의 이름을 댄다 | 제안하는 수정마다 어떤 원인을 다루는지 적는다. "`will-change`를 넣었더니 부드러워 보인다"는 진단이 아니다[](source:pf-hard) |
| 빠른 기계에서 "괜찮다"고 하지 않는다 | 코드로 확인한 것과 실제 기기 기록이 필요한 것을 나눠 말한다[](source:pf-hard) |
| `transition: all` 금지 | 속성을 하나씩 적는다. `all`은 다음에 바뀌는 layout 속성까지 움직인다[](source:pf-hard) |
| 정확성을 최선 노력 최적화와 바꾸지 않는다 | 하드웨어 가속은 브라우저가 줄 수도 있는 것이고, 어떤 속성을 움직일지는 내가 정한다. 노력은 뒤쪽에 쓴다[](source:pf-hard) |

@facts
| 60Hz 프레임 예산 | 16.7ms(1000/60) |
| 120Hz 프레임 예산 | 8ms. 원문은 작은 숫자에 맞춰 설계하라고 한다 |
| 복잡한 페이지의 layout 재계산 | 100ms를 넘을 수 있다. 프레임 하나가 아니라 열두 개쯤이다 |
| Vaul drag가 느려진 시점(사례) | drawer 항목이 약 20개를 넘었을 때 |
| 움직이는 `blur()` | 20px 미만(규칙). crossfade를 부드럽게 하는 데는 2~5px면 충분하다 |
| Motion 축약 prop 가속 | `motion` 14.2부터 |
| state로 움직일 때 | 16.7ms마다 re-render, 렌더만으로 예산을 넘긴다 |

수치 출처: 프레임 예산[](source:pf-budget), Vaul과 blur[](source:pf-traps), Motion[](source:pf-motion), React[](source:pf-react).

브라우저가 화면을 바꾸는 세 단계(layout, paint, composite) 중 어디서 들어가느냐에 따라 속성 비용이 한 자릿수씩 차이 난다고 원문은 설명한다.[](source:pf-tier)

| 단계 | 속성 | 비용 |
| --- | --- | --- |
| composite만 | `transform`, `opacity`. 현재 Chrome·Firefox에서는 `filter`, `clip-path`, `background-color`도 | {good:가장 싸다} 자기 layer로 올라간다. 다만 앞의 둘 말고는 브라우저마다 지원이 고르지 않아 시험해야 한다 |
| paint + composite | `box-shadow`, `border-radius`, `color` | 다시 재지는 않지만 매 프레임 다시 그린다 |
| layout + paint + composite | `width`, `height`, `padding`, `margin`, `top`, `left`, `border-width` | {bad:가장 비싸다} 한 요소가 커지면 주변이 다 움직인다 |

속성 단계 표를 옮겼다.[](source:pf-tier) 한 단계 내려 바꾸는 법도 정해져 있다. 크기는 `scale()`, 이동은 `translate()`, `display`/`visibility`는 `opacity`, `box-shadow`는 `filter: drop-shadow(…)`다. 원문은 그림자를 사람들이 가장 많이 놓친다고 한다.[](source:pf-swap)

**어디서 도는지**도 따진다. JS + `requestAnimationFrame`(GSAP, Motion layout animation)은 항상 main thread에서 돈다. WAAPI(`element.animate()`, Motion의 `animate()`와 `motion/react` component)와 CSS transition·keyframes는 하드웨어 가속될 수 있다.[](source:pf-thread)

Vercel dashboard의 tab indicator가 다음 페이지를 불러오는 순간 Framer Motion shared layout animation으로 프레임을 떨어뜨렸고, CSS animation으로 옮겨 고쳤다는 사례를 든다.[](source:pf-thread) Motion에서는 `layout`, `layoutId`, `onUpdate`, `transformTemplate`, inertia, motion value로 매 프레임 움직이는 값이 버전과 상관없이 main thread에 남는다.[](source:pf-motion)

**맞아 보이는 함정 둘**은 `transform`을 쓰는데도 끊기는 경우다. 부모의 CSS 변수(`--swipe-amount`)로 자식의 `translateY()`를 움직이면 모든 자손의 style을 매 프레임 다시 계산한다. `blur()`는 특히 Safari에서 빨리 비싸진다.[](source:pf-traps)

**`will-change`**는 시작·끝의 1px 밀림이나 측정한 프레임 손실을 본 뒤에만 넣는다. 움직이는 요소에만 넣고 `*`나 큰 컨테이너에는 넣지 않는다. 비싼 paint(크게 blur된 요소)에는 효과가 있으니 layer를 작게 유지한다.[](source:pf-will)

**JS 애니메이션을 피할 필요는 없다.** 단순한 모션과 페이지가 바쁠 때 도는 모션은 CSS, 복잡하고 중단 가능하고 제스처로 움직이는 모션은 Framer Motion이 원문이 정한 분담이다.[](source:pf-js) `translateY(100%)` 같은 퍼센트 transform은 일부 브라우저가 가속하지 않아도 크기를 모르는 요소에 맞는 선택이라 계속 쓴다.[](source:pf-motion)

판정: Motion 축약 prop에 대한 입장은 현재 원문에서 세 스킬이 같다. `animate`와 `review-animations`도 14.2 이상은 가속되고, 그 전 버전만 바꾸라고 한다.[](source:an-motion)[](source:rv-std7)[](source:pf-motion) 이 저장소의 예전 Markdown 분석(`design/reports/emil-animation.md`)은 셋의 입장이 다르다고 적었다. `git show 4e3fc89`로 보면 최신화 commit에서 `animate`와 `review-animations`의 해당 문장이 "항상 `transform` 문자열"에서 14.2 기준으로 바뀌었다.

## 흐름 속 위치 {#position}

@workflow id=perf-position title="animation-performance 앞뒤"
| r-user | 끊김 증상 | external |
| r-perf | animation-performance | backend |
| r-fix | 수정 요청(사람) | external |
| r-animate | animate | backend |
| r-review | review-animations | backend |
| r-expo | animate-expo | backend |
| r-user > r-perf | | emphasis |
| r-perf > r-fix | 보고서 | |
| r-perf > r-animate | 곡선·시간 | dashed |
| r-perf > r-review | 전체 리뷰 | dashed |
| r-perf > r-expo | RN 스레드 | dashed |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `animate` | - | - | 역할 구분 참고. easing, duration, 애니메이션 여부 결정은 그쪽 몫이다. 넘기라는 지시는 없다[](source:pf-fm)[](source:an-desc) | r07 |
| `review-animations` | - | - | 역할 구분 참고. 모션 전체 리뷰와 "움직여야 하나"는 그쪽 몫이다. 그 스킬은 명시 호출만 받는다[](source:pf-scope)[](source:rv-gpu) | r08 |
| `animate-expo` | - | - | 역할 구분 참고. React Native 스레드는 그쪽 몫이다[](source:pf-scope)[](source:ex-desc) | r09 |
| (앞) | 원장에 이 스킬을 가리키는 관계가 없다 | - | 다른 스킬이 이 스킬로 넘기지 않는다. 사용자의 증상 보고로 시작한다 | - |
| (뒤) | - | 원인별 보고서 | 받는 쪽은 사람이다. 수정은 요청받을 때만 한다[](source:pf-report) | - |

원장에서 이 스킬의 역할은 motion-craft 묶음의 `선택지`다. 세 관계는 모두 역할 구분 참고라 점선으로 그렸다.

전체 흐름은 `design/_group-motion-craft/motion-craft.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 1개, 14,269B다. `SKILL.md`를 모두 읽었다. 이 스킬 폴더에는 references나 scripts가 없다. 구조·표본만 본 파일은 없다.
- 관계·입장 확인용으로 다른 스킬의 해당 줄만 읽었다. `animate/SKILL.md` 3줄과 89~94줄, `review-animations/SKILL.md` 1~5줄과 43줄, `animate-expo/SKILL.md` 3줄이다.
- 제외한 파일: 번역본 `SKILL.ko.stale.md`(18,413B, 원본이 바뀐 뒤 남은 낡은 번역)는 열지 않았다. 바이너리 파일은 없다.
- 원문 대조 범위: 활성화 제한 1개(호출 제한 필드 없음)와 첫 응답 규칙, Hard Rules 5개, 증상 표 9행, 프레임 예산 수치 3개, 속성 단계 표 3행과 바꾸기 표 4행, 스레드 표 3행, Motion 가속 조건, React 규칙, 함정 2개, `will-change` 조건, 진단 7단계와 확인 방법, 보고 형식과 멈춤 조건을 모두 대조했다. 관계 행 r07, r08, r09는 원장과 원문을 다시 대조했고 같다.
- 분석 중 바뀐 파일: 없음. 작업 트리는 commit `4e3fc89` 그대로다.
- 사람 검토: 미실시.

@callout level=open-question title="확인하지 못한 것"
- 속성 단계 표의 브라우저 지원(현재 Chrome·Firefox의 `filter`, `clip-path`, `background-color` 가속)은 원문 주장이다. 이 분석은 브라우저에서 측정하지 않았다.
- 보고 뒤 "요청받으면 수정"에서 요청이 없을 때 에이전트가 다음에 무엇을 하는지는 `원문에 명시 없음`이다.
- 원문은 진단 결과를 다른 스킬로 넘기는 경로를 적지 않는다. 그래서 그림의 점선은 역할 구분일 뿐 실행 순서가 아니다.
