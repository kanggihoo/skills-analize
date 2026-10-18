### 다단계 또는 다중 PR 계획

**계획은 당신이 책임지고, 코드는 책임지지 않는다. 계획은 소유자가 한 칸씩 실행하고 운영자가 증거로 감사하는 체크리스트다.** 계획이 결과물이다. 구현하지 않는다.

1. 변경이 파일 한두 개이고 접근법이 분명하면 계획을 건너뛴다. 그렇다고 말하고 멈춘다.
2. 쓰기 전에 프로토타입으로 열린 질문을 해결한다. 각 질문에 대해 `playbooks/prototype.md`를 실행한다. 부록 A를 위해 브랜치, SHA, 스크린샷을 보관한다. 어떤 실행으로도 결정할 수 없는 제품 또는 선호 판단에 대해서만 운영자에게 묻는다. 옵션을 준다(**never-block-on-the-human** 원칙 스킬).
3. 탐색은 `subagent_type: "poteto-agent"`와 Subagents 절에 따른 명시적 모델을 써서 subagent에서 한다(**guard-the-context-window** 원칙 스킬). 각 subagent는 파일 포인터, 관례, 테스트 명령, 진입점을 돌려준다. 내용을 그대로 붙인 덤프는 쓰지 않는다.
4. 아래 골격을 계획 파일로 복사하고, 모든 자리표시자를 채운다. 운영자가 경로를 지정하지 않았다면, 계획 파일은 에이전트 저장소의 `docs/` 아래에 쓴다. 골격의 모든 제목과 모든 하위 블록을 보이는 순서대로 유지한다. PR마다 한 섹션을 둔다. PR 하나는 자체 증거를 가진 변경 하나다(**sequence-verifiable-units** 원칙 스킬). **How to read this**에서 실행 playbook의 이름을 적는다. `playbooks/autopilot-full.md`와 `playbooks/autopilot-stack.md` 중 무엇을 쓸지는 `playbooks/autopilot-stack.md` 끝의 규칙에 따라 고른다. 상시 프로그램은 `playbooks/orchestrate.md`를 쓴다.
5. `/technical-writing`에 따라 전체를 쓰고, 그다음 `/unslop`을 적용한다. 본문은 하나의 Diátaxis 모드인 how-to다. 부록에는 설명과 참조를 담는다. 각 제목은 과제나 발견을 말한다. 긴 줄표를 쓰지 않는다. 문장 중간에 콜론을 쓰지 않는다.
6. `node pstack/skills/poteto-mode/scripts/check-plan.mjs <plan.md>`를 실행하고, 출력된 줄마다 모두 고친다(**encode-lessons-in-structure** 원칙 스킬).
7. 돌려준다. 계획 경로와 스크립트 출력을 게시한 뒤 멈춘다. 실행은 운영자가 명시적으로 허락한 뒤에, 계획이 명시한 실행 playbook에 따라 시작한다.

**검증.** 테스트만으로는 충분한 검증이 아니다. PR은 단위, 실시간, 성능 상자가 모두 체크되었을 때만 검증된 것이다(**prove-it-works** 원칙 스킬). 이 문장이 검증 규칙이다. 모든 검증 블록은 이 문장으로 시작한다. 실시간 블록은 필수다. PR head에서 열 개의 레인이 **swarm** 스킬에 따라, 제어 스킬을 통해 실제 표면을 구동한다. 모델은 `swarm workers` 모델(기본값 `grok-4.7-xhigh-fast`)을 쓴다. 각 레인은 구체적인 시나리오, 저장할 스크린샷, 통과 술어를 가진 상자 하나다. 레인 하나는 **Regression lane against trunk**다. 같은 핵심 시나리오를 trunk와 head에서 실행한다. trunk에 해당 기능이 없으면, 레인은 그 사실을 기록하고, trunk 결과를 지어내지 않고 diff가 추가하는 동작과 사용자가 기다리는 최종 상태를 게이트한다. 성능 게이트는 양측 기준이다. trunk와 head 모두 명명된 지표를 만들어야 한다. trunk에 기능이 없으면, diff가 추가하는 작업을 따로 분리하고, 그 작업과 사용자가 기다리는 엔드투엔드 상태에 대해 절대 예산을 설정한다. 서로 다른 시나리오 사이의 비율을 주장하지 않는다. 성능 블록은 지표, 교차 탐침, 먼저 측정한 trunk 기준선, 그리고 실패를 판정하는 수치가 있는 규칙을 명시한다. 상호작용을 바꾸는 PR은 리뷰 게이트 대상이다. 운영자는 병합 전에 스크린샷과 영상을 붙여 채팅으로 검토한다. 상호작용을 바꾸지 않는 PR은 `**Review gate.** None. <PR id> is not review-gated.`라고 적고, 그 아래에 상자를 두지 않는다.

**제어 스킬.** 표면에 따라 고른다. 브라우저, Electron, 웹 UI는 `cursor-team-kit`의 `control-ui`를 쓴다. CLI와 TUI는 `cursor-team-kit`의 `control-cli`를 쓴다. 네이티브 모바일은 저장소에 있는 시뮬레이터 구동 스킬을 쓴다. PR이 두 표면을 건드리면 양쪽 모두에 레인을 둔다. 제어 스킬이 없는 표면은 부록 C의 위험이 되며, 그 실시간 블록은 각 레인이 그 표면을 어떻게 구동할지 그대로 명시한다.

````markdown
# <Program> plan

<Under ten lines. What changes, for whom, the rule the program enforces, and the PR ids in order.>

## How to read this

One box is one unit of work. Every box names the evidence that checks it. A nested box is a sub-step of the box above it. Check a box only when its evidence exists, a file, a log line, a screenshot, a test run, or a SHA. The body is a how-to. The appendices explain and record.

The program runs `pstack/skills/poteto-mode/playbooks/<execution playbook>.md`. <Who merges, and which PR ids are the operator's items that stop at merge-ready.>

Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

## Program checklist

### Arm the program

- [ ] State the protocol and this plan to the operator, then stop. Start execution only on the operator's explicit go.
- [ ] Read these from trunk at program start. Re-read them at every tick.
  - [ ] `git show origin/main:pstack/skills/poteto-mode/playbooks/<execution playbook>.md`
  - [ ] `git show origin/main:pstack/skills/swarm/SKILL.md`
  - [ ] `git show origin/main:<control skill path>`
  - [ ] `git show origin/main:pstack/skills/poteto-mode/playbooks/opening-a-pr.md`
  - [ ] `git show origin/main:pstack/skills/<each other leaf skill the program uses>`
- [ ] On the operator's go, arm the audit tick as `/loop 1h` with the tick prompt below. Never leave the cadence to memory.
- [ ] Use this tick prompt, verbatim. "Re-read the execution playbook from trunk. Audit the operation against it and fix drift in this tick. Probe every active lane and judge progress by side effects only. Stand down a stuck lane and dispatch its replacement now. Then post a short status message to the operator in chat only when the audit found a tracked change that no earlier status message reported, such as a PR opened, a code-ready head, a round launched or closed, a verdict, a merge, a stuck agent and the action taken, a blocker added or cleared, or a decision only the operator can make. Name every such change and nothing else. Do not repeat a table, the merged list, or an unchanged blocker. If the audit found none, end the turn with no reply text. Either way, log this tick's row in your decision trail. The row names the items reported, or none."
- [ ] On the operator's hold or stand-down, send every owner a zero-writes order at once.

### Spawn owners

- [ ] Spawn one owner per PR with the full lifecycle the execution playbook names.
- [ ] Follow this dependency graph. Start dependent work only after its parent merges, or base it on the parent branch when the execution playbook stacks.
  - [ ] <PR id> and <PR id> are independent and first. Both branch from `main`.
  - [ ] <PR id> after <PR id>.
- [ ] Hold the file boundaries. <PR id or class> touches only `<glob>`.
- [ ] Hold the review gate. <PR ids> change an interaction. They wait for the operator's review in chat with screenshots and a video before merge.

### PR mechanics, for every PR

- [ ] Resolve the forge once. Default to `gh`; if `command -v origin` succeeds and Origin can resolve the repository, use `origin pr` for every PR operation. Record any fallback to `gh`. Never require `gt`.
- [ ] Open the PR ready, never draft, per **Opening a PR**. Use the run's built-in PR tool when it has one, else `origin pr create --status open --base <base-branch>` or `gh pr create --base <base-branch>` according to the resolved forge. A stack child targets its parent branch.
- [ ] Run the repo's lint and typecheck once before the PR-facing push. Push with hooks on.
- [ ] Run `/deslop` before each commit and `/no-comments` before review.
- [ ] Triage every Bugbot and security-reviewer comment per `../references/bugbot-triage.md`.
- [ ] Rebase onto current trunk before the code-ready report and babysit. Keep that merge base in fix rounds. Rebase again only at merge prep, on a `git merge-tree` conflict with trunk, or on a CI failure that comes from a change on trunk.

### Verdict and merge, for every PR

- [ ] At the code-ready head SHA and at each later push that changes the patch, run the swarm per `pstack/skills/swarm/SKILL.md`. One gates lane. The ten live lanes from the PR's **Verify, live** block. The perf lane from its **Verify, perf** block. Two or more audit lanes, each with its own focus, that read the diff and the receipts and distrust the PR body. The root audits the receipts in the merge-ready report before the verdict.
- [ ] Clean only when every lane is `PASS`. Findings go back to the owner, including a defect that a lane filed as a note. A new head gets a fresh swarm and a fresh verdict, except for results that stay valid under the patch-id rule in `playbooks/shipping.md`.
- [ ] <The merge or append rule from the execution playbook, with the patch-id rule from `playbooks/shipping.md`.>

### Boot recipe, for every live lane

Each live lane runs on its own cloud VM at the PR head. Drive through `control-ui` or `control-cli` from `cursor-team-kit`.

- [ ] `git fetch origin <head-branch> && git checkout <head SHA>`.
- [ ] <Start the backend and the surface. Wait for ready.>
- [ ] <Deliver input only through the control skill's commands. Name the read-only diagnostics.>
- [ ] Save every screenshot to `/tmp/swarm-<pr-id>/worker-<n>/<slug>.png` and return the paths with the report.

## <Task as a verb phrase> (<PR id>)

**Depends on.** <PR id, or None.>

**Files.**

- [ ] Edit `<path>`.
- [ ] Create `<path>`.
- [ ] Delete `<path>`.

**Build.**

- [ ] <One change. Name the symbol and the file.>

**You see.**

- [ ] <One observable result, with the exact log line or screen state.>

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] <Test file and the case it gains.> Run `<command>`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `<swarm workers model>` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Run <the same load-bearing scenario> at trunk and head. If trunk lacks the feature, record that and gate <the behavior the diff adds plus the end state the user waits for>. Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 2. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 3. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 4. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 5. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 6. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 7. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 8. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 9. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 10. <Scenario.> Save `<slug>.png`. Pass when <predicate>.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. <What is measured at both trunk and head. If trunk lacks the feature, also name the diff-added work and the end-to-end state the user waits for.>
- [ ] Probe. <The command or procedure, run at trunk and at the head, interleaved. Both sides must produce the metric.>
- [ ] Baseline. Record the trunk <value> first.
- [ ] Rule. <Head against trunk, with the number that fails. If the scenarios differ, add absolute budgets for the diff-added work and the user-visible end state instead of an invalid ratio.>

**Review gate.** The operator reviews before merge.

- [ ] Copy lane <n> screenshots into `<media path>/<pr-id>-review-<slug>.png`.
- [ ] Record a 30 to 60 second video of the change on a lane VM. Save it as `<media path>/<pr-id>-review.mp4`.
- [ ] Post the screenshots and the video in chat. Stop at merge-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] <The owner squash-merges its own PR, or the root appends it to the base-branch stack and the operator lands it bottom-up.>

## Close the program

- [ ] Every box above is checked with its evidence.
- [ ] Reply to the operator with the report the execution playbook names.

## Appendix A. Prototype evidence

<Each open question a prototype answered, with the branch, the SHA, and the artifact links. Each question that stays unproven.>

## Appendix B. Alternatives rejected

<Each approach weighed and why it lost.>

## Appendix C. Risks

<Each risk with the PR it lands in and what the owner watches.>

## Appendix D. Links and reading list

<Docs to read before editing. Which PRs get `pstack/skills/how/SKILL.md` and `pstack/skills/interrogate/SKILL.md`. The trail per `pstack/skills/show-me-your-work/SKILL.md`.>
````

**응답:** 계획 경로, 의존성과 리뷰 게이트 대상 집합을 포함한 PR id들, 프로토타입이 증명한 것과 아직 증명되지 않은 것, 체크 스크립트의 출력.
