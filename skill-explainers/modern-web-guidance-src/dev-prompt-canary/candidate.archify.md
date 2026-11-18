# dev-prompt-canary — `gd dev` 프롬프트 변경의 퇴행을 일부 재생성으로 확인 {#overview}

`dev-prompt-canary`는 `gd dev`가 쓰는 작성·채점 프롬프트나 생성 로직을 고친 뒤, 에이전트가 격리된 worktree에서 `task.md`와 `grader.ts`를 일부만 다시 만들어 `project-evals` 규칙을 지키는지 실제로 확인하게 하는 스킬이다.[](source:dpc-why)[](source:dpc-when)

- 쓰는 때: `src/authoring/dev-prompts.ts`, `src/authoring/dev.ts`, `src/grading/generate-grader.ts`, `src/grading/template.grader.ts`를 고칠 때마다다. description은 "프롬프트나 생성 로직을 고칠 때는 언제나"라고 쓴다.[](source:dpc-front)[](source:dpc-when)
- 결과: 실험 A(`task.md` 8개), B1(`grader.ts`와 held-out 4번째 해답 patch), B2(빈 guard와 조건부 expectation) 결과가 나온다. 정리 단계에서 scratch worktree를 지운다.[](source:dpc-a)[](source:dpc-b1)[](source:dpc-b2)[](source:dpc-clean)
- 다른 스킬과의 관계: 확인 기준은 `project-evals`의 규칙이다(참고). `project-evals`와 `grader-replay`가 이 스킬을 쓰라고 안내한다(다음 안내).[](source:dpc-when)
- 하지 않는 것: 활성 feature worktree의 `guides/`를 바꾸지 않는다. scratch worktree에서만 돌린다.[](source:dpc-step1)

@answer scope="modern-web-guidance-src/dev-prompt-canary · 원본 파일 1개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source dpc-front title="이름과 description" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=1:8
@source dpc-why title="단위 테스트의 한계와 쓰는 때" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=10:14
@source dpc-when title="고칠 때 이 canary를 돌린다" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=14:14
@source dpc-mech title="부분 재생성 방법과 소요 시간" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=18:24
@source dpc-step1 title="1단계 격리 worktree" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=30:38
@source dpc-step2 title="2단계 병렬 canary 서브에이전트" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=40:42
@source dpc-a title="실험 A task.md 재생성 행렬" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=44:49
@source dpc-b1 title="실험 B1 grader.ts 재생성과 4번째 해답" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=51:62
@source dpc-b2 title="실험 B2 vacuous guard canary" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=64:67
@source dpc-clean title="3단계 정리" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=69:74
@source pe-front title="project-evals 이름과 description" path=modern-web-guidance-src/project-evals/SKILL.md lines=1:4
@source pe-hub title="project-evals의 연결 안내" path=modern-web-guidance-src/project-evals/SKILL.md lines=136:136
@source gr-rel title="grader-replay의 관련 스킬 안내" path=modern-web-guidance-src/grader-replay/SKILL.md lines=78:81

## 어떻게 동작하나 {#flow span=12}

원문은 부분 재생성 방법을 먼저 설명하고, 3단계 실행 절차를 번호로 지시한다. 2단계에서 서브에이전트 3개가 실험 A, B1, B2를 나눠 맡는다. 실험 안의 세부 판정은 상세 후보로 보냈다.[](source:dpc-mech)[](source:dpc-step2)

@workflow id=flow-diagram title="dev-prompt-canary 흐름"
| lane prep | 준비 |
| lane run | 병렬 실험 |
| lane end | 정리 |
| wt | scratch worktree 만들기 | backend | prep | source:dpc-step1 |
| a | 실험 A task.md | backend | run | source:dpc-a |
| b1 | 실험 B1 grader.ts | backend | run | source:dpc-b1 |
| b2 | 실험 B2 guard | backend | run | source:dpc-b2 |
| clean | worktree 정리 | backend | end | source:dpc-clean |
| wt > a | 서브에이전트 |
| wt > b1 | 서브에이전트 |
| wt > b2 | 서브에이전트 |
| a > clean | |
| b1 > clean | |
| b2 > clean | |

@steps id=flow-steps
| s-wt | scratch worktree 만들기 | **입력** 후보 commit · **실행** `git worktree add -B exp/canary-eval .worktrees/canary-eval HEAD`, `ln -s ../../node_modules .worktrees/canary-eval/node_modules`, `ln -s ../../.env .worktrees/canary-eval/.env` · **출력** `.worktrees/canary-eval`. **처리** 에이전트가 후보 commit에서 따로 worktree를 만들어, 활성 worktree의 `guides/`를 건드리지 않게 한다.[](source:dpc-step1) **다음** 활성 feature worktree의 `guides/`는 바꾸지 않는다(금지). | flow-diagram | wt |
| s-a | 실험 A task.md | **입력** 4개 guide와 2개 app(`daily-grind`, `devtools-times`) · **참조** `project-evals`의 `task.md` 규칙 · **실행** 원문은 `extractGuideDescription`, `buildTargetTaskPrompt`, `runAgent` 호출 또는 `task.md`만 지우고 `devGuide(dir, { test: false, targets: [app] })` 실행 · **출력** 새 `task.md` 8개. **처리** 서브에이전트가 `task.md`만 다시 만들고 OLD와 NEW를 규칙에 대어 diff한다.[](source:dpc-a)[](source:dpc-mech) **다음** 4개 guide마다 새 `task.md`가 막아야 할 누수가 정해져 있다(`prefers-reduced-motion`, `window.Translator`, `autofill`·`srcset`·`fetchpriority`, `signalAllAcceptedCredentials`·`signalUnknownCredential`). | flow-diagram | a |
| s-b1 | 실험 B1 grader.ts | **입력** `guides/security/passkey-management`의 `devtools-times` · **참조** `src/core/grader-lint.ts` · **실행** `devGuide('guides/security/passkey-management', { test: false, targets: ['devtools-times'] })`, `runPlaywright` · **출력** 새 `grader.ts`, calibration 결과, 4번째 해답 patch 통과율. **처리** 서브에이전트가 `targets/devtools-times/grader.ts`만 지워 다시 만들고, 보지 못한 4번째 해답 patch로 일반화를 확인한다.[](source:dpc-b1) **다음** calibration에서 `claude`, `codex`, `jetski`/`antigravity`가 100%, `zero-passrate`가 0%, lint 위반이 0이어야 한다. 4번째 해답 patch는 100%를 요구한다(Require). | flow-diagram | b1 |
| s-b2 | 실험 B2 guard | **입력** `guides/built-in-ai/translator`, `guides/security/local-network-access`의 `devtools-times` · **실행** `devGuide(dir, { test: false, targets: ['devtools-times'] })` · **출력** 새 `grader.ts` 둘. **처리** 서브에이전트가 `grader.ts`를 지우고 다시 만들어 빈 guard와 조건부 expectation 처리를 확인한다.[](source:dpc-b2) **다음** `translator`는 `expect(false).toBe(true)` guard가 사라져야 하고, `local-network-access`는 검증할 수 없는 조건부 검사를 빼야 한다. | flow-diagram | b2 |
| s-clean | worktree 정리 | **입력** scratch worktree · **실행** `git worktree remove --force .worktrees/canary-eval`, `git branch -D exp/canary-eval` · **출력** 정리된 저장소. **처리** 에이전트가 실험이 끝나면 worktree와 임시 branch를 지운다.[](source:dpc-clean) | flow-diagram | clean |

위 실험의 시간은 원문 근거의 수치다. 처음부터 `gd dev <guide>`를 돌리면 guide당 약 25분이고, 부분 재생성은 `task.md` 8개에 약 45초, `grader.ts`는 target당 2~3분이다. 전체 canary는 약 4분이라고 쓴다.[](source:dpc-mech)

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령은 원문에 명시 없음. 모델이 description을 보고 켠다. 호출 제한 필드는 없다[](source:dpc-front) |
| 성격 | worktree를 격리해 프롬프트 변경의 결과를 직접 다시 만들어 확인하는 검증 절차 |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `project-evals` {#r16} | **이 스킬** | 다음 안내 | `src/authoring/dev-prompts.ts`, `dev.ts`, `generate-grader.ts`를 고칠 때 쓰라고 한다. "그때만"이라는 제한 표현은 없다.[](source:pe-hub)[](source:dpc-when) |
| `grader-replay` {#r21} | **이 스킬** | 다음 안내 | `gd dev` 프롬프트 생성을 검증하려는 경우는 `grader-replay`를 쓰지 말고 이 스킬을 쓰라고 한다.[](source:gr-rel)[](source:dpc-front) |
| **이 스킬** {#r19} | `project-evals` | 참고 | 다시 만든 `task.md`와 `grader.ts`가 `project-evals` 규칙을 지키는지가 확인 기준이다.[](source:dpc-when)[](source:dpc-a)[](source:pe-front) |

@architecture id=relation-map title="dev-prompt-canary와 이어지는 스킬"
| pe | project-evals | backend |
| gr | grader-replay | backend |
| self | dev-prompt-canary(이 스킬) | backend |
| pe > self | 다음 안내 |
| gr > self | 다음 안내 |
| self > pe | 참고 |

@code source=dpc-front language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 부분 재생성 방법과 3단계 실행 절차, 실험 A·B1·B2의 대상과 합격 기준을 담은 유일한 파일이다 | 스킬이 켜질 때 읽는다 | scratch worktree 만들기, 실험 A task.md, 실험 B1 grader.ts, 실험 B2 guard, worktree 정리 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 활성 feature worktree의 `guides/` | 바꾸지 않는다(Never). scratch worktree에서만 실행한다 | [](source:dpc-step1) |
| 실험 B1의 calibration | `claude`, `codex`, `jetski`/`antigravity`는 100%, `zero-passrate`는 0%, grader-lint 위반 0을 확인한다 | [](source:dpc-b1) |
| 실험 B1의 held-out 4번째 해답 patch | 100% 통과를 요구한다(Require). 통과하지 못하면 어떻게 하는지는 원문에 명시 없음 | [](source:dpc-b1) |
| 실험 B2 `translator` | `if (files.length === 0) { expect(false).toBe(true); return; }` guard가 없어져야 한다 | [](source:dpc-b2) |
| 실험 B2 `local-network-access` | `codex-solution.patch`에 iframe이 0개(`totalIframes === 0`)이므로 검증할 수 없는 조건부 검사를 빼야 한다. `items.length === 0 \|\| ...` 식의 빈 guard를 쓰지 않는다 | [](source:dpc-b2) |
| 서브에이전트 | `Model: "flash"`로 3개를 병렬로 띄운다 | [](source:dpc-step2) |
| 사용자 승인 | 원문에 명시 없음 | [](source:dpc-step1) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 실험 A의 guide 4개와 막아야 할 누수 — 실험 A task.md · 개요에는 누수 이름만 요약했다.
- 실험 B1의 4번째 해답 patch 변형 4가지 — 실험 B1 grader.ts · 변형 이름만 상세로 보냈다(helper 이름, 타입 단언, 파일 간 wrapper, `.catch()` 처리).

@callout level=open-question title="확인하지 못한 것"
| `src/authoring/dev.ts`, `dev-prompts.ts`, `src/grading/*`, `src/core/grader-lint.ts`와 `guides/` 아래 대상 guide는 이 컬렉션에 없다. `devGuide`와 `runPlaywright`의 동작은 코드로 확인하지 못했다. 명령은 모두 지시상 동작이고 실행하지 않았다. |

읽은 원본: 텍스트 파일 1개. 제외: 없음.
