# 취약점 scan은 대상에 따라 어느 스킬이 맡고, 단계 스킬은 어떤 순서로 이어지나? {#scan-vulnerabilities-page}

이 묶음은 소스에서 공격자가 실제로 악용할 수 있는 취약점을 찾고, 후보를 검증하고, 공격 경로로 보고 여부를 정하는 scan 작업을 위한 것이다. 대상이 저장소 전체나 지정 경로의 현재 소스이면 `security-scan`, PR·commit·branch·working-tree 변경이면 `security-diff-scan`, 사용자가 deep scan을 명시했으면 `deep-security-scan`이 맡는다.[](source:ss-desc)[](source:ds-desc)[](source:dp-desc)

- 단계 스킬 네 개를 정해진 순서로 맡기는 곳은 `security-diff-scan` 하나다. `threat-model`을 한 번, `finding-discovery`를 compact diff mode로, 후보가 있으면 `validation`을 한 번, `reportable`이나 `deferred` 후보에는 `attack-path-analysis`를 한 번 맡긴다.[](source:ds-1)[](source:ds-3)[](source:ds-4)
- Standard와 Deep은 단계 스킬을 부르지 않는다. 발견, 검증, 공격 경로 추론을 `core-scan.md` 한 문서의 감사 절차 안에서 끝낸다.[](source:cs-no)[](source:tm-intro)
- 선택 기준은 `security-scan` description이 적는다. 사용자는 요청에 스킬 이름을 넣어 직접 고를 수도 있다. 예외로 `deep-security-scan`이 이어 실행하는 scan의 저장된 모드가 Standard나 diff이면 대응하는 scan 스킬로 계속한다.[](source:ss-desc)[](source:readme)[](source:dp-1)
- 원문이 충돌하는 곳이 둘 있다. 후보가 0개일 때 `validation`을 부르는지, `threat-model`의 "primary trigger 금지" 문장과 diff scan의 호출이 어떻게 맞물리는지다. 둘 다 우선순위가 원문에 없어 충돌 그대로 보여 준다.[](source:ds-4)[](source:val-wb)[](source:tm-desc)

@answer scope="스킬 7개 · 분석 커밋 cd5035b · 호스트 도구는 소스 계약까지 확인하고 실행하지 않음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343

@source ss-desc title="security-scan description" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=3:3
@source ss-core title="security-scan 감사 방식" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=10:10
@source ss-start title="security-scan 시작 방법" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=16:17
@source ss-flow title="security-scan 진행과 완료" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=21:21
@source ds-desc title="security-diff-scan description" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=3:3
@source ds-intro title="security-diff-scan 범위" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=8:8
@source ds-set title="security-diff-scan 준비" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=12:16
@source ds-ctx title="security-diff-scan phase와 context 갱신" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=20:20
@source ds-inv title="security-diff-scan inventory 범위" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=24:26
@source ds-1 title="security-diff-scan threat-model 위임" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=28:28
@source ds-2 title="security-diff-scan 변경 파일 목록" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=29:29
@source ds-3 title="security-diff-scan finding-discovery 위임" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=30:30
@source ds-4 title="security-diff-scan validation과 attack-path 위임" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=31:31
@source ds-5 title="security-diff-scan draft 저장" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=32:32
@source ds-6 title="security-diff-scan 완료" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=33:33
@source ds-end title="security-diff-scan 종료 조건" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=35:35
@source dp-desc title="deep-security-scan description" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=3:3
@source dp-lead title="deep-security-scan 반복 실행" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=8:8
@source dp-1 title="deep-security-scan 대상과 이어 실행" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=10:10
@source dp-2 title="deep-security-scan 설정 확인" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=11:11
@source dp-3 title="deep-security-scan 다른 Deep scan 확인" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=12:12
@source dp-4 title="deep-security-scan 시작과 취소" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=13:13
@source dp-5 title="deep-security-scan 완료 보고" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=14:14
@source tm-desc title="threat-model description" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=3:3
@source tm-intro title="threat-model의 Standard·Deep 안내" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=8:8
@source tm-sel title="threat-model 모델 선택" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=14:17
@source tm-ret title="threat-model 결과 보관" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=25:27
@source fd-desc title="finding-discovery description" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=3:3
@source fd-intro title="finding-discovery 입력 근거" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=8:8
@source fd-sel title="finding-discovery workflow 선택" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=14:18
@source fd-rep title="finding-discovery 병합과 반복 금지" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=27:31
@source val-desc title="validation description" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=3:3
@source val-int title="validation의 Standard·Deep 안내" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=21:21
@source val-wb title="validation의 compact diff 제출" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=25:30
@source ap-desc title="attack-path-analysis description" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=3:3
@source ap-in title="attack-path-analysis 입력" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=12:14
@source ap-int title="attack-path-analysis의 Standard·Deep 안내" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=27:27
@source ap-wb title="attack-path-analysis의 compact diff 제출" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=31:36
@source readme title="벤더의 스킬 선택 안내" path=codex-security/plugins/codex-security/skills/README.md lines=3:9
@source res-draft title="첫 draft 저장" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md lines=7:11
@source res-done title="manifest와 findings 확인" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md lines=13:15
@source mg-prog title="phase 올리는 시점" path=codex-security/plugins/codex-security/skills/security-scan/references/managed-scan.md lines=9:9
@source cs-base title="core-scan 대상 확인과 baseline 감사" path=codex-security/plugins/codex-security/references/core-scan.md lines=9:10
@source cs-tm title="core-scan 위협 모델 단계" path=codex-security/plugins/codex-security/references/core-scan.md lines=11:11
@source cs-pkt title="core-scan 조사 packet과 위임" path=codex-security/plugins/codex-security/references/core-scan.md lines=12:13
@source cs-ckpt title="core-scan 후보 checkpoint" path=codex-security/plugins/codex-security/references/core-scan.md lines=14:14
@source cs-val title="core-scan 검증과 조립" path=codex-security/plugins/codex-security/references/core-scan.md lines=15:16
@source cs-no title="core-scan 단계 스킬 금지" path=codex-security/plugins/codex-security/references/core-scan.md lines=18:18
@source cs-sev title="core-scan 심각도" path=codex-security/plugins/codex-security/references/core-scan.md lines=34:36
@source bl-no title="baseline 감사 금지 목록" path=codex-security/plugins/codex-security/references/baseline-auditor.md lines=16:16
@source fi-no title="집중 조사 금지 목록" path=codex-security/plugins/codex-security/references/focused-investigator.md lines=11:11
@source vs-3 title="Standard의 후보 검증 기준" path=codex-security/plugins/codex-security/references/validate-scan-findings.md lines=3:3
@source sr-rt title="worker 위임과 parent 대체" path=codex-security/plugins/codex-security/references/scan-runtime.md lines=3:7
@source aa-adv title="access advisory 규칙" path=codex-security/plugins/codex-security/references/access-advisory.md lines=3:11
@source sr-adv title="diff scan의 access advisory 지시" path=codex-security/plugins/codex-security/references/scan-runtime.md lines=13:13
@source sa-model title="위협 모델 경로" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=28:29
@source sa-deep title="Deep의 Standard 반복과 병합" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=37:39
@source sa-compact title="compact diff 산출물" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=41:49
@source as-own title="scan 소유와 구조화 결과" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=7:9
@source as-supp title="보조 파일 도구와 threatmodel.md" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=13:13
@source as-cache title="위협 모델 cache" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=49:53
@source fr-own title="제출과 완료 소유자" path=codex-security/plugins/codex-security/references/final-report.md lines=5:16
@source fr-map title="diff 후보 결과 매핑" path=codex-security/plugins/codex-security/references/final-report.md lines=42:49
@source sc-seal title="봉인 문서 구성" path=codex-security/plugins/codex-security/references/scan-contract.md lines=9:14
@source sc-status title="scan.status 값" path=codex-security/plugins/codex-security/references/scan-contract.md lines=30:41
@source sc-mode title="scan.mode 값" path=codex-security/plugins/codex-security/references/scan-contract.md lines=122:132
@source sc-tm title="scan.threatModel 보존" path=codex-security/plugins/codex-security/references/scan-contract.md lines=173:173
@source tmd-draft title="위협 모델 draft 저장 계약" path=codex-security/plugins/codex-security/references/threat-model.md lines=40:42
@source pro-27 title="Deep 코디네이터의 phase 소유" path=codex-security/plugins/codex-security/references/scan-prologue.md lines=27:27
@source srv-diff title="diffTarget 입력 schema" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=103:120
@source srv-deep title="Deep 시작 도구의 scope 검사" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=930:934
@source ct-prep title="변경 파일 목록 도구 등록" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=81:92
@source ct-rec title="후보 기록 도구 등록" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=109:121
@source ct-val title="검증 기록 도구 등록" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=138:150
@source ct-ap title="공격 경로 기록 도구 등록" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=153:165
@source led-val title="검증 누락과 중복 거부" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=39:77
@source led-ap title="공격 경로 자격 검사" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=117:141
@source disc-rec title="후보 기록" path=codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts lines=56:100
@source disc-list title="후보 목록 읽기" path=codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts lines=180:193
@source inv-diff title="diff 변경 범위 검사" path=codex-security/plugins/codex-security/mcp-app/src/artifact-inventory.ts lines=54:79
@source io-src title="artifact 파일 없음 오류" path=codex-security/plugins/codex-security/mcp-app/src/artifact-io.ts lines=82:97
@source cand-in title="후보 입력 칸" path=codex-security/plugins/codex-security/mcp-app/src/artifact-contracts.ts lines=75:82
@source norm title="후보 병합 기준과 ID" path=codex-security/plugins/codex-security/mcp-app/src/helpers/normalize-candidates.ts lines=341:365
@source norm-key title="후보 병합 key" path=codex-security/plugins/codex-security/mcp-app/src/helpers/normalize-candidates.ts lines=389:398
@source tm-doc title="threatmodel.md 생성" path=codex-security/plugins/codex-security/mcp-app/src/threat-model-document.ts lines=33:70
@source tm-render title="Saved Model Context footer" path=codex-security/plugins/codex-security/mcp-app/src/threat-model-render.ts lines=143:156
@source coord-stop title="Deep 중단 조건" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=847:864
@source coord-prev title="이전 finding 전달과 배정 수" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=867:877
@source coord-dead title="Deep 마감 계산" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=575:587
@source exe-skill title="Deep worker의 skill 읽기 지시" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/executor.ts lines=478:490
@source tpl-core title="Deep worker prompt" path=codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md lines=7:13
@source deep-def title="Deep 번들 기본값" path=codex-security/plugins/codex-security/scripts/deep_scan_defaults.json lines=1:8
@source ph-const title="진행 phase 목록" path=codex-security/plugins/codex-security/scripts/workbench_constants.py lines=7:7
@source ph-back title="이전 phase 거부" path=codex-security/plugins/codex-security/scripts/workbench_progress.py lines=268:268
@source sch-val title="validations 배열 schema" path=codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json lines=13:18
@source tf-read title="track-findings 입력" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=8:8
@source tri-in title="triage-finding의 findings.json 입력" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=7:12
@source vis-in title="threat-model-visualize 기본 입력" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=10:10

## 요청 대상에 따라 어느 scan 스킬을 쓰나? {#choose span=12}

에이전트는 요청이 변경분인지, deep을 명시했는지에 따라 세 스킬 중 하나로 간다. 어느 스킬을 쓸지는 사용자와 호스트가 정하고, 요청에 `$security-diff-scan`처럼 스킬 이름을 넣어 직접 고를 수도 있다.[](source:readme) 판정: 세 스킬은 서로를 대신하지 않고 대상 범위로 나뉜 대안이다. 근거는 `security-scan` description이 diff와 deep 스킬을 쓸 조건을 적어 놓은 것이다.[](source:ss-desc)

@workflow id=scan-choice title="scan 요청 대상에 따른 스킬 선택"
| c-req | scan 요청 | external |
| c-chg | 변경분이 대상인가? | backend |
| c-dq | deep을 명시했는가? | backend |
| c-std | security-scan | backend | source:ss-desc |
| c-diff | security-diff-scan | backend | source:ds-desc |
| c-deep | deep-security-scan | backend | source:dp-desc |
| c-req > c-chg | |
| c-chg > c-diff | 예 | emphasis |
| c-chg > c-dq | 아니오 |
| c-dq > c-deep | 예 |
| c-dq > c-std | 아니오 | emphasis |
| c-deep > c-diff | 이어 실행, 저장 모드 diff |
| c-deep > c-std | 이어 실행, 저장 모드 Standard |

@steps id=choose-steps
| ch-req | scan 요청 | 에이전트는 사용자나 호스트가 넘긴 scan 요청에서 대상이 무엇인지 읽는다. 원장은 스킬을 고르는 주체를 사용자와 호스트로 적었다(R01, R02). 원문에서 직접 확인되는 것은 README의 안내와 description이 쓸 조건을 적는다는 점이다. `security-scan` description은 diff 스킬과 deep 스킬을 쓸 조건만 적고 두 스킬의 이름은 적지 않는다. 이름을 직접 적는 곳은 deep 스킬 description의 `security-diff-scan` 한 군데다.[](source:ss-desc)[](source:dp-desc) | scan-choice | c-req |
| ch-chg | 변경분이 대상인가? | 에이전트는 대상이 PR, commit, branch diff, working-tree patch 같은 변경분인지 먼저 본다. 변경분이면 `security-scan` description이 diff 스킬을 쓰라고 하고(R01 넘김, 명시-역할), deep 스킬 description도 같은 변경에는 `security-diff-scan`을 쓰라고 이름까지 적는다(R03 넘김, 명시-이름).[](source:ss-desc)[](source:ds-desc)[](source:dp-desc) 판정: 사용자가 deep을 요청했어도 대상이 변경분이면 diff 스킬이 먼저라고 읽힌다. 근거는 deep description의 마지막 문장이다. 변경 범위를 도구에 넘길 때 `diffTarget.kind`는 `working_tree`, `commit`, `range` 세 가지뿐이다. PR이나 branch diff를 어느 kind로 넘기는지는 원문에 명시 없음이다.[](source:srv-diff) | scan-choice | c-chg |
| ch-dq | deep을 명시했는가? | 변경분이 아니면 에이전트는 사용자가 deep, exhaustive, multi-pass audit을 요청했는지 본다. `security-scan` description은 deep 스킬을 "an explicitly requested deep scan"에만 쓰라고 하므로(R02 넘김, 명시-역할) 명시하지 않았으면 기본 단일 pass로 간다.[](source:ss-desc)[](source:dp-desc) 호스트가 요청 문장에서 deep 의도를 어떻게 알아보는지는 원문에 명시 없음이다. | scan-choice | c-dq |
| ch-std | security-scan | 에이전트는 저장소 전체나 지정 경로의 현재 소스를 한 번의 audit로 점검한다. 목표는 공격자가 실제로 악용할 수 있는 취약점이고, 감사 절차는 `core-scan.md`를 따른다.[](source:ss-desc)[](source:ss-core) 시작할 때는 SDK가 준 scan이 있으면 그것을 쓰고, 없으면 managed 도구로 Standard scan을 열고 소스 검토를 시작한다.[](source:ss-start) 내부 규칙은 `skill-explainers/codex-security/plugins/codex-security/skills/security-scan/security-scan.html`에 있다. | scan-choice | c-std |
| ch-diff | security-diff-scan | 에이전트는 변경 파일 전체를 단계 스킬 네 개에 맡겨 점검한다. 변경된 동작을 따라 지원 코드까지 보되 관련 없는 저장소 감사로 넓히지 않는다.[](source:ds-intro) 순서와 내부 위임은 다음 패널에서 그린다. 내부 규칙은 `skill-explainers/codex-security/plugins/codex-security/skills/security-diff-scan/security-diff-scan.html`에 있다. | scan-choice | c-diff |
| ch-deep | deep-security-scan | 호스트가 Standard 감사를 반복 실행해 결과를 병합하고, 연속 audit가 새 결과를 더하지 못하거나 설정된 scan 또는 시간 한도에 닿으면 멈춘다.[](source:dp-lead) 새 대상이면 `inspect_codex_security_setup`으로 effective settings와 출처를 사용자에게 보인다. 새로 시작한 native scan에 다른 Deep scan이 실행 중이면 그 대상과 phase를 보이고 Cancel(Recommended)과 Continue를 묻는다. 사용자가 명시로 고를 때까지 기다리고, 대화창을 닫는 것은 취소가 아니다.[](source:dp-2)[](source:dp-3) 이어 실행이면 `get_codex_security_scan_context`로 저장된 정체성과 범위를 쓰고 저장 모드가 Standard나 diff이면 대응하는 scan 스킬로 계속한다. Standard 쪽 대응 스킬 이름은 원문에 명시 없음이다(R03, R04).[](source:dp-1) 도구는 새 대상에 `scope: "."`만 받는다.[](source:srv-deep) 번들 기본값은 worker 4, subagents 3, 새 결과 없는 연속 audit 4, 연속 오류 3, 총 배정 40회, 96시간이다.[](source:deep-def) 판정: 이 값들은 기본값이고 effective settings 확인 단계에서 달라질 수 있다. 근거는 스킬이 설정과 그 출처를 보이라고 하는 것이다. 내부 규칙은 `skill-explainers/codex-security/plugins/codex-security/skills/deep-security-scan/deep-security-scan.html`에 있다. | scan-choice | c-deep |

그림은 선택 기준만 보여 준다. 그림에서 뺀 것은 Deep이 Standard 감사를 반복하는 규칙(R05)이고, 아래 표에 남겼다. `이어 실행` 간선 두 개는 deep 스킬이 이미 만들어진 scan을 이어 갈 때만 해당하며 새 요청의 선택지가 아니다.

세 스킬의 description 원문은 다음과 같다. 순서는 `security-scan`, `security-diff-scan`, `deep-security-scan`이다.

@code source=ss-desc language=yaml
@code source=ds-desc language=yaml
@code source=dp-desc language=yaml

| rel-id · 종류 | 조건과 강도 | 그림 반영 |
| --- | --- | --- |
| R01 · 넘김 | 대상이 PR, commit, branch, working-tree 변경이면 diff 스킬을 쓰라고 description이 정한다. 사용자와 호스트가 고른다.[](source:ss-desc)[](source:ds-desc)[](source:readme) | 표시 |
| R02 · 넘김 | 사용자가 deep scan을 명시했을 때만 deep 스킬을 쓰라고 한다.[](source:ss-desc)[](source:dp-desc) | 표시 |
| R03 · 넘김 | deep description이 변경분에는 `security-diff-scan`을 쓰라고 하고, 이어 실행하는 scan의 저장 모드가 diff이면 대응 scan 스킬로 계속한다.[](source:dp-desc)[](source:dp-1) | 표시 |
| R04 · 넘김 | 이어 실행하는 scan의 저장 모드가 Standard이면 "the corresponding scan skill"로 계속한다.[](source:dp-1) | 표시 |
| R05 · 참고 | 호스트가 Standard 감사를 반복하고 배정 상한, 새 결과 없는 연속 횟수, 마감에 닿으면 멈춘다.[](source:dp-lead)[](source:coord-stop) | 생략(아래 표) |

R05는 그림에 넣지 않았다. 반복은 스킬 사이의 호출이 아니라 호스트 코디네이터의 동작이기 때문이다. 다음 표가 그 내용을 풀어 둔다.

| 항목 | 내용 |
| --- | --- |
| 중단 조건 | 마감에 닿았거나, 새 결과 없는 연속 횟수가 `stopAfterNoNew`(기본 4)에 닿았거나, 배정 수가 `maxDiscoveryRuns`(기본 40)에 닿으면 멈춘다.[](source:coord-stop)[](source:deep-def) |
| 중단 이유 라벨 | 마감에 닿지 않고 연속 횟수 조건으로 멈추면 `saturated`, 그 밖에는 `capped`이다.[](source:coord-stop) |
| 배정 수 | batch를 배정하는 시점에 `min(workers, maxDiscoveryRuns - dispatched)`만큼 늘기 때문에 나중에 실패한 worker도 이미 센 값이다.[](source:coord-prev) |
| 총 상한 | `max_discovery_runs`는 함께 도는 Standard scan까지 센 총 횟수 상한이다.[](source:dp-2) |
| 마감 | scan 생성 시각부터 잰다.[](source:coord-dead) |
| 다음 pass 입력 | 이미 보고된 finding을 `경로:줄 제목` 문자열로 넘긴다.[](source:coord-prev) |
| worker 협업 | worker는 peer note로 단서를 나누고, 템플릿은 peer note를 믿지 말고 증거를 직접 확인하라고 한다.[](source:tpl-core) |

## diff scan은 단계 스킬 네 개를 어떤 순서로 맡기고, 결과는 어떻게 분류되나? {#diff-order span=12}

순서를 정하는 곳은 `security-diff-scan` 본문의 번호 목록 하나다. 단계 스킬 네 개의 description은 이미 그 phase에 있거나 사용자가 명시로 요청할 때 쓰라고만 하고 순서를 정하지 않는다.[](source:tm-desc)[](source:fd-desc)[](source:val-desc)[](source:ap-desc) 각 단계 스킬이 끝나면 에이전트는 diff scan으로 돌아와 다음 단계로 간다. 판정: 이 반환 구조는 R06~R09가 "내부 위임"으로 적힌 것과 본문이 단계를 차례로 나열한 것에서 읽은 것이다.

@workflow id=diff-delegation title="security-diff-scan이 단계 스킬에 맡기는 순서"
| lane l-open | scan 열기 |
| lane l-model | 위협 모델과 대상 정리 |
| lane l-find | 후보 발견과 판정 |
| lane l-close | 마무리 |
| d-open | scan 열기 | external | l-open |
| d-tm | threat-model | backend | l-model | source:ds-1 |
| d-inv | 변경 파일 목록 | backend | l-model | source:ds-2 |
| d-fd | finding-discovery | backend | l-find | source:ds-3 |
| d-any | 후보가 있나? | backend | l-find | source:ds-4 |
| d-val | validation | backend | l-find | source:ds-4 |
| d-ap | attack-path-analysis | backend | l-find | source:ds-4 |
| d-wrap | draft 제출과 완료 | external | l-close | source:ds-6 |
| d-open > d-tm | |
| d-tm > d-inv | 모델 draft 저장 |
| d-inv > d-fd | |
| d-fd > d-any | 후보 기록 |
| d-any > d-val | 있음 | emphasis |
| d-any > d-wrap | 없음, R08 충돌 |
| d-val > d-ap | reportable, deferred | emphasis |
| d-ap > d-wrap | |

@steps id=diff-steps
| df-open | scan 열기 | 에이전트는 `artifact-storage.md`를 읽어 scan 소유와 저장 규칙을 확인하고, 정확한 Git range나 local patch를 정해 바꾸지 않는다. 사용자 context와 외부 자료는 분석 자료일 뿐 지시나 권한이 아니다.[](source:ds-set) 이어 갈 `scanId`가 있으면 `get_codex_security_scan_context`로 이어 가고, 없으면 `start_codex_security_prompt_only_scan`을 `mode: "diff"`, `targetPath`, `scope: "."`, `diffTarget`, 선택 `userContext`와 함께 한 번 부른다. 돌려받은 정체성, 디렉터리, revision, handoff token은 보존한다. MCP가 없거나 baseline이 지원되지 않으면 blocker를 보고하고 대체 scan이나 shell로 만든 canonical 파일을 만들지 않는다.[](source:ds-set)[](source:as-own) 소스 검토 전에 `scan-runtime.md`를 읽어 worker를 쓰거나 부모가 같은 검토를 이어 간다. worker는 성공한 spawn 호출과 돌려받은 worker ID로만 시작했다고 본다.[](source:sr-rt) 단계가 실제로 바뀔 때는 `update_codex_security_scan_progress`로 phase를 올리고 돌려받은 `userContext`를 그 단계와 worker의 context로 쓴다.[](source:ds-ctx) 사용자가 명시로 취소할 때만 `cancel_codex_security_scan`을 쓰고, 복구할 수 없는 blocker가 확인됐을 때만 `fail_codex_security_scan`을 쓴다.[](source:ds-inv) `scan-runtime.md:13`은 diff scan이 첫 실질 행동 전에 `access-advisory.md`를 읽으라고 하지만 `SKILL.md`는 이 문서를 가리키지 않는다.[](source:sr-adv) 이 advisory는 scan을 허가하거나 막지 않는다.[](source:aa-adv) | diff-delegation | d-open |
| df-tm | threat-model | 에이전트는 `$threat-model`을 한 번 실행하거나 사용자가 준 모델을 쓴다(R06 내부 위임, 명시-이름). schema에 맞는 canonical `threatModel` 객체를 받으면 그대로 보존하고, 아니면 받은 텍스트나 생성한 Markdown을 `{ format: markdown, content }`와 `origin: provided` 또는 `generated`로 둔다. 모델은 사용자가 좁히라고 요청하지 않는 한 저장소 전체를 대상으로 하고, 모델의 실제 범위는 변경 파일 범위와 따로 기록한다. 모델이 정해지면 곧바로 finding 없이 `complete: false` draft로 저장한다.[](source:ds-1) 호스트는 저장된 모델로 `threatmodel.md`를 쓰며, scan이 끝나기 전에는 provisional 문구를 붙인다.[](source:tm-doc)[](source:tm-render) `threat-model` 스킬은 실행 중인 scan이면 모델 텍스트를 호출자에게 돌려주고, 공급 모델이나 비어 있지 않은 `userContext`, 좁은 범위가 있으면 공유 cache를 읽거나 바꾸지 않는다.[](source:tm-sel)[](source:tm-ret) 이 단계의 호출 방식과 `threat-model` description의 금지 문장이 어떻게 맞물리는지는 아래 충돌 callout에서 보여 준다. | diff-delegation | d-tm |
| df-inv | 변경 파일 목록 | 에이전트는 `prepare_codex_security_review_items`로 변경 파일 목록을 만들고 `list_codex_security_review_items`의 모든 page를 읽는다. 목록에는 파일 이름, 확장자, 디렉터리와 상관없이 변경된 text 파일이 든다. 추적 중인 변경은 ignored여도 범위 안이고, local patch면 ignored가 아닌 untracked 파일도 든다. 삭제된 파일은 baseline revision에서 본다.[](source:ds-inv)[](source:ds-2) 바뀌지 않은 지원 파일은 변경된 동작을 설명하는 데 필요할 때만 본다. 이 도구는 diff scan에서만 동작하고, 저장된 `diffTarget.kind`가 `working_tree`, `commit`, `range` 중 하나이며 `baseRevision`과 `headRevision`이 비어 있지 않은 문자열이어야 목록을 만든다. `working_tree`도 예외가 아니다.[](source:ct-prep)[](source:inv-diff) 시작 입력 schema에서는 `working_tree`의 두 revision이 선택값이라 저장 단계에서 채우는 코드는 읽지 않아 미확인이다.[](source:srv-diff) 목록은 discovery 디렉터리의 `in_scope_files.txt`로 남는다.[](source:disc-rec) | diff-delegation | d-inv |
| df-fd | finding-discovery | 에이전트는 `$finding-discovery`를 compact diff mode로 변경 파일 목록 전체에 실행한다. 독립 assignment는 쓸 수 있는 worker에 나누고 나머지 파일은 직접 본다. 독립적으로 취약한 instance는 따로 찾을 수 있게 유지하고, 모든 후보를 `record_codex_security_discovery_candidates`로 한 번에 기록한다. 순위 목록, finding별 장부, discovery 보고서는 만들지 않는다(R07 내부 위임, 명시-이름).[](source:ds-3)[](source:fd-sel) 이 도구는 후보 전체를 replace하므로 다시 부르면 이전 후보가 사라진다.[](source:ct-rec)[](source:disc-rec) 후보 입력 칸은 `cwe_ids`, `locations`, `summary`, `evidence`, 선택 `context`, 선택 `instance` 여섯 개뿐이다.[](source:cand-in) `candidate_id`는 호스트가 `candidate-<해시 16자>`로 붙이고, `cwe_ids`·`locations`·`instance`가 모두 같은 행만 합친다.[](source:norm)[](source:norm-key) 판정: 스킬 본문은 source, control, sink, 영향이 같으면 합치고 원래 후보 ID를 유지하라고 하므로 호스트의 병합 기준과 ID 부여 방식이 다르다.[](source:fd-rep) | diff-delegation | d-fd |
| df-any | 후보가 있나? | 에이전트는 기록된 후보가 있는지 본다. diff scan 본문은 "If candidates exist, run `$validation` once"라고만 적는다. 후보가 없을 때 무엇을 하는지는 원문에 명시 없음이다.[](source:ds-4) 그림의 `없음` 간선은 이 문장에서 읽은 판정이고, `validation`이 빈 집합에도 `validations: []`를 제출하라고 해 충돌한다(R08). 자세한 내용은 아래 callout에 있다.[](source:val-wb) | diff-delegation | d-any |
| df-val | validation | 후보가 있으면 에이전트는 `$validation`을 한 번 실행한다. `validation`은 모든 후보를 `list_codex_security_candidates`로 읽고 처분 전체를 `record_codex_security_candidate_validations` 한 번에 제출한다.[](source:ds-4)[](source:val-wb) 처분은 `reportable`, `suppressed`, `not_applicable`, `deferred` 넷이다. 도구는 기존 후보가 하나라도 빠지면 "Validation must include every existing candidate"로 거부하고, 모르는 후보나 중복된 후보도 거부한다.[](source:led-val)[](source:ct-val) 결과는 후보 ledger의 각 행에 `validation` 객체로 더해지고 도구가 후보 순서와 discovery 필드를 보존한다.[](source:sa-compact) 실제 PoC, 입력, 로그가 있을 때만 `validation_artifacts/<candidate_id>/`를 만들고 빈 폴더나 서술 보고서는 만들지 않는다(R08 내부 위임, 명시-이름).[](source:val-wb)[](source:sa-compact) | diff-delegation | d-val |
| df-ap | attack-path-analysis | 에이전트는 validation 다음에 `$attack-path-analysis`를 한 번, 처분이 `reportable` 또는 `deferred`인 후보에만 실행한다. 자격 있는 후보 결정을 모두 `record_candidate_attack_paths` 한 번에 제출하고, 이 단계에 들어갈 후보가 없으면 `attackPaths: []`를 제출한다.[](source:ds-4)[](source:ap-wb) 도구는 자격 있는 후보가 하나라도 빠지거나 자격 없는 후보가 들어오면 거부한다.[](source:led-ap)[](source:ct-ap) 결정은 `reportable`, `ignore`, `deferred` 셋이고, `reportable`의 severity는 critical, high, medium, low뿐이다.[](source:sa-compact) 스킬은 per-scan 위협 모델과 후보를 `list_codex_security_candidates`로 읽으라고 하지만 이 도구는 후보 행만 돌려준다. 판정: 위협 모델은 이 도구로 얻지 못한다. 근거는 목록 reader가 후보 ledger 행만 읽는 것이다.[](source:ap-wb)[](source:disc-list) | diff-delegation | d-ap |
| df-wrap | draft 제출과 완료 | 에이전트는 `final-report.md`를 읽고, 결정이 나올 때마다 `record_codex_security_scan_draft`로 `complete: false` checkpoint를 저장한다. 미해결 후보와 원래 근거는 `reviewState.deferred`에 남긴다. 검토가 끝나면 모델, finding, review state를 담아 `complete: true`로 한 번 제출한다.[](source:ds-5) 이어서 `complete_codex_security_scan`을 한 번 부르고 `get_codex_security_completed_scan`을 읽는다. SDK가 완료를 맡은 scan은 예외다. 완료 처리는 `report.md`와 SARIF를 만들고, 에이전트는 생성된 보고서, 실제 coverage 한계, 측정된 token 사용량, 확정 finding의 Codex review comment를 돌려준다.[](source:ds-6) 완료 처리는 빠진 단계를 대신 수행하지 않는다.[](source:fr-own) 변경된 파일과 후보는 모두 검토됨, 해결됨, 명시적 미완 중 하나로 설명돼야 하고 불완전한 검토를 "finding 없음"으로 바꾸지 않는다.[](source:ds-end) | diff-delegation | d-wrap |

그림은 핵심 순서만 보여 준다. 생략한 것은 취소와 실패 경로, 시간 allowance, 선택 산출물인 write-up과 hardening 계획이다. 산출물 호환 관계(R10~R13)는 다음 패널의 표에 남겼다. 각 단계 스킬의 내부 규칙은 `skill-explainers/codex-security/plugins/codex-security/skills/threat-model/threat-model.html`, `.../finding-discovery/finding-discovery.html`, `.../validation/validation.html`, `.../attack-path-analysis/attack-path-analysis.html`에 있다.

@callout level=open-question title="후보가 없을 때 validation을 부르는지는 원문 두 곳이 갈린다"
| `security-diff-scan` 본문은 "If candidates exist, run `$validation` once"라고 적어 후보가 없으면 실행하지 않는 것으로 읽힌다. 후보가 없을 때의 동작은 원문에 명시 없음이다.[](source:ds-4) |
| `validation`의 compact diff 절은 처분 전체를 한 번에 제출하라고 하고 빈 집합이면 `validations: []`를 제출하라고 한다. `attack-path-analysis`도 이 단계에 들어갈 후보가 없으면 `attackPaths: []`를 제출하라고 한다.[](source:val-wb)[](source:ap-wb) |
| 두 문장 사이의 우선순위는 원문에 명시 없음이다. 도구 쪽은 `validations` 배열에 `minItems`가 없고 빈 배열을 거부하는 검사도 읽지 못했다. 다만 검증 도구는 먼저 후보 ledger 파일을 읽고 파일이 없으면 "the requested artifact is unavailable"로 실패한다. 후보 기록 도구는 후보가 0건이어도 빈 파일을 쓴다.[](source:sch-val)[](source:led-val)[](source:io-src)[](source:disc-rec) 판정: discovery를 한 번 기록했다면 빈 제출이 통과하고 기록하지 않았다면 실패한다. 두 코드 경로를 합친 해석이다. |

@callout level=open-question title="threat-model의 금지 문장과 diff scan의 호출은 어떻게 맞물리나"
| `threat-model` description은 첫 조건으로 "already in the threat-modeling phase of a security scan"을 두고, 마지막 문장에서 "Do not use as the primary trigger for full PR, commit, branch, patch, or repository scans"라고 한다.[](source:tm-desc) |
| 본문은 "Standard scans and Deep workers build models within their own workflow rather than invoking this phase skill"라고 해 Standard와 Deep만 이 스킬을 부르지 않는다고 적는다. diff scan은 이 문장에 없다.[](source:tm-intro) |
| diff scan은 "Run `$threat-model` once, or use the supplied model"이라고 한다. 이 호출이 description의 첫 조건에 해당하는지, 마지막 문장이 막는 "primary trigger"인지 원문은 정하지 않는다.[](source:ds-1) |
| 판정: "primary trigger"는 전체 scan을 이 스킬로 시작하지 말라는 뜻으로 읽을 수 있고, 그렇게 읽으면 diff scan이 scan 안에서 단계로 위임하는 것과 부딪히지 않는다. 근거는 host-backed diff scan이 architecture mapping 전에 `threat_model` phase로 올라간다는 `scan-runtime.md`의 문장이다. 그러나 이 phase 진입 뒤에 위임한다는 순서를 diff scan 본문이 명시하지는 않는다.[](source:sr-rt) 우선순위는 원문에 명시 없음이다. |

diff 후보가 모두 처리되면 draft 제출 단계가 두 phase의 결과를 최종 분류로 옮긴다. 아래 순서대로 읽는다.[](source:fr-map)

| 순서 | 조건 | 분류 |
| --- | --- | --- |
| 1 | validation `reportable`이고 attack-path `reportable` | finding. 독립 instance와 관련 위치를 모두 남긴다 {good:보고} |
| 2 | 두 phase 중 하나가 `deferred` | `needs_follow_up` surface와 증명 간극이 적힌 deferred 작업 {caution:후속 필요} |
| 3 | validation `not_applicable` | `not_applicable` coverage |
| 4 | validation `suppressed` 또는 attack-path `ignore` | `rejected` coverage |

validation `deferred`와 attack-path `ignore` 조합은 2번과 4번에 모두 걸릴 수 있고 어느 쪽이 먼저인지 원문에 명시 없음이다. "in this order"만 근거로 2번이 먼저라고 읽는 것은 판정이다. 필요한 phase 기록이 빠진 후보는 미해결로 남고 별도 reconciliation pass를 만들지 않는다.[](source:fr-map)

| rel-id · 종류 | 조건과 강도 | 그림 반영 |
| --- | --- | --- |
| R06 · 내부 위임 | `$threat-model`을 한 번 실행하거나 공급된 모델을 쓴다. 위임이 끝나면 `complete: false` draft로 저장한다.[](source:ds-1)[](source:tmd-draft) | 표시 |
| R07 · 내부 위임 | `$finding-discovery`를 compact diff mode로 변경 파일 목록 전체에 실행한다. 후보는 한 번에 replace로 기록한다.[](source:ds-3)[](source:ct-rec) | 표시 |
| R08 · 내부 위임 | "If candidates exist, run `$validation` once". 후보가 0개일 때는 원문이 충돌한다.[](source:ds-4)[](source:val-wb) | 표시(조건 노드, 충돌 표시) |
| R09 · 내부 위임 | validation 다음에 한 번, `reportable` 또는 `deferred` 후보에만 실행한다. 대상이 없으면 `attackPaths: []`를 제출한다.[](source:ds-4)[](source:ap-wb) | 표시 |

## Standard와 Deep은 단계 스킬을 부르나, 단계끼리 무엇을 주고받나? {#handoff span=12}

부르지 않는다. `core-scan.md`는 한 감사 안에서 발견, 검증, 공격 경로 추론을 모두 하고 "separate phase skills"나 순위 phase, 파일별 ledger, 별도 phase worker pool, receipt 파일을 만들지 말라고 한다.[](source:cs-no) baseline 감사와 집중 조사 브리프도 Codex Security 단계 스킬이나 artifact 도구를 부르지 말라고 한다.[](source:bl-no)[](source:fi-no) 네 단계 스킬도 각자 본문에서 Standard와 Deep은 자기 감사 안에서 이 단계를 한다고 밝힌다.[](source:tm-intro)[](source:fd-sel)[](source:val-int)[](source:ap-int)

`core-scan.md`의 감사 순서는 다음과 같다. `security-scan`은 이 문서를 "the core audit"로 쓰고, Deep worker는 prompt 템플릿으로 이 문서를 직접 읽는다.[](source:ss-core)[](source:tpl-core)

@list id=core-order ordered=true
| 대상, scope, 정책, 사용자 context, 공급된 위협 모델, knowledge base를 확인한다. 소스는 읽기 전용, 오프라인으로만 본다.[](source:cs-base) |
| 위임이 가능하면 독립 baseline 감사를 `fork_turns: "none"`으로 시작하고, 불가능하면 직접 하며 독립 리뷰어가 없었다고 기록한다.[](source:cs-base) |
| `threat-model.md`를 읽어 구조와 경계를 파악한다. 생성한 모델은 `complete: false` checkpoint에 보존한다.[](source:cs-tm) |
| 공격자, 보호 자산, entry point, 기대 통제로 조사 packet을 묶고, 독립 packet은 집중 조사 worker에 맡긴다.[](source:cs-pkt) |
| 돌아온 후보와 반증을 `record_codex_security_scan_draft` checkpoint로 보존한 뒤 합치거나 검증한다.[](source:cs-ckpt) |
| 후보를 `validate-scan-findings.md` 기준으로 검증한다. 런타임 재현이나 실제 deployment 증명을 요구하지 않는다.[](source:cs-val)[](source:vs-3) |
| `scope`, `threatModel`, `findings`, `reviewState`를 조립해 제출한다. 심각도는 공급된 rubric이나 기본 rubric으로 매긴다.[](source:cs-val)[](source:cs-sev) |

아래 표는 단계마다 diff scan과 Standard·Deep이 하는 일을 나란히 둔 것이다.

| 단계 | diff scan | Standard·Deep |
| --- | --- | --- |
| 위협 모델 | `threat-model`을 한 번 실행하거나 공급된 모델을 쓴다.[](source:ds-1) | `threat-model.md`를 읽어 구조를 파악하고 스킬은 부르지 않는다 {caution:스킬 미사용}.[](source:cs-tm)[](source:tm-intro) |
| 후보 발견 | `finding-discovery`를 compact diff mode로 맡긴다.[](source:ds-3) | baseline 감사와 집중 조사 worker가 맡는다.[](source:cs-base)[](source:cs-pkt) |
| 검증 | 후보가 있을 때 `validation`을 한 번 맡긴다.[](source:ds-4) | `validate-scan-findings.md`로 같은 감사 안에서 검증한다.[](source:cs-val)[](source:vs-3) |
| 공격 경로와 심각도 | `attack-path-analysis`를 `reportable`·`deferred` 후보에만 맡긴다.[](source:ds-4) | 같은 감사 안에서 평가하고 심각도는 `core-scan.md`가 정한다.[](source:cs-sev)[](source:ap-int) |
| 후보 저장 | 후보 ledger 하나(`candidate_ledger.jsonl`)에 쌓는다.[](source:sa-compact) | ledger 없이 완료 draft로 바로 조립한다. 후보와 반증은 `complete: false` checkpoint로 보존한다.[](source:sa-compact)[](source:cs-ckpt) |

그림에서 뺀 관계는 아래와 같다. 네 단계 스킬끼리의 산출물 호환(R10~R13)은 diff scan 밖에서 순서를 강제하지 않는다. Standard와 Deep 쪽(R14~R17, R78)은 "호출하지 않는다"로만 읽는다.

| rel-id · 종류 | 조건과 강도 | 그림 반영 |
| --- | --- | --- |
| R10 · 산출물 호환 | `finding-discovery`는 "the threat model and applicable security policy"를 근거로 쓴다. 이 순서를 강제하는 곳은 diff scan뿐이다. 단독 호출에서 위협 모델 없이 discovery를 돌려도 되는지는 원문에 명시 없음이다.[](source:fd-intro)[](source:tm-ret) | 생략 |
| R11 · 산출물 호환 | `validation`은 discovery의 candidate ID와 필드를 보존해 이어받고, discovery 안에서 validation을 반복하지 않는다.[](source:fd-rep) | 생략 |
| R12 · 산출물 호환 | `attack-path-analysis`는 validated 후보 중 `reportable` 또는 `deferred`만 분석하고 후보 정체성과 기존 필드를 보존한다.[](source:val-wb)[](source:ap-wb) | 생략 |
| R13 · 산출물 호환 | scan 단계에서는 per-scan 위협 모델과 후보 집합을 쓴다. 단독 분석에서는 위협 모델이나 보안 정책이 있으면 쓰고 per-scan 산출물은 필요 없다.[](source:ap-in)[](source:ap-wb) | 생략 |
| R14 · 참고 | Standard scan과 Deep worker는 위협 모델을 자기 workflow 안에서 만든다. `core-scan.md`가 `threat-model.md`를 읽게 하므로 두 쪽이 같은 참조 문서를 공유한다.[](source:tm-intro)[](source:cs-tm) | 생략 |
| R15 · 참고 | Standard와 Deep worker는 coordinator의 self-contained prompt를 쓰고 `finding-discovery` 본문을 쓰지 않는다.[](source:fd-sel)[](source:cs-no) | 생략 |
| R16 · 참고 | Standard scan과 Deep worker는 validation을 자기 workflow 안에서 한다. `validate-scan-findings.md`는 "Reject only with source-backed counterevidence"를 요구한다.[](source:val-int)[](source:vs-3) | 생략 |
| R17 · 참고 | Standard scan과 Deep worker는 공격 경로를 자기 workflow 안에서 평가한다. 심각도는 `core-scan.md`의 "Finding Severity"가 매긴다.[](source:ap-int)[](source:cs-sev) | 생략 |
| R78 · 참고 | `security-scan`은 "the core audit"를 쓰고 Deep worker는 이 문서를 직접 읽는다. 두 스킬은 문서를 공유할 뿐 deep이 `security-scan` 본문을 호출한다는 문장은 없다.[](source:ss-core)[](source:tpl-core) | 생략 |

## 어떤 파일과 상태를 공유하나? {#state span=12}

공유 상태는 호스트 workbench와 scan 폴더에 있다. 선후 관계가 있는 것은 diff scan 안의 순서뿐이어서 그림 없이 표로만 둔다. 도구와 파일 동작은 소스에서 읽은 지시상 동작이고 분석자는 실행하지 않았다.

| 파일·상태 | 쓰는 스킬·주체 | 읽는 스킬·주체 | rel-id |
| --- | --- | --- | --- |
| `scan-manifest.json`의 `scan.threatModel`과 `<scan_dir>/threatmodel.md` | diff scan이 `complete: false` draft로 모델을 저장하면 호스트가 `threatmodel.md`를 렌더링한다. Standard는 첫 usable 모델을 같은 draft 도구로 저장하고, Deep 부모는 첫 모델을 `scan.threatModel`에 둔다.[](source:ds-1)[](source:res-draft)[](source:tm-doc)[](source:sc-tm) | 뒤 단계가 같은 모델을 이어받는다. `threat-model-visualize`(묶음 밖)는 기존 위협 모델을 기본 입력으로 읽는다. scan 안 파일은 `Saved Model Context` footer를 붙이므로 단독 `threat-model`의 공유 cache 파일과 끝부분 형식이 다르다.[](source:vis-in)[](source:tm-render)[](source:as-cache) | R06, R13, R42, R71, R72 |
| `<discovery_dir>/in_scope_files.txt` | `prepare_codex_security_review_items`가 diff scan의 변경 파일 목록을 만든다.[](source:ct-prep)[](source:inv-diff) | `list_codex_security_review_items`와 `record_codex_security_discovery_candidates`가 읽는다.[](source:ct-rec)[](source:disc-rec) | R07 |
| `<discovery_dir>/candidate_ledger.jsonl` | `finding-discovery`가 후보를 기록(replace)하고, `validation`이 모든 후보에 `validation` 객체를, `attack-path-analysis`가 자격 있는 후보에 `attack_path` 객체를 더한다. 도구가 후보 순서와 기존 필드를 보존한다.[](source:sa-compact)[](source:val-wb)[](source:ap-wb) | `validation`과 `attack-path-analysis`가 `list_codex_security_candidates`로 읽는다. Standard와 Deep은 이 ledger를 만들지 않는다.[](source:disc-list)[](source:sa-compact) | R74 |
| `<discovery_dir>/validation_artifacts/<candidate_id>/` | `validation`이 실제 PoC, 입력, 로그가 있을 때만 만든다.[](source:val-wb)[](source:sa-compact) | 후보의 `validation` 기록이 보관 파일 경로로 참조한다.[](source:sa-compact) | R74 |
| `scan-manifest.json`, `findings.json`(봉인) | 호스트 workbench나 SDK가 완료 때 봉인한다. diff scan은 `complete_codex_security_scan`, Deep은 코디네이터가 부모 scan을 봉인한다.[](source:sc-seal)[](source:ds-6)[](source:dp-5)[](source:fr-own) | `security-scan`이 두 파일이 있는지 확인한다. `track-findings`(묶음 밖)는 봉인된 scan 하나를 읽고, `triage-finding`(묶음 밖)은 사용자가 `codex-security.findings` 파일을 줄 때만 입력으로 쓴다. `scan.status`가 `completed`가 아니면 finding 없음은 결론이 아니다.[](source:res-done)[](source:tf-read)[](source:tri-in)[](source:sc-status) | R24, R25, R26, R75 |
| `report.md`, SARIF | 완료 처리가 생성한다. 봉인에는 들지 않는 투영물이다.[](source:ds-6)[](source:fr-own) | 최종 응답이 `report.md`를 링크한다.[](source:dp-5)[](source:ds-6) | R25, R26, R79 |

host가 기록하는 진행 phase는 스킬 호출 순서가 아니라 host 상태다. 판정: phase를 올리는 주체가 스킬마다 다르기 때문이다. diff scan은 단계가 실제로 바뀔 때 `update_codex_security_scan_progress`를 부르고, Deep의 `preflight`에서 discovery로의 전환은 코디네이터가 맡는다.[](source:ds-ctx)[](source:pro-27)

phase는 `preflight`, `threat_model`, `discovery`, `validation`, `attack_path`, `reporting` 순이고 이전 phase로는 옮기지 못한다.[](source:ph-const)[](source:ph-back) 아래 표는 Standard가 phase를 올리는 시점이다.

| 순서 | `phase` | Standard(`security-scan`)가 올리는 시점 |
| --- | --- | --- |
| 1 | `preflight` | 더 앞서 만든 handoff가 `preflight`에 있으면 `threat_model`로 한 번 올리고 재개한다.[](source:mg-prog) |
| 2 | `threat_model` | diff scan은 이 phase로 넘어간 뒤 architecture mapping을 시작한다.[](source:sr-rt) |
| 3 | `discovery` | dispatch 전에 올린다.[](source:mg-prog) |
| 4 | `validation` | 후보를 검토하기 전에 올린다.[](source:mg-prog) |
| 5 | `attack_path` | 도달성을 평가하기 전에 올린다.[](source:mg-prog) |
| 6 | `reporting` | 최종 조립 전에 올린다.[](source:mg-prog) |

@callout level=note title="이 묶음에 안내 역할 스킬은 없다"
| 세 scan 스킬은 선택지, 네 단계 스킬은 단계다. 스킬 목록을 나열만 하는 허브 스킬은 없다. 벤더의 `skills/README.md`가 "Choosing a scan"을 안내하지만 이것은 스킬이 아니라 문서다.[](source:readme) |

## 어디까지 확인했고 무엇이 남았나? {#audit span=12}

@facts id=audit-facts
| 확인 범위 | 묶음 스킬 7개의 `SKILL.md`, 플러그인 참조 문서, 호스트 도구 소스 |
| 읽은 텍스트 파일 | 42개, 합계 439,114바이트. 목록과 파일별 바이트, 읽은 줄 범위는 `skill-explainers/codex-security/_group-scan-vulnerabilities/files.md`에 있다 |
| 전부 읽음 | 15개, 47,666바이트. 스킬 `SKILL.md` 7개와 `core-scan.md`, `scan-runtime.md`, `access-advisory.md` 같은 짧은 문서다 |
| 줄 범위만 읽음 | 27개, 391,448바이트. `scan-artifacts.md`, `final-report.md`, `scan-contract.md`와 `server.ts`, `coordinator.ts` 같은 큰 파일은 인용한 줄 주변만 읽었다 |
| 묶음 밖 스킬 | `track-findings`, `triage-finding`, `threat-model-visualize`는 관계 확인에 쓴 줄(각각 8·24줄, 7~12줄, 10줄)만 읽었다 |
| 읽지 않음 | `project-config.schema.json`, `deep_scan_config.py`, `executor.ts`의 나머지, `server.ts`의 다른 도구 정의, `mcp-app/tests/` |
| 실행과 제외 | 실행한 코드는 없다. 번역본(`*.KO.md`)은 이 컬렉션에 없고 바이너리는 읽지 않았다 |
| 분석 중 바뀐 파일 | 없음 |

@callout level=open-question title="확인하지 못한 것"
| `working_tree` kind의 `baseRevision`과 `headRevision`을 저장 단계에서 채우는 코드는 읽지 않았다. 시작 입력 schema에서는 두 값이 선택이고 변경 파일 목록 도구는 둘 다 요구한다.[](source:srv-diff)[](source:inv-diff) |
| PR이나 branch diff를 `diffTarget.kind` 어느 값으로 넘기는지는 원문에 명시 없음이다. `scan-contract.md`의 `branch_diff`는 봉인 문서의 모드 값이라 열거형이 다르다.[](source:srv-diff)[](source:sc-mode) |
| diff scan이 `access-advisory.md`를 읽어야 하는지는 `scan-runtime.md:13`과 `SKILL.md`가 어긋난다. 어느 쪽이 diff scan의 실제 요구인지 원문에 명시 없음이다.[](source:sr-adv)[](source:ds-set) |
| stopped 상태(`failed`, `canceled`, `interrupted`)의 bundle을 `track-findings`가 거부하는 검사 코드는 이 확인 범위에서 찾지 못했다. `scan-contract.md`는 중단 상태에서 finding 부재를 결론으로 쓰지 말라고 한다.[](source:sc-status)[](source:tf-read) |
| 호스트 도구는 소스 계약까지만 확인했고 실행 번들(`mcp/server.mjs`)은 저장소에 커밋돼 있지 않다. 이 페이지의 도구 동작은 모두 지시상 동작이다. |
