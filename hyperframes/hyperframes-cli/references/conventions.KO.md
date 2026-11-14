> AI 번역본. 원본: conventions.md. 분석 근거는 원본이다.

# agent와 CI를 위한 CLI 규칙

- agent와 CI에서 호출할 때는 `--json`을 우선 쓴다. 서버 모드 `render`, `preview`, `play`는 일반적인 JSON 출력을 제공하지 않는다. `preview --selection --json`과 `preview --context --json`은 쿼리 모드 예외다.
- `doctor --json`은 항상 0으로 종료한다. payload로 게이트를 건다:

  ```bash
  npx hyperframes doctor --json | jq -e '.ok' >/dev/null
  ```

- 비-TTY 모드는 자동이며, 가운데 정렬된 빈 composition을 scaffold한다. 이름 있는 예제에서 시작할 때만 `--example`을 넘긴다. TTY에서 플래그만 쓰는 모드를 강제하려면 `--non-interactive`를 쓴다.
- 같은 검증 루프 안의 모든 명령에는 `HYPERFRAMES_RUN_ID` 하나를 쓴다.
- 디스크가 부족하면 `npx hyperframes clean`을 실행한다(먼저 목록을 보려면 `--dry-run`). 실패한 렌더링이 남긴 것과 스스로 다시 만들어지는 유휴 캐시를 지우며, 출력물, 소스, 실행 중인 렌더링이 쓰는 것은 절대 지우지 않는다. 임시 QC 프레임은 temp 디렉터리에 쓰고, 그 디렉터리만 지운다. 관리되는 스냅샷 실행은 최신 10개와 current/latest/rendered 증거를 유지한다. 활성 캡처와 24시간 미만의 실행은 보호된다. 의도한 before/after 증거는 관리 저장소 밖으로 복사해 두고, 보관 기간이 지나기 전에 챙긴다. `.hyperframes`를 통째로 지우지 않는다. 프로젝트 히스토리도 여기에 들어 있다.
- 해당 경고, 변수, CI 조건이 렌더링을 막아야 한다면 `--strict`, `--strict-all`, `--strict-variables`를 쓴다.
- `shader_unbounded_cosine_pow`의 경우, `pow(1 - cosine, exponent)` 전에 cosine을 `[0, 1]`로 clamp한다. 하한만 거는 `max`로는 부족하다. 그다음 영향을 받는 GPU에서 preview와 export를 해서 확인한다. Lint는 정적 shader 식만 인식하며, 소프트웨어 렌더링은 하드웨어에 따라 생기는 잘못된 픽셀을 놓칠 수 있다.
- JSON 경로는 홈 디렉터리를 `$HOME`으로 가린다. 이 가림을 되돌리려고 하지 않는다.
- 호스팅된 클라우드 프로젝트가 200 MB 업로드 한도에 가깝거나 넘으면 `cloud render --dry-run --json`을 쓰고, `references/cloud.md`의 `.hyperframesignore` 조사 절차를 따른다. 크다는 이유만으로 에셋을 무시하지 않는다.
- 검사를 통과했다는 이유만으로 렌더링하지 않는다. 최종 preview에서 멈추고 승인을 기다린다.
