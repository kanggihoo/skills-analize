# media-use는 언제 켜지고 무엇을 강제하나? {#media-use-page}

`media-use`는 HyperFrames 영상에 넣을 음악, 효과음, 이미지, 로고, 음성, cutout, 색보정을 `resolve` 한 명령으로 구하거나 만들어 프로젝트 로컬 파일로 남긴다. 렌더 중에는 아무것도 내려받지 않는다.[](source:verb) 이 페이지는 지침 문서를 분석한 것이고 스킬이 시키는 명령은 하나도 실행하지 않았다. 스크립트 일부는 앞부분만 읽었으므로 부분 분석이다.

- HeyGen 모델이나 catalog가 필요할 때마다 `auth status`를 먼저 확인하고, 로그인이 안 되어 있으면 사람이 직접 `auth login`을 치고 끝났다고 말할 때까지 기다린다.[](source:signin)
- 유료 호출의 한도는 사람이 말한 값만 `.hyperframes/credit-limit.json`에 적는다. 에이전트가 가격이나 예상 비용을 먼저 꺼내지 않는다.[](source:credits)
- 이미 있는 asset이 맞는지는 에이전트가 `--candidates` 목록을 보고 판단한다. 확실하지 않으면 새로 구한다.[](source:reuse-judge)[](source:guardrail)
- 영상이 어둡거나 밋밋하다는 피드백은 media 문제로 보고 `media-treatment`로 저장한다. CSS, SVG, `.cube`로 흉내 내지 않는다.[](source:looks)

@answer scope="로컬 원본 106개 분석 · 실행 없음 · 스크립트 일부 부분 읽음"
@meta locale=ko
@source skill title="hyperframes/media-use/SKILL.md · 5311B · 스킬 본문(원본)" path=hyperframes/media-use/SKILL.md
@source front title="hyperframes/media-use/SKILL.md · 5311B · frontmatter" path=hyperframes/media-use/SKILL.md lines=1:4
@source beacon title="hyperframes/media-use/SKILL.md · 5311B · plugin 규칙과 beacon" path=hyperframes/media-use/SKILL.md lines=6:8
@source verb title="hyperframes/media-use/SKILL.md · 5311B · resolve 한 명령" path=hyperframes/media-use/SKILL.md lines=10:18
@source need title="hyperframes/media-use/SKILL.md · 5311B · 필요한 것별 경로 표" path=hyperframes/media-use/SKILL.md lines=20:32
@source signin title="hyperframes/media-use/SKILL.md · 5311B · 로그인" path=hyperframes/media-use/SKILL.md lines=34:34
@source host title="hyperframes/media-use/SKILL.md · 5311B · host app" path=hyperframes/media-use/SKILL.md lines=36:36
@source heygen title="hyperframes/media-use/SKILL.md · 5311B · HeyGen helper" path=hyperframes/media-use/SKILL.md lines=38:38
@source credits title="hyperframes/media-use/SKILL.md · 5311B · Credits 규칙" path=hyperframes/media-use/SKILL.md lines=40:40
@source looks title="hyperframes/media-use/SKILL.md · 5311B · 실제 footage의 look" path=hyperframes/media-use/SKILL.md lines=42:44
@source offer title="hyperframes/media-use/SKILL.md · 5311B · 한 번만 제안" path=hyperframes/media-use/SKILL.md lines=46:48
@source where title="hyperframes/media-use/SKILL.md · 5311B · 작업별 reference 표" path=hyperframes/media-use/SKILL.md lines=50:63
@source resolve-types title="hyperframes/media-use/references/resolve.md · 10100B · type과 provider 표" path=hyperframes/media-use/references/resolve.md lines=11:22
@source resolve-weak title="hyperframes/media-use/references/resolve.md · 10100B · 약한 match" path=hyperframes/media-use/references/resolve.md lines=9:9
@source reuse-judge title="hyperframes/media-use/references/resolve.md · 10100B · 재사용 판단" path=hyperframes/media-use/references/resolve.md lines=76:92
@source guardrail title="hyperframes/media-use/references/resolve.md · 10100B · 신뢰 안전장치" path=hyperframes/media-use/references/resolve.md lines=94:96
@source floor title="hyperframes/media-use/references/resolve.md · 10100B · 자동 재사용 단계" path=hyperframes/media-use/references/resolve.md lines=98:108
@source setup-auth title="hyperframes/media-use/references/setup-providers.md · 9331B · 설치와 로그인" path=hyperframes/media-use/references/setup-providers.md lines=3:16
@source setup-host title="hyperframes/media-use/references/setup-providers.md · 9331B · host HeyGen access" path=hyperframes/media-use/references/setup-providers.md lines=18:29
@source setup-local title="hyperframes/media-use/references/setup-providers.md · 9331B · local 도구와 --local-only" path=hyperframes/media-use/references/setup-providers.md lines=31:65
@source heygen-auth title="hyperframes/media-use/references/heygen.md · 11846B · 로그인과 credential 순서" path=hyperframes/media-use/references/heygen.md lines=5:15
@source heygen-rules title="hyperframes/media-use/references/heygen.md · 11846B · generate 규칙" path=hyperframes/media-use/references/heygen.md lines=17:19
@source heygen-prices title="hyperframes/media-use/references/heygen.md · 11846B · 모델과 가격 표" path=hyperframes/media-use/references/heygen.md lines=49:61
@source treat-scope title="hyperframes/media-use/references/media-treatments.md · 14151B · 권한과 범위" path=hyperframes/media-use/references/media-treatments.md lines=9:23
@source treat-lane title="hyperframes/media-use/references/media-treatments.md · 14151B · 요청 분류" path=hyperframes/media-use/references/media-treatments.md lines=25:58
@source treat-two title="hyperframes/media-use/references/media-treatments.md · 14151B · 후보는 최대 둘" path=hyperframes/media-use/references/media-treatments.md lines=71:74
@source treat-cost title="hyperframes/media-use/references/media-treatments.md · 14151B · multipass 비용" path=hyperframes/media-use/references/media-treatments.md lines=124:131
@source treat-flow title="hyperframes/media-use/references/media-treatments.md · 14151B · 작업 순서" path=hyperframes/media-use/references/media-treatments.md lines=133:206
@source recipe-ui title="hyperframes/media-use/references/media-treatment-recipes.md · 35868B · UI Fidelity" path=hyperframes/media-use/references/media-treatment-recipes.md lines=148:163
@source recipe-flash title="hyperframes/media-use/references/media-treatment-recipes.md · 35868B · Social Flash 수치" path=hyperframes/media-use/references/media-treatment-recipes.md lines=923:927
@source grade-first title="hyperframes/media-use/references/grading.md · 7150B · treatment 우선" path=hyperframes/media-use/references/grading.md lines=9:18
@source grade-cube title="hyperframes/media-use/references/grading.md · 7150B · .cube를 읽지 않는다" path=hyperframes/media-use/references/grading.md lines=20:20
@source grade-css title="hyperframes/media-use/references/grading.md · 7150B · 애니메이션 가능한 CSS 속성" path=hyperframes/media-use/references/grading.md lines=73:94
@source local-sound title="hyperframes/media-use/references/local.md · 2626B · 소리 명령" path=hyperframes/media-use/references/local.md lines=21:25
@source local-cut title="hyperframes/media-use/references/local.md · 2626B · cutout" path=hyperframes/media-use/references/local.md lines=15:19
@source memory-prefs title="hyperframes/media-use/references/memory.md · 3828B · 기억하는 기본값" path=hyperframes/media-use/references/memory.md lines=3:17
@source memory-recipe title="hyperframes/media-use/references/memory.md · 3828B · recipe 묶음" path=hyperframes/media-use/references/memory.md lines=19:29
@source meta-tele title="hyperframes/media-use/references/meta.md · 6545B · 사용 기록과 개인정보" path=hyperframes/media-use/references/meta.md lines=36:62
@source mix-levels title="hyperframes/media-use/references/mixing.md · 4636B · 음량과 automation" path=hyperframes/media-use/references/mixing.md lines=5:30
@source mix-fx title="hyperframes/media-use/references/mixing.md · 4636B · effect chain" path=hyperframes/media-use/references/mixing.md lines=32:55
@source mix-duck title="hyperframes/media-use/references/mixing.md · 4636B · 음성 아래 음악" path=hyperframes/media-use/references/mixing.md lines=66:68
@source ops-parakeet title="hyperframes/media-use/references/operations.md · 16153B · 전사 엔진" path=hyperframes/media-use/references/operations.md lines=108:136
@source ops-loud title="hyperframes/media-use/references/operations.md · 16153B · 게시 loudness" path=hyperframes/media-use/references/operations.md lines=188:215
@source ops-ram title="hyperframes/media-use/references/operations.md · 16153B · 로컬 이미지 RAM 단계" path=hyperframes/media-use/references/operations.md lines=217:244
@source ops-dither title="hyperframes/media-use/references/operations.md · 16153B · 오차 확산 dither 수치" path=hyperframes/media-use/references/operations.md lines=74:106
@source bgm-pre title="hyperframes/media-use/audio/references/bgm.md · 8128B · Preflight 정지" path=hyperframes/media-use/audio/references/bgm.md lines=8:8
@source bgm-fail title="hyperframes/media-use/audio/references/bgm.md · 8128B · 실패 처리" path=hyperframes/media-use/audio/references/bgm.md lines=66:73
@source sfx-lic title="hyperframes/media-use/audio/references/sfx.md · 4137B · 라이선스" path=hyperframes/media-use/audio/references/sfx.md lines=10:12
@source sfx-lib title="hyperframes/media-use/audio/references/sfx.md · 4137B · Openverse와 bundled library" path=hyperframes/media-use/audio/references/sfx.md lines=34:48
@source tts-pre title="hyperframes/media-use/audio/references/tts.md · 14005B · Preflight 정지" path=hyperframes/media-use/audio/references/tts.md lines=7:7
@source tts-docs title="hyperframes/media-use/audio/references/tts.md · 14005B · docs 영상 narrator" path=hyperframes/media-use/audio/references/tts.md lines=9:35
@source transcribe-rule title="hyperframes/media-use/audio/references/transcribe.md · 2847B · 언어 규칙" path=hyperframes/media-use/audio/references/transcribe.md lines=3:32
@source transcript-qc title="hyperframes/media-use/audio/references/captions/transcript-handling.md · 5439B · 전사 품질 확인" path=hyperframes/media-use/audio/references/captions/transcript-handling.md lines=19:44
@source caption-mandatory title="hyperframes/media-use/audio/references/captions/motion.md · 5480B · 음악이면 audio-reactive 필수" path=hyperframes/media-use/audio/references/captions/motion.md lines=21:25
@source caption-rules title="hyperframes/media-use/audio/references/captions/authoring.md · 9422B · caption 제약" path=hyperframes/media-use/audio/references/captions/authoring.md lines=156:162
@source rmbg-quality title="hyperframes/media-use/audio/references/remove-background.md · 8472B · quality 단계" path=hyperframes/media-use/audio/references/remove-background.md lines=21:29
@source rmbg-not title="hyperframes/media-use/audio/references/remove-background.md · 8472B · 쓰면 안 되는 경우" path=hyperframes/media-use/audio/references/remove-background.md lines=141:145
@source credit-code title="hyperframes/media-use/scripts/lib/credit-limit.mjs · 2044B · 한도 검사 코드" path=hyperframes/media-use/scripts/lib/credit-limit.mjs lines=10:41
@source fetch-code title="hyperframes/media-use/scripts/lib/media-fetch.mjs · 2838B · 공개 URL만 허용" path=hyperframes/media-use/scripts/lib/media-fetch.mjs lines=38:63
@source bgm-vol title="hyperframes/media-use/audio/scripts/lib/bgm-volume.mjs · 236B · BGM 기본 음량" path=hyperframes/media-use/audio/scripts/lib/bgm-volume.mjs lines=2:4
@source duck-code title="hyperframes/media-use/scripts/audio-duck.mjs · 4069B · ducking 기본값" path=hyperframes/media-use/scripts/audio-duck.mjs lines=13:16
@source ov-code title="hyperframes/media-use/audio/scripts/lib/openverse.mjs · 4999B · Openverse 상수" path=hyperframes/media-use/audio/scripts/lib/openverse.mjs lines=12:15
@source sfx-code title="hyperframes/media-use/audio/scripts/lib/sfx.mjs · 7372B · SFX 음량과 library 주석" path=hyperframes/media-use/audio/scripts/lib/sfx.mjs lines=4:24
@source sfx-manifest title="hyperframes/media-use/audio/assets/sfx/manifest.json · 3721B · 효과음 목록(앞부분만)" path=hyperframes/media-use/audio/assets/sfx/manifest.json
@source sfx-credits title="hyperframes/media-use/audio/assets/sfx/CREDITS.md · 1183B · 효과음 출처 목록" path=hyperframes/media-use/audio/assets/sfx/CREDITS.md
@source ref-audio-out title="hyperframes/media-use/references/audio.md · 3362B · engine 출력 위치(.media)" path=hyperframes/media-use/references/audio.md lines=3:6
@source ref-audio-rec title="hyperframes/media-use/references/audio.md · 3362B · 녹음 변환 위치(assets)" path=hyperframes/media-use/references/audio.md lines=15:15
@source rec-code title="hyperframes/media-use/audio/scripts/lib/media-record.mjs · 4284B · 음성 파일 경로" path=hyperframes/media-use/audio/scripts/lib/media-record.mjs lines=39:39
@source bgm-code title="hyperframes/media-use/audio/scripts/lib/bgm.mjs · 11612B · BGM 파일 경로(앞부분만)" path=hyperframes/media-use/audio/scripts/lib/bgm.mjs lines=55:55
@source lock-code title="hyperframes/media-use/scripts/lib/manifest.mjs · 9424B · .media 락" path=hyperframes/media-use/scripts/lib/manifest.mjs lines=165:196
@source audio-code title="hyperframes/media-use/audio/scripts/audio.mjs · 14563B · 동시성과 BGM 모드" path=hyperframes/media-use/audio/scripts/audio.mjs lines=76:82
@source audio-mode title="hyperframes/media-use/audio/scripts/audio.mjs · 14563B · BGM 모드 결정" path=hyperframes/media-use/audio/scripts/audio.mjs lines=229:250

## 언제 켜지고 어떤 일을 맡나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어가 있어야 켜지는 사전이 아니다. `disable-model-invocation` 같은 호출 제한 필드는 frontmatter에 `name`과 `description`뿐이라 원문에 명시 없음.[](source:front)

@code source=front language=yaml

판정 · description은 영상용 media 구하기, 만들기, 믹스, 어둡거나 밋밋한 footage 보정을 한 스킬에 묶었다. 이름이 비슷한 요청을 다른 스킬과 구분하는 기준은 원문에 명시 없음.[](source:front)

필요한 것마다 쓰는 경로가 다르다. 무료 경로는 HeyGen 로그인이 필요한 항목이 많다.[](source:need)

| 필요한 것 | 무료 | HyperFrames credits | 로컬 또는 사람의 키(사람이 요청할 때만) |
| --- | --- | --- | --- |
| 음악 `bgm` | HeyGen catalog(로그인) | 생성 트랙 | 로컬 MusicGen[](source:need) |
| 효과음 `sfx` | HeyGen(로그인), Openverse, bundled | 없음 | 없음[](source:need) |
| 이미지, 아이콘 | HeyGen asset search(로그인) | 생성 이미지 | 로컬 FLUX(mflux), 설치된 경우[](source:need) |
| 로고 `logo` | theSVG, GitHub avatar, favicon. 다시 그리지 않는다 | 없음 | 없음[](source:need) |
| 음성 `voice` | Voice Turbo, Free plan 월 3분 | 유료 plan의 Voice Turbo, 다른 HeyGen 음성, 복제 | `npx hyperframes tts`(기기의 Kokoro)[](source:need) |
| 말하는 발표자 | 없음 | avatar video(`--type video`) | 일반 클립은 로컬 LTX, 설치된 경우[](source:need) |
| 전사 | `npx hyperframes transcribe` | 없음 | 없음[](source:need) |
| cutout | 없음 | video는 `--type cutout` | `npx hyperframes remove-background`[](source:need) |
| 색보정, LUT, look | `npx hyperframes media-treatment` | 없음 | 없음[](source:need) |

로컬 도구는 사람이 요청할 때만 쓴다. 로그인이 안 되어 있다는 이유로 몰래 로컬로 내려가지 않는다.[](source:signin)

쓰면 안 되는 때와 다른 길로 가는 때는 다음과 같다.

| 상황 | 원문이 정한 처리 |
| --- | --- |
| 글자, SVG, 로고, 아이콘, UI chrome, 일부러 stylized한 footage | 요청이 없으면 treatment 대상에서 뺀다 {bad:적용 안 함}[](source:treat-scope) |
| 앱·웹 화면 녹화 | 기본 payload는 없음이다. 색을 바꾸면 브랜드 색과 작은 글자가 같이 바뀌므로 crop, scale, 속도로 다듬는다[](source:recipe-ui) |
| 얼굴·번호판처럼 일부 영역만 가리기 | 실시간 효과는 선택한 media 전체에 걸린다. 영역을 먼저 따로 만들거나 외부 도구를 쓴다[](source:treat-scope) |
| HDR, HLG, PQ, LOG 원본 | 실시간 treatment 경로는 Rec.709/SDR이다. 조용히 처리하지 않는다[](source:treat-scope) |
| 브랜드 로고 | 손으로 다시 그리지 않고 `resolve --type logo`로 공식 마크를 구한다[](source:verb)[](source:resolve-types) |
| 사람이 빠진 빈 배경 | `remove-background`는 구멍 난 plate만 만든다. inpainter(LaMa 등)가 필요하다고 알려 준다[](source:rmbg-not) |
| REC HUD, light leak, flash 같은 이름 붙은 overlay | recipe가 Registry block 설치(`npx hyperframes add <이름>`)를 지시한다. 이 부분은 `hyperframes/hyperframes-registry`가 맡는다[](source:treat-flow) |
| 네트워크를 쓰면 안 되는 상황 | `--local-only`로 네트워크 provider를 모두 건너뛴다. HeyGen 전용 type은 새로 구할 수 없다[](source:setup-local) |

host app이 자기 media 도구를 가지고 있으면 그 도구를 먼저 쓴다. `HEYGEN_API_BASE`가 설정되어 있으면 host가 비용을 내므로 로그인을 요구하지 않는다.[](source:host)

## 무엇을 강제하고 어떤 수치가 걸리나? {#rules}

에이전트가 지키는 규칙은 다음과 같다.

| 규칙 | 내용 |
| --- | --- |
| 저장 위치 | media는 프로젝트의 local 파일과 ledger 기록으로 남는다. 렌더는 fetch하지 않는다. 위치 표기가 문서마다 다르다(흐름 속 위치 패널의 R25)[](source:verb) |
| 호출 형태 | `npx hyperframes media-use resolve --type <type> --intent "<필요>" --project <dir>`가 한 줄 `resolved <id> → <path>`를 출력한다[](source:verb) |
| 시작 beacon | 스킬이 시작될 때 `npx hyperframes events --skill=media-use`를 한 번 실행한다. 스킬 이름을 CLI telemetry와 함께 보내며 로그인했으면 계정에 연결되고 opt-out을 따른다. telemetry는 media type, 결과 출처, provider만 기록하고 intent 문구, 파일명, 경로는 보내지 않는다. `DO_NOT_TRACK=1`이나 `HYPERFRAMES_NO_TELEMETRY=1`로 끈다[](source:beacon)[](source:meta-tele) |
| credential 순서 | host app의 `HEYGEN_ACCESS_TOKEN`, `auth login` session, `HEYGEN_API_KEY`, `HYPERFRAMES_API_KEY`, 저장된 API key 순이다. 로그인 session이 env key보다 앞선다. 거절은 이름으로 고칠 길을 알린다: `api_key_required`는 API key, `402`나 `insufficient_credit`는 추가 credits, `hf_usage_exhausted`는 plan 사용량 소진이다[](source:heygen-auth) |
| helper 버전 | `heygen` helper를 쓰는 경로는 v0.3.0 이상이 필요하다. `heygen auth login`은 별개 로그인이라 이 경로를 설정하지 않는다[](source:setup-auth) |
| 재사용 판단 | `--candidates`로 project와 전역 cache 목록을 보고 맞는지는 에이전트가 정한다. 의미가 비슷한 항목은 자동으로 적용하지 않는다[](source:reuse-judge)[](source:floor) |
| 자동 재사용 | 대소문자와 공백을 정리한 뒤 prompt가 똑같은 경우만 자동으로 재사용한다[](source:floor) |
| 불확실할 때 | 새로 구한다. 중복 다운로드는 싸고 잘못된 asset을 내보내는 일은 비싸다[](source:guardrail) |
| 브랜드 asset | 전역 cache의 후보는 entity가 정확히 같을 때만 재사용한다. 다른 고객의 마크가 목록에 뜰 수 있다[](source:guardrail) |
| 약한 match | stderr에 `low-confidence match`가 찍힌다. 배치 전에 들어 보거나 다른 말로 다시 resolve한다. 맞는 효과음이 없으면 `no sound effect matched`로 실패한다[](source:resolve-weak) |
| Credits | 최선의 결과를 목표로 하고, 절약하라는 말이 없으면 싸거나 무료인 대체와 항목 삭제를 하지 않는다. 가격, 예상, 사용량을 먼저 말하지 않는다. `--plan`은 에이전트 전용이다[](source:credits) |
| 한도 | 사람이 정한 한도는 `.hyperframes/credit-limit.json`에 `{"credits": N}`으로 한 번 쓴다. 이후 유료 호출은 한도를 넘는 것을 거절한다. `--max-credits`는 더 조일 때만 쓴다[](source:credits) |
| 한도 아래 직접 호출 | 엔진이 `heygen`을 직접 부르면 가격을 계산할 수 없으므로 한도가 있을 때 거절하고 `media-use generate`로 만들게 한다[](source:credit-code) |
| 재시도 | 이름 붙일 수 있는 결함(컷, 글자, 잘못된 구도)이 있을 때만 한 번 다시 만든다. `content_policy_violation`은 문구를 바꿔 한 번, 실패나 거절 job은 한 번 더 시도하고 그다음 멈춰서 묻는다[](source:heygen-rules) |
| 생성물 | 그림과 shot에는 글자와 로고를 넣지 않는다. 깨끗한 plate를 요청하고 글자는 HyperFrames에서 그린다[](source:heygen-prices) |
| look | 실제 `<img>`나 `<video>`를 살펴 의도를 하나 고르고 `npx hyperframes media-treatment`로 저장한다. CSS, SVG, `.cube` 대용품을 쓰지 않는다[](source:looks) |
| 이름 붙은 스타일 | retro, 캠코더, 인쇄, ASCII, glitch는 일반 LUT와 손으로 만든 CSS 조합으로 만들지 않고 treatment 흐름을 쓴다[](source:grade-first) |
| `.cube` | 본문을 읽지 않는다. 숫자 수만 줄이 컨텍스트만 채운다. `grade-compare`로 렌더해서 본다[](source:grade-cube) |
| treatment 권한 | "더 좋아 보이게 해 줘"처럼 사람이 명시적으로 요청하면 보수적으로 적용하고 검증한 뒤 바뀐 내용을 보고한다. 요청 없이 빈틈을 훑다가 찾은 경우에는 먼저 보여 주거나 제안한다[](source:treat-scope) |
| 제안 방식 | 만들거나 리뷰한 영상에서 구체적인 빈틈(음성 없는 글자, 자리표시 이미지, 소리 없는 컷, 10 s 이상 음악 없음, 색 cast)을 한 번 훑어 한 번에 묻는다. 신호가 없으면 제안하지 않고 "그냥 둬"를 따른다[](source:offer) |
| 전사 | `--model`을 항상 지정한다. `.en` 모델은 영어가 아닌 소리를 영어로 번역해 원문을 지운다[](source:transcribe-rule) |
| 효과음 | CC0와 CC BY만 쓴다. CC BY는 `CREDITS.md`에 남기고 게시할 때 넣으라고 알린다. 맞는 소리가 없으면 건너뛰고 렌더를 막지 않는다. 생성하지 않는다[](source:sfx-lic)[](source:sfx-lib) |
| 음악 | 맞는 곡이 없거나 생성이 실패해도 렌더를 막지 않는다. 명시한 `retrieve`는 credential이 없으면 건너뛰고 몰래 생성하지 않는다[](source:bgm-fail)[](source:audio-mode) |
| docs 영상 음성 | hyperframes docs 사이트에 올릴 영상은 ElevenLabs의 River 한 목소리를 쓴다. 닿지 않으면 다른 목소리로 바꾸지 않고 말한 뒤 멈춘다[](source:tts-docs) |
| 음악이 있는 caption | 소스 오디오가 음악이면 audio-reactive 애니메이션을 반드시 붙인다[](source:caption-mandatory) |
| caption 제약 | 결정적으로 만들고(`Math.random()`, `Date.now()` 금지), 한 번에 한 그룹만 보이고, 그룹마다 끝에 hard `tl.set` 종료를 둔다[](source:caption-rules) |
| mixing | 같은 track에 `data-volume`과 volume lane이 함께 있으면 곱해진다. GSAP으로 같은 track의 `volume`을 따로 tween하지 않는다. voice track에 carve를 걸지 않고 `fromCarve`는 손으로 쓰지 않는다[](source:mix-levels)[](source:mix-fx)[](source:mix-duck) |
| 기억하는 기본값 | 사용자가 확인한 값만 기록하고 추정값은 기록하지 않는다. 기억한 값은 추천 기본값이 될 뿐 질문을 건너뛰게 하지 않는다. 승인된 recipe는 답한 질문을 건너뛸 수 있다[](source:memory-prefs)[](source:memory-recipe) |
| 다운로드 | 공개 HTTP(S) URL만 받는다. localhost, 사설 주소 대역, `.local`, `.internal`은 막고 redirect는 5번까지 따라간다[](source:fetch-code) |

수치와 적용 조건은 아래 표에 모았다. 수치는 문서의 지침과 코드 상수를 구분해 적었다. 가격은 문서가 적은 값이고 바뀔 수 있다.

| 항목 | 값 | 적용 조건 |
| --- | --- | --- |
| HeyGen catalog, asset search | 음악 10k+ 곡, 이미지 75k+ | 로그인한 경우. 문서의 설명치[](source:need) |
| Voice Turbo 무료분 | 월 3분 | Free plan[](source:need) |
| 한도 검사 | 추정치에 10%를 더해 비교 | GPT Image와 H3 호출. 한도를 넘을 수 있다고 문서가 적었다[](source:credits) |
| 생성 shot 길이 | 5-15 s | 프롬프트나 첫 frame에서 시작할 때. 더 긴 shot은 이어 붙인다[](source:heygen-prices) |
| 생성 음악 길이 | 30, 60, 120, 180 s | `--type music`. 기본은 instrumental[](source:heygen-prices) |
| API key 가격 | video 초당 $0.02(프롬프트·첫 frame) 또는 $0.05(reference·음성·guide, guide 초도 계산), 1080p는 약 2배 | `--plan`의 `usd`[](source:heygen-prices) |
| 기타 가격 | lipsync 영상 1초당 7 credits, avatar 1분 말하기 $4.83, 음악 1곡 $0.08 | lipsync는 plan 기준[](source:heygen-prices) |
| 이미지 가격 배율 | API key는 vendor 가격의 1.5배, plan은 vendor 가격에 1.6545배를 credits로 | 이미지 모델 표 기준[](source:heygen-prices) |
| 로컬 이미지 RAM | 약 8GB(`--low-ram` 필수), 약 32GB, 약 64GB | 각각 FLUX.1 schnell, FLUX.2 Klein, Qwen-Image 단계[](source:ops-ram) |
| Openverse 검색 | 결과 20개, 길이 15 s 이하만 사용, 약 4 s를 넘으면 순위가 낮아진다 | CC BY는 순위에서 2점 불리하다(코드 상수)[](source:sfx-lib)[](source:ov-code) |
| Openverse 호출 한도 | 익명 분당 20회, 하루 200회 | 넘으면 이번 실행의 나머지는 bundled library를 쓴다[](source:sfx-lib) |
| 효과음 음량 | 약 0.35 | 음성과 BGM 아래에 둔다[](source:sfx-lib)[](source:sfx-code) |
| BGM 음량 | 음성이 있으면 0.12(약 -18 dB), 없으면 0.9 | 기본값. `audio_meta.json`의 명시 `volume`이 우선한다[](source:bgm-vol)[](source:audio-mode) |
| ducking 지침 | 말하는 동안 약 0.3-0.4 | mixing 문서의 `volume` lane 권고[](source:mix-duck) |
| `audio-duck.mjs` 기본값 | duck 0.25배, attack 0.15 s, release 0.4 s, 끊김 병합 0.6 s | 스크립트 옵션 기본값[](source:duck-code) |
| 음량 기준 | 기본 -16 LUFS, 소셜 -14 LUFS, podcast -16 LUFS, true peak -1.5 | `normalize-audio` 기본과 `loudnorm` 예시[](source:local-sound)[](source:ops-loud) |
| docs 영상 narration | 분당 145-155 단어, 음악 약 -31 LUFS | hyperframes docs 사이트용[](source:tts-docs) |
| 재생 속도와 lane | 속도 0.1-10, lane당 최대 512 point | `data-playback-rate`와 `data-automation`[](source:mix-levels) |
| 색보정 animate 범위 | intensity 0-1, exposure -2-2, bloom 0-3 | `--hf-color-grading-*`. 값이 없으면 정적 payload가 쓰인다[](source:grade-css) |
| treatment 후보 수 | 처음엔 1개, 애매하면 최대 2개 | 둘 이상 겹치는 lane이 있을 때[](source:treat-two) |
| 전체 화면 multipass layer | 동시에 2개를 넘으면 연속 재생 확인 | 문서는 보편적인 상한을 두지 않는다고 적었다[](source:treat-cost) |
| flash overlay | 상승 0.035-0.055 s, 회복 0.24-0.38 s, 1초 안에 flash 1개 이하 | Social Flash 레시피[](source:recipe-flash) |
| dither | 색 2-6개, 점 크기 1-20px, brightness·contrast 0.5-2, detail 0.1-1 | `dither.mjs` 옵션[](source:ops-dither) |
| 전사 정확도 | Parakeet WER 6.05%, whisper.cpp 7.44%, 5-10배 빠름 | 문서가 인용한 Open ASR 순위. 직접 측정은 아니다[](source:ops-parakeet) |
| 전사 실패 기준 | `♪` 같은 토큰이 20%를 넘으면 `medium.en`으로 재시도 | 그래도 실패하면 사용자에게 알린다[](source:transcript-qc) |
| cutout 품질 | `fast` CRF 30, `balanced` 18, `best` 12 | VP9 인코딩 품질만 바뀌고 분할 품질은 같다[](source:rmbg-quality) |
| TTS 동시 실행 | 기본 4줄 | `HYPERFRAMES_TTS_CONCURRENCY`로 바꾼다. `speed`는 0 초과 3 이하[](source:audio-code) |
| `.media` 락 | 15 s 지난 락은 빼앗고 20 s 기다리면 timeout | 코드 상수[](source:lock-code) |
| 기본값 승격 | 서로 다른 2개 프로젝트에서 확정 | 개인 `~/.media/preferences.json`으로 올라가는 조건[](source:memory-prefs) |

@callout level=warning title="원문끼리 맞지 않는 수치"
| bundled 효과음 library는 문서와 코드 주석이 21개라고 적지만, 폴더의 mp3와 `manifest.json` 항목은 19개다.[](source:sfx-lib)[](source:sfx-code)[](source:sfx-credits) |
| ducking은 문서가 말하는 동안 약 0.3-0.4를 권하고, 스크립트 기본은 0.25배다. 우선순위는 원문에 명시 없음.[](source:mix-duck)[](source:duck-code) |

## 사람은 어디서 개입하고 언제 끝나나? {#human}

| 지점 | 에이전트가 하는 일 | 끝나는 조건 |
| --- | --- | --- |
| HeyGen이 필요한 요청 | 요청마다 `npx hyperframes auth status`를 먼저 돌린다. 로그인이 없으면 로그인이 무료이고 음악 catalog, asset search, Voice Turbo 월 3분이 열린다고 한 줄로 알린다[](source:signin) | 사람이 프롬프트에 `!`와 `npx hyperframes auth login`을 직접 치고 끝났다고 말할 때까지 기다린다[](source:signin) |
| `heygen` CLI가 없을 때 | helper와 직접 recipe는 `heygen` CLI가 필요하다. 없으면 링크를 주고 기다린다[](source:heygen) | 사람이 설치했다고 말한다. `media-use generate`는 로그인만으로 된다[](source:heygen) |
| 직접 `heygen` recipe | 그 CLI 자신의 로그인으로 과금되므로, 그 결제자가 선택된 경우에만 쓴다[](source:heygen) | 결제자를 선택한 사람의 결정[](source:heygen) |
| 로그인 없이 음성이나 음악 | Preflight 절차대로 로그인을 권하고 사용자의 선택을 기다린다. HeyGen 음성으로 갈지, 오프라인 로컬(Kokoro, 생성 음악)로 갈지 사람이 고른다[](source:tts-pre)[](source:bgm-pre) | 사람의 선택[](source:tts-pre) |
| 로컬 도구 | 사람이 요청할 때만 쓴다. Parakeet 모델 설치(약 640 MB)는 사용자에게 먼저 묻는다[](source:signin)[](source:ops-parakeet) | 사람의 요청과 승인 |
| 한도에 안 맞는 단계 | `--plan`이 남은 한도를 넘거나 호출이 거절되면, 줄이거나 빼기 전에 무엇이 안 맞는지 알리고 묻는다[](source:credits) | 사람의 결정 |
| `billing` 명령이 필요할 때 | 거절 메시지가 `billing` 명령을 이름으로 알려 주면, 이유를 설명하고 사람이 실행하게 한 뒤 다시 시도한다[](source:credits) | 사람이 실행한다. 에이전트가 직접 실행하지 않는다 |
| host app의 거절 | `HEYGEN_API_BASE`가 있을 때 거절된 호출의 메시지를 그대로 전달하고 멈춘다. 로컬이나 제3자 생성기로 몰래 내려가지 않는다[](source:host)[](source:setup-host) | 멈춤 |
| 개선 제안 | 구체적인 빈틈을 한 번에 묻는다. 이미 "그냥 둬"라고 했으면 따른다[](source:offer) | 사람의 답 |
| 음성 만들기 시도 | 한 번 다시 만들고 그래도 실패하면 멈춰서 사람에게 묻는다. 쓴 비용이나 다음 시도의 비용은 말하지 않는다[](source:heygen-rules) | 사람의 지시 |
| 전사 품질 | 20%를 넘는 `♪` 토큰은 실패로 보고 `medium.en`으로 다시 돌린다. 그래도 안 되면 오디오가 너무 시끄럽다고 알리고 가사 파일이나 외부 API를 제안한다[](source:transcript-qc) | 사람이 대안을 고른다 |

판정 · 이 스킬에서 에이전트가 혼자 끝낼 수 있는 일은 로컬 파일을 구하고 기록하는 것까지다. 로그인, 결제 한도, 결제자 선택, 모델 설치는 사람이 정한다.[](source:signin)[](source:credits)[](source:heygen)

@callout level=note title="Preflight 절 참조"
| `bgm.md`와 `tts.md`는 `SKILL.md`의 Preflight 절을 보라고 하지만, 이 `SKILL.md`에는 Preflight라는 절이 없다. 같은 내용이 "로그인" 문단에 있어 보이지만 원문이 연결하지는 않는다.[](source:bgm-pre)[](source:tts-pre)[](source:signin) |

## 흐름 속 위치는 어디인가? {#position}

`media-use`는 build-video 묶음의 선택지다. `hyperframes`가 요청 종류에 맞게 넘기고, 받은 media는 프로젝트 파일로 남아 컴포지션이 쓴다. 원장 기준의 위치이며 상대 스킬 원문은 이 분석에서 열지 않았다. 전체 흐름은 색인 기준 `_group-build-video/build-video.html`에 있다.

@workflow id=position-flow title="media-use의 앞뒤"
| hf | hyperframes | external |
| cli | hyperframes-cli | external |
| mu | media-use | backend | source:front |
| files | assets 파일과 ledger | database | source:verb |
| hf > mu | 넘김 R03 | emphasis |
| cli > mu | 참고 R10 | dashed |
| mu > files | resolve | emphasis |

@steps id=position-steps
| mu | media-use | 이 페이지의 스킬이다. media를 구하거나 만들어 프로젝트 로컬 파일과 ledger로 남기고, 그 파일을 컴포지션이 쓴다. | position-flow | mu |

| 관계 | 받는 것, 넘기는 것, 조건 |
| --- | --- |
| R03 · 넘김 · `hyperframes` → `media-use` | 발표자, avatar, footage, 음성, 음악 같은 media 요청과 grade, grain, blur 처리를 받는다. 강제 아님. 이 방향의 원문은 `hyperframes`에 있어 원장을 따랐다 |
| R10 · 참고 · `hyperframes-cli` → `media-use` | CLI 명령표의 Media and sound 행이 `media-treatment`, `tts` 같은 명령을 이 스킬로 연결한다. 원장 기준이다 |
| R13 · 참고 · `media-use` → `hyperframes` | HyperFrames plugin 안이라면 plugin 실행 규칙을 따른다. 조건은 plugin 안일 때뿐이다[](source:beacon) |
| R25 · 공유 상태 · `media-use` ↔ `hyperframes` | 같은 프로젝트 파일을 쓴다. 선후 관계는 없다. 원문끼리 위치가 다르다: SKILL.md는 `assets/`, resolve 예시는 `.media/<type>/`, 오디오 engine 문서는 한 곳에서 `.media/audio/`, 다른 곳에서 `assets/voice/`라고 적고 engine 코드는 `assets/voice/`와 `assets/bgm/`에 쓴다[](source:verb)[](source:resolve-types)[](source:ref-audio-out)[](source:ref-audio-rec)[](source:rec-code)[](source:bgm-code) |
| R24 · 공유 상태 · `media-use` ↔ `style-sampling` | 둘 다 사람이 말한 한도를 `.hyperframes/credit-limit.json`(`{"credits": N}`)에 쓴다. 선후 관계는 없다. 이 파일로 유료 호출을 막는 코드는 `credit-limit.mjs`에 있다[](source:credits)[](source:credit-code) |
| R23 · 참고 · `style-sampling` → `media-use` | 생성 media는 `media-use generate`로 만들고 Credits 규칙을 따른다. 원장 기준이다 |
| R19 · 참고 · `remotion-to-hyperframes` → `media-use` | 음량 ramp 형식은 `references/mixing.md`를 본다. 이 파일은 있다[](source:mix-levels) |
| R20 · 참고 · `reverse-any-video` → `media-use` | 로고는 원본에서 오리거나 `resolve --type logo`로 구한다[](source:resolve-types) |

원장에 없는 참조도 있다. `media-use`는 caption과 operations 문서에서 `hyperframes`의 `references/captions.md`, `format.md`, `motion.md`, `runtimes.md`를 가리키고, `hyperframes-registry`의 `catalog`와 `add`를 쓰라고 한다. 감사 패널의 제안에 적었다.[](source:caption-mandatory)[](source:treat-flow)

## 어디까지 읽고 확인했나? {#audit}

| 구분 | 확인 범위 |
| --- | --- |
| 읽은 텍스트 파일 | 106개, 합계 647,115B. 읽은 범위별 목록은 `skill-explainers/hyperframes/media-use/files.md`에 있다. |
| 전부 읽음 | 58개. `SKILL.md`, `references/` 14개, `audio/references/` 10개, 짧은 script와 라이브러리를 포함한다.[](source:skill) |
| 부분 읽음 | 48개. 구조·표본만 확인(전부 읽지 않음): 앞부분과 상수만 본 script 20개, 본문은 열지 않고 테스트 개수만 센 테스트 28개 |
| 바이너리 | mp3 19개, 합계 1,300,487B. 효과음이며 재생하거나 열지 않았다. 목록은 `manifest.json`과 `CREDITS.md`로만 확인했다.[](source:sfx-credits) |
| 제외 | `*.KO.md` 번역본은 이 폴더에 0개라 열 것이 없었다. `luts/index.json`은 앞부분만 확인했다. |
| 분석 중 바뀐 파일 | 없다. `hyperframes/media-use/` 아래 원본을 수정하지 않았다. 새로 만든 것은 이 폴더의 `candidate.archify.md`, HTML, `files.md`뿐이다. |

원문의 활성화 문장, 사람 개입, 종료 조건, 수치는 `SKILL.md`와 `references/`를 끝까지 읽고 대조했다. script는 문서가 가리키는 상수와 동작이 맞는지 일부만 확인했다.

@callout level=open-question title="확인하지 못한 것"
| 이 페이지는 지침 문서의 분석이다. `resolve`, `generate`, `auth`, `events`를 실행하지 않았으므로 실제 출력, 가격, 한도 거절 동작, telemetry 전송은 확인하지 못했다. |
| 부분 읽음 48개 파일에는 읽지 않은 분기가 있다. 특히 `tts.mjs`, `heygen.mjs`, `carve.mjs`, `telemetry.mjs`의 본문과 테스트는 열지 않았다. |
| 상대 스킬의 원문은 열지 않았다. R03, R10, R23의 반대편 근거는 원장 기준이다. |

@callout level=open-question title="원장과 원문이 다른 곳(제안)"
| 원장의 `media-use SKILL.md:` 줄 번호(R10 74-80, R13 68, R19 123, R20 78-80, R24 102, R25 74)는 63줄짜리 파일의 범위를 벗어난다. 실제 줄은 plugin 규칙 6, 한도 40, 로고 행 27, 소재 위치 12, reference 표 52-63이다.[](source:beacon)[](source:credits)[](source:need)[](source:where) |
| 원장에 `media-use` → `hyperframes`(`format.md`, `captions.md`, `motion.md`, `runtimes.md` 참고)와 `media-use` → `hyperframes-registry`(`catalog`, `add` 참고) 행이 없다.[](source:treat-flow) |
