# baseline-status는 web 기능의 지원 상태를 어떻게 조회하게 하나? {#baseline-status-page}

`baseline-status`는 web 기능이 쓸 만한지, 브라우저 지원 데이터가 필요한지 확인할 때 `pnpm baselinestatus <query>`로 조회하게 하는 짧은 스킬이다. 결과는 Widely, Newly, Limited 세 단계로 읽는다.[](source:bs-use)[](source:bs-map)

- 조회어는 기능 ID나 설명이다. 구조화된 출력이 필요하면 `--json`을 붙인다.[](source:bs-cmd)
- 내부 코드 `high`, `low`, `false`가 각각 Widely, Newly, Limited로 바뀌어 나온다.[](source:bs-map)
- 이 스킬은 조회 방법만 안내한다. "widely available을 목표로 한다" 같은 기준은 부르는 쪽 스킬이 정한다.[](source:pgv-base)
- 활성화 제한, 사람 개입, 종료 조건은 원문에 명시 없음.[](source:bs-full)

@answer scope="로컬 원본 분석 · 명령 실행 없음 · 조회 도구 미확인"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source bs-full title="modern-web-guidance-src/baseline-status/SKILL.md · 899B · 원본" path=modern-web-guidance-src/baseline-status/SKILL.md
@source bs-front title="modern-web-guidance-src/baseline-status/SKILL.md · 899B · 원본" path=modern-web-guidance-src/baseline-status/SKILL.md lines=1:4
@source bs-use title="modern-web-guidance-src/baseline-status/SKILL.md · 899B · 원본" path=modern-web-guidance-src/baseline-status/SKILL.md lines=6:8
@source bs-cmd title="modern-web-guidance-src/baseline-status/SKILL.md · 899B · 원본" path=modern-web-guidance-src/baseline-status/SKILL.md lines=10:25
@source bs-map title="modern-web-guidance-src/baseline-status/SKILL.md · 899B · 원본" path=modern-web-guidance-src/baseline-status/SKILL.md lines=27:32
@source pgv-base title="modern-web-guidance-src/project-guide-validation/SKILL.md · 14156B · 관계 확인용 일부" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=77:80
@source pgv-unsup title="modern-web-guidance-src/project-guide-validation/SKILL.md · 14156B · 관계 확인용 일부" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=94:94
@source lock-bs title="modern-web-guidance-src/skills-lock.json · 3621B · 설치 출처" path=modern-web-guidance-src/skills-lock.json lines=4:9
@source lock title="modern-web-guidance-src/skills-lock.json · 3621B · 설치 출처" path=modern-web-guidance-src/skills-lock.json

## 언제 쓰고, 어떻게 조회하나? {#query}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻은 아니다. 호출 제한 필드(`disable-model-invocation` 등)는 원문에 명시 없음.[](source:bs-front)

@code source=bs-front language=yaml

원문은 두 경우에 쓰라고 한다. 기능을 써도 되는지 확인할 때, 특정 기능의 브라우저 지원 데이터가 필요할 때다.[](source:bs-use)

| 목적 | 명령 | 원문 예 |
|---|---|---|
| ID나 설명으로 기능 검색 | `pnpm baselinestatus <query>` | `pnpm baselinestatus over`[](source:bs-cmd) |
| 파싱하기 쉬운 구조화 출력 | `pnpm baselinestatus <query> --json` | `pnpm baselinestatus over --json`[](source:bs-cmd) |

## 결과의 상태 이름은 무엇을 뜻하나? {#mapping}

출력은 내부 상태 코드를 사람이 읽는 이름으로 바꿔 보여 준다.[](source:bs-map)

| 출력 이름 | 내부 코드 | 원문 정의 |
|---|---|---|
| Widely {good:가장 안전} | `high` | 주요 브라우저가 모두, 상당 기간 지원한다 |
| Newly {caution:최근 지원} | `low` | 주요 브라우저가 모두, 최근에 지원하기 시작했다 |
| Limited {bad:일부 미지원} | `false` | 주요 브라우저가 아직 모두 지원하지는 않는다 |

원문은 "상당 기간"과 "최근"의 기준 기간을 적지 않는다. 기간 수치는 원문에 명시 없음.[](source:bs-map)

판정 · 이 스킬은 결과를 읽는 방법까지만 정한다. 결과를 보고 폴백을 쓸지는 호출하는 쪽의 규칙이다.[](source:bs-map)

`project-guide-validation`의 예: demo는 widely available을 목표로 하고, 그렇지 않은 기능이면 demo가 guide의 폴백 전략을 보여 줘야 한다(MUST). 이 기준으로는 Newly와 Limited가 모두 widely available이 아닌 경우다.[](source:pgv-base)

## 다른 스킬과 어디에서 이어지나? {#position}

이 스킬은 guide 작성 흐름 안에서 검증 단계가 조회하는 도구다. 앞뒤로 이어지는 필수 단계는 없다.

@workflow id=position-flow title="검증이 지원 상태를 조회한다"
| caller | project-guide-validation | backend | source:pgv-base |
| current | baseline-status | external | source:bs-use |
| caller > current | 참고 R12 | dashed |

@steps id=position-steps
| q1 | project-guide-validation | Baseline과 폴백 검증에서 기능이 widely available인지 조회한다. 지원하지 않는 브라우저를 찾을 때도 같은 조회를 쓴다.[](source:pgv-base)[](source:pgv-unsup) | position-flow | caller |
| q2 | baseline-status | 이 페이지의 스킬이다. 조회 명령과 상태 이름을 안내한다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R12 · 참고 ← `project-guide-validation` | 기능이 widely available인지 조회할 때 `web-baseline` 스킬과 `gd baselinestatus <query>`(또는 `pnpm baselinestatus <query>`)를 쓰라고 한다. 조회 결과(Widely, Newly, Limited)가 오간다. 이 스킬 본문에는 `pnpm` 명령만 있고 `gd baselinestatus`는 없다.[](source:pgv-base)[](source:bs-cmd) |

링크 이름이 맞지 않는다.

- `project-guide-validation`은 `../web-baseline/SKILL.md`로 링크하지만, 이 컬렉션에는 `web-baseline/` 폴더가 없다.[](source:pgv-base)
- 이 폴더의 frontmatter `name`은 `baseline-status`이고, lock에서는 `baseline-status` 항목의 `skillPath`가 `.agents/skills/web-baseline/SKILL.md`다.[](source:bs-front)[](source:lock-bs)

판정 · lock의 `skillPath`가 같은 스킬을 가리킨다는 근거로 두 이름을 같은 스킬로 읽었다. 원문이 두 이름이 같다고 직접 밝히지는 않는다.

`BASELINE_STATUS` 같은 build-time macro는 `project-guides`가 설명하는 별개의 것이다. 이 스킬과 연결하지 않았다.

전체 흐름은 색인 기준 `_group-guide-authoring-pipeline/guide-authoring-pipeline.html`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `modern-web-guidance-src/baseline-status/SKILL.md` 1개, 899B를 끝까지 읽었다.[](source:bs-full) 이 폴더에는 다른 파일이 없다 |
| 관계 확인용 | `project-guide-validation/SKILL.md`는 77~80줄과 94줄만 읽었다. `skills-lock.json`(3,621B)과 관계 원장도 확인했다[](source:pgv-base)[](source:pgv-unsup)[](source:lock) |
| 제외 | 번역본은 이 컬렉션에 없다. 바이너리도 없다 |
| 부분 읽음 | 대상 스킬 폴더는 0개 |

원문의 사용 조건 2가지, 명령 2개, 상태 매핑 3개를 모두 대조했다. 원문의 `pnpm` 명령은 읽기만 했고 실행하지 않았다.

@callout level=open-question title="확인하지 못한 부분"
| `pnpm baselinestatus`가 정의된 `package.json`과 구현은 이 저장소에 없어, 명령이 실제로 무엇을 조회하고 어떤 형식으로 출력하는지 확인하지 못했다. 원문 예의 `over`가 어떤 기능을 찾는지도 모른다. `--json` 출력의 필드는 원문에 명시 없음. 이 스킬이 어떤 데이터 출처(예: `web-features`)를 쓰는지도 원문에 명시 없음. |

분석 중 원본은 수정하지 않았다. 새 분석 초안과 HTML만 썼다.
