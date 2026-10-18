---
name: architect
description: "Sketch types, signatures, and module structure before code, then stay in the loop while implementation fills in. Use for /architect, 'architect this', 'design this', or non-trivial work where jumping to code would lock in the wrong shape."
disable-model-invocation: true
---

# Architect

코드를 쓰기 전에 설계한다. `not implemented` 본문과 의사코드를 곁들여 타입, 함수 시그니처, 클래스 형태, 모듈 경계를 스케치한다. 여러 모델 관점을 종합한 뒤, 선택한 스케치에 맞춰 코드를 채운다. 구현 과정에서 스케치가 잘못되었다는 것이 드러나면 버리고 다시 설계한다.

## 시작

시작하기 전에 단계마다 항목 하나씩 todolist를 연다.

1. Ground
2. Sketch
3. Agree
4. Implement
5. Scrap

## Phase A: 문제 근거 확보 (Ground the problem)

새 코드가 건드리는 모든 시스템에 대해 실제 머릿속 모델을 만든다. 관련 하위 시스템에 **how** 스킬을 실행한다.

파일 이름을 언급하는 것만으로는 근거를 확보한 것이 아니다. `how`가 요구하는 추적된 모델을 만들어라. 설계가 소유권이나 계층 구조를 재정의한다면, 기존 구조에 **why** 스킬도 실행해서 그 근거가 추측이 아니라 제약 조건이 되도록 하라.

Phase A는 주변에 통합할 시스템이 없는 완전한 신규 작업일 때만 건너뛴다.

## Phase B: 스케치 (Sketch)

Phase A의 근거 산출물과 설계 스케치 과제를 가지고 **arena** 스킬을 실행한다. 각 러너의 프롬프트로 `references/runner-prompt.md`를 넘긴다. 각 후보는 `references/rationale-template.md`에 맞춘 설계 패키지를 만든다.

러너는 `pstack-models.mdc` 규칙의 `architect runners` 줄에서 가져오며, `arena runners` 줄 대신 쓴다. 규칙이나 그 줄이 없으면 `claude-opus-5-5-max`, `gpt-5.6-sol-max`, `grok-4.7-xhigh-fast`를 쓴다. 별칭과 거부된 항목은 **arena** 스킬 Phase A의 러너 규칙을 따른다.

설계는 두 번 생각한다. 첫 번째 안이 충분해 보여도, 종합 전에 구조적으로 서로 다른 후보를 최소 두 개 요구한다. 이것은 **exhaust-the-design-space** 원칙 스킬을 구체화한 것이다. 한 구조 안의 국소적 수정이 아니라 전체 형태가 다른 대안이어야 한다.

종합 전에 모든 후보를 [`references/design-red-flags.md`](references/design-red-flags.md)에 비추어 점검한다. 다음 기여자는 자신이 연 파일만 보고, 가장 가까운 예제를 복사하며, 컴파일만 되는 가장 짧은 경로를 택하는 에이전트라고 가정하라. 한 파일에서 보기에 옳은 변경이 저장소 전체에서도 옳은 설계를 선호하라.

실행 가능한 후보들은 인터페이스 깊이로 비교한다. 더 작고 단순한 공개 표면 뒤에 더 많은 복잡성을 숨기는 설계를 선호한다. 풍부한 인터페이스는 기능을 여러 계층에 흩뿌리지 않고 한곳에 모아 호출 체인을 짧게 유지할 수 있다.

Arena는 종합된 설계 패키지 하나를 반환한다. 종합 결정은 근거 문서의 "Synthesis decision" 절을 채운다.

## Phase C: 합의 (Agree, 선택 사항)

기본값: 종합된 설계로 바로 구현에 들어간다. 사람의 확인 단계는 없다.

요청자가 명시적으로 요청할 때만 확인 단계를 연다. 예를 들어 "/architect with checkpoint", "구현하기 전에 멈추고 먼저 보여줘" 같은 경우다. 그러면 종합된 설계를 보여주고 승인을 받을 때까지 멈춘다.

종합 결과는 어느 쪽이든 별도 커밋으로 낼 수 있다. 이것은 **foundational-thinking** 원칙 스킬의 "scaffold first" 방식이다. 채워 넣는 과정에서 계획된 범위 내의 깨짐은 **outcome-oriented-execution** 원칙 스킬에 따라 괜찮다. 구현 전에 설계에 적대적 검토가 필요하면 종합된 스케치에 **interrogate** 스킬을 실행한다.

사람이 형태에 이의를 제기하면(확인 단계에서든 사후에서든) 그것을 Phase A의 근거로 본다. 코드를 더 쓰기 전에 근거를 다시 확보하고 Phase B를 다시 실행한다.

## Phase D: 스케치에 맞춰 구현 (Implement against the sketch)

`not implemented` 본문을 코드로, 의사코드를 로직으로 바꾼다. 종합된 스케치가 계약이다.

스케치에서 벗어난 부분은 조용히 흡수하지 말고 드러내야 할 신호다. 함수가 스케치가 예상하지 못한 매개변수를 필요로 하면, 스케치가 틀렸는지, 요구사항을 놓쳤는지, 구현이 범위를 넘었는지 묻는다.

## Phase E: 아키텍처가 틀렸을 때 폐기 (Scrap)

구현이 계속 마찰을 일으키고 스케치가 그것을 흡수하지 못하면 스케치를 버린다. **redesign-from-first-principles**와 **fix-root-causes** 원칙 스킬에 따라, 잘못된 설계에 수정을 덧붙이지 않는다.

신호는 개별 사례가 아니라 *패턴*이다. 징후는 다음과 같다.

- 서로 무관한 코드 전반에 같은 모양의 우회 코드가 반복해서 나타남.
- 서로 무관한 여러 엣지 케이스가 모두 특수 분기를 필요로 함.
- 컴파일하려면 타입에 탈출구(`any`, 캐스트, 실제로는 항상 설정되는 선택적 필드)가 필요함.
- 스케치는 상태가 공유되지 않는다고 했는데 "락이 필요하다"는 반사적 생각이 듦.
- 호출자가 추상화를 쓰기 위해 내부 규칙을 알아야 함.
- 구현 전반에서 같은 모양의 독립적인 Phase D 편차가 둘 이상 나타남.

판단을 사용하라. 몇 개의 엣지 케이스만으로 아키텍처가 잘못되었다고 단정하지 않는다. 어떤 문제는 본질적으로 복잡하다. 데이터의 복잡성이 설계의 복잡성은 아니다.

폐기할 때는 다음과 같이 한다.

1. 지금까지 만든 것에 대해 **how** 스킬을 다시 실행한다.
2. 새 제약이 처음부터 전제였던 것처럼 redesign-from-first-principles에 따라 재설계한다.
3. **subtract-before-you-add** 원칙 스킬에 따라 더하기 전에 덜어낸다. 새 스케치는 커지기 전에 이전 것보다 작아야 한다.
4. Phase B로 돌아가 arena를 다시 실행한다.

## 산출물

호출자의 사용법을 먼저 쓰고, 거기서 타입 스케치를 도출한다. 작은 변경은 새 타입과 시그니처를 담은 파일 하나로 충분하다. 더 큰 작업은 모듈 맵과 타입 정의를 낸다. 근거 문서를 함께 제공하며, `references/rationale-template.md` 형식을 따르고 사용 스케치와 종합 결정을 포함한다.
