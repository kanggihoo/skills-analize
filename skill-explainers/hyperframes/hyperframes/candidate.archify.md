# HyperFrames 스킬은 에이전트가 영상을 만들 때 무엇을 정해 주나? {#hyperframes-hub}

`/hyperframes`는 HTML을 영상으로 렌더하는 HyperFrames로 영상을 만들거나 고칠 때 에이전트가 가장 먼저 읽는 입구 스킬이다.[](source:sk-fm) **모든 영상이 지켜야 할 계약 12개, 작업 순서, 렌더 전에 멈출 지점**을 정하고, 세부 규칙은 reference 파일과 하위 스킬에 넘긴다.[](source:sk-intro)[](source:sk-read)

- 사람이 launch 영상, explainer, 뮤직비디오, chart, 지도, 세로 clip, title card, caption, overlay를 만들거나 고치거나 렌더하려 할 때 읽는다. 질문, 보류, 막연한 아이디어에는 편집 대신 답이나 제안만 한다.[](source:sk-fm)[](source:sk-intro)
- 에이전트는 `index.html`, `compositions/`, `assets/`의 project 파일을 만든다. 15초를 넘는 이야기 영상이면 `STORYLINES.md`, `SPEC.md`, `REVIEW.md`도 남긴다.[](source:sk-intro)[](source:sk-loop)[](source:r-story-pick)
- 요청이나 source가 요구하지 않으면 voiceover, caption, 새 aspect ratio를 넣지 않는다. 사람이 승인하기 전에는 렌더하지 않고, 스킬 설치와 갱신은 사람의 단계로 남긴다.[](source:sk-intro)[](source:sk-loop)[](source:r-life)
- 이 페이지는 **부분 분석**이다. 하위 스킬 본문과 CLI의 실제 동작은 폴더 밖이라 읽지 않았고, preset 13종 중 12종은 구조와 표본만 확인했다.

@answer scope="hyperframes/hyperframes 원본 · 부분 분석 · CLI 동작은 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=243a9028dc78fe13c6f64b1a5c199bc9939ccc06
@source sk-fm title="스킬 frontmatter" path=hyperframes/hyperframes/SKILL.md lines=1:4
@source sk-start title="시작 시 plugin·beacon 지시" path=hyperframes/hyperframes/SKILL.md lines=6:8
@source sk-intro title="스킬 개요와 기본 방침" path=hyperframes/hyperframes/SKILL.md lines=10:16
@source sk-contract title="계약 12조" path=hyperframes/hyperframes/SKILL.md lines=18:33
@source sk-edit title="편집 가능성 규칙" path=hyperframes/hyperframes/SKILL.md lines=35:43
@source sk-loop title="작업 루프" path=hyperframes/hyperframes/SKILL.md lines=45:50
@source sk-app title="desktop app 규칙" path=hyperframes/hyperframes/SKILL.md lines=52:58
@source sk-read title="요청별 안내표" path=hyperframes/hyperframes/SKILL.md lines=60:79
@source r-story title="스토리 계획 규칙" path=hyperframes/hyperframes/references/story.md
@source r-spec title="SPEC.md 작성 규칙" path=hyperframes/hyperframes/references/spec.md
@source r-review title="검토 절차" path=hyperframes/hyperframes/references/review.md
@source r-look title="룩 정하기와 preset 표" path=hyperframes/hyperframes/references/look.md
@source r-film title="source별 영화 제작 수치" path=hyperframes/hyperframes/references/film.md
@source r-format title="composition 형식" path=hyperframes/hyperframes/references/format.md
@source r-motion title="모션 규칙" path=hyperframes/hyperframes/references/motion.md
@source r-runtimes title="애니메이션 runtime" path=hyperframes/hyperframes/references/runtimes.md
@source r-captions title="caption 규칙" path=hyperframes/hyperframes/references/captions.md
@source r-overlays title="말하는 사람 위 카드 규칙" path=hyperframes/hyperframes/references/overlays.md
@source r-sound title="소리 규칙" path=hyperframes/hyperframes/references/sound.md
@source r-sb title="storyboard 만드는 절차" path=hyperframes/hyperframes/references/storyboard.md
@source r-sbf title="STORYBOARD.md 형식" path=hyperframes/hyperframes/references/storyboard-format.md
@source r-life title="스킬 설치와 최신 상태" path=hyperframes/hyperframes/references/skill-lifecycle.md
@source r-plugin title="plugin 실행 규칙" path=hyperframes/hyperframes/references/plugin-installation.md
@source r-path title="path tracing 3D" path=hyperframes/hyperframes/references/path-tracing.md
@source r-story-skip title="story 단계 생략 조건" path=hyperframes/hyperframes/references/story.md lines=3:5
@source r-story-pick title="storyline 세 개 쓰고 고르기" path=hyperframes/hyperframes/references/story.md lines=15:31
@source r-spec-ban title="기본 금지 목록" path=hyperframes/hyperframes/references/spec.md lines=50:64
@source r-spec-num title="구성 수치" path=hyperframes/hyperframes/references/spec.md lines=41:48
@source r-review-measure title="측정 단계" path=hyperframes/hyperframes/references/review.md lines=5:12
@source r-format-lint title="자주 만나는 lint 오류" path=hyperframes/hyperframes/references/format.md lines=142:159
@source r-look-presets title="preset 사용 규칙" path=hyperframes/hyperframes/references/look.md lines=25:27
@source t-3d title="3D type" path=hyperframes/hyperframes/references/types/3d.md
@source t-char title="캐릭터 type" path=hyperframes/hyperframes/references/types/character.md
@source t-data title="데이터 type" path=hyperframes/hyperframes/references/types/data.md
@source t-expl title="explainer type" path=hyperframes/hyperframes/references/types/explainer.md
@source t-launch title="launch type" path=hyperframes/hyperframes/references/types/launch.md
@source t-music title="뮤직비디오 type" path=hyperframes/hyperframes/references/types/music.md
@source t-vert title="세로 영상 type" path=hyperframes/hyperframes/references/types/vertical.md
@source x-plugin title="plugin용 CLI launcher" path=hyperframes/hyperframes/scripts/plugin-cli.mjs
@source x-plugin-test title="launcher 테스트" path=hyperframes/hyperframes/scripts/plugin-cli.test.mjs
@source x-locate title="이미지 속 위치 찾기 script" path=hyperframes/hyperframes/scripts/locate.mjs
@source x-bake title="지도 camera 이동을 MP4로 굽는 script" path=hyperframes/hyperframes/scripts/bake-basemap.mjs
@source x-main title="CLI 진입점 판별 helper" path=hyperframes/hyperframes/scripts/lib/main-module.mjs
@source x-main-test title="진입점 helper 테스트" path=hyperframes/hyperframes/scripts/lib/main-module.test.mjs
@source x-win title="프로그램 탐색 경로 guard" path=hyperframes/hyperframes/scripts/lib/windows-exe-search.mjs
@source x-win-test title="guard 테스트" path=hyperframes/hyperframes/scripts/lib/windows-exe-search.test.mjs
@source fr-by title="preset 명세" path=hyperframes/hyperframes/assets/frame-presets/biennale-yellow/FRAME.md
@source cs-by title="caption 스킨 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/biennale-yellow/caption-skin.html
@source sh-by title="preset contact sheet 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/biennale-yellow/frame-showcase.html
@source fr-bf title="preset 명세" path=hyperframes/hyperframes/assets/frame-presets/blockframe/FRAME.md
@source cs-bf title="caption 스킨 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/blockframe/caption-skin.html
@source sh-bf title="preset contact sheet 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/blockframe/frame-showcase.html
@source fr-bp title="preset 명세" path=hyperframes/hyperframes/assets/frame-presets/blue-professional/FRAME.md
@source cs-bp title="caption 스킨 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/blue-professional/caption-skin.html
@source sh-bp title="preset contact sheet 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/blue-professional/frame-showcase.html
@source fr-bo title="preset 명세" path=hyperframes/hyperframes/assets/frame-presets/bold-poster/FRAME.md
@source cs-bo title="caption 스킨 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/bold-poster/caption-skin.html
@source sh-bo title="preset contact sheet 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/bold-poster/frame-showcase.html
@source fr-br title="preset 명세" path=hyperframes/hyperframes/assets/frame-presets/broadside/FRAME.md
@source cs-br title="caption 스킨 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/broadside/caption-skin.html
@source sh-br title="preset contact sheet 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/broadside/frame-showcase.html
@source fr-cp title="preset 명세" path=hyperframes/hyperframes/assets/frame-presets/capsule/FRAME.md
@source cs-cp title="caption 스킨 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/capsule/caption-skin.html
@source sh-cp title="preset contact sheet 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/capsule/frame-showcase.html
@source fr-ct title="preset 명세" path=hyperframes/hyperframes/assets/frame-presets/cartesian/FRAME.md
@source cs-ct title="caption 스킨 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/cartesian/caption-skin.html
@source sh-ct title="preset contact sheet 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/cartesian/frame-showcase.html
@source fr-cg title="preset 명세" path=hyperframes/hyperframes/assets/frame-presets/cobalt-grid/FRAME.md
@source cs-cg title="caption 스킨 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/cobalt-grid/caption-skin.html
@source sh-cg title="preset contact sheet 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/cobalt-grid/frame-showcase.html
@source fr-ce title="preset 명세" path=hyperframes/hyperframes/assets/frame-presets/code-editorial/FRAME.md
@source cs-ce title="caption 스킨 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/code-editorial/caption-skin.html
@source sh-ce title="preset contact sheet 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/code-editorial/frame-showcase.html
@source fr-co title="preset 명세" path=hyperframes/hyperframes/assets/frame-presets/coral/FRAME.md
@source cs-co title="caption 스킨 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/coral/caption-skin.html
@source sh-co title="preset contact sheet 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/coral/frame-showcase.html
@source fr-cm title="preset 명세" path=hyperframes/hyperframes/assets/frame-presets/creative-mode/FRAME.md
@source cs-cm title="caption 스킨 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/creative-mode/caption-skin.html
@source sh-cm title="preset contact sheet 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/creative-mode/frame-showcase.html
@source fr-dd title="preset 명세" path=hyperframes/hyperframes/assets/frame-presets/daisy-days/FRAME.md
@source cs-dd title="caption 스킨 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/daisy-days/caption-skin.html
@source sh-dd title="preset contact sheet 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/daisy-days/frame-showcase.html
@source fr-ef title="preset 명세" path=hyperframes/hyperframes/assets/frame-presets/editorial-forest/FRAME.md
@source cs-ef title="caption 스킨 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/editorial-forest/caption-skin.html
@source sh-ef title="preset contact sheet 예시 코드" path=hyperframes/hyperframes/assets/frame-presets/editorial-forest/frame-showcase.html
@source ofl-ebg title="폰트 라이선스" path=hyperframes/hyperframes/assets/frame-presets/code-editorial/fonts/OFL-eb-garamond.txt
@source ofl-inter title="폰트 라이선스" path=hyperframes/hyperframes/assets/frame-presets/code-editorial/fonts/OFL-inter.txt
@source ofl-jbm title="폰트 라이선스" path=hyperframes/hyperframes/assets/frame-presets/code-editorial/fonts/OFL-jetbrains-mono.txt
@source sk-ko title="한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes/SKILL.KO.md


## 요청을 받은 에이전트는 무엇을 읽고 어떤 순서로 움직이나? {#behavior span=12}

이 스킬은 CLI를 직접 구현하지 않는다. 에이전트가 무엇을 읽고, 어디서 멈추고, 언제 렌더하는지를 지시한다.[](source:sk-intro)[](source:sk-loop) 동작을 그림 두 장으로 나눴다. 첫 그림은 요청을 받아 만들 준비를 끝내기까지, 둘째 그림은 만들고 검증하고 렌더하기까지다.

판정: 그림의 순서는 원문이 번호를 매긴 것이 아니라 분석자가 안내표, 작업 루프, 계약의 문장을 이어 붙인 것이다.[](source:sk-read)[](source:sk-loop)

@workflow id=intake-flow title="요청을 받고 만들 준비를 끝내기까지"
| start | 시작 준비 | external |
| edit | 변경 요청인가? | backend |
| answer | 답변·제안만 | backend |
| kind | 요청 종류 고르기 | backend |
| existing | 기존 project인가? | backend |
| history | timeline·history 읽기 | backend |
| init | 새 project 만들기 | backend |
| long | 15초 넘는 이야기? | backend |
| story | storyline 3개 고르기 | backend |
| spec | SPEC.md 쓰기 | backend |
| start > edit | |
| edit > answer | no |
| edit > kind | yes |
| kind > existing | |
| existing > history | yes |
| existing > init | no |
| history > long | |
| init > long | |
| long > story | yes |
| story > spec | 사람이 고름 | emphasis |

이 그림은 세 가지를 접었다.

- `15초 넘는 이야기?`가 no이면 story와 spec을 건너뛰고 둘째 그림의 composition 작성으로 바로 간다.
- `요청 종류 고르기`에서 하위 스킬로 넘기는 경로는 그리지 않았다. '언제 켜지고 어디로 가나' 패널과 '흐름 속 위치' 패널에 있다.
- storyline을 사람이 고르지 않는 경우(파일을 요청했거나 no stops)는 `storyline 3개 고르기`의 설명에 적었다.

@steps id=intake-steps
| s-start | 시작 준비 | 에이전트는 스킬을 읽자마자 두 가지를 확인한다. 하나는 plugin 안에서 실행 중인지다. 로드한 `SKILL.md`에서 두 단계 위 폴더에 `plugin.json`, `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, `.cursor-plugin/plugin.json` 중 하나가 있고 `hyperframes`를 가리키거나, Gemini extension manifest가 있으면 그 폴더가 `<PLUGIN_ROOT>`다.[](source:r-plugin) 없으면 standalone 설치이므로 `npx hyperframes`를 그대로 쓴다. plugin이면 `skills update`, `skills check`, `npx skills add`를 돌리지 않고, 모든 `npx hyperframes` 명령을 `plugin-cli.mjs` launcher 호출로 바꿔 쓴다.[](source:r-plugin) 다른 하나는 `npx hyperframes events --skill=hyperframes`를 한 번 실행하는 것이다. 이 명령은 스킬 이름을 CLI의 보통 telemetry와 함께 보내고, 로그인했다면 계정에 연결되며, opt-out을 따른다.[](source:sk-start) 판정: 영상 작업과 무관한 외부 전송이라 사용자가 모를 수 있다. opt-out을 켜는 방법은 이 폴더에 없다(원문에 명시 없음). | intake-flow | start |
| s-edit | 변경 요청인가? | 에이전트는 사람의 메시지가 변경을 요구하는지부터 가른다. 질문, 보류, 막연한 아이디어는 편집이 아니라 답이나 제안으로 끝난다.[](source:sk-intro) 변경을 요구하면 다음 노드로 간다. 설명용 예시(입력은 지어낸 것): "인트로가 좀 길지 않아?"는 질문이므로 에이전트는 composition을 건드리지 않고 의견만 답한다. "인트로를 2초 줄여 줘"는 변경 요청이다. 판단 기준으로 원문이 주는 문장은 'a question, a hold or a loose idea gets an answer or a proposal' 하나뿐이다. 애매한 메시지를 어느 쪽으로 처리하라는 지시는 원문에 명시 없음이다. | intake-flow | edit |
| s-answer | 답변·제안만 | 이 노드는 종료다. 에이전트는 파일을 바꾸지 않고 답이나 제안을 말한다.[](source:sk-intro) 판정: 이후 사람의 다음 요청을 기다리는 것으로 읽힌다. 원문은 대기를 따로 적지 않았다(원문에 명시 없음). | intake-flow | answer |
| s-kind | 요청 종류 고르기 | 에이전트는 안내표 `What to read`에서 요청이 어느 행인지 찾는다. 영상을 복사하거나 다시 만들려는 요청이면 `/reverse-any-video`, 검증된 스타일의 에피소드면 `/style-sampling`, 발표 deck이면 `/slideshow`, Remotion source면 `/remotion-to-hyperframes`, Figma면 `/figma`로 넘긴다.[](source:sk-read) 나머지 요청은 type 파일(`types/launch.md` 등), `film.md`, `captions.md`, `motion.md`, `format.md` 같은 reference로 간다. 표 전체는 '언제 켜지고 어디로 가나' 패널에 있다. `/slideshow`, `/remotion-to-hyperframes`, `/figma`는 설치돼 있지 않을 수 있다. 에이전트는 설치하지 않고, 사람이 `npx hyperframes skills update <name>`으로 설치하도록 어떤 스킬이 없는지와 맞는 명령을 알려 준다.[](source:r-life) 요청이 표의 여러 행에 걸칠 때 하나만 고르라는 문장은 없다(원문에 명시 없음). 판정: 설명용 예시로 "세로 launch 영상"이면 `types/launch.md`와 `types/vertical.md`를 둘 다 읽는 쪽이 표의 뜻에 맞는다. | intake-flow | kind |
| s-existing | 기존 project인가? | 에이전트는 작업 폴더에 이미 HyperFrames project가 있는지에 따라 갈라진다. 있으면 현재 상태를 읽고, 없으면 새로 만든다.[](source:sk-intro)[](source:sk-loop) 폴더가 project인지 판별하는 방법은 원문에 명시 없음이다. | intake-flow | existing |
| s-history | timeline·history 읽기 | 에이전트는 `npx hyperframes timeline --json`으로 무엇이 언제 재생되는지 보고, 변경하기 전에 `npx hyperframes history --since mine --who <you>`로 사람이 지난 턴 이후 바꾼 것을 읽는다. 원문은 그 위에 만들라고 한다.[](source:sk-loop) 판정: 사람의 편집을 되돌리거나 덮어쓰지 말라는 뜻으로 읽힌다. `<you>`에 무엇을 넣는지는 원문에 명시 없음이다. 어떤 명령이든 `catch-up`을 실행하라고 출력하면 다음 변경 전에 `npx hyperframes catch-up [dir]`을 돌린다. 거기에 나열된 것은 사람이 한 작업이지 새 요청이 아니다.[](source:sk-app) | intake-flow | history |
| s-init | 새 project 만들기 | 에이전트는 `npx hyperframes init <dir> --skip-skills --skill=hyperframes`로 project를 만든다. `--skip-skills`는 init이 스킬을 설치하지 않게 한다. 설치는 사람의 단계이기 때문이다.[](source:sk-intro)[](source:r-life) 새 영상을 시작할 때는 `npx hyperframes usage --json`으로 남은 plan usage를 확인하고, 값이 없으면 'unknown'이라고 말한다.[](source:sk-intro) 웹사이트가 주제면 `npx hyperframes capture <url> --json`을 쓴다. 새 영상의 규격은 1920×1080, 30 fps다. 다른 aspect ratio는 요청이나 source가 요구할 때만 쓴다.[](source:sk-intro) 이 명령들의 출력 형식은 이 폴더에 없다(원문에 명시 없음). | intake-flow | init |
| s-long | 15초 넘는 이야기? | 에이전트는 영상이 약 15초를 넘고 무언가를 이야기하는지 본다. launch, promo, explainer, PR·changelog 영상, recap, 서사가 있는 뮤직비디오가 여기에 든다.[](source:r-story) 이런 영상이면 type 파일을 읽고 story 단계로 간다.[](source:sk-loop) 기존 project 편집, 영상 위 caption·overlay, 한 아이디어짜리 짧은 작품(kinetic 문장 하나, 지도 이동 하나, 이미지 highlight 하나)은 story 단계를 건너뛴다.[](source:r-story-skip) 사람이 script, storyboard, reference film을 줬다면 에이전트는 그것을 따른다.[](source:r-story-skip) 15초는 'about'이라 정확한 경계 처리는 원문에 명시 없음이다. | intake-flow | long |
| s-story | storyline 3개 고르기 | 에이전트는 먼저 device와 form을 짝지은 아이디어를 5개 이상 한 줄씩 스케치하고, 소재가 감당하지 못하는 것을 버린 뒤 가장 서로 다른 3개를 남긴다. 그중 하나는 처음에 고르지 않았을 대담한 안이어야 한다. 각 storyline은 이름, 처음 2초, beats 한 줄, look 한 줄, sound 한 줄을 갖고 전부 글로만 쓴다. 하나가 뽑히기 전에는 아무것도 만들지 않는다.[](source:r-story-pick) 추천안을 이유 한 절과 함께 맨 앞에 놓고 셋을 모두 `STORYLINES.md`로 저장해 이후 턴이 바꿀 수 있게 한다.[](source:r-story-pick) 갈림길은 사람이 답할 수 있느냐다. 답할 수 있으면 셋을 보여 주고 사람이 고를 때까지 한 번 멈춘다. 섞어서 고르면("A의 오프닝에 C의 중간") 그것이 하나의 storyline이다. 사람이 파일을 요청했거나 멈추지 말라고 했으면 에이전트는 추천안을 골라 만들고 나머지 둘을 답에 한 줄씩 적는다. 사람만 답할 수 있는 질문(캡처할 수 없는 실제 화면, 내레이션만인지 음악만인지) 말고는 묻지 않고, 길이 범위·aspect·음악 또는 음성·유료 항목(옆에 무료 대안)은 가정 한 줄로 밝힌다.[](source:r-story-pick) | intake-flow | story |
| s-spec | SPEC.md 쓰기 | 에이전트는 고른 storyline을 project 루트의 `SPEC.md`로 쓴다. 템플릿은 GOAL, OUTPUT, TIME, LOOK, OBJECTS, MOTION, SHOTS, BANNED, QA 아홉 줄이다. 형용사가 있던 자리에는 숫자를 넣는다. 원문 예시로 'clean'은 12 columns, 96 px 여백, shot마다 accent 한 단어로 바뀐다.[](source:r-spec) 기본 금지 목록은 BANNED 줄에 이름으로 올린다.[](source:r-spec-ban) 에이전트는 이 SPEC으로 만들고 SPEC에 맞춰 검사하며, review가 영상을 바꾸면 SPEC도 바꾼다.[](source:r-spec) | intake-flow | spec |

@workflow id=build-flow title="만들고 검증하고 렌더하기까지"
| build | composition 작성 | backend |
| check | check 실행 | backend |
| clean | error가 없나? | backend |
| review | snapshot·review | backend |
| preview | Studio preview 열기 | backend |
| ready | 렌더해도 되나? | backend |
| wait | preview에서 멈춤 | backend |
| render | 렌더 | backend |
| build > check | |
| check > clean | |
| clean > build | no | emphasis |
| clean > review | yes |
| review > build | P0 남음 | emphasis |
| review > preview | 통과 |
| preview > ready | |
| ready > render | yes |
| ready > wait | no |

이 그림은 네 가지를 접었다.

- 영화가 아닌 작은 편집은 `snapshot·review`에서 바뀐 곳만 확인한다.
- registry와 media 검색은 `composition 작성` 안에서 일어난다.
- storyboard를 먼저 승인받는 경로는 '무엇을 만들고 바꾸나' 패널에 있다.
- 렌더 뒤 안내는 `렌더`의 설명에 적었다.

판정: `Studio preview 열기`와 `snapshot·review`의 선후는 원문이 정하지 않았다. 원문은 '배달 렌더 전에 preview를 연다'고만 쓴다.[](source:sk-app)

@steps id=build-steps
| b-build | composition 작성 | 에이전트는 계약 12조와 편집 가능성 규칙을 지키며 scene을 쓴다. 영상의 길이는 root의 `data-duration`이 정하고, 모든 timed 요소는 `class="clip"`, `data-start`, `data-duration`을 갖는다.[](source:sk-contract) scene은 하나의 sub-composition이고, timed 요소는 스크립트가 아니라 HTML에 쓰며 각각 안정된 `id`를 갖는다. 문구, brand 색, 바꿀 media는 변수(`data-var-text`, `data-var-src`, `var(--id)`)로 둔다.[](source:sk-edit) 이름 붙은 효과·전환·caption 스타일·차트·카드를 손으로 쓰기 전에 `/hyperframes-registry`로 먼저 검색한다. 발표자, avatar, footage, voice, music 같은 모든 media는 `/media-use`로 구한다.[](source:sk-intro) 제품 화면, brand 로고, 실제 장소의 이미지처럼 원천이 있는 것은 그 원천에서 가져오고, 원천이 없는 것만 그린다.[](source:sk-intro) 요청이나 source가 요구하지 않으면 voiceover, caption, 새 aspect ratio는 만들지 않는다. 약 15초를 넘는 이야기 영상은 사람이 침묵을 요구하지 않는 한 음악과, 화면에 보이는 동작에 맞는 소리를 넣는다.[](source:sk-intro) 세부 수치(모션, caption, 소리, 형식)는 '파일별 요구' 패널의 reference가 정한다. | build-flow | build |
| b-check | check 실행 | 에이전트는 마지막 편집 뒤에 `npx hyperframes check --json`을 돌린다.[](source:sk-loop) 대부분의 위반은 `Fix:` 줄과 함께 보고된다.[](source:sk-contract) check는 error 말고도 측정할 수 있는 craft 경고를 낸다. 읽기에 너무 짧은 한 줄(`line_unread`), 3초 넘게 아무것도 안 바뀌는 구간(`dead_stretch`), 프레임 짧은 변의 2.6% 아래 텍스트(`text_below_floor`), 빈 첫 프레임(`first_frame_empty`), 15초 넘는데 소리 없는 영상(`film_silent`)이다.[](source:r-review-measure) | build-flow | check |
| b-clean | error가 없나? | 이 노드는 통과 조건이다. error가 하나라도 남으면 에이전트는 모든 error를 고친다.[](source:sk-loop) 그림은 composition 작성으로 돌아가 check를 다시 돌리는 루프로 그렸다. 원문은 '마지막 편집 뒤에 check'라고만 쓰므로 반복 횟수 상한은 원문에 명시 없음이다. warning은 통과를 막지 않는다. 에이전트는 모든 warning을 따져 보고, 고치거나 의도한 것이면 `REVIEW.md`에 이유를 남긴다. 의도한 hold는 `data-hold`를 단다.[](source:sk-loop)[](source:r-review-measure) 설명용 예시(조건문): check가 `dead_stretch`를 보고했는데 3초 정지가 의도한 hold라면, 요소에 `data-hold`를 달고 `REVIEW.md`에 이유를 쓰면 된다. | build-flow | clean |
| b-review | snapshot·review | 새 영화는 `npx hyperframes snapshot --review`를 돌려 세 장의 시트를 만들고 모두 연다. 첫 시트는 각 scene이 시작한 직후와 중간 그리고 각 `data-beat`, 둘째는 모든 cut의 앞뒤 0.2초 strip, 셋째는 360 px 폭의 beat 프레임이다.[](source:r-review-measure) 에이전트는 먼저 beat 프레임마다 낯선 사람처럼 한 문장으로 묘사한다. 설명이 필요한 물체('저 막대기는 거울이다')가 나오면 P0다. 그다음 beat를 순서대로 읽어 하나가 다음을 일으키는지 보고, 각 shot을 SPEC과 맞춰 보고, 기본 금지 목록에 있는 것이 화면에 나오면 BANNED 줄에 더한 뒤 가장 먼저 고친다.[](source:r-review) 문제는 `t=4.2s · where · problem → exact change · what stays` 한 줄로 쓰고 P0(읽기나 계약을 깨뜨림), P1(영상을 약하게 함), P2(다듬기)로 매긴다. P0 전부와 값어치 있는 P1을 글자, 타이밍, 디테일 순으로 고친다. 점수는 매기지 않는다. 두 번째 검토는 P0가 남았을 때만 한다.[](source:r-review) 작은 편집은 바꾼 곳만 `--at`, `--range`, `--composition`으로 snapshot해 보고 답한다.[](source:sk-loop) 소리는 `npx hyperframes audio <video> --json`으로 재지만 에이전트는 들을 수 없으므로 '측정했다, 들은 것은 아니다'라고 쓴다.[](source:r-review) 끝에는 project 루트에 `REVIEW.md`를 쓴다. 다음 턴은 변경 전에 그것을 읽는다. 담는 것은 만든 창작 판단과 만들지 않은 storyline, 잰 것과 눈으로만 본 것, 가장 약한 shot, 이유를 남기고 둔 warning이다.[](source:r-review) 그림의 P0 남음 간선은 이 수정 뒤 마지막 편집이 생기므로 다시 check로 가는 경로다. 판정: 원문은 수정 뒤 재검사를 명시하지 않고 '마지막 편집 뒤 check'에서 도출했다.[](source:sk-loop) | build-flow | review |
| b-preview | Studio preview 열기 | 새 영상의 delivery render 전에 에이전트는 `preview`로 Studio preview를 연다. 질문 없이 진행하는 모드(no-questions)에서도 연다. 그리고 사람이 거기서 편집할 수 있다고 말한다.[](source:sk-app) 에이전트는 이 제품을 'HyperFrames desktop app'이라 부르고 'Studio'라 부르지 않으며, 더 나은 편집 방법으로 권하되 유일한 방법으로 말하지 않는다.[](source:sk-app) `preview`가 'Keep editing by chatting with Framey'를 출력했다면 **Edit with Framey** 버튼이 app을 연다고 덧붙인다.[](source:sk-app) 이 출력 문구는 CLI가 내는 것이라 지시상 동작으로만 서술한다. | build-flow | preview |
| b-ready | 렌더해도 되나? | 이 노드는 사람 승인 지점이다. 에이전트는 check와 review가 통과한 뒤에, 사람이 Studio preview를 승인했거나, 파일을 달라고 했거나, 멈추지 말라고 했을 때만 렌더한다.[](source:sk-loop) 세 조건 중 하나면 충분하다. 승인을 알리는 문구의 형태는 원문에 명시 없음이다. 단 storyboard를 쓰는 경우 Studio의 Approve 버튼이 'The storyboard is approved. Build the video from it.'를 복사해 주고 그것이 사람의 go다.[](source:r-sb) 이 문구는 storyboard 승인이며 렌더 승인과 같다는 말은 원문에 없다. | build-flow | ready |
| b-wait | preview에서 멈춤 | 위 조건이 하나도 아니면 에이전트는 preview에서 멈추고 기다린다.[](source:sk-loop) 원문이 직접 말하는 것은 'otherwise stop at the preview and wait'까지다. 기다리는 동안 허용되는 다른 행동은 원문에 명시 없음이다. | build-flow | wait |
| b-render | 렌더 | 에이전트는 `npx hyperframes render`로 영상을 만든다.[](source:sk-loop)[](source:r-path) check와 review를 통과한 뒤의 배달 단계다. 렌더 뒤에는 CLI가 낸 Framey 안내를 자기 말로 사람에게 전한다. `hyperframes open` 명령을 돌릴지 묻거나 다운로드 링크를 주고, 안내가 없으면 아무 말도 하지 않는다. 자율 모드에서는 delivery note에 담는다.[](source:sk-app) path tracing 3D 영상의 렌더 옵션은 '파일별 요구' 패널에 있다. | build-flow | render |

## 이 스킬은 언제 켜지고, 요청 종류마다 어디로 가나? {#activation span=12}

frontmatter에는 `name`과 `description`만 있다. `disable-model-invocation` 같은 호출 제한 필드는 없다.[](source:sk-fm) description은 모델이 켤지 판단할 때 참고하는 설명이므로, 아래 단어가 있으면 켜진다는 뜻으로 읽지 않는다.

@code source=sk-fm language=yaml

켜는 조건으로 원문이 직접 말하는 것은 두 가지다. description은 영상을 만들거나 고치거나 렌더하는 모든 HyperFrames 작업에서 이 스킬을 먼저 읽으라고 한다.[](source:sk-fm) 본문은 다른 framework나 평범한 browser 녹화를 요청받지 않았다면 HyperFrames를 쓰라고 한다.[](source:sk-intro) plugin 안에서는 Claude가 이 스킬을 `/hyperframes:hyperframes`로, 다른 client는 `/hyperframes`로 노출할 수 있다.[](source:r-plugin)

안내표는 요청이 어느 행인지 고르는 데 쓴다. 한 요청이 여러 행에 걸칠 때의 우선순위는 원문에 명시 없음이다.[](source:sk-read)

| 요청 | 읽을 것 |
| --- | --- |
| 복사하거나 다시 만들 영상 | `/reverse-any-video` |
| 검증된 스타일의 에피소드 | `/style-sampling` |
| 다른 영상의 스타일을 새 주제에 쓰기 | `references/look.md` |
| launch, promo, 기능 소개 | `references/types/launch.md` |
| explainer, tutorial | `references/types/explainer.md` |
| 뮤직비디오 | `references/types/music.md` |
| chart, 숫자 | `references/types/data.md` |
| 세로·소셜 clip | `references/types/vertical.md` |
| 3D, 시뮬레이션, generative | `references/types/3d.md` |
| 캐릭터, mascot, 이야기 짧은 영상 | `references/types/character.md` |
| 실제 장소·지도, website·PR·script, kinetic type | `references/film.md` |
| caption, 말하는 사람 위의 카드 | `references/captions.md`, `references/overlays.md` |
| 모션(ease, title, cut, punch-in, 속도, hold) | `references/motion.md` |
| scene, attribute, media, lint, GSAP·Lottie·3D·canvas | `references/format.md`, `references/runtimes.md` |
| 발표 deck | `/slideshow` |
| Remotion source | `/remotion-to-hyperframes` |
| Figma | `/figma` |
| 스킬 설치와 고정된 CLI | `references/skill-lifecycle.md` |

## 에이전트에게 무엇을 강제하고 무엇을 금지하나? {#contract span=12}

계약 12조는 `check --json`이 대부분의 위반을 `Fix:` 줄과 함께 보고하는 규칙이다.[](source:sk-contract) 아래 표의 lint 규칙 이름은 `format.md`의 오류 목록에서 뜻이 같은 것을 분석자가 짝지은 것이다. 원문은 조항 번호와 lint 규칙의 대응을 적지 않았다. 판정이다.[](source:r-format-lint)

| 조 | 규칙 | 대응하는 lint 규칙(판정) |
| --- | --- | --- |
| 1 | 모든 timed 요소는 `class="clip"`, `data-start`, `data-duration`(초)을 갖고 `[start, start + duration)` 동안 보인다. 끝 상태는 끝 직전에 닿게 한다. `data-track-index`는 Studio 레인일 뿐이고 그리는 순서는 `z-index`다.[](source:sk-contract) | 원문에 대응 없음 |
| 2 | 영상 길이는 root의 `data-duration`이다. 넘치면 잘리고 일찍 끝나면 마지막 프레임이 유지된다.[](source:sk-contract) | `clip_ends_past_root_duration` |
| 3 | 각 composition은 일시정지된 timeline 하나를 만들고 tween을 모두 쓴 뒤 `window.__timelines["<data-composition-id>"] = tl`로 등록한다.[](source:sk-contract) | `gsap_timeline_registered_before_async_build` |
| 4 | `Date.now()`, seed 없는 `Math.random()`, network fetch, timer, `repeat: -1`을 쓰지 않는다. 보이는 모든 것은 timeline 시간의 함수여야 한다.[](source:sk-contract) | 원문에 대응 없음 |
| 5 | `.clip`의 `display`, `visibility`, `autoAlpha`를 tween하지 않는다. 자식을 움직인다.[](source:sk-contract) | `gsap_animates_clip_element` |
| 6 | GSAP이 transform하는 요소에 CSS `transform`을 쓰지 않는다. `left`, `top`, `width`, `height`가 아니라 transform을 움직인다.[](source:sk-contract) | `gsap_css_transform_conflict` |
| 7 | media를 `play()`, `pause()`, seek하지 않는다. `<video>`가 소리를 유지하려면 `data-has-audio="true"`, 아니면 `muted`다. 음악·음성·교체 소리·J/L cut은 별도 `<audio>`다.[](source:sk-contract) | `video_missing_muted` |
| 8 | 모든 `<audio>`는 `id`가 있어야 mix에 들어간다. media에 `crossorigin`을 쓰지 않는다. 시간은 `<video>`에 주고 감싼 요소에는 주지 않는다.[](source:sk-contract) | `media_missing_id`, `media_crossorigin_breaks_preview`, `video_nested_in_timed_element` |
| 9 | 번들 폰트만 이름으로 해석된다. 다른 글꼴은 `assets/fonts/`의 파일을 가리키는 `@font-face`가 필요하다.[](source:sk-contract) | `font_family_without_font_face`(`format.md` 폰트 절)[](source:r-format) |
| 10 | asset 경로는 `assets/...`이고 앞에 `/`를 붙이지 않는다. sub-composition 안에서도 같다.[](source:sk-contract) | 원문에 대응 없음 |
| 11 | footage의 grade, grain, blur, vignette는 CSS filter가 아니라 `npx hyperframes media-treatment`(`/media-use`)로 한다.[](source:sk-contract) | 원문에 대응 없음 |
| 12 | scene 파일은 style, markup, script를 `<template>` 안에 두고 root를 `#root`로 스타일한다. 의도한 overflow나 overlap은 `data-layout-allow-overflow`, `data-layout-allow-overlap`으로 표시한다.[](source:sk-contract) | `standalone_composition_wrapped_in_template`, `subcomposition_root_styled_by_class` |

계약 외에 'Keep it editable' 규칙 다섯 개가 있다. Studio가 사람이 쓴 태그를 편집하기 때문이다.[](source:sk-edit)

- scene 하나가 sub-composition 하나이고 id는 짧고 읽기 쉽게 쓴다. root에는 scene host, media, audio만 둔다.
- timed 요소는 스크립트로 만들지 않고 HTML에 쓰며 각각 안정된 `id`를 준다.
- 문구, brand 색, 바꿀 media는 변수(`data-var-text`, `data-var-src`, `var(--id)`)로 둔다.
- track은 한 종류만 담는다. scene·overlay host에는 `data-track-kind="graphics"`, 모든 caption group을 담는 host 하나에는 `captions`를 쓴다.
- 내용은 90% action-safe 영역 안에, caption과 핵심 텍스트는 80% title-safe 영역 안에 둔다. Studio가 안내선을 그려 주므로 직접 그리지 않는다.

## 영상 품질을 지키려고 어떤 기본값을 막고 어떤 수치를 쓰나? {#quality span=12}

`spec.md`는 모델이 빈칸을 자기 기본값으로 채워 모든 영상이 똑같아지는 것을 문제로 든다. 'premium, modern, clean' 같은 형용사를 주면 어두운 void, glow, 가운데 떠 있는 작은 글자, 전부 fade-in이 나온다고 설명한다.[](source:r-spec) 그래서 `SPEC.md`에서 형용사 하나하나를 숫자로 바꾸고, 아래 목록은 이름으로 금지한다. 브랜드 자료나 사람이 준 reference가 쓰는 경우에만, 그들이 쓰는 방식 그대로 허용한다.[](source:r-spec-ban)

- 검은색이나 짙은 navy 바탕에 작은 요소가 가운데 떠 있는 구성
- glow, bloom, neon, lens flare, 장식용 떠다니는 입자
- 보라·파랑 gradient, mesh gradient, glass card
- cream 바탕에 serif display, italic 강조어, "01 / 02" 번호 label, 작은 monospace 대문자 label, pill 모양 chip
- 전부 가운데 정렬, 전부 한꺼번에 fade-in, 모든 요소가 fade하며 위로 슬라이드
- 읽는 동안 움직이는 글자, 내려앉은 뒤에도 계속 떠도는 title
- 모서리 label, 프레임 테두리, 장식용 HUD
- 카드 세 장 나란히, KPI grid, 흐린 스크린샷 위의 title
- 모서리에 붙인 로고

첫 render 뒤에 에이전트는 화면이 쓴 기본값을 목록에 있든 없든 이름으로 찾아 해당 영상의 BANNED 줄에 더하고 고친다.[](source:r-spec-ban) `story.md`와 `motion.md`도 비슷한 목록을 갖는다. story의 것은 모든 scene이 같은 방식으로 들어오는 것과 나란한 패널이 장면을 대신하는 것이고,[](source:r-story) motion의 것은 숨 쉬듯 떠는 loop, 내려앉은 뒤 계속 미끄러지는 title, UI의 bounce, click ring이다.[](source:r-motion)

@facts id=quality-facts
| 새 영상 규격 | 1920×1080, 30 fps[](source:sk-intro) |
| 소리를 기본으로 넣는 길이 | 약 15초 초과 이야기 영상: 음악과 동작 소리, 사람이 침묵을 요구하면 예외[](source:sk-intro) |
| 읽을 글자 하한 | 1080 기준 28 px(짧은 변의 2.6%). 넘치면 단어를 줄이고 글자를 줄이지 않는다[](source:r-spec-num) |
| 한 줄이 머무는 시간 | 약 0.5초 + 단어당 0.3초, 마지막 줄은 2초 이상[](source:r-story) |
| shot의 hero 크기 | 프레임 높이나 너비의 40% 이상[](source:r-spec-num) |
| 새 변화의 간격 | 영상 전체에서 2-4초마다 하나[](source:r-spec-num) |
| 빠른 move | 0.3-0.6초. 퇴장은 입장보다 40-50% 짧게[](source:r-motion) |
| spring damping | 1.0은 튀지 않음, 0.7-0.85는 premium, 0.4-0.6은 playful, 0.3 미만은 cartoon[](source:r-motion) |
| 전환 종류 | 영상 하나에 3-5종, 경계의 hard cut은 최대 3분의 1[](source:r-motion) |
| 소리 level | 음성 아래 음악 약 0.14 volume, true peak −1 dBTP 이하, social용 mix 약 −16~−14 LUFS[](source:r-sound) |
| 효과음 세기 | 각 hit이 bed보다 3-6 dB 위[](source:r-sound) |
| 세로 영상 안전 구역 | 1080×1920에서 위 168 px 비움, 모든 글자와 제품은 168-1330 px 안[](source:t-vert) |

## 파일별로 에이전트에게 무엇을 더 요구하나? {#references span=12}

안내표나 다른 파일이 가리킬 때 읽는 reference 23개가 요구하는 것이다. 한 줄 요약이라서 예외와 이유는 해당 파일에 있다.

| 파일 | 에이전트에게 더 요구하는 것 |
| --- | --- |
| `story.md` | 이야기 영상에서 한 가지 요점과 storyline 3개를 정하고, 첫 2초를 가장 촘촘하게 쓰며 frame 0을 검은 화면이나 로고 하나로 두지 않는다.[](source:r-story) |
| `spec.md` | `SPEC.md` 아홉 줄 템플릿과 형용사를 숫자로 바꾸는 표, hero 40% 같은 구성 수치를 정한다.[](source:r-spec) |
| `review.md` | 측정 뒤에 눈으로 보고, 문제에 P0·P1·P2를 매기고, `REVIEW.md`를 남긴다.[](source:r-review) |
| `look.md` | 룩의 출처를 design spec, 실제 brand, 사람이 준 reference, 소재의 세계 순으로 찾는다.[](source:r-look) |
| `film.md` | script는 TTS 약 2.2단어/초, scene당 약 19단어로 맞추고, PR 영상은 commit 작성자를 밝힌다.[](source:r-film) |
| `format.md` | composition 파일 모양, 속성, 변수, 폰트, 타이밍, layout 검사 opt-out, 자주 나는 lint 오류를 정한다.[](source:r-format) |
| `motion.md` | 이동·ease·spring·stagger·title 입장·hold의 수치와 전환 9종, 기본값 금지를 정한다.[](source:r-motion) |
| `runtimes.md` | 모든 motion은 시간의 함수여야 하고, GSAP 밖 runtime마다 구동 방식(`hf-seek` listener, `window.__hfLottie` 등)을 정한다.[](source:r-runtimes) |
| `captions.md` | 단어 시간은 `transcribe`로 얻고, 한 번에 한 group만 보이게 하며, group마다 끝에 hard kill을 둔다.[](source:r-captions) |
| `overlays.md` | 말하는 사람 위 카드의 영상 위치, PiP 좌표, fade 0.4초·0.35초와 밀도를 정한다.[](source:r-overlays) |
| `sound.md` | 15초 넘는 이야기 영상에 음악과 동작 소리를 넣고, 음악 source가 없으면 침묵으로 내며 그렇게 말한다.[](source:r-sound) |
| `storyboard.md` | 사람이 승인할 정지 이미지 board를 `boards/storyboard.html`로 만들고 go를 기다린다.[](source:r-sb) |
| `storyboard-format.md` | `STORYBOARD.md` 형식과 frame별 `status`(`outline`, `built`, `animated`)를 정한다.[](source:r-sbf) |
| `types/launch.md` | 실제 UI만 쓰고 만든 dashboard를 만들지 않으며 end card는 마지막 5-10%에 둔다.[](source:t-launch) |
| `types/explainer.md` | 하나의 구체 사례를 끝까지 따라가고, 장치는 시청자가 아는 상황 안에서 등장시킨다.[](source:t-expl) |
| `types/music.md` | 노래의 section이 편집 구조가 되고 같은 처리는 약 6초를 넘기지 않는다.[](source:t-music) |
| `types/data.md` | 한 번에 숫자 하나, 실제 데이터만, 차트는 읽는 순서대로 그린다.[](source:t-data) |
| `types/vertical.md` | 1080×1920에서 플랫폼 UI를 피하고 첫 1초에 hook을 둔다.[](source:t-vert) |
| `types/3d.md` | 모든 프레임을 timeline 시간으로 그리고 시뮬레이션은 로드 때 한 번 돌려 시간으로 조회한다.[](source:t-3d) |
| `types/character.md` | 감정 변화는 anticipation, squash, 새 표정, 안정 단계를 거치고 부위를 동시에 같은 곡선으로 움직이지 않는다.[](source:t-char) |
| `path-tracing.md` | path 렌더는 최종 export에만 쓰고 preview는 raster로 하며, sampling은 경과 시간이 아니라 샘플 수로 구동한다.[](source:r-path) |
| `skill-lifecycle.md` | 스킬 설치·갱신은 사람이 하고, 에이전트는 낡은 것과 맞는 명령을 알려 준다.[](source:r-life) |
| `plugin-installation.md` | plugin이면 `skills` 명령을 돌리지 않고 launcher로 CLI를 호출하며 plugin 폴더를 읽기 전용으로 다룬다.[](source:r-plugin) |

수치가 많은 두 파일은 따로 옮긴다.

- `motion.md`의 전환은 아홉 가지(button 통과 zoom, 물체가 세계가 되기, morph, 운반, 색 flood, whip, 클릭 지점 iris, dip cut, 한 무대의 blur 교체)다. 영상 하나에는 이 중 3-5종만 쓰고, 세계끼리는 crossfade하지 않는다.[](source:r-motion)
- `path-tracing.md`의 측정은 Apple M4 Max에서 8초 720p 클립이 raster 10.8초, path tracing 810.5초(32 samples, 6 bounces)였다. 기본값은 64 samples와 4 bounces다.[](source:r-path)
- 하드웨어 GPU가 없으면 SwiftShader에서 첫 shader 실행만 약 1분이 걸려 기본 준비 대기 45초를 넘긴다. 그래서 `--timeout 170000`(`check`, `snapshot`)과 `--player-ready-timeout 180000`(`render`)로 늘린다.[](source:r-path)

## 같이 들어 있는 preset과 script는 무엇인가? {#bundled span=12}

`assets/frame-presets/` 아래 preset 13종은 각각 `FRAME.md`, `caption-skin.html`, `frame-showcase.html`을 가진다.[](source:r-look-presets) `look.md`는 preset을 사람이 이름을 대거나 deck(`/slideshow`)일 때 쓰라고 하고, brand 없는 영상의 fallback으로는 쓰지 말라고 한다. 쓰려면 `FRAME.md`를 project 루트에 `frame.md`로 복사해 읽고, 번들되지 않은 폰트는 `@font-face` 파일을 둔다. 두 HTML 파일은 참고 코드라서 처리 방식을 읽을 뿐 mount하지 않는다.[](source:r-look-presets)

preset 자산은 이렇게 생겼다.

- `FRAME.md`: 13종이 같은 구조를 가진다. frontmatter(색, 타이포, 간격, 컴포넌트)와 Overview, Frame Craft Bar, Colors, Typography, Depth & Surface, Shapes, Components, 여섯 가지 Frame Treatments, Composition Rules(Do·Don't), Aspect-Ratio Behavior, Numerals & Claims, Pre-Render Self-Audit, Known Gaps다.[](source:fr-ce) `code-editorial`은 전부 읽었고 나머지 12종은 제목 목록으로 확인했다.[](source:fr-by)[](source:fr-bf)[](source:fr-bp)[](source:fr-bo)[](source:fr-br)[](source:fr-cp)[](source:fr-ct)[](source:fr-cg)[](source:fr-co)[](source:fr-cm)[](source:fr-dd)[](source:fr-ef)
- 공통 규칙: 13종 모두 'Numerals & Claims'에서 수치·통계·날짜·개수를 지어내지 말고 자리에 `— figure —`, `{metric}` 같은 placeholder를 두라고 한다. 'Known Gaps'에서는 모션이 범위 밖이라고 적는다.[](source:fr-ce)[](source:fr-by)[](source:fr-ef)
- 폰트: 파일로 함께 오는 preset은 `code-editorial` 하나다. EB Garamond, Inter, JetBrains Mono의 400·700 WOFF2 여섯 개와 OFL 라이선스 문서 세 개가 있다.[](source:fr-ce)[](source:ofl-inter) 나머지 12종은 Google Fonts를 쓴다고 적는다.[](source:fr-by)[](source:fr-ef)
- `caption-skin.html`: karaoke식 하단 caption 예시다. 그대로 mount하지 말고 복사해 `compositions/captions.html`로 쓰며, 비워 둔 세 곳(단어 group 배열, 길이와 크기, brand 변수 style)을 채우고 `<template>`로 감싼다.[](source:cs-ce) 변수 이름(`--cap-ink`, `--cap-canvas`, `--cap-accent`, `--cap-accent-2`, `--font-display`, `--font-body`, `--cap-band-top`, `--cap-band-height`)과 hook 클래스(`.caption-group`, `.caption-word`, `.is-active`, `.is-spoken`)는 고정이다.[](source:cs-ce) 단어 상태는 `gsap.set({className})`로 바꾸고 `tl.call()`은 쓰지 않는다. seek가 callback을 실행하지 않아 render 때 상태가 틀어지기 때문이다.[](source:cs-ce)
- `frame-showcase.html`: `look.md`가 contact sheet라고 부르는 참고 코드다. `code-editorial`의 것은 `<section>`이 7개다.[](source:r-look-presets)[](source:sh-ce)

`scripts/`에는 최상위 파일 네 개(launcher, 그 테스트, `locate.mjs`, `bake-basemap.mjs`)와 `lib/`의 파일 네 개가 있다. 이 페이지 작업에서 script를 실행하지 않았다.

- `plugin-cli.mjs`: plugin 안에서 CLI를 부르는 launcher다. plugin manifest에서 `name`이 `hyperframes`이고 version이 `1.2.3` 꼴(pre-release 허용)인지 확인하고, 아니면 오류로 멈춘다. `skills`로 시작하는 명령은 거부한다.[](source:x-plugin) 나머지 명령은 `npx --yes hyperframes@<version> <args>`로 실행하되 home 폴더에서 시작해, project의 `package.json`, `node_modules`, `.npmrc`가 CLI 버전을 고르지 못하게 한다. 환경 변수로 skill 자동 설치와 업데이트 확인을 끈다.[](source:x-plugin)[](source:x-plugin-test) `--script <path>`는 Node helper를 같은 환경으로 실행한다.[](source:x-plugin)
- `locate.mjs`: 이미지 속 대상을 감지 API 없이 찾는다. 에이전트가 번호 격자 이미지를 읽고 칸 번호를 고르는 방식으로 9×9, 다시 6×6으로 좁히고, 마지막에 빨간 사각형을 그린 확인 이미지를 반드시 본다. ffmpeg와 ffprobe가 필요하다.[](source:x-locate) 환경 변수 `GEMINI_API_KEY`가 있을 때만 쓰는 `auto` 모드는 이미지를 base64로 Google의 generativelanguage API에 보낸다. 원문은 이를 선택적 빠른 길이라고 적는다.[](source:x-locate)
- `bake-basemap.mjs`: headless Chrome에서 MapLibre로 지도 camera 이동을 한 프레임씩 찍어 all-intra MP4와 `<NAME>-coords.json`을 만든다. 타일과 라이브러리를 network에서 받고, 한 번에 하나만 돌려야 하며, 타일이 덜 로드된 프레임이 있으면 exit code 1로 실패를 알린다.[](source:x-bake)
- `lib/`: `main-module.mjs`는 script가 직접 실행되었는지 판별하고, `windows-exe-search.mjs`는 Windows에서 현재 폴더의 프로그램 탐색을 끄고 다른 OS에서는 PATH의 상대·빈 항목을 버린다.[](source:x-main)[](source:x-win) 테스트 세 파일이 이 동작을 검증한다.[](source:x-plugin-test)[](source:x-main-test)[](source:x-win-test)

## 이 스킬은 전체 흐름의 어디에 있나? {#position span=12}

관계 원장 `skill-explainers/hyperframes/relations.md` 기준으로 이 스킬은 두 묶음에 든다. 영상 한 편을 새로 만드는 `build-video`(`hyperframes/_group-build-video/build-video.html`)에서는 `안내` 역할이고, 이미 있는 영상·코드·스타일에서 출발하는 `start-from-reference`(`hyperframes/_group-start-from-reference/start-from-reference.html`)에서도 `안내` 역할이다. 전체 흐름은 그 두 묶음 페이지가 설명한다. 여기에는 이 스킬의 앞과 뒤만 그렸다.

@workflow id=hub-position title="요청에서 이 스킬을 거쳐 하위 스킬로"
| req | 영상 요청 | external |
| hub | /hyperframes | frontend |
| reg | /hyperframes-registry | backend |
| media | /media-use | backend |
| pick | 다른 출발점인가? | backend |
| rev | /reverse-any-video | backend |
| style | /style-sampling | backend |
| slide | /slideshow | backend |
| remo | /remotion-to-hyperframes | backend |
| req > hub | |
| hub > reg | R02 | emphasis |
| hub > media | R03 | emphasis |
| hub > pick | |
| pick > rev | R04 |
| pick > style | R05 |
| pick > slide | R06 |
| pick > remo | R07 |

그림에서 `hyperframes-cli`(R01·R29 참고), `/figma`(R08, 범위 밖), 하위 스킬이 이 스킬을 가리키는 역방향 관계(R13~R16, R22, R25~R27, R30, R31)는 뺐다. 아래 표에 남겼다. 화살표는 '이 요청이면 이 스킬을 부른다'는 뜻이다. 자동 실행이나 고정 순서가 아니다.

@steps id=position-steps
| p-req | 영상 요청 | 사람의 요청이 이 스킬로 들어온다. 앞 노드는 스킬이 아니라 사람이다. | hub-position | req |
| p-hub | /hyperframes | 이 스킬이 계약, 작업 순서, 안내표를 가진 입구다. 하위 스킬을 모두 실행하라는 지시는 원문에 명시 없음이고, 안내표는 요청에 맞는 것만 가리킨다.[](source:sk-read) | hub-position | hub |
| p-reg | /hyperframes-registry | 이름 붙은 효과·전환·caption 스타일·차트·카드를 손으로 쓰기 전에 검색한다. 조건부 의무 어조다.[](source:sk-intro) | hub-position | reg |
| p-media | /media-use | 발표자, avatar, footage, voice, music 같은 모든 media를 맡는다. 계약 11조도 grade·grain·blur를 여기로 보낸다.[](source:sk-intro)[](source:sk-contract) | hub-position | media |
| p-pick | 다른 출발점인가? | 이 노드는 안내표의 분기를 한곳에 모은 것이다. 복사할 영상, 검증된 스타일, 발표 deck, Remotion source가 요청이면 해당 스킬로 가고, 아니면 이 스킬이 reference를 읽으며 직접 진행한다.[](source:sk-read) 판정: 이 결정 노드는 원문에 없는 그림용 묶음이다. 안내표는 행마다 따로 적는다. | hub-position | pick |
| p-rev | /reverse-any-video | 복사하거나 다시 만들 영상이 요청일 때 부른다. 안내표의 한 행이고 강제는 아니다.[](source:sk-read) | hub-position | rev |
| p-style | /style-sampling | 검증된 스타일의 에피소드가 요청일 때 부른다. 안내표의 한 행이고 강제는 아니다.[](source:sk-read) | hub-position | style |
| p-slide | /slideshow | 발표 deck일 때 부른다. 온디맨드 스킬이라 설치돼 있지 않을 수 있다.[](source:sk-read)[](source:r-life) | hub-position | slide |
| p-remo | /remotion-to-hyperframes | 입력이 Remotion source일 때 부른다. 온디맨드 스킬이라 설치돼 있지 않을 수 있다.[](source:sk-read)[](source:r-life) | hub-position | remo |

| rel-id | 상대 | 종류 | 받는 것 / 넘기는 것 | 조건 |
| --- | --- | --- | --- | --- |
| R01·R29 | `hyperframes-cli` | 참고 | 명령 실행법 | CLI는 `npx hyperframes <command>`로 돌리고 사용법은 `/hyperframes-cli`에 있다. 의무 표현은 없다.[](source:sk-intro) |
| R02 | `hyperframes-registry` | 넘김 | 검색 결과, 설치된 파일 | 이름 붙은 효과를 손으로 쓰기 전에 검색한다.[](source:sk-intro) |
| R03 | `media-use` | 넘김 | media 파일을 `assets/`로 받는다 | 모든 media와 계약 11조의 grade·grain·blur에 쓴다.[](source:sk-intro)[](source:sk-contract) |
| R04 | `reverse-any-video` | 넘김 | 없음 | 요청이 영상 복사·재현일 때. 강제 아님.[](source:sk-read) |
| R05 | `style-sampling` | 넘김 | 없음 | 요청이 검증된 스타일의 에피소드일 때. 강제 아님.[](source:sk-read) |
| R06·R07 | `slideshow`, `remotion-to-hyperframes` | 넘김 | slideshow composition | 요청이 deck 또는 Remotion source일 때. 설치돼 있지 않을 수 있다.[](source:sk-read)[](source:r-life) |
| R08 | `/figma` | 참고(범위 밖) | 없음 | 'Figma: `/figma`'로만 적혀 있다. 컬렉션 밖이다.[](source:sk-read) |
| R13 | 하위 스킬 7개 → 이 스킬 | 참고 | `references/plugin-installation.md` | 하위 스킬이 plugin 안일 때 이 스킬의 plugin 규칙을 따른다. 조건은 plugin 안일 때뿐이다.[](source:r-plugin) |
| R14~R16 | `reverse-any-video`, `remotion-to-hyperframes`, `slideshow` → 이 스킬 | 참고 | HyperFrames 프로젝트 | 결과물을 이 스킬의 계약에 맞춰 만든다는 연결이다. 원장 기준이며 하위 스킬 쪽 줄은 이 페이지에서 열지 않았다. |
| R22 | `style-sampling` → 이 스킬 | 넘김 | 예시 영상 | style-sampling이 문법을 가져와 새 영화를 만들 때 이 스킬의 `look.md` 'From a reference'로 간다. 제안이고 사람이 고른다는 쪽은 원장 기준이며 style-sampling 쪽 줄은 열지 않았다.[](source:r-look) |
| R25 | `media-use` ↔ 이 스킬 | 공유 상태 | `assets/` | 이 스킬은 media가 `assets/`에 있고 경로는 `assets/...`라고 정한다. 선후 관계는 없다. `media-use` 쪽 줄은 열지 않았다.[](source:sk-intro)[](source:sk-contract) |
| R26 | `hyperframes-registry` ↔ 이 스킬 | 공유 상태 | `compositions/` | 이 스킬의 `index.html`이 `compositions/`의 sub-composition을 mount한다. `add`로 설치한 block이 거기 쓰인다는 쪽은 registry 쪽 줄이라 열지 않았다.[](source:sk-intro) |
| R27 | `hyperframes-cli` ↔ 이 스킬 | 공유 상태 | `.hyperframes/` 기록 | 이 스킬은 변경 전에 `history --since mine --who <you>`로 사람의 편집을 읽는다. `hyperframes-cli` 쪽 줄은 열지 않았다.[](source:sk-loop) |
| R30·R31 | `hyperframes-registry`, `media-use` → 이 스킬 | 참고 | `runtimes.md`, `format.md`, `captions.md`, `motion.md` | 하위 스킬의 reference가 이 스킬의 파일을 가리킨다. 이 페이지에서는 하위 스킬 쪽 줄을 열지 않았다. |

## 이 스킬이 만들거나 바꾸는 것은 무엇인가? {#outputs span=12}

에이전트가 project에 쓰는 파일은 아래와 같다. 어떤 것은 조건이 있을 때만 생긴다. `STORYLINES.md`, `SPEC.md`, `REVIEW.md`는 이야기 영상에서, `STORYBOARD.md`와 `boards/`는 사람이 먼저 정지 이미지를 승인할 때, `frame.md`는 preset을 쓸 때만 생긴다.[](source:r-story-pick)[](source:r-spec)[](source:r-review)[](source:r-sb)[](source:r-look-presets)

@tree id=project-layout title="project에 남는 파일"
| root | project | - |
| index | index.html | root |
| comps | compositions/ | root |
| assets | assets/ | root |
| fonts | fonts/ | assets |
| spec | SPEC.md | root |
| stories | STORYLINES.md | root |
| plan | STORYBOARD.md | root |
| boards | boards/ | root |
| board | storyboard.html | boards |
| stills | stills/ | boards |
| review | REVIEW.md | root |
| frame | frame.md | root |

- `index.html`은 root composition이다. 변수를 선언하고 `compositions/`의 sub-composition을 scene마다 하나씩 mount한다.[](source:sk-intro)[](source:r-format) media와 폰트는 `assets/`에 둔다.[](source:sk-intro)
- storyboard 흐름에서 에이전트는 먼저 `index.html`을 `boards/.film.html`로 복사해 두고, `index.html`에서 shot마다 포즈를 잡아 정지 이미지를 `boards/stills/`에 만든 뒤 `boards/storyboard.html`을 쓴다. 그다음 포즈한 `index.html`을 `boards/.posed.html`로 복사하고 `.film.html`을 `index.html` 위에 되돌려, 사람이 go라고 하기 전까지 preview가 원래 영상을 재생하게 한다. 에이전트는 board를 넘기고 멈춘다. go가 오면 `.posed.html`을 `index.html` 위에 복사해 애니메이션을 시작한다.[](source:r-sb)
- 번들 script는 project가 아니라 현재 작업 폴더에 결과를 쓴다. `bake-basemap.mjs`는 `<NAME>.mp4`, `<NAME>-coords.json`, `frames-<NAME>/`을 쓰고,[](source:x-bake) `locate.mjs`는 격자 이미지를 `--out` 폴더에 쓴다.[](source:x-locate)
- plugin 안에서는 plugin 폴더를 읽기 전용으로 다루고 결과물을 project나 임시 폴더에 둔다.[](source:r-plugin)

## 이 스킬을 쓰지 말아야 할 때와 하지 않는 일은 무엇인가? {#limits span=12}

- 다른 framework나 평범한 browser 녹화를 요청받았으면 HyperFrames를 쓰지 않는다.[](source:sk-intro)
- 질문, 보류, 막연한 아이디어에는 편집하지 않고 답이나 제안만 한다.[](source:sk-intro)
- 기존 project 편집, 영상 위 caption·overlay, 한 아이디어짜리 짧은 작품에는 story 단계를 거치지 않는다.[](source:r-story-skip)
- preset은 사람이 이름을 대거나 deck일 때만 쓰고, brand 없는 영상의 fallback으로 쓰지 않는다.[](source:r-look-presets)
- 스킬 설치, 갱신, 제거는 하지 않는다. 낡은 것과 맞는 명령을 사람에게 알려 준다. plugin 안에서는 `skills update`, `skills check`, `npx skills add`를 돌리지 않는다.[](source:r-life)[](source:r-plugin)
- 사람이 승인하기 전에는 렌더하지 않는다. 승인은 preview 승인, 파일 요청, 멈추지 말라는 요청 중 하나다.[](source:sk-loop)
- 요청이나 source가 요구하지 않으면 voiceover, caption, 새 aspect ratio를 넣지 않는다.[](source:sk-intro)
- 음악 source가 없으면 침묵으로 내고 한 줄로 그렇게 말한다. 소리를 코드로 합성하거나 audio chain을 만드는 데 시간을 쓰지 않는다. 합성한 톤, chime, ding도 쓰지 않는다.[](source:r-sound)
- 제품 UI라고 주장하는 화면을 지어내지 않는다. 화면을 얻지 못하면 'Screenshot: Settings → Motion'처럼 라벨 붙은 placeholder를 쓰고 답에서 말한다.[](source:t-launch)
- 원문이 주는 숫자만 쓴다. 출처가 없는 수치는 빼거나 예시임을 표시한다.[](source:r-story)[](source:t-expl)

## 어디까지 읽었고 무엇을 확인하지 못했나? {#audit span=12}

이 스킬 폴더의 텍스트 원본 74개(합계 1,026,599바이트)를 읽었다. 개수가 30개를 넘어 파일별 목록과 바이트 수는 `skill-explainers/hyperframes/hyperframes/files.md`에 둔다.

- 전부 읽음 34개: `SKILL.md`, `references/` 16개, `references/types/` 7개, `scripts/` 8개, `code-editorial`의 `FRAME.md`와 `caption-skin.html`.
- 구조·표본만 확인(전부 읽지 않음) 40개: 나머지 `FRAME.md` 12개는 frontmatter, 제목 목록, Frame Treatments 제목, 'Numerals & Claims', 'Known Gaps' 절을 읽었다. `caption-skin.html` 12개는 주석의 시각 설명과 script 주소를 읽었다. `frame-showcase.html` 13개는 `<title>`, `<section>` 개수, 앞부분 표본을 읽었다. OFL 라이선스 3개는 첫 줄만 읽었다.
- 읽지 않음: 바이너리 `.woff2` 6개(합계 135,876바이트, 폰트라서). 번역본 `*.KO.md` 24개(합계 157,677바이트, 지침상 열지 않음). 번역본 중 `SKILL.KO.md`만 아래 출처에 읽기용으로 선언했고, 나머지 23개는 `files.md`에 목록만 둔다.

@callout level=open-question title="확인하지 못한 것 1: 폴더 밖 대상"
`/hyperframes-cli`, `/hyperframes-registry`, `/media-use`, `/reverse-any-video`, `/style-sampling`, `/slideshow`, `/remotion-to-hyperframes`, `/figma`의 본문과 `npx hyperframes docs ...` 문서는 이 폴더에 없어 읽지 않았다. 이 페이지가 CLI 명령의 동작이라고 적은 것은 모두 이 폴더의 지시를 옮긴 지시상 동작이다.

@callout level=open-question title="확인하지 못한 것 2: 원문이 비워 둔 곳"
`npx hyperframes events`의 opt-out 방법, 여러 안내표 행이 겹칠 때의 우선순위, 폴더가 HyperFrames project인지 판별하는 방법, 사람이 렌더를 승인했다는 문구의 형태는 원문에 명시 없음이다. 또 `look.md`가 preset을 이름으로 고른 사람의 요청이 `spec.md`의 기본 금지 목록에서 허용하는 '사람이 준 reference'에 해당하는지 원문에 명시 없음이다. `code-editorial`의 cream 바탕, serif, 작은 monospace label은 그 금지 목록과 겹친다.

@callout level=open-question title="확인하지 못한 것 3: network를 쓰는 예시 코드"
계약 4조는 network fetch를 금지한다. 그런데 13개 `caption-skin.html`은 모두 jsDelivr의 GSAP 3.14.2 `<script>`를 불러온다(13개 모두 `grep`으로 확인).[](source:cs-ce)[](source:cs-by)[](source:cs-ef) 이 스킬은 예시를 복사해 쓰라고 하지만 이 CDN `<script>`가 4조의 금지에 걸리는지 원문에 명시 없음이다.

@callout level=note title="분석 중 바뀐 파일"
이 페이지를 쓰는 동안 이 스킬 폴더의 원본 파일을 바꾸지 않았고 대상 스킬의 어떤 명령도 실행하지 않았다. 확인은 읽기 전용 명령(`grep`, `wc`, `git ls-files`)으로만 했다.
