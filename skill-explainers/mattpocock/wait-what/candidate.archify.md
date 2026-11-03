# wait-what 스킬은 에이전트를 어떻게 바꾸나 {#wait-what-skill}

`wait-what`은 "방금 말 못 알아들었어, 다시 설명해" 한마디를 스킬로 만든 것이다. 에이전트는 직전 답변을 맥락을 조금 붙여 쉬운 영어로 다시 설명한다.[](source:skill-body)

- 본문은 사용자가 에이전트에게 하는 말투로 쓰여 있다. 판정: 스킬을 켜면 에이전트는 이 말을 사용자의 요청으로 받는다.[](source:skill-body)
- 문체는 ASD-STE100 Simplified Technical English다.[](source:skill-body) 원문 밖 일반 지식으로 보충하면, 항공 정비 문서용 통제 영어 규격이다.
- 용어는 저장소의 `GLOSSARY.md`에 있는 공용어를 쓴다. 저장소에 용어집이 여럿이면 `GLOSSARY-MAP.md`를 따라 맞는 것을 고른다.[](source:skill-body)

@answer scope="mattpocock/wait-what · 원본 텍스트 파일 2개 · 커밋 0f0d1b0"
@meta locale=ko
@source skill-fm title="mattpocock/wait-what/SKILL.md · 396B · frontmatter" path=mattpocock/wait-what/SKILL.md lines=1:5
@source skill-body title="SKILL.md · 본문" path=mattpocock/wait-what/SKILL.md lines=7:7
@source oa-yaml title="mattpocock/wait-what/agents/openai.yaml · 158B · 호출 정책" path=mattpocock/wait-what/agents/openai.yaml lines=1:5
@source teach-glossary title="mattpocock/teach/GLOSSARY-FORMAT.md · 용어집 정의" path=mattpocock/teach/GLOSSARY-FORMAT.md lines=3:3

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 켜지 않는다.[](source:skill-fm) `agents/openai.yaml`도 `allow_implicit_invocation: false`다.[](source:oa-yaml) 사용자가 `/wait-what`을 입력할 때만 켜진다. 인자 힌트는 없다.

- 파일을 쓰거나 바꾸지 않는다. 사용자에게 되묻는 단계도 없다.
- 완료 조건은 원문에 명시 없음. 다시 설명한 답변 하나가 결과다.
- 대화가 한국어일 때 STE 영어를 그대로 쓸지는 원문에 명시 없음.

## 용어집은 어디서 오나 {#glossary}

| rel-id | 상대 | 종류 | 내용 |
| --- | --- | --- | --- |
| r05 | 대상 저장소의 `GLOSSARY.md`, `GLOSSARY-MAP.md` | 참고(범위 밖) | 공용어를 이 파일에서 가져온다. 어느 스킬이 이 파일을 만드는지는 원문에 명시 없음 |
| r06 | `teach` | 미확인 | `teach`도 `GLOSSARY.md` 형식을 정한다.[](source:teach-glossary) 그러나 그쪽은 학습 작업 폴더의 용어집이다. 같은 파일이라는 근거가 없다 |

판정: 용어집이 없는 저장소에서 어떻게 할지 정해져 있지 않다. 그때는 STE 영어와 맥락 보충만 남는다.[](source:skill-body) 관계 근거는 `mattpocock/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `agents/openai.yaml`. 두 파일 모두 원본이다. 번역본은 없다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준).
- 실행하지 않았다. 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"직전 메시지"가 에이전트의 마지막 답변 하나인지, 최근 여러 턴인지는 원문에 명시 없음.
