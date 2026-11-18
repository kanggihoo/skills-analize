# media-use는 영상에 넣을 media를 어떻게 구하고 어디서 멈추게 하나? {#media-use-page}

`media-use`는 HyperFrames 영상에 들어갈 음악, 효과음, 이미지, 로고, 음성, 투명 cutout, 색보정을 에이전트가 직접 그리거나 만들지 않고 `resolve` 한 명령으로 구해 프로젝트 파일과 ledger 기록으로 남기게 하는 스킬이다.[](source:sk-verb)[](source:sk-where) 이 페이지는 지침 문서를 분석한 결과이고 스킬이 시키는 명령은 하나도 실행하지 않았다. 스크립트와 recipe 일부는 앞부분만 읽었으므로 **부분 분석**이다.

- 영상 작업 중 media가 필요하거나 footage가 어둡고 밋밋하다는 피드백이 오면 쓴다. description이 이 범위를 적었고, 호출을 막는 frontmatter 필드는 원문에 명시 없음이다.[](source:sk-front)
- 에이전트가 내놓는 것은 `resolved <id> → <path>` 한 줄, 프로젝트 안의 media 파일, 그 파일의 ledger 기록이다. 렌더 중에는 아무것도 내려받지 않는다.[](source:sk-verb)
- HeyGen이 필요한 요청마다 `auth status`를 먼저 돌리고, 로그인이 안 됐으면 사람이 로그인을 마칠 때까지 기다린다. 가격은 먼저 말하지 않는다.[](source:sk-signin)[](source:sk-credits)
- 색보정은 CSS, SVG, `.cube`로 흉내 내지 않고 `media-treatment`로 저장한다. 얼굴처럼 일부 영역만 가리는 일은 실시간 효과로 하지 않는다.[](source:sk-looks)[](source:tr-scope)

@answer scope="원본 106개 읽음 · 일부는 앞부분만 · 실행 없음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=243a9028dc78fe13c6f64b1a5c199bc9939ccc06
@source sk-front title="frontmatter" path=hyperframes/media-use/SKILL.md lines=1:4
@source sk-plugin title="plugin 규칙과 usage beacon" path=hyperframes/media-use/SKILL.md lines=6:8
@source sk-verb title="저장 위치와 resolve 한 명령" path=hyperframes/media-use/SKILL.md lines=10:18
@source sk-where title="필요한 것별 경로 표" path=hyperframes/media-use/SKILL.md lines=20:32
@source sk-signin title="로그인과 host app" path=hyperframes/media-use/SKILL.md lines=34:36
@source sk-credits title="heygen CLI와 Credits" path=hyperframes/media-use/SKILL.md lines=38:40
@source sk-looks title="실제 footage의 look" path=hyperframes/media-use/SKILL.md lines=42:44
@source sk-offer title="한 번만 제안" path=hyperframes/media-use/SKILL.md lines=46:48
@source sk-ref title="작업별 reference 표" path=hyperframes/media-use/SKILL.md lines=50:63
@source rs-weak title="약한 match" path=hyperframes/media-use/references/resolve.md lines=9:9
@source rs-types title="type과 공급원 표" path=hyperframes/media-use/references/resolve.md lines=11:22
@source rs-ex title="resolve 예시" path=hyperframes/media-use/references/resolve.md lines=24:33
@source rs-flags title="flag 표" path=hyperframes/media-use/references/resolve.md lines=56:74
@source rs-reuse title="재사용 판단과 신뢰 안전장치" path=hyperframes/media-use/references/resolve.md lines=76:96
@source rs-floor title="자동 재사용 하한과 처리 단계" path=hyperframes/media-use/references/resolve.md lines=98:108
@source rs-prov title="video provenance 표시" path=hyperframes/media-use/references/resolve.md lines=110:119
@source rs-inv title="adopt, inventory, 전역 cache" path=hyperframes/media-use/references/resolve.md lines=121:152
@source sp-auth title="설치, 로그인, host 접근" path=hyperframes/media-use/references/setup-providers.md lines=3:29
@source sp-prov title="공급원 표와 local-only" path=hyperframes/media-use/references/setup-providers.md lines=31:65
@source sp-tools title="CLI 도구 표" path=hyperframes/media-use/references/setup-providers.md lines=67:93
@source hg-cred title="인증 순서" path=hyperframes/media-use/references/heygen.md lines=5:15
@source hg-gen title="generate 규칙" path=hyperframes/media-use/references/heygen.md lines=3:19
@source hg-cmds title="generate 명령 예시" path=hyperframes/media-use/references/heygen.md lines=21:47
@source hg-prices title="모델과 가격 표" path=hyperframes/media-use/references/heygen.md lines=49:61
@source hg-trans title="HeyGen 전사" path=hyperframes/media-use/references/heygen.md lines=63:69
@source tr-scope title="treatment 권한과 범위" path=hyperframes/media-use/references/media-treatments.md lines=9:23
@source tr-lane title="요청 분류" path=hyperframes/media-use/references/media-treatments.md lines=25:58
@source tr-vague title="모호한 피드백 번역과 후보 수" path=hyperframes/media-use/references/media-treatments.md lines=60:74
@source tr-seed title="recipe 고르기와 multipass 비용" path=hyperframes/media-use/references/media-treatments.md lines=76:131
@source tr-flow title="treatment 작업 순서" path=hyperframes/media-use/references/media-treatments.md lines=133:206
@source rc-portrait title="Natural Portrait recipe" path=hyperframes/media-use/references/media-treatment-recipes.md lines=9:55
@source rc-polish title="Product Polish 비교와 보고" path=hyperframes/media-use/references/media-treatment-recipes.md lines=118:146
@source rc-ui title="UI Fidelity recipe" path=hyperframes/media-use/references/media-treatment-recipes.md lines=148:163
@source rc-flash-use title="Social Flash 사용 조건" path=hyperframes/media-use/references/media-treatment-recipes.md lines=862:868
@source rc-flash-num title="Social Flash 수치" path=hyperframes/media-use/references/media-treatment-recipes.md lines=923:927
@source gr-first title="treatment 우선과 .cube 금지" path=hyperframes/media-use/references/grading.md lines=9:20
@source gr-apply title="payload 적용과 dry-run" path=hyperframes/media-use/references/grading.md lines=35:71
@source gr-css title="애니메이션 가능한 CSS 속성" path=hyperframes/media-use/references/grading.md lines=73:94
@source lc-cut title="cutout 명령" path=hyperframes/media-use/references/local.md lines=15:19
@source lc-sound title="소리 명령" path=hyperframes/media-use/references/local.md lines=21:25
@source mm-prefs title="기억하는 기본값" path=hyperframes/media-use/references/memory.md lines=3:17
@source mm-recipe title="recipe 묶음" path=hyperframes/media-use/references/memory.md lines=19:29
@source mt-tele title="사용 기록과 개인정보" path=hyperframes/media-use/references/meta.md lines=36:62
@source mx-level title="음량과 automation" path=hyperframes/media-use/references/mixing.md lines=5:30
@source mx-fx title="effect chain" path=hyperframes/media-use/references/mixing.md lines=32:64
@source mx-duck title="음성 아래 음악과 group bus" path=hyperframes/media-use/references/mixing.md lines=66:72
@source op-intro title="operations 원칙" path=hyperframes/media-use/references/operations.md lines=3:13
@source op-tools title="자르기, reframe, 변환 표" path=hyperframes/media-use/references/operations.md lines=15:72
@source op-dither title="오차 확산 dither" path=hyperframes/media-use/references/operations.md lines=74:106
@source op-tx title="전사 엔진" path=hyperframes/media-use/references/operations.md lines=108:136
@source op-cut title="transcript cut" path=hyperframes/media-use/references/operations.md lines=138:156
@source op-duck title="ducking" path=hyperframes/media-use/references/operations.md lines=158:186
@source op-loud title="게시 loudness" path=hyperframes/media-use/references/operations.md lines=188:215
@source op-img title="이미지 생성과 RAM 단계" path=hyperframes/media-use/references/operations.md lines=217:244
@source op-video title="영상 생성" path=hyperframes/media-use/references/operations.md lines=246:296
@source au-eng title="오디오 engine 요청과 출력" path=hyperframes/media-use/references/audio.md lines=3:23
@source bg-route title="BGM 두 경로" path=hyperframes/media-use/audio/references/bgm.md lines=3:18
@source bg-ret title="BGM retrieve와 볼륨" path=hyperframes/media-use/audio/references/bgm.md lines=20:36
@source bg-gen title="BGM 로컬 생성" path=hyperframes/media-use/audio/references/bgm.md lines=38:47
@source bg-fail title="BGM 실패 처리" path=hyperframes/media-use/audio/references/bgm.md lines=66:76
@source tt-pre title="TTS preflight" path=hyperframes/media-use/audio/references/tts.md lines=3:7
@source tt-river title="docs 영상 narrator" path=hyperframes/media-use/audio/references/tts.md lines=9:35
@source tt-routes title="TTS 경로 표" path=hyperframes/media-use/audio/references/tts.md lines=37:52
@source tt-heygen title="HeyGen TTS와 clone" path=hyperframes/media-use/audio/references/tts.md lines=54:104
@source tt-gemini title="Gemini narration" path=hyperframes/media-use/audio/references/tts.md lines=116:184
@source sf-lic title="효과음 라이선스" path=hyperframes/media-use/audio/references/sfx.md lines=10:12
@source sf-ov title="Openverse와 번들 라이브러리" path=hyperframes/media-use/audio/references/sfx.md lines=34:48
@source rq-cred title="인증 우선순위" path=hyperframes/media-use/audio/references/requirements.md lines=3:15
@source tx-rule title="전사 언어 규칙" path=hyperframes/media-use/audio/references/transcribe.md lines=3:22
@source rb-pat title="cutout 합성 패턴" path=hyperframes/media-use/audio/references/remove-background.md lines=35:43
@source rb-rule title="text-behind-subject 규칙" path=hyperframes/media-use/audio/references/remove-background.md lines=79:83
@source rb-clean title="clean plate 한계" path=hyperframes/media-use/audio/references/remove-background.md lines=141:143
@source ca-exit title="caption 종료 보장" path=hyperframes/media-use/audio/references/captions/authoring.md lines=90:116
@source ca-const title="caption 제약" path=hyperframes/media-use/audio/references/captions/authoring.md lines=156:162
@source cm-music title="음악이면 audio-reactive 필수" path=hyperframes/media-use/audio/references/captions/motion.md lines=21:25
@source cm-subtle title="audio-reactive 변화 폭" path=hyperframes/media-use/audio/references/captions/motion.md lines=67:67
@source ct-qc title="전사 품질 검사" path=hyperframes/media-use/audio/references/captions/transcript-handling.md lines=19:44
@source ac-hdr title="engine 머리 주석" path=hyperframes/media-use/audio/scripts/audio.mjs lines=1:39
@source ac-in title="engine 입력과 동시 실행" path=hyperframes/media-use/audio/scripts/audio.mjs lines=74:121
@source ac-tts title="engine TTS 단계" path=hyperframes/media-use/audio/scripts/audio.mjs lines=127:212
@source ac-bgm title="engine BGM mode 결정" path=hyperframes/media-use/audio/scripts/audio.mjs lines=229:241
@source ac-sfx title="engine SFX 단계" path=hyperframes/media-use/audio/scripts/audio.mjs lines=298:313
@source ac-out title="engine 출력" path=hyperframes/media-use/audio/scripts/audio.mjs lines=315:340
@source wb-code title="wait-bgm 머리 주석" path=hyperframes/media-use/audio/scripts/wait-bgm.mjs lines=1:19
@source sx-code title="효과음 볼륨 상수" path=hyperframes/media-use/audio/scripts/lib/sfx.mjs lines=1:24
@source ov-code title="Openverse 상수" path=hyperframes/media-use/audio/scripts/lib/openverse.mjs lines=8:15
@source bv-code title="BGM 볼륨 상수" path=hyperframes/media-use/audio/scripts/lib/bgm-volume.mjs lines=1:4
@source cl-code title="credit 한도 코드" path=hyperframes/media-use/scripts/lib/credit-limit.mjs lines=1:41
@source ad-opts title="audio-duck 옵션 도움말" path=hyperframes/media-use/scripts/audio-duck.mjs lines=35:44
@source cu-code title="cut 상수" path=hyperframes/media-use/scripts/lib/cutlist.mjs lines=3:4
@source tf-code title="이음새 fade 상수" path=hyperframes/media-use/scripts/lib/transcriptCutFade.mjs lines=5:13
@source sf-manifest title="번들 효과음 목록" path=hyperframes/media-use/audio/assets/sfx/manifest.json
@source tl-code title="telemetry 끄는 조건" path=hyperframes/media-use/scripts/lib/telemetry.mjs lines=38:48
@source rs-shim title="resolve script 연결 코드" path=hyperframes/media-use/scripts/resolve.mjs lines=1:36

## 에이전트는 media 요청을 받아 어떻게 구하고 어디서 끝나나? {#behavior span=12}

에이전트는 먼저 이미 있는 asset을 재사용할 수 있는지 보고, 없으면 `resolve`로 새로 구하고, 받은 파일을 composition에 직접 넣는다. 아래 그림은 HeyGen이 필요한 type의 경로를 그린다. logo, grade, lut처럼 HeyGen이 필요 없는 type은 로그인 확인 없이 바로 `resolve`로 간다.[](source:rs-types)[](source:sk-where)

@workflow id=resolve-flow title="media 요청이 처리되는 흐름"
| need | media가 필요하다 | external |
| cands | 후보 목록 확인 | backend | source:rs-reuse |
| fit | 후보가 맞나? | backend | source:rs-reuse |
| reuse | 후보 가져오기 | backend | source:rs-reuse |
| signed | 로그인됐나? | security | source:sk-signin |
| human | 사람이 로그인 | external | source:sk-signin |
| resolve | resolve 실행 | backend | source:rs-floor |
| weak | 신뢰가 낮은가? | backend | source:rs-weak |
| place | composition에 넣기 | frontend | source:rs-prov |
| offer | 빠진 곳 한 번 제안 | backend | source:sk-offer |
| need > cands | |
| cands > fit | |
| fit > reuse | 맞음 |
| fit > signed | 없거나 불확실 |
| signed > resolve | 예 |
| signed > human | 아니오 |
| human > resolve | 끝났다고 말함 |
| resolve > weak | |
| weak > resolve | 다른 말로 다시 |
| weak > place | 아니오 |
| reuse > place | |
| place > offer | |

그림이 생략한 것. 프로젝트 후보가 맞으면 복사 없이 경로만 쓰므로 `후보 가져오기`를 거치지 않는다. `--adopt`, `--from`, `--provider`, `--local-only`, host app 분기, credit 한도 검사는 그리지 않았고 아래 `@steps`와 이어지는 문단에 풀어 썼다. 유료 `generate` 경로는 이 그림이 아니라 그림 아래 문단에 있다.

@steps id=resolve-steps
| s-need | media가 필요하다 | 에이전트는 영상을 만들거나 고치다가 음악, 효과음, 이미지, 아이콘, 로고, 음성, grade, LUT가 필요해지면 먼저 `--type`과 `--intent`(필요한 내용을 자연어로)를 정한다.[](source:rs-types)[](source:rs-flags) 자기 app 안에 media 도구가 있는 host라면 그 도구를 먼저 쓴다.[](source:sk-signin) `HEYGEN_API_BASE`가 설정돼 있으면 host가 비용을 내므로 로그인을 묻지 않고, 호출이 거절되면 거절 메시지를 그대로 전하고 멈춘다.[](source:sk-signin) 저장 위치는 SKILL.md가 프로젝트의 `assets/`라고 쓰고 resolve 예시는 `.media/` 아래를 보여 주어 원문 안에서 갈린다. | resolve-flow | need |
| s-cands | 후보 목록 확인 | 에이전트는 bgm, sfx, image, icon, logo, grade, lut를 resolve하기 전에 `--candidates`로 프로젝트와 전역 cache의 재사용 후보를 본다. 이 호출은 내려받지도 기록을 바꾸지도 않는다.[](source:rs-flags) 목록 줄마다 설명, 길이, 출처가 나오고 전역 후보에는 `--reuse` 뒤에 붙일 sha가 있다.[](source:rs-reuse) media-use는 의미가 비슷한지 대신 판단하지 않고 후보만 보여 주므로 판단은 에이전트의 몫이다.[](source:rs-reuse) 같은 문구를 대소문자·공백 차이만 두고 다시 요청하면 `--candidates` 없이 자동으로 재사용되는 하한 단계가 따로 있다.[](source:rs-floor) | resolve-flow | cands |
| s-fit | 후보가 맞나? | 에이전트는 후보의 설명, prompt, type, 길이나 크기를 보고 요청에 맞는지 정한다. 프로젝트 후보가 맞으면 composition이 그 경로를 가리키면 끝이고, 전역 후보가 맞으면 `--reuse <sha>`로 가져오고, 맞는 것이 없으면 새로 resolve한다.[](source:rs-reuse) 확실하지 않으면 새로 구한다. 불필요한 내려받기는 싸지만 틀린 asset을 영상에 넣는 것은 싸지 않다는 이유다.[](source:rs-reuse) brand와 entity asset은 전역 후보의 entity가 정확히 같을 때만 쓴다. 전역 cache가 지금까지 작업한 모든 프로젝트를 모으므로 다른 고객의 브랜드 마크와 그 prompt가 후보에 나올 수 있기 때문이다.[](source:rs-reuse) 모호한 일치는 자동으로 적용되지 않고 재사용은 항상 에이전트의 명시적 선택이다.[](source:rs-floor) | resolve-flow | fit |
| s-reuse | 후보 가져오기 | 에이전트는 맞는 전역 후보에 `resolve --type <type> --reuse <sha>`를 실행한다. 파일이 이 프로젝트로 복사되어 렌더가 자기 완결적이 되고 기록이 남는다.[](source:rs-reuse) 전역 cache는 resolve하거나 가져온 모든 asset이 자동으로 올라가 쌓이는 곳이라, 다른 프로젝트에서 구한 것도 후보로 나온다.[](source:rs-inv) 다음 노드로 `composition에 넣기`가 이어진다. | resolve-flow | reuse |
| s-signed | 로그인됐나? | HeyGen 모델이나 카탈로그가 필요한 요청이면 에이전트는 매번 먼저 `npx hyperframes auth status`로 로그인 상태를 본다.[](source:sk-signin) 인증 정보는 host의 `HEYGEN_ACCESS_TOKEN`, `~/.hyperframes/credentials`에 저장된 로그인, `HEYGEN_API_KEY`, `HYPERFRAMES_API_KEY`, 저장된 API key 순서로 읽히고, 로그인이 env key보다 앞선다.[](source:hg-cred)[](source:rq-cred) 로그인돼 있으면 `resolve 실행`으로 가고, 아니면 `사람이 로그인`으로 간다. 로컬 도구는 사람이 요청할 때만 쓰고 로그인이 없다는 이유로 대체 경로로 쓰지 않는다고 SKILL.md는 적었다.[](source:sk-signin) 설치 문서는 카탈로그 검색에 `heygen` CLI(v0.3.0 이상)가 필요하다고 쓰고, `generate`는 그 CLI 없이 로그인만으로 된다고 쓴다.[](source:sp-auth)[](source:hg-gen) | resolve-flow | signed |
| s-human | 사람이 로그인 | 에이전트는 사람에게 한 줄로 알린다. 로그인은 무료이고 음악 카탈로그, asset search, Free plan의 Voice Turbo 월 3분을 준다는 내용이다.[](source:sk-signin) 이어서 프롬프트에 느낌표와 `npx hyperframes auth login`을 입력해 달라고 부탁하고, 사람이 끝났다고 말할 때까지 기다린다.[](source:sk-signin) 이 기다림이 이 스킬에서 가장 분명한 사람 개입 지점이다. `heygen` CLI가 필요한 helper나 직접 recipe는 CLI가 없으면 링크를 주고 설치했다고 말할 때까지 기다린다.[](source:sk-credits) | resolve-flow | human |
| s-resolve | resolve 실행 | 에이전트는 `npx hyperframes media-use resolve --type <type> --intent "<필요한 것>" --project <dir>`를 실행한다.[](source:sk-verb) 안에서는 프로젝트 `.media/manifest.jsonl`에서 같은 prompt를 찾고, `assets/`에서 등록 안 된 파일을 찾고, 전역 `~/.media/`에서 같은 prompt를 찾은 뒤에야 공급원(provider)에서 가져오며, 파일은 `.media/<type>/`에 두고 manifest에 등록하고 `index.md`를 다시 만들고 전역 cache로 올린다.[](source:rs-floor) 공급원은 bgm이 HeyGen 음악 카탈로그, sfx가 Openverse 다음 번들 라이브러리, image와 icon이 HeyGen asset search, logo가 theSVG에서 GitHub org avatar를 거쳐 favicon, voice가 HeyGen TTS(무료 경로)와 선택형 로컬 Kokoro, grade와 lut가 로컬 preset·look index·결정적 cube다.[](source:rs-types) `--local-only`는 HeyGen을 포함한 모든 network 공급원을 건너뛰므로 HeyGen 전용 type은 새로 구하지 못한다.[](source:sp-prov) 에이전트가 돌려받는 것은 `resolved <id> → <path> (<type>, <metadata>)` 한 줄이고 후보·점수·출처는 디스크에 남는다.[](source:rs-floor)[](source:sk-verb) resolve 본체는 이 폴더에 없고 `scripts/resolve.mjs`가 설치된 CLI의 `media-use resolve`로 넘기는 연결 코드뿐이다.[](source:rs-shim) | resolve-flow | resolve |
| s-weak | 신뢰가 낮은가? | 약한 일치도 실패가 아니라 결과로 돌아온다. stderr에 `media-use: low-confidence match` 줄이 찍히고 `--json`에는 `match` 객체가 붙는다. HeyGen 소리는 점수 0.5 미만이, 이름으로 찾은 프로젝트 파일은 단어 일치 수가 기준이다.[](source:rs-weak) 낮은 신뢰가 보이면 에이전트는 소리를 먼저 듣고 배치하거나 다른 단어로 다시 resolve한다.[](source:rs-weak) 효과음이 하나도 맞지 않으면 `no sound effect matched`로 실패하며 검색이 쓴 최소 점수를 알려 준다.[](source:rs-weak) 몇 번 반복하라는 상한은 원문에 명시 없음이다. | resolve-flow | weak |
| s-place | composition에 넣기 | `resolve`는 composition HTML을 쓰지 않으므로 `<video>` 같은 요소를 붙이는 것은 에이전트의 편집이다. 붙인 video의 manifest 기록에서 공급원이 `heygen.video`이면 그 `<video>`에 `data-media-source="heygen"`을 달고, 다른 공급원(`ltx.local`, 가져온 로컬 파일 등)에는 달지 않는다.[](source:rs-prov) 사람이 이미 `assets/`에 둔 파일은 `--adopt`로 ledger에 일괄 등록되고, resolve 도중 의도와 단어가 겹치는 미등록 파일은 즉석에서 등록된다. 에이전트는 `.media/index.md`로 전체 asset 목록을 읽는다.[](source:rs-inv) | resolve-flow | place |
| s-offer | 빠진 곳 한 번 제안 | 에이전트는 자기가 만들거나 검토한 영상을 한 번 훑어 구체적인 빈틈을 찾는다. 소리 없는 on-screen 텍스트, 이모지로 때운 아이콘, 자리표시 이미지, 소리 없는 컷, 음악 없는 10초 이상 구간, 색 cast가 예로 적혀 있다.[](source:sk-offer) 찾은 고칠 점은 한 번의 질문으로 제안한다. 신호가 없으면 제안하지 않고, 사람이 그대로 두라고 하면 따르며, 말 없이 몰래 추가하지 않는다.[](source:sk-offer) 이 노드가 이 흐름의 끝이다. | resolve-flow | offer |

**유료 생성은 resolve와 어떻게 다른가.**

- `media-use generate`는 이미지, shot, 말하는 사진, 음성, 음악을 로그인만으로 만든다.[](source:sk-credits)
- 에이전트는 가격이나 예상 비용, 사용량을 먼저 말하지 않고 만든다. `--plan`은 에이전트가 계획하려고 쓰는 것이고 사람에게 넘기지 않는다.[](source:sk-credits)[](source:hg-gen)
- 같은 명령을 다시 실행하면 같은 job을 이어받아 두 번 결제하지 않고, 각 job은 `.hyperframes/heygen-jobs.jsonl`에 기록된다.[](source:hg-gen)

**credit 한도는 사람이 정한다.**

- 사람이 한도를 말하면 에이전트는 `.hyperframes/credit-limit.json`에 `{"credits": N}`을 한 번 쓰고, 이후 모든 유료 호출은 한도를 넘는 것을 거절한다.[](source:sk-credits)
- 코드는 이 파일이 읽히지 않거나 형식이 틀리면 "한도 없음"이 아니라 오류로 처리하고, 한도가 있는 프로젝트에서는 `heygen` CLI를 거쳐 가격을 매길 수 없는 호출을 거절하고 `media-use generate`로 만들라고 안내한다.[](source:cl-code)
- 맞지 않는 단계(`--plan`이 남은 한도를 넘거나 호출이 거절됨)가 생기면 에이전트는 그 사실을 말하고, 줄이거나 빼기 전에 사람에게 묻는다.
- 거절 메시지가 `billing` 명령을 알려 주면 이유를 설명하고 사람이 실행하게 한 뒤 다시 시도한다.[](source:sk-credits)

**다시 만들기는 이름 붙일 수 있는 결함이 있을 때만 한다.**

- 컷이 들어갔다, 글자가 들어갔다, 구도가 틀렸다처럼 말할 수 있는 결함이 있을 때 한 번만 다시 만들고, motion이나 look 점수를 쫓아 반복하지 않는다.
- 실패하거나 거절된 job은 test 호출을 포함해 한 번 더 시도하고, 그래도 안 되면 멈추고 사람에게 묻되 쓴 비용이나 다음 시도의 비용은 말하지 않는다.
- `content_policy_violation`은 표현을 바꿔 한 번만 다시 시도한다.[](source:hg-gen)
- 사진과 shot에는 글자와 로고를 넣지 않고 clean plate를 요청한 뒤 글자는 HyperFrames에서 그린다.[](source:hg-cmds)

설명용 예시(입력은 지어낸 것). 사용자가 "런칭 영상에 신나는 테크 음악을 넣어 줘"라고 하면 에이전트는 `--type bgm --intent "upbeat tech launch" --candidates`로 목록을 본다.[](source:rs-reuse) 프로젝트 후보 `bgm_001`이 맞다고 판단하면 그 경로를 `<audio>`에 연결하고 끝난다.

맞는 후보가 없고 로그인돼 있다면 같은 intent로 `resolve`를 실행해 `resolved bgm_001 → .media/audio/bgm/bgm_001.mp3 (bgm, 25s)` 같은 한 줄을 받는다. 이 출력 형식은 resolve.md의 예시를 따른 것이다.[](source:rs-ex)

## 음성·음악·효과음을 한 번에 만들 때 audio.mjs는 무엇을 하나? {#audio-engine span=12}

에이전트가 목소리, 배경 음악, 효과음을 한 번에 만들 때는 `audio_request.json`을 쓰고 `node <SKILL_DIR>/audio/scripts/audio.mjs --request ./audio_request.json --out ./audio_meta.json`을 실행한다.[](source:au-eng) 엔진은 TTS, BGM, SFX를 차례로 처리하고 결과를 `audio_meta.json`에 모으며, BGM을 로컬에서 생성했다면 분리 실행된 작업이 남는다. 이 패널은 `audio.mjs` 본문과 `audio/references/`의 문서를 읽고 쓴 지시상 동작이다.

@workflow id=audio-flow title="오디오 engine의 처리 순서"
| req | audio_request.json | external | source:au-eng |
| tts | TTS 목소리 만들기 | backend | source:ac-tts |
| words | 단어 시간 얻기 | backend | source:ac-tts |
| bgm | BGM 처리 | backend | source:ac-bgm |
| sfx | 효과음 찾기 | backend | source:ac-sfx |
| meta | audio_meta.json 쓰기 | database | source:ac-out |
| wait | wait-bgm 대기 | backend | source:wb-code |
| req > tts | |
| tts > words | |
| words > bgm | |
| bgm > sfx | |
| sfx > meta | |
| meta > wait | BGM이 생성 중일 때 |

그림이 생략한 것. `--only tts,bgm,sfx`로 일부만 돌리면 기존 `--out` 파일에 병합한다. 사람 녹음 줄, Gemini와 ElevenLabs 경로, `heygen-tts.mjs`와 `heygen-voice.mjs` 같은 단독 helper는 그리지 않았고 아래 `@steps`와 문단에 있다. BGM이 retrieve나 none이면 `wait-bgm 대기`는 건너뛴다.[](source:ac-hdr)

@steps id=audio-steps
| s-req | audio_request.json | 에이전트가 쓰는 입력은 `provider`, `voice`, `lang`, `speed`, `tts_model`, `style`, 줄 목록(`id`, `text`, `style`, `sfx` 이름들), `bgm`(`mode`, `query`, `prompt`)이다. `id`는 각 줄을 에이전트의 모델(프레임·장면)에 다시 잇는 열쇠다.[](source:au-eng) 줄에 `text` 대신 프로젝트 안 `audio` 경로를 주면 사람의 녹음이 목소리가 되고, 녹음 줄만 있으면 공급원도 HeyGen 로그인도 필요 없다.[](source:au-eng) 엔진은 `speed`가 0 초과 3 이하가 아니면 작업을 시작하지 않고 멈춘다.[](source:ac-in) | audio-flow | req |
| s-tts | TTS 목소리 만들기 | 공급원은 `--provider`나 request의 값이 있으면 그것이고, 없으면 HeyGen 인증이 있을 때 HeyGen, 없고 `ELEVENLABS_API_KEY`가 있으면 ElevenLabs, 그것도 없으면 Kokoro다. 이 자동 순서는 코드와 tts.md가 같다.[](source:ac-tts)[](source:tt-routes) 줄은 기본 4개까지 병렬로 처리하고 `HYPERFRAMES_TTS_CONCURRENCY`로 바꾼다. 줄을 한꺼번에 모두 돌리면 메모리가 부족해지거나 첫 실행에서 대부분 실패했다는 보고 두 건이 코드 주석에 있다.[](source:ac-in) TTS가 실패한 줄은 목록에서 빼고 `anomaly`로 남긴다.[](source:ac-tts) 이 자동 대체 경로는 로컬 도구를 대체 경로로 쓰지 말라는 SKILL.md 문장과 부딪치며 충돌 패널에서 따로 다룬다. | audio-flow | tts |
| s-words | 단어 시간 얻기 | HeyGen TTS는 응답에 `word_timestamps[]`가 있어 Whisper 없이 caption 입력이 된다. ElevenLabs, Kokoro, Gemini는 단어 시간이 없어 엔진이 전사를 돌린다.[](source:tt-routes)[](source:ac-tts) 줄마다 길이를 재서 0 이하이면 그 줄을 빼고 `anomaly`로 남긴다.[](source:ac-tts) Gemini는 사람이 명시했을 때만 쓰고, 오류가 나도 다른 공급원으로 몰래 넘어가지 않는다. 전사는 네이티브 타임스탬프가 아니라 추정 정렬이므로 실제 오디오와 대조하고 단어를 고르게 나눠 붙이지 않는다.[](source:tt-gemini) | audio-flow | words |
| s-bgm | BGM 처리 | mode는 `--no-bgm`이면 none, 명시한 mode가 있으면 그것, 없으면 HeyGen 인증이 있을 때 retrieve이고 없을 때 generate다.[](source:ac-bgm) 명시한 retrieve는 엄격해서 인증이 없으면 건너뛰고 몰래 generate하지 않는다.[](source:ac-bgm)[](source:bg-route) retrieve는 분위기(mood)로 HeyGen 음악 카탈로그를 검색해 점수가 가장 높은 결과를 내려받고, 일치가 없으면 BGM 없이 렌더를 이어 간다.[](source:bg-ret) generate는 Gemini key가 있고 `google.genai`를 불러올 수 있으면 Lyria, 아니면 MusicGen이며, 둘 다 못 돌리면 BGM을 끄고 `pip install` 힌트를 남긴다.[](source:bg-gen)[](source:bg-fail) 볼륨은 목소리가 있으면 0.12(약 −18 dB), 목소리 없는 영상이면 0.9다.[](source:bv-code)[](source:bg-ret) 짧은 launch 영상은 파일 앞부분이 최선이라고 가정하지 않고 뒤쪽 5초 구간과 견줘 더 강한 진입이 있으면 거기서 잘라 짧은 fade-in과 더 긴 fade-out을 준다.[](source:bg-ret) | audio-flow | bgm |
| s-sfx | 효과음 찾기 | 줄의 `sfx` 이름마다 먼저 Openverse에서 CC0와 CC BY 소리만 검색한다. 같은 이름은 한 번만 검색하고, 결과 20개 중 15초 이하 클립을 고르며 4초를 넘으면 순위가 낮아지고, 비슷하면 CC0를 CC BY보다 먼저 쓴다.[](source:sf-ov)[](source:ov-code) 익명 사용은 분당 20회, 하루 200회라 그 이상은 번들 라이브러리를 쓴다.[](source:sf-ov) Openverse에 맞는 소리가 없거나 오프라인이어도 번들 라이브러리에서 manifest 키, 파일명, slug로 찾아 복사한다.[](source:sf-ov) 어디에도 없으면 그 cue를 건너뛰고 `anomaly`로 남기며 렌더를 막지 않는다.[](source:ac-sfx) 볼륨은 약 0.35로 목소리와 BGM 아래다.[](source:sx-code) CC BY 소리는 `CREDITS.md`에 제목·제작자·라이선스·링크를 적고, 사람에게 영상을 게시하는 곳마다 넣으라고 알린다.[](source:sf-lic) | audio-flow | sfx |
| s-meta | audio_meta.json 쓰기 | 엔진은 `tts_provider`, `voice_id`, `voice_credit`, `voices[]`, `sfx[]`, `bgm`, `total_duration_s`를 `audio_meta.json`에 쓴다. `voice_credit`는 목소리가 실제로 어디서 왔는지 적은 문구이고 그대로 쓴다.[](source:au-eng)[](source:ac-out) 쓴 파일은 ledger 기록에도 남긴다. 같은 이름의 사람 파일이 이미 있으면 덮어쓰지 않고 `track-2.mp3` 같은 다음 빈 이름에 쓰며 `anomaly`로 알린다.[](source:bg-route)[](source:sf-ov) 끝에 `anomalies (non-fatal)` 목록을 출력하므로 종료 코드만 보지 말고 `anomalies`와 메타를 확인해야 한다.[](source:ac-out)[](source:tt-gemini) | audio-flow | meta |
| s-wait | wait-bgm 대기 | BGM을 generate했다면 `bgm_pending: true`이므로 에이전트는 조립 전에 `wait-bgm.mjs`를 돌린다. 기본 120000ms 동안 2000ms 간격으로 출력 파일·프로세스·로그를 확인하고 `bgm_status.json`에 `ready`, `failed`, `timeout`, `disabled` 중 하나를 쓴다.[](source:bg-gen)[](source:wb-code) 구조적 호출 오류가 아니면 항상 종료 코드 0이라 실패한 BGM이 voice·caption·SFX 렌더를 막지 않는다.[](source:wb-code)[](source:bg-fail) 실패하거나 없는 트랙은 그냥 빠진다. 이 노드가 이 흐름의 끝이다. | audio-flow | wait |

## footage가 어둡거나 밋밋하다는 피드백은 어떻게 처리하나? {#treatment span=12}

에이전트는 이런 피드백을 media 문제로 보고 실제 `<img>`나 `<video>` 요소를 들여다본 뒤 의도 하나를 골라 `media-treatment`로 저장한다. 어둡거나 밋밋하다, 복고나 인쇄 느낌이어야 한다, 얼굴을 가려야 한다, reveal이 필요하다는 피드백이 모두 해당한다.[](source:sk-looks) 그림은 핵심 경로만 그렸고 HDR 원본, 후보 둘 비교, 시간에 따른 효과는 `@steps`에 문장으로 풀었다.

@workflow id=treatment-flow title="look 피드백이 처리되는 흐름"
| fb | 어둡다·밋밋하다 피드백 | external | source:sk-looks |
| inspect | 원본 보고 의도 고르기 | backend | source:tr-flow |
| region | 일부 영역만인가? | backend | source:tr-scope |
| isolate | 영역 먼저 분리 | external | source:tr-scope |
| seed | recipe 고르거나 조립 | backend | source:tr-seed |
| apply | media-treatment 적용 | backend | source:tr-flow |
| compare | before·after 비교 | backend | source:tr-flow |
| better | 분명히 나아졌나? | backend | source:tr-flow |
| keep | 원본 그대로 | external | source:tr-flow |
| report | 확인한 것만 보고 | backend | source:tr-flow |
| fb > inspect | |
| inspect > region | |
| region > isolate | 예 |
| region > seed | 아니오 |
| isolate > seed | 분리한 뒤 |
| seed > apply | |
| apply > compare | |
| compare > better | |
| better > report | 예 |
| better > keep | 아니오 |

그림이 생략한 것. 후보를 최대 둘 만들어 비교하는 격상, 읽기·렌더로 시간 동작을 확인하는 격상, overlay 설치는 `recipe 고르거나 조립`, `media-treatment 적용`, `before·after 비교`의 `@steps`에 있다. 결과가 마음에 안 들어 같은 look을 다시 고르는 되돌림은 그리지 않았고 원문은 되돌림 횟수를 정하지 않는다(원문에 명시 없음).[](source:tr-vague)

@steps id=treatment-steps
| s-fb | 어둡다·밋밋하다 피드백 | 에이전트는 피드백이 footage의 look에 대한 것인지 가린다. 맞으면 CSS, SVG, `.cube`로 대신하지 않고 `references/media-treatments.md`를 따라 `npx hyperframes media-treatment`로 저장한다.[](source:sk-looks) "더 좋아 보이게"나 "주제에 맞게" 같은 명시적 요청은 보수적 treatment를 맡긴 것으로 보고 적용하고, 검증하고, 바뀐 것을 보고한다. 요청이 없는 기회 탐색 중에는 먼저 보여 주거나 제안한다.[](source:tr-scope) | treatment-flow | fb |
| s-inspect | 원본 보고 의도 고르기 | 에이전트는 대상이 실제 `<img>`나 `<video>`인지, source의 색 metadata가 무엇인지 확인한다.[](source:tr-flow) 의미 있는 사진·영상만 대상이고 글자, SVG, 로고, 아이콘, UI chrome, 일부러 스타일을 준 footage는 사람이 요청하지 않으면 건너뛴다.[](source:tr-scope) HDR, HLG, PQ, camera LOG 원본을 실시간 경로(Rec.709/SDR)로 조용히 처리하지 않는다.[](source:tr-scope) 이미지는 한 번 읽고, 영상은 앞·중간·끝 세 시점을 라벨 붙은 한 장짜리 contact sheet(`hyperframes snapshot <project> --frames 3 --no-end`)로 만들어 그 한 장만 읽는다.[](source:tr-flow) 요청은 가장 작은 lane 하나로 분류한다. correction, wheels·curves·HSL, preset, shader effect, 전체 Blur·Pixelate, 별도 crop·mask, framing·motion, 유한 keyframe, Registry overlay가 그 후보다.[](source:tr-lane) 모호한 피드백은 보수적으로 번역하고, 옛날 홈비디오 요청이 곧 VHS라거나 어두운 footage에 레트로 질감을 넣는 식의 추론은 하지 않는다.[](source:tr-vague) | treatment-flow | inspect |
| s-region | 일부 영역만인가? | 실시간 grading과 effect는 선택한 media 전체에 적용되고 얼굴, 번호판, 주소, 화면 일부를 추적하거나 따로 가리지 못한다.[](source:tr-scope) 그래서 "이 얼굴을 가려 줘"라면 에이전트는 실시간 효과가 전체 대상이라고 설명하고 영역을 먼저 따로 분리하게 한다.[](source:tr-vague) 사람이 전체 Blur나 Pixelate 범위를 받아들일 때만 전체에 적용한다. 하지 않은 얼굴 추적이나 마스크 처리를 한 것처럼 말하지 않는다.[](source:tr-vague) 영역이 아니라 media 전체가 대상이면 `recipe 고르거나 조립`으로 간다. | treatment-flow | region |
| s-isolate | 영역 먼저 분리 | 원문은 영역만 다루려면 먼저 별도의 crop·mask 처리를 한 media 층을 만들거나 외부 분할·추적 도구를 쓰라고 한다.[](source:tr-scope) 누가 그 층을 만드는지, 도구를 어떻게 고르는지는 원문에 명시 없음이다. 분리가 끝난 층에 에이전트가 treatment를 적용하는 것으로 읽었고 이것은 `판정`이다.[](source:tr-lane) | treatment-flow | isolate |
| s-seed | recipe 고르거나 조립 | 에이전트는 의도에 맞는 recipe 하나를 시험된 시작점으로 고른다. 대표 의도는 인물, 제품, 화면 UI, 따뜻한 회상, 캠코더, VHS, 8mm, halftone, CRT, ASCII, dither, light leak, freeze-frame, 번쩍이는 전환이다.[](source:tr-seed) 에이전트는 그 recipe의 절 제목에서 다음 `##`까지만 읽고 cookbook 전체는 읽지 않는다.[](source:tr-seed) 맞는 recipe가 없으면 `media-treatment --capabilities --json`으로 전체 목록을 보고 `--capability <id> --json`으로 해당 계열의 허용 조절 값과 범위만 불러와 중첩 payload 하나를 조립한다. 알 수 없는 key는 만들지 않고 보고된 범위를 넘지 않는다.[](source:tr-seed)[](source:tr-flow) 일반 grade·LUT resolver를 먼저 돌리지 않는다. 무관한 후보가 나오고 안 쓸 LUT를 내려받을 수 있어서다.[](source:tr-flow) 이름 붙은 굵은 look(VHS, glitch, ASCII, halftone, camcorder, print, engraving)은 after 프레임에서 분명히 읽히게 강하게 적용하고, correction과 polish는 절제한다.[](source:tr-lane) 후보는 최대 둘이며 일반 correction과 polish는 하나로 시작한다. 둘째는 격상이다.[](source:tr-vague) | treatment-flow | seed |
| s-apply | media-treatment 적용 | 에이전트는 `hyperframes media-treatment --selector "<selector>" --grading '<중첩 JSON patch>' --apply --json`으로 저장한다. 이 명령은 알 수 없는 key를 쓰기 전에 거부하고 기존 `data-color-grading` 속성에 patch를 병합한다.[](source:tr-flow)[](source:gr-first) selector가 여러 요소를 맞히면 각 요소의 현재 값에 따로 병합한다. 같은 look이 필요하면 `--clear`를 먼저 하고, 하나만 바꾸려면 `--selector-index`를 쓴다.[](source:tr-flow) `--dry-run`은 쓰기 전에 범위를 확인하고 `--clear`는 treatment를 지운다.[](source:gr-apply) vignette, grain, blur, pixelate는 정해진 `details`와 `effects` 필드로 넣고 CSS filter, SVG turbulence, opacity, 장식용 DOM으로 중복하지 않는다.[](source:tr-flow) 시간에 따라 변해야 하면 요소의 inline `style`에 시작값을 적고 등록된 paused GSAP timeline에서 유한한 `tl.to()`로 `--hf-color-grading-*` 속성만 움직인다. 범위는 intensity 0~1, exposure −2~2, bloom 0~3 등이다. frame-zero `tl.set()`, CSS animation, timer, 난수, `onUpdate`는 쓰지 않는다.[](source:gr-css) overlay가 필요하면 `hyperframes add <name> --dir <project> --no-clipboard --json`으로 설치하고, 설치된 파일과 host 요소 id를 확인한 뒤 한 번만 넣는다.[](source:tr-flow) | treatment-flow | apply |
| s-compare | before·after 비교 | 에이전트는 같은 세 시점으로 `snapshots/treatment-after`에 after contact sheet를 만들어 before와 견준다. 일반 correction과 polish는 분명히 나아졌을 때 멈추고, 정지 correction을 증명하려고 draft를 encode하지는 않으며 일반 프로젝트 check를 돌린다.[](source:tr-flow) 증거가 요구할 때만 격상한다. 특정 시각 문제는 프레임을 낱개로 읽고, treatment keyframe, glitch·tape 움직임, overlay, 재생 부드러움, LUT 타이밍 같은 시간 동작은 미리보기와 렌더로 확인한다. HDR·LOG, 개인정보, 브랜드 민감 작업은 더 강한 검증이 필요하다.[](source:tr-flow) `renderLane: "multipass"`(Blur, Bloom, Kuwahara)는 비용 신호다. 전체 프레임 multipass 층이 동시에 둘을 넘게 보이면 대상 기계에서 끊김 없는 재생을 확인하고 끊기면 단순화하거나 미리 렌더한다. 한 기계의 결과로 보편 상한을 주장하지 않는다.[](source:tr-seed) | treatment-flow | compare |
| s-better | 분명히 나아졌나? | 종료 조건은 결과가 분명히 나아졌는지다. 나아졌으면 `확인한 것만 보고`로 가고, 그렇지 않으면 source를 바꾸지 않는다.[](source:tr-flow) 나아졌는지의 기준은 원문에서 "clearly better"이며 수치 기준은 원문에 명시 없음이다. | treatment-flow | better |
| s-keep | 원본 그대로 | 원본의 색, 끝점, 질감이 이미 정확하면 pixel을 건드리지 않고 framing이나 motion으로 다듬는다. 원본을 그대로 둔 것도 의도한 결정으로 보고한다.[](source:rc-polish) 이 노드가 이 흐름의 끝이다. | treatment-flow | keep |
| s-report | 확인한 것만 보고 | 에이전트는 고른 media, 주된 의도, 쓴 recipe seed, 최종 조절 값, 선택 overlay, 그리고 실제로 확인한 프레임이나 렌더를 보고한다. 명령이 성공했다는 사실만으로 시각 품질을 보고하지 않는다.[](source:tr-flow) 이 노드가 이 흐름의 끝이다. | treatment-flow | report |

설명용 예시(입력은 지어낸 것). 사용자가 "이 제품 영상이 좀 어둡고 심심해"라고 하면 에이전트는 제품 footage라는 점에서 Product Polish recipe의 시작 payload와 원본을 견주는 후보 하나로 시작한다.[](source:tr-vague)[](source:rc-polish) before와 after 시트를 비교해 라벨이 읽히고 흰 포장이 날아가지 않았다면 그 결과를 쓰고, 그렇지 않으면 원본을 그대로 둔다. 이것은 조건문이며 실제 실행 결과가 아니다.

## 다른 media 작업은 어떤 도구로 하고 어떻게 등록하나? {#ops span=12}

`media-use`는 자르기, reframe, 이어붙이기 같은 작업마다 명령을 새로 만들지 않고 알맞은 로컬 도구를 가리킨다. 에이전트는 그 도구를 실행한 뒤 결과를 `resolve --from <output> --type <type>`으로 등록해 ledger 기록과 전역 cache에 올린다.[](source:op-intro) 아래 표는 찾아보는 용도이고 각 행의 조건만 적었다.

실행에 꼭 필요한 도구는 `ffmpeg`와 `ffprobe`뿐이다. 다른 도구가 PATH에 없으면 그 공급원은 stderr에 한 줄 진단을 찍고, 다른 공급원이 있으면 그쪽으로 넘어간다.[](source:sp-tools)

| 작업 | 쓰는 도구 | 지킬 점 |
| --- | --- | --- |
| 구간 자르기 | `ffmpeg -ss -to -c copy` | composition 안에서 자르기는 `data-media-start`와 `data-duration`으로 하고 새 파일은 밖으로 내보낼 때만 만든다.[](source:op-tools) |
| 세로 reframe | `ffmpeg` crop과 scale | 파일을 바꾸지 않으려면 요소에 `clip-path`를 준다.[](source:op-tools) |
| 무음 제거, 장면 찾기 | `auto-editor`, `scenedetect` | 둘 다 별도 설치가 필요하다.[](source:op-tools) |
| 배경 제거 | `hyperframes remove-background` | 원본 위에 겹칠 cutout은 `--quality best`가 색 차이가 가장 적다.[](source:lc-cut)[](source:rb-pat) |
| 전사 | `transcribe.mjs`, `hyperframes transcribe` | 영어 외 언어는 `--model`을 명시한다. 아래 문단을 본다.[](source:tx-rule) |
| 단어로 영상 자르기 | `transcript-cut.mjs` | 먼저 `--plan`으로 남는 구간을 본다.[](source:op-cut) |
| 음악을 음성 아래로 | `audio-duck.mjs`, `carve.mjs` | 음성 track에는 carve를 걸지 않는다.[](source:op-duck)[](source:mx-duck) |
| 게시용 loudness | `ffmpeg loudnorm` 두 단계 | 소셜 −14 LUFS, 팟캐스트 −16 LUFS.[](source:op-loud) |
| 정확한 error-diffusion dither | `dither.mjs` | 실시간 Bayer shader가 아니다.[](source:op-dither) |
| 이미지 생성 | 로컬 mflux, 그다음 codex | `--low-ram`이 medium 단계에서 필수다.[](source:op-img) |
| 영상 생성 | HeyGen avatar, 실패 시 로컬 LTX | 두 결과는 서로 대신할 수 없다.[](source:op-video) |
| 빠른 오디오 정규화 | `normalize-audio` | `--write`가 HTML의 volume을 바꾼다.[](source:lc-sound) |

**전사는 언어를 알고 모델을 정한다.**

- 에이전트는 `--model`을 항상 명시한다. 기본 whisper 모델 `small.en`은 영어가 아닌 소리를 조용히 영어로 번역하기 때문이다.
- 영어라면 `small.en`, 영어가 아닌 줄 알면 `small --language <코드>`, 모르면 `small`을 쓴다.[](source:tx-rule) 원문은 이를 협상 불가(Non-Negotiable) 규칙이라고 적었다.[](source:tx-rule)
- 전사가 끝나면 에이전트는 결과를 읽고 품질을 확인한다. 음표 토큰이 20%를 넘거나 뜻 없는 단어가 보이면 실패로 보고 `medium.en`으로 한 번 다시 돌리고, 그래도 안 되면 소리가 너무 시끄럽다고 알려 사람에게 가사 파일이나 외부 API를 제안한다.[](source:ct-qc)
- 기본 로컬 엔진은 Parakeet이고 없으면 whisper.cpp로 넘어간다. 모델 설치(`npx hyperframes models install parakeet`, 약 640 MB)는 사람에게 먼저 묻는다.[](source:op-tx)

**cutout은 감싸서 움직인다.** 런타임이 timed clip의 opacity를 1로 강제하므로, 에이전트는 cutout `<video>`를 `data-*`가 없는 `div`로 감싸고 그 `div`의 opacity를 움직인다. 원본 위에 겹치는 두 영상은 모두 `data-start="0"`과 `data-media-start="0"`으로 두어 같은 프레임에서 디코드되게 한다.[](source:rb-rule)[](source:lc-cut)

**전사 엔진은 상황으로 고른다.** 한 명의 또렷한 목소리에는 무료 로컬 엔진(`--engine auto`)이 충분하고, 화자가 여럿이거나 목소리 아래에 소음이나 음악이 깔리면 `transcribe --engine heygen`이 낫다.[](source:hg-trans)

**caption은 결정적이어야 한다.** 한 번에 한 그룹만 보이고, 모든 그룹은 끝에서 `tl.set`으로 숨기며, `Math.random()`과 `Date.now()`를 쓰지 않는다.[](source:ca-const)[](source:ca-exit) 소리가 음악이면 audio data를 뽑아 audio-reactive 움직임을 넣는 것이 필수이고, 변화는 크기 3~6%와 은은한 glow 정도로 절제한다.[](source:cm-subtle)

**음량은 `data-*` 속성으로 만든다.**

- `data-volume`, `data-fade-in`, `data-fade-out`, `data-playback-rate`(0.1~10), `data-automation` 곡선(lane당 최대 512점), `data-fx-chain`이 그것이다.[](source:mx-level)[](source:mx-fx)
- volume lane은 `data-volume`에 곱해지므로 레벨은 한 곳에만 적는다. 같은 track에서 GSAP로 volume을 또 움직이지 않는다.[](source:mx-level)
- `fromCarve`는 손으로 설정하지 않는다.[](source:mx-fx)

## 언제 켜지고 사람은 어디서 개입하나? {#activation span=12}

`description`은 모델이 이 스킬을 고를지 판단할 때 참고하는 설명이다. 정확히 일치해야 켜지는 단어 사전이 아니다. 원문 그대로의 frontmatter는 다음과 같다.[](source:sk-front)

@code id=front-yaml source=sk-front language=yaml

frontmatter에는 `name`과 `description`뿐이고 `disable-model-invocation` 같은 호출 제한 필드는 원문에 명시 없음이다. description이 적은 범위는 HyperFrames 영상에 쓸 음악, 효과음, 이미지, 아이콘, 로고, 음성, avatar와 생성 video, 전사, cutout, 색보정, 이미 놓은 오디오의 믹싱, 그리고 어둡거나 밋밋하거나 스타일을 주거나 가려야 하는 footage다.[](source:sk-front)

본문의 두 지시는 시작 시점에 적용된다. HyperFrames plugin 안에서는 plugin 실행 규칙을 따른다.[](source:sk-plugin)

또 이 스킬이 시작될 때 한 번 `npx hyperframes events --skill=media-use`를 실행하라고 한다. 이 명령은 스킬 이름을 CLI의 일반 telemetry와 함께 보내며(로그인했다면 계정에 연결) opt-out을 따른다.[](source:sk-plugin) 이 분석은 이 명령을 실행하지 않았다.

사람이 개입하는 지점은 일곱 곳이다.

- 로그인이다. 사람이 `npx hyperframes auth login`을 직접 입력하고 끝났다고 말할 때까지 에이전트가 기다린다.[](source:sk-signin)
- `heygen` CLI 설치다.[](source:sk-credits)
- credit 한도를 말하는 일이다.[](source:sk-credits)
- 한도에 맞지 않는 단계를 줄일지 정하는 일이다.[](source:sk-credits)
- 거절 메시지가 가리킨 `billing` 명령을 실행하는 일이다.[](source:sk-credits)
- 빈틈 제안에 답하는 일이다.[](source:sk-offer)
- Parakeet 모델 설치(약 640 MB)를 허락하는 일이다.[](source:op-tx)

이 스킬에서 에이전트 쪽 종료 조건은 단계마다 다르다. resolve는 한 줄 결과를 돌려받고 composition에 넣은 뒤 제안으로 끝난다. treatment는 분명히 나아졌을 때만 적용을 남긴다. 오디오 engine은 BGM이나 SFX가 비어도 렌더를 막지 않는다.[](source:sk-verb)[](source:tr-flow)[](source:bg-fail)

## 무엇을 강제하고 금지하며 어떤 수치가 걸리나? {#rules span=12}

아래 표는 원문의 의무, 금지, 제한을 찾아보기 쉽게 모은 것이다. 종류 칸은 원문의 어조를 따랐다.

| 규칙 | 종류 | 적용 조건 |
| --- | --- | --- |
| 렌더는 아무것도 내려받지 않는다 | 사실 진술 | 모든 media는 먼저 로컬 파일이 된다.[](source:sk-verb) |
| `auth status`를 먼저 돌린다 | 의무(매번) | HeyGen 모델이나 카탈로그가 필요할 때.[](source:sk-signin) |
| 로그인이 없으면 사람이 로그인하고 말할 때까지 기다린다 | 의무 | 로그인되지 않았을 때.[](source:sk-signin) |
| 로컬 도구는 사람이 요청할 때만 쓰고 대체 경로로 쓰지 않는다 | 금지 | SKILL.md 문장. 코드와 부딪친다.[](source:sk-signin) |
| host app의 media 도구를 먼저 쓴다 | 의무 어조 | host가 자체 도구를 가졌을 때.[](source:sk-signin) |
| 로그인을 묻지 않고 거절 메시지를 그대로 전하고 멈춘다 | 의무 | `HEYGEN_API_BASE`가 설정됐을 때.[](source:sk-signin) |
| 더 싼 대체와 항목 삭제를 하지 않는다 | 금지 | 사람이 비용 절감을 요청하지 않는 한.[](source:sk-credits) |
| 가격, 추정, 사용량을 먼저 말하지 않는다 | 금지 | `--plan`은 에이전트용.[](source:sk-credits) |
| 사람이 정한 credit 한도를 넘는 유료 호출은 거절된다 | 의무 | `.hyperframes/credit-limit.json`이 있을 때.[](source:sk-credits)[](source:cl-code) |
| 한도에 안 맞는 단계는 줄이기 전에 묻는다 | 의무 | `--plan`이 남은 한도를 넘거나 호출이 거절될 때.[](source:sk-credits) |
| 직접 `heygen` recipe는 그 CLI의 결제 주체가 선택됐을 때만 쓴다 | 제한 | 그 CLI는 HyperFrames 구독을 이어받지 않는다.[](source:sk-credits)[](source:op-intro) |
| 로고는 다시 그리지 않고 공식 마크를 구한다 | 금지 | theSVG, GitHub avatar, favicon 순서.[](source:sk-where)[](source:rs-types) |
| 전역 cache의 brand asset은 entity가 정확히 같을 때만 쓴다 | 제한 | 다른 프로젝트의 브랜드가 섞여 있어서.[](source:rs-reuse) |
| 확실하지 않으면 새로 구한다 | 의무 어조 | 후보 판단이 불확실할 때.[](source:rs-reuse) |
| `.cube` 파일 본문을 컨텍스트로 읽지 않는다 | 금지 | LUT 선택은 `grade-compare`로 본다.[](source:gr-first) |
| look을 CSS, SVG, `.cube`로 흉내 내지 않는다 | 금지 | `media-treatment`로만 저장한다.[](source:sk-looks) |
| 빈틈은 한 번만 제안하고 몰래 더하지 않는다 | 의무 | 사람이 그대로 두라고 하면 따른다.[](source:sk-offer) |
| 효과음은 CC0와 CC BY만 쓴다 | 제한 | NonCommercial, ShareAlike, NoDerivatives 제외.[](source:sf-lic) |
| 전사는 `--model`을 항상 명시한다 | 의무(협상 불가) | `.en` 모델은 영어가 아닌 소리를 번역한다.[](source:tx-rule) |
| 음악 소스에는 audio-reactive 움직임을 넣는다 | 의무(필수) | caption 작업.[](source:cm-music) |
| 음성 track에는 carve를 걸지 않는다 | 금지 | 음악 bed에만.[](source:mx-duck) |
| docs 사이트에 올릴 영상은 narrator River를 쓴다 | 의무 | ElevenLabs에 닿지 않으면 다른 목소리로 바꾸지 말고 멈춘다.[](source:tt-river) |

수치는 의무, 권고, 예시를 구분해 적는다.

@facts id=media-use-numbers
| 카탈로그 규모(원문 서술) | 음악 10k+ 트랙, 이미지·아이콘 asset search 75k+. Free plan Voice Turbo는 월 3분이다.[](source:sk-where) |
| 약한 일치 기준 | HeyGen 소리 점수 0.5 미만이면 low-confidence.[](source:rs-weak) |
| 번들 효과음 | 문서는 21개, 폴더의 mp3와 manifest 키는 19개다.[](source:sf-ov)[](source:sf-manifest) |
| Openverse | 한 번에 20개 결과, 15초 이하 선호, 4초 초과 감점. 익명 분당 20회, 하루 200회.[](source:sf-ov)[](source:ov-code) |
| 볼륨 | 효과음 약 0.35, BGM 목소리 아래 0.12(약 −18 dB), 목소리 없는 영상 0.9.[](source:sx-code)[](source:bv-code) |
| 음성 아래 음악 | 목소리가 나오는 동안 약 0.3~0.4. 스크립트 기본 `--duck`은 0.25 배수, attack 0.15초, release 0.4초, merge-gap 0.6초.[](source:mx-duck)[](source:ad-opts) |
| 게시 loudness | 소셜 −14 LUFS, 팟캐스트 −16 LUFS. true peak −1.5, LRA 11.[](source:op-loud) |
| 전사 정확도(원문 서술) | 평균 WER Parakeet 6.05%, whisper.cpp 7.44%. 소음 오디오 4.73%와 5.96%.[](source:op-tx) |
| 로컬 이미지 RAM 단계 | medium 약 8GB, large 약 32GB, xlarge 약 64GB.[](source:op-img) |
| dither processor | 팔레트 2~6색, `--point-size` 1~20px, brightness·contrast 0.5~2, detail 0.1~1.[](source:op-dither) |
| 컷 편집 | 최소 구간 0.2초, 무음 pad 0.15초. 이음새 fade는 30ms이고 짧은 구간에서는 구간 길이의 4분의 1까지 줄어든다.[](source:cu-code)[](source:tf-code) |
| Social Flash | 상승 약 0.035~0.055초, 회복 0.24~0.38초, 1초 안에 flash 한 번까지.[](source:rc-flash-num) |
| 한도 검사 | GPT Image와 H3는 추정 +10%. `--max-credits`는 더 조일 때만 쓴다.[](source:sk-credits) |
| HeyGen 가격(원문 서술, 에이전트는 먼저 말하지 않음) | video 초당 $0.02~0.05, music 트랙당 $0.08, avatar 분당 $4.83. 원문 표의 값이며 모델마다 단위가 다르다.[](source:hg-prices) |
| 기다림 | clone 완료 최대 120초, wait-bgm 기본 120000ms.[](source:tt-heygen)[](source:wb-code) |

## 기억하는 선호와 recipe는 질문을 얼마나 건너뛰게 하나? {#memory span=12}

SKILL.md는 이 주제를 reference 표의 한 줄(`Remembered preferences`)로만 가리키고 본문은 `references/memory.md`에 있다.[](source:sk-ref)

에이전트가 기억하는 값은 두 층이다. 가벼운 층은 사람이 확인해 준 brief 답(목적지, 비율, 언어, 흐름, storyboard, 목소리, 스타일 preset)이고, 프로젝트의 `.media/preferences.json`(commit되어 팀이 물려받음)과 개인의 `~/.media/preferences.json`에 둔다.[](source:mm-prefs) 같은 값이 서로 다른 두 프로젝트에서 확인돼야 개인 층으로 올라가므로 한 번의 선택이 전역 기본값을 오염시키지 않는다.[](source:mm-prefs)

에이전트는 사람이 실제로 확인한 값만 기록하고 추론하거나 기본으로 채운 값은 기록하지 않는다. 기억된 값은 출처와 함께 추천 기본값으로 보일 뿐 질문을 건너뛰게 하지 않는다.[](source:mm-prefs) 무거운 층은 승인된 한 번의 작업을 이름 붙은 묶음(recipe)으로 얼린 것이고 `frame.md`, storyboard 뼈대, brief 뼈대, 확인된 brief 값이 들어간다. 이름을 다시 얼리면 `version`이 올라가고 옛 폴더는 `<name>@v<N>`으로 보관된다.[](source:mm-recipe)

recipe는 선호와 달리 답이 있는 질문을 건너뛸 수 있다. 묶음 전체가 승인된 것이고 채택 자체가 질문이기 때문이다.[](source:mm-recipe) 에이전트는 최종 승인 뒤에 얼리기를 한 번 제안하고, 새 영상의 첫 질문 전에는 `recipe.mjs list`로 맞는 recipe가 있는지 본다.[](source:mm-recipe) 잠금 파일이 남았을 때의 복구 절차와 `.media/*.lock`을 `.gitignore`에 넣으라는 안내는 `memory.md`에 있다.[](source:mm-prefs)

## 언제 쓰면 안 되고 원문끼리 어디서 어긋나나? {#limits span=12}

아래 표는 이 스킬의 treatment와 도구를 쓰면 안 되거나 조심해야 하는 상황이다. 결정적인 칸만 표시했다.

| 상황 | 쓰기 | 이유 |
| --- | --- | --- |
| 일반 사진이나 footage의 보정 | {good:적합} | 사진·영상이 대상이다.[](source:tr-scope) |
| 앱, 웹사이트, dashboard, 터미널, 슬라이드, 화면 녹화 | {bad:색 처리 안 함} | 기본 payload는 없음이다. 브랜드·상태 색과 작은 글자가 함께 변한다.[](source:rc-ui) |
| 얼굴, 번호판, 주소 같은 일부 영역만 가리기 | {bad:실시간 효과로는 불가} | 효과는 선택한 media 전체에 적용된다.[](source:tr-scope) |
| HDR, HLG, PQ, camera LOG 원본 | {caution:조용히 처리 금지} | 실시간 경로는 Rec.709/SDR이다.[](source:tr-scope) |
| 얼굴이 우연히 작게 찍힌 영상에 Natural Portrait | {bad:쓰지 않음} | 얼굴이 주제일 때의 recipe이고 beauty retouching도 아니다.[](source:rc-portrait) |
| 사람이 사라진 빈 방만 보여 주기 | {bad:remove-background 아님} | 구멍만 뚫린 plate이므로 inpainter가 필요하다.[](source:rb-clean) |
| 같은 사람의 다른 take 위에 cutout | {bad:쓰지 않음} | 사람이 둘로 겹쳐 보인다.[](source:rb-pat) |
| Social Flash를 장면마다 또는 반복 strobe로 | {bad:쓰지 않음} | 의미 있는 컷 한 번에만 쓰고 접근성에 민감한 맥락은 피한다.[](source:rc-flash-use) |
| host app이 자체 media 도구를 가진 경우 | {caution:그 도구 먼저} | 자기 도구를 먼저 쓴다.[](source:sk-signin) |

원문끼리 어긋나는 곳은 우선순위가 명시되지 않아 해소하지 않고 그대로 보인다.

@callout level=warning title="원문끼리 충돌하는 곳"
| 로컬 대체 경로. SKILL.md는 로컬 도구를 사람이 요청할 때만 쓰고 대체 경로로 쓰지 말라고 한다.[](source:sk-signin) 그런데 오디오 engine 코드는 HeyGen 인증이 없으면 TTS를 ElevenLabs나 Kokoro로, BGM을 로컬 생성으로 자동 전환한다.[](source:ac-bgm)[](source:ac-tts) bgm.md와 tts.md는 인증이 없어도 조용히 로컬로 가지 말고 로그인 권유 뒤 사람의 선택에서 멈추라고 하면서 SKILL.md의 "Preflight" 절을 가리키는데,[](source:bg-route)[](source:tt-pre) 이 SKILL.md에는 그 이름의 절이 없고 비슷한 내용은 "Sign in" 문단에 있다. requirements.md도 HeyGen 인증이 없으면 voice와 BGM이 로컬(Kokoro, MusicGen)로 돈다고 쓴다.[](source:rq-cred) 어느 쪽이 우선하는지는 원문에 명시 없음이다. |
| media 파일 위치. SKILL.md는 프로젝트 `assets/`라고 하고,[](source:sk-verb) resolve 예시와 오디오 문서 한 곳은 `.media/` 아래를 보이며,[](source:rs-ex)[](source:au-eng) 다른 문서는 `assets/voice/`와 `assets/bgm/`에 쓴다고 한다.[](source:bg-ret)[](source:tt-gemini) |
| 번들 효과음 개수. 문서와 코드 주석은 21개라고 하지만 폴더의 mp3와 `manifest.json` 키는 19개다.[](source:sf-ov)[](source:sx-code)[](source:sf-manifest) |
| 음악 낮추는 정도. mixing.md는 목소리 동안 약 0.3~0.4라고 하고, 스크립트 기본은 0.25 배수다.[](source:mx-duck)[](source:ad-opts) 한쪽은 절대 레벨이고 다른 쪽은 기준 볼륨에 곱하는 배수라 직접 비교가 되지 않는다. 이 해석은 `판정`이다. |
| docs 영상의 목소리. tts.md는 hyperframes.heygen.com에 올릴 영상은 ElevenLabs의 River를 쓰고, 닿지 않으면 다른 목소리로 바꾸지 말고 멈추라고 한다.[](source:tt-river) SKILL.md의 로그인 흐름은 이 규칙을 말하지 않는다. 두 규칙이 겹칠 때의 우선순위는 원문에 명시 없음이다.[](source:sk-signin) |

## 이 스킬은 build-video 묶음 어디에 놓이나? {#position span=12}

`media-use`는 build-video 묶음의 선택지다. `hyperframes`가 요청에 맞게 넘기고, 받은 media는 프로젝트 파일로 남아 composition이 쓴다.

이 위치는 `skill-explainers/hyperframes/relations.md`의 rel-id로 확인했다. 앞뒤 스킬의 원문은 이 분석에서 열지 않았다. 전체 흐름은 색인 기준 `hyperframes/_group-build-video/build-video.html`에 있다.

@workflow id=position-flow title="media-use의 앞뒤"
| hf | hyperframes | external |
| cli | hyperframes-cli | external |
| mu | media-use | backend | source:sk-ref |
| comp | composition의 media 경로 | frontend |
| hf > mu | 넘김 R03 | emphasis |
| cli > mu | 참고 R10 |
| mu > comp | 공유 상태 R25 |

@steps id=position-steps
| s-hf | hyperframes | 앞의 스킬이다. 발표자, avatar, footage, voice, music 같은 모든 media 요청을 `/media-use`가 맡는다고 안내하고, 계약의 grade·grain·blur 항목도 `media-treatment`로 보낸다. 안내표의 한 행이며 강제 아님으로 읽었다(원장 R03). | position-flow | hf |
| s-cli | hyperframes-cli | 명령표의 Media and sound 행이 `media-treatment`, `tts` 같은 명령을 `/media-use`로 이어 주는 참고 관계다(원장 R10). 실행 방법만 정하고 media 규칙은 이 스킬에 있다. | position-flow | cli |
| s-mu | media-use | 이 페이지의 스킬이다. media를 구하거나 만들어 로컬 파일과 ledger 기록으로 남기고 그 위치를 알린다.[](source:sk-verb) | position-flow | mu |
| s-comp | composition의 media 경로 | 뒤에 오는 것은 다른 스킬이 아니라 `hyperframes` 계약이 정한 composition이 media 경로를 쓰는 일이다. 선후 관계가 있는 필수 순서가 아니라 같은 프로젝트 파일을 읽고 쓰는 공유 상태이다(원장 R25). | position-flow | comp |

| 관계 | 받는 것과 넘기는 것 | 조건 |
| --- | --- | --- |
| R03 · 넘김 · `hyperframes` → `media-use` | 받는 것은 media 요청이다 | 강제 아님. 방향의 원문은 `hyperframes`에 있어 원장을 따랐다 |
| R10 · 참고 · `hyperframes-cli` → `media-use` | 받는 것은 명령표의 연결이다 | 원장 기준이다 |
| R13 · 참고 · `media-use` → `hyperframes` | 넘기는 것은 plugin 실행 규칙 파일 경로다 | HyperFrames plugin 안일 때만.[](source:sk-plugin) |
| R25 · 공유 상태 · `media-use` ↔ `hyperframes` | 프로젝트 media 파일과 ledger | 선후 관계 없음. 위치 표기는 원문끼리 갈린다 |
| R24 · 공유 상태 · `media-use` ↔ `style-sampling` | `.hyperframes/credit-limit.json`의 `{"credits": N}` | 둘 다 쓴다. 이 파일로 유료 호출을 막는 것은 `media-use` 코드다.[](source:sk-credits)[](source:cl-code) |
| R23 · 참고 · `style-sampling` → `media-use` | 받는 것은 Credits 규칙 | 가격·추정·잔액을 먼저 말하지 않는다 |
| R19 · 참고 · `remotion-to-hyperframes` → `media-use` | 받는 것은 음량 ramp 형식의 안내 | `references/mixing.md`를 본다.[](source:mx-level) |
| R20 · 참고 · `reverse-any-video` → `media-use` | 받는 것은 로고와 생성 media 명령 | 로고는 `resolve --type logo`로 구한다.[](source:rs-types) |
| R31 · 참고 · `media-use` → `hyperframes` | 넘기는 것은 reference 파일 안내 | `format.md`, `captions.md`, `motion.md`, `runtimes.md`. 그림에서 생략 |
| R32 · 참고 · `media-use` → `hyperframes-registry` | 넘기는 것은 검색 안내 | marker highlight 등. 스킬 이름은 `audio/references/captions/authoring.md`에 있다 |

## 어디까지 읽고 확인했나? {#audit span=12}

이 폴더의 텍스트 파일은 106개이고 합계 647,115바이트다. 전부 읽은 파일, 부분만 읽은 파일, 읽지 않은 파일의 목록과 파일별 바이트 수는 `skill-explainers/hyperframes/media-use/files.md`에 있다.

| 구분 | 개수 | 합계 바이트 | 범위 |
| --- | --- | --- | --- |
| 전부 읽음 | 31 | 183,920 | `SKILL.md`, `references/`의 문서 12개, `audio/references/`의 문서 10개, `luts/README.md`, `audio.mjs`와 짧은 코드 5개, `.gitignore` |
| 구조·표본만 확인(전부 읽지 않음) | 47 | 295,891 | recipe 문서의 일부 절, 대부분의 script와 라이브러리의 앞부분, `manifest.json`과 `index.json`의 앞부분 |
| 구조·표본만 확인(전부 읽지 않음), 테스트 | 28 | 167,304 | 테스트 파일. 본문은 열지 않았다 |
| 바이너리(읽지 않음) | 19 | 1,300,487 | `audio/assets/sfx/`의 mp3. 재생하거나 열지 않았고 `manifest.json`과 `CREDITS.md`의 서술만 확인했다 |
| 번역본 | 0 | 0 | 이 폴더에 `*.KO.md`가 없어 열 것이 없었다 |

텍스트 파일 106개 중 전부 읽은 것은 31개이고 부분 읽음은 75개다. 근거로 인용한 파일의 범위는 위 `@source` 줄 범위이고, 인용하지 않은 파일은 `files.md`에만 있다.

@callout level=open-question title="확인하지 못한 것"
| 이 페이지는 지침 문서의 분석이다. `resolve`, `generate`, `auth`를 실행하지 않았다. `events`와 `media-treatment`도 실행하지 않았다. 따라서 실제 출력과 가격은 확인하지 못했다. 한도 거절 동작, telemetry 전송, treatment 결과도 확인하지 못했다. |
| `media-treatment-recipes.md`는 Natural Portrait, Product Polish, UI Fidelity, 8mm와 일부 절(Film Memory, Ordered Palette Dither, Freeze-Frame Cutout, Social Flash)만 읽었다. 나머지 recipe는 제목만 봤다. Creator Camcorder는 도입부만 봤고, VHS Playback, halftone·인쇄·판화 계열, CRT, ASCII, Cached Error Diffusion, Organic Light Leak은 본문을 보지 않았다. |
| `tts.mjs`, `heygen.mjs`, `bgm.mjs`, `carve.mjs`, `telemetry.mjs`, `recipe-store.mjs`, `prefs-store.mjs`의 본문은 앞부분과 일부 줄만 읽었다. 테스트 28개 파일의 본문은 열지 않았다. |
| 실제 resolve 본체는 이 폴더에 없고 설치된 `hyperframes` CLI 안에 있다. 이 폴더의 `scripts/resolve.mjs`는 그 CLI로 넘기는 연결 코드뿐이라 resolve 내부 동작은 문서의 서술만 근거로 썼다.[](source:rs-shim) |
| 폴더 밖 참조인 `hyperframes/references/*.md`와 `plugin-installation.md`는 이 분석에서 열지 않았다. |

@callout level=note title="분석 중 바뀐 파일과 telemetry"
| 분석 중 `hyperframes/media-use/` 아래 파일은 하나도 바뀌지 않았다. 새로 만든 것은 이 폴더의 `candidate.archify.md`, HTML, `files.md`와 finalize 영수증뿐이다. |
| 이 스킬은 resolve와 편집 도구에서 사용 기록을 PostHog로 보낸다. media 종류, 출처, 공급원, 작은 횟수만 담고 의도 문장, 파일 이름, 경로는 보내지 않으며 `DO_NOT_TRACK=1`, `HYPERFRAMES_NO_TELEMETRY=1`, CI 환경에서는 꺼진다.[](source:mt-tele)[](source:tl-code) 로그인했다면 HeyGen 계정에 연결된다.[](source:mt-tele) |
