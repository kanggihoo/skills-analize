> AI 번역본. 원본: upgrade-info-misc.md. 분석 근거는 원본이다.

# info, upgrade, compositions, timeline, docs, benchmark, telemetry, 에셋 전처리

주요 개발 루프에 들어가지 않는 명령을 모아 둔 참고 자료다.

## info

```bash
npx hyperframes info                   # 프로젝트 메타데이터
npx hyperframes info ./my-video        # 특정 프로젝트
npx hyperframes info --json
```

**프로젝트** 메타데이터를 출력한다. 이름, 해상도, 길이, 타입별 요소 수, 트랙 수, 전체 프로젝트 크기다. 프로젝트 단위이며 환경 정보는 아니다. 환경 상태는 `doctor`를 쓴다.

## upgrade

```bash
npx hyperframes upgrade                # 확인 후 대화형 프롬프트
npx hyperframes upgrade --check        # 확인 후 종료, 프롬프트 없음(에이전트에 적합)
npx hyperframes upgrade --check --json # 기계가 읽을 수 있는 출력: current / latest / updateAvailable
npx hyperframes upgrade --yes          # 프롬프트 없이 업그레이드 명령만 출력
```

설치된 CLI 버전을 npm 최신 버전과 비교한다.

`--project [dir]`은 전역 설치 대신 **프로젝트의** 고정된 스크립트를 올린다. `<dir>/package.json`(기본값은 현재 디렉터리)에 있는 모든 `npx …hyperframes@<version>…`을 npm 최신 버전으로 다시 쓴다. 항상 버전을 고정하지 않은 형태로 실행하라(`npx hyperframes@latest upgrade --project`). 그렇지 않으면 오래된 CLI로 만든 프로젝트가 계속 고정된다. `--project . --check`는 파일을 쓰지 않고 차이만 보고한다. `--json`을 붙이면 `{ changed, from, to, path }`를 출력한다. `--project` 뒤에 다른 플래그가 오면 디렉터리를 명시하라. 구버전에서는 `--project`가 다음 플래그를 디렉터리 값으로 가져가기 때문이다.

## timeline

```bash
npx hyperframes timeline [project-dir]          # 트랙과 클립을 막대가 있는 표로 출력
npx hyperframes timeline [project-dir] --json
```

`index.html`과 `data-composition-src` 파일을 하나씩 열지 말고 `timeline`을 써라. 타임라인에 무엇이 있는지 알아야 할 때 쓴다. 어떤 클립이 있는지, 언제 시작하고 끝나는지, 무엇을 재생하는지, 소리가 얼마나 큰지 알 수 있다. 브라우저 없이 프로젝트 파일을 정적으로 읽는다.

텍스트 출력은 `timeline <N>s`로 시작하고, 트랙 종류(`video`, `graphics`, `captions`, `audio`)마다 한 블록씩 이어진다. 블록 안에는 그 종류의 클립마다 한 행씩 있으며 절대 시작 시간 순이다:

```
graphics (2: 1 top-level, 1 nested)
  |██████                                  | sec-connector 0-6.7s src=compositions/connector-morph.html
  |██████████████                          | box 15.67-17.99s (local 0-2.32s) nested in sec-connector compositions/connector-morph.html
audio (1)
  | █                                      | vo 1.6-3.6s src=vo.mp3 vol=0.5 group=vo volume[0:0.2 2:1]
```

- 막대는 전체 타임라인에 걸친 40열이다. 시간 단위는 초다.
- `src=`, `vol=`, `rate=`(재생 속도, 1이 아닐 때만), `group=`(오디오 그룹), `<target>[t:v ...]`(자동화 레인 지점, `t`는 클립 시작부터의 초)는 클립에 해당 값이 있을 때만 나타난다.
- 헤더는 중첩된 클립까지 포함해 그 종류의 클립 수를 센다. 예: `video (6: 2 top-level, 4 nested)`. 목록은 절대 시간 순이므로, N번째 행은 메인 타임라인에서 그 종류의 N번째 클립이다. 서브 컴포지션 안의 클립은 절대 시작-끝 시간을 먼저 출력하고, 그다음 `(local <start>-<end>s)`(서브 컴포지션 내부 시간), 그다음 `nested in <host row id> <file that declares it>`를 출력한다. 중첩은 한 단계만 읽는다. 서브 컴포지션 안의 서브 컴포지션은 `children=unread`라고 적힌 행으로 나열되며, 그 안의 클립은 세지 않는다.
- `data-duration`/`data-end`가 없어도 미디어 행은 확정된 길이를 받고 그 출처를 밝힌다. `duration=media`는 ffprobe가 소스를 측정했다는 뜻이다(재생 시작과 속도를 적용한 값). `duration=default`는 `img`가 기본값 3초를 받았다는 뜻이다. `duration=inferred`는 컴포지션 호스트가 자식들의 길이를 합산했다는 뜻이다. `pending: <reason>`(점선 막대, `duration` 0)은 소스를 조사할 수 없었다는 뜻이다(파일 없음, 원격 `src`, ffprobe 오류). 확정할 것이 없는 미디어가 아닌 리프는 소스를 출력하지 않는다.
- `lanes unreadable: ...`은 클립의 `data-automation` 또는 `data-fx-chain`을 파싱하지 못했다는 뜻이다. 해당 속성을 고쳐라.

`--json`은 `{ timeline: { duration, tracks: [{ kind, rows: [...] }] } }`를 출력한다. 트랙의 `rows`에는 중첩된 클립을 포함해 그 종류의 모든 클립이 `absStart` 순으로 들어 있다. 최상위만 읽지 말고 전부 읽어라. 각 행에는 다음이 있다: `id`, `kind`(태그), `trackKind`, `start`, `duration`, `end`(행이 속한 파일 기준 로컬 값), **`absStart`, `absEnd`, `file`**(메인 타임라인 시간과 클립을 선언한 프로젝트 상대 파일 경로. 중첩된 클립끼리 비교할 때는 `start`/`end`가 아니라 이 값을 써라), `trackIndex`, `src`, `sourceFile`, `volume`, `lanes`, `playbackRate`, `audioGroup`, `durationAuthored`, **`durationSource`**(`"authored" | "media" | "default" | "inner" | "pending"`. 확정할 것이 없는 미디어가 아닌 리프는 `null`), **`pendingReason`**(길이가 확정되지 않은 이유. `durationSource`가 `"pending"`일 때만 값이 있고 나머지는 `null`), `laneError`, **`index`**(그 종류의 `rows` 안에서 행의 위치. id가 아니라 위치다), **`nested`**(서브 컴포지션 안에서 선언되었는지), **`host`**(중첩된 클립을 가진 호스트 행의 순수 id. 없으면 `null`), **`hostRow`**(그 호스트 행의 `{kind, index}`), `children`(서브 컴포지션 클립을 가리키는 `{kind, index}` 포인터, 한 단계까지. 모든 클립은 이미 자기 종류의 `rows`에 완전한 행으로 들어 있으므로 따라갈 필요가 없다).

### 쿼리 한 줄 명령(jq, jq가 없으면 node 대체)

```bash
TL=$(npx hyperframes timeline --json)
# 1. 절대 시간 T=12.5에 재생 중인 것
jq --argjson t 12.5 '[.timeline.tracks[].rows[] | select(.absStart<=$t and .absEnd>$t)]' <<<"$TL"
node -e 'const t=12.5,j=JSON.parse(require("fs").readFileSync(0,"utf8"));j.timeline.tracks.forEach(tr=>tr.rows.forEach(x=>{if(x.absStart<=t&&x.absEnd>t)console.log(x.id,x.file)}))' <<<"$TL"
# 2. id 또는 src로 클립 찾기 -> 파일, 트랙, absStart, absEnd
jq --arg q tsfx-pet2 '[.timeline.tracks[].rows[] | select(.id==$q or .src==$q)] | .[] | {file,trackKind,absStart,absEnd}' <<<"$TL"
node -e 'const q="tsfx-pet2",j=JSON.parse(require("fs").readFileSync(0,"utf8"));j.timeline.tracks.forEach(tr=>tr.rows.forEach(x=>{if(x.id===q||x.src===q)console.log(x.file,x.trackKind,x.absStart,x.absEnd)}))' <<<"$TL"
# 3. 한 종류의 모든 클립, 중첩 포함, 절대 시간 순
jq --arg k video '.timeline.tracks[] | select(.kind==$k).rows[] | {id,absStart,absEnd}' <<<"$TL"
node -e 'const k="video",j=JSON.parse(require("fs").readFileSync(0,"utf8"));j.timeline.tracks.find(t=>t.kind===k).rows.forEach(r=>console.log(r.id,r.absStart,r.absEnd))' <<<"$TL"
# 4. 한 종류 안의 빈틈과 겹침(양수 = 빈틈, 음수 = 겹침)
jq --arg k video '(.timeline.tracks[] | select(.kind==$k).rows) as $r|[range(0;($r|length)-1)|{a:$r[.].id,b:$r[.+1].id,delta:($r[.+1].absStart-$r[.].absEnd)}]' <<<"$TL"
node -e 'const k="video",j=JSON.parse(require("fs").readFileSync(0,"utf8"));const r=j.timeline.tracks.find(t=>t.kind===k).rows;for(let i=0;i<r.length-1;i++)console.log(r[i].id,r[i+1].id,r[i+1].absStart-r[i].absEnd)' <<<"$TL"
# 5. 절대 시작 시간 기준 N번째 클립(N=2)
jq --arg k video --argjson n 2 '.timeline.tracks[] | select(.kind==$k).rows[$n-1] | {index,id,absStart,file,nested}' <<<"$TL"
node -e 'const k="video",n=2,j=JSON.parse(require("fs").readFileSync(0,"utf8"));const r=j.timeline.tracks.find(t=>t.kind===k).rows[n-1];console.log(r.index,r.id,r.absStart,r.file)' <<<"$TL"
```

## compositions, docs

```bash
npx hyperframes compositions           # 프로젝트의 컴포지션 목록
npx hyperframes compositions --json
npx hyperframes docs                   # 사용 가능한 주제 목록
npx hyperframes docs rendering         # 주제 하나를 터미널에 인라인으로 출력
```

`compositions`는 프로젝트의 모든 `data-composition-id`(서브 컴포지션 포함)를 길이, 해상도, 요소 수와 함께 나열한다.

`docs`는 **터미널 안에** 인라인 문서를 출력한다. 브라우저를 열지 않는다. 주제: `data-attributes`, `examples`, `rendering`, `gsap`, `troubleshooting`, `compositions`. 주제 없이 실행하면 목록을 볼 수 있다.

## benchmark

```bash
npx hyperframes benchmark              # 현재 프로젝트에서 프리셋 매트릭스 실행
npx hyperframes benchmark ./my-video   # 특정 프로젝트
npx hyperframes benchmark --runs 5     # 설정마다 N번 반복(기본값 3)
npx hyperframes benchmark --json
```

프로젝트를 프리셋 설정 5개(`30fps draft 2w`, `30fps standard 2w`, `30fps high 2w`, `30fps standard 4w`, `60fps standard 4w`)로 렌더링하고, 렌더링 속도와 출력 파일 크기를 비교해 출력한다. 내 기기에서 허용 가능한 가장 빠른 프리셋을 찾을 때 쓴다. 단계별 분석이 있는 단일 렌더링 도구는 아니다.

## telemetry

```bash
npx hyperframes telemetry status      # 텔레메트리 상태 표시
npx hyperframes telemetry disable     # 사용량 텔레메트리 끄기
npx hyperframes telemetry enable      # 사용량 텔레메트리 다시 켜기
```

텔레메트리는 사용량 카운터뿐이다. 사용자가 HeyGen에 로그인하기 전까지는 익명이다. `auth login` 후에는 HeyGen 계정(이메일과 사용자 이름)과 연결되므로, 로그인한 사용자에게 익명이라고 말하지 마라. 서브 명령 대신 환경 변수로 제어하고 싶다면 `HYPERFRAMES_NO_TELEMETRY=1`로 전역 비활성화할 수 있다.

이벤트에는 관리형 샌드박스 실행과 실제 노트북을 구분하는 지문 속성 두 개가 들어간다. 개인 정보는 없고, 환경 변수 **값**은 읽지 않으며 존재 여부만 확인한다:

- **`sandbox_runtime`**: `gvisor` / `firecracker` / `docker` / `kvm` / `wsl` / `null`. gVisor는 커널 문자열과 `/proc/version`으로 판단한다. Firecracker는 `/dev/vsock`과 DMI sys_vendor로 판단한다. Docker는 `/.dockerenv`와 cgroup으로 판단한다.
- **`agent_runtime`**: `claude_code` / `codex` / `cursor` / `copilot_agent` / `jules` / `replit` / `devin` / `aider` / `gemini_cli` / `hermes` / `openclaw` / `null`. 잘 알려진 벤더 환경 변수가 있는지로 감지한다. 값 자체는 읽지 않는다.
- **`client`**: 앱이 `HYPERFRAMES_CLIENT` 태그(`<app>/<version>/<channel>`)를 붙여 CLI를 실행했을 때만 설정된다. 짧은 slug이면 그대로 보낸다.

## 에셋 전처리

```bash
npx hyperframes tts
npx hyperframes transcribe
npx hyperframes remove-background
```

이 명령들은 컴포지션에 넣을 에셋(내레이션 오디오, 단어 단위 전사, 투명 배경 영상)을 만든다. 각 명령은 처음 실행할 때 자체 모델을 내려받을 수 있다.

음성 선택, Whisper 모델 규칙, 출력 형식 선택, TTS → 전사 → 캡션 흐름은 `media-use` 스킬을 호출해 확인한다. 이 스킬은 개발 루프에 집중한다.

## 남은 하네스 사용량

영상 작업을 시작할 때 `npx hyperframes usage --json`을 실행하고, 초안 작성 후나 렌더링 전 같은 마일스톤에서 다시 실행한다. 인수인계 시점의 새로운 조회 결과가 시작 시점 조회를 대신할 수 있다. 명시적으로 고르려면 `--harness claude-code`, `--harness codex`, `--harness grok`을 쓴다.

정상 결과에는 `status: "known"`, `harness`, `planTier`, `session`, `weekly`, `spend`가 들어 있다. 사용 가능한 각 구간에는 `usedPercent`, `remainingPercent`, `resetsAt`이 있고, 사용할 수 없는 구간은 `null`이다. `planTier`는 읽을 수 있을 때 구독 등급 이름이고, 그렇지 않으면 `null`이다. Claude Code는 공유되는 5시간 구간과 주간 구간을 보고한다. 지출 기준 요금제(예: Enterprise)는 두 구간이 없고, 청구 기간 지출 한도 중 이미 쓴 비율인 `spend`를 보고하며 `resetsAt`은 `null`이다. Codex는 가능할 때 공유되는 세션 구간과 주간 구간을 보고한다. Grok은 포함된 주간 허용량을 보고하며 `session`은 `null`이다. `spend`는 Claude Code만 보고하고, 다른 곳에서는 `null`이다. 사용 가능한 구간이 하나도 없으면 `status: "unknown"`과 `reason: "no_usage_windows"`가 나온다.

알 수 없음 결과에는 `status: "unknown"`과 토큰이 없는 `reason`이 들어 있다. 로그인 정보가 없거나, 만료되었거나, 지원되지 않거나, 모호하거나, 읽을 수 없거나, 제공자 응답을 받을 수 없으면 unknown이 반환된다. 알 수 없음 상태는 그대로 보고하고, 허용량을 짐작해서 말하지 마라. 이 명령은 기존 자격 증명을 읽기만 하며 갱신하거나 다시 쓰지 않고, 토큰이나 텔레메트리를 출력하지 않는다. 사용량은 스냅샷이며 허용량을 예약하지 않고 다음 영상의 비용을 추정하지도 않는다. 범위와 워크플로 선택은 사용자와 정한다.
