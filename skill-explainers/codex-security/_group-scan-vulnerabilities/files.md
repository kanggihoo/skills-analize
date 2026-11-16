# scan-vulnerabilities 읽은 파일 목록

분석 커밋 cd5035b 기준이다. 이 묶음 페이지를 쓰려고 원문을 다시 열어 읽은 파일만 담았다. 페이지의 `@source`와 같은 목록이다.

- 읽은 텍스트 파일: 42개(전부 읽음 15개 47,666B, 줄 범위만 읽음 27개 391,448B), 합계 439,114B. 바이트는 파일 전체 크기다.
- 바이너리는 읽지 않았다. 번역본(`*.KO.md`)은 이 컬렉션에 없다. 외부 URL은 열지 않았다. `scripts/`, `mcp-app/`의 코드는 읽기만 하고 실행하지 않았다.
- `mcp/server.mjs`와 `mcp/helpers.mjs`(빌드 번들)는 저장소에 커밋돼 있지 않아 읽지 않았다.
- 근거가 아닌 입력: 원장(`skill-explainers/codex-security/relations.md`), 필수 참조 목록(`required-refs.md`), `GLOSSARY.md`, `EXPLAINER-PROMPT.md`. 이 파일들은 어디를 읽을지와 표기를 정하는 데만 썼고 사실의 근거로 인용하지 않았다.
- 읽지 않은 것: `project-config.schema.json`, `deep_scan_config.py`, `executor.ts`의 나머지, `server.ts`의 다른 도구 정의, `mcp-app/tests/`.

| # | 경로 | 바이트 | 읽은 정도 | 읽은 범위 | 역할 |
|---|---|---|---|---|---|
| 1 | `codex-security/plugins/codex-security/skills/security-scan/SKILL.md` | 2,972 | 전부 | 전체 | scan 스킬 본문 |
| 2 | `codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md` | 5,405 | 전부 | 전체 | scan 스킬 본문 |
| 3 | `codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md` | 3,127 | 전부 | 전체 | scan 스킬 본문 |
| 4 | `codex-security/plugins/codex-security/skills/threat-model/SKILL.md` | 2,986 | 전부 | 전체 | 단계 스킬 본문 |
| 5 | `codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md` | 5,076 | 전부 | 전체 | 단계 스킬 본문 |
| 6 | `codex-security/plugins/codex-security/skills/validation/SKILL.md` | 4,619 | 전부 | 전체 | 단계 스킬 본문 |
| 7 | `codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md` | 5,355 | 전부 | 전체 | 단계 스킬 본문 |
| 8 | `codex-security/plugins/codex-security/skills/README.md` | 3,752 | 부분 | 1~30줄 | 벤더의 스킬 선택 안내 |
| 9 | `codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md` | 2,871 | 전부 | 전체 | scan 결과 저장과 완료 |
| 10 | `codex-security/plugins/codex-security/skills/security-scan/references/managed-scan.md` | 1,356 | 전부 | 전체 | managed Standard scan 진행 |
| 11 | `codex-security/plugins/codex-security/references/core-scan.md` | 7,479 | 전부 | 전체 | Standard 감사 절차 |
| 12 | `codex-security/plugins/codex-security/references/baseline-auditor.md` | 2,839 | 부분 | 14~18줄 | baseline 감사 금지 목록 |
| 13 | `codex-security/plugins/codex-security/references/focused-investigator.md` | 2,548 | 부분 | 9~13줄 | 집중 조사 금지 목록 |
| 14 | `codex-security/plugins/codex-security/references/validate-scan-findings.md` | 1,131 | 전부 | 전체 | Standard 후보 검증 기준 |
| 15 | `codex-security/plugins/codex-security/references/scan-runtime.md` | 1,558 | 전부 | 전체 | worker 위임과 diff scan 안내 |
| 16 | `codex-security/plugins/codex-security/references/access-advisory.md` | 1,373 | 전부 | 전체 | 접근 안내 규칙 |
| 17 | `codex-security/plugins/codex-security/references/scan-artifacts.md` | 11,701 | 부분 | 24~50줄 | 위협 모델 경로와 compact diff 산출물 |
| 18 | `codex-security/plugins/codex-security/references/artifact-storage.md` | 7,947 | 부분 | 1~20, 47~53줄 | scan 소유와 위협 모델 cache |
| 19 | `codex-security/plugins/codex-security/references/final-report.md` | 12,135 | 부분 | 1~20, 38~54줄 | 제출·완료 소유자와 결과 매핑 |
| 20 | `codex-security/plugins/codex-security/references/scan-contract.md` | 16,529 | 부분 | 3, 9~14, 30~41, 122~132, 173줄 | 봉인 문서, status, mode |
| 21 | `codex-security/plugins/codex-security/references/threat-model.md` | 7,751 | 부분 | 38~43줄 | 위협 모델 draft 저장 계약 |
| 22 | `codex-security/plugins/codex-security/references/scan-prologue.md` | 5,747 | 부분 | 1~40줄(일부 줄은 앞부분만), 27줄만 인용 | Deep 코디네이터의 phase 소유 |
| 23 | `codex-security/plugins/codex-security/mcp-app/server.ts` | 84,254 | 부분 | 100~122, 926~936줄 | diffTarget schema, Deep scope 검사 |
| 24 | `codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts` | 15,421 | 부분 | 78~170줄 | compact 도구 등록 |
| 25 | `codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts` | 6,121 | 부분 | 20~80, 110~190줄 | 검증·공격 경로 기록 검사 |
| 26 | `codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts` | 6,305 | 부분 | 27(검색), 55~100, 178~195줄 | 후보 기록과 목록 |
| 27 | `codex-security/plugins/codex-security/mcp-app/src/artifact-inventory.ts` | 5,370 | 부분 | 17(검색), 29~118줄 | diff 변경 파일 목록 |
| 28 | `codex-security/plugins/codex-security/mcp-app/src/artifact-io.ts` | 10,767 | 부분 | 40~110줄 | artifact 파일 없음 오류 |
| 29 | `codex-security/plugins/codex-security/mcp-app/src/artifact-contracts.ts` | 15,569 | 부분 | 58~96줄 | 후보 입력 칸 |
| 30 | `codex-security/plugins/codex-security/mcp-app/src/helpers/normalize-candidates.ts` | 18,523 | 부분 | 338~400줄 | 후보 병합과 ID |
| 31 | `codex-security/plugins/codex-security/mcp-app/src/threat-model-document.ts` | 2,657 | 부분 | 33~70줄 | threatmodel.md 생성 |
| 32 | `codex-security/plugins/codex-security/mcp-app/src/threat-model-render.ts` | 5,406 | 부분 | 140~168줄 | Saved Model Context footer |
| 33 | `codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts` | 40,348 | 부분 | 573~590, 800~880줄 | Deep 마감, 중단 조건, 배정 |
| 34 | `codex-security/plugins/codex-security/mcp-app/src/deep-scan/executor.ts` | 48,414 | 부분 | 478~490줄 | Deep worker의 skill 읽기 지시 |
| 35 | `codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md` | 2,215 | 전부 | 전체 | Deep worker prompt |
| 36 | `codex-security/plugins/codex-security/scripts/deep_scan_defaults.json` | 143 | 전부 | 전체 | Deep 번들 기본값 |
| 37 | `codex-security/plugins/codex-security/scripts/workbench_constants.py` | 3,177 | 부분 | 7줄 주변 | 진행 phase 목록 |
| 38 | `codex-security/plugins/codex-security/scripts/workbench_progress.py` | 16,640 | 부분 | 268줄 주변(검색 결과) | 이전 phase 거부 |
| 39 | `codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json` | 4,519 | 부분 | 8~22줄과 `minItems` 검색 | validations 배열 schema |
| 40 | `codex-security/plugins/codex-security/skills/track-findings/SKILL.md` | 13,459 | 부분 | 8, 24줄 | 봉인 scan 입력(묶음 밖) |
| 41 | `codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md` | 4,447 | 부분 | 7~12줄 | findings.json 입력(묶음 밖) |
| 42 | `codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md` | 19,102 | 부분 | 10줄 | 기본 입력(묶음 밖) |
