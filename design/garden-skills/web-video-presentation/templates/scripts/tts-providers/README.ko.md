# TTS 제공자

`synthesize-audio.sh`는 특정 제공자에 종속되지 않는 runner입니다. 어떤 TTS를 호출할지 자체적으로 알지 못하고 `audio-segments.json`을 순회하며, 이미 있는 파일은 건너뛰고 진행 상황만 표시합니다.

**각 제공자는 이 디렉터리의 `.sh` 파일 하나로 구현합니다.** 필수 함수 `tts_synthesize`와 선택 함수 `tts_check`, `tts_install_help`를 정의합니다. runner는 `PRESENTATION_TTS` 환경 변수에 따라 파일을 불러옵니다.

---

## 사용법

```bash
# 기본값 (minimax)
npm run synthesize-audio

# 제공자 바꾸기
PRESENTATION_TTS=openai npm run synthesize-audio
npm run synthesize-audio -- --provider=elevenlabs

# 음성 지정 (각 제공자가 직접 해석)
PRESENTATION_TTS_VOICE=alloy npm run synthesize-audio
npm run synthesize-audio -- --voice=zh-CN-YunxiNeural

# 모든 파일을 강제로 다시 합성
npm run synthesize-audio -- --force
```

명령줄의 `--provider`와 `--voice` 인자가 환경 변수를 덮어씁니다.

---

## 기본 제공자

| 파일 | 백엔드 | 인증 | 참고 |
|---|---|---|---|
| `minimax.sh` | MiniMax `mmx` CLI | `mmx auth login --api-key` | **기본값**. 중국어 내레이션 품질이 안정적입니다. |
| `openai.sh` | OpenAI Audio Speech API | `OPENAI_API_KEY` 환경 변수 | curl 기반이며 대부분의 agent는 이미 키를 갖고 있습니다. |

기본 제공자는 두 개만 넣었습니다. 나머지 기술 선택은 사용자가 결정합니다. 다른 백엔드 코드 예시는 아래에 있습니다. `tts-providers/<name>.sh`에 복사하면 사용할 수 있습니다.

---

## 직접 TTS 제공자를 추가하는 방법

1. 이 디렉터리에 `<name>.sh`를 만듭니다(소문자와 kebab-case 사용).
2. 필수 함수 `tts_synthesize text out_path [voice]`를 구현합니다.
3. 선택 항목으로 `tts_check`(실행 전에 환경 확인)와 `tts_install_help`(실패했을 때 해결 방법 출력)를 구현할 수 있습니다.
4. `PRESENTATION_TTS=<name> npm run synthesize-audio`를 실행합니다.

---

## 세 함수의 계약

### `tts_synthesize <text> <out_path> [<voice>]` (필수)

텍스트 한 구간을 `<out_path>`에 mp3 또는 웹에서 재생할 수 있는 오디오 파일로 저장합니다.

| 인자 | 설명 |
|---|---|
| `$1` | 합성할 텍스트(이미 UTF-8 문자열이며 중국어·영어가 섞이거나 문장 부호가 포함될 수 있음) |
| `$2` | 대상 파일의 절대 경로(runner가 상위 디렉터리에 이미 `mkdir -p`를 실행함), 확장자는 `.mp3` |
| `$3` | 음성 ID(빈 문자열일 수 있으며 제공자가 기본 음성을 선택) |

성공하면 종료 코드 0을 반환하고 `$2`에 오디오를 씁니다. 실패하면 0이 아닌 종료 코드를 반환합니다(runner는 해당 구간을 FAILED로 표시하고 다음 구간으로 넘어가며 전체 합성을 중단하지 않음).

> 백엔드가 wav / ogg만 만들 수 있다면 함수 끝에서 직접 `ffmpeg`로 변환합니다.
> `ffmpeg -y -i tmp.wav -codec:a libmp3lame -qscale:a 2 "$out" >/dev/null 2>&1`

### `tts_check` (선택)

시작 시 runner가 한 번 호출합니다(각 구간마다 호출하지 않음). CLI 설치 여부, API 키 설정, 인증 상태를 확인합니다. 준비되지 않은 상태에서 0이 아닌 값을 반환하면 runner는 즉시 중단하고 `tts_install_help`를 출력합니다.

### `tts_install_help` (선택)

`tts_check`가 실패하면 runner가 호출합니다. 설치 방법 / 로그인 방법 / 키 발급 위치를 stderr에 출력합니다.

---

## 자주 쓰는 TTS 백엔드 코드 예시

아래는 기본 제공자가 아닙니다. 직접 `tts-providers/<name>.sh`를 만들 때 **복사해 사용할 수 있는** 코드 예시입니다. 복사 → `<name>.sh`로 저장 → 연결이 되는지 확인한 다음 `PRESENTATION_TTS=<name>`으로 사용합니다.

> 대부분의 클라우드 TTS는 API 키를 환경 변수로 받습니다(예: `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`). shell rc에 `export`를 넣거나 같은 디렉터리에 Git에서 제외된 `.env` 파일을 만들고 `set -a; source .env; set +a`를 실행합니다.

### OpenAI TTS

**기본 제공됩니다**. [`openai.sh`](./openai.sh)를 확인하세요.
이 파일은 HTTP 기반 제공자의 **공식 참고 구현**이기도 합니다. jq로 JSON payload를 만들고, curl에 `-fsS`를 지정해 제출하며, 선택적 base URL(Azure-OpenAI / 프록시 연결용), 선택적 model 환경 변수, 음성 설정이 비어 있을 때 기본값을 사용합니다. REST API 제공자를 새로 연결한다면 이 파일을 복사해 시작하는 것이 가장 빠릅니다.

활성화:

```bash
export OPENAI_API_KEY=sk-...
PRESENTATION_TTS=openai npm run synthesize-audio
# HD 모델 + 다른 음성 사용
OPENAI_TTS_MODEL=tts-1-hd npm run synthesize-audio -- --provider=openai --voice=nova
```

### ElevenLabs — `tts-providers/elevenlabs.sh`

```bash
# Docs:   https://elevenlabs.io/docs/api-reference/text-to-speech
# Env:    ELEVENLABS_API_KEY=...
# Voice:  pass voice ID; "Rachel" default is 21m00Tcm4TlvDq8ikWAM
# Model:  eleven_multilingual_v2 supports Chinese; eleven_turbo_v2_5 cheaper

tts_check() {
  command -v curl >/dev/null || { echo "✗ curl not found" >&2; return 1; }
  command -v jq   >/dev/null || { echo "✗ jq not found"   >&2; return 1; }
  [[ -n "${ELEVENLABS_API_KEY:-}" ]] || { echo "✗ ELEVENLABS_API_KEY not set" >&2; return 1; }
}

tts_install_help() {
  cat <<'EOF' >&2
Set your ElevenLabs key first:
  export ELEVENLABS_API_KEY=...       # get one at https://elevenlabs.io
EOF
}

tts_synthesize() {
  local text="$1" out="$2" voice="${3:-21m00Tcm4TlvDq8ikWAM}"
  local payload
  payload=$(jq -n --arg t "$text" \
    '{text:$t, model_id:"eleven_multilingual_v2"}')

  curl -fsS -o "$out" -X POST \
    "https://api.elevenlabs.io/v1/text-to-speech/$voice" \
    -H "xi-api-key: $ELEVENLABS_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$payload"
}
```

### edge-tts — `tts-providers/edge-tts.sh` (무료 / API 키 불필요)

```bash
# Docs:   https://github.com/rany2/edge-tts
# Install: pip install edge-tts
# Voices: edge-tts --list-voices
#   zh-CN-YunxiNeural     (男声)
#   zh-CN-XiaoxiaoNeural  (女声)
#   en-US-AriaNeural      (英文女声)
#   en-US-GuyNeural       (英文男声)

tts_check() {
  command -v edge-tts >/dev/null || { echo "✗ edge-tts not found" >&2; return 1; }
}

tts_install_help() {
  cat <<'EOF' >&2
Install edge-tts (free, uses Microsoft Edge's TTS backend, no API key):
  pip install edge-tts
List available voices:
  edge-tts --list-voices | less
EOF
}

tts_synthesize() {
  local text="$1" out="$2" voice="${3:-zh-CN-YunxiNeural}"
  edge-tts --text "$text" --voice "$voice" --write-media "$out" >/dev/null 2>&1
}
```

### macOS `say` — `tts-providers/say.sh` (오프라인 / 대체 수단)

```bash
# 시스템 기본 도구이며 의존성이 없습니다. CI에서 흐름을 점검하거나 오프라인 미리 보기에 적합합니다.
# 중국어 음성: Tingting / Sinji / Meijia (전체 목록은 `say -v ?`)
# 출력은 aiff입니다. mp3로 변환하려면 ffmpeg가 필요합니다(Auto 모드의 audio 태그는 기본적으로 mp3를 처리).

tts_check() {
  command -v say     >/dev/null || { echo "✗ 'say' not available (macOS only)" >&2; return 1; }
  command -v ffmpeg  >/dev/null || { echo "✗ ffmpeg not found (brew install ffmpeg)" >&2; return 1; }
}

tts_install_help() {
  cat <<'EOF' >&2
macOS-only provider. Needs ffmpeg for aiff→mp3:
  brew install ffmpeg
List voices:  say -v ?
EOF
}

tts_synthesize() {
  local text="$1" out="$2" voice="${3:-Tingting}"
  local tmp
  tmp=$(mktemp -t tts).aiff
  say -v "$voice" -o "$tmp" "$text" \
    && ffmpeg -y -i "$tmp" -codec:a libmp3lame -qscale:a 2 "$out" >/dev/null 2>&1
  local code=$?
  rm -f "$tmp"
  return $code
}
```

### Azure Speech — `tts-providers/azure.sh`

```bash
# Docs:    https://learn.microsoft.com/azure/ai-services/speech-service/rest-text-to-speech
# Env:     AZURE_SPEECH_KEY=...   AZURE_SPEECH_REGION=eastus
# SSML payload — Azure requires SSML, not plain JSON

tts_check() {
  command -v curl >/dev/null || { echo "✗ curl not found" >&2; return 1; }
  [[ -n "${AZURE_SPEECH_KEY:-}"    ]] || { echo "✗ AZURE_SPEECH_KEY not set"    >&2; return 1; }
  [[ -n "${AZURE_SPEECH_REGION:-}" ]] || { echo "✗ AZURE_SPEECH_REGION not set" >&2; return 1; }
}

tts_install_help() {
  cat <<'EOF' >&2
Set Azure Speech credentials:
  export AZURE_SPEECH_KEY=...
  export AZURE_SPEECH_REGION=eastus   # or your resource's region
EOF
}

tts_synthesize() {
  local text="$1" out="$2" voice="${3:-zh-CN-YunxiNeural}"
  local lang="${voice%%-*}-${voice#*-}"; lang="${lang%%-*}-${lang#*-}"  # "zh-CN"
  local ssml="<speak version='1.0' xml:lang='$lang'><voice xml:lang='$lang' name='$voice'>$(printf '%s' "$text" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')</voice></speak>"

  curl -fsS -o "$out" -X POST \
    "https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1" \
    -H "Ocp-Apim-Subscription-Key: $AZURE_SPEECH_KEY" \
    -H "Content-Type: application/ssml+xml" \
    -H "X-Microsoft-OutputFormat: audio-24khz-48kbitrate-mono-mp3" \
    -H "User-Agent: web-video-presentation" \
    --data-binary "$ssml"
}
```

### Google Cloud TTS — `tts-providers/gcloud.sh`

```bash
# Docs:   https://cloud.google.com/text-to-speech/docs/reference/rest
# Auth:   easiest is `gcloud auth application-default login`
#         (or set GOOGLE_APPLICATION_CREDENTIALS to a service-account json)
# Voices: zh-CN-Wavenet-A / zh-CN-Neural2-A / en-US-Neural2-J etc.

tts_check() {
  command -v curl   >/dev/null || { echo "✗ curl not found" >&2; return 1; }
  command -v jq     >/dev/null || { echo "✗ jq not found" >&2; return 1; }
  command -v base64 >/dev/null || { echo "✗ base64 not found" >&2; return 1; }
  command -v gcloud >/dev/null || { echo "✗ gcloud not found" >&2; return 1; }
  gcloud auth application-default print-access-token >/dev/null 2>&1 || {
    echo "✗ gcloud is not authenticated (run: gcloud auth application-default login)" >&2
    return 1
  }
}

tts_install_help() {
  cat <<'EOF' >&2
Install gcloud SDK and authenticate:
  https://cloud.google.com/sdk/docs/install
  gcloud auth application-default login
  gcloud services enable texttospeech.googleapis.com
EOF
}

tts_synthesize() {
  local text="$1" out="$2" voice="${3:-zh-CN-Wavenet-A}"
  local lang="${voice%-*}"; lang="${lang%-*}"  # "zh-CN"
  local token
  token=$(gcloud auth application-default print-access-token)

  local payload
  payload=$(jq -n --arg t "$text" --arg v "$voice" --arg l "$lang" \
    '{input:{text:$t}, voice:{languageCode:$l, name:$v}, audioConfig:{audioEncoding:"MP3"}}')

  curl -fsS -X POST https://texttospeech.googleapis.com/v1/text:synthesize \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    | jq -r '.audioContent' | base64 -d > "$out"
}
```

---

## 직접 제공자를 작성할 때 기억할 설계 원칙

1. **`set -e`와 함께 동작**: runner는 `set -euo pipefail`을 사용합니다. 함수에서 실패를 명확히 처리하거나 명령이 자연스럽게 0이 아닌 종료 코드로 끝나게 하세요. 오류를 무시하지 마세요.

2. **성공은 조용하게, 실패는 자세하게**: 성공할 때 stdout에는 아무것도 출력하지 않습니다(runner가 진행 표시를 담당). 실패할 때는 stderr에 원인을 자세히 표시합니다. CLI 도구의 stdout은 `/dev/null`로 보내고 stderr는 그대로 둡니다.

3. **mp3 출력**: 브라우저의 `<audio>` 태그는 mp3를 가장 안정적으로 재생합니다. 바로 mp3를 만들 수 있다면 그렇게 하고, 다른 형식만 지원하는 백엔드라면 함수 끝에서 ffmpeg를 사용합니다.

4. **음성 대체값**: `$3`은 빈 문자열일 수 있습니다. 합리적인 기본값(가장 자주 사용하는 중국어 / 영어 음성)을 정해 두고 음성이 전달되지 않았다는 이유로 오류를 내지 않습니다.

5. **병렬 실행 금지**: runner는 요청 한도에 걸리지 않도록 순차 실행합니다. 제공자 함수 안에서도 여러 프로세스나 스레드를 동시에 실행하지 마세요.

6. **전역 상태를 바꾸지 않기**: 제공자 파일은 runner의 shell에 `source`됩니다. `cd`를 실행하거나 `IFS`를 바꾸거나 `set -e/+e`를 전환하지 마세요. runner에 영향이 갈 수 있습니다. 지역 변수에는 `local`을 사용합니다.

   ⚠️ 주의할 함정: runner는 `set -u`를 사용합니다. **macOS 기본 bash 3.2에서는 빈 배열을 `"${arr[@]}"`로 펼치면 `unbound variable` 오류가 납니다.** 제공자에서 선택적 `--voice` 인자가 필요하다면 `local args=(); [[ -n $voice ]] && args=(--voice $v); cmd "${args[@]}"` 형태를 쓰지 마세요. `minimax.sh`처럼 명령 실행을 두 개의 if 분기로 나누세요.

7. **API 입력 길이 제한**: 대부분의 API는 한 구간의 길이를 제한합니다(OpenAI 약 4096자 / MiniMax 약 5000자 / ElevenLabs 약 5000자). Skill의 `narrations` 한 구간은 보통 200자 미만이어서 문제가 생기지 않습니다. 내레이션이 한도를 넘으면 **먼저 step을 나누세요**. 하나의 step에 내레이션이 이렇게 길어서는 안 됩니다.

---

## 디버깅

```bash
# runner가 제공자를 어떻게 호출하는지 확인
bash -x scripts/synthesize-audio.sh

# audio-segments.json을 건드리지 않고 한 구간만 실행
source scripts/tts-providers/<name>.sh
tts_check && tts_synthesize "测试一下" /tmp/test.mp3 ""
afplay /tmp/test.mp3   # macOS에서 재생해 들어 보기
```

문제가 없으면 `npm run synthesize-audio`를 실행합니다.
