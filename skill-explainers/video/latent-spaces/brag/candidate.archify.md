# brag — 프로젝트 코드로 15~25초 출시 영상을 만든다 {#overview}

`brag`는 에이전트가 현재 프로젝트의 코드를 직접 읽어 기획과 스토리보드를 세운 뒤, 외부 Hyperframes 스킬에 구현과 렌더링을 맡겨 출시 영상과 공유 문구를 내는 스킬이다.[](source:s-fm)[](source:s-what) **부분 분석**: 3단계에서 읽으라고 지시하는 외부 Hyperframes 스킬 4개(`hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`)가 이 저장소에 없어 구현 세부 동작은 확인하지 못했다.[](source:s-step3)

- 사용자가 `/brag`나 출시 영상 요청으로 부르거나 모델이 `description`으로 판단해 켜며, Claude Opus 5.5·Sonnet 5.5·Fable 5.2 모델이 `--full`이나 `--voice` 없이 실행하면 번들된 `slim.md`(`/brag-slim`)로 넘긴다.[](source:s-fm)[](source:s-dispatch)
- 결과로 `brag-output/`(기존 폴더가 있으면 타임스탬프 폴더) 아래에 기획서(`brag-plan.md`), 구성 지시문(`composition-brief.md`), `composition/` 프로젝트, 영상(`brag.mp4`), 포스터 프레임(`brag.jpg`), 공유 문구(`share-copy.txt`)가 남는다.[](source:s-out)[](source:s-step4)
- 다른 스킬과의 관계: 조건에 맞으면 `brag-slim`으로 넘기고(`다음 안내`), 3단계에서는 저장소 밖 Hyperframes 스킬 4개를 부르며(`호출`), `explainer-high-energy`와는 코드에서 홍보 영상을 만드는 `대안` 관계다.[](source:s-dispatch)[](source:s-step3)[](source:rel-ehe)
- 15~25초 창을 넘는 영상(`--duration` 지정 시 제외), 비밀·개인정보 노출, 근거 없는 제품 주장, 일반적 SaaS 상투어("Streamline your workflow"), Hyperframes의 `story.md`·`SPEC.md`·`REVIEW.md` 단계를 금지한다.[](source:s-step3)[](source:s-laws)[](source:r1-sec)[](source:r3-ground)

@answer scope="video/latent-spaces/brag · 원본 파일 18개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=f53b74e8bae4a9f9a8a11d2d3d0dc2b980b855ed
@source s-fm title="frontmatter: name, description" path=video/latent-spaces/brag/SKILL.md lines=1:4
@source s-dispatch title="호출 분기: 모델 확인, --voice, slim.md 전환" path=video/latent-spaces/brag/SKILL.md lines=10:18
@source s-what title="5단계 요약과 옵션 파싱" path=video/latent-spaces/brag/SKILL.md lines=21:60
@source s-out title="출력 디렉토리와 타임스탬프 규칙" path=video/latent-spaces/brag/SKILL.md lines=72:88
@source s-step1 title="Step 1: 프로젝트 조사와 통과 조건" path=video/latent-spaces/brag/SKILL.md lines=92:99
@source s-step2 title="Step 2: 기획과 스토리보드" path=video/latent-spaces/brag/SKILL.md lines=102:111
@source s-step3 title="Step 3: Hyperframes 위임과 건너뛰기 규칙" path=video/latent-spaces/brag/SKILL.md lines=114:125
@source s-step4 title="Step 4: 검증, 렌더, 전달" path=video/latent-spaces/brag/SKILL.md lines=128:135
@source s-tones title="7가지 톤 프리셋과 창작 규칙" path=video/latent-spaces/brag/SKILL.md lines=138:155
@source s-laws title="창작 규칙과 기본 장면 구성" path=video/latent-spaces/brag/SKILL.md lines=158:181
@source r1-rubric title="step-1-inspect: 우선 읽기 파일과 9문항 기준" path=video/latent-spaces/brag/references/step-1-inspect.md lines=5:86
@source r1-sec title="step-1-inspect: 제외 파일과 비밀정보 금지" path=video/latent-spaces/brag/references/step-1-inspect.md lines=118:133
@source r2-plan title="step-2-plan: brag-plan.md 구조, 읽기 시간 하한, 오디오 계획" path=video/latent-spaces/brag/references/step-2-plan.md lines=13:214
@source r3-brief title="step-3-compose: composition-brief.md 구조와 요구사항" path=video/latent-spaces/brag/references/step-3-compose.md lines=3:91
@source r3-vo title="step-3-compose: 음성 해설(Kokoro), audio-reactive, beat sync" path=video/latent-spaces/brag/references/step-3-compose.md lines=110:181
@source r3-ground title="step-3-compose: 자가 점검과 사실 근거 규칙" path=video/latent-spaces/brag/references/step-3-compose.md lines=199:237
@source r4-deliv title="step-4-deliver: check 통과 조건, 렌더, 포스터 프레임, 공유 문구" path=video/latent-spaces/brag/references/step-4-deliver.md lines=3:94
@source r-tones title="tones: 7가지 톤별 문구·리듬·전환 규칙" path=video/latent-spaces/brag/references/tones.md lines=1:231
@source r-audio title="audio: 효과음·음악 목록, beat sync, 음량·트랙 규칙" path=video/latent-spaces/brag/references/audio.md lines=1:315
@source a-music title="assets/music/README: 번들 음악 5곡과 cue 프리셋 안내" path=video/latent-spaces/brag/assets/music/README.md lines=1:22
@source a-sfx title="assets/sfx/sfx-analysis: 효과음 고주파 위험도와 안전 선택지" path=video/latent-spaces/brag/assets/sfx/sfx-analysis.md lines=1:75
@source a-cue title="music-cues.md: vol-1 박자 격자와 strong cues 표본" path=video/latent-spaces/brag/assets/music/cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.md lines=1:35
@source sc-py title="analyze_music_cues.py: 사용자 지정 곡 박자·강세 추출기" path=video/latent-spaces/brag/scripts/analyze_music_cues.py lines=1:10
@source sc-toml title="pyproject.toml: librosa 등 Python 의존성" path=video/latent-spaces/brag/scripts/pyproject.toml lines=1:14
@source sc-test title="test_analyze_music_cues.py: 분석기 기본 단위 테스트" path=video/latent-spaces/brag/scripts/tests/test_analyze_music_cues.py lines=1:21
@source rel-slim title="brag-slim의 /brag 상호 참조" path=video/latent-spaces/brag-slim/SKILL.md lines=1:4
@source rel-ehe title="explainer-high-energy의 홍보 영상 목적" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=1:4

## 어떻게 동작하나 {#flow span=12}

실행이 시작되면 먼저 모델과 옵션을 확인해 `slim.md` 전환 여부를 가른다.[](source:s-dispatch) `--voice`가 켜지면 `brag-slim`으로 넘기지 않고 Kokoro TTS 음성을 생성해 음악을 0.12~0.15 음량으로 ducking(음성이 나올 때 배경 음악을 낮춤)한다.[](source:s-dispatch)[](source:r3-vo)

@workflow id=flow-diagram title="brag 흐름"
| lane intake | 분기·조사 |
| lane plan | 기획·위임 |
| lane ship | 검증·전달 |
| dispatch | 모델·옵션 확인? | backend | intake | source:s-dispatch |
| slim | slim.md 전환 | backend | intake | source:s-dispatch |
| inspect | Step 1 프로젝트 조사 | backend | intake | source:s-step1 |
| plan | Step 2 기획·스토리보드 | backend | plan | source:s-step2 |
| compose | Step 3 Hyperframes 위임 | backend | plan | source:s-step3 |
| deliver | Step 4 검증·렌더·전달 | backend | ship | source:s-step4 |
| dispatch > slim | Opus 5.5·Sonnet 5.5·Fable 5.2 |
| dispatch > inspect | 그 외 또는 --full·--voice |
| inspect > plan | 9문항 기준 충족 |
| plan > compose | brag-plan.md 완성 |
| compose > deliver | check 0오류 통과 |

@steps id=flow-steps
| s-dispatch | 모델·옵션 확인? | **입력** 사용자 `/brag` 호출과 옵션 · **출력** 실행 경로(`slim.md` 또는 전체 워크플로), `--tone`·`--format`·`--duration`·`--voice` 설정, 출력 폴더 경로. **처리** 모델이 Opus 5.5, Sonnet 5.5, Fable 5.2이고 `--full`("use the full brag")이나 `--voice`가 없으면 `slim.md` 전환을 고르고, 그 외에는 옵션을 파싱해 출력 폴더를 정한다.[](source:s-dispatch)[](source:s-what)[](source:s-out) | flow-diagram | dispatch |
| s-slim | slim.md 전환 | **입력** 사용자 입력과 평문 옵션(`--no-music`, `--title` 등) · **참조** `slim.md` · **출력** `brag-slim` 워크플로 실행. **처리** 사용자에게 전환 사실과 "use the full brag" 복귀 방법을 한 줄로 알린 뒤 이번 실행의 나머지를 `slim.md` 지시로 넘긴다.[](source:s-dispatch) | flow-diagram | slim |
| s-inspect | Step 1 프로젝트 조사 | **입력** 현재 프로젝트 폴더 · **참조** `references/step-1-inspect.md` · **출력** 9문항 기획 기준 답변, 색상·폰트 추출 결과, 사용자 흐름(진입→핵심 동작→결과) 요약. **처리** `index.html`, `styles.css`, `README.md`, 라우트를 우선순위로 읽어 제품 실사용 흐름과 시각 정체성을 뽑되 비밀 파일과 개인정보는 건너뛴다.[](source:s-step1)[](source:r1-rubric)[](source:r1-sec) | flow-diagram | inspect |
| s-plan | Step 2 기획·스토리보드 | **입력** 조사 결과와 톤 옵션 · **참조** `references/step-2-plan.md`, `references/tones.md`, `assets/music/cues/*.music-cues.md` · **출력** `brag-plan.md`(각도, hook, 스토리보드, 오디오·박자 계획). **처리** 7가지 톤 프리셋 중 하나를 고르거나 자유 지시를 매핑해 총 15~25초(`--duration` 지정 시 예외) 분량의 장면표와 읽기 시간 하한을 설계한다.[](source:s-step2)[](source:s-tones)[](source:r2-plan)[](source:r-tones)[](source:a-cue) | flow-diagram | plan |
| s-compose | Step 3 Hyperframes 위임 | **입력** `brag-plan.md`와 선택 음악 파일 · **참조** `references/step-3-compose.md`, `references/audio.md`, `assets/sfx/sfx-analysis.md`, `assets/music/README.md` · **실행** `uv run --project scripts python scripts/analyze_music_cues.py`, `npx hyperframes tts`, `npx hyperframes beats` · **출력** `composition-brief.md`와 `composition/` 구현체. **처리** 음악을 `composition/assets/music/`에 복사하고 외부 Hyperframes 스킬 4개를 읽어 구현·박자 맞춤·audio-reactive 추출을 맡긴다.[](source:s-step3)[](source:r3-brief)[](source:r3-vo)[](source:r-audio)[](source:a-music)[](source:a-sfx)[](source:sc-py) **다음** Hyperframes의 `story.md`, `SPEC.md`, `REVIEW.md` 단계는 건너뛰고 사실 근거 자가 점검을 마친 뒤 `npx hyperframes check`로 넘긴다.[](source:s-step3)[](source:r3-ground) | flow-diagram | compose |
| s-deliver | Step 4 검증·렌더·전달 | **입력** `composition/` 프로젝트 · **참조** `references/step-4-deliver.md` · **실행** `npx hyperframes check`, `npx hyperframes snapshot`, `npx hyperframes preview`, `npx hyperframes render --output ../brag.mp4`, `ffmpeg` · **출력** `brag.mp4`, 포스터 프레임 `brag.jpg`, `share-copy.txt`. **처리** `check`에서 오류와 WCAG 대비 누락을 모두 고친 뒤 렌더링하고, 가장 안정된 화면을 뽑아 `brag.jpg`를 만들어 영상의 0번 프레임에 구워 넣는다.[](source:s-step4)[](source:r4-deliv) **다음** `preview` 단계에서 localhost 주소를 알리고 사용자 확인이나 렌더 요청을 기다린다.[](source:r4-deliv) | flow-diagram | deliver |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령(`/brag`) 또는 모델 판단(`description` 일치 시 자동 선택). 호출 제한 필드 없음.[](source:s-fm) |
| 성격 | 절차형(모델 분기 후 4단계 기획·위임·렌더). 코드 분석과 기획은 직접 맡고 영상 구현·렌더는 외부 Hyperframes 스킬로 넘긴다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#rel-r01} | `brag-slim` | 다음 안내 | 모델이 Claude Opus 5.5·Sonnet 5.5·Fable 5.2이고 `--full`("use the full brag")이나 `--voice` 요청이 없을 때 `slim.md`를 읽고 이번 실행을 넘긴다(의무형). 전환 전 사용자에게 한 줄로 알린다.[](source:s-dispatch) |
| `brag-slim` {#rel-r02} | **이 스킬** | 참고 | `brag-slim`의 `description`이 `/brag`도 함께 설치돼 있으면 호출 문구를 `/brag`에 맡기고 해당 모델에서만 넘겨받는다고 밝힌다.[](source:rel-slim) |
| **이 스킬** {#rel-r09} | `hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use` | 호출 | Step 3에서 4개 스킬을 읽고 구성·애니메이션·오디오·렌더를 맡긴다(저장소 밖 `범위 밖`). 단 `story.md`·`SPEC.md`·`REVIEW.md` 단계는 건너뛰고 `npx hyperframes check`를 통과 조건으로 쓴다.[](source:s-step3)[](source:r3-brief) |
| **이 스킬** {#rel-r14} | `explainer-high-energy` | 대안 | 둘 다 코드에서 제품 홍보·출시 영상을 만든다. `brag`는 프로젝트 코드를 읽고 `explainer-high-energy`는 제품 설명을 질문으로 받는다.[](source:s-fm)[](source:rel-ehe) |

@architecture id=relation-map title="brag과 이어지는 스킬"
| self | brag(이 스킬) | backend |
| slim | brag-slim | backend |
| hf | hyperframes 계열 4종(범위 밖) | backend |
| ehe | explainer-high-energy | backend |
| self > slim | 다음 안내 |
| slim > self | 참고 |
| self > hf | 호출 |
| self > ehe | 대안 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 모델 분기, 옵션 파싱, 4단계 개요, 7가지 톤, 창작 규칙 본문 181줄 | 스킬이 켜질 때 읽는다 | 모델·옵션 확인?, Step 1 프로젝트 조사, Step 2 기획·스토리보드, Step 3 Hyperframes 위임, Step 4 검증·렌더·전달 |
| `slim.md` | `brag-slim/SKILL.md`와 동일한 번들 사본 108줄 | Opus 5.5·Sonnet 5.5·Fable 5.2에서 `--full`·`--voice` 없이 켜질 때 읽는다[](source:s-dispatch) | slim.md 전환 |
| `references/step-1-inspect.md` | 파일 읽기 우선순위, 9문항 기준, 색상·폰트 추출, 비밀 제외 규칙 | Step 1을 수행할 때 읽는다[](source:s-step1) | Step 1 프로젝트 조사 |
| `references/step-2-plan.md` | `brag-plan.md` 템플릿, 장면 수·길이·읽기 시간 하한, 오디오·cue 계획 | Step 2를 수행할 때 읽는다[](source:s-step2) | Step 2 기획·스토리보드 |
| `references/step-3-compose.md` | `composition-brief.md` 틀, Kokoro 음성, audio-reactive, beat sync, 자가 점검 | Step 3을 수행할 때 읽는다[](source:s-step3) | Step 3 Hyperframes 위임 |
| `references/step-4-deliver.md` | `check` 대비 검사, 렌더, `brag.jpg` 추출·0번 프레임 삽입, `share-copy.txt` 형식 | Step 4를 수행할 때 읽는다[](source:s-step4) | Step 4 검증·렌더·전달 |
| `references/tones.md` | 7가지 톤 프리셋별 에너지·어조·타이포·전환 세부 규칙 | 톤을 고르거나 스토리보드를 짤 때 읽는다[](source:s-tones) | Step 2 기획·스토리보드 |
| `references/audio.md` | SFX 4개 폴더·키보드 WAV, 음악 5곡, beat sync 3가지 경로, 트랙·음량 규약 | Step 3 오디오 준비 시 읽는다[](source:s-step3)[](source:r-audio) | Step 3 Hyperframes 위임 |
| `assets/music/README.md` | ende.app CC BY 4.0 음악 5곡 목록과 라이선스 표시 규칙 | 번들 음악을 고를 때 읽는다[](source:a-music) | Step 3 Hyperframes 위임 |
| `assets/music/cues/*.music-cues.md` | 번들 5곡의 첫 25초 박자 격자와 `strongCues` 요약(5개 파일) | 번들 음악을 골랐을 때 읽는다[](source:s-step2)[](source:a-cue) | Step 2 기획·스토리보드 |
| `assets/sfx/sfx-analysis.md` | Kenney 효과음 228개의 고주파 위험도와 용도별 안전 선택지 | 효과음을 고를 때 읽는다[](source:r3-vo)[](source:a-sfx) | Step 3 Hyperframes 위임 |
| `scripts/analyze_music_cues.py` | `librosa`로 임의 오디오의 박자·강세 cue JSON/MD 생성 스크립트 | 사용자 지정 음악에 확장 박자 분석을 돌릴 때 실행한다[](source:r-audio)[](source:sc-py) | Step 3 Hyperframes 위임 |
| `scripts/pyproject.toml` | `analyze_music_cues.py`용 Python 3.11+ 의존성 정의 | `uv run --project scripts` 실행 시 참조한다[](source:r-audio)[](source:sc-toml) | Step 3 Hyperframes 위임 |
| `scripts/tests/test_analyze_music_cues.py` | cue 분석기의 NaN·비유한값 처리 단위 테스트 21줄 | 원문 지시에서 직접 호출하지 않는 개발용 테스트다[](source:sc-test) | - |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 모델이 Opus 5.5·Sonnet 5.5·Fable 5.2이고 `--full`·`--voice`가 없을 때 | 사용자에게 한 줄로 알린 뒤 `slim.md` 지시로 전환한다. | [](source:s-dispatch) |
| 프로젝트 조사 중 `.env`, `.pem`, `dist/`, `node_modules/`, 테스트·lock 파일을 만날 때 | 읽기를 건너뛰고, UI에 든 개인정보·비밀값은 가명 데이터로 바꾼다. | [](source:r1-sec) |
| 영상 길이(`--duration` 미지정)를 정할 때 | `--voice` 사용 여부와 무관하게 총 15~25초(권장 18~22초)를 넘기지 않는다. | [](source:s-laws)[](source:r3-vo) |
| 화면에 읽을 텍스트를 배치할 때 | 짧은 라벨은 약 0.8초, 문장은 단어당 약 0.3초(최소 1.2초) 이상 정지 상태를 유지한다. | [](source:s-laws)[](source:r2-plan) |
| 제품 설명 문구와 수치를 쓸 때 | 프로젝트 코드·UI·README에 근거가 있는 사실만 쓰고, 근거 없는 과장이나 "Streamline your workflow" 같은 상투어를 금지한다. | [](source:s-laws)[](source:r3-ground) |
| Step 1·2·3·4 각 통과 조건 | Step 1은 9문항 답변, Step 2는 `brag-plan.md` 완성, Step 3은 `npx hyperframes check` 0오류, Step 4는 `brag.mp4`·0번 프레임 포스터·`share-copy.txt` 완성이 조건이다. | [](source:s-step1)[](source:s-step2)[](source:s-step3)[](source:s-step4) |
| `check` 결과 `0/0 text checks`가 나오거나 대비 오류가 있을 때 | `oklch()`를 hex/`rgb()`로 바꾸는 등 수정을 거쳐 실제 텍스트가 감사될 때까지 진행하지 않는다(`--no-contrast` 우회 불인정). | [](source:r4-deliv) |
| `npx hyperframes preview`를 띄운 뒤 | localhost URL을 사용자에게 안내하고, 승인 또는 렌더 요청 전까지 최종 렌더링을 진행하지 않는다. | [](source:r4-deliv) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 7가지 톤 프리셋과 오디오·박자 동기화 규칙 — 맡을 개요 항목: Step 2 기획·스토리보드, Step 3 Hyperframes 위임 · 톤별 타이포·전환 표(`tones.md`)와 효과음 위험도·음량·트랙 번호 규칙(`audio.md`, `sfx-analysis.md`)을 개요에서 줄였다.

@callout level=open-question title="확인하지 못한 것"
| 외부 Hyperframes 스킬 4개(`hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`)가 이 저장소에 없어 `composition/` 구현, `check` 내부 감사 항목, `extract-audio-data.py` 동작은 확인하지 못했다.[](source:s-step3)[](source:r3-vo) |

읽은 원본: 텍스트 파일 18개(`SKILL.md`, `slim.md`, `references/` 6개, `assets/music/README.md`, `assets/sfx/sfx-analysis.md`, `assets/music/cues/*.music-cues.md` 5개, `scripts/` Python·TOML 3개). 구조·표본만 확인: `sfx-analysis.json`, `*.music-cues.json` 5개, `uv.lock`. 제외: 바이너리 음원 파일(`mp3`, `ogg`, `wav`).