# motion-showreel 스킬은 에이전트를 어떻게 바꾸나 {#motion-showreel-skill}

`motion-showreel`을 쓰면 에이전트는 영상을 코드로 그린다. 시간 `t`를 받아 그 순간의 화면을 그리는 웹 페이지를 만들고, 스크립트가 그 페이지를 프레임마다 캡처해 ffmpeg로 MP4를 만든다.[](source:ms-principle) 그 사이에 사람 확인을 세 번 받는다. 요구사항 요약, 스타일 프레임, 편집기 미리보기를 사용자가 승인하기 전에는 다음 단계로 가지 않고 MP4도 만들지 않는다.[](source:ms-workflow)[](source:ms-preview)

- 켜지는 때: 그래픽·글자·UI 애니메이션이 중심인 영상을 MP4와 고칠 수 있는 소스로 받고 싶을 때다. 길이는 최장 20분(1200초)이고, 호출 제한 필드는 없다.[](source:ms-fm)[](source:ms-dur)
- 쓰면 안 되는 때: 실사 촬영, 사실적인 인물 연기, 기존 영상 편집, 비디오 모델로 화면을 바로 뽑는 일이다. 클릭으로 넘기는 발표나 글을 원고로 바꾸는 일은 `web-video-presentation`, 웹페이지는 `web-design-engineer`로 보낸다.[](source:ms-scope)
- 강제하는 것: 필수 정보 6개를 확인받고, TTS는 사용자가 준 원고만 읽는다. 기술 검사 `inspect.mjs qa`에 FAIL이 하나라도 있으면 납품하지 않는다.[](source:ms-s1req)[](source:ms-s1cond)[](source:ms-tech)
- 이번 최신화: 모든 영상이 편집기 미리보기를 거치고, 사용자가 내보내기를 승인해야 렌더한다. 사용자가 원하면 진행 페이지로 제작 과정을 단계마다 보여 준다.[](source:ms-preview)[](source:ms-progress)

@answer scope="design/garden-skills/motion-showreel · 원본 텍스트 113개(정독 64개 551,862B, 구조·표본만 49개 524,053B) · 커밋 4e3fc89 · 스크립트·테스트 실행 안 함 · 지시상 동작"
@meta locale=ko
@source ms-fm title="design/garden-skills/motion-showreel/SKILL.md · 32386B · frontmatter(중국어 원본)" path=design/garden-skills/motion-showreel/SKILL.md lines=1:4
@source ms-principle title="SKILL.md · 원리: render(t)와 timeline.js" path=design/garden-skills/motion-showreel/SKILL.md lines=10:10
@source ms-preview title="SKILL.md · 먼저 미리보기, 그다음 내보내기" path=design/garden-skills/motion-showreel/SKILL.md lines=12:12
@source ms-progress title="SKILL.md · 요청 시 제작 과정 공개" path=design/garden-skills/motion-showreel/SKILL.md lines=14:14
@source ms-feel title="SKILL.md · 좋은 영상의 네 요소와 영상다움" path=design/garden-skills/motion-showreel/SKILL.md lines=16:18
@source ms-scope title="SKILL.md · 적용 판단 표" path=design/garden-skills/motion-showreel/SKILL.md lines=22:31
@source ms-dur title="SKILL.md · 길이 규칙" path=design/garden-skills/motion-showreel/SKILL.md lines=33:33
@source ms-weak title="SKILL.md · 기본 함정과 잘 못하는 것" path=design/garden-skills/motion-showreel/SKILL.md lines=37:39
@source ms-workflow title="SKILL.md · 8단계 워크플로" path=design/garden-skills/motion-showreel/SKILL.md lines=45:57
@source ms-s0 title="SKILL.md · 0단계 환경" path=design/garden-skills/motion-showreel/SKILL.md lines=61:61
@source ms-s1req title="SKILL.md · 1단계 필수 정보 표" path=design/garden-skills/motion-showreel/SKILL.md lines=63:74
@source ms-s1cond title="SKILL.md · 조건부 필수(TTS·녹음·사용자 음원)" path=design/garden-skills/motion-showreel/SKILL.md lines=76:78
@source ms-s1prog title="SKILL.md · 제작 진행 선호" path=design/garden-skills/motion-showreel/SKILL.md lines=80:80
@source ms-s1mat title="SKILL.md · 소재 처리와 참고 영상" path=design/garden-skills/motion-showreel/SKILL.md lines=82:86
@source ms-s1confirm title="SKILL.md · 요약 확인과 위임 문구" path=design/garden-skills/motion-showreel/SKILL.md lines=88:90
@source ms-s2 title="SKILL.md · 2단계 벤치마크·후보 구조·용도·스타일" path=design/garden-skills/motion-showreel/SKILL.md lines=94:101
@source ms-reel title="SKILL.md · Reel Read와 스토리보드" path=design/garden-skills/motion-showreel/SKILL.md lines=103:124
@source ms-s3 title="SKILL.md · 3단계 스타일 프레임 A·B" path=design/garden-skills/motion-showreel/SKILL.md lines=128:139
@source ms-s3wait title="SKILL.md · 3단계 대기와 동작 구간" path=design/garden-skills/motion-showreel/SKILL.md lines=141:143
@source ms-s4 title="SKILL.md · 4단계 제작 순서" path=design/garden-skills/motion-showreel/SKILL.md lines=147:157
@source ms-hard title="SKILL.md · 4단계 하드 규칙" path=design/garden-skills/motion-showreel/SKILL.md lines=159:164
@source ms-s4prog title="SKILL.md · 4단계 진행 공개" path=design/garden-skills/motion-showreel/SKILL.md lines=166:166
@source ms-s5 title="SKILL.md · 5단계 BGM·효과음·믹스" path=design/garden-skills/motion-showreel/SKILL.md lines=170:183
@source ms-s6 title="SKILL.md · 6단계 편집기 미리보기" path=design/garden-skills/motion-showreel/SKILL.md lines=187:191
@source ms-s7 title="SKILL.md · 7단계 내보내기" path=design/garden-skills/motion-showreel/SKILL.md lines=195:197
@source ms-tech title="SKILL.md · 7단계 기술 검사" path=design/garden-skills/motion-showreel/SKILL.md lines=199:206
@source ms-review title="SKILL.md · 7단계 사람 검토" path=design/garden-skills/motion-showreel/SKILL.md lines=208:212
@source ms-s8 title="SKILL.md · 8단계 납품" path=design/garden-skills/motion-showreel/SKILL.md lines=216:224
@source ms-base title="SKILL.md · 底线(모든 스타일이 지킬 선) 6개" path=design/garden-skills/motion-showreel/SKILL.md lines=228:237
@source ms-reftab title="SKILL.md · 참고 파일 표(review.md를 6단계로 적음)" path=design/garden-skills/motion-showreel/SKILL.md lines=272:272
@source rd-scope title="design/garden-skills/motion-showreel/README.md · 21213B · 범위와 다른 스킬 안내" path=design/garden-skills/motion-showreel/README.md lines=25:25
@source rd-tree title="README.md · 파일 구성(스타일 40개로 적음)" path=design/garden-skills/motion-showreel/README.md lines=167:167
@source rd-43 title="README.md · 스타일 43개" path=design/garden-skills/motion-showreel/README.md lines=97:97
@source mf title="design/garden-skills/motion-showreel/manifest.json · 797B · 40-style library" path=design/garden-skills/motion-showreel/manifest.json lines=5:5
@source ed-default title="design/garden-skills/motion-showreel/references/editor.md · 7300B · 기본 작업 공간" path=design/garden-skills/motion-showreel/references/editor.md lines=3:7
@source ed-open title="editor.md · 열기와 규격" path=design/garden-skills/motion-showreel/references/editor.md lines=15:17
@source ed-ops title="editor.md · 첫 버전이 지원하는 조작" path=design/garden-skills/motion-showreel/references/editor.md lines=25:30
@source ed-tracks title="editor.md · 트랙 한도와 긴 영상" path=design/garden-skills/motion-showreel/references/editor.md lines=51:53
@source ed-export title="editor.md · 내보내기와 호환" path=design/garden-skills/motion-showreel/references/editor.md lines=57:63
@source pg-trigger title="design/garden-skills/motion-showreel/references/progress.md · 11143B · 켜는 조건과 금지" path=design/garden-skills/motion-showreel/references/progress.md lines=3:5
@source pg-stage title="progress.md · 단계 ID와 상태" path=design/garden-skills/motion-showreel/references/progress.md lines=19:27
@source pg-confirm title="progress.md · 확인 직후 대기 해제" path=design/garden-skills/motion-showreel/references/progress.md lines=31:45
@source pg-shot title="progress.md · 샷 하나 끝나면 하나 발표" path=design/garden-skills/motion-showreel/references/progress.md lines=59:67
@source pg-publish title="progress.md · 재생 가능한 단계 버전" path=design/garden-skills/motion-showreel/references/progress.md lines=79:83
@source pg-final title="progress.md · 최종 미리보기와 내보내기" path=design/garden-skills/motion-showreel/references/progress.md lines=89:101
@source lf-plan title="design/garden-skills/motion-showreel/references/long-form.md · 6190B · 장 나누기" path=design/garden-skills/motion-showreel/references/long-form.md lines=7:13
@source lf-build title="long-form.md · 장 빌드 실행 조건과 오디오 필드" path=design/garden-skills/motion-showreel/references/long-form.md lines=36:47
@source lf-review title="long-form.md · 장별 검수와 전체 검수" path=design/garden-skills/motion-showreel/references/long-form.md lines=61:67
@source rv-split title="design/garden-skills/motion-showreel/references/review.md · 15015B · 기술 검사와 사람 검토 분리" path=design/garden-skills/motion-showreel/references/review.md lines=3:11
@source rv-checks title="review.md · 기술 검사 FAIL 조건" path=design/garden-skills/motion-showreel/references/review.md lines=24:38
@source rv-text title="review.md · 문자 프레이밍 검사" path=design/garden-skills/motion-showreel/references/review.md lines=51:51
@source rv-loop title="review.md · 수정 라운드와 중단 기준" path=design/garden-skills/motion-showreel/references/review.md lines=85:85
@source rv-indep title="review.md · 독립 검토 서브에이전트" path=design/garden-skills/motion-showreel/references/review.md lines=87:94
@source rv-end title="review.md · 엔딩 정지 1.5초" path=design/garden-skills/motion-showreel/references/review.md lines=116:116
@source nr-user title="design/garden-skills/motion-showreel/references/narration.md · 12666B · 사용자 원고만" path=design/garden-skills/motion-showreel/references/narration.md lines=5:7
@source nr-tts title="narration.md · TTS 분할·재시도·길이 중단" path=design/garden-skills/motion-showreel/references/narration.md lines=29:37
@source nr-timeout title="narration.md · 요청 타임아웃" path=design/garden-skills/motion-showreel/references/narration.md lines=90:90
@source nr-asr title="narration.md · ASR 미내장과 unresolved" path=design/garden-skills/motion-showreel/references/narration.md lines=133:141
@source nr-mix title="narration.md · 믹스 기본 게인과 덕킹" path=design/garden-skills/motion-showreel/references/narration.md lines=166:170
@source fm-h title="design/garden-skills/motion-showreel/references/formats.md · 9162B · H 그린스크린 인물" path=design/garden-skills/motion-showreel/references/formats.md lines=69:77
@source fm-i title="formats.md · I 연대 회고의 저해상도 샘플" path=design/garden-skills/motion-showreel/references/formats.md lines=85:85
@source fm-j title="formats.md · J 내레이션 해설과 장 단위 영상" path=design/garden-skills/motion-showreel/references/formats.md lines=88:93
@source st-assets title="design/garden-skills/motion-showreel/references/stack.md · 13558B · 소재 규칙" path=design/garden-skills/motion-showreel/references/stack.md lines=136:141
@source st-perf title="stack.md · 렌더는 확인 뒤에" path=design/garden-skills/motion-showreel/references/stack.md lines=156:157
@source cr-text title="design/garden-skills/motion-showreel/references/craft.md · 22521B · 글자 체류 시간" path=design/garden-skills/motion-showreel/references/craft.md lines=184:184
@source ix-use title="design/garden-skills/motion-showreel/references/styles/INDEX.md · 10177B · 스타일 쓰는 법" path=design/garden-skills/motion-showreel/references/styles/INDEX.md lines=7:13
@source ix-three title="INDEX.md · 방향 3개 규칙" path=design/garden-skills/motion-showreel/references/styles/INDEX.md lines=15:22
@source mm-proxy title="design/garden-skills/motion-showreel/references/styles/mixed-media-era.md · 9223B · 저해상도 샘플 권고" path=design/garden-skills/motion-showreel/references/styles/mixed-media-era.md lines=98:98
@source sd-master title="design/garden-skills/motion-showreel/references/sound.md · 28109B · 마스터링 목표" path=design/garden-skills/motion-showreel/references/sound.md lines=100:100
@source sd-check title="sound.md · audio.mjs check와 DROPS" path=design/garden-skills/motion-showreel/references/sound.md lines=269:271
@source bt-rule title="design/garden-skills/motion-showreel/references/brief-template.md · 9534B · 작성 조건" path=design/garden-skills/motion-showreel/references/brief-template.md lines=5:5
@source nr-test title="narration.md · mock 테스트" path=design/garden-skills/motion-showreel/references/narration.md lines=189:189
@source sc-editor title="design/garden-skills/motion-showreel/scripts/editor.mjs · 11822B · 127.0.0.1에서만 대기" path=design/garden-skills/motion-showreel/scripts/editor.mjs lines=111:113
@source sc-export title="scripts/lib/editor-media.mjs · 10233B · 내보내기 함수(구조·표본만 확인)" path=design/garden-skills/motion-showreel/scripts/lib/editor-media.mjs lines=98:129

## 언제 켜지고, 언제 쓰면 안 되나 {#trigger}

@code source=ms-fm language=yaml

frontmatter에는 `name`과 `description`만 있다. `disable-model-invocation` 같은 호출 제한 필드가 없어서, 모델이 `description`을 읽고 켤지 판단한다.[](source:ms-fm) 판정: `description`은 판단용 설명이다. 거기 나온 단어가 요청에 있다고 반드시 켜지는 것은 아니다.

`description`을 풀면 이렇다. 모션 작품집, 제품 영상, UI 모션, 키네틱 타이포그래피, 로고 인트로, 생성 아트, 설명 영상에 쓴다. BGM과 효과음 출처를 따로 고를 수 있고, 사용자 녹음이나 사용자 원고를 읽은 TTS 음성을 붙일 수 있다. 실사 제작, 사실적 인물 생성, 일반 영상 편집에는 쓰지 않는다.[](source:ms-fm)

`SKILL.md`의 적용 판단 표는 요청 종류별로 이렇게 가른다.[](source:ms-scope)

| 사용자가 원하는 것 | 원문 판정 | 덧붙인 조건 |
| --- | --- | --- |
| 제품 홍보 단편, 모션 작품집, UI 모션, 키네틱 타이포·비트 맞춤, 로고 연출, 인트로, 루프 영상 | ✅ {good:사용} | - |
| 비디오 모델이 만든 그린스크린 인물 위에 코드로 만든 장면·큰 글자·모션 | ✅ | 인물 영상은 사용자가 준다. 스킬은 비디오 모델을 부르지 않는다[](source:fm-h) |
| 사용자 원고나 녹음으로 해설이 있는 MP4 | ✅ 내레이션 주도 모드 | TTS는 사용자가 준 원고만 쓴다 |
| 클릭으로 넘기는 발표, 현장 발표, 대화형 웹 데모, 글을 내레이션 원고로 바꾸기 | `web-video-presentation`을 쓴다 {caution:다른 스킬} | 이 줄에는 ❌ 표시가 없다 |
| 웹페이지, 랜딩 페이지, 대화형 프로토타입, 정적 시안 | ❌ `web-design-engineer`를 쓴다 {bad:제외} | - |
| 사실적 인물 연기, 실사 질감, 기존 소재 편집, 비디오 모델로 화면 직접 생성 | ❌ {bad:제외} | 다른 스킬 안내가 없다 |

길이 규칙은 네 가지다.[](source:ms-dur)

- 길이는 사용자가 확인한 값을 따르고, 최장 20분(1200초)이다.
- 짧은 영상은 여전히 5–60초가 알맞다. 긴 영상을 20분 내내 빠른 비트 맞춤으로 채우지 않는다.
- 2분을 넘으면 에이전트는 `references/long-form.md`를 읽고 장 단위로 기획·제작·검수한다.
- 정해진 길이가 내레이션 실제 길이나 내용 양과 부딪히면 멈추고 조정안을 확인받는다. 임의로 자르거나 내레이션을 빠르게 하거나 영상 길이를 바꾸지 않는다.

원문은 에이전트가 잘 못하는 것으로 사실적 인물, 손·옷감·털, 실제 물리 정밀도가 필요한 장면, 사진 같은 제품을 꼽는다. 사진 같은 제품은 사용자가 모델이나 사진을 주면 예외다. 이런 요청이면 에이전트는 스타일로 바꾸거나, 그린스크린 인물과 코드 장면으로 일을 나눈다.[](source:ms-weak)

## 8단계는 어떤 순서고, 사람은 어디서 멈추나 {#flow}

@workflow id=ms-flow title="motion-showreel 8단계와 멈춤 지점"
| lane prep | 준비 |
| lane design | 설계 |
| lane make | 제작 |
| lane check | 미리보기 |
| lane ship | 출력 |
| s0 | 0 환경 점검 | backend | prep |
| s1 | 1 요구사항 확인 | backend | prep |
| g1 | 요구사항 승인? | external | prep |
| s2 | 2 brief.md | backend | design |
| s3 | 3 스타일 프레임 | backend | design |
| g2 | 방향 승인? | external | design |
| s4 | 4 제작 | backend | make |
| s5 | 5 음악·믹스 | backend | make |
| s6 | 6 편집기 미리보기 | frontend | check |
| g3 | 내보내기 승인? | external | check |
| s7 | 7 내보내기·검수 | backend | ship |
| g4 | 기술 검사 PASS? | security | ship |
| s8 | 8 납품 | backend | ship |
| s0 > s1 | |
| s1 > g1 | 요약 |
| g1 > s2 | 예 | emphasis |
| s2 > s3 | |
| s3 > g2 | 프레임 |
| g2 > s4 | 예 | emphasis |
| s4 > s5 | |
| s5 > s6 | |
| s6 > g3 | |
| g3 > s4 | 수정 요청 | dashed |
| g3 > s7 | 예 | emphasis |
| s7 > g4 | |
| g4 > s4 | FAIL | dashed |
| g4 > s8 | PASS | emphasis |

@steps id=ms-steps
| st0 | 0 환경 점검 | 처음 한 번 `sh <skill>/scripts/setup.sh`를 실행하라고 한다. Playwright와 Chromium을 설치하고 `check-env.mjs`를 돌린다. Node 18+와 ffmpeg가 없으면 설치 방법만 알려 주고, 시스템 소프트웨어를 대신 설치하지 않는다.[](source:ms-s0) | ms-flow | s0 |
| st1 | 1 요구사항 확인 | 빠진 필수 정보만 한 번에 묻고, 이미 받은 것은 다시 묻지 않는다. 참고 영상을 받으면 `inspect.mjs grid`로 컷과 비트 격자를 재서 brief에 적는다. 사용자가 과정을 보고 싶다고 말하면 진행 페이지를 켠다.[](source:ms-s1req)[](source:ms-s1mat)[](source:ms-s1prog) | ms-flow | s1 |
| st1g | 요구사항 승인? | 주제, 길이, 화면비, BGM·효과음 출처, 내레이션 방식, 소재 상황을 요약해 보내고 기다린다. 첫 요청에 정보가 다 있어도 요약부터 보낸다.[](source:ms-s1confirm) | ms-flow | g1 |
| st2 | 2 brief.md | 벤치마크 1–2개를 고르고 배울 것과 배우지 않을 것을 적는다. 후보 구조 3개 중 하나를 고른 이유를 쓴다. 용도는 `formats.md`의 해당 절만, 스타일은 `styles/INDEX.md`를 본 뒤 고른 1–2개 파일만 읽는다.[](source:ms-s2) `Reel Read`와 스토리보드를 `brief-template.md` 틀로 쓴다.[](source:ms-reel) | ms-flow | s2 |
| st3 | 3 스타일 프레임 | `scaffold.sh`로 `<slug>/` 프로젝트를 만든다. 스타일이 정해졌으면 hook·기억점·엔딩 프레임 3장을 실제 코드로 렌더한다. 정해지지 않았으면 방향 3개를 한 장씩 렌더해 `qa/directions.png`로 묶는다.[](source:ms-s3) | ms-flow | s3 |
| st3g | 방향 승인? | 사용자 답을 실제로 기다린다. TTS 프로젝트는 원고 분할안과 짧은 음색 샘플도 함께 확인받는다. 연속 동작이 중요한 방향은 편집기에서 6–10초 동작 구간을 보여 준다.[](source:ms-s3wait) | ms-flow | g2 |
| st4 | 4 제작 | 내레이션이 있으면 실제 음성과 문장 타임스탬프부터 확정한다. 모든 시점은 `timeline.js`에 쓰고, 샷을 하나씩 만들며 샷마다 시작·중간·끝 정지 화면 3장을 본다. `--determinism` 검사를 통과시킨다. 이 단계에서는 `build.sh`, 영상 모드 `render.mjs`, `build-long.mjs`를 돌리지 않는다.[](source:ms-s4) | ms-flow | s4 |
| st5 | 5 음악·믹스 | BGM과 효과음은 확인받은 출처대로 따로 만든다. 엔진 기본값이 확인받은 출처를 덮지 못한다. build할 때마다 `audio.mjs check`로 수치와 그림을 보고, 수치 통과를 "들어 보니 괜찮다"로 적지 않는다.[](source:ms-s5) | ms-flow | s5 |
| st6 | 6 편집기 미리보기 | `references/editor.md`를 읽고 `editor.mjs`를 띄운 뒤 주소를 먼저 연다. 무음·루프·짧은 영상도 이 단계를 거친다. 화면·트랙·길이·오류를 에이전트가 먼저 확인하고 사용자에게 넘긴다.[](source:ms-s6) | ms-flow | s6 |
| st6g | 내보내기 승인? | 사용자가 편집기의 `导出视频`(영상 내보내기) 버튼을 누르거나, 대화에서 지금 미리보기로 내보내도 된다고 하면 예다. 수정 요청이 오면 고친 뒤 새로고침해 다시 보여 준다. 이전 버전을 승인했다고 수정본을 자동으로 내보내지 않는다.[](source:ms-s6) | ms-flow | g3 |
| st7 | 7 내보내기·검수 | 오디오를 편집했으면 반드시 편집기에서 내보낸다. 편집하지 않았으면 승인 뒤 `sh <slug>/build.sh`도 된다. 2분 넘는 영상은 `build-long.mjs`로 장 단위로 빌드한다.[](source:ms-s7) | ms-flow | s7 |
| st7g | 기술 검사 PASS? | `inspect.mjs qa`가 프로그램으로 판정한다. FAIL이 하나라도 있거나 `NOT CHECKED` 항목이 남으면 통과가 아니다. 이와 별개로 사람용 검토 자료를 보고 가장 심한 문제 3개를 적는다.[](source:ms-tech)[](source:ms-review) | ms-flow | g4 |
| st8 | 8 납품 | 실제 출력 경로(`out/editor-<task-id>.mp4` 또는 `out/final.mp4`), `out/poster.png`, `brief.md`, 검사 결과, 남은 문제, 렌더 시간, 소재 출처와 라이선스를 알린다.[](source:ms-s8) | ms-flow | s8 |

확인을 건너뛰는 경우는 이렇게 정해져 있다.

- 사용자가 특정 확인을 건너뛰라고 명시하면 그 확인만 건너뛰고, 원래 말과 범위를 기록한다.[](source:ms-s1confirm)[](source:bt-rule)
- "전력을 다해", "놀라게 해 줘", "알아서 해" 같은 말은 창작 선택만 맡긴 것이다. 필수 정보나 확인을 생략해도 된다는 뜻이 아니다.[](source:ms-s1confirm)
- 이런 말로 켜지는 맡겨 두기 모드에서도 에이전트는 brief와 방향 3개를 만들고, 요구사항·스타일·미리보기 확인을 그대로 받는다.[](source:ms-s1confirm)

스타일이 정해지지 않았을 때 방향 3개는 규칙이 있다. A는 주제나 브랜드에 맞추고, B는 다른 분류의 화면 언어로 바꾸고, C는 대담하게 간다. 셋 중 하나 이상은 스타일 목록에 없는 것이어야 하고, 셋이 같은 분류에서 나오거나 색만 다르면 안 된다.[](source:ix-three) 스타일 파일을 고르면 신호 2–3개를 뽑는데, 하나 이상은 그 스타일의 가장 흔한 버전 밖에서 고른다.[](source:ix-use)

## 무엇을 강제하고 무엇을 금지하나 {#rules}

| 규칙 | 에이전트가 하는 일 | 강도 |
| --- | --- | --- |
| 필수 정보 6개 | 주제·내용, 길이(초 또는 분, 1200초 이하), 가로·세로, BGM 출처, 효과음 출처, 내레이션 방식을 확인받는다. 고정 기본값으로 사용자 결정을 대신하지 않는다[](source:ms-s1req) | 의무 {bad:생략 불가} |
| 조건부 필수 | TTS를 고르면 사용자 원고와 TTS 서비스·API 설정을 받는다. 녹음을 고르면 녹음 파일, 사용자 음원을 고르면 그 파일을 받는다[](source:ms-s1cond) | 의무 |
| TTS 원고 | 대신 쓰거나 보태거나 고쳐서 합성하지 않는다. 자기가 만든 글을 사용자 원고로 표시하지 않는다. `--source user`는 실행자의 선언일 뿐 출처 확인을 대신하지 않는다[](source:nr-user) | 금지 {bad:대필 금지} |
| 자격 증명 | 환경 변수로만 읽고 brief, 타임라인, 로그, 납품 소스에 쓰지 않는다[](source:nr-user)[](source:ms-s1cond) | 금지 |
| 사실 | 제품 기능, 숫자, 이름은 사용자나 믿을 만한 출처에서만 가져오고, 불확실하면 표시한다[](source:ms-base) | 의무 |
| 브랜드 소재 | 브랜드 작업은 실제 로고를 쓰고, 없으면 멈추고 묻는다. 제품 화면은 실제 스크린샷을 쓰고 CSS로 가짜 화면을 그리지 않는다[](source:st-assets) | 의무 |
| 결정성(하드 규칙) | 화면은 `t`로만 정한다. `Math.random`, `Date.now`, rAF, 타이머, CSS 애니메이션을 쓰지 않고 프레임 사이에 상태를 남기지 않는다. 폰트·소재를 다 불러온 뒤 `READY = true`를 켜고, 레이아웃은 `stageSize()`에서 계산한다[](source:ms-hard) | 의무 |
| 미리보기 전 렌더 | 프록시 MP4나 샘플 영상을 기본으로 만들지 않는다. 오프라인 구간이 꼭 필요하면 이유를 말하고 사용자 동의 뒤 필요한 범위만 렌더한다[](source:ms-s4)[](source:st-perf) | 금지(동의 시 예외) |
| 검수 분리 | 기술 검사는 프로그램이, 사람 검토는 사람이 판정한다. 자기 점수로 검수를 대신하지 않고, 검토 결론은 사용자의 시청을 대신하지 못한다[](source:rv-split)[](source:ms-review) | 의무 |
| 진행 페이지 | 진행을 보여 주려고 화질을 낮추거나 샷을 단순하게 하거나 원고를 고치거나 추정 내레이션을 쓰거나 유료 TTS를 더 부르지 않는다[](source:pg-trigger) | 금지 |

`SKILL.md`는 모든 스타일이 지킬 선 6개를 따로 둔다. 필수 정보 확인과 20분 이하 길이, 사실 정확성, 휴대폰에서 읽히는 글자, 사용 권한이 있는 소재, 기술 정확성(결정적 렌더, 기술 검사 전부 통과, 검은 프레임 없음, 갑자기 끊기지 않는 엔딩), 스타일 일관성이다. 그 밖의 카메라 움직임, 스프링 사용, 효과음 밀도, 템포는 스타일과 내용에 맡긴다.[](source:ms-base)

같은 문제가 세 라운드 연속 안 풀리고 두 가지 수정법이 모두 안 통하면, 에이전트는 그 구간을 더 붙잡지 않는다. brief로 돌아가 기술·샷·구조를 바꾸거나 사용자에게 그대로 알린다.[](source:rv-loop) 검토용 서브에이전트를 띄울 수 있는 환경이면, 제작에 참여하지 않은 서브에이전트에게 `qa/` 자료와 brief의 핵심 문장·금지 목록만 준다. 코드와 제작 과정, 자기 검토 기록은 주지 않는다.[](source:rv-indep)

## 수치는 어떻게 읽나 {#numbers}

| 값 | 성격 | 적용 조건과 출처 |
| --- | --- | --- |
| 최장 1200초(20분) | 의무 | 확인 길이 상한. TTS와 믹스 도구도 1200초를 넘으면 멈춘다[](source:ms-base)[](source:nr-tts)[](source:nr-mix) |
| 2분 초과 | 의무 | `long-form.md`로 장 단위 제작[](source:ms-dur) |
| 짧은 영상 5–60초 | 권고 | "여전히 알맞다"는 표현[](source:ms-dur) |
| 장 단위 30–90초 | 권고 | 렌더와 오디오 메모리를 위한 제안이고 서사 규칙이 아니다[](source:lf-plan) |
| 동작 구간 6–10초 | 조건부 의무 | 연속 동작에 기대는 방향만. 6초 미만 영상은 전체를 쓴다[](source:ms-s3wait) |
| 샷마다 정지 화면 3장 | 의무 | 시작·중간·끝. 정지 화면이 좋아도 움직임 검사를 대신하지 못한다[](source:ms-s4) |
| 길이 ±1.5프레임, 프레임 수 ±2 | 검사 기준 | 넘으면 FAIL[](source:rv-checks) |
| −14 ± 1.5 LUFS, true peak −1 dBTP 초과 | 검사 기준 | 오디오 트랙이 있을 때. 넘으면 FAIL[](source:rv-checks) |
| 루프 SSIM 0.03, 0.97 | 검사 기준 | `--loop`일 때. 마지막→첫 프레임 SSIM이 옆 프레임 단계보다 0.03 이상 낮고 0.97 미만이면 FAIL[](source:rv-checks) |
| 0.3초 이상 | 검토 자료 기준 | 문자 잘림·겹침·안전 영역·너무 작은 글자가 이만큼 이어질 때만 보고한다. PASS/FAIL이 아니다[](source:rv-text) |
| 글자 체류: 중국어 글자 수 ÷ 4.5 + 1.5초, 영어 글자 수 ÷ 15 + 1.5초 | 기준(底线 3이 가리킴) | 글자가 다 보인 뒤부터 잰다[](source:cr-text)[](source:ms-base) |
| 엔딩 정지 1.5초 이상 | 권고(수정법) | 엔딩이 갑자기 끊길 때[](source:rv-end) |
| DROPS 앞 4 dB | 경고 기준 | 강박 직전 반 박자가 앞 마디보다 4 dB 덜 낮으면 WARN[](source:sd-check) |
| TTS 단락 500자 | 도구 기본값 | `--max-chars 20..3000`으로 조정[](source:nr-tts) |
| 재시도 최대 2회 | 도구 기본값 | 일시 오류·429·서버 오류. `--retries 0..5`[](source:nr-tts) |
| 요청 타임아웃 90000 ms | 도구 기본값 | 내장 TTS 어댑터 둘 다[](source:nr-timeout) |
| BGM 0.35, 효과음 0.5, 내레이션 구간 −16 dB | 도구 기본값 | `narration.mjs mix`. 편성 자체도 줄여야 한다[](source:nr-mix) |
| 트랙 32개, 오디오 클립 256개 | 도구 한도 | 편집기 작업 공간[](source:ed-tracks) |
| 3분 | 경고 기준 | 진행 페이지가 제작 중이거나 대기 중인데 3분 넘게 보고가 없으면 미보고 경고를 띄운다. 자동 승인하지 않는다[](source:pg-confirm) |

## 편집기와 진행 페이지는 무엇을 하나 {#editor}

이번 최신화로 6단계가 생겼다. 편집기(작업 공간)는 모든 영상의 기본 미리보기 입구라서, 에이전트는 따로 부탁받지 않아도 `editor.mjs`를 띄우고 주소를 연다.[](source:ed-default) 브라우저를 열 수 없으면 로컬 주소를 주고 피드백을 기다린다. 서버는 `127.0.0.1`에서만 듣는다.[](source:ed-default)[](source:sc-editor)

- 편집기는 원래 장면을 고정 크기 iframe에서 같은 `render(t)`로 돌린다. 크기와 프레임 레이트는 확인받은 규격과 같아야 하고, MP4를 먼저 만들지 않는다.[](source:ed-open)[](source:ed-ops)
- 사용자는 BGM과 효과음 클립을 옮기고, 자르고, 나누고, 게인과 페이드를 바꿀 수 있다. 내레이션은 위치가 잠겨 있어 글자 자르기, 이동, 속도 변경이 안 된다. 편집 뒤 최종 믹스는 다시 −14 LUFS로 맞춘다.[](source:ed-ops)
- 편집 기록은 `.showreel-editor/session.json`에 저장하고 애니메이션, 사용자 원고, 오디오 원본을 고치지 않는다.[](source:ed-ops)
- 미리보기는 서브프레임 블렌딩, DPR 슈퍼샘플링, ffmpeg 그레인을 흉내 내지 않는다. 에이전트는 이 차이를 알리고, 픽셀 단위로 같다고 말하지 않는다.[](source:ed-open)[](source:ms-s6)

@sequence id=ms-export title="편집기에서 내보내기를 누르면"
| actor user | 사용자 | frontend |
| actor editor | editor.mjs | backend |
| actor render | render.mjs | backend |
| actor qa | inspect.mjs | security |
| user | editor | 导出视频 클릭 |
| editor | render | --determinism 검사 |
| render | editor | 통과 | return |
| editor | render | 원래 페이지 렌더 |
| editor | qa | qa 전체 규격 |
| qa | editor | PASS 또는 FAIL | return |
| editor | render | --text-check 검토 자료 |
| editor | user | out/editor-작업ID.mp4 | return |

- 내보내기 버튼만 원래 `render.mjs`를 시작한다. 실패하거나 취소한 작업은 영상을 내놓지 않는다.[](source:ed-export)
- 결과는 새 `out/editor-<task-id>.mp4`이고 `out/final.mp4`를 덮어쓰지 않는다. `build.sh`는 편집기 편집을 읽지 않으므로, 편집본을 다시 만들려면 편집기에서 다시 내보낸다.[](source:ed-export)
- 그림의 순서는 내보내기 함수 코드에서 확인했다. 내레이션이 있으면 그 앞에 `narration.mjs check`가 먼저 돈다.[](source:sc-export)

진행 페이지는 사용자가 요구사항 단계에서 "만드는 과정을 보고 싶다", "단계마다 보여 달라"고 말할 때만 켠다. 말하지 않으면 기본 흐름대로 마지막 미리보기만 보여 준다.[](source:pg-trigger)[](source:ms-s1prog)

- 단계는 `brief`, `style`, `narration`, `scenes`, `audio`, `review` 여섯 개다. 완료 수는 실제로 끝난 수만 적고 타이머로 퍼센트를 지어내지 않는다.[](source:pg-stage)
- 사용자가 확인하면 에이전트의 첫 동작은 `progress.mjs <project> --stage <단계> --confirm`으로 상태를 맞추는 것이다. 그다음에 조사, 다운로드, 제작을 한다. `--confirm`은 상태만 맞추고 MP4를 만들지 않는다.[](source:pg-confirm)[](source:ms-progress)
- 샷은 하나 끝나 자체 점검을 통과할 때마다 바로 발표한다. 전체 샷을 다 만든 뒤 한꺼번에 3/3으로 채우지 않는다.[](source:pg-shot)[](source:ms-s4)
- 단계 버전은 읽기 전용이라 트랙 편집과 내보내기가 막혀 있다. `review --final`로 발표한 최종 버전에서만 편집과 내보내기가 열린다. 진행을 지켜봤다고 내보내기를 승인한 것은 아니다.[](source:pg-publish)[](source:pg-final)

긴 영상은 다르다. 편집기는 첫 버전이 페이지 하나만 다루므로, 에이전트는 장마다 편집기를 열고 장 사이 이음매를 보여 준다. 여러 페이지를 이어 재생하는 기능이 있다고 말하지 않는다. 전체 내용 승인을 받은 뒤에만 `build-long.mjs`를 돌린다.[](source:ed-tracks)[](source:lf-build)[](source:lf-review)

## 흐름 속 위치 {#position}

`garden-visual` 묶음은 만들 결과물에 맞는 garden 스킬을 고르는 흐름이다. `motion-showreel`은 그중 렌더된 MP4 모션 영상을 맡는다. 이 컬렉션 안에서 `motion-showreel`로 넘겨 주는 스킬은 없고, 사용자가 영상을 요청하면 켜진다. 판정: 원장의 garden-skills 관계(r30~r35) 중 `motion-showreel`이 받는 쪽인 행이 없다.[](source:ms-scope)

@workflow id=ms-position title="motion-showreel 앞뒤의 스킬"
| req | 사용자 영상 요청 | external |
| ms | motion-showreel | backend |
| wvp | web-video-presentation | backend |
| wde | web-design-engineer | backend |
| req > ms | MP4 영상 | |
| ms > wvp | 클릭형 발표 | emphasis |
| ms > wde | 웹페이지 | emphasis |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `web-video-presentation` | - | 사용자 요청 | 넘김. 클릭으로 넘기는 발표, 현장 발표, 대화형 웹 데모, 글을 내레이션 원고로 바꾸기면 그 스킬을 쓰라고 한다. 적용 판단 표의 안내이고 실행 지시는 없다. README도 같은 안내를 적는다[](source:ms-scope)[](source:rd-scope) | r30 |
| `web-design-engineer` | - | 사용자 요청 | 넘김. 웹페이지, 랜딩 페이지, 대화형 프로토타입, 정적 시안이면 ❌로 표시하고 그 스킬을 쓰라고 한다[](source:ms-scope)[](source:rd-scope) | r31 |
| `web-video-presentation`(같은 계열) | - | - | 같은 계열. 둘 다 코드로 "영상" 결과물을 만든다. 이 스킬은 렌더된 MP4, 저쪽은 클릭으로 넘기는 웹 발표이고, 둘을 가르는 기준이 r30이다 | r50 |

전체 흐름은 `design/_group-garden-visual/garden-visual.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다. r50은 순서가 없는 같은 계열 관계라서 그림에 넣지 않았다. 실사, 사실적 인물 연기, 기존 소재 편집은 ❌이지만 넘길 스킬을 적지 않아서 그림에 없다.[](source:ms-scope)

## 이 분석의 범위와 한계 {#audit}

- 원본 텍스트 파일은 113개다. 그중 64개(551,862B)를 끝까지 읽었다. `SKILL.md`, `README.md`, `manifest.json`, `references/` 56개(스타일 파일 43개, `INDEX.md`, `_template.md` 포함), `scripts/`의 `editor.mjs`·`progress.mjs`·`setup.sh`·`scaffold.sh`·`package.json`이다. 경로·바이트·역할은 같은 폴더의 `files.md`에 있다.
- 구조·표본만 확인(전부 읽지 않음) 49개(524,053B). 나머지 CLI 도구, `scripts/lib/`, `assets/editor/`, `assets/starter/`, 테스트 13개, `package-lock.json`이다. 머리 주석과 사용법, 테스트 이름, 한도 상수만 grep으로 봤고, `lib/editor-media.mjs`는 내보내기 함수(98–129행)만 읽었다.
- 제외: 번역본 57개(720,900B). `*.ko.md` 50개, `*.ko.stale.md` 6개, `README.zh-CN.md` 1개다. `README.zh-CN.md`는 같은 폴더에 영어 `README.md`가 있어 번역본으로 봤다. `SKILL.md`는 중국어지만 원본이다. 바이너리는 이 폴더에 없고, README가 가리키는 미리보기 이미지(`../../dist/imgs/`)는 이 저장소에 없다.
- 실행하지 않았다. `setup.sh`, `scaffold.sh`, `render.mjs`, `editor.mjs`, `progress.mjs`, `narration.mjs`(TTS), `build-long.mjs`, `npm test` 모두 지시상 동작이다.
- 이번 최신화에서 바뀐 것(커밋 `4e3fc89`, 파일 34개, +2533/−56): 새 파일 18개다. 편집기 화면 `assets/editor/` 6개, `references/editor.md`, `references/progress.md`, `scripts/editor.mjs`, `scripts/progress.mjs`, `scripts/lib/editor-*.mjs` 3개, 테스트 5개다. `SKILL.md`는 7단계에서 8단계로 바뀌었다. 6단계 편집기 미리보기와 내보내기 승인이 생겼고, 4단계의 저해상도 프록시와 본편 렌더가 빠졌다. `render.mjs`에는 선택형 `RENDER_CONTEXT`가 생겼다. 번역본 6개는 `.ko.stale.md`로 이름이 바뀌었다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="원문끼리 맞지 않는 곳"
`SKILL.md`는 저해상도 프록시나 MP4 샘플을 기본으로 만들지 말고, 꼭 필요하면 동의를 받으라고 한다.[](source:ms-s4)[](source:st-perf) 그런데 `formats.md`의 I 유형은 60초를 넘으면 저해상도 샘플(`--size 960x540`)부터 만들라고 하고, `mixed-media-era.md`도 저해상도 샘플을 먼저 만들라고 한다.[](source:fm-i)[](source:mm-proxy) 두 파일은 이번 최신화에서 고쳐지지 않았고, 우선순위는 원문에 명시 없음이다.
`SKILL.md` 참고 파일 표는 `review.md`를 "6단계"에서 읽으라고 적는다. 검수는 이제 7단계다.[](source:ms-reftab)[](source:ms-workflow) `README.md`의 파일 구성과 `manifest.json`은 스타일을 40개로 적지만, `SKILL.md`와 `INDEX.md` 목록, README 본문은 43개다.[](source:rd-tree)[](source:mf)[](source:rd-43)

@callout level=open-question title="확인하지 못한 것"
편집기·진행 페이지가 실제로 지시대로 동작하는지, Gemini·MiniMax TTS가 실제 계정에서 되는지, 렌더 결과가 기술 검사를 통과하는지는 실행하지 않아 확인하지 못했다. 원문은 테스트가 mock provider와 mock ASR을 쓰고 유료 API를 부르지 않는다고 적는다. 이 분석에서는 테스트를 돌리지 않았다.[](source:nr-test)
