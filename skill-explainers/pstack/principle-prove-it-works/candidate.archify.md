# principle-prove-it-works 스킬은 에이전트를 어떻게 바꾸나 {#prove-skill}

이 원칙을 적용하면 에이전트는 "끝났다"고 말하기 전에 실물을 직접 확인한다. 기능을 돌려 보고, 실제 값을 읽고, `diff`를 열어 본다. "컴파일된다"나 자기 보고는 근거로 쓰지 않는다.[](source:skill-fm)[](source:skill-intro)

- 파일 수정 시각, 출력의 최신 여부, 에이전트의 자기 보고, 캐시된 스크린샷은 대리 근거다. 싸 보이지만 틀린 추론의 비용이 더 크다.[](source:skill-why)
- 검증이 실패하면 시스템보다 관찰 방법을 먼저 의심한다.[](source:skill-real)
- 가장 강한 증명은 같은 비교를 다시 돌리는 결정적 스크립트다. 출력은 리뷰어가 다시 돌릴 수 있는 산출물로 남긴다.[](source:skill-script)
- 산출물은 사람이 볼 수 있게 둔다. 커밋은 나중에 감사해야 할 큰 작업일 때만 한다.[](source:skill-commit)

@answer scope="SKILL.md 1개와 참조 위치 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/principle-prove-it-works/SKILL.md · 1371B · frontmatter" path=pstack/principle-prove-it-works/SKILL.md lines=1:5
@source skill-intro title="SKILL.md · 도입부" path=pstack/principle-prove-it-works/SKILL.md lines=9:9
@source skill-why title="SKILL.md · Why" path=pstack/principle-prove-it-works/SKILL.md lines=11:11
@source skill-real title="SKILL.md · 실물 확인 목록" path=pstack/principle-prove-it-works/SKILL.md lines=13:16
@source skill-script title="SKILL.md · Script the check" path=pstack/principle-prove-it-works/SKILL.md lines=18:20
@source skill-commit title="SKILL.md · 산출물 보관과 커밋" path=pstack/principle-prove-it-works/SKILL.md lines=22:22
@source pm-cite title="pstack/poteto-mode/SKILL.md · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙을 끝까지 읽기" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-line title="pstack/poteto-mode/SKILL.md · Verification 원칙 목록의 이 원칙" path=pstack/poteto-mode/SKILL.md lines=66:66
@source pb-refactoring title="pstack/poteto-mode/playbooks/refactoring.md · 6단계" path=pstack/poteto-mode/playbooks/refactoring.md lines=12:12
@source pb-session title="pstack/poteto-mode/playbooks/session-pickup.md · 5단계" path=pstack/poteto-mode/playbooks/session-pickup.md lines=9:9
@source pb-worktree title="pstack/poteto-mode/playbooks/worktree-cleanup.md · 2단계" path=pstack/poteto-mode/playbooks/worktree-cleanup.md lines=6:6
@source pb-mpp title="pstack/poteto-mode/playbooks/multi-phase-plan.md · Verification 규칙" path=pstack/poteto-mode/playbooks/multi-phase-plan.md lines=13:13
@source pb-autopilot title="pstack/poteto-mode/playbooks/autopilot-full.md · 2단계" path=pstack/poteto-mode/playbooks/autopilot-full.md lines=6:6
@source pb-hillclimb title="pstack/poteto-mode/playbooks/hillclimb.md · 핵심 규율" path=pstack/poteto-mode/playbooks/hillclimb.md lines=5:5
@source fio title="pstack/figure-it-out/SKILL.md · Phase A 완료 조건" path=pstack/figure-it-out/SKILL.md lines=19:19
@source arena title="pstack/arena/SKILL.md · 종합 결과 검증" path=pstack/arena/SKILL.md lines=65:65
@source lever title="pstack/principle-build-the-lever/SKILL.md · 구별 문단" path=pstack/principle-build-the-lever/SKILL.md lines=23:23
@source number title="pstack/principle-explain-the-number/SKILL.md · 구별 문단" path=pstack/principle-explain-the-number/SKILL.md lines=23:23
@source units title="pstack/principle-sequence-verifiable-units/SKILL.md · 짝 원칙 문단" path=pstack/principle-sequence-verifiable-units/SKILL.md lines=17:17
@source help-principles title="pstack/poteto-help/SKILL.md · 원칙 스킬 안내" path=pstack/poteto-help/SKILL.md lines=120:120
@source help-row title="pstack/poteto-help/SKILL.md · 초록 빌드로 성공을 주장할 때" path=pstack/poteto-help/SKILL.md lines=133:133
@source prompting title="pstack/poteto-help/references/prompting.md · 원칙 이름으로 지시하기" path=pstack/poteto-help/references/prompting.md lines=50:50

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/principle-prove-it-works`를 입력하거나, 다른 스킬이 이 원칙을 읽게 할 때 켜진다. 사용자는 이름을 말로 꺼내기도 한다.[](source:help-principles)

`poteto-help`가 드는 말의 예: `apply prove it works. show me the real output`[](source:prompting)

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-prove-it-works` 입력, 또는 원칙 이름을 말로 언급[](source:help-principles) |
| `poteto-mode` | Verification 원칙. 작업을 마친 뒤 완료를 선언하기 전[](source:pm-line) |
| 플레이북 6개 | `refactoring`, `session-pickup`, `worktree-cleanup`, `multi-phase-plan`, `autopilot-full`, `hillclimb`의 검증 단계(아래 표) |
| `figure-it-out`, `arena` | 완료 조건을 정할 때, 종합한 결과를 검증할 때[](source:fio)[](source:arena) |

`poteto-mode`에서 켜지면 의무가 따라온다. 적용하는 원칙은 `SKILL.md`를 끝까지 읽는다.[](source:pm-read) 답변에는 결정을 바꾼 원칙과 바뀐 선택을 밝힌다. 인용은 이번 세션에 읽은 원칙만 한다.[](source:pm-cite)

`description`은 이 원칙이 다루는 상황을 알려 주는 설명이다. 그 문장과 같은 말이 나와야 켜지는 장치는 아니다.

## 무엇을 강제하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 모든 작업 결과를 실물로 직접 확인한다. 대리 지표, 자기 보고, "컴파일된다"로 추론하지 않는다[](source:skill-intro) | 의무 |
| 프로세스가 살아 있는지는 파생 상태가 아니라 직접 확인한다[](source:skill-real) | 의무 |
| 캐시되거나 파생된 표현이 아니라 실제 값을 읽는다[](source:skill-real) | 의무 |
| 검증이 실패하면 시스템보다 관찰 방법을 먼저 의심한다[](source:skill-real) | 의무 |
| 가능하면 확인을 결정적 스크립트로 쓰고, 돌리고, 출력을 산출물로 남긴다[](source:skill-script) | 권고(할 수 있을 때) |
| 산출물은 사람이 볼 수 있게 둔다[](source:skill-commit) | 의무 |
| 산출물 커밋은 큰 이식이나 이전처럼 나중에 감사할 기록이 필요할 때만 한다. 이때 `show-me-your-work`를 쓴다[](source:skill-commit) | 조건부 |

| 피할 근거(원문의 예) | 대신 볼 것 |
| --- | --- |
| "컴파일된다" {bad:대리} | 기능을 실제로 돌린 결과 {good:실물}[](source:skill-fm) |
| 캐시된 값, 파생된 표현 | 실제 값[](source:skill-real) |
| 파일 수정 시각, 출력의 최신 여부 | 프로세스나 결과를 직접 관찰한 것[](source:skill-why)[](source:skill-real) |
| 에이전트의 자기 보고 | `diff`와 산출물 직접 확인[](source:skill-fm)[](source:skill-why) |
| 한 번 눈으로 본 확인 | 다시 돌릴 수 있는 비교 스크립트[](source:skill-script) |

## 흐름 속 위치 {#position}

@workflow id=prove-position title="실물 검증 원칙의 앞뒤"
| pm | poteto-mode | backend |
| pb | 플레이북 | backend |
| others | 다른 스킬 | backend |
| this | 실물 검증 | backend |
| back | 완료 선언 | frontend |
| smyw | 결정 기록 | backend |
| pm > this | 완료 전 | |
| pb > this | 검증 단계 | |
| others > this | 완료 조건 | |
| this > back | 증거 | emphasis |
| this > smyw | 큰 작업 | dashed |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `poteto-mode`의 판단 상황 | 답변 속 원칙 이름과 바뀐 선택 | 작업 후 완료 선언 전[](source:pm-line) | r12 |
| `refactoring` 6단계 | 동작이 그대로라는 증거 | 큰 재구성은 옛·새 출력 비교 스크립트, 기록한 기준선 재생, 스모크 실행[](source:pb-refactoring) | 원장 플레이북 표 |
| `session-pickup` 5단계 | 넘겨받은 주장의 확인 | 이전 자기 보고가 통과했다는 것은 증명이 아니다[](source:pb-session) | 원장 플레이북 표 |
| `worktree-cleanup` 2단계 | 고정·활성 채팅 목록 | 분류 결과는 허락이 아니라 조언이다[](source:pb-worktree) | 원장 플레이북 표 |
| `multi-phase-plan` 검증 규칙 | PR 검증 판정 | 단위·실사용·성능 칸이 모두 체크돼야 검증된 PR이다[](source:pb-mpp) | 원장에 없음 |
| `autopilot-full` 2단계 | PR 담당의 자체 증명 | 실물로 증명한다[](source:pb-autopilot) | 원장에 없음 |
| `hillclimb` 핵심 규율 | 유지 또는 되돌리기 | 코드만 읽고 개선을 주장하지 않는다[](source:pb-hillclimb) | 원장에 없음 |
| `figure-it-out` Phase A | 반증 가능한 완료 조건 | 긴 실행을 시작하기 전[](source:fio) | 원장에 없음 |
| `arena` 종합 결과 | 같은 수준의 검증 | 접붙인 결과도 다른 출력처럼 검증한다[](source:arena) | 원장에 없음 |
| `principle-build-the-lever` | - | 검증 자체를 스크립트로 만드는 일은 이 원칙을 보라고 한다[](source:lever) | r105 |
| `principle-explain-the-number` | - | 구별: 이 원칙은 출력이 진짜인지, 저쪽은 수치가 그 뜻인지 본다[](source:number) | r106 |
| `principle-sequence-verifiable-units` | - | 짝 원칙: 저쪽은 순서, 이 원칙은 각 검사가 진짜인지[](source:units) | 원장에 없음 |
| `poteto-help` 상황표 | - | 답변이 초록 빌드로 성공을 주장할 때 이 원칙을 안내한다[](source:help-row) | 원장에 없음 |
| - | `show-me-your-work`로 남긴 기록 | 크거나 복잡해서 나중에 감사할 기록이 필요할 때만 커밋[](source:skill-commit) | r96 |

전체 흐름은 `pstack/_group-principles/principles.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`(1371B). 이 원칙을 부르는 위치를 확인하려고 위 출처 목록의 플레이북 6개, `figure-it-out`, `arena`, 다른 원칙 3개, `poteto-help`의 해당 줄을 읽었다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: `reporting-skills/pstack/principle-prove-it-works`, `verification-skills/pstack/principle-prove-it-works`와 원문 동일(`shasum` 일치, 원장과 같음).
- 실제로 실행해 보지 않았다. 페이지의 동작은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
어떤 작업이 "크거나 복잡해서" 커밋할 대상인지는 큰 이식·이전이라는 예만 있다. 기준은 원문에 명시 없음.
"관찰 방법을 먼저 의심한다" 뒤에 무엇을 하는지(다른 관찰법으로 다시 보기 등)는 원문에 명시 없음.
