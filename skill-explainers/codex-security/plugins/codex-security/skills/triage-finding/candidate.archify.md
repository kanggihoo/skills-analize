# triage-finding은 이미 보고된 finding을 어떻게 분류하나? {#triage-finding-page}

`triage-finding`은 scanner 보고서, advisory, GitHub, Jira, Linear 항목처럼 이미 있는 finding을 저장소 정책과 소스 근거만 읽어 분류한다. finding마다 `confirmed`, `not_actionable`, `needs_review` 중 하나를 내고, 파일 수정과 test, build, 앱 실행은 하지 않는다.[](source:t-core)[](source:t-verd)

- 새 취약점 찾기, 중복 triage, runtime validation, fix에는 쓰지 않는다.[](source:t-front)
- 위임이나 deep triage mode 없이 한 에이전트가 inline으로 처리한다.[](source:t-core)
- `confirmed`는 모든 통제를 지나 지원되는 보안 경계를 넘는다는 근거가 있을 때만 쓴다. 근거가 없다는 이유로는 finding을 닫지 않는다.[](source:t-verd)
- `confirmed`마다 `$fix-finding` handoff를 쓰지만 호출은 사용자가 고치자고 할 때만 한다.[](source:t-handoff)

@answer scope="원문 분석 · 스킬 폴더 6개 파일과 플러그인 공용 참조 읽음 · 코드와 CLI 실행 없음 · 외부 connector 동작은 범위 밖"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source t-full title="codex-security/plugins/codex-security/skills/triage-finding/SKILL.md · 8394B · 스킬 본문(원본)" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md
@source t-front title="triage-finding/SKILL.md · frontmatter" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=1:4
@source t-core title="triage-finding/SKILL.md · 목적과 실행 경계" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=8:10
@source t-intake title="triage-finding/SKILL.md · 입력 종류와 finding 없을 때" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=14:14
@source t-jira title="triage-finding/SKILL.md · Jira와 Linear intake" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=16:20
@source t-gh title="triage-finding/SKILL.md · GitHub intake" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=22:24
@source t-norm title="triage-finding/SKILL.md · 입력 정규화" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=26:35
@source t-pol1 title="triage-finding/SKILL.md · 정책 검토 시점과 resolver" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=39:39
@source t-pol2 title="triage-finding/SKILL.md · 정책의 지위와 한계" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=41:50
@source t-assess title="triage-finding/SKILL.md · 개별 claim 평가" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=52:60
@source t-verd title="triage-finding/SKILL.md · 판정 3종" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=62:68
@source t-rank title="triage-finding/SKILL.md · 순위와 owner hint" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=70:74
@source t-ret title="triage-finding/SKILL.md · 결과 반환" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=76:84
@source t-handoff title="triage-finding/SKILL.md · fix-finding handoff" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=82:82
@source t-writeback title="triage-finding/SKILL.md · 읽기 전용과 writeback" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=84:84
@source t-yaml title="triage-finding/agents/openai.yaml · 400B · UI 메타데이터" path=codex-security/plugins/codex-security/skills/triage-finding/agents/openai.yaml
@source c-full title="triage-finding/references/triage-result-contract.md · 4447B · 결과 계약" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md
@source c-schema title="triage-result-contract.md · schema 적합 범위" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=5:12
@source c-json title="triage-result-contract.md · JSON 모양" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=14:82
@source c-enums title="triage-result-contract.md · source type, 판정, 확신도 값" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=84:105
@source c-rank title="triage-result-contract.md · 경계 평가와 순위 규칙" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=107:114
@source c-next title="triage-result-contract.md · recommended_next_step 예시" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=79:80
@source i-full title="triage-finding/references/ticket-intake.md · 5231B · Jira와 Linear 가져오기" path=codex-security/plugins/codex-security/skills/triage-finding/references/ticket-intake.md
@source i-ret title="ticket-intake.md · 가져오기 방법" path=codex-security/plugins/codex-security/skills/triage-finding/references/ticket-intake.md lines=3:19
@source i-fail title="ticket-intake.md · 가져오기 실패 처리" path=codex-security/plugins/codex-security/skills/triage-finding/references/ticket-intake.md lines=31:38
@source i-norm title="ticket-intake.md · 정규화와 읽기 전용" path=codex-security/plugins/codex-security/skills/triage-finding/references/ticket-intake.md lines=40:48
@source i-app title="ticket-intake.md · Atlassian app 링크" path=codex-security/plugins/codex-security/skills/triage-finding/references/ticket-intake.md lines=7:7
@source g-full title="triage-finding/references/github-rest-intake.md · 12277B · GitHub 가져오기" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md
@source g-untrusted title="github-rest-intake.md · 기록은 untrusted data" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=3:3
@source g-rev title="github-rest-intake.md · revision 맞추기" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=9:11
@source g-select title="github-rest-intake.md · source 선택" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=13:24
@source g-transport title="github-rest-intake.md · 전송과 credential" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=26:37
@source g-cs title="github-rest-intake.md · code scanning" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=41:54
@source g-dep title="github-rest-intake.md · Dependabot" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=56:79
@source g-adv title="github-rest-intake.md · advisory와 private report" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=81:107
@source g-page title="github-rest-intake.md · pagination" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=109:113
@source g-status title="github-rest-intake.md · 상태 코드 처리" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=115:121
@source sg-full title="plugins/codex-security/references/security-guidance.md · 2830B · SECURITY.md 해석" path=codex-security/plugins/codex-security/references/security-guidance.md
@source sg-cmd title="security-guidance.md · resolver 명령" path=codex-security/plugins/codex-security/references/security-guidance.md lines=7:12
@source sg-rule title="security-guidance.md · root부터 leaf 규칙과 untrusted" path=codex-security/plugins/codex-security/references/security-guidance.md lines=30:36
@source sfa-full title="plugins/codex-security/references/static-finding-assessment.md · 3949B · 정적 근거 평가 틀" path=codex-security/plugins/codex-security/references/static-finding-assessment.md
@source sfa-tuple title="static-finding-assessment.md · 평가 tuple" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=3:21
@source sfa-order title="static-finding-assessment.md · 증거 탐색 순서" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=23:37
@source sfa-conf title="static-finding-assessment.md · 정적 확신도" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=52:61
@source rm-ts title="plugins/codex-security/mcp-app/src/helpers/resolve-security-md.ts · 14719B · resolver 구현 (178~190, 300~437줄 표본)" path=codex-security/plugins/codex-security/mcp-app/src/helpers/resolve-security-md.ts lines=300:437
@source rm-inside title="resolve-security-md.ts · root 밖 경로 거부" path=codex-security/plugins/codex-security/mcp-app/src/helpers/resolve-security-md.ts lines=178:190
@source rm-scope title="resolve-security-md.ts · 없는 scope 거부" path=codex-security/plugins/codex-security/mcp-app/src/helpers/resolve-security-md.ts lines=345:352
@source app-json title="plugins/codex-security/.app.json · 717B · connector 선언" path=codex-security/plugins/codex-security/.app.json lines=3:26
@source fs-schema title="plugins/codex-security/schemas/findings.schema.json · 10591B · 완료된 scan용 schema (앞부분과 required 목록만)" path=codex-security/plugins/codex-security/schemas/findings.schema.json lines=1:12
@source plugin-json title="plugins/codex-security/.codex-plugin/plugin.json · 1682B · 플러그인 선언" path=codex-security/plugins/codex-security/.codex-plugin/plugin.json
@source readme title="plugins/codex-security/skills/README.md · 3752B · 벤더의 스킬 안내" path=codex-security/plugins/codex-security/skills/README.md lines=24:24
@source ff-desc title="fix-finding/SKILL.md · 3번째 줄만 읽음(R27 대조)" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=3:3
@source rda-dep title="resolve-dependency-alert/SKILL.md · 10번째 줄만 읽음(R33 대조)" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=10:10
@source dsp-prec title="define-security-policy/SKILL.md · 28번째 줄만 읽음(R46 대조)" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=28:28
@source val-desc title="validation/SKILL.md · 13번째 줄만 읽음(R32 대조)" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=13:13
@source tf-body title="track-findings/SKILL.md · 76번째 줄만 읽음(R40 대조)" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=76:76
@source sc-doc title="plugins/codex-security/references/scan-contract.md · 12번째 줄만 읽음(R75 대조)" path=codex-security/plugins/codex-security/references/scan-contract.md lines=12:12

## 이 스킬은 언제 켜지고 언제 쓰면 안 되나? {#activation}

호출 조건은 frontmatter의 description 한 곳에 있다. description은 모델이 호출을 판단할 때 참고하는 설명이고, 특정 단어와 정확히 일치해야 켜지는 사전이 아니다.[](source:t-front)

@code source=t-front language=yaml

| 구분 | 원문 규칙 |
|---|---|
| 켜는 경우 | 이미 있는 보안 finding을 저장소 정책과 정적 근거로 분류할 때다. scanner 보고서, advisory, GitHub finding, Jira나 Linear ticket이 입력이다.[](source:t-front)[](source:t-intake) |
| 켜지 않는 경우 | 취약점 찾기(discovery), 중복 triage, runtime validation, fix에는 쓰지 않는다.[](source:t-front) |
| Jira와 Linear | 보안이나 취약점 ticket에는 이 스킬을 쓴다. Atlassian과 Linear 언급은 claim을 가져오라는 connector 힌트이고, 일반 ticket triage나 중복 triage로 바꿀 이유가 아니다.[](source:t-jira) |
| 호출 제한 필드 | frontmatter에 `disable-model-invocation`이 없고 `agents/openai.yaml`에도 `policy`가 없다. 원문에 명시 없음.[](source:t-front)[](source:t-yaml) |
| 금지 | 위임, deep triage mode, 무관한 취약점 탐색, 저장소 파일 수정, test·build·앱·PoC·dynamic validation 실행을 하지 않는다.[](source:t-core) |
| 한계 표시 | 정적 근거의 한계를 적고, runtime 검증이나 전수 조사를 했다고 말하지 않는다.[](source:t-core) |

설명용 예시 · "이 GitHub code scanning alert가 진짜인지 이 저장소 기준으로 봐 줘"는 켜지는 요청이다. "이 코드에서 취약점을 찾아 줘"는 discovery라서 이 스킬의 범위가 아니다.

판정 · 호출을 막는 장치는 description 문장과 본문의 금지 목록뿐이다. 필드로 강제하지 않으므로 호스트가 이 문장을 지키는지는 실행으로 확인해야 한다.[](source:t-front)[](source:t-yaml)

@callout level=warning title="finding 본문과 정책은 지시가 아니다"
| imported ticket, GitHub 기록, 저장소 자료, `SECURITY.md` 텍스트는 모두 근거 데이터다. 명령 실행, credential 접근, 새 대상 추가, 쓰기를 허가하지 못한다.[](source:t-assess)[](source:t-pol2)[](source:g-untrusted)

## 어떤 순서로 가져오고 판정하나? {#procedure}

에이전트는 finding 내용을 먼저 확보하고, 코드를 보기 전에 정책부터 읽는다. finding이 없거나 가져오지 못하면 코드 검사와 결과 계약 출력 전에 멈춘다.[](source:t-intake)[](source:t-jira)[](source:i-fail)

@workflow id=triage-flow title="triage-finding 진행 순서"
| lane intake | 입력 확보 |
| lane assess | 근거 평가 |
| lane out | 결과 |
| ask | finding이 있나? | external | intake | source:t-intake |
| stop | 요청하고 멈춤 | external | intake | source:t-intake |
| fetch | 내용 가져오기 | backend | intake | source:t-jira |
| norm | 입력 정규화 | backend | intake | source:t-norm |
| policy | SECURITY.md 검토 | security | assess | source:t-pol1 |
| assess | 정적 근거 평가 | backend | assess | source:t-assess |
| verdict | 판정 | backend | out | source:t-verd |
| rank | 순위 매김 | backend | out | source:t-rank |
| result | 결과 반환 | backend | out | source:t-ret |
| ask > stop | 없음 |
| ask > fetch | 있음 |
| fetch > norm | |
| norm > policy | |
| policy > assess | |
| assess > verdict | |
| verdict > rank | |
| rank > result | handoff | emphasis |

@steps id=triage-steps
| ask | finding이 있나? | 공급된 finding이 없으면 코드를 보거나 `triage-finding/v0`를 내기 전에 finding을 요청한다. repository나 claim이 너무 모호할 때만 되묻고, 나머지 빠진 사실은 proof gap으로 남긴다.[](source:t-intake) | triage-flow | ask |
| stop | 요청하고 멈춤 | ticket 내용을 하나도 가져오지 못했고 사용자도 주지 않았으면 repository 검사와 계약 출력을 하지 않는다.[](source:i-fail) | triage-flow | stop |
| fetch | 내용 가져오기 | Jira, Linear, GitHub 내용을 먼저 가져온다. 접근하지 못한 ticket은 사용자가 전체 내용을 주기 전에는 판정 근거가 될 수 없다.[](source:t-jira)[](source:t-gh) | triage-flow | fetch |
| norm | 입력 정규화 | `triage_item_id`를 붙이고 외부 식별자는 `input_id`에 남긴다. 제목, source type, 구성요소, 공격자, 통제 입력, 전제 조건, 영향, 출처를 뽑는다. 완료된 scan의 필드를 지어내지 않는다.[](source:t-norm) | triage-flow | norm |
| policy | SECURITY.md 검토 | 코드를 따라가거나 판정하기 전에 영향받는 파일과 디렉터리마다 root와 scope의 `SECURITY.md`를 읽는다. 가까운 정책이 우선한다.[](source:t-pol1)[](source:t-pol2) | triage-flow | policy |
| assess | 정적 근거 평가 | 공격자와 source를 모든 변환과 통제를 거쳐 정확한 결과까지 따라간다. 이름이나 인코딩, 예외 처리, 위험한 sink 하나만으로 claim을 정하지 않는다.[](source:t-assess) | triage-flow | assess |
| verdict | 판정 | finding마다 `confirmed`, `not_actionable`, `needs_review` 중 하나를 낸다.[](source:t-verd) | triage-flow | verdict |
| rank | 순위 매김 | `confirmed`와 `needs_review`를 따로 도달 가능성 순으로 줄 세운다.[](source:t-rank) | triage-flow | rank |
| result | 결과 반환 | 입력 순서를 지켜 `triage-finding/v0` 결과를 만들고 Markdown 요약을 낸다. `confirmed`에는 handoff를 붙인다.[](source:t-ret) | triage-flow | result |

가져오는 방법은 출처마다 다르다. 두 reference가 각각 규칙을 소유한다.

| 출처 | 원문 규칙 |
|---|---|
| Jira | 기본은 native Atlassian app이다. 사용자 신원과 site를 확인해 같은 연결을 유지하고 모호하면 묻는다. 한 건은 `getJiraIssue`, 여러 건은 JQL 검색으로 `isLast`까지 page를 따라간다. 읽기 작업만 쓴다.[](source:i-ret) |
| Linear | 기본은 native app이다. 정확한 URL이나 식별자는 바로 가져오고, 하위 issue는 모든 page를 따라간다. 선택된 issue마다 결과 하나를 breadth-first 순서로 남기고 잘라내지 않는다.[](source:i-ret)[](source:i-fail) |
| GitHub 시작 | repository는 명시된 것, 첨부된 project, 모호하지 않은 `origin` 순으로 정한다. 불확실하면 credential 조회 전에 GitHub URL을 묻는다.[](source:g-select) |
| GitHub source 선택 | repository만 주고 source를 안 고르면 GitHub를 조회하지 않고 `triage-finding/v0`도 내지 않는다. code scanning, Dependabot, advisory와 private report, 전부 중 하나를 고르게 한다. GitHub Issue는 `all`에 들지 않고 사용자가 지목할 때만 가져온다.[](source:g-select) |
| revision 맞추기 | 로컬 revision과 GitHub의 `commit_sha`, `ref`를 정적으로 비교한다. 어긋남과 없는 경로는 반증이나 proof gap으로 남기고 checkout은 옮기지 않는다.[](source:g-rev) |
| 가져오기 실패 | `401`과 `403`은 연결이나 권한 문제로 묻는다. `404`는 그 source의 intake 막힘이지 finding이 없다는 증거가 아니다. `200 []`만 일치하는 finding이 없다는 뜻이다. `all`에서 한 source가 실패하면 나머지는 계속한다.[](source:g-status) |

수치 · 원문이 정한 숫자는 아래뿐이다.[](source:g-page)[](source:g-transport)

@facts
| 기본 page 크기 | `per_page=100`. 명시한 크기가 있으면 따르고, 읽기 한도가 있으면 그 전에 멈춘다(기본값) |
| GitHub API 버전 헤더 | `X-GitHub-Api-Version: 2022-11-28`(직접 HTTP 읽기를 할 때 지시) |
| GitHub 상태 필터 | advisory는 요청당 `state` 하나라서 `triage`, `draft`, `published`, `closed`를 따로 요청한다 |
| 결과 schema 버전 | `triage-finding/v0` |

@callout level=warning title="GitHub 읽기는 범위와 credential을 먼저 맞춘다"
| 요청한 transport가 선택한 scope를 지킬 수 없으면 사용자가 동의하기 전에 다른 credential이나 transport로 바꾸지 않는다. redirect는 거부하고 자동 pagination은 켜지 않는다. credential은 인자, 파일, log, 도구 출력에 남기지 않는다.[](source:g-transport)[](source:g-page)

## 판정은 어떤 조건에서 나오고 어떻게 순위를 매기나? {#verdicts}

판정은 증거 수준으로 갈린다. 증거가 모자라면 `confirmed`로도 `not_actionable`로도 가지 않고 `needs_review`에 남는다.[](source:t-verd)

| verdict | 쓰는 조건 |
|---|---|
| `confirmed` | 정적 근거가 공격자와 source에서 정확한 결과까지, 모든 중요한 통제를 지나 이어진다. 버전, 구성, 권한, 통제 우회 전제도 근거로 세워져 있고 지원되는 보안 경계를 넘는다.{caution:조건이 가장 많다}[](source:t-verd) |
| `not_actionable` | 실제 배포 경로와 지원되는 구성 전반에서 claim을 꺾는 긍정 근거가 있다. 예: 영향받는 구성요소가 없다, 도달 불가, 모든 경로에서 통제가 효과적이다, 제외된 산출물이다, 같은 권한의 신뢰 입력이고 더 낮은 신뢰 경로가 지원되지 않는다.[](source:t-verd) |
| `needs_review` | 도달 가능성, source 신뢰, 통제, 하위 동작, 구성, 범위, 경계 정책 중 중요한 사실 하나가 풀리지 않았다. 판정을 바꿀 가장 작은 사실을 적는다.{caution:기본 도착지}[](source:t-verd) |

- trusted operator의 선택, 안전하지 않은 opt-in, 꺼진 완화책, build에 따라 달라지는 노출은 claim이 지원되는 보안 모델 안에 든다는 근거가 있어야 `confirmed`가 된다.[](source:t-verd)
- 호출자 하나나 기본 경로 하나가 안전하다고, 또는 근거가 없다고 claim을 닫지 않는다.[](source:t-verd)
- 안전한 기본값은 지원되는 다른 구성에 대한 claim을 꺾지 못한다. 안전하지 않은 옵션이 있다는 사실만으로 지원 경계가 생기지도 않는다.[](source:t-assess)
- local, CLI, administrator, plugin, example 같은 이름만 보고 신뢰를 추론하지 않는다. 그 값에 누가 영향을 주는지와 해당 표면이 그 공격자를 지원하는지를 확인한다.[](source:t-assess)

근거는 좁은 범위에서 넓은 범위로 찾는다. 각 claim마다 source, control, sink, reachable path, boundary, counterevidence, proof gaps를 모은다. 의존성이 있다는 사실이나 문자열 일치만으로 평가를 끝내지 않는다.[](source:sfa-tuple)

| 순서 | 먼저 볼 근거 |
|---|---|
| 1 | 사용자, scanner, advisory, SARIF가 준 위치[](source:sfa-order) |
| 2 | 의존성 manifest, lockfile, package export, build 메타데이터, 배포 설정[](source:sfa-order) |
| 3 | 영향받는 함수, 호출처, route, parser 진입점, CLI 명령, message consumer[](source:sfa-order) |
| 4 | 가까운 guard, validator, sanitizer, 권한 검사, feature flag[](source:sfa-order) |
| 5 | `SECURITY.md`, 위협 모델, 제품 문서, 배포 파일, test 같은 제품 표면 근거[](source:sfa-order) |

정적 확신도는 증거 품질로 정한다. `high`는 정확한 source, control, sink 경로와 전제, 경계 근거가 있고 해소되지 않은 반증이 없을 때다. `medium`은 그럴듯한 경로에 직접 근거가 일부 있지만 호출 연쇄, 구성, 버전, 배포, 경계 중 하나가 불완전할 때다. `low`는 간접 근거나 큰 모호성, 저장소 맥락 부족일 때다.[](source:sfa-conf)

순위는 도달 가능성, 필요한 권한, 전제 조건, 경로 통제력, guard 강도, 증거 품질로 정한다. 영향이나 scanner 심각도는 마지막 동점 처리에만 쓴다.[](source:t-rank)

| 계약 항목 | 규칙 |
|---|---|
| queue | `confirmed`와 `needs_review`를 따로 순위를 매기고 `rank_queue`로 구분한다. 각 queue 안에서 1부터 빠짐없이 매긴다.[](source:c-rank) |
| `not_actionable` | `rank_queue`와 `rank`는 `null`, `drivers`는 빈 배열, `rationale`은 짧은 설명이다.[](source:c-rank) |
| 경계 불명확 | `boundary_crossed`에 `null`을 쓰고 `needs_review`를 우선한다.[](source:c-rank) |
| `fix_finding_handoff` | `confirmed`일 때만 값이 있고 나머지는 `null`이다.[](source:c-rank) |
| owner hint | CODEOWNERS 같은 로컬 근거로 소유자가 분명할 때만 적는다. 계약에 owner 필드가 없어 기존 근거나 next-step 문장, Markdown에 쓴다. 판정과 순위에는 영향이 없다.[](source:t-rank) |
| source type | `sarif`, `cve`, `advisory`, `scanner_ticket`, `bug_bounty`, `codex_security_finding`, `freeform`, `unknown` 8개다. Jira와 Linear ticket은 보통 `scanner_ticket`이다.[](source:c-enums)[](source:i-norm) |

결과는 간결한 Markdown 요약으로 낸다. 전체 JSON은 사용자가 원본이나 복사용 결과를 요청할 때만 붙인다.[](source:t-ret)

## 다른 스킬과 어디에서 이어지나? {#position}

`triage-finding`은 `remediate-finding` 묶음에서 고치기 전의 분류 단계다. `$fix-finding` handoff를 결과에 넣지만 실제 호출은 사용자가 고치자고 할 때만 일어난다(R27).[](source:t-handoff)

@workflow id=triage-position title="triage-finding 앞뒤 스킬"
| policy | define-security-policy | backend | source:dsp-prec |
| scanfile | 봉인 scan의 findings.json | database | source:sc-doc |
| dep | resolve-dependency-alert | backend | source:rda-dep |
| current | triage-finding | backend | source:t-front |
| fix | fix-finding | backend | source:ff-desc |
| policy > current | R46 공유 SECURITY.md | dashed |
| scanfile > current | R75 사용자가 파일 전달 |
| dep > current | R33 intake 문서 참조 | dashed |
| current > fix | R27 사용자 요청 시 | emphasis |

@steps id=triage-position-steps
| highlight | triage-finding | 이 페이지의 스킬이다. 앞의 세 노드는 입력이나 정책을 주는 쪽이고 뒤의 `fix-finding`은 사용자가 요청할 때만 이어진다. | triage-position | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R27 · 넘김, 명시-이름 | 넘기는 것은 `fix-finding` handoff다. 통제 입력, source, control 또는 sink, 전제 조건, 정확한 코드 위치, 필요한 invariant, 고칠 경계, 남은 proof gap을 담는다. 호출은 사용자가 요청할 때만 한다.[](source:t-handoff)[](source:ff-desc) 결과 계약의 예시 값에도 `recommended_next_step: "fix-finding"`이 나온다.[](source:c-next) |
| R46 · 공유 상태, 명시-역할 | `SECURITY.md`를 `define-security-policy`가 쓰고 `triage-finding`이 읽는다. 정책은 "primary local definition"이지만 코드 근거가 claim을 받쳐야 한다. 가장 가까운 정책이 우선한다.[](source:t-pol2)[](source:dsp-prec) |
| R75 · 산출물 호환, 명시-역할 | 사용자가 유효한 `codex-security.findings` 파일을 주면 입력으로 쓴다. `findingId`, `occurrenceId`, `ruleId`를 source 식별자로 보존한다. 자동 연결은 없다.[](source:c-schema)[](source:sc-doc) |
| R33 · 참고, 명시-이름 | `resolve-dependency-alert`가 Dependabot 알림을 가져올 때 이 스킬의 GitHub intake 절을 따른다. 이 스킬이 호출되는 것이 아니다.[](source:rda-dep)[](source:g-dep) |
| R32 · 같은 계열, 추론 | `validation`도 finding에 근거 기반 판정을 낸다. 이 스킬은 정적 근거만 쓰고, `validation`은 필요하면 재현도 쓴다. 직접 연결은 없다.[](source:t-core)[](source:val-desc) |
| R40 · 산출물 호환, 추론 | `track-findings`가 만든 Linear, Jira, GitHub issue가 이 스킬의 ticket 입력이 될 수 있다. 서로를 지목하지 않아 강도가 약하다.[](source:tf-body)[](source:t-jira) |

판정 · 위 표에서 호출이나 순서를 강제하는 관계는 R27 하나다. 그마저 사용자 요청이 조건이다.[](source:t-handoff)

전체 흐름은 색인 기준 `codex-security/_group-remediate-finding`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 폴더 | `SKILL.md`(8,394B), `agents/openai.yaml`(400B), `references/` 3개(`ticket-intake.md` 5,231B, `github-rest-intake.md` 12,277B, `triage-result-contract.md` 4,447B)를 끝까지 읽었다.[](source:t-full)[](source:t-yaml)[](source:i-full)[](source:g-full)[](source:c-full) |
| 플러그인 공용 참조 | `references/security-guidance.md`(2,830B)와 `references/static-finding-assessment.md`(3,949B)를 끝까지 읽었다.[](source:sg-full)[](source:sfa-full) |
| 도구와 선언 | `.app.json`(717B)은 전부 읽었다. connector 4개가 모두 `required: false`이고 Atlassian만 `capabilities: ["read", "write"]`다.[](source:app-json) `resolve-security-md.ts`는 178~190줄과 300~437줄만 읽었다. 없는 scope는 `scan scope does not exist` 오류로 거부하고 root 밖 경로도 막는다.[](source:rm-scope)[](source:rm-inside) 판정 · 그래서 스킬이 없는 경로는 가장 가까운 상위 경로로 resolve하라고 따로 지시한 것으로 읽힌다.[](source:t-pol1) |
| 구조·표본만 확인(전부 읽지 않음) | `schemas/findings.schema.json`은 앞부분과 `required` 목록만 봤다. `documentType`이 `codex-security.findings`이고 필수는 `documentType`, `schemaVersion`, `scanId`, `findings`다.[](source:fs-schema) `resolve-security-md.ts`의 300줄 앞(경로 처리 보조 함수, 178~190줄 제외)은 읽지 않았다. |
| 관계 대조 | 원장 R27, R32, R33, R40, R46, R75를 원문과 맞췄다. 상대 스킬은 줄 단위로만 읽었다(`fix-finding` 3, `resolve-dependency-alert` 10, `define-security-policy` 28, `validation` 13, `track-findings` 76, `scan-contract.md` 12).[](source:ff-desc)[](source:rda-dep)[](source:dsp-prec)[](source:val-desc)[](source:tf-body)[](source:sc-doc) |
| 공통 확인 | `skills/README.md`는 이 스킬을 "Give it the alert or ticket"로 소개한다.[](source:readme) `.codex-plugin/plugin.json`(1,682B)과 `.mcp.json`(2,078B)을 읽었다. 이 스킬 지시는 둘에 의존하지 않는다.[](source:plugin-json) |
| 수치 | 원문이 정한 숫자는 위 `@facts`와 순위 규칙(1부터 연속)뿐이다. |
| 제외 | 번역본은 없다. 바이너리는 없다. 읽은 텍스트 파일은 스킬 폴더 5개, 공용 참조 2개, 도구·선언 4개, 관계 대조용 7개다. |

@callout level=open-question title="확인하지 못한 부분"
| Atlassian, Linear, GitHub connector가 노출하는 도구(`getJiraIssue`, `searchJiraIssuesUsingJql`, `list_issues` 등)의 실제 동작은 이 저장소에 정의가 없어 확인하지 못했다. `.app.json`은 선언만 있다.[](source:app-json)
| `acli`와 `gh` CLI 경로, 외부 URL은 실행하거나 열지 않았다. 원문 지시만 읽었다.[](source:i-ret)[](source:g-transport)
| 호스트가 description의 호출 제한을 실제로 지키는지, 결과 JSON을 어떤 검사기가 확인하는지는 실행하지 않아 확인하지 못했다.
| `resolve-security-md.ts`의 native 호출(Unix 계정 조회, Windows 경로 연산)은 소스를 읽지 않았다.

분석 중 원본은 수정하지 않았다. 원문의 어떤 지시도 실행하지 않았다.
