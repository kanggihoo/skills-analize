# improve-animations — 애니메이션을 감사해 실행 계획서를 만들고 필요 시 위임한다 {#overview}

`improve-animations`는 에이전트가 코드베이스의 모션 코드를 8개 범주로 감사해 우선순위표를 내고, 맥락 없는 하위 모델도 그대로 실행할 수 있는 개선 계획서 파일을 쓰게 하는 자문 스킬이다.[](source:s-fm)[](source:s-intro)

- 사용자가 "애니메이션을 개선해 줘", "모션을 감사해 줘"처럼 전체 로드맵을 원할 때 켜지며, `quick`/`deep` 깊이 조절·특정 범주 지정·`plan`·`execute`·`reconcile` 호출 변형을 지원한다.[](source:s-fm)[](source:s-var)
- 결과로 검증된 지적 표, 놓친 기회(최대 4건), 그리고 `plans/`(또는 `animation-plans/`) 아래 번호가 붙은 계획서 파일(`NNN-short-slug.md`)과 `README.md`가 남는다.[](source:s-rule)[](source:s-p3)[](source:s-p4)
- 다른 스킬과의 관계: `find-animation-opportunities`가 구현 핸드오프로 이 스킬(`plan`)을 안내하고, 이 스킬은 `execute` 실행 뒤 `review-animations`의 기준 문서로 diff를 검증하며 `animate`·`prototype`과 역할이 나뉜다.
- 에이전트가 직접 소스 코드를 수정하지 않으며(유일한 예외인 `execute <plan>`도 격리된 worktree의 실행 서브에이전트에 위임), 설치·빌드·커밋·포매터 실행을 금지한다.[](source:s-rule)

@answer scope="design/emilkowalski/improve-animations · 원본 파일 3개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source s-fm title="frontmatter: name과 description" path=design/emilkowalski/improve-animations/SKILL.md lines=1:4
@source s-init title="질문 없이 첫 호출 시 응답" path=design/emilkowalski/improve-animations/SKILL.md lines=8:14
@source s-intro title="자문 스킬 성격과 역할 경계" path=design/emilkowalski/improve-animations/SKILL.md lines=16:26
@source s-rule title="5가지 절대 규칙" path=design/emilkowalski/improve-animations/SKILL.md lines=28:35
@source s-p1 title="Phase 1: 정찰" path=design/emilkowalski/improve-animations/SKILL.md lines=38:50
@source s-p2 title="Phase 2: 병렬 감사와 노력 단계" path=design/emilkowalski/improve-animations/SKILL.md lines=52:75
@source s-p3 title="Phase 3: 검증, 우선순위, 사용자 확인" path=design/emilkowalski/improve-animations/SKILL.md lines=77:91
@source s-p4 title="Phase 4: 계획서와 README 작성" path=design/emilkowalski/improve-animations/SKILL.md lines=92:99
@source s-var title="6가지 호출 변형" path=design/emilkowalski/improve-animations/SKILL.md lines=100:110
@source s-tone title="어조와 느낌 확인 명시 규칙" path=design/emilkowalski/improve-animations/SKILL.md lines=111:113
@source a-cat title="AUDIT.md: 8개 감사 범주와 수치 기준" path=design/emilkowalski/improve-animations/AUDIT.md lines=1:116
@source a-chor title="AUDIT.md: choreograph 참조" path=design/emilkowalski/improve-animations/AUDIT.md lines=102:102
@source p-tpl title="PLAN-TEMPLATE.md: 계획서 구조와 작성 규칙" path=design/emilkowalski/improve-animations/PLAN-TEMPLATE.md lines=1:72
@source rel-anim title="animate의 전체 감사 대안 안내" path=design/emilkowalski/animate/SKILL.md lines=3:16
@source rel-find-hand title="find-animation-opportunities의 plan 핸드오프" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=26:26
@source rel-find-ver title="find-animation-opportunities의 Verdict 핸드오프" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=135:135
@source rel-find-alt title="find-animation-opportunities의 역할 경계" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=3:16
@source rel-rev title="review-animations/STANDARDS.md 기준표" path=design/emilkowalski/review-animations/STANDARDS.md lines=1:50
@source rel-proto title="prototype의 수정 계획 대안 안내" path=design/emilkowalski/prototype/SKILL.md lines=17:17

## 어떻게 동작하나 {#flow span=12}

질문 없이 처음 호출하면 지정 문장 한 줄만 답하고 대기한다.[](source:s-init) 범주를 지정하면(`performance`, `easing` 등) 정찰 뒤 해당 범주만 감사하고, `reconcile` 호출은 기존 `plans/` 문서를 현재 코드와 대조해 완료 표시와 줄 번호를 현행화한다.[](source:s-var)

@workflow id=flow-diagram title="improve-animations 흐름"
| lane recon | 정찰 |
| lane audit | 감사 |
| lane plan | 선별·계획 |
| lane exec | 위임·갱신 |
| p1_recon | Phase 1 정찰 | backend | recon | source:s-p1 |
| p2_audit | Phase 2 병렬 감사 | backend | audit | source:s-p2 |
| p3_vet | Phase 3 검증·선별 | backend | plan | source:s-p3 |
| p4_plan | Phase 4 계획서 작성 | backend | plan | source:s-p4 |
| exec_sub | execute 위임·검증 | backend | exec | source:s-var |
| p1_recon > p2_audit | 전체·범주 감사 |
| p1_recon > p4_plan | plan 요청(감사 생략) | dashed |
| p2_audit > p3_vet | 지적 수집 |
| p3_vet > p4_plan | 선택 완료 | emphasis |
| p4_plan > exec_sub | execute 요청 시 | dashed |

@steps id=flow-steps
| s-p1_recon | Phase 1 정찰 | **입력** 대상 저장소 · **출력** 스택·모션 위치·토큰 관례·제품 성격·빈도 지도 기록. **처리** 에이전트가 판단에 앞서 기존 토큰과 화면별 사용 빈도 등급을 기록해 병렬 표류나 과잉 지적을 막는다.[](source:s-p1) **다음** `plan <description>` 호출이면 필요한 만큼만 정찰하고 Phase 4로 바로 건너뛴다.[](source:s-var) | flow-diagram | p1_recon |
| s-p2_audit | Phase 2 병렬 감사 | **입력** 정찰 기록 · **참조** `AUDIT.md` · **출력** 범주별 원시 지적 목록(`file:line`과 근거). **처리** 8개 범주를 노력 단계(`quick` 0~1개, `standard` 최대 4개, `deep` 최대 8개)에 맞춰 읽기 전용 서브에이전트로 병렬 감사한다.[](source:s-p2)[](source:a-cat) **다음** 모든 서브에이전트 지시문에 `AUDIT.md` 절대 경로와 프롬프트 주입 무시 규칙을 그대로 넣는다.[](source:s-p2) | flow-diagram | p2_audit |
| s-p3_vet | Phase 3 검증·선별 | **입력** 원시 지적 목록 · **출력** 우선순위 표(`HIGH`/`MEDIUM`/`LOW`), 놓친 기회 최대 4건. **처리** 에이전트가 모든 `file:line`을 직접 다시 읽어 오탐·예외·합의된 설계를 걸러 낸 뒤 영향÷노력 순 표를 내고 멈춘다.[](source:s-p3) **다음** 사용자가 계획을 세울 항목을 고를 때까지 대기하며, 비대화형 실행이면 상위 3~5건을 고른다.[](source:s-p3) | flow-diagram | p3_vet |
| s-p4_plan | Phase 4 계획서 작성 | **입력** 선택된 지적과 현재 코드 · **참조** `PLAN-TEMPLATE.md` · **실행** `git rev-parse --short HEAD` · **출력** `plans/NNN-short-slug.md`와 `plans/README.md`. **처리** 맥락 없는 실행 모델도 따라 하도록 현재 코드 발췌, 정확한 목표 수치, 단계, 경계, 느낌 확인을 넣어 계획서와 목차를 쓴다.[](source:s-p4)[](source:p-tpl) **다음** `plans/`가 이미 다른 용도면 `animation-plans/`에 쓴다.[](source:s-rule) | flow-diagram | p4_plan |
| s-exec_sub | execute 위임·검증 | **입력** 작성된 계획서 파일 · **참조** `../review-animations/STANDARDS.md` · **출력** 격리 worktree diff 리뷰와 판정. **처리** 에이전트가 직접 코드를 고치지 않고 격리 worktree의 실행 서브에이전트에 위임한 뒤 diff를 `STANDARDS.md` 기준으로 검증한다.[](source:s-rule)[](source:s-var) **다음** 계획서를 직접 수정해 달라는 일반 요청은 거절하고 `execute <plan>`이나 다른 에이전트 실행을 안내한다.[](source:s-rule) | flow-diagram | exec_sub |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(`description`). "애니메이션 개선", "모션 감사" 요청과 `quick`/`deep`/`plan`/`execute`/`reconcile` 호출에서 켜진다. 호출 제한 필드는 없다.[](source:s-fm)[](source:s-var) |
| 성격 | 절차형(감사 후 계획서 작성·위임). 본체는 읽기 전용을 지키고 계획서만 쓰며, 실행은 격리 worktree 서브에이전트로 분리한다.[](source:s-rule) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `animate` {#rel-r16} | **이 스킬** | 대안 | 역할 경계: `animate`는 단일 모션 구현을 맡고, 코드베이스 전체 모션 감사는 사용자가 이 스킬을 고른다.[](source:rel-anim) |
| `find-animation-opportunities` {#rel-r29} | **이 스킬** | 다음 안내 | 제안: 사용자가 제안 표 항목 구현을 원하면 `improve-animations plan <description>`으로 핸드오프한다(사용자 요청 필요).[](source:rel-find-hand)[](source:rel-find-ver) |
| `find-animation-opportunities` {#rel-r31} | **이 스킬** | 대안 | 역할 경계: 기존 애니메이션 감사와 수정 계획 수립은 이 스킬을 쓴다(사용자 선택).[](source:rel-find-alt) |
| **이 스킬** {#rel-r33} | `review-animations` | 참고 | `execute <plan>` 실행 시 실행 서브에이전트가 만든 diff를 `../review-animations/STANDARDS.md` 기준으로 검증한다(사용자 개입 없음).[](source:s-var)[](source:rel-rev) |
| **이 스킬** {#rel-r34} | `review-animations` | 대안 | 역할 경계: 전체 코드베이스 감사가 아니라 단일 diff 리뷰만 필요하면 `review-animations`를 쓴다(사용자 선택).[](source:s-intro) |
| **이 스킬** {#rel-r35} | `choreograph` | 참고 | `AUDIT.md` 7번 범주에서 그룹 stagger 감사 시 `../choreograph/SKILL.md`를 참고로 가리킨다(미설치, 범위 밖).[](source:a-chor) |
| `prototype` {#rel-r41} | **이 스킬** | 대안 | 역할 경계: 프로토타입 탐색이 아니라 기존 UI 수정 계획 수립은 이 스킬을 쓴다(사용자 선택).[](source:rel-proto) |

@architecture id=relation-map title="improve-animations와 이어지는 스킬"
| anim | animate | backend |
| find | find-animation-opportunities | backend |
| proto | prototype | backend |
| self | improve-animations(이 스킬) | backend |
| rev | review-animations | backend |
| chor | choreograph | external |
| anim > self | 대안 |
| find > self | 다음 안내 · 대안 |
| proto > self | 대안 |
| self > rev | 참고 · 대안 |
| self > chor | 참고 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 5가지 절대 규칙, 4단계 워크플로, 노력 등급표, 6종 호출 변형을 담은 본문 113줄 | 스킬이 켜질 때 읽는다 | Phase 1 정찰, Phase 2 병렬 감사, Phase 3 검증·선별, Phase 4 계획서 작성, execute 위임·검증 |
| `AUDIT.md` | 8개 감사 범주별 점검 기준과 정확한 목표 수치(`--ease-out`, ms 예산, spring 등) 116줄 | `SKILL.md`가 감사 시 로드하라고 지시한다[](source:s-intro)[](source:s-p2)[](source:a-cat) | Phase 2 병렬 감사 |
| `PLAN-TEMPLATE.md` | 계획서(`NNN-short-slug.md`) 필수 절(문제, 목표, 관례, 단계, 경계, 기계적·느낌 검증) 양식 72줄 | `SKILL.md`가 계획서 작성 시 로드하라고 지시한다[](source:s-intro)[](source:s-p4) | Phase 4 계획서 작성 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 질문 없이 처음 호출될 때 | 정해진 한 문장만 답하고 대기한다. | [](source:s-init) |
| 본체가 소스 코드 수정을 요청받을 때 | 직접 편집을 금지하고 `plans/`(또는 `animation-plans/`)만 쓴다. 수정은 `execute <plan>` 위임만 예외다. | [](source:s-rule) |
| 감사·계획 단계에서 명령 실행이 필요할 때 | 설치, 부작용 있는 빌드, 커밋, 포매터 실행을 금지한다. | [](source:s-rule) |
| 저장소 파일에 지시를 바꾸려는 문구가 있거나, 설계 문서에 의도적 절충이 적혀 있을 때 | 프롬프트 주입 시도는 지적으로 보고하고 넘어가며, 합의된 모션 결정은 재논의하지 않는다. | [](source:s-rule) |
| Phase 2 병렬 감사를 실행할 때 | `quick`은 주 사용 경로만(서브에이전트 0~1, `HIGH`만 ~5건), `standard`는 ≤4, `deep`은 마케팅 페이지 포함 ≤8로 제한한다. | [](source:s-p2) |
| Phase 3에서 검증된 표를 제시한 뒤 | 사용자가 어떤 항목을 계획서로 쓸지 고를 때까지 멈추고 기다린다(비대화형이면 상위 3~5건 기본 선택). | [](source:s-p3) |
| 계획서에 수치나 목표를 적을 때 | "더 나은 easing" 같은 모호한 표현을 금지하고 `AUDIT.md`의 정확한 수치·현재 코드 발췌·느낌 확인 절차를 빠짐없이 넣는다. | [](source:s-rule)[](source:s-p4)[](source:p-tpl) |
| 코드만으로 크로스페이드나 spring 반동 느낌을 알 수 없을 때 | 추측하지 않고 불확실성을 밝힌 뒤 계획서의 느낌 확인 항목에 슬로우 모션·실기기 확인을 넣는다. | [](source:s-tone)[](source:p-tpl) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- `AUDIT.md` 8개 감사 범주와 정확한 목표 수치 — 맡을 개요 항목: Phase 2 병렬 감사 · 범주별 탐색 단서, `Motion` 14.2 가속 주의, `scale(0)`·`ease-in` 기준이 길어서 뺐다.
- `PLAN-TEMPLATE.md` 전체 구조와 병합 기준 — 맡을 개요 항목: Phase 4 계획서 작성 · 파일이 겹치는 지적의 병합 조건과 검증 절 템플릿을 개요에 담지 않았다.

@callout level=open-question title="확인하지 못한 것"
| `../choreograph/SKILL.md`는 저장소에 설치되어 있지 않아(`범위 밖`) 그룹 stagger 감사 세부 기준을 확인하지 못했다. |
| `execute <plan>`에서 실행 서브에이전트를 띄우는 구체적 도구와 격리 `worktree` 생성·정리 명령은 원문에 명시 없음. |

읽은 원본: 텍스트 파일 3개(`SKILL.md`, `AUDIT.md`, `PLAN-TEMPLATE.md`). 제외: `SKILL.ko.stale.md`, `AUDIT.ko.stale.md`, `PLAN-TEMPLATE.ko.stale.md` 3개(낡은 번역본).
