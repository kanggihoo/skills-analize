# deep-security-scan은 Standard 감사를 반복하는 deep scan을 어떻게 시작하고 언제 멈추나? {#deep-security-scan-page}

`deep-security-scan`은 사용자가 deep, 철저한, multi-pass 감사를 요청했을 때 쓰는 **얇은 진입 스킬**이다. 감사를 반복하고 병합하고 멈추는 일은 에이전트가 아니라 host 코디네이터가 한다. 에이전트는 대상과 설정을 확정하고, 다른 Deep scan이 있으면 사람의 선택을 기다린 뒤, `start_codex_security_deep_scan`을 호출해 결과를 기다리고 보고한다.[](source:front)[](source:d-intro)[](source:d-4)

- 변경분(PR, commit, branch, working tree)에는 이 스킬을 쓰지 않는다. description이 `security-diff-scan`을 쓰라고 하고, 시작 도구도 전체 대상(`scope: "."`)만 받는다.[](source:front)[](source:srv-chk)
- host가 Standard 감사를 반복한다. 기본값은 worker 4개 동시, 연속 4번 새 결과가 없으면 중지, 감사 40번 상한, 96시간 마감이다. 연속 오류 3번이면 오류로 끝난다.[](source:cfg-def)[](source:co-stop)[](source:co-err)
- 사람 승인 지점이 하나 있다. 다른 Deep scan이 실행 중이면 `Cancel (Recommended)`와 `Continue` 중 하나를 명시적으로 고르기를 기다린다. 닫힌 dialog는 취소가 아니다.[](source:d-3)
- 끝나면 생성된 `report.md`와 canonical artifacts를 링크한다. SDK가 소유한 scan은 scan ID와 manifest 경로를 SDK에 돌려준다.[](source:d-5)

@answer scope="분석 커밋 cd5035b · 필수 참조 문서와 Deep 코디네이터 구현 일부까지 읽음 · 코드와 도구는 실행하지 않음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source front title="codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md · 3127B · 스킬 본문(원본) frontmatter" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=1:4
@source yaml title="codex-security/plugins/codex-security/skills/deep-security-scan/agents/openai.yaml · 192B · UI 표시와 default_prompt(원본)" path=codex-security/plugins/codex-security/skills/deep-security-scan/agents/openai.yaml lines=1:4
@source d-intro title="codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md · 3127B · 스킬 본문(원본) 동작 개요" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=8:8
@source d-1 title="codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md · 3127B · 스킬 본문(원본) 1단계 대상 확정" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=10:10
@source d-2 title="codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md · 3127B · 스킬 본문(원본) 2단계 설정 확인" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=11:11
@source d-3 title="codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md · 3127B · 스킬 본문(원본) 3단계 다른 Deep scan 확인" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=12:12
@source d-4 title="codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md · 3127B · 스킬 본문(원본) 4단계 시작과 대기" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=13:13
@source d-5 title="codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md · 3127B · 스킬 본문(원본) 5단계 완료 보고" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=14:14
@source readme title="codex-security/plugins/codex-security/skills/README.md · 3752B · 벤더의 스킬 선택 안내" path=codex-security/plugins/codex-security/skills/README.md lines=7:9
@source sc-front title="codex-security/plugins/codex-security/skills/security-scan/SKILL.md · 2972B · 형제 스킬 description" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=3:3
@source diff-desc title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 형제 스킬 description" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=3:3
@source track-8 title="codex-security/plugins/codex-security/skills/track-findings/SKILL.md · 13459B · 이어지는 스킬 입력 조건" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=8:8
@source track-24 title="codex-security/plugins/codex-security/skills/track-findings/SKILL.md · 13459B · 이어지는 스킬 읽는 파일" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=24:24
@source vis-10 title="codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md · 19102B · 이어지는 스킬 입력 조건" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=10:10
@source sp-top title="codex-security/plugins/codex-security/references/scan-prologue.md · 5747B · Deep 시작 문서 적용 범위" path=codex-security/plugins/codex-security/references/scan-prologue.md lines=3:3
@source sp-own title="codex-security/plugins/codex-security/references/scan-prologue.md · 5747B · Deep 시작 문서 scan 소유권" path=codex-security/plugins/codex-security/references/scan-prologue.md lines=7:11
@source sp-ctx title="codex-security/plugins/codex-security/references/scan-prologue.md · 5747B · Deep 시작 문서 사용자 context" path=codex-security/plugins/codex-security/references/scan-prologue.md lines=15:17
@source sp-res title="codex-security/plugins/codex-security/references/scan-prologue.md · 5747B · Deep 시작 문서 도구 결과 확인" path=codex-security/plugins/codex-security/references/scan-prologue.md lines=21:21
@source sp-coord title="codex-security/plugins/codex-security/references/scan-prologue.md · 5747B · Deep 시작 문서 코디네이터 책임" path=codex-security/plugins/codex-security/references/scan-prologue.md lines=27:27
@source sp-fail title="codex-security/plugins/codex-security/references/scan-prologue.md · 5747B · Deep 시작 문서 worker 실패와 자격 증명" path=codex-security/plugins/codex-security/references/scan-prologue.md lines=31:33
@source sp-cancel title="codex-security/plugins/codex-security/references/scan-prologue.md · 5747B · Deep 시작 문서 취소와 복구" path=codex-security/plugins/codex-security/references/scan-prologue.md lines=37:37
@source adv title="codex-security/plugins/codex-security/references/access-advisory.md · 1373B · Daybreak 접근 안내" path=codex-security/plugins/codex-security/references/access-advisory.md lines=3:11
@source fr-own title="codex-security/plugins/codex-security/references/final-report.md · 12135B · 최종 결과 소유자 표" path=codex-security/plugins/codex-security/references/final-report.md lines=7:16
@source fr-resp title="codex-security/plugins/codex-security/references/final-report.md · 12135B · 최종 결과 usage 보고" path=codex-security/plugins/codex-security/references/final-report.md lines=77:79
@source as-3 title="codex-security/plugins/codex-security/references/artifact-storage.md · 7947B · artifact 저장 적용 범위" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=3:3
@source cs-base title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · 공통 감사 절차 2단계" path=codex-security/plugins/codex-security/references/core-scan.md lines=10:10
@source cs-noskill title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · 공통 감사 절차 단계 스킬 금지" path=codex-security/plugins/codex-security/references/core-scan.md lines=18:18
@source ba-rules title="codex-security/plugins/codex-security/references/baseline-auditor.md · 2839B · 독립 baseline 감사 제약" path=codex-security/plugins/codex-security/references/baseline-auditor.md lines=14:16
@source fi-rules title="codex-security/plugins/codex-security/references/focused-investigator.md · 2548B · 집중 조사 제약과 반환 형식" path=codex-security/plugins/codex-security/references/focused-investigator.md lines=11:13
@source sc-modes title="codex-security/plugins/codex-security/references/scan-contract.md · 16529B · 봉인 계약 scan mode" path=codex-security/plugins/codex-security/references/scan-contract.md lines=122:132
@source sc-inv title="codex-security/plugins/codex-security/references/scan-contract.md · 16529B · 봉인 계약 Deep inventory 값" path=codex-security/plugins/codex-security/references/scan-contract.md lines=144:144
@source sc-rev title="codex-security/plugins/codex-security/references/scan-contract.md · 16529B · 봉인 계약 Deep review state" path=codex-security/plugins/codex-security/references/scan-contract.md lines=114:114
@source sc-tm title="codex-security/plugins/codex-security/references/scan-contract.md · 16529B · 봉인 계약 Deep 위협 모델" path=codex-security/plugins/codex-security/references/scan-contract.md lines=173:173
@source sc-status title="codex-security/plugins/codex-security/references/scan-contract.md · 16529B · 봉인 계약 scan status" path=codex-security/plugins/codex-security/references/scan-contract.md lines=32:41
@source sa-deep title="codex-security/plugins/codex-security/references/scan-artifacts.md · 11701B · scan 경로 규약 Deep 병합" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=37:39
@source tb-3 title="codex-security/plugins/codex-security/references/investigation-time-budget.md · 1749B · 조사 시간 allowance 범위" path=codex-security/plugins/codex-security/references/investigation-time-budget.md lines=3:3
@source dd-1 title="codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md · 2215B · Deep worker prompt 템플릿 설정과 범위" path=codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md lines=1:7
@source dd-peer title="codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md · 2215B · Deep worker prompt 템플릿 peer notes" path=codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md lines=9:9
@source dd-sev title="codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md · 2215B · Deep worker prompt 템플릿 심각도 rubric" path=codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md lines=11:11
@source dd-save title="codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md · 2215B · Deep worker prompt 템플릿 checkpoint" path=codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md lines=13:13
@source dd-block title="codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md · 2215B · Deep worker prompt 템플릿 중단" path=codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md lines=15:15
@source dd-final title="codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md · 2215B · Deep worker prompt 템플릿 최종 제출" path=codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md lines=17:17
@source tpl-prev title="codex-security/plugins/codex-security/mcp-app/src/deep-scan/templates.ts · 1768B · Deep worker prompt 이전 finding 전달" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/templates.ts lines=31:44
@source tpl-fp title="codex-security/plugins/codex-security/mcp-app/src/deep-scan/templates.ts · 1768B · Deep worker prompt false-positive 피드백" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/templates.ts lines=45:50
@source co-const title="codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts · 40348B · 코디네이터 상수와 마감 전 메시지" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=55:59
@source co-dl title="codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts · 40348B · 코디네이터 마감 계산" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=575:607
@source co-streak title="codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts · 40348B · 코디네이터 병합과 연속 무발견 세기" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=798:806
@source co-err title="codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts · 40348B · 코디네이터 연속 오류 중단" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=839:846
@source co-stop title="codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts · 40348B · 코디네이터 중단 조건" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=847:865
@source co-disp title="codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts · 40348B · 코디네이터 다음 batch 배정" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=867:878
@source ex-483 title="codex-security/plugins/codex-security/mcp-app/src/deep-scan/executor.ts · 48414B · worker 입력에 붙는 스킬 읽기 지시" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/executor.ts lines=480:484
@source cfg-def title="codex-security/plugins/codex-security/scripts/deep_scan_defaults.json · 143B · Deep 번들 기본값" path=codex-security/plugins/codex-security/scripts/deep_scan_defaults.json lines=1:8
@source cfg-path title="codex-security/plugins/codex-security/scripts/deep_scan_config.py · 6510B · Deep 설정 TOML 경로" path=codex-security/plugins/codex-security/scripts/deep_scan_config.py lines=43:48
@source cfg-keys title="codex-security/plugins/codex-security/scripts/deep_scan_config.py · 6510B · Deep 설정 필드 이름" path=codex-security/plugins/codex-security/scripts/deep_scan_config.py lines=25:33
@source cfg-res title="codex-security/plugins/codex-security/scripts/deep_scan_config.py · 6510B · Deep 설정 우선순위와 검증" path=codex-security/plugins/codex-security/scripts/deep_scan_config.py lines=56:122
@source ps-mt title="codex-security/plugins/codex-security/mcp-app/src/deep-scan/project-config.schema.json · 8208B · 프로젝트 설정 schema 시간 한도" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/project-config.schema.json lines=24:28
@source ps-val title="codex-security/plugins/codex-security/mcp-app/src/deep-scan/project-config.schema.json · 8208B · 프로젝트 설정 schema 검증 파일" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/project-config.schema.json lines=104:108
@source ps-deep title="codex-security/plugins/codex-security/mcp-app/src/deep-scan/project-config.schema.json · 8208B · 프로젝트 설정 schema deep 값" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/project-config.schema.json lines=109:157
@source srv-insp title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · MCP 서버 setup 확인 도구" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=797:801
@source srv-start title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · MCP 서버 Deep scan 시작 도구 설명" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=892:897
@source srv-chk title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · MCP 서버 Deep scan 시작 입력 검사" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=915:939
@source srv-done title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · MCP 서버 Deep scan 완료 분기" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=955:964
@source srv-cancel title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · MCP 서버 취소 도구" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1200:1205
@source srv-fail title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · MCP 서버 실패 처리 도구" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1625:1631
@source srv-ui title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · MCP 서버 사용자 선택 대체 도구" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=683:686
@source ct-peer title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 15421B · worker용 peer note 도구" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=269:286
@source ct-wdraft title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 15421B · worker용 draft 저장 도구" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=288:296
@source pre-id title="codex-security/plugins/codex-security/mcp-app/src/deep-scan/permission-profile-preflight.ts · 32222B · worker permission profile 이름" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/permission-profile-preflight.ts lines=13:15
@source cdt title="codex-security/plugins/codex-security/scripts/check_deep_scan_target.py · 3538B · 빈 대상 거부" path=codex-security/plugins/codex-security/scripts/check_deep_scan_target.py lines=75:87
@source eng title="codex-security/plugins/codex-security/mcp-app/src/deep-scan/engine.ts · 4065B · 새 대상 검사 호출" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/engine.ts lines=101:129
@source test-set title="codex-security/plugins/codex-security/tests/test_deep_security_scan_concurrency_guard.py · 2613B · 다른 실행 중 Deep scan 집계 시험 준비" path=codex-security/plugins/codex-security/tests/test_deep_security_scan_concurrency_guard.py lines=14:19
@source test-assert title="codex-security/plugins/codex-security/tests/test_deep_security_scan_concurrency_guard.py · 2613B · 다른 실행 중 Deep scan 집계 시험 기대값" path=codex-security/plugins/codex-security/tests/test_deep_security_scan_concurrency_guard.py lines=53:70
@source mcp title="codex-security/plugins/codex-security/.mcp.json · 2078B · MCP 서버 시간 제한" path=codex-security/plugins/codex-security/.mcp.json lines=65:66

## 언제 켜지고, 언제 쓰면 안 되나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻은 아니다. `disable-model-invocation` 같은 호출 제한 필드는 frontmatter에 원문에 명시 없음이다. `agents/openai.yaml`에도 `policy` 항목이 없다.[](source:front)[](source:yaml)

@code source=front language=yaml

| 요청 | 쓰는 스킬 | 근거 |
| --- | --- | --- |
| 저장소나 지정 경로를 deep, 철저한, 다중 pass로 감사한다 | `deep-security-scan` {good:이 스킬} | description이 "deep, exhaustive, or multi-pass audit"을 요청했을 때라고 정한다.[](source:front) |
| PR, commit, branch, working tree의 변경을 본다 | `security-diff-scan` {caution:이 스킬이 아님} | description이 변경분에는 `security-diff-scan`을 쓰라고 이름으로 정한다.[](source:front) |
| deep을 요청하지 않은 일반 감사 | `security-scan` {caution:이 스킬이 아님} | security-scan description이 deep은 "an explicitly requested deep scan"에만 쓰라고 한다.[](source:sc-front) |

`default_prompt`는 `$codex-security:deep-security-scan`처럼 plugin 접두어를 붙여 이 스킬을 부르는 예시다.[](source:yaml)

벤더 안내문은 deep을 "several passes over the same code and combines the findings in one report"로 설명한다.[](source:readme)

시작 도구에는 입력 제한이 있다. 아래 제한 때문에 deep scan은 경로 일부를 좁혀 열 수 없다.

| 도구 입력 | 규칙 |
| --- | --- |
| 새 대상 | `targetPath`로 시작하고 `scope`는 `.`뿐이다. 아니면 "Deep Scan currently requires the whole target; use scope '.'" 오류다. 지정 디렉터리를 감사할 때는 그 디렉터리를 `targetPath`로 쓴다.[](source:srv-chk)[](source:d-1) |
| 기존 scan | `scanId`가 있으면 `targetPath`, `scope`, `userContext`, `projectConfigPath`를 생략한다. 저장된 scan이 권위다.[](source:srv-chk) |
| 둘 중 정확히 하나 | `scanId`와 `targetPath`를 함께 주거나 둘 다 빼면 거부한다.[](source:srv-chk) |
| `handoffClaimToken` | 기존 scan ID와 함께만 받는다. `targetPath`로 시작할 때는 거부한다.[](source:srv-chk) |
| owning Codex thread | 컨텍스트가 없으면 시작이나 재개를 거부한다.[](source:srv-chk) |

이 스킬을 쓰면 안 되는 경우는 다음과 같다.

@list id=not-for
| 변경분 검토에는 쓰지 않는다. `security-diff-scan`을 쓴다.[](source:front) |
| deep을 요청하지 않았는데 쓰지 않는다. 일반 감사는 `security-scan`이다.[](source:sc-front) |
| 이어 실행하는 scan의 저장된 모드가 Standard나 diff이면 이 스킬로 계속하지 않고 대응하는 scan 스킬로 이어 간다.[](source:d-1) |
| 선택한 대상에 파일이 없고 빈 디렉터리뿐이면 쓰지 않는다. 새 대상 검사기가 "Deep Scan target is empty; no security audit was performed"라며 거부한다.[](source:cdt)[](source:eng) |

## 에이전트는 어떤 순서로 시작하고 기다리나? {#start}

SKILL.md는 다섯 단계를 번호 목록으로 정한다. 이 가운데 사람이 개입하는 곳은 3단계의 선택 하나다.[](source:d-3)

@workflow id=deep-start title="Deep scan 시작과 대기"
| ask | deep 감사 요청 | external |
| tgt | 대상·scan 확정 | backend | source:d-1 |
| set | 설정과 출처 보이기 | backend | source:d-2 |
| busy | 다른 Deep scan이 있나? | backend | source:d-3 |
| choose | 사용자 선택 대기 | security | source:d-3 |
| adv | 접근 안내 확인 | backend | source:d-4 |
| run | 시작·결과 대기 | backend | source:d-4 |
| report | 결과 링크와 보고 | external | source:d-5 |
| ask > tgt | |
| tgt > set | 새 대상 |
| set > adv | |
| tgt > busy | 이어받기 |
| busy > choose | 있음 |
| busy > adv | 없음 |
| choose > adv | Continue |
| adv > run | |
| run > report | emphasis |

@steps id=deep-steps
| tgt | 대상·scan 확정 | 이어받을 때는 `scanId`와 받은 `handoffClaimToken`으로 `get_codex_security_scan_context`를 부르고, 저장된 identity와 scope를 쓴다. 저장된 모드가 Standard나 diff이면 대응하는 scan 스킬로 계속한다. 새 대상이면 허가된 target과 scope를 확정한다. 지정 디렉터리는 그 디렉터리를 `targetPath`로 하고 `scope: "."`로 둔다. 소스 접근과 context 갱신은 `scan-prologue.md`를 따른다. 필요한 context가 없거나 형식이 틀리거나 다른 모드의 것이면 식별자를 지어내거나 대체 scan을 만들거나 대상을 넓히지 않고, 그 진입 스킬의 오류·라우팅 동작을 따른다.[](source:d-1)[](source:sp-top)[](source:sp-own) | deep-start | tgt |
| set | 설정과 출처 보이기 | 새 대상은 `inspect_codex_security_setup({ targetPath, scope: ".", mode: "deep", projectConfigPath? })`를 부르고 실효 설정과 각 출처를 사용자에게 보인다. 프로젝트 설정 파일은 사용자가 고른 경우에만 넘긴다. 기존 scan은 저장된 설정을 쓴다.[](source:d-2)[](source:srv-insp) | deep-start | set |
| busy | 다른 Deep scan이 있나? | 새로 시작한 native scan이 scan ID를 받았으면 `get_codex_security_scan_context` 결과의 `otherRunningDeepScans`를 한 번 본다. 대상 기반 setup 미리 보기에는 scan ID가 없어 이 확인이 없다.[](source:d-3) | deep-start | busy |
| choose | 사용자 선택 대기 | 다른 Deep scan이 있으면 그 대상, phase, 시작 시각을 보이고 추가 CPU, 메모리, token 사용을 설명한다. `Cancel (Recommended)`와 `Continue`를 `request_user_input`으로 묻고, 없으면 `request_codex_security_user_input`, 그것도 없으면 평문 채팅으로 묻는다. 명시 선택을 기다리고, 닫힌 dialog는 취소로 보지 않는다. 사용자가 취소를 고르면 새 scan만 취소한다.[](source:d-3) | deep-start | choose |
| adv | 접근 안내 확인 | `access-advisory.md`를 따른 뒤 시작 도구를 부른다.[](source:d-4) | deep-start | adv |
| run | 시작·결과 대기 | 기존 scan이면 `start_codex_security_deep_scan({ scanId, handoffClaimToken? })`, 새 대상이면 `start_codex_security_deep_scan({ targetPath, scope: ".", userContext?, projectConfigPath? })`를 부른다. 설정 때 고른 프로젝트 파일을 다시 쓴다. 도구가 끝날 때까지 기다리고, 실행 중인 cell ID를 받으면 그 cell이 scan 결과를 돌려줄 때까지 기다린다. 연결이 끊기면 같은 인자로 다시 붙는다. 도구 결과는 JSON으로 읽기 전에 `isError: true`나 실패 종료 코드를 먼저 확인한다.[](source:d-4)[](source:sp-res) | deep-start | run |
| report | 결과 링크와 보고 | 아래 완료 절을 따른다.[](source:d-5) | deep-start | report |

다른 Deep scan을 세는 방식은 시험이 확인한다. 현재 scan 자신, Standard scan, 실패한 scan, 완료된 scan은 목록에서 빠지고, 실행 중이며 handoff가 전달된 다른 Deep scan만 `phase`, `scanId`, `startedAt`, `targetPath`, `updatedAt`로 나온다.[](source:test-set)[](source:test-assert)

사용자 선택 도구에는 제한이 있다. `request_codex_security_user_input`은 host의 `request_user_input`이 없을 때의 대체 도구다. headless나 자동화 같은 비대화형 세션에서는 부르지 않는다.[](source:srv-ui)

시작 도구 호출 전에 `access-advisory.md`는 `get_codex_security_daybreak_access`가 세션에 이미 있을 때만 쓰라고 한다. Deep은 `start_codex_security_deep_scan` 전에 부른다. 안내는 scan을 허가하거나 막지 않는다.[](source:adv)

## host 코디네이터는 어떻게 반복하고 언제 멈추나? {#loop}

SKILL.md는 반복 방식을 한 문단으로 요약한다. 구현은 코디네이터가 맡는다. 에이전트는 이 반복 안에서 아무것도 지시하지 않는다.[](source:d-intro)[](source:sp-coord)

@workflow id=deep-loop title="코디네이터의 반복 loop"
| plan | 이번 batch 규모 정하기 | backend | source:co-disp |
| scan | Standard 감사 worker 실행 | backend | source:dd-1 |
| merge | 결과 병합과 새 결과 세기 | database | source:co-streak |
| chk | 멈출 조건인가? | backend | source:co-stop |
| out | 병합 결과로 끝내기 | external | source:co-stop |
| err | 연속 오류로 끝내기 | security | source:co-err |
| plan > scan | 이전 finding 전달 |
| scan > merge | |
| merge > chk | |
| chk > plan | 아니오 | emphasis |
| chk > out | 예 |
| scan > err | 오류 누적 | security |

@steps id=loop-steps
| plan | 이번 batch 규모 정하기 | `workers`와 남은 `maxDiscoveryRuns` 중 작은 수만큼 worker를 배정한다. 배정한 수는 실행 전에 총 실행 횟수에 더한다. 이 횟수는 같이 도는 Standard scan까지 센 총 상한이다.[](source:co-disp)[](source:d-2) | deep-loop | plan |
| scan | Standard 감사 worker 실행 | 각 worker는 prompt 템플릿의 지시대로 `core-scan.md`를 직접 읽고 그 감사를 따른다. 이전 pass가 보고한 finding은 `경로:줄 제목` 문자열로 넘긴다. 경로와 줄은 `root_control` 위치를 우선하고 없으면 첫 위치를 쓴다.[](source:dd-1)[](source:co-disp)[](source:tpl-prev) | deep-loop | scan |
| merge | 결과 병합과 새 결과 세기 | 돌아온 audit를 병합한다. audit마다 새 finding 수가 0이면 연속 무발견 count를 하나 올리고, 하나라도 있으면 0으로 되돌린다.[](source:co-streak) | deep-loop | merge |
| chk | 멈출 조건인가? | 연속 무발견 count가 `stopAfterNoNew`에 닿거나, 배정한 횟수가 `maxDiscoveryRuns`에 닿거나, 마감이 지나면 멈춘다. 멈춘 이유는 연속 무발견이면 `saturated`, 횟수 상한이나 마감이면 `capped`로 기록한다.[](source:co-stop) | deep-loop | chk |
| out | 병합 결과로 끝내기 | 마감 때문이 아닌데 받아들인 audit가 하나도 없으면 "configured discovery limit without accepting a complete discovery" 오류로 끝난다. 마감 때문이면 이 오류 없이 `capped`로 돌려주고, 받아들인 audit가 없으면 결과가 비어 있다.[](source:co-stop) | deep-loop | out |
| err | 연속 오류로 끝내기 | 연속 discovery 오류가 `stopAfterConsecutiveErrors`에 닿으면 마지막 실패 이유와 함께 오류로 끝난다.[](source:co-err) | deep-loop | err |

기본 설정값은 번들 `deep_scan_defaults.json`에 있다. 모두 기본값이고 설정으로 바꿀 수 있다.[](source:cfg-def)

@facts id=deep-defaults
| `workers` | 4 · 동시에 도는 discovery worker의 최대 수 |
| `subagents` | 3 · worker마다 쓸 수 있는 subagent 수(0도 허용) |
| `stopAfterNoNew` | 4 · 새 결과 없이 이어진 audit가 이 수에 닿으면 중지 |
| `stopAfterConsecutiveErrors` | 3 · 연속 discovery 오류가 이 수에 닿으면 오류 |
| `maxDiscoveryRuns` | 40 · Standard scan 총 실행 상한 |
| `maxTimeHours` | 96 · 시간 한도. 프로젝트 schema의 최대도 96 |

설정은 위에서부터 우선한다.[](source:cfg-res)

| 우선순위 | 출처 | 값이 들어오는 곳 |
| --- | --- | --- |
| 1 | 프로젝트 설정 | 사용자가 고른 `projectConfigPath`의 파일이다. 도구 설명은 이 경로를 사용자가 명시적으로 골라야 한다고 정한다.[](source:srv-insp)[](source:cfg-res) |
| 2 | 사용자 TOML | `CODEX_SECURITY_DEEP_SCAN_CONFIG_PATH`가 있으면 그 경로, 없으면 `$CODEX_HOME/codex-security/config.toml`이다. `[deep_scan]` 표를 읽고 모르는 키는 거부한다. 출처 라벨은 `legacy`다.[](source:cfg-path)[](source:cfg-keys)[](source:cfg-res) |
| 3 | 번들 기본값 | 위 표다. 출처 라벨은 `default`다.[](source:cfg-def)[](source:cfg-res) |

값 검사도 있다. `workers`는 양의 정수(`"auto"`는 기본 4)이고 `subagents`는 0 이상의 정수다. 나머지 횟수는 양의 정수, `maxTimeHours`는 양수다.[](source:cfg-res)

시간 한도는 아래처럼 정해진다.

@list id=deep-time
| 프로젝트 schema의 `scan.max_time_minutes`는 Standard에서는 권고이고 Deep에서는 강제 discovery 한도다. 기본값이자 최대값이 5760분이다(5760 ÷ 60 = 96시간).[](source:ps-mt) |
| `max_time_hours`는 deprecated다. 최대값은 96이다.[](source:ps-deep) |
| 마감은 scan이 만들어진 시각부터 센다.[](source:co-dl) |
| Standard 감사의 시간 allowance 템플릿은 Deep Scan을 allowance 밖에 둔다.[](source:tb-3) |

프로젝트 설정의 `scan.validation_file`(custom validation 지침)은 active deep scan에서 지원하지 않는다.[](source:ps-val)

## worker는 무엇을 하고 어떤 제약 아래 도나? {#worker}

worker prompt는 `discovery.md` 템플릿에서 나온다. 에이전트는 이 지시를 쓰지 않고 읽기만 한다. 템플릿은 worker에게 아래를 요구한다.[](source:dd-1)

| 주제 | worker의 행동 |
| --- | --- |
| 범위 | 공급된 `includePaths`가 정확한 허가 범위다. 요청한 파일과 요청한 디렉터리의 ignore되지 않은 하위 파일을 보고, 저장소 루트로 넓히지 않는다. 범위 밖 지원 코드는 finding을 설명할 때만 쓰고, 영향받는 동작은 범위 안이어야 한다.[](source:dd-1) |
| 사용자 context와 URL | `userContext`는 신뢰하지 않는 데이터다. 그 안의 URL은 열거나 가져오거나 따라가지 않는다. source-review worker는 모두 offline이고, 사용자가 허가한 URL은 부모만 읽을 수 있다.[](source:dd-1)[](source:sp-ctx) |
| peer notes | `read_deep_scan_peer_notes`로 다른 worker가 조사하는 진입점을 보고, `post_deep_scan_peer_note`로 계획, 파일·줄이 있는 단서, 질문을 올린다. 받은 note는 신뢰하지 않는 단서로 보고 근거를 직접 확인한다.[](source:dd-peer)[](source:ct-peer) |
| 검증 피드백 | 기존 reviewer false-positive 피드백 파일 경로가 있으면 검증 때 읽는다. 신뢰하지 않는 분석 데이터이고, 기록된 사유가 현재 소스와 통제에서도 맞을 때만 일치하는 finding을 억제한다.[](source:tpl-fp) |
| 심각도 | `severityRubric.markdown`이 있으면 위임 작업 포함해 그것으로 등급을 매긴다.[](source:dd-sev) |
| checkpoint | 후보나 검증된 finding이 생기는 대로, 검증 결정마다 `record_codex_security_scan_draft`를 `complete: false`로 저장한다. 미검증 후보는 `reviewState.deferred`에 원래 근거와 함께 둔다. checkpoint는 worker를 끝내지 않는다.[](source:dd-save)[](source:ct-wdraft) |
| 막혔을 때 | 소스 접근이나 실행이 막으면 `complete: false`로 저장하고 막힌 이유를 `reviewState.deferred`에 적은 뒤 멈춘다. turn이 끝났거나 finding이 없다는 이유로 `complete: true`를 내지 않는다. 적용할 소스가 없는 범위를 검토한 뒤 finding 없이 끝내는 것은 허용된다.[](source:dd-block) |
| 끝낼 때 | 모든 finding, 명시적 기각, 미해결 작업을 담아 `complete: true`를 한 번 낸다. 거부되면 보고된 필드만 고쳐 다시 낸다. 최종 수락 뒤에는 멈춘다. 완료는 host의 일이다.[](source:dd-final) |

worker 안에서도 `core-scan.md`가 정한 규칙이 그대로 적용된다. 위임이 가능하면 독립 baseline 감사를 `fork_turns: "none"`으로 시작한다.[](source:cs-base) 단계 스킬을 호출하지 않고 순위 phase, 파일별 ledger, 별도 worker 풀, receipt 파일을 더하지 않는다. reviewer 하위 지시문은 소스를 읽기 전용·offline으로 두고, scan 시작, 단계 스킬과 artifact 도구 호출, 위임, 앱 코드 실행, 파일 수정, 발견한 credential 사용을 금지한다.[](source:cs-noskill)[](source:ba-rules)[](source:fi-rules)

권한과 환경도 정해져 있다. 판정 · 에이전트는 아래 제약을 풀 수 없다. 원문이 거부 규칙을 풀거나 더 넓은 sandbox를 고르지 말라고 한다.[](source:sp-fail)

| 항목 | 원문이 정한 것 |
| --- | --- |
| permission profile | worker는 예약된 profile `codex_security_deep_scan_worker`로 돌고 부모의 파일시스템 거부 규칙을 따른다. 거부 규칙을 풀거나 더 넓은 sandbox를 고르지 않는다. Codex 정책이 profile을 거부하면 도구의 관리자 안내를 보고한다. worker는 좁은 artifact 도구와 읽기 전용 실행 profile을 유지한다.[](source:sp-fail)[](source:pre-id)[](source:as-3) |
| 실행 파일 실패 | 선택한 Codex 실행 파일이 시작하지 못하거나 일찍 끝나면 그 경로와 도구 진단을 보고한다. 버전이 낮다고 추정하지 않는다. 도구가 없는 API를 가리키면 보고된 경로의 Codex를 업데이트하라고 알린다.[](source:sp-fail) |
| 자격 증명 | worker는 선택된 Codex home의 자격 증명과 provider 설정을 쓴다. 계정이 없고 provider가 OpenAI 인증을 요구할 때만 `OPENAI_API_KEY`를 SDK API-key 옵션으로 쓴다. 이 키는 plugin을 띄운 process에 있어야 한다.[](source:sp-fail) |
| worker 위임 방식 | Deep scan은 부모 thread의 worker 풀이 아니라 MCP가 소유한 SDK session을 쓴다. 부모의 delegation 런타임, 소유권, 용량, 깊이를 요구하지 않는다.[](source:sp-fail)[](source:sp-coord) |
| skill 읽기 | worker 입력에는 "Codex Security skill invoked by the assigned workflow"가 있으면 `<plugin>/skills/<이름>/SKILL.md`를 읽으라는 일반 지시가 붙는다. 특정 스킬을 지목하지 않는다.[](source:ex-483) |

host는 batch마다 보고를 합친다. 같은 수정으로 풀리는 보고 쌍만 병합하고, 추가로 결함이 있는 operation이나 근거가 부족한 보고는 따로 둔다. 원래 finding과 인용은 저장된 합집합에 남는다. 마감 전에 worker가 끝나지 않으면 부모가 이유와 저장된 finding, 대기 중인 검토를 보존한다.[](source:sa-deep)[](source:sc-rev)

## 끝난 뒤 무엇을 보고하고 어떻게 멈추나? {#finish}

완료는 누가 소유하는지에 따라 달라진다.

| 경로 | 완료 방법 |
| --- | --- |
| host Deep 부모 | 성공한 run에서 코디네이터가 scan을 봉인하고 `completion`을 돌려준다. 에이전트는 완료 도구를 부르지 않는다.[](source:fr-own)[](source:srv-done) |
| SDK 소유 scan | 에이전트가 host의 scan ID와 manifest 경로를 SDK에 돌려준다. SDK가 finalize한다. 완료나 finalizer를 부르지 않는다.[](source:d-5)[](source:fr-own) |

`completion`이 돌아오면 생성된 `report.md`와 canonical artifacts를 링크한다. `completion.scan.usage`와 별도 비용 추정으로 usage를 보고한다. 보고 규칙은 `final-report.md`가 정한다.[](source:d-5)[](source:fr-resp)

@list id=usage-rules
| `usage.totalTokens`, `usage.inputTokens`(cached 포함), `usage.cachedInputTokens`를 보고한다. |
| `usage.completion.finalized`가 `false`면 총량을 host에 맡기고 중간 수치를 최종값이나 하한으로 인용하지 않는다. |
| 일부만 측정됐으면 "at least X tokens; some usage unavailable"로 적고, usage를 못 얻었으면 0이 아니라 없다고 말한다. |
| 이미 봉인된 artifact에 이 정보를 덧붙이지 않는다. |

결과 해석에서 에이전트가 구분할 것이 하나 있다. 감사가 끝났지만 finding이 0개인 경우와, 어떤 감사도 끝나기 전에 마감이 먼저 온 경우를 구분해서 보고한다.[](source:d-5)[](source:co-const)

판정 · 이 구분이 필요한 이유는 코드에 마감 전 메시지가 따로 있기 때문이다. 상수 `NO_REVIEW_BEFORE_DEADLINE`은 "The configured discovery time limit elapsed before any source review completed."라고 적는다.[](source:co-const)

멈춘 scan은 finding이 없어도 깨끗하다는 결론이 아니다. 봉인 계약은 `completed`만 완료 결론을 뒷받침한다고 정한다.[](source:sc-status)

| 상황 | 에이전트의 행동 |
| --- | --- |
| 터미널 실패 | 저장된 결과와 함께 실패를 보고한다.[](source:d-4) |
| 정책이 worker를 거부함 | 저장된 오류에서 worker를 식별해 보고한다.[](source:d-4) |
| 사용자가 명시적으로 취소 | owning thread에서 `cancel_codex_security_scan({ scanId })`를 부른다. 이 도구는 활성 Deep worker도 취소한다.[](source:d-4)[](source:srv-cancel) |
| 복구 불가 blocker 확인 | 문서 복구를 모두 한 뒤에만 `fail_codex_security_scan`을 쓴다. active worker, 부분 artifact, 끝나지 않은 일, 임시 preflight 문제, turn 종료를 이유로 쓰지 않는다. 이 동작은 재개할 수 없다.[](source:sp-cancel)[](source:srv-fail) |
| 재개할 수 있는 scan | 나중의 continuation을 위해 running 상태로 남긴다.[](source:sp-cancel) |

@callout level=warning title="시작 도구 호출은 코디네이터를 띄운다"
| `start_codex_security_deep_scan`의 설명은 호출자가 떠나도 코디네이터가 부모 scan을 끝낸다고 적는다.[](source:srv-start) 판정 · 그래서 도구 호출을 끊는다고 scan이 멈추지 않는다. 멈추려면 사용자가 명시적으로 취소해야 하고 그때 `cancel_codex_security_scan`을 부른다.[](source:d-4)[](source:srv-cancel) |

## 다른 스킬과 어디에서 이어지나? {#position}

@workflow id=position-flow title="deep-security-scan 앞뒤의 스킬"
| pick | 사용자의 deep 요청 | external | source:front |
| cur | deep-security-scan | backend | source:front |
| diff | security-diff-scan | backend | source:diff-desc |
| std | security-scan | backend | source:sc-front |
| track | track-findings | backend | source:track-8 |
| vis | threat-model-visualize | backend | source:vis-10 |
| pick > cur | 명시 요청 | emphasis |
| cur > diff | 변경분이면 | dashed |
| cur > std | 저장 모드가 Standard면 | dashed |
| cur > track | 요청 시 | dashed |
| cur > vis | 요청 시 | dashed |

@steps id=position-steps
| here | deep-security-scan | 이 페이지의 스킬이다. 앞에서 사용자가 deep을 명시적으로 요청한다. 대상이 변경분이거나 이어 실행하는 scan의 저장 모드가 Standard나 diff이면 다른 scan 스킬로 간다. 뒤의 스킬은 자동이 아니라 사용자가 요청할 때 따로 부른다. | position-flow | cur |

| 관계 | 받는 것 · 넘기는 것 · 조건 |
| --- | --- |
| R02 · 넘김 | security-scan description이 사용자가 명시적으로 요청한 deep scan에만 deep 스킬을 쓰라고 한다. 사용자와 host가 스킬을 고른다.[](source:sc-front) |
| R03 · 넘김 | 변경 범위에는 `security-diff-scan`을 쓰라고 이름으로 정한다. 이어 실행하는 scan의 저장 모드가 diff이면 대응하는 scan 스킬로 계속한다. 도구도 `scope: "."`만 받는다. 호스트가 저장된 scan 정체성과 범위를 `get_codex_security_scan_context`로 준다.[](source:front)[](source:d-1)[](source:srv-chk) |
| R04 · 넘김 | 저장 모드가 Standard이면 "the corresponding scan skill"로 계속한다. 대응 스킬 이름은 적지 않는다.[](source:d-1) |
| R05 · 참고 | host가 Standard 감사를 반복해 finding을 병합한다. 연속 감사가 새 결과를 더하지 못하거나 한도에 닿으면 멈춘다. deep이 security-scan SKILL.md를 호출한다는 문장은 원문에 명시 없음이다. 두 쪽은 `core-scan.md`를 공유한다. 이 스킬은 SKILL.md를 호출하지 않고 worker prompt가 `core-scan.md`를 직접 읽게 한다.[](source:d-intro)[](source:dd-1)[](source:co-stop) |
| R26 · 산출물 호환 | 완료 시 `report.md`와 canonical artifacts를 링크한다. Deep 코디네이터가 부모 scan을 봉인하고 `scan.mode`는 `deep_repository`, 전체 저장소 inventory 전략은 `repository`다. 봉인 계약이 같아 track-findings가 받는 봉인된 scan과 같은 종류다. 봉인된 scan 하나만 받고 사용자가 요청할 때 부른다.[](source:d-5)[](source:fr-own)[](source:sc-modes)[](source:sc-inv)[](source:track-8)[](source:track-24) |
| R72 · 산출물 호환 | Deep 부모 scan은 첫 모델을 `scan.threatModel`에 두고 다른 worker의 모델은 worker 기록에 둔다. host가 primary model에서 `threatmodel.md`를 만든다("an exportable projection, not an independently authored input"). 그래서 visualize가 읽는 것은 부모의 primary model이다. 다른 worker 모델을 합치는지는 원문에 명시 없다.[](source:sc-tm)[](source:vis-10) |

전체 흐름은 묶음 페이지 `codex-security/_group-scan-vulnerabilities`(색인 기준 `_group-scan-vulnerabilities/scan-vulnerabilities.html`)에 있다.

## 어디까지 읽고 확인했나? {#audit}

읽은 텍스트 파일은 32개(전부 읽음 23개, 구조·표본만 확인 9개), 합계 371,535B다. 목록은 같은 폴더의 `files.md`에 있다. 이 페이지 하단의 출처는 본문이 직접 인용한 줄 범위만 담는다.

| 조사 구분 | 확인 범위 |
| --- | --- |
| 스킬 폴더 | `SKILL.md`(3,127B)와 `agents/openai.yaml`(192B)을 끝까지 읽었다. |
| 필수 참조 문서 | 플러그인 루트 `references/` 9개를 끝까지 읽었다. `scan-prologue`, `access-advisory`, `final-report`, `artifact-storage`, `core-scan`, `baseline-auditor`, `focused-investigator`, `scan-contract`, `scan-artifacts`다. 참조 문서 `investigation-time-budget`도 읽었다. |
| Deep 구현 | `discovery.md`(prompt 템플릿), `templates.ts`, `deep_scan_defaults.json`, `check_deep_scan_target.py`, `project-config.schema.json` 앞 215줄을 읽었다. `deep_scan_config.py`는 1~140줄, `tests/test_deep_security_scan_concurrency_guard.py`는 앞 100줄을 읽었다. |
| 구조·표본만 확인(전부 읽지 않음) | `coordinator.ts`(40,348B)는 54~60, 575~615, 736~925줄만 읽었다. `executor.ts`(48,414B)는 470~500줄만, `engine.ts`(4,065B)는 95~140줄만, `permission-profile-preflight.ts`(32,222B)는 1~40줄만 읽었다. `server.ts`(84,254B)는 Deep 시작·setup·취소·실패 도구와 입력 검사 구간만 읽었다. |
| 읽지 않음 | `deep-scan/`의 나머지(store, iteration, same-fix 병합, worker-runner 등)와 `mcp-app/tests/`는 읽지 않았다. 병합 알고리즘의 세부는 이 분석 범위가 아니다. |
| 호출 제한 대조용 부분 읽음 | 형제 스킬 `security-scan`, `security-diff-scan`과 후속 스킬 `track-findings`, `threat-model-visualize`의 관련 줄만 읽었다. |
| 제외 | `*.KO.md` 번역본은 열지 않았다. 바이너리는 읽지 않았다. 외부 URL은 열지 않았다. 코드는 읽기만 하고 실행하지 않았다. |

원문의 활성화 조건, 시작 도구 인자 제한, 사람 선택 지점, 기본 설정값 6개, 중단 조건 4가지, 시간 한도 계산, 취소·실패 조건을 모두 대조했다. 스킬 본문이 적은 반복 실행, 이전 finding 전달, 연속 무발견 중단, 시간·횟수 한도는 읽은 코디네이터 줄로 모두 뒷받침된다.

@callout level=open-question title="확인하지 못한 것"
| 병합 알고리즘(`same-fix`, 비교 보고)의 세부와 `iteration`, `store`는 읽지 않았다. "새 finding 수"가 어떻게 세어지는지는 `mergeBatch`를 읽지 않아 확인하지 못했다. |
| 프로젝트 설정 파일의 JSON 키(`deep.workers`, `deep.subagents_per_worker` 등)가 Python 쪽 설정 이름(`workers`, `subagents`)으로 바뀌는 코드는 읽지 않았다. 이름 대응은 두 schema 설명으로 짐작한 것이다. |
| 실제 실행 번들(`mcp/server.mjs`)은 저장소에 없다. `.mcp.json`은 이 서버의 `tool_timeout_sec` 349200(=97시간)을 선언한다. 96시간보다 크다. 그 값을 고른 이유를 적은 문서는 이 트리에 없다.[](source:mcp) |
| 스킬 본문의 "Workers in the same scan can exchange investigation leads"는 peer note 도구와 prompt 템플릿으로 뒷받침되지만, 어떤 worker가 어떤 note를 읽는지는 확인하지 못했다.[](source:ct-peer) |

분석 중 원본은 수정하지 않았다. 이 폴더에 분석 초안과 HTML만 썼고 어떤 도구나 명령도 실행하지 않았다.
