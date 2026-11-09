# component-workbench 묶음은 어떻게 이어지나 {#component-workbench-group}

`variant`, `break`, `state-machine`은 한 컴포넌트를 임시로 따로 세워 놓고 작업하는 스킬 세 개다. 세 스킬은 순서로 이어지지 않는다. 각자 "나는 이것만 한다"고 적고 나머지 일은 이름을 대며 서로의 몫으로 돌린다. 세 스킬 모두 사용자가 직접 불러야만 켜진다.[](source:va-fm)[](source:br-fm)[](source:sm-fm)

- `variant`는 의도적으로 다른 버전 3개를 실제 페이지의 선택기 뒤에 만들고, 순위는 매기지 않는다(r106, r107 참고).[](source:va-9)
- `break`는 컴포넌트를 닿을 수 있는 모든 시나리오로 임시 페이지에 그려 깨진 곳을 표시한다. 판단하지 않고 관찰한다.[](source:br-9)[](source:br-11)
- `state-machine`은 컴포넌트가 가진 모든 상태를 mock 데이터와 전환기를 단 임시 페이지에 그린다. 리뷰가 아니라 작업대다.[](source:sm-9)[](source:sm-11)
- 셋 중 무엇을 쓸지는 "무엇을 알고 싶은가"로 가른다. 대안이 필요하면 `variant`, 최악의 데이터가 필요하면 `break`, 상태별로 다듬으려면 `state-machine`이다. 리뷰나 다른 스킬로 돌리는 경계는 각 스킬의 소개 문단이 적는다.[](source:va-11)[](source:br-11)[](source:sm-11)

@answer scope="design/jakubkrehel 컴포넌트 작업 스킬 3개 · 커밋 0465878 · 지시상 동작 · 관계는 원장 rel-id 기준 · 스킬을 실행해 확인하지 않음"
@meta locale=ko
@source va-fm title="design/jakubkrehel/variant/SKILL.md · frontmatter(호출 제한)" path=design/jakubkrehel/variant/SKILL.md lines=1:5
@source va-9 title="variant/SKILL.md · 3개 버전을 선택기 뒤에" path=design/jakubkrehel/variant/SKILL.md lines=9:11
@source va-11 title="variant/SKILL.md · 다른 스킬의 몫" path=design/jakubkrehel/variant/SKILL.md lines=11:11
@source va-axes title="variant/SKILL.md · 변형 축과 담당 스킬" path=design/jakubkrehel/variant/SKILL.md lines=13:25
@source va-floor title="variant/SKILL.md · 모든 버전이 넘는 바닥 규칙" path=design/jakubkrehel/variant/SKILL.md lines=27:43
@source va-count title="variant/SKILL.md · 기본 3개, 요청 시 5개" path=design/jakubkrehel/variant/SKILL.md lines=64:64
@source va-promote title="variant/SKILL.md · 고른 하나만 남기고 나머지를 지운다" path=design/jakubkrehel/variant/SKILL.md lines=99:103
@source br-fm title="design/jakubkrehel/break/SKILL.md · frontmatter(호출 제한)" path=design/jakubkrehel/break/SKILL.md lines=1:5
@source br-9 title="break/SKILL.md · harness 페이지가 산출물" path=design/jakubkrehel/break/SKILL.md lines=9:9
@source br-11 title="break/SKILL.md · 관찰하고 판단하지 않는다" path=design/jakubkrehel/break/SKILL.md lines=11:15
@source br-del title="break/SKILL.md · 페이지는 사용자가 말할 때만 지운다" path=design/jakubkrehel/break/SKILL.md lines=66:68
@source sm-fm title="design/jakubkrehel/state-machine/SKILL.md · frontmatter(호출 제한)" path=design/jakubkrehel/state-machine/SKILL.md lines=1:5
@source sm-9 title="state-machine/SKILL.md · 모든 상태를 임시 페이지에" path=design/jakubkrehel/state-machine/SKILL.md lines=9:9
@source sm-11 title="state-machine/SKILL.md · 작업대이고 리뷰가 아니다" path=design/jakubkrehel/state-machine/SKILL.md lines=11:11
@source sm-states title="state-machine/SKILL.md · 코드에서 상태를 찾는다" path=design/jakubkrehel/state-machine/SKILL.md lines=19:31
@source sm-del title="state-machine/SKILL.md · 사용자 말에 한 번에 지운다" path=design/jakubkrehel/state-machine/SKILL.md lines=70:72

## 셋은 무엇이 어떻게 다른가 {#compare span=12}

| | `variant` | `break` | `state-machine` |
| --- | --- | --- | --- |
| 묻는 것 | 이 컴포넌트를 다르게 만들면 어떤 답이 있나 | 최악의 내용이 와도 버티나 | 각 상태는 어떻게 보이나 |
| 어디에 그리나 | {good:실제 페이지} 안의 선택기 뒤. 주변 맥락이 중요하다[](source:va-9)[](source:br-11) | {caution:격리된 임시 페이지}. 맥락은 일부러 버린다[](source:br-11) | {caution:격리된 임시 페이지}. 컴포넌트 폭만 제품과 같게 한다[](source:sm-9) |
| 만드는 것 | 버전 3개(기본). 다른 위치를 한 축에서 잡는다[](source:va-9)[](source:va-axes) | 시나리오별 인스턴스 한 열. 깨진 곳 표시[](source:br-9) | 코드에 있는 상태마다 한 화면과 전환기[](source:sm-9)[](source:sm-states) |
| 판단하나 | 순위를 매기지 않는다. 바닥 규칙은 모든 버전이 넘어야 한다[](source:va-9)[](source:va-floor) | 판단하지 않고 눈에 띄게 깨진 것만 적는다[](source:br-11) | 리뷰가 아니다[](source:sm-11) |
| 끝낼 때 | 고른 하나를 제대로 만들고 나머지·선택기·import를 지운다[](source:va-promote) | 사용자가 끝났다고 말할 때만 페이지를 지운다[](source:br-del) | 사용자가 말하면 페이지 폴더와 승인된 seam을 지운다[](source:sm-del) |

판정: 세 스킬 모두 컴포넌트 하나만 받는다. "설정 페이지" 같은 큰 범위가 오면 후보를 나열하고 어느 것을 할지 묻는다. 이 점은 세 스킬의 1단계가 같다. 근거는 `variant` 45~47줄, `break` 17~19줄, `state-machine` 13~15줄이다.

## 어떤 스킬로 시작하나 {#choose span=12}

세 스킬 사이에 순서는 없다. 사용자가 알고 싶은 것에 따라 하나를 고른다. 아래 표는 각 스킬이 소개 문단에서 다른 스킬에 돌리는 경계다. 서로 실행하라는 지시는 없다.

| 하려는 일 | 쓸 스킬 | 근거 | rel-id |
| --- | --- | --- | --- |
| 컴포넌트의 대안 디자인을 비교한다 | `variant` | `break`와 `state-machine`이 대안 탐색을 `variant`의 몫으로 적는다[](source:br-11)[](source:sm-11) | r114, r123 |
| 최악의 데이터로 컴포넌트를 깨 본다 | `break` | `variant`와 `state-machine`이 스트레스 테스트를 `break`의 몫으로 적는다[](source:va-11)[](source:sm-11) | r106, r122 |
| 컴포넌트의 상태를 하나씩 보며 다듬는다 | `state-machine` | `variant`와 `break`가 상태별 작업을 `state-machine`의 몫으로 적는다[](source:va-11)[](source:br-11) | r107, r115 |
| 끝난 변경을 리뷰한다 | `interface-review`·`better-interface`(묶음 밖) | 세 스킬이 모두 리뷰를 이 둘의 몫으로 적는다[](source:va-11)[](source:br-11)[](source:sm-11) | r104, r105, r112, r113, r124 |

`variant`는 실제 페이지를 고집하고 `break`는 일부러 컴포넌트를 격리한다. `break`는 적대적 시나리오를 한 페이지에 쌓지만 `state-machine`은 제품 상태를 한 번에 하나씩 보여 준다. 이 두 대비는 각 스킬이 직접 적은 경계 설명이다.[](source:br-11)[](source:sm-11)

## 무엇을 주고받나 {#handoff span=12}

| rel-id | from → to | 종류 | 조건·강도 | 주고받는 것 |
| --- | --- | --- | --- | --- |
| r106 | `variant` → `break` | 참고 | 역할 구분. 한 컴포넌트 스트레스 테스트는 `break`의 몫이다[](source:va-11) | - |
| r107 | `variant` → `state-machine` | 참고 | 역할 구분. 컴포넌트 상태를 하나씩 작업하는 일은 `state-machine`의 몫이다[](source:va-11) | - |
| r114 | `break` → `variant` | 참고 | 역할 구분. 디자인 대안 탐색은 `variant`의 몫이다[](source:br-11) | - |
| r115 | `break` → `state-machine` | 참고 | 역할 구분. 제품 상태를 한 번에 하나씩 작업하는 일은 `state-machine`의 몫이다[](source:br-11) | - |
| r122 | `state-machine` → `break` | 참고 | 역할 구분. 적대적 시나리오를 한 페이지에 쌓아 한 번 보는 일은 `break`의 몫이다[](source:sm-11) | - |
| r123 | `state-machine` → `variant` | 참고 | 역할 구분. 대안 디자인 탐색은 `variant`의 몫이다[](source:sm-11) | - |
| r108~r111 | `variant` → `better-layout`·`better-colors`·`better-typography`·`better-writing` | 참고 | 변형 축 표에서 Structure·Density, Emphasis, Type, Voice 축의 담당 스킬로 적는다. 호출 지시는 아니다[](source:va-axes) | - |
| r105 | `variant` → `better-interface` | 참고 | 모든 버전은 선택기에 들어가기 전에 `better-interface`의 escalation trigger를 넘는다(바닥 규칙, 의무형)[](source:va-floor) | - |

@callout level=warning title="셋 다 임시 페이지를 남기고, 지우는 시점은 사용자가 정한다"
`break`와 `state-machine`은 페이지를 보고서와 같은 turn에 지우지 않는다. 사용자가 끝났다고 말할 때 지운다. `variant`는 사용자가 하나를 고르면 그 버전을 제대로 만들고, 나머지·선택기·import를 지운다.[](source:br-del)[](source:sm-del)[](source:va-promote)
판정: 세 스킬의 임시 페이지는 모두 앱 안의 scratch route로 만든다. 지울 때 route와 fixture 이름을 검색해 남은 것이 없는지 확인하라는 지시가 `break`·`state-machine`·`variant`에 모두 있다. 공유 파일은 없고 각자 자기 폴더를 쓴다. 이 부분은 원문에 명시되어 있다.[](source:br-del)[](source:sm-del)[](source:va-promote)

@facts id=workbench-facts
| 호출 제한 | 세 스킬 모두 `disable-model-invocation: true`(의무) |
| 시작 범위 | 한 번에 컴포넌트 하나. 더 크면 후보를 나열하고 묻는다 |
| `variant` 버전 수 | 기본 3개, 5개는 요청할 때만 |
| `break` 소요 | "분 단위, 세션이 아니다". 브라우저 확인은 한 번만 |

`variant`의 개수 근거는 64줄, `break`의 소요 근거는 15줄이다. 세 스킬의 호출 제한은 각 frontmatter에 있다.[](source:va-count)[](source:br-11)[](source:va-fm)[](source:br-fm)[](source:sm-fm)

## 그림을 넣지 않은 이유와 확인 범위 {#omitted span=12}

이 묶음에는 순서나 의존 관계가 없다. 서로 몫만 가르는 참고 관계라 그림은 넣지 않고 비교 표로 보여 준다. 판정: 다이어그램은 순서나 호출을 보여 줄 때만 그린다. 몫 구분을 화살표로 그리면 "다음에 이 스킬을 쓰라"는 뜻으로 읽힌다.

| 뺀 관계 | rel-id | 이유 |
| --- | --- | --- |
| `break` → 도메인 스킬 6개 | r116~r121 | 깨진 곳을 담당 스킬의 어휘로 이름 붙인다는 참고. `break` 페이지에서 다룬다 |
| `afk` → `variant`·`break`, `build-design` → `break` | r127, r128, r143 | `afk`와 `build-design`은 묶음 밖 스킬이고 역할 구분 문장뿐이다 |
| `explain-interface`·`build-design` → `variant` | r131, r142 | 같은 이유다. 각 스킬 페이지에서 다룬다 |
| `break` ↔ `break-ui`, `variant` ↔ `prototype` | r149, r150 | 작성자가 다른 대안 스킬이라 같은 계열로만 잇는다. `design/relations.md`에서 본다 |

- 읽은 파일: 이 페이지는 세 스킬의 `SKILL.md`를 줄 단위로 다시 확인했다. 보조 문서(`variant/picker.md`, `state-machine/switcher.md`, `break/scenarios.md`)는 각 스킬 페이지가 다룬다.
- 분석 중 바뀐 파일: 없음. 스킬을 실제로 실행하지 않았다(지시상 동작). 사람 검토는 미실시다.
