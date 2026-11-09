# pick-ui-library 스킬은 에이전트를 어떻게 바꾸나 {#pick-ui-library-skill}

`pick-ui-library`를 쓰면 에이전트는 프론트엔드 작업에 쓸 라이브러리를 정해진 추천 목록에서 하나만 골라 준다. 사용자가 말한 라이브러리 이름보다 작업 자체를 먼저 보고, `package.json`에 이미 있는 것을 확인한다. 목록 밖에서 고를 때는 목록을 벗어났다고 밝힌다.[](source:pk-howto)

- 켜지는 때: 사용자가 직접 부를 때만이다. `disable-model-invocation: true`라서 모델이 스스로 켜지 않는다.[](source:pk-fm)
- 충돌: `animate`는 컴포넌트가 필요하면 "멈추고 `pick-ui-library`를 호출하라"고 한다. 이 스킬은 모델 호출을 막아 두었다. 두 지시는 원문끼리 부딪친다.[](source:an-r02)[](source:pk-fm)
- 강제하는 것: 메뉴처럼 여러 개를 늘어놓지 않고 하나를 추천한다. 사용자가 원하지 않으면 이미 쓰는 경쟁 라이브러리를 갈아엎지 않는다.[](source:pk-howto)
- 고치는 것: 손으로 만든 toast, `<div>` dropdown 같은 흔한 잘못 매칭을 목록의 라이브러리로 바꾸자고 한다.[](source:pk-mis)

@answer scope="design/emilkowalski/pick-ui-library · 원본 텍스트 1개 4,790B · 커밋 4e3fc89 · 지시상 동작이며 실행해 보지 않음 · 목록의 링크와 라이브러리 현황은 확인하지 않음"
@meta locale=ko
@source pk-fm title="design/emilkowalski/pick-ui-library/SKILL.md · 4790B · 지시 본문과 frontmatter" path=design/emilkowalski/pick-ui-library/SKILL.md lines=1:5
@source pk-init title="SKILL.md · 첫 응답" path=design/emilkowalski/pick-ui-library/SKILL.md lines=9:15
@source pk-lookup title="SKILL.md · lookup 스킬 설명" path=design/emilkowalski/pick-ui-library/SKILL.md lines=17:17
@source pk-howto title="SKILL.md · How to use this" path=design/emilkowalski/pick-ui-library/SKILL.md lines=19:24
@source pk-ui title="SKILL.md · UI 컴포넌트" path=design/emilkowalski/pick-ui-library/SKILL.md lines=28:36
@source pk-motion title="SKILL.md · 모션과 시각" path=design/emilkowalski/pick-ui-library/SKILL.md lines=38:49
@source pk-charts title="SKILL.md · 차트" path=design/emilkowalski/pick-ui-library/SKILL.md lines=51:58
@source pk-inter title="SKILL.md · 상호작용과 성능" path=design/emilkowalski/pick-ui-library/SKILL.md lines=60:65
@source pk-state title="SKILL.md · 상태와 스타일" path=design/emilkowalski/pick-ui-library/SKILL.md lines=67:76
@source pk-mis title="SKILL.md · 흔한 잘못 매칭" path=design/emilkowalski/pick-ui-library/SKILL.md lines=78:85
@source an-r02 title="design/emilkowalski/animate/SKILL.md · 관계 확인용 줄(r02 넘김)" path=design/emilkowalski/animate/SKILL.md lines=81:81
@source pr-role title="design/emilkowalski/prototype/SKILL.md · 관계 확인용 줄(r21 역할 구분)" path=design/emilkowalski/prototype/SKILL.md lines=17:17
@source as-fm title="design/emilkowalski/ask-sonner/SKILL.md · 관계 확인용 줄(r22 description)" path=design/emilkowalski/ask-sonner/SKILL.md lines=3:3

## 언제 켜지나, 그리고 `animate`의 지시와 왜 부딪치나 {#trigger}

@code source=pk-fm language=yaml

`disable-model-invocation: true`가 있다. 그래서 이 스킬은 사용자가 직접 부를 때만 켜진다. `description` 끝도 "Only runs when explicitly invoked; it does not trigger on its own."이라고 같은 말을 한다.[](source:pk-fm)

질문 없이 스킬만 불리면 에이전트는 "I'm ready to pick the right library for your task, …"라는 한 문장만 답하고 기다린다.[](source:pk-init)

`animate`의 81줄은 반대 방향의 지시를 담고 있다.

@code source=an-r02 language=markdown

| 쪽 | 원문 | 강도 |
| --- | --- | --- |
| `animate` 81줄 | 작업에 애니메이션이 아닌 컴포넌트(toast, drawer, command menu, dropdown)가 필요하면 멈추고 `pick-ui-library`를 invoke하라[](source:an-r02) | {caution:의무형} |
| `pick-ui-library` 4줄 | `disable-model-invocation: true`. 사용자가 명시적으로 부를 때만 실행되고 스스로 켜지지 않는다[](source:pk-fm) | {bad:모델 호출 차단} |

원장 r02는 이 관계를 `넘김`으로 적고, 이 충돌을 함께 기록한다. 실제 동작은 확인하지 않았고 지시상 동작으로만 다룬다.

판정: `animate`를 쓰는 에이전트는 이 스킬을 직접 켤 수 없다. 원문 두 곳에는 우선순위가 없어서, 에이전트가 사용자에게 `/pick-ui-library`를 부르라고 권할지, 스스로 고를지, 그 자리에서 멈출지는 정해지지 않는다. 근거는 위 두 줄이다.[](source:an-r02)[](source:pk-fm)

@callout level=warning title="모델 호출 차단을 우회하는 지시는 원문에 없다"
`animate`의 "멈춘다"는 지시는 따를 수 있지만 "invoke"는 이 설정에서 모델이 할 수 없다. 원장도 이 충돌의 실제 동작은 확인하지 않았다고 적는다. 이 페이지는 충돌을 정리하지 않고 그대로 보여 준다.

## 어떤 순서로 고르나 {#procedure}

@workflow id=pick-flow title="라이브러리 고르기"
| pk-task | 작업 파악 | backend |
| pk-pkg | package.json 확인 | backend |
| pk-have | 이미 쓰나? | backend |
| pk-list | 목록에 있나? | backend |
| pk-one | 하나 추천 | backend |
| pk-out | 목록 밖이라 밝힘 | backend |
| pk-task > pk-pkg | |
| pk-pkg > pk-have | |
| pk-have > pk-one | 목록 것 사용 중 |
| pk-have > pk-list | 아니오 |
| pk-list > pk-one | 예 | emphasis |
| pk-list > pk-out | 아니오 |

@steps id=pick-steps
| pk-task | 작업 파악 | 사용자가 말한 라이브러리 이름이 아닌 작업을 본다. "I need to show a dropdown"은 다른 것을 물었더라도 UI primitive 작업이고 base-ui다.[](source:pk-howto) | pick-flow | pk-task |
| pk-pkg | package.json 확인 | `package.json`을 먼저 본다.[](source:pk-howto) | pick-flow | pk-pkg |
| pk-have | 이미 쓰나? | 목록의 라이브러리를 이미 쓰면 그것을 쓴다. 경쟁 라이브러리를 쓰면(예: Virtuoso 대신 react-window) 추천과 다르다고 알리되, 요청이 없으면 의존성을 갈아엎지 않는다.[](source:pk-howto) | pick-flow | pk-have |
| pk-list | 목록에 있나? | 작업을 아래 추천 목록과 맞춘다. 사용자가 원하거나 목록이 정말 다루지 않는 작업이 아니면 목록 밖 대안으로 바꾸지 않는다.[](source:pk-lookup) | pick-flow | pk-list |
| pk-one | 하나 추천 | 라이브러리 하나를 추천하고 용도를 한 문장으로 말한다. 설치와 연결이 요청에 들어 있으면 그것까지 한다. 목록에 분명한 답이 있으면 선택지 메뉴를 내밀지 않는다.[](source:pk-howto) | pick-flow | pk-one |
| pk-out | 목록 밖이라 밝힘 | 목록이 다루지 않으면 그렇다고 분명히 말하고 에이전트 자신의 지식으로 추천한다. 목록을 벗어났다는 점을 밝힌다.[](source:pk-howto) | pick-flow | pk-out |

설치는 조건부다. 원문은 "install/wire it up if that's part of the request"라고만 쓴다. 요청에 설치가 없을 때 설치하지 말라는 문장은 따로 없다(`원문에 명시 없음`).[](source:pk-howto) 원문에는 사용자 승인을 받는 지점도 따로 없다.

## 추천 목록에는 무엇이 있나 {#list}

원문은 이 목록을 취향으로 고른 의도된 선택이라고 한다.[](source:pk-lookup)

| 작업 | 라이브러리 |
| --- | --- |
| 스타일 없는 접근성 UI 컴포넌트(dialog, popover, menu, select) | base-ui[](source:pk-ui) |
| command menu(⌘K palette) | cmdk[](source:pk-ui) |
| toast·알림 | Sonner[](source:pk-ui) |
| OTP·인증 코드 입력 | input-otp[](source:pk-ui) |
| 조절 가능한 GUI·control panel | Leva. dialkit이 대안[](source:pk-ui) |
| 범용 애니메이션(spring, layout animation, 진입·퇴장) | motion(Framer Motion)[](source:pk-motion) |
| 숫자 애니메이션(카운터, 가격, 통계) | NumberFlow[](source:pk-motion) |
| 애니메이션 텍스트 컴포넌트 | torph[](source:pk-motion) |
| 3D 지구본 | Cobe[](source:pk-motion) |
| 동적 OG 이미지(HTML/CSS를 SVG/PNG로) | Satori[](source:pk-motion) |
| 문법 강조 | shiki[](source:pk-motion) |
| 실시간·streaming 차트 | Liveline[](source:pk-charts) |
| 일반 차트(정적 또는 상호작용 대시보드) | recharts[](source:pk-charts) |
| drag and drop | dnd kit[](source:pk-inter) |
| 가상화(긴 목록, 큰 표) | Virtuoso[](source:pk-inter) |
| 상태 관리 | zustand[](source:pk-state) |
| 조건부 `className` 문자열 | clsx[](source:pk-state) |
| Tailwind용 타입 안전 variant 스타일 | cva[](source:pk-state) |
| 테마 전환·dark mode(로드 때 깜빡임 없음) | next-themes[](source:pk-state) |

비슷한 둘 중 무엇을 고를지는 원문이 기준을 준다.

| 갈림길 | 기준 |
| --- | --- |
| motion과 plain CSS | spring, layout animation, 퇴장 애니메이션, 제스처 값이 필요할 때 motion. 단순한 hover나 fade는 CSS transition이 맞다[](source:pk-motion) |
| Liveline과 recharts | 데이터가 실시간으로 들어오고 차트가 시간에 따라 흐르면 Liveline, 나머지는 모두 recharts[](source:pk-charts) |
| clsx와 cva | 임시 조건부 class는 clsx, 컴포넌트에 size·intent·state 같은 진짜 variant가 있어 타입 있는 API가 필요하면 cva. cva는 내부에서 clsx식 입력을 쓴다[](source:pk-state) |

## 어떤 잘못 매칭을 잡아내나 {#mismatch}

에이전트는 코드에서 아래 모양을 보면 목록의 라이브러리로 바꾸자고 한다.[](source:pk-mis)

| 지금 코드 | 바꿀 곳 |
| --- | --- |
| 손으로 만들거나 modal 라이브러리로 만든 toast | Sonner |
| 포커스를 손으로 다루는 `<div>` 기반 dropdown·dialog | base-ui(접근성, focus trap, 닫기 처리) |
| 텍스트를 다시 렌더링해 숫자를 움직임 | NumberFlow(자릿수 전환) |
| 1,000행 넘는 목록을 그대로 렌더링 | pagination 꼼수보다 Virtuoso 먼저 |
| 컴포넌트마다 `useState`를 두고 props로 엮은 공유 상태 | zustand |
| 세 단계 넘게 겹친 template literal className 삼항식 | clsx, variant 모양이면 cva |

수치는 1,000행 하나다. 원문은 "1,000+ row list"를 Virtuoso를 꺼낼 신호로 든다.[](source:pk-mis)

## 흐름 속 위치 {#position}

@workflow id=pick-position title="pick-ui-library 앞뒤"
| pp-animate | animate | backend |
| pp-pick | pick-ui-library | backend |
| pp-sonner | ask-sonner | backend |
| pp-animate > pp-pick | 넘김(충돌) | emphasis |
| pp-pick > pp-sonner | Sonner(추론) | dashed |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `animate`(앞) | 작업 설명 | - | 넘김. 컴포넌트가 필요하면 "멈추고 `pick-ui-library`를 호출하라"는 의무형이다. 이 스킬의 `disable-model-invocation: true`와 부딪친다. 실제 동작은 확인하지 않았다(지시상 동작)[](source:an-r02)[](source:pk-fm) | r02 |
| `ask-sonner`(뒤) | - | 라이브러리 선택(Sonner) | 산출물 호환, 근거 방식은 추론이다. 이 스킬은 toast에 Sonner를 추천하고 손으로 만든 toast를 Sonner로 바꾸라고 한다. `ask-sonner`는 그 Sonner의 사용 안내다. 두 스킬은 서로 이름을 부르지 않는다. 상태는 프로젝트 `package.json`에 남는다[](source:pk-ui)[](source:pk-mis)[](source:as-fm) | r22 |
| `prototype` | - | - | 참고. `prototype`이 의존성 고르기는 이 스킬의 몫이라고 역할을 나눈다[](source:pr-role) | r21 |

r22는 직접 연결이 아니라서 점선으로 그렸다. r21은 역할 구분 참고라 그림에 넣지 않았다.

전체 흐름은 `design/_group-ui-component/ui-component.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 1개, 4,790B다(`SKILL.md`). 이 스킬 폴더에는 다른 원본 파일이 없다.
- 관계 확인용으로 다른 스킬 파일의 한 줄씩을 봤다. `animate/SKILL.md` 81줄, `prototype/SKILL.md` 17줄, `ask-sonner/SKILL.md` 3줄이다. 읽은 파일 수에는 넣지 않았다.
- 구조·표본만 본 파일과 바이너리 파일은 없다.
- 제외한 파일: `SKILL.ko.md`(5,809B)는 번역본이라 열지 않았다.
- 원문 대조 범위: 활성화 제한 1개(`disable-model-invocation: true`), 사용 절차 4단계, 추천 목록 19행과 갈림길 3개, 잘못 매칭 6행, 수치 1개(1,000행)를 모두 대조했다. 관계 행 r02, r21, r22는 원장과 원문을 다시 대조했고 같다.
- 목록의 라이브러리 링크가 지금도 살아 있는지, 각 라이브러리가 지금도 관리되는지는 확인하지 않았다.
- 분석 중 바뀐 파일: 없음. `design/` 아래 작업 트리는 commit `4e3fc89` 그대로다.

@callout level=open-question title="원문만으로 정해지지 않는 것"
- r02 충돌에서 에이전트가 실제로 어떻게 움직이는지는 실행하지 않아 모른다. 위 첫 패널의 판정은 원문 두 줄만 근거로 한다.
- 대상 framework를 제한하는 문장은 없다(`원문에 명시 없음`). 목록에 `useState` 같은 React 용어가 나오지만, React가 아닌 프로젝트에서 이 목록을 어떻게 쓸지는 원문으로 판단할 수 없다.[](source:pk-mis)
