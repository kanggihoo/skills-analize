# slideshow 스킬은 에이전트에게 무엇을 시키고, 언제 쓰면 안 되나? {#slideshow-page}

`slideshow`는 HyperFrames 프로젝트를 영상 파일이 아니라 사람이 앞에서 넘기며 발표하는 deck으로 만들고, `npx hyperframes present`로 띄워 URL을 건네게 하는 스킬이다.[](source:s-intro)[](source:s-serve) 부분 분석이다. HyperFrames plugin 안에서 쓸 때 적용되는 규칙은 폴더 밖 파일이라 읽지 않았다.[](source:s-plugin)

- 발표용 deck이나 presentation이 필요하고 렌더한 영상은 필요 없을 때 쓴다. 이미 있는 page를 deck으로 바꾸는 일도 맡는다.[](source:s-front)
- 에이전트는 slide마다 최상위 scene을 만들고, 어떤 scene이 slide이고 어떻게 이어지는지 적은 JSON island를 HTML에 직접 쓴다. 마지막에는 `present`가 출력한 URL을 사람에게 건넨다.[](source:s-scene)[](source:s-island-rule)[](source:s-serve)
- deck을 MP4로 render하지 않는다. `render`는 첫 scene만 남기고 조용히 잘라 낸다.[](source:s-never)
- 청중이 읽을 글자는 1920×1080에서 40 px 이상이고, `check --json`이 깨끗해질 때까지 고친다.[](source:s-legible)[](source:s-check)

@answer scope="로컬 원본 · SKILL.md 64줄과 references/standalone-harness.md 1017줄 전체 읽음 · 대상 스킬의 명령은 실행하지 않음 · plugin 규칙 파일 미확인"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=f85af643f25876081562e9820cd87fb45a478480
@source s-front title="frontmatter(name, description)" path=hyperframes/slideshow/SKILL.md lines=1:4
@source s-plugin title="plugin 설치 안내" path=hyperframes/slideshow/SKILL.md lines=6:6
@source s-beacon title="사용 신호(beacon) 실행 지시" path=hyperframes/slideshow/SKILL.md lines=8:8
@source s-intro title="개요" path=hyperframes/slideshow/SKILL.md lines=10:12
@source s-scene title="slide는 최상위 scene" path=hyperframes/slideshow/SKILL.md lines=16:16
@source s-island-rule title="island 작성 규칙" path=hyperframes/slideshow/SKILL.md lines=17:17
@source s-island-ex title="island 예시" path=hyperframes/slideshow/SKILL.md lines=19:42
@source s-fields title="island 필드 설명" path=hyperframes/slideshow/SKILL.md lines=44:44
@source s-fragments title="fragment 시간과 seek" path=hyperframes/slideshow/SKILL.md lines=45:45
@source s-branch title="branch slide와 hotspot" path=hyperframes/slideshow/SKILL.md lines=46:46
@source s-legible title="글자 크기와 catalog 검색" path=hyperframes/slideshow/SKILL.md lines=47:47
@source s-port title="기존 page 이식 규칙" path=hyperframes/slideshow/SKILL.md lines=49:55
@source s-never title="render 금지" path=hyperframes/slideshow/SKILL.md lines=59:59
@source s-check title="check 규칙" path=hyperframes/slideshow/SKILL.md lines=60:60
@source s-serve title="present 실행과 URL 전달" path=hyperframes/slideshow/SKILL.md lines=61:61
@source s-root title="루트 index.html과 component 역할" path=hyperframes/slideshow/SKILL.md lines=62:62
@source s-share title="화면 공유 방법" path=hyperframes/slideshow/SKILL.md lines=63:63
@source s-bare title="bare player 안내" path=hyperframes/slideshow/SKILL.md lines=64:64
@source h-frame title="임시 우회책이라는 설명" path=hyperframes/slideshow/references/standalone-harness.md lines=1:17
@source h-wrap title="parent wrapper 예시" path=hyperframes/slideshow/references/standalone-harness.md lines=19:107
@source h-autoplay title="slide별 autoplay" path=hyperframes/slideshow/references/standalone-harness.md lines=109:121
@source h-bridge title="presenter media bridge 설명" path=hyperframes/slideshow/references/standalone-harness.md lines=123:127
@source h-bridge-code title="media bridge 예제 코드" path=hyperframes/slideshow/references/standalone-harness.md lines=129:324
@source h-viz title="media visualizer 연결" path=hyperframes/slideshow/references/standalone-harness.md lines=326:371
@source h-notes title="발표자 notes 저장" path=hyperframes/slideshow/references/standalone-harness.md lines=373:427
@source h-vis title="playhead 기반 scene 표시" path=hyperframes/slideshow/references/standalone-harness.md lines=429:436
@source h-cam title="navigation camera transition" path=hyperframes/slideshow/references/standalone-harness.md lines=437:499
@source h-scenes title="scene CSS와 visibility controller 예제" path=hyperframes/slideshow/references/standalone-harness.md lines=500:602
@source h-entr title="entrance와 fragment 예제" path=hyperframes/slideshow/references/standalone-harness.md lines=606:667
@source h-boot title="scenes manifest postMessage" path=hyperframes/slideshow/references/standalone-harness.md lines=671:718
@source h-audio-media title="slide media 자동 정지와 mute 버튼" path=hyperframes/slideshow/references/standalone-harness.md lines=724:780
@source h-sfx title="SFX cue와 parent 처리" path=hyperframes/slideshow/references/standalone-harness.md lines=781:880
@source h-three title="Three.js 규칙" path=hyperframes/slideshow/references/standalone-harness.md lines=882:955
@source h-foot title="foot-gun 점검표" path=hyperframes/slideshow/references/standalone-harness.md lines=997:1017

## 에이전트는 요청을 받아 deck을 넘기기까지 무엇을 하나? {#behavior span=12}

@workflow id=deck-flow title="deck 제작에서 URL 전달까지"
| beacon | 사용 신호 전송 | external | source:s-beacon |
| mode | page 이식인가? | security | source:s-front |
| port | page 이식 규칙 | backend | source:s-port |
| scenes | slide scene 작성 | backend | source:s-scene |
| island | island 작성 | backend | source:s-island-rule |
| root | 루트 index.html | backend | source:s-root |
| lint | check 깨끗한가? | security | source:s-check |
| fix | 지적 수정 | backend |
| serve | present 실행 | backend | source:s-serve |
| url | URL 전달 | external | source:s-serve |
| beacon > mode | |
| mode > port | 이식 |
| mode > scenes | 새 deck |
| port > scenes | |
| scenes > island | |
| island > root | |
| root > lint | |
| lint > serve | yes | emphasis |
| lint > fix | no |
| fix > lint | 다시 검사 |
| serve > url | |

그림은 핵심 경로만 그린다. `render` 금지는 `present 실행` 설명에, harness 경로(`present` 없이 bare player로 여는 경우)는 아래 `standalone-harness는 언제 필요하고 어떻게 짜여 있나?` 패널에, 화면 공유는 `URL 전달` 설명에 풀어 썼다. `루트 index.html`을 `check`보다 앞에 둔 순서는 원문이 정하지 않았다. 그림의 순서는 분석자의 판정이다.

@steps id=deck-steps
| beacon | 사용 신호 전송 | 스킬이 시작되면 원문은 에이전트에게 `npx hyperframes events --skill=slideshow`를 한 번 실행하라고 지시한다.[](source:s-beacon) 이 명령은 스킬 이름을 CLI의 평소 telemetry와 함께 보낸다. 로그인 상태면 계정에 연결되고 opt-out 설정은 따른다.[](source:s-beacon) 이 노드의 입력은 스킬이 켜졌다는 사실뿐이고 읽는 파일은 없다. 갈라지는 조건은 원문에 없다. 그래서 deck 요청이면 항상 한 번 실행하라는 뜻으로 읽힌다(판정). 명령이 실패했을 때 에이전트가 어떻게 하는지는 원문에 명시 없음이다. 이 분석에서는 명령을 실행하지 않았다. 끝나면 요청이 새 deck인지 기존 page인지 가르는 노드로 넘어간다. | deck-flow | beacon |
| mode | page 이식인가? | 에이전트는 사람의 요청과 description을 보고 두 경우를 가른다. description은 deck을 새로 만드는 일과 기존 page를 deck으로 바꾸는 일을 둘 다 이 스킬의 범위로 적는다.[](source:s-front) 기존 page가 있으면 이식 규칙으로 가고, 없으면 곧바로 slide scene 작성으로 간다. 이 갈림을 결정 노드로 그린 것은 분석자의 구조화다(판정). 원문은 이식 절을 따로 두었을 뿐 "이식일 때만 따른다" 같은 조건문은 쓰지 않는다.[](source:s-port) 이식인지 사람에게 되묻는지는 원문에 명시 없음이다. | deck-flow | mode |
| port | page 이식 규칙 | 이 노드에서 에이전트는 원래 page의 모양, 움직임, 상호작용, media 동작을 그대로 유지하는 데 판단 기준을 둔다. widget, player, visualizer는 비슷하게 흉내 내지 않고 그대로 옮긴다.[](source:s-port) scroll, wheel, camera layer가 만들던 움직임은 slide를 넘길 때 한 focal point에서 다음 focal point로 가는 camera move로 바꾼다. page가 눈에 띄게 스크롤되면 안 되고, 원본에 없는 되돌림 없이 곧게 움직여야 한다.[](source:s-port) screenshot, post, chart, code, 글자가 보이는 이미지는 증거로 본다. 그래서 `object-fit: contain`으로 비율을 지키고 네 모서리가 잘리지 않았는지 확인한다.[](source:s-port) 복사한 `<video>`와 `<audio>`에는 `data-start`와 `data-duration`을 달고, 소리가 나면 `data-has-audio="true"`를 더한다. `preload="none"`은 쓰지 않는다. 자체 media 조작부는 native 요소의 event와 `currentTime`을 읽어야 하고 자기 timer를 쓰면 안 된다.[](source:s-port) 겹쳐 둔 숨은 slide에는 `opacity: 0`, `visibility: hidden`, `pointer-events: none`을 함께 건다. 셋 중 하나라도 빠지면 보이지 않는 층이 click을 삼킨다.[](source:s-port) 이식 결정이 끝나면 결과를 slide scene 작성으로 넘긴다. | deck-flow | port |
| scenes | slide scene 작성 | 에이전트는 slide 하나마다 composition 파일의 최상위 scene 하나를 만든다. scene마다 `data-composition-id`, `data-start`, `data-duration`, `data-label`, `data-width`, `data-height`를 단다. 이 scene들을 감싸는 master root composition은 없다.[](source:s-scene) slideshow는 일반 composition이라서 `/hyperframes` 계약이 그대로 적용된다고 원문은 말한다. 그 계약의 내용은 폴더 밖 문서라 읽지 않았다.[](source:s-intro) 청중이 읽어야 하는 글자는 1920×1080 기준 40 px 이상으로 쓴다.[](source:s-legible) 이름 붙은 시각 요소를 손으로 만들기 전에는 `npx hyperframes catalog --query "<영어 설명>" --json`으로 먼저 검색한다. 이 검색은 아무것도 설치하지 않고 registry 전체를 순위로 보여 준다.[](source:s-legible) 탐색은 재생이 아니라 seek이므로, 각 hold 상태는 timeline을 그 시간으로 바로 옮겼을 때도 올바르게 보여야 한다.[](source:s-fragments) 이 노드는 scene의 `data-composition-id` 목록을 island 작성으로 넘긴다. | deck-flow | scenes |
| island | island 작성 | 에이전트는 composition당 JSON island를 하나만 `<body>` 위쪽에 HTML로 직접 쓴다. 스크립트로 만들면 안 된다. `present`가 파일을 정적으로 읽기 때문이다.[](source:s-island-rule) island의 `slides` 배열에는 본선 slide를 넣는다. 각 항목의 `sceneId`는 scene의 `data-composition-id`와 같아야 하고, 대신 `startTime`과 `endTime`을 줄 수도 있다.[](source:s-fields) `notes`는 발표자에게만 보인다. `ttsScript`, `ttsAudioUrl`, `ttsDurationMs`는 예약만 되어 있고 아직 연결되지 않았으므로 쓰지 않는다.[](source:s-fields) `fragments`는 slide 안에서 내용을 단계별로 공개하는 시점이며 절대 timeline 시간이다. `data-start`와 같은 시계라서 slide 안의 offset으로 쓰면 안 되고, slide의 시작과 끝 사이에 있어야 한다. fragment가 없는 slide는 그 안의 정지 frame에서 시작한다.[](source:s-fragments) 갈래는 `hotspots`로 만든다. hotspot의 `target`은 `slideSequences`의 `id`이고, `region`은 퍼센트 상자이며 생략하면 slide 전체가 버튼이 된다. 원문 예시의 `region`은 x 55, y 60, w 40, h 20이므로 오른쪽 끝 95%, 아래쪽 끝 80%까지 차지한다.[](source:s-island-ex)[](source:s-branch) branch slide는 일반 scene이지만 `slideSequences`에만 나열하고 `slides`에는 넣지 않는다. Back은 hotspot을 가진 slide로 돌아온다.[](source:s-branch) 설명용 예시: 입력이 지어낸 값이다. `problem` slide가 11초에 시작해 18초에 끝난다고 가정하면 `fragments`의 `[11.0, 15.0]`은 그 범위 안이라 규칙을 만족한다.[](source:s-fragments) 이 노드는 완성된 island를 다음 노드로 넘긴다. | deck-flow | island |
| root | 루트 index.html | 에이전트는 프로젝트 루트의 `index.html`이 열자마자 동작하는 deck이 되게 만든다. 구조는 `<hyperframes-slideshow>`가 `<hyperframes-player src="…">`를 감싸는 모양이고, 원본 composition은 필요하면 하위 폴더에 둔다.[](source:s-root) Present(P), Prev/Next, 카운터, 전체 mute, fullscreen, swipe, hotspot, 발표자 notes, slide를 떠날 때의 media 정지는 모두 이 component가 맡는다. 그래서 에이전트는 이 기능을 직접 만들지 않는다.[](source:s-root) 발표자 notes는 편집할 수 있고 deck마다 저장된다.[](source:s-root) 이 노드와 `check`, `present`의 선후를 원문은 정하지 않는다. 이 위치는 판정이다. | deck-flow | root |
| lint | check 깨끗한가? | 에이전트는 `npx hyperframes check --json`을 실행해 결과가 깨끗해질 때까지 반복한다.[](source:s-check) slideshow 규칙이 검사하는 것은 네 가지다. 모든 `sceneId`가 해석되는지, 모든 hotspot `target`이 있는지, fragment가 자기 slide 안에 있는지, 본선 slide끼리 겹치지 않는지다.[](source:s-check) 깨끗하면 `present` 실행으로, 지적이 있으면 지적 수정으로 간다. 반복 횟수 상한과 끝내도 되는 예외는 원문에 명시 없음이다. 종료 조건은 "깨끗하다"뿐이다. | deck-flow | lint |
| fix | 지적 수정 | 에이전트는 `check`가 지적한 곳을 scene이나 island에서 고치고 다시 검사한다.[](source:s-check) 설명용 예시: 입력이 지어낸 것으로, `check`가 어느 hotspot의 `target`이 없다고 지적하면 그 `target`을 `slideSequences`의 `id`와 같은 철자로 맞추는 식으로 고친다. 이 예시는 "모든 hotspot `target`이 존재해야 한다"는 규칙을 쓴다.[](source:s-check) 지적을 어떤 형식으로 보여 주는지는 CLI 출력이라 원문에 명시 없음이다. 수정이 끝나면 `check`로 되돌아간다. | deck-flow | fix |
| serve | present 실행 | 에이전트는 `npx hyperframes present <project-dir>`로 deck을 띄운다.[](source:s-serve) 이 단계에서 deck을 MP4로 render하면 안 된다. `render`는 첫 scene만 남기고 조용히 잘라 내기 때문이다. 정지 이미지가 필요하면 slide마다 `snapshot --at`을 쓴다.[](source:s-never) 에이전트가 읽는 입력은 프로젝트 폴더이고, `present`가 출력하는 URL이 다음으로 넘어간다. 서버를 언제 끄는지는 원문에 명시 없음이다. | deck-flow | serve |
| url | URL 전달 | 에이전트는 `present`가 출력한 URL을 사람에게 건네며 "Click Present, or press P, to open the audience tab."라고 안내한다.[](source:s-serve) 그다음은 사람이 한다. Present를 눌러 청중 tab을 연다. 화면 공유 방법도 사람이 고른다. Google Meet에서는 청중 **tab**을 공유한다. 이 tab은 background에서도 계속 렌더링된다. Zoom에서는 청중 tab을 별도 창으로 끌어내 그 창을 공유한다. 창이 완전히 가려지면 화면이 멈춘다.[](source:s-share) URL을 건네는 것으로 에이전트의 일이 끝난다고 읽힌다(판정). 전달 뒤에 에이전트가 확인하는 일은 원문에 명시 없음이다. | deck-flow | url |

## 언제 켜지고, 어디에는 쓰지 말아야 하나? {#activation span=12}

호출 맥락은 description이 정한다. description은 모델이 켤지 판단할 때 참고하는 설명이고, 특정 단어가 있으면 켜진다는 사전이 아니다. `disable-model-invocation` 같은 호출 제한 필드는 원문 frontmatter에 없다.[](source:s-front)

@code source=s-front language=yaml

description은 "deck이나 presentation을 원하고 렌더한 video는 원하지 않을 때" 쓰라고 말한다.[](source:s-front) 원문은 "이 스킬을 쓰지 말라"는 문장을 따로 두지 않는다. 명시된 금지는 deck을 MP4로 render하는 일 하나뿐이다.[](source:s-never) 영상을 만드는 요청은 이 스킬의 범위 밖이라는 것은 description의 대비("rather than a rendered video")에서 읽어 낸 판정이다.[](source:s-front)

| 상황 | 이 스킬이 맡는가 |
| --- | --- |
| 사람이 실시간으로 발표할 deck을 원한다 | {good:맡는다} 결과물은 실행 중인 deck이지 MP4가 아니다.[](source:s-intro) |
| 기존 page를 발표용으로 바꾼다 | {good:맡는다} 이식 규칙을 따른다.[](source:s-front)[](source:s-port) |
| 만든 deck을 영상 파일로 뽑는다 | {bad:쓰지 않는다} 정지 이미지만 `snapshot --at`으로 slide마다 뽑는다.[](source:s-never) |
| launch film 같은 일반 영상을 만든다 | 원문에 명시 없음. description의 대비에서 이 스킬이 아니라고 읽힌다(판정).[](source:s-front) |

@callout level=warning title="스킬이 시작될 때 telemetry 명령이 붙는다"
| 원문은 스킬이 시작될 때 `npx hyperframes events --skill=slideshow`를 한 번 실행하라고 한다. 스킬 이름이 CLI의 평소 telemetry와 함께 전송되고, 로그인 상태면 계정에 연결된다.[](source:s-beacon) |
| 원문은 opt-out 설정을 존중한다고만 쓰고 설정 위치는 적지 않는다(원문에 명시 없음).[](source:s-beacon) |

다른 스킬과는 `hyperframes/relations.md` 원장의 행으로 이어진다. 이 스킬은 어느 묶음에도 속하지 않는다(원장). 아래 줄은 이 폴더 쪽 원문을 다시 확인한 것이고 반대편 줄은 원장 값을 옮겼다.

- R06: `hyperframes`가 요청이 deck일 때 `/slideshow`를 쓰라고 넘긴다. 이 폴더에서는 description이 deck을 호출 맥락으로 든다.[](source:s-front)
- R11: `hyperframes-cli`의 명령표가 `present`를 `/slideshow`로 연결한다. 이 폴더에서는 `present` 실행을 지시한다.[](source:s-serve)
- R13: HyperFrames plugin 안일 때만 `../hyperframes/references/plugin-installation.md`를 따른다.[](source:s-plugin)
- R16: slideshow는 일반 composition이고 `/hyperframes` 계약이 적용된다.[](source:s-intro)
- R18: 이름 붙은 시각 요소는 `catalog --query`로 검색하라고 한다. 스킬 이름이 아니라 명령을 지목하는 참고 관계다.[](source:s-legible)

## 이 스킬은 무엇을 강제하고 금지하나? {#rules span=12}

아래 표는 찾아보기용이다. 강도는 원문의 어조를 그대로 옮겼다. 동작의 맥락은 위 동작 패널에 있다.

| 규칙 | 내용 | 강도 |
| --- | --- | --- |
| deck을 render하지 않는다 | `render`는 첫 scene만 남기고 조용히 잘라 낸다.[](source:s-never) | 금지("Never") |
| island는 스크립트로 만들지 않는다 | HTML에 직접 쓴다. `present`가 파일을 정적으로 읽는다.[](source:s-island-rule) | 금지("never generated by script") |
| slide는 최상위 scene이다 | master root composition으로 감싸지 않는다.[](source:s-scene) | 서술형 지시 |
| 글자는 40 px 이상이다 | 청중이 읽을 글자에 1920×1080 기준으로 적용한다.[](source:s-legible) | 하한("at least") |
| `check --json`이 깨끗해야 한다 | 깨끗해질 때까지 돌린다.[](source:s-check) | 명령형("until it is clean") |
| fragment는 절대 시간이다 | slide의 시작과 끝 사이에 두고, 그 시간으로 seek해도 올바르게 보여야 한다.[](source:s-fragments) | 서술형 지시 |
| branch slide는 `slides`에 넣지 않는다 | `slideSequences`에만 나열한다.[](source:s-branch) | 금지("never") |
| 숨은 slide는 세 속성을 함께 건다 | `opacity: 0`, `visibility: hidden`, `pointer-events: none`이다.[](source:s-port) | 필수 어조("need") |
| 복사한 media는 시간 속성을 가진다 | `data-start`, `data-duration`이 필요하고 `preload="none"`은 쓰지 않는다.[](source:s-port) | 필수 어조("needs") |
| 글자 있는 이미지는 비율을 지킨다 | `object-fit: contain`을 쓰고 네 모서리를 확인한다.[](source:s-port) | 서술형 지시 |
| 이름 붙은 시각 요소는 먼저 검색한다 | `catalog --query "<영어 설명>" --json`을 쓴다.[](source:s-legible) | 서술형 지시 |
| component 기능을 직접 만들지 않는다 | Present, Prev/Next, 카운터, mute, fullscreen, swipe, hotspot, notes, media 정지가 대상이다.[](source:s-root) | 금지("Don't build") |
| TTS 필드는 쓰지 않는다 | `ttsScript`, `ttsAudioUrl`, `ttsDurationMs`는 아직 연결되지 않았다.[](source:s-fields) | 예약됨 |
| 루트 `index.html`이 열리는 deck이다 | `<hyperframes-slideshow>`가 `<hyperframes-player>`를 감싼다.[](source:s-root) | 권고 어조("should") |

SKILL.md가 정한 수치는 40 px, 1920×1080, 퍼센트 단위 `region` 세 가지다. fragment 시간과 hotspot 크기에 상한이나 개수 제한은 원문에 명시 없음이다.[](source:s-legible)[](source:s-fragments)[](source:s-branch)

## standalone-harness는 언제 필요하고 어떻게 짜여 있나? {#harness span=12}

`present` 없이 bare player bundle로 deck을 열 때만 `references/standalone-harness.md`가 필요하다고 SKILL.md는 말한다.[](source:s-bare) 이 reference는 스스로를 임시 우회책이라고 부른다. engine이 hosting하는 경로가 나오면 대부분 필요 없어지고, 정식 작성 모델이 아니라고 적었다.[](source:h-frame)

우회책이 필요한 이유는 세 가지다. composition은 seek 가능한 `window.__timelines.root` timeline을 노출해야 한다. `<hyperframes-slideshow>`는 composition이 아니라 자기 innerHTML에서 island를 읽는다. composition은 iframe 안에서 돌고 키 입력과 pointer는 parent page에 닿는다.[](source:h-frame)

@architecture id=harness-map title="standalone 구성에서 누가 무엇을 읽고 보내나"
| parent | parent page(wrapper) | frontend | source:h-wrap |
| island | wrapper 안 island 사본 | database | source:h-wrap |
| player | hyperframes-player | frontend | source:h-wrap |
| comp | composition(iframe 안) | backend | source:h-scenes |
| audience | 청중 창 | external | source:h-bridge |
| parent > island | 읽는다 |
| parent > player | 감싼다 |
| player > comp | iframe |
| comp > parent | postMessage | emphasis |
| parent > audience | BroadcastChannel |

그림은 구성 요소의 연결만 보여 준다. 각 요소가 지켜야 할 규칙과 수치는 `@steps`와 다음 패널에 있고, `present`로 띄우는 경로의 동작은 이 그림에 없다.

@steps id=harness-steps
| h-parent | parent page(wrapper) | 에이전트는 이 page에 두 dist bundle(`hyperframes-player.global.js`와 `hyperframes-slideshow.global.js`)을 불러오고 `<hyperframes-slideshow tabindex="0">`를 둔다. 두 bundle은 custom element를 등록하므로 import map이 필요 없다.[](source:h-wrap) `tabindex="0"`은 필수다. 이 element가 ArrowLeft, ArrowRight, Space, Backspace의 keydown을 자기 자신에 묶는데, focus를 받지 못하면 화살표 키가 죽는다.[](source:h-wrap)[](source:h-foot) 공개 deck에서는 이 wrapper가 루트 `index.html`이 되고 원본 composition은 `composition/index.html` 같은 별도 경로에 둔다. `demo.html`은 repo 예제에서 쓰는 이름일 뿐이다.[](source:h-wrap) Present 버튼은 내장 nav capsule이 그리므로 wrapper에 따로 만들지 않는다.[](source:h-wrap) 예제의 script 경로(`../../../packages/player/dist/...`)는 이 저장소에 없는 repo 구조를 가정한다. 다음으로 island 사본과 player를 이 element 안에 넣는다. | harness-map | parent |
| h-island | wrapper 안 island 사본 | `<hyperframes-slideshow>`는 composition이 아니라 자기 innerHTML에서 island를 읽는다. 그래서 composition의 island를 wrapper 안에 그대로 복제해야 한다.[](source:h-frame)[](source:h-wrap) slide, fragment, hotspot, sequence가 바뀔 때마다 두 사본을 함께 고친다. 복제하지 않으면 slide counter와 prev/next가 아예 그려지지 않는다.[](source:h-wrap)[](source:h-foot) 이 사본의 내용은 SKILL.md가 설명한 island와 같은 형식이다. 사본이 어긋났을 때 어느 쪽이 우선하는지는 원문에 명시 없음이다. | harness-map | island |
| h-player | hyperframes-player | 에이전트는 `<hyperframes-player interactive src="composition/index.html">`을 slideshow element 안에 둔다. `interactive`는 click할 page 내용이나 media 조작부가 있는 deck에 필수다. 없으면 player shell이 iframe의 pointer event를 꺼서 composition 안의 click이 player의 재생/정지 토글로 해석될 수 있다.[](source:h-wrap) player는 composition을 iframe으로 불러오는 역할이다. 그 안에서 일어나는 일은 다음 노드가 받는다. | harness-map | player |
| h-comp | composition(iframe 안) | composition은 스스로 시계를 가져야 한다. 일시정지한 GSAP timeline 하나를 `window.__timelines["root"]`에 두고, 전체 길이만큼 빈 `to()`를 걸어 seek 가능한 범위를 만든다.[](source:h-scenes) visibility controller는 이 timeline의 `onUpdate`에서 현재 시간을 읽어 활성 scene만 `opacity: 1`, `visibility: visible`, `pointer-events: auto`로 바꾼다. 불러올 때 `updateVisibility(0)`을 동기로 한 번 불러 첫 slide가 비지 않게 한다.[](source:h-scenes)[](source:h-foot) engine이 없으면 seek timeline의 tween이 돌지 않으므로, scene이 활성이 될 때마다 `[data-anim]` 요소에 `gsap.from()`을 직접 건다.[](source:h-entr) fragment는 재생 위치가 fragment 시간을 처음 넘을 때 한 번 드러난다. 예제는 해당 scene에 다시 들어올 때 fragment 상태를 초기화한다.[](source:h-entr) 모든 scene을 `postMessage`로 parent에 알려야 하고, branch scene도 빠뜨리면 안 된다.[](source:h-boot) | harness-map | comp |
| h-audience | 청중 창 | 같은 deck을 `?mode=audience`로 연 창이다.[](source:h-bridge-code) 슬라이드 위치는 deck 범위의 `BroadcastChannel`로 동기화된다.[](source:h-bridge) 발표자가 composition 안의 media를 직접 조작한다면 native media event를 같은 channel로 비춰 보내야 한다. media element가 진실의 원천이고 custom 버튼의 내부 상태를 비추면 안 된다.[](source:h-bridge) `BroadcastChannel` 메시지는 사용자 activation을 청중 창에 전달하지 못한다. 그래서 청중 창은 먼저 muted로 재생을 시도하고, `media.play()`가 거부되면 "Enable audience media" 버튼을 띄운 뒤 click이나 key 입력 후 마지막 재생 의도로 다시 시도한다.[](source:h-bridge)[](source:h-bridge-code) media event는 발표자 모드에서만 내보낸다. 청중 쪽 mute는 browser autoplay 제한을 피하는 로컬 우회일 뿐이라 발표자에게 되돌려 보내지 않는다.[](source:h-foot) | harness-map | audience |

## harness는 scene 표시, camera, 소리, Three.js를 어떻게 다루나? {#harness-detail span=12}

scene 표시와 fragment는 이렇게 다룬다.

- 모든 scene frame은 CSS에서 `opacity: 0`, `visibility: hidden`, `pointer-events: none`으로 시작한다. `opacity: 0`만 걸면 안 보이는 frame이 click을 막기 때문이다.[](source:h-scenes)
- Three.js canvas를 뒤에 깔 거라면 scene 배경은 `transparent`여야 한다.[](source:h-vis)
- fragment 시간은 한 scene이 시작한 뒤 300~500 ms 안에 모아 두는 것이 권고다. 그래야 ArrowRight를 연타할 때 긴 대기 없이 빠르게 공개된다.[](source:h-entr)

scroll로 움직이던 원본 page를 옮길 때와 camera는 이렇게 다룬다.

- 에이전트는 scroll 진행 stop, easing, camera/focus 상태를 뽑아 slide 이동의 timeline 위치나 fragment로 다시 만든다. 브라우저의 page scroll 모양을 slide 안에서 흉내 내면 안 된다.[](source:h-vis)
- 수동 이동은 각 slide의 hold frame으로 곧바로 seek한다. 그래서 camera 위치가 맞아도 화면이 튄다. 이를 막으려고 standalone wrapper에서 수동 이동용 navigation transition을 따로 단다.[](source:h-cam)
- 예제는 760 ms transition이고, slide가 바뀌면서 시간이 1.2초 넘게 움직였을 때만 켠다. 측정, 첫 로드, resize, 검증 seek에서는 `hf-camera-static`으로 끈다.[](source:h-cam)
- 렌더 영상은 CSS transition에 의존하면 안 된다. 한 frame만 seek해도 올바르게 보여야 하기 때문이다.[](source:h-cam)

소리는 두 층으로 나뉜다.

- 일반 slide media는 composition 안에 둔다. slideshow player가 slide나 sequence가 바뀔 때 `hyperframes-player.stopMedia()`로 자동 정지한다. 같은 slide 안의 fragment 공개에는 정지하지 않고, `audio-src` 같은 deck 단위 parent audio도 건드리지 않는다.[](source:h-audio-media)
- wrapper가 소유한 효과음은 parent page에 둔다. 사용자의 keypress가 parent에 닿아 activation이 믿을 만한 곳이기 때문이다.[](source:h-frame)[](source:h-audio-media)
- composition은 `{type: "hf-sfx", name}` cue를 mute와 관계없이 항상 보낸다. parent가 `hf-sound` event로 받은 mute 상태에 따라 거른다. cue 이름은 `advance`, `back`, `branch-enter`, `fragment` 네 가지다.[](source:h-sfx)
- mute 버튼은 `<hyperframes-slideshow sound>`로 켠다. nav capsule의 맨 왼쪽에 생기고, 속성이 없으면 숨겨진다. composition 안에는 mute 버튼을 만들지 않는다.[](source:h-audio-media)[](source:h-sfx)

효과음 파일을 구하는 방법과 그 밖의 항목은 이렇다.

- 효과음은 `npx hyperframes media-use resolve --type sfx --intent "<whoosh | click | transition>" --project .`로 구해 로컬 `sfx/`에 복사하고 상대 경로로 참조한다. 렌더할 때 network로 받으면 안 된다. 결정성 규칙이 runtime network 요청을 금지하기 때문이다.[](source:h-sfx) 이 분석에서는 그 명령을 실행하지 않았다.
- 발표자 notes는 공유 `<hyperframes-slideshow>` presenter가 편집 가능한 textarea로 보여 주고 `localStorage`에 저장한다. 공유 player를 쓸 수 있으면 deck 전용 notes 편집기를 만들지 않는다.[](source:h-notes)
- 공유 chrome을 못 쓰는 임시 wrapper만 저장 규약을 그대로 따른다. 접두어는 `hf-slideshow:presenter-notes:v1:`이고 `notes-storage-key` 속성을 쓰며, textarea를 비워도 빈 문자열을 저장한다.[](source:h-notes)
- 사용자 정의 media visualizer는 native media element의 event와 `currentTime`에 연결한다. composition 안에서 media 동기화에 `requestAnimationFrame`을 쓰지 않는다. composition lint가 wall-clock loop를 거부하기 때문이다.[](source:h-viz)
- slide의 `"autoplay": true`는 slide에 들어왔을 때 첫 `<video>` 하나를 처음부터 재생한다. 자동으로 넘기지는 않으므로 발표자가 Next를 누른다.[](source:h-autoplay)
- `autoplay`는 영상이 slide의 주 내용이고 끝나는 때가 넘김 신호일 때만 쓴다. 배경 loop나 발표자가 말을 얹는 영상에는 쓰지 않는다.[](source:h-autoplay)

Three.js는 선택이다.

- 자체 `requestAnimationFrame` loop를 쓰고 HyperFrames seek timeline과 섞지 않는다. canvas는 하나만 만들어 `z-index: 0`, `pointer-events: none`으로 scene frame(`z-index: 1`) 뒤에 둔다.[](source:h-three)
- renderer 생성은 try/catch로 감싼다. 실패하면 canvas를 숨기고 loop를 시작하지 않는다.[](source:h-three)
- 글자가 읽히도록 scrim은 scene frame이 아니라 글자 container에 건다.[](source:h-three)

| 수치 | 값 | 성격 |
| --- | --- | --- |
| fragment 시간을 모으는 범위 | scene 시작 후 300~500 ms | 권고[](source:h-entr) |
| scene manifest 전송 지연 | load 후 300 ms, 예제는 30 FPS, 전체 108초 | 예제[](source:h-boot) |
| 원격 media 시각 보정 | 차이가 0.35초 넘으면 seek | 예제 코드[](source:h-bridge-code) |
| 발표자 `timeupdate` 전송 | 재생 중 450 ms 간격 | 예제 코드[](source:h-bridge-code) |
| navigation camera | 760 ms transition, 1.2초 넘는 이동에서만 | 예제[](source:h-cam) |
| nav capsule 비워 둘 영역 | 오른쪽 아래 약 360×140 px | 권고[](source:h-foot) |
| SFX volume | `advance` 0.45, 나머지 0.4 | 예제[](source:h-sfx) |
| Three.js 버전과 canvas 크기 | three 0.160.0(CDN), 1920×1080 | 예제[](source:h-three) |

원문이 모아 둔 foot-gun 점검표는 17행이다. 아래는 그중 여섯 행을 증상과 고침으로 옮긴 것이다.[](source:h-foot)

| 증상 | 고침 |
| --- | --- |
| click/전환 소리가 안 난다 | SFX를 parent로 옮기고 composition에서는 cue만 보낸다.[](source:h-foot) |
| 모든 scene frame이 겹쳐 보인다 | root GSAP timeline과 `onUpdate` visibility controller를 둔다.[](source:h-foot) |
| hotspot은 가는데 slide가 비었다 | branch를 포함한 모든 scene을 manifest에 넣는다.[](source:h-foot) |
| 3D가 가려져 안 보인다 | `.scene-frame` 배경을 `transparent`로 하고 배경색은 글자 container에 준다.[](source:h-foot) |
| 청중 창 media 시간만 움직이고 재생이 안 된다 | muted 재생을 먼저 시도하고, 거부되면 unlock 버튼을 띄운다.[](source:h-foot) |
| 원본 CSS 변수가 `font-family`에 남아 있다 | 구체적인 font stack이나 로컬 `@font-face`로 바꾼다.[](source:h-foot) |

## 어디까지 확인했고 무엇이 남았나? {#audit span=12}

- 읽은 텍스트 파일은 2개이고 둘 다 끝까지 읽었다. `SKILL.md`는 64줄 5077 B, `references/standalone-harness.md`는 1017줄 44277 B이며 합쳐 49354 B다. 부분 읽음 파일은 0개다.
- 바이너리는 이 폴더에 없다. 번역본(`*.KO.md`)도 이 폴더에 없다.
- 제외한 파일은 이 폴더 밖 문서(`../hyperframes/references/plugin-installation.md`와 `/hyperframes` 계약)다. 원문이 가리키는 것만 확인했고 열지 않았다.[](source:s-plugin)[](source:s-intro)
- 분석 중 바뀐 파일은 없다. 이 폴더의 마지막 변경 commit은 분석 commit `f85af64`이고 작업 트리에 수정이 없다.

@callout level=open-question title="확인하지 못한 것"
| plugin 안에서 쓸 때 따르는 "plugin execution rules"는 폴더 밖 파일에 있다. 그 안에서 이 스킬의 동작이 달라지는지 확인하지 못해 부분 분석이다.[](source:s-plugin) |
| `present`가 island를 어떻게 읽는지, `check`의 slideshow 규칙이 코드로 어떻게 구현됐는지는 CLI를 실행하지 않아 확인하지 못했다. 원문 설명만 옮겼다.[](source:s-island-rule)[](source:s-check) |
| SKILL.md는 루트 `index.html`을 `<hyperframes-slideshow>`가 `<hyperframes-player>`를 감싸는 deck으로 두라고 한다. harness는 같은 모양의 wrapper에 island를 복제하라고 하면서 그것을 bare player 경로의 우회책으로 규정한다. `present`로 띄우는 경로에서도 루트 wrapper에 island 사본이 필요한지는 원문에 명시 없음.[](source:s-root)[](source:h-frame) |
| `standalone-harness.md` 15줄의 "Living reference implementations:" 아래 목록이 비어 있어 참조할 예제 경로를 알 수 없다.[](source:h-frame) |
| harness의 script 경로는 `packages/player/dist/` 구조를 가정한다. 이 저장소에는 그 bundle이 없고, 내용은 확인하지 못했다.[](source:h-wrap) |
| 7절 Three.js 예제는 CDN에서 module을 불러오고 자체 `requestAnimationFrame` loop를 쓴다. 같은 문서는 SFX에 대해 "렌더 때 network 요청 금지"를, media 동기화에 대해 "composition lint가 wall-clock loop를 거부한다"를 말한다. Three.js 예제가 이 두 규칙에 걸리는지는 원문에 명시 없음.[](source:h-three)[](source:h-sfx)[](source:h-viz) |
| `check`를 몇 번까지 반복하는지, `present` 서버를 언제 끄는지, URL 전달 뒤 에이전트가 하는 일은 원문에 명시 없음.[](source:s-check)[](source:s-serve) |
