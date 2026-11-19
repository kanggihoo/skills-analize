# media-use — HyperFrames 영상에 넣을 media를 구하거나 만든다 {#overview}

에이전트가 영상에 넣을 media(음악·이미지·음성 등)를 직접 만들지 않고 명령 한 번으로 구하거나 만들게 하고, 결과를 파일과 장부로 남긴다.[](source:s-core)

- HyperFrames 영상에 음악·효과음·이미지·logo·음성·transcript·cutout·색 보정이 필요할 때 켜진다. footage가 어둡거나 flat하거나, 스타일을 입히거나 가려야 할 때도 켜진다.[](source:s-fm) 출처는 무료 HeyGen catalog, HeyGen 크레딧, 요청이 있을 때의 local 도구로 갈린다.[](source:s-table)
- 결과로 남는 것은 프로젝트의 local 파일, ledger(받은 media를 적어 두는 장부) 기록, 한 줄 결과 메시지다.[](source:s-core)
- 다른 스킬과의 관계: `hyperframes`가 모든 media 요청을 이 스킬로 안내하고(다음 안내), 이 스킬은 `assets/`와 credit 한도 파일을 `hyperframes`·`style-sampling`과 같은 파일로 쓴다.
- 하지 않는 것: 렌더 중에 media를 내려받지 않고, 공식 logo를 손으로 다시 그리지 않고, 보정을 CSS·SVG·`.cube` 대용품으로 하지 않는다.[](source:s-core)[](source:s-table)[](source:s-look)

@answer scope="hyperframes/media-use · 원본 파일 104개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source s-fm title="frontmatter: name과 description" path=hyperframes/media-use/SKILL.md lines=1:4
@source s-head title="plugin 규칙과 usage beacon" path=hyperframes/media-use/SKILL.md lines=6:8
@source s-core title="resolve 한 명령과 한 줄 결과" path=hyperframes/media-use/SKILL.md lines=10:18
@source s-table title="필요한 media별 출처 표" path=hyperframes/media-use/SKILL.md lines=20:32
@source s-login title="HeyGen 로그인 확인 규칙" path=hyperframes/media-use/SKILL.md lines=34:34
@source s-host title="호스트 앱 규칙" path=hyperframes/media-use/SKILL.md lines=36:36
@source s-cli title="heygen CLI와 직접 recipe" path=hyperframes/media-use/SKILL.md lines=38:38
@source s-credit title="Credits 규칙" path=hyperframes/media-use/SKILL.md lines=40:40
@source s-look title="실제 footage 보정 규칙" path=hyperframes/media-use/SKILL.md lines=42:44
@source s-offer title="한 번만 제안하는 규칙" path=hyperframes/media-use/SKILL.md lines=46:48
@source s-where title="작업별로 읽을 reference 표" path=hyperframes/media-use/SKILL.md lines=50:63
@source r-low title="low-confidence 결과 처리" path=hyperframes/media-use/references/resolve.md lines=9:9
@source r-reuse title="재사용 후보 판단과 보증 규칙" path=hyperframes/media-use/references/resolve.md lines=76:96
@source h-gen title="generate 명령과 재시도 규칙" path=hyperframes/media-use/references/heygen.md lines=17:19
@source m-scope title="treatment의 허락 범위와 한계" path=hyperframes/media-use/references/media-treatments.md lines=9:23
@source m-pick title="reference에서 해당 recipe 절만 읽는 방법" path=hyperframes/media-use/references/media-treatments.md lines=101:103
@source m-feed title="모호한 피드백의 첫 행동" path=hyperframes/media-use/references/media-treatments.md lines=60:74
@source g-cube title=".cube 파일을 읽지 않는 규칙" path=hyperframes/media-use/references/grading.md lines=20:20
@source x-lane title="volume lane과 GSAP 충돌" path=hyperframes/media-use/references/mixing.md lines=27:30
@source x-carve title="fromCarve 규칙" path=hyperframes/media-use/references/mixing.md lines=52:54
@source x-duck title="목소리 밑 음악 처리" path=hyperframes/media-use/references/mixing.md lines=66:68
@source o-op title="편집·변환은 명령으로 감싸지 않는다" path=hyperframes/media-use/references/operations.md lines=3:7
@source o-reg title="결과를 장부에 등록하는 명령" path=hyperframes/media-use/references/operations.md lines=66:67
@source mem-pref title="기억된 기본값은 질문을 건너뛰지 않는다" path=hyperframes/media-use/references/memory.md lines=13:13
@source mem-rec title="recipe는 질문을 건너뛸 수 있다" path=hyperframes/media-use/references/memory.md lines=29:29
@source a-eng title="오디오 엔진 요청과 출력" path=hyperframes/media-use/references/audio.md lines=3:9
@source t-doc title="문서 영상 narrator 규칙" path=hyperframes/media-use/audio/references/tts.md lines=29:35
@source b-fail title="BGM 실패는 렌더를 막지 않는다" path=hyperframes/media-use/audio/references/bgm.md lines=76:76
@source sfx-lic title="효과음 라이선스와 credit 규칙" path=hyperframes/media-use/audio/references/sfx.md lines=10:12
@source sfx-fail title="효과음 매칭 실패는 건너뛴다" path=hyperframes/media-use/audio/references/sfx.md lines=32:32
@source tr-model title="transcribe의 --model 명시" path=hyperframes/media-use/audio/references/transcribe.md lines=3:3
@source tr-lang title="언어 규칙" path=hyperframes/media-use/audio/references/transcribe.md lines=14:22
@source th-retry title="transcript 품질 실패와 재시도" path=hyperframes/media-use/audio/references/captions/transcript-handling.md lines=33:45
@source ops-fmt title="hyperframes 계약 참조(format.md)" path=hyperframes/media-use/references/operations.md lines=22:22
@source cap-motion title="caption 동작 reference 참조" path=hyperframes/media-use/audio/references/captions/motion.md lines=85:86
@source cap-auth title="marker highlight는 registry에서 찾기" path=hyperframes/media-use/audio/references/captions/authoring.md lines=43:43

## 어떻게 동작하나 {#flow span=12}

| 적용 상황 | 참조 파일 | 바뀌는 판단 | 출력 사례 |
| --- | --- | --- | --- |
| media 한 건 구하기 | `SKILL.md`, `references/resolve.md` | 에이전트가 직접 만들거나 그리지 않고 `resolve` 명령으로 찾거나 만든다.[](source:s-core) | `resolved <id> → <path> (<type>, <metadata>)` 한 줄[](source:s-core) |
| 재사용 후보 판단 | `references/resolve.md` | 구하기 전에 `--candidates`로 후보를 보고, 맞는지는 에이전트가 직접 판단한다. 애매하면 새로 구한다.[](source:r-reuse) | project 후보는 경로만 쓰고, global 후보는 `--reuse <sha>`로 복사한다.[](source:r-reuse) |
| 출처 고르기 | `SKILL.md`의 `Where it comes from` 표 | media마다 무료·크레딧·local 세 열이 있다. local 도구는 사용자가 요청할 때만 쓴다.[](source:s-table)[](source:s-login) | 음악은 HeyGen catalog(무료), 생성 음악(크레딧), local MusicGen이다.[](source:s-table) |
| HeyGen 로그인 확인 | `SKILL.md` | HeyGen model이나 catalog를 쓰는 요청마다 먼저 로그인 상태를 확인한다. 로그인이 없으면 안내하고 기다린다.[](source:s-login) | 사용자가 `!`와 `npx hyperframes auth login`을 입력하고 끝났다고 말한다.[](source:s-login) |
| 호스트 앱 안에서 | `SKILL.md`, `references/setup-providers.md` | 앱에 자체 media 도구가 있으면 그것을 먼저 쓴다. 호스트가 비용을 내면 로그인을 묻지 않는다.[](source:s-host) | 거부된 호출의 메시지를 그대로 전하고 멈춘다.[](source:s-host) |
| 크레딧 한도와 유료 호출 | `SKILL.md`, `references/heygen.md` | 가격·추정·사용량을 먼저 말하지 않는다. 사용자가 한도를 말하면 한 번 기록해 모든 유료 호출에 적용한다.[](source:s-credit)[](source:h-gen) | `.hyperframes/credit-limit.json`에 `{"credits": N}`을 쓴다.[](source:s-credit) |
| footage 보정과 스타일 | `references/media-treatments.md`, `references/media-treatment-recipes.md`, `references/grading.md` | footage가 어둡거나 flat하면 실제 `<img>`나 `<video>`를 보고 의도 하나를 고른다. `media-treatment`로 저장한다.[](source:s-look) | 피드백 "그림자가 많고 지루하다"에는 그림자를 올리고 제한된 preset 하나를 비교한다.[](source:m-feed) |
| 오디오 만들기 | `references/audio.md`, `audio/references/` | 음성·음악·효과음을 요청 파일 하나로 만든다. 자막과 transcript 규칙은 별도 reference가 맡는다.[](source:a-eng)[](source:s-where) | `audio_meta.json`에 결과를 쓴다.[](source:a-eng) |
| 배치한 오디오 믹싱 | `references/mixing.md` | fade·gain·ducking(말하는 동안 음악을 낮추는 처리)·effect는 `<audio>`의 속성으로 건다.[](source:s-where) 목소리 밑 음악은 volume lane으로 낮춘다.[](source:x-duck) | 말하는 동안 음악 음량을 0.3–0.4쯤으로 낮췄다 복귀한다.[](source:x-duck) |
| media 편집과 변환 | `references/operations.md`, `references/local.md` | cut·reframe·이어 붙이기는 media-use가 감싸지 않는다. local 도구를 돌린 뒤 결과를 등록한다.[](source:o-op) | `resolve --from <output> --type <type>`으로 ledger에 올린다.[](source:o-reg) |
| 기억된 기본값과 recipe | `references/memory.md` | 사용자가 확인한 답만 기록하고, 기억된 값은 질문을 건너뛰지 않는다. recipe는 승인된 run 전체라 질문을 건너뛸 수 있다.[](source:mem-pref)[](source:mem-rec) | 권장 기본값 옆에 출처(project 또는 user)를 보인다.[](source:mem-pref) |
| 한 번만 제안 | `SKILL.md` | 만들거나 검토한 영상에서 구체적 빈틈을 한 번 찾아 한 번에 묻는다. 신호가 없으면 제안하지 않는다.[](source:s-offer) | 소리 없는 컷, 음악 없는 10초 이상 구간, 색 치우침이 신호다.[](source:s-offer) |

이 표는 순서 있는 절차가 아니다. 요청이 닿는 행의 판단만 적용된다. 판정: 본문은 짧은 안내판이고, 세부 규칙은 `Where to look` 표가 가리키는 reference가 맡는다.[](source:s-where)

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(description). 사용자 명령과 호출 제한 필드는 원문에 명시 없음(frontmatter에 `name`과 `description`뿐).[](source:s-fm) |
| 성격 | 원칙형. media 요청마다 출처를 고르고, 받은 파일을 장부에 남기게 하는 원칙 모음이다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| hyperframes {#rel-r03} | **이 스킬** | 다음 안내 | 발표자·avatar·footage·voice·music 같은 모든 media를 `/media-use`가 맡는다고 안내한다. grade·grain·blur는 `media-treatment`(`/media-use`)로 보낸다. 조건부 의무 어조다.[](source:s-fm) |
| hyperframes-cli {#rel-r10} | **이 스킬** | 참고 | 명령표의 Media and sound 행(`media-treatment`, `tts` 등)을 `/media-use`로 연결한다.[](source:s-core) |
| **이 스킬** {#rel-r13} | hyperframes | 참고 | 7개 스킬이 모두 첫머리에서 plugin 안이라면 plugin execution rules를 따르라며 `../hyperframes/references/plugin-installation.md`를 가리킨다. plugin 안일 때만 해당한다.[](source:s-head) |
| remotion-to-hyperframes {#rel-r19} | **이 스킬** | 참고 | 음량 ramp 형식은 `/media-use`의 `references/mixing.md`를 본다.[](source:s-where) |
| reverse-any-video {#rel-r20} | **이 스킬** | 참고 | 사람·애니메이션 재생성은 `media-use generate`를, 로고는 `media-use resolve --type logo`를 명령으로 지목한다. 로고는 손으로 그리지 않는다. 스킬 이름이 아니라 명령으로 지목한다.[](source:s-table) |
| style-sampling {#rel-r23} | **이 스킬** | 참고 | 생성 media는 kit의 도구나 `media-use generate`로 만들고 `media-use`의 Credits 규칙을 따른다. 가격·추정·잔액을 먼저 말하지 않는다.[](source:s-credit) |
| **이 스킬** {#rel-r24} | style-sampling | 같은 파일 | 두 스킬이 모두 사용자가 말한 credit 한도를 `.hyperframes/credit-limit.json`에 쓴다. 선후 관계는 없다.[](source:s-credit) |
| **이 스킬** {#rel-r25} | hyperframes | 같은 파일 | media를 프로젝트 `assets/`에 local 파일과 ledger 기록으로 둔다. `/hyperframes`도 media와 font가 `assets/`에 있다고 한다. 선후 관계는 없다.[](source:s-core) |
| **이 스킬** {#rel-r31} | hyperframes | 참고 | reference가 `/hyperframes`의 `references/format.md`, `captions.md`, `motion.md`, `runtimes.md`를 가리킨다.[](source:ops-fmt)[](source:cap-motion) |
| **이 스킬** {#rel-r32} | hyperframes-registry | 참고 | marker highlight 등은 registry를 검색(`catalog`, `add`)하라고 한다. 스킬 이름 `/hyperframes-registry`는 caption 작성 reference에 있다.[](source:cap-auth) |

@architecture id=relation-map title="media-use와 이어지는 스킬"
| hf | hyperframes | backend |
| cli | hyperframes-cli | backend |
| rtoh | remotion-to-hyperframes | backend |
| rav | reverse-any-video | backend |
| ss | style-sampling | backend |
| self | media-use(이 스킬) | backend |
| reg | hyperframes-registry | backend |
| hf2 | hyperframes(이 스킬이 참조) | backend |
| ss2 | style-sampling(같은 파일 대상) | backend |
| hf > self | 다음 안내 |
| cli > self | 참고 |
| rtoh > self | 참고 |
| rav > self | 참고 |
| ss > self | 참고 |
| self > hf2 | 참고 |
| self > hf2 | 같은 파일 |
| self > ss2 | 같은 파일 |
| self > reg | 참고 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 진입 문서. resolve 명령, 출처 표, 로그인·크레딧 규칙, reference 안내판 | 스킬이 켜질 때 항상 읽는다. 첫머리에서 usage beacon 명령을 한 번 실행하라고 한다.[](source:s-head) | media 한 건 구하기, 출처 고르기, HeyGen 로그인 확인, 호스트 앱 안에서, 크레딧 한도와 유료 호출, 한 번만 제안 |
| `references/resolve.md` | resolve 명령, flag, 재사용, adopt, 인벤토리 | 구하기·재사용·adopt·ingest 작업일 때 읽는다.[](source:s-where) | media 한 건 구하기, 재사용 후보 판단 |
| `references/grading.md` | grade 블록과 LUT(색 변환표) 사용법 | 색 보정·LUT 작업일 때 읽는다.[](source:s-where) | footage 보정과 스타일 |
| `references/media-treatments.md` | treatment 허락 범위, 요청 분류, 공통 작업 순서 | 보정·realtime 효과·overlay·reveal 작업일 때 읽는다.[](source:s-where) | footage 보정과 스타일 |
| `references/media-treatment-recipes.md` | 검증된 treatment 시작값 19개 | 해당 절만 읽는다. 전체를 읽지 않는다.[](source:m-pick) | footage 보정과 스타일 |
| `references/audio.md`, `audio/references/*.md` | 오디오 엔진 요청·출력, TTS·BGM·SFX·transcribe·배경 제거 안내 | 음성·음악·효과음·자막·transcript 작업일 때 읽는다.[](source:s-where) | 오디오 만들기 |
| `audio/references/captions/*.md` | caption 작성·동작·transcript 처리 규칙 | caption을 만들 때 읽는다.[](source:s-where) | 오디오 만들기 |
| `references/mixing.md` | fade·gain·ducking·automation·effect·bus 속성 | 배치한 track을 믹싱할 때 읽는다.[](source:s-where) | 배치한 오디오 믹싱 |
| `references/operations.md`, `references/local.md` | cut·reframe·변환·dither·loudness 같은 local 작업 안내 | 편집·변환·local 명령이 필요할 때 읽는다.[](source:s-where) | media 편집과 변환 |
| `references/setup-providers.md`, `references/heygen.md` | 설치·로그인·provider 사다리, generate 명령과 가격 | 설치·`--provider`·`--local-only`·generate가 필요할 때 읽는다.[](source:s-where) | 출처 고르기, 크레딧 한도와 유료 호출 |
| `references/memory.md` | 기억된 기본값과 recipe 저장 방식 | 기억된 기본값을 쓸 때 읽는다.[](source:s-where) | 기억된 기본값과 recipe |
| `references/meta.md`, `references/telemetry-dashboard.md` | 유지보수자용 소유 표, 사용 통계, telemetry 정의 | 에이전트 작업에는 읽지 않는다. 원문이 "resolve나 media 작업 방식을 바꾸지 않는다"고 쓴다. | 해당 없음 |
| `scripts/*.mjs`, `scripts/lib/` | prefs·recipe·transcribe·transcript-cut·audio-duck·dither 실행 파일과 공용 모듈 | 해당 reference가 명령으로 지목할 때 실행한다. `resolve.mjs`는 CLI를 부르는 얇은 껍데기다. | media 편집과 변환, 기억된 기본값과 recipe |
| `audio/scripts/` | 오디오 엔진, carve, wait-bgm, HeyGen TTS·voice 도구 | `audio.md`와 `mixing.md`가 명령으로 지목할 때 실행한다. | 오디오 만들기, 배치한 오디오 믹싱 |
| `luts/index.json`, `luts/README.md` | 색 look 목록 3개와 운영자용 호스팅 안내 | `resolve --type lut`이 읽는다. 에이전트는 `.cube` 본문을 읽지 않는다.[](source:g-cube) | footage 보정과 스타일 |
| `audio/assets/sfx/` | 번들 효과음 mp3, `manifest.json`, `CREDITS.md` | Openverse를 쓸 수 없는 cue에서 offline fallback으로 쓰인다. | 오디오 만들기 |
| `.gitignore` | `eval-report.html`을 추적에서 뺀다 | 에이전트 작업과 무관하다. | 해당 없음 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 스킬이 시작될 때 | `npx hyperframes events --skill=media-use`를 한 번 실행한다(의무). 스킬 이름을 CLI의 통상 telemetry와 함께 보내고 opt-out을 따른다. | [](source:s-head) |
| 요청이 HeyGen model이나 catalog를 쓸 때 | 매번 `npx hyperframes auth status`를 먼저 실행한다. | [](source:s-login) |
| 로그인이 없을 때 | 한 줄로 안내하고 사용자가 끝났다고 할 때까지 기다린다(사람 승인). local 도구는 사용자가 요청할 때만 쓰고 대체 수단으로 쓰지 않는다(금지). | [](source:s-login) |
| `HEYGEN_API_BASE`가 설정되어 있을 때 | 호스트가 비용을 낸다. 로그인을 묻지 않고, 거부된 호출 메시지를 그대로 전한 뒤 멈춘다. | [](source:s-host) |
| `heygen` CLI가 없을 때 | 설치 링크를 주고 설치했다고 말할 때까지 기다린다. 직접 `heygen` recipe는 그 CLI 로그인이 결제 주체로 선택됐을 때만 쓴다. | [](source:s-cli) |
| 유료 호출을 계획할 때 | 사용자가 비용 절감을 요청하지 않는 한 더 싼 대체, 무료 대체, 항목 삭제를 하지 않는다(금지). 가격·추정·사용량을 먼저 말하지 않는다(금지). | [](source:s-credit) |
| 사용자가 크레딧 한도를 말했을 때 | `.hyperframes/credit-limit.json`에 한 번 쓴다. 이후 유료 호출은 한도를 넘는 것을 거부한다(강제). GPT Image와 H3는 추정값 +10%로 점검한다. | [](source:s-credit) |
| 단계가 한도에 맞지 않거나 호출이 거부될 때 | 맞지 않는 단계를 말하고, 줄이거나 빼기 전에 묻는다. 거부 메시지가 `billing` 명령을 가리키면 이유를 말하고 사용자가 실행하게 한 뒤 다시 시도한다. | [](source:s-credit) |
| 생성 작업이 실패하거나 거부될 때 | 한 번 더 시도하고, 그래도 안 되면 멈추고 사용자에게 묻는다. 얼마를 썼는지는 말하지 않는다. | [](source:h-gen) |
| resolve가 low-confidence 결과를 돌려줄 때 | 소리는 배치 전에 들어 보거나 다른 말로 다시 resolve한다. | [](source:r-low) |
| 재사용 후보가 애매할 때 | 새로 구한다. 다른 프로젝트의 brand asset은 대상 이름이 정확히 같을 때만 global 후보를 재사용한다. 모호한 매칭은 자동 적용되지 않는다. | [](source:r-reuse) |
| `.cube` 파일을 보게 될 때 | 본문을 읽지 않는다(금지). `grade-compare`로 렌더해 본다. | [](source:g-cube) |
| 보정 요청이 명시되지 않은 기회 탐색일 때 | treatment를 먼저 보여 주거나 제안한다. 명시 요청이면 보수적으로 적용·검증·보고한다. | [](source:m-scope) |
| 얼굴·번호판 같은 일부 영역만 가려야 할 때 | realtime treatment는 media 전체에 적용되므로 영역 분리를 했다고 말하지 않는다. 별도 crop·mask layer나 외부 도구를 먼저 쓴다. HDR·HLG·PQ·LOG 원본은 이 경로로 조용히 처리하지 않는다. | [](source:m-scope) |
| 만들거나 검토한 영상을 훑을 때 | 구체적 빈틈이 있을 때만 한 번에 제안한다. 신호가 없으면 제안하지 않고, "leave it"을 따른다. | [](source:s-offer) |
| `transcribe`를 실행할 때 | `--model`을 항상 명시한다. 영어가 아닌 음성에 `.en` 모델을 쓰면 영어로 번역되어 원어가 사라진다. | [](source:tr-model)[](source:tr-lang) |
| transcript에 `♪`·`�` token이 20%를 넘거나 말이 되지 않는 단어가 있을 때 | 전사 실패로 보고 진행하지 않는다. `small.en` 이하였다면 `medium.en`으로 다시 돌리고, 그래도 실패하면 사용자에게 알린다. | [](source:th-retry) |
| 음악 track에 volume lane이나 `data-volume`이 있을 때 | 같은 track의 volume을 GSAP로 tween하지 않는다(lint가 둘 다 잡는다). lane은 `data-volume`에 곱해진다. | [](source:x-lane) |
| carve를 쓸 때 | 목소리 track에는 carve를 걸지 않고, `fromCarve`를 손으로 설정하지 않는다(금지). | [](source:x-carve)[](source:x-duck) |
| 효과음을 고를 때 | CC0와 CC BY만 쓴다. CC BY는 `CREDITS.md`에 적고 게시할 때 넣으라고 알린다. 맞는 소리가 없으면 건너뛰고 렌더를 막지 않는다. | [](source:sfx-lic)[](source:sfx-fail) |
| BGM 생성이 실패할 때 | 트랙을 빼고 렌더는 계속한다. | [](source:b-fail) |
| hyperframes.heygen.com에 올릴 문서 영상 음성일 때 | narrator는 ElevenLabs의 River 하나다. ElevenLabs에 닿지 못하면 말하고 멈추며 다른 목소리로 바꾸지 않는다. | [](source:t-doc) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- resolve 내부 순서와 provenance 표시 — 재사용 후보 판단 · 자동 재사용 단계(project manifest, assets 스캔, global cache)와 `data-media-source="heygen"` 표시 규칙이 있다. 결과를 바꾸는 예외지만 개요 범위를 넘는다.
- `generate` 명령 종류와 가격표 — 크레딧 한도와 유료 호출 · 모델별 가격, aspect·reference 제한, 재시도 규칙의 수치가 많다.
- 오디오 엔진 요청·출력 — 오디오 만들기 · TTS provider 순서, Gemini·voice clone, BGM mood 추론, Openverse 사용량 한도가 있다.
- caption 작성 규칙 — 오디오 만들기 · 음악 원본이면 audio-reactive 애니메이션이 필수이고, group마다 exit 처리가 필수다.
- treatment recipe 19개 — footage 보정과 스타일 · 시작 payload와 허용 범위가 recipe마다 다르다.
- 믹싱 속성 레퍼런스 — 배치한 오디오 믹싱 · `data-automation`, `data-fx-chain`, group bus의 필드와 범위.
- 기억된 기본값과 recipe 저장 방식 — 기억된 기본값과 recipe · 2개 프로젝트 승격 규칙, 잠금 파일 복구, recipe 버전 규칙.
- provider와 설치 사다리 — 출처 고르기 · RAM별 local model, `--provider`, `--local-only` 동작.
- telemetry와 유지보수 — 개요 대상 아님 · 수집 항목, opt-out, dashboard 정의가 `references/meta.md`와 scripts에 있다.

@callout level=open-question title="확인하지 못한 것"
| 저장 위치가 문서마다 다르다. `SKILL.md`는 `assets/`라고 하고, `references/resolve.md`의 예시와 `scripts/lib/manifest.mjs`는 `.media/<type>/`을 쓴다. `references/audio.md`는 `assets/voice/`와 `assets/bgm/`도 말한다. 우선순위는 원문에 명시 없음이라 그대로 둔다. |
| `audio/references/tts.md`와 `bgm.md`는 `SKILL.md`의 "Preflight" 절을 가리키지만 `SKILL.md`에 그 절이 없다. 로그인 확인 규칙은 `SKILL.md` 한 문단에만 있다. |
| `references/sfx.md`와 `sfx.mjs`는 번들 효과음이 21개라고 하지만, `manifest.json` 항목과 mp3는 19개다. |
| `resolve`의 실제 구현은 CLI 패키지에 있고 이 폴더에는 없다. 내부 구현 미확인. |

읽은 원본: 텍스트 파일 104개(문서 27개는 전부, scripts·test 77개는 머리말과 핵심 분기 위주). 제외: mp3 19개(바이너리), JSON 2개(구조·표본만 확인), 번역본은 없음.
