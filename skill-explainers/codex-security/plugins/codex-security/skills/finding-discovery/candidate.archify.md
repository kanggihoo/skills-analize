# finding-discovery는 취약점 후보를 어떤 근거로 찾아 어떻게 남기나? {#finding-discovery-page}

`finding-discovery`는 보안 scan의 발견 단계에서 에이전트가 소스를 읽고, 공격자가 실제로 악용할 수 있어 보이는 취약점 후보를 근거와 함께 찾아 다음 단계 스킬이 이어받게 하는 스킬이다. 위협 모델과 보안 정책을 근거로 쓰고, 최종 심각도는 정하지 않는다.[](source:purpose)

- 누가 언제 쓰나: scan이 이미 finding-discovery 단계에 있거나 사용자가 저장소나 코드 변경에서 후보를 찾아 달라고 명시할 때 쓴다. 전체 PR, commit, branch, patch, 저장소 scan을 시작하는 1차 트리거로는 쓰지 않는다.[](source:fm)
- 에이전트가 내놓는 것: 위치, source·control·sink, 영향, 반증, 증명 간극을 담은 후보다. 후보가 없으면 실제로 검토한 범위와 한계를 붙여 "없음"을 돌려준다.[](source:out)[](source:finish)
- 하지 않는 것: 최종 심각도 판정, 이 단계 안에서 validation이나 attack-path 단계 되풀이, scan 시작이다.[](source:purpose)[](source:delegate)[](source:sel)
- 주의: 스킬이 남기라는 항목 일부(후보 ID 보존, 반증, 전제 조건, `relevant_lines`)는 compact diff의 후보 기록 도구에 입력 칸이 없다. 판정이며 근거는 출력 패널에 있다.[](source:out)[](source:sch-raw)

@answer scope="로컬 원본 분석 · 스킬·도구·helper 실행 없음 · 호스트 도구는 소스 계약만 확인"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=243a9028dc78fe13c6f64b1a5c199bc9939ccc06
@source fm title="frontmatter와 description" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=1:4
@source purpose title="목적과 최종 심각도 제외" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=8:8
@source reads title="읽을 문서, 정책 해석, 입력 경로 규칙" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=10:10
@source sel title="Standard·Deep 제외와 작업 방식 세 가지" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=14:18
@source diffscope title="diff 검토 범위" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=20:20
@source crit title="근거 기준 여섯 가지" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=24:29
@source delegate title="worker 분담과 단계 반복 금지" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=31:31
@source out title="후보에 남길 항목" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=35:43
@source finish title="구조화 계약, legacy 저장, 종료 조건" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=45:45
@source yaml title="표시 이름과 기본 prompt" path=codex-security/plugins/codex-security/skills/finding-discovery/agents/openai.yaml
@source yaml-code title="표시 이름과 기본 prompt 전문" path=codex-security/plugins/codex-security/skills/finding-discovery/agents/openai.yaml lines=1:4
@source store-own title="scan 소유와 구조화 결과 저장 규칙" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=7:9
@source store-supp title="보조 파일 저장 도구와 소유자" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=13:23
@source store-gen title="생성 근거 파일과 legacy ledger 저장" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=43:45
@source guide-run title="정책 컴파일 방법" path=codex-security/plugins/codex-security/references/security-guidance.md lines=7:12
@source guide-rule title="policy chain 순서와 untrusted 규칙" path=codex-security/plugins/codex-security/references/security-guidance.md lines=30:36
@source sa-compact title="Compact Workbench Diff 경로" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=41:49
@source sa-legacy title="standalone·legacy diff 경로" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=51:70
@source led-use title="이 참고 파일을 쓰는 경우" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-artifacts-and-ledger.md lines=1:3
@source led-work title="변경 파일 worklist 만들기" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-artifacts-and-ledger.md lines=5:22
@source led-rev title="worklist 파일별 검토와 배정" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-artifacts-and-ledger.md lines=24:32
@source led-cov title="검토 범위 정리와 단계 인계" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-artifacts-and-ledger.md lines=34:42
@source sch-in title="후보 기록·목록 도구 입력" path=codex-security/plugins/codex-security/schemas/tools/discovery-candidates.schema.json lines=5:32
@source sch-role title="CWE 형식과 위치 role 값" path=codex-security/plugins/codex-security/schemas/definitions/discovery-candidate.schema.json lines=6:20
@source sch-raw title="입력 위치와 입력 후보 형식" path=codex-security/plugins/codex-security/schemas/definitions/discovery-candidate.schema.json lines=21:82
@source sch-stored title="저장되는 후보 형식" path=codex-security/plugins/codex-security/schemas/definitions/discovery-candidate.schema.json lines=83:122
@source disc-rec title="후보 기록 도구는 ledger를 replace" path=codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts lines=52:101
@source disc-diff title="diff 변경 근거를 읽는 단계" path=codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts lines=103:122
@source disc-list title="후보 목록 읽기" path=codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts lines=180:193
@source inv-prep title="변경 파일 inventory 만들기" path=codex-security/plugins/codex-security/mcp-app/src/artifact-inventory.ts lines=28:119
@source inv-list title="inventory 읽기와 경로 검사" path=codex-security/plugins/codex-security/mcp-app/src/artifact-inventory.ts lines=121:168
@source tool-inv title="inventory 준비·목록 도구 등록" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=82:106
@source tool-rec title="후보 기록·목록 도구 등록" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=108:135
@source contracts title="후보 입력 형식 정의" path=codex-security/plugins/codex-security/mcp-app/src/artifact-contracts.ts lines=60:95
@source norm-loc title="위치와 후보 검사" path=codex-security/plugins/codex-security/mcp-app/src/helpers/normalize-candidates.ts lines=251:339
@source norm-merge title="후보 병합과 candidate_id 부여" path=codex-security/plugins/codex-security/mcp-app/src/helpers/normalize-candidates.ts lines=341:365
@source norm-key title="병합 키" path=codex-security/plugins/codex-security/mcp-app/src/helpers/normalize-candidates.ts lines=389:398
@source roles title="위치 role 목록" path=codex-security/plugins/codex-security/mcp-app/src/discovery-location-roles.ts lines=1:9
@source ds-flow title="diff scan의 단계 순서와 종료 조건" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=28:35
@source tm title="threat-model의 결과 전달" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=25:27
@source val title="validation이 후보를 이어받는 규칙" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=8:8
@source val-ids title="validation의 ID 보존" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=21:21
@source val-empty title="validation의 후보 읽기와 빈 집합 제출" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=27:28
@source readme title="finding-discovery 안내 줄" path=codex-security/plugins/codex-security/skills/README.md lines=26:26

## 켜지면 에이전트는 무엇을 읽고 어떻게 판단해 후보를 남기나? {#behavior span=12}

동작 지도는 두 장이다. 첫 장은 호출을 받아 세 작업 방식(compact 인벤토리, standalone diff worklist, 저장소 단독) 중 하나를 고르는 데까지이고, 둘째 장은 하나로 모인 근거 판단에서 후보를 남기기까지다. 지도에 없는 것은 둘째 그림 아래에 따로 적었다.

@workflow id=discovery-select title="호출에서 작업 방식 고르기까지"
| call | 호출 확인 | external |
| docs | 문서와 정책 읽기 | backend |
| mode | 작업 방식? | backend |
| compact | compact 인벤토리 검토 | backend |
| worklist | standalone diff worklist | backend |
| repo | 저장소 단독 발견 | backend |
| call > docs | |
| docs > mode | |
| mode > compact | 인벤토리 있음 |
| mode > worklist | diff, 인벤토리 없음 |
| mode > repo | 저장소 단독 |

세 방식은 모두 아래 지도의 `경로 추적과 근거 판단`으로 이어진다. 한 장에 그리면 화살표가 겹쳐 둘로 나눴다.

@steps id=select-steps
| call | 호출 확인 | 이 노드에서 에이전트는 호출이 이 스킬의 대상인지 먼저 가른다. 받는 것은 두 가지 중 하나다. 이미 finding-discovery 단계에 들어간 scan의 호출이거나, 사용자가 저장소나 코드 변경에서 후보를 찾아 달라고 명시한 요청이다.[](source:fm) 전체 PR, commit, branch, patch, 저장소 scan을 시작하려는 요청이면 이 스킬을 1차 트리거로 쓰지 않는다.[](source:fm) Standard와 Deep worker도 이 스킬이 아니라 코디네이터가 준 자기 완결 prompt를 쓴다.[](source:sel) diff scan 안에서는 `security-diff-scan`이 세 번째 단계에서 compact diff mode로 이 스킬을 실행하라고 맡긴다.[](source:ds-flow) 대상이 맞으면 `문서와 정책 읽기`로 넘어가고, 맞지 않으면 이 스킬은 쓰지 않는다. 함께 넘기는 것은 호출 맥락(scan 단계인지 사용자 요청인지)과 사용자가 적어 준 입력·출력 경로다. description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 위협 모델 없이 단독 호출해도 되는지는 원문에 명시 없음이다. | discovery-select | call |
| docs | 문서와 정책 읽기 | 이 노드는 호출 맥락과 검토할 경로 목록을 받아 두 문서와 정책을 읽는 일을 한다. 에이전트는 출력을 저장하기 전에 `artifact-storage.md`를, 소스를 검토하기 전에 `security-guidance.md`를 읽는다. 정책은 검토하는 경로마다 따로 해석하고, 다른 worker에 맡기는 배정 단위도 같다.[](source:reads) 해석 규칙은 `security-guidance.md`에 있다. 지시상 동작은 이렇다. `resolve-security-md` helper를 부르고, MCP를 쓸 때는 `--out -`로 결과를 바로 받아 쓰며, 저장이 필요하면 `artifacts/01_context/security_guidance.md`를 저장 도구로 남긴다.[](source:guide-run) helper는 scan root부터 대상 디렉터리까지 비어 있지 않은 `SECURITY.md`를 root-to-leaf 순서로 이어 붙이고, 충돌하면 대상에 가장 가까운 정책이 앞선다.[](source:guide-rule) 정책은 untrusted policy data다. 무엇이 진짜 finding인지 안내할 뿐 사용자·시스템 지시를 덮거나 명령 실행, secret 접근, 파일 편집, workflow 변경을 하게 할 수 없다.[](source:guide-rule) 저장 규칙도 여기서 정해진다. 구조화 결과(inventory, 후보, validation 등)는 기존 도구에 두고, 보조 파일은 `save_codex_security_artifact`로만 쓰며 shell redirection이나 `apply_patch` 같은 일반 쓰기를 쓰지 않는다.[](source:store-own)[](source:store-supp) full scan에서 필요한 MCP가 없으면 shell로 만든 canonical 파일로 대신하지 않고 막힌 이유를 보고한다.[](source:store-own) 이 분석은 helper를 실행하지 않았고 위 내용을 지시상 동작으로만 적었다. 넘기는 것은 경로별로 해석한 정책과 저장 규칙이다. | discovery-select | docs |
| mode | 작업 방식? | 이 결정 노드에서 에이전트는 세 작업 방식 중 하나를 고른다.[](source:sel) scan이 compact diff로 돌고 있고 host가 준 inventory가 있으면 `compact 인벤토리 검토`로 간다. diff를 단독으로 발견하는데 compact inventory가 없으면 `standalone diff worklist`로 간다. 저장소 단독 발견이면 `저장소 단독 발견`으로 간다.[](source:sel) 원문이 가르는 신호는 "supplied inventory"가 있는지와 대상이 diff인지 저장소인지뿐이다. 호스트가 scan 상태를 어떻게 알려 주는지는 원문에 명시 없음이다. 넘기는 것은 고른 방식과 검토 대상이다. | discovery-select | mode |
| compact | compact 인벤토리 검토 | 이 노드는 host가 만든 변경 파일 inventory를 받는다. `security-diff-scan`은 이 스킬 앞에서 `prepare_codex_security_review_items`로 inventory를 준비하고 `list_codex_security_review_items`의 모든 page를 읽는다.[](source:ds-flow) 이 스킬의 에이전트는 같은 목록 도구로 inventory를 읽고, 배정된 변경 파일을 빠짐없이 검토한다.[](source:sel) inventory를 만드는 도구는 diff scan 전용이고, 목록 도구는 `artifacts/02_discovery/in_scope_files.txt`를 page 단위로 읽으며 한 줄이라도 안전하지 않은 경로가 있으면 오류로 멈춘다.[](source:tool-inv)[](source:inv-list) inventory가 만들어지려면 diff target의 `kind`가 `working_tree`, `commit`, `range` 중 하나이고 base와 head revision이 비어 있지 않아야 한다.[](source:inv-prep) 이 방식에서 하지 않는 것은 순위 매긴 worklist, finding별 ledger, receipt, discovery 보고서를 만드는 일이다.[](source:sel) 검토는 diff가 실제로 바꾼 동작을 본다. 삭제된 파일은 baseline revision에서 본다. 지원 코드는 영향받는 경계를 이해할 만큼만 따라가고, 바뀐 공유 통제가 형제 호출자에게 영향을 주면 그쪽으로 넓히되 관련 없는 저장소 감사로 번지지 않는다.[](source:diffscope) 넘기는 것은 파일별로 읽은 코드와 의심 지점이고, `경로 추적과 근거 판단`으로 간다. | discovery-select | compact |
| worklist | standalone diff worklist | 이 노드는 compact inventory 없이 diff를 단독으로 발견하는 경우를 받고, 에이전트는 `security-scan/references/scan-artifacts-and-ledger.md`를 읽어 따른다.[](source:sel) 이 참고 파일은 standalone이나 legacy diff discovery에만 쓰고 Standard, Deep, compact Workbench Diff는 쓰지 않는다고 스스로 밝힌다.[](source:led-use) 지시상 절차는 이렇다. 삭제 파일을 포함한 모든 변경 텍스트 파일로 `rank_input.jsonl`을 만든다. 추적된 변경은 ignore 규칙과 무관하게 범위에 두고, local patch면 ignore되지 않은 untracked 파일도 넣는다. 이어 모든 행을 `deep_review_input.jsonl`로 복사하며 순위를 매기거나 파일을 버리지 않는다.[](source:led-work) PR, commit, branch diff와 local patch는 helper 명령의 모드가 다르고 Windows용 PowerShell 변형도 따로 있다. 파일을 만드는 helper는 managed 임시 저장소에서 돌리고 보관할 결과는 저장 도구로 가져온다.[](source:led-work) 그다음 worklist의 파일마다 검토한다. 삭제 파일은 baseline 내용으로 보고, 지원 파일은 변경된 보안 동작을 설명하는 데 필요할 때만 읽되 포함한 이유를 적는다.[](source:led-rev) 이 분석은 helper를 실행하지 않았다. 넘기는 것은 worklist 행별 검토 결과이고 `경로 추적과 근거 판단`으로 간다. | discovery-select | worklist |
| repo | 저장소 단독 발견 | 이 노드는 허가된 저장소나 경로의 소스를 받는다. 에이전트는 아래 근거 기준을 그 소스에 적용해 후보와 검토 범위의 한계를 돌려준다. scan을 시작하지 않고 diff worklist 파이프라인도 돌리지 않는다.[](source:sel) 이 방식의 inventory 도구와 결과 저장 경로는 원문에 명시 없음이다. 호출자가 구조화된 후보 계약을 주면 그것을 쓰고, 저장소나 지정 경로의 instance에는 호출자가 요구할 때 `<family>:<file>:<line>` 형태의 instance 키를 단다.[](source:finish)[](source:out) 사용자나 advisory seed가 있으면 허가된 자료만 쓰고 링크는 허락 없이 열지 않는다.[](source:crit) 넘기는 것은 읽은 소스와 의심 지점이고 `경로 추적과 근거 판단`으로 간다. | discovery-select | repo |

@workflow id=discovery-judge title="근거 판단에서 후보를 남기기까지"
| trace | 경로 추적과 근거 판단 | backend |
| merge | worker 결과 합치기 | backend |
| any | 후보가 남았나? | backend |
| record | 후보 남기기 | database |
| none | 후보 없음 보고 | external |
| trace > merge | |
| merge > any | |
| any > record | 있음 | emphasis |
| any > none | 없음 |

@steps id=judge-steps
| trace | 경로 추적과 근거 판단 | 세 방식이 모이는 노드다. 받는 것은 검토 대상 소스, 경로별 정책, 위협 모델이다. 에이전트는 여섯 가지를 판단한다.[](source:crit) 첫째, 공격자가 조종하는 입력이나 권한 있는 동작을 가장 가까운 통제를 거쳐 sink와 보안 영향까지 추적하고, 통제가 없거나 우회되거나 엉뚱한 값·경계에 걸린 이유를 설명한다. 둘째, 런타임에서 닿는지와 배포 가정을 확인해 효과 있는 방어와 격리를 반증으로 적는다. 안전한 형제 구현이 있다고 후보 경로가 안전해지지는 않는다. 셋째, root control 위치와 이해에 필요한 entrypoint, wrapper, 구체 구현, sink를 남기고, 주장이 여러 구현에 걸치면 구현을 하나씩 확인한다. 넷째, 독립적으로 닿는 취약 instance는 따로 짚을 수 있게 둔다. 다섯째, 사용자나 advisory seed는 정확한 source와 control까지 따라가 근거가 뒷받침하는지, 반박하는지, 미해결인지 적는다. 같은 계열의 이웃 문제가 seed를 닫지는 않는다. 여섯째, 구체적 보안 영향과 유지보수·견고성 문제를 구분한다. 충돌, 위험한 API, 선택 기능, 빠진 검사는 단서이지 finding이 아니다. 그럴듯한 후보는 증거를 지어내거나 재현이 없다고 버리지 않고 증명 간극(proof gap, 아직 증명되지 않은 부분)을 적어 validation으로 보낸다. 쓸모 있으면 독립된 배정 단위를 사용 가능한 worker에 나눈다. 이때 target, 범위, 관련 정책과 모델, 필요한 결과 필드를 함께 준다.[](source:delegate) 위임이 실패하면 부모가 시작되지 않은 일을 직접 한다.[](source:led-rev) 이 단계 안에서 validation이나 attack-path 단계는 되풀이하지 않는다.[](source:delegate) 배정 단위 크기의 상한이나 worker 수는 원문에 명시 없음이다. 넘기는 것은 후보 초안, 검토한 경로, 남은 한계다. | discovery-judge | trace |
| merge | worker 결과 합치기 | 이 노드는 worker가 돌려준 검토 경로, 한계, 후보와 부모가 직접 본 결과를 받는다. 후보에는 source·control·sink·영향 근거, 반증, 열린 질문이 들어 있어야 한다.[](source:led-rev) 부모는 배정하지 않은 일을 직접 검토하고 중복을 조정한다.[](source:delegate) 같은 source·control·sink·영향의 중복 관찰은 합치되 영향받는 모든 위치와 원래 후보 ID를 남긴다. 겉모양만 다른 변종을 따로 쪼개지는 않는다.[](source:crit) standalone diff에서는 여러 검토자를 합칠 때 `raw_candidates.jsonl`을 보존할 수 있다. 합친 결과는 `deduped_candidates.jsonl`에 원래 ID와 위치를 담고, 병합에 설명이 필요할 때만 `dedupe_report.md`를 쓴다.[](source:led-cov) 부모는 배정한 경로를 worklist와 대조해 읽지 않은 파일의 검토 범위 기록을 만들어 내지 않는다.[](source:led-cov) 갈림은 종료 조건에서 나온다. 배정된 소스 검토와 구체적인 후속 확인이 모두 처리되어야 끝난다.[](source:finish) 되돌림은 지도에 그리지 않았다. 후속 확인이 남았을 때 `경로 추적과 근거 판단`으로 돌아간다고 읽는 것은 판정이며, 원문은 되돌림을 명시하지 않는다. 넘기는 것은 합친 후보 목록과 실제 검토 범위다. | discovery-judge | merge |
| any | 후보가 남았나? | 이 결정 노드는 합친 후보 목록을 받는다. 에이전트는 plausible한 후보가 남았는지 본다. 기준은 위 근거 기준을 넘었는지이고, 실행 가능한 재현이 있는지가 아니다.[](source:crit) 후보가 남았으면 `후보 남기기`로 간다. 하나도 남지 않았으면 `후보 없음 보고`로 간다.[](source:finish) 어느 쪽이든 검토를 끝내지 못한 부분은 숨기지 않고 적는다.[](source:finish) | discovery-judge | any |
| record | 후보 남기기 | 이 노드는 합친 후보를 받아 방식별 계약에 맞게 남긴다. 후보마다 ID와 제목, 위치와 role, source·control·sink와 영향, 반증과 전제 조건, CWE ID, instance 키, 해당 시 `relevant_lines`를 남긴다.[](source:out) compact diff에서는 `record_codex_security_discovery_candidates({ scanId, candidates })`를 한 번 불러 모든 후보를 기록한다.[](source:sel)[](source:sa-compact) host는 후보를 검사해 정규화하고 `candidate_ledger.jsonl` 전체를 한 번에 덮어쓴다. 다시 부르면 이전 후보가 사라지므로 더 찾았으면 목록 전체를 다시 만들어 한 번에 낸다.[](source:disc-rec) standalone diff에서는 후보마다 안정된 ID와 discovery receipt를 `<findings_dir>/<candidate_id>/candidate_ledger.jsonl`에 두고 결과를 `finding_discovery_report.md`에 저장한다. 이 파일은 저장 도구로 쓰고 보관 파일에 직접 append하지 않는다.[](source:led-cov)[](source:store-gen) 저장소 단독 방식은 호출자의 구조화 계약에 맞춰 후보를 돌려준다.[](source:finish) 저장 도구가 후보를 거부할 때 에이전트가 어떻게 하는지는 원문에 명시 없음이다. 코드상 한 행이라도 검사에 걸리면 정규화 단계가 오류를 내고, 파일 쓰기는 그 뒤에 일어나므로 이전 ledger는 그대로 남는다고 읽힌다. 판정이다.[](source:disc-rec)[](source:norm-loc) 넘기는 것은 후보 ledger다. validation이 candidate ID와 discovery 필드를 보존해 이어받는다.[](source:val)[](source:val-ids) | discovery-judge | record |
| none | 후보 없음 보고 | 이 노드는 후보가 없다는 판단과 검토 범위를 받는다. 에이전트는 후보를 만들어 내지 않고, 실제로 검토한 범위와 한계를 붙여 후보가 없다는 결과를 돌려준다.[](source:finish) diff scan에서는 모든 변경 파일과 후보를 reviewed, resolved, explicitly unfinished 중 하나로 설명해야 하고, 미완 검토를 "발견 없음" 주장으로 바꾸지 않는다.[](source:ds-flow) 후보가 0개일 때 validation을 부르는지는 원문끼리 충돌한다. `security-diff-scan`은 후보가 있을 때만 `validation`을 실행하라고 하고, `validation`은 빈 집합이어도 `validations: []`를 제출하라고 한다. 우선순위는 원문에 명시 없음이다.[](source:ds-flow)[](source:val-empty) | discovery-judge | none |

두 지도가 생략한 것은 다섯 가지다. 생략한 경로가 원문상 불가능하다는 뜻은 아니다.

- Standard와 Deep worker 제외는 `호출 확인`에서 문장으로 풀었다.
- worker 분담은 선택이라 `경로 추적과 근거 판단`과 `worker 결과 합치기`에서 설명했다.
- 구체적인 후속 확인이 남았을 때의 되돌림은 `worker 결과 합치기`에서 판정으로 설명했다.
- standalone diff의 산출물 파일은 `후보 남기기`에서 설명했다.
- 호스트 도구의 후보 검사 규칙은 아래 산출물 패널에서 설명했다.

설명용 예시: 아래 입력은 이해를 돕기 위해 지어낸 것이다. compact diff scan의 inventory에 `src/upload.py`가 있고, 이 파일이 요청의 `filename`을 검증 없이 `open()`에 넣는다고 하자. 에이전트는 입력에서 sink까지 가장 가까운 통제를 찾고, 앞단 proxy가 `..`를 막는지 같은 배포 가정도 확인한다.[](source:crit)

추적 결과 통제가 없거나 우회된다고 판단했다면 `cwe_ids`에 `CWE-22`를 넣고 위치마다 role을 붙여 후보를 기록한다. 호스트 규칙상 `end_line`을 생략하면 `start_line`과 같아지고, 줄 범위가 파일 줄 수를 넘으면 거부된다. 위치 중 하나 이상은 inventory 안 파일이어야 한다.[](source:norm-loc)

proxy가 막을 수도 있다는 반증은 입력 칸이 `summary`, `evidence`, `context` 문자열뿐이므로 거기에 적어야 한다. 판정이다.[](source:sch-raw)

## 이 스킬은 scan 흐름의 어디에 놓이나? {#position span=12}

이 스킬은 `scan-vulnerabilities` 묶음에 속한 단계 스킬이다. 전체 흐름은 묶음 페이지 `codex-security/_group-scan-vulnerabilities/scan-vulnerabilities.html`에 있다. 이 패널은 앞과 뒤만 보여 준다. 단계 스킬 네 개를 정해진 순서로 맡기는 곳은 `security-diff-scan`뿐이다.[](source:ds-flow)

@workflow id=position-flow title="앞뒤 스킬과의 관계"
| tm | threat-model | backend | source:tm |
| fd | finding-discovery | backend | source:purpose |
| val | validation | backend | source:val |
| tm > fd | 위협 모델, R10 |
| fd > val | 후보 ledger, R11 | emphasis |

@steps id=position-steps
| tm | threat-model | 앞 단계다. 이 스킬은 위협 모델과 보안 정책을 근거로 쓴다고 적는다.[](source:purpose) scan 안에서 모델은 `{ "format": "markdown", "content": ... }` 형태로 돌려주고 host가 `threatmodel.md`를 쓴다.[](source:tm) 단독 호출에서 모델 없이 discovery를 돌려도 되는지는 원문에 명시 없음이다. | position-flow | tm |
| fd | finding-discovery | 이 스킬이다. `security-diff-scan`이 inventory 위에서 compact diff mode로 실행하고, 후보는 한 번에 기록한다.[](source:ds-flow) | position-flow | fd |
| val | validation | 뒤 단계다. 후보가 있을 때 `security-diff-scan`이 `validation`을 한 번 실행한다. validation은 `list_codex_security_candidates`로 후보를 모두 읽고 discovery 필드와 후보 ID를 보존한다.[](source:ds-flow)[](source:val)[](source:val-ids)[](source:val-empty) | position-flow | val |

| 관계 | 받는 것 · 넘기는 것 · 조건 |
| --- | --- |
| R07 · 내부 위임 | `security-diff-scan`이 "compact diff mode"로 이 스킬을 실행하라고 맡기고, 독립된 배정 단위를 worker에 나눈 뒤 나머지는 직접 본다. 후보는 한 번만 기록한다. 순위 목록, finding별 ledger, discovery 보고서는 만들지 않는다.[](source:ds-flow) |
| R10 · 산출물 호환 | 위협 모델 Markdown이 이 스킬의 근거다. 순서를 강제하는 곳은 diff scan뿐이다.[](source:purpose)[](source:ds-flow)[](source:tm) |
| R11 · 산출물 호환 | 후보(ID, 위치, source·control·sink, 반증, 증명 간극)를 validation이 이어받는다. 이 단계 안에서 validation은 반복하지 않는다. compact diff 경로에서는 host가 `candidate_id`를 새로 붙이므로 "공급된 ID 보존"은 이 경로의 입력 칸으로 표현되지 않는다. 판정이다.[](source:delegate)[](source:val-ids)[](source:norm-merge) |
| R74 · 공유 상태 | compact diff는 `artifacts/02_discovery/candidate_ledger.jsonl` 하나를 공유한다. discovery가 후보를 쓰고, 뒤 단계가 같은 행에 `validation`과 `attack_path`를 더한다. 선후 관계는 diff scan이 정한다.[](source:sa-compact) |
| R44 · 공유 상태 | `SECURITY.md`는 정책 맥락이다. 이 스킬은 검토하는 경로마다 해당 정책을 찾아 쓴다.[](source:reads)[](source:guide-rule) |
| R15 · 참고 | Standard와 Deep worker는 이 단계 스킬이 아니라 코디네이터의 자기 완결 prompt를 쓴다.[](source:sel) |
| R18 · 참고 | compact inventory 없이 diff를 단독으로 발견할 때만 `scan-artifacts-and-ledger.md`를 읽는다. 이 파일은 Standard, Deep, compact Workbench Diff에는 쓰지 않는다.[](source:sel)[](source:led-use) |
| R60, R61, R85 · 참고 | 저장 전에 `artifact-storage.md`, 소스 검토 전에 `security-guidance.md`를 읽는다. 경로 규약은 `scan-artifacts.md`가 정한다.[](source:reads)[](source:store-own)[](source:sa-legacy) |

README는 이 스킬을 "경로나 diff에서 가능한 취약점을 찾고 아직 증명이 필요한 것을 표시한다"고 한 줄로 소개한다.[](source:readme)

## 언제 켜지고 언제 쓰면 안 되나? {#activation span=12}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 문구와 정확히 일치해야 켜지는 사전이 아니다.

@code source=fm language=yaml

@code source=yaml-code language=yaml

`disable-model-invocation` 같은 호출 제한 필드는 `SKILL.md` frontmatter에 원문에 명시 없음이다.

`agents/openai.yaml`에도 `policy` 필드가 없고 표시 이름, 짧은 설명, 기본 prompt만 있다. 기본 prompt는 현재 저장소나 주어진 코드 변경에서 finding을 찾으라는 문장이다.[](source:fm)[](source:yaml) 이 명세에서 사용자 승인 단계는 원문에 명시 없음이다. 사용자가 개입하는 곳은 필수로 지정된 입력이 빠져 분석이 막힐 때 묻는 것뿐이다.[](source:reads)

| 상황 | 이 스킬을 쓰나 | 근거 |
| --- | --- | --- |
| scan이 이미 finding-discovery 단계에 있다 | {good:쓴다} | description의 첫째 조건이다.[](source:fm) |
| 사용자가 저장소나 코드 변경에서 후보를 찾아 달라고 명시했다 | {good:쓴다} | description의 둘째 조건이다.[](source:fm) |
| 전체 PR, commit, branch, patch, 저장소 scan을 시작하는 요청이다 | {bad:1차 트리거로 쓰지 않는다} | description의 금지 문장이다. 어느 스킬이 맡는지는 이 스킬에 적혀 있지 않다.[](source:fm) |
| Standard나 Deep scan의 worker다 | {bad:쓰지 않는다} | 코디네이터의 자기 완결 prompt를 쓴다.[](source:sel) |
| 최종 심각도나 validation 결과를 원한다 | {bad:이 스킬의 일이 아니다} | 심각도는 정하지 않고, validation과 attack-path는 되풀이하지 않는다.[](source:purpose)[](source:delegate) |
| 사용자가 advisory 링크를 주었다 | {caution:허락 없이 링크를 열지 않는다} | 허가된 자료만 쓴다.[](source:crit) |

## 무엇을 강제하고 무엇을 금지하나? {#rules span=12}

아래는 찾아보기용 규칙 목록이다. 동작 순서는 첫 패널을 본다.

| 구분 | 규칙 | 근거 |
| --- | --- | --- |
| 금지 1 | compact diff에서 순위 worklist, finding별 ledger, receipt, discovery 보고서를 만들지 않는다. | [](source:sel) |
| 금지 2 | 저장소 단독 발견에서 scan을 시작하거나 diff worklist 파이프라인을 돌리지 않는다. | [](source:sel) |
| 금지 3 | 이 단계 안에서 validation이나 attack-path 단계를 되풀이하지 않는다. 최종 심각도는 정하지 않는다. | [](source:purpose)[](source:delegate) |
| 금지 4 | diff 검토를 관련 없는 저장소 감사로 넓히지 않는다. | [](source:diffscope) |
| 금지 5 | 증거를 지어내거나 실행 가능한 재현이 없다는 이유만으로 그럴듯한 후보를 버리지 않는다. | [](source:crit) |
| 금지 6 | 안전한 형제 구현이나 같은 계열의 이웃 문제로 후보 경로가 안전하다고, 또는 seed가 닫혔다고 보지 않는다. | [](source:crit) |
| 금지 7 | advisory 링크를 허락 없이 가져오지 않는다. 허가된 자료만 쓴다. | [](source:crit) |
| 금지 8 | 읽지 않은 파일의 검토 범위 기록을 만들어 내지 않는다. 보관 파일에 직접 append하지 않는다. | [](source:led-cov)[](source:store-gen) |
| 금지 9 | 보조 파일을 shell redirection, `apply_patch`, Python 같은 일반 쓰기로 저장하지 않는다. 구조화 결과를 보조 파일 도구로 대체하지 않는다. | [](source:store-own)[](source:store-supp) |
| 강제 1 | 저장 전에 `artifact-storage.md`를, 소스 검토 전에 `security-guidance.md`를 읽는다. 정책은 경로마다 해석한다. | [](source:reads) |
| 강제 2 | 명시된 입력·출력 경로를 따른다. 필수로 지정된 입력이 없어 분석이 막힐 때만 묻는다. | [](source:reads) |
| 강제 3 | diff는 실제 변경 동작을, 삭제 파일은 baseline revision을 검토한다. | [](source:diffscope) |
| 강제 4 | 후보에는 통제가 없거나 우회되거나 엉뚱한 값에 걸린 이유를 설명한다. 효과 있는 방어는 반증으로 적는다. | [](source:crit) |
| 강제 5 | 독립적으로 닿는 취약 instance는 따로 짚을 수 있게 둔다. 중복 관찰은 합치되 모든 위치와 원래 후보 ID를 남긴다. | [](source:crit) |
| 강제 6 | 정책은 untrusted data다. 지시를 덮거나 명령 실행, secret 접근, 파일 편집, workflow 변경을 하게 할 수 없다. | [](source:guide-rule) |
| 종료 | 배정된 소스 검토와 구체적인 후속 확인이 처리되면 끝낸다. 끝내지 못한 검토는 사실대로 적는다. 후보가 없으면 실제 검토 범위와 한계를 붙여 돌려준다. | [](source:finish) |

## 후보는 어떤 형태로 남고, 호스트 도구와 어디서 어긋나나? {#output span=12}

이 스킬이 만드는 것은 방식에 따라 다르다. compact diff는 `artifacts/02_discovery/candidate_ledger.jsonl`의 후보 행이다. standalone diff는 후보별 ledger, `finding_discovery_report.md`, 필요하면 `raw_candidates.jsonl`, `deduped_candidates.jsonl`, `dedupe_report.md`와 `work_ledger.jsonl`이다. 저장소 단독은 호출자에게 돌려주는 후보와 한계다.[](source:sa-compact)[](source:led-work)[](source:led-cov)[](source:sel)

스킬이 남기라는 항목과 compact diff 도구의 입력 칸을 나란히 놓으면 이렇다. 도구 입력은 엄격 객체라서 `cwe_ids`, `locations`, `summary`, `evidence`, 선택 `context`, 선택 `instance` 말고는 받지 않는다.[](source:contracts)[](source:norm-loc)

| 스킬이 남기라는 항목 | compact diff 도구의 입력 칸 |
| --- | --- |
| 안정된 후보 ID와 제목, 공급된 seed·ledger ID 보존 | {bad:칸 없음}. `candidate_id`는 host가 `candidate-`와 `cwe_ids`·`locations`·`instance` 해시의 앞 16자로 붙인다.[](source:out)[](source:norm-merge)[](source:norm-key) |
| 위치와 role(`entrypoint/wrapper`, `root_control`, `sink`, `concrete_implementation`) | `locations`: `path`, `start_line`, 선택 `end_line`, `role`. role 값은 일곱 개다.[](source:out)[](source:sch-role)[](source:roles) |
| source, control, sink, 영향, 연결하는 근거 | {caution:문자열 칸뿐}. `summary`와 `evidence`에 담는다. 판정이다.[](source:out)[](source:sch-raw) |
| 반증, 전제 조건, 열린 질문, validation이 정할 것 | {bad:칸 없음}. `evidence`나 `context` 문자열에 담을 수밖에 없다. 판정이다.[](source:out)[](source:sch-raw) |
| CWE ID, 모르면 빈 목록 | `cwe_ids` 필수 배열. 입력은 대소문자·앞 0·공백을 허용하고 저장은 `CWE-N` 형태다.[](source:out)[](source:sch-role)[](source:sch-stored) |
| 저장소·경로 instance의 `<family>:<file>:<line>` 키 | `instance` 선택 문자열이다. 호출자가 요구할 때만 쓴다.[](source:out)[](source:sch-raw) |
| diff의 `relevant_lines` | {bad:칸 없음}.[](source:out)[](source:sch-raw) |

호스트 도구는 후보를 받으면 다음을 한다. 이 내용은 코드를 읽고 확인했고 실행하지는 않았다.

- 위치는 줄 범위를 검사한다. `end_line`을 생략하면 `start_line`과 같고, `end_line`이 `start_line`보다 작거나 파일 줄 수를 넘으면 오류다. role이 목록에 없어도 오류다.[](source:norm-loc)
- 위치 중 하나 이상은 inventory 안의 파일이어야 한다. 모르는 필드가 있어도 오류다.[](source:norm-loc)
- 위치는 중복을 없애고 role 순서, 경로, 줄 번호로 정렬한다.[](source:norm-loc)
- `cwe_ids`, `locations`, `instance`가 모두 같은 후보끼리만 합친다. 합칠 때 `summary`, `evidence`, `context`는 중복을 빼고 정렬해 줄바꿈으로 잇는다.[](source:norm-key)[](source:norm-merge)
- 스킬은 source·control·sink·영향이 같으면 합치라고 하므로 호스트의 병합 기준과 다르다. 판정이다.[](source:crit)[](source:norm-key)
- 저장은 후보 목록 전체 replace다. 후보가 0개면 빈 내용으로 덮어쓰는 코드다. 판정이다.[](source:disc-rec)
- diff scan이면 변경 근거를 읽는 helper(`candidate_source_lines`)를 부르는 경로가 있고, 이 helper는 읽지 않았다.[](source:disc-diff)
- 저장된 후보 행은 `additionalProperties`를 허용해 뒤 단계가 `validation`과 `attack_path`를 더할 수 있다. 목록 도구는 후보를 page 단위로 읽는다.[](source:sch-stored)[](source:disc-list)

@facts id=tool-facts
| 후보 기록 호출 | compact diff에서 한 번. 다시 부르면 이전 후보를 덮어쓴다.[](source:sel)[](source:disc-rec) |
| 도구 사용 범위 | 후보 기록은 diff scan 전용 도구이고, 후보 목록은 diff 또는 Deep scan의 후보를 읽는다.[](source:tool-rec) |
| `candidate_id` | `candidate-` 뒤에 SHA-256 앞 16자.[](source:norm-merge) |
| 후보 목록 `limit` | 1에서 1000 사이 정수. `cursor`는 10진 문자열이다.[](source:sch-in) |
| 위치 role | 일곱 개: `entrypoint`, `entrypoint/wrapper`, `source`, `root_control`, `sink`, `concrete_implementation`, `evidence`.[](source:roles) |

이 스킬이 쓰는 role 이름 네 개는 도구 목록에 모두 있다. 도구에는 `source`, `entrypoint`, `evidence`도 있지만 스킬 본문은 이 세 값을 언급하지 않는다.[](source:out)[](source:roles)

## 어디까지 읽고 확인했나? {#audit span=12}

| 구분 | 확인 범위 |
| --- | --- |
| 스킬 원본 | `finding-discovery/SKILL.md` 5,076B와 `agents/openai.yaml` 220B를 끝까지 읽었다. 스킬 폴더의 텍스트 파일은 이 둘뿐이고 `scripts/`와 `references/` 폴더는 없다.[](source:fm)[](source:yaml) |
| 필수 참조(전체) | `artifact-storage.md` 7,947B, `security-guidance.md` 2,830B, `scan-artifacts.md` 11,701B, `security-scan/references/scan-artifacts-and-ledger.md` 7,021B, `discovery-candidates.schema.json` 1,152B, `discovery-candidate.schema.json` 4,203B, `artifact-discovery.ts` 6,305B, `artifact-inventory.ts` 5,370B를 끝까지 읽었다.[](source:store-own)[](source:guide-run)[](source:sa-compact)[](source:led-use)[](source:sch-in)[](source:sch-raw)[](source:disc-rec)[](source:inv-prep) |
| 구조·표본만 확인(전부 읽지 않음) | 호스트 구현 파일 세 개는 줄 범위만 읽었다. `compact-artifact-tools.ts`(15,421B)는 82~135줄, `artifact-contracts.ts`(15,569B)는 60~95줄, `normalize-candidates.ts`(18,523B)는 251~339줄, 341~365줄, 389~398줄이다. 그 밖의 부분은 읽지 않았다.[](source:tool-rec)[](source:contracts)[](source:norm-loc)[](source:norm-merge)[](source:norm-key) |
| 관계 근거(부분) | 앞뒤 스킬은 필요한 줄만 읽었다. `security-diff-scan/SKILL.md` 5,405B는 20~35줄, `threat-model/SKILL.md` 2,986B는 25~27줄, `validation/SKILL.md` 4,619B는 8줄, 21줄, 27~28줄, `skills/README.md` 3,752B는 26줄이다. 이 줄은 앞뒤 관계와 호출 순서를 확인하는 데만 썼다. `discovery-location-roles.ts` 175B는 전체를 읽었다.[](source:ds-flow)[](source:tm)[](source:val)[](source:readme)[](source:roles) |
| 제외 | 번역본 없음. 바이너리 없음. 외부 URL은 열지 않았다. 스킬이 가리키는 helper와 도구는 실행하지 않았다. |

읽은 텍스트 파일은 18개이고, 이 중 줄 범위만 읽은 부분 읽음 파일은 7개다(호스트 구현 3개, 앞뒤 스킬과 README 4개). 원문 대조는 활성화 조건 2개, 작업 방식 3개, 근거 기준 6개, 후보 출력 항목 7개, 종료 조건, 호출 제한 필드 유무를 모두 확인했다. 원문에 수치는 없고, 도구 계약의 수치(`limit` 1~1000, ID 앞 16자, role 7개)만 코드에서 확인했다.

@callout level=open-question title="확인하지 못한 것"
| diff의 변경 근거를 읽는 helper `candidate_source_lines`(`scripts/workbench_target.py`)와 inventory를 만드는 `generate-in-scope-files` helper는 읽지 않았다. 사라진 파일의 줄 수 검사가 baseline에서 어떻게 이뤄지는지, 변경 파일을 판정하는 규칙은 확인하지 못했다. `review-items.schema.json`도 읽지 않아 inventory 목록 도구의 `limit` 범위는 이 페이지에서 확인하지 않았다. 호스트 도구를 호출하지 않았고, 후보 행이 실제로 어떻게 쓰이는지는 코드를 읽어서만 확인했다. 저장 도구가 후보를 거부했을 때 에이전트의 대응, `working_tree` diff에서 revision을 채우는 단계는 원문에 명시 없음이거나 읽지 않았다.[](source:disc-diff)[](source:inv-prep)[](source:tool-inv) |

분석 중 원본은 수정하지 않았고 스킬의 어떤 명령도 실행하지 않았다.
