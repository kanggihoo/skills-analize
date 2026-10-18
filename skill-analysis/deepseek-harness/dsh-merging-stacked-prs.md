# dsh-merging-stacked-prs 분석

## 1. 개요
- 원본 경로: `/Users/kkh/Desktop/skills-analize/deepseek-harness/dsh-merging-stacked-prs/`
- 컬렉션: deepseek-harness
- 디렉터리 전수 조사 결과 (`find . -type f`): 파일은 1개뿐이다.
| 파일 | 크기 | 줄 수 | 역할 |
|---|---|---|---|
| `SKILL.md` | 7,839 bytes | 127줄 | 스킬 본문 전부 (frontmatter + 절차 + 체크리스트) |
| `references/` | 없음 | - | 디렉터리 자체가 존재하지 않음 |
| `scripts/` | 없음 | - | 실행 스크립트 없음 |
| `templates/` | 없음 | - | 템플릿 없음 |
- 보조 파일: 없음. 단, 본문이 외부 파일 두 개를 링크로 지목한다 (스킬 디렉터리 밖이며 이번 조사 범위에 포함되지 않았다).
  - `[AGENTS.md](../../../AGENTS.md)` — "owns the allowed merge-forward and rebase histories" (`SKILL.md:8`)
  - `[stack review guide](../../../docs/cookbook/responding-to-pr-review-on-a-stack.md)` — "owns review-fix propagation" (`SKILL.md:8`)
  - 이 두 파일의 내용은 이 스킬 디렉터리에 없으므로 규칙 내용은 `원문에 명시 없음`.
- 성격 한 줄: **실행(landing)형 워크플로우 스킬**. 템플릿의 5분류 중에서는 "검증(verification)"이 섞인 "라우팅(routing)"에 가장 가깝다. 새 코드를 생성하지 않고, GitHub 네이티브 스택 기능(`gh stack`)으로 PR 묶음을 trunk에 머지하도록 에이전트의 명령 선택을 제한하고 사전/사후 검증을 강제한다. 분류 항목 중 하나로 정확히 떨어지지는 않는다.
- 원문 자기 규정:
  > Land dependent PRs through GitHub's native stack object and `gh stack merge`. Do not reproduce stack semantics by merging and retargeting individual PRs with `gh pr merge` and `gh pr edit`. (`SKILL.md:8`)
  >
  > 번역: 의존 PR은 GitHub 네이티브 스택 객체와 `gh stack merge`로만 랜딩한다. 개별 PR에 `gh pr merge`/`gh pr edit`을 쓰는 방식으로 스택 의미를 흉내 내지 않는다.
- 문서 제목: `# Landing an official GitHub PR stack` (`SKILL.md:6`)
- 섹션 구성 (H2 7개 + 체크리스트): Require native stack support / Link missing stack members / Refresh only when needed / Preflight the merge range / Merge through the stack API / Verify the landed state / Checklist.

## 2. 활성화 조건 (언제 켜지는가)

### 2.1 frontmatter description 전문
> Use when landing a stack of dependent GitHub PRs (A ← B ← C, where each bases on the one below) onto master, merging a PR whose base is another open PR's branch, or whenever a request mentions "stacked PRs", "PR stack", "dependent PRs", or merging several related PRs in sequence. Requires every same-repository dependency chain to use GitHub's official stacked-PR feature before landing so GitHub owns stack-wide rules, CI, ordering, retargeting, and merge state. (`SKILL.md:3`)
번역: A ← B ← C처럼 각 PR이 아래 PR을 base로 삼는 의존 PR 묶음을 master에 랜딩할 때, base가 다른 열린 PR의 브랜치인 PR을 머지할 때, 또는 요청이 "stacked PRs", "PR stack", "dependent PRs"를 언급하거나 관련 PR 여러 개를 순서대로 머지하려 할 때 사용. 같은 저장소 안의 모든 의존 체인이 랜딩 전에 GitHub 공식 스택 기능을 쓰도록 요구하여, 스택 전체 규칙·CI·순서·retarget·머지 상태를 GitHub가 소유하게 한다.
description 안에 박힌 트리거 구문(원문 그대로):
- "landing a stack of dependent GitHub PRs"
- "A ← B ← C, where each bases on the one below"
- "merging a PR whose base is another open PR's branch"
- "stacked PRs"
- "PR stack"
- "dependent PRs"
- "merging several related PRs in sequence"

### 2.2 매칭되는 사용자 발화 예시 (트리거 사전 추출)
아래는 description 구문에 직접 대응되는 발화이다. 원문에 예시 발화 목록은 없으므로 description 구문과의 대응만 적는다.
| # | 발화 예 | 대응하는 description 구문 |
|---|---|---|
| 1 | "stacked PRs 3개 master에 랜딩해줘" | "stacked PRs", "landing a stack of dependent GitHub PRs" |
| 2 | "PR stack 머지해줘" | "PR stack" |
| 3 | "#101 ← #102 ← #103 순서대로 merge 해줘" | "A ← B ← C", "merging several related PRs in sequence" |
| 4 | "이 PR은 base가 다른 PR 브랜치인데 머지해도 돼?" | "merging a PR whose base is another open PR's branch" |
| 6 | "관련된 PR 여러 개를 차례로 머지해줘" | "merging several related PRs in sequence" |
| 7 | "stack 맨 아래 PR까지만 먼저 랜딩해줘" | 본문 "A partial landing requires an explicit boundary PR" (`SKILL.md:81`) |

### 2.3 의도적으로 배제되는 발화와 넘길 스킬
- description·본문에 "이 경우에는 다른 스킬로 넘겨라"는 명시적 라우팅 규칙은 없다. 형제 스킬 이름이 한 번도 등장하지 않는다. → `원문에 명시 없음`.
- 본문이 외부 문서로 위임하는 항목은 있다 (스킬이 아니라 문서):
  - 허용되는 merge-forward / rebase 히스토리 → 루트 `AGENTS.md` (`SKILL.md:8`)
  - 리뷰 수정의 스택 전파 → `docs/cookbook/responding-to-pr-review-on-a-stack.md` (`SKILL.md:8`)
- 스킬이 중단(hard-stop)하는 상황 — 즉 이 스킬이 켜져도 진행하지 않는 경우:
  - `gh stack` 확장 또는 서버 측 스택 기능이 없을 때: "Hard-stop if the official extension or server-side stack feature is unavailable" (`SKILL.md:12`)
  - 크로스포크 체인: "GitHub stacks require every head branch to live in the same repository, so hard-stop on a cross-fork chain." (`SKILL.md:12`)
  - 기존 스택이 여러 개이거나 예상 밖 항목·순서 충돌이 있을 때: "requires user direction before any mutation" (`SKILL.md:52`)

### 2.4 frontmatter 필드
- 존재하는 필드: `name: dsh-merging-stacked-prs`, `description` (`SKILL.md:2-3`).
- `allowed-tools`, `model`, `metadata` 등 그 밖의 필드: 없음.

## 3. 적합 / 부적합

### 3.1 적합 (원문이 전제하는 상황)
- 같은 저장소 안에 head 브랜치가 모두 있는 의존 PR 체인 (A ← B ← C). 근거: "GitHub stacks require every head branch to live in the same repository" (`SKILL.md:12`).
- GitHub 서버 측 스택 기능과 `gh stack` 확장이 사용 가능한 환경 (`SKILL.md:12`).
- 아직 공식 스택으로 묶이지 않았지만 작성자가 모두 같은 체인: "If all authors match, link the chain automatically in bottom-to-top order" (`SKILL.md:57`).
- trunk가 앞서 나가 갱신이 필요하고 허용된 히스토리(네이티브 cascading rebase 또는 incremental merge-forward) 중 하나를 쓸 수 있는 저장소 (`SKILL.md:70-73`).
- 병합 큐(merge queue)를 쓰는 trunk: "when the trunk uses a merge queue, GitHub queues the selected range together but may land it in separate groups" (`SKILL.md:97`).
- 일부만 랜딩해야 하는 경우: 명시적 경계 PR이 주어지면 하단부터 경계까지 머지 (`SKILL.md:81, 91-95`).

### 3.2 부적합 / 과함 (원문에서 도출되는 범위)
원문이 직접 "이럴 땐 쓰지 마라"고 쓴 문장은 없다. 아래는 원문의 hard-stop/전제에서 기계적으로 따라 나오는 경우만 적는다.
| 상황 | 근거 |
|---|---|
| 크로스포크 체인 | `SKILL.md:12` hard-stop |
| `gh stack` 미설치 / 서버 기능 없음 | `SKILL.md:12` hard-stop |
| 기존 스택이 다수이거나 순서 충돌 | `SKILL.md:52` 사용자 지시 필요 |
| 작성자가 서로 다르거나 작성자 정보 없음 | `SKILL.md:63` link 전에 사용자에게 질문 |
| 기존 스택을 해체/재정렬/재구성해야 하는 요구 | `SKILL.md:66` "Never dissolve, reorder, or rebuild an existing stack automatically" |
| 네이티브 머지가 blocker를 보고하는데 `gh pr merge`로 우회하려는 경우 | `SKILL.md:99` "never fall back to `gh pr merge`" |

### 3.3 형제 스킬 대신 이걸 고르는 판정 기준 한 줄
- 형제 스킬이 원문에 언급되지 않아 비교 기준은 `원문에 명시 없음`. 이 스킬을 고르는 기준은 description 그대로 "base가 다른 열린 PR 브랜치인 의존 PR 체인을 master에 랜딩한다"이다.

## 4. 전제 조건과 외부 의존성

### 4.1 실행 스크립트 / 런타임 / CLI
- 실행 스크립트: 없음 (`scripts/` 부재). 모든 명령은 본문 코드 블록의 셸 명령이며 에이전트가 직접 실행한다.
- 본문에 등장하는 CLI와 용도:
| 도구 | 사용 위치 | 용도 |
|---|---|---|
| `gh stack --version` | `SKILL.md:12` | 공식 확장 사용 가능 여부 확인 |
| `gh pr view <pr> --json ...` | `SKILL.md:17, 106` | PR 메타데이터·정확한 head OID, 머지 후 상태 확인 |
| `gh api graphql` | `SKILL.md:23-45` | `PullRequest.stack`, `stackEntry.position` 조회 |
| `gh stack link --base <trunk> ...` | `SKILL.md:60` | 미연결 PR을 공식 스택으로 연결 |
| `gh stack checkout <pr-or-stack>` | `SKILL.md:72` | 원격 스택을 로컬로 체크아웃 |
| `gh stack sync` | `SKILL.md:72` | cascading rebase + lease 보호 force-push |
| `gh stack rebase` | `SKILL.md:72` | sync 중 rebase 충돌 시 해결용 |
| `gh stack push` | `SKILL.md:72` | 충돌 해결 후 게시 |
| `gh stack merge <stack-number|boundary-pr> --yes --merge` | `SKILL.md:88, 94` | 스택 머지 |
| `gh pr list --state open --base <branch> --json number --jq length` | `SKILL.md:114` | 브랜치 삭제 전 의존 PR 0개 확인 |
| `git` (merge-forward, worktree) | `SKILL.md:14, 73` | 깨끗한 전용 worktree, trunk→하위 브랜치 merge |

### 4.2 API 키 / 환경변수 / 네트워크
- API 키·환경변수 이름: `원문에 명시 없음`.
- 네트워크: 필요. GitHub API(GraphQL 포함)와 push를 호출한다.

### 4.3 리포지토리 전제
- GitHub 서버 측 스택 기능 활성: "Hard-stop if the official extension or server-side stack feature is unavailable" (`SKILL.md:12`).
- 모든 head 브랜치가 같은 저장소 (`SKILL.md:12`).
- 리뷰·체크 요건이 저장소에 정의되어 있음: "compliant with the repository's review and check requirements" (`SKILL.md:79`). 어떤 요건인지는 `원문에 명시 없음`.
- 루트 `AGENTS.md`가 존재하고 허용 히스토리를 정의: `SKILL.md:8`. 스킬 디렉터리 기준 상대경로 `../../../AGENTS.md`.
- 리뷰 가이드 문서 `docs/cookbook/responding-to-pr-review-on-a-stack.md` 존재 가정 (`SKILL.md:8`).
- 테스트 러너·린터·타입 시스템: "run the relevant checks for every affected layer" (`SKILL.md:72`)라고만 하고 구체 명령은 `원문에 명시 없음`.
- 커밋 권한: 직접 커밋 생성은 없고 push/머지 권한이 필요하다. 브랜치 전략은 trunk 기준 스택 (`gh stack link --base <trunk>`). trunk 이름은 description에서 "master"로 예시된다 (`SKILL.md:3`), 본문은 `<trunk>`로 일반화.

### 4.4 비용 발생 지점
- 유료 API 호출: `원문에 명시 없음`.
- CI 분 소모: `gh stack sync`가 모든 활성 레이어를 rebase·force-push하면 레이어별 CI가 다시 돌 수 있다. 원문은 "run the relevant checks for every affected layer" (`SKILL.md:72`)와 "re-audit ... checks after the push" (`SKILL.md:75`)만 말하며 비용 언급은 `원문에 명시 없음`.
- 토큰: 컨텍스트 절약 지시 없음 (6.5 참조).

### 4.5 상태 파일 / 산출물 디렉터리
- 상태 파일(`plan.md`, `TODO`, `.claude/` 등) 생성: 없음. 원문에 파일 생성 지시가 없다.

## 5. 워크플로우
순서 강제 문구: 본문에 "run in order"/"do not skip" 같은 명시적 문구는 없다. 다만 섹션이 시간 순으로 배열되어 있고 "Run `gh stack --version` before changing GitHub state"(`SKILL.md:12`), "Re-query the official stack immediately before merging"(`SKILL.md:79`), "Delete branches only in a separate final pass"(`SKILL.md:111`)처럼 선후 관계를 문장 안에서 강제한다. `[게이트]`는 탈락(중단·질문) 가능 단계를 뜻한다.

### 5.0 단계 요약표
| 단계 | 섹션 | 게이트 | 사람 개입 |
|---|---|---|---|
| S1 네이티브 지원 확인 | Require native stack support | 게이트 (hard-stop) | 중단 보고 |
| S2 PR 메타데이터 / 스택 조회 | Require native stack support | 부분 게이트 (스택 구성 불일치) | 불일치 시 |
| S3 누락 멤버 연결 | Link missing stack members | 게이트 (다중 스택·작성자 불일치·검증 실패) | 작성자 불일치 시 질문 |
| S4 필요 시 갱신 | Refresh only when needed | 게이트 (검증 통과 전 머지 금지, 분기 시 취소) | 로컬/원격 스택 분기 시 질문 |
| S5 머지 범위 프리플라이트 | Preflight the merge range | 게이트 | 부분 랜딩은 경계 PR 필요 |
| S6 스택 API 머지 | Merge through the stack API | 게이트 (blocker 시 중단) | blocker 시 보고 |
| S7 랜딩 검증 | Verify the landed state | 게이트 (MERGED 확인) | 없음 |
| S8 브랜치 삭제 | Verify the landed state 후반부 | 게이트 (의존 PR 0개) | 없음 |

### 5.1 S1 — 네이티브 스택 지원 확인 [게이트]
- 입력: 환경의 `gh` CLI, 대상 저장소.
- 행동: `gh stack --version` 실행. 체인이 크로스포크인지 확인.
- 출력: 확장·서버 기능 사용 가능 여부.
- 통과 조건: 확장과 서버 측 기능이 있고 모든 head 브랜치가 같은 저장소.
- 탈락 시:
  > Hard-stop if the official extension or server-side stack feature is unavailable; do not fall back to manually merging and retargeting PRs one at a time. ... so hard-stop on a cross-fork chain. (`SKILL.md:12`)
- 시점 제약: "before changing GitHub state" — GitHub 상태 변경 전에 수행.

### 5.2 S2 — 라이브 PR 메타데이터와 공식 스택 조회
- 입력: PR 번호들.
- 행동 1: 깨끗한 전용 worktree 사용. "Fetch current PR metadata and exact head OIDs rather than trusting branch names or an earlier report" (`SKILL.md:14`). 명령:
  `gh pr view <pr> --json number,author,baseRefName,baseRefOid,headRefName,headRefOid,isCrossRepository,state,isDraft,reviewDecision,mergeStateStatus,statusCheckRollup` (`SKILL.md:17`)
- 행동 2: 체인마다 최소 PR 1개에 대해 GraphQL로 `PullRequest.stack`, `stackEntry.position` 조회. 쿼리는 `entries(first: 100)`을 쓰고 `size`가 반환 페이지를 넘으면 페이지네이션하라고 한다 (`SKILL.md:20, 36`).
  > this official GitHub object, not base-branch inference alone, is the stack-membership authority. (`SKILL.md:20`)
- 행동 3: 라이브 base로부터 예상 순서를 세운다:
  > the bottom targets the trunk, and each higher PR targets the head branch immediately below it. (`SKILL.md:48`)
- 출력: 예상 bottom-to-top 순서, 현재 스택 상태.
- 통과 조건: 다음 단계(S3)에서 비교 가능한 예상 체인 확립.

### 5.3 S3 — 누락된 스택 멤버 연결 [게이트]
- 입력: S2의 기존 스택 엔트리와 예상 체인.
- 비교 규칙:
  > One existing stack may contain an order-preserving subset of the requested chain; multiple stack numbers, an unexpected entry, or a conflicting order requires user direction before any mutation. (`SKILL.md:52`)
- 스택에 들어있지 않은 의존 PR이 있을 때 (`SKILL.md:54-64`):
  1. 모든 `author.login`을 정확히 비교.
  2. 모두 같으면 자동으로 bottom-to-top 순서로 연결: `gh stack link --base <trunk> <bottom-pr> <next-pr> ... <top-pr>`
  3. 작성자가 다르거나 하나라도 없으면: "ask the user whether to link before changing GitHub state."
  4. 재조회하여 요구: one stack number, the expected trunk, the complete PR set, expected positions and base chain.
- 금지: "Never dissolve, reorder, or rebuild an existing stack automatically; `gh stack link` is additive and merged or queued entries cannot be unstacked." (`SKILL.md:66`)
- 통과 조건: 재조회에서 스택 번호 1개, trunk 일치, PR 집합 완전, 위치·base 체인 일치.
- 사람 개입: 작성자 불일치/작성자 불명, 다중 스택/예상 밖 엔트리/순서 충돌.

### 5.4 S4 — 필요할 때만 갱신 (조건부, 게이트 포함)
- 진입 조건:
  > Do not rewrite branches merely because a refresh mechanism exists. When the live merge state or repository rules require an updated trunk, choose either allowed history (`SKILL.md:70`)
- 선택지 A. Native cascading rebase (`SKILL.md:72`):
  - 원격 스택이 로컬에 추적되지 않으면 `gh stack checkout <pr-or-stack>`.
  - `gh stack sync` 실행. "may rebase and lease-protected force-push every active layer before local validation."
  - 직후: "Immediately inspect the rewritten scope, run the relevant checks for every affected layer, and do not merge or claim readiness until they pass."
  - sync가 rebase 충돌 감지: `gh stack rebase` → 해결·검증 → `gh stack push`.
  - 로컬/원격 스택 구성이 갈라짐: "cancel and ask rather than deleting or recreating the remote stack automatically."
- 선택지 B. Incremental merge-forward (`SKILL.md:73`):
  - trunk를 가장 아래 영향 브랜치에 merge, 이후 업데이트된 부모를 자식에 bottom-to-top 순서로 propagate, 일반 push.
  - "If the base advances during an in-progress merge, preserve that checkpoint before merging the newer tip."
- 공통 사후 처리 (`SKILL.md:75`):
  > Any history rewrite is allowed after review, but it invalidates commit-OID assumptions. Re-fetch exact heads and re-audit unresolved review threads, approvals, mergeability, and checks after the push. Never use raw `--force` or overwrite a concurrently advanced remote head.
- 통과 조건: 영향받은 모든 레이어의 관련 검증 통과, 재조회 후 리뷰 스레드·승인·머지 가능성·체크 재감사 완료.
- 어느 쪽을 고를지 기준: "choose either allowed history" — 선택 기준은 `원문에 명시 없음`. 허용 히스토리 정의는 `AGENTS.md`에 위임 (`SKILL.md:8`).

### 5.5 S5 — 머지 범위 프리플라이트 [게이트]
- 입력: 최신 공식 스택.
- 행동: 머지 직전에 재조회.
  > Re-query the official stack immediately before merging. Require every selected PR to be open, non-draft, in the expected order, and compliant with the repository's review and check requirements. Treat each PR's state independently; a ready top layer does not prove its dependencies are ready. (`SKILL.md:79`)
- 범위 결정 (`SKILL.md:81`):
  > "Land the stack" selects the whole stack. A partial landing requires an explicit boundary PR and includes every layer from the bottom through that boundary.
- 통과 조건: 선택된 모든 PR이 open, non-draft, 예상 순서, 리뷰·체크 요건 충족.

### 5.6 S6 — 스택 API로 머지 [게이트]
- 전체 스택: `gh stack merge <stack-number> --yes --merge` (`SKILL.md:88`)
- 부분 랜딩: `gh stack merge <boundary-pr> --yes --merge` (`SKILL.md:94`)
- 금지: "Do not pass `--delete-branch`, manually retarget dependents, or issue per-PR merge commands." (`SKILL.md:97`)
- GitHub의 동작에 대한 원문 설명:
  > GitHub merges the selected range bottom-up and retargets/rebases any remaining upper layers. A direct stack merge is all-or-nothing; when the trunk uses a merge queue, GitHub queues the selected range together but may land it in separate groups. (`SKILL.md:97`)
- 탈락 시:
  > Do not bypass merge requirements. If the native merge reports a blocker, inspect and resolve that blocker through the owning PR or stop and report it; never fall back to `gh pr merge`. (`SKILL.md:99`)
- 사람 개입: blocker를 해결할 수 없을 때 "stop and report".

### 5.7 S7 — 랜딩 상태 검증 [게이트]
- 행동: 선택된 모든 PR이 `MERGED`가 될 때까지 대기. 명령: `gh pr view <pr> --json number,state,mergedAt,mergeCommit,baseRefName,headRefName` (`SKILL.md:106`)
  > Wait for every selected PR to report `MERGED`; a queued request is not a completed landing (`SKILL.md:103`)
- 대기 시간 상한·폴링 간격: `원문에 명시 없음`.
- 부분 랜딩이면 (`SKILL.md:109`): 공식 스택 재조회 → 남은 PR이 예상 순서로 연결되어 있고 trunk 또는 바로 아래 레이어를 target하는지 확인. "Re-check current heads, review state, and CI because GitHub may have rebased the remaining layers."

### 5.8 S8 — 브랜치 삭제 (별도 최종 패스) [게이트]
- 규칙: "Delete branches only in a separate final pass after the corresponding PRs report `MERGED`." (`SKILL.md:111`)
- 삭제 전 확인: `gh pr list --state open --base <branch> --json number --jq length` (`SKILL.md:114`)
- 통과 조건: 결과가 `0`. "Anything other than `0` blocks deletion." (`SKILL.md:117`)
- 실제 삭제 명령(예: `git push origin --delete`, `gh api` 호출): `원문에 명시 없음`.

### 5.9 흐름 도식
```
S1 gh stack --version / same-repo? --실패--> HARD-STOP (보고)
  |
S2 gh pr view (head OID) + GraphQL stack 조회 -> 예상 bottom-to-top 순서
  |
S3 스택 비교
  |-- 다중 스택/예상 밖 엔트리/순서 충돌 --> 사용자 지시 (변경 금지)
  |-- 미연결 PR 있음
  |     |-- 작성자 전원 일치 --> gh stack link --base <trunk> ...
  |     '-- 불일치/불명 --> 사용자에게 link 여부 질문
  '-- 재조회: 스택 1개 + trunk + 전체 PR + 위치 일치 필수
  |
S4 (조건부) trunk 갱신이 필요한가?
  |-- A: gh stack sync (필요 시 rebase -> push) --> 검증 통과 후에만 진행
  |-- B: merge-forward (bottom-to-top, 일반 push)
  '-- 어느 쪽이든 push 후 head OID/리뷰/승인/체크 재감사
  |
S5 머지 직전 재조회: open, non-draft, 순서, 리뷰·체크 요건
  |
S6 gh stack merge <stack-number | boundary-pr> --yes --merge
  |-- blocker --> PR에서 해결 또는 중단·보고 (gh pr merge 폴백 금지)
  |
S7 모든 선택 PR == MERGED 확인 (큐 등록 != 완료)
  |
S8 브랜치 삭제는 별도 패스, 열린 PR base 사용 수 == 0 일 때만
```

### 5.10 루프 / 재시도 구조
- 명시적 재시도 상한, 타임아웃, 수렴 조건: `원문에 명시 없음`.
- 반복 구조는 두 군데뿐이다. (1) S3 연결 후 재조회-일치 확인, (2) S4 push 후 재조회-재감사. 둘 다 반복 횟수 상한이 없다.

### 5.11 사람 개입 지점 정리
| 지점 | 조건 | 원문 |
|---|---|---|
| 스택 구성 불일치 | 다중 스택 번호 / 예상 밖 엔트리 / 순서 충돌 | `SKILL.md:52` |
| 연결 여부 질문 | 작성자 불일치 또는 불명 | `SKILL.md:63` |
| 스택 분기 | 로컬·원격 스택 구성이 다름 | `SKILL.md:72` "cancel and ask" |
| 부분 랜딩 경계 | 사용자가 명시한 경계 PR 필요 | `SKILL.md:81` |
| 머지 blocker | 해결 불가 시 | `SKILL.md:99` "stop and report" |

## 6. 엔지니어링 규칙 분석

### 6.1 금지 규칙 (anti-pattern)과 막으려는 실패 모드
| # | 원문 금지 | 출처 | 막으려는 실패 모드 (원문에서 직접 드러나는 것) |
|---|---|---|---|
| 1 | "Do not reproduce stack semantics by merging and retargeting individual PRs with `gh pr merge` and `gh pr edit`." | `SKILL.md:8` | 스택 의미를 수동으로 흉내 내다 순서·retarget·규칙이 GitHub 스택 객체와 어긋남 (description: "so GitHub owns stack-wide rules, CI, ordering, retargeting, and merge state") |
| 2 | "do not fall back to manually merging and retargeting PRs one at a time" | `SKILL.md:12` | 네이티브 기능 부재 시 수동 우회 |
| 3 | "hard-stop on a cross-fork chain" | `SKILL.md:12` | 스택이 성립하지 않는 크로스포크 체인에 진행 |
| 4 | "rather than trusting branch names or an earlier report" | `SKILL.md:14` | 오래된 보고·브랜치 이름에 의존한 판단 |
| 5 | "not base-branch inference alone" | `SKILL.md:20` | base 브랜치 추론만으로 스택 멤버십을 단정 |
| 6 | "Never dissolve, reorder, or rebuild an existing stack automatically" | `SKILL.md:66` | 병합·큐 진입한 엔트리는 unstack 불가 ("merged or queued entries cannot be unstacked") |
| 7 | "Do not rewrite branches merely because a refresh mechanism exists." | `SKILL.md:70` | 불필요한 히스토리 재작성 |
| 9 | "cancel and ask rather than deleting or recreating the remote stack automatically" | `SKILL.md:72` | 로컬/원격 스택 분기 시 원격 스택 파괴 |
| 10 | "Never use raw `--force` or overwrite a concurrently advanced remote head." | `SKILL.md:75` | 동시에 앞서간 원격 head 덮어쓰기 |
| 11 | "A ready top layer does not prove its dependencies are ready." (판정 오류 금지 취지) | `SKILL.md:79` | 상위 레이어만 보고 하위도 준비됐다고 가정 |
| 12 | "Do not pass `--delete-branch`, manually retarget dependents, or issue per-PR merge commands." | `SKILL.md:97` | 머지 중 브랜치 삭제로 자식 PR이 닫힘/깨짐 (구체 메커니즘은 원문에 서술 없음 → `원문에 명시 없음`), 수동 retarget, 개별 머지 |
| 13 | "Do not bypass merge requirements." / "never fall back to `gh pr merge`" | `SKILL.md:99` | 머지 요건 우회 |
| 14 | "a queued request is not a completed landing" | `SKILL.md:103` | 큐 등록을 완료로 오인 |
| 15 | "Anything other than `0` blocks deletion." | `SKILL.md:117` | 자식 PR이 남은 상태에서 브랜치 삭제 |

### 6.2 강제 규칙 — 수치·임계값 표
원문의 숫자 전부:
| 값 | 맥락 | 출처 |
|---|---|---|
| `entries(first: 100)` | GraphQL 스택 엔트리 한 페이지 크기. `size`가 반환 페이지를 초과하면 paginate | `SKILL.md:20, 36` |
| `0` | 브랜치 삭제 허용 조건: 해당 브랜치를 base로 쓰는 open PR 수가 0 | `SKILL.md:114, 117` |
| `1` (one stack number) | 재조회 시 스택 번호가 하나여야 함 | `SKILL.md:64` |
| 허용 스택 개수 | "One existing stack may contain an order-preserving subset" | `SKILL.md:52` |
- 리뷰 승인 개수·필요 체크 목록: `원문에 명시 없음` ("compliant with the repository's review and check requirements"로 저장소 설정에 위임).
플래그와 고정 인자 (임계값은 아니지만 강제되는 값):
| 항목 | 값 | 출처 |
|---|---|---|
| 머지 방식 | `--yes --merge` | `SKILL.md:88, 94, 125` |
| 연결 순서 | bottom → top | `SKILL.md:57-59` |
| 삭제 시점 | 머지 확인 후 별도 최종 패스 | `SKILL.md:111` |
| 부분 랜딩 포함 범위 | "every layer from the bottom through that boundary" | `SKILL.md:81` |

### 6.3 검증 방식 — 무엇을 근거로 "됐다"고 판정하는가
| 판정 대상 | 근거 | 성격 |
|---|---|---|
| 스택 멤버십 | GraphQL `PullRequest.stack`, `stackEntry.position` | 외부 API 조회 (자기 진술 아님) |
| 연결 완료 | 재조회에서 스택 번호 1개·trunk·전체 PR 집합·위치·base 체인 일치 | API 재조회 |
| head 상태 | `headRefOid`, `baseRefOid` 재조회 | API 조회 |
| 갱신(rebase/merge-forward) 후 준비 | "run the relevant checks for every affected layer" 통과 + 리뷰 스레드·승인·mergeability·체크 재감사 | 테스트/CI 결과 + API 조회. 어떤 체크를 돌릴지는 `원문에 명시 없음` |
| 머지 완료 | 모든 선택 PR의 `state == MERGED` | API 조회 |
| 부분 랜딩 후 상태 | 남은 PR이 예상 순서로 연결, trunk 또는 하위 레이어 target, head·리뷰·CI 재확인 | API 조회 |
| 브랜치 삭제 가능 | `gh pr list ... --jq length` == `0` | API 조회 |
| 최종 체크리스트 | 7개 체크박스 (`SKILL.md:121-127`) | 에이전트의 자기 점검. 체크박스를 채우는 행위 자체는 자기 진술 |
- 리뷰 결정(`reviewDecision`), `mergeStateStatus`, `statusCheckRollup`을 가져오되 (`SKILL.md:17`) 어떤 값이 통과인지의 명시적 값 목록은 `원문에 명시 없음`.
- `isDraft`, `state`를 가져오며 "open, non-draft"를 요구 (`SKILL.md:79`).

### 6.4 도구 사용 규칙
- 지정 도구 (사용하라):
  - 스택 머지는 `gh stack merge` 단일 경로 (`SKILL.md:8, 88, 94`).
  - 스택 연결은 `gh stack link`; 갱신은 `gh stack sync` / `gh stack rebase` / `gh stack push`.
  - 스택 조회는 `gh api graphql`; 메타데이터는 `gh pr view --json`.
  - 환경은 깨끗한 전용 worktree (`SKILL.md:14`).
- 금지 도구/사용법:
  - `gh pr merge` (폴백 포함) — `SKILL.md:8, 99`
  - `gh pr edit`로 retarget — `SKILL.md:8`
  - `--delete-branch` 플래그 — `SKILL.md:97`
  - raw `--force` push — `SKILL.md:75` (대신 "lease-protected force-push"는 `gh stack sync`가 수행, `SKILL.md:72`)

### 6.5 컨텍스트·토큰 규율
- 파일 읽기 범위 지시: `원문에 명시 없음`.
- 유일한 규모 관련 문장: GraphQL `entries(first: 100)` 및 "Paginate `entries` when `size` exceeds the returned page" (`SKILL.md:20`).

### 6.6 모호어의 조작적 정의
| 모호어 | 원문의 환산 | 출처 |
|---|---|---|
| "stack membership" | GitHub `PullRequest.stack` 객체. "not base-branch inference alone" | `SKILL.md:20` |
| "ready" (PR 준비 상태) | open + non-draft + 예상 순서 + "compliant with the repository's review and check requirements". 세부 값은 저장소 위임 | `SKILL.md:79` |
| "merged / landed / done" | 모든 선택 PR이 `MERGED`. 큐 등록은 완료가 아님 | `SKILL.md:103` |
| "expected order" | 라이브 base 기준: 바닥은 trunk, 위 PR은 바로 아래 head 브랜치 | `SKILL.md:48` |
| "relevant checks" | 환산 규칙 `원문에 명시 없음` | `SKILL.md:72` |
| "when needed" (갱신 필요) | "live merge state or repository rules require an updated trunk" — 구체 판정 기준 `원문에 명시 없음` | `SKILL.md:70` |
| "partial landing" | 명시 경계 PR + 바닥부터 경계까지 전 레이어 | `SKILL.md:81` |
| "same author" | `author.login` 정확 비교 ("Compare every `author.login` exactly") | `SKILL.md:56` |
| "affected layer" | 갱신으로 재작성된 레이어. "Immediately inspect the rewritten scope" | `SKILL.md:72` |

## 7. 산출물
- 최종 결과물의 형태: 코드 diff나 파일이 아니라 **GitHub 상태 변경** (스택 연결, 머지된 PR, 선택적 브랜치 삭제)과 에이전트의 보고. 보고서 포맷, 판정문 템플릿, 출력 포맷 강제 템플릿: `원문에 명시 없음`. 사용자에게 보고하는 항목은 "stop and report"(`SKILL.md:99`)라는 표현만 있고 형식은 정해져 있지 않다.
- 체크리스트 (`SKILL.md:119-127`)가 유일한 완료 기준 목록이다:
  - [ ] Native `gh stack` support is available; every PR branch is in the same repository.
  - [ ] Live PR bases and exact heads establish one bottom-to-top dependency chain.
  - [ ] GraphQL reports one official stack with the expected trunk, entries, and order; an eligible same-author unstacked chain was linked automatically.
  - [ ] Any rewritten layers passed relevant validation, and review threads, approvals, mergeability, and checks were re-audited afterward.
  - [ ] The whole stack, or an explicitly bounded prefix, was submitted through `gh stack merge --yes --merge`.
  - [ ] Every selected PR reports `MERGED`; any remaining upper layers still form the expected official stack.
  - [ ] Branch deletion happened only after merged-state and zero-dependent verification.

### 7.1 커밋 · PR · 브랜치 조작 및 파괴적 동작
| 동작 | 스킬이 하는가 | 조건/출처 |
|---|---|---|
| 새 커밋 생성 | 직접 지시 없음. merge-forward 시 merge 커밋이 생김 (`SKILL.md:73`) | 커밋 메시지 규칙은 `원문에 명시 없음` |
| PR 머지 | 예 | `gh stack merge ... --yes --merge` |
| 스택 객체 생성/연결 | 예 | `gh stack link`, 작성자 일치 시 자동 |
| `--yes` | 확인 프롬프트 자동 승인 | 사용자 승인 없이 머지가 실행되는 지점. 대신 사전 게이트 S1~S5가 선행 |
| 히스토리 재작성 | 조건부 | `gh stack sync`: "may rebase and lease-protected force-push every active layer" (`SKILL.md:72`) |
| force push | `gh stack sync`의 lease 보호 force-push만. raw `--force` 금지 | `SKILL.md:72, 75` |
| 브랜치 삭제 | 예, 별도 최종 패스, 의존 PR 0개일 때만 | `SKILL.md:111-117` |
| 스택 해체·재정렬·재구성 | 자동 금지 | `SKILL.md:66` |
| 원격 스택 삭제·재생성 | 금지 (분기 시 cancel and ask) | `SKILL.md:72` |

## 8. 주의점 / 한계 (여기서만 평가)

### 8.1 오작동·과잉작동 시나리오
1. **`--yes` 자동 머지의 무게.** `gh stack merge ... --yes --merge`는 확인 프롬프트를 건너뛴다. 사용자가 "land the stack"이라고만 말해도 `"Land the stack" selects the whole stack`(`SKILL.md:81`)이므로 전체가 머지된다. 사용자가 일부만 의도했는데 경계를 말하지 않은 경우를 되묻는 규칙이 없다. 스킬이 사용자 확인 단계를 별도로 두지 않아서, 머지 직전 "이 PR 목록을 머지합니다" 확인은 에이전트 재량이다.
2. **자동 link의 비가역성.** 작성자가 전원 같으면 묻지 않고 `gh stack link`를 실행한다 (`SKILL.md:57`). 본문 스스로 "merged or queued entries cannot be unstacked"(`SKILL.md:66`)라고 하는데, 같은 작성자라는 것은 "스택으로 묶어도 된다"는 의도의 증거가 아니다. 본인이 실수로 base를 잘못 걸어 둔 PR이 의도치 않게 스택에 묶일 수 있다. 사전 재조회가 있어 순서 오류는 걸러지나 의도 확인은 없다.
3. **`gh stack sync`가 만드는 연쇄 force-push.** 원문 스스로 "every active layer"를 rebase하고 lease 보호 force-push한다고 쓴다 (`SKILL.md:72`). 이 경우 전 레이어의 CI가 다시 돌고, 이미 받은 승인이 무효화되는 저장소 설정에서는 재승인이 필요해진다. 스킬은 "re-audit ... approvals"(`SKILL.md:75`)까지만 요구하고 재승인 요청을 누가 하는지는 정하지 않는다.
4. **갱신 방식 선택 기준 부재.** 두 히스토리 "choose either allowed history"(`SKILL.md:70`)인데 어떤 경우 무엇을 택할지 기준이 없고 `AGENTS.md`에 위임한다. 에이전트가 AGENTS.md를 읽지 못하면(경로가 상대경로 `../../../AGENTS.md`) 임의 선택하거나 멈출 수밖에 없다.
5. **무한 대기 가능.** S7은 "Wait for every selected PR to report `MERGED`"이지만 대기 상한·폴링 주기·큐 실패 시 행동이 없다. 머지 큐가 "separate groups"로 나눠 랜딩하면(`SKILL.md:97`) 일부만 머지된 중간 상태가 길어질 수 있다. 이 중간 상태에 대한 "all-or-nothing" 문구와의 관계도 서술되어 있지 않다 (직접 스택 머지는 all-or-nothing, 큐는 그룹 분할 가능).
6. **blocker 해소 위임의 모호함.** "resolve that blocker through the owning PR or stop and report it"(`SKILL.md:99`)에서 resolve의 범위(코드 수정 push, 리뷰 요청, 체크 재실행 등)가 정의되지 않았다. 에이전트가 리뷰 승인이나 체크 요건을 만족시키려고 PR에 임의 수정을 push할 여지가 있고, 이는 `Do not bypass merge requirements`와 긴장 관계다.

### 8.2 다른 스킬·기존 CLAUDE.md 규칙과 충돌 가능 지점
- 루트 `AGENTS.md`와의 이중 권위: 스킬은 "The root AGENTS.md owns the allowed merge-forward and rebase histories"(`SKILL.md:8`)라 하여 허용 히스토리 정의를 외부에 둔다. AGENTS.md와 스킬 본문(예: sync의 force-push)이 어긋나면 어느 쪽이 우선인지 판정 규칙이 없다 (위임 문장상 AGENTS.md가 우선으로 읽히지만 명시적 우선순위 선언은 없다).
- 다른 deepseek-harness 스킬(예: PR 생성·리뷰 계열)이 `gh pr merge`나 `gh pr edit`을 쓰도록 안내한다면 이 스킬의 전면 금지와 충돌한다. 다른 스킬의 내용은 이번 조사 범위 밖이라 실제 충돌 여부는 `원문에 명시 없음`.
- 사용자의 CLAUDE.md가 "머지는 항상 사람 승인 후" 같은 규칙을 가진 경우 `--yes`와 충돌한다. 이 스킬은 승인 요청 단계가 없다 (사람 개입은 예외 상황에서만 발생).
- 리뷰 가이드(`docs/cookbook/responding-to-pr-review-on-a-stack.md`)가 리뷰 수정 전파를 소유하므로, 머지 전 리뷰 수정이 필요할 때 이 스킬은 거기로 넘기지만 호출 조건이 명시적이지 않다.

### 8.3 검증 공백 (원문이 확인하지 않고 넘어가는 것)
- "relevant checks"가 무엇인지 정의가 없어, 레이어별 테스트를 실제로 실행하지 않고 CI 상태만 읽고 통과 처리할 수 있다 (`SKILL.md:72`).
- 머지 후 trunk에서의 통합 검증(머지된 trunk의 빌드/테스트)은 요구하지 않는다. 검증 대상은 PR `MERGED` 상태와 스택 구조뿐이다 (`SKILL.md:103-109`).
- 로컬 worktree가 "clean"인지 확인하는 명령은 제시하지 않는다 (`SKILL.md:14`).
- 머지 요건이 충족됐는지는 `mergeStateStatus`, `reviewDecision`, `statusCheckRollup`을 읽도록 하지만 허용 값 목록이 없어 에이전트가 해석한다.
- 체크리스트는 에이전트가 스스로 채우는 자기 진술이다. 체크박스 근거를 첨부하라는 지시가 없다.
- 브랜치 삭제 명령 자체가 정의되지 않아 삭제 단계의 실행 방법이 불명이다.
- 재조회 시 `size > 100`일 때 pagination은 지시하지만 예시 쿼리는 `first: 100` 고정이다.
- 롤백·복구 절차 부재: 부분적으로 머지된 뒤 실패하거나 잘못 머지된 경우의 되돌림 방법이 없다.

### 8.4 유지보수 리스크
- `gh stack`은 이 스킬의 단일 실패 지점이다. 스킬이 요구하는 "official extension or server-side stack feature"가 현재 존재해야 하며 (`SKILL.md:12`), 명령/플래그(`--yes`, `--merge`, `--base`, 서브커맨드 `link/sync/rebase/push/checkout/merge`)와 GraphQL 필드(`PullRequest.stack`, `stackEntry.position`, `entries`)가 바뀌면 본문 전체가 깨진다. 최소 버전 고정이 없다.
- 하드코딩된 상대경로 `../../../AGENTS.md`, `../../../docs/cookbook/...`: 스킬 설치 위치가 바뀌면 링크가 끊긴다 (`SKILL.md:8`).
- description의 `master` 하드코딩 (`SKILL.md:3`), 본문은 `<trunk>`: 기본 브랜치가 `main`인 저장소에서는 description 매칭만 영향을 받을 가능성이 있으나, 본문이 `<trunk>`라서 동작에는 영향이 없다고 읽힌다.
- 스킬 단독으로는 규칙의 절반(히스토리 정책, 리뷰 전파)이 외부 문서에 있어 문서 간 버전 어긋남 위험이 있다.

### 8.5 한 줄 판정
**조건부 도입 권장.** 근거: 네이티브 스택 API 하나로 머지 경로를 강제하고 `MERGED` 확인·의존 PR 0개 확인 같은 API 기반 사후 검증을 갖춘 점은 견고하나, `--yes` 자동 머지에 사용자 확인 단계가 없고 `gh stack` 가용성 및 루트 `AGENTS.md` 존재에 전적으로 의존하므로, 이 둘이 갖춰진 same-repo GitHub 저장소에서만 켜는 것이 맞다.