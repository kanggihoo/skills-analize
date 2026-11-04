# 변경을 PR로 올려 병합하는 스킬 다섯 개는 어떻게 이어지나 {#ship-group}

이 묶음의 스킬 다섯 개는 한 줄로 이어지지 않고 세 갈래로 이어진다. 테스트 설계(`dsh-ci-test-reliability`)와 push 전 검사(`dsh-pre-push-checks`)는 서로를 가리킨다. stack(서로 기대는 PR 체인) 병합(`dsh-merging-stacked-prs`)은 `gh stack sync`를 한 직후에 push 전 검사로 넘긴다. PR 설명(`dsh-pr-description`)은 GUI를 바꾸는 변경이면 `record-browser-gif`를 따른다.

- `dsh-ci-test-reliability`로 테스트 설계가 탄탄해지면, push 전에 돌릴 명령을 고르는 일은 `dsh-pre-push-checks`에 넘긴다(r20). 반대로 push로 나가는 변경이 자원 소유·비동기 테스트 등을 바꾸면, `dsh-pre-push-checks`는 먼저 `dsh-ci-test-reliability`에 맡겨 필요한 근거 종류를 정한다(r21).[](source:cir-link)[](source:cir-end)[](source:pp-ci)
- `dsh-merging-stacked-prs`와 `dsh-pre-push-checks`는 서로의 이름을 적지 않는다. 판정: 두 스킬이 `gh stack sync`가 다시 쓴 층을 올린 직후라는 같은 시점을 가리키므로, 둘이 이어진다고 본다(r22, 추론).[](source:stk-sync)[](source:pp-post)
- PR이 제품 사용자에게 보이는 GUI를 바꾸면, `dsh-pr-description`은 설명에 GIF를 넣는다. GIF를 넣을 때는 `record-browser-gif`를 따라 `--attach`를 쓴다(r23).[](source:pd-gui)[](source:pd-publish)
- `dsh-pre-push-checks`와 `dsh-pr-description`이 서로를 가리키는 문장은 원문에 명시 없음. 그래서 그림에 선을 긋지 않았다.

@answer scope="deepseek-harness/ship 묶음 · 스킬 5개의 원본 SKILL.md · 커밋 475505c · 관계는 relations.md의 rel-id 기준 · 지시상 동작이며 실행하지 않음"
@meta locale=ko
@source stk-fm title="deepseek-harness/dsh-merging-stacked-prs/SKILL.md · 7839B · frontmatter" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=1:4
@source stk-intro title="deepseek-harness/dsh-merging-stacked-prs/SKILL.md · 도입" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=8:8
@source stk-sync title="deepseek-harness/dsh-merging-stacked-prs/SKILL.md · 네이티브 cascading rebase" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=72:72
@source stk-link title="deepseek-harness/dsh-merging-stacked-prs/SKILL.md · 스택 연결" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=54:64
@source stk-merge title="deepseek-harness/dsh-merging-stacked-prs/SKILL.md · 스택 API로 병합" path=deepseek-harness/dsh-merging-stacked-prs/SKILL.md lines=85:99
@source pp-fm title="deepseek-harness/dsh-pre-push-checks/SKILL.md · 11283B · frontmatter" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=1:4
@source pp-intro title="deepseek-harness/dsh-pre-push-checks/SKILL.md · 도입" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=8:8
@source pp-ci title="deepseek-harness/dsh-pre-push-checks/SKILL.md · 테스트 신뢰성 스킬 먼저" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=31:31
@source pp-post title="deepseek-harness/dsh-pre-push-checks/SKILL.md · sync 직후 검증" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=88:95
@source pp-fail title="deepseek-harness/dsh-pre-push-checks/SKILL.md · 실패 처리" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=97:99
@source cir-fm title="deepseek-harness/dsh-ci-test-reliability/SKILL.md · 9442B · frontmatter" path=deepseek-harness/dsh-ci-test-reliability/SKILL.md lines=1:4
@source cir-link title="deepseek-harness/dsh-ci-test-reliability/SKILL.md · push 전 검사를 가리키는 절" path=deepseek-harness/dsh-ci-test-reliability/SKILL.md lines=16:16
@source cir-end title="deepseek-harness/dsh-ci-test-reliability/SKILL.md · 검증과 보고" path=deepseek-harness/dsh-ci-test-reliability/SKILL.md lines=131:131
@source pd-fm title="deepseek-harness/dsh-pr-description/SKILL.md · 18973B · frontmatter" path=deepseek-harness/dsh-pr-description/SKILL.md lines=1:5
@source pd-scope title="deepseek-harness/dsh-pr-description/SKILL.md · 범위" path=deepseek-harness/dsh-pr-description/SKILL.md lines=11:15
@source pd-gui title="deepseek-harness/dsh-pr-description/SKILL.md · GUI 변경 고지" path=deepseek-harness/dsh-pr-description/SKILL.md lines=63:63
@source pd-publish title="deepseek-harness/dsh-pr-description/SKILL.md · 설명 만들기와 고치기" path=deepseek-harness/dsh-pr-description/SKILL.md lines=202:202
@source rbg-fm title="deepseek-harness/record-browser-gif/SKILL.md · 15698B · frontmatter" path=deepseek-harness/record-browser-gif/SKILL.md lines=1:4
@source rbg-gui title="deepseek-harness/record-browser-gif/SKILL.md · GUI PR은 GIF 포함" path=deepseek-harness/record-browser-gif/SKILL.md lines=12:16
@source rbg-sep title="deepseek-harness/record-browser-gif/SKILL.md · 녹화와 게시 분리" path=deepseek-harness/record-browser-gif/SKILL.md lines=20:21
@source rbg-body title="deepseek-harness/record-browser-gif/SKILL.md · 본문 파일의 로컬 경로 참조" path=deepseek-harness/record-browser-gif/SKILL.md lines=128:128
@source rbg-head title="deepseek-harness/record-browser-gif/SKILL.md · 첨부 직전 head 확인" path=deepseek-harness/record-browser-gif/SKILL.md lines=136:148
@source tr-r25 title="deepseek-harness/dsh-translate-docs/SKILL.md · PR 전 doc-sync" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=69:69
@source web-r26 title="deepseek-harness/dsh-doc/references/website-sync.md · push 전 검사" path=deepseek-harness/dsh-doc/references/website-sync.md lines=87:87
@source fs-r27 title="deepseek-harness/dsh-find-simplifications/SKILL.md · 정해진 검사 밖" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=65:65
@source arc-r28 title="deepseek-harness/dsh-archive-agent-notes/SKILL.md · 보관 검증 뒤" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=66:66
@source perf-r29 title="deepseek-harness/dsh-speed-up-perf/SKILL.md · 적용과 보고" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=90:90

## 다섯 스킬은 어떤 순서와 조건으로 이어지나 {#flow span=12}

@workflow id=ship-flow title="ship 묶음 호출 관계"
| cir | dsh-ci-test-reliability | backend |
| pp | dsh-pre-push-checks | backend |
| stk | dsh-merging-stacked-prs | backend |
| pr | dsh-pr-description | backend |
| gif | record-browser-gif | frontend |
| cir > pp | 설계 뒤 | emphasis |
| stk > pp | sync 직후 | emphasis |
| pr > gif | GUI 변경이면 | emphasis |

@steps id=ship-steps
| s-cir | dsh-ci-test-reliability | flaky할 수 있는 테스트와 픽스처를 실제 CI 구조에서도 맞게 설계하고 리뷰하고 진단한다. 설계가 끝나면 push 전에 돌릴 명령 고르기를 `dsh-pre-push-checks`에 넘긴다. | ship-flow | cir |
| s-pp | dsh-pre-push-checks | push하거나 준비 완료로 표시하기 전에, 바뀐 범위를 덮는 가장 작은 테스트와 검사를 골라 한 번 돌린다. | ship-flow | pp |
| s-stk | dsh-merging-stacked-prs | 서로 기대는 stack을 GitHub 공식 stack으로 연결한다. 병합은 `gh stack merge`로만 한다. | ship-flow | stk |
| s-pr | dsh-pr-description | PR 설명의 네 개 절을 쓴다. PR이 바뀌거나 리뷰 라운드가 끝나면 설명을 고친다. | ship-flow | pr |
| s-gif | record-browser-gif | 제품 사용자에게 보이는 GUI를 바꾸는 PR이면, 데모 GIF를 녹화해서 인코딩한다. 첨부까지 맡았으면 GIF를 올린다. | ship-flow | gif |

각 스킬의 내부 규칙은 `deepseek-harness/dsh-ci-test-reliability/dsh-ci-test-reliability.html`, `deepseek-harness/dsh-pre-push-checks/dsh-pre-push-checks.html`, `deepseek-harness/dsh-merging-stacked-prs/dsh-merging-stacked-prs.html`, `deepseek-harness/dsh-pr-description/dsh-pr-description.html`, `deepseek-harness/record-browser-gif/record-browser-gif.html`에 있다.

화살표는 관계가 향하는 방향이고, 필수 실행 순서가 아니다. push → PR 생성 → 병합이라는 순서는 원문이 이 다섯 스킬 사이의 관계로 적지 않았으므로, 그림에는 선을 긋지 않았다.

| rel-id | from → to | 종류 | 조건·강도 | 그림 |
| --- | --- | --- | --- | --- |
| r20 | `dsh-ci-test-reliability` → `dsh-pre-push-checks` | 넘김 | 테스트 설계가 탄탄해진 뒤, push 전에 나가는 변경을 검증할 명령을 고르는 일은 따로 한다. 재시도한 결과, 건너뛴 테스트, 아직 끝나지 않은 CI를 통과라고 말하지 않는다[](source:cir-link)[](source:cir-end) | 그림 |
| r21 | `dsh-pre-push-checks` → `dsh-ci-test-reliability` | 내부 위임 | push로 나가는 변경이 자원 소유·비동기 테스트, 픽스처, 헬퍼, CI 실행 경로를 바꾸면, 먼저 이 스킬에 맡겨 필요한 근거 종류를 정한다. 명령은 여전히 `dsh-pre-push-checks`가 고른다[](source:pp-ci) | 생략(r20과 순환) |
| r22 | `dsh-merging-stacked-prs` → `dsh-pre-push-checks` | 넘김(추론) | `gh stack sync`가 다시 쓴 층을 올린 직후에, 바뀐 범위를 검사한다. 검사를 통과하기 전에는 병합하지 않고 준비됐다고도 말하지 않는다. 두 스킬은 서로의 이름을 적지 않는다[](source:stk-sync)[](source:pp-post) | 그림 |
| r23 | `dsh-pr-description` → `record-browser-gif` | 내부 위임 | 제품 사용자에게 보이는 GUI를 바꾸면, GIF와 그 고지를 설명에 넣는다. GIF가 없으면 설명에 없는 이유를 적는다. GIF를 넣을 때는 이 스킬을 따라 `--attach`를 쓴다[](source:pd-gui)[](source:pd-publish)[](source:rbg-gui) | 그림 |
| r24 | `dsh-pr-description` ↔ `dsh-merging-stacked-prs` | 공유 상태(추론) | stack 안의 PR마다 설명이 하나씩 있고, 각 설명은 그 층이 base 대비 바꾼 것만 다룬다[](source:pd-scope)[](source:stk-fm) | 생략(순서 없음) |
| r45 | `dsh-merging-stacked-prs` ↔ `dsh-pre-push-checks` | 공유 상태 | 두 스킬 모두 GitHub 공식 stack 객체와 `gh stack` 명령을 쓴다. stack 규칙·CI·순서·재지정·병합 상태는 GitHub 쪽에 있다[](source:stk-intro)[](source:pp-post) | 생략(순서 없음) |

r20과 r21은 서로를 가리키는 순환이다. 그림에는 설계 뒤 검사로 넘기는 r20만 그렸고, r21은 표에만 있다. r21은 중간에 끼어드는 근거 종류 확인이어서 명령을 고르는 책임은 바뀌지 않는다. r45의 `dsh-speed-up-perf`는 묶음 밖 스킬이다.

이 묶음 밖의 스킬이 `dsh-pre-push-checks`를 부르는 관계는 모두 넘김이고, 각 묶음 페이지에서 다룬다. 이 그림에는 없다.

- `dsh-translate-docs`는 PR 전에 `doc-sync`를 PR 단위로 한 번 돌릴 때 `dsh-pre-push-checks`를 따른다(r25).[](source:tr-r25)
- `dsh-doc`의 웹사이트 동기화는 push 전에 `dsh-pre-push-checks`를 쓴다(r26).[](source:web-r26)
- `dsh-find-simplifications`와 `dsh-archive-agent-notes`는 정해진 검사 밖의 검사를 `dsh-pre-push-checks`로 고른다(r27, r28).[](source:fs-r27)[](source:arc-r28)
- `dsh-speed-up-perf`는 `dsh-pre-push-checks`를 적용하고, 실행한 근거만 보고한다(r29).[](source:perf-r29)

## 어떤 상황에서 어느 스킬을 쓰나 {#when-to-use}

| 상황 | 쓰는 스킬 | 근거 |
| --- | --- | --- |
| 자원을 소유하거나 비동기이거나 플랫폼에 민감한 테스트, flaky한 CI | `dsh-ci-test-reliability` {good:테스트 설계} | 설명이 CI 동시 실행·시계·프로세스 전역 상태·비동기 정리 위험을 든다.[](source:cir-fm) |
| push, force-push, 준비 완료 표시, 검사 통과 주장 전 | `dsh-pre-push-checks` {good:검사 고르기} | 설명이 이 시점들을 호출 시점으로 든다.[](source:pp-fm) |
| `gh stack sync`로 다시 쓴 branch를 올린 직후 | `dsh-pre-push-checks` {caution:병합 전에 검증} | 검증이 끝날 때까지 병합하지 않고, 검증은 보류 중이라고 보고한다.[](source:pp-post) |
| PR을 만들거나 설명을 고칠 때, 리뷰 라운드가 끝났을 때 | `dsh-pr-description` | 설명이 이 두 시점을 호출 시점으로 든다. `user-invocable: false`로 되어 있다.[](source:pd-fm) |
| 제품 사용자에게 보이는 GUI 변경 PR | `record-browser-gif` {bad:생략 불가} | GIF를 넣는 것이 필수(MUST)다. GIF가 없으면 설명에 없는 이유를 적는다.[](source:rbg-gui)[](source:pd-gui) |
| 서로 기대는 stack(A ← B ← C)을 병합 | `dsh-merging-stacked-prs` | 설명이 stack PR 병합을 호출 시점으로 든다. 공식 stack을 쓸 수 없으면 중단한다.[](source:stk-fm) |

판정: 이 표는 원문이 적은 호출 시점을 상황별로 다시 묶은 것이다. 한 변경이 여러 행에 동시에 해당할 수 있고, 그럴 때 어느 스킬을 먼저 쓰는지는 원문이 정하지 않는다.

## 어떤 상태를 함께 쓰고 읽나 {#shared-state}

| 상태·장소 | 쓰는 스킬 | 읽는 스킬 | rel-id |
| --- | --- | --- | --- |
| PR 본문 파일(`.artifacts/pr/body.md` 같은 git 무시 대상 파일) | `dsh-pr-description`이 설명을 쓴다.[](source:pd-publish) `record-browser-gif`가 GIF의 로컬 경로 참조를 적는다.[](source:rbg-body) | `gh pr create`·`gh pr edit`의 `--body-file`, `--attach` | r23 |
| GitHub의 PR 설명(stack 안의 PR마다 하나) | `dsh-pr-description`이 만들고 고친다.[](source:pd-scope) `gh --attach`가 본문 속 참조를 올린 URL로 다시 쓴다.[](source:rbg-body) | `record-browser-gif`가 첨부 뒤 본문을 다시 읽어 확인한다.[](source:rbg-head) `dsh-merging-stacked-prs`가 읽는지는 원문에 명시 없음 | r23, r24 |
| GitHub 공식 stack(번호, 항목 순서, 병합 상태) | `dsh-merging-stacked-prs`가 연결하고 병합한다. 상태는 `gh stack`이 관리하는 GitHub 쪽 상태다.[](source:stk-link)[](source:stk-merge) | `dsh-pre-push-checks`가 sync 뒤 branch `head`와 stack 순서를 다시 조회한다.[](source:pp-post) | r45 |

판정: 이 묶음에는 다른 스킬이 쓴 결과를 읽고 실행 순서를 정하는 스킬이 없다. 세 상태는 모두 스킬들이 순서 없이 함께 쓰는 곳이다. stack 상태의 동작은 지시상 동작으로만 적었다.

@callout level=warning title="sync 직후에는 병합하지 않는다"
`gh stack sync`는 가져오기, cascading rebase(아래 층부터 차례로 하는 rebase), push를 한 번에 실행한다. 그래서 rebase와 push 사이에 로컬 검증을 끼울 수 없다.[](source:pp-post) 이 때문에 두 스킬이 같은 규칙을 적는다. 각 층의 검증이 통과하기 전에는 병합하지 않고, 준비됐다고도 말하지 않는다.[](source:stk-sync)[](source:pp-post) 검증이 실패하면 고쳐서 게시한다.[](source:pp-post)

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: 묶음 스킬 다섯 개의 `SKILL.md`(`dsh-ci-test-reliability`, `dsh-pre-push-checks`, `dsh-merging-stacked-prs`, `dsh-pr-description`, `record-browser-gif`)와 r25~r29의 출처 줄이다. 모두 원본이다.
- 읽지 않은 파일: `dsh-ci-test-reliability/references/ci-flake-diagnosis.md`, `record-browser-gif/scripts/`. 각 스킬 페이지 담당 범위다. 이 페이지의 관계에는 쓰이지 않는다.
- 원문 대조: r20, r21, r22, r23, r24, r45의 출처 줄을 원문과 대조했고 종류와 조건이 원장과 같다. r22와 r24는 원장도 추론으로 적은 관계다. 원장과 어긋난 곳은 찾지 못했다.
- `relations.md`는 아직 commit되지 않아 `@source`로 인용하지 않았다. `rel-id`는 본문에 적었다.
- 실제로 실행하지 않았다. 이 페이지의 흐름은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
이 다섯 스킬이 push → PR 생성 → 병합의 전체 순서를 정하는지는 원문에 명시 없음. `gh stack`과 GitHub 서버가 실제로 어떻게 동작하는지는 확인하지 않았다.
