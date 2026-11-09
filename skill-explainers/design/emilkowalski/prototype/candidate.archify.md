# prototype 스킬은 에이전트를 어떻게 바꾸나 {#prototype-skill}

`prototype`을 쓰면 에이전트는 사용자가 설명한 UI 조각 하나를 서로 다른 방향의 버전 여러 개로 만든다. 버전들은 고정된 모양의 선택기 뒤에 두어 사용자가 화면에서 넘겨 보게 한다. 에이전트는 고르지 않고 멈추며, 사용자가 고른 버전만 실제 코드에 넣는다.[](source:pr-scope)[](source:pr-p5)[](source:pr-p6)

- 켜지는 때: 사용자가 직접 부를 때만이다. `disable-model-invocation: true`라서 모델이 스스로 켜지 않는다.[](source:pr-fm)
- 강제하는 것: 탐색하는 동안 production 코드를 건드리지 않는다. 버전마다 다른 축을 이름으로 대고, 모든 버전이 실제로 동작해야 한다.[](source:pr-rules)
- 수치: 기본 3개, 사용자가 원하거나 설계 공간이 넓으면 5개까지다. 5개를 넘기면 비교가 흐려진다고 본다.[](source:pr-p3)
- 쓰면 안 되는 때: 기존 UI 리뷰, 기존 UI 수정 계획, 의존성 고르기다. 각각 `review-animations`, `improve-animations`, `pick-ui-library`의 몫이다.[](source:pr-scope)

@answer scope="design/emilkowalski/prototype · 원본 텍스트 2개 15,378B · 커밋 4e3fc89 · 지시상 동작이며 실행해 보지 않음"
@meta locale=ko
@source pr-fm title="design/emilkowalski/prototype/SKILL.md · 7830B · 지시 본문과 frontmatter" path=design/emilkowalski/prototype/SKILL.md lines=1:5
@source pr-init title="SKILL.md · 첫 응답" path=design/emilkowalski/prototype/SKILL.md lines=9:15
@source pr-scope title="SKILL.md · 하는 일과 하지 않는 일" path=design/emilkowalski/prototype/SKILL.md lines=17:17
@source pr-posture title="SKILL.md · 다양성과 기준" path=design/emilkowalski/prototype/SKILL.md lines=19:23
@source pr-rules title="SKILL.md · Hard Rules" path=design/emilkowalski/prototype/SKILL.md lines=25:31
@source pr-p1 title="SKILL.md · Phase 1 범위" path=design/emilkowalski/prototype/SKILL.md lines=35:37
@source pr-p2 title="SKILL.md · Phase 2 사전 조사" path=design/emilkowalski/prototype/SKILL.md lines=39:48
@source pr-p3 title="SKILL.md · Phase 3 방향 고르기" path=design/emilkowalski/prototype/SKILL.md lines=50:56
@source pr-p4 title="SKILL.md · Phase 4 선택기 harness" path=design/emilkowalski/prototype/SKILL.md lines=58:65
@source pr-p5 title="SKILL.md · Phase 5 확인과 넘김" path=design/emilkowalski/prototype/SKILL.md lines=67:80
@source pr-p6 title="SKILL.md · Phase 6 선택 후 반영" path=design/emilkowalski/prototype/SKILL.md lines=82:84
@source pr-variants title="SKILL.md · Invocation Variants" path=design/emilkowalski/prototype/SKILL.md lines=86:94
@source pr-tone title="SKILL.md · Tone" path=design/emilkowalski/prototype/SKILL.md lines=96:98
@source pk-head title="design/emilkowalski/prototype/PICKER.md · 7548B · 선택기 규격" path=design/emilkowalski/prototype/PICKER.md lines=1:5
@source pk-markup title="PICKER.md · Markup" path=design/emilkowalski/prototype/PICKER.md lines=7:22
@source pk-css title="PICKER.md · Styles" path=design/emilkowalski/prototype/PICKER.md lines=24:122
@source pk-rules title="PICKER.md · Rules" path=design/emilkowalski/prototype/PICKER.md lines=124:129
@source pk-contract title="PICKER.md · Behavior contract" path=design/emilkowalski/prototype/PICKER.md lines=131:138
@source pk-js title="PICKER.md · Reference wiring" path=design/emilkowalski/prototype/PICKER.md lines=140:197
@source pk-keys title="PICKER.md · 키 입력 처리 코드" path=design/emilkowalski/prototype/PICKER.md lines=184:192
@source br-role title="design/emilkowalski/break-ui/SKILL.md · 관계 확인용 줄(역할 구분)" path=design/emilkowalski/break-ui/SKILL.md lines=16:16

## 언제 켜지고 언제 쓰면 안 되나 {#trigger}

@code source=pr-fm language=yaml

`disable-model-invocation: true`가 있다. 그래서 이 스킬은 사용자가 직접 부를 때만 켜진다. `description`도 "Only runs when explicitly invoked; it does not trigger on its own."이라고 같은 말을 한다.[](source:pr-fm)

판정: 다른 스킬이 작업 중에 이 스킬을 쓰라고 해도 모델이 혼자 켤 수 없다. 이 스킬을 부르는 다른 스킬 문장은 원장에 없다.

질문 없이 스킬만 불리면 에이전트는 "I'm ready to build several genuinely different versions of a UI piece …"라는 한 문장만 답하고 기다린다.[](source:pr-init)

| 부르는 방식 | 에이전트가 하는 일 |
| --- | --- |
| `<description>` | 전체 흐름. 범위 → 조사 → 3개 버전 → 선택기 → 사용자 선택 대기[](source:pr-variants) |
| `<description> x5` | 같은 흐름에 버전 수만 바꾼다. 상한은 5개다[](source:pr-variants) |
| `riff <variant>` | 새 라운드. harness는 두고, 고른 버전의 방향 주변으로 새 버전들을 만든다[](source:pr-variants) |
| `keep <variant>` | 그 버전을 코드베이스에 넣고 prototype 화면을 지운다[](source:pr-variants) |
| `keep <variant>, leave the picker` | 넣되 prototype 화면은 남긴다[](source:pr-variants) |

| 상황 | 이 스킬을 쓰나 |
| --- | --- |
| "a toast", "the pricing card", "a hold-to-delete button" 같은 UI 조각의 여러 방향 비교 | {good:쓴다}[](source:pr-scope) |
| 기존 UI 리뷰 | {bad:안 쓴다. `review-animations`}[](source:pr-scope) |
| 기존 UI 수정 계획 | {bad:안 쓴다. `improve-animations`}[](source:pr-scope) |
| 의존성 고르기 | {bad:안 쓴다. `pick-ui-library`}[](source:pr-scope) |

## 어떤 순서로 만들고, 사람은 어디서 고르나 {#procedure}

@workflow id=proto-flow title="버전 만들기와 선택"
| lane prep | 준비 |
| lane build | 만들기 |
| lane choose | 선택 |
| pf-scope | 1 범위 한 개 | backend | prep |
| pf-recon | 2 사전 조사 | backend | prep |
| pf-dirs | 3 방향과 축 | backend | prep |
| pf-harness | 4 선택기 harness | backend | build |
| pf-verify | 5 직접 확인 | backend | build |
| pf-user | 사용자가 고르나? | external | choose |
| pf-keep | 6 반영과 정리 | backend | choose |
| pf-scope > pf-recon | |
| pf-recon > pf-dirs | |
| pf-dirs > pf-harness | 이름·축 확정 |
| pf-harness > pf-verify | |
| pf-verify > pf-user | 멈춤 |
| pf-user > pf-keep | keep | emphasis |
| pf-user > pf-dirs | riff | dashed |

@steps id=proto-steps
| pf-scope | 1 범위 한 개 | 한 번에 하나만 만든다. "the dashboard"처럼 여러 컴포넌트에 걸치면 가장 효과가 큰 조각 하나를 골라 이유를 말하고, 나머지는 다음 실행으로 제안한다. 무엇인지, 어디에 놓이는지, 무엇을 해야 하는지를 한 문장으로 다시 말한다.[](source:pr-p1) | proto-flow | pf-scope |
| pf-recon | 2 사전 조사 | 스택, 토큰(색, radius, 간격, 글꼴, easing·duration 변수), 제품 성격, 놓일 맥락을 정리한다. 프로젝트가 없으면 Phase 4의 단독 HTML 갈래로 가고, 중립 회색과 강조색 하나, 시스템 글꼴로 시작한다.[](source:pr-p2) | proto-flow | pf-recon |
| pf-dirs | 3 방향과 축 | 코드를 쓰기 전에 버전마다 이름과 축을 적는다. 이름은 "Quiet", "Editorial"처럼 방향을 말하고 "Option A/B/C"는 안 된다. 강조색이나 문구만 다른 두 방향은 하나로 보고 다른 대안으로 바꾼다. 모든 버전이 이름과 축을 가지고, 축 위치가 겹치지 않아야 이 단계가 끝난다.[](source:pr-p3) | proto-flow | pf-dirs |
| pf-harness | 4 선택기 harness | dev server가 있는 프로젝트면 `/prototypes/<slug>` 같은 격리된 route에 버전마다 파일 하나와 작은 harness 파일을 둔다. production 코드가 이 화면을 import하면 안 된다. 프로젝트가 없으면 CSS·JS를 안에 넣은 HTML 파일 하나를 만든다. 선택기는 `PICKER.md`를 그대로 옮긴다.[](source:pr-p4) | proto-flow | pf-harness |
| pf-verify | 5 직접 확인 | harness를 실행해 모든 버전이 그려지고, 모든 상호작용이 반응하고, console이 깨끗한지 에이전트가 직접 넘겨 보며 확인한다. 브라우저 도구가 있으면 버전마다 screenshot을 찍는다.[](source:pr-p5) | proto-flow | pf-verify |
| pf-user | 사용자가 고르나? | 에이전트는 버전 표를 보여 주고 멈춘다. 선택은 사용자의 몫이다. 선택기가 도는 URL이나 파일 경로, 넘기는 키를 알려 주고 끝낸다.[](source:pr-p5) | proto-flow | pf-user |
| pf-keep | 6 반영과 정리 | 사용자가 고르면 그 버전을 프로젝트 관례(파일 위치, 이름, 토큰)에 맞춰 넣고 prototype 화면을 지운다. 사용자가 한 라운드 더 원하면 harness를 두고 3단계로 돌아가 고른 방향 주변으로 다시 넓힌다.[](source:pr-p6) | proto-flow | pf-keep |

5단계의 완료 조건은 세 가지다. 모든 버전이 선택기에서 닿고 제대로 동작한다. console 오류가 없다. 표가 버전마다 득실을 정직하게 적는다.[](source:pr-p5)

사용자에게 보이는 표는 `# | Variant | Axis | When it's the right choice | Its cost` 열을 가진다. 원문 예의 1행은 Quiet(움직임 최소, 그림자 대신 테두리, 매일 쓰는 도구에 맞음, 가장 덜 기억됨)다.[](source:pr-p5)

표에서 미리 하나를 추천하지 않는다. 사용자가 어느 쪽이냐고 물으면 미감만이 아니라 제품 성격과 사용 빈도에 근거해 답한다. 만드는 중에 두 버전이 비슷해지면 하나를 빼고 그렇다고 말한다.[](source:pr-tone)

## 무엇을 강제하고 금지하나 {#rules}

| Hard Rule | 원문 내용 |
| --- | --- |
| 1. 탐색 중 production 코드 금지 | 모든 것을 격리된 prototype 화면에 둔다. 통합은 6단계에서, 사용자가 고른 버전만 한다[](source:pr-rules) |
| 2. 이름 붙은 축으로 갈라진다 | layout, density, personality, motion, interaction model 같은 축을 버전마다 한 구절로 댈 수 있어야 한다. 프로젝트 토큰을 같이 쓰는 것은 수렴이 아니다[](source:pr-rules) |
| 3. 모든 버전이 실제로 동작 | 실제 상호작용, 실제 움직임, 제품다운 문구와 그럴듯한 이름·숫자. lorem ipsum, 죽은 버튼, "imagine this part"는 금지[](source:pr-rules) |
| 4. 선택기는 경쟁자가 아니다 | `PICKER.md`의 마크업·스타일·동작을 그대로 옮긴다. 프로젝트에 맞춰 바꾸지 않는다[](source:pr-rules) |
| 5. 고른 뒤 정리 | 승자를 반영하면 사용자가 남기라고 하지 않는 한 prototype 화면을 지운다[](source:pr-rules) |

버전을 다양하게 만든다고 품질 기준이 내려가지 않는다. 모든 버전은 아래 기준을 각각 지킨다.[](source:pr-posture)

@facts
| easing | 진입은 `ease-out`, `ease-in`은 쓰지 않는다 |
| duration | UI 모션은 300ms 미만 |
| 원점 | 올바른 `transform-origin` |
| 속성 | `transform`과 `opacity`만 |
| 접근성 | reduced motion 처리 |

harness 화면에도 규칙이 있다. 한 번에 버전 하나를 실제 크기로, 실제와 같은 주변 맥락에서 보여 준다. toast는 뒤에 페이지가, 카드는 옆에 형제 카드가, 버튼은 form이 있어야 한다. 나란히 놓은 썸네일은 간격과 크기를 왜곡하므로 쓰지 않는다.[](source:pr-p4)

버전 전환은 즉시 한다. 한 세션에 100번 넘게 넘기는 동작이라 빈도 규칙상 애니메이션을 주지 않는다.[](source:pr-p4)

## 선택기는 어떻게 생기고 어떻게 동작하나 {#picker}

선택기 모양은 디자인 결정이 아니고 `PICKER.md`가 정한 규격이다. 실행마다 바뀌는 값은 버전 이름과 개수뿐이다. 프로젝트의 토큰, 글꼴, 색으로 다시 꾸미지 않는다.[](source:pk-head) 화면 아래 가운데에 떠 있는 어두운 알약 모양이고, 밝은 페이지와 어두운 페이지 모두에서 보이도록 테마를 따르지 않는다.[](source:pk-head)

@facts
| 위치 | `position: fixed`, `bottom: 24px`, 가운데, `z-index: 2147483647` |
| 크기 | 버튼 높이 28px, 글자 13px, 안쪽 여백 4px, `border-radius: 999px` |
| 배경 | `rgba(10, 10, 10, 0.82)`, `backdrop-filter: blur(12px) saturate(1.4)` |
| 강조 이동 | `transform`과 `width` 250ms `cubic-bezier(0.23, 1, 0.32, 1)`. reduced motion이면 transition 없음 |
| 버튼 | 글자색 transition 150ms `ease-out`, 누르면 `scale(0.97)` |

마크업은 강조 span, 버전마다 버튼 하나, 구분선, 다시 재생 버튼 순서다. framework에서는 class 이름과 구조를 유지하고 렌더링 문법만 바꾼다.[](source:pk-markup)

| 규칙 | 원문 내용 |
| --- | --- |
| 그대로 옮긴다 | 값이 곧 규격이다. 프로젝트 글꼴, 브랜드 색, 테마 전환, 추가 그림자·테두리 금지[](source:pk-rules) |
| 강조만 미끄러진다 | 활성 알약은 250ms로 움직이지만 미리보기 버전은 transition 없이 바뀐다. `width` transition은 높이 28px, 절대 위치, 레이아웃 의존이 없어서 허용한 예외다[](source:pk-rules) |
| 허용된 수정 하나 | 버전이 화면 아래 가운데를 차지하면(toast stack, bottom sheet, dock) `data-position="top"`으로 위로 옮긴다(`top: 24px`). 그 밖에는 아무것도 바꾸지 않는다[](source:pk-rules)[](source:pk-css) |
| 다시 재생은 조건부 | 다시 띄울 진입·상태 애니메이션이 있는 버전이 하나 이상일 때만 재생 버튼과 구분선을 그린다[](source:pk-rules) |

동작 약속은 harness를 어떻게 그리든 같다.[](source:pk-contract)

- 숫자 키 `1–N`과 `←`/`→`로 버전을 바꾸고 `R`로 다시 재생한다. input, textarea, select, contenteditable에 포커스가 있거나 modifier 키를 누르고 있으면 키 입력을 무시한다.
- 항목을 누르면 그 버전으로 바뀐다. 언제나 정확히 한 항목만 `data-active`와 `aria-current="true"`를 가진다.
- 선택은 URL 인자(`?v=2`)로 새로고침 뒤에도 남고, 없으면 1번이다. 첫 위치는 애니메이션 없이 잡는다(첫 paint 뒤에 `data-ready`를 붙인다).
- 전환하면 버전을 다시 mount해서 진입 애니메이션이 다시 돈다. 재생 키는 전환 없이 다시 mount한다.

단독 HTML 갈래에서는 `PICKER.md`의 참조 JS를 그대로 쓴다. framework에서는 같은 동작을 state, key로 다시 mount, ref와 layout effect로 표현한다.[](source:pk-js)

## 흐름 속 위치 {#position}

@workflow id=proto-position title="prototype 앞뒤"
| pp-user | 사용자 호출 | external |
| pp-proto | prototype | backend |
| pp-pick | 사용자 선택 | external |
| pp-user > pp-proto | 명시 호출 |
| pp-proto > pp-pick | 선택기 | emphasis |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `review-animations` | - | - | 참고. 기존 UI 리뷰는 그 스킬의 몫이라고 역할을 나눈다[](source:pr-scope) | r19 |
| `improve-animations` | - | - | 참고. 기존 UI 수정 계획은 그 스킬의 몫이라고 역할을 나눈다[](source:pr-scope) | r20 |
| `pick-ui-library` | - | - | 참고. 의존성 고르기는 그 스킬의 몫이라고 역할을 나눈다[](source:pr-scope) | r21 |
| `break-ui` | - | - | 참고. `break-ui`가 컴포넌트 재설계는 이 스킬의 몫이라고 역할을 나눈다[](source:br-role) | r16 |

이 스킬 앞뒤에 오는 스킬은 없다. 사용자가 직접 부르고, 결과는 사용자가 고른다. 네 관계는 모두 역할 구분 참고라 그림에 넣지 않고 표에만 남겼다. 원장의 `ui-component` 묶음도 r16, r21을 표에만 둔다.

전체 흐름은 `design/_group-ui-component/ui-component.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 2개, 합계 15,378B다. `SKILL.md` 7,830B, `PICKER.md` 7,548B다.
- 관계 확인용으로 `break-ui/SKILL.md`의 16줄 한 줄을 봤다. 읽은 파일 수에는 넣지 않았다.
- 구조·표본만 본 파일과 바이너리 파일은 없다.
- 제외한 파일: `SKILL.ko.md`(10,052B), `PICKER.ko.md`(8,380B)는 번역본이라 열지 않았다.
- 원문 대조 범위: 활성화 제한 1개(`disable-model-invocation: true`), Hard Rules 5개, 단계 6개와 완료 조건 2개, 사람 선택 지점 1개, 부르는 방식 5행, 품질 기준 5개, 선택기 규칙 4개와 동작 약속 4개, 수치(버전 3개·5개 상한, 300ms, 250ms, 24px, 28px, `?v=2`)를 모두 대조했다. 관계 행 r16, r19, r20, r21은 원장과 원문을 다시 대조했고 같다.
- 분석 중 바뀐 파일: 없음. `design/` 아래 작업 트리는 commit `4e3fc89` 그대로다.

@callout level=open-question title="원문끼리 어긋나거나 정해지지 않은 것"
- 동작 약속은 modifier 키를 누르면 무시하라고 한다. 참조 JS는 `metaKey`, `ctrlKey`, `altKey`만 검사하고 Shift는 검사하지 않는다. Shift와 `R`을 함께 누르면 다시 재생된다고 읽힌다. 실행해 확인하지는 않았다.[](source:pk-contract)[](source:pk-keys)
- Hard Rule 1은 탐색 중 production 코드를 건드리지 말라고 한다. 프로젝트 안의 `/prototypes/<slug>` route가 production 빌드에 들어가는지는 `원문에 명시 없음`이다. 원문은 production 코드가 이 화면을 import하지 않는다는 것까지만 정한다.[](source:pr-rules)[](source:pr-p4)
- 실행 중 screenshot은 브라우저 도구가 있을 때만 찍는다. 없을 때의 확인 방법은 `원문에 명시 없음`이다.[](source:pr-p5)
