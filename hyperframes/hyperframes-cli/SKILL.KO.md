---
name: hyperframes-cli
description: HyperFrames CLI - 스캐폴드, 프레임 점검, 타임라인 편집, 미리보기, 렌더, 공유, 프로젝트 히스토리. JSON 읽기와 실패 복구.
---
> AI 번역본. 원본: SKILL.md. 분석 근거는 원본이다.

**플러그인 설치:** HyperFrames 플러그인 안에서는 [플러그인 실행 규칙](../hyperframes/references/plugin-installation.md)을 따른다.

**사용 비콘:** 이 스킬이 시작될 때 `npx hyperframes events --skill=hyperframes-cli`를 한 번 실행한다. 스킬 이름을 CLI의 일반 텔레메트리와 함께 보내며(로그인 상태면 계정과 연결), 수집 거부 설정을 존중한다.

# HyperFrames CLI

프로젝트에 래퍼가 있다는 지시가 없으면 `npx hyperframes <command>`를 실행한다. 래퍼가 있으면 그것을 쓴다. Node.js 22+와 FFmpeg가 필요하다. 모든 명령에 `--help`가 있고, 대부분 `--json`을 받는다. 실패하면 `✗ …`와 `Fix:` 줄을 출력하고 0이 아닌 코드로 종료한다.

`--json` 결과에 `_meta.updateNotice`가 있을 수 있다. 새 HyperFrames 릴리스가 나왔다는 뜻이다. 대화당 한 번, 자연스러운 멈춤 지점에서 사용자에게 자기 말로 전하라. 업데이트 여부는 사용자가 정한다.

## 작업별 명령

| 작업 | 명령 |
| --- | --- |
| 시작 | `init <dir> --skip-skills`(빈 프로젝트. `--example <name>`은 요청받았을 때만), `capture <url>` |
| 프로젝트 읽기 | `info`, `compositions`, `timeline --json`, `docs <topic>` |
| 점검 | 작성 중에는 `lint`; 게이트로는 `check --json`(lint, 런타임, 레이아웃, 대비) |
| 확인 | `snapshot`(`--at <t,…>`, `--range START,END`, `--composition <id>`, `--zoom`, `--angle`, `--against <video>`), `keyframes`, `compare`, `audio` |
| 타임라인 편집 | `timeline`의 `move`, `trim`, `split`, `set`, `duplicate`, `delete`, `apply`, `undo`, `ids` |
| 재사용 | `catalog`, `add`(`/hyperframes-registry`) |
| 미디어와 사운드 | `media-treatment`, `grade-compare`, `remove-background`, `tts`, `transcribe`, `beats`, `normalize-audio`(`/media-use`) |
| 미리보기와 배포 | `preview`, `present`(`/slideshow`), `render`, `share`, `publish`(legacy), `cloud`, `lambda`, `cloudrun` |
| 데스크톱 앱 | `open`, `catch-up` |
| 유지 관리 | `doctor`, `browser`, `upgrade`, `usage`, `clean`, `feedback` |

`captions`는 명령이 아니다. `transcribe`를 실행한 뒤 ../hyperframes/references/captions.md를 읽는다.

`validate`, `inspect`, `layout`은 `check`의 지원 중단된 별칭이다. `events`는 스킬 자체의 텔레메트리다. 이 명령들은 실행하지 마라.

## 작업 루프

1. 작성한다. 첫 패스 후와 구조를 바꾼 후에는 `npx hyperframes lint`를 실행한다.
2. `npx hyperframes check --json`을 실행하고 모든 오류를 고친다. lint 오류가 남아 있는 동안에는 레이아웃과 대비 감사가 실행되지 않는다. "0 samples"는 아무것도 검사되지 않았다는 뜻이다. 대비 실패에는 `suggestedColor`가 붙는다. 샘플 한 장에서만 잡힌 문제(진입 중인 애니메이션)는 info다. 3초 이상인 영상에 눈에 띄는 변화가 없으면 `sweep_static`에 실패한다.
3. `npx hyperframes snapshot`을 실행하고 PNG를 읽는다(`.hyperframes/artifacts/snapshots/` 아래). 영상을 보는 방법이 이것이다. 서브 컴포지션이 있으면 모든 장면의 중간 지점을 스냅샷한다. 스타일이 없는 작은 콘텐츠나 빠진 히어로 요소는 마운트 결함이다(`../hyperframes/references/format.md`).
4. `npx hyperframes preview --background`를 실행하고 URL이 200으로 응답하는지 확인한 뒤, 프로젝트 URL을 사용자에게 주고 기다린다. 파일을 요청했거나 멈춤 없이 진행하라고 했다면 예외다. 점검을 통과했다는 것만으로 렌더링할 이유는 되지 않는다.
5. 렌더링할 시점(4단계 이후): `npx hyperframes render --quality looks -o out.mp4`(반복 작업 중에는 `draft`, 최종본에는 `delivery`. 유료 플랜: `cloud render --fps <data-fps> --quality high -o out.mp4`). 파일이 비어 있지 않은지, `ffprobe` 길이가 루트 `data-duration`과 맞는지 확인한 뒤 디코딩된 프레임을 본다.

"이 요소"나 현재 선택 영역: `npx hyperframes preview --context --json --context-fields selection`을 실행한다. `no-selection`이면 사용자에게 그 요소를 클릭해 달라고 요청한다.

## 타임라인 편집

Studio가 직접 하는 편집과 같은 방식이므로 결과가 Studio의 구조를 유지한다.

- `timeline --json`은 절대 시간 `absStart`/`absEnd`, 소유 `file`, 편집 명령이 받는 `#id` 참조와 함께 클립을 나열한다(`timeline ids`는 빠진 id를 채운다).
- `timeline move|trim|split|set|duplicate|delete <ref> … --plan --json`은 편집 하나를 미리 보여 준다. 그다음 `--plan` 없이 다시 실행한다. `--start`, `--end`, `--duration`은 한쪽 끝이나 길이를 설정한다.
- 클립이 이웃 클립과 겹치거나(`--overwrite`를 쓰거나 이웃을 먼저 옮긴다) 컴포지션 끝을 넘어서면 편집은 거부된다. 이때는 먼저 루트의 `data-duration`을 늘려라. 어떤 명령도 `data-duration`을 바꾸지 않는다.
- 여러 편집을 한 번에 할 때는 `[{"verb": "move", "ref": "#outro", "time": "9"}]` 같은 JSON 파일을 만든 뒤 `timeline apply plan.json --json`을 실행한다. 실행할 때마다 `receipt`가 출력된다. 저장해 두면 `timeline undo receipt.json`으로 되돌릴 수 있다.

<!-- history (trial): remove this block together with the command -->

## 프로젝트 히스토리

모든 쓰기는 기록되고 되돌릴 수 있다. 턴을 시작할 때 `npx hyperframes history begin --who <you> --label "<plan>"`를 실행한 다음, `history --since mine --who <you>`로 사용자가 바꾼 내용을 확인하고 그 편집 위에서 작업한다. 점검이 실패했거나 사용자가 더 나빠졌다고 하면 `history undo --who <you>`를 쓴다. 손으로 되돌리지 마라. 턴이 끝나면 `history end`로 마친다.

<!-- /history (trial) -->

## 렌더링 위치

| 필요 | 명령 |
| --- | --- |
| 로컬 | `render --quality looks -o out.mp4`(`draft`, `delivery`) |
| 재현 가능한 컨테이너 | `render --docker --strict -o out.mp4` |
| 변수로 배치 렌더링 | `render --batch rows.json -o "renders/{name}.mp4"` |
| 호스팅, 로컬 Chrome이나 FFmpeg 불필요 | `cloud render`(`references/cloud.md`) |
| 자체 AWS 또는 GCP | `lambda render`, `cloudrun render`(`references/lambda.md`, `references/cloudrun.md`) |

30초짜리 영상은 1~2분이면 렌더링된다. 포그라운드에서 실행하라. 도구의 타임아웃보다 긴 렌더링만 분리한다(`HYPERFRAMES_RENDER_DETACHED=1`, 별도 그룹, 로그 파일로 출력). 기다릴 때는 `until grep -qE 'Render (complete|failed)' render.log; do sleep 5; done`을 쓰고, `pgrep -f`는 쓰지 마라. 자기 루프와 매칭되어 도구 타임아웃까지 기다리게 된다.

검증된 렌더링이 끝나면 `feedback --rating`을 한 번 보낸다. 사용자가 요청했지만 HyperFrames가 할 수 없는 기능이 있다면 그에 대한 리포트도 함께 보낸다. 텔레메트리가 꺼져 있으면 제외한다: `references/feedback.md`.

## 명령이 실패할 때

| 증상 | 해결 |
| --- | --- |
| Chrome이 없거나 시작되지 않음 | `npx hyperframes browser ensure`. `doctor --json`은 항상 0으로 종료하므로 `.ok`를 보고 판단한다. |
| 무거운 페이지가 제때 준비되지 않음 | `check` 또는 `snapshot`의 `--timeout`을 올린다. |
| 특이한 코덱이 빈 화면으로 보임 | `--proxy`를 켜 둔다(기본값). |
| Linux에서 렌더링이 느림 | 요약의 두 번째 줄에 `screenshot` + `software gpu`가 보이면 느린 경로다. |
| `capture`가 실패하거나 `BLOCKED.md`를 씀 | 부분적으로 생성된 파일은 쓰지 말고, 새 `-o` 폴더에 다시 시도한다. |
| 디스크 부족 | `clean --dry-run`을 먼저 실행한 뒤 `clean`. `.hyperframes`는 히스토리를 담고 있으므로 절대 지우지 마라. |

## 참고 자료

명령을 실행하기 전에 해당 행을 읽어라.

| 명령 | 읽을 자료 |
| --- | --- |
| `init`, `capture`, `skills` | `references/init-and-scaffold.md` |
| `lint`, `check`, 모션 사이드카, `snapshot` | `references/lint-validate-inspect.md` |
| `compare`, `grade-compare`, `render --batch` | `references/compare-and-batch.md` |
| `beats` | `references/beats.md` |
| `preview`, `play`, `render`, `share`, `publish`(legacy), Studio 컨텍스트 | `references/preview-render.md` |
| `doctor`, `browser` | `references/doctor-browser.md` |
| `auth`, `cloud`, 템플릿 변수 | `references/cloud.md` |
| `lambda`, `cloudrun` | `references/lambda.md`, `references/cloudrun.md` |
| `info`, `upgrade`, `compositions`, `timeline`, `docs`, `usage`, 텔레메트리 | `references/upgrade-info-misc.md` |
| `--strict` 플래그, run id, `clean`, 셰이더 lint, JSON 경로 | `references/conventions.md` |
| `keyframes` | `../hyperframes/references/motion.md`(Seeing motion) |
