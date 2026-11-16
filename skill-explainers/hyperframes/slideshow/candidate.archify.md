# slideshow 스킬은 언제 켜지고, 무엇을 강제하고, 무엇을 금지하나? {#slideshow-page}

`slideshow`는 발표용 deck을 만드는 스킬이다. 에이전트는 일반 composition에 slide 지도(JSON island)를 붙이고, 결과물을 MP4가 아니라 `npx hyperframes present`로 띄우는 deck으로 넘긴다.[](source:intro)[](source:front)

- deck 렌더링을 금지한다. `render`는 첫 scene만 남기고 조용히 잘라 낸다.[](source:never)
- slide는 최상위 scene이고, island는 HTML에 직접 쓴다. 스크립트로 만들면 `present`가 읽지 못한다.[](source:scene)[](source:island-rule)
- 청중이 읽을 글자는 1920×1080에서 40 px 이상이다.[](source:text40)
- 전달 전에 `check --json`을 깨끗하게 만들고, URL을 사람에게 건넨다.[](source:check)[](source:serve)

@answer scope="로컬 원본 분석 · SKILL.md 64줄과 references/standalone-harness.md 1017줄 전체 읽음 · 대상 스킬의 명령은 실행하지 않음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=f85af643f25876081562e9820cd87fb45a478480
@source full-skill title="hyperframes/slideshow/SKILL.md · 5077B · 스킬 본문" path=hyperframes/slideshow/SKILL.md
@source front title="hyperframes/slideshow/SKILL.md · 5077B · frontmatter" path=hyperframes/slideshow/SKILL.md lines=1:4
@source plugin title="hyperframes/slideshow/SKILL.md · 5077B · plugin 설치 안내" path=hyperframes/slideshow/SKILL.md lines=6:6
@source beacon title="hyperframes/slideshow/SKILL.md · 5077B · 사용 신호(beacon)" path=hyperframes/slideshow/SKILL.md lines=8:8
@source intro title="hyperframes/slideshow/SKILL.md · 5077B · 개요" path=hyperframes/slideshow/SKILL.md lines=10:12
@source scene title="hyperframes/slideshow/SKILL.md · 5077B · slide는 최상위 scene" path=hyperframes/slideshow/SKILL.md lines=16:16
@source island-rule title="hyperframes/slideshow/SKILL.md · 5077B · island 규칙" path=hyperframes/slideshow/SKILL.md lines=17:17
@source island-ex title="hyperframes/slideshow/SKILL.md · 5077B · island 예시" path=hyperframes/slideshow/SKILL.md lines=19:42
@source fields title="hyperframes/slideshow/SKILL.md · 5077B · island 필드" path=hyperframes/slideshow/SKILL.md lines=44:44
@source fragments title="hyperframes/slideshow/SKILL.md · 5077B · fragment 시간" path=hyperframes/slideshow/SKILL.md lines=45:45
@source branch title="hyperframes/slideshow/SKILL.md · 5077B · branch slide" path=hyperframes/slideshow/SKILL.md lines=46:46
@source text40 title="hyperframes/slideshow/SKILL.md · 5077B · 글자 크기와 catalog" path=hyperframes/slideshow/SKILL.md lines=47:47
@source port title="hyperframes/slideshow/SKILL.md · 5077B · page 이식" path=hyperframes/slideshow/SKILL.md lines=49:55
@source never title="hyperframes/slideshow/SKILL.md · 5077B · render 금지" path=hyperframes/slideshow/SKILL.md lines=59:59
@source check title="hyperframes/slideshow/SKILL.md · 5077B · check 규칙" path=hyperframes/slideshow/SKILL.md lines=60:60
@source serve title="hyperframes/slideshow/SKILL.md · 5077B · present 실행" path=hyperframes/slideshow/SKILL.md lines=61:61
@source rootindex title="hyperframes/slideshow/SKILL.md · 5077B · 루트 index.html" path=hyperframes/slideshow/SKILL.md lines=62:62
@source share title="hyperframes/slideshow/SKILL.md · 5077B · 화면 공유" path=hyperframes/slideshow/SKILL.md lines=63:63
@source bare title="hyperframes/slideshow/SKILL.md · 5077B · bare player 안내" path=hyperframes/slideshow/SKILL.md lines=64:64
@source full-harness title="hyperframes/slideshow/references/standalone-harness.md · 44277B · standalone 우회 방법" path=hyperframes/slideshow/references/standalone-harness.md
@source h-frame title="hyperframes/slideshow/references/standalone-harness.md · 44277B · 1절 임시 우회책" path=hyperframes/slideshow/references/standalone-harness.md lines=1:17
@source h-wrap title="hyperframes/slideshow/references/standalone-harness.md · 44277B · 2절 parent wrapper" path=hyperframes/slideshow/references/standalone-harness.md lines=19:107
@source h-autoplay title="hyperframes/slideshow/references/standalone-harness.md · 44277B · autoplay" path=hyperframes/slideshow/references/standalone-harness.md lines=109:121
@source h-bridge title="hyperframes/slideshow/references/standalone-harness.md · 44277B · presenter media bridge" path=hyperframes/slideshow/references/standalone-harness.md lines=123:127
@source h-viz title="hyperframes/slideshow/references/standalone-harness.md · 44277B · media visualizer" path=hyperframes/slideshow/references/standalone-harness.md lines=326:371
@source h-notes title="hyperframes/slideshow/references/standalone-harness.md · 44277B · presenter notes" path=hyperframes/slideshow/references/standalone-harness.md lines=373:427
@source h-vis title="hyperframes/slideshow/references/standalone-harness.md · 44277B · 3절 scene 표시" path=hyperframes/slideshow/references/standalone-harness.md lines=429:436
@source h-cam title="hyperframes/slideshow/references/standalone-harness.md · 44277B · navigation camera" path=hyperframes/slideshow/references/standalone-harness.md lines=437:604
@source h-entr title="hyperframes/slideshow/references/standalone-harness.md · 44277B · 4절 entrance와 fragment" path=hyperframes/slideshow/references/standalone-harness.md lines=606:669
@source h-boot title="hyperframes/slideshow/references/standalone-harness.md · 44277B · 5절 scenes postMessage" path=hyperframes/slideshow/references/standalone-harness.md lines=671:720
@source h-audio title="hyperframes/slideshow/references/standalone-harness.md · 44277B · 6절 audio와 SFX" path=hyperframes/slideshow/references/standalone-harness.md lines=722:880
@source h-three title="hyperframes/slideshow/references/standalone-harness.md · 44277B · 7절 Three.js" path=hyperframes/slideshow/references/standalone-harness.md lines=882:995
@source h-foot title="hyperframes/slideshow/references/standalone-harness.md · 44277B · 8절 foot-gun 표" path=hyperframes/slideshow/references/standalone-harness.md lines=997:1017

## 언제 켜지고 어디에는 쓰면 안 되나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻은 아니다. `disable-model-invocation` 같은 호출 제한 필드는 원문 frontmatter에 없다.[](source:front)

@code source=front language=yaml

원문은 "발표할 deck이나 presentation이 필요하고 렌더된 video는 필요 없을 때"를 호출 맥락으로 든다. 기존 page를 deck으로 바꾸는 일도 같은 맥락에 둔다.[](source:front)

| 상황 | 이 스킬이 맡는가 | 근거 |
|---|---|---|
| 사람이 live로 발표할 deck을 원한다 | {good:맡는다} 결과물은 실행 중인 deck이다.[](source:intro) | description |
| 기존 page를 발표용으로 바꾼다 | {good:맡는다} 원본의 모양, 움직임, 상호작용, media 동작을 유지한다.[](source:port) | porting 절 |
| deck을 MP4로 내보낸다 | {bad:쓰지 않는다} `render`는 첫 scene만 남기고 조용히 잘라 낸다. 정지 이미지는 slide마다 `snapshot --at`을 쓴다.[](source:never) | Present 절 |
| 일반 영상(launch film, explainer 등)을 만든다 | 원문에 명시 없음. 이 스킬은 영상 대신 deck이 필요할 때로 범위를 잡는다.[](source:front) 영상 쪽 안내는 `hyperframes` 스킬이 맡는다(원장 R06). | 판정 |

판정: 원문은 "이 스킬을 쓰지 말라"는 문장을 따로 두지 않는다. 쓰면 안 되는 때는 `render` 금지 한 가지만 명시돼 있고, 나머지는 description의 "deck이 아니라 video가 필요하면"이라는 경계에서 읽어 낸 것이다.[](source:front)[](source:never)

@callout level=warning title="시작할 때 telemetry 명령이 붙는다"
| 원문은 스킬이 시작될 때 `npx hyperframes events --skill=slideshow`를 한 번 실행하라고 한다. 스킬 이름이 CLI의 평소 telemetry와 함께 전송되고, 로그인 상태면 계정에 연결된다. opt-out 설정은 따른다.[](source:beacon) |
| 이 분석에서는 그 명령을 실행하지 않았다. |

## slide는 어떻게 짜야 하나? {#authoring}

slideshow는 일반 composition(`/hyperframes` 계약이 적용된다)에 JSON island 하나를 더한 것이다.[](source:intro) 아래 표는 영상 project와 달라지는 점이다.

| 규칙 | 내용 | 강도 |
|---|---|---|
| slide = 최상위 scene | scene마다 `data-composition-id`, `data-start`, `data-duration`, `data-label`, `data-width`, `data-height`를 둔다. 전체를 감싸는 master root composition은 없다.[](source:scene) | 지시 |
| island는 composition당 1개 | `<body>` 위쪽에 HTML로 직접 쓴다. 스크립트로 생성하지 않는다. `present`가 파일을 정적으로 읽기 때문이다.[](source:island-rule) | 지시("never generated by script") |
| `sceneId` | scene의 `data-composition-id`와 같게 쓴다. 대신 `startTime`/`endTime`을 줘도 된다.[](source:fields) | 지시 |
| `notes` | 발표자에게만 보인다.[](source:fields) | 설명 |
| `ttsScript`, `ttsAudioUrl`, `ttsDurationMs` | 예약만 돼 있고 아직 연결되지 않았다.[](source:fields) | 쓰지 않음 |
| fragment 시간 | 절대 timeline 시간이다. `data-start`와 같은 시계이며 slide 안의 offset이 아니다. slide의 `[start, end]` 안에 있어야 한다.[](source:fragments) | 지시 |
| 이동 방식 | 탐색은 재생이 아니라 seek이다. 각 hold 상태는 그 시간으로 바로 seek했을 때도 올바르게 보여야 한다. fragment가 없는 slide는 slide 안의 정지 frame에서 시작한다.[](source:fragments) | 지시 |
| branch slide | 일반 scene이되 `slideSequences`에만 나열하고 `slides`에는 넣지 않는다. hotspot의 `target`은 sequence `id`다. `region`은 퍼센트 상자이며 생략하면 slide 전체 버튼이 된다. Back은 hotspot을 가진 slide로 돌아간다.[](source:branch) | 지시 |
| 글자 크기 | 청중이 읽을 글자는 1920×1080에서 최소 40 px이다.[](source:text40) | 지시 |
| 이름 붙은 시각 요소 | 손으로 만들기 전에 `npx hyperframes catalog --query "<영어 설명>" --json`으로 검색한다. 아무것도 설치하지 않아도 registry 전체를 순위로 보여 준다.[](source:text40) | 지시 |

```json title="원문 예시의 모양 (일부)"
{"slides":[{"sceneId":"hook","notes":"..."},{"sceneId":"problem","fragments":[11.0,15.0],"hotspots":[{"id":"h1","target":"market-detail","region":{"x":55,"y":60,"w":40,"h":20}}]}],"slideSequences":[{"id":"market-detail","slides":[{"sceneId":"mkt-math"}]}]}
```

원문 전체 예시는 줄 19~42에 있다.[](source:island-ex) 예시의 `region` 값은 퍼센트이며 `x 55, y 60, w 40, h 20`이다.

## 기존 page를 deck으로 바꾸고 넘기는 순서는? {#port-present}

@workflow id=deck-flow title="deck 제작에서 전달까지"
| scenes | slide scene 작성 | backend | source:scene |
| island | island 작성 | backend | source:island-rule |
| lint | check 통과? | security | source:check |
| serve | present 실행 | backend | source:serve |
| url | URL 전달 | external | source:serve |
| fix | 지적 수정 | backend |
| scenes > island | |
| island > lint | |
| lint > serve | yes | emphasis |
| lint > fix | no | dashed |
| fix > lint | 재검사 | dashed |
| serve > url | |

@steps id=deck-steps
| scenes | slide scene 작성 | 각 slide를 최상위 scene으로 둔다. page를 이식하면 원본의 look, motion, 상호작용, media 동작을 유지한다.[](source:scene)[](source:port) | deck-flow | scenes |
| island | island 작성 | `sceneId`, `fragments`, `hotspots`, `slideSequences`를 HTML에 직접 쓴다.[](source:island-rule) | deck-flow | island |
| lint | check 통과? | `npx hyperframes check --json`이 깨끗해질 때까지 돌린다. slideshow 규칙은 `sceneId` 해석, hotspot `target` 존재, fragment의 slide 안 위치, 본선 slide의 겹침을 검사한다.[](source:check) | deck-flow | lint |
| serve | present 실행 | `npx hyperframes present <project-dir>`로 띄운다.[](source:serve) | deck-flow | serve |
| url | URL 전달 | 출력된 URL을 건네며 "Present를 누르거나 P를 눌러 청중 tab을 연다"고 안내한다.[](source:serve) | deck-flow | url |

이식 규칙은 다음과 같다. 모두 원문의 지시다.[](source:port)

| 대상 | 규칙 |
|---|---|
| widget, player, visualizer | 비슷하게 흉내 내지 않고 그대로 옮긴다.[](source:port) |
| scroll, wheel, camera layer가 만들던 움직임 | slide 이동 때 한 focal point에서 다음 focal point로 가는 camera move로 바꾼다. page가 눈에 띄게 스크롤되면 안 된다. 원본에 없는 되돌림 없이 곧게 움직인다.[](source:port) |
| screenshot, post, chart, code, 글자가 있는 이미지 | 증거로 본다. `object-fit: contain`으로 비율을 지키고 네 모서리의 잘림을 확인한다.[](source:port) |
| 복사한 `<video>`/`<audio>` | `data-start`와 `data-duration`을 둔다. 소리가 나면 `data-has-audio="true"`를 더하고 `preload="none"`은 쓰지 않는다. 자체 media 조작부는 native 요소의 event와 `currentTime`을 읽으며 자기 timer를 쓰지 않는다.[](source:port) |
| 겹쳐 둔 숨은 slide | `opacity: 0`, `visibility: hidden`, `pointer-events: none`을 함께 건다. 하나라도 빠지면 보이지 않는 층이 click을 가로챈다.[](source:port) |

루트 `index.html`은 바로 열리는 deck이어야 한다. `<hyperframes-slideshow>`가 `<hyperframes-player src="…">`를 감싸고, 원본 composition은 필요하면 하위 폴더에 둔다.[](source:rootindex) Present(P), Prev/Next, 카운터, 전체 mute, fullscreen, swipe, hotspot, 발표자 notes(편집 가능, deck마다 저장), slide를 떠날 때 media 정지는 이 component가 맡으므로 직접 만들지 않는다.[](source:rootindex)

사람이 개입하는 지점은 네 곳이다. 사람이 요청해야 하고, URL을 받아 Present를 눌러야 하며, 화면 공유 방식을 고르고, 발표 중 Next를 눌러 넘긴다.[](source:front)[](source:serve)[](source:share) 화면 공유는 Google Meet에서는 청중 **tab**을 공유한다(background에서도 계속 렌더링된다). Zoom에서는 청중 tab을 별도 창으로 끌어내 그 창을 공유하며, 창이 완전히 가려지면 화면이 멈춘다.[](source:share)

## standalone-harness와 다른 스킬은 언제 필요한가? {#harness-relations}

`present` 없이 bare player bundle로 deck을 열 때만 `references/standalone-harness.md`가 필요하다. SKILL.md가 이 파일을 가리키며, 이 폴더에 파일이 있다.[](source:bare)

원문은 이 문서를 임시 우회책으로 규정한다. engine이 hosting하는 경로가 나오면 대부분 필요 없어진다고 적었고, 정식 작성 모델이 아니라고 못 박는다.[](source:h-frame) 우회책이 필요한 이유는 세 가지다.[](source:h-frame)

1. composition이 seek 가능한 `window.__timelines.root` timeline을 노출해야 한다.
2. `<hyperframes-slideshow>`는 composition이 아니라 자기 innerHTML에서 island를 읽는다. 그래서 wrapper에 island를 복제해야 한다.
3. composition은 iframe에서 돌고 키 입력과 pointer는 parent page에 닿는다. wrapper가 소유하는 SFX와 전역 audio는 parent에 둔다.

| 항목 | 규칙과 수치 | 구분 |
|---|---|---|
| wrapper | 공개 deck에서는 wrapper가 루트 `index.html`이고 원본 composition은 `composition/index.html` 같은 별도 경로에 둔다. `demo.html`은 repo 예제의 이름일 뿐이다.[](source:h-wrap) | 권고 |
| `tabindex="0"` | `<hyperframes-slideshow>`에 필수다. 없으면 화살표 키가 죽는다.[](source:h-wrap)[](source:h-foot) | 필수 |
| `interactive` | click 가능한 내용이나 media 조작부가 있는 deck에 필수다. 없으면 composition 클릭이 player 재생/정지로 해석될 수 있다.[](source:h-wrap) | 필수 |
| island 복제 | 원본 island와 wrapper 사본을 항상 맞춘다. slide, fragment, hotspot, sequence가 바뀔 때마다 사본도 고친다.[](source:h-wrap) | 필수 |
| `autoplay` | slide의 첫 `<video>` 하나를 들어올 때 처음부터 재생한다. 자동으로 넘기지는 않으며 발표자가 Next를 누른다. 영상이 slide의 주 내용이고 끝이 넘김 신호일 때 쓰고, 배경 loop나 발표자가 말을 얹는 영상에는 쓰지 않는다.[](source:h-autoplay) | 조건부 |
| fragment 시간 | 한 scene 시작에서 300~500 ms 안에 모아 ArrowRight 연타가 끊김 없이 이어지게 한다.[](source:h-entr) | 권고 |
| scene manifest | 모든 scene(branch 포함)을 `postMessage`로 알려야 한다. 빠지면 그 scene으로 seek하지 못한다. 예제는 30 FPS, 로드 후 300 ms 뒤 전송, 전체 108초다.[](source:h-boot)[](source:h-foot) | 필수 |
| presenter media 동기화 | 발표자의 play, pause, seek, mute, rate 변경을 `BroadcastChannel`로 청중 창에 보낸다. 청중 쪽은 먼저 muted로 재생하고, 거부되면 "Enable audience media" 버튼을 띄운다. 예제 코드는 time drift 0.35초 초과일 때 seek, `timeupdate` 전송 450 ms 간격 제한이다.[](source:h-bridge)[](source:h-foot) | 조건부(media가 있을 때) |
| SFX와 mute | `<hyperframes-slideshow sound>`가 nav capsule의 맨 왼쪽에 mute 버튼을 넣는다. composition은 cue를 무조건 보내고 parent가 mute 상태에 따라 거른다. composition 안에 mute 버튼을 만들지 않는다.[](source:h-audio) | 지시 |
| SFX 파일 | `media-use resolve --type sfx`로 구해 로컬 `sfx/`에 두고 상대 경로로 참조한다. 렌더 때 network로 받으면 안 된다(결정성 규칙). 예제 volume은 advance 0.45, 나머지 0.4다.[](source:h-audio) | 지시 |
| nav capsule 영역 | 오른쪽 아래 약 360×140 px는 밝은 3D나 내용을 두지 않는다.[](source:h-foot) | 권고 |
| navigation camera | 예제 transition은 760 ms이고, 1.2초를 넘는 slide 이동에서만 켠다. 측정, 첫 로드, resize, 검증 seek에서는 끈다.[](source:h-cam) | 조건부(scroll 기반 원본) |
| Three.js | 선택이다. 자체 rAF loop를 쓰고, canvas는 하나, `z-index: 0`, `pointer-events: none`이다. scene frame은 `transparent`이며 renderer 생성은 try/catch로 감싼다. 예제는 three 0.160.0을 CDN에서 불러온다.[](source:h-three) | 선택 |

다른 스킬과의 관계는 `relations.md` 원장의 행을 따른다. 아래 표에서 slideshow 쪽 원문 줄은 이 분석에서 다시 확인했고, 반대편 줄은 원장 값을 옮겼다.

| rel-id | 방향 | 종류 | 조건과 강도 | slideshow 쪽 확인 |
|---|---|---|---|---|
| R06 | `hyperframes` → slideshow | 넘김 | 요청이 deck일 때 `/slideshow`를 쓰라고 한다 | description이 deck과 presentation을 호출 맥락으로 든다.[](source:front) |
| R11 | `hyperframes-cli` → slideshow | 참고 | 명령표 Show and ship 행에서 `present`를 `/slideshow`로 연결한다 | 이 스킬이 `present` 실행을 지시한다.[](source:serve) |
| R13 | slideshow → `hyperframes` | 참고 | HyperFrames plugin 안일 때만 `../hyperframes/references/plugin-installation.md`를 따른다 | 첫 문단에 있다.[](source:plugin) |
| R16 | slideshow → `hyperframes` | 참고 | slideshow는 일반 composition이고 `/hyperframes` 계약이 적용된다 | 개요 문장이다.[](source:intro) |
| R18 | slideshow → `hyperframes-registry` | 참고(명시-역할) | `catalog --query`로 검색하라고 한다. 스킬 이름이 아니라 명령을 지목한다 | 글자 크기 줄과 같은 줄이다.[](source:text40) |

## 어디까지 확인했고 무엇이 남았나? {#audit}

| 구분 | 내용 |
|---|---|
| 읽은 텍스트 파일 | 2개. `SKILL.md`(5077B)와 `references/standalone-harness.md`(44277B). 둘 다 끝까지 읽었다. |
| 부분 읽음 | 0개 |
| 바이너리 | 폴더에 없다. 번역본 `*.KO.md`는 규칙에 따라 열지 않았다(분석 근거가 아니다). |
| 제외 | 이 폴더 밖 파일(`hyperframes/hyperframes/references/plugin-installation.md` 등)은 존재만 확인했고 읽지 않았다. |
| 분석 중 바뀐 파일 | 없다. 이 폴더의 마지막 변경 commit은 분석 commit `f85af64`이고 작업 트리에 수정이 없다. |

@callout level=open-question title="확인하지 못한 것"
| `standalone-harness.md` 15줄의 "Living reference implementations:" 아래 목록이 비어 있다. 참조할 예제 경로를 알 수 없다.[](source:h-frame) |
| harness의 script 경로(`../../../packages/player/dist/...`)는 이 저장소에 없는 repo 구조를 가정한다. 해당 bundle과 `hyperframes present` 내부 동작은 확인하지 못했다.[](source:h-wrap) |
| 7절 Three.js 예제는 CDN에서 module을 불러온다. 같은 문서가 SFX에 대해 "렌더 때 network 요청 금지"를 말하는데, Three.js CDN import가 그 규칙에 걸리는지는 원문에 명시 없음.[](source:h-three)[](source:h-audio) |
| `check`의 slideshow 규칙이 실제로 어떤 코드로 검사하는지, `present`가 island를 어떻게 읽는지는 CLI를 실행하지 않아 확인하지 못했다. 원문 설명만 옮겼다.[](source:check) |
