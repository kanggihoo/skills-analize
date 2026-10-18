# imagegen 분석

## 원본

- 원본 경로: `.agents/skills/imagegen/`
- 핵심 파일: `SKILL.md`
- 보조 파일: `references/`, `scripts/image_gen.py`, `agents/openai.yaml`, `assets/`
- 확인한 규모: 11개 파일, 약 2,158줄
- 성격: 이미지 생성/편집 요청을 built-in `image_gen` 도구로 처리하고, 사용자가 명시적으로 요청할 때만 OpenAI Image API CLI fallback을 쓰는 스킬

## 적용 조건

이 스킬은 raster 이미지가 필요한 작업에 동작한다.

대표 요청은 다음과 같다.

- 새 이미지 생성: hero image, 제품 사진, 게임 asset, mockup, infographic, concept art
- 기존 이미지 편집: 배경 교체, object removal, style transfer, lighting/weather 변경, transparent background
- reference image를 기반으로 새로운 이미지 생성
- 여러 이미지 variant 또는 batch asset 생성

다음 경우에는 사용하지 않는다.

- SVG, 아이콘 시스템, 로고 시스템, HTML/CSS/canvas로 직접 만드는 편이 맞는 작업
- 기존 repo-native vector asset을 확장하는 작업
- 사용자가 deterministic code-native output을 원하는 작업

## 최상위 모드

이 스킬은 모드를 두 개로 명확히 나눈다.

1. 기본 built-in tool mode
   - 기본 경로다.
   - `image_gen` 도구를 사용한다.
   - `OPENAI_API_KEY`가 필요하지 않다.
   - 일반 이미지 생성/편집 요청은 모두 이 경로를 쓴다.

2. fallback CLI mode
   - 사용자가 명시적으로 CLI 사용을 요청한 경우에만 쓴다.
   - `.agents/skills/imagegen/scripts/image_gen.py`를 사용한다.
   - `OPENAI_API_KEY`와 네트워크 접근이 필요하다.
   - `generate`, `edit`, `generate-batch` subcommand를 제공한다.

중요한 점은 built-in 도구 실패 시 자동으로 CLI로 넘어가지 않는다는 것이다. 실패하면 CLI fallback이 있고 API key가 필요하다고 설명한 뒤, 사용자가 명시적으로 요청할 때만 진행한다.

## 동작 과정

1. 이미지 작업이 맞는지 판단한다.
   raster asset이 필요한지, 아니면 SVG/HTML/CSS/canvas로 처리하는 편이 맞는지 먼저 구분한다.

2. top-level mode를 결정한다.
   기본은 built-in `image_gen`이며, CLI fallback은 사용자가 직접 요청한 경우에만 허용한다.

3. intent를 `generate` 또는 `edit`로 분류한다.
   기존 이미지를 보존하면서 일부를 바꾸면 edit, reference만 제공하고 새 이미지를 원하면 generate다.

4. 입력 이미지의 역할을 라벨링한다.
   각 이미지를 edit target, reference image, style reference, compositing input 등으로 명시한다.

5. 로컬 파일을 built-in edit 대상으로 써야 하면 먼저 `view_image`로 대화 컨텍스트에 로드한다.
   built-in tool이 임의 filesystem path를 직접 편집한다고 가정하지 않는다.

6. prompt를 구조화한다.
   use case, asset type, primary request, scene, subject, style, composition, lighting, palette, text, constraints, avoid 등을 필요한 만큼 쓴다.

7. 사용자의 prompt가 구체적이면 정리만 하고, 너무 일반적이면 결과 품질에 실질적으로 도움이 되는 수준만 보강한다.

8. built-in `image_gen`을 호출한다.
   여러 asset이나 variant가 필요하면 built-in 호출을 반복한다. built-in 경로에서 `generate-batch`라는 별도 top-level mode로 취급하지 않는다.

9. 결과를 확인한다.
   subject, style, composition, text accuracy, 보존해야 할 invariant가 지켜졌는지 점검한다.

10. project-bound asset이면 workspace 안으로 복사하거나 이동한다.
    프로젝트에서 참조할 asset을 `$CODEX_HOME/generated_images/...`에만 남겨두면 안 된다.

11. 최종 경로, 사용한 prompt, built-in 또는 CLI 모드 사용 여부를 보고한다.

## CLI fallback 동작

`scripts/image_gen.py`는 명시적 fallback 전용 CLI다.

제공 subcommand는 다음과 같다.

- `generate`: prompt로 새 이미지 생성
- `edit`: 하나 이상의 입력 이미지를 편집
- `generate-batch`: JSONL 입력으로 여러 generation job을 비동기 실행

주요 인자는 다음과 같다.

- 공통: `--model`, `--prompt`, `--prompt-file`, `--n`, `--size`, `--quality`, `--background`, `--output-format`, `--output-compression`, `--moderation`, `--out`, `--out-dir`, `--force`, `--dry-run`
- prompt 보강: `--use-case`, `--scene`, `--subject`, `--style`, `--composition`, `--lighting`, `--palette`, `--materials`, `--text`, `--constraints`, `--negative`
- batch: `--input`, `--concurrency`, `--max-attempts`, `--fail-fast`
- edit: `--image`, `--mask`, `--input-fidelity`
- 후처리: `--downscale-max-dim`, `--downscale-suffix`

CLI는 dry-run이면 API 호출 없이 payload와 출력 경로를 출력한다. 실제 호출 시 OpenAI client를 생성해 `/v1/images/generations` 또는 `/v1/images/edits`에 요청하고, 응답의 `b64_json` 이미지를 파일로 디코딩한다.

`generate-batch`는 JSONL job을 읽고, concurrency semaphore로 동시 실행을 제한하며, rate limit이나 transient error에 retry logic을 적용한다.

## prompt 체계

스킬은 요청을 다음 use-case taxonomy로 분류한다.

- Generate: `photorealistic-natural`, `product-mockup`, `ui-mockup`, `infographic-diagram`, `logo-brand`, `illustration-story`, `stylized-concept`, `historical-scene`
- Edit: `text-localization`, `identity-preserve`, `precise-object-edit`, `lighting-weather`, `background-extraction`, `style-transfer`, `compositing`, `sketch-to-render`

prompt 원칙은 다음과 같다.

- 자연어 문장과 짧은 label block을 사용한다.
- scene/backdrop -> subject -> details -> constraints 순서로 정리한다.
- 이미지 안의 텍스트는 따옴표로 정확히 적고, 필요한 경우 spelling까지 지정한다.
- edit에서는 “change only X; keep Y unchanged”를 반복해 drift를 줄인다.
- reference 이미지는 index와 역할을 분명히 적는다.

## 핵심 규칙

- 기본 실행 경로는 built-in `image_gen` 도구다.
- CLI fallback은 사용자가 명시적으로 요청한 경우에만 사용한다.
- 기존 이미지를 일부 수정하는 요청은 edit로, reference만 활용해 새 이미지를 만드는 요청은 generate로 분류한다.
- 로컬 이미지를 built-in edit 대상으로 사용할 때는 먼저 `view_image`로 대화 컨텍스트에 올린다.
- 입력 이미지가 여러 개면 각 이미지의 역할을 반드시 라벨링한다.
- project-bound asset은 최종적으로 workspace 안에 저장해야 한다.
- 기존 asset overwrite는 명시적 요청이 있을 때만 허용한다.

## 산출물 특성

정상 산출물은 다음 중 하나다.

- 대화에 inline으로 표시되는 preview 이미지
- workspace에 저장된 프로젝트 asset
- CLI fallback 사용 시 `output/imagegen/` 아래 이미지 파일
- batch 사용 시 여러 이미지 파일과 선택된 final asset
- 최종 prompt와 저장 경로 보고

## 주의점

- built-in `image_gen`에는 CLI 전용 옵션인 `quality`, `input_fidelity`, mask path, output format, output path를 일반 인자로 가정하면 안 된다.
- CLI fallback은 자동 사용 금지다. 사용자가 명시적으로 선택해야 한다.
- `scripts/image_gen.py`는 수정하지 말아야 한다. 기능이 부족하면 사용자에게 먼저 물어야 한다.
- 기존 파일을 덮어쓰려면 사용자의 명시적 요청이 필요하다. 기본은 sibling versioned filename을 만든다.
- project code가 참조하는 asset은 반드시 workspace에 있어야 한다.
