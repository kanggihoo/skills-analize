# scanner, Cloud, issue tracker 사이에서 finding은 누가 가져오고 올리고 기록하고 읽나? {#external-findings-page}

이 묶음은 Codex Security 바깥에 있는 finding(외부 scanner 결과, Cloud에 저장된 finding, issue tracker의 ticket)을 가져오거나 올리거나 기록하거나 읽는 일을 위한 스킬 네 개다. 네 스킬은 순서로 이어진 파이프라인이 아니라 입력이 달라서 요청마다 고르는 선택지이고, 스킬끼리 이어 주는 것은 공유 상태(봉인된 scan 폴더, local workbench, Cloud)다. 이 분석은 **부분 분석**이다. Cloud 도구와 issue provider 도구의 정의, `docs/sdk.md` 같은 SDK 문서가 이 저장소에 없다.

- `publish-findings`는 외부 scanner 결과를 local workbench에 저장하고, 저장된 선택분을 사용자가 미리보기를 확인한 뒤에만 Cloud에 게시한다.[](source:pf-desc)[](source:pf-pub)
- `track-findings`는 봉인된 scan 하나의 finding을 Linear, Jira, GitHub issue, 초안 advisory 중 한 곳에 미리보기와 승인을 거쳐 기록한다.[](source:tf-desc)[](source:tf-intro)
- `cloud-findings`는 Cloud의 finding, 보고서, scan 상태를 읽기만 한다. 같은 connector에 쓰기 도구가 있어도 이 스킬의 일이 아니다.[](source:cf-ro)
- 이 묶음 안에서 스킬이 다른 스킬로 넘기는 곳은 `resolve-dependency-alert`가 명시적인 가져오기 요청을 `publish-findings`로 보내는 R35 하나다.[](source:rd-import)

@answer scope="원문 분석 · 도구 정의 일부가 트리에 없음 · 부분 분석"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source pf-desc title="frontmatter description" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=3:3
@source pf-intent title="요청 문구별 시작점" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=8:8
@source pf-select title="증거 선택" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=12:14
@source pf-table title="scanner별 수집 표" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=16:30
@source pf-cont title="AWS Continuum 행" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=25:25
@source pf-patch title="AWS Continuum patches 행" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=28:28
@source pf-local title="로컬 가져오기" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=38:40
@source pf-pub title="Cloud 게시" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=44:44
@source pf-retry title="게시 중단과 재시도" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=46:46
@source pf-yaml title="implicit invocation 선언" path=codex-security/plugins/codex-security/skills/publish-findings/agents/openai.yaml lines=5:6
@source tf-desc title="frontmatter description" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=3:3
@source tf-intro title="범위와 승인 원칙" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=8:8
@source tf-app title="app과 gh CLI 사용 규칙" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=10:12
@source tf-valid title="봉인 검증 helper" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=16:26
@source tf-dest title="destination 선택" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=30:30
@source tf-limit title="provider 접근 제한" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=43:43
@source tf-assoc title="저장된 연결 읽기" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=57:57
@source tf-dup title="중복 검색 결과" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=59:68
@source tf-prev title="미리보기와 승인" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=80:80
@source tf-serial title="순서대로 쓰기" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=88:88
@source tf-record title="receipt 기록과 readback" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=90:92
@source tf-yaml title="implicit invocation 선언" path=codex-security/plugins/codex-security/skills/track-findings/agents/openai.yaml lines=5:6
@source jira-limit title="Jira 쓰기 범위" path=codex-security/plugins/codex-security/skills/track-findings/references/jira.md lines=31:31
@source adv-limit title="advisory 쓰기 범위" path=codex-security/plugins/codex-security/skills/track-findings/references/github-security-advisories.md lines=24:24
@source cf-desc title="frontmatter description" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=3:3
@source cf-ro title="읽기 전용 원칙" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=8:8
@source cf-tools title="도구 탐색 규칙" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=10:10
@source cf-boot title="bootstrap 호출" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=14:14
@source cf-ambig title="account와 repository 모호함" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=21:21
@source cf-link title="finding 링크 해석" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=23:23
@source cf-imp title="가져온 scanner finding 읽기" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=27:27
@source cf-page title="페이지와 부분 읽기" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=31:31
@source cf-scan title="scan 상태 읽기" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=54:56
@source cf-yaml title="skill 메타데이터" path=codex-security/plugins/codex-security/skills/cloud-findings/agents/openai.yaml
@source rd-desc title="frontmatter description" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=3:3
@source rd-untrusted title="보고서 필드를 믿지 않는 원칙" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=8:8
@source rd-import title="가져오기 요청 넘김과 알림 조회" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=10:10
@source rd-ro title="읽기 전용 평가" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=12:12
@source rd-fix title="업그레이드 요청 때만 편집" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=14:14
@source rd-dismiss title="dismissal 승인" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=18:18
@source rd-yaml title="skill 메타데이터" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/agents/openai.yaml
@source ff-patch title="시작 후보 patch 읽기" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=38:38
@source ap-cont title="Continuum evidence 읽기 규칙" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=21:21
@source tr-in title="ticket 입력 조건" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=18:18
@source sr title="SDK 소유 scan 봉인" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md lines=13:13
@source sd-end title="diff scan 완료 호출" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=33:33
@source ds-end title="Deep scan 완료 처리" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=14:14
@source sc-files title="봉인 문서 구성" path=codex-security/plugins/codex-security/references/scan-contract.md lines=9:14
@source sc-status title="종료 상태와 부분 결과" path=codex-security/plugins/codex-security/references/scan-contract.md lines=32:41
@source sc-mode title="scan mode 표" path=codex-security/plugins/codex-security/references/scan-contract.md lines=122:132
@source sealed-prof title="tracking profile의 report.md 확인" path=codex-security/plugins/codex-security/mcp-app/src/sealed-contract.ts lines=214:215
@source vts title="tracking source helper" path=codex-security/plugins/codex-security/mcp-app/src/helpers/validate-tracking-source.ts lines=13:41
@source fit-desc title="issue 이력 도구 설명" path=codex-security/plugins/codex-security/mcp-app/src/server/finding-issue-tools.ts lines=89:113
@source fit-state title="이력 저장소를 열 수 없을 때" path=codex-security/plugins/codex-security/mcp-app/src/server/finding-issue-tools.ts lines=62:83
@source wp-conflict title="다른 finding에 연결된 issue 거부" path=codex-security/plugins/codex-security/scripts/workbench_publication.py lines=250:259
@source wp-upsert title="같은 receipt 다시 기록" path=codex-security/plugins/codex-security/scripts/workbench_publication.py lines=265:276
@source hm title="외부 finding helper 이름" path=codex-security/plugins/codex-security/mcp-app/helpers-main.ts lines=86:95
@source ef-stored title="저장된 외부 finding 형태" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts lines=42:53
@source ef-abs title="repository는 절대 경로" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts lines=64:70
@source ef-ins title="중복 거부와 finding id 계산" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts lines=147:169
@source ef-upd title="unchanged와 updated 계산" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts lines=198:221
@source efp-type title="게시 receipt 형태" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-finding-publications.ts lines=5:17
@source efp-rec title="게시 receipt 기록 검사" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-finding-publications.ts lines=31:60
@source app-json title="connector 선언" path=codex-security/plugins/codex-security/.app.json
@source mcp-json title="MCP 서버 선언" path=codex-security/plugins/codex-security/.mcp.json

## 네 스킬은 요청에 따라 무엇을 읽고 어디에 쓰나? {#behavior span=12}

에이전트는 입력을 보고 스킬을 고른다. 입력이 외부 scanner의 보고서면 `publish-findings`, 봉인된 scan 폴더면 `track-findings`, Cloud 계정에 이미 있는 기록이면 `cloud-findings`다. 아래 그림은 데이터가 가는 방향을 화살표로 그렸다.

간선 라벨의 R번호는 `relations.md`의 관계 ID다. 노드를 눌러 읽으면 노드마다 그 단계에서 에이전트가 하는 일이 오른쪽 목록에 나온다.

@architecture id=external-findings-flow title="입력과 공유 상태로 이어진 네 스킬"
| scanner | 외부 scanner 보고서 | external |
| rda | resolve-dependency-alert | backend |
| pf | publish-findings | backend |
| sealed | 봉인된 scan 폴더 | database |
| tf | track-findings | backend |
| wb | local workbench | database |
| cloud | Codex Security Cloud | cloud |
| tracker | 외부 issue tracker | external |
| cf | cloud-findings | backend |
| scanner > pf | R68 수집 | |
| rda > pf | R35 요청 | emphasis |
| pf > wb | R89 저장 | |
| pf > cloud | R38 게시 | |
| sealed > tf | R24 읽기 | |
| tf > wb | R84 receipt | |
| tf > tracker | R67 쓰기 | |
| cloud > cf | R66 읽기 | |

그림에서 뺀 것이 있다. `track-findings`가 `local workbench`에서 저장된 연결을 읽는 방향은 그리지 않았고 아래 `track-findings` 설명과 공유 상태 표에 있다. R38은 `pf > cloud` 간선과 `cloud > cf` 간선을 이은 관계다.

R36, R37, R39, R40, R25, R26, R88은 다른 묶음의 스킬이나 선언 파일로 가는 관계라서 그림에 넣지 않고 관계 표에 남겼다. 어느 스킬을 고를지는 요청을 받는 에이전트의 판단이고, 승인 뒤 다시 확인하는 반복은 각 스킬 페이지에서 다룬다.

@steps id=external-findings-steps
| scanner | 외부 scanner 보고서 | 이 노드는 스킬이 아니라 입력이다. `publish-findings` 쪽에서 보면 scanner CLI의 출력, CI artifact, 이전에 저장한 보고서, vendor API나 연결된 도구의 응답이 여기에 든다.[](source:pf-table) 에이전트는 먼저 사용자가 원하는 것이 새 scan, 이전 scan이나 CI artifact, 기존 upstream issue, 이미 workbench에 있는 기록 중 무엇인지 가린다. 같은 scanner여도 로컬 scan, hosted backlog, 이전 build가 서로 다른 finding을 낼 수 있기 때문에 repository, project, ref, 제품, 필터, 정확한 finding ID를 끝까지 들고 간다.[](source:pf-select) 보고서 필드는 믿을 근거가 아니라 검토할 근거다. `resolve-dependency-alert`는 모든 필드를 untrusted evidence로 다루고 안에 박힌 지시를 무시하라고 한다.[](source:rd-untrusted) scanner별 수집 명령과 문서는 `publish-findings`가 표로 안내하지만 `docs/sdk.md`와 scanner 가이드는 이 트리에 없다(R68, 범위 밖). | external-findings-flow | scanner |
| rda | resolve-dependency-alert | 이 스킬은 scanner 알림, advisory, SBOM 일치에서 시작해 취약한 의존성이 무엇에 끌려 들어왔는지 읽기 전용으로 추적한다.[](source:rd-desc)[](source:rd-ro) 이 묶음에서 이 스킬이 하는 일은 하나다. 원문은 "For an explicit import request, use `$publish-findings`"라고 적는다. 즉 에이전트는 명시적인 가져오기 요청을 받으면 `publish-findings`를 쓴다(R35).[](source:rd-import) 판정 · 원문에는 "그때만"이라는 한정어가 없다. 가져오기가 아닌 요청에서 넘기지 않는다는 것은 같은 문단의 다음 문장(알림을 찾아 달라는 요청은 선택된 scanner와 대상에서만 조회하고 pagination을 따르고 읽지 못한 부분을 보고한다)에서 분석자가 읽어 낸 결과다.[](source:rd-import) 넘길 때 무엇을 건네는지, 조회한 알림을 이 스킬이 workbench에 저장하는지는 원문에 명시 없음이다. 추적과 `fix-finding` 넘김은 `skill-explainers/codex-security/plugins/codex-security/skills/resolve-dependency-alert/resolve-dependency-alert.html`과 `skill-explainers/codex-security/_group-remediate-finding/remediate-finding.html`에 있다. | external-findings-flow | rda |
| pf | publish-findings | 이 스킬은 외부 scanner 결과를 local workbench로 가져오고, 저장된 선택분을 Cloud에 게시한다.[](source:pf-desc) 에이전트는 요청 문구로 시작점을 가른다. 게시하라는 요청이면 local workbench에서 시작하고, 가져오라는 요청이면 기록을 받아 local에 저장하고, 가져와서 게시하라는 요청이면 가져오기가 돌려준 선택분을 게시한다.[](source:pf-intent) 로컬 가져오기에서는 먼저 `--dry-run`으로 repository, evidence, 제외 항목, scanner 오류를 검토한다. 쓰기는 사용자가 승인한 뒤 `--dry-run`을 빼고 `--yes`로 하고, 결과의 import ID와 finding version을 보관한다. 부분 가져오기는 exit code 1로 끝나므로 저장된 finding을 확인하고 제외 항목을 보고한 뒤에 재시도한다.[](source:pf-local) Cloud 게시에서는 `listLocalExternalImports`로 import를 찾고 `prepareStoredFindingsPublication`으로 준비해 계정, destination, evidence, 제외 항목을 보여 준다. 사용자가 미리보기를 확인한 뒤에만 승인된 group마다 `group.publish(group.reviewId)`를 부른다.[](source:pf-pub) 중단되면 저장한 review ID로 중단된 group과 시작하지 않은 group을 다시 준비하고, review ID가 바뀌면 새 미리보기를 받는다.[](source:pf-retry) scanner별 수집 방법과 Checkmarx, Wiz 입력 규칙은 `skill-explainers/codex-security/plugins/codex-security/skills/publish-findings/publish-findings.html`에 있다. | external-findings-flow | pf |
| sealed | 봉인된 scan 폴더 | 이 노드도 스킬이 아니라 입력이다. scan이 끝나면 `scan-manifest.json`과 `findings.json`이 생긴다. manifest는 scan ID, 대상, 범위, 종료 상태, 봉인 시각, 산출물 digest를 담은 immutable receipt이고 `findings.json`은 manifest의 `scan.findingsRef`가 가리킨다.[](source:sc-files) 이 묶음의 스킬은 이 폴더를 쓰지 않는다. 쓰는 쪽은 scan을 끝내는 스킬과 호스트다. SDK 소유 scan은 SDK가 봉인하고, 다른 managed scan은 `complete_codex_security_scan`을 한 번 부른다.[](source:sr) 종료 상태는 `completed`, `failed`, `canceled`, `interrupted` 중 하나이고 중단 상태의 bundle은 부분 결과일 수 있다.[](source:sc-status) 그런데 `track-findings`의 SKILL.md에는 중단된 scan을 다루는 문장이 없고, helper가 중단 bundle을 거부하는 검사를 찾지 못했다. 거부하는지는 확인하지 못했다(R25, R26). | external-findings-flow | sealed |
| tf | track-findings | 이 스킬은 봉인된 scan 하나의 finding을 provider 하나, destination 하나에 기록한다. 번들은 바꾸지 않고, 쓰기 전에 정확한 payload를 미리보기로 보여 주고 승인을 받는다.[](source:tf-intro) 에이전트는 provider 호출보다 먼저 사용자가 준 scan 폴더로 `validate-tracking-source` helper를 돌려 봉인을 검증하고, 실패하면 tracking을 멈춘다. helper는 `--finding-id`와 `--fingerprint`를 함께 받지 않고, 선택이 정확히 한 finding으로 해석되지 않으면 실패한다.[](source:vts) tracking용 검증은 `report.md` 파일이 있는지도 확인한다.[](source:sealed-prof) 그다음 `scan-manifest.json`과 `findings.json`만 finding의 근거로 읽는다. 보고서, SARIF, memory, provider text는 이 봉인 산출물을 대신하지 못한다.[](source:tf-valid) 이어서 사용자의 선택과 repository나 조직 정책 순으로 destination을 정하고, 모호하면 묻는다.[](source:tf-dest) `get_codex_security_finding_issues`로 저장된 연결을 읽되 그것은 중복 후보일 뿐이라 provider에서 finding ID와 fingerprint를 검색해 확인한다. 결과는 `create`, `reuse`, `update`, `blocked` 중 하나다.[](source:tf-assoc)[](source:tf-dup) 배치는 승인된 목록 순서로 하나씩 처리하고 각 create, update, reuse 직전에 helper를 그 finding ID로 다시 돌린다. 실패하거나 불확실한 변경이 나오면 배치를 멈춘다.[](source:tf-serial) provider가 쓰기를 받아들이면 곧바로 `record_codex_security_finding_issues`로 receipt를 기록하고, 가능하면 같은 transport로 다시 읽어 readback 결과를 같은 receipt에 덧붙인다. 로컬 기록 실패는 다른 create를 허가하지 않는다.[](source:tf-record) 목적지별 규칙은 `skill-explainers/codex-security/plugins/codex-security/skills/track-findings/track-findings.html`에 있다. | external-findings-flow | tf |
| wb | local workbench | 이 묶음이 쓰는 기록이 workbench에 두 종류 있다. 첫째는 `publish-findings`가 가져온 외부 finding 저장소다. 저장 단위는 repository(절대 경로), provider, source key, source finding ID, evidence이고 저장 직후 평가 상태는 `not_assessed`다.[](source:ef-stored)[](source:ef-abs) finding id는 `ext_` 뒤에 repository, provider, source key, source finding ID를 JSON으로 묶은 sha256을 붙인 값이다. source key가 id 입력에 들어가므로 같은 알림이어도 source key가 바뀌면 새 finding이 되고, 한 batch 안에서 source finding ID가 겹치면 거부한다.[](source:ef-ins) 같은 id를 다시 저장할 때 evidence가 같으면 `unchanged`로 세고 다르면 version을 올려 `updated`로 센다.[](source:ef-upd) Cloud 게시 receipt의 outcome은 `created`, `updated`, `unchanged`, `private_job`이고, 기록하려는 finding id와 version이 그 repository에 없으면 오류가 난다.[](source:efp-type)[](source:efp-rec) 둘째는 `track-findings`가 쓰는 issue 이력이다. 같은 destination에서 같은 issue identifier가 다른 finding에 이미 연결돼 있으면 기록을 거부하고, 같은 receipt를 다시 기록하면 갱신한다. 이때 `url`은 먼저 저장된 값이 비어 있을 때만 새 값으로 채우고 `readback`은 새 값이 있으면 바뀐다.[](source:wp-conflict)[](source:wp-upsert) 이 이력을 읽고 쓰는 도구는 provider에 연락하지 않고,[](source:fit-desc) 이력 저장소를 열 수 없어 helper가 종료 코드 73으로 끝나면 읽기 도구는 `state_unavailable` 오류를 돌려준다.[](source:fit-state) 외부 finding helper(`store-external-findings` 등)의 이름은 `helpers-main.ts`에 있지만 SKILL.md는 그 이름을 지목하지 않는다. 어느 구성요소가 실제로 helper를 부르는지는 확인하지 못했다(R89).[](source:hm) | external-findings-flow | wb |
| cloud | Codex Security Cloud | 이 노드는 Cloud 서비스다. `publish-findings`가 승인된 group을 올리는 목적지이고 `cloud-findings`가 읽는 대상이다. 두 스킬은 서로를 이름으로 지목하지 않는다. `cloud-findings`가 imported scanner finding을 읽는 방법(`api_version`의 `v2`, `source`, `provider`)을 적기 때문에 올라간 finding을 읽을 수 있다는 것은 분석자의 추론이다(R38).[](source:cf-imp) Cloud 쪽 정의는 이 트리에 거의 없다. `defense_factory_*` 도구는 호출 시점에 tool search로 찾고 노출된 것만 쓰라고 하며,[](source:cf-tools) connector `connector_openai_defense_factory`는 `.app.json`에 `required: false`로 선언만 돼 있다(R66, 범위 밖).[](source:app-json) 같은 플러그인의 `.mcp.json`은 `codex-security` MCP 서버 하나만 선언하므로 Cloud 도구가 어느 경로로 노출되는지는 원문에 명시 없음이다.[](source:mcp-json) 저장 방식과 권한도 원문에 명시 없음이다. | external-findings-flow | cloud |
| tracker | 외부 issue tracker | 이 노드는 Linear, Jira(Atlassian), GitHub issue, 초안 GitHub security advisory를 가리킨다. `track-findings`는 각 native app을 쓰고, 사용자가 활성 계정과 정확한 destination을 고르면 `gh` CLI도 쓴다. 앱으로 닿지 않으면 계정, hostname, repository, 가시성을 보여 주고 허락을 구하며, transport나 계정을 조용히 바꾸지 않는다.[](source:tf-app) 쓰기 범위는 추적으로 한정된다. repository 생성, 설정과 app 접근 변경, push, 정책 우회를 하지 않는다.[](source:tf-limit) Jira는 comment, 상태 전이, 첨부, watcher 관리를 하지 않고[](source:jira-limit) advisory는 만들기만 하고 수정, 공개, 닫기, CVE 요청을 하지 않는다.[](source:adv-limit) provider 쪽 도구(`createJiraIssue`, `gh issue create` 등)의 동작은 이 트리에 없고 연결도 실행도 하지 않았다(R67, 범위 밖). | external-findings-flow | tracker |
| cf | cloud-findings | 이 스킬은 연결된 Cloud 계정의 finding, 보고서, 기록된 assignment와 verification, scan 상태를 읽기만 한다. scan 시작과 취소, finding 닫기와 수정, patch 생성, 검증 실행, 결과 업로드, 알림 전송은 금지한다.[](source:cf-ro) 에이전트는 데이터를 읽기 전에 `defense_factory_*` 도구를 tool search로 찾아 현재 schema를 확인하고, 노출된 도구와 파라미터만 쓴다. 요청한 기능이 없으면 어느 부분을 못 했는지 말하고 가능한 부분만 이어서 한다.[](source:cf-tools) 그다음 `defense_factory_bootstrap`을 불러 계정 context를 정하고, account나 repository가 모호하면 사용자에게 고르게 하며 비대화형이면 모호함과 필요한 선택을 말하고 멈춘다.[](source:cf-boot)[](source:cf-ambig) 가져온 scanner finding을 보려면 `api_version`을 `v2`로 고르고 필요하면 `source`와 `provider`로 거른다.[](source:cf-imp) 전체 목록이나 개수를 요청받으면 cursor를 끝까지 따르고, 일부만 읽었으면 그렇게 밝힌다.[](source:cf-page) scan 상태는 실패하거나 취소되거나 끝나지 않은 scan이 finding 0건이어도 깨끗한 scan으로 쓰지 않는다.[](source:cf-scan) 도구 호출 규칙은 `skill-explainers/codex-security/plugins/codex-security/skills/cloud-findings/cloud-findings.html`에 있다. | external-findings-flow | cf |

설명용 예시로 세 요청을 따라가 본다. 요청은 모두 지어낸 것이다.

- 요청 "Trivy 보고서를 local에 가져오고 Cloud에도 올려 줘." 이것은 원문의 import and publish 구분에 해당한다.[](source:pf-intent) `publish-findings`는 `--dry-run` 결과에서 repository, evidence, 제외 항목을 검토하고, 사용자가 승인하면 `--yes`로 저장한다. 이어서 저장 결과의 import ID로 게시를 준비해 미리보기를 보여 주고, 확인을 받으면 group마다 `group.publish`를 부른다.[](source:pf-local)[](source:pf-pub)
- 요청 "이 scan 폴더의 finding 하나를 Jira에 등록해 줘." `track-findings`는 helper가 그 finding ID 하나로 해석되면 destination을 정하고 중복을 검색한다. 같은 finding을 추적하는 issue가 하나만 나오면 결과는 `reuse`이고, 이때는 provider 쓰기 승인이 필요하지 않다. 없으면 `create` 미리보기를 보여 주고 승인 뒤에 쓴다.[](source:tf-dup)[](source:tf-prev)
- 요청 "Cloud에 있는 이 finding 링크의 검증 상태를 알려 줘." `cloud-findings`는 링크가 `/codex/cloud/security/findings/<finding-id>` 형태일 때 마지막 경로 조각을 한 번 decode해 `defense_factory_findings_get`으로 읽는다. 읽기만 하고 아무것도 바꾸지 않는다.[](source:cf-link)[](source:cf-ro)

## 공유 상태는 누가 쓰고 누가 읽나? {#shared-state span=12}

네 스킬은 서로를 거의 부르지 않는다. 대신 같은 기록을 쓰거나 읽는다. 표의 "쓰는 스킬"이 이 묶음 밖이면 그렇게 적었다.

| 기록 | 쓰는 스킬 | 읽는 스킬 | 근거 |
| --- | --- | --- | --- |
| 봉인된 scan 폴더(`scan-manifest.json`, `findings.json`) | 이 묶음에는 없다. scan을 끝내는 스킬과 호스트나 SDK가 봉인한다 | `track-findings` | R24~R26.[](source:sc-files)[](source:sr) |
| local workbench의 외부 finding 저장소와 import 기록 | `publish-findings`(helper를 부르는 구성요소는 미확인) | `publish-findings`. 저장된 `.evidence`는 `attack-path-analysis`와 `fix-finding`도 읽는다(다른 묶음) | R89, R36, R37.[](source:ef-stored)[](source:pf-cont)[](source:ff-patch) |
| local workbench의 Cloud 게시 receipt | `publish-findings`(helper `record-external-finding-publications`, 호출 주체 미확인) | 같은 helper 계열의 `list-external-finding-publications`(호출 주체 미확인) | R89.[](source:hm)[](source:efp-type) |
| local workbench의 issue 이력(`track-findings`의 receipt) | `track-findings` | `track-findings`. 저장된 연결에는 이전 scan의 occurrence와 CLI 게시도 들어 있다고 한다 | R84.[](source:tf-assoc)[](source:tf-record) |
| Cloud에 저장된 finding | `publish-findings`(`group.publish`) | `cloud-findings`. 쓰기 도구는 금지다 | R38, R39.[](source:pf-pub)[](source:cf-ro) |
| tracker의 issue와 초안 advisory | `track-findings` | `track-findings`(중복 검색과 readback). `triage-finding`은 ticket을 입력으로 받는다(다른 묶음) | R67, R40.[](source:tf-record)[](source:tr-in) |

판정 · 공유 상태 표의 둘째 행과 셋째 행은 `publish-findings`가 쓰고 읽는 것으로 적었지만, SKILL.md는 helper 이름 없이 "Import findings into the local workbench"라는 말로 안내할 뿐이다. 그래서 이 두 행은 SKILL.md의 지시와 helper 구현을 맞춰 본 추론이다.[](source:pf-desc)[](source:hm)

## 언제 켜지고 무엇을 쓰기 전에 사람이 확인하나? {#activation span=12}

네 스킬의 description은 모델이 켤지 판단할 때 참고하는 설명이다. 이 단어가 있으면 켜진다는 사전이 아니다.

@code id=pf-desc-code source=pf-desc language=yaml
@code id=tf-desc-code source=tf-desc language=yaml
@code id=cf-desc-code source=cf-desc language=yaml
@code id=rd-desc-code source=rd-desc language=yaml

| 스킬 | 입력 | 외부에 쓰나 | 쓰기 전 사람 확인 | 자동 호출 선언 |
| --- | --- | --- | --- | --- |
| `publish-findings` | 외부 scanner 결과 | local workbench, Cloud | `--dry-run` 검토 후 승인해 `--yes`, Cloud는 미리보기 확인 후 `group.publish`[](source:pf-local)[](source:pf-pub) | `allow_implicit_invocation: true`[](source:pf-yaml) |
| `track-findings` | 봉인된 scan 하나 | tracker {caution:provider에 씀} | 정확한 payload 미리보기를 승인. `reuse`는 provider 쓰기 승인이 필요 없다[](source:tf-prev) | `allow_implicit_invocation: true`[](source:tf-yaml) |
| `cloud-findings` | Cloud의 기록, finding 링크 | {good:쓰지 않는다} | 해당 없음[](source:cf-ro) | `policy` 필드 없음. 기본값은 원문에 명시 없음[](source:cf-yaml) |
| `resolve-dependency-alert` | 알림, advisory, SBOM 일치 | 사용자가 업그레이드를 요청할 때만 편집(`fix-finding`으로 넘김) | dismissal은 권한 있는 사람만 승인하고 실행한다[](source:rd-fix)[](source:rd-dismiss) | `policy` 필드 없음. 기본값은 원문에 명시 없음[](source:rd-yaml) |

## 스킬 사이의 관계는 원장의 어느 행인가? {#relations span=12}

그림에 나온 관계와 뺀 관계를 모두 적었다. 종류, 근거 방식, 조건은 원장과 같다. 원장과 원문이 어긋난 R37의 설명은 표 아래에 따로 적었다.

| rel-id | from → to | 종류(근거 방식) | 조건·강도 | 그림 |
| --- | --- | --- | --- | --- |
| R24 | `security-scan` → `track-findings` | 산출물 호환(명시-역할) | `track-findings`는 "one sealed scan"만 받고 `scan-manifest.json`과 `findings.json`을 읽으며, 사용자가 요청할 때 따로 호출하고 자동 순서는 없다[](source:tf-intro)[](source:tf-valid) | 있음 |
| R25 | `security-diff-scan` → `track-findings` | 산출물 호환(명시-역할) | 완료할 때 `complete_codex_security_scan`을 한 번 부르면 봉인과 `report.md`가 생기지만 중단 상태 bundle을 `track-findings`가 거부하는지는 미확정이다[](source:sd-end)[](source:sc-mode)[](source:sc-status) | 생략 |
| R26 | `deep-security-scan` → `track-findings` | 산출물 호환(명시-역할) | R25와 같다. `deep_repository`도 같은 봉인 계약이다[](source:ds-end)[](source:sc-mode) | 생략 |
| R35 | `resolve-dependency-alert` → `publish-findings` | 넘김(명시-이름) | 명시적인 가져오기 요청이면 `publish-findings`를 쓰라고 하고, 알림을 찾아 달라는 요청은 선택된 scanner와 대상만 조회한다[](source:rd-import) | 있음 |
| R36 | `publish-findings` → `attack-path-analysis` | 넘김(명시-이름) | AWS Continuum 항목에 한해 선택한 issue의 저장된 `.evidence`를 넘기고, 받는 쪽은 `source_data.evidence_artifacts`를 읽는 규칙을 따로 둔다[](source:pf-cont)[](source:ap-cont) | 생략(다른 묶음) |
| R37 | `publish-findings` → `fix-finding` | 산출물 호환(명시-역할) | 아래 설명을 본다[](source:pf-patch)[](source:ff-patch) | 생략(다른 묶음) |
| R38 | `publish-findings` → `cloud-findings` | 산출물 호환(추론) | 두 스킬은 서로를 이름으로 지목하지 않는다. `cloud-findings`가 imported scanner finding을 읽는 방법을 적는다[](source:pf-pub)[](source:cf-imp) | 있음(`pf > cloud`, `cloud > cf`) |
| R39 | `cloud-findings` → `publish-findings` | 참고(명시-역할) | `cloud-findings`는 "upload results"를 금지하며 업로드가 `publish-findings`의 일이라는 것은 이름 없이 역할로만 드러난다[](source:cf-ro) | 생략 |
| R40 | `track-findings` → `triage-finding` | 산출물 호환(추론) | `triage-finding`이 "security or vulnerability Jira/Linear tickets"를 입력으로 받지만 서로를 지목하지 않아 약하다[](source:tr-in) | 생략(다른 묶음) |
| R66 | `cloud-findings` → Cloud 도구 `defense_factory_*` | 참고(명시-이름), 범위 밖 | 도구 이름과 schema는 호출 시점에 tool search로 찾는다. 이 트리에 정의가 없다[](source:cf-tools)[](source:app-json) | 있음(`cloud > cf`) |
| R67 | `track-findings` → Linear, Atlassian, GitHub app의 도구와 `gh` | 참고(명시-이름), 범위 밖 | 기록 전에 미리보기와 승인을 받고 계정이나 transport를 조용히 바꾸지 않는다[](source:tf-app)[](source:tf-prev) | 있음 |
| R68 | `publish-findings` → 외부 scanner CLI와 문서 | 참고(명시-이름), 범위 밖 | scanner별 수집 방법을 표로 안내한다. 이 저장소에는 플러그인 밖 `docs/`와 SDK가 없다[](source:pf-table) | 있음 |
| R84 | `track-findings` → helper `validate-tracking-source`와 issue 이력 도구 | 참고(명시-이름) | 봉인 검증, 저장된 연결 읽기, 쓰기 직후 receipt 기록[](source:tf-valid)[](source:tf-assoc)[](source:tf-record)[](source:fit-desc) | 있음(`tf > wb`) |
| R88 | 여러 스킬 → `.app.json`의 connector 선언 | 참고(명시-이름) | 4개 connector 모두 `required: false`이고 Atlassian만 `capabilities`에 read와 write가 있다[](source:app-json) | 생략 |
| R89 | `publish-findings` → local workbench의 외부 finding 저장소 | 참고(추론) | SKILL.md가 helper 이름을 지목하지 않고 호출 주체는 이 트리 밖(SDK, CLI)이다[](source:pf-desc)[](source:hm) | 있음 |

R37은 원장이 "Continuum finding 하나를 `--source-root`와 함께 수집하면 patch가 따라온다"고 적었다. 원문을 다시 읽으니 이 문장은 `publish-findings`의 SKILL.md에 없다.

직접 적힌 것은 둘이다. `AWS Continuum patches` 행이 `--finding-id`, `--source-root`, `--repository-name`으로 finding 하나를 수집하는 명령을 안내하고, 그 안내 링크의 anchor 이름이 `collect-a-finding-with-patches`다.[](source:pf-patch) 그리고 `fix-finding`은 시작 후보 patch로 collector capture의 `patches[].patch`나 저장된 finding의 `source_data.patches[].patch`를 읽으라고 한다.[](source:ff-patch) 판정 · 이 둘을 이으면 R37의 산출물 호환이 성립하지만, 수집 결과에 patch가 담긴다는 서술 자체는 행 이름과 anchor에서 읽은 분석자의 해석이다.

## 어디까지 읽었고 무엇이 남았나? {#audit span=12}

읽은 텍스트 파일은 31개이고(전부 읽음 20개 96,108B, 일부만 읽음 11개), 파일 전체 크기 합계는 232,763B다. 목록과 읽은 범위, 바이트는 같은 폴더의 `files.md`에 있다. 이 페이지 하단의 출처는 본문이 직접 인용한 줄 범위만 담는다. 분석 대상 폴더 `codex-security/`의 working tree는 분석 커밋 `cd5035b`와 같고, 분석 중 바뀐 파일은 없다.

번역본(`*.KO.md`)은 없었고 열지 않았다. 외부 URL은 열지 않았고 `scripts/`와 `mcp-app/`의 코드는 읽기만 하고 실행하지 않았다. 바이너리는 이 묶음 범위에 없었다.

일부만 읽은 파일은 다음과 같다. `collect_checkmarx.py`와 `collector_paths.py`는 끝까지 읽었다.

`sealed-contract.ts`(36,923B)는 205~220줄만, `workbench_publication.py`(20,245B)는 170~300줄만, `external-findings.ts`(11,530B)는 1~70, 100~260줄만, `scan-contract.md`(16,529B)는 1~20, 28~45, 120~134줄만, `scan-manifest.schema.json`은 20~22줄만 읽었다. 다른 스킬의 SKILL.md 5개(`fix-finding`, `attack-path-analysis`, `triage-finding`, `security-diff-scan`, `deep-security-scan`)와 `scan-results.md`는 인용한 줄과 그 주변(`triage-finding`은 앞 5줄 포함)만 읽었다.

@callout level=open-question title="이 묶음에서 확인하지 못한 것"
`track-findings`가 `failed`, `canceled`, `interrupted` 상태의 bundle을 거부하는지는 확인하지 못했다. 거부하는 검사 코드를 찾지 못했을 뿐이고, SKILL.md에는 중단된 scan을 다루는 문장이 없다(R25, R26).
`publish-findings`의 외부 finding helper(`store-external-findings`, `record-external-finding-publications` 등)를 실제로 부르는 구성요소는 이 트리 안에 없다. SKILL.md가 이름을 적지 않고 호출 주체는 SDK와 CLI(`codex-security publish findings`)다(R89).
`defense_factory_*` 도구와 provider 도구(`createJiraIssue`, `gh issue create` 등)의 정의와 동작은 이 트리에 없다. 연결하지 않았고 실행하지 않았다(R66, R67).
`resolve-dependency-alert`가 `publish-findings`로 넘길 때 무엇을 건네는지, 그리고 `cloud-findings`와 `resolve-dependency-alert`가 자동 호출되는지는 원문에 명시 없음이다(R35).
