# EGM 스킬 7개는 어떻게 이어지나? {#egm-skill-map}

EGM의 7개 스킬은 코드를 짜지 않고 **설계 문서와 README를 만들고, 검증하고, 코드와 맞춘다.** 기획, 검증, 정합성 유지의 세 묶음으로 나뉘고, 구현과 CI/CD를 맡는 스킬은 없다.

- 기획 묶음: `egm-brainstorm`이 아이디어를 `concepts_brief.md`로 정리하고, `egm-draft`가 이를 섹션별 승인을 거쳐 설계 문서로 만든다.[](source:brainstorm)
- 검증 묶음: `egm-review`가 5단계 리뷰를 지휘한다. 7·9단계는 `egm-review-loop`가 돌리고, 지적 사항은 `egm-resolve`가 판정하고 고친다.[](source:review)
- 정합성 묶음: `egm-bootstrap`이 코드에서 README 계약을 만들고, `egm-drift-report`가 문서와 코드의 차이를 보고한다.[](source:bootstrap)
- 리뷰를 통과한 설계로 코드를 쓰는 일은 EGM 밖이다. 사람이나 다른 에이전트가 맡는다.

@answer scope="google/elephant-goldfish-model main · 이 폴더에 설치된 SKILL.md 7개 기준"
@meta locale=ko
@source brainstorm title="egm-brainstorm/SKILL.md" path=egm-brainstorm/SKILL.md lines=1:264
@source draft title="egm-draft/SKILL.md" path=egm-draft/SKILL.md lines=1:314
@source review title="egm-review/SKILL.md" path=egm-review/SKILL.md lines=1:402
@source loop title="egm-review-loop/SKILL.md" path=egm-review-loop/SKILL.md lines=1:191
@source resolve title="egm-resolve/SKILL.md" path=egm-resolve/SKILL.md lines=1:187
@source bootstrap title="egm-bootstrap/SKILL.md" path=egm-bootstrap/SKILL.md lines=1:427
@source drift title="egm-drift-report/SKILL.md" path=egm-drift-report/SKILL.md lines=1:67
@source repo title="google/elephant-goldfish-model" url=https://github.com/google/elephant-goldfish-model

## 전체 지도: 스킬은 어떤 순서로 이어지나? {#overall-map}

@workflow id=skill-flow title="EGM 스킬 흐름 (묶음별)"
| lane plan | 기획 |
| lane verify | 검증 |
| lane build | 구현 (EGM 밖) |
| lane sync | 정합성 유지 |
| idea | 반쯤 된 아이디어 | external | plan |
| brainstorm | egm-brainstorm | backend | plan |
| draft | egm-draft | backend | plan |
| review | egm-review | security | verify |
| loop | egm-review-loop | security | verify |
| resolve | egm-resolve | security | verify |
| code | 코드 구현 | external | build |
| bootstrap | egm-bootstrap | database | sync |
| drift | egm-drift-report | database | sync |
| idea > brainstorm | |
| brainstorm > draft | brief | emphasis |
| draft > review | 설계 문서 | emphasis |
| review > loop | 7·9단계 |
| loop > resolve | 지적 목록 |
| resolve > loop | 다음 라운드 | dashed |
| review > code | 리뷰 통과 | emphasis |
| code > drift | 코드 변경 |
| bootstrap > drift | README 계약 | dashed |

@steps id=skill-flow-steps
| s-idea | 반쯤 된 아이디어 | 문제와 제약이 아직 흐릿한 상태에서 시작한다. | skill-flow | idea |
| s-brainstorm | egm-brainstorm | 여러 턴의 열린 질문으로 문제를 좁힌다. 사용자가 준비됐다고 확인하면 Goldfish 6개 관점이 병렬로 비판하고, 결과를 `concepts_brief.md`에 쓴다. | skill-flow | brainstorm |
| s-draft | egm-draft | brief를 읽어 개요, 기술 계획, 대안, 상세 구현 계획 순으로 쓴다. 섹션마다 승인을 받고, 마지막에 `docs/designs/` 아래에 저장한다. | skill-flow | draft |
| s-review | egm-review | 설계 문서를 5단계(5~9)로 검증한다. 대화형, 일괄 보고서, 기능 명세만, 구현 계획만 중 하나를 고른다. | skill-flow | review |
| s-loop | egm-review-loop | 7단계와 9단계에서 호출된다. 새 컨텍스트의 리뷰어를 띄우고, 2회 연속 깨끗한 라운드가 나올 때까지(최대 5회) 반복한다. | skill-flow | loop |
| s-resolve | egm-resolve | 문서를 쓴 세션에서 각 지적을 수정 제안, 반박, 사용자 확인 요청, 보류로 나눈다. 승인된 수정만 문서에 반영한다. | skill-flow | resolve |
| s-code | 코드 구현 | EGM 스킬이 없는 구간이다. 상세 구현 계획을 보고 사람이나 다른 에이전트가 코드를 쓴다. | skill-flow | code |
| s-bootstrap | egm-bootstrap | 디렉터리마다 코드를 읽어 인터페이스, 불변식, 부수 효과를 README에 쓴다. 기존 코드베이스에 EGM을 처음 들일 때 쓴다. | skill-flow | bootstrap |
| s-drift | egm-drift-report | 설계 문서나 README에 적힌 내용이 코드에 실제로 있는지 대조한다. 다른 점만 날짜별 보고서에 남긴다. | skill-flow | drift |

## 언제 어떤 스킬을 쓰나? {#when-to-use}

| 스킬 | 이럴 때 쓴다 | 입력 | 산출물 | 다음 단계 |
| --- | --- | --- | --- | --- |
| `egm-brainstorm` | 아이디어만 있고 문제 정의가 흐릴 때 | 아이디어 설명 | `concepts_brief.md` (RFC로 게시 가능) | `egm-draft` |
| `egm-draft` | 요구사항과 해법 방향이 정해졌을 때 | `concepts_brief.md` 또는 메모 | `design_draft.md`, 최종 `docs/designs/<FEATURE>.md` | `egm-review` |
| `egm-review` | 설계 문서를 구현 전에 검증할 때 | 설계 문서 경로, 읽기 목록(선택) | 단계별 보고서 또는 `consolidated_review_report.md` | 구현 |
| `egm-review-loop` | 문서 한 범위를 수렴할 때까지 감사할 때 | 대상, 리뷰어, 기준 문서 | 라운드별 지적 목록 | `egm-resolve` |
| `egm-resolve` | Goldfish 지적을 판정하고 고칠 때 | 대상, 줄 범위, 지적 목록 | `goldfish_review_report.md`, 문서 수정 | 호출한 스킬로 복귀 |
| `egm-bootstrap` | README 계약이 없거나 낡았을 때 | 루트 경로 | 디렉터리별 `README.md` | `egm-drift-report` (선택) |
| `egm-drift-report` | 구현 뒤 문서와 코드가 어긋났는지 볼 때 | 문서 디렉터리 | `YYYY-MM-DD_DRIFT_REPORT.md` | 문서나 코드 수정 |

`egm-review-loop`와 `egm-resolve`는 혼자 호출할 수도 있다. 이때는 빠진 입력을 한 번에 하나씩 묻는다.[](source:resolve)

## 말씀하신 분류에 맞추면 어떻게 되나? {#category-fit}

| 분류 | 해당 스킬 | 있나? |
| --- | --- | --- |
| 계획 작성 | `egm-brainstorm`, `egm-draft` | {good:있음} |
| 코드 구현 | 없음. `egm-draft`의 상세 구현 계획은 파일별 변경 이유까지만 쓰고 코드는 금지한다. | {bad:없음} |
| 검증 | `egm-review`, `egm-review-loop`, `egm-resolve`, `egm-drift-report` | {good:있음} |
| CI/CD | 없음. `egm-bootstrap`이 테스트 명령을 README에 적을 뿐, 파이프라인 연동은 없다. | {bad:없음} |
| 글쓰기·설명 | `egm-brainstorm`(RFC), `egm-draft`(설계 문서), `egm-bootstrap`(README) | {good:있음} |

모든 스킬은 결과를 채팅에 쏟지 않고 파일로 쓴 뒤 경로만 알린다. 그래서 글쓰기 묶음이 따로 있지 않고, 각 스킬의 산출물 자체가 설명 문서가 된다.[](source:draft)

## Elephant와 Goldfish는 무엇인가? {#elephant-goldfish}

@facts
| Elephant | 문서를 쓴 메인 세션이다. 앞선 결정을 기억하고, 지적을 판정해 문서를 고친다. |
| Goldfish | 대화 기록 없이 새 컨텍스트로 띄우는 서브에이전트다. 문서만 읽고 숨은 가정을 잡는다. |
| Synthesizer | Goldfish 여러 명을 병렬로 띄우고, 중복을 지워 보고서 하나로 돌려준다. |

@sequence id=review-round title="egm-review-loop 한 라운드"
| actor user | 사용자 | frontend |
| actor elephant | Elephant (메인 세션) | backend |
| actor synth | egm-synthesizer | backend |
| actor gold | Goldfish 리뷰어들 | external |
| actor res | egm-resolve | security |
| phase | 감사 |
| elephant | synth | 줄 범위 재계산 후 리뷰 요청 |
| synth | gold | 병렬 감사 (새 컨텍스트) |
| gold | synth | 심각도별 지적 | return |
| synth | elephant | 중복 제거된 지적 목록 | return |
| phase | 해결 |
| elephant | res | 대상 + 지적 목록 | emphasis |
| res | user | 보고서 + 처리 방식 질문 |
| user | res | 자동 수락 / 항목별 검토 |
| res | elephant | 승인된 수정 반영 결과 | return |
| phase | 수렴 판정 |
| elephant | user | 2회 연속 깨끗하면 종료 |

@steps id=review-round-steps
| r-audit | Goldfish 리뷰어들 | 리뷰어는 이전 라운드를 모른다. 그래서 같은 문서에서도 매번 다른 빈틈을 찾을 수 있다. | review-round | gold |
| r-resolve | egm-resolve | 반박에는 리뷰어도 읽을 수 있는 근거(파일, 심볼, 문서 속 결정)가 필요하다. 근거가 대화 속에만 있으면 사용자에게 넘긴다. | review-round | res |
| r-converge | Elephant (메인 세션) | Blocker나 Major가 없는 라운드가 2회 연속이면 끝난다. 5라운드를 넘거나 수정이 새 지적을 부르면 사용자에게 묻는다. | review-round | elephant |

@callout level=warning title="서브에이전트가 없으면 리뷰를 멈춘다"
`egm-brainstorm`, `egm-review`, `egm-review-loop`는 서브에이전트 도구가 없으면 진행하지 않는다. 같은 컨텍스트에서 한 리뷰는 Goldfish 리뷰가 아니라고 본다.

## egm-review의 5단계는 무엇을 보나? {#review-stages}

@workflow id=review-stages-flow title="egm-review 단계와 해결 분기"
| lane spec | 기능 명세 범위 |
| lane impl | 구현 계획 범위 |
| s5 | 5 첫 Zoom Out | backend | spec |
| s6 | 6 이해도 테스트 | backend | spec |
| s7 | 7 Critic 리뷰 | security | spec |
| s8 | 8 중간 Zoom Out | backend | spec |
| s9 | 9 구현 준비도 | security | impl |
| fix | egm-resolve | security | impl |
| done | 리뷰 종료 | external | impl |
| s5 > s6 | |
| s6 > s7 | |
| s7 > s8 | |
| s8 > s9 | |
| s7 > fix | 수정 요청 | dashed |
| s9 > fix | 수정 요청 | dashed |
| s9 > done | 통과 | emphasis |

@steps id=review-stages-steps
| st5 | 5 첫 Zoom Out | `egm-zoom-out`이 문서 전체를 읽고 큰 그림의 빈틈을 본다. | review-stages-flow | s5 |
| st6 | 6 이해도 테스트 | `egm-comprehension`이 문서를 자기 말로 다시 설명한다. 맥락 없이 따라올 수 있는지 시험한다. | review-stages-flow | s6 |
| st7 | 7 Critic 리뷰 | `egm-review-loop`가 design, structural, style 리뷰어로 기능 명세 범위를 감사한다. | review-stages-flow | s7 |
| st8 | 8 중간 Zoom Out | 6·7단계에서 바뀐 내용이 큰 그림과 맞는지 다시 본다. 기능 명세만 고르면 여기서 끝난다. | review-stages-flow | s8 |
| st9 | 9 구현 준비도 | `egm-review-loop`가 implementation-readiness, codebase-details, style 리뷰어로 상세 구현 계획을 감사한다. | review-stages-flow | s9 |
| stfix | egm-resolve | 7·9단계 뒤에 사용자가 고르면 지적을 처리한다. 단계마다 재감사는 1회까지다. | review-stages-flow | fix |

문서에 상세 구현 계획 헤더가 있으면 그 줄을 기준으로 두 범위를 자동으로 나눈다. 없으면 5~8단계만 돈다.[](source:review)

## 쓰기 전에 알아 둘 점은? {#caveats}

@callout level=note title="자동으로 불리지 않는다"
7개 스킬 모두 `disable-model-invocation: true`다. 에이전트가 알아서 고르지 않으므로, 사용자가 `/egm-brainstorm`처럼 직접 실행해야 한다.

@callout level=open-question title="이 폴더에는 SKILL.md만 있다"
스킬이 읽는 리뷰어 페르소나(`agents/*.md`), 기준 문서(`resources/document_standards/`), `docs/claude.md`는 이 폴더에 없다. 전체 동작은 원본 플러그인을 설치해야 확인할 수 있다.[](source:repo)

## 처음 써 볼 때 순서는? {#first-run}

- [ ] 아이디어 단계면 `/egm-brainstorm`으로 시작해 `concepts_brief.md`를 얻는다.
- [ ] 같은 폴더에서 `/egm-draft`를 실행해 섹션마다 승인하며 설계 문서를 완성한다.
- [ ] 설계 문서를 쓴 세션에서 `/egm-review <설계 문서 경로>`를 실행한다. 그래야 resolve가 앞선 결정을 기억한다.
- [ ] 구현은 EGM 밖에서 상세 구현 계획을 보고 진행한다.
- [ ] 구현 뒤 `/egm-drift-report docs/designs`로 설계와 코드의 차이를 확인한다.
- [ ] 기존 코드베이스라면 먼저 `/egm-bootstrap <경로>`로 README 계약을 만든다.
