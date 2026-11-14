> AI 번역본. 원본: cloud.md. 분석 근거는 원본이다.

# cloud — HeyGen 호스팅 렌더링 (인프라 불필요)

`hyperframes cloud render`는 HeyGen의 관리형 클라우드에서 composition을 렌더링한다. CLI가 프로젝트를 zip으로 묶어 업로드하고, HeyGen 인프라(Chromium + FFmpeg)에서 렌더를 실행한 뒤 완성된 영상을 다운로드한다. 배포할 것도, Chrome/FFmpeg/AWS를 관리할 것도 없다. 서버가 선택된 credential의 렌더 할당량이나 과금을 적용한다.

```bash
npx hyperframes auth login            # one-time sign-in
npx hyperframes cloud render          # zip, upload, render, download
```

## 관리형 cloud, Lambda, Cloud Run, local 중 언제 쓸지

- **`hyperframes render`**(local): 가장 빠른 반복 루프이므로 저작 중에 쓴다. preview, snapshot, 초안 검사는 로컬에서 한다.
- **`hyperframes cloud render`**: 인프라가 필요 없다. HeyGen이 선택된 credential의 할당량이나 과금 아래에서 렌더를 실행한다. Chrome/FFmpeg/AWS를 직접 관리하고 싶지 않을 때 "클라우드에서 렌더링"의 기본 답이다.
- **`hyperframes lambda render`**: 자체 AWS를 쓰는 분산 렌더링으로, chunk 단위 병렬 처리를 한다. 이미 AWS에 투자해 둔 경우에만 가치가 있다(`lambda.md` 참고).
- **`hyperframes cloudrun render`**: 자체 GCP를 쓰는 분산 렌더링으로, Cloud Run과 Workflows를 통해 동작한다. GCP 소유가 명확할 때만 쓴다(`cloudrun.md` 참고).

**유료 플랜의 최종 렌더.** `npx hyperframes auth status`의 `Billing: HyperFrames`와 `HyperFrames:` 줄에 `Free`가 아닌 유료 플랜이 표시되면, 사용자가 받는 최종본이나 공유용 결과물은 `cloud render --fps <data-fps> --quality high -o <path>`로 만든다. 여기서 root의 `data-fps`를 쓰고(cloud 기본값은 30), `high`를 쓴다(local `delivery`에 해당하며, cloud 기본값은 `standard`다). Free 플랜이면 사용자가 cloud를 요청하지 않는 한 로컬에서 렌더링한다. 소수 fps이거나 프레임이 16:9, 9:16, 1:1이 아니면 로컬에서 렌더링한다. cloud 렌더가 거부되거나 실패하면(네트워크, 할당량) 로컬에서 렌더링하고, 그 이유를 사용자에게 알린다.

## 인증

Cloud 렌더링은 전용 HyperFrames OAuth client와 격리된 `~/.hyperframes/credentials` 저장소를 쓴다. 이전의 공유 HeyGen 로그인은 새로 `hyperframes auth login`을 해야 한다. 별도의 `heygen` CLI는 자체 로그인을 유지한다. 명시적 API key를 쓰면 API 과금이 적용된다.

```bash
npx hyperframes auth login              # OAuth 2.0 + PKCE, opens the browser
npx hyperframes auth login --api-key    # CI/headless: hidden prompt, or pipe: echo "$HEYGEN_API_KEY" | ... --api-key
npx hyperframes auth status             # active credential source, identity, billing snapshot
                                        #   exit 0 = signed in and verified; exit 1 = not signed in,
                                        #   or the credential was rejected — signed-out exit 1 is the
                                        #   normal offline state (scripts: `auth status || echo offline`),
                                        #   not a command failure
npx hyperframes auth refresh            # force-refresh an OAuth token before a long job
npx hyperframes auth logout             # clear the stored credential
```

Credential 해석 순서(처음 일치하는 것이 이긴다): `HEYGEN_ACCESS_TOKEN`(호스트 앱이 주입하는 OAuth 토큰, 갱신하거나 저장하지 않음), 그다음 `~/.hyperframes/credentials`의 `hyperframes auth login` 세션(만료되면 갱신), 그다음 `HEYGEN_API_KEY`, 그다음 `HYPERFRAMES_API_KEY`, 마지막으로 `auth login --api-key`로 저장한 key. 로그인된 세션은 환경 변수 key보다 우선한다. 환경 변수 key는 HeyGen이 세션 갱신을 거부했거나 `HEYGEN_API_URL`이 호스트 앱의 gateway를 가리킬 때 쓰인다. `auth status`는 어떤 credential이 쓰이는지 보여 준다. `auth logout`을 하면 환경 변수 key가 우선된다. `HYPERFRAMES_ENV=dev`는 dev client, OAuth/API 호스트, `~/.hyperframes/dev/credentials`를 함께 선택한다. `HYPERFRAMES_CONFIG_DIR`은 credential 루트를 덮어쓴다. `HEYGEN_API_URL`은 API 호스트를 덮어쓴다.

## 렌더 파이프라인

`cloud render`는 다음 순서로 끝까지 실행된다.

1. **프로젝트 확인**: 로컬 디렉터리(기본값 `.`)를 쓰거나, `--asset-id` / `--url`을 주어 업로드를 건너뛴다.
2. entry HTML의 `data-width`/`data-height`로 **화면 비율을 자동 감지**한다.
3. 프로젝트를 **zip**으로 묶는다(`hyperframes publish`와 같은 ignore 목록을 쓰며, `.hyperframesignore`도 포함한다).
4. direct-to-S3 asset 흐름으로 zip을 **업로드**하여 `asset_id`를 얻는다.
5. `POST /v3/hyperframes/renders`에 렌더를 **제출**하여 `render_id`를 얻는다.
6. 완료되거나 실패할 때까지 `GET /v3/hyperframes/renders/{id}`를 **polling**한다(`--no-wait`로 건너뛸 수 있다).
7. 서명된 video URL에서 디스크로 **다운로드**한다.

## 아카이브 크기와 `.hyperframesignore`

직접 업로드 한도는 200 MB다. HyperFrames는 root 레벨의 `renders/`와 `snapshots/`를 자동으로 제외한다. 기존의 개발용 제외 목록(`.git`, `node_modules`, `dist`, `.next`, `coverage`, dotfile 등)도 그대로 적용된다. 렌더 시점에 필요 없는 다른 생성물이나 중간 asset이 있다면 `<project>/.hyperframesignore`에 프로젝트별 gitignore 스타일 규칙을 추가한다. 같은 규칙이 `hyperframes publish`에도 적용된다.

인증, 업로드, 크레딧 사용, 렌더 시작 없이 정확한 아카이브를 확인하려면 다음을 실행한다.

```bash
npx hyperframes cloud render <project> --dry-run --json
```

결과에는 압축된 `size_bytes`, `file_count`, 200 MB 한도, 포함된 파일 중 가장 큰 10개가 나온다.

cloud 업로드가 크기 한도 에러를 보고하면, 에이전트는 다음 절차를 따라야 한다.

1. dry-run을 실행하고, 포함된 가장 큰 파일과 디렉터리를 확인한다.
2. 명백한 생성물부터 분류한다. 오래된 렌더, 추가된 snapshot/contact-sheet 디렉터리, 캐시, 내보낸 preview, 최종 asset을 만들 때만 쓰인 원본 미디어가 여기에 해당한다.
3. 무언가를 제외하기 전에, 모든 HTML, CSS, JavaScript entry에서 `src`, `href`, `url()`, `data-composition-src`, JavaScript 문자열, manifest, 변수로 만들어지는 경로를 검색한다.
4. 기존 `.hyperframesignore`의 주석과 규칙은 보존한다. 검증된 불필요 경로 중 가장 좁은 root 기준 상대 경로만 추가한다. 넓은 wildcard보다 정확한 디렉터리나 파일을 쓴다.
5. 크다는 이유만으로 `index.html`, 선택된 composition, 마운트된 sub-composition, 폰트, 이미지, 오디오, 비디오, 스크립트, manifest를 무시하지 않는다. `assets/` 전체를 무시하지 않는다.
6. 아카이브가 한도 아래로 들어올 때까지 dry-run을 다시 실행한 뒤, `npx hyperframes check`를 실행한다. `check`는 소스 디렉터리를 보므로, 필터링된 아카이브에 동적으로 계산된 asset 경로가 남아 있는지는 증명하지 못한다. 그래서 참조 감사는 여전히 필요하다.

예시:

```gitignore
# Additional generated verification passes
/snapshots2/
/snapshots3/

# Master used only to produce the final background clips
/assets/bg-pattern.mp4
```

규칙은 주석, glob, 부정(negation)을 지원한다. 기본 제외 항목을 덮어쓰는 뒤쪽 규칙도 가능하다. 예를 들어 디렉터리에 렌더 입력이 의도적으로 들어 있다면 `!/snapshots/`를 쓴다.

## 렌더 옵션

| Flag                   | Default                     | Meaning                                                                                                                                                                                    |
| ---------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--fps`                | `30`                        | 초당 프레임 수, 1–240.                                                                                                                                                                     |
| `--quality`            | `standard`                  | `draft`, `standard`, `high` 중 하나.                                                                                                                                                       |
| `--format`             | `mp4`                       | `mp4`, `webm`, `mov`(webm/mov는 alpha를 유지한다).                                                                                                                                         |
| `--resolution`         | `1080p`                     | `1080p` 또는 `4k`(4k는 1.5배로 과금된다).                                                                                                                                                  |
| `--aspect-ratio`       | auto                        | 임의의 `W:H`. 로컬 프로젝트에서는 `data-width`/`data-height`로 자동 결정된다. `1080p`에서는 어떤 비율이든 composition의 크기를 유지한다(2:1은 2:1로 유지). `4k`는 `16:9`, `9:16`, `1:1`만 받는다. |
| `--composition` / `-c` | `index.html`                | zip 안의 entry HTML 파일.                                                                                                                                                                  |
| `--output` / `-o`      | `renders/<render_id>.<ext>` | 로컬 다운로드 경로.                                                                                                                                                                        |
| `--dry-run`            | off                         | 인증, 업로드, 렌더링 없이 로컬 프로젝트 zip을 만들어 검사한다.                                                                                                                              |

```bash
npx hyperframes cloud render . \
  --composition compositions/intro.html \
  --output ./renders/intro.mp4

npx hyperframes cloud render --quality high --fps 60
```

`--resolution 4k`는 `--format webm`/`mov`와 함께 쓸 수 없다. 4k supersampling 경로에는 alpha 채널이 없기 때문이다. 4k는 mp4로 렌더하거나, alpha가 필요하면 원래 해상도로 렌더한다.

## 템플릿과 변수

Cloud 렌더링은 [composition variables](../../hyperframes/references/format.md#variables)를 지원한다. composition에 `data-composition-variables`를 선언한 뒤 렌더 시점에 값을 채운다.

```bash
npx hyperframes cloud render --variables '{"title":"Q4 Recap","theme":"dark"}'
npx hyperframes cloud render --variables-file ./vars.json
npx hyperframes cloud render --variables '{"title":"Q4 Recap"}' --strict-variables
```

**로컬 프로젝트**의 경우 CLI는 업로드 전에 `--variables`를 선언된 스키마와 대조해 검증한다. `--asset-id`/`--url`의 경우 스키마는 서버에 있으므로, 불일치는 `hyperframes_project_invalid` API 에러로 나타난다.

**한 번 업로드하고 여러 번 렌더**하는 것이 관용적인 템플릿 루프다. 로컬 프로젝트를 렌더해 `asset_id`를 얻은 뒤, 그 asset을 대상으로 새 값을 넣어 다시 제출한다(zip을 다시 만들거나 업로드하지 않는다).

```bash
npx hyperframes cloud render ./card-template                              # note the asset_id printed on upload
npx hyperframes cloud render --asset-id asst_abc123 --variables '{"name":"Ada"}'
npx hyperframes cloud render --asset-id asst_abc123 --variables '{"name":"Linus"}'
```

대량의 개인화 배치에는 두 가지 자체 관리형 경로가 JSONL fan-out을 제공한다. AWS Lambda(`lambda.md`)와 Google Cloud Run(`cloudrun.md`)이다. 변수 스키마 전체(타입, 선언적 바인딩, sub-composition 덮어쓰기, 우선순위)는 [`/hyperframes` format.md](../../hyperframes/references/format.md#variables)에 있다.

## 즉시 반환과 webhook

기본적으로 CLI는 기다리고, polling하고, 다운로드까지 한다. 진정한 fire-and-forget을 하려면 `--no-wait`(제출 후 바로 종료하고 `render_id`만 출력)와 `--callback-url`(종료 상태에서 호출되는 HTTPS webhook)을 함께 쓴다.

```bash
npx hyperframes cloud render --callback-url https://example.com/hf-hook --no-wait
#    Poll later with: hyperframes cloud get hfr_def456
```

| Flag              | Meaning                                             |
| ----------------- | --------------------------------------------------- |
| `--no-wait`       | 제출 후 즉시 종료하고 `render_id`를 출력한다.       |
| `--callback-url`  | 렌더가 종료되면 호출되는 HTTPS webhook.             |
| `--callback-id`   | webhook payload에 그대로 실려 오는 추적용 opaque ID. |
| `--poll-interval` | polling 주기(초, 기본값 `2`).                       |
| `--max-wait`      | 최대 polling 시간(분, 기본값 `60`).                 |

## 렌더 관리

```bash
npx hyperframes cloud list                 # recent renders (--limit, --token, --all)
npx hyperframes cloud get hfr_def456       # full detail + short-lived signed video_url
npx hyperframes cloud delete hfr_def456    # soft-delete (--no-confirm to skip the prompt)
```

`video_url`과 `thumbnail_url`은 수명이 짧은 presigned URL이므로 캐시하지 말고 `cloud get`으로 다시 가져온다.

## 안전한 재시도

CLI는 `401`이 오면 OAuth 토큰을 강제로 갱신한 뒤 요청을 다시 보내는 방식으로 투명하게 재시도한다. 읽기 요청에는 이것이 무해하다. 하지만 zip 업로드(`POST /v3/assets`)는 **멱등하지 않다**. 맹목적으로 재시도하면 asset이 중복 생성되고 두 번 과금된다. 따라서 재시도가 안전하도록 `--idempotency-key`를 준다.

```bash
npx hyperframes cloud render . --idempotency-key "$(uuidgen)"
```

이 key는 업로드와 제출 양쪽에 전달된다. 서버가 idempotency를 엔드포인트별로 관리하므로 같은 값을 재사용해도 안전하다. `[A-Za-z0-9_:.-]` 문자만 쓴 불투명 문자열이면 되며, 길이는 1–255자다.

전체 flag 참고: docs `/deploy/cloud`와 `/packages/cli#hyperframes-cloud`.
