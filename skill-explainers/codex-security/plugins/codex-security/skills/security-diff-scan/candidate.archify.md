# security-diff-scan은 변경된 코드의 취약점을 어떤 단계로 찾고 어디까지 확인하나? {#security-diff-scan-page}

`security-diff-scan`은 PR, commit, branch diff, working-tree patch처럼 코드 변경분에서 취약점을 찾을 때, 에이전트가 변경된 텍스트 파일 전부를 위협 모델부터 공격 경로 분석까지 정해진 단계로 검토하고 결과를 Codex Security host(workbench)에 기록해 봉인된 보고서로 끝내게 하는 스킬이다.[](source:d-fm)[](source:d-scope)[](source:d-tm)[](source:d-done)

- 사용자가 PR, commit, branch diff, 로컬 patch의 보안 검토를 맡길 때 쓴다. description과 `default_prompt`가 이 범위를 말한다.[](source:d-fm)[](source:y-ui)
- 에이전트는 위협 모델, 후보와 처분, 공격 경로 결정을 host 도구에 기록하고, 수락된 final draft로 `complete_codex_security_scan`을 한 번 부른다. 그 결과로 host가 `report.md`와 SARIF를 만든다.[](source:d-draft)[](source:d-done)
- 저장소 전체 audit으로 번지지 않고, 순위 worklist·finding별 장부·discovery 보고서를 만들지 않으며, 미완료 검토를 "finding 없음"으로 바꾸지 않는다.[](source:d-scope)[](source:d-disc)[](source:d-end)
- 필요한 MCP를 쓸 수 없거나 baseline이 지원되지 않으면 blocker만 보고하고 멈춘다. PR과 branch diff를 도구의 `diffTarget` 종류로 어떻게 넘기는지는 원문에 명시 없음이다.[](source:d-start)[](source:sv-diff)

@answer scope="텍스트 42개 읽음(7개는 필요한 줄만) · 도구 미실행 · 커밋 243a902"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=243a9028dc78fe13c6f64b1a5c199bc9939ccc06
@source d-fm title="frontmatter" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=1:4
@source d-scope title="검토 범위" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=8:8
@source d-trust title="범위 고정과 맥락 취급" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=12:12
@source d-start title="scan 시작과 이어받기" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=14:14
@source d-rt title="runtime과 SECURITY.md" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=16:16
@source d-time title="조사 시간 allowance" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=18:18
@source d-ctx title="맥락 변경과 진행 기록" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=20:20
@source d-inv title="inventory 범위" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=24:24
@source d-stop title="취소와 실패" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=26:26
@source d-tm title="위협 모델 단계" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=28:28
@source d-ins title="변경 파일 목록 단계" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=29:29
@source d-disc title="후보 발견 단계" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=30:30
@source d-val title="검증과 공격 경로 단계" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=31:31
@source d-draft title="draft 저장 단계" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=32:32
@source d-done title="완료와 보고 단계" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=33:33
@source d-end title="종료 조건" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=35:35
@source y-ui title="UI 표시와 기본 prompt" path=codex-security/plugins/codex-security/skills/security-diff-scan/agents/openai.yaml lines=1:4
@source st-own title="scan 소유권과 구조화 결과" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=5:9
@source st-supp title="보조 파일 규칙" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=11:13
@source st-read title="threatmodel.md 읽기" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=37:37
@source rt-deleg title="worker 위임" path=codex-security/plugins/codex-security/references/scan-runtime.md lines=3:5
@source rt-host title="host diff scan 시작" path=codex-security/plugins/codex-security/references/scan-runtime.md lines=7:7
@source rt-adv title="Daybreak 안내 읽기" path=codex-security/plugins/codex-security/references/scan-runtime.md lines=11:13
@source aa title="Daybreak 접근 안내" path=codex-security/plugins/codex-security/references/access-advisory.md lines=3:11
@source tb-head title="allowance 성격" path=codex-security/plugins/codex-security/references/investigation-time-budget.md lines=3:3
@source tb-rules title="마감 규칙" path=codex-security/plugins/codex-security/references/investigation-time-budget.md lines=7:11
@source sg title="SECURITY.md 해석" path=codex-security/plugins/codex-security/references/security-guidance.md lines=34:36
@source fr-own title="draft 제출과 완료 소유자" path=codex-security/plugins/codex-security/references/final-report.md lines=3:16
@source fr-find title="finding 필드" path=codex-security/plugins/codex-security/references/final-report.md lines=20:30
@source fr-state title="review state" path=codex-security/plugins/codex-security/references/final-report.md lines=34:40
@source fr-map title="후보 결과 매핑" path=codex-security/plugins/codex-security/references/final-report.md lines=42:49
@source fr-opt title="선택 문서" path=codex-security/plugins/codex-security/references/final-report.md lines=53:53
@source fr-err title="오류와 복구" path=codex-security/plugins/codex-security/references/final-report.md lines=57:61
@source fr-resp title="응답과 token 사용량" path=codex-security/plugins/codex-security/references/final-report.md lines=75:79
@source fr-cc title="code comment" path=codex-security/plugins/codex-security/references/final-report.md lines=81:87
@source sc-status title="scan.status 값" path=codex-security/plugins/codex-security/references/scan-contract.md lines=32:41
@source sc-mode title="scan.mode 값" path=codex-security/plugins/codex-security/references/scan-contract.md lines=122:132
@source tmr-intro title="위협 모델 원칙" path=codex-security/plugins/codex-security/references/threat-model.md lines=3:3
@source rub title="기본 severity 기준" path=codex-security/plugins/codex-security/references/default-severity-rubric.md lines=3:33
@source tm-sel title="모델 선택" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=14:19
@source fd-intro title="discovery 역할" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=8:8
@source fd-diff title="compact diff 방식" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=16:20
@source fd-ev title="후보 근거 기준" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=24:31
@source fd-out title="후보에 남길 것" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=35:45
@source v-assess title="검증 절차" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=12:17
@source v-wb title="compact diff 검증" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=25:30
@source vg-ev title="증거 선택" path=codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md lines=5:11
@source vg-inst title="인스턴스 처분" path=codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md lines=15:21
@source vg-conf title="확신도" path=codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md lines=31:37
@source ap-est title="공격 경로 정립" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=16:23
@source ap-wb title="compact diff 공격 경로" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=31:36
@source sp-rep title="보고 여부와 가능성" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=9:24
@source sp-pri title="priority 대응" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=28:35
@source rd-sel title="벤더의 스킬 선택 안내" path=codex-security/plugins/codex-security/skills/README.md lines=3:9
@source rd-apr title="assess-patch-risk 안내" path=codex-security/plugins/codex-security/skills/README.md lines=13:13
@source dc-raw title="후보 입력 스키마" path=codex-security/plugins/codex-security/schemas/definitions/discovery-candidate.schema.json lines=51:82
@source rv-sch title="목록 읽기 입력 스키마" path=codex-security/plugins/codex-security/schemas/tools/review-items.schema.json lines=18:32
@source cv-sch title="검증 기록 스키마" path=codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json lines=13:135
@source ca-sch title="공격 경로 기록 스키마" path=codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json lines=68:187
@source sd-tm title="threatModel 입력 형식" path=codex-security/plugins/codex-security/schemas/tools/scan-draft.schema.json lines=520:580
@source sd-find title="finding 입력 형식" path=codex-security/plugins/codex-security/schemas/tools/scan-draft.schema.json lines=334:493
@source sd-state title="review state 입력 형식" path=codex-security/plugins/codex-security/schemas/tools/scan-draft.schema.json lines=589:719
@source tools-phase title="phase 도구 모드 검사" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=370:384
@source inv-prep title="변경 파일 목록 생성" path=codex-security/plugins/codex-security/mcp-app/src/artifact-inventory.ts lines=29:119
@source disc-rec title="후보 기록" path=codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts lines=56:101
@source disc-list title="후보 읽기" path=codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts lines=180:193
@source led-val title="검증 기록 구현" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=23:77
@source led-ap title="공격 경로 기록 구현" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=90:159
@source norm-combine title="후보 병합과 ID" path=codex-security/plugins/codex-security/mcp-app/src/helpers/normalize-candidates.ts lines=341:365
@source norm-key title="병합 기준" path=codex-security/plugins/codex-security/mcp-app/src/helpers/normalize-candidates.ts lines=389:398
@source io-miss title="없는 artifact 오류" path=codex-security/plugins/codex-security/mcp-app/src/artifact-io.ts lines=82:105
@source tmdoc title="threatmodel.md 생성" path=codex-security/plugins/codex-security/mcp-app/src/threat-model-document.ts lines=33:75
@source sv-diff title="diffTarget 형식" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=103:120
@source sv-start title="prompt-only scan 시작" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=638:680
@source sv-ctxload title="scan context 불러오기" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1348:1356
@source sv-ctx title="context 갱신" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1462:1466
@source sv-phase title="진행 phase 값" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=340:348
@source sv-comp title="scan 완료 도구" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1566:1595
@source sv-fail title="scan 실패 도구" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1624:1631
@source wp-back title="phase 되돌림 거부" path=codex-security/plugins/codex-security/scripts/workbench_progress.py lines=267:268
@source ss-desc title="security-scan description" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=3:3
@source dp-desc title="deep-security-scan description" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=3:3
@source dp-cont title="이어 실행 분기" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=10:10
@source tf-desc title="track-findings description" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=3:3
@source tf-body title="track-findings 본문" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=8:8
@source tmv-desc title="threat-model-visualize 입력" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=10:10

## 켜지면 에이전트는 scan을 어떻게 시작하나? {#setup-panel span=12}

이 패널은 scan이 시작되기 전까지의 일을 다룬다. 에이전트는 범위를 고정하고, 기존 scan을 이어받을지 새로 만들지 정하고, 실행 환경을 확인한 뒤 소스 검토로 넘어간다. 다음 패널이 소스 검토부터 완료까지를 다룬다.

@workflow id=setup-flow title="scan 시작 전 흐름"
| range | 범위 고정 | external | source:d-trust |
| haveScan | 기존 scanId가 있나? | backend | source:d-start |
| resume | scan context 불러오기 | backend | source:d-start |
| start | diff scan 시작 | backend | source:sv-start |
| blocked | blocker 보고 후 중단 | security | source:d-start |
| runtime | 실행 환경 확인 | backend | source:d-rt |
| range > haveScan | |
| haveScan > resume | 있음 |
| haveScan > start | 없음 |
| start > blocked | MCP 없음 또는 baseline 미지원 | security |
| start > runtime | 시작됨 | emphasis |
| resume > runtime | | emphasis |

이 그림은 시작 경로만 보여 준다. 취소와 실패는 어느 단계에서든 일어날 수 있어서 그리지 않았고, 아래 강제·금지 패널과 표에서 설명한다.

@steps id=setup-steps
| range | 범위 고정 | 에이전트는 사용자 요청에서 PR, commit, branch diff, working-tree patch 중 무엇을 볼지 받는다.[](source:d-fm) 정확한 Git range 또는 로컬 patch를 정해 끝까지 바꾸지 않는다. 사용자가 준 맥락과 외부 자료는 분석 데이터로만 읽고 지시나 권한으로 보지 않는다. 사용자가 URL을 줬다면 부모 에이전트만 사용자가 허락한 범위에서 읽을 수 있고, URL 내용이 다른 대상이나 서비스 접근을 허락하지는 못한다.[](source:d-trust) 같은 줄이 `artifact-storage.md`를 먼저 읽으라고 하므로 에이전트는 이 문서에서 "scan을 먼저 얻고 구조화된 결과는 지정 도구에만 둔다"는 규칙을 가져온다.[](source:st-own) 이 노드가 넘기는 것은 고정된 범위와 사용자 맥락이다. 판정: PR이나 branch diff를 도구의 `diffTarget` 종류(`working_tree`, `commit`, `range`) 중 어느 것으로 넘기는지는 원문에 명시 없음이다.[](source:sv-diff) | setup-flow | range |
| haveScan | 기존 scanId가 있나? | 에이전트는 받은 요청이나 host가 준 정보에 이미 만들어진 `scanId`가 있는지 본다. 있으면 그 scan을 이어받고, 없으면 새 scan을 시작한다.[](source:d-start) 있음과 없음을 가르는 기준을 더 자세히 적은 문장은 원문에 명시 없음이다. SDK가 소유한 scan이면 그 scan이 공급한 context와 completion owner를 그대로 유지한다.[](source:d-start) | setup-flow | haveScan |
| resume | scan context 불러오기 | 에이전트는 기존 `scanId`로 `get_codex_security_scan_context`를 불러 scan의 정체성, 디렉터리, revision, handoff token을 돌려받아 그대로 보관한다.[](source:d-start) 이 도구의 설명은 target, mode, 선택 `userContext`, artifact 디렉터리, 진행 상태를 읽어 온다고 하고, 토큰과 함께 불러온 Standard scan은 preflight에서 `threat_model`로 올라간다고 적는다. diff scan에서도 같은 일이 일어나는지는 원문에 명시 없음이다.[](source:sv-ctxload) 이 노드가 넘기는 것은 불러온 scan 정체성과 토큰이다. | setup-flow | resume |
| start | diff scan 시작 | 에이전트는 `start_codex_security_prompt_only_scan`을 한 번 부른다. 입력은 `mode: "diff"`, `targetPath`, `scope: "."`, `diffTarget`, 선택 `userContext`다.[](source:d-start) 도구는 diff mode에 `diffTarget`이 없으면 거부하고, `scope`가 전체 대상 `.`이 아니어도 거부하며, scan을 소유한 Codex thread 맥락이 없어도 거부한다.[](source:sv-start) `diffTarget`은 세 종류다. `working_tree`는 두 revision이 선택값이고, `commit`은 `headRevision`이 필수이며, `range`는 `baseRevision`과 `headRevision`이 모두 필수다.[](source:sv-diff) 에이전트는 돌려받은 scan 정체성, 디렉터리, revision, handoff token을 이후 모든 단계에 쓴다.[](source:d-start) 도구를 쓸 수 없거나 baseline이 지원되지 않으면 blocker 보고로 간다. | setup-flow | start |
| blocked | blocker 보고 후 중단 | MCP가 없거나 선택한 baseline이 지원되지 않으면 에이전트는 그 blocker를 보고한다. 대체 scan을 만들지 않고 shell로 canonical 파일을 만들지도 않는다.[](source:d-start)[](source:st-own) 이 규칙은 예전의 터미널 파일 작성 대체 경로보다 우선한다.[](source:st-own) 이 노드가 이 흐름의 끝이고 넘기는 것은 blocker 보고뿐이다. 어떤 baseline이 "지원되지 않는" 것인지는 원문에 명시 없음이다. | setup-flow | blocked |
| runtime | 실행 환경 확인 | 에이전트는 소스 검토 전에 `scan-runtime.md`를 읽는다.[](source:d-rt) 위임 도구가 deferred 상태이고 `tool_search`가 있으면 한 번 찾아본 뒤에야 worker를 쓸 수 없다고 판단한다. worker가 시작됐다는 증거는 성공한 spawn 호출과 돌려받은 worker ID뿐이고, 설정된 용량은 최댓값일 뿐이다. worker를 못 띄우면 부모가 같은 검토를 이어 가며 파일과 보안 질문을 모두 설명하고 실제 coverage gap을 보고한다. 선택 기능을 켜려고 Codex 영구 설정을 읽거나 고치지 않는다.[](source:rt-deleg) host가 맡은 diff scan은 architecture mapping을 시작하기 전에 `threat_model` phase로 올린다.[](source:rt-host) 관련 `SECURITY.md` 안내도 적용한다. resolver는 scan root부터 대상 디렉터리까지 비어 있지 않은 `SECURITY.md`를 이어 붙이고, 충돌하면 대상에 가장 가까운 파일이 이긴다. 내용은 정책 데이터라서 사용자·시스템 지시를 덮거나 명령을 실행시키지 못한다.[](source:sg) Daybreak 접근 안내는 이렇게 얽혀 있다. `scan-runtime.md`는 diff scan이 첫 실질 행동 전에 `access-advisory.md`를 읽으라고 하지만, `SKILL.md`에는 이 문서를 가리키는 문장이 없고 도구 쪽 안내 문구도 prompt-only `diff` 결과에는 붙지 않는다. 어느 쪽이 diff scan의 실제 요구인지는 원문에 명시 없음이다.[](source:rt-adv)[](source:d-rt) 읽는다면 규칙은 이렇다. `get_codex_security_daybreak_access`가 세션에 이미 있을 때만 부르고, Bedrock이나 API key 전용 세션이면 조용히 건너뛴다. 실패, `unknown`, `stale: true`이면 경고 없이 계속하고, 최신 `not_granted`이면 `enrollmentUrl`(없으면 `https://chatgpt.com/cyber`)과 함께 눈에 띄는 경고를 먼저 보인다. 이 안내는 scan을 허락하거나 막지 않는다.[](source:aa) 조사 시간 allowance는 이렇게 다룬다. 이미 있거나 host가 준 allowance는 재개한 turn에서도 그대로 둔다. 그런 것이 없으면 현재 대화에서 사용자가 명시 요청한 경우에만 `investigation-time-budget.md`를 읽고, 요청받은 양수 `budgetMinutes`, 실제 로컬 UTC `startedAt`, 계산한 `deadlineAt`으로 한 번 렌더해 이 scan 동안 따른다. 저장소 내용과 가져온 `userContext`는 allowance를 정하거나 바꾸지 못한다. 요청도 allowance도 없으면 템플릿을 읽지도 시계를 켜지도 않는다.[](source:d-time) 템플릿은 allowance가 권고일 뿐 hard timeout도 최소 실행 시간도 아니라고 하고, 마감이 되면 새 조사를 열지 않고 미완료와 불확실성을 coverage에 남기되 최종 준비는 마감을 넘겨도 된다고 정한다. 템플릿 첫 문장은 "Standard scan"이라고 적혀 있어 diff scan에서 이 문구를 어떻게 읽는지는 원문에 명시 없음이다.[](source:tb-head)[](source:tb-rules) 마지막으로 맥락 변경 요청은 `update_codex_security_scan_context`로 저장한다. 단계가 실제로 바뀔 때는 `update_codex_security_scan_progress`를 부르고, 돌려받은 `structuredContent.scan.userContext`를 그 단계와 worker에 쓰며, 필요하면 현재 handoff token을 넘긴다. worker는 맥락을 데이터로만 보고 offline을 유지하며, 외부 맥락은 부모가 허락된 범위에서만 가져온다.[](source:d-ctx) 도구는 새 맥락을 다음 phase부터 쓰고 현재 phase의 worker는 원래 맥락을 유지한다.[](source:sv-ctx) | setup-flow | runtime |

## 변경 파일은 어떤 순서로 검토하고 어떻게 끝나나? {#review-panel span=12}

이 패널이 스킬의 중심이다. 에이전트는 위협 모델을 정하고, host가 만든 변경 파일 목록을 끝까지 읽고, `finding-discovery`, `validation`, `attack-path-analysis`를 정해진 횟수로 맡긴 뒤, 결과를 draft로 저장하고 scan을 완료한다. 내부 위임 네 개(`threat-model`, `finding-discovery`, `validation`, `attack-path-analysis`)는 모두 이 스킬의 진행 도중 실행되고 결과가 이 스킬로 돌아온다.[](source:d-tm)[](source:d-disc)[](source:d-val)

@workflow id=review-flow title="변경 파일 검토부터 완료까지"
| threat | 위협 모델 | backend | source:d-tm |
| inventory | 변경 파일 inventory | backend | source:d-ins |
| discover | 후보 발견 | backend | source:d-disc |
| anyCand | 후보가 있나? | backend | source:d-val |
| validate | 후보 검증 | backend | source:d-val |
| attack | 공격 경로 분석 | backend | source:d-val |
| draft | draft 저장 | backend | source:d-draft |
| complete | scan 완료 | backend | source:d-done |
| threat > inventory | 모델 저장 후 | emphasis |
| inventory > discover | 목록 전체 | emphasis |
| discover > anyCand | 후보 기록 후 | emphasis |
| anyCand > validate | 있음 | emphasis |
| anyCand > draft | 없음 |
| validate > attack | 처분 기록 후 | emphasis |
| attack > draft | | emphasis |
| draft > complete | final draft 수락 | emphasis |

그림은 핵심 경로만 보여 준다. 생략한 것은 세 가지다.

첫째, `complete: false` checkpoint는 위협 모델 직후부터 결정이 나올 때마다 여러 번 저장되고 그림에는 draft 노드 하나로 묶었다. 둘째, 입력 검증 실패 때 draft로 돌아가 고치는 되돌림은 draft 노드의 설명에 문장으로 풀었다. 셋째, 취소와 실패는 어느 단계에서든 일어날 수 있어서 강제·금지 패널에 모았다.

"후보가 없을 때 draft로 바로 간다"는 간선은 원문에 명시된 것이 아니라 읽은 결과이며, 근거와 한계는 후보가 있나? 노드에 적었다.

@steps id=review-steps
| threat | 위협 모델 | 에이전트는 `$threat-model`을 한 번 실행하거나 사용자가 공급한 모델을 쓴다.[](source:d-tm) 공급된 모델이 스키마를 통과하는 canonical `threatModel` 객체이면 바꾸지 않고 보존한다. 텍스트이면 그 원문 그대로, 에이전트가 새로 만들었으면 생성한 Markdown을 `{ "format": "markdown", "content": "<model text>" }`로 두고 `origin`을 `provided` 또는 `generated`로 적는다.[](source:d-tm)[](source:sd-tm) 사용자가 좁히라고 하지 않으면 모델은 저장소 전체를 대상으로 하고, 모델이 실제로 다룬 범위는 변경 파일 범위와 따로 기록한다.[](source:d-tm) `threat-model` 스킬은 공유 cache를 이렇게 다룬다. 공급된 모델, 비어 있지 않은 `userContext`, 권위 있는 지식 베이스, 더 좁은 범위 중 하나라도 있으면 공급 모델을 보존하거나 이 scan 전용 모델을 새로 만들고 공유 cache는 읽지도 바꾸지도 않는다. 그 밖에는 모델 끝의 `Repository`와 `Version` 줄이 현재 대상과 맞을 때만 cache를 쓴다. `AGENTS.md`나 풀어낸 `SECURITY.md`가 필요한 경계를 설명하면 모델 대신 쓸 수 있다.[](source:tm-sel) 모델을 새로 만들거나 고칠 때는 `threat-model.md`를 따라 실제 architecture, 공격자 능력, 신뢰 경계를 소스 근거와 함께 쓰고, 시나리오는 확정된 finding이 아닌 가설로 둔다.[](source:tmr-intro) 이 노드의 끝에서 에이전트는 모델만 담고 finding은 아직 없는 `complete: false` 의미 draft를 바로 저장한다. host는 저장된 모델로 `threatmodel.md`를 쓰고, scan이 끝나기 전에는 provisional로 표시한다. 이후 단계는 같은 canonical 모델을 유지한다.[](source:d-tm)[](source:tmdoc) | review-flow | threat |
| inventory | 변경 파일 inventory | 에이전트는 `prepare_codex_security_review_items`로 host가 변경 파일 목록을 만들게 하고, `list_codex_security_review_items`의 모든 page를 읽는다.[](source:d-ins) 목록에는 파일 이름, 확장자, 디렉터리와 관계없이 변경된 텍스트 파일이 들어간다. 추적 중인 변경은 ignore된 파일이어도 범위에 남고, 로컬 patch는 ignore되지 않은 untracked 파일도 포함한다. 삭제된 파일은 baseline revision에서 확인한다. 보안 관련성은 파일 종류가 아니라 동작과 도달 가능성, 곧 build, 배포, CI에서의 쓰임까지 보고 판단한다.[](source:d-inv) 도구 쪽 조건은 이렇다. prepare는 diff mode의 부모 scan에서만 동작하고, 저장된 `diffTarget`의 종류가 세 값 중 하나이며 `baseRevision`과 `headRevision`이 모두 비어 있지 않아야 한다. `working_tree`는 `local-patch`, 나머지는 `revisions` 모드로 helper에 넘기고 결과는 `artifacts/02_discovery/in_scope_files.txt`에 저장한다. 도구는 `reviewItemsTotal`을 돌려준다.[](source:inv-prep)[](source:tools-phase) list는 `limit`이 1에서 1000 사이 정수인 page 단위로 읽는다.[](source:rv-sch) 시작 입력 스키마에서는 `working_tree`의 두 revision이 선택값인데 prepare는 비어 있으면 오류를 내므로, 저장 단계에서 값을 채우는지는 읽은 범위에서 확인하지 못했다(원문에 명시 없음).[](source:sv-diff)[](source:inv-prep) 목록 밖의 변경되지 않은 파일은 변경된 동작을 설명하는 데 필요할 때만 지원 자료로 읽는다.[](source:d-ins) | review-flow | inventory |
| discover | 후보 발견 | 에이전트는 `$finding-discovery`를 compact diff mode로 목록 전체에 돌린다. 독립된 배정은 쓸 수 있는 worker에게 나누고, 배정하지 않은 파일은 직접 검토한다.[](source:d-disc) 각 파일에서는 변경된 동작을 실제로 읽고 삭제 파일은 baseline에서 본다. 지원 코드는 영향받는 경계를 이해할 만큼만 따라가고, 바뀐 공유 통제가 형제 호출자에게 영향을 주면 그 호출자까지 넓히되 관련 없는 저장소 audit으로 넓히지 않는다.[](source:fd-diff) 후보로 남기는 기준은 다음과 같다. 공격자가 통제하는 입력이나 권한 있는 동작을 가장 가까운 통제를 거쳐 sink와 보안 영향까지 추적하고, 통제가 없거나 우회되거나 엉뚱한 값에 적용된 이유를 설명할 수 있어야 한다. 실제 도달 가능성과 배포 가정을 확인하고 유효한 방어는 반증으로 적는다. 크래시, 위험한 API, 선택 기능, 빠진 검사는 그 자체로 finding이 아니라 단서이고, 증명 간극(proof gap)이 있는 그럴듯한 후보는 증거를 지어내지도 재현이 없다는 이유로 버리지도 않고 validation에 넘긴다.[](source:fd-ev) 이 단계는 최종 severity를 정하지 않으며 validation이나 공격 경로 단계를 되풀이하지 않는다.[](source:fd-intro) 독립적으로 취약한 인스턴스는 따로 찾을 수 있게 두고 모든 후보를 `record_codex_security_discovery_candidates`로 한 번에 기록한다. 순위 worklist, finding별 장부, discovery 보고서는 만들지 않는다.[](source:d-disc) 기록 입력은 후보마다 `cwe_ids`, `locations`(path, start_line, 선택 end_line, role), `summary`, `evidence`와 선택 `context`, `instance`만 받는다.[](source:dc-raw) host는 inventory와 변경 소스를 기준으로 후보를 정규화하고, `cwe_ids`·`locations`·`instance`가 모두 같은 행을 합치며, `candidate-` 뒤에 해시 앞 16자를 붙인 ID를 매기고 이전 후보 파일 전체를 바꿔 쓴다. 그래서 다시 호출하면 이전 후보가 사라진다.[](source:disc-rec)[](source:norm-combine) 판정: 스킬이 남기라는 반증, 선행 조건, `relevant_lines`, source·control·sink 구분은 입력 칸이 없어 문자열 필드에 풀어 써야 한다. 또 스킬은 source·control·sink·영향이 같으면 합치라고 하지만 host는 `cwe_ids`·`locations`·`instance`로 합쳐 기준이 다르다.[](source:fd-out)[](source:norm-key) | review-flow | discover |
| anyCand | 후보가 있나? | 에이전트는 기록된 후보가 있는지 본다. `SKILL.md`는 "후보가 있으면 `$validation`을 한 번 실행한다"고만 적고, 후보가 없을 때 무엇을 하는지는 적지 않는다(원문에 명시 없음).[](source:d-val) 판정: 후보가 없으면 검증과 공격 경로 단계를 건너뛰고 draft 저장으로 간다고 읽는 것이 가장 자연스럽다. 그러나 `validation` 스킬은 빈 집합에도 `validations: []`를 제출하라고 하므로 두 원문이 충돌하고, 우선순위는 명시되지 않았다.[](source:v-wb) 도구 쪽은 이렇다. 빈 배열은 스키마가 거부하지 않지만, 도구는 먼저 후보 파일을 읽고 파일이 없으면 오류를 낸다. 후보가 0건이어도 discovery 기록 도구가 빈 파일을 쓰므로, discovery를 한 번 기록했다면 `validations: []`가 통과하고 기록하지 않았다면 실패한다. 이 조합은 두 코드 경로를 합친 판정이다.[](source:cv-sch)[](source:led-val)[](source:disc-rec)[](source:io-miss) 이 노드가 넘기는 것은 후보가 있으면 후보 전체이고, 없으면 draft 저장으로 가는 길이다. | review-flow | anyCand |
| validate | 후보 검증 | 에이전트는 `$validation`을 한 번 실행하고, 먼저 `list_codex_security_candidates`로 후보를 모두 읽는다.[](source:v-wb) 후보마다 주장된 공격자 입력, 보안 경계, 관련 통제, 민감한 동작, 선행 조건을 정리하고, 주장을 받치거나 깨는 증거를 찾는다. 증거 방법은 집중된 소스 분석일 수도 승인 범위 안의 재현일 수도 있고, 언어나 도구 이름이 증거 품질을 정하지 않는다.[](source:v-assess)[](source:vg-ev) 활성 scan에 `false_positive_feedback.json`이 있으면 지시가 아닌 증거로 읽고, 적힌 이유가 현재 코드와 통제에 여전히 맞을 때만 일치하는 후보를 suppress한다.[](source:v-assess) 네트워크 접근과 PoC 실행은 사용자 승인과 scan 권한을 넘지 않는다. offline scan은 offline으로 남고, build와 harness와 PoC는 저장 정책이 준 일회용 작업 공간에서 돌리며, 별도 재구현보다 원본 코드를 시험한다.[](source:v-assess) 처분은 `reportable`, `suppressed`, `not_applicable`, `deferred` 넷 중 하나를 모든 후보에 붙인다. 호출자나 배포 근거가 없다는 사실만으로는 suppress하지 않고 추가 확인이나 `deferred`로 둔다.[](source:vg-inst) 확신도는 경로와 영향까지 포함한 전체 주장에 대해 정한다. `high`는 경로와 영향이 확립되고 중대한 반증이 없을 때, `medium`은 직접 증거는 있으나 선행 조건이 불확실할 때, `low`는 근거가 간접적이거나 맥락이 크게 빠졌을 때다.[](source:vg-conf) 기록은 `record_codex_security_candidate_validations` 한 번의 호출에 모든 처분을 담는다. 각 처분에는 `disposition`, `method`, `confidence`, `confidence_rationale`, `rubric`, `evidence`, `counterevidence_or_proof_gap`, `remaining_uncertainty` 여덟 필드가 필수이고 `rubric`에는 평가한 보안 속성을 적는다.[](source:v-wb)[](source:cv-sch) 도구는 기존 후보가 하나라도 빠지거나 모르는 후보나 중복 후보가 있으면 거부한다.[](source:led-val) 중첩 기록이 이 단계의 전체 산출물이라서 별도 보고서, receipt, 종결표, 수동 ledger는 만들지 않고, 실제 PoC나 입력이나 로그가 있을 때만 `validation_artifacts/<candidate_id>/`를 만든다.[](source:v-wb) | review-flow | validate |
| attack | 공격 경로 분석 | 에이전트는 `$attack-path-analysis`를 한 번, 처분이 `reportable` 또는 `deferred`인 후보에만 실행한다.[](source:d-val) 위협 모델과 검증된 후보를 `list_codex_security_candidates`로 읽고, 이 단계에 들어온 후보를 모두 분석하되 후보 정체성과 기존 필드를 보존한다.[](source:ap-wb) 후보마다 범위 안의 공격자, 영향받는 제품 표면, 진입점, 통제되는 입력, 보안 경계, 민감한 동작을 소스 근거로 따라가고, 관련 통제와 가장 강한 반증이 무엇을 확립하는지, 주장된 경계를 정말 넘는지 따진다. 영향과 가능성은 이 사실에서 평가한 뒤 severity 정책을 적용하며, 사실과 severity 보정과 최종 정책 결정은 결과에서 구분해 둔다.[](source:ap-est) 정책의 요지는 다음과 같다. 반증됐거나 의미 있는 보안 영향이 없으면 `ignore`다. 실제로 있는 finding이면 영향이나 가능성이 낮다는 이유만으로 버리지 않고 낮은 severity를 준다. 자기 자신에게만 미치는 영향이나 달성할 수 없는 선행 조건은 강하게 억제하고, 권한 있는 사용자·운영자·개발자·물리 접근·보호된 쓰기 경로만 전제하면 권한 상승 차이가 쟁점이 아닌 한 `ignore`다. 노출이 `remote`이면 보통 높은 가능성, `local_network`이면 중간, `localhost`이면 낮은 가능성으로 보고, `none`이면 노출로는 가능성을 올리지 않는다.[](source:sp-rep) severity는 scan이 준 rubric으로, 없으면 기본 rubric으로 매긴다. 기본 rubric은 Critical, High, Medium, Low, Informational 다섯 등급이다.[](source:rub) 최종 priority는 `critical`이 P0, `high`가 P1, `medium`이 P2, `low`가 P3이고 `ignore`는 priority가 없다.[](source:sp-pri) 결정은 후보마다 `reportable`(severity는 critical, high, medium, low 중 하나), `ignore`(severity는 `ignore`), `deferred`(severity에 `unknown` 허용, `proof_gap` 필수) 중 하나다. 모든 결정을 `record_candidate_attack_paths` 한 번에 제출하고, 이 단계에 들어갈 후보가 없으면 `attackPaths: []`를 제출한다.[](source:ca-sch)[](source:ap-wb) 도구는 자격이 있는 후보가 빠지거나 자격 없는 후보가 들어 있으면 거부한다.[](source:led-ap) 판정: `reportable`의 severity 목록에 `informational`이 없어서, 이 단계에서는 Informational을 `reportable`로 기록할 칸이 없다. 최종 draft의 severity에는 `informational`이 있다.[](source:ca-sch)[](source:sd-find) 또 이 스킬은 위협 모델을 `list_codex_security_candidates`로 읽으라고 하지만 이 도구는 후보 행만 돌려주고, 실행 중 scan의 `threatmodel.md`는 `read_codex_security_artifact`로 읽을 수 있다.[](source:disc-list)[](source:st-read) | review-flow | attack |
| draft | draft 저장 | 에이전트는 먼저 `final-report.md`를 읽고 finding, review state, 완료 계약을 따른다.[](source:d-draft) 결정이 나오는 대로 `record_codex_security_scan_draft`로 `complete: false` checkpoint를 저장하고, 해소되지 않은 후보와 원래 증거는 `reviewState.deferred`에 남긴다. 검토가 정리되면 위협 모델과 finding과 review state를 담아 `complete: true`로 제출한다. 이미 저장된 surface ID는 재사용하고, 끝난 generic 작업은 `reviewState.resolvedDeferred: [{ id, reason }]`로 닫는다.[](source:d-draft) 후보 결과가 draft에서 어디로 가는지는 다음 패널에 표로 정리했다.[](source:fr-map) finding에는 근거로 뒷받침된 소문자 `ruleId`, `taxonomy.category`, 알려진 `taxonomy.cwe`(없으면 `[]`), 진짜 `provenance.source`, 검증된 위치, 요약, 근본 원인, 검증 근거, 공격자 dataflow와 도달 가능성, 보정된 severity와 확신도, 반증, 실용적 수정안을 담는다.[](source:fr-find) host가 소유하는 `findingId`, `occurrenceId`, `fingerprints`와 대상·범위 메타데이터는 draft에서 빼고 host가 채운다.[](source:fr-state) 입력 검증 실패(`-32602`, `isError: true`)는 draft를 쓰지 않으므로, 에이전트는 같은 draft에서 거부된 필드를 고쳐 다시 제출하고 바뀌지 않은 요청을 반복하거나 모호한 전송·쓰기 실패를 맹목적으로 재시도하지 않는다. 이 되돌림이 그림의 draft 노드 안에서 일어난다.[](source:fr-err) 상세 write-up과 hardening 계획은 사용자가 요청했을 때만 만드는 선택 산출물이다.[](source:d-draft)[](source:fr-opt) 이 노드가 넘기는 것은 수락된 final draft다. | review-flow | draft |
| complete | scan 완료 | 에이전트는 final draft가 수락된 뒤 `complete_codex_security_scan`을 한 번 부르고, 이어 `get_codex_security_completed_scan`으로 완료된 scan을 읽는다. SDK가 완료를 소유한 scan이면 이 호출들을 하지 않는다.[](source:d-done)[](source:fr-own) 완료는 이미 쓴 manifest와 findings를 검증하고 봉인하며 `report.md`를 만들 뿐, 빠진 단계를 수행하거나 없는 draft를 만들어 주지 않는다.[](source:fr-own)[](source:sv-comp) 에이전트는 완료가 성공하고 `report.md`가 생기기 전에는 완료를 주장하지 않는다. 완료가 실패하면 도구 설명은 정확한 오류를 보이고 재시도 없이 응답을 멈추라고 한다. `final-report.md`는 도구 상태상 안전하면 복구할 수 있는 원인을 풀라고 하면서도 이미 성공한 완료나 수락된 final draft는 반복하지 말라고 한다. 두 문장의 우선순위는 명시되지 않았다.[](source:sv-comp)[](source:fr-err) 응답에서는 생성된 `report.md`를 주된 결과로 링크하고, 실제 coverage 한계와 구체적인 후속 작업을 말한다. 측정된 token 사용량(`usage.totalTokens` 등)이 있으면 적고, 알 수 없으면 0이라 쓰지 않고 알 수 없다고 적는다.[](source:d-done)[](source:fr-resp) 살아남은 finding마다 `::code-comment`를 하나씩 내고 없으면 내지 않으며, severity `critical`, `high`, `medium`, `low`는 priority 0, 1, 2, 3으로 옮긴다.[](source:fr-cc) 생성된 `report.md`는 informational finding의 개수만 세고 상세는 싣지 않으므로 그 상세는 `findings.json`이나 SARIF, CSV export에서 읽는다.[](source:fr-find) 끝맺음 조건은 이렇다. 변경 파일과 후보는 모두 검토함, 해소함, 명시적으로 미완료 중 하나로 설명돼야 하고, 미완료 검토를 "finding 없음" 결론으로 바꾸지 않는다.[](source:d-end) | review-flow | complete |

## 후보 처분은 draft에서 어떻게 분류되나? {#mapping-panel span=12}

draft 저장 노드에서 에이전트는 후보마다 validation 처분과 공격 경로 결정을 아래 순서로 읽어 draft의 어느 자리에 둘지 정한다. 원문이 "이 순서로" 읽으라고 한 표이고, 표 밖의 두 조합은 읽은 결과를 판정으로 적었다.[](source:fr-map) surface의 처분 값은 `reported`, `no_issue_found`, `rejected`, `not_applicable`, `needs_follow_up` 다섯이다.[](source:sd-state)

| 조합 | 순서 | draft에서의 처리 |
|---|---|---|
| validation `reportable`, 공격 경로 `reportable` | 1 | finding. 구분되는 인스턴스와 관련 위치를 모두 담는다.[](source:fr-map) |
| 둘 중 한쪽이라도 `deferred` | 2 | `needs_follow_up` surface와 증명 간극을 적은 deferred 작업.[](source:fr-map) |
| validation `not_applicable` | 3 | `not_applicable` coverage.[](source:fr-map) |
| validation `suppressed` | 4 | `rejected` coverage.[](source:fr-map) |
| 공격 경로 `ignore` | 4 | `rejected` coverage.[](source:fr-map) |
| validation `deferred`, 공격 경로 `reportable` | 판정 | 2번에 걸려 `needs_follow_up`이다. 순서대로 읽은 결과다.[](source:fr-map) |
| validation `deferred`, 공격 경로 `ignore` | 판정 | 2번과 4번이 모두 해당할 수 있고 우선순위는 원문에 명시 없음이다. "in this order"라는 말만 있어 2번이 먼저라고 읽는 것은 판정이다.[](source:fr-map) |
| 필수 단계 기록이 빠짐 | 해당 없음 | 가진 증거와 함께 해소되지 않은 채 남긴다. 조정용 추가 pass나 중복 receipt를 만들지 않는다.[](source:fr-map) |

@callout level=warning title="완료 도구는 빠진 단계를 채워 주지 않는다"
`complete_codex_security_scan`은 이미 쓴 manifest와 findings를 검증하고 봉인할 뿐 빠진 phase를 수행하거나 없는 draft를 만들지 않는다.[](source:fr-own)[](source:sv-comp)
그래서 후보 처분이나 공격 경로 기록이 빠진 채 완료를 부르면 해소되지 않은 후보가 남는다. 에이전트는 이를 "finding 없음"으로 보고하지 않는다.[](source:fr-map)[](source:d-end)

## 언제 켜지고 언제 쓰면 안 되나? {#activation-panel span=12}

켜지는 단서는 frontmatter의 description 한 문장이다. description은 모델이 판단할 때 참고하는 설명일 뿐 정확히 일치해야 켜지는 사전이 아니다. frontmatter에는 `name`과 `description`만 있고 `disable-model-invocation` 같은 호출 제한 필드는 없다.[](source:d-fm)

@code id=ds-frontmatter source=d-fm language=yaml

UI 설정 파일은 표시 이름, 짧은 설명, 기본 prompt를 정한다. 기본 prompt는 PR, commit, branch diff, working-tree patch에 diff scan을 돌리고 범위 안의 변경 파일을 모두 다루며 필요한 scan 단계를 끝내라고 말한다.[](source:y-ui) 벤더 안내문은 사용자가 "내 커밋하지 않은 변경에서 보안 버그를 확인해 줘"라고 요청하거나 요청에 `$security-diff-scan`처럼 이름을 넣어 직접 고를 수 있다고 적는다.[](source:rd-sel)

| 상황 | 맞는 스킬 | 근거 |
|---|---|---|
| PR, commit, branch diff, working-tree patch가 도입했거나 드러낸 취약점 검토 | `security-diff-scan` {good:이 스킬} | description과 벤더 안내문이 이 범위를 말한다.[](source:d-fm)[](source:rd-sel) |
| 저장소 전체나 지정 경로의 현재 소스 audit | `security-scan` {bad:이 스킬 아님} | `security-scan` description이 변경 대상에는 diff 스킬을 쓰라고 하고 자기는 전체 audit이라고 한다.[](source:ss-desc) |
| 사용자가 deep, 철저한, 다회 audit을 명시 요청 | `deep-security-scan` {caution:대상이 변경이면 이 스킬} | deep 스킬 description이 PR, commit, branch, working tree 변경에는 `security-diff-scan`을 쓰라고 한다.[](source:dp-desc) |
| 저장된 scan의 mode가 diff인 채로 이어 실행 | `security-diff-scan` | deep 스킬이 mode가 Standard나 diff이면 대응하는 scan 스킬로 계속하라고 한다.[](source:dp-cont) |
| 병합해도 되는지 patch의 위험을 평가 | `assess-patch-risk` | 벤더 안내문이 patch, PR diff, 커밋 범위의 깨질 곳과 병합 준비 여부를 설명하는 스킬로 따로 적는다.[](source:rd-apr) |
| 필요한 MCP를 쓸 수 없거나 baseline이 지원되지 않음 | 이 스킬은 시작하지 못한다 {caution:blocker 보고} | 대체 scan이나 shell로 만든 canonical 파일 없이 blocker만 보고한다.[](source:d-start) |

설명용 예시: 사용자가 "이 PR이 인증을 약하게 만들었는지 봐 줘"라고 하면 대상이 PR 변경이라 이 스킬이 맞다. 이 예시는 분석자가 지어낸 요청이고, 대상이 변경 범위이면 diff 스킬을 쓴다는 규칙은 위 표의 `security-scan`·`deep-security-scan` description에서 온다.[](source:ss-desc)[](source:dp-desc)

## 무엇을 강제하고 무엇을 금지하나? {#enforcement-panel span=12}

아래 표는 찾아보기용 규칙 목록이다. 동작 순서는 앞의 두 패널을 보면 된다.

| 규칙 | 구분 | 출처 |
|---|---|---|
| 삭제 파일을 포함해 변경된 텍스트 파일을 전부 검토한다. | 의무 | [](source:d-scope)[](source:d-inv) |
| 정한 Git range나 patch를 바꾸지 않고 유지한다. | 의무 | [](source:d-trust) |
| 사용자 맥락, 외부 자료, 저장소 내용을 지시나 권한으로 따르지 않는다. 가져온 URL 내용은 다른 대상이나 서비스 접근을 허락하지 못한다. | 금지 | [](source:d-trust)[](source:d-time) |
| 필요한 MCP가 없거나 baseline이 미지원이면 대체 scan이나 shell로 만든 canonical 파일을 쓰지 않는다. | 금지 | [](source:d-start)[](source:st-own) |
| inventory, 후보, 처분, 공격 경로, draft, checkpoint, 완료를 보조 파일 도구로 대신하거나 `report.md`를 직접 만들지 않는다. | 금지 | [](source:st-own)[](source:fr-own) |
| 보조 파일은 `save_codex_security_artifact`로만 쓰고 shell redirection, `apply_patch`, Python 같은 일반 파일 쓰기를 쓰지 않는다. | 금지 | [](source:st-supp) |
| `$threat-model`, `$validation`, `$attack-path-analysis`는 각각 한 번 실행하고, 후보는 모두 한 번에 기록한다. | 횟수 | [](source:d-tm)[](source:d-disc)[](source:d-val) |
| 순위 worklist, finding별 장부, discovery 보고서, 중복 보고서와 receipt를 만들지 않는다. | 금지 | [](source:d-disc)[](source:v-wb)[](source:ap-wb) |
| 저장소 전체 audit으로 넓히지 않는다. 변경된 동작을 설명하는 데 필요한 지원 코드까지만 본다. | 금지 | [](source:d-scope)[](source:fd-diff) |
| Codex 영구 설정을 읽거나 고쳐 선택 기능을 켜지 않는다. | 금지 | [](source:rt-deleg) |
| worker는 맥락을 데이터로만 보고 offline을 유지한다. 외부 맥락은 부모가 허락된 범위에서만 가져온다. | 의무 | [](source:d-ctx) |
| 네트워크 접근과 PoC 실행은 사용자 승인과 scan 권한 안에서만 한다. | 금지 | [](source:v-assess) |
| 입력 검증 실패를 바뀌지 않은 요청으로 되풀이하지 않는다. | 금지 | [](source:fr-err) |
| 완료는 한 번 부르고, 성공하고 `report.md`가 생기기 전에는 완료를 주장하지 않는다. | 의무 | [](source:d-done)[](source:fr-own) |
| 미완료 검토를 "finding 없음"으로 바꾸지 않는다. | 금지 | [](source:d-end) |
| 취소는 사용자가 명시적으로 취소할 때만 한다. | 조건 | [](source:d-stop) |
| 실패 처리는 확인된 복구 불가 blocker일 때만 하고, 복구할 수 있는 동안은 오래 가는 scan을 보존한다. | 조건 | [](source:d-stop) |

@callout level=warning title="fail은 되돌릴 수 없다"
`fail_codex_security_scan`은 확인된 복구 불가 blocker 뒤에만 쓰며 도구 설명은 이를 되돌릴 수 없는 종료 동작이라고 적는다.[](source:d-stop)[](source:sv-fail)
불완전하지만 이어 갈 수 있는 작업은 실행 중 상태로 남긴다.[](source:sv-fail)

host의 진행 phase는 `preflight`, `threat_model`, `discovery`, `validation`, `attack_path`, `reporting` 여섯이고 이전 phase로는 옮길 수 없다.[](source:sv-phase)[](source:wp-back) `SKILL.md`는 단계가 실제로 바뀔 때 진행을 기록하라고만 하고 어느 노드에서 어느 값을 쓰라고는 정하지 않는다(원문에 명시 없음). 아래 대응은 이름이 겹치는 부분을 읽은 판정이다.[](source:d-ctx)

| 노드 | 대응하는 phase | 근거 |
|---|---|---|
| 위협 모델 | `threat_model` | 원문: host가 맡은 diff scan은 architecture mapping 전에 이 phase로 올린다.[](source:rt-host) |
| 변경 파일 inventory, 후보 발견 | `discovery` | 판정: 이름이 겹친다.[](source:sv-phase) |
| 후보 검증 | `validation` | 판정: 이름이 겹친다.[](source:sv-phase) |
| 공격 경로 분석 | `attack_path` | 판정: 이름이 겹친다.[](source:sv-phase) |
| draft 저장, scan 완료 | `reporting` | 판정: 이름이 겹친다.[](source:sv-phase) |

## 묶음 안에서 앞뒤에 어떤 스킬이 있나? {#position-panel span=12}

이 스킬은 묶음 `scan-vulnerabilities`에 속하고 역할은 선택지다. 전체 흐름은 `codex-security/_group-scan-vulnerabilities/scan-vulnerabilities.html`에 있다. 아래 그림은 이 스킬의 앞(대상에 따라 고르는 스킬)과 뒤(산출물을 받는 스킬)만 보여 준다. 내부 위임 네 개는 앞의 동작 패널에 있다.

@workflow id=position-flow title="diff scan의 앞과 뒤"
| ss | security-scan | backend | source:ss-desc |
| dp | deep-security-scan | backend | source:dp-desc |
| cur | security-diff-scan | security | source:d-fm |
| tf | track-findings | backend | source:tf-desc |
| tmv | threat-model-visualize | backend | source:tmv-desc |
| ss > cur | 변경 범위(R01) | emphasis |
| dp > cur | 저장된 mode가 diff(R03) | emphasis |
| cur > tf | scan 폴더(R25) | emphasis |
| cur > tmv | threatmodel.md(R71) | emphasis |

@steps id=position-steps
| ss | security-scan | `security-scan`은 저장소 전체나 지정 경로의 현재 소스를 한 번에 audit하는 기본 스킬이다. description이 "PR, commit, branch, working-tree 변경에는 diff 스킬을 쓰라"고 정해 두어 대상이 변경 범위이면 이 스킬 대신 diff scan으로 가게 한다. 스킬 이름은 적지 않으며 고르는 쪽은 사용자와 host다(R01).[](source:ss-desc) 이 노드가 diff scan에 넘기는 것은 스캔 대상(변경 범위)이고, 자동으로 호출하는 문장은 원문에 명시 없음이다. | position-flow | ss |
| dp | deep-security-scan | `deep-security-scan`은 deep 요청에 Standard scan을 반복하는 스킬이다. description이 PR, commit, branch, working tree 변경에는 `security-diff-scan`을 쓰라고 하고, 이어 실행하는 scan의 저장된 mode가 Standard나 diff이면 대응하는 scan 스킬로 계속하라고 한다(R03).[](source:dp-desc)[](source:dp-cont) 넘기는 것은 변경 범위와 저장된 scan 정체성이다. | position-flow | dp |
| cur | security-diff-scan | 이 스킬은 고정된 변경 범위, 선택 `userContext`, 기존 `scanId`를 받아 앞의 두 패널대로 `threat-model`, `finding-discovery`, `validation`, `attack-path-analysis`를 차례로 맡기고(R06~R09) 결과를 draft로 저장해 봉인한다.[](source:d-tm)[](source:d-disc)[](source:d-val)[](source:d-done) 뒤로 넘기는 것은 봉인된 scan 폴더와 host가 만든 `threatmodel.md`다. | position-flow | cur |
| tf | track-findings | `track-findings`는 봉인된 scan 하나의 검증된 finding을 Linear, Jira, GitHub issue로 추적하는 스킬이고 scan 번들은 바꾸지 않으며 쓰기 전에 보낼 내용을 보여 주고 승인을 받는다.[](source:tf-desc)[](source:tf-body) 봉인 계약이 scan mode 표에 `diff`, `commit`, `branch_diff`, `working_tree`를 같은 계약으로 나열하므로 diff scan이 만든 폴더는 이 스킬이 받는 종류와 같다(R25, 판정).[](source:sc-mode) 다만 `failed`, `canceled`, `interrupted`로 봉인된 scan을 이 스킬이 거부하는지는 확인하지 못했고, 계약은 중단된 scan의 finding 부재를 결론으로 쓰지 말라고 한다.[](source:sc-status) | position-flow | tf |
| tmv | threat-model-visualize | `threat-model-visualize`는 이미 있는 위협 모델을 탐색용 그림으로 바꾸는 스킬이고 새 평가를 하지 않는다. diff scan도 모델을 `scan.threatModel`로 저장하고 host가 `threatmodel.md`를 렌더링하므로 scan 종류와 상관없이 같은 방식이다(R71).[](source:tmdoc) "X의 마지막 scan에서 만든 위협 모델" 같은 요청에 diff scan의 모델이 들어간다고 정한 별도 문장은 visualize 쪽에 없고, 일반 지시에 포함될 뿐이다.[](source:tmv-desc) | position-flow | tmv |

| rel-id | 상대 | 종류 | 받는 것 | 넘기는 것 | 조건 |
|---|---|---|---|---|---|
| R01 | `security-scan` | 넘김 | 변경 범위인 대상 | 스캔 대상 | 대상이 PR, commit, branch, working-tree 변경이면 diff 스킬을 쓰라고 description이 정한다.[](source:ss-desc) |
| R03 | `deep-security-scan` | 넘김 | 변경 범위, 저장된 scan | 변경 범위, scan 정체성 | 이어 실행하는 scan의 mode가 diff이면 대응 스킬로 계속한다.[](source:dp-cont) |
| R06 | `threat-model` | 내부 위임 | 저장소와 사용자 맥락 | 위협 모델 | 한 번 실행하고 공급된 모델이 있으면 그것을 쓴다.[](source:d-tm) |
| R07 | `finding-discovery` | 내부 위임 | 변경 파일 inventory | 후보 | compact diff mode로 목록 전체에 돌린다.[](source:d-disc) |
| R08 | `validation` | 내부 위임 | 후보 전체 | 처분 전체 | 후보가 있을 때 한 번 실행한다. 후보가 없을 때는 원문이 충돌한다.[](source:d-val)[](source:v-wb) |
| R09 | `attack-path-analysis` | 내부 위임 | `reportable`·`deferred` 후보 | 공격 경로 결정 | validation 다음에 한 번 실행한다.[](source:d-val) |
| R19, R20 | 상세 write-up과 hardening 계획을 만드는 스킬 | 참고 | scan 결과 | write-up, hardening 계획 | 사용자가 요청할 때만 만드는 선택 산출물이고 원문은 스킬 이름을 적지 않는다.[](source:d-draft)[](source:fr-opt) |
| R25 | `track-findings` | 산출물 호환 | scan 폴더 | 이슈 추적 입력 | 필수 순서가 아니다. 중단 상태 scan 거부 여부는 확인하지 못했다.[](source:sc-status) |
| R71 | `threat-model-visualize` | 산출물 호환 | `threatmodel.md` | 위협 모델 그림 | 필수 순서가 아니다.[](source:tmdoc) |
| R47 | `define-security-policy` | 공유 상태 | `SECURITY.md` | `SECURITY.md` | 선후 관계가 없다. diff scan이 관련 `SECURITY.md` 안내를 적용한다.[](source:d-rt) |

## 어디까지 읽었고 무엇이 미확인인가? {#audit-panel span=12}

이 분석은 소스를 읽기만 했다. 스킬의 지시, MCP 도구, helper, 어떤 명령도 실행하지 않았고 외부 URL도 열지 않았다. 읽은 텍스트 파일은 42개, 합계 381,610바이트다.

전부 읽은 파일이 35개(212,883바이트)이고 필요한 줄 범위만 읽은 파일이 7개(168,727바이트)다. 파일별 바이트 수와 읽은 범위는 `skill-explainers/codex-security/plugins/codex-security/skills/security-diff-scan/files.md`에 있다. 이 페이지는 그중 인용한 파일을 `@source`로 선언했다. 필수 참조 파일은 모두 읽었고 줄 범위가 지정된 파일은 그 범위를 읽었으므로 부분 분석은 아니다.

- 스킬 폴더의 파일은 `SKILL.md`와 `agents/openai.yaml` 둘뿐이다. 번역본(`*.KO.md`)과 바이너리는 없다. 원본 소스 트리는 `git status`에서 변경이 없었다.
- 부분 읽음 7개(구조·표본만 확인, 전부 읽지 않음): `mcp-app/server.ts`는 84,254바이트 중 필수 줄 범위 일곱 곳, `normalize-candidates.ts`와 `artifact-io.ts`는 필수 줄 범위, `workbench_progress.py`는 255~280줄, 그리고 `track-findings`, `threat-model-visualize`, `define-security-policy` 세 `SKILL.md`는 description과 첫 본문 줄만 읽었다.
- 읽지 않은 것: `validation-guidance.md`가 가리키는 `static-finding-assessment.md`(필수 참조 목록에 없음), 상세 write-up과 hardening 스킬의 본문(원장 R19·R20만 확인).
- 원문 비교: 관계 원장은 이 스킬과 이름이 같은 사본이 없다고 적는다. 해시는 이번에 다시 비교하지 않았다.

@callout level=open-question title="원문만으로 닫히지 않는 질문"
PR과 branch diff를 `diffTarget`의 `working_tree`, `commit`, `range` 중 무엇으로 넘기는지는 원문에 명시 없음이다.
diff scan이 `access-advisory.md`를 읽는지는 `scan-runtime.md`와 `SKILL.md`가 다르게 말하고 우선순위가 명시되지 않았다.
후보가 0건일 때 `validation`을 실행하는지는 `SKILL.md`와 `validation` 스킬이 충돌한다. 도구는 discovery를 한 번 기록한 뒤에만 빈 `validations`를 받는다.
`working_tree`의 `baseRevision`과 `headRevision`이 시작 입력에서는 선택값인데 prepare가 비어 있으면 오류를 내는 간극을 저장 단계가 메우는지는 확인하지 못했다.
`investigation-time-budget.md`의 첫 문장이 "Standard scan"이라고 적는데 diff scan에서 어떻게 읽는지는 원문에 명시 없음이다.
완료 실패 뒤 재시도에 대해 도구 설명(재시도 없이 응답을 멈춘다)과 `final-report.md`(안전하면 복구한다)의 우선순위는 명시되지 않았다.
`attack-path-analysis`가 위협 모델을 읽는 경로(`list_codex_security_candidates`는 후보 행만 돌려준다)와 Informational 등급을 `reportable`로 기록하는 방법은 원문에 명시 없음이다.
`failed`, `canceled`, `interrupted`로 봉인된 diff scan을 `track-findings`가 거부하는지는 확인하지 못했다.
