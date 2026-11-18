# remotion-to-hyperframes — 다른 도구로 만든 영상 코드를 HyperFrames로 옮기고 원본과 프레임 단위로 대조한다 {#overview}

에이전트는 Remotion 같은 기존 영상 코드나 footage를 HyperFrames(HTML을 영상으로 렌더하는 도구) 프로젝트로 옮기고, 원본과 frame 단위로 비교한 결과를 보고한다.[](source:s-front)[](source:s-report) **부분 분석**이다. 이 스킬이 읽으라고 가리키는 폴더 밖 문서 몇 개는 열지 않았다.

- 사용자가 다른 도구로 만든 작업을 port, convert, migrate, reuse하라고 할 때 쓴다. 부분마다 Native, Hosted, Media 세 수준 중 하나로 들어온다.[](source:s-front)[](source:s-levels)
- 결과로 HyperFrames 프로젝트, 옮기지 못한 항목을 적은 `TRANSLATION_NOTES.md`, 수준과 대조 결과를 적은 마지막 보고가 남는다.[](source:s-notes)[](source:s-report)
- `/hyperframes`가 입력이 Remotion source일 때 이 스킬을 다음 안내로 가리킨다. 이 스킬은 `/hyperframes` 계약을 참고하고, `reverse-any-video`와는 대안 관계다.
- Remotion 소스에 blocker(번역을 막는 패턴)가 있으면 근사해서 번역하지 않는다.[](source:s-lint)

@answer scope="hyperframes/remotion-to-hyperframes · 원본 파일 74개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source s-front title="frontmatter" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=1:4
@source s-plugin title="plugin 설치 안내" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=6:6
@source s-beacon title="사용 beacon" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=8:8
@source s-levels title="세 수준과 media 한계" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=12:20
@source s-lint title="Native 1단계 lint" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=24:24
@source s-translate title="Native 2단계 번역" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=25:25
@source s-edit title="Native 3단계 편집 가능" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=26:26
@source s-diff title="Native 4단계 대조" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=27:27
@source s-notes title="Native 5단계 번역 메모" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=28:28
@source s-catalog title="catalog 검색" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=41:41
@source s-hosted title="Hosted 수준" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=45:45
@source s-media title="Media 수준" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=49:49
@source s-report title="최종 보고" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=51:51
@source e-blockers title="blocker 목록" path=hyperframes/remotion-to-hyperframes/references/escape-hatch.md lines=8:22
@source e-interop title="interop 패턴" path=hyperframes/remotion-to-hyperframes/references/escape-hatch.md lines=24:38
@source e-warn title="warning만 있을 때" path=hyperframes/remotion-to-hyperframes/references/escape-hatch.md lines=85:100
@source e-both title="blocker와 warning이 함께" path=hyperframes/remotion-to-hyperframes/references/escape-hatch.md lines=110:115
@source l-ramps title="volume ramp 한계" path=hyperframes/remotion-to-hyperframes/references/limitations.md lines=26:38
@source l-loop title="Loop 한계" path=hyperframes/remotion-to-hyperframes/references/limitations.md lines=40:51
@source l-never title="번역하지 않는 것" path=hyperframes/remotion-to-hyperframes/references/limitations.md lines=102:112
@source m-ramp title="media의 volume ramp" path=hyperframes/remotion-to-hyperframes/references/media.md lines=47:49
@source m-video title="Video 속성 규칙" path=hyperframes/remotion-to-hyperframes/references/media.md lines=103:110
@source ev-order title="eval 실행 순서" path=hyperframes/remotion-to-hyperframes/references/eval.md lines=14:14
@source ev-fail title="diff가 실패할 때" path=hyperframes/remotion-to-hyperframes/references/eval.md lines=77:88
@source ev-thresh title="임계값 기준" path=hyperframes/remotion-to-hyperframes/references/eval.md lines=66:75
@source lint-exit title="lint 종료 코드" path=hyperframes/remotion-to-hyperframes/scripts/lint_source.py lines=340:366
@source r-hf79 title="hyperframes의 안내 문장" path=hyperframes/hyperframes/SKILL.md lines=79:79
@source r-life title="온디맨드 스킬" path=hyperframes/hyperframes/references/skill-lifecycle.md lines=7:8
@source r-rev title="reverse-any-video description" path=hyperframes/reverse-any-video/SKILL.md lines=3:3

## 어떻게 동작하나 {#flow span=12}

원문은 순서 있는 단계를 지시하므로 절차형이다. 부분마다 수준을 따로 고르고, Native만 lint부터 대조까지 다섯 단계를 거친다.[](source:s-levels)

그림이 생략한 것이 있다. lint는 Remotion 소스에만 지시되고, HTML/CSS/GSAP나 Motion Canvas는 이 단계 지시가 없다.[](source:s-lint) blocker가 없고 warning만 있으면 해당 구문을 버리고 번역을 이어 간다.[](source:e-warn) diff 실패 뒤 다시 번역하라는 문장은 원문에 없고, 참고 문서를 다시 읽으라고만 한다. 그림의 점선 간선은 이 지시를 이은 판정이다.[](source:ev-fail)

@workflow id=flow-diagram title="remotion-to-hyperframes 흐름"
| lane level | 수준 정하기 |
| lane other | Hosted와 Media |
| lane check | Native 소스 검사 |
| lane native | Native 번역과 검증 |
| lane close | 마무리 |
| pick | 수준 고르기? | backend | level | source:s-levels |
| lint | 소스 lint | backend | check | source:s-lint |
| block | blocker 있나? | backend | check | source:s-lint |
| bow | interop 권고 | external | check | source:e-interop |
| tr | HF 계약으로 번역 | backend | native | source:s-translate |
| edit | 편집 가능하게 | backend | native | source:s-edit |
| cmp | 프레임 대조 | backend | native | source:s-diff |
| notes | 번역 메모 쓰기 | backend | native | source:s-notes |
| host | Hosted 연결 | backend | other | source:s-hosted |
| media | Media 연결 | backend | other | source:s-media |
| report | 최종 보고 | backend | close | source:s-report |
| pick > lint | Native |
| pick > host | Hosted |
| pick > media | Media |
| lint > block | |
| block > bow | 있음 |
| block > tr | 없음 | emphasis |
| tr > edit | |
| edit > cmp | |
| cmp > notes | |
| cmp > tr | diff 실패 | dashed |
| notes > report | |
| host > report | |
| media > report | |

@steps id=flow-steps
| s-pick | 수준 고르기? | **입력** 사용자의 기존 영상 코드·footage · **참조** `SKILL.md`의 수준 표 · **실행** `npx hyperframes events --skill=remotion-to-hyperframes` · **출력** 부분마다 고른 수준과 그 기록. **처리** 에이전트가 각 부분을 가능한 가장 높은 수준(표 순서상 Native가 가장 높다, 판정)으로 들이고 고른 수준을 기록한다.[](source:s-levels) **다음** wall-clock, live physics, network에 기대는 코드는 Media로만 들어온다.[](source:s-levels) beacon은 스킬을 시작할 때 한 번만 보낸다.[](source:s-beacon) | flow-diagram | pick |
| s-lint | 소스 lint | **입력** Remotion 소스 폴더 · **실행** `python3 <SKILL_DIR>/scripts/lint_source.py <source dir>` → 내부: lint_source.py(코드 확인, `.ts` `.tsx` `.jsx` `.js`를 규칙별 정규식으로 훑어 blocker·warning·info를 모으고 blocker가 있으면 exit 1) · **출력** 파일·줄·규칙 id·권고가 붙은 findings. **처리** 에이전트가 번역 전에 blocker와 warning을 가려낸다.[](source:s-lint)[](source:lint-exit) **다음** Remotion이 아닌 소스에는 이 단계 지시가 없다. | flow-diagram | lint |
| s-block | blocker 있나? | **입력** lint findings · **참조** `references/escape-hatch.md` · **출력** 번역 계속 또는 중단 결정. **처리** blocker(`useState`, `useReducer`, 의존성 있는 `useEffect`, async `calculateMetadata`, React UI kit)가 하나라도 있으면 번역하지 않는다.[](source:s-lint)[](source:e-blockers) **다음** blocker와 warning이 함께 있어도 전체를 중단한다.[](source:e-both) | flow-diagram | block |
| s-bow | interop 권고 | **입력** blocker findings · **참조** `references/escape-hatch.md` · **출력** interop 안내 메시지(HF 출력 없음). **처리** 에이전트가 근사 번역 대신 Remotion `<Player>`를 HF composition 안에 host해 HF가 frame마다 seek하게 하는 interop 패턴을 권한다.[](source:e-interop) **다음** 사용자가 blocker를 refactor로 먼저 뺄 수도 있다.[](source:e-both) | flow-diagram | bow |
| s-tr | HF 계약으로 번역 | **입력** blocker 없는 Remotion 소스 · **참조** `references/api-map.md`와 주제별 reference 7개 · **출력** `index.html`, scene별 sub-composition, 에셋. **처리** scene 하나를 sub-composition 하나로 옮기고, 시간은 `frame / fps` 초로 바꾸고, root `<style>`에 `* { box-sizing: border-box; }`를 한 번 둔다.[](source:s-translate) **다음** 이름 붙은 시각 효과는 직접 만들기 전에 `npx hyperframes catalog --query "<the visual, in English>" --json`으로 찾는다.[](source:s-catalog) | flow-diagram | tr |
| s-edit | 편집 가능하게 | **입력** 번역된 scene · **출력** variables, 바인딩, 재사용 sub-composition. **처리** props를 `data-composition-variables`로 두고 `data-var-text`, `data-var-src`, `var(--id)`에 묶고, `Sequence`는 timed clip이나 sub-composition으로, 재사용 component는 `data-variable-values`로 여러 번 mount한다.[](source:s-edit) | flow-diagram | edit |
| s-cmp | 프레임 대조 | **입력** 번역 프로젝트와 원본 mp4 · **실행** `npx hyperframes diff <original.mp4> . --at <t,…>`, 렌더 뒤 `npx hyperframes diff <original.mp4> <hf.mp4>` · **출력** frame별 SSIM, frame마다 가장 나쁜 cell, cut 목록, 최악 순간 sheet. **처리** 모든 scene과 모든 cut 양쪽을 표본으로 점수를 매기고, Remotion 쪽은 PNG와 bt709로 렌더해 인코더 차이를 뺀다.[](source:s-diff) **다음** 실패하면 `worst.jpg`와 `ssim.log`를 보고 해당 reference를 다시 읽는다.[](source:ev-fail) | flow-diagram | cmp |
| s-notes | 번역 메모 쓰기 | **입력** 깔끔히 옮기지 못한 항목 · **출력** `TRANSLATION_NOTES.md`. **처리** 버린 volume ramp, 근사한 presentation, 바꾼 font를 적는다.[](source:s-notes) | flow-diagram | notes |
| s-host | Hosted 연결 | **입력** canvas, p5.js, Three.js, Lottie 같은 코드 · **참조** `../hyperframes/references/runtimes.md` · **출력** HyperFrames 시간으로 구동되는 composition. **처리** 코드를 그대로 두고 HyperFrames가 시계를 쥐게 한다.[](source:s-hosted) **다음** `requestAnimationFrame` loop나 timer를 시간원으로 쓰지 않고, 난수는 seed를 고정하고, 길이를 정하는 것이 없으면 root에 `data-duration`을 둔다.[](source:s-hosted) | flow-diagram | host |
| s-media | Media 연결 | **입력** Manim, After Effects, Blender, PIL, moviepy가 낸 영상·frame · **출력** `<video class="clip" data-has-audio="true" src="assets/x.mp4" ...>` clip. **처리** 파일로 렌더해 clip으로 넣고, 소리가 없으면 `muted`를 쓴다.[](source:s-media) | flow-diagram | media |
| s-report | 최종 보고 | **입력** 들여온 부분별 수준·편집 범위·대조 결과 · **출력** 마지막 메시지. **처리** 각 부분의 수준, Studio에서 사람이 바꿀 수 있는 것, frame 대조 결과를 적는다.[](source:s-report) | flow-diagram | report |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령 `/remotion-to-hyperframes`(`hyperframes`가 안내) · 모델 판단(`description`). frontmatter에 호출 제한 필드는 없다.[](source:s-front)[](source:r-hf79) |
| 성격 | Remotion을 중심으로 기존 영상 코드·footage를 HyperFrames 프로젝트로 옮기고 원본과 대조하는 번역 스킬이다.[](source:s-front) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `hyperframes` {#rel-r07} | **이 스킬** | 다음 안내 | 입력이 Remotion source일 때 `/remotion-to-hyperframes`를 안내한다. 이 스킬은 온디맨드라 설치돼 있지 않을 수 있고, 사용자가 `npx hyperframes skills update <name>`으로 설치한다.[](source:r-hf79)[](source:r-life) |
| **이 스킬** {#rel-r13} | `hyperframes` | 참고 | HyperFrames plugin 안이라면 plugin execution rules를 따르라고 `../hyperframes/references/plugin-installation.md`를 가리킨다. 조건은 plugin 안일 때뿐이다.[](source:s-plugin) |
| **이 스킬** {#rel-r15} | `hyperframes` | 참고 | Native 단계에서 `/hyperframes` 계약으로 번역하고, Hosted 단계는 `../hyperframes/references/runtimes.md`의 seek 규약을 따른다.[](source:s-translate)[](source:s-hosted) |
| **이 스킬** {#rel-r17} | `hyperframes-registry` | 참고 | 소스가 쓴 이름 붙은 시각 효과를 직접 만들기 전에 `catalog --query`로 검색한다. 스킬 이름이 아니라 명령으로 지목한다.[](source:s-catalog) |
| **이 스킬** {#rel-r19} | `media-use` | 참고 | 음량 ramp 형식은 `/media-use`의 `references/mixing.md`를 보라고 한다.[](source:l-ramps)[](source:m-ramp) |
| `reverse-any-video` {#rel-r28} | **이 스킬** | 대안 | 둘 다 기존 작업(영상 파일, 영상 코드)을 HyperFrames로 가져와 원본과 프레임 단위로 대조한다. 직접 연결은 없다(추론).[](source:r-rev)[](source:s-front) |

@architecture id=relation-map title="remotion-to-hyperframes와 이어지는 스킬"
| hf | hyperframes | backend |
| rev | reverse-any-video | backend |
| self | remotion-to-hyperframes(이 스킬) | backend |
| reg | hyperframes-registry | backend |
| mu | media-use | backend |
| hf > self | 다음 안내 |
| rev > self | 대안 |
| self > hf | 참고 |
| self > reg | 참고 |
| self > mu | 참고 |

@code source=s-front language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 세 수준과 Native 다섯 단계, Remotion API별 reference 표를 정한다 | 스킬이 켜지면 읽는다 | 수준 고르기?, HF 계약으로 번역, Hosted 연결, Media 연결, 최종 보고 |
| `references/api-map.md` | Remotion API를 HyperFrames 요소로 옮기는 표이고 blocker 목록이 있다 | 번역을 시작할 때 읽는다 | HF 계약으로 번역 |
| `references/parameters.md` | `Composition` props, `schema`, `calculateMetadata`의 번역 규칙 | `Composition` 계열을 옮길 때 | HF 계약으로 번역, 편집 가능하게 |
| `references/sequencing.md` | `Sequence`, `Series`, `Loop`, `AbsoluteFill`, `Freeze`의 번역 규칙 | 해당 API가 나올 때 | HF 계약으로 번역 |
| `references/timing.md` | `interpolate`, `spring`, `Easing`의 GSAP 변환 | 해당 API가 나올 때 | HF 계약으로 번역 |
| `references/media.md` | `Audio`, `Video`, `Img`, `IFrame`, `staticFile`의 번역 규칙 | 해당 API가 나올 때 | HF 계약으로 번역 |
| `references/transitions.md` | `TransitionSeries`를 crossfade나 shader-transition으로 옮긴다 | 해당 API가 나올 때 | HF 계약으로 번역 |
| `references/lottie.md` | `@remotion/lottie`를 HF Lottie adapter로 옮긴다 | 해당 API가 나올 때 | HF 계약으로 번역 |
| `references/fonts.md` | font 로드 방식의 번역과 font 차이로 생기는 SSIM 손실 | font를 쓰는 소스일 때 | HF 계약으로 번역 |
| `references/limitations.md` | 번역하지 못하는 것과 주의할 것, 번역 메모 서식 | 번역 중 한계를 만났을 때 | 번역 메모 쓰기 |
| `references/escape-hatch.md` | blocker 목록, interop 패턴, warning 처리 | lint에 blocker가 나왔을 때 | blocker 있나?, interop 권고 |
| `references/eval.md` | lint, 렌더, diff 순서와 `summary.json` 읽는 법 | 대조 결과를 읽을 때 | 프레임 대조 |
| `scripts/lint_source.py` | Remotion 소스의 blocker·warning·info를 찾는 linter | Remotion 소스일 때 실행한다 | 소스 lint |
| `scripts/tests/smoke.sh` | linter를 clean·blocker fixture에 돌려 보는 smoke test | 스킬 개발자가 돌린다. 에이전트 지시 없음 | 없음(지시 밖 검사 도구) |
| `scripts/tests/boxSizing.test.mjs` | box-sizing 규칙이 문서와 fixture에 있는지 확인한다 | 스킬 개발자가 돌린다 | 없음(지시 밖 검사 도구) |
| `scripts/tests/fixtures/` (`clean.tsx`, `blocker.tsx`) | smoke test용 Remotion 예시 2개 | smoke test가 읽는다 | 없음(지시 밖 검사 도구) |
| `assets/test-corpus/run.sh` | tier 1~4 fixture를 한꺼번에 돌려 통과 수를 모은다 | 스킬 개발자가 돌린다 | 없음(지시 밖 검사 도구) |
| `assets/test-corpus/tier-1~3/` | Remotion 소스와 HF 번역본 쌍, `expected.json`, README | corpus 실행 때 쓴다 | 없음(지시 밖 검사 도구) |
| `assets/test-corpus/tier-4-escape-hatch/` | blocker·warning 사례 8개와 `validate.sh`, `expected.json` | corpus 실행 때 쓴다 | 없음(지시 밖 검사 도구) |
| `scripts/.gitkeep`, `assets/.gitkeep` | 빈 자리 표시 파일 | 읽지 않는다 | 없음 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| Remotion 소스에 blocker가 하나라도 있다 | 번역하지 않는다. host하거나 refactor로 빼고, 근사하지 않는다(금지). lint는 exit 1로 끝난다. | [](source:s-lint)[](source:e-both)[](source:lint-exit) |
| blocker와 warning이 함께 있다 | 나머지가 깨끗해도 번역하지 않는다(중단). | [](source:e-both) |
| warning만 있다(`@remotion/lambda` config, `delayRender`, `useMemo`, custom hook) | 해당 구문을 버리고 번역을 계속하며 번역 메모에 적는다. | [](source:s-lint)[](source:e-warn) |
| wall-clock, live physics, network에 기대는 코드 | Media 수준으로만 들어온다(제한). | [](source:s-levels) |
| 번역한다 | root `index.html` `<style>`에 `* { box-sizing: border-box; }`를 한 번 둔다. 없으면 테두리·padding 있는 요소가 그만큼 커진다(지시). | [](source:s-translate) |
| 무음 파일에 `data-has-audio="true"`를 단다 | 렌더가 `ASSET_MEDIA_TYPE_MISMATCH`로 중단된다. 소리 없는 `<video>`에는 `muted`를 쓴다. | [](source:m-video) |
| Hosted 코드 | `requestAnimationFrame` loop나 timer를 시간원으로 쓰지 않는다(금지). 난수는 seed를 고정한다. 길이를 정하는 것이 없으면 root에 `data-duration`을 둔다. | [](source:s-hosted) |
| `<Loop>`의 자식이 반복 사이 상태(counter, 난수 seed)를 갖는다 | 자식이 반복마다 결정적이지 않으면 번역하지 않는다. `repeat: -1`은 root가 유한한 `data-duration`을 가질 때만 쓴다. | [](source:l-loop) |
| `<Composition>`이 여러 개다 | 한 번에 하나씩 번역하며 사용자에게 고르게 한다(사람 개입). HDR과 가변 frame rate는 번역 대상이 아니다. | [](source:l-never) |
| volume ramp를 옮기지 못한다 | 영상은 같아 SSIM은 통과하지만 소리가 달라지므로 반드시 알린다. | [](source:l-ramps) |
| Remotion 쪽 렌더 설정이 기본값이다 | `setVideoImageFormat("png")`와 `setColorSpace("bt709")`를 쓰지 않으면 diff가 약 0.05 SSIM의 인코더 차이를 잰다. | [](source:s-diff) |
| diff가 실패한다 | `worst.jpg`를 먼저 보고 `ssim.log`를 읽은 뒤 해당 reference를 다시 읽는다. 임계값은 측정한 `p05`보다 약 0.02 낮게 잡는다(경험칙). | [](source:ev-fail)[](source:ev-thresh) |
| 마지막 보고 | 부분별 수준, 사람이 Studio에서 바꿀 수 있는 것, frame 대조 결과를 적는다(의무). | [](source:s-report) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- interop 패턴 — 개요의 `interop 권고` 노드 · esbuild 번들, `window.__hfRemotion` 등록, `seekTo(frame)` 같은 구현 절차는 개요에 담지 않았다.
- lint 규칙 12개 표 — 개요의 `소스 lint`, `blocker 있나?` 노드 · 규칙 id, 심각도, 권고, 종료 코드 표는 개요에 담지 않았다.
- API 매핑표 — 개요의 `HF 계약으로 번역` 노드 · `Composition`, `AbsoluteFill`, 미디어, 전환, Lottie, font 항목별 대응은 개요에 담지 않았다.
- 타이밍 변환 — 개요의 `HF 계약으로 번역` 노드 · `spring`을 `back.out`으로, `Easing`을 GSAP ease로 바꾸는 표와 count-up 변환의 수치는 담지 않았다.
- 시퀀싱 변환 — 개요의 `HF 계약으로 번역` 노드 · 중첩 `Sequence` 합산, `Series` 누적 offset, track index, `Freeze` 처리는 담지 않았다.
- 미디어와 에셋 변환 — 개요의 `HF 계약으로 번역` 노드 · `Audio` trim과 `playbackRate`, `Video`의 audio 판별 명령, data URL 한계(100 KB)는 담지 않았다.
- 파라미터 변환 — 개요의 `편집 가능하게` 노드 · `schema`, `defaultProps`, 중첩 props를 어떻게 옮기는지의 두 가지 서술은 담지 않았다.
- 대조 점수 읽기와 corpus — 개요의 `프레임 대조` 노드 · `summary.json` 필드, tier 1~4 fixture와 기준 SSIM은 담지 않았다.

@callout level=open-question title="확인하지 못한 것"
| 폴더 밖 대상 `../hyperframes/references/runtimes.md`, `plugin-installation.md`, `/media-use`의 `references/mixing.md`, 외부 PR #214 문서는 열지 않았다. 그래서 Hosted 규칙과 interop의 상세는 부분 분석이다.
| 에셋 경로가 원문끼리 다르다. `SKILL.md` 25줄은 root 기준이라 하고, `references/api-map.md` 76줄과 `references/sequencing.md` 104줄은 scene 파일 안에서 `../assets/`를 쓰라고 한다. 우선순위는 명시되지 않았다.
| props 처리가 갈린다. `SKILL.md` 26줄은 `data-composition-variables`와 `data-var-*`를 쓰라 하고, `references/parameters.md` 72~79줄은 root `#stage`의 `data-*`를 쓰라 한다. 같은 파일 40~43줄은 `data-variable-values`를 함께 말한다.
| `SKILL.md` 27줄은 tier별 임계값이 `references/eval.md`에 있다고 하지만, eval.md에는 경험칙과 명령 예시만 있다. tier별 값은 corpus의 `expected.json`에 있다.
| `SKILL.md` 8줄은 `npx hyperframes events --skill=...`를 한 번 실행하라 하지만, `hyperframes-cli`는 `events`를 직접 돌리지 말라고 쓴다. 두 스킬의 지시가 부딪힌다.
| `references/eval.md` 92~95줄은 corpus를 CI에 아직 연결하지 않았고 orchestrator는 이후 PR이 더한다고 쓰지만, `assets/test-corpus/run.sh`가 이미 있다. 문서가 낡았을 가능성이 있다.

읽은 원본: 텍스트 파일 74개. 제외: `.gitkeep` 2개(빈 파일).
