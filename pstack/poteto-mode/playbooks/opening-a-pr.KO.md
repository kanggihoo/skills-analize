### PR 열기

다른 모든 playbook의 끝에서 호출된다.

**Worktree.** main에서 분기한 git worktree에서 작업한다. Subagent는 이것을 상속한다. 같은 브랜치에 여러 `Task` 호출을 하면 각각 자신의 worktree를 갖거나, 그 사이에 `git fetch && git reset --hard origin/<branch>`를 한다. 관련 없는 작업이 섞인 더러운 브랜치는 패치로 빼내고, 새 worktree를 만든 뒤 적용한다. 꼬인 worktree는 main에서 리셋하고 최소한으로 다시 한다.

**커밋.** 커밋은 자주 한다. PR을 열기 전에 작고 순서가 있는 커밋으로 rebase한다. 각 커밋은 미래의 PR이다. 착지 가능하고, 이야기를 전달하도록 순서를 정한다. 수정이 방금 만든 커밋에 속하면 amend하고, 분리될 수 있으면 새 커밋을 만든다.

**PR.** 커밋 전에 diff 위에서 `cursor-team-kit`의 `/deslop`을 실행한다. 리뷰 전에 `/no-comments`를 실행한다. 모든 PR 제목, PR 설명, 커밋 본문은 `/technical-writing`으로 쓰고, 그다음 `/unslop`을 적용한다. Diátaxis를 제외한 모든 technical-writing 계층을 적용한다. 행동마다 단어 하나를 쓰고, 관사는 유지하며, 평이한 동사가 있으면 `-ing`를 피한다.

**제목.** Conventional Commits 형식 `type(scope): subject`를 쓴다. 타입은 `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf` 중 하나를 쓴다. 스코프는 `pstack`이나 `poteto-mode`처럼 바뀐 영역을 쓴다. 제목은 짧고 명령형으로 쓴다. 변경을 담고 있는 실제 심볼이 있으면 이름을 쓴다. 예를 들면 `fix(pstack): retarget opening-a-pr babysit trigger`다. 끝에 마침표를 붙이지 않는다.

**설명.** PR 본문은 실험 노트가 아니라 브리핑이다. diff를 가진 리뷰어가 1분 안에 변경이 왜 존재하는지, 무엇을 빼 두었는지, 무엇을 깨뜨릴 수 있는지, 그리고 어떻게 동작함을 증명했는지 알 수 있어야 한다. 짧고 단순한 문장을 쓰고 식별자는 적게 쓴다. 벽처럼 긴 글을 쓰지 않는다. squash 커밋 본문이 곧 PR 본문이다. 본문 때문에 squash 커밋이 약 40줄을 넘는다면, 본문을 줄인다.

각 섹션은 굵은 리드인이 아니라 `##` 제목 아래에 둔다. 섹션이 서로 구분되도록 하기 위함이다. 이 섹션들을 순서대로 쓴다. 할 말이 없는 섹션은 뺀다.

- `## Why`는 문제와 접근법을 짧은 문장 한두 개로 적는다. SHA나 rebase 계보를 나열하지 않는다. "based on main" 같은 서두를 달지 않는다.
- `## What changed`는 짧은 글머리 기호 한두 개에서 세 개까지 담는다. 변경을 담고 있을 때만 실제 심볼이나 경로를 쓴다. 이름 변경이나 재지정이라면 양쪽을 모두 쓴다.
- `## Scope`는 항상 PR이 다루는 것과 일부러 빼 둔 것을 말한다. 예를 들면 관련 후속 작업이나 알려진 공백이다. 짧은 항목 한 개에서 세 개까지 쓴다. 심볼이나 경로를 나열하지 않으며, 파일별로 길게 쓰지 않는다.
- `## Tradeoffs`는 리뷰어가 물어볼 만한, 거부한 대안만 적는다. 실제 선택이 없었다면 이 섹션을 건너뛴다.
- `## Blast Radius`는 변경이 누구 또는 무엇에 닿는지, 그리고 왜 그것이 안전하거나 위험한지를 한두 문장으로 적는다. main이 빨갛다면, 그대로 두었을 때의 비용을 명시한다.
- `## Verification`은 글머리 기호 한 개에서 세 개까지 담는다. 각 항목은 실제 실행 경로와 그 결과를 적는다. 성능 변경이라면 단위가 붙은 대표 수치 하나를 `before → after` 형식으로 보고한다. 나머지 증거는 arena나 swarm 디렉터리 링크로 건넨다. 표본 크기 방법론, swarm 설명, 지표 표는 넣지 않는다.

이 섹션들 뒤에, 주장을 증명할 때에만 영상이나 스크린샷을 붙인다. 전체 SHA, swarm이나 arena 레인 설명, 레버 보정 에세이, 파일별 체크리스트, "CLEAN" 판정은 붙여 넣지 않는다. 이런 세부 사항은 링크된 산출물에 둔다. 커밋 본문은 제목을 다시 말하지 않는다.

**Forge.** 첫 PR 작업 전에 forge를 결정하고, 생성, 수정, 조회, 감시, 병합 전 과정에서 그 선택을 유지한다. 기본은 GitHub CLI(`gh`)다. `command -v origin`이 성공하고 Origin이 저장소를 해석할 수 있으면 `origin pr ...`를 우선한다. Origin이 없거나 저장소를 해석할 수 없으면 `gh`를 유지하고 대체 사용을 기록한다. Graphite(`gt`)는 요구하지 않는다.

**내장 PR 도구.** 실행 환경이 내장 PR 도구를 제공하면, 생성, 수정, 재지정, ready 표시는 그 도구로만 하고 forge CLI로는 하지 않는다. 도구 자체 지침이 방법을 설명한다. CLI로 만든 PR은 도구가 추적하는 것, 예를 들어 나중 실행이 편집할 수 있는 설명을 놓친다. 도구가 다루지 않는 작업은 해석된 forge로 하며, 실행 환경에 그런 도구가 없으면 모든 PR 작업을 forge로 한다.

**크기와 스택.** 큰 PR 하나보다 좁은 PR 다섯 개를 선호한다. 스택은 base 브랜치의 체인이다. 루트 PR은 trunk를 대상으로 한다. 각 자식 브랜치는 부모의 정확한 tip 위로 rebase하고, 그 PR은 부모 브랜치를 대상으로 한다. 내장 PR 도구가 없으면, forge에 따라 `origin pr create --status open --base <parent-branch>` 또는 `gh pr create --base <parent-branch>`로 자식을 만들고, 기존 자식을 재지정하려면 `origin pr edit <pr> --base <parent-branch>` 또는 `gh pr edit <pr> --base <parent-branch>`를 쓴다. trunk에서 분기하는 것은 독립적인 작업에만 한다. 상당한 스택 작업을 하기 전에 trunk 위로 rebase한다.

**Ready 상태.** 모든 PR은 draft가 아니라 ready 상태로 연다. 내장 PR 도구는 기본값이 draft일 수 있으므로, 그 도구로 생성하는 모든 호출에 `draft: false`를 설정한다. Origin에서는 `--status open`을 넘긴다. `gh`에서는 `--draft`를 생략한다. PR이 여전히 draft로 열렸다면, PR 도구로 ready 표시하거나, 해석된 forge에 따라 `origin pr ready <number>` 또는 `gh pr ready <number>`를 실행한다. PR 상태를 말하기 전에 `origin pr view <number>` 또는 `gh pr view <number>`를 실행한다.

**Babysit.** PR을 연다고 babysit이 시작되지는 않는다. PR URL을 게시하고 계속 빌드한다. 단계나 스택을 먼저 끝낸다. 스택 전체가 존재한 뒤 사용자가 요청할 때에만 별도의 babysit 패스를 실행한다. 새 PR마다 babysit을 돌리면 빌드가 멈추고, 이후 웨이브가 다시 시작할 커밋에 검사를 소모한다. 피드백이 의도에서 벗어나면 되돌려 말한다.

PR을 여는 subagent는 `interrogate`, `/deslop`, `/no-comments`를 실행하고, URL을 게시한다. 그런 다음 Autopilot-full이나 Autopilot-stack의 소유자가 아니라면 babysit하지 않고 부모에게 돌아간다. 그 소유자의 브리프는 babysit 루프를 맡기며, 이것이 `playbooks/babysit.md`가 기다리는 요청이다. 소유자는 code-ready 보고 후 루프를 시작하고, playbook이 말하는 대로 merge-ready나 STACK-READY를 보고한다. 전체 스택이 만들어질 때까지 babysit을 보류하는 이 playbook과 `playbooks/babysit.md`의 규칙은 그 소유자에게는 적용되지 않는다.
