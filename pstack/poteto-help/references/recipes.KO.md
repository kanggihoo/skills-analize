# 그대로 복사해 쓸 만한 프롬프트

실제 경로, 스킬, 완료 확인 기준으로 바꿔 쓰세요. 구어체도 괜찮습니다.

## 이해하기

- `/poteto-mode read <thread>. restate the underlying issue in your own words, in plain english.`
- `/poteto-mode investigate why <symptom>. give me what we know, what data you used, and your best hypotheses. don't change any code yet.`
- `use /how to understand <subsystem>. then use /why to find out why it broke recently.`
- `/recall my work on <topic> from last week, then read <issue>.`
- `/teach me why you implemented it this way and not <other way>. what did you trade off?`
- `/poteto-mode take over this branch. read the decision log, find what's done, and continue. don't redo finished work.`

## 만들기

- 버그: `/poteto-mode <symptom>. repro first, then fix and verify.`
- 앱의 버그: `/poteto-mode repro this with /verify-<app>. if it repros on main, fix it and show me a video as proof.`
- 저렴한 테스트가 있는 버그: `/poteto-mode repro <bug> first. if there's a cheap test path, /tdd it. then fix and rerun.`
- 기능: `/poteto-mode add <behavior>. <current output> stays byte-identical. verify both.`
- 리팩터링: `/poteto-mode move <code> into one module, zero behavior change. record the current output first and prove it's unchanged after.`
- 성능: `/poteto-mode <operation> takes <time> on <fixture>. trace it, fix the measured cause, show me before and after.`

## 설계와 계획

- `/poteto-mode prototype a few options for <feature>. take screenshots or videos for me to compare.`
- `/poteto-mode we need <feature>. /architect it first, and answer open questions with prototypes. let me review before proceeding.`
- `/poteto-mode write a tutorial for how i would use <new package> first. then /teach me why it beats the current one.`
- `ask /arena for a second opinion on this thread and our approach.`
- `/poteto-mode turn this design into a plan. small verifiable PRs, each with its own verification steps.`
- `/poteto-mode plan the migration of <library> to <target>. small verifiable PRs. the result must match the original exactly, bugs included.`

## 리뷰와 배포

- `/interrogate the whole branch, but skeptically. don't change anything yet. no nitpicks unless it's a real bug or regression.` 기각 사유도 함께 읽으세요.
- `/swarm check every package under <dir> against its check script. one worker per package. one report.`
- `/poteto-mode open the pr. small ordered commits, evidence in the description.`
- `/poteto-mode babysit this pr. get it green.` 상태만 확인하려면: `/poteto-mode check on pr <number>. anything outstanding?`
- `/poteto-mode land the stack.`

## 자리 비우기와 복귀

- `/poteto-mode im going to bed. <goal> in a fresh worktree off <base>. done means <checks>. keep a decision log. don't ask me before committing. /loop until done. if you're truly stuck after a few hours, stop and write up why.`
- `/show-me-your-work catch me up on what you did last night.` 먼저 Attention 섹션을 읽으세요.
- `/poteto-mode full autopilot on this queue. each item is independent.`
- `/poteto-mode autopilot these changes but stack them, don't ship. i'll land the stack.`
- `/reflect capture what we learned so the next run doesn't repeat it.` 미래의 결정을 바꾸는 편집만 승인하세요.
- `/bro`는 마지막 답변을 쉬운 말로 다시 설명합니다.
