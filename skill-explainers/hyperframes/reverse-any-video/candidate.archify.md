# reverse-any-video는 언제 켜지고 무엇을 강제하나? {#reverse-any-video-page}

`reverse-any-video`는 영상 파일 하나를 원본과 프레임 단위로 맞춘 HyperFrames 프로젝트로 다시 만든다. HyperFrames **Pro 기능**이라서 Free 계정이면 사용자가 업그레이드해야 시작한다.[](source:pro)[](source:free)

- 시작할 때 `npx hyperframes reverse start <video> --dir <project>`를 실행하고, 거절되면 업그레이드 링크와 `fix` 명령만 사용자에게 건넨다.[](source:pro)
- 프레임 크기, `data-fps`, 컷 시각, 소리는 모두 원본 기준으로 맞추고, 마지막에 `diff`로 한 번 대조한다.[](source:frame)[](source:check)
- 화면 속 사람은 HeyGen으로 다시 찍고, `billing` 명령은 에이전트가 실행하지 않는다.[](source:people-intro)[](source:free)

@answer scope="로컬 원본 5개 분석 · CLI 실행 없음 · 부분 분석"
@meta locale=ko
@source skill title="hyperframes/reverse-any-video/SKILL.md · 5289B · 진입 스킬(원본)" path=hyperframes/reverse-any-video/SKILL.md
@source front title="hyperframes/reverse-any-video/SKILL.md · 5289B · frontmatter" path=hyperframes/reverse-any-video/SKILL.md lines=1:4
@source plugin title="hyperframes/reverse-any-video/SKILL.md · plugin 규칙과 beacon" path=hyperframes/reverse-any-video/SKILL.md lines=6:8
@source intro title="hyperframes/reverse-any-video/SKILL.md · 목표와 권리" path=hyperframes/reverse-any-video/SKILL.md lines=12:12
@source pro title="hyperframes/reverse-any-video/SKILL.md · Pro 기능과 재개" path=hyperframes/reverse-any-video/SKILL.md lines=14:14
@source frame title="hyperframes/reverse-any-video/SKILL.md · 원본이 프레임을 정한다" path=hyperframes/reverse-any-video/SKILL.md lines=16:21
@source layers title="hyperframes/reverse-any-video/SKILL.md · 레이어별 처리" path=hyperframes/reverse-any-video/SKILL.md lines=23:31
@source check title="hyperframes/reverse-any-video/SKILL.md · 마지막 한 번의 확인" path=hyperframes/reverse-any-video/SKILL.md lines=33:37
@source alone title="hyperframes/reverse-any-video/SKILL.md · 단독 작업과 REVERSE.md" path=hyperframes/reverse-any-video/SKILL.md lines=39:39
@source start title="hyperframes/reverse-any-video/references/start.md · 6988B · 시작·결제 지침(원본)" path=hyperframes/reverse-any-video/references/start.md
@source start-intro title="hyperframes/reverse-any-video/references/start.md · 사용자에게 쓰는 말" path=hyperframes/reverse-any-video/references/start.md lines=1:10
@source start-probe title="hyperframes/reverse-any-video/references/start.md · probe와 plan 판정" path=hyperframes/reverse-any-video/references/start.md lines=12:24
@source login title="hyperframes/reverse-any-video/references/start.md · 로그인 안 됨" path=hyperframes/reverse-any-video/references/start.md lines=26:44
@source free title="hyperframes/reverse-any-video/references/start.md · Free 계정" path=hyperframes/reverse-any-video/references/start.md lines=46:59
@source prosign title="hyperframes/reverse-any-video/references/start.md · Pro 계정" path=hyperframes/reverse-any-video/references/start.md lines=61:68
@source credits title="hyperframes/reverse-any-video/references/start.md · credit 부족" path=hyperframes/reverse-any-video/references/start.md lines=70:80
@source handover title="hyperframes/reverse-any-video/references/start.md · 결과 전달" path=hyperframes/reverse-any-video/references/start.md lines=82:86
@source time title="hyperframes/reverse-any-video/references/start.md · 소요 시간" path=hyperframes/reverse-any-video/references/start.md lines=88:91
@source people title="hyperframes/reverse-any-video/references/people.md · 4057B · 인물 재촬영(원본)" path=hyperframes/reverse-any-video/references/people.md
@source people-intro title="hyperframes/reverse-any-video/references/people.md · 원칙" path=hyperframes/reverse-any-video/references/people.md lines=3:3
@source people-shot title="hyperframes/reverse-any-video/references/people.md · 컷당 한 샷" path=hyperframes/reverse-any-video/references/people.md lines=7:8
@source people-gen title="hyperframes/reverse-any-video/references/people.md · 생성 명령과 credit 한도" path=hyperframes/reverse-any-video/references/people.md lines=9:19
@source people-check title="hyperframes/reverse-any-video/references/people.md · 샷 검사와 재시도" path=hyperframes/reverse-any-video/references/people.md lines=21:23
@source people-end title="hyperframes/reverse-any-video/references/people.md · 음성과 하위 자산" path=hyperframes/reverse-any-video/references/people.md lines=25:25
@source match title="hyperframes/reverse-any-video/references/match.md · 4292B · 그래픽 대조(원본)" path=hyperframes/reverse-any-video/references/match.md
@source match-time title="hyperframes/reverse-any-video/references/match.md · 타이밍" path=hyperframes/reverse-any-video/references/match.md lines=5:9
@source match-size title="hyperframes/reverse-any-video/references/match.md · 크기·글꼴·위치" path=hyperframes/reverse-any-video/references/match.md lines=11:15
@source match-look title="hyperframes/reverse-any-video/references/match.md · 배경·blur·격자" path=hyperframes/reverse-any-video/references/match.md lines=17:26
@source match-recipe title="hyperframes/reverse-any-video/references/match.md · 효과 recipe" path=hyperframes/reverse-any-video/references/match.md lines=28:39
@source animated title="hyperframes/reverse-any-video/references/animated.md · 2599B · 애니메이션 영상(원본)" path=hyperframes/reverse-any-video/references/animated.md
@source anim-split title="hyperframes/reverse-any-video/references/animated.md · 코드와 생성 구분" path=hyperframes/reverse-any-video/references/animated.md lines=3:13
@source anim-recipe title="hyperframes/reverse-any-video/references/animated.md · 생성 샷 recipe" path=hyperframes/reverse-any-video/references/animated.md lines=15:33
@source ledger title="hyperframes/relations.md · 관계 원장(읽기 전용, 분석자 작성)" path=skill-explainers/hyperframes/relations.md

## 언제 켜지고, 어떤 때 다른 길로 가나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어가 있어야 켜진다는 뜻이 아니다. `disable-model-invocation` 필드는 원문에 명시 없음.[](source:front)

@code source=front language=yaml

원문은 모션 그래픽, talking head, 실사, AI 생성 영상 어느 것이든 영상 파일을 편집 가능한 프로젝트로 다시 만드는 일을 대상으로 든다.[](source:front) 대상 영상은 사용 권리가 있는 것이어야 한다. 원본 그대로 다시 만들고, 바꿔 만드는 remix는 사용자가 요청할 때만 한다.[](source:intro)[](source:pro)

| 상황 | 원문이 말하는 것 |
| --- | --- |
| 영상 링크를 받았다 | 내려받기 전에 `npx hyperframes auth status`를 먼저 실행한다.[](source:pro) |
| `REVERSE.md`나 만들다 만 프로젝트가 있다 | 새로 시작할 때와 똑같이 `reverse start`로 연다.[](source:pro) |
| 이전 session이 포기한 단계(거절당한 재촬영) | 한 번 더 시도하고, 그래도 안 되면 사용자에게 묻는다.[](source:pro) |
| credit 한도 아래에서 돌던 작업 | 그 한도가 지금도 유효한지 사용자에게 묻는다.[](source:pro) |
| Free 계정 | 업그레이드 링크와 `fix`를 건네고, 사용자가 Pro라고 말할 때까지 아무것도 시작하지 않는다.[](source:free) |
| 사용자가 HeyGen을 쓰지 말라고 한다 | 사람을 자기 영역으로 오려 내고, 원본에 구워진 글자가 같이 들어왔다고 알린다.[](source:people-intro) |
| plugin 안에서 CLI가 `reverse start`를 모른다 | 비용이 나가기 전에 멈추고 plugin 업데이트가 필요하다고 한 줄로 알린다.[](source:start-probe) |

판정 · 새 영상을 처음부터 기획하거나 스타일만 빌려 새 주제로 만들 때는 이 스킬이 맞지 않는다. 원문에 이 조건을 직접 금지한 문장은 없다. 원장에는 그 경우 `/hyperframes`나 `/style-sampling`으로 가는 관계가 있다(R04, R21, R22).[](source:ledger)[](source:front)

## 무엇을 강제하고 어떻게 대조하나? {#rules}

@facts
| 원본이 정하는 것 | 캔버스 크기는 probe와 정확히 같고, `data-fps`는 probe의 rate다. 길이는 영상의 frame 수 ÷ fps이며 audio 길이가 아니다.[](source:frame) |
| NTSC rate | 분수로 둔다(`30000/1001`).[](source:frame) |
| 시각 표기 | frame ÷ fps를 내림한다. 30 fps의 frame 83은 `2.766666`이고 `2.767`은 한 frame 늦다.[](source:frame) |
| 컷 | `measure cuts`가 낸 컷마다 새 샷이 그 시각에 시작한다. jump cut과 한 샷 안의 punch-in도 포함한다.[](source:frame) |
| 소리 | 영상 전체에 `<audio src="<video>">` 하나를 깐다. 추출하거나 다시 인코딩한 track은 쓰지 않고 모든 clip은 mute한다.[](source:frame) |
| 변화 구간 | 컷, 등장, 퇴장, 전환마다 앞뒤 몇 frame을 연속으로 읽는다. 1초나 1/4초 간격 sheet는 1~3 frame 차이를 놓친다.[](source:frame) |
| 합격 확인 시점 | 만드는 동안은 `diff <video> . --at t,t,…`로 몇 군데만 본다. 모든 샷에 내용이 차면 `check`, 렌더, `diff`를 한 번 돌린다.[](source:check) |

@steps id=layer-steps
| comp | 컴포넌트 | text, caption, sticker, card, UI, 화면 녹화, 차트, 지도는 HTML로 다시 만든다. | | |
| sub | 하위 자산 | 프레임 안에 놓인 사진, clip, 앨범 커버, 로고, 앱 아이콘은 원본의 자기 영역에서 오려 낸다. | | |
| person | 화면 속 사람 | HeyGen으로 다시 찍는다. 상세는 `references/people.md`다. | | |
| anim | 그린·3D 애니메이션 영상 | `references/animated.md`로 간다. | | |

위 4개 레이어 규칙은 원문에 있다. 원본 전체 프레임을 그대로 재생하는 것은 금지다.[](source:layers) 로고는 가장 크게 나온 곳에서 오리거나 `npx hyperframes media-use resolve --type logo --intent "<brand> logo"`로 실제 마크를 구하고, 손으로 그리지 않는다.[](source:layers)

`check`는 오류를 고친다. 원본이 하는 것(색, 아주 작은 글자)은 `check`가 경고해도 유지한다.[](source:check) `cloud render`가 기본 경로이고(`--fps <data-fps> --quality high`), 분수 rate, 16:9·9:16·1:1이 아닌 비율, 렌더 실패 중 하나면 로컬 `npx hyperframes render -o <out>`을 foreground에서 10분 timeout으로 돌린다. 더 길면 detached로 띄우고 log를 foreground에서 기다린다.[](source:check) `diff`가 지목한 것 중 눈으로 보이는 문제(빠진 컷이나 요소, 틀린 시각·크기·굵기·색)만 고치고, 한 번 더 렌더·`diff`한 뒤 멈춘다.[](source:check)

작업은 에이전트 하나가 한다. 영상 전체를 쥔 하나가, 각자 다시 보는 subagent들보다 낫다는 것이 원문 입장이다.[](source:alone) 끝에 짧은 `REVERSE.md`를 쓴다. 만든 것, 자른 것, 재촬영한 것, 근사치(대체 글꼴 등), 마지막 `diff` 수치를 담고 가격이나 credit 숫자는 넣지 않는다. 거기 적힌 명령은 노트일 뿐이어서, 재개할 때는 만든 recipe(모든 flag와 `--prompt` 포함)에서 다시 만들고 `--plan`으로 확인하며 적힌 그대로 실행하지 않는다.[](source:alone)

| 항목 | 값과 적용 조건 |
| --- | --- |
| 그래픽 전환 | 정확한 frame에서 바뀐다. 241번 frame에 완전히 있는 요소는 fade 없이 `set`한다. 여러 frame에 걸쳐 움직인 것만 tween한다.[](source:match-time) |
| caption 전환 | 글자는 `transcribe`에서 오고(이름을 잘못 들을 수 있다), 전환 frame은 caption 띠의 pixel에서 잡는다. 원본이 fade하지 않으면 hard switch한다.[](source:match-time) |
| 글자 크기 | 눈대중이 아니라 ink 상자의 높이·너비를 비교해 size, 그다음 `letter-spacing`을 조정해 몇 pixel 안으로 맞춘다. 대체 글꼴은 보통 더 넓다.[](source:match-size) |
| 글꼴 | 후보 2~3개를 측정 크기에서 시험한다. 번들 글꼴을 먼저, 다음으로 `assets/fonts/`의 Google Fonts를 쓰고 대체한 글꼴은 보고에 적는다.[](source:match-size) |
| glass type | `feTurbulence` `baseFrequency` 약 0.02(seed 고정), `feDisplacementMap` scale 40~60, 어두운 복사본 15~35% multiply, 2~3 px 어두운 stroke.[](source:match-recipe) |
| ghost trail | 복제 2~4개, opacity 약 0.5, 0.3, 0.15.[](source:match-recipe) |
| 방향성 motion blur | SVG `feGaussianBlur`의 `stdDeviation`을 tween한다(`"24 0"`은 가로로 번진다). CSS `blur()`는 대칭이라 틀린 방식이다.[](source:match-recipe) |
| grain | `feTurbulence` seed 고정. SSIM은 어쩔 수 없이 낮아지므로 pixel이 아니라 느낌을 맞춘다.[](source:match-recipe)[](source:match-look) |

큰 글자는 나타나는 frame부터 사라지는 frame까지 연속 frame 띠(`measure frames --range a,b --roi <box> --max 16`)로 보고, 등장 방식과 화면에 있는 동안의 변화와 퇴장 방식을 읽는다.[](source:match-look)

## 사람이 직접 해야 하는 일은 무엇인가? {#human}

@workflow id=start-flow title="reverse start 이후 분기"
| begin | reverse start | backend |
| signedq | 로그인했나? | backend |
| login | 로그인 후 재시작 | external |
| planq | Pro인가? | backend |
| upgrade | Pro 확인 후 재시작 | external |
| halt | 중단 | security |
| build | 프로젝트 제작 | backend |
| creditq | credit 충분한가? | backend |
| topup | 충전 후 재개 | external |
| done | 결과 전달 | frontend |
| begin > signedq | |
| signedq > login | 아니오 |
| signedq > planq | 예 |
| planq > upgrade | Free |
| upgrade > halt | 링크 없음 | security |
| planq > build | Pro | emphasis |
| build > creditq | |
| creditq > topup | 거절 |
| creditq > done | 충분 | emphasis |

`reverse start`가 출력하는 `signed_in`과 `plan`(`free` 또는 `pro`)이 분기를 정하고, 그 plan은 최종이다. `null`일 때만 `auth status --json`의 `hyperframes` 필드를 읽는다. `user.subscription`은 HeyGen 앱의 plan이라 Reverse를 열어 주지 않는다.[](source:start-probe)

| 지점 | 에이전트가 하는 일 | 사람이 하는 일 |
| --- | --- | --- |
| 로그인 | `reverse.login_command`를 실행한다. 브라우저가 안 열리면 링크를 준다. 브라우저를 못 여는 환경은 `auth login --device`를 background로 띄운 뒤, 이유와 링크와 code를 한 메시지에 보낸다.[](source:login) | 링크에서 로그인한다. 모든 로그인 요청 메시지는 HeyGen이 인물을 다시 찍어 준다는 이유로 시작한다.[](source:login) |
| 업그레이드 | `reverse.upgrade_url` 링크와 `reverse.subscribe_command`(`npx hyperframes billing subscribe --feature reverse --skill reverse-any-video --session <id>`)를 그대로 건넨다.[](source:free) | 플랜 페이지에서 가격을 보고 직접 결정한다. 에이전트는 사용자가 Pro라고 말할 때까지 아무것도 시작하지 않는다.[](source:free) |
| credit 부족 | 거절이 모두 돌아올 때까지 기다린다. 거절마다 필요한 양을 합산해 `billing add-credits --needed <합계> --skill reverse-any-video`를 한 번만 안내한다. 합계를 알 수 없는 거절이 있으면 그냥 `billing add-credits`를 한 번만 안내한다.[](source:credits) | 추가 credit 페이지에서 가격을 확인하고 결제한다. 충전했다고 말하면 에이전트가 거절된 단계를 모두 다시 띄운다.[](source:credits) |
| 사용자가 정한 credit 한도 | 모든 샷을 `--plan`으로 먼저 가격을 매기고, 한도에 드는 사람만 남기고, 남은 양을 `--max-credits`로 넘긴다. 한도를 지키려고 사람을 자르기 전에 먼저 묻는다.[](source:people-gen) | 한도를 말하고, 줄일지 결정한다.[](source:people-gen) |
| 재촬영이 두 번 실패 | `generation_failed`인 샷은 한 번 더 시도하고, 그래도 안 되면 멈춘다.[](source:people-check) | 원본 영상 그대로 둘지 그 샷을 뺄지 고른다.[](source:people-check) |

@callout level=warning title="billing과 가격 언급 금지"
| 에이전트는 `billing` 명령을 직접 실행하지 않는다. Pro 계정이라도 거절이 나오기 전에는 가격, 추정, 잔액, 사용 credit을 먼저 말하지 않는다. `reverse start`와 `auth status`가 낸 plan·credit 줄도 되풀이하지 않는다.[](source:free)[](source:prosign)[](source:credits) |

사용자에게 보내는 글은 사용자 언어로 짧게 쓴다. 파일 이름, 경로, 단계 번호, 도구 이름을 넣지 않고, 이 지침의 링크나 인용도 넣지 않는다. 링크는 사용자가 열어야 하는 페이지에만 쓴다.[](source:start-intro) 오래된 CLI가 설치된 경우(`reverse start`를 모르거나 `_meta.updateAvailable: true`이거나, `signed_in: false`인데 `reverse.next`가 없을 때) `npx -y hyperframes@latest --version`으로 버전을 한 번 확인하고, 이 작업의 이후 모든 명령을 그 버전으로 통일한다.[](source:start-probe)

시간은 1분 미만 clip에 20~50분이라고 말하고 더 긴 시간은 지어내지 않는다. 긴 영상은 section으로 나눠 작업하며 section 수를 알려 준다.[](source:time) 결과를 넘길 때는 마지막 `diff`를 `--sbs`로 돌려 원본과 결과의 나란히 보기를 열고, `npx hyperframes preview`를 띄워 계속 편집할 수 있다고 한 줄로 알린다.[](source:handover)

## 사람 재촬영과 애니메이션 영상은 어떻게 다루나? {#people}

원문은 말하든 안 말하든 화면에 나오는 모든 사람을 HeyGen으로 다시 찍으라고 한다. 원본의 얼굴과 그 위에 구워진 글자가 결과에 남지 않게 하기 위해서다. HyperFrames 로그인으로 충분하고 API key는 필요 없다.[](source:people-intro)

| 규칙 | 값과 적용 조건 |
| --- | --- |
| 컷당 한 샷 | 생성 샷은 컷을 넘지 않는다. HeyGen은 5~15초를 만든다. 더 짧으면 5초로 요청해 자르고, 더 길면 원본이 reframe하는 곳에서 나누거나 이어 붙인다(다음 부분의 reference는 앞 샷의 마지막 frame).[](source:people-shot) |
| plate | 샷의 실제 frame에서 그려진 것과 다른 얼굴을 지운다. 작은 흔적은 `cv2.inpaint`, 사람이 움직이면 시간 median, 큰 것은 이미지 편집을 쓴다.[](source:people-shot) |
| 생성 | 모든 샷을 한꺼번에 background로 생성한다. `--motion`은 원본 샷이고, 구워진 글자마다 `--mask`를 하나씩 준다. 글자 상자만 가리고 전폭 띠는 쓰지 않는다. 말하지 않는 사람에게는 `--audio`를 주지 않는다.[](source:people-gen) |
| 샷 검사 | 샷 안에 컷이 없다, 원본 글자가 없다, 얼굴 상자가 원본과 5% 이내다(`measure face`). 실패하면 한 번 다시 만들고, 그다음엔 좋은 부분만 자른다. `--allow-cuts`는 그 frame을 읽고 한 샷임을 확인했을 때만 쓴다.[](source:people-check) |
| 대기 | generate가 30분 뒤 멈추고도 기다리는 샷은 같은 명령을 한 번 더 돌린다(같은 job을 잡고 다시 청구되지 않는다). 그래도 기다리면 실패로 보고 나머지를 먼저 만든다.[](source:people-check) |
| 소리 | 원본 목소리가 soundtrack이고 샷은 mute한다. 목소리 clone과 avatar는 만들지 않는다. 사진이나 collage 속 사람은 하위 자산으로 함께 오린다.[](source:people-end) |

애니메이션·그림 영상은 캐릭터, 세계, 카메라가 한 그림이라 레이어가 분리되지 않는다. 시작 전에 사용자 언어로 먼저 알린다. 생성된 샷은 바꿀 수 있는 레이어가 아니라 교체할 수 있는 clip으로 돌아온다고 알린다.[](source:anim-split) 코드로 만드는 것은 글자, 로고, 엔드 카드, 그림 위의 빛, 정지한 세계 위의 카메라 이동이다. 생성하는 것은 연기하는 캐릭터, 변형되는 그림, 흐르는 세부(streamline)다.[](source:anim-split)

생성 샷 recipe는 people.md와 같고 네 가지가 다르다. 컷은 눈으로 읽는다(빛 변화가 컷으로 잡힐 수 있다). plate는 샷의 첫 frame에서 글자와 로고를 이미지 편집으로 지운 것이다. `--first-frame`은 `--motion`과 같이 쓸 수 없어서 plate는 `--reference`로 넘긴다. HeyGen이 카메라 움직임을 늦게 수행하므로 `data-media-start`와 `data-playback-rate`로 샷마다 시간을 다시 맞춘다.[](source:anim-recipe) `REVERSE.md`에는 어느 샷이 생성이고 어느 레이어가 코드인지 적는다.[](source:anim-recipe)

## 흐름 속 위치는 어디인가? {#position}

이 스킬은 묶음 `start-from-reference`의 선택지다. 전체 흐름은 `skill-explainers/hyperframes/_group-start-from-reference/start-from-reference.html`을 본다.[](source:ledger)

@workflow id=position-flow title="앞과 뒤"
| guide | hyperframes | external |
| sampling | style-sampling | external |
| current | reverse-any-video | backend |
| contract | hyperframes 계약 | external |
| guide > current | R04 | dashed |
| sampling > current | R21 | dashed |
| current > contract | R14 | emphasis |

@steps id=position-steps
| me | reverse-any-video | 이 페이지의 스킬이다. 영상 하나를 원본과 맞는 프로젝트로 다시 만든다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
| --- | --- |
| R04 · 넘김 | `/hyperframes`의 안내표에서 복사하거나 다시 만들 영상이 요청일 때 이 스킬로 온다. 강제는 아니다.[](source:ledger) |
| R21 · 넘김 | `/style-sampling`이 5개 템플릿에 없는 스타일을 만나면 두 길을 제안하고 사용자가 고른다. 이 스킬 쪽은 예시 영상을 받는다.[](source:ledger) |
| R14 · 참고 | 결과물은 `/hyperframes` 계약에 맞춰 만든다.[](source:intro) |
| R20 · 참고 | 로고는 `media-use resolve --type logo`로 구한다.[](source:layers) |
| R28 · 같은 계열 | `/remotion-to-hyperframes`와 직접 연결은 없다. 판정 · 둘 다 기존 작업을 프레임 단위로 대조한다는 점이 같다.[](source:ledger) |
| plugin | plugin 안에서 실행하면 plugin execution rules를 따른다(R13).[](source:plugin) |

## 어디까지 읽었고 무엇을 확인하지 못했나? {#audit}

@facts
| 읽은 텍스트 파일 | 5개(`SKILL.md`, `references/start.md`, `references/people.md`, `references/match.md`, `references/animated.md`), 모두 끝까지 읽음 |
| 부분 읽음 | 0개 |
| 바이너리 | 0개 |
| 제외한 파일 | 스킬 폴더의 `*.KO.md` 번역본(규칙에 따라 열지 않음). 제외 개수는 이 분석에서 세지 않았다. |
| 분석 중 바뀐 파일 | 없음. 분석 커밋 `f85af643f25876081562e9820cd87fb45a478480`에서 읽었다. |
| 실행한 명령 | 없음. `npx hyperframes ...`와 `billing`, `auth`는 실행하지 않았다. |

@callout level=open-question title="확인하지 못한 것"
| 이 스킬이 가리키는 `/hyperframes`, `/media-use`의 reference와 CLI 동작은 읽지 않았다. 따라서 `reverse start`, `measure`, `diff`의 실제 출력과 환경별 동작은 지시문 기준으로만 서술했다. |
| `credit` 가격, `reverse start`의 `_meta.updateAvailable` 같은 필드의 실제 값은 원문에 예시만 있고 실측하지 않았다(633과 30 credit은 원문 예시 문장의 숫자다).[](source:credits) |
| 원장 R13~R21의 줄 번호 일부는 이 스킬 파일의 실제 줄과 다르다(결과 보고에 기록). |
