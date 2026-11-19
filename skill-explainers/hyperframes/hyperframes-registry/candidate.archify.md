# hyperframes-registry — 기성 block·component를 검색해 설치하는 스킬 {#overview}

`hyperframes-registry`는 에이전트가 이름 붙은 영상 효과를 손으로 만들기 전에, 약 450개 기성 item을 검색해 프로젝트에 설치하고 연결하게 하는 스킬이다.[](source:s-front) **부분 분석**이다. 폴더 밖 참조 2건은 읽지 않았다.

- 전환·overlay·caption 스타일·차트처럼 이름 붙은 시각 효과가 필요하면 직접 만들기 전에 켠다. item은 block(자체 timeline을 가진 장면)과 component(장면에 합치는 snippet) 두 종류다.[](source:s-front)[](source:s-table)
- 설치하면 block은 `compositions/<name>.html`, component는 `compositions/components/<name>.html`에 일반 source 파일로 남는다. 에이전트는 이를 고치고 줄여 쓴다.[](source:s-intro)[](source:s-block)[](source:s-comp)
- `hyperframes`는 다음 안내, 다른 네 스킬은 참고로 이 스킬을 가리킨다. `hyperframes`와는 같은 파일(`compositions/`)도 쓴다.
- on-device 검색의 약 33 MB 내려받기는 사용자 결정 없이 켜지 않는다. 맞는 item이 없으면 보고하기 전에 직접 만들지 않는다.[](source:s-local)[](source:s-miss)

@answer scope="hyperframes/hyperframes-registry · 원본 13개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source s-front title="frontmatter" path=hyperframes/hyperframes-registry/SKILL.md lines=1:4
@source s-plugin title="plugin 설치 안내" path=hyperframes/hyperframes-registry/SKILL.md lines=6:6
@source s-beacon title="사용 beacon" path=hyperframes/hyperframes-registry/SKILL.md lines=8:8
@source s-intro title="도입" path=hyperframes/hyperframes-registry/SKILL.md lines=12:12
@source s-cmd title="검색·설치 명령" path=hyperframes/hyperframes-registry/SKILL.md lines=16:21
@source s-query title="영어 검색어 규칙" path=hyperframes/hyperframes-registry/SKILL.md lines=23:23
@source s-local title="검색 범위와 on-device" path=hyperframes/hyperframes-registry/SKILL.md lines=24:24
@source s-narrow title="필터, 태그 설치, 네트워크" path=hyperframes/hyperframes-registry/SKILL.md lines=25:25
@source s-miss title="맞는 item이 없을 때" path=hyperframes/hyperframes-registry/SKILL.md lines=26:26
@source s-table title="item 분류표" path=hyperframes/hyperframes-registry/SKILL.md lines=30:47
@source s-block title="block 연결" path=hyperframes/hyperframes-registry/SKILL.md lines=51:51
@source s-comp title="component 연결" path=hyperframes/hyperframes-registry/SKILL.md lines=52:52
@source s-unit title="가장 큰 단위와 id 접두어" path=hyperframes/hyperframes-registry/SKILL.md lines=53:53
@source s-vars title="item 변수" path=hyperframes/hyperframes-registry/SKILL.md lines=54:54
@source s-beats title="beat 동기" path=hyperframes/hyperframes-registry/SKILL.md lines=55:55
@source s-paths title="설치 경로" path=hyperframes/hyperframes-registry/SKILL.md lines=56:56
@source s-contrib title="기여 안내" path=hyperframes/hyperframes-registry/SKILL.md lines=58:60
@source s-feedback title="검색어가 나가는 유일한 길" path=hyperframes/hyperframes-registry/references/search.md lines=42:42
@source s-hf title="human-friendly 선택기" path=hyperframes/hyperframes-registry/references/search.md lines=30:30
@source s-offline title="오프라인 동작" path=hyperframes/hyperframes-registry/references/search.md lines=52:54
@source s-wb-attrs title="block 필수 속성" path=hyperframes/hyperframes-registry/references/wiring-blocks.md lines=26:36
@source s-wb-time title="block timeline 조정" path=hyperframes/hyperframes-registry/references/wiring-blocks.md lines=38:40
@source s-wc title="component 합치는 순서" path=hyperframes/hyperframes-registry/references/wiring-components.md lines=5:14
@source s-wc-key title="component 원칙" path=hyperframes/hyperframes-registry/references/wiring-components.md lines=34:39
@source s-disc-rt title="runtime을 가리키는 item" path=hyperframes/hyperframes-registry/references/discovery.md lines=104:116
@source s-disc-shader title="shader transition 사용량" path=hyperframes/hyperframes-registry/references/discovery.md lines=63:63
@source s-ship title="기여 Ship 단계" path=hyperframes/hyperframes-registry/references/contributing.md lines=132:134
@source r-hf6 title="hyperframes의 plugin 안내" path=hyperframes/hyperframes/SKILL.md lines=6:6
@source r-hf13 title="hyperframes의 index.html" path=hyperframes/hyperframes/SKILL.md lines=13:13
@source r-hf16 title="hyperframes의 registry 안내" path=hyperframes/hyperframes/SKILL.md lines=16:16
@source r-cli25 title="hyperframes-cli의 명령표" path=hyperframes/hyperframes-cli/SKILL.md lines=25:25
@source r-remo41 title="remotion-to-hyperframes의 검색 안내" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=41:41
@source r-slide47 title="slideshow의 검색 안내" path=hyperframes/slideshow/SKILL.md lines=47:47
@source r-mu43 title="media-use의 marker highlight 안내" path=hyperframes/media-use/audio/references/captions/authoring.md lines=43:43

## 어떻게 동작하나 {#flow span=12}

그림에 없는 것이 둘 있다. 새 item을 upstream PR로 올리는 기여 모드는 별도 작업이라 그리지 않았다.[](source:s-contrib) 맞는 item을 찾지 못한 뒤 직접 만드는 방법은 원문에 명시 없음이다.[](source:s-miss)

@workflow id=flow-diagram title="hyperframes-registry 흐름"
| lane find | 찾는다 |
| lane install | 설치한다 |
| lane wire | 연결한다 |
| beacon | 사용 신호 보내기 | external | find | source:s-beacon |
| search | 영어로 검색 | backend | find | source:s-cmd |
| fit | 맞는 item 있나? | backend | find | source:s-miss |
| report | 못 찾음 보고 | backend | find | source:s-miss |
| hand | 직접 만들기 | external | find | source:s-miss |
| add | item 설치 | backend | install | source:s-cmd |
| kind | block인가? | backend | install | source:s-block |
| block | block 마운트 | backend | wire | source:s-block |
| comp | component 병합 | backend | wire | source:s-comp |
| tune | 다듬고 확인 | backend | wire | source:s-vars |
| beacon > search | 시작 직후 |
| search > fit | 결과 |
| fit > add | 있다 |
| fit > report | 없다 |
| report > hand | 보고 뒤 |
| add > kind | 파일 생성 |
| kind > block | 예 |
| kind > comp | 아니오 |
| block > tune | |
| comp > tune | |

@steps id=flow-steps
| s-beacon | 사용 신호 보내기 | **입력** 스킬이 시작된 시점 · **실행** `npx hyperframes events --skill=hyperframes-registry` · **출력** 스킬 이름이 담긴 사용 기록. **처리** 에이전트가 스킬이 시작될 때 CLI로 스킬 이름을 한 번 보낸다.[](source:s-beacon) **다음** 원문은 이 기록이 CLI의 통상 telemetry와 같고 opt-out을 따른다고만 적는다. | flow-diagram | beacon |
| s-search | 영어로 검색 | **입력** 비트가 해야 할 일 · **참조** `references/search.md` · **실행** `npx hyperframes catalog --query "<what the beat should do, in English>" --json` · **출력** 순위가 매겨진 item 목록. **처리** 에이전트가 영어 검색어로 catalog 전체를 순위 매긴다.[](source:s-cmd)[](source:s-query) **다음** 기본 `words` 단계는 검색어와 단어가 겹치는 item만 찾는다. `--on-device`는 약 33 MB를 한 번 내려받는다. 에이전트는 이를 사용자에게 제안하고 결정을 받는다.[](source:s-local) | flow-diagram | search |
| s-fit | 맞는 item 있나? | **입력** 검색 결과 목록 · **출력** 설치할 item 이름 또는 "맞는 것 없음". **처리** 에이전트가 결과 중 비트의 동작을 하는 item이 있는지 가른다.[](source:s-miss) **다음** `--type block\|component`와 `--tag <tag>`로 결과를 좁힐 수 있다.[](source:s-narrow) | flow-diagram | fit |
| s-report | 못 찾음 보고 | **입력** 실행한 검색어 · 필요했던 동작 · 답한 단계 · **실행** `npx hyperframes feedback --search-miss "<query>" --wanted "<the move you needed>" --tier <tier>` · **출력** 빈틈 보고. **처리** 에이전트가 직접 만들기 전에 카탈로그에 없던 동작을 보고한다.[](source:s-miss) **다음** `words`와 `on-device` 어느 쪽 결과든 보고한다. 상상한 item 이름이 아니라 원하던 효과를 적는다.[](source:s-miss) | flow-diagram | report |
| s-hand | 직접 만들기 | **입력** 보고를 마친 비트 · **출력** 에이전트가 직접 쓴 효과 코드. **처리** 원문은 직접 만들기 전에 보고하라는 데까지만 정한다. 만드는 방법은 원문에 명시 없음이다.[](source:s-miss) | flow-diagram | hand |
| s-add | item 설치 | **입력** 고른 item 이름 · **참조** `references/install-locations.md` · **실행** `npx hyperframes add <name> --json` · **출력** 쓰인 파일 목록과 mount snippet. **처리** CLI가 item을 `hyperframes.json`의 설치 경로 설정에 맞춰 쓴다.[](source:s-cmd)[](source:s-paths) **다음** `add <tag>`는 그 tag의 block을 전부 설치하고 의존 item을 먼저 설치한다. `add`는 이미 설치한 item도 네트워크가 있어야 한다.[](source:s-narrow) | flow-diagram | add |
| s-kind | block인가? | **입력** 설치한 item 종류 · **출력** 연결 방식. **처리** 에이전트가 block이면 마운트로, component면 병합으로 보낸다.[](source:s-block)[](source:s-comp) | flow-diagram | kind |
| s-block | block 마운트 | **입력** `compositions/<name>.html` · **참조** `references/wiring-blocks.md` · **출력** 호스트 `index.html`의 마운트 `<div>`. **처리** 에이전트가 `data-composition-src`, block 자신의 id와 같은 `data-composition-id`, `data-start`, 필요한 `data-duration`을 단 `<div>`로 마운트한다.[](source:s-block) **다음** reference 표는 `data-track-index`, `data-width`, `data-height`도 필수로 적는다. `data-duration`은 block 자체 길이를 넘지 않는다.[](source:s-wb-attrs) | flow-diagram | block |
| s-comp | component 병합 | **입력** `compositions/components/<name>.html` · **참조** `references/wiring-components.md` · **출력** 호스트 scene에 합친 markup·style·script. **처리** 에이전트가 snippet의 markup, `<style>`, script를 scene에 복사하고, 주석이 timeline 연결을 요구하면 따른다.[](source:s-comp) **다음** component는 호스트의 크기와 길이를 그대로 쓴다.[](source:s-wc-key) | flow-diagram | comp |
| s-tune | 다듬고 확인 | **입력** 연결한 item · **실행** `npx hyperframes beats --json`(beat 동기 block일 때) · `hyperframes lint` · **출력** 고친 item과 변수 값. **처리** 에이전트가 가장 큰 단위를 설치한 뒤 편집하고, 설치한 id의 접두어는 그대로 둔다.[](source:s-unit) **다음** 변수는 `data-variable-values`로 mount마다 정한다. beat 시간은 beats 결과에서 mount의 `data-start`를 뺀다. 연결한 뒤 `hyperframes lint`를 돌리라고 reference가 적는다.[](source:s-vars)[](source:s-beats)[](source:s-wc-key) | flow-diagram | tune |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(description). 이름 붙은 시각 효과를 손으로 만들기 전과 `hyperframes add`·`catalog` 요청에서 켜진다. 호출 제한 필드는 없다.[](source:s-front) |
| 성격 | 기성 block·component를 `catalog`로 찾고 `add`로 설치해 직접 만들지 않게 하는 스킬이다.[](source:s-cmd) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `hyperframes` {#rel-r02} | **이 스킬** | 다음 안내 | 이름 붙은 효과·전환·caption 스타일·차트·카드를 손으로 쓰기 전에 registry를 검색하라고 한다. 조건부 의무 어조다.[](source:r-hf16) |
| `hyperframes-cli` {#rel-r09} | **이 스킬** | 참고 | 명령표의 Reuse 행이 `catalog`, `add`를 이 스킬로 연결한다. 의무 표현은 없다.[](source:r-cli25) |
| **이 스킬**(외 6개 스킬) {#rel-r13} | `hyperframes` | 참고 | HyperFrames plugin 안일 때만 `plugin-installation.md`의 plugin execution rules를 따르라고 가리킨다.[](source:s-plugin)[](source:r-hf6) |
| `remotion-to-hyperframes` {#rel-r17} | **이 스킬** | 참고 | 소스가 쓴 이름 붙은 시각 효과를 손으로 만들기 전에 `catalog --query`를 검색한다. 스킬 이름이 아니라 명령으로 지목한다.[](source:r-remo41) |
| `slideshow` {#rel-r18} | **이 스킬** | 참고 | 같은 문장으로 `catalog --query` 검색을 권한다. 스킬 이름이 아니라 명령으로 지목한다.[](source:r-slide47) |
| **이 스킬** {#rel-r26} | `hyperframes` | 같은 파일 | `add`로 설치한 block은 `compositions/<name>.html`에 쓰이고, `index.html`이 `compositions/`의 sub-composition을 mount한다. 설치 경로는 `hyperframes.json`이 정한다.[](source:s-block)[](source:s-paths)[](source:r-hf13) |
| **이 스킬** {#rel-r30} | `hyperframes` | 참고 | 일부 item(Liquid Glass 등)이 `/hyperframes`의 `references/runtimes.md`에 있는 runtime을 가리킨다.[](source:s-disc-rt) |
| `media-use` {#rel-r32} | **이 스킬** | 참고 | marker highlight 등은 registry를 검색(`catalog`, `add`)하라고 한다. 스킬 이름 `/hyperframes-registry`는 `audio/references/captions/authoring.md`에 있다.[](source:r-mu43) |

@architecture id=relation-map title="hyperframes-registry와 이어지는 스킬"
| hf | hyperframes | backend |
| cli | hyperframes-cli | backend |
| remo | remotion-to-hyperframes | backend |
| slide | slideshow | backend |
| media | media-use | backend |
| self | hyperframes-registry(이 스킬) | backend |
| hf > self | 다음 안내 |
| cli > self | 참고 |
| remo > self | 참고 |
| slide > self | 참고 |
| media > self | 참고 |
| self > hf | 참고 · 같은 파일 |

@code source=s-front language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | description, 검색·설치 명령, item 분류표, 연결 요약, 기여 안내 | 스킬이 켜질 때 읽는다. | 사용 신호 보내기, 영어로 검색, item 설치, 다듬고 확인 |
| `references/search.md` | catalog 순위, `--json` 필드, 오프라인 동작, 빈틈 보고 | `SKILL.md`가 가리킨다. 검색 결과를 해석할 때 읽는다. | 영어로 검색, 못 찾음 보고 |
| `references/discovery.md` | catalog 필터, item manifest 필드, 손으로 고른 item 표본 | `search.md`가 필터 설명을 이 파일로 보낸다. | 영어로 검색, 맞는 item 있나? |
| `references/install-locations.md` | 설치 경로와 `hyperframes.json` | `SKILL.md`가 가리킨다. 설치 위치를 확인할 때 읽는다. | item 설치 |
| `references/wiring-blocks.md` | block 마운트 속성과 위치 지정 | `SKILL.md`가 가리킨다. block을 설치한 뒤 읽는다. | block 마운트 |
| `references/wiring-components.md` | component 병합 순서와 원칙 | `SKILL.md`가 가리킨다. component를 설치한 뒤 읽는다. | component 병합, 다듬고 확인 |
| `examples/add-block.md` | `data-chart` 설치부터 lint·preview까지의 예 | 다른 파일이 가리키지 않는다. | block 마운트 |
| `examples/add-component.md` | `shimmer-sweep` 설치부터 timeline 호출까지의 예 | `wiring-components.md`가 가리킨다. | component 병합 |
| `references/contributing.md` | 새 item을 PR로 올리는 6단계 | `SKILL.md`가 기여 작업에서 가리킨다. | 없음(기여 모드, 상세 후보) |
| `references/templates.md` | caption·VFX·component 시작 파일과 `registry-item.json` 틀 | `SKILL.md`와 `contributing.md`가 가리킨다. | 없음(기여 모드, 상세 후보) |
| `references/component-quality-bar.md` | component를 남길지 자를지 가르는 감사 기준 | `SKILL.md`가 기여 작업에서 가리킨다. | 없음(기여 모드, 상세 후보) |
| `references/placeholder-material.md` | 자리표시 내용을 무채색으로 만드는 규칙 | `contributing.md`가 색을 고르기 전에 읽으라고 한다. | 없음(기여 모드, 상세 후보) |
| `references/demo-html-pattern.md` | component의 `demo.html` 규약. `add`는 이를 설치하지 않는다. | 다른 파일이 가리키지 않는다. | 없음(기여 모드, 상세 후보) |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 이름 붙은 시각 효과를 손으로 만들려 할 때 | 직접 만들기 전에 이 스킬로 검색한다. 권고 어조다. | [](source:s-front) |
| 스킬이 시작될 때 | `npx hyperframes events --skill=hyperframes-registry`를 한 번 실행한다. | [](source:s-beacon) |
| 검색어가 영어가 아닐 때 | `No searchable words in query`가 나온다. 빈틈이 아니므로 보고하지 않는다. | [](source:s-query) |
| `--on-device` 검색을 쓰려 할 때 | 약 33 MB 내려받기를 사용자에게 제안하고 결정을 받는다. 조용히 켜지 않는다. | [](source:s-local) |
| 오프라인일 때 | 검색은 캐시한 manifest로 된다. `add`는 이미 설치한 item도 네트워크가 필요하다. 오프라인 설치를 약속하지 않는다. | [](source:s-narrow)[](source:s-offline) |
| 어느 단계에서든 맞는 item이 없을 때 | 직접 만들기 전에 `feedback --search-miss`로 보고한다. | [](source:s-miss) |
| 검색어를 밖으로 보낼 때 | 검색어가 나가는 유일한 길은 이 보고 명령이다. 일반 검색은 아무것도 보내지 않는다. | [](source:s-feedback) |
| `--human-friendly`로 catalog를 열 때 | 고른 item을 바로 설치한다. agent와 CI에서는 `--json` 뒤에 명시적 `add`를 쓴다. | [](source:s-hf) |
| `hyperframes registry` 명령 | 그런 명령은 없다. 검색은 `catalog`, 설치는 `add`다. | [](source:s-cmd) |
| 설치한 item의 id | 접두어를 그대로 둔다. 두 item이 충돌하지 않게 하려는 규칙이다. | [](source:s-unit) |
| block의 `data-duration` | block 자체 길이를 넘지 않는다. | [](source:s-wb-attrs) |
| shader transition block | 한 영상에 2개 이하로 쓴다. 권고 어조다. | [](source:s-disc-shader) |
| Liquid Glass block | WebGPU를 켠 Brave나 Chrome canary가 필요하고 `PRODUCER_HEADLESS_SHELL_PATH`를 지정한다. | [](source:s-disc-rt) |
| plugin 안에서 설치했을 때 | plugin execution rules를 따른다. 규칙 파일은 읽지 않았다. | [](source:s-plugin) |
| 새 item을 기여할 때 | Ship 단계는 모두 필수다. 하나라도 빠지면 catalog 항목이 깨진다. | [](source:s-ship) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- item 기여 6단계(Clarify부터 Ship) — 맡을 개요 항목: 파일 패널의 `references/contributing.md`. 설치·연결 흐름과 다른 모드라 개요에 담지 않았다.
- caption block의 필수 규칙(96px 이상 글자, `fitTextFontSize`, 모든 group의 hard kill) — 맡을 개요 항목: 기여 모드. 새 item을 만들 때만 쓰는 규칙이라 뺐다.
- component 품질 기준(F1~F5 치명, X1~X8 수리, 중복 중 남길 item) — 맡을 개요 항목: 기여 모드. 감사 때만 쓰는 기준이라 뺐다.
- 무채색 자리표시 규칙(ink 불투명도 72·45·18·8%, hairline 14%, accent 한 요소) — 맡을 개요 항목: 기여 모드. 새 item의 색을 고를 때만 쓴다.
- 검색 단계와 `--json` 필드(`dropped`, `unindexed`, `top_score`, 24시간 manifest 갱신) — 맡을 개요 항목: 영어로 검색. 결과 해석 세부라 뺐다.
- block 마운트 속성 7개와 위치·겹침 지정 — 맡을 개요 항목: block 마운트. 필수 속성 표와 CSS 예시가 길어서 뺐다.
- component 병합 순서와 `shimmer-sweep` 예 — 맡을 개요 항목: component 병합. 코드 예시가 길어서 뺐다.
- item 분류 표본(shader transition 14개, Liquid Glass, code 계열) — 맡을 개요 항목: item 설치. 표본일 뿐 목록의 원본은 `catalog` 검색이라 뺐다.

@callout level=open-question title="확인하지 못한 것"
| 폴더 밖 참조 2건(`../hyperframes/references/plugin-installation.md`, `/hyperframes`의 `references/runtimes.md`)은 읽지 않았다.
| CLI 내부(`catalog` 순위, `add`의 파일 쓰기, `events` 전송)는 코드를 보지 못해 내부 구현 미확인이다.
| item 수가 원문 안에서 다르다. `SKILL.md`는 약 450개, `discovery.md`는 block 180개, `placeholder-material.md`는 250개라고 적는다. 시점 차이인지는 원문에 명시 없음이다.
| `discovery.md`의 Liquid Glass 표는 제목에 7개라 적고 5행만 보인다. 표는 표본이라고 밝히고 있어 누락인지는 원문에 명시 없음이다.
| caption 스타일을 `SKILL.md`는 component로, `contributing.md`와 `templates.md`는 block으로 분류한다. 원문끼리 충돌하며 우선순위는 원문에 명시 없음이다.
| 빈틈 보고(`feedback`)에 사용자 확인이 필요한지는 원문에 명시 없음이다.

읽은 원본: 텍스트 파일 13개. 제외: 없음.
