# doc-coauthoring 분석

## 원본

- 원본 경로: `.agents/skills/doc-coauthoring/`
- 핵심 파일: `SKILL.md`
- 확인한 규모: 1개 파일, 약 376줄
- 성격: 사용자를 문서 공동작성 workflow로 안내하는 프로세스 스킬

## 적용 조건

사용자가 문서, proposal, technical spec, decision doc, PRD, RFC, design doc, write-up 등 구조화된 글쓰기를 시작할 때 사용한다.

이 스킬은 바로 문서를 써 주는 것보다, context gathering, refinement, reader testing을 단계적으로 수행해 독자가 실제로 이해할 수 있는 문서를 만드는 데 초점을 둔다.

## 동작 과정

1. 먼저 structured workflow를 제안한다.
   사용자가 원하면 3단계 workflow를 따르고, 거절하면 freeform으로 작업한다.

2. Stage 1: Context Gathering
   문서 종류, primary audience, desired impact, template, constraint를 묻는다.
   이후 사용자가 가진 배경, 토론, 관련 문서, 대안, 조직 맥락, 일정 압박, technical architecture, stakeholder concern을 자유롭게 dump하게 한다.

3. context gap을 줄이기 위해 5-10개 clarification question을 만든다.
   질문은 기본을 다시 묻는 수준이 아니라 edge case와 trade-off를 다룰 수 있을 정도로 맥락을 확보하는 데 목적이 있다.

4. Stage 2: Refinement & Structure
   문서 구조를 정하고 placeholder가 있는 scaffold를 만든다.
   artifact가 가능하면 artifact를 만들고, 아니면 working directory에 Markdown 파일을 만든다.

5. 각 section별로 질문, brainstorm, curation, gap check, drafting, iterative refinement를 반복한다.
   사용자가 “keep/remove/combine” 방식으로 선택하면 그 우선순위를 반영한다.

6. section draft는 전체 문서를 다시 출력하지 않고 placeholder를 `str_replace`하는 방식으로 바꾼다.

7. 문서가 80% 이상 완성되면 전체를 다시 읽고 flow, consistency, redundancy, contradiction, generic filler를 점검한다.

8. Stage 3: Reader Testing
   fresh Claude 또는 수동 테스트를 통해 독자가 실제로 문서만 보고 질문에 답할 수 있는지 검증한다.

9. testing에서 나온 gap은 다시 refinement loop로 돌아가 고친다.

## 핵심 규칙

- 문서 작성은 context gathering 없이 바로 시작하지 않는다.
- 사용자가 workflow를 거부하면 강제하지 않는다.
- section별로 작은 단위로 작성하고 수정한다.
- artifact나 파일에는 draft 본문만 넣고 brainstorming list는 대화에서 처리한다.
- 독자 테스트가 통과해야 “문서가 작동한다”고 본다.
- 최종적으로 사용자가 직접 fact, link, technical detail을 검토해야 한다고 안내한다.

## 산출물 특성

- 구조화된 Markdown 또는 artifact 문서
- section별로 refinement된 proposal/spec/decision doc
- reader questions와 reader testing 결과
- 독자가 오해할 수 있는 gap을 줄인 최종 문서

## 주의점

- 이 스킬은 빠르게 초안을 던지는 스킬이 아니라 공동작성 workflow다.
- 문서 직접 편집보다 사용자의 피드백을 받아 스타일과 우선순위를 학습하는 것이 중요하다.
- subagent가 없으면 Reader Testing은 사용자가 fresh Claude 대화에서 수동으로 수행하도록 안내한다.
