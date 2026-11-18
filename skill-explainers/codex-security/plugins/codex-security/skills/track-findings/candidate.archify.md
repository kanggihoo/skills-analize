# track-findings는 봉인된 scan의 finding을 어떻게 승인받아 기록하나? {#track-findings-page span=12}

`track-findings`는 Codex Security가 봉인한 scan 하나에서 검증된 finding을 골라 Linear, Jira, GitHub issue, 초안 GitHub security advisory 중 한 곳에 기록해 주는 스킬이다.[](source:skill-front)[](source:skill-scope)

- 사용자가 봉인된 scan 폴더를 주고 기록을 요청할 때 쓴다. 에이전트는 먼저 helper로 봉인을 검증하고, 중복을 찾고, 쓸 내용을 미리 보여 주고, 승인받은 뒤에만 한 항목씩 쓴다.[](source:skill-validate)[](source:skill-preview)
- 에이전트가 내놓는 것은 항목별 미리보기, 승인된 issue나 초안 advisory, 로컬 issue 이력에 남기는 영수증, 완료·재사용·막힘·실패·불확실·미처리로 나눈 보고다.[](source:skill-record)[](source:skill-recover)
- scan을 돌리거나 취약점을 고치는 데는 쓰지 않는다. 두 provider에 한꺼번에 쓰지 않고, transport나 계정을 조용히 바꾸지 않는다.[](source:skill-front)[](source:skill-scope)[](source:skill-dest)
- 이 분석은 SKILL.md, 참고 파일 둘, 호출 정책, 필수 참조 소스를 읽었다. helper, 도구, provider는 실행하지 않았다.

@answer scope="필수 참조 파일까지 읽음 · 실행 없음 · provider 도구 동작은 범위 밖"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=243a9028dc78fe13c6f64b1a5c199bc9939ccc06
@source skill-front title="frontmatter" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=1:4
@source skill-scope title="범위, 승인 전제, 접근 수단" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=8:12
@source skill-validate title="1단계 source 검증" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=14:26
@source skill-dest title="2단계 목적지와 접근" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=28:35
@source skill-gh title="2단계 gh 계정 고정" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=37:41
@source skill-limits title="2단계 provider 접근 제한" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=43:43
@source skill-src title="2단계 source 세부와 상태" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=45:51
@source skill-dup title="3단계 관례, 중복, 결과 네 가지" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=53:68
@source skill-preview title="4단계 미리보기와 승인" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=70:80
@source skill-pause title="5단계 중단 뒤 재검증과 쓰기 직전 확인" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=84:86
@source skill-run title="5단계 직렬 쓰기" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=88:88
@source skill-record title="5단계 영수증과 readback" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=90:92
@source skill-cli title="5단계 gh CLI 쓰기" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=94:94
@source skill-recover title="5단계 실패 복구와 최종 보고" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=96:98
@source policy title="호출 정책" path=codex-security/plugins/codex-security/skills/track-findings/agents/openai.yaml lines=1:6
@source jira-app title="Jira 참고, 사용할 app" path=codex-security/plugins/codex-security/skills/track-findings/references/jira.md lines=3:3
@source jira-dest title="Jira 참고, 목적지와 필드" path=codex-security/plugins/codex-security/skills/track-findings/references/jira.md lines=5:15
@source jira-dup title="Jira 참고, 중복 검색" path=codex-security/plugins/codex-security/skills/track-findings/references/jira.md lines=17:21
@source jira-write title="Jira 참고, 쓰기와 영수증" path=codex-security/plugins/codex-security/skills/track-findings/references/jira.md lines=23:31
@source adv-access title="advisory 참고, 접근과 API" path=codex-security/plugins/codex-security/skills/track-findings/references/github-security-advisories.md lines=5:24
@source adv-payload title="advisory 참고, payload" path=codex-security/plugins/codex-security/skills/track-findings/references/github-security-advisories.md lines=26:32
@source adv-dup title="advisory 참고, 중복" path=codex-security/plugins/codex-security/skills/track-findings/references/github-security-advisories.md lines=34:38
@source adv-create title="advisory 참고, 생성과 검증" path=codex-security/plugins/codex-security/skills/track-findings/references/github-security-advisories.md lines=40:46
@source h-args title="helper 선택자 검사" path=codex-security/plugins/codex-security/mcp-app/src/helpers/validate-tracking-source.ts lines=13:41
@source h-cmd title="helper 명령 출력과 종료 코드" path=codex-security/plugins/codex-security/mcp-app/src/helpers/validate-tracking-source.ts lines=43:83
@source h-reg title="helper 명령 등록" path=codex-security/plugins/codex-security/mcp-app/helpers-main.ts lines=128:131
@source sc-opts title="봉인 검증의 profile 선택" path=codex-security/plugins/codex-security/mcp-app/src/sealed-contract.ts lines=62:76
@source sc-read title="manifest, findings, coverage 읽기" path=codex-security/plugins/codex-security/mcp-app/src/sealed-contract.ts lines=100:116
@source sc-ids title="scan ID 일치 검사" path=codex-security/plugins/codex-security/mcp-app/src/sealed-contract.ts lines=179:186
@source sc-seal title="봉인 검사와 report.md 존재 검사" path=codex-security/plugins/codex-security/mcp-app/src/sealed-contract.ts lines=206:216
@source sc-digest title="sealedAt과 artifact digest 검사" path=codex-security/plugins/codex-security/mcp-app/src/sealed-contract.ts lines=556:587
@source ft-schema title="도구 입력 schema" path=codex-security/plugins/codex-security/mcp-app/src/server/finding-issue-tools.ts lines=6:52
@source ft-err title="inspect 실패 처리" path=codex-security/plugins/codex-security/mcp-app/src/server/finding-issue-tools.ts lines=62:83
@source ft-get title="get 도구 정의" path=codex-security/plugins/codex-security/mcp-app/src/server/finding-issue-tools.ts lines=89:100
@source ft-rec title="record 도구 정의" path=codex-security/plugins/codex-security/mcp-app/src/server/finding-issue-tools.ts lines=101:112
@source ann title="읽기·쓰기 annotation" path=codex-security/plugins/codex-security/mcp-app/src/server/tool-annotations.ts lines=1:11
@source pub-dest title="destination 키 규칙" path=codex-security/plugins/codex-security/scripts/workbench_publication.py lines=34:55
@source pub-inspect title="저장된 영수증 읽기" path=codex-security/plugins/codex-security/scripts/workbench_publication.py lines=114:141
@source pub-validate title="영수증 형식 검사" path=codex-security/plugins/codex-security/scripts/workbench_publication.py lines=143:171
@source pub-ids title="finding ID 소속 검사" path=codex-security/plugins/codex-security/scripts/workbench_publication.py lines=186:201
@source pub-store title="로컬 이력 DB가 없을 때" path=codex-security/plugins/codex-security/scripts/workbench_publication.py lines=214:227
@source pub-conflict title="다른 finding과 충돌 검사" path=codex-security/plugins/codex-security/scripts/workbench_publication.py lines=248:259
@source pub-upsert title="영수증 upsert" path=codex-security/plugins/codex-security/scripts/workbench_publication.py lines=266:276
@source sct-def title="봉인 문서 정의" path=codex-security/plugins/codex-security/references/scan-contract.md lines=9:14
@source sct-state title="봉인 bundle은 상태 DB가 아님" path=codex-security/plugins/codex-security/references/scan-contract.md lines=22:24
@source sct-status title="scan.status 의미" path=codex-security/plugins/codex-security/references/scan-contract.md lines=32:41
@source sct-target title="target 종류" path=codex-security/plugins/codex-security/references/scan-contract.md lines=58:62
@source sct-id title="finding 식별" path=codex-security/plugins/codex-security/references/scan-contract.md lines=83:91
@source sct-modes title="scan mode 표" path=codex-security/plugins/codex-security/references/scan-contract.md lines=122:132
@source sct-report title="report.md는 투영물" path=codex-security/plugins/codex-security/references/scan-contract.md lines=168:168
@source app-json title="connector 선언" path=codex-security/plugins/codex-security/.app.json lines=1:28
@source app-test title="connector 선언 검사" path=codex-security/plugins/codex-security/tests/test_track_findings_skill.py lines=15:43
@source rel-scan title="이웃 스킬, scan 완료 처리(R24)" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md lines=13:13
@source rel-diff title="이웃 스킬, diff scan 완료 처리(R25)" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=33:33
@source rel-deep title="이웃 스킬, deep scan 완료 처리(R26)" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=14:14
@source rel-triage title="이웃 스킬, ticket 입력(R40)" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=18:18

## 켜지면 에이전트는 무엇을 받아 어떻게 판단하고 어떻게 끝내나? {#behavior span=12}

원문은 다섯 단계를 정한다. 그림은 둘로 나눈다. 앞 그림은 검증, 목적지, 중복, 미리보기, 승인까지이고 `결과?`와 `사용자 승인?` 두 결정 노드로 갈린다. 뒤 그림은 승인된 항목을 쓰고 기록하고 읽어 보고하는 부분이다.

helper 실행, provider 호출, issue 쓰기는 모두 원문이 안내하는 지시상 동작이고 이 분석에서는 실행하지 않았다.[](source:skill-validate)[](source:skill-run)

@workflow id=track-prepare title="준비: 봉인 검증에서 사용자 승인까지"
| validate | 봉인 scan 검증 | security | source:skill-validate |
| dest | 목적지 확인 | backend | source:skill-dest |
| dup | 중복 검색 | backend | source:skill-dup |
| outcome | 결과? | backend | source:skill-dup |
| preview | 미리보기 | backend | source:skill-preview |
| approve | 사용자 승인? | security | source:skill-preview |
| stop | 쓰지 않고 보고 | external | source:skill-recover |
| validate > dest | 통과 |
| dest > dup | |
| dup > outcome | |
| outcome > preview | 진행 | emphasis |
| outcome > stop | blocked |
| preview > approve | |
| approve > stop | no |

승인되면(`yes`) 아래 두 번째 그림으로 이어진다.

@workflow id=track-write title="쓰기: 재검증에서 결과 보고까지"
| recheck | 쓰기 직전 재검증 | security | source:skill-pause |
| apply | 하나씩 적용 | external | source:skill-run |
| record | 영수증 기록 | database | source:skill-record |
| readback | readback | backend | source:skill-record |
| report | 결과 보고 | backend | source:skill-recover |
| recheck > apply | 통과 | emphasis |
| apply > record | 성공 | emphasis |
| apply > report | 실패 |
| record > readback | |
| readback > report | |

두 그림은 핵심 경로만 그린다. 첫 그림에서 `봉인 scan 검증`이 실패하면 tracking을 멈추고 보고한다. 이 실패 경로는 간선 없이 그 노드의 설명에 적었다.

둘째 그림에서 재검증이 접근이나 검증 실패로 멈추는 경로, 상태가 바뀌어 `미리보기`로 돌아가는 되돌림, 항목을 하나 끝내고 다음 항목으로 넘어가는 반복도 간선 없이 `쓰기 직전 재검증`과 `하나씩 적용` 설명에 적었다. 중단된 batch의 재개는 `결과 보고` 설명에 적었다. provider마다 다른 규칙은 아래 목적지 패널에 모았다.

@steps id=track-steps
| validate | 봉인 scan 검증 | 에이전트는 사용자가 준 scan 폴더 경로와, 있으면 `--finding-id` 또는 `--fingerprint` 선택자를 받는다. provider 호출이나 destination 탐색보다 먼저 `<plugin-root>/scripts/launch_codex_security_mcp --helper validate-tracking-source <user-supplied-scan-dir> [--finding-id <id> \| --fingerprint <fingerprint>]`를 실행하라고 원문이 정한다. plugin root는 이 스킬에서 두 디렉터리 위이고, Windows는 `.cmd` 실행기를 쓰며, 경로와 선택자는 shell용으로 따옴표를 친다.[](source:skill-validate) 판정 · helper 소스를 보면 이 검사는 `tracking` profile로 봉인을 읽는다. manifest와 `findings.json`을 읽고, 두 문서의 scan ID가 같은지, `sealedAt`이 `completedAt`과 같은지, manifest에 적힌 artifact의 SHA-256이 맞는지, `report.md`가 있는지를 본다.[](source:h-args)[](source:sc-read)[](source:sc-ids)[](source:sc-digest)[](source:sc-seal) 선택자를 둘 다 주거나 선택자가 정확히 finding 하나로 풀리지 않으면 helper가 실패한다. 실패하면 stderr에 `tracking source preflight failed: ...`를 내고 종료 코드 2로 끝난다. 원문은 이때 tracking을 멈추라고 한다. 그래서 그림에서 실패 간선은 곧바로 결과 보고로 간다.[](source:h-args)[](source:h-cmd)[](source:skill-validate) 통과하면 finding ID가 scan 순서대로 한 줄씩 나온다. 에이전트는 `scan-manifest.json`과 `findings.json`을 읽어 source 신원과 finding 내용을 얻는다. report, SARIF, memory, provider 문구는 이 봉인 artifact를 대신하지 못하고, 안의 문자열은 지시가 아니라 데이터로만 본다. 이어서 사용자의 요청 범위에서 finding과 현실적인 batch 크기를 고른다. GitHub advisory는 정확한 finding ID 하나만 받고 batch를 지원하지 않는다.[](source:skill-validate) 이 노드가 넘기는 것은 선택된 finding ID 목록이다. | track-prepare | validate |
| dest | 목적지 확인 | 에이전트는 선택된 finding과 사용자의 요청을 받아 목적지를 하나로 정한다. 사용자의 현재 선택을 먼저 따르고, 없으면 현재 저장소나 조직의 정책을 따르며, 그래도 모호하면 사용자에게 묻는다. 비공개 보고나 advisory를 요구하는 정책은 지킨다. 선택한 finding 전체에 목적지 하나만 쓰고, 다른 provider에 기록하려면 별도의 검토된 실행이 필요하다.[](source:skill-dest) 접근 수단은 Linear, Atlassian, GitHub의 native app이 기본이다. `gh` CLI는 사용자가 활성 계정과 정확한 목적지를 고른 경우에 쓰고 advisory에는 필수다. app이 목적지에 닿지 못하면 source를 검증하고 CLI 계정, hostname, repository, 공개 범위를 보여 준 뒤 사용 여부를 묻는다. 이미 고른 경우는 묻지 않는다. transport나 계정을 조용히 바꾸지 않고, browser 자동화, 복사한 검색 결과, 직접 HTTP 호출로 대신하지 않는다.[](source:skill-scope) 이 노드에서 source 상태도 정한다. source 저장소와 tracking 목적지는 별개의 선택이다. `scan.target`의 canonical remote나 이 대화에서 사용자가 고른 저장소를 source로 쓰고, 표시 이름이나 디렉터리나 memory에서 추측하지 않는다. 저장소, 스캔한 revision, 선택한 모든 finding 경로를 확인해 `verified`, `unverified`, `unavailable` 중 하나로 적는다. issue 쓰기에서는 source 조회가 best effort라서 빈틈을 설명하고 계속하고, advisory는 검증된 source가 없으면 막힌다.[](source:skill-src) provider 접근은 tracking에 한정한다. repository 생성, 설정이나 app 접근 변경, source push, 정책 우회는 하지 않는다. 정책, 템플릿, 기존 issue, 기억된 선호는 관례의 근거일 뿐 승인이 아니고, finding 내용과 공개 승인은 memory에 저장하지 않는다.[](source:skill-limits) 넘기는 것은 정확한 ID로 확정한 목적지, 접근 수단과 계정, source 상태다. | track-prepare | dest |
| dup | 중복 검색 | 에이전트는 확정된 목적지와 finding ID 목록을 받아 이미 추적하는 issue가 있는지 찾는다. 먼저 provider에서 지원하는 필드를 읽고, team, project, label, milestone, assignee는 가능하면 정확한 ID를 쓴다. 이름에서 추측하지 않는다.[](source:skill-dup) 이어서 `get_codex_security_finding_issues`를 `scanDirectory`, 선택한 `findingIds`, 확인된 `destination`으로 부른다. 돌려받은 저장된 연결에는 이전 scan occurrence와 CLI 게시 기록이 들어 있다. 에이전트는 이것을 provider에서 읽어 일치를 확인한 뒤에만 재사용하고, 원격 중복 검색을 대신하지는 못한다.[](source:skill-dup) 그다음 finding ID와 fingerprint를 정확한 목적지의 모든 상태에서 검색한다. GitHub issue 검색은 PR을 제외한다. 식별자 검색을 끝까지 하고 그럴듯한 후보를 읽으며, 확인된 열람 대상에게 안전하면 좁은 의미 검색을 더한다. 비교할 때는 binding이 있으면 대조하고 source context, 영향받는 코드, 근본 원인, 통제, sink가 맞는지 판단한다. 비슷한 문구나 binding 부재만으로는 결론을 내지 못한다.[](source:skill-dup) Jira는 finding ID와 fingerprint를 따로 project 범위 JQL로 검색하고 continuation token을 끝까지 따라가며 후보를 `getJiraIssue`로 읽는다. 읽을 수 없는 후보나 충돌하는 근거는 결정을 막는다.[](source:jira-dup) advisory는 API에 전문 검색이 없어서 `triage`, `draft`, `published`, `closed` 네 상태를 모두 pagination하고 정확한 binding을 먼저 맞춘다.[](source:adv-dup) 넘기는 것은 finding마다 찾은 후보와 비교 결과다. | track-prepare | dup |
| outcome | 결과? | 에이전트는 검색과 비교 결과를 받아 finding마다 네 결과 중 하나를 고른다. `create`는 완전한 검색에서 같은 finding을 추적하는 issue가 없을 때다. `reuse`는 issue 하나가 같은 finding을 추적한다고 현재 읽기나 이번 실행의 생성 영수증으로 확인됐을 때이며, binding을 더하거나 issue를 고쳐 쓸 필요가 없다. `update`는 일치가 확인된 issue 하나에 구체적이고 검토된 변경을 넣을 때다. `blocked`는 경로, 접근, 공개 범위, 중복 모호성이 결정을 막을 때다.[](source:skill-dup) advisory는 `create`, `reuse`, `blocked`만 쓴다. 정확히 일치하는 `draft`나 `published` advisory 하나는 reuse하고, `triage`나 `closed` 일치, 일치 여러 개, 의미상 모호함은 실행을 막는다. 기존 advisory는 수정하지 않는다.[](source:skill-dup)[](source:adv-dup) 그림은 `create`, `update`, `reuse`를 미리보기로, `blocked`를 결과 보고로 보낸다. `blocked`가 나온 뒤 같은 batch의 다른 finding을 계속 처리하는지는 원문에 명시 없음이다. 다만 `하나씩 적용`에서 풀리지 않은 중복이 나오면 batch를 멈추라고 한다.[](source:skill-run) | track-prepare | outcome |
| preview | 미리보기 | 에이전트는 finding마다 결과와 고른 기존 항목을 받아 쓰기 전에 보여 줄 내용을 만든다. 검증된 finding의 영향, 발생 조건과 전제, 근본 원인, 수정 방안, 검증 근거를 쓰고, 불확실성은 그대로 두며 근거 없는 주장은 뺀다. 형식은 목적지의 관례를 따른다.[](source:skill-preview) 사용자에게는 finding의 ID와 fingerprint, 정확한 목적지와 열람 대상, transport와 계정, source 상태, 역할이 붙은 위치, 중복 결과와 고른 기존 항목, 정확한 제목과 본문과 metadata, 뺀 민감 내용, 경고를 보여 준다. advisory는 전체 JSON payload와 필수 header도 보여 준다.[](source:skill-preview) 모든 create나 update 본문에는 정식 finding ID와 기본 fingerprint binding을 라벨과 함께 넣는다. 위치마다 역할과 `path:line-range`를 보존하고 역할이 없으면 역할 라벨을 뺀다. 검증된 `git_revision` source이면 repository, 전체 immutable revision, commit에 고정한 링크도 넣는다.[](source:skill-preview) 자격 증명, 서명된 URL, 로컬 파일 URL, 검토하지 않은 링크는 넣지 않는다. public GitHub issue에는 눈에 띄는 공개 경고를 넣고 internal 근거, attack path, exploit 세부, private source 링크는 뺀다.[](source:skill-preview) 넘기는 것은 항목별 미리보기이고, batch면 실행 순서로 늘어놓은 목록이다. | track-prepare | preview |
| approve | 사용자 승인? | 이 노드는 사람 승인 지점이다. 에이전트는 미리보기를 보여 주고 사용자의 답을 기다린다. batch는 모든 항목을 실행 순서대로 보여 주고 그 목록을 승인받는다. 일반적인 "finding을 tracking해 줘" 요청은 보지 않은 payload의 승인이 아니다.[](source:skill-preview) source, 신원, transport, 목적지, 열람 대상, 중복 결정, payload, 구성원 중 하나라도 바뀌면 새 미리보기와 새 승인이 필요하다. `reuse`는 provider 변경 승인도 쓰기 권한도 필요 없다.[](source:skill-preview) 승인되면 `쓰기 직전 재검증`으로 넘어간다. 사용자가 승인하지 않았을 때의 처리는 원문에 명시 없음이다. 판정 · 원문이 쓰기 전에 승인을 받으라고 하므로 승인이 없으면 쓰지 않는 것으로 보고, 그림에서 `no`를 결과 보고로 보냈다.[](source:skill-scope) | track-prepare | approve |
| stop | 쓰지 않고 보고 | 에이전트는 `blocked` 결과나 사용자의 비승인, 봉인 검증 실패를 받으면 provider에 쓰지 않고 상태를 사용자에게 알린다. 봉인 검증 실패는 원문이 tracking을 멈추라고 한다.[](source:skill-validate) `blocked`는 경로, 접근, 공개 범위, 중복 모호성이 결정을 막는 경우다.[](source:skill-dup) 비승인의 처리는 원문에 명시 없음이다. 판정 · 원문이 쓰기 전에 승인을 받으라고 하므로 승인이 없으면 쓰지 않는 것으로 보고 이 노드로 모았다.[](source:skill-scope) 이 노드가 넘기는 것은 막힌 이유를 담은 보고이고, 보고 형식은 `결과 보고` 노드를 따른다고 보는 것이 판정이다. | track-prepare | stop |
| recheck | 쓰기 직전 재검증 | 에이전트는 승인된 목록을 받아 항목을 쓰기 전에 두 겹으로 다시 확인한다. 첫 겹은 항목마다 하는 확인이다. create, update, reuse 직전에 그 finding ID로 source 검증 helper를 다시 돌리고 실패하면 멈춘다.[](source:skill-run) 둘째 겹은 승인을 기다렸거나 중단된 뒤에 하는 확인이다. source 검증을 다시 돌리고, 저장소·revision·경로·live 공개 범위로 source 링크를 다시 확인하며, 활성 계정과 live 목적지의 신원·공개 범위·필요한 권한을 다시 확인한다. 검증이나 필요한 접근이 실패하면 멈추고, source 검증이나 공개 범위, 계정, 목적지, 공개 대상이 바뀌었으면 미리보기로 돌아간다. 필드 metadata는 응답이나 바뀐 맥락이 의심스럽지 않으면 재사용하고 항목마다 전체 탐색을 되풀이하지 않는다.[](source:skill-pause) create 직전에는 승인을 기다리는 동안 생긴 issue를 잡으려고 중복 결과를 새로 고친다. 중단 뒤에는 reuse 후보를 다시 읽어 일치를 재확인한다. 읽을 수 없거나 모호하면 멈추고, 중복 결정이 바뀌면 미리보기로 돌아간다.[](source:skill-pause) 중단 뒤 update 직전에는 바꿀 필드를 다시 읽고, 검토한 값과 다르면 미리보기로 돌아간다. 중단 없이 이어졌다면 생성 영수증의 값을 이미 승인된 후속 수정에 쓸 수 있다. 소유하지 않은 필드와 기존 rich content는 보존한다.[](source:skill-pause) 통과하면 `하나씩 적용`으로 넘어간다. | track-write | recheck |
| apply | 하나씩 적용 | 에이전트는 재검증을 통과한 항목을 승인된 순서대로 직렬로 처리하고, 승인된 payload를 그대로 쓴다. 실패했거나 불확실한 변경이나 풀리지 않은 중복이 나오면 batch를 멈춘다.[](source:skill-run) `reuse`는 provider를 바꾸지 않고 다음 노드로 넘어간다. provider마다 쓰는 방식이 다르다. Jira는 `createJiraIssue`나 `editJiraIssue`를 승인된 payload로 한 번 부르고, 생성이 key나 ID를 돌려주면 생성이 확인된 것이다.[](source:jira-write) `gh`로 issue를 쓸 때는 승인된 본문을 repository와 scan bundle 밖의 mode `0600` 임시 파일에 두고 어떤 종료에서든 지운다. `gh issue create`나 `gh issue edit` 한 번에 넘기고 파일은 출력하지 않는다.[](source:skill-cli) advisory는 승인된 JSON을 같은 조건의 임시 파일에 쓰고 민감 내용을 검토한 뒤 `gh api --hostname github.com --input`으로 한 번 보낸다.[](source:adv-create) 변경이 실패하거나 시간 초과로 성공 여부가 불확실하면 재시도 전에 정확한 읽기나 binding 검색으로 사실을 맞추고, 그래도 불확실하면 멈춘다.[](source:skill-recover) 항목 하나를 끝낸 뒤 다음 항목에서 재검증부터 다시 하는 반복은 원문이 "serially"와 "immediately before each"로 적은 것을 합친 판정이라서 그림에는 그리지 않았다.[](source:skill-run) 넘기는 것은 provider가 받아들인 응답, 또는 실패나 불확실 상태다. | track-write | apply |
| record | 영수증 기록 | 에이전트는 provider의 성공 응답을 받아들여진 쓰기로 본다. 곧바로 `record_codex_security_finding_issues`를 같은 source와 목적지로 부른다. 영수증에는 정식 `findingId`와 `occurrenceId`, 돌려받은 `issueIdentifier`, 돌려받았다면 `url`, `operation`(`create`, `update`, `reuse` 중 하나)이 들어간다. 확인된 reuse도 현재 scan occurrence로 같은 방식으로 기록한다. 돌려받은 신원은 그대로 보존하고, 로컬 기록이 실패하면 batch를 멈춘다. 저장소 실패는 다른 create를 허가하지 않는다.[](source:skill-record) 판정 · 도구 소스를 보면 이 기록은 영수증의 필수 문자열, finding과 occurrence가 이 scan에 속하는지, `operation` 값, 선택 `url`과 `readback` 형식을 검사한다. 같은 목적지에서 같은 `issueIdentifier`가 다른 finding에 이미 묶여 있으면 거부한다.[](source:pub-validate)[](source:pub-conflict) `occurrenceId`, 목적지, `issueIdentifier`, `operation`이 같은 영수증을 다시 기록하면 새 행이 아니라 갱신이다. 이때 `url`은 저장된 값이 비어 있을 때만 채우고 `readback`은 새 값이 있으면 바뀐다.[](source:pub-upsert) 넘기는 것은 기록된 영수증이다. | track-write | record |
| readback | readback | 에이전트는 기록한 issue를 가능하면 같은 transport로 다시 읽어 신원과 바뀐 필드를 확인한다. 의미와 링크가 보존되는 서식 변화는 허용한다.[](source:skill-record) 읽은 결과는 같은 영수증을 `readback: {status: "verified"}` 또는 `{status: "failed", error}`로 다시 기록해 남긴다. 읽기를 시도하지 않았으면 readback을 생략하고, 현재 읽기로 reuse를 확인했다면 바로 verified로 기록할 수 있다. 받아들여진 쓰기와 읽기 실패는 따로 다루고, 읽을 수 없는 issue가 다른 create를 허가하지도 않는다.[](source:skill-record) Jira는 `getJiraIssue`로 확인하고, 읽기가 실패해도 돌려받은 신원을 유지한다.[](source:jira-write) `gh` issue는 돌려받은 URL을 `issue_url`로 잡아 `gh issue view "$issue_url" --json number,url,title,body`로 읽고, 다른 metadata를 썼으면 `labels`나 `assignees` 같은 JSON 필드를 덧붙인다.[](source:skill-cli) advisory는 `ghsa_id`를 기록한 뒤 허용된 endpoint로 읽고, 정규화한 결과를 승인된 payload와 비교해 `state: draft`일 때만 성공으로 본다. 이 readback도 따로 기록한다.[](source:adv-create) | track-write | readback |
| report | 결과 보고 | 에이전트는 처리 결과를 `completed`, `reused`, `blocked`, `failed`, `uncertain`, `unprocessed` 여섯 갈래로 나눠 보고한다. 영수증이나 읽기에서 얻은 URL을 쓰고, URL을 모르면 돌려받은 신원을 쓴다. 받아들여진 쓰기, 확인된 읽기, 접근 실패를 섞지 않는다. advisory 성공은 참고 파일이 정한 readback이 있어야 인정된다.[](source:skill-recover) batch가 중단됐다면 끝난 항목은 영수증과 현재 읽기로 맞추고, 남은 항목은 source 검증과 중복 확인을 한다. 남은 쓰기와 목적지가 그대로이면 기존 승인을 유지한다.[](source:skill-recover) 이 노드는 정상 종료뿐 아니라 검증 실패, `blocked`, 승인 없음, 실패 경로의 종점도 겸한다. 판정 · 원문은 종료 상태를 한 노드로 모으지 않아서 그림에서 합쳐 그렸다. | track-write | report |

설명용 예시 · 사용자가 "scan 폴더의 finding 두 개를 Linear 팀 하나에 기록해 줘"라고 했다고 하자(분석자가 지어낸 요청이다). 에이전트는 helper로 폴더를 검증하고 그 팀의 공개 범위를 확인한 뒤 두 finding의 중복을 검색한다.

둘 다 `create`로 나오면 두 payload를 실행 순서대로 보여 주고 목록 승인을 받는다.[](source:skill-preview) 승인 뒤 첫 finding을 쓰고 영수증을 기록한 다음, 둘째 finding에 대해 helper를 둘째 ID로 다시 돌린다.[](source:skill-run)[](source:skill-record) 첫 쓰기가 불확실하게 끝나면 둘째로 넘어가지 않고 멈춘다.[](source:skill-run) Linear 팀의 공개 범위가 넓거나 모르면 세부 내용을 공유하기 전에 노출을 설명하고 확인을 받는다.[](source:skill-dest)

## 언제 켜지고 언제 쓰면 안 되나? {#activation span=12}

description은 모델이 판단할 때 참고하는 설명이고, 특정 단어가 있어야 켜진다는 뜻이 아니다. 원문은 scan과 fix에 쓰지 말라고 한다.[](source:skill-front) `agents/openai.yaml`에는 `allow_implicit_invocation: true`가 있다. 필드 이름은 암시적 호출 허용을 뜻하지만 호스트가 이 값을 어떻게 쓰는지는 원문에 명시 없음이다.[](source:policy)

@code source=skill-front language=yaml

@code source=policy language=yaml

| 이럴 때 | 판정 | 이유 |
|---|---|---|
| 봉인된 scan의 finding을 issue나 초안 advisory로 기록하고 싶다 | 쓴다 {good:대상} | description이 이 네 목적지를 지정한다.[](source:skill-front) |
| 취약점을 찾는 scan을 돌리고 싶다 | 쓰지 않는다 {bad:금지} | description이 scan에 쓰지 말라고 한다.[](source:skill-front) |
| 취약점을 고치고 싶다 | 쓰지 않는다 {bad:금지} | description이 fix에 쓰지 말라고 한다.[](source:skill-front) |
| scan 폴더가 봉인되지 않았거나 helper가 실패한다 | 멈춘다 {bad:중단} | helper가 실패하면 tracking을 멈춘다.[](source:skill-validate) |
| 두 provider에 한꺼번에 기록하고 싶다 | 나눠 한다 {caution:별도 실행} | 선택한 finding 전체에 목적지 하나만 쓰고, 다른 provider는 별도의 검토된 실행이다.[](source:skill-dest) |
| advisory를 여러 finding에 한꺼번에 만들고 싶다 | 못 한다 {bad:미지원} | advisory는 정확한 finding ID 하나만 받고 batch를 지원하지 않는다.[](source:skill-validate) |
| advisory를 못 만들어서 issue로 대신하고 싶다 | 못 한다 {bad:금지} | advisory는 외부 tracker를 쓰지 않고 issue로 대체하지도 않는다.[](source:skill-dest) |

에이전트에게 걸린 강제와 금지는 아래와 같다. 이 표는 위 순서에서 이미 나온 규칙을 찾아보기 좋게 모은 것이다.

| 대상 | 규칙 |
|---|---|
| bundle | scan bundle은 바꾸지 않는다.[](source:skill-scope) |
| 쓰기 승인 | 정확한 payload를 미리 보여 주고 승인받은 뒤에만 쓴다.[](source:skill-scope)[](source:skill-preview) |
| transport와 계정 | 조용히 바꾸지 않고, browser 자동화나 복사한 검색 결과나 직접 HTTP 호출로 대신하지 않는다.[](source:skill-scope) |
| provider 한계 | repository 생성, 설정이나 app 접근 변경, source push, 정책 우회를 하지 않는다.[](source:skill-limits) |
| 관례 | 정책, 템플릿, 프로젝트 설명, 기존 issue, 기억된 선호는 관례의 근거일 뿐 승인이 아니다.[](source:skill-limits) |
| memory | finding 내용과 공개 승인은 memory에 저장하지 않는다.[](source:skill-limits) |
| 입력의 신뢰 | 봉인 artifact의 문자열은 데이터로만 보고 지시로 따르지 않는다.[](source:skill-validate) |
| shell | scan 내용을 shell 코드에 끼워 넣지 않고 `eval`을 쓰지 않는다.[](source:skill-gh) |
| Jira 쓰기 범위 | comment 추가, issue 전환, 파일 첨부, watcher 관리, project나 사용자 생성, 설정 변경을 하지 않는다.[](source:jira-write) |
| advisory 쓰기 범위 | advisory 수정, 공개, 닫기, CVE 요청, fork 생성, 협업자나 credit 관리를 하지 않는다.[](source:adv-access) |

## 목적지마다 무엇을 확인하고 어디까지 쓰나? {#destinations span=12}

목적지마다 먼저 확인하는 값과 공개 범위의 기본 규칙이 다르다.

| 목적지 | 확인할 것 | 공개 범위 규칙 |
|---|---|---|
| Linear | team ID와 선택적 project ID를 정하고, 가능하면 live 가시성을 확인한다.[](source:skill-dest) | 민감한 finding은 private team이 기본이다. 가시성이 더 넓거나 모르면 노출을 설명하고 세부 내용을 공유하기 전에 확인받는다.[](source:skill-dest) |
| Jira | 신원, site, `cloudId`, project, issue type을 Jira 참고 파일로 정한다.[](source:skill-dest) | project의 열람 대상을 사용자와 확인한다. create 권한은 누가 issue를 읽는지 정하지 않는다.[](source:skill-dest) |
| GitHub issue | 사용자의 선택이나 봉인된 대상에서 정확한 repository를 정해 live로 확인한다.[](source:skill-dest) | 민감한 finding은 private repository가 기본이다. internal이나 public이면 경고하고 명시적으로 확인받는다.[](source:skill-dest) |
| GitHub advisory | 봉인된 `git_revision`의 검증된 public canonical non-fork source repository를 쓴다.[](source:skill-dest) | 외부 tracker나 issue로 대신하지 않는다.[](source:skill-dest) |

`gh`를 쓸 때는 GitHub 계정을 고정한다.

- source나 목적지 요청 전에 그 host에서 선택한 신원이 작업 내내 고정되는 실행 환경을 쓴다.[](source:skill-gh)
- `gh auth status --help`가 `--active`를 보여 주면 `gh auth status --active --hostname <host>`로 실제 로그인을 확인한다. 아니면 `gh auth status --hostname <host>`에서 활성 또는 유일한 계정을 본다. 환경 token이 저장된 계정을 덮을 수 있다.[](source:skill-gh)
- 실행 환경이 고정되지 않거나 로그인이 다르거나 선택한 계정에 인증 오류나 경고가 있으면 선택적 source 링크를 건너뛴다. 목적지 연결이 이 검사에 실패하면 GitHub tracking을 멈춘다. 명시적으로 비활성인 계정의 실패는 무시한다.[](source:skill-gh)
- 목적지는 `gh repo view https://<host>/<owner>/<repo>`로 확인하고 모든 `gh api` 호출에 `--hostname <host>`를 붙인다. 필수 repository metadata가 없거나 권한이 부족하거나 repository가 모호하면 그 목적지의 tracking을 막는다.[](source:skill-dest)[](source:skill-gh)
- 위치, 질의, 제목, metadata, endpoint는 shell에서 따옴표로 감싼다. 한 GitHub 실행에서는 source 확인, 중복 검색, 쓰기, readback까지 transport와 신원을 하나로 쓴다.[](source:skill-gh)

source 상태는 세 가지다. 이 상태가 링크 모양과 advisory 가능 여부를 정한다.[](source:skill-src)

| source 상태 | 뜻 | 링크와 처리 |
|---|---|---|
| `verified` | repository, 스캔한 revision, 선택한 모든 finding 경로를 확인했다. | `git_revision`이면 commit에 고정한 링크를 쓴다. |
| `unverified` | 후보를 스캔한 바이트와 연결하지 못했다. | 역할이 붙은 일반 `path:line-range`를 쓴다. |
| `unavailable` | 후보나 쓸 수 있는 transport가 없다. | 일반 `path:line-range`를 쓴다. issue는 빈틈을 설명하고 계속하고, advisory는 막힌다. |

커밋 조회나 변경 파일 목록만으로는 경로가 확인되지 않는다. 링크만 더하려고 다른 transport를 연결하거나 접근을 요청하지 않는다.[](source:skill-src) target 종류는 `git_revision`, `git_worktree`, `git_diff`, `directory_snapshot` 넷이고, 깨끗한 Git checkout은 `git_revision`, 변경이 있는 checkout은 `git_worktree`를 쓴다.[](source:sct-target) 판정 · 그래서 변경이 있는 checkout이나 diff를 scan한 bundle은 commit에 고정한 링크를 받지 못하고 advisory 조건도 채우지 못한다.[](source:sct-target)[](source:skill-src)[](source:adv-access)

Jira와 advisory는 참고 파일이 도구와 한계를 따로 정한다.

| 항목 | 규칙 |
|---|---|
| Jira 신원과 site | `atlassianUserInfo`와 `getAccessibleAtlassianResources`로 정하고 신원, site, `cloudId`, project, issue type을 실행 동안 고정한다.[](source:jira-dest) |
| Jira 접근 | create는 browse와 create 접근을 live 데이터로 확인하고 update는 edit 접근을 확인한다. 기존 issue는 읽기가 성공해야 읽기 접근이 확인되며, 빈 JQL 결과나 보이는 project는 증거가 아니다.[](source:jira-dest) |
| Jira 필드 | type은 `listJiraProjectIssueTypesMetadata`, 필수 필드는 `getJiraIssueTypeMetaWithFields`로 정한다. 선택·사용자 지정 필드, priority 매핑, assignee, label은 live metadata로 확인하고 추측하지 않는다.[](source:jira-dest) |
| Jira 수정 | `editJiraIssue`는 승인된 변경만 보낸다. summary만 고치면 description을 다시 보내지 않는다.[](source:jira-dest) |
| Jira URL | 돌려받은 URL을 쓰거나 고정한 site와 돌려받은 key로 browse URL을 만든다. ID만 알면 key나 URL을 지어내지 않는다.[](source:jira-write) |
| advisory 조건 | 봉인된 `git_revision`, 검증된 public canonical non-fork repository, default branch, `ADMIN` viewer 권한이 모두 필요하다. 다른 target 종류는 이 계약을 만족하지 못한다.[](source:adv-access) |
| advisory API | 모든 요청이 `gh api --hostname github.com`을 쓰고 `Accept: application/vnd.github+json`과 `X-GitHub-Api-Version: 2026-03-10` header를 단다. 쓰는 endpoint는 `GET /repos/{owner}/{repo}/security-advisories?state={triage\|draft\|published\|closed}`, `POST /repos/{owner}/{repo}/security-advisories`, `GET /repos/{owner}/{repo}/security-advisories/{ghsa_id}` 셋뿐이다.[](source:adv-access) |
| advisory 필수 필드 | `summary`, `description`, `vulnerabilities`가 필수다. vulnerability마다 검증된 ecosystem, 정식 package 이름, 근거 있는 취약 버전 범위가 필요하다. 스캔한 commit은 영향받는 release를 정하지 않는다.[](source:adv-payload) |
| advisory 점수 | 검증된 `cvss_vector_string`과 GitHub `severity` 중 정확히 하나만 준다. 점수나 문장에서 vector를 만들지 않고 informational severity도 매핑하지 않는다.[](source:adv-payload) |
| advisory 비움 | `cve_id`, `credits`, `start_private_fork`는 비운다. `patched_versions`는 release가 있을 때만 넣고, 신뢰도 높은 root-cause CWE만 넣는다.[](source:adv-payload) |
| advisory 설명문 | 결국 공개되는 글이다. 영향, 영향받는 버전, 전제 조건, 안전한 기술·검증 근거, 완화나 우회책, source 세부와 binding을 넣고, 공개되면 binding도 공개된다는 경고를 쓴다. credential, 서명된 URL, 내부 전용 근거, 불필요한 exploit payload는 뺀다.[](source:adv-payload) |
| advisory 생성 전 | source, 활성 신원, repository 접근, 중복을 다시 검증하고, 달라진 package나 source 정보는 새로 고쳐 미리보기에서 다시 보여 준다.[](source:adv-create) |

## helper와 도구는 실제로 무엇을 보장하나? {#tool-contract span=12}

SKILL.md가 부르는 helper와 MCP 도구의 구현 소스를 읽어 계약을 확인했다. 실행하지 않았고, 소스가 실제로 배포되는 번들과 같은지는 확인하지 못했다. 자세한 한계는 [감사 패널](block:audit)에 있다.

| 대상 | 확인한 계약 |
|---|---|
| helper 등록 | `validate-tracking-source`는 helper 명령으로 등록돼 있고, 명령이 끝나면 그 결과 코드를 프로세스 종료 코드로 삼는다.[](source:h-reg) |
| helper 선택자 | `--finding-id`와 `--fingerprint`를 같이 주면 오류다. 선택자가 정확히 finding 하나로 풀리지 않아도 오류다. 선택자가 없으면 모든 finding을 돌려준다.[](source:h-args) |
| helper 출력 | 성공하면 finding ID를 한 줄씩 출력한다. 실패하면 `tracking source preflight failed: ...`를 stderr에 내고 종료 코드 2로 끝난다.[](source:h-cmd) |
| 봉인 검증 | `tracking` profile은 `scan-manifest.json`과 `findings.json`을 읽고, manifest에 `coverageRef`가 있을 때만 `coverage.json`도 읽는다.[](source:sc-opts)[](source:sc-read) |
| 봉인 검증 조건 | 두 문서의 scan ID가 같아야 하고, `sealedAt`이 `completedAt`과 같아야 하며, manifest에 적힌 artifact마다 SHA-256이 맞아야 한다. `tracking` profile은 `report.md` 존재도 본다.[](source:sc-ids)[](source:sc-digest)[](source:sc-seal) |
| 봉인 문서의 성격 | manifest는 scan ID, 대상, 종료 상태, 봉인 시각, artifact digest를 담은 변하지 않는 영수증이다. `findings.json`은 manifest의 `scan.findingsRef`가 가리킨다. `report.md`는 이 JSON에서 만든 읽기용 투영물이다.[](source:sct-def)[](source:sct-report) |
| 식별자 | `findingId`는 fingerprint에서, `occurrenceId`는 scan ID와 fingerprint에서 만든다. fingerprint 일치는 같은 finding의 증명이 아니라 대조 신호이고, 모호하면 풀리지 않은 것으로 다룬다.[](source:sct-id) |
| `get_codex_security_finding_issues` | 입력은 `scanDirectory`, 선택 `findingIds`, `destination`이다. destination은 `linear`(`teamId`, 선택 `projectId`), `jira`(`cloudId`, `projectId`), `github-issue`와 `github-advisory`(`hostname`, `repository`) 셋 중 하나다. 읽기 전용 annotation이고 provider에 접속하지 않는다.[](source:ft-schema)[](source:ft-get)[](source:ann) |
| destination 키 | destination 필드는 종류마다 정해진 것만 허용하고 모두 비어 있지 않은 문자열이어야 한다. 이 값이 영수증을 목적지별로 묶는 키가 된다.[](source:pub-dest) |
| 저장된 연결 읽기 | 로컬 scan history DB가 없으면 `storeExists: false`와 빈 결과를 돌려준다. DB를 열지 못해 종료 코드 73이면 `state_unavailable` 오류가 된다. 새 영수증 테이블이 없고 Linear이면 이전 `finding_publications` 행을 `create` 영수증처럼 읽는다.[](source:pub-store)[](source:ft-err)[](source:pub-inspect) |
| `record_codex_security_finding_issues` | 입력에 `receipts` 배열이 더해진다. 영수증은 `findingId`, `occurrenceId`, `issueIdentifier`, 선택 `url`, `operation`, 선택 `readback`이다. 도구 설명은 provider에 접속하지 않고 scan bundle도 바꾸지 않는다고 적는다.[](source:ft-schema)[](source:ft-rec) |
| 기록의 검사 | 선택한 finding ID는 봉인 scan에 속해야 하고, 영수증의 `occurrenceId`가 그 finding의 것과 맞아야 한다. 같은 목적지에서 같은 `issueIdentifier`가 다른 finding에 이미 연결돼 있으면 거부한다.[](source:pub-ids)[](source:pub-validate)[](source:pub-conflict) |
| 같은 영수증을 다시 기록 | `occurrenceId`, 목적지, `issueIdentifier`, `operation`이 같으면 새 행을 만들지 않고 갱신한다. `url`은 먼저 저장된 값을 두고 비어 있을 때만 채우며, `readback`은 새 값이 있으면 바뀐다.[](source:pub-upsert) |
| connector 선언 | `.app.json`은 `codex-security-cloud`, `linear`, `github`, `atlassian` 넷을 모두 `required: false`로 선언하고 Atlassian만 `read`, `write` capability를 적는다. 테스트가 `skills` 아래 모든 `.md`의 `app://` ID가 이 선언에 있는지 확인한다.[](source:app-json)[](source:app-test) |

판정 · 영수증이 이 스킬이 말하는 "저장된 연결"의 전부다. `scan-contract.md`는 봉인 bundle이 workflow 상태 DB가 아니고 외부 링크 같은 가변 상태는 소비자가 따로 저장하라고 정한다. 그래서 이 스킬은 영수증을 로컬 history에 남기고, 다음 실행에서 그것을 중복 후보로만 읽는다.[](source:sct-state)[](source:skill-dup)[](source:pub-upsert)

## 다른 스킬과 어디에서 이어지나? {#position span=12}

`track-findings`는 `external-findings` 묶음에서 봉인된 scan의 finding을 issue tracker에 기록하는 단계다. 전체 흐름은 색인 기준 `codex-security/_group-external-findings/external-findings.html` 묶음 페이지에 있다. 앞에는 scan 스킬이 만든 폴더가 있고, 뒤로는 tracker에 남은 ticket을 `triage-finding`이 입력으로 받을 수 있다. 어느 쪽도 자동 순서는 아니고, 사용자가 요청할 때 따로 호출한다.[](source:skill-scope)

@workflow id=position-flow title="scan 산출물에서 tracker 기록까지"
| scan | security-scan | backend | source:rel-scan |
| diff | security-diff-scan | backend | source:rel-diff |
| deep | deep-security-scan | backend | source:rel-deep |
| current | track-findings | backend | emphasis |
| triage | triage-finding | backend | source:rel-triage |
| scan > current | R24 | emphasis |
| diff > current | R25 |
| deep > current | R26 |
| current > triage | R40 |

@steps id=position-steps
| scan | security-scan | 앞 스킬이다. scan이 끝나면 `scan-manifest.json`과 `findings.json`이 있는지 확인하고 `complete_codex_security_scan`을 한 번 부르라고 정한다. 이 두 파일이 `track-findings`가 읽는 봉인 입력이다. 자동 순서는 없다(R24).[](source:rel-scan)[](source:skill-validate) | position-flow | scan |
| diff | security-diff-scan | 앞 스킬이다. 완료할 때 `complete_codex_security_scan`을 한 번 부르면 `report.md`와 SARIF가 만들어진다. scan-contract의 mode 표가 `diff`, `commit`, `branch_diff`, `working_tree`를 같은 봉인 계약에 둔다. 판정 · 그래서 같은 종류의 입력이다. 중단 상태(`failed`, `canceled`, `interrupted`)의 bundle을 `track-findings`가 거부하는지는 확인하지 못했다(R25).[](source:rel-diff)[](source:sct-modes)[](source:sct-status) | position-flow | diff |
| deep | deep-security-scan | 앞 스킬이다. 완료 때 `report.md`와 canonical artifacts를 링크한다. scan-contract의 mode 표가 `deep_repository`도 같은 계약에 둔다. 판정 · 같은 종류의 입력이다(R26).[](source:rel-deep)[](source:sct-modes) | position-flow | deep |
| current | track-findings | 이 페이지의 스킬이다. 봉인된 scan 폴더를 받아 tracker에 기록한다.[](source:skill-scope) | position-flow | current |
| triage | triage-finding | 뒤 스킬이다. "security or vulnerability Jira/Linear tickets"를 입력으로 받는다. 판정 · `track-findings`가 만든 Linear나 Jira issue 본문에는 finding ID와 fingerprint binding이 들어가므로 이 입력이 될 수 있다. 두 스킬이 서로를 이름으로 지목하지는 않아 연결이 약하다(R40, 추론).[](source:rel-triage)[](source:skill-preview) | position-flow | triage |

| 관계 | 받는 것 | 넘기는 것 | 조건 |
|---|---|---|---|
| R24 · 산출물 호환(앞) | 봉인된 scan 폴더(`scan-manifest.json`, `findings.json`) | - | 사용자가 폴더를 주며 요청할 때 따로 호출한다. 자동 순서는 없다.[](source:rel-scan)[](source:skill-validate) |
| R25 · 산출물 호환(앞) | scan 폴더(`scan-manifest.json`, `findings.json`, `report.md`) | - | 중단된 scan의 bundle 거부 여부는 미확정이다.[](source:rel-diff)[](source:sct-status) |
| R26 · 산출물 호환(앞) | scan 폴더(`scan-manifest.json`, `findings.json`, `report.md`) | - | `deep_repository` mode도 같은 봉인 계약이다.[](source:rel-deep)[](source:sct-modes) |
| R40 · 산출물 호환(뒤, 추론) | - | Jira, Linear ticket과 본문의 binding | 서로를 지목하지 않아 강도가 약하다.[](source:rel-triage)[](source:skill-preview) |
| R84 · 참고 | helper `validate-tracking-source`, 도구 `get_`과 `record_codex_security_finding_issues` | 영수증(공유 로컬 issue 이력) | 위 도구 패널에서 소스로 확인했다.[](source:skill-validate)[](source:skill-record) |
| R88 · 참고 | `.app.json`의 connector 선언 | - | SKILL.md의 `app://` ID 셋이 선언과 일치한다.[](source:skill-scope)[](source:app-json) |
| R67 · 참고, 범위 밖 | Linear, Atlassian, GitHub app의 도구와 `gh` | issue, 초안 advisory | provider 쪽 도구의 동작은 이 트리에 없다. 연결하지 않았고 실행하지 않았다.[](source:skill-scope) |

## 어디까지 읽고 확인했나? {#audit span=12}

읽은 텍스트 파일은 17개다. 스킬 폴더 4개, 플러그인 공통 파일 9개, 이웃 스킬 4개(해당 줄만)다. 줄 범위만 읽은 부분 읽음 파일은 `sealed-contract.ts`, `workbench_publication.py`, `helpers-main.ts`와 이웃 스킬 4개다. 번역본(`*.KO.md`)은 이 스킬 폴더에 없고 바이너리도 없다.

| 파일 | 바이트 | 읽은 범위 |
|---|---|---|
| `skills/track-findings/SKILL.md` | 13,459 | 전부 |
| `skills/track-findings/references/jira.md` | 3,027 | 전부 |
| `skills/track-findings/references/github-security-advisories.md` | 3,420 | 전부 |
| `skills/track-findings/agents/openai.yaml` | 279 | 전부 |
| `mcp-app/src/helpers/validate-tracking-source.ts` | 2,744 | 전부 |
| `mcp-app/src/sealed-contract.ts` | 36,923 | 40~80, 100~225, 556~590줄만(1151줄 중) |
| `mcp-app/src/server/finding-issue-tools.ts` | 3,683 | 전부 |
| `mcp-app/src/server/tool-annotations.ts` | 223 | 전부 |
| `mcp-app/helpers-main.ts` | 8,642 | 120~132줄과 `validate-tracking-source` 줄 검색만 |
| `scripts/workbench_publication.py` | 20,245 | 34~60, 114~310줄만(454줄 중) |
| `references/scan-contract.md` | 16,529 | 전부 |
| `.app.json` | 717 | 전부 |
| `tests/test_track_findings_skill.py` | 1,944 | 전부 |
| `skills/security-scan/references/scan-results.md` | 2,871 | 13줄만 |
| `skills/security-diff-scan/SKILL.md` | 5,405 | 33줄만 |
| `skills/deep-security-scan/SKILL.md` | 3,127 | 14줄만 |
| `skills/triage-finding/SKILL.md` | 8,394 | 18줄만 |

표의 경로는 모두 `codex-security/plugins/codex-security/` 아래다.

원문 대조는 관계 R24~R26, R40, R67, R84, R88과 승인·재검증·중단 규칙 전체, 결과 4종, source 상태 3종, advisory header 2개와 endpoint 3개, mode `0600` 임시 파일 2곳(`gh` issue, advisory)에서 했다. 분석 중 원본은 수정하지 않았고, 대상 스킬의 지시(helper 실행, provider 호출, issue·advisory 쓰기)는 분석할 자료로만 읽었다.

@callout level=open-question title="중단된 scan도 helper를 통과할 수 있는가"
| helper의 봉인 검증 코드(`sealed-contract.ts`)에서 `scan.status` 값으로 거부하는 코드를 읽은 범위에서 찾지 못했다. `status`라는 문자열이 이 파일에서 검색되지 않았다.[](source:sc-digest)[](source:sc-seal) |
| `scan-contract.md`는 `failed`, `canceled`, `interrupted`로 봉인된 bundle이 부분 결과일 수 있고 finding 부재를 결론으로 쓰면 안 된다고 정한다.[](source:sct-status) |
| SKILL.md에는 중단된 scan을 다루는 문장이 없다(원문에 명시 없음). 판정 · 중단된 scan의 finding도 기록할 수는 있어 보이지만, 그 scan이 전체를 덮는다고 가정하면 안 된다. 파일 전체를 읽지 않았으므로 확정이 아니다. |

@callout level=open-question title="확인하지 못한 항목"
| 이 소스가 실제 실행되는 번들(`mcp/helpers.mjs` 등)과 같은지는 확인하지 못했다. 번들과 실행기(`launch_codex_security_mcp`)는 이번에 읽지 않았다. |
| `sealed-contract.ts`와 `workbench_publication.py`는 전부 읽지 않았다. 읽지 않은 줄에 다른 검사나 저장 경로가 있는지는 모른다. |
| Linear, Atlassian, GitHub app, `gh`는 연결하지 않았다. provider의 실제 응답과 권한 동작은 확인하지 않았다(R67). |
| 원문은 사용자가 승인을 거절했을 때의 처리를 적지 않는다. 그림의 `no` 간선은 판정이다. |
| `allow_implicit_invocation`을 호스트가 어떻게 해석하는지는 이 트리에 없다.[](source:policy) |
