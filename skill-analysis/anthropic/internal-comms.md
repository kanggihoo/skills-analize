# internal-comms 분석

## 원본

- 원본 경로: `.agents/skills/internal-comms/`
- 핵심 파일: `SKILL.md`
- 보조 파일: `examples/3p-updates.md`, `examples/company-newsletter.md`, `examples/faq-answers.md`, `examples/general-comms.md`
- 확인한 규모: 6개 파일, 약 394줄
- 성격: 회사 내부 커뮤니케이션 형식별 작성 규칙을 불러와 적용하는 문서 작성 스킬

## 적용 조건

사용자가 3P update, company newsletter, FAQ response, status report, leadership update, project update, incident report 등 internal communication을 요청할 때 사용한다.

## 동작 과정

1. 요청에서 communication type을 식별한다.

2. 유형에 맞는 guideline file을 `examples/`에서 읽는다.
   3P는 `3p-updates.md`, newsletter는 `company-newsletter.md`, FAQ는 `faq-answers.md`, 나머지는 `general-comms.md`를 사용한다.

3. 필요한 context source를 찾는다.
   Slack, email, calendar, Google Drive 같은 회사 도구 접근이 가능하면 중요한 announcement, reaction 많은 message, leadership update, relevant document를 참고한다.

4. 도구 접근이 없으면 사용자에게 포함할 내용을 요청한다.

5. guideline에 맞는 tone, format, length, section을 적용해 작성한다.

## 예시 파일별 동작

- `3p-updates.md`: Progress, Plans, Problems 세 섹션을 30-60초 내 읽을 수 있게 작성한다. team name과 period를 먼저 확인한다.
- `company-newsletter.md`: 전사 뉴스레터를 20-25개 bullet 정도로 구성한다. company-wide impact, leadership announcement, major milestone을 우선한다.
- `faq-answers.md`: 회사 전체에서 반복되는 질문을 찾아 1문장 질문과 1-2문장 답변으로 정리한다.
- `general-comms.md`: 표준 형식에 맞지 않는 comms에 대해 audience, purpose, tone, formatting requirement를 먼저 묻는다.

## 핵심 규칙

- 먼저 internal comms 유형을 분류한다.
- 유형별 guideline file을 읽고 그대로 형식을 따른다.
- 3P는 엄격히 `Progress`, `Plans`, `Problems` 형식이다.
- newsletter는 전사 영향도 높은 내용을 짧은 bullet로 묶는다.
- FAQ는 공식 source 기반으로 답하고 불확실성은 표시한다.
- general comms는 대상, 목적, 톤, 형식을 확인한 뒤 작성한다.

## 산출물 특성

- 3P update
- company newsletter
- FAQ answer set
- status/leadership/project/incident update
- 간결하고 내부 독자에게 맞춘 comms draft

## 주의점

- 너무 작은 팀 내부 정보는 전사 newsletter에 부적합할 수 있다.
- 공식성이 필요한 질문은 executive input 또는 official response 필요성을 표시해야 한다.
- tool access가 없을 때는 임의로 회사 내 정보를 지어내면 안 된다.
