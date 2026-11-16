# deep-security-scan 읽은 파일 목록

분석 커밋 cd5035b 기준이다. 본문에서 인용하지 않은 파일도 읽었으면 포함했다.

- 읽은 텍스트 파일: 32개(전부 읽음 23개, 구조·표본만 확인 9개), 합계 371,535B.
- 바이너리는 읽지 않았다. 번역본(`*.KO.md`)은 열지 않았다. 외부 URL은 열지 않았다. 어떤 코드도 실행하지 않았다.

| # | 경로 | 바이트 | 읽은 정도 | 읽은 범위 | 역할 |
|---|---|---|---|---|---|
| 1 | `codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md` | 3,127 | 전부 | 1~14줄 | 스킬 본문(원본) |
| 2 | `codex-security/plugins/codex-security/skills/deep-security-scan/agents/openai.yaml` | 192 | 전부 | 1~4줄 | UI 표시와 default_prompt |
| 3 | `codex-security/plugins/codex-security/references/scan-prologue.md` | 5,747 | 전부 | 1~37줄 | Deep 시작 문서 |
| 4 | `codex-security/plugins/codex-security/references/access-advisory.md` | 1,373 | 전부 | 1~11줄 | Daybreak 접근 안내 |
| 5 | `codex-security/plugins/codex-security/references/final-report.md` | 12,135 | 전부 | 1~87줄 | 최종 draft와 완료 계약 |
| 6 | `codex-security/plugins/codex-security/references/artifact-storage.md` | 7,947 | 전부 | 1~56줄 | artifact 저장 정책 |
| 7 | `codex-security/plugins/codex-security/references/core-scan.md` | 7,479 | 전부 | 1~36줄 | 공통 감사 절차(worker가 직접 읽음) |
| 8 | `codex-security/plugins/codex-security/references/baseline-auditor.md` | 2,839 | 전부 | 1~18줄 | 독립 baseline 감사 지시문 |
| 9 | `codex-security/plugins/codex-security/references/focused-investigator.md` | 2,548 | 전부 | 1~13줄 | 집중 조사 지시문 |
| 10 | `codex-security/plugins/codex-security/references/scan-contract.md` | 16,529 | 전부 | 1~192줄 | 봉인 계약과 Deep scan mode |
| 11 | `codex-security/plugins/codex-security/references/scan-artifacts.md` | 11,701 | 전부 | 1~123줄 | scan 경로 규약과 Deep 병합 |
| 12 | `codex-security/plugins/codex-security/references/investigation-time-budget.md` | 1,749 | 전부 | 1~11줄 | 조사 시간 allowance 템플릿 |
| 13 | `codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md` | 2,215 | 전부 | 1~17줄 | Deep worker prompt 템플릿 |
| 14 | `codex-security/plugins/codex-security/mcp-app/src/deep-scan/templates.ts` | 1,768 | 전부 | 1~51줄 | prompt 렌더링(이전 finding 전달) |
| 15 | `codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts` | 40,348 | 구조·표본만 확인(전부 읽지 않음) | 54~60, 575~615, 736~925줄(약 1,000줄 중) | 코디네이터 반복·중단·마감 |
| 16 | `codex-security/plugins/codex-security/mcp-app/src/deep-scan/executor.ts` | 48,414 | 구조·표본만 확인(전부 읽지 않음) | 470~500줄 | worker 실행 입력 |
| 17 | `codex-security/plugins/codex-security/mcp-app/src/deep-scan/engine.ts` | 4,065 | 구조·표본만 확인(전부 읽지 않음) | 95~140줄 | 새 대상 검사 호출 |
| 18 | `codex-security/plugins/codex-security/mcp-app/src/deep-scan/project-config.schema.json` | 8,208 | 구조·표본만 확인(전부 읽지 않음) | 1~215줄 | 프로젝트 설정 schema |
| 19 | `codex-security/plugins/codex-security/mcp-app/src/deep-scan/permission-profile-preflight.ts` | 32,222 | 구조·표본만 확인(전부 읽지 않음) | 1~40줄 | worker permission profile 이름 |
| 20 | `codex-security/plugins/codex-security/mcp-app/server.ts` | 84,254 | 구조·표본만 확인(전부 읽지 않음) | 95~200, 334~348, 540~700, 790~860, 890~980, 1196~1215, 1340~1360, 1455~1470, 1510~1645, 1993~1999, 2040~2130, 2260~2300줄 | MCP 서버의 Deep 시작·setup·취소·실패 도구 |
| 21 | `codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts` | 15,421 | 전부 | 1~384줄 | worker용 peer note·draft 도구 |
| 22 | `codex-security/plugins/codex-security/scripts/deep_scan_defaults.json` | 143 | 전부 | 1~8줄 | 번들 기본값 |
| 23 | `codex-security/plugins/codex-security/scripts/deep_scan_config.py` | 6,510 | 구조·표본만 확인(전부 읽지 않음) | 1~140줄 | 설정 우선순위와 검증 |
| 24 | `codex-security/plugins/codex-security/scripts/check_deep_scan_target.py` | 3,538 | 전부 | 1~97줄 | 빈 대상 거부 |
| 25 | `codex-security/plugins/codex-security/tests/test_deep_security_scan_concurrency_guard.py` | 2,613 | 전부 | 1~70줄 | 다른 실행 중 Deep scan 집계 시험(읽기만 함) |
| 26 | `codex-security/plugins/codex-security/.mcp.json` | 2,078 | 전부 | 1~69줄 | MCP 서버 선언과 시간 제한 |
| 27 | `codex-security/plugins/codex-security/.codex-plugin/plugin.json` | 1,682 | 전부 | 1~48줄 | 플러그인 선언 |
| 28 | `codex-security/plugins/codex-security/skills/README.md` | 3,752 | 전부 | 1~41줄 | 벤더의 스킬 선택 안내 |
| 29 | `codex-security/plugins/codex-security/skills/security-scan/SKILL.md` | 2,972 | 전부 | 1~21줄 | 형제 스킬(description 확인용) |
| 30 | `codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md` | 5,405 | 전부 | 1~35줄 | 형제 스킬(description 확인용) |
| 31 | `codex-security/plugins/codex-security/skills/track-findings/SKILL.md` | 13,459 | 구조·표본만 확인(전부 읽지 않음) | 3, 8, 24줄 | 후속 스킬 입력 조건 |
| 32 | `codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md` | 19,102 | 구조·표본만 확인(전부 읽지 않음) | 3, 8, 10줄 | 후속 스킬 입력 조건 |
