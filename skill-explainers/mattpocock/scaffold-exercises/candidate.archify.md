# scaffold-exercises 스킬은 에이전트를 어떻게 바꾸나 {#scaffold-exercises-skill}

`scaffold-exercises`를 쓰면 에이전트는 강의 계획을 받아 `exercises/` 아래에 연습 문제 폴더 골격을 만든다. 골격은 `pnpm ai-hero-cli internal lint`를 통과해야 하고, 통과하면 `git commit`으로 커밋한다.[](source:skill-intro)

- 폴더 이름은 `XX-section-name/`, `XX.YY-exercise-name/` 꼴의 번호와 소문자 대시 이름이다.[](source:skill-naming)
- 연습마다 `problem/`, `solution/`, `explainer/` 중 하나 이상을 두고, 각각에 비어 있지 않은 `readme.md`를 둔다. 골격만 만들 때는 `explainer/`가 기본이다.[](source:skill-variants)[](source:skill-readme)
- 완료 조건은 린트 통과다. 오류가 나면 통과할 때까지 고친다.[](source:skill-workflow)
- 판정: 사용자에게 묻거나 커밋 전에 확인받는 단계가 없다.[](source:skill-intro)[](source:skill-workflow)

@answer scope="mattpocock/scaffold-exercises · 원본 텍스트 파일 2개 · 커밋 0f0d1b0"
@meta locale=ko
@source skill-fm title="mattpocock/scaffold-exercises/SKILL.md · 3589B · frontmatter" path=mattpocock/scaffold-exercises/SKILL.md lines=1:4
@source skill-intro title="SKILL.md · 목표(린트와 커밋)" path=mattpocock/scaffold-exercises/SKILL.md lines=8:8
@source skill-naming title="SKILL.md · 폴더 이름 규칙" path=mattpocock/scaffold-exercises/SKILL.md lines=10:15
@source skill-variants title="SKILL.md · 연습 변형" path=mattpocock/scaffold-exercises/SKILL.md lines=17:25
@source skill-readme title="SKILL.md · 필수 파일" path=mattpocock/scaffold-exercises/SKILL.md lines=27:42
@source skill-workflow title="SKILL.md · Workflow" path=mattpocock/scaffold-exercises/SKILL.md lines=44:50
@source skill-lint title="SKILL.md · 린트 규칙 요약" path=mattpocock/scaffold-exercises/SKILL.md lines=52:63
@source skill-move title="SKILL.md · 이동과 이름 바꾸기" path=mattpocock/scaffold-exercises/SKILL.md lines=65:77
@source skill-example title="SKILL.md · 계획에서 골격 만들기 예시" path=mattpocock/scaffold-exercises/SKILL.md lines=79:106
@source oa-yaml title="mattpocock/scaffold-exercises/agents/openai.yaml · 108B · 표시 정보" path=mattpocock/scaffold-exercises/agents/openai.yaml lines=1:3

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

frontmatter에 `disable-model-invocation`이 없다. 그래서 모델이 `description`을 보고 스스로 켤 수 있다.[](source:skill-fm) `agents/openai.yaml`에도 `policy` 블록이 없다.[](source:oa-yaml)

`description`이 그리는 상황은 연습 문제 골격, 연습 스텁, 새 강의 절을 만들고 싶을 때다. 판정: `ai-hero-cli` 린터가 있는 강의 저장소를 전제로 한다. 다른 저장소에서는 완료 조건을 확인할 수 없다.[](source:skill-intro)

## 어떤 순서로 만드나 {#flow}

@workflow id=scaffold-flow title="scaffold-exercises 진행 흐름"
| parse | 계획 읽기 | backend |
| mkdir | 폴더 만들기 | backend |
| readme | readme 작성 | backend |
| lint | 린트 통과? | backend |
| commit | 커밋 | backend |
| parse > mkdir | | |
| mkdir > readme | | |
| readme > lint | | |
| lint > readme | 아니오 | dashed |
| lint > commit | 예 | emphasis |

@steps id=scaffold-steps
| s-parse | 계획 읽기 | 계획에서 절 이름, 연습 이름, 변형 종류를 뽑는다. | scaffold-flow | parse |
| s-mkdir | 폴더 만들기 | 경로마다 `mkdir -p`를 실행한다. | scaffold-flow | mkdir |
| s-readme | readme 작성 | 변형 폴더마다 제목이 있는 `readme.md`를 하나씩 만든다. 골격에는 제목과 설명 한 줄이면 된다. | scaffold-flow | readme |
| s-lint | 린트 통과? | `pnpm ai-hero-cli internal lint`를 돌린다. 오류가 나면 고치고 다시 돌린다. | scaffold-flow | lint |
| s-commit | 커밋 | `git commit`으로 커밋한다. 이 단계는 Workflow 목록이 아니라 첫 문장에만 있다. | scaffold-flow | commit |

1~5단계는 Workflow 절을 따른다.[](source:skill-workflow) 커밋은 스킬 첫 문장에 있다.[](source:skill-intro)

@tree id=scaffold-tree title="원문 예시로 만드는 폴더"
| root | exercises | - |
| sec | 05-memory-skill-building | root |
| e1 | 05.01-introduction-to-memory | sec |
| e1x | explainer/readme.md | e1 |
| e2 | 05.02-short-term-memory | sec |
| e2x | explainer · problem · solution | e2 |
| e3 | 05.03-long-term-memory | sec |
| e3x | explainer/readme.md | e3 |

위 트리는 원문의 "Section 05" 계획 예시를 그대로 옮긴 것이다. `05.02`만 세 변형을 모두 갖고, 각 폴더에 `readme.md`가 하나씩 들어간다.[](source:skill-example)

## 린트는 무엇을 보나 {#lint}

| 린트 규칙 | 비고 |
| --- | --- |
| 연습마다 하위 폴더가 있다 | 아래 불일치 참고[](source:skill-lint) |
| `problem/`, `explainer/`, `explainer.1/` 중 하나 이상이 있다 | `explainer.1/`은 이 절에만 나온다 |
| 주 폴더의 `readme.md`가 있고 비어 있지 않다 | 제목 한 줄이면 충분[](source:skill-readme) |
| `.gitkeep`, `speaker-notes.md` 파일이 없다 | 금지 |
| readme에 깨진 링크가 없다 | 금지 |
| readme에 `pnpm run exercise` 명령이 없다 | 금지 |
| readme만 있는 연습이 아니면 하위 폴더마다 `main.ts`가 있다 | 코드가 있으면 1줄 넘게[](source:skill-readme) |

연습 번호를 바꾸거나 옮길 때는 `mv` 대신 `git mv`를 쓴다. git 기록을 지키기 위해서다. 번호 접두어를 고쳐 순서를 맞추고 린트를 다시 돌린다.[](source:skill-move)

@callout level=warning title="원문 안의 불일치"
변형 절은 세 폴더 중 "하나 이상"이면 된다고 한다.[](source:skill-variants) 린트 요약 첫 줄은 세 폴더를 모두 가진 것처럼 쓰고, 둘째 줄은 `solution/`을 빼고 `explainer.1/`을 넣는다.[](source:skill-lint) 판정: `solution/`만 있는 연습은 변형 절로는 맞지만 린트 요약으로는 실패한다. 필수 파일 절은 하위 폴더마다 readme를 요구하고, 린트 요약은 주 폴더만 본다.[](source:skill-readme)

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `agents/openai.yaml`. 두 파일 모두 원본이다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준). 원장에 이 스킬의 관계 행은 없다.
- 실행하지 않았다. 폴더 생성·린트·커밋은 모두 지시상 동작이다. `ai-hero-cli` 린터의 실제 규칙은 확인하지 않았다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
커밋 메시지, 커밋 범위, 린트를 끝내 통과하지 못할 때의 멈춤 조건은 원문에 명시 없음. "주 폴더"가 어느 폴더인지도 원문에 명시 없음.
