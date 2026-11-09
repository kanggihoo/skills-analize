# animate 스킬은 에이전트를 어떻게 바꾸나 {#animate-skill}

`animate`를 쓰면 에이전트는 애니메이션 코드를 쓰기 전에 "이게 움직여야 하나"부터 정한다. 하루 100번 넘게 쓰는 동작이거나 목적을 한 단어로 댈 수 없으면 코드를 한 줄도 쓰지 않고, 그것을 성공으로 본다. 통과하면 도구, 속성, 곡선과 시간, 중단과 퇴장, reduced motion 순서로 정해진 표에서 값을 골라 직접 구현하고, 몇 줄짜리 메모만 붙인다.[](source:an-posture)[](source:an-hard)

- 켜지는 때: 무언가를 움직이게 하거나, 모션을 더하거나, 전환을 만들어 달라는 요청이다. 호출 제한 필드는 없다.[](source:an-fm)
- 강제하는 것: 7단계를 순서대로 밟고, 곡선·시간·spring 값은 표에서만 가져오며, reduced motion과 hover 제한을 애니메이션과 함께 낸다.[](source:an-hard)
- 대표 수치: UI 애니메이션은 300ms 미만, 곡선은 `cubic-bezier(0.23, 1, 0.32, 1)` 같은 정해진 token, 여러 요소가 함께 들어오면 30~80ms stagger다.[](source:an-s5dur)[](source:an-s5ease)[](source:an-never)
- 쓰면 안 되는 때: 기존 모션 비평, 코드베이스 감사, 움직일 곳 찾기, React Native 작업이다. toast·drawer 같은 컴포넌트가 필요하면 멈추고 `pick-ui-library`로 넘기라고 하는데, 그 스킬은 모델이 스스로 켤 수 없다.[](source:an-scope)[](source:an-comp)[](source:pk-fm)

@answer scope="design/emilkowalski/animate · 원본 텍스트 2개 19,867B · 커밋 4e3fc89 · 지시상 동작 · 레시피 코드는 읽기만 하고 실행하지 않음"
@meta locale=ko
@source an-fm title="design/emilkowalski/animate/SKILL.md · 11910B · frontmatter" path=design/emilkowalski/animate/SKILL.md lines=1:4
@source an-init title="SKILL.md · 첫 응답" path=design/emilkowalski/animate/SKILL.md lines=8:14
@source an-scope title="SKILL.md · 하는 일과 하지 않는 일" path=design/emilkowalski/animate/SKILL.md lines=16:16
@source an-posture title="SKILL.md · 작업 자세와 두 실패" path=design/emilkowalski/animate/SKILL.md lines=18:27
@source an-hard title="SKILL.md · Hard Rules 5개" path=design/emilkowalski/animate/SKILL.md lines=29:35
@source an-s1 title="SKILL.md · 1단계 빈도 관문" path=design/emilkowalski/animate/SKILL.md lines=39:50
@source an-s2 title="SKILL.md · 2단계 목적" path=design/emilkowalski/animate/SKILL.md lines=52:65
@source an-s3 title="SKILL.md · 3단계 도구 표" path=design/emilkowalski/animate/SKILL.md lines=67:79
@source an-comp title="SKILL.md · 컴포넌트면 pick-ui-library 호출" path=design/emilkowalski/animate/SKILL.md lines=81:81
@source an-s4 title="SKILL.md · 4단계 속성" path=design/emilkowalski/animate/SKILL.md lines=83:96
@source an-s5ease title="SKILL.md · 5단계 easing과 token" path=design/emilkowalski/animate/SKILL.md lines=98:120
@source an-s5dur title="SKILL.md · 5단계 duration" path=design/emilkowalski/animate/SKILL.md lines=122:132
@source an-s5spring title="SKILL.md · 5단계 spring" path=design/emilkowalski/animate/SKILL.md lines=134:141
@source an-s6 title="SKILL.md · 6단계 중단과 퇴장" path=design/emilkowalski/animate/SKILL.md lines=143:148
@source an-s7 title="SKILL.md · 7단계 reduced motion과 pointer 제한" path=design/emilkowalski/animate/SKILL.md lines=150:169
@source an-recipes title="SKILL.md · 레시피 안내" path=design/emilkowalski/animate/SKILL.md lines=171:173
@source an-never title="SKILL.md · Never Ship 표" path=design/emilkowalski/animate/SKILL.md lines=175:193
@source an-out title="SKILL.md · 출력" path=design/emilkowalski/animate/SKILL.md lines=195:203
@source an-tone title="SKILL.md · 어조" path=design/emilkowalski/animate/SKILL.md lines=205:207
@source rc-head title="design/emilkowalski/animate/RECIPES.md · 7957B · 머리말" path=design/emilkowalski/animate/RECIPES.md lines=1:5
@source rc-press title="RECIPES.md · Button press" path=design/emilkowalski/animate/RECIPES.md lines=9:25
@source rc-pop title="RECIPES.md · Dropdown, popover" path=design/emilkowalski/animate/RECIPES.md lines=29:48
@source rc-tip title="RECIPES.md · Tooltip" path=design/emilkowalski/animate/RECIPES.md lines=52:76
@source rc-modal title="RECIPES.md · Modal" path=design/emilkowalski/animate/RECIPES.md lines=80:103
@source rc-drawer title="RECIPES.md · Drawer" path=design/emilkowalski/animate/RECIPES.md lines=107:122
@source rc-toast title="RECIPES.md · Toast" path=design/emilkowalski/animate/RECIPES.md lines=126:151
@source rc-acc title="RECIPES.md · Accordion" path=design/emilkowalski/animate/RECIPES.md lines=155:166
@source rc-stagger title="RECIPES.md · Stagger" path=design/emilkowalski/animate/RECIPES.md lines=170:193
@source rc-hold title="RECIPES.md · Hold to confirm" path=design/emilkowalski/animate/RECIPES.md lines=197:217
@source rc-tab title="RECIPES.md · Tab indicator" path=design/emilkowalski/animate/RECIPES.md lines=221:234
@source rc-scroll title="RECIPES.md · Scroll reveal" path=design/emilkowalski/animate/RECIPES.md lines=238:253
@source rc-drag title="RECIPES.md · Drag to dismiss" path=design/emilkowalski/animate/RECIPES.md lines=257:288
@source rc-blur title="RECIPES.md · crossfade를 blur로 가리기" path=design/emilkowalski/animate/RECIPES.md lines=292:309
@source rc-waapi title="RECIPES.md · 라이브러리 없는 WAAPI" path=design/emilkowalski/animate/RECIPES.md lines=313:324
@source pk-fm title="design/emilkowalski/pick-ui-library/SKILL.md · r02 확인용 frontmatter" path=design/emilkowalski/pick-ui-library/SKILL.md lines=1:5
@source rv-fm title="design/emilkowalski/review-animations/SKILL.md · r01 확인용 frontmatter" path=design/emilkowalski/review-animations/SKILL.md lines=1:5
@source ex-desc title="design/emilkowalski/animate-expo/SKILL.md · r06 확인용 description" path=design/emilkowalski/animate-expo/SKILL.md lines=3:3
@source pf-scope title="design/emilkowalski/animation-performance/SKILL.md · r07 확인용 역할 구분" path=design/emilkowalski/animation-performance/SKILL.md lines=16:16
@source mn-tok title="design/emilkowalski/mobile-native/SKILL.md · r13 확인용 animate token" path=design/emilkowalski/mobile-native/SKILL.md lines=144:144
@source fo-scope title="design/emilkowalski/find-animation-opportunities/SKILL.md · 구현 역할 언급 확인용" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=26:26

## 언제 켜지고, 언제 쓰면 안 되나 {#trigger}

@code source=an-fm language=yaml

이 스킬에는 `disable-model-invocation` 같은 호출 제한 필드가 없다. 그래서 모델이 `description`을 참고해 스스로 켤 수 있다.[](source:an-fm) 판정: `description`은 판단용 설명이다. 거기 적힌 단어가 나온다고 반드시 켜지는 것은 아니다.

스킬이 처음 불렸는데 구체적인 질문이 없으면, 에이전트는 정해진 한 문장("I'm ready to build animations that feel right…")만 답하고 사용자가 질문할 때까지 다른 말을 하지 않는다.[](source:an-init)

원문은 이 스킬이 하는 일을 하나로 좁힌다. 모션 요청을 엄격한 리뷰를 통과할 구현으로 바꾸는 일이다. 나머지는 형제 스킬의 몫이라고 이름까지 적는다.[](source:an-scope)

| 이런 작업이면 | 원문이 가리키는 곳 | 성격 |
| --- | --- | --- |
| 이미 있는 모션을 비평하거나 diff를 리뷰한다 | `review-animations` | 역할 구분 참고(r01)[](source:an-fm) |
| 코드베이스 전체 모션을 감사한다 | `improve-animations` | 역할 구분 참고(r03)[](source:an-scope) |
| 움직일 만한 곳을 찾는다 | `find-animation-opportunities` | 역할 구분 참고(r04)[](source:an-scope) |
| React Native로 만든다 | `animate-expo` | 역할 구분 참고(r05)[](source:an-scope) |
| 애니메이션이 아니라 toast, drawer, command menu, dropdown 같은 컴포넌트가 필요하다 | `pick-ui-library` | {caution:멈추고 호출하라는 의무형(r02)}[](source:an-comp) |

관문에서 떨어지는 요청도 이 스킬을 쓰면 안 되는 경우에 가깝다. 키보드 단축키나 command palette처럼 하루 100번 넘게 여는 것은 원문이 "판단할 문제가 아니라 탈락 조건"이라고 못박는다.[](source:an-s1)

@callout level=warning title="r02: 의무형 넘김과 명시 호출 제한이 부딪친다"
`animate`는 컴포넌트가 필요하면 "멈추고 `pick-ui-library`를 호출하라"고 한다.[](source:an-comp) 그런데 `pick-ui-library`의 frontmatter에는 `disable-model-invocation: true`가 있고, description도 "명시적으로 부를 때만 실행되고 스스로 켜지지 않는다"고 적는다.[](source:pk-fm) 두 원문 모두 우선순위를 정하지 않는다. 그래서 에이전트가 이 지점에서 실제로 무엇을 하는지(사용자에게 호출을 요청하는지, 스킬 없이 라이브러리를 고르는지)는 `원문에 명시 없음`이다. 이 분석은 실행해 보지 않았다.

## 무엇을 어떤 순서로 정하나 {#sequence}

원문의 첫 강제 규칙은 "순서대로 하라"다. 1단계와 2단계가 나머지 전부를 막는 관문이고, 움직일지 정하기 전에 곡선부터 고르지 말라고 한다.[](source:an-hard)

@workflow id=build-flow title="animate 7단계 결정 순서"
| lane gate | 관문 |
| lane pick | 재료 고르기 |
| lane ship | 마무리 |
| s1 | 1 움직여도 되나? | backend | gate |
| s2 | 2 목적을 댈 수 있나? | backend | gate |
| stop | 코드 없이 멈춤 | external | gate |
| s3 | 3 도구 고르기 | backend | pick |
| comp | 컴포넌트가 필요한가? | backend | pick |
| handoff | pick-ui-library 호출 | external | pick |
| s4 | 4 속성 고르기 | backend | pick |
| s5 | 5 곡선·시간·spring | backend | pick |
| s6 | 6 중단과 퇴장 | backend | ship |
| s7 | 7 reduced motion | backend | ship |
| check | Never Ship 점검 | backend | ship |
| out | 코드와 짧은 메모 | backend | ship |
| s1 > s2 | 예 |
| s1 > stop | 아니오 |
| s2 > s3 | 예 |
| s2 > stop | 아니오 |
| s3 > comp | |
| comp > handoff | 예 | dashed |
| comp > s4 | 아니오 |
| s4 > s5 | |
| s5 > s6 | |
| s6 > s7 | |
| s7 > check | |
| check > out | | emphasis |

@steps id=build-steps
| s1 | 1 움직여도 되나? | 얼마나 자주 보는지로 정한다. 하루 100번 넘게 쓰는 것(키보드 단축키, command palette 토글)은 애니메이션을 넣지 않는다. 하루 수십 번(hover, 목록 이동)은 거의 느껴지지 않을 만큼 빠르고 작게 하거나 넣지 않는다. 가끔 보는 것(modal, drawer, toast)은 표준 애니메이션, 드물거나 처음 보는 것(onboarding, 성공, 축하)에만 즐거움을 위한 연출을 쓴다. 키보드로 시작하는 동작은 무조건 탈락이다. Raycast가 열고 닫을 때 애니메이션이 없는 것을 옳은 예로 든다.[](source:an-s1) | build-flow | s1 |
| s2 | 2 목적을 댈 수 있나? | 계속하기 전에 목적을 `Feedback`, `Spatial consistency`, `State indication`, `Preventing a jarring change`, `Explanation`, `Delight` 중 하나로 이름 붙인다. `Explanation`은 마케팅·onboarding에만, `Delight`는 드물게 보는 단계에만 허용한다. 이름을 못 붙이면 만들지 않는다. 사용자가 읽거나 조작하는 데이터는 멋을 위해 움직이지 않는다. 은행 앱 그래프의 마우스 추적 효과가 원문의 반례다.[](source:an-s2) | build-flow | s2 |
| stop | 코드 없이 멈춤 | 관문에서 떨어지면 그렇다고 분명히 말하고 애니메이션을 쓰지 않는다. 대신 즉시 바뀌는 상태나 정적인 표시 같은 움직임 없는 대안을 내민다. 원문은 코드 0줄로 끝나는 결과를 회피가 아니라 성공이라고 부른다.[](source:an-s1)[](source:an-posture) | build-flow | stop |
| s3 | 3 도구 고르기 | 위에서부터 내려가며 처음 맞는 도구에서 멈춘다. hover·press·색·클래스로 켜는 상태는 CSS transition, JS 상태 없는 mount 진입은 CSS `@starting-style`, 페이지가 바쁠 때도 부드러워야 하는 정해진 모션은 CSS animation, 라이브러리 없는 프로그램 제어는 WAAPI(`element.animate()`), spring·layout·exit·제스처 값은 Motion(`motion.dev`)이다. fade 하나에 모션 라이브러리를 설치하지 않는다.[](source:an-s3)[](source:an-hard) | build-flow | s3 |
| comp | 컴포넌트가 필요한가? | 작업이 애니메이션보다 toast, drawer, command menu, dropdown 같은 컴포넌트를 필요로 하면 멈춘다. 직접 만들면 focus 관리 없는 `<div>` dropdown이 나온다는 것이 원문의 이유다.[](source:an-comp) | build-flow | comp |
| handoff | pick-ui-library 호출 | 원문은 `pick-ui-library`를 호출하라고 한다. 그 스킬은 명시 호출만 받으므로 위 경고 상자의 충돌이 이 지점이다.[](source:an-comp)[](source:pk-fm) | build-flow | handoff |
| s4 | 4 속성 고르기 | `transform`과 `opacity`만 움직인다. `clip-path`는 허용된 네 번째 속성이고, `height`는 transform으로 대신할 수 없는 accordion에서만 참는다. `scale(0)`에서 시작하지 않고 `scale(0.9~0.97)`과 `opacity: 0`에서 시작한다. popover·dropdown·menu·tooltip은 `transform-origin`을 trigger에 두고(Base UI의 `var(--transform-origin)`), modal은 예외라 가운데에 둔다. 이동은 `translate()` 퍼센트를 쓴다. 부모의 CSS 변수로 자식의 transform을 움직이지 않는다.[](source:an-s4) | build-flow | s4 |
| s5 | 5 곡선·시간·spring | 들어오고 나가면 `ease-out`, 화면 안에서 움직이면 `ease-in-out`, hover·색은 `ease`, 계속 도는 것은 `linear`, 기본은 `ease-out`이다. UI에는 `ease-in`을 쓰지 않는다. 기본 CSS 곡선은 약하니 아래 token을 쓰고, 없는 곡선은 easing.dev나 easings.co에서 가져온다. 끌어서 던지기, 살아 있는 느낌, 중단·되돌릴 수 있는 제스처, 장식용 마우스 추적이면 spring을 쓴다.[](source:an-s5ease)[](source:an-s5spring) | build-flow | s5 |
| s6 | 6 중단과 퇴장 | 빠르게 여러 번 켜지는 것(toast, toggle)은 keyframes 대신 transition을 쓴다. transition은 현재 값에서 다시 목표를 잡고, keyframes는 처음부터 다시 시작하기 때문이다. 제스처는 속도를 이어받는 spring을 쓴다. 들어온 길로 나간다. 사용자가 결정하는 단계는 느리게, 시스템 응답은 빠르게 한다.[](source:an-s6) | build-flow | s6 |
| s7 | 7 reduced motion | `prefers-reduced-motion`과 `@media (hover: hover) and (pointer: fine)` 제한을 애니메이션과 함께 낸다. reduced motion은 0이 아니라 "더 적고 부드럽게"다. 이해를 돕는 opacity·색 전환은 남기고 이동과 위치 변화를 뺀다.[](source:an-s7) | build-flow | s7 |
| check | Never Ship 점검 | 끝내기 전에 아래 13행 표로 스스로 점검한다. 원문은 각 행이 `review-animations`에서 자동으로 막히는 항목이라고 한다.[](source:an-never) | build-flow | check |
| out | 코드와 짧은 메모 | 코드를 쓰고, 몇 줄 안에 관문 결과(빈도 단계와 목적, 탈락시킨 것과 이유), 재료(도구, 속성, 곡선, 시간이나 spring 설정을 한 줄씩), 손으로 느껴 봐야 할 것을 적는다. 보고서로 부풀리지 않는다. 코드가 결과물이다.[](source:an-out) | build-flow | out |

원문은 선택지를 메뉴처럼 내밀지 말라고 한다. 에이전트가 결정하고, 이유를 한 줄로 말하고, 코드를 쓴다.[](source:an-posture) 그래서 이 흐름 안에는 사용자에게 고르게 하는 지점이 없다.

## 수치와 금지 목록은 무엇인가 {#numbers}

원문의 두 번째 강제 규칙은 "어림값 금지"다. 모든 곡선, 시간, spring 설정은 아래 표에서 가져오고, 익숙해 보인다는 이유로 `cubic-bezier(0.4, 0, 0.2, 1)`을 지어내지 않는다.[](source:an-hard) 이미 `--ease-out` 같은 token이나 시간 단계가 코드베이스에 있으면 그것을 쓰고, 나란히 새 체계를 만들면 결함으로 본다.[](source:an-hard)

@facts
| `--ease-out`(의무, UI 기본) | `cubic-bezier(0.23, 1, 0.32, 1)` |
| `--ease-in-out`(의무, 화면 안 이동) | `cubic-bezier(0.77, 0, 0.175, 1)` |
| `--ease-drawer`(의무, iOS 같은 drawer) | `cubic-bezier(0.32, 0.72, 0, 1)` |
| UI 애니메이션 상한(규칙) | 300ms 미만. 180ms dropdown이 400ms보다 빠르게 느껴진다는 예를 든다 |
| spring(Apple식) | `{ type: "spring", duration: 0.5, bounce: 0.2 }` |
| spring(물리식) | `{ type: "spring", mass: 1, stiffness: 100, damping: 10 }` |
| bounce 범위(권고) | 0.1~0.3. 대부분의 UI에서는 피하고 drag-to-dismiss와 장난스러운 상호작용에만 쓴다 |
| 비대칭 시간(예시) | 누르고 있는 확인 2s `linear`, 놓으면 200ms `ease-out` |
| stagger(Never Ship) | 한꺼번에 들어오지 않게 30~80ms |

수치 출처: 곡선[](source:an-s5ease), 상한과 spring[](source:an-s5dur)[](source:an-s5spring), 비대칭 시간[](source:an-s6), stagger[](source:an-never).

| 요소 | 시간 |
| --- | --- |
| 버튼 누름 피드백 | 100~160ms |
| tooltip, 작은 popover | 125~200ms |
| dropdown, select | 150~250ms |
| modal, drawer | 200~500ms |
| 마케팅·설명용 | 더 길어도 된다 |

위 표는 원문 duration 표 그대로다.[](source:an-s5dur)

| 내보내면 안 되는 것 | 대신 |
| --- | --- |
| `transition: all` | 속성을 하나씩 적는다 |
| `transform: scale(0)` 진입 | `scale(0.95)` + `opacity: 0` |
| UI 요소의 `ease-in` | `ease-out`이나 강한 custom 곡선 |
| 의도한 애니메이션에 기본 `ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` |
| 키보드 단축키나 하루 100번 넘는 동작의 애니메이션 | 애니메이션 없음 |
| 이유 없이 300ms를 넘는 UI 시간 | 150~250ms |
| trigger에 붙은 popover의 `transform-origin: center` | `var(--transform-origin)`(modal 예외) |
| toast·toggle처럼 빠르게 켜지는 요소의 keyframes | CSS transition |
| `width`·`height`·`margin`·`padding`·`top`·`left` 애니메이션 | `transform` / `opacity` |
| 14.2 이전 Motion에서 부하 중 `x`·`y`·`scale` prop | 14.2 이상으로 올리거나 `transform` 문자열 전체 |
| 제한 없는 `:hover` 모션 | `@media (hover: hover) and (pointer: fine)` |
| `prefers-reduced-motion` 누락 | 0이 아니라 더 부드러운 변형 |
| 모두 한꺼번에 들어오기 | 30~80ms stagger |

Never Ship 표 13행을 그대로 옮겼다.[](source:an-never)

@callout level=open-question title="300ms 상한과 더 긴 값이 함께 있다"
원문은 "UI 애니메이션은 300ms 미만"을 규칙으로 두면서, 같은 파일의 duration 표에서는 modal·drawer에 200~500ms를 준다.[](source:an-s5dur) 레시피도 drawer 500ms, toast 400ms `ease`를 쓴다.[](source:rc-drawer)[](source:rc-toast) Never Ship은 "이유 없이" 300ms를 넘는 경우만 막는다.[](source:an-never) toast는 Sonner의 성격에 맞춘 것이라는 이유를 레시피가 적지만, drawer 500ms의 이유는 따로 없다. 둘 중 무엇이 우선인지 원문은 정하지 않으므로 충돌을 그대로 둔다.

## 레시피 파일은 무엇을 주나 {#recipes}

요청이 흔한 컴포넌트와 맞으면 `RECIPES.md`를 읽고, 빈 파일 대신 레시피에서 시작하라고 한다.[](source:an-recipes) 레시피의 곡선은 `SKILL.md`의 세 token을 쓴다.[](source:rc-head)

| 레시피 | 핵심 값과 이유 |
| --- | --- |
| Button press | `:active`에 `scale(0.97)`, `transform 160ms`. 터치에서도 진짜 누름이라 hover 제한이 필요 없다[](source:rc-press) |
| Dropdown, popover, menu, select | 200ms, `scale(0.95)`에서 시작, `transform-origin`이 trigger를 가리키는 것이 핵심이다[](source:rc-pop) |
| Tooltip | 125ms, `scale(0.97)`. 하나가 열린 뒤 이웃 tooltip은 `transition-duration: 0ms`로 바로 연다[](source:rc-tip) |
| Modal | 250ms, `scale(0.96)`, 가운데 고정. backdrop opacity도 함께 움직인다[](source:rc-modal) |
| Drawer / sheet | 500ms `--ease-drawer`, `translateY(100%)`로 숨긴다. Vaul 방식이다[](source:rc-drawer) |
| Toast | 400ms `ease`, `@starting-style`. 없으면 mount 여부를 담은 상태값으로 대신한다. 쌓이는 toast의 opacity와 height 균형은 공식이 없어 다음 날 다시 본다[](source:rc-toast) |
| Accordion | `height`·`opacity` 200ms. 매 프레임 layout 비용이 드니 짧게 하고, `auto`로 움직이지 말고 JS로 높이를 잰다[](source:rc-acc) |
| Stagger | 300ms, 50ms 간격, `translateY(8px)`. 가끔 보는 목록에만 쓰고 상호작용을 막지 않는다[](source:rc-stagger) |
| Hold to confirm | 누를 때 `clip-path` 2s `linear`, 놓으면 200ms. 진행 표시라 `linear`가 맞다[](source:rc-hold) |
| Tab indicator | 탭 목록을 복제해 활성 사본을 `clip-path` 250ms로 자른다[](source:rc-tab) |
| Scroll reveal | 마케팅 화면에만 쓴다. `clip-path` 600ms, `useInView`의 `{ once: true, margin: "-100px" }`로 한 번만 실행한다[](source:rc-scroll) |
| Drag to dismiss | 거리 기준 또는 속도 0.11 초과면 닫는다. pointer capture, 멀티터치 방지, 경계 밖 감쇠, 벽 대신 마찰. 마무리는 spring `duration: 0.5, bounce: 0.2`[](source:rc-drag) |
| crossfade blur | 두 상태가 겹쳐 보이면 `blur(2px)`와 `opacity: 0.7`로 이음매를 가린다. blur는 20px 미만, Safari에서 특히 비싸다[](source:rc-blur) |
| WAAPI | 의존성 없이 `element.animate()`로 `clip-path`를 1000ms 움직이는 예다[](source:rc-waapi) |

판정: `SKILL.md`의 레시피 안내는 12종을 나열하지만 `RECIPES.md`에는 crossfade blur와 WAAPI까지 14개 절이 있다.[](source:an-recipes)[](source:rc-blur)[](source:rc-waapi) 빠진 두 절은 특정 컴포넌트보다 기법에 가까워 목록에서 뺀 것으로 보인다.

손으로 느껴야 하는 부분은 코드로 판단하지 않는다. crossfade, spring의 튕김, 들어오는 목록의 opacity와 height 균형처럼 느낌에 달린 결과면, 에이전트는 그렇다고 말하고 확인 방법을 알려 준다. 2~5배 느리게 재생하거나 DevTools animation inspector로 보기, 한 프레임씩 넘기기, 실제 기기에서 제스처 시험하기, 다음 날 다시 보기다.[](source:an-out)[](source:an-tone) 이 확인은 사람이 한다.

## 흐름 속 위치 {#position}

@workflow id=animate-position title="animate 앞뒤"
| p-req | 모션 요청 | external |
| p-expo | animate-expo | backend |
| p-perf | animation-performance | backend |
| p-animate | animate | backend |
| p-review | review-animations | backend |
| p-pick | pick-ui-library | external |
| p-req > p-animate | | emphasis |
| p-expo > p-animate | 웹이면 | dashed |
| p-perf > p-animate | 곡선·시간 | dashed |
| p-animate > p-review | 기준 공유 | dashed |
| p-animate > p-pick | 컴포넌트면 | dashed |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `review-animations`(뒤) | - | - | 넘김이 아니라 참고다. `animate`의 기준은 `review-animations`가 강제하는 기준과 같고, "그 리뷰를 한 번에 통과하게 쓰라"고 한다. Never Ship 표는 그 리뷰의 자동 차단 항목이다. `review-animations`를 실행하라는 지시는 없고, 그 스킬은 `disable-model-invocation: true`라 사람이 불러야 한다[](source:an-posture)[](source:an-never)[](source:rv-fm) | r01 |
| `pick-ui-library`(뒤) | - | 작업 설명 | 컴포넌트가 필요하면 멈추고 호출하라는 의무형이다. 받는 스킬이 명시 호출만 받아 충돌한다. 실제 동작은 확인하지 않았다(지시상 동작)[](source:an-comp)[](source:pk-fm) | r02 |
| `improve-animations` | - | - | 역할 구분. 코드베이스 감사는 그쪽 몫이다[](source:an-fm)[](source:an-scope) | r03 |
| `find-animation-opportunities` | - | - | 역할 구분. 움직일 곳 찾기는 그쪽 몫이다[](source:an-scope) | r04 |
| `animate-expo` | - | - | 서로 역할을 나눈다. `animate`는 React Native를 그쪽에 미루고(r05), `animate-expo`는 웹을 이쪽에 미룬다(r06)[](source:an-scope)[](source:ex-desc) | r05, r06 |
| `animation-performance`(앞) | - | - | 그쪽이 easing·duration·애니메이션 여부 결정을 이 스킬에 미룬다[](source:pf-scope) | r07 |
| `mobile-native`(묶음 밖) | - | `animate` token | 그쪽이 모션 자체는 이 스킬을 쓰라고 하고, 코드베이스가 이 스킬의 token을 쓰면 press 피드백도 그것을 따르라고 권한다[](source:mn-tok) | r13 |

그림은 실선 없이 점선만 썼다. 원장에서 이 스킬로 들어오거나 나가는 관계 중 실행 순서를 정하는 것은 r02 하나이고, 그것도 위의 충돌 때문에 점선으로 그렸다. r03, r04, r13은 그림에서 생략하고 표에만 남겼다.

이 스킬은 두 묶음에 속한다. 전체 흐름은 `design/_group-motion-craft/motion-craft.html`(모션 찾기·계획·구현·리뷰)과 `design/_group-ui-component/ui-component.html`(라이브러리 선택·여러 버전·최악 데이터)에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

판정: 원장의 motion-craft 묶음 그림 설명은 `find-animation-opportunities` → `animate` 갈래를 적지만, 그 방향의 rel-id는 없다. `find-animation-opportunities`는 "구현은 직접 하지 않는다"고만 하고 `animate`를 이름으로 부르지 않는다.[](source:fo-scope) 그래서 이 페이지의 그림에는 그 간선을 넣지 않았다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 2개, 합계 19,867B다. `SKILL.md` 11,910B와 `RECIPES.md` 7,957B를 모두 읽었다. 구조·표본만 본 파일은 없다.
- 관계 확인용으로 다른 스킬 6개의 해당 줄만 읽었다. `pick-ui-library` 1~5줄(r02), `review-animations` 1~5줄(r01), `animate-expo` 3줄(r06), `animation-performance` 16줄(r07), `mobile-native` 144줄(r13), `find-animation-opportunities` 26줄이다.
- 제외한 파일: 번역본 `SKILL.ko.stale.md`(15,545B, 원본이 바뀐 뒤 남은 낡은 번역)와 `RECIPES.ko.md`(9,757B)는 열지 않았다. 바이너리 파일은 이 폴더에 없다.
- 원문 대조 범위: 활성화 제한 1개(호출 제한 필드 없음)와 첫 응답 규칙, Hard Rules 5개, 관문 2개와 탈락 시 행동, 도구 표 5행, 속성 규칙 6개, easing 표 5행과 token 3개, duration 표 5행, spring 2종과 bounce 범위, 중단·퇴장 규칙 4개, Never Ship 13행, 출력 3항목, 레시피 14절의 수치를 모두 대조했다. 관계 행 r01~r07, r13은 원장과 원문을 다시 대조했고 같다.
- 분석 중 바뀐 파일: 없음. 작업 트리는 commit `4e3fc89` 그대로다.
- 사람 검토: 미실시.

@callout level=open-question title="확인하지 못한 것"
- r02 충돌에서 에이전트가 실제로 하는 일은 실행해 보지 않아 모른다.
- 레시피 코드를 브라우저에서 돌려 보지 않았다. 값이 원문 표와 맞는지만 대조했다.
- 300ms 상한과 drawer 500ms 중 무엇이 우선인지는 원문이 정하지 않는다.
