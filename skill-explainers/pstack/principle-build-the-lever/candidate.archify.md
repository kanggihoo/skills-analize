# principle-build-the-lever 스킬은 에이전트를 어떻게 바꾸나 {#build-the-lever-skill}

`principle-build-the-lever`를 읽은 에이전트는 사소하지 않은 일을 손으로 하지 않는다. 먼저 그 일을 하거나 증명하는 도구(지렛대)를 만든다. 도구에는 코드모드, 스크립트, 생성기, 서브에이전트가 따르는 스킬이 든다.[](source:rule)

- 원문이 드는 이득은 둘이다. 도구는 매번 같은 방식으로 일하고 공짜로 다시 돈다. 리뷰어는 도구 하나를 읽고 다시 돌려서 확인한다.[](source:why)
- 도구를 만들지 말지는 일이 반복되는지가 아니라 사소한지로 정한다. 한눈에 보이는 뻔한 수정 두어 개만 예외다.[](source:pattern)[](source:balance)
- 에이전트가 이 원칙을 적용하면 도구 파일이 남는다. 원칙을 인용했는데 `diff`에 도구가 없으면 적용하지 않은 것이다.[](source:p-proof)
- 도구는 가장 작은 스크립트로 만든다. 프레임워크를 만들지 않는다.[](source:balance)

@answer scope="pstack/principle-build-the-lever · SKILL.md 1개와 호출 측 줄 · 커밋 5760176"
@meta locale=ko
@source fm title="pstack/principle-build-the-lever/SKILL.md · 2458B · 원칙 본문(frontmatter)" path=pstack/principle-build-the-lever/SKILL.md lines=1:5
@source rule title="pstack/principle-build-the-lever/SKILL.md · 규칙" path=pstack/principle-build-the-lever/SKILL.md lines=8:8
@source why title="pstack/principle-build-the-lever/SKILL.md · 이유" path=pstack/principle-build-the-lever/SKILL.md lines=10:10
@source pattern title="pstack/principle-build-the-lever/SKILL.md · 기본값과 예외" path=pstack/principle-build-the-lever/SKILL.md lines=12:12
@source p-first title="pstack/principle-build-the-lever/SKILL.md · 첫 단위는 손으로" path=pstack/principle-build-the-lever/SKILL.md lines=14:15
@source p-fanout title="pstack/principle-build-the-lever/SKILL.md · 나눠 맡기기와 도구" path=pstack/principle-build-the-lever/SKILL.md lines=16:17
@source p-proof title="pstack/principle-build-the-lever/SKILL.md · 적용했다는 증거, 커밋" path=pstack/principle-build-the-lever/SKILL.md lines=18:19
@source balance title="pstack/principle-build-the-lever/SKILL.md · 균형" path=pstack/principle-build-the-lever/SKILL.md lines=21:21
@source distinct title="pstack/principle-build-the-lever/SKILL.md · 다른 원칙과의 구별" path=pstack/principle-build-the-lever/SKILL.md lines=23:23
@source pm-cite title="pstack/poteto-mode/SKILL.md · 20559B · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙 목록 머리말" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-trigger title="pstack/poteto-mode/SKILL.md · Core 목록의 이 원칙 줄" path=pstack/poteto-mode/SKILL.md lines=53:53
@source pb-worktree title="pstack/poteto-mode/playbooks/worktree-cleanup.md · 2932B · 1단계" path=pstack/poteto-mode/playbooks/worktree-cleanup.md lines=5:5
@source attack title="pstack/principle-attack-the-premise/SKILL.md · 1941B · 집계 스크립트" path=pstack/principle-attack-the-premise/SKILL.md lines=15:15
@source pb-hill title="pstack/poteto-mode/playbooks/hillclimb.md · 4403B · 2단계" path=pstack/poteto-mode/playbooks/hillclimb.md lines=8:8
@source svu title="pstack/principle-sequence-verifiable-units/SKILL.md · 1705B · 보완 원칙 문장" path=pstack/principle-sequence-verifiable-units/SKILL.md lines=17:17

## 언제 켜지나 {#trigger}

@code source=fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:fm) 사용자가 `/principle-build-the-lever`를 입력하거나, 다른 스킬이 이 원칙을 읽으라고 할 때 켜진다. `description`은 이 원칙이 어떤 상황에 맞는지 알려 주는 설명이다. 이 원칙은 대량 작업만이 아니라 수정, 이전, 분석, 검사 모두에 적용한다고 스스로 밝힌다.[](source:fm)

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-build-the-lever` 입력 |
| `poteto-mode` (Core 분류) | 사소하지 않은 모든 작업[](source:pm-trigger) |
| `worktree-cleanup` 플레이북 | 1단계에서 감사 스크립트를 돌릴 때[](source:pb-worktree) |

`poteto-mode`는 에이전트가 원칙을 적용하기 전에 그 원칙의 `SKILL.md`를 끝까지 읽게 한다.[](source:pm-read) 에이전트는 답변에서 결정을 바꾼 원칙과 바뀐 선택을 밝히고, 이번 세션에 읽은 원칙만 인용한다.[](source:pm-cite)

## 무엇을 강제하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 기본값은 도구를 만드는 것이다. 한눈에 보이는 뻔한 수정 두어 개일 때만 건너뛴다[](source:pattern) | 의무(예외 1개) |
| 첫 단위는 손으로 해서 방법을 익힌 뒤 도구를 만든다[](source:p-first) | 의무 |
| 도구를 그 단위에 다시 돌려, 손으로 한 결과와 `diff`로 비교해 증명한다[](source:p-first) | 의무 |
| 도구는 다시 돌려도 안전하게 만든다[](source:p-first) | 의무 |
| 수정에는 코드모드나 스크립트, 반복 파일에는 생성기, 분석에는 sqlite 덤프 쿼리, 검증에는 다시 도는 검사[](source:p-first) | 예시 |
| 도구가 한 번에 모든 단위를 처리하면 직접 돌린다. 스크립트로 되는 일을 서브에이전트에게 손으로 시키지 않는다[](source:p-fanout) | 금지 |
| 서브에이전트에게 나눠 줄 때는 방법, 검증 계약, 손대지 말 경계를 스킬 하나에 쓴다[](source:p-fanout) | 의무 |
| 그 스킬은 서브에이전트의 쓰기 범위 밖에 둔다. 계약을 몰래 고치지 못하게 한다[](source:p-fanout) | 의무 |
| 원칙을 인용했는데 `diff`에 도구 파일이 없으면 적용하지 않은 것이다[](source:p-proof) | 판정 기준 |
| 작업이 세션보다 오래 가면 도구를 commit한다[](source:p-proof) | 의무 |
| 일회성 작업이라도 도구가 검증을 가능하게 하면 만든다[](source:balance) | 의무 |

원문은 손으로 한 변경과 도구를 이렇게 대비한다.[](source:why)

| 비교 | 손으로 한 변경 | 도구 |
| --- | --- | --- |
| 다시 확인하는 법 | {bad:다시 해 봐야 함} | {good:다시 돌림} |
| 리뷰어에게 주는 말 | "믿어 달라" | "이걸 돌려 보라" |

이 원칙은 `principle-encode-lessons-in-structure`와 다르다. 그쪽은 되풀이되는 지시를 오래가는 장치로 바꾼다. 이쪽은 지금 하는 일의 처리량과 리뷰 가능성을 다룬다. 검증 자체를 스크립트로 만드는 일은 원문이 `principle-prove-it-works`를 보라고 한다.[](source:distinct)

## 흐름 속 위치 {#position}

@workflow id=lever-position title="build-the-lever 앞뒤"
| pm | poteto-mode | backend |
| pb | 플레이북 | backend |
| atk | attack-the-premise | backend |
| me | build-the-lever | backend |
| lazy | laziness-protocol | backend |
| cite | 답변 속 인용 | frontend |
| pm > me | 사소하지 않음 | |
| pb > me | 감사 스크립트 | |
| atk > me | 집계 | |
| me > lazy | 작은 스크립트 | |
| me > cite | 바뀐 선택 | emphasis |

| rel-id | 받는 것 | 넘기는 것 | 조건 |
| --- | --- | --- | --- |
| r12 | `poteto-mode`의 원칙 목록 | 답변 속 원칙 이름과 바뀐 선택 | 사소하지 않은 모든 작업 |
| r12 플레이북 표 | `worktree-cleanup` 1단계 | 감사 스크립트 실행 | 디스크 정리 전 감사 |
| r100 | `principle-attack-the-premise`의 집계 | - | 집계를 다시 돌릴 수 있는 스크립트로 쓸 때[](source:attack) |
| r104 | - | `principle-laziness-protocol` 참고 | 프레임워크 말고 가장 작은 스크립트 |
| r105 | - | `principle-encode-lessons-in-structure`, `principle-prove-it-works` 참고 | 두 원칙과 구별할 때. 그림에서는 생략 |

원장에는 없지만 이 원칙을 이름으로 언급하는 곳이 더 있다(rel-id 없음).

- `hillclimb` 플레이북 2단계는 측정 도구를 만들고 민감도를 증명한 뒤 고정할 때 이 원칙을 든다.[](source:pb-hill)
- `principle-sequence-verifiable-units`는 단위마다 하는 검사를 싸게 만드는 원칙으로 이 원칙을 든다.[](source:svu)

전체 흐름은 `pstack/_group-principles/principles.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `pstack/principle-build-the-lever/SKILL.md` 전체. 호출 측은 `pstack/poteto-mode/SKILL.md` 15, 40, 53줄과 위에 인용한 줄만 확인했다.
- 원장 밖 언급 검색: `pstack/` 아래 원본 `.md`에서 이 원칙의 이름과 제목을 찾았다. 원장 밖 언급은 2곳이다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다.
- 실제로 실행해 보지 않았다. 페이지에 쓴 동작은 모두 원문이 지시하는 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"사소하다"의 경계는 "한눈에 보이는 뻔한 수정 두어 개"라는 표현뿐이다. 파일 수나 줄 수 같은 수치 기준은 원문에 명시 없음.
