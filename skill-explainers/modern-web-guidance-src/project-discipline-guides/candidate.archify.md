# project-discipline-guides는 허브 guide에서 무엇을 어떻게 걷어 내나? {#pdg-page}

`project-discipline-guides`는 분야 전체를 안내하는 discipline guide에서 모델이 이미 아는 규칙만 걷어 내게 한다. 세 모델(Gemini, Claude, Codex)이 쓴 mirror의 교집합에 규칙이 **완전히 들어 있을 때만** 지우고, 새 규칙은 더하지 못한다.[](source:filter)[](source:warn) 부분 분석이다. mirror 생성물 4개는 구조와 표본만 확인했다.

- 에이전트는 `generate_mirrors.ts`로 mirror 4개를 만들고, 대상 guide를 통합 mirror와 A - B로 비교한다.[](source:gen)[](source:filter)
- 에이전트 자신의 판단("나는 이미 안다")으로는 지우지 못한다. mirror 본문에 있는 내용만 근거가 된다.[](source:filter)
- 한 bullet에 지침이 여럿이면 통째로 지우지 않고 쪼개서 겹치는 부분만 지운다.[](source:filter)
- 편집 뒤에는 대조 검사와 보존 검사를 한다. 검사에 실패했을 때 되돌아가는 단계는 원문에 명시 없음.[](source:verify)

@answer scope="로컬 원본 분석 · 스크립트·CLI 미실행 · mirror 생성물은 표본만"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source skill title="modern-web-guidance-src/project-discipline-guides/SKILL.md · 5288B · 스킬 본문(원본)" path=modern-web-guidance-src/project-discipline-guides/SKILL.md
@source front title="project-discipline-guides/SKILL.md · 5288B · frontmatter" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=1:4
@source def title="project-discipline-guides/SKILL.md · 5288B · discipline guide 정의" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=8:14
@source gen title="project-discipline-guides/SKILL.md · 5288B · 1단계 mirror 생성" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=20:35
@source filter title="project-discipline-guides/SKILL.md · 5288B · 2단계 inverse filter" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=37:46
@source warn title="project-discipline-guides/SKILL.md · 5288B · 범위 제한 경고" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=48:49
@source edit title="project-discipline-guides/SKILL.md · 5288B · 3단계 편집과 설명" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=51:54
@source verify title="project-discipline-guides/SKILL.md · 5288B · 4단계 검증" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=56:59
@source princ title="project-discipline-guides/SKILL.md · 5288B · 핵심 원칙" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=61:65
@source mp title="project-discipline-guides/mirror_prompt.md · 1232B · mirror 생성 프롬프트(원본)" path=modern-web-guidance-src/project-discipline-guides/mirror_prompt.md
@source ip title="project-discipline-guides/intersection_prompt.md · 1392B · 교집합 프롬프트(원본)" path=modern-web-guidance-src/project-discipline-guides/intersection_prompt.md
@source ip-rules title="project-discipline-guides/intersection_prompt.md · 1392B · 교집합 규칙 4개" path=modern-web-guidance-src/project-discipline-guides/intersection_prompt.md lines=5:9
@source gm title="project-discipline-guides/scripts/generate_mirrors.ts · 5533B · mirror 생성 스크립트(원본, 실행하지 않음)" path=modern-web-guidance-src/project-discipline-guides/scripts/generate_mirrors.ts
@source gm-cli title="scripts/generate_mirrors.ts · 5533B · CLI 호출" path=modern-web-guidance-src/project-discipline-guides/scripts/generate_mirrors.ts lines=14:54
@source gm-dir title="scripts/generate_mirrors.ts · 5533B · 인자와 출력 폴더" path=modern-web-guidance-src/project-discipline-guides/scripts/generate_mirrors.ts lines=56:82
@source gm-gen title="scripts/generate_mirrors.ts · 5533B · 모델별 생성과 파일 쓰기" path=modern-web-guidance-src/project-discipline-guides/scripts/generate_mirrors.ts lines=84:122
@source gm-int title="scripts/generate_mirrors.ts · 5533B · 교집합 단계" path=modern-web-guidance-src/project-discipline-guides/scripts/generate_mirrors.ts lines=124:154
@source m-uni title="mirrors/javascript/mirror.md · 15496B · 248줄 · 구조·표본만 확인(전부 읽지 않음)" path=modern-web-guidance-src/project-discipline-guides/mirrors/javascript/mirror.md
@source m-gem title="mirrors/javascript/gemini_mirror.md · 5927B · 91줄 · 구조·표본만 확인(전부 읽지 않음)" path=modern-web-guidance-src/project-discipline-guides/mirrors/javascript/gemini_mirror.md
@source m-cla title="mirrors/javascript/claude_mirror.md · 22007B · 842줄 · 구조·표본만 확인(전부 읽지 않음)" path=modern-web-guidance-src/project-discipline-guides/mirrors/javascript/claude_mirror.md
@source m-cod title="mirrors/javascript/codex_mirror.md · 40753B · 1941줄 · 구조·표본만 확인(전부 읽지 않음)" path=modern-web-guidance-src/project-discipline-guides/mirrors/javascript/codex_mirror.md
@source r-uc title="project-use-cases/SKILL.md · 12896B · 관계 확인용(해당 줄만 읽음)" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=29:31
@source r-val title="project-guide-validation/SKILL.md · 14156B · 관계 확인용(해당 줄만 읽음)" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=35:35
@source r-pg title="project-guides/SKILL.md · 26181B · 관계 확인용(해당 줄만 읽음)" path=modern-web-guidance-src/project-guides/SKILL.md lines=156:156
@source r-ca title="coherence-auditor/SKILL.md · 3454B · 관계 확인용(해당 줄만 읽음)" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=34:34

## 언제 켜지고 무엇이 대상인가? {#activation}

frontmatter에는 `name`과 `description`만 있다. `description`은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻은 아니다. `disable-model-invocation` 필드는 원문에 명시 없음.[](source:front)

@code source=front language=yaml

설명이 가리키는 작업은 JavaScript, CSS 같은 discipline-level guide를 줄이는 refactor다.[](source:front) 원문은 discipline guide를 분야의 개념 "hub"로 정의한다. 하위 use-case guide로는 `{{ GUIDE_REF("guide-slug") }}` macro로 안내한다.[](source:def)

| discipline guide의 종류 | 예 | 원문의 조건 |
|---|---|---|
| category root guide | `guides/css/css/guide.md` | 분야 전체를 안내한다.[](source:def) |
| named orientation guide | `guides/wasm/cpp-on-the-web/guide.md` | 여러 기능에 걸친 horizontal이나 하위 분야를 안내한다.[](source:def) |
| 등록 기준 | `DISCIPLINE_GUIDES` | `src/core/guide-validation.ts`에 등록된 guide가 discipline guide다. 이 파일은 컬렉션 밖이라 확인하지 못했다.[](source:def) |

discipline guide는 `description`과 `web-feature-ids` frontmatter 요구에서 면제되고, `src/build/audit-build.ts`가 core guide로 보고한다고 원문은 적는다.[](source:def) 사람 승인 단계는 원문에 명시 없음. 사용자에게 해야 하는 일은 설정 확인(mirror 생성 전)과 변경 설명(편집 후) 두 가지다.[](source:gen)[](source:edit)

@callout level=warning title="범위를 넘으면 안 된다"
| 이 스킬의 유일한 목표는 중복된 상식을 줄이는 것이다. 새 규칙을 더하거나 로직을 고치거나 무관한 지침을 넣어서는 안 된다. 변경은 검토하기 쉽게 좁게 유지한다.[](source:warn) |

## 어떤 순서로 줄이나? {#flow}

원문은 4단계다. mirror를 만들고, 대상 guide를 mirror와 비교하고, 고치고, 검증한다.[](source:gen)[](source:filter)[](source:edit)[](source:verify)

@workflow id=filter-flow title="Inverse Knowledge Filter 4단계"
| gen | Mirror 생성 | backend | source:gen |
| filter | A - B 비교 | backend | source:filter |
| edit | 표면 편집 | backend | source:edit |
| verify | 검증 | backend | source:verify |
| gen > filter | 통합 mirror 생성 |
| filter > edit | 지울 규칙 확정 |
| edit > verify | 설명 제출 | emphasis |

@steps id=filter-steps
| gen | Mirror 생성 | 모델 설정을 확인한 뒤 `generate_mirrors.ts <discipline_name>`으로 mirror 4개를 만든다.[](source:gen) | filter-flow | gen |
| filter | A - B 비교 | 대상 guide와 통합 mirror를 읽고, mirror에 완전히 들어 있는 규칙만 지울 후보로 삼는다.[](source:filter) | filter-flow | filter |
| edit | 표면 편집 | 파일 구조는 두고 불필요한 내용만 걷어 낸다. 응답에 바꾼 내용과 남긴 이유를 쓴다.[](source:edit) | filter-flow | edit |
| verify | 검증 | 새 guide의 규칙이 mirror에 없는지(대조), 프로젝트 고유 규칙과 `Object.groupBy()` 같은 고급 API가 남았는지(보존) 확인한다.[](source:verify) | filter-flow | verify |

| 상황 | 에이전트의 행동 |
|---|---|
| 규칙 전체가 통합 mirror에 완전하고 명확하게 들어 있다 | 지운다. 지워도 되는 유일한 경우다.[](source:filter) |
| mirror에 없는 개념이다 | 남긴다. 에이전트가 안다고 생각해도 지우지 않는다.[](source:filter) |
| 한 bullet에 지침이나 API가 여럿 섞여 있다 | 쪼개서 겹치는 부분만 지운다. 차이 나는 지식은 명시적으로 남긴다.[](source:filter) |
| 모델 편향을 되돌리는 규칙, 유효한 대안 중 고른 관례, 모델이 알지만 기본 출력에서 빠뜨리는 고급 성능·보안 패턴 | 대체로 남긴다. 원문은 "generally"라고 쓴다.[](source:filter) |

핵심 원칙 3개는 중복 삭제, 신호 보존("Senior Engineer" 모드를 강제하거나 프로젝트 구조에 맞는 지침), context 효율이다.[](source:princ)

판정 · "mirror에 있는 것만 지운다"는 규칙이 가장 강한 제약이다. 이 규칙 때문에 mirror가 빈약하면 대상 guide는 거의 줄지 않는다. 예를 들어 Gemini mirror는 8개 `##` 절인데 Codex mirror는 48개라서, 교집합이 가장 짧은 쪽에 맞춰질 수 있다.[](source:filter)[](source:m-gem)[](source:m-cod)

## mirror는 어떻게 만들어지나? {#mirrors}

스크립트는 같은 프롬프트로 세 CLI를 차례로 부른다. 세 결과가 모두 있을 때만 Gemini에게 교집합을 만들게 한다.[](source:gm-gen)[](source:gm-int)

@sequence id=mirror-gen title="generate_mirrors.ts 실행 순서"
| actor script | generate_mirrors.ts | backend | source:gm-dir |
| actor gem | agy (Gemini) | external | source:gm-cli |
| actor cla | claude | external | source:gm-cli |
| actor cod | codex | external | source:gm-cli |
| script | gem | mirror_prompt.md에 분야 이름을 넣어 호출 |
| gem | script | stdout을 gemini_mirror.md로 저장 | return |
| script | cla | 같은 프롬프트 호출 |
| cla | script | stdout을 claude_mirror.md로 저장 | return |
| script | cod | 같은 프롬프트 호출 |
| cod | script | stdout을 codex_mirror.md로 저장 | return |
| script | gem | 세 mirror와 intersection_prompt.md 전달 | emphasis |
| gem | script | stdout을 mirror.md로 저장 | return |

| 항목 | 원문 내용 |
|---|---|
| 인자 | 분야 이름 하나(`"JavaScript"`, `"CSS"` 예시). 없으면 사용법을 출력하고 종료한다. 출력 폴더는 소문자 이름이다.[](source:gm-dir) |
| CLI 실행 | `agy -p <prompt> --dangerously-skip-permissions`, `claude -p <prompt> --dangerously-skip-permissions --output-format text`, `codex exec <prompt>`. 실행 파일은 `ANTIGRAVITY_CLI_BIN`, `CLAUDE_CODE_CLI_BIN`, `CODEX_CLI_BIN`으로 바꾼다.[](source:gm-cli) |
| 프롬프트 지시 | 도구, 파일 읽기, 웹 검색을 쓰지 말고 학습된 지식만으로 가능한 한 빠짐없이 쓰라고 한다. 우선순위 없이 전부 쓰라는 것이다.[](source:mp) |
| 교집합 규칙 | 세 mirror 모두에 명확히 있는 것만 포함한다. 하나에서라도 빠졌으면 제외한다. 글자 그대로 증거가 있어야 하고 추정하지 않는다.[](source:ip-rules) |
| 실패 처리 | CLI 하나가 실패하면 그 파일만 건너뛴다. 셋 다 실패하면 종료 코드 1이다. 셋 중 하나라도 없으면 교집합은 경고만 남기고 만들지 않는다. 교집합 호출이 실패하면 오류 메시지만 출력한다.[](source:gm-gen)[](source:gm-int) |
| 덮어쓰기 | 같은 분야로 다시 돌리면 기존 mirror 파일을 덮어쓴다.[](source:gm-gen) |

@callout level=warning title="이 컬렉션에서 실행하지 않았다"
| 스크립트는 외부 CLI 3개를 `--dangerously-skip-permissions` 계열 옵션으로 호출한다. 이 분석은 소스만 읽었고 어떤 CLI도 부르지 않았다. 동작은 모두 지시상 동작이다.[](source:gm-cli) |

판정 두 가지와 표본에서 확인한 사실 세 가지다.

- 판정 · SKILL.md는 통합 mirror를 "exact mathematical intersection"이라 부른다. 실제로는 Gemini가 프롬프트에 따라 쓴 문장이라, 정확도는 모델 출력에 달려 있고 스크립트는 검증하지 않는다.[](source:gen)[](source:gm-int)[](source:ip)
- 판정 · "도구를 쓰지 말라"는 제한은 프롬프트 지시일 뿐이다. 스크립트는 `cwd` 옵션 없이 CLI를 호출하고 권한 확인을 건너뛴다. 모델이 실제로 파일을 읽었는지는 원문에 명시 없음.[](source:mp)[](source:gm-cli)
- 표본 · 생성된 `mirror.md`는 248줄이고 제목이 세 번(1줄, 82줄 "Revised", 168줄 "Final") 나온다. 같은 교집합의 판본이 겹쳐 쌓인 모양이다. 기준 판본은 SKILL.md에 명시 없음.[](source:m-uni)
- 표본 · `Object.groupBy()`는 Gemini mirror에만 한 번 나오고 Claude, Codex, 통합 mirror에는 없다. 4단계 보존 검사의 예시와 맞는다.[](source:m-gem)[](source:m-cla)[](source:m-cod)
- 표본 · 교집합 프롬프트는 반대 경우(Claude에는 있고 Gemini에는 없음)를 예로 든다. 실제 파일과 달라도 예시일 뿐이다.[](source:ip-rules)

@facts
| 모델 mirror 크기 | Gemini 91줄 5,927B · Claude 842줄 22,007B · Codex 1,941줄 40,753B[](source:m-gem)[](source:m-cla)[](source:m-cod) |
| 통합 mirror | 248줄 15,496B[](source:m-uni) |
| SKILL.md의 임시 파일 | 모델 mirror 3개는 "temporary", `mirror.md`만 통합본이다[](source:gen) |

## 이 스킬은 흐름 어디에 있나? {#position}

묶음 `guide-authoring-pipeline`의 변형 스킬이다. 필수 단계가 아니라 분야 전체 guide를 다룰 때 곁가지로 쓴다. 앞뒤 스킬은 이 스킬을 참고로 가리키거나 같은 `guide.md`를 고친다.

@workflow id=position-flow title="discipline guide를 둘러싼 스킬"
| uc | project-use-cases | backend | source:r-uc |
| val | project-guide-validation | backend | source:r-val |
| current | project-discipline-guides | backend | source:filter |
| pg | project-guides | backend | source:r-pg |
| uc > current | 참고 R04 | dashed |
| val > current | 참고 R11 | dashed |
| current > pg | 공유 상태 R15 | dashed |

@steps id=position-steps
| highlight | project-discipline-guides | 이 페이지의 스킬이다. 세 관계 모두 필수 순서가 아니다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R04 · 참고 | `project-use-cases`의 "Granular Guide Decomposition" 규칙이 허브 guide와 하위 guide 구조는 이 스킬을 보라고 안내한다. 낮은 수준 utility는 억지로 use case로 쪼개지 말고 상위 discipline guide에 넣으라고도 한다.[](source:r-uc) |
| R11 · 참고 | `project-guide-validation`은 해당 분야의 discipline guide가 `DISCIPLINE_GUIDES`에 있으면 새 guide가 그것을 따르는지 보고, 새 orientation guide는 그 목록에 추가해야 한다고 쓴다.[](source:r-val) |
| R15 · 공유 상태 | 둘 다 discipline guide의 `guide.md`를 다룬다. 이 스킬은 규칙을 줄이기만 한다. `project-guides`는 discipline guide의 `expectations.md` 항목이 다루는 요소나 기능 이름을 적어야 한다고 따로 정한다.[](source:filter)[](source:r-pg) |
| R31 · 참고 | `coherence-auditor`가 `.agents/skills/project-*/SKILL.md` 전체를 읽고 단계·역할이 서로 모순되지 않는지 확인한다. 이 스킬도 그 대상이다.[](source:r-ca) |
| R39 · 범위 밖 | mirror 생성이 모델 CLI `agy`, `claude`, `codex`를 부른다. 컬렉션 밖의 도구라 확인하지 못했다.[](source:gm-cli) |

전체 흐름은 색인 기준 `_group-guide-authoring-pipeline/guide-authoring-pipeline.html`에 있다.

## 어디까지 읽고 무엇을 못 봤나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 끝까지 읽은 텍스트 | `SKILL.md` 5,288B, `mirror_prompt.md` 1,232B, `intersection_prompt.md` 1,392B, `scripts/generate_mirrors.ts` 5,533B. 4개, 13,445B.[](source:skill)[](source:mp)[](source:ip)[](source:gm) |
| 구조·표본만 확인(전부 읽지 않음) | `mirrors/javascript/` 생성물 4개, 84,183B. 머리글 목록, 앞 25줄, 통합 mirror의 판본 경계와 `groupBy` 검색 결과만 봤다. 이 파일은 SKILL.md가 중간 산출물이라 부르는 생성물이다.[](source:m-uni)[](source:m-gem)[](source:m-cla)[](source:m-cod) |
| 관계 확인용 | 다른 스킬 4개의 해당 줄만 읽었다(R04, R11, R15, R31). 그 스킬 전체는 각자의 페이지가 맡는다.[](source:r-uc)[](source:r-val)[](source:r-pg)[](source:r-ca) |
| 제외 | 번역본은 이 컬렉션에 없다. 바이너리는 없다. |
| 원문 대조 | 단계 4개, 규칙 표 4행, 경고 1개, 스크립트 CLI 3개와 실패 처리 4가지, 관계 5행(R04, R11, R15, R31, R39)을 원문과 맞췄다. 필수 참조 파일을 읽으라는 지시는 SKILL.md 안에 "top level readme"의 모델 설정 안내 한 곳뿐이고, 그 파일은 컬렉션에 없다.[](source:gen) |

@callout level=open-question title="확인하지 못한 항목"
| `DISCIPLINE_GUIDES`와 `src/core/guide-validation.ts`, `src/build/audit-build.ts`는 컬렉션에 없어 등록 기준과 audit 동작을 확인하지 못했다. top-level readme의 모델 설정 방법도 보지 못했다. 스크립트와 스킬은 실행하지 않아 mirror가 실제로 어떻게 만들어지고 guide가 얼마나 줄어드는지는 미확인이다. 검증 실패 시 되돌아가는 단계와 판본이 겹친 `mirror.md`에서 기준 판본은 원문에 명시 없음. |

분석 중 원본은 고치지 않았다. 이 스킬 폴더에는 `candidate.archify.md`와 HTML 산출물만 만들었다.
