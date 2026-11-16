# publish-findings는 외부 scanner 결과를 어떻게 가져와 local workbench에 저장하고 Cloud에 게시하나? {#publish-findings-page}

`publish-findings`는 외부 scanner 결과를 먼저 local workbench에 저장하고, 사용자가 미리보기를 확인한 선택분만 Codex Security Cloud에 게시한다.[](source:p-front)[](source:p-intent) 요청 문구에 따라 시작점이 갈린다. "publish"는 local workbench에서, "import"는 가져와 저장하는 데까지, "import and publish"는 가져오기가 돌려준 선택분을 게시한다.[](source:p-intent) 스킬이 따르라는 SDK 문서(`docs/sdk.md`)와 `codex-security` CLI는 이 저장소에 없어 읽지 못했다. 그 부분은 **부분 분석**이다.

- 가져오기는 `--dry-run`으로 먼저 보고, 승인된 뒤에만 `--yes`로 쓴다.[](source:p-local)
- Cloud 게시는 account, destination, evidence, exclusions 미리보기를 사용자가 확인한 뒤에만 `group.publish`를 부른다.[](source:p-pub)
- credential은 명령 인자와 가져온 evidence에 남기지 않는다. vendor의 credential 저장소나 지원하는 환경 변수를 쓴다.[](source:p-acq)
- `agents/openai.yaml`이 `allow_implicit_invocation: true`를 선언한다.[](source:p-yaml) 판정 · 이름을 부르지 않아도 모델이 고를 수 있다는 뜻으로 읽히지만, 이 필드를 처리하는 코드는 확인하지 못했다.

@answer scope="원문 분석 · 폴더 파일과 저장소 구현 소스 읽음 · SDK 문서, CLI, 외부 URL은 저장소 밖 · 스크립트 미실행 · 부분 분석"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source p-full title="codex-security/plugins/codex-security/skills/publish-findings/SKILL.md · 11118B · 스킬 본문(원본)" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md
@source p-front title="publish-findings/SKILL.md · 11118B · frontmatter" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=1:4
@source p-intent title="publish-findings/SKILL.md · 11118B · 용도와 요청 해석" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=8:8
@source p-ev title="publish-findings/SKILL.md · 11118B · 증거 고르기" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=12:12
@source p-acq title="publish-findings/SKILL.md · 11118B · 수집 규칙과 credential" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=14:14
@source p-trivy title="publish-findings/SKILL.md · 11118B · Trivy" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=18:18
@source p-semgrep title="publish-findings/SKILL.md · 11118B · Semgrep 4종" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=19:22
@source p-github title="publish-findings/SKILL.md · 11118B · GitHub" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=23:23
@source p-snyk title="publish-findings/SKILL.md · 11118B · Snyk" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=24:24
@source p-cont title="publish-findings/SKILL.md · 11118B · AWS Continuum" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=25:25
@source p-cx title="publish-findings/SKILL.md · 11118B · Checkmarx" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=26:26
@source p-wiz title="publish-findings/SKILL.md · 11118B · Wiz" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=27:27
@source p-cpatch title="publish-findings/SKILL.md · 11118B · AWS Continuum patch 수집" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=28:28
@source p-fcs title="publish-findings/SKILL.md · 11118B · CrowdStrike FCS" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=29:29
@source p-other title="publish-findings/SKILL.md · 11118B · 그 밖의 내장 reader" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=30:30
@source p-sonar title="publish-findings/SKILL.md · 11118B · SonarQube Cloud" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=32:34
@source p-local title="publish-findings/SKILL.md · 11118B · 로컬 가져오기" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=38:38
@source p-unfam title="publish-findings/SKILL.md · 11118B · 낯선 형식 parser" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=40:40
@source p-pub title="publish-findings/SKILL.md · 11118B · Cloud 게시" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=44:44
@source p-retry title="publish-findings/SKILL.md · 11118B · 중단 뒤 재개와 영수증" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=46:46
@source p-yaml title="publish-findings/agents/openai.yaml · 284B · 호출 정책" path=codex-security/plugins/codex-security/skills/publish-findings/agents/openai.yaml lines=1:6
@source cx-full title="publish-findings/references/checkmarx-import.md · 4888B · Checkmarx 수집 절차(원본)" path=codex-security/plugins/codex-security/skills/publish-findings/references/checkmarx-import.md
@source cx-intro title="references/checkmarx-import.md · 4888B · 지원 형식과 전체 scan" path=codex-security/plugins/codex-security/skills/publish-findings/references/checkmarx-import.md lines=3:3
@source cx-before title="references/checkmarx-import.md · 4888B · vendor 도구 실행 전 조건" path=codex-security/plugins/codex-security/skills/publish-findings/references/checkmarx-import.md lines=5:10
@source cx-one title="references/checkmarx-import.md · 4888B · Checkmarx One" path=codex-security/plugins/codex-security/skills/publish-findings/references/checkmarx-import.md lines=12:20
@source cx-sast title="references/checkmarx-import.md · 4888B · self-managed CxSAST" path=codex-security/plugins/codex-security/skills/publish-findings/references/checkmarx-import.md lines=22:31
@source cx-prev title="references/checkmarx-import.md · 4888B · 미리보기와 가져오기" path=codex-security/plugins/codex-security/skills/publish-findings/references/checkmarx-import.md lines=33:37
@source wz-full title="publish-findings/references/wiz-import.md · 5153B · Wiz 입력 형식(원본)" path=codex-security/plugins/codex-security/skills/publish-findings/references/wiz-import.md
@source wz-fmt title="references/wiz-import.md · 5153B · 지원 형식과 occurrence ID" path=codex-security/plugins/codex-security/skills/publish-findings/references/wiz-import.md lines=3:9
@source wz-pkg title="references/wiz-import.md · 5153B · package 취약점과 CSV profile" path=codex-security/plugins/codex-security/skills/publish-findings/references/wiz-import.md lines=11:17
@source wz-fam title="references/wiz-import.md · 5153B · SAST, secret, IaC collection" path=codex-security/plugins/codex-security/skills/publish-findings/references/wiz-import.md lines=19:31
@source wz-norm title="references/wiz-import.md · 5153B · 정규화 JSONL과 보존할 evidence" path=codex-security/plugins/codex-security/skills/publish-findings/references/wiz-import.md lines=33:45
@source col-full title="publish-findings/scripts/collect_checkmarx.py · 17126B · Checkmarx collector(원본, 실행 안 함)" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py
@source col-installed title="scripts/collect_checkmarx.py · 17126B · 실행 파일 검사" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py lines=23:58
@source col-cxflow title="scripts/collect_checkmarx.py · 17126B · CxFlow 버전 검사" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py lines=61:82
@source col-env title="scripts/collect_checkmarx.py · 17126B · 환경 변수 선택 전달" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py lines=85:128
@source col-verify title="scripts/collect_checkmarx.py · 17126B · report 검증" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py lines=131:164
@source col-temp title="scripts/collect_checkmarx.py · 17126B · 비공개 임시 폴더" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py lines=166:230
@source col-run title="scripts/collect_checkmarx.py · 17126B · vendor 도구 호출" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py lines=233:300
@source col-out title="scripts/collect_checkmarx.py · 17126B · 결과 경로 출력과 실패 시 삭제" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py lines=303:314
@source col-args title="scripts/collect_checkmarx.py · 17126B · 인자 검증" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py lines=317:346
@source col-sig title="scripts/collect_checkmarx.py · 17126B · signal과 자식 process 정리" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py lines=348:388
@source cp-full title="publish-findings/scripts/collector_paths.py · 2210B · source 경로 판별(원본, 실행 안 함)" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collector_paths.py
@source cp-in title="scripts/collector_paths.py · 2210B · 링크를 따라가며 source 안인지 판별" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collector_paths.py lines=32:63
@source hm-full title="codex-security/plugins/codex-security/mcp-app/helpers-main.ts · 8642B · helper 진입점(원본)" path=codex-security/plugins/codex-security/mcp-app/helpers-main.ts
@source hm-ext title="mcp-app/helpers-main.ts · 8642B · 외부 finding helper 5종 사용법" path=codex-security/plugins/codex-security/mcp-app/helpers-main.ts lines=86:95
@source ef-full title="codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts · 11530B · 외부 finding 저장소(원본)" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts
@source ef-guard title="workbench/external-findings.ts · 11530B · 입력 검사" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts lines=64:70
@source ef-start title="workbench/external-findings.ts · 11530B · 저장 함수 시작과 빈 입력" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts lines=129:136
@source ef-id title="workbench/external-findings.ts · 11530B · 중복 거부와 finding ID" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts lines=147:169
@source ef-count title="workbench/external-findings.ts · 11530B · created, updated, unchanged 판정" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts lines=198:222
@source ef-member title="workbench/external-findings.ts · 11530B · import 구성원 기록" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts lines=223:229
@source ef-state title="workbench/external-findings.ts · 11530B · 평가 상태 not_assessed" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts lines=76:89
@source ef-stale title="workbench/external-findings.ts · 11530B · 선택이 바뀌면 거부" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts lines=308:322
@source pr-full title="codex-security/plugins/codex-security/mcp-app/src/workbench/external-finding-publications.ts · 3624B · 게시 영수증 저장(원본)" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-finding-publications.ts
@source pr-type title="workbench/external-finding-publications.ts · 3624B · 영수증 항목과 outcome 4종" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-finding-publications.ts lines=5:17
@source pr-rec title="workbench/external-finding-publications.ts · 3624B · 영수증 기록 검사" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-finding-publications.ts lines=31:62
@source rm-full title="codex-security/plugins/codex-security/skills/README.md · 3752B · 벤더 스킬 선택 안내(원본)" path=codex-security/plugins/codex-security/skills/README.md
@source rm-pf title="skills/README.md · 3752B · publish-findings 안내" path=codex-security/plugins/codex-security/skills/README.md lines=39:39
@source rda-imp title="skills/resolve-dependency-alert/SKILL.md · 2548B · 가져오기 요청이면 이 스킬로" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=10:10
@source ap-cont title="skills/attack-path-analysis/SKILL.md · 5355B · Continuum 증거 읽기(21줄만)" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=21:21
@source fx-full title="codex-security/plugins/codex-security/skills/fix-finding/SKILL.md · 18461B · 본문(원본)" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md
@source fx-patch title="skills/fix-finding/SKILL.md · 18461B · 제안된 patch를 시작 후보로" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=38:38
@source cf-desc title="skills/cloud-findings/SKILL.md · 10563B · description(3줄)" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=3:3
@source cf-ro title="skills/cloud-findings/SKILL.md · 10563B · 읽기 전용과 upload 금지(8줄)" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=8:8
@source cf-imp title="skills/cloud-findings/SKILL.md · 10563B · imported finding 읽기(27줄)" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=27:27

## 이 스킬은 언제 켜지고 무엇은 하지 않나? {#activation}

description은 모델이 호출을 판단할 때 참고하는 설명이다. 특정 단어가 있어야 켜지는 사전이 아니다.[](source:p-front)

@code source=p-front language=yaml

@code source=p-yaml language=yaml

| 구분 | 원문 규칙 |
|---|---|
| 켜는 경우 | scanner, CI report, vendor CLI, API, 연결된 도구의 finding을 local workbench로 가져올 때와, 저장된 vendor finding의 선택분을 Cloud에 게시할 때다.[](source:p-front) |
| 요청 해석 | "publish these findings"는 local workbench에서 시작한다. "import"는 요청한 기록을 받아 로컬에 저장한다. "import and publish"는 가져오기가 돌려준 선택분을 게시한다.[](source:p-intent) |
| 다루는 증거 | 새 scan, 이전 scan이나 CI artifact, 기존 upstream issue, 이미 workbench에 있는 기록 중 사용자가 원하는 것을 먼저 가린다. 같은 repository라도 로컬 scan, hosted backlog, 이전 build는 서로 다른 finding을 낼 수 있다.[](source:p-ev) |
| 호출 제한 | frontmatter에 `disable-model-invocation`이 없다. `openai.yaml`은 `allow_implicit_invocation: true`를 선언한다. 이 선언이 실제로 어떻게 쓰이는지는 원문에 명시 없음.[](source:p-front)[](source:p-yaml) |

| 상황 | 이 스킬 |
|---|---|
| 외부 scanner나 CI 결과를 local workbench로 가져오고 싶다 | {good:적합} 벤더 안내문도 다른 scanner의 알림을 미리 보고 가져오는 스킬로 적는다.[](source:rm-pf) |
| local에 저장된 vendor finding을 Cloud에 게시하고 싶다 | {good:적합} 사용자가 미리보기를 확인한 뒤에만 한다.[](source:p-pub) |
| 알림을 조사해 달라고 하며 가져오기는 요청하지 않았다 | {bad:부르지 않음} `resolve-dependency-alert`는 가져오기를 명시적으로 요청받을 때만 이 스킬로 넘긴다.[](source:rda-imp) |
| Cloud에 이미 있는 finding이나 scan 상태를 보고 싶다 | {bad:다른 스킬} `cloud-findings`가 읽기만 한다. 그 스킬은 결과 upload를 금지한다.[](source:cf-desc)[](source:cf-ro) |

## 어떤 순서로 가져오고 게시하나? {#flow}

에이전트는 증거를 고르고 수집한 뒤 local에 저장하는 단계까지 한 번에 하고, Cloud 게시는 저장된 선택분에서 따로 시작한다. 두 쓰기 모두 사용자 확인 뒤에만 일어난다.[](source:p-local)[](source:p-pub)

@workflow id=publish-flow title="publish-findings 가져오기와 게시"
| lane local | local workbench로 가져오기 |
| lane cloud | Cloud 게시 |
| sel | 증거 고르기 | external | local |
| acq | 수집과 읽기 | backend | local |
| parse | 낯선 형식 parser | backend | local |
| dry | dry-run 검토 | security | local |
| store | 승인 후 저장 | database | local |
| prep | 게시 미리보기 | backend | cloud |
| post | 확인 후 게시 | cloud | cloud |
| rcpt | receipt 보고 | database | cloud |
| sel > acq | |
| acq > dry | |
| acq > parse | 형식 낯섦 | dashed |
| parse > dry | |
| dry > store | 승인 | emphasis |
| store > prep | 게시도 요청 |
| prep > post | 확인 | emphasis |
| post > rcpt | |

@steps id=publish-steps
| sel | 증거 고르기 | 새 scan, 이전 결과, 기존 upstream issue, workbench 기록 중 무엇인지 가린다. repository, project, ref, product, 필터, 정확한 finding ID를 끝까지 들고 간다.[](source:p-ev) | publish-flow | sel |
| acq | 수집과 읽기 | 새 scan이면 실행할 환경에서 실행 파일을 찾고 필요하면 help를 본다. hosted 선택이면 이 session의 도구나 로그인된 vendor CLI나 권한 있는 읽기 API를 쓰고, 범위를 한정한 읽기나 문서화된 상태 명령으로 접근을 확인한다. 같은 범위의 완결된 이전 결과는 재사용한다. pagination을 따르고 원본 기록을 보존하고 빠진 ID와 불완전한 범위를 설명한다.[](source:p-acq) | publish-flow | acq |
| parse | 낯선 형식 parser | 낯선 형식은 실제 행을 보고 parser를 쓴다. findings, 읽은 수, 제외 목록을 `prepareNormalizedLocalImport`에 checkout, provider, source key와 함께 넘긴다. 행마다 안정적인 source ID를 주고 원본 evidence와 repository 정체를 보존한다. 선택된 모든 행은 evidence나 번호 붙은 제외 사유 중 하나로 설명한다.[](source:p-unfam) | publish-flow | parse |
| dry | dry-run 검토 | `--dry-run`으로 repository, evidence, 제외 항목, scanner 오류를 검토한다. source key는 같은 선택을 반복 가져와도 변하지 않는 것을 쓴다.[](source:p-local) | publish-flow | dry |
| store | 승인 후 저장 | 승인되면 `--dry-run`을 빼고 `--yes`를 붙여 쓴다. 결과의 import ID와 finding version을 보관한다. 일부만 가져오면 종료 코드 1이므로, 저장된 finding을 확인하고 제외 항목을 보고한 뒤 다시 시도한다.[](source:p-local) | publish-flow | store |
| prep | 게시 미리보기 | import ID나 선택한 finding ID와 version으로 게시를 준비하고 account, destination, evidence, exclusions를 보여 준다.[](source:p-pub) | publish-flow | prep |
| post | 확인 후 게시 | 사용자가 미리보기를 확인한 뒤 승인된 group마다 게시한다. 승인된 group의 선택, destination, review ID를 보관한다. review ID가 바뀌면 새 미리보기가 필요하다.[](source:p-pub)[](source:p-retry) | publish-flow | post |
| rcpt | receipt 보고 | 끝난 group은 receipt를 근거로 보고한다. 중단됐으면 중단된 group과 시작 전 group을 저장해 둔 review ID로 다시 준비한다.[](source:p-retry) | publish-flow | rcpt |

게시 뒤 확인 대상은 목적지에 따라 다르다. private inbox는 import job 상태와 개수를 확인하고, repository 요청은 verification, 확인되지 않은 기록, 실패를 확인한다.[](source:p-retry) 이전 client가 남긴 pending upload는 원래 build로 마치거나 어떤 finding이 Cloud에 닿았는지 확인한 뒤에 새 제출을 준비한다.[](source:p-retry)

SDK 함수 이름(`listLocalExternalImports`, `prepareStoredFindingsPublication`, `group.publish`)과 CLI 명령은 SKILL.md에만 적혀 있다. 그 구현은 이 저장소에 없어 동작을 확인하지 못했다.[](source:p-pub)

스킬은 SDK snippet을 `$(npm root --global)/@openai/codex-security` 같은 신뢰하는 디렉터리에서 checkout과 report의 절대 경로로 실행하라고 한다. 이것은 지시상 동작이다.[](source:p-intent)

## scanner마다 무엇을 어떻게 수집하나? {#acquire}

수집 방법은 scanner마다 다르다. 아래는 SKILL.md 표를 줄인 것이다. 명령은 모두 지시상 동작이고 실행하지 않았다.

| source | 수집 방법 | 원문이 붙인 조건 |
|---|---|---|
| Trivy | 새 filesystem 취약점 scan은 `trivy fs --scanners vuln --format json --output REPORT.json .`. 이전 scan은 repository나 filesystem schema-v2 JSON 또는 gzip을 읽는다. | filesystem report는 checkout 상대 경로 `--trivy-scan-root`를 준다.[](source:p-trivy) |
| Semgrep CLI와 CI | 새 Code scan은 설치된 CLI로 `semgrep scan --config RULES --json-output REPORT.json .`. CI job은 Code JSON이나 자체 완결 SARIF를 쓴다. | 규칙은 선택한 것을 쓴다.[](source:p-semgrep) |
| Semgrep Guardian MCP | 연결된 `get_semgrep_sast_findings` 또는 `get_semgrep_supply_chain_findings`를 쓴다. | deployment, repository, 전체 ref, 필터를 준다. 정확한 문자열 finding ID로 맞추고 원래 요청과 선택한 행을 보존한다.[](source:p-semgrep) |
| Semgrep hosted AppSec Platform MCP | `semgrep_account`, `ProjectsService_GetProject`, `IssuesService_ListIssues`를 쓴다. | project의 SCM URL을 먼저 확인한다. project, 전체 ref, `ISSUE_TYPE_SAST`로 범위를 정한다. Guardian ID와 hosted Platform ID는 이름 공간이 다르다.[](source:p-semgrep) |
| Semgrep Platform Web API | 전체 project와 ref는 `codex-security import semgrep PROJECT --deployment DEPLOYMENT --ref REF --format json`. | 선택한 SAST ID는 원래 project 응답과 선택한 findings 페이지를 쓴다.[](source:p-semgrep) |
| GitHub | 로그인된 GitHub CLI collector `codex-security import github OWNER/REPO`에 `--github-alert NUMBER`(반복 가능)나 `--github-ref REF`를 준다. advisory는 `import github-advisories`. | Dependabot은 전체 pagination된 repository REST alert 객체를 연결된 GitHub로 내보낸다. 세 계열은 source key를 따로 둔다.[](source:p-github) |
| Snyk | 관리 중인 Open Source project는 `codex-security import snyk PROJECT_ID --org ORG_ID --source-repository-url URL --format json`. Code project는 `--snyk-product code`를 더한다. | 새 dependency scan은 `snyk test` JSON이나 Snyk plugin의 SCA export를 쓴다. 수집 형식끼리 이름 공간을 나눈다.[](source:p-snyk) |
| AWS Continuum | `codex-security import continuum ENVIRONMENT_ID --format json`이 환경의 모든 issue, 연결된 finding, issue 단위 `EVIDENCE`와 `VALIDATION_EVIDENCE`를 모은다. | 환경에 Git repository가 정확히 하나여야 한다. 가져오기 전에 issue가 의도한 repository 것인지 확인한다. 저장된 report에 repository URL이 없으면 확인한 `--source-repository-url`을 준다.[](source:p-cont) |
| Checkmarx | 완료된 Checkmarx One scan은 CLI JSON, self-managed CxSAST는 XML로 내보낸다. | 제품, scan, 확인된 소유 project는 `references/checkmarx-import.md`를 따른다.[](source:p-cx) |
| Wiz | 연결된 Wiz 도구나 API로 occurrence ID별 finding을 받거나 상세 report를 쓴다. | JSON은 여러 finding 계열, 상세 CSV는 repository package 취약점만 다룬다. `references/wiz-import.md`를 따른다.[](source:p-wiz) |
| AWS Continuum patch | `codex-security import continuum ENVIRONMENT_ID --finding-id FINDING_ID --source-root CHECKOUT --repository-name AWS_SOURCE_NAME --format json`으로 finding 하나를 받는다. | checkout은 절대 경로, source 이름은 정확히 쓴다. 환경에 Git repository가 하나이고 S3 source가 없으면 `--repository-name`을 뺀다. CLI가 `GetEnvironment`로 확인한다.[](source:p-cpatch) |
| CrowdStrike FCS | 저장된 FCS CLI 4.x `fcs scan iac` JSON report. 새 scan은 가져올 디렉터리에서 `fcs scan iac --path . --report-formats json --output-path DIR`. | `DIR`은 그 디렉터리 밖에 있는 기존 비공개 디렉터리이고 이름에 점이 없다. `Results saved to file`이 가리키는 `*-scan-results.json`만 가져온다. `fcs`가 PATH에 없으면 설치하지 않고 Falcon credential도 인자로 넘기지 않으며 저장된 report를 요청한다. `--to local`만 쓴다.[](source:p-fcs) |
| 그 밖의 내장 reader | OpenGrep, Endor, Inspector, Black Duck, Veracode, Tenable. | 각 도구가 어떤 형식과 범위를 받는지는 원문이 한 문장씩 적는다. 예: Inspector는 Code Security repository 하나, Veracode는 application 하나.[](source:p-other) |
| SonarQube Cloud | 로그인된 `sonar` CLI로 issue를 읽는다. 선택한 issue key는 Sonar plugin이 줄 수 있다. | 같은 project와 branch나 PR의 전체 issue와 flow 증거를 모은다. `--dry-run`으로 미리 보고 그 미리보기가 저장한 capture로 승인된 가져오기를 한다.[](source:p-sonar) |

Continuum 항목의 attack path 점수는 선택한 issue의 저장된 `.evidence`를 검증 artifact까지 포함해 `attack-path-analysis`에 주어 매긴다.[](source:p-cont)

**Wiz 입력 형식**

`references/wiz-import.md`는 입력 형식과 occurrence ID를 정한다. 원본 기록은 `source_data`에 그대로 두고, ID는 vendor의 occurrence ID를 쓴다. 규칙, CVE, 제목, 위치를 ID로 쓰지 않는다. 없는 ID, severity, revision, 위치는 지어내지 않는다.[](source:wz-fmt)

| 계열 | collection | occurrence ID |
|---|---|---|
| package 취약점 | JSON, JSONL, 상세 CSV | Wiz finding의 ID 그대로[](source:wz-pkg) |
| SAST | `data.sastFindings.nodes` | `sast:<id>`[](source:wz-fam) |
| repository secret | `data.secretInstances.nodes` | `secret:<id>`[](source:wz-fam) |
| IaC | `data.iacFindings.nodes` | `iac:<id>`[](source:wz-fam) |

CSV 직접 가져오기는 repository package 취약점(SCA)만 지원한다.[](source:wz-fmt) 그 profile의 조건은 다음과 같다.[](source:wz-pkg)

- 필수 열은 `ID`, `Name`, `DetailedName`, `AssetID`, `WizURL`, `CloudPlatform`, `CloudProviderURL`이다.
- `CloudPlatform`은 GitHub이어야 하고 `CloudProviderURL`은 repository branch URL이어야 한다.
- repository는 선택한 Cloud repository와 맞아야 하고, 로컬 가져오기에서는 parse할 수 있는 Git remote가 있으면 그것과 맞아야 한다.

SAST, secret, IaC는 이름이 붙은 collection을 보존해야 한다. bare array로는 계열을 알 수 없다. 이 계열의 CSV는 실제 header를 정규화 profile에 맞추는 검토된 mapping이 필요하다.[](source:wz-fam)[](source:wz-norm) vendor의 상태, AI verdict, secret 검증 결과는 vendor 증거로 남고 Codex의 평가가 아니다.[](source:wz-norm)

## Checkmarx collector는 무엇을 강제하나? {#checkmarx}

Checkmarx만 collector 스크립트가 따로 있다. 아래는 스크립트를 읽고 정리한 지시상 동작이다. 실행하지 않았다.

@sequence id=checkmarx-collect title="Checkmarx collector 호출 순서(지시상 동작)"
| actor agent | 에이전트 | backend |
| actor col | collect_checkmarx.py | backend |
| actor vend | cx 또는 java와 CxFlow JAR | external |
| actor cli | codex-security CLI | external |
| phase | 실행 전 검사 |
| agent | col | python -I -S로 호출, 먼저 --source-root |
| phase | vendor 도구 실행 |
| col | vend | 비공개 임시 폴더에서 실행 |
| vend | col | report 파일 | return |
| phase | 검증과 전달 |
| col | agent | 검증된 report 경로 | return |
| agent | cli | 다음 tool call로 publish findings --dry-run |

collector가 지키는 조건은 다음과 같다.

| 조건 | 내용 |
|---|---|
| 실행 파일 | source checkout 밖에 있는 절대 경로의 기존 파일만 받는다. native 실행 파일(ELF, Mach-O, PE)이 아니면 거부해 shell launcher와 shim을 막는다. Windows는 `.exe`나 `.com`만 허용한다.[](source:col-installed) |
| CxFlow | JAR이 `com.checkmarx.flow.CxFlowApplication`이고 `build.group`이 `com.checkmarx`이며 version이 1.6.37 이상이어야 한다. 더 낮은 version은 `--scanId`를 받고도 조용히 최신 scan을 가져오기 때문이다.[](source:col-cxflow) |
| 환경 변수 | 상속하는 이름을 골라 넘긴다. CxSAST 계정 변수는 `--use-env-credentials`일 때만 넘긴다. Checkmarx One은 `CX_CONFIG_FILE_PATH`가 없고 환경 변수 로그인이 완전하면 임시 profile과 `CX_KEYRING_MODE=disabled`를 쓴다. 그 밖에는 profile 경로(`CX_CONFIG_FILE_PATH` 또는 기본 `~/.checkmarx/checkmarxcli.yaml`)가 source 밖의 절대 경로여야 한다.[](source:col-env) |
| 임시 폴더 | 임시 폴더가 source 안이면 거부한다. 비공개 capture 폴더를 만들고 Windows는 보호된 DACL을 건다.[](source:col-temp) |
| report 검증 | One은 report의 `scanID`가 요청한 ID와 같아야 한다. CxSAST는 root가 `CxXMLResults`이고 `ProjectId`, `ScanId`, `ProjectName`, team 경로가 요청과 모두 같아야 한다.[](source:col-verify) |
| 출력 | report를 `0o600`으로 바꾸고 경로만 stdout에 쓴다. 실패하면 capture 폴더를 지운다.[](source:col-out) |
| 인자 | One의 scan ID는 하이픈이 있는 UUID, CxSAST는 양의 정수여야 한다. team과 project는 비어 있으면 안 된다.[](source:col-args) |
| 종료 | SIGTERM, SIGINT, SIGHUP이 오면 자식 process 그룹을 죽이고 끝난다.[](source:col-sig) |
| 경로 판별 | 링크를 따라가며 경로가 source 트리 안인지 본다. 링크 순환은 오류다.[](source:cp-in) |

`references/checkmarx-import.md`는 스크립트를 부르기 전에 사람이 지킬 일을 더한다. 신뢰하는 session과 source 밖의 비공개 작업 폴더를 쓰고, 작업 디렉터리를 process 시작 전에 정하며, 비로그인 비대화형 shell을 쓴다. IDE나 build가 checkout 안의 시작 설정을 주면 깨끗한 session이나 저장된 export를 쓴다. 의심스러운 shell을 열어 변수를 지우거나 project 파일을 source하지 않는다.[](source:cx-before)

CxSAST는 가져오기 전에 소유권을 먼저 확인한다. 완료된 scan ID, 정확한 project, 전체 team 경로를 같은 Projects & Scans 행에서 확인하고, 확인이 안 되면 선택한 XML을 요청한다. 이슈 tracker 필터는 원시 XML을 좁히지 않는다.[](source:cx-sast) 두 collector 모두 scan 전체를 가져오므로 일부만 원하면 범위가 정해진 export를 요청한다.[](source:cx-intro)

## local workbench는 가져온 finding을 어떻게 저장하나? {#local-store}

SKILL.md는 이 저장 구현의 helper 이름을 적지 않는다. 플러그인에는 구현과 사용법 문자열이 있다.[](source:hm-ext)

판정 · 호출 주체는 SKILL.md가 부르는 SDK나 CLI일 것으로 추론한다. 실제로 helper를 부르는 구성요소는 확인하지 못했다.[](source:p-local)

아래는 구현을 읽고 확인한 동작이다.

| 항목 | 구현이 하는 일 |
|---|---|
| 입력 | `repository`는 절대 경로여야 하고, `provider`와 `sourceKey`는 비어 있으면 안 된다.[](source:ef-guard)[](source:ef-start) |
| 빈 선택 | finding이 하나도 없으면 import를 만들지 않고 빈 결과를 돌려준다.[](source:ef-start) |
| finding ID | `source_finding_id` 중복이 있으면 거부한다. ID는 `repository`, `provider`, `sourceKey`, `source_finding_id`를 묶은 해시다.[](source:ef-id) |
| 반복 가져오기 | 같은 ID에 evidence와 provenance가 같으면 `unchanged`, 다르면 version을 올려 `updated`, 처음이면 `created`다.[](source:ef-count) |
| import 구성원 | 변하지 않은 finding도 새 import의 구성원에 들어간다. 그래서 import ID가 선택 전체를 가리킨다.[](source:ef-member) |
| 평가 상태 | 저장된 finding의 평가 상태는 항상 `not_assessed`다.[](source:ef-state) |
| 선택이 바뀐 경우 | import ID나 `(id, version)` 목록으로 읽을 때 version이 달라졌거나 없으면 오류로 멈춘다. `ifCurrent`를 주면 오류 대신 빈 결과를 돌려준다.[](source:ef-stale) |
| 게시 영수증 | outcome은 `created`, `updated`, `unchanged`, `private_job` 중 하나다. 해당 finding이 그 version 이상으로 그 repository에 있어야 기록한다.[](source:pr-type)[](source:pr-rec) |

판정 · 이 구현은 SKILL.md가 "source key를 반복 가져오기마다 같게 유지하라"고 한 이유를 보여 준다. source key가 finding ID의 해시에 들어가므로 키가 바뀌면 같은 알림이 새 finding으로 저장되고 이전 finding은 갱신되지 않는다.[](source:ef-id)[](source:p-local) 영수증을 기록할 때 version을 "이상"으로 확인하는 것은 업로드 중 선택이 더 새 version으로 바뀌어도 검토한 version이 이 repository에 있었음을 인정하기 위해서다.[](source:pr-rec)

## 흐름 속 위치는 어디인가? {#position}

이 스킬은 `external-findings` 묶음에서 가져오기와 게시를 맡는 단계다. 전체 흐름은 `codex-security/_group-external-findings`에 있다. 나가는 관계는 R36 넘김과 R37·R38 산출물 호환이다.[](source:rm-pf)

@workflow id=publish-position title="publish-findings의 앞뒤"
| rda | resolve-dependency-alert | security |
| pf | publish-findings | backend |
| ap | attack-path-analysis | backend |
| fx | fix-finding | backend |
| cf | cloud-findings | backend |
| rda > pf | R35 import 요청 | emphasis |
| pf > ap | R36 Continuum | emphasis |
| pf > fx | R37 patch | dashed |
| pf > cf | R38 추론 | dashed |

| 관계 | 종류와 조건 | 전달물 | 상대 쪽 원문 |
|---|---|---|---|
| R35 `resolve-dependency-alert` → 이 스킬 | 넘김(명시-이름). 사용자가 가져오기를 명시적으로 요청할 때만이다. | scanner 알림 보고서 | 알림을 찾아 달라는 요청은 선택된 scanner와 대상에서만 조회한다.[](source:rda-imp) |
| R36 이 스킬 → `attack-path-analysis` | 넘김(명시-이름). AWS Continuum 항목에 한해 선택한 issue의 저장된 `.evidence`를 검증 artifact까지 주라고 한다.[](source:p-cont) | 저장된 `.evidence`, `VALIDATION_EVIDENCE` artifact | `attack-path-analysis`는 Continuum의 `source_data.evidence_artifacts`를 읽는 규칙을 따로 둔다.[](source:ap-cont) |
| R37 이 스킬 → `fix-finding` | 산출물 호환(명시-역할). finding 하나를 `--source-root`와 함께 수집하면 patch가 따라온다.[](source:p-cpatch) | `patches[].patch` | `fix-finding`은 이 patch를 시작 후보로 쓰고 현재 checkout의 hunk와 비교해 유지하거나 고친다.[](source:fx-patch) |
| R38 이 스킬 → `cloud-findings` | 산출물 호환(추론). 게시한 finding을 `cloud-findings`가 읽을 수 있다. 두 스킬이 서로를 이름으로 지목하지는 않는다.[](source:p-pub) | Cloud에 저장된 finding | `cloud-findings`는 imported scanner finding을 읽는 방법(`api_version` `v2`, `source`, `provider`)을 적는다.[](source:cf-imp) |
| R39 `cloud-findings` → 이 스킬 | 참고(명시-역할). `cloud-findings`는 읽기만 하며 "upload results"를 금지한다. 이름은 적지 않는다. | - | 업로드는 이 스킬의 일이다.[](source:cf-ro) |

## 어디까지 읽었고 무엇이 남았나? {#audit}

@facts id=publish-audit
| 완전히 읽은 텍스트 파일 | 11개: `SKILL.md`, `agents/openai.yaml`, `references/checkmarx-import.md`, `references/wiz-import.md`, `scripts/collect_checkmarx.py`, `scripts/collector_paths.py`, `helpers-main.ts`, `external-findings.ts`, `external-finding-publications.ts`, `skills/README.md`, `fix-finding/SKILL.md`[](source:p-full)[](source:p-yaml)[](source:cx-full)[](source:wz-full)[](source:col-full)[](source:cp-full)[](source:hm-full)[](source:ef-full)[](source:pr-full)[](source:rm-full)[](source:fx-full) |
| 줄 범위만 읽은 파일 | 3개. `resolve-dependency-alert/SKILL.md` 10줄, `attack-path-analysis/SKILL.md` 21줄, `cloud-findings/SKILL.md` 3·8·27줄[](source:rda-imp)[](source:ap-cont)[](source:cf-desc)[](source:cf-ro)[](source:cf-imp) |
| 구조·표본만 확인(전부 읽지 않음) | 0개 |
| 바이너리 | 이 스킬 폴더에 없다. |
| 번역본 | 없다. 열지 않았다. |
| 실행 | 없다. 스크립트, CLI, helper, scanner, 외부 URL을 한 번도 부르지 않았다. |

@callout level=open-question title="확인하지 못한 것(부분 분석의 이유)"
스킬이 따르라는 설치된 `@openai/codex-security` 패키지의 `docs/sdk.md`와 GitHub `docs/scanner-imports/*`는 이 저장소에 없고 URL도 열지 않았다. 그래서 `codex-security publish findings`와 `import ...` 명령의 옵션, `prepareStoredFindingsPublication`과 `group.publish`의 동작, review ID가 바뀌는 조건은 SKILL.md의 문장으로만 알 수 있다.
`store-external-findings` 같은 helper를 어느 구성요소가 부르는지, 외부 finding이 쓰는 SQLite 표의 정의(`database.ts`)는 읽지 않았다. 외부 finding 저장·조회·영수증 함수는 읽었다.
launcher가 실행하는 `mcp/helpers.mjs` 번들은 저장소에 없다. scanner별 인증과 API 동작, Cloud의 실제 응답은 이 저장소로는 확인할 수 없다.
`SKILL.md`가 `$(npm root --global)/@openai/codex-security` 안에서 SDK snippet을 실행하라고 하는 것은 이 분석에서 따르지 않았다. 읽기만 했다.

판정 요약 · 폴더 안 모든 파일과 저장소 구현 소스는 읽었지만, 스킬이 기대는 SDK와 CLI가 저장소 밖이라 가져오기와 게시 명령의 실제 동작은 확인하지 못했다. 그래서 부분 분석이다.
