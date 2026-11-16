# security-scan 읽은 파일 목록

분석 커밋 cd5035b 기준이다. 본문에서 인용하지 않은 파일도 읽었으면 포함했다.

- 읽은 텍스트 파일: 53개(전부 읽음 38개, 구조·표본만 확인 15개), 합계 382,903B.
- 바이너리는 읽지 않았다. 번역본(`*.KO.md`)은 열지 않았다. 외부 URL은 열지 않았다. 어떤 코드도 실행하지 않았다.

| # | 경로 | 바이트 | 읽은 정도 | 읽은 범위 | 역할 |
|---|---|---|---|---|---|
| 1 | `codex-security/plugins/codex-security/skills/security-scan/SKILL.md` | 2,972 | 전부 | 1~21줄 | 스킬 본문(원본) |
| 2 | `codex-security/plugins/codex-security/skills/security-scan/agents/openai.yaml` | 245 | 전부 | 1~4줄 | UI 표시와 default_prompt |
| 3 | `codex-security/plugins/codex-security/skills/security-scan/references/desktop-scan.md` | 580 | 전부 | 1~5줄 | Codex desktop 결과 출력 |
| 4 | `codex-security/plugins/codex-security/skills/security-scan/references/managed-scan.md` | 1,356 | 전부 | 1~11줄 | managed Standard scan 시작·재개·진행 |
| 5 | `codex-security/plugins/codex-security/skills/security-scan/references/scan-artifacts-and-ledger.md` | 7,021 | 전부 | 1~81줄 | standalone·legacy diff 전용 worklist(이 스킬은 쓰지 않음) |
| 6 | `codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md` | 2,871 | 전부 | 1~15줄 | scan 결과 저장과 완료 |
| 7 | `codex-security/plugins/codex-security/skills/security-scan/references/scoped-paths.md` | 2,359 | 전부 | 1~23줄 | 지정 경로 inventory |
| 8 | `codex-security/plugins/codex-security/skills/security-scan/references/sdk-files.md` | 2,192 | 전부 | 1~24줄 | SDK scan 파일 handoff |
| 9 | `codex-security/plugins/codex-security/references/core-scan.md` | 7,479 | 전부 | 1~36줄 | 공통 감사 절차 8단계 |
| 10 | `codex-security/plugins/codex-security/references/baseline-auditor.md` | 2,839 | 전부 | 1~18줄 | 독립 baseline 감사 지시문 |
| 11 | `codex-security/plugins/codex-security/references/focused-investigator.md` | 2,548 | 전부 | 1~13줄 | 집중 조사 지시문 |
| 12 | `codex-security/plugins/codex-security/references/validate-scan-findings.md` | 1,131 | 전부 | 1~3줄 | 후보 검증 지시문 |
| 13 | `codex-security/plugins/codex-security/references/threat-model.md` | 7,751 | 전부 | 1~59줄 | 위협 모델 작성 지침(core-scan 3단계가 읽음) |
| 14 | `codex-security/plugins/codex-security/references/default-severity-rubric.md` | 3,348 | 전부 | 1~33줄 | 기본 심각도 기준 |
| 15 | `codex-security/plugins/codex-security/references/final-report.md` | 12,135 | 전부 | 1~87줄 | 최종 draft와 완료 계약 |
| 16 | `codex-security/plugins/codex-security/references/finding-detail-fields.md` | 10,874 | 전부 | 1~176줄 | finding 상세 필드 작성 규칙 |
| 17 | `codex-security/plugins/codex-security/references/scan-contract.md` | 16,529 | 전부 | 1~192줄 | 봉인 계약 |
| 18 | `codex-security/plugins/codex-security/references/scan-artifacts.md` | 11,701 | 전부 | 1~123줄 | scan 경로 규약 |
| 19 | `codex-security/plugins/codex-security/references/artifact-storage.md` | 7,947 | 전부 | 1~56줄 | artifact 저장 정책 |
| 20 | `codex-security/plugins/codex-security/references/security-guidance.md` | 2,830 | 전부 | 1~36줄 | SECURITY.md 해석 규칙 |
| 21 | `codex-security/plugins/codex-security/references/access-advisory.md` | 1,373 | 전부 | 1~11줄 | Daybreak 접근 안내 |
| 22 | `codex-security/plugins/codex-security/references/investigation-time-budget.md` | 1,749 | 전부 | 1~11줄 | 조사 시간 allowance 템플릿 |
| 23 | `codex-security/plugins/codex-security/references/scan-prologue.md` | 5,747 | 전부 | 1~37줄 | Deep 시작 문서(비교용으로 읽음) |
| 24 | `codex-security/plugins/codex-security/references/scan-runtime.md` | 1,558 | 전부 | 1~13줄 | Standard·diff scan 위임 환경(비교용으로 읽음) |
| 25 | `codex-security/plugins/codex-security/skills/README.md` | 3,752 | 전부 | 1~41줄 | 벤더의 스킬 선택 안내 |
| 26 | `codex-security/plugins/codex-security/.mcp.json` | 2,078 | 전부 | 1~69줄 | MCP 서버 선언과 시간 제한 |
| 27 | `codex-security/plugins/codex-security/.codex-plugin/plugin.json` | 1,682 | 전부 | 1~48줄 | 플러그인 선언 |
| 28 | `codex-security/plugins/codex-security/schemas/tools/scan-draft.schema.json` | 28,295 | 구조·표본만 확인(전부 읽지 않음) | 최상위 키, scanDraftInput 필수 키, complete 설명(720~750줄) | draft 입력 schema |
| 29 | `codex-security/plugins/codex-security/examples/completed-scan/scan-manifest.json` | 1,227 | 구조·표본만 확인(전부 읽지 않음) | 앞 1,500B | 봉인된 scan 예시 |
| 30 | `codex-security/plugins/codex-security/examples/completed-scan/findings.json` | 2,678 | 구조·표본만 확인(전부 읽지 않음) | 최상위 키와 첫 finding의 키 | 봉인된 findings 예시 |
| 31 | `codex-security/plugins/codex-security/examples/completed-scan/report.md` | 2,910 | 구조·표본만 확인(전부 읽지 않음) | 앞 40줄 | 생성 보고서 예시 |
| 32 | `codex-security/plugins/codex-security/schemas/findings.schema.json` | 10,591 | 구조·표본만 확인(전부 읽지 않음) | 7줄(documentType) | findings 문서 schema |
| 33 | `codex-security/plugins/codex-security/mcp-app/server.ts` | 84,254 | 구조·표본만 확인(전부 읽지 않음) | 95~200, 334~348, 540~700, 790~860, 890~980, 1196~1215, 1340~1360, 1455~1470, 1510~1645, 1993~1999, 2040~2130, 2260~2300줄 | MCP 서버의 scan 시작·context·progress·완료·실패 도구 |
| 34 | `codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts` | 15,421 | 전부 | 1~384줄 | MCP 도구 등록(draft, 후보, 검증, 공격 경로) |
| 35 | `codex-security/plugins/codex-security/mcp-app/src/threat-model-document.ts` | 2,657 | 전부 | 1~75줄 | threatmodel.md 생성 |
| 36 | `codex-security/plugins/codex-security/scripts/launch_codex_security_mcp` | 4,646 | 구조·표본만 확인(전부 읽지 않음) | 1~80줄(141줄 중) | MCP 서버 launcher |
| 37 | `codex-security/plugins/codex-security/scripts/workbench_progress.py` | 16,640 | 구조·표본만 확인(전부 읽지 않음) | 255~280줄 | phase 되돌림 거부 |
| 38 | `codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md` | 2,215 | 전부 | 1~17줄 | Deep worker prompt 템플릿(core-scan 공유 확인) |
| 39 | `codex-security/plugins/codex-security/skills/threat-model/SKILL.md` | 2,986 | 전부 | 1~27줄 | 단계 스킬(호출 제한 확인용) |
| 40 | `codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md` | 5,076 | 전부 | 1~45줄 | 단계 스킬(호출 제한 확인용) |
| 41 | `codex-security/plugins/codex-security/skills/validation/SKILL.md` | 4,619 | 전부 | 1~49줄 | 단계 스킬(호출 제한 확인용) |
| 42 | `codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md` | 5,355 | 전부 | 1~54줄 | 단계 스킬(호출 제한 확인용) |
| 43 | `codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md` | 5,405 | 전부 | 1~35줄 | 형제 스킬(description·구조 확인용) |
| 44 | `codex-security/plugins/codex-security/skills/security-diff-scan/agents/openai.yaml` | 284 | 전부 | 1~4줄 | 형제 스킬 UI 표시 |
| 45 | `codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md` | 3,127 | 전부 | 1~14줄 | 형제 스킬(description·반복 방식 확인용) |
| 46 | `codex-security/plugins/codex-security/skills/deep-security-scan/agents/openai.yaml` | 192 | 전부 | 1~4줄 | 형제 스킬 UI 표시 |
| 47 | `codex-security/plugins/codex-security/skills/track-findings/SKILL.md` | 13,459 | 구조·표본만 확인(전부 읽지 않음) | 3, 8, 24줄 | 후속 스킬 입력 조건 |
| 48 | `codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md` | 19,102 | 구조·표본만 확인(전부 읽지 않음) | 3, 8, 10줄 | 후속 스킬 입력 조건 |
| 49 | `codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md` | 4,447 | 구조·표본만 확인(전부 읽지 않음) | 7~12줄 | 후속 스킬 findings 입력 조건 |
| 50 | `codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md` | 5,571 | 구조·표본만 확인(전부 읽지 않음) | 3, 10, 42줄 | 후속 스킬 write-up 경로 |
| 51 | `codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md` | 5,982 | 구조·표본만 확인(전부 읽지 않음) | 3, 8, 28줄 | SECURITY.md 작성 스킬 |
| 52 | `ecc/security-scan/SKILL.md` | 4,592 | 구조·표본만 확인(전부 읽지 않음) | 1~4줄과 SHA-256 | 동명 스킬 비교 |
| 53 | `codex-security/skills-lock.json` | 6,525 | 구조·표본만 확인(전부 읽지 않음) | 26~34, 74~90줄 | 설치 기록 |
