# project-features — `new-feature` 이슈를 걸러 내고 web-feature ID를 하나로 정하기 {#overview}

`project-features`는 에이전트가 browser launch로 올라온 `new-feature` 이슈를 올리거나 분류할 때, 질문 4개로 guidance 대상인지 가르고 남긴 이슈에 web-feature ID를 정확히 하나만 붙이게 하는 스킬이다.[](source:pf-intro)[](source:pf-order)

- 쓰는 때: `new-feature` 이슈를 올릴 때, 분류할 때, ID를 고칠 때, launch에 guidance가 필요한지 정할 때다.[](source:pf-front)
- 결과: 대상인 이슈는 ID 하나와 필드가 채워진 상태로 남는다. 대상이 아닌 이슈는 label 변경, 닫기, 중복 처리, 증분 변경 처리 중 하나로 정리된다.[](source:pf-file)[](source:pf-handle)
- 다른 스킬과의 관계: 대상 이슈는 `project-use-cases`로 이어진다(다음 안내). `project-guides`는 참고로만 안내한다.[](source:pf-after)
- 하지 않는 것: 자격 있는 feature 이슈를 손으로 닫지 않고, comment·본문 수정·label·status·닫기 전에는 항상 사용자에게 확인한다.[](source:pf-confirm)[](source:pf-handle)

@answer scope="modern-web-guidance-src/project-features · 원본 파일 1개 · 지시상 동작 · 이슈 조작 없음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source pf-front title="이름과 description" path=modern-web-guidance-src/project-features/SKILL.md lines=1:4
@source pf-intro title="이슈의 역할과 자동화" path=modern-web-guidance-src/project-features/SKILL.md lines=8:15
@source pf-confirm title="사용자 확인" path=modern-web-guidance-src/project-features/SKILL.md lines=17:17
@source pf-order title="질문 순서" path=modern-web-guidance-src/project-features/SKILL.md lines=19:21
@source pf-q1 title="질문 1 기능 하나인가" path=modern-web-guidance-src/project-features/SKILL.md lines=23:28
@source pf-q2 title="질문 2 개발자 변화인가" path=modern-web-guidance-src/project-features/SKILL.md lines=30:44
@source pf-q3 title="질문 3 새 feature인가" path=modern-web-guidance-src/project-features/SKILL.md lines=46:53
@source pf-q4 title="질문 4 이미 등록됐나" path=modern-web-guidance-src/project-features/SKILL.md lines=55:63
@source pf-id title="2단계 ID 하나 정하기" path=modern-web-guidance-src/project-features/SKILL.md lines=65:73
@source pf-parser title="parser 함정" path=modern-web-guidance-src/project-features/SKILL.md lines=75:84
@source pf-file title="3단계 이슈 채우기" path=modern-web-guidance-src/project-features/SKILL.md lines=86:97
@source pf-handle title="4단계 맞지 않는 이슈 처리" path=modern-web-guidance-src/project-features/SKILL.md lines=99:111
@source pf-after title="분류 뒤 pipeline" path=modern-web-guidance-src/project-features/SKILL.md lines=113:121
@source uc-front title="project-use-cases 이름과 소개" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=1:14
@source pg-front title="project-guides 이름과 소개" path=modern-web-guidance-src/project-guides/SKILL.md lines=1:12
@source pm-data title="project-maintenance의 web-features 갱신" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=17:19
@source ca-pj title="coherence-auditor의 project 접두어 스킬 대조" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=42:49

## 어떻게 동작하나 {#flow span=12}

원문은 1단계 질문 4개를 순서대로 묻고 "첫 번째로 결론이 나는 질문에서 멈춘다"고 쓴다. 통과한 이슈는 2단계에서 ID를 정하고 3단계에서 필드를 채운다. 4단계는 통과하지 못한 이슈의 처리다. 질문 2에서 닫는 경우 7가지와 parser 함정 6가지는 결과를 가르므로 아래 표와 상세 후보에 나눠 둔다.[](source:pf-order)

@workflow id=flow-diagram title="project-features 흐름"
| lane gate1 | 질문 1·2 |
| lane gate2 | 질문 3·4 |
| lane id | 2 ID와 3 필드 |
| q1 | 기능 하나인가? | backend | gate1 | source:pf-q1 |
| relabel | label 바꾸기 | external | gate1 | source:pf-q1 |
| q2 | 개발자 변화인가? | backend | gate1 | source:pf-q2 |
| close | not planned로 닫기 | external | gate1 | source:pf-q2 |
| q3 | 새 feature인가? | backend | gate2 | source:pf-q3 |
| incr | 증분 변경 처리 | external | gate2 | source:pf-handle |
| q4 | 이미 등록됐나? | backend | gate2 | source:pf-q4 |
| dup | 중복 처리 | external | gate2 | source:pf-handle |
| pickid | ID 하나 정하기 | backend | id | source:pf-id |
| fill | 이슈 채우기 | backend | id | source:pf-file |
| q1 > q2 | 예 |
| q1 > relabel | 아니오 |
| q2 > q3 | 예 |
| q2 > close | 아니오 |
| q3 > q4 | 새 feature |
| q3 > incr | 증분 변경 |
| q4 > pickid | 없음 | emphasis |
| q4 > dup | 있음 |
| pickid > fill | ID 하나 |

@steps id=flow-steps
| s-q1 | 기능 하나인가? | **입력** `new-feature` 이슈 · **출력** 예 또는 아니오. **처리** 에이전트가 이슈가 web 플랫폼 기능 하나인지 본다. 주제나 문제에 대한 일반 요청이면 아니오다.[](source:pf-q1) **다음** 아니오면 닫지 않고 label을 바꾼다. | flow-diagram | q1 |
| s-relabel | label 바꾸기 | **입력** 기능이 아닌 요청 · **출력** 바꾼 label. **처리** 주제 요청은 `new-feature`를 떼고 `content`를 붙인다. 기존 guidance의 오류는 `new-feature`를 떼고 type을 `Bug`로 하고 `content`나 category label을 붙인다.[](source:pf-q1) **다음** `new-use-case`는 그 template의 필드(`### Category`, `### Use case slug`, `### web-feature-id`)와 제목 형식을 갖췄을 때만 쓴다. 안 그러면 sync가 연결 없는 `new-use-case` 이슈를 orphan으로 닫는다. | flow-diagram | relabel |
| s-q2 | 개발자 변화인가? | **입력** 이슈와 링크된 explainer·명세·feature tracker 항목 · **출력** 예 또는 아니오. **처리** 에이전트가 제목만으로 판단하지 않고 링크된 자료를 먼저 읽어, 일반 web 개발자가 코드를 쓰거나 바꿔야 하는지 본다.[](source:pf-q2) **다음** 아니오이거나 닫는 경우 7가지에 들면 닫는다. | flow-diagram | q2 |
| s-close | not planned로 닫기 | **입력** 개발자 변화가 없는 이슈 · **출력** not planned로 닫힌 이슈. **처리** 에이전트가 `new-feature` label을 떼고 한 줄 이유를 적어 닫는다.[](source:pf-q2) **다음** deprecation은 닫지 않고 증분 변경으로 처리한다. | flow-diagram | close |
| s-q3 | 새 feature인가? | **입력** 이슈의 launch · **출력** 새 feature 또는 증분 변경. **처리** 그 launch가 자기 web-features 항목을 갖거나 가질 만하면 새 feature로 보고 `new-feature`를 유지한다.[](source:pf-q3) **다음** web-features가 오래된 feature에 접어 넣었어도 독립 항목이 마땅하면 upstream에 요청하고 새 feature로 본다. | flow-diagram | q3 |
| s-incr | 증분 변경 처리 | **입력** 증분 변경 이슈 · **출력** 정리된 이슈. **처리** 에이전트가 `new-feature`를 떼고 guide와 이슈의 유무에 따라 sub-issue로 넣거나 `content` label로 열어 두거나 ATL에게 맡긴다.[](source:pf-handle) | flow-diagram | incr |
| s-q4 | 이미 등록됐나? | **입력** web-feature ID, 이름, 주요 API, tracker URL · **참조** `guides/**/guide.md` · **실행** `git grep -n "<id>" -- 'guides/**/guide.md'` · **출력** 있음 또는 없음. **처리** 에이전트가 열린 이슈와 닫힌 이슈를 모두 검색하고, guide가 그 ID나 `tmp-<id>`를 이미 쓰는지와 열린 PR도 확인한다.[](source:pf-q4) **다음** 일치가 나와도 이슈가 관련된 출시 feature의 ID를 빌린 것은 아닌지 2단계로 먼저 확인한다. | flow-diagram | q4 |
| s-dup | 중복 처리 | **입력** 같은 launch의 이슈 사본들 · **출력** 남긴 이슈와 닫힌 사본. **처리** 모든 사본의 comment를 먼저 읽고 소유자가 고른 이슈를 따른다. 없으면 오래된 이슈를 남기고 나머지는 `new-feature`를 떼 duplicate로 닫는다.[](source:pf-handle) | flow-diagram | dup |
| s-pickid | ID 하나 정하기 | **입력** launch의 BCD key와 web-features 항목 · **참조** webstatus.dev, `web-features` package, `features/pending-web-features.json` · **실행** 항목이 아직 없고 guide가 참조하면 `node src/ci/generate-feature-to-groups.ts` · **출력** 이슈당 ID 하나. **처리** 에이전트가 tracker의 ID를 믿지 않고 BCD key로 확인해 정확히 하나를 고른다.[](source:pf-id) **다음** launch에 feature가 여러 개면 ID마다 이슈를 하나씩 만들고 comment로 연결한다. sub-issue로 넣지 않는다. | flow-diagram | pickid |
| s-fill | 이슈 채우기 | **입력** 정한 ID · **참조** new-feature template · **출력** Title, `web-feature-id`, Feature description, Expected release date, Labels가 채워진 이슈. **처리** 에이전트가 template 필드를 채우거나 기존 이슈의 같은 필드를 고친다.[](source:pf-file) **다음** guidance를 어디에 둘지는 쓰지 않는다. ATL이 정한다. | flow-diagram | fill |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령은 원문에 명시 없음. 모델이 description을 보고 켠다. 호출 제한 필드는 없다[](source:pf-front) |
| 성격 | 이슈를 걸러 ID를 정하는 절차형 스킬. guide 작성 흐름의 첫 단계다 |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#r01} | `project-use-cases` | 다음 안내 | 이슈가 자격을 통과한 뒤 ATL이 use case를 찾는다. ATL이 use-case 이슈를 올리거나 stub guide를 추가하거나 기존 guide의 `web-feature-ids`에 ID를 더한다. 이슈 comment·본문·label·status·닫기 전에는 사용자에게 확인한다.[](source:pf-after)[](source:uc-front)[](source:pf-confirm) |
| **이 스킬** {#r02} | `project-guides` | 참고 | use-case 이슈가 닫히는 때(non-draft guidance와 `expectations.md`가 `main`에 오른 때)를 설명하며 "see the `project-guides` skill"이라고만 안내한다.[](source:pf-after)[](source:pg-front) |
| `project-maintenance` {#r33} | **이 스킬** | 대안 | 둘 다 web-features 갱신 뒤 `src/ci/generate-feature-to-groups.ts`를 실행하라고 한다. 연결을 지시한 문장은 없다(추론).[](source:pm-data)[](source:pf-id) |
| `coherence-auditor` {#r31} | **이 스킬** | 참고 | 서브에이전트가 `project-*` 스킬과 `docs/CONTEXT.md`가 서로 모순되지 않는지 읽어 확인한다. 접두어로 풀었다(판정).[](source:ca-pj)[](source:pf-front) |
| **이 스킬** {#r34} | sync(`src/ci/sync-use-cases.ts`)와 이슈 body checklist | 같은 파일 | `use-cases-start`와 `use-cases-end` 사이 checklist는 sync가 다시 쓰므로 손으로 고치지 않는다. 범위 밖이고 지시상 동작이다.[](source:pf-handle)[](source:pf-after) |

@architecture id=relation-map title="project-features와 이어지는 스킬"
| pm | project-maintenance | backend |
| ca | coherence-auditor | backend |
| self | project-features(이 스킬) | backend |
| uc | project-use-cases | backend |
| pg | project-guides | backend |
| pm > self | 대안 | dashed |
| ca > self | 참고 | dashed |
| self > uc | 다음 안내 | emphasis |
| self > pg | 참고 | dashed |

@code source=pf-front language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 질문 4개, ID 규칙, 필드, 처리 표, 분류 뒤 pipeline을 담은 유일한 파일이다 | 이슈를 올리거나 분류할 때 읽는다 | 기능 하나인가?, label 바꾸기, 개발자 변화인가?, not planned로 닫기, 새 feature인가?, 증분 변경 처리, 이미 등록됐나?, 중복 처리, ID 하나 정하기, 이슈 채우기 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| comment 작성, 본문 수정, label 변경, status 설정, 이슈 닫기 | 항상 먼저 사용자에게 확인한다(Always) | [](source:pf-confirm) |
| 질문 4개 중 하나에서 결론이 난다 | 거기서 멈춘다 | [](source:pf-order) |
| 주제 요청이나 기존 guidance의 오류 | 닫지 않고 label을 바꾼다 | [](source:pf-q1) |
| 개발자가 바꿀 것이 없는 launch | `new-feature`를 떼고 not planned로 닫는다. 이유는 한 줄이다 | [](source:pf-q2) |
| deprecation | 닫지 않는다. `new-feature`를 떼고 증분 변경으로 처리해 ATL이 guide 수정 여부를 정하게 한다 | [](source:pf-q2) |
| 이슈 하나의 ID | 정확히 하나다. 관련 feature 여럿이면 이슈를 나눈다 | [](source:pf-id) |
| 닫는 이슈가 중복이거나 자격이 없다 | 반드시 `new-feature`를 먼저 뗀다. sync가 닫힌 `new-feature` 이슈도 읽어서 같은 ID의 열린 이슈가 없으면 그 이슈에 use case를 연결하고 checklist를 다시 쓴다 | [](source:pf-handle) |
| 자격 있는 feature 이슈 | 손으로 닫지 않는다. 연결된 use case가 모두 guidance와 `expectations.md`를 갖추면 sync가 닫고, 닫힌 이슈를 다시 열지 않는다 | [](source:pf-handle) |
| `### web-feature-id` 형식이 틀린다 | parser가 오류 없이 무시하므로 어떤 자동화도 그 이슈를 보지 못한다 | [](source:pf-parser) |
| label 권한이 없다 | label을 붙이지 않고 comment로 제안한다 | [](source:pf-file) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 질문 2에서 닫는 경우 7가지 — 개발자 변화인가? · 개요에는 원칙과 deprecation 예외만 담았다. 경우별 원문 예(`dropEffect`, avar2, Web Serial API 등)는 상세로 남긴다.
- ID를 하나로 정하는 규칙 6가지 — ID 하나 정하기 · 개요에는 결론만 담았다. `tmp-` ID와 `features/pending-web-features.json` 등록 절차는 상세로 남긴다.
- parser 함정 6가지 — ID 하나 정하기 · 개요에는 "오류 없이 무시된다"만 담았다. 입력별 parser 동작은 상세로 남긴다.
- 증분 변경과 중복의 처리 표 5행 — 증분 변경 처리, 중복 처리 · 개요에는 처리 이름만 담았다.
- 분류 뒤 pipeline 5단계 — 이 스킬 다음 · 개요에는 `project-use-cases`로 이어진다는 것만 담았다.

@callout level=open-question title="확인하지 못한 것"
| `src/ci/atl-triage.ts`, `src/ci/sync-use-cases.ts`, `src/core/feature-parser.ts`, `.github/atls.json`, `features/pending-web-features.json`은 이 컬렉션에 없다. 원문이 설명하는 자동화 동작(ATL 배정, checklist 재작성, 이슈 닫기, parser)은 SKILL.md의 서술로만 옮겼고 코드로 검증하지 못했다. `git grep`과 GitHub 이슈 조작 명령은 지시상 동작이고 실행하지 않았다. |

읽은 원본: 텍스트 파일 1개. 제외: 없음.
