# motion-craft 묶음은 어떻게 이어지나 {#motion-craft-group}

emilkowalski의 모션 스킬 여섯 개는 한 줄로 이어진 파이프라인이 아니다. 각자 "나는 이것 하나만 한다"고 선언하고, 나머지 일은 이름을 대며 다른 스킬의 몫으로 돌린다. 실제로 다음 스킬을 쓰라고 권하는 곳은 `find-animation-opportunities`가 `improve-animations plan`을 안내하는 한 곳뿐이다(r10).[](source:fi-26)[](source:an-16)

- 여섯 스킬의 경계는 서로의 소개 문단에 적혀 있다. 예를 들어 `animate`는 감사는 `improve-animations`, 리뷰는 `review-animations`, React Native는 `animate-expo`의 몫이라고 한다(r03~r05).[](source:an-16)
- `review-animations`는 기준점 역할을 한다. `animate`는 그 리뷰를 한 번에 통과하게 쓰라고 하고, `improve-animations`는 `execute` 모드에서 그 기준으로 diff를 판정한다(r01, r12).[](source:an-20)[](source:im-104)
- 그런데 `review-animations`는 `disable-model-invocation: true`라 모델이 스스로 켜지 못한다. 리뷰를 받으려면 사용자가 직접 불러야 한다.[](source:rv-fm)

@answer scope="design/emilkowalski 모션 스킬 여섯 개 · 커밋 4e3fc89 · 지시상 동작 · 스킬 간 관계는 원장 rel-id 기준"
@meta locale=ko
@source an-fm title="design/emilkowalski/animate/SKILL.md · frontmatter" path=design/emilkowalski/animate/SKILL.md lines=1:4
@source an-16 title="animate/SKILL.md · 하는 일 하나와 다른 스킬의 몫" path=design/emilkowalski/animate/SKILL.md lines=16:16
@source an-20 title="animate/SKILL.md · review-animations와 같은 기준" path=design/emilkowalski/animate/SKILL.md lines=20:20
@source an-177 title="animate/SKILL.md · 끝내기 전 자체 점검" path=design/emilkowalski/animate/SKILL.md lines=177:177
@source ex-fm title="design/emilkowalski/animate-expo/SKILL.md · frontmatter(웹은 animate)" path=design/emilkowalski/animate-expo/SKILL.md lines=1:4
@source pf-fm title="design/emilkowalski/animation-performance/SKILL.md · frontmatter" path=design/emilkowalski/animation-performance/SKILL.md lines=1:4
@source pf-16 title="animation-performance/SKILL.md · 하는 일 하나" path=design/emilkowalski/animation-performance/SKILL.md lines=16:16
@source fi-fm title="design/emilkowalski/find-animation-opportunities/SKILL.md · frontmatter" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=1:4
@source fi-16 title="find-animation-opportunities/SKILL.md · 하는 일 하나" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=16:16
@source fi-26 title="find-animation-opportunities/SKILL.md · 코드를 고치지 않고 넘긴다" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=26:26
@source fi-136 title="find-animation-opportunities/SKILL.md · 보고 끝의 안내" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=136:136
@source im-fm title="design/emilkowalski/improve-animations/SKILL.md · frontmatter" path=design/emilkowalski/improve-animations/SKILL.md lines=1:4
@source im-18 title="improve-animations/SKILL.md · 하는 일 하나" path=design/emilkowalski/improve-animations/SKILL.md lines=18:18
@source im-modes title="improve-animations/SKILL.md · 명령 표" path=design/emilkowalski/improve-animations/SKILL.md lines=101:105
@source im-104 title="improve-animations/SKILL.md · execute 모드" path=design/emilkowalski/improve-animations/SKILL.md lines=104:104
@source rv-fm title="design/emilkowalski/review-animations/SKILL.md · frontmatter(호출 제한)" path=design/emilkowalski/review-animations/SKILL.md lines=1:5
@source rv-verdict title="review-animations/SKILL.md · Block과 Approve" path=design/emilkowalski/review-animations/SKILL.md lines=112:113

## 여섯 스킬은 서로 어떻게 가리키나 {#route span=12}

@workflow id=motion-route title="여섯 스킬 사이에 원문이 적은 관계"
| find | find-animation-opportunities | backend |
| improve | improve-animations | backend |
| perf | animation-performance | backend |
| expo | animate-expo | backend |
| anim | animate | backend |
| review | review-animations | backend |
| find > improve | plan 안내 | emphasis |
| improve > review | 같은 기준 | dashed |
| perf > anim | easing은 여기 | dashed |
| expo > anim | 웹은 여기 | dashed |
| anim > review | 같은 기준 | dashed |

@steps id=route-steps
| find | find-animation-opportunities | 움직이지 않는 곳 중 정말 필요한 곳만 골라 수치와 함께 제안한다. 코드는 고치지 않는다. 구현을 원하면 `improve-animations plan <suggestion>`을 예로 들며 넘긴다(r10, 제안). 그림에서 실선은 이 하나뿐이다. | motion-route | find |
| improve | improve-animations | 코드베이스의 모션 코드를 감사해 우선순위 목록과 구현 계획을 쓴다. `execute <plan>`이면 실행 서브에이전트가 격리된 worktree에서 구현하고, `review-animations` 기준으로 diff를 판정한다(r12). | motion-route | improve |
| perf | animation-performance | 프레임이 떨어지는 원인을 찾는다. easing·duration·애니메이션 여부 결정은 `animate`, 리뷰는 `review-animations`의 몫이라고 한다(r07, r08). | motion-route | perf |
| expo | animate-expo | React Native·Expo의 모션을 구현한다. 웹 애니메이션은 `animate`를 쓰라고 한다(r06). | motion-route | expo |
| anim | animate | 애니메이션을 정해진 결정 순서로 직접 구현한다. 끝내기 전에 `review-animations`에서 자동으로 막히는 항목으로 자체 점검한다(r01). | motion-route | anim |
| review | review-animations | 모션 코드를 높은 기준으로 리뷰해 `Block` 또는 `Approve`를 낸다. 명시 호출만 된다. | motion-route | review |

점선은 "그건 저 스킬의 몫" 또는 "같은 기준을 쓴다"는 참고 관계다. 판정: 요청에 따라 어느 스킬로 시작할지는 각 description이 정한다. 움직일 곳 찾기는 `find-animation-opportunities`, 전체 감사는 `improve-animations`, 새로 구현은 `animate`, 끊김은 `animation-performance`, React Native는 `animate-expo`다.[](source:fi-fm)[](source:im-fm)[](source:an-fm)[](source:pf-fm)[](source:ex-fm)

근거: 역할 구분 문장은 `animate` 16줄,[](source:an-16) `animation-performance` 16줄,[](source:pf-16) `find-animation-opportunities` 16줄,[](source:fi-16) `improve-animations` 18줄,[](source:im-18) `animate-expo` description이다.[](source:ex-fm) 넘김 안내는 `find-animation-opportunities` 26·136줄,[](source:fi-26)[](source:fi-136) 판정 결과는 `review-animations` 112~113줄이다.[](source:rv-verdict)

## 리뷰 기준점은 왜 자동으로 이어지지 않나 {#review-gate}

@callout level=warning title="여러 스킬이 가리키는 review-animations는 사용자가 불러야 켜진다"
`animate`, `animation-performance`, `find-animation-opportunities`, `improve-animations`, `mobile-native`, `break-ui`, `prototype`이 모두 리뷰를 `review-animations`의 몫으로 둔다(r01, r08, r11, r12, r15, r18, r19). 그러나 `review-animations`의 frontmatter는 `disable-model-invocation: true`다.[](source:rv-fm)
판정: 그림의 점선은 "같은 기준을 쓴다"는 뜻이다. 다른 스킬이 끝난 뒤 리뷰가 저절로 실행된다는 뜻이 아니다. `improve-animations`의 `execute`도 스킬을 호출한다고 적지 않고 "그 기준으로" 판정한다고만 적는다.[](source:im-104)

| 스킬 | 모델이 스스로 켤 수 있나 | 코드를 고치나 |
| --- | --- | --- |
| `find-animation-opportunities` | 있다[](source:fi-fm) | {good:고치지 않는다} 제안만[](source:fi-26) |
| `improve-animations` | 있다[](source:im-fm) | 직접 고치지 않는다. `execute`에서는 실행 서브에이전트가 고친다[](source:im-104) |
| `animate` | 있다[](source:an-fm) | 고친다(구현) |
| `animation-performance` | 있다[](source:pf-fm) | 원문 기준은 스킬 페이지 참고 |
| `animate-expo` | 있다[](source:ex-fm) | 고친다(구현) |
| `review-animations` | {bad:없다} 명시 호출만[](source:rv-fm) | 리뷰만 한다 |

## 무엇을 주고받나 {#handoff}

| rel-id | from → to | 종류 | 조건·강도 | 주고받는 것 |
| --- | --- | --- | --- | --- |
| r10 | `find-animation-opportunities` → `improve-animations` | 넘김 | 구현을 원하면 `improve-animations plan <description>`을 예로 든다("e.g."). 다른 에이전트에 레시피를 가져가도 된다(제안) | 제안 표의 한 행 |
| r12 | `improve-animations` → `review-animations` | 참고 | `execute`에서 그 기준으로 실행 diff를 판정한다 | 실행 diff |
| r01 | `animate` → `review-animations` | 참고 | 그 리뷰를 한 번에 통과하게 쓰라. 자체 점검 목록은 "자동으로 막히는 항목"이다[](source:an-177) | - |
| r03~r09, r11 | 여러 방향 | 참고 | 역할 구분 문장. 넘기라는 지시가 아니다 | - |

| 파일·상태 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `plans/` 아래 구현 계획 | `improve-animations`(`reconcile`이 낡은 계획을 갱신)[](source:im-modes) | `improve-animations execute`의 실행 서브에이전트 |
| 프로젝트 모션 코드 | `animate`, `animate-expo`, `execute`의 실행 서브에이전트 | 여섯 스킬 모두 |

각 스킬 안의 결정 순서와 수치는 스킬 페이지에 있다. 예: `design/emilkowalski/animate/animate.html`, `design/emilkowalski/review-animations/review-animations.html`.

## 그림에서 뺀 관계 {#omitted}

| rel-id | 종류 | 내용 |
| --- | --- | --- |
| r03~r05, r08, r09, r11 | 참고 | 역할 구분. 선이 많아 그림에서 빼고 단계 설명과 위 표에 남겼다(r06, r07만 그렸다) |
| r13~r15 | 참고 | `mobile-native`가 모션은 `animate`, React Native는 `animate-expo`, 리뷰는 `review-animations`로 보낸다. `mobile-native`는 이 묶음 밖이다 |
| r02 | 넘김 | `animate` → `pick-ui-library`. `design/_group-ui-component/ui-component.html`에서 다룬다 |
| r46, r48, r49 | 같은 계열 | `impeccable`의 `animate` 하위 명령, `emil-design-eng`, `animation-vocabulary`와 목적이 비슷하다. 직접 연결은 없다 |

@callout level=open-question title="확인하지 못한 것"
여섯 스킬을 실행하지 않았다. `execute` 모드에서 worktree를 누가 만들고 정리하는지, 판정 뒤 merge하는지는 원문에 명시 없음이다. 자세한 내용은 `improve-animations` 스킬 페이지의 감사 패널에 있다.
