# dsh-merging-stacked-prs 스킬은 에이전트를 어떻게 바꾸나 {#dsh-merging-stacked-prs-skill}

`dsh-merging-stacked-prs`가 켜지면 에이전트는 서로 기대는 stack(각 PR이 바로 아래 PR을 base branch로 삼는 체인)을 GitHub 공식 stack 객체와 `gh stack merge`로만 병합한다. PR을 하나씩 `gh pr merge`로 합치고 `gh pr edit`로 base branch를 바꾸는 방식으로 stack의 동작을 흉내 내지 않는다.[](source:skill-intro)

- 공식 stack을 쓸 수 없으면 에이전트는 중단한다. 쓸 수 없는 경우는 `gh stack --version`이 실패하거나 서버 쪽 stack 기능이 없을 때, 그리고 head branch가 다른 포크에 있을 때다. 한 PR씩 병합하는 방식으로 대신하지 않는다.[](source:skill-ver)
- 에이전트는 stack 소속을 base branch로 짐작하지 않고 GraphQL의 `PullRequest.stack`으로 확인한다.[](source:skill-graphql)
- stack에 없는 PR은 작성자가 모두 같을 때만 에이전트가 자동으로 `gh stack link`한다. 작성자가 다르면 사용자에게 묻는다.[](source:skill-link)
- 병합 요청을 냈다고 끝이 아니다. 에이전트는 선택한 PR이 모두 `MERGED`가 될 때까지 기다리고, branch 삭제는 별도의 마지막 단계로 둔다.[](source:skill-verify)[](source:skill-delete)

@answer scope="deepseek-harness/dsh-merging-stacked-prs · 원본 텍스트 파일 1개 · 커밋 475505c · 실행하지 않음"
@meta locale=ko
@source skill-fm title="deepseek-harness/dsh-merging-stacked-prs/SKILL.md · 7839B · frontmatter" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=1:4
@source skill-intro title="SKILL.md · 목적과 우선 규칙" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=8:8
@source skill-ver title="SKILL.md · 지원 확인과 중단" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=12:12
@source skill-meta title="SKILL.md · 깨끗한 워크트리와 PR 메타데이터" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=14:18
@source skill-graphql title="SKILL.md · 스택 소속 조회" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=20:46
@source skill-order title="SKILL.md · 기대 순서" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=48:48
@source skill-cmp title="SKILL.md · 기존 스택과 비교" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=52:52
@source skill-link title="SKILL.md · 빠진 구성원 연결" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=54:64
@source skill-never title="SKILL.md · 자동 해체 금지" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=66:66
@source skill-refresh title="SKILL.md · 필요할 때만 갱신" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=70:70
@source skill-native title="SKILL.md · cascading rebase" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=72:72
@source skill-mfwd title="SKILL.md · 점진적 merge-forward" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=73:73
@source skill-rewrite title="SKILL.md · 히스토리 재작성 뒤" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=75:75
@source skill-pre title="SKILL.md · 병합 범위 사전 점검" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=79:81
@source skill-merge title="SKILL.md · 스택 병합 명령" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=85:97
@source skill-nobypass title="SKILL.md · 요건 우회 금지" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=99:99
@source skill-verify title="SKILL.md · 병합 상태 확인" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=103:109
@source skill-delete title="SKILL.md · 브랜치 삭제" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=111:117
@source skill-check title="SKILL.md · 체크리스트" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=121:127

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`description`은 모델이 스킬을 켤지 판단할 때 읽는 설명이다. 여기 적힌 경우는 다음과 같다.

- 의존하는 GitHub stack(`A ← B ← C`, 각 PR이 바로 아래 PR을 base branch로 삼는다)을 `master`에 병합할 때다.[](source:skill-fm)
- base branch가 다른 열린 PR의 branch인 PR을 병합할 때다.[](source:skill-fm)
- 요청이 "stacked PRs", "PR stack", "dependent PRs"를 언급하거나 관련된 여러 PR을 차례로 병합하자고 할 때다.[](source:skill-fm)

이 문구들은 모델이 판단할 때 참고하는 신호일 뿐, 이 단어가 요청에 있어야 켜지는 키워드 목록이 아니다. `description`은 같은 저장소 안의 모든 의존 체인에 병합 전에 공식 stack 기능을 요구한다고 적는다.[](source:skill-fm) 호출 제한 필드는 원문에 명시 없음.

| 쓰지 못하는 상황 | 원문의 처리 |
| --- | --- |
| 공식 `gh stack` 확장이나 서버 쪽 stack 기능을 쓸 수 없다 | 하드 스톱. 한 PR씩 병합하고 base branch를 바꾸는 방식으로 대체하지 않는다[](source:skill-ver) |
| 체인에 다른 포크의 head branch가 있다(stack은 모든 head branch가 같은 저장소에 있어야 한다) | 하드 스톱[](source:skill-ver) |

## 어떤 순서로 병합하나 {#flow}

@workflow id=merge-flow title="GitHub 공식 stack 병합 순서"
| lane prep | 준비 |
| lane sync | 갱신 |
| lane land | 병합 |
| lane verify | 확인 |
| support | 지원 확인 | backend | prep |
| query | PR·stack 조회 | backend | prep |
| linked | stack에 다 있나? | backend | prep |
| link | 작성자 비교·연결 | backend | prep |
| need | 갱신 필요? | backend | sync |
| refresh | rebase 또는 merge-forward | backend | sync |
| pre | 병합 범위 점검 | backend | land |
| merge | `gh stack merge` | external | land |
| done | MERGED 확인 | backend | verify |
| del | branch 삭제 | security | verify |
| support > query | |
| query > linked | |
| linked > link | 아니오 |
| linked > need | 예 |
| link > need | |
| need > refresh | 예 |
| need > pre | 아니오 |
| refresh > pre | 검증 뒤 |
| pre > merge | | emphasis |
| merge > done | | emphasis |
| done > del | 0건 확인 |

@steps id=merge-steps
| m-support | 지원 확인 | 에이전트는 상태를 바꾸기 전에 `gh stack --version`을 돌린다. 깨끗한 전용 worktree를 쓰고, branch 이름이나 이전 보고 대신 현재 PR 메타데이터와 정확한 head OID 값을 가져온다.[](source:skill-ver)[](source:skill-meta) | merge-flow | support |
| m-query | PR·stack 조회 | 겉보기 체인마다 PR 하나 이상에서 `PullRequest.stack`과 `stackEntry.position`을 GraphQL로 조회한다. stack 소속의 근거는 base branch 추론이 아니라 이 공식 객체다. `size`가 한 페이지를 넘으면 `entries`를 페이지네이션한다. 기대 순서는 살아 있는 PR의 base branch에서 정한다. 맨 아래는 트렁크를 base branch로 삼고, 위의 PR은 바로 아래 PR의 head branch를 base branch로 삼는다.[](source:skill-graphql)[](source:skill-order) | merge-flow | query |
| m-linked | stack에 다 있나? | 기존 stack 항목을 기대 체인과 먼저 비교한다. 기존 stack 하나가 요청한 체인의 순서를 보존한 부분집합일 수는 있다. stack 번호가 여럿이거나 예상 밖 항목이 있거나 순서가 충돌하면, 어떤 변경도 하기 전에 사용자 지시를 받는다.[](source:skill-cmp) | merge-flow | linked |
| m-link | 작성자 비교·연결 | stack에 없는 PR이 있으면 모든 `author.login`을 정확히 비교한다. 모두 같으면 아래에서 위 순서로 `gh stack link --base <트렁크> <맨 아래 PR> ... <맨 위 PR>`을 자동으로 돌린다. 다르거나 작성자를 알 수 없으면, GitHub 상태를 바꾸기 전에 사용자에게 연결 여부를 묻는다. 연결한 뒤에는 GraphQL을 다시 조회해 stack 번호 하나, 기대한 트렁크, 완전한 PR 집합, 기대한 위치와 base 체인을 요구한다.[](source:skill-link) | merge-flow | link |
| m-need | 갱신 필요? | 새로 고칠 방법이 있다는 이유만으로 branch를 다시 쓰지 않는다. 살아 있는 병합 상태나 저장소 규칙이 갱신된 트렁크를 요구할 때만 갱신한다.[](source:skill-refresh) | merge-flow | need |
| m-refresh | rebase 또는 merge-forward | 갱신 방식으로 허용된 두 히스토리(cascading rebase, 점진적 merge-forward) 중 하나를 고른다. 두 방식은 아래 표에 적는다.[](source:skill-native)[](source:skill-mfwd) | merge-flow | refresh |
| m-pre | 병합 범위 점검 | 병합 직전에 공식 stack을 다시 조회한다. 선택된 PR이 모두 열려 있고, draft 상태가 아니고, 기대한 순서이고, 저장소의 리뷰·체크 요건을 지켜야 한다. PR마다 상태를 따로 본다. 맨 위 층이 준비됐다고 해서 그 층이 의존하는 아래 층도 준비된 것은 아니다.[](source:skill-pre) | merge-flow | pre |
| m-merge | `gh stack merge` | stack 번호로 전체를 병합한다. 사용자가 부분 병합을 명시로 요청했을 때만 경계 PR로 병합한다. `--delete-branch`를 주지 않고, 의존 PR의 base branch를 수동으로 바꾸지 않고, PR별 병합 명령을 내지 않는다.[](source:skill-merge) | merge-flow | merge |
| m-done | MERGED 확인 | 선택한 PR이 모두 `MERGED`로 보고될 때까지 기다린다. 큐에 올렸다고 병합이 끝난 것은 아니다. `gh pr view <PR> --json number,state,mergedAt,mergeCommit,baseRefName,headRefName`로 확인한다.[](source:skill-verify) | merge-flow | done |
| m-del | branch 삭제 | 해당 PR이 `MERGED`로 보고된 뒤 별도의 마지막 단계에서만 지운다. 지우기 전마다 `gh pr list --state open --base <브랜치> --json number --jq length`가 `0`이어야 한다. `0`이 아니면 삭제를 막는다.[](source:skill-delete) | merge-flow | del |

판정: 이 스킬은 병합 전에 확인을 두 번 요구한다. stack 소속과 순서를 처음 조회로 확인하고, 병합 직전에 다시 조회해 확인한다. 그 사이에 갱신이나 연결이 일어날 수 있기 때문이다.[](source:skill-graphql)[](source:skill-pre)

## 무엇을 강제하고 금지하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 병합은 `gh stack merge`로 한다. 개별 PR을 `gh pr merge`로 합치거나 `gh pr edit`로 base branch를 바꾸지 않는다[](source:skill-intro) | 금지 |
| 요건을 우회하지 않는다. 네이티브 병합이 막혔다고 알리면, 해당 PR에서 그 이유를 조사해 풀거나 멈추고 보고한다. `gh pr merge`로 대신하지 않는다[](source:skill-nobypass) | 금지 |
| 기존 stack을 자동으로 해체·재정렬·재구성하지 않는다. `gh stack link`는 추가만 하며, 이미 병합됐거나 큐에 오른 항목은 stack에서 뺄 수 없다고 원문이 적는다(지시상 동작)[](source:skill-never) | 금지 |
| 갱신은 필요할 때만 한다. cascading rebase branch를 쓰려는데 원격 stack이 로컬에 추적되지 않으면, `gh stack checkout <PR 또는 스택>`을 먼저 한다[](source:skill-refresh)[](source:skill-native) | 조건부 |
| cascading rebase 방식은 `gh stack sync`로 한다. 이 명령은 모든 활성 층을 rebase하고 lease(원격이 바뀌었으면 push를 막는 보호)가 걸린 `force-push`를 로컬 검증 전에 할 수 있다고 원문이 적는다(지시상 동작). sync 직후에는 다시 쓴 범위를 살피고, 영향받는 모든 층의 관련 검사를 돌린다. 검사가 통과할 때까지 병합하지도, 준비됐다고 하지도 않는다[](source:skill-native) | 의무 |
| rebase 충돌이 보고되면 `gh stack rebase`로 풀고 검증한 뒤 `gh stack push`로 게시한다. `gh stack checkout`이나 `gh stack sync`가 로컬·원격 stack 구성이 갈라졌다고 보고하면 취소하고 묻는다. 원격 stack을 자동으로 지우거나 다시 만들지 않는다[](source:skill-native) | 의무, 금지 |
| 점진적 merge-forward 방식은 트렁크를 영향받는 가장 아래 branch에 병합하고, 갱신된 부모를 아래에서 위로 차례로 자식에 병합해 정상 push로 올린다. 병합을 진행하는 동안 base branch가 앞서 나가면, 그 중간 상태를 보존한 뒤 더 새로운 끝을 병합한다[](source:skill-mfwd) | 의무 |
| 리뷰 뒤라면 어떤 히스토리 재작성도 허용되지만 commit OID 가정이 무효가 된다. push 뒤 정확한 head commit을 다시 가져오고, 미해결 리뷰 스레드·승인·병합 가능성·체크를 다시 감사한다. 날 `--force`를 쓰지 않고 동시에 앞선 원격 head commit을 덮어쓰지 않는다[](source:skill-rewrite) | 의무, 금지 |
| "stack을 병합해 내보내라"는 요청은 stack 전체를 고른다. 부분 병합은 명시한 경계 PR이 필요하고, 맨 아래부터 그 경계까지 모든 층을 포함한다[](source:skill-pre) | 의무 |
| 직접 stack 병합은 전부 되거나 전부 안 된다. 트렁크가 머지 큐를 쓰면 GitHub가 선택한 범위를 함께 큐에 넣지만 별도 그룹으로 착지시킬 수 있다고 원문이 적는다(지시상 동작)[](source:skill-merge) | 설명 |
| 병합하면 GitHub가 선택 범위를 아래에서 위로 병합하고 남은 위 층을 재지정·rebase한다고 원문이 적는다(지시상 동작). 부분 병합 뒤에는 남은 PR이 기대한 순서로 연결돼 있고 트렁크나 아래 층을 base branch로 삼는지 다시 조회하고, head·리뷰 상태·CI도 다시 확인한다[](source:skill-merge)[](source:skill-verify) | 의무 |

@facts id=commands
| 전체 병합 | `gh stack merge <스택 번호> --yes --merge`[](source:skill-merge) |
| 부분 병합 | `gh stack merge <경계 PR> --yes --merge`. 명시 요청과 경계 PR이 필요하다[](source:skill-merge) |
| 연결 | `gh stack link --base <트렁크> <맨 아래 PR> ... <맨 위 PR>`[](source:skill-link) |
| GraphQL 조회 | `entries(first: 100)`. `size`가 반환된 페이지를 넘으면 페이지네이션[](source:skill-graphql) |

## 사람은 언제 개입하고 언제 끝나나 {#human}

사용자에게 묻거나 지시를 받는 지점은 네 곳이다.

| 지점 | 상황 | 원문 |
| --- | --- | --- |
| 연결 전 | `author.login`이 서로 다르거나 하나라도 알 수 없다 | GitHub 상태를 바꾸기 전에 묻는다[](source:skill-link) |
| stack 비교 | stack 번호가 여럿이거나 예상 밖 항목이 있거나 순서가 충돌한다 | 어떤 변경도 하기 전에 사용자 지시를 받는다[](source:skill-cmp) |
| stack 구성 갈라짐 | `gh stack checkout`·`gh stack sync`가 로컬·원격 stack 구성이 갈라졌다고 보고한다 | 취소하고 묻는다[](source:skill-native) |
| 부분 병합 | 일부만 내보내려 한다 | 명시한 경계 PR이 있어야 한다[](source:skill-pre) |

종료 조건은 다음과 같다.[](source:skill-check)

- [ ] 네이티브 `gh stack` 지원이 있고 모든 PR branch가 같은 저장소에 있다.
- [ ] 살아 있는 PR의 base branch와 정확한 head commit이 아래에서 위로 가는 의존 체인 하나를 확정한다.
- [ ] GraphQL이 기대한 트렁크·항목·순서를 가진 공식 stack 하나를 보고한다. 자격이 되는 같은 작성자의 stack 없는 체인은 자동으로 연결했다.
- [ ] 다시 쓴 층은 관련 검증을 통과했고, 그 뒤 리뷰 스레드·승인·병합 가능성·체크를 다시 감사했다.
- [ ] 전체 stack이나 명시적으로 경계가 정해진 앞부분을 `gh stack merge --yes --merge`로 제출했다.
- [ ] 선택한 PR이 모두 `MERGED`로 보고되고, 남은 위 층이 있다면 여전히 기대한 공식 stack을 이룬다.
- [ ] branch 삭제는 병합 상태와 의존 PR 0건을 확인한 뒤에만 했다.

## 흐름 속 위치 {#position}

@workflow id=merging-position title="merging-stacked-prs 앞뒤의 스킬"
| perf | dsh-speed-up-perf | backend |
| me | dsh-merging-stacked-prs | backend |
| pp | dsh-pre-push-checks | backend |
| perf > me | stack을 만든 경우 | |
| me > pp | sync 직후 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `dsh-speed-up-perf`가 만든 공식 stack PR | - | 작업이 stack을 요구하면 `dsh-speed-up-perf`가 편집 전에 층을 정하고 공식 stack과 별도 worktree를 쓴다. 그렇게 만든 묶음이 이 스킬이 요구하는 조건에 맞는다. 서로 이름을 부르지 않는 추론 관계다 | r40 |
| `gh stack sync`가 다시 쓴 stack 층 | 층별 검증 결과 | `gh stack sync`가 다시 쓴 층을 게시한 직후 바뀐 범위를 검사하고, 통과 전에는 병합하거나 준비됐다고 하지 않는다. 서로 이름을 부르지 않는 추론 관계다 | r22 |
| `dsh-pr-description`의 PR 설명 | - | 순서 관계가 없는 공유 상태다. 묶음 안의 PR마다 자기 설명이 있고 그 층이 base 대비 바꾼 것만 다룬다. 그림에서 생략했다 | r24 |
| GitHub 공식 stack 객체 | - | `dsh-pre-push-checks`, `dsh-speed-up-perf`와 같은 stack 상태를 공유한다. stack 규칙·CI·순서·재지정·병합 상태는 GitHub가 갖는다. 상태는 `gh stack`과 GitHub가 관리하며 이 분석은 지시상 동작으로만 적는다. 그림에서 생략했다 | r45 |

`dsh-pre-push-checks` 쪽으로 가는 선의 근거는, 그 스킬의 `description`도 `gh stack sync`가 다시 쓴 branch를 올린 직후를 호출 시점으로 든다는 점이다.[](source:skill-native) 전체 흐름은 `deepseek-harness/_group-ship/ship.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `deepseek-harness/dsh-merging-stacked-prs/SKILL.md` 하나. 이 폴더에는 다른 텍스트 파일이 없다.
- 제외한 파일: 없다. 번역본도 없다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준).
- 실행하지 않았다. 원문의 `gh`, `git` 명령과 GraphQL 쿼리는 모두 지시상 동작이다. `gh stack`이 저장하는 상태는 외부 CLI와 GitHub가 관리한다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
원문이 링크한 루트 `AGENTS.md`(허용되는 merge-forward·rebase 히스토리)와 `docs/cookbook/responding-to-pr-review-on-a-stack.md`(리뷰 수정의 전파)는 원래 deepseek-harness 저장소의 파일이라 이 저장소에 없다. 범위 밖이다. 부분 병합의 경계 PR을 누가 정하는지는 원문에 "explicit boundary PR"이라고만 있고 정하는 주체는 명시 없음. `gh stack`의 실제 동작은 확인하지 못했다.
