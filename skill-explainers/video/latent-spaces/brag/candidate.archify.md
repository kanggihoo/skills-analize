# brag 스킬은 에이전트를 어떻게 바꾸나 {#brag-skill}

`brag`를 켜면 에이전트는 현재 프로젝트의 코드를 읽고 15~25초짜리 출시 영상을 만든다. 순서는 조사, 계획, Hyperframes 구성, 렌더·전달 네 단계이고 단계마다 통과 조건이 있다.[](source:b-intro)[](source:b-laws) 다만 모델이 Claude Opus 5.5이면, 전체 워크플로를 요청하지 않는 한 에이전트는 `brag-slim`으로 넘어가 나머지 실행을 그 지시로 한다.[](source:b-dispatch)

- 호출하자마자 모델 확인이 먼저 일어난다. Opus 5.5이고 `--full`이나 `--voice`가 없으면 `slim.md`를 읽고 이번 실행의 나머지를 그쪽 지시로 따른다.[](source:b-dispatch)
- 통과 조건은 네 개다. 9문항 답하기, 장면 길이 합계 15~25초, `npx hyperframes check` 오류 0건, `brag.mp4`·`brag.jpg`·공유 문구 완성이다.[](source:b-s1)[](source:b-s2)[](source:b-s3)[](source:b-s4)
- 사람이 끼는 곳은 두 군데다. 에이전트는 preview 주소를 알려 주고, 사용자가 승인하거나 렌더를 요청하면 렌더한다. 내레이션은 `--voice`를 줄 때만 켠다.[](source:s4-prev)[](source:b-dispatch)
- 영상에 쓰는 사실 주장은 프로젝트에 근거가 있어야 하고, 비밀·개인정보는 계획·영상·공유 문구에 옮기지 않는다.[](source:s3-ground)[](source:s1-skip)

@answer scope="brag · 텍스트 17개 · 커밋 23e8047 · Hyperframes 스킬 미확인(부분 분석) · 지시상 동작"
@meta locale=ko
@source b-fm title="video/latent-spaces/brag/SKILL.md · 9440B · frontmatter" path=video/latent-spaces/brag/SKILL.md lines=1:4
@source b-dispatch title="SKILL.md · 호출 분기와 --voice 해석" path=video/latent-spaces/brag/SKILL.md lines=10:17
@source b-intro title="SKILL.md · 하는 일" path=video/latent-spaces/brag/SKILL.md lines=19:27
@source b-opts title="SKILL.md · 옵션 표와 톤" path=video/latent-spaces/brag/SKILL.md lines=40:58
@source b-voice title="SKILL.md · 내레이션 가이드" path=video/latent-spaces/brag/SKILL.md lines=60:66
@source b-out title="SKILL.md · 출력 폴더" path=video/latent-spaces/brag/SKILL.md lines=70:82
@source b-s1 title="SKILL.md · 1단계" path=video/latent-spaces/brag/SKILL.md lines=90:96
@source b-s2 title="SKILL.md · 2단계" path=video/latent-spaces/brag/SKILL.md lines=100:108
@source b-s3 title="SKILL.md · 3단계" path=video/latent-spaces/brag/SKILL.md lines=112:122
@source b-s4 title="SKILL.md · 4단계" path=video/latent-spaces/brag/SKILL.md lines=126:132
@source b-laws title="SKILL.md · 창작 법칙" path=video/latent-spaces/brag/SKILL.md lines=156:179
@source slim-copy title="video/latent-spaces/brag/slim.md · 9142B · brag-slim/SKILL.md와 shasum 동일" path=video/latent-spaces/brag/slim.md lines=1:105
@source bs-fm title="video/latent-spaces/brag-slim/SKILL.md · 9142B · 관계 확인용(3번 줄)" path=video/latent-spaces/brag-slim/SKILL.md lines=3:3
@source s1-read title="video/latent-spaces/brag/references/step-1-inspect.md · 6057B · 1단계 지침" path=video/latent-spaces/brag/references/step-1-inspect.md lines=7:28
@source s1-rubric title="step-1-inspect.md · 9문항" path=video/latent-spaces/brag/references/step-1-inspect.md lines=30:85
@source s1-skip title="step-1-inspect.md · 읽지 않을 것과 비밀 규칙" path=video/latent-spaces/brag/references/step-1-inspect.md lines=118:132
@source s2-plan title="video/latent-spaces/brag/references/step-2-plan.md · 13151B · 2단계 지침" path=video/latent-spaces/brag/references/step-2-plan.md lines=13:93
@source s2-scenes title="step-2-plan.md · 톤별 장면 수와 길이 합계" path=video/latent-spaces/brag/references/step-2-plan.md lines=95:120
@source s2-read title="step-2-plan.md · 읽는 시간" path=video/latent-spaces/brag/references/step-2-plan.md lines=122:134
@source s2-show title="step-2-plan.md · 무엇을 보여 줄까" path=video/latent-spaces/brag/references/step-2-plan.md lines=136:162
@source s2-audio title="step-2-plan.md · 오디오 계획과 큐 안내" path=video/latent-spaces/brag/references/step-2-plan.md lines=181:210
@source s2-hand title="step-2-plan.md · 넘기는 방식" path=video/latent-spaces/brag/references/step-2-plan.md lines=212:219
@source s3-brief title="video/latent-spaces/brag/references/step-3-compose.md · 15600B · 3단계 지침" path=video/latent-spaces/brag/references/step-3-compose.md lines=3:91
@source s3-hf title="step-3-compose.md · Hyperframes 지시와 요구 사항" path=video/latent-spaces/brag/references/step-3-compose.md lines=72:89
@source s3-assets title="step-3-compose.md · 음악 복사" path=video/latent-spaces/brag/references/step-3-compose.md lines=95:106
@source s3-voice title="step-3-compose.md · 내레이션" path=video/latent-spaces/brag/references/step-3-compose.md lines=110:139
@source s3-react title="step-3-compose.md · 오디오 반응" path=video/latent-spaces/brag/references/step-3-compose.md lines=143:149
@source s3-beat title="step-3-compose.md · 박자 맞추기" path=video/latent-spaces/brag/references/step-3-compose.md lines=153:180
@source s3-call title="step-3-compose.md · Hyperframes 호출" path=video/latent-spaces/brag/references/step-3-compose.md lines=184:195
@source s3-check title="step-3-compose.md · 자체 점검" path=video/latent-spaces/brag/references/step-3-compose.md lines=199:213
@source s3-ground title="step-3-compose.md · 사실 근거" path=video/latent-spaces/brag/references/step-3-compose.md lines=215:237
@source s4-val title="video/latent-spaces/brag/references/step-4-deliver.md · 6827B · 4단계 지침" path=video/latent-spaces/brag/references/step-4-deliver.md lines=3:18
@source s4-prev title="step-4-deliver.md · preview와 렌더" path=video/latent-spaces/brag/references/step-4-deliver.md lines=20:46
@source s4-poster title="step-4-deliver.md · 포스터" path=video/latent-spaces/brag/references/step-4-deliver.md lines=48:75
@source s4-share title="step-4-deliver.md · 공유 문구" path=video/latent-spaces/brag/references/step-4-deliver.md lines=77:95
@source s4-final title="step-4-deliver.md · 산출물 구조와 보고" path=video/latent-spaces/brag/references/step-4-deliver.md lines=148:170
@source au-lic title="video/latent-spaces/brag/references/audio.md · 18734B · 오디오 참고서" path=video/latent-spaces/brag/references/audio.md lines=1:5
@source au-react title="audio.md · 오디오 반응 시각 효과" path=video/latent-spaces/brag/references/audio.md lines=9:30
@source au-paths title="audio.md · 자산 경로와 복사" path=video/latent-spaces/brag/references/audio.md lines=34:76
@source au-sfx title="audio.md · SFX 라이브러리" path=video/latent-spaces/brag/references/audio.md lines=80:90
@source au-tone title="audio.md · 톤별 SFX 강도" path=video/latent-spaces/brag/references/audio.md lines=167:177
@source au-time title="audio.md · 타이밍 규칙" path=video/latent-spaces/brag/references/audio.md lines=198:214
@source au-music title="audio.md · 음악 트랙과 음량" path=video/latent-spaces/brag/references/audio.md lines=218:244
@source au-cues title="audio.md · 박자·큐 자료 세 가지" path=video/latent-spaces/brag/references/audio.md lines=246:300
@source au-add title="audio.md · SFX 트랙 배치" path=video/latent-spaces/brag/references/audio.md lines=302:310
@source tn-head title="video/latent-spaces/brag/references/tones.md · 6677B · 톤 7종 정의" path=video/latent-spaces/brag/references/tones.md lines=1:5
@source tn-chaotic title="tones.md · chaotic 장면 길이" path=video/latent-spaces/brag/references/tones.md lines=109:109
@source tn-deadpan title="tones.md · deadpan 장면 길이" path=video/latent-spaces/brag/references/tones.md lines=143:143
@source py-head title="video/latent-spaces/brag/scripts/analyze_music_cues.py · 10751B · 큐 분석 스크립트" path=video/latent-spaces/brag/scripts/analyze_music_cues.py lines=1:9
@source py-score title="analyze_music_cues.py · 세기 공식" path=video/latent-spaces/brag/scripts/analyze_music_cues.py lines=86:86
@source py-strong title="analyze_music_cues.py · 강한 큐 선별" path=video/latent-spaces/brag/scripts/analyze_music_cues.py lines=207:213
@source py-args title="analyze_music_cues.py · 인자 기본값" path=video/latent-spaces/brag/scripts/analyze_music_cues.py lines=281:292
@source toml title="video/latent-spaces/brag/scripts/pyproject.toml · 248B · 스크립트 의존성" path=video/latent-spaces/brag/scripts/pyproject.toml lines=1:14
@source mu-readme title="video/latent-spaces/brag/assets/music/README.md · 1163B · 음악 안내와 라이선스" path=video/latent-spaces/brag/assets/music/README.md lines=1:22
@source sfx-md title="video/latent-spaces/brag/assets/sfx/sfx-analysis.md · 7055B · SFX 분석 요약" path=video/latent-spaces/brag/assets/sfx/sfx-analysis.md lines=1:75
@source sfx-fam title="sfx-analysis.md · 폴더별 개수" path=video/latent-spaces/brag/assets/sfx/sfx-analysis.md lines=61:75
@source cue1 title="video/latent-spaces/brag/assets/music/cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.md · 1253B · vol-1 큐 요약" path=video/latent-spaces/brag/assets/music/cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.md lines=1:35
@source cue9 title="happy-beats-business-moves-vol-9-by-ende-dot-app.music-cues.md · 1255B · vol-9 큐 요약" path=video/latent-spaces/brag/assets/music/cues/happy-beats-business-moves-vol-9-by-ende-dot-app.music-cues.md lines=1:35
@source cue10 title="happy-beats-business-moves-vol-10-by-ende-dot-app.music-cues.md · 1263B · vol-10 큐 요약" path=video/latent-spaces/brag/assets/music/cues/happy-beats-business-moves-vol-10-by-ende-dot-app.music-cues.md lines=1:35
@source cue11 title="happy-beats-business-moves-vol-11-by-ende-dot-app.music-cues.md · 1248B · vol-11 큐 요약" path=video/latent-spaces/brag/assets/music/cues/happy-beats-business-moves-vol-11-by-ende-dot-app.music-cues.md lines=1:35
@source cue12 title="happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.md · 1255B · vol-12 큐 요약" path=video/latent-spaces/brag/assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.md lines=1:35
@source part-lock title="video/latent-spaces/brag/scripts/uv.lock · 170629B · 구조·표본만 확인" path=video/latent-spaces/brag/scripts/uv.lock
@source part-sfxjson title="video/latent-spaces/brag/assets/sfx/sfx-analysis.json · 405942B · 구조·표본만 확인" path=video/latent-spaces/brag/assets/sfx/sfx-analysis.json
@source part-cuejson title="video/latent-spaces/brag/assets/music/cues 폴더의 .music-cues.json 5개 · 합계 284856B · 구조·개수만 확인" path=video/latent-spaces/brag/assets/music/cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.json

## 언제 켜지고, 누가 먼저 가로채나 {#trigger}

@code source=b-fm language=yaml

- 호출 제한 필드가 없다. 모델이 `description`을 참고해 켤 수 있다.[](source:b-fm)
- 판정: `description`에 든 예시 문구(`/brag`, "make a launch video" 등)는 판단용 설명이다. 그 단어가 있으면 켜지는 목록이 아니다.
- 입력은 현재 프로젝트의 코드다. 원문은 "라이브 URL이나 스크린샷이 필요 없다"고 말하고, URL을 입력으로 받는 방법은 적지 않았다(원문에 명시 없음).[](source:b-fm)

켜진 뒤 에이전트가 가장 먼저 하는 일은 모델 확인이다. 프로젝트를 읽기 전에 호출 전체를 해석하고, 아래처럼 누가 이어 갈지 정한다.[](source:b-dispatch)

| 상황 | 이어 가는 쪽 | 근거 |
| --- | --- | --- |
| Opus 5.5이고 `--full`·"use the full brag"·`--voice`가 모두 없다 | `brag-slim`(`slim.md`) {caution:넘김} | 의무형으로 적혀 있다. 이번 실행의 나머지를 `slim.md`로 따른다[](source:b-dispatch) |
| Opus 5.5이고 `--full` 또는 "use the full brag"가 있다 | `brag` 그대로 | 전체 워크플로 요청이다[](source:b-dispatch) |
| Opus 5.5이고 `--voice`가 있다 | `brag` 그대로 | `brag-slim`은 음성 해설을 하지 않는다[](source:b-dispatch) |
| 다른 모델이거나 모델을 알 수 없다 | `brag` 그대로 | 검사를 건너뛴다[](source:b-dispatch) |

넘길 때 에이전트는 이렇게 한다.[](source:b-dispatch)

- 사용자 입력을 그대로 전달하고, `--no-music`·`--title` 같은 다른 옵션은 평문 지시로 알린다.
- 넘기기 전에 한 줄로 알린다. 원문의 예시 문구는 "You're on Opus 5.5, so I'm using /brag-slim ... Say 'use the full brag' to switch back."이다.
- 사용자가 "use the full brag"라고 말하면 되돌릴 수 있다.

옵션 표는 아래와 같다. `--voice`가 있으면 그 실행에서만 내레이션을 켠다. 자동으로 켜지 않고, `--voice`를 받고도 평소의 무음 워크플로로 돌아가지 않는다.[](source:b-dispatch)

| 옵션 | 값 | 기본값 |
| --- | --- | --- |
| `--tone` | 프리셋 7개 또는 자유 서술 | 프로젝트에서 추론 |
| `--format` | `landscape`, `vertical`, `square` | `landscape` |
| `--duration` | 초 | 자동(15~25초) |
| `--no-music` | 플래그 | 음악 켬 |
| `--no-sfx` | 플래그 | 효과음 켬 |
| `--title` | 문자열 | 프로젝트에서 추론 |
| `--voice` | 플래그 | 내레이션 끔 |

옵션 표는 `b-opts`[](source:b-opts)에서 가져왔다. 출력은 `brag-output/`에 쓴다. 이 폴더가 이미 있거나 사용자가 이전 결과를 덮어쓰지 않는 새 실행을 요청하면 `brag-output-YYYY-MM-DD-HHmmss/`를 쓴다. 타임스탬프는 실행 시작 때 한 번 만들어 모든 경로에 같이 쓴다.[](source:b-out)

## 네 단계는 어떤 순서고, 어디서 멈추나 {#flow}

@workflow id=brag-flow title="brag 4단계와 통과 조건"
| inspect | 프로젝트 읽기 | backend |
| plan | 계획·스토리보드 | backend |
| compose | Hyperframes 구성 | backend |
| check | check 통과? | backend |
| preview | preview 확인 | external |
| render | 렌더·포스터·문구 | backend |
| inspect > plan | 9문항 답함 | emphasis |
| plan > compose | 합계 15~25초 | emphasis |
| compose > check | |
| check > compose | 아니오: 오류 수정 | dashed |
| check > preview | 예 | emphasis |
| preview > render | 승인 또는 요청 | emphasis |

@steps id=brag-steps
| inspect | 프로젝트 읽기 | `index.html`, 스타일, `README.md`, `package.json`, 라우트·핵심 컴포넌트, `public/`·`assets/` 순으로 읽는다. 제품이 실제로 쓰이는 흐름의 2~3박자(진입, 핵심 동작, 결과)를 찾고 9문항에 모두 답해야 넘어간다.[](source:s1-read)[](source:s1-rubric)[](source:b-s1) | brag-flow | inspect |
| plan | 계획·스토리보드 | `<output-dir>/brag-plan.md`에 각도·훅·핵심 장면·톤·오디오 방향·장면별 스토리보드를 쓴다. 장면 길이 합계가 15~25초이고 스토리보드가 완전해야 넘어간다.[](source:s2-plan)[](source:b-s2) | brag-flow | plan |
| compose | Hyperframes 구성 | `composition-brief.md`를 쓰고 선택한 음악을 `composition/assets/music/`에 복사한 뒤, Hyperframes 스킬로 `<output-dir>/composition/`을 만든다.[](source:s3-brief)[](source:s3-assets)[](source:s3-call) | brag-flow | compose |
| check | check 통과? | `composition/`에서 `npx hyperframes check`를 돌려 오류를 모두 고친다. 오류 0건이 3단계 통과 조건이다.[](source:b-s3)[](source:s4-val) | brag-flow | check |
| preview | preview 확인 | `npx hyperframes preview`를 띄우고 사용자에게 localhost 주소를 알려 확인하게 한다.[](source:s4-prev) | brag-flow | preview |
| render | 렌더·포스터·문구 | 사용자가 승인하거나 렌더를 요청하면 `<output-dir>/brag.mp4`로 렌더한다. 그다음 포스터를 뽑아 frame 0에 굽고 `share-copy.txt`를 쓴다.[](source:s4-prev)[](source:s4-poster)[](source:s4-share) | brag-flow | render |

4단계의 통과 조건은 `brag.mp4`가 있고, 고른 포스터 `brag.jpg`가 frame 0으로 구워졌고, 공유 문구가 쓰인 것이다.[](source:b-s4) 렌더 품질을 안 정하면 기본값이 무엇인지는 원문에 명시 없음이다. 빠른 확인용 `--quality draft`와 최종 전달용 `--quality delivery`만 적혀 있다.[](source:s4-prev)

`check`에는 읽을 때 주의할 점이 둘 있다.[](source:s4-val)

- 대비(contrast) 실패는 경고가 아니라 오류로 취급한다. 제안된 준수 색으로 고치거나 팔레트 안에서 조정한 뒤 다시 돌린다.
- 화면에 DOM 텍스트가 있는데 `0/0 text checks`가 나오면 `check`가 "passed"여도 대비는 검증되지 않은 것이다. `oklch()` 색이 원인이면 sRGB hex나 `rgb()`로 바꿔 다시 돌린다. `--no-contrast`는 대비 검사 전체를 건너뛰므로 이 통과 조건을 만족시키지 못한다.

## 무엇을 강제하고 무엇을 금지하나 {#rules}

숫자부터 본다. 성격 열은 원문의 어조가 의무형인지 권고인지 가른 것이다.

| 항목 | 값 | 성격 | 적용 조건 |
| --- | --- | --- | --- |
| 영상 길이 | 15~25초 | 의무형 | 내레이션이 있어도 늘리지 않는다. "이유 없이 1초도 더 늘리지 않는다"[](source:b-laws) |
| 길이 목표 | 18~22초 | 권고 | 대부분의 영상에서 가장 좋은 구간이다[](source:s2-scenes) |
| 합계 점검 | 장면 길이를 직접 센다 | 의무형 | "Count them". 15초 미만이면 장면을 더하거나 홀드를 늘리고, 25초 넘으면 장면을 줄이거나 타이밍을 조인다(조치는 권고)[](source:s2-scenes) |
| 기본 모양 | 훅 2~3초, 공개 2~4초, 핵심 장면 2~3개(5~12초), 마무리 2~4초 | 출발점 | "틀이 아니다. 3개가 꼭 필요하지는 않다"[](source:b-laws) |
| 짧은 라벨 | 정착한 상태로 약 0.8초 | 의무형 | 글이 완전히 들어와 멈춘 시간이다[](source:b-laws)[](source:s2-read) |
| 문장 | 단어당 약 0.3초, 헤드라인·문장은 최소 약 1.2초 | 의무형 | 훅 문장에 가장 길게 준다[](source:b-laws)[](source:s2-read) |
| 입장·전환 | 0.3~0.6초 | 권고 | 빠르게 들어오고 멈춰서 읽히게 한다[](source:s2-read) |

- 판정: 기본 모양의 합계는 2+2+5+2=11초에서 3+4+12+4=23초다. 15초 아래로 내려갈 수 있으니 장면을 짠 뒤 합계를 다시 세어 15초 이상으로 맞춰야 한다. 근거는 위 표의 두 행이다.[](source:b-laws)[](source:s2-scenes)
- 읽는 시간 예: 10단어 문장이면 0.3초 × 10 = 3초다. 원문은 4초 장면에 짧은 읽을 거리 2~3개는 들어가도 6개는 못 읽는다고 본다.[](source:s2-read)

톤은 프리셋 7개이고 "기본값이지 한계가 아니다". 자유 서술은 가장 가까운 프리셋의 속도·구조에 맞추되 사용자 표현은 계획과 지시문에 남긴다.[](source:b-opts)[](source:s2-scenes)

| 톤 | 장면 수 | 장면 길이(원문에 있을 때) |
| --- | --- | --- |
| `default` | 4~5 | 3~5초 |
| `polished` | 3~4 | 4~6초 |
| `yc-parody` | 4~5 | 원문에 명시 없음 |
| `chaotic` | 6~8 | 일부 2초 미만, 최대 4초[](source:tn-chaotic) |
| `deadpan` | 3~4 | 4~7초[](source:tn-deadpan) |
| `cinematic` | 4~5 | 3~5초 |
| `app-store` | 4~6 | 원문에 명시 없음 |

표의 `default`·`polished`·`cinematic` 길이는 `tones.md`의 각 톤 정의에서 가져왔다. 장면 수는 `step-2-plan.md`의 표다.[](source:s2-scenes)[](source:tn-head)

내용에 대한 의무와 금지는 아래와 같다.

- 실제 UI, 문구, 핵심 비주얼을 보여 주는 장면이 하나 이상 있어야 한다. 추상적인 무늬·색 번짐·아무 영상에나 쓸 수 있는 모션은 금지다.[](source:b-laws)[](source:s2-show)
- "Streamline your workflow" 같은 일반 SaaS 문구는 금지다. 프로젝트 자신의 문구와 주장을 쓴다.[](source:b-laws)
- 제품에 사용 흐름이 있으면 중심 장면이 그 흐름이어야 한다. 통계 카드나 헤드라인 블록은 많아야 하나이고 흐름을 감싸는 틀로만 쓴다. 랜딩 페이지만 있는 정적 사이트면 이 규칙을 건너뛴다.[](source:s2-show)
- 순차 등장과 시뮬레이션된 상호작용(클릭, 스와이프, 타이핑)이 가능하면 계획에 무엇이 어떤 순서로 나오는지 적는다. Hyperframes가 알아서 리듬을 넣기를 기대하지 않는다.[](source:s2-show)
- 이름·숫자·기능 주장·인용처럼 "제품 자체의 말"로 보이는 모든 것은 프로젝트의 파일·README·UI·실제 출력에 있어야 한다. 대소문자 바꾸기, 자르기, 나누기는 괜찮고 지어내기는 안 된다. 톤·연출·농담·훅·전환·이어 주는 말은 지어도 된다.[](source:s3-ground)
- `check`는 구조만 본다. 카피가 근거 있는지는 아무 검사도 묻지 않으므로, 에이전트가 구성을 한 번 읽으며 직접 확인한다.[](source:s3-ground)
- 읽지 않는 파일: 빌드 결과(`dist/`, `.next/`, `build/`), 잠금 파일(`package-lock.json`, `yarn.lock`), 테스트 파일, `.git/`, 환경·비밀 파일(`.env`, `.env.*`), 키·자격 증명(`.pem`, `.key`, `id_rsa`, 서비스 계정 JSON, `secrets/`·`credentials/` 아래), 토큰이 든 로컬 설정, 그런 이유로 `.gitignore`가 제외한 파일이다.[](source:s1-skip)
- 읽은 내용은 공개 영상이 될 수 있다. 비밀, API 키, 토큰, 내부 호스트명·URL, 실제 고객·사용자 이름, 이메일, 개인정보는 계획·구성 지시문·구성·영상·공유 문구에 옮기지 않는다. 실제 UI에 그런 것이 있으면 그럴듯한 가상의 값으로 바꾸고 계획에 밝힌다.[](source:s1-skip)
- 생성과 렌더는 로컬에서만 한다. 원격·게시 작업은 사용자가 따로 명시적으로 요청해야 한다.[](source:s3-hf)[](source:s3-call)

Hyperframes와의 책임 분담도 강제다. `brag`가 제품 각도, 소스 소재, 스토리보드, 톤, 형식, 오디오 선택, 큐 안내, 전달 기대치를 맡고, Hyperframes가 구성 구조, 정확한 애니메이션 타이밍, 런타임, lint, 렌더를 맡는다.[](source:b-s3) 계획에는 GSAP 타임라인 선택자나 HTML 구조 같은 저수준 구현을 적지 않는다.[](source:s2-hand) 충돌하면 Hyperframes의 관례가 `brag` 안의 어떤 것보다 우선한다.[](source:s3-hf)

3단계가 끝나기 전에 에이전트는 자체 점검 11항목을 확인한다. `composition-brief.md` 존재, 보여 줄 제품 장면 명시, 현행 Hyperframes 워크플로 사용, 음악 파일 복사, 오디오 반응 요소 하나 이상(또는 실패 기록), 강한 큐에 맞춘 큰 동작 하나 이상(또는 가독성을 위해 자연 타이밍 선택), 순차 요소의 박자 맞춤, 실제 UI·문구 포함, 화면 위 사실 주장의 근거, 총 길이 15~25초, `check` 통과(또는 막힌 이유 기록)다.[](source:s3-check)

## 소리는 어떻게 고르고 박자에 맞추나 {#audio}

기본은 음악 하나와 소수의 효과음이다. 사용자가 `--no-music`·`--no-sfx`를 주거나, 자산이 없거나, 계획이 침묵을 가장 강한 선택으로 고른 경우에만 뺀다. 음악 파일이 없으면 건너뛰고 렌더 뒤에 사용자에게 알린다.[](source:au-lic)[](source:au-music)

번들 음악은 5곡이다. 길이는 `audio.md`, 추정 템포는 곡마다 있는 큐 요약에서 가져왔다.[](source:au-music)[](source:cue1)[](source:cue9)[](source:cue10)[](source:cue11)[](source:cue12)

| 곡 | 길이 | 추정 템포(BPM) | 권장 톤 |
| --- | --- | --- | --- |
| vol-1 | 2:44 | 120.19 | `default`, `app-store` |
| vol-9 | 1:54 | 114.84 | `default`, `yc-parody` |
| vol-10 | 1:00 | 109.96 | `default`, `chaotic` |
| vol-11 | 1:28 | 114.84 | `yc-parody`, `app-store` |
| vol-12 | 1:58 | 109.96 | `polished`, `cinematic` |

음량과 개수는 이렇다.[](source:au-music)[](source:au-tone)[](source:s3-voice)

| 항목 | 값 | 성격 |
| --- | --- | --- |
| 음악 볼륨 | 0.3~0.4 | 일반 배경음 |
| 음악 볼륨, 조용한 톤 | 0.12~0.22 | `deadpan`이나 매우 절제한 패러디. `deadpan`에 vol-12를 쓰면 0.12~0.18 |
| 음악 볼륨 상한 | 0.5 | "절대 넘지 않는다" |
| 효과음 볼륨 | 0.55~0.85 | `polished`·`deadpan`은 더 낮게. `app-store`는 0.65~0.75 |
| 효과음 개수 | `default` 3~5개, `polished` 2~3개, `yc-parody` 2~3개, `cinematic` 2~3개, `deadpan` 1~2개 | 가이드. `chaotic`은 박자마다 빽빽하게, 겹쳐도 된다 |

효과음 자산은 이렇게 다룬다.

- 자산은 `.ogg` 228개(`casino` 51, `impact` 109, `interface` 20, `ui` 48: 51+109+20+48=228)와 키보드 `.wav` 32개다. 모두 CC0다.[](source:au-sfx)[](source:sfx-fam)
- `sfx-analysis.md`를 먼저 읽고, 고주파 위험이 낮거나 중간인 파일을 반복·정제된 순간에 쓴다. 위험이 높은 파일은 짧고 고립된 강조나 혼돈 톤에 쓴다.[](source:au-sfx)[](source:sfx-md)
- 쓸 파일만 `composition/assets/`로 복사한다. 절대 경로(`/Users/...`)는 렌더러에서 조용히 실패하므로 쓰지 않는다.[](source:au-paths)
- 겹치는 오디오 클립끼리는 트랙 번호를 나눠 쓰지 않는다. 예시는 음악 10, 효과음 11부터다.[](source:au-add)

박자 맞추기는 선택 사항이다. 큐 자료는 세 곳에서 얻는다.[](source:au-cues)

1. 번들 곡의 미리 계산된 큐 파일(`cues/<곡>.music-cues.md`, `.json`).
2. `analyze_music_cues.py`(Python과 `uv` 필요).
3. `npx hyperframes beats`(Python 불필요, Hyperframes 0.6.99 이상).

셋 다 안 되면 계획에 "Music cue guidance: unavailable; continue without beat/cue sync."라고 쓰고 진행한다.[](source:au-cues) 맞추는 허용 오차와 한도는 아래와 같다.[](source:s3-beat)[](source:au-cues)

| 대상 | 허용 오차 | 한도 |
| --- | --- | --- |
| 큰 공개 장면(강한 큐) | 약 ±0.15초 | 15~25초 영상에서 1~3개. 편집에 분명히 이득일 때만 더 |
| 작은 순차 등장(박자) | 약 ±0.10초 | 연속한 박자에 하나씩 |

- 큐가 가독성, 장면 호흡, 제품 이야기를 해치면 무시한다. 모든 tween을 박자에 맞출 필요는 없다.[](source:s3-beat)
- 읽어야 하는 글이 순차로 나오고 박자 간격이 약 0.6초보다 좁으면(예: 110 BPM 이상) 박자마다 새 줄을 내지 않는다. 박자를 하나 건너뛰거나, 빠르게 다 보여 준 뒤 전체를 홀드한다. 글 아닌 장식(빛, 점, 틱)은 박자마다 맞춰도 된다.[](source:s3-beat)[](source:s2-read)
- 맞춘 곳에는 `// beat-locked: 5.80s`나 `// beat-grid: stat 1 at 12.65s ...` 같은 주석을 단다.[](source:s3-beat)

오디오 반응(음악 RMS·주파수 대역으로 빛·카드 존재감이 살짝 숨 쉬게 하는 효과)은 음악이 있고 처리 방식이 `none`이 아니면 Hyperframes의 흐름으로 맡긴다. 파형, 이퀄라이저 막대, 음표, 번쩍임, 과한 맥동은 쓰지 않는다. 추출 도구가 없거나 ffmpeg가 없으면 브리프에 적고 건너뛴다. 렌더를 막지 않는다.[](source:s3-react)[](source:au-react)

내레이션은 사용자가 명시적으로 요청할 때만 쓴다(`--voice`, "narrate this").[](source:s3-voice)

- 꺼져 있으면 제안도 하지 않는다. 대본, 음성 생성, 전사, 음악 낮추기, 음성 트랙, 영상 합치기를 모두 하지 않는다.
- 켜져 있으면 대본을 `brag-plan.md`의 `## Voiceover script`에 쓰고 Kokoro로 만든다. 제공자 선택 로직은 넣지 않는다.[](source:b-voice)
- 음악은 음성 구간에서 0.12~0.15로 낮추고, 끝나면 원래 수준으로 돌린다.
- 15~25초 창은 그대로다. 생성한 WAV 길이를 확인해 장면 `data-duration`을 맞추고, 넘치면 대본을 줄여 다시 만든다.

`analyze_music_cues.py`는 유지 보수용 도구이자 선택적 런타임 경로다.[](source:py-head)

- 세기 공식은 `0.45*onset + 0.25*대비 + 0.20*RMS + 0.10*저음`이다.[](source:py-score)
- 강한 큐는 세기 0.45 이상, 최소 간격 0.18초, 최대 64개다.[](source:py-strong)
- 번들 큐 JSON 5개는 모두 강한 큐가 64개로 상한에 닿아 있다. 이 JSON은 구조와 개수만 봤다.[](source:part-cuejson)

@callout level=warning title="번들 음악은 CC BY 4.0이고 크레딧이 필요하다"
번들 곡은 Sascha Ende(ende.app)의 "Happy Beats / Business Moves"(vol. 1, 9, 10, 11, 12)이고, 저장소의 MIT 라이선스 밖이다. 원문이 적은 크레딧 문구는 "Music: Sascha Ende, ende.app (CC BY 4.0)"이다.[](source:mu-readme) 이 문구를 영상이나 `share-copy.txt`에 넣으라는 지시는 어느 단계 파일에도 원문에 명시 없음이다. 공유 문구 규칙은 1~3문장에 변형을 넣지 않는 것이다.[](source:s4-share)


## 언제 쓰면 안 되나 {#limits}

| 상황 | 판정 | 이유 |
| --- | --- | --- |
| 15~25초보다 긴 영상이 필요하다 | {caution:이유 필요} | "이유 없이 1초도 더 늘리지 않는다". 이유가 무엇이어야 하는지, `--duration`이 25초를 넘으면 어떻게 되는지는 원문에 명시 없음[](source:b-laws)[](source:b-opts) |
| 프로젝트 코드가 없고 웹사이트 URL만 있다 | {caution:원문에 명시 없음} | 입력은 프로젝트 코드로 적혀 있다. URL을 받는 쪽은 `brag-slim`이다[](source:b-fm)[](source:slim-copy) |
| 음성 해설을 원한다 | {good:`--voice`로 가능} | Kokoro 하나만 쓴다. Opus 5.5에서도 `brag`가 그대로 진행한다[](source:b-dispatch)[](source:s3-voice) |
| Opus 5.5에서 전체 워크플로를 원한다 | {caution:`--full` 필요} | 안 주면 `brag-slim`으로 넘어간다[](source:b-dispatch) |
| 영상을 원격에 올리거나 게시하고 싶다 | {caution:별도 요청 필요} | 생성·렌더는 로컬에서 하고, 원격·게시 작업은 사용자의 별도 명시적 요청이 있어야 한다[](source:s3-call) |
| Hyperframes 스킬이 설치돼 있지 않다 | {caution:원문에 명시 없음} | 3단계가 `hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`를 읽으라고 하지만 이 컬렉션에는 없고, 없을 때의 동작은 적혀 있지 않다[](source:b-s3) |
| 실제 UI에 개인정보·비밀이 있다 | {caution:대체 필요} | 가상의 값으로 바꾸고 계획에 밝힌다[](source:s1-skip) |

@callout level=open-question title="영상이 실제로 잘 나오는지는 확인하지 못했다"
이 분석은 지침 텍스트만 읽었다. 영상·음악·이미지는 열어 보지 않았고 렌더도 하지 않았다. `check`가 실제로 무엇을 어떻게 판정하는지, 박자 맞추기가 얼마나 듣기 좋은지, 포스터를 frame 0에 구워 넣은 mp4가 모든 플랫폼에서 썸네일로 쓰이는지는 이 저장소에서 확인할 수 없다. `--duration`이 15~25초 밖일 때의 우선순위, 포맷별 해상도(`--format`의 가로×세로 값)는 원문에 명시 없음이다.[](source:b-opts)[](source:s2-plan)

## 흐름 속 위치 {#position}

`launch-video` 묶음에서 `brag`는 기본 진입점이다. 조건이 맞으면 `brag-slim`에 나머지를 넘기고, 직접 이어 가는 경우에는 3단계에서 컬렉션 밖의 Hyperframes 스킬에 구성과 렌더를 맡긴다. `brag` 앞에서 이 스킬로 넘겨 주는 스킬은 이 컬렉션에 없고, 사용자가 직접 부른다.

@workflow id=brag-position title="brag 앞뒤의 스킬"
| user | 사용자 호출 | external |
| brag | brag | backend |
| slim | brag-slim | backend |
| hf | Hyperframes 스킬 | external |
| user > brag | `/brag` | |
| brag > slim | Opus 5.5이면 | emphasis |
| brag > hf | 3단계 위임 | emphasis |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `brag-slim` | - | 사용자 입력, 다른 옵션(평문 지시), 이번 실행의 나머지 | 넘김. Opus 5.5이고 호출이 `--full`·"use the full brag"·`--voice`를 요구하지 않을 때 의무형. 넘기기 전 한 줄 안내. 모델이 다르거나 알 수 없으면 건너뜀[](source:b-dispatch)[](source:bs-fm) | r01 |
| `hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use` | 계획과 구성 지시문, 소스 파일 | `<output-dir>/composition/`, `check` 결과, 렌더 | 내부 위임(범위 밖). 단 `references/types/*`, `story.md`, `SPEC.md`와 `usage`, `history`, `feedback`, `REVIEW.md` 단계는 건너뛴다. 상태는 `npx hyperframes check`가 판정한다[](source:b-s3)[](source:s3-hf) | r09 |

전체 흐름은 `video/_group-launch-video/launch-video.html`에 있다. 관계 근거는 `video/relations.md`의 `rel-id`로 확인한다. `brag-slim`에서 `brag`로 되돌아오는 관계(r02)는 참고일 뿐 호출이 아니어서 이 그림에 넣지 않았다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일 17개, 모두 원본, 합계 111,119바이트다. `SKILL.md`, `slim.md`, `references/*.md` 6개, `scripts/analyze_music_cues.py`·`pyproject.toml`, `assets/music/README.md`, `assets/sfx/sfx-analysis.md`, `assets/music/cues/*.music-cues.md` 5개다. 다 읽은 파일에서 활성화 제한·강제·금지·수치·사람 개입·통과 조건을 원문과 대조했다.
- 구조·표본만 확인(전부 읽지 않음) 7개, 합계 861,427바이트: `scripts/uv.lock`(170,629바이트, `[[package]]` 31개), `assets/sfx/sfx-analysis.json`(405,942바이트, 최상위 키 8개, `files` 228개, `recommendations` 60개), `assets/music/cues/*.music-cues.json` 5개(합계 284,856바이트, 키 8개, `beats` 311·109·153·207·206개, `strongCues` 모두 64개).
- 제외한 바이너리: `.mp3` 5개(13,027,392바이트), `.ogg` 228개(1,778,153바이트), `.wav` 32개(808,320바이트). 소리를 듣지 않았고 파일 내용은 읽었다고 하지 않는다. 개수·크기만 확인했다.
- 번역본은 없다. `brag/slim.md`는 `brag-slim/SKILL.md`와 `shasum`이 같다(`11c041fc…`). `brag-slim`을 `SKILL.md`로 한 번 더 읽어 관계 확인에만 썼고, 그 스킬의 내부 규칙은 `brag-slim` 페이지에서 다룬다.
- 실행하지 않았다. `npx hyperframes`, `ffmpeg`, `uv run`, `mkdir`, `cp`는 지시상 동작이다.
- 컬렉션 밖이라 읽지 못한 것: Hyperframes 스킬 4개(`hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`)와 `media-use/audio/references/captions/motion.md`, `audio/scripts/extract-audio-data.py`. 이 때문에 구성 단계의 실제 동작은 부분 분석이다.
- 분석 중 바뀐 파일: 없음.
