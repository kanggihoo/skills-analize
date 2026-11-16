# HyperFrames로 새 영상 한 편을 만들 때 네 스킬은 어떻게 이어지나? {#build-video-page}

이 묶음은 에이전트가 HyperFrames로 새 영상 한 편을 만들 때, 입구 스킬 `hyperframes`가 정한 작업 순서 안에서 `hyperframes-registry`, `media-use`, `hyperframes-cli`를 언제 꺼내 쓰는지 정리한 것이다.[](source:hf-fm)[](source:hf-build) **강제 순서는 `hyperframes` 안의 작업 루프뿐이고, 나머지 세 스킬은 필요할 때 부르는 도구다.**

- `hyperframes`는 계약과 작업 루프를 정하고 요청별로 안내하는 입구다. 이름 붙은 효과는 손으로 쓰기 전에 registry를 검색하라 하고, 모든 media는 `/media-use`로 보낸다.[](source:hf-build)
- `hyperframes-cli`는 `lint`, `check`, `snapshot`, `preview`, `render` 같은 명령의 실행법을 정한다. `catalog`·`add`와 `media-treatment`·`tts` 명령은 각각 registry, `media-use` 옆에 적어 둔다.[](source:cli-table)
- 네 스킬은 서로를 자동으로 실행하지 않는다. `assets/`, `compositions/`, `hyperframes.json`, `.hyperframes/` 같은 프로젝트 파일로 이어지고, 이 연결에는 선후 관계가 없다.
- 이 페이지는 **부분 분석**이다. 네 `SKILL.md`는 전체를 읽었고 reference는 인용한 줄만 읽었으며, CLI의 실제 동작은 실행하지 않았다.

@answer scope="hyperframes 컬렉션 · 스킬 4개 · 부분 분석 · CLI 동작은 지시상 동작"
@meta locale=ko
@source hf-fm title="스킬 frontmatter" path=hyperframes/hyperframes/SKILL.md lines=1:4
@source hf-cli title="CLI 실행 방식" path=hyperframes/hyperframes/SKILL.md lines=12:12
@source hf-layout title="프로젝트 구조와 시작 명령" path=hyperframes/hyperframes/SKILL.md lines=14:14
@source hf-build title="만들 범위와 registry·media 위임" path=hyperframes/hyperframes/SKILL.md lines=16:16
@source hf-contract title="계약 12조" path=hyperframes/hyperframes/SKILL.md lines=18:33
@source hf-loop title="작업 루프" path=hyperframes/hyperframes/SKILL.md lines=45:50
@source hf-app title="desktop app 안내 규칙" path=hyperframes/hyperframes/SKILL.md lines=52:58
@source hf-route title="요청별 안내표" path=hyperframes/hyperframes/SKILL.md lines=60:79
@source cli-plugin title="plugin 실행 규칙 지목" path=hyperframes/hyperframes-cli/SKILL.md lines=6:6
@source cli-table title="작업별 명령표" path=hyperframes/hyperframes-cli/SKILL.md lines=18:33
@source cli-loop title="확인과 렌더 루프" path=hyperframes/hyperframes-cli/SKILL.md lines=35:43
@source cli-edit title="타임라인 edit 명령" path=hyperframes/hyperframes-cli/SKILL.md lines=45:52
@source cli-hist title="project history 규칙" path=hyperframes/hyperframes-cli/SKILL.md lines=56:60
@source cli-render title="렌더 위치와 렌더 뒤 절차" path=hyperframes/hyperframes-cli/SKILL.md lines=62:74
@source cli-clean title="clean 주의" path=hyperframes/hyperframes-cli/SKILL.md lines=85:85
@source cli-refs title="명령별 reference 안내" path=hyperframes/hyperframes-cli/SKILL.md lines=103:103
@source reg-plugin title="plugin 실행 규칙 지목" path=hyperframes/hyperframes-registry/SKILL.md lines=6:6
@source reg-find title="검색과 설치" path=hyperframes/hyperframes-registry/SKILL.md lines=14:26
@source reg-wiring title="설치 위치와 연결" path=hyperframes/hyperframes-registry/SKILL.md lines=49:56
@source media-plugin title="plugin 실행 규칙 지목" path=hyperframes/media-use/SKILL.md lines=6:6
@source media-assets title="저장 위치와 resolve 명령" path=hyperframes/media-use/SKILL.md lines=12:18
@source media-table title="media 종류별 출처" path=hyperframes/media-use/SKILL.md lines=20:32
@source media-signin title="sign in, host app, HeyGen CLI" path=hyperframes/media-use/SKILL.md lines=34:38
@source media-credit title="credit 한도" path=hyperframes/media-use/SKILL.md lines=40:40
@source media-offer title="빈틈을 한 번 제안하는 규칙" path=hyperframes/media-use/SKILL.md lines=46:48
@source r-story-scope title="story 단계 적용 범위" path=hyperframes/hyperframes/references/story.md lines=3:5
@source r-story-pick title="storyline 세 개 쓰고 고르기" path=hyperframes/hyperframes/references/story.md lines=15:31
@source r-spec title="SPEC.md의 목적" path=hyperframes/hyperframes/references/spec.md lines=1:12
@source r-review title="review를 하는 때와 측정 단계" path=hyperframes/hyperframes/references/review.md lines=1:12
@source r-plugin title="plugin 안에서 실행하는 규칙" path=hyperframes/hyperframes/references/plugin-installation.md
@source r-format-vol title="오디오 속성과 media-use 지목" path=hyperframes/hyperframes/references/format.md lines=83:83
@source r-caption-a title="caption 단어 시각의 출처" path=hyperframes/hyperframes/references/captions.md lines=5:5
@source r-caption-b title="cutout 출처" path=hyperframes/hyperframes/references/captions.md lines=43:43
@source r-sound title="음악 catalog 출처" path=hyperframes/hyperframes/references/sound.md lines=20:20
@source r-life title="core 스킬과 on-demand 스킬" path=hyperframes/hyperframes/references/skill-lifecycle.md lines=7:8
@source r-disc title="runtime을 가리키는 block 설명" path=hyperframes/hyperframes-registry/references/discovery.md lines=104:116
@source r-instloc title="설치 경로와 hyperframes.json" path=hyperframes/hyperframes-registry/references/install-locations.md lines=1:30
@source r-ops title="composition 안 trim과 format.md 지목" path=hyperframes/media-use/references/operations.md lines=22:22
@source r-resolve title="resolve 명령과 예시" path=hyperframes/media-use/references/resolve.md lines=1:40
@source r-audio title="audio 요청 출력 위치" path=hyperframes/media-use/references/audio.md lines=1:17
@source r-capmotion title="caption motion의 hyperframes 지목" path=hyperframes/media-use/audio/references/captions/motion.md lines=85:86
@source r-capauth title="caption 작성의 registry 지목" path=hyperframes/media-use/audio/references/captions/authoring.md lines=43:43
@source sty-credit title="credit 한도 파일 쓰기" path=hyperframes/style-sampling/SKILL.md lines=54:54

## 새 영상 한 편을 만들 때 에이전트는 네 스킬을 어떤 순서로 쓰나? {#behavior span=12}

에이전트는 `hyperframes`에서 시작해 두 번 갈라진다. 먼저 이야기 영상이면 story와 SPEC을 쓰고, 이어서 이름 붙은 효과와 media가 필요한지 가려 registry와 `media-use`를 부른다. 그다음 composition을 쓰고 나면 `hyperframes-cli`의 확인 루프로 넘어간다.

그림은 두 장이다. 한 흐름을 둘로 나눴고 노드마다 `@steps` 설명이 있다.

@workflow id=build-calls title="영상 만들기 1: 무엇을 어떤 스킬로 구하나"
| hf | hyperframes 읽기 | frontend | source:hf-build |
| long | 이야기 영상이 15초를 넘나? | backend | source:r-story-scope |
| plan | story·SPEC 쓰기 | backend | source:r-story-pick |
| fx | 이름 붙은 효과가 필요한가? | backend | source:hf-build |
| reg | registry 검색·설치 | database | source:reg-find |
| md | media가 필요한가? | backend | source:hf-build |
| media | media-use로 구하기 | cloud | source:media-assets |
| write | composition 쓰기 | frontend | source:hf-layout |
| hf > long | |
| long > plan | yes | emphasis |
| long > fx | no |
| plan > fx | |
| fx > reg | yes | emphasis |
| fx > md | no |
| reg > md | |
| md > media | yes | emphasis |
| md > write | no |
| media > write | |

그림 1은 핵심 경로만 그렸다. 효과를 먼저 가리고 media를 나중에 가리는 순서는 읽기 쉽게 정한 판정이다. 원문은 두 호출의 순서와 횟수를 정하지 않으므로(원문에 명시 없음) scene마다 되풀이될 수도 있다.

`hyperframes-cli`는 이 그림에 나오지 않는다. 그 명령은 그림 2에서 쓰고, 스킬 사이 참고 연결은 아래 관계표(`#relations`)에 남겼다.

@steps id=build-calls-steps
| hf-step | hyperframes 읽기 | 에이전트는 영상을 만들거나 고치거나 렌더하라는 요청을 받으면 `hyperframes`를 가장 먼저 읽는다.[](source:hf-fm) 이 스킬이 계약 12조, 작업 루프, 요청별 안내표를 정한다. 질문, 보류, 막연한 아이디어에는 편집하지 않고 답이나 제안만 한다. 요청이나 source가 요구하지 않으면 voiceover, caption, 새 aspect ratio를 넣지 않고, 새 영상은 1920×1080, 30 fps로 시작한다.[](source:hf-build) 새 project는 `npx hyperframes init <dir> --skip-skills --skill=hyperframes`로 시작한다.[](source:hf-layout) 기존 project이면 변경 전에 `timeline --json`으로 구성을 보고 `history --since mine --who <you>`로 사람이 바꾼 것을 읽은 뒤 그 위에 만든다.[](source:hf-loop) 요청이 영상 복제, 스타일 에피소드, deck, Remotion source이면 이 묶음이 아니라 다른 스킬로 안내한다(`#relations` 마지막 행). | build-calls | hf |
| long-step | 이야기 영상이 15초를 넘나? | 에이전트는 만들 영상이 약 15초를 넘고 무언가를 이야기하는지 가른다. launch, explainer, pull request·changelog 영상, recap, 서사가 있는 뮤직비디오가 여기에 든다. 기존 project 수정, 영상 위 caption·overlay, 한 가지 생각만 담은 짧은 영상은 story 단계를 건너뛴다. 사람이 script, storyboard, reference 영상을 줬으면 그것을 따른다.[](source:r-story-scope) 15초를 넘는 이야기 영상이면 `plan`으로, 아니면 `fx`로 간다. 이 판정은 `hyperframes` 안의 규칙이라 다른 스킬을 부르지 않는다. | build-calls | long |
| plan-step | story·SPEC 쓰기 | 에이전트는 영상 종류에 맞는 type 파일을 읽은 뒤 `story.md`에 따라 서로 다른 storyline 세 개를 말로만 쓴다. 사람이 답할 수 있으면 세 개를 보여 주고 한 번 멈춰 사람이 고르게 한다. 파일을 요청했거나 멈추지 말라고 했으면 추천안을 골라 만들고 나머지 둘은 한 줄씩 답에 적는다. 세 storyline은 `STORYLINES.md`로 project에 저장한다.[](source:r-story-pick) 고른 storyline은 `SPEC.md`가 된다. 형용사를 숫자로 바꾸고, 기본값으로 금지할 것을 이름으로 적고, 장면을 frame 단위로 적는다.[](source:hf-loop)[](source:r-spec) 세부는 `skill-explainers/hyperframes/hyperframes/hyperframes.html`에 있다. | build-calls | plan |
| fx-step | 이름 붙은 효과가 필요한가? | 에이전트는 직접 쓰려는 것이 이름 붙은 효과, transition, caption 스타일, chart, card인지 가른다. 맞으면 손으로 쓰기 전에 `hyperframes-registry`를 검색한다.[](source:hf-build) 원문은 조건부 의무 어조이고, 효과를 몇 번 어느 시점에 찾는지는 정하지 않는다(원문에 명시 없음). 해당하지 않으면 `md`로 간다. 이 노드가 원장 R02(넘김)다. | build-calls | fx |
| reg-step | registry 검색·설치 | 에이전트는 `hyperframes-registry`를 읽고 `npx hyperframes catalog --query "<장면이 할 일, 영어로>" --json`으로 찾는다. `registry`라는 명령은 없고 검색은 `catalog`, 설치는 `add`다. 검색은 local이고 아무것도 보내지 않는다. 의미로 찾는 `--on-device`는 약 33 MB를 한 번 내려받아야 해서 사람에게 제안하고 사람이 정한다.[](source:reg-find) 맞는 항목은 `npx hyperframes add <name> --json`으로 설치하고, 이 명령이 쓴 파일과 mount snippet을 출력한다. block은 `compositions/<name>.html`, component는 `compositions/components/<name>.html`에 들어가고, 경로는 `hyperframes.json`이 정한다.[](source:reg-wiring)[](source:r-instloc) 맞는 항목이 없으면 직접 만들기 전에 `feedback --search-miss`로 알린다.[](source:reg-find) 설치한 항목은 평범한 source라서 고치거나 줄이거나 다시 꾸밀 수 있다. 내부 규칙은 `skill-explainers/hyperframes/hyperframes-registry/hyperframes-registry.html`에 있다. | build-calls | reg |
| md-step | media가 필요한가? | 에이전트는 발표자·avatar, footage, voice, music 같은 media가 필요한지 가른다. 필요하면 `/media-use`를 따른다.[](source:hf-build) 계약 11번도 footage의 grade, grain, blur, vignette를 CSS filter가 아니라 `npx hyperframes media-treatment`로 하라고 하며, 이것도 `/media-use` 영역이다.[](source:hf-contract) 필요 없으면 `write`로 간다. 이 노드가 원장 R03(넘김)이다. | build-calls | md |
| media-step | media-use로 구하기 | 에이전트는 `media-use`를 읽고 `npx hyperframes media-use resolve --type <type> --intent "<필요한 것>" --project <dir>`을 실행한다. 이 한 명령이 찾거나 만들고 `resolved <id> → <path> (<type>, <metadata>)` 한 줄을 출력한다. media는 project의 `assets/`에 local 파일과 ledger 기록으로 들어가며 render는 아무것도 내려받지 않는다.[](source:media-assets) HeyGen 모델이나 catalog가 필요하면 매번 먼저 `npx hyperframes auth status`를 돌린다. 로그인되지 않았으면 한 줄로 알리고 사람이 `auth login`을 끝낼 때까지 기다리며, local 도구는 사람이 요청할 때만 쓴다.[](source:media-signin) 사람이 credit 한도를 말하면 `.hyperframes/credit-limit.json`에 `{"credits": N}`으로 한 번 쓰고, 이후 유료 호출은 한도를 넘는 것을 거절한다(지시상 동작). 가격·추정·사용량은 먼저 말하지 않는다.[](source:media-credit) 만든 영상을 한 번 훑어 구체적 빈틈(화면 문구에 voiceover 없음, icon 자리의 emoji, placeholder 이미지, 무음 컷, 10초 넘는 영상의 음악 부재, color cast)을 찾아 한 번에 제안한다. 신호가 없으면 제안하지 않고 "leave it"을 따른다.[](source:media-offer) 내부 규칙은 `skill-explainers/hyperframes/media-use/media-use.html`에 있다. | build-calls | media |
| write-step | composition 쓰기 | 에이전트는 `hyperframes` 계약에 맞춰 scene 파일을 쓴다. `index.html`이 root composition이고 영상의 변수를 선언하며, `compositions/`의 sub-composition마다 scene 하나를 mount한다. media와 font는 `assets/`에 두고 asset 경로는 `assets/...`로 쓴다(앞에 `/` 없음).[](source:hf-layout)[](source:hf-contract) 설치한 block은 `data-composition-src`로 mount하고 component는 markup과 script를 scene에 합친다.[](source:reg-wiring) 계약 12조의 세부는 hyperframes 페이지에 맡긴다. 쓰기를 마치면 그림 2의 `edit` 노드로 이어진다. | build-calls | write |

@workflow id=check-render title="영상 만들기 2: 확인하고 렌더하기"
| edit | edit 쓰고 고치기 | frontend | source:cli-edit |
| lint | lint 실행 | backend | source:cli-loop |
| check | check 오류가 없나? | backend | source:cli-loop |
| snap | snapshot 보기 | backend | source:cli-loop |
| prev | preview 띄우기 | backend | source:cli-loop |
| ok | 렌더해도 되나? | backend | source:hf-loop |
| render | render | backend | source:cli-loop |
| wait | 멈추고 기다림 | external | source:hf-loop |
| edit > lint | |
| lint > check | |
| check > snap | yes | emphasis |
| check > edit | no |
| snap > prev | |
| prev > ok | |
| ok > render | yes | emphasis |
| ok > wait | no |

그림 2도 핵심 경로만 그렸다. 렌더 위치(local, docker, batch, cloud)는 생략했고 `hyperframes-cli` 페이지에서 설명한다. `wait` 뒤에 사람이 수정을 요청하면 어떻게 되는지는 원문에 명시 없어 그리지 않았다.

@steps id=check-render-steps
| edit-step | edit 쓰고 고치기 | 그림 1의 `composition 쓰기`에서 이어진다. 두 그림은 한 흐름을 둘로 나눈 것이다(판정). 에이전트는 `hyperframes-cli`를 읽고 `npx hyperframes <command>`로 명령을 실행하며, project가 wrapper를 주면 wrapper를 쓴다.[](source:cli-table) 타임라인은 Studio가 하는 것과 같은 `timeline move`, `trim`, `split`, `set`, `duplicate`, `delete`로 고친다. `--plan --json`으로 미리 보고, 이웃 clip과 겹치거나 composition 끝을 넘는 edit은 거절된다.[](source:cli-edit) 턴을 시작할 때 `history begin --who <you> --label "<plan>"`을 하고 끝에 `history end`를 한다. check가 실패했거나 사람이 나빠졌다고 하면 손으로 되돌리지 않고 `history undo --who <you>`를 쓴다.[](source:cli-hist) | check-render | edit |
| lint-step | lint 실행 | 에이전트는 첫 pass를 쓴 뒤와 구조를 바꾼 뒤에 `npx hyperframes lint`를 돌린다. 쓰는 동안 돌리는 빠른 검사다.[](source:cli-loop)[](source:cli-table) lint 오류가 남아 있으면 이어지는 check에서 layout·contrast 검사가 돌지 않는다. | check-render | lint |
| check-step | check 오류가 없나? | 에이전트는 마지막 edit 뒤에 `npx hyperframes check --json`을 돌려 모든 error를 고치고 warning은 하나씩 따져 본다.[](source:hf-loop) check는 lint, runtime, layout, contrast를 묶은 통과 조건이다.[](source:cli-table) "0 samples"는 아무것도 검사하지 않았다는 뜻이다. contrast 실패에는 `suggestedColor`가 붙고, 한 sample에서만 나온 finding(들어오는 중인 entrance)은 info이며, 3초 넘는 영상에 보이는 변화가 없으면 `sweep_static`으로 실패한다.[](source:cli-loop) error가 있으면 `edit`로 돌아가고 없으면 `snap`으로 간다. | check-render | check |
| snap-step | snapshot 보기 | 에이전트는 `npx hyperframes snapshot`을 돌려 `.hyperframes/artifacts/snapshots/`의 PNG를 읽는다. 영상은 이렇게 본다. sub-composition이 있으면 scene마다 중간 지점을 snapshot하고, 아주 작고 스타일 없는 내용이나 빠진 hero는 mount 결함이다.[](source:cli-loop) 이야기 영상이면 `snapshot --review`와 `references/review.md`를 따라 `REVIEW.md`로 끝낸다. 작은 edit이면 바꾼 곳을 `--at`, `--range`, `--composition`으로 snapshot해 보고 답한다.[](source:hf-loop) review는 `check`가 통과한 뒤 새 영상과 timing·layout을 바꾸는 모든 edit에 한다.[](source:r-review) | check-render | snap |
| prev-step | preview 띄우기 | 에이전트는 `npx hyperframes preview --background`를 돌려 URL이 200으로 응답하는지 확인하고, 사람에게 project URL을 주고 기다린다. 파일을 요청했거나 멈추지 말라고 했으면 기다리지 않는다.[](source:cli-loop) 새 영상의 delivery render 전에는 멈추지 말라는 요청이 있어도 Studio preview를 열고 거기서 edit할 수 있다고 말한다. `preview`가 "Keep editing by chatting with Framey"를 출력하면 **Edit with Framey** 버튼이 앱을 연다고 덧붙인다. 앱은 "the HyperFrames desktop app"이라 부르고 "Studio"라 부르지 않는다.[](source:hf-app) | check-render | prev |
| ok-step | 렌더해도 되나? | 에이전트는 렌더 조건을 가른다. `hyperframes` 쪽 조건은 check와 review를 통과한 뒤, 사람이 Studio preview를 승인했거나 파일을 요청했거나 멈추지 말라고 한 경우다. 아니면 preview에서 멈추고 기다린다.[](source:hf-loop) `hyperframes-cli`도 check 통과만으로는 렌더할 이유가 되지 않는다고 못 박는다.[](source:cli-loop) 조건이 맞으면 `render`로, 아니면 `wait`로 간다. | check-render | ok |
| render-step | render | 에이전트는 `npx hyperframes render --quality looks -o out.mp4`를 돌린다. 반복 중에는 `draft`, 마지막에는 `delivery`를 쓰고, paid plan이면 `cloud render --fps <data-fps> --quality high -o out.mp4`를 쓴다. 끝나면 파일이 비어 있지 않은지, `ffprobe` 길이가 root `data-duration`과 맞는지 확인하고 decoded frame을 본다.[](source:cli-loop) 30초 영상은 1~2분이라 foreground로 돌리고, tool timeout보다 긴 render만 detach한다.[](source:cli-render) 검증된 render 뒤에는 `feedback --rating` 하나를 보낸다. HyperFrames가 못 하는 요청이 있었다면 보고도 보낸다. telemetry가 꺼져 있으면 보내지 않는다.[](source:cli-render) delivery render 뒤에는 `preview`가 가리킨 Framey 문장을 자기 말로 전하고, 그 문장의 `hyperframes open`을 돌리거나 다운로드 링크를 주겠다고 제안한다.[](source:hf-app) | check-render | render |
| wait-step | 멈추고 기다림 | 렌더 조건이 맞지 않으면 에이전트는 preview에서 멈추고 사람의 다음 요청을 기다린다.[](source:hf-loop) 이 뒤의 행동은 원문에 명시 없다. | check-render | wait |

## 스킬 사이에 무엇을 넘기고 참고하나? {#relations span=12}

원장의 관계 중 이 묶음의 스킬끼리 이어진 것이다. 원문 기준으로 넘김은 조건이 맞으면 그 스킬을 쓰라는 안내이고, 참고는 안내 문장이다. 어느 쪽도 자동 실행이 아니다. 그림에 그린 관계는 R02, R03 둘뿐이고 나머지는 이 표에만 있다.

| rel-id | 종류 | 방향 | 조건·강도와 전달물 | 그림 |
|---|---|---|---|---|
| R01 | 참고 | `hyperframes` → `hyperframes-cli` | CLI는 `npx hyperframes <command>`로 돌리고 사용법은 `/hyperframes-cli`를 본다. 의무 표현은 없다.[](source:hf-cli) | 뺌 |
| R29 | 참고 | `hyperframes` → `hyperframes-cli` | `check`, `snapshot`, `preview`, `render`를 `npx hyperframes`로 하라고만 쓰고, 명령 안내는 `hyperframes-cli`에 있다. R01과 같은 연결의 구체 명령이다.[](source:hf-loop)[](source:cli-loop) | 뺌. 그림 2의 명령 노드가 이 명령이다 |
| R02 | 넘김 | `hyperframes` → `hyperframes-registry` | 이름 붙은 효과·전환·caption 스타일·차트·카드를 손으로 쓰기 전에 registry를 검색한다. 조건부 의무 어조다. 전달물은 검색 결과와 설치된 파일이다.[](source:hf-build)[](source:reg-find) | 그림 1 `fx > reg` |
| R03 | 넘김 | `hyperframes` → `media-use` | 발표자·avatar·footage·voice·music 같은 모든 media는 `/media-use`가 맡는다. 계약 11번은 grade·grain·blur를 `media-treatment`로 보낸다. captions·sound reference도 같은 방향이다.[](source:hf-build)[](source:hf-contract)[](source:r-caption-a)[](source:r-caption-b)[](source:r-sound) 전달물은 `assets/`의 media 파일이다. | 그림 1 `md > media` |
| R09 | 참고 | `hyperframes-cli` → `hyperframes-registry` | 명령표의 Reuse 행에서 `catalog`, `add`를 `/hyperframes-registry`로 연결한다.[](source:cli-table) | 뺌 |
| R10 | 참고 | `hyperframes-cli` → `media-use` | 명령표의 Media and sound 행의 `media-treatment`, `tts` 등을 `/media-use`로 연결한다.[](source:cli-table) | 뺌 |
| R12 | 참고 | `hyperframes-cli` → `hyperframes` | `captions`는 명령이 아니다. `transcribe`를 돌린 뒤 `../hyperframes/references/captions.md`를 읽는다. `keyframes`는 `../hyperframes/references/motion.md`를 읽는다. 파일 경로를 지목한다.[](source:cli-table)[](source:cli-refs) | 뺌 |
| R13 | 참고 | `hyperframes-cli`, `hyperframes-registry`, `media-use` → `hyperframes` | 세 스킬이 첫 줄에서 HyperFrames plugin 안이라면 `../hyperframes/references/plugin-installation.md`의 규칙을 따르라고 한다. 조건은 plugin 안일 때뿐이다.[](source:cli-plugin)[](source:reg-plugin)[](source:media-plugin) 원장은 일곱 스킬을 한 행에 묶었고 나머지 넷은 이 묶음 밖이다. | 뺌 |
| R30 | 참고 | `hyperframes-registry` → `hyperframes` | Liquid Glass, VFX 같은 일부 block 설명이 `/hyperframes`의 `references/runtimes.md`를 가리킨다.[](source:r-disc) | 뺌 |
| R31 | 참고 | `media-use` → `hyperframes` | reference가 `/hyperframes`의 `references/format.md`, `captions.md`, `motion.md`, `runtimes.md`를 가리킨다.[](source:r-ops)[](source:r-capmotion) | 뺌 |
| R32 | 참고 | `media-use` → `hyperframes-registry` | caption의 marker highlight 같은 강조는 registry를 검색하라고 한다. 스킬 이름 `/hyperframes-registry`는 caption 작성 reference에 있다.[](source:r-capauth) 근거 방식은 명시-역할이다. | 뺌 |
| R24~R27 | 공유 상태 | 아래 `#state` 표 | 같은 파일을 읽고 쓰며 선후 관계는 없다. | 표로 대신함 |
| R04~R08, R11 | 넘김·참고 | `hyperframes`와 `hyperframes-cli` → 이 묶음 밖 스킬 | 안내표의 한 행이다. 영상 복제는 `/reverse-any-video`, 검증된 스타일은 `/style-sampling`, deck은 `/slideshow`, Remotion source는 `/remotion-to-hyperframes`, Figma는 `/figma`로 보낸다. 강제 아님.[](source:hf-route) `/slideshow`, `/remotion-to-hyperframes`, `/figma`는 사람이 따로 설치하는 on-demand 스킬이다.[](source:r-life) `hyperframes-cli`의 `present` 명령도 `/slideshow`를 가리킨다.[](source:cli-table) | 생략. 이 묶음 밖 대상 |

`hyperframes`는 이 묶음의 안내 역할 스킬이다. 안내표는 요청 종류별로 type 파일, reference, 다른 스킬을 가리키고 스스로 실행하지 않는다.[](source:hf-route)

## 어떤 파일과 상태를 함께 쓰나? {#state span=12}

파일을 통한 연결이라 누가 먼저 쓰는지는 정해져 있지 않다. 아래 표의 쓰는 주체는 원문이 지시한 동작이며 실제 실행으로 확인하지 않았다.

| 파일·상태 | 쓰는 스킬 | 읽는 스킬 | rel-id |
|---|---|---|---|
| `assets/` | `media-use`가 media를 local 파일과 ledger 기록으로 둔다.[](source:media-assets) | `hyperframes`가 media와 font는 `assets/`에 있다고 하고, 경로를 `assets/...`로 정한다.[](source:hf-layout)[](source:hf-contract) | R25 |
| `.media/<type>/` | `media-use`의 `resolve` 예시와 audio 요청 출력이 이 경로로 적혀 있다. 같은 `media-use` 안에서도 `assets/`와 `.media/`가 갈리며, 원문은 우선순위를 정하지 않는다.[](source:r-resolve)[](source:r-audio) | 읽는 스킬은 원문에 명시 없음 | R25 |
| `compositions/` | `hyperframes-registry`의 `add`가 block을 `compositions/<name>.html`에 쓴다.[](source:reg-wiring) | `hyperframes`의 `index.html`이 `compositions/`의 sub-composition을 mount한다.[](source:hf-layout) | R26 |
| `compositions/components/` | `hyperframes-registry`의 `add`가 component를 `compositions/components/<name>.html`에 쓴다.[](source:reg-wiring) | 읽는 스킬은 원문에 명시 없다. `hyperframes-registry`는 에이전트가 component의 markup, `<style>`, script를 자기 scene에 복사하라고 한다.[](source:reg-wiring) | R26 |
| `hyperframes.json` | `init`이 만들고, 없으면 `add`가 기본값으로 만든다.[](source:r-instloc) | `hyperframes-registry`의 `add`가 설치 경로를 여기서 가져온다.[](source:reg-wiring)[](source:r-instloc) | R26 |
| `.hyperframes/` history | `hyperframes-cli`가 `history begin`과 `history end`를 하라고 하며, 쓰는 주체는 `hyperframes` CLI다.[](source:cli-hist) | `hyperframes`가 변경 전에 `history --since mine --who <you>`로 사람의 편집을 읽는다.[](source:hf-loop) `.hyperframes`는 지우지 않는다.[](source:cli-clean) | R27 |
| `.hyperframes/credit-limit.json` | `media-use`가 사람이 말한 한도를 쓴다. 이 묶음 밖의 `style-sampling`도 같은 파일에 쓴다.[](source:media-credit)[](source:sty-credit) | `media-use`가 유료 호출을 한도에서 거절한다(지시상 동작).[](source:media-credit) | R24 |

## 무엇이 강제이고 무엇이 선택인가? {#limits span=12}

원문이 순서까지 못 박은 것은 `hyperframes`의 작업 루프뿐이다. 새 영상은 type 파일, `story.md`, `SPEC.md`를 거치고, 마지막 edit 뒤에 `check`를 돌린 뒤 사람이 승인해야 렌더한다.[](source:hf-loop) `hyperframes-cli`의 루프는 `lint`, `check --json`, `snapshot`, `preview --background`, `render` 순서이고 check 통과만으로 렌더하지 않는다.[](source:cli-loop) 나머지 둘은 필요할 때 쓰는 선택지다.

- `hyperframes-registry`는 이름 붙은 효과를 손으로 쓰기 전에 검색하는 조건부 의무다. 검색해도 맞는 항목이 없으면 직접 만들되 먼저 알린다.[](source:hf-build)[](source:reg-find)
- `media-use`는 media가 필요할 때만 부른다. 필요 신호가 없으면 부르지 않는다고 적은 곳은 원문에 명시 없다. 같은 스킬의 "Offer once" 절은 신호가 없으면 제안하지 않는다고 한다.[](source:media-offer)
- 사람이 개입하는 곳은 스킬 안에 있다. storyline은 사람이 고르고,[](source:r-story-pick) HeyGen 로그인은 사람이 `auth login`을 끝낼 때까지 기다리고,[](source:media-signin) credit 한도와 한도를 넘는 단계는 사람이 정하고,[](source:media-credit) 의미 검색용 다운로드는 사람이 정하고,[](source:reg-find) 렌더는 사람의 승인을 기다린다.[](source:hf-loop)
- 금지는 `validate`, `inspect`, `layout`(`check`의 deprecated alias)을 쓰지 않는 것과 `.hyperframes`를 지우지 않는 것이다.[](source:cli-table)[](source:cli-clean)
- plugin 안에서는 네 스킬 모두 `npx hyperframes` 대신 plugin 안의 launcher를 쓰고, `hyperframes skills update`, `skills check`, `npx skills add`를 실행하지 않는다. 그림 2의 명령도 같은 규칙을 따른다.[](source:r-plugin) 이 규칙은 plugin 안일 때만 적용된다.

## 어디까지 확인했고 무엇이 남았나? {#audit span=12}

네 `SKILL.md`는 전체를 읽었다. 나머지 파일은 인용한 줄 범위만 읽었고, 아래 바이트는 파일 전체 크기다. 바이너리와 번역본은 열지 않았다.

읽은 텍스트 파일은 20개이고 이 중 전체를 읽은 것은 `SKILL.md` 4개와 `plugin-installation.md` 1개다. 부분 읽음 파일은 15개다.

| 파일 | 바이트 | 읽은 범위 |
|---|---|---|
| `hyperframes/hyperframes/SKILL.md` | 7481 | 전체 |
| `hyperframes/hyperframes-cli/SKILL.md` | 7573 | 전체 |
| `hyperframes/hyperframes-registry/SKILL.md` | 4500 | 전체 |
| `hyperframes/media-use/SKILL.md` | 5311 | 전체 |
| `hyperframes/style-sampling/SKILL.md` | 5113 | 54줄만 |
| `hyperframes/hyperframes/references/story.md` | 11486 | 1~35줄 |
| `hyperframes/hyperframes/references/spec.md` | 6055 | 1~12줄 |
| `hyperframes/hyperframes/references/review.md` | 5327 | 1~25줄 |
| `hyperframes/hyperframes/references/plugin-installation.md` | 2871 | 전체 |
| `hyperframes/hyperframes/references/format.md` | 13196 | 83줄만 |
| `hyperframes/hyperframes/references/captions.md` | 4985 | 5줄, 43줄 |
| `hyperframes/hyperframes/references/sound.md` | 3599 | 20줄만 |
| `hyperframes/hyperframes/references/skill-lifecycle.md` | 4926 | 1~15줄 |
| `hyperframes/hyperframes-registry/references/discovery.md` | 16593 | 100~117줄 |
| `hyperframes/hyperframes-registry/references/install-locations.md` | 1519 | 1~30줄 |
| `hyperframes/media-use/references/operations.md` | 16153 | 18~26줄 |
| `hyperframes/media-use/references/audio.md` | 3362 | 1~17줄 |
| `hyperframes/media-use/references/resolve.md` | 10100 | 1~40줄(분석 근거로 인용하지 않음) |
| `hyperframes/media-use/audio/references/captions/motion.md` | 5480 | 19줄, 85~86줄 |
| `hyperframes/media-use/audio/references/captions/authoring.md` | 9422 | 43줄, 120줄 |

@callout level=open-question title="확인하지 못한 것"
CLI와 HeyGen, `media-use`의 실제 동작은 실행하지 않았다. 이 페이지의 CLI 서술은 지시상 동작이다.
이 묶음 밖 스킬(`reverse-any-video`, `style-sampling`, `slideshow`, `remotion-to-hyperframes`)과 `hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`의 나머지 reference와 scripts는 열지 않았다. 필수 자료의 일부를 확인하지 못했으므로 부분 분석이다.
`media-use`는 media 위치를 `assets/`(SKILL.md:12)와 `.media/<type>/`(audio.md:3~6)로 둘 다 적고, `audio.md:15`는 `assets/voice/`를 적는다. 어느 쪽이 실제 기본인지는 원문에 명시 없다.
`hyperframes-cli` 33줄은 `validate`, `inspect`, `layout`, `events`를 가리키며 "Don't run them"이라고 쓴다. 그런데 8줄은 `npx hyperframes events --skill=hyperframes-cli`를 스킬 시작 때 한 번 실행하라고 한다. 두 지시가 충돌하는지 `events`가 예외인지는 원문에 명시 없다.
