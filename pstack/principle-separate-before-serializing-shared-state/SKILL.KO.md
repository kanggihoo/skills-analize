---
name: principle-separate-before-serializing-shared-state
description: "Apply when concurrent actors might write to the same file, branch, key, or state object. Eliminate the sharing first; serialize structurally only when one shared writer is a real invariant."
disable-model-invocation: true
---

# 공유 상태를 직렬화하기 전에 먼저 분리하라

동시에 실행되는 주체들이 변경 가능한 상태를 공유할 수 있을 때, 먼저 그들이 정말 같은 변경 가능한 객체를 필요로 하는지 묻는다. 필요하지 않다면 공유를 없앤다. 공유가 실제로 필요하다면, 직렬화를 구조적으로 강제한다: 락파일, 순차 단계, 배타적 소유권. 지침과 관례는 동시성 제어가 아니다.

**이유:** 공유 상태에 대한 동시 쓰기는 간헐적이고 재현하기 어려우며 디버깅 비용이 큰 경쟁 조건을 만든다.

**패턴:**
1. **공유된 변경 가능 상태를 식별한다**(둘 다 읽고 쓰는 파일, 둘 다 push하는 브랜치, 정의하고 소비하는 둘 다의 API).
2. **기본값: 공유된 쓰기 대상을 없앤다.** 질문한다: 이 주체들이 하나의 정규(canonical) 객체를 필요로 하는가, 아니면 독립적인 사실을 발행하는가? 각 주체에게 자신만의 소유 파일, 키, 브랜치, 또는 상태 디렉터리를 주고, 읽기/보고 경계에서만 병합한다. 두 워커가 하나의 `state.json`에 각자의 `lastX` 필드를 쓰는 것은 여전히 공유 변경이다. `indexer-state.json` + `metrics-state.json`은 그렇지 않다.
3. **하나의 공유 쓰기 대상이 실제 불변식일 때만, 구조적으로 접근을 직렬화한다**(락파일, 순차 단계, 단일 쓰기 액터, 또는 원자적 compare-and-swap). "락이 필요하다"는 기본 답이 아니라, 확인해야 할 설계 냄새로 취급한다.
