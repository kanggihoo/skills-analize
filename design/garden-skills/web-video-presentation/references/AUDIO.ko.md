# 오디오 합성

각 장의 `narrations.ts`에 있는 내레이션 문구를 **step 단위**로 나누어 mp3로 합성하고 `presentation/public/audio/<chapter-id>/<step-N>.mp3`에 저장합니다. 런타임의 Auto 모드는 step에 맞춰 오디오를 재생하고 자동으로 다음 단계로 이동하므로 한 번에 녹화할 수 있습니다.

> **기준 원본**: 각 장의 `src/chapters/<NN>-<id>/narrations.ts`만 step 수와 내레이션 문구의 **유일한 원본**으로 사용합니다. `outline.md`는 더 이상 오디오 합성에 쓰지 않고, 장 코드에 `totalSteps`를 직접 적지도 않습니다. 이 변경으로 “웹 step 수와 오디오 파일 수가 맞지 않는” 기존 문제가 해결됩니다.

합성기는 **provider 불문** 방식입니다. runner는 특정 TTS 백엔드에 묶이지 않으며 백엔드마다 `scripts/tts-providers/<name>.sh` 파일 하나를 사용합니다. **기본 제공 provider 두 가지**:

| Provider | 기본값 | 사용 시점 |
|---|---|---|
| `minimax` | ✓ | 중국어 내레이션에 우선 권장 (`mmx-cli` 사용, MiniMax API 키 필요) |
| `openai` | — | 많은 에이전트가 이미 `OPENAI_API_KEY`를 보유. curl 기반이며 응답이 빠름 |

provider를 교체하거나 추가하려면 [`scripts/tts-providers/README.md`](../templates/scripts/tts-providers/README.md)를 참조합니다 (스캐폴드를 실행한 뒤 경로는 `presentation/scripts/tts-providers/README.md`). README에는 복사해서 쓸 수 있는 코드 예시 5종 (ElevenLabs / edge-tts / macOS say / Azure / Google Cloud)과 사용자 지정 provider의 세 함수 계약도 있습니다.

---

## 파일 명명 규칙

```text
presentation/public/audio/
├── coldopen/
│   ├── 1.mp3
│   ├── 2.mp3
│   └── ...
├── hook/
│   └── ...
└── ...
```

- 장 하위 디렉터리 이름 = `chapters.ts`의 `id`
- 파일 이름 = `<step-N>.mp3` (**1부터 시작**, narrations 배열의 인덱스 + 1에 대응)
- 기본 형식은 mp3입니다. 작성한 provider가 wav만 만들 수 있다면 함수 안에 `ffmpeg` 변환 단계를 추가합니다 (`tts-providers/README.md`의 `say.sh` 예시 참고).

---

## 표준 절차

### 1. segments 추출

```bash
cd presentation
npm run extract-narrations
```

모든 장의 `narrations.ts`를 스캔하고 `chapters.ts` 등록 순서에 따라 `audio-segments.json`을 생성합니다.

```json
[
  { "chapter": "coldopen", "step": 1, "text": "...", "audio": "coldopen/1.mp3" },
  { "chapter": "coldopen", "step": 2, "text": "...", "audio": "coldopen/2.mp3" },
  ...
]
```

합성 전에 사용자에게 이 JSON을 **먼저 훑어보고** 텍스트와 구간 분할이 맞는지 확인해 달라고 합니다. 확인 후에 토큰을 사용해 합성합니다.

> 내레이션이 빈 문자열인 step은 자동으로 건너뜁니다 (TTS 토큰 소모 없음). 런타임의 Auto 모드는 이런 “무음 전환” step을 글자 수 기반 예상 시간으로 재생합니다.

### 2. provider 선택

```bash
ls scripts/tts-providers/    # 이 프로젝트에 어떤 provider가 들어 있는지 확인
```

- 기본 `minimax` 사용 → [2.A](#2a-내장-minimax로-합성)로 이동
- 내장 `openai` 사용 → [2.B](#2b-내장-openai로-합성)로 이동
- 다른 TTS나 자체 TTS 사용 → [2.C](#2c-provider-교체--사용자-지정-provider-추가)로 이동
- 설치된 provider가 하나도 없음 → [2.D](#2d-대체-절차)로 이동

#### 2.A 내장 minimax로 합성

```bash
npm run synthesize-audio              # 증분 합성: 이미 있는 mp3는 건너뜀
npm run synthesize-audio -- --force   # 전체 재합성
npm run synthesize-audio -- --voice=<voice-id>  # 음성 지정
```

시작할 때 runner가 먼저 provider의 `tts_check`를 실행합니다.

- mmx가 설치되지 않음 → `mmx CLI not found in PATH` 오류와 설치 안내 출력
- mmx에 로그인되지 않음 → `mmx is not authenticated` 오류와 로그인 명령 안내

문제를 해결한 뒤 다시 실행합니다. 각 구간의 진행 상황을 출력합니다.

```text
[  3/24] coldopen/3.mp3   ✓ 4s
[  4/24] coldopen/4.mp3   skip (exists)
```

합성은 순차 처리합니다 (요청 제한 회피). **이미 있는 파일은 자동으로 건너뛰므로** 중단 후 이어서 진행할 수 있고 토큰을 중복 소모하지 않습니다.

#### 2.B 내장 openai로 합성

```bash
export OPENAI_API_KEY=sk-...                   # platform.openai.com에서 발급
PRESENTATION_TTS=openai npm run synthesize-audio
# 음성과 HD 모델 변경
OPENAI_TTS_MODEL=tts-1-hd PRESENTATION_TTS=openai \
  npm run synthesize-audio -- --voice=nova
```

선택적 환경 변수:

| 변수 | 기본값 | 용도 |
|---|---|---|
| `OPENAI_API_KEY` | — **필수** | API 키 |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | 프록시 / Azure-OpenAI로 전환 |
| `OPENAI_TTS_MODEL` | `tts-1` | `tts-1`은 빠름 / `tts-1-hd`는 고품질이며 비용 약 2배 |
| `--voice=` / `PRESENTATION_TTS_VOICE` | `alloy` | alloy / echo / fable / onyx / nova / shimmer 중 선택 |

`tts_check`는 curl / jq / `OPENAI_API_KEY`가 모두 있는지 검사하고 누락된 항목을 각각 표시합니다.

#### 2.C provider 교체 / 사용자 지정 provider 추가

내장 외의 흔한 백엔드는 `scripts/tts-providers/README.md`에 복사해 쓸 수 있는 코드 예시 5종으로 제공됩니다 (ElevenLabs / edge-tts / macOS `say` / Azure / Google Cloud).

하나를 선택 → README의 코드 블록 복사 → `scripts/tts-providers/<name>.sh`로 저장 → 환경 변수 설정 → provider를 바꿔 실행:

```bash
PRESENTATION_TTS=elevenlabs npm run synthesize-audio
# 또는
npm run synthesize-audio -- --provider=edge-tts
```

사용자 TTS가 완전히 자체 구현이라면 **세 함수 계약**에 맞는 `<name>.sh` 하나를 작성합니다.

| 함수 | 필수 여부 | 용도 |
|---|---|---|
| `tts_synthesize <text> <out_path> [<voice>]` | ✓ | 문장 하나를 지정 경로의 mp3로 작성 |
| `tts_check` | 선택 | 시작 시 환경 확인 (CLI / 키 / 인증). 준비되지 않았으면 0이 아닌 값을 반환 |
| `tts_install_help` | 선택 | `tts_check` 실패 시 해결 방법 출력 |

시작하려면 `openai.sh` (HTTP 기반) 또는 `minimax.sh` (CLI 기반)를 복사하는 것이 가장 빠릅니다. 자세한 규격은 `scripts/tts-providers/README.md`를 참고합니다.

#### 2.D 대체 절차

내장 provider 두 개가 모두 준비되지 않은 경우 (mmx 미설치, OpenAI 키 없음) 사용자에게 다음을 안내합니다.

```text
가능한 선택:

  1. OpenAI 키가 이미 있으면 내장 openai provider 사용
     export OPENAI_API_KEY=sk-...
     PRESENTATION_TTS=openai npm run synthesize-audio

  2. MiniMax CLI 설치 (기본 provider이며 중국어 음성이 더 안정적)
     npm install -g mmx-cli && mmx auth login --api-key sk-xxxxx
     API 키 발급: https://platform.minimaxi.com

  3. 다른 provider 사용
     scripts/tts-providers/README.md에 바로 쓸 수 있는 코드 예시 5종:
       • ElevenLabs  (ELEVENLABS_API_KEY 필요, 영어 음성 품질이 가장 좋음)
       • edge-tts    (무료 / 키 불필요 / pip install edge-tts)
       • macOS say   (의존성 없는 오프라인, 품질은 보통, 미리보기에 적합)
       • Azure       (AZURE_SPEECH_KEY 필요)
       • Google      (gcloud auth 필요)
     코드 하나를 복사해 tts-providers/<name>.sh로 저장하고
     PRESENTATION_TTS=<name> npm run synthesize-audio 실행

  4. 일단 건너뛰기
     원고와 narrations가 있으므로 원하는 TTS로 직접 녹음하면 됩니다.
     파일 이름은 audio-segments.json의 audio 필드에 맞추면 됩니다.
```

합성에 성공했다고 가장하지 않습니다.

---

## 오디오 길이 확인

합성이 끝난 뒤 실행:

```bash
for f in public/audio/*/*.mp3; do
  d=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$f")
  echo "$f  ${d}s"
done
```

각 파일의 실제 초 수를 합산해 사용자에게 알립니다. **15초 이상인 항목에 주의**합니다 — 내레이션이 너무 길면 해당 step의 문구가 너무 빽빽하거나 step을 충분히 나누지 않은 것입니다. 사용자에게 **원고를 수정해 재합성할지**, 아니면 **장 코드를 수정해 step을 나눌지** 결정하게 합니다.

---

## 런타임에서 합성 오디오 사용

합성 후 **추가 설정은 필요하지 않습니다.** 스캐폴드의 `App.tsx`에 이미 연결되어 있습니다.

| 모드 | 실행 방법 | 동작 |
|---|---|---|
| **Manual** (기본) | 페이지 바로 열기 | 오디오 없이 클릭 / 화살표 키로 진행 |
| **Audio** (반자동) | URL `?audio=1` 또는 `M` 키 | step 진입 시 오디오가 자동 재생되지만 다음 단계는 직접 진행 (마우스 클릭) |
| **Auto** (완전 자동) | URL `?auto=1` 또는 `M` 키 두 번 | step 진입 → 오디오 재생 → 완료 후 자동 next() → 다음 step으로 이동 → 반복 |

Auto 모드는 브라우저 자동 재생 제한을 우회하기 위해 처음에 `Space`를 한 번 눌러야 합니다. 그 뒤에는 자동으로 재생됩니다. **녹화 시 화면 녹화 시작 → Space 입력 → 영상 전체 자동 재생 → 녹화 중단.**

> **Auto 모드 전진 규칙은 한 문장입니다**: 오디오가 끝난 뒤 200ms 버퍼를 두고 자동으로 next.
> “애니메이션 완료까지 기다리기” 같은 대체 로직은 없습니다. 시각 애니메이션이 내레이션보다 길면 즉시 잘립니다. 더 긴 내레이션을 쓰거나 step을 나누거나 애니메이션 속도를 조정합니다 ([`CHAPTER-CRAFT.md`](CHAPTER-CRAFT.md)의 “코드 레이어 최소 제약” 참고).
>
> 오디오 파일이 없거나 (아직 합성하지 않았거나 404) narration이 빈 문자열이면 글자 수 기반 시간으로 대체합니다 (`max(1500ms, 글자 수 × 250ms)`). 따라서 미리보기에서도 전체 영상을 재생할 수 있습니다.

---

## 문제 해결

일반:

| 증상 | 원인 / 해결 |
|---|---|
| `chapter id "X" registered but no matching folder found` | 장 폴더 이름을 `NN-<id>`로 지정해야 함. id는 chapters.ts에 등록된 값과 같아야 함 |
| `narrations.ts in X must export an array named "narrations"` | 해당 장의 narrations.ts가 `narrations`라는 이름의 배열을 export하지 않음 |
| `TTS provider 'X' not found` | `scripts/tts-providers/X.sh`가 없음. 사용 가능한 목록을 확인하거나 README를 참고해 추가 |
| `provider 'X' does not define tts_synthesize` | `<X>.sh`에 필수 함수가 없음. README의 계약을 확인 |
| 중간에 몇 개 구간이 합성되지 않고 중단 | `npm run synthesize-audio`를 다시 실행 — 이미 있는 파일은 건너뜀 |
| 브라우저에서 오디오가 재생되지 않음 | Auto / Audio 모드의 최초 재생에는 사용자 입력이 필요함 — Auto를 시작하려면 SPACE를 눌렀는지, 페이지를 클릭했는지 확인 |
| 오디오 404인데 Auto 모드는 계속 진행 | mp3를 찾지 못하면 useAudioPlayer가 글자 수 기반 시간 (초당 4글자)으로 대체해 미리보기를 이어감 |

minimax 전용:

| 증상 | 원인 / 해결 |
|---|---|
| `mmx: command not found` | `npm install -g mmx-cli` 실행. npm 전역 bin이 PATH에 없으면 `npm config get prefix`로 확인 |
| `mmx is not authenticated` | `mmx auth login --api-key sk-xxxxx`로 다시 로그인 |
| 중국어 음성이 부자연스러움 | mmx 기본 음성이 최선이 아닐 수 있음. `mmx speech --help`에서 `--voice` 선택지를 확인하고 `--voice=<id>` 전달 |
| 문장 끝이 잘려 합성됨 | 구간이 너무 긺 (mmx 기본 한도 약 5000자). narrations.ts에서 문구를 둘로 나눔 (step도 두 개로 나누는 것이 적절할 수 있음) |

openai 전용:

| 증상 | 원인 / 해결 |
|---|---|
| `OPENAI_API_KEY is not set` | `export OPENAI_API_KEY=sk-...` 실행하거나 shell rc / `.env`에 추가 |
| 모든 구간이 FAILED인데 키는 맞음 | model / voice 이름 오류일 가능성이 큼. 기본값 `--voice=alloy`, `OPENAI_TTS_MODEL=tts-1`을 시험하고 `bash -x scripts/synthesize-audio.sh`로 요청 본문을 확인 |
| 프록시 / Azure-OpenAI 경유 | `export OPENAI_BASE_URL=https://your-proxy/v1` |
| HD가 너무 느림 | 기본 모델 `OPENAI_TTS_MODEL=tts-1` 사용. HD는 약 2배 느림 |
| 중국어 음성이 자연스럽지 않음 | OpenAI의 6개 음성은 영어에 치우쳐 있음. 중국어 내레이션은 `minimax`가 더 적합 |

다른 (사용자 지정) provider로 교체한 뒤:

| 증상 | 원인 / 해결 |
|---|---|
| `<X>_API_KEY not set` | provider에서 API 키가 필요하지만 환경 변수에 없음. `export <X>_API_KEY=...` 또는 `.env`에 작성한 뒤 `set -a; source .env; set +a` 실행 |
| 합성한 mp3를 브라우저에서 재생할 수 없음 | provider가 정말 mp3를 만든 것인지 확인 (wav / opus / aac일 수 있음). `file public/audio/*/*.mp3`로 magic header 확인 |
| 모든 설정이 맞는 것 같은데 전부 FAILED | `bash -x scripts/synthesize-audio.sh`로 각 구간에서 실제 실행한 명령 확인 |

---

## 관련 링크

- Provider 계약 + 바로 쓸 수 있는 코드: [`scripts/tts-providers/README.md`](../templates/scripts/tts-providers/README.md)
- mmx-cli 저장소: <https://github.com/MiniMax-AI/cli>
- mmx 공식 문서: <https://platform.minimaxi.com/docs/token-plan/minimax-cli>
- mmx 매개변수 / 음성 검색: `mmx speech --help`
