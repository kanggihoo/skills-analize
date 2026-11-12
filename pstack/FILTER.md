# pstack 1차 필터: my-skills에 가져올 것

`REVISIT.md`의 21개 중 my-skills가 아직 쓰지 않는 16개를 걸렀다. 기록일은 2026-11-11이고, 기준 commit은 my-skills `650846b`다.

"쓰지 않는다"의 기준은 my-skills의 `SOURCES.md` 어디에도 출처로 나오지 않는 것이다. 21개 중 `show-me-your-work`, `benchmark-checklist`, `principle-prove-it-works`, `interrogate`, `blast-radius` 다섯 개는 이미 wf-report와 wf-review에 일부 들어가 있어서 이 필터에서 뺐다.

## 판단 대상

my-skills는 스킬을 배포하는 레포다. 다른 프로젝트에서 `npx skills add https://github.com/kanggihoo/my-skills`로 필요한 스킬을 설치해 쓴다. 그래서 판단 대상은 my-skills 레포 안의 파일이 아니고, 이 스킬들이 설치될 프로젝트다. 그 프로젝트들은 TypeScript, Python, Java를 모두 쓴다. 주로 쓰는 흐름은 wf-skills(grill → spec → implement → review → report)다.

## 판단 기준

세 가지를 물었다.

1. 설치될 프로젝트에서 wf 흐름이나 다른 my-skills 스킬로 일할 때, 이 스킬이 메우는 빈 곳이 실제로 있는가.
2. my-skills의 다른 스킬, 함께 설치해 쓰는 외부 스킬(`EXTERNAL-SKILLS.md`), Claude Code 기본 기능이 그 일을 이미 하고 있는가. 하고 있으면 가져오지 않는다.
3. 가져올 때 Cursor 전용 부분을 걷어 내고도 남는 것이 있는가. pstack은 Cursor용이다(`~/.cursor/...` 경로, `Task`·`AskQuestion` 도구, Cursor 대화 기록 경로).

판정은 셋 중 하나다. **후보**는 빈 곳이 있어 다음에 실제로 설계해 볼 것이다. **보류**는 조건이 생기면 다시 볼 것이다. **제외**는 이미 덮여 있거나 이 환경에 맞지 않는 것이다.

## 결과

| 스킬 | 판정 | 한 줄 이유 |
|---|---|---|
| `create-verification-skill` | 후보 | 앱을 직접 띄워 AC를 증명하는 방법이 프로젝트에 남지 않는다 |
| `maintain-verification-skill` | 후보 | create를 실제로 쓴 뒤에만 의미가 있다 |
| `correct` | 후보 | 설치된 프로젝트에서 에이전트가 반복하는 실수가 문서에만 쌓이고 검사로 바뀌지 않는다 |
| `principle-type-system-discipline` | 후보 | wf-review의 Standards 축은 프로젝트가 문서로 적은 규칙만 본다. 타입 규칙을 적어 둔 프로젝트가 아니면 아무도 확인하지 않는다 |
| `typescript-best-practices` | 후보 | 위 원칙의 TypeScript판. Python, Java판은 새로 써야 한다 |
| `why` | 보류 | 설치될 프로젝트에서 이슈 트래커·문서·채팅 MCP를 실제로 연결해 쓸 때 값이 생긴다 |
| `arena` | 보류 | 교차 모델 검토는 herdr 스킬들이 하고, 후보 여러 개를 만들어 접붙이는 일은 아직 필요한 적이 없다 |
| `reflect` | 보류 | run 뒤 Codex와 토론해 스킬을 고치는 일을 이미 손으로 하고 있다 |
| `principle-build-the-lever` | 보류 | 빈 곳은 있지만 따로 스킬로 둘 만큼은 아니다. 넣는다면 wf-implement의 규칙 한 줄이다 |
| `poteto-mode` | 제외 | 허브가 user-invoked 스킬을 부르는 구조는 Claude Code에서 거부된다 |
| `recall` | 제외 | 세션 사이 인계는 wf 산출물과 herdr-discuss 요약이 맡는다 |
| `swarm` | 제외 | Claude Code의 Agent 도구와 Workflow 도구가 같은 일을 한다 |
| `automate-me` | 제외 | 작업 습관은 전역 `CLAUDE.md`에 이미 자세히 적혀 있다 |
| `principle-laziness-protocol` | 제외 | 함께 쓰는 외부 스킬 `ponytail`이 같은 사다리를 갖고 있다 |
| `principle-subtract-before-you-add` | 제외 | 코드는 `ponytail`, 문서는 `writing-for-agents`의 Pruning이 덮는다 |
| `principle-encode-lessons-in-structure` | 제외 | 따로 가져오지 않고 `correct` 후보에 포함한다 |

## 빈 곳 세 가지

**실행 중인 앱으로 증명하는 일.** wf 흐름에서 AC는 테스트로 증명하거나, `manual` seam으로 사람이 직접 확인한다(`wf-artifacts/SPEC-TEMPLATE.md:70`). wf-review의 Risk 3번은 안전 근거 하나를 실행으로 증명하지만, 앱을 어떻게 띄우고 조작하는지는 매번 새로 알아낸다. 그 방법이 프로젝트에 남지 않는다. `create-verification-skill`과 `maintain-verification-skill`이 이 빈 곳을 메운다.

**반복되는 실수를 검사로 바꾸는 일.** 프로젝트에서 에이전트를 고쳐 주면 그 내용은 `AGENTS.md`, `CLAUDE.md` 규칙이나 Claude Code memory로 간다. `correct`가 매기는 순서(구조 > 타입·린트 > 테스트 > 문서)에서 가장 아래 단계다. `wf-constraints`는 품질 기준을 숫자로 정하고 wf-review는 기준이 낮아지는지(Lowered bar) 보지만, 에이전트가 반복한 특정 실수를 검사로 바꾸지는 않는다.

**언어별 타입 규칙.** wf-review는 mattpocock `code-review`의 Standards 축을 그대로 쓴다. 이 축은 프로젝트가 문서로 적은 규칙(`CODING_STANDARDS.md`, `CONTRIBUTING.md` 등)과, 언어와 무관한 Fowler 코드 스멜 기준선만 본다(`code-review/SKILL.md` 3단계). 그래서 `any`나 캐스트로 타입을 우회하거나 외부 입력을 경계에서 파싱하지 않는 코드는, 프로젝트가 그 규칙을 적어 두지 않았으면 리뷰에서 걸리지 않는다. wf-implement 쪽에도 언어 규칙이 없다.

## 스킬별 근거

### 후보

**`create-verification-skill`.** 앱 하나당 검증 스킬 하나를 만든다. 실행(Launch), 상태 점검(Doctor), 조작(Drive), 증거(Evidence), 정리(Cleanup)와 기능별 지도(`features/*.md`)가 들어간다. 설치된 프로젝트에서 wf로 기능을 만들 때 `manual` seam이나 e2e AC를 이 스킬로 돌리면, 사람이 하던 확인 일부를 에이전트가 같은 방식으로 반복할 수 있다. Claude Code의 내장 `run` 스킬은 앱을 띄울 때 "그 일을 이미 하는 프로젝트 스킬"을 먼저 찾는다. 그래서 이 스킬의 결과물이 `run`에 그대로 연결될 가능성이 있다. 이 연결은 확인하지 않았다.

가져올 때 바꿀 것은 세 가지다. 출력 경로 `.cursor/skills/verify-<app>/`를 `.claude/skills/`로 바꾸고, Cursor `Task` 도구 대신 Agent 도구를 쓰고, 브라우저 조작은 `ego-browser`에 맞춘다.

**`maintain-verification-skill`.** 앱이 바뀌어 기능 지도가 낡으면 고친다. 결과는 `clean`, `changed`, `blocked` 중 하나다. create로 만든 검증 스킬이 실제로 쓰이기 전에는 고칠 대상이 없다. create와 같이 설계하되, 도입은 create를 한 프로젝트에서 써 본 뒤로 미룬다.

**`correct`.** 설치된 프로젝트에서 에이전트가 같은 실수를 반복하면, 그 실수를 구조, 타입, 린트, 테스트 순으로 가장 높은 단계에서 막는다. 검사가 실제 과거 실수에서 실패하는지 증명하고, 프로젝트의 지침 파일에 "규칙과 그것을 강제하는 것" 표를 유지한다. my-skills 안에도 같은 문제가 있어 첫 적용 대상으로 쓸 수 있다. `AGENTS.md`의 세 규칙(`SKILL.md` 플래그와 `openai.yaml` policy 짝, changeset, `SOURCES.md`)은 지금 문서로만 지켜지고, 검사 스크립트가 `scripts/`에 없다. `upstream-review`의 `check.mjs`가 이미 이 방식의 사례다. 래퍼가 `upstream.json`에 빠지면 사람이 기억하지 않아도 `untracked_dependency`가 뜬다. `principle-encode-lessons-in-structure`는 이 스킬의 이유를 설명하는 원칙이라 따로 가져오지 않는다.

**`principle-type-system-discipline`, `typescript-best-practices`.** 원칙은 언어와 무관하다. 불가능한 상태를 타입으로 표현할 수 없게 하고, 캐스트로 타입을 우회하지 않고, 변형을 빠짐없이 매칭하고, 외부 데이터는 경계에서 파싱한다. `typescript-best-practices`는 이 원칙을 TypeScript 규칙 16개와 예시(`references/patterns.md`)로 구체화한다. Python과 Java판은 pstack에 없어서 새로 써야 한다. Python은 `pyright`(타입 검사), `ruff`(린트), `pydantic`(경계 파싱)으로 대응할 수 있다는 것이 `REVISIT.md`의 해석이다. Java판은 아직 아무것도 정하지 않았다.

어떻게 연결할지가 설계 질문으로 남는다. 후보는 두 가지다. 하나는 언어별 규칙 스킬을 따로 두고 wf-implement와 wf-review가 프로젝트 언어에 맞는 것을 읽게 하는 방식이다. 다른 하나는 `wf-constraints`가 `CONSTRAINTS.md`를 쓸 때 언어별 규칙을 프로젝트 문서로 넣어, code-review의 Standards 축이 문서 규칙으로 읽게 하는 방식이다. pstack의 `typescript-best-practices`는 frontmatter의 `paths: ["**/*.ts", "**/*.tsx"]`로 파일 종류에 따라 붙는다. Claude Code와 Codex가 이 필드를 지원하는지는 확인하지 않았다.

### 보류

**`why`.** git과 `gh`에 MCP 범주 6개(이슈 트래커, 문서, 채팅, 관측, 에러 추적, 분석 웨어하우스)를 병렬로 뒤져 "왜 이렇게 생겼나"를 답한다. 값은 설치될 프로젝트가 트래커와 채팅을 MCP로 연결했을 때 생긴다. 지금 이 환경에는 Atlassian, Notion, Slack MCP가 보이지만 대부분 인증 전이다. 어느 프로젝트에서 Jira, GitLab, Notion 같은 기록을 실제로 연결해 쓰는지 정해지면 다시 본다.

**`arena`.** 같은 과제를 여러 후보에게 맡기고, 교차 심사로 기반을 고르고, 나머지의 장점을 접붙인다. 다른 모델의 시각은 이미 `herdr-discuss`(토론), `herdr-delegate`(결과 하나 받기), `wf-grill/DOUBT.md`(결정 반박)가 넣는다. arena만의 값은 완성된 후보를 여러 개 만들어 비교하는 것인데, 실행 비용이 후보 수만큼 든다. 선례 없는 설계에서 herdr-discuss로 결론이 나지 않는 일이 생기면 다시 본다.

**`reflect`.** 한 세션의 대화 기록을 세 리뷰어가 보고 기존 스킬의 수정점을 뽑는다. 다른 프로젝트에서 my-skills 스킬을 쓰다 드러난 문제를 my-skills로 가져와 고치는 일에 맞는다. 사용자는 이미 같은 일을 손으로 한다. herdr-discuss는 실제 run을 점검한 뒤 드러난 문제를 Codex와 토론해 고쳤다(`herdr-discuss/README.md:189`). 이 과정이 여러 스킬에서 반복되면 그때 절차로 굳힌다. 가져올 때는 대화 기록 경로를 Cursor의 `~/.cursor/projects/<slug>/agent-transcripts/`에서 Claude Code의 `~/.claude/projects/<slug>/*.jsonl`로 바꿔야 한다.

**`principle-build-the-lever`.** 손으로 하지 말고 그 일을 하거나 증명하는 도구(codemod, 스크립트, 생성기)를 만들고, 그 도구를 리뷰어가 다시 돌릴 수 있는 산출물로 남긴다. 설치된 프로젝트에서 wf-implement가 큰 기계적 변경을 할 때 이 규칙을 강제하는 곳은 없다. 다만 내용이 짧아서 스킬 하나로 둘 만큼은 아니다. 넣는다면 wf-implement에 "같은 변경이 여러 곳이면 스크립트로 하고 diff에 남긴다" 한 줄이다. 실제 구현에서 손으로 반복한 변경이 문제가 된 일이 생기면 넣는다.

### 제외

**`poteto-mode`.** 요청을 플레이북에 맞추고 하위 스킬과 원칙을 부르는 허브다. Claude Code는 모델이 `disable-model-invocation: true` 스킬을 부르면 거부하고, 사람이 부른 스킬 안에서 부를 때도 거부한다(`my-skills/AGENTS.md`, issue #9). 그래서 이 구조는 그대로 옮길 수 없다. my-skills에서 흐름을 정하는 문서는 `wf-skills/README.md`이고, 답변 문체는 전역 `CLAUDE.md`가 정한다. 되돌릴 수 있는 일은 묻지 않고 한다는 Autonomy 규칙은 Claude Code의 권한 모드가 맡는다.

**`recall`.** 최근 대화 기록과 공유 기록으로 작업 맥락을 복원한다. wf에서는 산출물 파일 자체가 세션 사이 인계 수단이다(`wf-artifacts/SKILL.md:8`, "an agent that was not in the grilling conversation works from these alone"). 토론 결과는 herdr-discuss의 `summary.md`에 남고, Claude Code memory도 있다. 대화 기록 경로도 Cursor 전용이다.

**`swarm`.** 작업을 나눠 병렬로 돌리고 보고서 하나로 모은다. Claude Code의 Agent 도구가 서브에이전트를 병렬로 띄우고, Workflow 도구가 여러 에이전트를 정해진 순서로 돌린다. swarm은 Cursor `Task` 도구 위에 역할별 모델 표를 얹은 것이라 가져올 부분이 거의 없다.

**`automate-me`.** 여러 대화 기록에서 사용자 습관을 뽑아 개인용 `-mode` 스킬을 만든다. 전역 `CLAUDE.md`에 언어, 설명 방식, 금지 표현, 응답 기본값이 이미 자세히 적혀 있고, `explain-clearly`가 같은 규칙을 다시 설명할 때 쓴다. 새로 뽑아낼 습관이 남아 있지 않다.

**`principle-laziness-protocol`.** 삭제 우선, 가장 작은 diff, 추상화를 더하려는 유혹 의심을 말한다. 함께 쓰는 외부 스킬 `ponytail`(DietrichGebert/ponytail, `EXTERNAL-SKILLS.md`)이 같은 사다리를 갖고 있다. 필요한가, 코드베이스에 이미 있는가, 표준 라이브러리로 되는가, 플랫폼 기능으로 되는가, 설치된 의존성으로 되는가 순이다. `ponytail`은 my-skills에 들어 있지 않아서, 다른 기기에서는 따로 설치해야 한다.

**`principle-subtract-before-you-add`.** 짓기 전에 죽은 코드와 중복을 먼저 지운다. 코드는 `ponytail`의 "Already in this codebase?" 단계가 덮고, 문서는 `writing-for-agents`의 Pruning(single source of truth, sediment, no-op 찾기)이 덮는다. 2026-11-11 세션에서 `AGENTS.md`를 고칠 때 덧붙이는 쪽으로 쓴 일이 있었다. 그때 `writing-for-agents`는 이미 로드돼 있었다. 그래서 그 문제는 규칙 문서가 없어서 생긴 일로 보지 않았고, 원칙 파일을 하나 더 넣는다고 해결되지 않는다고 판단했다.

**`principle-encode-lessons-in-structure`.** 같은 지시를 두 번째로 쓰게 되면 린트, 스크립트, 타입으로 굳힌다. `correct`가 이 원칙을 실행하는 스킬이라 `correct` 후보에 합쳤다.

## 확인하지 못한 것

- Claude Code 내장 `run` 스킬이 `.claude/skills/verify-<app>/` 형태의 프로젝트 스킬을 실제로 찾아 쓰는지.
- `correct`의 검사를 설치된 프로젝트와 my-skills 각각에서 어디서 돌릴지(pre-commit 훅, CI). my-skills에는 지금 CI와 pre-commit 훅이 없다.
- 스킬 frontmatter의 `paths` 필드를 Claude Code와 Codex가 지원하는지.
- `why`가 쓸 MCP 중 설치될 프로젝트에서 실제로 인증해 쓸 것이 무엇인지.
