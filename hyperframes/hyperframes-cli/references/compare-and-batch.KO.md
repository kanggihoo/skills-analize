> AI 번역본. 원본: compare-and-batch.md. 분석 근거는 원본이다.

# 비교 렌더링과 배치 렌더링

이 명령들은 의도적인 시각 비교나 변수 기반 템플릿 출력에 쓴다. `lint`, `check`, 최종 preview 승인, 출력 검증을 대체하지 않는다.

## 목차

- [프로젝트나 변형(variant) 비교](#프로젝트나-변형variant-비교)
- [색보정(grade) 비교](#색보정grade-비교)
- [템플릿 배치 렌더링](#템플릿-배치-렌더링)

## 프로젝트나 변형(variant) 비교

두 개 이상의 프로젝트 디렉터리나 HTML 파일에서 같은 시점을 렌더링해, 라벨이 붙은 하나의 콘택트 시트로 묶는다:

```bash
npx hyperframes compare <path-a> <path-b> [<path-c> ...] \
  --at <seconds> \
  --labels baseline,candidate \
  --out compare.png \
  --cols 2
```

유용한 옵션:

- `--at <seconds>`: 공통 비교 시점을 지정한다.
- `--labels <a,b,...>`: 입력 순서대로 셀에 라벨을 붙인다.
- `--out <file>`: 시트 경로를 지정한다.
- `--cols <n>`: 격자 열 수를 정한다.
- `--json`: 기계가 읽을 수 있는 결과를 반환한다.
- `--timeout <ms>`: 변형별 render-ready 대기 시간을 바꾼다.

시트 하나에는 변형을 최대 16개까지 넣을 수 있다. 초과한 입력은 경고와 함께 잘리므로, 더 큰 비교는 여러 번으로 나눈다.

`compare`는 시각 검토용 도구이지 품질 게이트가 아니다. 기준안과 후보안을 비교하거나, 구현 변형들을 견주거나, 수정이 의도한 모습을 유지하는지 확인할 때 쓴다. 생성된 이미지를 직접 확인해야 하며, 명령이 성공했다고 해서 시각적으로 승인된 것은 아니다.

## 색보정(grade) 비교

원본 프레임에서 grade 후보를 만든다:

```bash
npx hyperframes grade-compare \
  --for frame.png \
  --grades grades.json \
  --project . \
  --out grade-compare.png
```

`grades.json`은 라벨이 붙은 HyperFrames grading 블록의 배열이다:

```json
[{ "label": "warm", "grading": { "adjust": { "temperature": 0.2, "contrast": 0.1 } } }]
```

또는 명시한 LUT 파일끼리 비교한다:

```bash
npx hyperframes grade-compare \
  --for source.mp4 \
  --luts warm.cube,cool.cube \
  --out grade-compare.png
```

- `--for`는 이미지나 비디오를 받는다. 비디오를 주면 첫 프레임을 추출한다.
- 후보 소스는 정확히 하나만 준다: `--grades <json>` 또는 `--luts <a.cube,b.cube>`.
- 중립 기준선(neutral baseline)은 기본으로 포함된다. 기준선이 유용한 참고가 아닐 때만 `--no-baseline`을 쓴다.
- 명령은 후보 grade를 최대 16개까지 받는다. 기본 중립 기준선이 있으면 시트에 셀이 17개까지 들어갈 수 있다. 초과한 후보는 경고와 함께 잘리므로, 더 큰 집합은 여러 번으로 나눈다.
- `--timeout <ms>`는 생성된 비교 구성의 render-ready 대기 시간을 바꾼다.
- 기계가 읽을 수 있는 출력이 필요하면 `--json`을 쓴다.

이 명령은 grade를 고르는 데만 도움을 준다. 선택한 grade를 구성에 적용하지 않으며, `/media-use`의 출처(provenance) 및 LUT 검증을 대신하지도 않는다.

## 템플릿 배치 렌더링

`render --batch`는 변수 객체의 JSON 배열 또는 `rows` 배열을 가진 객체를 받는다:

```json
{
  "rows": [
    { "name": "alpha", "headline": "Hello" },
    { "name": "beta", "headline": "Welcome" }
  ]
}
```

구성에서 변수를 선언한 뒤 실행한다:

```bash
npx hyperframes render \
  --batch rows.json \
  --output "renders/{name}.mp4" \
  --batch-concurrency 1 \
  --strict-variables
```

배치 규칙:

- `--batch`를 `--variables`나 `--variables-file`과 함께 쓰지 않는다. 각 행이 렌더 한 건의 변수 집합이다.
- `--output`을 생략하면, 행이 서로 고유하도록 생성된 파일명에 `{index}`가 들어간다.
- 출력 템플릿은 `{index}`와 문자, 숫자, `_`, `.`, `-`로 이루어진 행 키를 지원한다. 자리표시자 값은 문자열, 숫자, 불리언이어야 한다. `null`, 객체, 배열은 잘못된 값이다. 누락된 자리표시자와 출력 충돌은 오류다.
- `--batch-concurrency`의 기본값은 `1`이다. 각 render가 이미 워커를 쓰므로 올릴 때는 보수적으로 한다.
- `--batch-fail-fast`는 첫 실패 뒤에 새 작업 스케줄링을 멈춘다. 이 옵션이 없으면 서로 독립적인 행은 계속 실행되고, 실패는 manifest에 그대로 남는다.
- `--strict-variables`는 렌더링 전에 모든 행을 검증하며, 선언된 변수 계약을 어기면 출력을 만들기 전에 중단한다.
- `--json`은 에이전트와 CI에 적합한 진행 이벤트를 출력한다.

명령은 공통 출력 디렉터리에 `manifest.json`을 쓰고, 실행 내내 갱신한다. 각 행의 변수, 상태, 출력, 오류, 시간을 기록한다. 완료의 기준은 manifest에 실패한 행이 없고, 완료된 모든 출력이 존재하며, 비어 있지 않고, 재생 시간이 그럴듯한 것이다.
