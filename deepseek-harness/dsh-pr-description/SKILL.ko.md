---
name: dsh-pr-description
description: deepseek-harness pull request를 만들 때, 또는 이후 변경이나 처리된 리뷰 라운드 뒤에 그 description을 업데이트할 때 사용한다. 각 description 섹션의 정의, Issue 참조, 테스트 설계, 변경별 공지(disclosure), 그리고 AI Usage 섹션(레벨, 단계, 채점 규칙, AI-DECLARATION 배지, 업데이트 시점)을 다룬다.
user-invocable: false
---

# PR description 작성

이 스킬은 deepseek-harness PR description에 무엇이 들어가는지, 어떻게 작성하는지, 언제 업데이트하는지를 정의한다. [PR template](../../../.github/pull_request_template.md)은 섹션 제목과 placeholder만 제공하며, 각 섹션의 요구 사항은 이 스킬이 정한다. `gh pr create --body-file`로 만든 PR처럼 템플릿을 건너뛴 PR도 포함해, 모든 PR description은 이 스킬을 따른다.

## 범위

- PR을 만들 때 description 전체를 작성한다.
- PR이 존재한 뒤에는 description이 PR 내용과 맞지 않게 되면, 적절하다고 판단한 시점에 해당 섹션을 업데이트한다.
- 스택을 이루는 각 PR은 자기 description을 가지며, 그 description은 base branch 대비 해당 레이어의 변경만 다룬다.

## Description 구조

Description은 두 번째 수준 제목 네 개를 다음 순서로 사용한다: `## Motivation`, `## Changes`, `## Testing`, `## AI Usage`.

**Interface changes**, **Behavior changes**, **Test design**, **Test entries** 같은 고정 섹션 제목과 레이블은 영어로 쓴다. 표 헤더와 나머지 description은 PR description의 언어로 쓴다. 사람이 다른 언어를 요청하지 않는 한 중국어다.

### Motivation

- 문제를 한 문장으로 쓴다.
- 같은 저장소의 Issue를 최소 하나 참조한다. PR이 Issue를 해결하면 `Fixes #N`, `Closes #N`, `Resolves #N`을 쓰고, 맥락만 제공하면 `Refs #N`을 쓴다. PR 번호는 Issue 참조로 인정되지 않으며, HTML 주석, 코드 펜스, 인라인 코드 안의 참조도 인정되지 않는다. 정확한 규칙과 Priority 매칭은 [Issue management](../../../.github/issue-management/README.md)가 정한다.

### Changes

- Interface changes: 명령(저장소 스크립트 포함), 플래그, 설정 키, 환경 변수, public export, 플러그인 등록 값, 프로토콜, 영속 형식의 변경을 요약한다. 변경이 없으면 None이라고 쓴다.
- Behavior changes: 사용자, 모델, 개발자, 시스템이 관찰할 수 있는 결과를 요약한다. 기본값, 성능, 타이밍, 출력이 여기에 포함된다. 변경이 없으면 None이라고 쓴다. README, AGENTS.md, 스킬 같은 문서와 에이전트 지침의 변경은 그 문서를 읽는 독자에게 주는 behavior change다.
- diff가 보장하고 테스트가 덮는 동작만 쓴다.

### Testing

Testing은 test design으로 시작하고, 그다음에 test entries가 온다.

**Test design**: 테스트가 Changes의 각 항목을 어떻게 덮는지, 그리고 그 덮음이 왜 완전한지 요약한다. 변경 유형에 따라 형식을 고른다.

| 변경 유형 | Test design이 보여 줄 내용 |
|---|---|
| Behavior change | 시나리오 × 변경 전 동작 × 변경 후 동작 × 덮는 테스트의 behavior matrix. 변경 전에 어떤 시나리오가 실패했거나 달랐는지 보여 준다 |
| Performance change | 측정 조건(머신, 실행 횟수, 값을 얻는 방법)과 함께 단계 또는 시나리오별 변경 전후 값 |
| 동작 변경 없는 refactoring 또는 migration | 변하지 않은 동작을 보여 주는 방법: byte 단위 비교, 변하지 않은 snapshot, 이전과 이후를 비교하는 테스트 |
| Documentation only | 내용을 확인하는 방법: 링크, 이중언어 짝 맞춤, 예제 컴파일 등 |

PR이 여러 변경 유형을 섞으면, 존재하는 유형마다 형식을 하나씩 제시한다. Changes에서 None으로 적힌 항목은 test design이 필요 없다.

**Test entries**:

- 테스트 메서드마다 entry를 하나씩 추가한다. 명령이나 단계를 눈에 보이게 쓰고, 그 테스트가 덮는 동작을 적는다.
- 실제로 실행한 테스트만 결과와 함께 나열한다. description을 업데이트할 때 이후 실행 결과를 추가한다. 근거가 로컬 실행에서 왔는지 CI에서 왔는지 밝힌다.
- 테스트 출력, 스크린샷, 녹화, 로그처럼 검토할 수 있는 근거는 해당 entry의 `<details><summary>Proof</summary>` 블록에 넣는다. 전체 출력이 길면 블록에는 명령, 개수, 결과 요약만 넣어도 된다.

### 변경별 공지(Change-specific disclosures)

각 공지는 해당 내용이 속한 섹션, 보통 Changes 안에 쓴다. 공지는 그 내용을 가리키는 굵은 영어 레이블 뒤에 쓰며, 예를 들면 **Existing test behavior**다. 제목을 새로 추가하지 않는다.

| 변경 | Description이 밝히는 내용 | 규칙의 owner |
|---|---|---|
| 기존 테스트가 설명하는 동작을 바꿈 | 동작이 바뀐 이유 | [root AGENTS.md](../../../AGENTS.md)의 Tests describe behavior 규칙 |
| `scripts/doc-budgets.manifest.json`에서 ceiling을 올림 | 올린 ceiling마다 이전 값과 새 값, 그리고 단어가 왜 필요한지 | [Wordcount budgets](../../../docs/AGENTS.md#wordcount-budgets) |
| 제품 사용자에게 보이는 GUI 동작을 바꿈 | 포함된 시연 GIF와, record-browser-gif가 요구하는 공지를 embed 옆에 함께 쓴다. GIF가 없는 GUI 변경마다 GIF가 없다는 사실과 그 이유를 쓴다 | [record-browser-gif](../record-browser-gif/SKILL.md#every-gui-pull-request-includes-a-gif) |
| 용어 목록에 없는 번역 용어를 사용함 | 그 번역의 출처, 또는 pending terms 아래의 제안 번역 | [Translation rules](../../../docs/i18n/translation-rules.md) |

## AI Usage

이 섹션은 PR의 각 단계에 AI가 얼마나 참여했는지, 그리고 누가 결정을 내렸는지 기록한다.

### 레벨

레벨은 AI 관여가 적은 순서에서 많은 순서로 정렬된다. 각 레벨은 영어 이름과 중국어 이름을 짝으로 가진다. AI 참여도(AI involvement)는 그 단계의 결정과 작업에 AI가 얼마나 참여했는지를 나타내며, 고른 레벨의 범위 안에서 5%의 배수로 기록한다. 코드 양, 시간, 토큰을 재는 지표가 아니다.

| 레벨 | 의미 | AI 참여도 |
|---|---|---|
| hint 人工独立 | 사람이 작업한다. AI는 참여하지 않거나, 사람이 수락하거나 거절하는 수동적 제안만 한다 | 0–10% |
| assist 人工主导 | 사람이 핵심 내용이나 모든 핵심 결정을 제공한다. AI는 작업의 일부를 완성한다 | 15–25% |
| pair 人工引导 | 사람이 핵심 방향이나 제약을 주고 AI의 결과물을 여러 차례 수정한다. 사람은 내부 구현을 이해한다 | 30–50% |
| copilot 人工把关 | AI가 작업 전체를 완성한다. 사람은 검토, 선택, 거절을 하고, 핵심 사항을 결정하거나 명확히 하되 실질적인 내용은 제공하지 않는다 | 55–85% |
| auto 模型自主 | AI가 작업을 자율적으로 완성한다. 사람은 목표만 정하거나 결과물을 수락한다 | 90–100% |
| n/a 暂不适用 | 그 단계가 존재하지 않거나, 아직 일어나지 않았다 | — |

### 단계와 기준

단계는 고정된 순서로 나온다. 각 단계는 영어 이름과 중국어 이름을 짝으로 가진다. 아래 기준은 assist부터 auto까지를 다룬다. hint는 레벨 표의 의미에 따라 판단한다.

**breakdown 问题拆解**: 문제가 나타난 뒤, 사람이 문제를 나누는 데 참여했는지, 아니면 Agent가 바로 문제에 대응했는지. 문제를 고쳐야 한다는 확인은 design이 아니라 이 단계에 속한다.

- auto 模型自主: Agent가 문제에 바로 대응한다.
- copilot 人工把关: Agent가 하위 문제, 근본 원인, 범위를 식별한다. 사람은 이를 확인하거나 Agent 목록에서 항목을 뺀다.
- pair 人工引导: 사람이 핵심 사실을 한두 개 제공한다. 예를 들면 의심되는 방향, 핵심 하위 문제, 트리거 조건, 범위 제한이다. 또는 사람이 근본 원인을 추적하도록 요구한다. 나머지는 Agent가 식별한다.
- assist 人工主导: 사람이 PR 범위를 이루는 문제나 하위 문제 목록, 또는 근본 원인 판단을 제공하고 범위를 정한다. Agent는 근본 원인을 추적하거나 그 목록을 바탕으로 작업한다.

**design 方案设计**: 누가 논리 설계를 제공했는지, 그리고 사람이 트레이드오프와 세부 변경을 몇 개나 결정했는지. 채택된 설계 구조를 누가 제공했는지로 등급을 매기며, 후보를 누가 먼저 제안했는지로 매기지 않는다. Agent가 후보를 제안하고 사람이 채택된 구조를 제공했다면 그 단계는 assist다. 설계 구조란 모듈 분할, 데이터 흐름, 핵심 인터페이스, 상태 전이를 뜻한다. 문서의 경우에는 디렉터리, 페이지 분할, 책임 계층을 뜻한다. 관찰 가능한 결과로 서술된 제약은 구조가 아니라 제약이다. 사람이 연속된 수정을 거쳐 도달한 구조는 사람이 제공한 것으로 본다.

- auto 模型自主: 사람이 Agent의 설계를 제안된 그대로 채택하거나, Agent가 추천한 옵션만 확인한다.
- copilot 人工把关: 사람이 Agent의 설계들 가운데 고르거나, 그중 일부를 거절한다.
- pair 人工引导: Agent가 설계 구조를 제안한다. 사람은 핵심 제약, 이름, 여러 차례의 수정을 준다.
- assist 人工主导: 사람이 설계 구조(모듈 분할, 데이터 흐름, 핵심 인터페이스)를 제공한다. Agent는 메커니즘을 채우거나 문서로 정리한다.

**testing 验收测试**: 누가 검수 목표, 테스트 케이스, 테스트 매트릭스를 정하고, 누가 결과를 확인하는지. 문서만 바뀐 변경의 경우 검수 목표는 내용 요구 사항이다. 작업 순서만 지정하는 지시, 예를 들면 수정 전에 테스트를 먼저 쓰라는 지시는 이 단계에 포함되지 않는다.

- auto 模型自主: Agent가 목표와 케이스를 정한다. 사람은 게시를 승인하거나, Agent가 추천한 범위를 확인하는 정도에 그친다.
- copilot 人工把关: 사람이 Agent가 보고한 케이스, 테스트 매트릭스, 결과를 검토하거나 의견을 남긴다.
- pair 人工引导: 사람이 정량적 목표나 필수 시나리오를 정한다. 예를 들면 반드시 덮어야 하는 트리거 조건이나 변경 전후 대비다. 문서만 바뀐 변경이라면 내용 요구 사항을 정한다. Agent가 구체적인 케이스를 설계한다.
- assist 人工主导: 사람이 테스트 매트릭스, 즉 차원이나 행을 정의하고, 결과를 직접 실행하거나 시도해 확인한다. Agent는 값과 케이스를 채울 수 있다.

**implementation 技术实现**: 변경된 내용에 대한 사람의 개입. 프로덕션 코드, 문서(README, JSDoc, Agent Notes, 주석), CI, 릴리스 스크립트가 여기에 포함된다.

- auto 模型自主: Agent가 모든 변경을 작성하고, 기록에 사람의 diff 검토가 없다.
- copilot 人工把关: 사람이 diff를 검토한다. 조각 단위로 staging하는 것도 포함된다. 그리고 diff를 수락하거나, 작업을 다시 하게 만들지 않는 몇 가지 의견을 남긴다.
- pair 人工引导: 사람이 작업의 일부를 되돌리거나 다시 하도록 요구하거나, 리팩터링이나 구현 방식을 지정한다.
- assist 人工主导: 사람이 diff의 핵심 부분을 직접 작성하고, Agent가 나머지를 완성한다. 내용을 불러 주어 Agent가 쓰게 하는 것은 직접 쓴 것이 아니다.

**review 评审处理**: 처리한 리뷰 코멘트마다 고침인지 거절인지를 누가 결정했는지. 봇과 사람이 남긴 코멘트 모두 포함된다. 등급은 답글을 누가 달았는지가 아니라 누가 결정했는지로 매긴다. 처리된 리뷰 코멘트가 하나도 없으면, 코멘트가 존재하거나 머지 후에 도착했더라도 이 행은 n/a로 남는다.

- auto 模型自主: Agent가 모든 코멘트를 결정하고 답글을 단다.
- copilot 人工把关: 사람은 포괄적인 승인이나 카테고리 단위 지시만 주거나, Agent가 준비한 처리 목록에서 일부 항목에만 응답하고 나머지는 Agent에게 맡긴다.
- pair 人工引导: 사람이 말씨를 다듬는 코멘트를 제외한 모든 항목에 응답한다. 스레드나 Agent 목록에서 고칠지, 거절할지, 미룰지를 결정한다. 짧은 수락만 있어도 된다. 중복으로 병합된 코멘트는 한 항목으로 센다. 말씨에 관한 코멘트는 카테고리 단위로 처리할 수 있다. Agent가 결정을 실행하고 답글을 단다.
- assist 人工主导: 사람이 리뷰어에게 직접 답글을 달거나, 쟁점이 된 항목의 논의를 주도한다. 결정은 사람이 하고 답글은 Agent가 다는 경우는 pair다.

### 채점 규칙

- 세션 기록과 작업 기록에서 등급을 매긴다. 사람이 subagent 세션에서 보낸 메시지도 포함한다. Agent가 subagent에게 쓴 지시는 사람의 메시지가 아니다.
- 이 PR에 최종적으로 남는 작업만 센다. 이전 세션의 작업이라도 이 PR에 최종적으로 남으면 센다. 사람이 작업을 되돌리거나 다시 하라고 요청했다면, 되돌려진 작업이 PR에 남아 있지 않더라도 그 요청은 센다.
- breakdown, design, testing, implementation에서 사람은 Agent와 함께 일하는 작성자다. 리뷰어의 승인과 코멘트는 review에서만 센다.
- 브랜치 전략, 작업 순서, staging, commit, push, PR 생성 시점 같은 과정이나 순서 지시는 어떤 단계에서도 사람의 참여로 세지 않는다.
- 기록이 충분하면, 기준을 충족하는 레벨 중 사람의 참여가 가장 많은 레벨로 등급을 매기고, 사람과 Agent의 몫은 AI 참여도 값으로 나타낸다. 기록이 충분하지 않을 때만 기록이 뒷받침하는 범위에서 사람의 참여가 더 적은 레벨을 고른다.
- 한 단계가 여러 변경을 다루면 주요 변경을 기준으로 등급을 매기고, 다른 변경은 어떻게 다른지 description에 밝힌다. 주요 변경은 diff와 리뷰 노력에서 가장 큰 비중을 차지하는 변경이다. 어느 한 변경이 지배적이지 않으면 사람의 참여가 가장 많은 변경을 기준으로 등급을 매긴다. 이후 작업으로 주요 변경이 바뀌면 그 단계의 등급을 다시 매긴다.
- 고른 레벨의 범위 안에서는, 사람의 참여가 사람 참여가 더 많은 레벨의 기준에 가까울수록 낮은 AI 참여도 값을 고르고, Agent 쪽 레벨의 기준에 가까울수록 높은 값을 고른다.

### 배지 URL

AI-DECLARATION 블록은 명세 버전 0.1.2를 고정한다. [Section format](#section-format)에서 고른 레벨에 맞는 배지 URL을 쓴다. 배지는 [AI-DECLARATION](https://ai-declaration.md)을 따른다.

| 레벨 | 배지 URL |
|---|---|
| hint 人工独立 | `https://img.shields.io/badge/䷼%20AI--DECLARATION-hint-ecfccb?labelColor=ecfccb` |
| assist 人工主导 | `https://img.shields.io/badge/䷼%20AI--DECLARATION-assist-fef9c3?labelColor=fef9c3` |
| pair 人工引导 | `https://img.shields.io/badge/䷼%20AI--DECLARATION-pair-ffedd5?labelColor=ffedd5` |
| copilot 人工把关 | `https://img.shields.io/badge/䷼%20AI--DECLARATION-copilot-fee2e2?labelColor=fee2e2` |
| auto 模型自主 | `https://img.shields.io/badge/䷼%20AI--DECLARATION-auto-ede9fe?labelColor=ede9fe` |

상위 명세가 바뀌면, 이 스킬과 PR template에 있는 모든 버전 참조를 함께 업데이트한다.

### 섹션 형식

섹션은 AI-DECLARATION 블록으로 시작하고, 그다음에 고정된 순서의 단계마다 표 행을 하나씩 둔다.

```markdown
## AI Usage

<!-- ai-declaration:start -->
[![AI-DECLARATION: <highest level>](<badge URL>)](https://ai-declaration.md)

**AI declaration** ([v0.1.2](https://ai-declaration.md/en/0.1.2)): `<highest level>`
<!-- ai-declaration:end -->

| 阶段 | 级别 | AI 参与度 | 决策记录 |
|:--|:--|--:|:--|
| <stage English name> <stage Chinese name> | <level English name> <level Chinese name> | <AI involvement> | <description> |
```

- 배지 레벨은 단계 행들 가운데 AI 참여도가 가장 높은 레벨이다. n/a 暂不适用 행은 무시한다. 이는 전역 레벨이 선언된 레벨 중 가장 높은 것이라는 [명세 규칙](https://ai-declaration.md)을 따른다.
- `ai-declaration` 마커는 유지한다. 그래야 기존 선언을 중복 없이 제자리에서 교체할 수 있다.
- 설명은 PR description의 언어로, 한두 문장으로 쓴다. 중국어는 최대 80자, 영어는 최대 40단어다. 누가 어떤 결정을 내렸는지 밝힌다. 대표 결정 한두 개를 이름으로 들고, 나머지는 개수로만 적는다.
- 설명은 확정된 사실로 쓴다. "세션에서 확인되지 않음", "작성자 확인 대기 중" 같은 완곡한 표현을 쓰지 않는다.
- 사람은 작성자 또는 리뷰어로 부르며, 사용자 이름으로 부르지 않는다. 판단, 세션 시각, 세션 id, 직접 인용, 검사와 CI의 실행이나 처리(로컬 건너뛰기, hook, 재실행, 무관한 실패)는 쓰지 않는다.

### 업데이트 시점

- PR을 만들 때 review 행은 `| review 评审处理 | n/a 暂不适用 | — | ` 뒤에, 아직 처리된 리뷰 코멘트가 없다는 내용을 description의 언어로 이어서 쓴다.
- PR이 존재한 뒤 description을 업데이트할 때는, 영향을 받은 행을 다시 써서 지금까지의 모든 작업을 포괄하게 한다. 이후 작업이 결정이나 사람의 참여 몫을 바꾼 앞 단계도 포함한다. 변경 이력을 덧붙이지 않는다.
- 단계의 레벨이 바뀌면 그 행을 업데이트한다. 최고 레벨이 바뀌면 배지 URL과 선언 줄도 함께 업데이트한다.
- review 행에는 처리된 리뷰 코멘트만 기록한다. 승인, 머지 시점, 처리되지 않은 코멘트는 뺀다.
- 리뷰 라운드는 수정이 push되고 코멘트에 답변이 달리면 끝난다. 머지 후에 도착한 코멘트는 업데이트를 유발하지 않는다.

### 예시

#6013의 세션 기록과 리뷰 기록을 바탕으로 채운 예시다.

```markdown
## AI Usage

<!-- ai-declaration:start -->
[![AI-DECLARATION: pair](https://img.shields.io/badge/䷼%20AI--DECLARATION-pair-ffedd5?labelColor=ffedd5)](https://ai-declaration.md)

**AI declaration** ([v0.1.2](https://ai-declaration.md/en/0.1.2)): `pair`
<!-- ai-declaration:end -->

| 阶段 | 级别 | AI 参与度 | 决策记录 |
|:--|:--|--:|:--|
| breakdown 问题拆解 | pair 人工引导 | 40% | The author identified two process-specific values that do not belong in the system prompt and pointed to the custom model route; the Agent traced the root cause. |
| design 方案设计 | assist 人工主导 | 20% | The author supplied the design structure: runtime context, frozen legacy sections for old sessions, and a separate package; the Agent filled in the projection matching. |
| testing 验收测试 | pair 人工引导 | 40% | The author required two scenarios: restoring an old session after upgrade, and changing ports after upgrade; the Agent wrote the cases and snapshots. |
| implementation 技术实现 | pair 人工引导 | 35% | The Agent wrote the code and the Agent Note; the author required one revert and specified 3 approaches, such as getOrigin() instead of an origin property. |
| review 评审处理 | pair 人工引导 | 40% | The author decided each bot comment, such as no upgrade guide and keeping a devDependency; the Agent fixed and replied. |
```

## description 생성과 업데이트

1. description을 git이 무시하는 파일에 쓴다. 예를 들면 `.artifacts/pr/body.md`다. `gh pr create --body-file <file>`로 PR을 만들거나, `gh pr edit <number> --body-file <file>`로 업데이트한다. description이 GIF를 embed한다면 [record-browser-gif](../record-browser-gif/SKILL.md)를 따르고 `--attach`를 쓴다.
2. 업데이트하기 전에 `gh pr view <number> --json body --jq .body`로 현재 description을 저장한다. 그리고 수정이 필요한 섹션만 바꾼다. 작성자가 쓴 내용과 미디어는 유지하고, 기존 `ai-declaration` 블록의 내용만 교체한다. 코드와 맞지 않게 된 문장은 제거한다. description에 아직 옛 `## Human and Agent Roles` 제목이 남아 있다면, 그 제목과 레벨 줄을 `## AI Usage`와 블록으로 바꾼다. AI Usage 섹션은 하나만 남긴다.
3. 작성한 뒤에는 description을 다시 읽어 확인한다. 네 섹션이 모두 있는지, AI Usage가 현재 코드와 리뷰 상태에 맞는지, 옛 `## Human and Agent Roles` 섹션이 남지 않았는지를 본다.
