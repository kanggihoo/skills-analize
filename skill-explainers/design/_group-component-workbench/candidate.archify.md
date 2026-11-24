# 묶음: component-workbench — 컴포넌트 스트레스 테스트·상태 확인·대안 비교·역설계·기술 일러스트를 수행한다 {#overview}

이 묶음은 `jakubkrehel`의 단일 컴포넌트 실험·분석 스킬 5개(`break`, `state-machine`, `variant`, `explain-interface`, `teardown`)를 모았다. 모두 `interface-audit` 묶음의 `better-*` 도메인 규칙을 기준 어휘나 통과 조건으로 참조하면서, 각기 다른 목적으로 격리 페이지나 분석·일러스트를 만든다.

- `break`·`state-machine`·`variant`는 각각 최악 시나리오 동시 렌더링, 제품 상태별 전환, 디자인 대안 3종 비교라는 목적에 따라 서로 `대안` 관계로 나뉜다.[](source:sbrk)[](source:sstm)[](source:svar)
- `explain-interface`와 `teardown`은 각각 기존 웹/이미지의 구현 역설계와 물리·개념 객체의 기술 일러스트 제작을 맡는다.[](source:sexp)[](source:std)

@answer scope="design/_group-component-workbench · 5개 스킬 · 관계 원장 기준"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source sbrk title="break 소개와 역할 경계" path=design/jakubkrehel/break/SKILL.md lines=1:13
@source sstm title="state-machine 소개와 역할 경계" path=design/jakubkrehel/state-machine/SKILL.md lines=1:11
@source svar title="variant 소개와 역할 경계" path=design/jakubkrehel/variant/SKILL.md lines=1:11
@source sexp title="explain-interface 소개와 역할 경계" path=design/jakubkrehel/explain-interface/SKILL.md lines=1:11
@source std title="teardown 소개와 도메인 경계" path=design/jakubkrehel/teardown/SKILL.md lines=1:14

## 스킬 사이의 선택과 흐름 {#flow span=12}

@architecture id=group-map title="component-workbench 선택지"
| brk | break | backend |
| stm | state-machine | backend |
| var | variant | backend |
| exp | explain-interface | backend |
| td | teardown | backend |
| brk > var | 대안 | dashed |
| brk > stm | 대안 | dashed |
| stm > brk | 대안 | dashed |
| var > brk | 대안 | dashed |

@steps id=group-steps
| s-brk | break | 이 단계에서 하는 일: 컴포넌트 하나를 임시 하네스 페이지에 최악 시나리오별로 한꺼번에 렌더링해 깨짐을 찾는다.[](source:sbrk) | group-map | brk |
| s-stm | state-machine | 이 단계에서 하는 일: 컴포넌트가 도달할 수 있는 모든 제품 상태를 모의 데이터와 스위처가 붙은 페이지에 렌더링한다.[](source:sstm) | group-map | stm |
| s-var | variant | 이 단계에서 하는 일: 실제 페이지 맥락에서 단일 디자인 축을 따라 3가지 변형과 피커를 만들어 고른다.[](source:svar) | group-map | var |
| s-exp | explain-interface | 이 단계에서 하는 일: 라이브 URL이나 스크린샷을 분석해 프론트엔드 시스템과 시각 효과 구현을 설명한다.[](source:sexp) | group-map | exp |
| s-td | teardown | 이 단계에서 하는 일: 실물·개념의 조립/분해도 기하 모델을 구축해 독립 뷰어 페이지로 패키징한다.[](source:std) | group-map | td |

## 주고받는 것과 관계 표 {#relations span=12}

| 누가 | 누구를 | 관계 | 조건과 주고받는 것 |
| --- | --- | --- | --- |
| `break` ↔ `state-machine` ↔ `variant` {#r-81-90} | 상호 역할 경계 | 대안 | 최악 시나리오(`break`), 상태별 확인(`state-machine`), 대안 비교(`variant`)로 역할을 나눈다(사용자 선택).[](source:sbrk)[](source:sstm)[](source:svar) |
| `explain-interface` {#r-86} | `variant`·`better-*` | 대안 · 참고 | 대안 탐색은 `variant`를 쓰고, 발견한 요소는 소유 도메인 스킬 어휘로 이름 붙인다(그림에서 생략).[](source:sexp) |
| `variant`, `break`, `teardown` {#r-88-87} | `better-interface`·`better-*` | 호출 · 참고 | `variant`는 `better-interface` escalation trigger를 통과해야 하며, `break`·`teardown`은 도메인 규칙을 참조한다(그림에서 생략).[](source:svar)[](source:std) |

## 공유 상태 {#shared-state span=12}

| 파일·폴더 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| 없음(각 스킬이 임시/독립 페이지 생성 후 정리하거나 내보냄) | - | - |