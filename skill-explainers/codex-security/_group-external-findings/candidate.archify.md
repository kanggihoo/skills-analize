# scanner, Cloud, issue tracker 사이에서 finding은 누가 가져오고 올리고 기록하고 읽나? {#group-external-findings}

외부 scanner 결과를 가져오거나 Cloud에 올리는 일은 `publish-findings`, 봉인된 scan을 issue로 기록하는 일은 `track-findings`, Cloud를 읽는 일은 `cloud-findings`가 맡는다. **세 스킬은 순서로 이어진 파이프라인이 아니라 요청마다 고르는 선택지다.**[](source:pf-desc)[](source:tf-desc)[](source:cf-desc) 이 분석은 **부분 분석**이다. Cloud 도구, issue provider 도구, `docs/sdk.md`가 이 저장소에 없다.

- `publish-findings`는 외부 scanner 결과를 local workbench에 저장하고, 사용자가 미리보기를 확인한 뒤에만 Cloud에 게시한다.[](source:pf-local)[](source:pf-pub)
- `track-findings`는 봉인된 scan 하나의 finding을 한 provider의 한 destination에 미리보기와 승인을 거쳐 기록한다.[](source:tf-intro)
- `cloud-findings`는 Cloud 데이터를 읽기만 한다. 같은 connector의 쓰기 도구는 이 스킬의 일이 아니다.[](source:cf-ro)
- 스킬이 다른 스킬로 넘기는 곳은 이 묶음 안에서 `resolve-dependency-alert`가 가져오기 요청을 `publish-findings`로 보내는 한 곳이다.[](source:rd-import)

@answer scope="codex-security 컬렉션 · 묶음 external-findings · 스킬 4개 · 지시상 동작 · 부분 분석"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source pf-desc title="publish-findings description" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=3:3
@source pf-intent title="요청 문구별 시작점" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=8:8
@source pf-local title="로컬 가져오기" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=38:38
@source pf-pub title="Cloud 게시" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=44:44
@source pf-cont title="Continuum 행" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=25:25
@source pf-patch title="Continuum patches 행" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=28:28
@source pf-yaml title="implicit invocation 선언" path=codex-security/plugins/codex-security/skills/publish-findings/agents/openai.yaml lines=5:6
@source pf-store title="외부 finding 저장 형식" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts lines=14:60
@source pf-recpub title="게시 영수증 형식" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-finding-publications.ts lines=5:17
@source tf-desc title="track-findings description" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=3:3
@source tf-intro title="범위와 승인 원칙" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=8:8
@source tf-valid title="봉인 검증 helper" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=16:26
@source tf-dup title="저장된 연결 읽기" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=57:57
@source tf-prev title="미리보기와 승인" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=80:80
@source tf-rec title="영수증 기록" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=90:90
@source tf-yaml title="implicit invocation 선언" path=codex-security/plugins/codex-security/skills/track-findings/agents/openai.yaml lines=5:6
@source cf-desc title="cloud-findings description" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=3:3
@source cf-ro title="읽기 전용 선언" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=8:10
@source cf-imp title="imported finding 읽기" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=27:27
@source cf-yaml title="implicit invocation 선언" path=codex-security/plugins/codex-security/skills/cloud-findings/agents/openai.yaml lines=5:6
@source rd-import title="가져오기 요청 안내" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=10:10
@source scan-diff title="diff scan 완료" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=33:33
@source scan-deep title="deep scan 완료" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=14:14
@source scan-res title="scan 결과 봉인" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md lines=13:13
@source ap-cont title="attack-path-analysis의 Continuum 규칙" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=21:21
@source fix-patch title="fix-finding의 patch 후보" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=38:38
@source tri-int title="triage-finding 입력" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=18:18

## 요청이 오면 어느 스킬을 고르나? {#flow span=12}

요청의 입력이 무엇인지로 가른다. 입력은 외부 scanner 결과, 봉인된 scan, Cloud에 저장된 finding 중 하나다. 어느 스킬을 켤지는 모델이 `description`을 보고 판단하며, 세 스킬 모두 implicit invocation을 허용한다.[](source:pf-yaml)[](source:tf-yaml)[](source:cf-yaml) 그림의 판단 순서는 읽기 쉽게 정한 판정이다. 원문은 선택 순서를 정하지 않는다(원문에 명시 없음).

@workflow id=choose-flow title="외부 finding 요청 가르기"
| req | finding 요청 | external | source:pf-intent |
| q1 | 외부 scanner 결과를 가져오거나 올리나? | backend | source:pf-desc |
| pub | publish-findings | database | source:pf-desc |
| q2 | 봉인된 scan을 issue로 기록하나? | backend | source:tf-desc |
| tf | track-findings | cloud | source:tf-desc |
| q3 | Cloud의 finding을 읽기만 하나? | backend | source:cf-desc |
| cf | cloud-findings | frontend | source:cf-desc |
| other | 이 묶음 밖 | external |
| rd | resolve-dependency-alert | external | source:rd-import |
| req > q1 | |
| q1 > pub | 예 | emphasis |
| q1 > q2 | 아니오 |
| q2 > tf | 예 | emphasis |
| q2 > q3 | 아니오 |
| q3 > cf | 예 | emphasis |
| q3 > other | 아니오 |
| rd > pub | 가져오기 명시 요청 | dashed |

@steps id=choose-steps
| s-pub | publish-findings | scanner 결과를 가져와 local workbench에 저장하고, 확인된 선택분을 Cloud에 올린다.[](source:pf-desc) | choose-flow | pub |
| s-tf | track-findings | 봉인된 scan 하나의 finding을 provider 한 곳에 기록한다.[](source:tf-intro) | choose-flow | tf |
| s-cf | cloud-findings | Cloud의 finding, 보고서, scan 상태를 읽어 답한다.[](source:cf-ro) | choose-flow | cf |
| s-rd | resolve-dependency-alert | 의존성 알림을 조사하다가 가져오기 요청이면 `publish-findings`로 넘긴다.[](source:rd-import) | choose-flow | rd |

## 스킬 사이에 무엇을 넘기고 참고하나? {#relations span=12}

원장의 관계 중 이 묶음 스킬이 걸린 행이다. 다음 안내와 참고는 자동 실행이 아니다. 그림에는 R35, R38, R39, R24~R26만 그렸고, 나머지는 표에 "그림에서 생략"으로 남겼다.

@architecture id=state-map title="스킬과 공유 상태"
| scanskill | scan 스킬(묶음 밖) | backend |
| rd | resolve-dependency-alert | backend |
| pub | publish-findings | backend | source:pf-desc |
| tf | track-findings | backend | source:tf-desc |
| cf | cloud-findings | backend | source:cf-desc |
| wb | local workbench | database | source:pf-store |
| cloud | Cloud 도구(정의가 이 트리에 없음) | cloud | source:cf-ro |
| trk | issue provider 도구(정의가 이 트리에 없음) | external | source:tf-intro |
| scanskill > tf | 결과 전달 |
| rd > pub | 다음 안내 |
| pub > cf | 결과 전달 | dashed |
| cf > pub | 참고 | dashed |
| pub > wb | 참고 |
| tf > wb | 참고 |
| cf > cloud | 참고 |
| tf > trk | 참고 |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| 묶음 밖 scan 스킬(`security-scan`, `security-diff-scan`, `deep-security-scan`) {#g-r24} | `track-findings` | 결과 전달 | scan이 끝나 `scan-manifest.json`과 `findings.json`이 생기면 사용자가 요청할 때 따로 부른다. 자동 순서는 없다(R24~R26)[](source:scan-res)[](source:scan-diff)[](source:scan-deep)[](source:tf-intro) |
| `resolve-dependency-alert` {#g-r35} | `publish-findings` | 다음 안내 | 사용자가 가져오기를 명시 요청할 때만 쓴다. 알림 조회 요청은 선택한 scanner와 대상만 조회한다[](source:rd-import) |
| `publish-findings` {#g-r38} | `cloud-findings` | 결과 전달 | 근거 방식은 추론이다. Cloud에 올린 finding을 `cloud-findings`가 읽을 수 있다. 두 파일이 서로를 이름으로 지목하지 않는다[](source:pf-pub)[](source:cf-imp) |
| `cloud-findings` {#g-r39} | `publish-findings` | 참고 | "upload results"를 금지한다. 업로드가 `publish-findings`의 일이라는 연결이고 이름 지목은 없다[](source:cf-ro)[](source:pf-desc) |
| `publish-findings` {#g-r89} | local workbench의 외부 finding 저장소 | 참고 | 가져오기마다 import ID와 finding version을 남긴다. 이 행은 추론이고, helper를 실제로 부르는 구성요소는 확인하지 못했다[](source:pf-local)[](source:pf-store)[](source:pf-recpub) |
| `track-findings` {#g-r84} | local workbench의 helper와 MCP 도구 | 참고 | 쓰기가 받아들여지면 즉시 영수증을 기록한다. 기록이 실패하면 다른 create를 허가하지 않는다[](source:tf-valid)[](source:tf-dup)[](source:tf-rec) |
| `cloud-findings` {#g-r66} | Cloud 도구(`defense_factory_*`) | 참고 | 도구 이름과 schema는 호출 시점에 찾아 쓴다. 정의가 이 트리에 없어 범위 밖이다[](source:cf-ro) |
| `track-findings` {#g-r67} | Linear, Jira, GitHub의 도구와 `gh` CLI | 참고 | 미리보기와 승인을 받은 뒤 기록한다. provider 쪽 동작은 이 트리에 없어 범위 밖이다[](source:tf-intro)[](source:tf-prev) |
| `publish-findings` {#g-r68} | 외부 scanner CLI와 문서 | 참고 | 그림에서 생략. 가져오기는 먼저 `--dry-run`으로 보고, 쓰기는 승인 후 `--yes`로 한다. 범위 밖이다[](source:pf-local) |
| `publish-findings` {#g-r36} | `attack-path-analysis` | 다음 안내 | 그림에서 생략(묶음 밖으로 가는 행). Continuum 항목의 attack-path 점수는 저장된 `.evidence`를 넘겨 쓴다[](source:pf-cont)[](source:ap-cont) |
| `publish-findings` {#g-r37} | `fix-finding` | 결과 전달 | 그림에서 생략(묶음 밖으로 가는 행). Continuum finding 하나를 `--source-root`와 함께 수집하면 patch가 따라온다[](source:pf-patch)[](source:fix-patch) |
| `track-findings` {#g-r40} | `triage-finding` | 결과 전달 | 그림에서 생략(묶음 밖으로 가는 행). 근거 방식은 추론이고 강도가 약하다. 두 스킬이 서로를 지목하지 않는다[](source:tf-prev)[](source:tri-int) |

## 어떤 파일과 상태를 함께 쓰나? {#state span=12}

쓰는 주체는 원문이 지시한 동작이며 실행으로 확인하지 않았다. 선후 관계는 정해져 있지 않다.

| 파일·상태 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| 봉인된 scan 폴더(`scan-manifest.json`, `findings.json`) | 묶음 밖 scan 스킬이 만든다(호스트 workbench나 SDK가 봉인)[](source:scan-res) | `track-findings`가 검증하고 읽는다. 폴더는 바꾸지 않는다[](source:tf-intro)[](source:tf-valid) |
| local workbench의 외부 finding 저장소 | `publish-findings`가 가져온 finding과 import ID를 남긴다[](source:pf-local)[](source:pf-store) | `publish-findings`가 import를 찾아 Cloud 게시 대상으로 고른다[](source:pf-pub) |
| local workbench의 게시 영수증 | `publish-findings`의 게시가 영수증을 남긴다(`created`, `updated`, `unchanged`, `private_job`)[](source:pf-recpub) | 원문에 명시 없음 |
| local workbench의 issue 이력 | `track-findings`가 `record_codex_security_finding_issues`로 영수증을 쓴다[](source:tf-rec) | `track-findings`가 `get_codex_security_finding_issues`로 중복 후보를 읽는다. 원격 검색을 대체하지 않는다[](source:tf-dup) |
| Cloud에 저장된 finding | `publish-findings`가 `group.publish`로 올린다. 사용자 확인 뒤에만 한다[](source:pf-pub) | `cloud-findings`가 읽는다. imported finding은 `api_version` `v2`로 본다[](source:cf-imp) |
| issue tracker의 issue, 초안 advisory | `track-findings`가 승인된 payload로 만든다[](source:tf-prev) | 원문에 명시 없음. 묶음 밖 `triage-finding`이 ticket을 입력으로 받는다(R40, 추론)[](source:tri-int) |
