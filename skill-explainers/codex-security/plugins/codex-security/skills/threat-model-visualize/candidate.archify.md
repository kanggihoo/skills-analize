# threat-model-visualize — 기존 위협 모델을 탐색용 HTML로 보여 준다 {#overview}

threat-model-visualize는 이미 있는 위협 모델(threat model)을 읽어, 구조와 위협 경로를 눌러 볼 수 있는 standalone HTML explorer로 만들게 하는 스킬이다. 새 평가나 새 scan은 하지 않는다.[](source:fm)[](source:intro)

- "X의 마지막 scan에서 만든 위협 모델을 시각화해 줘" 같은 요청만으로 켜진다. 대상과 최신 assessment·snapshot을 찾고, 최신 artifact가 없으면 오래된 것을 쓰기 전에 알린다.[](source:target)
- 결과는 `source-inventory.md`, `correctness-review.md`, view model JSON, explorer HTML이다. HTML은 기본으로 로컬에 둔다.[](source:inv-save)[](source:review-rec)[](source:deliver)
- 관계: `threat-model`, `security-scan`, `security-diff-scan`, `deep-security-scan`이 남긴 위협 모델을 입력으로 받는다(결과 전달).
- 하지 않는 것: 애플리케이션 코드를 보거나 토폴로지, 권한, 통제, 도달 가능성, 검증 결과를 지어내지 않는다. Mermaid도 쓰지 않는다. site 호스팅은 명시적으로 요청받을 때만 한다.[](source:intro)[](source:target)[](source:deliver)

@answer scope="codex-security/plugins/codex-security/skills/threat-model-visualize · 원본 파일 6개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source fm title="frontmatter: name과 description" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=1:4
@source intro title="목적과 금지" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=8:8
@source target title="대상 찾기와 입력 규칙" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=10:10
@source ctx title="배포 맥락과 여러 artifact" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=12:14
@source inv-save title="source-inventory 저장과 항목" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=18:25
@source inv-check title="inventory 검토와 완료 조건" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=27:29
@source comp-read title="계약 문서 읽고 model 작성" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=33:33
@source comp-arch title="architecture overview 구성" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=35:37
@source comp-cover title="coverage와 시나리오 근거" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=39:43
@source rev-deleg title="리뷰 위임 방식" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=47:47
@source rev-oblig title="리뷰어의 obligations 작성" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=49:49
@source review-rec title="PASS·REVISION REQUIRED 기록" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=61:65
@source build-cmd title="build 명령" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=69:73
@source qa-tool title="브라우저 도구 선택과 file URL" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=75:77
@source qa-check title="QA 항목" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=79:81
@source deliver title="전달과 site 호스팅 조건" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=83:83
@source oai title="표시 이름과 기본 prompt" path=codex-security/plugins/codex-security/skills/threat-model-visualize/agents/openai.yaml lines=1:4
@source vm-intro title="view model 계약의 역할과 한계" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/view-model.md lines=3:9
@source vm-evid title="evidence 인용 규칙" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/view-model.md lines=47:47
@source ce-palette title="고정 색과 architecture 우선" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/context-explorer.md lines=3:5
@source ce-qa title="레이아웃 QA 실패 기준" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/context-explorer.md lines=17:17
@source bx-main title="build_explorer.py의 입출력과 오류 종료" path=codex-security/plugins/codex-security/skills/threat-model-visualize/scripts/build_explorer.py lines=540:586
@source r-tm title="threat-model의 단독 저장" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=25:27
@source r-sa title="scan별 위협 모델 경로" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=28:29
@source r-sres title="security-scan의 모델 저장" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md lines=7:7
@source r-sdiff title="security-diff-scan의 모델 저장" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=28:28
@source r-deep title="deep-security-scan의 완료 보고" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=14:14
@source r-contract title="Deep scan의 모델 보존" path=codex-security/plugins/codex-security/references/scan-contract.md lines=173:173

## 어떻게 동작하나 {#flow span=12}

절차형이다. 그림의 `독립 리뷰?`가 가장 중요한 갈림길이다. `PASS`가 없으면 브라우저 QA로 넘어가지 못한다.[](source:review-rec)

@workflow id=flow-diagram title="threat-model-visualize 흐름"
| lane src | 원본 확정 |
| lane model | model 작성 |
| lane review | 독립 리뷰 |
| lane ship | 만들고 검사 |
| find | 대상·assessment 찾기 | backend | src | source:target |
| inv | source-inventory 작성 | backend | src | source:inv-save |
| comp | view model 작성 | backend | model | source:comp-arch |
| rev | 독립 리뷰? | backend | review | source:review-rec |
| fix | JSON 고치기 | backend | review | source:review-rec |
| build | explorer 만들기 | backend | ship | source:build-cmd |
| qa | 브라우저 QA | backend | ship | source:qa-check |
| find > inv | |
| inv > comp | 검증된 inventory |
| comp > rev | |
| rev > build | PASS |
| rev > fix | REVISION REQUIRED |
| fix > rev | 다시 검토 |
| build > qa | |
| qa > rev | JSON 고침 |

@steps id=flow-steps
| s-find | 대상·assessment 찾기 | **입력** 시각화 요청(대상, 마지막 scan 또는 지정 artifact) · **출력** 입력 assessment와 snapshot. **처리** 대상, 최신 assessment, snapshot을 찾고 입력은 바꾸지 않는다.[](source:target) **다음** 최신 artifact가 없으면 오래된 것을 쓰기 전에 알린다. 여러 artifact를 명시로 받으면 파생 문서 하나를 `--assessment`에 넘기고 snapshot을 섞지 않는다.[](source:target)[](source:ctx) | flow-diagram | find |
| s-inv | source-inventory 작성 | **입력** assessment · **출력** `source-inventory.md`(workspace). **처리** assessment의 identity·파일 hash·범위를 적고, 구성요소·관계·통제·위협 coverage를 의미 ID와 원문 근거로 나열한 뒤 assessment 전체와 대조해 고친다.[](source:inv-save)[](source:inv-check) **다음** 이 단계가 끝나기 전에는 시각화 계획, 그룹, 경로, 좌표, JSON 작성을 시작하지 않는다. 원문에 없는 연결이나 안전장치는 만들지 않는다.[](source:inv-save)[](source:inv-check) | flow-diagram | inv |
| s-comp | view model 작성 | **입력** 검증된 inventory · **참조** `references/view-model.md`, `references/context-explorer.md` · **출력** 근거가 붙은 view model JSON과 geometry. **처리** architecture overview를 먼저 짓고, inventory를 coverage 장부로 삼아 각 operation을 선택 가능한 관계와 통제에 묶는다.[](source:comp-read)[](source:comp-arch)[](source:comp-cover) **다음** 새 후보나 재생성이면 이전 model이나 HTML을 고치지 않고 새로 쓴다. 신뢰된 운영자의 행동은 assessment가 악용·침해를 명시할 때만 위협 출처로 둔다.[](source:intro)[](source:comp-cover) | flow-diagram | comp |
| s-rev | 독립 리뷰? | **입력** inventory·JSON·assessment · **출력** `correctness-review.md`의 timestamp가 있는 `PASS` 또는 `REVISION REQUIRED`와 JSON hash. **처리** 새 컨텍스트 리뷰어가 source에서 뽑은 obligations를 먼저 저장하고, 실제 JSON의 선택·통제 효과가 원문과 맞는지 반증하려 한다.[](source:rev-deleg)[](source:rev-oblig)[](source:review-rec) **다음** 위임이 불가하거나 실패했을 때만 self-review로 대신하고 그 이유와 독립성 한계를 적는다. 리뷰를 기다리는 중이라는 이유로는 대신하지 않는다.[](source:rev-deleg) | flow-diagram | rev |
| s-fix | JSON 고치기 | **입력** 리뷰어의 지적(주장, JSON pointer, 원문 구간) · **출력** 고친 JSON과 갱신된 검토 기록. **처리** 지적을 prose가 아니라 JSON에서 고치고, 리뷰어가 같은 객체를 쓰는 다른 선택까지 다시 확인한다.[](source:review-rec) **다음** 필수 수정이 남으면 계속 고치거나, 미완료 항목을 밝힌 draft로만 전달한다.[](source:review-rec) | flow-diagram | fix |
| s-build | explorer 만들기 | **입력** 현재 JSON의 `PASS` 영수증·assessment · **실행** `python3.12 <skill-directory>/scripts/build_explorer.py <model.json> --assessment <threat-model.md> --output <explorer.html>` · **출력** 자체 완결 HTML과 connector 경고. **처리** 스크립트가 참조·geometry·정확한 인용을 검사하고 asset과 model, assessment를 HTML 하나에 합친다(코드 확인).[](source:build-cmd)[](source:bx-main) **다음** 오류면 종료 코드 2로 멈추고 출력이 model이나 assessment와 같은 파일이면 거부한다. 구조만 검사하고 주장의 진실성이나 시각적 명료성은 보지 않는다.[](source:bx-main)[](source:vm-intro) | flow-diagram | build |
| s-qa | 브라우저 QA | **입력** 빌드한 HTML · **참조** `references/context-explorer.md` · **출력** QA 결과와 전달할 HTML·SVG. **처리** 허용된 브라우저로 overview, 선택 시나리오, 통제, 오프라인 로딩, SVG export를 확인하고 글자 겹침이나 가려진 화살촉은 배치를 다시 짜서 고친다.[](source:qa-tool)[](source:qa-check)[](source:ce-qa) **다음** Codex in-app browser는 `file:` URL을 지원하지 않으므로 `127.0.0.1`에 직접 연 HTTP 서버로 확인하고 끝나면 멈춘다. 허용된 브라우저가 없으면 파일만 전달하고 QA를 미완료로 표시한다.[](source:qa-tool) | flow-diagram | qa |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(description)이나 대상의 마지막 scan을 시각화하라는 요청. 호출 제한 필드는 frontmatter에 없고 `agents/openai.yaml`은 표시 이름과 기본 prompt만 둔다.[](source:fm)[](source:oai) |
| 성격 | 이미 있는 위협 모델을 읽어 탐색용 HTML로 바꾸는 단계 스킬. 새 평가는 하지 않는다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| threat-model {#rel-r42} | **이 스킬** | 결과 전달 | visualize의 기본 입력은 기존 위협 모델 artifact이고 `--assessment`로 넘긴다. 단독 요청에서 저장한 `threatmodel.md`가 입력이 된다. 새 assessment는 하지 않는다.[](source:target)[](source:r-tm) |
| security-scan {#rel-r43} | **이 스킬** | 결과 전달 | "마지막 scan에서 만든 위협 모델" 요청이면 충분하다. 최신 artifact가 없으면 오래된 것을 쓰기 전에 알리고 새 scan은 돌리지 않는다. host가 scan 모델을 `threatmodel.md`로 렌더링한다.[](source:target)[](source:r-sa)[](source:r-sres) |
| security-diff-scan {#rel-r71} | **이 스킬** | 결과 전달 | diff scan도 위협 모델을 `scan.threatModel`로 저장하고 host가 `threatmodel.md`를 렌더링한다. visualize 쪽에 diff 전용 문장은 없다.[](source:r-sdiff)[](source:target) |
| deep-security-scan {#rel-r72} | **이 스킬** | 결과 전달 | 읽히는 것은 부모의 primary model뿐이다. worker 모델을 자동으로 합치는지는 원문에 명시 없고, 스킬은 snapshot을 조용히 합치지 말라고 한다.[](source:r-contract)[](source:r-deep)[](source:target) |
| **이 스킬** {#rel-r69} | Sites workflow 등 | 참고 | 사이트 호스팅은 사용자가 명시적으로 요청할 때만 Sites workflow로 하고, 인라인 미리보기는 visualize integration을 쓴다. 이 플러그인 트리에는 해당 문서가 없어 범위 밖이다.[](source:deliver) |

@architecture id=relation-map title="threat-model-visualize와 이어지는 스킬"
| tm | threat-model | backend |
| ss | security-scan | backend |
| sd | security-diff-scan | backend |
| dp | deep-security-scan | backend |
| self | threat-model-visualize(이 스킬) | backend |
| ext | Sites workflow 등(범위 밖) | external |
| tm > self | 결과 전달 |
| ss > self | 결과 전달 |
| sd > self | 결과 전달 |
| dp > self | 결과 전달 |
| self > ext | 참고 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 네 단계 절차와 금지, 리뷰·QA 규칙을 담은 본문 | 스킬이 켜지면 읽는다 | 대상·assessment 찾기, source-inventory 작성, view model 작성, 독립 리뷰?, JSON 고치기, explorer 만들기, 브라우저 QA |
| `agents/openai.yaml` | 표시 이름과 기본 prompt | UI에 보일 때 쓰인다 | 원문에 명시 없음 |
| `references/view-model.md` | JSON 필드, 시나리오·route·통제 효과, 증거 규칙 계약 | 2단계에서 model을 쓰기 전에 읽는다 | view model 작성, 독립 리뷰? |
| `references/context-explorer.md` | 고정 색, architecture 우선, 연결선·글자 배치 지침 | 2단계에서 model을 쓰기 전에 읽는다 | view model 작성, 브라우저 QA |
| `scripts/build_explorer.py` | model과 assessment를 검사해 HTML 하나로 합치는 builder | 3단계 `PASS` 뒤 실행하라고 한다 | explorer 만들기 |
| `assets/` (`explorer.html`, `explorer.js`, `explorer.css`, `svg-layout.js` 등 7개와 참고 SVG 2개) | explorer 셸. builder가 HTML에 넣는다 | builder가 읽는다. 구조·표본만 확인 | explorer 만들기 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 새 평가나 새 scan이 필요해 보인다 | 하지 않는다. 애플리케이션 코드도 보지 않는다 | [](source:intro) |
| 최신 artifact가 없다 | 오래된 것을 쓰기 전에 알린다. snapshot을 조용히 합치지 않는다 | [](source:target) |
| 인벤토리 검증이 끝나지 않았다 | 시각화 계획, 그룹, 경로, geometry, JSON 작성을 시작하지 않는다 | [](source:inv-save) |
| 근거가 없는 토폴로지, 권한, 통제, 도달 가능성 | 만들지 않는다. 불확실성은 그대로 남긴다 | [](source:target)[](source:inv-check) |
| 리뷰가 끝나지 않았다 | preview 서버, 브라우저 열기, export 검사를 하지 않는다. 정적 build와 구조 검증은 해도 된다 | [](source:rev-deleg) |
| 현재 JSON hash와 `PASS` 영수증이 맞지 않는다 | 브라우저 QA를 시작하지 않는다 | [](source:review-rec)[](source:build-cmd) |
| 위임이 가능하다 | 새 컨텍스트 리뷰어에 `fork_turns: "none"`을 주고 작성자 결론과 스크린샷은 보내지 않는다 | [](source:rev-deleg) |
| 필수 수정이 남았다 | 계속 고치거나, 미완료 항목을 밝힌 draft로만 전달한다 | [](source:review-rec) |
| 허용된 브라우저가 없다 | 파일만 전달하고 브라우저 QA를 미완료로 표시한다. 정책 거부를 우회하지 않는다 | [](source:qa-tool) |
| HTTP 미리보기가 필요하다 | `127.0.0.1`에 직접 연 서버로 출력 폴더만 서빙하고 끝나면 멈춘다 | [](source:qa-tool) |
| site 생성·갱신·게시 | 사용자가 명시적으로 호스팅을 요청할 때만 한다. 시각화나 미리보기 요청만으로는 하지 않는다 | [](source:deliver) |
| 제안된 통제 | `Proposed control`로 표시하고 효과는 조건부로 쓴다. 배포됐거나 검증된 것처럼 보이지 않는다 | [](source:comp-cover)[](source:ce-palette) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- inventory 항목 규칙 — source-inventory 작성 · 구성요소·관계·통제·coverage 네 갈래의 분류와 검토 기준이 길다
- 시나리오·route·source 계약 — view model 작성 · `steps`, `routes`, `beforeStep`, `afterStep`, `sources` 필드 규칙이 많다
- 통제 효과 판정 규칙 — view model 작성, 독립 리뷰? · `blocks`, `limits`, `traffic`, `arrival`과 소유자 표시 규칙
- 리뷰 실패 유형 다섯 가지 — 독립 리뷰? · authority, control ownership, effects, evidence, coverage 점검 기준
- 레이아웃과 QA — 브라우저 QA · connector, caption, marker 배치 기준과 `data-layout-issues`

@callout level=open-question title="확인하지 못한 것"
| `scripts/build_explorer.py`는 1~150줄과 540~590줄만 읽었다. 가운데 검증 로직과 `assets/`의 js·css·SVG 내부는 읽지 않았고 구조·표본만 확인했다. |
| Sites workflow, visualize integration 문서와 `spawn_agent` 정의는 이 플러그인 트리에 없어 읽지 못했다. |
| `SKILL.md`는 `source-inventory.md`를 workspace에 저장하라고 하지만 저장 도구 규칙(`artifact-storage.md`)과의 우선순위는 원문에 명시 없다. |

읽은 원본: 텍스트 파일 6개(`build_explorer.py`는 일부). 제외: `assets/`의 js 5개·css·SVG 2개는 구조·표본만 확인했다.
