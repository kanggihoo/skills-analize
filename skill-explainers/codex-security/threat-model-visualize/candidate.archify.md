# threat-model-visualize는 기존 위협 모델을 어떤 검증을 거쳐 explorer로 바꾸나? {#tmv-page}

`threat-model-visualize`는 새 평가를 하지 않는다. 이미 있는 위협 모델 문서만 읽어 근거가 붙은 standalone HTML `explorer`로 바꾼다. 원문에 없는 구조·권한·통제·도달 가능성을 만들지 못하게 하고, 독립 리뷰의 `PASS` 기록이 있어야 browser QA로 넘어간다.[](source:purpose)[](source:req)[](source:rev-receipt)

- 새 scan, 새 assessment, 애플리케이션 코드 검사는 하지 않는다. 입력 문서는 바꾸지 않는다.[](source:req)
- 그림을 계획하기 전에 `source-inventory.md`를 먼저 저장하고 근거를 맞춰 본다.[](source:inv-when)
- 작성자가 아니라 새 맥락의 리뷰어가 JSON의 주장을 반증하려 하고, 그 결과를 `correctness-review.md`에 남긴다.[](source:rev-when)[](source:rev-receipt)
- `build_explorer.py`는 구조와 인용 일치만 검사한다. 주장이 참인지, 읽기 쉬운지는 검사하지 못한다.[](source:qa)

@answer scope="지시문·계약·builder 전체 읽음 · 렌더러 assets는 표본만 확인 · 스크립트 실행 없음"
@meta locale=ko
@source skill title="codex-security/threat-model-visualize/SKILL.md · 19102B · 원본(전부 읽음)" path=codex-security/threat-model-visualize/SKILL.md
@source fm title="codex-security/threat-model-visualize/SKILL.md · 19102B · frontmatter" path=codex-security/threat-model-visualize/SKILL.md lines=1:4
@source purpose title="codex-security/threat-model-visualize/SKILL.md · 19102B · 목적과 팔레트" path=codex-security/threat-model-visualize/SKILL.md lines=8:8
@source req title="codex-security/threat-model-visualize/SKILL.md · 19102B · 요청 해석과 입력 규칙" path=codex-security/threat-model-visualize/SKILL.md lines=10:12
@source regen title="codex-security/threat-model-visualize/SKILL.md · 19102B · 재생성 규칙" path=codex-security/threat-model-visualize/SKILL.md lines=14:14
@source inv-when title="codex-security/threat-model-visualize/SKILL.md · 19102B · 1단계 시점과 저장" path=codex-security/threat-model-visualize/SKILL.md lines=18:18
@source inv-rec title="codex-security/threat-model-visualize/SKILL.md · 19102B · 1단계 기록·열거 항목" path=codex-security/threat-model-visualize/SKILL.md lines=20:25
@source inv-rev title="codex-security/threat-model-visualize/SKILL.md · 19102B · 1단계 검토와 완료 조건" path=codex-security/threat-model-visualize/SKILL.md lines=27:29
@source compose-arch title="codex-security/threat-model-visualize/SKILL.md · 19102B · 2단계 구성 원칙" path=codex-security/threat-model-visualize/SKILL.md lines=33:37
@source compose-cover title="codex-security/threat-model-visualize/SKILL.md · 19102B · 2단계 커버리지" path=codex-security/threat-model-visualize/SKILL.md lines=39:39
@source compose-bind title="codex-security/threat-model-visualize/SKILL.md · 19102B · 2단계 근거 묶기와 행위자" path=codex-security/threat-model-visualize/SKILL.md lines=41:41
@source compose-ctrl title="codex-security/threat-model-visualize/SKILL.md · 19102B · 2단계 통제 표시" path=codex-security/threat-model-visualize/SKILL.md lines=43:43
@source rev-when title="codex-security/threat-model-visualize/SKILL.md · 19102B · 3단계 시점과 리뷰어" path=codex-security/threat-model-visualize/SKILL.md lines=47:47
@source rev-obl title="codex-security/threat-model-visualize/SKILL.md · 19102B · 3단계 의무 목록과 선택 해석" path=codex-security/threat-model-visualize/SKILL.md lines=49:51
@source rev-modes title="codex-security/threat-model-visualize/SKILL.md · 19102B · 3단계 반증 항목 다섯 개" path=codex-security/threat-model-visualize/SKILL.md lines=53:57
@source rev-find title="codex-security/threat-model-visualize/SKILL.md · 19102B · 3단계 지적 형식과 수정 확인" path=codex-security/threat-model-visualize/SKILL.md lines=59:61
@source rev-receipt title="codex-security/threat-model-visualize/SKILL.md · 19102B · 3단계 PASS 기록" path=codex-security/threat-model-visualize/SKILL.md lines=63:65
@source build title="codex-security/threat-model-visualize/SKILL.md · 19102B · 4단계 빌드 명령" path=codex-security/threat-model-visualize/SKILL.md lines=69:73
@source browser title="codex-security/threat-model-visualize/SKILL.md · 19102B · 4단계 browser 선택과 HTTP preview" path=codex-security/threat-model-visualize/SKILL.md lines=75:77
@source warn title="codex-security/threat-model-visualize/SKILL.md · 19102B · 4단계 connector 경고" path=codex-security/threat-model-visualize/SKILL.md lines=79:79
@source qa title="codex-security/threat-model-visualize/SKILL.md · 19102B · 4단계 browser 검사" path=codex-security/threat-model-visualize/SKILL.md lines=81:81
@source deliver title="codex-security/threat-model-visualize/SKILL.md · 19102B · 4단계 전달" path=codex-security/threat-model-visualize/SKILL.md lines=83:83
@source vm-head title="codex-security/threat-model-visualize/references/view-model.md · 12062B · view-model 계약(전부 읽음)" path=codex-security/threat-model-visualize/references/view-model.md lines=3:9
@source vm-map title="codex-security/threat-model-visualize/references/view-model.md · 12062B · map 계약" path=codex-security/threat-model-visualize/references/view-model.md lines=13:19
@source vm-route title="codex-security/threat-model-visualize/references/view-model.md · 12062B · scenario와 route" path=codex-security/threat-model-visualize/references/view-model.md lines=23:27
@source vm-src title="codex-security/threat-model-visualize/references/view-model.md · 12062B · source 역할" path=codex-security/threat-model-visualize/references/view-model.md lines=31:35
@source vm-ctrl title="codex-security/threat-model-visualize/references/view-model.md · 12062B · control과 effect" path=codex-security/threat-model-visualize/references/view-model.md lines=37:43
@source vm-evid title="codex-security/threat-model-visualize/references/view-model.md · 12062B · evidence와 export" path=codex-security/threat-model-visualize/references/view-model.md lines=47:49
@source ce-palette title="codex-security/threat-model-visualize/references/context-explorer.md · 5636B · 표현 지침(전부 읽음)" path=codex-security/threat-model-visualize/references/context-explorer.md lines=3:3
@source ce-prop title="codex-security/threat-model-visualize/references/context-explorer.md · 5636B · 제안 통제 표기" path=codex-security/threat-model-visualize/references/context-explorer.md lines=11:11
@source ce-qa title="codex-security/threat-model-visualize/references/context-explorer.md · 5636B · QA 실패 기준" path=codex-security/threat-model-visualize/references/context-explorer.md lines=17:21
@source py-top title="codex-security/threat-model-visualize/scripts/build_explorer.py · 27557B · builder(전부 읽음, 실행 안 함)" path=codex-security/threat-model-visualize/scripts/build_explorer.py lines=1:10
@source py-ctrl title="codex-security/threat-model-visualize/scripts/build_explorer.py · 27557B · control 검사" path=codex-security/threat-model-visualize/scripts/build_explorer.py lines=330:463
@source py-evid title="codex-security/threat-model-visualize/scripts/build_explorer.py · 27557B · 인용·hash 검사" path=codex-security/threat-model-visualize/scripts/build_explorer.py lines=464:496
@source py-warn title="codex-security/threat-model-visualize/scripts/build_explorer.py · 27557B · connector 경고" path=codex-security/threat-model-visualize/scripts/build_explorer.py lines=526:537
@source py-main title="codex-security/threat-model-visualize/scripts/build_explorer.py · 27557B · main" path=codex-security/threat-model-visualize/scripts/build_explorer.py lines=540:586
@source yaml title="codex-security/threat-model-visualize/agents/openai.yaml · 259B · 표시 이름과 기본 prompt" path=codex-security/threat-model-visualize/agents/openai.yaml
@source html title="codex-security/threat-model-visualize/assets/explorer.html · 2673B · HTML 틀(전부 읽음)" path=codex-security/threat-model-visualize/assets/explorer.html
@source fx title="codex-security/threat-model-visualize/assets/control-effects.js · 4005B · 통제 효과 계산(전부 읽음)" path=codex-security/threat-model-visualize/assets/control-effects.js
@source rp title="codex-security/threat-model-visualize/assets/route-paths.js · 3648B · route 도달 계산(전부 읽음)" path=codex-security/threat-model-visualize/assets/route-paths.js
@source sr-js title="codex-security/threat-model-visualize/assets/source-roles.js · 2762B · source 역할 팔레트(전부 읽음)" path=codex-security/threat-model-visualize/assets/source-roles.js
@source ex-js title="codex-security/threat-model-visualize/assets/explorer.js · 42283B · 구조·표본만 확인(전부 읽지 않음)" path=codex-security/threat-model-visualize/assets/explorer.js lines=335:372
@source svg-js title="codex-security/threat-model-visualize/assets/svg-layout.js · 11530B · 구조·표본만 확인(전부 읽지 않음)" path=codex-security/threat-model-visualize/assets/svg-layout.js lines=1:12
@source css title="codex-security/threat-model-visualize/assets/explorer.css · 12126B · 구조·표본만 확인(전부 읽지 않음)" path=codex-security/threat-model-visualize/assets/explorer.css lines=1:3
@source svg-ov title="codex-security/threat-model-visualize/assets/context-reference-overview.svg · 36850B · 구조·표본만 확인(전부 읽지 않음)" path=codex-security/threat-model-visualize/assets/context-reference-overview.svg lines=1:8
@source svg-path title="codex-security/threat-model-visualize/assets/context-reference-path.svg · 60788B · 구조·표본만 확인(전부 읽지 않음)" path=codex-security/threat-model-visualize/assets/context-reference-path.svg lines=1:8
@source tm title="codex-security/threat-model/SKILL.md · 2986B · 관계 확인용 일부(23:27)" path=codex-security/threat-model/SKILL.md lines=23:27
@source scan-res title="codex-security/security-scan/references/scan-results.md · 2871B · 관계 확인용 일부(1:10)" path=codex-security/security-scan/references/scan-results.md lines=7:7
@source lock title="codex-security/skills-lock.json · 설치 출처 항목(106:111만)" path=codex-security/skills-lock.json lines=106:111

## 언제 켜지고 무엇을 입력으로 받나? {#activation}

`description`은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻이 아니다. 호출 제한 필드(`disable-model-invocation` 등)는 `SKILL.md`에 원문에 명시 없음이다.[](source:fm)

@code source=fm language=yaml

`agents/openai.yaml`에는 표시 이름 `Threat Model Explorer`, 짧은 설명, 기본 prompt만 있다. `policy` 필드는 원문에 명시 없음이다.[](source:yaml)

| 입력과 요청 | 에이전트의 처리 |
|---|---|
| 원문 예시 "Visualize the threat model generated in the last scan of X" | 이 한 문장으로 충분하다. 대상, 최신 assessment, snapshot을 스스로 찾는다.[](source:req) |
| 최신 artifact가 없을 때 | 오래된 artifact를 쓰기 전에 그 사실을 먼저 알린다.[](source:req) |
| 기본 입력 | 기존 위협 모델 artifact다. 완료된 scan 전체를 자동으로 가져오지 않는다.[](source:req) |
| 입력 보존 | 입력은 바꾸지 않는다. snapshot끼리 조용히 합치지 않는다.[](source:req) |
| 문서를 여러 개 명시적으로 준 경우 | 파생 문서 하나를 `--assessment`로 넘긴다. 발췌마다 출처, snapshot, 원래 상태를 적고 충돌하는 설명과 원본을 보존한다.[](source:req) |
| 재생성 요청 | 새 view model을 처음부터 쓴다. 이전 모델이나 HTML을 복사하거나 고치지 않는다. 일반 수정은 기존 모델을 쓸 수 있고, renderer만 다듬는 일은 재생성이 아니다.[](source:regen) |

| 요청 | 이 스킬에 맞나 |
|---|---|
| 이미 있는 위협 모델을 구조와 위협 경로로 보여 달라 | 맞다 {good:대상} |
| 위협 모델이 없어서 새로 만들어 달라 | 맞지 않다 {bad:범위 밖}. 이 스킬은 새 assessment와 새 scan을 하지 않는다.[](source:req) |
| 사이트로 호스팅하거나 게시해 달라 | 사용자가 명시적으로 요청할 때만 한다 {caution:요청 필요}. 시각화나 preview 요청만으로는 부족하다.[](source:deliver) |
| 정적 이미지가 필요하다 | 같은 선택 상태의 SVG나 PNG를 쓴다.[](source:deliver) |

판정 · 이 스킬은 위협 모델의 저자가 아니라 번역자 역할이다. 원문이 새 평가를 금지하고 근거 없는 보충을 막기 때문이다.[](source:req)[](source:inv-rev)

## 어떤 순서로 만들고, 어디서 멈추나? {#phases}

@workflow id=phase-flow title="원본 목록화에서 전달까지"
| lane s1 | 1 원본 목록화 |
| lane s2 | 2 모델 작성 |
| lane s3 | 3 독립 리뷰 |
| lane s4 | 4 빌드·검사·전달 |
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
| qa > draft | browser 없음 | dashed |

@steps id=phase-steps
| inv | 원본 목록화 | 그림 계획, 묶음, route, geometry, JSON보다 먼저 `source-inventory.md`를 저장한다. 평가 문서의 식별 정보, 파일 hash, 범위를 적는다. 항목에는 의미 ID와 근거 span이나 정확한 인용을 붙이고 시각 node·edge ID는 붙이지 않는다.[](source:inv-when)[](source:inv-rec) | phase-flow | inv |
| compose | 모델 작성 | `view-model.md`와 `context-explorer.md`를 읽고 JSON과 geometry를 쓴다. 기본은 standard다. 위협을 얹기 전에 읽을 수 있는 아키텍처 개요부터 만든다.[](source:compose-arch) | phase-flow | compose |
| review | 독립 리뷰 | browser, preview server, export 시험보다 먼저 끝낸다. 정적 빌드와 구조 검증은 리뷰 대기 중에도 돌릴 수 있다. 새 맥락 리뷰어를 쓰고 작성자의 결론과 스크린샷은 넘기지 않는다.[](source:rev-when) | phase-flow | review |
| pass | PASS 기록? | 리뷰어가 시각, time zone, assessment와 JSON hash가 든 `PASS` 또는 `REVISION REQUIRED`를 `correctness-review.md`에 쓴다. 작성자는 저장된 JSON hash가 기록과 같은지 확인한 뒤 넘어간다.[](source:rev-receipt) | phase-flow | pass |
| build | HTML 빌드 | `python3.12`로 builder를 돌린다. connector 경고를 읽고 node를 옮겼으면 bend와 port를 맞춘 뒤 다시 빌드한다.[](source:build)[](source:warn) | phase-flow | build |
| qa | browser QA | 허용된 headless browser로 overview, 선택 시나리오, 대표 통제를 데스크톱 폭에서 본다. offline 로딩과 SVG export도 확인한다.[](source:browser)[](source:qa) | phase-flow | qa |
| out | 로컬 HTML 전달 | 기본 전달물은 로컬 standalone HTML이다. 사이트 게시는 사용자가 명시적으로 요청할 때만 한다.[](source:deliver) | phase-flow | out |
| draft | 미완 표시 전달 | 필수 수정이 남았거나 허용된 browser가 없으면 초안임을 표시해 전달한다. 미해결 지적과 미완 browser QA를 함께 적는다.[](source:rev-receipt)[](source:browser) | phase-flow | draft |

| 파일 | 만드는 주체 | 내용 |
|---|---|---|
| `source-inventory.md` | 작성자 | 평가 문서 식별 정보와 hash, 의미 ID가 붙은 근거 항목, 근거 정정, 미해결 공백.[](source:inv-rec)[](source:inv-rev) |
| `correctness-review.md` | 리뷰어 | source에서 뽑은 의무 목록, 선택별 해석, 지적, 확인된 수정, 시각이 찍힌 `PASS` 또는 `REVISION REQUIRED`.[](source:rev-obl)[](source:rev-receipt) |
| 모델 JSON | 작성자 | 노드, 간선, 시나리오, 근거, 명시적 geometry.[](source:vm-head) |
| explorer HTML | builder | 모델, 평가 문서 전체, 모든 asset을 담은 파일 하나. SVG export도 이 파일에서 나온다.[](source:vm-evid)[](source:py-main) |

모델 수정 메모와 리뷰 판정은 `source-inventory.md`가 아니라 `correctness-review.md`에 둔다.[](source:inv-rev) browser에서 JSON을 고쳤다면 영향받은 선택을 다시 점검하고 바뀐 hash의 새 기록을 받는다. 처음의 browser 이전 기록도 남겨 순서를 볼 수 있게 한다. CSS만 바꿨다면 시각 QA만 한다.[](source:rev-receipt)

## 무엇을 강제하고 금지하며, 누가 확인하나? {#rules}

| 대상 | 강제와 금지 |
|---|---|
| 근거 | 위상, 권한, 통제, 도달 가능성, 검증을 지어내지 않는다. 저장소 기본값을 배포 설정의 증거로 쓰지 않는다. 가설, finding, 선언된 통제, 관찰된 집행을 구분한다.[](source:req) |
| 시작 행위자 | 실제 시작 actor나 입력과 최소 권한을 모델링한다. 신뢰된 운영자는 평가가 오남용이나 침해를 명시할 때만 위협 source로 삼는다. 악의 가정은 근거가 아니다.[](source:compose-bind)[](source:vm-src) |
| 통제 소유자 | `control.nodes`는 집행 주체다. 집행 주체를 모르면 `nodes:[]`로 두고 공백을 밝힌다. runtime, syscall, mount 제한은 제한받는 프로세스를 집행 주체로 표시하지 않는다.[](source:vm-ctrl) |
| 제안 통제 | `Proposed control`로 표시하고 효과는 "Would block", "Would limit"처럼 조건부로 쓴다. 배포됐거나 검증된 것처럼 보이면 안 된다.[](source:compose-ctrl)[](source:ce-prop) |
| 통제 효과 | `outcome`은 `blocks`, `limits`, `detects`, `does-not-block`, `unknown`이다. 확인되지 않은 효과는 막을 수 없다. 제안은 `hypothetical`이어야 한다.[](source:vm-ctrl) |
| 선택 범위 | 한 선택은 자기 관계와 통제만 강조하고 나머지는 흐리게 둔다. 각 대안 권한을 따로 대응시키거나 근거 있는 제외로 적는다.[](source:compose-arch)[](source:compose-cover) |
| 색 | 고정 팔레트를 쓴다: adversary 빨강, compromised component 자주, untrusted input 복숭아, unknown 회색, authorized use 파랑. 경로는 주황이다. 경유만으로 약점이 되지 않는다.[](source:ce-palette)[](source:sr-js) |

@facts
| fidelity | `simple`, `standard`(기본), `detailed`. 주장은 바뀌지 않는다.[](source:compose-cover) |
| shell 글자 크기 | node 제목 17, 부제 14, connector 라벨 13 단위. 핵심 글자는 약 11 CSS px 이상을 목표로 한다.[](source:vm-map) |
| 화살표 끝 직선 | 약 14 단위 이상.[](source:vm-map) |
| 통제 marker | `0 < at < 1`, 폭 180 이상, 초기 높이 72 단위가 canvas 안에 들어와야 한다.[](source:vm-ctrl) |
| builder 실행 환경 | Python 3.12 이상, 표준 라이브러리만 쓴다.[](source:py-top)[](source:vm-head) |

리뷰어는 모델을 확인하려 하지 않고 반증하려 한다. 아래 다섯 항목 가운데 어느 것이든 실패하면 지적한다.[](source:rev-when)[](source:rev-modes)

| 반증 항목 | 리뷰어가 확인하는 것 |
|---|---|
| 권한과 전제 | 독립적으로 충분한 진입 조건마다 선택이나 정당한 제외가 있는가. 자격 증명이 프로세스 침해로, capability가 계정 세션 요구로 바뀌지 않았는가.[](source:rev-modes) |
| 통제 소유자와 동작 | 통제마다 집행 주체, 제한받는 구성요소, 보호 동작, `control.nodes` 표시가 맞는가.[](source:rev-modes) |
| 효과와 도달 | 차단 미리보기가 실제 `step`, `edge`, `arrival`로 닿는 node와 branch와 맞는가. 설명뿐인 효과가 장벽이 되지 않았는가.[](source:rev-modes) |
| 근거와 분류 | 인용이 같은 행, 같은 대상, 같은 소유자를 뒷받침하는가. 기존 장치, 제안, 목표, 주의를 구분했는가.[](source:rev-modes) |
| 선택과 커버리지 | "A 또는 B"를 "B"로 좁히지 않았는가. 빠진 진입점이나 남의 맥락에서 빌려온 강조가 없는가.[](source:rev-modes) |

- 리뷰어는 평가 문서와 contract 전체를 먼저 읽는다. `correctness-review.md`에 source에서 뽑은 의무 목록을 저장한 뒤에야 inventory와 JSON을 본다.[](source:rev-obl)
- 선택마다 실제 강조되는 node·edge ID를 풀어 정의와 대조한다.[](source:rev-obl)
- 지적마다 주장, JSON pointer, 근거 span, 불일치 설명이 있어야 한다.[](source:rev-find)
- 위임이 불가능하거나 실패했을 때만 자체 리뷰로 물러난다. 구체적 사유와 독립성 한계를 적고, 리뷰 대기는 사유가 아니다.[](source:rev-when)
- `PASS`는 필수 수정이 남지 않았다는 뜻이다. 선택 개선과 충실히 표현된 source 불확실성은 남을 수 있다.[](source:rev-receipt)

| 확인 주체 | 확인하는 것과 한계 |
|---|---|
| builder: 구조 | 참조 ID, route 연결, 인용이 평가 문서의 정확한 바이트인지, 줄 범위, `assessmentSha256`, 통제 효과 조건(확인 안 된 효과는 차단 불가, 제안은 hypothetical, 차단은 step과 marker 필요)을 검사한다. 실패하면 오류로 멈춘다.[](source:py-ctrl)[](source:py-evid){good:구조 검사} |
| builder: 경고 | 대각선 끝 구간과 node 내부를 지나는 connector를 경고로 출력한다. 빌드는 계속된다.[](source:py-warn)[](source:py-main){caution:경고만} |
| builder: 한계 | 주장의 진실과 시각적 명확성은 검사하지 않는다.[](source:qa)[](source:vm-head){bad:검사 안 함} |
| 렌더러 | 가장 이른 step의 차단 장벽을 고른다. 도착 전 차단이 도착 후 확인보다 앞서고, 같은 지점이면 existing이 proposed보다 앞선다. 도달은 명시된 route에서만 계산하고 그래프 근접성으로 추론하지 않는다.[](source:fx)[](source:rp) |
| 작성자의 browser QA | 본문 지시는 layout 진단, 글자와 component 겹침, 가려진 화살표를 QA 실패로 보고 게시 전에 풀라고 한다.[](source:ce-qa) |

## 다른 스킬과 어디에서 이어지나? {#position}

@workflow id=position-flow title="위협 모델 작성에서 시각화로"
| tm-node | threat-model | backend | source:tm |
| scan-node | security-scan | backend | source:scan-res |
| current | threat-model-visualize | frontend | source:req |
| tm-node > current | 호환 R42 | emphasis |
| scan-node > current | 호환 R43 | dashed |

@steps id=position-steps
| highlight | threat-model-visualize | 이 페이지의 스킬이다. 기존 위협 모델 문서를 읽기만 하고 새 평가를 하지 않는다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R42 · 산출물 호환 | `threat-model`이 단독 요청에서 `threatmodel.md`를 저장한다. 이 스킬은 그 기존 artifact를 기본 입력으로 받아 `--assessment`로 넘긴다. 필수 후속 단계는 아니다.[](source:tm)[](source:req)[](source:build) |
| R43 · 산출물 호환 | 마지막 scan의 위협 모델은 위 한 문장 요청으로 충분하다. 새 scan은 돌리지 않는다. 그 scan이 위협 모델을 남긴다는 문장은 `scan-results.md`에 canonical artifacts라고만 있고 `threatmodel.md`를 이름으로 지목하지 않는다. diff scan과 deep scan의 위협 모델도 같은 방식인지는 원문에 명시 없음이다.[](source:req)[](source:scan-res) |

전체 흐름은 색인 기준 `_group-threat-model-and-policy/threat-model-and-policy.html`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 전부 읽은 텍스트 | 9개, 77,704B. `SKILL.md`, `references/view-model.md`, `references/context-explorer.md`, `scripts/build_explorer.py`, `agents/openai.yaml`, `assets/explorer.html`, `assets/control-effects.js`, `assets/route-paths.js`, `assets/source-roles.js`.[](source:skill)[](source:py-top)[](source:html)[](source:fx) |
| 구조·표본만 확인(전부 읽지 않음) | 5개, 163,577B. `assets/explorer.js`는 앞 1,500바이트와 335~372줄(긴 줄은 앞 400자), `svg-layout.js`와 `explorer.css`는 앞 1,500바이트, svg 2개는 앞 600바이트와 `text` 요소 개수(45개와 68개)를 봤다. 외부 호출 키워드를 검색했으나 `fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, 저장소 접근은 없었다. 파일 내려받기는 Blob 링크로 한다.[](source:ex-js)[](source:svg-js)[](source:css)[](source:svg-ov)[](source:svg-path) |
| 관계 확인용 | 이 폴더 밖 파일 3개의 해당 줄만 읽었다. `threat-model/SKILL.md` 23~27줄, `scan-results.md` 앞 10줄, `skills-lock.json`의 이 스킬 항목이다.[](source:tm)[](source:scan-res)[](source:lock) |
| 제외 | 번역본은 없다. 바이너리는 없다. 두 svg는 텍스트 XML이지만 거대한 생성물이라 읽었다고 하지 않는다. |
| 실행 | `build_explorer.py`를 포함해 어떤 스크립트도 실행하지 않았다. browser 검사, 스킬이 가리키는 `rsvg-convert` 같은 명령도 하지 않았다.[](source:ce-qa) |

이 페이지에는 사람이 승인해야 한다고 적힌 단계가 없다. 사람이 개입하는 지점은 사이트 게시 요청, 대상 audience 지정, browser 사용을 허용하는 정책이다. 정책이 거부했다고 우회해도 된다는 뜻이 아니다.[](source:deliver)[](source:browser)

@callout level=open-question title="확인하지 못한 항목"
| 렌더러의 실제 동작(선택, 장벽 미리보기, 글자 배치, SVG export)은 `explorer.js`를 전부 읽거나 실행해 확인하지 않았다. |
| `SKILL.md`가 가리키는 "Sites workflow", "visualize integration", "shared workbench", `spawn_agent`의 `fork_turns` 옵션은 이 컬렉션에 없어 내용을 읽지 못했다. |
| 리뷰어가 `PASS` 기록을 실제로 남기는지, browser QA가 어느 환경에서 통과하는지는 실행으로 확인하지 않았다. |

관계 원장의 조사 상태는 `부분`으로 두었다. 원장이 앞서 일부만 봤던 `view-model.md`와 `build_explorer.py`는 이 분석에서 전부 읽었다. 분석 중 원본 파일은 바뀌지 않았고, 분석 커밋은 `a1d836f`다.
