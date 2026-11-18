# egm-review-loop — 새 컨텍스트 리뷰어를 라운드로 반복해 문서를 고친다 {#overview}

egm-review-loop은 문서를 새 컨텍스트의 리뷰어(Goldfish)에게 감사시키고, 이전 대화를 아는 메인 에이전트(Elephant)가 지적을 고치는 과정을 라운드로 반복하게 한다.[](source:ov) **부분 분석**: 리뷰어 정의 `agents/*.md`와 기준 문서 `resources/document_standards/*.md`가 이 폴더에 없어서, 리뷰어가 무엇을 보는지는 확인하지 못했다.

- 사용자가 이름으로 불러야 켜진다. `TargetFile`, 리뷰어, 기준 문서 같은 입력이 빠지면 빠진 것만 묻는다.[](source:fm)[](source:s1)
- 라운드마다 지적 목록과 `goldfish_review_report.md`가 남고, 승인된 수정이 `TargetFile`에 반영된다.[](source:s23)
- 정리되지 않은 Blocker·Major 지적이 없는 깨끗한 라운드가 연속 2번 나오면 멈춘다. 상한은 5라운드다.[](source:s24)
- 다른 스킬과의 관계: egm-review가 호출하고(호출), 이 스킬은 egm-resolve와 synthesizer를 부른다(호출).

@answer scope="egm/egm-review-loop · 원본 파일 5개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source fm title="frontmatter" path=egm/egm-review-loop/SKILL.md lines=1:12
@source ov title="개요와 서브에이전트 위임" path=egm/egm-review-loop/SKILL.md lines=19:44
@source s1 title="Step 1 입력 확인" path=egm/egm-review-loop/SKILL.md lines=46:101
@source s21 title="2.1 범위 다시 계산" path=egm/egm-review-loop/SKILL.md lines=107:113
@source s22 title="2.2 리뷰어 병렬 실행" path=egm/egm-review-loop/SKILL.md lines=115:144
@source s23 title="2.3 해결 넘김" path=egm/egm-review-loop/SKILL.md lines=146:155
@source s24 title="2.4 반복 판단" path=egm/egm-review-loop/SKILL.md lines=157:187
@source s3 title="Step 3 종료 보고" path=egm/egm-review-loop/SKILL.md lines=189:199
@source ext title="외부 파일 안내와 이름 해석" path=egm/egm-review-loop/SKILL.md lines=16:17
@source stds title="기준 문서 이름 해석" path=egm/egm-review-loop/SKILL.md lines=65:78
@source tst title="시험 계획" path=egm/egm-review-loop/TEST.md lines=5:13
@source scn title="시험 시나리오" path=egm/egm-review-loop/test_scenarios.yaml lines=15:83
@source oai title="표시 설정" path=egm/egm-review-loop/agents/openai.yaml lines=1:6

## 어떻게 동작하나 {#flow span=12}

절차형이다. 입력을 확인한 뒤 라운드를 반복하고, 수렴하거나 사용자가 수락하면 끝낸다. 되돌림은 두 곳이다. 수렴하지 않았으면 사용자가 확인할 때 다음 라운드로 가고, 상한이나 되풀이 수정(churn)에서는 사용자가 계속을 고르면 가고 그렇지 않으면 끝낸다.

@workflow id=flow-diagram title="egm-review-loop 흐름"
| lane prep | 준비 |
| lane round | 라운드 반복 |
| lane end | 마무리 |
| intake | 입력 확인 | backend | prep | source:s1 |
| range | 범위 다시 계산 | backend | round | source:s21 |
| swarm | 리뷰어 병렬 실행 | backend | round | source:s22 |
| hand | 해결 넘김 | backend | round | source:s23 |
| check | 수렴했나? | backend | round | source:s24 |
| ask | 사용자에게 묻기 | external | round | source:s24 |
| finish | 종료 보고 | backend | end | source:s3 |
| intake > range | 사용자 확인 |
| range > swarm | |
| swarm > hand | 지적 목록 |
| hand > check | 수정 적용 |
| check > range | 아니오 |
| check > finish | 예 | emphasis |
| check > ask | 상한·churn | dashed |
| ask > finish | 수락·중단 |
| ask > range | 계속 | dashed |

@steps id=flow-steps
| s-intake | 입력 확인 | **입력** `TargetFile`, `SemanticTarget`, `Reviewers`, `Standards`, `GoldfishContext` · **참조** `agents/{name}.md`, `resources/document_standards/{name}.md` · **출력** 확정된 구성(대상, 리뷰어, 기준 문서). **처리** 빠진 입력만 하나씩 묻고, 문서 종류에 맞는 리뷰어를 추천하고, 구성을 보여 준 뒤 사용자 확인을 받는다.[](source:s1) **다음** 빈 `GoldfishContext`는 제공한 것으로 보고 다시 묻지 않는다. URL은 첫 라운드 전에 페이지를 파일로 저장해 그 절대 경로를 넘긴다. 저장하지 못하면 로컬 사본을 요청하고 턴을 끝낸다. 답할 사람이 없는 headless 실행이면 그 항목을 빼고 알린 뒤 계속한다.[](source:s1) | flow-diagram | intake |
| s-range | 범위 다시 계산 | **입력** `TargetFile`, `SemanticTarget` · **출력** 갱신된 시작·끝 줄 번호. **처리** 매 라운드 전에 파일을 다시 읽고 대상 제목을 찾아, 앞 라운드 수정으로 밀린 줄 번호를 바로잡는다.[](source:s21) **다음** `full file` 모드면 전체 줄 범위만 확인한다. | flow-diagram | range |
| s-swarm | 리뷰어 병렬 실행 | **입력** 줄 범위, `Reviewers`, `Standards`, `GoldfishContext` · **참조** `agents/synthesizer.md`, `agents/{name}.md` · **출력** id가 붙은 `FindingsList`(Blocker·Major·Nit, 줄 번호, 근거). **처리** synthesizer를 띄워 리뷰어를 병렬로 돌리거나, 중첩을 못 하면 리뷰어를 직접 띄우고, 지적을 `<reviewer>-<round>-<n>` id로 모은다.[](source:s22) **다음** 응답이 없거나 실패한 리뷰어는 한 번 다시 시도하고, 또 실패하면 not run으로 기록한다. 지적 0건으로 세지 않는다.[](source:s22) | flow-diagram | swarm |
| s-hand | 해결 넘김 | **입력** `TargetFile`, 줄 범위, `FindingsList` · **실행** `egm-resolve` 워크플로를 Elephant 컨텍스트에서 실행 · **출력** `goldfish_review_report.md`, 수정된 `TargetFile`. **처리** 지적을 반박(`CONTEST`)과 수정 제안(`PROPOSE FIX`)으로 나누고, 사용자의 결정을 받아 승인된 수정만 적용한다.[](source:s23) **다음** resolve가 사람 결정에서 멈추면 드라이버도 사용자가 다시 확인할 때까지 기다린다.[](source:s24) | flow-diagram | hand |
| s-check | 수렴했나? | **입력** 라운드 결과, 정리된 지적 목록 · **출력** 수렴, 계속, 상한·churn 중 하나. **처리** 정리되지 않은 Blocker·Major가 없고 not run 리뷰어도 없으면 깨끗한 라운드로 본다. 이 판단은 그 라운드의 수정을 적용하기 전에 한다.[](source:s24) **다음** 연속 2번 깨끗하면 수렴이다. 수정된 지적을 같은 범위에서 다시 올리면 지적을 다시 연다.[](source:s24) | flow-diagram | check |
| s-ask | 사용자에게 묻기 | **입력** 열린 지적(심각도 순) · **출력** 사용자의 선택. **처리** 열린 지적을 짧게 나열하고 수락·상한 넘겨 계속·초안으로 되돌리기 중 하나를 한 번에 묻는다.[](source:s24) **다음** 수락이면 종료 보고로, 상한을 넘겨 계속이면 다음 라운드로 간다. 초안으로 되돌리기는 이 문서에서 다음 행선지가 명시되지 않았다. | flow-diagram | ask |
| s-finish | 종료 보고 | **입력** 종료 사유(수렴, 상한 수락, 중단) · **출력** 채팅의 완료 요약. **처리** egm-review의 하위 흐름이면 조용히 실행을 돌려주고, 직접 호출이면 라운드 수와 종료 사유를 알리며 다음 단계를 묻는다.[](source:s3) | flow-diagram | finish |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자가 이름으로 부른다. `disable-model-invocation: true`라서 모델이 `description`만 보고 켜지 않는다.[](source:fm) |
| 성격 | 리뷰어를 띄워 지적을 모으고 고치는 일을 라운드로 반복하는 진행 드라이버다.[](source:ov) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| egm-review {#r08} | **이 스킬** | 호출 | 대화형 흐름의 Stage 7(`FeatureRange`)과 Stage 9(`DetailedRange`)에서 같은 스레드로 부른다. 끝나면 실행을 review에 돌려준다.[](source:s3) |
| **이 스킬** {#r10} | egm-resolve | 호출 | 라운드마다 2.3에서 부른다. resolve가 사람 결정에서 멈추면 드라이버도 사용자 확인까지 기다린다(의무).[](source:s23)[](source:s24) |
| **이 스킬** {#r14} | egm-synthesizer | 호출 | 기본 경로는 synthesizer를 띄우는 것이고 대안은 리뷰어 직접 띄우기다. 파일이 이 폴더에 없어 범위 밖이다.[](source:s22) |
| **이 스킬** {#r19} | egm-review | 같은 파일 | 보고서 파일 이름이 원문에 명시 없어 같은 파일인지 미확인이다. 그림에는 넣지 않았다.[](source:s22) |
| **이 스킬** {#r25} | `resources/document_standards/*.md` | 참고 | 리뷰어에 붙이는 기준 문서 이름이 적혀 있지만 파일이 이 폴더에 없어 불명이다. 그림에는 넣지 않았다.[](source:stds) |

@architecture id=relation-map title="egm-review-loop와 이어지는 스킬"
| review | egm-review | backend |
| self | egm-review-loop(이 스킬) | backend |
| resolve | egm-resolve | backend |
| synth | egm-synthesizer | external |
| stds | 기준 문서 | external |
| review > self | 호출 |
| self > resolve | 호출 |
| self > synth | 호출 |
| self > stds | 참고 | dashed |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 입력, 수렴 규칙, 종료 방식을 정한 본문 | 스킬을 켤 때 읽는다 | 입력 확인, 범위 다시 계산, 리뷰어 병렬 실행, 해결 넘김, 수렴했나?, 사용자에게 묻기, 종료 보고 |
| `TEST.md` | 대화형으로 확인할 체크리스트[](source:tst) | 에이전트 실행에는 쓰지 않는다 | 원문에 명시 없음 |
| `test_scenarios.yaml` | 수렴·not run·URL 저장을 확인하는 시나리오 5개[](source:scn) | 평가 때만 쓴다 | 수렴했나?, 입력 확인 |
| `agents/openai.yaml` | 표시 이름과 짧은 설명을 정한 UI 설정[](source:oai) | 원문에 명시 없음 | 원문에 명시 없음 |
| `assets/icon.svg` | 아이콘 | 원문에 명시 없음 | 원문에 명시 없음 |
| `docs/codex.md`, `${CLAUDE_PLUGIN_ROOT}/docs/claude.md` | Codex나 Claude Code에서 먼저 읽으라는 안내[](source:ext) | 의무. 이 저장소에는 없어 확인하지 못했다 | 입력 확인 |
| `agents/<파일>.md` | 리뷰어 정의. 이 폴더의 `agents/`에는 `openai.yaml`만 있다[](source:stds) | 확인하지 못했다 | 리뷰어 병렬 실행 |
| `resources/document_standards/*.md` | 리뷰어에 붙이는 기준 문서[](source:stds) | 확인하지 못했다 | 입력 확인, 리뷰어 병렬 실행 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 서브에이전트 도구가 없다 | 중단하고 사용자에게 알린다 | [](source:ov) |
| 입력이 일부 빠졌다 | 빠진 것만 하나씩 묻는다 | [](source:s1) |
| 구성이 확정되기 전이다 | 구성을 보여 주고 사용자 확인을 받아야 라운드를 시작한다 | [](source:s1) |
| 리뷰어가 실패하거나 보고서가 없다 | 한 번 다시 시도하고, 또 실패하면 not run으로 기록한다. 그 라운드는 깨끗하지 않다 | [](source:s22) |
| 정리된 지적을 새 리뷰어가 다시 올린다 | 다시 열지 않는다 | [](source:s24) |
| 수정이 적용된 지적을 같은 범위에서 다시 올린다 | 수정이 실패했거나 이후 수정이 되살린 것으로 보고 다시 연다 | [](source:s24) |
| 정리되지 않은 Blocker·Major가 없다(Nit 무관) | 깨끗한 라운드다 | [](source:s24) |
| 깨끗한 라운드가 연속 2번이다 | 수렴이다. 종료 보고로 간다 | [](source:s24) |
| 5라운드에 도달했다 | 열린 지적을 나열하고 수락·계속·초안 복귀 중 하나를 묻는다 | [](source:s24) |
| 새 지적이 적용한 수정의 범위에 있고 그 수정을 되돌리면 풀린다(churn) | 상한과 같은 질문을 한다 | [](source:s24) |
| 라운드의 해결 단계가 끝났다 | 사용자가 명시적으로 확인할 때만 다음 라운드를 연다 | [](source:s24) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 수렴 규칙 전체(정리된 지적, 다시 열기, churn) — 수렴했나? · 개요는 결과를 바꾸는 조건만 담았다
- GoldfishContext의 URL 저장 규칙 — 입력 확인 · 분기가 많아 개요에서 접었다
- 리뷰어 이름과 기준 문서 이름 해석 — 입력 확인 · 파일이 없어 이름 매핑만 확인할 수 있다
- 시험 시나리오 5개의 기대 응답 패턴 — 수렴했나? · 평가용 정보라 개요에 넣지 않았다

@callout level=open-question title="확인하지 못한 것"
| `agents/*.md`와 `resources/document_standards/*.md`가 폴더에 없어 리뷰어의 감사 관점과 출력 형식은 확인하지 못했다. |
| `docs/codex.md`, `docs/claude.md`, `docs/harnesses.md`도 저장소에 없다. upstream에 있는지는 확인하지 않았다. |
| 초안으로 되돌리기를 고른 뒤 어느 스킬로 가는지는 원문에 명시 없음. |

읽은 원본: 텍스트 파일 5개. 제외: `SKILL.ko.md`, `TEST.ko.md`(번역본이라 분석 근거로 쓰지 않았다).
