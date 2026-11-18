# 새 영상 한 편을 만들 때 네 스킬은 어떻게 이어지나? {#group-build-video}

에이전트는 `hyperframes`를 먼저 읽고, 필요할 때만 `hyperframes-registry`와 `media-use`를 꺼내고, 확인·렌더 단계에서 `hyperframes-cli`를 쓴다. **강제 순서는 `hyperframes` 안의 작업 루프뿐이고 나머지 셋은 조건이 맞을 때 쓰는 도구다.**[](source:hf-loop)

- 입구 스킬 `hyperframes`가 계약과 작업 루프를 정하고, 이름 붙은 효과는 registry로, media는 `media-use`로 보낸다.[](source:hf-top)
- `hyperframes-cli`는 `lint`, `check`, `snapshot`, `preview`, `render` 순서의 확인 루프를 정한다.[](source:cli-loop)
- 네 스킬은 서로를 자동으로 실행하지 않는다. `assets/`, `compositions/`, `hyperframes.json`, `.hyperframes/` 같은 프로젝트 파일로 이어진다.
- 스킬 내부 규칙은 각 스킬의 개요 페이지에서 본다. 이 페이지는 스킬 사이의 순서와 주고받는 것만 다룬다.

@answer scope="hyperframes 컬렉션 · 묶음 build-video · 스킬 4개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source hf-top title="CLI 실행, 프로젝트 구조, registry·media 위임" path=hyperframes/hyperframes/SKILL.md lines=12:16
@source hf-loop title="작업 루프와 렌더 조건" path=hyperframes/hyperframes/SKILL.md lines=45:50
@source hf-contract title="계약 중 media 처리" path=hyperframes/hyperframes/SKILL.md lines=32:32
@source cli-table title="작업별 명령표" path=hyperframes/hyperframes-cli/SKILL.md lines=18:33
@source cli-loop title="확인과 렌더 루프" path=hyperframes/hyperframes-cli/SKILL.md lines=35:43
@source cli-hist title="project history 규칙" path=hyperframes/hyperframes-cli/SKILL.md lines=56:60
@source cli-clean title="clean 주의" path=hyperframes/hyperframes-cli/SKILL.md lines=85:85
@source cli-refs title="명령별 reference 안내" path=hyperframes/hyperframes-cli/SKILL.md lines=103:103
@source cli-plug title="plugin 규칙 지목(cli)" path=hyperframes/hyperframes-cli/SKILL.md lines=6:6
@source reg-plug title="plugin 규칙 지목(registry)" path=hyperframes/hyperframes-registry/SKILL.md lines=6:6
@source reg-find title="검색과 설치" path=hyperframes/hyperframes-registry/SKILL.md lines=14:26
@source reg-wire title="설치 위치와 연결" path=hyperframes/hyperframes-registry/SKILL.md lines=49:56
@source media-plug title="plugin 규칙 지목(media-use)" path=hyperframes/media-use/SKILL.md lines=6:6
@source media-res title="저장 위치와 resolve 명령" path=hyperframes/media-use/SKILL.md lines=12:18
@source media-credit title="credit 한도" path=hyperframes/media-use/SKILL.md lines=40:40
@source sty-credit title="credit 한도 파일 쓰기(묶음 밖)" path=hyperframes/style-sampling/SKILL.md lines=54:54

## 에이전트는 네 스킬을 어떤 순서로 쓰나? {#flow span=12}

`hyperframes`에서 시작해 효과와 media가 필요한지 가린 뒤 composition을 쓰고, `hyperframes-cli` 루프로 확인한다. 효과를 먼저 가리고 media를 나중에 가리는 순서는 읽기 쉽게 정한 판정이다. 원문은 두 호출의 순서와 횟수를 정하지 않는다(원문에 명시 없음).

그림은 핵심 경로만 그렸다. 렌더 위치(local, docker, batch, cloud)와 사람 승인 뒤의 동작은 생략했다.

@workflow id=build-flow title="영상 만들기 묶음 흐름"
| hf | hyperframes 읽기 | frontend | source:hf-top |
| fx | 이름 붙은 효과가 필요한가? | backend | source:hf-top |
| reg | hyperframes-registry | database | source:reg-find |
| md | media가 필요한가? | backend | source:hf-top |
| media | media-use | cloud | source:media-res |
| write | composition 쓰기 | frontend | source:hf-top |
| cli | hyperframes-cli 확인 루프 | backend | source:cli-loop |
| ok | 렌더해도 되나? | backend | source:hf-loop |
| render | render | backend | source:cli-loop |
| wait | 멈추고 기다림 | external | source:hf-loop |
| hf > fx | |
| fx > reg | yes | emphasis |
| fx > md | no |
| reg > md | |
| md > media | yes | emphasis |
| md > write | no |
| media > write | |
| write > cli | |
| cli > ok | |
| ok > render | yes | emphasis |
| ok > wait | no |

@steps id=build-steps
| s-hf | hyperframes 읽기 | 계약, 작업 루프, 요청별 안내표를 읽고 만들 범위를 정한다.[](source:hf-top) | build-flow | hf |
| s-fx | 이름 붙은 효과가 필요한가? | 이름 붙은 효과·전환·caption 스타일·차트·카드를 손으로 쓰기 전에 registry를 검색할지 가른다.[](source:hf-top) | build-flow | fx |
| s-reg | hyperframes-registry | `catalog --query`로 찾고 `add <name>`으로 설치한다. 맞는 항목이 없으면 직접 만들기 전에 알린다.[](source:reg-find) | build-flow | reg |
| s-md | media가 필요한가? | 발표자·footage·voice·music 같은 media가 필요하면 `/media-use`로 보낸다.[](source:hf-top) | build-flow | md |
| s-media | media-use | `media-use resolve`로 media를 구해 `assets/`에 파일과 ledger 기록으로 둔다.[](source:media-res) | build-flow | media |
| s-write | composition 쓰기 | 설치한 항목과 media를 `index.html`과 `compositions/`의 scene에 연결해 쓴다.[](source:hf-top)[](source:reg-wire) | build-flow | write |
| s-cli | hyperframes-cli 확인 루프 | `lint`, `check --json`, `snapshot`, `preview --background` 순서로 확인한다.[](source:cli-loop) | build-flow | cli |
| s-ok | 렌더해도 되나? | 사람이 Studio preview를 승인했거나 파일·무정지를 요청했고 check와 review가 통과했으면 렌더한다.[](source:hf-loop) | build-flow | ok |
| s-render | render | `render --quality looks -o out.mp4`로 렌더하고 파일 길이를 확인한다.[](source:cli-loop) | build-flow | render |
| s-wait | 멈추고 기다림 | 조건이 맞지 않으면 preview에서 멈추고 사람의 다음 요청을 기다린다.[](source:hf-loop) | build-flow | wait |

## 스킬 사이에 무엇을 넘기고 참고하나? {#relations span=12}

원장의 관계 중 이 묶음의 스킬끼리 이어진 행이다. 다음 안내와 참고는 자동 실행이 아니다. 그림에는 `fx > reg`(R02)와 `md > media`(R03)만 그렸고 나머지는 표에만 있다.

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `hyperframes` {#g-r01} | `hyperframes-cli` | 참고 | CLI는 `npx hyperframes <command>`로 돌리고 사용법은 `/hyperframes-cli`를 본다. 의무 표현 없음[](source:hf-top) |
| `hyperframes` {#g-r29} | `hyperframes-cli` | 참고 | R01과 같은 연결의 구체 명령이다. `check`, `snapshot`, `preview`, `render`는 `npx hyperframes`로 한다고만 쓰고 명령 안내는 CLI 스킬에 있다[](source:hf-loop) |
| `hyperframes` {#g-r02} | `hyperframes-registry` | 다음 안내 | 이름 붙은 효과를 손으로 쓰기 전에 registry를 검색한다. 조건부 의무 어조이고 전달물은 검색 결과와 설치된 파일이다[](source:hf-top)[](source:reg-find) |
| `hyperframes` {#g-r03} | `media-use` | 다음 안내 | 모든 media는 `/media-use`가 맡는다. 계약 11번도 grade·grain·blur를 `media-treatment`로 보낸다. 전달물은 `assets/`의 media 파일이다[](source:hf-top)[](source:hf-contract) |
| `hyperframes-cli` {#g-r09} | `hyperframes-registry` | 참고 | 명령표의 Reuse 행에서 `catalog`, `add`를 `/hyperframes-registry`로 연결한다[](source:cli-table) |
| `hyperframes-cli` {#g-r10} | `media-use` | 참고 | 명령표의 Media and sound 행에서 `media-treatment`, `tts` 등을 `/media-use`로 연결한다[](source:cli-table) |
| `hyperframes-cli` {#g-r12} | `hyperframes` | 참고 | `captions`는 명령이 아니므로 `transcribe` 뒤에 `../hyperframes/references/captions.md`를 읽는다. `keyframes`는 `motion.md`를 읽는다[](source:cli-table)[](source:cli-refs) |
| `hyperframes-cli`, `hyperframes-registry`, `media-use` {#g-r13} | `hyperframes` | 참고 | 세 스킬이 모두 첫 줄에서 HyperFrames plugin 안일 때만 `plugin-installation.md` 규칙을 따르라고 한다. 원장 행은 일곱 스킬을 묶었고 나머지 넷은 이 묶음 밖이다[](source:cli-plug)[](source:reg-plug)[](source:media-plug) |
| `hyperframes-registry` {#g-r30} | `hyperframes` | 참고 | 일부 item 설명이 `/hyperframes`의 `references/runtimes.md`를 가리킨다. 원문은 원장의 출처 줄에 있고 이 페이지는 읽지 않았다 |
| `media-use` {#g-r31} | `hyperframes` | 참고 | reference가 `/hyperframes`의 `format.md`, `captions.md`, `motion.md`, `runtimes.md`를 가리킨다. 이 페이지는 읽지 않았고 원장 출처 줄에 있다 |
| `media-use` {#g-r32} | `hyperframes-registry` | 참고 | marker highlight 같은 강조는 registry를 검색하라고 한다. 스킬 이름은 caption 작성 reference에 있다. 이 페이지는 읽지 않았다 |
| `media-use` {#g-r25} | `hyperframes` | 같은 파일 | `assets/`를 함께 쓴다. 선후 관계 없음. 아래 공유 상태 표 참고[](source:media-res)[](source:hf-top) |
| `hyperframes-registry` {#g-r26} | `hyperframes` | 같은 파일 | `compositions/`와 `hyperframes.json`을 함께 쓴다. 선후 관계 없음[](source:reg-wire)[](source:hf-top) |
| `hyperframes` {#g-r27} | `hyperframes-cli` | 같은 파일 | `.hyperframes/` history를 함께 쓴다. 선후 관계 없음[](source:hf-loop)[](source:cli-hist) |

위 표에서 R30, R31, R32는 원장 출처 줄에만 근거가 있고 이 묶음 작업에서 원문을 다시 열지 않았다. 이 묶음 밖 스킬(`reverse-any-video`, `style-sampling`, `slideshow`, `remotion-to-hyperframes`)로 가는 R04~R08, R11, R24는 생략했다.

## 어떤 파일과 상태를 함께 쓰나? {#state span=12}

누가 먼저 쓰는지는 정해져 있지 않다. 쓰는 주체는 원문이 지시한 동작이며 실행으로 확인하지 않았다.

| 파일·상태 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `assets/` | `media-use`가 media를 local 파일과 ledger 기록으로 둔다[](source:media-res) | `hyperframes`가 media와 font는 `assets/`에 있다고 정한다[](source:hf-top) |
| `compositions/` | `hyperframes-registry`의 `add`가 block을 `compositions/<name>.html`에 쓴다[](source:reg-wire) | `hyperframes`의 `index.html`이 `compositions/`의 sub-composition을 mount한다[](source:hf-top) |
| `compositions/components/` | `hyperframes-registry`의 `add`가 component를 쓴다[](source:reg-wire) | 원문에 명시 없음. 에이전트가 markup을 자기 scene에 복사한다[](source:reg-wire) |
| `hyperframes.json` | 원문에 명시 없음(원장: `init`이 만든다고 되어 있으나 이 작업에서 확인하지 않음) | `hyperframes-registry`의 `add`가 설치 경로를 여기서 가져온다[](source:reg-wire) |
| `.hyperframes/` history | `hyperframes-cli`가 `history begin`과 `history end`를 지시한다. 쓰는 주체는 CLI다[](source:cli-hist) | `hyperframes`가 변경 전에 `history --since mine --who <you>`로 사람의 편집을 읽는다[](source:hf-loop). 지우지 않는다[](source:cli-clean) |
| `.hyperframes/credit-limit.json` | `media-use`가 사람이 말한 한도를 쓴다. 묶음 밖 `style-sampling`도 같은 파일에 쓴다[](source:media-credit)[](source:sty-credit) | `media-use`가 유료 호출을 한도에서 거절한다(지시상 동작)[](source:media-credit) |
