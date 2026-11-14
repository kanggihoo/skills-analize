> AI 번역본. 원본: skill-lifecycle.md. 분석 근거는 원본이다.

# 스킬 설치와 최신 상태

사용자가 스킬 설치나 업데이트를 묻거나, 스킬이 예상과 다르게 동작하는 원인을 찾거나, CI에 HyperFrames를 설정할 때 이 reference를 읽는다(아래 `HYPERFRAMES_SKIP_SKILLS` 참고). 스킬은 CLI와 함께 버전이 매겨진다. 설치, 업데이트, 제거는 사용자가 직접 하는 단계다. 무엇이 오래되었고 어떤 명령이 맞는지 알려 주고, 직접 실행하지 않는다.

플러그인 설치라면 [플러그인 실행 규칙](plugin-installation.KO.md)을 따른다. 플러그인 매니저가 업데이트를 맡고, 모든 스킬이 번들에 들어 있다. 아래 명령은 독립형 스킬에만 적용된다.

- **핵심 세트:** `/hyperframes`, `/hyperframes-cli`, `/hyperframes-registry`, `/media-use`, `/reverse-any-video`, `/style-sampling`.
- **필요할 때 설치:** `/figma`, `/slideshow`, `/remotion-to-hyperframes`. 사용자가 `npx hyperframes skills update <name>`으로 설치한다.

## `init`이 하는 일

`--skip-skills` 없이 `npx hyperframes init`을 실행하면, 핵심 세트가 없을 때만 설치하고 이미 설치된 스킬은 그대로 둔다. 새로고침, 교체, 제거는 하지 않는다. 핵심 세트 설치는 사용자가 할 일이므로, `init`을 실행할 때는 항상 `--skip-skills`를 준다. 핵심 스킬이 없으면 사용자에게 `npx hyperframes skills update`를 실행하라고 한다. 이 명령은 이미 설치된 스킬도 함께 업데이트한다. 오프라인이나 요청 제한으로 확인이 실패해도 우아하게 넘어가며, 프로젝트 골격 생성은 실패하지 않는다.

`--skip-skills`를 주면 `init`은 스킬을 건드리지 않는다. `HYPERFRAMES_SKIP_SKILLS=1`은 CI와 테스트에서 같은 효과를 낸다.

`HYPERFRAMES_SKIP_SKILLS=1`은 `skills update`(이름 유무와 관계없이)와 이름 없는 `skills`도 설치 없이 종료 코드 0으로 끝내게 한다. 그래서 한 커밋에 고정된 설치가 그대로 유지된다.

## 오래된 스킬 알림

`render`, `lint`, `validate` 뒤에 캐시된 확인에서 오래되었거나 없는 스킬이 발견되면, CLI는 stderr에 `N HyperFrames skills out of date or missing`을 출력한다. 터미널 없이 도는 에이전트 실행도 이 알림을 본다. CI, dev 환경, `HYPERFRAMES_NO_UPDATE_CHECK=1`, `HYPERFRAMES_SKIP_SKILLS=1`에서는 꺼진다. `--json`과 함께 실행해도 나온다. stderr에만 쓰고 `--json` stdout은 건드리지 않기 때문이다.

## 진단과 사용자가 실행할 명령

```bash
npx hyperframes skills check
npx hyperframes skills check --json
```

오래된 결과를 전달할 때 알려 줄 사용자의 설치와 업데이트 명령:

```bash
npx hyperframes skills update           # 사용자가 실행한다
npx hyperframes skills update <name>    # 사용자가 실행한다
npx hyperframes skills                  # 사용자가 실행한다
```

- 설치된 스킬이 오래되었거나 핵심 세트가 불완전하면 `skills check`는 0이 아닌 코드로 끝난다. 필요할 때 설치할 수 있지만 아직 설치하지 않은 스킬은 실패가 아니다.
- 이름 없는 `skills update`는 핵심 세트와 이미 설치된 HyperFrames 스킬을 새로고침한다. 스킬을 제거하지 않으며, 설치 기록상 다른 배포자의 스킬은 이름이 우리 것과 같아도 건드리지 않는다.
- 이름을 준 `skills update <name...>`은 그 스킬들도 함께 설치한다.
- 이름 없는 `skills`는 게시된 전체 세트를 명시적으로 설치한다.

HyperFrames CLI를 쓸 수 없으면, 사용자는 `npx skills add heygen-com/hyperframes --skill <name>`으로 스킬 하나를, `npx skills add heygen-com/hyperframes --all`로 게시된 전체 세트를 설치할 수 있다.

CLI는 `render`, `lint`, `check` 중에 오래된 스킬을 알리는 한 줄을 출력할 수 있다. 사용자에게 전달하고, 설치된 스킬을 기준으로 계속 작업한다. 기억에 남은 스킬을 근거로 진행하지 않는다.

## 프로젝트의 CLI를 최신으로 유지하기

스캐폴딩된 프로젝트는 `package.json` 스크립트에 `hyperframes@<version>`을 고정해 렌더가 재현 가능하게 한다. 이 고정은 스스로 올라가지 않으며, 오래된 CLI가 고정된 상태로 실행되어도 경고가 나오지 않는다. 고정된 스크립트가 있는 프로젝트를 이어서 작업할 때는, 렌더에 영향을 주는 첫 명령 전에 한 번 확인한다:

```bash
npx hyperframes@latest upgrade --project . --check
```

이 확인은 읽기 전용이며, 고정 버전을 최신 릴리스와 비교해 보여 준다. `.`을 그대로 둔다. 구버전 CLI에서는 `--project` 뒤에 `.`이 없으면 다음 플래그가 디렉터리 값으로 소비된다. 프로젝트가 뒤처졌다고 나오거나, 이미 나온 CLI 출력(고정 스크립트의 `This project pins hyperframes@… (latest …)` stderr 알림, 또는 `--json` 결과의 `_meta.updateAvailable: true`)이 그렇게 말하면, `npx hyperframes@latest upgrade --project .`로 적용하고, `npx hyperframes check`로 검증한다. 검증이 통과하면 프로젝트의 composition이 새 버전에서도 유효하다는 뜻이다. 렌더 결과가 이전 고정 버전과 프레임 단위로 같다는 뜻은 아니다. 그래서 버전 올림은 조용히 넘기지 않고, 실행 요약에 이전 버전과 새 버전을 함께 적는다. Composition이 아직 없는 프로젝트는 검증이 필요 없다. 검증이 실패하면 `package.json` 변경을 되돌리고, 고정된 버전을 유지한 채 계속 진행하며, 프로젝트가 어느 버전에 머무는지와 그 이유를 보고한다. 이 신호는 사용자에게 전달만 하지 말고 바로 처리한다. 검증되지 않은 올린 버전을 방치하지 않는다.
