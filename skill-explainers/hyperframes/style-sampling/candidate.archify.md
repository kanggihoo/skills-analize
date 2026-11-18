# style-sampling은 무엇을 위한 스킬이고 어떻게 움직이나? {#style-sampling-page}

`style-sampling`은 검증된 영상 스타일 템플릿 5종 중 하나를 내려받아, 사용자의 주제로 그 시리즈의 다음 편처럼 보이는 새 영상 에피소드를 만들게 하는 스킬이다. 템플릿 파일이 이 저장소에 없어서 이 페이지는 **부분 분석**이다.[](source:sk-goal)[](source:sk-pro)

- 사용자가 "an episode of", "in the style of" 같은 요청으로 5종 중 하나의 스타일을 원할 때 쓰고, 템플릿은 HyperFrames Pro 기능이라 로그인과 구독이 먼저다.[](source:sk-front)[](source:sk-pro)[](source:sk-start)
- 에이전트는 템플릿을 pull해 에피소드를 렌더하고, 에피소드·길이·stand-in(아직 최종이 아닌 임시 대체물)·실패한 검사·footage licence 표를 답한다. 만든 방법은 프로젝트 `CLAUDE.md`에, 단계 기록은 `LOG.md`와 `GAPS.md`에 남긴다.[](source:rx-reply)
- 하지 않는 것: 템플릿을 기억이나 웹의 사본으로 다시 만들기, creator의 얼굴·목소리·footage·로고·쇼 이름 쓰기, 가격과 credit 숫자 먼저 말하기, 5종 밖 스타일을 pull하기.[](source:sk-pull)[](source:sk-goal)[](source:sk-credits)[](source:sk-nofit)
- 사람이 맡는 곳: 로그인·구독, 열린 것만 묻는 질문 한 번, stop 1(storyboard), stop 2(draft). 에이전트는 이 지점에서 사용자의 답을 기다린다.[](source:sk-start)[](source:rx-ask)[](source:rx-stop1)[](source:rx-stop2)

@answer scope="스킬 2개 파일 · 외부 템플릿 미확인 · 명령 미실행"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=243a9028dc78fe13c6f64b1a5c199bc9939ccc06
@source sk-front title="frontmatter" path=hyperframes/style-sampling/SKILL.md lines=1:4
@source sk-plugin title="plugin 안에서 쓸 때" path=hyperframes/style-sampling/SKILL.md lines=6:6
@source sk-beacon title="usage beacon" path=hyperframes/style-sampling/SKILL.md lines=8:8
@source sk-goal title="목표와 금지" path=hyperframes/style-sampling/SKILL.md lines=10:14
@source sk-pro title="Pro 기능" path=hyperframes/style-sampling/SKILL.md lines=16:16
@source sk-table title="템플릿 5종 표" path=hyperframes/style-sampling/SKILL.md lines=18:24
@source sk-which title="템플릿 고르기" path=hyperframes/style-sampling/SKILL.md lines=26:28
@source sk-nofit title="5종 밖 스타일" path=hyperframes/style-sampling/SKILL.md lines=30:30
@source sk-start title="Start와 auth status" path=hyperframes/style-sampling/SKILL.md lines=32:38
@source sk-pull title="Pull" path=hyperframes/style-sampling/SKILL.md lines=40:46
@source sk-make title="Make the episode" path=hyperframes/style-sampling/SKILL.md lines=48:50
@source sk-credits title="Credits" path=hyperframes/style-sampling/SKILL.md lines=52:54
@source rx-order title="우선순위와 진행 순서" path=hyperframes/style-sampling/references/remix.md lines=3:5
@source rx-tpl title="템플릿 구성" path=hyperframes/style-sampling/references/remix.md lines=7:10
@source rx-read title="읽는 순서" path=hyperframes/style-sampling/references/remix.md lines=12:18
@source rx-ask title="한 번에 묻기" path=hyperframes/style-sampling/references/remix.md lines=20:22
@source rx-never title="creator 사용 금지" path=hyperframes/style-sampling/references/remix.md lines=24:24
@source rx-presenter title="진행자(presenter)" path=hyperframes/style-sampling/references/remix.md lines=25:25
@source rx-voice title="목소리 정하기" path=hyperframes/style-sampling/references/remix.md lines=26:26
@source rx-coming title="예고 메시지" path=hyperframes/style-sampling/references/remix.md lines=27:27
@source rx-length title="길이" path=hyperframes/style-sampling/references/remix.md lines=28:28
@source rx-names title="credit 이름과 REMIX.md 기본값" path=hyperframes/style-sampling/references/remix.md lines=29:30
@source rx-facts title="사실과 대본" path=hyperframes/style-sampling/references/remix.md lines=32:35
@source rx-stop1 title="stop 1" path=hyperframes/style-sampling/references/remix.md lines=36:36
@source rx-audio title="음성과 얼굴" path=hyperframes/style-sampling/references/remix.md lines=38:43
@source rx-footage title="footage와 build" path=hyperframes/style-sampling/references/remix.md lines=45:51
@source rx-checks title="렌더 부하와 검사" path=hyperframes/style-sampling/references/remix.md lines=55:57
@source rx-stop2 title="stop 2와 렌더" path=hyperframes/style-sampling/references/remix.md lines=58:59
@source rx-reply title="답과 기록" path=hyperframes/style-sampling/references/remix.md lines=61:64
@source rel-skill title="원장의 스킬 행" path=skill-explainers/hyperframes/relations.md lines=18:18
@source rel-r05 title="원장 R05" path=skill-explainers/hyperframes/relations.md lines=27:27
@source rel-r13 title="원장 R13" path=skill-explainers/hyperframes/relations.md lines=35:35
@source rel-r21 title="원장 R21~R24" path=skill-explainers/hyperframes/relations.md lines=43:46
@source rel-group title="원장의 묶음 행" path=skill-explainers/hyperframes/relations.md lines=60:60
@source hf-route title="요청별 안내표" path=hyperframes/hyperframes/SKILL.md lines=64:65
@source mu-credits title="Credits 규칙" path=hyperframes/media-use/SKILL.md lines=40:40

## 켜지면 에이전트는 무엇을 읽고 어떻게 판단해 어디서 끝내나? {#behavior span=12}

동작은 두 그림으로 나눠 그린다. 첫 그림은 요청을 받아 템플릿을 pull하기까지, 둘째 그림은 pull한 템플릿으로 에피소드를 만들어 답하기까지다. 그림의 노드 이름이 그대로 `@steps`의 제목이다.

@workflow id=pull-flow title="요청부터 템플릿 pull까지"
| request | 요청 도착 | external |
| beacon | beacon 실행 | backend |
| fit | 5종 안의 스타일? | backend |
| offer | 두 길 제안 | frontend |
| named | 템플릿이 정해졌나? | backend |
| list | 5종 목록 | frontend |
| auth | auth status | backend |
| plan | 계정 상태? | backend |
| login | 로그인 요청 | external |
| subscribe | 구독 요청 | external |
| pull | 템플릿 pull | backend |
| result | pull 성공? | backend |
| stop | 이유 말하고 멈춤 | backend |
| make | 제작으로 | backend |
| request > beacon | | |
| beacon > fit | | |
| fit > offer | no | |
| fit > named | yes | |
| named > list | no | |
| named > auth | yes | emphasis |
| list > auth | 사용자 선택 | emphasis |
| auth > plan | | |
| plan > login | 미로그인 | |
| plan > subscribe | Free | |
| plan > pull | Pro | emphasis |
| login > auth | done | |
| pull > result | | |
| result > make | yes | emphasis |
| result > subscribe | 거절 | |
| result > stop | 다른 실패 | |

@steps id=pull-steps
| request | 요청 도착 | 에이전트는 사용자의 요청 문장과 주제를 받는다. description은 "an episode of", "in the style of", "sample this style", 「用这个风格做一集」를 호출 맥락으로 들고, 영상 하나를 그대로 복제하려는 요청은 `reverse-any-video`의 몫이라고 끝에 적는다. 이 description은 모델이 판단할 때 참고하는 설명이지 단어가 정확히 맞아야 켜지는 사전이 아니다. frontmatter에는 `name`과 `description`만 있고 호출을 막는 필드는 원문에 명시 없음.[](source:sk-front) | pull-flow | request |
| beacon | beacon 실행 | 스킬이 시작될 때 에이전트는 `npx hyperframes events --skill=style-sampling`을 한 번 돌린다. 이 명령은 스킬 이름을 CLI의 평소 telemetry와 함께 보내고, 로그인했다면 계정에 연결되며, 사용자의 opt-out을 따른다고 원문이 설명한다.[](source:sk-beacon) 같은 첫머리 규칙에 따라 HyperFrames plugin 안에서 쓰면 `../hyperframes/references/plugin-installation.md`의 plugin execution rules를 따른다. 이 파일은 이 분석에서 열지 않았다.[](source:sk-plugin) 명령은 실행하지 않았으므로 beacon이 실제로 무엇을 보내는지는 확인하지 못했다. | pull-flow | beacon |
| fit | 5종 안의 스타일? | 에이전트는 사용자가 원하는 스타일이 템플릿 5종 안에 있는지 가른다. 5종은 Collage Explainer, Finance Explainer, Animated Science Explainer, 3D Brand Explainer, 3D True Crime이다.[](source:sk-table) 사용자가 링크하거나 이름으로 댄 채널·영화가 5종에 없으면 "아니오"다.[](source:sk-nofit) 판정 · 원문은 "5종 안"을 가르는 기계적 기준을 주지 않는다. 에이전트가 이름과 주제를 읽고 판단하는 단계다. | pull-flow | fit |
| offer | 두 길 제안 | 5종 밖이면 에이전트는 한 줄로 그렇다고 알리고, 템플릿 목록 대신 두 길을 제안한다. 한 길은 짧은 영상 하나를 프레임 단위로 다시 만들고 내용을 바꾸는 `/reverse-any-video`다. 다른 길은 그 스타일의 문법을 가져와 사용자 주제로 새 영화를 만드는 `/hyperframes`이고, 근거는 `../hyperframes/references/look.md`의 "From a reference"다. 두 길 모두 영상이 필요하므로 이름만 댄 스타일이면 예시 영상 하나를 요청한다. 선택은 사용자가 하고, 고르기 전에는 아무것도 pull하지 않는다.[](source:sk-nofit) 이 스킬의 흐름은 여기서 끝나고 이후는 선택된 스킬이 맡는다(원장 R21·R22).[](source:rel-r21) | pull-flow | offer |
| named | 템플릿이 정해졌나? | 5종 안이면 에이전트는 사용자가 템플릿을 직접 지목했는지, 아니면 주제가 템플릿 하나에만 맞는지 본다. 둘 중 하나면 그 템플릿으로 곧장 진행한다. 둘 다 아니거나 사용자가 무엇이 있는지 물으면 목록 단계로 간다. 이 단계가 끝나기 전에는 확인도 pull도 결제도 하지 않는다.[](source:sk-which) | pull-flow | named |
| list | 5종 목록 | 에이전트는 5종을 이름·만드는 것·사용자가 가져올 것으로 짧게 보여 준다. 주제에 맞는 템플릿이 있으면 그것을 짚고, 사용자가 고를 때까지 기다린다.[](source:sk-which) 템플릿마다 무엇을 만드는지는 다음 패널의 표에 있다. | pull-flow | list |
| auth | auth status | 템플릿이 정해지면 에이전트는 `npx hyperframes auth status`를 가장 먼저 돌린다. 이어 하는 세션에서도, 사용자가 로그인이나 구독을 마치고 돌아온 뒤에도 매번 돌린다. 이 명령은 로그인 확인용이라 결과의 plan이나 credits 줄은 사용자에게 되풀이하지 않는다.[](source:sk-start) | pull-flow | auth |
| plan | 계정 상태? | 에이전트는 auth status 결과를 세 갈래로 읽는다. 로그인하지 않았으면 로그인 요청으로, Free 계정이면 구독 요청으로, Pro 계정이면 한 줄만 말하고 pull로 간다.[](source:sk-start) | pull-flow | plan |
| login | 로그인 요청 | 에이전트는 템플릿이 Pro에 포함된다고 한 줄로 알리고, 사용자에게 느낌표(`!`)와 `npx hyperframes auth login`을 prompt에 입력하게 한 뒤 "done"이라는 답을 기다린다.[](source:sk-start) 에이전트가 이 명령을 직접 돌리지는 않는다. 판정 · 원문은 이유를 적지 않았지만 로그인이 사용자 본인의 입력으로 일어나게 한 구조로 읽힌다. "done" 뒤에 auth status부터 다시 도는 것은 "이어 할 때도 매번"이라는 같은 단원의 규칙에서 나온 판정이다.[](source:sk-start) | pull-flow | login |
| subscribe | 구독 요청 | Free 계정이면 에이전트는 템플릿이 HyperFrames Pro에 포함된다고 한 번만 말한다. 사용자에게 `npx hyperframes billing subscribe --feature templates --skill style-sampling`을 prompt에 입력하게 하고, 이 명령은 사용자가 Pro가 되면 끝난다. 이때 pull은 하지 않는다.[](source:sk-start) 구독이 끝난 뒤 어떻게 이어지는지는 원문에 명시 없음. 판정 · auth status를 매번 먼저 돌린다는 규칙 때문에 다음 호출에서 Pro로 읽혀 pull로 이어진다.[](source:sk-start) | pull-flow | subscribe |
| pull | 템플릿 pull | Pro이면 에이전트는 `npx hyperframes templates pull <slug>`를 돌린다. slug는 5종 표의 `collage-explainer`, `finance-explainer`, `animated-science-explainer`, `3d-brand-explainer`, `3d-true-crime` 중 하나다.[](source:sk-table) 템플릿은 `templates/<slug>/`에 들어온다. pull은 크레딧을 쓰지 않고, 이미 있는 템플릿은 다시 내려받지 않는다.[](source:sk-pull) | pull-flow | pull |
| result | pull 성공? | 에이전트는 pull 결과를 읽어 세 갈래로 간다. 성공하면 제작으로 넘어간다. Pro 기능이라며 거절되면 auth status가 무엇이라 했든 Free 계정처럼 답한다. 그 밖의 실패는 무엇이 실패했는지 말하고 멈춘다.[](source:sk-pull) | pull-flow | result |
| stop | 이유 말하고 멈춤 | 에이전트는 실패한 것을 사용자에게 말하고 멈춘다. 템플릿을 기억, 웹, 다른 곳에서 찾은 사본으로 다시 만드는 것은 금지다("Never rebuild a template from memory, the web or a copy found elsewhere").[](source:sk-pull) 이 실패 뒤에 몇 번 다시 시도하는지는 원문에 명시 없음. "한 번 더 시도한 뒤 묻는다"는 규칙은 생성 job 문장에 붙어 있어 pull 실패에 적용된다는 말이 없다.[](source:sk-credits) | pull-flow | stop |
| make | 제작으로 | pull이 성공하면 에이전트는 `references/remix.md`를 읽고 따른다. 이어 하는 세션에서도 같다. remix.md는 순서만 정하고 과정은 템플릿의 `series/<series>/REMIX.md`가 정한다. 둘이 어긋나면 템플릿이 이기지만, 사용자가 고른 길이와 Pro·credits 규칙(`SKILL.md`)은 예외다.[](source:sk-make)[](source:rx-order) 이 노드 뒤는 다음 그림이다. | pull-flow | make |

그림이 생략한 것이 있다. 사용자가 목록을 보고 고르는 동안의 대화, 로그인·구독 뒤 "이어 하기"의 세부, credit 한도 처리는 그림에 그리지 않았다.

구독을 마친 뒤 `auth status`로 돌아가는 간선도 그리지 않았다. 간선이 겹쳐 배치가 실패했기 때문이며, 돌아가는 근거는 `subscribe` 노드 설명에 판정으로 적었다. 한도 처리는 아래 둘째 그림의 `shot plan·build` 설명과 다음 패널의 규칙 문단에 있다.

설명용 예시(입력은 지어낸 것): 사용자가 "미국 최저임금이 왜 안 올랐는지 영어 explainer로 만들어 줘"라고 한다고 하자. 에이전트가 이 주제가 `collage-explainer`(미국 정책·역사 질문 하나)에만 맞는다고 판단하면 목록 없이 그 템플릿으로 진행한다.[](source:sk-which)[](source:sk-table) auth status가 Pro이면 한 줄을 말하고 pull하고, Free이면 pull 없이 구독 명령을 안내하고 멈춘다.[](source:sk-start) 같은 요청이 "이 유튜브 채널 스타일로"처럼 5종 밖 이름을 대면 pull 없이 두 길을 제안한다.[](source:sk-nofit)

@workflow id=episode-flow title="pull 이후 에피소드 제작"
| lane prep | 준비 |
| lane make | 제작 |
| lane ship | 확인과 전달 |
| read | 템플릿 읽기 | backend | prep |
| voice | 목소리 정하기 | backend | prep |
| coming | 예고 메시지 | frontend | prep |
| ask | 열린 것 질문 | frontend | prep |
| script | 사실과 대본 | backend | prep |
| stop1 | stop 1 storyboard | security | make |
| audio | 음성 만들기 | backend | make |
| face | 진행자 영상 | backend | make |
| footage | footage 찾기 | backend | make |
| build | shot plan·build | backend | make |
| check | 검사 | backend | ship |
| stop2 | stop 2 draft | security | ship |
| render | 전체 렌더 | backend | ship |
| reply | 답과 기록 | frontend | ship |
| read > voice | | |
| voice > coming | | |
| coming > ask | | |
| ask > script | | |
| script > stop1 | | |
| stop1 > audio | 사용자 go | emphasis |
| audio > face | 진행자 시리즈 | |
| audio > footage | 진행자 없음 | |
| face > footage | | |
| footage > build | | |
| build > check | | |
| check > stop2 | | |
| stop2 > render | 사용자 확인 | emphasis |
| render > reply | | |

@steps id=episode-steps
| read | 템플릿 읽기 | 에이전트는 템플릿에서 CHANNEL.md, `series/<series>/TEMPLATE.md`, `REMIX.md`, `kit/README.md` 순서로 읽는다. `kit/`은 시작 project와 도구, 폰트·소리·asset을 담은 폴더다.[](source:rx-tpl) 나머지 파일(voice.md, frame.md, editing.md, footage.md, sound.md)은 REMIX.md 단계가 가리킬 때 읽는다.[](source:rx-read) TEMPLATE.md에서는 에피소드가 무엇인지, runtime, slot, 어떤 주제에 맞고 안 맞는지를 읽는다. 사용자의 주제가 맞지 않으면 한 줄로 그렇다고 알리면서 같은 메시지에서 가장 가까운 각도를 제안하고, 맞지 않는 주제를 그래도 만들겠다는 제안은 하지 않는다. REMIX.md의 step table이 곧 과정이므로 순서대로 따르고 하나도 건너뛰지 않는다.[](source:rx-read) 템플릿이 앱 전용 이름(`media.find`, `voice.cloneVoice`, Storyboard 탭)을 쓰면 command-line 경로나 remix.md가 말한 방법으로 대신한다.[](source:rx-tpl) 템플릿의 실제 파일 내용은 이 저장소에 없어 원문에 명시 없음(확인 못 함). | episode-flow | read |
| voice | 목소리 정하기 | 연구를 시작하기 전에 정하고, 이 단계가 끝나기 전에는 다른 것을 시작하지 않는다. 사용자가 준 HeyGen voice id(또는 8자 접두어)는 사용자가 자기 것이라고 하거나, 주인이 이 영상에 동의했다고 하거나, HeyGen stock voice라고 말했을 때만 쓴다. id를 갖고 있다는 사실만으로는 안 되고, `media-use voices` 목록(한 페이지만 나온다)에 없다는 사실도 아무것도 증명하지 않는다. 말하지 않았으면 질문 한 번에 포함한다.[](source:rx-voice) 접두어는 `voices --limit 100`에서 전체 id를 찾고, 맞는 것이 없거나 여럿이면 묻는다. 사용자가 자기 것이라고 한 clone은 그 목록에서 찾아 쓴다. 그 목록은 워크스페이스의 clone 전부(팀원 것 포함)이고 만든 사람을 알려 주지 않으므로 개수·언어·이름으로 고르지 않는다. 아무것도 정해지지 않았거나 로그인하지 않았으면 voice id, HeyGen에서 만든 30초~3분 분량의 직접 읽은 clone, 직접 녹음한 narration 중 하나를 한 번 묻는다. 셋 다 없으면 한 줄로 HeyGen stock voice를 쓰고 AI 생성이라고 credit한 뒤 진행한다.[](source:rx-voice) 이 단계에서도 음성은 만들지 않는다. `media-use generate --type voice ... --plan`은 그 언어의 HeyGen 첫 공개 voice 이름만 알려 주므로, kit의 voice id를 그 `voice_id`로 정하고 이름으로 credit한다. `heygen voice list`는 별도 로그인이라 다른 계정일 수 있어 쓰지 않는다.[](source:rx-voice) 판정 · 원문이 "질문 라운드에서 묻는다"와 "아무것도 없으면 stock voice로 진행한다"를 모두 적어서, 질문 라운드와 이 단계가 시간상 어떻게 맞물리는지는 원문에 명시 없음. | episode-flow | voice |
| coming | 예고 메시지 | 에이전트는 질문이 아닌 짧은 메시지 하나를 보내고 답을 기다리지 않고 계속 진행한다. 담는 것은 작업 제목과 hook, 길이, 걸리는 시간의 대략이며 가격은 넣지 않는다.[](source:rx-coming) | episode-flow | coming |
| ask | 열린 것 질문 | 에이전트는 사용자의 메시지에 이미 있는 것은 묻지 않고, 아직 열린 것만 한 번에 묻는다. 대상은 주제, 길이, 목소리, 진행자가 있는 시리즈면 얼굴이고, `PEXELS_API_KEY`가 없는데 템플릿의 footage.md가 Pexels를 쓰면 무료 API key를 더할지도 묻는다. Pexels key는 선택이며 없으면 footage.md가 가리키는 다른 출처로 간다.[](source:rx-ask) 길이는 사용자 몫이고 템플릿 runtime보다 앞선다. 약 1분이 첫 제안이고(cold open, title beat, chapter 하나, 짧은 end card), 2~4분은 REMIX.md의 short cut, 전체는 시리즈 자체 runtime이며, 사용자가 "90 seconds", "5 min"이라고 말하면 그 길이다. 길이를 답하지 않았고 주제에도 없으면 약 1분으로 만들고 답에서 긴 버전을 제안한다. 대본 단어 수, 사실, 절, 음악 cue, 리뷰 횟수(1분은 1회, 전체는 2회)를 그 길이에 맞추고 시리즈 runtime을 채우려고 늘리거나 줄이지 않는다.[](source:rx-length) 크레딧에 넣을 역할과 이름은 사용자가 말한 것만이고 말하지 않은 역할은 뺀다. REMIX.md §0이 묻는 나머지(chapter, 언어)는 REMIX.md 기본값을 쓰고, 각각과 길이를 이유와 함께 프로젝트 `CLAUDE.md`에 적는다.[](source:rx-names) | episode-flow | ask |
| script | 사실과 대본 | 에이전트는 REMIX.md에 따라 사실을 먼저 모은다. 숫자, 날짜, 인용마다 출처를 달고, research 서브에이전트를 써도 된다. 대본은 voice.md와 그 시리즈의 대본 구조(script anatomy)에 맞춰 쓰고, REMIX.md가 이름 붙인 script 검사를 돌린다.[](source:rx-facts) 검사의 기준과 수치는 템플릿에 있어 원문에 명시 없음(확인 못 함). | episode-flow | script |
| stop1 | stop 1 storyboard | 첫 번째 사람 승인 지점이다. 에이전트는 대본과 shot plan을 보드에 정지 화면(still)으로 세운다. 비트마다 한 장, 그 아래 대사, 각 shot이 무엇을 보여 주고 어느 component가 만드는지를 hyperframes 스킬의 `references/storyboard.md` 형식대로 적는다. 보드를 얻으려고 음성에 돈을 쓰지 않는다. kit은 음성의 타이밍으로 영상을 만들기 때문에, 먼저 REMIX.md가 stop 1용으로 정한 무료 경로로 추정 타이밍을 만든다. 대부분의 kit에서는 `python3 tools/voice.py --silent`로 시리즈 속도의 무음 stand-in을 만든다. 그 뒤 조립하고 빌드되는 `index.html`에서 보여 준다. 그려서 만드는 시리즈는 REMIX.md가 정한 test shot에서 보여 준다. 보드의 모든 시간은 음성이 생기기 전까지 추정이라고 밝히고, 보드가 preview 옆 Storyboard 탭에 있다고 알려 준 뒤 사용자의 go를 기다린다.[](source:rx-stop1) 사용자가 고치길 원할 때 어디로 되돌아가는지는 원문에 명시 없음. | episode-flow | stop1 |
| audio | 음성 만들기 | go를 받으면 에이전트는 사용자의 voice id를 kit의 voice 도구에 넣어 음성을 만들고, 이어 kit의 timing·pause 도구를 쓴다. 대본 전체를 만들기 전에 한 문단으로 오디션을 한다. 그 문단의 분당 단어 수(words per minute)를 REMIX.md §0이 재는 방식대로 재고, kit의 `voice.speed`를 시리즈 속도에 맞춘다. instant clone은 voice 호출이 speed를 받지 않고 kit이 보관한 원본 음성에서 속도(tempo)를 로컬로 바꾸므로 새 speed에는 비용이 들지 않는다. REMIX.md가 허용하는 범위를 벗어나면 단어를 바꾼다. 대본은 한 번만 음성으로 만들고, 바뀐 문단만 다시 만든다.[](source:rx-audio) 음성은 어떤 진행자 영상보다 먼저 확정된다.[](source:rx-audio) | episode-flow | audio |
| face | 진행자 영상 | 진행자가 있는 시리즈에서만 이 노드를 지난다. 에이전트는 REMIX.md의 host 단계를 확정된 음성으로 돌린다. 사용자 본인의 HeyGen avatar가 있으면 그것을 쓰고, 없으면 사용자 사진의 Avatar IV를 쓰며, 둘 다 안 되면 HeyGen Video 1이 대체다. 모두 `npx hyperframes media-use generate --type avatar`에 완성된 음성을 넣어 입 모양이 맞게 한다.[](source:rx-presenter) 본인 avatar 목록은 `media-use avatars`로 보고, 별도 로그인이라 다른 계정일 수 있는 `heygen avatar list`는 쓰지 않는다.[](source:rx-presenter) 사용자의 직접 촬영은 editing.md의 presenter 규칙대로 자른다. presenter take가 만들어진 뒤 대사가 바뀌면 take 전체를 다시 만든다. 아니면 입 모양이 어긋난다.[](source:rx-audio) | episode-flow | face |
| footage | footage 찾기 | 에이전트는 footage.md가 가리키는 출처(Wikimedia Commons, Openverse, NARA, Library of Congress, Prelinger, Pexels, Mixkit, 공식 media)에서 찾아 curl로 내려받는다. 각 clip의 licence를 직접 확인하고(일부 Mixkit clip은 Restricted), 파일마다 REMIX.md가 이름 붙인 기록에 licence 줄을 쓰며, credit이 필요한 것은 credit한다. Pexels는 사용자의 무료 key가 필요하고 웹 페이지가 에이전트를 거절하므로 key가 없으면 다음 출처로 간다. 403, 429, bot check로 막는 사이트는 우회하지 않고 다른 출처로 간다. chapter마다 서브에이전트 하나를 써도 된다.[](source:rx-footage) YouTube, TikTok, Instagram, X의 영상은 licence가 명시되지 않으면 받지 않는다. 실제 브랜드의 로고·표지판과 웹 페이지 screenshot은 허용 조건(템플릿의 rights 규칙, press kit 약관, 명시된 licence)이 있을 때만 넣고, 아니면 잘라내거나 출처 줄로 대신하거나 빼며 답에서 그렇다고 알린다. REMIX.md가 YouTube 검색부터 하라고 한 곳은 조사일 뿐이며, 기존 영상이 다룬 것을 웹 검색으로 볼 뿐 아무것도 내려받지 않는다.[](source:rx-footage) | episode-flow | footage |
| build | shot plan·build | 에이전트는 shot plan을 쓰고 kit 도구로 조립한다. 그래픽을 넣기 전에 editing.md에서 그 종류의 장면에 대한 creator의 선례를 찾고, 선례가 없으면 그 그래픽을 더하지 않는다. 템플릿에 없는 component는 가장 가까운 것을 쓰고 GAPS.md에 적는다. `templates/`는 pull된 그대로 둔다.[](source:rx-footage) 생성 media는 kit의 도구나 `npx hyperframes media-use generate`로 만들고 `media-use`의 Credits 규칙을 따른다. 가격·추정·잔액·사용한 credits는 실행 전·중·후에 먼저 말하지 않는다. 사용자가 한도를 말하면 호출마다 넘기지 않고 `.hyperframes/credit-limit.json`에 쓰며, 이어 할 때 아직 유효한지 묻는다. 한도에 안 맞는 단계는 줄이거나 빼기 전에 묻는다. 거절된 단계가 `billing` 명령을 이름으로 대면 사용자에게 그 명령을 돌리게 한 뒤 단계를 다시 돌린다. 실패하거나 거절된 job은 한 번 더 시도한 뒤 묻는다.[](source:sk-credits) | episode-flow | build |
| check | 검사 | 에이전트는 한 번에 무거운 일 하나만 한다(render, 긴 ffmpeg, transcription). render는 `--workers 1`, ffmpeg는 `-threads 2 -nostdin`으로 돌리고, 바뀐 곳이 있으면 그 구간만 render한다. REMIX.md의 검사를 돌리고 우리 수치를 시리즈 자체 수치 옆에 보고한다. 보고할 항목은 분당 cut 수, pause 밀도, 가장 긴 hold, loudness, 화면 전환의 sound effect, script fingerprint이고, 실패한 검사는 모두 이름을 댄다.[](source:rx-checks) 검사별 통과 기준은 REMIX.md에 있어 원문에 명시 없음. | episode-flow | check |
| stop2 | stop 2 draft | 두 번째 사람 승인 지점이다. 에이전트는 contact sheet와 `npx hyperframes preview --background --no-open`을 보여 주고, 기본 port 3002가 쓰이고 있으면 `--port <free port>`를 붙인다. 아직 stand-in인 것을 밝힌 뒤 draft에 대해 한 번 묻는다.[](source:rx-stop2) 수정 요청이 왔을 때 어디로 돌아가는지는 원문에 명시 없음. | episode-flow | stop2 |
| render | 전체 렌더 | 사용자의 확인 뒤 에이전트는 REMIX.md의 delivery가 부르는 전체 render를 한 번 한다. 20분을 넘길 듯한 render(전체 품질의 3D, 긴 cut)는 시작 전에 걸리는 시간을 대략 알리고, 도는 동안 로그가 분마다 찍는 경과 시간을 보고한다.[](source:rx-checks) 10분을 넘는 render는 shell이 끝나면 render도 멈추기 때문에 `HYPERFRAMES_RENDER_DETACHED=1`로 detached 시작해 로그로 지켜본다. 클라우드는 frame 수를 주지 않아서 3D shot이 20분 동안 `rendering`에 있어도 끝날 수 있으니 그것만으로 끄지 않고, 기다림을 멈춘 job은 `npx hyperframes cloud get <id>`로 확인한다.[](source:rx-checks)[](source:rx-stop2) | episode-flow | render |
| reply | 답과 기록 | 에이전트는 에피소드가 무엇인지, 길이(짧은 cut이면 전체는 한 번의 요청이면 된다는 말), 모든 stand-in, 실패한 검사와 그 이유, footage licence 표를 답한다. 프로젝트 `CLAUDE.md`에 만든 방법을 갱신하고, 맨 앞에 "이 에피소드의 변경은 style-sampling 스킬을 거친다"는 한 줄을 둔다. 그래야 나중 세션이 sign-in 확인을 돌리고 credit 한도가 아직 유효한지 묻는다. 프로젝트 루트에 LOG.md(단계마다 걸린 시간, 가격과 credit 숫자 없음)와 GAPS.md(템플릿이 빠졌거나 불분명하거나 틀린 곳을 파일과 절까지 적음)를 두고, GAPS.md는 건너뛰지 않는다.[](source:rx-reply) 판정 · 원문은 이 답 뒤에 별도 종료 문구를 두지 않는다. 답과 기록이 이 스킬의 마지막 행동이다. | episode-flow | reply |

둘째 그림이 생략한 것이 있다. 진행자가 없는 시리즈는 `face`를 지나지 않고 `audio`에서 `footage`로 곧장 간다는 점은 간선 말로 그렸다.

반면 stop 1·stop 2에서 사용자가 수정을 요구했을 때의 되돌림, 실패한 job의 재시도, 한도에 안 맞는 단계의 질문은 원문이 순서를 정하지 않아 그리지 않았다. 앞의 둘은 해당 노드 설명에, 뒤의 둘은 `shot plan·build` 설명에 문장으로 있다. `voice` 노드의 음성 결정은 `audio` 노드의 음성 제작보다 앞서며, 둘은 다른 일이다. 앞은 누구의 목소리를 쓸지 정하는 것이고 뒤는 대본을 그 목소리로 만드는 것이다.

사람이 맡는 지점은 stop 1·stop 2 말고도 있다. 로그인과 구독, 열린 것에 대한 한 번의 질문, 선택적 Pexels key, 한도 처리 중의 질문이다.[](source:sk-start)[](source:rx-ask)[](source:sk-credits)

## 언제 켜지고 5종은 각각 무엇을 만드나? {#activation span=12}

아래 frontmatter가 원문의 호출 관련 정보 전부다.[](source:sk-front)

@code source=sk-front language=yaml

원문은 호출 맥락으로 "an episode of", "in the style of", "sample this style"을 든다. 이 단어들은 호출을 판단하는 참고이고 정확히 일치해야 켜진다는 뜻이 아니다. 영상 하나를 그대로 복제하려는 요청은 `reverse-any-video`의 몫이라고 description 끝에 적었다.[](source:sk-front)

원문이 정한 "좋은 에피소드"는 그 시리즈의 시청자가 다음 업로드로 착각할 만한 것이다. 구조, 속도, 화면, 그래픽, 소리를 새 주제에 그대로 가져오되 사용자의 목소리로 만들고, 시리즈에 진행자가 있으면 사용자 본인의 얼굴을 쓴다.[](source:sk-goal)

| 템플릿 | slug / series | 만드는 것 | 사용자가 가져오는 것 |
| --- | --- | --- | --- |
| Collage Explainer | `collage-explainer` / `american-policy` | 미국 정책·역사 질문 하나를 다루는 영어 explainer | 목소리 |
| Finance Explainer | `finance-explainer` / `deep-dive` | 중국어 진행자가 국가·상품·기관 하나를 풀어 주는 영상 | 목소리와 얼굴 {caution:얼굴 필요} |
| Animated Science Explainer | `animated-science-explainer` / `science-explainer` | 전부 그려 만드는 영어 과학 explainer | 목소리 |
| 3D Brand Explainer | `3d-brand-explainer` / `brand-explained` | 브랜드나 디자인 하나를 3D 그래픽 세계에서 푸는 영어 영상 | 목소리 |
| 3D True Crime | `3d-true-crime` / `crime-hunt` | 추적이나 종결 사건을 어두운 3D 세계에서 재구성하는 영어 영상 | 목소리 |

표는 원문의 5종 표를 한국어로 풀어 쓴 것이다. 원문에서 확인한 값은 5개 이름, slug, series, 만드는 것, 사용자가 가져오는 것이다.[](source:sk-table)

@callout level=warning title="5종 밖 스타일에는 쓰지 않는다"
| 채널이나 영화를 이름으로 대면 한 줄로 5종이 아니라고 알리고, 목록 대신 `/reverse-any-video`와 `/hyperframes`(`../hyperframes/references/look.md`의 "From a reference") 두 길을 제안한다. 사용자가 고르기 전에는 아무것도 pull하지 않는다.[](source:sk-nofit) |
| 템플릿의 TEMPLATE.md가 "good for / not good for" 주제를 적고, 사용자의 주제가 맞지 않으면 한 줄로 그렇다고 알리며 가장 가까운 각도를 같은 메시지에서 제안한다. 맞지 않는 주제를 그래도 만들겠다는 제안은 하지 않는다. 그 판정 기준의 내용은 외부 템플릿에 있어 원문에 명시 없음.[](source:rx-read) |

원문에는 이 스킬이 켜지지 말아야 하는 조건을 따로 적은 절이 없다. 켜지지 않는 경우는 위 두 가지(5종 밖, 템플릿에 안 맞는 주제)와 Pro가 아닐 때의 pull 거절이다. Pro가 아닐 때는 스킬은 시작되지만 pull 단계로 넘어가지 못하고 로그인·구독 안내에서 멈춘다.[](source:sk-start)[](source:sk-pull)

## 무엇을 강제하고 금지하며 수치는 어떻게 정해져 있나? {#rules span=12}

이 규칙은 모두 스킬이 에이전트에게 주는 지시다. 이 저장소에서 이 규칙을 기계적으로 막는 코드는 확인하지 못했다. 한 가지 예외로 원문은 Pro 여부를 CLI와 서버가 검사한다고 설명한다("The CLI pulls them and the server checks the plan").[](source:sk-pro)

| 규칙 | 종류 | 조건 |
| --- | --- | --- |
| 템플릿을 기억, 웹, 다른 곳의 사본으로 다시 만들지 않는다 | 금지 | pull이 실패했을 때도 적용된다.[](source:sk-pull) |
| creator의 얼굴·목소리·footage·로고·쇼 이름을 쓰지 않는다 | 금지 | 에피소드에도, 사용자에게 하는 설명에도 쓰지 않는다. 사용자 본인의 clone과 녹음, credit을 붙인 stock voice는 괜찮다.[](source:sk-goal)[](source:rx-never) |
| 가격, 추정, 잔액, 사용한 credits를 먼저 말하지 않는다 | 금지 | 실행 전·중·후, 예고 메시지, `LOG.md`와 `GAPS.md`에서도 숫자를 쓰지 않는다.[](source:sk-credits)[](source:rx-coming)[](source:rx-reply) |
| auth status 결과의 plan과 credits 줄을 사용자에게 되풀이하지 않는다 | 금지 | 이 명령은 로그인 확인용이다.[](source:sk-start) |
| 템플릿을 고르기 전에 확인·pull·결제를 하지 않는다 | 금지 | 사용자가 템플릿을 지목했거나 주제가 하나에만 맞으면 해당 없음.[](source:sk-which) |
| Free나 미로그인 상태에서 pull하지 않는다 | 금지 | 로그인·구독 명령은 사용자가 prompt에 입력한다.[](source:sk-start) |
| `heygen avatar list`와 `heygen voice list`를 쓰지 않는다 | 금지 | 별도 로그인이라 다른 계정일 수 있다.[](source:rx-presenter)[](source:rx-voice) |
| 보드를 얻으려고 음성에 돈을 쓰지 않는다 | 금지 | stop 1에서 보드를 세울 때 적용된다.[](source:rx-stop1) |
| licence가 명시되지 않은 YouTube·TikTok·Instagram·X 영상을 받지 않는다 | 금지 | 로고·표지판·웹 screenshot은 허용 조건이 있을 때만 넣는다.[](source:rx-footage) |
| 403, 429, bot check를 우회하지 않는다 | 금지 | 다른 출처로 간다.[](source:rx-footage) |
| `templates/`를 고치지 않는다 | 금지 | 빠진 component는 가장 가까운 것을 쓰고 GAPS.md에 적는다.[](source:rx-footage) |
| creator의 선례가 없는 그래픽을 더하지 않는다 | 금지 | 선례는 editing.md에서 찾는다.[](source:rx-footage) |
| auth status를 매번 가장 먼저 돌린다 | 의무 | 이어 하는 세션에서도 같다.[](source:sk-start) |
| 목소리를 정한 뒤에만 연구를 시작한다 | 의무 | 정해지기 전에는 다른 것을 시작하지 않는다.[](source:rx-voice) |
| presenter take가 있는 뒤 대사가 바뀌면 take 전체를 다시 만든다 | 의무 | 아니면 입 모양이 어긋난다.[](source:rx-audio) |
| GAPS.md를 건너뛰지 않는다 | 의무 | 템플릿이 개선되는 통로다.[](source:rx-reply) |

판정 · 위 표에서 에이전트가 쓰는 말과 기록에 가격이 들어가지 않는지가 가장 눈에 띄는 확인 항목이다. 원문은 노트와 기록에도 가격과 credit 숫자를 넣지 말라고 하고, 기록에 남은 명령은 "메모"일 뿐이라 `--plan`으로 다시 만들어 확인하라고 한다.[](source:sk-credits)

| 항목 | 값 | 구분과 조건 |
| --- | --- | --- |
| 템플릿 수 | 5종 | 원문이 고정한 목록이다.[](source:sk-table) |
| 기본 길이 | 약 1분 | 길이도 주제도 말하지 않았을 때의 기본값이고, 답에서 긴 버전을 제안한다.[](source:rx-length) |
| 선택 길이 | 약 1분, 2~4분, 전체 | 사용자가 말한 길이가 템플릿 runtime보다 앞선다.[](source:rx-length) |
| 리뷰 횟수 | 1분은 1회, 전체는 2회 | 길이에 맞춰 줄이는 규칙이다.[](source:rx-length) |
| 직접 읽은 clone | 30초~3분 | 선택지 중 하나이고 HeyGen에서 만든다.[](source:rx-voice) |
| 접두어 조회 | `voices --limit 100` | 8자 접두어를 전체 id로 찾을 때다.[](source:rx-voice) |
| 렌더 부하 | `--workers 1`, `-threads 2 -nostdin` | 의무이고 한 번에 무거운 일 하나다.[](source:rx-checks) |
| 시간 안내 기준 | 20분 초과 가능 | 시작 전에 대략 걸리는 시간을 알린다.[](source:rx-checks) |
| detached render 기준 | 10분 초과 | 로그로 지켜본다.[](source:rx-stop2) |
| 3D shot의 `rendering` 대기 | 20분 | 20분 있어도 끝날 수 있으니 그것만으로 끄지 않는다.[](source:rx-checks) |
| preview port | 기본 3002 | 쓰이고 있으면 `--port <free port>`를 붙인다.[](source:rx-stop2) |
| 실패한 job | 한 번 더 시도 | 그 뒤 사용자에게 묻는다.[](source:sk-credits) |

값은 모두 원문의 지시이며 이 분석에서 실행하거나 측정하지 않았다. 템플릿 쪽 수치(분당 cut, loudness 같은 검사 기준)는 외부 템플릿에 있어 원문에 명시 없음.

## 이 스킬은 흐름 어디에 있나? {#position span=12}

묶음 `start-from-reference`에서 이 스킬은 검증된 스타일에서 새 에피소드를 만드는 선택지다. 앞에는 `hyperframes`의 요청 안내표가 있고, 5종 밖이면 뒤로 `reverse-any-video`나 `hyperframes`(`look.md`)가 이어진다. 전체 흐름은 `hyperframes/_group-start-from-reference/start-from-reference.html`을 본다.[](source:rel-group)

@workflow id=position-flow title="앞과 뒤, 이 스킬의 자리"
| hfin | hyperframes 안내표 | external |
| me | style-sampling | backend |
| rev | reverse-any-video | external |
| hfout | hyperframes look.md | external |
| hfin > me | R05 | emphasis |
| me > rev | R21 | |
| me > hfout | R22 | |

@steps id=position-steps
| hfin | hyperframes 안내표 | `hyperframes`의 요청별 안내표가 "검증된 스타일의 에피소드" 요청을 이 스킬 `/style-sampling`으로 안내한다. 안내표의 한 행이고 강제는 아니다.[](source:hf-route)[](source:rel-r05) | position-flow | hfin |
| me | style-sampling | 이 스킬이다. 5종 중 하나를 pull해 에피소드를 만든다. 5종 밖이면 만들지 않고 두 길을 제안만 한다.[](source:sk-nofit) | position-flow | me |
| rev | reverse-any-video | 5종 밖 스타일을 영상 하나를 기준으로 프레임 단위로 다시 만들고 내용을 바꾸는 길이다. 제안일 뿐 사용자가 고르고, 고르기 전에는 아무것도 pull하지 않는다.[](source:sk-nofit)[](source:rel-r21) | position-flow | rev |
| hfout | hyperframes look.md | 같은 상황의 다른 길이다. 그 스타일의 문법을 가져와 사용자 주제로 새 영화를 만든다. 역시 사용자가 고른다.[](source:sk-nofit)[](source:rel-r21) | position-flow | hfout |

| 관계 | 받는 것과 넘기는 것 | 조건 |
| --- | --- | --- |
| R05 · `hyperframes` → 이 스킬 · 넘김 | 받는 것은 "검증된 스타일의 에피소드"라는 요청이다. | 안내표의 한 행이고 강제는 아니다.[](source:rel-r05)[](source:hf-route) |
| R21 · 이 스킬 → `reverse-any-video` · 넘김 | 넘기는 것은 예시 영상이다. | 5종 밖일 때 제안한다. 사용자가 고르며 고르기 전에 pull하지 않는다.[](source:rel-r21)[](source:sk-nofit) |
| R22 · 이 스킬 → `hyperframes` · 넘김 | 넘기는 것은 예시 영상이다. | R21의 다른 길이다. "From a reference"(`look.md`)로 새 영화를 만든다. 사용자가 고른다.[](source:rel-r21)[](source:sk-nofit) |
| R23 · 이 스킬 → `media-use` · 참고 | 생성 media는 kit 도구나 `media-use generate`로 만든다. | `media-use`의 Credits 규칙을 따르고 가격은 먼저 말하지 않는다.[](source:rel-r21)[](source:sk-credits) |
| R24 · `media-use` ↔ 이 스킬 · 공유 상태 | 두 스킬이 `.hyperframes/credit-limit.json`을 쓴다. | 선후 관계는 없다. `media-use`는 `{"credits": N}` 형식을 적는다.[](source:rel-r21)[](source:mu-credits)[](source:sk-credits) |
| R13 · 이 스킬 → `hyperframes` · 참고 | 첫머리에서 plugin 안일 때 `../hyperframes/references/plugin-installation.md`를 가리킨다. | plugin 안에서 쓸 때만 해당한다.[](source:rel-r13)[](source:sk-plugin) |

그림에서 뺀 R23·R24·R13은 표에 남겼다. 원장 행과 원문(`hyperframes/SKILL.md` 64~65줄, `media-use/SKILL.md` 40줄, 이 스킬의 3·6·30·54줄)을 맞춰 보았고 관계 내용에 어긋남은 없었다.

## 어디까지 확인했고 무엇이 남았나? {#audit span=12}

결론: **부분 분석**이다. 이 스킬의 실제 절차는 pull한 템플릿의 `series/<series>/REMIX.md` 단계표에 있는데, 템플릿은 외부 자료라 이 저장소에 없다(`templates/` 폴더 없음을 확인했다). 이 페이지는 `SKILL.md`와 `references/remix.md`가 말하는 범위까지만 담는다.

@facts id=audit-facts
| 스킬 폴더의 텍스트 원본 | 2개, 전부 읽음. `SKILL.md` 5113B, `references/remix.md` 11074B |
| 관계 확인에 연 파일 | 3개, 일부만 읽음. `skill-explainers/hyperframes/relations.md` 15234B(이 스킬의 행 R05·R13·R21~R24와 묶음 행), `hyperframes/hyperframes/SKILL.md` 7481B(안내표 64~65줄), `hyperframes/media-use/SKILL.md` 5311B(40줄) |
| 번역본 | 이 스킬 폴더에 `*.KO.md` 없음. 열지 않았고 하단 출처에도 선언하지 않았다 |
| 바이너리·제외한 파일 | 없음 |
| 분석 중 바뀐 파일 | 없음 |
| 실행한 명령 | 없음. `npx hyperframes ...`는 실행하지 않았고 읽기 전용 확인(`grep`, `shasum`, `wc`)만 했다 |
| 선언하지 않은 읽은 파일 | 작성 지침 `EXPLAINER-PROMPT.md`와 `GLOSSARY.md`, archify 문법 문서. 근거가 아니라 작성 규칙이라 `@source`로 선언하지 않았다 |

@callout level=open-question title="확인하지 못한 것"
| 템플릿의 CHANNEL.md, TEMPLATE.md, REMIX.md, voice.md, frame.md, editing.md, footage.md, sound.md, `kit/`: 외부 템플릿이라 이 저장소에 없다. 템플릿별 runtime, slot, "good for / not good for" 주제, REMIX.md의 단계표와 검사 수치는 원문에 명시 없음. |
| `references/storyboard.md`, `references/look.md`, `references/plugin-installation.md`(hyperframes 스킬 소속)와 `media-use`의 Credits 규칙 전문: 다른 스킬의 파일이라 열지 않았고, 이 스킬이 가리키는 내용만 옮겼다. |
| `npx hyperframes` 명령(`auth`, `billing`, `templates pull`, `events`, `media-use`, `preview`, `render`, `cloud`)의 실제 동작: 실행하지 않았다. 이 페이지의 서술은 모두 지시상 동작이다. |
| stop 1·stop 2에서 사용자가 수정을 요구했을 때의 되돌림, 구독 완료 뒤 이어 하기, pull 실패 뒤 재시도 횟수: 원문에 명시 없음. 위 `@steps`에서 판정으로 표시한 곳 외에는 추정하지 않았다. |
