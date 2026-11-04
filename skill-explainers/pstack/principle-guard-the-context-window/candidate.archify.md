# principle-guard-the-context-window 스킬은 에이전트를 어떻게 바꾸나 {#guard-context-skill}

`principle-guard-the-context-window`를 읽은 에이전트는 컨텍스트 창을 세션 안에서 다시 채울 수 없는 자원으로 다룬다. 큰 출력은 서브에이전트에게 보내고, 메인 스레드에는 요약만 남긴다.[](source:rule)[](source:p-isolate)

- 원문의 이유: 컨텍스트가 넘치면 추론 품질이 떨어지고, 압축 흔적이 생기고, 진행이 멈춘다.[](source:why)
- 큰 출력, 스크린샷, 큰 문서는 서브에이전트가 읽는다. 메인 컨텍스트는 원자료가 아니라 요약을 받는다.[](source:p-isolate)
- 매번 쓰는 템플릿과 참고 자료는 스킬 파일 안에 둔다. 따로 두면 읽을 때마다 비용이 든다.[](source:p-inline)
- 에이전트는 단계 크기를 정하고 범위에 상한을 둔다. 단계당 파일 수를 제한하고 턴 예산을 정한다.[](source:p-cap)

@answer scope="pstack/principle-guard-the-context-window · SKILL.md 1개와 호출 측 줄 · 커밋 5760176"
@meta locale=ko
@source fm title="pstack/principle-guard-the-context-window/SKILL.md · 939B · 원칙 본문(frontmatter)" path=pstack/principle-guard-the-context-window/SKILL.md lines=1:5
@source rule title="pstack/principle-guard-the-context-window/SKILL.md · 규칙" path=pstack/principle-guard-the-context-window/SKILL.md lines=9:9
@source why title="pstack/principle-guard-the-context-window/SKILL.md · 이유" path=pstack/principle-guard-the-context-window/SKILL.md lines=11:11
@source p-isolate title="pstack/principle-guard-the-context-window/SKILL.md · 큰 출력 격리" path=pstack/principle-guard-the-context-window/SKILL.md lines=14:14
@source p-inline title="pstack/principle-guard-the-context-window/SKILL.md · 자주 쓰는 내용은 안에" path=pstack/principle-guard-the-context-window/SKILL.md lines=15:15
@source p-cap title="pstack/principle-guard-the-context-window/SKILL.md · 단계 크기와 상한" path=pstack/principle-guard-the-context-window/SKILL.md lines=16:16
@source pm-cite title="pstack/poteto-mode/SKILL.md · 20559B · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙 목록 머리말" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-trigger title="pstack/poteto-mode/SKILL.md · Delegation 목록의 이 원칙 줄" path=pstack/poteto-mode/SKILL.md lines=74:74
@source pb-pickup title="pstack/poteto-mode/playbooks/session-pickup.md · 1678B · 1단계" path=pstack/poteto-mode/playbooks/session-pickup.md lines=5:5
@source pb-trace title="pstack/poteto-mode/playbooks/trace-forensics.md · 1865B · 1단계" path=pstack/poteto-mode/playbooks/trace-forensics.md lines=7:7
@source pb-worktree title="pstack/poteto-mode/playbooks/worktree-cleanup.md · 2932B · 3단계" path=pstack/poteto-mode/playbooks/worktree-cleanup.md lines=7:7
@source mrl title="pstack/principle-minimize-reader-load/SKILL.md · 2095B · 사람 독자판" path=pstack/principle-minimize-reader-load/SKILL.md lines=13:13
@source pb-hill title="pstack/poteto-mode/playbooks/hillclimb.md · 4403B · 시도 위임" path=pstack/poteto-mode/playbooks/hillclimb.md lines=12:12
@source pb-plan title="pstack/poteto-mode/playbooks/multi-phase-plan.md · 12977B · 3단계" path=pstack/poteto-mode/playbooks/multi-phase-plan.md lines=7:7
@source pb-runtime title="pstack/poteto-mode/playbooks/runtime-forensics.md · 1210B · 2단계" path=pstack/poteto-mode/playbooks/runtime-forensics.md lines=6:6

## 언제 켜지나 {#trigger}

@code source=fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:fm) 사용자가 `/principle-guard-the-context-window`를 입력하거나, 다른 스킬이 이 원칙을 읽으라고 할 때 켜진다. `description`은 이 원칙이 어떤 상황에 맞는지 알려 주는 설명이다.

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-guard-the-context-window` 입력 |
| `poteto-mode` (Delegation 분류) | 컨텍스트가 찰 때: 큰 출력, 긴 파일, 반복 읽기, 병렬 분할 계획[](source:pm-trigger) |
| `session-pickup` 플레이북 | 긴 대화 기록을 서브에이전트에서 파싱하고 줄인 타임라인만 남길 때[](source:pb-pickup) |
| `trace-forensics` 플레이북 | 큰 트레이스 파일을 서브에이전트에서 파싱할 때[](source:pb-trace) |
| `worktree-cleanup` 플레이북 | 대화 기록을 읽는 서브에이전트를 여러 갈래로 나눠 돌릴 때[](source:pb-worktree) |

`poteto-mode`는 에이전트가 원칙을 적용하기 전에 그 원칙의 `SKILL.md`를 끝까지 읽게 한다.[](source:pm-read) 에이전트는 답변에서 결정을 바꾼 원칙과 바뀐 선택을 밝히고, 이번 세션에 읽은 원칙만 인용한다.[](source:pm-cite)

## 무엇을 강제하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 모든 토큰이 그 비용만큼 값어치를 해야 한다[](source:rule) | 판단 기준 |
| 장황한 출력, 스크린샷, 큰 문서는 서브에이전트에게 보낸다[](source:p-isolate) | 의무 |
| 메인 컨텍스트는 원자료가 아니라 요약을 받는다[](source:p-isolate) | 의무 |
| 매번 쓰는 템플릿과 참고 자료는 따로 떼지 말고 스킬 파일 안에 둔다[](source:p-inline) | 의무 |
| 단계당 파일 수를 제한한다[](source:p-cap) | 의무 |
| 턴 예산을 정한다[](source:p-cap) | 의무 |
| 장치 자체가 쓰는 비용도 계산에 넣는다[](source:p-cap) | 의무 |

원문은 상한의 수치를 주지 않는다. 단계당 파일 몇 개, 턴 몇 번이 적당한지는 원문에 명시 없음.[](source:p-cap) 이 원칙을 적용하지 않는 경우도 원문에 명시 없음.

## 흐름 속 위치 {#position}

@workflow id=guard-position title="guard-the-context-window 앞뒤"
| pm | poteto-mode | backend |
| pb | 플레이북 3개 | backend |
| mrl | minimize-reader-load | backend |
| me | guard-the-context-window | backend |
| cite | 답변 속 인용 | frontend |
| pm > me | 컨텍스트 참 | |
| pb > me | 큰 자료 | |
| mrl > me | 사람 독자판 | |
| me > cite | 바뀐 선택 | emphasis |

| rel-id | 받는 것 | 넘기는 것 | 조건 |
| --- | --- | --- | --- |
| r12 | `poteto-mode`의 원칙 목록 | 답변 속 원칙 이름과 바뀐 선택 | 컨텍스트가 찰 때 |
| r12 플레이북 표 | `session-pickup`, `trace-forensics`, `worktree-cleanup` | 큰 자료를 서브에이전트로 보내는 근거 | 위 "언제 켜지나" 표의 조건 |
| r107 | `principle-minimize-reader-load`의 비유 | - | 그 원칙이 자신을 이 원칙의 사람 독자판이라고 부른다[](source:mrl) |

원장에는 없지만 이 원칙을 이름으로 언급하는 플레이북이 더 있다(rel-id 없음).

- `hillclimb`: 시도를 서브에이전트에게 맡기고, 직접 치지 말고 `diff`를 리뷰한다.[](source:pb-hill)
- `multi-phase-plan` 3단계: 탐색을 서브에이전트에서 하고 파일 포인터만 돌려받는다. 통째로 붙인 덤프는 받지 않는다.[](source:pb-plan)
- `runtime-forensics` 2단계: 큰 산출물을 서브에이전트에서 파싱하고 줄인 결과만 남긴다.[](source:pb-runtime)

전체 흐름은 `pstack/_group-principles/principles.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `pstack/principle-guard-the-context-window/SKILL.md` 전체. 호출 측은 `pstack/poteto-mode/SKILL.md` 15, 40, 74줄과 위에 인용한 줄만 확인했다.
- 원장 밖 언급 검색: `pstack/` 아래 원본 `.md`에서 이 원칙의 이름과 제목을 찾았다. 원장 밖 언급은 3곳이다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다.
- 실제로 실행해 보지 않았다. 페이지에 쓴 동작은 모두 원문이 지시하는 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"컨텍스트가 찬다"고 볼 기준(토큰 비율, 파일 크기)은 원문에 명시 없음. "장치 비용(mechanism costs)"이 서브에이전트를 띄우는 비용을 뜻하는지도 원문에 명시 없음.
