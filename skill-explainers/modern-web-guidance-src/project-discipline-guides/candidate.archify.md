# project-discipline-guides — 모델이 이미 아는 내용을 mirror와 비교해 discipline guide에서 걷어 내기 {#overview}

`project-discipline-guides`는 에이전트가 분야 전체를 안내하는 discipline guide에서, 세 모델이 공통으로 이미 아는 내용을 "Redundancy Mirror"와 비교해 지우고 그 근거를 설명하게 하는 스킬이다.[](source:dg-intro)[](source:dg-goal)

- 쓰는 때: discipline guide(예: JavaScript, CSS)를 리팩터링할 때다. description은 "Common Knowledge"를 걷어 내는 workflow라고 쓴다.[](source:dg-front)
- 결과: 군더더기를 지운 target guide와, 무엇을 왜 지웠는지 적은 설명이다. 중간 산출물로 `mirrors/<분야>/` 아래 mirror 파일 4개가 생긴다.[](source:dg-gen)[](source:dg-apply)
- 다른 스킬과의 관계: `project-use-cases`와 `project-guide-validation`이 이 스킬을 참고하라고 안내한다(참고). `project-guides`와는 같은 `guide.md`를 고친다(같은 파일, 추론).[](source:dg-intro)
- 하지 않는 것: 새 규칙을 더하거나 논리를 바꾸지 않는다. 줄이는 일만 한다.[](source:dg-scope)

@answer scope="modern-web-guidance-src/project-discipline-guides · 원본 파일 4개 · 지시상 동작 · 부분 분석(mirrors/javascript/ 생성물은 구조·표본만 확인)"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source dg-front title="이름과 description" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=1:4
@source dg-intro title="discipline guide의 정의" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=8:14
@source dg-goal title="workflow의 목표" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=16:18
@source dg-gen title="1단계 mirror 생성" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=20:35
@source dg-filter title="2단계 inverse filter" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=37:46
@source dg-scope title="범위를 지킨다는 경고" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=48:49
@source dg-apply title="3단계 수술식 편집" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=51:54
@source dg-verify title="4단계 검증" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=56:59
@source dg-core title="핵심 원칙" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=61:65
@source dg-script-cli title="script의 CLI 호출 정의" path=modern-web-guidance-src/project-discipline-guides/scripts/generate_mirrors.ts lines=14:54
@source dg-script-main title="script의 mirror 생성과 intersection" path=modern-web-guidance-src/project-discipline-guides/scripts/generate_mirrors.ts lines=56:155
@source dg-mp title="mirror 프롬프트" path=modern-web-guidance-src/project-discipline-guides/mirror_prompt.md lines=1:13
@source dg-ip title="intersection 프롬프트" path=modern-web-guidance-src/project-discipline-guides/intersection_prompt.md lines=1:26
@source dg-mirror title="통합 mirror 표본" path=modern-web-guidance-src/project-discipline-guides/mirrors/javascript/mirror.md lines=1:30
@source uc-ref title="project-use-cases의 허브 guide 안내" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=30:31
@source pgv-ref title="project-guide-validation의 discipline guide 안내" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=35:35
@source pg-exp title="project-guides의 discipline guide expectations 조건" path=modern-web-guidance-src/project-guides/SKILL.md lines=156:156

## 어떻게 동작하나 {#flow span=12}

원문은 "Inverse Knowledge Filter"를 1~4단계로 지시한다. 순서대로 mirror를 만들고, 비교하고, 고치고, 확인한다. 2단계의 판단 기준(A-B 비교, 자기 보증 금지, 줄 단위로 쪼개기)은 개요에 하나씩 적고 세부 사례는 상세 후보로 보낸다.[](source:dg-filter)

@workflow id=flow-diagram title="project-discipline-guides 흐름"
| gen | Knowledge Mirror 생성 | backend | gen | source:dg-gen |
| filter | Inverse Filter 비교 | backend | filter | source:dg-filter |
| edit | 수술식 편집 | backend | filter | source:dg-apply |
| verify | 검증 | backend | verify | source:dg-verify |
| gen > filter | mirror.md |
| filter > edit | 지울 규칙 |
| edit > verify | 고친 guide |

@steps id=flow-steps
| s-gen | Knowledge Mirror 생성 | **입력** 분야 이름 `<discipline_name>` · **참조** `mirror_prompt.md`, `intersection_prompt.md` · **실행** `node .agents/skills/project-discipline-guides/scripts/generate_mirrors.ts <discipline_name>` · **출력** `mirrors/<분야>/gemini_mirror.md`, `claude_mirror.md`, `codex_mirror.md`, 통합 `mirror.md`. **처리** 세 모델이 분야에서 "공통 지식"으로 아는 내용을 각각 쓰게 하고, 셋의 교집합을 통합 Redundancy Mirror로 만든다.[](source:dg-gen) → 내부: `generate_mirrors.ts`가 `agy`, `claude`, `codex` CLI를 부르고 교집합은 gemini CLI로 만든다(코드 확인).[](source:dg-script-cli)[](source:dg-script-main) **다음** 모델 설정이 끝났는지 먼저 확인한다. 통합 `mirror.md`가 만들어졌는지 확인해야 한다(IMPORTANT). | flow-diagram | gen |
| s-filter | Inverse Filter 비교 | **입력** target guide와 통합 `mirror.md` · **참조** `.agents/skills/project-discipline-guides/mirrors/<discipline>/mirror.md` · **출력** 지울 규칙 목록. **처리** 에이전트가 target의 규칙을 통합 mirror에 문자 그대로 대어, 완전히 명확하게 포함된 것만 지운다.[](source:dg-filter) **다음** mirror에 없으면 target에 남긴다. 한 bullet에 규칙이 여러 개면 통째로 지우지 않고 중복된 부분만 자른다. | flow-diagram | filter |
| s-edit | 수술식 편집 | **입력** 지울 규칙 목록 · **출력** 고친 target guide와 설명. **처리** 구조를 유지한 채 필요 없는 부분만 지우고, 지운 것과 남긴 것의 이유를 응답에 적는다.[](source:dg-apply) | flow-diagram | edit |
| s-verify | 검증 | **입력** 고친 guide · **출력** 대조 확인. **처리** 새 guide의 규칙이 mirror에 없는지 확인하고(Contrast Check), 프로젝트 고유 규칙과 `Object.groupBy()` 같은 고급 API를 잘못 지우지 않았는지 확인한다(Preservation Check).[](source:dg-verify) | flow-diagram | verify |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령은 원문에 명시 없음. 모델이 description을 보고 켠다. 호출 제한 필드는 없다[](source:dg-front) |
| 성격 | 모델 지식과 대조해 guide를 줄이는 절차형 변형 스킬. discipline guide의 정의도 함께 설명한다 |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `project-use-cases` {#r04} | **이 스킬** | 참고 | "Granular Guide Decomposition" 규칙 끝에서 허브 guide와 하위 guide 구조는 이 스킬을 보라고 안내한다.[](source:uc-ref)[](source:dg-intro) |
| `project-guide-validation` {#r11} | **이 스킬** | 참고 | 해당 분야의 discipline guide가 `DISCIPLINE_GUIDES`에 있으면 그것을 따르는지 확인하고, 새 orientation guide는 그 목록에 추가해야 한다.[](source:pgv-ref)[](source:dg-intro) |
| **이 스킬** {#r15} | `project-guides` | 같은 파일 | 둘 다 discipline guide의 `guide.md`를 고친다. 이 스킬은 mirror에 완전히 들어 있는 규칙만 걷어 내고 새 규칙은 더하지 않는다. `project-guides`는 discipline guide의 expectations 조건을 따로 정한다. 추론이다.[](source:dg-scope)[](source:pg-exp) |
| **이 스킬** {#r39} | 모델 CLI `agy`, `claude`, `codex` | 참고 | 1단계 script가 세 CLI를 `--dangerously-skip-permissions`(codex는 `exec`)로 부른다. 범위 밖이고 지시상 동작이다.[](source:dg-script-cli)[](source:dg-gen) |

@architecture id=relation-map title="project-discipline-guides와 이어지는 스킬"
| uc | project-use-cases | backend |
| pgv | project-guide-validation | backend |
| self | project-discipline-guides(이 스킬) | backend |
| pg | project-guides | backend |
| uc > self | 참고 |
| pgv > self | 참고 |
| self > pg | 같은 파일 | dashed |

@code source=dg-front language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | discipline guide의 정의와 4단계 workflow, 핵심 원칙을 담는다 | 스킬이 켜질 때 읽는다 | Knowledge Mirror 생성, Inverse Filter 비교, 수술식 편집, 검증 |
| `mirror_prompt.md` | 세 모델에게 "공통 지식" mirror를 쓰게 하는 프롬프트다[](source:dg-mp) | `generate_mirrors.ts`가 읽는다 | Knowledge Mirror 생성 |
| `intersection_prompt.md` | 세 mirror의 교집합(LCD mirror)을 만들게 하는 프롬프트다 | 세 mirror가 모두 만들어졌을 때만 쓴다 | Knowledge Mirror 생성 |
| `scripts/generate_mirrors.ts` | 세 CLI를 불러 mirror 3개와 통합 `mirror.md`를 쓴다 | 1단계에서 `node`로 실행한다 | Knowledge Mirror 생성 |
| `mirrors/javascript/*.md` | 이전 실행의 생성물이다. 구조·표본만 확인했다[](source:dg-mirror) | 2단계에서 `mirror.md`를 읽는다 | Inverse Filter 비교 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 규칙이 통합 mirror에 완전히 명확하게 있다 | 그때만 target에서 지운다 | [](source:dg-filter) |
| 규칙이 mirror에 없다 | 자기 판단("나도 안다")으로 지우지 않고 남긴다(No Subjective Self-Attestation) | [](source:dg-filter) |
| bullet 하나에 규칙이나 API가 여러 개다 | 통째로 지우지 않고 중복된 부분만 자른다 | [](source:dg-filter) |
| 이 리팩터링에서 | 새 규칙을 더하거나 논리를 바꾸지 않는다. 변경은 좁고 리뷰하기 쉽게 한다(경고) | [](source:dg-scope) |
| 세 mirror 중 하나라도 만들지 못했다 | script가 통합 mirror 생성을 건너뛴다. 그러면 비교를 시작할 수 없다(판정) | [](source:dg-script-main) |
| 세 CLI가 모두 실패했다 | script가 오류로 종료한다 | [](source:dg-script-main) |
| 세 mirror가 있을 때 | 교집합 프롬프트로 통합 mirror를 만든다 | [](source:dg-ip) |
| 사용자 승인 | 원문에 명시 없음 | [](source:dg-goal) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 남길 규칙의 기준 — Inverse Filter 비교 · 개요에는 판단 기준 세 가지만 담았다. 유지할 차별 지식의 종류(AI 편향 교정, 대안 중 선택한 관례, 모델이 자주 빠뜨리는 고급 패턴)는 상세로 남긴다.
- mirror 생성 script의 동작 — Knowledge Mirror 생성 · CLI별 인자와 실패 처리는 상세로 남긴다.

@callout level=open-question title="확인하지 못한 것"
| `src/core/guide-validation.ts`의 `DISCIPLINE_GUIDES`와 `src/build/audit-build.ts`는 이 컬렉션에 없다. `mirrors/javascript/`의 생성물 4개(합계 약 84KB 안팎, 줄 수 842·1941·91·248)는 통합 `mirror.md`의 앞 30줄만 읽고 구조·표본만 확인했다. SKILL.md가 "temporary"라고 부르는 중간 산출물이다.[](source:dg-mirror) 모델 CLI의 동작은 확인하지 못했고 명령은 실행하지 않았다. |

읽은 원본: 텍스트 파일 4개(`SKILL.md`, 프롬프트 2개, `generate_mirrors.ts`). 제외: `mirrors/javascript/` 생성물 4개는 구조·표본만 확인했다.
