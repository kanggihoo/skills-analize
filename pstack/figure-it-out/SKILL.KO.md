---
name: figure-it-out
description: "Design an auditable playbook when no narrower one fits: a large migration, an ambitious multi-part change, or work a human reviews after stepping away. Scales rigor to the task, runs a hypothesis loop, and logs decisions via show-me-your-work. Use for /figure-it-out, 'figure it out', a large migration, or when no narrower playbook applies."
disable-model-invocation: true
---

# Figure it out

작업에 맞는 플레이북이 없다면 직접 설계합니다. 코드를 작성하기 전에 가장 먼저 만들어야 할 결과물은 워크플로 자체입니다. 작업 규모에 맞게 엄격함을 조절하고, 과학적 방법을 따르며, 사람이 자리를 비운 뒤에도 감사할 수 있는 결정 기록을 남기는 단계들의 순서입니다.

## Start

첫 번째 항목이 **poteto-mode** 스킬의 Principles 섹션을 읽는 것인 할 일 목록을 여세요. 그 다음 아래 단계를 할 일로 추가하세요.

## Phase A: Frame

먼저 근거를 확보하고, 그다음 결정하세요. 다음 내용을 명확히 말할 수 있을 때까지 실행을 시작하지 마세요.

- 완료의 정의를 반증 가능한 술어로 적으세요(**prove-it-works** 원칙 스킬).
- 범위를 수치화하세요. 대략적인 단위와 노력, 그리고 근거 조사에서 드러난 블로커를 포함합니다.
- 엄격함 수준을 높게 잡으세요. 되돌릴 수 없는 결정과 영향 범위가 큰 변경에는 더 엄격하게, 되돌리기 쉬운 저위험 단계에는 덜 엄격하게 적용합니다. 엄격함은 "더 열심히 해 보기"가 아니라 게이트와 산출물로 구현합니다.

긴 실행에 들어가기 전에 프레이밍과 트레이드오프를 제시하세요. 되돌릴 수 있는 작업은 바로 진행하되(**never-block-on-the-human** 원칙 스킬), 여러 시간이 걸리는 실행이라면 체크포인트 하나를 둘 가치가 있습니다.

## Phase B: Design the workflow

작업을 원자적이고 독립적으로 머지 가능한 단위로 나누세요. 가장 위험하고 알 수 없는 부분을 먼저 배치하세요. 기능보다 scaffold와 검증을 먼저 둡니다(**foundational-thinking** 원칙 스킬).

- 작업 전에 검증 하네스를 먼저 만들고, 변경 전 상태에서 기준선을 캡처하세요. 그래야 검사가 "이전 값 대 새 값"으로 읽힙니다.
- 되돌릴 수 없는 설계 결정에는 **architect** 스킬을 실행하세요(이 스킬은 **arena**를 실행합니다). 형태가 이미 구체적으로 정해진 기계적 작업이라면 건너뛰세요. 이미 정해진 설계에 두 번째 arena를 돌리는 것은 과설계입니다(**laziness-protocol** 원칙 스킬).
- 무엇을 병렬로 펼칠지 정하세요. 병렬화는 독립된 경계가 있는 곳에서만 하고, 각 작업자에게 자신만의 worktree나 브랜치를 주세요(**separate-before-serializing-shared-state** 원칙 스킬). 과하게 펼치지 마세요.
- 설계된 단계 목록을 적어 두세요. 사람이 검토하는 대상이 바로 이 목록입니다.

그 다음 설계를 실행하세요. 설계의 각 단계를 Phase C 항목 뒤, Phase D 앞에 구체적인 할 일로 추가하세요. 각 단계는 Phase C의 루프 규율에 따라 실행하고, Phase D 기록은 단계 사이사이에 엮어 넣으세요. 단계가 끝날 때마다 한 행씩 쓰고, 전체 기록을 마지막에 몰아서 쓰지 마세요.

## Phase C: Run the loop

각 단위는 실험입니다. 가설을 세우고, 가장 작은 변경을 만들고, 실제 산출물에 대해 술어로 측정하세요. 진전이 있었다면 유지하고, 없었다면 되돌립니다.
**sequence-verifiable-units** 원칙 스킬을 적용해, 검사를 마지막에 몰아서 하지 않고 각 단위를 검증한 뒤 다음 단위로 넘어가세요.

- 자기 보고가 아니라 산출물을 직접 확인해서 검증하세요. 무언가가 너무 쉽게 통과한다면, 시스템보다 먼저 관찰 방법을 의심하세요.
- 위임한 작업에는 판정자(judge)를 붙이세요. 작업자가 게이트를 속이면 초기화하고 계약을 더 엄격하게 만드세요. 게이트 자체가 잘못되었다면, 우회하지 말고 게이트를 별도의 변경으로 고치세요.
- 판정은 VERIFIED, NOT VERIFIED, INCONCLUSIVE 중 하나입니다. INCONCLUSIVE는 통과가 아닙니다. 부정적인 결과를 숨기지 마세요.

## Phase D: Keep the audit trail

**show-me-your-work** 스킬로 실행 과정을 기록하세요. figure-it-out 작업은 보통 PR에서 리뷰어가 읽을 수 있도록 기록을 커밋할 만큼 규모가 큽니다. 기록과 diff가 함께 있어야 사람이 돌아와서 작업을 신뢰할 수 있습니다.

## Phase E: Verify and hand back

전체 결과를 harness가 아니라 실제 제품에서 Phase A의 술어와 대조해 확인하세요. 반복되는 수정 사항은 게이트, 린트 규칙, 검사, 스크립트 중 하나로 인코딩하세요(**encode-lessons-in-structure** 원칙 스킬).

**Reply:** 설계한 플레이북, 엄격함 수준과 그 이유, 결정 기록의 경로, 술어에 대해 검증된 내용, 아직 열려 있는 내용을 보고하세요.
