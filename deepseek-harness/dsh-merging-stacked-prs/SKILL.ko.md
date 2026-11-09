---
name: dsh-merging-stacked-prs
description: 의존 관계가 있는 GitHub PR 스택(A ← B ← C, 각 PR이 바로 아래 PR을 base로 함)을 master에 머지할 때, base가 다른 열린 PR의 브랜치인 PR을 머지할 때, 또는 요청에 "stacked PRs", "PR stack", "dependent PRs", 여러 관련 PR을 순서대로 머지하라는 내용이 있을 때 사용한다. 머지 전에 같은 저장소의 모든 의존 체인이 GitHub 공식 stacked-PR 기능을 쓰도록 요구한다. 그래야 stack 전체의 규칙, CI, 순서, retarget, 머지 상태를 GitHub이 관리한다.
---

# GitHub 공식 PR 스택 머지

의존 PR은 GitHub 네이티브 stack 객체와 `gh stack merge`로 머지한다. 개별 PR을 `gh pr merge`와 `gh pr edit`로 머지하고 retarget해서 stack의 의미를 흉내 내지 않는다. 허용되는 merge-forward와 rebase 이력은 루트 [AGENTS.md](../../../AGENTS.md)가 정하고, review 수정의 전파 방식은 [stack review guide](../../../docs/cookbook/responding-to-pr-review-on-a-stack.md)가 정한다.

## 네이티브 stack 지원을 요구한다

GitHub 상태를 바꾸기 전에 `gh stack --version`을 실행한다. 공식 extension이나 서버 측 stack 기능을 쓸 수 없으면 바로 중단한다. 개별 PR을 하나씩 머지하고 retarget하는 방식으로 대체하지 않는다. GitHub stack은 모든 head 브랜치가 같은 저장소에 있어야 하므로, fork를 가로지르는 체인이면 바로 중단한다.

깨끗한 전용 worktree를 사용한다. 브랜치 이름이나 이전 보고서를 믿지 말고, 현재 PR 메타데이터와 정확한 head OID를 가져온다.

```sh
gh pr view <pr> --json number,author,baseRefName,baseRefOid,headRefName,headRefOid,isCrossRepository,state,isDraft,reviewDecision,mergeStateStatus,statusCheckRollup
```

보이는 각 체인마다 최소 PR 하나에 대해 `PullRequest.stack`과 `stackEntry.position`을 조회한다. stack 소속 여부는 base 브랜치 추론만이 아니라 이 공식 GitHub 객체로 판단한다. `size`가 반환된 페이지보다 크면 `entries`를 페이지네이션한다.

```sh
gh api graphql -F owner=<owner> -F name=<repo> -F number=<pr> -f query='
query($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      number
      author { login }
      baseRefName
      headRefName
      stackEntry { position }
      stack {
        number
        baseRefName
        size
        entries(first: 100) {
          nodes {
            position
            pullRequest { number author { login } baseRefName headRefName state isDraft }
          }
        }
      }
    }
  }
}'
```

현재 PR의 base를 기준으로 예상 순서를 아래에서 위로 정한다. 가장 아래 PR은 trunk를 대상으로 하고, 위의 각 PR은 바로 아래 PR의 head 브랜치를 대상으로 한다.

## 빠진 stack 멤버를 연결한다

먼저 기존 stack entry를 예상 체인과 비교한다. 기존 stack 하나가 요청된 체인의 순서를 유지하는 부분집합일 수 있다. stack 번호가 여러 개이거나, 예상하지 않은 entry가 있거나, 순서가 충돌하면 어떤 변경도 하기 전에 사용자의 지시를 받는다.

의존 PR 중 하나라도 공식 stack에 없으면 다음을 따른다.

1. 모든 `author.login`이 정확히 같은지 비교한다.
2. 작성자가 모두 같으면, 아래에서 위로 순서대로 체인을 자동 연결한다.

```sh
gh stack link --base <trunk> <bottom-pr> <next-pr> ... <top-pr>
```

3. 작성자가 다르거나 작성자를 알 수 없으면, GitHub 상태를 바꾸기 전에 연결할지 사용자에게 묻는다.
4. GraphQL을 다시 조회해서, stack 번호가 하나인지, trunk가 예상과 같은지, PR 집합이 완전한지, 위치와 base 체인이 예상과 맞는지 확인한다.

기존 stack은 자동으로 해체하거나, 순서를 바꾸거나, 다시 만들지 않는다. `gh stack link`는 추가만 하며, 머지되었거나 대기열에 있는 entry는 unstack할 수 없다.

## 필요할 때만 갱신한다

갱신 메커니즘이 있다는 이유만으로 브랜치를 다시 쓰지 않는다. 현재 머지 상태나 저장소 규칙이 최신 trunk를 요구할 때만, 허용된 이력 중 하나를 고른다.

- **네이티브 cascading rebase:** 원격 stack이 로컬에서 추적되지 않으면 `gh stack checkout <pr-or-stack>`으로 가져온 뒤 `gh stack sync`를 실행한다. 이 명령은 로컬 검증 전에 활성 layer를 모두 rebase하고 lease 보호된 force-push를 할 수 있다. 바뀐 범위를 바로 확인하고, 영향을 받는 모든 layer에 관련 검사를 실행한다. 검사가 통과하기 전에는 머지하거나 준비 완료라고 말하지 않는다. sync가 rebase 충돌을 감지하면 `gh stack rebase`로 해결하고 검증한 뒤 `gh stack push`로 발행한다. checkout이나 sync가 로컬과 원격 stack 구성이 갈라졌다고 보고하면, 원격 stack을 자동으로 삭제하거나 다시 만들지 말고 중단하고 묻는다.
- **점진적 merge-forward:** trunk를 영향을 받는 가장 아래 브랜치에 머지한다. 그런 다음 갱신된 각 부모를 아래에서 위 순서대로 자식에 전파하고, 평소처럼 push한다. merge가 진행 중일 때 base가 앞으로 가면, 더 새로운 tip을 머지하기 전에 현재 체크포인트를 보존한다.

이력을 다시 쓰는 것은 리뷰 후에는 허용되지만, commit OID 가정을 무효화한다. push 후에는 정확한 head를 다시 가져오고, 해결되지 않은 review thread, 승인, mergeability, 검사를 다시 감사한다. raw `--force`를 쓰지 않으며, 동시에 앞으로 간 원격 head를 덮어쓰지 않는다.

## 머지 범위를 사전 점검한다

머지 직전에 공식 stack을 다시 조회한다. 선택된 모든 PR이 열려 있고, draft가 아니며, 예상 순서에 있고, 저장소의 review와 check 요구사항을 만족하는지 확인한다. PR 상태는 각각 따로 판단한다. 위쪽 layer가 준비되었다고 해서 그 의존 PR들이 준비된 것은 아니다.

"stack을 머지한다"는 stack 전체를 선택한다. 일부만 머지하려면 명시적인 경계 PR이 필요하며, 가장 아래부터 그 경계까지의 모든 layer를 포함한다.

## stack API로 머지한다

stack 번호로 전체 stack을 머지한다.

```sh
gh stack merge <stack-number> --yes --merge
```

명시적으로 요청된 일부 머지는 경계 PR까지 머지한다.

```sh
gh stack merge <boundary-pr> --yes --merge
```

`--delete-branch`를 넘기거나, 의존 PR을 수동으로 retarget하거나, PR별 머지 명령을 실행하지 않는다. GitHub은 선택된 범위를 아래에서 위로 머지하고, 남은 위쪽 layer를 retarget/rebase한다. 직접 stack 머지는 전부 성공하거나 전부 실패한다. trunk가 merge queue를 쓰면 GitHub은 선택된 범위를 함께 대기열에 넣지만, 여러 그룹으로 나눠 land할 수 있다.

머지 요구사항을 우회하지 않는다. 네이티브 머지가 blocker를 보고하면, 그 blocker를 소유한 PR에서 확인하고 해결하거나 중단해서 보고한다. `gh pr merge`로 대체하지 않는다.

## landed 상태를 확인한다

선택된 모든 PR이 `MERGED`를 보고할 때까지 기다린다. 대기열에 들어간 요청은 완료된 land가 아니다.

```sh
gh pr view <pr> --json number,state,mergedAt,mergeCommit,baseRefName,headRefName
```

일부만 머지했다면 공식 stack을 다시 조회해서, 남은 모든 PR이 예상 순서로 여전히 연결되어 있고 stack trunk나 바로 아래 layer를 대상으로 하는지 확인한다. GitHub이 남은 layer를 rebase했을 수 있으므로, 현재 head, review 상태, CI를 다시 확인한다.

브랜치 삭제는 해당 PR이 `MERGED`를 보고한 뒤 별도의 마지막 단계에서만 한다. 각 브랜치를 지우기 전에, GitHub이 그 브랜치를 base로 쓰는 열린 PR이 없다고 보고하는지 확인한다.

```sh
gh pr list --state open --base <branch> --json number --jq length
```

결과가 `0`이 아니면 삭제를 막는다.

## 체크리스트

- [ ] 네이티브 `gh stack`을 쓸 수 있고, 모든 PR 브랜치가 같은 저장소에 있다.
- [ ] 현재 PR base와 정확한 head로 하나의 아래에서 위 의존 체인이 확인되었다.
- [ ] GraphQL이 예상 trunk, entry, 순서를 가진 공식 stack 하나를 보고한다. 자동 연결 대상인 같은 작성자의 unstack 체인은 자동으로 연결했다.
- [ ] 다시 쓴 layer는 관련 검증을 통과했고, 이후 review thread, 승인, mergeability, 검사를 다시 감사했다.
- [ ] 전체 stack 또는 명시적으로 제한된 앞부분을 `gh stack merge --yes --merge`로 제출했다.
- [ ] 선택된 모든 PR이 `MERGED`를 보고하며, 남은 위쪽 layer는 예상 공식 stack을 여전히 이룬다.
- [ ] 브랜치 삭제는 머지 상태와 의존 PR 0개를 확인한 뒤에만 했다.
