# hyperframes는 영상 작업에서 무엇을 강제하고 어디로 보내나? {#hyperframes-page}

`hyperframes`는 HyperFrames(HTML을 영상으로 렌더하는 도구)로 영상을 만들거나 고칠 때 가장 먼저 읽는 **허브 스킬**이다. 에이전트는 렌더 계약 12조를 지키고, 정해진 작업 순서로 진행하며, 요청 종류에 맞는 reference나 하위 스킬로 넘어간다.[](source:s-front)[](source:s-check)[](source:s-read)

- 모든 타이밍 요소에 `class="clip"`, `data-start`, `data-duration`을 쓰고, composition마다 paused timeline 하나를 등록한다.[](source:s-c01)[](source:s-c03)
- 15초를 넘고 무언가를 전하는 영화는 type 파일, `story.md`, `SPEC.md`를 거친 뒤 만들고, `check`와 `snapshot --review`를 지나 `REVIEW.md`로 끝낸다.[](source:s-loop2)[](source:s-loop3)
- 렌더는 사용자가 preview를 승인하거나 파일을 요청하거나 무정지를 요청했을 때만 하고, 그 전에는 preview에서 멈춘다.[](source:s-loop4)
- 질문, 보류, 막연한 아이디어에는 파일을 고치지 않고 답이나 제안만 한다.[](source:s-build)

@answer scope="로컬 원본 분석 · 부분 분석(텍스트 74개 중 36개 전부, 38개는 구조·표본만) · 대상 스킬의 명령은 실행하지 않음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=f85af643f25876081562e9820cd87fb45a478480
@source s-front title="hyperframes/hyperframes/SKILL.md · 7481B · 허브 본문" path=hyperframes/hyperframes/SKILL.md lines=1:4
@source s-plugin title="hyperframes/hyperframes/SKILL.md · 7481B · 허브 본문" path=hyperframes/hyperframes/SKILL.md lines=6:6
@source s-beacon title="hyperframes/hyperframes/SKILL.md · 7481B · 허브 본문" path=hyperframes/hyperframes/SKILL.md lines=8:8
@source s-engine title="hyperframes/hyperframes/SKILL.md · 7481B · 허브 본문" path=hyperframes/hyperframes/SKILL.md lines=12:12
@source s-layout title="hyperframes/hyperframes/SKILL.md · 7481B · 허브 본문" path=hyperframes/hyperframes/SKILL.md lines=14:14
@source s-build title="hyperframes/hyperframes/SKILL.md · 7481B · 허브 본문" path=hyperframes/hyperframes/SKILL.md lines=16:16
@source s-check title="hyperframes/hyperframes/SKILL.md · 7481B · 허브 본문" path=hyperframes/hyperframes/SKILL.md lines=18:20
@source s-c01 title="hyperframes/hyperframes/SKILL.md · 7481B · 계약 1" path=hyperframes/hyperframes/SKILL.md lines=22:22
@source s-c02 title="hyperframes/hyperframes/SKILL.md · 7481B · 계약 2" path=hyperframes/hyperframes/SKILL.md lines=23:23
@source s-c03 title="hyperframes/hyperframes/SKILL.md · 7481B · 계약 3" path=hyperframes/hyperframes/SKILL.md lines=24:24
@source s-c04 title="hyperframes/hyperframes/SKILL.md · 7481B · 계약 4" path=hyperframes/hyperframes/SKILL.md lines=25:25
@source s-c05 title="hyperframes/hyperframes/SKILL.md · 7481B · 계약 5" path=hyperframes/hyperframes/SKILL.md lines=26:26
@source s-c06 title="hyperframes/hyperframes/SKILL.md · 7481B · 계약 6" path=hyperframes/hyperframes/SKILL.md lines=27:27
@source s-c07 title="hyperframes/hyperframes/SKILL.md · 7481B · 계약 7" path=hyperframes/hyperframes/SKILL.md lines=28:28
@source s-c08 title="hyperframes/hyperframes/SKILL.md · 7481B · 계약 8" path=hyperframes/hyperframes/SKILL.md lines=29:29
@source s-c09 title="hyperframes/hyperframes/SKILL.md · 7481B · 계약 9" path=hyperframes/hyperframes/SKILL.md lines=30:30
@source s-c10 title="hyperframes/hyperframes/SKILL.md · 7481B · 계약 10" path=hyperframes/hyperframes/SKILL.md lines=31:31
@source s-c11 title="hyperframes/hyperframes/SKILL.md · 7481B · 계약 11" path=hyperframes/hyperframes/SKILL.md lines=32:32
@source s-c12 title="hyperframes/hyperframes/SKILL.md · 7481B · 계약 12" path=hyperframes/hyperframes/SKILL.md lines=33:33
@source s-edit title="hyperframes/hyperframes/SKILL.md · 7481B · Keep it editable" path=hyperframes/hyperframes/SKILL.md lines=35:43
@source s-loop1 title="hyperframes/hyperframes/SKILL.md · 7481B · Work loop" path=hyperframes/hyperframes/SKILL.md lines=47:47
@source s-loop2 title="hyperframes/hyperframes/SKILL.md · 7481B · Work loop" path=hyperframes/hyperframes/SKILL.md lines=48:48
@source s-loop3 title="hyperframes/hyperframes/SKILL.md · 7481B · Work loop" path=hyperframes/hyperframes/SKILL.md lines=49:49
@source s-loop4 title="hyperframes/hyperframes/SKILL.md · 7481B · Work loop" path=hyperframes/hyperframes/SKILL.md lines=50:50
@source s-app title="hyperframes/hyperframes/SKILL.md · 7481B · 데스크톱 앱 규칙" path=hyperframes/hyperframes/SKILL.md lines=52:58
@source s-read title="hyperframes/hyperframes/SKILL.md · 7481B · What to read 안내표" path=hyperframes/hyperframes/SKILL.md lines=60:79
@source s-tail title="hyperframes/hyperframes/SKILL.md · 7481B · What to read 안내표" path=hyperframes/hyperframes/SKILL.md lines=79:79
@source r-story title="hyperframes/hyperframes/references/story.md · 11486B · 스토리 계획" path=hyperframes/hyperframes/references/story.md
@source r-story-pick title="hyperframes/hyperframes/references/story.md · 11486B · 스토리 계획" path=hyperframes/hyperframes/references/story.md lines=25:31
@source r-spec title="hyperframes/hyperframes/references/spec.md · 6055B · SPEC.md 작성" path=hyperframes/hyperframes/references/spec.md
@source r-review title="hyperframes/hyperframes/references/review.md · 5327B · 검토 절차" path=hyperframes/hyperframes/references/review.md
@source r-look title="hyperframes/hyperframes/references/look.md · 6031B · 룩 정하기" path=hyperframes/hyperframes/references/look.md
@source r-film title="hyperframes/hyperframes/references/film.md · 7236B · source에서 만드는 영화의 측정값" path=hyperframes/hyperframes/references/film.md
@source r-format title="hyperframes/hyperframes/references/format.md · 13196B · composition 형식" path=hyperframes/hyperframes/references/format.md
@source r-motion title="hyperframes/hyperframes/references/motion.md · 12496B · 모션" path=hyperframes/hyperframes/references/motion.md
@source r-runtimes title="hyperframes/hyperframes/references/runtimes.md · 4188B · 애니메이션 runtime" path=hyperframes/hyperframes/references/runtimes.md
@source r-captions title="hyperframes/hyperframes/references/captions.md · 4985B · caption" path=hyperframes/hyperframes/references/captions.md
@source r-overlays title="hyperframes/hyperframes/references/overlays.md · 2592B · 말하는 사람 위의 카드" path=hyperframes/hyperframes/references/overlays.md
@source r-sound title="hyperframes/hyperframes/references/sound.md · 3599B · 소리" path=hyperframes/hyperframes/references/sound.md
@source r-sb title="hyperframes/hyperframes/references/storyboard.md · 4456B · storyboard 만드는 법" path=hyperframes/hyperframes/references/storyboard.md
@source r-sbf title="hyperframes/hyperframes/references/storyboard-format.md · 6696B · STORYBOARD.md 형식" path=hyperframes/hyperframes/references/storyboard-format.md
@source r-3d title="hyperframes/hyperframes/references/types/3d.md · 1805B · 3D type" path=hyperframes/hyperframes/references/types/3d.md
@source r-char title="hyperframes/hyperframes/references/types/character.md · 1635B · 캐릭터 type" path=hyperframes/hyperframes/references/types/character.md
@source r-data title="hyperframes/hyperframes/references/types/data.md · 1322B · 데이터 type" path=hyperframes/hyperframes/references/types/data.md
@source r-expl title="hyperframes/hyperframes/references/types/explainer.md · 3045B · explainer type" path=hyperframes/hyperframes/references/types/explainer.md
@source r-launch title="hyperframes/hyperframes/references/types/launch.md · 4738B · launch type" path=hyperframes/hyperframes/references/types/launch.md
@source r-music title="hyperframes/hyperframes/references/types/music.md · 1606B · 뮤직비디오 type" path=hyperframes/hyperframes/references/types/music.md
@source r-vert title="hyperframes/hyperframes/references/types/vertical.md · 1646B · 세로 영상 type" path=hyperframes/hyperframes/references/types/vertical.md
@source r-life title="hyperframes/hyperframes/references/skill-lifecycle.md · 4926B · 스킬 설치와 최신 상태" path=hyperframes/hyperframes/references/skill-lifecycle.md
@source r-plug title="hyperframes/hyperframes/references/plugin-installation.md · 2871B · plugin 설치 실행 규칙" path=hyperframes/hyperframes/references/plugin-installation.md
@source r-path title="hyperframes/hyperframes/references/path-tracing.md · 5762B · path tracing 3D" path=hyperframes/hyperframes/references/path-tracing.md
@source x-plugin title="hyperframes/hyperframes/scripts/plugin-cli.mjs · 3874B · plugin용 CLI launcher" path=hyperframes/hyperframes/scripts/plugin-cli.mjs
@source x-bake title="hyperframes/hyperframes/scripts/bake-basemap.mjs · 18197B · 지도 영상 bake script" path=hyperframes/hyperframes/scripts/bake-basemap.mjs lines=1:41
@source x-locate title="hyperframes/hyperframes/scripts/locate.mjs · 8273B · 이미지 속 위치 찾기" path=hyperframes/hyperframes/scripts/locate.mjs lines=1:22
@source x-locate-auto title="hyperframes/hyperframes/scripts/locate.mjs · 8273B · 이미지 속 위치 찾기" path=hyperframes/hyperframes/scripts/locate.mjs lines=191:225
@source f-bien title="hyperframes/hyperframes/assets/frame-presets/biennale-yellow/FRAME.md · 17789B · preset 명세(전부 읽음)" path=hyperframes/hyperframes/assets/frame-presets/biennale-yellow/FRAME.md
@source f-cap title="hyperframes/hyperframes/assets/frame-presets/biennale-yellow/caption-skin.html · 8131B · caption 스킨 예시(전부 읽음)" path=hyperframes/hyperframes/assets/frame-presets/biennale-yellow/caption-skin.html lines=1:27
@source skill-ko title="hyperframes/hyperframes/SKILL.KO.md · 9785B · 한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes/SKILL.KO.md

## 이 스킬은 언제 켜지고 무엇을 하지 않나? {#activation}

`description`은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어가 있어야 켜진다는 뜻이 아니다. `disable-model-invocation` 같은 호출 제한 필드는 원문에 명시 없음.[](source:s-front)

@code source=s-front language=yaml

`description`은 "HyperFrames로 영상을 만들거나 고치거나 애니메이션을 넣거나 렌더할 때 먼저 읽으라"고 적는다.[](source:s-front) 본문은 다른 framework나 일반 브라우저 녹화를 요청받지 않았다면 HyperFrames를 쓰라고 한다.[](source:s-engine)

| 요청의 모양 | 에이전트가 하는 일 |
| --- | --- |
| 영상을 만들거나 고치거나 렌더하라는 요청 | 계약 12조를 지키며 작업 순서(아래 패널)를 따른다.[](source:s-engine)[](source:s-check) |
| 질문, 보류, 막연한 아이디어 | 편집하지 않는다. 답이나 제안만 한다.[](source:s-build) |
| 다른 framework나 일반 브라우저 녹화를 요청 | 이 스킬을 쓰지 않는다.[](source:s-engine) |
| Remotion source, deck(발표), Figma | 각각 `/remotion-to-hyperframes`, `/slideshow`, `/figma`로 보낸다.[](source:s-tail) |

설명용 예시: "이 아이디어 어떻게 생각해?"는 답이나 제안만 하는 쪽이고, "이 제목을 3초 늦춰 줘"는 편집하는 쪽이다. 어느 쪽으로 읽을지는 판정이며, 원문이 이 예시들을 직접 분류하지는 않는다.

시작할 때 지키는 기본값은 다음과 같다.

- 요청이나 source가 요구하지 않으면 voiceover, caption, 새 aspect ratio를 넣지 않는다.[](source:s-build)
- 15초 넘게 무언가를 전하는 영화는 사용자가 무음을 원하지 않는 한 음악과 보이는 동작에 맞는 효과음을 넣는다.[](source:s-build)
- 제품 화면, 브랜드 logo, 실제 장소 이미지처럼 실물이 있는 것은 source에서 가져와 보여 주고, 실물이 없는 것만 그린다.[](source:s-build)
- 이름 붙은 효과, 전환, caption 스타일, 차트, 카드는 손으로 쓰기 전에 registry(`/hyperframes-registry`)를 검색한다. 모든 media(발표자, avatar, footage, voice, music)는 `/media-use`가 맡는다.[](source:s-build)

@facts id=numbers
| 새 영상 규격 | 1920×1080, 30 fps. 원문은 새 영상의 기본으로 서술한다. 요청이나 source가 요구하면 바뀐다.[](source:s-build) |
| 영화로 다루는 길이 | 약 15 s 초과. 음악·효과음 기본값과 type 파일, `story.md`, `SPEC.md` 순서의 기준이다.[](source:s-build)[](source:s-loop2) |
| 시간 단위 | `data-start`와 `data-duration`은 초 단위. 요소는 `[start, start + duration)` 동안 보인다.[](source:s-c01) |
| 영상 길이 | root의 `data-duration`이 정한다. 넘치면 잘리고, 일찍 끝나면 마지막 frame을 유지한다.[](source:s-c02) |
| 안전 영역 | 내용은 90% action-safe 안, caption과 핵심 글자는 80% title-safe 안에 둔다. 가이드는 Studio가 그리므로 직접 추가하지 않는다.[](source:s-edit) |
| storyline 수 | 3개를 글로만 쓰고 하나를 고른다. 사용자가 있으면 사용자가 고른다.[](source:s-loop2) |

@callout level=warning title="스킬이 시작할 때 실행하라는 명령"
| 원문은 스킬이 시작될 때 `npx hyperframes events --skill=hyperframes`를 한 번 실행하라고 지시한다. 스킬 이름이 CLI의 평소 telemetry와 함께 전송되고, 로그인 상태면 계정에 연결되며, opt-out을 따른다고 적혀 있다.[](source:s-beacon) 새 영상을 시작할 때는 `npx hyperframes usage --json`으로 남은 사용량을 확인하고, 알 수 없으면 "unknown"이라고 말한다.[](source:s-engine) 이 분석에서는 두 명령 모두 실행하지 않았다. |

환경에 따라 달라지는 규칙도 있다. HyperFrames plugin 안에서 실행하면 `references/plugin-installation.md`를 따르라고 한다.[](source:s-plugin) 그 문서는 `npx hyperframes`를 `scripts/plugin-cli.mjs` launcher 호출로 바꾸고, `hyperframes skills update`, `skills check`, `npx skills add`를 돌리지 말라고 한다.[](source:r-plug)

## 계약 12조와 편집 가능성 규칙은 무엇인가? {#contract}

`npx hyperframes check --json`은 위반 대부분을 `Fix:` 줄과 함께 보고한다.[](source:s-check) 아래 번호는 원문 번호다.

| 번호 | 규칙 | 보강(다른 reference) |
| --- | --- | --- |
| 1 | 시간이 있는 모든 요소에 `class="clip"`, 초 단위 `data-start`, `data-duration`을 쓴다. 끝 상태는 끝나기 직전에 도착시킨다. `data-track-index`는 Studio lane일 뿐이고 겹침 순서는 `z-index`가 정한다.[](source:s-c01) | 끝 상태가 정확히 끝 시각에 닿으면 렌더되지 않는다.[](source:r-format) |
| 2 | 영상 길이는 root의 `data-duration`이다. 넘치면 잘리고 일찍 끝나면 마지막 frame을 유지한다.[](source:s-c02) | 새 clip을 넣으면 root `data-duration`을 늘려야 한다.[](source:r-format) |
| 3 | composition마다 paused timeline 하나를 만들고 tween 뒤에 `window.__timelines["<data-composition-id>"] = tl`로 등록한다.[](source:s-c03) | 비동기로 만들면 콜백 끝에서 등록한다. 먼저 등록하면 빈 화면이 된다.[](source:r-runtimes) |
| 4 | `Date.now()`, seed 없는 `Math.random()`, network fetch, timer, `repeat: -1`을 쓰지 않는다. 보이는 모든 것은 timeline 시간의 함수다.[](source:s-c04) | 반복은 유한 횟수로 쓰고 난수는 mulberry32 같은 PRNG로 seed한다.[](source:r-runtimes) |
| 5 | `.clip`의 `display`, `visibility`, `autoAlpha`를 tween하지 않는다. 자식을 애니메이션한다.[](source:s-c05) | lint 규칙 `gsap_animates_clip_element`.[](source:r-format) |
| 6 | GSAP이 transform하는 요소에 CSS `transform`을 두지 않는다. `left`, `top`, `width`, `height` 대신 transform을 애니메이션한다.[](source:s-c06) | 시작 상태는 `fromTo` 안에서 정한다.[](source:r-format) |
| 7 | media를 `play()`, `pause()`, seek하지 않는다. 소리가 있는 `<video>`는 `data-has-audio="true"`, 아니면 `muted`다. 음악, voice, 대체 소리, J/L cut은 별도 `<audio>`다.[](source:s-c07) | 소리 있는 timed `<video>`에 둘 다 없으면 lint가 실패한다.[](source:r-format) |
| 8 | 모든 `<audio>`에 `id`를 준다. 없으면 mix에서 빠진다. media에 `crossorigin`을 쓰지 않는다. 시간은 `<video>`에 주고 wrapper에 주지 않는다.[](source:s-c08) | lint 규칙 `media_missing_id`, `video_nested_in_timed_element`.[](source:r-format) |
| 9 | 번들 폰트만 이름으로 해석된다. 다른 family는 `assets/fonts/`의 파일을 가리키는 `@font-face`가 필요하다.[](source:s-c09) | 번들은 18개 family이고 Latin 위주다.[](source:r-format) |
| 10 | asset 경로는 `assets/...`이고 앞에 `/`를 붙이지 않는다. sub-composition 안에서도 같다.[](source:s-c10) | 원문에 명시 없음 |
| 11 | footage의 grade, grain, blur, vignette는 `npx hyperframes media-treatment`(`/media-use`)로 하고 CSS filter를 쓰지 않는다.[](source:s-c11) | 원문에 명시 없음 |
| 12 | scene 파일은 style, markup, script를 `<template>` 안에 두고 root를 `#root`로 스타일한다. 의도한 overflow나 overlap은 `data-layout-allow-overflow`, `data-layout-allow-overlap`으로 표시한다.[](source:s-c12) | 가장 좁은 opt-out을 쓴다. `overflow: hidden`은 검사 결과를 숨기지 못한다.[](source:r-format) |

판정 · 계약 대부분은 "렌더가 프레임마다 timeline을 seek하므로 결과가 항상 같아야 한다"는 한 전제에서 나온다. 원문 첫 문단이 이 전제를 적고, 4번과 3번이 그 구체 규칙이다.[](source:s-engine)[](source:s-c03)[](source:s-c04)

Keep it editable 규칙은 사용자가 Studio에서 같은 파일을 편집할 수 있게 하는 다섯 가지다.[](source:s-edit)

- scene은 sub-composition 하나에 하나씩 두고 id는 짧고 읽기 쉽게 쓴다. root에는 scene host, media, audio만 둔다.
- 타이밍이 있는 요소는 script로 만들지 않고 HTML에 쓰며, 요소마다 안정적인 `id`를 준다.
- 문구, 브랜드 색, 바꿀 수 있는 media는 변수(`data-var-text`, `data-var-src`, `var(--id)`)로 둔다.
- track 하나에는 한 종류만 둔다. scene과 overlay host에는 `data-track-kind="graphics"`, 모든 caption group을 담는 host 하나에는 `captions`를 쓴다.
- 내용은 90% action-safe 안, caption과 핵심 글자는 80% title-safe 안에 둔다. 가이드는 Studio가 그린다.

## 작업은 어떤 순서로 진행하고 사람은 어디서 개입하나? {#loop}

@workflow id=work-loop title="작업 루프"
| lane intake | 요청 판단 |
| lane plan | 계획 (15초 넘는 영화) |
| lane build | 제작과 확인 |
| lane deliver | 전달 |
| ask | 편집 요청? | backend | intake | source:s-build |
| answer | 답·제안만 | external | intake | source:s-build |
| read | 기존이면 읽기 | backend | intake | source:s-loop1 |
| long | 15초 넘는 영화? | backend | intake | source:s-loop2 |
| type | type 파일 | backend | plan | source:s-read |
| story | story.md 3안 | backend | plan | source:r-story-pick |
| pick | 사용자가 고름 | external | plan | source:r-story-pick |
| spec | SPEC.md | backend | plan | source:r-spec |
| build | 씬 작성·수정 | backend | build | source:s-edit |
| check | check --json | backend | build | source:s-loop3 |
| review | snapshot --review | backend | build | source:r-review |
| gate | 렌더 조건 충족? | backend | deliver | source:s-loop4 |
| render | render | backend | deliver | source:s-loop4 |
| hold | preview에서 대기 | external | deliver | source:s-loop4 |
| ask > answer | 아니오 | |
| ask > read | 예 | |
| read > long | | |
| long > type | 예 | emphasis |
| type > story | | |
| story > pick | | |
| pick > spec | | |
| spec > build | | |
| build > check | | |
| check > build | 오류 | dashed |
| check > review | 영화 | |
| check > gate | 작은 수정 | |
| review > gate | REVIEW.md | |
| gate > render | 예 | emphasis |
| gate > hold | 아니오 | |

@steps id=loop-steps
| s-ask | 편집 요청? | 변경을 요구하는 요청이면 진행한다. 질문, 보류, 막연한 아이디어는 답이나 제안으로 끝낸다.[](source:s-build) | work-loop | ask |
| s-answer | 답·제안만 | 파일을 고치지 않는다.[](source:s-build) | work-loop | answer |
| s-read | 기존이면 읽기 | 기존 프로젝트는 `npx hyperframes timeline --json`으로 무엇이 언제 재생되는지 보고, 바꾸기 전에 `history --since mine --who <you>`로 사용자가 마지막 턴 이후 바꾼 것을 읽는다. 그 위에 만든다.[](source:s-loop1) | work-loop | read |
| s-long | 15초 넘는 영화? | 무언가를 전하는 새 영화가 약 15 s를 넘으면 계획 단계로 간다. 아니면 바로 만든다.[](source:s-loop2) | work-loop | long |
| s-type | type 파일 | 요청 종류에 맞는 `references/types/*.md`를 먼저 읽는다. 어느 파일인지는 안내표(아래 패널)가 정한다.[](source:s-loop2) | work-loop | type |
| s-story | story.md 3안 | 서로 다른 영화 세 편을 말로만 쓴다. 추천을 첫 번째에 이유 한 절과 함께 쓰고 `STORYLINES.md`로 저장한다.[](source:r-story-pick) | work-loop | story |
| s-pick | 사용자가 고름 | 사용자가 있으면 세 안을 보여 주고 한 번 멈춘다. 파일을 요청했거나 무정지를 요청했다면 추천안을 만들고 나머지 둘을 한 줄씩 알린다.[](source:r-story-pick) | work-loop | pick |
| s-spec | SPEC.md | 모든 형용사를 숫자로 바꾸고, 기본값을 이름으로 금지하고, shot을 frame 단위로 적는다.[](source:s-loop2)[](source:r-spec) | work-loop | spec |
| s-build | 씬 작성·수정 | 계약 12조와 Keep it editable 규칙을 지키며 만든다.[](source:s-check)[](source:s-edit) | work-loop | build |
| s-check | check --json | 마지막 편집 뒤에 실행한다. 오류는 모두 고치고 경고는 하나씩 따져 본다.[](source:s-loop3) | work-loop | check |
| s-review | snapshot --review | 영화는 `npx hyperframes snapshot --review`를 돌리고 `references/review.md`대로 검토해 `REVIEW.md`로 끝낸다. 작은 수정은 바꾼 부분을 `--at`, `--range`, `--composition`으로 snapshot해 답하기 전에 눈으로 본다.[](source:s-loop3) | work-loop | review |
| s-gate | 렌더 조건 충족? | `check`와 검토를 통과했고, 사용자가 Studio preview를 승인했거나 파일을 요청했거나 무정지를 요청했는지 본다.[](source:s-loop4) | work-loop | gate |
| s-render | render | 조건이 맞을 때만 렌더한다.[](source:s-loop4) | work-loop | render |
| s-hold | preview에서 대기 | 조건이 없으면 preview에서 멈추고 기다린다.[](source:s-loop4) | work-loop | hold |

그림에서 `15초 넘는 영화?`가 아니오일 때 `씬 작성·수정`으로 바로 가는 경로는 선이 겹쳐 뺐다. 이 경로는 위 단계 표의 해당 행에 적었다.

사람이 개입하는 지점은 다섯 곳이다.

| 지점 | 내용 |
| --- | --- |
| storyline 선택 | 사용자가 있으면 세 안을 보여 주고 한 번 멈춘다. 섞은 안("A의 시작과 C의 중간")은 하나의 storyline으로 센다. 그 밖의 질문은 사용자만 답할 수 있을 때만 한다.[](source:r-story-pick) |
| 가정 한 줄 | 길이(범위), aspect, 음악·voice 여부, 유료 항목(HeyGen voice, avatar, 카탈로그 음악)을 무료 대안과 함께 한 줄로 밝힌다.[](source:r-story-pick) |
| preview 승인 | 렌더는 사용자가 preview를 승인하거나 파일을 요청하거나 무정지를 요청한 뒤에만 한다.[](source:s-loop4) |
| storyboard 승인 | storyboard를 쓰는 경우 사용자가 보드를 보고 go를 말하기 전에는 애니메이션하지 않는다.[](source:r-sb) |
| 스킬 설치·갱신 | 설치, 갱신, 제거는 사용자의 몫이다. 에이전트는 낡은 것과 맞는 명령을 알려 주기만 한다.[](source:r-life) |

데스크톱 앱 호칭 규칙은 다음과 같다. 원문은 "the HyperFrames desktop app"이라고 부르고 "Studio"라고 부르지 말라고 한다. 앱은 계속 편집하는 더 나은 길로 권하되 유일한 길로 말하지 않는다.[](source:s-app)

- 새 영상의 delivery render 전에는 무정지 모드에서도 preview를 열고 거기서 편집할 수 있다고 말한다. `preview`가 "Keep editing by chatting with Framey"를 출력했다면 **Edit with Framey** 버튼이 앱을 연다고 덧붙인다.[](source:s-app)
- delivery render 뒤에는 그 출력의 Framey 줄을 자기 말로 전한다. 출력이 이름을 준 `hyperframes open`을 대신 실행해 주겠다고 하거나 다운로드 링크를 준다. 줄이 없으면 아무 말도 하지 않는다.[](source:s-app)
- 어떤 명령이 `catch-up`을 실행하라고 하면 다음 변경 전에 `npx hyperframes catch-up [dir]`을 돌린다. 그 출력이 나열하는 것은 사용자의 작업이지 새 요청이 아니다.[](source:s-app)

@callout level=open-question title="원문 안의 호칭 충돌"
| 54번째 줄은 "Studio"라고 부르지 말라고 하지만, 같은 SKILL.md가 12, 37, 50, 56번째 줄에서 "the Studio preview", "Studio edits the tags you write"처럼 Studio를 쓴다.[](source:s-app)[](source:s-edit)[](source:s-loop4) 규칙이 사용자에게 하는 말에만 적용되는지, 문서 전체에 적용되는지 원문에 명시 없음. 이 페이지는 원문 표기를 그대로 옮겼다. |

## 요청은 어디로 가고, 이 스킬은 흐름의 어디에 있나? {#routing}

안내표(What to read)는 요청 종류마다 읽을 곳 하나를 정한다. 스킬로 넘기는 행은 강제가 아니라 안내표의 한 행이다.[](source:s-read)

| 요청 | 읽을 곳 | 원장 |
| --- | --- | --- |
| 복사하거나 다시 만들 영상 | `/reverse-any-video` | R04 · 넘김 |
| 검증된 스타일의 에피소드 | `/style-sampling` | R05 · 넘김 |
| 다른 영화의 스타일을 새 주제에 | `references/look.md` | - |
| launch, promo, feature | `references/types/launch.md` | - |
| explainer, tutorial | `references/types/explainer.md` | - |
| 뮤직비디오 | `references/types/music.md` | - |
| 차트, 숫자 | `references/types/data.md` | - |
| 세로 영상, social clip | `references/types/vertical.md` | - |
| 3D, simulation, generative | `references/types/3d.md` | - |
| 캐릭터, mascot, 이야기 단편 | `references/types/character.md` | - |
| 실제 장소나 지도, 웹사이트·PR·script, kinetic type | `references/film.md` | - |
| caption, 말하는 사람 위의 카드 | `references/captions.md`, `references/overlays.md` | - |
| 모션(ease, 제목, cut, punch-in, 속도, hold) | `references/motion.md` | - |
| scene, attribute, media, lint, GSAP·Lottie·3D·canvas | `references/format.md`, `references/runtimes.md` | - |
| deck(발표) | `/slideshow` | R06 · 넘김 |
| Remotion source | `/remotion-to-hyperframes` | R07 · 넘김 |
| Figma | `/figma` | R08 · 참고 · 범위 밖 |
| 스킬과 고정된 CLI | `references/skill-lifecycle.md` | - |

`references/` 파일이 각각 정하는 것은 다음과 같다. 수치는 원문이 서술한 기본값이나 측정값이고, 요청이나 brand가 다르면 따르라고 한 곳은 표에 적었다.

| 파일 | 정하는 것 |
| --- | --- |
| `story.md` | 15초 넘게 전하는 영화(launch, explainer, PR·changelog, recap, 서사 있는 뮤직비디오) 전에 읽는다. 편집, footage 위 caption·overlay, 한 아이디어짜리 짧은 작품에는 건너뛰고, 사용자의 script·storyboard·reference film이 있으면 그것을 따른다. 핵심 하나와 서로 다른 storyline 3개, 처음 2초를 정한다. frame 0은 검정이나 logo만으로 두지 않는다. beat 비율(launch 약 35 s 기준 Hook 약 8%, Tension 약 12%, Reveal 약 8%, Proof 약 40%, Payoff 약 20%, Claim 약 8%, End card 약 8%)도 정한다. 제목은 한 줄 6단어 이하(explainer는 약 10단어)이고, 한 줄은 단어당 약 0.3 s + 0.5 s 동안 보이며 마지막 줄은 2 s 이상 보인다.[](source:r-story) |
| `spec.md` | `SPEC.md` 틀(GOAL, OUTPUT, TIME, LOOK, OBJECTS, MOTION, SHOTS, BANNED, QA)과 형용사를 숫자로 바꾸는 표를 준다. 주인공은 frame 높이나 너비의 40% 이상, shot마다 주 동작 하나, 부 동작은 주 동작의 50~70% 거리로 100~200 ms 뒤에 시작, 2~4 s마다 새 요소, 읽을 글자는 1080에서 28 px 이상(짧은 변의 2.6%). 기본값 금지 목록(어두운 배경 위 작은 요소, glow, 보라·파랑 gradient, 크림색 종이와 serif 조합, 카드 3장, 모서리에 붙은 logo 등)을 둔다.[](source:r-spec) |
| `review.md` | `check`가 재는 경고(`line_unread`, 3 s 넘는 `dead_stretch`, 짧은 변의 2.6% 미만 `text_below_floor`, `first_frame_empty`, 15 s 넘는 영화의 `film_silent`)와 `snapshot --review` 세 장(360 px 폭 포함)을 본다. 문제는 P0, P1, P2로 매기고 점수는 매기지 않는다. 결과는 `REVIEW.md`에 적고 다음 턴이 먼저 읽는다.[](source:r-review) |
| `look.md` | 룩을 정하는 입력의 순서(project 디자인 spec, 실제 brand, 사용자가 준 reference, 주제의 세계)와 preset 13종 표, LOOK 줄, 영상 사실(어두운 바탕의 전체 화면 linear gradient는 H.264에서 띠가 생긴다, 5% 투명 accent는 압축에서 사라지니 분위기용은 15~25%)을 정한다.[](source:r-look) |
| `film.md` | source에서 만드는 영화의 측정값. TTS는 초당 약 2.2단어, scene당 약 19단어(9 s), 2개 scene까지 26단어(12 s), 전체 약 400단어 이하. 웹사이트 capture, PR(길이는 변경량에 따른 상한), 음악(15~30 s loop를 0.4 s fade-in, 1.5 s fade-out), 실제 지도(`bake-basemap.mjs`)와 `locate.mjs`를 다룬다.[](source:r-film) |
| `format.md` | 계약 뒤의 세부. project 구조, 속성 표, 변수, 번들 폰트, 시간 규칙, media 추가, linked clip, layout 검사 opt-out, 처음 만나는 lint 오류를 정한다.[](source:r-format) |
| `motion.md` | 빠른 이동 0.3~0.6 s, ease는 역할별로 다르게, spring은 damping ratio로 이름 붙이기, 제목은 한번 도착하면 정지, 전환 9종, 요청별 mechanism 표, `keyframes`·`snapshot`·`<name>.motion.json` assertion, 흔한 결함을 정한다.[](source:r-motion) |
| `runtimes.md` | GSAP에서 자주 틀리는 점, 다른 runtime(CSS keyframes, WAAPI, Lottie, anime.js, Three.js 등) 구동법, dotLottie 설정, `hf-seek` seek 규약(`requestAnimationFrame`이나 timer를 시계로 쓰지 않는다)을 정한다.[](source:r-runtimes) |
| `captions.md` | `transcribe`(기본 `small.en`은 영어가 아닌 말을 영어로 번역한다), caption group 크기(2~3, 3~5, 4~6단어), 매 group 끝의 hard kill, 크기 맞춤과 위치(가로 영상은 아래에서 80~120 px), 말하는 사람 뒤 글자를 정한다.[](source:r-captions) |
| `overlays.md` | 말하는 사람 위의 카드, lower third, split, PiP의 위치 좌표(1920×1080, 1080×1920), 카드 fade 0.4 s와 0.35 s, 카드 밀도를 정한다.[](source:r-overlays) |
| `sound.md` | 15초 넘는 영화의 음악·효과음 기본값, 시계 정하기(voice가 시계인지 음악이 시계인지), 효과음 5종과 쓸 때, 음량(voice 아래 음악 약 0.14, true peak −1 dBTP 이하, 소셜은 −16~−14 LUFS)을 정한다.[](source:r-sound) |
| `storyboard.md` | 사용자가 승인하는 still 단위 storyboard를 만드는 순서와 `boards/storyboard.html` 형식을 정한다.[](source:r-sb) |
| `storyboard-format.md` | `STORYBOARD.md`의 frontmatter와 frame별 key(`status`는 `outline`, `built`, `animated`), 필수로 들고 다니는 `reads`와 `sound`를 정한다.[](source:r-sbf) |
| `types/launch.md` | launch·promo·feature 영화(보통 20~45 s). 실제 UI만 쓰고 mockup은 쓰지 않는다. 끝 카드는 마지막 5~10%에 둔다.[](source:r-launch) |
| `types/explainer.md` | 한 가지 생각을 구체 예시 하나로 끝까지 푼다(보통 30~90 s). 먼저 사용자가 아는 상황에서 시작한다.[](source:r-expl) |
| `types/music.md` | 노래가 구조다. 구간(section)을 찾아 장(chapter)으로 삼고, 가사마다 장면(약 1.4~4 s)을 준다.[](source:r-music) |
| `types/data.md` | 한 번에 숫자 하나. 실제 데이터만, 출처 줄을 화면에 둔다.[](source:r-data) |
| `types/vertical.md` | 1080×1920 세로 영상. 위 168 px는 비우고 글자는 168~1330 px 띠 안에 둔다.[](source:r-vert) |
| `types/3d.md` | frame을 `hf-seek` 안에서 시간으로 그리는 3D. 한 주인공, 한 번의 dive.[](source:r-3d) |
| `types/character.md` | 캐릭터 연기(anticipation, squash, 후속 동작)와 rig를 정한다. 제목·UI의 "숨쉬기 금지"가 캐릭터에는 적용되지 않는다.[](source:r-char) |
| `skill-lifecycle.md` | 스킬은 CLI와 같은 버전으로 관리된다. 핵심 6개와 필요할 때 설치하는 3개(`/figma`, `/slideshow`, `/remotion-to-hyperframes`), `init`에는 `--skip-skills`를 붙인다. 설치와 갱신은 사용자가 한다. project에 고정된 CLI 버전은 읽기 전용 probe로 확인하고, 뒤처졌으면 올린 뒤 `check`로 검증하고 버전을 요약에 적는다.[](source:r-life) |
| `plugin-installation.md` | plugin 안에서 실행할 때의 규칙. launcher로 CLI를 호출하고, 스킬 갱신 명령을 쓰지 않고, plugin 디렉터리는 읽기 전용으로 둔다.[](source:r-plug) |
| `path-tracing.md` | 미리보기는 raster, 최종 export만 path tracing. 같은 8 s 720p 클립이 raster 10.8 s, path tracing 810.5 s(Apple M4 Max, 32 samples, 6 bounces에서 측정, 약 75배). example 기본값은 64 samples, 4 bounces다.[](source:r-path) |

판정 · `look.md`는 preset 13종을 슬라이드 deck용 룩이라고 하고, 사용자가 이름으로 요청했거나 deck일 때만 쓰라고 한다. 브랜드 없는 영화의 대체값으로 쓰지 않는다.[](source:r-look) `spec.md`가 크림색 종이와 serif 조합을 기본 금지 목록에 두므로, 같은 조합의 preset을 기본값으로 쓰면 이 금지와 충돌한다.[](source:r-spec)[](source:f-bien)

**흐름 속 위치** 이 스킬은 원장 기준 묶음 두 곳의 허브다. `build-video`에서는 계약과 작업 순서를 갖고 CLI, registry, media-use로 보낸다. `start-from-reference`에서는 요청을 reverse-any-video, style-sampling, remotion-to-hyperframes로 나눈다. 전체 흐름은 색인 기준 `_group-build-video/build-video.html`과 `_group-start-from-reference/start-from-reference.html`에 있다.

@workflow id=hub-position title="허브가 보내는 곳(원장 관계 중 넘김·참고)"
| req | 사용자 요청 | external | source:s-read |
| hub | hyperframes | backend | source:s-read |
| cli | hyperframes-cli | backend | source:s-engine |
| reg | hyperframes-registry | backend | source:s-build |
| media | media-use | backend | source:s-build |
| rev | reverse-any-video | backend | source:s-read |
| samp | style-sampling | backend | source:s-read |
| deck | slideshow | backend | source:s-tail |
| rem | remotion-to-hyperframes | backend | source:s-tail |
| req > hub | | |
| hub > cli | R01 참고 | |
| hub > reg | R02 넘김 | |
| hub > media | R03 넘김 | |
| hub > rev | R04 넘김 | |
| hub > samp | R05 넘김 | |
| hub > deck | R06 넘김 | |
| hub > rem | R07 넘김 | |

@steps id=hub-steps
| h-hub | hyperframes | 이 페이지의 스킬이다. 요청을 받아 계약과 작업 순서를 적용하고, 요청 종류에 맞는 곳으로 안내한다. | hub-position | hub |

| 관계 | 받는 것·넘기는 것·조건 |
| --- | --- |
| R01 · 참고 | CLI는 `npx hyperframes <command>`로 돌리고 사용법은 `/hyperframes-cli`를 본다. 의무 표현은 없다.[](source:s-engine) |
| R29 · 참고 | `check`, `snapshot`, `preview`, `render`는 `npx hyperframes`로 한다고만 쓴다.[](source:s-loop3)[](source:s-loop4) |
| R02 · 넘김 | 이름 붙은 효과·전환·caption 스타일·차트·카드를 손으로 쓰기 전에 registry를 검색한다. 조건부 의무 어조다.[](source:s-build) |
| R03 · 넘김 | 발표자, avatar, footage, voice, music 같은 모든 media는 `/media-use`가 맡는다. 계약 11번의 grade·grain·blur도 `media-treatment`(`/media-use`)로 보낸다.[](source:s-build)[](source:s-c11) |
| R04, R05 · 넘김 | "복사하거나 다시 만들 영상", "검증된 스타일의 에피소드"가 요청일 때 안내표의 한 행으로 보낸다. 강제가 아니다.[](source:s-read) |
| R06, R07 · 넘김 | deck은 `/slideshow`, Remotion source는 `/remotion-to-hyperframes`로 보낸다. 두 스킬은 필요할 때 설치하는 스킬이라 설치돼 있지 않을 수 있다.[](source:s-tail)[](source:r-life) |
| R08 · 참고 | Figma는 `/figma`로만 적혀 있다. 컬렉션 밖이라 범위 밖이다.[](source:s-tail) |
| R13 · 참고(받음) | 다른 스킬 일곱 개가 plugin 안에서 실행할 때 `references/plugin-installation.md`를 따르라고 가리킨다. 이 스킬 쪽은 6번째 줄이다.[](source:s-plugin) |
| R14, R15, R16 · 참고(받음) | reverse-any-video, remotion-to-hyperframes, slideshow가 결과물을 이 스킬의 계약에 맞춰 만들라고 한다. 상대 쪽 줄은 원장에 있고 이번에 읽지 않았다. |
| R21, R22 · 넘김(받음) | style-sampling이 템플릿에 없는 스타일일 때 두 길(reverse-any-video, 이 스킬의 "From a reference")을 제안한다. 사용자가 고른다. 상대 쪽 줄은 원장에 있고 이번에 읽지 않았다. |
| R25, R26, R27 · 공유 상태 | `assets/`(media·폰트), `compositions/`(registry가 설치한 block), `.hyperframes/` 기록을 여러 스킬이 읽고 쓴다. 선후 관계가 없어 그림에서 뺐다.[](source:s-layout)[](source:s-loop1) |

## 어디까지 읽고 확인했고 무엇을 확인하지 못했나? {#audit}

이 페이지는 **부분 분석**이다. 필수 자료인 `SKILL.md`와 `references/` 23개, `scripts/` 8개는 전부 읽었다. 반복 구조의 assets는 일부만 읽었다. 읽은 파일 목록(경로, 바이트, 역할, 전부·부분)은 같은 폴더 `files.md`에 있다.

| 구분 | 확인 범위 |
| --- | --- |
| 읽은 텍스트 파일 | 74개, 합계 1,026,599B |
| 끝까지 읽음 | 36개: `SKILL.md` 1, `references/` 23, `scripts/` 8, `FRAME.md` 3(`biennale-yellow`, `blockframe`, `code-editorial`), `caption-skin.html` 1(`biennale-yellow`)[](source:f-bien)[](source:f-cap) |
| 구조·표본만 확인(전부 읽지 않음) | 38개: `FRAME.md` 10(제목·구조만), `caption-skin.html` 12(script 개수와 CDN 주소만), `frame-showcase.html` 13(`biennale-yellow` 앞 3.5KB와 `<title>`·주소만), 폰트 라이선스 `OFL-*.txt` 3(첫 줄들만) |
| 제외한 번역본 | `*.KO.md` 24개, 157,677B. 번역본은 근거가 아니라서 열지 않았다. `SKILL.KO.md`만 출처에 선언했다.[](source:skill-ko) |
| 번역본이 없는 파일 | `assets/frame-presets/*/FRAME.md` 13개. 템플릿성 데이터라 번역에서 제외했다. |
| 바이너리 | `.woff2` 폰트 6개(`code-editorial/fonts/`), 합계 135,876B. 읽지 않았다. 폰트 파일이라 텍스트 근거가 없다. |
| 실행 | `npx hyperframes ...`와 `scripts/`의 어떤 파일도 실행하지 않았다. |

원문 대조 결과, `FRAME.md` 세 개는 같은 절 구조(Overview, The Frame, Colors, Typography, Depth & Surface, Shapes, Components, Frame Treatments, Composition Rules, Aspect-Ratio Behavior, Numerals & Claims, Pre-Render Self-Audit, Known Gaps)를 따른다. 나머지 열 개는 제목 목록으로 같은 구조임을 확인했다. 각 preset의 색, 폰트, treatment 6종은 파일마다 다르며, 이 페이지는 `look.md`의 한 줄 요약표까지만 옮겼다.[](source:r-look)

스크립트가 하는 일(실행하지 않고 읽기만 했다)은 다음과 같다.

| 스크립트 | 읽고 확인한 동작 |
| --- | --- |
| `plugin-cli.mjs` | plugin manifest에서 버전을 읽어 `npx --yes hyperframes@<version>`을 홈 폴더에서 실행한다. 첫 인자가 `skills`이면 오류로 막는다. `HYPERFRAMES_SKIP_SKILLS=1` 등 환경 변수를 설정한다.[](source:x-plugin) |
| `bake-basemap.mjs` | MapLibre를 headless Chrome에서 구동해 지도 camera 이동을 all-intra MP4로 굽는다. 타일과 CDN 스크립트를 network로 받고 `--no-sandbox`로 Chrome을 띄운다. `puppeteer-core`, ffmpeg, Chrome이 필요하다.[](source:x-bake) |
| `locate.mjs` | 번호가 붙은 격자로 이미지 속 대상 위치를 찾는 4단계(overlay, region, final, mark)를 ffmpeg로 돌린다. `auto`만 `GEMINI_API_KEY`가 있을 때 이미지를 Gemini API로 보낸다.[](source:x-locate)[](source:x-locate-auto) |

@callout level=open-question title="확인하지 못한 항목과 원문 안의 미해결 점"
| 1) `frame-showcase.html` 13개와 `caption-skin.html` 12개, `FRAME.md` 10개는 전부 읽지 않았다. 이 파일들이 `look.md`의 요약과 다른 지시를 담고 있는지 확인하지 못했다. |
| 2) `look.md`는 `caption-skin.html`과 `frame-showcase.html`을 "참고 코드이며 mount하지 말라"고 하지만, `caption-skin.html` 머리 주석은 빈 칸 세 곳을 채운 사본을 `compositions/captions.html`로 쓸 수 있다고 한다. 우선순위가 명시돼 있지 않아 둘 다 옮긴다.[](source:r-look)[](source:f-cap) |
| 3) `story.md`의 launch beat 비율은 약 8, 12, 8, 40, 20, 8, 8%로 합이 104%다. 원문이 "약"(`~`)을 붙인 근사치라서 그대로 옮겼다.[](source:r-story) |
| 4) 15초 기준은 `SKILL.md`에서 "~15 s"이고 `review.md`의 `film_silent` 경고는 "15 s 넘는" 영화다. 경계값 15 s 정확히를 어느 쪽으로 볼지 원문에 명시 없음.[](source:s-loop2)[](source:r-review) |
| 5) 상대 스킬(`hyperframes-cli`, `hyperframes-registry`, `media-use` 등)의 SKILL.md는 이번 분석에서 읽지 않았다. R14~R16, R21, R22 등 받는 쪽 관계는 원장의 줄 번호를 따랐다. |
| 6) `scripts/lib/main-module.test.mjs`는 `../packages/cli/src/media-use`를 참조하는 등 저장소 안 다른 위치를 전제로 한다. 이 폴더만으로 테스트가 돌아가는지는 확인하지 못했다. |
| 7) 렌더 결과, 계약 위반 검출, 스킬 효과는 측정하지 않았다. 이 페이지는 스킬의 지시를 분석한 것이다. |

분석 중 원본 파일은 수정하지 않았다. 분석 전 두 커밋(`f85af64` 스킬 수집, `3a75929` 한국어 번역본)이 있었고 이 폴더의 파일은 그대로다.
