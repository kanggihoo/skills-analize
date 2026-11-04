# automate-me 스킬은 에이전트를 어떻게 바꾸나 {#automate-me-skill}

`automate-me`를 켜면 에이전트가 사용자의 작업 습관을 `-mode` 스킬 하나로 만든다(예: `jay-mode`). 에이전트는 최근 대화 기록과 객관식 질문으로 습관을 모으고, `create-skill`로 초안을 쓰고, `unslop`으로 문장을 다듬는다.[](source:intro)

- 이 스킬은 기록 분석, 작성, 문장 다듬기 세 가지를 순서대로 엮을 뿐, 작성과 다듬기를 직접 하지 않는다. 기록 분석(mining)은 이 스킬 안에서 하고, 작성은 Cursor 내장 `create-skill`이, 문장 다듬기는 `unslop`이 맡는다.[](source:intro)
- 사용자가 개입하는 곳은 세 번이다. 에이전트가 기존 스킬을 고칠지 묻고, 객관식으로 선호를 묻고, 초안을 보여 주고 의견을 받아 고친다.[](source:step0)[](source:step2)[](source:step5)
- 에이전트는 대화 하나에서만 본 선호를 규칙으로 굳히지 않는다. 기록 조각 2곳 이상에서 나타나야 믿는다.[](source:step1)[](source:guard)
- 에이전트는 결과를 `main`에 직접 push하지 않는다. worktree에서 commit하고 PR을 연다.[](source:step6)

@answer scope="pstack/automate-me · 원본 텍스트 파일 1개 · 커밋 5760176"
@meta locale=ko
@source fm title="pstack/automate-me/SKILL.md · 7164B · 본문(frontmatter)" path=pstack/automate-me/SKILL.md lines=1:5
@source intro title="pstack/automate-me/SKILL.md · 목적과 엮는 스킬" path=pstack/automate-me/SKILL.md lines=9:11
@source step0 title="pstack/automate-me/SKILL.md · 0. 기존 스킬 확인" path=pstack/automate-me/SKILL.md lines=15:25
@source step1 title="pstack/automate-me/SKILL.md · 1. 기록 분석" path=pstack/automate-me/SKILL.md lines=27:40
@source step2 title="pstack/automate-me/SKILL.md · 2. 직접 질문" path=pstack/automate-me/SKILL.md lines=42:48
@source step3 title="pstack/automate-me/SKILL.md · 3. 묶기" path=pstack/automate-me/SKILL.md lines=50:63
@source step4 title="pstack/automate-me/SKILL.md · 4. 초안 작성" path=pstack/automate-me/SKILL.md lines=65:73
@source step5 title="pstack/automate-me/SKILL.md · 5. 문장 다듬기" path=pstack/automate-me/SKILL.md lines=75:79
@source step6 title="pstack/automate-me/SKILL.md · 6. 올리기" path=pstack/automate-me/SKILL.md lines=81:83
@source guard title="pstack/automate-me/SKILL.md · Guardrails" path=pstack/automate-me/SKILL.md lines=85:92
@source eval title="pstack/automate-me/SKILL.md · Evaluation" path=pstack/automate-me/SKILL.md lines=94:98
@source notuse title="pstack/automate-me/SKILL.md · When not to use" path=pstack/automate-me/SKILL.md lines=100:103
@source recall-route title="pstack/recall/SKILL.md · 분류 후 넘김" path=pstack/recall/SKILL.md lines=17:17
@source help-am title="pstack/poteto-help/SKILL.md · 안내 표와 개인화 절" path=pstack/poteto-help/SKILL.md lines=82:139

## 언제 켜지나 {#trigger}

@code source=fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:fm) `description`은 "automate me", "update my -mode skill" 같은 요청을 다룬다고 설명한다. 그래서 이 스킬은 사용자가 `/automate-me`를 입력하거나 다른 스킬이 넘길 때 켜진다.

| 누가 넘기나 | 조건 | rel-id |
| --- | --- | --- |
| `recall` | `recall`이 요청을 먼저 분류한다. 요청이 습관을 오래 쓸 스킬로 굳히는 일이면, `automate-me`가 맡는다[](source:recall-route) | r46 |
| `poteto-help` | `poteto-help`가 "자기 작업 습관을 개인 모드 스킬로 만들 때" 쓰라고 안내하고, `/poteto-mode`와 함께 쓰는 스킬로 소개한다[](source:help-am) | r22 |

| 쓰지 않는 경우 | 대신 할 일 |
| --- | --- |
| 작업 습관이 아니라 특정 작업용 스킬을 원한다 | `create-skill`만 쓴다. 기록 분석은 필요 없다[](source:notuse) |
| 좁은 작업 흐름 하나를 담고 싶다(예: "how I write commit messages") | 모드 스킬이 아닌 일반 스킬로 만든다[](source:notuse) |

## 어떤 순서로 진행하나 {#flow}

@workflow id=am-flow title="automate-me 진행 흐름"
| lane collect | 수집 |
| lane write | 작성 |
| lane ship | 출시 |
| check | 기존 확인 | backend | collect |
| mine | 기록 분석 | backend | collect |
| ask | 직접 질문 | frontend | collect |
| cluster | 묶기 | backend | write |
| draft | 초안 작성 | backend | write |
| polish | 다듬기 | frontend | write |
| land | PR 열기 | backend | ship |
| check > mine | | |
| mine > ask | | |
| ask > cluster | | |
| cluster > draft | | |
| draft > polish | | emphasis |
| polish > land | | |

@steps id=am-steps
| s-check | 기존 확인 | 에이전트가 사용자 핸들과 맞는 `.cursor/skills/**/*-mode/SKILL.md`, `~/.cursor/skills/*-mode/SKILL.md`를 하위 폴더까지 찾는다. 파일이 있으면, `AskQuestion`으로 고칠지 새로 쓸지 묻는다. 사용자가 이미 "update my skill"이라고 했으면, 묻지 않는다. 이 스킬을 반복해서 실행할 때 기본값은 고치기다. 새로 쓰기는 드문 경우이고, 새로 쓰기 전에 이유를 묻는다. | am-flow | check |
| s-mine | 기록 분석 | 에이전트는 현재 작업 공간의 `agent-transcripts/`만 본다. 기록을 여러 조각으로 나눠 서브에이전트들에게 병렬로 맡기면, 서브에이전트들은 각자 신호를 찾아 근거 위치와 함께 짧은 목록으로 돌려준다. 고치기 모드이면, 스킬을 마지막으로 고친 뒤의 기록만 본다. | am-flow | mine |
| s-ask | 직접 질문 | 에이전트가 기록에 아직 드러나지 않은 의도를 묻는다. 먼저 `AskQuestion` 객관식으로 넓게 묻고, 사용자가 고른 영역을 좁혀 묻는다. 마지막에 자유 질문 하나로 빠진 것을 잡는다. 고치기 모드이면, 무엇이 바뀌었거나 빠졌는지 묻는다. | am-flow | ask |
| s-cluster | 묶기 | 에이전트가 모은 신호를 절로 묶는다. 해당하는 절만 쓴다. `poteto-mode`는 읽어서 세밀함의 수준만 참고하고, 내용은 베끼지 않는다. | am-flow | cluster |
| s-draft | 초안 작성 | 에이전트가 `create-skill`로 스킬을 쓴다. 고치기 모드이면, 기존 파일을 제자리에서 고친다. 사용자가 반박하지 않은 절은 남기고, 새 근거가 있는 절만 고치고, 정말 새 규칙에만 절을 더한다. | am-flow | draft |
| s-polish | 다듬기 | 에이전트가 모든 줄에 `unslop`과 `create-skill`의 글쓰기 지침을 적용한다. 초안을 사용자에게 보여 주고 의견을 받는다. 여러 번 고치게 될 것으로 보고 과감히 줄인다. | am-flow | polish |
| s-land | PR 열기 | 에이전트는 `main`에서 갈라진 worktree에서 작업한다. commit하고 PR을 연다. `main`에 직접 push하지 않는다. | am-flow | land |

이 흐름은 `SKILL.md`의 0~6단계를 그대로 옮긴 것이다.[](source:step0)[](source:step1)[](source:step2)[](source:step3)[](source:step4)[](source:step5)[](source:step6)

@facts
| 기록 범위 | 예: 최근 2~4주(원문의 예시) |
| 조각 수 | 예: 3개(원문의 예시). 조각마다 자료가 충분해야 한다 |
| 높은 신뢰 | 조각 2곳 이상에서 본 신호. 혼자 나온 신호는 보통 버린다 |
| 객관식 질문 | 1~2개, 각 선택지 4~6개, 영역 질문은 `allow_multiple: true` |
| 자유 질문 | 객관식 뒤에 1개 |
| 금지 | 질문 20개를 한꺼번에 쏟지 않는다 |

## 무엇을 찾고 어떻게 쓰나 {#content}

기록에서 기본으로 찾는 신호는 여섯 가지다.[](source:step1)

| 신호 | 예 |
| --- | --- |
| 답변 선호 | 길이, 어조, 형식, "dumb it down" 같은 교정 |
| 위임 습관 | 서브에이전트, 모델, 전문 작업 흐름, 병렬 |
| 검증 태도 | "완료"의 뜻, 단위 테스트 대 실제 재현, 리뷰어 |
| 코드와 글 규율 | 문체, 인용하는 원칙, 린트·포맷 도구 |
| 작업 관례 | worktree, commit, PR, 리뷰·병합 도구 |
| 메타 선호 | 작업 중 스킬 고치기, 새 스킬 제안 |

묶을 때 흔히 쓰는 절은 응답 문체, 자율성, 먼저 이해하기, 서브에이전트, 글·코드 규율, 리뷰와 검증, 작업 절차, 스킬이다. 해당하는 절만 쓴다.[](source:step3)

| 초안 항목 | 규칙 |
| --- | --- |
| 경로 | 기존 모드 스킬의 분류 폴더를 지킨다. 새 모드면 그 핸들의 개인 폴더가 있을 때 `.cursor/skills/<handle>/<handle>-mode/SKILL.md`, 없으면 `.cursor/skills/<handle>-mode/SKILL.md`. 개인 스킬을 원하면 `~/.cursor/skills/<handle>-mode/`[](source:step4) |
| 핸들 | 사용자의 이름이나 고른 식별자[](source:step4) |
| `description` | 이름, `/<handle>-mode`, "work in their style"에 반응하게 쓴다. "write code", "review PR" 같은 일반 단어로 쓰지 않는다. YAML 값 하나로 두고, 필요하면 따옴표나 `>-`를 쓴다[](source:step4) |
| `disable-model-invocation` | 기본은 `true`. 사용자가 매 턴 적용을 명시적으로 원할 때만 뺀다[](source:step4) |

평가는 테스트 루프로 하지 않는다. 모드 스킬은 주관적인 결과물이라 `create-skill`식 벤치마크가 쓸모없다고 본다. 사용자에게 "나처럼 읽히는지, 빠진 게 없는지"를 확인하고 내보낸다. description 최적화는 실제로 켜지는 정확도가 문제일 때만 돌린다.[](source:eval)

## 무엇을 금지하나 {#guardrails}

| 가드레일 | 에이전트가 하는 일 |
| --- | --- |
| 대화 하나에 맞추지 않는다 | 한 번 말하고 다른 때 뒤집은 선호는 잡음으로 본다. 여러 번 나와야 규칙으로 쓴다[](source:guard) |
| 꾸미지 않는다 | 다른 스킬의 내용을 되풀이하지 않고, 비유를 지어내지 않고, 시적인 문장을 쓰지 않는다. 실행에 쓰이는 문장만 쓴다[](source:guard) |
| 붙이지 말고 가리킨다 | 사용자가 쓰는 다른 스킬과 원칙 문서는 발췌를 붙이지 않고 경로로 적는다[](source:guard) |
| 절을 최소로 둔다 | 기본값과 다른 구체적 규칙이 있을 때만 절을 만든다. "Communicate clearly"는 절이 아니다[](source:guard) |
| 이름을 일반화한다 | 명령문에는 작성자 이름 대신 "the user"나 "the human"을 쓴다[](source:guard) |
| 대칭을 억지로 맞추지 않는다 | 적을 만한 작업 절차가 없으면 그 절을 통째로 뺀다[](source:guard) |

@callout level=warning title="다른 프로젝트의 대화를 읽지 않는다"
원문은 에이전트가 `~/.cursor/projects/*/`를 훑지 말라고 한다. 훑으면 작업 공간 경계를 넘어 관계없는 프로젝트의 비공개 대화를 읽게 되기 때문이다. 서브에이전트는 부모 에이전트가 넘겨 준 작업 공간 경로만 읽는다.[](source:step1)

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `pstack/automate-me/SKILL.md`(원본, 유일한 텍스트 파일).
- 관계 확인용으로 읽은 줄: 위 출처 목록의 다른 스킬 줄. 각 줄만 확인했다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다.
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
`create-skill`과 `AskQuestion`은 Cursor 환경의 것이라 `pstack` 범위 밖이다(r92). 그 동작은 확인하지 못했다.
마이닝 서브에이전트의 모델, `readonly` 설정, 프롬프트 템플릿은 원문에 명시 없음.
고치기 모드의 기준 시각은 `git log -1 --format=%cI <path>`다. 스킬 파일이 git 밖에 있으면 어떻게 하는지는 원문에 명시 없음.[](source:step0)
