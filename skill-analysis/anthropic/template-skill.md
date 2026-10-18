# template-skill 분석

## 원본

- 원본 경로: `.agents/skills/template-skill/`
- 핵심 파일: `SKILL.md`
- 확인한 규모: 1개 파일, 7줄
- 성격: 아직 실제 지시가 채워지지 않은 skill scaffold/template

## 적용 조건

현재 `description`이 “Replace with description of the skill and when Claude should use it.”로 되어 있고, 본문도 “Insert instructions below”뿐이다.

따라서 이 스킬은 실질적으로 어떤 작업에도 안정적으로 적용할 수 없다. 이름 그대로 새 스킬을 작성할 때 출발점으로 쓰는 placeholder에 가깝다.

## 동작 과정

1. metadata의 `name`은 `template-skill`이다.

2. `description`은 대체해야 하는 placeholder 문장이다.

3. 본문에는 구체적인 workflow, trigger, resource, tool instruction이 없다.

4. 실제 skill로 쓰려면 사용 조건, workflow, output, constraints, examples를 작성해야 한다.

## 핵심 규칙

- 현재 상태에서는 동작 규칙이 없다.
- 실제 업무용 스킬로 간주하면 안 된다.
- 새 스킬 작성 시 skeleton으로만 참고할 수 있다.

## 산출물 특성

현재 산출물을 정의하지 않는다.

## 주의점

- 이 스킬은 Anthropic skill bundle 안에 있지만 완성된 스킬이 아니다.
- 자동 트리거 대상으로 삼으면 잘못된 동작을 유발할 수 있다.
- 사용하려면 먼저 실제 설명과 지시문을 채워야 한다.
