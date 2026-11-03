# teach 스킬은 에이전트를 어떻게 바꾸나 {#teach-skill}

`teach`를 쓰면 에이전트는 한 번 답하고 끝나는 설명자가 아니라 여러 세션을 이어 가는 선생이 된다. 현재 폴더를 학습 작업 폴더로 삼고, 학습 이유·자료·배운 것·수업을 파일로 쌓는다.[](source:skill-intro)[](source:skill-workspace)

- 모든 수업은 `MISSION.md`에 적은 "왜 배우나"에 묶인다. 미션이 없거나 흐릿하면 먼저 그 이유부터 묻는다.[](source:skill-mission)
- 지식은 신뢰할 만한 자료에서 가져온다. 에이전트는 자기 기억(파라미터 지식)을 믿지 말라는 지시를 받는다.[](source:skill-philosophy)
- 수업은 짧은 HTML 한 장이다. 한 가지 확실한 성취를 주고, 즉각적인 피드백 고리로 연습시킨다.[](source:skill-lessons)[](source:skill-skills)
- 목표는 순간의 유창함이 아니라 오래 남는 기억이다. 그래서 인출 연습, 간격 두기, 섞어 연습하기를 쓴다.[](source:skill-fluency)

@answer scope="mattpocock/teach · 원본 텍스트 파일 6개 · 커밋 0f0d1b0"
@meta locale=ko
@source skill-fm title="mattpocock/teach/SKILL.md · 9733B · frontmatter" path=mattpocock/teach/SKILL.md lines=1:6
@source skill-intro title="SKILL.md · 상태를 갖는 요청" path=mattpocock/teach/SKILL.md lines=8:8
@source skill-workspace title="SKILL.md · 작업 폴더 파일 목록" path=mattpocock/teach/SKILL.md lines=10:20
@source skill-philosophy title="SKILL.md · 지식·기술·지혜" path=mattpocock/teach/SKILL.md lines=22:32
@source skill-fluency title="SKILL.md · 유창함과 저장 강도" path=mattpocock/teach/SKILL.md lines=34:45
@source skill-lessons title="SKILL.md · Lessons" path=mattpocock/teach/SKILL.md lines=47:61
@source skill-assets title="SKILL.md · Assets" path=mattpocock/teach/SKILL.md lines=63:69
@source skill-mission title="SKILL.md · The Mission" path=mattpocock/teach/SKILL.md lines=71:79
@source skill-zpd title="SKILL.md · 근접 발달 영역" path=mattpocock/teach/SKILL.md lines=81:89
@source skill-knowledge title="SKILL.md · Knowledge" path=mattpocock/teach/SKILL.md lines=91:97
@source skill-skills title="SKILL.md · Skills 절, 퀴즈 규칙" path=mattpocock/teach/SKILL.md lines=99:110
@source skill-wisdom title="SKILL.md · 지혜와 커뮤니티" path=mattpocock/teach/SKILL.md lines=112:120
@source skill-reference title="SKILL.md · 참고 문서" path=mattpocock/teach/SKILL.md lines=122:136
@source skill-notes title="SKILL.md · NOTES.md" path=mattpocock/teach/SKILL.md lines=138:140
@source oa-yaml title="mattpocock/teach/agents/openai.yaml · 139B · 호출 정책" path=mattpocock/teach/agents/openai.yaml lines=1:5
@source mission-fmt title="mattpocock/teach/MISSION-FORMAT.md · 1540B · 미션 틀과 규칙" path=mattpocock/teach/MISSION-FORMAT.md lines=1:31
@source resources-fmt title="mattpocock/teach/RESOURCES-FORMAT.md · 1924B · 자료 목록 틀과 규칙" path=mattpocock/teach/RESOURCES-FORMAT.md lines=1:32
@source lr-fmt title="mattpocock/teach/LEARNING-RECORD-FORMAT.md · 2747B · 학습 기록 틀" path=mattpocock/teach/LEARNING-RECORD-FORMAT.md lines=1:23
@source lr-when title="LEARNING-RECORD-FORMAT.md · 쓸 때와 대체" path=mattpocock/teach/LEARNING-RECORD-FORMAT.md lines=25:46
@source glossary-fmt title="mattpocock/teach/GLOSSARY-FORMAT.md · 2122B · 용어집 틀과 규칙" path=mattpocock/teach/GLOSSARY-FORMAT.md lines=1:35
@source loopme-notes title="mattpocock/loop-me/SKILL.md · NOTES.md 항목" path=mattpocock/loop-me/SKILL.md lines=32:32

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 켜지 않는다.[](source:skill-fm) `agents/openai.yaml`도 `allow_implicit_invocation: false`다.[](source:oa-yaml) 사용자가 `/teach`를 입력할 때 켜진다. `argument-hint`는 "무엇을 배우고 싶나"다.

작업 폴더 경로는 `/teach`를 실행한 폴더 기준이다. `*-FORMAT.md` 링크만 스킬 폴더 기준으로 읽는다.[](source:skill-workspace) 판정: 그래서 같은 폴더에서 다시 `/teach`를 실행하면 이전 세션의 상태를 이어받는다.

## 작업 폴더에 무엇을 쌓나 {#workspace}

@tree id=teach-tree title="teach 작업 폴더"
| root | 작업 폴더 | - |
| mission | MISSION.md | root |
| resources | RESOURCES.md | root |
| notes | NOTES.md | root |
| lessons | lessons/ | root |
| reference | reference/ | root |
| records | learning-records/ | root |
| assets | assets/ | root |

| 파일 | 무엇을 담나 | 형식 규칙 |
| --- | --- | --- |
| `MISSION.md` | 이 주제를 배우는 이유. 모든 수업의 기준[](source:skill-workspace) | 작업 폴더당 하나. `## Why`는 1~3문장, 성공 모습, 제약, 범위 밖. 한 화면을 넘기지 않는다[](source:mission-fmt) |
| `RESOURCES.md` | 믿을 만한 자료 목록[](source:skill-workspace) | `## Knowledge`와 `## Wisdom (Communities)`로 나눈다. 항목마다 한 줄 설명. 빈 영역은 `## Gaps`에 적는다[](source:resources-fmt) |
| `lessons/*.html` | 수업. `0001-<dash-case-name>.html`처럼 번호가 하나씩 늘어난다[](source:skill-lessons) | 인쇄 가능한 깔끔한 HTML. 다른 수업과 참고 문서로 링크 |
| `reference/*.html` | 수업을 압축한 참고 문서. 요약표, 알고리즘, 문법, 요가 자세, 용어집[](source:skill-reference) | 빨리 찾아보기 좋은 형식 |
| `learning-records/*.md` | 사용자가 실제로 배운 것. 소프트웨어의 아키텍처 결정 기록(ADR)과 비슷하다[](source:skill-workspace) | `0001-slug.md`. 1~3문장이면 충분. 첫 기록을 쓸 때 폴더를 만든다[](source:lr-fmt) |
| `assets/*` | 수업들이 함께 쓰는 구성 요소. 스타일시트, 퀴즈 위젯, 시뮬레이터[](source:skill-assets) | 재사용이 기본. 다음 수업이 복사할 코드는 인라인으로 넣지 않는다 |
| `GLOSSARY.md` | 이 작업 폴더의 정식 용어. 위치는 원문에 명시 없음이라 트리에서 뺐다[](source:glossary-fmt) | 사용자가 이해한 용어만 올린다. 정의는 1~2문장. 피할 별칭을 함께 적는다 |
| `NOTES.md` | 사용자의 선호와 작업 메모[](source:skill-notes) | 형식 파일 없음 |

에이전트는 수업을 열 수 있으면 CLI 명령으로 사용자에게 열어 준다.[](source:skill-lessons) 이 명령도 지시상 동작이며 분석 중 실행하지 않았다.

## 무엇을 가르치기로 정하나 {#decide}

@workflow id=teach-flow title="teach 한 세션의 판단 순서"
| mission | 미션 확인 | frontend |
| res | 자료 찾기 | backend |
| lesson | 수업 작성 | backend |
| record | 학습 기록 | backend |
| mission > res | | |
| res > lesson | | |
| lesson > record | 근거 있음 | emphasis |

@steps id=teach-steps
| s-mission | 미션 확인 | `MISSION.md`가 비었거나 사용자가 이유를 흐릿하게 말하면 왜 배우려는지 먼저 묻는다. 이유를 말하지 못하면 아무것도 쓰기 전에 인터뷰한다. 나쁜 미션은 미션이 없는 것보다 나쁘다. 미션을 모르면 수업이 추상적이 되고 다음에 뭘 할지 판단할 수 없다. | teach-flow | mission |
| s-res | 자료 찾기 | `RESOURCES.md`가 충분히 차기 전에는 좋은 자료 찾기에 집중한다. 판정: 원문은 "채워지기 전"이라는 상태만 말하므로 이미 찬 경우 건너뛴다. | teach-flow | res |
| s-lesson | 수업 작성 | 사용자가 주제를 정해 주지 않으면 학습 기록을 읽고 미션에 비추어 근접 발달 영역에 맞는 것을 고른다. `assets/`를 먼저 읽고 기존 구성 요소로 만든다. 지식을 먼저, 그다음 피드백 고리로 기술을 연습시킨다. 참고 문서도 함께 만든다. | teach-flow | lesson |
| s-record | 학습 기록 | 사용자가 이해를 증명했거나, 이미 아는 것을 밝혔거나, 오해를 고쳤거나, 미션이 바뀌었을 때만 쓴다. | teach-flow | record |

판정: 이 순서는 원문 여러 절을 분석자가 엮은 것이다. 원문에 번호 매긴 단계는 없다.[](source:skill-mission)[](source:skill-philosophy)[](source:skill-zpd)[](source:lr-when)

근접 발달 영역(zone of proximal development)은 "딱 적당히 어렵다"고 느끼는 범위다.[](source:skill-zpd) 학습 기록은 이 범위를 계산하는 데 쓴다. 그래서 "다루기만 한 내용"은 기록하지 않는다. 다룬 것은 배운 것이 아니고, 증거를 기다린다.[](source:lr-when)

## 학습 철학은 무엇인가 {#philosophy}

| 요소 | 어디서 오나 | 이 스킬이 하는 일 |
| --- | --- | --- |
| 지식(Knowledge) | 질 높고 믿을 만한 자료 | `RESOURCES.md`에 모으고 수업에 인용을 촘촘히 단다[](source:skill-knowledge) |
| 기술(Skills) | 지식을 바탕으로 한 상호작용 수업 | 퀴즈, 브라우저 과제, 실제 단계 안내로 연습시킨다[](source:skill-skills) |
| 지혜(Wisdom) | 다른 학습자·실천가와의 교류 | 먼저 답해 보되, 평판 좋은 커뮤니티로 넘긴다[](source:skill-wisdom) |

| 원칙 | 내용 |
| --- | --- |
| 유창함 vs 저장 강도 | 순간의 유창함은 다 안다는 착각을 준다. 진짜 목표는 오래 남는 저장 강도다[](source:skill-fluency) |
| 바람직한 어려움 | 인출 연습, 간격 두기, 섞어 연습하기. 섞기는 기술 연습에만 쓴다[](source:skill-fluency) |
| 어려움의 두 얼굴 | 지식을 받아들일 때 어려움은 적이다. 작업 기억을 잡아먹는다. 기술을 익힐 때는 어려움이 도구다[](source:skill-knowledge)[](source:skill-skills) |
| 짧은 수업 | 작업 기억은 아주 작다. 수업은 빨리 끝나고 하나의 확실한 성취를 준다[](source:skill-lessons) |
| 피드백 고리 | 가능한 한 즉시, 되도록 자동으로 피드백한다[](source:skill-skills) |

수업마다 넣어야 하는 것은 네 가지다. 미션과의 연결, 가장 믿을 만한 주 자료 하나의 추천, 다른 수업과 참고 문서로 가는 링크, 막히면 에이전트에게 다시 물어보라는 안내다.[](source:skill-lessons) 수업은 다시 열리는 일이 드물고 참고 문서가 다시 열린다. 그래서 참고 문서를 수업의 압축본으로 만든다.[](source:skill-reference)

@facts
| 퀴즈 보기 | 모든 보기의 단어 수를 같게, 가능하면 글자 수도 같게 |
| 정답 위치 | 문제마다 바꾼다. 서식이나 순서로 힌트를 주지 않는다 |
| 파일 번호 | `0001`부터 하나씩 증가 |
| 미션 길이 | Why 1~3문장, 전체가 한 화면 이내 |
| 학습 기록 길이 | 1~3문장, 문단 하나로 충분 |
| 용어 정의 길이 | 1~2문장 |

퀴즈 규칙의 출처는 `SKILL.md` Skills 절이다.[](source:skill-skills) "다섯 개의 날카로운 자료가 서른 개의 평범한 자료보다 낫다"는 권고 문장이다.[](source:resources-fmt)

## 사용자에게 언제 묻고, 무엇을 존중하나 {#human}

| 상황 | 지시 | 강도 |
| --- | --- | --- |
| 미션이 없거나 흐릿하다 | 왜 배우려는지 먼저 묻는다[](source:skill-mission) | 첫 일 |
| 미션을 바꿔야 한다 | 바꾸기 전에 사용자에게 확인한다. 바꾸면 `MISSION.md`를 고치고 학습 기록을 남긴다[](source:skill-mission) | 의무 |
| 커뮤니티에 들어가기 싫다고 한다 | 그 뜻을 존중하고 `RESOURCES.md`에 적어 다음 세션이 다시 권하지 않게 한다[](source:skill-wisdom)[](source:resources-fmt) | 의무 |
| 수업 방식 선호를 말한다 | `NOTES.md`에 적고 수업을 설계할 때 참고한다[](source:skill-notes) | 의무 |
| 이해가 틀렸던 것으로 밝혀진다 | 옛 학습 기록을 지우지 않고 `Status: superseded by LR-NNNN`으로 표시한다[](source:lr-when) | 의무 |

완료 조건은 원문에 명시 없음. 판정: "여러 세션에 걸쳐 배운다"는 전제상 이 스킬에는 끝이 없고, 미션의 "성공 모습"이 사실상의 도착점이다.[](source:skill-intro)[](source:mission-fmt)

## 다른 스킬과 어떻게 이어지나 {#relations}

| rel-id | 상대 | 종류 | 내용 |
| --- | --- | --- | --- |
| r06 | `wait-what` | 미확인 | 둘 다 `GLOSSARY.md`를 말하지만 이쪽은 학습 작업 폴더의 용어집이고 `wait-what`은 코드 저장소의 공용어 파일이다.[](source:glossary-fmt) 같은 파일이라는 근거가 없다 |
| r07 | `loop-me` | 같은 계열(추론) | 둘 다 현재 폴더에 상태를 쌓고 `NOTES.md`를 쓴다.[](source:loopme-notes) 판정: 같은 폴더에서 돌리면 `NOTES.md`를 함께 쓰게 된다 |

원장 기준으로 `learning/teach`는 `SKILL.md`가 같다. 분석자가 `shasum`으로 다시 보니 `*-FORMAT.md` 네 파일도 모두 같았다. `pstack/teach`는 이름만 같고 내용이 다르다. 관계 근거는 `mattpocock/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `agents/openai.yaml`, `MISSION-FORMAT.md`, `RESOURCES-FORMAT.md`, `LEARNING-RECORD-FORMAT.md`, `GLOSSARY-FORMAT.md`. 모두 원본이다.
- 제외한 파일: 없음. 이 스킬 폴더에는 번역본이 없다.
- 실행하지 않았다. 질문, 파일 작성, 수업 열기 명령은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=warning title="원문끼리 어긋나는 곳"
`SKILL.md`의 작업 폴더 목록에는 `GLOSSARY.md`가 없고, `GLOSSARY-FORMAT.md`로 가는 링크도 없다.[](source:skill-workspace) 용어집은 `reference/*.html`의 한 종류로만 나온다.[](source:skill-reference) 반면 `GLOSSARY-FORMAT.md`와 학습 기록 형식은 `GLOSSARY.md` 파일을 전제한다.[](source:glossary-fmt)[](source:lr-when) 형식 파일들은 "explainers", "exercises"라는 말을 쓰고 `SKILL.md`는 "lessons"를 쓴다. 미션 변경도 `SKILL.md`는 사용자 확인을 요구하고 `MISSION-FORMAT.md`는 "목표가 바뀌면 고친다"고만 한다.[](source:mission-fmt) 원문에 우선순위가 없어 그대로 둔다.

@callout level=open-question title="확인하지 못한 것"
`GLOSSARY.md`의 위치(작업 폴더 루트인지)는 원문에 명시 없음. `Status`를 frontmatter로 쓸지 본문 줄로 쓸지도 두 표현이 섞여 있다.[](source:lr-fmt)[](source:lr-when)
