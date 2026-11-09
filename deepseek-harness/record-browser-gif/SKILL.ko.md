---
name: record-browser-gif
description: 브라우저나 Web UI 상호작용 데모를 사용 가능한 브라우저 제어 워크플로로 녹화해 최적화된 GIF로 만들고, 더 높은 캡처 프레임 레이트가 필요하면 선택적으로 Playwright Videos를 쓰며, 결정적(deterministic) 인코딩을 거친 뒤 `gh --attach`로 pull request에 첨부한다. 게시에는 gh v2.99.0 이상이 필요하고, 5 MiB를 넘는 GIF는 여러 파트로 나눈다. 브라우저 워크플로를 시연하는 GIF를 만들거나, 녹화하거나, 생성해 달라는 요청이 있을 때 사용한다. 사용자에게 보이는 GUI 동작을 바꾸는 모든 pull request에도 사용하며, 이런 pull request에는 그 pull request의 실제 서버와 실제 모델 흐름으로 녹화한 GIF가 반드시 포함되어야 한다.
---

# Record Browser GIF

짧고 사실에 부합하는 UI 시연을 로컬 GIF로 만든다. 작업에 GIF를 pull request에 첨부하는 일이 포함된 경우에만 이 스킬 끝의 첨부 워크플로로 게시한다. 사용 가능한 브라우저 제어 워크플로가 여전히 우선이다. 해당 워크플로가 높은 프레임 레이트의 연속 캡처를 지원하면 [Playwright Videos](https://playwright.dev/docs/videos)를 쓴다. 자르기, 재생 속도, 마지막 프레임 유지, 크기, 용량 조절에는 번들된 인코더를 쓴다.

[보관된 증거 체인 결정](../../notes/archived/process/2026-08-08-browser-gif-evidence-chain.md)은 스토리보드 하나가 왜 하나의 격리된 실행에서 나와야 하는지, 그리고 게시 시 아티팩트와 시연된 pull request head를 왜 둘 다 다시 검증하는지를 기록한다.

<a id="every-gui-pull-request-includes-a-gif"></a>
## 모든 GUI pull request에는 GIF가 포함된다

사용자에게 보이는 GUI 동작을 바꾸는 pull request에는 이 스킬로 녹화한 시연 GIF가 반드시 포함되어야 하며, [첨부 워크플로](#publish-the-gif)를 통해 pull request 본문에 임베드한다.

녹화 자체가 증거의 일부다. 해당 pull request의 브랜치 트리에서 띄운 실제 서버, 실제 API 키, 실제 모델 라운드를 사용한다. 사용자가 fixture 녹화를 명시적으로 요청하지 않았다면 fixture 쿼리, mock transport, 합성 이벤트 주입, test 전용 hook으로 대체하지 않는다. 임베드 옆에는 시연된 정확한 커밋 SHA, 그 커밋을 제공한 트리와 origin, 모드 플래그나 브라우저 상태의 예외 사항, 실제 모델 라운드가 실행되었는지 여부를 적는다. 그래야 리뷰어가 녹화가 무엇을 증명하는지 정확히 알 수 있다.

## 녹화와 게시를 분리한다

- 녹화는 로컬 비디오나 스크린샷을 만들고, 인코딩은 `.gif` 아티팩트 하나를 만든다. 크기가 5 MiB 제한을 넘으면 [번호가 붙은 파트](#attach-with-gh)로 나눈다. 둘 다 원격 상태를 바꾸지 않는다.
- 게시, 즉 `gh --attach`로 GIF를 pull request 본문에 첨부하는 일은 별도의 마지막 단계이며, 작업에 pull request 첨부가 포함된 경우에만 수행한다. 어떤 브랜치에도 커밋하지 않는다.
- 요청된 녹화 조건을 그대로 지킨다. 실제 서버나 실제 API를 쓰는 시연에는 fixture 쿼리, mock transport, 합성 이벤트 주입, test 전용 hook을 쓰지 않는다. 자격 증명이나 서버를 쓸 수 없으면 fixture로 대체하지 말고 그 제약을 보고한다.
- 자격 증명 값은 읽거나 노출하지 않는다. 애플리케이션의 일반 설정 경로를 쓰고, 무해한 시연용 프롬프트를 쓴다.

## 애플리케이션을 준비한다

특정 pull request용 GIF는 그 pull request의 트리를 시연하므로, pull request별로 준비한다.

1. worktree가 깨끗한지 확인하고, `git rev-parse HEAD`로 정확한 커밋을 기록한 뒤, 그 기록된 트리를 빌드한다. 여기서는 `pnpm run build && pnpm run build:web`이다. 다른 커밋의 빌드로 녹화하면 증거의 출처가 잘못 기록된다.
2. 트리에서 포트마다 서버를 하나씩 띄운다. 새 scratch `DSH_HOME`, `DSH_AGENTS_HOME`, workspace, session 상태를 준다. 브라우저에도 새로운 격리 context나 profile을 준다. 브라우저 워크플로가 이를 만들 수 없다면, 영속된 클라이언트 상태가 증거에 영향을 주지 않도록 탐색 전에 해당 origin의 쿠키와 site storage를 지운다. `DEEPSEEK_API_KEY`와 루트 `.env`가 없어도 실제 API 자격 증명이 `~/.dsh/.credentials.yaml`에 있을 수 있다. scratch `DSH_HOME`을 쓸 때는 녹화용 overlay로 `dsh-credentials-local` provider의 `path`를 그 기존 파일의 절대 경로로 지정한다. 키 해석은 애플리케이션의 일반 credential provider에 맡기며, 키는 절대 출력하지 않는다.
3. 스토리보드 하나를 증거 실행 하나로 취급한다. 게시되는 모든 프레임은 같은 서버, 같은 상태 루트, workspace, session, 모델이 개입한 시나리오 실행에서 나와야 한다. 캡처 자동화가 실패하면 그 프레임을 버리고 새 루트에서 다시 실행한다. 서로 다른 실행의 프레임을 이어 붙이지 않는다.
4. pull request를 바꿀 때는 PID나 명령줄의 정확한 일치로 이전 서버를 멈춘다. 넓은 `pkill -f` 패턴은 자기를 실행한 셸까지 죽일 수 있다. 자기 자신도 포함해서다.

## 흐름을 녹화한다

사용 가능한 브라우저 제어 워크플로의 설정, 상호작용, 정리 지침을 따른다. 그 워크플로가 `recordVideo`를 제공하면, 더 많은 중간 프레임을 캡처하도록 같은 제어 context에서 비디오를 켠다. 그렇지 않으면 그 워크플로 안에서 [스크린샷 캡처](#screenshot-capture)를 쓴다. 비디오 지원 여부가 브라우저 제어 워크플로 선택을 결정하지는 않는다. 사용자의 기존 브라우저 상태는 명시적인 격리 예외로 남는다.

브라우저 제어를 쓸 수 없을 때만 격리된 headless 브라우저에서 저장소에 선언된 Playwright 의존성을 쓴다. 이 저장소에서는 `apps/web/package.json`에서 해석된다. 다른 driver를 설치하거나 사용자의 브라우저를 열지 않는다. 이 fallback을 쓴 경우 캡처 노트에 명시한다.

녹화 전에 origin, 빌드되었거나 개발 중인 서버, transport, 모드 override를 확인한다. 프로덕션 기본값이 자동화로 조작할 수 없는 네이티브 화면을 열면, 일반 애플리케이션 설정을 통해 공식적으로 브라우저에서 조작 가능한 프로덕션 백엔드를 고르고 그 override를 공개한다.

스크립트, 원본 비디오, 타이밍 노트, QA 프레임, GIF는 저장소의 git 무시 디렉터리 `.playwright-mcp/` 아래에 둔다. 녹화 전에 실행 디렉터리를 먼저 만든다.

### 비디오 캡처

`viewport`와 `recordVideo.size`를 명시적으로 맞춘다. 그렇지 않으면 Playwright가 비디오를 800×800에 맞춰 축소해 UI 텍스트를 읽을 수 없게 만들 수 있다.

선택한 브라우저 제어 워크플로를 통해 비디오를 설정한다. 독립형 Playwright fallback은 다음을 쓴다.

```js
const { chromium } = createRequire(join(repo, 'apps/web/package.json'))('playwright')
const browser = await chromium.launch()
const size = { width: 1440, height: 900 }
const context = await browser.newContext({
  viewport: size,
  recordVideo: { dir: join(runDir, 'videos'), size },
})
try {
  const page = await context.newPage()
  const video = page.video()
  // Navigate and exercise the real application here.
  await context.close()
  await video.saveAs(join(runDir, 'demo.webm'))
} finally {
  await context.close()
  await browser.close()
}
```

녹화 스크립트에서 `createRequire`는 `node:module`에서, `join`은 `node:path`에서 가져온다. `repo`와 새 `runDir`는 절대 경로로 설정한다. 페이지를 닫기 전에 비디오 handle을 보관한다. `video.saveAs()`나 인코딩 전에 `context.close()`를 await한다. browser만 닫으면 비디오가 flush된다고 보장되지 않는다. 각 페이지는 자기 비디오를 가지므로, 시연할 페이지를 명시적으로 고른다. 관련 없는 페이지나 실행을 이어 붙이지 않는다. 실패한 실행은 진단용으로만 쓴다.

짧은 이야기를 고른다. 의미 있는 상태 3~6개면 충분하다. 행동하기 전에 고유한 semantic locator를 기다린다. 접근성 이름의 완전 일치에는 `exact: true`를 쓰고, 프롬프트 에코와 겹칠 수 없는 완료 조건 텍스트에도 정확 일치 조건을 쓴다. 고정 대기는 상태를 확인한 뒤의 읽기 시간으로만 쓰며, 준비 상태를 확립하는 데 쓰지 않는다. 비디오를 캡처할 때는 애니메이션과 스크롤을 그대로 둔다.

도구 호출, 거부, 복구를 시연할 때는 그 상세 정보나 trajectory를 열어서, 비디오에 도구의 정체, 상태나 안정적인 에러 코드, 후속 결과가 보이게 한다. 일시적인 running 상태가 중요하다면, 오래 걸리는 foreground 작업을 요청하고 구체적인 DOM 마커를 관찰한다. 연속 비디오는 그 중간 프레임을 캡처한다. 완료 시점을 알 수 있도록 모델에 짧은 마지막 sentinel을 준다. 필요 이상으로 긴 실제 API 실행은, 시연할 상태가 보이면 멈춘다.

비밀 정보, 개인 정보, 관련 없는 탭, 알림은 캡처하지 않는다. 브라우저 비디오에는 페이지 내용이 들어가지 브라우저 크롬은 들어가지 않는다. 자격 증명이 들어간 URL은 애플리케이션에 렌더링하지 않는다. 중간 상태를 포함해 선택한 구간 전체를 검토한다. 뷰포트는 처음부터 끝까지 하나로 유지한다.

## GIF 인코딩

`python3`, `ffmpeg`, `ffprobe`가 필요하다. 미디어 바이너리가 없으면, 허가 없이 소프트웨어를 설치하지 말고 의존성을 보고한다. 인자 확장 전에 `GIF_SKILL_DIR`을 단독 줄에서 export한다. 같은 명령 안의 인라인 할당은 인자 확장에 영향을 주지 못한다.

```sh
export GIF_SKILL_DIR=/absolute/path/to/this/skill
python3 "$GIF_SKILL_DIR/scripts/encode_gif.py" \
  /absolute/path/to/demo.webm \
  /absolute/path/to/demo.gif \
  --start 2 --end 32 --speed 2 --final-hold 3 \
  --fps 10 --max-width 1200 --colors 128
```

`--start`와 `--end`는 원본에서 연속된 구간 하나를 초 단위로 고른다. 기본값은 전체 비디오를 1배속으로 유지하고 2초의 마지막 정지 화면을 추가한다. `--speed`는 재생 속도를 바꾼다. 이 값과 선택한 구간을 GIF 옆에 공개해서, 시연이 측정된 응답 지연 시간을 암시하지 않게 한다. 추측한 벽시계 오프셋이 아니라 관찰된 비디오 시간을 쓰고, 시연한 동작의 원인과 결과를 빠짐없이 보존한다. 마지막 정지 화면은 선택된 마지막 프레임을 반복한다. `--fps`는 인코딩된 GIF의 프레임 레이트를 정한다. 원본 녹화가 캡처하지 못한 움직임은 이 값을 올린다고 복구되지 않는다. 원본 WebM은 QA용으로 보관한다. 서로 다른 실행을 이어 붙이거나 빠진 상태를 합성하지 않는다.

인코더는 WebM 컨테이너 길이를 읽고, palette 변환 전에 trim과 speed를 적용하며, 인코딩된 길이, 애니메이션, 너비, 바이트 크기를 검사한다. 비어 있거나 범위를 벗어난 구간, 출력 프레임 2개보다 짧은 선택, 모드에 맞지 않는 플래그, 실수로 인한 덮어쓰기는 거부한다. 아티팩트가 크면 `--max-width`를 줄이고, 그다음 `--colors`나 `--fps`를 줄인다. 텍스트는 읽을 수 있게 유지한다. `--force`는 정확한 출력 경로를 확인한 뒤에만 쓴다.

### 스크린샷 캡처

연속 비디오를 쓸 수 없거나 사용자가 스토리보드를 요청한 경우에는, 사용 가능한 브라우저 제어 워크플로를 따른다. 하나의 격리된 실행에서 브라우저의 스크린샷 API로 검증된 상태 3~6개를 캡처한다. 반환된 이미지 바이트는 한 실행 디렉터리 아래에 `00-initial.png`, `01-typed.png`처럼 바로 저장한다. 모든 프레임은 같은 크기와 같은 crop을 쓴다. 일시적인 상태는 DOM 마커를 폴링하고, 같은 브라우저 스크립트 호출 안에서 캡처한다.

```sh
python3 "$GIF_SKILL_DIR/scripts/encode_gif.py" \
  /absolute/path/to/frames /absolute/path/to/demo.gif \
  --durations 1.5,1.5,1.5,3.5 --fps 10 --max-width 1200 --colors 128
```

`--durations` 값 하나는 모든 스크린샷에 적용된다. 그렇지 않으면 프레임마다 양수 duration을 하나씩 준다. 안정된 상태에 가장 긴 시간을 준다. 디렉터리 입력은 프레임이 2개 미만이거나, 크기가 맞지 않거나, duration 개수가 맞지 않으면 거부한다. 비디오 타이밍 플래그는 비디오 파일에만 적용되며, `--durations`와 `--pattern`은 스크린샷 디렉터리에만 적용된다.

## 아티팩트 검증

1. 인코더의 JSON 요약을 읽고, 출력 경로, 원본 구간과 속도(또는 스크린샷 개수), 인코딩된 프레임 수, 크기, 길이, 바이트 크기를 확인한다.
2. 원본 프레임이 아니라 인코딩된 GIF 자체를 눈으로 확인한다. 전환이 읽기 쉬운지, 마지막 상태가 충분히 오래 유지되는지, 민감한 내용이 없는지 확인한다. 뷰어가 첫 프레임만 보여 준다면, 인코딩된 GIF에서 대표 프레임을 `ffmpeg`로 뽑아 검사한다. 인코딩 전 스크린샷은 인코딩된 순서, palette, 마지막 정지 화면을 증명하지 못한다.
3. `git status --short`를 실행해, 원본 비디오, QA 프레임, 아티팩트가 무시되는 경로에만 생겼는지 확인한다.
4. GIF의 절대 경로를 반환하고, 클라이언트가 로컬 미디어를 지원하면 렌더링한다. 녹화가 실제 API를 썼는지, fixture를 썼는지, 다른 transport를 썼는지 명시한다. 작업에 GIF를 pull request에 첨부하는 일이 포함되지 않았다면 여기서 멈춘다.

인코더 유지보수: 미디어 전제 조건을 설치한 뒤 `python3 -m unittest discover -s "$GIF_SKILL_DIR/scripts" -p 'test_*.py' -v`를 실행한다. 이 로컬 미디어 테스트는 저장소 CI에서 실행되지 않는다.

## GIF 게시

작업에 GIF를 pull request에 첨부하는 일이 포함된 경우에만 이 단계를 수행한다.

pull request 자체 브랜치에도, 다른 어떤 브랜치에도 GIF를 커밋하지 않는다. 모든 기본 clone과 전체 히스토리 fetch는 어느 브랜치에 커밋된 미디어든 내려받기 때문이다. 미디어가 어떤 브랜치에도 남지 않도록, GIF를 GitHub에 업로드하고 본문의 참조를 한 번의 명령으로 다시 쓰는 `gh --attach`로만 게시한다.

<a id="attach-with-gh"></a>
### gh로 첨부

첨부 전에 `gh --version`을 확인한다. `gh --attach`에는 `gh` v2.99.0 이상, github.com에 있는 저장소(GitHub Enterprise Server는 지원하지 않는다), 저장소에 대한 쓰기 권한이 필요하다. `gh`가 v2.99.0보다 오래되었다면 중단하고 개발자에게 v2.99.0 이상으로 업그레이드하라고 알린다. 검증된 GIF는 재시도를 위해 보관한다. 허가 없이 `gh`를 설치하거나 업그레이드하지 않는다. 그 밖의 요구 사항이 충족되지 않거나 첨부가 실패하면(인증, 쓰기 권한, github.com이 아닌 저장소, 업로드 오류) 중단하고 개발자에게 보고한다. 다른 어떤 방식으로도 GIF를 게시하지 않는다.

인코더의 기본 `--max-bytes`인 5 MiB 이하의 GIF만 게시한다. 인코더가 크기 때문에 출력을 거부하면, `--max-width`, 그다음 `--colors`나 `--fps`로 줄인다. 읽을 수 있는 텍스트 품질을 유지한 상태에서도 GIF가 5 MiB를 넘으면 대신 나눈다. 같은 증거 실행의 연속되고 겹치지 않는 구간을, 각각 인코더의 크기 검사를 통과하는 번호 붙은 파트로 인코딩한다. 한 비디오에서 `--start`와 `--end`를 쓰거나, `--pattern`으로 연속된 스크린샷 부분집합을 고른다. 파트마다 아티팩트로서 따로 검증한다. 각 임베드 옆에는 `2/3` 같은 위치와 원본 구간이나 프레임을 적는다.

각 GIF는 본문 파일에 `--attach`에 넘긴 것과 같은 경로를 쓴 일반 로컬 경로 참조로 적는다. `gh`는 각 참조를 제자리에서 업로드된 URL로 다시 쓰며, 위치와 alt 텍스트는 그대로 유지한다. 그러므로 본문의 참조 순서가 분할된 파트의 표시 순서를 정한다.

```markdown
![<alt text>](<path/to/demo.gif>)
```

시연 대상 pull request가 보통 게시 대상이다. 도구 pull request는 다른 pull request의 명확히 표시된 예시를 임베드할 수 있다. 이때는 그 원본 PR을 밝히고, 아래의 모든 확인에서 그 PR의 실시간 head를 비교한다. 예시를 도구 브랜치의 것으로 귀속하지 않는다.

첨부 직전에, 시연 대상 pull request의 실시간 head를 다시 읽는다. 새 pull request라면 push된 브랜치 끝을 읽는다. 그리고 GIF 옆에 기록된 커밋과 비교한다. head가 움직였다면 중단하고 다시 녹화한다. 그다음 첨부한다.

```sh
gh pr create --body-file <body.md> --attach <path/to/demo.gif>     # new pull request
gh pr edit <pr> --body-file <body.md> --attach <path/to/demo.gif>  # existing pull request
```

`--attach`는 여러 번 쓸 수 있지만 같은 파일은 두 번 받지 않는다. 분할된 파트는 한 번의 `gh pr create`나 `gh pr edit`에서, 파트마다 `--attach` 하나씩 붙여 함께 게시한다. 그래야 한 쌍의 실시간 head 확인이 모든 파트를 함께 다룬다. 본문이 참조하지 않는 GIF는 끝에 덧붙여지며, 이때 플래그에 설정한 alt 텍스트(`--attach '<path>#<alt text>'`)가 적용된다. 다시 쓰인 참조는 본문의 alt 텍스트를 유지한다. 첨부 후에는 시연 대상 pull request의 실시간 head를 다시 읽고, 기록된 커밋에 그대로 있는지 확인한다. 실시간 본문을 다시 읽어 참조가 업로드된 URL을 가리키는지 확인한다. GitHub의 Markdown API로 본문을 렌더링해 기대한 `<img>`가 있는지 확인한다. 업로드된 URL을 한 번 가져와 `200`과 `image/gif`를 확인한다.

### 기존 assets 브랜치

이전 pull request 본문들은 이 저장소의 orphan `*-assets` 브랜치에 있는 GIF를 임베드한다. 이 브랜치들은 절대 추가, 삭제, 다시 쓰기, force-push하지 않는다. 병합된 pull request 본문이 그 URL을 참조하기 때문이다.
