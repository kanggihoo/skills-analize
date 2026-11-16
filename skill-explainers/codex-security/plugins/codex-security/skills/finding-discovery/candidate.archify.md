# finding-discovery는 취약점 후보를 어떤 근거로 찾고 어떻게 남기나? {#finding-discovery-page}

`finding-discovery`는 위협 모델과 보안 정책을 근거로 기술적으로 악용 가능해 보이는 취약점 후보를 찾아, 다음 단계가 이어받을 근거와 함께 남기는 단계 스킬이다. 최종 심각도는 정하지 않는다.[](source:purpose) scan이 이미 discovery 단계에 있거나 사용자가 저장소나 코드 변경에서 후보를 찾아 달라고 명시적으로 요청할 때 쓴다. 전체 PR, commit, branch, patch, 저장소 scan을 시작하는 1차 트리거로는 쓰지 않는다.[](source:fm)

- 후보로 남기려면 공격자가 조종하는 입력이나 권한 있는 동작이 가장 가까운 통제를 거쳐 sink와 보안 영향에 닿는 경로를 추적하고, 통제가 없거나 우회되거나 엉뚱한 값에 걸린 이유를 설명해야 한다.[](source:e1)
- 충돌, 위험한 API, 빠진 검사만으로는 finding이 아니고 단서다. 그럴듯한 후보는 재현이 없다는 이유로 버리지 않고 증명 간극과 함께 validation으로 넘긴다.[](source:e6)
- diff scan에서는 host가 만든 변경 파일 목록을 빠짐없이 검토하고, 모든 후보를 `record_codex_security_discovery_candidates` 한 번으로 기록한다. 다시 부르면 이전 후보가 통째로 바뀐다.[](source:dscan30)[](source:tool-rec)[](source:disc-rec)
- 이 단계 안에서 validation이나 attack-path 단계를 되풀이하지 않는다.[](source:delegate)

@answer scope="로컬 원본 분석 · 스킬·도구 실행 없음 · 커밋 cd5035b 기준"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source fm title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · frontmatter" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=1:4
@source purpose title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · 목적" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=8:8
@source reads title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · 읽을 문서와 필수 입력" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=10:10
@source select title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · 작업 방식 선택" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=12:18
@source sel-wd title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · Standard·Deep은 이 스킬을 쓰지 않음" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=14:14
@source sel-a title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · Running compact diff" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=16:16
@source sel-b title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · Standalone diff" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=17:17
@source sel-c title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · Standalone repository" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=18:18
@source diffscope title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · diff 검토 범위" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=20:20
@source e1 title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · 근거 기준 1" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=24:24
@source e2 title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · 근거 기준 2" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=25:25
@source e3 title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · 근거 기준 3" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=26:26
@source e4 title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · 근거 기준 4" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=27:27
@source e5 title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · 근거 기준 5" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=28:28
@source e6 title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · 근거 기준 6" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=29:29
@source delegate title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · worker 분담과 단계 반복 금지" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=31:31
@source out-id title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · ID와 위치 라벨" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=37:38
@source out-ev title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · source·control·sink·반증" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=39:40
@source out-cwe title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · CWE·instance·relevant_lines" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=41:43
@source finish title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · 계약과 종료 조건" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=45:45
@source yaml title="codex-security/plugins/codex-security/skills/finding-discovery/agents/openai.yaml · 220B · 표시 이름과 기본 prompt" path=codex-security/plugins/codex-security/skills/finding-discovery/agents/openai.yaml
@source store9 title="codex-security/plugins/codex-security/references/artifact-storage.md · 7947B · 구조화 결과는 기존 도구" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=9:9
@source store-supp title="codex-security/plugins/codex-security/references/artifact-storage.md · 7947B · 보조 파일과 소유자" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=13:18
@source store-legacy title="codex-security/plugins/codex-security/references/artifact-storage.md · 7947B · legacy ledger" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=43:45
@source guide title="codex-security/plugins/codex-security/references/security-guidance.md · 2830B · 정책 해석" path=codex-security/plugins/codex-security/references/security-guidance.md lines=5:12
@source guide-rule title="codex-security/plugins/codex-security/references/security-guidance.md · 2830B · chain 순서와 untrusted" path=codex-security/plugins/codex-security/references/security-guidance.md lines=34:36
@source sa-compact title="codex-security/plugins/codex-security/references/scan-artifacts.md · 11701B · Compact Workbench Diff 경로" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=33:49
@source sa-legacy title="codex-security/plugins/codex-security/references/scan-artifacts.md · 11701B · standalone·legacy diff 경로" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=49:70
@source led-use title="codex-security/plugins/codex-security/skills/security-scan/references/scan-artifacts-and-ledger.md · 7021B · 쓰는 경우 한정" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-artifacts-and-ledger.md lines=1:3
@source led-work title="codex-security/plugins/codex-security/skills/security-scan/references/scan-artifacts-and-ledger.md · 7021B · 변경 파일 worklist" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-artifacts-and-ledger.md lines=5:16
@source led-deep title="codex-security/plugins/codex-security/skills/security-scan/references/scan-artifacts-and-ledger.md · 7021B · 파일별 검토와 worker 배정" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-artifacts-and-ledger.md lines=24:32
@source led-cov title="codex-security/plugins/codex-security/skills/security-scan/references/scan-artifacts-and-ledger.md · 7021B · coverage와 단계 인계" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-artifacts-and-ledger.md lines=34:42
@source tool-prep title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 15421B · prepare·list 도구" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=80:106
@source tool-rec title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 15421B · record·list 후보 도구" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=108:135
@source tool-ctx title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 15421B · scan 문맥 요구" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=353:384
@source inv-prep title="codex-security/plugins/codex-security/mcp-app/src/artifact-inventory.ts · 5370B · 인벤토리 만들기" path=codex-security/plugins/codex-security/mcp-app/src/artifact-inventory.ts lines=28:119
@source inv-list title="codex-security/plugins/codex-security/mcp-app/src/artifact-inventory.ts · 5370B · 인벤토리 읽기" path=codex-security/plugins/codex-security/mcp-app/src/artifact-inventory.ts lines=121:135
@source disc-rec title="codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts · 6305B · 후보 기록은 replace" path=codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts lines=52:101
@source disc-diff title="codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts · 6305B · diff의 변경 근거" path=codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts lines=103:121
@source disc-list title="codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts · 6305B · 후보 읽기" path=codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts lines=180:193
@source norm-scope title="codex-security/plugins/codex-security/mcp-app/src/helpers/normalize-candidates.ts · 18523B · 위치 검증" path=codex-security/plugins/codex-security/mcp-app/src/helpers/normalize-candidates.ts lines=251:339
@source norm-merge title="codex-security/plugins/codex-security/mcp-app/src/helpers/normalize-candidates.ts · 18523B · 병합 키와 candidate_id" path=codex-security/plugins/codex-security/mcp-app/src/helpers/normalize-candidates.ts lines=341:400
@source contracts title="codex-security/plugins/codex-security/mcp-app/src/artifact-contracts.ts · 15569B · 488줄 중 20~172줄만 읽음, 입력 형식" path=codex-security/plugins/codex-security/mcp-app/src/artifact-contracts.ts lines=64:98
@source roles title="codex-security/plugins/codex-security/mcp-app/src/discovery-location-roles.ts · 175B · 위치 role 7개" path=codex-security/plugins/codex-security/mcp-app/src/discovery-location-roles.ts lines=1:9
@source sch-cand title="codex-security/plugins/codex-security/schemas/definitions/discovery-candidate.schema.json · 4203B · 입력 후보 schema" path=codex-security/plugins/codex-security/schemas/definitions/discovery-candidate.schema.json lines=51:82
@source sch-in title="codex-security/plugins/codex-security/schemas/tools/discovery-candidates.schema.json · 1152B · 기록·목록 입력" path=codex-security/plugins/codex-security/schemas/tools/discovery-candidates.schema.json lines=5:32
@source sch-rev title="codex-security/plugins/codex-security/schemas/tools/review-items.schema.json · 1431B · 인벤토리 입력" path=codex-security/plugins/codex-security/schemas/tools/review-items.schema.json lines=5:42
@source sch-common title="codex-security/plugins/codex-security/schemas/definitions/artifact-common.schema.json · 870B · 경로·ID 형식" path=codex-security/plugins/codex-security/schemas/definitions/artifact-common.schema.json
@source dscan30 title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 위임하는 쪽" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=28:35
@source dscan24 title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 변경 파일 범위" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=24:24
@source tm title="codex-security/plugins/codex-security/skills/threat-model/SKILL.md · 2986B · 앞 단계" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=25:27
@source val title="codex-security/plugins/codex-security/skills/validation/SKILL.md · 4619B · 후보를 이어받는 쪽" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=8:8
@source val21 title="codex-security/plugins/codex-security/skills/validation/SKILL.md · 4619B · 후보 ID 보존" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=21:21
@source val28 title="codex-security/plugins/codex-security/skills/validation/SKILL.md · 4619B · 후보 전체 읽기" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=27:28
@source pol8 title="codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md · 5982B · 93줄 중 1~40줄만 읽음, SECURITY.md는 정책 맥락" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=8:8
@source scan10 title="codex-security/plugins/codex-security/skills/security-scan/SKILL.md · 2972B · 1~21줄만 읽음, core audit 사용" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=10:10
@source core18 title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · 단계 스킬 호출 금지" path=codex-security/plugins/codex-security/references/core-scan.md lines=18:18
@source base16 title="codex-security/plugins/codex-security/references/baseline-auditor.md · 2839B · baseline auditor의 금지" path=codex-security/plugins/codex-security/references/baseline-auditor.md lines=16:16
@source focus11 title="codex-security/plugins/codex-security/references/focused-investigator.md · 2548B · focused investigator의 금지" path=codex-security/plugins/codex-security/references/focused-investigator.md lines=11:11
@source readme title="codex-security/plugins/codex-security/skills/README.md · 3752B · finding-discovery 안내 줄" path=codex-security/plugins/codex-security/skills/README.md lines=26:26
@source readme-scan title="codex-security/plugins/codex-security/skills/README.md · 3752B · scan 선택 안내" path=codex-security/plugins/codex-security/skills/README.md lines=5:9
@source mcpjson title="codex-security/plugins/codex-security/.mcp.json · 2078B · MCP 서버 codex-security" path=codex-security/plugins/codex-security/.mcp.json lines=1:6
@source pluginjson title="codex-security/plugins/codex-security/.codex-plugin/plugin.json · 1682B · skills 폴더 선언" path=codex-security/plugins/codex-security/.codex-plugin/plugin.json lines=18:20

## 언제 켜지고 언제 쓰면 안 되나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 문구와 정확히 일치해야 켜진다는 뜻은 아니다.

`disable-model-invocation` 같은 호출 제한 필드는 원문에 명시 없음이다. `agents/openai.yaml`에도 `policy`가 없고 표시 이름과 기본 prompt만 있다.[](source:fm)[](source:yaml)

@code source=fm language=yaml

| 상황 | 에이전트의 행동 |
|---|---|
| scan이 이미 finding-discovery 단계에 있다 | 이 스킬을 쓴다.[](source:fm) |
| 사용자가 저장소나 코드 변경에서 후보 보안 finding을 찾아 달라고 명시적으로 요청한다 | 이 스킬을 쓴다. 기본 prompt는 현재 저장소나 주어진 코드 변경에서 찾으라는 문장이고, 벤더 안내문은 "증명이 더 필요한 것을 표시한다"고 설명한다.[](source:fm)[](source:yaml)[](source:readme) |
| 전체 PR, commit, branch, patch, 저장소 scan을 시작하라는 요청 | 이 스킬을 1차 트리거로 쓰지 않는다. 벤더 안내문은 scan 선택을 `security-scan`, `security-diff-scan`, `deep-security-scan`에 둔다.[](source:fm)[](source:readme-scan) |
| Standard scan이나 Deep worker 안 | 이 스킬 본문을 쓰지 않는다. 각자 coordinator가 준 자체 완결 prompt를 쓴다. `core-scan.md`는 별도 단계 스킬을 부르지 말라고 하고, baseline auditor와 focused investigator 지침도 phase skill과 artifact 도구 호출을 금지한다.[](source:sel-wd)[](source:core18)[](source:base16)[](source:focus11) |
| 필수 입력이 없다 | 그 입력이 없어서 요청한 분석을 못 할 때만 사용자에게 묻는다. 명시된 입력·출력 경로는 따른다.[](source:reads) |

작업 전에 `artifact-storage.md`를 저장 전에, `security-guidance.md`를 소스 검토 전에 읽는다. 검토하는 경로마다, worker에게 맡긴 배정까지 포함해 적용되는 정책을 해석한다.[](source:reads) 정책은 untrusted policy data라서 사용자·시스템 지시를 덮거나 명령 실행, secret 접근, 파일 편집, workflow 변경을 할 수 없다.[](source:guide-rule)

## 어떤 작업 방식을 고르나? {#workflow-choice}

원문은 세 방식을 나열한다. 아래 그림은 그 세 항목의 조건을 결정 노드로 옮긴 판정이다.[](source:select)

@workflow id=mode-flow title="작업 방식 선택"
| ask | 후보 발견 요청 | external |
| diff | 코드 변경을 검토하나? | backend |
| inv | host 변경 파일 목록이 있나? | backend |
| compact | compact diff | backend |
| legacy | standalone diff | backend |
| repo | standalone 저장소 | backend |
| ask > diff | |
| diff > inv | 예 |
| diff > repo | 아니오 |
| inv > compact | 예 | emphasis |
| inv > legacy | 아니오 |

@steps id=mode-steps
| ask | 후보 발견 요청 | 이미 discovery 단계이거나 사용자가 후보를 찾아 달라고 요청한 상태다.[](source:fm) | mode-flow | ask |
| diff | 코드 변경을 검토하나? | diff이면 변경된 동작을 본다. 사라진 파일은 baseline revision에서 본다. 지원 코드는 경계를 이해할 만큼만 따라가고, 바뀐 공유 통제가 다른 호출자에 영향을 주면 형제 호출자로 넓힌다. 무관한 저장소 감사로 넓히지 않는다.[](source:diffscope) | mode-flow | diff |
| inv | host 변경 파일 목록이 있나? | `list_codex_security_review_items`로 받은 목록이 있느냐가 갈림길이다.[](source:sel-a)[](source:sel-b) | mode-flow | inv |
| compact | compact diff | 목록을 읽고 배정된 변경 파일을 모두 검토하고, 후보를 `record_codex_security_discovery_candidates`로 한 번에 기록한다. 순위 목록, finding별 장부, receipt, discovery 보고서는 만들지 않는다.[](source:sel-a) | mode-flow | compact |
| legacy | standalone diff | compact 목록이 없으면 `scan-artifacts-and-ledger.md`로 변경 파일 worklist와 단계별 산출물을 만든다.[](source:sel-b) | mode-flow | legacy |
| repo | standalone 저장소 | 아래 근거 기준을 승인된 소스에 적용해 후보와 coverage 한계를 돌려준다. scan을 시작하거나 diff worklist 흐름을 돌리지 않는다.[](source:sel-c) | mode-flow | repo |

| 방식 | 만드는 것 |
|---|---|
| Running compact diff | 호스트 도구가 쓰는 `candidate_ledger.jsonl` 하나. 별도 보고서·receipt는 없다.[](source:sel-a)[](source:sa-compact) |
| Standalone diff(compact 목록 없음) | `rank_input.jsonl`, `deep_review_input.jsonl`, `finding_discovery_report.md`, 후보별 `<findings_dir>/<candidate_id>/candidate_ledger.jsonl` 같은 단계별 산출물이다. standalone·legacy diff에서만 쓰는 경로다.[](source:sel-b)[](source:sa-legacy) |
| Standalone 저장소 발견 | 후보와 coverage 한계를 돌려준다. scan이나 diff worklist 흐름은 시작하지 않는다. 후보가 없으면 그 결과를 실제 검토 범위와 한계와 함께 돌려준다.[](source:sel-c)[](source:finish) |

## 후보로 인정하는 근거는 무엇인가? {#criteria}

| 기준 | 에이전트의 행동 |
|---|---|
| 경로 추적 | 공격자가 조종하는 입력이나 권한 있는 동작을 가장 가까운 통제를 거쳐 sink와 보안 영향까지 추적한다. 통제가 없거나, 우회되거나, 엉뚱한 값·경계에 적용된 이유를 설명한다.[](source:e1) |
| 도달 가능성 | runtime 도달 가능성과 배포 전제를 확인한다. 실제로 막는 가드와 격리는 반증으로 적는다. 안전한 형제 구현이 있어도 이 후보 경로가 안전하다는 근거가 되지 않는다.[](source:e2) |
| 위치 보존 | root-control 위치와 이해에 필요한 진입점, 래퍼, concrete implementation, sink를 보존한다. 여러 구현을 주장하면 구현을 직접 확인하고 모두 영향받는다고 단정하지 않는다.[](source:e3) |
| 인스턴스 | 독립적으로 도달 가능한 취약 인스턴스는 따로 지정할 수 있게 둔다. source, control, sink, 영향이 같은 중복 관찰은 겉모습만 다른 변형으로 쪼개지 않고 합치되, 영향받는 위치와 원래 후보 ID를 모두 남긴다.[](source:e4) |
| seed | 사용자나 advisory가 준 seed는 정확한 source와 control까지 따라간다. 이를 받치거나 반박하거나 풀지 못한 근거를 적는다. 같은 계열의 근처 문제는 seed를 닫지 못한다. 승인된 소스만 쓰고 advisory 링크는 허락 없이 열지 않는다.[](source:e5) |
| 보안 영향 | 구체적 보안 영향과 유지보수·견고성 문제를 가른다. crash, 위험한 API, 선택 기능, 빠진 검사는 그 자체로 finding이 아니라 단서다. 증명 간극이 있는 그럴듯한 후보는 근거를 지어내지 않고, 재현이 없다고 버리지도 않고 validation으로 넘긴다.[](source:e6) |

여러 worker가 있으면 독립 배정을 나눠 주고, 대상·범위·관련 정책과 모델·필요한 결과 필드를 함께 준다. 부모는 배정하지 않은 일을 직접 검토하고 중복을 조정한다.[](source:delegate)

## 후보를 어떤 모양으로 남기나? {#output}

원문은 후보마다 남길 항목을 적고, "호출자의 구조화된 후보 계약을 쓴다"고 덧붙인다.[](source:out-id)[](source:out-ev)[](source:out-cwe)[](source:finish) compact diff에서 호출자의 계약은 host 도구의 입력 형식이다. 코드를 읽어 두 목록을 맞춰 보면 다음과 같다.

| 스킬이 남기라는 항목 | compact 도구의 입력 | 판정 |
|---|---|---|
| 후보 ID와 제목 | 제목 칸은 없다. `summary`(필수 텍스트)가 가장 가깝다. `candidate_id`는 입력에 넣을 수 없고 host가 붙인다.[](source:out-id)[](source:sch-cand)[](source:contracts) | 스킬은 supplied seed·ledger ID를 보존하라고 하지만, 이 도구는 ID를 입력으로 받지 않는다. |
| 위치와 `entrypoint/wrapper`, `root_control`, `sink`, `concrete_implementation` 라벨 | `locations[]`에 `path`, `start_line`, `end_line`(선택), `role`을 둔다. role은 7개이고 위 네 개를 포함한다.[](source:out-id)[](source:roles)[](source:sch-cand) | 맞는다. 위치는 최소 한 개이고 모두 저장소 상대 경로여야 한다. |
| source, control, sink, 영향, 근거 | `evidence`(필수 텍스트)와 `summary`에 쓴다.[](source:out-ev)[](source:sch-cand) | 전용 칸이 나뉘어 있지 않다. |
| 반증, 배포 전제, 풀리지 않은 질문, validation이 확립할 것 | 전용 칸이 없다. 선택 `context`나 `evidence` 텍스트에 담는 수밖에 없다.[](source:out-ev)[](source:sch-cand) | 원문에 명시 없음. 판정: 텍스트에 넣는다. |
| CWE ID(모르면 빈 목록) | `cwe_ids` 배열이 필수다. 빈 배열도 schema가 허용한다.[](source:out-cwe)[](source:sch-cand) | 맞는다. |
| `<family>:<file>:<line>` instance key | 선택 `instance` 텍스트다.[](source:out-cwe)[](source:sch-cand) | 맞는다. 병합 키에 들어간다. |
| diff finding의 `relevant_lines` | 입력 칸이 없다. 입력 객체는 정해진 키만 받는다.[](source:out-cwe)[](source:contracts) | 원문에 명시 없음. |

입력 객체에 정해진 키 말고 다른 키를 넣으면 거부된다. 도구는 `cwe_ids`, `locations`, `summary`, `evidence`, `context`, `instance`만 받는다.[](source:contracts)[](source:sch-cand)

기록할 때 도구가 하는 검증과 병합은 다음과 같다.

@facts
| 인벤토리 | `prepare_codex_security_review_items`가 `artifacts/02_discovery/in_scope_files.txt`를 만든다. diff scan 전용이고 변경 근거(base, head, 종류)가 없으면 실패한다.[](source:inv-prep)[](source:tool-prep) |
| 목록 읽기 | `list_codex_security_review_items`와 `list_codex_security_candidates`는 `cursor`와 `limit`(1~1000)로 한 쪽씩 읽는다.[](source:sch-in)[](source:sch-rev)[](source:inv-list) |
| 위치 검증 | 위치마다 저장소 안 일반 파일이어야 하고, 줄 범위가 파일 줄 수를 넘으면 거부한다. 위치 중 최소 하나는 인벤토리 안 파일이어야 한다.[](source:norm-scope) |
| 병합 | `cwe_ids`, `locations`, `instance`가 모두 같은 후보만 한 행으로 합친다. `summary`, `evidence`, `context`는 중복을 없애 정렬한 뒤 줄바꿈으로 잇는다.[](source:norm-merge) |
| 후보 ID | 병합 키의 SHA-256 앞 16자로 `candidate-<16자>`를 만든다. 같은 입력은 같은 ID가 된다.[](source:norm-merge) |
| 기록 방식 | 기록은 후보 파일 전체 replace다. 새 행은 입력 후보만으로 쓰이므로, 다시 부르면 이전 후보가 바뀌고 그 위에 더했던 `validation`·`attack_path` 객체는 새 행에 들어가지 않는다. 마지막 부분은 판정이다.[](source:disc-rec)[](source:norm-merge)[](source:tool-rec) |

@callout level=warning title="후보 기록은 두 번 이상 부르지 않는다"
| 이 도구는 후보를 더하지 않고 파일을 통째로 바꾼다. 스킬도 "모든 후보를 한 번 기록"하라고 한다. 후보 목록을 끝까지 모은 뒤 한 번에 낸다. validation 뒤에 다시 부르면 후보 행이 새로 쓰이므로 이전 처분이 사라질 수 있다.[](source:sel-a)[](source:disc-rec) |

병합은 도구 쪽 기준이 스킬 문장보다 좁다. 스킬은 source, control, sink, 영향이 같은 중복 관찰을 합치라고 하지만, 도구는 위치와 CWE와 instance가 모두 같은 행만 합친다. 판정: 같은 문제를 다른 위치로 두 번 적으면 도구는 합치지 않으므로 부모가 기록 전에 조정해야 한다.[](source:e4)[](source:norm-merge)

끝내는 조건은 배정된 소스 검토와 구체적 후속 조사가 모두 정리된 때다. 검토를 끝내지 못했으면 솔직히 적는다. 그럴듯한 후보가 남지 않았으면 실제 검토 범위와 한계와 함께 그 결과를 돌려준다.[](source:finish)

## 흐름 속 위치는 어디인가? {#position}

@workflow id=position-flow title="위협 모델에서 validation으로"
| scan | security-diff-scan | backend | source:dscan30 |
| before | threat-model | backend | source:tm |
| current | finding-discovery | backend | source:fm |
| after | validation | backend | source:val |
| scan > current | 내부 위임 R07 | emphasis |
| before > current | 산출물 호환 R10 | dashed |
| current > after | 산출물 호환 R11 | dashed |

@steps id=position-steps
| highlight | finding-discovery | diff scan이 위협 모델 다음에 compact diff 모드로 한 번 실행한다. 후보는 validation이 이어받는다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R07 · 내부 위임 | `security-diff-scan`이 변경 파일 inventory 전체에 `$finding-discovery`를 compact diff 모드로 돌린다. 가능한 worker에 독립 배정을 나누고 나머지는 직접 본다. 인벤토리는 `prepare_codex_security_review_items`가, 후보 기록은 `record_codex_security_discovery_candidates`가 맡는다. 호스트 workbench가 상태를 관리한다.[](source:dscan30)[](source:sel-a)[](source:tool-rec) |
| R10 · 산출물 호환 | 위협 모델과 적용되는 보안 정책을 근거로 쓴다. 이 순서를 강제하는 곳은 diff scan뿐이다. 단독 호출에서 모델 없이 돌려도 되는지는 원문에 명시 없음이다.[](source:purpose)[](source:tm) |
| R11 · 산출물 호환 | validation은 후보 ID와 discovery 필드를 보존해 이어받는다. 이 단계에서 validation을 되풀이하지 않는다.[](source:val)[](source:val21)[](source:delegate) |
| R15 · 참고 | Standard scan과 Deep worker는 이 스킬을 쓰지 않는다. 같은 일을 자기 prompt 안에서 한다.[](source:sel-wd)[](source:core18) |
| R18 · 참고 | compact 목록 없이 diff를 단독으로 발견할 때 `scan-artifacts-and-ledger.md`를 읽는다. 이 문서는 standalone·legacy diff에만 쓰고 Standard, Deep, compact Workbench Diff에는 쓰지 않는다고 스스로 밝힌다.[](source:sel-b)[](source:led-use) |
| R44 · 공유 상태 | `SECURITY.md`는 정책 맥락이다. `define-security-policy`가 쓰고 이 스킬은 검토하는 경로마다 해당 정책을 찾아 쓴다. 선후 관계는 없다.[](source:reads)[](source:pol8) |
| R74 · 공유 상태 | compact diff 후보 ledger 하나를 discovery가 쓰고(replace), validation이 `validation` 객체를, attack-path가 `attack_path` 객체를 더한다. 도구가 후보 순서와 기존 필드를 보존한다.[](source:sa-compact)[](source:val28) |

이 스킬이 읽는 공통 문서와 도구 계약은 아래와 같다.

| 관계 | 이 스킬이 가져가는 것 |
|---|---|
| R60 · 참고(`artifact-storage.md`) | 저장 전에 읽는다. 후보 발견 같은 구조화 결과는 기존 도구에 두고 보조 파일 도구로 대체하지 않는다. standalone·legacy의 변하는 ledger는 저장 도구로 전체 내용을 바꾸거나 도우미가 만든 임시 파일을 가져와야 하고, 보존된 scan 폴더에 직접 덧붙이지 않는다.[](source:store9)[](source:store-supp)[](source:store-legacy) |
| R61 · 참고(`security-guidance.md`) | 경로마다 `SECURITY.md`를 root부터 leaf까지 이어 붙이고, 충돌하면 대상에 가장 가까운 정책이 앞선다.[](source:guide)[](source:guide-rule) |
| R85 · 참고(`scan-artifacts.md`) | compact diff는 `<discovery_dir>/candidate_ledger.jsonl` 하나로 끝나고, worklist·per-finding receipt·phase 보고서는 standalone·legacy diff에만 쓴다.[](source:sa-compact)[](source:sa-legacy) |

전체 흐름은 색인 기준 `codex-security/_group-scan-vulnerabilities`(`scan-vulnerabilities.html`)를 가리킨다. 묶음 페이지는 별도 단계에서 만든다.

standalone diff를 맡았다면 `scan-artifacts-and-ledger.md`가 정한 절차가 따라온다. 변경 파일마다 worklist 행을 만들고, 파일마다 검토를 마친 근거를 `work_ledger.jsonl`에 남기고, 읽지 않은 파일의 coverage를 만들어 내지 않는다. 변경 파일은 순위를 매기거나 버리지 않고 전부 worklist에 복사한다.[](source:led-work)[](source:led-deep)[](source:led-cov)

- [ ] 검토를 시작하기 전에 `list_codex_security_review_items`의 모든 page를 읽는다.
- [ ] 후보마다 source, control, sink, 영향, 반증이나 증명 간극을 `evidence`에 적는다.
- [ ] 같은 문제를 여러 위치로 나눠 적었다면 한 후보로 합치고 모든 위치를 남긴다.
- [ ] 후보 기록 호출은 한 번만 한다. 후보를 더 찾으면 목록 전체를 다시 만들어 한 번에 낸다.
- [ ] validation이나 심각도 판정을 이 단계에서 하지 않는다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `finding-discovery/SKILL.md` 5,076B와 `agents/openai.yaml` 220B를 끝까지 읽었다. 스킬 폴더의 텍스트 파일은 이 둘이 전부다.[](source:fm)[](source:yaml) |
| 필수 참조 | `artifact-storage.md` 7,947B, `security-guidance.md` 2,830B, `scan-artifacts.md` 11,701B, `security-scan/references/scan-artifacts-and-ledger.md` 7,021B를 끝까지 읽었다.[](source:store9)[](source:guide)[](source:sa-compact)[](source:led-use) |
| 도구 계약 | `discovery-candidates.schema.json` 1,152B, `discovery-candidate.schema.json` 4,203B, `review-items.schema.json` 1,431B, `artifact-common.schema.json` 870B와, `artifact-discovery.ts` 6,305B, `artifact-inventory.ts` 5,370B, `compact-artifact-tools.ts` 15,421B, `normalize-candidates.ts` 18,523B(1~560줄), `discovery-location-roles.ts` 175B를 읽었다.[](source:sch-in)[](source:disc-rec)[](source:norm-merge)[](source:roles) |
| 구조·표본만 확인(전부 읽지 않음) | `artifact-contracts.ts`(15,569B)는 20~172줄만 읽었다. `security-scan/SKILL.md`는 1~21줄, `define-security-policy/SKILL.md`는 1~40줄만 읽었다.[](source:contracts)[](source:scan10)[](source:pol8) |
| 관계 근거 | `security-diff-scan/SKILL.md` 5,405B, `validation/SKILL.md` 4,619B, `threat-model/SKILL.md` 2,986B, `core-scan.md`, `baseline-auditor.md`, `focused-investigator.md`를 읽었다. `skills/README.md`, `.mcp.json`, `plugin.json`은 공통 확인용이다.[](source:dscan30)[](source:val)[](source:core18)[](source:readme)[](source:mcpjson)[](source:pluginjson) |
| 제외 | 번역본 없음. 바이너리 없음. 외부 URL과 `scripts/`의 코드는 열거나 실행하지 않았다. |

읽은 텍스트 파일은 27개이고 이 중 부분 읽음은 3개다. 원문의 활성화 조건 2개, 작업 방식 3개, 근거 기준 6개, 후보 출력 항목 7개, 종료 조건, 호출 제한 필드 유무를 모두 대조했다. 원문 수치는 없고, 도구 계약의 수치(`limit` 1~1000, ID 앞 16자)만 코드에서 확인했다.

@callout level=open-question title="확인하지 못한 것"
| diff의 변경 근거를 읽는 도우미 `candidate_source_lines`(`scripts/workbench_target.py`)는 이름만 확인하고 읽지 않았다. 그래서 사라진 파일의 줄 수 검사가 baseline에서 어떻게 이뤄지는지는 확인하지 못했다. `generate-in-scope-files` 도우미 본문(변경 파일 판정 규칙)도 읽지 않았다. 호스트 도구를 호출하지 않았고, 후보 행이 실제로 어떻게 쓰이는지는 코드를 읽어서만 확인했다.[](source:inv-prep)[](source:disc-diff) |

분석 중 원본은 수정하지 않았고, 스킬의 어떤 명령도 실행하지 않았다.
