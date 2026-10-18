---
name: show-me-your-work
description: "Keep a reviewable decision trail for long-running or unattended work: a TSV log with one row per decision (what, why, evidence, result). Local by default; commit it when a reviewer needs the trail to trust the result. Use for /show-me-your-work, autonomous or multi-phase runs, or work a human reviews after stepping away."
disable-model-invocation: true
---

# Show me your work

정식 로그는 하나만 유지한다.

## 형식

결정 하나당 한 행인 단일 TSV 파일이다. 셀은 한 줄로 유지한다. 근거는 설명문이 아니라 가리키는 포인터다.

`references/decision-log-template.tsv`(헤더 행)를 복사해 깨끗한 로그를 시작한다. 열은 다음과 같다.

- **ts.** ISO8601 타임스탬프.
- **phase.** 단계 또는 작업 흐름.
- **decision.** 선택하거나 한 일, 한 줄.
- **why.** 평범한 말로 적은 이유. 어떤 원칙이 이끌었다면 전문 용어 태그가 아니라 평범하게 말한다.
- **evidence.** 증명하는 링크나 경로: 커밋 SHA, PR 번호, `file:line`, 또는 아티팩트, 트레이스, 스크린샷 경로. 문단은 절대 쓰지 않는다.
- **result.** 결과 또는 술어 상태: `tests green`, `reverted`, `pixel-diff 0`, `INCONCLUSIVE`, `open`.

예시. 리뷰어가 한눈에 읽을 수 있도록 평이하게 적었다.

```
ts	phase	decision	why	evidence	result
2026-05-24T09:02:00Z	frame	counted the work first, about 100 components and roughly 75 hours	wanted to know the size before starting a long run	commit 3a9f1c2	found 5 things to sort out before starting
2026-05-24T09:40:00Z	harness	took screenshots of the old version before changing anything	so we can compare old against new and catch any visual change	scripts/snapshot.sh, baseline/	saved 120 reference screenshots
2026-05-24T11:15:00Z	widget	moved the widget styles over without changing how it looks	keep the change small and the result identical	commit 7c21e0a, pixel-diff 0	looks identical, tests pass
2026-05-24T12:30:00Z	widget	threw out a helper's work because its screenshots were blank	checked the real files instead of trusting its summary	worktree reset	reverted, tightened the instructions for next time
```

## 행 기록하기

각 항목은 팀원에게 자신이 한 일을 말해 주듯 쓴다. 평범한 말, 구체적인 행동, AI 말투나 추상적인 전문 용어는 쓰지 않는다(**unslop** 스킬은 로그 텍스트에도 적용된다).

도우미 `scripts/log.sh <logfile> <phase> <decision> <why> <evidence> <result>`를 사용한다. 이 도우미는 `ts`를 찍고, 첫 사용 시 헤더를 쓰고, 흩어진 탭과 줄바꿈을 제거하며, `=`, `+`, `-`, `@`로 시작하는 셀 앞에 작은따옴표 하나를 붙인다. 행을 덧붙이는 단순한 `printf`도 작동하지만, 셀이 생성된 텍스트나 사용자가 제공한 텍스트에서 오는 경우 같은 바이트에 주의해야 한다.

모든 동작이 아니라 결정 지점과 체크포인트를 기록한다. 선택한 갈래, 검증 결과와 함께 끝난 단위, 트리거와 함께한 방향 전환이나 되돌림, 드러난 차단 요인, 고친 게이트가 여기에 해당한다. 루프 실행에서는 반복마다 한 행이다. 사소하거나 뻔한 것은 건너뛴다.

실행은 하나의 에이전트 대화이며, 이후 턴과 그 요약을 포함한다. 이어서 하는 작업, 대체 에이전트, 새 채팅은 새 실행을 시작한다. 실행이 이미 행이 있는 로그에 더해질 때, 그 실행의 첫 행은 phase `start`를 가진다. 다른 실행의 `start` 행 뒤에 오는 첫 행도 마찬가지다. 그래서 나중 턴에 로그로 돌아온 실행은 먼저 로그의 마지막 행들을 읽어, 그사이에 다른 실행이 기록했는지 확인한다. `start` 행은 이 실행이 기록하지 않은 앞선 행들의 `ts` 범위를 명시하고, 그 근거에는 이 실행을 가리키는 값(예: 에이전트 id)을 적는다. phase `start`는 다른 용도로 쓰지 않는다.

## 위치

기본적으로 로그는 커밋하지 않는 작업 아티팩트다. 작업 디렉터리의 `decisions.tsv`에 두며, 여러 작업이 동시에 진행될 때는 `.audit/<task-slug>.tsv`에 두고, git에서는 제외한다.

리뷰어가 결과를 신뢰하려면 추적 기록이 필요할 만큼 작업이 야심 찬 경우에만 커밋한다.

## 규칙

- 추가만 가능하다. 잘못된 판단은 그것을 대체하는 새 행으로 남긴다. 이력은 절대 수정하거나 삭제하지 않는다.
- 일회성 수작업 증거보다 커밋된 스크립트가 만든 증거를 선호한다(**encode-lessons-in-structure** 원칙 스킬).

## 로그를 트랜스크립트와 대조해 감사하기

실행이 끝나면 넘기기 전에, 로그가 사실을 말했는지 확인한다. 활성 워크스페이스의 `agent-transcripts/` 디렉터리 아래 이 실행의 트랜스크립트를 읽는다(경로는 시스템 프롬프트가 알려 준다). `~/.cursor/projects/*/` 전체를 glob하지 않는다. 그러면 관련 없는 비공개 채팅을 읽게 된다. 이 실행의 행을 실제로 일어난 일과 대조해 걸어간다. 각 구간은 이 실행의 `start` 행에서 시작하거나, 이 실행이 로그를 만들었다면 첫 행에서 시작하며, 다른 실행의 다음 `start` 행에서 끝난다.

- 모든 행이 실제 결정이나 행동에 대응하는지 확인한다.
- 각 행의 근거가 해석되고, 행이 주장하는 것을 보여 주는지 확인한다.
- 작업을 형성했지만 기록되지 않은 갈래, 방향 전환, 포기한 접근은 빠진 것이다. 추가한다.

이야기를 고치지 말고 로그를 고친다. 감사는 행을 편집하거나 제거하지 않는다. 지어낸 행이라도 마찬가지다. 행이 실제 결정도 실제 행동도 기록하지 않거나, 주장이나 근거가 틀렸다면, 실제로 일어난 일과 해석되는 포인터를 담은 대체 행을 추가한다. 이 감사는 이 실행의 구간 밖에 있는 행은 확인하지 않는다. 이 실행 자신의 작업이 그중 하나가 틀렸다고 보여 주면, 다른 잘못된 판단과 똑같이 대체한다.

## 추적 기록의 교차 모델 리뷰

넘기기 전에, 작업을 한 모델 계열과 다른 계열의 하위 에이전트를 띄운다. 자기 리뷰는 대체가 되지 않는다. 하위 에이전트는 감사 추적과 실행의 트랜스크립트를 읽고, 사용자가 주의해야 할 것을 표시한다. 작업을 다시 하는 것이 아니라, 최적이 아니거나 위험한 것이 없는지 훑는다.

- 근거가 약하거나 없는 상태로 기록된 결정
- 건너뛰었거나, 트랜스크립트에 증명 없이 주장만 된 검증 단계
- 돌이켜 보면 위험해 보이는 선택(성급함, 범위 확장, 증상을 덮어 버림)
- 대충 훑어서는 사용자가 놓칠 공백

추적 기록을 만든 실행의 모든 응답은 "Attention" 섹션으로 끝난다. 먼저 리뷰어의 모델을 별도 줄에 적고(`reviewed by <model>`), 특정 행이나 순간을 가리키는 각 표시를 나열한다. "No flags"도 유효한 값이다. 모델 이름만 적는 것은 유효하지 않다.

## 추적 기록 읽기

위에서 아래로 읽고, 근거 포인터를 따라가며, 표본을 확인한다. GitHub는 커밋된 TSV를 표로 렌더링한다. 터미널에서는 `column -s$'\t' -t decisions.tsv`로 볼 수 있다.

## 이 스킬 구성하기

다른 스킬들은 자체 감사 추적을 만드는 대신 여기로 추적을 보낸다. 이름으로 참조하고, 형식의 소유는 이 스킬에 맡긴다. 열을 다시 적지 않는다.
