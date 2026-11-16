# scan-vulnerabilities 읽은 파일 목록

분석 커밋 cd5035b 기준이다. 본문에서 인용하지 않은 파일도 읽었으면 포함했다.

- 읽은 텍스트 파일: 61개(전부 읽음 25개 99,000B, 구조·표본만 확인 36개 422,531B), 합계 521,531B.
- 바이너리는 읽지 않았다. 번역본(`*.KO.md`)은 열지 않았다. 외부 URL은 열지 않았다. `scripts/`, `mcp-app/`의 코드는 읽기만 하고 실행하지 않았다.
- `mcp/server.mjs`와 `mcp/helpers.mjs`(빌드 번들)는 저장소에 커밋돼 있지 않아 읽지 않았다.

| # | 경로 | 바이트 | 읽은 정도 | 읽은 범위 | 역할 |
|---|---|---|---|---|---|
| 1 | `codex-security/plugins/codex-security/skills/security-scan/SKILL.md` | 2,972 | 전부 | 전체 | 선택지 스킬 본문 |
| 2 | `codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md` | 5,405 | 전부 | 전체 | 선택지 스킬 본문 |
| 3 | `codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md` | 3,127 | 전부 | 전체 | 선택지 스킬 본문 |
| 4 | `codex-security/plugins/codex-security/skills/threat-model/SKILL.md` | 2,986 | 전부 | 전체 | 단계 스킬 본문 |
| 5 | `codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md` | 5,076 | 전부 | 전체 | 단계 스킬 본문 |
| 6 | `codex-security/plugins/codex-security/skills/validation/SKILL.md` | 4,619 | 전부 | 전체 | 단계 스킬 본문 |
| 7 | `codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md` | 5,355 | 전부 | 전체 | 단계 스킬 본문 |
| 8 | `codex-security/plugins/codex-security/skills/README.md` | 3,752 | 전부 | 전체 | 벤더 스킬 선택 안내 |
| 9 | `codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md` | 2,871 | 전부 | 전체 | scan 결과 저장과 완료 |
| 10 | `codex-security/plugins/codex-security/skills/security-scan/references/managed-scan.md` | 1,356 | 전부 | 전체 | managed Standard scan 시작·재개·진행 |
| 11 | `codex-security/plugins/codex-security/skills/security-scan/references/desktop-scan.md` | 580 | 전부 | 전체 | desktop 결과 handoff |
| 12 | `codex-security/plugins/codex-security/skills/security-scan/references/scoped-paths.md` | 2,359 | 전부 | 전체 | 지정 경로 inventory |
| 13 | `codex-security/plugins/codex-security/skills/security-scan/references/sdk-files.md` | 2,192 | 전부 | 전체 | SDK scan 파일 handoff |
| 14 | `codex-security/plugins/codex-security/references/core-scan.md` | 7,479 | 전부 | 전체 | Standard·Deep 공통 감사 절차 |
| 15 | `codex-security/plugins/codex-security/references/baseline-auditor.md` | 2,839 | 전부 | 전체 | 독립 baseline 감사 지시문 |
| 16 | `codex-security/plugins/codex-security/references/focused-investigator.md` | 2,548 | 전부 | 전체 | 집중 조사 지시문 |
| 17 | `codex-security/plugins/codex-security/references/validate-scan-findings.md` | 1,131 | 전부 | 전체 | 후보 검증 지시문 |
| 18 | `codex-security/plugins/codex-security/references/scan-runtime.md` | 1,558 | 전부 | 전체 | worker 위임과 access advisory |
| 19 | `codex-security/plugins/codex-security/references/scan-artifacts.md` | 11,701 | 전부 | 전체 | scan 경로 규약 |
| 20 | `codex-security/plugins/codex-security/references/artifact-storage.md` | 7,947 | 전부 | 전체 | artifact 저장 정책 |
| 21 | `codex-security/plugins/codex-security/references/final-report.md` | 12,135 | 전부 | 전체 | 최종 draft와 완료 계약 |
| 22 | `codex-security/plugins/codex-security/references/investigation-time-budget.md` | 1,749 | 전부 | 전체 | 조사 시간 권고 |
| 23 | `codex-security/plugins/codex-security/references/access-advisory.md` | 1,373 | 전부 | 전체 | Daybreak 접근 안내 |
| 24 | `codex-security/plugins/codex-security/references/scan-prologue.md` | 5,747 | 전부 | 전체 | Deep scan 공통 전제 |
| 25 | `codex-security/plugins/codex-security/scripts/deep_scan_defaults.json` | 143 | 전부 | 전체 | Deep 번들 기본값 |
| 26 | `codex-security/plugins/codex-security/skills/security-scan/references/scan-artifacts-and-ledger.md` | 7,021 | 표본 | 1~3줄(standalone·legacy diff 전용 문서의 사용 범위만) | standalone diff worklist |
| 27 | `codex-security/plugins/codex-security/references/scan-contract.md` | 16,529 | 표본 | 1~45, 120~135, 171~175줄 | 봉인 계약(`scan.status`, `scan.mode`, `scan.threatModel`) |
| 28 | `codex-security/plugins/codex-security/references/security-guidance.md` | 2,830 | 표본 | 30~37줄 | SECURITY.md chain 해석 |
| 29 | `codex-security/plugins/codex-security/references/threat-model.md` | 7,751 | 표본 | 38~44줄 | 위협 모델 저장 계약 |
| 30 | `codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md` | 4,408 | 표본 | 1~30줄(줄당 500자까지) | validation의 근거 선택 |
| 31 | `codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md` | 2,644 | 표본 | 1~35줄(줄당 400자까지) | 심각도·reportability 정책 |
| 32 | `codex-security/plugins/codex-security/mcp-app/server.ts` | 84,254 | 표본 | 100~125, 338~350, 926~962줄 | diffTarget schema, phase enum, Deep 시작 검사 |
| 33 | `codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts` | 15,421 | 표본 | 78~170줄 | compact 도구 등록 |
| 34 | `codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts` | 6,121 | 표본 | 23~77, 117~141, 168~187줄 | 검증·공격 경로 기록 |
| 35 | `codex-security/plugins/codex-security/mcp-app/src/artifact-inventory.ts` | 5,370 | 표본 | 29~118줄 | diff 변경 파일 inventory |
| 36 | `codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts` | 6,305 | 표본 | 61~100, 170~193줄 | 후보 기록과 목록 |
| 37 | `codex-security/plugins/codex-security/mcp-app/src/threat-model-document.ts` | 2,657 | 표본 | 33~70줄 | `threatmodel.md` 생성 |
| 38 | `codex-security/plugins/codex-security/mcp-app/src/threat-model-render.ts` | 5,406 | 표본 | 140~168줄 | `Saved Model Context` footer |
| 39 | `codex-security/plugins/codex-security/mcp-app/src/artifact-storage.ts` | 8,872 | 표본 | 150~172줄 | 보조 파일 쓰기 허용 경로 |
| 40 | `codex-security/plugins/codex-security/mcp-app/src/helpers/normalize-candidates.ts` | 18,523 | 표본 | 341~365, 389~398줄 | 후보 병합과 `candidate_id` |
| 41 | `codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts` | 40,348 | 표본 | 575~587, 800~810, 839~895줄 | Deep 반복·중단·이전 finding 전달 |
| 42 | `codex-security/plugins/codex-security/mcp-app/src/deep-scan/executor.ts` | 48,414 | 표본 | 480~486줄 | Deep worker prompt 덧붙임 |
| 43 | `codex-security/plugins/codex-security/mcp-app/src/deep-scan/project-config.schema.json` | 8,208 | 표본 | 20~30줄 | `max_time_minutes` |
| 44 | `codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md` | 2,215 | 표본 | 5~10줄 | Deep worker prompt 템플릿 |
| 45 | `codex-security/plugins/codex-security/scripts/deep_scan_config.py` | 6,510 | 표본 | 73~109줄 | Deep 설정 우선순위(읽기만, 실행 안 함) |
| 46 | `codex-security/plugins/codex-security/scripts/workbench_constants.py` | 3,177 | 표본 | `PHASES` 정의 1줄 | scan phase 값 |
| 47 | `codex-security/plugins/codex-security/scripts/workbench_progress.py` | 16,640 | 표본 | 262~274줄과 `PHASES` 사용처 검색 | 이전 phase 거부 |
| 48 | `codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json` | 4,519 | 표본 | 13~40줄과 `enum`·`required` 검색 | validations 배열 |
| 49 | `codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json` | 6,810 | 표본 | 60~130, 150~200줄 | attack path 결정과 severity |
| 50 | `codex-security/plugins/codex-security/schemas/definitions/discovery-candidate.schema.json` | 4,203 | 표본 | 51~82줄 | 후보 입력 칸 6개 |
| 51 | `codex-security/plugins/codex-security/schemas/tools/review-items.schema.json` | 1,431 | 표본 | 28~29줄 | `limit` 범위 |
| 52 | `codex-security/plugins/codex-security/mcp-app/src/artifact-io.ts` | 10,767 | 표본 | 43~57줄 | artifact 읽기 실패 오류 |
| 53 | `codex-security/plugins/codex-security/.mcp.json` | 2,078 | 표본 | 1~30줄 | MCP 서버 선언(본문에서 인용하지 않음) |
| 54 | `codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md` | 5,571 | 표본 | 3, 42줄 | 다른 묶음 스킬, 관련 줄만 |
| 55 | `codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md` | 5,026 | 표본 | 3, 41~46줄 | 다른 묶음 스킬, 관련 줄만 |
| 56 | `codex-security/plugins/codex-security/skills/track-findings/SKILL.md` | 13,459 | 표본 | 8, 24줄 | 다른 묶음 스킬, 관련 줄만 |
| 57 | `codex-security/plugins/codex-security/skills/publish-findings/SKILL.md` | 11,118 | 표본 | 25줄 | 다른 묶음 스킬, 관련 줄만 |
| 58 | `codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md` | 4,447 | 표본 | 7~12줄 | 다른 묶음 스킬, 관련 줄만 |
| 59 | `codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md` | 19,102 | 표본 | 8~10, 72줄 | 다른 묶음 스킬, 관련 줄만 |
| 60 | `codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md` | 5,982 | 표본 | 8, 28줄 | 다른 묶음 스킬, 관련 줄만 |
| 61 | `codex-security/plugins/codex-security/skills/triage-finding/SKILL.md` | 8,394 | 표본 | 3, 10줄 | 다른 묶음 스킬, 관련 줄만 |
