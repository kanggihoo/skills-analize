# threat-model-visualize는 기존 위협 모델을 어떤 검증을 거쳐 explorer로 바꾸나? {#tmv-page}

`threat-model-visualize`는 새 평가를 하지 않는다. 이미 있는 위협 모델 문서만 읽어, 정확한 인용이 붙은 standalone HTML explorer로 바꾼다. 문서에 없는 구조, 권한, 통제, 도달 가능성을 지어내지 못하게 하려고 4단계를 두고, 새 맥락 리뷰어의 `PASS` 기록이 있어야 browser QA로 넘어간다.[](source:purpose)[](source:req)[](source:rev-receipt)[](source:build)

- 입력은 기존 위협 모델 하나다. 새 scan, 새 assessment, 애플리케이션 코드 검사는 하지 않고 입력은 바꾸지 않는다.[](source:req)
- 그림을 계획하기 전에 `source-inventory.md`부터 저장하고, 평가 문서와 대조해 근거를 맞춘다.[](source:inv-when)[](source:inv-rev)
- 작성자가 아니라 새 맥락의 리뷰어가 JSON의 주장을 반증하려 하고, 결과를 `correctness-review.md`에 시각과 hash가 든 기록으로 남긴다.[](source:rev-when)[](source:rev-receipt)
- `build_explorer.py`는 참조, 인용 일치, 통제 효과 규칙 같은 구조만 검사한다. 주장이 참인지, 읽기 쉬운지, 리뷰가 끝났는지는 검사하지 않는다.[](source:py-evid)[](source:py-main)[](source:qa)

@answer scope="스킬·계약·builder·실행 코드 읽음 · 스크립트 실행 없음 · renderer 일부와 test는 표본만 확인한 부분 분석"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source skill-full title="threat-model-visualize/SKILL.md · 19102B · 스킬 본문(전부 읽음)" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md
@source fm title="threat-model-visualize/SKILL.md · frontmatter" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=1:4
@source purpose title="threat-model-visualize/SKILL.md · 목적과 팔레트" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=8:8
@source req title="threat-model-visualize/SKILL.md · 요청 해석과 입력 규칙" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=10:12
@source regen title="threat-model-visualize/SKILL.md · 재생성 규칙" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=14:14
@source inv-when title="threat-model-visualize/SKILL.md · 1단계 시점과 저장" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=18:18
@source inv-rec title="threat-model-visualize/SKILL.md · 1단계 기록과 열거 항목" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=20:25
@source inv-rev title="threat-model-visualize/SKILL.md · 1단계 검토와 완료 조건" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=27:29
@source compose-arch title="threat-model-visualize/SKILL.md · 2단계 구성 원칙" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=33:37
@source compose-cover title="threat-model-visualize/SKILL.md · 2단계 커버리지" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=39:39
@source compose-bind title="threat-model-visualize/SKILL.md · 2단계 근거 묶기와 시작 행위자" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=41:41
@source compose-ctrl title="threat-model-visualize/SKILL.md · 2단계 통제 표시" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=43:43
@source rev-when title="threat-model-visualize/SKILL.md · 3단계 시점과 리뷰어" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=47:47
@source rev-obl title="threat-model-visualize/SKILL.md · 3단계 의무 목록과 선택 해석" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=49:51
@source rev-modes title="threat-model-visualize/SKILL.md · 3단계 반증 항목 다섯 개" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=53:57
@source rev-find title="threat-model-visualize/SKILL.md · 3단계 지적 형식과 수정 확인" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=59:61
@source rev-receipt title="threat-model-visualize/SKILL.md · 3단계 PASS 기록" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=63:65
@source build title="threat-model-visualize/SKILL.md · 4단계 PASS 조건과 빌드 명령" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=67:73
@source browser title="threat-model-visualize/SKILL.md · 4단계 browser 선택과 HTTP preview" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=75:77
@source warn title="threat-model-visualize/SKILL.md · 4단계 connector 경고" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=79:79
@source qa title="threat-model-visualize/SKILL.md · 4단계 browser 검사" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=81:81
@source deliver title="threat-model-visualize/SKILL.md · 4단계 전달" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=83:83
@source yaml title="threat-model-visualize/agents/openai.yaml · 259B · 표시 이름과 기본 prompt(전부 읽음)" path=codex-security/plugins/codex-security/skills/threat-model-visualize/agents/openai.yaml
@source readme-call title="skills/README.md · 3752B · 스킬을 이름으로 고르는 방법(전부 읽음)" path=codex-security/plugins/codex-security/skills/README.md lines=3:3
@source readme-tmv title="skills/README.md · 벤더의 이 스킬 소개" path=codex-security/plugins/codex-security/skills/README.md lines=20:20
@source vm-head title="references/view-model.md · 12062B · view-model 계약(전부 읽음)" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/view-model.md lines=3:9
@source vm-map title="references/view-model.md · map 계약" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/view-model.md lines=13:19
@source vm-route title="references/view-model.md · scenario와 route" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/view-model.md lines=23:27
@source vm-src title="references/view-model.md · source 역할" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/view-model.md lines=31:35
@source vm-ctrl title="references/view-model.md · control과 effect" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/view-model.md lines=37:43
@source vm-evid title="references/view-model.md · evidence와 export" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/view-model.md lines=47:49
@source ce-pal title="references/context-explorer.md · 5636B · 표현 지침(전부 읽음) · 팔레트" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/context-explorer.md lines=3:3
@source ce-prop title="references/context-explorer.md · 제안 통제 표기" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/context-explorer.md lines=11:11
@source ce-geo title="references/context-explorer.md · connector와 배치" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/context-explorer.md lines=13:15
@source ce-qa title="references/context-explorer.md · QA 실패 기준" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/context-explorer.md lines=17:21
@source py-top title="scripts/build_explorer.py · 27557B · builder 머리말(전부 읽음, 실행 안 함)" path=codex-security/plugins/codex-security/skills/threat-model-visualize/scripts/build_explorer.py lines=1:16
@source py-val title="build_explorer.py · 그래프 배열과 geometry 검사" path=codex-security/plugins/codex-security/skills/threat-model-visualize/scripts/build_explorer.py lines=40:90
@source py-route title="build_explorer.py · source 역할, route, step 검사" path=codex-security/plugins/codex-security/skills/threat-model-visualize/scripts/build_explorer.py lines=111:298
@source py-ctrl title="build_explorer.py · 통제와 효과 검사" path=codex-security/plugins/codex-security/skills/threat-model-visualize/scripts/build_explorer.py lines=299:463
@source py-evid title="build_explorer.py · 인용과 hash 검사" path=codex-security/plugins/codex-security/skills/threat-model-visualize/scripts/build_explorer.py lines=464:496
@source py-warn title="build_explorer.py · connector 경고" path=codex-security/plugins/codex-security/skills/threat-model-visualize/scripts/build_explorer.py lines=509:537
@source py-main title="build_explorer.py · main과 출력" path=codex-security/plugins/codex-security/skills/threat-model-visualize/scripts/build_explorer.py lines=540:586
@source html title="assets/explorer.html · 2673B · HTML 틀(전부 읽음)" path=codex-security/plugins/codex-security/skills/threat-model-visualize/assets/explorer.html
@source fx title="assets/control-effects.js · 4005B · 통제 효과 계산(전부 읽음)" path=codex-security/plugins/codex-security/skills/threat-model-visualize/assets/control-effects.js lines=22:49
@source rp title="assets/route-paths.js · 3648B · route 도달 계산(전부 읽음)" path=codex-security/plugins/codex-security/skills/threat-model-visualize/assets/route-paths.js lines=1:25
@source sr title="assets/source-roles.js · 2762B · source 역할 팔레트(전부 읽음)" path=codex-security/plugins/codex-security/skills/threat-model-visualize/assets/source-roles.js lines=1:16
@source ex-hash title="assets/explorer.js · 42283B · 선택 상태를 URL hash로 저장" path=codex-security/plugins/codex-security/skills/threat-model-visualize/assets/explorer.js lines=53:65
@source ex-layout title="assets/explorer.js · layout 상태 표시" path=codex-security/plugins/codex-security/skills/threat-model-visualize/assets/explorer.js lines=277:281
@source ex-evid title="assets/explorer.js · 근거 dialog" path=codex-security/plugins/codex-security/skills/threat-model-visualize/assets/explorer.js lines=289:293
@source ex-down title="assets/explorer.js · SVG와 HTML 내려받기" path=codex-security/plugins/codex-security/skills/threat-model-visualize/assets/explorer.js lines=342:367
@source sl-node title="assets/svg-layout.js · 11530B · node 글자 크기와 넘침 판정" path=codex-security/plugins/codex-security/skills/threat-model-visualize/assets/svg-layout.js lines=143:147
@source test-readme title="tests/threat-model-visualize/browser/README.md · 1754B · browser smoke test 안내(전부 읽음)" path=codex-security/plugins/codex-security/tests/threat-model-visualize/browser/README.md lines=3:13
@source art-model title="references/artifact-storage.md · 7947B · 위협 모델 cache와 threatmodel.md" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=49:54
@source art-supp title="references/artifact-storage.md · 보조 파일 저장 규칙" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=11:13
@source tm-ret title="threat-model/SKILL.md · 위협 모델 반환과 저장" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=25:27
@source sa-doc title="references/scan-artifacts.md · scan 폴더의 threatmodel.md" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=28:29
@source tmd title="mcp-app/src/threat-model-document.ts · host가 threatmodel.md를 만드는 코드" path=codex-security/plugins/codex-security/mcp-app/src/threat-model-document.ts lines=33:70
@source ds-model title="security-diff-scan/SKILL.md · diff scan의 위협 모델 저장" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=28:28
@source sc-model title="references/scan-contract.md · Deep scan의 primary model" path=codex-security/plugins/codex-security/references/scan-contract.md lines=173:173
@source fork-core title="references/core-scan.md · fork_turns 사용 예" path=codex-security/plugins/codex-security/references/core-scan.md lines=10:10
@source lock title="codex-security/skills-lock.json · 6525B · 설치 출처(이 스킬 항목 106:111만)" path=codex-security/skills-lock.json lines=106:111

## 언제 켜지고 무엇을 입력으로 받나? {#activation}

`description`은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어가 있어야 켜진다는 뜻이 아니다. 호출 제한 필드(`disable-model-invocation` 등)는 `SKILL.md`에 원문에 명시 없음이고, `agents/openai.yaml`에도 `policy` 항목이 없다.[](source:fm)[](source:yaml)

@code source=fm language=yaml

벤더 안내는 사용자가 스킬 이름을 넣어 직접 고를 수 있다고 하고, 이 스킬을 "기존 모델을 탐색 가능한 diagram으로 바꾸는 스킬"로 소개한다.[](source:readme-call)[](source:readme-tmv)

| 입력과 요청 | 에이전트의 처리 |
|---|---|
| 원문 예시 "Visualize the threat model generated in the last scan of X" | 이 한 문장으로 충분하다. 대상, 최신 assessment, snapshot을 스스로 찾는다.[](source:req) |
| 최신 artifact가 없을 때 | 오래된 artifact를 쓰기 전에 그 사실을 먼저 알린다. 아예 없을 때의 처리는 원문에 명시 없음이다.[](source:req) |
| 기본 입력 | 기존 위협 모델 artifact다. 완료된 scan 전체를 자동으로 가져오지 않는다.[](source:req) |
| 입력 보존 | 입력은 바꾸지 않는다. snapshot끼리 조용히 합치지 않는다. 애플리케이션 코드를 보지 않고 topology, authority, control, reachability, validation을 지어내지 않는다.[](source:req) |
| 문서를 여러 개 명시적으로 준 경우 | 파생 문서 하나를 `--assessment`로 넘긴다. 발췌마다 출처, snapshot, 원래 상태를 적고, 충돌하는 설명과 원본을 보존한다.[](source:req) |
| 배포 맥락 | 노출, 신뢰, tenant와 process 경계, identity, 조건부 가정을 근거가 있는 만큼만 적는다. 저장소 기본값을 배포 설정의 증거로 쓰지 않는다.[](source:req) |
| 재생성 요청 | 새 view model을 처음부터 쓴다. 이전 모델이나 HTML을 복사하거나 고치지 않는다. 일반 수정은 기존 모델을 쓸 수 있고, renderer만 다듬는 일은 재생성이 아니다.[](source:regen) |

| 요청 | 이 스킬에 맞나 |
|---|---|
| 이미 있는 위협 모델을 구조와 위협 경로로 보여 달라 | 맞다 {good:대상} |
| 위협 모델이 없어서 새로 만들어 달라 | 맞지 않다 {bad:범위 밖}. 이 스킬은 새 assessment와 새 scan을 하지 않는다.[](source:req) |
| 취약점이 실제로 악용되는지 확인해 달라 | 맞지 않다 {bad:범위 밖}. 출력은 배포나 악용을 검증하지 않는다.[](source:vm-evid)[](source:req) |
| 사이트로 호스팅하거나 게시해 달라 | 사용자가 명시적으로 요청할 때만 한다 {caution:요청 필요}. 시각화나 preview 요청만으로는 부족하다.[](source:deliver) |
| 정적 이미지가 필요하다 | 같은 선택 상태의 SVG나 PNG를 쓴다.[](source:deliver) |

판정 · 이 스킬은 위협 모델의 저자가 아니라 번역자 역할이다. 원문이 새 평가를 금지하고, 근거 없는 보충을 단계마다 막기 때문이다.[](source:req)[](source:inv-rev)[](source:rev-modes)

## 어떤 순서로 만들고, 어디서 멈추나? {#phases}

@workflow id=phase-flow title="원본 목록화에서 전달까지"
| lane s1 | 1 원본 목록화 |
| lane s2 | 2 모델 작성 |
| lane s3 | 3 독립 리뷰 |
| lane s4 | 4 빌드·검사 |
| inv | 원본 목록화 | backend | s1 | source:inv-when |
| compose | 모델 작성 | backend | s2 | source:compose-arch |
| review | 독립 리뷰 | security | s3 | source:rev-when |
| pass | PASS 기록? | security | s3 | source:rev-receipt |
| build | HTML 빌드 | backend | s4 | source:build |
| qa | browser QA | frontend | s4 | source:qa |
| out | 로컬 HTML 전달 | external | s4 | source:deliver |
| draft | 미완 표시 전달 | external | s4 | source:rev-receipt |
| inv > compose | |
| compose > review | |
| review > pass | |
| pass > build | 있음 | emphasis |
| pass > compose | 수정 | dashed |
| pass > draft | 미해결 | dashed |
| build > qa | |
| qa > out | 완료 | emphasis |
| qa > review | JSON 수정 | dashed |
| qa > draft | browser 없음 | dashed |

@steps id=phase-steps
| inv | 원본 목록화 | 그림 계획, 묶음, route, geometry, JSON보다 먼저 `source-inventory.md`를 저장한다. 평가 문서의 식별 정보, 파일 hash, 범위를 적고, 항목에 의미 ID와 근거 span이나 정확한 인용을 붙인다. 시각 node·edge ID는 붙이지 않는다.[](source:inv-when)[](source:inv-rec) | phase-flow | inv |
| compose | 모델 작성 | `view-model.md`와 `context-explorer.md`를 읽고 JSON과 geometry를 쓴다. 기본은 standard다. 위협을 얹기 전에 읽을 수 있는 아키텍처 개요부터 만든다.[](source:compose-arch) | phase-flow | compose |
| review | 독립 리뷰 | browser, preview server, export 시험보다 먼저 끝낸다. 정적 빌드와 구조 검증은 리뷰 대기 중에도 돌릴 수 있다. 새 맥락 리뷰어에게 작성자의 결론과 스크린샷을 넘기지 않는다.[](source:rev-when) | phase-flow | review |
| pass | PASS 기록? | 리뷰어가 시각과 time zone, assessment와 JSON hash가 든 `PASS` 또는 `REVISION REQUIRED`를 `correctness-review.md`에 쓴다. 작성자는 저장된 JSON hash가 기록과 같은지 확인한 뒤 넘어간다.[](source:rev-receipt) | phase-flow | pass |
| build | HTML 빌드 | 현재 JSON의 `PASS` 기록이 있을 때만 browser QA를 시작한다. `python3.12`로 builder를 돌리고, connector 경고를 읽어 node를 옮겼으면 bend와 port를 맞춘 뒤 다시 빌드한다.[](source:build)[](source:warn) | phase-flow | build |
| qa | browser QA | 허용된 browser로 overview, 선택 시나리오, 대표 통제를 데스크톱 폭에서 본다. offline 로딩과 SVG export도 확인한다.[](source:browser)[](source:qa) | phase-flow | qa |
| out | 로컬 HTML 전달 | 기본 전달물은 로컬 standalone HTML이다. 사이트 게시는 사용자가 명시적으로 요청할 때만 한다.[](source:deliver) | phase-flow | out |
| draft | 미완 표시 전달 | 필수 수정이 남았거나 허용된 browser가 없으면 초안임을 표시해 전달한다. 미해결 지적과 미완 browser QA를 함께 적는다.[](source:rev-receipt)[](source:browser) | phase-flow | draft |

| 파일 | 만드는 주체 | 내용 |
|---|---|---|
| `source-inventory.md` | 작성자 | 평가 문서의 식별 정보와 hash, 의미 ID가 붙은 근거 항목, 근거 정정, 미해결 공백.[](source:inv-rec)[](source:inv-rev) |
| `correctness-review.md` | 리뷰어 | source에서 뽑은 의무 목록, 선택별 해석, 지적, 확인된 수정, 시각이 찍힌 `PASS` 또는 `REVISION REQUIRED`.[](source:rev-obl)[](source:rev-receipt) |
| 모델 JSON | 작성자 | 노드, 간선, 시나리오, 근거, 명시적 geometry.[](source:vm-head) |
| explorer HTML | builder | 모델, 평가 문서 전체, 모든 asset을 담은 파일 하나.[](source:vm-evid)[](source:py-main) |

모델 수정 메모와 리뷰 판정은 `source-inventory.md`가 아니라 `correctness-review.md`에 둔다.[](source:inv-rev) browser에서 JSON을 고쳤다면 영향받은 선택을 다시 점검하고 바뀐 hash의 새 기록을 받는다. browser 이전의 첫 기록도 남겨 순서를 볼 수 있게 한다. CSS만 바꿨다면 시각 QA만 한다.[](source:rev-receipt)

## 무엇을 강제하고 금지하나? {#rules}

아래 규칙은 `SKILL.md`와 두 reference 문서가 에이전트에게 요구하는 것이다. 어느 규칙을 builder가 코드로 막는지는 다음 패널에 따로 있다.

| 대상 | 강제와 금지 |
|---|---|
| 근거 | 위상, 권한, 통제, 도달 가능성, 검증을 지어내지 않는다. 가설, finding, 선언된 통제, 관찰된 집행을 구분한다.[](source:req)[](source:inv-rec) |
| 1단계 완료 | 근거가 받쳐 주거나 명시적으로 모르는 주장만 남기고, 모든 substantive 우려를 설명한다. 불확실성은 남아도 되지만 조용히 관계나 safeguard가 되면 안 된다.[](source:inv-rev) |
| 시작 행위자 | 실제 시작 actor나 입력과 최소 권한을 모델링한다. 신뢰된 운영자는 평가가 오남용이나 침해를 명시할 때만 위협 source로 삼는다. 악의 가정은 근거가 아니다.[](source:compose-bind)[](source:vm-src) |
| 통제 owner | `control.nodes`는 집행 주체다. 집행 주체를 모르면 `nodes:[]`로 두고 공백을 밝힌다. runtime, syscall, mount 제한은 제한받는 프로세스를 집행 주체로 표시하지 않는다.[](source:vm-ctrl) |
| 제안 통제 | `Proposed control`로 표시하고 효과는 "Would block", "Would limit"처럼 조건부로 쓴다. 배포됐거나 검증된 것처럼 보이면 안 된다.[](source:compose-ctrl)[](source:ce-prop) |
| 통제 효과 | `outcome`은 `blocks`, `limits`, `detects`, `does-not-block`, `unknown`이다. 확인되지 않은 효과는 막을 수 없고, 제안은 `hypothetical`이다.[](source:vm-ctrl) |
| 선택 범위 | 한 선택은 자기 관계와 통제만 강조하고 나머지 architecture는 흐리게 둔다. 독립적으로 충분한 권한마다 선택을 만들거나 근거 있는 제외로 적는다.[](source:compose-arch)[](source:compose-bind)[](source:compose-cover) |
| 색 | 고정 팔레트를 쓴다: adversary 빨강, compromised component 자주, untrusted input 복숭아, unknown 회색, authorized use 파랑. 경로는 주황이고, 경유만으로 약점이 되지 않는다.[](source:ce-pal)[](source:sr) |
| 레이아웃 QA | `data-layout-status="unresolved"`, 글자와 component 겹침, 가려진 화살표는 게시 전에 풀어야 하는 실패다. connector가 조금 교차하는 것은 실패가 아니다.[](source:ce-qa) |
| 호스팅 | 사이트는 사용자가 명시적으로 요청할 때만 만든다. 허용된 browser가 없으면 로컬 파일을 전달하고 browser QA를 미완으로 표시한다. 정책이 거부했다고 우회하지 않는다.[](source:deliver)[](source:browser) |

@callout level=warning title="리뷰 전에 browser를 열지 않는다"
| 3단계 리뷰를 끝내기 전에는 preview server를 띄우거나 browser에서 explorer를 열거나 export를 시험하지 않는다. 정적 빌드와 구조 검증은 리뷰 대기 중에도 돌릴 수 있다. 리뷰 대기는 자체 리뷰로 물러나는 사유가 되지 못한다.[](source:rev-when) |

@facts
| fidelity | `simple`, `standard`(기본), `detailed`. 주장이나 근거는 바뀌지 않는다(작성 옵션)[](source:compose-cover) |
| shell 글자 크기 | node 제목 17, 부제 14, connector 라벨 13 단위. 코드의 node 제목 17, 부제 14와 일치한다[](source:vm-map)[](source:sl-node) |
| 핵심 글자 | 약 11 CSS px 이상을 목표로 한다(권고)[](source:vm-map) |
| 화살표 끝 직선 | 약 14 단위 이상(권고)[](source:vm-map) |
| 통제 marker | `0 < at < 1`, 폭 180 이상, 초기 높이 72 단위가 canvas 안에 들어와야 한다(builder가 검사)[](source:vm-ctrl)[](source:py-ctrl) |
| preview server | 직접 띄울 때 `127.0.0.1`의 OS가 정한 빈 port에 묶고, 출력 폴더만 서빙하고, QA 뒤 멈춘다(의무)[](source:browser) |
| builder 실행 환경 | Python 3.12 이상, 표준 라이브러리만 쓴다. 코드에서 확인한 것은 `itertools.pairwise`(3.10 이상) 사용뿐이고, 3.12가 필요한 이유는 원문에 명시 없음[](source:vm-head)[](source:py-top) |

## 검사는 누가 하고, 만들어진 HTML에는 무엇이 들어가나? {#checks}

리뷰어는 모델을 확인하려 하지 않고 반증하려 한다. 아래 다섯 항목 어느 것이든 실패하면 지적한다.[](source:rev-when)[](source:rev-modes)

| 반증 항목 | 리뷰어가 확인하는 것 |
|---|---|
| 권한과 전제 | 독립적으로 충분한 진입 조건마다 선택이나 정당한 제외가 있는가. 자격 증명이 프로세스 침해로, capability가 계정 세션 요구로 바뀌지 않았는가.[](source:rev-modes) |
| 통제 owner와 동작 | 통제마다 집행 주체, 제한받는 구성요소, 보호 동작, `control.nodes` 표시가 맞는가.[](source:rev-modes) |
| 효과와 도달 | 차단 미리보기가 실제 `step`, `edge`, `arrival`로 닿는 node와 branch와 맞는가. 설명뿐인 효과가 장벽이 되지 않았는가.[](source:rev-modes) |
| 근거와 분류 | 인용이 같은 행, 같은 대상, 같은 owner를 뒷받침하는가. 기존 장치, 제안, 목표, 주의를 구분했는가.[](source:rev-modes) |
| 선택과 커버리지 | "A 또는 B"를 "B"로 좁히지 않았는가. 빠진 진입점이나 남의 맥락에서 빌려온 강조가 없는가.[](source:rev-modes) |

- 리뷰어는 평가 문서와 view-model 계약 전체를 먼저 읽고, `correctness-review.md`에 source에서 뽑은 의무 목록을 저장한 뒤에야 inventory와 JSON을 본다.[](source:rev-obl)
- 선택마다 실제 강조되는 node·edge ID를 풀어 정의와 대조한다. 지적마다 주장, JSON pointer, 근거 span, 불일치 설명을 적는다.[](source:rev-obl)[](source:rev-find)
- 새 맥락 리뷰어는 `spawn_agent`에 `fork_turns: "none"`을 줘서 만든다. 이 옵션을 빼면 작성자의 작업을 물려받을 수 있다. 위임이 불가능하거나 실패했을 때만 자체 리뷰로 물러나고, 구체적 사유와 독립성 한계를 적는다.[](source:rev-when)
- `PASS`는 필수 수정이 남지 않았다는 뜻이다. 선택 개선과 충실히 표현된 source 불확실성은 남을 수 있다. 작성자가 쓴 요약이나 재확인 요청은 리뷰어의 종결이 아니다.[](source:rev-receipt)

builder가 오류로 멈추는 조건은 아래와 같다. 오류 종료는 `parser.exit(2, ...)`로 한다.[](source:py-main)

| 대상 | builder가 검사하는 것 |
|---|---|
| 그래프 | 노드 1개 이상. `nodes`, `edges`, `scenarios`, `evidence`는 고유한 비어 있지 않은 ID를 가진 배열. 간선은 양 끝 노드가 있고, 점이 2개 이상이며 `labelX`, `labelY`가 숫자.[](source:py-val) |
| 인용 | 인용이 평가 문서 바이트의 정확한 부분 문자열, 줄 범위 안에 있음, 나열한 path가 인용 안에 있음. `assessmentSha256`이 있으면 일치.[](source:py-evid) |
| route | 연결된 사슬, 간선 반복 금지, evidence 필수, step이 route에 순서대로 포함, route가 있으면 `focusNodes` 명시. branch는 route에 붙어 있어야 하고 `beforeStep`과 `afterStep`은 함께 못 쓴다.[](source:py-route) |
| source 역할 | `label`, `description`, `authority`, evidence, `basis` 필수. source가 여럿이면 `sourceMode` 필수. authorized user는 receiving component가 아니라 actor node.[](source:py-route) |
| 통제 효과 | proposed와 `hypothetical`은 서로의 필요충분조건. effect는 evidence와 `label`, `reason`, `conditions`, `residual` 필수. `unverified`는 block 불가. 멈추는 block은 `step`과 marker 필요.[](source:py-ctrl) |
| 출력 | 출력 경로가 모델이나 평가 문서와 같은 파일이면 거부. 템플릿 토큰은 한 번에 치환해 입력 데이터 안의 토큰 모양 글자는 그대로 둔다.[](source:py-main) |

| 확인 주체 | 확인하지 않는 것 |
|---|---|
| builder 오류 검사 | 인용이 주장을 뒷받침하는지, 주장이 참인지, 시각적으로 읽히는지.[](source:qa)[](source:vm-head) |
| builder 경고 | 대각선 끝 구간과 node 내부를 지나는 connector만 경고하고 빌드는 계속한다.[](source:py-warn)[](source:py-main) |
| builder와 `PASS` 기록 | builder는 `correctness-review.md`나 hash 기록을 읽지 않는다. 리뷰 뒤에 browser를 연다는 규칙은 코드가 아니라 에이전트가 지킨다.[](source:py-main)[](source:rev-when) |
| renderer | 장벽은 가장 이른 step에서 고르고, 도착 전 차단이 도착 후 확인보다 앞서며, 같은 지점이면 existing이 proposed보다 앞선다. 도달은 명시한 route와 branch로만 계산하고 그래프 근접성으로 추론하지 않는다.[](source:fx)[](source:rp) |
| renderer layout | node 글자가 상자를 넘치거나 배치가 풀리지 않으면 `data-layout-status`를 `unresolved`로 표시한다. 어디서 보는지는 browser QA의 몫이다.[](source:sl-node)[](source:ex-layout)[](source:ce-qa) |

판정 · 리뷰가 먼저라는 순서는 도구가 강제하지 않는다. builder는 리뷰 기록 없이도 HTML을 만든다. 순서와 hash 일치 확인은 모두 `SKILL.md`가 에이전트에게 맡긴 절차이므로, 기록 없이 산출물만 받았다면 리뷰가 끝났다고 읽으면 안 된다.[](source:py-main)[](source:rev-when)[](source:rev-receipt)

만들어진 HTML은 파일 하나이고, 모델 JSON과 평가 문서 전문과 모든 asset을 안에 담는다. "Full supplied assessment" 영역에 문서 전문이 그대로 보인다. 읽은 asset에는 `fetch`, `XMLHttpRequest`, `WebSocket`, `eval`, `localStorage`가 없었고 SVG 네임스페이스와 내부 `url(#...)` 참조 외에 URL 문자열도 없었다. 내려받기는 Blob 링크로 한다.[](source:html)[](source:py-main)[](source:ex-down)

- 선택 상태(`scenario`, `route`, `source`, `step`, `node`, `control`, `preview`)는 URL hash에 저장되어 같은 화면을 다시 열 수 있다.[](source:ex-hash)[](source:vm-evid)
- 근거 dialog는 인용과 줄 번호를 보여 주고 "독립적인 코드나 runtime 검증을 더하지 않는다"고 적는다.[](source:ex-evid)
- 판정 · 위협 모델 전문이 HTML에 들어 있으므로, 이 파일을 공유하는 것은 위협 모델 문서를 공유하는 것과 같다. 원문은 공유 범위나 민감도를 따로 말하지 않는다.[](source:html)[](source:py-main)

## 다른 스킬과 어디에서 이어지나? {#position}

@workflow id=position-flow title="위협 모델 작성에서 시각화로"
| tm | threat-model | backend | source:tm-ret |
| ss | scan 스킬들 | backend | source:ds-model |
| current | threat-model-visualize | frontend | source:req |
| sites | 사이트 호스팅 | external | source:deliver |
| tm > current | R42 | emphasis |
| ss > current | R43 R71 R72 | dashed |
| current > sites | R69 요청 시 | dashed |

@steps id=position-steps
| highlight | threat-model-visualize | 이 페이지의 스킬이다. 기존 위협 모델 문서를 읽기만 하고 새 평가를 하지 않는다. 앞 스킬이 끝났는지는 확인하지 않는다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R42 · 산출물 호환 | `threat-model`은 단독 요청에서 `threatmodel.md`를 저장하고, 이 스킬은 그 기존 artifact를 `--assessment`로 받는다. 필수 순서는 아니다. 공유 모델을 쓸 때는 끝에 `Repository:`와 `Version:` 두 줄을 붙인다.[](source:tm-ret)[](source:req)[](source:build)[](source:art-model) |
| R43 · 산출물 호환 | 마지막 scan의 위협 모델은 위 한 문장 요청으로 충분하고 새 scan은 돌리지 않는다. scan 폴더의 `threatmodel.md`는 host가 `scan.threatModel`에서 만든 사람이 읽는 파일이다. host 코드는 scan이 완료되지 않았으면 `provisional: true`를 넘긴다. 문서에 어떻게 표시되는지는 읽지 못했다.[](source:req)[](source:sa-doc)[](source:tmd) |
| R71 · 산출물 호환 | diff scan도 위협 모델을 `complete: false` draft로 저장하고 host가 `threatmodel.md`를 쓴다. 이 스킬 쪽에 diff scan을 따로 언급한 문장은 없고 "last scan of X" 일반 지시에 포함된다.[](source:ds-model)[](source:req) |
| R72 · 산출물 호환 | Deep scan은 첫 모델을 부모의 `scan.threatModel`에 두고 다른 worker의 모델은 worker 기록에 둔다. `threatmodel.md`는 primary model의 "exportable projection"이다. 이 스킬은 "do not silently combine snapshots"라고 하므로 읽는 것은 primary model뿐이다.[](source:sc-model)[](source:req) |
| R69 · 참고(범위 밖) | 사이트 호스팅은 사용자가 명시적으로 요청할 때만 "Sites workflow"로 한다. 인라인 preview는 "visualize integration"을 쓴다. 이 두 문서와 "shared workbench"는 이 플러그인 트리에 없어 읽지 못했다.[](source:deliver)[](source:purpose) |

전체 흐름은 색인 기준 `codex-security/_group-threat-model-and-policy`의 묶음 페이지를 가리킨다. 그 묶음에서 이 스킬은 `threat-model`의 산출물을 받아 보여 주는 쪽이다.

## 어디까지 읽고 확인했나? {#audit}

읽은 파일 목록과 바이트는 같은 폴더의 `files.md`에 있다.

| 조사 구분 | 확인 범위 |
|---|---|
| 전부 읽은 텍스트 | 15개, 97,639B. `SKILL.md`, `references/view-model.md`, `references/context-explorer.md`, `scripts/build_explorer.py`, `agents/openai.yaml`, `assets/explorer.html`, `control-effects.js`, `route-paths.js`, `source-roles.js`, `references/artifact-storage.md`, `skills/README.md`, `.mcp.json`, `.codex-plugin/plugin.json`, `tests/.../browser/README.md`, `browser/fixture.mjs`.[](source:skill-full)[](source:py-top)[](source:html)[](source:fx)[](source:rp)[](source:sr)[](source:test-readme) |
| 구조·표본만 확인(전부 읽지 않음) | 23개, 355,747B. `assets/explorer.js`는 전체 372줄을 훑었지만 아주 긴 줄 몇 개는 끝이 잘렸다. `svg-layout.js`는 앞 12줄과 55~165줄을 봤다. `explorer.css`는 앞 부분과 외부 URL 검색만 했다. svg 2개는 앞 부분과 `title`만 봤다. test 파일 7개(Python 1개, mjs 6개)는 test 이름과 앞 부분만 봤다. 관계 확인용 원문 11개는 해당 줄만 읽었다. 파일별 범위는 `files.md`에 있다.[](source:ex-hash)[](source:ex-layout)[](source:sl-node) |
| 외부 호출 검색 | `explorer.js`, `svg-layout.js` 등 asset 전체에서 `fetch`, `XMLHttpRequest`, `WebSocket`, `eval`, `localStorage`, `window.open`, `sendBeacon`, `@import`, CSS `url(`을 검색했고 해당 없었다. URL 문자열은 SVG 네임스페이스와 `url(#...)` 참조뿐이었다. |
| 제외 | 번역본은 없다. 바이너리는 읽지 않았다. 두 svg는 텍스트 XML이지만 거대한 생성 예시라 읽었다고 하지 않는다. |
| 실행 | `build_explorer.py`, test, 스킬이 가리키는 `rsvg-convert`를 포함해 어떤 명령도 실행하지 않았다. browser도 열지 않았다. |

이 스킬에는 사람이 승인해야 한다고 적힌 단계가 없다. 사람이 개입하는 지점은 사이트 게시 요청과 browser 사용 정책이다.[](source:deliver)[](source:browser)

@callout level=open-question title="확인하지 못한 항목"
| `explorer.js`의 일부 긴 줄 끝과 `svg-layout.js`의 13~54줄(선분 교차 판정 같은 helper)은 읽지 않았다. 선택, 장벽 미리보기, 글자 배치, SVG export가 실제 화면에서 계약대로 나오는지는 실행으로 확인하지 못했다.[](source:ex-layout)[](source:ex-down) |
| test는 이름만 봤다. 이 저장소의 browser smoke test는 실행 환경에 browser가 없으면 실패이고 건너뛰지 않는다고 적지만, 스킬 본문은 허용된 browser가 없으면 QA를 미완으로 표시하라고 한다. 두 문서는 서로 다른 대상(test와 에이전트 절차)을 말한다.[](source:test-readme)[](source:browser) |
| `spawn_agent`와 `fork_turns` 옵션을 정의한 도구는 이 트리에 없다. `fork_turns: "none"`은 `core-scan.md`에도 쓰이지만 호스트 도구의 동작은 읽지 못했다.[](source:rev-when)[](source:fork-core) |
| `artifact-storage.md`는 보조 Markdown과 retained helper output을 `save_codex_security_artifact`로 저장하고 일반 파일 쓰기를 쓰지 말라고 한다. 스킬은 `source-inventory.md`와 `correctness-review.md`를 "workspace"에 저장하라고 한다. 이 파일들이 어느 규칙을 따르는지는 원문에 명시 없음이다.[](source:art-supp)[](source:inv-when)[](source:rev-obl) |
| 리뷰어가 `PASS` 기록을 실제로 남기는지, 어느 환경에서 browser QA가 통과하는지는 실행으로 확인하지 않았다. |

설치 기록에서 출처는 `openai/codex-security`이고 `skillPath`는 `plugins/codex-security/skills/threat-model-visualize/SKILL.md`다.[](source:lock) 분석 중 원본 파일은 바뀌지 않았다.
