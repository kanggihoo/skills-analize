# to-questionnaire 스킬은 에이전트를 어떻게 바꾸나 {#to-questionnaire-skill}

`to-questionnaire`를 쓰면 에이전트는 사용자가 혼자 답할 수 없는 결정을 질문지로 만든다. 질문지는 답을 아는 다른 사람이 비동기로 채우거나 회의에서 함께 채우는 Markdown 문서다.[](source:skill-intro)

- 사용자에게는 주제가 아니라 "보내는 일"만 묻는다. 누구에게 보내는지, 무엇을 돌려받아야 하는지다.[](source:skill-send)
- 질문은 받는 사람이 아는 것과 사용자가 필요한 것 사이의 빈틈을 겨눈다.[](source:skill-send)
- 결과는 현재 폴더의 `to-questionnaire-<slug>.md` 파일 하나다. 에이전트는 그 경로를 알린다.[](source:skill-steps)

@answer scope="mattpocock/to-questionnaire · 원본 텍스트 파일 2개 · 커밋 0f0d1b0"
@meta locale=ko
@source skill-fm title="mattpocock/to-questionnaire/SKILL.md · 2904B · frontmatter" path=mattpocock/to-questionnaire/SKILL.md lines=1:5
@source skill-intro title="SKILL.md · 목적" path=mattpocock/to-questionnaire/SKILL.md lines=7:7
@source skill-send title="SKILL.md · 보내는 일만 묻는다" path=mattpocock/to-questionnaire/SKILL.md lines=9:9
@source skill-steps title="SKILL.md · 1~3단계" path=mattpocock/to-questionnaire/SKILL.md lines=12:16
@source skill-structure title="SKILL.md · 문서 구조" path=mattpocock/to-questionnaire/SKILL.md lines=18:20
@source skill-template title="SKILL.md · 질문지 틀" path=mattpocock/to-questionnaire/SKILL.md lines=22:54
@source oa-yaml title="mattpocock/to-questionnaire/agents/openai.yaml · 166B · 호출 정책" path=mattpocock/to-questionnaire/agents/openai.yaml lines=1:5

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 켜지 않는다.[](source:skill-fm) `agents/openai.yaml`도 `allow_implicit_invocation: false`다.[](source:oa-yaml) 사용자가 `/to-questionnaire`를 입력할 때 켜진다. 인자 힌트는 없다.

## 어떤 순서로 만드나 {#flow}

@workflow id=q-flow title="to-questionnaire 진행 흐름"
| who | 받는 사람 질문 | frontend |
| need | 필요한 것 질문 | frontend |
| write | 질문지 작성 | backend |
| who > need | | |
| need > write | | emphasis |

@steps id=q-steps
| s-who | 받는 사람 질문 | 한 번의 주고받기로 받는 사람의 역할, 전문 분야, 사용자와의 관계를 묻는다. 말투와 맥락의 양이 여기서 정해진다. 받는 사람이 누구이고 사용자가 모르는 무엇을 아는지 알면 끝난다. | q-flow | who |
| s-need | 필요한 것 질문 | 한 번의 주고받기로 사용자가 혼자 풀 수 없는 결정이나 사실을 묻는다. 사용자가 무엇을 하거나 정할 수 있어야 하는지 구체적인 목록이 생기면 끝난다. | q-flow | need |
| s-write | 질문지 작성 | 1~2단계의 빈틈을 겨눈 질문을 아래 틀대로 쓴다. 현재 폴더의 `to-questionnaire-<slug>.md`에 저장하고 경로를 알린다. 파일이 있고 2단계 항목이 모두 질문으로 덮이면 끝난다. | q-flow | write |

각 단계의 완료 조건은 원문 그대로다.[](source:skill-steps) 슬러그(slug)는 주제에서 만든다. 사용자 질문은 1·2단계의 두 번뿐이고, 작성한 질문지를 승인받는 단계는 원문에 명시 없음.

## 질문지는 어떤 모양인가 {#structure}

| 절 | 내용 |
| --- | --- |
| 제목, Purpose, From/To, 답의 쓰임 | 왜 이 질문지가 있고 어떤 결정이 달려 있는지[](source:skill-template) |
| Context | 사용자 머릿속에 없던 받는 사람을 위한 한 문단. 한 쪽을 넘기지 않는다 |
| How to answer | 마감과 대략의 품. 부분 답과 "모르겠다"도 쓸모 있으니 건너뛰지 말고 표시하라고 안내 |
| 주제별 `##` 절 | 질문마다 `###` 제목, 바로 아래 답 칸(`>`) |
| Anything else? | 묻지 않았지만 알아야 할 것을 받는 마지막 칸 |

| 규칙 | 원문의 강도 |
| --- | --- |
| 가장 중요한 질문을 먼저 둔다. 비동기라 한 번만 답을 받을 수 있어서다[](source:skill-structure) | 의무 |
| 질문이 "한 줌"을 넘으면 주제별 `##` 제목으로 묶는다[](source:skill-structure) | 조건부 의무, 수치 없음 |
| 질문 하나에 생각 하나. 복합 질문 금지[](source:skill-template) | 금지 |
| "왜 중요한가" 한 줄은 오해하거나 대충 답할 수 있는 질문에만 단다[](source:skill-template) | 조건부 |

판정: 틀의 How to answer 절은 마감을 적으라고 하지만, 1·2단계 질문에는 마감을 묻는 항목이 없다.[](source:skill-steps)[](source:skill-template)

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `agents/openai.yaml`. 두 파일 모두 원본이다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준). 원장에 이 스킬의 관계 행은 없다.
- 실행하지 않았다. 질문과 파일 작성은 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
마감과 품을 누가 정하는지, 같은 이름의 파일이 이미 있을 때 어떻게 하는지는 원문에 명시 없음.
