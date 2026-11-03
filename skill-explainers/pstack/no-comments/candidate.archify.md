# no-comments 스킬은 에이전트를 어떻게 바꾸나 {#no-comments-skill}

`no-comments`를 쓰면 에이전트는 주석을 직접 정리하지 않는다. "Comment Sicko"라는 서브에이전트에게 범위를 넘기고, 그 보고를 엄하게 검토한 뒤 받아들인 지적만 고친다.[](source:skill-intro)[](source:skill-s1) **부분 분석**이다. Comment Sicko 쪽의 규칙과 보고 형식은 이 저장소에 없다.

- 판단은 Comment Sicko 쪽의 새로운 시각에 맡긴다. 에이전트는 그 규칙을 다시 적어 주지 않는다.[](source:skill-intro)[](source:skill-s1)
- 보고가 규칙을 어기면 한 번만 다시 돌린다. 두 번째도 거부하면 `/no-comments`를 실패로 끝낸다.[](source:skill-s2)
- 수정에 모양이 필요하면 `architect`를 한 번 돌리고 스케치에서 멈춘다.[](source:skill-s3)
- "지우지 말 것" 같은 제약 주석은 타입·테스트·린트로 옮기자고 제안하고 승인을 기다린다.[](source:skill-s5)

@answer scope="pstack/no-comments · 원본 텍스트 파일 1개 · 커밋 5760176 · 부분 분석"
@meta locale=ko
@source skill-fm title="pstack/no-comments/SKILL.md · 2560B · 본문(frontmatter)" path=pstack/no-comments/SKILL.md lines=1:5
@source skill-intro title="pstack/no-comments/SKILL.md · 목적" path=pstack/no-comments/SKILL.md lines=9:11
@source skill-scope title="pstack/no-comments/SKILL.md · Scope" path=pstack/no-comments/SKILL.md lines=13:15
@source skill-s1 title="pstack/no-comments/SKILL.md · Step 1" path=pstack/no-comments/SKILL.md lines=19:19
@source skill-s2 title="pstack/no-comments/SKILL.md · Step 2" path=pstack/no-comments/SKILL.md lines=20:20
@source skill-s3 title="pstack/no-comments/SKILL.md · Step 3" path=pstack/no-comments/SKILL.md lines=21:21
@source skill-s4 title="pstack/no-comments/SKILL.md · Step 4" path=pstack/no-comments/SKILL.md lines=22:22
@source skill-s5 title="pstack/no-comments/SKILL.md · Step 5" path=pstack/no-comments/SKILL.md lines=23:23
@source skill-s6 title="pstack/no-comments/SKILL.md · Step 6" path=pstack/no-comments/SKILL.md lines=24:24
@source pm-trigger title="pstack/poteto-mode/SKILL.md · no-comments 호출 조건" path=pstack/poteto-mode/SKILL.md lines=29:29
@source architect-intro title="pstack/architect/SKILL.md · 목적" path=pstack/architect/SKILL.md lines=9:9
@source pb-pr title="pstack/poteto-mode/playbooks/opening-a-pr.md · 리뷰 전" path=pstack/poteto-mode/playbooks/opening-a-pr.md lines=9:9
@source pb-pr-sub title="pstack/poteto-mode/playbooks/opening-a-pr.md · 서브에이전트 PR" path=pstack/poteto-mode/playbooks/opening-a-pr.md lines=36:36
@source pb-mpp title="pstack/poteto-mode/playbooks/multi-phase-plan.md · 체크리스트" path=pstack/poteto-mode/playbooks/multi-phase-plan.md lines=59:59
@source pb-apf title="pstack/poteto-mode/playbooks/autopilot-full.md · 소유자 생애주기" path=pstack/poteto-mode/playbooks/autopilot-full.md lines=6:6
@source pb-aps title="pstack/poteto-mode/playbooks/autopilot-stack.md · 소유자 루프" path=pstack/poteto-mode/playbooks/autopilot-stack.md lines=5:5

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/no-comments`를 입력하거나, 다른 스킬이 진행 중에 부를 때 켜진다. `description`에는 호출 조건 없이 하는 일만 적혀 있다.

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/no-comments` 입력 |
| `poteto-mode` | 리뷰 전(의무형)[](source:pm-trigger) |
| Opening a PR 플레이북 | 리뷰 전. PR을 여는 서브에이전트도 돌린다[](source:pb-pr)[](source:pb-pr-sub) |
| Multi-phase plan 플레이북 | 각 커밋 전 `/deslop`, 리뷰 전 `/no-comments` 체크리스트[](source:pb-mpp) |
| Autopilot-full·Autopilot-stack 플레이북 | PR 소유자가 슬롭 정리 다음에 돌린다[](source:pb-apf)[](source:pb-aps) |

**범위**: 호출자가 준 파일이나 `diff`를 쓴다. 없으면 기반 브랜치(기본 `main`)와 비교한 현재 `diff`를 쓰고, 커밋하지 않은 작업 트리도 포함한다.[](source:skill-scope)

## 여섯 단계는 어떻게 이어지나 {#flow}

@workflow id=nc-flow title="no-comments 진행 흐름"
| lane review | 검토 |
| lane fix | 수정 |
| lane close | 마무리 |
| spawn | 리뷰 맡김 | security | review |
| accept | 수용? | backend | review |
| rerun | 재실행 | backend | review |
| fail | 실패 | frontend | review |
| shape | 모양 필요? | backend | fix |
| arch | 설계 | backend | fix |
| impl | 근본 수정 | backend | fix |
| enc | 제약 처리 | backend | close |
| report | 보고 | frontend | close |
| spawn > accept | | |
| accept > shape | 예 | emphasis |
| accept > rerun | 아니오 | |
| rerun > fail | 거부 | |
| shape > arch | 예 | |
| shape > impl | 아니오 | |
| arch > impl | | |
| impl > enc | | |
| enc > report | | |

@steps id=nc-steps
| s-spawn | 리뷰 맡김 | Step 1. `Task`를 `subagent_type: "Comment Sicko"`로 띄우고 범위를 넘긴다. 그 규칙을 다시 적어 주지 않는다. | nc-flow | spawn |
| s-accept | 수용? | Step 2. 보고와 `diff`를 검토한다. 거부할 것과 받아들일 것은 아래 "보고를 어떻게 검토하나" 표에 있다. 얇은 근거의 `IMPORTANT`나 `do not remove` 판정은 받아들이기 전에 그 심볼에 `/how`나 `/why`를 돌린다. | nc-flow | accept |
| s-rerun | 재실행 | 거부한 보고는 되돌리고, 무엇이 틀렸는지 밝혀 한 번 다시 돌린다. 다시 받은 보고를 받아들이면 3단계로 간다. 이 선은 그림에서 생략했다. | nc-flow | rerun |
| s-fail | 실패 | 두 번째 보고도 거부하면 그 사실을 열린 문제로 보고하고 `/no-comments`를 실패로 끝낸다. | nc-flow | fail |
| s-shape | 모양 필요? | Step 3. 죽은 경로 지우기, 매개변수 빼기, 실제 API 쓰기 같은 사소한 수정은 바로 한다. 수정 중 하나라도 모양을 정해야 하는지 본다. | nc-flow | shape |
| s-arch | 설계 | `architect` 호출. 받아들인 지적 전체와 주변 코드에 대해 `/architect`를 한 번만 돌린다. 스케치에서 멈춘다. 모양은 `architect`가, 구현은 4단계가 맡는다. | nc-flow | arch |
| s-impl | 근본 수정 | Step 4. 범위 안에서 가장 작은 근본 원인 수정을 한다. 이름이 붙은 우회는 모두 없앤다. 근본 원인이 범위 밖이면 범위 안의 가장 작은 수정만 하고 나머지는 열린 문제로 보고한다. 증상을 막는 가드를 덧붙이지 않는다. | nc-flow | impl |
| s-enc | 제약 처리 | Step 5. 제약 주석을 타입·런타임·테스트·CI 린트 중 가장 싼 장치로 옮기자고 제안하고 승인을 기다린다. 자세한 조건은 아래 표에 있다. | nc-flow | enc |
| s-report | 보고 | Step 6. 삭제 수, 되살린 주석, 재실행, architect 스케치, 수정, 인코딩 제안, 실제 인코딩, 강제되지 않은 제약, 그 밖의 열린 일을 보고한다. | nc-flow | report |

판정: 근본 원인 원칙 두 개(`principle-fix-root-causes`, `principle-redesign-from-first-principles`)는 의도만 안내한다. 범위를 넓히거나 범위 밖 사례를 고치는 근거가 되지 않는다고 원문이 못 박는다.[](source:skill-s4)

## 보고를 어떻게 검토하나 {#inspect}

| Comment Sicko 보고의 항목 | 처리 |
| --- | --- |
| 애플리케이션 코드 수정 | 거부 {bad:거부} |
| 범위를 벗어난 변경 | 거부 {bad:거부} |
| 예외로 보호된 주석의 삭제 | 거부 |
| 이유를 잘못 적은 `MUST KILL` | 거부 |
| 의도적으로 남긴 코드를 죄인 취급한 지적 | 거부 |
| 우리 코드의 의외 동작을 고치자는 지적 | 계속 조치 대상. 그 주석은 되살리지 않는다 |
| 남기기(keep) 판정 | 우리가 바꿀 수 없는 것에 관한 주석이라는 증거가 있을 때만 남는다 {caution:증거 필요} |
| 놓친 범위 안 lint·TypeScript 억제 | 감사한다. 정확성·안전 관련 억제는 조치할 `MUST KILL`로 둔다 |
| 삭제 되돌리기 | 정확한 예외와 범위 안 증거가 있을 때만 |
| 애매한 삭제(kill) | 되살리지 않는다 |
| 반박되거나 여전히 애매한 남기기 | 지운다 |

모든 행은 Step 2 문단을 표로 나눈 것이다.[](source:skill-s2) 판정: 애매하면 대개 지우는 쪽으로 기운다. 주석을 남기는 쪽이 증명 책임을 진다.

## 제약 주석은 어떻게 처리하나 {#constraints}

제약 주석은 `do not remove`, `do not change wording`, `talk to X before changing` 같은 말을 담은 주석이다. 우리가 바꿀 수 없는 것에 관한 남기기는 그대로 둔다.[](source:skill-s5)

| 상황 | 해야 할 일 |
| --- | --- |
| 대화형 실행 | 가장 싼 범위 안 장치(타입, 런타임 검사, 테스트, CI 린트)를 제안하고 사람의 승인을 기다린다 |
| 무인 실행, eval | 호출자가 미리 승인했어야 한다 |
| 승인됨 | 장치로 옮긴 뒤 주석을 지운다 {good:인코딩} |
| 승인 안 됨 | 주석을 지우고, 제약을 열린 문제로 보고하고, 범위 밖 작업을 스케치한다 |

네 행은 Step 5에서 왔다.[](source:skill-s5) 판정: 승인이 없어도 주석은 지워진다. 사람이 바꾸는 것은 제약을 장치로 남기느냐뿐이다.

## 흐름 속 위치 {#position}

@workflow id=nc-position title="no-comments 앞뒤의 스킬"
| caller | poteto-mode | backend |
| nc | no-comments | backend |
| deleg | architect·how·why | backend |
| review | 리뷰 | backend |
| caller > nc | diff | |
| nc > deleg | 위임 | emphasis |
| deleg > nc | 스케치·설명 | dashed |
| nc > review | 정리된 diff | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `poteto-mode`의 diff | 주석 정리된 diff | 리뷰 전 | r08 |
| 받아들인 지적 목록 → `architect` | 설계 스케치 | 수정 하나라도 모양이 필요할 때 한 번. 구현은 4단계 | r66 |
| 얇은 근거의 판정 심볼 → `how`·`why` | 설명 | Step 2. 원장에 행이 없음 | - |
| 원칙 스킬 2개 | - | 의도 안내만. 범위 확장 불가 | r67 |

`architect`는 원래 스케치 뒤에 구현까지 하는 스킬이다.[](source:architect-intro) 판정: 여기서는 스케치만 빌려 쓰고 구현은 `no-comments`가 가져온다.[](source:skill-s3) 전체 흐름은 `pstack/_group-design-review/design-review.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md` 하나. 이 폴더의 원본 텍스트 파일은 이것뿐이다.
- 호출 조건을 확인하려고 `poteto-mode`, `architect`, 플레이북 4개의 해당 줄을 읽었다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다.
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
Comment Sicko 정의는 `subagent_type` 이름으로만 나온다. 저장소를 검색해도 정의가 이 파일 말고는 없다. 그래서 `MUST KILL`, `IMPORTANT`, 남기기와 삭제를 가르는 규칙, 보고 형식은 확인하지 못했다(범위 밖).[](source:skill-s1)[](source:skill-s2)
`/how`·`/why` 호출(Step 2)은 관계 원장에 행이 없다. 원장 보완이 필요하다.[](source:skill-s2)
"우리가 바꿀 수 없는 것"의 범위(외부 API, 생성 코드 등)는 원문에 명시 없음.
