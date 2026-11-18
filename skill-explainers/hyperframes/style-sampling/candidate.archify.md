# style-sampling — 검증된 영상 스타일로 새 에피소드를 만든다 {#overview}

에이전트는 사용자가 고른 스타일 템플릿(스타일의 규칙과 도구를 담은 폴더)을 받아, 사용자의 주제로 새 에피소드 영상을 만든다.[](source:intro)

- 사용자가 5종 스타일 중 하나로 "한 편 더"를 청하면 켜진다. 5종은 Collage·Finance·Animated Science·3D Brand·3D True Crime이다.[](source:fm)[](source:table) 5종 밖 스타일이면 다른 두 길을 제안한다.[](source:which)
- 결과로 `templates/<slug>/`에 받은 템플릿, 렌더한 영상, 프로젝트 루트의 `LOG.md`와 `GAPS.md`가 남는다.[](source:pull)[](source:r-chk)[](source:r-reply)
- `hyperframes`가 이 스킬로 안내하고(다음 안내), 5종 밖이면 이 스킬이 `reverse-any-video`와 `hyperframes`를 제안한다(다음 안내). 생성 media는 `media-use`의 Credits 규칙을 따른다(참고).
- 창작자의 얼굴·목소리·footage·로고·쇼 이름은 쓰지 않는다. 템플릿은 HyperFrames Pro 기능이라 Pro가 아니면 받지 않는다.[](source:intro)[](source:start)

@answer scope="hyperframes/style-sampling · 원본 파일 2개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source fm title="frontmatter: name과 description" path=hyperframes/style-sampling/SKILL.md lines=1:4
@source beacon title="시작할 때 한 번 보내는 사용 신호" path=hyperframes/style-sampling/SKILL.md lines=8:8
@source plug title="plugin 안 설치 규칙" path=hyperframes/style-sampling/SKILL.md lines=6:6
@source intro title="좋은 에피소드의 기준과 금지" path=hyperframes/style-sampling/SKILL.md lines=10:16
@source table title="템플릿 5종 표" path=hyperframes/style-sampling/SKILL.md lines=18:24
@source which title="템플릿 고르기" path=hyperframes/style-sampling/SKILL.md lines=26:30
@source start title="로그인과 plan 확인" path=hyperframes/style-sampling/SKILL.md lines=32:38
@source pull title="템플릿 pull" path=hyperframes/style-sampling/SKILL.md lines=40:46
@source make title="에피소드 만들기와 두 번 멈춤" path=hyperframes/style-sampling/SKILL.md lines=48:50
@source credits title="Credits 규칙" path=hyperframes/style-sampling/SKILL.md lines=52:54
@source hfguide title="hyperframes 안내표의 style-sampling 행" path=hyperframes/hyperframes/SKILL.md lines=65:65
@source mucred title="media-use의 Credits 규칙" path=hyperframes/media-use/SKILL.md lines=40:40
@source r-prec title="remix.md 개요와 우선순위" path=hyperframes/style-sampling/references/remix.md lines=3:5
@source r-read title="템플릿 구성과 읽는 순서" path=hyperframes/style-sampling/references/remix.md lines=7:18
@source r-ask title="한 번에 묻는 것과 목소리·길이" path=hyperframes/style-sampling/references/remix.md lines=20:30
@source r-script title="사실·대본과 stop 1" path=hyperframes/style-sampling/references/remix.md lines=32:36
@source r-voice title="목소리와 얼굴" path=hyperframes/style-sampling/references/remix.md lines=38:43
@source r-foot title="footage와 조립" path=hyperframes/style-sampling/references/remix.md lines=45:51
@source r-chk title="검사, stop 2, 렌더" path=hyperframes/style-sampling/references/remix.md lines=53:59
@source r-reply title="답변과 기록" path=hyperframes/style-sampling/references/remix.md lines=61:64

## 어떻게 동작하나 {#flow span=12}

그림은 대표 경로만 그린다. 5종 밖 스타일, 로그인 안내, `pull` 실패는 해당 단계의 `다음`에 적었다. 대본이나 초안을 고치는 되돌림 간선은 원문에 명시 없음이라 그리지 않았다.

@workflow id=flow-diagram title="style-sampling 흐름"
| lane choose | 템플릿 고르기 |
| lane access | Pro 확인과 pull |
| lane make | 에피소드 제작 |
| pick | 템플릿 정해졌나? | external | choose | source:which |
| list | 5종 목록 보이기 | backend | choose | source:which |
| other | 5종 밖 스타일 | external | choose | source:which |
| auth | 로그인 확인 | backend | access | source:start |
| plan | Pro인가? | backend | access | source:start |
| stop | 안내하고 멈춤 | security | access | source:start |
| pull | 템플릿 pull | backend | access | source:pull |
| read | 읽고 한 번 묻기 | backend | make | source:r-ask |
| script | 사실과 대본 | backend | make | source:r-script |
| sb | stop 1 콘티 | backend | make | source:r-script |
| build | 음성·얼굴·영상 제작 | backend | make | source:r-foot |
| draft | stop 2 초안 | backend | make | source:r-chk |
| render | 렌더와 답변 | backend | make | source:r-chk |
| pick > auth | 예 | emphasis |
| pick > list | 아니오 |
| pick > other | 5종 밖 | dashed |
| list > auth | 사용자가 고름 |
| auth > plan | |
| plan > pull | Pro | emphasis |
| plan > stop | 미로그인·Free | dashed |
| pull > stop | Pro 거절 | dashed |
| pull > read | 받음 | emphasis |
| read > script | |
| script > sb | |
| sb > build | 사용자 go | emphasis |
| build > draft | |
| draft > render | 사용자 확인 | emphasis |

@steps id=flow-steps
| s-pick | 템플릿 정해졌나? | **입력** 사용자 요청 · **실행** `npx hyperframes events --skill=style-sampling` · **출력** 템플릿 하나, 목록 요청, 또는 5종 밖 스타일. **처리** 스킬이 시작될 때 이 신호를 한 번 보내고[](source:beacon), 사용자가 템플릿을 말했거나 주제가 하나에만 맞으면 그대로 진행한다.[](source:which) | flow-diagram | pick |
| s-list | 5종 목록 보이기 | **입력** 템플릿을 정하지 못한 요청 · **참조** SKILL.md의 5종 표 · **출력** 이름·만드는 것·사용자가 가져올 것의 짧은 목록. **처리** 주제에 맞는 템플릿이 있으면 그 이름을 짚고 사용자의 선택을 기다린다.[](source:which) **다음** 선택 전에는 확인도 pull도 결제도 하지 않는다.[](source:which) | flow-diagram | list |
| s-other | 5종 밖 스타일 | **입력** 사용자가 링크하거나 이름만 댄 채널·영화 · **출력** 두 길을 담은 한 줄 안내. **처리** 5종이 아니라고 알리고 두 길을 제안한다. 영상 하나를 프레임 단위로 다시 만들어 내용을 바꾸는 `/reverse-any-video`, 그 스타일의 문법으로 새 영화를 만드는 `/hyperframes`다.[](source:which) **다음** 두 길 모두 영상이 필요해서 이름만 댄 스타일에는 예시 영상을 요청한다. 사용자가 고르고, 그 전에는 아무것도 pull하지 않는다. 이 스킬의 흐름은 여기서 끝난다.[](source:which) | flow-diagram | other |
| s-auth | 로그인 확인 | **입력** 고른 템플릿 slug · **실행** `npx hyperframes auth status` · **출력** 로그인과 plan 상태. **처리** 재개할 때도 매번 먼저 실행한다. plan이나 credits 줄은 사용자에게 되풀이하지 않는다.[](source:start) | flow-diagram | auth |
| s-plan | Pro인가? | **입력** `auth status` 결과 · **출력** Pro 확인 한 줄 또는 안내. **처리** Pro이면 한 줄로 알리고 pull로 넘어간다.[](source:start) **다음** 미로그인과 Free는 다음 단계에서 안내하고 pull하지 않는다.[](source:start) | flow-diagram | plan |
| s-stop | 안내하고 멈춤 | **입력** 미로그인 또는 Free 상태 · **실행** 사용자가 프롬프트에 `!`와 함께 입력하는 `npx hyperframes auth login` 또는 `npx hyperframes billing subscribe --feature templates --skill style-sampling` · **출력** 안내 한 줄. **처리** 미로그인이면 템플릿이 Pro 기능이라고 한 줄로 알리고 login 입력 뒤 "done" 답을 기다린다. Free이면 한 번만 알리고 subscribe 입력을 부탁한다.[](source:start) **다음** 두 경우 모두 pull하지 않는다. "done" 뒤의 흐름은 원문에 명시 없음이다. 판정: `auth status`를 매번 먼저 실행하므로 이 단계부터 다시 시작한다.[](source:start) | flow-diagram | stop |
| s-pull | 템플릿 pull | **입력** Pro가 확인된 템플릿 slug · **실행** `npx hyperframes templates pull <slug>` · **출력** `templates/<slug>/` 폴더. **처리** 템플릿을 받는다. 크레딧은 들지 않고, 이미 있는 템플릿은 다시 받지 않는다.[](source:pull) **다음** Pro 기능이라는 거절은 Free처럼 안내하고 멈춘다. 그 밖의 실패는 무엇이 실패했는지 말하고 멈춘다. 기억·웹·다른 곳의 사본으로 템플릿을 다시 만들지 않는다.[](source:pull) | flow-diagram | pull |
| s-read | 읽고 한 번 묻기 | **입력** `templates/<slug>/` 폴더와 사용자 메시지 · **참조** `references/remix.md` · **출력** 질문 한 묶음과 진행 예고 한 메시지. **처리** CHANNEL.md, TEMPLATE.md, REMIX.md 순으로 읽고, 아직 열린 주제·길이·목소리·진행자 얼굴만 한 번에 묻는다.[](source:r-read)[](source:r-ask) **다음** 주제가 템플릿에 맞지 않으면 한 줄로 알리고 가장 가까운 각도를 제안한다. 맞지 않는 주제를 그대로 만들자고 제안하지 않는다.[](source:r-read) 목소리가 정해지기 전에는 다른 작업을 시작하지 않는다.[](source:r-ask) | flow-diagram | read |
| s-script | 사실과 대본 | **입력** 확정된 주제·길이·목소리 · **참조** REMIX.md, `voice.md` · **출력** 출처가 붙은 사실 목록과 대본. **처리** 숫자·날짜·인용마다 출처를 달아 사실을 모으고, 대본을 쓴 뒤 REMIX.md가 정한 대본 검사를 돌린다.[](source:r-script) | flow-diagram | script |
| s-sb | stop 1 콘티 | **입력** 대본과 shot plan · **참조** `../hyperframes/references/storyboard.md` · **실행** 대부분의 kit에서 `python3 tools/voice.py --silent` · **출력** 컷마다 정지 화면과 대본 줄을 담은 board. **처리** 침묵 stand-in으로 추정 timing을 만들어 `index.html`로 조립하고 board를 세운다. 모든 시간은 목소리가 생기기 전까지 추정이다.[](source:r-script) **다음** 사용자의 go를 기다린다. board를 얻으려고 목소리에 돈을 쓰지 않는다.[](source:r-script) | flow-diagram | sb |
| s-build | 음성·얼굴·영상 제작 | **입력** 승인된 board와 목소리 id · **참조** kit의 도구, `editing.md`, `footage.md` · **실행** 진행자가 있는 시리즈에서 `npx hyperframes media-use generate --type avatar` · **출력** 음성, 진행자 take, footage와 licence 줄, 조립된 프로젝트. **처리** 한 문단을 먼저 audition해 `voice.speed`를 맞추고, 확정된 음성 위에서 얼굴을 만든 뒤 footage를 찾아 조립한다.[](source:r-voice)[](source:r-foot) **다음** 진행자 take가 있는 뒤에 줄이 바뀌면 take 전체를 다시 만든다. YouTube·TikTok·Instagram·X에서는 licence가 명시되지 않으면 footage를 가져오지 않는다.[](source:r-voice)[](source:r-foot) | flow-diagram | build |
| s-draft | stop 2 초안 | **입력** 조립된 프로젝트 · **참조** REMIX.md의 검사 · **실행** `npx hyperframes preview --background --no-open` · **출력** contact sheet와 미리보기, 아직 stand-in인 것의 목록. **처리** REMIX.md의 검사를 돌려 실패한 검사를 모두 말하고, 우리 수치를 시리즈의 수치 옆에 놓은 뒤 초안을 한 번 묻는다.[](source:r-chk) **다음** 3002 포트가 사용 중이면 `--port <free port>`를 더한다. 두 번의 멈춤은 사용자의 몫이다.[](source:make) | flow-diagram | draft |
| s-render | 렌더와 답변 | **입력** 확인된 초안 · **실행** `npx hyperframes render -o <out> --workers 1` · **출력** 렌더 영상, `LOG.md`, `GAPS.md`, 갱신된 `CLAUDE.md`. **처리** REMIX.md가 정한 전체 렌더를 한 번 돌리고, 에피소드·길이·stand-in·실패한 검사·footage licence 표를 답한다.[](source:r-chk)[](source:r-reply) **다음** 20분을 넘길 렌더는 대략의 시간을 먼저 말한다. 10분을 넘는 렌더는 detached로 시작해 로그로 지켜본다.[](source:r-chk) | flow-diagram | render |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자가 "an episode of", "in the style of", "sample this style" 같은 말로 5종 스타일의 새 에피소드를 청하면 모델이 description을 보고 켠다. 호출 제한 필드는 없다.[](source:fm) |
| 성격 | 5종 템플릿 중 하나를 받아 사용자 주제의 새 에피소드를 만든다. 템플릿의 REMIX.md가 단계표이고, 이 스킬은 순서와 규율을 정한다.[](source:make)[](source:r-prec) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| hyperframes {#rel-r05} | **이 스킬** | 다음 안내 | 요청이 "검증된 스타일의 에피소드"일 때 쓰는 안내표의 한 행이다. 강제는 아니다.[](source:hfguide) |
| **이 스킬** 포함 7개 스킬 {#rel-r13} | hyperframes | 참고 | HyperFrames plugin 안일 때만 `../hyperframes/references/plugin-installation.md`의 plugin execution rules를 따른다.[](source:plug) |
| **이 스킬** {#rel-r21} | reverse-any-video | 다음 안내 | 5종에 없는 스타일(채널·영화를 이름으로 댄 경우)이면 영상 하나를 프레임 단위로 다시 만드는 길로 제안한다. 사용자가 고르고, 고르기 전에는 아무것도 pull하지 않는다. 이름만 댄 스타일은 예시 영상을 요청한다.[](source:which) |
| **이 스킬** {#rel-r22} | hyperframes | 다음 안내 | 같은 경우의 다른 길이다. 그 스타일의 문법을 가져와 사용자 주제의 새 영화를 만드는 `/hyperframes`("From a reference", `look.md`)를 제안한다. 사용자가 고른다.[](source:which) |
| **이 스킬** {#rel-r23} | media-use | 참고 | 생성 media는 kit의 도구나 `media-use generate`로 만들고 `media-use`의 Credits 규칙을 따른다. 가격·추정·잔액을 먼저 말하지 않는다.[](source:credits) |
| media-use {#rel-r24} | **이 스킬** | 같은 파일 | 두 스킬이 모두 사용자가 말한 credit 한도를 `.hyperframes/credit-limit.json`에 쓴다. 선후 관계는 없다.[](source:credits)[](source:mucred) |

@architecture id=relation-map title="style-sampling과 이어지는 스킬"
| hf | hyperframes | backend |
| mu | media-use | backend |
| rav | reverse-any-video | backend |
| self | style-sampling(이 스킬) | backend |
| hf > self | 다음 안내 |
| self > rav | 다음 안내 |
| self > hf | 다음 안내 · 참고 |
| self > mu | 참고 |
| mu > self | 같은 파일 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 5종 표, 템플릿 고르기, Pro 확인, pull, Credits 규칙을 담은 본문 | 스킬이 켜질 때 | 템플릿 정해졌나? · 5종 목록 보이기 · 5종 밖 스타일 · 로그인 확인 · Pro인가? · 안내하고 멈춤 · 템플릿 pull |
| `references/remix.md` | 에피소드를 만드는 순서와 두 번의 멈춤을 정한다 | `pull`로 템플릿을 받은 뒤. 재개할 때도 다시 읽는다[](source:make) | 읽고 한 번 묻기 · 사실과 대본 · stop 1 콘티 · 음성·얼굴·영상 제작 · stop 2 초안 · 렌더와 답변 |
| `templates/<slug>/` | 받은 템플릿. CHANNEL.md와 `series/<series>/`의 TEMPLATE.md, REMIX.md, kit 등이 든다. 이 저장소에는 없다[](source:r-read) | `remix.md`가 읽는 순서를 정한다 | 읽고 한 번 묻기 |
| `../hyperframes/references/storyboard.md` | board를 쓰는 형식. 이 저장소 폴더 밖 파일이라 읽지 못했다[](source:r-script) | stop 1에서 board를 만들 때 | stop 1 콘티 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 스킬이 시작될 때 | `npx hyperframes events --skill=style-sampling`를 한 번 실행한다. 스킬 이름이 CLI의 평소 telemetry에 실려 가며 opt-out을 따른다 | [](source:beacon) |
| 어느 단계에서든 | 창작자의 얼굴·목소리·footage·로고·쇼 이름을 쓰지 않는다(금지). 사용자 본인의 clone·녹음·크레딧을 밝힌 stock voice는 허용된다 | [](source:intro)[](source:r-ask) |
| 감사 문구에 나오는 창작자 이름 | 에피소드에도, 사용자에게 하는 설명에도 나오지 않는다 | [](source:intro) |
| 템플릿을 고르기 전 | 확인도 pull도 결제도 하지 않는다 | [](source:which) |
| 5종 밖 스타일 | 두 길을 제안하고 사용자가 고른다. 고르기 전에는 pull하지 않는다 | [](source:which) |
| 재개를 포함한 매번 | `npx hyperframes auth status`를 먼저 실행한다 | [](source:start) |
| 미로그인 또는 Free | 한 번만 안내하고 pull하지 않는다(강제) | [](source:start) |
| `pull`이 Pro 기능이라며 거절 | `auth status` 결과와 상관없이 Free로 안내한다 | [](source:pull) |
| `pull`이 그 밖의 이유로 실패 | 무엇이 실패했는지 말하고 멈춘다. 기억·웹·다른 사본으로 템플릿을 다시 만들지 않는다(금지) | [](source:pull) |
| 템플릿 규칙과 `remix.md`가 어긋남 | 템플릿이 이긴다. 사용자가 고른 길이와 Pro·credits(SKILL.md)는 예외다 | [](source:r-prec) |
| 주제가 템플릿에 맞지 않음 | 한 줄로 알리고 가장 가까운 각도를 제안한다. 맞지 않는 주제를 그대로 만들자는 제안은 하지 않는다 | [](source:r-read) |
| 길이 | 사용자가 정한 길이가 템플릿 runtime보다 앞선다. 답이 없고 주제에도 없으면 약 1분이다. 검토 라운드는 1분이면 1회, 전체 에피소드면 2회다 | [](source:r-ask) |
| 목소리 id | 사용자가 본인 것이거나 소유자가 동의했거나 HeyGen stock voice라고 말한 때만 쓴다. 아무것도 없으면 stock voice를 쓰고 AI 생성으로 크레딧한다 | [](source:r-ask) |
| stop 1 | 대본과 shot plan을 board로 세우고 사용자의 go를 기다린다. board를 위해 목소리에 돈을 쓰지 않는다 | [](source:r-script) |
| stop 2 | 초안을 한 번 묻고 사용자 확인 뒤에 전체 렌더를 돌린다 | [](source:r-chk)[](source:make) |
| footage 출처 | YouTube·TikTok·Instagram·X에서는 licence가 명시되지 않으면 가져오지 않는다. 접근을 거부하는 사이트의 검사를 우회하지 않는다 | [](source:r-foot) |
| graphic을 넣을 때 | `editing.md`에서 창작자의 선례를 먼저 찾고, 없으면 넣지 않는다 | [](source:r-foot) |
| 무거운 작업 | 한 번에 하나만 돌린다. 렌더는 `--workers 1`, ffmpeg는 `-threads 2 -nostdin`이다 | [](source:r-chk) |
| 크레딧 | 가격·추정·잔액·사용량을 먼저 말하지 않는다. 사용자가 말한 한도는 `.hyperframes/credit-limit.json`에 쓰고, 재개 때 아직 유효한지 묻는다. 맞지 않는 단계는 줄이거나 빼기 전에 묻고, 실패한 job은 한 번 더 시도한 뒤 묻는다 | [](source:credits) |
| 끝낼 때 | `LOG.md`와 `GAPS.md`를 프로젝트 루트에 두고, `CLAUDE.md`를 갱신한다. `GAPS.md`는 건너뛰지 않는다 | [](source:r-reply) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세: 아직 없음

상세 후보(요청하면 만든다):

- 템플릿 5종 비교 — 맡을 개요 항목은 "5종 목록 보이기"다. 시리즈 이름·만드는 것·가져올 것의 표가 개요에 들어가지 않았다.
- 목소리 확정 규칙 — 맡을 개요 항목은 "읽고 한 번 묻기"다. 본인 clone, 접두어 id, stock voice로 갈리는 분기가 많아 개요에 담지 않았다.
- 길이와 검토 라운드 — 맡을 개요 항목은 "읽고 한 번 묻기"다. 약 1분, 2~4분, 전체의 단계별 척도가 개요 밖이다.
- 콘티(stop 1)와 추정 timing — 맡을 개요 항목은 "stop 1 콘티"다. 무료 경로와 board 형식이 개요에 없다.
- 진행자(face) 만들기 — 맡을 개요 항목은 "음성·얼굴·영상 제작"이다. 본인 avatar, Avatar IV, Video 1 fallback의 순서가 개요 밖이다.
- footage 출처와 권리 — 맡을 개요 항목은 "음성·얼굴·영상 제작"이다. 사이트별 규칙과 licence 기록이 개요 밖이다.
- 검사와 렌더 운영 — 맡을 개요 항목은 "stop 2 초안"과 "렌더와 답변"이다. 렌더 시간 안내, detached 시작 명령, `cloud get` 확인이 개요 밖이다.
- Credits 규칙 — 맡을 개요 항목은 "무엇을 지키고 언제 멈추나"의 크레딧 행이다. 한도 파일과 refused 단계 처리가 개요에 요약만 있다.

@callout level=open-question title="확인하지 못한 것"
| 템플릿 안의 CHANNEL.md, TEMPLATE.md, REMIX.md, kit은 `pull`로 받은 뒤에만 생기므로 읽지 못했다. 단계표와 검사 항목의 실제 내용은 미확인이다. |
| `../hyperframes/references/storyboard.md`는 이 스킬 폴더 밖 파일이라 읽지 못했다. board 형식은 미확인이다. |
| `media-use`의 Credits 규칙은 40번째 줄 한 줄만 대조했다. 그 스킬의 나머지는 미조사다. |
| 로그인 안내 뒤 "done" 답을 받고 어느 단계로 돌아가는지는 원문에 명시 없음이다. |

읽은 원본: 텍스트 파일 2개. 제외: 없음.
