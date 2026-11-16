# security-diff-scan 읽은 파일 목록

분석 커밋 243a902 기준이다. 본문에서 인용하지 않은 파일도 읽었으면 포함했다. 페이지(`security-diff-scan.html`)에는 인용한 파일만 `@source`로 선언했다.

- 읽은 텍스트 파일: 42개(전부 읽음 35개, 구조·표본만 확인 7개), 합계 381,610B.
- 바이너리와 번역본(`*.KO.md`)은 없거나 열지 않았다. 외부 URL은 열지 않았다. 스킬의 지시, MCP 도구, helper, 명령은 실행하지 않았다.
- 읽지 않은 것: `skills/validation/references/validation-guidance.md`가 가리키는 `references/static-finding-assessment.md`(필수 참조 목록에 없음), 상세 write-up과 hardening 스킬의 본문.

| # | 경로 | 바이트 | 읽은 정도 | 읽은 범위 | 역할 |
|---|---|---|---|---|---|
| 1 | `codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md` | 5,405 | 전부 | 1~35줄 | 스킬 본문(원본) |
| 2 | `codex-security/plugins/codex-security/skills/security-diff-scan/agents/openai.yaml` | 284 | 전부 | 1~4줄 | UI 표시와 default_prompt |
| 3 | `codex-security/plugins/codex-security/references/artifact-storage.md` | 7,947 | 전부 | 1~56줄 | artifact 저장 정책 |
| 4 | `codex-security/plugins/codex-security/references/scan-runtime.md` | 1,558 | 전부 | 1~13줄 | worker 위임과 Daybreak 안내 연결 |
| 5 | `codex-security/plugins/codex-security/references/access-advisory.md` | 1,373 | 전부 | 1~11줄 | Daybreak 접근 안내 |
| 6 | `codex-security/plugins/codex-security/references/investigation-time-budget.md` | 1,749 | 전부 | 1~11줄 | 조사 시간 allowance 템플릿 |
| 7 | `codex-security/plugins/codex-security/references/final-report.md` | 12,135 | 전부 | 1~87줄 | 최종 draft와 완료 계약 |
| 8 | `codex-security/plugins/codex-security/references/scan-artifacts.md` | 11,701 | 전부 | 1~123줄 | scan 경로 규약과 compact diff 후보 ledger |
| 9 | `codex-security/plugins/codex-security/references/scan-contract.md` | 16,529 | 전부 | 1~192줄 | 봉인 계약 |
| 10 | `codex-security/plugins/codex-security/references/security-guidance.md` | 2,830 | 전부 | 1~36줄 | SECURITY.md 해석 규칙 |
| 11 | `codex-security/plugins/codex-security/references/finding-detail-fields.md` | 10,874 | 전부 | 1~176줄 | finding 상세 필드 작성 규칙 |
| 12 | `codex-security/plugins/codex-security/references/threat-model.md` | 7,751 | 전부 | 1~59줄 | 위협 모델 작성 지침 |
| 13 | `codex-security/plugins/codex-security/references/default-severity-rubric.md` | 3,348 | 전부 | 1~33줄 | 기본 severity 기준 |
| 14 | `codex-security/plugins/codex-security/skills/threat-model/SKILL.md` | 2,986 | 전부 | 1~27줄 | 내부 위임 단계 스킬 1 |
| 15 | `codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md` | 5,076 | 전부 | 1~45줄 | 내부 위임 단계 스킬 2 |
| 16 | `codex-security/plugins/codex-security/skills/validation/SKILL.md` | 4,619 | 전부 | 1~49줄 | 내부 위임 단계 스킬 3 |
| 17 | `codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md` | 4,408 | 전부 | 1~37줄 | 검증 지침 |
| 18 | `codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md` | 5,355 | 전부 | 1~54줄 | 내부 위임 단계 스킬 4 |
| 19 | `codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md` | 2,644 | 전부 | 1~35줄 | 심각도와 reportability 정책 |
| 20 | `codex-security/plugins/codex-security/skills/attack-path-analysis/references/attack-path-facts.md` | 1,585 | 전부 | 1~14줄 | 공격 경로 사실 목록 |
| 21 | `codex-security/plugins/codex-security/skills/README.md` | 3,752 | 전부 | 1~41줄 | 벤더의 스킬 선택 안내 |
| 22 | `codex-security/plugins/codex-security/schemas/tools/discovery-candidates.schema.json` | 1,152 | 전부 | 1~34줄 | 후보 입출력 스키마 |
| 23 | `codex-security/plugins/codex-security/schemas/tools/review-items.schema.json` | 1,431 | 전부 | 1~44줄 | 변경 파일 목록 입출력 스키마 |
| 24 | `codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json` | 4,519 | 전부 | 1~137줄 | 검증 기록 스키마 |
| 25 | `codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json` | 6,810 | 전부 | 1~189줄 | 공격 경로 기록 스키마 |
| 26 | `codex-security/plugins/codex-security/schemas/definitions/discovery-candidate.schema.json` | 4,203 | 전부 | 1~124줄 | 후보 정의 |
| 27 | `codex-security/plugins/codex-security/schemas/tools/scan-draft.schema.json` | 28,295 | 전부 | 1~766줄 | draft 입력 스키마 |
| 28 | `codex-security/plugins/codex-security/schemas/findings.schema.json` | 10,591 | 전부 | 1~276줄 | findings 문서 스키마 |
| 29 | `codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts` | 15,421 | 전부 | 1~384줄 | MCP 도구 등록과 mode 검사 |
| 30 | `codex-security/plugins/codex-security/mcp-app/src/artifact-inventory.ts` | 5,370 | 전부 | 1~168줄 | 변경 파일 inventory 구현 |
| 31 | `codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts` | 6,305 | 전부 | 1~193줄 | 후보 기록 구현 |
| 32 | `codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts` | 6,121 | 전부 | 1~199줄 | 검증·공격 경로 기록 구현 |
| 33 | `codex-security/plugins/codex-security/mcp-app/src/threat-model-document.ts` | 2,657 | 전부 | 1~75줄 | threatmodel.md 생성 |
| 34 | `codex-security/plugins/codex-security/skills/security-scan/SKILL.md` | 2,972 | 전부 | 1~21줄 | 앞 스킬(description 확인용) |
| 35 | `codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md` | 3,127 | 전부 | 1~14줄 | 앞 스킬(description과 분기 확인용) |
| 36 | `codex-security/plugins/codex-security/mcp-app/src/helpers/normalize-candidates.ts` | 18,523 | 구조·표본만 확인(전부 읽지 않음) | 335~420줄(562줄 중) | 후보 병합과 ID 부여 |
| 37 | `codex-security/plugins/codex-security/mcp-app/src/artifact-io.ts` | 10,767 | 구조·표본만 확인(전부 읽지 않음) | 40~165줄(364줄 중) | artifact 읽기와 없는 파일 오류 |
| 38 | `codex-security/plugins/codex-security/mcp-app/server.ts` | 84,254 | 구조·표본만 확인(전부 읽지 않음) | 94~125, 336~350, 545~566, 638~680, 1348~1356, 1462~1466, 1516~1640, 2043~2080줄(2451줄 중) | prompt-only scan 시작, context, 진행, 완료, 실패 도구 |
| 39 | `codex-security/plugins/codex-security/scripts/workbench_progress.py` | 16,640 | 구조·표본만 확인(전부 읽지 않음) | 255~280줄 | phase 되돌림 거부 |
| 40 | `codex-security/plugins/codex-security/skills/track-findings/SKILL.md` | 13,459 | 구조·표본만 확인(전부 읽지 않음) | 3, 8, 10줄 | 뒤 스킬 입력 조건 |
| 41 | `codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md` | 19,102 | 구조·표본만 확인(전부 읽지 않음) | 3, 8, 10줄 | 뒤 스킬 입력 조건 |
| 42 | `codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md` | 5,982 | 구조·표본만 확인(전부 읽지 않음) | 3, 8, 10줄 | SECURITY.md 작성 스킬 |
