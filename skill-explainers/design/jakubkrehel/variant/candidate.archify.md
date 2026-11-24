# variant — 단일 디자인 축을 따라 3가지 컴포넌트 버전을 실제 페이지·선택기에 올려 비교한다 {#overview}

`variant`는 UI 조각 하나를 두고 단일 디자인 주 축(`primary axis`)에서 위치가 다른 세 가지 버전(`variant`)을 만들어 실제 페이지 안의 선택기(`picker`)에 올린 뒤, 사용자가 직접 전환·비교해 하나를 고르게 하는 스킬이다.[](source:sk-intro)[](source:sk-axes)[](source:sk-step3)

- 사용자가 `/variant <UI 조각>`을 실행할 때 켜지며, 한 번에 한 조각만 다뤄 대시보드처럼 범위가 넓으면 후보 목록을 내고 선택을 묻는다.[](source:fm)[](source:sk-step1)
- 결과로 남는 것은 `?__variant=` 파라미터와 화살표·`H` 키로 전환되는 실제 페이지(또는 단독 HTML) 내 세 변형, 바닥 규칙 통과본, 장단점 비교 표이며, 선택 후에는 고른 안을 정식 구현하고 하네스를 일괄 삭제한다.[](source:sk-floor)[](source:sk-step4)[](source:sk-step5)[](source:sk-step6)
- 다른 스킬과의 관계: 모든 변형은 피커 등록 전 `better-interface`의 `escalation trigger`(켜지면 표면이 사소해도 `HIGH`인 증상) 11개 바닥 규칙을 통과해야 하며(호출), 5개 축은 `better-layout` 등 도메인 스킬 소유권을 따르고(참고), `prototype`·`afk`·`break`와는 대안 관계다.[](source:sk-axes)[](source:sk-floor)[](source:proto-intro)[](source:afk-rel)[](source:brk-rel)
- 하지 않는 것: 후보에 순위나 추천 표시를 먼저 달지 않고, 색조나 몇 단어만 바꾼 거짓 분기를 내보내지 않으며, `interface-review`·`break`·`state-machine` 역할을 대신하지 않는다.[](source:sk-intro)[](source:sk-step5)[](source:sk-checks)

@answer scope="design/jakubkrehel/variant · 원본 파일 3개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source fm title="frontmatter: name·description·호출 제한" path=design/jakubkrehel/variant/SKILL.md lines=1:5
@source sk-intro title="목적, 순위 미부여, 형제 스킬과 경계" path=design/jakubkrehel/variant/SKILL.md lines=7:12
@source sk-axes title="5개 변형 축과 도메인 스킬 소유권" path=design/jakubkrehel/variant/SKILL.md lines=13:26
@source sk-floor title="better-interface 11개 바닥 규칙 통과" path=design/jakubkrehel/variant/SKILL.md lines=27:44
@source sk-step1 title="1단계: UI 조각 하나 범위 확정" path=design/jakubkrehel/variant/SKILL.md lines=45:50
@source sk-step2 title="2단계: 프로젝트 스타일·토큰·밀도 학습" path=design/jakubkrehel/variant/SKILL.md lines=51:61
@source sk-step3 title="3단계: 단일 주 축과 3~5개 후보 이름·위치 정의" path=design/jakubkrehel/variant/SKILL.md lines=62:69
@source sk-step4 title="4단계: 실제 페이지와 __variant 선택기 구축" path=design/jakubkrehel/variant/SKILL.md lines=70:83
@source sk-step5 title="5단계: 전 변형 확인, 장단점 표 제시 후 정지" path=design/jakubkrehel/variant/SKILL.md lines=84:98
@source sk-step6 title="6단계: 선택안 승격·일괄 삭제 또는 재탐색" path=design/jakubkrehel/variant/SKILL.md lines=99:104
@source sk-checks title="마무리 전 실수 점검 4항목" path=design/jakubkrehel/variant/SKILL.md lines=105:112
@source pk-chrome title="디자인 시스템 밖 중립 크롬과 그룹 목록" path=design/jakubkrehel/variant/picker.md lines=1:17
@source pk-behavior title="__variant URL 동기화·키보드·ARIA 동작" path=design/jakubkrehel/variant/picker.md lines=18:27
@source pk-html title="선택기 HTML 구조" path=design/jakubkrehel/variant/picker.md lines=28:61
@source pk-layout title="2열 sticky 목록 vs 상단 select 반응형 전환" path=design/jakubkrehel/variant/picker.md lines=62:72
@source pk-css title="all: unset 기반 선택기 CSS 명세" path=design/jakubkrehel/variant/picker.md lines=73:205
@source oai title="UI 메타데이터와 암묵 호출 차단" path=design/jakubkrehel/variant/agents/openai.yaml lines=1:5
@source proto-intro title="prototype 스킬과의 목적 유사 및 방식 차이" path=design/emilkowalski/prototype/SKILL.md lines=1:25
@source afk-rel title="afk의 variant 역할 경계" path=design/jakubkrehel/afk/SKILL.md lines=11:11
@source brk-rel title="break의 variant 역할 경계" path=design/jakubkrehel/break/SKILL.md lines=11:13
@source bi-intro title="better-interface의 escalation trigger 기준" path=design/jakubkrehel/better-interface/SKILL.md lines=1:16
@source bl-intro title="better-layout의 구조·밀도 소유 범위" path=design/jakubkrehel/better-layout/SKILL.md lines=1:12

## 어떻게 동작하나 {#flow span=12}

절차형이다. 원문 1~6단계를 탐색 준비, 구현·제시, 결정·후속 3개 국면으로 그렸다.[](source:sk-step1)[](source:sk-step6)

그림이 생략한 전제가 하나 있다. 4단계로 들어가기 전 모든 후보가 `better-interface`의 11개 바닥 규칙(`floor`)을 통과해야 하며, 바닥 규칙을 깨야만 성립하는 방향은 아예 탈락시킨다.[](source:sk-floor)

@workflow id=flow-diagram title="variant 흐름"
| lane prep | 탐색 준비 |
| lane build | 구현·제시 |
| lane decide | 결정·후속 |
| scope | UI 조각 하나 확정 | backend | prep | source:sk-step1 |
| ground | 기준 환경·토큰 학습 | backend | prep | source:sk-step2 |
| axis | 단일 축·후보 정의 | backend | prep | source:sk-step3 |
| build | 실제 페이지·선택기 구축 | frontend | build | source:sk-step4 |
| present | 장단점 제시 후 중단 | frontend | build | source:sk-step5 |
| choice | 사용자 결정? | backend | decide | source:sk-step6 |
| promote | 선택안 승격·하네스 삭제 | backend | decide | source:sk-step6 |
| scope > ground | | |
| ground > axis | | |
| axis > build | | |
| build > present | | emphasis |
| present > choice | | |
| choice > promote | 선택 확정 | emphasis |
| choice > axis | 다른 안 재탐색 | |

@steps id=flow-steps
| s-scope | UI 조각 하나 확정 | **입력** 사용자 브리프 · **출력** 대상 UI 조각 한 문장 정의(정체·렌더 위치·역할). **처리** 한 번의 실행에 UI 조각 하나만 정하고 브리프를 한 문장으로 다시 적는다.[](source:sk-step1) **다음** 요청이 대시보드처럼 여러 조각에 걸치면 후보 목록을 내고 하나를 고르도록 묻는다.[](source:sk-step1) | flow-diagram | scope |
| s-ground | 기준 환경·토큰 학습 | **입력** 대상 프로젝트 코드베이스 · **출력** 스타일링·토큰·밀도·문맥 파악. **처리** 스타일링 시스템, 컴포넌트·모션 라이브러리, 색상·간격·반지름·타입·이징 토큰, 제품 밀도·어조, 배치 배경·이웃·너비를 읽는다.[](source:sk-step2) **다음** 읽어 들일 프로젝트가 없으면 중립 회색·단일 강조색·시스템 폰트 스택을 쓰고 그 사실을 밝힌다.[](source:sk-step2) | flow-diagram | ground |
| s-axis | 단일 축·후보 정의 | **입력** 브리프와 기준 환경 · **출력** 주 축 하나, 바닥 규칙 검증 통과 후보 3개(요청 시 5개). **처리** Structure·Density·Emphasis·Type·Voice 중 주 축 하나를 골라 위치가 겹치지 않는 서술형 이름(`Quiet`·`Editorial`·`Dense` 등, `Option A` 금지)으로 후보를 세우고 `better-interface`의 11개 바닥 규칙을 통과시킨다.[](source:sk-axes)[](source:sk-floor)[](source:sk-step3) **다음** 바닥 규칙을 어겨야만 성립하는 방향은 이유를 밝히고 버린다.[](source:sk-floor) | flow-diagram | axis |
| s-build | 실제 페이지·선택기 구축 | **입력** 후보 정의와 실제 호스트 페이지 · **참조** `picker.md` · **출력** `?__variant=` 기반 전환이 달린 실제 페이지(또는 단독 HTML). **처리** 실제 크롬·이웃·데이터가 있는 페이지에 1개씩 실물 크기로 호스팅하고, 디자인 시스템과 분리된 어두운 중립 선택기(`all: unset`, 그룹 목록과 `<select>` 이중 렌더, 화살표·`H` 키)를 붙인다.[](source:sk-step4)[](source:pk-chrome)[](source:pk-behavior)[](source:pk-html)[](source:pk-layout)[](source:pk-css) **다음** 호스트 페이지만 변형 파일을 `import`하고 다른 코드는 하네스를 가져오지 않으며, 호스트 페이지가 없으면 자체 완결 HTML 1개로 만든다.[](source:sk-step4) | flow-diagram | build |
| s-present | 장단점 제시 후 중단 | **입력** 구현된 변형 페이지 · **출력** 변형별 축 위치·적합 상황·비용 표, 선택기 URL·키·판정 너비. **처리** 브라우저가 있으면 전 변형 렌더링·상호작용·콘솔 무오류를 확인한 뒤, 선호 표시 없는 비교 표와 조작 정보를 넘기고 멈춘다.[](source:sk-step5) **다음** 브라우저가 없으면 그 사실을 밝히고 URL을 넘긴다. 선호를 직접 묻지 않는 한 추천안을 표시하지 않는다.[](source:sk-step5) | flow-diagram | present |
| s-choice | 사용자 결정? | **입력** 사용자의 선택 또는 재탐색 지시 · **출력** 승격 또는 3단계 재실행 갈래. **처리** 사용자가 특정 변형을 골랐는지, 혹은 한 방향을 중심으로 새 라운드를 요청했는지 판별한다.[](source:sk-step6) **다음** 재탐색 요청이면 하네스를 지우지 않고 유지한 채 `단일 축·후보 정의`로 되돌아가 기울어진 방향 주변의 새 위치를 잡는다.[](source:sk-step6) | flow-diagram | choice |
| s-promote | 선택안 승격·하네스 삭제 | **입력** 선택된 변형 · **출력** 프로젝트 규칙대로 통합된 컴포넌트와 깨끗한 diff. **처리** 고른 변형을 정식 위치에 규칙에 맞게 구현한 뒤 나머지 변형·선택기·호스트 `import`를 모두 지우고, 변형 이름과 `__variant` 검색으로 잔여물이 없는지 확인한다.[](source:sk-step6) | flow-diagram | promote |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 호출형(`/variant <UI 조각>`). `disable-model-invocation: true`와 `allow_implicit_invocation: false`가 설정되어 모델이 스스로 켜지 못한다.[](source:fm)[](source:oai) |
| 성격 | 절차형. 한 UI 조각을 단일 축에서 분기해 실제 페이지·선택기로 비교하게 하고, 선택된 안만 정식 코드로 승격한다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `prototype` {#rel-r43} | **이 스킬** | 대안 | 목적은 비슷하지만(다중 UI 변형 생성과 선택기 비교) 작성자와 메커니즘(고립 프로토타입 vs 실제 페이지 내 단일 축·`better-interface` 바닥 규칙)이 다르다.[](source:proto-intro)[](source:sk-floor)[](source:sk-step4) |
| `afk` {#rel-r78} | **이 스킬** | 대안 | 역할 경계: 컴포넌트 대안 탐색은 `variant`를 사용한다(수동 호출 필요).[](source:afk-rel) |
| `break` {#rel-r81} | **이 스킬** | 대안 | 역할 경계: 디자인 대안 탐색은 `variant`를 사용한다(사용자 선택).[](source:brk-rel) |
| **이 스킬** {#rel-r88} | `better-interface` | 호출 | 의무: 모든 변형 후보는 선택기 등록 전 `better-interface`의 `escalation trigger` 11개를 반드시 통과해야 한다(사용자 개입 없음).[](source:sk-floor)[](source:bi-intro) |
| **이 스킬** {#rel-r89} | `better-layout` | 참고 | 변형 축 소유권 매핑: `Structure`·`Density`는 `better-layout`, `Emphasis`는 `better-colors`, `Type`은 `better-typography`, `Voice`는 `better-writing`을 참조한다(사용자 개입 없음).[](source:sk-axes)[](source:bl-intro) |

@architecture id=relation-map title="variant와 이어지는 스킬"
| proto | prototype | backend |
| afk | afk | backend |
| brk | break | backend |
| self | variant(이 스킬) | backend |
| bi | better-interface | backend |
| bl | better-layout | backend |
| proto > self | 대안 |
| afk > self | 대안 |
| brk > self | 대안 |
| self > bi | 호출 |
| self > bl | 참고 |

`SKILL.md` 본문은 또한 완료 UI 리뷰는 `interface-review`·`better-interface`, 컴포넌트 스트레스 테스트는 `break`, 도달 가능 제품 상태 작업은 `state-machine` 소관으로 경계를 명시한다.[](source:sk-intro)

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 5개 축 매핑, 11개 바닥 규칙, 6단계 탐색·승격 절차, 실수 점검 4항목 본문 | 스킬이 켜지면 항상 읽는다 | UI 조각 하나 확정, 기준 환경·토큰 학습, 단일 축·후보 정의, 실제 페이지·선택기 구축, 장단점 제시 후 중단, 사용자 결정?, 선택안 승격·하네스 삭제 |
| `picker.md` | 디자인 시스템 격리 크롬, `?__variant=` URL 제어, 화살표·`H` 키, ARIA, HTML·CSS 명세 | 4단계에서 선택기를 구현할 때 읽는다 | 실제 페이지·선택기 구축 |
| `agents/openai.yaml` | 표시 이름(`Variant`), 짧은 설명, 암묵적 호출 차단 정책 | 호스트 UI 설정용. 동작 지시 없음 | 원문에 명시 없음 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| `disable-model-invocation: true` | 모델 자동 호출 금지. 사용자가 `/variant`로 직접 켜야 한다 | [](source:fm) |
| 범위가 여러 UI 조각에 걸칠 때 | 후보 목록을 제시하고 하나를 고르도록 묻고 멈춘다 | [](source:sk-step1) |
| 주 축 외 부차적 차이가 생길 때 | 밀도 변화에 따른 글자 축소 같은 일관성 조정만 허용. 색조·단어 몇 개만 다른 변형은 축 이동 또는 삭제 | [](source:sk-axes)[](source:sk-checks) |
| `better-interface` 11개 바닥 규칙 위반 | 접근성 이름·초점·키보드·모션 감소·320px/200% zoom·대비·색 단독 의존·파괴적 확인·말줄임 복원·숨김 단서·오류 복구·의미색 위배는 축과 교환 금지, 성립 불가 방향은 탈락 | [](source:sk-floor) |
| 변형 수·이름·데이터·크기 | 기본 3개(요청 시 5개), `Option A` 대신 서술형 이름, 썸네일 대신 1개 실물 크기, lorem ipsum·3행·`Jane Doe` 금지 | [](source:sk-step3)[](source:sk-step4)[](source:sk-checks) |
| 선택기 스타일·배치 | 프로젝트 토큰·폰트·색 사용 금지(`all: unset` 다크 크롬 유지). 가로 탭 줄 대신 세로 그룹 목록·`<select>` 이중 렌더 | [](source:sk-checks)[](source:pk-chrome)[](source:pk-behavior)[](source:pk-html)[](source:pk-css) |
| 5단계 비교 표 제시 직후 | 선호 표시 없이 장단점·실행 주소·키·판정 너비를 밝히고 멈춘다. 직접 물었을 때만 사용 빈도·제품 성격으로 답한다 | [](source:sk-step5) |
| 재탐색 요청 vs 승격 선택 | 재탐색이면 하네스를 남겨 3단계 재실행. 선택 확정이면 정식 구현 후 나머지·선택기·`__variant`·import 일괄 삭제 및 검색 확인 | [](source:sk-step6) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 바닥 규칙 11개와 5개 축 소유 매핑 — 단일 축·후보 정의 · `better-interface` `escalation trigger` 11항목과 5개 축별 도메인 기준
- 선택기 HTML·CSS·접근성 규격 — 실제 페이지·선택기 구축 · `all: unset` 격리 CSS, `232px + 실제 너비` container query, `H` 키 무시 조건

@callout level=open-question title="확인하지 못한 것"
| 사용자가 "더 많은 대안"을 계속 요청할 때 5개를 넘어 어디까지 허용할지 상한은 `SKILL.md`에 명시 없음(`picker.md`는 목록 30개까지도 훑을 수 있다고 적음).[](source:sk-step3)[](source:pk-chrome) |
| 호스트 페이지가 없어 자체 완결 HTML 1개로 만들 때 프로젝트의 기존 컴포넌트나 토큰을 어떻게 번들링할지는 원문에 명시 없음.[](source:sk-step4) |

읽은 원본: 텍스트 파일 3개(관계 확인용으로 `prototype`, `afk`, `break`, `better-interface`, `better-layout` 일부 줄 추가 확인). 제외: 없음.
