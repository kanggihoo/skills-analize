# scanner, Cloud, issue tracker 사이에서 finding은 누가 가져오고 올리고 기록하고 읽나? {#external-findings-page}

네 스킬은 순서로 이어진 파이프라인이 아니라, 입력이 달라서 요청마다 고르는 선택지다. 외부 scanner 결과는 `publish-findings`, 봉인된 scan은 `track-findings`, Cloud 계정의 기록은 `cloud-findings`가 맡는다.[](source:pf-desc)[](source:tf-intro)[](source:cf-ro) 스킬 사이의 명시적 넘김은 하나뿐이다. `resolve-dependency-alert`가 가져오기를 명시적으로 요청받으면 `publish-findings`를 쓰라고 한다(R35).[](source:rd-import) 이 분석은 **부분 분석**이다. Cloud 도구와 issue provider 도구의 정의, SDK 문서가 이 저장소에 없다.

- 외부에 쓰는 스킬은 둘이다. `publish-findings`는 미리보기를 확인한 뒤에만 Cloud에 게시하고, `track-findings`는 승인된 payload만 provider에 쓴다.[](source:pf-pub)[](source:tf-preview)
- `cloud-findings`는 읽기만 한다. 같은 connector에 쓰기 도구가 있어도 이 스킬의 일이 아니다.[](source:cf-ro)
- 이 묶음 안에서 스킬이 다른 스킬로 넘기는 곳은 R35 하나뿐이다. 나머지를 이어 주는 것은 공유 상태다. 봉인된 scan 폴더(R24), local workbench의 두 기록(R89, R84), Cloud 저장소(R38)가 그것이다.
- `publish-findings`와 `track-findings`만 `allow_implicit_invocation: true`를 선언한다.[](source:pf-yaml)[](source:tf-yaml)

@answer scope="원문 분석 · 도구 정의 일부가 트리에 없음 · 부분 분석"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source pf-full title="codex-security/plugins/codex-security/skills/publish-findings/SKILL.md · 11118B · 스킬 본문(원본)" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md
@source pf-desc title="publish-findings/SKILL.md · frontmatter description" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=3:3
@source pf-intent title="publish-findings/SKILL.md · 요청 문구별 시작점" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=8:8
@source pf-select title="publish-findings/SKILL.md · 증거 선택" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=12:14
@source pf-table title="publish-findings/SKILL.md · scanner별 수집 표" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=16:30
@source pf-cont title="publish-findings/SKILL.md · Continuum 행(attack-path 입력)" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=25:25
@source pf-patch title="publish-findings/SKILL.md · Continuum patch 수집" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=28:28
@source pf-local title="publish-findings/SKILL.md · 로컬 가져오기" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=38:38
@source pf-pub title="publish-findings/SKILL.md · Cloud 게시" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=44:44
@source pf-retry title="publish-findings/SKILL.md · 중단 뒤 재개" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=46:46
@source pf-yaml title="publish-findings/agents/openai.yaml · 284B · 호출 정책" path=codex-security/plugins/codex-security/skills/publish-findings/agents/openai.yaml lines=5:6
@source tf-full title="codex-security/plugins/codex-security/skills/track-findings/SKILL.md · 13459B · 스킬 본문(원본)" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md
@source tf-desc title="track-findings/SKILL.md · frontmatter description" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=3:3
@source tf-intro title="track-findings/SKILL.md · 용도와 원칙" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=8:8
@source tf-app title="track-findings/SKILL.md · provider 연결과 gh" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=10:12
@source tf-valid title="track-findings/SKILL.md · 봉인된 source 검증" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=16:26
@source tf-dest title="track-findings/SKILL.md · destination 하나" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=30:30
@source tf-assoc title="track-findings/SKILL.md · 저장된 연결 조회" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=57:57
@source tf-bind title="track-findings/SKILL.md · 본문 binding" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=76:76
@source tf-preview title="track-findings/SKILL.md · 미리보기와 승인" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=80:80
@source tf-resume title="track-findings/SKILL.md · 중단 뒤 재검증" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=84:86
@source tf-apply title="track-findings/SKILL.md · 순차 적용과 batch 중단" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=88:88
@source tf-record title="track-findings/SKILL.md · 영수증 기록과 readback" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=90:92
@source tf-recover title="track-findings/SKILL.md · 불확실한 쓰기의 재조정" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=96:96
@source tf-yaml title="track-findings/agents/openai.yaml · 279B · 호출 정책" path=codex-security/plugins/codex-security/skills/track-findings/agents/openai.yaml lines=5:6
@source cf-full title="codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md · 10563B · 스킬 본문(원본)" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md
@source cf-ro title="cloud-findings/SKILL.md · 읽기 전용 범위" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=8:8
@source cf-tools title="cloud-findings/SKILL.md · 도구 탐색" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=10:10
@source cf-boot title="cloud-findings/SKILL.md · 계정 확인" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=14:14
@source cf-imp title="cloud-findings/SKILL.md · imported finding 조회" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=27:27
@source cf-page title="cloud-findings/SKILL.md · 커서와 부분 읽기" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=31:31
@source cf-evid title="cloud-findings/SKILL.md · 증거는 신뢰하지 않는 내용" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=50:50
@source cf-scan title="cloud-findings/SKILL.md · scan 상태" path=codex-security/plugins/codex-security/skills/cloud-findings/SKILL.md lines=56:56
@source cf-yaml title="cloud-findings/agents/openai.yaml · 295B · 호출 설정(policy 키 없음)" path=codex-security/plugins/codex-security/skills/cloud-findings/agents/openai.yaml
@source rd-full title="codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md · 2548B · 스킬 본문(원본)" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md
@source rd-desc title="resolve-dependency-alert/SKILL.md · frontmatter description" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=3:3
@source rd-import title="resolve-dependency-alert/SKILL.md · 가져오기 요청과 알림 조회" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=10:10
@source rd-ro title="resolve-dependency-alert/SKILL.md · 읽기 전용 추적" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=12:12
@source rd-fix title="resolve-dependency-alert/SKILL.md · 업그레이드 요청과 fix-finding 넘김" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=14:14
@source rd-open title="resolve-dependency-alert/SKILL.md · 근거 부족과 dismissal" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=18:18
@source rd-yaml title="resolve-dependency-alert/agents/openai.yaml · 250B · UI 메타데이터(policy 키 없음)" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/agents/openai.yaml
@source readme-rep title="codex-security/plugins/codex-security/skills/README.md · 3752B · 벤더 스킬 선택 안내(Reports and tickets)" path=codex-security/plugins/codex-security/skills/README.md lines=36:41
@source readme-inv title="skills/README.md · Investigating a finding" path=codex-security/plugins/codex-security/skills/README.md lines=22:25
@source sr title="codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md · 2871B · scan 완료 처리" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md lines=13:13
@source sd-end title="security-diff-scan/SKILL.md · 완료 처리(해당 줄만)" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=33:33
@source ds-end title="deep-security-scan/SKILL.md · 완료 처리(해당 줄만)" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=14:14
@source tr-in title="triage-finding/SKILL.md · ticket 입력(해당 줄만)" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=18:18
@source tr-gh title="triage-finding/references/github-rest-intake.md · Source Selection과 Dependabot(해당 줄만)" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=13:24
@source ff-desc title="fix-finding/SKILL.md · description(해당 줄만)" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=3:3
@source ff-mode title="fix-finding/SKILL.md · Verification Mode(해당 줄만)" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=16:20
@source ff-patch title="fix-finding/SKILL.md · 시작 후보 patch(해당 줄만)" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=38:38
@source ap-cont title="attack-path-analysis/SKILL.md · Continuum evidence(해당 줄만)" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=21:21
@source sc-files title="codex-security/plugins/codex-security/references/scan-contract.md · 16529B · 봉인 계약(표 앞부분과 mode 표만)" path=codex-security/plugins/codex-security/references/scan-contract.md lines=9:14
@source sc-state title="scan-contract.md · 봉인 번들은 상태 DB가 아니다" path=codex-security/plugins/codex-security/references/scan-contract.md lines=22:22
@source sc-status title="scan-contract.md · scan.status와 중단 결과" path=codex-security/plugins/codex-security/references/scan-contract.md lines=32:41
@source sc-mode title="scan-contract.md · scan.mode 표" path=codex-security/plugins/codex-security/references/scan-contract.md lines=122:132
@source mf-status title="codex-security/plugins/codex-security/schemas/scan-manifest.schema.json · 7815B · status enum(해당 줄만)" path=codex-security/plugins/codex-security/schemas/scan-manifest.schema.json lines=20:22
@source sealed-prof title="codex-security/plugins/codex-security/mcp-app/src/sealed-contract.ts · 36923B · tracking profile의 report.md 검사(해당 줄만)" path=codex-security/plugins/codex-security/mcp-app/src/sealed-contract.ts lines=214:215
@source srv-complete title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · complete_codex_security_scan 등록(해당 줄만)" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1567:1573
@source srv-deep title="mcp-app/server.ts · Deep 코디네이터의 complete-scan(해당 줄만)" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=944:960
@source vts title="codex-security/plugins/codex-security/mcp-app/src/helpers/validate-tracking-source.ts · 2744B · 추적용 봉인 검증 helper" path=codex-security/plugins/codex-security/mcp-app/src/helpers/validate-tracking-source.ts
@source fit title="codex-security/plugins/codex-security/mcp-app/src/server/finding-issue-tools.ts · 3683B · issue 조회·기록 도구" path=codex-security/plugins/codex-security/mcp-app/src/server/finding-issue-tools.ts
@source fit-state title="finding-issue-tools.ts · state_unavailable 처리" path=codex-security/plugins/codex-security/mcp-app/src/server/finding-issue-tools.ts lines=62:83
@source wp-store title="codex-security/plugins/codex-security/scripts/workbench_publication.py · 20245B · 로컬 DB가 없을 때(해당 줄만)" path=codex-security/plugins/codex-security/scripts/workbench_publication.py lines=214:225
@source wp-conflict title="workbench_publication.py · 다른 finding에 이미 연결된 issue 거부(해당 줄만)" path=codex-security/plugins/codex-security/scripts/workbench_publication.py lines=250:259
@source wp-upsert title="workbench_publication.py · 영수증 upsert(해당 줄만)" path=codex-security/plugins/codex-security/scripts/workbench_publication.py lines=265:276
@source hm title="codex-security/plugins/codex-security/mcp-app/helpers-main.ts · 8642B · external finding helper 이름과 사용법(해당 줄만)" path=codex-security/plugins/codex-security/mcp-app/helpers-main.ts lines=86:95
@source ef-id title="codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts · 11530B · 외부 finding 저장 단위와 id(해당 줄만)" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts lines=14:70
@source ef-ins title="external-findings.ts · 저장 입력 검증과 id 생성(해당 줄만)" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-findings.ts lines=147:169
@source efp title="codex-security/plugins/codex-security/mcp-app/src/workbench/external-finding-publications.ts · 3624B · 게시 영수증 기록" path=codex-security/plugins/codex-security/mcp-app/src/workbench/external-finding-publications.ts
@source app title="codex-security/plugins/codex-security/.app.json · 717B · connector 선언" path=codex-security/plugins/codex-security/.app.json
@source t-trk title="codex-security/plugins/codex-security/tests/test_track_findings_skill.py · 1944B · connector id 검사(해당 줄만)" path=codex-security/plugins/codex-security/tests/test_track_findings_skill.py lines=15:43
@source t-plug title="codex-security/plugins/codex-security/tests/test_plugin_contract.py · 5265B · Cloud connector 선언 검사(해당 줄만)" path=codex-security/plugins/codex-security/tests/test_plugin_contract.py lines=73:82

## 요청이 어떤 입력이냐에 따라 어느 스킬을 고르나? {#choose}

고르는 기준은 입력이다. 원문의 `description`이 세 입력(외부 scanner 증거, 봉인된 scan, Cloud 계정)을 따로 지정한다.[](source:pf-desc)[](source:tf-desc)[](source:cf-ro) 판정 · 벤더 `README.md`는 세 스킬을 같은 "Reports and tickets" 목록에 놓지만 이는 사용자가 이름을 고르는 목록이고 실행 순서가 아니다.[](source:readme-rep) 이 저장소는 `resolve-dependency-alert`를 다른 목록("Investigating a finding")에 둔다.[](source:readme-inv)

| 요청 | 스킬 | 입력 | 쓰는 곳 | 자동 호출 정책 |
| --- | --- | --- | --- | --- |
| 외부 scanner나 CI 보고서를 가져오거나, 저장한 선택을 Cloud에 올린다 | `publish-findings` | scanner, CI report, vendor CLI, API, 연결된 도구의 finding[](source:pf-desc) | local workbench. Cloud는 {caution:미리보기 확인 뒤에만}.[](source:pf-local)[](source:pf-pub) | `allow_implicit_invocation: true`[](source:pf-yaml) |
| 봉인된 scan의 finding을 Linear, Jira, GitHub issue, 초안 advisory에 기록한다 | `track-findings` | 봉인된 scan 하나. 사용자가 폴더를 준다.[](source:tf-intro)[](source:tf-valid) | provider 한 곳, destination 한 곳. {caution:승인된 payload만}.[](source:tf-dest)[](source:tf-preview) | `allow_implicit_invocation: true`[](source:tf-yaml) |
| Cloud에 있는 finding, 보고서, 할당, 검증 기록, scan 상태를 본다 | `cloud-findings` | 연결된 Cloud 계정[](source:cf-boot) | {good:쓰지 않는다}. 업로드, 수정, 알림 모두 금지.[](source:cf-ro) | `policy` 키 없음[](source:cf-yaml) |
| 취약한 의존성이 무엇에 끌려 들어왔는지 추적한다 | `resolve-dependency-alert` | scanner 알림, advisory, SBOM 일치[](source:rd-desc) | {good:기본은 읽기 전용}. 업그레이드를 요청받을 때만 수정 스킬에 넘긴다.[](source:rd-ro)[](source:rd-fix) | `policy` 키 없음[](source:rd-yaml) |

네 스킬의 `SKILL.md` frontmatter에는 `name`과 `description`만 있고 호출 제한 필드는 없다.[](source:pf-desc)[](source:tf-desc)[](source:rd-desc) `allow_implicit_invocation`을 호스트가 어떻게 처리하는지는 원문에 명시 없음.

## 누가 무엇을 쓰고 누가 읽나? {#state-diagram}

그림은 읽기·쓰기 방향이고 스킬이 서로를 자동으로 부른다는 뜻이 아니다. 간선 번호는 관계 원장의 rel-id이고, 번호 없는 간선(`publish-findings`의 Cloud 게시)은 `SKILL.md`가 적은 동작이다.[](source:pf-pub)

- 점선은 R68(수집 방법을 안내할 뿐인 외부 scanner)과 R39(이름 지목 없는 참고)다.
- `scan 스킬`은 다른 묶음(`security-scan` 등)이다. 간선의 의미는 아래 관계 표에 있다.
- 외부 scanner CLI, Cloud 도구(R66), issue provider 도구(R67)의 정의는 이 트리에 없다.

@architecture id=finding-stores title="finding이 오가는 저장소와 스킬"
| scanner | 외부 scanner | external | source:pf-table |
| dep | resolve-dependency-alert | backend | source:rd-full |
| pub | publish-findings | backend | source:pf-full |
| wb | local workbench | database | source:wp-store |
| cloud | Codex Security Cloud | cloud | source:cf-tools |
| cf | cloud-findings | backend | source:cf-full |
| scan | scan 스킬 | backend | source:sr |
| sealed | 봉인된 scan | database | source:sc-files |
| trk | track-findings | backend | source:tf-full |
| tracker | Linear, Jira, GitHub | external | source:tf-app |
| scanner > pub | R68 | dashed |
| dep > pub | R35 | default |
| pub > wb | R89 | default |
| pub > cloud | 게시 | emphasis |
| cloud > cf | R38 | default |
| cf > pub | R39 | dashed |
| scan > sealed | R24 | default |
| sealed > trk | R24 | default |
| trk > wb | R84 | default |
| trk > tracker | R67 | emphasis |

@steps id=external-steps
| dep-step | resolve-dependency-alert | 취약 의존성을 읽기 전용으로 추적하고, 가져오기를 명시적으로 요청받을 때만 `publish-findings`를 쓴다.[](source:rd-ro)[](source:rd-import) | finding-stores | dep |
| pub-step | publish-findings | 외부 scanner 결과를 local workbench에 저장하고, 선택분을 미리보기 확인 뒤 Cloud에 게시한다.[](source:pf-local)[](source:pf-pub) | finding-stores | pub |
| cf-step | cloud-findings | 연결된 Cloud의 finding, 보고서, 할당, 검증 기록, scan 상태를 읽기만 한다.[](source:cf-ro) | finding-stores | cf |
| trk-step | track-findings | 봉인된 scan의 finding을 미리보기와 승인을 거쳐 provider 한 곳에 쓰고 영수증을 남긴다.[](source:tf-preview)[](source:tf-record) | finding-stores | trk |

## 어떤 관계로 무엇을 주고받고, 그림에서 무엇을 뺐나? {#relations}

관계의 단일 원본은 `codex-security/relations.md`다. 아래 rel-id는 그 원장의 번호이고 종류와 조건은 원장과 같다. "생략"은 다른 묶음으로 가는 관계이거나 범위 밖이라 그림에서 뺐다는 뜻이다.

| rel-id · 종류 | 조건과 전달물 | 그림 |
| --- | --- | --- |
| R24 · 산출물 호환 (명시-역할) | `security-scan`이 끝나면 `scan-manifest.json`과 `findings.json`이 생긴다. `track-findings`는 봉인된 scan 하나만 받아 이 두 파일을 읽는다. 사용자가 요청할 때 따로 호출하며 자동 순서는 없다. 봉인은 호스트 workbench나 SDK가 한다. preflight helper가 봉인과 digest를 검증하고 `report.md`가 있는지도 확인한다.[](source:sr)[](source:tf-intro)[](source:tf-valid)[](source:sc-files)[](source:sealed-prof) | 표시 |
| R25 · 산출물 호환 (명시-역할) | `security-diff-scan`은 `complete_codex_security_scan`을 한 번 불러 봉인하고 `report.md`를 만든다. 봉인 계약의 `scan.mode` 표가 `diff`, `commit`, `branch_diff`, `working_tree`를 같은 계약으로 나열하므로 같은 종류의 sealed scan이다. 다만 `failed`, `canceled`, `interrupted` bundle을 `track-findings`가 거부하는지는 확정하지 못했다. 거부 검사 코드를 찾지 못했을 뿐이다. 계약은 중단된 bundle을 부분 결과로 보고 finding 부재를 결론으로 쓰지 말라고 한다. `track-findings` 본문에는 중단된 scan 문장이 원문에 명시 없음.[](source:sd-end)[](source:sc-mode)[](source:sc-status)[](source:mf-status)[](source:srv-complete) | 생략 (표) |
| R26 · 산출물 호환 (명시-역할) | `deep-security-scan`은 완료 시 `report.md`와 canonical artifacts를 링크한다. Deep 코디네이터는 성공한 run에서 workbench `complete-scan`으로 부모 scan을 직접 봉인하고(SDK 소유 scan은 SDK가 봉인), `scan.mode`는 `deep_repository`다. 같은 계약이라 같은 종류의 sealed scan이다. 중단 상태 bundle 거부 여부는 R25와 같이 미확정이다.[](source:ds-end)[](source:srv-deep)[](source:sc-mode) | 생략 (표) |
| R35 · 넘김 (명시-이름) | 사용자가 가져오기를 명시적으로 요청할 때만 `resolve-dependency-alert`가 `publish-findings`를 쓴다. 알림을 찾아 달라는 요청은 고른 scanner와 대상에서만 조회한다. 전달물은 scanner 알림 보고서다.[](source:rd-import) | 표시 |
| R38 · 산출물 호환 (추론) | `publish-findings`가 Cloud에 올린 finding을 `cloud-findings`가 읽을 수 있다. `cloud-findings`는 imported scanner finding을 읽는 방법(`api_version` `v2`, `source`, `provider`)을 적는다. 두 파일이 서로를 이름으로 지목하지는 않는다.[](source:pf-pub)[](source:cf-imp) | 표시 |
| R39 · 참고 (명시-역할) | `cloud-findings`는 읽기만 하며 "upload results"를 금지한다. 업로드는 `publish-findings`의 일이지만 이름으로 지목하지는 않는다.[](source:cf-ro)[](source:pf-desc) | 표시 (점선) |
| R66 · 참고 (명시-이름, 범위 밖) | `cloud-findings`는 `defense_factory_*` 도구를 호출 시점에 tool search로 찾고 노출된 것만 쓴다. 쓰기 도구도 같은 connector에 있지만 읽기만 한다. 도구 정의는 이 트리에 없고 connector는 `.app.json`에 `required: false`로 선언만 돼 있다.[](source:cf-tools)[](source:cf-ro)[](source:app)[](source:t-plug) | 노드에 표시 |
| R67 · 참고 (명시-이름, 범위 밖) | `track-findings`는 Linear, Atlassian(Jira), GitHub app과 `gh` CLI로 issue를 쓴다. 기록 전에 미리보기와 승인을 받고 계정이나 transport를 조용히 바꾸지 않는다. provider 쪽 도구의 동작은 이 트리에 없다.[](source:tf-app)[](source:tf-preview) | 노드에 표시 |
| R68 · 참고 (명시-이름, 범위 밖) | `publish-findings`는 Trivy, Semgrep, Snyk, Checkmarx, Wiz, AWS Continuum 등 scanner별 수집 방법을 표로 안내한다. 가져오기는 `--dry-run`으로 먼저 보고, 쓰기는 승인 후 `--yes`로 한다. Cloud 게시는 미리보기를 확인한 뒤에만 한다. 외부 CLI와 SDK 문서는 이 트리에 없다.[](source:pf-table)[](source:pf-local)[](source:pf-pub) | 노드에 표시 |
| R84 · 참고 (명시-이름) | `track-findings`는 provider 호출 전에 helper `validate-tracking-source`를 돌리고, 실패하면 멈춘다. 중복 확인에는 `get_codex_security_finding_issues`로 저장된 연결을 읽되 provider에서 다시 확인한다. 쓰기가 받아들여지면 즉시 `record_codex_security_finding_issues`로 영수증을 기록한다. 기록이 실패해도 다른 create는 허가되지 않는다. 영수증은 공유 로컬 issue 이력에 쌓인다.[](source:tf-valid)[](source:tf-assoc)[](source:tf-record)[](source:fit)[](source:vts) | 표시 |
| R88 · 참고 (명시-이름) | `.app.json`은 connector 4개(`codex-security-cloud`, `linear`, `github`, `atlassian`)를 모두 `required: false`로 선언하고 Atlassian만 `capabilities: ["read", "write"]`를 단다. 테스트가 스킬 아래 `.md`의 `app://` id가 선언돼 있는지 확인한다. connector가 노출하는 도구의 동작은 범위 밖이다.[](source:app)[](source:t-trk)[](source:tf-app) | 생략 (표) |
| R89 · 참고 (추론) | `publish-findings`는 가져오기마다 import ID와 finding version을 남기라고 한다. 플러그인에는 저장소 구현이 있다. 저장 단위는 repository, provider, source key, source finding id, evidence다. 다만 `SKILL.md`가 helper 이름을 지목하지 않고 호출 주체(SDK, CLI)는 이 트리 밖이라 누가 helper를 부르는지는 확인하지 못했다.[](source:pf-local)[](source:hm)[](source:ef-id)[](source:efp) | 표시 |
| R36 · 넘김 (명시-이름) | AWS Continuum 항목에 한해 `publish-findings`가 선택한 issue의 저장된 `.evidence`(검증 artifact 포함)를 `attack-path-analysis`에 주라고 한다. 대상 스킬은 다른 묶음이다. 받는 쪽은 Continuum의 `source_data.evidence_artifacts`를 읽는 규칙을 따로 갖는다.[](source:pf-cont)[](source:ap-cont) | 생략 (다른 묶음) |
| R37 · 산출물 호환 (명시-역할) | Continuum finding 하나를 `--source-root`와 함께 수집하면 patch가 따라온다. `fix-finding`은 그 `patches[].patch`를 시작 후보로 쓰고 현재 checkout과 hunk를 비교해 유지하거나 고친다. 대상 스킬은 다른 묶음이다.[](source:pf-patch)[](source:ff-patch) | 생략 (다른 묶음) |
| R28 · 넘김 (명시-이름) | `resolve-dependency-alert`는 사용자가 업그레이드를 요청할 때만 근거와 변경안을 선택된 verification mode로 `fix-finding`에 넘기고 전후 해석 결과를 비교한다. 그 전까지는 읽기 전용이다. 1단계의 package manager 금지가 3단계 위임에도 이어지는지는 원문에 명시 없음. 대상 스킬은 다른 묶음이다.[](source:rd-ro)[](source:rd-fix)[](source:ff-mode) | 생략 (다른 묶음) |
| R33 · 참고 (명시-이름) | Dependabot 알림은 `triage-finding`의 GitHub intake workflow 절을 따른다. 사용자가 source를 고르지 않으면 GitHub를 조회하지 않고 먼저 묻는다. 대상 스킬은 다른 묶음이다.[](source:rd-import)[](source:tr-gh) | 생략 (다른 묶음) |
| R40 · 산출물 호환 (추론) | `track-findings`가 만든 Linear, Jira, GitHub issue 본문에는 finding id와 fingerprint 묶음이 들어간다. `triage-finding`은 보안 Jira·Linear ticket을 입력으로 받는다. 서로를 지목하지 않아 강도가 약하다. 대상 스킬은 다른 묶음이다.[](source:tf-bind)[](source:tr-in) | 생략 (다른 묶음) |

## 어떤 파일과 상태를 함께 쓰나? {#state}

이 묶음에는 선후 관계 없이 같은 저장소를 읽고 쓰는 곳이 다섯이다. 봉인된 scan은 읽기 전용 입력이고, 바뀌는 상태는 local workbench와 외부 서비스에 쌓인다. 봉인 계약도 번들이 불변 관찰만 기록하고 외부 링크 같은 가변 주석은 소비자가 따로 저장하라고 한다.[](source:sc-state)

| 파일·상태 | 쓰는 스킬·주체 | 읽는 스킬·조건 |
| --- | --- | --- |
| 봉인된 scan 폴더(`scan-manifest.json`, `findings.json`, `report.md`) | scan 스킬이 끝낼 때 호스트 workbench나 SDK가 봉인한다(R24~R26).[](source:sr)[](source:sd-end)[](source:ds-end) | `track-findings`가 읽고 번들은 바꾸지 않는다. 봉인과 digest 검증이 먼저다.[](source:tf-intro)[](source:tf-valid) |
| local workbench의 외부 finding 저장소(가져온 finding, import ID, finding version) | `publish-findings`가 `--yes`로 승인된 가져오기를 저장한다. helper는 `store-external-findings`다(R89, 호출 주체는 미확인).[](source:pf-local)[](source:hm) | `publish-findings`가 게시 단계에서 import ID나 선택한 finding ID와 version으로 불러온다.[](source:pf-pub)[](source:hm) |
| local workbench의 게시 영수증(outcome `created`, `updated`, `unchanged`, `private_job`) | helper `record-external-finding-publications`가 기록한다. `SKILL.md`가 이 helper 이름을 지목하는지는 원문에 명시 없음.[](source:efp)[](source:hm) | helper `list-external-finding-publications`가 읽는다. 읽는 스킬은 원문에 명시 없음.[](source:efp) |
| Cloud에 게시된 finding | `publish-findings`가 `group.publish`로 올린다. 사용자가 미리보기를 확인한 뒤에만.[](source:pf-pub) | `cloud-findings`가 읽는다(R38 추론). imported finding을 보려면 `api_version`을 `v2`로 고른다.[](source:cf-imp) |
| 로컬 issue 이력(finding과 issue의 영수증) | `track-findings`가 provider 쓰기가 받아들여진 직후 기록한다. 같은 destination에서 다른 finding에 이미 연결된 issue 식별자는 거부된다.[](source:tf-record)[](source:wp-conflict) | `track-findings`가 중복 확인 때 읽는다. 저장된 연결은 중복 후보일 뿐 provider에서 다시 확인해야 한다.[](source:tf-assoc)[](source:fit) |
| 외부 issue tracker의 issue | `track-findings`가 승인된 payload로 쓴다.[](source:tf-preview) | `track-findings`가 중복 검색과 readback에서 읽는다. `triage-finding`이 ticket 입력으로 읽을 수 있다(R40 추론).[](source:tf-apply)[](source:tr-in) |

`resolve-dependency-alert`와 `cloud-findings`가 쓰는 파일은 원문에 명시 없음. 둘 다 읽기 전용으로 적혀 있다.[](source:rd-ro)[](source:cf-ro)

판정 · 같은 영수증을 다시 기록하면 `url`은 먼저 저장된 값을 유지하고 `readback`은 새 값이 있을 때만 바뀐다. 그래서 `track-findings`가 readback 결과를 같은 영수증에 다시 기록해도 issue 연결이 새로 생기지 않는다.[](source:tf-record)[](source:wp-upsert)

## 어디서 멈추거나 되돌아가나? {#loops}

스킬 사이의 반복이나 되돌아감은 원문에 명시 없음. 반복과 재개는 스킬 안에서만 적혀 있다.

| 스킬 | 반복·재개 | 멈추는 조건 |
| --- | --- | --- |
| `publish-findings` | 중단되면 중단된 그룹과 시작하지 않은 그룹을 저장해 둔 review ID로 다시 준비한다. 부분 가져오기는 종료 코드 1이므로 저장된 finding을 확인하고 제외 항목을 보고한 뒤 다시 시도한다.[](source:pf-retry)[](source:pf-local) | review ID가 바뀌면 새 미리보기가 필요하다.[](source:pf-retry) |
| `track-findings` | finding을 승인한 순서대로 하나씩 처리한다. 승인 대기나 중단 뒤에는 봉인 검증, 원본 링크, 계정과 destination을 다시 확인한다.[](source:tf-apply)[](source:tf-resume) | 쓰기가 실패하거나 불확실하거나 중복이 풀리지 않으면 batch를 멈춘다. 로컬 기록이 실패해도 멈춘다.[](source:tf-apply)[](source:tf-record) |
| `cloud-findings` | 완전한 목록이나 개수를 요청받으면 cursor를 끝까지 따라간다. filter가 바뀌면 cursor를 되돌린다.[](source:cf-page) | 접근이 막혔거나 인증이 없으면 데이터 호출을 멈춘다.[](source:cf-boot) |
| `resolve-dependency-alert` | 반복은 원문에 명시 없음.[](source:rd-ro) | 근거가 모자라면 alert를 열어 둔다.[](source:rd-open) |

@callout level=warning title="외부 쓰기는 승인된 미리보기 뒤에만"
| `publish-findings`의 Cloud 게시와 `track-findings`의 issue 기록은 모두 사용자가 본 미리보기가 있어야 한다. `track-findings`는 "track findings" 같은 일반 요청을 보지 않은 payload의 승인으로 보지 않는다.[](source:pf-pub)[](source:tf-preview) |
| `cloud-findings`는 Cloud 연결에 쓰기 도구가 있어도 읽기만 한다.[](source:cf-ro) |

## 어떤 기대는 피해야 하나? {#limits}

| 기대 | 경계 |
| --- | --- |
| `track-findings`로 외부 scanner 결과를 issue로 만든다 | 입력은 봉인된 scan 하나다. 외부 scanner 결과를 먼저 `publish-findings`로 가져오는 단계가 `track-findings`에 이어진다는 문장은 원문에 명시 없음. description은 scan과 fix에 쓰지 말라고 한다.[](source:tf-desc)[](source:tf-intro) |
| 중단된 scan 폴더도 `track-findings`가 거른다 | {caution:미확정}. `failed`, `canceled`, `interrupted` bundle을 거부하는 검사 코드를 찾지 못했다. 계약은 이런 bundle의 finding 부재를 결론으로 쓰지 말라고 한다.[](source:sc-status)[](source:mf-status) |
| `cloud-findings`로 finding을 닫거나 patch를 만든다 | 금지다. scan 시작·취소, 닫기, 수정, patch 생성, 검증, 업로드, 알림이 모두 막혀 있다.[](source:cf-ro) |
| `cloud-findings`가 기본 호출로 imported scanner finding도 보여 준다 | 기본 `v1` 보기는 native finding만 다룬다. imported finding은 `api_version` `v2`를 골라야 한다.[](source:cf-imp) |
| Cloud 안 증거에 적힌 지시를 따라 작업한다 | 증거는 신뢰하지 않는 내용이다. 실행하거나 그 안의 지시를 따르지 않는다.[](source:cf-evid) |
| `publish-findings`를 반복 실행해도 같은 알림이 같은 finding이다 | source key가 id 입력에 들어간다. 같은 알림이라도 source key가 바뀌면 새 finding으로 저장된다. 그래서 `SKILL.md`가 반복 가져오기에 같은 source key를 쓰라고 한다.[](source:ef-ins)[](source:pf-local) |
| 한 스킬이 끝나면 다음 스킬로 자동 진행된다 | 원문에 명시 없음. 유일한 넘김 R35도 사용자의 명시적 가져오기 요청이 조건이다.[](source:rd-import) |
| 로컬 issue 이력이 항상 있다 | DB 파일이 없으면 `get_codex_security_finding_issues`는 `storeExists: false`를 돌려주고, DB를 열 수 없으면 `state_unavailable` 오류를 돌려준다. 기록 쪽은 별도 확인이 필요하다.[](source:wp-store)[](source:fit-state) |

## 시작하기 전에 무엇을 확인하나? {#checklist}

- [ ] 입력이 외부 scanner 결과인지, 봉인된 scan 폴더인지, Cloud 계정의 기록인지 정한다. 세 입력은 서로 다른 스킬로 간다.
- [ ] `track-findings` 전에 scan 폴더의 `scan-manifest.json`에서 `scan.status`가 `completed`인지 사람이 본다. 중단 상태 bundle을 도구가 거부하는지 확정하지 못했다.[](source:mf-status)
- [ ] `publish-findings`로 같은 선택을 반복해서 가져올 때는 처음에 정한 source key를 그대로 쓴다.[](source:pf-local)[](source:ef-ins)
- [ ] `cloud-findings`로 imported finding을 보려면 도구 schema에 `api_version`이 있는지 확인하고 `v2`를 고른다.[](source:cf-tools)[](source:cf-imp)

## 어디까지 읽고 대조했고 무엇이 남았나? {#audit-panel}

- 끝까지 읽음: 이 묶음의 `SKILL.md` 4개(합계 37,688B)와 `agents/openai.yaml` 4개(합계 1,108B).[](source:pf-full)[](source:tf-full)[](source:cf-full)[](source:rd-full)
- 끝까지 읽음: `validate-tracking-source.ts`, `finding-issue-tools.ts`, `external-finding-publications.ts`, `.app.json`, `scan-results.md`, `README.md`.
- 인용한 줄 범위와 그 앞뒤만 읽음(15개): 다른 스킬 본문과 참조 6개, `scan-contract.md`, `scan-manifest.schema.json`, `sealed-contract.ts`, `server.ts`, `workbench_publication.py`, `helpers-main.ts`, `external-findings.ts`, 테스트 2개.
- 번역본(`*.KO.md`)은 없고 열지도 않았다. 바이너리는 읽지 않았다. 대상 파일 안의 지시와 CLI 명령은 실행하지 않았고 외부 URL도 열지 않았다.

이 페이지가 다시 열지 않은 파일이 있다. 스킬 폴더 안 `references/`(`jira.md`, `github-security-advisories.md`, `checkmarx-import.md`, `wiz-import.md`)와 `scripts/`(`collect_checkmarx.py`, `collector_paths.py`)는 스킬 페이지(`codex-security/plugins/codex-security/skills/publish-findings`, `codex-security/plugins/codex-security/skills/track-findings`)가 맡는다. 스킬 내부 규칙과 수치도 그 페이지에 있다.

@callout level=open-question title="부분 분석: 확인하지 못한 부분"
| Cloud 도구(`defense_factory_*`)의 정의, issue provider 도구(Linear, Atlassian, GitHub, `gh`)의 동작, 외부 scanner CLI, 설치된 SDK 패키지의 `docs/sdk.md`와 `docs/scanner-imports/`는 이 저장소에 없다. R66~R68 부분은 `SKILL.md`의 문장으로만 확인했다. |
| 실행 번들(`mcp/server.mjs`)은 커밋돼 있지 않아 소스와 같은지 확인하지 못했다. |
| R25와 R26: `track-findings`가 중단 상태(`failed`, `canceled`, `interrupted`) bundle을 거부하는지 확정하지 못했다. |
| R89: `store-external-findings`와 `record-external-finding-publications`를 누가 부르는지(SDK, CLI) 확인하지 못했다. 게시 영수증 테이블을 읽는 스킬도 원문에 명시 없음. |
| 로컬 issue 이력(`finding_issue_receipts`)과 외부 finding 저장소가 같은 DB 파일인지 확인하지 못했다. 둘 다 local workbench 쪽 상태로 적었을 뿐이다. |
| `allow_implicit_invocation: true`를 호스트가 실제로 어떻게 쓰는지 확인하지 못했다. |
| 이 페이지의 판정은 원문 대조까지만 거쳤다. 사람 검토는 미실시다. |

분석 중 원본은 수정하지 않았다.
