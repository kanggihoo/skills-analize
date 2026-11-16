# threat-model-visualize 읽은 파일 목록

분석 커밋 `cd5035b88386f2e309c89f5af2814e7f3d7d8343`. 경로는 저장소 루트 기준이다. `S` = `codex-security/plugins/codex-security/skills`, `P` = `codex-security/plugins/codex-security`. 어떤 파일도 실행하지 않았다.

## 전부 읽음 (텍스트 15개, 97,639B)

| 파일 | 바이트 | 역할 |
|---|---|---|
| S/threat-model-visualize/SKILL.md | 19102 | 스킬 본문 |
| S/threat-model-visualize/agents/openai.yaml | 259 | 표시 이름, 기본 prompt |
| S/threat-model-visualize/references/view-model.md | 12062 | view-model 계약 |
| S/threat-model-visualize/references/context-explorer.md | 5636 | 표현 지침 |
| S/threat-model-visualize/scripts/build_explorer.py | 27557 | builder (실행 안 함) |
| S/threat-model-visualize/assets/explorer.html | 2673 | HTML 틀 |
| S/threat-model-visualize/assets/control-effects.js | 4005 | 통제 효과 계산 |
| S/threat-model-visualize/assets/route-paths.js | 3648 | route 도달 계산 |
| S/threat-model-visualize/assets/source-roles.js | 2762 | source 역할 팔레트 |
| P/references/artifact-storage.md | 7947 | 저장 규칙, 위협 모델 cache |
| S/README.md | 3752 | 벤더 스킬 선택 안내 |
| P/.mcp.json | 2078 | MCP 서버 선언과 시간 제한 |
| P/.codex-plugin/plugin.json | 1682 | 플러그인 선언 |
| P/tests/threat-model-visualize/browser/README.md | 1754 | browser smoke test 안내 |
| P/tests/threat-model-visualize/browser/fixture.mjs | 2722 | test fixture |

## 구조·표본만 확인(전부 읽지 않음) (텍스트 23개, 355,747B)

| 파일 | 바이트 | 읽은 범위 |
|---|---|---|
| S/threat-model-visualize/assets/explorer.js | 42283 | 전체 372줄을 훑었으나 긴 줄 일부는 끝이 잘림 |
| S/threat-model-visualize/assets/svg-layout.js | 11530 | 1~12줄, 55~165줄, 함수 목록. 13~54줄은 읽지 않음 |
| S/threat-model-visualize/assets/explorer.css | 12126 | 앞 1,500B와 외부 URL 검색 |
| S/threat-model-visualize/assets/context-reference-overview.svg | 36850 | 앞부분과 `title`·`desc`. 텍스트 XML이지만 생성 예시라 읽었다고 하지 않음 |
| S/threat-model-visualize/assets/context-reference-path.svg | 60788 | 위와 같음 |
| P/tests/test_threat_model_visualize.py | 38192 | 앞 20줄, 190~200줄, test 이름 40개 |
| P/tests/threat-model-visualize/control-effects.test.mjs | 6982 | test 이름 |
| P/tests/threat-model-visualize/renderer-scope.test.mjs | 35787 | test 이름 |
| P/tests/threat-model-visualize/route-paths.test.mjs | 12918 | test 이름 |
| P/tests/threat-model-visualize/source-roles.test.mjs | 3269 | test 이름 |
| P/tests/threat-model-visualize/svg-layout.test.mjs | 10318 | test 이름 |
| P/tests/threat-model-visualize/browser/export-smoke.test.mjs | 9736 | test 이름 |
| S/threat-model/SKILL.md | 2986 | 15~35줄 |
| S/security-diff-scan/SKILL.md | 5405 | 28줄 |
| S/deep-security-scan/SKILL.md | 3127 | 14줄, `threat` 검색 결과 |
| S/security-scan/references/scan-results.md | 2871 | 7줄 |
| S/security-scan/references/scan-artifacts-and-ledger.md | 7021 | 28줄(`fork_turns` 검색 결과) |
| P/references/scan-artifacts.md | 11701 | 25~31줄 |
| P/references/scan-contract.md | 16529 | 173줄 |
| P/references/core-scan.md | 7479 | 10줄(`fork_turns` 검색 결과) |
| P/mcp-app/src/threat-model-document.ts | 2657 | 30~73줄 |
| P/plugin-files.json | 8667 | 160~180줄 |
| codex-security/skills-lock.json | 6525 | 이 스킬 항목 106~111줄 |

## 제외

번역본(`*.KO.md`)은 없다. 바이너리는 읽지 않았다. 스킬이 가리키는 "Sites workflow", "visualize integration", "shared workbench"와 `spawn_agent` 도구 정의는 이 트리에 없다.
