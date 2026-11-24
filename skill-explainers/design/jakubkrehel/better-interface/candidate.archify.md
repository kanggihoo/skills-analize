# better-interface — 7개 도메인 스킬을 순서대로 묶어 우선순위 인터페이스 리뷰 보고서를 낸다 {#overview}

better-interface는 인터페이스 리뷰를 직접 규정하지 않고, 접근성·레이아웃·문구·타이포그래피·색상·UI 마감·모션을 맡은 일곱 도메인 스킬을 정해진 순서로 불러 근거를 모은 뒤 단일 우선순위 보고서로 통합하게 하는 스킬이다.[](source:intro)

- 화면·흐름·기능·저장소 전체 인터페이스를 리뷰할 때 켜진다. 반대로 branch·PR·commit 범위·미커밋 변경분 리뷰 요청이면 직접 diff를 추측하지 않고 사용자에게 `interface-review` 실행을 요청하며 멈춘다.[](source:fm)[](source:s2)
- 결과로 남는 것은 기본적으로 파일을 수정하지 않는 단일 보고서(범위·도메인 점검표, 최대 15건 Findings 표, 검증 기록, `Block` 또는 `Approve` 판정 결과)다.[](source:cap)[](source:fmt)
- 다른 스킬과의 관계: 7개 도메인 스킬(`better-accessibility`·`better-layout`·`better-writing`·`better-typography`·`better-colors`·`better-ui`·범위 밖 `better-motion`)을 순서대로 `호출`하고, `interface-review`와는 변경분 분기 `다음 안내`·결과 통합 `호출`로 이어지며, `variant`가 후보 필터링에 `호출`하고 `afk`·`break`와는 `대안` 관계다.[](source:s4)[](source:s2)[](source:ir-hand)[](source:var-rel)[](source:afk-rel)[](source:brk-rel)
- 하지 않는 것: 빠진 도메인 스킬의 규칙을 기억으로 지어내거나 이웃 스킬로 대신하지 않고, 원천 코드만으로 시각 결과를 단정하지 않으며, 사용자가 수정을 요청하지 않는 한 소스를 고치지 않는다.[](source:s4)[](source:evidence)[](source:cap)

@answer scope="design/jakubkrehel/better-interface · 원본 파일 3개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source fm title="frontmatter: name·description" path=design/jakubkrehel/better-interface/SKILL.md lines=1:4
@source intro title="진행 순서와 통합(orchestration) 전담과 도메인·변경분 경계" path=design/jakubkrehel/better-interface/SKILL.md lines=8:12
@source s1 title="1단계: 리뷰 범위 확정과 축소 기준" path=design/jakubkrehel/better-interface/SKILL.md lines=20:26
@source s2 title="2단계: 변경분 리뷰의 interface-review 이관과 반환 처리" path=design/jakubkrehel/better-interface/SKILL.md lines=28:32
@source s3 title="3단계: 스택·명령·프로젝트 규약 정찰" path=design/jakubkrehel/better-interface/SKILL.md lines=34:40
@source s4 title="4단계: 7개 도메인 스킬 순차 로드와 Not reviewed 규칙" path=design/jakubkrehel/better-interface/SKILL.md lines=42:58
@source s5 title="5단계: 안전 검증과 Not verified 처리" path=design/jakubkrehel/better-interface/SKILL.md lines=60:62
@source evidence title="코드·스크린샷 근거 요구 기준" path=design/jakubkrehel/better-interface/SKILL.md lines=64:66
@source rank title="사용자 영향 기반 심각도, 13개 escalation trigger, cap 면제" path=design/jakubkrehel/better-interface/SKILL.md lines=68:96
@source fix title="가장 저렴한 5단계 수정 사다리" path=design/jakubkrehel/better-interface/SKILL.md lines=98:108
@source cap title="근본 원인 통합, 15건 cap, 기본 읽기 전용" path=design/jakubkrehel/better-interface/SKILL.md lines=110:116
@source finish title="마무리 전 흔한 실수 점검표" path=design/jakubkrehel/better-interface/SKILL.md lines=118:128
@source fmt title="단독·변경분 보고서 출력 형식과 Block/Approve 판정" path=design/jakubkrehel/better-interface/review-format.md lines=1:46
@source yaml title="UI 표시 이름과 짧은 설명" path=design/jakubkrehel/better-interface/agents/openai.yaml lines=1:3
@source ir-scope title="변경 없음 시 전체 감사 이관 경로" path=design/jakubkrehel/interface-review/SKILL.md lines=39:44
@source ir-hand title="interface-review 7단계의 better-interface 호출" path=design/jakubkrehel/interface-review/SKILL.md lines=93:97
@source afk-rel title="afk와의 역할 경계" path=design/jakubkrehel/afk/SKILL.md lines=11:11
@source brk-rel title="break와의 역할 경계" path=design/jakubkrehel/break/SKILL.md lines=11:11
@source var-rel title="variant의 escalation trigger 바닥 통과 검증" path=design/jakubkrehel/variant/SKILL.md lines=29:41

## 어떻게 동작하나 {#flow span=12}

절차형이다. 그림에 없는 분기가 하나 있다. `interface-review`가 이미 diff 범위를 풀어 이 스킬에 리뷰를 넘긴 경우에는 변경분 분기에서 멈추지 않고 정찰로 이어지며, `cap`(보고서 지적 상한, 최대 15개)과 `Block`·`Approve` 판정 결과는 `Introduced`와 `Regression` 지적에만 적용한다.[](source:s2)

@workflow id=flow-diagram title="better-interface 흐름"
| lane scope | 범위 확인과 분기 |
| lane review | 정찰·도메인 검토·검증 |
| lane report | 통합과 판정 |
| resolve | 범위 확인 | backend | scope | source:s1 |
| is-change | 새 변경분 요청인가? | backend | scope | source:s2 |
| send-ir | interface-review 요청 후 멈춤 | external | scope | source:s2 |
| recon | 스택·규약 정찰 | backend | review | source:s3 |
| domain | 7개 도메인 순차 검토 | backend | review | source:s4 |
| verify | 안전 검증·렌더 확인 | backend | review | source:s5 |
| consolidate | 통합·격상·순위화 | backend | report | source:rank |
| report | 보고서·판정 출력 | backend | report | source:fmt |
| resolve > is-change | |
| is-change > send-ir | 예 |
| is-change > recon | 아니오·위임 |
| recon > domain | |
| domain > verify | |
| verify > consolidate | |
| consolidate > report | |

@steps id=flow-steps
| s-resolve | 범위 확인 | **입력** 사용자 요청과 현재 workspace · **출력** 화면·흐름·기능·저장소 범위와 제외 경계. **처리** 빈·로딩·오류·좁은 폭 상태까지 범위에 포함하고, 범위가 너무 크면 요청 중심 흐름이나 필수 진입 경로 하나로 좁혀 제외 대상을 밝힌다.[](source:s1) | flow-diagram | resolve |
| s-is-change | 새 변경분 요청인가? | **입력** 확정된 요청 대상 · **출력** `interface-review` 안내 중단 또는 정찰 진행. **처리** branch·PR·commit 범위·미커밋 변경 리뷰 요청인지 가려 직접 diff 범위를 추측하지 않게 막는다.[](source:s2) **다음** `interface-review`가 범위를 넘겨 위임한 건이면 멈추지 않고 정찰로 간다.[](source:s2) | flow-diagram | is-change |
| s-send-ir | interface-review 요청 후 멈춤 | **입력** 변경 리뷰 요청 사유 · **출력** 사용자에게 `interface-review` 실행을 요청하는 안내문. **처리** `interface-review`는 사용자 호출형이라 이 스킬에서 켤 수 없음을 밝히고 실행을 멈춘다.[](source:s2) | flow-diagram | send-ir |
| s-recon | 스택·규약 정찰 | **입력** 대상 코드베이스 · **참조** `CONTRIBUTING.md`, `CODING_STANDARDS.md`, `AGENTS.md`, `CLAUDE.md`, 디자인 시스템·Storybook·ADR 문서 · **출력** 스택·토큰·지원 viewport·명령·문서 목록. **처리** 프로젝트의 프레임워크·스타일 체계·디자인 토큰·테스트 명령과 문서화된 인터페이스 규약을 파악한다.[](source:s3) | flow-diagram | recon |
| s-domain | 7개 도메인 순차 검토 | **입력** 정찰 결과와 7개 `better-*` 도메인 스킬 · **참조** `better-accessibility`, `better-layout`, `better-writing`, `better-typography`, `better-colors`, `better-ui`, `better-motion` · **출력** 도메인별 근거와 지적 목록. **처리** 기초 실패가 마감에 가리지 않도록 1번부터 7번 순서로 각 도메인 스킬의 원칙·레퍼런스·점검을 적용하되, 심각도와 형식은 이 스킬의 기준으로 대체한다.[](source:s4) **다음** 없는 스킬은 `Not reviewed`로 적고 계속 진행하며, 겹치는 지적은 근본 규칙 소유 스킬에 배정한다.[](source:s4) | flow-diagram | domain |
| s-verify | 안전 검증·렌더 확인 | **입력** 프로젝트 테스트·미리보기 명령 · **실행** 프로젝트가 제공하는 안전한 검증 명령과 렌더 화면 확인 · **출력** 통과 검사와 `Not verified` 목록. **처리** 런타임 동작이나 시각 판단이 필요하면 렌더 상태를 직접 보고 정확한 명령과 결과를 남긴다.[](source:s5) | flow-diagram | verify |
| s-consolidate | 통합·격상·순위화 | **입력** 도메인별 지적과 검증 결과 · **출력** 근본 원인 단위로 합친 우선순위 목록과 최소 수정안. **처리** 13개 escalation trigger(켜지면 표면이 사소해도 `HIGH`인 증상)를 `HIGH`로 올려 cap에서 면제하고, 같은 근본 원인은 1행으로 묶어 최대 15건까지 추린 뒤 삭제→플랫폼→재사용→값 교정→추가 순으로 수정안을 고른다.[](source:rank)[](source:fix)[](source:cap) | flow-diagram | consolidate |
| s-report | 보고서·판정 출력 | **입력** 통합 지적 목록·검증 결과·점검표 · **참조** `review-format.md` · **출력** Scope and coverage·Findings·Verification·Verdict 보고서. **처리** 도메인별 점검표와 단일 지적 표를 출력하고, `HIGH`가 남으면 `Block`, 없으면 `Approve`를 내리되 `Not reviewed` 도메인을 판정 줄에 함께 밝힌다.[](source:fmt) **다음** 사용자가 수정을 요청했을 때만 보고서 범위 안에서 수정하고 관련 검증을 다시 돌린다.[](source:cap) | flow-diagram | report |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 호출형이다(`description` 기준 모델이 판단해 켠다). frontmatter에 호출 제한 필드가 없다.[](source:fm) |
| 성격 | 7개 `better-*` 도메인 스킬의 진행 순서와 결과 통합(orchestration)을 맡아 단일 판정 보고서를 내는 총괄 리뷰 스킬.[](source:intro)[](source:s4) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#rel-r46} | better-accessibility | 호출 | 의무: 1번 순서로 로드·리뷰한 뒤 결과를 통합한다. 형식과 심각도는 이 스킬의 것으로 대체한다(사용자 개입 없음).[](source:s4) |
| **이 스킬** {#rel-r47} | better-layout | 호출 | 의무: 2번 순서로 로드·리뷰한 뒤 결과를 통합한다(사용자 개입 없음).[](source:s4) |
| **이 스킬** {#rel-r48} | better-writing | 호출 | 의무: 3번 순서로 로드·리뷰한 뒤 결과를 통합한다(사용자 개입 없음).[](source:s4) |
| **이 스킬** {#rel-r49} | better-typography | 호출 | 의무: 4번 순서로 로드·리뷰한 뒤 결과를 통합한다(사용자 개입 없음).[](source:s4) |
| **이 스킬** {#rel-r50} | better-colors | 호출 | 의무: 5번 순서로 로드·리뷰한 뒤 결과를 통합한다(사용자 개입 없음).[](source:s4) |
| **이 스킬** {#rel-r51} | better-ui | 호출 | 의무: 6번 순서로 로드·리뷰한 뒤 결과를 통합한다(사용자 개입 없음).[](source:s4) |
| **이 스킬** {#rel-r52} | better-motion(범위 밖) | 호출 | 의무: 7번 순서로 로드 대상이나 미설치 시 `Not reviewed`로 남기고 계속 진행한다(사용자 개입 없음).[](source:s4) |
| **이 스킬** {#rel-r53} | interface-review | 다음 안내 | 의무: branch·PR·미커밋 변경분 리뷰 요청이면 사용자에게 `interface-review` 실행을 요청한다(`disable-model-invocation: true`, 사용자 호출 필요).[](source:s2) |
| interface-review {#rel-r54} | **이 스킬** | 호출 | 의무: `interface-review` 7단계에서 범위 블록과 영향 화면을 이 스킬에 넘겨 통합·판정한다. 미가용 시 중단한다(사용자 개입 없음).[](source:s2)[](source:ir-hand) |
| interface-review {#rel-r55} | **이 스킬** | 다음 안내 | 제안: 리뷰할 변경이 없고 전체 저장소 감사를 선택하면 이 스킬로 이관한다(사용자 선택 필요).[](source:ir-scope) |
| afk {#rel-r76} | **이 스킬** | 대안 | 역할 경계: 기존 인터페이스 리뷰는 이 스킬을 쓴다(사용자 선택).[](source:afk-rel) |
| break {#rel-r80} | **이 스킬** | 대안 | 역할 경계: 기준 대비 코드 리뷰는 이 스킬과 `interface-review`를 쓴다(사용자 선택).[](source:brk-rel) |
| variant {#rel-r88} | **이 스킬** | 호출 | 의무: `variant`의 모든 변형 후보는 선택기(`picker`) 등록 전 이 스킬의 escalation trigger를 반드시 통과해야 한다(사용자 개입 없음).[](source:var-rel) |

@architecture id=relation-map title="better-interface와 이어지는 스킬"
| ir | interface-review | backend |
| var | variant | backend |
| self | better-interface(이 스킬) | backend |
| a11y | better-accessibility | backend |
| lay | better-layout | backend |
| wri | better-writing | backend |
| typ | better-typography | backend |
| col | better-colors | backend |
| ir > self | 호출 · 다음 안내 | |
| var > self | 호출 | |
| self > ir | 다음 안내 | |
| self > a11y | 호출 | |
| self > lay | 호출 | |
| self > wri | 호출 | |
| self > typ | 호출 | |
| self > col | 호출 | |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 5단계 리뷰 순서, 13개 escalation trigger, 5단계 수정 사다리, 15건 cap 규칙 | 스킬이 켜지면 읽는다 | 범위 확인, 새 변경분 요청인가?, interface-review 요청 후 멈춤, 스택·규약 정찰, 7개 도메인 순차 검토, 안전 검증·렌더 확인, 통합·격상·순위화 |
| `review-format.md` | Scope and coverage·Findings·Verification·Verdict 형식과 변경분 리뷰 확장 규약 | 결과를 정리해 출력할 때 읽는다 | 보고서·판정 출력 |
| `agents/openai.yaml` | UI 표시 이름과 짧은 설명 메타데이터[](source:yaml) | UI가 스킬을 보여 줄 때 쓴다. 지시 본문이 아니다 | 원문에 명시 없음 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 요청 범위가 커서 신뢰성 있게 점검할 수 없음 | 요청 중심 흐름이나 필수 진입 경로 하나로 축소하고 제외 대상을 명시한다. 미점검 화면을 리뷰한 것처럼 쓰지 않는다 | [](source:s1) |
| 요청이 branch·PR·commit 범위·미커밋 변경분 리뷰임 | 멈추고 사용자에게 `interface-review` 실행을 요청한다. diff를 스스로 추측하지 않는다 | [](source:s2) |
| `interface-review`가 변경분 리뷰를 위임해 반환함 | 15건 cap과 `Block`/`Approve` 판정은 `Introduced`·`Regression` 지적에만 적용한다. `Pre-existing`만 남으면 `Approve`다 | [](source:s2) |
| 도메인 스킬이 없거나 안전 검사를 실행할 수 없음 | 없는 도메인은 `Not reviewed`로, 못 돌린 검사는 `Not verified`로 남기고 계속 진행한다. 기억으로 규칙을 재구성하거나 미실행 검사를 지적으로 보고하지 않는다 | [](source:s4)[](source:s5)[](source:finish) |
| 코드만으로는 시각 결과를 알 수 없거나 코드 없는 스크린샷만 있음 | 런타임·시각 판단이 필요하면 렌더 상태를 확인하며, 코드 지적에는 `path/to/file:line` 근거를 요구한다 | [](source:evidence)[](source:finish) |
| 13개 escalation trigger 중 하나를 도메인 스킬이 확인함 | 표면이 사소해도 즉시 `HIGH`로 격상하며, 최대 15건 cap에서 면제해 빠짐없이 보고한다 | [](source:rank) |
| 동일 근본 원인이 여러 컴포넌트에 걸쳐 반복됨 | 컴포넌트마다 행을 나누지 않고 공유 토큰·컴포넌트 기준 1행으로 통합해 모든 위치를 적는다 | [](source:cap)[](source:finish) |
| 수정 요청 없이 리뷰만 요청됨 | 읽기 전용으로 유지하고 소스를 편집하지 않는다. 수정 요청 시에는 통합 보고서 범위만 고치고 검증을 재실행한다 | [](source:cap) |
| 판정 출력 시 `HIGH` 지적 유무 | 1건 이상이면 `Block`(수정 전 배포 금지), 0건이면 `Approve`를 내린다. `Not reviewed` 도메인은 판정 줄에 이름을 밝힌다 | [](source:fmt) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 13개 escalation trigger 목록과 판정 규칙 — 통합·격상·순위화 · 접근 가능한 이름 누락, 포커스 링 누락, 320px/200% 클리핑 등 13개 항목을 개요에서는 요약만 남겼다.
- 5단계 수정 사다리(Delete → Platform → Reuse → Correct value → Add) — 통합·격상·순위화 · 삭제 대상이 코드에 있으면 삭제 자체를 **After**로 적는 기준을 상세로 풀 수 있다.
- `review-format.md` 표 열 규칙과 변경분 확장 — 보고서·판정 출력 · `Status` 열과 pre-existing 절이 붙는 조건과 예시를 개요에서 줄였다.

@callout level=open-question title="확인하지 못한 것"
| `better-motion`은 4단계에서 7번째 필수 도메인 스킬로 지목되지만 이 저장소에는 없다. 스킬 지시상 해당 도메인은 `Not reviewed`로 남기고 진행한다. |

읽은 원본: 텍스트 파일 3개(`SKILL.md`, `review-format.md`, `agents/openai.yaml`)와 관계 대조용 형제 스킬 원문 일부(`interface-review/SKILL.md`, `afk/SKILL.md`, `break/SKILL.md`, `variant/SKILL.md`). 제외: 없음.
