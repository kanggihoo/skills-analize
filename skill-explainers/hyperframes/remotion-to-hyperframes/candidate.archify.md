# remotion-to-hyperframes는 다른 도구의 영상 코드를 HyperFrames로 어떻게 가져오나? {#remotion-to-hyperframes-page}

`remotion-to-hyperframes`는 코드를 Native, Hosted, Media 세 수준 중 가장 높은 수준으로 들여오고, 쓴 수준을 기록한 뒤 원본과 frame 단위로 대조한다.[](source:levels) 폴더 안 자료는 전부 읽었다. Hosted의 세부 규약은 다른 스킬 소속 파일에 있어 읽지 못했으므로 **부분 분석**이다.

- Remotion 소스는 번역 전에 `lint_source.py`를 돌린다. blocker가 하나라도 있으면 번역하지 않고 호스팅하거나 소스에서 걷어내게 한다.[](source:n1)
- Native 번역은 시간을 `frame / fps` 초로 바꾸고 scene마다 sub-composition 하나를 만든다.[](source:n2)
- 번역 뒤에는 `npx hyperframes diff`로 원본과 SSIM 점수를 비교하고, 깔끔히 옮기지 못한 항목은 `TRANSLATION_NOTES.md`에 적는다.[](source:n4)[](source:n5)
- 마지막 메시지에는 가져온 부분마다 수준, Studio에서 바꿀 수 있는 것, 대조 결과를 적는다.[](source:final)

@answer scope="부분 분석 · 폴더 안 74개 텍스트 파일 · 실행 없이 읽기만"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=f85af643f25876081562e9820cd87fb45a478480
@source fm title="hyperframes/remotion-to-hyperframes/SKILL.md · 5188B · 원본 frontmatter" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=1:4
@source plugin title="hyperframes/remotion-to-hyperframes/SKILL.md · 5188B · 원본 plugin 안내" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=6:6
@source beacon title="hyperframes/remotion-to-hyperframes/SKILL.md · 5188B · 원본 usage beacon" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=8:8
@source levels title="hyperframes/remotion-to-hyperframes/SKILL.md · 5188B · 원본 세 수준" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=10:20
@source n1 title="hyperframes/remotion-to-hyperframes/SKILL.md · 5188B · 원본 Native 1단계" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=24:24
@source n2 title="hyperframes/remotion-to-hyperframes/SKILL.md · 5188B · 원본 Native 2단계" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=25:25
@source n3 title="hyperframes/remotion-to-hyperframes/SKILL.md · 5188B · 원본 Native 3단계" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=26:26
@source n4 title="hyperframes/remotion-to-hyperframes/SKILL.md · 5188B · 원본 Native 4단계" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=27:27
@source n5 title="hyperframes/remotion-to-hyperframes/SKILL.md · 5188B · 원본 Native 5단계" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=28:28
@source maptable title="hyperframes/remotion-to-hyperframes/SKILL.md · 5188B · 원본 API별 참조 표" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=30:41
@source hosted title="hyperframes/remotion-to-hyperframes/SKILL.md · 5188B · 원본 Hosted" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=43:45
@source media title="hyperframes/remotion-to-hyperframes/SKILL.md · 5188B · 원본 Media" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=47:49
@source final title="hyperframes/remotion-to-hyperframes/SKILL.md · 5188B · 원본 최종 메시지" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=51:51
@source hf-route title="hyperframes/hyperframes/SKILL.md · 7481B · 안내 스킬의 호출 줄" path=hyperframes/hyperframes/SKILL.md lines=79:79
@source esc-rules title="hyperframes/remotion-to-hyperframes/references/escape-hatch.md · 5403B · blocker 표" path=hyperframes/remotion-to-hyperframes/references/escape-hatch.md lines=8:22
@source esc-interop title="hyperframes/remotion-to-hyperframes/references/escape-hatch.md · 5403B · interop 동작" path=hyperframes/remotion-to-hyperframes/references/escape-hatch.md lines=24:38
@source esc-msg title="hyperframes/remotion-to-hyperframes/references/escape-hatch.md · 5403B · 권고 메시지" path=hyperframes/remotion-to-hyperframes/references/escape-hatch.md lines=40:83
@source esc-warn title="hyperframes/remotion-to-hyperframes/references/escape-hatch.md · 5403B · warning 처리" path=hyperframes/remotion-to-hyperframes/references/escape-hatch.md lines=85:108
@source esc-both title="hyperframes/remotion-to-hyperframes/references/escape-hatch.md · 5403B · blocker와 warning 혼재" path=hyperframes/remotion-to-hyperframes/references/escape-hatch.md lines=110:115
@source lim-refuse title="hyperframes/remotion-to-hyperframes/references/limitations.md · 5042B · 거절 목록" path=hyperframes/remotion-to-hyperframes/references/limitations.md lines=8:22
@source lim-caveats title="hyperframes/remotion-to-hyperframes/references/limitations.md · 5042B · 단서가 붙는 패턴" path=hyperframes/remotion-to-hyperframes/references/limitations.md lines=24:85
@source lim-works title="hyperframes/remotion-to-hyperframes/references/limitations.md · 5042B · 항상 되는 패턴" path=hyperframes/remotion-to-hyperframes/references/limitations.md lines=87:100
@source lim-never title="hyperframes/remotion-to-hyperframes/references/limitations.md · 5042B · 범위 밖" path=hyperframes/remotion-to-hyperframes/references/limitations.md lines=102:112
@source lim-notes title="hyperframes/remotion-to-hyperframes/references/limitations.md · 5042B · 번역 노트" path=hyperframes/remotion-to-hyperframes/references/limitations.md lines=114:136
@source lint-doc title="hyperframes/remotion-to-hyperframes/scripts/lint_source.py · 12978B · lint 설명" path=hyperframes/remotion-to-hyperframes/scripts/lint_source.py lines=1:36
@source lint-pkg title="hyperframes/remotion-to-hyperframes/scripts/lint_source.py · 12978B · UI 패키지 목록" path=hyperframes/remotion-to-hyperframes/scripts/lint_source.py lines=63:72
@source lint-rules title="hyperframes/remotion-to-hyperframes/scripts/lint_source.py · 12978B · 규칙 정의" path=hyperframes/remotion-to-hyperframes/scripts/lint_source.py lines=149:241
@source lint-main title="hyperframes/remotion-to-hyperframes/scripts/lint_source.py · 12978B · 검사 범위와 종료 코드" path=hyperframes/remotion-to-hyperframes/scripts/lint_source.py lines=314:366
@source eval-tools title="hyperframes/remotion-to-hyperframes/references/eval.md · 4409B · 도구 표" path=hyperframes/remotion-to-hyperframes/references/eval.md lines=7:14
@source eval-flow title="hyperframes/remotion-to-hyperframes/references/eval.md · 4409B · fixture 흐름" path=hyperframes/remotion-to-hyperframes/references/eval.md lines=16:40
@source eval-thr title="hyperframes/remotion-to-hyperframes/references/eval.md · 4409B · 임계값 규칙" path=hyperframes/remotion-to-hyperframes/references/eval.md lines=66:75
@source eval-ci title="hyperframes/remotion-to-hyperframes/references/eval.md · 4409B · CI 연동" path=hyperframes/remotion-to-hyperframes/references/eval.md lines=90:95
@source fonts-noise title="hyperframes/remotion-to-hyperframes/references/fonts.md · 3246B · 폰트 잡음" path=hyperframes/remotion-to-hyperframes/references/fonts.md lines=3:6
@source fonts-inter title="hyperframes/remotion-to-hyperframes/references/fonts.md · 3246B · Inter 권고" path=hyperframes/remotion-to-hyperframes/references/fonts.md lines=76:80
@source med-video title="hyperframes/remotion-to-hyperframes/references/media.md · 4528B · video 변환" path=hyperframes/remotion-to-hyperframes/references/media.md lines=99:110
@source med-nofile title="hyperframes/remotion-to-hyperframes/references/media.md · 4528B · 파일이 아닌 asset" path=hyperframes/remotion-to-hyperframes/references/media.md lines=154:166
@source tim-conv title="hyperframes/remotion-to-hyperframes/references/timing.md · 7021B · frame 변환" path=hyperframes/remotion-to-hyperframes/references/timing.md lines=7:21
@source tim-spring title="hyperframes/remotion-to-hyperframes/references/timing.md · 7021B · spring 표" path=hyperframes/remotion-to-hyperframes/references/timing.md lines=62:80
@source tim-ease title="hyperframes/remotion-to-hyperframes/references/timing.md · 7021B · easing 표" path=hyperframes/remotion-to-hyperframes/references/timing.md lines=89:109
@source tim-count title="hyperframes/remotion-to-hyperframes/references/timing.md · 7021B · count-up" path=hyperframes/remotion-to-hyperframes/references/timing.md lines=126:158
@source seq-fade title="hyperframes/remotion-to-hyperframes/references/sequencing.md · 6992B · scene 경계 crossfade" path=hyperframes/remotion-to-hyperframes/references/sequencing.md lines=176:199
@source seq-loop title="hyperframes/remotion-to-hyperframes/references/sequencing.md · 6992B · Loop와 Freeze" path=hyperframes/remotion-to-hyperframes/references/sequencing.md lines=201:237
@source tr-table title="hyperframes/remotion-to-hyperframes/references/transitions.md · 4500B · presentation 표" path=hyperframes/remotion-to-hyperframes/references/transitions.md lines=9:50
@source tr-custom title="hyperframes/remotion-to-hyperframes/references/transitions.md · 4500B · custom presentation" path=hyperframes/remotion-to-hyperframes/references/transitions.md lines=83:114
@source par-async title="hyperframes/remotion-to-hyperframes/references/parameters.md · 4916B · async metadata" path=hyperframes/remotion-to-hyperframes/references/parameters.md lines=45:60
@source par-arr title="hyperframes/remotion-to-hyperframes/references/parameters.md · 4916B · 배열 prop" path=hyperframes/remotion-to-hyperframes/references/parameters.md lines=81:113
@source lot-ae title="hyperframes/remotion-to-hyperframes/references/lottie.md · 5044B · After Effects 한계" path=hyperframes/remotion-to-hyperframes/references/lottie.md lines=107:116
@source lot-dot title="hyperframes/remotion-to-hyperframes/references/lottie.md · 5044B · dotLottie 준비" path=hyperframes/remotion-to-hyperframes/references/lottie.md lines=56:66
@source api-box title="hyperframes/remotion-to-hyperframes/references/api-map.md · 16476B · box-sizing" path=hyperframes/remotion-to-hyperframes/references/api-map.md lines=25:36
@source api-react title="hyperframes/remotion-to-hyperframes/references/api-map.md · 16476B · React 패턴 표" path=hyperframes/remotion-to-hyperframes/references/api-map.md lines=121:132
@source api-bow title="hyperframes/remotion-to-hyperframes/references/api-map.md · 16476B · 포기 조건" path=hyperframes/remotion-to-hyperframes/references/api-map.md lines=147:154
@source t1 title="hyperframes/remotion-to-hyperframes/assets/test-corpus/tier-1-title-card/expected.json · 1791B · tier 1 기대값" path=hyperframes/remotion-to-hyperframes/assets/test-corpus/tier-1-title-card/expected.json
@source t2 title="hyperframes/remotion-to-hyperframes/assets/test-corpus/tier-2-multi-scene/expected.json · 2117B · tier 2 기대값" path=hyperframes/remotion-to-hyperframes/assets/test-corpus/tier-2-multi-scene/expected.json
@source t3 title="hyperframes/remotion-to-hyperframes/assets/test-corpus/tier-3-data-driven/expected.json · 3343B · tier 3 기대값" path=hyperframes/remotion-to-hyperframes/assets/test-corpus/tier-3-data-driven/expected.json
@source t4 title="hyperframes/remotion-to-hyperframes/assets/test-corpus/tier-4-escape-hatch/expected.json · 2784B · tier 4 기대값" path=hyperframes/remotion-to-hyperframes/assets/test-corpus/tier-4-escape-hatch/expected.json
@source runsh title="hyperframes/remotion-to-hyperframes/assets/test-corpus/run.sh · 8598B · corpus 실행 script" path=hyperframes/remotion-to-hyperframes/assets/test-corpus/run.sh
@source smoke title="hyperframes/remotion-to-hyperframes/scripts/tests/smoke.sh · 1495B · lint smoke 테스트" path=hyperframes/remotion-to-hyperframes/scripts/tests/smoke.sh
@source boxtest title="hyperframes/remotion-to-hyperframes/scripts/tests/boxSizing.test.mjs · 939B · box-sizing 테스트" path=hyperframes/remotion-to-hyperframes/scripts/tests/boxSizing.test.mjs

## 언제 쓰고, 코드를 어느 수준으로 가져오나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻은 아니다. `disable-model-invocation` 필드는 원문에 명시 없음.[](source:fm)

@code source=fm language=yaml

@list
| description은 Remotion을 가장 먼저 들고, Motion Canvas, Lottie, Three.js, p5.js, canvas, 순수 HTML/CSS animation을 대상으로 든다.[](source:fm) |
| Manim, After Effects, Blender가 낸 render도 대상이다.[](source:fm) |
| 폴더 이름은 Remotion이지만 범위는 더 넓다. 판정[](source:fm) |

안내 스킬 `hyperframes`가 "Remotion source: `/remotion-to-hyperframes`"라는 한 줄로 이 스킬을 가리킨다.[](source:hf-route) HyperFrames plugin 안에서 쓰면 `../hyperframes/references/plugin-installation.md`의 execution rules를 따른다.[](source:plugin)

스킬이 시작되면 `npx hyperframes events --skill=remotion-to-hyperframes`를 한 번 실행하라고 지시한다. 스킬 이름이 CLI의 일반 telemetry와 함께 전송되고, 로그인 상태면 계정에 연결되며, opt-out 설정을 따른다.[](source:beacon) 이 분석에서는 이 명령을 실행하지 않았다.

@workflow id=level-choice title="가져오는 수준 고르기"
| src | 코드 가져오기 | external |
| can | HTML+GSAP 가능? | backend |
| blk | blocker 있나? | backend |
| frame | 임의 frame 그림? | backend |
| native | Native 번역 | backend |
| hosted | Hosted 유지 | backend |
| media | Media 클립 | backend |
| src > can | |
| can > blk | yes |
| can > frame | no |
| blk > native | no |
| blk > hosted | 있음 | emphasis |
| frame > hosted | yes |
| frame > media | no |

원문은 각 부분을 "지원하는 가장 높은 수준"으로 들여오라고 하고, 어느 수준을 썼는지 기록하라고 한다.[](source:levels) 위 그림의 `blocker 있나?` 가지는 Native 1단계의 "host them or refactor them out"을 옮긴 것이다.[](source:n1) 판정

| 수준 | 대상 | Studio에서 바꿀 수 있는 것 |
| --- | --- | --- |
| Native | HTML + GSAP로 바뀔 수 있는 코드. 대부분의 Remotion, HTML/CSS/GSAP animation, 단순한 Motion Canvas.[](source:levels) | 모든 element. variables, catalog, presets가 적용된다.[](source:levels) |
| Hosted | 브라우저에서 요청한 frame을 그릴 수 있는 코드. canvas, p5.js, Three.js, Lottie, WebGL 등.[](source:levels) | timing, 위치, 노출한 parameter.[](source:levels) |
| Media | video나 frame을 출력하는 모든 것. Manim, After Effects, Blender, PIL, moviepy.[](source:levels) | 자르기, 배치, layer. 안의 pixel은 못 바꾼다.[](source:levels) |

wall-clock 시간, 실시간 physics, network에 의존하는 코드는 Media로만 가져올 수 있다.[](source:levels)

## Native 번역은 무엇을 강제하나? {#native}

Remotion 소스에는 다섯 단계가 있다. 단계마다 원문이 요구하는 행동은 다음과 같다.

| 단계 | 에이전트가 하는 일 |
| --- | --- |
| 1. lint | `python3 <SKILL_DIR>/scripts/lint_source.py <source dir>`를 먼저 돌린다. blocker는 번역되지 않으므로 호스팅하거나 소스에서 걷어내고, 근사 번역은 하지 않는다. warning은 버리고 기록한다.[](source:n1) |
| 2. 번역 | `/hyperframes` 계약에 맞춘다. scene당 sub-composition 하나, 시간은 초(`frame / fps`), asset 경로는 root 기준 상대 경로. 루트 `index.html`의 `<style>`에 `* { box-sizing: border-box; }`를 한 번 넣는다.[](source:n2) |
| 3. 편집 가능하게 | props를 `data-composition-variables`로 만들고 `data-var-text`, `data-var-src`, `var(--id)`로 묶는다. `Sequence`는 timed clip이나 sub-composition이 된다. 재사용 component는 sub-composition 하나를 `data-variable-values`로 여러 번 mount한다.[](source:n3) |
| 4. 대조 | `npx hyperframes diff <original.mp4> . --at <t,…>`로 render 없이 지정한 시각을 채점한다. 모든 scene과 모든 cut의 양쪽을 sampling한다. 이어서 render하고 `diff <original.mp4> <hf.mp4>`로 모든 frame을 채점한다.[](source:n4) |
| 5. 기록 | 깔끔히 옮기지 못한 것(버린 음량 ramp, 근사한 presentation, 대체한 font)을 `TRANSLATION_NOTES.md`에 쓴다.[](source:n5) |

box-sizing 규칙을 빼면 border와 padding이 있는 모든 element가 그만큼 커진다. 원문 예시에서 같은 box가 Remotion에서는 200 x 100이고, 규칙이 없으면 260 x 160이다.[](source:api-box) 이 규칙은 test가 확인한다. `boxSizing.test.mjs`는 `SKILL.md`와 `api-map.md`에 규칙이 있는지, 세 tier의 ported root에 정확히 한 번 있는지 검사한다.[](source:boxtest)

대조 때 Remotion 쪽은 `Config.setVideoImageFormat("png")`와 `Config.setColorSpace("bt709")`로 render해야 한다. 아니면 diff가 encoder 차이를 재며, 그 값은 약 0.05 SSIM이다.[](source:n4)

번역 전에는 Remotion API마다 읽을 reference가 정해져 있다.[](source:maptable) 소스가 쓴 이름 붙은 시각 효과는 직접 만들기 전에 `npx hyperframes catalog --query "<the visual, in English>" --json`으로 registry를 검색한다. 설치 없이 전체 registry를 순위로 보여 준다.[](source:maptable)

| 소스에서 만난 API | 읽을 파일 |
| --- | --- |
| `Composition`, `defaultProps`, `schema`, `calculateMetadata` | `references/parameters.md` |
| `Sequence`, `Series`, `Loop`, `AbsoluteFill`, `Freeze` | `references/sequencing.md` |
| `useCurrentFrame`, `interpolate`, `spring`, `Easing`, `interpolateColors` | `references/timing.md` |
| `Audio`, `Video`, `Img`, `IFrame`, `staticFile`, `delayRender` | `references/media.md` |
| `TransitionSeries`, `@remotion/transitions` | `references/transitions.md` |
| `@remotion/lottie` | `references/lottie.md` |
| `@remotion/google-fonts`, `Font.loadFont`, `@font-face` | `references/fonts.md` |
| 옮길 수 없는 것 | `references/limitations.md` |

위 표는 원문 표를 그대로 정리한 것이다.[](source:maptable)

## 어떤 소스에서 번역을 멈추고, 사람은 어디서 정하나? {#bowout}

`lint_source.py`는 blocker 5종과 warning 5종, info 2종을 찾는다. 규칙은 정규식 기반이며 `.ts`, `.tsx`, `.jsx`, `.js` 파일만 훑고 `node_modules`는 건너뛴다.[](source:lint-rules)[](source:lint-main)

| 규칙 | 등급 | 걸리는 것 | 처리 |
| --- | --- | --- | --- |
| `r2hf/use-state` | blocker | `useState` | 번역 중단, interop 권고.[](source:esc-rules) |
| `r2hf/use-reducer` | blocker | `useReducer` | 번역 중단, interop 권고.[](source:esc-rules) |
| `r2hf/use-effect-deps` | blocker | 비어 있지 않은 deps의 `useEffect`, `useLayoutEffect`. 빈 `[]`는 통과.[](source:lint-rules) | 번역 중단, interop 권고.[](source:esc-rules) |
| `r2hf/async-metadata` | blocker | Promise를 돌려주는 `calculateMetadata`.[](source:par-async) | 번역 중단. 동기 `calculateMetadata`는 번역 시점에 계산해 값을 `data-*`에 쓴다.[](source:par-async) |
| `r2hf/third-party-react-ui` | blocker | MUI, Chakra, Mantine, antd, shadcn, Radix, NextUI import.[](source:esc-rules) | 번역 중단, interop 권고.[](source:esc-rules) |
| `r2hf/lambda-import` | warning | `@remotion/lambda` | import와 `renderMediaOnLambda(...)`를 버리고 `TRANSLATION_NOTES.md`에 적는다. HyperFrames는 단일 머신이다.[](source:esc-warn) |
| `r2hf/delay-render`, `use-callback`, `use-memo` | warning | 각 호출 | wrapper를 버리고 inline한다.[](source:esc-warn) |
| `r2hf/custom-hook` | warning | 로컬에 정의한 `use*` hook | 순수하게 `useCurrentFrame`에서 파생하면 본문을 inline하고, state나 effect가 있으면 포기한다.[](source:lint-rules) |
| `r2hf/static-file`, `interpolate-colors` | info | `staticFile`, `interpolateColors` | `assets/x`로 바꾸고 GSAP color tween으로 옮긴다.[](source:lint-rules) |

@list
| blocker가 하나라도 있으면 나머지가 깨끗해도 번역을 시도하지 않는다.[](source:esc-both) |
| 사용자는 전체에 interop를 쓰거나 소스에서 blocker 패턴을 먼저 걷어내야 한다.[](source:esc-both) |
| interop는 Remotion 코드를 esbuild로 묶고 `@remotion/player`를 일시정지한 채 mount한다. `window.__hfRemotion`에 `seekTo(frame)`, `pause()`, `durationInFrames`, `fps`를 등록하면 HyperFrames render loop가 frame마다 `seekTo`를 호출한다.[](source:esc-interop) |
| 원문은 이 구현을 외부 PR #214로 가리킨다.[](source:esc-msg) |

blocker를 만나면 에이전트는 lint 결과의 `recommendation` 필드를 그대로 사용자에게 보여 준다.[](source:esc-msg) lint가 blocker를 찾으면 사람이 읽는 출력 끝에 "do not attempt translation" 권고를 찍고 종료 코드 1을 낸다.[](source:lint-main)

@callout level=warning title="번역을 시도하지 않는 경우"
| blocker가 있을 때, 여러 `<Composition>`을 한꺼번에 줄 때, 상태가 있는 `<Loop>` 자식을 만났을 때, `useCurrentFrame()`을 내부에서 읽는 custom presentation을 만났을 때는 번역하지 않거나 사용자에게 선택을 넘긴다. 근거는 아래 표에 있다.[](source:lim-refuse)[](source:lim-caveats)[](source:lim-never) |

| 상황 | 원문이 정한 처리 |
| --- | --- |
| `Composition`이 여럿 | 하나씩 번역한다. 어느 composition인지 사용자에게 묻는다.[](source:lim-never) |
| 상태가 있는 `<Loop>` 자식(반복 간 counter, randomness seed) | 자식이 반복마다 완전히 결정적일 때만 번역하고 아니면 포기한다. `repeat: -1`은 root가 유한한 `data-duration`을 선언했을 때만 쓴다.[](source:lim-caveats) |
| `useCurrentFrame()`을 내부에서 읽거나 상태가 있는 custom presentation | 포기하고 interop를 권한다.[](source:tr-custom) |
| `crossOrigin="use-credentials"` 이미지 | 번역 시점에 내려받아 inline한다. 인증 header가 필요한 private 이미지는 HyperFrames renderer에서 안 된다.[](source:lim-caveats) |
| 파일이 아닌 media(Buffer, dataURL, `URL.createObjectURL`) | 번역 시점에 파일로 만든다. 100 KB 미만의 작은 asset만 data URL로 넣을 수 있고, audio/video는 파일을 권한다.[](source:med-nofile) |
| 음량 ramp | `data-automation` 음량 lane으로 쓰거나 `ffmpeg afade`로 파일에 굽는다. ramp를 버리면 소리만 달라지고 SSIM은 통과하므로 반드시 표시한다.[](source:lim-caveats) |
| Lottie가 쓰는 After Effects 기능(expression, 대부분의 Effects, Normal/Add/Multiply 외 blend mode, luma matte, 대부분의 3D) | Remotion과 HyperFrames 양쪽에서 깨진다. 원문은 이를 Lottie 자체의 한계로 본다.[](source:lot-ae) |
| HDR, 가변 frame rate, Remotion Studio props panel | 설계상 범위 밖이다. HDR은 Remotion에 대응 기능이 없고, 둘 다 일정한 fps를 가정한다.[](source:lim-never) |

사람이 개입하는 곳은 원문에서 세 군데다.

@list ordered=true
| composition이 여러 개일 때 어느 것을 옮길지 고른다.[](source:lim-never) |
| blocker를 만났을 때 interop를 쓸지 소스를 고칠지 정한다.[](source:esc-both) |
| 마지막 메시지의 보고를 읽는다.[](source:final) |

질문 도구를 쓰는지, 승인 절차가 있는지는 원문에 명시 없음.

Hosted 수준에서는 코드를 그대로 두고 HyperFrames가 시계를 소유한다. `requestAnimationFrame` loop나 timer를 시간 원본으로 쓰지 않고, 난수는 seed를 고정하며, 다른 곳에서 길이가 정해지지 않으면 root에 `data-duration`을 둔다.[](source:hosted) Media 수준은 `<video class="clip" data-has-audio="true" src="assets/x.mp4" ...>`를 쓰고, 소리가 없으면 `muted`를 쓴다.[](source:media) 무음 b-roll에 `data-has-audio="true"`를 붙이면 render가 `ASSET_MEDIA_TYPE_MISMATCH`로 중단된다.[](source:med-video)

## 번역할 때 쓰는 수치는 무엇인가? {#numbers}

| 항목 | 값 | 단위와 적용 조건 |
| --- | --- | --- |
| 시간 변환 | `time_seconds = frame / fps` | fps 30이면 15 frame은 0.5초, 30 frame은 1.0초, 90 frame은 3.0초. 번역할 때 한 번만 변환한다.[](source:tim-conv) |
| 겹침 계산 | scene B 시작 = 60 - 15 = 45 frame = 1.5초 | `TransitionSeries`에서 transition이 15 frame이고 scene A가 60 frame일 때.[](source:tr-table) |
| crossfade 예시 | 0.5초 | scene 하나의 timeline은 자기 파일 안만 보므로 scene 사이 fade는 root timeline에서 host에 건다.[](source:seq-fade) |
| stagger | 12 frame = 0.4초 | fps 30. `delayInFrames={i * 12}`는 offset `i * 0.4`초로 번역한다.[](source:tim-count) |
| `poly(N)` easing | `power<N-1>` | 정수 N이 1부터 5일 때만. 다른 지수는 easing 함수를 직접 쓴다.[](source:tim-ease) |
| count-up easing | `power2.out` | 중간 지점이 0.875로 `1 - (1-t)^3`과 같다. `power3.out`은 0.9375라서 어긋난다.[](source:tim-count) |
| spring `{damping: 12, stiffness: 100, mass: 1}` | `back.out(1.4)`, 약 0.7초 | T2, T3에서 검증한 값이다.[](source:tim-spring) |
| spring `{damping: 14, stiffness: 90, mass: 1}` | `back.out(1.2)`, 약 0.7초 | T3 StatCard에서 검증했다.[](source:tim-spring) |
| spring `{damping: 8, stiffness: 200}` | `back.out(2.0)` 또는 `elastic.out(1, 0.5)`, 약 0.6초 | 검증하지 않았고 약 0.05 SSIM을 예산으로 잡는다.[](source:tim-spring) |
| spring `overshootClamping: true` | `power3.out`, 약 0.6초 | 검증하지 않았다.[](source:tim-spring) |
| 폰트 잡음 | 약 0.025 mean SSIM | font weight 800에서 시스템 폰트 fallback이 다를 때. 같은 font를 명시해 적재하거나 Inter를 쓴다.[](source:fonts-noise)[](source:fonts-inter) |
| encoder 잡음 | 약 0.05 SSIM | Remotion을 png와 bt709로 render하지 않았을 때.[](source:n4) |

@facts id=lint-exit
| lint 종료 코드 0 | blocker 없음 |
| lint 종료 코드 1 | blocker 있음 |
| lint 종료 코드 2 | 경로가 없음 |

종료 코드는 `lint_source.py`가 정한다.[](source:lint-main)

diff 합격선은 tier마다 다르다. fixture 3개의 합격 mean SSIM은 0.95, 0.95, 0.90이고, 측정 mean은 0.974, 0.986, 0.953이다.[](source:t1)[](source:t2)[](source:t3)

```mermaid title="tier별 합격선과 측정 mean SSIM (expected.json 기준, 2026-09-18 측정)"
xychart-beta
  x-axis ["T1 title card", "T2 multi scene", "T3 data driven"]
  y-axis "SSIM" 0.85 --> 1
  bar "합격선" [0.95, 0.95, 0.90]
  bar "측정 mean" [0.974, 0.986, 0.953]
```

T3의 0.953은 count-up을 `power3.out`(quartic)으로 번역했을 때 잰 값이다. 원문은 `power2.out`으로 고친 번역은 측정하지 않았다고 쓰고, 반올림한 숫자를 같은 frame 시각에서 따로 비교하라고 한다.[](source:t3)

@list
| 임계값은 측정 p05보다 약 0.02 낮게 잡는 것을 권고한다.[](source:eval-thr) |
| 진짜 번역 회귀는 mean을 0.05 이상 떨어뜨리고, encoder와 font 흔들림은 약 0.01에 머문다고 한다.[](source:eval-thr) |
| corpus 실행은 `--min-mean <임계값> --min-p05 0 --min-cell 0`으로 mean만 통과 조건으로 쓴다.[](source:runsh) |
| 실제 번역 점검에서는 SSIM, frame별 최악 cell, cut, 최악 순간 sheet를 모두 보라고 한다.[](source:n4) |

tier 4는 렌더 없이 lint만 검증한다. 사례 8개 중 blocker 사례가 5개, warning만 있는 사례가 3개이고, 최소 blocker 지적 7건, 최소 warning 지적 6건을 기대한다.[](source:t4)

## 이 스킬은 흐름에서 어디에 놓이나? {#position}

묶음 `start-from-reference`에 속한다. 안내 스킬 `hyperframes`가 입력이 Remotion source일 때 이 스킬로 넘기고(R07), 이 스킬은 번역 중에 `/hyperframes` 계약, registry 검색, `/media-use`를 참고한다(R15, R17, R19). 같은 묶음의 `reverse-any-video`는 영상 파일을 원본과 대조해 다시 만드는 같은 계열이다(R28). 전체 흐름은 `skill-explainers/hyperframes/_group-start-from-reference/start-from-reference.html`에 있다.

@workflow id=position-flow title="흐름 속 위치"
| guide | hyperframes 안내 | backend |
| self | remotion-to-hyperframes | backend |
| reg | hyperframes-registry | backend |
| mu | media-use | backend |
| guide > self | 입력이 Remotion source | emphasis |
| self > reg | 이름 붙은 시각 효과 | dashed |
| self > mu | 음량 ramp 형식 | dashed |

| rel-id | 구분 | 내용 | 조건·강도 |
| --- | --- | --- | --- |
| R07 | 받는 것 | `hyperframes`가 입력이 Remotion source일 때 이 스킬을 가리킨다.[](source:hf-route) | 제안 한 줄. 강제 문구는 원문에 명시 없음. |
| R17 | 넘기는 것 | 이름 붙은 시각 효과를 직접 만들기 전에 `catalog --query`로 검색한다.[](source:maptable) | 스킬 이름 없이 명령으로 지목한다. |
| R19 | 넘기는 것 | 음량 ramp 형식은 `/media-use`의 `references/mixing.md`를 본다.[](source:lim-caveats) | 참고. 대안으로 `ffmpeg afade`가 있다. |
| R15 | 따르는 것 | Native는 `/hyperframes` 계약으로 번역하고 Hosted는 `../hyperframes/references/runtimes.md`를 본다.[](source:n2)[](source:hosted) | 참고. 결과는 HTML + GSAP 프로젝트다. |
| R28 | 같은 계열 | `reverse-any-video`와 직접 연결은 없다. | 추론 |

## 어디까지 읽고 무엇을 확인하지 못했나? {#audit}

@list
| 폴더에서 `*.KO.md`를 뺀 파일은 76개다. |
| 74개 텍스트 파일을 끝까지 읽었고 합계는 168254B다. 부분 읽음은 0개다. |
| 파일별 경로, 바이트, 역할은 `skill-explainers/hyperframes/remotion-to-hyperframes/files.md`에 있다. |
| 페이지에는 분석에 인용한 핵심 파일만 출처로 올렸다. |

| 구분 | 개수 | 이유 |
| --- | --- | --- |
| 읽은 텍스트 파일 | 74 | `SKILL.md` 1, `references/` 11, `scripts/` 5, `assets/test-corpus/` 57 |
| 부분 읽음(구조·표본만 확인) | 0 | 거대한 생성 데이터가 없다. |
| 빈 파일 | 2 | `assets/.gitkeep`, `scripts/.gitkeep`. 0B라 읽을 내용이 없다. |
| 바이너리 | 0 | 이미지, 음원, 영상, 폰트가 폴더에 없다. fixture가 쓰는 PNG와 WAV는 `setup.sh`가 실행 시 생성한다. |
| `*.KO.md` 번역본 | 0 | 이 폴더에 없고 열지도 않았다. |

분석 중 바뀐 파일은 없다. `git status`로 이 스킬 폴더를 확인했고 변경이 없었다.

lint, smoke, validate, corpus run, `setup.sh`, `npx hyperframes` 명령은 하나도 실행하지 않았다. 코드와 문서를 읽어서 쓴 분석이다.

@callout level=warning title="원문끼리 어긋나는 곳"
| `escape-hatch.md`의 warning 표는 `r2hf/static-file`과 `r2hf/interpolate-colors`를 warning 쪽에 두지만, `lint_source.py`는 둘을 info로 분류한다.[](source:esc-warn)[](source:lint-rules) 우선순위는 원문에 명시 없음. |
| 문서는 "shadcn"을 blocker로 쓰지만 `lint_source.py`의 패키지 목록에는 `@shadcn/ui`와 `@radix-ui` 접두어만 있다. 로컬에 복사한 shadcn component의 import는 이 목록에 걸리지 않을 수 있다.[](source:lint-pkg) 판정 |
| `parameters.md`의 "Validated in T3 mean SSIM 0.953"은 T3 `expected.json`이 quartic 번역 값이라고 밝힌 측정과 같은 수치다. 고친 cubic 번역의 점수가 아니다.[](source:par-arr)[](source:t3) |
| `eval.md`는 fixture가 아직 CI에 연결되지 않았고 PR 7이 orchestrator를 추가한다고 쓰지만, 같은 폴더에 `run.sh` orchestrator가 이미 있다.[](source:eval-ci)[](source:runsh) 낡은 문장으로 판정한다. |
| `<Freeze>`를 `api-map.md`는 "no-op"이라 쓰고 `sequencing.md`는 "이 element를 tween하지 않는 것"이라 쓴다. 결과는 같지만 표현이 다르다.[](source:seq-loop) |

@callout level=open-question title="확인하지 못한 것"
| Hosted의 세부 규약은 `../hyperframes/references/runtimes.md`에 있다고 SKILL.md가 가리키지만 이 분석은 그 파일을 열지 않았다. 그 파일에서 `remotion`과 `hfRemotion`을 검색했을 때 일치가 없었다. 따라서 blocker 소스를 "host"하는 interop 절차가 이 스킬 안(`escape-hatch.md`와 외부 PR #214)에만 있는지는 확인하지 못했다.[](source:hosted)[](source:esc-interop) |
| interop 구현이 담겼다는 PR #214, Lottie adapter 소스, `hyperframes-vs-remotion.mdx` 같은 외부 링크는 읽지 않았다. |
| `/media-use`의 `references/mixing.md`에 있는 `data-automation` 음량 lane 형식은 읽지 않았다.[](source:lim-caveats) |
| SSIM 측정값(0.974, 0.986, 0.953)과 `lint_source.py`의 실제 동작은 재현하지 않았다. 코드와 기대값 파일을 읽은 결과다. |
| 질문이나 승인 절차의 유무, interop 선택을 사용자에게 묻는 문구는 원문에 명시 없음. |
