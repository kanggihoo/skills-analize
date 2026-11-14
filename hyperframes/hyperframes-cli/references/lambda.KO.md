> AI 번역본. 원본: lambda.md. 분석 근거는 원본이다.

# AWS에서 Lambda 렌더링

자체 관리형 AWS 인프라를 명시적으로 원하거나 분산 렌더링이 필요할 때 `hyperframes lambda`를 쓴다. `@hyperframes/aws-lambda`와 AWS SAM을 감싸는 명령이다.

## 목차

- [Lambda 또는 로컬 렌더링 선택](#lambda-또는-로컬-렌더링-선택)
- [사전 요구 사항](#사전-요구-사항)
- [배포](#배포)
- [재사용 가능한 사이트 업로드](#재사용-가능한-사이트-업로드)
- [컴포지션 하나 렌더링](#컴포지션-하나-렌더링)
- [JSONL 배치 렌더링](#jsonl-배치-렌더링)
- [진행 상황 확인](#진행-상황-확인)
- [스택 삭제](#스택-삭제)
- [IAM 정책](#iam-정책)
- [상태, 비용, 정리](#상태-비용-정리)

기본 수명 주기는 다음과 같다:

```bash
npx hyperframes lambda deploy
npx hyperframes lambda render ./my-project --width 1920 --height 1080 --wait
npx hyperframes lambda destroy
```

## Lambda 또는 로컬 렌더링 선택

- **로컬 `render`** — 개발 루프에서 반복할 때, 단일 호스트, 1080p에서 몇 분 이내로 끝나는 작업.
- **`lambda render`** — 긴 영상, 4K, 대규모 병렬 배치, 또는 로컬 Chrome이 시간 초과되거나 RAM을 모두 쓸 작업. 호출당 과금되며 유휴 비용이 없다.

짧은 단발성 렌더링에는 배포 오버헤드를 들일 가치가 없다.

## 사전 요구 사항

- AWS 자격 증명이 설정되어 있어야 한다(환경 변수, `~/.aws/credentials`, SSO, IMDS 중 하나).
- AWS SAM CLI가 `PATH`에 있어야 한다.
- `bun`이 `PATH`에 있어야 한다(Lambda 핸들러 ZIP을 빌드한다).

## 배포

```bash
npx hyperframes lambda deploy \
  --stack-name=hyperframes-prod \
  --region=us-east-1 \
  --concurrency=8 \
  --memory=10240
```

`packages/aws-lambda/dist/handler.zip`을 빌드하고 SAM으로 스택(Lambda + Step Functions + S3 + IAM)을 배포한다. 멱등하다. 같은 `--stack-name`으로 다시 실행해도 바뀐 것이 없으면 아무 일도 하지 않는다. 이후 하위 명령이 `describe-stacks`를 호출하지 않도록 `<cwd>/.hyperframes/lambda-stack-<name>.json`을 쓴다.

| 플래그            | 기본값                          | 설명                                   |
| ----------------- | ------------------------------- | -------------------------------------- |
| `--stack-name`    | `hyperframes-default`           | CloudFormation 스택 이름               |
| `--region`        | `AWS_REGION` 환경 변수 또는 `us-east-1` | AWS 리전                        |
| `--profile`       | `AWS_PROFILE` 환경 변수         | 이름 있는 AWS 자격 증명 프로필         |
| `--concurrency`   | `8`                             | Lambda 예약 동시 실행 수               |
| `--chrome-source` | `sparticuz`                     | `sparticuz` 또는 `chrome-headless-shell` |
| `--memory`        | `10240`                         | Lambda 메모리(MB)                      |
| `--skip-build`    | 꺼짐                            | 기존 `handler.zip` 재사용              |
| `--no-warm`       | 워밍 실행                       | 배포 후 워밍업 호출 건너뛰기           |

## 재사용 가능한 사이트 업로드

```bash
npx hyperframes lambda sites create ./my-project
# → siteId: abc1234deadbeef0  (같은 트리를 다시 실행해도 안정적으로 유지됨)

npx hyperframes lambda render ./my-project --site-id=abc1234deadbeef0 ...
```

`<projectDir>`를 tar로 묶어 콘텐츠 주소 기반 키로 S3에 업로드한다. 재사용할 수 있는 안정적인 `siteId`를 반환한다. 같은 트리를 다시 렌더링하면 업로드를 건너뛴다.

## 컴포지션 하나 렌더링

```bash
npx hyperframes lambda render ./my-project \
  --width 1920 --height 1080 --fps 30 --format mp4 \
  --chunk-size 240 --max-parallel-chunks 16 \
  --wait
```

Step Functions 실행을 시작한다. `--wait`를 주지 않으면 `renderId`를 바로 반환한다. `--wait`를 주면 완료될 때까지 블록하면서 청크별 진행 상황을 스트리밍한다. 기계가 읽을 수 있는 출력이 필요하면 `--json`을 붙인다.

| 플래그                  | 설명                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--width` / `--height`  | 출력 해상도(픽셀)                                                                                                                                                                                                                                                                                                                                      |
| `--output-resolution`   | 슈퍼샘플링 프리셋(Chrome `deviceScaleFactor`를 활성화). `landscape` / `landscape-4k` / `portrait` / `portrait-4k` / `square` / `square-4k`, 그리고 별칭 `1080p`, `4k`, `uhd`, `hd`, `1080p-portrait`, `4k-portrait`, `1080p-square`, `4k-square`. 1080p로 작성된 컴포지션을 레이아웃 재구성 없이 4K로 렌더링할 때 쓴다. 아래 함정 참고. |
| `--fps`                 | `24` / `25` / `30` / `60`                                                                                                                                                                                                                                                                                                                              |
| `--format`              | `mp4` / `mov` / `png-sequence` / `webm` (기본값 `mp4`)                                                                                                                                                                                                                                                                                                 |
| `--codec`               | `h264` / `h265` (mp4 전용)                                                                                                                                                                                                                                                                                                                             |
| `--quality`             | `draft` / `standard` / `high`                                                                                                                                                                                                                                                                                                                          |
| `--chunk-size`          | 청크당 프레임 수(기본값 `240`)                                                                                                                                                                                                                                                                                                                         |
| `--max-parallel-chunks` | 동시에 실행할 최대 청크 수(기본값 `16`)                                                                                                                                                                                                                                                                                                                |
| `--target-chunk-frames` | 청크당 프레임 수에 상한을 두고, 병렬 한도까지 플래너가 청크를 더 늘리게 한다                                                                                                                                                                                                                                                                           |
| `--keyframe-interval`   | MP4 전용: 최대 N초마다 키프레임을 둔다(상한값이다. 청크를 이어 붙이면 키프레임이 추가된다)                                                                                                                                                                                                                                                             |
| `--max-bitrate`         | MP4 전용: 최대 비트레이트 상한. 청크 단위로 유지된다(이어 붙이는 지점에서는 버퍼 한 개만큼 순간적으로 넘을 수 있다)                                                                                                                                                                                                                                    |
| `--buffer-size`         | MP4 전용: `--max-bitrate`용 버퍼(기본값은 그 두 배)                                                                                                                                                                                                                                                                                                    |
| `--site-id`             | 기존 사이트 재사용(업로드 생략)                                                                                                                                                                                                                                                                                                                        |
| `--execution-name`      | Step Functions 실행 이름을 직접 지정                                                                                                                                                                                                                                                                                                                   |
| `--output-key`          | 최종 S3 객체 키를 직접 지정                                                                                                                                                                                                                                                                                                                            |
| `--variables`           | 컴포지션 변수 값을 담은 인라인 JSON 객체                                                                                                                                                                                                                                                                                                               |
| `--variables-file`      | 컴포지션 변수 객체 하나를 담은 JSON 파일                                                                                                                                                                                                                                                                                                               |
| `--strict-variables`    | 전달한 변수가 선언되지 않았거나 타입이 틀리면 실패                                                                                                                                                                                                                                                                                                      |
| `--wait`                | 완료될 때까지 블록하고 진행 상황을 스트리밍                                                                                                                                                                                                                                                                                                            |
| `--wait-interval-ms`    | 대기 중 폴링 간격(기본값 `5000`)                                                                                                                                                                                                                                                                                                                       |
| `--json`                | 기계가 읽을 수 있는 진행 상황 스냅샷                                                                                                                                                                                                                                                                                                                   |

**`--width` / `--height` 함정.** `data-width="1920"`인 컴포지션에 `--width 3840 --height 2160`을 주면 아무 경고 없이 1080p가 나온다. 런타임은 컴포지션에 적힌 원래 크기로 페이지를 배치하고, CLI 플래그는 레이아웃에 반영되지 않는다. 실제로 4K로 출력하려면 `--output-resolution 4k`를 써라(`deviceScaleFactor`로 슈퍼샘플링한다). CLI 크기가 컴포지션의 `data-width` / `data-height`와 다르고 `--output-resolution`을 설정하지 않았으면 CLI가 경고를 출력한다. 경고는 `--json`을 켰거나 `index.html`이 디스크에 없을 때(`--site-id` 흐름)에는 나오지 않는다.

변수 기반 템플릿이라면 컴포지션에 스키마를 선언하고, `--variables` 또는 `--variables-file` 중 하나만 전달하라. 둘 다 전달하지 마라. `--strict-variables`는 렌더링이 시작되기 전에 로컬 프로젝트 입력을 검사한다. [변수](../../hyperframes/references/format.md#variables)도 함께 읽어라.

## JSONL 배치 렌더링

`render-batch`를 쓰면 템플릿을 한 번만 업로드하고, 비어 있지 않은 JSONL 줄마다 Step Functions 실행을 하나씩 시작한다:

```bash
npx hyperframes lambda render-batch ./template \
  --batch ./users.jsonl \
  --width 1920 --height 1080 \
  --max-concurrent 10 \
  --strict-variables \
  --json
```

각 줄은 비어 있지 않은 `outputKey`를 가진 객체여야 한다. 출력물이 서로 덮어쓰지 않도록 키를 고유하게 골라라. `variables`와 `executionName`은 선택 사항이다:

```json
{
  "outputKey": "renders/alice.mp4",
  "variables": { "name": "Alice" },
  "executionName": "alice-video"
}
```

배치 규칙:

- `--site-id`로 이전 업로드를 재사용하지 않는 한 프로젝트는 한 번만 업로드된다.
- `--max-concurrent`의 기본값은 `50`이며 동시에 진행되는 렌더링 실행 수를 제한한다. `--max-parallel-chunks`는 각 렌더링 안의 청크 수를 따로 제한한다.
- `--strict-variables`는 모든 항목을 검사해 변수 문제를 전부 보고하고, AWS 호출 전에 중단한다.
- `--dry-run`은 업로드도 AWS 렌더링 호출도 하지 않는다. 매니페스트의 모든 행이 `would-invoke`가 된다.
- 출력 매니페스트는 입력 순서를 유지하고, `inputLine`, `outputKey`, `executionArn`, `status`(`started`, `would-invoke`, `failed-to-start`)를 기록한다. 해당하면 오류도 함께 기록한다.
- 항목 하나가 시작에 실패해도 다른 행을 가리지 않는다. 사람이 읽는 출력 모드에서는 행이 시작에 실패하면 0이 아닌 코드로 종료한다. 현재 CLI는 `--json` 모드에서 매니페스트를 출력하고 0으로 종료하므로, 프로세스 코드만 보지 말고 모든 행의 `status`를 확인하라. 디스패치 성공이 렌더링 완료를 뜻하지는 않는다. 각 실행은 `progress`로 확인하라.

## 진행 상황 확인

```bash
npx hyperframes lambda progress hf-render-abcd1234
npx hyperframes lambda progress arn:aws:states:us-east-1:...:execution:...
```

전체 진행률, 렌더링된 프레임 수, Lambda 호출 수, 누적 비용, 오류를 한 번의 스냅샷으로 출력한다. 스택의 상태 머신 ARN과 맞춰 찾는 bare `renderId`나 전체 SFN 실행 ARN을 받는다.

## 스택 삭제

```bash
npx hyperframes lambda destroy
```

`sam delete --no-prompts`를 호출하고 로컬 상태 파일을 지운다. **렌더링 S3 버킷은 `Retain`으로 설정되어 있어** 스택을 삭제해도 남는다. 저장 공간을 돌려받고 싶다면 AWS 콘솔이나 CLI에서 비운 뒤 직접 삭제하라.

### 재시도 불가능한 오류

Step Functions 상태 머신이 4회 × 15분 재시도 예산을 쓰지 않고 바로 중단하는 실패 유형이 있다. `progress`는 이런 오류를 오류 클래스 이름과 함께 즉시 보여 준다. 이런 오류를 보면 `lambda render`를 무작정 다시 실행하지 마라.

- **`ChromeBinaryUnavailableError`** — `@sparticuz/chromium`이 빈 값이나 없는 실행 파일 경로를 반환했다. 이전 청크가 실행 중 `Sandbox.Timedout`에 걸렸고, 워밍된 인스턴스는 실행 환경이 재생성될 때까지 멈춘 상태다. 해결법: Lambda 환경 변수를 하나 바꿔 새 실행 환경을 강제하거나 `lambda deploy`를 다시 실행하라. 일시적인 렌더링 실패가 아니다. 재시도해도 같은 멈춘 인스턴스에서 예산만 소모된다.
- **`FFMPEG_VERSION_MISMATCH`** / **`PLAN_HASH_MISMATCH`** — 플래너와 실행기의 버전이 어긋났다. 다시 배포하라.

## IAM 정책

CLI에 필요한 최소 IAM 권한을 출력하거나 검증한다.

```bash
npx hyperframes lambda policies user                                  # IAM 사용자용 인라인 정책
npx hyperframes lambda policies role                                  # { TrustRelationship, InlinePolicy }
npx hyperframes lambda policies validate ./infra/iam/hf-deploy.json   # CI 게이트
```

`validate`는 JSON 정책 문서를 읽고, `Effect: Allow` 액션의 합집합(`s3:*` / `s3:Get*` / `*` 와일드카드를 펼쳐서)을 CLI가 요구하는 액션 집합과 비교한다. 빠진 액션은 stderr에 출력되고, 명령은 0이 아닌 코드로 종료한다. 다음 배포가 실패하기 전에 정책 드리프트를 잡으려면 CI에 연결하라.

기본 액션 집합은 의도적으로 넓게(`Resource: "*"`) 잡혀 있다. 배포하는 사람마다 첫 배포 때 CloudFormation이 새 ARN을 만들기 때문이다. 보안 요구 사항이 있다면 첫 실행 후 `Resource`를 좁혀라.

## 상태, 비용, 정리

`hyperframes lambda`는 스택별 메타데이터를 `<cwd>/.hyperframes/lambda-stack-<name>.json`(버킷 이름, 상태 머신 ARN, 리전)에 저장한다. 비밀은 아니지만 AWS 계정을 식별할 수 있다. 워크플로에 맞춰 저장소에 커밋하거나 `.gitignore`에 추가하라.

- `lambda destroy`는 SAM 스택을 제거하지만 S3 버킷(`Retain`)은 **남긴다**. 저장 공간을 돌려받으려면 직접 삭제하라.
- Lambda 과금은 호출 횟수와 실행 시간에 따른다. `progress`가 누적 비용을 보여 준다.
- `--concurrency`는 병렬 Lambda 호출 수를 제한한다. 계정 할당량에 맞춰 설정하라.
- `--chunk-size`와 `--max-parallel-chunks`는 청크당 오버헤드와 병렬성을 맞바꾼다. 청크가 크면 코디네이터 오버헤드가 줄고, 청크가 작으면 더 공격적으로 병렬 처리한다.
