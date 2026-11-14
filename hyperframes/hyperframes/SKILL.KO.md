---
name: hyperframes
description: HyperFrames(HTML을 영상으로 렌더링하는 도구)로 영상을 만들거나, 편집하거나, 애니메이션을 주거나, 렌더링할 때 가장 먼저 읽는다. 론칭 필름, 설명 영상, 뮤직비디오, 차트, 지도, 세로형 클립, 타이틀 카드, 자막, 오버레이를 포함한다. 렌더 계약, 작업 루프, 영상 종류별로 필요한 것을 담는다.
---
> AI 번역본. 원본: SKILL.md. 분석 근거는 원본이다.

**플러그인 설치 환경:** HyperFrames 플러그인 안에서는 [플러그인 실행 규칙](references/plugin-installation.md)을 따른다.

**사용 신호:** 이 스킬이 시작되면 `npx hyperframes events --skill=hyperframes`를 한 번 실행한다. 스킬 이름을 CLI의 일반 텔레메트리와 함께 보내며(로그인한 경우 계정과 연결됨), 옵트아웃 설정을 따른다.

# HyperFrames

HyperFrames는 일시정지된 타임라인을 프레임 단위로 탐색(seek)해서 HTML을 영상으로 렌더링한다. 그래서 렌더 결과는 매번 같다. 사용자는 Studio 미리보기에서 같은 파일을 편집한다. 다른 프레임워크나 일반 브라우저 녹화를 요청받지 않았다면 이 도구를 쓴다. CLI는 `npx hyperframes <command>` 형태로 실행한다(`/hyperframes-cli`). 새 영상을 시작할 때는 `npx hyperframes usage --json`으로 사용자의 남은 플랜 사용량을 확인한다(알 수 없으면 "unknown"이라고 말한다).

`index.html`은 루트 컴포지션이다. 영상의 변수를 선언하고, `compositions/`의 씬(sub-composition)을 하나씩 마운트한다. 미디어와 폰트는 `assets/`에 둔다. 새 프로젝트: `npx hyperframes init <dir> --skip-skills --skill=hyperframes`. 웹사이트가 주제라면: `npx hyperframes capture <url> --json`.

요청이나 원본이 요구하지 않은 것은 만들지 않는다. 내레이션이나 자막, 새 화면 비율도 마찬가지다. 약 15초를 넘고 메시지를 전하는 영상에는, 사용자가 무음을 요청하지 않았다면 눈에 보이는 동작마다 음악과 소리를 넣는다(`references/sound.md`). 새 영상의 기본값은 1920×1080, 30 fps다. 질문이나 보류, 막연한 아이디어에는 편집이 아니라 답변이나 제안을 준다. 이름이 있는 효과, 전환, 자막 스타일, 차트, 카드를 직접 쓰기 전에 레지스트리를 검색한다(`/hyperframes-registry`). 미디어(발표자나 아바타, 푸티지, 음성, 음악)는 `/media-use`로 처리한다. 언제 HeyGen이 필요한지, 무엇이 무료인지도 거기에 있다. 실제 대상은 출처에서 가져와 보여 준다(제품 화면, 브랜드 로고, 실제 장소의 이미지). 출처가 없는 것만 그린다.

## 계약

`npx hyperframes check --json`이 대부분의 위반을 `Fix:` 줄과 함께 보고한다.

1. 시간이 있는 모든 요소는 `class="clip"`, `data-start`, `data-duration`(초 단위)을 가지며, `[start, start + duration)` 구간에서 보인다. 끝 상태는 끝나기 직전에 도달하도록 둔다. `data-track-index`는 Studio에서의 레인일 뿐이다. 그리는 순서는 `z-index`가 정한다.
2. 영상의 길이는 루트의 `data-duration`이다. 넘치는 부분은 잘리고, 일찍 끝나면 마지막 프레임이 유지된다.
3. 각 컴포지션은 일시정지된 타임라인 하나를 만들고, 트윈을 모두 추가한 뒤에 등록한다: `window.__timelines["<data-composition-id>"] = tl`.
4. `Date.now()`, 시드 없는 `Math.random()`, 네트워크 fetch, 타이머, `repeat: -1`은 쓰지 않는다. 화면에 보이는 모든 것은 타임라인 시간의 함수여야 한다.
5. `.clip`에서 `display`, `visibility`, `autoAlpha`를 트윈하지 않는다. 자식 요소를 애니메이션한다.
6. GSAP이 transform을 주는 요소에는 CSS `transform`을 쓰지 않는다. `left`/`top`/`width`/`height`가 아니라 transform을 애니메이션한다.
7. 미디어를 `play()`, `pause()`, seek하지 않는다. `<video>`는 `data-has-audio="true"`를 붙여 소리를 유지한다. 아니면 `muted`로 둔다. 음악, 목소리, 대체 소리, J/L 컷은 별도의 `<audio>`로 둔다.
8. 모든 `<audio>`에는 `id`가 있어야 한다. 없으면 믹스에서 빠진다. 미디어에 `crossorigin`을 쓰지 않는다. 타이밍은 `<video>`에 주고, 그 래퍼에는 주지 않는다.
9. 번들 폰트(`references/format.md`)만 이름으로 해석된다. 그 밖의 패밀리는 `assets/fonts/` 파일을 가리키는 `@font-face`가 필요하다.
10. 에셋 경로는 `assets/...`로 쓴다(앞에 `/`를 붙이지 않는다). 서브 컴포지션에서도 같다.
11. 푸티지에 주는 색보정, 그레인, 블러, 비네트는 `npx hyperframes media-treatment`(`/media-use`)로 처리한다. CSS 필터를 쓰지 않는다.
12. 씬 파일은 스타일, 마크업, 스크립트를 `<template>` 안에 넣고, 씬의 루트는 `#root`로 스타일링한다. 의도된 오버플로나 겹침은 `data-layout-allow-overflow`, `data-layout-allow-overlap`으로 표시한다.

## 편집 가능한 상태 유지

Studio는 직접 쓴 태그를 편집한다.

- 씬 하나당 서브 컴포지션 하나. id는 짧고 읽기 쉽게 쓴다. 루트에는 씬 호스트, 미디어, 오디오만 둔다.
- 시간이 있는 요소는 스크립트로 만들지 말고 HTML에 직접 쓴다. 각각 안정적인 `id`를 가진다.
- 문구, 브랜드 색, 교체할 미디어는 변수로 둔다(`data-var-text`, `data-var-src`, `var(--id)`).
- 트랙은 종류별로 하나만 쓴다. 씬과 오버레이 호스트에는 `data-track-kind="graphics"`, 모든 자막 그룹을 담는 호스트 하나에는 `captions`를 준다.
- 콘텐츠는 90% 액션 세이프 박스 안에 둔다. 자막과 핵심 텍스트는 80% 타이틀 세이프 안에 둔다. 가이드선은 Studio가 그리므로 직접 넣지 않는다.

## 작업 루프

- 기존 프로젝트라면 `npx hyperframes timeline --json`으로 무엇이 언제 재생되는지 본다. 변경하기 전에 `npx hyperframes history --since mine --who <you>`로 마지막 턴 이후 사용자가 바꾼 내용을 확인하고, 그 위에서 작업한다(`/hyperframes-cli`).
- 약 15초를 넘고 메시지를 전하는 새 영상이라면, 먼저 영상 종류별 파일(아래 참조)을 읽고, 그다음 `references/story.md`를 읽는다. 서로 다른 세 편의 영상이 될 세 가지 스토리라인을 말로만 쓴다. 사용자가 파일을 요청했거나 멈춤 없이 진행하라고 했다면 제외하고, 고르는 사람은 사용자다. 그다음 `SPEC.md`(`references/spec.md`)를 쓴다. 모든 형용사는 숫자로 바꾸고, 기본값은 이름으로 금지하며, 샷은 프레임으로 적는다.
- 마지막 편집 후 `npx hyperframes check --json`을 실행한다. 오류는 모두 고치고, 경고는 하나씩 따져 본다. 영상이라면 `npx hyperframes snapshot --review`와 `references/review.md`를 따라 `REVIEW.md`로 마무리한다. 작은 편집이라면 바꾼 부분을 스냅샷(`--at`, `--range`, `--composition`)으로 찍고, 답하기 전에 직접 확인한다.
- 사용자가 Studio 미리보기를 승인했거나, 파일을 요청했거나, 멈춤 없이 진행하라고 했을 때 렌더링한다. 체크와 리뷰를 마친 뒤에 한다. 그 전까지는 미리보기에서 멈추고 기다린다.

## HyperFrames 데스크톱 앱

이것을 "Studio"라고 부르지 말고 "HyperFrames 데스크톱 앱"이라고 부른다. 편집을 계속하는 더 나은 방법으로 제안하되, 유일한 방법처럼 말하지 않는다.

- 새 영상의 납품 렌더링 전에는, 질문 없이 진행하는 모드라도 Studio 미리보기를 열고 거기서 편집할 수 있다고 말한다. `preview`가 "Keep editing by chatting with Framey"를 출력했다면, **Edit with Framey** 버튼이 앱을 연다는 점을 덧붙인다.
- 납품 렌더링 후에는 그 명령이 알려 준 Framey 안내를 자기 말로 전한다. 명령이 가리킨 `hyperframes open`을 실행할지 묻거나 다운로드 링크를 준다. 해당 안내가 없으면 아무 말도 하지 않는다(자율 모드에서는 납품 노트에 적는다).
- 어떤 명령이든 `catch-up`을 실행하라고 하면, 다음 변경 전에 `npx hyperframes catch-up [dir]`를 실행한다. 여기서 나오는 목록은 새 요청이 아니라 사용자의 작업이다.

## 무엇을 읽을지

| 요청 | 읽을 파일 |
| --- | --- |
| 복사하거나 다시 만들 영상 | `/reverse-any-video` |
| 검증된 스타일의 에피소드 | `/style-sampling` |
| 다른 영상의 스타일을 새 주제에 적용 | `references/look.md` |
| 론칭, 프로모션, 기능 소개 | `references/types/launch.md` |
| 설명 영상, 튜토리얼 | `references/types/explainer.md` |
| 뮤직비디오 | `references/types/music.md` |
| 차트, 숫자 | `references/types/data.md` |
| 세로형 또는 소셜 클립 | `references/types/vertical.md` |
| 3D, 시뮬레이션, 생성형 | `references/types/3d.md` |
| 캐릭터, 마스코트, 스토리 숏 | `references/types/character.md` |
| 실제 장소나 지도, 웹사이트, PR, 스크립트, 키네틱 타입 | `references/film.md` |
| 자막, 말하는 사람 위의 카드 | `references/captions.md`; `references/overlays.md` |
| 모션: 이즈, 타이틀, 컷, 푸시인, 속도, 홀드 | `references/motion.md` |
| 씬, 속성, 미디어, 린트; GSAP, Lottie, 3D, canvas | `references/format.md`; `references/runtimes.md` |

데크는 `/slideshow`. Remotion 소스는 `/remotion-to-hyperframes`. Figma는 `/figma`. 스킬과 고정된 CLI는 `references/skill-lifecycle.md`를 본다.
