# egm-drift-report — 설계 문서와 코드가 어긋난 곳만 모아 보고서로 남긴다 {#overview}

`egm-drift-report`는 에이전트가 디렉터리의 설계 문서나 README를 하나씩 읽고, 대응하는 소스 코드와 비교해 어긋난 곳만 날짜가 붙은 보고서 파일에 쓰게 한다.[](source:goal)

- 사용자가 한 디렉터리의 설계 문서나 README 전체에 대해 drift(문서와 코드의 불일치) 탐지를 요청할 때 쓴다. 이 스킬은 모델이 스스로 켜지 못하고 사용자가 직접 불러야 한다.[](source:fm)
- 결과는 `{YYYY-MM-DD}_DRIFT_REPORT.md` 한 파일이다. 문서마다 `## <DESIGN_DOC_NAME>` 절에 어긋난 항목 목록을 쓰고, 어긋남이 없으면 "No drift detected"를 쓴다.[](source:report)
- 다른 스킬과의 관계: `egm-bootstrap`이 다음 안내로 부르고, `egm-draft`의 설계 문서가 결과 전달 관계로 입력이 될 수 있다.
- 일치하는 부분은 보고하지 않는다. 일치하는 내용을 설명하지 않고 차이만 쓴다.[](source:filter)

@answer scope="egm/egm-drift-report · 원본 파일 5개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source goal title="스킬의 목표와 외부 안내" path=egm/egm-drift-report/SKILL.md lines=12:19
@source fm title="frontmatter" path=egm/egm-drift-report/SKILL.md lines=1:10
@source ext title="harness별 사전 안내" path=egm/egm-drift-report/SKILL.md lines=14:15
@source s1 title="1단계 입력 확인" path=egm/egm-drift-report/SKILL.md lines=21:22
@source s2 title="2단계 문서 나열" path=egm/egm-drift-report/SKILL.md lines=23:23
@source ctx title="Contextualize" path=egm/egm-drift-report/SKILL.md lines=26:27
@source loc title="Locate Source" path=egm/egm-drift-report/SKILL.md lines=28:32
@source ver title="Verify" path=egm/egm-drift-report/SKILL.md lines=33:33
@source det title="Detect Drift" path=egm/egm-drift-report/SKILL.md lines=34:40
@source filter title="Filter" path=egm/egm-drift-report/SKILL.md lines=41:43
@source report title="4단계 보고서" path=egm/egm-drift-report/SKILL.md lines=45:56
@source guide title="5단계 지침" path=egm/egm-drift-report/SKILL.md lines=58:67
@source boot title="egm-bootstrap의 드리프트 안내" path=egm/egm-bootstrap/SKILL.md lines=402:416
@source draft title="egm-draft의 문서 저장 단계" path=egm/egm-draft/SKILL.md lines=309:312
@source oai title="agents/openai.yaml" path=egm/egm-drift-report/agents/openai.yaml lines=1:6
@source scen title="평가 시나리오" path=egm/egm-drift-report/test_scenarios.yaml lines=15:29
@source testmd title="TEST.md" path=egm/egm-drift-report/TEST.md lines=1:3

## 어떻게 동작하나 {#flow span=12}

절차형이다. 3단계의 분석을 문서마다 되풀이하고, 모든 문서를 마치면 보고서 하나를 낸다. 그림은 문서 한 건의 분석을 5개 노드로 그린다. 문서가 하나 끝날 때마다 보고서에 그 문서의 절을 덧붙인다는 점은 보고 단계 설명에 있다.

@workflow id=flow-diagram title="egm-drift-report 흐름"
| lane prep | 준비 |
| lane each | 문서별 분석 |
| lane out | 보고 |
| input | 디렉터리를 받았나? | backend | prep | source:s1 |
| list | 문서 나열 | backend | prep | source:s2 |
| read | 설계 문서 읽기 | backend | each | source:ctx |
| locate | 소스 찾기 | backend | each | source:loc |
| verify | 현재 코드 읽기 | backend | each | source:ver |
| detect | 불일치 찾기 | backend | each | source:det |
| filter | 차이만 남기기 | backend | each | source:filter |
| report | 보고서에 덧붙이기 | backend | out | source:report |
| input > list | 예 |
| list > read | |
| read > locate | |
| locate > verify | |
| verify > detect | |
| detect > filter | |
| filter > read | 다음 문서 | dashed |
| filter > report | 모든 문서 끝 | emphasis |

@steps id=flow-steps
| s-input | 디렉터리를 받았나? | **입력** 사용자 요청 · **출력** 대상 디렉터리. **처리** 설계 문서나 README가 든 디렉터리가 주어졌는지 확인한다.[](source:s1) **다음** 디렉터리가 없으면 사용자에게 대상 디렉터리를 묻는다. | flow-diagram | input |
| s-list | 문서 나열 | **입력** 대상 디렉터리 · **출력** 문서 파일 목록. **처리** 디렉터리의 파일을 모두 나열해 분석할 문서를 정한다.[](source:s2) | flow-diagram | list |
| s-read | 설계 문서 읽기 | **입력** 문서 한 건 · **출력** 의도·제안된 변경·문서가 언급한 파일 이름과 symbol. **처리** 문서를 읽어 무엇을 구현하려는지와 어떤 이름을 지목하는지 파악한다.[](source:ctx) | flow-diagram | read |
| s-locate | 소스 찾기 | **입력** 문서가 지목한 이름 · **출력** 대응하는 소스 파일. **처리** 경로가 명시되지 않았으면 코드 검색이나 grep으로 클래스·함수·API endpoint를 찾는다.[](source:loc) **다음** 문서에 링크가 없으면 다음 탐지를 싸게 하도록 사용자에게 링크 추가를 권한다. | flow-diagram | locate |
| s-verify | 현재 코드 읽기 | **입력** 대응하는 소스 파일 · **출력** 현재 코드 상태. **처리** 기억에 기대지 않고 소스 파일을 다시 읽어 현재 상태를 확인한다.[](source:ver) | flow-diagram | verify |
| s-detect | 불일치 찾기 | **입력** 문서 내용·현재 코드 · **출력** 불일치 후보. **처리** 문서와 코드를 비교해 네 종류의 어긋남을 찾는다. 문서에 있으나 코드에 없는 기능, 문서가 정한 필드가 빠진 모델, 동적 로직 자리의 하드코딩, 문서와 다른 패턴·라이브러리다.[](source:det) | flow-diagram | detect |
| s-filter | 차이만 남기기 | **입력** 불일치 후보 · **출력** 차이 목록 또는 "No drift detected". **처리** 잘 동작하거나 일치하는 부분은 쓰지 않고 차이만 남긴다.[](source:filter) **다음** 문서가 더 있으면 다음 문서로 돌아가고, 모두 끝났으면 보고로 간다. | flow-diagram | filter |
| s-report | 보고서에 덧붙이기 | **입력** 문서별 차이 목록 · **실행** 에이전트의 파일 쓰기 도구로 `{YYYY-MM-DD}_DRIFT_REPORT.md`에 덧붙인다 · **출력** 보고서 파일. **처리** 문서마다 `## <DESIGN_DOC_NAME>` 절 아래에 불릿 목록 또는 "No drift detected"를 쓴다.[](source:report) | flow-diagram | report |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자가 불러야 한다. `disable-model-invocation: true`라서 모델 판단(description)만으로는 켜지지 않는다.[](source:fm) |
| 성격 | 설계 문서마다 코드를 읽고 어긋남만 파일에 쓰는 점검 절차. 원문은 코드 수정을 지시하지 않는다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| egm-bootstrap {#r20} | **이 스킬** | 다음 안내 | bootstrap 5단계 끝에서 사용자에게 예·아니오를 묻는다(권장 선택지는 "Yes, run drift report on modified contracts"). 사용자가 Yes를 고르면 수정한 계약 파일에 이 스킬을 실행하고, 아니오면 건너뛴다. 원문은 이 스킬이 설계 문서용이지만 계약 파일에 변형으로 쓸 수 있다고 적는다.[](source:boot) |
| egm-draft {#r21} | **이 스킬** | 결과 전달 | draft가 저장하는 설계 문서(`<DESIGN_DIR>/<FEATURE>.md`)가 이 스킬의 입력 조건(설계 문서가 든 디렉터리)에 맞는다. 원문에 서로를 부르는 말이 없고 필수 순서가 아니다(판정: 원장의 추론).[](source:draft) |

@architecture id=relation-map title="egm-drift-report와 이어지는 스킬"
| bootstrap | egm-bootstrap | backend |
| draft | egm-draft | backend |
| self | egm-drift-report(이 스킬) | backend |
| bootstrap > self | 다음 안내 |
| draft > self | 결과 전달 | dashed |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 5단계 절차와 보고서 형식을 정하는 본문 | 스킬을 켜면 읽는다 | 디렉터리를 받았나? ~ 보고서에 덧붙이기 |
| `agents/openai.yaml` | 표시 이름 "EGM Drift report", 짧은 설명 "Find differences between designs and code", 아이콘·색을 정한 메타데이터[](source:oai) | OpenAI 계열 UI가 표시할 때 쓴다. 에이전트 지시는 없다 | 쓰지 않음 |
| `assets/icon.svg` | 24x24 아이콘 | 위 yaml이 가리킨다 | 쓰지 않음 |
| `test_scenarios.yaml` | `detect_all_drift` 시나리오 한 개. `docs/designs/drift_report.md`에 실행하고 응답에 drift·discrepancy·matches·out of sync·report 중 하나가 있는지 정규식으로 본다[](source:scen) | 평가할 때만 쓴다 | 쓰지 않음 |
| `TEST.md` | 테스트 안내 3줄. frontmatter와 링크 검사는 저장소 루트 `TESTING.md`의 `pytest tests/unit`이 맡는다고만 적는다[](source:testmd) | 사람이 읽는 안내 | 쓰지 않음 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 대상 디렉터리가 주어지지 않았다 | 사용자에게 디렉터리를 지정해 달라고 묻는다 | [](source:s1) |
| 문서가 소스 경로를 명시하지 않았다 | 코드 검색이나 grep으로 찾고, 문서에 링크를 추가하도록 사용자에게 권한다 | [](source:loc) |
| 코드가 문서와 완전히 같다 | "No drift detected"를 출력한다 | [](source:filter) |
| 문서가 언급한 object·field·file 이름이 코드에 없다 | 보고할 drift다 | [](source:guide) |
| 코드의 어떤 로직이 설계 문서나 README 어디에도 언급되지 않았다 | 이것도 보고할 drift다. 문서에 없는 코드까지 보고 대상이다 | [](source:guide) |
| 코드 상태를 확인할 때 | 기억에 기대지 않고 파일을 넉넉히 다시 읽는다(권고) | [](source:guide) |
| 파일이 여러 개일 때 | 도구 출력이 넘치지 않도록 순서대로 하나씩 처리한다 | [](source:guide) |
| 보고서를 쓸 때 | 형식은 엄격하다. 문서 이름 제목과 불릿 목록 또는 "No drift detected"만 쓰고, 파일은 덧붙여 쓴다 | [](source:report) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 불일치 네 종류와 보고 범위 — 불일치 찾기 · 네 종류의 정의와 "문서에 없는 로직도 drift"라는 지침의 경계를 한 표로 모을 수 있어서 개요에서는 요약만 했다.
- 보고서 형식 — 보고서에 덧붙이기 · 날짜 파일 이름과 절 형식, 덧붙이는 동작의 세부는 개요에서 요약했다.

@callout level=open-question title="확인하지 못한 것"
| 원문은 `../../docs/codex.md`(Codex·ChatGPT Work)와 `${CLAUDE_PLUGIN_ROOT}/docs/claude.md`(Claude Code)를 먼저 읽으라고 한다.[](source:ext) 두 파일은 이 저장소에 없어서 읽지 못했다. 원장은 핵심 동작을 정하는 자료가 아니라고 보고 이 스킬을 "완료"로 판정했다. 이 안내문이 동작을 바꾸는지는 알 수 없다. |
| 보고서를 쓰는 위치(어느 디렉터리)와 파일이 이미 있을 때의 처리는 원문에 명시 없음. 원문은 "Append"라고만 적는다.[](source:report) |

읽은 원본: 텍스트 파일 5개. 제외: 번역본 `SKILL.ko.md`, `TEST.ko.md`(분석 근거로 쓰지 않음).
