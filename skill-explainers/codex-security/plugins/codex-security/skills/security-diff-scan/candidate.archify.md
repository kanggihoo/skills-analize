# security-diff-scan은 변경분의 취약점을 어떤 단계로 확인하게 하나? {#security-diff-scan-page}

`security-diff-scan`은 PR, commit, branch diff, working-tree patch에서 **변경된 모든 텍스트 파일**(삭제된 파일 포함)을 보게 하는 스킬이다. host가 연 diff scan 안에서 위협 모델, 변경 파일 inventory, 후보 발견, 검증, 공격 경로 분석을 이 순서로 거치고, draft를 제출한 뒤 봉인한다.[](source:d-intro)[](source:d-1)[](source:d-6) 변경 파일이나 후보가 하나라도 미처리면 "발견 없음"으로 결론 내지 않는다.[](source:d-end)

- 새 scan은 `start_codex_security_prompt_only_scan`을 `mode: "diff"`로 한 번 불러 열고, 기존 `scanId`는 `get_codex_security_scan_context`로 이어받는다. MCP가 없거나 baseline이 지원되지 않으면 blocker를 보고하고, 대체 scan이나 shell로 쓴 canonical 파일을 만들지 않는다.[](source:d-start)
- 검토는 네 단계 스킬에 내부 위임한다. `$threat-model`을 한 번, `$finding-discovery`를 compact diff mode로, 후보가 있으면 `$validation`과 `$attack-path-analysis`를 각각 한 번 실행한다.[](source:d-1)[](source:d-3)[](source:d-4)
- 도구가 완결성을 강제한다. 검증은 모든 후보의 처분을, 공격 경로는 자격 있는 후보 전부를 한 번에 제출해야 하고 하나라도 빠지면 거부한다.[](source:led-val)[](source:led-ap)
- 모든 changed file과 후보는 reviewed, resolved, 명시적 unfinished 중 하나로 설명돼야 한다.[](source:d-end)

@answer scope="분석 커밋 cd5035b · 필수 참조 문서와 MCP 도구 계약까지 읽음 · 코드와 도구는 실행하지 않음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source front title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 스킬 본문(원본) frontmatter" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=1:4
@source yaml title="codex-security/plugins/codex-security/skills/security-diff-scan/agents/openai.yaml · 284B · UI 표시와 default_prompt(원본)" path=codex-security/plugins/codex-security/skills/security-diff-scan/agents/openai.yaml lines=1:4
@source d-intro title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 스킬 본문(원본) 검토 범위" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=8:8
@source d-setup title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 스킬 본문(원본) 준비 읽을 문서와 외부 자료" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=12:12
@source d-start title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 스킬 본문(원본) scan 시작" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=14:14
@source d-runtime title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 스킬 본문(원본) 실행 환경과 SECURITY.md" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=16:16
@source d-time title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 스킬 본문(원본) 시간 allowance" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=18:18
@source d-ctx title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 스킬 본문(원본) context와 진행 보고" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=20:20
@source d-inv title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 스킬 본문(원본) 검토 대상 파일" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=24:24
@source d-cancel title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 스킬 본문(원본) 취소와 실패" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=26:26
@source d-1 title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 스킬 본문(원본) 1단계 위협 모델" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=28:28
@source d-2 title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 스킬 본문(원본) 2단계 inventory" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=29:29
@source d-3 title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 스킬 본문(원본) 3단계 발견" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=30:30
@source d-4 title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 스킬 본문(원본) 4단계 검증과 공격 경로" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=31:31
@source d-5 title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 스킬 본문(원본) 5단계 draft" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=32:32
@source d-6 title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 스킬 본문(원본) 6단계 완료" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=33:33
@source d-end title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 스킬 본문(원본) 마무리 규칙" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=35:35
@source as-own title="codex-security/plugins/codex-security/references/artifact-storage.md · 7947B · artifact 저장 scan 소유권" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=7:9
@source as-supp title="codex-security/plugins/codex-security/references/artifact-storage.md · 7947B · artifact 저장 보조 파일" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=13:13
@source sr-1 title="codex-security/plugins/codex-security/references/scan-runtime.md · 1558B · scan 실행 환경 위임과 fallback" path=codex-security/plugins/codex-security/references/scan-runtime.md lines=3:5
@source sr-diff title="codex-security/plugins/codex-security/references/scan-runtime.md · 1558B · scan 실행 환경 host-backed diff" path=codex-security/plugins/codex-security/references/scan-runtime.md lines=7:7
@source sr-adv title="codex-security/plugins/codex-security/references/scan-runtime.md · 1558B · scan 실행 환경 접근 안내" path=codex-security/plugins/codex-security/references/scan-runtime.md lines=11:13
@source adv title="codex-security/plugins/codex-security/references/access-advisory.md · 1373B · Daybreak 접근 안내" path=codex-security/plugins/codex-security/references/access-advisory.md lines=3:11
@source tb title="codex-security/plugins/codex-security/references/investigation-time-budget.md · 1749B · 조사 시간 allowance 템플릿" path=codex-security/plugins/codex-security/references/investigation-time-budget.md lines=3:11
@source fr-top title="codex-security/plugins/codex-security/references/final-report.md · 12135B · 최종 결과 canonical 문서" path=codex-security/plugins/codex-security/references/final-report.md lines=3:3
@source fr-own title="codex-security/plugins/codex-security/references/final-report.md · 12135B · 최종 결과 소유자 표" path=codex-security/plugins/codex-security/references/final-report.md lines=7:16
@source fr-state title="codex-security/plugins/codex-security/references/final-report.md · 12135B · 최종 결과 review state" path=codex-security/plugins/codex-security/references/final-report.md lines=34:38
@source fr-map title="codex-security/plugins/codex-security/references/final-report.md · 12135B · 최종 결과 diff 후보 처분 매핑" path=codex-security/plugins/codex-security/references/final-report.md lines=42:49
@source fr-opt title="codex-security/plugins/codex-security/references/final-report.md · 12135B · 최종 결과 선택 문서" path=codex-security/plugins/codex-security/references/final-report.md lines=53:53
@source fr-err title="codex-security/plugins/codex-security/references/final-report.md · 12135B · 최종 결과 오류 복구" path=codex-security/plugins/codex-security/references/final-report.md lines=57:59
@source fr-resp title="codex-security/plugins/codex-security/references/final-report.md · 12135B · 최종 결과 usage 보고" path=codex-security/plugins/codex-security/references/final-report.md lines=77:77
@source fr-code title="codex-security/plugins/codex-security/references/final-report.md · 12135B · 최종 결과 code-comment 형식" path=codex-security/plugins/codex-security/references/final-report.md lines=81:85
@source sa-compact title="codex-security/plugins/codex-security/references/scan-artifacts.md · 11701B · scan 경로 규약 compact diff" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=41:49
@source sa-final title="codex-security/plugins/codex-security/references/scan-artifacts.md · 11701B · scan 경로 규약 최종 산출물" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=96:106
@source sc-modes title="codex-security/plugins/codex-security/references/scan-contract.md · 16529B · 봉인 계약 scan mode" path=codex-security/plugins/codex-security/references/scan-contract.md lines=122:132
@source sc-status title="codex-security/plugins/codex-security/references/scan-contract.md · 16529B · 봉인 계약 scan status" path=codex-security/plugins/codex-security/references/scan-contract.md lines=32:41
@source sg title="codex-security/plugins/codex-security/references/security-guidance.md · 2830B · SECURITY.md 해석 규칙" path=codex-security/plugins/codex-security/references/security-guidance.md lines=34:36
@source fdf title="codex-security/plugins/codex-security/references/finding-detail-fields.md · 10874B · finding 상세 필드 작성 규칙" path=codex-security/plugins/codex-security/references/finding-detail-fields.md lines=9:21
@source tm-3 title="codex-security/plugins/codex-security/skills/threat-model/SKILL.md · 2986B · 단계 스킬 description" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=3:3
@source tm-8 title="codex-security/plugins/codex-security/skills/threat-model/SKILL.md · 2986B · 단계 스킬 본문" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=8:8
@source tm-sel title="codex-security/plugins/codex-security/skills/threat-model/SKILL.md · 2986B · 단계 스킬 모델 선택" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=14:17
@source tm-ret title="codex-security/plugins/codex-security/skills/threat-model/SKILL.md · 2986B · 단계 스킬 실행 중 scan 결과" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=25:25
@source fd-16 title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · 단계 스킬 compact diff" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=16:16
@source fd-eval title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · 단계 스킬 근거 기준" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=24:29
@source fd-31 title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · 단계 스킬 위임" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=31:31
@source val-3 title="codex-security/plugins/codex-security/skills/validation/SKILL.md · 4619B · 단계 스킬 description" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=3:3
@source val-12 title="codex-security/plugins/codex-security/skills/validation/SKILL.md · 4619B · 단계 스킬 평가 절차" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=12:17
@source val-25 title="codex-security/plugins/codex-security/skills/validation/SKILL.md · 4619B · 단계 스킬 compact diff" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=25:30
@source vg-conf title="codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md · 4408B · 검증 지침 확신도" path=codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md lines=31:35
@source ap-33 title="codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md · 5355B · 단계 스킬 compact diff" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=31:36
@source sp-rep title="codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md · 2644B · 심각도 정책 reportability" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=9:17
@source sp-like title="codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md · 2644B · 심각도 정책 likelihood" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=19:24
@source sp-prio title="codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md · 2644B · 심각도 정책 priority" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=26:35
@source srv-po title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · MCP 서버 prompt-only scan 시작 도구 설명" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=641:644
@source srv-po2 title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · MCP 서버 prompt-only scan 입력 검사" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=652:670
@source srv-diff title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · MCP 서버 diffTarget 형식" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=103:121
@source srv-whole title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · MCP 서버 whole target 판정" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1993:1999
@source srv-ctxup title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · MCP 서버 context 갱신 설명" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1462:1466
@source srv-phase title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · MCP 서버 progress phase 목록" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=340:348
@source srv-comp title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · MCP 서버 완료 도구" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1567:1573
@source srv-fail title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · MCP 서버 실패 처리 도구" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1625:1631
@source wp title="codex-security/plugins/codex-security/scripts/workbench_progress.py · 16640B · workbench phase 되돌림 거부" path=codex-security/plugins/codex-security/scripts/workbench_progress.py lines=267:268
@source ct-prep title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 15421B · MCP 도구 inventory 준비" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=82:92
@source ct-list title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 15421B · MCP 도구 inventory 읽기" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=94:106
@source ct-rec title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 15421B · MCP 도구 후보 기록" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=109:121
@source ct-val title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 15421B · MCP 도구 검증 기록" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=137:150
@source ct-ap title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 15421B · MCP 도구 공격 경로 기록" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=152:165
@source ct-draft title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 15421B · MCP 도구 draft 저장" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=168:174
@source ct-done title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 15421B · MCP 도구 완료 scan 읽기" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=188:201
@source ct-mode title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 15421B · MCP 도구 diff·Deep 모드 검사" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=370:384
@source inv-path title="codex-security/plugins/codex-security/mcp-app/src/artifact-inventory.ts · 5370B · MCP 구현 inventory 경로" path=codex-security/plugins/codex-security/mcp-app/src/artifact-inventory.ts lines=17:18
@source inv-diff title="codex-security/plugins/codex-security/mcp-app/src/artifact-inventory.ts · 5370B · MCP 구현 diff inventory 인자" path=codex-security/plugins/codex-security/mcp-app/src/artifact-inventory.ts lines=54:79
@source disc-rec title="codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts · 6305B · MCP 구현 후보 replace" path=codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts lines=52:101
@source led-val title="codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts · 6121B · MCP 구현 검증 전체 제출 검사" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=39:65
@source led-ap title="codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts · 6121B · MCP 구현 공격 경로 제출 검사" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=117:141
@source led-elig title="codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts · 6121B · MCP 구현 공격 경로 자격 조건" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=156:159
@source tmdoc title="codex-security/plugins/codex-security/mcp-app/src/threat-model-document.ts · 2657B · MCP 구현 threatmodel.md 생성" path=codex-security/plugins/codex-security/mcp-app/src/threat-model-document.ts lines=33:70
@source sch-disc title="codex-security/plugins/codex-security/schemas/definitions/discovery-candidate.schema.json · 4203B · 후보 입력 schema" path=codex-security/plugins/codex-security/schemas/definitions/discovery-candidate.schema.json lines=51:82
@source sch-role title="codex-security/plugins/codex-security/schemas/definitions/discovery-candidate.schema.json · 4203B · 후보 위치 role 값" path=codex-security/plugins/codex-security/schemas/definitions/discovery-candidate.schema.json lines=10:19
@source sch-items title="codex-security/plugins/codex-security/schemas/tools/review-items.schema.json · 1431B · inventory 읽기 schema" path=codex-security/plugins/codex-security/schemas/tools/review-items.schema.json lines=18:32
@source sch-val title="codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json · 4519B · 검증 기록 schema 처분과 확신도" path=codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json lines=36:50
@source sch-valreq title="codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json · 4519B · 검증 기록 schema 필수 필드" path=codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json lines=124:133
@source sch-apr title="codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json · 6810B · 공격 경로 schema reportable" path=codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json lines=68:92
@source sch-api title="codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json · 6810B · 공격 경로 schema ignore" path=codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json lines=106:130
@source sch-apd title="codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json · 6810B · 공격 경로 schema deferred" path=codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json lines=144:173
@source sch-draft title="codex-security/plugins/codex-security/schemas/tools/scan-draft.schema.json · 28295B · draft 입력 schema complete 설명" path=codex-security/plugins/codex-security/schemas/tools/scan-draft.schema.json lines=723:726
@source sch-draftreq title="codex-security/plugins/codex-security/schemas/tools/scan-draft.schema.json · 28295B · draft 입력 schema 필수 키" path=codex-security/plugins/codex-security/schemas/tools/scan-draft.schema.json lines=749:749
@source mcp title="codex-security/plugins/codex-security/.mcp.json · 2078B · MCP 서버 시간 제한" path=codex-security/plugins/codex-security/.mcp.json lines=65:66
@source readme title="codex-security/plugins/codex-security/skills/README.md · 3752B · 벤더의 스킬 선택 안내" path=codex-security/plugins/codex-security/skills/README.md lines=7:9
@source sc-front title="codex-security/plugins/codex-security/skills/security-scan/SKILL.md · 2972B · 형제 스킬 description" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=3:3
@source deep-desc title="codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md · 3127B · 형제 스킬 description" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=3:3
@source deep-10 title="codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md · 3127B · 형제 스킬 연속 실행 분기" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=10:10
@source track-8 title="codex-security/plugins/codex-security/skills/track-findings/SKILL.md · 13459B · 이어지는 스킬 입력 조건" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=8:8
@source track-24 title="codex-security/plugins/codex-security/skills/track-findings/SKILL.md · 13459B · 이어지는 스킬 읽는 파일" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=24:24
@source vw-3 title="codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md · 5571B · 이어지는 스킬 description" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=3:3
@source ph-3 title="codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md · 5026B · 이어지는 스킬 description" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=3:3
@source vis-10 title="codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md · 19102B · 이어지는 스킬 입력 조건" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=10:10
@source tf-12 title="codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md · 4447B · 이어지는 스킬 findings 입력 조건" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=12:12
@source fd-schema title="codex-security/plugins/codex-security/schemas/findings.schema.json · 10591B · findings 문서 documentType" path=codex-security/plugins/codex-security/schemas/findings.schema.json lines=7:7
@source sp-8 title="codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md · 5982B · SECURITY.md 작성 스킬 성격" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=8:8
@source as-tm title="codex-security/plugins/codex-security/references/scan-artifacts.md · 11701B · scan 경로 규약 위협 모델" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=28:29
@source srv-adv title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · MCP 서버 Standard scan 접근 안내 반환" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=2071:2074

## 언제 켜지고, 언제 쓰면 안 되나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻은 아니다. `disable-model-invocation` 같은 호출 제한 필드는 frontmatter에 원문에 명시 없음이다. `agents/openai.yaml`에도 `policy` 항목이 없다.[](source:front)[](source:yaml)

@code source=front language=yaml

| 요청 | 쓰는 스킬 | 근거 |
| --- | --- | --- |
| PR, commit, branch diff, working-tree patch를 본다 | `security-diff-scan` {good:이 스킬} | description이 이 네 대상을 적는다.[](source:front) |
| 저장소 전체나 폴더의 현재 소스를 감사한다 | `security-scan` {caution:이 스킬이 아님} | security-scan description이 변경분에는 diff 스킬을 쓰라고 한다.[](source:sc-front) |
| deep scan을 명시적으로 요청했는데 대상이 변경분이다 | `security-diff-scan` {caution:deep 아님} | deep description이 "For changes to a PR, commit, branch or working tree, use security-diff-scan"이라고 한다.[](source:deep-desc) |

`default_prompt`는 모든 in-scope 변경 파일을 다루고 "required scan phases"를 끝내라고 요구하는 예시다.[](source:yaml)

도구 쪽 제한도 있다. 시작 도구는 diff scan에 `diffTarget`을 요구하고 대상 전체(scope `.`)만 받는다. 이 제한 때문에 diff scan은 경로 일부만 좁혀 열 수 없다.[](source:srv-po2)[](source:srv-whole)

| 도구가 받는 입력 | 값 |
| --- | --- |
| `diffTarget.kind` | `working_tree`, `commit`, `range` 세 가지다. `range`는 base와 head revision이 모두 필수인 kind다. PR이나 branch diff를 어느 kind로 넘기는지는 원문에 명시 없음이다.[](source:srv-diff) |
| `scope` | 대상 전체(`.`)만 받는다. 아니면 "require the whole target; use scope '.'" 오류다.[](source:srv-po2)[](source:srv-whole) |
| owning Codex thread | 컨텍스트가 없으면 시작을 거부한다.[](source:srv-po2) |

시작 도구는 같은 scan을 한 번만 완료하라고 안내한다. 이 스킬을 쓰면 안 되는 경우는 다음과 같다.[](source:srv-po)

@list id=not-for
| 변경과 무관한 저장소 전체 감사로 넓히지 않는다. 변경된 동작을 따라 지원 코드까지만 본다.[](source:d-intro) |
| 필요한 MCP가 없을 때 새 scan이나 shell로 만든 canonical 파일로 우회하지 않는다.[](source:d-start)[](source:as-own) |
| 사용자 context와 외부 자료로 대상이나 서비스 접근 범위를 넓히지 않는다.[](source:d-setup) |

## 시작할 때 무엇을 고정하나? {#setup}

SKILL.md는 먼저 `artifact-storage.md`를 읽고 정확한 Git 범위나 local patch를 고정하라고 한다. scan을 새로 열지 기존 것을 이어받을지는 `scanId`가 가른다.[](source:d-setup)[](source:d-start)

@workflow id=diff-start-route title="diff scan을 여는 경로"
| ask | diff 검토 요청 | external |
| hasid | 기존 scanId가 있나? | backend |
| ctx | scan context 조회 | backend | source:d-start |
| mcp | MCP와 baseline이 되나? | backend |
| start | prompt-only 시작 | backend | source:d-start |
| block | blocker 보고 | security | source:d-start |
| bound | scan 정체성 보존 | database | source:d-start |
| ask > hasid | |
| hasid > ctx | 예 |
| hasid > mcp | 아니오 |
| mcp > start | 예 |
| mcp > block | 아니오 | security |
| ctx > bound | |
| start > bound | |

@steps id=start-steps
| hasid | 기존 scanId가 있나? | 기존 `scanId`는 `get_codex_security_scan_context`로 이어받는다. 없으면 시작 도구를 부른다.[](source:d-start) | diff-start-route | hasid |
| start | prompt-only 시작 | `start_codex_security_prompt_only_scan`을 한 번 부른다. 인자는 `mode: "diff"`, `targetPath`, `scope: "."`, `diffTarget`, 선택 `userContext`다.[](source:d-start) | diff-start-route | start |
| bound | scan 정체성 보존 | 돌려받은 identity, directory, revisions, handoff token을 보존한다. SDK가 소유한 scan은 받은 context와 완료 소유자를 그대로 유지한다.[](source:d-start) | diff-start-route | bound |
| block | blocker 보고 | MCP가 없거나 baseline이 지원되지 않으면 사유를 보고한다. 대체 scan도 shell로 쓴 canonical 파일도 만들지 않는다.[](source:d-start)[](source:as-own) | diff-start-route | block |

시작한 뒤 검토 전에 아래를 지킨다.

| 조건 | 에이전트의 행동 |
| --- | --- |
| 범위 | Git 범위나 local patch를 정확히 고정하고 바꾸지 않는다.[](source:d-setup) |
| context와 외부 자료 | 분석 데이터로 다루고 지시나 권한으로 보지 않는다. parent는 사용자가 허가한 범위에서 주어진 URL을 읽을 수 있다. 내용이 대상이나 서비스 접근을 더 허가하지는 않는다.[](source:d-setup) |
| 실행 환경 | 소스 검토 전에 `scan-runtime.md`를 읽는다. 쓸 수 있는 worker를 쓰고, 안 되면 부모가 이어 간다. 관련 `SECURITY.md` 지침을 적용한다.[](source:d-runtime) |
| worker 시작 근거 | delegation 도구가 deferred이고 `tool_search`가 있으면 한 번 찾아본 뒤에 worker 불가로 판단한다. 성공한 spawn 호출과 돌려받은 worker ID만 시작의 증거다. 설정된 용량은 최대치일 뿐이다.[](source:sr-1) |
| worker가 안 뜰 때 | 부모가 같은 검토를 이어 가고 실제 coverage gap을 보고한다. 선택 worker를 켜려고 Codex 설정 파일을 읽거나 고치지 않는다.[](source:sr-1) |
| host-backed diff | host의 권위 있는 scan context를 쓰고, architecture mapping 전에 `threat_model` phase로 넘어간다.[](source:sr-diff) |
| 시간 제한 | 기존이나 host가 준 allowance는 재개 turn에서도 그대로 둔다. 사용자가 이 대화에서 명시 요청했을 때만 설정 뒤, 소스 검토 전에 템플릿을 읽고 양수 `budgetMinutes`, 실제 UTC `startedAt`, 계산한 `deadlineAt`으로 한 번 채워 넣는다. 요청이 없으면 템플릿을 읽지도 시계를 시작하지도 않는다.[](source:d-time) |
| context 갱신 | 사용자가 바꾸라고 한 context는 `update_codex_security_scan_context`로 저장한다. 실제 단계 전환 때 `update_codex_security_scan_progress`를 부르고, 돌려받은 `scan.userContext`를 그 단계와 worker에게 쓴다. worker는 context를 데이터로만 보고 offline을 유지한다.[](source:d-ctx)[](source:srv-ctxup) |
| 접근 안내 | `scan-runtime.md`는 diff scan이 첫 실질 작업 전에 `access-advisory.md`를 읽으라고 한다. 이 안내는 scan을 허가하거나 막지 않는다.[](source:sr-adv)[](source:adv) |

시간 allowance 템플릿은 권고다. 마감이 되면 새 조사를 열지 않고 끝나지 않은 일을 coverage에 남긴다. 모든 phase와 재시도가 처음의 절대 마감을 공유하고 시계를 다시 시작하지 않는다.[](source:tb)

취소와 실패는 구분한다. `cancel_codex_security_scan`은 사용자가 명시적으로 취소할 때만 쓰고, `fail_codex_security_scan`은 복구할 수 없는 blocker가 확인됐을 때만 쓴다. 복구가 가능한 동안은 durable scan을 보존한다.[](source:d-cancel) 실패 도구의 설명도 "This terminal action cannot be resumed"라고 적는다.[](source:srv-fail)

## 여섯 단계는 어떤 순서이고 도구가 무엇을 강제하나? {#flow}

SKILL.md는 단계를 번호 목록으로 정한다. 네 단계 스킬은 이 목록 안에서 `$이름`으로 호출된다.[](source:d-1)[](source:d-3)[](source:d-4)

@workflow id=diff-flow title="diff scan 6단계"
| lane prep | 준비 |
| lane find | 발견 |
| lane judge | 판단 |
| lane wrap | 마무리 |
| tm | 위협 모델 | backend | prep | source:d-1 |
| inv | 변경 파일 inventory | database | prep | source:d-2 |
| disc | 후보 발견 | backend | find | source:d-3 |
| has | 후보가 있나? | backend | judge | source:d-4 |
| val | 후보 검증 | backend | judge | source:d-4 |
| ap | 공격 경로 분석 | backend | judge | source:d-4 |
| draft | draft 제출 | database | wrap | source:d-5 |
| done | 완료·봉인 | database | wrap | source:d-6 |
| tm > inv | |
| inv > disc | |
| disc > has | |
| has > val | 예 |
| has > draft | 아니오 |
| val > ap | reportable 또는 deferred |
| ap > draft | |
| draft > done | 승인 뒤 | emphasis |

@steps id=diff-steps
| tm | 위협 모델 | `$threat-model`을 한 번 실행하거나 공급된 모델을 쓴다. schema를 통과하는 공급 모델은 그대로 둔다. 아니면 공급된 텍스트나 생성한 Markdown을 `{ "format": "markdown", "content": ... }`로 보존하고 `origin`을 `provided` 또는 `generated`로 둔다. 사용자가 좁히라고 하지 않으면 저장소 전체를 모델링하고, 모델의 범위를 변경 파일 범위와 따로 적는다. 곧바로 모델만 담은 `complete: false` draft를 저장한다.[](source:d-1)[](source:tm-ret) 공급된 모델, 비어 있지 않은 `userContext`, 지식 베이스, 더 좁은 scope가 있으면 공유 cache를 읽지도 대체하지도 않고 공급 모델을 보존하거나 새로 만든다.[](source:tm-sel) | diff-flow | tm |
| inv | 변경 파일 inventory | `prepare_codex_security_review_items`로 변경 파일 목록을 만들고 `list_codex_security_review_items`의 모든 page를 읽는다. 변경되지 않은 지원 파일은 변경 동작을 설명하는 데 필요한 만큼만 본다.[](source:d-2) | diff-flow | inv |
| disc | 후보 발견 | `$finding-discovery`를 compact diff mode로 inventory 전체에 돌린다. 쓸 수 있는 worker에 독립 assignment를 나누고 나머지 파일은 직접 본다. 독립적으로 취약한 instance는 따로 다룰 수 있게 두고, 모든 후보를 `record_codex_security_discovery_candidates`로 한 번에 기록한다. 순위 worklist, finding별 ledger, discovery 보고서는 만들지 않는다.[](source:d-3) 단계 스킬 쪽에서도 compact diff는 이 방식이고, discovery 안에서 validation이나 attack-path를 되풀이하지 않는다.[](source:fd-16)[](source:fd-31) | diff-flow | disc |
| has | 후보가 있나? | 후보가 있을 때만 `$validation`을 한 번 실행한다.[](source:d-4) | diff-flow | has |
| val | 후보 검증 | 모든 후보의 처분을 `record_codex_security_candidate_validations` 한 번으로 제출한다.[](source:val-25) | diff-flow | val |
| ap | 공격 경로 분석 | `$attack-path-analysis`를 한 번, `reportable` 또는 `deferred`로 표시된 후보에만 실행한다. 위치, 근거, 영향받는 instance, 미해결 질문을 보존한다.[](source:d-4)[](source:ap-33) | diff-flow | ap |
| draft | draft 제출 | `final-report.md`를 읽고 결정이 나올 때마다 `complete: false` checkpoint를 저장한다. 미해결 후보와 원래 근거는 `reviewState.deferred`에 둔다. 검토가 정리되면 모델, findings, review state를 담아 `complete: true`를 제출한다. 끝난 일반 작업은 `reviewState.resolvedDeferred: [{ id, reason }]`로 닫는다.[](source:d-5) 저장된 일반 작업은 final draft에서 빠뜨리는 것만으로는 닫히지 않는다.[](source:fr-state) | diff-flow | draft |
| done | 완료·봉인 | `complete_codex_security_scan`을 한 번 부르고 `get_codex_security_completed_scan`을 읽는다. SDK가 완료를 소유한 scan은 예외다. 생성된 보고서, 실제 coverage 한계, 측정된 token 사용량, 확정 finding의 Codex review comment를 돌려준다.[](source:d-6) | diff-flow | done |

각 단계에서 도구가 확인하는 조건은 다음과 같다. 모두 도구 구현에서 읽은 계약이다.

| 단계 | 도구 | 도구가 거부하거나 정하는 것 |
| --- | --- | --- |
| inventory | `prepare_codex_security_review_items` | diff scan에서만 쓸 수 있다. 권위 있는 변경 범위가 없거나, kind가 `working_tree`·`commit`·`range`가 아니거나, base·head revision 문자열이 비어 있으면 거부한다. `working_tree`는 `local-patch`, 나머지는 `revisions` 모드로 목록을 만든다.[](source:ct-prep)[](source:ct-mode)[](source:inv-diff) |
| inventory 읽기 | `list_codex_security_review_items` | `artifacts/02_discovery/in_scope_files.txt`를 page 단위로 읽는다. `limit`은 1에서 1000까지다.[](source:ct-list)[](source:inv-path)[](source:sch-items) |
| 후보 기록 | `record_codex_security_discovery_candidates` | diff scan에서만 쓸 수 있다. 기존 후보를 모두 **replace**하므로 다시 부르면 이전 후보가 사라진다. 같은 CWE, 위치, instance인 행은 병합하고 결정적 `candidate_id`를 붙인다.[](source:ct-rec)[](source:disc-rec)[](source:sa-compact) |
| 검증 기록 | `record_codex_security_candidate_validations` | 기존 후보 전체의 처분을 받는다. 모르는 후보나 중복 후보와 빠진 후보를 거부한다("Validation must include every existing candidate").[](source:ct-val)[](source:led-val) |
| 공격 경로 기록 | `record_candidate_attack_paths` | `reportable` 또는 `deferred` 처분을 받은 후보만 받고, 그런 후보가 하나라도 빠지면 거부한다. 자격 없는 후보를 넣어도 거부한다.[](source:ct-ap)[](source:led-ap)[](source:led-elig) |
| draft | `record_codex_security_scan_draft` | `scanId`, `findings`, `reviewState`가 필수다. `complete: false`는 진행 저장이고 생략하거나 `true`면 최종 제출이다.[](source:ct-draft)[](source:sch-draft)[](source:sch-draftreq) |
| 완료 | `complete_codex_security_scan` | 이미 쓰인 manifest와 findings를 검증하고 봉인한다. 빠진 단계나 없는 draft를 대신 만들지 않는다. 실패하면 오류를 보이고 재시도 없이 응답을 멈춘다.[](source:srv-comp)[](source:fr-own) |
| 완료 뒤 읽기 | `get_codex_security_completed_scan` | 봉인된 canonical 문서를 읽기 전용으로 돌려준다.[](source:ct-done) |

진행 phase는 아래 여섯 단계이고 host는 앞으로만 옮긴다. 이전 phase로 옮기려 하면 "Scan progress cannot move to an earlier phase"로 거부한다. 이 phase는 스킬 호출 순서가 아니라 host가 기록하는 상태다.[](source:srv-phase)[](source:wp)

@list id=phase-order ordered=true
| `preflight` |
| `threat_model` |
| `discovery` |
| `validation` |
| `attack_path` |
| `reporting` |

host-backed diff scan은 `threat_model` phase로 넘어간 뒤 architecture mapping을 시작한다.[](source:sr-diff)

## 후보는 어떻게 finding이 되나? {#ledger}

diff scan은 후보를 `artifacts/02_discovery/candidate_ledger.jsonl` 하나에 모은다. discovery가 후보를 쓰고, validation이 모든 후보에 `validation` 객체를, attack-path가 자격 후보에 `attack_path` 객체를 더한다. 도구는 후보 순서와 기존 필드를 보존한다. 후보별 폴더와 보고서, receipt는 만들지 않는다.[](source:sa-compact)

최종 산출물은 scan 폴더의 `scan-manifest.json`, `findings.json`, `report.md`, 위협 모델이 기록되면 `threatmodel.md`다.[](source:sa-final)

| 단계 | 더하는 기록 | 필수·허용 값 |
| --- | --- | --- |
| 발견 | 후보 행 | `cwe_ids`, `locations`(1개 이상, `path`·`start_line`·`role`), `summary`, `evidence`가 필수다. `context`와 `instance`는 선택이다.[](source:sch-disc) |
| 검증 | `validation` | 처분 `reportable`, `suppressed`, `not_applicable`, `deferred`. `method`, `confidence`(`high`·`medium`·`low`), `confidence_rationale`, `rubric`, `evidence`, `counterevidence_or_proof_gap`, `remaining_uncertainty` 8개가 필수다.[](source:sch-val)[](source:sch-valreq) |
| 공격 경로 | `attack_path` | `decision`이 `reportable`이면 severity는 `critical`·`high`·`medium`·`low`이고, `ignore`이면 severity도 `ignore`다. `deferred`는 severity에 `unknown`이 허용되고 `proof_gap`이 필수다.[](source:sch-apr)[](source:sch-api)[](source:sch-apd) |

위치 `role`은 `entrypoint`, `entrypoint/wrapper`, `source`, `root_control`, `sink`, `concrete_implementation`, `evidence` 일곱 가지다.[](source:sch-role)

검증 단계는 후보마다 근거를 찾는다. 확신도는 높음, 중간, 낮음 세 단계다.[](source:val-12)

| 확신도 | 뜻 |
| --- | --- |
| `high` | 경로와 보안 영향이 세워졌고 해결되지 않은 반증이 없다.[](source:vg-conf) |
| `medium` | 직접 근거가 있지만 중요한 전제나 경로 일부가 불확실하다.[](source:vg-conf) |
| `low` | 근거가 간접적이거나 중요한 맥락이 빠졌다.[](source:vg-conf) |

공격 경로 단계는 reportability와 심각도를 정한다. 심각도 등급은 scan이 준 rubric이 있으면 그것을, 없으면 `default-severity-rubric.md`를 쓴다. 등급 기준은 `codex-security/plugins/codex-security/skills/security-scan/security-scan.html`의 감사 판단 패널에 있다.

| 판단 | 정책 |
| --- | --- |
| `ignore`로 두는 경우 | 반증된 finding, 의미 있는 보안 영향이 없는 버그, 자기에게만 영향이 가는 경우, 비현실적인 전제. 권한이 필요한 공격자만 쓸 수 있는 경우도 권한 상승 차이가 쟁점이 아니면 `ignore`다.[](source:sp-rep) |
| 낮다고 버리지 않는 경우 | 실제로 보고할 finding은 영향이나 가능성이 낮다는 이유만으로 버리지 않고 낮은 심각도를 준다.[](source:sp-rep) |
| 내부 노출 | 비공개나 내부 노출만으로는 인증·신뢰 경계 실패를 억제하지 않는다. 배포나 ingress 근거가 없으면 확신도를 낮출 뿐 finding을 깨지 않는다.[](source:sp-rep) |
| 가능성 가중 | `remote`는 보통 높음, `local_network`는 보통 중간, `localhost`는 보통 낮음이다. `none`은 노출로 가능성을 올리지 않는다.[](source:sp-like) |

심각도와 priority는 다음처럼 대응한다. ignore된 finding은 priority가 없다.[](source:sp-prio)

@facts id=priority-map
| critical | `P0` |
| high | `P1` |
| medium | `P2` |
| low | `P3` |

후보가 결과가 되는 규칙은 `final-report.md`가 순서대로 정한다.[](source:fr-map)

| 순서 | 기록된 결과 | 최종 결과 |
| --- | --- | --- |
| 1 | validation `reportable`이고 attack-path `reportable` | finding. 서로 다른 instance와 모든 관련 위치를 담는다.[](source:fr-map) |
| 2 | 어느 한 phase가 `deferred` | `needs_follow_up` surface와 증명 간극이 담긴 deferred 작업이다.[](source:fr-map) |
| 3 | validation `not_applicable` | `not_applicable` coverage다.[](source:fr-map) |
| 4 | validation `suppressed` 또는 attack-path `ignore` | `rejected` coverage다.[](source:fr-map) |

필수 phase 기록이 빠진 후보는 가진 근거와 함께 미해결로 남는다. 다른 reconciliation pass를 더하거나 phase receipt를 복제하지 않는다.[](source:fr-map)

## 무엇을 강제하고 언제 멈추나? {#rules}

| 조건 | 에이전트의 행동 |
| --- | --- |
| 검토 대상 | 변경된 모든 텍스트 파일을 파일명, 확장자, 디렉터리와 상관없이 본다. 삭제 파일은 baseline revision에서 확인한다.[](source:d-inv)[](source:d-intro) |
| ignore된 변경 | tracked 변경은 ignore되어 있어도 범위 안이다. local patch는 ignore되지 않은 untracked 파일도 포함한다.[](source:d-inv) |
| 보안 관련성 | 파일 종류가 아니라 동작과 도달 가능성으로 판단한다. build, deployment, CI 쓰임도 포함한다.[](source:d-inv) |
| 후보 발견 | 도달 가능한 공격자 입력이나 권한 있는 작업을 통제를 거쳐 sink까지 따라간다. 안전한 sibling 구현은 후보 경로가 안전하다는 증거가 아니다. 위험한 API나 빠진 검사는 단서일 뿐 finding이 아니다.[](source:fd-eval) |
| 증명이 모자랄 때 | 재현 없이도 그럴듯한 후보는 증명 간극을 적어 검증으로 보낸다. 근거를 지어내거나 재현이 안 된다고 버리지 않는다.[](source:fd-eval) |
| 미완 검토 | 변경 파일과 후보를 모두 reviewed, resolved, 명시적 unfinished로 설명한다. 불완전한 검토를 "no findings" 주장으로 바꾸지 않는다.[](source:d-end) |
| 구조화 결과의 저장 | inventory, 후보, 처분, 공격 경로, draft, 완료는 각자의 기존 도구에 둔다. 보조 파일은 `save_codex_security_artifact`로만 쓰고 shell redirection이나 `apply_patch`로 쓰지 않는다. `report.md`는 이 도구로 만들지 않는다.[](source:as-own)[](source:as-supp) |
| 결과 응답 | 생성된 `report.md`를 첫 결과로 링크한다. 완료 뒤 `usage.totalTokens` 등 측정된 사용량을 보고하고, `usage.completion.finalized`가 `false`면 총량을 host에 맡긴다. 확정 finding마다 `::code-comment` 한 줄을 낸다.[](source:fr-resp)[](source:fr-code) |
| 결과 문서 | 상세 write-up과 hardening plan은 사용자가 요청할 때만 만드는 선택 산출물이다. scan 완료의 전제가 아니다.[](source:d-5)[](source:fr-opt) |
| 제출 거부 | 입력 검증 실패(`-32602`, `isError: true`)는 draft를 쓰지 않는다. 같은 draft에서 거부된 필드만 고쳐 다시 제출하고 같은 요청을 반복하지 않는다.[](source:fr-err) |
| 완료 주장 | 봉인이 성공하고 `report.md`가 있기 전에는 완료를 주장하지 않는다.[](source:fr-own) |
| 보고서 | `report.md`는 host가 canonical JSON에서 만든다. 에이전트가 쓰거나 고치지 않는다.[](source:fr-top) |
| 중단된 scan | 멈춘 scan에서 finding이 없는 것은 결론이 아니다. `completed`만 완료 결론을 뒷받침한다.[](source:sc-status) |

@callout level=open-question title="원문끼리 충돌하거나 우선순위가 없는 곳"
| 후보가 없을 때 validation을 부르는지: diff scan은 "If candidates exist, run `$validation` once"라고 하고, validation은 빈 집합에도 `validations: []`를 제출하라고 한다. 어느 쪽이 우선하는지 원문에 명시 없음이다.[](source:d-4)[](source:val-25) |
| 접근 안내: diff 스킬 SKILL.md는 `access-advisory.md`를 언급하지 않지만 `scan-runtime.md`는 diff scan이 읽으라고 한다. 시작 도구는 새로 만든 Standard scan의 결과에만 안내를 붙이고 diff scan 결과에는 붙이지 않는다. 안내는 scan을 막지 않는다.[](source:d-runtime)[](source:sr-adv)[](source:srv-adv)[](source:adv) |

판정 · 네 단계 스킬이 diff scan의 내부 위임 대상이다.

@list id=delegation-evidence
| `threat-model` 본문은 Standard scan과 Deep worker가 이 단계 스킬을 호출하지 않는다고 적는다.[](source:tm-8) |
| 세 scan 스킬 중 단계 스킬 이름을 SKILL.md에 적은 것은 이 스킬뿐이다.[](source:d-1)[](source:d-4) |
| 단계 스킬의 description은 PR, commit, branch, patch, repository scan 전체의 주 호출 경로로 쓰지 말라고 하고, 이 스킬이 단계마다 이름을 불러 쓴다.[](source:tm-3)[](source:val-3)[](source:d-1) |

## 다른 스킬과 어디에서 이어지나? {#position}

@workflow id=position-flow title="security-diff-scan 앞뒤의 스킬"
| pick | 사용자와 host의 스킬 선택 | external | source:front |
| pol | define-security-policy | backend | source:sp-8 |
| cur | security-diff-scan | backend | source:front |
| inner | 단계 스킬 4개 | backend | source:d-1 |
| track | track-findings | backend | source:track-8 |
| vis | threat-model-visualize | backend | source:vis-10 |
| tri | triage-finding | backend | source:tf-12 |
| pick > cur | 변경 범위 | emphasis |
| pol > cur | 공유 SECURITY.md | dashed |
| cur > inner | 내부 위임 | emphasis |
| inner > cur | 결과 반환 | dashed |
| cur > track | 요청 시 | dashed |
| cur > vis | 요청 시 | dashed |
| cur > tri | 파일을 줄 때 | dashed |

@steps id=position-steps
| here | security-diff-scan | 이 페이지의 스킬이다. 앞에서 사용자와 host가 변경 범위로 이 스킬을 고른다. 안에서 단계 스킬 네 개를 순서대로 부르고 돌려받는다. 뒤의 스킬은 자동이 아니라 사용자가 요청할 때 따로 부른다. | position-flow | cur |

| 관계 | 받는 것 · 넘기는 것 · 조건 |
| --- | --- |
| R01 · 넘김 | 변경 범위는 이 스킬로 온다. 스킬 이름은 적지 않고 "the diff skill"로 지목한다. 벤더 안내문도 diff 스킬을 PR, commit, branch, local edits용으로 나눈다.[](source:sc-front)[](source:readme) |
| R03 · 넘김 | deep 스킬은 변경 범위에 `security-diff-scan`을 쓰라고 이름으로 정한다. 이어 실행하는 scan의 저장된 모드가 diff면 대응하는 scan 스킬로 계속한다.[](source:deep-desc)[](source:deep-10) |
| R06~R09 · 내부 위임 | `$threat-model`, `$finding-discovery`, `$validation`, `$attack-path-analysis`를 위 순서로 한 번씩 부르고 돌아온다. 위협 모델, 후보 전체, 처분 전체, 공격 경로 결정을 넘긴다. 위 흐름 패널의 도구 계약이 조건이다.[](source:d-1)[](source:d-3)[](source:d-4) |
| R19·R20 · 참고 | 상세 write-up과 hardening plan은 요청된 선택 산출물이다. 스킬 이름은 적지 않는다.[](source:d-5)[](source:vw-3)[](source:ph-3)[](source:fr-opt) |
| R25 · 산출물 호환 | 완료 시 봉인되는 `scan-manifest.json`과 `findings.json`을 track-findings가 읽는다. 봉인된 scan 하나만 받고 사용자가 요청할 때 부른다. 계약의 mode 표가 `diff`, `commit`, `branch_diff`, `working_tree`를 같은 계약으로 나열한다.[](source:d-6)[](source:track-8)[](source:track-24)[](source:sc-modes) |
| R47 · 공유 상태 | diff scan은 관련 `SECURITY.md` 지침을 적용한다. define-security-policy가 쓴 정책을 resolver가 root에서 leaf 순서로 합치고 가까운 정책이 우선한다. 쓰기와 읽기의 순서는 원문에 명시 없음이다.[](source:d-runtime)[](source:sp-8)[](source:sg) |
| R71 · 산출물 호환 | diff scan도 위협 모델을 `scan.threatModel`로 저장하고 host가 `threatmodel.md`를 만든다. visualize는 "last scan of X"의 기존 위협 모델을 읽는다.[](source:d-1)[](source:tmdoc)[](source:as-tm)[](source:vis-10) |
| R75 · 산출물 호환 | 사용자가 유효한 `codex-security.findings` 파일을 주면 triage-finding이 입력으로 쓴다. 봉인된 `findings.json`의 `documentType`이 그 값이다. 자동 연결은 없다.[](source:tf-12)[](source:fd-schema) |

전체 흐름은 묶음 페이지 `codex-security/_group-scan-vulnerabilities`(색인 기준 `_group-scan-vulnerabilities/scan-vulnerabilities.html`)에 있다.

## 어디까지 읽고 확인했나? {#audit}

읽은 텍스트 파일은 47개(전부 읽음 35개, 구조·표본만 확인 12개), 합계 378,390B다. 목록은 같은 폴더의 `files.md`에 있다. 이 페이지 하단의 출처는 본문이 직접 인용한 줄 범위만 담는다.

| 조사 구분 | 확인 범위 |
| --- | --- |
| 스킬 폴더 | `SKILL.md`(5,405B)와 `agents/openai.yaml`(284B)을 끝까지 읽었다. |
| 필수 참조 문서 | 플러그인 루트 `references/` 9개를 끝까지 읽었다. `artifact-storage`, `scan-runtime`, `access-advisory`, `investigation-time-budget`, `final-report`, `scan-artifacts`, `scan-contract`, `security-guidance`, `finding-detail-fields`이다. |
| 내부 위임 단계 스킬 | `threat-model`, `finding-discovery`, `validation`(+`validation-guidance.md`), `attack-path-analysis`(+`severity-policy.md`, `attack-path-facts.md`)의 `SKILL.md`와 references를 끝까지 읽었다. |
| 도구 계약 | `artifact-inventory.ts`, `artifact-discovery.ts`, `artifact-candidate-ledger.ts`, `threat-model-document.ts`, `compact-artifact-tools.ts`를 끝까지 읽었다. schema는 `candidate-validations`, `review-items`, `discovery-candidates`를 끝까지, `candidate-attack-paths`와 `discovery-candidate` 정의는 본문 구간을 읽었다. |
| 구조·표본만 확인(전부 읽지 않음) | `schemas/tools/scan-draft.schema.json`(28,295B)은 최상위 키, `scanDraftInput` 필수 키, `complete` 설명만 봤다. `mcp-app/server.ts`(84,254B)는 시작·context·progress·완료·실패 도구와 입력 검사 구간만 읽었다. `workbench_progress.py`는 255~280줄만 읽었다. |
| 형제 스킬 | `security-scan`과 `deep-security-scan`의 `SKILL.md`를 끝까지 읽었다. |
| 후속 스킬 부분 읽음 | `track-findings`, `vulnerability-writeup`, `propose-security-hardening`, `threat-model-visualize`, `triage-finding`, `define-security-policy` 6개는 관련 줄만 읽었다. |
| 제외 | `*.KO.md` 번역본은 열지 않았다. 바이너리는 읽지 않았다. 외부 URL은 열지 않았다. 코드는 읽기만 하고 실행하지 않았다. |

원문의 활성화 안내, 시작 인자, 한 번만 호출하는 조건, 후보가 없을 때의 분기, 승인·취소·실패 조건, phase 6단계, 처분 4종, 공격 경로 결정 3종, priority 대응 4개, 필수 필드 8개를 모두 대조했다. 시간 allowance 템플릿의 분 단위는 사용자가 요청한 값이고 원문에 정해진 수치는 없다.[](source:d-time)

@callout level=open-question title="확인하지 못한 것"
| 이 스킬이 부르는 MCP 도구는 소스(`mcp-app/`)로 계약을 읽었다. 실제 실행 번들(`mcp/server.mjs`)은 저장소에 없어 소스와 같은지는 확인하지 못했다. `.mcp.json`은 이 서버의 `startup_timeout_sec` 120, `tool_timeout_sec` 349200(=97시간)을 선언한다.[](source:mcp) |
| `scan-draft.schema.json`의 finding 필드 전체와 `finalize_scan_contract.py`의 거부 규칙은 읽지 않았다. draft가 어떤 선택 필드를 거부하는지는 `final-report.md`와 `finding-detail-fields.md`의 서술까지만 확인했다.[](source:fdf)[](source:fr-err) |
| 단계 스킬은 `$threat-model` 등을 "한 번" 실행하라고 하지만, 같은 scan 안에서 다시 부르면 도구가 거부하는지는 후보 기록(replace)과 검증·공격 경로 제출(전체 교체) 외에는 확인하지 못했다.[](source:led-val)[](source:disc-rec) |

분석 중 원본은 수정하지 않았다. 이 폴더에 분석 초안과 HTML만 썼고 어떤 도구나 명령도 실행하지 않았다.
