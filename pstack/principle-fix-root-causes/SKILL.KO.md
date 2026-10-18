---
name: principle-fix-root-causes
description: "Apply when debugging. Trace each symptom to its root cause and fix it there; reproduce first, ask why until you reach it, resist nil-check guards that silence crashes."
disable-model-invocation: true
---

# 근본 원인 고치기

디버깅할 때 증상을 고치지 마라. 모든 문제를 근본 원인까지 추적하고, 거기서 고쳐라.

**이유:** 증상에 대한 수정은 쌓인다. 우회책 하나하나가 시스템을 이해하기 어렵게 만들고, 진짜 버그는 그대로 남는다. 근본 원인을 고치는 것은 처음엔 느리지만 전체 디버깅 시간을 줄인다.

**패턴:**
- 먼저 재현한다
- 근본 원인에 닿을 때까지 "왜"를 묻는다
- 가드를 추가하지 마라 (크래시를 조용히 만들려고 nil 검사를 추가하는 것은 증상 수정이다)
- 우회책을 정당화하는 데 문단 길이의 주석이 필요하다면, 코드가 잘못된 것이다 (주석이 아니라 코드를 고쳐라)
- 패턴을 확인하라, 인스턴스만 보지 말고 (같은 패턴을 grep해서 모든 인스턴스를 고쳐라)
- 막히면 계측하라. 추측하지 마라 (로깅을 추가하고, 실제 에러를 읽어라)

**재시작 버그: 코드보다 상태를 먼저 의심하라**

무언가가 "재시작 후 실패한다"면, 먼저 오래된 영속 상태를 의심하라. 설정 파일, 캐시, 락 파일, 직렬화된 상태 등이다. 상태 파일을 지우자 동작이 복구된다면, 수정으로 상태 검증을 우선하라.
