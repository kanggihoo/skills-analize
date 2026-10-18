---
name: principle-migrate-callers-then-delete-legacy-apis
description: "Apply when introducing a new internal API while old callers still exist. Migrate callers and delete the old API in the same wave instead of preserving compatibility layers."
disable-model-invocation: true
---

# 호출자를 먼저 마이그레이션한 뒤 레거시 API 삭제

새 API가 올바른 설계라고 결정했다면, 호환성 레이어를 유지하는 대신 같은 리팩터링 웨이브에서 호출자를 마이그레이션하고 기존 API를 제거한다.

**규칙:**
- 내부 호출자가 아직 남아 있다는 이유만으로 레거시 API 경로를 유지하지 않는다
- 호출자를 파악하고 마이그레이션한 뒤 즉시 기존 API를 삭제한다
- 임시 어댑터는 예외적이고 기간이 정해진 것으로 취급하며, 기본 아키텍처로 삼지 않는다
- 테스트는 새 계약을 검증하도록 갱신하고, 리팩터링 이전의 구현 세부 사항만 보호하는 테스트는 삭제한다

**적용 상황:**
- 하위 호환성에 의존하는 외부 사용자가 없다
- 프로젝트가 조율된 호환성 깨짐 변경을 감당할 수 있다
- 새 API가 단순화 또는 리팩터링 작업의 일부다

기존 API와 새 API를 함께 유지하면 이중 경로 복잡성이 생기고, 정리 작업이 느려지며, 코드베이스가 계속 추가만 되는 구조처럼 느껴지게 된다.
