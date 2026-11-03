# loop-me 스킬은 에이전트를 어떻게 바꾸나 {#loop-me-skill}

`loop-me`를 쓰면 에이전트는 사용자의 반복되는 일을 찾아, 남에게 맡길 수 있는 워크플로(workflow) 명세로 다듬는다. 다듬는 방법은 질문을 몰아붙이는 `/grilling` 방식이다.[](source:skill-run)

- 결과물은 워크플로 명세뿐이다. `workflows/*.md`에 하나씩 만들고, 질문이 풀릴 때마다 고치거나 지운다.[](source:skill-run)[](source:skill-workspace)
- 완료 조건은 하나다. 구현 담당 에이전트가 질문 하나 없이 만들 수 있으면 그 명세는 끝났다.[](source:skill-done)
- 명세에 AI, 사람 확인 지점, 일정 중 어느 것도 강제하지 않는다. 질문 결과가 필요하다고 보여 줄 때만 넣는다.[](source:skill-vocab)
- `NOTES.md`가 비었거나 빈약하면 명세보다 먼저 사용자의 일과 도구를 인터뷰한다.[](source:skill-workspace)

@answer scope="mattpocock/loop-me · 원본 텍스트 파일 2개 · 커밋 0f0d1b0"
@meta locale=ko
@source skill-fm title="mattpocock/loop-me/SKILL.md · 2522B · frontmatter" path=mattpocock/loop-me/SKILL.md lines=1:6
@source skill-run title="SKILL.md · grilling 세션 지시" path=mattpocock/loop-me/SKILL.md lines=8:8
@source skill-lens title="SKILL.md · 루프 관점" path=mattpocock/loop-me/SKILL.md lines=10:14
@source skill-vocab title="SKILL.md · 어휘" path=mattpocock/loop-me/SKILL.md lines=16:23
@source skill-done title="SKILL.md · 완료 정의" path=mattpocock/loop-me/SKILL.md lines=25:27
@source skill-workspace title="SKILL.md · 작업 폴더" path=mattpocock/loop-me/SKILL.md lines=29:32
@source oa-yaml title="mattpocock/loop-me/agents/openai.yaml · 140B · 호출 정책" path=mattpocock/loop-me/agents/openai.yaml lines=1:5
@source teach-notes title="mattpocock/teach/SKILL.md · NOTES.md 항목" path=mattpocock/teach/SKILL.md lines=20:20

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 켜지 않는다.[](source:skill-fm) `agents/openai.yaml`도 `allow_implicit_invocation: false`다.[](source:oa-yaml) 사용자가 `/loop-me`를 입력할 때 켜진다.

`argument-hint`는 "설계할 워크플로, 또는 비워 두면 찾아본다"다. 인자가 있으면 그 워크플로부터, 없으면 루프 찾기부터 시작한다.[](source:skill-fm) `description`의 "within this workspace"는 현재 폴더에 상태를 쌓는다는 뜻이다.[](source:skill-workspace)

## 질문은 어떻게 이어지나 {#flow}

@workflow id=loop-flow title="loop-me 질문 흐름"
| notes | NOTES 충분? | backend |
| world | 세계 인터뷰 | frontend |
| pick | 루프 고르기 | backend |
| grill | 질문 한 묶음 | frontend |
| spec | 명세 반영 | backend |
| left | 질문 남음? | backend |
| notes > world | 아니오 | |
| notes > pick | 예 | |
| world > pick | | |
| pick > grill | | |
| grill > spec | | |
| spec > left | | |
| left > grill | 예 | dashed |

@steps id=loop-steps
| s-notes | NOTES 충분? | `NOTES.md`에 사용자의 세계, 쓰는 도구, 처리하는 채널, 그 사람만의 용어가 충분히 있는지 본다. | loop-flow | notes |
| s-world | 세계 인터뷰 | 비었거나 빈약하면 명세보다 먼저 인터뷰한다. 흐릿한 용어는 정식 용어로 다듬어 `NOTES.md`에 적는다. | loop-flow | world |
| s-pick | 루프 고르기 | 인자로 받은 워크플로가 있으면 그것을 쓴다. 없으면 루프 관점으로 맡길 만한 반복을 찾고, 사용자가 놓친 루프도 제안한다. | loop-flow | pick |
| s-grill | 질문 한 묶음 | 한 번에 질문 한 묶음을 던지고, 질문마다 추천 답을 붙인다. 끈질기게 계속한다. | loop-flow | grill |
| s-spec | 명세 반영 | 풀린 내용에 따라 `workflows/*.md`를 만들거나 고치거나 지운다. | loop-flow | spec |
| s-left | 질문 남음? | 구현 담당이 물을 것이 하나라도 남았으면 다시 질문한다. 남은 질문이 없을 때 끝난다. | loop-flow | left |

판정: 이 흐름은 원문 여러 절을 분석자가 순서로 엮은 것이다. 원문에 번호 매긴 단계는 없다.[](source:skill-run)[](source:skill-done)[](source:skill-workspace)

## 명세에 쓰는 어휘는 무엇인가 {#vocab}

- **루프(loop)**는 사용자 삶에서 되풀이되는 패턴이다. 경력, 한 주, 아침, 반복되는 활동 하나가 모두 루프다.[](source:skill-lens)
- 삶을 루프 안의 루프로 보면 활동이 얼마나 예측 가능한지 드러난다. 그래서 맡길 만해진다.[](source:skill-lens)
- **워크플로**는 루프 하나의 명세다. 워크플로를 돌린 실제 실행이 루프이고, `workflows/*.md`가 진실의 원천이다.[](source:skill-lens)

| 용어 | 뜻 | 원문의 강도 |
| --- | --- | --- |
| 트리거(Trigger) | 매 실행을 일으키는 것. 새 메일 같은 이벤트, 또는 매일 아침 같은 일정[](source:skill-vocab) | 이벤트 쪽이 보통 더 효율적이라는 권고 |
| 사람 확인 지점(Checkpoint) | 사용자가 확인하거나 결정하는 지점. 없는 워크플로도 있다[](source:skill-vocab) | 필요할 때만 |
| 뒤로 미루기(Push right) | 확인 지점을 최대한 뒤로 미룬다. 사람에게는 한 번, 늦게, 준비가 끝난 상태로 묻는다[](source:skill-vocab) | 권고 |
| 요약 보고(Brief) | 확인 지점에서 보여 주는 결정용 요약. 무엇을 왜 만들었는지와 원본 링크. 원본 출력 그대로는 안 된다[](source:skill-vocab) | 금지 포함("never the raw output") |

어휘는 필요할 때 꺼내 쓰는 공용어다. 확인 목록처럼 모든 명세에 채우지 않는다.[](source:skill-vocab)

## 무엇을 쓰고, 무엇과 겹치나 {#workspace}

| 파일 | 내용 | 바꾸는 방식 |
| --- | --- | --- |
| `workflows/*.md` | 워크플로마다 명세 하나[](source:skill-workspace) | 만들기·고치기·지우기 |
| `NOTES.md` | 사용자의 세계, 도구, 채널, 그 사람의 용어를 적은 메모[](source:skill-workspace) | 정식 용어가 생길 때마다 추가 |

| rel-id | 상대 | 종류 | 내용 |
| --- | --- | --- | --- |
| r04 | `/grilling` | 내부 위임(범위 밖) | 질문 방식을 빌려 온다. 이 저장소의 `mattpocock/`에는 없다 |
| r07 | `teach` | 같은 계열(추론) | `teach`도 현재 폴더의 `NOTES.md`에 사용자 선호를 적는다.[](source:teach-notes) 판정: 같은 폴더에서 두 스킬을 돌리면 `NOTES.md`를 함께 쓰게 된다 |

관계 근거는 `mattpocock/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `agents/openai.yaml`. 두 파일 모두 원본이다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준).
- 실행하지 않았다. 질문·파일 작성·삭제는 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
`/grilling` 스킬 본문은 이 저장소에 없어서 읽지 못했다. 질문 한 묶음의 크기와 끝내는 규칙은 그 스킬에 있을 수 있다. 명세를 지우기 전에 사용자 확인을 받는지, 명세 파일의 형식은 무엇인지도 원문에 명시 없음.
