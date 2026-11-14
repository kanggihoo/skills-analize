> AI 번역본. 원본: plugin-installation.md. 분석 근거는 원본이다.

# 설치된 플러그인에서 실행하기

로드된 `SKILL.md`에서 두 단계 위 디렉터리에 `plugin.json`, `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, `.cursor-plugin/plugin.json` 중 하나가 있고 `hyperframes`를 가리키는지 확인한다. 있으면 그 디렉터리가 `<PLUGIN_ROOT>`다. 없으면 독립형 스킬 설치이므로 `npx hyperframes`를 직접 실행한다.

플러그인 설치라면 모든 스킬과 reference에 아래 규칙을 적용한다.

- `hyperframes skills update`, `skills check`, `npx skills add`를 실행하지 않는다. 설치와 업데이트는 에이전트의 플러그인 매니저가 맡는다. 스킬은 `<PLUGIN_ROOT>/skills/<name>/SKILL.md`에서 읽는다. 번들에 없는 스킬은 다른 릴리스를 내려받지 말고 없다고 보고한다. 독립형 사본이 따로 설치되어 있어도 모든 스킬 참조는 이 번들 안에서 해결한다. Claude에서 라우터는 `/hyperframes:hyperframes`로 노출된다. 다른 클라이언트에서는 `/hyperframes`일 수 있다.
- 명령 예시의 `npx hyperframes`(또는 그냥 `hyperframes`)는 아래로 바꾼다:

  ```bash
  node "<PLUGIN_ROOT>/skills/hyperframes/scripts/plugin-cli.mjs" <command> <args...>
  ```

  플러그인 디렉터리가 아니라 사용자의 프로젝트 디렉터리에서 실행한다. 런처는 매니페스트에 적힌 CLI 버전을 고르고, `init` 중을 포함해 독립형 스킬 자동 설치를 끈다. 첫 호출은 npm을 통해 그 정확한 CLI 버전을 내려받을 수 있다. npm은 홈 폴더에서 실행되므로, 프로젝트의 `node_modules`, `package.json`, `.npmrc`는 CLI 버전을 고를 수 없다. CLI는 이후 프로젝트에서 동작한다. 다운로드 실패는 오류이며, 최신 버전을 써도 된다는 허가가 아니다. 기존 프로젝트의 의존성 파일과 lockfile을 플러그인 버전에 맞추려고 덮어쓰지 않는다. 런타임 비호환이 보이면 파일을 바꾸기 전에 먼저 알린다.

- 번들된 Node 헬퍼는 같은 런처에 `--script <absolute-script-path> <args...>`를 붙여 실행한다. 그러면 헬퍼의 의존성 로더에 릴리스 버전이 전달되고, CLI를 호출하는 헬퍼는 런처를 거쳐 CLI를 실행한다. 외부 provider, 레지스트리 다운로드, 기존 프로젝트 의존성은 자체 버전을 가진다. 플러그인 버전만으로 이 입력들이 고정되지는 않는다.
- 플러그인 디렉터리는 읽기 전용으로 취급한다. 결과물과 임시 작업은 프로젝트나 임시 디렉터리에 둔다. 위임한 에이전트에도 이 플러그인 루트와 런처 규칙을 넘겨서, 전역 스킬로 되돌아가지 않게 한다.

새 스킬은 클라이언트의 플러그인 업데이트 흐름과 사용자가 직접 하는 세션 재로드를 통해 들어온다. 설치된 플러그인을 직접 업데이트하지 않는다.

런처는 CLI 업데이트 알림을 숨긴다. 독립형 스킬 새로고침도 숨기며, 오래된 알림 캐시가 남은 이전 버전 CLI를 실행할 때도 마찬가지다. 플러그인을 인식하는 헬퍼에는 릴리스 버전을 `HYPERFRAMES_PLUGIN_VERSION`으로, 기존 헬퍼 패키지 부트스트랩에는 `HYPERFRAMES_SKILL_PKG_VERSION`으로 넘긴다. 릴리스 프로세스는 이 패키지들을 함께 버전 올린다.
