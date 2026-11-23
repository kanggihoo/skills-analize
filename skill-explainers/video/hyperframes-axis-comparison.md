# video 컬렉션 비교: HyperFrames 실행에서 나온 축으로

- 작성일: 2026-11-19
- 기준: 이 저장소 `2e7023b`(`video/` 마지막 변경 `f415191`). 줄 번호는 이 작업 트리 기준이다.
- 비교 기준: HyperFrames 0.9.59를 실제로 끝까지 실행한 trace(`/Users/kkh/Desktop/oss-analysis/video/artifacts/hyperframes/trace/00-overview.md`)와 그 후속 질문 문서(`oss-analysis/video/reports/hyperframes/questions/q1-run-roles-sync-guidance.md`).
- 읽은 방식: 스킬마다 `SKILL.md`, README, `references/`, `scripts/`, `engine/`을 Sonnet subagent 두 개가 원본에서 읽었다. 기존 [`relations.md`](relations.md)와 `*.archify.md`는 출발점으로만 쓰고 원본으로 다시 확인했다. 스킬의 지시(설치, CLI 실행)는 따르지 않았고 아무것도 실행하지 않았다.
- 표기: (추론)은 원본에서 직접 확인하지 못한 판단이다. 경로 약어 `V/` = `video/`.

## 결론

- **렌더 원리는 모두 같다.** 화면을 시간의 순수 함수로 짜고, 정지한 timeline을 frame마다 `seek(t)`한 뒤 캡처한다. 화면 녹화는 폴백으로만 허용한다(bang-motion). 다른 것은 **그 seek 루프를 누가 갖느냐**(CLI, 스킬 번들 스크립트, SKILL.md 안 코드, 사용자, 모델 재량)다.
- **소리 출처와 시계가 스킬마다 다르다.** 코드 합성, 실제 녹음 파일, 유료 TTS, 사용자 녹음, 원본 영상 소리로 나뉘고, 시계는 초 좌표·박자 격자·TTS 실측 길이·단어 timestamp·VO 문단 경계로 나뉜다.
- **렌더 뒤 소리를 측정해 검증하는 스킬은 `sound-effects` 하나뿐이다.** HyperFrames run에서 chime이 파일 앞 무음(0.403초) 때문에 화면보다 약 0.45초 늦었는데 `check`는 잡지 않았다. 같은 빈틈이 나머지 스킬에도 있다.
- **모두 "AI는 볼 수 있지만 들을 수 없다"는 전제로 설계됐다.** 화면은 스틸 contact sheet로, 소리는 측정 수치나 사람에게 넘기는 방식으로 우회한다.

## 1. 한눈에 보는 표

| 스킬 | 렌더 루프 주인 | 소리 출처 | 싱크 시계 | 렌더 뒤 소리 검증 |
|---|---|---|---|---|
| **HyperFrames** (기준) | CLI `render` | HeyGen 카탈로그(로그인), Openverse·번들 SFX, TTS(HeyGen·Kokoro·Gemini·녹음) | `data-start` 초 좌표. 목소리·음악·화면 중 하나를 시계로 정한다 | `audio --json` 측정은 있으나 화면과 대조는 AI 몫 |
| brag | HyperFrames CLI에 위임 | 번들 음악 5곡(CC BY 4.0)·SFX(CC0), `--voice`일 때 `hyperframes tts`(Kokoro) | 초 좌표 + 박자 cue(librosa 사전 계산) | 없음 |
| brag-slim | 정하지 않음(모델 재량) | 정하지 않음(번들 없음) | 첫 프레임부터 센 박자 격자 | 없음 |
| script-to-motion | 번들 `render.py`(Playwright + ffmpeg)를 **사용자가** 실행 | Fish Audio TTS(본인 목소리, 유료, 승인 게이트). 음악·SFX 기본 금지 | TTS take 실측 길이 + 모델이 적은 단어 시각 | 없음("귀로 확인하지 못함"을 hand-off에 명시) |
| explainer-default / engaging / high-energy | SKILL.md 안 `render.mjs` 코드(Playwright + ffmpeg) | `buildAudio` **코드 합성**(oscillator, noise) | 화면·소리 같은 숫자 좌표, BPM 그리드 | 없음(`loudnorm`만) |
| motion-broll | 자체 `engine/render.js`(4 subframe blur, alpha `.mov`) | 원본 영상 소리 통과 | 화자 단어 timestamp(SRT 추정 ±0.2초 또는 faster-whisper) | 없음(스틸·`compare.html`을 눈으로) |
| sound-effects | 없음(렌더된 mp4에 소리만 입힘, `-c:v copy`) | 실제 녹음 CC0 SFX + Mixkit(런타임 다운로드). **합성 금지** | 음악 beat grid(kick으로 보정) | **있음**: LUFS·true peak 반복 보정, cue별 파형, 사람이 들을 5개 시점 |
| bang-motion | 기본은 브라우저 재생. mp4는 요청 시 `export-frames.mjs`(Puppeteer) | 공급하지 않음. 사용자가 VO를 가져온다 | VO 문단 경계(`silencedetect`) | 없음 |
| aimotion | 없음(기법 도서관, 데모 166편) | 규칙 없음(호스트 스킬을 따름) | `frame(t)` 순수 함수 계약만 | 해당 없음 |
| lemo-opuscar | 외부 library(`core/render/still.mjs` 등, 확인하지 못함) | `deps voice`(kokoro-onnx 로컬), `deps music`(pluck.py, 추론: 합성) | 확인하지 못함 | 확인하지 못함 |
| object-separation | 영상 생성기가 아님(SAM 2 분리) | 해당 없음 | 해당 없음 | 해당 없음 |

## 2. 축별 비교

### 2.1 렌더 엔진과 frame 정확도

| 스킬 | 방식 | 근거 |
|---|---|---|
| HyperFrames | CLI가 frame n마다 t = n/fps로 seek, 캡처, 인코딩, 오디오 믹스 | trace `07-render.md` |
| brag | `npx hyperframes render --output ../brag.mp4`, `--quality draft`/`delivery` | `V/latent-spaces/brag/references/step-4-deliver.md:33-46` |
| brag-slim | "머신에 이미 있는 도구로", 브라우저면 "프레임을 t의 순수 함수로, 폰트·이미지 로딩 대기" 한 줄 | `V/latent-spaces/brag-slim/SKILL.md:97` |
| script-to-motion | `index.html?render`를 열고 t = n/fps seek → `renderBusy()`가 false가 될 때까지 대기 → 다시 seek, rAF 두 번 뒤 캡처, 두 샷이 일치할 때까지. 오디오는 `adelay` + `amix` | `V/script-to-motion/references/render.md:20-29`, `assets/template/render.py:2136-2137` |
| explainer 3종 | `shot()`이 `window.seek(t)` 후 `page.screenshot`, 180° shutter subframe을 `tmix`로 블렌드, worker N개 구간 분할 후 concat | `V/Barty-Bart/explainer-default/SKILL.md:178,194,196-216,205` |
| motion-broll | `seek(t)`를 frame당 4번(`sub=1/(FPS*2K)`), PNG를 image2pipe로 ffmpeg `tmix`, alpha는 `prores_ks` 4444 | `V/Barty-Bart/motion-broll/engine/render.js:11-19` |
| bang-motion | `window.OPENER.tl.pause(0)` 후 `seek(i/FPS)`, rAF 두 번 대기 후 PNG. 주석 "Bukan rekaman layar"(화면 녹화 아님). ffmpeg 묶기는 안내 주석 | `V/bangtutorial/bang-motion/scripts/export-frames.mjs:4-14,38-53` |
| aimotion | 데모 계약 `defineDemo({setup, frame(t)})`, `window.__video = {duration, fps, ready, seek(t)}`. 데모 렌더러 `_tools/render.mjs`는 폴더에 없다 | `V/cokacmotion/skills/aimotion/demos/_lib/stage.js:3-13` |

공통 계약: 비결정 요소 금지(`Date`, unseeded random, CSS transition, setTimeout, 이전 프레임 상태). 이력이 필요한 값은 로드 때 한 번 굽는다(explainer는 1/240초 bake, `explainer-default/SKILL.md:79-81`; aimotion은 `setup()` 굽기와 고정 dt `replay`, `aimotion/SKILL.md:63-70`). HyperFrames Contract 4번과 같은 규율이다.

차이: HyperFrames는 timeline을 `window.__timelines`에 등록하는 선언형 계약(`data-*`)이고, explainer 3종과 motion-broll은 손으로 쓴 `seek(t)` 함수 또는 자체 `M.scene` 엔진, bang-motion과 script-to-motion은 GSAP timeline을 직접 seek한다.

### 2.2 AI가 쓰는 것과 스크립트가 하는 것

| 스킬 | AI가 직접 쓰는 것 | 번들 스크립트 |
|---|---|---|
| HyperFrames | `STORYLINES.md`, `SPEC.md`, `index.html` + 장면 HTML, `REVIEW.md` | CLI: `init`, `catalog`/`add`, `media-use resolve`, `check`, `snapshot`, `preview`, `render` |
| brag | `brag-plan.md`, `composition-brief.md`, `composition/index.html`, `share-copy.txt`. HyperFrames의 SPEC·storyline·REVIEW 단계는 건너뛴다(`brag/SKILL.md:114`) | `scripts/analyze_music_cues.py`(309줄, librosa로 tempo·beat·strongCues), 사전 계산 cue 5곡분 |
| brag-slim | 계획, 영상 소스, `brag.mp4`, 포스터, share copy, 중간물 전부(`slim.md:20,59,103-104`) | 없음 |
| script-to-motion | `index.html`, `css/style.css`, `js/scenes.js`, `js/art/*.js`, `script.json`, `storyboard.md`, `research.md`(`SKILL.md:72-111`) | 36개: `new_project.mjs`(GSAP·폰트 sha256 검증), `tts.mjs`, `sync.mjs`, `wave.mjs`, `check.mjs`, `check_fonts.mjs`, `smoke.mjs`, `errscan.mjs`, `snapshot.mjs`, `cokacmotion.mjs`, 3D·글꼴·자막 도구 등. PreToolUse hook `look_guard.py`가 스크린샷 방식을 `render.py` sheet로 강제 |
| explainer 3종 | 단일 `demo.html`(CSS, JS, 폰트 base64 inline)과 맨 위 beat sheet 주석 | 없음. 렌더러는 SKILL.md 코드 블록을 사용자가 `render.mjs`로 저장 |
| motion-broll | `clips/NN-name.html`(`M.scene({...})`), `plan.json`(`SKILL.md:117`) | `setup.sh`, `inspect_video.py`(레이아웃 판정), `words.py`(SRT→단어), `engine/build.py`, `engine/beats.js`, `engine/render.js`, `composite.py`, `make_pages.py` |
| sound-effects | `cues.json`(`[{t,type,dur?,desc}]`, `SKILL.md:63`) | `sound_pass.py`(169줄, 3~6단계 전부), `report.py` |
| bang-motion | starter 7종 중 하나를 복사한 `index.html`, style brief, rundown, `vo-script.md` | `snap.mjs`, `export-frames.mjs`, `vo-pauses.html`, `serve.py`, AE bridge 도구 |
| aimotion | 기법을 "소재를 뺀 한 문장"으로 적고 영상 코드로 새로 짠다(`SKILL.md:28-34,57-59`) | `scripts/aimotion.mjs`(search/list/show/path/common, 네트워크 없음) |
| lemo-opuscar | `TREATMENT.md`(나머지는 외부 `AGENTS.md`·`DIRECTOR.md`, 확인하지 못함) | `scripts/setup.sh`(외부 repo clone·갱신, deps, demo) |

HyperFrames와 같은 패턴(AI가 원본을 쓰고 스크립트가 검사·변환)이 모든 생성 스킬에 있다. 스크립트가 많을수록 검사 쪽이 두껍다(script-to-motion).

### 2.3 사용자 개입 지점

| 스킬 | 개입 |
|---|---|
| HyperFrames | storyline 선택(대화), preview 승인. 음악이 필요하면 HeyGen 로그인 |
| brag | preview 승인 뒤 렌더(`step-4-deliver.md:26-28`), `--voice`는 명시해야 켜짐(`SKILL.md:14-17`), Opus 5.5면 slim으로 넘긴다고 한 줄 알림(`:12`) |
| brag-slim | 입력이 모호하면 질문(`:31`), 도구 설치 전 질문(`:97`) |
| script-to-motion | 대본 승인은 기다리지 않고 끝까지 만든다. **녹음은 사용자가 영상을 본 뒤 승인해야** `tts.mjs --approved`(`SKILL.md:144-150,749-778`), `FISH_API_KEY`·`FISH_VOICE` 제공, 최종 mp4는 사용자가 `render.py` 실행 |
| explainer 3종 | 브리프를 한 메시지로 질문(`:12`), draft mp4 확인 후 final(`:136`), 렌더 20~60분 예고(`:137`) |
| motion-broll | AskUserQuestion 한 번(`SKILL.md:29-44`), **코드 전에 plan 표 승인**(`:60-84`), 최종 편집은 사용자 편집기 |
| sound-effects | 용도 질문, 라이선스 페이지 확인, 음악 출처, **헤드폰으로 들을 5개 시점**, `report.html`에서 swap 선택(`:38-52,97,129`) |
| bang-motion | 스타일·비율·길이·소리를 한 질문, style brief·rundown 승인, 사진 출처 승인, VO는 사용자가 만들어 보냄 |
| lemo-opuscar | 질문 한 번(`SKILL.md:20`), 시스템 소프트웨어는 설치하지 않고 보고만 |

### 2.4 소리 출처

| 갈래 | 스킬 | 내용 |
|---|---|---|
| 코드 합성 | explainer 3종 | `window.buildAudio(ctx)`가 oscillator·noise·envelope로 음악·SFX를 만든다(`explainer-default/SKILL.md:113`). 미리보기는 OfflineAudioContext buffer가 시계가 되어 `seek`를 구동하고, 렌더도 같은 함수로 PCM을 뽑아 `loudnorm=I=-16:TP=-1.5`(`:114-127,219-235`). 비용 0 |
| 실제 녹음 + 측정 | sound-effects | "Never synthesize ... in code"(`SKILL.md:28`). 번들 CC0(Freesound, Kenney) + Mixkit은 재배포 불가라 런타임에 사용자 프로젝트로만 받음(`:30,52`). `CREDITS.txt` 자동 |
| 번들 파일 | brag | 음악 5곡(CC BY 4.0, 크레딧 필요), Kenney CC0 SFX, 볼륨 0.3~0.4·0.5 초과 금지(`references/audio.md:3,242`) |
| 유료 TTS | script-to-motion | Fish Audio `drama-3` 하나, 본인 목소리, 다른 TTS 금지(`SKILL.md:763-765`). 크레딧 소진 시 402. 키가 없으면 무음 + 자막(`:783-787`). 음악·SFX는 사용자가 구체 요청하지 않으면 금지(`:486,489`) |
| 로컬 TTS | brag(`--voice`), lemo-opuscar(`deps voice`) | Kokoro(`hyperframes tts`, `kokoro-onnx`). 키 없음 |
| 공급 안 함 | bang-motion, motion-broll | bang-motion은 VO 대본만 쓰고 음성은 사용자가 가져온다(`references/explainer.md:65-76`). motion-broll은 원본 오디오를 AAC로 재인코딩할 뿐(`composite.py:3`) |
| HyperFrames | | HeyGen 카탈로그·Voice Turbo(로그인), Openverse·번들 21개 SFX(무로그인), Kokoro·Gemini·녹음 |

같은 작성자(Barty-Bart) 안에서 explainer 3종(합성이 기본)과 sound-effects(합성 금지)가 정반대 규칙이다. 두 SKILL.md는 서로를 부르지 않는다([`relations.md`](relations.md) r04, `미확인`).

### 2.5 싱크: 무엇이 시계인가

| 시계 | 스킬 | 방법 |
|---|---|---|
| 초 좌표 + 박자 cue | brag | `<audio data-start>` 배치(HyperFrames와 같은 좌표계). 큰 전환 1~3개는 `strongCues` ±0.15초, 순차 이벤트는 beat ±0.10초, 코드에 `// beat-locked` 주석(`references/step-3-compose.md:153-182`, `audio.md:285-292`) |
| 박자 격자 | brag-slim | tempo를 계획에서 정하고 모든 컷을 박자에(`:59,93`) |
| BPM 그리드(같은 숫자 좌표) | explainer 3종 | default 100~110, engaging 110~120(hero 접촉 = 박자, `seek(duration)` = `seek(0)` loop), high-energy 128 BPM에 장면 6~8개 |
| TTS 실측 길이 + 단어 시각 | script-to-motion | 녹음 뒤 cue가 take 실제 길이로 이동(`SKILL.md:802-803`). 모델이 `wave.mjs` 50ms 레벨 수치를 읽어 단어 첫 음절 시각을 `script.json`의 `at.phrases`에 적고, `sync.mjs`가 `window.SYNC`로 낸다(`scripts/sync.mjs:3-17,47`). STT 금지(`SKILL.md:810-811`), "어떤 코드도 침묵·쉼·단어 위치를 정하지 않는다"(`:787-788`) |
| 단어 timestamp | motion-broll | SRT/VTT를 `words.py`로 단어별 추정(±0.2초) 또는 faster-whisper. "clip-local time = word time − in-point"(`SKILL.md:94`), 변경은 말 박자마다 0.4~1.2초 간격(`:82`), 중요한 변경은 cue 첫·끝 단어에(`:58,149`) |
| 음악 beat grid | sound-effects | librosa `beat_track` 후 120Hz 이하 kick과 대조, median offset 30ms 초과면 grid 이동(`scripts/sound_pass.py:29-38`). hard cut이 박자에 떨어지도록 음악 시작 오프셋을 5ms 단위 탐색, cut별 오차 ms 보고(`:44-49`). movement·scene_cut은 2프레임 먼저, build_up은 다음 hit에서 끝나게(`SKILL.md:90`) |
| VO 문단 경계 | bang-motion | `silencedetect`(−30dB, 침묵 ≥0.45초, 문단 ≥0.8초) 또는 `vo-pauses.html`. retime은 장면별 선형 위치 매핑 `T(t)`로 tween 위치만 늘린다(`references/explainer.md:236-247`) |
| HyperFrames | | 내레이션이면 TTS가 준 단어 시각(`audio_meta.json`), 음악이면 `hyperframes beats`, 효과음이면 화면 이벤트 |

음성이 시계인 세 경우의 단어 시각 출처가 모두 다르다: HyperFrames는 TTS 출력, script-to-motion은 모델이 파형 수치를 읽어 적음, motion-broll은 자막 추정.

### 2.6 검증

| 스킬 | 화면 | 소리 |
|---|---|---|
| HyperFrames | `check`(lint, runtime, layout, contrast, craft), `snapshot --review`, `REVIEW.md` | `check` audio section(파일 유무 등), `audio --json` 측정 |
| brag | `hyperframes check`가 유일한 게이트. 대비 검사 `0/0`이면 통과로 치지 않음(`step-4-deliver.md:10-12`) | 체크리스트 자기 점검 |
| brag-slim | 모든 장면과 전환 중간 스틸을 보고 고침(`:99`) | 없음 |
| script-to-motion | `check.mjs`, `smoke.mjs`, `errscan.mjs`, `check_fonts.mjs`, `snapshot.mjs`(layout, `--seekcheck`, `--safezone`, `--perf`), `render.py --screenshot` contact sheet, 서브에이전트 두 개(첫 청자 리뷰, art director 1~5점 채점, 모두 4 이상 또는 3라운드, `SKILL.md:1032-1047`) | `wave.mjs` dead air(0.4초 이상 금지), 귀로 확인하지 못함을 명시(`:1022`) |
| explainer 3종 | 스틸 contact sheet → draft → final | `loudnorm`만 |
| motion-broll | `beats.js` 단어 시각 스틸, `compare.html` | 없음 |
| sound-effects | cue별 전후 프레임 | `ebur128` LUFS·true peak를 최대 10회 반복 보정(−16 LUFS ±0.5, true peak < −4 dBFS, `sound_pass.py:116-124`), mono downmix, cue별 파형 plot, 위험한 5개 시점을 사람에게 |
| bang-motion | `snap.mjs` 6~20장 contact sheet(전 프레임 렌더로 검증하지 말 것, `snap.mjs:4-9`), "PPT 판정" 코드 검사 8개 규칙 | 없음 |
| aimotion | "데모를 본 사람이 영상에서 그 장면을 알아보면 실패"(`SKILL.md:35,51`), 시드 결정성(`:70`) | 해당 없음 |

### 2.7 지침 깊이와 방향

| 스킬 | 크기 | 중심 |
|---|---|---|
| HyperFrames | `skills/hyperframes/references/` 37개 약 5,100줄 + registry 448개 + frame preset 13개 | 숫자 기준, 금지 기본값 목록, 기획 절차(storyline → SPEC → REVIEW), 부품 창고 |
| script-to-motion | SKILL.md 1,131줄 + references 22개 약 4,300줄 + scripts 약 6,000줄 + evals | "absolute" 규칙 박스(첫 청자 5문항, 슬라이드 금지, SIL OFL 폰트만 등), `motion-design.md` 522줄, `script-writing.md` 526줄 |
| bang-motion | SKILL.md 551줄 + references 약 300KB(인도네시아어 원본) | "PPT처럼 보이는가"를 grep으로 검사하는 안티 패턴 규칙(`SKILL.md:58-112`, 예: `class="scene"`이 3개 이상이면 slide deck), 이전 프로젝트 패턴 반복 금지(`:86-90`), starter 7개·갤러리 12장 |
| brag | 약 1,300줄 | 톤 프리셋 7개, 15~25초, 훅 2초, 읽기 시간, 볼륨·SFX 표. 모션 수치는 HyperFrames에 위임 |
| explainer 3종 | 227~260줄 | 길이 예산표, hex 팔레트, 타이핑 25자/초, 제목 hold 2초, 카메라 ease 0.6~1.2초, 금지 목록(`:34-38,62,66-68`) |
| motion-broll | 150줄 + 완성 예제 clip 6개(`examples/opus-aoe2/`) | 밀도 기준(분당 2~4/4~7), cutaway 규칙, 금지 목록, 예제가 품질 기준 |
| sound-effects | 133줄 + SFX 100여 개, `manifest.json` 1,749줄 | 측정 수치(−16 LUFS, −4 dBFS, −12 dB, 2프레임 선행), 라이선스 표 |
| brag-slim | 105줄 1파일 | 창작 법칙 9개, 엔진·오디오·검증 처방은 모델 재량 |
| aimotion | SKILL.md 77줄 + INDEX 1,173줄 + 데모 166편 | "기술만 가져가고 소재·장면·문구·색은 가져가지 않는다"(STRICT RULE, `:3,12-35`), 셰이더 함정 수치(`:73-78`) |
| lemo-opuscar | 24줄(본체는 외부) | 평가 불가 |

## 3. HyperFrames와의 관계

- **HyperFrames에 의존하는 것은 brag뿐이다.** 단 SPEC·storyline·REVIEW·usage·history 단계를 의도적으로 건너뛰고 `check`만 게이트로 둔다(`brag/SKILL.md:114,120-122`). 박자 분석 스크립트와 번들 음악·SFX는 HyperFrames에 없는 brag 고유 자산이다.
- **script-to-motion은 같은 원리의 독립 재구현이다.** 자체 플레이어·`render.py`·검사 스크립트 묶음을 갖고, 시계가 `data-start` 선언이 아니라 TTS 실측이며, 음악·SFX가 없고, 사용자 승인 없이 크레딧을 쓰지 않는 게이트가 있다. 화면 쪽 요구(월드 바이블, look-dev, 서브에이전트 채점)는 HyperFrames보다 엄격하다(추론: HyperFrames 쪽은 trace에서 읽은 범위 기준).
- **motion-broll이 싱크 설계에서 가장 가깝다.** 단어 시각에 상태 변경을 놓는다. 다만 자막 추정(±0.2초)에 기대고 사후 검증이 없다.
- **bang-motion이 렌더 원리에서 가장 가깝다.** GSAP timeline을 pause하고 seek해 프레임을 뽑는다. 다만 렌더는 선택이고 기본 산출물은 브라우저 재생 HTML이다.
- **sound-effects는 HyperFrames 결과물에 바로 쓸 수 있다.** 적용 대상에 HyperFrames를 명시한다(`sound-effects/SKILL.md:3`). cue를 composition timeline 라벨에서 가져오라는 지시도 있다(`:62`). HyperFrames run의 chime 어긋남 같은 문제를 렌더 뒤 측정으로 잡는 유일한 경로다(추론: 실제로 연결해 보지는 않았다).

## 4. 확인하지 못한 것

- lemo-opuscar: 실제 지침과 렌더 방식이 외부 `github.com/lemomo-ai/lemo-opuscar`에 있다. `setup.sh`가 그 repo `main`을 `fetch` + `reset --hard`로 따라가서(`scripts/setup.sh:32`) 지침이 고정되지 않는다.
- brag가 읽는 HyperFrames 스킬 4개는 이 저장소에 없다([`relations.md`](relations.md) r09). brag의 렌더 방식 설명은 HyperFrames trace 쪽 지식에 기댄다.
- aimotion 데모 렌더러 `_tools/render.mjs`가 폴더에 없어 데모가 어떻게 mp4가 되는지 확인하지 못했다.
- `script-to-motion`의 `render.py`(2,100줄 이상)와 `cokacmotion.mjs`, bang-motion references 전체, sound-effects `sfx/manifest.json`은 관련 구간·구조만 읽었다. 바이너리(mp3, ogg)는 열지 않았다.
- `hyperframes tts`의 Kokoro가 완전 로컬인지 이 저장소에서는 확인하지 못했다.
