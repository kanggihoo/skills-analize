# security-scan은 현재 소스의 취약점을 어떤 순서로 감사하게 하나? {#security-scan-page}

`security-scan`은 저장소 전체나 지정 경로의 **현재 소스**를 한 번의 감사(single pass)로 점검하게 하는 기본 스킬이다. 에이전트는 먼저 target과 scope를 scan에 묶고, 읽기 전용·offline으로 `core-scan.md`의 감사 절차를 따라 공격자가 실제로 악용할 수 있는 취약점만 소스 줄과 영향을 붙여 보고한다.[](source:front)[](source:intent)[](source:core)[](source:cs-noskill)

- 소스를 읽기 전에 target과 scope를 scan에 묶는다. 실행 중인 Standard scan이 아니면 소스 검토를 시작하지 않는다.[](source:bind-man)[](source:m-resume)
- 감사 본체는 `core-scan.md` 8단계다. 독립 baseline 감사, 집중 조사, 후보 검증 순이다. 단계 스킬과 순위 phase, 파일별 ledger, receipt 파일은 쓰지 않는다.[](source:cs-base)[](source:cs-noskill)
- 검토는 읽기 전용이고 offline이다. 소스에서 찾은 credential은 쓰지도 않고 서비스에 보내 확인하지도 않는다.[](source:guard)[](source:cs-secret)
- 끝낼 때는 `complete: true` draft를 한 번 제출하고 `complete_codex_security_scan`을 한 번 부른다. SDK가 소유한 scan은 SDK가 끝낸다.[](source:rs-done)

@answer scope="분석 커밋 cd5035b · 필수 참조 문서와 MCP 도구 계약까지 읽음 · 코드와 도구는 실행하지 않음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source front title="codex-security/plugins/codex-security/skills/security-scan/SKILL.md · 2972B · 스킬 본문(원본) frontmatter" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=1:4
@source intent title="codex-security/plugins/codex-security/skills/security-scan/SKILL.md · 2972B · 스킬 본문(원본) 목적" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=8:8
@source core title="codex-security/plugins/codex-security/skills/security-scan/SKILL.md · 2972B · 스킬 본문(원본) core audit 지시" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=10:10
@source bind-sdk title="codex-security/plugins/codex-security/skills/security-scan/SKILL.md · 2972B · 스킬 본문(원본) SDK scan" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=16:16
@source bind-man title="codex-security/plugins/codex-security/skills/security-scan/SKILL.md · 2972B · 스킬 본문(원본) managed scan 도구 분기" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=17:17
@source guard title="codex-security/plugins/codex-security/skills/security-scan/SKILL.md · 2972B · 스킬 본문(원본) 읽기 전용·URL·시간 제한" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=19:19
@source start title="codex-security/plugins/codex-security/skills/security-scan/SKILL.md · 2972B · 스킬 본문(원본) 저장과 검증 순서" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=21:21
@source yaml title="codex-security/plugins/codex-security/skills/security-scan/agents/openai.yaml · 245B · UI 표시와 default_prompt(원본)" path=codex-security/plugins/codex-security/skills/security-scan/agents/openai.yaml lines=1:4
@source readme title="codex-security/plugins/codex-security/skills/README.md · 3752B · 벤더의 스킬 선택 안내" path=codex-security/plugins/codex-security/skills/README.md lines=7:9
@source m-resume title="codex-security/plugins/codex-security/skills/security-scan/references/managed-scan.md · 1356B · managed Standard scan 시작·재개" path=codex-security/plugins/codex-security/skills/security-scan/references/managed-scan.md lines=3:5
@source m-phase title="codex-security/plugins/codex-security/skills/security-scan/references/managed-scan.md · 1356B · managed Standard scan 진행 보고" path=codex-security/plugins/codex-security/skills/security-scan/references/managed-scan.md lines=9:11
@source rs-sdk title="codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md · 2871B · scan 결과 저장 SDK 환경" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md lines=3:5
@source rs-draft title="codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md · 2871B · scan 결과 저장 draft" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md lines=7:9
@source rs-done title="codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md · 2871B · scan 결과 저장 완료" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md lines=11:13
@source rs-fail title="codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md · 2871B · scan 결과 저장 실패 처리" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md lines=15:15
@source sc-all title="codex-security/plugins/codex-security/skills/security-scan/references/scoped-paths.md · 2359B · 지정 경로 inventory" path=codex-security/plugins/codex-security/skills/security-scan/references/scoped-paths.md lines=3:11
@source sdk-all title="codex-security/plugins/codex-security/skills/security-scan/references/sdk-files.md · 2192B · SDK scan 파일 handoff" path=codex-security/plugins/codex-security/skills/security-scan/references/sdk-files.md lines=3:7
@source sdk-repo title="codex-security/plugins/codex-security/skills/security-scan/references/sdk-files.md · 2192B · SDK scan 파일 handoff 종료" path=codex-security/plugins/codex-security/skills/security-scan/references/sdk-files.md lines=22:24
@source d-write title="codex-security/plugins/codex-security/skills/security-scan/references/desktop-scan.md · 580B · Codex desktop 결과 출력" path=codex-security/plugins/codex-security/skills/security-scan/references/desktop-scan.md lines=3:5
@source ledger-head title="codex-security/plugins/codex-security/skills/security-scan/references/scan-artifacts-and-ledger.md · 7021B · diff 단독 발견용 worklist 머리말" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-artifacts-and-ledger.md lines=1:3
@source cs-allow title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · 공통 감사 절차 시간 allowance" path=codex-security/plugins/codex-security/references/core-scan.md lines=5:5
@source cs-ctx title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · 공통 감사 절차 1단계" path=codex-security/plugins/codex-security/references/core-scan.md lines=9:9
@source cs-base title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · 공통 감사 절차 2단계" path=codex-security/plugins/codex-security/references/core-scan.md lines=10:10
@source cs-tm title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · 공통 감사 절차 3단계" path=codex-security/plugins/codex-security/references/core-scan.md lines=11:11
@source cs-pack title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · 공통 감사 절차 4단계" path=codex-security/plugins/codex-security/references/core-scan.md lines=12:12
@source cs-inv title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · 공통 감사 절차 5단계" path=codex-security/plugins/codex-security/references/core-scan.md lines=13:13
@source cs-ckpt title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · 공통 감사 절차 6단계" path=codex-security/plugins/codex-security/references/core-scan.md lines=14:14
@source cs-val title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · 공통 감사 절차 7단계" path=codex-security/plugins/codex-security/references/core-scan.md lines=15:15
@source cs-asm title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · 공통 감사 절차 8단계" path=codex-security/plugins/codex-security/references/core-scan.md lines=16:16
@source cs-noskill title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · 공통 감사 절차 단계 스킬 금지" path=codex-security/plugins/codex-security/references/core-scan.md lines=18:18
@source cs-wait title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · 공통 감사 절차 worker 대기" path=codex-security/plugins/codex-security/references/core-scan.md lines=20:20
@source cs-src title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · 공통 감사 절차 검색 도구와 정책" path=codex-security/plugins/codex-security/references/core-scan.md lines=24:26
@source cs-secret title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · 공통 감사 절차 소스 안 credential" path=codex-security/plugins/codex-security/references/core-scan.md lines=30:32
@source cs-sev title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · 공통 감사 절차 심각도" path=codex-security/plugins/codex-security/references/core-scan.md lines=36:36
@source ba-checks title="codex-security/plugins/codex-security/references/baseline-auditor.md · 2839B · 독립 baseline 감사 점검 목록" path=codex-security/plugins/codex-security/references/baseline-auditor.md lines=5:10
@source ba-cred title="codex-security/plugins/codex-security/references/baseline-auditor.md · 2839B · 독립 baseline 감사 credential" path=codex-security/plugins/codex-security/references/baseline-auditor.md lines=12:12
@source ba-rules title="codex-security/plugins/codex-security/references/baseline-auditor.md · 2839B · 독립 baseline 감사 제약" path=codex-security/plugins/codex-security/references/baseline-auditor.md lines=14:16
@source ba-ret title="codex-security/plugins/codex-security/references/baseline-auditor.md · 2839B · 독립 baseline 감사 반환 형식" path=codex-security/plugins/codex-security/references/baseline-auditor.md lines=18:18
@source fi-lead title="codex-security/plugins/codex-security/references/focused-investigator.md · 2548B · 집중 조사 지시문" path=codex-security/plugins/codex-security/references/focused-investigator.md lines=3:3
@source fi-rules title="codex-security/plugins/codex-security/references/focused-investigator.md · 2548B · 집중 조사 제약과 반환 형식" path=codex-security/plugins/codex-security/references/focused-investigator.md lines=11:13
@source vsf title="codex-security/plugins/codex-security/references/validate-scan-findings.md · 1131B · 검증 지시문" path=codex-security/plugins/codex-security/references/validate-scan-findings.md lines=3:3
@source sv-top title="codex-security/plugins/codex-security/references/default-severity-rubric.md · 3348B · 기본 심각도 기준 원칙" path=codex-security/plugins/codex-security/references/default-severity-rubric.md lines=3:3
@source sv-crit title="codex-security/plugins/codex-security/references/default-severity-rubric.md · 3348B · 기본 심각도 기준 Critical" path=codex-security/plugins/codex-security/references/default-severity-rubric.md lines=7:13
@source sv-high title="codex-security/plugins/codex-security/references/default-severity-rubric.md · 3348B · 기본 심각도 기준 High" path=codex-security/plugins/codex-security/references/default-severity-rubric.md lines=17:21
@source sv-med title="codex-security/plugins/codex-security/references/default-severity-rubric.md · 3348B · 기본 심각도 기준 Medium" path=codex-security/plugins/codex-security/references/default-severity-rubric.md lines=25:25
@source sv-low title="codex-security/plugins/codex-security/references/default-severity-rubric.md · 3348B · 기본 심각도 기준 Low" path=codex-security/plugins/codex-security/references/default-severity-rubric.md lines=29:29
@source sv-info title="codex-security/plugins/codex-security/references/default-severity-rubric.md · 3348B · 기본 심각도 기준 Informational" path=codex-security/plugins/codex-security/references/default-severity-rubric.md lines=33:33
@source adv title="codex-security/plugins/codex-security/references/access-advisory.md · 1373B · Daybreak 접근 안내" path=codex-security/plugins/codex-security/references/access-advisory.md lines=3:11
@source tb title="codex-security/plugins/codex-security/references/investigation-time-budget.md · 1749B · 조사 시간 allowance 템플릿" path=codex-security/plugins/codex-security/references/investigation-time-budget.md lines=3:11
@source fr-own title="codex-security/plugins/codex-security/references/final-report.md · 12135B · 최종 결과 소유자 표" path=codex-security/plugins/codex-security/references/final-report.md lines=7:16
@source fr-state title="codex-security/plugins/codex-security/references/final-report.md · 12135B · 최종 결과 review state" path=codex-security/plugins/codex-security/references/final-report.md lines=34:38
@source fr-err title="codex-security/plugins/codex-security/references/final-report.md · 12135B · 최종 결과 오류 복구" path=codex-security/plugins/codex-security/references/final-report.md lines=57:59
@source fr-resp title="codex-security/plugins/codex-security/references/final-report.md · 12135B · 최종 결과 usage 보고" path=codex-security/plugins/codex-security/references/final-report.md lines=77:77
@source fr-code title="codex-security/plugins/codex-security/references/final-report.md · 12135B · 최종 결과 code-comment 형식" path=codex-security/plugins/codex-security/references/final-report.md lines=81:85
@source sc-status title="codex-security/plugins/codex-security/references/scan-contract.md · 16529B · 봉인 계약 scan status" path=codex-security/plugins/codex-security/references/scan-contract.md lines=32:41
@source as-own title="codex-security/plugins/codex-security/references/artifact-storage.md · 7947B · artifact 저장 scan 소유권" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=7:9
@source as-tm title="codex-security/plugins/codex-security/references/scan-artifacts.md · 11701B · scan 경로 규약 위협 모델" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=28:29
@source srv-std title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · MCP 서버 Standard scan 시작 도구" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=571:607
@source srv-po2 title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · MCP 서버 prompt-only scan 입력 검사" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=652:670
@source srv-ctx title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · MCP 서버 scan context 조회 설명" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1353:1353
@source srv-phase title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · MCP 서버 progress phase 목록" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=340:348
@source srv-comp title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · MCP 서버 완료 도구" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1567:1573
@source srv-adv title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · MCP 서버 Standard scan 접근 안내 반환" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=2071:2074
@source ct-draft title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 15421B · MCP 서버 draft 저장 도구" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=169:186
@source tmdoc title="codex-security/plugins/codex-security/mcp-app/src/threat-model-document.ts · 2657B · MCP 서버 threatmodel.md 생성" path=codex-security/plugins/codex-security/mcp-app/src/threat-model-document.ts lines=33:70
@source p-tm title="codex-security/plugins/codex-security/skills/threat-model/SKILL.md · 2986B · 단계 스킬(호출 제한 확인용)" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=8:8
@source p-fd title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · 단계 스킬(호출 제한 확인용)" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=14:14
@source p-val title="codex-security/plugins/codex-security/skills/validation/SKILL.md · 4619B · 단계 스킬(호출 제한 확인용)" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=21:21
@source p-ap title="codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md · 5355B · 단계 스킬(호출 제한 확인용)" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=27:27
@source diff-desc title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 형제 스킬 description" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=3:3
@source deep-desc title="codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md · 3127B · 형제 스킬 description" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=3:3
@source deep-loop title="codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md · 3127B · 형제 스킬 반복 방식" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=8:8
@source track-8 title="codex-security/plugins/codex-security/skills/track-findings/SKILL.md · 13459B · 이어지는 스킬 입력 조건" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=8:8
@source track-24 title="codex-security/plugins/codex-security/skills/track-findings/SKILL.md · 13459B · 이어지는 스킬 읽는 파일" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=24:24
@source vis-10 title="codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md · 19102B · 이어지는 스킬 입력 조건" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=10:10
@source tf-12 title="codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md · 4447B · 이어지는 스킬 findings 입력 조건" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=12:12
@source fd-schema title="codex-security/plugins/codex-security/schemas/findings.schema.json · 10591B · findings 문서 documentType" path=codex-security/plugins/codex-security/schemas/findings.schema.json lines=7:7
@source vw-42 title="codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md · 5571B · 이어지는 스킬 write-up 경로" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=42:42
@source sp-8 title="codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md · 5982B · SECURITY.md 작성 스킬 성격" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=8:8
@source ecc-head title="ecc/security-scan/SKILL.md · 4592B · 동명 스킬 머리말" path=ecc/security-scan/SKILL.md lines=1:3
@source lock title="codex-security/skills-lock.json · 6525B · 설치 기록 이 스킬 항목" path=codex-security/skills-lock.json lines=82:87
@source cs-intro title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · 공통 감사 절차 원칙" path=codex-security/plugins/codex-security/references/core-scan.md lines=3:3
@source fr-top title="codex-security/plugins/codex-security/references/final-report.md · 12135B · 최종 결과 canonical 문서" path=codex-security/plugins/codex-security/references/final-report.md lines=3:3
@source as-place title="codex-security/plugins/codex-security/references/scan-artifacts.md · 11701B · scan 경로 규약 report.md 직접 작성 금지" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=122:122
@source wp title="codex-security/plugins/codex-security/scripts/workbench_progress.py · 16640B · workbench phase 되돌림 거부" path=codex-security/plugins/codex-security/scripts/workbench_progress.py lines=267:268
@source vis-8 title="codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md · 19102B · 이어지는 스킬 목적" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=8:8
@source dd-core title="codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md · 2215B · deep worker prompt 템플릿" path=codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md lines=7:7

## 언제 켜지고, 언제 쓰면 안 되나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻은 아니다. `disable-model-invocation` 같은 호출 제한 필드는 frontmatter에 원문에 명시 없음이다. `agents/openai.yaml`에도 `policy` 항목이 없다.[](source:front)[](source:yaml)

@code source=front language=yaml

description은 스캔 대상으로 세 스킬을 가른다. 벤더 안내문도 이 스킬을 "Start here for a general review"로 둔다.[](source:front)[](source:readme)

| 요청 | 쓰는 스킬 | 근거 |
| --- | --- | --- |
| 저장소 전체나 폴더를 현재 소스 기준으로 한 번 감사한다 | `security-scan` {good:기본} | "default single-pass audit"라고 description이 적는다.[](source:front) |
| PR, commit, branch, working-tree 변경을 본다 | `security-diff-scan` {caution:이 스킬이 아님} | 스킬 이름은 적지 않고 "the diff skill"로만 지목한다.[](source:front)[](source:diff-desc) |
| 사용자가 deep scan을 명시적으로 요청한다 | `deep-security-scan` {caution:이 스킬이 아님} | "an explicitly requested deep scan"에만 deep 스킬을 쓴다.[](source:front)[](source:deep-desc) |

`default_prompt`는 이 스킬을 이름으로 불러 "exploitable vulnerabilities"와 소스 근거를 요구하는 예시다.[](source:yaml)

판정 · 이 스킬은 얇은 진입점이다. 감사 방법은 플러그인 루트 `references/core-scan.md`에 있고, SKILL.md 10줄이 그 문서를 직접 지목한다.[](source:core)

이 스킬 폴더의 `references/scan-artifacts-and-ledger.md`는 이 스킬이 쓰지 않는다. 문서가 스스로 "Standard, Deep, and compact Workbench Diff scans do not use it"이라고 밝히고, 단독·옛 diff 발견용이라고 적는다.[](source:ledger-head)

## scan은 어떻게 묶고, 시작 전에 무엇을 지키나? {#bind}

SKILL.md는 소스를 읽기 전에 요청된 target과 scope를 묶으라고 한다. SDK가 준 scan이 있으면 그것을 쓰고, 없으면 managed 도구를 쓴다.[](source:bind-sdk)[](source:bind-man)

@workflow id=scan-bind-route title="scan을 묶는 경로"
| ask | Standard scan 요청 | external |
| sdk | SDK가 scan을 줬나? | backend |
| reg | 등록된 scan 사용 | backend | source:bind-sdk |
| hasid | scan ID가 있나? | backend |
| ctx | scan context 조회 | backend | source:bind-man |
| desk | desktop으로 확인됐나? | backend |
| po | prompt-only 시작 | backend | source:bind-man |
| std | Standard 시작 | backend | source:bind-man |
| run | 실행 중 Standard인가? | backend | source:bind-man |
| review | 소스 검토 시작 | backend |
| stop | 소스 검토 전 중단 | security | source:m-resume |
| ask > sdk | |
| sdk > reg | 예 |
| sdk > hasid | 아니오 |
| hasid > ctx | 예 |
| hasid > desk | 아니오 |
| desk > po | 예 |
| desk > std | 아니오 |
| reg > review | |
| ctx > run | |
| po > run | |
| std > run | |
| run > review | 예 | emphasis |
| run > stop | 아니오 | security |

@steps id=bind-steps
| sdk | SDK가 scan을 줬나? | SDK가 `CODEX_SECURITY_SCAN_ID`와 `CODEX_SECURITY_SCAN_DIR`을 주면 그 등록 scan을 쓴다. SDK의 launch 지시를 따르고, 지시가 없으면 `scan-results.md`의 SDK handoff를 따른다. 등록 환경만 주면 `CODEX_SECURITY_REPOSITORY`를 target으로 쓴다.[](source:bind-sdk)[](source:rs-sdk) | scan-bind-route | sdk |
| hasid | scan ID가 있나? | scan ID가 있으면 handoff token이 있을 때 그 token으로 `get_codex_security_scan_context`를 부른다. owning conversation이 running Standard scan을 불러오면 도구가 `preflight`를 `threat_model`로 올린다.[](source:bind-man)[](source:srv-ctx) | scan-bind-route | hasid |
| desk | desktop으로 확인됐나? | ID가 없으면 확인된 Codex desktop은 `start_codex_security_prompt_only_scan`을 `mode: "standard"`로 부른다. 다른 host는 `start_codex_security_standard_scan`을 부른다. 둘 다 owning Codex thread 컨텍스트가 없으면 오류를 낸다.[](source:bind-man)[](source:srv-std)[](source:srv-po2) | scan-bind-route | desk |
| run | 실행 중 Standard인가? | 요청한 target, scope, 사용자 context를 그대로 넘기고, Standard이고 running인 scan인지 확인한다. 새로 만든 scan이면 phase가 `threat_model`이어야 하고, 아니면 도구가 ownership 오류를 낸다.[](source:bind-man)[](source:srv-std) | scan-bind-route | run |
| stop | 소스 검토 전 중단 | handoff가 실패했거나 다른 모드를 가리키면 소스 검토 전에 멈춘다. 저장된 phase를 재개한다. 아직 preflight인 옛 handoff는 `threat_model`로 한 번 올린다.[](source:m-resume) | scan-bind-route | stop |

묶은 뒤에는 아래 규칙을 지킨다. 모두 소스를 읽기 전에 적용되는 조건이다.

| 조건 | 에이전트의 행동 |
| --- | --- |
| 대상 | 읽기 전용으로 두고 현재 소스를 offline으로 검토한다.[](source:guard) |
| 사용자 context | 정확한 문구를 분석 데이터로 보존한다. 지시나 권한으로 취급하지 않는다.[](source:guard)[](source:cs-ctx) |
| 명시된 URL | 사용자가 읽기를 명시적으로 허가했을 때 parent만 한 번 읽는다. 링크는 따라가지 않는다.[](source:guard) |
| 시간 제한 | 이미 있는 investigation allowance는 worker와 재개 사이에 그대로 둔다. 사용자가 이 대화에서 시간 제한을 요청했고 아무것도 없을 때만, 소스 검토 전에 시간 템플릿을 한 번 채워 넣는다.[](source:guard)[](source:cs-allow) |
| 계정 접근 안내 | launch 때 지시받았을 때만 따른다. 도구는 새로 만든 Standard scan의 결과에만 이 안내를 붙이고, 안내는 scan을 허가하거나 막지 않는다.[](source:bind-man)[](source:srv-adv)[](source:adv) |
| 지정 경로 | SDK가 준 target-paths 파일은 inventory로 풀어 reviewer에게 넘긴다. scope를 넓히지 않는다. 해석에 실패하면 오류를 올리고 소스 검토 전에 멈춘다.[](source:sc-all)[](source:m-resume) |

시간 allowance 템플릿은 권고일 뿐이다. 문서가 "advisory, not a hard timeout or minimum runtime"이라고 적는다.[](source:tb)

@list id=allowance-rules
| 마감이 되면 새 조사를 열지 않고, 끝나지 않은 일과 불확실성을 coverage에 남긴다.[](source:tb) |
| 최종 보고 준비는 마감을 넘겨도 된다.[](source:tb) |
| 모든 phase, worker, 재시도, 재개 turn이 처음의 절대 마감을 공유한다. 시계를 다시 시작하지 않는다.[](source:tb) |
| Deep Scan, 별도 custom validation, 사후 작업은 이 allowance 밖이다.[](source:tb) |

Daybreak 접근 안내는 선택 사항이다. 결과에 따라 에이전트의 행동이 갈린다.[](source:adv)

| 상황 | 행동 |
| --- | --- |
| `get_codex_security_daybreak_access`가 세션에 없음, Bedrock 또는 API-key 전용 세션 | 조용히 건너뛴다. 다른 접근 도구를 찾아보지 않는다.[](source:adv) |
| 호출 실패, `unknown`, `stale: true` | 경고 없이 계속한다.[](source:adv) |
| 최신 `granted` | 상태와 쓸 수 있는 Daybreak program을 알린다.[](source:adv) |
| 최신 `not_granted` | 다른 진행 보고보다 먼저 눈에 띄는 경고를 보이고 `enrollmentUrl`을 링크한다. 없으면 대체 주소를 쓴다.[](source:adv) |

## 감사는 어떤 순서로 진행하고 무엇으로 후보를 가르나? {#audit-flow}

SKILL.md는 순서를 한 문단으로 줄이고 세부는 `core-scan.md`에 맡긴다. 그 문서가 8단계 절차를 정한다.[](source:core)[](source:start)

@workflow id=core-audit title="core-scan.md의 8단계 감사"
| lane ready | 준비 |
| lane probe | 조사 |
| lane wrap | 정리 |
| scope | 대상·정책 확인 | backend | ready | source:cs-ctx |
| base | 독립 baseline 감사 | backend | ready | source:cs-base |
| map | 구조 파악 | backend | ready | source:cs-tm |
| pack | 조사 packet 묶기 | backend | probe | source:cs-pack |
| invest | 집중 조사 위임 | backend | probe | source:cs-inv |
| ckpt | 후보 checkpoint | database | wrap | source:cs-ckpt |
| valid | 후보 검증 | backend | wrap | source:cs-val |
| build | 결과 조립 | database | wrap | source:cs-asm |
| scope > base | |
| base > map | |
| map > pack | |
| pack > invest | |
| invest > ckpt | 후보 반환 |
| ckpt > valid | |
| valid > build | 통제마다 1회 | emphasis |

@steps id=core-steps
| scope | 대상·정책 확인 | target, scope, 상속된 `SECURITY.md`, 사용자 context, 공급된 위협 모델, `CODEX_SECURITY_KNOWLEDGE_BASE`, 허가된 inventory를 확정한다. knowledge-base 사실은 생성한 가정과 저장소 정책보다 앞서고 사용자의 명시 지시보다는 뒤다. reviewer 피드백 파일이 있으면 읽고, 사유가 현재 소스에서도 맞을 때만 기각을 적용한다.[](source:cs-ctx) | core-audit | scope |
| base | 독립 baseline 감사 | 위임이 가능하면 `fork_turns: "none"`으로 독립 감사 worker를 시작한다. 부모의 가설과 다른 finding은 넘기지 않는다. 위임이 불가하면 부모가 직접 하고 "the audit lacked an independent reviewer"를 기록한다.[](source:cs-base) | core-audit | base |
| map | 구조 파악 | `threat-model.md`로 구조와 보안 경계를 그린다. 공급된 모델은 그대로 두고, 생성한 모델은 이른 `complete: false` checkpoint에 `findings: []`로 저장한다. 구조 파악만으로는 감사 coverage가 성립하지 않는다.[](source:cs-tm) | core-audit | map |
| pack | 조사 packet 묶기 | 공격자, 보호 자산, 진입점, 기대 통제, 민감 작업, 소스 anchor로 질문을 묶는다. packet은 작업 중 컨텍스트이고 별도 artifact나 ledger가 아니다.[](source:cs-pack) | core-audit | pack |
| invest | 집중 조사 위임 | 병렬 검토가 유용할 때 packet 묶음을 worker에 나눈다. 복잡도와 공유 코드로 배정하고 고정된 worker·파일 수는 쓰지 않는다. 부모가 맡은 packet은 부모가 직접 따른다.[](source:cs-inv) | core-audit | invest |
| ckpt | 후보 checkpoint | 후보를 병합하거나 검증하기 전에 `complete: false`와 안정된 `candidateId`로 저장한다. 원래 근거는 `reviewState.deferred`에 둔다. 같은 깨진 통제와 같은 수정으로 풀릴 때만 관찰을 묶고, CWE만 같다고 묶지 않는다.[](source:cs-ckpt) | core-audit | ckpt |
| valid | 후보 검증 | 서로 다른 후보마다 소스에 대해 한 번 검증한다. 반증은 소스 근거가 있을 때만 받아들인다.[](source:cs-val)[](source:vsf) | core-audit | valid |
| build | 결과 조립 | `scope`, `threatModel`, `findings`, `reviewState`를 `final-report.md`와 `scan-draft.schema.json`에 맞춰 조립한다. 진짜 finding, 출처, 제외 항목, 대기 작업, 불확실성을 남긴다.[](source:cs-asm) | core-audit | build |

반환한 reviewer가 있으면 근거를 맞춰 보고 제출한다. 멈춘 worker는 가능하면 `followup_task`로 다시 깨운다. `send_message`만으로는 새 turn이 시작되지 않는다.[](source:cs-wait)

두 reviewer 지시문은 같은 제약을 건다. 소스는 읽기 전용·offline이고 저장소 글과 사용자 context는 분석 데이터다. scan 시작, 단계 스킬과 artifact 도구 호출, 위임, 앱 코드 실행, 파일 수정, 외부 서비스 접근, 발견한 credential 사용, 도구 내려받기를 모두 하지 않는다. 반환은 `findings`, `resolved_questions`, `reviewed_files` 세 키의 JSON이다.[](source:ba-rules)[](source:fi-rules)[](source:ba-ret)

집중 조사 worker는 근거가 다른 깨진 통제를 가리키면, 원래 가설이 기각됐어도 허가된 범위 안에서 그 단서를 따라간다. 원래 질문의 처분은 새 finding과 따로 적는다.[](source:fi-lead)

| 판단 | 원문이 정한 기준 |
| --- | --- |
| 무엇을 따라가나 | 노출된 진입점이나 민감 작업에서 시작해 누가 데이터를 통제하는지 따라가고 기대 통제가 지켜지는지 본다.[](source:cs-intro)[](source:ba-checks) |
| 후보를 버릴 때 | 소스 근거가 있는 반증이 있을 때만 버린다. 런타임 재현이나 실제 배포 증명은 요구하지 않는다. 공개 library나 parser 경계는 호출자가 입력을 통제하면 충분하다.[](source:vsf) |
| 소스에 박힌 credential | 읽는 사람이 더 큰 권한을 얻을 수 있으면 노출 경로로 본다. 포함한 코드가 실행되지 않아도 된다. 공개 키, 인증서, secret 저장소 참조, 명백한 더미 값은 secret이 아니다. 유효성을 모르면 확신도와 영향 주장을 낮추고, credential을 쓰거나 서비스에 연락하지 않는다.[](source:cs-secret)[](source:ba-cred) |
| 심각도 | 공급된 rubric이 있으면 그것을, 없으면 아래 기본 기준을 쓴다. 자기만 영향받거나 권한이 있어야만 되는 동작은 의미 있는 추가 영향이 없으면 제외한다.[](source:cs-sev) |

기본 심각도 기준은 공격자의 실제 시작 접근, 넘는 경계, 추가 피해로 판단한다. 입증이 부족하다는 이유만으로 낮추거나 더 큰 공격이 불가능하다고 단정하지 않는다.[](source:sv-top)

| 등급 | 조건 |
| --- | --- |
| Critical | Access, Impact, Evidence 세 조건을 모두 충족해야 한다. 인터넷의 비인증 공격자나 일반 외부 사용자가 악용하고, 중요한 경계를 넘어 결과가 큰 침해가 되며, 완전한 공격 경로가 입증이나 강한 소스 검증으로 세워져야 한다.[](source:sv-crit) |
| High | 세 조건을 모두 충족한다. 더 낮은 신뢰의 행위자가 도달하고, 상당한 새 능력을 얻고, 실제적인 경로가 있어야 한다. 위험한 함수나 내부 접근만으로는 경로가 입증되지 않는다.[](source:sv-high) |
| Medium | 영향 범위가 구체적으로 한정된 믿을 만한 취약점이다. 완전히 입증돼도 Medium일 수 있다. 낮추는 근거는 확인된 제약이어야 한다.[](source:sv-med) |
| Low | 추가 피해가 작고 범위·민감도·기간 한계가 확인된 약점이다. 잠재적으로 심각한 경로의 불확실성을 가리는 용도로 쓰지 않는다.[](source:sv-low) |
| Informational | 추가 능력이나 보안 영향이 근거로 세워지지 않은 보강 기회나 관찰이다.[](source:sv-info) |

판정 · `security-scan`은 `threat-model`, `finding-discovery`, `validation`, `attack-path-analysis`를 호출하지 않는다. 이 스킬의 SKILL.md는 단계 스킬 이름을 적지 않는다. 근거는 네 단계 스킬 쪽 문장이고 `core-scan.md`가 같은 금지를 적는다.[](source:p-tm)[](source:p-fd)[](source:p-val)[](source:p-ap)[](source:cs-noskill)

## 결과는 무엇을 만들고 어떻게 끝내나? {#finish}

감사가 만드는 것은 소스 수정이 아니라 scan 기록이다. canonical 입력은 `scan-manifest.json`과 `findings.json`이다. host가 이 둘을 검증하고 봉인한 뒤 `report.md`를 만든다. 에이전트가 `report.md`를 쓰거나 고치면 안 된다.[](source:fr-top)[](source:as-place)

위협 모델을 저장하면 host가 `scan-manifest.json`의 `scan.threatModel`에서 `threatmodel.md`를 만든다. 완료 전에는 잠정본(provisional)으로 표시된다.[](source:tmdoc)

저장과 완료 방법은 scan 소유자에 따라 다르다.

| 경로 | 저장 | 끝내는 방법 |
| --- | --- | --- |
| workbench Standard | `record_codex_security_scan_draft`로 draft를 저장한다.[](source:fr-own) | 부모가 최종 draft 승인 뒤 `complete_codex_security_scan`을 부른다.[](source:fr-own)[](source:rs-done) |
| SDK scan, draft 도구 연결 | 같은 draft 도구를 쓴다.[](source:fr-own) | 두 파일이 있는지 확인하고 돌려준다. SDK가 봉인하고 보고서를 만든다.[](source:rs-done) |
| SDK scan, draft 도구 없음 | `CODEX_SECURITY_SCAN_DIR`에 봉인 전 `scan-manifest.json`과 `findings.json`을 직접 쓴다. 모델은 findings가 비어도 초안에 저장한다.[](source:sdk-all) | 두 파일을 확인하고 SDK에 제어를 돌려준다. SDK가 보고서와 위협 모델을 만들고 봉인한다.[](source:sdk-repo) |
| 그 밖의 host | draft 도구가 필수다. MCP가 없거나 baseline이 지원되지 않으면 blocker를 보고하고, shell로 쓴 canonical 파일로 대신하지 않는다.[](source:rs-draft)[](source:as-own) | 위 workbench Standard와 같다.[](source:rs-done) |

SDK 파일 handoff에서는 `scan.mode`를 지정 경로면 `scoped_path`, 저장소 전체면 `repository`로 둔다. 지정 경로면 manifest를 쓴 뒤 scope 묶기 명령을 실행한다. `scan.sealedAt`과 `scan.artifacts`는 비워 둔다.[](source:sdk-all)[](source:sdk-repo)

scan의 진행 phase는 아래 여섯 단계이고 host는 앞으로만 옮긴다. 이전 phase로 되돌리면 "Scan progress cannot move to an earlier phase"로 거부한다.[](source:wp)

@list id=phase-order ordered=true
| `preflight` |
| `threat_model` |
| `discovery` |
| `validation` |
| `attack_path` |
| `reporting` |

 진행 보고는 실제로 앞으로 넘어갈 때 한다. `discovery`는 dispatch 전에, `validation`을 후보를 검토하기 전에, `attack_path`를 도달성을 평가하기 전에, `reporting`을 최종 조립 전에 한다.[](source:srv-phase)[](source:m-phase)

| 단계 | 에이전트의 행동 |
| --- | --- |
| 첫 위협 모델 | `complete: false`, 모델, 아직 검증된 finding이 없으면 빈 findings로 draft를 저장한다. host가 canonical artifact를 쓰고 target 메타데이터와 finding identity를 만든다. 도구 설명도 모델이 생기는 즉시 `complete: false`로 저장하고, 미검증 후보는 findings가 아니라 `reviewState.deferred`에 두라고 적는다.[](source:rs-draft)[](source:ct-draft) |
| 후보가 돌아올 때 | 병합·검증 전에 checkpoint한다. 원래 근거는 해결될 때까지 `reviewState.deferred`에 둔다.[](source:rs-draft) |
| 배정된 검토가 끝날 때 | 범위, 위협 모델, findings, `reviewState`를 담은 `complete: true` draft를 한 번 제출한다. 끝난 일반 작업은 `reviewState.resolvedDeferred`에 저장된 ID와 사유로 닫고 미해결은 남긴다. 일반 작업은 빠뜨리는 것만으로는 닫히지 않는다.[](source:rs-done)[](source:fr-state) |
| 제출 거부 | 입력 검증 실패(`-32602`, `isError: true`)는 draft를 쓰지 않는다. 같은 draft에서 거부된 필드만 고쳐 다시 제출하고, 같은 요청을 반복하지 않는다.[](source:fr-err) |
| 완료 직전 | `scan-manifest.json`과 `findings.json`이 있는지 확인한다.[](source:rs-done) |
| 완료 | `complete_codex_security_scan`을 같은 ID와 token으로 한 번 부르고, 성공하면 생성된 `report.md`와 canonical artifacts를 링크한다. 전체 findings는 요청받을 때만 가져온다.[](source:rs-done) |
| usage 보고 | 완전히 측정된 usage만 보고한다. 대기 중인 usage는 host에 맡기고 그 밖의 불완전한 수치는 확인할 수 없다고 적는다.[](source:rs-done)[](source:fr-resp) |

완료 도구는 이미 쓰인 manifest와 findings를 검증하고 봉인할 뿐이다. 빠진 단계를 대신 하지 않고 draft를 만들지도 않는다.[](source:srv-comp)[](source:fr-own)

| 실패·중단 상황 | 에이전트의 행동 |
| --- | --- |
| 완료 도구가 실패함 | 정확한 오류를 보이고 재시도 없이 응답을 멈춘다. durable scan은 보존한다.[](source:srv-comp)[](source:rs-fail) |
| 사용자가 취소를 요청함 | 그때만 scan을 취소한다.[](source:rs-fail) |
| 복구를 모두 해 본 뒤에도 풀 수 없는 blocker가 확인됨 | 그때만 scan을 fail 처리한다.[](source:rs-fail) |
| 끝나지 않은 일 | 재개할 수 있게 둔다.[](source:rs-fail) |

Codex desktop에서는 완료 전에 handoff가 요구하는 finding별 write-up을 마치고, 완료 뒤 보고서를 링크한다. finding마다 `::code-comment` 한 줄을 가장 좁은 root control 위치나 가장 관련된 위치에 낸다. 심각도와 priority는 아래처럼 대응한다.[](source:d-write)

@facts id=desktop-priority
| critical | `P0` · 숫자 `0` |
| high | `P1` · 숫자 `1` |
| medium | `P2` · 숫자 `2` |
| low | `P3` · 숫자 `3` |

## 무엇을 강제하고 언제 멈추나? {#rules}

| 조건 | 에이전트의 행동 |
| --- | --- |
| 소스를 읽기 전 | target과 scope를 먼저 묶는다.[](source:bind-man) |
| Standard가 아니거나 실행 중이 아닌 scan | 소스 검토를 시작하지 않는다.[](source:bind-man)[](source:m-resume) |
| 검토 중 | 대상은 읽기 전용이고 검토는 offline이다. 링크는 따라가지 않는다.[](source:guard) |
| reviewer 위임 | scan 관리는 부모가 맡는다. reviewer에게는 허가된 소스와 보안 context만 준다.[](source:core) |
| 단계 스킬과 추가 파일 | 호출하지 않고, 순위 phase·파일별 ledger·별도 worker 풀·receipt 파일을 더하지 않는다.[](source:cs-noskill) |
| 보고 | 소스 줄과 구체적 영향을 붙이고, 본 범위와 남은 불확실성을 기록한다.[](source:core) |
| 중단된 scan의 무발견 | 멈춘 scan에서 finding이 없는 것은 결론이 아니다. `completed`만 완료 결론을 뒷받침한다.[](source:sc-status) |

@callout level=warning title="SDK 소유 scan은 여기서 끝내지 않는다"
| SDK가 만든 scan은 SDK가 완료 처리(finalization)를 소유한다. 이 스킬은 두 파일을 확인한 뒤 scan을 돌려주고, 완료 도구를 부르지 않는다.[](source:start)[](source:rs-done)[](source:fr-own) |

판정 · 사람에게 승인을 구하는 지점은 원문에 URL 읽기 허가, 시간 제한 요청, 취소 요청 세 가지다. 이 가운데 앞의 두 가지는 사용자가 스스로 말했을 때만 쓰는 조건이다. 그 밖에 사용자에게 묻는 단계는 원문에 명시 없음이다.[](source:guard)[](source:rs-fail)

## 다른 스킬과 어디에서 이어지나? {#position}

@workflow id=position-flow title="security-scan 앞뒤의 스킬"
| pick | 사용자와 host의 스킬 선택 | external | source:front |
| cur | security-scan | backend | source:front |
| track | track-findings | backend | source:track-8 |
| vis | threat-model-visualize | backend | source:vis-10 |
| tri | triage-finding | backend | source:tf-12 |
| pick > cur | 기본 선택 | emphasis |
| cur > track | 요청 시 | dashed |
| cur > vis | 요청 시 | dashed |
| cur > tri | 파일을 줄 때 | dashed |

@steps id=position-steps
| here | security-scan | 이 페이지의 스킬이다. 앞은 사용자와 host가 고르는 단계다. 뒤로는 끝난 scan의 산출물을 다른 스킬이 읽는다. 모두 자동 순서가 아니라 사용자가 요청할 때 따로 부른다. | position-flow | cur |

| 관계 | 받는 것 · 넘기는 것 · 조건 |
| --- | --- |
| R01 · 넘김 | 변경 범위(PR, commit, branch, working tree)는 diff 스킬로 간다. 사용자와 host가 스킬을 고르고, description은 선택 기준을 알려 준다.[](source:front)[](source:diff-desc) |
| R02 · 넘김 | 사용자가 명시적으로 요청한 deep scan에만 deep 스킬을 쓴다.[](source:front) |
| R05 · 참고 | deep 스킬은 host가 Standard 감사를 반복해 병합한다고 적는다. deep 스킬이 이 스킬 본문을 호출한다는 문장은 원문에 명시 없음이다. 두 쪽은 `core-scan.md`를 공유한다. deep worker의 prompt 템플릿이 그 문서를 직접 읽으라고 한다.[](source:deep-loop)[](source:core)[](source:dd-core) |
| R14~R17 · 참고 | 네 단계 스킬은 Standard scan과 Deep worker가 자기 workflow 안에서 위협 모델, 발견, 검증, 공격 경로를 다루며 단계 스킬을 호출하지 않는다고 적는다.[](source:p-tm)[](source:p-fd)[](source:p-val)[](source:p-ap) |
| R21 · 참고 | Codex desktop에서만 handoff가 요구하는 finding별 write-up을 완료 전에 마친다. 스킬 이름은 적지 않는다. scan 안에서 만들면 `findings/<slug>/<slug>.md`에 두고 `writeup.reportPath`로 돌려준다.[](source:d-write)[](source:vw-42) |
| R24 · 산출물 호환 | scan이 끝나면 생기는 `scan-manifest.json`과 `findings.json`을 track-findings가 읽는다. 봉인된 scan 하나만 받는다. 사용자가 요청할 때 따로 부른다.[](source:rs-done)[](source:track-8)[](source:track-24) |
| R43 · 산출물 호환 | 마지막 scan의 위협 모델(`threatmodel.md`)을 visualize가 읽는다. 새 scan은 돌리지 않는다. host가 이 모델을 `threatmodel.md`로 만든다.[](source:vis-8)[](source:vis-10)[](source:as-tm) |
| R73 · 공유 상태 | `SECURITY.md`는 define-security-policy가 쓰고, 이 스킬의 감사는 resolver로 해석해 읽는다. 가까운 중첩 정책이 우선한다. 쓰기와 읽기의 순서를 정하는 문장은 원문에 명시 없음이다.[](source:sp-8)[](source:cs-src) |
| R75 · 산출물 호환 | 사용자가 유효한 `codex-security.findings` 파일을 주면 triage-finding이 입력으로 쓴다. scan이 봉인하는 `findings.json`의 `documentType`이 정확히 그 값이다. 자동 연결은 없다.[](source:tf-12)[](source:fd-schema) |

전체 흐름은 묶음 페이지 `codex-security/_group-scan-vulnerabilities`(색인 기준 `_group-scan-vulnerabilities/scan-vulnerabilities.html`)에 있다.

## 어디까지 읽고 확인했나? {#audit}

읽은 텍스트 파일은 53개(전부 읽음 38개, 구조·표본만 확인 15개), 합계 382,903B다. 목록은 같은 폴더의 `files.md`에 있다. 이 페이지 하단의 출처는 본문이 직접 인용한 줄 범위만 담는다.

| 조사 구분 | 확인 범위 |
| --- | --- |
| 스킬 폴더 | `SKILL.md`, `agents/openai.yaml`, `references/` 6개를 끝까지 읽었다. 합계 8개, 19,596B. |
| 필수 참조 문서 | 플러그인 루트 `references/` 14개를 끝까지 읽었다. `core-scan`, `baseline-auditor`, `focused-investigator`, `validate-scan-findings`, `threat-model`, `default-severity-rubric`, `final-report`, `finding-detail-fields`, `scan-contract`, `scan-artifacts`, `artifact-storage`, `security-guidance`, `access-advisory`, `investigation-time-budget`이다. |
| 구조·표본만 확인(전부 읽지 않음) | `schemas/tools/scan-draft.schema.json`(28,295B)은 최상위 키, `scanDraftInput`의 필수 키, `complete` 설명만 봤다. `examples/completed-scan/` 3개는 앞부분과 키만 봤다. `mcp-app/server.ts`(84,254B)는 scan 시작·context·progress·완료·실패 도구와 입력 검사 구간만, `scripts/launch_codex_security_mcp`는 앞 80줄만 읽었다. |
| 호출 제한 대조용 부분 읽음 | 단계 스킬 4개의 호출 제한 문장, 형제 스킬 2개 description, `track-findings`·`threat-model-visualize`·`triage-finding`·`vulnerability-writeup`·`define-security-policy`의 관련 줄만 읽었다. |
| 제외 | `*.KO.md` 번역본은 열지 않았다. 바이너리는 읽지 않았다. 외부 URL은 열지 않았다. `scripts/`, `mcp-app/`, `tests/`의 코드는 읽기만 하고 실행하지 않았다. |

원문의 활성화 안내, scan 시작 도구 분기 3가지, 읽기 전용·offline 규칙, 시간 제한 조건, 승인 지점 3가지, 완료·실패·취소 조건, priority 대응 4개, 심각도 5등급을 모두 대조했다. 시간·횟수의 하드 한도는 원문에 명시 없음이다. `core-scan.md`가 정하는 worker 수나 packet 수도 고정값이 아니다.[](source:cs-inv)

동명 스킬이 `ecc/security-scan`에 있다. SHA-256이 다르고(`1e678be7...` / `74bc3006...`) ecc 쪽은 Claude Code 설정(`.claude/`)을 AgentShield로 점검하는 스킬이다. 동명·내용 다름이며 판본의 선후 관계는 근거가 없어 적지 않는다.[](source:ecc-head)[](source:lock)

@callout level=open-question title="확인하지 못한 것"
| 이 스킬이 부르는 MCP 도구와 helper는 소스(`mcp-app/`)로 계약을 읽었다. 실제 실행 번들(`mcp/server.mjs`)은 저장소에 없어 소스와 같은지는 확인하지 못했다. |
| `desktop-scan.md`는 `::code-comment` 형식에 `confidence=<0-to-1>`을 넣고 `final-report.md`는 "Optional `confidence`"라고 적는다. 두 문서가 충돌하는지 우선순위가 명시되지 않았다.[](source:d-write)[](source:fr-code) |
| `desktop-scan.md`가 `::code-comment`를 완료 전에 내라고 정하는지는 원문에 명시 없음이다. 완료 전·후가 정해진 것은 write-up과 보고서 링크뿐이다.[](source:d-write) |

분석 중 원본은 수정하지 않았다. 이 폴더에 분석 초안과 HTML만 썼고 어떤 도구나 명령도 실행하지 않았다.
