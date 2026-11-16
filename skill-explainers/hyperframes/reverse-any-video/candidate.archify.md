# reverse-any-video는 영상 파일을 어떻게 다시 만들고 무엇을 강제하나? {#reverse-any-video-page}

`reverse-any-video`는 영상 파일 한 개를, 원본과 프레임 단위로 맞고 나중에 편집할 수 있는 HyperFrames 프로젝트로 다시 만들 때 에이전트가 따르는 작업 순서다.[](source:intro) 부분 분석이다. 지시문만 읽었고 CLI는 실행하지 않았으며, 폴더 밖 참조 문서는 일부만 읽었다.

- 사용자가 영상 파일을 복사하거나 다시 만들어 달라고 할 때 쓰고, HyperFrames Pro 계정이 있어야 시작한다. 사용 권리가 있는 영상만 다루고, 요청이 없으면 원본 그대로 다시 만든다.[](source:intro)[](source:pro)
- 에이전트는 크기, `data-fps`, 컷 시각, 소리가 원본과 같은 프로젝트를 만든다. 마지막에 `check`, 렌더, `diff`를 돌려 한 번 고치고, `REVERSE.md`를 쓰고 `preview`로 넘긴다.[](source:frame)[](source:final)[](source:fix)[](source:alone)
- 에이전트는 `billing` 명령을 실행하지 않고, 원본 프레임을 통째로 재생하지 않고, subagent에 나누지 않는다.[](source:free)[](source:layers)[](source:alone)

@answer scope="이 스킬 폴더 텍스트 5개 전부 · 폴더 밖 3개 파일은 줄 범위만 · 관계 원장 1개 · CLI 실행 없음 · 부분 분석"
@meta locale=ko
@source front title="frontmatter" path=hyperframes/reverse-any-video/SKILL.md lines=1:4
@source plugin title="plugin 규칙" path=hyperframes/reverse-any-video/SKILL.md lines=6:6
@source beacon title="사용 beacon" path=hyperframes/reverse-any-video/SKILL.md lines=8:8
@source intro title="목표와 권리" path=hyperframes/reverse-any-video/SKILL.md lines=10:12
@source pro title="Pro 기능과 재개" path=hyperframes/reverse-any-video/SKILL.md lines=14:14
@source frame title="원본이 프레임을 정한다" path=hyperframes/reverse-any-video/SKILL.md lines=16:21
@source layers title="레이어별 처리" path=hyperframes/reverse-any-video/SKILL.md lines=23:31
@source midcheck title="제작 중 확인" path=hyperframes/reverse-any-video/SKILL.md lines=35:35
@source final title="끝 확인과 렌더" path=hyperframes/reverse-any-video/SKILL.md lines=36:36
@source fix title="고치고 멈춤" path=hyperframes/reverse-any-video/SKILL.md lines=37:37
@source alone title="단독 작업과 REVERSE.md" path=hyperframes/reverse-any-video/SKILL.md lines=39:39
@source start-voice title="사용자에게 쓰는 말투" path=hyperframes/reverse-any-video/references/start.md lines=1:7
@source start-event title="완료 event" path=hyperframes/reverse-any-video/references/start.md lines=9:10
@source start-probe title="probe와 plan 판정" path=hyperframes/reverse-any-video/references/start.md lines=12:24
@source login title="로그인 안 됨" path=hyperframes/reverse-any-video/references/start.md lines=26:44
@source free title="Free 계정" path=hyperframes/reverse-any-video/references/start.md lines=46:59
@source prosign title="Pro 계정" path=hyperframes/reverse-any-video/references/start.md lines=61:68
@source credits title="credit 부족" path=hyperframes/reverse-any-video/references/start.md lines=70:80
@source handover title="결과 전달" path=hyperframes/reverse-any-video/references/start.md lines=82:86
@source time title="소요 시간" path=hyperframes/reverse-any-video/references/start.md lines=88:91
@source match-time title="타이밍 규칙" path=hyperframes/reverse-any-video/references/match.md lines=5:9
@source match-size title="크기·글꼴·위치" path=hyperframes/reverse-any-video/references/match.md lines=11:15
@source match-look title="배경·blur·격자" path=hyperframes/reverse-any-video/references/match.md lines=17:22
@source match-word title="큰 글자의 일생" path=hyperframes/reverse-any-video/references/match.md lines=24:26
@source match-recipe title="효과 recipe" path=hyperframes/reverse-any-video/references/match.md lines=28:39
@source people-intro title="재촬영 원칙" path=hyperframes/reverse-any-video/references/people.md lines=3:3
@source people-cuts title="컷마다 샷 하나" path=hyperframes/reverse-any-video/references/people.md lines=7:7
@source people-plate title="샷별 plate" path=hyperframes/reverse-any-video/references/people.md lines=8:8
@source people-gen title="생성 명령" path=hyperframes/reverse-any-video/references/people.md lines=9:17
@source people-credit title="credit 한도" path=hyperframes/reverse-any-video/references/people.md lines=19:19
@source people-check title="샷 검사와 재시도" path=hyperframes/reverse-any-video/references/people.md lines=21:21
@source people-frame title="얼굴 위치 맞추기" path=hyperframes/reverse-any-video/references/people.md lines=22:22
@source people-behind title="글자 뒤의 사람" path=hyperframes/reverse-any-video/references/people.md lines=23:23
@source people-end title="음성과 하위 자산" path=hyperframes/reverse-any-video/references/people.md lines=25:25
@source anim-intro title="애니메이션 영상 전제" path=hyperframes/reverse-any-video/references/animated.md lines=3:7
@source anim-split title="코드와 생성의 구분" path=hyperframes/reverse-any-video/references/animated.md lines=9:13
@source anim-cuts title="컷 읽기" path=hyperframes/reverse-any-video/references/animated.md lines=15:19
@source anim-gen title="plate와 생성 명령" path=hyperframes/reverse-any-video/references/animated.md lines=20:28
@source anim-frame title="위치와 시간 맞추기" path=hyperframes/reverse-any-video/references/animated.md lines=30:33
@source hf-contract title="HyperFrames 계약" path=hyperframes/hyperframes/SKILL.md lines=18:33
@source hf-route title="요청별 안내표" path=hyperframes/hyperframes/SKILL.md lines=64:64
@source sty-desc title="description" path=hyperframes/style-sampling/SKILL.md lines=3:3
@source sty-route title="5종 밖 스타일" path=hyperframes/style-sampling/SKILL.md lines=30:30
@source media-logo title="logo 조달" path=hyperframes/media-use/SKILL.md lines=27:27
@source ledger title="관계 원장" path=skill-explainers/hyperframes/relations.md

## 켜지면 에이전트는 무엇을 하고 어떻게 끝나나? {#behavior-main span=12}

이 그림은 주 경로 전체 지도다. 로그인 안 됨, credit 부족, 업그레이드 링크가 없는 경우의 중단, 화면 속 사람 재촬영은 그리지 않았다. 처음 둘은 다음 패널 `시작할 때 사용자에게 무엇을 어떻게 말하나?`에, 재촬영은 그다음 `화면 속 사람과 애니메이션 샷은 어떻게 다시 만드나?`에 풀어 썼다.

@workflow id=reverse-flow title="영상 하나를 다시 만드는 주 경로"
| start | reverse start 실행 | backend |
| gate | Pro 계정인가? | backend |
| upgrade | 업그레이드 안내 | external |
| frame | 원본 기준 맞추기 | backend |
| layers | 레이어 나누기 | backend |
| build | 제작과 중간 diff | backend |
| final | check와 렌더, diff | backend |
| fix | 고치고 재확인 | backend |
| done | REVERSE.md와 인계 | frontend |
| start > gate | |
| gate > frame | Pro | emphasis |
| gate > upgrade | Free |
| upgrade > start | 업그레이드 후 |
| frame > layers | |
| layers > build | |
| build > final | 모든 샷 완료 |
| final > fix | |
| fix > done | 한 번 더 렌더 후 |

@steps id=reverse-steps
| start | reverse start 실행 | 에이전트는 skill이 시작될 때 `npx hyperframes events --skill=reverse-any-video`를 한 번 실행한다. 원문에 따르면 이 명령은 skill 이름을 CLI의 보통 telemetry와 함께 보내고, 로그인했다면 계정에 연결하며 사용자의 opt-out을 따른다.[](source:beacon) 이어서 입력이 영상 파일이든 링크든 `npx hyperframes reverse start <video> --dir <project>`로 연다. 링크라면 내려받기 전에 `npx hyperframes auth status`를 먼저 실행한다. `REVERSE.md`나 만들다 만 프로젝트가 있는 재개도 같은 명령으로 연다.[](source:pro) 이 명령은 영상의 probe와 `reverse` 필드를 출력한다. 에이전트는 그 필드의 `signed_in`과 `plan`(`free` 또는 `pro`)으로 다음 길을 고르고, 이 plan 값을 최종으로 본다. `plan`이 `null`일 때만 `npx hyperframes auth status --json`의 `hyperframes` 필드를 읽고, HeyGen 앱의 plan인 `user.subscription`은 읽지 않는다.[](source:start-probe) plugin 밖에서 CLI가 `reverse start`를 모르거나, 출력에 `_meta.updateAvailable: true`가 있거나, `signed_in: false`인데 `reverse.next`가 없으면 낡은 설치로 본다. 그러면 `npx -y hyperframes@latest --version`을 한 번 실행하고 `reverse start`부터 이후 모든 명령을 `npx -y hyperframes@<그 버전> <command>`로 돌려 한 run이 한 release만 쓰게 한다.[](source:start-probe) plugin 안에서는 plugin에 고정된 CLI가 돌아간다. 그 CLI가 `reverse start`를 모르면 비용이 나가기 전에 멈추고, plugin 업데이트가 필요하다고 한 줄로 알린다.[](source:start-probe) 이전 session이 포기한 단계(거절된 재촬영)는 한 번 더 시도하고 그래도 안 되면 사용자에게 묻는다. credit 한도 아래서 돌던 작업이면 그 한도가 지금도 유효한지 묻는다.[](source:pro) 원문은 plugin 안이라면 plugin execution rules를 따르라고 하지만, 그 문서는 이 분석에서 읽지 않았다.[](source:plugin) | reverse-flow | start |
| gate | Pro 계정인가? | 에이전트는 `reverse start`가 출력한 `signed_in`과 `plan`으로 세 갈래 중 하나를 고른다. 로그인이 안 됐으면 로그인 절차로 가고(그림에는 없다), Free면 아래 `업그레이드 안내`로 가며, Pro면 한 줄만 말하고 바로 시작한다.[](source:start-probe) Pro일 때 원문이 든 예시 문장은 "로그인됐고 20~50분 걸리며 맞으면 프로젝트를 보여 주겠다"는 뜻이다.[](source:prosign) 에이전트는 가격, 추정, 잔액, 사용한 credit을 먼저 말하지 않는다. 결제 얘기는 어떤 단계가 거절당했을 때만 나온다.[](source:prosign) | reverse-flow | gate |
| upgrade | 업그레이드 안내 | Free 계정이면 에이전트는 이유를 한 줄로 말하고 `reverse.upgrade_url`을 링크로 건넨다. 사용자가 원하면 대신 돌릴 `reverse.subscribe_command`도 출력된 그대로 건넨다(`npx hyperframes billing subscribe --feature reverse --skill reverse-any-video --session <id>`). 둘 다 플랜 페이지를 열고, 가격을 보고 결정하는 일은 사용자 몫이다.[](source:free) 에이전트가 `billing` 명령을 직접 실행하는 일은 금지다.[](source:free)[](source:pro) 사용자가 Pro라고 말할 때까지 아무것도 시작하지 않고, 말하면 `reverse start`를 다시 실행한다. 이것이 그림의 되돌아가는 간선이다. `reverse start`가 오류로 거절하면서 그 오류의 `fix`가 이 명령이면 `fix`로 같은 안내를 한다. `subscribe_command`와 `upgrade_url`이 둘 다 `null`이거나 거절문이 명령을 말하지 않으면 지금은 플랜을 살 수 없는 상태다. 이때는 그렇다고 분명히 말하고 링크 없이 멈춘다.[](source:free) | reverse-flow | upgrade |
| frame | 원본 기준 맞추기 | 에이전트는 먼저 `npx hyperframes init <project> --video <video> --keep-original --skip-transcribe --skip-skills`로 프로젝트를 만든다. 이 명령은 영상을 원래 파일명 그대로 복사해 넣고 `cloud render`에 쓸 session을 저장한다. 영상을 `<project>`에 미리 두면 `init`이 다른 파일이 있는 폴더를 거절하므로 그때까지 밖에 둔다.[](source:start-probe) 그다음 `reverse start`가 출력한 probe를 기준으로 root composition의 크기를 영상과 똑같이 맞춘다. `data-fps`는 probe의 rate로 하고 NTSC rate는 분수 그대로 둔다(`30000/1001`). 길이는 영상의 frame 수를 fps로 나눈 값이며 오디오 길이가 아니다. `init`의 기본 canvas는 대부분의 영상에 틀린 값이다.[](source:frame) 이어서 `npx hyperframes measure cuts <video>`로 모든 컷의 frame을 얻는다. jump cut과 한 샷 안의 punch-in도 포함하고, ffmpeg의 scene score는 이것들을 놓친다. 모든 샷은 목록의 시각에 시작해야 한다. 시각은 frame을 fps로 나눈 값을 내림해 쓴다. 30 fps에서 frame 83은 `2.766666`이고 `2.767`은 한 frame 늦다.[](source:frame) 소리는 원본의 것이다. `init --video`가 영상을 넣어 두었으므로 전체 길이에 `<audio src="<video>">` 하나를 깔고, 추출하거나 다시 인코딩한 track은 쓰지 않으며, 모든 clip은 mute한다.[](source:frame) 마지막으로 컷, 등장, 퇴장, 전환마다 앞뒤 몇 frame을 연속으로 읽는다(`npx hyperframes measure frames --range a,b --roi x,y,w,h`). 1초나 1/4초 간격으로 뽑은 frame 모음은 1~3 frame 차이, 등장·퇴장 방향, 컷의 blur와 dissolve, 한 frame짜리 flash를 놓치기 때문이다.[](source:frame) | reverse-flow | frame |
| layers | 레이어 나누기 | 에이전트는 화면을 레이어로 나눠 레이어마다 처리 방식을 고른다. 글자, caption, sticker, card, UI와 화면 녹화, 차트, 지도 같은 component는 HTML로 다시 만든다.[](source:layers) 프레임 안에 놓인 사진, clip, 앨범 커버, 로고, 앱 아이콘, 사진이나 collage 속 사람 같은 sub-asset은 원본에서 그 자신의 상자 기준으로 오려 낸다. 로고는 가장 크게 나온 곳에서 오리거나 `npx hyperframes media-use resolve --type logo --intent "<brand> logo"`로 실제 마크를 구하고, 손으로 그리지 않는다.[](source:layers)[](source:media-logo) 화면에 나오는 사람은 이 run 안에서 HeyGen으로 다시 찍는다(`references/people.md`). 그리거나 3D로 만든 애니메이션 영상은 `references/animated.md`를 따른다.[](source:layers) 어떤 레이어에서도 원본의 전체 프레임을 그대로 재생하는 것은 금지다.[](source:layers) 판정 · 원문은 한 영상 안에서 레이어마다 다른 처리를 하라고 하므로, 이 노드는 하나를 고르는 분기가 아니라 레이어별 분류다. | reverse-flow | layers |
| build | 제작과 중간 diff | 에이전트는 `references/match.md`의 규칙으로 그려진 레이어를 만들고, 사람 샷은 생성을 걸어 두고 그동안 그래픽을 만든다.[](source:layers)[](source:people-gen) 큰 글자는 만들기 전에 나타나는 순간부터 사라질 때까지 한 번 훑어본다.[](source:layers)[](source:match-word) 만드는 동안에는 렌더하지 않고 `npx hyperframes diff <video> . --at t,t,…`로 몇 군데만 확인한다.[](source:midcheck) 작업은 에이전트 하나가 맡는다. 영상 전체를 쥔 하나가, 각자 다시 보는 subagent들보다 낫다는 것이 원문의 입장이다.[](source:alone) 이 노드를 떠나는 조건은 "모든 샷에 내용이 찼다"이다. 그 앞에 몇 번 반복하는지는 원문에 명시 없음. | reverse-flow | build |
| final | check와 렌더, diff | 모든 샷에 내용이 차면 에이전트는 `npx hyperframes check`를 돌려 오류를 고친다. 다만 원본이 스스로 하는 것(색, 아주 작은 글자)은 `check`가 경고해도 그대로 둔다.[](source:final) 그다음 `npx hyperframes cloud render --fps <data-fps> --quality high -o <out>`으로 렌더하고 `npx hyperframes diff <video> <out>`로 대조한다.[](source:final) 분수 rate이거나, 비율이 16:9·9:16·1:1이 아니거나, cloud render가 실패하면(실패 이유를 사용자에게 알린다) 로컬 `npx hyperframes render -o <out>`을 foreground에서 10분 timeout으로 돌린다. 더 오래 걸리면 `setsid nohup npx hyperframes render -o <out> > render.log 2>&1 &`로 떼어 내 띄우고 log를 foreground에서 기다린다.[](source:final) `diff`는 이쪽이 놓친 원본의 컷과 불필요하게 낸 컷, 길이, 소리의 offset, 내용이 빠진 구간, 최악의 순간들(실패한 칸을 원본의 칸 옆에 놓고)을 알려 준다.[](source:final) | reverse-flow | final |
| fix | 고치고 재확인 | 에이전트는 `diff`가 지목한 것 중 눈으로 확인되는 것만 고친다. 빠진 컷이나 요소, 틀린 시각·크기·굵기·색이 예다. 그리고 렌더와 `diff`를 한 번 더 하고 멈춘다.[](source:fix) 판정 · 원문은 이 반복을 한 번으로 못 박았다. 그 뒤에도 차이가 남으면 더 돌리지 않고, `REVERSE.md`의 근사치와 마지막 `diff` 수치로 남기는 것으로 읽힌다. `diff`가 눈에 보이는 문제를 지목하지 않았을 때 이 노드를 건너뛰는지는 원문에 명시 없음. | reverse-flow | fix |
| done | REVERSE.md와 인계 | 에이전트는 짧은 `REVERSE.md`를 쓴다. 다시 만든 것, 오려 낸 것, 재촬영한 것, 근사치(대체 글꼴 등), 마지막 `diff` 수치를 적고 가격이나 credit 숫자는 넣지 않는다. 거기 적힌 명령은 노트일 뿐이다. 재개할 때는 그 명령이 나온 recipe(모든 flag, `--prompt` 포함)에서 다시 만들고 `--plan`으로 확인하며, 적힌 그대로 실행하지 않는다.[](source:alone) 그다음 `references/start.md`에 따라 인계한다. 마지막 `diff`를 `--sbs`로 돌려 나란히 보기(원본과 결과)를 열고, `npx hyperframes preview`를 프로젝트에 띄운 뒤 계속 편집할 수 있다고 한 줄로 말한다. `preview`가 `Framey` 줄을 출력했으면 `/hyperframes`가 하듯 그 줄을 전한다.[](source:handover) 사용자는 결과를 보는 것이고 파일 경로를 보는 것이 아니다.[](source:handover) 마지막으로 영상을 넘기면 `npx hyperframes events --skill=reverse-any-video --event=skill_completed --outcome=success`를, 영상 없이 멈추면 `--outcome=error`를 보낸다.[](source:start-event) | reverse-flow | done |

설명용 예시: 사용자가 30초짜리 영상 파일을 주며 똑같이 다시 만들어 달라고 한다고 하자(요청은 지어낸 것이다). `reverse start`가 `plan: pro`를 출력했다면 에이전트는 바로 시작하고 `init`으로 프로젝트를 만든다.[](source:start-probe) `measure cuts`가 frame 83을 컷으로 내고 영상이 30 fps라면, 그 샷은 `2.766666`초에 시작해야 한다.[](source:frame)

이후 레이어를 나눠 만들고, 모든 샷에 내용이 차면 `check`와 렌더, `diff`를 한 번 돌린다. 지목된 문제를 고치고 한 번 더 렌더·`diff`한 뒤 `REVERSE.md`를 쓰고 `--sbs` 결과를 연다.[](source:final)[](source:fix)[](source:handover) 반대로 `plan: free`가 출력됐다면 에이전트는 이 흐름을 시작하지 않고 업그레이드 안내에서 멈춘다.[](source:free)

## 화면 속 사람과 애니메이션 샷은 어떻게 다시 만드나? {#behavior-people span=12}

원문은 말하든 안 하든 화면에 나오는 모든 사람을 HeyGen으로 다시 찍으라고 한다. 원본의 얼굴과 그 위에 구워진 글자가 결과에 남지 않게 하려는 것이다. 원본 클립이 움직임을 이끌고 원본 샷마다 생성 샷 하나를 만드는 것이 맞춤의 핵심이다. HyperFrames 로그인으로 충분하고 API key는 필요 없다.[](source:people-intro)

사용자가 HeyGen을 쓰지 말라고 하면 에이전트는 그 사람을 자기 상자 기준으로 오려 내고, 구워진 글자가 같이 들어왔다고 알린다.[](source:people-intro) 아래 그림은 HeyGen을 쓰는 경로만 그렸고, 오려 내는 경로는 그리지 않았다.

@workflow id=people-flow title="사람 한 명의 샷을 다시 만드는 경로"
| shots | 컷마다 샷 나누기 | backend |
| plate | 샷별 plate 만들기 | backend |
| gen | 모든 샷 한꺼번에 생성 | external |
| ok | 샷이 검사를 통과했나? | backend |
| redo | 재생성과 트리밍 | external |
| place | 얼굴 위치 맞추기 | backend |
| behind | 글자가 사람 뒤를 지나가나? | backend |
| cutout | 사람 cutout 분리 | backend |
| stack | 샷 쌓기 | backend |
| shots > plate | |
| plate > gen | |
| gen > ok | |
| ok > place | 통과 | emphasis |
| ok > redo | 실패 |
| redo > place | |
| place > behind | |
| behind > cutout | 예 |
| behind > stack | 아니오 |
| cutout > stack | |

@steps id=people-steps
| shots | 컷마다 샷 나누기 | 에이전트는 `measure cuts`가 낸 컷을 기준으로 생성 샷을 나눈다. 생성 샷 하나가 컷 하나를 넘는 일은 없으며 jump cut과 punch-in도 컷으로 센다. 한 테이크로 jump cut을 넘기면 그 컷이 지워지고, 컷을 가로지르는 motion guide는 HeyGen이 제멋대로 어딘가에서 컷을 만들게 한다.[](source:people-cuts) HeyGen은 5~15초짜리를 만든다. 더 짧은 샷은 5초로 요청해 잘라 쓴다. 더 긴 샷은 원본이 reframe하는 곳에서 나누고, 그런 곳이 없으면 이어 붙인다. 이때 다음 부분의 reference는 앞 부분의 마지막 frame이다.[](source:people-cuts) | people-flow | shots |
| plate | 샷별 plate 만들기 | 에이전트는 샷마다 plate를 만든다. plate는 그 샷의 실제 frame이고 원본의 화면 비율을 따른다. 그려진 것과 다른 얼굴(벽의 사진, sticker)은 모두 지워 둔다. HeyGen이 엉뚱한 얼굴을 움직일 수 있기 때문이다. 작은 표시는 `cv2.inpaint`, 사람이 움직이는 곳은 시간 median을 쓰고, 방은 선명하고 사실적으로 남긴다.[](source:people-plate) 그려진 것이 크거나 사람을 가로지르면 이미지 편집이 더 깨끗하다. `npx hyperframes media-use generate --type image --reference <frame>`에 글자를 지우고 나머지는 그대로 두라고 요청하고, 방이 선명하게 남았는지 확인한다.[](source:people-plate) | people-flow | plate |
| gen | 모든 샷 한꺼번에 생성 | 에이전트는 모든 샷을 background로 한꺼번에 생성하고, 그동안 그래픽을 만든다. 샷 하나는 대개 1분쯤 걸려 돌아온다고 원문이 말한다.[](source:people-gen) 명령은 `npx hyperframes media-use generate --type video --reference <plate> --motion <the original shot> --mask <x,y,w,h,a-b> --audio <the original voice over that shot> --aspect <the source's> --seconds <n> --prompt "<who, where, what they do, the camera>" --out <shot>.mp4`이다.[](source:people-gen) `--motion`은 컷 시각대로 자른 원본 샷이다. HeyGen은 그 샷의 몸과 카메라 움직임을 따르고 얼굴은 plate에서 가져온다. 가이드에 구워진 글자도 베끼므로 그 샷의 그려진 상자마다 `--mask`를 하나씩 준다(클립의 pixel과 초). 글자 자신의 상자를 가리고, 전폭 띠는 쓰지 않는다. 마스크 아래에 있는 몸짓이 사라지기 때문이다. 말하지 않는 사람에게는 `--audio`를 주지 않는다.[](source:people-gen) 사용자가 credit 한도를 말했다면 먼저 모든 샷을 `--plan`으로 가격 매기고, 한도에 드는 사람만 남기고, 남은 양을 `--max-credits`로 넘긴다. 한도를 지키려고 사람을 빼기 전에 사용자에게 묻는다.[](source:people-credit) | people-flow | gen |
| ok | 샷이 검사를 통과했나? | 에이전트는 샷이 돌아올 때마다 세 가지를 검사한다. 샷 안에 컷이 없는지, 원본의 글자가 하나도 없는지, 얼굴 상자가 원본의 것과 5% 안에 있는지(`npx hyperframes measure face`)이다. `generate`는 `cuts_inside`를 출력하고 컷이 있는 가이드는 거절한다. `--allow-cuts`는 그 frame을 직접 읽고 한 샷(whip이나 flash 포함)임을 확인한 뒤에만 넘긴다.[](source:people-check) 세 검사를 모두 통과하면 얼굴 위치 맞추기로 가고, 하나라도 어긋나면 재생성으로 간다. | people-flow | ok |
| redo | 재생성과 트리밍 | 에이전트는 실패한 샷을 한 번 다시 생성하고, 그래도 어긋나면 좋은 부분만 잘라 쓴다.[](source:people-check) HeyGen이 거절하거나 `generation_failed`로 실패한 샷은 시험 호출을 포함해 이 session이나 재개한 session에서 한 번 더 시도한다. 그래도 안 되면 멈추고 사용자에게 지금은 원본 영상을 그대로 둘지, 그 샷을 뺄지 묻는다.[](source:people-check) `generate`가 30분 뒤 멈췄는데 샷이 아직 기다리는 중이면 같은 명령을 한 번 더 돌린다. 같은 job을 이어받아 다시 청구되지 않는다. 그 뒤에도 기다리면 실패로 보고, 나머지를 먼저 만든다.[](source:people-check) 판정 · 이 노드는 원문의 두 가지 실패(검사 불합격과 생성 실패)를 한 상자로 묶었다. 원문에서 둘의 재시도 규칙은 다르다. | people-flow | redo |
| place | 얼굴 위치 맞추기 | 에이전트는 샷의 시작과 끝에서 얼굴 상자가 원본의 얼굴 상자와 겹치도록 크기와 위치를 정한다. `npx hyperframes measure face <shot> --against <video> --from a --to b`가 `scale`, `x`, `y`를 출력하므로 그 값을 쓴다. 원본의 카메라가 움직이는 구간에서만 두 값 사이를 tween한다. 그래서 위치가 바뀌는 곳은 컷뿐이다.[](source:people-frame) | people-flow | place |
| behind | 글자가 사람 뒤를 지나가나? | 에이전트는 원본에서 글자가 사람 뒤로 지나가는지 본다. 지나가면 cutout을 만들고, 아니면 건너뛰고 쌓는다.[](source:people-behind) | people-flow | behind |
| cutout | 사람 cutout 분리 | 원본의 글자가 사람 뒤로 지나가면 에이전트는 `npx hyperframes remove-background <shot> -o <cutout>.webm`으로 사람을 샷에서 오려 낸다. 그리고 샷, 글자, cutout 순서로 쌓는다.[](source:people-behind) | people-flow | cutout |
| stack | 샷 쌓기 | 에이전트는 원본 목소리를 영상의 소리로 두고 생성 샷은 mute한다. 목소리를 clone하거나 avatar를 만들지 않는다. 원본 목소리가 입 모양을 이끌기 때문이다.[](source:people-end) 사진, collage, screenshot 속의 사람은 하위 자산이라서 그것과 함께 오린다.[](source:people-end) 글자가 사람 뒤가 아닐 때 샷을 어떤 순서로 쌓는지는 원문에 명시 없음. | people-flow | stack |

그리거나 3D로 만든 애니메이션 영상은 캐릭터, 세계, 카메라가 한 그림이라 레이어가 갈라지지 않는다. 그래서 샷마다 코드로 만들 것과 생성할 것을 가른다.

에이전트는 시작 전에 사용자의 언어로 이를 먼저 알린다. 원문의 예시 문장은 "그린 영상이라 코드로 되는 것은 코드로 다시 만들고 나머지는 그 영상의 frame에서 샷별로 생성한다. 코드 부분은 편집되지만, 생성 샷은 레이어가 아니라 교체할 수 있는 clip으로 돌아온다"이다.[](source:anim-intro)

코드로 만드는 것은 글자와 손글씨, 로고, 엔드 카드, 그림 위에 얹힌 빛(flash, glow, 포털의 고리), 정지한 세계 위의 카메라 이동이다. 카메라 이동은 카메라를 재서 세계를 깨끗한 plate의 별도 레이어로 만든다.

생성하는 것은 연기하는 캐릭터, 형태가 변하는 그림, streamline 같은 가는 흐름이다. 코드로 그리면 모양이 틀리기 때문이다. 섞인 샷은 연기를 생성하고 그 위에 코드를 얹는다.[](source:anim-split)

생성 샷 recipe는 `references/people.md`와 같고 다섯 군데가 다르다.[](source:anim-cuts)

첫째, 컷은 눈으로 읽는다. 샷 안의 갑작스러운 빛이 컷으로 나열될 수 있으므로 앞뒤 frame을 보고, 같은 그림이 다른 빛 아래 있으면 한 샷으로 보아 조각을 한 가이드로 합치고 `--allow-cuts`를 넘긴다.[](source:anim-cuts) 둘째, plate는 샷의 첫 frame에서 글자와 로고를 이미지 편집으로 지운 것이다.

셋째, `--first-frame`은 `--motion`과 함께 쓸 수 없어서 plate를 `--reference`로 넘긴다. 프롬프트에는 그림체를 적고, 가이드의 그려진 글자는 `--mask`로 지운다. 디졸브 양 끝의 섞인 frame은 가이드에서 빼야 이웃 샷으로 돌아오지 않는다.[](source:anim-gen)

넷째, 위치는 샷의 시작과 끝에서 안정된 모양을 `npx hyperframes diff <video> . --at t,t,…`로 비교하고 scale과 위치를 손으로 정한다. `measure face`는 실제 얼굴용이다.[](source:anim-frame)

다섯째, HeyGen은 카메라 움직임을 늦게 수행하므로 샷이 정렬된 채 돌아오는 일이 드물다. 샷마다 움직임을 원본 frame에 맞춰 `data-media-start`와 `data-playback-rate`를 정한다.[](source:anim-frame) `REVERSE.md`에는 어느 샷이 생성이고 어느 레이어가 코드인지 적는다.[](source:anim-frame)

## 그려진 레이어는 무엇으로 원본과 맞추나? {#behavior-match span=12}

`references/match.md`는 그려진 레이어에서 이전에 다시 만든 영상이 점수를 잃은 곳과, 고친 방법을 모은 것이다.[](source:match-time) 에이전트는 이 규칙을 만들기 단계에서 읽고 쓴다. 규칙 이름은 노드 `제작과 중간 diff`의 근거다.

그래픽은 정확한 frame에서 바뀐다. 241번 frame에 완전히 있는 요소는 fade 없이 그 자리에 둔다(`set`). 여러 frame에 걸쳐 움직인 것만 tween하고, 한 frame에 도착하는 카메라도 tween이 아니라 `set`이다.[](source:match-time)

caption은 각 묶음의 첫 frame과 마지막 frame을 caption 띠의 pixel에서 frame마다 잡는다(`npx hyperframes measure events <video> --roi <band>` 또는 띠 위의 frame 차이).

단어는 `npx hyperframes transcribe`에서 오지만 이름을 잘못 들을 수 있다. 전환 시각은 pixel에서 잡는다. caption이 목소리보다 앞서거나 뒤처지는 일이 흔하기 때문이다.

원본이 fade하지 않으면 hard switch한다. 컷에서의 blur flash, dissolve, wipe는 컷의 일부이므로 잰 frame 위에서 다시 만든다.[](source:match-time)

글자 크기는 눈대중이 아니라 ink에서 잰다. 원본 frame에서 그 줄을 오리고 이쪽 snapshot에서 같은 줄을 오려 ink 상자의 높이와 너비를 비교한 뒤, 몇 pixel 안에서 둘이 맞을 때까지 size, 그다음 `letter-spacing`을 조정한다. 대체 글꼴은 보통 더 넓게 앉고, 숫자도 비교한다. 굵기는 ink의 진하기로 비교하고, outline이나 그림자가 있는지 본다.[](source:match-size)

글꼴은 모양의 특징(기하, 대비, x-height, terminal)으로 고르고, 측정한 크기에서 후보 두세 개를 시험한 뒤 정한다. 번들 글꼴을 먼저, 다음으로 `assets/fonts/`의 Google Fonts를 쓰고, 어떤 글꼴이 대체인지 보고에 적는다. 위치는 원본 pixel 기준으로 잰 상자에서 오고, canvas가 원본 크기이므로 잰 값 그대로 넣는다.[](source:match-size)

배경은 이렇게 맞춘다. 모션 그래픽은 배경이 frame 대부분을 덮으므로 빈 배경의 격자를 여러 시점에서 표본으로 떠 gradient와 밝기의 시간 변화를 맞춘다. 원본에서 빠르게 움직이는 것은 motion blur가 걸려 있어서, 빠를 때 선명한 조각은 틀린 것으로 채점된다.

점과 pixel 질감은 격자(pitch, offset, 색)를 frame에서 재서 그 격자에서 그린다. 카메라 아래의 지도나 스크롤하는 도표처럼 영상처럼 움직이는 평면 그래픽은 판마다 평면 색 도형으로 따고 카메라 이동을 맞추는 쪽이 바깥 데이터로 다시 그리는 것보다 훨씬 잘 맞는다.[](source:match-look)

큰 글자는 나타나는 frame부터 사라지는 frame까지 연속 frame 띠(`measure frames --range a,b --roi <its box> --max 16`)로 보고, 등장 방식(pop, scale, fade, type-on, 단어별, wipe), 화면에 있는 동안의 변화(채움이 가로질러 가는 것, 광택, 카운터, 색 변화의 방향과 길이), 퇴장 방식을 읽는다. 그다음 원래 크기로 확대해 글자가 무엇으로 만들어졌는지(solid, gradient, glass, outline, glow, knockout) 이름 붙인다.[](source:match-word)

seek한 timeline이 재현하는 효과는 아래 표로 찾아본다.[](source:match-recipe)

| 효과 | 만드는 법 |
| --- | --- |
| 글자를 가로지르는 채움 | 단어를 두 벌 둔다. 켜진 쪽이 위에 오고 `clip-path: inset(0 100% 0 0)`을 `inset(0 0 0 0)`으로 잰 시간과 방향대로 tween한다.[](source:match-recipe) |
| gradient 글자 | `background: linear-gradient(<direction>, <both end colours>)`에 `background-clip: text`와 투명한 fill을 쓴다.[](source:match-recipe) |
| 영상 위의 glass 글자 | 글자 안에 그 샷의 두 번째 복사본을 넣고, `<text>`를 담은 SVG `<clipPath>`로 자르고, `feTurbulence`(`baseFrequency` 약 0.02, 고정 seed)와 `feDisplacementMap`(scale 40~60)으로 휜다. 더 어두운 글자 복사본을 15~35%로 multiply하고, 2~3 px 어두운 stroke와 밝은 윗 모서리를 얹는다. 이 글자는 샷의 camera group 안에 둔다.[](source:match-recipe) |
| outline 글자 | `-webkit-text-stroke`를 잰 굵기로 쓰고 fill은 투명하게 한다.[](source:match-recipe) |
| 방향이 있는 motion blur | 움직이는 감싸는 요소에 SVG `<feGaussianBlur stdDeviation="0 0">`을 두고 `stdDeviation`을 tween한다(`"24 0"`은 가로로 번진다). CSS `blur()`는 대칭이라 틀린 방식이다.[](source:match-recipe) |
| ghost trail | 이동 방향 뒤에 복제 2~4개를 두고 opacity는 약 0.5, 0.3, 0.15다.[](source:match-recipe) |
| glow | `text-shadow` 또는 `drop-shadow`를 겹치고 radius와 alpha를 tween한다.[](source:match-recipe) |
| mask와 wipe | `clip-path`나 `mask-image`의 stop을 tween한다.[](source:match-recipe) |
| flash | 잰 frame에서만 전체 화면 레이어를 둔다.[](source:match-recipe) |
| grain | 고정 seed의 SVG `feTurbulence`를 frame마다 단계적으로 돌린다. 원문은 grain이 무엇을 해도 SSIM을 낮추므로 pixel이 아니라 모양을 맞추라고 한다.[](source:match-recipe) |

## 시작할 때 사용자에게 무엇을 어떻게 말하나? {#behavior-dialog span=12}

`references/start.md`는 에이전트가 아니라 사용자가 읽는 글을 쓰는 규칙이다. 사용자의 언어로, 따뜻하고 짧게 쓰며, 파일 이름, 경로, 단계 번호, 도구 이름을 넣지 않는다. 이 지침의 링크나 인용도 넣지 않고, 링크는 사용자가 열어야 하는 페이지에만 쓴다.

에이전트는 `billing`을 뺀 모든 명령을 직접 실행하고, `billing`은 사용자 몫이다. 사용자가 열 페이지(로그인, 업그레이드, 추가 credit)는 클릭할 수 있는 링크로 메시지에 넣는다.[](source:start-voice)

로그인이 안 된 경우 로그인을 요청하거나 링크를 다시 주는 메시지는 모두 HeyGen이 왜 필요한지로 시작한다. 이유는 로그인해야 가장 좋은 결과가 나오고, HeyGen이 영상 속 사람을 다시 찍어 원본처럼 움직이고 말하게 한다는 것이다. 이 skill이나 지침이 요구한다고는 말하지 않는다.

기다려야 하면 로그인을 기다린다고만 말한다. 링크와 code만 보내는 메시지에도 이 이유를 유지한다.[](source:login)

에이전트는 `reverse start`가 출력한 `reverse.login_command`를 실행한다. `npx hyperframes auth login`은 브라우저를 열고 로그인이 끝나면 돌아오므로 같은 메시지에서 돌리고 기다린다. 브라우저가 안 열리면 명령이 로그인 링크를 출력하므로 이유와 함께 준다.

브라우저를 열 수 없는 환경(원격이나 headless 터미널, 거기서는 plain `auth login`도 거절된다)에서는 `npx hyperframes auth login --device`를 background로 띄운 뒤 이유, 링크, code를 한 메시지에 보낸다. 사용자가 그것을 봐야 로그인할 수 있으므로 무엇을 기다리기 전에 보낸다. Pro를 통과하려고 API key로 로그인하는 것은 금지다. 그 로그인은 HyperFrames plan이 없는 HeyGen 앱 계정에 로그인되기 때문이다.[](source:login)

작업 중에 credit이 부족하면 거절된 단계가 필요한 양과 고치는 명령을 출력한다. 샷은 한꺼번에 시작하므로 여러 단계가 같이 거절된다.

에이전트는 시작한 모든 단계가 응답할 때까지 기다리고, 거절된 단계의 필요량을 합산해 `npx hyperframes billing add-credits --needed <total> --skill reverse-any-video`를 그 합계로 한 번만 사용자에게 건넨다. 거절이 출력한 `url`(오래된 CLI는 `fix`의 링크)을 링크로 붙인다.

필요량을 출력하지 않은 거절이 하나라도 있으면 합계를 알 수 없으므로, 단계마다가 아니라 run 전체로 plain `billing add-credits`를 한 번만 건넨다. 어느 쪽이든 추가 credit 페이지가 열리고 사용자는 거기서 가격을 본다. 사용자가 잔액을 채웠다고 말하면 거절됐던 단계를 모두 다시 시작하고 계획 전체를 유지한다.[](source:credits) 원문의 예시 문장은 "세 단계가 합쳐 633 credit이 필요한데 30 credit이 있다"는 상황이다(원문이 든 숫자이고 실측값이 아니다).[](source:credits)

시간은 1분 미만 clip에 20~50분이라고 말하고 더 긴 숫자는 지어내지 않는다. 더 긴 영상은 구간으로 나눠 작업하므로 그 사실과 구간 수를 알린다.[](source:time) 가격, 추정, 잔액, 사용한 credit은 run 전에도 중에도 끝에도 먼저 말하지 않는다. `reverse start`와 `auth status`는 로그인용이므로 그것들의 plan이나 credit 줄을 되풀이하지 않는다.[](source:prosign)

## 언제 켜지고, 언제 쓰면 안 되나? {#activation span=12}

`description`은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어가 있어야 켜진다는 뜻이 아니다. 호출을 막는 `disable-model-invocation` 필드는 원문에 명시 없음.[](source:front)

@code source=front language=yaml

원문이 다루는 영상은 모션 그래픽, talking head, 실사, AI 생성 영상으로, 영상 파일이면 종류를 가리지 않는다.[](source:front) 에이전트는 사용 권리가 있는 영상만 다시 만든다.[](source:intro) 영상을 있는 그대로 다시 만들고, remix(내용을 바꿔 만들기)는 사용자가 요청할 때만 한다.[](source:pro)

켜진 뒤에도 조건에 따라 길이 갈린다. 아래 목록이 그 갈림길이다.

- 영상 링크를 받으면 내려받기 전에 `npx hyperframes auth status`를 실행한다.[](source:pro)
- `REVERSE.md`나 만들다 만 프로젝트가 있으면 새로 시작할 때와 똑같이 `reverse start`로 연다.[](source:pro)
- 이전 session이 포기한 단계(거절된 재촬영)는 한 번 더 시도하고, 그래도 안 되면 사용자에게 묻는다.[](source:pro)
- credit 한도 아래서 돌던 작업이면 그 한도가 지금도 유효한지 사용자에게 묻는다.[](source:pro)
- Free 계정이면 업그레이드 링크와 `fix`를 건네고, 사용자가 Pro라고 말할 때까지 아무것도 시작하지 않는다.[](source:free)
- plugin 안에서 CLI가 `reverse start`를 모르면 비용이 나가기 전에 멈추고 plugin 업데이트가 필요하다고 한 줄로 알린다.[](source:start-probe)
- 사용자가 HeyGen을 쓰지 말라고 하면 사람을 자기 상자 기준으로 오려 내고 구워진 글자가 같이 들어왔다고 알린다.[](source:people-intro)

판정 · 새 영상을 처음부터 만들거나 스타일만 빌려 새 주제로 만들 때는 이 스킬이 맞지 않는다. 원문이 그 경우를 직접 금지한 문장은 없다. 다만 `style-sampling`의 `description`이 "복사할 영상 하나는 reverse-any-video"라고 나누고, `hyperframes`의 안내표는 "복사하거나 다시 만들 영상"만 이 스킬로 보낸다.[](source:sty-desc)[](source:hf-route)

## 무엇을 강제하고 금지하나? {#rules span=12}

수치와 한도는 값과 적용 조건을 같이 적는다. 모두 에이전트가 따르는 지시이고, 이 분석에서 실측하지 않았다.

@facts
| 소요 시간 안내 | 1분 미만 clip에 20~50분. 더 긴 숫자는 지어내지 않는다.[](source:time) |
| 시각 표기 | frame ÷ fps를 내림. 30 fps의 frame 83은 `2.766666`.[](source:frame) |
| 로컬 렌더 timeout | foreground로 돌릴 때 10분.[](source:final) |
| HeyGen 샷 길이 | 5~15초. 짧으면 5초로 요청해 자른다.[](source:people-cuts) |
| 얼굴 상자 허용 | 원본의 5% 안(`measure face`).[](source:people-check) |
| 생성 대기 | 30분 뒤 멈추면 같은 명령을 한 번 더.[](source:people-check) |
| 연속 frame 띠 | `--max 16`.[](source:match-word) |

에이전트가 반드시 하는 것은 이렇다.

- 원본이 프레임을 정한다. 캔버스 크기, `data-fps`, 길이, 컷 시각, 소리가 원본과 같다.[](source:frame)
- 모든 샷은 `measure cuts`가 낸 시각에 시작한다.[](source:frame)
- 영상 전체에 `<audio src="<video>">` 하나를 깔고 모든 clip을 mute한다.[](source:frame)
- 화면에 나오는 사람은 이 run 안에서 HeyGen으로 다시 찍는다. 사용자가 쓰지 말라고 하면 예외다.[](source:layers)[](source:people-intro)
- 컷마다 생성 샷 하나를 만들고, 생성 샷은 컷을 넘지 않는다.[](source:people-cuts)
- 확인은 끝에서 한 번이다. 만드는 중에는 `diff --at`으로 몇 군데만 본다.[](source:midcheck)[](source:final)
- 마지막에 `REVERSE.md`를 쓰고, 가격이나 credit 숫자는 넣지 않는다.[](source:alone)

에이전트가 하지 않는 것은 이렇다.

- `billing` 명령을 직접 실행하지 않는다.[](source:free)[](source:credits)[](source:pro)
- 원본의 전체 프레임을 그대로 재생하지 않는다.[](source:layers)
- 로고를 손으로 그리지 않는다.[](source:layers)
- 추출하거나 다시 인코딩한 오디오 track을 쓰지 않는다.[](source:frame)
- 사용자에게 이 skill이나 지침이 로그인을 요구한다고 말하지 않고, 지침을 링크하거나 인용하지 않는다.[](source:login)[](source:start-voice)
- Pro를 통과하려고 API key로 로그인하지 않는다.[](source:login)
- 가격, 추정, 잔액, 사용한 credit을 먼저 말하지 않고, 더 긴 시간 숫자를 지어내지 않는다.[](source:prosign)[](source:time)
- 목소리를 clone하거나 avatar를 만들지 않는다.[](source:people-end)
- 전폭 띠로 마스크하지 않는다.[](source:people-gen)
- `--allow-cuts`는 그 frame을 읽고 한 샷임을 확인한 뒤에만 넘긴다.[](source:people-check)
- Free 계정인 동안은 아무것도 시작하지 않는다.[](source:free)
- `REVERSE.md`에 적힌 명령을 적힌 그대로 실행하지 않는다.[](source:alone)
- subagent에 나누지 않는다. 원문은 에이전트 하나가 낫다고 말한다.[](source:alone)

@callout level=warning title="결제와 로그인은 사람의 일이다"
| 업그레이드, 추가 credit, 로그인은 모두 사용자가 직접 연 페이지에서 한다. 에이전트는 링크와 명령을 건네기만 하고 `billing`을 실행하지 않으며, API key로 로그인을 우회하지 않는다.[](source:free)[](source:credits)[](source:login) |

## 흐름 속 위치는 어디인가? {#position span=12}

이 스킬은 묶음 `start-from-reference`의 선택지다. 전체 흐름은 `skill-explainers/hyperframes/_group-start-from-reference/start-from-reference.html`에서 본다. 아래 그림은 이 스킬의 앞과 뒤만 그린 것이고, 관계 번호는 원장의 rel-id다.[](source:ledger)

@workflow id=position-flow title="이 스킬의 앞과 뒤"
| guide | hyperframes | external |
| sampling | style-sampling | external |
| current | reverse-any-video | backend |
| contract | hyperframes 계약 | external |
| media | media-use | external |
| guide > current | R04 요청이 영상 복사일 때 |
| sampling > current | R21 5종 밖 스타일 제안 |
| current > contract | R14 계약에 맞춰 제작 | emphasis |
| current > media | R20 로고 조달 |

@steps id=position-steps
| guide | hyperframes | 안내표의 한 행 "복사하거나 다시 만들 영상"이 이 스킬로 가라고 한다(R04). 강제는 아니고, 에이전트가 요청 종류를 알아보고 고르는 안내다.[](source:hf-route) | position-flow | guide |
| sampling | style-sampling | 템플릿 5종에 없는 스타일(사용자가 링크하거나 이름 댄 채널이나 영화)이면 한 줄로 알리고 두 길을 제안한다. 하나가 영상 한 편을 프레임 단위로 다시 만들고 내용을 바꾸는 `/reverse-any-video`다(R21). 고르는 것은 사용자이고 그 전에는 아무것도 가져오지 않는다. 이름만 댄 스타일은 예시 영상을 요청한다.[](source:sty-route) | position-flow | sampling |
| current | reverse-any-video | 이 페이지의 스킬이다. 영상 한 편을 원본과 맞는 프로젝트로 다시 만든다. | position-flow | current |
| contract | hyperframes 계약 | 결과물은 `/hyperframes` 계약에 맞춰 만든다(R14, 의무 어조 "Build to the `/hyperframes` contract").[](source:intro) 계약은 `class="clip"`, `data-start`, `data-duration`, 일시 정지된 timeline 하나, 결정적 렌더 같은 12개 규칙이다.[](source:hf-contract) 이 분석은 계약 12개 중 어느 것을 `check`가 잡는지 읽지 않았다. | position-flow | contract |
| media | media-use | 로고는 `npx hyperframes media-use resolve --type logo`로 실제 마크를 구한다(R20). 이 스킬은 스킬 이름이 아니라 명령으로 가리킨다. `media-use`의 logo 행도 "다시 그리지 않는다"고 한다.[](source:layers)[](source:media-logo) | position-flow | media |

| 관계 | 받는 것 | 넘기는 것 | 조건과 사용자 개입 |
| --- | --- | --- | --- |
| R04 `hyperframes` → 이 스킬 | 영상 복사 요청 | - | 안내표의 한 행, 강제 아님[](source:hf-route) |
| R21 `style-sampling` → 이 스킬 | 예시 영상 | - | 제안이고 사용자가 고른다, 그 전에 pull하지 않는다[](source:sty-route) |
| R14 이 스킬 → `hyperframes` | - | HyperFrames 프로젝트 | 계약에 맞춰 제작, 의무 어조[](source:intro) |
| R20 이 스킬 → `media-use` | - | 로고 파일 | 로고는 원본에서 오리거나 실제 마크를 구한다[](source:layers) |

원장은 이 스킬이 `remotion-to-hyperframes`와 같은 계열(R28)이라고 적는다. 둘 다 기존 작업(영상 파일과 영상 코드)을 HyperFrames로 가져와 원본과 프레임 단위로 대조한다는 판정이고, 직접 연결은 없다.[](source:ledger) plugin 안에서 실행하면 `../hyperframes/references/plugin-installation.md`의 plugin execution rules를 따르라고 한다(R13). 그 문서는 읽지 않았다.[](source:plugin)

## 어디까지 읽었고 무엇을 확인하지 못했나? {#audit span=12}

이 스킬 폴더의 텍스트 파일 5개를 끝까지 읽었다. 크기는 `SKILL.md` 5289 B, `references/start.md` 6988 B, `references/match.md` 4292 B, `references/people.md` 4057 B, `references/animated.md` 2599 B이고 합계 23225 B다. 부분 읽음 파일은 없고 바이너리도 없다. 이 폴더에 `*.KO.md` 번역본은 없다.

폴더 밖의 세 파일은 필요한 줄만 읽었다(부분 읽음 3개). `hyperframes/hyperframes/SKILL.md`(전체 7481 B)는 1~34줄과 55~70줄, `hyperframes/style-sampling/SKILL.md`는 1~8줄과 26~34줄, `hyperframes/media-use/SKILL.md`는 20~30줄만 읽었다.

관계 원장 `skill-explainers/hyperframes/relations.md`(15234 B)는 이 스킬의 행과 rel-id를 확인하려고 읽었다. `GLOSSARY.md`는 용어 확인용으로만 읽었고 근거로 인용하지 않는다. 분석 중 바뀐 파일은 없다.

@callout level=open-question title="확인하지 못한 것"
| `../hyperframes/references/plugin-installation.md`는 읽지 않았다. plugin 안에서 이 스킬이 어떻게 달라지는지는 확인하지 못했다. |
| `npx hyperframes` 명령(`reverse start`, `measure`, `check`, `diff`, `cloud render`)은 실행하지 않았다. 출력 필드와 실제 거절 조건은 지시문 기준으로만 서술했다. |
| `preview`가 출력하는 `Framey` 줄과 `/hyperframes`가 그것을 전하는 방식은 읽지 않았다. 이 스킬은 "`/hyperframes`가 하듯" 전하라고만 한다.[](source:handover) |
| `/hyperframes` 계약 12개 규칙 중 이 스킬 결과물에 어느 것이 실제로 걸리는지는 대조하지 않았다.[](source:hf-contract) |
