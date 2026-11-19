# reverse-any-video — 영상 파일을 편집 가능한 HyperFrames 프로젝트로 되살린다 {#overview}

reverse-any-video는 영상 파일 하나를 HyperFrames 프로젝트로 다시 만들고, 렌더 결과를 원본과 프레임 단위로 대조하게 하는 스킬이다.[](source:fm)

- 사용자가 영상을 reverse·recreate·remake·copy하려 하면 켜진다. 영상에 사람이 나오는지, 그림으로 그린 film인지에 따라 레이어 처리가 갈린다.[](source:fm)[](source:layers)
- 결과는 원본과 같은 크기·fps의 HyperFrames 프로젝트다. 작업 기록 `REVERSE.md`, 원본과 나란히 보는 영상, Studio preview도 남는다.[](source:intro)[](source:wrap)[](source:handover)
- 관계: `/hyperframes`와 style-sampling이 이 스킬을 안내하고(다음 안내), 이 스킬은 `/hyperframes` 계약과 media-use를 참고하며 remotion-to-hyperframes와는 대안이다.
- 하지 않는 것: 사용할 권리가 없는 영상은 reverse하지 않고, 사용자가 요청하지 않으면 내용을 바꾸지 않는다. 원본의 전체 frame을 그대로 재생하지도 않는다.[](source:intro)[](source:start)[](source:layers)

@answer scope="hyperframes/reverse-any-video · 원본 파일 5개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source fm title="frontmatter: name과 description" path=hyperframes/reverse-any-video/SKILL.md lines=1:4
@source plug title="plugin 안에서의 실행 규칙" path=hyperframes/reverse-any-video/SKILL.md lines=6:6
@source beacon title="시작 때 한 번 보내는 사용 신호" path=hyperframes/reverse-any-video/SKILL.md lines=8:8
@source intro title="목표, 계약, 권리" path=hyperframes/reverse-any-video/SKILL.md lines=12:12
@source start title="Pro 기능과 재개 규칙" path=hyperframes/reverse-any-video/SKILL.md lines=14:14
@source probe title="프레임 기준: probe와 소리" path=hyperframes/reverse-any-video/SKILL.md lines=18:20
@source orig title="원본이 frame을 정한다" path=hyperframes/reverse-any-video/SKILL.md lines=16:21
@source layers title="모든 레이어의 처리" path=hyperframes/reverse-any-video/SKILL.md lines=23:31
@source subasset title="sub-asset과 로고" path=hyperframes/reverse-any-video/SKILL.md lines=26:26
@source verify title="끝에 한 번 검사" path=hyperframes/reverse-any-video/SKILL.md lines=33:37
@source wrap title="혼자 작업하고 REVERSE.md를 남긴다" path=hyperframes/reverse-any-video/SKILL.md lines=39:39
@source st-open title="시작 명령과 CLI 판정" path=hyperframes/reverse-any-video/references/start.md lines=12:24
@source st-login title="로그인 안 된 경우" path=hyperframes/reverse-any-video/references/start.md lines=26:44
@source st-free title="Free 플랜인 경우" path=hyperframes/reverse-any-video/references/start.md lines=46:59
@source st-pro title="Pro 플랜인 경우" path=hyperframes/reverse-any-video/references/start.md lines=61:68
@source st-credit title="크레딧이 떨어진 경우" path=hyperframes/reverse-any-video/references/start.md lines=70:80
@source handover title="사람에게 넘기는 방법" path=hyperframes/reverse-any-video/references/start.md lines=82:86
@source st-time title="소요 시간 안내" path=hyperframes/reverse-any-video/references/start.md lines=88:91
@source ma-time title="match: 타이밍" path=hyperframes/reverse-any-video/references/match.md lines=5:9
@source ma-size title="match: 크기·글꼴·위치" path=hyperframes/reverse-any-video/references/match.md lines=11:15
@source ma-look title="match: 배경과 질감" path=hyperframes/reverse-any-video/references/match.md lines=17:22
@source pe-intro title="사람을 re-shoot하는 이유와 예외" path=hyperframes/reverse-any-video/references/people.md lines=3:3
@source pe-recipe title="사람 re-shoot 절차" path=hyperframes/reverse-any-video/references/people.md lines=7:23
@source pe-keep title="원본 음성 유지" path=hyperframes/reverse-any-video/references/people.md lines=25:25
@source an-intro title="애니메이션 film의 판단" path=hyperframes/reverse-any-video/references/animated.md lines=3:13
@source an-recipe title="생성 shot 절차" path=hyperframes/reverse-any-video/references/animated.md lines=15:33
@source hf-guide title="hyperframes 안내표" path=hyperframes/hyperframes/SKILL.md lines=64:64
@source ss-route title="style-sampling의 두 길 제안" path=hyperframes/style-sampling/SKILL.md lines=30:30
@source remo-desc title="remotion-to-hyperframes 설명" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=3:3
@source mu-logo title="media-use의 로고 규칙" path=hyperframes/media-use/SKILL.md lines=27:27

## 어떻게 동작하나 {#flow span=12}

절차형이다. 그림은 레이어 네 갈래를 한 번에 그렸지만, 실제 영상은 한 편에 여러 갈래가 함께 들어 있다. 해당하는 갈래마다 따로 처리한다.[](source:layers)

@workflow id=flow-diagram title="reverse-any-video 흐름"
| lane open | 시작 열기 |
| lane base | 프레임 기준 |
| lane build | 레이어 재구성 |
| lane finish | 검사·인계 |
| start | reverse start | backend | open | source:st-open |
| pro | Pro 확인? | backend | open | source:st-free |
| ask | 로그인·업그레이드 | external | open | source:st-login |
| probe | 캔버스·fps 맞추기 | backend | base | source:probe |
| cuts | 컷·변화 프레임 읽기 | backend | base | source:orig |
| comp | HTML로 다시 짓기 | backend | build | source:layers |
| sub | sub-asset 오리기 | backend | build | source:subasset |
| person | 사람 re-shoot | backend | build | source:pe-recipe |
| anim | 애니메이션 film | backend | build | source:an-recipe |
| check | check·render·diff | backend | finish | source:verify |
| fix | 고치고 한 번 더 | backend | finish | source:verify |
| hand | REVERSE.md·인계 | backend | finish | source:handover |
| start > pro | |
| pro > probe | Pro |
| pro > ask | 아니오 |
| ask > start | 다시 시작 |
| probe > cuts | |
| cuts > comp | 해당 레이어 |
| cuts > sub | 해당 레이어 |
| cuts > person | 해당 레이어 |
| cuts > anim | 해당 레이어 |
| comp > check | |
| sub > check | |
| person > check | |
| anim > check | |
| check > fix | |
| fix > hand | 한 번만 |

@steps id=flow-steps
| s-start | reverse start | **입력** 영상 파일 또는 링크 · **참조** `references/start.md` · **실행** `npx hyperframes events --skill=reverse-any-video`, `npx hyperframes reverse start <video> --dir <project>` · **출력** 영상 probe와 `reverse` 필드(`signed_in`, `plan`). **처리** 에이전트가 시작 신호를 한 번 보내고, `reverse` 필드로 로그인·plan 상태를 읽는다.[](source:beacon)[](source:st-open) **다음** 링크를 받았으면 내려받기 전에 `npx hyperframes auth status`를 먼저 돌린다. 재개(`REVERSE.md` 또는 반쯤 만든 프로젝트)도 같은 명령으로 연다.[](source:start) | flow-diagram | start |
| s-pro | Pro 확인? | **입력** `signed_in`·`plan` · **참조** `references/start.md` · **출력** 시작 안내문 또는 거절 안내. **처리** plan이 `pro`이면 한 줄만 말하고 바로 시작한다. 그 밖에는 이유를 말하고 멈춘다. 이 plan이 최종값이다.[](source:st-open)[](source:st-pro) **다음** plan이 `null`이면 `npx hyperframes auth status --json`의 `hyperframes` 필드를 읽는다. HeyGen app의 `user.subscription`은 읽지 않는다.[](source:st-open) | flow-diagram | pro |
| s-ask | 로그인·업그레이드 | **입력** `reverse.login_command`·`reverse.upgrade_url`·`fix` · **참조** `references/start.md` · **실행** `npx hyperframes auth login`, 사람이 실행할 `npx hyperframes billing subscribe --feature reverse --skill reverse-any-video --session <id>` · **출력** 사람에게 가는 안내문. **처리** 로그인은 에이전트가 돌리고 HeyGen이 사람을 re-shoot한다는 이유부터 말한다. Free이면 업그레이드 링크만 주고 사람이 Pro라고 할 때까지 시작하지 않는다.[](source:st-login)[](source:st-free) **다음** `subscribe_command`와 `upgrade_url`이 둘 다 `null`이면 구매할 수 없다고 말하고 링크 없이 멈춘다. 에이전트는 `billing` 명령을 실행하지 않는다.[](source:st-free) | flow-diagram | ask |
| s-probe | 캔버스·fps 맞추기 | **입력** 영상·probe · **실행** `npx hyperframes init <project> --video <video> --keep-original --skip-transcribe --skip-skills` · **출력** 원본 영상이 들어 있는 프로젝트. **처리** root composition 크기를 영상과 같게, `data-fps`를 영상 rate로, 길이를 frame 수÷fps로 정하고, 원본 영상을 `<audio src="<video>">` 하나로 전체에 깐다.[](source:probe) **다음** 모든 clip은 muted다. 추출하거나 다시 인코딩한 소리는 쓰지 않는다.[](source:probe) | flow-diagram | probe |
| s-cuts | 컷·변화 프레임 읽기 | **입력** 영상 · **실행** `npx hyperframes measure cuts <video>`, `npx hyperframes measure frames --range a,b --roi x,y,w,h` · **출력** 컷 frame 목록과 변화 구간의 연속 frame. **처리** jump cut과 punch-in까지 포함한 컷 목록을 뽑고, 컷·등장·퇴장·전환 앞뒤 몇 frame을 직접 읽는다.[](source:orig) **다음** 각 shot은 목록의 시간에 시작한다. 시간은 frame÷fps를 내림해 쓴다(30 fps의 83번 frame은 `2.766666`).[](source:orig) | flow-diagram | cuts |
| s-comp | HTML로 다시 짓기 | **입력** 컷 목록·원본 frame · **참조** `references/match.md` · **실행** `npx hyperframes transcribe`, `npx hyperframes measure events <video> --roi <band>`, `npx hyperframes measure frames --range a,b --roi <its box> --max 16` · **출력** HTML로 만든 text·caption·card·UI·chart·map. **처리** 에이전트가 글자 ink 크기, caption 전환 frame, backdrop, motion blur를 원본 픽셀에서 재어 맞춘다.[](source:layers)[](source:ma-time)[](source:ma-size)[](source:ma-look) **다음** 만드는 동안은 `npx hyperframes diff <video> . --at t,t,…`로 몇 순간만 렌더 없이 본다.[](source:verify) | flow-diagram | comp |
| s-sub | sub-asset 오리기 | **입력** 원본 frame의 sub-asset 상자(사진·clip·앨범 커버·로고·콜라주 속 사람) · **실행** 로고만 `npx hyperframes media-use resolve --type logo --intent "<brand> logo"` · **출력** 오려 낸 이미지·clip. **처리** 각 sub-asset을 원본에서 자기 상자로 오려 쓰고, 로고는 가장 큰 곳에서 오리거나 실제 마크를 받는다.[](source:subasset) **다음** 로고를 손으로 그리지 않는다.[](source:subasset) | flow-diagram | sub |
| s-person | 사람 re-shoot | **입력** 사람이 나오는 shot·원본 음성 · **참조** `references/people.md` · **실행** `npx hyperframes media-use generate --type video --reference <plate> --motion <the original shot> --mask <x,y,w,h,a-b> --audio <the original voice over that shot> --aspect <the source's> --seconds <n> --prompt "<who, where, what they do, the camera>" --out <shot>.mp4` · **출력** shot마다 HeyGen이 만든 clip. **처리** 원본 shot마다 plate(글자와 다른 얼굴을 지운 frame) 하나로 clip 하나를 만들고, 얼굴 상자가 원본의 5% 안인지 확인한다.[](source:pe-recipe) **다음** 사람이 HeyGen을 쓰지 말라고 하면 그 사람을 자기 상자로 오려 쓰고 burned-in text가 따라왔다고 밝힌다.[](source:pe-intro) | flow-diagram | person |
| s-anim | 애니메이션 film | **입력** 그림·3D 애니메이션 shot · **참조** `references/animated.md` · **실행** `npx hyperframes media-use generate --type video --reference <plate> --motion <the original shot> --aspect <the source's> --seconds <n> --prompt "<the painting style, what moves, the camera>" --out <shot>.mp4` · **출력** 코드 레이어와 생성 clip. **처리** 에이전트가 shot마다 코드로 지을 것(글자, 로고, 빛, 정지한 세계 위 camera)과 생성할 것(연기, 변형, 흐르는 세부)을 가르고, 시작 전에 사람의 언어로 그 사실을 알린다.[](source:an-intro) **다음** 생성 clip은 camera 이동이 늦게 나오므로 shot마다 `data-media-start`와 `data-playback-rate`로 다시 맞춘다.[](source:an-recipe) | flow-diagram | anim |
| s-check | check·render·diff | **입력** 모든 shot에 내용이 찬 프로젝트 · **실행** `npx hyperframes check`, `npx hyperframes cloud render --fps <data-fps> --quality high -o <out>`, `npx hyperframes diff <video> <out>` · **출력** 렌더 영상과 diff 목록(놓친 컷, 소리 offset, 빈 구간, 최악 순간). **처리** `check` 오류를 고치고 cloud render 뒤 원본과 diff한다. 원본 자신의 색·작은 글자는 `check`가 지적해도 둔다.[](source:verify) **다음** fps가 분수이거나 16:9·9:16·1:1이 아니거나 cloud render가 실패하면 `npx hyperframes render -o <out>`을 로컬에서 foreground 10분 timeout으로 돌린다. 실패 이유는 사람에게 말한다.[](source:verify) | flow-diagram | check |
| s-fix | 고치고 한 번 더 | **입력** diff가 가리킨 항목(빠진 컷·element, 틀린 시간·크기·weight·색) · **출력** 고친 프로젝트와 마지막 diff 수치. **처리** 눈에 보이는 것만 고치고 render와 diff를 한 번 더 한 뒤 멈춘다.[](source:verify) | flow-diagram | fix |
| s-hand | REVERSE.md·인계 | **입력** 마지막 diff · **참조** `references/start.md` · **실행** `npx hyperframes diff`의 마지막 실행에 `--sbs`, `npx hyperframes preview`, `npx hyperframes events --skill=reverse-any-video --event=skill_completed --outcome=success` · **출력** `REVERSE.md`, 원본과 나란히 보는 영상, Studio preview. **처리** 에이전트가 만든 것·자른 것·re-shoot한 것·근사한 것(대체 글꼴)과 마지막 diff 수치를 `REVERSE.md`에 쓰고, 사람에게 결과와 preview를 보여 준다.[](source:wrap)[](source:handover) **다음** 영상을 넘기지 못하고 멈추면 `--outcome=error`를 보낸다. `REVERSE.md`에는 가격이나 크레딧 수치를 쓰지 않는다.[](source:st-open)[](source:wrap) | flow-diagram | hand |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(description). description에 reverse·recreate·remake·replicate·copy와 중국어 요청 두 문장이 있다. 호출 제한 필드는 frontmatter에 없다.[](source:fm) |
| 성격 | 영상 하나를 프레임 단위로 대조하며 HyperFrames 프로젝트로 다시 만든다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| hyperframes {#rel-r04} | **이 스킬** | 다음 안내 | 요청이 "복사하거나 다시 만들 영상"일 때 안내표의 한 행으로 가리킨다. 강제는 아니다.[](source:hf-guide) |
| **이 스킬** {#rel-r13} | hyperframes | 참고 | HyperFrames plugin 안일 때만 plugin execution rules를 따르고 `../hyperframes/references/plugin-installation.md`를 본다.[](source:plug) |
| **이 스킬** {#rel-r14} | hyperframes | 참고 | 결과물을 `/hyperframes` 계약에 맞춰 만든다. 의무 어조다.[](source:intro) |
| **이 스킬** {#rel-r20} | media-use | 참고 | 사람·애니메이션 재생성은 `media-use generate`, 로고는 `media-use resolve --type logo`로 지목한다. 스킬 이름이 아니라 명령으로 가리킨다.[](source:pe-recipe)[](source:an-recipe)[](source:subasset)[](source:mu-logo) |
| style-sampling {#rel-r21} | **이 스킬** | 다음 안내 | 5개 템플릿에 없는 스타일(채널·영화를 이름으로 댄 경우)이면 두 길 중 하나로 제안한다. 사람이 고르고, 고르기 전에는 아무것도 pull하지 않는다.[](source:ss-route) |
| **이 스킬** {#rel-r28} | remotion-to-hyperframes | 대안 | 둘 다 기존 작업(영상 파일, 영상 코드)을 HyperFrames로 가져와 원본과 대조한다. 직접 연결은 없다. 판정: 두 description에서 추론했다.[](source:fm)[](source:remo-desc) |

@architecture id=relation-map title="reverse-any-video와 이어지는 스킬"
| hf | hyperframes | backend |
| ss | style-sampling | backend |
| mu | media-use | backend |
| remo | remotion-to-hyperframes | backend |
| self | reverse-any-video(이 스킬) | backend |
| hf > self | 다음 안내 |
| ss > self | 다음 안내 |
| self > hf | 참고 |
| self > mu | 참고 |
| self > remo | 대안 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 프레임 기준, 레이어 규칙, 끝 검사, `REVERSE.md` 규칙을 담은 본문 | 스킬이 켜지면 읽는다 | reverse start, 캔버스·fps 맞추기, 컷·변화 프레임 읽기, check·render·diff, 고치고 한 번 더 |
| `references/start.md` | 시작 안내, 로그인·Free·Pro 문구, 크레딧 부족, 인계, 소요 시간 | `reverse start`로 열 때 읽는다 | reverse start, Pro 확인?, 로그인·업그레이드, REVERSE.md·인계 |
| `references/match.md` | 그린 레이어를 원본에 맞추는 타이밍·크기·질감·효과 recipe | 글자·배경·효과를 HTML로 다시 지을 때 읽는다 | HTML로 다시 짓기 |
| `references/people.md` | 사람이 나온 shot을 HeyGen으로 re-shoot하는 6단계 | 영상에 사람이 있을 때 읽는다 | 사람 re-shoot |
| `references/animated.md` | 그림·3D 애니메이션 film에서 코드와 생성을 가르는 기준과 절차 | 영상이 애니메이션 film일 때 읽는다 | 애니메이션 film |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| `reverse start`가 거절한다 | 에이전트가 이유와 `fix`·업그레이드 링크를 사람에게 주고, 사람이 Pro라고 할 때까지 시작하지 않는다 | [](source:start) [](source:st-free) |
| 어떤 경우든 `billing` 명령 | 금지. 에이전트는 실행하지 않고 사람이 직접 한다 | [](source:start) [](source:st-free) |
| 로그인 안 됨 | 로그인 안내마다 HeyGen이 사람을 re-shoot한다는 이유를 먼저 말한다. API key 로그인은 금지다 | [](source:st-login) |
| 가격·추정·잔액·사용 크레딧 | 거절된 step이 아니면 먼저 말하지 않는다. `REVERSE.md`에도 쓰지 않는다 | [](source:st-pro) [](source:wrap) |
| 크레딧 부족(여러 step이 함께 거절) | launch한 step이 모두 응답할 때까지 기다리고, 필요한 합계로 한 번만 안내한다. 사람이 충전했다고 하면 거절된 step을 모두 다시 launch한다 | [](source:st-credit) |
| 이전 session이 포기한 step(re-shoot 거절 등) | 한 번 더 시도하고, 그래도 안 되면 사람에게 묻는다. 크레딧 한도가 있었으면 아직 유효한지 묻는다 | [](source:start) |
| 컷 시간을 쓴다 | frame÷fps를 내림한다. `2.767`처럼 올리면 한 frame 늦는다 | [](source:orig) |
| 소리 | 원본 영상 하나를 `<audio>`로 전체에 깔고 모든 clip을 muted로 둔다 | [](source:probe) |
| 원본의 전체 frame, 로고 | 전체 frame 재생은 금지다. 로고는 손으로 그리지 않는다 | [](source:layers) [](source:subasset) |
| 사람 shot | 컷을 걸치는 shot은 만들지 않는다. 얼굴 상자가 원본에서 5% 넘게 어긋나면 한 번 다시 만들고, 그다음엔 좋은 부분만 자른다 | [](source:pe-recipe) |
| HeyGen이 shot을 거절하거나 실패 | 한 번 더 시도한 뒤 사람에게 원본 footage를 둘지 뺄지 묻는다 | [](source:pe-recipe) |
| 최종 diff 뒤 | 보이는 문제만 고치고 render와 diff를 한 번 더 한 뒤 멈춘다 | [](source:verify) |
| 작업 방식 | 에이전트 하나가 전체 영상을 맡는다. 서브에이전트로 나누지 않는다 | [](source:wrap) |
| `REVERSE.md`에 적힌 명령 | 메모일 뿐 script가 아니다. 재개하면 절차에서 다시 짓고 `--plan`으로 확인하며, 적힌 그대로 실행하지 않는다 | [](source:wrap) |
| 소요 시간 안내 | 1분 미만 클립은 20~50분이라고 말한다. 더 긴 수치는 지어내지 않고, 긴 영상은 구간으로 나눈다고 구간 수를 말한다 | [](source:st-time) |
| plugin 안인데 CLI가 `reverse start`를 모른다 | 비용이 나가기 전에 멈추고 plugin 업데이트가 필요하다고 한 줄로 말한다 | [](source:st-open) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 오래된 CLI 판정과 버전 고정 — Pro 확인? · plugin 밖에서 `_meta.updateAvailable`, `signed_in: false`일 때 `npx -y hyperframes@<version>`으로 run 전체를 고정하는 규칙
- 로그인 방식(`auth login`, `--device`) — 로그인·업그레이드 · browser가 없는 환경에서 먼저 링크와 code를 보내는 순서
- 크레딧 한도와 `--plan` — 사람 re-shoot · 사람이 말한 한도가 있을 때 shot별 가격 확인과 `--max-credits` 전달, 한도 안에서 사람을 자르기 전 묻는 규칙
- 사람 shot 6단계 — 사람 re-shoot · plate 만들기, 원본 clip을 `--motion`으로 쓰기, `--mask` 규칙, 긴 shot 분할, 얼굴 framing, 사람 뒤 text cutout
- 생성 clip 점검 규칙 — 사람 re-shoot · `cuts_inside`와 `--allow-cuts`, 30분 대기 뒤 재시도, 실패 처리
- 애니메이션 film 절차 — 애니메이션 film · 컷을 눈으로 판정하기, plate, framing, retime, `REVERSE.md` 기재
- 그린 레이어 맞추기 recipe — HTML로 다시 짓기 · caption 전환 frame 측정, ink 기준 글자 크기, 큰 글자의 일생, 채움·gradient·glass·outline 등 효과 recipe
- 로컬 render 방법 — check·render·diff · 10분을 넘는 render를 detached로 돌리고 log로 기다리는 방법

@callout level=open-question title="확인하지 못한 것"
| `npx hyperframes`의 하위 명령(`reverse start`, `measure`, `diff`, `media-use generate`)은 스킬 폴더 밖 CLI라 내부 구현을 확인하지 못했다. 위 실행 칸은 원문이 에이전트에게 지시한 명령이다. |
| `hyperframes/hyperframes/references/plugin-installation.md`는 이 스킬의 원본 폴더 밖이라 읽지 않았다. |

읽은 원본: 텍스트 파일 5개. 제외: 없음.
