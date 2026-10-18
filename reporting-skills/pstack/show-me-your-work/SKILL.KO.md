---
name: show-me-your-work
description: "오래 걸리거나 사람이 지켜보지 않는 작업을 위해 검토 가능한 결정 기록을 남긴다. 결정 한 건당 한 행인 TSV 로그(무엇, 왜, 근거, 결과)를 쓴다. 기본은 로컬에 두고, 검토자가 결과를 믿으려면 기록이 필요할 때 커밋한다. /show-me-your-work, 자율 실행 또는 여러 단계 실행, 사람이 자리를 비운 뒤 검토하는 작업에 사용한다."
disable-model-invocation: true
---

# 작업 내역을 보여 주라

정식 로그는 하나만 유지한다.

## 형식

TSV 파일 하나에 결정 한 건당 한 행을 쓴다. 셀은 한 줄로 유지한다. 근거는 설명문이 아니라 가리키는 경로다.

`references/decision-log-template.tsv`의 헤더 행을 복사해 깨끗한 로그를 시작한다. 열은 다음과 같다.

- **ts.** ISO8601 타임스탬프.
- **phase.** 단계 또는 작업 흐름.
- **decision.** 선택하거나 수행한 내용을 한 줄로.
- **why.** 이유를 평이한 말로. 어떤 원칙이 결정에 영향을 줬다면 전문 용어 태그가 아니라 평이하게 말한다.
- **evidence.** 이를 증명하는 링크 또는 경로. 커밋 SHA, PR 번호, `file:line`, 또는 산출물, 트레이스, 스크린샷 경로. 문단으로 쓰지 않는다.
- **result.** 결과 또는 조건의 상태: `tests green`, `reverted`, `pixel-diff 0`, `INCONCLUSIVE`, `open`.

검토자가 한눈에 읽을 수 있도록 평이하게 쓴 예시다.

```
ts	phase	decision	why	evidence	result
2026-05-24T09:02:00Z	frame	counted the work first, about 100 components and roughly 75 hours	wanted to know the size before starting a long run	commit 3a9f1c2	found 5 things to sort out before starting
2026-05-24T09:40:00Z	harness	took screenshots of the old version before changing anything	so we can compare old against new and catch any visual change	scripts/snapshot.sh, baseline/	saved 120 reference screenshots
2026-05-24T11:15:00Z	widget	moved the widget styles over without changing how it looks	keep the change small and the result identical	commit 7c21e0a, pixel-diff 0	looks identical, tests pass
2026-05-24T12:30:00Z	widget	threw out a helper's work because its screenshots were blank	checked the real files instead of trusting its summary	worktree reset	reverted, tightened the instructions for next time
```

## 행 기록하기

각 항목은 동료에게 무엇을 했는지 설명하듯 쓴다. 평이한 말, 구체적인 행동으로 쓰고, AI 특유의 말투나 추상적인 전문 용어는 쓰지 않는다(**unslop** 스킬은 로그 텍스트에도 적용한다).

`scripts/log.sh <logfile> <phase> <decision> <why> <evidence> <result>` 도우미를 사용한다. 이 스크립트는 `ts`를 찍고, 처음 사용할 때 헤더를 쓰고, 잘못 들어간 탭과 줄바꿈을 제거하며, `=`, `+`, `-`, `@`로 시작하는 셀 앞에 작은따옴표를 붙인다. 행을 덧붙이는 단순한 `printf`도 가능하지만, 셀 내용이 생성되었거나 사용자가 입력한 텍스트라면 같은 바이트 문제를 고려해야 한다.

모든 행동이 아니라 결정 지점과 체크포인트를 기록한다. 선택한 분기, 검증 결과와 함께 완료한 단위, 원인과 함께 한 방향 전환이나 되돌리기, 드러난 차단 요소, 고친 게이트가 해당한다. 반복 실행에서는 반복마다 한 행을 쓴다. 사소하고 자명한 내용은 건너뛴다.

실행 한 번은 하나의 에이전트 대화이며, 이후 턴과 그 요약을 포함한다. 인수인계, 에이전트 교체, 새 채팅은 새 실행을 시작한다. 실행이 이미 행이 있는 로그에 추가할 때, 그 실행의 첫 행은 phase가 `start`이고, 다른 실행의 `start` 행 뒤에 오는 첫 행도 `start`다. 따라서 나중 턴에서 로그로 돌아온 실행은 먼저 로그의 마지막 행들을 읽어 그 사이에 다른 실행이 기록했는지 확인한다. `start` 행은 이 실행이 기록하지 않은 앞선 행들의 `ts` 범위를 밝히고, evidence에는 에이전트 id 같은 이 실행을 가리키는 정보를 쓴다. `start`는 다른 용도로 쓰지 않는다.

## 저장 위치

기본적으로 로그는 커밋하지 않는 작업 산출물이다. 작업 디렉터리의 `decisions.tsv`에 두거나, 여러 작업이 동시에 돌 때는 `.audit/<task-slug>.tsv`에 두고, git에서는 제외한다.

검토자가 결과를 믿으려면 기록이 필요할 만큼 작업이 야심 찬 경우에만 커밋한다.

## 규칙

- 추가 전용이다. 잘못된 판단은 그것을 대체하는 새 행으로 바로잡는다. 기록을 수정하거나 삭제하지 않는다.
- 임시로 만든 일회성 증거보다 커밋된 스크립트가 만든 증거를 우선한다(**encode-lessons-in-structure** 원칙 스킬 참고).

## 로그를 대화 기록과 대조해 감사하기

실행이 끝나고 결과를 넘기기 전에, 로그가 사실을 말하고 있는지 확인한다. 활성 작업 공간의 `agent-transcripts/` 디렉터리 아래에서 이 실행의 대화 기록을 읽는다(경로는 시스템 프롬프트에 나와 있다). `~/.cursor/projects/*/` 전체를 glob으로 찾지 않는다. 그렇게 하면 관련 없는 개인 대화를 읽게 된다. 이 실행의 행을 실제로 일어난 일과 대조해 하나씩 확인한다. 각 구간은 이 실행의 `start` 행에서 시작하거나, 이 실행이 로그를 만들었다면 첫 행에서 시작하며, 다른 실행의 다음 `start` 행에서 끝난다.

- 모든 행이 실제 결정이나 행동에 대응하는지 확인한다.
- 각 행의 근거가 실제로 확인되고, 행이 주장하는 내용을 보여 주는지 확인한다.
- 작업 모양을 바꾼 분기, 방향 전환, 포기한 접근 방식이 기록되지 않았다면 빠진 것이다. 추가한다.

이야기를 고치지 말고 로그를 고친다. 감사는 행을 수정하거나 제거하지 않는다. 지어낸 행이라도 마찬가지다. 행이 실제 결정도 실제 행동도 기록하지 않거나, 주장이나 근거가 틀렸다면, 실제로 일어난 일과 실제로 확인되는 포인터를 담은 대체 행을 추가한다. 이 감사는 이 실행 구간 밖의 행은 확인하지 않는다. 그러나 이 실행의 작업으로 그런 행 중 하나가 틀렸다는 것이 드러나면, 다른 잘못된 판단과 마찬가지로 대체 행을 추가한다.

## 기록에 대한 교차 모델 검토

결과를 넘기기 전에, 작업을 한 모델 계열과 다른 모델 계열의 서브에이전트를 띄운다. 자기 검토는 대체가 되지 않는다. 서브에이전트는 감사 기록과 실행 대화 기록을 읽고, 사용자가 주의해야 할 점을 표시한다. 작업을 다시 하는 것이 아니라, 최적이 아니거나 위험한 부분을 훑는다.

- 근거가 약하거나 없는 상태로 기록된 결정
- 건너뛰었거나 대화 기록에 증거 없이 확인했다고 주장한 검증 단계
- 돌이켜 보면 위험해 보이는 선택(성급함, 범위 확장, 증상 덮기)
- 대충 읽으면 사용자가 놓칠 빈틈

기록을 남긴 실행의 모든 응답은 "Attention" 섹션으로 끝난다. 첫 줄에 검토한 모델을 `reviewed by <model>` 형식으로 따로 쓴 뒤, 각 표시를 특정 행이나 순간을 가리키며 나열한다. "No flags"도 유효한 값이다. 모델 이름만 적는 것은 유효하지 않다.

## 기록 검토하기

위에서 아래로 읽고, 근거 포인터를 따라가며, 일부를 샘플로 확인한다. GitHub는 커밋된 TSV를 표로 보여 준다. 터미널에서는 `column -s$'\t' -t decisions.tsv`로 볼 수 있다.

## 이 스킬 조합하기

다른 스킬은 자체 감사 기록을 새로 만드는 대신 여기로 보낸다. 이름으로 참조하고, 형식은 이 스킬이 소유하게 한다. 열 구성을 다시 적지 않는다.
