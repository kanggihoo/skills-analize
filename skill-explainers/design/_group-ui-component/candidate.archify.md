# ui-component 묶음은 어떻게 이어지나 {#ui-component-group}

이 묶음의 다섯 스킬은 UI 조각 하나를 다룰 때 각자 다른 질문에 답한다. 실제로 다음 스킬을 부르라고 적힌 곳은 `animate`가 `pick-ui-library`를 부르는 한 곳뿐이다(r02). 나머지는 "그건 다른 스킬의 몫"이라고 경계만 긋는다.[](source:an-81)[](source:pr-17)

- `animate`는 작업에 애니메이션이 아니라 toast, drawer 같은 컴포넌트가 필요하면 멈추고 `pick-ui-library`를 호출하라고 한다. 그런데 `pick-ui-library`는 `disable-model-invocation: true`라서 모델이 스스로 켤 수 없다.[](source:an-81)[](source:pk-fm)
- `pick-ui-library`가 toast에 Sonner를 추천하고, `ask-sonner`가 그 Sonner의 사용법을 답한다. 두 스킬은 서로 이름을 부르지 않으므로 이 연결은 판정이다(r22).[](source:pk-34)[](source:so-fm)
- `prototype`(여러 버전 만들기)과 `break-ui`(최악 데이터로 깨 보기)는 다른 스킬로 넘기지 않는다. 서로를 역할 구분으로만 가리킨다(r16, r21).[](source:br-16)[](source:pr-17)

@answer scope="design/emilkowalski 다섯 스킬 · 커밋 4e3fc89 · 지시상 동작 · 스킬 간 순서는 원장 rel-id 기준"
@meta locale=ko
@source an-fm title="design/emilkowalski/animate/SKILL.md · frontmatter" path=design/emilkowalski/animate/SKILL.md lines=1:4
@source an-81 title="animate/SKILL.md · 컴포넌트가 필요하면 pick-ui-library 호출" path=design/emilkowalski/animate/SKILL.md lines=81:81
@source pk-fm title="design/emilkowalski/pick-ui-library/SKILL.md · frontmatter(호출 제한)" path=design/emilkowalski/pick-ui-library/SKILL.md lines=1:5
@source pk-how title="pick-ui-library/SKILL.md · 작업 파악과 package.json 확인" path=design/emilkowalski/pick-ui-library/SKILL.md lines=21:22
@source pk-34 title="pick-ui-library/SKILL.md · toast는 Sonner" path=design/emilkowalski/pick-ui-library/SKILL.md lines=34:34
@source pk-80 title="pick-ui-library/SKILL.md · 손으로 만든 toast → Sonner" path=design/emilkowalski/pick-ui-library/SKILL.md lines=80:80
@source so-fm title="design/emilkowalski/ask-sonner/SKILL.md · frontmatter" path=design/emilkowalski/ask-sonner/SKILL.md lines=1:4
@source so-16 title="ask-sonner/SKILL.md · 안내 스킬 소개" path=design/emilkowalski/ask-sonner/SKILL.md lines=16:16
@source so-22 title="ask-sonner/SKILL.md · Toaster는 한 번만" path=design/emilkowalski/ask-sonner/SKILL.md lines=22:22
@source pr-fm title="design/emilkowalski/prototype/SKILL.md · frontmatter(호출 제한)" path=design/emilkowalski/prototype/SKILL.md lines=1:5
@source pr-17 title="prototype/SKILL.md · 역할 구분" path=design/emilkowalski/prototype/SKILL.md lines=17:17
@source pr-31 title="prototype/SKILL.md · 고른 뒤 정리" path=design/emilkowalski/prototype/SKILL.md lines=31:31
@source pr-52 title="prototype/SKILL.md · 버전 수" path=design/emilkowalski/prototype/SKILL.md lines=52:52
@source br-fm title="design/emilkowalski/break-ui/SKILL.md · frontmatter" path=design/emilkowalski/break-ui/SKILL.md lines=1:4
@source br-16 title="break-ui/SKILL.md · 역할 구분" path=design/emilkowalski/break-ui/SKILL.md lines=16:16
@source br-34 title="break-ui/SKILL.md · toggle은 개발용" path=design/emilkowalski/break-ui/SKILL.md lines=34:34
@source br-74 title="break-ui/SKILL.md · Demo data / Worst case toggle" path=design/emilkowalski/break-ui/SKILL.md lines=74:74
@source br-131 title="break-ui/SKILL.md · 보고하고 멈춤" path=design/emilkowalski/break-ui/SKILL.md lines=131:131

## 무엇이 필요할 때 어느 스킬로 가나 {#route span=12}

@workflow id=ui-route title="UI 조각 작업에서 다섯 스킬의 자리"
| ask | UI 조각 작업 | external |
| need | 무엇이 필요한가? | backend |
| anim | animate | backend |
| pick | pick-ui-library | backend |
| sonner | ask-sonner | backend |
| proto | prototype | backend |
| brk | break-ui | backend |
| ask > need | |
| need > anim | 모션 |
| need > pick | 라이브러리 |
| need > proto | 여러 방향 |
| need > brk | 깨 보기 |
| anim > pick | 컴포넌트 필요 | emphasis |
| pick > sonner | toast | dashed |

@steps id=route-steps
| need | 무엇이 필요한가? | 판정: 이 갈림길은 각 스킬의 description을 모아 그린 것이다. 스킬들이 이런 분기 규칙을 함께 정해 두지는 않았다. | ui-route | need |
| anim | animate | 애니메이션을 직접 구현한다. 작업이 toast·drawer·command menu·dropdown 같은 컴포넌트면 멈추고 `pick-ui-library`를 호출하라고 한다(r02). | ui-route | anim |
| pick | pick-ui-library | 사용자가 말한 라이브러리 이름이 아니라 작업을 보고, `package.json`부터 확인한 뒤 정해진 목록에서 고른다. 명시 호출만 된다. | ui-route | pick |
| sonner | ask-sonner | Sonner의 설치, `toast()` 호출, 스타일, 흔한 고장을 답한다. `pick-ui-library`와의 연결은 추론이다(r22). | ui-route | sonner |
| proto | prototype | 서로 다른 방향의 버전 3개(최대 5개)를 화면 선택기 뒤에 두고, 사용자가 고르면 나머지를 지운다. 명시 호출만 된다. | ui-route | proto |
| brk | break-ui | 값마다 최악의 데이터를 만들어 `Demo data / Worst case` toggle 뒤에 두고, 깨진 곳과 고칠 방법을 보고한 뒤 멈춘다. | ui-route | brk |

근거: r02는 `animate` 81줄,[](source:an-81) `pick-ui-library`의 작업 방식은 21~22줄,[](source:pk-how) Sonner 추천은 34·80줄,[](source:pk-34)[](source:pk-80) `prototype`의 버전 수와 정리는 52·31줄,[](source:pr-52)[](source:pr-31) `break-ui`의 toggle과 멈춤은 74·131줄이다.[](source:br-74)[](source:br-131)

## 유일한 넘김은 왜 막힐 수 있나 {#conflict}

@callout level=warning title="r02: 의무형 넘김과 명시 호출 제한이 부딪친다"
`animate`는 컴포넌트가 필요하면 "멈추고 `pick-ui-library`를 호출하라"고 적는다.[](source:an-81) `pick-ui-library`의 frontmatter는 `disable-model-invocation: true`이고, description은 "명시적으로 부를 때만 실행된다"고 한다.[](source:pk-fm)
두 원문 사이에 우선순위는 적혀 있지 않다. 판정: 에이전트가 이 지점에서 할 수 있는 일은 사용자에게 `/pick-ui-library`를 부르라고 알리거나, 목록 없이 판단하는 것이다. 어느 쪽인지는 원문으로 정해지지 않는다.

| 스킬 | 모델이 스스로 켤 수 있나 | 근거 |
| --- | --- | --- |
| `animate` | 있다 | 호출 제한 필드 없음[](source:an-fm) |
| `pick-ui-library` | {bad:없다} | `disable-model-invocation: true`[](source:pk-fm) |
| `ask-sonner` | 있다 | 호출 제한 필드 없음[](source:so-fm) |
| `prototype` | {bad:없다} | `disable-model-invocation: true`[](source:pr-fm) |
| `break-ui` | 있다 | 호출 제한 필드 없음[](source:br-fm) |

## 무엇을 주고받고, 어떤 파일을 함께 건드리나 {#handoff}

| rel-id | from → to | 종류 | 조건·강도 | 주고받는 것 |
| --- | --- | --- | --- | --- |
| r02 | `animate` → `pick-ui-library` | 넘김 | 컴포넌트가 필요하면 호출하라(의무형). 대상은 명시 호출만 | 작업 설명 |
| r22 | `pick-ui-library` → `ask-sonner` | 산출물 호환(추론) | toast·알림이면 Sonner를 추천한다. 서로 이름은 부르지 않는다 | 라이브러리 선택(Sonner) |
| r16 | `break-ui` → `prototype` | 참고 | 컴포넌트 재설계는 `prototype`의 몫이라는 역할 구분 | - |
| r21 | `prototype` → `pick-ui-library` | 참고 | 의존성 고르기는 `pick-ui-library`의 몫이라는 역할 구분 | - |

| 파일·상태 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| 프로젝트 `package.json` | 원문에 명시 없음(`pick-ui-library`는 쓰는 단계를 적지 않는다) | `pick-ui-library`가 먼저 확인한다[](source:pk-how) |
| `<Toaster />` 마운트 위치(Next.js는 `layout.tsx`) | `ask-sonner`가 한 번만 두라고 안내한다[](source:so-22) | - |
| 비교용 화면(선택기, 개발용 toggle) | `prototype`(고른 뒤 지운다), `break-ui`(운영에는 내보내지 않는다)[](source:pr-31)[](source:br-34) | 사용자가 보고 고른다 |

각 스킬 안의 규칙과 수치는 스킬 페이지에 있다. 예: `design/emilkowalski/prototype/prototype.html`, `design/emilkowalski/break-ui/break-ui.html`.

## 그림에서 뺀 관계 {#omitted}

| rel-id | 종류 | 그림 | 내용 |
| --- | --- | --- | --- |
| r17, r18 | 참고 | 생략 | `break-ui`가 시각 비평은 `emil-design-eng`, 모션은 `review-animations`로 보낸다. 둘 다 이 묶음 밖이다 |
| r19, r20 | 참고 | 생략 | `prototype`이 기존 UI 리뷰·수정 계획을 `review-animations`, `improve-animations`의 몫으로 둔다 |
| r16, r21 | 참고 | 생략(표에 있음) | 역할 구분이며 넘김 지시가 아니다 |

@callout level=open-question title="확인하지 못한 것"
다섯 스킬을 실제로 실행하지 않았다. r02 충돌에서 에이전트가 실제로 어떻게 움직이는지, `pick-ui-library`가 추천한 Sonner를 설치한 뒤 `ask-sonner`가 켜지는지는 지시상 동작으로만 적었다.
