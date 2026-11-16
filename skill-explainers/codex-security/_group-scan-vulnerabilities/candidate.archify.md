# 취약점 scan은 대상에 따라 어느 스킬이 맡고, 단계 스킬은 어떻게 이어지나? {#scan-vulnerabilities-page}

이 묶음의 작업 목표는 소스에서 취약점을 찾고, 후보를 검증하고, 공격 경로로 보고 여부를 정하는 것이다. 대상이 저장소 전체나 지정 경로의 현재 소스이면 `security-scan`, PR·commit·branch·working-tree 변경이면 `security-diff-scan`, 사용자가 deep scan을 명시했으면 `deep-security-scan`을 쓴다.[](source:ss-desc)[](source:ds-desc)[](source:dp-desc) 단계 스킬 네 개를 정해진 순서로 맡기는 곳은 `security-diff-scan` 하나뿐이다. Standard와 Deep은 단계 스킬을 부르지 않고 `core-scan.md` 한 문서의 감사 절차를 따른다.[](source:ds-1)[](source:ds-4)[](source:cs-noskill)

- 선택은 사용자와 호스트가 한다. 예외는 `deep-security-scan`이 이어 실행하는 scan의 저장된 모드가 Standard나 diff일 때 대응하는 scan 스킬로 계속하라고 하는 경우다.[](source:ss-desc)[](source:dp-cont)
- `security-diff-scan`은 `threat-model`을 한 번, `finding-discovery`를 compact diff mode로 맡긴다. 후보가 있으면 `validation`을 한 번, `reportable`이나 `deferred` 후보에는 `attack-path-analysis`를 한 번 맡긴다.[](source:ds-1)[](source:ds-3)[](source:ds-4)
- Standard와 Deep worker는 검증과 공격 경로 평가를 같은 감사 안에서 끝낸다. Deep은 호스트 코디네이터가 Standard 감사를 반복하고 결과를 병합한다.[](source:cs-noskill)[](source:dp-lead)
- 원문이 충돌한다. `security-diff-scan`은 후보가 있을 때만 `validation`을 돌리라 하고, `validation`은 빈 집합에도 `validations: []`를 제출하라고 한다. 우선순위는 원문에 명시 없음이다.[](source:ds-4)[](source:val-empty)

@answer scope="스킬 7개 · 분석 커밋 cd5035b · 호스트 도구는 소스 계약까지 확인"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source ss-desc title="codex-security/plugins/codex-security/skills/security-scan/SKILL.md · 2972B · description" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=3:3
@source ss-core title="codex-security/plugins/codex-security/skills/security-scan/SKILL.md · 감사 방식" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=10:10
@source ss-run title="codex-security/plugins/codex-security/skills/security-scan/SKILL.md · 감사 시작과 완료" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=21:21
@source ds-desc title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · description" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=3:3
@source ds-prog title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 진행 phase와 context" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=20:20
@source ds-secmd title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · SECURITY.md 적용" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=16:16
@source ds-1 title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 1단계 threat-model" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=28:28
@source ds-2 title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 2단계 변경 파일 inventory" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=29:29
@source ds-3 title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 3단계 finding-discovery" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=30:30
@source ds-4 title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 4단계 validation과 attack-path" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=31:31
@source ds-5 title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5단계 draft와 선택 산출물" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=32:32
@source ds-6 title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 6단계 완료" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=33:33
@source ds-end title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 종료 조건" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=35:35
@source dp-desc title="codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md · 3127B · description" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=3:3
@source dp-lead title="codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md · 호스트의 반복 실행" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=8:8
@source dp-cont title="codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md · 이어 실행" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=10:10
@source dp-cap title="codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md · max_discovery_runs" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=11:11
@source dp-done title="codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md · 완료 보고" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=14:14
@source tm-desc title="codex-security/plugins/codex-security/skills/threat-model/SKILL.md · 2986B · description" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=3:3
@source tm-intro title="codex-security/plugins/codex-security/skills/threat-model/SKILL.md · Standard와 Deep의 자기 workflow" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=8:8
@source tm-sel title="codex-security/plugins/codex-security/skills/threat-model/SKILL.md · 모델 선택과 SECURITY.md 대용" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=14:19
@source tm-ret title="codex-security/plugins/codex-security/skills/threat-model/SKILL.md · 결과 보관" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=25:27
@source fd-desc title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · description" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=3:3
@source fd-intro title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 입력 근거" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=8:10
@source fd-sel title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · workflow 선택" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=14:18
@source fd-rep title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 반복 금지" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=31:31
@source val-desc title="codex-security/plugins/codex-security/skills/validation/SKILL.md · 4619B · description" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=3:3
@source val-fp title="codex-security/plugins/codex-security/skills/validation/SKILL.md · false_positive_feedback.json" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=14:14
@source val-int title="codex-security/plugins/codex-security/skills/validation/SKILL.md · scan 연동" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=21:21
@source val-wb title="codex-security/plugins/codex-security/skills/validation/SKILL.md · Compact Workbench Diff" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=25:30
@source val-empty title="codex-security/plugins/codex-security/skills/validation/SKILL.md · 빈 집합 제출" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=28:28
@source ap-desc title="codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md · 5355B · description" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=3:3
@source ap-in title="codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md · 입력" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=12:14
@source ap-cont title="codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md · Continuum evidence" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=21:21
@source ap-int title="codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md · Standard와 Deep의 자기 workflow" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=27:27
@source ap-wb title="codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md · Compact Workbench Diff" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=31:36
@source readme title="codex-security/plugins/codex-security/skills/README.md · 3752B · 벤더의 스킬 선택 안내" path=codex-security/plugins/codex-security/skills/README.md lines=7:9
@source res-draft title="codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md · 2871B · 첫 초안" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md lines=7:7
@source res-done title="codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md · manifest와 findings 확인" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md lines=13:13
@source mg-resume title="codex-security/plugins/codex-security/skills/security-scan/references/managed-scan.md · 1356B · 재개" path=codex-security/plugins/codex-security/skills/security-scan/references/managed-scan.md lines=3:3
@source mg-prog title="codex-security/plugins/codex-security/skills/security-scan/references/managed-scan.md · phase 올리는 시점" path=codex-security/plugins/codex-security/skills/security-scan/references/managed-scan.md lines=9:9
@source led-intro title="codex-security/plugins/codex-security/skills/security-scan/references/scan-artifacts-and-ledger.md · 7021B · standalone diff worklist(앞 3줄만 읽음)" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-artifacts-and-ledger.md lines=1:3
@source desk-intro title="codex-security/plugins/codex-security/skills/security-scan/references/desktop-scan.md · 580B · desktop handoff" path=codex-security/plugins/codex-security/skills/security-scan/references/desktop-scan.md lines=3:3
@source cs-base title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · baseline 감사" path=codex-security/plugins/codex-security/references/core-scan.md lines=10:10
@source cs-tm title="codex-security/plugins/codex-security/references/core-scan.md · 위협 모델" path=codex-security/plugins/codex-security/references/core-scan.md lines=11:11
@source cs-deleg title="codex-security/plugins/codex-security/references/core-scan.md · 집중 조사 위임" path=codex-security/plugins/codex-security/references/core-scan.md lines=13:13
@source cs-ckpt title="codex-security/plugins/codex-security/references/core-scan.md · 후보 checkpoint" path=codex-security/plugins/codex-security/references/core-scan.md lines=14:14
@source cs-val title="codex-security/plugins/codex-security/references/core-scan.md · 검증" path=codex-security/plugins/codex-security/references/core-scan.md lines=15:15
@source cs-noskill title="codex-security/plugins/codex-security/references/core-scan.md · 단계 스킬 금지" path=codex-security/plugins/codex-security/references/core-scan.md lines=18:18
@source cs-pol title="codex-security/plugins/codex-security/references/core-scan.md · SECURITY.md 적용" path=codex-security/plugins/codex-security/references/core-scan.md lines=26:26
@source cs-sev title="codex-security/plugins/codex-security/references/core-scan.md · Finding Severity" path=codex-security/plugins/codex-security/references/core-scan.md lines=34:36
@source bl-no title="codex-security/plugins/codex-security/references/baseline-auditor.md · 2839B · 금지 목록" path=codex-security/plugins/codex-security/references/baseline-auditor.md lines=16:16
@source fi-no title="codex-security/plugins/codex-security/references/focused-investigator.md · 2548B · 금지 목록" path=codex-security/plugins/codex-security/references/focused-investigator.md lines=11:11
@source vs-3 title="codex-security/plugins/codex-security/references/validate-scan-findings.md · 1131B · 후보 검증" path=codex-security/plugins/codex-security/references/validate-scan-findings.md lines=3:3
@source sr-deleg title="codex-security/plugins/codex-security/references/scan-runtime.md · 1558B · worker 위임" path=codex-security/plugins/codex-security/references/scan-runtime.md lines=3:5
@source sr-diff title="codex-security/plugins/codex-security/references/scan-runtime.md · host-backed diff scan" path=codex-security/plugins/codex-security/references/scan-runtime.md lines=7:7
@source sr-adv title="codex-security/plugins/codex-security/references/scan-runtime.md · access advisory" path=codex-security/plugins/codex-security/references/scan-runtime.md lines=13:13
@source aa-adv title="codex-security/plugins/codex-security/references/access-advisory.md · 1373B · 접근 안내" path=codex-security/plugins/codex-security/references/access-advisory.md lines=3:11
@source tb-def title="codex-security/plugins/codex-security/references/investigation-time-budget.md · 1749B · 조사 시간 권고" path=codex-security/plugins/codex-security/references/investigation-time-budget.md lines=3:3
@source sa-model title="codex-security/plugins/codex-security/references/scan-artifacts.md · 11701B · 위협 모델 경로" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=28:29
@source sa-deep title="codex-security/plugins/codex-security/references/scan-artifacts.md · Deep의 draft 제출" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=37:39
@source sa-compact title="codex-security/plugins/codex-security/references/scan-artifacts.md · compact diff 산출물" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=41:49
@source sa-final title="codex-security/plugins/codex-security/references/scan-artifacts.md · 최종 보고 경로" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=96:106
@source as-own title="codex-security/plugins/codex-security/references/artifact-storage.md · 7947B · scan 소유와 구조화 결과" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=7:9
@source as-supp title="codex-security/plugins/codex-security/references/artifact-storage.md · 보조 파일 도구" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=13:13
@source as-cache title="codex-security/plugins/codex-security/references/artifact-storage.md · 위협 모델 cache" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=49:49
@source fr-own title="codex-security/plugins/codex-security/references/final-report.md · 12135B · 제출과 완료 소유자" path=codex-security/plugins/codex-security/references/final-report.md lines=5:16
@source fr-map title="codex-security/plugins/codex-security/references/final-report.md · diff 후보 결과 매핑" path=codex-security/plugins/codex-security/references/final-report.md lines=42:49
@source fr-opt title="codex-security/plugins/codex-security/references/final-report.md · 선택 문서" path=codex-security/plugins/codex-security/references/final-report.md lines=51:53
@source sc-seal title="codex-security/plugins/codex-security/references/scan-contract.md · 16529B · 봉인 문서" path=codex-security/plugins/codex-security/references/scan-contract.md lines=9:14
@source sc-status title="codex-security/plugins/codex-security/references/scan-contract.md · scan.status" path=codex-security/plugins/codex-security/references/scan-contract.md lines=32:41
@source sc-mode title="codex-security/plugins/codex-security/references/scan-contract.md · scan.mode" path=codex-security/plugins/codex-security/references/scan-contract.md lines=122:132
@source sc-tm title="codex-security/plugins/codex-security/references/scan-contract.md · scan.threatModel" path=codex-security/plugins/codex-security/references/scan-contract.md lines=173:173
@source sg-chain title="codex-security/plugins/codex-security/references/security-guidance.md · 2830B · SECURITY.md chain" path=codex-security/plugins/codex-security/references/security-guidance.md lines=34:36
@source tmd-draft title="codex-security/plugins/codex-security/references/threat-model.md · 7751B · 위협 모델 저장 계약" path=codex-security/plugins/codex-security/references/threat-model.md lines=40:42
@source pro-27 title="codex-security/plugins/codex-security/references/scan-prologue.md · 5747B · Deep 코디네이터의 phase 소유" path=codex-security/plugins/codex-security/references/scan-prologue.md lines=27:27
@source srv-diff title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · diffTarget schema" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=103:121
@source srv-deep title="codex-security/plugins/codex-security/mcp-app/server.ts · Deep 시작 도구의 scope 검사" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=930:934
@source ct-prep title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 15421B · 변경 파일 inventory 도구" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=82:92
@source ct-rec title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 후보 기록 도구" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=109:121
@source ct-val title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 검증 기록 도구" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=138:150
@source ct-ap title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 공격 경로 기록 도구" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=153:165
@source led-val title="codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts · 6121B · 검증 누락 거부" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=58:65
@source led-ap title="codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts · 공격 경로 자격과 누락 거부" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=126:141
@source inv-diff title="codex-security/plugins/codex-security/mcp-app/src/artifact-inventory.ts · 5370B · diff 변경 범위 검사" path=codex-security/plugins/codex-security/mcp-app/src/artifact-inventory.ts lines=54:78
@source disc-rec title="codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts · 6305B · 후보 기록" path=codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts lines=61:100
@source disc-list title="codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts · 후보 목록 읽기" path=codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts lines=180:193
@source tm-doc title="codex-security/plugins/codex-security/mcp-app/src/threat-model-document.ts · 2657B · threatmodel.md 생성" path=codex-security/plugins/codex-security/mcp-app/src/threat-model-document.ts lines=33:70
@source tm-render title="codex-security/plugins/codex-security/mcp-app/src/threat-model-render.ts · 5406B · Saved Model Context footer" path=codex-security/plugins/codex-security/mcp-app/src/threat-model-render.ts lines=143:156
@source art-write title="codex-security/plugins/codex-security/mcp-app/src/artifact-storage.ts · 8872B · 보조 파일 쓰기 허용 경로" path=codex-security/plugins/codex-security/mcp-app/src/artifact-storage.ts lines=153:171
@source norm title="codex-security/plugins/codex-security/mcp-app/src/helpers/normalize-candidates.ts · 18523B · 후보 병합 기준" path=codex-security/plugins/codex-security/mcp-app/src/helpers/normalize-candidates.ts lines=389:398
@source sch-val title="codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json · 4519B · validations 배열" path=codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json lines=13:19
@source sch-ap title="codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json · 6810B · reportable severity" path=codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json lines=85:85
@source tpl-core title="codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md · 2215B · Deep worker prompt" path=codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md lines=7:9
@source coord-prev title="codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts · 40348B · 이전 finding 전달" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=873:877
@source coord-stop title="codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts · 중단 조건" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=847:864
@source ph-const title="codex-security/plugins/codex-security/scripts/workbench_constants.py · 3177B · PHASES" path=codex-security/plugins/codex-security/scripts/workbench_constants.py lines=7:7
@source ph-back title="codex-security/plugins/codex-security/scripts/workbench_progress.py · 16640B · 이전 phase 거부" path=codex-security/plugins/codex-security/scripts/workbench_progress.py lines=267:268
@source vw-path title="codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md · 5571B · 최종 보고 저장 경로" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=42:42
@source ph-hard title="codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md · 5026B · 자동 최종 보고" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=41:46
@source ph-desc title="codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md · description" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=3:3
@source vw-desc title="codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md · description" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=3:3
@source tf-sealed title="codex-security/plugins/codex-security/skills/track-findings/SKILL.md · 13459B · sealed scan 입력" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=8:8
@source tf-read title="codex-security/plugins/codex-security/skills/track-findings/SKILL.md · 읽는 파일" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=24:24
@source pf-cont title="codex-security/plugins/codex-security/skills/publish-findings/SKILL.md · 11118B · AWS Continuum 행" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=25:25
@source tri-desc title="codex-security/plugins/codex-security/skills/triage-finding/SKILL.md · 8394B · description" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=3:3
@source tri-in title="codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md · 4447B · findings.json 입력" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=7:12
@source vis-in title="codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md · 19102B · 기본 입력" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=8:10
@source sp-8 title="codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md · 5982B · SECURITY.md 성격" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=8:8
@source sp-28 title="codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md · 정책 합성" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=28:28

## 요청 대상에 따라 어느 scan 스킬을 쓰나? {#choose}

그림의 결정 노드는 `security-scan` description이 적은 선택 기준을 옮긴 것이다. 어느 스킬을 쓸지는 사용자와 호스트가 정한다. 점선 두 줄은 `deep-security-scan`이 이어 실행하는 scan의 저장된 모드에 따라 대응하는 scan 스킬로 계속하라고 하는 경우다.[](source:ss-desc)[](source:ds-desc)[](source:dp-desc)[](source:dp-cont)

@workflow id=scan-choice title="대상 범위에 따라 scan 스킬 고르기"
| req | scan 요청 | external |
| scope | 대상이 무엇인가? | backend |
| std | security-scan | backend | source:ss-desc |
| diff | security-diff-scan | backend | source:ds-desc |
| deep | deep-security-scan | backend | source:dp-desc |
| req > scope | |
| scope > std | 전체·경로 | emphasis |
| scope > diff | 변경분 | |
| scope > deep | deep 명시 | |
| deep > diff | 이어 실행 | dashed |
| deep > std | 이어 실행 | dashed |

@steps id=choose-steps
| std-step | security-scan | 저장소 전체나 지정 경로의 현재 소스를 한 번의 감사로 점검한다. | scan-choice | std |
| diff-step | security-diff-scan | PR, commit, branch diff, working-tree patch의 변경 파일을 단계 스킬 네 개에 맡겨 점검한다. | scan-choice | diff |
| deep-step | deep-security-scan | 호스트가 Standard 감사를 반복 실행하고 결과를 병합한다. | scan-choice | deep |

| rel-id·종류 | 전달물과 조건 | 그림 반영 |
| --- | --- | --- |
| R01 · 넘김 | 대상이 PR, commit, branch, working-tree 변경이면 diff 스킬을 쓰라고 description이 정한다. 스킬 이름은 적지 않는다. 벤더 README도 `security-scan`을 "Start here for a general review"로, diff 스킬을 PR·commit·branch·local edits용으로 나눠 적는다. 사용자와 호스트가 스킬을 고른다.[](source:ss-desc)[](source:ds-desc)[](source:readme) | 표시 |
| R02 · 넘김 | 사용자가 deep scan을 명시적으로 요청했을 때만 deep 스킬을 쓰라고 한다("the deep skill for an explicitly requested deep scan"). 스킬 이름은 적지 않는다. README는 deep을 "several passes over the same code and combines the findings in one report"로 설명한다.[](source:ss-desc)[](source:dp-desc)[](source:readme) | 표시 |
| R03 · 넘김 | deep description이 PR, commit, branch, working tree 변경에는 `security-diff-scan`을 쓰라고 정한다. 이어 실행하는 scan의 저장된 모드가 diff이면 대응하는 scan 스킬로 계속한다. 도구 쪽에서 `start_codex_security_deep_scan`은 `scope: "."`만 받는다. 변경 범위를 도구에 넘기는 `diffTarget.kind`는 `working_tree`, `commit`, `range` 세 가지뿐이며 PR이나 branch diff를 어느 kind로 넘기는지는 원문에 명시 없음이다. 저장된 scan 정체성과 범위는 호스트(`get_codex_security_scan_context`, handoff token)가 관리한다.[](source:dp-desc)[](source:dp-cont)[](source:srv-deep)[](source:srv-diff) | 표시(점선) |
| R04 · 넘김 | 이어 실행하는 scan의 저장된 모드가 Standard이면 "the corresponding scan skill"로 계속한다. 대응 스킬 이름은 적지 않는다.[](source:dp-cont)[](source:ss-desc) | 표시(점선) |
| R05 · 참고 | 호스트가 Standard 감사를 반복 실행해 결과를 병합하고, 연속된 감사가 새 결과를 더하지 못하거나 설정된 scan 또는 시간 한도에 닿으면 멈춘다. `max_discovery_runs`는 같이 도는 Standard scan까지 센 총 횟수 상한이다. 다음 pass에는 이미 보고된 finding의 `경로:줄 제목`이 전달되고, 같은 Deep scan의 worker는 peer note로 단서를 나눈다. Deep worker prompt는 `core-scan.md`를 직접 읽게 하며, `security-scan` 스킬이 같은 문서를 쓴다. 두 스킬은 이 문서를 공유할 뿐 deep이 `security-scan` 본문을 호출한다는 문장은 없다.[](source:dp-lead)[](source:dp-cap)[](source:coord-stop)[](source:coord-prev)[](source:tpl-core)[](source:ss-core) | 생략(표로만) |

@callout level=note title="이 묶음에 안내 역할 스킬은 없다"
| 원장은 세 scan 스킬을 모두 선택지, 네 단계 스킬을 모두 단계로 둔다. 스킬 목록을 나열만 하는 허브 스킬은 없다. 벤더 `skills/README.md`가 "Choosing a scan"을 안내하지만 이는 스킬이 아니라 문서다.[](source:readme) |

## diff scan은 단계 스킬 네 개를 어떤 순서로 맡기고, 결과는 어떻게 분류되나? {#diff-order}

순서는 `security-diff-scan` 본문의 1·3·4단계가 정한다. 각 단계 스킬이 끝나면 diff scan으로 돌아온다.[](source:ds-1)[](source:ds-3)[](source:ds-4)

판정: 순서를 정한 곳은 diff scan 하나다. 네 단계 스킬의 description은 이미 해당 phase에 있거나 사용자가 명시로 요청할 때 쓰라고만 적고 순서는 정하지 않는다.[](source:tm-desc)[](source:fd-desc)[](source:val-desc)[](source:ap-desc)

@workflow id=diff-order-flow title="security-diff-scan이 단계 스킬에 맡기는 순서"
| tm | threat-model | backend | source:ds-1 |
| fd | finding-discovery | backend | source:ds-3 |
| has | 후보가 있는가? | backend | source:ds-4 |
| val | validation | backend | source:ds-4 |
| ap | attack-path-analysis | backend | source:ds-4 |
| wrap | draft 제출·완료 | external | source:ds-6 |
| tm > fd | R06 → R07 | emphasis |
| fd > has | |
| has > val | 있음 R08 | emphasis |
| val > ap | R09 | emphasis |
| has > wrap | 없음 | |
| ap > wrap | | |

@steps id=delegation-steps
| tm-step | threat-model | 위협 모델을 한 번 실행하거나 사용자가 준 모델을 쓴다. | diff-order-flow | tm |
| fd-step | finding-discovery | 변경 파일 inventory 전체에서 후보를 찾아 한 번에 기록한다. | diff-order-flow | fd |
| val-step | validation | 후보마다 근거를 따져 처분을 낸다. | diff-order-flow | val |
| ap-step | attack-path-analysis | `reportable`이나 `deferred` 후보의 공격 경로와 보고 여부를 정한다. | diff-order-flow | ap |

| rel-id·종류 | 전달물과 조건 | 그림 반영 |
| --- | --- | --- |
| R06 · 내부 위임 | "Run `$threat-model` once, or use the supplied model". 한 번만 실행하고 사용자가 모델을 주면 그것을 쓴다. 모델은 저장소 전체가 기본이고 사용자가 좁히라고 할 때만 좁힌다. 위임이 끝나면 diff scan이 `complete: false` 초안을 저장한다. 공급된 모델은 그대로 보존하며 텍스트는 `{format: markdown, content, origin: provided 또는 generated}`로 둔다.[](source:ds-1)[](source:tm-ret)[](source:tmd-draft) | 표시 |
| R07 · 내부 위임 | "Run `$finding-discovery` in compact diff mode across that inventory". 사용 가능한 worker에 독립 assignment를 나눠 주고 나머지 파일은 직접 본다. 순위 목록, finding별 장부, discovery 보고서는 만들지 않는다. 변경 파일 inventory는 `prepare_codex_security_review_items`가 만들고 `record_codex_security_discovery_candidates`가 후보 파일 전체를 한 번에 replace한다. 다시 부르면 이전 후보를 덮어쓴다. 인벤토리 도구는 `diffTarget.kind`가 `working_tree`, `commit`, `range` 중 하나이고 base·head revision이 비어 있지 않아야 한다.[](source:ds-3)[](source:fd-sel)[](source:ct-prep)[](source:ct-rec)[](source:disc-rec)[](source:inv-diff) | 표시 |
| R08 · 내부 위임 | "If candidates exist, run `$validation` once". 후보가 없으면 실행하지 않는다. 도구는 기존 후보 전체의 처분을 한 번에 받고 하나라도 빠지면 거부한다("Validation must include every existing candidate"). 처분은 `reportable`, `suppressed`, `not_applicable`, `deferred`다.[](source:ds-4)[](source:val-wb)[](source:ct-val)[](source:led-val)[](source:sch-val) | 표시(조건 노드) |
| R09 · 내부 위임 | validation 다음에 한 번, `reportable` 또는 `deferred`로 표시된 후보에만 실행한다. 이 단계에 들어갈 후보가 없으면 `attackPaths: []`를 제출한다. 자격 있는 후보가 하나라도 빠지면 도구가 거부하고("Attack-path analysis must include every reportable or deferred candidate") 자격 없는 후보를 넣어도 거부한다. `reportable` 결정의 severity는 critical, high, medium, low뿐이다.[](source:ds-4)[](source:ap-wb)[](source:ct-ap)[](source:led-ap)[](source:sch-ap) | 표시 |

@callout level=open-question title="후보가 없을 때 validation을 부르는지는 원문 두 곳이 갈린다"
| `security-diff-scan`은 "If candidates exist, run `$validation` once"라 적어 후보가 없으면 실행하지 않는 것으로 읽힌다.[](source:ds-4) |
| `validation`의 workbench diff 절은 처분 전체를 한 번에 제출하며 빈 집합이면 `validations: []`를 제출하라고 한다.[](source:val-empty) |
| 두 문장 사이의 우선순위는 원문에 명시 없음이다. 도구 쪽은 `validations` 배열에 `minItems`가 없고 빈 배열을 거부하는 검사도 읽지 못했다. 다만 검증 도구는 먼저 후보 파일을 읽고, 후보 기록 도구는 후보가 0건이어도 같은 경로로 파일을 쓴다. 판정: discovery를 한 번 기록했다면 빈 제출이 통과하고 기록하지 않았다면 후보 파일이 없어 실패한다.[](source:sch-val)[](source:led-val)[](source:disc-rec) |

후보가 모두 처리되면 draft 제출 단계가 두 phase의 결과를 최종 분류로 옮긴다. 아래 순서대로 읽는다.[](source:fr-map)

| 순서 | 조건 | 분류 |
| --- | --- | --- |
| 1 | validation `reportable`이고 attack-path `reportable` | finding. 독립 instance와 관련 위치를 모두 남긴다 {good:보고} |
| 2 | 두 phase 중 하나가 `deferred` | `needs_follow_up` surface와 증명 간극이 적힌 deferred 작업 {caution:후속 필요} |
| 3 | validation `not_applicable` | `not_applicable` coverage |
| 4 | validation `suppressed` 또는 attack-path `ignore` | `rejected` coverage |

validation `deferred`와 attack-path `ignore` 조합은 2번과 4번에 모두 걸릴 수 있고 우선순위는 원문에 명시 없음이다. 순서대로 읽으면 2번이 먼저라는 것은 판정이다. 필요한 phase 기록이 빠진 후보는 미해결로 남고 별도 reconciliation pass를 만들지 않는다.[](source:fr-map)

## Standard와 Deep은 단계 스킬을 부르나, 단계끼리 무엇을 주고받나? {#handoff}

부르지 않는다. `core-scan.md`는 한 감사 안에서 발견·검증·공격 경로 추론을 모두 하고 "separate phase skills"나 순위 phase, 파일별 ledger, receipt 파일을 만들지 말라고 한다.[](source:cs-noskill) 아래 표는 단계마다 diff scan과 Standard·Deep이 하는 일을 나란히 둔 것이다.

| 단계 | diff scan | Standard·Deep |
| --- | --- | --- |
| 위협 모델 | `threat-model`을 한 번 실행하거나 공급된 모델을 쓴다.[](source:ds-1) | `threat-model.md`를 읽어 구조를 파악하고 `threat-model` 스킬은 부르지 않는다 {caution:스킬 미사용}.[](source:cs-tm)[](source:tm-intro) |
| 후보 발견 | `finding-discovery`를 compact diff mode로 맡긴다.[](source:ds-3) | 독립 baseline 감사와 집중 조사 worker가 맡는다. 위임이 불가하면 부모가 직접 하고 독립 리뷰어가 없었다고 기록한다.[](source:cs-base)[](source:cs-deleg)[](source:fd-sel) |
| 검증 | 후보가 있을 때 `validation`을 한 번 맡긴다.[](source:ds-4) | `core-scan.md` 7단계가 `validate-scan-findings.md`로 검증한다. 런타임 재현이나 실제 deployment 증명을 요구하지 않는다.[](source:cs-val)[](source:vs-3)[](source:val-int) |
| 공격 경로와 심각도 | `attack-path-analysis`를 `reportable`·`deferred` 후보에만 맡긴다.[](source:ds-4) | 같은 감사 안에서 평가하고 심각도는 `core-scan.md`의 Finding Severity가 정한다.[](source:cs-sev)[](source:ap-int) |
| 후보 저장 | 후보 ledger 하나(`candidate_ledger.jsonl`)에 쌓는다.[](source:sa-compact) | 후보 ledger를 만들지 않는다. 후보와 반증은 `complete: false` draft checkpoint로 보존한다.[](source:sa-compact)[](source:cs-ckpt) |

그림에서 뺀 관계는 아래와 같다. 단계 스킬끼리의 산출물 호환은 diff scan 밖에서 순서를 강제하지 않는다. Standard와 Deep 쪽 경계는 "호출하지 않는다"로만 읽는다.

| rel-id·종류 | 전달물과 조건 | 그림 반영 |
| --- | --- | --- |
| R10 · 산출물 호환 | `finding-discovery`는 "the threat model and applicable security policy"를 근거로 쓴다. 이 순서를 강제하는 곳은 diff scan(R06~R09)뿐이다. 단독 호출에서 위협 모델 없이 discovery를 돌려도 되는지는 원문에 명시 없음이다.[](source:tm-ret)[](source:fd-intro) | 생략 |
| R11 · 산출물 호환 | `validation`은 discovery의 candidate ID와 discovery 필드를 보존해 이어받는다. discovery 안에서 validation을 반복하지 않는다("Do not repeat validation or attack-path phases inside discovery"). compact diff 경로에서는 candidate ID를 호스트가 `candidate-<해시 16자>`로 새로 붙인다. 호스트는 `cwe_ids`, `locations`, `instance`가 모두 같은 행만 병합하는데 `finding-discovery`는 source·control·sink·영향이 같으면 합치고 원래 ID를 유지하라고 해 기준이 다르다.[](source:fd-rep)[](source:fd-sel)[](source:val-wb)[](source:norm) | 생략 |
| R12 · 산출물 호환 | `attack-path-analysis`는 "all validated candidates" 중 `reportable` 또는 `deferred`만 분석하고 후보 정체성과 기존 필드를 보존한다.[](source:val-wb)[](source:ap-wb) | 생략 |
| R13 · 산출물 호환 | scan 단계에서는 per-scan 위협 모델과 후보 집합을 쓴다. compact diff에서는 둘 다 `list_codex_security_candidates`로 읽으라고 하나 이 도구는 후보 행만 돌려준다. 단독 분석에서는 위협 모델이나 보안 정책이 있으면 쓰고 per-scan 산출물은 필요 없다.[](source:ap-in)[](source:ap-wb)[](source:disc-list)[](source:tm-ret) | 생략 |
| R14 · 참고 | Standard scan과 Deep worker는 위협 모델을 자기 workflow 안에서 만든다. `core-scan.md`가 `threat-model.md`를 읽게 하므로 두 쪽이 같은 참조 문서를 공유한다.[](source:tm-intro)[](source:cs-tm) | 생략 |
| R15 · 참고 | "Standard and Deep workers use their coordinator's self-contained prompts rather than this phase skill". baseline 감사와 집중 조사 브리프도 phase 스킬이나 artifact 도구를 부르지 말라고 한다.[](source:fd-sel)[](source:cs-noskill)[](source:bl-no)[](source:fi-no) | 생략 |
| R16 · 참고 | Standard scan과 Deep Scan worker는 validation을 자기 workflow 안에서 한다. `core-scan.md` 7단계가 `validate-scan-findings.md`를 지시하고 이 문서는 "Reject only with source-backed counterevidence"를 요구한다.[](source:val-int)[](source:cs-val)[](source:vs-3) | 생략 |
| R17 · 참고 | Standard scan과 Deep Scan worker는 공격 경로를 자기 workflow 안에서 평가한다. 심각도는 `core-scan.md`의 "Finding Severity"가 공급된 rubric 또는 default rubric으로 매긴다.[](source:ap-int)[](source:cs-sev) | 생략 |
| R18 · 참고 | compact inventory 없이 diff를 단독으로 발견할 때 `security-scan/references/scan-artifacts-and-ledger.md`를 읽고 변경 파일 worklist와 단계별 산출물을 만든다. 그 파일은 standalone·legacy diff에만 쓰고 Standard, Deep, compact Workbench Diff에는 쓰지 않는다고 스스로 밝힌다.[](source:fd-sel)[](source:led-intro) | 생략 |
| R78 · 참고 | `security-scan`은 "the core audit"를 쓰고, Deep worker는 prompt 템플릿으로 `core-scan.md`를 직접 읽는다. 이 문서는 대상·정책 확인, 독립 baseline 감사, 구조 파악, 조사 packet 묶기, 집중 조사 위임, 후보 checkpoint, 검증, draft 조립 순서로 이어진다.[](source:ss-core)[](source:tpl-core)[](source:cs-base)[](source:cs-tm)[](source:cs-deleg)[](source:cs-ckpt)[](source:cs-val) | 생략 |

## 어떤 파일과 상태를 공유하나? {#state}

공유 상태는 호스트 workbench와 scan 폴더에 있다. 아래 표는 파일을 쓰는 쪽과 읽는 쪽을 모은 것이다. 선후 관계가 있는 것은 diff scan 안의 순서뿐이어서 그림 없이 표로만 둔다. 도구와 파일 동작은 이 컬렉션의 소스에서 읽은 지시상 동작이다.

| 파일·상태 | 쓰는 스킬·주체 | 읽는 스킬·주체 | rel-id |
| --- | --- | --- | --- |
| `scan-manifest.json`의 `scan.threatModel`과 `<scan_dir>/threatmodel.md` | diff scan이 `complete: false` draft로 모델을 저장하면 host가 `threatmodel.md`를 렌더링한다(scan 완료 전에는 provisional 표시). Standard는 첫 usable 위협 모델을 같은 draft 도구로 저장한다. Deep 부모는 첫 모델을 `scan.threatModel`에 두고 host가 primary model에서 `threatmodel.md`를 만든다.[](source:ds-1)[](source:res-draft)[](source:sa-model)[](source:tm-doc)[](source:sc-tm) | 이후 단계가 같은 모델을 이어받는다. `threat-model-visualize`(묶음 밖)는 기존 위협 모델을 기본 입력으로 읽고 새 scan은 돌리지 않는다. 단독 `threat-model`이 저장하는 공유 cache 파일과 끝부분 형식이 다르다(scan 안 파일은 `Saved Model Context` footer를 붙인다).[](source:vis-in)[](source:tm-render)[](source:as-cache) | R06, R13, R42, R43, R71, R72 |
| `<discovery_dir>/in_scope_files.txt` | `prepare_codex_security_review_items`가 diff scan의 변경 파일 목록을 만든다.[](source:ct-prep)[](source:inv-diff) | `list_codex_security_review_items`와 `record_codex_security_discovery_candidates`가 읽는다.[](source:ct-rec)[](source:disc-rec) | R07 |
| `<discovery_dir>/candidate_ledger.jsonl` | `finding-discovery`가 후보를 기록(replace)하고, `validation`이 모든 후보에 `validation` 객체를, `attack-path-analysis`가 자격 있는 후보에 `attack_path` 객체를 더한다. 도구가 후보 순서와 기존 필드를 보존한다.[](source:sa-compact)[](source:val-wb)[](source:ap-wb) | `validation`과 `attack-path-analysis`가 `list_codex_security_candidates`로 읽는다. Standard와 Deep은 이 ledger를 만들지 않는다.[](source:disc-list)[](source:sa-compact) | R74 |
| `validation_artifacts/<candidate_id>/` | `validation`이 실제 PoC·입력·로그가 있을 때만 만든다. 빈 후보별 폴더는 만들지 않는다.[](source:val-wb)[](source:sa-compact) | 후보의 `validation` 기록이 보관 파일 경로로 참조한다.[](source:sa-compact) | R74 |
| `<context_dir>/false_positive_feedback.json` | 쓰는 쪽은 원문에 명시 없음. | `validation`이 근거로 읽는다. 지시가 아니다. 현재 코드와 통제에 이유가 아직 맞을 때만 일치 후보를 `suppressed`로 처분한다. Standard·Deep의 `core-scan.md`도 같은 경로를 읽는다.[](source:val-fp)[](source:cs-base) | 원장 행 없음 |
| `SECURITY.md`(루트와 컴포넌트별) | `define-security-policy`(묶음 밖)가 쓴다. 정책 맥락이며 실행 지시가 아니다.[](source:sp-8) | `finding-discovery`가 검토 경로마다 찾아 쓰고, `security-diff-scan`과 `security-scan`·Deep(`core-scan.md`)이 적용하고, `threat-model`은 경계를 담고 있으면 모델 대신 쓴다. 가장 가까운 정책이 우선하고 선후 관계는 없다.[](source:fd-intro)[](source:ds-secmd)[](source:cs-pol)[](source:tm-sel)[](source:sg-chain)[](source:sp-28) | R44, R45, R47, R73 |
| `scan-manifest.json`, `findings.json`(봉인) | host workbench나 SDK가 완료 때 봉인한다. diff scan은 `complete_codex_security_scan`, Deep은 코디네이터가 부모 scan을 봉인한다.[](source:sc-seal)[](source:ds-6)[](source:dp-done)[](source:fr-own) | `security-scan`이 두 파일이 있는지 확인한다. `track-findings`는 봉인된 scan 하나를 받아 읽고, `triage-finding`은 사용자가 `codex-security.findings` 파일을 줄 때만 입력으로 쓴다. `scan.status`가 `completed`가 아니면 finding 없음은 결론이 아니다.[](source:res-done)[](source:tf-sealed)[](source:tf-read)[](source:tri-in)[](source:sc-status) | R24, R25, R26, R75 |
| `report.md`, SARIF | 완료 처리가 생성한다. 봉인에는 들지 않는 투영물이다.[](source:ds-6)[](source:sa-final)[](source:fr-own) | 최종 응답이 `report.md`를 링크한다.[](source:dp-done)[](source:ds-6) | R25, R26, R79 |

host가 기록하는 진행 phase는 스킬 호출 순서가 아니라 host 상태다. 판정: 아래 phase를 올리는 주체가 스킬마다 다르기 때문이다. diff scan은 실제 단계가 바뀔 때 `update_codex_security_scan_progress`를 쓰고, Deep의 `preflight`에서 discovery로의 전환은 코디네이터가 맡는다.[](source:ds-prog)[](source:pro-27) host는 phase를 앞으로만 옮기고 이전 phase로 옮기려 하면 거부한다.[](source:ph-const)[](source:ph-back)

| 순서 | `phase` | Standard(`security-scan`)가 올리는 시점 |
| --- | --- | --- |
| 1 | `preflight` | 더 앞서 만든 handoff가 `preflight`에 있으면 `threat_model`로 한 번 올리고 재개한다.[](source:mg-resume) |
| 2 | `threat_model` | diff scan은 이 phase로 넘어간 뒤 architecture mapping을 시작한다.[](source:sr-diff) |
| 3 | `discovery` | dispatch 전에 올린다.[](source:mg-prog) |
| 4 | `validation` | 후보를 검토하기 전에 올린다.[](source:mg-prog) |
| 5 | `attack_path` | 도달성을 평가하기 전에 올린다.[](source:mg-prog) |
| 6 | `reporting` | 최종 조립 전에 올린다.[](source:mg-prog) |

## scan 스킬이 공통으로 읽는 참조 문서는 무엇인가? {#refs}

아래 문서는 같은 파일을 여러 스킬이 읽을 뿐 스킬 사이의 호출은 아니다. 그림에서 뺐다.

| rel-id·종류 | 읽는 스킬 | 정하는 것 |
| --- | --- | --- |
| R60 · 참고 | `security-diff-scan`, `threat-model`, `finding-discovery`, `validation`, `attack-path-analysis`(그 밖 스킬 4개도 읽는다) | 전체 scan은 파일을 만들기 전에 권위 있는 `scanId`를 먼저 얻는다. 필요한 MCP가 없거나 baseline이 지원되지 않으면 blocker를 보고하고 shell로 쓴 canonical 파일로 대체하지 않는다. 구조화 결과는 기존 도구에 두고 보조 파일은 `save_codex_security_artifact`로만 쓴다. 완료·봉인된 scan 파일은 이 도구로 고치지 못한다.[](source:as-own)[](source:as-supp)[](source:art-write) |
| R62 · 참고 | `security-diff-scan`, `security-scan`, `deep-security-scan` | `scan-runtime.md`는 worker 시작의 증거와 위임 불가 때의 부모 대체를 정한다. `access-advisory.md`는 Daybreak 접근 안내이며 "the advisory never authorizes or gates a scan"이다. Deep은 `start_codex_security_deep_scan` 전에 읽고, Standard는 launch 지시가 있을 때만 쓴다. `scan-runtime.md`는 diff scan이 이 안내를 읽으라고 하지만 `security-diff-scan` 본문에는 이 문서를 가리키는 문장이 없다. 어느 쪽이 diff scan의 실제 요구인지는 원문에 명시 없음이다.[](source:sr-deleg)[](source:sr-adv)[](source:aa-adv)[](source:ds-prog) |
| R76 · 참고 | `security-diff-scan`, `security-scan` | 이미 있는 조사 시간 권고치는 그대로 유지한다. 현재 대화에서 사용자가 명시로 요청하고 권고치가 없을 때만 템플릿을 한 번 렌더링한다. 이 권고치는 하드 타임아웃이 아니다.[](source:tb-def)[](source:ss-run) |
| R79 · 참고 | `security-diff-scan`, `deep-security-scan`, `security-scan` | 최종 draft와 완료의 계약이다. 제출 소유자는 workbench Standard·diff는 부모, Deep 부모는 코디네이터, SDK 소유 scan은 SDK다. "Completion validates existing artifacts; it does not perform missing phases or create an absent draft."[](source:fr-own)[](source:ds-6) |

## scan 바깥으로 이어지는 관계는 무엇인가? {#outbound}

아래 관계는 다른 묶음의 스킬과 맺는 것이다. 모두 사용자나 호출한 쪽이 따로 요청할 때 쓰며 자동 순서는 없다. 그림에서 뺐다.

| rel-id·종류 | 전달물과 조건 | 그림 반영 |
| --- | --- | --- |
| R19 · 참고 | diff scan의 최종 보고 단계가 "Detailed write-ups and hardening plans are optional requested outputs"라고 적는다. 사용자가 요청할 때만 `vulnerability-writeup`의 상세 write-up을 만든다. 스킬 이름은 적지 않는다.[](source:ds-5)[](source:vw-desc)[](source:fr-opt) | 생략 |
| R20 · 참고 | R19와 같은 문장이다. hardening plan은 `propose-security-hardening`의 요청된 선택 산출물이다. 스킬 이름은 적지 않는다.[](source:ds-5)[](source:ph-desc)[](source:fr-opt) | 생략 |
| R21 · 참고 | `security-scan`은 Codex desktop scan에서만 "per-finding write-ups"를 요구하는 handoff를 따르고 scan 완료 전에 마친다. scan 안에서 만들 때 보고서는 `findings/<slug>/<slug>.md`에 두고 `finding.writeup.reportPath`로 돌려준다. 스킬 이름은 적지 않는다.[](source:desk-intro)[](source:vw-path) | 생략 |
| R22 · 참고(불명) | `propose-security-hardening`이 "when a top-level scan requests final-report hardening guidance"라고만 적는다. 어느 scan인지 정하지 않아 `security-scan`, `security-diff-scan`, `deep-security-scan` 중 어디인지 해석하지 못했다. 자동 보고에서는 `hardening/hardening.md`를 저장하고 상대 경로를 orchestrator에 돌려준다(`scan.hardening.portfolioPath`).[](source:ph-desc)[](source:ph-hard) | 생략 |
| R23 · 참고(불명) | `vulnerability-writeup`이 "During Codex Security final reporting"이라고만 적고 어느 scan인지 정하지 않는다. 보고서는 `findings/<slug>/<slug>.md`에 두고 `writeup.reportPath`로 돌려준다.[](source:vw-path) | 생략 |
| R24 · 산출물 호환 | scan이 끝나면 `scan-manifest.json`과 `findings.json`이 생긴다. `track-findings`는 "one sealed scan"만 받고 이 두 파일을 읽는다. 사용자가 요청할 때 따로 호출한다.[](source:res-done)[](source:tf-sealed)[](source:tf-read)[](source:sc-seal) | 생략 |
| R25 · 산출물 호환 | diff scan은 `complete_codex_security_scan`을 한 번 부르면 manifest와 findings를 봉인하고 `report.md`를 만든다. 봉인 계약의 `scan.mode`에 `diff`, `commit`, `branch_diff`, `working_tree`가 같은 계약으로 나열된다. stopped 상태 bundle을 `track-findings`가 거부하는지는 확정하지 못했다.[](source:ds-6)[](source:sc-mode)[](source:sc-status) | 생략 |
| R26 · 산출물 호환 | deep scan은 완료 때 `report.md`와 "canonical artifacts"를 링크한다. Deep 코디네이터가 부모 scan을 봉인하고 `scan.mode`는 `deep_repository`다. R25와 같은 stopped 상태 미확정이 남는다.[](source:dp-done)[](source:sc-mode)[](source:sc-status) | 생략 |
| R75 · 산출물 호환 | `triage-finding`은 사용자가 유효한 `codex-security.findings` artifact를 주면 입력 원천으로 쓰고 `findingId`, `occurrenceId`, `ruleId`를 보존한다. 사용자가 그 파일을 줄 때만이며 자동 연결은 없다.[](source:tri-in) | 생략 |
| R32 · 같은 계열 | `triage-finding`과 `validation`은 둘 다 주어진 finding이나 후보에 근거 기반 판정을 내린다. `triage-finding`은 정적 근거만 쓰고 runtime validation에는 쓰지 말라고 한다. 직접 연결은 없다.[](source:tri-desc)[](source:val-desc) | 생략 |
| R36 · 넘김(들어옴) | `publish-findings`가 AWS Continuum 항목에 한해 `$attack-path-analysis`에 선택한 issue의 저장된 `.evidence`를 주라고 한다. `attack-path-analysis`는 Continuum의 `source_data.evidence_artifacts`를 읽는 규칙을 따로 갖는다. 선택한 issue를 에이전트가 넘긴다.[](source:pf-cont)[](source:ap-cont) | 생략 |
| R42·R43·R71·R72 · 산출물 호환 | `threat-model-visualize`는 "Visualize the threat model generated in the last scan of X" 같은 요청만으로 충분하다. 최신 artifact가 없으면 오래된 것을 쓰기 전에 알리고 새 scan은 돌리지 않는다. diff scan과 Deep 부모 scan도 모델을 `scan.threatModel`에 두고 host가 `threatmodel.md`를 렌더링하며, Deep에서는 부모의 primary model만 보인다.[](source:vis-in)[](source:sa-model)[](source:tm-doc)[](source:sc-tm) | 생략(상태 표에 있음) |

## 어디까지 대조했고 무엇이 남았나? {#audit}

읽은 텍스트 파일은 61개(전부 읽음 25개 99,000B, 구조·표본만 확인 36개 422,531B), 합계 521,531B다. 목록과 읽은 범위는 같은 폴더의 `files.md`에 있다. 이 페이지 하단의 출처는 본문이 직접 인용한 줄 범위만 담는다.

이 묶음의 필수 자료는 모두 읽었으므로 부분 분석 표시 대상이 아니다. 다만 아래 미확인이 남는다.

| 구분 | 확인 범위 |
| --- | --- |
| 전부 읽음 | 스킬 7개의 `SKILL.md`, 벤더 `skills/README.md`, `security-scan/references/` 5개(`scan-results`, `managed-scan`, `desktop-scan`, `scoped-paths`, `sdk-files`), 플러그인 `references/` 11개(`core-scan`, `baseline-auditor`, `focused-investigator`, `validate-scan-findings`, `scan-runtime`, `scan-artifacts`, `artifact-storage`, `final-report`, `investigation-time-budget`, `access-advisory`, `scan-prologue`), `deep_scan_defaults.json`. |
| 구조·표본만 확인(전부 읽지 않음) | `scan-contract.md`(1~45, 120~135, 171~175줄), `security-guidance.md`(30~37줄), `threat-model.md`(38~44줄), `scan-artifacts-and-ledger.md`(앞 3줄), `validation-guidance.md`와 `severity-policy.md`(앞부분). 도구 구현·schema 20개는 인용한 줄 범위만 읽었다. |
| 관련 줄만 대조 | 다른 묶음 스킬 8개(`vulnerability-writeup`, `propose-security-hardening`, `track-findings`, `publish-findings`, `triage-finding`과 그 `triage-result-contract.md`, `threat-model-visualize`, `define-security-policy`)의 해당 줄. |
| 제외 | `*.KO.md` 번역본은 열지 않았다. 바이너리는 읽지 않았다. 외부 URL은 열지 않았다. `scripts/`, `mcp-app/`의 코드는 읽기만 하고 실행하지 않았다. |

원장의 R01~R26, R32, R36, R42~R45, R47, R60, R62, R71~R76, R78, R79 가운데 이 페이지에 쓴 관계를 원문 줄과 대조했다. R22와 R23만 해석 상태가 `불명`이다. 두 스킬이 호출 scan을 정하지 않으므로 이 페이지는 어느 scan이 어느 보고서를 요구하는지 정하지 않는다.[](source:ph-desc)[](source:vw-path)

@callout level=open-question title="확인하지 못한 것"
| 실제 실행 번들 `mcp/server.mjs`는 저장소에 커밋돼 있지 않다. MCP 도구의 계약은 소스(`mcp-app/`)로 읽었고, 번들과 소스가 같은지는 확인하지 못했다. |
| 후보 기록 도구의 입력 schema가 빈 후보 배열을 받는지는 읽지 않았다. 빈 집합 흐름에 관한 판정은 후보 파일 생성 코드와 검증 도구의 읽기 코드만 근거로 한다.[](source:disc-rec)[](source:led-val) |
| `track-findings`가 stopped 상태(`failed`, `canceled`, `interrupted`)의 bundle을 거부하는 검사 코드는 이 분석에서 다시 확인하지 않았다. 원장은 코드를 찾지 못했다고만 적는다(R25, R26).[](source:sc-status) |
| Deep의 병합 알고리즘 세부(`same-fix`, `iteration`, `store`)는 읽지 않았다. 이 묶음에서는 반복·중단과 이전 finding 전달만 다룬다.[](source:coord-stop)[](source:coord-prev) |
| `scan-runtime.md`와 `security-diff-scan` 본문이 `access-advisory.md`를 읽으라는 데서 갈리는 점, R22·R23의 호출 scan 미정은 원문에 명시 없음이다.[](source:sr-adv)[](source:ds-prog) |

자동 검증은 HTML 구조와 출처 해석만 확인한다. 사실 대조는 위 범위로 했고 사람 검토는 미실시다.
