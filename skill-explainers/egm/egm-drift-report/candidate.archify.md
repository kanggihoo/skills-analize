# egm-drift-report 스킬은 에이전트를 어떻게 바꾸나 {#drift-report-skill}

`egm-drift-report`를 부르면 에이전트는 설계 문서나 README를 한 개씩 순서대로 읽고, 문서가 말한 클래스·필드·파일이 지금 코드에 있는지 코드를 직접 열어 확인한다. 보고서에는 어긋난 곳만 쓰고, 어긋난 곳이 없으면 `No drift detected` 한 줄만 쓴다.[](source:dr-filter)

- 사용자가 이름으로 불러야 켜지는 설정이다. 디렉터리를 주지 않으면 에이전트가 먼저 묻는다.[](source:dr-fm)[](source:dr-input)
- 문서 하나마다 읽기, 코드 위치 찾기, 현재 코드 읽기, 비교, 차이만 남기기를 차례로 한다.[](source:dr-per-doc)
- 문서에 적힌 이름이 코드에 없으면 보고한다. 어느 설계 문서에도 안 나오는 로직도 보고한다.[](source:dr-strict)
- 산출물은 `{YYYY-MM-DD}_DRIFT_REPORT.md` 하나다. 코드나 문서를 고치라는 지시는 원문에 명시 없음.[](source:dr-report)

@answer scope="egm/egm-drift-report · 텍스트 5개 · 커밋 d494974 · 실행 안 함 · 지시상 동작"
@meta locale=ko
@source dr-fm title="egm/egm-drift-report/SKILL.md · 3169B · frontmatter" path=egm/egm-drift-report/SKILL.md lines=2:9
@source dr-ptr title="SKILL.md · 첫머리 host 문서 안내" path=egm/egm-drift-report/SKILL.md lines=14:15
@source dr-goal title="SKILL.md · 목표" path=egm/egm-drift-report/SKILL.md lines=17:19
@source dr-input title="SKILL.md · 1단계 입력 확인" path=egm/egm-drift-report/SKILL.md lines=21:22
@source dr-list title="SKILL.md · 2단계 문서 목록" path=egm/egm-drift-report/SKILL.md lines=23:23
@source dr-per-doc title="SKILL.md · 3단계 문서마다 분석" path=egm/egm-drift-report/SKILL.md lines=24:24
@source dr-context title="SKILL.md · Contextualize" path=egm/egm-drift-report/SKILL.md lines=26:27
@source dr-locate title="SKILL.md · Locate Source" path=egm/egm-drift-report/SKILL.md lines=28:32
@source dr-verify title="SKILL.md · Verify" path=egm/egm-drift-report/SKILL.md lines=33:33
@source dr-detect title="SKILL.md · Detect Drift 네 종류" path=egm/egm-drift-report/SKILL.md lines=34:40
@source dr-filter title="SKILL.md · Filter" path=egm/egm-drift-report/SKILL.md lines=41:43
@source dr-report title="SKILL.md · 4단계 보고서 파일" path=egm/egm-drift-report/SKILL.md lines=45:48
@source dr-format title="SKILL.md · Strict Format" path=egm/egm-drift-report/SKILL.md lines=49:56
@source dr-fmt-block title="SKILL.md · 보고서 형식 코드 블록" path=egm/egm-drift-report/SKILL.md lines=51:56
@source dr-strict title="SKILL.md · 엄격 기준" path=egm/egm-drift-report/SKILL.md lines=60:63
@source dr-fresh title="SKILL.md · 현재 코드를 직접 읽기" path=egm/egm-drift-report/SKILL.md lines=64:65
@source dr-seq title="SKILL.md · 순차 처리" path=egm/egm-drift-report/SKILL.md lines=66:67
@source dr-test title="egm/egm-drift-report/test_scenarios.yaml · 1327B · 시나리오 1개" path=egm/egm-drift-report/test_scenarios.yaml lines=19:29
@source dr-testmd title="egm/egm-drift-report/TEST.md · 130B · 테스트 안내" path=egm/egm-drift-report/TEST.md
@source dr-yaml title="egm/egm-drift-report/agents/openai.yaml · 204B · 표시 이름과 설명" path=egm/egm-drift-report/agents/openai.yaml
@source dr-icon title="egm/egm-drift-report/assets/icon.svg · 281B · 아이콘" path=egm/egm-drift-report/assets/icon.svg
@source bs-drift title="egm/egm-bootstrap/SKILL.md · r20 확인용(drift 점검 제안)" path=egm/egm-bootstrap/SKILL.md lines=402:416
@source dd-save title="egm/egm-draft/SKILL.md · r21 확인용(설계 문서 저장)" path=egm/egm-draft/SKILL.md lines=309:312

## 언제 켜지고 무엇을 받아야 시작하나 {#trigger}

@code source=dr-fm language=yaml

- `disable-model-invocation: true`가 켜져 있다.[](source:dr-fm) 판정: 필드 이름대로 모델의 자동 호출이 꺼진 설정으로 읽힌다. 이 필드의 뜻을 `SKILL.md`가 설명하지는 않는다. 그래서 사용자가 스킬 이름을 불러야 시작한다고 본다.
- `description`은 판단에 참고하는 설명이다. 어떤 말이 나오면 켜진다는 규칙은 원문에 명시 없음.[](source:dr-fm)
- 본문은 사용자가 모든 설계 문서나 README 묶음의 drift를 찾아 달라고 할 때를 가정한다. 목표는 코드가 설계를 따르지 않거나 구현하지 못한 곳을 모두 찾는 것이다.[](source:dr-goal)
- `description`은 "design documents"만 말하고, 본문 1단계는 "design documents or READMEs"를 입력으로 받는다. 판정: README도 입력으로 본다.[](source:dr-fm)[](source:dr-input)

| 받는 것 | 규칙 |
| --- | --- |
| 대상 디렉터리 | 설계 문서나 README가 든 폴더다. 주지 않으면 에이전트가 사용자에게 대상 디렉터리를 묻는다.[](source:dr-input) |
| 문서 목록 | 설계 디렉터리의 모든 파일을 나열한다. 하위 폴더까지 보는지, 문서가 아닌 파일을 거르는지는 원문에 명시 없음.[](source:dr-list) |
| 소스 트리 | 문서가 말하는 코드를 찾는 곳이다. 위치를 사용자에게 따로 받는 절차는 원문에 명시 없음.[](source:dr-locate) |

사람이 개입하는 곳은 두 군데다. 디렉터리를 주지 않았을 때 묻는 질문이 하나이고, 코드 경로가 문서에 없을 때 문서에 링크를 추가하라고 요청하는 말이 하나다.[](source:dr-input)[](source:dr-locate) 질문에 답을 기다리는지, 사용자가 승인해야 다음 단계로 가는지는 원문에 명시 없음. 수치로 정한 제한(문서 개수 상한, 반복 횟수)도 원문에 명시 없음.

## 문서 하나를 어떻게 코드와 맞춰 보나 {#per-doc}

@workflow id=drift-flow title="egm-drift-report 처리 순서"
| d-in | 디렉터리를 받았나? | backend |
| d-ask | 사용자에게 묻는다 | external |
| d-list | 문서 목록 | backend |
| d-read | 문서 읽기 | backend |
| d-find | 코드 위치 찾기 | backend |
| d-code | 현재 코드 읽기 | backend |
| d-cmp | 차이 찾기 | backend |
| d-filter | 차이만 남기기 | backend |
| d-write | 보고서에 덧붙이기 | backend |
| d-more | 남은 문서가 있나? | backend |
| d-end | 보고서 완성 | backend |
| d-in > d-list | 예 |
| d-in > d-ask | 아니오 |
| d-ask > d-list | |
| d-list > d-read | |
| d-read > d-find | |
| d-find > d-code | |
| d-code > d-cmp | |
| d-cmp > d-filter | |
| d-filter > d-write | |
| d-write > d-more | |
| d-more > d-read | 예 | dashed |
| d-more > d-end | 아니오 | emphasis |

@steps id=drift-steps
| s-in | 디렉터리를 받았나? | 설계 문서나 README가 든 디렉터리를 받았는지 먼저 확인한다.[](source:dr-input) | drift-flow | d-in |
| s-ask | 사용자에게 묻는다 | 받지 못했으면 대상 디렉터리를 지정해 달라고 사용자에게 요청한다.[](source:dr-input) | drift-flow | d-ask |
| s-list | 문서 목록 | 설계 디렉터리의 모든 파일을 나열한다.[](source:dr-list) | drift-flow | d-list |
| s-read | 문서 읽기 | 문서를 읽고 의도, 제안한 변경, 문서가 말하는 파일 이름과 symbol을 정리한다.[](source:dr-context) | drift-flow | d-read |
| s-find | 코드 위치 찾기 | 경로가 적혀 있지 않으면 코드 검색이나 grep으로 문서가 말한 class, function, API endpoint를 찾는다. 사용자에게는 문서에 링크를 추가하라고 요청한다.[](source:dr-locate) | drift-flow | d-find |
| s-code | 현재 코드 읽기 | 찾은 소스 파일의 현재 상태를 읽는다.[](source:dr-verify) | drift-flow | d-code |
| s-cmp | 차이 찾기 | 설계와 현실을 비교해 네 종류의 차이를 찾는다.[](source:dr-detect) | drift-flow | d-cmp |
| s-filter | 차이만 남기기 | 일치하는 부분은 쓰지 않고 차이만 남긴다. 완전히 일치하면 `No drift detected`를 쓴다.[](source:dr-filter) | drift-flow | d-filter |
| s-write | 보고서에 덧붙이기 | 문서마다 분석 결과를 `{YYYY-MM-DD}_DRIFT_REPORT.md`에 덧붙인다.[](source:dr-report) | drift-flow | d-write |
| s-more | 남은 문서가 있나? | 목록의 다음 문서로 같은 과정을 되풀이한다.[](source:dr-per-doc) | drift-flow | d-more |

- 3단계는 "For EACH design document"로 시작하므로 위 과정은 문서마다 반복된다.[](source:dr-per-doc)
- 에이전트는 문서를 하나씩 순서대로 처리한다. 도구 출력 버퍼가 넘치지 않게 하려는 지침이다.[](source:dr-seq)
- 판정: 원문은 반복을 언제 끝내는지 직접 쓰지 않는다. 마지막 문서까지 처리하면 끝나는 구조로 읽었다.

Detect Drift 단계에서 에이전트가 특히 찾는 차이는 네 종류다.[](source:dr-detect)

| 종류 | 에이전트가 찾는 것 |
| --- | --- |
| Missing Features | 문서에 적힌 로직이 코드에 없다.[](source:dr-detect) |
| Incomplete Models | dataclass, class, struct, proto에 설계가 정한 필드가 빠져 있다.[](source:dr-detect) |
| Logic Shortcuts | 동적으로 처리하기로 한 곳에 값이 하드코딩돼 있다.[](source:dr-detect) |
| Architectural Divergence | 제안한 것과 다른 패턴이나 라이브러리로 구현했다.[](source:dr-detect) |

원문이 "specifically"라고 적어서 이 넷을 찾을 대상의 목록으로 읽었다. 이 넷 밖의 차이를 보고해도 되는지는 원문에 명시 없음.[](source:dr-detect)

## 보고서는 어떻게 쓰고 얼마나 엄격한가 {#report}

에이전트는 문서마다 분석 결과를 `{YYYY-MM-DD}_DRIFT_REPORT.md`에 덧붙인다.[](source:dr-report) 형식은 "Strict Format"으로 정해져 있다.[](source:dr-format)

@code source=dr-fmt-block language=markdown

```markdown title="설명용 예시: 보고서 한 절(내용은 분석자가 지어낸 것)"
## rate_limit.md

- Missing Features: 설계가 정한 429 응답 분기가 코드에 없다.
- Logic Shortcuts: 한도 100이 상수로 박혀 있다.

## telemetry.md

No drift detected
```

원문에 없는 것이 세 가지 있다. 파일을 어느 폴더에 저장하는지, `{YYYY-MM-DD}`가 실행한 날짜인지, 같은 날 다시 돌렸을 때 같은 파일에 계속 덧붙이는지는 원문에 명시 없음.[](source:dr-report)

| 규칙 | 강도 | 내용 |
| --- | --- | --- |
| 차이만 보고 | 의무형. "ONLY"를 쓴다 | 잘 동작하거나 일치하는 부분은 설명하지 않는다.[](source:dr-filter) |
| 보고서 형식 | 의무형. "Strict Format"이다 | 문서마다 `## <DESIGN_DOC_NAME>` 아래에 불릿 목록 또는 `No drift detected`를 쓴다.[](source:dr-format) |
| 엄격하게 | 권고. Guidance 절이다 | 문서가 특정 객체, 필드, 파일 이름을 말하는데 코드에 없으면 보고한다. 빠짐없이 다시 확인한다.[](source:dr-strict) |
| 문서에 없는 로직 | 권고. Guidance 절이다 | 어느 설계 문서나 README에도 안 나오는 로직이 있으면 보고한다.[](source:dr-strict) |
| 현재 코드 읽기 | 권고. Guidance 절이다 | 기억에 기대지 않고 파일을 넉넉히 읽어 현재 코드 상태를 본다.[](source:dr-fresh) |
| 순차 처리 | 권고. Guidance 절이다 | 문서를 하나씩 처리한다.[](source:dr-seq) |

@callout level=note title="판정: 보고 범위가 열려 있다"
"문서에 없는 로직도 보고한다"는 규칙은 문서에서 코드로 가던 비교를 코드에서 문서 방향으로도 넓힌다.[](source:dr-strict)
그 항목을 어느 `##` 아래에 쓰는지, 소스 트리 어디까지 훑는지는 원문에 명시 없음. 그래서 큰 저장소에서는 보고가 길어질 수 있다고 본다.

## 흐름 속 위치 {#position}

이 스킬은 `egm-bootstrap`이 마지막에 사용자에게 제안하는 점검이다. `egm-draft`가 저장한 설계 문서도 입력 조건에 맞는다.

@workflow id=drift-position title="egm-drift-report 앞뒤"
| p-bs | egm-bootstrap 5단계 끝 | backend |
| p-ask | drift 점검을 할까? | external |
| p-skip | 건너뛴다 | backend |
| p-dd | egm-draft 저장 문서 | backend |
| p-self | egm-drift-report | backend |
| p-human | 사람이 분류 | external |
| p-bs > p-ask | r20 |
| p-ask > p-self | 예 | emphasis |
| p-ask > p-skip | 아니오 | dashed |
| p-dd > p-self | r21 추론 | dashed |
| p-self > p-human | 보고서 | |

| rel-id | 방향 | 상대 스킬 | 종류 | 조건·강도·사용자 개입 | 전달물 |
| --- | --- | --- | --- | --- | --- |
| r20 | 앞 | egm-bootstrap | 넘김 | 계약 파일 검증을 마친 뒤 사용자에게 예·아니오를 묻는다. 사용자가 예를 고르면 수정한 계약 파일에 이 스킬을 실행한다. 선택하지 않으면 건너뛴다.[](source:bs-drift) | 수정한 계약 파일(`README.md` 또는 `target_filename`) |
| r21 | 앞 | egm-draft | 산출물 호환 | 근거 방식은 추론이다. `egm-draft`가 저장하는 설계 문서(`<DESIGN_DIR>/<FEATURE>.md`)가 이 스킬이 받는 "설계 문서가 든 디렉터리"에 맞는다. 두 스킬 어디에도 서로를 부르는 말이 없고 필수 순서가 아니다.[](source:dd-save)[](source:dr-input) | 설계 문서 디렉터리 |

`egm-bootstrap`은 이 스킬이 원래 설계 문서용이지만 계약 파일에도 변형으로 쓸 수 있다고 적고, 점검 대상을 문서에 적힌 method, route, enum, database table, invariant로 구체화한다. 불일치는 사람이 분류하도록 drift report에 기록한다고도 쓴다.[](source:bs-drift) 이 스킬 본문에는 그 목록과 사람 분류 절차가 원문에 명시 없음. 이 스킬이 다른 스킬로 넘기는 관계는 원장에 없다.

전체 흐름은 `egm/_group-contract-and-drift/contract-and-drift.html`에서 본다.

## 어디까지 확인했고 한계는 무엇인가 {#audit}

@facts id=audit-facts
| 읽은 텍스트 파일 | 5개, 합계 5,111B |
| 구조·표본만 읽은 파일 | 0개 |
| 바이너리 | 0개 |
| 제외한 파일 | 없음 |
| 실행 여부 | 스킬 지시를 실행하지 않았다. 지시상 동작만 분석했다 |
| 이번 최신화에서 바뀐 파일 | 변경 없음. `git diff --stat HEAD~1 -- egm/egm-drift-report` 결과가 비었다 |

| 파일 | 역할 |
| --- | --- |
| `SKILL.md` 3169B | 스킬 본문. 위 패널의 근거 대부분이다.[](source:dr-fm) |
| `test_scenarios.yaml` 1327B | 시나리오 1개(`detect_all_drift`)가 응답에 `drift`, `discrepancy`, `matches`, `out of sync`, `report` 중 하나가 있는지 정규식으로만 본다.[](source:dr-test) |
| `TEST.md` 130B | frontmatter와 link 검사가 `pytest tests/unit`에서 돈다고만 적는다.[](source:dr-testmd) |
| `agents/openai.yaml` 204B | 표시 이름 `EGM Drift report`와 한 줄 설명 "Find differences between designs and code"를 정한다. 동작 지시는 없다.[](source:dr-yaml) |
| `assets/icon.svg` 281B | 24×24 그림 하나다. 동작 지시는 없다.[](source:dr-icon) |

판정: 시나리오 검사는 보고서 형식이나 "차이만 보고" 규칙을 확인하지 않는다. 이 스킬의 강제 규칙을 시험으로 확인한 근거는 없다.

@callout level=open-question title="확인하지 못한 것"
일곱 egm 스킬이 공통으로 첫머리에서 읽으라고 하는 `docs/codex.md`와 `${CLAUDE_PLUGIN_ROOT}/docs/claude.md`가 저장소에 없다. 그 안에 이 스킬에 영향을 주는 지시가 있는지는 확인하지 못했다.[](source:dr-ptr) 이 스킬의 핵심 동작을 정하는 별도 자료는 없어서 조사 상태는 완료로 둔다.
스킬을 실제로 돌려 보지 않아서 보고서가 실제로 어떻게 나오는지, 큰 저장소에서 얼마나 걸리는지는 확인하지 못했다.
하위 폴더와 문서가 아닌 파일의 처리, 보고서 저장 위치, 같은 날 재실행 때의 덧붙임, 코드나 문서를 고치는지 여부는 원문에 명시 없음.
