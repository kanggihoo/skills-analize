---
name: principle-explain-the-number
description: "Apply before you trust, report, or act on a number you measured: a speedup, a regression, a throughput, a latency, or an eval result. Find what limits it, and rule out that it measured something other than the work you think."
disable-model-invocation: true
---

# 숫자를 설명하기

측정한 숫자는 시스템에 대한 주장이다. 그것을 믿고, 보고하고, 근거로 행동하기 전에, 무엇이 그 숫자를 제한하는지 찾고 그것이 내가 생각한 작업이 아닌 다른 무언가를 측정한 것이 아님을 배제하라.

**이유:** 잘못 돌아간 실행도 그럴듯한 숫자를 출력한다. 실패한 요청, 작업을 건너뛴 캐시, 실행되지 않은 코드, 기본값 그대로 둔 설정, 실행마다 생기는 노이즈는 모두 멀쩡해 보이는 결과를 낸다. 이 숫자가 왜 두 배가 아닌지 말할 수 없다면, 무엇을 측정했는지 모르는 것이다.

**패턴:**

- **"왜 두 배가 아닌가?"를 묻는다.** 결과를 제한하는 자원이나 코드 경로를 지목하라. 코어, 락, 디스크, 네트워크, 부하 생성기 자체처럼. 이는 프로파일이나 실행 중에 찍은 시스템 카운터에서 얻고, 그것을 소스 코드에 대응시켜라. 코드를 읽고 추측한 것은 제한 요인이 아니다.
- **그 숫자가 측정할 수 있는 다른 것들을 나열하고, 각각을 증거로 배제한다.** 흔한 용의자는 에러, 건너뛴 작업이나 캐시된 작업, 덜 튜닝된 쪽, 노이즈, 엔드투엔드에서는 영향이 너무 작은 부분이다.
- **증거를 숫자와 함께 보관한다.** 실행 횟수, 편차, 제한 요인을 노트나 연결된 산출물에 남겨, 독자가 주장을 검증할 수 있게 하라.

성능 수치라면 [benchmark-checklist](../benchmark-checklist/SKILL.md) 스킬로 전체 절차를 수행하라. 평가(eval) 결과라면 같은 질문을 시행들(trials)에 던져라. 모든 실행이 실제로 작업을 수행했는가? 차이가 여러 시행과 모델에 걸쳐 유지되는가? 시나리오가 중요한가?

다음과 같다면 이 점검을 건너뛴 것이다. 숫자의 근거에 실행 횟수, 편차, 명명된 제한 요인 중 하나라도 없을 때, 또는 절약된 시간이 변경된 부분에 든 시간보다 클 때.

이 원칙은 [Prove It Works](../principle-prove-it-works/SKILL.md)와 구별된다. 그쪽은 출력이 진짜인지 확인하고, 이 원칙은 측정된 숫자가 말하는 그대로를 의미하는지 확인한다.
