# security-diff-scan 읽은 파일 목록

분석 커밋 cd5035b 기준이다. 본문에서 인용하지 않은 파일도 읽었으면 포함했다.

- 읽은 텍스트 파일: 47개(전부 읽음 35개, 구조·표본만 확인 12개), 합계 378,390B.
- 바이너리는 읽지 않았다. 번역본(`*.KO.md`)은 열지 않았다. 외부 URL은 열지 않았다. 어떤 코드도 실행하지 않았다.

| # | 경로 | 바이트 | 읽은 정도 | 읽은 범위 | 역할 |
|---|---|---|---|---|---|
| 1 | `codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md` | 5,405 | 전부 | 1~35줄 | 스킬 본문(원본) |
| 2 | `codex-security/plugins/codex-security/skills/security-diff-scan/agents/openai.yaml` | 284 | 전부 | 1~4줄 | UI 표시와 default_prompt |
| 3 | `codex-security/plugins/codex-security/references/artifact-storage.md` | 7,947 | 전부 | 1~56줄 | artifact 저장 정책 |
| 4 | `codex-security/plugins/codex-security/references/scan-runtime.md` | 1,558 | 전부 | 1~13줄 | Standard·diff scan 위임 환경 |
| 5 | `codex-security/plugins/codex-security/references/access-advisory.md` | 1,373 | 전부 | 1~11줄 | Daybreak 접근 안내 |
| 6 | `codex-security/plugins/codex-security/references/investigation-time-budget.md` | 1,749 | 전부 | 1~11줄 | 조사 시간 allowance 템플릿 |
| 7 | `codex-security/plugins/codex-security/references/final-report.md` | 12,135 | 전부 | 1~87줄 | 최종 draft와 완료 계약 |
| 8 | `codex-security/plugins/codex-security/references/scan-artifacts.md` | 11,701 | 전부 | 1~123줄 | scan 경로 규약과 compact diff 후보 ledger |
| 9 | `codex-security/plugins/codex-security/references/scan-contract.md` | 16,529 | 전부 | 1~192줄 | 봉인 계약 |
| 10 | `codex-security/plugins/codex-security/references/security-guidance.md` | 2,830 | 전부 | 1~36줄 | SECURITY.md 해석 규칙 |
| 11 | `codex-security/plugins/codex-security/references/finding-detail-fields.md` | 10,874 | 전부 | 1~176줄 | finding 상세 필드 작성 규칙 |
| 12 | `codex-security/plugins/codex-security/references/threat-model.md` | 7,751 | 전부 | 1~59줄 | 위협 모델 작성 지침(threat-model 단계 스킬이 읽음) |
| 13 | `codex-security/plugins/codex-security/skills/threat-model/SKILL.md` | 2,986 | 전부 | 1~27줄 | 내부 위임 단계 스킬 1 |
| 14 | `codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md` | 5,076 | 전부 | 1~45줄 | 내부 위임 단계 스킬 2 |
| 15 | `codex-security/plugins/codex-security/skills/security-scan/references/scan-artifacts-and-ledger.md` | 7,021 | 전부 | 1~81줄 | standalone·legacy diff 전용 worklist(compact diff는 쓰지 않음) |
| 16 | `codex-security/plugins/codex-security/skills/validation/SKILL.md` | 4,619 | 전부 | 1~49줄 | 내부 위임 단계 스킬 3 |
| 17 | `codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md` | 4,408 | 전부 | 1~37줄 | 검증 지침 |
| 18 | `codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md` | 5,355 | 전부 | 1~54줄 | 내부 위임 단계 스킬 4 |
| 19 | `codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md` | 2,644 | 전부 | 1~35줄 | 심각도와 reportability 정책 |
| 20 | `codex-security/plugins/codex-security/skills/attack-path-analysis/references/attack-path-facts.md` | 1,585 | 전부 | 1~14줄 | 공격 경로 사실 목록 |
| 21 | `codex-security/plugins/codex-security/references/default-severity-rubric.md` | 3,348 | 전부 | 1~33줄 | 기본 심각도 기준(severity-policy가 지목) |
| 22 | `codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json` | 4,519 | 전부 | 1~137줄 | 검증 기록 schema |
| 23 | `codex-security/plugins/codex-security/schemas/tools/review-items.schema.json` | 1,431 | 전부 | 1~44줄 | inventory 입출력 schema |
| 24 | `codex-security/plugins/codex-security/schemas/tools/discovery-candidates.schema.json` | 1,152 | 전부 | 1~34줄 | 후보 입출력 schema |
| 25 | `codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json` | 6,810 | 구조·표본만 확인(전부 읽지 않음) | 60~189줄과 최상위 정의 이름 | 공격 경로 기록 schema |
| 26 | `codex-security/plugins/codex-security/schemas/definitions/discovery-candidate.schema.json` | 4,203 | 구조·표본만 확인(전부 읽지 않음) | 1~120줄(약 125줄 중) | 후보 정의 |
| 27 | `codex-security/plugins/codex-security/schemas/tools/scan-draft.schema.json` | 28,295 | 구조·표본만 확인(전부 읽지 않음) | 최상위 키, scanDraftInput 필수 키, complete 설명(720~750줄) | draft 입력 schema |
| 28 | `codex-security/plugins/codex-security/schemas/findings.schema.json` | 10,591 | 구조·표본만 확인(전부 읽지 않음) | 7줄(documentType) | findings 문서 schema |
| 29 | `codex-security/plugins/codex-security/mcp-app/server.ts` | 84,254 | 구조·표본만 확인(전부 읽지 않음) | 95~200, 334~348, 540~700, 1340~1360, 1455~1470, 1510~1645, 1993~1999, 2040~2130, 2260~2300줄 | MCP 서버의 prompt-only scan 시작·context·progress·완료·실패 도구 |
| 30 | `codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts` | 15,421 | 전부 | 1~384줄 | MCP 도구 등록 |
| 31 | `codex-security/plugins/codex-security/mcp-app/src/artifact-inventory.ts` | 5,370 | 전부 | 1~168줄 | 변경 파일 inventory 구현 |
| 32 | `codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts` | 6,305 | 전부 | 1~193줄 | 후보 기록 구현 |
| 33 | `codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts` | 6,121 | 전부 | 1~199줄 | 검증·공격 경로 기록 구현 |
| 34 | `codex-security/plugins/codex-security/mcp-app/src/threat-model-document.ts` | 2,657 | 전부 | 1~75줄 | threatmodel.md 생성 |
| 35 | `codex-security/plugins/codex-security/scripts/workbench_progress.py` | 16,640 | 구조·표본만 확인(전부 읽지 않음) | 255~280줄 | phase 되돌림 거부 |
| 36 | `codex-security/plugins/codex-security/.mcp.json` | 2,078 | 전부 | 1~69줄 | MCP 서버 선언과 시간 제한 |
| 37 | `codex-security/plugins/codex-security/.codex-plugin/plugin.json` | 1,682 | 전부 | 1~48줄 | 플러그인 선언 |
| 38 | `codex-security/plugins/codex-security/skills/README.md` | 3,752 | 전부 | 1~41줄 | 벤더의 스킬 선택 안내 |
| 39 | `codex-security/plugins/codex-security/skills/security-scan/SKILL.md` | 2,972 | 전부 | 1~21줄 | 형제 스킬(description 확인용) |
| 40 | `codex-security/plugins/codex-security/skills/security-scan/agents/openai.yaml` | 245 | 전부 | 1~4줄 | 형제 스킬 UI 표시 |
| 41 | `codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md` | 3,127 | 전부 | 1~14줄 | 형제 스킬(description·분기 확인용) |
| 42 | `codex-security/plugins/codex-security/skills/track-findings/SKILL.md` | 13,459 | 구조·표본만 확인(전부 읽지 않음) | 3, 8, 24줄 | 후속 스킬 입력 조건 |
| 43 | `codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md` | 19,102 | 구조·표본만 확인(전부 읽지 않음) | 3, 8, 10줄 | 후속 스킬 입력 조건 |
| 44 | `codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md` | 4,447 | 구조·표본만 확인(전부 읽지 않음) | 7~12줄 | 후속 스킬 findings 입력 조건 |
| 45 | `codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md` | 5,571 | 구조·표본만 확인(전부 읽지 않음) | 3, 10, 42줄 | 후속 스킬 write-up 경로 |
| 46 | `codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md` | 5,026 | 구조·표본만 확인(전부 읽지 않음) | 3, 41~42줄 | 후속 스킬 hardening 경로 |
| 47 | `codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md` | 5,982 | 구조·표본만 확인(전부 읽지 않음) | 3, 8, 28줄 | SECURITY.md 작성 스킬 |
