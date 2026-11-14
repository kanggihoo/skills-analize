> AI 번역본. 원본: cloudrun.md. 분석 근거는 원본이다.

# Google Cloud에서 Cloud Run 렌더링

`hyperframes cloudrun`은 사용자가 직접 관리하는 Google Cloud 인프라를 명시적으로 원할 때만 쓴다. 이 명령은 Cloud Run, Workflows, Cloud Storage를 배포한다. 관리형 기본값이 필요하면 `hyperframes cloud`를, AWS를 쓰려면 `hyperframes lambda`를 쓴다.

## 사전 조건

- `gcloud`로 인증되어 있고, 대상 프로젝트에 결제가 활성화되어 있다.
- Terraform 1.5 이상이 `PATH`에 있다.
- Docker를 쓰거나 Cloud Build를 사용할 권한이 있다.

## 수명 주기

```bash
npx hyperframes cloudrun deploy --project <gcp-project> --region us-central1
npx hyperframes cloudrun sites create ./project
npx hyperframes cloudrun render ./project --width 1920 --height 1080 --wait
npx hyperframes cloudrun progress <execution-name>
npx hyperframes cloudrun destroy --project <gcp-project>
```

`deploy`는 필요한 Google API를 활성화하고, 컨테이너 이미지를 빌드하거나 받아서, 번들된 Terraform 모듈을 적용한 뒤, 결과 좌표를 `~/.hyperframes/cloudrun-state.json`에 저장한다. `--image`, `--repo`, `--cpu`, `--memory`, `--max-instances`, `--timeout` 같은 deploy 플래그는 인프라에 그런 재정의가 필요할 때만 쓴다.

`sites create`는 `render-batch`에서 재사용할 수 있도록 내용 주소 기반(content-addressed)의 프로젝트 아카이브를 업로드한다. 이때 얻은 `--site-id`를 해당 명령에 넘기면 배치 업로드를 건너뛸 수 있다. 단일 `cloudrun render`는 현재 디렉터리에서 프로젝트를 찾으며 `--site-id`를 사용하지 않는다. 두 render 명령 모두 `--width`와 `--height`가 필요하고, 지원하는 출력 형식은 `mp4`, `mov`, `png-sequence`, `webm`이다. 구성 레이아웃 크기를 바꾸지 않고 4k로 슈퍼샘플링하려면 `--output-resolution 4k`를 쓴다.

자주 쓰는 render 플래그는 `--fps 24|25|30|60`, `--quality draft|standard|high`, MP4용 `--codec h264|h265`, `--chunk-size`, `--max-parallel-chunks`, `--target-chunk-frames`, `--render-id`, `--output-key`, `--wait`, `--wait-interval-ms`다. 기계가 읽을 수 있는 출력이 필요하면 `--json`을 쓴다.

변수 기반의 단일 render 예:

```bash
npx hyperframes cloudrun render ./template \
  --width 1920 --height 1080 \
  --variables-file ./alice.json \
  --strict-variables \
  --wait
```

`--variables`와 `--variables-file` 중 정확히 하나만 쓴다. 구성 쪽 계약은 [Variables](../../hyperframes/references/format.md#variables)를 읽는다.

## JSONL 배치

```bash
npx hyperframes cloudrun render-batch ./template \
  --batch ./users.jsonl \
  --width 1920 --height 1080 \
  --max-concurrent 10 \
  --site-id <site-id> \
  --json
```

빈 줄이 아닌 각 줄에는 `outputKey`가 있어야 하며, `variables`는 선택 사항이다:

```json
{ "outputKey": "renders/alice.mp4", "variables": { "name": "Alice" } }
```

- `--max-concurrent`의 기본값은 `50`이며, 실행 중인 execution 수를 제한한다. `--max-parallel-chunks`는 하나의 render 안에서 chunk 수를 따로 제한한다.
- `--dry-run`은 파일만 파싱하고 실행을 시작하지 않은 채 `would-start` 행을 출력한다.
- `--site-id`를 주지 않으면 템플릿은 한 번만 업로드된다.
- 항목별 시작 오류는 그대로 보이며, 이 경우 명령은 0이 아닌 종료 코드로 끝난다.
- `cloudrun render-batch`에서는 `--strict-variables`에 기대지 않는다. 현재 명령은 이 플래그를 받기만 하고 배치 행을 검증하지 않는다. 디스패치 전에 JSONL의 variables 객체를 구성의 스키마에 직접 검증한다. 엄격 모드 검사는 단일 `cloudrun render`에서만 동작한다.

`--wait` 없이 `render`를 실행하면 execution 이름이 반환된다. 성공할 때까지 `cloudrun progress <execution-name>`으로 확인한 뒤, 보고된 GCS 출력을 검증한다. `destroy`는 Terraform으로 관리되는 스택과 임시 버킷을 삭제하므로, 스택보다 오래 남아야 하는 결과물은 미리 보존한다.
