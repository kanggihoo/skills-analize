# 내레이션: 사용자 원고, 실제 타임라인, 믹싱

내레이션이 있으면 먼저 내레이션 오디오와 문장·구간 타임라인을 준비하고, 다음으로 화면을 제작한 뒤 마지막에 BGM과 효과음을 추가합니다. 화면은 실제 내레이션의 리듬에 맞춰 전개하고, 음악의 박자는 알맞은 쉼과 전환에만 사용합니다.

내레이션은 세 가지 방식 중에서 선택합니다: 내레이션 없음, 사용자가 제공한 원고의 TTS 낭독, 사용자가 제공한 녹음. **TTS 원고는 반드시 사용자가 제공해야 합니다. Agent가 대신 쓰거나 고쳐 쓰지 않으며, 직접 생성한 문장을 사용자 원고라고 표시해서도 안 됩니다.** `--source user`는 실행자가 출처를 선언하는 옵션입니다. 도구는 파일과 해시를 기록하지만 출처 확인을 대신하지는 않습니다. 일반적인 화면 문구와 내레이션 원고를 구분해야 합니다.

도구에는 Node 18+, ffmpeg, ffprobe가 필요합니다. 다른 Skill에 의존하지 않으며 npm 패키지를 추가하지 않아도 됩니다. 인증 정보는 환경 변수에서만 읽고 brief, 타임라인, 로그, 납품용 소스에 기록하지 않습니다. 모델과 음성은 사용자가 설정하며 `--model` / `--voice` 또는 해당 환경 변수를 통해 전달합니다.

## 1. TTS는 사용자 원고만 낭독

```sh
node <skill>/scripts/narration.mjs tts <project> \
  --script <user-script.txt> --source user \
  --provider gemini --model <available-tts-model> --voice <voice>
```

TXT는 문장 끝 구두점, 줄바꿈, 길이를 기준으로 구간을 나누며 단어나 문장을 더하거나 빼지 않습니다. 사용자가 구간을 직접 지정해야 할 때는 JSON을 사용합니다.

```json
{
  "source": "user",
  "segments": [
    {"id": "intro", "text": "사용자가 제공한 첫 번째 원문 구간."},
    {"id": "detail", "text": "사용자가 제공한 두 번째 원문 구간."}
  ]
}
```

기본적으로 구간당 최대 500자이며 `--max-chars 20..3000`으로 조정할 수 있습니다. JSON의 긴 구간은 먼저 나누되 원문을 유지합니다. 짧게 나누면 복구와 수정이 쉽고 안정적인 구간 경계를 얻는 데도 도움이 됩니다. 지나치게 잘게 나누면 낭독이 부자연스러워질 수 있으므로 실제로 들어봐야 합니다.

합성에 성공하면 다음을 생성합니다.

- `audio/narration.wav`: 48 kHz, 스테레오 PCM으로 통일한 파일.
- `audio/narration.json`: 원고 출처, 실제 오디오 길이, 문장·구간 타임라인.
- `audio/narration-cache/`: 구간별 오디오와 검증 해시. 캐시는 원문, adapter, model, voice, 음성에 영향을 주는 설정을 기준으로 합니다. 한 구간을 수정하면 그 구간만 다시 만들고, 음성을 바꾸면 관련 구간을 다시 생성합니다. 손상된 캐시는 재생성합니다.

요청은 순차 실행합니다. 일시적인 네트워크 오류, 429, 서버 오류는 최대 두 번 재시도하며 `--retries 0..5`로 설정할 수 있습니다. 실패해도 완료된 구간은 보존합니다. 설정을 고친 뒤 원래 명령을 다시 실행하면 이어서 진행합니다. 공개 전에 각 구간의 실제 길이와 이어 붙인 전체 길이를 확인하며 글자 수로 시간을 추정하지 않습니다. 확인된 영상 길이를 `--duration <초>`로 함께 지정하는 것을 권장합니다. 구간이 완성될 때마다 누적 길이를 확인하고 목표 또는 1200초 상한을 넘으면 이후 요청을 중단하고 캐시를 보존한 뒤 충돌 해결을 요청합니다. 이미 전송된 구간의 과금은 취소할 수 없습니다. 실제 내레이션이 목표보다 짧으면 빈 부분을 자동으로 채우지 말고 인트로, 아웃트로, 쉼을 유지할지 먼저 확인한 다음 화면을 제작합니다.

```json
{
  "source": {"type": "user-script", "provenance": "user-provided", "file": "user-script.txt", "sha256": "…"},
  "alignment": "tts-segments",
  "duration": 8.126,
  "file": "audio/narration.wav",
  "segments": [
    {"id": "intro", "text": "사용자가 작성한 원문.", "start": 0, "end": 3.418, "file": "audio/narration-cache/….wav"},
    {"id": "detail", "text": "사용자가 작성한 다음 구간.", "start": 3.418, "end": 8.126, "file": "audio/narration-cache/….wav"}
  ],
  "missing": []
}
```

타임스탬프 단위는 초이며, 각 구간의 호흡과 쉼을 포함한 실제 합성 오디오를 누적해 계산합니다. `tts-segments`는 구간별 합성 경계를 뜻하며 단어 단위 정렬을 의미하지 않습니다. 구간은 동기화를 위한 기준점이지 한 구간마다 장면 하나를 만들라는 뜻은 아닙니다. 동작과 카메라는 여러 문장에 걸쳐 이어질 수 있습니다. 실제 이벤트를 `timeline.js`에 기록하고 화면과 효과음이 함께 참조하도록 합니다. 정식 `render(t)`는 전달된 시간만 읽습니다. 오디오 미리보기에서는 오디오 재생 시간이 렌더링을 움직일 수 있지만, 오프라인 렌더링에는 실시간 오디오 상태를 반영하지 않습니다.

### 키워드 이벤트: 근거 있는 시간만 사용

`scaffold.sh`는 순수 모듈인 `narration.js`를 복사합니다. 단어 단위 시간 정보가 없어도 기존 문장·구간 방식은 그대로 쓸 수 있습니다. 키워드를 동기화하려면 해당 segment에 전사 도구가 제공한 단어 경계를 유지하거나, 직접 듣고 `anchors`를 기록합니다.

```json
{
  "id": "s1", "text": "가까워지고, 이어집니다.", "start": 0, "end": 4,
  "anchors": [{ "text": "이어집니다", "start": 2.2, "end": 2.7 }]
}
```

위의 초 단위 값은 구조를 보여주는 예시일 뿐입니다. 실제 값은 해당 오디오를 직접 들으며 표시해야 합니다. ASR 단어 시간은 `wordTimingSource: "asr"`와 `words: [{"text":"…","start":0.2,"end":0.8}]`를 사용합니다. 단어 목록은 해당 문장 전체를 포함해야 하며 도구가 단어를 보충하거나 시간을 균등 분배하지 않습니다.

```js
import { narrationClock } from './narration.js';
const N = narrationClock(narrationData);
export const MERGE = N.at('s1', '이어집니다');
// 화면의 주요 동작과 score의 효과음 모두 MERGE를 참조하고 시간을 따로 입력하지 않습니다.
// N.end(id, keyword) / N.range(id, keyword)로 끝 시점이나 구간을 조회합니다.
// 같은 segment에서 키워드가 반복되면 { occurrence: 2 }처럼 명시적으로 선택합니다. 번호는 1부터 시작합니다.
// 영상 전체에서 몇 번째인지 표시하려면 먼저 해당 segment를 찾아야 합니다. 영상 전체 순번을 segment 내 occurrence로 쓰면 안 됩니다.
```

`N.segment(id)`는 항상 유효한 문장·구간 경계를 반환합니다. 단어 시간 정보가 없거나 모호하거나, 실제 경계가 없는 단어 중간을 키워드로 지정하면 `at/end/range`가 오류를 반환합니다. 이 경우 임의로 글자 단위 동기화를 만들지 말고 직접 anchor를 추가하거나 문장 단위 동작을 사용합니다. 키워드 이벤트는 시간 데이터이지 해당 단어에서 반드시 화면을 전환하라는 뜻이 아닙니다. 카메라가 먼저 맥락을 만들고 이벤트 시점에 주체를 바꿀 수 있습니다.

### Gemini

필수 환경 변수는 `GEMINI_API_KEY`입니다. 선택 설정은 `GEMINI_TTS_MODEL`, `GEMINI_TTS_VOICE`, `GEMINI_TTS_BASE_URL`입니다. REST `models/<model>:generateContent`를 사용합니다. 현재 voice schema와 이전 모델의 `prebuiltVoiceConfig`를 모두 지원합니다. 2.5 / 3.1은 자동으로 이전 형식을 사용하고, 나머지 모델은 `voiceConfig.voice`를 사용합니다. `GEMINI_TTS_SCHEMA=legacy|voice`로 직접 선택할 수 있습니다. WAV 컨테이너와 이전 모델에서 반환하는 24 kHz, 16비트 모노 PCM을 처리할 수 있습니다. PCM은 ffmpeg에 전달하기 전에 WAV로 감쌉니다. [Gemini 공식 인터페이스](https://ai.google.dev/gemini-api/docs/generate-content/speech-generation)

모델 지원 여부는 계정과 서비스에 따라 바뀔 수 있으므로 사용 가능한 모델과 음성을 전달하고 짧은 구간으로 연결 상태와 음성을 먼저 확인합니다. 도구는 전달된 텍스트만 TTS로 보내며 언어 모델을 호출해 원고를 생성하거나 다듬지 않습니다. 클라우드 합성에서 단어가 누락·반복되거나 잘못 읽히지 않았는지는 여전히 직접 들어 확인해야 합니다.

### MiniMax

필수 환경 변수는 `MINIMAX_API_KEY`이며 `MINIMAX_TTS_MODEL`, `MINIMAX_TTS_VOICE`, `MINIMAX_TTS_SPEED`는 선택 사항입니다. 기본 endpoint는 `https://api.minimax.io/v1/t2a_v2`입니다. 중국 지역 또는 호환 게이트웨이를 사용할 때는 `MINIMAX_TTS_URL`에 `https://api.minimaxi.com/v1/t2a_v2` 같은 전체 URL을 지정합니다. 스트리밍 없이 hex 형식 오디오를 사용하며 mmx CLI에는 의존하지 않습니다. 디코딩 전에 서비스 상태를 확인합니다. [MiniMax 공식 인터페이스](https://platform.minimax.io/docs/api-reference/speech-t2a-http)

두 기본 adapter 모두 `SHOWREEL_TTS_TIMEOUT_MS`로 요청별 제한 시간을 설정할 수 있으며 기본값은 90000ms입니다. 원격 endpoint에는 HTTPS가 필요합니다. 로컬 HTTP는 localhost 테스트에만 사용할 수 있습니다.

### 사용자 지정 provider

`--provider`를 신뢰할 수 있는 로컬 `.mjs` 파일로 지정하고, 파일은 다음을 export해야 합니다.

```js
export async function synthesize({ text, outFile, model, voice }) {
  // 자체 환경 인증 정보를 읽고 디코딩 가능한 오디오를 outFile에 기록합니다.
  // outFile은 임시 .bin 경로입니다. WAV/MP3를 출력할 때는 형식을 명시해야 합니다.
  // 실패하면 오류를 던집니다. 재시도할 수 없음이 확실하면 error.retryable = false로 설정합니다.
}
```

adapter 안에서 key, Authorization, 전체 요청을 출력하지 않습니다. 도구는 adapter가 던진 원래 오류 내용을 출력하지 않습니다. adapter 코드, model, voice 모두 캐시 식별에 사용합니다. 음성에 영향을 주는 다른 설정을 바꾸면 `SHOWREEL_TTS_CACHE_VERSION`을 변경해 캐시를 무효화합니다.

## 2. 사용자 녹음 가져오기

이미 문장별 자막이나 전사 타임스탬프가 있는 경우:

```sh
node <skill>/scripts/narration.mjs import <project> \
  --audio <user-voice.wav> --timestamps <voice.srt>
```

SRT 또는 `[ {"id":"a","text":"실제 녹음의 한 문장","start":0.3,"end":2.8} ]` 형식의 JSON을 지원하며 `{ "segments": [...] }` 형식도 허용합니다. 타임스탬프는 오름차순이어야 하고 겹치지 않아야 하며 오디오 길이 안에 있어야 합니다. JSON 숫자 단위는 초입니다. `voice.wav` 옆에 `voice.srt` 또는 `voice.segments.json`이 있으면 자동으로 찾습니다.

사용 가능한 ASR이 있다면 신뢰할 수 있는 로컬 adapter를 전달할 수 있습니다.

```sh
node <skill>/scripts/narration.mjs import <project> \
  --audio <user-voice.wav> --transcriber </absolute/asr-adapter.mjs>
```

adapter 계약:

```js
export async function transcribe({ file }) {
  // file은 표준화된 실제 녹음입니다. 승인된 ASR 또는 로컬 전사 도구를 호출합니다.
  return { segments: [{ id: 'a', text: '실제 전사 결과', start: 0.3, end: 2.8 }] };
}
```

ASR은 실제 텍스트와 타임스탬프를 반환해야 합니다. 도구는 범위를 검증하고 `asr-timestamps`로 표시합니다. 전사의 정확성은 별도로 확인해야 합니다. **이 Skill에는 ASR 모델이나 계정이 포함되어 있지 않으며 전사를 실행했다고 거짓으로 표시하지 않습니다.** 로컬 Whisper를 이미 사용할 수 있다면 `whisper <user-voice.wav> --output_format json --output_dir <project>/audio/transcription`을 실행한 뒤 생성된 JSON을 `--timestamps`로 가져올 수 있습니다. Whisper가 설치되어 있고 모델을 사용할 수 있는지 확인해야 합니다.

타임스탬프나 사용 가능한 ASR이 없어도 오디오 자체는 가져올 수 있습니다.

```sh
node <skill>/scripts/narration.mjs import <project> --audio <user-voice.wav>
```

결과에는 `alignment: "unresolved"`, `missing: ["sentence-timestamps"]`가 명시되고 전체 녹음 범위만 보존되며 `text`는 비어 있습니다. 이 상태에서는 **문장에 맞춰 정렬된 화면을 제작한다고 말할 수 없습니다.** 다음 단계는 SRT/JSON을 추가하거나 실제 사용할 수 있는 ASR을 설정하거나 사용자가 문장 구간의 시작점을 직접 표시하는 것입니다. 글자 수로 시간을 추정해 실제 측정값인 것처럼 표시해서는 안 됩니다. 오디오를 가져온 상태와 의미 단위의 타임라인이 준비된 상태는 서로 다릅니다.

녹음 길이와 사용자가 요청한 길이가 맞지 않으면 어느 쪽을 변경할지 물어봅니다. 목소리를 자동으로 자르거나 빠르게 재생하지 않습니다.

## 3. BGM, 효과음, 음성을 각각 믹싱

BGM과 효과음은 각각 `ai`, `user`, `none`을 선택할 수 있으며 서로 다른 선택을 함께 쓸 수 있습니다. 코드로 합성한 음악·효과음은 `ai`, 사용자가 전달한 파일은 `user`로 표시합니다. 각 트랙의 파일을 따로 제공해야 합니다. 분리되지 않은 믹스를 음악과 효과음을 개별 제어할 수 있는 것처럼 표시하면 안 됩니다.

```sh
node <skill>/scripts/narration.mjs mix <project> \
  --bgm <project>/audio/music.wav --bgm-source ai \
  --sfx <project>/audio/sfx.wav --sfx-source user \
  --duration <timeline-DUR-seconds>
```

음성 트랙은 기본적으로 `audio/narration.json`에서 지정한 파일을 사용합니다. 다른 녹음은 `--narration <file>`로 선택합니다. 어떤 트랙이든 끌 수 있습니다.

```sh
node <skill>/scripts/narration.mjs mix <project> \
  --bgm <project>/audio/music.wav --bgm-source user \
  --sfx none --sfx-source none --narration none --duration 30
```

완전히 무음으로 만들려면 세 트랙 모두 `none`을 선택하고 길이를 전달합니다. 효과음만 사용하거나 내레이션만 사용하는 것도 가능합니다.

도구는 `audio/final.wav`와 `audio/mix.json`을 생성합니다. 기본 gain은 음악 0.35, 효과음 0.5이며 `--bgm-gain` / `--sfx-gain`으로 조정할 수 있습니다. 내레이션 구간에서는 BGM과 효과음을 추가로 16 dB 낮춥니다 (`--duck-db -16`으로 조정 가능). 장면 경계 근처에는 앞뒤 여유 구간을 조금 남기고 인접 구간을 합쳐 잦은 음량 변화가 생기지 않도록 합니다. 타임스탬프가 준비되지 않았다면 전체 녹음 동안 다른 두 트랙을 보수적으로 낮추며, 문장마다 피했다고 표시하지 않습니다.

음량 조정뿐 아니라 **사운드 구성 자체도 절제해야 합니다.** 내레이션이 있을 때 연속 효과음, 촘촘한 드럼, 목소리를 가리는 멜로디를 줄이고 강한 효과음은 쉼이나 문단 경계에 둡니다. 도구의 음량 회피 기능이 이 작업을 대신해 주지는 않습니다.

ffmpeg 스트리밍 처리로 샘플링률을 통일하고 피크를 제한하며 전체 음량을 조정하고 길이를 검증합니다. 음악이나 효과음 입력이 짧으면 무음으로 채우며 임의로 반복 재생하지 않습니다. 영상 길이 한도는 1200초입니다. 내레이션이 목표 영상 길이보다 길면 오류를 내고 먼저 길이 충돌을 해결하도록 요구합니다. 최종 음량, 트루 피크, 목소리의 명료도는 여전히 오디오를 확인하고 들어봐야 합니다.

렌더링 도구의 `--audio` 또는 새 build 설정에 `audio/final.wav`를 지정합니다. 내레이션과 개별 믹싱을 사용하지 않는 경우 기존 `audio.mjs` / score 작업 방식은 바뀌지 않습니다.

## 4. 검증

내레이션이 있으면 화면을 제작하기 전에 타임라인을 확인하고, 믹싱 후 최종 오디오를 넣어 다시 확인합니다.

```sh
node <skill>/scripts/narration.mjs check <project> --duration <timeline-DUR-seconds>
node <skill>/scripts/narration.mjs check <project> --duration <timeline-DUR-seconds> --audio <project>/audio/final.wav
```

결과는 `audio/narration-qa.json`에 기록합니다. 실제 텍스트 타임스탬프가 없거나, 오디오가 교체되었거나, 내레이션이 목표 길이 때문에 잘렸거나, 최종 믹스 길이가 맞지 않으면 실패 종료 코드를 반환합니다. 믹스 기록에는 모든 입력과 최종 출력의 SHA-256이 포함됩니다. 경로와 길이가 같더라도 내레이션을 교체했다면 다시 믹싱해야 하며 이전 영상의 오디오 트랙으로 검수를 통과할 수 없습니다. 문장 사이의 실제 쉼은 유지해도 되며 모든 초에 텍스트가 있을 필요는 없습니다. 발음 오류, 전사 정확성, 음성 품질은 사람이 검수해야 합니다.

```sh
node --test <skill>/scripts/test/narration.test.mjs
```

이 테스트는 mock provider / ASR과 실제 ffmpeg를 사용합니다. 출처 제한, Gemini PCM/WAV, MiniMax hex, 재시도, 캐시 무효화, 녹음 가져오기, 타임스탬프 검증, 트랙별 음소거, 내레이션 구간의 실제 감쇠를 검사하며 유료 API를 호출하지 않습니다. 실제 계정의 연결, 사용 가능한 모델과 음성은 사용자가 제공한 API 설정으로 별도 검증해야 합니다. mock 테스트를 실제 서비스 검증이라고 부르면 안 됩니다.
