---
name: why
description: "Use for 'why does X work this way', 'why we picked Y', design rationale, regressions, postmortems, or data-backed thresholds. Discovers available MCPs and queries each evidence category (source control, issue tracker, long-form docs, real-time chat, infrastructure observability, error tracking, product analytics warehouse) in parallel, then returns a cited read on decisions and tradeoffs. Use how for runtime behavior."
disable-model-invocation: true
---

# Why

코드 뒤에 있는 동기와 의도를 조사합니다.

`how` 스킬의 짝입니다. `how`는 코드가 무엇을 하고 어떻게 동작하는지 답하고, `why`는 코드가 지금의 모양이 되도록 만든 힘이 무엇이었는지 답합니다.

아래의 각 spawn은 `pstack-models.mdc` 규칙의 역할 줄(role line)과 기본값을 가리킵니다. 해당 줄의 값을 `model`로 설정하고, 규칙이나 줄이 없으면 기본값을 사용합니다. 값이 `auto` 또는 `inherit-parent`이면 `model`을 설정하지 않습니다. Task 도구가 slug를 거부하면 기본값을 쓰고 그 사실을 알립니다. 기본값도 거부되면 오류 메시지에서 같은 계열의 가장 가까운 유효한 slug를 사용합니다.

## 조사 자세 (Operating Posture)

**신중하고, 조심스럽고, 정밀한 조사자**로서 행동합니다. 무엇을 알고 있는지와 무엇을 추론하는지를 솔직하게 구분합니다. 신뢰도 프레임워크와 표현 가이드 전체는 `references/epistemics.md`를 읽으십시오. synthesizer는 이를 반드시 따라야 합니다.

## 1단계. 대상과 질문 파악

사용자가 무엇을 묻는지 분석합니다. **대상(target)**은 보통 코드 조각, 패턴, 기능, 또는 이름이 붙은 설계 결정입니다. **질문(question)**은 보통 설계 근거, 트레이드오프, 동기가 된 엣지 케이스, 외부 제약, 죽은 코드, 또는 넓은 범위의 이력 조사입니다.

대상이 모호하면(지시 대상이 없는 "왜 이렇게 하죠?" 같은 질문) 대화 맥락(열린 파일, 최근 편집, 커서 위치, 방금 논의한 내용)에서 가장 그럴듯한 추측을 세웁니다. 해석을 짧게 밝혀서 사용자가 방향을 바로잡을 수 있게 한 뒤 진행합니다.

## 2단계. 코드 앵커 확보

investigator를 spawn하기 전에 조사를 구체적인 코드에 고정합니다. 다음이 필요합니다.

- 관련 파일 경로와 줄 범위
- 핵심 심볼(함수 이름, 클래스 이름, 상수)
- 초기 커밋 목록: 대상을 건드린 최근 몇 개의 커밋
- 머지 커밋에서 얻은 PR 번호(제목 줄의 `(#1234)` 패턴)

이것은 인라인으로 만듭니다.

```bash
# Blame target lines for last-touch commits
git blame -L <start>,<end> <file>

# Full file history, with patches, through renames
git log --follow -p -- <file>

# Last N commits touching the file, PR numbers visible
git log --oneline -20 -- <file>

# Extract PR numbers from a commit message
git log -1 --format=%B <commit>
```

의미 있는 커밋에 대해서는 `gh`로 PR 본문과 논의를 가져옵니다.

```bash
gh pr view <number> --json title,body,author,createdAt,mergedAt,labels,closingIssuesReferences,comments,reviews
```

이를 시드 컨텍스트(파일 경로, 심볼, 커밋, PR 번호, 연결된 티켓 ID)로 기록하고 investigator에게 전달합니다.

## 3단계. 병렬 investigator 실행 (기본 자세)

**기본값은 전체 병렬 조사입니다.**

### 탐색 (Discovery)

investigator를 spawn하기 전에 Cursor 환경에서 사용 가능한 MCP를 나열합니다. 사용 가능한 도구 맵이 있으면 그것을 사용합니다. 없으면 Cursor가 노출하는 활성 MCP 서버 `mcps/` 디렉터리를 확인합니다.

사용 가능한 각 MCP를 하나의 증거 범주에 대응시킵니다.

1. 소스 컨트롤 이력
2. 이슈 / 티켓 트래커
3. 장문 문서
4. 실시간 팀 채팅
5. 인프라 관측성(observability)
6. 에러 / 예외 추적
7. 제품 분석 웨어하우스

소스 컨트롤은 항상 git과 `gh`로 사용할 수 있습니다. 나머지 여섯 가지는 MCP 이름, 서버 지침, 도구 이름, 리소스 설명자를 보고 분류합니다. MCP가 둘 이상의 범주에 맞으면 주된 증거와 일치하는 범주를 고릅니다. 모호한 경우는 coverage map에 기록합니다.

최소한이 아니라 **완전한 coverage map**을 목표로 합니다. 검색하지 않고 넘어가지 말고, 결과가 없었다면 그 사실을 기록합니다.

일치하는 모든 investigator를 **하나의 메시지에서** 함께 실행해 동시에 돌아가게 합니다. 한 agent에게 여러 MCP를 맡기지 않습니다.

각 subagent 설정:
- `subagent_type`: `generalPurpose`
- `model`: `why investigators` 줄의 값, 기본값 `grok-4.7-xhigh-fast`
- `readonly`: `false`(agent 모드). **readonly/Ask 모드를 사용하지 마십시오.** 이 모드는 MCP 접근을 제거해 MCP 기반 investigator를 완전히 무력화합니다. 그래도 investigator는 아무것도 쓰면 안 됩니다.

각 investigator가 받는 것:
1. `references/investigator-prompt.md`의 기본 프롬프트
2. 선택된 MCP에 해당하는 범주 playbook `references/sources/<source>.md`, `references/source-playbook.md`의 예시를 바탕으로 조정된 것
3. 대상 코드가 방어적으로 보이면(null 검사, 재시도 로직, 타임아웃 처리, 레이트 리밋, feature flag, egress guard, OOM 핸들러) 공통 관점인 `references/sources/incident-postmortem.md`
4. 2단계의 코드 앵커(파일 경로, 심볼, 커밋 해시, PR 번호, 티켓 ID)
5. 사용자의 원래 질문

### investigator 명단 (사용 가능한 증거 범주마다 하나)

일치하는 MCP가 있는 범주마다 investigator를 하나씩 spawn합니다. 각 investigator는 도구나 MCP 하나만 담당합니다.

각 항목은 범주와 그 범주만 드러내는 "왜"의 종류를 명시합니다. 이것으로 돌아올 결과를 예상하고, 범주가 비어 있을 때 공백을 설명하며, (정말로 명백히 무관한 드문 경우에만) 생략을 정당화합니다.

1. **소스 컨트롤 investigator**. Git 이력, PR용 `gh`, 코드 주석, 테스트. 항상 spawn합니다. 유일하게 보장된 소스입니다. 리뷰 중에 기록된 *구현 시점의 근거*를 찾는 데 가장 적합합니다.

2. **이슈 / 티켓 트래커 investigator**(예: Linear, Jira, GitHub Issues, Plane, Shortcut MCP). *제품이나 사업상의 강제 요인*을 드러내는 데 가장 적합합니다. 이유가 엔지니어링 바깥에 있을 때 가장 강합니다.

3. **장문 문서 investigator**(예: Notion, Confluence, Google Docs, Coda MCP). *장문의 설계 근거*를 드러내는 데 가장 적합합니다. 코드가 되기 전에 이유가 글로 적혀 있는 곳입니다.

4. **실시간 팀 채팅 investigator**(예: Slack, Discord, Microsoft Teams, Mattermost MCP). *문서로 남지 않은 실시간 논의*를 드러내는 데 가장 적합합니다. 소스 컨트롤, 티켓, 문서의 기록이 빈약할 때 특히 중요합니다.

5. **인프라 관측성 investigator**(예: Datadog, New Relic, Honeycomb, Grafana, Splunk MCP). 인프라와 런타임 관점입니다. *코드를 동기 부여한 인프라 및 런타임의 현실*을 드러내는 데 가장 적합합니다. 대상이 인프라 신호(타임아웃, 재시도, 레이트 리밋, 서킷 브레이커)에 반응할 때 가장 강합니다.

6. **에러 / 예외 추적 investigator**(예: Sentry, Rollbar, Bugsnag, Airbrake MCP). *방어적이거나 교정적인 코드를 동기 부여한 구체적인 예외와 에러 궤적*을 드러내는 데 가장 적합합니다. catch 블록, null 가드, 타입 검사, 재시도 등 방어 코드에 가장 강합니다.

7. **제품 분석 웨어하우스 investigator**(예: Databricks, Snowflake, BigQuery, ClickHouse, dbt, Redshift MCP). 제품과 데이터 관점입니다. *코드를 형성한 제품과 데이터의 현실*을 드러내는 데 가장 적합합니다. flag로 제어되는 코드, 실험 기반 출시, 데이터 마이그레이션, "이 숫자는 어디서 왔는가" 질문에 가장 강합니다.

### investigator를 생략할 때

생략하려면 최종 "Sources Consulted" 섹션에 들어갈 **명시적이고 문서화된 정당화**가 필요합니다. 유효한 이유는 두 가지뿐입니다.

- **이 환경에 해당 범주의 MCP가 없습니다**. 이것은 선택이 아니라 공백으로 표시합니다. 예: "실시간 팀 채팅은 생략됨. 일치하는 MCP가 없어 대화 기록을 검색할 수 없음."
- **소스가 명백하게 무관합니다**. "아마 무관할 것"이 아니라 *명백히* 무관해야 합니다. 기준이 높습니다. 예: "에러 / 예외 추적은 생략됨. 대상은 런타임 코드 경로가 없는 빌드 타임 스크립트임."

범위 평가에서 PR 설명이 완전한 답을 이미 담고 있는 단일 커밋의 사소한 대상이라고 보이면, **모든 일곱 개 범주 검색이 중복임을 확인한 뒤에만** 인라인으로 답할 수 있습니다. 이를 명시적으로 말해야 합니다. 드문 경우여야 합니다.

## 4단계. 종합 (Synthesize)

synthesizer subagent 하나를 spawn합니다.

- `subagent_type`: `generalPurpose`
- `model`: `why synthesizer` 줄의 값, 기본값 `claude-opus-5-5-max`
- `readonly`: `false`(agent 모드). synthesizer의 품질 점검은 인용을 교차 확인하는데, 이를 위해 MCP 접근이 필요할 수 있습니다. Readonly/Ask 모드는 MCP를 제거해 이를 무력화합니다.

synthesizer가 받는 것:
1. investigator의 결과. 빈 결과와 정당화와 함께 생략된 범주 포함
2. 2단계의 코드 앵커(파일 경로, 심볼, 커밋 해시, PR 번호, 티켓 ID)
3. 사용자의 원래 질문
4. `references/epistemics.md`의 인식론 프레임워크
5. `references/synthesizer-prompt.md`의 synthesizer 프롬프트 템플릿

## 5단계. 제시 (Present)

synthesizer의 결과를 가져와 사용자에게 보여줍니다. 명확하게 다듬거나 대화에서 얻은 맥락을 덧붙일 수 있지만, **신뢰도 표현을 다시 쓰지는 마십시오**.

## 출력 형식

출력 구조는 `references/synthesizer-prompt.md`에 있는 구조입니다. 질문, 코드의 대상, 발견한 내용, 합리적으로 추론할 수 있는 것, 경쟁 가설, 알 수 없는 것, 참고한 소스, 신뢰도 요약입니다. 필요에 따라 조정할 수 있지만, 신뢰도 구분은 유지해야 합니다. "Sources Consulted"는 investigator마다 한 줄씩 유지하고, 아무것도 반환하지 않았거나 생략된 항목도 이유와 함께 포함합니다.

Sources Consulted 블록 다음에, 사용자의 `why` 질문이 이 코드를 실제로 변경하기 위한 전 단계라면 이력 발견 사항을 변경 계획에 쓸 수 있는 Preserve / Change / Avoid / Risk 제약 세트로 변환합니다.

## 흔한 실패 모드

- **최신성 편향(Recency bias)**. 가장 최근 커밋이 권위 있다고 가정하는 것. 현재의 모양은 종종 이전의 많은 결정이 쌓인 결과입니다. 거슬러 올라가 추적하십시오.

## 참조 파일

- `references/epistemics.md`. 신뢰도 단계와 표현 가이드. synthesizer는 반드시 따라야 합니다.
- `references/investigator-prompt.md`. investigator subagent의 기본 프롬프트 템플릿.
- `references/source-playbook.md`. 아래의 범주 playbook을 가리키는 색인.
- `references/sources/*.md`. 범주마다 하나씩 있는 독립적인 예시 playbook과 공통 관점인 `incident-postmortem.md`. investigator에게는 자기 범주에 맞는 파일 하나만 주고, 사용 가능한 MCP에 맞게 조정하게 합니다.
- `references/synthesizer-prompt.md`. 출력 형식을 포함한 synthesizer subagent용 프롬프트 템플릿.
