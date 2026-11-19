# egm-bootstrap — 디렉터리 트리 전체에 README 계약 파일을 쓴다 {#overview}

`egm-bootstrap`은 에이전트가 폴더 트리를 아래에서 위로 훑으며 폴더마다 Interface·Invariants·Side Effects를 적은 `README.md`를 만들거나 고치게 하는 스킬이다. 다만 부분 분석이다. 첫머리가 먼저 읽으라는 `docs/codex.md`와 서브에이전트 정의 `agents/bootstrap_orchestrator.md`가 저장소에 없다.[](source:overview)

- 사용자가 `path`로 폴더를 지정해 직접 부른다. 모델이 알아서 켜지 않는다. 하위 폴더가 5개 이하면 현재 대화에서 직접 쓰고, 5개를 넘으면 워커를 병렬로 띄운다.[](source:fm)[](source:strategy)
- 결과는 폴더마다 하나씩 생긴 계약 파일(기본 `README.md`)이다. 소스 코드는 바뀌지 않는다.[](source:constraints)
- 다른 스킬과의 관계: 끝나면 `egm-drift-report`를 쓸지 *다음 안내*로 묻고, 워커 모드에서는 자신을 *호출*한다.
- 하지 않는 것: 소스 코드 작성·수정, `git commit`·`git add`. 저장은 사용자에게 맡긴다.[](source:constraints)

@answer scope="egm/egm-bootstrap · 원본 파일 7개 · 지시상 동작 · 부분 분석"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source overview title="스킬 개요와 선행 문서 지시" path=egm/egm-bootstrap/SKILL.md lines=8:24
@source fm title="frontmatter" path=egm/egm-bootstrap/SKILL.md lines=1:6
@source constraints title="실행 제약" path=egm/egm-bootstrap/SKILL.md lines=49:68
@source inputs title="입력 인자" path=egm/egm-bootstrap/SKILL.md lines=37:47
@source delegation title="서브에이전트 띄우는 방법" path=egm/egm-bootstrap/SKILL.md lines=26:35
@source step0 title="0단계 검증 명령 찾기" path=egm/egm-bootstrap/SKILL.md lines=74:84
@source step1 title="1단계 시작 분기" path=egm/egm-bootstrap/SKILL.md lines=88:94
@source step2 title="2단계 탐색·승인·가지치기" path=egm/egm-bootstrap/SKILL.md lines=98:152
@source strategy title="3단계 실행 방식 선택" path=egm/egm-bootstrap/SKILL.md lines=156:198
@source worker title="4단계 하위 트리 처리" path=egm/egm-bootstrap/SKILL.md lines=202:336
@source finish title="5단계 루트 조립·검증·종료" path=egm/egm-bootstrap/SKILL.md lines=340:418
@source drift title="선택 드리프트 검토" path=egm/egm-bootstrap/SKILL.md lines=402:416
@source docs title="선행 문서 지시" path=egm/egm-bootstrap/SKILL.md lines=10:11
@source templates title="README 템플릿 세 종" path=egm/egm-bootstrap/references/templates.md lines=6:68
@source schema title="워커 반환 schema" path=egm/egm-bootstrap/references/worker-return.schema.json lines=1:20
@source manual title="수동 검증 시나리오" path=egm/egm-bootstrap/TEST.md lines=5:16
@source scenarios title="평가 시나리오" path=egm/egm-bootstrap/test_scenarios.yaml lines=18:74

## 어떻게 동작하나 {#flow span=12}

절차형이다. 흐름은 네 국면이다. 준비, 범위 정하기, 계약 파일 쓰기, 마무리 순서다. 그림이 생략한 것이 셋 있다. 워커로 실행되면(`is_worker=true`) 2·3단계를 건너뛰고 [폴더별 계약 파일 쓰기](node:flow-diagram.post)로 바로 간다. 폴더가 15개를 넘으면 승인 전까지 멈춘다. 워커는 반환 JSON을 루트에 넘기고 끝난다. 승인 질문은 [폴더 15개 초과?](node:flow-diagram.gate)에 있다.

@workflow id=flow-diagram title="egm-bootstrap 흐름"
| lane prep | 준비 |
| lane scope | 범위 정하기 |
| lane write | 계약 파일 쓰기 |
| lane finish | 마무리 |
| env | 검증 명령 찾기 | backend | prep | source:step0 |
| mode | 워커로 실행됨? | backend | prep | source:step1 |
| bfs | 폴더 탐색 | backend | scope | source:step2 |
| gate | 폴더 15개 초과? | security | scope | source:step2 |
| abort | 중단 | external | scope | source:step2 |
| prune | 가지치기 | backend | scope | source:step2 |
| split | 5개 초과? | backend | write | source:strategy |
| direct | 현재 스레드 직접 | backend | write | source:strategy |
| spawn | 워커 병렬 실행 | cloud | write | source:strategy |
| post | 폴더별 계약 파일 쓰기 | backend | write | source:worker |
| root | 루트 조립 | backend | finish | source:finish |
| verify | 최종 검증 | security | finish | source:finish |
| ask | 드리프트 검토 질문 | external | finish | source:drift |
| env > mode | |
| mode > bfs | 아니오(루트) |
| bfs > gate | |
| gate > abort | 거절 |
| gate > prune | 아니오 또는 승인 |
| prune > split | |
| split > spawn | 5개 초과 |
| spawn > post | 파티션마다 |
| split > direct | 5개 이하 |
| direct > post | |
| post > root | 트리 완료 |
| root > verify | |
| verify > ask | |

@steps id=flow-steps
| s-env | 검증 명령 찾기 | **입력** 저장소 루트 · **참조** `package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`, `Makefile`, `BUILD` · **출력** `VerificationCommand`. **처리** 매니페스트를 보고 테스트 명령(`npm test`, `cargo test`, `go test ./...`, `pytest`, `make test`, `bazel test //...`)을 정해 계약 파일의 Verification 칸에 쓴다. 찾지 못하면 `<test-command>`로 둔다.[](source:step0) | flow-diagram | env |
| s-mode | 워커로 실행됨? | **입력** `is_worker` 인자 · **출력** 역할(루트 또는 워커). **처리** `true`면 2·3단계를 건너뛰고 바로 4단계(폴더별 계약 파일 쓰기)로 간다. 그림에는 이 간선이 없다. 아니면 루트 오케스트레이터로 진행한다.[](source:step1) | flow-diagram | mode |
| s-bfs | 폴더 탐색 | **입력** `path` · **참조** `.gitignore`, `.egmignore` · **출력** 폴더 발견 지도. **처리** 한 번에 한 레벨씩 BFS(너비 우선 탐색)로 폴더를 찾는다. `find`나 `ls -R` 같은 재귀 검색은 금지다. symlink와 `.git`, `node_modules`, `venv`, `dist`, `build`, `third_party` 같은 숨김·시스템 폴더는 건너뛴다.[](source:step2) | flow-diagram | bfs |
| s-gate | 폴더 15개 초과? | **입력** 발견한 폴더 누적 수 · **출력** 승인 여부. **처리** 15개를 넘으면 탐색을 멈추고 사용자에게 전체 실행 여부를 묻는다. 응답 전에는 워커를 띄우지 않는다.[](source:step2) **다음** 거절하면 즉시 종료한다. | flow-diagram | gate |
| s-abort | 중단 | **입력** 사용자의 거절 · **출력** 없음. **처리** 아무 파일도 쓰지 않고 실행을 끝낸다.[](source:step2) | flow-diagram | abort |
| s-prune | 가지치기 | **입력** 폴더 지도 · **출력** 정리 대상 폴더 수와 최대 깊이. **처리** 리프에서 루트 쪽으로 걸으며 소스 파일이 없는 폴더와 테스트만 든 폴더를 뺀다. 코드가 든 하위 폴더가 있는 빈 중간 폴더는 남긴다.[](source:step2) | flow-diagram | prune |
| s-split | 5개 초과? | **입력** 가지친 폴더 수 · **출력** 실행 방식. **처리** 5개 이하면 현재 스레드가 직접 쓴다. 5개를 넘으면 트리를 파티션으로 나눈다.[](source:strategy) **다음** 15개를 넘는데 승인을 못 받았으면 승인부터 받는다. | flow-diagram | split |
| s-direct | 현재 스레드 직접 | **입력** 가지친 폴더 5개 이하 · **출력** 루트를 워커로 본 실행 흐름. **처리** 루트 오케스트레이터가 전체 `path`를 워커처럼 직접 처리한다. 끝나면 마무리 국면으로 간다.[](source:strategy) | flow-diagram | direct |
| s-spawn | 워커 병렬 실행 | **입력** 파티션 루트 · **참조** `agents/bootstrap_orchestrator.md` · **출력** 워커의 `subtree_index` JSON. **처리** 파티션마다 `is_worker=true`로 워커를 띄우고, 동시 실행 수는 제한하지 않는다. 모두 끝날 때까지 기다린다.[](source:strategy) | flow-diagram | spawn |
| s-post | 폴더별 계약 파일 쓰기 | **입력** 폴더 `D` · **참조** `references/templates.md`, `references/worker-return.schema.json` · **출력** `D`의 계약 파일, 워커면 `subtree_index` JSON. **처리** 리프부터 `goldfish-explorer` 스캔으로 코드 심볼을 모으고 Peanut 또는 Hay 템플릿으로 쓴다. 이미 있는 파일은 통째로 덮지 않고 고친다.[](source:worker) **다음** 워커는 JSON을 루트에 돌려주고 끝낸다. 스캔이 실패하면 자리표시 문구로 두고 계속한다. | flow-diagram | post |
| s-root | 루트 조립 | **입력** 워커 payload · **출력** 중간 폴더와 루트의 계약 파일. **처리** 워커가 돌려준 요약으로 중간 폴더를 아래에서 위로 쓰고, 루트는 항상 Hay 템플릿으로 쓴다.[](source:finish) **다음** 워커가 실패하거나 시간 초과면 루트 인덱스에 경고 링크를 넣고 나머지를 마친다. | flow-diagram | root |
| s-verify | 최종 검증 | **입력** 만들거나 고친 계약 파일 전부 · **출력** 검증 결과. **처리** 모든 파일을 하나씩 직접 읽어 Interface·Invariants·Side Effects 존재, 코드 근거, 링크 대상 파일 존재, Bazel 대상 문법을 확인한다. 깨진 링크는 고치거나 뺀다.[](source:finish) | flow-diagram | verify |
| s-ask | 드리프트 검토 질문 | **입력** 수정한 계약 파일 목록 · **참조** `egm-drift-report` · **출력** 사용자 선택. **처리** 드리프트 검토를 돌릴지 묻는다. 예를 고르면 `egm-drift-report`를 실행한다.[](source:drift) **다음** 아니오면 건너뛰고 종료한다. | flow-diagram | ask |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자가 스킬 이름으로 부른다. `disable-model-invocation: true`라서 모델이 `description`만 보고 켜지 않는다.[](source:fm) |
| 성격 | 폴더 트리를 훑어 README 계약 파일을 쓰는 오케스트레이션 스킬 |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#r16} | egm-bootstrap-orchestrator | 호출 | 정리 대상 폴더가 5개를 넘으면 파티션마다 병렬로 띄운다. 일반 서브에이전트로 대신해도 된다. 15개를 넘으면 사용자 승인 뒤에만 띄운다.[](source:strategy) |
| **이 스킬** {#r17} | **이 스킬** | 호출 | `is_worker=true`로 다시 실행되면 4단계만 하고 `subtree_index` JSON을 루트에 돌려준 뒤 끝낸다.[](source:step1)[](source:schema) |
| **이 스킬** {#r20} | egm-drift-report | 다음 안내 | 5단계 끝에 사용자에게 묻는다. 예를 고르면 수정한 계약 파일에 실행한다. 선택은 사용자 몫이고 의무가 아니다.[](source:drift) |
| **이 스킬** {#r26} | docs/codex.md | 참고 | 의무형이다. Codex·ChatGPT Work에서는 이 문서를 먼저 읽으라고 한다. Claude Code에서는 `docs/claude.md`다. 저장소에 `docs/`가 없어 확인하지 못했다.[](source:docs) |

@architecture id=relation-map title="egm-bootstrap과 이어지는 스킬"
| doc | docs/codex.md | external |
| self | egm-bootstrap(이 스킬) | backend |
| orch | egm-bootstrap-orchestrator | backend |
| drift | egm-drift-report | backend |
| self > doc | 참고 |
| self > orch | 호출 |
| self > drift | 다음 안내 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 입력, 제약, 0~5단계 지시 | 스킬이 켜질 때 | 모든 단계 |
| `references/templates.md` | Peanut·Hay·중간 Blueprint README 템플릿 세 종[](source:templates) | 계약 파일을 쓰기 전에 읽는다 | 폴더별 계약 파일 쓰기, 루트 조립 |
| `references/worker-return.schema.json` | 워커가 돌려줄 `subtree_index` JSON의 모양 | 워커가 반환 직전에 읽는다 | 폴더별 계약 파일 쓰기 |
| `test_scenarios.yaml` | 작은 트리, 안전 게이트, 코드 근거, Bazel 문법을 보는 평가 시나리오 4개[](source:scenarios) | 스킬 실행에는 쓰이지 않는다 | 해당 없음 |
| `TEST.md` | 수동 검증 시나리오 3개[](source:manual) | 스킬 실행에는 쓰이지 않는다 | 해당 없음 |
| `agents/openai.yaml` | 표시 이름 `EGM Bootstrap`과 아이콘 등 UI 메타데이터 | 스킬 실행에는 쓰이지 않는다 | 해당 없음 |
| `assets/icon.svg` | 아이콘(구조만 확인) | 스킬 실행에는 쓰이지 않는다 | 해당 없음 |
| `agents/bootstrap_orchestrator.md` | 워커의 서브에이전트 정의. 파일이 없어 확인하지 못했다 | 워커를 띄울 때 | 워커 병렬 실행 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 폴더 발견 수가 15개를 넘음 | 탐색을 멈추고 사용자 승인을 받는다. 승인 전에는 워커를 띄우지 않는다. 거절하면 즉시 종료한다. | [](source:step2) |
| 가지친 폴더가 5개 이하 | 워커 없이 현재 스레드가 직접 쓴다. | [](source:strategy) |
| 가지친 폴더가 5개 초과 | 파티션마다 워커를 띄운다. 15개 초과면 승인이 선행 조건이다. | [](source:strategy) |
| 소스 코드 작성·리팩터링 | 금지. 문서만 쓴다. | [](source:constraints) |
| `git commit`, `git add` | 금지. 변경은 로컬 파일로만 남기고 저장은 사용자에게 맡긴다. | [](source:constraints) |
| 상태·체크포인트·로그 파일 | 워크스페이스 밖의 워커별 폴더(`mktemp -d` 등)에만 둔다. 고정된 공유 경로는 금지다. 둘 다 없으면 만들지 않는다. | [](source:constraints) |
| 재귀 검색(`find`, `ls -R`) | 금지. 한 레벨씩 나열한다. | [](source:step2) |
| 이미 있는 계약 파일 | 통째로 덮어쓰지 않고, 개발자 메모를 보존하며 EGM 형식으로 고친다. | [](source:worker) |
| 파일·스키마·플래그 이름만으로 추측 | 금지. 모든 항목에 `[file:symbol_or_flag]` 근거를 달고, 없으면 `["None"]`을 쓴다. | [](source:worker) |
| 존재하지 않는 계약 파일로 링크 | 금지. 실제 파일이 있는 하위 폴더만 링크한다. | [](source:worker) |
| scout가 실패하거나 시간 초과 | 경고를 남기고 `["(Details pending/documentation failed)"]`로 두고 계속한다. | [](source:worker) |
| 워커가 실패하거나 시간 초과 | 루트 인덱스에 경고 링크를 넣고 나머지를 마친다. 다음 실행에서 이어 할 수 있다. | [](source:finish) |
| 마무리 단계 | 만들거나 고친 계약 파일을 모두 직접 읽어 검증해야 한다. 건너뛸 수 없다. | [](source:finish) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 파티션 나누기 알고리즘 — 워커 병렬 실행 · depth 1~3과 3~5개 기준, 5개 초과 때 3~4개 큰 가지와 나머지 묶음 규칙이 개요에는 너무 세부다.[](source:strategy)
- scout 스캔 규칙 — 폴더별 계약 파일 쓰기 · 1,500줄 단위 chunk, 읽는 순서, 템플릿·설정 200줄 제한(설정만 있는 폴더는 800줄), 테스트 파일 제외.[](source:worker)
- 기존 계약 파일 수정 정책 — 폴더별 계약 파일 쓰기 · 기존 내용에서 심볼을 뽑아 scout 결과와 합치는 절차.[](source:worker)
- 계약 파일 세 템플릿과 링크 규칙 — 폴더별 계약 파일 쓰기 · Peanut·Hay·중간 Blueprint의 칸과 상대·절대 링크 구분.[](source:templates)
- `target_filename`과 Bazel 대상 문법 — 검증 명령 찾기, 최종 검증 · `EGM.md` 같은 대체 파일 이름과 `//pkg/...`·`//pkg:all` 규칙.[](source:worker)

@callout level=open-question title="확인하지 못한 것"
| 부분 분석이다. `docs/codex.md`, `docs/claude.md`, `docs/harnesses.md`, `agents/bootstrap_orchestrator.md`는 원문이 가리키지만 이 저장소에 없다. 워커의 실제 지시는 확인하지 못했다. 15개 승인 지점은 발견 폴더 수(2단계)를, 5개 기준은 가지친 폴더 수(3단계)를 센다. 두 수가 다를 수 있다는 점은 원문이 따로 정리하지 않는다.[](source:docs) |

읽은 원본: 텍스트 파일 7개(`assets/icon.svg`는 구조만 확인). 제외: 번역본 `SKILL.ko.md`, `TEST.ko.md`, `references/templates.ko.md`.
