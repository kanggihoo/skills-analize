# publish-findings — 외부 scanner 결과를 local workbench에 저장하고 Cloud에 게시한다 {#overview}

publish-findings는 외부 scanner의 finding을 가져와 local workbench(호스트가 scan 상태를 기록하는 도구)에 저장하고, 고른 것만 Codex Security Cloud에 게시하게 하는 스킬이다.[](source:fm)

- 요청 말투에 따라 세 모드로 갈린다. "import"는 수집과 로컬 저장까지, "publish"는 로컬 workbench에서 시작, "import and publish"는 import가 돌려준 선택분을 게시한다.[](source:intro)
- 결과로 import ID와 finding version이 남는다. Cloud에 올렸다면 그룹마다 게시 영수증(receipt)이 남는다.[](source:loc)[](source:cl2)
- 관계: `resolve-dependency-alert`가 import 요청 때 이 스킬을 안내하고(다음 안내), 이 스킬은 Continuum 항목을 `attack-path-analysis`로 안내하며 patch를 `fix-finding`에 넘긴다.
- 하지 않는 것: 자격 증명을 명령 인자나 가져온 근거에 넣지 않는다. CrowdStrike `fcs`가 없으면 설치하지 않는다.[](source:pick)[](source:acq)

@answer scope="codex-security/plugins/codex-security/skills/publish-findings · 원본 파일 6개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source fm title="frontmatter: name과 description" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=1:4
@source intro title="세 모드와 SDK 문서" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=8:8
@source pick title="근거 선택과 접근 확인" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=10:14
@source acq title="scanner별 수집 방법 표" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=16:30
@source sonar title="SonarQube Cloud 수집" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=32:34
@source loc title="로컬 import: dry-run과 승인" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=38:38
@source unf title="모르는 형식은 parser를 쓴다" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=40:40
@source cl title="Cloud 게시 준비와 확인" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=44:44
@source cl2 title="그룹별 게시와 재시도" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=46:46
@source yaml title="agents/openai.yaml: 표시 이름과 호출 정책" path=codex-security/plugins/codex-security/skills/publish-findings/agents/openai.yaml lines=1:7
@source cont title="AWS Continuum 항목" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=25:28
@source crow title="CrowdStrike FCS 항목" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=29:29
@source cm-pre title="Checkmarx: 실행 전 준비" path=codex-security/plugins/codex-security/skills/publish-findings/references/checkmarx-import.md lines=5:10
@source cm-sast title="CxSAST: 소유권 확인과 CxFlow" path=codex-security/plugins/codex-security/skills/publish-findings/references/checkmarx-import.md lines=24:26
@source cm-imp title="Checkmarx: 미리보기와 import" path=codex-security/plugins/codex-security/skills/publish-findings/references/checkmarx-import.md lines=35:37
@source wz-prof title="Wiz: 입력 형식과 occurrence ID" path=codex-security/plugins/codex-security/skills/publish-findings/references/wiz-import.md lines=5:7
@source wz-fam title="Wiz: SAST·secret·IaC 컬렉션" path=codex-security/plugins/codex-security/skills/publish-findings/references/wiz-import.md lines=21:31
@source py-inst title="collector: 설치된 도구만 허용" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py lines=23:30
@source py-ver title="collector: CxFlow 버전 검사" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py lines=61:82
@source py-run title="collector: 보고서 수집과 검증" path=codex-security/plugins/codex-security/skills/publish-findings/scripts/collect_checkmarx.py lines=233:300
@source rda title="resolve-dependency-alert의 import 안내" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=10:10

## 어떻게 동작하나 {#flow span=12}

절차형이다. 그림은 한 번의 import와 게시를 그렸다. 실제로는 scanner마다 수집 방법이 다르고, 게시는 그룹마다 따로 확인과 실행을 거친다.[](source:acq)[](source:cl)

그림에서 승인이 없을 때와 게시 확인이 없을 때의 경로는 원문에 없어 그리지 않았다. 원문은 승인 없이 쓰거나 게시하라고 하지 않는다.[](source:loc)[](source:cl)

@workflow id=flow-diagram title="publish-findings 흐름"
| lane select | 근거 고르기 |
| lane local | 로컬 저장 |
| lane cloud | Cloud 게시 |
| pick | 근거 선택 | backend | select | source:pick |
| get | scanner 수집 | external | select | source:acq |
| dry | 로컬 미리보기 | backend | local | source:loc |
| ok | 승인? | backend | local | source:loc |
| store | 로컬 저장 | database | local | source:loc |
| want | 게시도 요청? | backend | cloud | source:intro |
| prep | 게시 미리보기 | backend | cloud | source:cl |
| ok2 | 사용자 확인? | backend | cloud | source:cl |
| pub | 그룹별 게시 | cloud | cloud | source:cl2 |
| pick > get | |
| get > dry | |
| dry > ok | |
| ok > store | 승인 |
| store > want | |
| want > prep | 예 |
| prep > ok2 | |
| ok2 > pub | 확인 | emphasis |

@steps id=flow-steps
| s-pick | 근거 선택 | **입력** 사용자 요청(새 scan, 이전 scan·CI 산출물, upstream issue, workbench 기존 기록) · **참조** `docs/sdk.md`(설치된 `@openai/codex-security` 패키지 안) · **출력** 저장소·project·ref·product·filter·finding ID 선택. **처리** 에이전트가 어느 근거인지 가르고 선택 조건을 끝까지 들고 간다.[](source:pick)[](source:intro) **다음** 선택이 증거로 정해지지 않을 때만 계정이나 저장소를 묻는다.[](source:pick) | flow-diagram | pick |
| s-get | scanner 수집 | **입력** 선택한 scanner와 대상 · **참조** `references/checkmarx-import.md`, `references/wiz-import.md` · **실행** 표의 명령(예: `trivy fs --scanners vuln --format json --output REPORT.json .`) · **출력** scanner 보고서 또는 capture. **처리** 새 scan은 실행 파일을 찾아 돌리고, 호스팅된 선택은 CLI나 읽기 API로 가져온다. 접근은 범위를 좁힌 읽기로 확인한다.[](source:pick)[](source:acq) **다음** 이전 결과가 같은 범위에서 완전하면 다시 쓴다. 페이지를 끝까지 따라가고 빠진 ID는 설명한다.[](source:pick) | flow-diagram | get |
| s-dry | 로컬 미리보기 | **입력** 보고서·provider·source key · **실행** `codex-security publish findings REPORT.json --to local --provider trivy --source-key PROJECT/BRANCH --repository CHECKOUT --trivy-scan-root . --dry-run --format json` · **출력** 저장소, 근거, 제외 항목, scanner 오류 미리보기. **처리** source key는 같은 선택을 반복 가져와도 같은 값으로 쓴다. 에이전트가 미리보기를 검토한다.[](source:loc) **다음** 모르는 형식이면 실제 행을 보고 parser를 쓴다. 모든 행은 근거나 번호 붙은 제외로 설명한다.[](source:unf) | flow-diagram | dry |
| s-ok | 승인? | **입력** 미리보기 · **출력** 쓰기 승인 여부. **처리** 사용자가 승인한 요청에서만 `--dry-run`을 빼고 `--yes`를 붙인다.[](source:loc) **다음** 승인되지 않았을 때의 경로는 원문에 명시 없음. | flow-diagram | ok |
| s-store | 로컬 저장 | **입력** 승인된 선택 · **실행** `codex-security publish findings ... --yes` · **출력** import ID, finding version, 저장된 finding. **처리** 결과의 import ID와 version을 보관한다.[](source:loc) **다음** 부분 import는 종료 코드 1로 끝난다. 저장된 finding을 확인하고 제외를 보고한 뒤 다시 시도한다.[](source:loc) | flow-diagram | store |
| s-want | 게시도 요청? | **입력** 사용자 요청 말투 · **출력** 로컬까지만 할지, Cloud까지 할지. **처리** "import"만 요청했으면 저장에서 끝나고, "publish"나 "import and publish"면 게시로 간다.[](source:intro) | flow-diagram | want |
| s-prep | 게시 미리보기 | **입력** import ID 또는 finding ID와 version · **참조** `listLocalExternalImports`, `prepareStoredFindingsPublication` · **출력** 계정, 목적지, 근거, 제외 항목 미리보기와 그룹별 review ID. **처리** 타임스탬프로 import를 찾고 저장된 선택으로 게시를 준비한다.[](source:cl) | flow-diagram | prep |
| s-ok2 | 사용자 확인? | **입력** 미리보기 · **출력** 그룹별 승인. **처리** 사용자가 확인한 뒤에만 승인된 그룹을 게시한다.[](source:cl) | flow-diagram | ok2 |
| s-pub | 그룹별 게시 | **입력** 승인된 그룹과 review ID · **실행** `group.publish(group.reviewId)` · **출력** 그룹별 receipt. **처리** 승인된 그룹마다 한 번씩 게시하고 선택, 목적지, review ID를 보관한다.[](source:cl)[](source:cl2) **다음** 중단되면 중단된 그룹과 시작 안 한 그룹을 저장한 review ID로 다시 준비한다. review ID가 바뀌면 새 미리보기가 필요하다.[](source:cl2) | flow-diagram | pub |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(description)과 사용자 요청. `openai.yaml`의 `allow_implicit_invocation`이 `true`라 명시 호출 없이도 켤 수 있다. 기본 prompt는 `$publish-findings`로 부른다.[](source:fm)[](source:yaml) |
| 성격 | scanner 결과를 가져와 로컬에 쌓고 승인받아 Cloud에 올리는 절차다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| resolve-dependency-alert {#rel-r35} | **이 스킬** | 다음 안내 | 사용자가 가져오기를 명시적으로 요청할 때만 안내한다. 제안이다.[](source:rda) |
| **이 스킬** {#rel-r36} | attack-path-analysis | 다음 안내 | AWS Continuum 항목에 한해 선택한 issue의 저장된 `.evidence`를 넘기라고 한다.[](source:cont) |
| **이 스킬** {#rel-r37} | fix-finding | 결과 전달 | Continuum finding 하나를 `--source-root`와 함께 수집하면 patch가 함께 온다.[](source:cont) |
| **이 스킬** {#rel-r38} | cloud-findings | 결과 전달 | 판정: Cloud에 올린 finding을 cloud-findings가 읽을 수 있다. 두 파일은 서로를 지목하지 않는다. |
| cloud-findings {#rel-r39} | **이 스킬** | 참고 | cloud-findings는 읽기만 하고 결과 업로드는 하지 않는다. 이름으로 가리키지는 않는다. |

@architecture id=relation-map title="publish-findings와 이어지는 스킬"
| rda | resolve-dependency-alert | backend |
| ap | attack-path-analysis | backend |
| fix | fix-finding | backend |
| cf | cloud-findings | backend |
| self | publish-findings(이 스킬) | backend |
| rda > self | 다음 안내 |
| self > ap | 다음 안내 |
| self > fix | 결과 전달 |
| self > cf | 결과 전달 |
| cf > self | 참고 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 근거 선택, scanner별 수집 표, 로컬 import, Cloud 게시 규칙 | 스킬이 켜지면 읽는다 | 근거 선택, scanner 수집, 로컬 미리보기, 승인?, 로컬 저장, 게시도 요청?, 게시 미리보기, 사용자 확인?, 그룹별 게시 |
| `agents/openai.yaml` | 표시 이름, 짧은 설명, 기본 prompt, 암묵 호출 허용 | 호스트가 스킬 목록을 만들 때 쓴다 | 근거 선택 |
| `references/checkmarx-import.md` | Checkmarx One과 CxSAST 수집 절차, 실행 전 준비 | 표의 Checkmarx 항목을 따를 때 읽는다 | scanner 수집, 로컬 미리보기 |
| `references/wiz-import.md` | Wiz 입력 형식, occurrence ID, 가족별 필수 필드 | 표의 Wiz 항목을 따를 때 읽는다 | scanner 수집 |
| `scripts/collect_checkmarx.py` | 사용자가 지정한 `cx`나 CxFlow를 불러 보고서를 받고 scan ID를 검증한다 | Checkmarx 수집 때 에이전트가 실행하라고 지시한다. 분석자는 실행하지 않았다 | scanner 수집 |
| `scripts/collector_paths.py` | 소스 checkout 경로를 찾고 어떤 경로가 그 안인지 판정한다 | `collect_checkmarx.py`가 가져다 쓴다(코드 확인) | scanner 수집 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 로컬 import 쓰기 | 먼저 `--dry-run`으로 본다. 승인된 요청에서만 `--yes`로 쓴다 | [](source:loc) |
| Cloud 게시 | 미리보기를 보여 주고 사용자가 확인한 뒤 그룹마다 `group.publish`한다 | [](source:cl) |
| review ID가 바뀜 | 새 미리보기가 필요하다 | [](source:cl2) |
| 이전 client의 대기 중 업로드 | 원래 build로 끝내거나 Cloud에 닿은 finding을 확인한 뒤 새 제출을 준비한다 | [](source:cl2) |
| 부분 import(종료 코드 1) | 저장된 finding을 확인하고 제외를 보고한 뒤 다시 시도한다 | [](source:loc) |
| 자격 증명 | vendor의 저장소나 지원 환경변수를 쓴다. 명령 인자와 가져온 근거에는 넣지 않는다 | [](source:pick) |
| 선택이 근거로 정해지지 않음 | 그때만 계정이나 저장소를 묻는다 | [](source:pick) |
| 모르는 형식의 행 | 모든 선택 행을 근거나 번호 붙은 제외로 설명한다. 빠진 항목은 보고한다 | [](source:unf) |
| CrowdStrike `fcs`가 `PATH`에 없음 | 설치하지 않고 Falcon 자격 증명도 인자로 주지 않는다. 저장된 보고서를 요청한다. 가져오기는 `--to local`만 한다 | [](source:crow) |
| Checkmarx 도구 실행 | 신뢰할 세션과 소스 밖 비공개 폴더를 쓴다. 보고서를 만드는 도구는 소스 밖 설치 파일만 허용한다 | [](source:cm-pre)[](source:py-inst) |
| CxSAST 소유권을 확인하지 못함 | 가져오지 않고 선택된 XML을 요청한다 | [](source:cm-sast) |
| CxFlow 1.6.37 미만 | 거부한다. 이전 버전은 scan ID를 받고도 최신 scan을 가져온다 | [](source:cm-sast)[](source:py-ver) |
| 받은 보고서의 scan ID(CxSAST는 project와 team도)가 요청과 다름 | 오류로 멈춘다 | [](source:py-run) |
| Wiz 항목 | 누락된 ID, severity, revision, 위치를 지어내지 않는다. occurrence ID는 vendor가 준 값을 쓴다 | [](source:wz-prof) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- scanner별 수집 표 — scanner 수집 · 13개 scanner 행의 명령과 식별 규칙이라 개요에 담지 않았다
- Checkmarx 수집 절차 — scanner 수집 · One과 CxSAST의 준비, 환경변수 격리, collector의 검증 단계
- Wiz 입력 형식 — scanner 수집 · 패키지 CSV 필수 열, SAST·secret·IaC 컬렉션과 occurrence ID 접두어
- Cloud 게시 재시도 — 그룹별 게시 · private inbox와 저장소 요청에서 확인할 값, 중단 뒤 다시 준비하는 규칙
- 모르는 형식 parser 규칙 — 로컬 미리보기 · `prepareNormalizedLocalImport`에 넘기는 값과 제외 번호 규칙

@callout level=open-question title="확인하지 못한 것"
| 설치된 `@openai/codex-security` 패키지의 `docs/sdk.md`와 `codex-security` CLI, SDK 함수 구현은 이 저장소에 없어 읽지 못했다. |
| 표가 가리키는 외부 문서(`docs/scanner-imports/`)도 읽지 않았다. |
| 승인되지 않았을 때와 Cloud 확인이 없을 때의 경로는 원문에 명시 없음. |

읽은 원본: 텍스트 파일 6개. 제외: 없음.
