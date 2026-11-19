# slideshow — 렌더 영상 대신 발표용 slideshow를 만든다 {#overview}

에이전트는 HyperFrames로 영상 파일 대신 발표용 slideshow(slide를 넘기며 보여 주는 deck)를 만들어 브라우저에서 띄운다.[](source:s-def)

- 사용자가 렌더 영상이 아니라 deck이나 발표를 원하거나, 기존 page를 deck으로 옮기려 할 때 켜진다.[](source:fm)
- 결과로 slide scene과 slide 구성 JSON이 든 composition이 남고, `present`가 출력한 URL을 사용자에게 건넨다.[](source:s-island)[](source:s-serve)
- 다음 안내: `hyperframes`가 deck 요청에서 이 스킬을 안내한다. 참고: 이 스킬은 `hyperframes` 계약을 따르고 `hyperframes-registry` 검색을 권한다.
- deck을 MP4로 render하지 않는다. `render`는 첫 scene만 남기고 조용히 자른다.[](source:s-render)

@answer scope="hyperframes/slideshow · 원본 파일 2개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source fm title="frontmatter" path=hyperframes/slideshow/SKILL.md lines=1:4
@source s-def title="스킬 정의" path=hyperframes/slideshow/SKILL.md lines=10:12
@source s-beacon title="시작 신호" path=hyperframes/slideshow/SKILL.md lines=8:8
@source s-plugin title="plugin 설치 조건" path=hyperframes/slideshow/SKILL.md lines=6:6
@source s-island title="scene·island 규칙" path=hyperframes/slideshow/SKILL.md lines=14:46
@source s-rules title="글자 크기와 catalog 검색" path=hyperframes/slideshow/SKILL.md lines=47:47
@source s-port title="기존 page 이식 규칙" path=hyperframes/slideshow/SKILL.md lines=49:55
@source s-render title="render 금지" path=hyperframes/slideshow/SKILL.md lines=59:59
@source s-check title="check 반복" path=hyperframes/slideshow/SKILL.md lines=60:60
@source s-serve title="present 실행과 URL 전달" path=hyperframes/slideshow/SKILL.md lines=61:61
@source s-index title="root index.html 구성 규칙" path=hyperframes/slideshow/SKILL.md lines=62:62
@source s-share title="화면 공유 요령" path=hyperframes/slideshow/SKILL.md lines=63:63
@source s-harness title="standalone harness 안내" path=hyperframes/slideshow/SKILL.md lines=64:64
@source h-frame title="harness가 필요한 이유" path=hyperframes/slideshow/references/standalone-harness.md lines=5:13
@source h-island title="wrapper에 island 복제" path=hyperframes/slideshow/references/standalone-harness.md lines=74:79
@source h-manifest title="scenes manifest postMessage" path=hyperframes/slideshow/references/standalone-harness.md lines=671:718
@source rel-hf title="hyperframes의 deck 안내" path=hyperframes/hyperframes/SKILL.md lines=79:79
@source rel-life title="온디맨드 스킬 설치" path=hyperframes/hyperframes/references/skill-lifecycle.md lines=7:8
@source rel-cli title="hyperframes-cli 명령표" path=hyperframes/hyperframes-cli/SKILL.md lines=27:27

## 어떻게 동작하나 {#flow span=12}

그림이 생략한 것이 둘 있다. 첫째, `check`와 `present`와 root `index.html`은 원문이 번호 없는 목록으로 적었다. 그림은 적힌 순서로 이었고 원문이 순서를 강제한다고 쓰지는 않는다.[](source:s-check) 둘째, `check` 실패 뒤 slide 구성으로 돌아가는 간선은 판정이다. 원문은 "깨끗해질 때까지 돌린다"까지만 쓴다.[](source:s-check)

@workflow id=flow-diagram title="slideshow 흐름"
| lane make | 구성 |
| lane verify | 검증 |
| lane hand | 전달 |
| beacon | 시작 신호 | external | make | source:s-beacon |
| scenes | slide 구성 | backend | make | source:s-island |
| port | page 이식 | backend | make | source:s-port |
| check | check 실행 | backend | verify | source:s-check |
| clean-q | check가 깨끗한가? | backend | verify | source:s-check |
| present | present 실행 | backend | hand | source:s-serve |
| index | root index.html 구성 | backend | hand | source:s-index |
| harness | standalone harness | backend | hand | source:s-harness |
| beacon > scenes | |
| scenes > check | 새로 만들 때 |
| scenes > port | 기존 page를 옮길 때 | dashed |
| port > check | |
| check > clean-q | |
| clean-q > scenes | 위반 남음 | dashed |
| clean-q > present | 깨끗함 | emphasis |
| present > index | |
| index > harness | present 없이 열 때 | dashed |

@steps id=flow-steps
| s-beacon | 시작 신호 | **입력** 스킬이 시작되는 시점 · **실행** `npx hyperframes events --skill=slideshow` · **출력** 스킬 이름이 담긴 usage 신호. **처리** 에이전트가 시작할 때 한 번 CLI로 스킬 이름을 보낸다. 이 신호는 CLI의 기본 telemetry와 같은 경로이고 opt-out을 따른다.[](source:s-beacon) | flow-diagram | beacon |
| s-scenes | slide 구성 | **입력** deck으로 만들 내용 · **참조** `/hyperframes` 계약 · **실행** `npx hyperframes catalog --query "<the visual, in English>" --json` · **출력** slide scene이 든 composition 파일과 slide 구성 JSON. **처리** slide마다 최상위 scene을 두고, JSON 블록에 slide 순서·fragment·hotspot을 적는다.[](source:s-island) **다음** 요청이 기존 page를 deck으로 바꾸는 것이면 page 이식을 거치고, 아니면 바로 check로 간다.[](source:s-port) 이름 붙은 visual은 직접 만들기 전에 catalog를 먼저 검색한다.[](source:s-rules) | flow-diagram | scenes |
| s-port | page 이식 | **입력** 원본 page와 그 media · **출력** 원본의 모양과 동작을 옮긴 slide. **처리** 원본의 look·motion·interaction을 그대로 옮기고, scroll로 움직이던 것은 slide 이동 때의 camera move로 바꾼다.[](source:s-port) | flow-diagram | port |
| s-check | check 실행 | **입력** 만든 composition · **실행** `npx hyperframes check --json` · **출력** 위반 목록. **처리** slideshow 규칙이 sceneId, hotspot target, fragment 위치, main-line slide 겹침을 검사한다.[](source:s-check) | flow-diagram | check |
| s-clean-q | check가 깨끗한가? | **입력** check 출력 · **출력** 통과 여부. **처리** 위반이 남으면 고친 뒤 다시 check하고, 깨끗하면 다음으로 간다.[](source:s-check) | flow-diagram | clean-q |
| s-present | present 실행 | **입력** check를 통과한 project 폴더 · **실행** `npx hyperframes present <project-dir>` · **출력** 출력된 URL. **처리** deck을 서빙하고, 에이전트가 URL과 "Click Present, or press P, to open the audience tab."를 사용자에게 건넨다.[](source:s-serve) | flow-diagram | present |
| s-index | root index.html 구성 | **입력** composition 파일 위치 · **출력** root `index.html`. **처리** `<hyperframes-slideshow>`가 `<hyperframes-player src="…">`를 감싸게 해서 열면 바로 deck이 되게 한다. component가 맡는 기능은 직접 만들지 않는다.[](source:s-index) | flow-diagram | index |
| s-harness | standalone harness | **입력** present 없이 bare player bundle로 여는 deck · **참조** `references/standalone-harness.md` · **출력** 우회책이 들어간 wrapper. **처리** island를 wrapper 안에 복제하는 등 우회책을 적용한다.[](source:h-island) **다음** present로 열면 이 단계는 필요 없다.[](source:s-harness) | flow-diagram | harness |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(`description`)과 `/slideshow` 이름 호출. 호출 제한 필드는 없다.[](source:fm) |
| 성격 | 영상 render 대신 deck을 만드는 composition 변형. 일반 composition이라 `/hyperframes` 계약이 적용된다.[](source:s-def) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `hyperframes` {#rel-r06} | **이 스킬** | 다음 안내 | 요청이 deck(발표)일 때 `/slideshow`를 안내한다. 이 스킬은 온디맨드 스킬이라 설치돼 있지 않을 수 있고, 사용자가 `skills update <name>`으로 설치한다.[](source:rel-hf)[](source:rel-life) |
| `hyperframes-cli` {#rel-r11} | **이 스킬** | 참고 | 명령표의 Show and ship 행에서 `present`를 `/slideshow`로 연결한다.[](source:rel-cli) |
| **이 스킬** 외 6개(`hyperframes-cli`, `hyperframes-registry`, `media-use`, `remotion-to-hyperframes`, `reverse-any-video`, `style-sampling`) {#rel-r13} | `hyperframes` | 참고 | 일곱 스킬이 모두 첫 줄에서 plugin 안이라면 plugin execution rules를 따르라고 한다. 조건은 plugin 안일 때뿐이다.[](source:s-plugin) |
| **이 스킬** {#rel-r16} | `hyperframes` | 참고 | slideshow는 일반 composition이고 `/hyperframes` 계약이 적용된다.[](source:s-def) |
| **이 스킬** {#rel-r18} | `hyperframes-registry` | 참고 | 이름 붙은 visual은 `catalog --query`로 검색하라고 권한다. 스킬 이름이 아니라 명령으로 지목한다.[](source:s-rules) |

@architecture id=relation-map title="slideshow와 이어지는 스킬"
| hf | hyperframes | backend |
| cli | hyperframes-cli | backend |
| reg | hyperframes-registry | backend |
| self | slideshow(이 스킬) | backend |
| hf > self | 다음 안내 |
| cli > self | 참고 |
| self > hf | 참고 |
| self > reg | 참고 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | slide 구성 규칙, 이식 규칙, check와 present 인계를 적은 본문 64줄 | 스킬이 켜질 때 읽는다 | 시작 신호, slide 구성, 기존 page를 옮기나?, page 이식, check 실행, check가 깨끗한가?, present 실행, root index.html 구성 |
| `references/standalone-harness.md` | present 없이 여는 deck의 우회책 1017줄: wrapper, island 복제, scenes 알림, SFX, Three.js, 함정 목록 | `SKILL.md`가 present 없이 열 때만 가리킨다[](source:s-harness) | standalone harness |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| deck을 MP4로 render하려 할 때 | 금지. `render`가 첫 scene만 남기고 조용히 자른다. 정지 화면은 slide마다 `snapshot --at`을 쓴다 | [](source:s-render) |
| `check --json`에 위반이 남았을 때 | 깨끗해질 때까지 `check`를 돌린다. 검사는 sceneId 해석, hotspot target 존재, fragment 위치, main-line slide 겹침이다 | [](source:s-check) |
| slide 구성 JSON 블록을 만들 때 | HTML에 직접 적는다. script로 생성하지 않는다. `present`가 파일을 정적으로 읽기 때문이다 | [](source:s-island) |
| fragment 시각을 정할 때 | 절대 timeline 시각(`data-start`과 같은 시계)으로 적고, slide의 `[start, end]` 안에 둔다 | [](source:s-island) |
| slide를 넘길 때 | seek만 하고 play하지 않는다. 각 hold 상태는 그 시각으로 바로 seek해도 맞아 보여야 한다 | [](source:s-island) |
| branch slide를 만들 때 | 일반 scene으로 만들되 `slideSequences`에만 넣고 main `slides`에는 넣지 않는다. Back은 hotspot을 가진 slide로 돌아온다 | [](source:s-island) |
| hotspot을 쓸 때 | `target`은 sequence `id`이고 `region`은 퍼센트 상자다. 생략하면 slide 전체 button이 된다 | [](source:s-island) |
| 청중이 읽을 글자를 넣을 때 | 1920×1080에서 최소 40 px로 쓴다 | [](source:s-rules) |
| 이름 붙은 visual을 만들 때 | 직접 만들기 전에 `catalog --query "<영어 이름>" --json`으로 검색한다. 설치 없이 registry 전체를 순위로 보여 준다 | [](source:s-rules) |
| `ttsScript`, `ttsAudioUrl`, `ttsDurationMs`를 쓸 때 | 예약 필드이고 아직 연결되지 않았다 | [](source:s-island) |
| page를 옮길 때 scroll·wheel·camera layer 움직임을 만났을 때 | page가 눈에 보이게 scroll하지 않고, 초점에서 초점으로 가는 camera move로 바꾼다. 원본에 없는 되돌림은 넣지 않는다 | [](source:s-port) |
| 옮긴 `<video>`·`<audio>`를 넣을 때 | `data-start`와 `data-duration`을 달고, 소리가 나면 `data-has-audio="true"`도 단다. `preload="none"`은 쓰지 않는다 | [](source:s-port) |
| 겹쳐 숨긴 slide를 만들 때 | `opacity: 0`, `visibility: hidden`, `pointer-events: none`을 함께 쓴다. 빠지면 보이지 않는 layer가 click을 삼킨다 | [](source:s-port) |
| root `index.html`을 만들 때 | Present, Prev/Next, counter, mute, fullscreen, swipe, hotspot, notes는 component가 맡는다. 직접 만들지 않는다 | [](source:s-index) |
| 화면 공유를 안내할 때 | Google Meet는 audience tab을 공유한다. Zoom은 audience tab을 별도 window로 끌어 공유한다. 완전히 가려진 window는 멈춘다 | [](source:s-share) |
| plugin 안에서 실행될 때 | plugin execution rules를 따른다. plugin 밖이면 해당 없다 | [](source:s-plugin) |
| `present` 없이 bare player bundle로 열 때 | 우회책이 필요하다. 그중 하나로 island를 `<hyperframes-slideshow>` 안에 복제하고 두 사본을 맞춘다 | [](source:h-frame)[](source:h-island) |
| 같은 방식으로 열 때 branch scene까지 | 모든 scene을 scenes 알림에 넣어야 한다. 하나라도 빠지면 component가 그 scene으로 seek하지 못한다 | [](source:h-manifest) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- slide 구성 JSON의 필드와 fragment·hotspot 규칙 — 맡을 개요 항목 "slide 구성" · 필드 표, fragment 시각 계산, branch와 Back 되돌림이 개요에 담기엔 많다
- 기존 page 이식 규칙 전체 — 맡을 개요 항목 "page 이식" · 다섯 규칙 중 media chrome과 이미지 crop 확인은 개요에 넣지 않았다
- check의 slideshow 규칙과 오류 읽는 법 — 맡을 개요 항목 "check 실행" · 원문이 네 가지 검사만 적어 오류 형식은 원문에 명시 없음
- standalone wrapper 구성 — 맡을 개요 항목 "standalone harness" · 부모 wrapper, `tabindex`, `interactive`, per-slide `autoplay`
- 가시성 controller와 진입 효과 — 맡을 개요 항목 "standalone harness" · root timeline, `updateVisibility`, fragment를 scene 시작 300~500 ms에 묶는 권고
- presenter media bridge와 audience unlock — 맡을 개요 항목 "standalone harness" · `BroadcastChannel`로 media 이벤트를 잇는 코드가 길다
- SFX와 mute 요령 — 맡을 개요 항목 "standalone harness" · `sound` 속성, `hf-sound` 이벤트, `media-use resolve --type sfx` 사용
- Three.js 배경 장면 — 맡을 개요 항목 "standalone harness" · 선택 사항이라 개요에서 뺐다
- 탐색 camera transition — 맡을 개요 항목 "page 이식" · scroll 기반 원본을 옮길 때만 쓰는 우회책
- 함정 목록 17행 — 맡을 개요 항목 "standalone harness" · 증상과 한 줄 수정 표

@callout level=open-question title="확인하지 못한 것"
| `../hyperframes/references/plugin-installation.md`와 `/hyperframes` 계약 본문은 폴더 밖이라 읽지 않았다. 이 스킬이 두 곳을 가리키는 것만 확인했다. |
| `present`, `check`, `events`의 내부 구현은 코드를 보지 못했다(내부 구현 미확인). 위반 형식과 telemetry 내용은 원문에 명시 없음. |
| `present`로 띄우는 일과 root `index.html`을 만드는 일 가운데 무엇이 먼저인지 원문에 명시 없음. |
| `standalone-harness.md` 15행의 "Living reference implementations:" 뒤에 목록이 비어 있다. 38~39행의 `packages/player/dist` 경로는 이 저장소에 없다. |

읽은 원본: 텍스트 파일 2개. 제외: 없음.
