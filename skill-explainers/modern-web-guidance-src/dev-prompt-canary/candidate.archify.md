# dev-prompt-canary는 gd dev 프롬프트를 고친 뒤 무엇을 실험으로 확인하나? {#dev-prompt-canary-page}

`gd dev`의 작성·채점 프롬프트나 생성 로직을 고치면, 격리한 worktree에서 `task.md`와 `grader.ts`만 일부 다시 만들어 규칙이 깨졌는지 확인한다. 단위 테스트는 프롬프트 템플릿에 문자열이 있는지만 보므로 LLM이 실제로 만든 결과의 퇴행은 잡지 못한다.[](source:why)

- 수정 대상 파일은 `dev-prompts.ts`, `dev.ts`, `generate-grader.ts`, `template.grader.ts` 네 개다.[](source:why)
- 실험은 세 가지다. A는 `task.md` 8개(guide 4개 × app 2개), B1은 held-out 4번째 풀이 stress test, B2는 vacuous guard 확인이다.[](source:expa)[](source:b1)[](source:b2)
- 작업은 `guides/`를 건드리므로 현재 feature worktree가 아니라 새 임시 worktree에서만 한다.[](source:wt)
- 끝나면 임시 worktree와 branch를 강제로 지운다.[](source:clean)

@answer scope="로컬 원본 분석 · SKILL.md 74줄 전체 읽음 · gd, git, node 명령은 실행하지 않음 · 원본 저장소의 src/ 파일은 이 컬렉션에 없어 확인하지 못함"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source full title="modern-web-guidance-src/dev-prompt-canary/SKILL.md · 5781B · 스킬 본문(74줄 전체)" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md
@source front title="modern-web-guidance-src/dev-prompt-canary/SKILL.md · 5781B · frontmatter" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=1:8
@source why title="modern-web-guidance-src/dev-prompt-canary/SKILL.md · 5781B · 단위 테스트의 한계와 사용 시점" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=12:14
@source mech title="modern-web-guidance-src/dev-prompt-canary/SKILL.md · 5781B · 부분 재생성 방식과 소요 시간" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=18:24
@source wt title="modern-web-guidance-src/dev-prompt-canary/SKILL.md · 5781B · 1단계 임시 worktree" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=30:38
@source sub title="modern-web-guidance-src/dev-prompt-canary/SKILL.md · 5781B · 병렬 서브에이전트" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=40:42
@source expa title="modern-web-guidance-src/dev-prompt-canary/SKILL.md · 5781B · 실험 A" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=44:49
@source b1 title="modern-web-guidance-src/dev-prompt-canary/SKILL.md · 5781B · 실험 B1" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=51:62
@source b2 title="modern-web-guidance-src/dev-prompt-canary/SKILL.md · 5781B · 실험 B2" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=64:67
@source clean title="modern-web-guidance-src/dev-prompt-canary/SKILL.md · 5781B · 정리" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=69:74
@source pe-hub title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 참조 확인용 부분 읽음(136줄)" path=modern-web-guidance-src/project-evals/SKILL.md lines=136:136
@source pe-bar title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 참조 확인용 부분 읽음(8 red lines)" path=modern-web-guidance-src/project-evals/SKILL.md lines=31:46
@source pe-task title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 참조 확인용 부분 읽음(task.md 규칙)" path=modern-web-guidance-src/project-evals/SKILL.md lines=69:80
@source gr-desc title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · description 부정 조건" path=modern-web-guidance-src/grader-replay/SKILL.md lines=3:10
@source gr-rel title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · Related Skills" path=modern-web-guidance-src/grader-replay/SKILL.md lines=77:81

## 언제 켜지고, 무엇을 막으려 하나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻은 아니다. `disable-model-invocation` 필드는 원문에 명시 없음.[](source:front)

@code source=front language=yaml

원문은 아래 네 파일 중 하나라도 고치면 이 canary를 돌리라고 한다. "Whenever you modify"라고 쓰므로 선택이 아니라 변경 때마다 하는 절차로 읽힌다.[](source:why)

| 수정 대상 | 역할 |
|---|---|
| `src/authoring/dev-prompts.ts` | `gd dev`의 작성 프롬프트. 원문은 역할을 따로 설명하지 않는다.[](source:why) |
| `src/authoring/dev.ts` | `devGuide`가 들어 있고 파일 존재 여부로 단계를 건너뛰는 증분 로직이 있다.[](source:mech) |
| `src/grading/generate-grader.ts` | grader 생성 로직. 원문은 역할을 따로 설명하지 않는다.[](source:why) |
| `src/grading/template.grader.ts` | grader 템플릿. 원문은 역할을 따로 설명하지 않는다.[](source:why) |

판정 · 확인 기준은 `project-evals`의 규칙이다. 원문은 새로 만든 `task.md`와 `grader.ts`가 그 규칙을 지키는지 본다고 쓰고, 실험 A는 `task.md` 규칙에 직접 대조한다.[](source:why)[](source:expa)[](source:pe-task)

다른 변경에 쓰지 말라는 문장은 이 스킬에 원문에 명시 없음. 반대 방향은 `grader-replay`가 description에서 "`gd dev` 프롬프트 생성 검증에는 `dev-prompt-canary`를 쓰라"고 적는다.[](source:gr-desc)

## 어떤 순서로 돌리나? {#run}

전체를 처음부터 돌리면 guide 하나에 약 25분이 걸린다. golden 풀이 patch 3개, `zero-passrate.patch`, `task.md`, `grader.ts`를 만들고 전체 평가까지 돌리기 때문이다. 그래서 `dev.ts`의 파일 존재 검사를 이용해 필요한 파일만 지우고 다시 만든다.[](source:mech)

@workflow id=canary-flow title="canary 실행 순서"
| wt | 임시 worktree 만들기 | backend |
| a | 실험 A | backend |
| b1 | 실험 B1 | backend |
| b2 | 실험 B2 | backend |
| clean | worktree 지우기 | security |
| wt > a | 병렬 | emphasis |
| wt > b1 | 병렬 | emphasis |
| wt > b2 | 병렬 | emphasis |
| a > clean | |
| b1 > clean | |
| b2 > clean | |

@steps id=canary-steps
| wt-step | 임시 worktree 만들기 | 후보 commit에서 `exp/canary-eval` branch로 `.worktrees/canary-eval`을 만든다. `node_modules`와 `.env`는 symlink로 연결한다.[](source:wt) | canary-flow | wt |
| a-step | 실험 A | `daily-grind`와 `devtools-times`에서 guide 4개의 `task.md`를 다시 만들고 OLD와 NEW를 대조한다.[](source:expa) | canary-flow | a |
| b1-step | 실험 B1 | `passkey-management`의 `grader.ts`를 지우고 다시 만든 뒤 held-out 4번째 풀이로 채점한다.[](source:b1) | canary-flow | b1 |
| b2-step | 실험 B2 | `translator`와 `local-network-access`의 `grader.ts`를 다시 만들어 무의미한 guard가 없는지 본다.[](source:b2) | canary-flow | b2 |
| clean-step | worktree 지우기 | `git worktree remove --force`와 `git branch -D`로 임시 공간을 없앤다.[](source:clean) | canary-flow | clean |

@facts id=canary-times
| 처음부터 `gd dev <guide>` | guide 하나에 약 25분[](source:mech) |
| 증분 재생성 전체 | 약 4분(표제 수치. 합산 근거는 원문에 명시 없음)[](source:mech) |
| `task.md`만 | 8개 target에 약 45초[](source:mech) |
| `grader.ts`만 | target 하나에 약 2~3분[](source:mech) |

원문은 서브에이전트 3개를 병렬로 띄우고 모델을 `"flash"`로 지정한다. 실험 A, B1, B2가 하나씩 맡는다고 읽힌다. 세 서브에이전트가 각각 어느 실험을 맡는지는 원문에 명시 없음.[](source:sub)

`task.md`만 다시 만들 때는 `extractGuideDescription`, `buildTargetTaskPrompt`, `runAgent`를 작은 runner 스크립트에서 부르거나, `targets/<app>/task.md`만 지우고 `devGuide(dir, { test: false, targets: [app] })`를 실행한다. `grader.ts`만 다시 만들 때는 patch와 `task.md`를 그대로 두고 `grader.ts` 하나만 지운 뒤 같은 `devGuide` 호출을 쓴다.[](source:mech)

@callout level=warning title="정리 단계가 결과를 함께 지운다"
| `git worktree remove --force`와 `git branch -D`는 임시 worktree에 남은 변경과 branch를 되살릴 수 없게 지운다. 다시 만든 `task.md`와 `grader.ts`, OLD/NEW 대조 결과를 어디에 남길지는 원문에 명시 없음.[](source:clean) |

## 실험은 각각 무엇을 보고 언제 통과인가? {#experiments}

| 실험 | 대상 | 확인할 것 | 통과 기준 |
|---|---|---|---|
| A-1 | `directional-navigation-transitions` | 부차 요구(`prefers-reduced-motion`)가 `task.md`에 새지 않는다.[](source:expa) | OLD와 NEW를 `project-evals`의 `task.md` 규칙에 대조한다. 수치 기준은 원문에 명시 없음.[](source:expa) |
| A-2 | `built-in-ai/translator` | `guide.md` frontmatter `description`의 on-device 경계를 `window.Translator`를 쓰지 않고 유지한다.[](source:expa) | 같음 |
| A-3 | `html/html` | 체크리스트 항목(`autofill`, `srcset`, `fetchpriority`)이 새지 않는다.[](source:expa) | 같음 |
| A-4 | `security/passkey-management` | WebAuthn Signal API 메서드(`signalAllAcceptedCredentials`, `signalUnknownCredential`)를 지시하지 않는다.[](source:expa) | 같음 |
| B1 | `passkey-management` · `devtools-times` | 보정 통과 + 보지 못한 4번째 풀이에서도 통과한다.[](source:b1) | held-out 풀이 통과율 100%[](source:b1) |
| B2-1 | `translator` · `devtools-times` | `if (files.length === 0) { expect(false).toBe(true); return; }` 같은 guard가 사라진다.[](source:b2) | 원문에 명시 없음 |
| B2-2 | `local-network-access` · `devtools-times` | `codex-solution.patch`에 iframe이 0개(`totalIframes === 0`)인 조건부 요구에서, 검증할 수 없는 조건 검사를 빼고 `items.length === 0 \|\| ...` 식 guard를 쓰지 않는다.[](source:b2) | 원문에 명시 없음 |

A의 계산: guide 4개 × app 2개 = target 8개. 원문의 "8 targets"와 같다.[](source:mech)[](source:expa)

B1은 두 단계다. 먼저 `grader.ts`를 지우고 다시 만든 뒤 보정을 확인한다. 보정 통과는 golden 풀이 3개에서 통과했다는 뜻이다.[](source:b1)

| B1 보정 항목 | 기대 결과 |
|---|---|
| `claude` 풀이 | 100%[](source:b1) |
| `codex` 풀이 | 100%[](source:b1) |
| `jetski`/`antigravity` 풀이 | 100%[](source:b1) |
| `zero-passrate`(손대지 않은 시작 app) | 0%[](source:b1) |
| `src/core/grader-lint.ts` 정적 AST lint | 위반 0건[](source:b1) |

그다음 `runPlaywright`로 held-out 4번째 풀이를 채점한다. 이 풀이는 `expectations.md`를 모두 만족하되 golden 3개에 없던 구조를 쓴다.[](source:b1)

- 처음 보는 함수 이름(`reconcilePasskeyVault`, `revokePasskeyItem`)을 쓴다.
- 옵션을 지역 변수에 담고 `payload as any`, `satisfies` 같은 타입 단언을 쓴다.
- `Component.tsx -> passkey-client.ts -> webauthn-signals.ts`처럼 파일을 건너는 wrapper를 둔다.
- `try/catch` 대신 Promise `.catch()`로 오류를 처리한다.

판정 · B1의 요점은 grader가 golden 3개에 맞춰 과적합되지 않았는지 보는 것이다. 원문은 보정이 grader 작성 에이전트가 디스크에서 열어 본 풀이 3개만 통과한다는 사실을 그 이유로 든다.[](source:b1)

원문에 명시 없음: held-out 4번째 patch를 누가 어떻게 만드는지, 통과율이 100% 미만일 때 무엇을 하는지, 실험이 실패하면 프롬프트 변경을 되돌리는지.

## 흐름 속 위치는 어디인가? {#position}

@workflow id=position-flow title="project-evals에서 이 스킬로, 규칙 대조로"
| before | project-evals | backend | source:pe-hub |
| other | grader-replay | external | source:gr-desc |
| current | dev-prompt-canary | backend | source:full |
| after | task.md 규칙 · 8 red lines | security | source:pe-bar |
| before > current | R16 넘김 | emphasis |
| other > current | R21 넘김 | dashed |
| current > after | R19 참고 | dashed |

@steps id=position-steps
| highlight | dev-prompt-canary | 이 페이지의 스킬이다. `gd dev` 프롬프트를 고칠 때만 오고, 결과는 `project-evals` 규칙에 대조한다.[](source:pe-hub)[](source:why) | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R16 · 넘김(`project-evals` → 이 스킬) | `project-evals`가 `dev-prompts.ts`, `dev.ts`, `generate-grader.ts`를 고칠 때 이 스킬로 canary를 검증하라고 안내한다. 의무인지 제안인지는 "use the ... skill to empirically validate"라는 표현을 따른다. 전달물은 없다.[](source:pe-hub) |
| R21 · 넘김(`grader-replay` → 이 스킬) | `grader-replay`는 `gd dev` 프롬프트 생성 검증이면 자신을 쓰지 말고 이 스킬을 쓰라고 한다.[](source:gr-desc)[](source:gr-rel) |
| R19 · 참고(이 스킬 → `project-evals`) | 다시 만든 `task.md`와 `grader.ts`가 `project-evals` 규칙을 지키는지가 확인 기준이다. 실험 A는 `task.md` 규칙에 대조한다. 판정으로, 부차 요구와 API 이름이 새는지는 규칙 5(API 지시 금지), on-device 경계는 규칙 4(capability boundary 유지)에 해당한다.[](source:why)[](source:pe-task) |

전체 흐름은 색인 기준 `_group-eval-quality-loop/eval-quality-loop.html`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `modern-web-guidance-src/dev-prompt-canary/SKILL.md` 1개, 5,781B를 끝까지 읽었다.[](source:full) |
| 참조 확인용 부분 읽음 | `project-evals/SKILL.md`의 1~8, 28~48, 66~82, 118~140줄과 `grader-replay/SKILL.md`의 description·Related Skills를 관계 원장 R16, R19, R21 대조용으로 읽었다. 이 스킬의 필수 자료는 아니다.[](source:pe-hub)[](source:pe-task)[](source:gr-desc) |
| 제외 | 이 폴더에는 SKILL.md 외 텍스트 파일, 번역본, 바이너리가 없다. |
| 부분 읽음 | 위 `project-evals` 부분 읽음 1개. |

활성화 조건(4개 파일 수정 시), 병렬 서브에이전트 3개와 모델 `"flash"`, 소요 시간 수치 4개(25분, 4분, 45초, 2~3분), 실험 A·B1·B2의 대상, B1의 보정 수치(100%, 0%, lint 위반 0건, held-out 100%), 정리 명령을 모두 원문과 대조했다.

판정 · 이 스킬은 `gd dev`가 새 파일을 만드는 "write mode"를 일부러 쓴다. `grader-replay`는 검증 중 `--test-grader` 없이 `gd dev`를 돌리면 write mode가 수동 `grader.ts` 편집을 덮어쓸 수 있다고 경고한다. 이 스킬이 임시 worktree에서만 돌리라고 하는 이유와 맞닿아 있지만, 원문은 이 연결을 쓰지 않았다.[](source:wt)[](source:gr-rel)

@callout level=open-question title="확인하지 못한 부분"
| 이 컬렉션에는 원본 저장소의 `src/`와 `guides/`가 없어 `devGuide`, `runAgent`, `runPlaywright`, `guides/...` 경로의 존재와 동작을 확인하지 못했다. 스킬 지시(worktree 생성, 에이전트 호출, 삭제 명령)는 실행하지 않았다. 호스트가 `"flash"` 모델을 실제로 지원하는지, 실험의 통과·실패를 누가 판단하는지는 원문에 명시 없음. |

분석 중 원본은 수정하지 않았다. 관계 원장은 이미 확정된 것을 그대로 썼다.
