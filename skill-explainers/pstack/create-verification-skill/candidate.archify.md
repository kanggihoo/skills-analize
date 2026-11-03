# create-verification-skill 스킬은 에이전트를 어떻게 바꾸나 {#create-verification-skill-skill}

`create-verification-skill`을 쓰면 에이전트는 앱을 사용자처럼 직접 돌려 증명하는 검증 스킬(verification skill)을 대상 프로젝트 안에 만든다. 만든 스킬은 한 번 끝까지 실행해 본 뒤에야 넘긴다.[](source:skill-intro)[](source:skill-prove)

- 저장소에서 답을 찾고, 관찰할 수 없는 것만 사용자에게 묻는다.[](source:skill-interview)
- 결과물은 `.cursor/skills/verify-<app>/`의 `SKILL.md`와 기능 지도(feature map) `features/`다.[](source:skill-generate)[](source:skill-map)
- 독자는 사람이 아니라 앱을 처음 보는 다음 에이전트다. 자리표시자를 남기지 않는다.[](source:skill-intro)[](source:skill-generate)
- 실행해 보지 않은 검증 스킬은 초안이지 결과물이 아니다.[](source:skill-prove)

@answer scope="pstack/create-verification-skill · 원본 텍스트 파일 4개 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/create-verification-skill/SKILL.md · 5879B · frontmatter" path=pstack/create-verification-skill/SKILL.md lines=1:5
@source skill-intro title="pstack/create-verification-skill/SKILL.md · 목적과 독자" path=pstack/create-verification-skill/SKILL.md lines=9:9
@source skill-interview title="pstack/create-verification-skill/SKILL.md · 1단계 저장소 조사" path=pstack/create-verification-skill/SKILL.md lines=11:19
@source skill-broken title="pstack/create-verification-skill/SKILL.md · 깨진 기반 먼저 고치기" path=pstack/create-verification-skill/SKILL.md lines=21:21
@source skill-generate title="pstack/create-verification-skill/SKILL.md · 2단계 frontmatter" path=pstack/create-verification-skill/SKILL.md lines=23:25
@source skill-sections title="pstack/create-verification-skill/SKILL.md · 2단계 절 구성" path=pstack/create-verification-skill/SKILL.md lines=27:32
@source skill-evidence title="pstack/create-verification-skill/SKILL.md · Evidence 증명 기준" path=pstack/create-verification-skill/SKILL.md lines=30:30
@source skill-map title="pstack/create-verification-skill/SKILL.md · 3단계 기능 지도" path=pstack/create-verification-skill/SKILL.md lines=34:36
@source skill-prove title="pstack/create-verification-skill/SKILL.md · 4단계 생성 스킬 증명" path=pstack/create-verification-skill/SKILL.md lines=38:40
@source skill-offer title="pstack/create-verification-skill/SKILL.md · 5단계 유지 안내" path=pstack/create-verification-skill/SKILL.md lines=42:44
@source ex-readme title="references/feature-map-example/README.md · 2601B · 기능 지도 색인 예시" path=pstack/create-verification-skill/references/feature-map-example/README.md lines=1:47
@source ex-base title="feature-map-example/README.md · 기본 전제와 실행 규칙" path=pstack/create-verification-skill/references/feature-map-example/README.md lines=5:21
@source ex-proof title="feature-map-example/README.md · 증명과 건너뜀 보고" path=pstack/create-verification-skill/references/feature-map-example/README.md lines=23:31
@source ex-contract title="feature-map-example/README.md · 기능 파일 규약" path=pstack/create-verification-skill/references/feature-map-example/README.md lines=33:42
@source ex-create title="references/feature-map-example/create-note.md · 2926B · 기능 파일 예시" path=pstack/create-verification-skill/references/feature-map-example/create-note.md lines=1:39
@source ex-create-gotcha title="feature-map-example/create-note.md · 함정" path=pstack/create-verification-skill/references/feature-map-example/create-note.md lines=34:39
@source ex-search title="references/feature-map-example/search.md · 3478B · 기능 파일 예시" path=pstack/create-verification-skill/references/feature-map-example/search.md lines=1:45
@source ex-search-gotcha title="feature-map-example/search.md · 함정" path=pstack/create-verification-skill/references/feature-map-example/search.md lines=39:45
@source setup-offer title="pstack/setup-pstack/SKILL.md · 7단계 검증 스킬 제안" path=pstack/setup-pstack/SKILL.md lines=72:74
@source help-mention title="pstack/poteto-help/SKILL.md · 검증 스킬 언급 조건" path=pstack/poteto-help/SKILL.md lines=28:28
@source maintain-intro title="pstack/maintain-verification-skill/SKILL.md · 유지 대상" path=pstack/maintain-verification-skill/SKILL.md lines=9:9

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/create-verification-skill`을 입력하거나 다른 스킬이 부를 때 켜진다. `description`은 프로젝트에 UI, CLI, 서비스 동작을 증명할 스크립트 수단이 없을 때를 대상으로 든다.

| 누가 부르나 | 조건 | rel-id |
| --- | --- | --- |
| 사용자 | `/create-verification-skill` 입력 | - |
| `setup-pstack` | 앱을 직접 돌릴 수단이 없으면 한 번만 제안한다. 사용자가 예라고 하면 실행하고, 아니면 더 권하지 않는다[](source:setup-offer) | r37 |
| `poteto-help` | `verify-*` 스킬이 없고 질문이 "변경이 동작함을 증명"에 관한 것일 때 언급만 한다[](source:help-mention) | r24 |

## 어떤 순서로 만드나 {#flow}

@workflow id=cvs-flow title="검증 스킬 생성 흐름"
| lane build | 조사와 생성 |
| lane hand | 증명과 인계 |
| interview | 조사 | backend | build |
| runs | 실행돼? | backend | build |
| repair | 수리 | backend | build |
| gen | 생성 | backend | build |
| map | 지도 | backend | hand |
| prove | 증명 | backend | hand |
| offer | 인계 | frontend | hand |
| interview > runs | | |
| runs > gen | 예 | emphasis |
| runs > repair | 아니오 | |
| repair > gen | | |
| gen > map | | |
| map > prove | | |
| prove > gen | 실패 | dashed |
| prove > offer | | emphasis |

@steps id=cvs-steps
| s-interview | 조사 | 사용자가 아니라 저장소에 묻는다. 표면(웹 UI, CLI·TUI, 데스크톱, API, 모바일, 라이브러리 중 주된 것), 실행 방법(저장소가 문서화한 개발 명령, 포트, 환경 변수, 시드 데이터, 인증), 조작 방법(기존 하네스 먼저, 그다음 일반 방법), 관찰할 근거, 두 인스턴스를 나란히 돌릴 수 있는지를 확인한다. | cvs-flow | interview |
| s-runs | 실행돼? | 체크아웃이 그대로 빌드되고 시작되는지 본다. | cvs-flow | runs |
| s-repair | 수리 | 안 되면 먼저 고치거나 정확히 보고한다. 앱과 무관한 빠진 자산이 시작을 막으면, 생성 스킬이 그것을 검증용 임시 구조로 표시해 만들고 정리 단계에서 지운다. | cvs-flow | repair |
| s-gen | 생성 | `verify-<app>/SKILL.md`를 frontmatter 블록과 여섯 절(Launch, Doctor, Drive, Evidence, Cleanup, Helpers)로 쓴다. 각 절은 조사에서 실제로 찾은 내용으로 채운다. | cvs-flow | gen |
| s-map | 지도 | `features/README.md`와 사용자 기능마다 파일 하나를 만든다. 처음에는 상위 3~5개를 목표로 한다. | cvs-flow | map |
| s-prove | 증명 | 생성한 지시를 한 번 끝까지 따른다. 실행, 상태 점검, 지도의 기능 **하나** 조작, 근거 저장, 정리. 정리 뒤에도 근거가 지정한 위치에 남아 있는지 확인한다. 실패하면 고치고, 실패한 시도마다 생성한 정리 절차를 돌린다. | cvs-flow | prove |
| s-offer | 인계 | 앱이 바뀔 때 지도를 맞게 유지하도록 `/maintain-verification-skill`을 알려 준다. 주기는 사용자가 물을 때만 제안한다. | cvs-flow | offer |

흐름은 원문 1~5단계를 따랐다.[](source:skill-interview)[](source:skill-broken)[](source:skill-generate)[](source:skill-map)[](source:skill-prove)[](source:skill-offer) 조작 수단은 기존 하네스(Playwright·Cypress 스펙, expect 스크립트, PTY 도우미, `curl`로 부를 수 있는 엔드포인트, 디버그 포트)를 먼저 찾는다. 없을 때만 웹·Electron 앱에는 브라우저/CDP, CLI·TUI 앱에는 tmux/PTY, 서비스에는 일반 HTTP 요청을 쓴다.[](source:skill-interview)

## 생성되는 검증 스킬은 어떤 모양인가 {#output}

@tree id=verify-layout title="생성되는 폴더"
| root | .cursor/skills/verify-app | - |
| skill | SKILL.md | root |
| features | features | root |
| readme | README.md 색인 | features |
| feat | 기능 파일 3~5개 | features |
| helpers | 도우미 스크립트 | root |

`<app>` 자리는 앱 이름이다. frontmatter에는 `name: verify-<app>`과, 앱·표면·쓸 때를 밝힌 `description`이 있어야 한다. frontmatter 블록이 없으면 스킬이 등록되지 않는다.[](source:skill-generate) 도우미 스크립트는 만들 때만 생긴다.[](source:skill-sections)

| 절 | 반드시 담을 것 |
| --- | --- |
| Launch | 검증용 정확한 시작 명령, 준비됐음을 아는 신호(로그 줄, 포트 응답, 프롬프트), 종료 방법. 수명이 짧은 CLI·TUI 앱은 한 번 빌드하고, 조작마다 격리된 PTY나 tmux 세션을 새로 연다[](source:skill-sections) |
| Doctor | "이 인스턴스를 조작해도 되나"에 답하는 읽기 전용 검사 하나. 프로세스, 버전·빌드, 포트 소유, 인증. 뭔가 이상하면 먼저 돌린다[](source:skill-sections) |
| Drive | 이 저장소의 실제 선택자와 명령. 좌표나 탭 순서보다 ARIA 레이블, data 속성, 프롬프트 문자열, 경로 같은 안정된 손잡이를 쓴다[](source:skill-sections) |
| Evidence | 무엇을 어디에 저장하는지와 아래 증명 기준[](source:skill-evidence) |
| Cleanup | 이번 실행이 띄운 것만 끈다. 프로세스 이름으로 죽이지 않는다. 근거는 지우지 않고, 스킬이 정한 위치에 남긴다[](source:skill-sections) |
| Helpers | 동봉한 스크립트는 실행 가능해야 하고, 호출 방법을 본문에 보여 준다[](source:skill-sections) |

**증명 기준**(Evidence 절에 적을 것)[](source:skill-evidence)

- 내부 setter나 테스트 전용 엔드포인트가 아니라 실제 사용자 경로를 조작한다.
- 최종 화면만이 아니라 동작과 그 결과 상태를 함께 남긴다.
- 보이는 것과 함께 부수 효과(쓴 파일, 넣은 행, 보낸 메시지)를 확인한다.
- 모의 객체(mock)는 운영 경계가 이미 외부 시스템을 격리하는 곳에서만 쓴다.
- 안전한 경로가 `dry-run`이나 테스트 모드라면, 이름을 믿지 말고 실제로 무엇을 건너뛰는지 관찰한다. 어떤 `dry-run` 모드는 네트워크를 쓰거나 브라우저를 연다.

두 인스턴스를 나란히 돌릴 수 없으면 생성 스킬에 그렇게 적는다. 공유 인스턴스를 둘이 함께 조작해 사용자 세션을 망치느니 거절하는 편이 낫다고 원문은 말한다.[](source:skill-interview)

## 기능 지도 예시는 무엇을 보여 주나 {#feature-map}

`references/feature-map-example/`은 가상의 Notes 앱 지도다. 색인 하나와 기능 파일 둘(`create-note.md`, `search.md`)이 있다.[](source:ex-readme) 3단계는 이 모양을 따르라고 한다.[](source:skill-map)

| 기능 파일의 순서 | 담는 것 |
| --- | --- |
| H1 + 한 문단 | 사용자에게 보이는 동작[](source:ex-contract) |
| `Sub-features` | 짧은 ID와 동작 한 줄씩(예: `search-empty`)[](source:ex-search) |
| `How to get to it (user POV)` | 모든 사용자 진입점. 예: 툴바 버튼, 키 `/`, `notes search <query>`[](source:ex-search) |
| `Driving it with <harness>` | `Preconditions:`로 시작한다. 사용자 동작, 정확한 명령, 관찰할 결과를 짝지은 굵은 제목 목록[](source:ex-contract) |
| `Gotchas` | 검증 실행을 낭비하거나 무효로 만드는 함정[](source:ex-contract) |

H2는 정확히 이 네 개, 이 순서다. 지도에는 구현 세부를 넣지 않는다. 사용자 경로, 안정된 손잡이, 필요한 상태, 명령, 관찰할 증명만 적는다.[](source:ex-contract)

색인 `README.md`는 기능 목록 외에도 공통 규칙을 둔다.[](source:ex-base)[](source:ex-proof)

- 실행마다 일회용 데이터 폴더(`NOTES_DATA_DIR=/tmp/notes-verify-$RUN_ID`)를 써서 동시 실행이 상태를 공유하지 않게 한다.
- `control-notes doctor`로 URL, 데이터 폴더, 빌드 리비전을 확인한다. 이번 검증이 띄우지 않은 인스턴스는 조작하지 않는다.
- UI 증명은 ARIA 스냅숏과 앱이 보이는 스크린숏, CLI 증명은 명령·stdout·stderr·종료 코드다. 변경 증명은 저장된 값을 읽기 전용으로 한 번 더 본다.
- 닿지 못한 경로는 시도한 명령과 충족되지 않은 전제를 보고한다. 건너뛴 진입점을 다른 경로로 검증했다고 보고하지 않는다.

함정 예시도 구체적이다. 편집기에 포커스가 있을 때 `/`나 `n`을 누르면 글자가 입력된다. 검색은 디바운스가 있으니 고정 sleep 대신 결과 목록을 기다린다. 저장 상태 메시지만으로는 증명이 부족하고, 목록에서 다시 열어 본다.[](source:ex-search-gotcha)[](source:ex-create-gotcha)

판정: 예시의 하네스 이름은 `control-notes`라서 생성 규칙의 `verify-<app>`과 다르다. 이름 규칙이 아니라 지도 모양을 보여 주는 예시로 읽어야 한다.[](source:ex-base)[](source:skill-generate)

## 흐름 속 위치 {#position}

@workflow id=cvs-position title="create-verification-skill 앞뒤"
| before | setup-pstack · poteto-help | backend |
| create | create-verification-skill | backend |
| after | maintain-verification-skill | backend |
| before > create | 제안·언급 | |
| create > after | 인계 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `setup-pstack`의 제안 | - | 앱을 돌릴 수단이 없을 때 한 번. 사용자가 예라고 할 때만 실행 | r37 |
| `poteto-help`의 언급 | - | `verify-*`가 없고 증명에 관한 질문일 때 | r24 |
| 생성 완료 | `/maintain-verification-skill` 안내 | 생성을 마친 뒤. 주기는 물을 때만 | r80 |
| 만든 파일 | `verify-<app>/SKILL.md`, `features/*.md` | `maintain-verification-skill`이 찾아 고치는 공유 상태. 대상 프로젝트 저장소에 있다 | r81 |

`maintain-verification-skill`은 이 스킬이 만든 검증 스킬, 또는 기능 지도를 가진 다른 프로젝트 검증 스킬을 유지한다.[](source:maintain-intro) 대상이 없으면 이 스킬로 되돌려 보낸다(r82). 전체 흐름은 `pstack/_group-verify-harness/verify-harness.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `references/feature-map-example/README.md`, `create-note.md`, `search.md`. 네 파일 모두 원본이다.
- 제외한 파일: `SKILL.KO.md`, `references/feature-map-example/*.KO.md` 3개. 원본이 있는 번역본이다.
- 원문 비교: `verification-skills/pstack/create-verification-skill/`과 원문 동일(원장 기준). 이번에 참조 파일 3개도 `shasum`으로 비교했고 모두 같았다.
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
생성 경로가 `.cursor/skills/`로 고정되어 있다. 다른 에이전트 도구에서 어디에 둘지는 원문에 명시 없음. 실행 증명(4단계)이 몇 번까지 실패하면 멈추고 보고할지도 원문에 명시 없음. 근거를 남길 위치는 생성 스킬이 정한다고만 한다. 예시는 `artifacts/<feature>/` 아래를 쓴다.
