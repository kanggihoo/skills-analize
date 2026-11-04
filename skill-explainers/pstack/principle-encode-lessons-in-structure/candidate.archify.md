# principle-encode-lessons-in-structure 스킬은 에이전트를 어떻게 바꾸나 {#encode-lessons-skill}

`principle-encode-lessons-in-structure`를 읽은 에이전트는 같은 지시를 두 번째로 쓰는 순간 멈춘다. 그 지시를 린트 규칙, 메타데이터 플래그, 런타임 검사, 스크립트 같은 장치로 바꾸고 글로 된 지시는 지운다.[](source:pattern)

- 원문의 이유: 글로 된 지시는 읽는 쪽이 알아채고, 기억하고, 따라야 한다. 장치는 읽는 쪽이 협조하지 않아도 규칙을 지키게 한다.[](source:why)
- 장치가 여럿 가능하면 가장 강한 것을 고른다. 에이전트는 주변 코드를 따라 하므로 약한 방어가 다음 본보기가 된다.[](source:strongest)
- 판단이 필요해 장치로 못 바꾸면, 지시를 더 눈에 띄게 하고 실패 사례를 붙인다.[](source:pattern)
- 에이전트는 사람의 교정, 테스트 실패, 예상 밖 결과를 모두 배울 신호로 본다. 신호를 기록하고, 맞는 층으로 보내고, 바로 적용하거나 구체적인 할 일로 만든다.[](source:loop)

@answer scope="pstack/principle-encode-lessons-in-structure · SKILL.md 1개와 호출 측 줄 · 커밋 5760176"
@meta locale=ko
@source fm title="pstack/principle-encode-lessons-in-structure/SKILL.md · 2211B · 원칙 본문(frontmatter)" path=pstack/principle-encode-lessons-in-structure/SKILL.md lines=1:5
@source rule title="pstack/principle-encode-lessons-in-structure/SKILL.md · 규칙" path=pstack/principle-encode-lessons-in-structure/SKILL.md lines=9:9
@source why title="pstack/principle-encode-lessons-in-structure/SKILL.md · 이유" path=pstack/principle-encode-lessons-in-structure/SKILL.md lines=11:11
@source pattern title="pstack/principle-encode-lessons-in-structure/SKILL.md · 패턴 3단계" path=pstack/principle-encode-lessons-in-structure/SKILL.md lines=13:17
@source strongest title="pstack/principle-encode-lessons-in-structure/SKILL.md · 가장 강한 장치 고르기" path=pstack/principle-encode-lessons-in-structure/SKILL.md lines=19:21
@source loop title="pstack/principle-encode-lessons-in-structure/SKILL.md · 피드백 고리" path=pstack/principle-encode-lessons-in-structure/SKILL.md lines=23:26
@source anti title="pstack/principle-encode-lessons-in-structure/SKILL.md · 안티패턴" path=pstack/principle-encode-lessons-in-structure/SKILL.md lines=28:31
@source pm-cite title="pstack/poteto-mode/SKILL.md · 20559B · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙 목록 머리말" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-trigger title="pstack/poteto-mode/SKILL.md · Meta 목록의 이 원칙 줄" path=pstack/poteto-mode/SKILL.md lines=79:79
@source pb-orch title="pstack/poteto-mode/playbooks/orchestrate.md · 16779B · preferences.md 규칙" path=pstack/poteto-mode/playbooks/orchestrate.md lines=25:25
@source pb-worktree title="pstack/poteto-mode/playbooks/worktree-cleanup.md · 2932B · 1단계" path=pstack/poteto-mode/playbooks/worktree-cleanup.md lines=5:5
@source lever title="pstack/principle-build-the-lever/SKILL.md · 2458B · 구별 문장" path=pstack/principle-build-the-lever/SKILL.md lines=23:23
@source pb-skill title="pstack/poteto-mode/playbooks/authoring-a-skill.md · 831B · 구조적 출처" path=pstack/poteto-mode/playbooks/authoring-a-skill.md lines=10:10
@source pb-plan title="pstack/poteto-mode/playbooks/multi-phase-plan.md · 12977B · 6단계" path=pstack/poteto-mode/playbooks/multi-phase-plan.md lines=10:10
@source fio title="pstack/figure-it-out/SKILL.md · 4059B · 반복 교정 처리" path=pstack/figure-it-out/SKILL.md lines=51:51
@source reflect title="pstack/reflect/SKILL.md · 4982B · Accepted 점검" path=pstack/reflect/SKILL.md lines=49:49
@source smyw title="pstack/show-me-your-work/SKILL.md · 6418B · 근거 선호" path=pstack/show-me-your-work/SKILL.md lines=53:53
@source runner title="pstack/architect/references/runner-prompt.md · 3087B · 러너 설계 기준" path=pstack/architect/references/runner-prompt.md lines=14:14

## 언제 켜지나 {#trigger}

@code source=fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:fm) 사용자가 `/principle-encode-lessons-in-structure`를 입력하거나, 다른 스킬이 이 원칙을 읽으라고 할 때 켜진다. `description`은 이 원칙이 어떤 상황에 맞는지 알려 주는 설명이다.

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-encode-lessons-in-structure` 입력 |
| `poteto-mode` (Meta 분류) | 같은 지시를 두 번째로 쓰고 있을 때[](source:pm-trigger) |
| `orchestrate` 플레이북 | 지시를 다시 말하고 있으면, 행동하기 전에 `preferences.md`에 한 줄을 더한다[](source:pb-orch) |
| `worktree-cleanup` 플레이북 | 경로를 손으로 치지 않고 `git worktree list`에서 읽는 근거[](source:pb-worktree) |

`poteto-mode`는 에이전트가 원칙을 적용하기 전에 그 원칙의 `SKILL.md`를 끝까지 읽게 한다.[](source:pm-read) 에이전트는 답변에서 결정을 바꾼 원칙과 바뀐 선택을 밝히고, 이번 세션에 읽은 원칙만 인용한다.[](source:pm-cite)

## 무엇을 강제하나 {#rules}

@workflow id=encode-flow title="같은 지시를 두 번째로 쓸 때"
| again | 반복 지시 | external |
| ask | 장치로 되나? | backend |
| encode | 장치화 | backend |
| louder | 지시 강조 | backend |
| again > ask | | |
| ask > encode | 예 | emphasis |
| ask > louder | 아니오 | |

@steps id=encode-steps
| s-ask | 장치로 되나? | 반복되는 지시를 린트 규칙, 메타데이터 플래그, 런타임 검사, 스크립트 중 하나로 바꿀 수 있는지 묻는다. | encode-flow | ask |
| s-encode | 장치화 | 장치로 바꿀 수 있으면 장치로 만든다. 장치가 여럿 가능하면 가장 강한 것을 고른다. 그다음 글로 된 지시는 지운다. 구조적 해결이 있으면 구조적 해결만 쓴다. 지시는 증상이다. | encode-flow | encode |
| s-louder | 지시 강조 | 판단이 필요해 장치로 못 바꾸면 지시를 더 눈에 띄게 하고 실패 사례를 붙인다. | encode-flow | louder |

이 흐름은 원문 패턴 1~3번과 따름 규칙을 옮긴 것이다.[](source:pattern)[](source:strongest)

장치의 강도는 원문이 정한 순서를 따른다. 위에 있을수록 강하다.[](source:strongest)

@list ordered=true
| 표현할 수 없는 상태. 아예 컴파일되지 않는다 |
| 린트 규칙이나 금지 API. CI가 실패한다 |
| 표준 헬퍼 |
| 런타임 검사 |

| 교정의 종류 | 보낼 층 |
| --- | --- |
| 일회성 | 메모(brain note)[](source:loop) |
| 되풀이되는 수정 | 스킬이나 린트 규칙[](source:loop) |
| 체계적인 문제 | 원칙[](source:loop) |

| 금지하는 것(안티패턴) | 원문의 예 |
| --- | --- |
| 기록하지 않고 받아들이기 | "명심하겠습니다"는 남지 않는다[](source:anti) |
| 기록하고 보내지 않기 | 있어야 할 린트 규칙을 적은 메모는 그 규칙을 만들지 않으면 쓸모없다[](source:anti) |
| 일반화하지 않고 고치기 | 한 곳만 고치고 되풀이되는 패턴은 그대로 둔다[](source:anti) |

기록만 하고 끝내지 않는다. 바로 적용하거나 구체적인 할 일을 만든다.[](source:loop) 이 원칙을 적용하지 않는 경우는 원문에 명시 없음.

## 흐름 속 위치 {#position}

@workflow id=encode-position title="encode-lessons 앞뒤"
| pm | poteto-mode | backend |
| pb | 플레이북 2개 | backend |
| lev | build-the-lever | backend |
| me | encode-lessons-in-structure | backend |
| cite | 답변 속 인용 | frontend |
| pm > me | 두 번째 지시 | |
| pb > me | 단계 근거 | |
| lev > me | 구별 | dashed |
| me > cite | 바뀐 선택 | emphasis |

| rel-id | 받는 것 | 넘기는 것 | 조건 |
| --- | --- | --- | --- |
| r12 | `poteto-mode`의 원칙 목록 | 답변 속 원칙 이름과 바뀐 선택 | 같은 지시를 두 번째로 쓸 때 |
| r12 플레이북 표 | `orchestrate`, `worktree-cleanup` | 단계의 근거 | 위 "언제 켜지나" 표의 조건 |
| r105 | `principle-build-the-lever`의 구별 문장 | - | 반복 지시의 영구 장치와 눈앞 일의 도구를 구별할 때[](source:lever) |

원장에는 없지만 이 원칙을 이름으로 언급하는 곳이 더 있다(rel-id 없음).

- `authoring-a-skill` 플레이북: 타입, README, 설정 같은 구조적 출처를 가리키라고 한다.[](source:pb-skill)
- `multi-phase-plan` 플레이북 6단계: `check-plan.mjs`를 돌려 나온 줄을 모두 고친다.[](source:pb-plan)
- `figure-it-out`: 되풀이되는 교정을 관문, 린트 규칙, 검사, 스크립트로 바꾼다.[](source:fio)
- `reflect`: 장치로 더 잘 지킬 수 있는 항목을 `Accepted`에서 `Backlog`로 옮긴다.[](source:reflect)
- `show-me-your-work`: 손으로 만든 일회성 근거보다 commit된 스크립트가 낸 근거를 고른다.[](source:smyw)
- `architect` runner 프롬프트: 불변식은 쓰기 어려운 타입, 런타임 검사, 주석 순으로 담는다.[](source:runner)

전체 흐름은 `pstack/_group-principles/principles.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `pstack/principle-encode-lessons-in-structure/SKILL.md` 전체. 호출 측은 `pstack/poteto-mode/SKILL.md` 15, 40, 79줄과 위에 인용한 줄만 확인했다.
- 원장 밖 언급 검색: `pstack/` 아래 원본 `.md`에서 이 원칙의 이름과 제목을 찾았다. 원장 밖 언급은 6곳이다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: `verification-skills/pstack/principle-encode-lessons-in-structure/SKILL.md`와 원문 동일(`shasum` 일치). 소속 묶음과 호출 측은 `pstack/` 경로 기준으로 확인했다.
- 실제로 실행해 보지 않았다. 페이지에 쓴 동작은 모두 원문이 지시하는 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
일회성 교정을 보낼 "brain note"가 어느 파일이나 저장소를 뜻하는지 원문에 명시 없음. "같은 지시를 두 번째로" 쓴다는 것을 세션 안에서 세는지, 세션을 넘어 세는지도 원문에 명시 없음.
