# review-animations 스킬은 에이전트를 어떻게 바꾸나 {#review-animations-skill}

`review-animations`를 쓰면 에이전트는 애니메이션 코드를 "돌아가면 통과"로 보지 않고, 기본값을 지적에 두고 리뷰한다. diff의 모든 애니메이션을 협상 불가 기준 10개와 즉시 지적할 항목 14개에 대 보고, 고칠 점을 Before/After/Why 표로 낸 뒤 `Block` 또는 `Approve`로 끝낸다. 고치는 방법은 삭제부터 먼저 권한다.[](source:rv-posture)[](source:rv-std1)[](source:rv-rem)[](source:rv-decide)

- 켜지는 때: **사용자가 명시적으로 부를 때만**이다. `disable-model-invocation: true`라서 모델이 대화를 보고 스스로 켜지 않는다.[](source:rv-fm)
- 강제하는 것: 위반 하나가 지적 하나다. 값이 필요하면 어림하지 않고 `STANDARDS.md`의 정확한 값을 가져오고, `file:line`을 댄다.[](source:rv-std1)[](source:rv-decide)
- 대표 수치: UI 애니메이션 300ms 미만, 곡선 `cubic-bezier(0.23, 1, 0.32, 1)`, stagger 30~80ms다.[](source:rv-std1)[](source:st-ease)[](source:st-stagger)
- 쓰면 안 되는 때: 모션이 아닌 일반 코드 리뷰다. 기능 작성이나 무관한 버그 수정도 하지 않는다. 일반 리뷰를 부탁받으면 거절하고 일반 리뷰 스킬을 가리킨다.[](source:rv-scope)

@answer scope="design/emilkowalski/review-animations · 원본 텍스트 2개 18,455B · 커밋 4e3fc89 · 명시 호출 전용 · 지시상 동작"
@meta locale=ko
@source rv-fm title="design/emilkowalski/review-animations/SKILL.md · 8491B · frontmatter" path=design/emilkowalski/review-animations/SKILL.md lines=1:5
@source rv-init title="SKILL.md · 첫 응답" path=design/emilkowalski/review-animations/SKILL.md lines=9:15
@source rv-scope title="SKILL.md · 하는 일과 하지 않는 일" path=design/emilkowalski/review-animations/SKILL.md lines=17:17
@source rv-posture title="SKILL.md · 작업 자세와 방법의 출처" path=design/emilkowalski/review-animations/SKILL.md lines=19:23
@source rv-stdref title="SKILL.md · STANDARDS.md 읽는 때" path=design/emilkowalski/review-animations/SKILL.md lines=25:25
@source rv-std1 title="SKILL.md · 협상 불가 기준 1~5" path=design/emilkowalski/review-animations/SKILL.md lines=27:39
@source rv-std2 title="SKILL.md · 협상 불가 기준 6~10" path=design/emilkowalski/review-animations/SKILL.md lines=41:49
@source rv-trig title="SKILL.md · 즉시 지적할 항목 14개" path=design/emilkowalski/review-animations/SKILL.md lines=51:68
@source rv-rem title="SKILL.md · 고치는 방법 우선순위" path=design/emilkowalski/review-animations/SKILL.md lines=70:82
@source rv-out1 title="SKILL.md · 1부 지적 표" path=design/emilkowalski/review-animations/SKILL.md lines=84:97
@source rv-out2 title="SKILL.md · 2부 영향 단계" path=design/emilkowalski/review-animations/SKILL.md lines=99:108
@source rv-decide title="SKILL.md · Block과 Approve 기준" path=design/emilkowalski/review-animations/SKILL.md lines=110:115
@source rv-guide title="SKILL.md · 지침" path=design/emilkowalski/review-animations/SKILL.md lines=117:120
@source st-freq title="design/emilkowalski/review-animations/STANDARDS.md · 9964B · 빈도 표와 목적" path=design/emilkowalski/review-animations/STANDARDS.md lines=5:16
@source st-ease title="STANDARDS.md · easing" path=design/emilkowalski/review-animations/STANDARDS.md lines=18:37
@source st-dur title="STANDARDS.md · duration" path=design/emilkowalski/review-animations/STANDARDS.md lines=39:49
@source st-phys title="STANDARDS.md · 물리적 정확성" path=design/emilkowalski/review-animations/STANDARDS.md lines=51:59
@source st-spring title="STANDARDS.md · spring" path=design/emilkowalski/review-animations/STANDARDS.md lines=61:75
@source st-int title="STANDARDS.md · 중단 가능성" path=design/emilkowalski/review-animations/STANDARDS.md lines=77:99
@source st-asym title="STANDARDS.md · 비대칭 시간" path=design/emilkowalski/review-animations/STANDARDS.md lines=101:108
@source st-perf title="STANDARDS.md · 성능" path=design/emilkowalski/review-animations/STANDARDS.md lines=110:128
@source st-tf title="STANDARDS.md · transform과 clip-path" path=design/emilkowalski/review-animations/STANDARDS.md lines=130:135
@source st-gest title="STANDARDS.md · 제스처와 drag" path=design/emilkowalski/review-animations/STANDARDS.md lines=137:143
@source st-blur title="STANDARDS.md · crossfade 가리기" path=design/emilkowalski/review-animations/STANDARDS.md lines=145:147
@source st-stagger title="STANDARDS.md · stagger" path=design/emilkowalski/review-animations/STANDARDS.md lines=149:158
@source st-a11y title="STANDARDS.md · 접근성" path=design/emilkowalski/review-animations/STANDARDS.md lines=160:176
@source st-debug title="STANDARDS.md · 디버깅 권고" path=design/emilkowalski/review-animations/STANDARDS.md lines=178:183
@source st-coh title="STANDARDS.md · 일관성" path=design/emilkowalski/review-animations/STANDARDS.md lines=185:187
@source an-bar title="design/emilkowalski/animate/SKILL.md · r01 확인용 같은 기준" path=design/emilkowalski/animate/SKILL.md lines=20:20
@source an-never title="design/emilkowalski/animate/SKILL.md · r01 확인용 자동 차단 목록" path=design/emilkowalski/animate/SKILL.md lines=177:177
@source im-exec title="design/emilkowalski/improve-animations/SKILL.md · r12 확인용 execute" path=design/emilkowalski/improve-animations/SKILL.md lines=104:104
@source pf-scope title="design/emilkowalski/animation-performance/SKILL.md · r08 확인용" path=design/emilkowalski/animation-performance/SKILL.md lines=16:16
@source fo-desc title="design/emilkowalski/find-animation-opportunities/SKILL.md · r11 확인용" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=3:3
@source mn-scope title="design/emilkowalski/mobile-native/SKILL.md · r15 확인용" path=design/emilkowalski/mobile-native/SKILL.md lines=16:16
@source bu-scope title="design/emilkowalski/break-ui/SKILL.md · r18 확인용" path=design/emilkowalski/break-ui/SKILL.md lines=16:16
@source pt-scope title="design/emilkowalski/prototype/SKILL.md · r19 확인용" path=design/emilkowalski/prototype/SKILL.md lines=17:17
@source ed-desc title="design/emilkowalski/emil-design-eng/SKILL.md · r48 확인용 description" path=design/emilkowalski/emil-design-eng/SKILL.md lines=3:3

## 언제 켜지고, 언제 쓰면 안 되나 {#trigger}

@code source=rv-fm language=yaml

`disable-model-invocation: true`가 있으므로 이 스킬은 **명시 호출만** 받는다. 모델이 "애니메이션 코드를 봐 달라"는 대화를 보고 스스로 켜지 않는다. 사용자가 직접 불러야 한다.[](source:rv-fm) description도 언제 쓰라는 문장 없이 무엇을 하는지만 적는다.

구체적인 질문 없이 불리면, 에이전트는 정해진 한 문장("I'm ready to review your animations against a high craft bar…")만 답하고 사용자가 물을 때까지 기다린다.[](source:rv-init)

| 요청 | 에이전트의 행동 |
| --- | --- |
| 애니메이션·모션 코드 리뷰 | {good:리뷰한다} diff의 모든 애니메이션을 기준에 대 본다[](source:rv-std1) |
| 일반 코드 리뷰 | {bad:거절한다} 일반 리뷰 스킬을 가리킨다[](source:rv-scope) |
| 기능 작성, 무관한 버그 수정, 모션 아닌 코드 리뷰 | {bad:하지 않는다}[](source:rv-scope) |

다른 스킬들도 이 스킬을 모션 리뷰의 자리로 가리킨다. 그래도 그 스킬들이 이 스킬을 자동으로 실행할 수는 없다. 아래 "흐름 속 위치" 패널에 정리했다.

원문은 리뷰할 diff를 어떻게 모으는지(예: 어떤 git 명령을 쓰는지) 적지 않는다. `원문에 명시 없음`이다.[](source:rv-std1)

## 무엇을 기준으로 지적하나 {#standards}

원문의 자세는 "돌아가기만 하는 모션"을 통과시키지 않는 것이다. 느리게 느껴지거나, 엉뚱한 곳에서 나타나거나, 너무 자주 켜지거나, 프레임이 떨어지는 전환은 통과가 아니라 퇴보다. 기본은 지적이고 승인은 얻어 내야 한다.[](source:rv-posture)

기준의 내용은 Emil Kowalski의 애니메이션 철학(animations.dev)에서, 리뷰 방식은 공격적인 코드 품질 리뷰에서 가져왔다고 적는다.[](source:rv-posture)

| 협상 불가 기준 | 지적이 되는 때 |
| --- | --- |
| 1 정당한 모션 | "왜 움직이나"에 spatial consistency, state indication, feedback, explanation, preventing a jarring change 중 하나로 답하지 못한다. 자주 보는 요소의 "멋있어서"는 block이다 |
| 2 빈도에 맞춤 | 키보드로 시작하거나 하루 100번 넘는 동작에 애니메이션이 있다. 하루 수십 번은 줄인 모션, 가끔은 표준, 드물게는 즐거움을 위한 연출까지 된다 |
| 3 반응하는 easing | 들어오고 나가는 요소가 `ease-out`이나 강한 custom 곡선이 아니다. UI의 `ease-in`은 block이다 |
| 4 300ms 미만 UI | 이유 없이 300ms를 넘는다 |
| 5 원점과 물리 | popover·dropdown·tooltip이 trigger가 아닌 가운데에서 자란다. `scale(0)`에서 시작한다(modal 예외) |
| 6 중단 가능성 | 빠르게 켜지거나 제스처로 움직이는 모션이 keyframes라 처음부터 다시 시작한다 |
| 7 GPU 속성만 | layout 속성을 움직이거나, 14.2 이전 Motion의 `x`/`y`/`scale`을 부하 중에 쓴다 |
| 8 접근성 | `prefers-reduced-motion`을 무시하거나 hover 모션이 `@media (hover: hover) and (pointer: fine)`로 제한되지 않는다 |
| 9 비대칭 진입·퇴장 | 누르고 놓는 동작이나 누르고 있는 동작의 시간이 대칭이다 |
| 10 일관성 | 컴포넌트 성격이나 제품 전체와 맞지 않거나, 살짝 blur로 이을 곳에서 거친 crossfade를 쓴다. 맞는지 모르겠으면 지우는 것이 가장 강한 수일 때가 많다 |

위 표는 기준 10개를 옮겼다.[](source:rv-std1)[](source:rv-std2)

이 기준과 별도로 "보는 즉시 세게 지적할" 항목이 14개 있다. `transition: all`, `scale(0)`이나 처음 transform 없는 순수 fade 진입, UI의 `ease-in`과 의도한 애니메이션의 약한 기본 곡선, 키보드 단축키·command palette·하루 100번 넘는 동작의 애니메이션, 이유 없이 300ms를 넘는 UI 시간이다. trigger에 붙은 popover의 `transform-origin: center`, 빠르게 켜지는 것의 keyframes, layout 속성 애니메이션도 들어간다. 페이지가 바쁠 때 도는 14.2 이전 Motion 축약 prop이나 layout animation, 부모 CSS 변수로 자식 transform 움직이기, 움직임에 `prefers-reduced-motion` 처리 누락, 제한 없는 `:hover` 모션, 누르고 놓는 동작의 대칭 시간, 30~80ms stagger가 필요한 곳의 동시 진입이 나머지다.[](source:rv-trig)

## 어떤 순서로 리뷰하고 어떻게 끝내나 {#flow}

@workflow id=review-flow title="review-animations 리뷰 흐름"
| lane measure | 재기 |
| lane write | 쓰기 |
| lane decide | 판정 |
| w-diff | diff의 애니메이션 | external | measure |
| w-std | 기준 10개·14항목 | backend | measure |
| w-val | STANDARDS 값 찾기 | backend | measure |
| w-fix | 고칠 방법 고르기 | backend | write |
| w-table | 1부 지적 표 | backend | write |
| w-tier | 2부 영향 단계 | backend | write |
| w-block | Block 조건? | backend | decide |
| w-b | Block | external | decide |
| w-a | Approve | external | decide |
| w-diff > w-std | |
| w-std > w-val | 값 필요 |
| w-val > w-fix | |
| w-fix > w-table | |
| w-table > w-tier | |
| w-tier > w-block | |
| w-block > w-b | 예 |
| w-block > w-a | 아니오 | emphasis |

@steps id=review-steps
| w-diff | diff의 애니메이션 | 리뷰 대상은 diff 안의 모든 애니메이션이다. 위반 하나가 지적 하나다.[](source:rv-std1) | review-flow | w-diff |
| w-std | 기준 10개·14항목 | 협상 불가 기준 10개와 즉시 지적할 항목 14개에 대 본다.[](source:rv-std1)[](source:rv-trig) | review-flow | w-std |
| w-val | STANDARDS 값 찾기 | 지적에 정확한 값(곡선, 시간, spring 설정)이나 인용이 필요하면 `STANDARDS.md`를 읽고 그 값을 그대로 가져온다. 어림하지 않는다.[](source:rv-stdref)[](source:rv-decide) | review-flow | w-val |
| w-fix | 고칠 방법 고르기 | 앞의 방법을 뒤의 방법보다 먼저 권한다. 1 지운다, 2 줄인다, 3 easing을 고친다, 4 원점과 물리를 고친다, 5 중단 가능하게 한다, 6 GPU로 옮긴다, 7 시간을 비대칭으로 한다, 8 다듬는다(blur, stagger, `@starting-style`, spring), 9 접근성과 일관성을 맞춘다.[](source:rv-rem) | review-flow | w-fix |
| w-table | 1부 지적 표 | 문제 하나에 한 행인 Before / After / Why 표 하나를 반드시 낸다. "Before:/After:" 목록 형식은 쓰지 않는다. `file:line`을 댄다.[](source:rv-out1)[](source:rv-decide) | review-flow | w-table |
| w-tier | 2부 영향 단계 | 남은 의견을 영향이 큰 단계부터 묶고, 빈 단계는 뺀다. 순서는 느낌을 깨는 퇴보, 놓친 단순화, 성능, 중단과 시간, 원점·물리·일관성, 접근성이다.[](source:rv-out2) | review-flow | w-tier |
| w-block | Block 조건? | 느낌을 깨는 퇴보, 키보드·자주 쓰는 동작의 애니메이션, UI의 `scale(0)`이나 `ease-in`, 쉽게 GPU로 고칠 수 있는 비GPU 애니메이션 중 하나라도 있으면 예다.[](source:rv-decide) | review-flow | w-block |
| w-b | Block | 명시적으로 `Block`이라고 결정하며 끝낸다.[](source:rv-decide) | review-flow | w-b |
| w-a | Approve | `Approve`는 다섯 가지를 모두 만족할 때다. 느낌을 깨는 퇴보가 없고, 지워야 할 뻔한 모션이 없고, 시간과 easing이 범위 안이고, 필요한 곳의 중단 가능성이 처리됐고, reduced motion을 지킨다.[](source:rv-decide) | review-flow | w-a |

원문은 판정을 두 가지로만 정한다. Block 조건에 걸리지는 않지만 Approve 조건도 다 채우지 못하는 경우(설명용 예시: 이유 없는 350ms 하나만 있는 diff)를 어떻게 결정하는지는 `원문에 명시 없음`이다.[](source:rv-decide)

느낌이 맞는지 확신이 없으면, 에이전트는 추측하지 않고 사람에게 확인 방법을 권한다.[](source:rv-guide) 시간을 2~5배 늘리거나 DevTools animation inspector로 느리게 보기, Chrome DevTools Animations panel로 한 프레임씩 보기, 실제 기기에서 drawer·swipe 같은 제스처 시험하기(휴대폰을 IP로 dev server에 붙이고 Safari remote devtools 사용), 다음 날 다시 보기다.[](source:st-debug)

## STANDARDS.md의 수치는 무엇인가 {#numbers}

| 빈도 | 결정 |
| --- | --- |
| 하루 100번 넘게(키보드 단축키, command palette 토글) | 애니메이션 없음. 절대 |
| 하루 수십 번(hover, 목록 이동) | 지우거나 크게 줄인다 |
| 가끔(modal, drawer, toast) | 표준 애니메이션 |
| 드물게, 처음(onboarding, 피드백, 축하) | 즐거움을 더해도 된다 |

빈도 표를 옮겼다.[](source:st-freq)

@facts
| `--ease-out`(UI) | `cubic-bezier(0.23, 1, 0.32, 1)` |
| `--ease-in-out`(화면 안 이동) | `cubic-bezier(0.77, 0, 0.175, 1)` |
| `--ease-drawer`(iOS 같은 drawer) | `cubic-bezier(0.32, 0.72, 0, 1)` |
| 시간 | 버튼 100~160ms, tooltip·작은 popover 125~200ms, dropdown·select 150~250ms, modal·drawer 200~500ms, 마케팅은 더 길어도 됨 |
| UI 상한(규칙) | 300ms 미만 |
| 버튼 press | `:active`에 `scale(0.97)`, `transform 160ms ease-out`. 0.95~0.98 범위 |
| 진입 시작 크기 | `scale(0.9~0.97)` + `opacity: 0` |
| spring(권장, Apple식) | `{ type: "spring", duration: 0.5, bounce: 0.2 }` |
| spring(물리식) | `{ type: "spring", mass: 1, stiffness: 100, damping: 10 }` |
| bounce | 0.1~0.3. 대부분의 UI에서는 피한다 |
| 비대칭 시간(예) | 누를 때 `clip-path` 2s `linear`, 놓으면 200ms `ease-out` |
| drag 닫힘 속도 | `Math.abs(distance)/elapsedMs`가 약 0.11 초과면 닫는다 |
| crossfade blur | `blur(2px)`, 20px 미만 |
| stagger | 항목 사이 30~80ms |

수치 출처: easing[](source:st-ease), 시간[](source:st-dur), 물리[](source:st-phys), spring[](source:st-spring), 비대칭[](source:st-asym), 제스처[](source:st-gest), blur[](source:st-blur), stagger[](source:st-stagger).

그 밖의 규칙도 `STANDARDS.md`가 정한다.

- 키보드로 시작하는 동작은 애니메이션하지 않는다. Raycast가 열고 닫을 때 애니메이션이 없는 것을 옳은 예로 든다.[](source:st-freq)
- 빠르게 켜지는 것은 keyframes 대신 transition을 쓰고, JS 없는 진입은 `@starting-style`, 예전 방식은 `useEffect`로 `data-mounted`를 켠다.[](source:st-int)
- 부모 CSS 변수로 자식 transform을 움직이지 않는다. Motion 축약 prop은 14.2부터 가속되고, `layout`·`layoutId`는 버전과 상관없이 main thread에서 돈다.[](source:st-perf)
- `translate` 퍼센트, `clip-path: inset()` 활용(scroll reveal, hold-to-delete, tab 색 전환, 비교 slider)도 정리돼 있다.[](source:st-tf)
- reduced motion은 0이 아니라 "더 적고 부드럽게"이고, hover 모션은 `@media (hover: hover) and (pointer: fine)`로 막는다.[](source:st-a11y)

@callout level=open-question title="원문 안에서 기준과 예가 엇갈리는 곳"
- `STANDARDS.md`는 중단 가능한 예로 `transition: transform 400ms ease`인 toast를 든다.[](source:st-int) 그런데 즉시 지적 항목에는 "이유 없이 300ms를 넘는 UI 시간"과 "의도한 애니메이션의 약한 기본 곡선"이 있다.[](source:rv-trig) 일관성 절이 Sonner는 일부러 조금 느리고 `ease`를 쓴다고 이유를 대므로, 원문 안에서는 예외 근거가 있다.[](source:st-coh)
- 하루 수십 번 쓰는 동작을 `SKILL.md`는 "줄인 모션"이라 하고, `STANDARDS.md`는 "지우거나 크게 줄인다"고 한다.[](source:rv-std1)[](source:st-freq) 둘 중 무엇을 기준으로 지적할지는 정하지 않는다.
- stagger 예는 keyframes에 기본 `ease-out`을 쓴다.[](source:st-stagger) 즉시 지적 항목의 "약한 기본 곡선"과 부딪치는지는 원문이 설명하지 않는다.

## 흐름 속 위치 {#position}

@workflow id=review-position title="review-animations 앞뒤"
| u-user | 사용자 명시 호출 | external |
| u-animate | animate | backend |
| u-improve | improve-animations | backend |
| u-review | review-animations | backend |
| u-out | Block 또는 Approve | external |
| u-user > u-review | | emphasis |
| u-animate > u-review | 기준 공유 | dashed |
| u-improve > u-review | execute 기준 | dashed |
| u-review > u-out | | |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| 사용자(앞) | 리뷰할 diff | - | 명시 호출만 받으므로 실제 시작점은 사람이다[](source:rv-fm) | - |
| `animate` | - | - | 참고. `animate`의 기준은 이 스킬이 강제하는 기준과 같고, "이 리뷰를 한 번에 통과하게 쓰라"고 한다. 그 스킬의 Never Ship 표는 이 스킬의 자동 차단 항목이다. 이 스킬을 실행하라는 지시는 없다[](source:an-bar)[](source:an-never) | r01 |
| `improve-animations` | 실행 diff | - | 참고. 그쪽의 `execute <plan>` 모드는 실행 서브에이전트의 diff를 "`review-animations` 기준으로" 판정한다. 이 스킬을 호출한다는 문장은 없다[](source:im-exec) | r12 |
| `animation-performance` | - | - | 역할 구분. 모션 전체 리뷰와 "움직여야 하나"는 이 스킬 몫이라고 한다[](source:pf-scope) | r08 |
| `find-animation-opportunities` | - | - | 역할 구분. 이미 있는 애니메이션을 고치는 일은 `improve-animations`나 이 스킬을 쓰라고 한다[](source:fo-desc) | r11 |
| `mobile-native`(묶음 밖) | - | - | 역할 구분. 모션 리뷰는 이 스킬 몫이다[](source:mn-scope) | r15 |
| `break-ui`(묶음 밖) | - | - | 역할 구분. 모션은 이 스킬을 쓰라고 한다[](source:bu-scope) | r18 |
| `prototype`(묶음 밖) | - | - | 역할 구분. 기존 UI 리뷰는 이 스킬 몫이다[](source:pt-scope) | r19 |
| `emil-design-eng` | - | - | 같은 계열(추론). 이 스킬의 기준은 Emil Kowalski의 철학에서 나왔고, `emil-design-eng`가 그 철학을 담은 스킬이다. 이름으로 부르지는 않는다[](source:rv-fm)[](source:ed-desc) | r48 |
| (뒤) | - | 지적 표와 판정 | 받는 쪽은 사람이다. 원문은 고치는 일을 이 스킬 범위에 넣지 않는다[](source:rv-scope)[](source:rv-decide) | - |

여러 스킬이 이 스킬을 가리키지만, 모두 참고나 역할 구분이다. 이 스킬이 명시 호출만 받으므로, 다른 스킬이 "리뷰는 `review-animations`"라고 해도 에이전트가 이 스킬을 자동으로 이어 실행하지는 못한다. 판정: `improve-animations`의 `execute`가 쓰는 것은 이 스킬의 기준이지 스킬 실행이 아니다.[](source:im-exec)[](source:rv-fm)

그림은 묶음 안의 r01, r12만 점선으로 그렸다. r08, r11은 역할 구분이라, r15, r18, r19는 묶음 밖이라, r48은 같은 계열이라 표에만 남겼다.

전체 흐름은 `design/_group-motion-craft/motion-craft.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 2개, 합계 18,455B다. `SKILL.md` 8,491B와 `STANDARDS.md` 9,964B를 모두 읽었다. 구조·표본만 본 파일은 없다.
- 관계 확인용으로 다른 스킬 8개의 해당 줄만 읽었다. `animate` 20줄과 177줄(r01), `improve-animations` 104줄(r12), `animation-performance` 16줄(r08), `find-animation-opportunities` 3줄(r11), `mobile-native` 16줄(r15), `break-ui` 16줄(r18), `prototype` 17줄(r19), `emil-design-eng` 3줄(r48)이다.
- 제외한 파일: 번역본 `SKILL.ko.stale.md`(10,991B)와 `STANDARDS.ko.stale.md`(11,995B)는 원본이 바뀐 뒤 남은 낡은 번역이라 열지 않았다. 바이너리 파일은 없다.
- 원문 대조 범위(SKILL.md): 활성화 제한 1개(`disable-model-invocation: true`)와 첫 응답 규칙, 범위와 거절 조건, 기준 10개, 즉시 지적 항목 14개, 고치는 방법 9단계, 출력 2부와 영향 단계 6개, Block·Approve 조건, 지침 2개를 모두 대조했다.
- 원문 대조 범위(STANDARDS.md): 빈도 표 4행, easing 5행과 곡선 3개, 시간 표 5행, 물리 규칙 3개, spring 2종과 bounce, 제스처 5개, blur, stagger, 접근성, 디버깅 4개를 대조했다. 관계 행 r01, r08, r11, r12, r15, r18, r19, r48은 원장과 원문을 다시 대조했고 같다.
- 분석 중 바뀐 파일: 없음. 작업 트리는 commit `4e3fc89` 그대로다.
- 사람 검토: 미실시.

@callout level=open-question title="확인하지 못한 것"
- 리뷰할 diff를 모으는 방법, 그리고 Block도 Approve도 아닌 경우의 결정은 `원문에 명시 없음`이다.
- 일반 리뷰를 거절할 때 가리킬 "일반 리뷰 스킬"의 이름은 원문에 없다.
- 이 스킬을 실제로 불러 리뷰를 받아 보지 않았다. 출력 형식을 지키는지는 확인하지 않았다.
