# interface-review 스킬은 에이전트를 어떻게 바꾸나 {#interface-review-skill}

`interface-review`를 쓰면 에이전트는 화면 대신 **변경**을 리뷰한다. 범위를 `$BASE`로 못 박고, 바뀐 파일이 닿는 화면을 최대 5곳까지 넓혀 보고, 지워진 줄을 읽고, 모든 지적에 `Introduced`, `Regression`, `Pre-existing` 중 하나를 붙인다. 지적을 합치고 심각도와 판정을 정하는 일은 `better-interface`에 넘긴다.[](source:ir-own)[](source:ir-s3)[](source:ir-s4)[](source:ir-s5)[](source:ir-s7)

- 켜지는 때: **사용자가 명시적으로 부를 때만**이다. `disable-model-invocation: true`이고 `agents/openai.yaml`도 `allow_implicit_invocation: false`다. 호출 인자 전체가 대상이다(`/interface-review pr 482`).[](source:ir-fm)[](source:oy-all)[](source:ir-s1)
- 강제하는 것: 변경이 없으면 `HEAD~1..HEAD`로 스스로 때우지 않고 묻는다. 작업 트리는 읽기 전용이고 `git fetch`만 쓴다.[](source:ir-s2)[](source:ir-mut)
- 대표 수치: 영향 화면은 합계 최대 5곳, `Pre-existing` 보고는 최대 3개다.[](source:ir-s3)[](source:ir-out-pre)
- 쓰면 안 되는 때: 화면·흐름·저장소 전체 리뷰는 `better-interface`의 몫이다. 정확성·테스트·보안·성능은 프로젝트의 일반 코드 리뷰 몫이라, 한 번 짚고 접는다.[](source:ir-own)[](source:ir-s2)

@answer scope="design/jakubkrehel/interface-review · 원본 텍스트 4개 21,124B · 커밋 0465878 · 명시 호출 전용 · 관계 확인용으로 다른 스킬 일부 줄만 읽음 · 지시는 읽기만 하고 실행하지 않음 · 지시상 동작"
@meta locale=ko
@source ir-fm title="design/jakubkrehel/interface-review/SKILL.md · 10128B · 지시 본문과 frontmatter" path=design/jakubkrehel/interface-review/SKILL.md lines=1:5
@source ir-own title="SKILL.md · 변경 리뷰와 역할 분담" path=design/jakubkrehel/interface-review/SKILL.md lines=7:13
@source ir-change title="SKILL.md · 변경을 보지 코드베이스를 보지 않는다" path=design/jakubkrehel/interface-review/SKILL.md lines=15:19
@source ir-s1 title="SKILL.md · 1 변경 범위를 먼저 정한다" path=design/jakubkrehel/interface-review/SKILL.md lines=21:33
@source ir-s2 title="SKILL.md · 2 변경이 없으면 만들지 않고 묻는다" path=design/jakubkrehel/interface-review/SKILL.md lines=35:46
@source ir-s3 title="SKILL.md · 3 diff는 화면이 아니다" path=design/jakubkrehel/interface-review/SKILL.md lines=48:54
@source ir-s4 title="SKILL.md · 4 제거된 줄을 읽는다" path=design/jakubkrehel/interface-review/SKILL.md lines=56:60
@source ir-s5 title="SKILL.md · 5 지적마다 status를 붙인다" path=design/jakubkrehel/interface-review/SKILL.md lines=62:78
@source ir-s6 title="SKILL.md · 6 변경을 의도와 대조한다" path=design/jakubkrehel/interface-review/SKILL.md lines=80:91
@source ir-s7 title="SKILL.md · 7 better-interface에 넘긴다" path=design/jakubkrehel/interface-review/SKILL.md lines=93:97
@source ir-mut title="SKILL.md · 작업 트리를 바꾸지 않는다" path=design/jakubkrehel/interface-review/SKILL.md lines=99:103
@source ir-mist title="SKILL.md · 끝내기 전 점검 표 9행" path=design/jakubkrehel/interface-review/SKILL.md lines=105:117
@source ir-out-scope title="SKILL.md · 출력 범위 블록" path=design/jakubkrehel/interface-review/SKILL.md lines=119:133
@source ir-out-find title="SKILL.md · 출력 지적 표" path=design/jakubkrehel/interface-review/SKILL.md lines=135:141
@source ir-out-pre title="SKILL.md · 출력 Pre-existing 절" path=design/jakubkrehel/interface-review/SKILL.md lines=143:149
@source sr-def title="design/jakubkrehel/interface-review/scope-resolution.md · 7611B · 범위 해석 규칙 · 기본 branch" path=design/jakubkrehel/interface-review/scope-resolution.md lines=5:7
@source sr-targets title="scope-resolution.md · 대상과 점 두 개·세 개" path=design/jakubkrehel/interface-review/scope-resolution.md lines=9:17
@source sr-pr title="scope-resolution.md · pull request" path=design/jakubkrehel/interface-review/scope-resolution.md lines=19:31
@source sr-awk title="scope-resolution.md · 까다로운 저장소 상태 3가지" path=design/jakubkrehel/interface-review/scope-resolution.md lines=33:41
@source sr-nothing title="scope-resolution.md · 리뷰할 것이 없을 때 모을 사실" path=design/jakubkrehel/interface-review/scope-resolution.md lines=43:47
@source sr-ren title="scope-resolution.md · rename" path=design/jakubkrehel/interface-review/scope-resolution.md lines=49:53
@source sr-excl title="scope-resolution.md · 제외 경로 표와 예외 2개" path=design/jakubkrehel/interface-review/scope-resolution.md lines=55:68
@source sr-excl-trap title="scope-resolution.md · 제외 경로가 조용히 모자라는 함정 2개" path=design/jakubkrehel/interface-review/scope-resolution.md lines=70:76
@source sr-cons title="scope-resolution.md · 소비자로 넓히는 순서" path=design/jakubkrehel/interface-review/scope-resolution.md lines=78:92
@source rs-tab title="design/jakubkrehel/interface-review/removed-signals.md · 3228B · 제거 신호 표 · 신호와 담당 스킬" path=design/jakubkrehel/interface-review/removed-signals.md lines=3:17
@source rs-eq title="removed-signals.md · 신호를 지우는 대체물 7개" path=design/jakubkrehel/interface-review/removed-signals.md lines=19:29
@source rs-search title="removed-signals.md · 제거된 쪽만 검색하는 법" path=design/jakubkrehel/interface-review/removed-signals.md lines=31:43
@source oy-all title="design/jakubkrehel/interface-review/agents/openai.yaml · 157B · UI 표시 이름과 암묵 호출 정책" path=design/jakubkrehel/interface-review/agents/openai.yaml lines=1:5
@source bi-change title="design/jakubkrehel/better-interface/SKILL.md · r66·r67 확인용 변경 요청 처리" path=design/jakubkrehel/better-interface/SKILL.md lines=28:32
@source rf-chg title="design/jakubkrehel/better-interface/review-format.md · r67 확인용 변경 리뷰일 때" path=design/jakubkrehel/better-interface/review-format.md lines=44:46
@source bi-verify title="design/jakubkrehel/better-interface/SKILL.md · 검증 절(이 스킬이 대신하는 쪽)" path=design/jakubkrehel/better-interface/SKILL.md lines=59:61
@source var-scope title="design/jakubkrehel/variant/SKILL.md · r104 확인용" path=design/jakubkrehel/variant/SKILL.md lines=11:11
@source brk-scope title="design/jakubkrehel/break/SKILL.md · r112 확인용" path=design/jakubkrehel/break/SKILL.md lines=11:11
@source sm-scope title="design/jakubkrehel/state-machine/SKILL.md · r124 확인용" path=design/jakubkrehel/state-machine/SKILL.md lines=11:11
@source afk-scope title="design/jakubkrehel/afk/SKILL.md · r126 확인용" path=design/jakubkrehel/afk/SKILL.md lines=11:11
@source exp-scope title="design/jakubkrehel/explain-interface/SKILL.md · r129 확인용" path=design/jakubkrehel/explain-interface/SKILL.md lines=11:11
@source bd-scope title="design/jakubkrehel/build-design/SKILL.md · r141 확인용" path=design/jakubkrehel/build-design/SKILL.md lines=12:12

## 언제 켜지고, 무엇을 맡지 않나 {#trigger}

@code source=ir-fm language=yaml

`disable-model-invocation: true`가 있으므로 모델은 대화를 보고 이 스킬을 스스로 켜지 못한다. 같은 폴더의 `agents/openai.yaml`도 같은 뜻이다.[](source:oy-all)

@code source=oy-all language=yaml

사용자는 인자로 대상을 준다. 인자 전체가 대상이어서 `/interface-review pr 482`는 pull request 482를 리뷰한다. 받는 대상은 `working`, `staged`, `branch`, `pr <n>`, 이름만 쓴 `<ref>`, `<a>..<b>`나 `<a>...<b>` 범위다. 그 밖의 입력은 모두 `<ref>`로 본다.[](source:ir-s1)[](source:sr-targets)

이 스킬은 변경에서 생긴 인터페이스 문제만 다룬다. 작성자가 묻는 것은 "내가 더 나쁘게 만들었나?"이고, 변경이 닿기만 한 오래된 문제는 거의 말하지 않는다. 오래된 문제를 3개 말하는 것은 배려이고 30개는 아무도 부탁하지 않은 다른 리뷰다.[](source:ir-change)

| 하려는 일 | 이 스킬 대신 | 원문이 말하는 처리 |
| --- | --- | --- |
| 화면·흐름·저장소 전체를 리뷰한다 | `better-interface` {caution:범위 밖} | 변경이 없을 때 사용자가 고르면, 이 스킬의 범위 블록·status·pre-existing 절 없이 저장소 범위 리뷰로 넘긴다[](source:ir-s2) |
| 정확성, 테스트, 보안, 성능을 본다 | 프로젝트의 일반 코드 리뷰 {caution:범위 밖} | 그런 걱정은 한 번 이름만 대고 그 리뷰를 가리킨 뒤 접는다. 일반 리뷰 스킬의 이름은 `원문에 명시 없음`[](source:ir-own) |
| 도메인 규칙으로 판단한다 | `better-*` 도메인 스킬 | 이 스킬은 범위·분류·변경 보고서만 가진다[](source:ir-own) |
| 변경이 너무 많다고 지적한다 | 해당 없음 | 범위가 크다는 것은 프로세스 문제여서 보고하지 않는다[](source:ir-s6) |

## 범위는 어떻게 정해지나 {#scope}

대상을 주지 않으면 아래 순서로 정하고, 처음 맞는 곳에서 멈춘다.[](source:ir-s1)

@workflow id=scope-flow title="리뷰 범위 결정"
| inv | 대상을 줬나? | backend |
| tgt | 대상 해석 | backend |
| ahead | HEAD가 base보다 앞서나? | backend |
| rng | branch 범위 + 미커밋 | backend |
| dirty | 작업 트리가 변경됐나? | backend |
| wt | 미커밋 변경 | backend |
| none | 변경 없음 | external |
| ask | 경로를 제시하고 대기 | external |
| inv > tgt | 예 |
| inv > ahead | 아니오 |
| ahead > rng | 예 | emphasis |
| ahead > dirty | 아니오 |
| dirty > wt | 예 | emphasis |
| dirty > none | 아니오 |
| none > ask | |

@steps id=scope-steps
| ss-inv | 대상을 줬나? | 인자 전체가 대상이다. 대상이 있으면 아래 "대상별 풀이" 표대로 푼다.[](source:ir-s1) | scope-flow | inv |
| ss-ahead | HEAD가 base보다 앞서나? | `HEAD`가 `git merge-base origin/<default-branch> HEAD`보다 앞서면, 그 범위에 미커밋 변경을 **더해** 본다. commit 수와 미커밋 파일 수를 따로 적는다.[](source:ir-s1) | scope-flow | ahead |
| ss-dirty | 작업 트리가 변경됐나? | 앞서지 않았지만 작업 트리가 더러우면 미커밋 변경을 본다.[](source:ir-s1) | scope-flow | dirty |
| ss-ask | 경로를 제시하고 대기 | 둘 다 아니면 리뷰할 변경이 없다. 아래 네 경로를 제시하고 사용자 답을 기다린다.[](source:ir-s2) | scope-flow | ask |

범위 블록에는 해석한 범위의 base commit을 `$BASE`로 적고, 이 스킬과 참조 문서의 모든 명령이 그것을 쓴다. 잠금 파일, 스냅숏, 생성물, vendored 코드, 바이너리는 제외하고 무엇을 제외했는지 적는다. 제외하고 남은 것이 없으면 변경이 없는 것으로 본다.[](source:ir-s1)

| 대상별 풀이 | 규칙 |
| --- | --- |
| branch | merge base 기준으로 점 세 개(`...`) diff를 쓴다. 점 두 개는 base에 올라온 upstream commit까지 변경으로 센다[](source:sr-targets) |
| 사용자가 쓴 `<a>..<b>` | 끝점끼리 비교한다. 점을 마음대로 세 개로 바꾸면 `release`와 merge base 사이가 빠진다[](source:sr-targets) |
| 사용자가 쓴 `<a>...<b>` | `merge-base(<a>, <b>)`와 `<b>`를 비교한다. 해석한 범위를 범위 블록에 적는다[](source:sr-targets) |
| 미커밋 변경 포함 | `git diff HEAD`는 추적 파일만 보여 주므로 `git ls-files --others --exclude-standard`를 짝지어야 한다. 아니면 새 컴포넌트가 조용히 빠진다[](source:sr-targets) |
| `pr <n>` | head를 `refs/remotes/pr/<n>`로 가져와 제자리에서 읽는다. base는 default branch로 가정하지 않고 `gh pr view <n> --json baseRefName,baseRefOid`로 읽는다. 파일은 `git show refs/remotes/pr/<n>:path`로 읽고 작업 트리 사본은 열지 않는다[](source:sr-pr) |
| `working`, `staged` | 이 둘이 정확히 무엇을 가리키는지는 `원문에 명시 없음`이다. 받는 대상 목록에만 나온다[](source:sr-targets) |

pull request 줄 번호는 작업 트리와 다를 수 있으므로 head ref에 대해 인용하고, 그 ref와 SHA를 범위 블록에 선언한다. `gh pr view`의 `title`과 `body`는 6단계의 의도로 쓰고, body가 비었으면 commit 제목을 더한다.[](source:sr-pr)

default branch는 `refs/remotes/origin/HEAD`, 그다음 `gh repo view --json defaultBranchRef` 순으로 찾는다. ref가 없으면 `git remote set-head origin --auto`로 묻는다. remote가 아예 없으면 로컬 `main`이나 `master`를 쓰되 어느 쪽을 가정했는지 밝힌다.[](source:sr-def)

| 저장소 상태 | 원문의 처리 |
| --- | --- |
| Detached HEAD | default branch와의 merge base를 쓰고, 범위 블록에 branch 대신 SHA를 적는다[](source:sr-awk) |
| Shallow clone(CI 기본) | `merge-base`가 아무것도 돌려주지 않는다. `--deepen=50`으로 가져와 다시 시도하고, 그다음 `--deepen=200`, 그래도 안 되면 범위를 해석 불가로 보고한다. `.git`에만 쓰므로 허용되고 Verification에 적는다[](source:sr-awk) |
| rebase·merge 도중 | 조용히 틀리는 경우다. `git rev-parse --git-path`로 `rebase-merge`, `rebase-apply`, `MERGE_HEAD`, `CHERRY_PICK_HEAD`를 확인한다. `.git/` 경로는 linked worktree에서 디렉터리가 아니므로 직접 검사하지 않는다. 작업 도중이라고 말하고 멈춘다[](source:sr-awk) |
| 그 밖의 실패(관련 없는 history, commit 없는 저장소, 옮겨진 submodule 포인터) | `merge-base`에서 소리 내어 실패한다. base를 해석할 수 없다고 말하고 멈춘다. 이름을 댈 수 없는 범위는 리뷰하지 않는다[](source:sr-awk) |

rename은 삭제와 추가가 아니라 이동으로 본다. 옮기면서 고친 파일은 `--find-renames=40%`로 유사도 문턱을 낮추고, 살아남은 코드는 바뀌지 않은 것으로 보며 실제 수정만 범위에 든다.[](source:sr-ren)

제외 경로는 기계가 쓴 파일이라 인터페이스 규칙이 없다. 범위 블록에 제외한 것을 적는다.[](source:sr-excl)

| 분류 | 패턴 |
| --- | --- |
| 잠금 파일 | `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lock`, `bun.lockb`, `Cargo.lock`, `composer.lock`, `Gemfile.lock`, `poetry.lock`, `uv.lock` |
| 스냅숏·fixture | `__snapshots__/`, `*.snap`, `*.approved.*`, `test-results/`, `playwright-report/` |
| 생성 출력 | `dist/`, `build/`, `out/`, `.next/`, `.turbo/`, `.svelte-kit/`, `coverage/`, `storybook-static/`, `*.min.js`, `*.min.css`, `*.map` |
| 생성 소스 | `*.gen.ts`, `*.generated.*`, 빌드가 내보낸 `*.d.ts`, GraphQL·Prisma client 출력 |
| vendored 코드 | `vendor/`, `third_party/`, `node_modules/` |
| 바이너리·미디어 | `*.png`, `*.jpg`, `*.webp`, `*.avif`, `*.woff2`, `*.mp4`, `*.pdf` |

예외는 두 가지로, 이때는 파일 바이트가 아니라 참조하는 코드를 리뷰한다. 추가·교체한 **폰트 파일**은 `better-typography` 변경이다. 컴포넌트에 추가한 **이미지**는 outline과 `alt` 텍스트를 거쳐 `better-ui`와 `better-accessibility` 변경이다.[](source:sr-excl)

제외 패턴이 조용히 모자라는 곳이 두 군데 있다. `*.lock`은 `package-lock.json`과 `pnpm-lock.yaml`을 못 잡으므로 표의 모든 접미사를 써야 한다. `glob` 마법 없이는 `**/dist/**`가 루트의 `dist/`를 놓친다. 제외 pathspec을 넣고 뺀 diff를 둘 다 돌려, 파일 수가 이름 댄 파일 수만큼 줄었는지 확인한다.[](source:sr-excl-trap)

변경이 없으면 먼저 사실을 모은다. 현재 branch, base보다 앞선 개수, 마지막 commit의 SHA와 제목, `gh pr status`가 보여 주는 열린 pull request다.[](source:sr-nothing) `gh pr status`는 열린 PR이 없어도 성공하고 `currentBranch`를 빼므로 빈 결과는 답이다. `gh`가 없거나 인증이 없거나 GitHub remote가 없으면 실패하므로, 실패는 "PR 없음"으로 보고 말한 뒤 남은 경로를 제시한다.[](source:sr-nothing)

@list id=ask-routes ordered=true
| 현재 branch의 열린 pull request. 있으면 맨 앞에 둔다. commit이 이미 병합된 branch는 변경 없음이 되지만 그 PR은 사용자가 뜻한 것이다 |
| 마지막 commit `HEAD~1..HEAD`. 짧은 SHA와 제목을 적어 사용자가 무엇을 받는지 보게 한다 |
| 사용자가 이름 댄 대상. `pr <n>`, branch, ref, 범위 |
| 저장소 전체 인터페이스 감사. 변경 리뷰가 아니므로 `better-interface`에 저장소 범위 리뷰로 넘긴다 |

제외 때문에 범위가 비었다면 그 파일 이름을 제안에 적는다. 아무것도 리뷰하지 않은 것을 `Approve`로 보고하지 않는다. 제안한 뒤에는 기다린다.[](source:ir-s2)

## 어떤 순서로 리뷰하고 status를 붙이나 {#procedure}

@workflow id=review-flow title="interface-review 7단계"
| tgt | 1 범위 정하기 | backend |
| chg | 변경이 있는가? | backend |
| ask | 2 묻고 대기 | external |
| exp | 3 영향 화면 확장 | backend |
| rem | 4 제거된 줄 읽기 | backend |
| cls | 5 status 붙이기 | backend |
| intent | 6 의도와 대조 | backend |
| hand | 7 better-interface에 넘김 | backend |
| tgt > chg | |
| chg > ask | 없음 |
| chg > exp | 있음 | emphasis |
| exp > rem | |
| rem > cls | |
| cls > intent | |
| intent > hand | |

@steps id=review-steps
| rv-tgt | 1 범위 정하기 | 앞 절의 범위 결정 그림대로 대상과 `$BASE`를 정하고, 제외 경로를 뺀다.[](source:ir-s1) | review-flow | tgt |
| rv-ask | 2 묻고 대기 | 변경이 없으면 최근 commit으로 대신하지 않는다. 마지막 commit은 merge나 남의 작업일 때가 많다. 사실을 모아 네 경로를 제시하고 기다린다.[](source:ir-s2) | review-flow | ask |
| rv-exp | 3 영향 화면 확장 | 바뀐 파일은 증거일 뿐이고, 그것이 렌더되는 화면이 리뷰 대상이다. 기본은 직접 import하는 쪽·호출하는 쪽 한 단계다. design token, 테마 값, 공유 primitive만 두 단계까지 간다. 합계 최대 5곳이고, 확장하지 않은 개수를 밝힌다.[](source:ir-s3) | review-flow | exp |
| rv-rem | 4 제거된 줄 읽기 | 회귀는 변경 후 상태에서 보이지 않는다. 모든 hunk의 `-` 쪽을 아래 제거 신호 표에 맞춰 읽는다.[](source:ir-s4) | review-flow | rem |
| rv-cls | 5 status 붙이기 | 지적마다 `Introduced`, `Regression`, `Pre-existing` 중 하나를 붙인다. 위치가 아니라 원인으로 정한다.[](source:ir-s5) | review-flow | cls |
| rv-intent | 6 의도와 대조 | pull request 제목·본문, 연결된 issue, commit 메시지를 읽고 인터페이스가 주장한 것을 주는지 본다. 빠진 상태를 찾는다.[](source:ir-s6) | review-flow | intent |
| rv-hand | 7 better-interface에 넘김 | 범위 블록, 영향받은 화면, 모든 지적의 status를 넘기고 아래 형식으로 보고한다.[](source:ir-s7) | review-flow | hand |

diff는 전체를 읽은 뒤에 의견을 만든다. 훑어본 diff는 다음 hunk가 이미 고친 코드에 대한 지적을 낳는다.[](source:ir-change)

영향 화면은 규칙으로 정한 순서로 5곳을 고른다. 근거는 "재현할 수 있는 순서"다.[](source:sr-cons)

| 순서 | 기준 |
| --- | --- |
| 1 | route·layout 진입점. `app/**/page.*`, `app/**/layout.*`, `pages/**`, `routes/**`, `src/views/**`, `*.astro` 페이지 |
| 2 | importer 수. 20개 파일이 가져오는 컴포넌트가 2개가 가져오는 것보다 변경을 더 많이 나른다 |
| 3 | 동점이면 같은 package나 기능 디렉터리를 먼저 본다 |

소비자를 찾을 때는 프로젝트 자체 resolver가 있으면 그것을, 없으면 import 경로를 쓴다. `git grep`은 기본으로 작업 트리를 찾으므로 리뷰할 ref를 패턴 뒤에 줘야 한다. 변경된 token이나 테마 값은 파일이 아니라 token 이름으로 찾고, `--color-*`처럼 대시로 시작하는 패턴은 `-e`를 붙인다. 순서가 어느 지점부터 임의였다면 그렇다고 말한다.[](source:sr-cons)

@callout level=note title="제거된 줄은 단서이지 지적이 아니다"
- 신호가 맞는다고 곧 회귀는 아니다. 변경 안에 대체물이 없을 때만 회귀이고, 그 판단은 담당 도메인 스킬이 한다.[](source:ir-s4)
- 맞지 않는 제거마다 담당 스킬로 보내고, 그 스킬이 확인한 것만 `Regression`으로 보고한다.[](source:ir-s4)

| 제거된 줄(`-` 쪽) | 담당 | 확인할 것 |
| --- | --- | --- |
| `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-live`, `role=` | `better-accessibility` | 컨트롤·영역이 접근 가능한 이름·설명·안내를 잃었다 |
| `alt=`, `<label`, `for=`, `htmlFor`, `scope=` | `better-accessibility` | 이미지·필드·표 셀이 프로그램상 연결을 잃었다 |
| `<button>`, `<a>`, `<nav>`, `<main>`, `<ul>`이 `div`나 `span`으로 바뀜 | `better-accessibility` | 스타일링과 맞바꿔 키보드·보조 기술 동작이 사라졌다 |
| `:focus-visible`, `:focus`, `outline`, `tabindex` | `better-accessibility` | focus 표시를 잃었거나 tab 순서에서 빠졌다 |
| `prefers-reduced-motion` | `better-accessibility` | 모션이 시스템 설정을 무시한다 |
| `prefers-contrast` | `better-colors` | 색이 대비 설정을 무시한다 |
| 논리 속성이 `left`/`right`로 바뀜 | `better-layout` | 방향을 따르는 레이아웃이 사라졌다 |
| `lang=`, `dir=` | `better-typography` | 언어 정보나 텍스트 방향이 사라졌다 |
| `text-wrap`, `line-clamp`, `overflow-wrap`, `tabular-nums`, `font-feature-settings` | `better-typography` | 글자 렌더링·줄바꿈·숫자 정렬이 조용히 바뀌었다 |
| 색 token이 리터럴로, 또는 더 옅은 token으로 바뀜 | `better-colors` | 렌더된 대비 쌍이 깨졌을 수 있으니 측정한다 |
| 사용자에게 보이는 문자열이 삭제되거나 줄어듦 | `better-writing` | 라벨·에러·빈 상태가 담던 정보를 잃었다 |

위 표는 신호 11행이다.[](source:rs-tab) 신호를 지우는 대체물이 변경 안에 있으면 라우팅 전에 제거를 버린다.[](source:rs-eq)

@list id=equivalents
| `aria-label`이 보이는 글자를 가리키는 `aria-labelledby`로 바뀜 |
| 요소가 네이티브 동등물이 되어 명시한 `role`이 빠짐. 예: `div`가 `<button>`이 되면서 `role="button"`이 빠짐 |
| `outline`이 같은 `:focus-visible` 선택자의 `box-shadow` ring으로 바뀜 |
| 이제 기본으로 focus되는 요소에서 `tabindex="0"`이 빠짐 |
| 색 리터럴이 같은 값의 token으로 바뀜 |
| 물리 속성이 논리 속성으로 바뀜. 회귀가 아니라 고침이다 |
| 문자열이 삭제가 아니라 번역 카탈로그로 옮겨짐 |

제거된 쪽만 검색할 때는 추가가 가리지 않게 삭제된 줄로 한정한다. 제외 pathspec을 `--` 뒤에 넘기고, 패턴은 `aria-`, `role=`, `alt=`, `focus`, `outline`, `tabindex`, `prefers-`, `lang=`, `dir=`, `text-wrap` 등이다. 미커밋 작업이 포함된 대상은 `<head-ref>`를 빼서 작업 트리와 비교한다.

제거된 문자열과 바뀐 색 token은 패턴이 없으므로 hunk를 직접 읽는다. `-U0`은 맥락을 숨기므로 판단 전에 둘러싼 hunk를 읽는다.[](source:rs-search)

| status | 뜻 | 예 |
| --- | --- | --- |
| `Introduced` | 변경이 만들었다 | 새로 더한 컴포넌트의 빠진 이름[](source:ir-s5) |
| `Regression` | 변경이 원래 맞던 것을 약하게 했다 | `aria-label` 삭제[](source:ir-s5) |
| `Pre-existing` | 변경 전에 있었고 더 나빠지지 않았다 | 변경 근처의 오래된 문제[](source:ir-s5) |

status는 위치가 아니라 원인으로 정한다. 바뀐 줄이 만든 지적은 어디서 드러나든 `Introduced`나 `Regression`이고, 바뀐 token의 건드리지 않은 소비자도 그렇다. 변경이 만들지도 악화하지도 않은 지적은 hunk에서 세 줄 떨어져 있어도 `Pre-existing`이다.[](source:ir-s5)

줄이 변경보다 앞서는지는 리뷰한 범위에 `git blame -L`을 쓴다. `^` 접두사는 base 이후 바뀌지 않은 줄이다. 미커밋 작업은 범위를 빼고, `Not Committed Yet`이거나 `$BASE..HEAD` 안 commit에 blame된 줄은 변경의 것이다.[](source:ir-s5)

6단계에서 찾는 "불완전한 변경"은 표면 리뷰가 놓치는 것이다. 존재하는 상태만 보기 때문이다. 아래 네 가지 빠진 것을 찾는다.[](source:ir-s6)

@list id=incomplete
| 새 variant·size·테마가 hover, focus, active, disabled, loading, selected 중 일부 상태에만 적용됨 |
| 프로젝트가 관리하는 번역 카탈로그에 항목이 없는 새 문자열 |
| empty, loading, error, disabled, 좁은 너비 상태가 없는 새 컴포넌트 |
| 비슷한 컨트롤이 있는 다른 화면에는 없이 한 화면에만 더한 컨트롤 |

7단계에서 `better-interface`가 없으면, 해석한 범위와 파일 목록을 보고하고 없는 스킬을 이름 댄 뒤 멈춘다. 심각도 척도, cap, 판정을 지어내지 않는다.[](source:ir-s7)

## 어떤 보고서로 끝나고, 무엇을 하지 않나 {#output}

보고서는 범위 블록으로 연다. 필드는 일곱 개다.[](source:ir-out-scope)

| 필드 | 값(원문의 보기) |
| --- | --- |
| Target | `branch`, `working`, `staged`, `pr 482` 또는 입력한 범위 |
| Base ref | `origin/main` at `a1b2c3d` |
| Head ref | `refs/remotes/pr/482` at `e4f5g6h` |
| Commits | 7 committed, 2 files uncommitted |
| Files in scope | 제외 후 12 |
| Excluded | 제외한 파일과 디렉터리 이름 |
| Surfaces expanded | `CheckoutPage`, `SettingsPanel`. 확장하지 않은 `Button` 소비자 3개 |

위 값은 원문의 보기일 뿐 정해진 값이 아니다. `better-interface`의 coverage 표가 그다음에 온다. 변경 범위에 증거가 없는 도메인은 `Not reviewed: no evidence in the change scope`이며, 이것은 빈틈이 아니라 coverage 진술이다.[](source:ir-out-scope)

지적 표는 `better-interface` 형식에 `Status` 열을 더한다. 열은 `Severity`, `Domain`, `Status`, `Location`, `Before`, `After`, `Why`다. `Introduced`나 `Regression` 지적이 없으면 표를 빼고 "No actionable interface findings in this change."라고 쓴다.[](source:ir-out-find)

`Pre-existing`은 따로, **최대 3개**, 심각도 높은 순으로 쓰고 "이 변경의 책임이 아니다"라고 분명히 한다. 없으면 절을 뺀다. 열은 `Severity`, `Domain`, `Location`, `Issue`다. Verification과 판정은 `better-interface` 형식을 따른다.[](source:ir-out-pre)

그쪽은 이 리뷰를 받으면 `Introduced`와 `Regression`만 cap과 판정에 센다. 그래서 `Pre-existing`만 있는 변경은 `Approve`다.[](source:bi-change)

@callout level=warning title="작업 트리를 바꾸는 명령은 쓰지 않는다"
- 변경 리뷰는 checkout까지 포함해 읽기 전용이다. `git fetch`는 `.git`에만 쓰므로 허용된다.[](source:ir-mut)
- `gh pr checkout`, `git checkout`, `git switch`, `git stash`는 작성자가 열어 둔 파일을 덮어쓰므로 **절대** 쓰지 않는다. PR ref는 fetch해서 제자리에서 읽는다.[](source:ir-mut)

렌더 검증은 이 스킬에서 선택이다. `better-interface`의 "검증할 수 있는 것은 검증한다" 대신 이 규칙이 적용된다.[](source:ir-mut)[](source:bi-verify)

프로젝트가 값싼 preview를 노출하거나 사용자가 렌더 리뷰를 요청한 경우가 아니면, 시각·런타임 주장은 **Not verified**로 표시한다. `working`과 `branch`는 checkout이 곧 head이므로 제자리에서 렌더한다. 다른 대상은 `git worktree add /tmp/review-<n> refs/remotes/pr/<n>` 같은 격리 worktree에서 렌더하고, 끝나면 지운다.[](source:ir-mut)

끝내기 전에 아래 실수를 점검한다.[](source:ir-mist)

| 실수 | 고침 |
| --- | --- |
| 범위 블록이 미커밋 파일만 세는데 `HEAD`가 merge base보다 앞선다 | branch 범위에 미커밋 변경을 더해 두 개수를 모두 적는다 |
| 사용자가 고르지 않은 `HEAD~1..HEAD`로 보고한다 | 사실을 말하고 "묻고 대기" 경로를 제시한다 |
| 바뀐 공유 컴포넌트의 소비자가 `Surfaces expanded`에 없다 | 소비자로 넓히고 건너뛴 것을 적는다 |
| 지워진 `aria-label`, `outline`, `prefers-reduced-motion`에 지적도 메모도 없다 | 제거 신호 표로 담당 스킬에 보낸다 |
| 지워진 속성이 diff 다른 곳에서 다시 나오는데 `Regression`이다 | 대체물 7개를 먼저 확인한다 |
| 바뀐 token의 건드리지 않은 소비자 지적이 `Pre-existing`이다 | 변경이 만들었으므로 `Introduced`나 `Regression`이다 |
| 어떤 hunk에도 없는 줄이 원인 변경 없이 `Introduced`다 | 리뷰한 범위에 blame을 돌린다 |
| 명령 기록에 `gh pr checkout`이나 `git switch`가 있다 | ref를 fetch하고 `git show`로 읽는다 |
| 인용한 줄이 `git show <head-ref>:path`와 맞지 않는다 | 범위 블록에 적은 head ref에 대해 인용한다 |

@facts
| 영향 화면 | 두 단계 합계 최대 5곳. 기본 한 단계, token·테마·공유 primitive만 두 단계(의무)[](source:ir-s3) |
| `Pre-existing` 보고 | 최대 3개, 높은 순(의무)[](source:ir-out-pre) |
| shallow clone | `--deepen=50` 다음 `--deepen=200`, 그다음 해석 불가[](source:sr-awk) |
| rename 유사도 | 옮기며 고친 파일에 `--find-renames=40%`(권고: "낮춘다")[](source:sr-ren) |
| 제거 신호 표 | 11행. 대체물 7개[](source:rs-tab)[](source:rs-eq) |
| 끝내기 전 점검 | 9행[](source:ir-mist) |

## 흐름 속 위치 {#position}

@workflow id=review-position title="interface-review 앞뒤"
| u-user | 사용자 명시 호출 | external |
| u-ir | interface-review | backend |
| u-bi | better-interface | backend |
| u-dom | 도메인 스킬 5개 | backend |
| u-out | 순위 보고서와 판정 | external |
| u-user > u-ir | | emphasis |
| u-ir > u-bi | 범위·status | |
| u-ir > u-dom | 제거된 줄 | dashed |
| u-bi > u-out | | |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| 사용자(앞) | 대상을 담은 인자 | - | 명시 호출만 받으므로 실제 시작점은 사람이다[](source:ir-fm)[](source:oy-all) | - |
| `better-interface`(앞, 요청하는 쪽) | 변경 범위 요청 | - | 의무형. `better-interface`는 변경 요청을 받으면 직접 해석하지 않고 사용자에게 이 스킬 실행을 부탁한다. 이 스킬은 사용자 호출 전용이라 그쪽에서 시작할 수 없다[](source:bi-change)[](source:ir-fm) | r66 |
| `better-interface`(뒤) | - | 범위 블록, 영향받은 화면, 모든 지적의 status | 의무형. 심각도·통합·coverage·cap·판정은 그쪽 소유다. 그쪽이 없으면 해석한 범위와 파일 목록만 보고하고 멈춘다. 그쪽은 이 리뷰의 `Introduced`와 `Regression`만 cap과 판정에 센다[](source:ir-own)[](source:ir-s7)[](source:bi-change)[](source:rf-chg) | r67 |
| `better-interface`(뒤, 선택지) | - | 저장소 범위 리뷰 | 제안. 변경이 없을 때 사용자에게 보여 주는 선택지 하나다. 사용자가 고를 때만, 이 스킬의 범위 블록·status·pre-existing 절 없이 넘긴다[](source:ir-s2) | r68 |
| `better-accessibility`(뒤) | 일치한 제거 줄 | 제거된 줄 | 조건부. 제거 신호가 표와 맞을 때만 보낸다. 신호는 단서일 뿐이고 대체물이 변경 안에 없을 때만 회귀다. 담당 스킬이 확인한 것만 `Regression`이다[](source:ir-s4)[](source:rs-tab) | r69 |
| `better-colors`(뒤) | 일치한 제거 줄 | 제거된 줄 | r69와 같은 조건. 신호는 `prefers-contrast`와 색 token 교체[](source:rs-tab) | r70 |
| `better-layout`(뒤) | 일치한 제거 줄 | 제거된 줄 | r69와 같은 조건. 신호는 논리 속성이 `left`/`right`로 바뀐 것[](source:rs-tab) | r71 |
| `better-typography`(뒤) | 일치한 제거 줄 | 제거된 줄 | r69와 같은 조건. 신호는 `lang=`·`dir=`와 `text-wrap` 계열[](source:rs-tab) | r72 |
| `better-writing`(뒤) | 일치한 제거 줄 | 제거된 줄 | r69와 같은 조건. 신호는 삭제·축약된 사용자 문자열[](source:rs-tab) | r73 |
| `better-ui` | - | - | 참고. 제거 신호 표에는 담당 행이 없다. 제외 경로의 예외로 컴포넌트에 추가된 이미지가 `better-ui`와 `better-accessibility` 변경이 된다[](source:sr-excl) | r74 |
| `variant` | - | - | 역할 구분. 기존 UI 리뷰는 이 스킬 몫이다. `variant`는 후보를 만들 뿐 순위를 매기지 않는다[](source:var-scope) | r104 |
| `break` | - | - | 역할 구분. 코드를 기준에 맞춰 리뷰하는 일은 이 스킬 몫이다. `break`는 눈에 띄게 깨진 것만 관찰한다[](source:brk-scope) | r112 |
| `state-machine` | - | - | 역할 구분. 끝난 작업 리뷰는 이 스킬 몫이다[](source:sm-scope) | r124 |
| `afk` | - | - | 역할 구분. diff 리뷰는 이 스킬 몫이다. `afk`가 이 스킬을 실행한다는 지시는 없다[](source:afk-scope) | r126 |
| `explain-interface` | - | - | 역할 구분. 기준에 맞춘 리뷰는 이 스킬 몫이다. `explain-interface`는 평가하지 않고 설명한다[](source:exp-scope) | r129 |
| `build-design` | - | - | 역할 구분. 끝난 작업 리뷰는 이 스킬 몫이다[](source:bd-scope) | r141 |

판정: 여러 스킬이 이 스킬을 가리키지만 모두 역할 구분이다. 이 스킬이 명시 호출만 받으므로, 다른 스킬이 "리뷰는 `interface-review`"라고 해도 에이전트가 이 스킬을 자동으로 이어 실행하지는 못한다.[](source:ir-fm)

그림은 사용자 → 이 스킬 → `better-interface` → 보고서(r67)와 조건부 점선(r69~r73)만 그렸다. r66은 사용자에게 부탁하는 경로라, r68은 사용자가 고를 때만이라, r74와 r104·r112·r124·r126·r129·r141은 참고나 역할 구분이라 표에만 남겼다.

전체 흐름은 `design/_group-interface-audit/interface-audit.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 4개, 합계 21,124B다. `SKILL.md` 10,128B, `scope-resolution.md` 7,611B, `removed-signals.md` 3,228B, `agents/openai.yaml` 157B를 모두 읽었다. 구조·표본만 본 파일은 0개다.
- 관계 확인용으로 다른 스킬 9곳의 해당 줄만 읽었다. `better-interface` 28~32줄·44줄·59~61줄과 `review-format.md` 44~46줄, `variant` 11줄, `break` 11줄, `state-machine` 11줄, `afk` 11줄, `explain-interface` 11줄, `build-design` 12줄이다.
- 제외한 파일: 번역본과 바이너리는 이 폴더에 없다(`find`로 확인, 파일 4개).
- 원문 대조 범위: 활성화 제한 2개(`disable-model-invocation: true`, `allow_implicit_invocation: false`), 7단계와 금지 절, 대상 6종, 제외 경로 6분류와 예외 2개, 까다로운 상태 3가지, 제거 신호 11행과 대체물 7개, status 3개, 빠진 상태 4개, 출력 범위 블록 7필드, 수치(5곳, 3개, 50·200, 40%), 끝내기 전 점검 9행을 모두 대조했다. 관계 행 r66~r74, r104, r112, r124, r126, r129, r141은 원장과 원문을 다시 대조했다.
- 분석 중 바뀐 파일: 없음. `design/` 아래 작업 트리는 commit `0465878` 그대로다.
- 사람 검토: 미실시.

@callout level=open-question title="확인하지 못한 것"
- `working`과 `staged`가 정확히 어떤 diff를 뜻하는지는 `원문에 명시 없음`이다.
- 일반 코드 리뷰로 가리킬 스킬의 이름은 원문에 없다.
- 렌더 검증 규칙이 `better-interface`의 검증 절을 대신한다는 문장(`SKILL.md` 103줄)은 원장에 관계 행이 없다.[](source:ir-mut)[](source:bi-verify)
- 이 스킬을 실제로 불러 리뷰를 받아 보지 않았다. 출력 형식과 명령 금지를 지키는지는 확인하지 않았다.
