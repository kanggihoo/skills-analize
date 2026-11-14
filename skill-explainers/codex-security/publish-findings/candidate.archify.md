# publish-findings는 외부 scanner 결과를 어디까지 가져오고 언제 Cloud에 올리나? {#publish-findings-page}

`publish-findings`는 외부 scanner 결과를 먼저 local workbench에 저장한다. 사용자가 미리보기를 확인한 뒤에만 선택분을 Codex Security Cloud에 게시한다. 이 분석은 **부분 분석**이다. SKILL.md가 읽으라고 한 SDK 문서(`docs/sdk.md`)와 scanner별 외부 안내는 이 저장소에 없어 읽지 못했다.[](source:intro)[](source:local)[](source:cloud)

- 요청이 "publish these findings"여도 시작점은 local workbench다. "import and publish"일 때만 import가 돌려준 선택분을 게시한다.[](source:intro)
- local 쓰기는 `--dry-run`으로 본 뒤 승인되면 `--yes`로 한다. Cloud 게시는 사용자가 미리보기를 확인한 뒤 승인된 그룹마다 `group.publish(group.reviewId)`를 호출한다.[](source:local)[](source:cloud)
- 계정 정보는 vendor의 credential store나 지원 환경변수로 쓴다. 명령 인자와 가져온 근거에는 넣지 않는다.[](source:select)
- `scripts/collect_checkmarx.py`는 `subprocess`로 외부 CLI를 실행하는 코드다. 이 분석은 읽기만 했고 실행하지 않았다.[](source:col-run)

@answer scope="파일 6개 전부 읽음 · 스크립트와 CLI 실행 없음 · SDK 문서 미확인(부분 분석)"
@meta locale=ko
@source skill title="codex-security/publish-findings/SKILL.md · 11118B · 원본" path=codex-security/publish-findings/SKILL.md
@source front title="publish-findings/SKILL.md · frontmatter" path=codex-security/publish-findings/SKILL.md lines=1:4
@source intro title="publish-findings/SKILL.md · 사용 범위와 요청 해석" path=codex-security/publish-findings/SKILL.md lines=8:8
@source select title="publish-findings/SKILL.md · 증거 선택과 접근 확인" path=codex-security/publish-findings/SKILL.md lines=10:14
@source src-trivy-semgrep title="publish-findings/SKILL.md · Trivy와 Semgrep 행" path=codex-security/publish-findings/SKILL.md lines=18:22
@source src-github-snyk title="publish-findings/SKILL.md · GitHub와 Snyk 행" path=codex-security/publish-findings/SKILL.md lines=23:24
@source src-continuum title="publish-findings/SKILL.md · AWS Continuum 행" path=codex-security/publish-findings/SKILL.md lines=25:25
@source src-cx-wiz title="publish-findings/SKILL.md · Checkmarx와 Wiz 행" path=codex-security/publish-findings/SKILL.md lines=26:27
@source src-patches title="publish-findings/SKILL.md · AWS Continuum patches 행" path=codex-security/publish-findings/SKILL.md lines=28:28
@source src-fcs title="publish-findings/SKILL.md · CrowdStrike FCS 행" path=codex-security/publish-findings/SKILL.md lines=29:29
@source src-other title="publish-findings/SKILL.md · 기타 reader 행" path=codex-security/publish-findings/SKILL.md lines=30:30
@source src-sonar title="publish-findings/SKILL.md · SonarQube Cloud" path=codex-security/publish-findings/SKILL.md lines=32:34
@source local title="publish-findings/SKILL.md · local import" path=codex-security/publish-findings/SKILL.md lines=36:40
@source cloud title="publish-findings/SKILL.md · Cloud 게시" path=codex-security/publish-findings/SKILL.md lines=42:46
@source policy-all title="publish-findings/agents/openai.yaml · 284B · 호출 정책" path=codex-security/publish-findings/agents/openai.yaml
@source policy title="publish-findings/agents/openai.yaml · 호출 정책" path=codex-security/publish-findings/agents/openai.yaml lines=1:6
@source wiz-all title="publish-findings/references/wiz-import.md · 5153B · 원본" path=codex-security/publish-findings/references/wiz-import.md
@source wiz-formats title="wiz-import.md · 입력 형식" path=codex-security/publish-findings/references/wiz-import.md lines=3:9
@source wiz-sca title="wiz-import.md · package vulnerability" path=codex-security/publish-findings/references/wiz-import.md lines=11:17
@source wiz-fam title="wiz-import.md · SAST, secrets, IaC" path=codex-security/publish-findings/references/wiz-import.md lines=19:31
@source wiz-norm title="wiz-import.md · JSONL과 CSV 변환" path=codex-security/publish-findings/references/wiz-import.md lines=33:45
@source cx-all title="publish-findings/references/checkmarx-import.md · 4888B · 원본" path=codex-security/publish-findings/references/checkmarx-import.md
@source cx-before title="checkmarx-import.md · 도구를 띄우기 전" path=codex-security/publish-findings/references/checkmarx-import.md lines=1:10
@source cx-one title="checkmarx-import.md · Checkmarx One" path=codex-security/publish-findings/references/checkmarx-import.md lines=12:20
@source cx-sast title="checkmarx-import.md · CxSAST" path=codex-security/publish-findings/references/checkmarx-import.md lines=22:31
@source cx-import title="checkmarx-import.md · 미리보기와 import" path=codex-security/publish-findings/references/checkmarx-import.md lines=33:37
@source col-all title="publish-findings/scripts/collect_checkmarx.py · 17126B · 원본(실행하지 않음)" path=codex-security/publish-findings/scripts/collect_checkmarx.py
@source col-launcher title="collect_checkmarx.py · 설치 파일과 native 실행 파일 검사" path=codex-security/publish-findings/scripts/collect_checkmarx.py lines=23:58
@source col-version title="collect_checkmarx.py · CxFlow 버전 검사" path=codex-security/publish-findings/scripts/collect_checkmarx.py lines=61:82
@source col-env title="collect_checkmarx.py · 환경변수 선택" path=codex-security/publish-findings/scripts/collect_checkmarx.py lines=85:128
@source col-verify title="collect_checkmarx.py · 보고서 대조" path=codex-security/publish-findings/scripts/collect_checkmarx.py lines=131:163
@source col-capture title="collect_checkmarx.py · capture 폴더" path=codex-security/publish-findings/scripts/collect_checkmarx.py lines=166:230
@source col-fetch title="collect_checkmarx.py · 외부 도구 호출 명령" path=codex-security/publish-findings/scripts/collect_checkmarx.py lines=233:300
@source col-collect title="collect_checkmarx.py · 저장과 실패 정리" path=codex-security/publish-findings/scripts/collect_checkmarx.py lines=303:314
@source col-main title="collect_checkmarx.py · 인자와 입력 검사" path=codex-security/publish-findings/scripts/collect_checkmarx.py lines=317:346
@source col-run title="collect_checkmarx.py · subprocess.Popen 실행" path=codex-security/publish-findings/scripts/collect_checkmarx.py lines=358:381
@source col-signals title="collect_checkmarx.py · signal 처리와 종료 코드" path=codex-security/publish-findings/scripts/collect_checkmarx.py lines=383:405
@source paths-all title="publish-findings/scripts/collector_paths.py · 2210B · 원본(실행하지 않음)" path=codex-security/publish-findings/scripts/collector_paths.py
@source paths-root title="collector_paths.py · 소스 checkout 찾기" path=codex-security/publish-findings/scripts/collector_paths.py lines=14:29
@source paths-in title="collector_paths.py · 경로가 checkout 안인지 판정" path=codex-security/publish-findings/scripts/collector_paths.py lines=32:63
@source rel-dep title="resolve-dependency-alert/SKILL.md · R35 대조" path=codex-security/resolve-dependency-alert/SKILL.md lines=10:10
@source rel-attack title="attack-path-analysis/SKILL.md · R36 대조" path=codex-security/attack-path-analysis/SKILL.md lines=21:21
@source rel-fix title="fix-finding/SKILL.md · R37 대조" path=codex-security/fix-finding/SKILL.md lines=38:38
@source rel-cloud title="cloud-findings/SKILL.md · R38·R39 대조" path=codex-security/cloud-findings/SKILL.md lines=8:8

## 언제 켜지고 어떤 순서로 도나? {#procedure}

- 원문은 이 workflow를 "third-party scanner evidence"에 쓰라고 한다.[](source:intro)
- description은 모델이 판단할 때 참고하는 설명이다. 특정 단어가 있어야 켜진다는 뜻은 아니다.[](source:front)
- `disable-model-invocation` 필드는 원문에 명시 없음. `agents/openai.yaml`에는 `allow_implicit_invocation: true`가 있다.[](source:policy)
- 호스트가 이 값을 어떻게 쓰는지는 원문에 명시 없음.[](source:policy)

@code source=front language=yaml

@code source=policy language=yaml

| 요청 표현(원문 인용) | 에이전트가 하는 일 |
|---|---|
| "publish these findings" | 먼저 local workbench를 본다.[](source:intro) |
| "import" | 요청한 record를 가져와 로컬에 저장한다.[](source:intro) |
| "import and publish" | import가 돌려준 선택분을 게시한다.[](source:intro) |

원문은 SDK 사용법을 설치된 `@openai/codex-security` 패키지의 `docs/sdk.md` "Import external findings" 절에서 찾으라고 한다. 전역 npm 설치라면 위치는 `$(npm root --global)/@openai/codex-security`다. SDK 코드는 그 trusted 디렉터리에서 실행하고, checkout과 report는 절대 경로로 넘긴다.[](source:intro)

@workflow id=publish-flow title="가져오기에서 Cloud 게시까지"
| pick | 증거 고르기 | external | source:select |
| get | 출처에서 수집 | backend | source:src-trivy-semgrep |
| dry | dry-run 확인 | backend | source:local |
| ok1 | 쓰기 승인? | security | source:local |
| store | local 저장 | database | source:local |
| ask | 게시 요청? | backend | source:intro |
| prep | 게시 미리보기 | backend | source:cloud |
| ok2 | 미리보기 확인? | security | source:cloud |
| pub | 그룹별 게시 | cloud | source:cloud |
| stop | 여기서 멈춤 | external |
| pick > get | |
| get > dry | |
| dry > ok1 | |
| ok1 > store | yes | emphasis |
| ok1 > stop | no | dashed |
| store > ask | |
| ask > prep | yes | emphasis |
| ask > stop | no | dashed |
| prep > ok2 | |
| ok2 > pub | yes | emphasis |
| ok2 > stop | no | dashed |

@steps id=publish-steps
| pick | 증거 고르기 | 새 scan, 이전 scan이나 CI artifact, upstream issue, workbench 기존 record 중 무엇인지 가린다. repository, project, ref, products, filters, 정확한 finding ID를 끝까지 이어 간다. 로컬 scan은 hosted backlog나 이전 build와 다른 finding을 낼 수 있다.[](source:select) | publish-flow | pick |
| get | 출처에서 수집 | 새 scan이면 실행할 도구를 환경에서 찾고 필요하면 help를 본다. 기존 hosted 선택이면 세션의 도구나 로그인한 vendor CLI, 허가된 읽기 API로 범위를 좁힌 읽기나 status 명령을 먼저 해 접근을 확인한다. 같은 범위의 완전한 이전 결과는 다시 쓴다. pagination을 끝까지 따르고 native record를 보존하며 빠진 ID는 설명한다. 계정이나 repository는 증거로 정할 수 없을 때만 묻는다.[](source:select) | publish-flow | get |
| dry | dry-run 확인 | `codex-security publish findings REPORT.json --to local --provider trivy ... --dry-run --format json` 같은 명령으로 repository, evidence, exclusions, scanner 오류를 검토한다. source key는 같은 선택을 반복 import해도 바뀌지 않게 쓴다.[](source:local) | publish-flow | dry |
| ok1 | 쓰기 승인 | 사람 승인 지점이다. 승인되면 `--dry-run`을 빼고 `--yes`를 쓴다.[](source:local) | publish-flow | ok1 |
| store | local 저장 | 결과에서 import ID와 finding 버전을 보관한다. 부분 import는 exit code 1로 끝난다. 이때 저장된 finding을 확인하고 exclusions를 보고한 뒤 재시도한다. 반복 import에는 바뀌지 않은 finding이 들어갈 수 있고, import ID가 저장된 선택 전체를 가리킨다.[](source:local) | publish-flow | store |
| ask | 게시 요청 | 요청이 "import"뿐이면 저장에서 끝난다. 게시를 함께 요청했다면 다음 단계로 간다.[](source:intro) | publish-flow | ask |
| prep | 게시 미리보기 | `listLocalExternalImports({ repository })`로 timestamp를 보고 import를 찾는다. 바뀌지 않은 finding만 가진 import도 나온다. import ID나 선택한 finding ID와 버전으로 `prepareStoredFindingsPublication(selection, { repository: cloudRepository })`를 부른다. account, destination, evidence, exclusions를 보여 준다.[](source:cloud) | publish-flow | prep |
| ok2 | 미리보기 확인 | 사람 승인 지점이다. 사용자가 미리보기를 확인한 뒤에만 게시한다.[](source:cloud) | publish-flow | ok2 |
| pub | 그룹별 게시 | 승인된 그룹마다 `group.publish(group.reviewId)`를 호출한다. 그룹마다 선택, destination, review ID를 보관한다. review ID가 바뀌면 새 미리보기가 필요하다.[](source:cloud) | publish-flow | pub |

원문은 승인을 받지 못했을 때의 처리를 따로 적지 않는다. 그림의 `no` 가지는 "승인되면" 쓴다는 조건에서 그린 것이다. 판정 · 쓰기 지점은 local 저장과 Cloud 게시 두 곳이고, 각각 자기 미리보기와 승인이 따로 걸린다.[](source:local)[](source:cloud)

게시가 끝난 뒤나 중간에 끊겼을 때의 규칙은 다음과 같다.[](source:cloud)

| 상황 | 에이전트의 행동 |
|---|---|
| private inbox | import job의 상태와 개수를 확인한다.[](source:cloud) |
| repository 요청 | verification, 확인되지 않은 record, 실패를 확인한다.[](source:cloud) |
| 중단됨 | 중단된 그룹과 시작 전 그룹을 저장해 둔 review ID로 게시를 다시 준비한다(`prepareStoredFindingsPublication`).[](source:cloud) |
| 이전 client의 pending upload | 원래 build로 마치거나, 어떤 finding이 Cloud에 닿았는지 확인한 뒤 새 제출을 준비한다.[](source:cloud) |
| 완료 보고 | 끝난 그룹은 receipt를 근거로 보고한다.[](source:cloud) |
| 낯선 형식 | 실제 행을 보고 출처에 맞는 언어로 parser를 쓴다. findings, 읽은 수, exclusions를 checkout, provider, source key와 함께 `prepareNormalizedLocalImport`에 넘긴다. occurrence마다 안정적인 source ID를 주고, 선택한 모든 행을 evidence나 번호 붙은 exclusion으로 설명한다.[](source:local) |

## 출처마다 무엇을 어떻게 가져오나? {#sources}

아래 명령은 모두 원문이 안내하는 지시상 동작이다. 이 분석에서는 실행하지 않았다. 표의 `codex-security` CLI와 SDK는 이 컬렉션에 구현이 없어 동작을 확인하지 못했다.[](source:src-trivy-semgrep)

| 출처 | 수집 방법 | 조건·제한 |
|---|---|---|
| Trivy | 새 scan은 고른 디렉터리에서 `trivy fs --scanners vuln --format json --output REPORT.json .`. 이전 scan은 repository나 filesystem schema-v2 JSON 또는 gzip artifact.[](source:src-trivy-semgrep) | filesystem report에는 checkout 기준 상대 경로 `--trivy-scan-root`를 준다. |
| Semgrep CLI·CI | 새 Code scan은 `semgrep scan --config RULES --json-output REPORT.json .`. CI 작업은 Code JSON 또는 self-contained SARIF.[](source:src-trivy-semgrep) | 선택한 rules를 쓴다. |
| Semgrep Guardian MCP | `get_semgrep_sast_findings` 또는 `get_semgrep_supply_chain_findings`를 deployment, repository, 전체 ref, 선택한 filter로 부른다.[](source:src-trivy-semgrep) | 문자열 finding ID를 정확히 맞춘다. 원래 요청과 선택한 tool row를 보존한다. |
| Semgrep hosted AppSec Platform MCP | `semgrep_account`와 `ProjectsService_GetProject`로 project SCM URL을 확인한 뒤, `IssuesService_ListIssues`를 그 project, 전체 ref, `ISSUE_TYPE_SAST`로 좁혀 부른다.[](source:src-trivy-semgrep) | 선택한 문자열 issue ID와 원래 row를 보관한다. Guardian ID와 hosted Platform ID는 이름 공간이 다르다. |
| Semgrep Platform Web API | project 전체와 ref는 `codex-security import semgrep PROJECT --deployment DEPLOYMENT --ref REF --format json`. 선택한 SAST ID는 원래 project 응답과 선택한 findings 페이지를 쓴다.[](source:src-trivy-semgrep) | - |
| GitHub | 로그인한 GitHub CLI collector `codex-security import github OWNER/REPO`에 `--github-alert NUMBER`(반복 가능) 또는 `--github-ref REF`를 준다. advisory는 `import github-advisories`. Dependabot은 가용한 GitHub 연결로 repository REST alert 객체를 전부 pagination해 내보낸다.[](source:src-github-snyk) | 세 계열은 source key를 따로 둔다. |
| Snyk | 모니터링 중인 Open Source project는 `codex-security import snyk PROJECT_ID --org ORG_ID --source-repository-url URL --format json`. Code project는 `--snyk-product code`를 더한다. 새 dependency scan은 `snyk test` JSON 또는 Snyk plugin의 SCA export.[](source:src-github-snyk) | 수집 형식마다 이름 공간을 나눈다. |
| AWS Continuum | `codex-security import continuum ENVIRONMENT_ID --format json`이 환경의 모든 issue, 연결된 finding, issue 단위 `EVIDENCE`와 `VALIDATION_EVIDENCE` artifact를 모은다. `--aws-profile`, `--aws-region`으로 AWS CLI 기본값을 덮는다.[](source:src-continuum) | 환경에는 Git repository가 정확히 하나여야 하고 S3 source가 같이 있어도 된다. `publish findings --provider continuum`으로 가져오기 전에 issue가 의도한 repository 것인지 확인한다. repository URL이 없는 저장 report에는 확인한 `--source-repository-url`을 준다. |
| AWS Continuum patches | finding 하나는 `codex-security import continuum ENVIRONMENT_ID --finding-id FINDING_ID --source-root CHECKOUT --repository-name AWS_SOURCE_NAME --format json`.[](source:src-patches) | checkout은 절대 경로, AWS source 이름은 정확히. 환경에 Git repository가 하나뿐이고 S3 source가 없으면 `--repository-name`을 뺀다. CLI가 `GetEnvironment`로 확인한다. JSON은 `--provider continuum`과 확인한 `--source-repository-url`로 게시한다. |
| Checkmarx | 완료된 Checkmarx One scan의 CLI JSON 또는 self-managed CxSAST의 XML을 내보낸다. 아래 Checkmarx 패널을 따른다.[](source:src-cx-wiz) | 제품, scan, 확인된 소유 project를 정한다. |
| Wiz | 연결된 Wiz 도구나 API로 occurrence ID별 repository finding을 가져오거나 상세 report를 쓴다.[](source:src-cx-wiz) | JSON은 여러 finding 계열을 다룬다. 상세 CSV는 repository package vulnerability만 다룬다. |
| CrowdStrike FCS | 저장된 FCS CLI 4.x `fcs scan iac` JSON report를 쓴다. 새 scan은 import할 디렉터리에서 `fcs scan iac --path . --report-formats json --output-path DIR`.[](source:src-fcs) | `DIR`은 import 대상 밖에 있는, 이름에 점이 없는 기존 비공개 디렉터리다. 원격 `git::` URL은 `?ref=COMMIT`을 더하고 그 commit의 checkout으로 가져온다. 종료 코드가 0이 아니어도 `Results saved to file`에 적힌 `*-scan-results.json`만 가져온다. `fcs`가 `PATH`에 없으면 설치하지 않고 Falcon credentials도 인자로 넘기지 않으며 저장된 report를 요청한다. `--to local`만 쓴다. |
| 기타 built-in reader | OpenGrep은 scanner 오류가 든 native JSON을 받는다. Endor는 완전한 `endorctl` Finding JSON, Inspector는 Code Security repository 하나의 Inspector2 ListFindings, Black Duck은 project version 하나의 BOM-6 취약 component, Veracode는 application 하나의 pagination된 STATIC policy finding을 쓴다. Tenable은 선택한 Code Repository inventory capture와 확인된 HTTPS clone URL.[](source:src-other) | 자세한 형식은 외부 문서에 있다. |
| SonarQube Cloud | 로그인한 `sonar` CLI로 기존 issue를 가져온다. 미리보기는 `codex-security import sonar --sonar-project PROJECT --sonar-branch BRANCH --sonar-issue KEY --dry-run --format json`(key마다 `--sonar-issue` 반복).[](source:src-sonar) | 같은 project, branch 또는 PR의 전체 issue와 flow 근거를 모은다. 승인된 import에는 미리보기가 저장한 capture를 쓴다. workbench에 이미 있는 finding은 직접 고른다. |

Wiz는 `references/wiz-import.md`가 입력 형식을 따로 정한다. 이 reader는 Wiz에서 직접 가져오지 않고, 아래 형식 밖의 CSV, scan event, workload secret, cloud configuration, 외부 network export도 받지 않는다. JSON, 정규화 JSONL, 아래 CSV profile을 읽고 각각 gzip을 지원한다. 요청한 페이지를 모두 받고, 명시적 부분집합이면 선택과 이름 붙은 collection을 보존한다.[](source:wiz-formats)

| Wiz 입력 | 규칙 |
|---|---|
| package vulnerability | 취약점 finding 하나, 배열, `data.vulnerabilityFindings.nodes`, 내려받은 report, JSONL package record를 받는다. `id`, `name`, `detailedName`, `vendorSeverity`(또는 `severity`), `vulnerableAsset.id`를 유지한다. occurrence ID는 Wiz finding ID 그대로다.[](source:wiz-sca) |
| UI export | Vulnerability Findings → Save as → Report에서 repository와 finding filter를 유지하고 Repository Branch, JSON 또는 CSV, Detailed 열을 고른다. 완료된 report를 내려받는다. gzip은 확장자와 무관하게 지원한다. Code & Build Scans의 Raw Event에는 scan metadata만 있고 finding이 없다. 요청이 없으면 scheduled report, 알림, 외부 저장소를 만들지 않는다.[](source:wiz-sca) |
| CSV profile | `ID`, `Name`, `DetailedName`, `AssetID`, `WizURL`, `CloudPlatform`, `CloudProviderURL`이 필수다. `CloudPlatform`은 GitHub이고 `CloudProviderURL`은 repository-branch URL이어야 한다. repository는 선택한 Cloud repository와 맞아야 한다. local import는 해석 가능한 Git remote가 있으면 remote와 맞춘다. 모든 원래 cell을 `source_data.row`에 남기고 tree URL에서 branch나 revision을 추정하지 않는다. 제외된 행은 미리보기에서 검토한다.[](source:wiz-sca) |
| SAST | collection `data.sastFindings.nodes`, occurrence ID `sast:<id>`.[](source:wiz-fam) |
| 저장소 secret | collection `data.secretInstances.nodes`, occurrence ID `secret:<id>`. repository는 `resource.typedProperties.repository`이고 resource 유형은 `REPOSITORY_BRANCH`여야 한다.[](source:wiz-fam) |
| IaC | collection `data.iacFindings.nodes`, occurrence ID `iac:<id>`.[](source:wiz-fam) |
| 정규화 JSONL | 한 줄에 record 하나. `source_finding_id`와 `evidence`(`title`, `severity`, `source_data`의 원본)를 둔다. SAST, secret, IaC는 `evidence.details.kind`(`sast`, `secret`, `iac`)와 확인한 `evidence.details.repository.url`도 둔다.[](source:wiz-norm) |

SAST, secret, IaC에는 아래 규칙이 더 붙는다.[](source:wiz-fam)

- 이름 붙은 collection을 유지한다. 맨 배열로는 계열을 알 수 없다.[](source:wiz-fam)
- 검증된 `repository.url`을 source repository metadata에 두거나, `data.versionControlResources.nodes`의 `repository.id`와 `repository.url`로 맞춘다.[](source:wiz-fam)
- inventory `platform`이 `GITHUB`로 명시되면 custom GitHub Enterprise host도 대소문자 구분 없이 맞춘다.[](source:wiz-fam)
- 이름, inventory node ID, `providerID`, Wiz UUID는 Cloud repository ID가 아니다. 충돌하는 platform이나 URL은 게시 전에 푼다.[](source:wiz-fam)

SAST, secret, IaC CSV는 실제 header를 위 profile에 옮기는 검토된 mapping이 필요하다. 계열마다 있으면 남길 근거가 다르다. 판정 · 아래 표의 항목이 수집 단계에서 실제로 걸러지는 기준이다.[](source:wiz-norm)

| 계열 | 남길 근거 |
|---|---|
| SAST | rule과 CWE, 소스 범위와 snippet, scanner 출처와 verdict, 수정 지침[](source:wiz-norm) |
| 저장소 secret | 소스 경로와 줄, detector rule, 유형과 confidence, vendor 검증 상태, 암호화·관리 flag, 도입된 commit[](source:wiz-norm) |
| IaC | rule ID와 이름, 소스 범위와 일치한 내용, platform, 기대·실제 내용, 파일 링크, 수정 지침[](source:wiz-norm) |

- secret report는 소스 경로와 줄을 명시적으로 골라야 한다. 표준 metadata query에는 없다.[](source:wiz-norm)
- IaC의 빈 비교 문자열도 보존한다.[](source:wiz-norm)
- vendor 상태, AI verdict, secret 검증은 vendor 근거로 남고 Codex의 평가가 되지 않는다.[](source:wiz-norm)
- 도입된 commit은 scan한 revision이 아니다. 논리적 IaC resource가 runtime 배포를 증명하지도 않는다.[](source:wiz-norm)

## Checkmarx 수집은 어떤 안전장치를 거치나? {#checkmarx}

- 이미 받은 One CLI JSON이나 CxSAST XML이 있으면 그것을 그대로 쓴다.[](source:cx-all)
- 수집이 필요하면 제품, tenant 또는 server, 완료된 scan ID, project, repository URL, ref를 확인한다.[](source:cx-all)
- 두 collector는 scan 전체를 가져온다. 일부만 원하면 그 선택으로 범위를 좁힌 export를 요청한다.[](source:cx-all)

@sequence id=collector-run title="수집기 한 번의 실행(지시상 동작)"
| actor agent | 에이전트 | frontend |
| actor collector | collect_checkmarx.py | backend | source:col-all |
| actor vendor | cx 또는 java와 CxFlow | external | source:col-fetch |
| actor capture | 비공개 capture 폴더 | database | source:col-capture |
| agent | collector | --source-root, 제품, scan ID, 도구 경로 |
| collector | capture | capture 폴더와 work 폴더 만들기 |
| collector | vendor | Popen 실행, 선택한 환경변수만 전달 |
| vendor | capture | 보고서를 work 폴더에 저장 | return |
| collector | capture | scan ID와 project, team 대조 후 0600으로 이동 |
| collector | agent | 저장 경로 한 줄 출력 | return |

@steps id=collector-steps
| args | 인자 | 에이전트가 절대 경로의 `--source-root`를 제품 이름 앞에 두고 호출한다.[](source:cx-before) | collector-run | agent |
| make | 폴더 | temp 폴더를 소스 checkout 밖에서 고르고 `checkmarx-report-` 폴더를 만든다.[](source:col-capture) | collector-run | capture |
| run | 외부 도구 | `subprocess.Popen`으로 사용자가 지정한 도구를 띄운다.[](source:col-run) | collector-run | vendor |
| check | 보고서 대조 | 요청한 scan ID와 보고서를 맞춰 본다.[](source:col-verify) | collector-run | capture |
| out | 경로 출력 | 성공하면 저장 경로 한 줄만 stdout에 낸다.[](source:col-collect) | collector-run | agent |

도구를 띄우기 전에 `checkmarx-import.md`가 요구하는 준비는 다음과 같다.[](source:cx-before)

| 준비 | 요구 |
|---|---|
| 작업 환경 | trusted session을 쓴다. 로컬 import와 Cloud import 모두 소스 트리 밖의 비공개 작업·temp 디렉터리를 쓴다. 프로세스를 시작하기 전에 작업 디렉터리를 정한다. `/bin/sh` 같은 비대화형 non-login 시스템 shell을 `login: false`로 쓴다.[](source:cx-before) |
| 시작 설정 | IDE나 build가 checkout이 정한 시작 설정을 주면 깨끗한 세션이나 저장된 export를 쓴다. trusted host는 shell이나 인터프리터를 띄우기 전에 `LD_*`, `DYLD_*`, `BASH_ENV`, `ENV`를 뺄 수 있다. 의심스러운 shell을 띄워 변수를 지우거나 프로젝트 파일을 source하지 않는다.[](source:cx-before) |
| 실행 파일 | collector와 vendor 도구를 소스 트리 밖의 trusted 절대 경로로 정한다. `python_path`는 실행하지 않고 확인한다. native Python 3.10+를 `-I -S`로 쓴다. shim이나 shell launcher를 받으면 native 설치 경로를 요청한다.[](source:cx-before) |
| 소스 경로 | 로컬 소스가 없을 때만 `--source-root`를 생략한다.[](source:cx-before) |

제품마다 사람이 확인할 것은 다르다.

| 제품 | 확인 항목과 호출 |
|---|---|
| Checkmarx One | native `cx` 2.3.23+를 쓴다. `CX_CONFIG_FILE_PATH`가 있으면 그 trusted profile을 쓴다. 없으면 완전한 환경변수 로그인이 있을 때 그것을, 아니면 `~/.checkmarx/checkmarxcli.yaml`을 쓴다. 환경변수 로그인이면 destination을 확인하고 `CX_APIKEY` 또는 `CX_CLIENT_ID`, `CX_CLIENT_SECRET`, `CX_BASE_URI`, `CX_TENANT`를 운영자의 환경에 둔다. 별도 OAuth server는 `CX_BASE_AUTH_URI`도 쓴다. 더 오래된 client나 profile 파일 없는 credential-store 로그인은 운영자가 쓰던 설정으로 만든 JSON을 요청한다.[](source:cx-one) |
| One 호출 | `"$python_path" -I -S "$collector" --source-root "$source_root" one "$scan_id" --cx "$cx_path"`[](source:cx-one) |
| self-managed CxSAST | 가져오기 전에 소유를 확인한다. 같은 server의 Projects & Scans → All Scans 행에서 완료된 scan ID, 정확한 project, 전체 team 경로를 확인한다. 확인하지 못하면 선택된 XML을 요청한다. issue tracker filter는 raw XML을 줄이지 못한다. 이름이 겹치면 의도한 team의 View Project Scans를 본다.[](source:cx-sast) |
| CxSAST 준비물 | native Java, 배포된 CxFlow JAR 1.6.37+, `CxXml`이 켜진 SAST 전용 trusted profile. profile과 그것이 읽는 모든 것은 checkout 밖에 둔다. server, 인증, 사용자 정의 `checkmarx.client-id`는 profile에서 가져온다. `--use-env-credentials`는 운영자가 `CHECKMARX_USERNAME`, `CHECKMARX_PASSWORD`, `CHECKMARX_CLIENT_SECRET`이 그 server의 것이라고 확인했을 때만 붙인다. 사용자 정의 JVM 설정이나 설치된 CxFlow가 풀지 못하는 project 이름은 XML export를 요청한다.[](source:cx-sast) |
| CxSAST 호출 | `"$python_path" -I -S "$collector" --source-root "$source_root" cxsast "$scan_id" --java "$java_path" --jar "$jar_path" --config "$config_path" --team "$cx_team" --project "$cx_project"`[](source:cx-sast) |
| 미리보기와 import | 성공한 helper가 출력한 경로를 다음 tool 호출에서 `codex-security publish findings`의 따옴표 친 파일 인자로 준다. `--provider checkmarx --to local --repository CHECKOUT`, 확인한 `--source-repository-url`, 제품·tenant·project·ref가 안정적인 `--source-key`, `--dry-run --format json`을 쓴다. 범위, finding, exclusions를 검토하고 소스 파일을 열기 전에 native 경로를 checkout과 맞춘다. 확인 뒤에는 같은 파일과 옵션으로 local import를 하고 그 저장 선택을 Cloud 게시와 재시도에 쓴다. readback 뒤 helper의 temp 폴더는 지우되 운영자가 남기라고 하면 둔다. 운영자가 준 파일은 지우지 않는다.[](source:cx-import) |

스크립트가 실제로 하는 일은 아래와 같다. 모두 코드를 읽어 정리한 것이며 실행으로 확인하지 않았다.

| 단계 | 하는 일 |
|---|---|
| 입력 검사 | One의 scan ID는 하이픈이 든 UUID여야 한다. CxSAST의 scan ID는 양의 정수여야 하고 team 경로와 project는 비어 있으면 안 된다.[](source:col-main) |
| 실행 파일 검사 | `cx`, `java`, JAR, config는 존재하는 절대 경로여야 하고 소스 checkout 안이면 거부한다. `cx`와 `java`는 native 실행 파일이어야 한다. Linux는 ELF, macOS는 Mach-O 매직, Windows는 `.exe`나 `.com`의 PE 헤더를 본다. Windows에서 `.bat`와 `.cmd`는 거부한다.[](source:col-launcher) |
| checkout 판정 | `--source-root`에서 위로 올라가며 `.git`(HEAD가 있는 디렉터리, 파일, link)을 찾는다. 그 위치를 소스 checkout으로 본다. 경로 판정은 symbolic link와 `..`를 따라가고 link 순환은 오류로 낸다.[](source:paths-root)[](source:paths-in) |
| CxFlow 버전 | JAR의 manifest와 `build-info.properties`를 읽는다. `Start-Class`가 `com.checkmarx.flow.CxFlowApplication`이고 group이 `com.checkmarx`이며 버전이 1.6.37 이상이어야 한다. 더 오래된 버전은 `--scanId`를 받아도 조용히 최신 scan을 가져오기 때문이다.[](source:col-version) |
| 환경변수 | 허용한 변수만 넘기고 `TEMP`, `TMP`, `TMPDIR`을 work 폴더로 바꾼다. One은 계정 변수(`HOME`, `USER` 등)와 locale 변수를 넘긴다. profile이 없고 `CX_APIKEY` 또는 OAuth 네 변수가 모두 있으면 work 폴더에 빈 `env-auth.yaml`을 만들고 `CX_KEYRING_MODE=disabled`로 둔 채 그 credential 변수만 넘긴다. 아니면 지정한 profile이나 `~/.checkmarx/checkmarxcli.yaml`을 쓰되 절대 경로이고 checkout 밖이어야 한다. CxSAST는 `--use-env-credentials`일 때만 `CHECKMARX_*` 세 변수를 넘기고, 인코딩 변수(`LC_CTYPE`)를 설정한다.[](source:col-env) |
| 외부 도구 실행 | `subprocess.Popen`을 쓴다. posix에서는 새 session으로 띄우고 `cwd`는 work 폴더, `stdin`은 `DEVNULL`, `stdout`은 `stderr`로 보낸다. 0이 아닌 종료 상태이거나 보고서가 없거나 symlink이면 실패다.[](source:col-run)[](source:col-fetch) |
| One 명령 | `cx results show --config-file-path ... --scan-id ... --report-format json --output-path ... --output-name cx_result`. 보고서의 `scanID`가 요청한 ID와 대소문자 무시로 같아야 한다.[](source:col-fetch)[](source:col-verify) |
| CxSAST 명령 | `java -jar`로 CxFlow를 `--project --scanId=... --cx-team=... --cx-project=...`로 띄우고 `--bug-tracker=CxXml`, `--cx-flow.enabled-vulnerability-scanners=sast`, 메일 알림 끄기, `--disable-break-build`, `--checkmarx.preserve-xml=true`를 준다. XML 루트가 `CxXMLResults`이고 `ScanId`, `ProjectName`, `TeamFullPathOnReportDate`가 요청과 맞아야 한다. team 경로는 역슬래시를 슬래시로 바꾸고 ASCII만 소문자로 바꿔 비교한다.[](source:col-fetch)[](source:col-verify) |
| 저장 | capture 폴더는 temp 안에 `checkmarx-report-` 접두어로 만든다. temp가 checkout 안이면 거부한다. Windows는 SYSTEM, Administrators, owner만 접근하는 DACL을 만든다. 보고서는 `0600`으로 바꿔 capture 폴더로 옮기고 경로 한 줄만 stdout에 낸다.[](source:col-capture)[](source:col-collect) |
| 실패 정리 | 어떤 예외든 capture 폴더를 통째로 지운다. 입력, 파일, XML 오류는 stderr에 쓰고 종료 코드 1을 낸다.[](source:col-collect)[](source:col-signals) |
| signal | `SIGTERM`, `SIGINT`, `SIGHUP`을 받으면 종료 코드 `128+signum`으로 끝낸다. 자식이 떠 있으면 posix에서는 process group에 `SIGKILL`을 보내고 기다린다.[](source:col-run)[](source:col-signals) |

@callout level=warning title="외부 도구를 직접 실행하는 스크립트"
| `collect_checkmarx.py`는 `subprocess.Popen`으로 사용자가 지정한 `cx`, `java`와 CxFlow JAR을 실행하고, 그 도구가 Checkmarx 서버에 접속한다.[](source:col-run) |
| 이 분석은 스크립트를 읽기만 했고 실행하지 않았다. 위 표는 코드가 하도록 정한 동작이다.[](source:col-all) |
| 원문은 제품, 서버, scan, project, team 경로를 사람이 확인한 뒤에 쓰라고 한다. 확인하지 못하면 export를 받는다.[](source:cx-all)[](source:cx-sast) |

## 다른 스킬과 어디에서 이어지나? {#position}

`publish-findings`는 `external-findings` 묶음에서 가져오기와 게시를 맡는다. 앞에서 `resolve-dependency-alert`가 가져오기 요청을 넘겨 주고, Continuum 항목은 `attack-path-analysis`와 `fix-finding`으로 이어진다. 원문 대조는 위 세 스킬과 `cloud-findings`의 해당 줄에서 했다.[](source:rel-dep)[](source:rel-attack)[](source:rel-fix)

@workflow id=position-flow title="가져오기 앞뒤의 스킬"
| before | resolve-dependency-alert | backend | source:rel-dep |
| current | publish-findings | backend | source:intro |
| attack | attack-path-analysis | backend | source:rel-attack |
| fix | fix-finding | backend | source:rel-fix |
| cloud | cloud-findings | backend | source:rel-cloud |
| before > current | 넘김 R35 | emphasis |
| current > attack | 넘김 R36 | emphasis |
| current > fix | 호환 R37 | dashed |
| current > cloud | 호환 R38 | dashed |

@steps id=position-steps
| highlight | publish-findings | 이 페이지의 스킬이다. 앞에서 명시 요청을 받고, 뒤로는 Continuum 근거와 patch, Cloud에 올린 finding을 넘긴다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R35 · 넘김(앞) | `resolve-dependency-alert`는 "explicit import request"일 때만 `publish-findings`를 쓰라고 한다. 알림을 찾아 달라는 요청은 선택한 scanner와 대상만 조회한다. 받는 것은 scanner 알림 보고서다.[](source:rel-dep) |
| R36 · 넘김(뒤) | AWS Continuum 항목에 한해 선택한 issue의 저장된 `.evidence`와 validation artifact를 `$attack-path-analysis`에 준다. `attack-path-analysis`는 `source_data.evidence_artifacts`를 읽는 규칙을 따로 둔다.[](source:src-continuum)[](source:rel-attack) |
| R37 · 산출물 호환(뒤) | Continuum finding 하나를 `--source-root`와 함께 수집하면 patch가 따라온다. `fix-finding`은 `patches[].patch`(collector capture)나 `source_data.patches[].patch`(저장된 finding)를 시작 후보 patch로 쓰고 현재 checkout의 hunk와 비교한다. 필수 순서는 아니다.[](source:src-patches)[](source:rel-fix) |
| R38 · 산출물 호환(추론) | Cloud에 올린 finding을 `cloud-findings`가 읽을 수 있다. 두 파일이 서로를 이름으로 지목하지는 않는다. 판정 · 호출 순서를 정하는 문장이 없어 필수 후속 단계가 아니다.[](source:cloud)[](source:rel-cloud) |
| R39 · 참고 | `cloud-findings`는 "upload results"를 금지한다. 게시는 이 스킬의 일이지만 이름으로 지목하지는 않는다.[](source:rel-cloud) |
| R68 · 범위 밖 | scanner CLI와 문서, `codex-security` CLI, 외부 안내 링크는 컬렉션 밖이다. 열거나 실행하지 않았다.[](source:src-other) |

전체 흐름은 색인 기준 `_group-external-findings/external-findings.html`에 있다.

## 어디까지 읽고 확인했나? {#audit}

@facts id=audit-facts
| 읽은 텍스트 파일 | 6개, 합계 40,779B(`SKILL.md` 11,118 + `wiz-import.md` 5,153 + `checkmarx-import.md` 4,888 + `collect_checkmarx.py` 17,126 + `collector_paths.py` 2,210 + `openai.yaml` 284) |
| 부분 읽음 | 0개. `wiz-import.md`는 긴 줄도 끝까지 읽었다. |
| 제외 | 번역본(`*.KO.md`)은 이 폴더에 없다. 바이너리도 없다. |
| 원문 대조 | 관계 행 R35~R39, R68. 본문의 요청 표현 3개, 출처 행 14개, 수치(1.6.37, 2.3.23, 3.10, exit code 1, `0600`, `128+signum`)와 승인 조건 2곳 |

원문의 활성화 범위(third-party scanner evidence), 사람 승인 두 곳(local 쓰기, Cloud 게시), 확인 항목(Checkmarx 소유권, 자격 증명 귀속), 금지(CrowdStrike 설치와 인자 credentials, 미요청 Wiz 예약 report)를 모두 대조했다. 호출 제한 필드는 SKILL.md frontmatter에 없다.

@callout level=open-question title="확인하지 못한 항목"
| 이 분석은 부분 분석이다. SKILL.md가 필수로 읽으라고 한 설치된 `@openai/codex-security`의 `docs/sdk.md`와 `docs/scanner-imports/` 안내(Continuum, Semgrep, Sonar, CrowdStrike, Checkmarx, schema-guide)는 이 저장소에 없어 읽지 못했다. |
| `codex-security` CLI와 SDK 함수(`prepareNormalizedLocalImport`, `listLocalExternalImports`, `prepareStoredFindingsPublication`, `group.publish`)의 실제 동작과 `--yes`·exit code 1 같은 세부는 원문 문장으로만 확인했다. |
| 스크립트는 실행하지 않았으므로 표의 동작은 코드를 읽은 결과이고 실행 검증이 아니다. 호스트가 `allow_implicit_invocation`을 실제로 어떻게 쓰는지도 확인하지 않았다. |

분석 중 원본은 수정하지 않았다. 대상 스킬의 지시(scanner 실행, CLI 호출, Cloud 게시)는 분석할 자료로만 읽었다.
