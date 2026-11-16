# 이미 있는 영상·코드·스타일에서 출발할 때 어느 스킬을 쓰고 서로 어떻게 이어지나? {#start-from-reference-page}

이 묶음은 새 영상을 처음부터 기획하지 않고, 이미 있는 영상 파일·영상 코드·검증된 스타일 템플릿에서 출발해 HyperFrames 프로젝트를 만들 때 에이전트가 맞는 스킬을 고르는 안내다.[](source:hf-route) 길 안내는 `hyperframes`의 요청 안내표가 맡고, 영상 파일은 `reverse-any-video`, 영상 코드는 `remotion-to-hyperframes`, 스타일 에피소드는 `style-sampling`이 처리한다. 부분 분석이다. 지시문 위주로 읽었고 CLI는 실행하지 않았다.

- 영상 파일 하나를 frame 단위로 다시 만들려면 `reverse-any-video`다. HyperFrames Pro 기능이고, 끝에 원본과 `diff`로 대조한다.[](source:rev-pro)[](source:rev-check)
- 영상 코드(Remotion이 먼저)나 다른 도구의 렌더 파일을 가져오려면 `remotion-to-hyperframes`다. Native, Hosted, Media 중 가능한 가장 높은 수준으로 가져온다.[](source:rem-levels)
- 다섯 스타일 템플릿 중 하나로 새 에피소드를 만들려면 `style-sampling`이다. 다섯 개 밖의 스타일이면 두 길을 제안하고 사용자가 고른다.[](source:sty-none)
- 판정: 안내표는 요청마다 읽을 곳을 하나씩 가리키는 표이고, 세 스킬을 이어서 쓰라는 문장은 원문에 없다.[](source:hf-route)

@answer scope="스킬 4개 · 읽은 파일 17개 · CLI 실행 없음 · 부분 분석"
@meta locale=ko
@source hf-desc title="description" path=hyperframes/hyperframes/SKILL.md lines=1:4
@source hf-plugin title="plugin 규칙과 사용 beacon" path=hyperframes/hyperframes/SKILL.md lines=6:8
@source hf-intro title="HyperFrames의 렌더 방식" path=hyperframes/hyperframes/SKILL.md lines=10:12
@source hf-contract title="렌더 계약" path=hyperframes/hyperframes/SKILL.md lines=18:33
@source hf-loop title="작업 순서" path=hyperframes/hyperframes/SKILL.md lines=45:50
@source hf-route title="요청별 안내표" path=hyperframes/hyperframes/SKILL.md lines=60:79
@source look-intro title="look을 정하는 순서" path=hyperframes/hyperframes/references/look.md lines=1:3
@source look-ref title="From a reference" path=hyperframes/hyperframes/references/look.md lines=21:23
@source look-line title="LOOK line" path=hyperframes/hyperframes/references/look.md lines=45:47
@source life-set title="설치 단위와 on-demand 스킬" path=hyperframes/hyperframes/references/skill-lifecycle.md lines=3:8
@source rev-desc title="description" path=hyperframes/reverse-any-video/SKILL.md lines=1:4
@source rev-plugin title="plugin 규칙과 사용 beacon" path=hyperframes/reverse-any-video/SKILL.md lines=6:8
@source rev-goal title="목표와 권리" path=hyperframes/reverse-any-video/SKILL.md lines=10:12
@source rev-pro title="Pro 기능과 재개" path=hyperframes/reverse-any-video/SKILL.md lines=14:14
@source rev-frame title="원본이 프레임을 정한다" path=hyperframes/reverse-any-video/SKILL.md lines=16:21
@source rev-layers title="레이어별 처리" path=hyperframes/reverse-any-video/SKILL.md lines=23:31
@source rev-check title="끝 확인과 고치기" path=hyperframes/reverse-any-video/SKILL.md lines=33:37
@source rev-alone title="단독 작업과 REVERSE.md" path=hyperframes/reverse-any-video/SKILL.md lines=39:39
@source rev-probe title="probe와 plan 판정" path=hyperframes/reverse-any-video/references/start.md lines=12:24
@source rev-free title="Free 계정" path=hyperframes/reverse-any-video/references/start.md lines=46:59
@source rev-credit title="credit 부족" path=hyperframes/reverse-any-video/references/start.md lines=70:80
@source rev-hand title="결과 전달과 소요 시간" path=hyperframes/reverse-any-video/references/start.md lines=82:91
@source people-intro title="사람 재촬영 원칙" path=hyperframes/reverse-any-video/references/people.md lines=3:3
@source people-credit title="사람 샷의 credit 한도" path=hyperframes/reverse-any-video/references/people.md lines=19:19
@source people-gen title="사람 샷 생성 명령" path=hyperframes/reverse-any-video/references/people.md lines=9:17
@source anim-gen title="애니메이션 샷 생성 명령" path=hyperframes/reverse-any-video/references/animated.md lines=15:28
@source match title="그려진 레이어 맞춤 규칙" path=hyperframes/reverse-any-video/references/match.md
@source rem-desc title="description" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=1:4
@source rem-plugin title="plugin 규칙과 사용 beacon" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=6:8
@source rem-levels title="세 수준" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=10:20
@source rem-native title="Native 번역과 검증" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=22:28
@source rem-catalog title="registry 검색" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=41:41
@source rem-hosted title="Hosted" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=43:45
@source rem-media title="Media와 최종 보고" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=47:51
@source rem-escape title="blocker와 interop 권고" path=hyperframes/remotion-to-hyperframes/references/escape-hatch.md lines=8:22
@source rem-escape-both title="blocker와 warning이 함께 있을 때" path=hyperframes/remotion-to-hyperframes/references/escape-hatch.md lines=110:115
@source rem-ramp title="음량 ramp" path=hyperframes/remotion-to-hyperframes/references/limitations.md lines=26:38
@source rem-never title="번역하지 않는 것" path=hyperframes/remotion-to-hyperframes/references/limitations.md lines=102:112
@source rem-eval title="검증 순서" path=hyperframes/remotion-to-hyperframes/references/eval.md lines=7:14
@source rem-media-ramp title="음량 ramp 형식" path=hyperframes/remotion-to-hyperframes/references/media.md lines=44:50
@source sty-desc title="description" path=hyperframes/style-sampling/SKILL.md lines=1:4
@source sty-plugin title="plugin 규칙과 사용 beacon" path=hyperframes/style-sampling/SKILL.md lines=6:8
@source sty-goal title="좋은 에피소드의 정의와 금지" path=hyperframes/style-sampling/SKILL.md lines=10:16
@source sty-table title="템플릿 5종 표" path=hyperframes/style-sampling/SKILL.md lines=18:24
@source sty-which title="템플릿 고르기" path=hyperframes/style-sampling/SKILL.md lines=26:28
@source sty-none title="5종 밖 스타일" path=hyperframes/style-sampling/SKILL.md lines=30:30
@source sty-start title="시작과 로그인" path=hyperframes/style-sampling/SKILL.md lines=32:38
@source sty-pull title="템플릿 pull" path=hyperframes/style-sampling/SKILL.md lines=40:46
@source sty-make title="에피소드 만들기" path=hyperframes/style-sampling/SKILL.md lines=48:50
@source sty-credit title="credit 규칙" path=hyperframes/style-sampling/SKILL.md lines=52:54
@source remix-order title="제작 순서" path=hyperframes/style-sampling/references/remix.md lines=1:5
@source remix-read title="템플릿 읽는 순서" path=hyperframes/style-sampling/references/remix.md lines=12:18
@source remix-ask title="한 번에 묻는 것" path=hyperframes/style-sampling/references/remix.md lines=20:30
@source remix-stop1 title="대본과 stop 1" path=hyperframes/style-sampling/references/remix.md lines=32:36
@source remix-foot title="footage 규칙" path=hyperframes/style-sampling/references/remix.md lines=45:51
@source remix-check title="검사와 stop 2, 렌더" path=hyperframes/style-sampling/references/remix.md lines=53:59
@source remix-reply title="답과 기록" path=hyperframes/style-sampling/references/remix.md lines=61:64
@source media-logo title="로고 조달" path=hyperframes/media-use/SKILL.md lines=27:27
@source media-credit title="credit 규칙" path=hyperframes/media-use/SKILL.md lines=40:40
@source ledger title="관계 원장" path=skill-explainers/hyperframes/relations.md

## 출발점에 따라 에이전트는 어느 스킬로 가고 거기서 무엇을 하나? {#behavior span=12}

에이전트는 먼저 `hyperframes`의 안내표에서 요청의 출발점을 본다. 그다음 영상 파일이면 `reverse-any-video`, 영상 코드면 `remotion-to-hyperframes`, 스타일 에피소드면 `style-sampling`, 다른 영화의 스타일을 빌리는 일이면 `hyperframes`의 `look.md`로 간다. 첫 번째 그림은 이 네 갈래의 지도이고, 두 번째 그림은 `style-sampling` 안에서 스타일이 다섯 템플릿에 있는지에 따라 길이 갈리는 부분이다.

@workflow id=start-flow title="출발점에 따른 스킬 선택"
| route | 출발점이 무엇인가? | frontend | source:hf-route |
| rev | reverse-any-video | backend | source:rev-goal |
| rem | remotion-to-hyperframes | backend | source:rem-levels |
| sty | style-sampling | backend | source:sty-goal |
| look | hyperframes look.md | backend | source:look-ref |
| route > rev | 영상 파일 R04 | emphasis |
| route > rem | 영상 코드 R07 | emphasis |
| route > sty | 스타일 에피소드 R05 | emphasis |
| route > look | 다른 영화 스타일 |

그림은 이미 출발점이 있는 요청만 그렸다. 새 영상을 처음부터 만드는 요청(안내표의 type 파일, captions, motion 같은 행)과 deck(`/slideshow`)은 이 묶음 밖이다. 앞쪽은 `skill-explainers/hyperframes/_group-build-video/build-video.html`에 있다.[](source:hf-route)

그림에서 뺀 것은 두 가지다. 하나는 Pro 확인, 로그인 대기, credit 부족, 사람 재촬영, `diff` 뒤 수정, blocker 판정 같은 각 스킬 안쪽의 분기다. 이것은 아래 `@steps`에 문장으로 풀었고, 상세는 각 스킬 페이지에 있다. 다른 하나는 `reverse-any-video`와 `remotion-to-hyperframes`가 `hyperframes`의 계약으로 이어지는 R14, R15와 둘을 같은 계열로 묶는 R28이다. 이 셋은 `관계` 패널의 표에 있다.

`route > look` 간선은 `hyperframes` 안의 `look.md` 줄이어서 원장에 행이 없다. 시작할 때 네 스킬은 모두 `npx hyperframes events --skill=<이름>`을 한 번 실행하고, HyperFrames plugin 안이면 plugin 실행 규칙을 따른다.[](source:hf-plugin)[](source:rev-plugin)[](source:rem-plugin)[](source:sty-plugin)

@steps id=start-steps
| route | 출발점이 무엇인가? | 에이전트는 `hyperframes`를 먼저 읽는다. 이 스킬의 description이 모든 영상 작업에서 가장 먼저 읽으라고 하기 때문이다.[](source:hf-desc) 요청이 이미 있는 것에서 출발하는지 아닌지는 안내표(`What to read`)로 본다. 이 묶음에 해당하는 행은 넷이다. "복사하거나 다시 만들 영상"은 `/reverse-any-video`로, "검증된 스타일의 에피소드"는 `/style-sampling`으로, "다른 영화의 스타일을 새 주제로"는 `references/look.md`로 간다. 표 아래 줄의 "Remotion source"는 `/remotion-to-hyperframes`로 간다.[](source:hf-route) 표 머리글은 `Read`이고 호출을 강제하는 문장은 없다. 판정으로, 표는 읽을 곳을 알려 주는 안내이지 스킬을 자동으로 실행하는 장치가 아니다. 한 요청이 두 행에 걸릴 때의 우선순위나 두 스킬을 이어 쓰는 규칙은 원문에 명시 없음. `reverse-any-video`의 description은 "reverse, recreate, remake, replicate or copy a video"를 쓸 때라고 하고, `remotion-to-hyperframes`는 "port, convert, migrate or reuse work made with another tool"을 쓸 때라고 한다.[](source:rev-desc)[](source:rem-desc) `style-sampling`의 description은 "an episode of", "in the style of" 같은 말에 쓰고 "영상 하나를 복사하는 것은 `reverse-any-video`"라고 가른다.[](source:sty-desc) 세 문장은 모델이 판단할 때 참고하는 설명이고 단어가 맞아야 켜지는 사전이 아니다. | start-flow | route |
| rev | reverse-any-video | 에이전트는 영상 파일 하나를 원본과 frame 단위로 맞고 나중에 편집할 수 있는 프로젝트로 다시 만든다. 사용 권리가 있는 영상만 다룬다.[](source:rev-goal) 먼저 `npx hyperframes reverse start <video> --dir <project>`로 연다. 이 기능은 HyperFrames Pro라서 거절되면 에이전트는 이유와 업그레이드 링크, 사용자가 직접 돌릴 `fix` 명령을 알리고 사용자가 업그레이드했다고 말하면 다시 시작한다. 에이전트는 `billing` 명령을 직접 실행하지 않는다.[](source:rev-pro)[](source:rev-free) 시작한 뒤에는 원본이 frame을 정한다. root composition의 크기와 `data-fps`, 길이, 컷 시각, 소리를 모두 원본에서 가져온다.[](source:rev-frame) 화면은 레이어로 나눈다. 글자, UI, 차트는 HTML로 다시 만들고, frame 안의 사진이나 로고는 원본에서 오리며, 화면 속 사람은 HeyGen으로 다시 찍는다. 원본의 전체 frame을 그대로 재생하는 것은 금지다.[](source:rev-layers)[](source:people-intro) 모든 샷에 내용이 차면 `check`, 렌더, `diff`를 돌리고, `diff`가 지목한 문제를 고친 뒤 한 번 더 렌더와 `diff`를 하고 멈춘다.[](source:rev-check) 영상 전체는 에이전트 하나가 맡는 쪽을 원문이 권한다. 끝에 짧은 `REVERSE.md`에 다시 만든 것, 근사한 것, 마지막 `diff` 수치를 적고, 결과를 `preview`로 보여 준다.[](source:rev-alone)[](source:rev-hand) 원본을 있는 그대로 다시 만들고, 내용을 바꾸는 remix는 사용자가 요청할 때만 한다.[](source:rev-pro) 안쪽 규칙은 `skill-explainers/hyperframes/reverse-any-video/reverse-any-video.html`에 있다. | start-flow | rev |
| rem | remotion-to-hyperframes | 에이전트는 가져올 부분마다 수준을 정한다. Native는 HTML과 GSAP로 번역할 수 있는 코드(대부분의 Remotion), Hosted는 브라우저에서 아무 frame이나 그릴 수 있는 코드(canvas, p5.js, Three.js, Lottie), Media는 Manim, After Effects, Blender처럼 영상이나 frame을 내놓는 도구의 렌더 파일이다. 각 부분을 가능한 가장 높은 수준으로 가져오고 어느 수준을 썼는지 기록한다. 벽시계, 실시간 물리, 네트워크에 기대는 코드는 Media로만 들어온다.[](source:rem-levels) Native에서 Remotion이면 `scripts/lint_source.py`를 먼저 돌린다. `useState`, `useReducer`, 의존성이 있는 `useEffect`, async `calculateMetadata`, MUI 같은 React UI 킷은 blocker(번역을 막는 패턴)라서 번역하지 않고 host하거나 소스에서 빼내며 근사 번역은 하지 않는다. `@remotion/lambda` 설정이나 `delayRender` 같은 warning은 지우고 기록한다.[](source:rem-native) 이름 붙은 시각 효과는 직접 만들기 전에 `npx hyperframes catalog --query`로 검색한다.[](source:rem-catalog) 번역은 `/hyperframes` 계약에 맞춘다. scene마다 sub-composition을 두고 시간은 `frame / fps` 초로 쓴다. 그다음 `npx hyperframes diff <original.mp4> . --at <t,…>`로 렌더 없이 점검하고, 렌더한 뒤 모든 frame을 `diff`로 채점한다. 깔끔하게 번역되지 않은 부분은 `TRANSLATION_NOTES.md`에 적는다.[](source:rem-native) Hosted는 코드를 그대로 두고 HyperFrames가 시간을 쥐게 하며, Media는 `<video class="clip">`으로 놓는다.[](source:rem-hosted)[](source:rem-media) 마지막 메시지에는 가져온 부분마다 수준, Studio에서 바꿀 수 있는 것, `diff` 결과를 나열한다.[](source:rem-media) 이 스킬은 `core set`이 아니라 on-demand라서 설치돼 있지 않을 수 있다. 안쪽 규칙은 `skill-explainers/hyperframes/remotion-to-hyperframes/remotion-to-hyperframes.html`에 있다.[](source:life-set) | start-flow | rem |
| sty | style-sampling | 에이전트는 `style-sampling`을 받으면 이 스킬이 무엇을 만드는지부터 쓴다. 목표는 시리즈의 시청자가 다음 업로드로 착각할 만한 에피소드다. 구조, 속도, look, 그래픽, 소리를 새 주제에 입히고 사용자의 목소리, 시리즈에 진행자가 있으면 사용자 자신의 얼굴로 만든다. 크리에이터의 얼굴·목소리·footage·로고·쇼 이름은 쓰지 않는다.[](source:sty-goal) 스타일 템플릿은 HyperFrames Pro 기능이다. CLI가 pull하고 서버가 plan을 확인한다.[](source:sty-goal) 템플릿은 다섯 개이고 각각 시리즈와 사용자가 가져올 것(목소리, 또는 목소리와 얼굴)이 정해져 있다.[](source:sty-table) 안쪽 규칙은 `skill-explainers/hyperframes/style-sampling/style-sampling.html`에 있다. 이어지는 선택과 제작은 아래 두 번째 그림에서 본다. | start-flow | sty |
| look | hyperframes look.md | 에이전트는 `hyperframes` 안에 머물며 `references/look.md`의 "From a reference"를 따른다. 참조 영상이나 이미지에서 내용이 아니라 문법만 가져온다. 문법은 shot 길이, 제목이 들어오고 나가는 방식, 전환, 색의 역할, 글자의 크기와 굵기다. 참조 옆에 내 결과를 `snapshot --at <t,…> --against ref.mp4`로 놓고 문법을 적되, 잰 것과 짐작한 것을 구분해 표시한다.[](source:look-ref) look은 첫 scene 전에 정하고, 디자인 문서가 없으면 `SPEC.md`의 LOOK line에 hex, px, % 같은 수치로 적는다.[](source:look-intro)[](source:look-line) 15초를 넘는 새 영화는 type 파일, `references/story.md`, `SPEC.md` 순서로 간다. 마지막 편집 뒤에는 `npx hyperframes check --json`을 돌려 오류를 모두 고치고, 영화면 `snapshot --review`와 `references/review.md`로 `REVIEW.md`를 쓴다. 렌더는 사용자가 Studio preview를 승인했거나 파일이나 "멈추지 말라"를 요청했고 `check`와 review가 통과한 뒤에만 한다.[](source:hf-loop) 이 노드의 안쪽은 `skill-explainers/hyperframes/hyperframes/hyperframes.html`에 있다. | start-flow | look |

`style-sampling`은 먼저 스타일이 다섯 템플릿 중 하나인지 본다. 있으면 로그인과 plan을 확인하고 템플릿을 받아 에피소드를 만든다. 없으면 두 길을 제안하고, 그 길이 위 그림의 `reverse-any-video`나 `hyperframes look.md`로 이어진다. 아래 그림의 마지막 두 노드는 위 그림 노드로 되돌아가는 이동일 뿐이고 새 동작이 아니다.

@workflow id=style-flow title="style-sampling 안에서 스타일을 고르는 분기"
| fit | 5종 템플릿에 있나? | backend | source:sty-which |
| make | 템플릿으로 에피소드 제작 | backend | source:sty-make |
| offer | 두 길 제안 | frontend | source:sty-none |
| rev2 | reverse-any-video로 이동 | backend | source:rev-goal |
| look2 | hyperframes look.md로 이동 | backend | source:look-ref |
| fit > make | 5종 중 하나 | emphasis |
| fit > offer | 5종 밖 |
| offer > rev2 | 영상 재현 R21 |
| offer > look2 | 새 영화 R22 |

이 그림은 로그인과 plan 확인, pull 실패, 두 멈춤 지점 사이의 단계를 한 노드(`템플릿으로 에피소드 제작`)로 묶었다. 그 안쪽은 아래 `@steps`에 문장으로 풀었다. `offer`에서 두 길 중 어느 쪽도 고르지 않고 멈추는 경우의 처리는 원문에 명시 없음.

@steps id=style-steps
| fit | 5종 템플릿에 있나? | 에이전트는 사용자가 템플릿을 말했거나 주제가 하나에만 맞으면 그 템플릿으로 간다. 그렇지 않거나 사용자가 무엇이 있는지 물으면 다섯 개를 이름, 만드는 것, 사용자가 가져올 것의 짧은 목록으로 보여 주고, 주제에 맞는 것이 있으면 짚은 다음 사용자의 선택을 기다린다. 그 선택 전에는 확인도 pull도 결제도 하지 않는다.[](source:sty-which) 다섯 개는 `collage-explainer`, `finance-explainer`, `animated-science-explainer`, `3d-brand-explainer`, `3d-true-crime`이다.[](source:sty-table) 사용자가 링크하거나 이름으로 댄 채널·영화가 다섯 개 중 하나가 아니면 에이전트는 그렇다고 한 줄로 알리고 목록 대신 `두 길 제안`으로 간다.[](source:sty-none) | style-flow | fit |
| make | 템플릿으로 에피소드 제작 | 에이전트는 매번(재개 포함) `npx hyperframes auth status`를 먼저 돌려 로그인 상태를 본다. plan이나 credit 줄은 사용자에게 되풀이하지 않는다. 로그인이 안 됐으면 템플릿은 Pro라고 한 줄로 말하고 사용자가 `npx hyperframes auth login`을 직접 입력하게 한다. Free면 Pro 기능이라고 한 번 말하고 `npx hyperframes billing subscribe --feature templates --skill style-sampling`을 사용자가 입력하게 하며 아무것도 pull하지 않는다. Pro면 한 줄 말하고 `npx hyperframes templates pull <slug>`를 돌린다.[](source:sty-start)[](source:sty-pull) 템플릿은 `templates/<slug>/`에 놓이고 pull은 credit이 들지 않는다. Pro 기능으로 거절되면 Free일 때처럼 답하고, 다른 실패는 무엇이 실패했는지 말하고 멈춘다. 템플릿을 기억, 웹, 다른 곳의 사본에서 다시 만들지 않는다.[](source:sty-pull) 이어서 `references/remix.md`를 따른다. 템플릿의 `series/<series>/REMIX.md` 단계표가 실제 과정이고 사용자의 몫인 멈춤 지점은 둘, storyboard와 draft다.[](source:sty-make) 순서는 읽기, 목소리 정하기, 앞으로 할 일 알리기, 열린 것만 한 번에 묻기, 사실과 대본, stop 1(storyboard), 목소리, 얼굴, footage, 샷 계획과 조립, 검사, stop 2(draft), 렌더, 답이다.[](source:remix-order) stop 1은 사용자가 go라고 할 때까지 기다리고, stop 2는 contact sheet와 `preview`를 보여 주며 한 번 묻는다.[](source:remix-stop1)[](source:remix-check) 원문은 stop 1의 storyboard를 `hyperframes` 스킬의 `references/storyboard.md`가 말하는 방식으로 쓰라고 한다. 이 지목은 원장에 행이 없다.[](source:remix-stop1) 에피소드는 사용자의 목소리와 사용자가 가져오면 사용자의 얼굴로 만들고, 크리에이터의 얼굴·목소리·footage·로고·쇼 이름은 쓰지 않는다.[](source:sty-goal) 생성 media는 템플릿에 딸린 도구(kit)나 `npx hyperframes media-use generate`로 만들고, 가격·추정·잔액은 먼저 말하지 않는다. 사용자가 말한 한도는 `.hyperframes/credit-limit.json`에 쓴다.[](source:sty-credit) 안쪽 규칙은 `skill-explainers/hyperframes/style-sampling/style-sampling.html`에 있다. | style-flow | make |
| offer | 두 길 제안 | 에이전트는 다섯 개 밖의 스타일이라고 한 줄로 알리고, 목록 대신 두 길을 제안한다. 하나는 짧은 영상 하나를 frame 단위로 다시 만든 뒤 사용자의 내용을 넣는 길(`/reverse-any-video`)이다. 다른 하나는 그 스타일의 문법(grammar)을 가져와 사용자 주제로 새 영화를 만드는 길(`/hyperframes`, `look.md`의 "From a reference")이다. 두 길 모두 영상이 있어야 하므로 이름만 댄 스타일이면 예시 영상 하나를 요청한다. 사용자가 고르고, 고르기 전에는 아무것도 pull하지 않는다.[](source:sty-none) 이 두 간선은 제안이지 의무가 아니다. 판정으로, 첫째 길은 `reverse-any-video`가 "원본을 그대로 다시 만들고 remix는 사용자가 요청할 때만 한다"고 한 조건과 맞으므로, 사용자가 내용 교체를 요청한 경우에 해당한다.[](source:rev-pro) | style-flow | offer |
| rev2 | reverse-any-video로 이동 | 에이전트는 사용자가 영상 하나를 다시 만들고 내용을 바꾸는 길을 고르면 위 그림의 `reverse-any-video` 노드로 간다. 이 노드의 동작은 위 `reverse-any-video` 설명과 같다. 사용자가 고를 때까지 아무것도 pull하지 않는다.[](source:sty-none) | style-flow | rev2 |
| look2 | hyperframes look.md로 이동 | 에이전트는 사용자가 스타일의 문법을 가져와 새 영화를 만드는 길을 고르면 위 그림의 `hyperframes look.md` 노드로 간다. 이 노드의 동작은 위 `hyperframes look.md` 설명과 같다. 고르기 전에는 아무것도 pull하지 않는다.[](source:sty-none) | style-flow | look2 |

설명용 예시 1: 사용자가 "이 채널 스타일로 우리 제품 소개 영상을 만들어 줘"라며 채널 링크를 준다고 하자(지어낸 요청이다). 에이전트가 `style-sampling`으로 갔고 그 채널이 다섯 템플릿에 없다면, 에이전트는 다섯 개 밖이라고 한 줄로 알리고 두 길을 제안한다.[](source:sty-none)

이름만 댔다면 예시 영상을 요청한다. 사용자가 새 영화 쪽을 고르면 `hyperframes`의 `look.md`로, 영상 하나를 다시 만들고 내용을 바꾸는 쪽을 고르면 `reverse-any-video`로 간다. 고르기 전에는 `templates pull`을 하지 않는다.[](source:sty-none)

설명용 예시 2: 사용자가 Remotion 프로젝트를 주며 HyperFrames로 가져와 달라고 한다고 하자(지어낸 입력이다). `lint_source.py`가 `useState` blocker를 냈다면 에이전트는 번역하지 않고, interop을 쓰거나 그 패턴을 소스에서 먼저 빼내라고 권한다.[](source:rem-native)[](source:rem-escape-both) warning만 나왔다면(예를 들어 `@remotion/lambda` 설정) 그 부분을 지우고 번역한 뒤 `TRANSLATION_NOTES.md`에 적는다.[](source:rem-native) 소스에 `<Composition>`이 여러 개면 하나씩 번역하고 어느 것으로 할지 사용자에게 묻는다.[](source:rem-never)

## 안내 스킬 hyperframes는 이 묶음에서 무엇을 맡나? {#guide span=12}

`hyperframes`는 이 묶음의 안내 역할이다. description은 이 스킬이 렌더 계약, 작업 순서, 영상 종류별 요구를 쥐고 있고 모든 영상 작업에서 가장 먼저 읽는 스킬이라고 한다.[](source:hf-desc) 이 묶음에서 쓰는 것은 안내표뿐이다. 표가 이미 있는 것에서 출발하는 요청을 `reverse-any-video`, `style-sampling`, `remotion-to-hyperframes`로 보낸다.[](source:hf-route)

계약은 다른 방향으로도 이 묶음에 닿는다. 렌더는 paused timeline을 frame 단위로 seek하는 방식이라 모든 렌더가 똑같다.[](source:hf-intro) 시간이 붙는 요소는 `class="clip"`, `data-start`, `data-duration`을 가진다.[](source:hf-contract) `reverse-any-video`는 결과물을 이 계약에 맞춰 만들고(R14), `remotion-to-hyperframes`는 Native 단계에서 이 계약으로 번역하며 Hosted 단계에서는 `hyperframes`의 `references/runtimes.md`에 적힌 seek 규약을 따른다(R15).[](source:rev-goal)[](source:rem-native)[](source:rem-hosted) `style-sampling`이 결과물을 이 계약에 맞추라고 직접 말하는 문장은 원문에 명시 없음이다.

@callout level=note title="설치돼 있지 않은 스킬"
`remotion-to-hyperframes`는 `core set`이 아니라 on-demand 스킬이다. 사용자가 `npx hyperframes skills update <name>`으로 설치한다.[](source:life-set)
스킬의 설치, 갱신, 제거는 사용자의 몫이고 에이전트가 직접 실행하지 않는다. `reverse-any-video`와 `style-sampling`은 `core set`이다.[](source:life-set)

## 세 스킬은 무엇이 다르고 어떤 경우에 맞지 않나? {#choose span=12}

세 스킬은 출발점이 서로 다르다. 표는 고를 때 갈리는 기준만 모았다. 맞지 않는 경우 행은 원문의 직접 금지가 아니라, 원문의 목적과 조건에서 읽은 판정이다.

| 기준 | reverse-any-video | remotion-to-hyperframes | style-sampling |
| --- | --- | --- | --- |
| 출발점 | 영상 파일 하나. 링크로 받으면 내려받기 전에 `auth status`를 돌린다.[](source:rev-goal)[](source:rev-pro) | 영상 코드나 렌더 파일. Remotion이 먼저이고 Motion Canvas, Lottie, Three.js, p5.js, canvas, HTML/CSS 애니메이션, Manim·After Effects·Blender 렌더도 받는다.[](source:rem-desc) | 다섯 템플릿 중 하나의 스타일과 사용자의 주제.[](source:sty-table) |
| 결과 | 원본과 frame 단위로 맞고 편집할 수 있는 프로젝트.[](source:rev-goal) | 가져온 프로젝트와 부분별 수준. Studio에서 바꿀 수 있는 범위는 수준마다 다르다.[](source:rem-levels) | 시리즈의 구조·속도·look·그래픽·소리를 새 주제에 입힌 새 에피소드.[](source:sty-goal) |
| 계정 | HyperFrames Pro 기능이고 Free면 업그레이드 안내 뒤 시작하지 않는다.[](source:rev-pro)[](source:rev-free) {caution:Pro 필요} | 원문에 명시 없음. | Pro 기능이다. 로그인 전이면 로그인을, Free면 업그레이드를 안내하고 Free일 때는 pull하지 않는다.[](source:sty-start) {caution:Pro 필요} |
| 원본 대조 | `diff`로 frame 단위. 고친 뒤 한 번 더 렌더와 `diff`를 하고 멈춘다.[](source:rev-check) | `diff`로 frame 단위. 렌더 없는 `--at` 점검과 전체 렌더 점검이 있다.[](source:rem-native)[](source:rem-eval) | 원본 영상이 없다. 시리즈 자체의 수치 옆에 우리 수치를 놓고 보고한다.[](source:remix-check) |
| 사용자 개입 | 업그레이드와 credit 구매는 사용자가 직접 돌린다.[](source:rev-free)[](source:rev-credit) | blocker가 있으면 번역하지 않고 interop이나 소스 수정을 권한다.[](source:rem-escape)[](source:rem-escape-both) | storyboard와 draft 두 곳에서 사용자의 답을 기다린다.[](source:remix-order) |
| 강제와 금지 | `billing`을 직접 실행하지 않고 원본의 전체 frame을 재생하지 않는다.[](source:rev-pro)[](source:rev-layers) | blocker는 근사해서 번역하지 않는다.[](source:rem-native) | 크리에이터의 얼굴·목소리·footage·로고·쇼 이름을 쓰지 않고 템플릿을 기억이나 웹에서 다시 만들지 않는다.[](source:sty-goal)[](source:sty-pull) |
| 남기는 기록 | `REVERSE.md`.[](source:rev-alone) | `TRANSLATION_NOTES.md`.[](source:rem-native) | `LOG.md`, `GAPS.md`, 프로젝트 `CLAUDE.md`.[](source:remix-reply) |
| 맞지 않는 경우(판정) | 새 영상을 기획하거나 스타일만 빌릴 때. 원문은 원본을 그대로 다시 만든다고 한다.[](source:rev-pro) | 벽시계·실시간 물리·네트워크에 기대는 코드는 Native와 Hosted로 못 오고 Media로만 온다.[](source:rem-levels) | 템플릿에 맞지 않는 주제. 한 줄로 알리고 가까운 각도를 제안하며 그 주제를 그대로 만들자고 하지 않는다.[](source:remix-read) |

## 어떤 관계로 무엇을 주고받나? {#relations span=12}

관계의 단일 원본은 `skill-explainers/hyperframes/relations.md`다. 아래 rel-id는 그 원장의 것이다.[](source:ledger) 이 묶음 스킬이 from이나 to인 행 중 이 페이지에서 쓰는 것만 옮겼다. 원문 줄을 다시 열어 종류와 조건을 대조했고 어긋난 곳은 없었다. 원장 밖 참조는 위 `hyperframes` 노드 설명에 별도로 표시했다.

| rel-id | 종류 | 방향 | 조건과 강도 | 전달물 | 그림 |
| --- | --- | --- | --- | --- | --- |
| R04 | 넘김 | `hyperframes` → `reverse-any-video` | "복사하거나 다시 만들 영상"이 요청일 때다. 안내표의 한 행이며 의무 표현은 없다.[](source:hf-route) | 원문에 명시 없음 | 표시 |
| R05 | 넘김 | `hyperframes` → `style-sampling` | "검증된 스타일의 에피소드"가 요청일 때다. 안내표의 한 행이며 의무 표현은 없다.[](source:hf-route) | 원문에 명시 없음 | 표시 |
| R07 | 넘김 | `hyperframes` → `remotion-to-hyperframes` | 입력이 Remotion source일 때다. 이 스킬은 on-demand라 설치돼 있지 않을 수 있다.[](source:hf-route)[](source:life-set) | 원문에 명시 없음 | 표시 |
| R21 | 넘김 | `style-sampling` → `reverse-any-video` | 다섯 개 밖의 스타일일 때 두 길 중 하나로 제안한다. 사용자가 고르며 고르기 전에는 pull하지 않는다.[](source:sty-none) | 예시 영상 | 표시 |
| R22 | 넘김 | `style-sampling` → `hyperframes` | R21과 같은 제안의 다른 길이다. `look.md`의 "From a reference"이고 사용자가 고른다.[](source:sty-none)[](source:look-ref) | 예시 영상 | 표시 |
| R14 | 참고 | `reverse-any-video` → `hyperframes` | 결과물을 `/hyperframes` 계약에 맞춰 만든다. 의무 어조다.[](source:rev-goal) | HyperFrames 프로젝트 | 생략(계약으로 돌아가는 선) |
| R15 | 참고 | `remotion-to-hyperframes` → `hyperframes` | Native에서 `/hyperframes` 계약으로 번역하고, Hosted에서는 `runtimes.md`의 seek 규약을 따른다.[](source:rem-native)[](source:rem-hosted) | HTML과 GSAP 프로젝트 | 생략(계약으로 돌아가는 선) |
| R28 | 같은 계열 | `reverse-any-video` ↔ `remotion-to-hyperframes` | 둘 다 기존 작업을 HyperFrames로 가져와 원본과 frame 단위로 대조한다. 직접 연결은 없다. 판정이며 두 description이 근거다.[](source:rev-desc)[](source:rem-desc) | 없음 | 생략 |
| R13 | 참고 | 세 스킬 → `hyperframes` | plugin 안일 때만 `references/plugin-installation.md`의 plugin 실행 규칙을 따른다.[](source:rev-plugin)[](source:rem-plugin)[](source:sty-plugin) | 파일 `references/plugin-installation.md` | 생략 |
| R17 | 참고 | `remotion-to-hyperframes` → `hyperframes-registry` | 소스가 쓴 이름 붙은 시각 효과를 직접 만들기 전에 `catalog --query`를 검색한다. 스킬 이름이 아니라 명령으로 지목한다.[](source:rem-catalog) | 검색 결과 | 생략(묶음 밖 스킬) |
| R19 | 참고 | `remotion-to-hyperframes` → `media-use` | 음량 ramp의 형식은 `/media-use`의 `references/mixing.md`를 본다. 번역하지 못하면 `TRANSLATION_NOTES.md`에 적는다.[](source:rem-ramp)[](source:rem-media-ramp) | 원문에 명시 없음 | 생략(묶음 밖 스킬) |
| R20 | 참고 | `reverse-any-video` → `media-use` | 로고는 `media-use resolve --type logo`로 실제 마크를 구하고 손으로 그리지 않는다. 사람과 애니메이션 샷 생성은 `media-use generate`를 명령으로 지목한다.[](source:rev-layers)[](source:media-logo)[](source:people-gen)[](source:anim-gen) | 로고 파일과 생성 샷 | 생략(묶음 밖 스킬) |
| R23 | 참고 | `style-sampling` → `media-use` | 생성 media는 kit 도구나 `media-use generate`로 만들고 `media-use`의 Credits 규칙을 따른다. 가격·추정·잔액을 먼저 말하지 않는다.[](source:sty-credit)[](source:media-credit) | 원문에 명시 없음 | 생략(묶음 밖 스킬) |
| R24 | 공유 상태 | `media-use` ↔ `style-sampling` | 두 스킬이 모두 사용자가 말한 credit 한도를 `.hyperframes/credit-limit.json`에 쓴다. 선후 관계는 없다.[](source:sty-credit)[](source:media-credit) | `.hyperframes/credit-limit.json` | 생략, 아래 상태 표 |

## 어떤 파일과 상태를 공유하나? {#state span=12}

묶음 스킬이 서로 읽고 쓰는 파일은 적다. 스킬마다 남기는 기록은 서로 다른 파일이고, 한 스킬이 쓴 기록을 다른 스킬이 읽으라는 지시는 원문에서 확인하지 못했다.

| 파일·상태 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `.hyperframes/credit-limit.json`(`{"credits": N}`) | `style-sampling`이 사용자가 말한 한도를 쓴다. `media-use`도 같은 규칙으로 쓴다.[](source:sty-credit)[](source:media-credit) | `media-use`의 유료 호출이 이 한도를 넘는 호출을 거절한다(지시상 동작).[](source:media-credit) `reverse-any-video`는 이 파일 이름을 말하지 않는다. 사람 샷에서는 사용자가 말한 한도에 맞춰 `--max-credits`를 쓰고, 재개할 때 그 한도가 아직 유효한지 묻는다.[](source:people-credit)[](source:rev-pro) |
| `templates/<slug>/` | `style-sampling`이 `npx hyperframes templates pull <slug>`로 받는다. 이 저장소에는 없다.[](source:sty-pull) | `style-sampling`이 `CHANNEL.md`, `series/<series>/` 아래 문서를 읽는다. `templates/`는 받은 그대로 둔다.[](source:remix-read)[](source:remix-foot) |
| `REVERSE.md` | `reverse-any-video`가 마지막에 쓴다.[](source:rev-alone) | `reverse-any-video`가 재개할 때 읽는다. 다른 스킬이 읽는다는 지시는 원문에 명시 없음.[](source:rev-pro) |
| `TRANSLATION_NOTES.md` | `remotion-to-hyperframes`가 번역하지 못한 부분을 쓴다.[](source:rem-native) | 원문에 명시 없음 |
| 프로젝트 `CLAUDE.md`, `LOG.md`, `GAPS.md` | `style-sampling`이 만든 방법과 단계별 기록을 쓴다.[](source:remix-reply) | 나중 session이 `CLAUDE.md` 첫 줄을 보고 이 에피소드의 변경을 `style-sampling`으로 하게 된다. 판정으로, 읽는 쪽은 다른 스킬이 아니라 같은 스킬의 다음 session이다.[](source:remix-reply) |

## 어디까지 확인했고 무엇이 남았나? {#audit span=12}

읽은 텍스트 파일은 17개다. 전부 읽은 것이 15개이고 일부 줄만 읽은 것이 2개(`remotion-to-hyperframes/references/media.md`, `media-use/SKILL.md`)다. 대상 스킬의 지시는 분석 자료로만 읽었고 실행하지 않았다. 외부 URL은 열지 않았고 번역본(`SKILL.KO.md` 등)도 열지 않았다. 바이너리는 읽지 않았다.

| 파일 | 크기(바이트) | 읽은 범위 |
| --- | --- | --- |
| `hyperframes/hyperframes/SKILL.md` | 7481 | 전부 |
| `hyperframes/hyperframes/references/look.md` | 6031 | 전부 |
| `hyperframes/hyperframes/references/skill-lifecycle.md` | 4926 | 전부 |
| `hyperframes/reverse-any-video/SKILL.md` | 5289 | 전부 |
| `hyperframes/reverse-any-video/references/start.md` | 6988 | 전부 |
| `hyperframes/reverse-any-video/references/people.md` | 4057 | 전부 |
| `hyperframes/reverse-any-video/references/animated.md` | 2599 | 전부 |
| `hyperframes/reverse-any-video/references/match.md` | 4292 | 전부 |
| `hyperframes/remotion-to-hyperframes/SKILL.md` | 5188 | 전부 |
| `hyperframes/remotion-to-hyperframes/references/escape-hatch.md` | 5403 | 전부 |
| `hyperframes/remotion-to-hyperframes/references/limitations.md` | 5042 | 전부 |
| `hyperframes/remotion-to-hyperframes/references/eval.md` | 4409 | 전부 |
| `hyperframes/remotion-to-hyperframes/references/media.md` | 4528 | 44~50줄만 |
| `hyperframes/style-sampling/SKILL.md` | 5113 | 전부 |
| `hyperframes/style-sampling/references/remix.md` | 11074 | 전부 |
| `hyperframes/media-use/SKILL.md` | 5311 | 10~50줄만 |
| `skill-explainers/hyperframes/relations.md` | 15234 | 전부 |

@callout level=open-question title="확인하지 못한 것"
`remotion-to-hyperframes`의 나머지 `references/` 7개(`parameters.md`, `sequencing.md`, `timing.md`, `transitions.md`, `lottie.md`, `fonts.md`, `api-map.md`)와 `scripts/`, `assets/test-corpus/`는 열지 않았다. 스킬 페이지 `skill-explainers/hyperframes/remotion-to-hyperframes/remotion-to-hyperframes.html`에서 다룬다.
`hyperframes`의 `references/plugin-installation.md`(R13의 대상), `runtimes.md`(R15의 Hosted 규약), `storyboard.md`(`style-sampling`의 stop 1이 지목)와 `media-use`의 `references/mixing.md`는 열지 않았다.
`style-sampling`이 받는 `templates/<slug>/` 안의 `CHANNEL.md`, `TEMPLATE.md`, `REMIX.md`는 이 저장소에 없어 읽지 못했다. 에피소드 제작의 실제 단계는 그 파일이 정하므로 이 페이지의 설명은 `remix.md`가 말하는 순서까지다.
`remotion-to-hyperframes`가 Pro 같은 계정 조건을 요구하는지는 원문에 명시 없음. 한 요청이 안내표의 두 행에 걸릴 때의 우선순위도 원문에 명시 없음.
`remotion-to-hyperframes`의 `SKILL.md`는 blocker 부분을 host하거나 소스에서 빼내라고 하고, `escape-hatch.md`는 blocker가 하나라도 있으면 번역을 시도하지 말고 전체를 interop하거나 먼저 빼내라고 한다. 둘이 같은 말인지 우선순위가 있는지는 원문에 명시 없음. 그래서 이 페이지는 두 문장을 함께 적었다.
외부 PR(`escape-hatch.md`가 가리키는 interop 구현)은 URL이라 열지 않았다. 이 저장소 분석 중 바뀐 파일은 없다.
