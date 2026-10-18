---
name: poteto-help
description: Guides users through pstack setup, /poteto-mode, and picking the skill, playbook, or principle for a task. Type /poteto-help with a question.
disable-model-invocation: true
---

# Poteto help

pstack에 관한 사용자의 질문에 답하고, 보낼 수 있는 프롬프트를 건네고, 답의 출처 파일을 링크합니다. 도움말 질문이라면 작업을 시작하지 마세요. 사용자는 방법을 물었고, pstack 실행은 실제 토큰을 쓰므로 프롬프트를 직접 보내게 두세요.

"이 버그를 pstack으로 고쳐줘"처럼 작업을 요청하는 메시지는 도움말 질문이 아닙니다. [`poteto-mode`](../poteto-mode/SKILL.md)를 읽고, 그 방식에 따라 작업을 수행하세요. Custom Mode를 쓰면 계속 유지된다는 점을 한 번 알려주세요.

이 파일은 질문을 답이 들어 있는 스킬과 가이드 페이지에 연결합니다. 세부 내용은 그 파일들이 담당합니다. 파일을 인용하기 전에 연결된 파일을 먼저 읽으세요. 이 지도와 파일 내용이 다르면 파일 내용을 믿으세요. 여기의 링크는 설치된 플러그인 안을 가리키는데, 사용자가 열 수 없을 수 있으므로 공개 사본을 전달하세요: `https://github.com/cursor/plugins/blob/main/pstack/` 뒤에 파일 경로를 붙인 URL입니다.

## 무엇이 필요한지 파악하기

메시지와 대화에서 필요한 것을 추론하세요. "PR을 리뷰하는 스킬은 뭐야?"처럼 상황이 명시되어 있으면 해당 섹션으로 바로 가세요. 필요한 것이 여전히 불분명하면 다음 선택지를 담은 객관식 질문을 한 번 하고, 사용자가 고른 섹션에만 답하세요.

- 설정 시작하기
- `/poteto-mode`로 작업 시작하기
- 상황에 맞는 스킬 고르기
- 잘못된 실행 고치기
- pstack을 내 방식으로 바꾸기

답을 바꾸는 상태를 확인하고, 그럴 때만 언급하세요.

- `~/.cursor/rules/pstack-models.mdc`가 없으면 이 사용자에 대해 `/setup-pstack`이 실행되지 않은 것이므로, 모든 역할이 기본 모델을 사용합니다.
- 프로젝트에 `verify-*` 스킬이나 다른 앱 harness가 없으면 에이전트가 앱을 스크립트로 구동할 방법이 없습니다. 변경이 실제로 작동하는지 증명하는 질문이라면 `/create-verification-skill`을 언급하세요.

## 설정 시작하기

1. 채팅에서 `/add-plugin pstack`을 입력하거나, 사이드바의 Customize에서 설치합니다.
2. [`/setup-pstack`](../setup-pstack/SKILL.md)을 실행합니다. 추론 예산을 묻고, 역할마다 모델을 매핑하고, 규칙 파일을 작성합니다. 그 규칙은 새 채팅에 적용됩니다.
3. `/poteto-mode`, 목표, 통과 또는 실패를 판정할 수 있는 확인 기준으로 실제 작업을 시작합니다.

사용자가 스킬을 호출하기 전에는 설치만으로 아무것도 바뀌지 않습니다. `/setup-pstack`만 사용자의 말에 따라 로드됩니다. 자세한 내용은 [README](../../README.md)와 [가이드 1페이지](../../docs/guide/01-setup.md)에 있습니다. 사용자의 첫 프롬프트를 다듬어 줄 수 있는지 제안하세요. 방법은 [`references/prompting.md`](references/prompting.md)를 따릅니다.

비용이 걱정이라면, 토큰이 어디에 쓰이는지와 줄이는 방법을 설명하세요. pstack은 서브에이전트와 리뷰 패널에 추가 토큰을 씁니다. `/setup-pstack`을 다시 실행해 더 작은 예산이나 더 저렴한 모델을 고르세요. `auto` 또는 `inherit-parent`로 설정된 역할은 채팅의 모델로 실행되므로, 채팅이 Auto나 더 저렴한 모델을 쓰면 토큰이 절약됩니다. 패널 목록이 짧을수록 항목마다 하나씩 실행되는 서브에이전트가 줄어듭니다. `/poteto-mode`는 엄밀함이 필요한 작업에만 쓰세요.

pstack은 Cursor를 위해 만들어졌습니다. 스킬은 Agent Skills 형식을 따르므로 다른 도구도 읽을 수 있습니다. 하지만 `/poteto-mode`, `/how`, `/why`, `/teach`를 포함한 대부분의 워크플로 스킬은 역할별 모델을 가진 Cursor 서브에이전트를 띄웁니다. Custom Mode와 `/loop`도 Cursor 기능이므로, 다른 곳에서는 이 부분이 동작하지 않을 수 있습니다.

## `/poteto-mode`로 작업 시작하기

`/poteto-mode`는 작업을 플레이북에 맞추고, 플레이북의 단계를 할 일 목록에 복사하며, 단계에 필요할 때 다른 스킬을 실행합니다. 건너뛴 단계는 `skip: <reason>`으로 목록에 남습니다. 좋은 프롬프트는 목표와 완료 여부를 판단하는 방법을 말합니다. 스킬 목록은 적지 않습니다. 손으로 쓴 순서는 플레이북이 유지하는 단계를 빠뜨리거나 순서를 바꾸기 쉽기 때문입니다. 프롬프트를 함께 다듬기 전에 [`references/prompting.md`](references/prompting.md)를 읽으세요. [가이드 2페이지](../../docs/guide/02-poteto-mode.md)에 예시가 있습니다.

`/poteto-mode`가 계속 켜져 있을지는 사용자가 시작한 방식에 따라 달라집니다.

- `/poteto-mode`에서 Enter를 누르면 그 스킬이 메시지 하나에만 붙습니다. 대화가 넘어가면 사라집니다.
- Mac에서는 Option+Enter, Windows에서는 Alt+Enter, 또는 스킬 항목의 Use as Mode를 사용하면 Custom Mode가 됩니다. 사용자가 모드를 끝낼 때까지 매 턴 컨텍스트에 남고, 일상적인 턴에서는 빠집니다.
- Cursor 문서는 Agents Window와 CLI에서 Custom Mode를 안내합니다. 그 밖의 환경에서는 새 작업을 시작할 때마다 `/poteto-mode`를 입력하세요.

이 이야기가 나오면 [Cursor의 스킬 문서](https://cursor.com/docs/skills)를 링크하세요. 채팅 도중 "new task"라고 말하면 모드가 새 플레이북과 맞춰집니다. `/poteto-mode`는 플레이북 단계가 띄우는 서브에이전트에 이미 `poteto-agent`를 사용합니다. 직접 띄운 서브에이전트에도 같은 스타일을 적용하려면 `subagent_type: "poteto-agent"`로 띄우세요.

## 스킬 고르기

기본 답은 `/poteto-mode`입니다. 필요할 때 다른 스킬 대부분을 실행합니다. 사용자가 플레이북이 주는 것보다 더 많거나 적은 것을 원하면 스킬을 직접 지정하세요. 추천하기 전에 스킬을 읽고, 예시 프롬프트를 하나 주세요.

| 사용자가 원하는 것 | 스킬 |
|---|---|
| 엄밀함이 필요한 사소하지 않은 작업 수행 | [`/poteto-mode`](../poteto-mode/SKILL.md) |
| 지금 코드가 어떻게 동작하는지, 또는 새 코드가 어디에 있어야 하는지 알기 | [`/how`](../how/SKILL.md) |
| 코드가 왜 이런 모양인지, 또는 숫자가 어디서 왔는지 알기 | [`/why`](../why/SKILL.md) |
| 변경이나 서브시스템을 쉽게 풀어서 이해하기 | [`/teach`](../teach/SKILL.md) |
| 특정 주제에 관한 자신의 최근 작업 따라잡기 | [`/recall`](../recall/SKILL.md) |
| 작은 diff가 그 바깥에서 무엇을 깨뜨릴 수 있는지 알기 | [`/blast-radius`](../blast-radius/SKILL.md) |
| 함수 경계를 넘는 코드를 쓰기 전에 타입과 모듈 형태 정하기 | [`/architect`](../architect/SKILL.md) |
| 하나의 브리프에 대해 여러 시도를 받고, 가장 좋은 결과로 합치기 | [`/arena`](../arena/SKILL.md) |
| 슬라이스 단위 병렬 점검을 하거나, 워커를 경쟁시켜 클라우드 에이전트로 실행하기 | [`/swarm`](../swarm/SKILL.md) |
| 여러 모델이 diff를 리뷰하고 깨뜨려 보게 하기 | [`/interrogate`](../interrogate/SKILL.md) |
| 저렴한 로컬 테스트가 있을 때 테스트 먼저 작성해 버그 고치기 | [`/tdd`](../tdd/SKILL.md) |
| `.ts` 또는 `.tsx` 작업에 TypeScript 규칙 적용하기 | [`/typescript-best-practices`](../typescript-best-practices/SKILL.md) |
| 주석을 쓰지 않은 리뷰어를 써서 리뷰 전에 주석 제거하기 | [`/no-comments`](../no-comments/SKILL.md) |
| 산문에서 AI 티를 지우기 | [`/unslop`](../unslop/SKILL.md) |
| 문서, RFC, README, PR 설명, 커밋 메시지를 기준에 맞게 쓰기 | [`/technical-writing`](../technical-writing/SKILL.md) |
| 마지막 답변을 쉬운 말로 다시 듣기 | [`/bro`](../bro/SKILL.md) |
| 에이전트가 앱을 스크립트로 구동하고 동작을 증명할 방법 주기 | [`/create-verification-skill`](../create-verification-skill/SKILL.md) |
| 검증 스킬과 기능 지도를 앱에 맞게 다시 정렬하기 | [`/maintain-verification-skill`](../maintain-verification-skill/SKILL.md) |
| 성능 수치를 보고하거나 근거로 삼기 전에 검증하기 | [`/benchmark-checklist`](../benchmark-checklist/SKILL.md) |
| 규모가 크거나 여러 영역에 걸친 변경을 실행하거나, 자리를 비운 뒤 리뷰할 변경을 처리하기 | [`/figure-it-out`](../figure-it-out/SKILL.md) |
| 실행 중 결정 기록을 남기고 나중에 검토하기 | [`/show-me-your-work`](../show-me-your-work/SKILL.md) |
| 역할마다 모델을 고르고 추론 예산 정하기 | [`/setup-pstack`](../setup-pstack/SKILL.md) |
| 자신의 작업 습관을 개인용 모드 스킬로 만들기 | [`/automate-me`](../automate-me/SKILL.md) |
| 끝난 작업에서 배운 것을 스킬 수정으로 바꾸기 | [`/reflect`](../reflect/SKILL.md) |
| 이 저장소에서 에이전트가 같은 실수를 반복하지 않게 하기 | [`/correct`](../correct/SKILL.md) |
| 버튼이 웹훅으로 Grok Bot을 깨우는 페이지 만들기 | [`/make-bot-ui`](../make-bot-ui/SKILL.md) |
| pstack 둘러보기 | `/poteto-help` |

이 파일 옆의 스킬 디렉터리가 표에 없다면, 그 frontmatter를 읽고 description에 따라 라우팅하세요. `principle-*` 디렉터리는 아래 원칙 섹션에서 다룹니다.

애매한 경우:

- `/how`는 코드가 지금 무엇을 하는지 설명합니다. `/why`는 이유를 설명합니다. `/teach`는 둘 중 하나 또는 둘 다를 실행하고 결과를 쉽게 설명합니다.
- `/arena`는 모든 워커에게 같은 브리프를 주고 최선의 부분을 합칩니다. `/swarm`은 작업을 슬라이스나 경쟁으로 나누고 보고서 하나를 돌려줍니다.
- `/architect`는 설계를 정한 직후 구현합니다. 코드를 쓰기 전에 설계를 검토하고 싶다면 "with checkpoint"를 덧붙이세요.
- `/interrogate`는 diff를 리뷰합니다. `/blast-radius`는 diff 바깥의 깨짐을 찾고, 변경이 안전한 이유를 증명하는 사실 하나를 확인합니다.
- `/recall`은 최근 채팅들을 가로질러 컨텍스트를 다시 구성합니다. 특정 채팅이나 브랜치를 이어받는 것은 Session pickup 플레이북입니다.
- `/figure-it-out`은 엄밀한 실행 하나를 설계합니다. Orchestrate 플레이북은 며칠에 걸쳐 많은 PR을 다루는 프로그램을 실행합니다. Autonomous run 플레이북은 작업 하나를 완료 조건까지 끝냅니다.

pstack에 없는 것:

- `/deslop`, `control-cli`, `control-ui`는 `cursor-team-kit` 플러그인에 있습니다.
- `/loop`와 `/create-skill`은 Cursor 내장 기능입니다.
- pstack에는 `/orchestrate` 스킬이 없습니다. Orchestrate는 `/poteto-mode`의 플레이북입니다. 슬래시 메뉴에 `/orchestrate`가 보인다면 다른 플러그인이 제공하는 것입니다.

## 플레이북과 원칙

플레이북은 `/poteto-mode` 안의 단계 목록이며 스킬이 아닙니다. 따라서 슬래시 명령이 없습니다. `/poteto-mode` 안에서 작업을 설명하면 플레이북이 선택되고, 다음 문구는 특정 플레이북을 직접 지정합니다.

- "babysit this pr" 또는 "check on pr 123"은 Babysit을 실행합니다. PR을 merge 가능한 상태까지 몰고 거기서 멈춥니다. 사용자가 merge, land, ship을 요청하지 않으면 merge하지 않습니다.
- "land the stack"은 Shipping을 실행합니다.
- "take over this branch"는 Session pickup을 실행합니다.
- "pause safely"는 Pause safely를 실행합니다.
- "full autopilot on this queue"는 Autopilot-full을 실행합니다. "stack them, don't ship"은 Autopilot-stack을 실행합니다.
- "run the eval playbook"은 Eval을 실행합니다.

`/poteto-mode` 없이 "babysit this pr" 같은 문구를 쓰면, 같은 일을 하는 Cursor 자체 스킬이 대신 시작될 수 있습니다. [`poteto-mode`](../poteto-mode/SKILL.md)의 Playbooks 섹션은 모든 플레이북과 적용 시점을 나열합니다. [가이드 6페이지](../../docs/guide/06-verify-and-ship.md)는 PR을 열고, babysit하고, land하는 방법을 다룹니다.

pstack에는 계획 스킬이 없습니다. Cursor의 Plan Mode는 pstack과 함께 쓸 수 있습니다. 여러 단계나 쌓인 PR에 걸친 작업이라면 `/poteto-mode`에 계획을 요청하세요. 그러면 [Multi-phase plan 플레이북](../poteto-mode/playbooks/multi-phase-plan.md)이 실행되어 계획을 쓰지만 구현하지는 않습니다. 설계 질문이라면 Prototype 플레이북이나 `/architect`가 먼저 코드로 답을 정합니다.

원칙은 `/poteto-mode`가 읽고 답변에서 인용하는 한 줄짜리 규칙 스킬입니다. 사용자가 원칙을 직접 호출하는 일은 드뭅니다. 대신 이름을 사용해 방향을 잡습니다. 예를 들어 "apply prove it works. show me the real output."처럼 말합니다. `/principle-<name>`을 입력하면 필요할 때 원칙을 로드할 수도 있습니다. [가이드 8페이지](../../docs/guide/08-principles.md)에 목록이 있습니다.

## 잘못된 실행 고치기

| 증상 | 해결 |
|---|---|
| 몇 턴이 지나자 모드가 적용되지 않음 | Enter로 시작했습니다. Custom Mode로 시작하거나, 작업마다 `/poteto-mode`를 입력하세요. |
| 질문이 이전 작업의 다음 단계로 처리됨 | "new task"라고 말하거나, 이 턴에는 모드가 필요 없다고 말하세요. |
| 새 모델 선택이 효과가 없음 | `/setup-pstack`의 규칙은 새 채팅에 적용됩니다. 새 채팅을 시작하세요. |
| 실행 비용이 예상보다 큼 | 설정 시작하기 아래의 비용 단락을 보세요. |
| 스킬이 혼자서 로드되지 않음 | `/setup-pstack`만 사용자의 말에 따라 로드됩니다. 다른 스킬은 사용자가 입력하거나 `/poteto-mode`가 실행할 때 로드되며, `/poteto-mode`가 모든 스킬을 실행하지는 않습니다. |
| 병렬 에이전트가 서로의 작업을 덮어씀 | 에이전트마다 별도 worktree를 주거나, 각자 자신의 머신을 갖는 클라우드 에이전트로 실행하세요. |
| 밤새 실행된 작업이 움직였지만 끝낸 것이 없음 | `/loop`에는 기간이 아니라 통과 또는 실패를 판정할 수 있는 확인 기준이 필요합니다. [가이드 7페이지](../../docs/guide/07-overnight.md)를 보세요. |
| 빌드가 green이라며 성공을 주장함 | 실제 명령, 흐름, 저장된 값, 또는 프로파일을 요청하세요. 이것이 prove-it-works 원칙입니다. |

흐트러지는 실행에는 [`references/prompting.md`](references/prompting.md)에 한 줄짜리 조정 문장이 있습니다. [가이드 10페이지](../../docs/guide/10-recipes-and-pitfalls.md)에는 더 많은 함정과 그대로 복사해 쓸 만한 레시피가 있습니다.

## pstack을 내 방식으로 바꾸기

- [`/automate-me`](../automate-me/SKILL.md)는 사용자의 과거 작업 기록을 바탕으로 개인용 모드 스킬 초안을 만듭니다. 이 스킬은 `/poteto-mode`와 함께 씁니다.
- [`/reflect`](../reflect/SKILL.md)는 세션이 끝난 뒤 교훈을 스킬 수정안으로 바꾸고, 사용자가 승인하게 합니다.
- `/poteto-mode write a skill for <workflow>`는 작성 플레이북을 실행합니다. eval 플레이북은 스킬 변경을 블라인드 방식으로 테스트합니다.
- 잘못 동작하는 스킬은 그 스킬이 잘못된 기능 작업 안이 아니라, 별도 PR에서 고치세요.

[가이드 9페이지](../../docs/guide/09-make-it-yours.md)는 이 각각을 다룹니다.

## 답변

답의 결론을 먼저 말하세요. 예시 프롬프트는 많아야 하나를 코드 블록에 넣습니다. 맞는 것이 있다면 [`references/recipes.md`](references/recipes.md)에서 가져와 조정하고, 그 파일 링크를 붙이세요. 사용자가 전체 지도를 요청하지 않았다면 짧게 답하세요.
