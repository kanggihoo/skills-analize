# handoff 스킬은 에이전트를 어떻게 바꾸나 {#handoff-skill}

`handoff`를 쓰면 에이전트는 지금까지의 대화를 인계 문서 하나로 압축한다. 새 에이전트가 이 문서만 읽고 일을 이어받게 하는 것이 목적이다.[](source:skill-body)

- 문서는 작업 폴더가 아니라 OS의 임시 폴더에 저장한다.[](source:skill-body)
- 다음 에이전트가 Skill 도구로 부를 스킬을 "suggested skills" 절에 적는다.[](source:skill-skills)
- 명세·계획·이슈·커밋처럼 이미 있는 기록은 옮겨 적지 않고 경로나 URL로 가리킨다.[](source:skill-nodup)
- API 키, 비밀번호, 개인 식별 정보는 지운다.[](source:skill-redact)

@answer scope="mattpocock/handoff · 원본 텍스트 파일 2개 · 커밋 0f0d1b0"
@meta locale=ko
@source skill-fm title="mattpocock/handoff/SKILL.md · 940B · frontmatter" path=mattpocock/handoff/SKILL.md lines=1:6
@source skill-body title="SKILL.md · 목적과 저장 위치" path=mattpocock/handoff/SKILL.md lines=8:8
@source skill-skills title="SKILL.md · suggested skills 절" path=mattpocock/handoff/SKILL.md lines=10:10
@source skill-nodup title="SKILL.md · 중복 금지" path=mattpocock/handoff/SKILL.md lines=12:12
@source skill-redact title="SKILL.md · 민감 정보 제거" path=mattpocock/handoff/SKILL.md lines=14:14
@source skill-args title="SKILL.md · 인자 처리" path=mattpocock/handoff/SKILL.md lines=16:16
@source oa-yaml title="mattpocock/handoff/agents/openai.yaml · 141B · 호출 정책" path=mattpocock/handoff/agents/openai.yaml lines=1:5

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) `agents/openai.yaml`도 `allow_implicit_invocation: false`로 같은 제한을 둔다.[](source:oa-yaml) 사용자가 `/handoff`를 입력할 때 켜진다.

`argument-hint`는 "다음 세션을 무엇에 쓸 것인가"다. 인자가 있으면 다음 세션의 초점으로 보고 문서를 그에 맞춘다.[](source:skill-args) 인자가 없을 때의 기준은 원문에 명시 없음.

## 문서에 무엇을 넣고 무엇을 빼나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| `$TMPDIR`, 없으면 `/tmp`, Windows는 `%TEMP%`에 저장한다. 작업 폴더에는 두지 않는다[](source:skill-body) | 의무 |
| "suggested skills" 절에 다음 에이전트가 부를 스킬 이름을 적는다[](source:skill-skills) | 의무 |
| 명세, 계획, ADR, 이슈, 커밋, diff에 이미 있는 내용은 되풀이하지 않고 경로나 URL로 가리킨다[](source:skill-nodup) | 금지 |
| API 키, 비밀번호, 개인 식별 정보를 지운다[](source:skill-redact) | 의무 |
| 인자가 있으면 그 초점에 맞춰 문서를 고친다[](source:skill-args) | 조건부 의무 |

- 사용자에게 묻는 단계가 없다.
- 판정: 저장 위치를 임시 폴더로 정해 둔 덕에 인계 문서가 저장소 커밋에 섞이지 않는다.[](source:skill-body)
- 파일 이름, 문서의 절 구성(suggested skills 외), 길이, 완료 조건은 원문에 명시 없음. 저장한 경로를 사용자에게 알리라는 지시도 원문에 명시 없음.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `agents/openai.yaml`. 두 파일 모두 원본이다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준). 원장에 이 스킬의 관계 행은 없다.
- 실행하지 않았다. 문서 작성은 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
새 에이전트가 이 문서를 어떻게 찾아 읽는지는 원문에 명시 없음. 임시 폴더는 OS가 비울 수 있어서 문서가 얼마나 남는지도 알 수 없다.
