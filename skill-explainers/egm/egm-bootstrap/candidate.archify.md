# egm-bootstrap 스킬은 에이전트를 어떻게 바꾸나 {#egm-bootstrap-skill}

`egm-bootstrap`을 부르면 에이전트는 폴더 트리를 한 층씩 훑고, 코드가 든 폴더마다 README 계약 파일을 아래층부터 쓴다. 계약 파일에는 Interface, Invariants, Side Effects가 들어가고, 항목은 코드를 읽은 결과만 적는다. **부분 분석**: 서브에이전트 정의 파일과 `docs/*.md`가 이 저장소에 없어서 그 내용은 확인하지 못했다.[](source:bs-overview)[](source:bs-deleg)

- 사용자가 이름으로 불러야 켜진다. `description`을 보고 모델이 스스로 켜지 않는다.[](source:bs-fm)
- 코드를 쓰지 않고 `git commit`, `git add`도 하지 않는다. 문서 파일만 쓰고, 기록하고 올리는 일은 사용자에게 맡긴다.[](source:bs-c-code)[](source:bs-c-vcs)
- 폴더가 15개를 넘으면 사용자 승인을 받을 때까지 멈춘다. 코드가 든 폴더가 5개를 넘으면 서브트리마다 워커를 병렬로 띄운다.[](source:bs-gate)[](source:bs-swarm-cond)
- 서술은 `[파일:심볼]` 근거를 붙이고, 근거가 없으면 `["None"]`으로 쓴다. 끝나면 만든 계약 파일을 전부 다시 읽는다.[](source:bs-scout-reg)[](source:bs-final)

@answer scope="egm/egm-bootstrap · 텍스트 7개 · 커밋 d494974 · 실행 안 함 · 지시상 동작 · 부분 분석"
@meta locale=ko
@source bs-fm title="egm/egm-bootstrap/SKILL.md · 23764B · frontmatter" path=egm/egm-bootstrap/SKILL.md lines=1:6
@source bs-docs title="SKILL.md · 첫머리 안내(host 통합 문서)" path=egm/egm-bootstrap/SKILL.md lines=10:11
@source bs-overview title="SKILL.md · 개요와 Peanuts·Hay" path=egm/egm-bootstrap/SKILL.md lines=15:24
@source bs-deleg title="SKILL.md · Delegation" path=egm/egm-bootstrap/SKILL.md lines=28:35
@source bs-inputs title="SKILL.md · Inputs" path=egm/egm-bootstrap/SKILL.md lines=39:47
@source bs-c-code title="SKILL.md · 제약 1 코드 생성 금지" path=egm/egm-bootstrap/SKILL.md lines=51:52
@source bs-c-vcs title="SKILL.md · 제약 2 VCS 격리" path=egm/egm-bootstrap/SKILL.md lines=53:56
@source bs-c-tmp title="SKILL.md · 제약 3 임시 파일 격리" path=egm/egm-bootstrap/SKILL.md lines=57:59
@source bs-c-tool title="SKILL.md · 제약 4 도구 사용" path=egm/egm-bootstrap/SKILL.md lines=60:64
@source bs-c-spawn title="SKILL.md · 제약 5 서브에이전트 병렬" path=egm/egm-bootstrap/SKILL.md lines=65:65
@source bs-c-gate title="SKILL.md · 제약 6 안전 승인 지점" path=egm/egm-bootstrap/SKILL.md lines=66:68
@source bs-step0 title="SKILL.md · 0단계 검증 명령 찾기" path=egm/egm-bootstrap/SKILL.md lines=76:84
@source bs-step1 title="SKILL.md · 1단계 시작 분기" path=egm/egm-bootstrap/SKILL.md lines=90:94
@source bs-bfs title="SKILL.md · 2단계 BFS 탐색" path=egm/egm-bootstrap/SKILL.md lines=100:110
@source bs-gate title="SKILL.md · 2단계 15개 초과 승인" path=egm/egm-bootstrap/SKILL.md lines=112:124
@source bs-prune title="SKILL.md · 2단계 아래층부터 가지치기" path=egm/egm-bootstrap/SKILL.md lines=126:149
@source bs-count title="SKILL.md · 2단계 끝 폴더 수 계산" path=egm/egm-bootstrap/SKILL.md lines=151:152
@source bs-direct title="SKILL.md · 3단계 직접 실행(5개 이하)" path=egm/egm-bootstrap/SKILL.md lines=158:164
@source bs-swarm-cond title="SKILL.md · 3단계 병렬 워커(5개 초과)" path=egm/egm-bootstrap/SKILL.md lines=166:171
@source bs-partition title="SKILL.md · 3단계 파티션 알고리즘" path=egm/egm-bootstrap/SKILL.md lines=172:187
@source bs-spawn title="SKILL.md · 3단계 워커 띄우기" path=egm/egm-bootstrap/SKILL.md lines=188:198
@source bs-scout-reg title="SKILL.md · 4단계 goldfish-explorer 정의" path=egm/egm-bootstrap/SKILL.md lines=204:219
@source bs-correct title="SKILL.md · 4단계 기존 파일 보정 정책" path=egm/egm-bootstrap/SKILL.md lines=224:241
@source bs-scout-limit title="SKILL.md · 4단계 scout 범위와 읽는 순서" path=egm/egm-bootstrap/SKILL.md lines=243:266
@source bs-scout-fail title="SKILL.md · 4단계 scout 실패 처리" path=egm/egm-bootstrap/SKILL.md lines=267:269
@source bs-parent title="SKILL.md · 4단계 상위 폴더에 하위 요약 전달" path=egm/egm-bootstrap/SKILL.md lines=271:281
@source bs-verify-cmd title="SKILL.md · 4단계 검증 명령 채우기" path=egm/egm-bootstrap/SKILL.md lines=283:295
@source bs-classify title="SKILL.md · 4단계 폴더 분류와 템플릿" path=egm/egm-bootstrap/SKILL.md lines=296:306
@source bs-links title="SKILL.md · 4단계 링크 형식 규칙" path=egm/egm-bootstrap/SKILL.md lines=307:321
@source bs-format title="SKILL.md · 4단계 Markdown 정리" path=egm/egm-bootstrap/SKILL.md lines=323:326
@source bs-report title="SKILL.md · 4단계 워커 보고" path=egm/egm-bootstrap/SKILL.md lines=328:336
@source bs-root-fail title="SKILL.md · 5단계 워커 실패 처리" path=egm/egm-bootstrap/SKILL.md lines=342:351
@source bs-inter title="SKILL.md · 5단계 중간 폴더" path=egm/egm-bootstrap/SKILL.md lines=353:361
@source bs-root title="SKILL.md · 5단계 루트 폴더" path=egm/egm-bootstrap/SKILL.md lines=363:379
@source bs-final title="SKILL.md · 5단계 최종 검증" path=egm/egm-bootstrap/SKILL.md lines=381:400
@source bs-drift title="SKILL.md · 5단계 drift 점검 제안" path=egm/egm-bootstrap/SKILL.md lines=402:416
@source bs-end title="SKILL.md · 종료" path=egm/egm-bootstrap/SKILL.md lines=418:418
@source bs-tpl-ref title="SKILL.md · 템플릿 읽기 지시" path=egm/egm-bootstrap/SKILL.md lines=424:427
@source tpl-peanut title="egm/egm-bootstrap/references/templates.md · 2064B · Peanuts 템플릿" path=egm/egm-bootstrap/references/templates.md lines=11:31
@source tpl-hay title="references/templates.md · Hay 루트 템플릿" path=egm/egm-bootstrap/references/templates.md lines=33:56
@source tpl-inter title="references/templates.md · 중간 Blueprint 템플릿" path=egm/egm-bootstrap/references/templates.md lines=58:68
@source schema title="egm/egm-bootstrap/references/worker-return.schema.json · 568B · 워커 반환 스키마" path=egm/egm-bootstrap/references/worker-return.schema.json lines=1:20
@source ts-small title="egm/egm-bootstrap/test_scenarios.yaml · 3835B · 평가 시나리오" path=egm/egm-bootstrap/test_scenarios.yaml lines=19:29
@source ts-gate title="test_scenarios.yaml · 승인 지점 시나리오" path=egm/egm-bootstrap/test_scenarios.yaml lines=31:41
@source ts-ground title="test_scenarios.yaml · 코드 근거 시나리오" path=egm/egm-bootstrap/test_scenarios.yaml lines=43:59
@source ts-bazel title="test_scenarios.yaml · Bazel 시나리오" path=egm/egm-bootstrap/test_scenarios.yaml lines=61:74
@source test-md title="egm/egm-bootstrap/TEST.md · 863B · 수동 검증 시나리오" path=egm/egm-bootstrap/TEST.md lines=7:16
@source yaml-ui title="egm/egm-bootstrap/agents/openai.yaml · 198B · 표시 이름" path=egm/egm-bootstrap/agents/openai.yaml lines=1:6
@source icon title="egm/egm-bootstrap/assets/icon.svg · 601B · 아이콘 그림" path=egm/egm-bootstrap/assets/icon.svg lines=1:1

## 언제 켜지고 무엇을 받아야 시작하나 {#trigger}

@code source=bs-fm language=yaml

- `disable-model-invocation: true`라서 모델이 `description`만 보고 스킬을 켜지 않는다. 사용자가 부를 때 켜진다.[](source:bs-fm) 판정: `description`은 사람이 스킬을 고를 때 쓰는 설명이며, 특정 단어가 있으면 켜지는 목록이 아니다.
- 이 스킬을 어떤 요청에서 부르면 안 되는지는 원문에 명시 없음. 본문이 정하는 제한은 코드 수정 금지와 15개 초과 승인 지점이다.[](source:bs-c-code)[](source:bs-c-gate)
- 첫머리에서 Codex나 ChatGPT Work는 `../../docs/codex.md`를, Claude Code나 Cowork는 `${CLAUDE_PLUGIN_ROOT}/docs/claude.md`를 먼저 읽으라고 한다. 두 파일은 이 저장소에 없다.[](source:bs-docs)

| 입력 | 필수 여부와 기본값 | 쓰임 |
| --- | --- | --- |
| `path` | 필수 | 문서를 만들 루트 폴더[](source:bs-inputs) |
| `is_worker` | 선택, 기본 `false`. 내부용 | `true`면 병렬 워커로 동작[](source:bs-inputs) |
| `sub_tree_root` | 선택. 내부용 | 워커가 맡은 서브트리의 루트[](source:bs-inputs) |
| `target_filename` | 선택, 기본 `"README.md"` | 계약 파일 이름. 사람이 쓴 README를 건드리면 안 될 때 `"EGM.md"` 같은 다른 이름을 쓴다[](source:bs-inputs) |

용어는 이렇다. Peanuts는 코드 파일이 직접 든 말단 폴더의 README이고, Hay는 하위 폴더 계약을 모아 상위 폴더에서 보여 주는 README다.[](source:bs-overview)

에이전트가 가장 먼저 하는 일은 저장소 루트의 manifest를 보고 `VerificationCommand`를 정하는 것이다.[](source:bs-step0)

| manifest | 정하는 명령 |
| --- | --- |
| `package.json` | `npm test`(또는 `pnpm test`, `yarn test`)[](source:bs-step0) |
| `Cargo.toml` | `cargo test`[](source:bs-step0) |
| `go.mod` | `go test ./...`[](source:bs-step0) |
| `pyproject.toml`, `pytest.ini`, `setup.py` | `pytest`[](source:bs-step0) |
| `Makefile` | `make test`[](source:bs-step0) |
| `BUILD`, `BUILD.bazel` | `bazel test //...`[](source:bs-step0) |
| 아무것도 없음 | `<test-command>` 자리표시자[](source:bs-step0) |

## 어떤 순서로 일하고 사람은 어디서 개입하나 {#flow}

@workflow id=bootstrap-flow title="egm-bootstrap 루트 오케스트레이터 흐름"
| scope | 폴더 지도 작성 | backend |
| gate | 폴더 15개 초과? | external |
| ask | 사용자 승인? | external |
| stop | 종료 | external |
| prune | 코드 없는 폴더 제외 | backend |
| size | 남은 폴더 5개 이하? | backend |
| direct | 직접 처리 | backend |
| swarm | 워커 병렬 처리 | backend |
| write | 아래층부터 계약 파일 쓰기 | backend |
| root | 루트 Hay 쓰기 | backend |
| verify | 계약 파일 전체 재확인 | backend |
| drift | drift 점검 선택 | external |
| scope > gate | |
| gate > ask | 예 |
| gate > prune | 아니오 |
| ask > prune | 승인 | emphasis |
| ask > stop | 거부 | dashed |
| prune > size | |
| size > direct | 예 |
| size > swarm | 아니오 |
| direct > write | |
| swarm > write | 워커가 각자 |
| write > root | |
| root > verify | |
| verify > drift | |

@steps id=bootstrap-steps
| scope | 폴더 지도 작성 | `path` 아래를 BFS(너비 우선)로 한 층씩 나열한다. `find`나 `ls -R` 같은 재귀 검색은 하지 않는다. symlink, `.git`, `node_modules`, `venv`, `dist`, `build`, `third_party` 같은 숨김·시스템 폴더, `.gitignore`와 `.egmignore`에 걸리는 경로는 제외한다.[](source:bs-bfs) | bootstrap-flow | scope |
| gate | 폴더 15개 초과? | BFS 중 발견한 폴더가 15개를 넘으면 탐색을 멈춘다. 이 검사는 가지치기 전의 폴더 수로 한다.[](source:bs-gate) | bootstrap-flow | gate |
| ask | 사용자 승인? | 큰 작업이라고 알리고 "Yes, proceed with full tree bootstrapping" 또는 "No, abort execution"을 묻는다. 답을 받기 전에는 워커를 띄우지 않는다. 거부하면 바로 끝낸다.[](source:bs-gate) | bootstrap-flow | ask |
| prune | 코드 없는 폴더 제외 | 지도를 아래층부터 훑어, 소스 코드 파일이 없고 코드가 든 하위 폴더도 없는 폴더를 뺀다. 테스트 코드만 든 폴더도 뺀다.[](source:bs-prune) | bootstrap-flow | prune |
| size | 남은 폴더 5개 이하? | 남은 폴더 수와 최대 깊이를 센 뒤 실행 방식을 고른다.[](source:bs-count) | bootstrap-flow | size |
| direct | 직접 처리 | 5개 이하면 현재 스레드가 전체 `path`를 워커처럼 처리한다.[](source:bs-direct) | bootstrap-flow | direct |
| swarm | 워커 병렬 처리 | 5개를 넘으면 서브트리로 쪼개 워커를 병렬로 띄우고, 모두 JSON을 돌려줄 때까지 기다린다.[](source:bs-swarm-cond)[](source:bs-spawn) | bootstrap-flow | swarm |
| write | 아래층부터 계약 파일 쓰기 | 폴더마다 가장 깊은 폴더부터 `goldfish-explorer`로 코드를 읽고 계약 파일을 쓴다.[](source:bs-correct) | bootstrap-flow | write |
| root | 루트 Hay 쓰기 | 워커 사이에 낀 중간 폴더를 아래층부터 쓰고, 루트 `path`는 항상 Hay로 쓴다.[](source:bs-inter)[](source:bs-root) | bootstrap-flow | root |
| verify | 계약 파일 전체 재확인 | 만들거나 고친 계약 파일을 하나도 빼지 않고 직접 읽어 확인한다.[](source:bs-final) | bootstrap-flow | verify |
| drift | drift 점검 선택 | 사용자에게 `egm-drift-report`를 돌릴지 묻는다. 어느 쪽이든 그다음에 종료한다.[](source:bs-drift)[](source:bs-end) | bootstrap-flow | drift |

사람이 개입하는 곳은 두 군데다. 폴더가 15개를 넘을 때의 승인과 마지막 drift 점검 선택이다.[](source:bs-gate)[](source:bs-drift) 종료 조건은 5단계 6번의 "성공적으로 종료"다.[](source:bs-end)

판정: 승인 지점은 가지치기 전 수로 열리고, 3단계는 "폴더 수가 15를 넘으면 승인을 받았는지 확인하라"고 다시 적는다. 이 두 번째 검사가 가지치기 후 수를 쓰는지는 원문에 명시 없음.[](source:bs-swarm-cond)

@facts id=bootstrap-numbers
| 승인 지점이 열리는 폴더 수(의무) | 15개 초과. 가지치기 전, BFS 발견 수[](source:bs-gate) |
| 직접 실행하는 폴더 수(의무) | 가지치기 후 5개 이하[](source:bs-direct) |
| 병렬 워커를 쓰는 폴더 수(의무) | 가지치기 후 5개 초과[](source:bs-swarm-cond) |
| 파티션 깊이 상한 | `depth` 최대 3[](source:bs-partition) |
| scout 한 번이 읽는 소스 | 약 1,500줄 안쪽. 파일마다 바이트 상한은 없음(권고형)[](source:bs-scout-limit) |

병렬일 때 서브트리를 쪼개는 방법은 이렇다. `depth`를 1로 시작해 그 깊이의 폴더 노드를 센다.[](source:bs-partition)

| 그 깊이의 노드 수 | 하는 일 |
| --- | --- |
| 3~5개 | 그 노드들을 파티션 루트로 쓴다[](source:bs-partition) |
| 3개 미만 | `depth`를 하나 올려 다시 센다. 최대 3까지[](source:bs-partition) |
| 5개 초과 | 하위 폴더가 가장 많은 가지를 3~4개 파티션으로 묶고, 남은 작은 가지는 한 파티션으로 합친다[](source:bs-partition) |
| `depth` 3에서도 3개 미만 | 루트의 바로 아래 자식을 쓰거나 순차 실행으로 돌아간다[](source:bs-partition) |

워커 수를 제한하지 않는다. 사용자가 승인 지점에서 허락했기 때문이라고 원문이 적는다.[](source:bs-spawn)

## 계약 파일은 어떻게 쓰나 {#contract}

에이전트는 폴더를 이렇게 나눈다. 코드 파일이 직접 든 폴더는 Peanuts 템플릿으로, 직접 든 코드는 없고 코드가 든 하위 폴더만 있는 폴더는 Hay(중간 Blueprint) 템플릿으로 쓴다.[](source:bs-classify) 템플릿은 쓰기 전에 `references/templates.md`를 먼저 읽는다.[](source:bs-tpl-ref)

| 폴더 종류 | 템플릿 절 |
| --- | --- |
| Peanuts(컴포넌트) | Overview, Interface, Invariants, Side Effects, Verification[](source:tpl-peanut) |
| Hay 루트(Blueprint) | System Overview, (직접 코드가 있으면) Local Interface & Invariants, Subdirectories & System Boundaries, Global Invariants, Global Side Effects, System Verification[](source:tpl-hay) |
| Hay 중간 폴더 | Overview, Subdirectories & Boundaries[](source:tpl-inter) |

항목마다 코드 근거를 요구하는 것이 이 스킬의 핵심 규칙이다.

- 폴더마다 읽기 전용 scout `goldfish-explorer`가 코드를 읽고 `interface`, `invariants`, `side_effects` 세 목록을 JSON으로 돌려준다.[](source:bs-scout-reg)
- 모든 항목에 정확한 `[파일:심볼 또는 플래그]`를 붙인다. 명시적인 불변식이나 부작용이 코드에 없으면 `["None"]`을 쓴다.[](source:bs-scout-reg)
- 파일이나 폴더 이름만 보고 RPC 메서드, 라우트, 상태 enum, 불변식을 지어내지 않는다.[](source:bs-scout-reg)
- RPC 서비스, 스키마, 메시지 타입을 로컬 파일 것으로 돌리기 전에 build manifest의 의존성과 `import`·`#include`를 확인한다.[](source:bs-scout-limit)

평가 시나리오가 이 규칙을 확인한다. `refund_service/` 폴더에 순수 helper 하나만 있는 입력에서, Interface 항목이 `[string_utils.py:<심볼>]` 모양이고 Invariants가 `None`이며 `issue_refund` 같은 이름이 나오지 않아야 한다고 적는다.[](source:ts-ground)

scout가 파일을 읽는 방식에도 규칙이 있다.[](source:bs-scout-limit)

| 대상 | 규칙 |
| --- | --- |
| 범위 | 테스트가 아닌 파일은 모두 끝까지 읽는다. 파일·폴더별 바이트 상한은 없다 |
| 분량 | scout 호출 하나에 소스 약 1,500줄. 최상위 정의(class·func·def·route·flag) 경계에서 잘라 청크를 만들고, 청크마다 scout를 병렬로 띄워 JSON을 합친다. 작은 파일은 한 청크를 같이 쓴다 |
| 읽는 순서 | 1) 계약·스키마·manifest(`.h`, `.proto`, `.graphql`, `.sql` DDL, 인터페이스 클래스) 2) 진입점(`main.*`, `index.*`, `lib.*`, `mod.*`, `__init__.py`, 폴더 이름과 같은 파일) 그다음 소스를 알파벳순 3) 템플릿·설정은 파일당 200줄까지(설정만 있는 폴더는 800줄), `.css`와 `.scss`는 제외 4) 테스트 파일은 하이브리드 폴더 안에서도 전부 무시 |

상위 폴더 `P`를 쓸 때는 바로 아래 자식의 인터페이스 요약을 프롬프트에 넣는다. 이번 실행에서 문서를 쓴 자식은 메모리 캐시에서, 보정한 자식은 합친 심볼에서 가져온다.[](source:bs-parent)

이미 계약 파일이 있으면 통째로 덮어쓰지 않는다. 먼저 기존 내용에서 심볼, 인터페이스, 불변식, 부작용을 JSON으로 뽑고, scout가 찾은 코드 심볼과 합쳐 파일을 고친다. 개발자가 쓴 메모와 설명은 남긴다. 계약 파일이 있어도 scout 스캔은 항상 한다.[](source:bs-correct)

링크는 두 가지 방식으로 쓴다.[](source:bs-links)

- 같은 하위 시스템의 자식·형제 계약은 상대 경로(`./child/${target_filename}`)로 쓴다. 실제로 존재하는 파일만 링크하고, 없는 파일로 가는 링크는 쓰지 않는다. 자식 폴더에 `SKILL.md`만 있으면 `./child/SKILL.md`로 링크하거나 링크 없는 항목으로 둔다.
- 패키지 밖 파일은 표준 URL이나 저장소 경로로 쓴다.

Verification 절은 찾은 명령으로 채운다. 명령을 못 찾으면 생략하거나 자리표시자를 쓴다.[](source:bs-verify-cmd)

- Bazel이면 폴더나 가장 가까운 상위의 `BUILD`를 확인한다. 대상은 `//패키지경로/...` 또는 `//패키지경로:all`만 쓴다.[](source:bs-verify-cmd)
- `//패키지경로...`와 `//패키지경로:...`는 쓰지 않는다. 인터랙티브 runner 대상은 `bazel run`이다.[](source:bs-verify-cmd)
- 평가 시나리오도 `bazel test //pkg/a/...` 또는 `//pkg/a:all`은 맞고 맨 `...`는 틀리다고 적는다.[](source:ts-bazel)

쓴 직후 Markdown 헤더, 표, 코드 펜스를 정리한다. 저장소에 `npx prettier --write` 같은 formatter가 설정돼 있으면 돌려도 된다(선택).[](source:bs-format)

## 무엇을 강제하고 무엇을 금지하나 {#rules}

| 규칙 | 내용 | 강도 |
| --- | --- | --- |
| 코드 생성 금지 | 문서만 쓴다. 동작하는 소스를 쓰거나 리팩터링하지 않는다 | 의무(CRITICAL 제약 목록)[](source:bs-c-code) |
| VCS 격리 | `git commit`, `git add`를 하지 않는다. 파일은 로컬에만 쓰고 기록과 제출은 사용자가 한다 | 의무[](source:bs-c-vcs) |
| 임시 파일 격리 | 워커마다 상태·체크포인트·로그 파일을 워크스페이스 밖의 자기 폴더(host scratch 또는 `mktemp -d`)에 둔다. 고정된 공유 경로는 쓰지 않는다. 둘 다 없으면 그 파일들을 만들지 않는다 | 의무[](source:bs-c-tmp) |
| 도구 사용 | 셸·파일 읽기·쓰기·편집 도구로 탐색과 생성을 한다. 생성할 때 Markdown 형식을 지킨다 | 의무. formatter는 선택[](source:bs-c-tool) |
| 서브에이전트 병렬 | 하위 오케스트레이터를 병렬로 띄운다 | 의무형[](source:bs-c-spawn) |
| 15개 초과 승인 | 폴더가 15개를 넘으면 구조화된 질문 도구나 채팅으로 승인을 받고, 답을 받은 뒤에만 이어 간다 | 의무(MUST)[](source:bs-c-gate) |
| 재귀 검색 금지 | `find`나 `ls -R`을 쓰지 않고 한 번에 한 층씩 나열한다 | 의무(CRITICAL)[](source:bs-bfs) |
| 근거 없는 추정 금지 | 이름만 보고 RPC·라우트·enum·불변식을 추정하지 않는다 | 의무[](source:bs-scout-reg) |
| 최종 재확인 | 만들거나 고친 계약 파일 하나하나를 직접 읽는다. 헤더 형식, 근거, 링크 대상 존재, 검증 명령 문법을 확인한다 | 의무(MUST)[](source:bs-final) |

최종 재확인에서 확인하는 것은 네 가지다.[](source:bs-final)

- Interface·Invariants·Side Effects 절이 있고 코드에서 가져온 근거만 있는지 본다.
- Markdown 문법이 맞는지 본다.
- 링크 대상 파일이 실제로 있는지 파일 시스템에서 확인하고, 깨진 링크는 고치거나 지운다.
- 검증 명령이 프로젝트 테스트 설정과 맞는지 본다.

실패는 이렇게 다룬다. scout가 실패하거나 시간이 초과되면 경고를 남기고 `["(Details pending/documentation failed)"]`를 넣은 채 계속 진행한다.[](source:bs-scout-fail) 워커가 실패하면 루트 Blueprint의 하위 폴더 목록에 "Documentation failed / Subagent execution timeout" 경고 링크를 넣고 나머지를 완성한다. 부분적으로 남은 파일은 진행 상황으로 취급하며, 다음 실행에서 보정 정책이 이어받는다.[](source:bs-root-fail)

@callout level=warning title="계약 파일 쓰기와 기존 README 보정은 문서를 바꾼다"
이 스킬은 코드를 건드리지 않지만, 대상 폴더의 `README.md`(또는 `target_filename`)를 만들거나 고친다. 기존 파일은 개발자 메모를 남기고 EGM 형식으로 보정한다.[](source:bs-correct) 사람이 쓴 README를 건드리면 안 되면 호출할 때 `target_filename`을 `"EGM.md"` 같은 다른 이름으로 준다.[](source:bs-inputs) 이 분석에서는 어떤 폴더에도 이 스킬을 실행하지 않았다.

## 흐름 속 위치 {#position}

이 스킬은 앞에 오는 스킬이 없고, 끝나면 `egm-drift-report`로 넘길 수 있다. 전체 흐름은 `egm/_group-contract-and-drift/contract-and-drift.html`에 있다.

@workflow id=position-flow title="egm-bootstrap의 앞과 뒤"
| call | 사용자 호출 | external |
| boot | egm-bootstrap | backend |
| ask | 사용자 선택 | external |
| drift | egm-drift-report | backend |
| call > boot | |
| boot > ask | 검증 끝난 뒤 |
| ask > drift | 예(r20) | emphasis |

| 구분 | 내용 | rel-id와 종류, 조건 |
| --- | --- | --- |
| 받는 것 | `path`와 선택 입력. 앞 스킬에서 받는 파일은 원문에 명시 없음[](source:bs-inputs) | 앞 단계 없음 |
| 넘기는 것 | 수정한 계약 파일(`README.md` 또는 `target_filename`)[](source:bs-drift) | r20 넘김. 사용자가 `Yes, run drift report on modified contracts`를 고를 때만. 사용자 선택이며 `(Recommended)` 표시가 붙은 선택지다[](source:bs-drift) |
| 조건 | 원문은 `egm-drift-report`가 설계 문서용이지만 계약 파일에 변형으로 적용할 수 있다고 적는다. 점검 내용은 문서에 적힌 메서드·라우트·enum·DB 테이블·불변식을 로컬 소스와 대조하는 것이고, 차이는 사람이 분류하도록 drift report에 남긴다[](source:bs-drift) | r20 |

그림에서 뺀 관계는 표에 남긴다.

| rel-id | 종류 | 그림에 있나 | 내용 |
| --- | --- | --- | --- |
| r16 | 내부 위임 | 생략 | 5개 초과면 `egm-bootstrap-orchestrator`(`agents/bootstrap_orchestrator.md`)를 파티션마다 띄운다. 해석 상태는 `범위 밖`이다. 일반 서브에이전트로 대신해도 된다[](source:bs-spawn) |
| r17 | 내부 위임 | 생략 | `is_worker=true`로 다시 실행되면 4단계만 하고, `worker-return.schema.json` 모양의 `subtree_index`(`path`와 `summary`는 필수, 나머지는 `interface`·`invariants`·`side_effects` 배열)를 돌려주고 끝낸다[](source:bs-report)[](source:schema) |
| r26 | 참고 | 생략 | 첫머리의 `docs/codex.md` 읽기 안내. 해석 상태는 `불명`이다[](source:bs-docs) |

## 어디까지 확인했고 한계는 무엇인가 {#audit}

@facts id=audit-facts
| 읽은 텍스트 파일 | 7개, 31,893바이트(`SKILL.md` 23,764B, `templates.md` 2,064B, `worker-return.schema.json` 568B, `test_scenarios.yaml` 3,835B, `TEST.md` 863B, `openai.yaml` 198B, `icon.svg` 601B) |
| 부분 읽음 파일 | 0개 |
| 바이너리 | 없음 |
| 제외한 파일 | 없음. `icon.svg`는 그림 데이터이고 지시가 없어서 분석에 쓰지 않았다[](source:icon) |
| 분석 직전 바뀐 파일 | `git diff --stat HEAD~1 -- egm/egm-bootstrap` 기준 `SKILL.md` 한 파일, +3/−3줄 |

최신화로 바뀐 곳은 제약 3(임시 파일 격리)이다. 이전에는 병렬 워커가 워크스페이스 밖의 워커별 폴더에서 상태와 로그를 쓴다고만 했고, 지금은 host scratch 또는 `mktemp -d`를 쓰고 고정 공유 경로를 금지하며 둘 다 없으면 건너뛴다고 적는다.[](source:bs-c-tmp)

@callout level=open-question title="확인하지 못한 것"
`agents/bootstrap_orchestrator.md`와 `goldfish-explorer` 이외의 서브에이전트 정의는 스킬 폴더에 없다. 폴더의 `agents/`에는 표시 이름이 든 `openai.yaml`만 있다.[](source:bs-spawn)[](source:yaml-ui)
`docs/codex.md`, `docs/claude.md`, `docs/harnesses.md`(Delegation 절이 가리키는 문서)는 저장소에 없어서 읽지 못했다. 거기에 이 스킬 동작을 바꾸는 규칙이 있는지는 확인하지 못했다.[](source:bs-docs)[](source:bs-deleg)
이 스킬을 실제 저장소에서 실행하지 않았다. 이 페이지는 지시상 동작이고, 생성된 README의 품질은 확인하지 못했다.

@callout level=open-question title="원문끼리 어긋나는 곳"
`TEST.md`는 서브에이전트 도구가 없는 환경에서 "`halting banner`를 보여 주고 즉시 멈춘다"고 확인하라고 적는다.[](source:test-md) 반면 `SKILL.md`는 서브에이전트 도구가 없으면 scout 단계를 인라인으로 실행하라고 적는다.[](source:bs-deleg) 우선순위는 원문에 명시 없음. 판정: `SKILL.md`가 지시문이고 `TEST.md`는 검증 메모라서, 이 페이지는 `SKILL.md` 쪽을 지시상 동작으로 썼다. `TEST.md`가 갱신되지 않았을 가능성이 있다.

@callout level=note title="이 페이지가 읽은 원문"
원문 7개를 모두 읽었다. 이 스킬의 승인 지점·수치·종료 조건은 `SKILL.md` 줄 번호와 다시 맞춰 보았다. 평가 시나리오 4개(작은 트리, 승인 지점, 코드 근거, Bazel 대상)는 읽기만 했고 실행하지 않았다.[](source:ts-small)[](source:ts-gate)
