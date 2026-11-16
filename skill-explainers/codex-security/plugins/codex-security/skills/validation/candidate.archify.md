# validation은 후보 하나하나를 어떤 근거로 어떤 처분에 놓나? {#validation-page}

`validation`은 넘겨받은 후보마다 근거가 받쳐 주는지 따져 `reportable`, `suppressed`, `not_applicable`, `deferred` 중 하나로 처분한다.[](source:purpose)[](source:g-disp) scan이 이미 validation 단계에 있거나 사용자가 후보 보안 finding이 유효한지 판단해 달라고 직접 요청할 때 쓴다. 전체 PR, commit, branch, patch, 저장소 scan을 시작하는 1차 트리거로는 쓰지 않는다.[](source:fm)

- 일치하는 advisory, 위험한 API, helper 이름, 빠진 guard는 단서일 뿐 finding이 아니다. 보안 영향이 뒷받침돼야 한다.[](source:g-scope)
- 환경이나 배포 근거가 없다는 이유로 안전하다고 하지 않는다. 그것은 한계이고 증명 간극이다.[](source:g-method)[](source:out)
- 네트워크 접근과 PoC 실행은 사용자 승인과 활성 scan의 권한 안에서만 한다. 오프라인 scan은 계속 오프라인이다.[](source:safe)
- compact diff scan에서는 후보 전체의 처분을 한 번의 호출로 제출하고, 하나라도 빠지면 도구가 거부한다.[](source:wb)[](source:ledger-miss)

@answer scope="로컬 원본 분석 · 스킬·도구 실행 없음 · 커밋 cd5035b 기준"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source fm title="codex-security/plugins/codex-security/skills/validation/SKILL.md · 4619B · frontmatter" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=1:4
@source purpose title="codex-security/plugins/codex-security/skills/validation/SKILL.md · 4619B · 목적과 읽을 reference" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=8:8
@source assess title="codex-security/plugins/codex-security/skills/validation/SKILL.md · 4619B · 후보 평가 4단계" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=10:15
@source safe title="codex-security/plugins/codex-security/skills/validation/SKILL.md · 4619B · 승인과 실행 제한" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=17:17
@source integ title="codex-security/plugins/codex-security/skills/validation/SKILL.md · 4619B · scan 통합" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=19:21
@source wb title="codex-security/plugins/codex-security/skills/validation/SKILL.md · 4619B · Compact Workbench Diff" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=23:30
@source phase title="codex-security/plugins/codex-security/skills/validation/SKILL.md · 4619B · 다른 phase-based scan" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=32:36
@source out title="codex-security/plugins/codex-security/skills/validation/SKILL.md · 4619B · 출력" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=38:49
@source yaml title="codex-security/plugins/codex-security/skills/validation/agents/openai.yaml · 183B · 표시 이름과 기본 prompt" path=codex-security/plugins/codex-security/skills/validation/agents/openai.yaml
@source g-scope title="codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md · 4408B · 근거와 범위" path=codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md lines=3:7
@source g-method title="codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md · 4408B · 방법 선택과 setup 실패" path=codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md lines=9:11
@source g-disp title="codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md · 4408B · 처분과 인스턴스" path=codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md lines=13:21
@source g-rt title="codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md · 4408B · runtime 증거" path=codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md lines=23:27
@source g-conf title="codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md · 4408B · 확신도" path=codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md lines=29:37
@source sfa title="codex-security/plugins/codex-security/references/static-finding-assessment.md · 3949B · 정적 근거 평가 전체" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=3:21
@source sfa-order title="codex-security/plugins/codex-security/references/static-finding-assessment.md · 3949B · 증거 탐색 순서" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=23:37
@source sfa-surface title="codex-security/plugins/codex-security/references/static-finding-assessment.md · 3949B · 경계와 표면 점검" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=39:50
@source sfa-conf title="codex-security/plugins/codex-security/references/static-finding-assessment.md · 3949B · 정적 확신도" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=52:75
@source store-kind title="codex-security/plugins/codex-security/references/artifact-storage.md · 7947B · storage 종류" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=20:23
@source store-gen title="codex-security/plugins/codex-security/references/artifact-storage.md · 7947B · 생성 증거와 임시 작업 공간" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=41:45
@source store9 title="codex-security/plugins/codex-security/references/artifact-storage.md · 7947B · 구조화 결과는 기존 도구" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=9:9
@source sa-compact title="codex-security/plugins/codex-security/references/scan-artifacts.md · 11701B · compact validation 객체" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=41:49
@source sa-phase title="codex-security/plugins/codex-security/references/scan-artifacts.md · 11701B · Validation 단계 경로" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=77:83
@source schema title="codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json · 4519B · 입력과 필수 필드" path=codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json lines=7:135
@source schema-req title="codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json · 4519B · 필수 필드 8개" path=codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json lines=124:133
@source zod title="codex-security/plugins/codex-security/mcp-app/src/artifact-contracts.ts · 15569B · 488줄 중 20~172줄만 읽음, validation record" path=codex-security/plugins/codex-security/mcp-app/src/artifact-contracts.ts lines=135:164
@source ledger title="codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts · 6121B · validation 기록 함수" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=23:77
@source ledger-miss title="codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts · 6121B · 빠진 후보는 거부" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=45:66
@source ledger-store title="codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts · 6121B · ledger 위치와 교체" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=161:199
@source tool title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 15421B · validation·후보 목록 도구" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=123:150
@source tool-ctx title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 15421B · scan 문맥 요구" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=353:384
@source disc-list title="codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts · 6305B · 후보 읽기" path=codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts lines=180:193
@source final title="codex-security/plugins/codex-security/references/final-report.md · 12135B · compact diff 결과 매핑" path=codex-security/plugins/codex-security/references/final-report.md lines=42:49
@source core9 title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · 피드백 파일 읽기" path=codex-security/plugins/codex-security/references/core-scan.md lines=9:9
@source core15 title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · Standard의 validation 7단계" path=codex-security/plugins/codex-security/references/core-scan.md lines=15:18
@source vsf title="codex-security/plugins/codex-security/references/validate-scan-findings.md · 1131B · Standard scan의 validation 지침" path=codex-security/plugins/codex-security/references/validate-scan-findings.md lines=3:3
@source standalone title="codex-security/plugins/codex-security/references/standalone-validation.md · 2134B · 이 스킬이 지목하지 않는 정적 validation 절차" path=codex-security/plugins/codex-security/references/standalone-validation.md lines=3:11
@source dscan title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 위임하는 쪽" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=30:31
@source disc title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · 후보를 넘기는 쪽" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=31:31
@source disc-out title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · 후보 필드" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=35:43
@source atk title="codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md · 5355B · 처분을 받는 쪽" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=31:36
@source tri3 title="codex-security/plugins/codex-security/skills/triage-finding/SKILL.md · 8394B · 3줄과 10줄만 읽음, description" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=3:3
@source tri10 title="codex-security/plugins/codex-security/skills/triage-finding/SKILL.md · 8394B · 정적 근거 제한" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=10:10
@source scan10 title="codex-security/plugins/codex-security/skills/security-scan/SKILL.md · 2972B · 1~21줄만 읽음, core audit 사용" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=10:10
@source readme title="codex-security/plugins/codex-security/skills/README.md · 3752B · validation 안내 줄" path=codex-security/plugins/codex-security/skills/README.md lines=27:27
@source readme-scan title="codex-security/plugins/codex-security/skills/README.md · 3752B · scan 선택 안내" path=codex-security/plugins/codex-security/skills/README.md lines=5:9
@source mcpjson title="codex-security/plugins/codex-security/.mcp.json · 2078B · MCP 서버 codex-security" path=codex-security/plugins/codex-security/.mcp.json lines=1:6
@source pluginjson title="codex-security/plugins/codex-security/.codex-plugin/plugin.json · 1682B · skills 폴더 선언" path=codex-security/plugins/codex-security/.codex-plugin/plugin.json lines=18:20

## 언제 켜지고 언제 쓰면 안 되나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 문구와 정확히 일치해야 켜진다는 뜻은 아니다.

`disable-model-invocation` 같은 호출 제한 필드는 원문에 명시 없음이다. `agents/openai.yaml`에도 `policy`가 없고 표시 이름과 기본 prompt만 있다.[](source:fm)[](source:yaml)

@code source=fm language=yaml

| 상황 | 에이전트의 행동 |
|---|---|
| scan이 이미 validation 단계에 있다 | 이 스킬을 쓴다.[](source:fm) |
| 사용자가 후보 보안 finding 하나 이상의 유효성을 판단해 달라고 직접 요청한다 | 이 스킬을 쓴다. 요청한 finding 하나는 저장소 전체 검색을 승인하지 않는다. 벤더 안내문은 "코드를 추적하거나 재현을 시도해 진짜 버그인지 확인한다"고 설명한다.[](source:fm)[](source:g-scope)[](source:readme) |
| 저장소 전체 scan의 phase | discovery의 coverage ledger와 advisory seed 행은 아직 다듬은 finding이 아니어도 범위에 든다.[](source:g-scope) |
| 전체 PR, commit, branch, patch, 저장소 scan을 시작하라는 요청 | 이 스킬을 1차 트리거로 쓰지 않는다. 벤더 안내문은 scan 선택을 `security-scan`, `security-diff-scan`, `deep-security-scan`에 둔다.[](source:fm)[](source:readme-scan) |
| Standard scan이나 Deep Scan worker 안 | 자기 Standard workflow 안에서 validation하고 이 스킬을 호출하지 않는다. `core-scan.md` 7단계는 각 후보를 `validate-scan-findings.md`로 검증하라고 한다.[](source:integ)[](source:core15)[](source:vsf) |
| 외부에서 가져온 scanner 보고서, advisory, ticket을 분류한다 | `triage-finding`이 맡는 입력이다. 그쪽은 정적 근거만 쓰고 runtime validation에는 쓰지 말라고 한다. 이 스킬의 원문은 이 구분을 말하지 않으므로 판정이다.[](source:tri3)[](source:tri10) |

각 후보에서 확립할 것은 공격자가 조작하는 source, 가장 가까운 control, 민감한 sink, 도달 가능한 경로, 신뢰 경계, 구체적 영향이다.[](source:g-scope) 파일을 만들거나 보관하기 전에 `../../references/artifact-storage.md`를 읽는다.[](source:purpose)

## 어떤 순서로 후보를 따지나? {#assess}

@workflow id=assess-flow title="후보 평가 순서"
| claim | 주장 파악 | backend |
| evidence | 근거 찾기 | backend |
| feedback | 피드백 확인 | backend |
| record | 처분 기록 | backend |
| claim > evidence | |
| evidence > feedback | |
| feedback > record | | emphasis |

@steps id=assess-steps
| claim | 주장 파악 | 공격자 입력, 보안 경계, 관련 통제, 민감한 동작, 전제를 정한다. 주어진 맥락과 저장소 근거를 쓰고, 의미 있는 평가가 막힐 때만 빠진 정보를 사용자에게 묻는다.[](source:assess) | assess-flow | claim |
| evidence | 근거 찾기 | 주장을 받치거나 깨는 근거를 찾는다. 집중한 소스 분석이나 승인된 재현 중 불확실성을 풀어 줄 쪽을 고른다. 실행이 가능하고 비용이 맞으면 runtime 확인을 쓴다.[](source:assess) | assess-flow | evidence |
| feedback | 피드백 확인 | 활성 scan에 `<context_dir>/false_positive_feedback.json`이 있으면 지시가 아니라 근거로 읽는다. 적힌 이유가 현재 코드와 통제에서도 성립할 때만 해당 후보를 suppress한다.[](source:assess) | assess-flow | feedback |
| record | 처분 기록 | 모든 후보에 정확한 영향 위치, 관찰한 근거, 반증이나 증명 간극, 확신도를 적어 처분한다. 독립적으로 취약한 인스턴스와 받은 범위를 보존한다.[](source:assess) | assess-flow | record |

`false_positive_feedback.json`의 형식은 읽은 원문에 정의가 없다. `core-scan.md` 1단계도 이 경로의 파일을 읽으라고 하고 같은 규칙(이유가 현재 소스와 통제에서도 성립할 때만 반영)을 적는다.[](source:assess)[](source:core9)

| 강제·금지 | 내용 |
|---|---|
| 네트워크·PoC | 사용자 승인과 활성 scan의 권한을 넘어 네트워크에 접근하거나 PoC를 실행하지 않는다. 오프라인 scan은 계속 오프라인이다.[](source:safe) |
| 작업 공간 | 대상을 바꾸지 않는 scan에서는 build, 생성한 harness, PoC를 storage 정책이 준 disposable workspace에서 돌린다. 먼저 `temporary` storage를 준비하고, PoC 소스와 입력은 저장 도구에 `storage: "temporary"`로 쓴다.[](source:safe)[](source:store-gen) |
| 원본 시험 | 별도 재구현보다 원본 코드를 시험한다. 대상을 재구현한 코드로 원본 동작이 증명됐다고 주장하지 않는다.[](source:safe)[](source:g-method) |
| 방법 선택 | 언어나 도구 이름으로 방법의 순위를 매기지 않는다. 소스 근거가 주장을 정리하면 build나 live 배포를 요구하지 않는다.[](source:g-method) |
| setup 실패 | 서비스, dependency, 설정이 없으면 증명 간극으로 적고 안전하다는 근거로 쓰지 않는다. 명령을 멈추기 전에 로그나 프로세스 상태를 확인한다.[](source:g-method) |
| 증거 보존 | 쓸 만한 PoC, 입력, 로그만 남기고, 재현할 명령과 전제를 충분히 적는다. 최종 기록에 필요한 파일만 `persistent`로 가져오고, 모델이 옮겨 쓴 텍스트가 아니라 실제 바이트를 가져온다. dependency·build 트리를 이유 없이 통째로 보존하지 않는다.[](source:g-rt)[](source:store-gen) |
| 정적 결론 | 정적 결론과 실제로 실행한 시험을 구분한다. 실행하지 않은 일을 실행했다고, 실패한 validation을 성공했다고 쓰지 않는다.[](source:out)[](source:g-rt) |

runtime 증거에는 짧고 비대화형인 명령을 쓴다. 필요하면 `gdb -q -batch -ex run -ex bt -ex quit`나 `lldb -b -o run -o bt -o quit`를 쓰고, 정상 입력을 대조군으로 둘 수 있다.[](source:g-rt) 이 명령들은 원문에 적힌 지시상 동작이며 실행하지 않았다.

## 처분과 확신도는 어떻게 정하나? {#disposition}

모든 후보는 `reportable`, `suppressed`, `not_applicable`, `deferred` 중 하나를 받는다.[](source:g-disp) 이 스킬과 지침에는 네 값의 정의 문장이 없다. 원문이 설명하는 것은 처분하는 방식이다.[](source:g-disp)

| 판단 상황 | 에이전트의 행동 |
|---|---|
| 인스턴스가 여러 개 | 대표 재현 하나가 관련 인스턴스를 뒷받침할 수는 있지만 인스턴스마다 source, control, sink, impact를 확인한다. 안전한 형제나 더 강한 이웃 finding이 다른 행을 결정하지 않는다.[](source:g-disp) |
| 래퍼와 구현 | 래퍼는 도달 가능성을 증명한다. 취약점을 일으키는 concrete implementation이나 공유 통제를 보존한다. 독립적으로 발동하는 동작과 깨진 통제는 따로 지정할 수 있게 두고 각각 처분한다.[](source:g-disp) |
| suppress | 정확히 그 주장을 깨는 근거가 있어야 한다. 호출자, 배포, 출처 근거가 없으면 추가 조사나 `deferred`가 맞을 수 있고, 근거 부재만으로 안전하다고 하지 않는다.[](source:g-disp) |
| 우선순위 | 뒷받침된 영향, 도달 가능성, 미해결 불확실성 순으로 본다. 한 인스턴스의 추가 작업이 처분이나 심각도를 바꾸지 못하면 나머지 후보로 넘어간다.[](source:g-disp) |
| 통제 확인 | 통제는 사용 지점에서 확인한다. 대체 표현, 분기별 변환, redirect, 상태 변화, 객체 선택이 검증 대상을 바꿀 수 있으면 따라간다. 통제는 민감한 동작이 실제로 쓰는 값에 걸려야 한다.[](source:g-disp) |
| 문서화된 위험 동작 | 문서화된 위험 동작, 선택적 제한, deprecation은 맥락일 뿐이다. 주장한 공격자가 의도된 경계를 넘는지를 평가한다.[](source:g-disp) |

확신도는 도달 가능성, 위반한 경계, 영향, 반증을 포함한 finding 전체에 대해 정한다.[](source:g-conf)

@facts
| `high` | 관련 경로와 보안 영향이 확립됐고 해소되지 않은 중대한 반증이 없다.[](source:g-conf) |
| `medium` | 직접 근거가 주장을 받치지만 중대한 전제나 경로 일부가 불확실하다.[](source:g-conf) |
| `low` | 근거가 간접적이거나 중요한 맥락이 빠졌다.[](source:g-conf) |

crash를 재현한 PoC는 관찰된 crash만 증명하고 주장한 모든 결과를 증명하지 않는다. 정적 근거도 전체 주장을 확립하면 `high`를 받칠 수 있다.[](source:g-conf)

`static-finding-assessment.md`는 정적 근거 평가에 쓰는 별도 틀이다. 최상위 workflow가 아니고, 입력 정규화·사용자용 verdict·scan ledger·동적 validation·fix는 호출한 스킬이 정한다.[](source:sfa)

- 후보마다 source, control, sink, reachable path, boundary, counterevidence, proof gaps의 일곱 항목 tuple을 만든다.[](source:sfa)
- 증거는 사용자·scanner 위치, 의존성 manifest와 lockfile, 영향받는 함수와 호출처, 근처 guard, 제품 표면 근거(`SECURITY.md`, 위협 모델 등) 순으로 좁은 범위부터 본다.[](source:sfa-order)
- 먼저 제품 표면, source 신뢰, 정책 근거를 분류하고 신뢰할 수 없는 입력이 버그에 닿는지 본다.[](source:sfa-surface)
- 의존성이 있다는 사실, 문자열 일치, 호출 사슬 일부만으로는 평가가 끝나지 않는다.[](source:sfa)
- 정적 확신도 `high`는 정확한 source·control·sink 경로, 전제, 경계 근거가 있고 중대한 반증이 없는 경우다. `medium`은 직접 근거가 있으나 호출 사슬이나 설정·배포 근거가 불완전한 경우, `low`는 간접적이거나 맥락이 부족한 경우다.[](source:sfa-conf)

판정: 두 문서가 같은 세 등급을 다른 단위로 정의한다. `validation-guidance.md`는 finding 전체를, `static-finding-assessment.md`는 정적 근거의 질을 기준으로 한다. 이 스킬의 처분 기록에는 앞 문서의 정의가 우선하는 것으로 읽히지만, 우선순위를 밝힌 문장은 원문에 명시 없음이다.[](source:g-conf)[](source:sfa-conf)

## scan에서는 무엇을 제출하고 어디에 놓이나? {#position}

| 모드 | 입력과 제출 |
|---|---|
| Compact Workbench Diff(`scanId` 있음) | `list_codex_security_candidates({ scanId, cursor?, limit? })`로 후보 전체를 읽고, `record_codex_security_candidate_validations({ scanId, validations: [{ candidateId, validation }] })`를 한 번 부른다. 빈 집합에도 `validations: []`를 제출한다. 도구가 discovery 필드와 후보 순서를 보존한다. 필수 `rubric`에 평가한 보안 속성을 적는다. 중복 보고서, receipt, closure table, 수동 ledger는 만들지 않는다. 실제 증거가 있을 때만 `<discovery_dir>/validation_artifacts/<candidate_id>/`를 만들고 그 경로를 기록에서 참조한다.[](source:wb)[](source:sa-compact) |
| 다른 phase-based scan | 활성 workflow가 정한 경로에 후보별 validation 보고서를 저장하고 receipt를 기록한다. 방법, 근거나 정확한 증명 간극, 처분, 보고서 참조를 적는다. 경로는 `<findings_dir>/<candidate_id>/validation_report.md`, `validation_artifacts/`, scan 수준 `validation_summary.md`다. standalone·legacy diff에서 쓴다.[](source:phase)[](source:sa-phase) |
| 저장소 전체 또는 범위 지정 phase scan | closure table을 보존한다. 열은 후보 또는 ledger 행 ID, instance key, source 참조와 seed anchor, root-control 위치, entrypoint와 source, sink와 control, 처분, 반증이나 증명 간극, `survives: yes\|no\|uncertain`이다. 결정을 터미널 로그에만 남기지 않는다.[](source:phase) |
| 단독 요청 | 호출자의 결과 schema가 있으면 따르고, 없으면 후보별 간결한 평가를 돌려준다.[](source:out) |

도구는 후보 전체를 한 번에 받아 아래 규칙으로 처리한다.

@facts
| 거부 조건 | 모르는 후보, 같은 후보를 두 번 넣은 경우, 기존 후보가 하나라도 빠진 경우를 거부한다. 메시지는 "Validation must include every existing candidate"로 시작한다.[](source:ledger-miss) |
| 보존 | 후보 행은 그대로 두고 `validation` 객체만 더한다. 순서도 바꾸지 않는다. 후보 목록 파일 전체를 교체한다.[](source:ledger)[](source:ledger-store) |
| 사용 조건 | 실행 중이고 소유권이 확인된 scan이어야 하며 scan 모드가 diff나 Deep이어야 한다. 다른 모드는 거부된다.[](source:tool-ctx) |
| 필수 필드 8개 | `disposition`, `method`, `confidence`, `confidence_rationale`, `rubric`, `evidence`, `counterevidence_or_proof_gap`, `remaining_uncertainty`다.[](source:schema-req) |
| 선택 필드 | `artifact_paths`, `source`, `control`, `sink`, `preconditions`. discovery 필드와 다르거나 이해에 도움이 될 때만 `source`, `control`, `sink`, `preconditions`를 더한다.[](source:sa-compact)[](source:zod) |

필드 형식은 schema가 정한다.

- `rubric`은 텍스트, 객체, 비어 있지 않은 배열 중 하나다. `evidence`는 텍스트나 비어 있지 않은 문자열 배열이다.[](source:schema)[](source:zod)
- `counterevidence_or_proof_gap`과 `remaining_uncertainty`는 문자열이면 되고 빈 문자열도 통과한다. 객체는 정해진 키 밖의 키도 허용한다.[](source:schema)[](source:zod)
- 판정: 스킬은 반증이나 증명 간극을 적으라고 하지만 schema는 이를 비워 두는 것을 막지 않는다. 막는 것은 스킬의 지시뿐이다.

@callout level=warning title="빈 후보에도 호출할지는 원문끼리 어긋난다"
| 이 스킬은 빈 집합에도 `validations: []`를 제출하라고 한다. 그러나 `security-diff-scan`은 "후보가 있을 때" `$validation`을 한 번 실행하라고 한다. 우선순위는 명시돼 있지 않다. 도구의 검증 함수에는 빈 입력을 거부하는 검사가 없다.[](source:wb)[](source:dscan)[](source:ledger-miss) |

compact diff 결과는 validation과 attack-path 두 처분을 합쳐 최종 보고에 놓인다. 순서는 아래와 같다.[](source:final)

| 순서와 조건 | 최종 보고에서 |
|---|---|
| 1. validation `reportable`이고 attack-path도 `reportable` | finding이 된다. 인스턴스와 모든 관련 위치를 남긴다.[](source:final) |
| 2. 두 단계 중 어느 한쪽이 `deferred` | `needs_follow_up` surface와 증명 간극이 있는 deferred 작업이 된다.[](source:final) |
| 3. validation `not_applicable` | `not_applicable` coverage가 된다.[](source:final) |
| 4. validation `suppressed` 또는 attack-path `ignore` | `rejected` coverage가 된다.[](source:final) |

원문은 위 순서로 나열한다. 판정: validation이 `deferred`이면 attack-path가 `reportable`로 정해도 2번에 걸려 finding이 아니라 follow-up으로 남는 것으로 읽힌다. 2번과 4번이 겹치는 조합(validation `deferred`와 attack-path `ignore`)은 원문에 명시 없음이다. 단계 기록이 빠진 후보는 가진 근거와 함께 미해결로 남고, 별도 정리 단계를 더하지 않는다.[](source:final)

## 흐름 속 위치는 어디인가? {#flow}

@workflow id=position-flow title="발견에서 공격 경로 분석으로"
| scan | security-diff-scan | backend | source:dscan |
| before | finding-discovery | backend | source:disc |
| current | validation | backend | source:wb |
| after | attack-path-analysis | backend | source:atk |
| scan > current | 내부 위임 R08 | emphasis |
| before > current | 산출물 호환 R11 | dashed |
| current > after | 산출물 호환 R12 | dashed |

@steps id=position-steps
| highlight | validation | diff scan이 후보가 있을 때 한 번 실행한다. 후보 전체를 한 번에 제출한다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R08 · 내부 위임 | `security-diff-scan`이 후보가 있을 때만 `$validation`을 한 번 실행한다. 후보가 없으면 실행하지 않는다고 하면서 이 스킬 본문은 빈 집합이면 `validations: []`를 제출하라고 한다. 호스트 workbench의 `record_codex_security_candidate_validations`가 상태를 관리한다.[](source:dscan)[](source:wb) |
| R11 · 산출물 호환 | discovery의 candidate ID와 필드를 보존해 이어받는다. discovery가 이 단계를 되풀이하지 않는다.[](source:disc)[](source:disc-out)[](source:integ) |
| R12 · 산출물 호환 | attack-path는 검증된 후보 중 `reportable` 또는 `deferred`만 분석한다.[](source:atk) |
| R16 · 참고 | Standard scan과 Deep Scan worker는 이 단계 스킬을 호출하지 않는다. `validate-scan-findings.md`는 "소스 근거 있는 반증으로만 기각한다"고 하고 runtime 재현을 요구하지 않는다.[](source:integ)[](source:core15)[](source:vsf) |
| R32 · 같은 계열 | `triage-finding`도 근거 기반 판정을 내리지만 입력은 외부 항목이고 정적 근거만 쓴다. 이 스킬은 필요하면 재현한다. 직접 연결은 없다.[](source:tri3)[](source:tri10)[](source:assess) |
| R74 · 공유 상태 | compact diff 후보 ledger 하나를 discovery가 쓰고, 이 스킬이 `validation`을, attack-path가 `attack_path`를 더한다.[](source:sa-compact)[](source:wb) |

이 스킬이 읽는 공통 문서와 도구 계약은 아래와 같다.

| 관계 | 이 스킬이 가져가는 것 |
|---|---|
| R60 · 참고(`artifact-storage.md`) | 파일을 만들거나 보관하기 전에 읽는다. 후보 처분은 기존 도구에 두고, PoC와 build는 `temporary` 작업 공간에서 돌린다.[](source:purpose)[](source:store9)[](source:store-gen) |
| R63 · 참고(`static-finding-assessment.md`) | 위의 일곱 항목 tuple, 증거 탐색 순서, 정적 확신도.[](source:g-scope)[](source:sfa) |
| R64 · 참고(`candidate-validations.schema.json`) | 제출 JSON 계약. 필수 필드 8개와 처분 4종.[](source:wb)[](source:schema-req) |
| R85 · 참고(`scan-artifacts.md`) | compact diff는 `validation` 객체 하나가 결과이고, 단계별 보고서 경로는 standalone·legacy diff에만 쓴다.[](source:sa-compact)[](source:sa-phase) |

전체 흐름은 색인 기준 `codex-security/_group-scan-vulnerabilities`(`scan-vulnerabilities.html`)를 가리킨다. 묶음 페이지는 별도 단계에서 만든다.

- [ ] 후보마다 source, control, sink, 도달 경로, 신뢰 경계, 영향을 적었는지 본다.
- [ ] 정적 결론과 실제 실행한 시험을 구분해 적었는지 본다.
- [ ] 후보를 모두 처분했고, 독립적으로 취약한 인스턴스를 따로 처분했는지 본다.
- [ ] 환경이 없어 못 한 일은 증명 간극으로 적었고 안전하다고 쓰지 않았는지 본다.
- [ ] 후보 전체를 한 번의 `record_codex_security_candidate_validations` 호출로 제출했는지 본다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `validation/SKILL.md` 4,619B, `references/validation-guidance.md` 4,408B, `agents/openai.yaml` 183B를 끝까지 읽었다.[](source:fm)[](source:g-conf)[](source:yaml) |
| 필수 참조 | `static-finding-assessment.md` 3,949B, `artifact-storage.md` 7,947B, `scan-artifacts.md` 11,701B, `candidate-validations.schema.json` 4,519B를 끝까지 읽었다.[](source:sfa-conf)[](source:store-gen)[](source:sa-phase)[](source:schema)[](source:final) |
| 도구 구현 | `artifact-candidate-ledger.ts` 6,121B, `compact-artifact-tools.ts` 15,421B, `artifact-discovery.ts` 6,305B를 끝까지 읽었다.[](source:ledger)[](source:tool)[](source:disc-list) |
| 구조·표본만 확인(전부 읽지 않음) | `artifact-contracts.ts`(15,569B)는 20~172줄만, `triage-finding/SKILL.md`(8,394B)는 3줄과 10줄만, `security-scan/SKILL.md`는 1~21줄만 읽었다.[](source:zod)[](source:tri3)[](source:scan10) |
| 관계 근거 | `security-diff-scan/SKILL.md` 5,405B, `finding-discovery/SKILL.md` 5,076B, `attack-path-analysis/SKILL.md` 5,355B, `final-report.md` 12,135B, `core-scan.md` 7,479B, `validate-scan-findings.md` 1,131B를 읽었다. `skills/README.md`, `.mcp.json`, `plugin.json`은 공통 확인용이다.[](source:dscan)[](source:disc)[](source:atk)[](source:core15)[](source:vsf)[](source:readme)[](source:mcpjson)[](source:pluginjson) |
| 제외 | 번역본 없음. 바이너리 없음. 외부 URL과 `scripts/`의 코드는 열거나 실행하지 않았다. |

읽은 텍스트 파일은 23개이고 이 중 부분 읽음은 3개다. 원문의 활성화 조건, 처분 4개, 확신도 3단계, 평가 단계 4개, 실행 제한, 호출 제한 필드 유무, 제출 방식 3가지, gdb·lldb 명령, 필수 필드 8개를 모두 대조했다.

@callout level=open-question title="이 스킬이 지목하지 않는 문서"
| `standalone-validation.md`는 어느 스킬이나 참조도 이름으로 지목하지 않는 정적 validation 절차다. 네 처분의 뜻을 적고(`reportable`은 소스가 받치는 취약점, `suppressed`는 구체적 반증이 주장을 깸, `not_applicable`은 대상에 해당하지 않음, `deferred`는 중대한 증명 간극) 코드 실행, build, PoC, 디버거를 모두 금지한다. 이 스킬은 필요할 때 재현을 허용하므로 두 문서는 다른 절차다. 어느 호스트 prompt가 이 문서를 쓰는지는 확인하지 못해서 이 스킬의 근거로는 쓰지 않았다.[](source:standalone) |

@callout level=open-question title="확인하지 못한 것"
| `false_positive_feedback.json`의 형식과 이를 만드는 쪽은 읽은 범위에 없다. 호스트 도구를 호출하지 않았고, 처분이 ledger에 쓰이는 모습은 코드를 읽어서만 확인했다. `record_codex_security_candidate_validations`가 실제로 실패했을 때의 응답 형태와, 후보 파일이 아직 없을 때 읽기가 실패하는지(`artifact-io.ts`를 읽지 않았다)는 확인하지 못했다.[](source:ledger)[](source:assess) |

분석 중 원본은 수정하지 않았고, 스킬의 어떤 명령도 실행하지 않았다.
