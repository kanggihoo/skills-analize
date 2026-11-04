# recall 스킬은 에이전트를 어떻게 바꾸나 {#recall-skill}

`recall`은 에이전트가 일을 시작하거나 이어서 하기 전에, 사용자의 최근 작업 맥락을 다시 세우게 하는 스킬이다. 에이전트는 그 결과로 "지금 어디까지 왔고 다음에 무엇을 할지"를 담은 짧은 브리핑을 낸다.[](source:core)

- 에이전트는 맥락을 두 기록에서 찾는다. 하나는 에이전트 자신의 채팅 기록이고, 다른 하나는 같은 코드 주변에서 일어난 일을 담은 공유 기록이다.[](source:records)
- 에이전트는 검색하기 전에 범위를 고정하고, 그 범위를 사용자에게 다시 말한다. 기간 기본값은 최근 7일이다.[](source:scope)
- 주제가 기능·파일·하위 시스템·버그를 가리키면, 공유 기록 조사를 기본으로 한다. 이 조사에는 `why`의 조사 담당(investigator)을 빌려 쓴다.[](source:sweep)
- 브리핑은 정해진 틀을 따른다. 틀은 네 부분이다. 요약 5줄 이하, 상태 태그가 붙은 thread(이어지는 작업 하나), 문제 5개 이하, 다음 할 일 하나다.[](source:contract)

@answer scope="pstack/recall · 원본 텍스트 파일 1개 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/recall/SKILL.md · 5212B · 본문(frontmatter)" path=pstack/recall/SKILL.md lines=1:5
@source core title="pstack/recall/SKILL.md · 목표와 범위" path=pstack/recall/SKILL.md lines=9:11
@source records title="pstack/recall/SKILL.md · 두 기록" path=pstack/recall/SKILL.md lines=13:13
@source transcripts title="pstack/recall/SKILL.md · 채팅 기록 위치" path=pstack/recall/SKILL.md lines=15:15
@source route title="pstack/recall/SKILL.md · 1단계 분류" path=pstack/recall/SKILL.md lines=17:17
@source scope title="pstack/recall/SKILL.md · 2단계 범위 고정" path=pstack/recall/SKILL.md lines=18:18
@source mine title="pstack/recall/SKILL.md · 3단계 채팅 기록 조사" path=pstack/recall/SKILL.md lines=19:19
@source sweep title="pstack/recall/SKILL.md · 4단계 공유 기록 조사" path=pstack/recall/SKILL.md lines=20:20
@source verify title="pstack/recall/SKILL.md · 5단계 현재 상태 확인" path=pstack/recall/SKILL.md lines=21:21
@source write title="pstack/recall/SKILL.md · 6단계 작성" path=pstack/recall/SKILL.md lines=22:22
@source contract title="pstack/recall/SKILL.md · 출력 틀" path=pstack/recall/SKILL.md lines=24:31
@source contract-rules title="pstack/recall/SKILL.md · 범위와 인용 규칙" path=pstack/recall/SKILL.md lines=33:35
@source help-row title="pstack/poteto-help/SKILL.md · 12884B · recall 안내 줄" path=pstack/poteto-help/SKILL.md lines=64:64
@source help-diff title="pstack/poteto-help/SKILL.md · recall·Session pickup 구분" path=pstack/poteto-help/SKILL.md lines=96:96
@source recipe title="pstack/poteto-help/references/recipes.md · 3287B · recall 사용 예" path=pstack/poteto-help/references/recipes.md lines=10:10
@source pm-pickup title="pstack/poteto-mode/SKILL.md · 20559B · Session pickup 플레이북" path=pstack/poteto-mode/SKILL.md lines=143:143
@source automate title="pstack/automate-me/SKILL.md · 7164B · description" path=pstack/automate-me/SKILL.md lines=1:5
@source why-cats title="pstack/why/SKILL.md · 10360B · 근거 일곱 갈래" path=pstack/why/SKILL.md lines=66:80
@source setup-lines title="pstack/setup-pstack/SKILL.md · 5548B · 역할 줄 목록" path=pstack/setup-pstack/SKILL.md lines=45:65

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/recall`을 입력할 때 켜진다. `recall`을 실행 단계로 부르는 pstack 스킬은 찾지 못했다. `poteto-help`가 "한 주제에 대한 자기 최근 작업을 따라잡을 때" 쓰라고 안내한다.[](source:help-row)

`poteto-help`의 예시 프롬프트에는 "지난주 이 주제 작업을 불러오고 이 이슈를 읽어라"라는 사용 예가 있다.[](source:recipe)

1단계 분류에서 요청이 다른 일로 분류되면, `recall`은 그 일을 맡지 않는다.[](source:route)

| 요청 | 가는 곳 |
| --- | --- |
| 이전 채팅 하나를 이어받기 | `poteto-mode`의 Session pickup 플레이북[](source:pm-pickup)[](source:help-diff) |
| 습관을 오래 쓸 스킬로 굳히기 | `automate-me`[](source:automate) |
| 사람이 읽을 작업 요약 | 다른 작업. 원문은 받을 스킬을 정하지 않는다 |
| 행동 전에 최근 여러 채팅의 맥락 불러오기 | `recall` |

사용자가 경로, branch, 변경 내용을 담은 capsule(상태 요약)을 이미 줬으면, 에이전트는 그 요약을 쓰고 채팅 기록 조사를 건너뛴다.[](source:route)

## 어떻게 진행하나 {#flow}

@workflow id=recall-flow title="recall 진행 흐름"
| route | 분류 | backend |
| scope | 범위 고정 | backend |
| mine | 채팅 조사 | backend |
| sweep | 공유 기록 | backend |
| verify | 상태 확인 | backend |
| brief | 브리핑 | frontend |
| route > scope | | |
| scope > mine | | emphasis |
| scope > sweep | | emphasis |
| mine > verify | | |
| sweep > verify | | |
| verify > brief | | |

@steps id=recall-steps
| s-route | 분류 | 에이전트가 요청이 `recall`의 일인지 먼저 가른다. 이전 채팅 하나 이어받기, 습관을 스킬로 굳히기, 사람이 읽을 요약은 다른 일이다. | recall-flow | route |
| s-scope | 범위 고정 | 에이전트가 기간, 주제, 작업 공간을 정하고 사용자에게 다시 말한다. "최근"은 실제 범위이고 기본은 7일이다. 작업 공간의 기본은 현재 공간이다. 범위가 "전부"이면 몰래 "최근 N개"로 줄이지 않는다. | recall-flow | scope |
| s-mine | 채팅 조사 | 에이전트가 빠르고 싼 모델의 서브에이전트를 병렬로 띄워서, 기록을 나눠 맡긴다. 채팅이 한두 개면, 나누지 않고 직접 찾는다. 원본 기록은 서브에이전트 안에 두고, 메인 스레드는 결과만 받는다. | recall-flow | mine |
| s-sweep | 공유 기록 | 주제가 기능·파일·하위 시스템·영역·버그를 가리키면 기본으로 한다. 사용자가 "내 작업"이라고 말해도 건너뛰지 않는다. 이 조사는 채팅 조사와 병렬로 돈다. | recall-flow | sweep |
| s-verify | 상태 확인 | 두 조사에서 나온 PR, branch, 티켓을 에이전트가 `git`과 `gh`로 확인한다. 답이 다른 에이전트가 실제로 한 일에 달려 있으면, 잘린 사본이 아니라 전체 기록을 읽는다. | recall-flow | verify |
| s-brief | 브리핑 | 에이전트가 출력 틀대로 쓴다. 작업 줄기별로 묶고, 정한 주제를 벗어나지 않는다. | recall-flow | brief |

조사 전 과정을 짧게 유지하고 주제에서 벗어나지 않는다. 범위 안 thread에 필요한 것만 읽고 멈춘다.[](source:core)

공유 기록 조사는 한 경우에만 건너뛴다. "이번 주 뭐 했지"처럼 대상 없이 활동만 묻는 경우다. 이때는 에이전트 자신의 기록과 현재 상태가 답의 전부다.[](source:sweep)

## 두 기록은 어떻게 찾나 {#records}

| 항목 | 자기 채팅 기록 | 공유 기록 |
| --- | --- | --- |
| 담긴 것 | 에이전트가 한 일과 결정[](source:records) | 사용자가 계속 보고하는 증상, 나갔다가 되돌린 수정, 운영에서 여전히 나는 오류[](source:records) |
| 위치 | `~/.cursor/projects/<slug>/agent-transcripts/<uuid>/<uuid>.jsonl`. 한 줄이 메시지 하나[](source:transcripts) | 소스 관리, 이슈 트래커, 대화·이슈 채널, 긴 문서, 오류 추적[](source:records) |
| 조사 방식 | 서브에이전트가 조각을 나눠 맡는다[](source:mine) | `why`의 출처별 조사 담당과 플레이북을 빌린다[](source:sweep) |
| 조사 질문 | 주제 검색 | "지금 상태는? 무엇을 시도했고 무엇이 버티지 못했나? 사용자는 아직 무엇을 보고하나?"[](source:sweep) |

`<slug>`는 작업 공간 경로에서 맨 앞 `/`를 떼고 나머지 `/`를 `-`로 바꾼 것이다. `/Users/you/proj`는 `Users-you-proj`가 된다.[](source:transcripts)

에이전트는 채팅 조사 서브에이전트에게 다음을 지시한다.[](source:mine)

- 후보는 이름(UUID)이 아니라 실제 수정 시각(`ls -t`) 순으로 고른다.
- 주제로 먼저 `grep`하고, 맞는 채팅의 관련 부분만 읽는다.
- 지금 채팅과 잡음(서브에이전트·평가·테스트 채팅)은 건너뛴다.
- 채팅 하나당 같은 틀로 결과를 돌려준다. 틀은 주제, 사용자 목표, 결정, 열린 줄기, 막힌 점과 고친 점, 산출물(PR, 티켓, branch)이다. 항목마다 채팅 `UUID`를 단다.

공유 기록 조사는 `why`의 자세를 물려받는다. 그 자세는 세 가지다. 출처마다 조사 담당 하나를 두고, 빈 결과도 결과로 보고, 쓸 수 없는 MCP 서버는 건너뛰면서 건너뛰었다고 말한다.[](source:sweep)

@callout level=warning title="다른 프로젝트 기록"
사용자가 요청하지 않으면 다른 프로젝트의 채팅 기록은 절대 읽지 않는다. 출력이 공개될 때는 사적인 맥락을 지운다.[](source:scope)[](source:contract-rules)

## 브리핑은 어떤 모양인가 {#contract}

에이전트의 답은 이 틀을 따른 브리핑 자체다. 요약, thread 상태, 문제, 다음 할 일 순서로 쓴다. 더 깊은 내용은 그 아래에 두거나 뺀다.[](source:contract)

| 절 | 규칙 |
| --- | --- |
| 요약(Capsule) | 5줄 이하. 이 작업이 무엇이고 전체적으로 어디까지 왔나 |
| thread(Threads) | 줄마다 한 줄로 쓰고, 상태 태그를 정확히 하나 붙인다. 태그가 없는 줄은 아직 끝나지 않은 것이니 태그를 단다 |
| 문제(Problems) | 5개 이하, 반복되는 것만. 사용자 증상과 되돌린 수정을 넣어 다음 시도가 실패 지점에서 시작하게 한다 |
| 다음 할 일(Next move) | 가장 쓸모 있는 구체적 행동 하나 |

상태 태그는 여섯 개다.[](source:contract)

| 태그 | 뜻 |
| --- | --- |
| `[merged #N]` | 병합됨 |
| `[open PR #N]` | PR이 열려 있음 |
| `[in flight <branch>]` | branch에서 진행 중 |
| `[verified, uncommitted]` | 확인했지만 commit하지 않음 |
| `[reverted #N]` | 되돌림 |
| `[planned, not started]` | 계획만 있음 |

@facts
| 기본 기간 | 최근 7일 |
| 요약 | 5줄 이하 |
| 문제 | 5개 이하 |
| 다음 할 일 | 1개 |
| 나누지 않는 기준 | 채팅 1~2개면 직접 찾는다 |

옆 기능이나 티켓은 이 작업을 막을 때만 넣는다. 요약과 thread가 한 화면을 넘으면, thread보다 세부 내용을 먼저 줄인다. 브리핑 글은 `unslop`을 거쳐 쓴다. 채팅에서 얻은 근거는 채팅 `UUID`로, 공유 기록에서 얻은 근거는 PR 번호·티켓 ID·채팅 링크·오류 추적 이슈로 출처를 단다.[](source:contract-rules)

## 흐름 속 위치 {#position}

@workflow id=recall-position title="recall 앞뒤의 스킬"
| p-user | 사용자 | external |
| p-recall | recall | backend |
| p-why | why 조사 담당 | backend |
| p-unslop | unslop | backend |
| p-other | 다른 경로 | backend |
| p-user > p-recall | /recall | |
| p-recall > p-why | 주제 | emphasis |
| p-recall > p-unslop | 브리핑 | emphasis |
| p-recall > p-other | 다른 일 | dashed |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| 사용자의 주제 | `why` 조사 담당에 바꾼 질문 → 공유 기록 조사 결과 | 주제가 기능·파일·하위 시스템·버그를 가리키면 기본 | r45 |
| 다른 일로 분류된 요청 | Session pickup 플레이북 또는 `automate-me` | 1단계 분류에서 | r46 |
| 브리핑 초안 | `unslop`으로 다듬은 글 | 요약 작성 | r47 |

전체 흐름은 `pstack/_group-understand/understand.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md` 하나. 이 스킬에는 다른 원본 파일이 없다.
- 호출 관계 확인용으로 `poteto-help/SKILL.md`, `poteto-help/references/recipes.md`, `poteto-mode/SKILL.md`, `automate-me/SKILL.md`, `why/SKILL.md`, `setup-pstack/SKILL.md` 일부를 읽었다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준).
- 실제로 실행해 보지 않았다. 그래서 페이지의 흐름은 모두 스킬에 적힌 지시상의 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="공유 기록의 갈래 수"
`recall`은 공유 기록을 다섯 갈래로 적는다.[](source:records) `why`는 일곱 갈래이고, `recall`에 없는 인프라 관측과 제품 분석 웨어하우스가 더 있다.[](source:why-cats) `recall`이 이 둘도 조사하는지는 원문에 명시 없음. 판정: 4단계가 `why`의 자세를 물려받으라고 하므로, 일곱 갈래 모두로 읽을 여지도 있다.[](source:sweep)

@callout level=open-question title="확인하지 못한 것"
채팅 조사의 "빠르고 싼 모델"은 이름이 없다. `pstack-models.mdc`에 `recall` 역할 줄도 없다.[](source:setup-lines) 공유 기록 조사가 `why investigators` 줄을 쓰는지, `why`의 종합 담당 단계를 거치는지도 원문에 명시 없음. capsule을 받았을 때 공유 기록 조사까지 건너뛰는지도 원문에 명시 없음.
