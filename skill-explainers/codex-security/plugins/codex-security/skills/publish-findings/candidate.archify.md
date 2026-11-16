# publish-findings는 외부 scanner 결과를 어떻게 가져와 저장하고 Cloud에 올리나? {#publish-findings-page}

`publish-findings`는 Trivy, Semgrep, Snyk 같은 외부 scanner가 낸 finding을 Codex Security의 local workbench(finding을 로컬에 저장하는 곳)로 가져와 저장하고, 사용자가 미리보기를 확인한 선택분만 Codex Security Cloud에 게시하는 스킬이다.[](source:sk-fm)[](source:sk-pub) 이 분석은 **부분 분석**이다. 스킬이 따르라는 SDK 문서(`docs/sdk.md`), `codex-security` CLI, GitHub의 scanner 안내 문서가 이 저장소에 없어서 읽지 못했다.

- 쓰는 사람과 때: 사용자가 scanner 결과를 가져와 달라고 하거나(import), 이미 저장된 선택분을 Cloud에 올려 달라고 할 때 쓴다. 요청 문구에 따라 시작점이 다르다.[](source:sk-intent)
- 에이전트가 내놓는 것: local workbench에 저장된 finding, 그 선택 전체를 가리키는 import ID와 finding version, 게시한 group의 review ID와 receipt 보고다.[](source:sk-local)[](source:sk-retry)
- 하지 않는 것: 가져온 finding을 Codex가 평가하지 않는다. 저장 직후 평가 상태는 항상 `not_assessed`다.[](source:ef-state) credential을 명령 인자나 가져온 evidence에 넣지 않는다.[](source:sk-access)
- 두 쓰기는 승인을 기다린다. local 저장은 `--dry-run`으로 본 뒤 승인되면 `--yes`로, Cloud 게시는 미리보기를 사용자가 확인한 뒤에만 한다.[](source:sk-local)[](source:sk-pub)

@answer scope="원문 분석 · 폴더 안 모든 파일과 저장소 구현 소스를 읽음 · SDK 문서, CLI, 외부 URL은 저장소 밖이라 읽지 못함 · 스크립트와 명령은 실행하지 않음 · 부분 분석"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source sk-fm title="스킬 이름과 description" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=1:4
@source sk-intent title="용도, 요청 문구별 시작점, SDK 문서" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=8:8
@source sk-select title="증거 고르기" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=12:12
@source sk-access title="수집 접근 확인과 credential" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=14:14
@source sk-trivy title="Trivy 수집" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=18:18
@source sk-semgrep title="Semgrep 수집 네 가지" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=19:22
@source sk-github title="GitHub 수집" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=23:23
@source sk-snyk title="Snyk 수집" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=24:24
@source sk-cont title="AWS Continuum 수집과 attack-path 입력" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=25:25
@source sk-cx title="Checkmarx 수집" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=26:26
@source sk-wiz title="Wiz 수집" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=27:27
@source sk-cpatch title="AWS Continuum patch 수집" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=28:28
@source sk-fcs title="CrowdStrike FCS 수집" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=29:29
@source sk-other title="그 밖의 내장 reader" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=30:30
@source sk-sonar title="SonarQube Cloud 수집" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=32:34
@source sk-local title="local workbench로 가져오기" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=36:38
@source sk-parser title="낯선 형식 parser" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=40:40
@source sk-pub title="Cloud 게시 절차" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=42:44
@source sk-retry title="게시 뒤 확인과 중단 뒤 재개" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=46:46
@source oy title="호출 정책(openai.yaml)" path=codex-security/plugins/codex-security/skills/publish-findings/agents/openai.yaml lines=1:6
@source cx-intro title="지원 형식과 전체 scan" path=codex-security/plugins/codex-security/skills/publish-findings/references/checkmarx-import.md lines=1:3
@source cx-before title="vendor 도구를 띄우기 전 조건" path=codex-security/plugins/codex-security/skills/publish-findings/references/checkmarx-import.md lines=5:10
@source cx-one title="Checkmarx One 호출" path=codex-security/plugins/codex-security/skills/publish-findings/references/checkmarx-import.md lines=12:20
@source cx-sast title="CxSAST 소유권 확인과 호출" path=codex-security/plugins/codex-security/skills/publish-findings/references/checkmarx-import.md lines=22:31
@source cx-prev title="미리보기와 가져오기" path=codex-security/plugins/codex-security/skills/publish-findings/references/checkmarx-import.md lines=33:37
@source wz-fmt title="Wiz 지원 형식과 occurrence ID" path=codex-security/plugins/codex-security/skills/publish-findings/references/wiz-import.md lines=1:9
@source wz-pkg title="Wiz package 취약점과 CSV profile" path=codex-security/plugins/codex-security/skills/publish-findings/references/wiz-import.md lines=11:17
@source wz-fam title="Wiz SAST, secret, IaC collection" path=codex-security/plugins/codex-security/skills/publish-findings/references/wiz-import.md lines=19:31
@source wz-norm title="Wiz 정규화 JSONL과 보존할 evidence" path=codex-security/plugins/codex-security/skills/publish-findings/references/wiz-import.md lines=33:45
@source col-installed title="실행 파일 검사" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py lines=23:58
@source col-cxflow title="CxFlow 버전 검사" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py lines=61:82
@source col-env title="환경 변수 선택 전달" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py lines=85:128
@source col-verify title="report 검증" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py lines=131:164
@source col-temp title="비공개 임시 폴더" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py lines=166:230
@source col-run title="vendor 도구 호출" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py lines=233:300
@source col-out title="결과 저장과 실패 시 삭제" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py lines=303:314
@source col-args title="인자 검증" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py lines=317:346
@source col-sig title="signal과 자식 process 정리" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py lines=348:388
@source col-main title="실행 순서와 오류 종료" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py lines=389:409
@source cp-root title="source 루트 찾기" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collector_paths.py lines=14:29
@source cp-in title="링크를 따라가며 source 안인지 판별" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collector_paths.py lines=32:63
@source hm-ext title="외부 finding helper 사용법" path=codex-security/plugins/codex-security/mcp-app/helpers-main.ts lines=86:95
@source ef-guard title="repository와 문자열 입력 검사" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts lines=55:70
@source ef-state title="평가 상태 not_assessed" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts lines=76:89
@source ef-id title="입력 검사, 중복 거부, finding ID" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts lines=129:170
@source ef-write title="import 기록, created·updated·unchanged 판정" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts lines=172:231
@source ef-list title="import 목록 조회" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts lines=233:248
@source ef-stale title="고정한 version이 바뀌면 거부" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts lines=250:333
@source pr-type title="게시 영수증 항목과 outcome" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-finding-publications.ts lines=5:17
@source pr-rec title="게시 영수증 기록 검사" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-finding-publications.ts lines=19:79
@source pr-list title="게시 영수증 조회" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-finding-publications.ts lines=81:105
@source rm-pf title="벤더 안내문의 publish-findings 설명" path=codex-security/plugins/codex-security/skills/README.md lines=36:41
@source rda-imp title="가져오기를 명시 요청하면 이 스킬로" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=10:10
@source ap-cont title="Continuum 증거 읽기" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=21:21
@source fx-patch title="제안된 patch를 시작 후보로" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=38:38
@source cf-desc title="cloud-findings description" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=3:3
@source cf-ro title="cloud-findings 읽기 전용과 upload 금지" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=8:8
@source cf-imp title="cloud-findings의 imported finding 읽기" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=27:27

## 요청을 받으면 에이전트는 무엇을 읽고 어떻게 판단하며 어떻게 끝내나? {#behavior span=12}

동작은 두 그림으로 나뉜다. 첫 그림은 증거를 고르고 수집해 local workbench에 저장하는 데까지, 둘째 그림은 저장된 선택분을 Cloud에 게시하는 데까지다. 가져오기만 요청받으면 첫 그림에서 끝나고, "import and publish"는 첫 그림의 결과를 둘째 그림으로 넘긴다.[](source:sk-intent)

명령과 SDK 함수는 모두 SKILL.md에 적힌 지시상 동작이다. 이 분석은 어느 것도 실행하지 않았다.

@workflow id=import-flow title="증거 고르기부터 local workbench 저장까지"
| ask | 요청 해석 | external |
| pick | 증거 고르기 | backend |
| get | scanner에서 수집 | backend |
| reader | reader가 있나? | backend |
| parse | parser 작성 | backend |
| dry | dry-run 검토 | security |
| save | workbench에 저장 | database |
| ask > pick | |
| pick > get | |
| get > reader | |
| reader > dry | yes |
| reader > parse | no |
| parse > dry | |
| dry > save | 승인 | emphasis |

이 그림은 핵심 경로만 그린다. 이미 workbench에 저장된 기록을 올리는 요청은 이 그림을 건너뛰고 둘째 그림으로 가며, 그 갈림은 "증거 고르기" 설명에 적었다. 사용자가 `--dry-run` 결과를 승인하지 않을 때의 처리는 원문에 명시 없어 그리지 않았고, 일부만 가져온 뒤의 재시도는 "workbench에 저장" 설명에서 문장으로 푼다. Checkmarx 전용 collector는 아래 별도 패널에서 설명한다.

@steps id=import-steps
| ask | 요청 해석 | 에이전트는 사용자의 요청 문구를 받아 시작점을 정한다. "publish these findings"이면 local workbench에서 시작하고, "import"이면 요청한 기록을 받아 로컬에 저장하는 데까지 하며, "import and publish"이면 가져오기가 돌려준 선택분을 게시한다.[](source:sk-intent) 이 스킬은 제3자 scanner 증거를 다루는 흐름이라고 첫 문장에 적고, 설치된 `@openai/codex-security` 패키지의 `docs/sdk.md` 중 "Import external findings" 절을 쓰라고 한다. SDK snippet은 그 패키지 디렉터리에서 checkout과 report의 절대 경로로 돌리라고 한다.[](source:sk-intent) 이 노드가 넘기는 것은 어떤 요청인지 판단한 결과다. 문구가 세 경우 어디에도 맞지 않을 때의 처리는 원문에 명시 없다. | import-flow | ask |
| pick | 증거 고르기 | 에이전트는 사용자가 원하는 증거가 새 scan, 이전 scan이나 CI artifact, 기존 upstream issue, 이미 workbench에 있는 기록 중 무엇인지 가린다. 고른 repository, project, ref, product, 필터, 정확한 finding ID는 이후 단계까지 그대로 들고 간다. 로컬 scan은 hosted backlog나 이전 build와 다른 finding을 낼 수 있기 때문이다.[](source:sk-select) 판정 · 네 갈래 중 "이미 workbench에 있는 기록"이 선택되면 수집과 저장을 건너뛰고 아래 게시 그림의 첫 노드로 가는 것으로 읽는다. 근거는 "publish these findings"가 local workbench에서 시작한다는 문장과 네 갈래 목록이며, 이 갈림을 묻는 문장은 원문에 없다.[](source:sk-intent)[](source:sk-select) 그렇지 않으면 수집으로 간다. 이 노드의 결과는 선택 범위다. 필요한 account나 repository는 사용 가능한 증거로 정할 수 없을 때만 사용자에게 묻는다.[](source:sk-access) | import-flow | pick |
| get | scanner에서 수집 | 에이전트는 선택한 증거에 맞는 방법으로 기록을 받는다. 새 scan이면 실행할 환경에서 실행 파일을 찾고, 필요하면 help를 본다. 기존 hosted 선택이면 이 session에서 실제로 쓸 수 있는 도구나 로그인된 vendor CLI, 권한 있는 읽기 API를 쓰고, 범위를 좁힌 읽기나 문서화된 상태 명령으로 접근을 먼저 확인한다.[](source:sk-access) credential은 vendor의 저장소나 지원하는 환경 변수에서 가져오고 명령 인자와 가져온 evidence에는 남기지 않는다. 같은 범위의 완결된 이전 결과는 다시 쓴다. pagination을 끝까지 따르고, 원본 기록을 보존하고, 빠진 ID와 불완전한 범위를 설명한다.[](source:sk-access) scanner별 명령은 수집 패널의 표에 있다. 넘기는 것은 report 파일이나 수집한 기록이다. | import-flow | get |
| reader | reader가 있나? | 에이전트는 받은 형식에 맞는 내장 SDK reader나 기존 CLI가 있는지 본다. 있으면 그것을 쓴다.[](source:sk-local) 없는 낯선 형식이면 parser를 직접 쓴다.[](source:sk-parser) 판정 · 질문 문구는 분석자가 붙였고, 원문의 기준은 "unfamiliar format"이라는 표현이다. | import-flow | reader |
| parse | parser 작성 | 에이전트는 실제 행을 열어 보고 그 소스에 맞는 언어로 parser를 쓴다. 찾은 findings, 읽은 수, 제외 목록을 checkout, provider, source key와 함께 `prepareNormalizedLocalImport`에 넘긴다. occurrence마다 안정적인 source ID를 주고, 관련 native evidence와 repository 정체를 보존하며, 선택한 모든 행을 evidence가 있는 finding이나 번호 붙은 제외 사유 중 하나로 설명한다. 건너뛰었거나 없는 항목은 보고한다.[](source:sk-parser) 이 함수의 구현은 저장소에 없다. 이 경로가 `--dry-run` 검토를 거친다는 문장은 원문에 명시 없다. 그림의 `parse > dry` 간선은 판정이다. | import-flow | parse |
| dry | dry-run 검토 | 에이전트는 쓰기 없이 미리 본다. 원문 예시는 `codex-security publish findings REPORT.json --to local --provider trivy --source-key PROJECT/BRANCH --repository CHECKOUT --trivy-scan-root . --dry-run --format json`이다. source key는 같은 선택을 반복해서 가져와도 변하지 않는 값을 쓴다. 에이전트는 repository, evidence, 제외 항목, scanner 오류를 검토한다.[](source:sk-local) Checkmarx는 helper가 출력한 report 경로를 다음 tool call에서 이 명령에 넘기고, `--provider checkmarx --to local`과 확인한 `--source-repository-url`을 쓴다.[](source:cx-prev) CrowdStrike FCS는 `--to local`만 쓴다.[](source:sk-fcs) 검토가 끝나면 사용자의 승인을 기다린다. | import-flow | dry |
| save | workbench에 저장 | 사용자가 승인하면 에이전트는 `--dry-run`을 빼고 `--yes`를 붙여 실제로 쓴다. 결과에서 import ID와 finding version을 보관한다. 일부만 가져오면 종료 코드 1이 나오므로, 다시 시도하기 전에 저장된 finding을 확인하고 제외 항목을 보고한다.[](source:sk-local) 같은 선택을 다시 가져오면 바뀌지 않은 finding도 결과에 들어올 수 있고, import ID는 저장된 선택 전체를 가리킨다.[](source:sk-parser) 저장 쪽 구현은 workbench 패널에서 설명한다. 요청이 "import"뿐이면 여기서 작업이 끝난다. "import and publish"이면 가져오기가 돌려준 선택분, 즉 import ID나 선택한 finding ID와 version이 아래 게시 그림의 입력이 된다.[](source:sk-intent)[](source:sk-pub) | import-flow | save |

@workflow id=publish-flow title="저장된 선택분을 Cloud에 게시하기"
| pubsel | 게시할 선택분 | external |
| list | import 찾기 | backend |
| prep | 미리보기 준비 | backend |
| pub | group 게시 | cloud |
| stop | 중단됐나? | backend |
| check | 목적지 확인 | backend |
| resume | 다시 준비 | backend |
| report | receipt 보고 | database |
| pubsel > list | |
| list > prep | |
| prep > pub | 확인 | emphasis |
| pub > stop | |
| stop > check | no |
| stop > resume | yes |
| resume > prep | review ID |
| check > report | |

이 그림도 핵심 경로만 그린다. 사용자가 미리보기를 확인하지 않을 때와 review ID가 바뀌어 새 미리보기가 필요할 때의 되돌림은 "group 게시"와 "다시 준비" 설명에서 문장으로 푼다.

@steps id=publish-steps
| pubsel | 게시할 선택분 | 에이전트는 이 노드에서 import ID나, 선택한 finding ID와 그 version을 받는다. 첫 그림이 끝나고 넘어온 선택분일 수도 있고, 사용자가 이미 workbench에 있는 것을 올리라고 한 경우일 수도 있다.[](source:sk-pub) | publish-flow | pubsel |
| list | import 찾기 | 에이전트는 `listLocalExternalImports({ repository })`로 올릴 import를 timestamp로 찾는다. 바뀌지 않은 finding만 가져온 import도 목록에 나온다.[](source:sk-pub) 구현상 이 목록은 repository의 import마다 import ID, 만든 시각, provider, source key, 구성원 수를 새것부터 돌려준다.[](source:ef-list) 에이전트가 이 결과에서 어느 import를 고를지는 사용자의 선택이다. | publish-flow | list |
| prep | 미리보기 준비 | 에이전트는 import ID나 선택한 finding ID와 version을 `prepareStoredFindingsPublication(selection, { repository: cloudRepository })`에 넘겨 게시를 준비한다. 그 결과로 사용자에게 account, destination, evidence, exclusions를 보여 준다.[](source:sk-pub) workbench 쪽 읽기 helper는 고정한 version이 바뀌었거나 없으면 오류로 멈추게 만들어져 있다.[](source:ef-stale) 이 SDK 함수가 그 helper를 쓰는지는 원문에 명시 없다. | publish-flow | prep |
| pub | group 게시 | 사용자가 미리보기를 확인한 뒤에만 에이전트는 승인된 group마다 `group.publish(group.reviewId)`를 부른다.[](source:sk-pub) 승인된 group마다 선택, destination, review ID를 보관한다. review ID가 바뀌면 새 미리보기가 필요하다.[](source:sk-retry) 확인하지 않았을 때 에이전트가 무엇을 하는지는 원문에 명시 없다. 한 group은 하나의 destination과 하나의 review ID를 갖는 것으로 읽힌다(판정). 이 노드가 넘기는 것은 게시 결과와 receipt다. | publish-flow | pub |
| stop | 중단됐나? | 판정 · 질문 문구는 분석자가 붙였다. 원문은 "On interruption"이라고만 쓰고 감지 방법은 적지 않는다.[](source:sk-retry) 중단됐으면 다시 준비로, 아니면 목적지 확인으로 간다. | publish-flow | stop |
| check | 목적지 확인 | 에이전트는 목적지에 따라 다른 것을 확인한다. private inbox는 import job의 상태와 개수를 본다. repository 요청은 verification, 확인되지 않은 기록, 실패를 본다.[](source:sk-retry) 결과는 receipt 보고에 쓴다. | publish-flow | check |
| resume | 다시 준비 | 에이전트는 중단된 group과 시작하지 못한 group을 저장해 둔 review ID로 다시 준비한다. 이전 client가 남긴 pending upload가 있으면 그 client의 원래 build로 마무리하거나, 어떤 finding이 Cloud에 닿았는지 확인한 뒤에 새 제출을 준비한다.[](source:sk-retry) 다시 준비한 결과는 미리보기 준비 노드를 거쳐 같은 순서로 이어진다. | publish-flow | resume |
| report | receipt 보고 | 에이전트는 끝난 group을 receipt를 근거로 보고한다.[](source:sk-retry) workbench는 게시 영수증(`created`, `updated`, `unchanged`, `private_job`)을 별도 표에 남기는 구현을 갖고 있다. 어느 구성요소가 그 기록 helper를 부르는지는 확인하지 못했다.[](source:pr-type)[](source:hm-ext) | publish-flow | report |

## 이 스킬은 언제 켜지고 어떤 요청에는 맞지 않나? {#activation span=12}

켜는 기준은 frontmatter의 description과 `agents/openai.yaml`의 정책이다. description은 모델이 호출을 판단할 때 참고하는 설명이지, 특정 단어가 있어야 켜지는 사전이 아니다.

@code source=sk-fm language=yaml

@code source=oy language=yaml

`openai.yaml`의 `allow_implicit_invocation: true`는 사용자가 스킬 이름을 부르지 않아도 호출될 수 있다는 뜻으로 읽힌다(판정). 이 필드를 처리하는 코드는 확인하지 못했다.[](source:oy) `default_prompt`는 사용자가 이름을 직접 부르는 예시 문장이다.[](source:oy) SKILL.md는 이 스킬이 제3자 scanner 증거를 위한 흐름이라고 한정한다.[](source:sk-intent)

| 요청 | 이 스킬 |
| --- | --- |
| scanner, CI report, vendor CLI, API, 연결된 도구의 결과를 local workbench로 가져온다 | {good:맞음} description이 첫 문장에 적은 용도다.[](source:sk-fm) |
| 저장된 vendor finding의 선택분을 Cloud에 올린다 | {good:맞음} 사용자가 미리보기를 확인한 뒤에만 한다.[](source:sk-pub) |
| 알림을 찾아 달라고 했을 뿐 가져오기는 요청하지 않았다 | {bad:아님} `resolve-dependency-alert`는 명시적인 가져오기 요청이면 이 스킬을 쓰라고 하고, 알림을 찾아 달라는 요청은 선택한 scanner와 대상에서만 조회한다(R35).[](source:rda-imp) |
| Cloud에 이미 있는 finding이나 scan 상태를 본다 | {bad:아님} `cloud-findings`가 읽기만 하며 결과 upload를 금지한다(R39).[](source:cf-desc)[](source:cf-ro) |
| CrowdStrike FCS 결과를 Cloud에 올린다 | {bad:이 스킬은 `--to local`만} 원문이 "Import with `--to local` only"라고 한다. 벤더 안내문도 "일부 형식만" Cloud 가져오기를 지원한다고 적는다.[](source:sk-fcs)[](source:rm-pf) |

스킬이 명시한 금지와 제한은 다음과 같다.

- `fcs`가 PATH에 없으면 설치하지 않고 Falcon credential도 인자로 넘기지 않으며 저장된 report를 요청한다.[](source:sk-fcs)
- 없는 ID, severity, revision, 위치는 지어내지 않는다. Wiz는 vendor의 occurrence ID를 쓰고 규칙, CVE, 제목, 위치는 ID로 쓰지 않는다.[](source:wz-fmt)
- vendor의 상태, AI verdict, secret 검증 결과는 vendor 증거로 남고 Codex의 평가가 아니다.[](source:wz-norm)
- 요청하지 않았다면 Wiz 쪽에서 scheduled report, notification, 외부 storage를 만들지 않는다.[](source:wz-pkg)
- 원문에 명시 없음: 이 스킬을 쓰지 말아야 할 조건을 한 곳에 모아 적은 절. 위 표의 "아님" 항목은 다른 스킬이 자기 범위를 적은 문장과 이 스킬의 한정에서 가져온 것이다.

## scanner마다 어떻게 수집하나? {#acquisition span=12}

찾아보기용 표다. 명령은 SKILL.md가 적은 지시상 동작이고 실행하지 않았다. 표 아래의 문장이 Checkmarx와 Wiz의 별도 규칙을 가리킨다.

| scanner | 수집 방법 | 원문이 붙인 조건 |
| --- | --- | --- |
| Trivy | 새 filesystem 취약점 scan은 `trivy fs --scanners vuln --format json --output REPORT.json .`을 쓴다. 이전 scan은 schema-v2 JSON이나 gzip을 읽는다. | filesystem report는 checkout 상대 `--trivy-scan-root`를 준다.[](source:sk-trivy) |
| Semgrep CLI와 CI | 새 Code scan은 `semgrep scan --config RULES --json-output REPORT.json .`이다. CI job은 Code JSON이나 자체 완결 SARIF를 쓴다. | 규칙은 선택한 것을 쓴다.[](source:sk-semgrep) |
| Semgrep Guardian MCP | 연결된 `get_semgrep_sast_findings`나 `get_semgrep_supply_chain_findings`를 쓴다. | deployment, repository, 전체 ref, 필터를 주고 정확한 문자열 finding ID로 맞춘다. 원래 요청과 선택한 행을 보존한다.[](source:sk-semgrep) |
| Semgrep hosted AppSec Platform MCP | `semgrep_account`, `ProjectsService_GetProject`, `IssuesService_ListIssues`를 쓴다. | project의 SCM URL을 먼저 확인하고, project, 전체 ref, `ISSUE_TYPE_SAST`로 범위를 정한다. Guardian ID와 이 ID는 이름 공간이 다르다.[](source:sk-semgrep) |
| Semgrep Platform Web API | 전체 project와 ref는 `codex-security import semgrep PROJECT --deployment DEPLOYMENT --ref REF --format json`이다. | 선택한 SAST ID는 원래 project 응답과 선택한 findings 페이지를 쓴다.[](source:sk-semgrep) |
| GitHub | 로그인된 GitHub CLI collector `codex-security import github OWNER/REPO`에 `--github-alert NUMBER`(반복 가능)나 `--github-ref REF`를 준다. advisory는 `import github-advisories`다. | Dependabot은 전체 pagination된 REST alert 객체를 연결된 GitHub로 내보낸다. 세 계열은 source key를 따로 둔다.[](source:sk-github) |
| Snyk | 관리 중인 Open Source project는 `codex-security import snyk PROJECT_ID --org ORG_ID --source-repository-url URL --format json`이다. Code project는 `--snyk-product code`를 더한다. | 새 dependency scan은 `snyk test` JSON이나 Snyk plugin의 SCA export를 쓴다. 수집 형식끼리 이름 공간을 나눈다.[](source:sk-snyk) |
| AWS Continuum | `codex-security import continuum ENVIRONMENT_ID --format json`이 환경의 모든 issue, 연결된 finding, `EVIDENCE`와 `VALIDATION_EVIDENCE` artifact를 모은다. | 환경에 Git repository가 정확히 하나여야 한다. 가져오기 전에 issue가 의도한 repository의 것인지 확인한다. 저장된 report에 repository URL이 없으면 확인한 `--source-repository-url`을 준다.[](source:sk-cont) |
| AWS Continuum patch | `codex-security import continuum ENVIRONMENT_ID --finding-id FINDING_ID --source-root CHECKOUT --repository-name AWS_SOURCE_NAME --format json`으로 finding 하나를 받는다. | checkout은 절대 경로, source 이름은 정확히 쓴다. 환경에 Git repository가 하나이고 S3 source가 없으면 `--repository-name`을 뺀다. CLI가 `GetEnvironment`로 확인한다.[](source:sk-cpatch) |
| Checkmarx | 완료된 Checkmarx One scan은 CLI JSON, self-managed CxSAST는 XML로 내보낸다. | 제품, scan, 확인된 소유 project는 `references/checkmarx-import.md`를 따른다.[](source:sk-cx) |
| Wiz | 연결된 Wiz 도구나 API로 occurrence ID별 finding을 받거나 상세 report를 쓴다. | JSON은 여러 finding 계열을, 상세 CSV는 repository package 취약점만 다룬다. `references/wiz-import.md`를 따른다.[](source:sk-wiz) |
| CrowdStrike FCS | 저장된 FCS CLI 4.x `fcs scan iac` JSON report를 쓴다. 새 scan은 가져올 디렉터리에서 `fcs scan iac --path . --report-formats json --output-path DIR`다. | `DIR`은 그 디렉터리 밖의 기존 비공개 디렉터리이고 이름에 점이 없다. `Results saved to file`이 가리키는 `*-scan-results.json`만 가져온다. `--to local`만 쓴다.[](source:sk-fcs) |
| 그 밖의 내장 reader | OpenGrep, Endor, Inspector, Black Duck, Veracode, Tenable. | 도구마다 받는 범위가 다르다. 예: Inspector는 Code Security repository 하나, Veracode는 application 하나.[](source:sk-other) |
| SonarQube Cloud | 로그인된 `sonar` CLI로 기존 issue를 읽는다. 선택한 issue key는 Sonar plugin이 줄 수 있다. | 같은 project와 branch나 PR의 전체 issue와 flow 증거를 모은다. `--dry-run`을 먼저 돌리고, 그 미리보기가 저장한 capture로 승인된 가져오기를 한다.[](source:sk-sonar) |

AWS Continuum 항목의 attack path 점수를 매길 때는 선택한 issue의 저장된 `.evidence`를 검증 artifact까지 `$attack-path-analysis`에 준다.[](source:sk-cont)

## Checkmarx 수집은 어떤 순서로 무엇을 검사하나? {#checkmarx span=12}

Checkmarx만 collector 스크립트(`collect_checkmarx.py`)가 따로 있다. 이 스크립트는 사용자가 지정한 `cx`, `java`, CxFlow JAR 같은 vendor 도구를 `subprocess.Popen`으로 직접 실행한다.[](source:col-run) 그래서 vendor 도구를 띄우기 전에 사람과 스크립트가 각각 조건을 확인한다. 아래는 모두 읽고 정리한 지시상 동작이고, 스크립트도 vendor 도구도 실행하지 않았다.

사람이 지킬 조건은 reference 문서에 있다. 에이전트는 신뢰하는 session에서 source tree 밖의 비공개 작업 폴더와 임시 폴더를 쓰고, 작업 디렉터리를 process를 시작하기 전에 정하며, 비로그인 비대화형 shell(`/bin/sh`, `login: false`)을 쓴다. IDE나 build가 checkout 안의 시작 설정을 주면 깨끗한 session이나 저장된 export를 쓴다.

의심스러운 shell을 열어 변수를 지우거나 project 파일을 source하지 않는다.[](source:cx-before) collector와 vendor 도구는 source tree 밖의 신뢰하는 절대 경로로 해석하고, Python은 3.10 이상의 native 인터프리터를 `-I -S`로 쓴다. shim이나 shell launcher를 받으면 native 설치 경로를 요청한다.[](source:cx-before)

사용자가 report를 이미 가지고 있으면 collector 없이 그대로 쓴다. 수집하려면 먼저 제품, tenant나 server, 완료된 scan ID, project, repository URL, ref를 확인한다. 두 collector는 scan 전체를 가져오므로 일부만 원하면 그 범위로 내보낸 파일을 요청한다.[](source:cx-intro)

Checkmarx One은 `cx` 2.3.23 이상을 쓴다. `CX_CONFIG_FILE_PATH`가 있으면 그 profile을, 없으면 완전한 환경 변수 로그인이나 `~/.checkmarx/checkmarxcli.yaml`을 쓴다. 구 client나 profile 파일이 없는 credential store 로그인이면 평소 설정으로 내보낸 JSON을 요청한다.[](source:cx-one)

self-managed CxSAST는 가져오기 전에 소유권을 확인한다. 완료된 scan ID, 정확한 project, 전체 team 경로를 같은 Projects & Scans → All Scans 행에서 확인하고, 확인되지 않으면 선택한 XML을 요청한다. issue tracker 필터는 원시 XML을 좁히지 않는다.[](source:cx-sast)

CxSAST는 Java, CxFlow JAR 1.6.37 이상, `CxXml`이 켜진 SAST 전용 profile을 쓴다. `--use-env-credentials`는 session의 `CHECKMARX_USERNAME`, `CHECKMARX_PASSWORD`, `CHECKMARX_CLIENT_SECRET`이 그 server 것임을 운영자가 확인했을 때만 붙인다.[](source:cx-sast)

스크립트가 스스로 검사하는 것은 다음과 같다.

| 검사 | 내용 |
| --- | --- |
| 실행 파일 | source checkout 밖의 절대 경로에 있는 기존 파일이어야 한다. `cx`와 `java`는 native 실행 파일(ELF, Mach-O, PE)이어야 하고 Windows는 `.exe`나 `.com`만 받는다. shell launcher와 shim을 막는 검사다.[](source:col-installed) |
| source 안인지 | 링크를 따라가며 경로가 source 트리 안인지 본다. 링크가 순환하면 오류다. source 루트는 `.git`이 있는 가장 바깥 상위 폴더로 잡는다.[](source:cp-in)[](source:cp-root) |
| CxFlow | JAR이 `com.checkmarx.flow.CxFlowApplication`이고 `build.group`이 `com.checkmarx`이며 version이 1.6.37 이상이어야 한다. 더 낮은 version은 `--scanId`를 받고도 조용히 최신 scan을 가져오기 때문이다.[](source:col-cxflow) |
| 환경 변수 | 이름을 골라 넘긴다. One은 `CX_CONFIG_FILE_PATH`가 없고 `CX_APIKEY`나 OAuth 네 변수가 모두 있으면 빈 임시 profile과 `CX_KEYRING_MODE=disabled`를 쓰고 그 자격 변수만 넘긴다. 그렇지 않으면 profile 경로가 source 밖의 절대 경로여야 한다. CxSAST 계정 변수는 `--use-env-credentials`일 때만 넘긴다.[](source:col-env) |
| 임시 폴더 | 임시 폴더가 source 안이면 거부한다. 비공개 capture 폴더를 만들고 Windows는 보호된 DACL을 건다.[](source:col-temp) |
| report 검증 | One은 report의 `scanID`가 요청한 ID와 같아야 한다. CxSAST는 root가 `CxXMLResults`이고 `ProjectId`가 있으며 `ScanId`, `ProjectName`, team 경로가 요청과 모두 같아야 한다.[](source:col-verify) |
| 인자 | One의 scan ID는 하이픈이 있는 UUID, CxSAST는 양의 정수여야 한다. team과 project는 비어 있으면 안 된다.[](source:col-args) |
| 출력 | report를 `0o600`으로 바꾸고 경로만 stdout에 쓴다. vendor 도구의 진단은 stderr로 보낸다. 실패하면 capture 폴더를 지운다.[](source:col-run)[](source:col-out) |
| 종료 | SIGTERM, SIGINT, SIGHUP이 오면 자식 process 그룹을 죽이고 끝난다. 오류는 stderr에 출력하고 종료 코드 1을 돌려준다.[](source:col-sig)[](source:col-main) |

판정 · reference 문서는 `cx` 2.3.23 이상을 요구하지만 스크립트에는 `cx` 버전을 검사하는 코드가 없다. 스크립트가 버전을 검사하는 것은 CxFlow JAR뿐이다.[](source:cx-one)[](source:col-cxflow)[](source:col-installed) 따라서 `cx` 버전 조건은 사람이 지켜야 한다.

수집이 끝나면 에이전트는 helper가 출력한 경로를 따옴표로 감싸 다음 tool call에서 `codex-security publish findings`에 넘기고 미리보기를 본다. 확인한 뒤 같은 파일과 옵션으로 로컬 가져오기를 하고, 그 선택분으로 Cloud 게시와 재시도를 한다. readback 뒤에는 helper의 임시 폴더를 지운다. 운영자가 보관을 원하거나 운영자가 준 파일이면 지우지 않는다.[](source:cx-prev)

@facts id=checkmarx-numbers
| `cx` 최소 버전 | 2.3.23 (reference 문서의 요구, 스크립트는 검사하지 않음)[](source:cx-one) |
| CxFlow JAR 최소 버전 | 1.6.37 (reference 문서와 스크립트가 모두 검사)[](source:cx-sast)[](source:col-cxflow) |
| Python | 3.10 이상, `-I -S`로 실행[](source:cx-before) |
| report 파일 권한 | `0o600`[](source:col-out) |
| 오류 종료 코드 | 1[](source:col-main) |

## Wiz 입력은 어떤 형식과 ID를 써야 하나? {#wiz span=12}

Wiz는 collector 스크립트가 없다. `references/wiz-import.md`는 importer가 받는 형식과 지켜야 할 증거를 정한다. importer는 JSON, 정규화 JSONL, repository package 취약점 CSV를 읽고 모두 gzip을 지원한다. CSV 직접 가져오기는 repository package 취약점(SCA)만 지원하고, Wiz에서 직접 가져오지 않고 다른 CSV profile, scan event, workload secret, cloud 설정, 외부 network export도 받지 않는다.[](source:wz-fmt)

원본 기록은 `source_data`에 그대로 두고, ID는 vendor의 occurrence ID를 쓴다. 규칙, CVE, 제목, 위치로 대신하지 않고 없는 ID, severity, revision, 위치는 지어내지 않는다.[](source:wz-fmt) 요청받은 페이지를 모두 받고, 부분 선택이면 선택과 그 collection 이름을 보존한다.[](source:wz-fmt)

| 계열 | collection | occurrence ID |
| --- | --- | --- |
| package 취약점 | JSON, JSONL, 상세 CSV | Wiz finding의 ID 그대로[](source:wz-pkg) |
| SAST | `data.sastFindings.nodes` | `sast:<id>`[](source:wz-fam) |
| repository secret | `data.secretInstances.nodes` | `secret:<id>`[](source:wz-fam) |
| IaC | `data.iacFindings.nodes` | `iac:<id>`[](source:wz-fam) |

SAST, secret, IaC는 이름이 붙은 collection을 보존해야 한다. bare array로는 계열을 알 수 없기 때문이다. 검증된 `repository.url`이 필요하고, secret은 resource 유형이 `REPOSITORY_BRANCH`여야 한다.

한 repository ID에 플랫폼이나 URL 정보가 충돌하면 게시 전에 풀어야 한다. 이름, inventory node ID, `providerID`, Wiz UUID는 Cloud repository ID가 아니다.[](source:wz-fam)

package 취약점 CSV는 `ID`, `Name`, `DetailedName`, `AssetID`, `WizURL`, `CloudPlatform`, `CloudProviderURL` 일곱 열이 필요하다. `CloudPlatform`은 GitHub를 가리켜야 하고 `CloudProviderURL`은 repository branch URL이어야 한다. repository는 선택한 Cloud repository와, 로컬 가져오기에서는 parse할 수 있는 Git remote가 있으면 그것과 맞아야 한다.

보고된 `ID`가 occurrence 정체가 되고, 모든 원본 셀은 `source_data.row`에 남는다. importer는 tree URL에서 branch나 revision을 만들어 내지 않는다. 제외된 행은 가져오기 전에 미리보기에서 검토한다.[](source:wz-pkg)

SAST, secret, IaC의 CSV는 실제 header를 정규화 profile에 맞추는, 검토된 mapping이 필요하다. 계열마다 보존할 evidence가 다르다. SAST는 규칙과 CWE, 소스 범위와 snippet, scanner 출처와 verdict, 수정 안내다.

secret은 소스 경로와 줄, 탐지 규칙, 유형과 확신도, vendor의 검증 상태, 도입된 commit이다. IaC는 규칙 ID, 소스 범위와 일치한 내용, 플랫폼, 기대값과 실제값, 수정 안내다.[](source:wz-norm) 도입된 commit은 scan한 revision이 아니고, 논리적인 IaC resource가 실제 배포를 증명하지도 않는다.[](source:wz-norm)

## local workbench는 가져온 finding과 게시 영수증을 어떻게 저장하나? {#workbench span=12}

SKILL.md는 저장소 구현의 helper 이름을 적지 않는다. 플러그인에는 외부 finding 저장·조회, import 목록, 게시 영수증 기록·조회 helper 다섯 개의 사용법 문자열과 구현이 있다.[](source:hm-ext) 판정 · 호출 주체는 SKILL.md가 부르는 SDK나 CLI일 것으로 추론한다.

실제로 helper를 부르는 구성요소는 확인하지 못했다. 아래는 구현을 읽고 확인한 동작이다.

저장하기 전에 구현은 `repository`가 절대 경로이고 `provider`와 `sourceKey`가 비어 있지 않은지, `findings`가 배열인지 검사한다.[](source:ef-guard)[](source:ef-id) finding이 하나도 없으면 import를 만들지 않고 빈 결과를 돌려준다.[](source:ef-id) 한 batch 안에 `source_finding_id`가 겹치면 거부한다.[](source:ef-id)

finding ID는 `ext_` 뒤에 `[repository, provider, sourceKey, source_finding_id]`를 JSON으로 묶은 sha256을 붙인 값이다.[](source:ef-id) `sourceKey`가 ID 입력에 들어가므로 같은 알림이라도 source key가 바뀌면 새 finding으로 저장되고 이전 finding은 갱신되지 않는다. SKILL.md가 반복 가져오기에 같은 source key를 쓰라고 하는 이유가 이것이다(판정).[](source:ef-id)[](source:sk-local)

같은 ID가 이미 있을 때 구현은 evidence와 provenance(출처 repository 정보)가 모두 같으면 `unchanged`로 센다. 다르면 version을 1 올리고 `updated`, 처음이면 `created`로 센다.[](source:ef-write) 바뀌지 않은 finding도 새 import의 구성원에 `(import ID, 위치, finding ID, version)`으로 들어간다.

그래서 import ID가 한 번의 선택 전체를 가리킨다.[](source:ef-write) 저장된 finding의 평가 상태는 항상 `not_assessed`다.[](source:ef-state)

import나 `(id, version)` 목록으로 다시 읽을 때 고정한 version이 달라졌거나 없으면 오류로 멈춘다. `ifCurrent`를 주면 오류 대신 빈 결과를 돌려준다.[](source:ef-stale) 부분 선택이 승인되지 않게 하려는 장치다(구현 주석).[](source:ef-stale)

게시 영수증은 finding ID, version, Cloud API URL, account, destination, receipt ID, outcome, 선택적 Cloud finding ID를 담는다. outcome은 `created`, `updated`, `unchanged`, `private_job` 넷 중 하나여야 하고, 같은 repository에 그 finding이 그 version 이상으로 있어야 기록한다. 업로드하는 동안 선택이 더 새 version으로 바뀌어도 검토한 version이 존재했음을 인정하기 위해서다(구현 주석).

같은 키가 이미 있으면 새로 쓰지 않는다.[](source:pr-type)[](source:pr-rec) 조회는 repository에 속한 영수증을 최신순으로 돌려주고, finding ID를 주면 그 finding의 것만 돌려준다.[](source:pr-list)

## 이 스킬은 묶음의 어디에 있나? {#position span=12}

이 스킬은 `external-findings` 묶음에서 가져오기와 게시를 맡는다. 앞에서 `resolve-dependency-alert`가 넘기고, 뒤에서 `attack-path-analysis`, `fix-finding`, `cloud-findings`가 이 스킬의 산출물을 읽을 수 있다. 전체 흐름은 `codex-security/_group-external-findings/external-findings.html`에 있다.

@workflow id=publish-position title="publish-findings의 앞뒤"
| rda | resolve-dependency-alert | security |
| pf | publish-findings | backend | emphasis |
| ap | attack-path-analysis | backend |
| fx | fix-finding | backend |
| cf | cloud-findings | backend |
| rda > pf | R35 | emphasis |
| pf > ap | R36 | emphasis |
| pf > fx | R37 | default |
| pf > cf | R38 | default |

이 그림은 앞과 뒤의 관계만 그린다. `cloud-findings`가 이 스킬을 이름 없이 지목하는 R39(참고)는 표에만 둔다.

@steps id=position-steps
| rda | resolve-dependency-alert | 앞 스킬이다. 명시적인 가져오기 요청이면 이 스킬을 쓰라고 한다.[](source:rda-imp) | publish-position | rda |
| pf | publish-findings | 이 페이지의 스킬이다. 가져온 선택분을 local workbench에 저장하고 승인된 것을 Cloud에 게시한다. | publish-position | pf |
| ap | attack-path-analysis | AWS Continuum 항목에 한해 저장된 `.evidence`를 넘긴다.[](source:sk-cont) | publish-position | ap |
| fx | fix-finding | Continuum finding의 patch를 시작 후보로 쓸 수 있다.[](source:fx-patch) | publish-position | fx |
| cf | cloud-findings | Cloud에 올라간 finding을 읽을 수 있다.[](source:cf-imp) | publish-position | cf |

| 관계 | 종류와 조건 | 받는 것 / 넘기는 것 | 상대 쪽 원문 |
| --- | --- | --- | --- |
| R35 `resolve-dependency-alert` → 이 스킬 | 넘김(명시-이름). 명시적인 가져오기 요청일 때다. | 받는 것: scanner 알림 보고서 | 알림을 찾아 달라는 요청은 선택된 scanner와 대상에서만 조회한다.[](source:rda-imp) |
| R36 이 스킬 → `attack-path-analysis` | 넘김(명시-이름). AWS Continuum 항목에 한해 attack-path 점수를 매길 때다.[](source:sk-cont) | 넘기는 것: 저장된 `.evidence`, `VALIDATION_EVIDENCE` artifact | `attack-path-analysis`는 Continuum의 `source_data.evidence_artifacts`를 읽는 규칙을 따로 둔다.[](source:ap-cont) |
| R37 이 스킬 → `fix-finding` | 산출물 호환(명시-역할). Continuum finding 하나를 `--source-root`와 함께 수집한 경우다.[](source:sk-cpatch) | 넘기는 것: `patches[].patch` | `fix-finding`은 그 patch를 시작 후보로 쓰고 현재 checkout의 hunk와 비교해 유지하거나 고친다.[](source:fx-patch) |
| R38 이 스킬 → `cloud-findings` | 산출물 호환(추론). 두 스킬은 서로를 이름으로 지목하지 않는다.[](source:sk-pub) | 넘기는 것: Cloud에 저장된 finding | `cloud-findings`는 imported scanner finding을 읽는 방법(`api_version` `v2`, `source`, `provider`)을 적는다.[](source:cf-imp) |
| R39 `cloud-findings` → 이 스킬 | 참고(명시-역할). 이름은 적지 않는다. | - | `cloud-findings`는 "upload results"를 금지한다. 업로드는 이 스킬의 일이다.[](source:cf-ro) |

## 어디까지 읽었고 무엇이 남았나? {#audit span=12}

읽은 텍스트 파일은 14개다. 아홉 개는 끝까지 읽었고 다섯 개는 필요한 줄만 읽었다. 바이트 수는 파일마다 한 번만 적는다.

@facts id=audit-files
| 끝까지 읽음 (스킬 폴더) | `SKILL.md` 11118B, `agents/openai.yaml` 284B, `references/checkmarx-import.md` 4888B, `references/wiz-import.md` 5153B, `scripts/collect_checkmarx.py` 17126B, `scripts/collector_paths.py` 2210B |
| 끝까지 읽음 (스킬 폴더 밖) | `mcp-app/src/workbench/external-findings.ts` 11530B, `mcp-app/src/workbench/external-finding-publications.ts` 3624B, `skills/README.md` 3752B |
| 줄 범위만 읽음 | `mcp-app/helpers-main.ts` 8642B(80~100줄), `resolve-dependency-alert/SKILL.md` 2548B(10줄), `attack-path-analysis/SKILL.md` 5355B(21줄), `fix-finding/SKILL.md` 18461B(38줄), `cloud-findings/SKILL.md` 10563B(3, 8, 27줄) |
| 구조·표본만 확인(전부 읽지 않음) | 0개 |
| 바이너리 | 이 스킬 폴더에 없다 |
| 번역본 | 이 스킬 폴더에 없다. 열지 않았다 |
| 실행 | 스크립트, CLI, helper, scanner, 외부 URL을 하나도 실행하거나 열지 않았다 |

@callout level=open-question title="확인하지 못한 것(부분 분석의 이유)"
스킬이 따르라는 설치된 `@openai/codex-security` 패키지의 `docs/sdk.md`와 GitHub `docs/scanner-imports/*`는 이 저장소에 없고 URL도 열지 않았다. 그래서 `codex-security publish findings`와 `import ...`의 옵션, `prepareNormalizedLocalImport`, `listLocalExternalImports`, `prepareStoredFindingsPublication`, `group.publish`의 동작, review ID가 바뀌는 조건은 SKILL.md의 문장으로만 안다.
외부 finding helper를 어느 구성요소가 부르는지, 저장 표의 정의와 helper 번들(`mcp/helpers.mjs`)은 읽지 못했다. 저장·조회·영수증 함수는 읽었다.
scanner별 인증과 API 동작, Cloud의 실제 응답은 이 저장소로 확인할 수 없다.
SKILL.md가 SDK snippet을 `$(npm root --global)/@openai/codex-security`에서 실행하라고 하는 지시와 모든 명령은 따르지 않았다. 읽기만 했다.
