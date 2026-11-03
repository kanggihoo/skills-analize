# setup-pstack 스킬은 에이전트를 어떻게 바꾸나 {#setup-pstack-skill}

`setup-pstack`을 쓰면 에이전트는 쓸 수 있는 모델을 먼저 확인한다. 그다음 사용자에게 예산과 역할별 모델을 확인받고 `~/.cursor/rules/pstack-models.mdc`를 통째로 다시 쓴다.[](source:purpose)[](source:s5)

- 확인하지 않은 실제 모델 이름(slug)은 절대 쓰지 않는다. `inherit-parent`와 `auto`만 예외로 항상 허용한다.[](source:s1)[](source:s4)
- 사람 확인은 두 번이다. 예산 네 가지 중 하나를 묻고, 역할 표를 보여 주고 그대로 쓸지 바꿀지 묻는다.[](source:s3a)[](source:s3c)
- 이 파일은 항상 적용되는 규칙이다. 다른 pstack 스킬은 서브에이전트를 띄울 때 여기서 자기 역할 줄을 읽는다.[](source:pm-models)
- 끝으로 앱을 직접 돌릴 수단이 없으면 `/create-verification-skill`을 한 번만 제안한다.[](source:s7)

@answer scope="pstack/setup-pstack · 원본 텍스트 파일 1개 · 커밋 5760176"
@meta locale=ko
@source fm title="pstack/setup-pstack/SKILL.md · 5548B · 본문(frontmatter)" path=pstack/setup-pstack/SKILL.md lines=1:4
@source purpose title="pstack/setup-pstack/SKILL.md · 목적" path=pstack/setup-pstack/SKILL.md lines=8:8
@source s1 title="pstack/setup-pstack/SKILL.md · 1. 모델 확인" path=pstack/setup-pstack/SKILL.md lines=12:14
@source s2 title="pstack/setup-pstack/SKILL.md · 2. 현재 상태 읽기" path=pstack/setup-pstack/SKILL.md lines=16:18
@source s3a title="pstack/setup-pstack/SKILL.md · 3(a) 예산 질문" path=pstack/setup-pstack/SKILL.md lines=22:27
@source s3b title="pstack/setup-pstack/SKILL.md · 3(b) 예산 적용" path=pstack/setup-pstack/SKILL.md lines=29:29
@source s3c title="pstack/setup-pstack/SKILL.md · 3(c) 역할 확인" path=pstack/setup-pstack/SKILL.md lines=31:31
@source s4 title="pstack/setup-pstack/SKILL.md · 4. 검증" path=pstack/setup-pstack/SKILL.md lines=33:35
@source s5 title="pstack/setup-pstack/SKILL.md · 5. 규칙 쓰기" path=pstack/setup-pstack/SKILL.md lines=37:39
@source shape title="pstack/setup-pstack/SKILL.md · 규칙 파일 모양" path=pstack/setup-pstack/SKILL.md lines=42:65
@source s6 title="pstack/setup-pstack/SKILL.md · 6. 완료 알림" path=pstack/setup-pstack/SKILL.md lines=68:70
@source s7 title="pstack/setup-pstack/SKILL.md · 7. 검증 스킬 제안" path=pstack/setup-pstack/SKILL.md lines=72:74
@source help-only title="pstack/poteto-help/SKILL.md · 사용자 말로 켜지는 스킬" path=pstack/poteto-help/SKILL.md lines=36:36
@source help-setup title="pstack/poteto-help/SKILL.md · 설치 2단계" path=pstack/poteto-help/SKILL.md lines=33:33
@source help-state title="pstack/poteto-help/SKILL.md · 규칙 파일 유무" path=pstack/poteto-help/SKILL.md lines=27:27
@source help-cost title="pstack/poteto-help/SKILL.md · 비용 안내" path=pstack/poteto-help/SKILL.md lines=38:38
@source pm-models title="pstack/poteto-mode/SKILL.md · Task 기본값과 역할 줄" path=pstack/poteto-mode/SKILL.md lines=95:95
@source how-models title="pstack/how/SKILL.md · 역할 줄 읽기" path=pstack/how/SKILL.md lines=11:11
@source why-models title="pstack/why/SKILL.md · 역할 줄 읽기" path=pstack/why/SKILL.md lines=13:13
@source reflect-models title="pstack/reflect/SKILL.md · 역할 줄 읽기" path=pstack/reflect/SKILL.md lines=33:33
@source arena-runners title="pstack/arena/SKILL.md · arena runners 줄" path=pstack/arena/SKILL.md lines=28:28
@source arena-judge title="pstack/arena/SKILL.md · cross-judge pool 줄" path=pstack/arena/SKILL.md lines=41:41
@source swarm-models title="pstack/swarm/SKILL.md · swarm workers 줄" path=pstack/swarm/SKILL.md lines=25:25
@source architect-models title="pstack/architect/SKILL.md · architect runners 줄" path=pstack/architect/SKILL.md lines=33:33
@source interrogate-models title="pstack/interrogate/SKILL.md · interrogate reviewers 줄" path=pstack/interrogate/SKILL.md lines=36:36
@source cvs-fm title="pstack/create-verification-skill/SKILL.md · frontmatter" path=pstack/create-verification-skill/SKILL.md lines=1:4

## 언제 켜지나 {#trigger}

@code source=fm language=yaml

`pstack` 스킬 중 이 스킬에만 `disable-model-invocation`이 없다.[](source:fm) 그래서 사용자가 `/setup-pstack`을 입력하지 않아도 모델이 대화를 보고 이 스킬을 켤 수 있다.

`poteto-help`도 "사용자 말만으로 켜지는 스킬은 `/setup-pstack`뿐"이라고 안내한다.[](source:help-only) `description`에 적힌 "configure pstack models", "pstack budget" 같은 표현은 모델이 판단할 때 참고하는 예다. 이 문구가 있어야만 켜진다는 뜻은 아니다.

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/setup-pstack` 입력, 또는 모델 선택·예산을 바꾸려는 요청[](source:fm) |
| `poteto-help` | 설치 안내의 2단계. 비용이 걱정이면 작은 예산이나 싼 모델로 다시 돌리라고 안내한다[](source:help-setup)[](source:help-cost) |

## 실행하면 어떻게 진행하나 {#flow}

@workflow id=setup-flow title="setup-pstack 진행 흐름"
| detect | 모델 확인 | backend |
| load | 현재 상태 | backend |
| ask | 예산·역할 | frontend |
| valid | 모두 확인? | backend |
| write | 규칙 쓰기 | database |
| offer | 검증 제안 | frontend |
| detect > load | | |
| load > ask | | |
| ask > valid | | emphasis |
| valid > write | 예 | emphasis |
| valid > ask | 아니오 | dashed |
| write > offer | | |

@steps id=setup-steps
| st-detect | 모델 확인 | 이 세션에서 `Task` 서브에이전트에 넘길 수 있는 모델 이름을 나열한다. 이것이 믿을 만한 출처다. 사용자가 쓸 수 있는 모델 목록을 주는 API나 CLI 도구가 Cursor 쪽에 있으면 그쪽을 우선한다. 하나도 못 찾으면 사용자에게 쓸 수 있는 이름을 붙여 넣어 달라고 한다. | setup-flow | detect |
| st-load | 현재 상태 | 규칙 파일이 있으면 읽고 `# budget` 줄과 역할 값을 현재 선택으로 삼는다. 없으면 5단계 모양의 기본값에서 시작한다. 5단계에 없는 역할 줄(예: `how critics`)은 은퇴한 역할이라 버린다. | setup-flow | load |
| st-ask | 예산·역할 | 예산을 묻고, 예산을 적용한 역할 표를 보여 준 뒤 그대로 쓸지 바꿀지 묻는다. 두 질문 모두 자유 입력보다 `AskQuestion`을 우선한다. 자세한 규칙은 아래 패널에 있다. | setup-flow | ask |
| st-valid | 모두 확인? | 쓸 실제 모델 이름은 모두 1단계에서 확인한 것이어야 한다. 고른 이름이 없으면 멈추고 다시 묻는다. | setup-flow | valid |
| st-write | 규칙 쓰기 | `alwaysApply: true`, `# budget` 줄, 역할마다 한 줄을 쓴다. 다시 돌려도 결과가 같도록 파일 전체를 덮어쓴다. 사용자에게 규칙이 새 세션부터 적용되고 다시 돌리면 갱신된다고 알린다(6단계). | setup-flow | write |
| st-offer | 검증 제안 | 프로젝트에 `verify-*` 스킬이나 앱 하네스가 없으면 검증 스킬 생성을 딱 한 번 제안한다. 예라고 하면 `/create-verification-skill`을 실행하고, 아니라고 하면 더 권하지 않고 넘어간다. | setup-flow | offer |

이 흐름은 `SKILL.md`의 1~7단계를 그대로 옮긴 것이다. 1단계는 모델 확인, 2단계는 현재 상태, 3단계는 예산·역할, 4단계는 검증, 5·6단계는 규칙 쓰기, 7단계는 검증 제안이다.[](source:s1)[](source:s2)[](source:s4)[](source:s6)[](source:s7)

## 예산과 역할은 어떻게 정하나 {#budget}

예산 질문은 아래 네 라벨을 원문 그대로 보여 준다. 규칙에 기록된 예산이 있으면 현재 예산이 무엇인지도 말한다.[](source:s3a)

| 예산 라벨 | 실제 모델 이름의 추론 강도 |
| --- | --- |
| `unlimited — keep max` | 작업 표 그대로 둔다 |
| `large — xhigh reasoning` | 모두 `xhigh`로 맞춘다 |
| `medium — high reasoning` | 모두 `high`로 맞춘다 |
| `small — medium reasoning` | 모두 `medium`으로 맞춘다 |

예산을 적용하는 규칙은 다음과 같다.[](source:s3b)

- 작업 표는 스킬 기본값에서 만든다. 다시 돌릴 때는 사용자가 계열·목록·별칭으로 바꿔 둔 역할을 유지한다.
- 추론 강도(effort)는 모델 이름의 마지막 토큰이다. 끝에 `fast`가 붙으면 그 앞 토큰이다. 패널 목록 안의 이름도 모두 바꾼다.
- 바꾼 이름이 확인된 모델에 없으면 같은 계열에서 목표 이하 중 가장 높은 추론 강도를 고른다. 그것도 없으면 그 역할을 "선택 필요"로 표시한다.
- `inherit-parent`와 `auto`는 바꾸지 않는다.

@facts
| 추론 강도 순서 | `max` > `xhigh` > `high` > `medium` > `low` |
| 예: `small` 적용 | `claude-opus-5-5-max` → `claude-opus-5-5-medium` |
| 예: `small` 적용 | `grok-4.7-xhigh-fast` → `grok-4.7-medium-fast` |

역할 표를 확인받을 때 보여 주는 것과 고를 수 있는 것은 다음과 같다.[](source:s3c)

- 모든 역할과 모델을 보이고, 확인되지 않은 이름은 "선택 필요"로 표시한다. 2단계에서 버린 줄도 함께 보여 준다.
- 선택지는 확인된 모델과 `inherit-parent`, `auto`다. 두 별칭은 그 역할을 부모 채팅의 모델로 돌린다.
- 이 별칭 덕분에 `Auto` 사용자는 `Auto`에 머무를 수 있다.

| 역할 종류 | 값의 뜻 |
| --- | --- |
| 패널 역할(`arena runners`, `architect runners`, `interrogate reviewers`) | 목록이다. 항목마다 서브에이전트가 하나씩 돈다. 별칭 항목도 하나로 센다. 그래서 목록 길이가 개수를 정한다[](source:s3c) |
| `arena cross-judge pool` | 목록이지만 `arena`가 하나만 고른다. 가능하면 부모와 다른 계열을 고른다[](source:s3c) |
| `swarm workers` | 모든 작업자의 기본 모델이다. 경주나 비교에서 갈래마다 모델을 따로 주면 그것을 쓴다[](source:s3c) |

## 무엇을 쓰고 누가 읽나 {#rule-file}

@code source=shape language=yaml

| 역할 줄 | 읽는 곳 | rel-id |
| --- | --- | --- |
| `feature, refactoring`, `bug-fix`, `perf-issue`, `hillclimb`, `hardest tasks`, `judgment and prose` | `poteto-mode`의 플레이북 코드 작업과 판단·글쓰기[](source:pm-models) | r14 |
| `how explorer`, `how explainer` | `how`[](source:how-models) | r30 |
| `why investigators`, `why synthesizer` | `why`[](source:why-models) | r31 |
| `arena runners`, `arena cross-judge pool` | `arena`[](source:arena-runners)[](source:arena-judge) | r32 |
| `swarm workers` | `swarm`[](source:swarm-models) | r33 |
| `architect runners` | `architect`(`arena runners` 대신)[](source:architect-models) | r34 |
| `interrogate reviewers` | `interrogate`[](source:interrogate-models) | r35 |
| `reflect tooling`, `reflect judgment, divergent, synthesizer` | `reflect`[](source:reflect-models) | r36 |

읽는 쪽 스킬은 모두 같은 규칙을 따른다. 파일이나 줄이 없으면 자기 기본값을 쓰고, 값이 `auto`나 `inherit-parent`면 `model`을 비운다.[](source:how-models)[](source:pm-models) 줄 하나를 지우면 그 역할은 스킬 기본값으로 돌아간다.[](source:shape)

@callout level=warning title="파일 전체를 덮어쓴다"
5단계는 다시 돌려도 결과가 같도록 파일을 통째로 다시 쓴다.[](source:s5) 2단계에서 버린 은퇴 역할 줄은 새 파일에 남지 않는다.[](source:s2) 판정: 사용자가 이 파일에 손으로 넣은 다른 줄이나 주석도 사라진다. 원문은 버린 줄을 3단계에서 보여 주라고만 한다.[](source:s3c)

새 규칙은 새 세션부터 적용된다.[](source:s6) 그래서 모델을 바꿨는데 효과가 없으면 새 채팅을 열어야 한다. 규칙 파일이 없으면 모든 역할이 기본 모델을 쓴다.[](source:help-state)

## 흐름 속 위치 {#position}

@workflow id=setup-position title="setup-pstack 앞뒤의 스킬"
| prev | 사용자·안내 | external |
| setup | setup-pstack | backend |
| rule | 모델 규칙 | database |
| cvs | 검증 스킬 | backend |
| prev > setup | 설정 요청 | |
| setup > rule | 쓰기 | emphasis |
| setup > cvs | 예일 때 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `poteto-help`의 설치·비용 안내 | - | 설치 2단계, 규칙 파일이 없을 때 | r21 |
| 규칙 쓰기 완료(코드·판단 줄) | 역할별 모델(`pstack-models.mdc`) → `poteto-mode` | 역할 줄이 기본값을 덮어쓴다 | r14 |
| 규칙 쓰기 완료(스킬별 줄) | 역할별 모델 → `how`, `why`, `arena`, `swarm`, `architect`, `interrogate`, `reflect` | 줄이 없으면 각 스킬 기본값 | r30–r36 |
| 7단계 제안에 대한 사용자 답 | `/create-verification-skill` 실행 | 앱을 돌릴 수단이 없고 사용자가 예라고 할 때만. 제안은 한 번 | r37 |

`setup-pstack`은 두 묶음에 속한다. 작업 준비 단계로는 `pstack/_group-run/run.html`, 검증 도구를 만드는 입구로는 `pstack/_group-verify-harness/verify-harness.html`을 본다. 공유 상태는 순서 관계가 아니다. 이 파일을 쓴 뒤 다른 스킬이 꼭 이어서 도는 것은 아니다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md` 하나. 이 스킬 폴더의 원본 텍스트 파일은 이것뿐이다.
- 대조용으로 읽은 줄: `poteto-help`, `poteto-mode`, `how`, `why`, `reflect`, `arena`, `swarm`, `architect`, `interrogate`, `create-verification-skill`의 해당 줄. 출처 목록에 줄 범위가 있다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다.
- 실제로 실행해 보지 않았다. 모델 확인, 규칙 쓰기, 검증 스킬 제안은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
다시 돌릴 때 "계열·목록·별칭으로 바꾼 역할을 유지한다"에서 계열로 바꿨다는 것을 어떻게 알아내는지는 원문에 명시 없음. 이전 규칙과 기본값을 비교한다고 짐작할 뿐이다.
모델 계열(family)의 경계도 원문에 명시 없음. 예시는 `claude-opus-5-5`, `grok-4.7` 앞부분을 같은 계열로 다룬다.
`arena cross-judge pool`과 `swarm workers`에도 예산의 추론 강도 변경이 적용되는지는 "패널 항목 포함, 모든 실제 이름"이라는 문장으로만 읽힌다. 판정: 적용된다.
