---
name: principle-make-operations-idempotent
description: "Apply when designing commands, lifecycle steps, or processing loops that run amid crashes, restarts, and retries. Converge to the same end state regardless of partial prior runs."
disable-model-invocation: true
---

# 연산을 멱등하게 만들기

연산이 몇 번 실행되든, 어디서 시작하든 올바른 상태로 수렴하도록 설계하라. 상태를 바꾸는 모든 연산은 이렇게 물어야 한다. "이것이 두 번 실행되면 어떻게 되는가? 이전 실행이 중간에 크래시했다면 어떻게 되는가?"

**이유:** 명령, 생명주기 연산, 처리 루프는 크래시, 재시작, 재시도가 일상적인 곳에서 돌아간다. 부분적인 상태가 다음 실행의 결과를 바꾼다면, 재시작마다 디버깅 세션이 된다.

**패턴:**
- 수렴하는 시작: 기존 상태를 스캔하고, 오래된 산출물을 정리하고, 살아 있는 세션을 입양한다
- 내용 기반 정리: 생성 순서가 아니라 내용의 동등성으로 비교한다
- 자가 치유 락: PID 기반의 오래된 락 감지를 사용한다
- 멱등한 스케줄링: 실패한 작업은 깔끔하게 다시 생성되고, 새 입력은 매 사이클 후 재생성된다

**테스트:**
1. 이것이 연달아 두 번 실행되면 어떻게 되는가?
2. 이전 실행이 가능한 모든 지점에서 크래시했다면 어떻게 되는가?
3. 재실행이 같은 최종 상태로 수렴하는가?

어떤 답이든 "남겨진 상태에 따라 다르다"라면, 그 연산에는 조정(reconciliation) 단계가 필요하다.
