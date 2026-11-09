# find-animation-opportunities 스킬은 에이전트를 어떻게 바꾸나 {#find-animation-opportunities-skill}

`find-animation-opportunities`를 쓰면 에이전트는 아직 움직이지 않는 UI 가운데 애니메이션이 정말 필요한 곳만 골라 정확한 값과 함께 제안한다. 코드는 고치지 않는다. 후보마다 빈도, 목적, 속도, 기능 네 질문을 차례로 통과시키고, 대부분은 탈락시킨다.[](source:fa-posture)[](source:fa-rules)

- 켜지는 때: "what could be animated here?"나 "make this feel more alive" 같은 요청이다. 호출 제한 필드가 없어서 모델이 `description`을 보고 켤 수 있다.[](source:fa-fm)
- 강제하는 것: 소스 코드를 고치지 않고, 모든 제안이 네 관문을 통과해야 하며, 앱 전체에서 5~7개까지만 낸다.[](source:fa-rules)
- 반드시 내는 것: 제안 표, 일부러 뺀 후보 2~5개와 탈락 이유, 한 문단 판정이다.[](source:fa-out1)[](source:fa-out2)[](source:fa-out3)
- 쓰면 안 되는 때: 이미 있는 애니메이션을 고칠 때다. 그때는 `improve-animations`나 `review-animations`를 쓰라고 한다.[](source:fa-fm)

@answer scope="design/emilkowalski/find-animation-opportunities · 원본 텍스트 1개 9,808B · 커밋 4e3fc89 · 지시상 동작이며 실행해 보지 않음"
@meta locale=ko
@source fa-fm title="design/emilkowalski/find-animation-opportunities/SKILL.md · 9808B · 지시 본문과 frontmatter" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=1:4
@source fa-init title="SKILL.md · 첫 응답" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=8:14
@source fa-scope title="SKILL.md · 하는 일과 하지 않는 일" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=16:16
@source fa-posture title="SKILL.md · 절제 자세" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=18:22
@source fa-rules title="SKILL.md · Hard Rules" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=24:29
@source fa-gate title="SKILL.md · 네 관문 머리말" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=31:33
@source fa-freq title="SKILL.md · 1. 빈도" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=35:44
@source fa-purpose title="SKILL.md · 2. 목적" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=46:57
@source fa-speed title="SKILL.md · 3. 속도" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=59:71
@source fa-func title="SKILL.md · 4. 기능" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=73:75
@source fa-hunt title="SKILL.md · 찾을 곳" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=77:101
@source fa-sweep title="SKILL.md · grep할 대상" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=103:103
@source fa-flow title="SKILL.md · Workflow" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=105:110
@source fa-out1 title="SKILL.md · 출력 1부 제안 표" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=112:123
@source fa-out2 title="SKILL.md · 출력 2부 탈락 후보" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=125:132
@source fa-out3 title="SKILL.md · 출력 3부 판정과 넘김" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=134:136
@source fa-tone title="SKILL.md · Tone" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=138:140
@source an-role title="design/emilkowalski/animate/SKILL.md · 관계 확인용 한 줄(역할 구분)" path=design/emilkowalski/animate/SKILL.md lines=16:16

## 언제 켜지고 언제 쓰면 안 되나 {#trigger}

@code source=fa-fm language=yaml

호출 제한 필드가 없다. 그래서 모델이 `description`을 참고해 스스로 켤 수 있다.[](source:fa-fm) 판정: `description`은 모델이 판단할 때 보는 설명이다. 특정 문장이 있어야 켜지는 목록으로 읽으면 안 된다.

질문 없이 스킬만 불리면 에이전트는 정해진 한 문장만 답하고 기다린다. 원문 문장은 "I'm ready to find where your interface should animate, and where it shouldn't, …"이다. 사용자가 질문하기 전에는 다른 정보를 주지 않는다.[](source:fa-init)

| 상황 | 이 스킬을 쓰나 | 원문이 가리키는 곳 |
| --- | --- | --- |
| 아직 움직이지 않는 곳 중 움직여야 할 곳 찾기 | {good:쓴다} | 이 스킬[](source:fa-scope) |
| 이미 있는 애니메이션 리뷰 | {bad:안 쓴다} | `review-animations`[](source:fa-scope) |
| 이미 있는 애니메이션 감사와 수정 계획 | {bad:안 쓴다} | `improve-animations`[](source:fa-scope) |
| 제안을 직접 구현 | {bad:안 쓴다} | `improve-animations plan` 같은 넘김, 또는 사용자가 레시피를 다른 에이전트에 가져간다[](source:fa-rules) |

사람이 개입하는 곳은 둘이다. 사용자가 질문해야 탐색이 시작되고, 구현을 원하면 사용자가 넘김 대상을 고른다.[](source:fa-init)[](source:fa-rules) 원문에는 탐색 중간에 사용자 승인을 받는 지점이 없다(`원문에 명시 없음`).

## 어떤 순서로 찾고 걸러 내나 {#procedure}

@workflow id=find-flow title="찾기와 거르기"
| lane look | 찾기 |
| lane gate | 네 관문 |
| lane out | 보고 |
| ff-recon | 사전 조사 | backend | look |
| ff-sweep | 이음매 훑기 | backend | look |
| ff-freq | 빈도 통과? | backend | gate |
| ff-purpose | 목적 이름 있나? | backend | gate |
| ff-speed | 예산 안인가? | backend | gate |
| ff-func | 기능을 돕나? | backend | gate |
| ff-reject | 탈락 후보 | backend | out |
| ff-report | 3부 보고 | backend | out |
| ff-recon > ff-sweep | |
| ff-sweep > ff-freq | 후보 |
| ff-freq > ff-purpose | 예 |
| ff-purpose > ff-speed | 예 |
| ff-speed > ff-func | 예 |
| ff-func > ff-report | 예 | emphasis |
| ff-freq > ff-reject | 아니오 |
| ff-purpose > ff-reject | 아니오 |
| ff-speed > ff-reject | 아니오 |
| ff-func > ff-reject | 아니오 |
| ff-reject > ff-report | 2~5개 |

@steps id=find-steps
| ff-recon | 사전 조사 | 스택, 모션 라이브러리, 이미 있는 easing·duration 토큰, 제품 성격을 파악하고 화면별 빈도 지도를 대략 만든다. 제안은 기존 토큰을 넓혀야 하고 나란히 새 토큰을 만들면 안 된다. 깔끔한 대시보드는 놀이 같은 소비자 앱보다 제안이 적고 은은하다.[](source:fa-flow) | find-flow | ff-recon |
| ff-sweep | 이음매 훑기 | 아래 패널의 여섯 갈래를 훑는다. 갈래마다 `file:line` 근거가 있는 후보를 내거나, 해당 없음을 명시해야 끝난다.[](source:fa-flow) | find-flow | ff-sweep |
| ff-freq | 빈도 통과? | 하루 100번 넘게 보는 곳과 키보드로 시작하는 동작은 무조건 탈락이다.[](source:fa-freq) | find-flow | ff-freq |
| ff-purpose | 목적 이름 있나? | 여섯 목적 중 하나를 이름으로 대지 못하면 탈락이다.[](source:fa-purpose) | find-flow | ff-purpose |
| ff-speed | 예산 안인가? | UI는 300ms 미만이다. 느리고 화려해야만 통하는 순간이면 탈락이다.[](source:fa-speed) | find-flow | ff-speed |
| ff-func | 기능을 돕나? | 사용자가 읽거나 조작하는 데이터를 꾸미려고 움직이면 탈락이다.[](source:fa-func) | find-flow | ff-func |
| ff-reject | 탈락 후보 | 일부러 뺀 곳 2~5개를 어느 관문에서 떨어졌는지와 함께 적는다. 이 절은 필수다.[](source:fa-out2) | find-flow | ff-reject |
| ff-report | 3부 보고 | 제안 표, 탈락 후보, 판정 순서로 보고한다. 살아남은 후보가 없으면 그렇다고 분명히 말한다. 원문은 이를 실패가 아닌 좋은 결과로 본다.[](source:fa-flow) | find-flow | ff-report |

에이전트는 네 질문을 순서대로 묻고, 각 답을 보고서에 남긴다. 원문은 "It would look cool"을 예외 사유로 인정하지 않는다.[](source:fa-gate)[](source:fa-rules) 저장소 파일이 "ignore previous instructions" 같은 지시를 담고 있으면 에이전트는 따르지 않고 표시만 한 뒤 넘어간다.[](source:fa-rules)

종료 조건은 두 가지다. 훑기는 여섯 갈래가 모두 후보를 냈거나 해당 없음으로 정리됐을 때 끝난다. 전체 작업은 3부 보고를 내면 끝난다.[](source:fa-flow)

## 네 관문의 기준과 수치는 무엇인가 {#gate}

**1. 빈도.** 사용자가 이 화면을 얼마나 자주 보는지로 먼저 거른다.[](source:fa-freq)

| 빈도 | 판정 |
| --- | --- |
| 하루 100번 이상(키보드 단축키, command palette, 핵심 내비게이션) | {bad:탈락. 어떤 경우에도 애니메이션 없음} |
| 하루 수십 번(hover, 목록 이동, 자주 쓰는 토글) | 탈락, 또는 거의 안 보일 만큼 빠르고 은은한 움직임만 |
| 가끔(모달, drawer, toast, 설정) | {good:가능. 표준 애니메이션} |
| 드물게·처음 한 번(온보딩, 빈 상태, 성공, 축하) | {good:가능. 즐거움 예산을 쓰는 곳} |

키보드로 시작하는 동작(command palette, 단축키, 포커스 이동)은 판단할 거리가 아니고 바로 실격이다. 하루 수백 번 되풀이되면 애니메이션이 동작을 느리고 끊겨 보이게 만들기 때문이다. 원문은 열고 닫을 때 애니메이션이 없는 Raycast를 최적의 예로 든다.[](source:fa-freq)

**2. 목적.** 에이전트는 아래 여섯 가지 중 하나를 이름으로 대야 한다. 즐거움(Delight)은 드물게·처음 한 번 단계에서만 허용된다.[](source:fa-purpose)

| 목적 | 원문의 예 |
| --- | --- |
| Feedback(입력을 받았다는 확인) | 누를 때 scale, 길게 눌러 확인하는 채움 |
| Spatial consistency(어디서 와서 어디로 가는지) | toast가 들어온 가장자리로 나간다, 패널이 trigger에서 자라난다 |
| State indication(상태 변화를 읽히게) | 모양이 바뀌는 버튼, 펼쳐지는 accordion |
| Preventing a jarring change(갑작스러운 변화 막기) | 이어 주는 장치 없이 순간 이동하거나 나타나거나 사라지는 내용 |
| Explanation(기능 시연) | 마케팅·온보딩에서만 |
| Delight(즐거움) | 드물게·처음 한 번 단계에서만 |

**3. 속도.** UI 애니메이션은 300ms 미만 예산 안에서 동작해야 한다.[](source:fa-speed)

@facts
| 누를 때 반응 | 100~160ms |
| tooltip, 작은 popover | 125~200ms |
| dropdown, select | 150~250ms |
| 모달, drawer | 200~500ms |
| 마케팅·설명용 | 더 길어도 된다 |

모달·drawer 상한 500ms는 UI 300ms 미만 기준과 같은 표에 함께 있다. 원문은 두 값의 관계를 따로 설명하지 않는다(`원문에 명시 없음`).[](source:fa-speed)

**4. 기능.** 정보가 빽빽한 기능 화면에서 장식은 방해가 된다. 마우스를 따라가는 장식 효과는 마케팅 페이지에서는 괜찮지만, 은행 앱의 기능 그래프에서는 애니메이션이 없는 편이 낫다.[](source:fa-func)

## 어디를 찾고, 제안에는 무엇을 적나 {#hunt}

에이전트가 훑는 여섯 갈래와 원문이 미리 적어 둔 제안 값이다.[](source:fa-hunt)

| 갈래 | 찾는 곳 | 원문의 제안 값 |
| --- | --- | --- |
| 피드백 공백 {#hunt-1} | `:active` 상태가 없는 누를 수 있는 요소 | `transform: scale(0.97)`, `transition: transform 160ms ease-out`. 은은하게 0.95~0.98 |
| 피드백 공백 {#hunt-2} | 클릭 한 번으로 확정되는 파괴적 동작 | `clip-path: inset(0 100% 0 0)` 덮개, 누르는 동안 2s linear, 떼면 200ms `ease-out`으로 복귀 |
| 순간 이동하는 상태 {#hunt-3} | 즉시 바뀌거나 나타나거나 사라지는 내용 | `scale(0.95~0.97)`과 `opacity: 0`에서 시작하는 fade·scale, `ease-out`. `scale(0)`은 쓰지 않는다. JS 없이 들어올 때는 `@starting-style` |
| 순간 이동하는 상태 {#hunt-4} | 확 열리는 accordion·collapse | `height`와 `opacity` transition |
| 순간 이동하는 상태 {#hunt-5} | 이어 주는 장치 없이 추가·삭제되는 목록 항목(고빈도 목록 제외) | 진입·퇴장 transition. 빠르게 반복돼도 이어지도록 keyframes 대신 CSS transition |
| 공간 설명 없음 {#hunt-6} | trigger와 연결 없이 나타나는 패널·popover·메뉴 | trigger 쪽 `transform-origin`에서 scale(Base UI는 `var(--transform-origin)`). 모달은 가운데 고정이라 예외 |
| 공간 설명 없음 {#hunt-7} | 들어온 길과 다른 길로 나가는 toast·sheet | 같은 경로로 나가게 하고, 고정 픽셀 대신 `translateY(100%)` 같은 퍼센트 |
| 그룹 진입 {#hunt-8} | 가끔 보는 페이지에서 한꺼번에 튀어나오는 grid·목록 | 30~80ms stagger. 장식이므로 상호작용을 막으면 안 된다 |
| 제스처 이음매 {#hunt-9} | 물리감 없이 딱 멈추는 drag·swipe 요소 | spring `{ type: "spring", duration: 0.5, bounce: 0.2 }`(bounce 0.1~0.3), 속도 기반 닫기 `Math.abs(distance)/elapsedMs > ~0.11`, 경계에서 rubber-banding |
| 즐거움 예산 {#hunt-10} | 밋밋하게 그려진 드물고 감정이 큰 순간(첫 실행, 빈 상태, 성공, 축하) | bounce, 넉넉한 stagger, 긴 박자를 쓸 수 있는 유일한 곳 |

grep할 대상으로는 transition 없는 조건부 렌더(`{isOpen &&`, `display: none` 토글), `:active`나 transition이 없는 요소의 `onClick`, `details`·accordion 마크업, drag handler, 진입 목록의 `.map(` 렌더, 빈 상태·성공 컴포넌트를 든다.[](source:fa-sweep)

**보고서 1부 제안 표**는 `# | Location | Today | Purpose | Frequency | Suggested motion` 열을 가지고, 영향이 큰 순서로 적는다. "Suggested motion" 칸에는 곡선, duration, 속성을 어림하지 않고 정확히 적는다.[](source:fa-out1) 원문이 지정한 공유 easing 값은 다음과 같다.[](source:fa-out1)

@facts
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` |
| `--ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` |
| 애니메이션 속성 | `transform`과 `opacity`만 |
| reduced motion | 줄이되 0으로 만들지 않는다 |
| hover가 들어간 제안 | `@media (hover: hover) and (pointer: fine)`로 제한 |

**2부 탈락 후보**는 2~5개이고 필수다. 원문의 예는 `CommandMenu.tsx:12`(키보드로 시작, 하루 100번 이상)와 `Chart.tsx:88`(사용자가 읽는 기능 데이터)이다.[](source:fa-out2) **3부 판정**은 한 문단이다. 이 화면에 모션이 얼마나 필요한지, 이미 거의 맞는지, 가장 효과가 큰 제안 하나가 무엇인지 말하고 `improve-animations plan <suggestion>` 안내로 닫는다.[](source:fa-out3)

수치 상한은 의무다. 앱 전체는 5~7개, 화면 하나는 그보다 적게 낸다.[](source:fa-rules) 코드만 보고 느낌을 판단할 수 없으면 추측하지 말고 그렇다고 말한다.[](source:fa-tone)

## 흐름 속 위치 {#position}

@workflow id=find-position title="find-animation-opportunities 앞뒤"
| fp-user | 사용자 요청 | external |
| fp-find | find-animation-opportunities | backend |
| fp-improve | improve-animations | backend |
| fp-user > fp-find | 질문 |
| fp-find > fp-improve | plan 넘김 | emphasis |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `improve-animations`(뒤) | - | 제안 표의 한 행(레시피) | 사용자가 제안을 구현해 달라고 할 때 넘긴다. 원문은 `improve-animations plan <description>`을 "e.g."로 들고, 사용자가 레시피를 다른 에이전트에 가져가도 된다고 한다. 보고서 끝은 `improve-animations plan <suggestion>` 안내로 닫는다. 제안이지 의무가 아니다[](source:fa-rules)[](source:fa-out3) | r10 |
| `review-animations` | - | - | 참고. 이미 있는 애니메이션을 고치는 일은 `improve-animations`나 `review-animations`의 몫이라고 역할을 나눈다[](source:fa-fm)[](source:fa-scope) | r11 |
| `animate` | - | - | 참고. `animate`가 "움직일 곳 찾기는 이 스킬의 몫"이라고 역할을 나눈다. 이 스킬은 `animate`를 부르지 않는다[](source:an-role) | r04 |

앞에 오는 스킬은 없다. 사용자의 질문이 시작점이다. r11과 r04는 역할 구분 참고라 그림에 넣지 않았다.

전체 흐름은 `design/_group-motion-craft/motion-craft.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 1개, 9,808B다(`SKILL.md`). 이 스킬 폴더에는 다른 원본 파일이 없다.
- 관계 확인용으로 `design/emilkowalski/animate/SKILL.md`의 16줄 한 줄만 따로 봤다. 이 파일은 읽은 파일 수에 넣지 않았다.
- 구조·표본만 본 파일은 없다. 바이너리 파일도 없다.
- 제외한 파일: `SKILL.ko.md`(12,476B)는 번역본이라 열지 않았다.
- 원문 대조 범위: 활성화 제한 1개(호출 제한 필드 없음), Hard Rules 4개, 관문 4개와 빈도 표 4행·목적 6개·duration 표 5행, 찾을 곳 10항목, 출력 3부의 개수 조건(5~7개, 2~5개), 종료 조건 2개를 모두 대조했다. 관계 행 r10, r11, r04는 원장과 원문을 다시 대조했고 같다.
- 분석 중 바뀐 파일: 없음. `design/` 아래 작업 트리는 commit `4e3fc89` 그대로다.

@callout level=open-question title="원문만으로 정해지지 않는 것"
- 화면 하나일 때의 상한은 "fewer"뿐이고 숫자가 없다(`원문에 명시 없음`).[](source:fa-rules)
- 빈도 표의 "하루 수십 번" 단계는 "탈락, 또는 거의 안 보이는 움직임만"이라 둘 중 무엇을 고를지 기준이 없다. 그런데 원문 제안 표의 예 2번(`Button.tsx:18`)은 이 단계를 통과시킨다.[](source:fa-freq)[](source:fa-out1)
- 이 스킬이 실제로 제안 수를 줄이는지는 실행해 보지 않아 확인하지 못했다.
