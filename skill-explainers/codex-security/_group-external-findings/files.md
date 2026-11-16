# external-findings 읽은 파일 목록

분석 커밋 cd5035b 기준이다. 본문에서 인용하지 않은 파일도 읽었으면 포함했다.

- 읽은 텍스트 파일: 31개(전부 읽음 20개 96,108B, 일부만 읽음 11개 136,655B(파일 전체 크기 기준)), 합계 232,763B.
- 바이너리는 읽지 않았다. 번역본(`*.KO.md`)은 열지 않았다. 외부 URL은 열지 않았다. `scripts/`, `mcp-app/`의 코드는 읽기만 하고 실행하지 않았다.
- 분석 대상 폴더 `codex-security/`의 working tree는 분석 커밋과 같다(`git diff cd5035b -- codex-security`가 비어 있음).

| # | 경로 | 바이트 | 읽은 정도 | 읽은 범위 | 역할 |
|---|---|---|---|---|---|
| 1 | `codex-security/plugins/codex-security/skills/publish-findings/SKILL.md` | 11,118 | 전부 | 전체 | 스킬 본문 |
| 2 | `codex-security/plugins/codex-security/skills/publish-findings/agents/openai.yaml` | 284 | 전부 | 전체 | skill 메타데이터 |
| 3 | `codex-security/plugins/codex-security/skills/publish-findings/references/wiz-import.md` | 5,153 | 전부 | 전체 | Wiz 입력 규칙 |
| 4 | `codex-security/plugins/codex-security/skills/publish-findings/references/checkmarx-import.md` | 4,888 | 전부 | 전체 | Checkmarx 수집 규칙 |
| 5 | `codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py` | 17,126 | 전부 | 전체(실행하지 않음) | Checkmarx 수집 스크립트 |
| 6 | `codex-security/plugins/codex-security/skills/publish-findings/scripts/collector_paths.py` | 2,210 | 전부 | 전체(실행하지 않음) | 수집 스크립트의 경로 검사 |
| 7 | `codex-security/plugins/codex-security/skills/track-findings/SKILL.md` | 13,459 | 전부 | 전체 | 스킬 본문 |
| 8 | `codex-security/plugins/codex-security/skills/track-findings/agents/openai.yaml` | 279 | 전부 | 전체 | skill 메타데이터 |
| 9 | `codex-security/plugins/codex-security/skills/track-findings/references/jira.md` | 3,027 | 전부 | 전체 | Jira 규칙 |
| 10 | `codex-security/plugins/codex-security/skills/track-findings/references/github-security-advisories.md` | 3,420 | 전부 | 전체 | advisory 규칙 |
| 11 | `codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md` | 10,563 | 전부 | 전체 | 스킬 본문 |
| 12 | `codex-security/plugins/codex-security/skills/cloud-findings/agents/openai.yaml` | 295 | 전부 | 전체 | skill 메타데이터 |
| 13 | `codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md` | 2,548 | 전부 | 전체 | 스킬 본문 |
| 14 | `codex-security/plugins/codex-security/skills/resolve-dependency-alert/agents/openai.yaml` | 250 | 전부 | 전체 | skill 메타데이터 |
| 15 | `codex-security/plugins/codex-security/skills/fix-finding/SKILL.md` | 18,461 | 부분 | 38줄 주변 | R37의 받는 쪽 문장 |
| 16 | `codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md` | 5,355 | 부분 | 21줄 | R36의 받는 쪽 문장 |
| 17 | `codex-security/plugins/codex-security/skills/triage-finding/SKILL.md` | 8,394 | 부분 | 1~5줄과 18줄 | R40의 받는 쪽 문장 |
| 18 | `codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md` | 2,871 | 부분 | 8~16줄 | 봉인 주체 문장 |
| 19 | `codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md` | 5,405 | 부분 | 33줄 | R25의 완료 호출 문장 |
| 20 | `codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md` | 3,127 | 부분 | 14줄 | R26의 완료 처리 문장 |
| 21 | `codex-security/plugins/codex-security/references/scan-contract.md` | 16,529 | 부분 | 1~20, 28~45, 120~134줄 | 봉인 문서 구성, 종료 상태, scan mode |
| 22 | `codex-security/plugins/codex-security/schemas/scan-manifest.schema.json` | 7,815 | 부분 | 20~22줄 | status 허용 값 |
| 23 | `codex-security/plugins/codex-security/mcp-app/src/helpers/validate-tracking-source.ts` | 2,744 | 전부 | 전체 | tracking source helper |
| 24 | `codex-security/plugins/codex-security/mcp-app/src/server/finding-issue-tools.ts` | 3,683 | 전부 | 전체 | issue 이력 도구 |
| 25 | `codex-security/plugins/codex-security/scripts/workbench_publication.py` | 20,245 | 부분 | 170~300줄 | issue receipt 저장 |
| 26 | `codex-security/plugins/codex-security/mcp-app/helpers-main.ts` | 8,642 | 전부 | 전체 | helper 이름과 사용법 |
| 27 | `codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts` | 11,530 | 부분 | 1~70, 100~260줄 | 외부 finding 저장소 |
| 28 | `codex-security/plugins/codex-security/mcp-app/src/workbench/external-finding-publications.ts` | 3,624 | 전부 | 전체 | 게시 receipt 저장 |
| 29 | `codex-security/plugins/codex-security/mcp-app/src/sealed-contract.ts` | 36,923 | 부분 | 205~220줄 | tracking profile 검사 |
| 30 | `codex-security/plugins/codex-security/.app.json` | 717 | 전부 | 전체 | connector 선언 |
| 31 | `codex-security/plugins/codex-security/.mcp.json` | 2,078 | 전부 | 전체 | MCP 서버 선언 |
