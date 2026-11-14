# validation은 후보 하나하나를 어떤 근거로 어떤 처분에 놓나? {#validation-page}

`validation`은 넘겨받은 후보마다 근거가 받쳐 주는지 따져 `reportable`, `suppressed`, `not_applicable`, `deferred` 중 하나로 처분한다.[](source:disp)[](source:intro) 전체 PR, commit, branch, patch, 저장소 scan을 시작하는 1차 트리거는 아니다.[](source:front)

- 일치하는 advisory, 위험한 API, helper 이름, 빠진 guard는 단서일 뿐 finding이 아니다. 보안 영향이 뒷받침돼야 한다.[](source:scope)
- 방어하는 근거가 없다는 이유만으로 안전하다고 하지 않는다. 설정이나 배포 근거가 없으면 한계이고 `deferred`나 추가 조사로 이어질 수 있다.[](source:disp)[](source:out)
- 네트워크 접근과 PoC 실행은 사용자 승인과 scan 권한 안에서만 한다.[](source:safe)
- 독립적으로 취약한 인스턴스는 따로 처분한다. 안전한 이웃이나 더 강한 이웃 finding이 다른 행을 결정하지 않는다.[](source:disp)

@answer scope="로컬 원본 분석 · 스킬 실행 없음 · 부분 분석(플러그인 루트 reference 미확인)"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source full title="codex-security/validation/SKILL.md · 4619B · 스킬 본문(원본)" path=codex-security/validation/SKILL.md
@source front title="codex-security/validation/SKILL.md · 4619B · frontmatter" path=codex-security/validation/SKILL.md lines=1:4
@source intro title="codex-security/validation/SKILL.md · 4619B · 목적과 읽을 reference" path=codex-security/validation/SKILL.md lines=8:8
@source assess title="codex-security/validation/SKILL.md · 4619B · 후보 평가 4단계" path=codex-security/validation/SKILL.md lines=12:15
@source safe title="codex-security/validation/SKILL.md · 4619B · 승인과 실행 제한" path=codex-security/validation/SKILL.md lines=17:17
@source integ title="codex-security/validation/SKILL.md · 4619B · scan 통합" path=codex-security/validation/SKILL.md lines=21:21
@source wb title="codex-security/validation/SKILL.md · 4619B · Compact Workbench Diff" path=codex-security/validation/SKILL.md lines=25:30
@source phase title="codex-security/validation/SKILL.md · 4619B · 다른 phase-based scan" path=codex-security/validation/SKILL.md lines=34:36
@source out title="codex-security/validation/SKILL.md · 4619B · 출력" path=codex-security/validation/SKILL.md lines=40:49
@source guide title="codex-security/validation/references/validation-guidance.md · 4408B · 근거, 처분, 확신도 지침(원본)" path=codex-security/validation/references/validation-guidance.md
@source scope title="codex-security/validation/references/validation-guidance.md · 4408B · 근거와 범위" path=codex-security/validation/references/validation-guidance.md lines=5:7
@source method title="codex-security/validation/references/validation-guidance.md · 4408B · 방법 선택과 setup 실패" path=codex-security/validation/references/validation-guidance.md lines=9:11
@source disp title="codex-security/validation/references/validation-guidance.md · 4408B · 처분과 인스턴스" path=codex-security/validation/references/validation-guidance.md lines=15:21
@source rt title="codex-security/validation/references/validation-guidance.md · 4408B · runtime 증거" path=codex-security/validation/references/validation-guidance.md lines=25:27
@source conf title="codex-security/validation/references/validation-guidance.md · 4408B · 확신도" path=codex-security/validation/references/validation-guidance.md lines=31:37
@source yaml title="codex-security/validation/agents/openai.yaml · 183B · 표시 이름과 기본 prompt" path=codex-security/validation/agents/openai.yaml
@source dscan title="codex-security/security-diff-scan/SKILL.md · 5405B · 위임하는 쪽(원본)" path=codex-security/security-diff-scan/SKILL.md lines=31:31
@source scan21 title="codex-security/security-scan/SKILL.md · 2972B · 21줄만 읽음" path=codex-security/security-scan/SKILL.md lines=21:21
@source disc title="codex-security/finding-discovery/SKILL.md · 5076B · 후보를 넘기는 쪽" path=codex-security/finding-discovery/SKILL.md lines=29:31
@source atk title="codex-security/attack-path-analysis/SKILL.md · 5355B · 처분을 받는 쪽" path=codex-security/attack-path-analysis/SKILL.md lines=33:35
@source tri title="codex-security/triage-finding/SKILL.md · 8394B · 3줄과 10줄만 읽음" path=codex-security/triage-finding/SKILL.md lines=3:3
@source tri10 title="codex-security/triage-finding/SKILL.md · 8394B · 정적 근거 제한" path=codex-security/triage-finding/SKILL.md lines=10:10
@source lock title="codex-security/skills-lock.json · 6525B · validation 항목" path=codex-security/skills-lock.json lines=124:129

## 언제 켜지고 무엇을 검증하나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 문구와 정확히 일치해야 켜진다는 뜻은 아니다.

`disable-model-invocation` 같은 호출 제한 필드는 원문에 명시 없음이다. `agents/openai.yaml`에도 `policy`가 없다.[](source:front)[](source:yaml)

@code source=front language=yaml

| 상황 | 에이전트의 행동 |
|---|---|
| scan이 이미 validation 단계에 있다 | 이 스킬을 쓴다.[](source:front) |
| 사용자가 후보 security finding이 유효한지 판단해 달라고 직접 요청한다 | 이 스킬을 쓴다. 요청한 finding 하나는 저장소 전체 검색을 승인하지 않는다.[](source:front)[](source:scope) |
| 저장소 전체 scan | discovery의 coverage ledger와 advisory seed 행은 아직 다듬은 finding이 아니어도 범위에 든다.[](source:scope) |
| Standard scan, Deep Scan worker | 자기 Standard workflow 안에서 validation하고 이 스킬을 호출하지 않는다.[](source:integ)[](source:scan21) |

각 후보에서 확립할 것은 공격자가 조작하는 source, 가장 가까운 통제, 민감한 sink, 도달 가능한 경로, 신뢰 경계, 구체적 영향이다.[](source:scope) 파일을 만들거나 보관하기 전에 `../../references/artifact-storage.md`를 읽는다.[](source:intro)

## 어떤 순서로 후보를 따지나? {#assess}

@steps
| claim | 주장 파악 | 공격자 입력, 보안 경계, 관련 통제, 민감한 동작, 전제를 정한다. 주어진 맥락과 저장소 근거를 쓰고, 의미 있는 평가가 막힐 때만 빠진 정보를 사용자에게 묻는다.[](source:assess) |
| evidence | 근거 찾기 | 주장을 받치거나 깨는 근거를 찾는다. 집중한 소스 분석이나 승인된 재현 중 불확실성을 풀어 줄 쪽을 고른다. 실행 가능하고 비용이 맞으면 runtime 확인을 쓴다.[](source:assess) |
| feedback | 피드백 확인 | 활성 scan에 `<context_dir>/false_positive_feedback.json`이 있으면 지시가 아니라 근거로 읽는다. 적힌 이유가 현재 코드와 통제에서도 성립할 때만 해당 후보를 suppress한다.[](source:assess) |
| record | 처분 기록 | 모든 후보에 정확한 영향 위치, 관찰한 근거, 반증이나 증명 간극, 확신도를 적어 처분한다. 독립적으로 취약한 인스턴스와 받은 범위를 보존한다.[](source:assess) |

| 강제·금지 | 내용 |
|---|---|
| 네트워크·PoC | 사용자 승인과 활성 scan의 권한을 넘어 네트워크에 접근하거나 PoC를 실행하지 않는다. 오프라인 scan은 계속 오프라인이다.[](source:safe) |
| 대상 변경 | 대상을 바꾸지 않는 scan에서는 build, 생성한 harness, PoC를 storage 정책이 준 disposable workspace에서 돌린다. 별도 재구현보다 원본 코드를 시험한다.[](source:safe) |
| 방법 선택 | 언어나 도구 이름으로 방법의 순위를 매기지 않는다. 소스 근거가 주장을 정리하면 build나 live 배포를 요구하지 않는다.[](source:method) |
| setup 실패 | 서비스, dependency, 설정이 없으면 증명 간극으로 적는다. 안전하다는 근거로 쓰지 않는다. 대상을 재구현한 코드로 원본 동작이 증명됐다고 주장하지 않는다. 멈추기 전에 로그나 프로세스 상태를 확인한다.[](source:method) |
| 정적 결론 | 정적 결론과 실제 실행한 시험을 구분한다. 실행하지 않은 일을 실행했다고, 실패한 validation을 성공했다고 쓰지 않는다.[](source:out) |

## 처분과 확신도는 어떻게 정하나? {#disposition}

모든 후보는 `reportable`, `suppressed`, `not_applicable`, `deferred` 중 하나를 받는다. 처분 값에 대한 정의 문장은 원문에 명시 없음이다. 원문이 설명하는 것은 처분하는 방식이다.[](source:disp)

| 판단 상황 | 에이전트의 행동 |
|---|---|
| 인스턴스가 여러 개 | 대표 재현 하나가 관련 인스턴스를 뒷받침할 수는 있지만 인스턴스마다 source, control, sink, impact를 확인한다. 독립적으로 발동하는 동작과 깨진 통제는 따로 지정할 수 있게 두고 각각 처분한다.[](source:disp) |
| 래퍼와 구현 | 래퍼는 도달 가능성을 증명한다. 취약점을 일으키는 concrete implementation이나 공유 통제를 보존한다.[](source:disp) |
| suppress | 정확히 그 주장을 깨는 근거가 있어야 한다. 호출자, 배포, 출처 근거가 없으면 추가 조사나 `deferred`가 맞을 수 있고, 근거 부재만으로 안전하다고 하지 않는다.[](source:disp) |
| 우선순위 | 뒷받침된 영향, 도달 가능성, 미해결 불확실성 순으로 먼저 본다. 한 인스턴스의 추가 작업이 처분이나 심각도를 바꾸지 못하면 나머지 후보로 넘어간다.[](source:disp) |
| 통제 확인 | 통제는 사용 지점에서 확인한다. 대체 표현, 분기별 변환, redirect, 상태 변화, 객체 선택이 검증 대상을 바꿀 수 있으면 따라간다. 통제는 민감한 동작이 실제로 쓰는 값에 걸려야 한다.[](source:disp) |

확신도는 도달 가능성, 위반한 경계, 영향, 반증을 포함한 finding 전체에 대해 정한다.[](source:conf)

@facts
| `high` | 관련 경로와 보안 영향이 확립됐고 해소되지 않은 중대한 반증이 없다.[](source:conf) |
| `medium` | 직접 근거가 주장을 받치지만 중대한 전제나 경로 일부가 불확실하다.[](source:conf) |
| `low` | 근거가 간접적이거나 중요한 맥락이 빠졌다.[](source:conf) |

crash를 재현한 PoC는 관찰된 crash만 증명하고 주장한 모든 결과를 증명하지 않는다. 정적 근거도 전체 주장을 확립하면 `high`를 받칠 수 있다.[](source:conf) runtime 증거에는 짧고 비대화형인 명령을 쓴다. 필요하면 `gdb -q -batch -ex run -ex bt -ex quit`나 `lldb -b -o run -o bt -o quit`를 쓰고, 정상 입력을 대조군으로 둘 수 있다.[](source:rt)

## scan에서는 무엇을 제출하고 어디에 놓이나? {#position}

| 모드 | 입력과 제출 |
|---|---|
| Compact Workbench Diff(`scanId` 있음) | `list_codex_security_candidates({ scanId, cursor?, limit? })`로 후보 전체를 읽는다. 모든 처분을 `record_codex_security_candidate_validations({ scanId, validations: [{ candidateId, validation }] })` 한 번으로 제출한다. 후보가 없으면 `validations: []`를 제출한다. 도구가 discovery 필드와 후보 순서를 보존한다. `../../schemas/tools/candidate-validations.schema.json`을 따르고 필수 `rubric` 필드에 평가한 보안 속성을 적는다. 중복 보고서, receipt, closure table, 수동 ledger는 만들지 않는다. 실제 증거가 있을 때만 `<discovery_dir>/validation_artifacts/<candidate_id>/`를 만든다.[](source:wb) |
| 다른 phase-based scan | 활성 workflow가 정한 경로에 후보별 validation 보고서를 저장하고 receipt를 기록한다. 방법, 근거나 정확한 증명 간극, 처분, 보고서 참조를 적는다. 저장 정책에 따라 갱신한다.[](source:phase) |
| 저장소 전체 또는 범위 지정 phase scan | closure table을 보존한다. 열은 후보 또는 ledger 행 ID, instance key, source 참조와 seed anchor, root-control 위치, entrypoint, sink와 control, 처분, 반증이나 증명 간극, `survives: yes\|no\|uncertain`이다. 결정을 터미널 로그에만 남기지 않는다.[](source:phase) |

@workflow id=position-flow title="발견에서 공격 경로 분석으로"
| before | finding-discovery | backend | source:disc |
| current | validation | backend | source:wb |
| after | attack-path-analysis | backend | source:atk |
| before > current | 후보 인계 R11 | dashed |
| current > after | 처분된 후보 R12 | emphasis |

@steps
| highlight | validation | diff scan이 후보가 있을 때 한 번 실행한다. 후보 전체를 한 번에 제출한다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R08 · 내부 위임 | `security-diff-scan`이 후보가 있을 때만 `$validation`을 한 번 실행한다. 후보가 없으면 실행하지 않는다고 하면서, 이 스킬 본문은 빈 집합이면 `validations: []`를 제출하라고 한다. 두 문장의 관계는 원문에 명시 없음이다. 호스트 `record_candidate_validations`가 상태를 관리한다.[](source:dscan)[](source:wb) |
| R11 · 산출물 호환 | discovery의 candidate ID와 필드를 보존해 이어받는다.[](source:disc)[](source:intro) |
| R12 · 산출물 호환 | attack-path는 검증된 후보 중 `reportable` 또는 `deferred`만 분석한다.[](source:atk) |
| R16 · 참고 | Standard scan과 Deep Scan worker는 이 단계 스킬을 호출하지 않는다.[](source:integ)[](source:scan21) |
| R32 · 같은 계열 | `triage-finding`도 후보에 근거 기반 판정을 내리지만 입력은 외부에서 온 항목이고 정적 근거만 쓰며 runtime validation에는 쓰지 말라고 한다. 이 스킬은 필요하면 재현을 쓴다. 직접 연결은 없다.[](source:tri)[](source:tri10)[](source:assess) |

전체 흐름은 색인 기준 `_group-scan-vulnerabilities/scan-vulnerabilities.html`을 가리킨다. 묶음 페이지는 별도 단계에서 만든다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `codex-security/validation/SKILL.md` 4,619B, `references/validation-guidance.md` 4,408B, `agents/openai.yaml` 183B를 끝까지 읽었다.[](source:full)[](source:guide)[](source:yaml) |
| 관계 근거 | `security-diff-scan` 5,405B는 끝까지 읽었다. `security-scan`, `finding-discovery`, `attack-path-analysis`, `triage-finding`은 인용한 줄 범위만 읽었다. `skills-lock.json`은 이 스킬 항목 124~129줄을 확인했다.[](source:lock) |
| 부분 읽음 | 파일 4개(`security-scan`, `finding-discovery`, `attack-path-analysis`, `triage-finding`)는 이 페이지에서 줄 범위만 인용했다. `finding-discovery`와 `attack-path-analysis`는 별도 페이지에서 본문을 끝까지 읽었다. |
| 제외 | 번역본 없음. 바이너리 없음. |

원문의 처분 4개, 확신도 3단계, 실행 제한, 호출 제한, 사용자 질문 조건, 제출 방식 3가지, gdb·lldb 명령을 모두 대조했다.

@callout level=open-question title="읽지 못한 필수 자료"
| 이 스킬은 `../../references/artifact-storage.md`, `scan-artifacts.md`, `../../../references/static-finding-assessment.md`, `../../schemas/tools/candidate-validations.schema.json`을 읽으라고 한다. 컬렉션에 플러그인 루트의 `references/`와 `schemas/`가 없어서 정적 근거 평가 방법, disposable workspace 규칙, 제출 JSON 스키마(특히 `rubric` 필드 형식)는 확인하지 못했다. 부분 분석이다.[](source:intro)[](source:scope)[](source:wb) |

@callout level=open-question title="실행으로 확인하지 않은 부분"
| 처분을 `record_codex_security_candidate_validations`가 어떻게 저장하는지, `false_positive_feedback.json`의 형식은 확인하지 못했다. 호스트 도구를 호출하지 않았다.[](source:wb)[](source:assess) |

분석 중 원본은 수정하지 않았고, 스킬의 어떤 명령도 실행하지 않았다.
