# triage-finding은 이미 보고된 보안 finding을 어떻게 판정하나? {#triage-finding-page}

`triage-finding`은 scanner 보고서, advisory, GitHub 알림, Jira·Linear ticket처럼 다른 곳에서 이미 보고된 보안 finding이 이 저장소에서 실제로 문제인지, 저장소 소스와 `SECURITY.md` 정책만 읽어 `confirmed`, `not_actionable`, `needs_review` 중 하나로 가려 주는 스킬이다.[](source:s-core)

- 이미 있는 finding을 가진 사람이 쓴다. 새 취약점 찾기, 중복 triage, runtime validation, fix에는 쓰지 않는다.[](source:s-fm)
- 에이전트는 finding마다 판정 하나, 판정 안의 exploitability 순위, `triage-finding/v0` 결과 계약, Markdown 요약을 내놓는다. `confirmed`마다 `$fix-finding` handoff도 붙인다.[](source:s-core)[](source:s-ret)[](source:s-hand)
- 하지 않는 것은 위임, 파일 수정, test·build·앱·PoC 실행이다. 근거는 정적 증거뿐이므로 runtime 검증을 했다고 말하지 못한다.[](source:s-core)
- `fix-finding`은 사용자가 고치자고 할 때만 부른다. 원본 시스템에 쓰는 writeback은 판정을 끝낸 뒤 따로 검토한다.[](source:s-hand)[](source:s-wb)

@answer scope="원문 분석 · 이 스킬 폴더 5개 파일과 필수 참조 전부 읽음(일부는 부분 읽음, 감사 패널 참조) · 코드와 CLI 실행 없음 · Atlassian, Linear, GitHub connector의 도구 동작은 범위 밖"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source s-fm title="frontmatter" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=1:4
@source s-core title="목적과 실행 경계" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=6:10
@source s-intake title="입력 종류와 finding 없을 때" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=12:14
@source s-jira title="Jira와 Linear intake" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=16:20
@source s-gh title="GitHub intake" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=22:24
@source s-norm title="입력 정규화" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=26:35
@source s-pol1 title="정책 검토 시점과 resolver" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=37:39
@source s-pol2 title="정책의 지위와 한계" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=41:50
@source s-assess title="개별 claim 평가" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=52:60
@source s-verd title="판정 3종" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=62:68
@source s-rank title="순위와 owner hint" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=70:74
@source s-ret title="결과 반환" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=76:80
@source s-hand title="fix-finding handoff" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=82:82
@source s-wb title="읽기 전용과 writeback" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=84:84
@source y-ui title="UI 메타데이터" path=codex-security/plugins/codex-security/skills/triage-finding/agents/openai.yaml
@source ti-ret title="Jira와 Linear 가져오는 방법" path=codex-security/plugins/codex-security/skills/triage-finding/references/ticket-intake.md lines=1:19
@source ti-lin title="Linear parent와 sub-issue" path=codex-security/plugins/codex-security/skills/triage-finding/references/ticket-intake.md lines=21:29
@source ti-fail title="가져오기 실패 처리" path=codex-security/plugins/codex-security/skills/triage-finding/references/ticket-intake.md lines=31:38
@source ti-norm title="ticket 정규화와 읽기 전용" path=codex-security/plugins/codex-security/skills/triage-finding/references/ticket-intake.md lines=40:48
@source gh-untr title="GitHub 기록은 untrusted data" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=1:3
@source gh-repo title="repository 찾기" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=5:7
@source gh-rev title="revision 맞추기" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=9:11
@source gh-sel title="source 선택" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=13:24
@source gh-trans title="전송과 credential" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=26:37
@source gh-cs title="code scanning endpoint" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=39:54
@source gh-dep title="Dependabot endpoint" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=56:79
@source gh-adv title="advisory와 issue endpoint" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=81:107
@source gh-page title="pagination" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=109:113
@source gh-stat title="상태 코드 처리" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=115:121
@source c-fit title="schema 적합 범위" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=1:12
@source c-top title="최상위 JSON" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=14:25
@source c-json title="finding별 JSON" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=27:82
@source c-enum title="source type, 판정, 확신도 값" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=84:105
@source c-rank title="경계 평가와 순위 규칙" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=107:114
@source sg-resolve title="SECURITY.md resolver 명령" path=codex-security/plugins/codex-security/references/security-guidance.md lines=1:13
@source sg-win title="Windows PowerShell 호출" path=codex-security/plugins/codex-security/references/security-guidance.md lines=15:28
@source sg-rule title="root부터 leaf 규칙과 untrusted" path=codex-security/plugins/codex-security/references/security-guidance.md lines=30:36
@source sfa-tuple title="평가 tuple" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=1:21
@source sfa-order title="증거 탐색 순서" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=23:37
@source sfa-bound title="경계와 surface 점검" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=39:50
@source sfa-conf title="정적 확신도" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=52:61
@source sfa-out title="출력 재료" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=63:75
@source rm-inside title="root 밖 경로 거부" path=codex-security/plugins/codex-security/mcp-app/src/helpers/resolve-security-md.ts lines=178:190
@source rm-scope title="policy 모으는 루프" path=codex-security/plugins/codex-security/mcp-app/src/helpers/resolve-security-md.ts lines=320:380
@source rm-cmd title="명령행 옵션 검사" path=codex-security/plugins/codex-security/mcp-app/src/helpers/resolve-security-md.ts lines=382:437
@source fs-head title="완료된 scan schema 머리" path=codex-security/plugins/codex-security/schemas/findings.schema.json lines=1:12
@source fs-req title="완료된 scan schema 필수 필드" path=codex-security/plugins/codex-security/schemas/findings.schema.json lines=247:247
@source app-json title="connector 선언" path=codex-security/plugins/codex-security/.app.json
@source plugin-json title="플러그인 선언" path=codex-security/plugins/codex-security/.codex-plugin/plugin.json
@source mcp-json title="MCP 서버 선언" path=codex-security/plugins/codex-security/.mcp.json
@source readme title="벤더의 스킬 안내" path=codex-security/plugins/codex-security/skills/README.md lines=22:28
@source art-store title="artifact 저장 규칙" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=1:13
@source ff-desc title="fix-finding description 대조" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=3:3
@source rda-dep title="Dependabot 안내 대조" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=10:10
@source dsp-prec title="정책 우선순위 대조" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=28:28
@source tf-body title="ticket 본문 대조" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=76:76
@source val-desc title="validation description 대조" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=3:3
@source val-evid title="validation 근거 단계 대조" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=13:13
@source sc-doc title="findings.json 설명 대조" path=codex-security/plugins/codex-security/references/scan-contract.md lines=12:12

## 에이전트는 finding을 받아서 어떤 순서로 판정하고 끝내나? {#behavior span=12}

에이전트는 먼저 finding 내용을 손에 넣고, 코드를 보기 전에 `SECURITY.md` 정책을 읽고, 그 다음에야 소스를 따라가 판정한다. finding이 없거나 가져오지 못하면 코드 검사와 결과 계약 출력 전에 멈춘다.[](source:s-intake)[](source:ti-fail) 아래 두 그림은 핵심 경로만 그렸다. 운영자에게 맥락을 묻는 경우, ticket을 일부만 가져오는 경우, 사용자가 writeback을 요청하는 경우는 그림에 없고 해당 노드의 설명에 문장으로 풀어 썼다.

@workflow id=triage-intake-flow title="finding 확보와 정규화"
| have | finding이 주어졌나? | external |
| halt | 멈추고 요청 | external |
| fetch | 내용 가져오기 | backend |
| norm | 입력 정규화 | backend |
| have > halt | 없음 |
| have > fetch | ticket·GitHub 지정 |
| have > norm | 내용 직접 제공 |
| fetch > norm | 가져옴 |
| fetch > halt | 못 가져옴 |

@steps id=triage-intake-steps
| have | finding이 주어졌나? | 이 노드는 사용자 요청과 함께 온 입력을 받아 finding이 있는지, 있다면 내용이 이미 있는지 가리킨다. 입력으로 받는 것은 SARIF 결과, CVE, advisory, scanner ticket, bug bounty 보고서, Codex Security 산출물, 자유 서술 취약점 주장이다.[](source:s-intake) 갈림은 세 갈래다. finding이 하나도 없으면 코드를 보거나 `triage-finding/v0`를 내기 전에 finding을 요청하는 쪽으로 가고, Jira·Linear ticket이나 GitHub 저장소가 지정돼 있으면 가져오기로 가고, 보고서 본문이 직접 붙어 있으면 바로 정규화로 간다.[](source:s-intake)[](source:s-jira)[](source:s-gh) 세 갈래로 나눈 방식은 분석자가 입력 형태를 기준으로 정리한 것이다(판정). repository나 claim이 너무 모호해 조사할 수 없을 때만 되묻고, 그 밖의 빠진 사실은 proof gap으로 적고 계속 진행한다.[](source:s-intake) 이 노드가 넘기는 것은 입력의 형태 하나뿐이고, 아직 판정은 하지 않는다. | triage-intake-flow | have |
| halt | 멈추고 요청 | 이 노드는 입력이 없거나 가져오지 못했을 때 에이전트가 도착하는 종료 지점이다. 받는 것은 두 경로다. 처음부터 finding이 없었거나, ticket이나 GitHub 기록을 가져오지 못한 경우다.[](source:s-intake)[](source:ti-fail) 이때 에이전트는 어느 source를 쓸 수 없는지 말하고 재연결이나 사용자가 고를 수 있는 읽기 경로를 제안하며, 사용자가 완전한 finding 본문을 붙여 넣겠다면 그것으로 이어 가자고 제안한다.[](source:ti-fail) 접근할 수 없는 ticket의 claim을 식별자나 제목 조각이나 저장소 코드로 짐작해 채우지 않고 판정도 매기지 않는다. 존재하지 않는다고 단정하지도 않는다. 숨겨져 있을 수 있기 때문이다.[](source:ti-ret)[](source:ti-fail) 가져온 내용이 하나도 없고 사용자도 주지 않았으면 repository 검사와 계약 출력을 하지 않는다.[](source:ti-fail) 여러 건을 가져오는 중이라면 가져온 것으로 계속 진행하고 접근 못 한 항목은 따로 보고한다. 이 경우는 이 노드에서 멈추지 않는다.[](source:ti-fail) 사용자가 답한 뒤 어떻게 재개하는지는 원문에 명시 없음. | triage-intake-flow | halt |
| fetch | 내용 가져오기 | 이 노드는 지정된 ticket이나 GitHub 기록을 읽기 전용으로 가져오고, 코드를 보기 전에 끝낸다.[](source:s-jira)[](source:s-gh) Jira는 `references/ticket-intake.md`를 읽고 기본으로 native Atlassian app을 쓴다. `atlassianUserInfo`와 `getAccessibleAtlassianResources`로 신원과 site를 정하고, 단건은 `getJiraIssue`, 여러 건은 `searchJiraIssuesUsingJql`로 `nextPageToken`을 따라 `isLast`가 true가 될 때까지 읽는다. 댓글을 요청받았으면 `listJiraIssueComments`로 `startAt`을 올려 가며 읽고 각 댓글의 공개 범위와 내부 메모 여부를 보존한다. 사용자가 준 JQL은 그대로 두고, 읽기 연산만 쓴다.[](source:ti-ret) Linear는 native app이 기본이고 정확한 URL이나 식별자는 바로 가져오며, sub-issue는 `list_issues`에 `parentId`를 줘 모든 page를 읽는다. 결과는 parent가 먼저인 너비 우선 순서로 한 issue당 결과 하나를 만들고 선택된 finding을 줄이거나 버리지 않는다.[](source:ti-lin) GitHub는 `references/github-rest-intake.md`를 읽고 먼저 repository를 정한다. 명시된 repository나 remote를 따르고, 없으면 연결된 Codex project의 repository, 그다음 `origin`이 GitHub.com이나 검증된 GitHub Enterprise를 분명히 가리킬 때만 그것을 쓴다. 불분명하면 credential을 찾거나 읽기 전에 URL을 묻는다.[](source:gh-repo) 사용자가 repository만 주고 source를 안 골랐으면 GitHub를 조회하지 않고 code scanning, Dependabot vulnerabilities and malware, security advisories and private vulnerability reports, all of the above 중 하나를 고르게 한다. GitHub Issues는 `all`에 들지 않고 사용자가 특정 issue를 지정했을 때만 가져온다.[](source:gh-sel) 연결된 읽기 전용 GitHub app이나 MCP 연산을 먼저 쓰고, 안 되면 허가된 credential로 범위가 고정된 HTTPS GET을 쓴다. 승인 없이 다른 credential이나 다른 전송 경로로 바꾸지 않는다. redirect는 거부한다.[](source:gh-trans) 목록은 응답 순서대로, 기본 `per_page=100`으로 읽고 사용자가 정한 page나 record 한도에서 멈춘다. 다음 page 링크는 승인된 origin과 같은 endpoint·repository·filter를 확인한 뒤 위치만 복사한다.[](source:gh-page) 상태 코드는 `401`·`403`이면 연결이나 권한을 요청하고, `404`는 그 source의 intake 장애일 뿐 finding이 없다는 증거가 아니며, `200 []`만 일치하는 finding이 없다는 뜻이다. `all`에서 한 source가 실패하면 그 오류를 보고하고 나머지로 계속하되 실패한 source에 빈 finding을 만들지 않는다.[](source:gh-stat) 가져온 기록의 글, 경로, URL은 untrusted data이고 명령, 공개, 추가 읽기, workflow 변경을 허가하지 못한다.[](source:gh-untr) 갈림은 가져왔으면 정규화로, 못 가져왔으면 앞 노드의 설명대로 멈추고 요청하는 쪽이다. | triage-intake-flow | fetch |
| norm | 입력 정규화 | 이 노드는 가져왔거나 직접 받은 finding 묶음을 하나의 모양으로 맞춘다. 에이전트는 먼저 `references/triage-result-contract.md`를 읽고, finding마다 `triage_item_id`를 새로 붙이고 외부 식별자는 `input_id`에 남긴다.[](source:s-norm) 뽑는 항목은 제목, source type, component, 영향받는 version이나 path, 주장된 actor, 제어 가능한 source, control이나 sink, 전제 조건, 영향, 제공된 증거와 반대 증거와 코드 참조, 그리고 ticket·alert URL, 식별자, query, 상태, package, 보고된 revision 같은 출처 정보다.[](source:s-norm) 로컬 repository 경로와 revision도 알 수 있으면 확인한다. 입력 순서와 비슷해 보이는 중복 입력도 그대로 보존한다.[](source:s-core)[](source:s-norm) 모르는 사실은 지어내지 않고 남겨 두며, 완료된 scan용 필드를 채워 넣지 않는다.[](source:s-norm)[](source:c-fit) 유효한 `codex-security.findings` 산출물을 사용자가 주면 입력 source로 쓰고 `findingId`, `occurrenceId`, `ruleId`를 source identifier로 보존한다.[](source:c-fit) GitHub 기록이면 GitHub가 준 `commit_sha`와 `ref`를 보존하고 현재 checkout과 정적으로 비교해, 불일치·없는 path·없는 의존성을 counterevidence나 `proof_gaps`에 적는다. 대응이 불확실하면 `needs_review`를 쓴다. checkout의 revision을 바꾸거나 fetch, build, test를 하지 않는다.[](source:gh-rev) source type 매핑은 아래 intake 표에 있다. 이 노드가 넘기는 것은 정규화된 finding 목록과 repository 경로·revision이다. | triage-intake-flow | norm |

그림은 둘로 나눴다. 위 그림은 finding을 손에 넣고 맞추는 앞부분이고, 아래 그림은 정책을 읽고 판정해 돌려주는 뒷부분이다. 앞부분의 끝 노드 `입력 정규화`가 넘긴 정규화된 finding 목록이 뒷부분의 입력이다.

@workflow id=triage-judge-flow title="정책 검토에서 결과 반환까지"
| policy | SECURITY.md 검토 | security |
| assess | 정적 근거 평가 | backend |
| verdict | 판정은? | backend |
| rank | 순위 매김 | backend |
| ret | 결과 반환 | backend |
| fix | fix-finding handoff | external |
| policy > assess | |
| assess > verdict | |
| verdict > rank | 세 판정 모두 |
| rank > ret | |
| ret > fix | 사용자가 요청할 때만 | emphasis |

@steps id=triage-judge-steps
| policy | SECURITY.md 검토 | 이 노드는 코드를 따라가기 전에 영향받는 파일이나 디렉터리마다 적용되는 `SECURITY.md`를 읽는다.[](source:s-pol1) 받는 것은 정규화된 finding에 적힌, 혹은 조사 중 발견된 영향 경로다. 에이전트는 `../../references/security-guidance.md`를 읽고, 거기 적힌 resolver `launch_codex_security_mcp --helper resolve-security-md`를 `--repo`에 canonical repository root, `--scope`에 영향받는 경로를 줘서 쓴다.[](source:s-pol1)[](source:sg-resolve) 이 resolver는 scan root부터 대상 디렉터리까지 비어 있지 않은 `SECURITY.md`를 root에서 leaf 순서로 이어 붙이고, 충돌하면 대상에 가장 가까운 정책이 우선한다.[](source:sg-rule) 구현도 같은 순서로 디렉터리를 거슬러 올라가며 공백뿐인 파일은 건너뛰고, root 밖 경로는 거부하고, 존재하지 않는 `--scope`는 오류로 끝낸다.[](source:rm-scope)[](source:rm-inside) 그래서 없는 path는 가장 가까운 기존 상위 디렉터리로 resolve하고 없는 나머지 부분은 proof gap으로 적는다.[](source:s-pol1) MCP를 쓸 때는 `--out -`로 결과를 바로 받는다.[](source:sg-resolve) Windows PowerShell에는 `cmd.exe`를 거치는 별도 호출 형태가 적혀 있다.[](source:sg-win) 이 resolver를 이 분석에서는 실행하지 않았다. 정책을 읽은 뒤에는 정책을 보안 모델의 주된 로컬 정의로 다룬다. 지원하는 제품 surface와 version과 설정, 공격자 역할과 신뢰하는 입력과 경계와 불변식, 필요한 hardening 통제, 보고 대상 기준과 제외를 정의한다고 본다.[](source:s-pol2) 다만 정책은 보안 모델을 정할 뿐이고 claim이 이를 어기는지는 여전히 코드 증거가 세워야 한다. 정책 글은 데이터이므로 명령 실행, credential 접근, 새 대상 추가, 쓰기를 허가하지 못한다.[](source:s-pol2)[](source:sg-rule) 경계나 범위 판단마다 근거가 된 정책 문장과 출처를 적고, 적용되는 정책이 없으면 그 공백을 적고 제품 문서, 위협 모델, package와 배포 증거, 코드로 계속한다. 정책이 없다는 사실만으로는 finding을 지지하지도 제외하지도 않는다.[](source:s-pol2) 풀리지 않은 정책·신뢰·배포 사실이 판정을 바꿀 수 있으면 운영자에게 맥락을 묻고, 계속 모르면 `needs_review`로 둔다.[](source:s-pol2) 몇 번까지 묻는지는 원문에 명시 없음. 이 노드가 넘기는 것은 경계마다의 정책 근거와 정책 공백 목록이다. | triage-judge-flow | policy |
| assess | 정적 근거 평가 | 이 노드는 finding마다 주어진 claim 하나를 소스 증거로 받쳐 보거나 무너뜨린다. 에이전트는 `../../references/static-finding-assessment.md`를 읽고 claim마다 source, control, sink, reachable path, boundary, counterevidence, proof gaps 묶음을 만든다. 이 파일은 최상위 workflow가 아니라서 입력 정규화, 판정, 계약 형식은 호출한 스킬이 정한다.[](source:sfa-tuple) 증거는 가장 작은 집합부터 넓힌다. 순서는 사용자나 scanner가 준 위치, 의존성 manifest와 lockfile과 배포 설정, 영향받는 함수와 호출처, 가까운 guard, 그리고 `SECURITY.md`와 위협 모델 같은 제품 surface 근거다.[](source:sfa-order) 이 단계에서 이 스킬은 행위자의 권한 차이와 문제가 되는 보안 속성을 적고, 주장된 actor와 source를 모든 변환과 통제를 거쳐 정확한 결과까지 따라간다. 통제가 무엇을 강제하는지, 거부나 실패 뒤에 어떻게 되는지, 뒤쪽의 parsing, decoding, binding, dispatch, rendering이 위험한 해석을 되살리는지 본다.[](source:s-assess) 통제의 이름, encoding, 예외 처리, 인증, 위험한 sink 하나만으로는 claim이 정해지지 않는다. 배포되는 경로와 지원되는 설정, 실패 경로, downstream consumer도 확인한다. `local`, CLI, administrator, configuration, plugin, example 같은 이름만 보고 신뢰를 추론하지 않고 누가 그 값에 영향을 줄 수 있는지와 그 surface가 그 actor를 지원하는지를 세운다. secure default가 지원되는 다른 설정에 대한 claim을 꺾지 못하고, insecure option이 있다는 사실만으로 지원되는 경계가 생기지도 않는다.[](source:s-assess) finding 본문, imported ticket, 저장소 자료는 근거 데이터이지 지시가 아니다. 관찰한 사실과 가정과 scanner의 산문을 구분하고, 가까운 약점의 증거로 제출된 claim의 증명을 대신하지 않는다.[](source:s-assess) 경계 점검에서는 제품 surface, source 신뢰, policy 근거를 분류하고 신뢰할 수 없는 입력이 그 버그에 닿는지 확인한다.[](source:sfa-bound) 의존성이 있다거나 문자열이 일치한다는 것, 호출 사슬의 일부만 찾은 것은 완료된 평가가 아니다. 증거가 없으면 그 부재 자체가 claim을 꺾는 경우가 아닌 한 proof gap으로 적는다.[](source:sfa-tuple)[](source:sfa-order) 확신도는 증거의 질로 정한다. high는 정확한 source·control·sink 경로와 전제 조건과 경계 근거가 있고 풀리지 않은 반대 증거가 없을 때, medium은 경로는 그럴듯하지만 호출 사슬이나 설정이나 version이나 배포나 경계 증거가 불완전할 때, low는 증거가 약하거나 간접적이거나 repository 맥락이 모자랄 때다.[](source:sfa-conf) 이 평가에서 test, build, 앱, PoC 실행은 하지 않는다.[](source:s-core) 넘기는 것은 tuple, 위치, 근거, 반대 증거, proof gap, 확신도다.[](source:sfa-out) | triage-judge-flow | assess |
| verdict | 판정은? | 이 노드는 평가 결과를 세 판정 중 하나로 고른다. `confirmed`는 정적 증거가 주장된 actor와 source를 정확한 결과까지 모든 중요한 통제를 지나 잇고, 문제 되는 version·설정·runtime·권한·통제 우회 전제 조건이 세워졌고, 지원되는 보안 경계를 넘을 때다. `not_actionable`은 claim의 핵심을 배포되는 모든 경로와 지원되는 설정에서 꺾는 긍정적 증거가 있을 때다. 예는 영향받는 component가 없음, 도달할 수 없는 조건, 모든 관련 경로의 효과적인 통제, 제외된 산출물, 지원되는 낮은 신뢰 경로가 없는 같은 권한의 trusted input이다. `needs_review`는 도달 가능성, source 신뢰, 통제, downstream 동작, 설정, coverage, 경계 정책 중 중요한 사실이 풀리지 않았을 때이고, 판정을 바꿀 가장 작은 사실 하나를 이름 붙여 적는다.[](source:s-verd) 신뢰하는 운영자의 선택, insecure opt-in, 꺼진 mitigation, build에 따라 달라지는 노출은 주장된 조건이 지원되는 보안 모델 안에 든다는 증거가 있어야 `confirmed`가 된다. 호출 하나나 기본 경로 하나가 안전하다고 해서, 또는 증거가 없다고 해서 claim을 닫지 않는다.[](source:s-verd) 따라서 증거가 모자란 쪽의 기본 도착지는 `not_actionable`이 아니라 `needs_review`다(판정). 경계가 불분명한 경우는 `boundary_assessment`에 `unknown`과 `null`을 쓰고 `needs_review`를 우선한다.[](source:c-rank) 세 판정 모두 다음 노드인 순위 매김으로 넘어간다. 그림이 이 노드에서 갈리지 않는 것은 `not_actionable`도 순위 매김 노드가 `null`로 채우기 때문이다(판정).[](source:c-rank) | triage-judge-flow | verdict |
| rank | 순위 매김 | 이 노드는 같은 판정끼리 exploitability 순서를 매긴다. 받는 것은 판정이 붙은 finding 전체다. 기준은 공격자 도달 가능성, 필요한 권한, 전제 조건, 경로에 대한 통제력, guard 강도, 증거의 질이고 impact나 scanner severity는 마지막 동점 처리에만 쓴다.[](source:s-rank) 결과 계약의 규칙대로 `confirmed`와 `needs_review`는 별개 queue로 두고 각 queue 안에서 1부터 빠짐없이 겹치지 않는 양의 정수 순위를 준다. 1이 그 queue에서 가장 exploitable하며 queue는 숫자가 아니라 `rank_queue`로 구분한다.[](source:c-rank) `not_actionable`에는 순위를 매기지 않고 `rank_queue`와 `rank`를 `null`, `drivers`를 빈 배열, `rationale`을 `not actionable` 같은 짧은 설명으로 둔다.[](source:c-rank) `confirmed` finding에는 CODEOWNERS, OWNERS 같은 로컬 증거로 소유자가 분명할 때만 owner hint를 더하고 추측은 적지 않는다. 소유권은 판정, 확신도, 경계 평가, 순위에 영향을 주지 않는다. 계약에 owner 필드가 없으므로 기존 evidence나 next-step 문장이나 Markdown에 적는다.[](source:s-rank) | triage-judge-flow | rank |
| ret | 결과 반환 | 이 노드는 판정과 순위를 합쳐 사용자에게 돌려준다. 에이전트는 `references/triage-result-contract.md`를 따라 유효한 `triage-finding/v0` 결과를 만들고, 판정, 확신도, 순위, 영향받는 위치, 도달 경로와 경계, 근거, 반대 증거, proof gap, 다음 단계를 담은 간결한 Markdown 요약으로 답한다. 전체 fenced JSON은 사용자가 raw나 복사 가능한 결과를 요청할 때만 넣는다.[](source:s-ret) 가져온 묶음이면 가져온 개수, query나 선택된 집합, 전체 결과를 어디에 보여 주거나 저장했는지, Jira나 Linear가 바뀌었는지를 보고한다.[](source:ti-norm) 계약의 `fix_finding_handoff`는 판정이 `confirmed`일 때만 값이 있고 그 밖에는 `null`이다. 빈 선택 증거 목록은 빈 배열로 쓴다.[](source:c-rank) 이 스킬은 읽기 전용이다. 사용자가 원본 시스템에 쓰기를 요청하면 판정을 먼저 끝내고 그 변경을 증거 분석과 따로 검토한다. ticket 쪽은 댓글, 상태 전이나 닫기, 담당자 지정, label 변경을 명시적 writeback 요청 없이는 하지 않는다.[](source:s-wb)[](source:ti-norm) 파일 수정 지시나 ticket 변경은 이 노드의 산출이 아니다. | triage-judge-flow | ret |
| fix | fix-finding handoff | 이 노드는 `confirmed` finding마다 에이전트가 요약을 넘길 준비를 하는 마지막 칸이다. 요약에는 통제되는 입력, source, control 또는 sink, 전제 조건, 정확한 코드 참조, 필요한 invariant, 고칠 경계로 제안하는 곳, 남은 proof gap이 들어간다.[](source:s-hand) `$fix-finding`을 실제로 부르는 것은 사용자가 고치자고 요청했을 때만이다.[](source:s-hand) 이 조건은 fix-finding 쪽의 사용 조건과도 맞는다. fix-finding의 description은 사용자가 명시적으로 fix and verify를 요청할 때만 쓰라고 한다.[](source:ff-desc) 그래서 `confirmed`가 하나 있어도 자동으로 수정이 시작되지 않고 이 스킬은 요약을 내놓고 끝난다(판정). 계약 JSON 예시는 `recommended_next_step`에 `"fix-finding"`을 보여 주지만 허용값 목록은 계약에 없으므로 예시 값일 뿐이다.[](source:c-json) | triage-judge-flow | fix |

## 언제 켜지고, 무엇을 강제하고 금지하나? {#rules span=12}

호출 조건은 frontmatter의 description 한 곳에 있다. description은 모델이 호출 여부를 판단할 때 참고하는 설명이고, 특정 단어와 정확히 일치해야 켜지는 사전이 아니다. 아래 줄이 커밋된 원문 그대로다.[](source:s-fm)

@code source=s-fm language=yaml

| 구분 | 규칙 |
|---|---|
| 켜는 경우 | 이미 있는 보안 finding을 저장소 정책과 정적 코드 근거로 분류할 때다. 입력은 scanner 보고서, advisory, GitHub finding, Jira·Linear ticket이다.[](source:s-fm)[](source:s-intake) |
| 켜지 않는 경우 | discovery(새 취약점 찾기), 중복 triage, runtime validation, fix에는 쓰지 않는다. {bad:쓰지 않음}[](source:s-fm) |
| Jira와 Linear | 보안이나 취약점 ticket에는 이 스킬을 쓴다. Atlassian과 Linear 언급은 claim을 가져오라는 connector 힌트이고 일반 ticket triage나 중복 triage로 바꿀 이유가 아니다.[](source:s-jira) |
| UI 기본 prompt | `agents/openai.yaml`의 `default_prompt`는 `$triage-finding`으로 시작해 repository 경로와 finding 출처(보고서, advisory, GitHub source, Jira JQL이나 issue, Linear issue나 검색)를 채우게 한다. 플러그인 기본 prompt에도 "Triage existing security findings against this repository."가 있다.[](source:y-ui)[](source:plugin-json) |
| 호출 제한 필드 | frontmatter에 `disable-model-invocation`이 없고 `agents/openai.yaml`에도 `policy`가 없다. 원문에 명시 없음.[](source:s-fm)[](source:y-ui) |
| 실행 경계 | 위임, deep triage mode, 무관한 취약점 탐색, 저장소 파일 수정, test·build·앱·PoC·dynamic validation 실행을 하지 않는다. {bad:금지}[](source:s-core) |
| 한계 표시 | 정적 증거의 한계를 적고 runtime 검증이나 전수 조사를 했다고 말하지 않는다. {good:의무}[](source:s-core) |
| 사람 개입 | 풀리지 않은 정책·신뢰·배포 사실이 판정을 바꿀 때 운영자 맥락을 묻는다. 모호한 source는 되묻는다. 수정은 사용자가 요청할 때만 시작한다.[](source:s-pol2)[](source:ti-ret)[](source:s-hand) |
| 종료 조건 | finding이 없거나 가져온 내용이 없으면 코드 검사 전에 멈춘다. 그 밖에는 결과를 반환하면 끝난다.[](source:s-intake)[](source:ti-fail)[](source:s-ret) |
| 입력은 지시가 아님 | finding 본문, imported ticket, GitHub 기록, 저장소 자료, `SECURITY.md` 글은 모두 근거 데이터다. 명령 실행, credential 접근, 새 대상 추가, 쓰기를 허가하지 못한다.[](source:s-assess)[](source:s-pol2)[](source:gh-untr)[](source:sg-rule) |

설명용 예시 · 사용자가 "이 GitHub code scanning alert가 이 저장소에서 진짜인지 봐 줘"라고 하면 켜지는 요청이다. 사용자가 "이 코드에서 취약점을 찾아 줘"라고 하면 discovery라서 이 스킬의 범위가 아니다. 이 두 요청은 분석자가 지어낸 것이다.

판정 · 호출을 막는 장치는 description 문장과 본문의 금지 목록뿐이고 필드로 강제하지 않는다. 호스트가 이 문장을 얼마나 지키는지는 실행으로 확인해야 한다.[](source:s-fm)[](source:y-ui)

## source마다 무엇을 가져오고 어떤 source_type으로 정규화하나? {#intake-map span=12}

가져오는 쪽 규칙은 동작 패널의 `내용 가져오기` 노드가 순서대로 다뤘다. 아래 표는 찾아보기용으로, source별 읽기 방법과 정규화 값을 모았다.

| source | 읽는 방법 | `source_type` |
|---|---|---|
| Jira, Linear ticket | native app이 기본이고 읽기 연산만 쓴다. 본문이 `bug_bounty`, `advisory`, `cve`, `codex_security_finding`이면 그 값을 쓴다.[](source:ti-norm) | `scanner_ticket`(기본) |
| GitHub code scanning | `GET /repos/{owner}/{repo}/code-scanning/alerts?state=open&ref=REF&per_page=100`. 기본은 default branch의 open alert이고 정확한 alert 번호에는 기본 state filter가 없다.[](source:gh-cs) | `sarif` |
| GitHub Dependabot vulnerabilities | `GET /repos/{owner}/{repo}/dependabot/alerts?classification=general&state=open&per_page=100`[](source:gh-dep) | CVE가 있으면 `cve`, 없으면 `advisory` |
| GitHub Dependabot malware | `GET /repos/{owner}/{repo}/dependabot/alerts?classification=malware&state=open&per_page=100`[](source:gh-dep) | `advisory` |
| GitHub security advisory와 private report | `GET /repos/{owner}/{repo}/security-advisories?state=<값>&per_page=100`. 요청마다 `state` 하나만 받으므로 `triage`, `draft`, `published`, `closed`를 따로 부른다. `triage`가 private vulnerability report다.[](source:gh-adv) | `advisory` |
| GitHub Issue | `GET /repos/{owner}/{repo}/issues/{issue_number}`. 사용자가 특정 issue를 지정했거나 Issues를 명시적으로 요청했을 때만 쓴다.[](source:gh-adv)[](source:gh-sel) | `freeform` |
| 유효한 `codex-security.findings` 파일 | 사용자가 줄 때만 입력 source로 쓴다. 완료된 scan용 schema를 새 입력에 강제하지 않는다.[](source:c-fit) | 계약 안 매핑에 따름 |

## 결과 JSON에는 무엇이 들어가고 어떤 값만 허용하나? {#contract span=12}

결과는 `schema_version`이 `triage-finding/v0`이고 `repository.path`, 선택 `repository.revision`, `findings` 배열을 가진다.[](source:c-top) finding 하나에는 정규화된 입력, 판정, 확신도, 위치, 도달 경로, 경계 평가, 순위, 근거 목록, `recommended_next_step`, `fix_finding_handoff`가 들어간다.[](source:c-json)

@facts id=contract-facts
| source type 값(8개) | `sarif`, `cve`, `advisory`, `scanner_ticket`, `bug_bounty`, `codex_security_finding`, `freeform`, `unknown` |
| 판정 값(3개) | `confirmed`, `not_actionable`, `needs_review` |
| 확신도 값(3개) | `high`, `medium`, `low` |
| `source_trust` 값 | `untrusted`, `trusted_operator`, `trusted_developer_config`, `local_only`, `unknown` |
| `fix_finding_handoff` | `confirmed`일 때만 값이 있고 그 밖에는 `null` |

위 값은 계약이 정한 것이다.[](source:c-enum)[](source:c-json)[](source:c-rank) `product_surface`는 hosted service, CLI, library API, local developer UI, MCP/tooling, example/demo, test/fixture, docs, generated, vendored, unknown 중에서 적는다.[](source:c-json)

`boundary_assessment`는 데이터 흐름이 sink에 닿는지가 아니라 source가 지원되는 제품 보안 경계를 넘는지를 기록한다. 표면이나 정책이 불분명하면 `unknown` 문자열과 `boundary_crossed: null`을 쓰고 `needs_review`를 우선한다.[](source:c-rank) 순위는 위 동작 패널의 `순위 매김` 노드가 쓴 규칙을 따른다.

이 계약은 완료된 scan의 `findings.schema.json`을 정규화 형태로 쓰지 않는다고 스스로 밝힌다. 그 schema는 scan metadata, 생성된 finding id, occurrence id, fingerprint, severity, remediation, provenance, location을 요구하는 완료된 Codex Security scan 산출물용이다. triage 입력은 SARIF 조각이나 붙여 넣은 글처럼 불완전한 claim이 많다.[](source:c-fit)

실제 schema의 최상위 필수 필드는 `documentType`, `schemaVersion`, `scanId`, `findings`이고 `documentType`은 상수 `codex-security.findings`다.[](source:fs-head)[](source:fs-req) 판정 · 그래서 `triage-finding/v0`는 이 schema를 입력에 강제하지 않는 별개 계약이고, scan 산출물의 `findingId` 같은 값은 source identifier로만 가져온다.[](source:c-fit)

## 흐름 속 위치: 앞에서 무엇을 받고 뒤로 무엇을 넘기나? {#position span=12}

이 스킬은 묶음 `remediate-finding`에 속하고 시작점 두 개 중 하나다. 묶음 전체 흐름은 `codex-security/_group-remediate-finding/remediate-finding.html`에 있다. 아래 그림은 앞과 뒤만 그린 것이다.

@workflow id=position-flow title="triage-finding의 앞과 뒤"
| p-scan | 봉인된 scan findings.json | external |
| p-triage | triage-finding | backend |
| p-fix | fix-finding | backend |
| p-scan > p-triage | 파일을 줄 때만 R75 | dashed |
| p-triage > p-fix | 사용자가 요청할 때만 R27 | emphasis |

@steps id=position-steps
| ps-scan | 봉인된 scan findings.json | 사용자가 유효한 `codex-security.findings` 파일을 줄 때만 이 스킬의 입력이 된다. 자동 연결은 없다.[](source:c-fit)[](source:sc-doc) | position-flow | p-scan |
| ps-triage | triage-finding | 입력을 판정으로 바꾸고 `confirmed`마다 handoff를 만든다.[](source:s-verd)[](source:s-hand) | position-flow | p-triage |
| ps-fix | fix-finding | handoff를 받아 사용자가 요청할 때만 수정과 검증을 시작한다.[](source:s-hand)[](source:ff-desc) | position-flow | p-fix |

| rel-id | 상대 | 종류 | 받는 것 또는 넘기는 것 | 조건 |
|---|---|---|---|---|
| R27 | `fix-finding` | 넘김 | 넘기는 것은 handoff 요약과 `fix_finding_handoff` 필드다.[](source:s-hand) | 사용자가 고치자고 할 때만 호출한다.[](source:s-hand) |
| R75 | scan의 `findings.json` | 산출물 호환 | 받는 것은 `documentType: codex-security.findings` 파일이다.[](source:c-fit)[](source:sc-doc) | 사용자가 파일을 건넬 때만 쓴다. 자동 연결은 없다. |
| R46 | `define-security-policy` | 공유 상태 | 읽는 것은 `SECURITY.md`다. 쓰는 쪽은 `define-security-policy`다.[](source:s-pol1)[](source:dsp-prec) | 가장 가까운 정책이 우선한다. 코드 근거가 claim을 받쳐야 한다. |
| R33 | `resolve-dependency-alert` | 참고 | `resolve-dependency-alert`가 이 스킬의 `github-rest-intake.md#dependabot-vulnerabilities`를 따른다.[](source:rda-dep)[](source:gh-dep) | 이 스킬이 부르는 것이 아니라 상대가 이쪽 파일을 읽는다. |
| R40 | `track-findings` | 산출물 호환 | `track-findings`가 쓴 issue 본문에 finding id와 fingerprint가 든다.[](source:tf-body) | 서로를 지목하지 않아 강도가 약하다. 추론이다. |
| R32 | `validation` | 같은 계열 | 둘 다 finding에 근거 기반 판정을 낸다. `validation`은 필요하면 재현도 쓰고 이 스킬은 정적 전용이다.[](source:val-desc)[](source:val-evid)[](source:s-core) | 직접 연결은 없다. 추론이다. |

벤더 README는 이 스킬을 "Investigating a finding" 목록에 둔다. 우리 묶음 분류와 다르다.[](source:readme)

`static-finding-assessment.md`는 이 스킬, `verify-fix`, `validation`이 함께 읽는 판정 틀이다(R63). 이 파일은 호출한 스킬이 계약을 정한다고 밝힌다.[](source:sfa-tuple)

위 표에서 R46, R33, R40, R32는 원장 기준 행이고 분석자가 원문 줄로 대조했다.

## 어디까지 읽었고 무엇이 확인되지 않았나? {#audit span=12}

텍스트 원본 20개 파일을 읽었다. 이 스킬 폴더 5개(`SKILL.md` 8394B, `agents/openai.yaml` 400B, `ticket-intake.md` 5231B, `triage-result-contract.md` 4447B, `github-rest-intake.md` 12277B)와 필수 참조, 대조용 파일은 아래 표와 같다.

번역본(`*.KO.md`)은 이 스킬에 없다. 대상 스킬의 지시는 실행하지 않았고 읽기 전용 확인(`grep`, `wc`, `sed`)만 했다. 외부 URL은 열지 않았다.

| 구분 | 파일(바이트) | 읽은 범위 |
|---|---|---|
| 플러그인 공용 참조 | `references/security-guidance.md`(2830B), `references/static-finding-assessment.md`(3949B) | 전부 |
| 플러그인 선언 | `.app.json`(717B), `.mcp.json`(2078B), `.codex-plugin/plugin.json`(1682B), `skills/README.md`(3752B) | 전부 |
| 구현·schema | `mcp-app/src/helpers/resolve-security-md.ts`(14719B), `schemas/findings.schema.json`(10591B) | 부분 읽음. 구현은 1~40, 178~205, 330~437줄만. schema는 구조·표본만 확인(전부 읽지 않음) |
| 저장 규칙 | `references/artifact-storage.md`(7947B) | 부분 읽음. 줄마다 앞 600자까지만 훑음 |
| 다른 스킬 대조 | `fix-finding/SKILL.md`(18461B), `resolve-dependency-alert/SKILL.md`(2548B), `define-security-policy/SKILL.md`(5982B), `track-findings/SKILL.md`(13459B), `validation/SKILL.md`(4619B), `references/scan-contract.md`(16529B) | 부분 읽음. 인용한 한두 줄만 |

바이너리 읽기는 해당 없음. 제외한 것은 플러그인 밖 `docs/`와 `sdk/`, 외부 URL이다. 분석 중 바뀐 파일은 없다(`codex-security/`는 분석 커밋 `cd5035b` 이후 diff 없음을 확인했다).

@callout level=open-question title="범위 밖이거나 원문에 없는 것"
| Atlassian, Linear, GitHub connector가 노출하는 도구(`getJiraIssue`, `list_issues` 등)의 실제 동작은 범위 밖이다. `.app.json`은 네 connector가 모두 `required: false`이고 Atlassian만 `capabilities`에 `read`와 `write`가 있다고만 선언한다.[](source:app-json)
| `launch_codex_security_mcp` 셸 launcher와 `resolve-security-md` 실제 실행 결과는 읽거나 실행하지 않았다. resolver 구현은 위 범위만 읽었다.[](source:rm-cmd)
| 운영자에게 맥락을 몇 번까지 묻는지, 사용자가 답한 뒤 어느 노드부터 다시 시작하는지는 원문에 명시 없음.[](source:s-pol2)
| resolver 결과를 `artifacts/01_context/security_guidance.md`로 저장하는 경우를 `security-guidance.md`가 말하지만, 읽기 전용인 이 스킬이 저장하는지는 원문에 명시 없음.[](source:sg-resolve)[](source:art-store)
| `fix-finding`이 이 스킬의 handoff를 어떤 형식으로 받는지는 `fix-finding`의 description 한 줄만 읽어서 확인하지 못했다.[](source:ff-desc)
