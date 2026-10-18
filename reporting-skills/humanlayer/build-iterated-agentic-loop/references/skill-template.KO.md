---
name: <skill-name>
description: <task>을 <trigger>일 때 <leading verb>하고; <wrong source> 대신 <source of truth>를 사용
---

# <Skill Title>

<the user or workflow asks for the repeatable agent task>할 때 이 스킬을 사용합니다.

목표는 <one-sentence invariant the agent should preserve>를 지키는 것입니다.

## 핵심 요건

- <라이브 원천(source of truth)을 식별하는 규칙.>
- <결정을 좌우하면 안 되는 입력을 명시하는 규칙.>
- <변경을 리뷰 가능한 상태로 유지하는 규칙.>
- <검증 기준을 정의하는 규칙.>

## 워크플로

### 1. 대상 찾기

<How to identify candidate files/components/issues.>

완료 기준: <observable condition that proves the target was selected correctly>.

### 2. 원천 검사

<What to read before editing.>

완료 기준: <observable condition that proves the agent did enough legwork>.

### 3. 가장 작은 안전한 변경 만들기

<How to edit without broadening scope. Include multiple steps / workflow if necessary.>

완료 기준: <observable condition that proves the change matches the source of truth>.

### 4. 검증

가장 좁은 관련 검증을 먼저 실행한 뒤, 저장소에서 요구하는 품질 게이트를 실행합니다.

완료 기준: 검증이 통과하거나, 최종 보고서에 정확한 장애 요인이 명시되어 있어야 합니다.

### 5. 응답 형식화

CI 에이전트로 실행 중이라면, 최종 응답을 `references/response-template.md`에 따라 형식화합니다. 이 응답이 PR 본문이 됩니다.

완료 기준: 응답이 템플릿 구조를 따르고 리뷰어에게 필요한 모든 정보를 포함해야 합니다.

## 리뷰 체크리스트

- 편집 전에 원천을 검사했다.
- 변경이 지원 코드 전용 상태를 실제 동작으로 인코딩하지 않는다.
- diff가 리뷰하기에 충분히 작다.
- 검증 명령이 통과했거나, 장애 요인이 문서화되어 있다.
- 최종 응답이 응답 템플릿을 따른다.
