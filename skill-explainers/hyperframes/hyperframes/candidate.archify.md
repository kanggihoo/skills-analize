# hyperframes — HTML을 영상으로 렌더하는 작업의 계약과 순서 {#overview}

hyperframes는 에이전트가 HTML을 영상으로 렌더하는 HyperFrames로 영상을 만들 때 따를 계약과 작업 순서를 정한다.[](source:core)

- 영상을 만들거나 고치거나 움직이거나 렌더하라는 요청이면 먼저 읽는다. 질문·보류·막연한 생각에는 파일을 고치지 않고 답하거나 제안한다.[](source:fm)[](source:core)
- 결과로 `index.html`, `compositions/`, `assets/`가 남는다. 15초를 넘는 이야기 영상에는 `STORYLINES.md`, `SPEC.md`, `REVIEW.md`도 남고, 승인되면 영상 파일을 render한다.[](source:core)[](source:loop)[](source:story)
- 다른 스킬과는 다음 안내 6개와 참고 2개로 이어지고, 나머지 7개 스킬이 이 스킬의 계약을 참고한다. 관계 패널에 줄마다 적었다.
- 에이전트는 skill 설치·갱신을 직접 하지 않는다. 요청이나 원본이 부르지 않으면 voiceover, captions, 새 aspect ratio도 넣지 않는다.[](source:life)[](source:core)

@answer scope="hyperframes/hyperframes · 원본 파일 74개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source fm title="frontmatter: 이름과 description" path=hyperframes/hyperframes/SKILL.md lines=1:4
@source beacon title="시작할 때 보내는 usage beacon" path=hyperframes/hyperframes/SKILL.md lines=8:8
@source core title="렌더 방식, 프로젝트 구조, 기본값, 위임" path=hyperframes/hyperframes/SKILL.md lines=12:16
@source contract title="계약 12개" path=hyperframes/hyperframes/SKILL.md lines=18:33
@source edit title="편집 가능하게 만드는 규칙" path=hyperframes/hyperframes/SKILL.md lines=35:43
@source loop title="작업 순서" path=hyperframes/hyperframes/SKILL.md lines=45:50
@source app title="HyperFrames desktop app 규칙" path=hyperframes/hyperframes/SKILL.md lines=52:58
@source route title="요청별 읽을 파일과 다른 스킬 안내" path=hyperframes/hyperframes/SKILL.md lines=60:79
@source story title="storyline 3개와 사람 선택" path=hyperframes/hyperframes/references/story.md lines=25:31
@source story-skip title="story를 건너뛰는 경우" path=hyperframes/hyperframes/references/story.md lines=5:5
@source review title="review 측정 단계" path=hyperframes/hyperframes/references/review.md lines=5:12
@source life title="skill 설치·갱신은 사람의 단계" path=hyperframes/hyperframes/references/skill-lifecycle.md lines=3:8
@source plug title="plugin 안에서의 실행 규칙" path=hyperframes/hyperframes/references/plugin-installation.md lines=9:16
@source cli-cap title="hyperframes-cli: captions 명령 안내" path=hyperframes/hyperframes-cli/SKILL.md lines=31:31
@source cli-km title="hyperframes-cli: keyframes 안내" path=hyperframes/hyperframes-cli/SKILL.md lines=103:103
@source cli-loop title="hyperframes-cli: 작업 루프" path=hyperframes/hyperframes-cli/SKILL.md lines=35:44
@source cli-hist title="hyperframes-cli: 프로젝트 history" path=hyperframes/hyperframes-cli/SKILL.md lines=56:60
@source cli-disk title="hyperframes-cli: .hyperframes 보존" path=hyperframes/hyperframes-cli/SKILL.md lines=85:85
@source plug-line title="다른 스킬 7개의 plugin 안내 줄" path=hyperframes/hyperframes-cli/SKILL.md lines=6:6
@source rev12 title="reverse-any-video: 계약에 맞춰 만든다" path=hyperframes/reverse-any-video/SKILL.md lines=12:12
@source rem title="remotion-to-hyperframes: 번역과 Hosted 단계" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=25:45
@source slide12 title="slideshow: 일반 composition" path=hyperframes/slideshow/SKILL.md lines=12:12
@source ss30 title="style-sampling: 목록 밖 스타일의 두 길" path=hyperframes/style-sampling/SKILL.md lines=30:30
@source mu12 title="media-use: assets에 local 파일로 둔다" path=hyperframes/media-use/SKILL.md lines=12:12
@source mu-ops title="media-use: format.md 안내" path=hyperframes/media-use/references/operations.md lines=22:22
@source mu-motion title="media-use: captions·motion·runtimes 안내" path=hyperframes/media-use/audio/references/captions/motion.md lines=85:86
@source reg-add title="hyperframes-registry: add가 쓰는 위치" path=hyperframes/hyperframes-registry/SKILL.md lines=51:56
@source reg-disc title="hyperframes-registry: runtimes.md 안내" path=hyperframes/hyperframes-registry/references/discovery.md lines=104:116

## 어떻게 동작하나 {#flow span=12}

그림은 가장 흔한 길 하나만 그린다. `check`가 error를 내면 고쳐서 다시 돌린다는 되돌림은 그림에 없다. 이는 "fix every error"라는 지시다.[](source:loop) 계약 12개와 요청별로 읽을 파일은 아래 표와 파일 패널에 있다.

@workflow id=flow-diagram title="hyperframes 흐름"
| ask | 변경 요청인가? | external | source:core |
| reply | 답·제안만 | backend | source:core |
| read | 기존 상태 읽기 | backend | source:loop |
| start | 새 프로젝트 시작 | backend | source:core |
| long | 15초 넘는 이야기인가? | external | source:loop |
| plan | story·SPEC 쓰기 | backend | source:loop |
| build | 계약대로 만들기 | backend | source:contract |
| check | check 실행 | backend | source:loop |
| review | snapshot으로 보기 | backend | source:loop |
| ok | 승인됐나? | external | source:loop |
| preview | preview에서 멈춤 | backend | source:loop |
| render | render | backend | source:loop |
| ask > reply | 아니오 |
| ask > read | 예, 기존 프로젝트 |
| ask > start | 예, 새 영상 |
| read > build | |
| start > long | |
| long > plan | 예 |
| long > build | 아니오 |
| plan > build | |
| build > check | |
| check > review | |
| review > ok | |
| ok > preview | 아니오 |
| ok > render | 예 | emphasis |

@steps id=flow-steps
| s-ask | 변경 요청인가? | **입력** 사용자 요청 · **참조** `SKILL.md` · **실행** `npx hyperframes events --skill=hyperframes` · **출력** 변경 여부 판단. **처리** 스킬이 시작될 때 스킬 이름만 담은 usage beacon을 한 번 보내고[](source:beacon), 요청이 변경인지 가른다.[](source:core) **다음** 질문·보류·막연한 생각은 파일을 고치지 않는다. | flow-diagram | ask |
| s-reply | 답·제안만 | **입력** 질문·보류·막연한 생각 · **출력** 답 또는 제안. **처리** 에이전트가 파일을 고치지 않고 답하거나 제안한다.[](source:core) | flow-diagram | reply |
| s-read | 기존 상태 읽기 | **입력** 기존 프로젝트 · **실행** `npx hyperframes timeline --json` · `npx hyperframes history --since mine --who <you>` · **출력** 무엇이 언제 재생되는지와 사용자가 바꾼 내용. **처리** 지난 턴 이후 사용자가 바꾼 것을 읽고 그 위에 만든다.[](source:loop) | flow-diagram | read |
| s-start | 새 프로젝트 시작 | **입력** 새 영상 요청 · **실행** `npx hyperframes usage --json` · `npx hyperframes init <dir> --skip-skills --skill=hyperframes` · `npx hyperframes capture <url> --json` · **출력** 남은 plan usage 보고, 프로젝트 폴더, 웹사이트 capture. **처리** 새 영상을 시작할 때 남은 plan usage를 알리고(모르면 "unknown"), 프로젝트를 만든다. capture는 웹사이트가 주제일 때만 쓴다.[](source:core) | flow-diagram | start |
| s-long | 15초 넘는 이야기인가? | **입력** 새 영상 요청 · **출력** story 단계 여부. **처리** 15초를 넘고 무언가를 이야기하는 영상인지 가른다.[](source:loop) **다음** 짧은 단일 아이디어 조각과 기존 프로젝트 edit는 story를 건너뛴다.[](source:story-skip) | flow-diagram | long |
| s-plan | story·SPEC 쓰기 | **입력** 15초 넘는 이야기 영상 요청 · **참조** `references/types/launch.md` 등 종류별 파일 · `references/story.md` · `references/spec.md` · **출력** `STORYLINES.md`, `SPEC.md`. **처리** 종류 파일을 읽고 서로 다른 storyline 3개를 말로만 써서 사람이 고르게 한 뒤, 고른 것을 `SPEC.md`로 쓴다.[](source:loop)[](source:story) **다음** 사람이 파일이나 no stops를 요청했으면 멈추지 않고 추천안으로 만든다. | flow-diagram | plan |
| s-build | 계약대로 만들기 | **입력** 요청과 `SPEC.md`(있으면) · **참조** `SKILL.md`의 계약 절 · `references/format.md` · 요청 종류별 reference · **출력** `index.html`, `compositions/`, `assets/`. **처리** 계약 12개와 편집 가능 규칙을 지켜 timed element를 HTML에 쓴다.[](source:contract)[](source:edit) **다음** 이름 붙은 효과·전환·차트는 손으로 쓰기 전에 registry를 검색하고, media는 `/media-use`로 보낸다.[](source:core) | flow-diagram | build |
| s-check | check 실행 | **입력** 마지막 편집을 마친 프로젝트 · **실행** `npx hyperframes check --json` · **출력** 위반·경고 목록. **처리** 에이전트가 error를 모두 고치고 warning을 하나씩 따진다.[](source:loop) | flow-diagram | check |
| s-review | snapshot으로 보기 | **입력** check를 통과한 프로젝트 · **참조** `references/review.md` · **실행** `npx hyperframes snapshot --review` · **출력** 시트 3장, `REVIEW.md`. **처리** 영화는 시트를 보고 약점을 고친 뒤 `REVIEW.md`를 쓰고, 작은 edit는 바꾼 곳만 snapshot해 보고 답한다.[](source:loop) | flow-diagram | review |
| s-ok | 승인됐나? | **입력** check와 review 결과, 사용자 반응 · **출력** render 여부. **처리** 사람이 preview를 승인했는지, 파일이나 no stops를 요청했는지 가른다.[](source:loop) | flow-diagram | ok |
| s-preview | preview에서 멈춤 | **입력** 승인되지 않은 프로젝트 · **실행** `npx hyperframes preview` · **출력** preview 링크. **처리** preview를 열어 사람에게 주고 답을 기다린다.[](source:loop) **다음** 사람이 수정을 요청하면 처음부터 다시 돈다. 원문에 명시 없음. | flow-diagram | preview |
| s-render | render | **입력** 승인 또는 파일·no stops 요청 · **실행** `npx hyperframes render` · **출력** 영상 파일. **처리** delivery render 전에 preview를 열고, 끝난 뒤 Framey 안내를 전한다.[](source:app) **다음** 명령이 `catch-up`을 지시하면 다음 변경 전에 `npx hyperframes catch-up [dir]`를 돌린다. | flow-diagram | render |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령 `/hyperframes`(Claude plugin에서는 `/hyperframes:hyperframes`) 또는 모델이 description을 보고 판단한다. 호출 제한 필드는 원문에 명시 없음.[](source:fm)[](source:plug) |
| 성격 | 계약(원칙)과 작업 순서(절차)를 정하고, 요청 종류에 맞는 reference와 스킬로 안내하는 진입 스킬이다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#rel-r01} | hyperframes-cli | 참고 | CLI는 `npx hyperframes <command>`로 돌리고 사용법은 `/hyperframes-cli`를 본다. 의무 표현은 없다.[](source:core) |
| **이 스킬** {#rel-r02} | hyperframes-registry | 다음 안내 | 이름 붙은 효과·전환·caption 스타일·차트·카드를 손으로 쓰기 전에 registry를 검색한다. 조건부 의무 어조다.[](source:core) |
| **이 스킬** {#rel-r03} | media-use | 다음 안내 | 발표자·avatar·footage·voice·music 같은 media는 모두 `/media-use`가 맡는다. 계약 11번도 grade·grain·blur를 `media-treatment`(`/media-use`)로 보낸다.[](source:core)[](source:contract) |
| **이 스킬** {#rel-r04} | reverse-any-video | 다음 안내 | 요청이 "복사하거나 다시 만들 영상"일 때다. 안내표의 한 행이고 강제는 아니다.[](source:route) |
| **이 스킬** {#rel-r05} | style-sampling | 다음 안내 | 요청이 "검증된 스타일의 에피소드"일 때다. 안내표의 한 행이고 강제는 아니다.[](source:route) |
| **이 스킬** {#rel-r06} | slideshow | 다음 안내 | 요청이 deck(발표)일 때 `/slideshow`를 쓴다. 온디맨드 스킬이라 설치돼 있지 않을 수 있고, 사용자가 `npx hyperframes skills update <name>`으로 설치한다.[](source:route)[](source:life) |
| **이 스킬** {#rel-r07} | remotion-to-hyperframes | 다음 안내 | 입력이 Remotion source일 때 `/remotion-to-hyperframes`를 쓴다. 온디맨드 스킬이라 설치돼 있지 않을 수 있다.[](source:route)[](source:life) |
| **이 스킬** {#rel-r08} | figma(범위 밖) | 참고 | "Figma: `/figma`"로만 적혀 있다. 온디맨드 스킬이다.[](source:route) |
| hyperframes-cli {#rel-r12} | **이 스킬** | 참고 | `captions`는 명령이 아니므로 `transcribe`를 돌린 뒤 `../hyperframes/references/captions.md`를 읽는다. `keyframes`는 `../hyperframes/references/motion.md`를 본다.[](source:cli-cap)[](source:cli-km) |
| hyperframes-cli, hyperframes-registry, media-use, remotion-to-hyperframes, reverse-any-video, slideshow, style-sampling {#rel-r13} | **이 스킬** | 참고 | 7개 스킬이 모두 첫 줄에서 "HyperFrames plugin 안이라면 plugin execution rules를 따르라"며 `../hyperframes/references/plugin-installation.md`를 가리킨다. 조건은 plugin 안일 때뿐이다.[](source:plug-line)[](source:core) |
| reverse-any-video {#rel-r14} | **이 스킬** | 참고 | 결과물은 `/hyperframes` 계약에 맞춰 만든다. 의무 어조다.[](source:rev12)[](source:contract) |
| remotion-to-hyperframes {#rel-r15} | **이 스킬** | 참고 | Native 단계에서 `/hyperframes` 계약으로 번역하고, Hosted 단계는 `../hyperframes/references/runtimes.md`의 seek 규약을 따른다.[](source:rem)[](source:contract) |
| slideshow {#rel-r16} | **이 스킬** | 참고 | "slideshow는 일반 composition이고 `/hyperframes` 계약이 적용된다".[](source:slide12)[](source:contract) |
| style-sampling {#rel-r22} | **이 스킬** | 다음 안내 | 5개 템플릿에 없는 스타일이면 두 길을 제안한다. 한 길이 스타일의 문법을 가져와 새 영화를 만드는 `/hyperframes`("From a reference", `look.md`)다. 제안이고 사용자가 고른다.[](source:ss30) |
| media-use {#rel-r25} | **이 스킬** | 같은 파일 | `media-use`는 media를 프로젝트 `assets/`에 local 파일과 ledger 기록으로 둔다. `/hyperframes`는 media와 font가 `assets/`에 있다고 하고 asset 경로를 `assets/...`로 정한다. 선후 관계는 없다.[](source:mu12)[](source:core) |
| hyperframes-registry {#rel-r26} | **이 스킬** | 같은 파일 | `add`로 설치한 block은 `compositions/<name>.html`에 쓰이고, `/hyperframes`의 `index.html`이 `compositions/`의 sub-composition을 mount한다. 설치 경로는 `hyperframes.json`이 정한다.[](source:reg-add)[](source:core) |
| **이 스킬** {#rel-r27} | hyperframes-cli | 같은 파일 | `/hyperframes`는 변경 전에 `history --since mine --who <you>`로 사용자가 바꾼 것을 읽고 그 위에 만든다. `/hyperframes-cli`는 턴 시작에 `history begin`, 끝에 `history end`를 하라고 하고 `.hyperframes`를 지우지 말라고 한다.[](source:loop)[](source:cli-hist)[](source:cli-disk) |
| **이 스킬** {#rel-r29} | hyperframes-cli | 참고 | "렌더·`check`·`snapshot`·`preview`·`render`는 `npx hyperframes`로 한다"고만 쓴다. CLI 안내는 `/hyperframes-cli`에 있다.[](source:core)[](source:loop)[](source:cli-loop) |
| hyperframes-registry {#rel-r30} | **이 스킬** | 참고 | 일부 item(Liquid Glass 등)은 `/hyperframes` → `references/runtimes.md`의 runtime을 가리킨다.[](source:reg-disc) |
| media-use {#rel-r31} | **이 스킬** | 참고 | media-use의 reference가 `/hyperframes` → `references/format.md`, `captions.md`, `motion.md`, `runtimes.md`를 가리킨다.[](source:mu-ops)[](source:mu-motion) |

그림에는 줄 일부만 그렸다. 빠진 줄은 위 표에 모두 있다.

@architecture id=relation-map title="hyperframes와 이어지는 스킬"
| cli | hyperframes-cli | backend |
| rev | reverse-any-video | backend |
| style | style-sampling | backend |
| self | hyperframes(이 스킬) | backend |
| reg | hyperframes-registry | backend |
| media | media-use | backend |
| slide | slideshow | backend |
| rem | remotion-to-hyperframes | backend |
| figma | figma(범위 밖) | external |
| cli > self | 참고 |
| rev > self | 참고 |
| style > self | 다음 안내 |
| self > cli | 참고 |
| self > reg | 다음 안내 |
| self > media | 다음 안내 |
| self > rev | 다음 안내 |
| self > style | 다음 안내 |
| self > slide | 다음 안내 |
| self > rem | 다음 안내 |
| self > figma | 참고 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 계약 12개, 작업 순서, 요청별 안내 표 | 스킬이 켜질 때 | 변경 요청인가?; 계약대로 만들기; check 실행; 승인됐나?; render |
| `references/types/launch.md`, `explainer.md`, `music.md`, `data.md`, `vertical.md`, `3d.md`, `character.md` | 영상 종류별 형태와 금지 목록 | 요청이 안내표의 해당 종류일 때 | story·SPEC 쓰기 |
| `references/story.md` | 이야기 짜는 법: storyline 3개, hook, beat | 15초를 넘는 이야기 영상을 새로 만들 때 | story·SPEC 쓰기 |
| `references/spec.md` | `SPEC.md` 틀과 기본 금지 목록 | story에서 storyline을 고른 뒤 | story·SPEC 쓰기 |
| `references/storyboard.md`, `references/storyboard-format.md` | 장면을 still로 만들어 승인받는 방법과 `STORYBOARD.md` 형식 | 사람이 storyboard를 요청하거나 shot 승인을 먼저 받고 싶을 때 | story·SPEC 쓰기 |
| `references/look.md` | design spec, brand, reference에서 look을 정하는 법과 preset 13종 | 다른 영화의 스타일을 새 주제에 쓸 때 | 계약대로 만들기 |
| `references/format.md` | composition 형식, 속성, 변수, 글꼴, lint 오류 | scenes·attributes·media·lint를 다룰 때 | 계약대로 만들기 |
| `references/runtimes.md` | GSAP, Lottie, Three.js 등 runtime과 seek 규약 | GSAP·Lottie·3D·canvas를 쓸 때 | 계약대로 만들기 |
| `references/motion.md` | 모션 수치, 전환, 모션 확인 방법 | eases·titles·cuts·punch-ins·speed·holds를 다룰 때 | 계약대로 만들기 |
| `references/captions.md`, `references/overlays.md` | 자막 작성·배치와 talking head 위 카드 | captions나 카드 요청일 때 | 계약대로 만들기 |
| `references/film.md` | 사이트·PR·음악·지도·kinetic type으로 영상 만들기 | 실제 장소, 사이트, PR, 스크립트, kinetic type 요청일 때 | 계약대로 만들기 |
| `references/sound.md` | 음악과 효과음 기본값, 음량 | 15초를 넘는 이야기 영상을 만들 때 | 계약대로 만들기 |
| `references/path-tracing.md` | path tracing 3D의 export 계약 | 3D 종류 파일이 지목할 때 | 계약대로 만들기 |
| `references/review.md` | 영화 review 절차와 `REVIEW.md` | 새 영화이거나 timing·layout을 바꾼 edit를 마쳤을 때 | snapshot으로 보기 |
| `references/skill-lifecycle.md` | skill 설치·갱신과 CLI pin 점검 | 사람이 설치·갱신을 묻거나 스킬이 이상하게 동작할 때 | 새 프로젝트 시작 |
| `references/plugin-installation.md` | plugin 안에서의 실행 규칙 | HyperFrames plugin 안에서 실행될 때 | 모든 단계(plugin 안일 때) |
| `scripts/plugin-cli.mjs`, `scripts/lib/main-module.mjs`, `scripts/lib/windows-exe-search.mjs` | plugin이 고른 CLI 버전으로 명령을 돌리는 launcher | plugin 안에서 `npx hyperframes` 대신 쓴다 | 모든 단계(plugin 안일 때) |
| `scripts/plugin-cli.test.mjs`, `scripts/lib/main-module.test.mjs`, `scripts/lib/windows-exe-search.test.mjs` | launcher 테스트 | 원문에 명시 없음 | 쓰지 않음 |
| `scripts/bake-basemap.mjs` | 실제 지도 camera move를 MP4로 굽는다 | `film.md`의 "Maps and real places"가 지목할 때 | 계약대로 만들기 |
| `scripts/locate.mjs` | 이미지 안의 한 지점을 격자로 좁혀 찾는다 | `film.md`의 "Short motion pieces"가 지목할 때 | 계약대로 만들기 |
| `assets/frame-presets/<13종>/` | slide-deck look의 `FRAME.md`, `caption-skin.html`, `frame-showcase.html` | 사용자가 preset 이름을 대거나 deck일 때 | 계약대로 만들기 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 요청이 질문·보류·막연한 생각이다 | 금지: 파일을 고치지 않고 답이나 제안만 한다 | [](source:core) |
| 요청이나 원본이 부르지 않았다 | 금지: voiceover, captions, 새 aspect ratio를 넣지 않는다 | [](source:core) |
| 새 영상을 만든다 | 기본값: 1920×1080, 30 fps다 | [](source:core) |
| 15초를 넘는 이야기 영상이고 침묵 요청이 없다 | 기본: 음악 bed와 눈에 보이는 동작의 효과음을 넣는다 | [](source:core) |
| 실제 제품 화면·로고·장소가 있다 | 강제 성격의 지시: 소스의 실제 것을 보이고, 소스에 없는 것만 그린다 | [](source:core) |
| 모든 timed element | 강제: `class="clip"`, `data-start`, `data-duration`(초)을 쓴다. 영상 길이는 root `data-duration`이다. 넘치면 잘리고 일찍 끝나면 마지막 frame이 남는다 | [](source:contract) |
| `Date.now()`, seed 없는 `Math.random()`, network fetch, timer, `repeat: -1` | 금지: 보이는 모든 것은 timeline 시간의 함수여야 한다 | [](source:contract) |
| `.clip`의 `display`, `visibility`, `autoAlpha` | 금지: tween하지 않고 자식을 움직인다 | [](source:contract) |
| media 재생 | 금지: `play()`, `pause()`, seek를 하지 않는다. `<audio>`에 `id`가 없으면 mix에서 빠진다 | [](source:contract) |
| footage의 grade·grain·blur·vignette | 금지: CSS filter 대신 `npx hyperframes media-treatment`(`/media-use`)를 쓴다 | [](source:contract) |
| 내용을 배치한다 | 강제: 내용은 90% action-safe 안에, caption과 핵심 글자는 80% title-safe 안에 둔다 | [](source:edit) |
| 15초를 넘는 이야기 영상을 새로 만든다 | 승인 지점: storyline 3개를 보이고 사람이 고를 때까지 멈춘다. 파일이나 no stops 요청이면 추천안으로 만든다 | [](source:loop)[](source:story) |
| 마지막 편집을 마쳤다 | 강제: `npx hyperframes check --json`을 돌려 error를 모두 고치고 warning을 따진다 | [](source:loop) |
| 사람이 preview를 승인했거나 파일·no stops를 요청했고 check·review를 통과했다 | render한다. 그렇지 않으면 preview에서 멈추고 기다린다 | [](source:loop) |
| 새 영상의 delivery render 전이다 | 강제: no-questions 모드에서도 preview를 열고 거기서 편집할 수 있다고 말한다. 앱 이름은 "the HyperFrames desktop app"이고 "Studio"가 아니다 | [](source:app) |
| 어떤 명령이 `catch-up`을 지시한다 | 다음 변경 전에 `npx hyperframes catch-up [dir]`를 돌린다. 나온 목록은 사용자의 작업이지 새 요청이 아니다 | [](source:app) |
| skill 설치·갱신·제거가 필요하다 | 금지: 에이전트가 실행하지 않는다. 낡은 것과 맞는 명령을 사용자에게 알린다 | [](source:life) |
| HyperFrames plugin 안에서 실행한다 | 금지: `hyperframes skills update`, `skills check`, `npx skills add`를 돌리지 않는다. 명령은 `plugin-cli.mjs` launcher로 돌린다 | [](source:plug) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 계약 12개와 lint 오류 전체 — 개요 항목 "계약대로 만들기"와 한계 표의 계약 행 · 결과를 바꾸는 규칙만 개요에 담았다.
- 이야기와 SPEC 작성 — 개요 항목 "story·SPEC 쓰기" · storyline의 device·form 표, beat 비율, `SPEC.md` 틀과 기본 금지 목록은 개요에 넣지 않았다.
- review 절차 — 개요 항목 "snapshot으로 보기" · `check`가 재는 경고 이름, 시트 3장, P0~P2 등급, `REVIEW.md` 내용을 담지 않았다.
- 모션·자막·카드·소리 수치 — 개요 항목 "계약대로 만들기" · `motion.md`, `captions.md`, `overlays.md`, `sound.md`의 수치와 전환 표는 요청 종류마다 달라서 뺐다.
- 영상 종류 7개 — 개요 항목 "story·SPEC 쓰기" · `references/types/`의 종류별 형태와 금지 목록을 따로 풀 수 있다.
- 소스에서 만들기 — 개요 항목 "계약대로 만들기" · `film.md`의 사이트 capture, PR, 음악, 지도 bake, kinetic type 수치를 담지 않았다.
- 설치·plugin 규칙 — 개요 항목 "새 프로젝트 시작" · `skill-lifecycle.md`의 신선도 점검과 CLI pin 갱신, `plugin-installation.md`의 launcher 규칙은 결과를 바꾸지 않아 뺐다.
- frame preset 13종과 보조 script — 개요 항목 "계약대로 만들기" · preset 표와 `bake-basemap.mjs`, `locate.mjs` 사용법은 개요에 넣지 않았다.

@callout level=open-question title="확인하지 못한 것"
| `check`, `snapshot`, `usage`, `events`, `render` 같은 CLI 명령의 내부 구현은 내부 구현 미확인이다. 원문의 지시만 옮겼다. |
| `/slideshow`, `/remotion-to-hyperframes`, `/figma`가 실제로 설치돼 있는지는 원문에 명시 없음이다. |
| `assets/frame-presets/` 39개 파일과 라이선스 3개, 테스트 script 3개는 구조·표본만 확인했다. |

읽은 원본: 텍스트 파일 74개. `SKILL.md`, `references/`, `scripts/` 32개는 읽었고 테스트 script 3개는 앞부분만 봤다. frame-presets 39개와 라이선스 3개는 구조·표본만 확인했다. 제외: `*.KO.md` 24개(번역본), `.woff2` 6개(바이너리).
