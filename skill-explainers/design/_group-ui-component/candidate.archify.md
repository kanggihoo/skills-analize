# 묶음: ui-component — UI 라이브러리 선택·프로토타입 비교·극한 데이터 테스트를 수행한다 {#overview}

이 묶음은 UI 컴포넌트 제작과 품질 검증에 쓰는 7개 스킬을 모았다. 라이브러리 고르기(`pick-ui-library`), 토스트(`ask-sonner`), 모바일 웹 보정(`mobile-native`), 모조 제품 데모(`stageshow`), 다중 프로토타입(`prototype`), 최악 데이터 테스트(`break-ui`), 웹 모션 구현(`animate`)으로 구성된다.

- `animate`가 작업 중 토스트·drawer 같은 컴포넌트 자체가 필요하면 멈추고 `pick-ui-library`를 `호출`하며, `mobile-native`는 `animate` 모션 토큰이 있으면 재사용(`참고`)한다.[](source:anim-pick)[](source:mob-tok)
- `prototype`과 `break-ui`, `mobile-native`는 서로 `대안`으로 역할을 구분하고, `stageshow`와 `ask-sonner`는 독립 선택지다.[](source:sstage)[](source:ssonner)

@answer scope="design/_group-ui-component · 7개 스킬 · 관계 원장 기준"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source spick title="pick-ui-library 소개" path=design/emilkowalski/pick-ui-library/SKILL.md lines=1:20
@source sproto title="prototype 소개" path=design/emilkowalski/prototype/SKILL.md lines=1:20
@source sbrk title="break-ui 소개" path=design/emilkowalski/break-ui/SKILL.md lines=1:20
@source ssonner title="ask-sonner 소개" path=design/emilkowalski/ask-sonner/SKILL.md lines=1:20
@source smob title="mobile-native 소개" path=design/emilkowalski/mobile-native/SKILL.md lines=1:20
@source mob-tok title="mobile-native의 animate 토큰 재사용" path=design/emilkowalski/mobile-native/SKILL.md lines=144:144
@source anim-pick title="animate의 pick-ui-library 호출" path=design/emilkowalski/animate/SKILL.md lines=81:81
@source sstage title="stageshow 소개" path=design/benjitaylor/stageshow/SKILL.md lines=1:20

## 스킬 사이의 선택과 흐름 {#flow span=12}

그림에는 직접 연결(`호출`, `참고`, `대안`)이 있는 5개 스킬만 배치했고, 독립 선택지인 `ask-sonner`와 `stageshow`는 아래 단계 설명과 표에 남겼다.

@architecture id=group-map title="ui-component 연결 구조"
| anim | animate | backend |
| pick | pick-ui-library | backend |
| mob | mobile-native | backend |
| brk | break-ui | backend |
| proto | prototype | backend |
| anim > pick | 호출 | |
| mob > anim | 참고 · 대안 | |
| brk > proto | 대안 | dashed |
| proto > pick | 대안 | dashed |

@steps id=group-steps
| s-anim | animate | 이 단계에서 하는 일: 웹 애니메이션을 구현하되 컴포넌트 자체가 필요하면 `pick-ui-library`를 먼저 읽는다.[](source:anim-pick) | group-map | anim |
| s-pick | pick-ui-library | 이 단계에서 하는 일: UI 작업 유형에 맞는 라이브러리를 큐레이션 목록에서 골라 설치까지 돕는다.[](source:spick) | group-map | pick |
| s-mob | mobile-native | 이 단계에서 하는 일: 모바일 웹 앱의 CSS·메타태그를 고쳐 네이티브 앱 같은 사용감을 만든다.[](source:smob) | group-map | mob |
| s-brk | break-ui | 이 단계에서 하는 일: 최악의 데이터를 UI에 주입하고 토글로 깨지는 지점과 수정안을 보고한다.[](source:sbrk) | group-map | brk |
| s-proto | prototype | 이 단계에서 하는 일: 방향이 다른 3~5개 UI 프로토타입을 플로팅 피커로 비교한 뒤 고른 안을 통합한다.[](source:sproto) | group-map | proto |

## 주고받는 것과 관계 표 {#relations span=12}

| 누가 | 누구를 | 관계 | 조건과 주고받는 것 |
| --- | --- | --- | --- |
| `animate` {#r-13} | `pick-ui-library` | 호출 | 의무: 애니메이션이 아니라 UI 컴포넌트 자체가 필요하면 멈추고 `../pick-ui-library/SKILL.md`를 읽는다.[](source:anim-pick) |
| `mobile-native` {#r-36} | `animate` | 참고 | 코드베이스가 `animate` 토큰을 쓰면 새 커브를 만들지 않고 재사용한다(모션 토큰).[](source:mob-tok) |
| `mobile-native` {#r-37} | `animate` | 대안 | 역할 경계: 모션 설계 자체는 `animate`를 쓴다.[](source:smob) |
| `break-ui` {#r-27} | `prototype` | 대안 | 역할 경계: 컴포넌트 재설계는 `prototype`을 쓴다.[](source:sbrk) |
| `prototype` {#r-42} | `pick-ui-library` | 대안 | 역할 경계: 의존성 선택은 `pick-ui-library`를 쓴다.[](source:sproto) |
| `ask-sonner`, `stageshow` {#r-ind} | 묶음 내 독립 | 안내 · 선택지 | Sonner 가이드(`ask-sonner`)와 가짜 제품 UI 데모 제작(`stageshow`)으로 직접 연결 없음(그림에서 생략).[](source:ssonner)[](source:sstage) |

## 공유 상태 {#shared-state span=12}

| 파일·폴더 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| 없음(프로젝트 기존 모션 토큰은 `animate` 규약 시 `mobile-native`가 재사용) | - | - |