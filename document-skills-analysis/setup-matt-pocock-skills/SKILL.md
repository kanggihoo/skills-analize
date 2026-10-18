---
name: setup-matt-pocock-skills
description: 엔지니어링 스킬을 사용하기 위해 이 리포지토리를 설정합니다 — 이슈 트래커, 분류(triage) 라벨 어휘, 도메인 문서 레이아웃을 구성합니다. 다른 엔지니어링 스킬을 최초 사용하기 전에 한 번 실행하세요.
disable-model-invocation: true
---

# Matt Pocock's Skills 설정 (Setup Matt Pocock's Skills)

엔지니어링 스킬들이 전제하는 리포지토리별 설정을 스캐폴딩(scaffold)합니다:

- **이슈 트래커 (Issue tracker)** — 이슈가 위치하는 곳 (기본값: GitHub, 현지 마크다운 파일 방식도 기본 지원)
- **분류 라벨 (Triage labels)** — 5가지 표준 분류 역할에 사용되는 라벨 문자열
- **도메인 문서 (Domain docs)** — `CONTEXT.md` 및 ADR이 위치하는 곳과 이를 읽기 위한 소비 규칙

이 스킬은 결정론적 스크립트가 아닌 프롬프트 기반 스킬입니다. 현황을 탐색하고, 발견한 내용을 제시한 후, 사용자에게 확인을 받고 작성하세요.

## 프로세스 (Process)

### 1. 탐색 (Explore)

현재 리포지토리를 살펴보고 초기 상태를 파악하세요. 추측하지 말고 존재하는 모든 항목을 읽으세요:

- `git remote -v` 및 `.git/config` — GitHub 리포지토리인가? 어느 리포지토리인가?
- 리포지토리 루트의 `AGENTS.md` 및 `CLAUDE.md` — 둘 중 하나가 존재하는가? 이미 `## Agent skills` 섹션이 포함되어 있는가?
- 리포지토리 루트의 `CONTEXT.md` 및 `CONTEXT-MAP.md`
- `docs/adr/` 및 모든 `src/*/docs/adr/` 디렉토리
- `docs/agents/` — 이 스킬의 이전 출력물이 이미 존재하는가?
- `.scratch/` — local-markdown 이슈 트래커 컨벤션이 이미 사용 중이라는 신호
- `triage` 스킬이 설치되어 있는가? (이 스킬과 함께 있는 `triage` 스킬 폴더 또는 이용 가능한 스킬 목록 내 `triage` 유무). 이에 따라 섹션 B의 실행 여부가 결정됩니다.
- 모노레포 신호 — `pnpm-workspace.yaml`, `package.json` 내 `workspaces` 필드, 또는 자체 `src/`를 가진 `packages/*` 항목. 진정으로 규모가 큰 다중 패키지 리포지토리에만 존재합니다. 이것이 없다는 것은 거의 모든 리포지토리가 해당하는 단일 컨텍스트(single-context)를 의미합니다.

### 2. 발견 사항 제시 및 질의 (Present findings and ask)

존재하는 것과 누락된 것을 요약하세요. 그 후 각 섹션을 순서대로 진행하세요 — 한 섹션에 대해 하나의 답변을 받고 다음으로 이동합니다.

사용자가 한 단어로 수락할 수 있도록 추천 답변을 각 섹션의 제일 앞에 제시하세요. 선택 항목이 실제로 갈라질 때만 한 줄 설명을 제공하고, 탐색을 통해 이미 결정된 경우 섹션 전체를 건너뛰세요 (`triage`가 설치되지 않은 경우 섹션 B 건너뜀, 모노레포가 아닌 경우 섹션 C 건너뜀).

**섹션 A — 이슈 트래커.**

> 설명: "이슈 트래커"는 이 리포지토리의 이슈들이 기록되는 장소입니다. `to-tickets`, `triage`, `to-spec`, `qa`와 같은 스킬들이 이곳에서 읽고 씁니다 — 이 스킬들은 `gh issue create`를 호출해야 하는지, `.scratch/` 아래에 마크다운 파일을 작성해야 하는지, 아니면 사용자가 설명하는 다른 워크플로우를 따라야 하는지 알아야 합니다. 이 리포지토리의 작업을 실제로 추적하는 장소를 선택하세요.

기본 자세: 이 스킬들은 GitHub을 위해 설계되었습니다. `git remote`가 GitHub을 가리키고 있다면 GitHub을 제안하세요. `git remote`가 GitLab(`gitlab.com` 또는 자체 호스팅)을 가리키고 있다면 GitLab을 제안하세요. 그 외의 경우(또는 사용자가 선호하는 경우) 다음을 제공하세요:

- **GitHub** — 이슈가 리포지토리의 GitHub Issues에 위치함 (`gh` CLI 사용)
- **GitLab** — 이슈가 리포지토리의 GitLab Issues에 위치함 ([`glab`](https://gitlab.com/gitlab-org/cli) CLI 사용)
- **Local markdown** — 이슈가 이 리포지토리의 `.scratch/<feature>/` 아래 파일로 위치함 (개인 프로젝트나 리모트가 없는 리포지토리에 적합)
- **기타** (Jira, Linear 등) — 사용자에게 한 단락으로 워크플로우를 설명하도록 요청하세요; 스킬이 자유 형식 텍스트로 기록합니다

선택 사항을 `docs/agents/issue-tracker.md`에 기록하세요. GitHub 및 GitLab 템플릿에는 "요청 창구로서의 PR" 플래그가 포함되어 있으며 기본값은 **off**입니다 — 건너뛰고 제기하지 마세요; 외부 PR을 분류 큐에 포함하려는 사용자는 나중에 파일에서 플래그를 직접 변경할 수 있습니다.

**섹션 B — 분류 라벨 어휘.** `triage` 스킬이 설치되지 않은 경우(탐색으로 파악됨) 이 섹션 전체를 건너뛰세요 — 설치되지 않은 스킬에는 라벨이 필요 없습니다.

설치된 경우 정확히 한 가지 질문을 하세요:

> 기본 분류(triage) 라벨을 유지하시겠습니까? (추천: **yes**)

기본값은 5가지 표준 역할이며, 각 라벨 문자열은 역할 이름과 동일합니다: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. **yes** 답변 시 그대로 작성하세요. 사용자가 no라고 답할 때만(보통 기존 트래커에서 `needs-triage` 대신 `bug:triage`와 같은 다른 이름을 사용 중인 경우) 재정의 값을 수집하여 `triage`가 중복 라벨을 만드는 대신 기존 라벨을 적용하도록 하세요.

**섹션 C — 도메인 문서.** 기본값은 **단일 컨텍스트(single-context)**입니다 — 리포지토리 루트의 하나의 `CONTEXT.md` + `docs/adr/`. 거의 모든 리포지토리에 적합하므로 묻지 않고 작성하세요.

탐색을 통해 모노레포 신호를 발견한 경우에만 **다중 컨텍스트(multi-context)** — 각 컨텍스트별 `CONTEXT.md` 파일들을 가리키는 루트 `CONTEXT-MAP.md` — 를 제안하세요. 그 후 원하는 레이아웃을 확인받으세요.

### 3. 확인 및 수정 (Confirm and edit)

사용자에게 다음 초안을 보여주세요:

- `CLAUDE.md` / `AGENTS.md` 중 수정 대상 파일에 추가할 `## Agent skills` 블록 (선택 규칙은 4단계 참조)
- `docs/agents/issue-tracker.md`, `docs/agents/domain.md`, 그리고 `docs/agents/triage-labels.md`의 내용 (`triage`가 설치된 경우에만 마지막 파일 포함)

작성하기 전에 사용자가 수정할 수 있도록 하세요.

### 4. 파일 작성 (Write)

**수정할 파일 선택:**

- `CLAUDE.md`가 존재하면 이를 수정하세요.
- 그렇지 않고 `AGENTS.md`가 존재하면 이를 수정하세요.
- 둘 다 존재하지 않는 경우 사용자에게 어떤 파일을 생성할지 물어보세요 — 임의로 선택하지 마세요.

`CLAUDE.md`가 이미 존재하는 경우 `AGENTS.md`를 절대 생성하지 마세요 (반대의 경우도 마찬가지) — 항상 이미 존재하는 파일을 수정하세요.

선택한 파일에 `## Agent skills` 블록이 이미 존재하는 경우, 중복으로 덧붙이지 말고 해당 위치의 내용을 갱신하세요. 주변 섹션에 대한 사용자 편집 내용을 덮어쓰지 마세요.

블록 형태:

```markdown
## Agent skills

### Issue tracker

[이슈가 추적되는 위치에 대한 한 줄 요약]. `docs/agents/issue-tracker.md` 참조.

### Triage labels

[라벨 어휘에 대한 한 줄 요약]. `docs/agents/triage-labels.md` 참조.

### Domain docs

[레이아웃에 대한 한 줄 요약 — "single-context" 또는 "multi-context"]. `docs/agents/domain.md` 참조.
```

`triage`가 설치되어 섹션 B가 실행된 경우에만 `### Triage labels` 서브 블록을 포함하고 `docs/agents/triage-labels.md`를 작성하세요. 그렇지 않은 경우 둘 다 생략됩니다.

그런 다음 이 스킬 폴더의 시드 템플릿을 시작점으로 사용하여 문서 파일들을 작성하세요:

- [issue-tracker-github.md](./issue-tracker-github.md) — GitHub 이슈 트래커
- [issue-tracker-gitlab.md](./issue-tracker-gitlab.md) — GitLab 이슈 트래커
- [issue-tracker-local.md](./issue-tracker-local.md) — local-markdown 이슈 트래커
- [triage-labels.md](./triage-labels.md) — 라벨 매핑 (`triage`가 설치된 경우에만)
- [domain.md](./domain.md) — 도메인 문서 소비 규칙 + 레이아웃

"기타" 이슈 트래커의 경우 사용자의 설명을 바탕으로 `docs/agents/issue-tracker.md`를 처음부터 작성하세요.

### 5. 완료 (Done)

사용자에게 설정이 완료되었으며 어떤 엔지니어링 스킬들이 이제 이 파일들을 읽게 되는지 알리세요. 나중에 `docs/agents/*.md`를 직접 수정할 수 있음을 언급하세요 — 이슈 트래커를 전환하거나 처음부터 다시 시작하려는 경우가 아니라면 이 스킬을 재실행할 필요가 없습니다.
