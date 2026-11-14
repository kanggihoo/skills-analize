# scanner, Cloud, issue tracker 사이에서 finding은 누가 가져오고 올리고 기록하고 읽나? {#external-findings-page}

네 스킬은 순서대로 이어진 파이프라인이 아니라, 요청 종류에 따라 고르는 선택지다. `publish-findings`는 외부 scanner 결과를 가져와 저장하고 게시하며, `track-findings`는 봉인된 scan의 finding을 issue로 기록하고, `cloud-findings`는 Cloud를 읽기만 한다.[](source:pf-intro)[](source:tf-intro)[](source:cf-ro)

- `publish-findings`는 local workbench에 먼저 저장하고, 사용자가 미리보기를 확인한 뒤에만 Cloud에 게시한다.[](source:pf-local)[](source:pf-pub)
- `track-findings`는 한 번에 provider 하나와 destination 하나에만 쓰고, 쓰기 전에 payload 미리보기와 승인을 요구한다.[](source:tf-intro)[](source:tf-preview)
- `cloud-findings`는 scan 시작, finding 수정, 결과 업로드를 모두 금지한다.[](source:cf-ro)
- `resolve-dependency-alert`는 평소 읽기 전용이고, 가져오기를 명시적으로 요청받을 때만 `publish-findings`를 쓰라고 한다.[](source:rd-ro)[](source:rd-import)

@answer scope="로컬 스킬 4개 · 원장 관계 13개 · 호스트 도구와 외부 서비스 미확인 · 부분 분석"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source pf-full title="codex-security/publish-findings/SKILL.md · 11118B · 원본" path=codex-security/publish-findings/SKILL.md
@source pf-desc title="codex-security/publish-findings/SKILL.md · 설명" path=codex-security/publish-findings/SKILL.md lines=3:3
@source pf-intro title="codex-security/publish-findings/SKILL.md · 용도" path=codex-security/publish-findings/SKILL.md lines=8:8
@source pf-select title="codex-security/publish-findings/SKILL.md · 증거 선택" path=codex-security/publish-findings/SKILL.md lines=12:14
@source pf-table title="codex-security/publish-findings/SKILL.md · scanner별 수집 표" path=codex-security/publish-findings/SKILL.md lines=16:30
@source pf-cont title="codex-security/publish-findings/SKILL.md · Continuum, attack path" path=codex-security/publish-findings/SKILL.md lines=25:25
@source pf-patch title="codex-security/publish-findings/SKILL.md · Continuum patch 수집" path=codex-security/publish-findings/SKILL.md lines=28:28
@source pf-local title="codex-security/publish-findings/SKILL.md · 로컬 가져오기" path=codex-security/publish-findings/SKILL.md lines=38:38
@source pf-pub title="codex-security/publish-findings/SKILL.md · Cloud 게시" path=codex-security/publish-findings/SKILL.md lines=44:44
@source pf-retry title="codex-security/publish-findings/SKILL.md · 중단 뒤 재개" path=codex-security/publish-findings/SKILL.md lines=46:46
@source pf-yaml title="codex-security/publish-findings/agents/openai.yaml · 284B · 호출 정책" path=codex-security/publish-findings/agents/openai.yaml
@source tf-full title="codex-security/track-findings/SKILL.md · 13459B · 원본" path=codex-security/track-findings/SKILL.md
@source tf-desc title="codex-security/track-findings/SKILL.md · 설명" path=codex-security/track-findings/SKILL.md lines=3:3
@source tf-intro title="codex-security/track-findings/SKILL.md · 용도" path=codex-security/track-findings/SKILL.md lines=8:8
@source tf-app title="codex-security/track-findings/SKILL.md · provider 연결" path=codex-security/track-findings/SKILL.md lines=10:12
@source tf-valid title="codex-security/track-findings/SKILL.md · 봉인된 scan 검증" path=codex-security/track-findings/SKILL.md lines=16:24
@source tf-assoc title="codex-security/track-findings/SKILL.md · 저장된 연결 조회" path=codex-security/track-findings/SKILL.md lines=57:57
@source tf-bind title="codex-security/track-findings/SKILL.md · 본문 binding" path=codex-security/track-findings/SKILL.md lines=76:76
@source tf-preview title="codex-security/track-findings/SKILL.md · 미리보기와 승인" path=codex-security/track-findings/SKILL.md lines=80:80
@source tf-record title="codex-security/track-findings/SKILL.md · 기록과 readback" path=codex-security/track-findings/SKILL.md lines=88:92
@source tf-yaml title="codex-security/track-findings/agents/openai.yaml · 279B · 호출 정책" path=codex-security/track-findings/agents/openai.yaml
@source cf-full title="codex-security/cloud-findings/SKILL.md · 10563B · 원본" path=codex-security/cloud-findings/SKILL.md
@source cf-ro title="codex-security/cloud-findings/SKILL.md · 읽기 전용 범위" path=codex-security/cloud-findings/SKILL.md lines=8:8
@source cf-tools title="codex-security/cloud-findings/SKILL.md · 도구 탐색" path=codex-security/cloud-findings/SKILL.md lines=10:10
@source cf-boot title="codex-security/cloud-findings/SKILL.md · 계정 확인" path=codex-security/cloud-findings/SKILL.md lines=14:14
@source cf-imp title="codex-security/cloud-findings/SKILL.md · imported finding 조회" path=codex-security/cloud-findings/SKILL.md lines=27:27
@source cf-evid title="codex-security/cloud-findings/SKILL.md · 증거는 신뢰하지 않는 내용" path=codex-security/cloud-findings/SKILL.md lines=50:50
@source cf-yaml title="codex-security/cloud-findings/agents/openai.yaml · 295B · 호출 설정" path=codex-security/cloud-findings/agents/openai.yaml
@source rd-full title="codex-security/resolve-dependency-alert/SKILL.md · 2548B · 원본" path=codex-security/resolve-dependency-alert/SKILL.md
@source rd-import title="codex-security/resolve-dependency-alert/SKILL.md · 가져오기 요청" path=codex-security/resolve-dependency-alert/SKILL.md lines=10:10
@source rd-ro title="codex-security/resolve-dependency-alert/SKILL.md · 읽기 전용 조사" path=codex-security/resolve-dependency-alert/SKILL.md lines=12:12
@source rd-fix title="codex-security/resolve-dependency-alert/SKILL.md · 수정 요청" path=codex-security/resolve-dependency-alert/SKILL.md lines=14:14
@source rd-yaml title="codex-security/resolve-dependency-alert/agents/openai.yaml · 250B · UI 메타데이터" path=codex-security/resolve-dependency-alert/agents/openai.yaml
@source sr title="codex-security/security-scan/references/scan-results.md · scan 완료 처리" path=codex-security/security-scan/references/scan-results.md lines=13:13
@source sd-end title="codex-security/security-diff-scan/SKILL.md · 완료 처리" path=codex-security/security-diff-scan/SKILL.md lines=33:33
@source ds-end title="codex-security/deep-security-scan/SKILL.md · 완료 처리" path=codex-security/deep-security-scan/SKILL.md lines=14:14
@source tr-in title="codex-security/triage-finding/SKILL.md · ticket 입력" path=codex-security/triage-finding/SKILL.md lines=18:18
@source ff-patch title="codex-security/fix-finding/SKILL.md · 시작 후보 patch" path=codex-security/fix-finding/SKILL.md lines=38:38
@source ap-cont title="codex-security/attack-path-analysis/SKILL.md · Continuum evidence" path=codex-security/attack-path-analysis/SKILL.md lines=21:21

## 요청에 따라 어느 스킬을 고르나? {#choose}

그림은 저장소와 스킬의 읽기·쓰기 방향이다. `R`로 시작하는 번호가 붙은 간선만 관계 원장의 관계이고, 번호가 없는 간선은 `SKILL.md`가 적은 저장·게시 동작이다. 스킬이 서로를 자동으로 부른다는 뜻이 아니다.[](source:pf-local)[](source:pf-pub)

@architecture id=finding-stores title="finding이 오가는 저장소와 스킬"
| dep | resolve-dependency-alert | backend | source:rd-full |
| publish | publish-findings | backend | source:pf-full |
| wb | local workbench | database | source:pf-local |
| cloud | Codex Security Cloud | cloud | source:pf-pub |
| cloudr | cloud-findings | backend | source:cf-full |
| scan | security-scan (다른 묶음) | backend | source:sr |
| sealed | 봉인된 scan 폴더 | database | source:tf-valid |
| track | track-findings | backend | source:tf-full |
| tracker | Linear, Jira, GitHub | external | source:tf-app |
| dep > publish | 가져오기 요청 시 R35 | dashed |
| publish > wb | 저장 | default |
| publish > cloud | 미리보기 확인 후 게시 | emphasis |
| cloud > cloudr | 읽기 R38 | default |
| cloudr > publish | 업로드 금지 R39 | dashed |
| scan > sealed | 생성 R24 | default |
| sealed > track | 읽기 R24 | default |
| track > tracker | 승인 후 기록 R67 | emphasis |

@steps id=external-steps
| dep-step | resolve-dependency-alert | 취약 의존성을 읽기 전용으로 추적한다. 가져오기를 명시 요청받으면 `publish-findings`로 넘긴다.[](source:rd-ro)[](source:rd-import) | finding-stores | dep |
| publish-step | publish-findings | 외부 scanner 결과를 local workbench에 저장하고, 선택분을 승인 후 Cloud에 게시한다.[](source:pf-intro)[](source:pf-pub) | finding-stores | publish |
| cloud-step | cloud-findings | 연결된 Cloud의 finding, 보고서, scan 상태를 읽기만 한다.[](source:cf-ro) | finding-stores | cloudr |
| track-step | track-findings | 봉인된 scan의 finding을 미리보기와 승인을 거쳐 한 provider에 기록한다.[](source:tf-intro)[](source:tf-preview) | finding-stores | track |

| 요청 | 쓰는 스킬 | 쓰기 여부 |
|---|---|---|
| 외부 scanner 결과를 가져오거나 저장한 결과를 Cloud에 올린다 | `publish-findings` | {caution:승인 후 쓰기}. 가져오기는 `--dry-run`으로 미리 보고 승인되면 `--yes`로 쓴다.[](source:pf-local) |
| 봉인된 scan의 finding을 Linear, Jira, GitHub issue, 초안 advisory에 기록한다 | `track-findings` | {caution:승인 후 쓰기}. 일반 요청은 보지 않은 payload를 승인하지 않는다.[](source:tf-preview) |
| Cloud에 있는 finding, 보고서, 할당, 검증 기록, scan 상태를 본다 | `cloud-findings` | {good:읽기 전용}.[](source:cf-ro) |
| 취약한 의존성이 무엇에 끌려 들어왔는지 추적한다 | `resolve-dependency-alert` | {good:기본은 읽기 전용}. 업그레이드를 요청받을 때만 수정 스킬에 넘긴다.[](source:rd-ro)[](source:rd-fix) |

판정 · `publish-findings`와 `track-findings`는 입력이 다르다. 앞의 것은 외부 scanner 증거를, 뒤의 것은 봉인된 Codex Security scan 하나를 받는다. 그래서 둘은 한 요청 안에서 이어 쓰는 단계가 아니라 별개 선택지로 읽는 편이 원문에 맞다.[](source:pf-intro)[](source:tf-intro)

안내 역할 스킬은 이 묶음에 없다. 스킬 내부의 승인 단계와 수치는 각 스킬 페이지에 있다.

## 어떤 관계로 무엇을 주고받나? {#relations}

| rel-id·종류 | 전달물과 조건 | 그림 반영 |
|---|---|---|
| R24 · 산출물 호환 | `security-scan`이 끝나면 `scan-manifest.json`과 `findings.json`이 생긴다. `track-findings`는 봉인된 scan 하나만 받고 두 파일을 읽는다. 사용자가 요청할 때 따로 호출하며 자동 순서는 없다.[](source:sr)[](source:tf-intro)[](source:tf-valid) | 표시 |
| R25 · 산출물 호환(추론) | `security-diff-scan`은 완료 시 `report.md`와 SARIF가 생긴다고만 적는다. `track-findings`가 받는 sealed scan과 같은 종류인지 이 컬렉션만으로 확정하지 못한다.[](source:sd-end)[](source:tf-intro) | 생략 |
| R26 · 산출물 호환(추론) | `deep-security-scan`은 `report.md`와 "canonical artifacts"를 링크한다고만 적는다. R25와 같은 한계다.[](source:ds-end)[](source:tf-intro) | 생략 |
| R35 · 넘김 | 사용자가 가져오기를 명시적으로 요청할 때만 `resolve-dependency-alert`가 `publish-findings`를 쓴다. 알림을 찾아 달라는 요청은 고른 scanner와 대상에서만 조회한다.[](source:rd-import) | 표시 |
| R36 · 넘김 | AWS Continuum 항목에 한해 선택한 issue의 저장된 `.evidence`와 검증 artifact를 `attack-path-analysis`에 준다. 대상 스킬은 다른 묶음이다.[](source:pf-cont)[](source:ap-cont) | 생략 |
| R37 · 산출물 호환 | Continuum finding 하나를 `--source-root`와 함께 수집하면 patch가 따라온다. `fix-finding`이 그 patch를 시작 후보로 쓰고 현재 checkout과 비교한다. 대상 스킬은 다른 묶음이다.[](source:pf-patch)[](source:ff-patch) | 생략 |
| R38 · 산출물 호환(추론) | `publish-findings`가 Cloud에 올린 finding을 `cloud-findings`가 읽을 수 있다. 두 파일이 서로를 이름으로 지목하지는 않는다.[](source:pf-pub)[](source:cf-imp) | 표시 |
| R39 · 참고 | `cloud-findings`는 결과 업로드를 포함한 쓰기를 금지한다고 적는다. `publish-findings`를 이름으로 지목하지는 않는다.[](source:cf-ro) | 표시(점선) |
| R40 · 산출물 호환(추론) | `track-findings`가 만든 Linear·Jira ticket 본문에 finding id와 fingerprint가 들어간다. `triage-finding`은 보안 Jira·Linear ticket을 입력으로 받는다. 서로를 지목하지 않아 강도가 약하다. 대상 스킬은 다른 묶음이다.[](source:tf-bind)[](source:tr-in) | 생략 |
| R65 · 참고(범위 밖) | `track-findings`는 시작 전에 `scripts/launch_codex_security_mcp --helper validate-tracking-source`를 실행해 봉인된 scan을 검증하라고 하고, 연결 조회·기록에 호스트 도구를 쓴다. 구현은 컬렉션에 없다.[](source:tf-valid)[](source:tf-assoc)[](source:tf-record) | 생략 |
| R66 · 참고(범위 밖) | `cloud-findings`는 `defense_factory_*` 도구를 호출 시점에 tool search로 찾고 노출된 것만 쓴다. 연결되지 않았다.[](source:cf-tools) | 생략 |
| R67 · 참고(범위 밖) | `track-findings`는 Linear, Atlassian(Jira), GitHub app과 `gh` CLI로 issue를 쓰되 미리보기와 승인을 먼저 받는다. 연결하지 않았다.[](source:tf-app)[](source:tf-preview) | 표시 |
| R68 · 참고(범위 밖) | `publish-findings`는 Trivy, Semgrep, Snyk, Checkmarx, Wiz, AWS Continuum 등 scanner별 수집 방법을 표로 안내한다. 외부 CLI와 문서이며 열지 않았다.[](source:pf-table) | 생략 |

관계의 단일 원본은 `relations.md`다. R25와 R26, R38, R40은 원문이 이름으로 잇지 않아 추론으로 분류됐고, 판정 · R38은 `cloud-findings`가 imported scanner finding을 읽는 방법을 적은 점이 뒷받침한다.[](source:cf-imp)

## 어떤 파일과 상태를 공유하나? {#state}

| 파일·상태 | 쓰는 스킬·주체 | 읽는 스킬·조건 |
|---|---|---|
| 봉인된 scan 폴더(`scan-manifest.json`, `findings.json`) | 호스트 workbench나 SDK가 scan 완료 때 봉인한다.[](source:sr) | `track-findings`가 읽고 번들을 바꾸지 않는다. 사용자가 폴더를 준다.[](source:tf-intro)[](source:tf-valid) |
| local workbench의 가져온 외부 finding(import ID, finding version) | `publish-findings`가 승인 후 `--yes`로 저장한다.[](source:pf-local) | `publish-findings`가 게시 단계에서 import ID나 선택한 finding으로 불러온다.[](source:pf-pub) |
| Cloud에 게시된 finding | `publish-findings`가 `group.publish`로 올린다. 사용자가 미리보기를 확인한 뒤에만 한다.[](source:pf-pub) | `cloud-findings`가 읽는다. 쓰기는 하지 않는다.[](source:cf-ro)[](source:cf-imp) |
| 외부 issue tracker의 issue | `track-findings`가 승인된 payload로 쓴다.[](source:tf-preview) | `track-findings`가 중복 검색과 readback으로 읽는다. `triage-finding`이 입력으로 받을 수 있다(R40 추론).[](source:tf-record)[](source:tr-in) |
| finding과 issue의 연결 기록 | `track-findings`가 호스트 도구로 기록한다.[](source:tf-record) | `track-findings`가 중복 확인 때 읽는다. 저장 위치는 원문에 명시 없음.[](source:tf-assoc) |
| Continuum의 `.evidence`와 `patches[].patch` | `publish-findings`가 수집한 결과가 저장된다.[](source:pf-cont)[](source:pf-patch) | `attack-path-analysis`, `fix-finding`이 읽는다(R36, R37).[](source:ap-cont)[](source:ff-patch) |

`resolve-dependency-alert`와 `cloud-findings`가 쓰는 파일은 원문에 명시 없음. 둘 다 읽기 전용으로 적혀 있다.[](source:rd-ro)[](source:cf-ro)

## 어디서 멈추거나 되돌아가나? {#loops}

두 스킬만 반복이나 재개를 적는다. 스킬 사이의 반복은 원문에 명시 없음.

| 스킬 | 반복·재개 | 멈추는 조건 |
|---|---|---|
| `publish-findings` | 중단되면 중단된 그룹과 시작 안 한 그룹을 저장한 review ID로 다시 준비한다.[](source:pf-retry) | review ID가 바뀌면 새 미리보기가 필요하다.[](source:pf-retry) |
| `track-findings` | finding을 승인한 순서대로 하나씩 처리한다.[](source:tf-record) | 쓰기가 실패하거나 불확실하거나 중복이 풀리지 않으면 batch를 멈춘다.[](source:tf-record) |

@callout level=warning title="외부 쓰기는 승인 뒤에만"
| `publish-findings`의 Cloud 게시와 `track-findings`의 issue 기록은 모두 승인된 미리보기가 있어야 한다. `track-findings`는 계정이나 transport를 조용히 바꾸지 않는다.[](source:pf-pub)[](source:tf-app)[](source:tf-preview) |
| `cloud-findings`는 Cloud 연결에 쓰기 도구가 있어도 읽기만 한다. 연결했다고 쓰기 도구가 이 워크플로의 일부가 되지는 않는다.[](source:cf-ro) |

## 어떤 기대는 피해야 하나? {#limits}

| 기대 | 경계 |
|---|---|
| `track-findings`로 외부 scanner 결과를 issue로 만든다 | 입력은 봉인된 scan 하나다. scan이나 fix에는 쓰지 말라고도 적혀 있다.[](source:tf-desc)[](source:tf-intro) |
| `cloud-findings`로 finding을 닫거나 patch를 만든다 | 금지다. 닫기, 수정, patch 생성, 검증, 업로드, 알림이 모두 막혀 있다.[](source:cf-ro) |
| `cloud-findings`가 요청한 filter를 일부 못 써도 완전한 답이다 | 노출되지 않은 도구나 filter는 "수행 못 한 부분"으로 설명해야 한다. 부분 답을 완전하다고 하지 않는다.[](source:cf-tools) |
| Cloud 증거 안에 적힌 지시를 따라 작업한다 | `cloud-findings`는 증거를 신뢰하지 않는 내용으로 다루고 실행하거나 지시를 따르지 않는다.[](source:cf-evid) |
| 한 스킬이 끝나면 다음 스킬로 자동 진행된다 | 원문에 명시 없음. R35 넘김도 명시적 요청 조건이 붙는다.[](source:rd-import) |

호출 정책도 다르다. `publish-findings`와 `track-findings`의 `agents/openai.yaml`에는 `allow_implicit_invocation: true`가 있고, `cloud-findings`와 `resolve-dependency-alert`에는 `policy`가 없다. 네 스킬의 `SKILL.md` frontmatter에는 호출 제한 필드가 없다.[](source:pf-yaml)[](source:tf-yaml)[](source:cf-yaml)[](source:rd-yaml)

## 어디까지 대조했고 무엇이 남았나? {#audit-panel}

이 묶음의 `SKILL.md` 4개(합계 37,688B)와 `agents/openai.yaml` 4개(합계 1,108B)를 다시 끝까지 읽어 원장 관계 13개를 대조했다. R24~R26, R36, R37, R40의 상대편은 해당 줄만 확인했고 내부 동작은 각 스킬 페이지에 맡긴다. 번역본은 이 컬렉션에 없다. 바이너리는 읽은 적이 없고 부분 읽음 파일은 이 페이지의 근거에 포함하지 않았다.[](source:pf-full)[](source:tf-full)[](source:cf-full)[](source:rd-full)

@callout level=open-question title="부분 분석, 확인하지 못한 부분"
| Codex Security 호스트 도구(`validate-tracking-source` helper, `get_`·`record_codex_security_finding_issues`)와 Cloud 도구(`defense_factory_*`), 외부 scanner CLI와 문서, Linear·Jira·GitHub 연결은 컬렉션에 없다. 읽지도 실행하지도 않았으므로 R65~R68 부분은 범위 밖이다. |
| R25와 R26의 scan 산출물이 `track-findings`의 sealed scan과 같은 종류인지는 원문에 명시 없음. 이 컬렉션만으로 확정하지 못했다. |
| 호스트가 `allow_implicit_invocation: true`를 실제로 어떻게 쓰는지 확인하지 못했다. |
| 이 페이지의 판정은 원문 대조까지만 거쳤다. 사람 검토는 미실시다. |

분석 중 원본은 수정하지 않았다.
