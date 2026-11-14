# project-features는 new-feature 이슈를 어떻게 걸러 내고 ID를 붙이게 하나? {#project-features-page}

`project-features`는 browser launch로 올라온 `new-feature` 이슈가 guidance 대상인지 먼저 가르고, 남긴 이슈에는 web-feature ID를 **정확히 하나**만 붙이게 한다. 이 ID가 ATL 배정, use-case 연결, coverage 계산의 열쇠라서, 틀린 ID는 이슈를 자동화 밖으로 밀어내거나 일찍 닫히게 만든다.[](source:pf-intro)[](source:pf-id)

- 자격은 질문 4개를 순서대로 묻고, 첫 질문에서 결론이 나면 멈춘다.[](source:pf-order)
- 개발자가 코드를 바꿀 일이 없는 launch는 `new-feature` label을 떼고 not planned로 닫는다.[](source:pf-q2)
- ID는 `### web-feature-id` 아래 첫 줄만 읽히고, 형식이 틀려도 오류 없이 무시된다.[](source:pf-parser)
- comment, 본문 수정, label, status, 닫기 전에는 항상 사용자에게 확인한다.[](source:pf-confirm)

@answer scope="로컬 원본 분석 · 외부 저장소 파일 미확인 · 이슈 조작 없음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source pf-full title="modern-web-guidance-src/project-features/SKILL.md · 16922B · 원본" path=modern-web-guidance-src/project-features/SKILL.md
@source pf-front title="modern-web-guidance-src/project-features/SKILL.md · 16922B · 원본" path=modern-web-guidance-src/project-features/SKILL.md lines=1:4
@source pf-intro title="modern-web-guidance-src/project-features/SKILL.md · 16922B · 원본" path=modern-web-guidance-src/project-features/SKILL.md lines=8:15
@source pf-confirm title="modern-web-guidance-src/project-features/SKILL.md · 16922B · 원본" path=modern-web-guidance-src/project-features/SKILL.md lines=17:17
@source pf-order title="modern-web-guidance-src/project-features/SKILL.md · 16922B · 원본" path=modern-web-guidance-src/project-features/SKILL.md lines=19:21
@source pf-q1 title="modern-web-guidance-src/project-features/SKILL.md · 16922B · 원본" path=modern-web-guidance-src/project-features/SKILL.md lines=23:28
@source pf-q2 title="modern-web-guidance-src/project-features/SKILL.md · 16922B · 원본" path=modern-web-guidance-src/project-features/SKILL.md lines=30:44
@source pf-q3 title="modern-web-guidance-src/project-features/SKILL.md · 16922B · 원본" path=modern-web-guidance-src/project-features/SKILL.md lines=46:53
@source pf-q4 title="modern-web-guidance-src/project-features/SKILL.md · 16922B · 원본" path=modern-web-guidance-src/project-features/SKILL.md lines=55:63
@source pf-id title="modern-web-guidance-src/project-features/SKILL.md · 16922B · 원본" path=modern-web-guidance-src/project-features/SKILL.md lines=65:73
@source pf-parser title="modern-web-guidance-src/project-features/SKILL.md · 16922B · 원본" path=modern-web-guidance-src/project-features/SKILL.md lines=75:84
@source pf-file title="modern-web-guidance-src/project-features/SKILL.md · 16922B · 원본" path=modern-web-guidance-src/project-features/SKILL.md lines=86:97
@source pf-handle title="modern-web-guidance-src/project-features/SKILL.md · 16922B · 원본" path=modern-web-guidance-src/project-features/SKILL.md lines=99:111
@source pf-after title="modern-web-guidance-src/project-features/SKILL.md · 16922B · 원본" path=modern-web-guidance-src/project-features/SKILL.md lines=113:121
@source uc-front title="modern-web-guidance-src/project-use-cases/SKILL.md · 12896B · 관계 확인용 일부" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=1:14
@source pg-front title="modern-web-guidance-src/project-guides/SKILL.md · 26181B · 관계 확인용 일부" path=modern-web-guidance-src/project-guides/SKILL.md lines=1:12
@source lock title="modern-web-guidance-src/skills-lock.json · 3621B · 설치 출처" path=modern-web-guidance-src/skills-lock.json

## 이 이슈를 guidance 대상으로 남기나? {#qualify}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻은 아니다. 호출 제한 필드(`disable-model-invocation` 등)는 원문에 명시 없음.[](source:pf-front)

@code source=pf-front language=yaml

에이전트는 이슈 하나에 대해 아래 질문을 위에서부터 묻는다. 어느 질문이든 결론이 나면 거기서 멈춘다.[](source:pf-order)

@workflow id=qualify-flow title="자격 판정 순서"
| q1 | 기능 하나인가? | backend |
| q2 | 개발자 변화인가? | backend |
| q3 | 새 feature인가? | backend |
| q4 | 이미 등록됐나? | backend |
| relabel | label 바꾸기 | external |
| close | not planned로 닫기 | external |
| incr | 증분 변경 처리 | external |
| dup | 중복 처리 | external |
| pickid | ID 하나 정하기 | external |
| q1 > q2 | 예 |
| q1 > relabel | 아니오 |
| q2 > q3 | 예 |
| q2 > close | 아니오 |
| q3 > q4 | 새 기능 |
| q3 > incr | 증분 |
| q4 > pickid | 없음 | emphasis |
| q4 > dup | 있음 |

@steps id=qualify-steps
| s1 | 기능 하나인가? | 주제나 문제에 대한 요청이면 닫지 않고 label을 바꾼다. 주제 요청은 `new-feature`를 떼고 `content`를 붙인다. 기존 guidance의 오류는 `new-feature`를 떼고 type을 `Bug`로 하고 `content`나 category label을 붙인다.[](source:pf-q1) | qualify-flow | q1 |
| s2 | 개발자 변화인가? | 개발자가 코드를 쓰거나 바꿔야 할 때만 남긴다. 판단 전에 explainer, 명세, feature tracker 항목을 먼저 읽는다. 닫을 때는 한 줄 이유를 적는다.[](source:pf-q2) | qualify-flow | q2 |
| s3 | 새 feature인가? | 그 launch가 자기 web-features 항목을 갖거나 가질 만하면 새 feature로 보고 `new-feature`를 유지한다. 이미 항목이 있는 feature를 넓히는 후속 launch는 증분 변경이다.[](source:pf-q3) | qualify-flow | q3 |
| s4 | 이미 등록됐나? | 등록 전에 열린 이슈와 닫힌 이슈를 모두 검색한다. guide가 그 ID를 이미 쓰는지도 확인한다.[](source:pf-q4) | qualify-flow | q4 |

질문 2에서 닫는 경우는 아래 일곱 가지다. 닫을 때는 `new-feature` label도 함께 뗀다.[](source:pf-q2)

| 닫는 경우 | 원문 예 |
|---|---|
| 브라우저가 개발자에게 보이는 변화가 없다고 설명한 launch | 원문에 명시 없음[](source:pf-q2) |
| API 추가나 권장 패턴 변경이 없는 bug fix, 명세 정렬 수정 | drag event의 `dropEffect` 값 정정[](source:pf-q2) |
| 렌더링, 글꼴 shaping, UA stylesheet, 초깃값, 저장소 backend 같은 자동 동작 | avar2 글꼴 렌더링, IndexedDB 새 저장소 backend[](source:pf-q2) |
| 같은 브라우저의 다른 플랫폼에 기존 API가 도착한 경우 | Android의 Web Serial API[](source:pf-q2) |
| 일반 개발자가 바꿀 것이 없는 내부 보안 강화, 특정 환경 전용 동작 | VDI 전용, 기업 정책 전용 변경[](source:pf-q2) |
| API 제거. 사용량이 충분히 낮아야 브라우저가 제거한다 | 원문에 명시 없음[](source:pf-q2) |
| 출시 없이 끝난 experiment나 trial | 원문에 명시 없음[](source:pf-q2) |

@callout level=warning title="deprecation은 닫지 않는다"
| deprecation은 제거와 다르다. guide가 해당 API를 말리기 시작해야 할 수 있으므로 닫지 않는다. `new-feature`를 떼고 증분 변경으로 처리해 ATL이 guide 수정 여부를 정하게 한다.[](source:pf-q2) |

## web-feature ID는 어떻게 하나로 정하나? {#feature-id}

이슈마다 ID는 정확히 하나여야 하고, guide의 `web-feature-ids`와 `tmp-` 접두어를 뺀 값이 같아야 한다. coverage는 이 일치로 세므로 닫힌 이슈의 ID도 맞게 유지한다.[](source:pf-id)

| 상황 | 에이전트가 하는 일 |
|---|---|
| ID 찾기 | webstatus.dev나 `web-features` package에서 찾는다.[](source:pf-id) |
| tracker에서 복사한 ID | 믿지 않는다. 원문 예: `AccentColor` 키워드에 `accent-color`, `getDisplayMedia()` 옵션에 `usermedia`, `polygon()` rounding에 `shape-function`. tracker에 틀린 ID가 있으면 작성자가 tracker 필드도 고치게 권한다.[](source:pf-id) |
| 기존 항목 재사용 | BCD key로 확인한다. 한 줄 description으로 판단하지 않는다. 항목이 실제로 그 launch를 포함할 때만 쓴다. 이미 출시된 기능의 ID를 빌리면 sync가 그 기능의 기존 guide를 새 이슈에 붙여 일찍 닫을 수 있다.[](source:pf-id) |
| 아직 web-features에 항목이 없음 | `features/draft/`와 upstream의 이슈·PR을 찾고, 없으면 upstream에 요청을 연다. GitHub 이슈의 `### web-feature-id` 첫 줄에 `tmp-` 없는 후보 ID를 쓰고 upstream 링크는 다음 줄이나 `### Feature description`에 둔다.[](source:pf-id) |
| guide나 stub이 아직 web-features에 없는 feature를 참조 | `guide.md`에 `tmp-<candidate-id>`를 쓰고 `features/pending-web-features.json`에 `issue` URL, `compat_features`의 BCD key, `group`을 등록한 뒤 `node src/ci/generate-feature-to-groups.ts`를 실행한다.[](source:pf-id) |
| 한 launch가 feature 여러 개 | ID마다 이슈를 하나씩 만들고 comment로 서로 연결한다. 형제이므로 sub-issue로 중첩하지 않는다. 예: `url()` 수정자 3개는 이슈 3개다.[](source:pf-id) |

parser(`src/core/feature-parser.ts`의 `extractFeatureIds`)는 엄격하고, 형식이 틀리면 오류 없이 무시되어 어떤 자동화도 그 이슈를 보지 못한다.[](source:pf-parser)

| 쓰면 안 되는 입력 | parser가 하는 일 |
|---|---|
| `### web-feature-id` 아래 둘째 줄 ID | 첫 줄만 읽어 둘째 줄은 버린다[](source:pf-parser) |
| `new-feature` 이슈에 쉼표로 ID 여러 개 | 쉼표를 나눠 두 feature를 한 이슈에 연결한다. 공백이나 `and`로 나누면 ID 하나로 읽혀 어디에도 맞지 않는다[](source:pf-parser) |
| 맨 URL 또는 Markdown 링크 | URL은 마지막 경로 조각(예: `4108`)이 ID가 된다. 링크는 `[id](https://...)` 문자열이 그대로 ID가 된다[](source:pf-parser) |
| `N/A`, `TBD`, `Missing`, `Pending` | 어디에도 맞지 않는 ID로 읽는다[](source:pf-parser) |
| 본문 어디든 `webstatus.dev/features/<id>` 링크 | 그 `<id>`를 ID로 읽는다. 관련 feature 페이지를 설명에 링크하지 않는다[](source:pf-parser) |
| 본문 어디든 `Feature ID:` 줄 | 첫 줄만이 아니라 모두 읽는다[](source:pf-parser) |

## 이슈는 어떻게 채우고, 맞지 않는 이슈는 어떻게 처리하나? {#file-handle}

[new-feature template](https://github.com/GoogleChrome/modern-web-guidance-src/issues/new?template=new-feature.yml)으로 이슈를 올린다. 자동화가 올린 기존 이슈를 분류할 때도 같은 필드를 고친다.[](source:pf-file)

| 필드 | 쓰는 내용 |
|---|---|
| Title | feature 이름. 예: "integrity() for url()". ID가 곧 이름일 때만 ID를 쓴다[](source:pf-file) |
| web-feature-id | Step 2의 ID 하나[](source:pf-file) |
| Feature description | web-features의 설명이나 브라우저 발표 요약. 명세나 tracker 항목을 링크한다[](source:pf-file) |
| Expected release date | 브라우저와 버전. 예: "Firefox 150". flag나 trial 뒤의 버전은 그렇게 표시하고, 알면 stable 버전도 쓴다. 표시 없는 버전은 stable로 읽힌다[](source:pf-file) |
| Coding agent assessment | 선택. 결과가 나쁘면 guidance가 필요하다는 힌트다. 결과가 좋아도 건너뛸 이유는 아니다. 신뢰할 수 있는 판단은 eval뿐이고 eval은 guidance를 쓰기로 한 뒤에 한다[](source:pf-file) |
| Labels | `new-feature`. `src/ci/atl-triage.ts`가 ID나 `group`으로 `.github/atls.json`에서 ATL을 찾는다. 매핑이 없으면 `needs-atl`이 붙는다. `css`, `forms`, `performance`, `security` 같은 category label을 붙이면 `needs-atl`이 빠진다. 그 group이 이미 더 구체적인 ATL로 가면 넓은 label을 붙이지 않는다. 붙이면 두 ATL이 모두 배정된다. label 권한이 없으면 comment로 제안한다[](source:pf-file) |

guidance를 어디에 둘지는 쓰지 않는다. ATL이 이슈를 분류하며 정한다.[](source:pf-file)

자격이 없는 이슈는 아래처럼 처리한다.[](source:pf-handle)

| 상황 | 처리 |
|---|---|
| 개발자 변화 없음 | `new-feature`를 떼고 한 줄 이유와 함께 not planned로 닫는다[](source:pf-handle) |
| 중복 | 모든 사본의 comment를 먼저 읽는다. 소유자가 남길 이슈를 골랐으면 따른다. 아니면 오래된 이슈를 남기고 나머지는 `new-feature`를 떼고 duplicate로 닫는다[](source:pf-handle) |
| 증분 변경이고 guide가 그 feature를 다룸 | `new-feature`를 뗀다. use-case 이슈가 열려 있으면 그 sub-issue로 중첩하고 변경을 comment로 적는다. guide가 이미 발행됐으면 `content`와 category label을 붙여 열어 둔 채 그 guide의 갱신으로 범위를 잡는다[](source:pf-handle) |
| 증분 변경이고 guide가 없지만 feature의 new-feature 이슈가 있음 | `new-feature`를 떼고 그 이슈의 sub-issue로 중첩한다[](source:pf-handle) |
| 증분 변경이고 guide도 이슈도 없거나 not planned로 닫힘 | `new-feature`를 떼고 ATL이 결정하게 둔다. ATL은 feature로 올리거나 메모와 함께 닫을 수 있다[](source:pf-handle) |

@callout level=warning title="사람이 직접 하지 말 것과 사용자 확인"
| 중복이나 자격 없는 이슈를 닫을 때는 반드시 `new-feature`를 먼저 뗀다. sync는 닫힌 `new-feature` 이슈도 읽어서, 같은 ID의 열린 이슈가 없으면 닫힌 이슈에 use case를 연결하고 checklist를 다시 쓴다.[](source:pf-handle) |
| 자격 있는 feature 이슈는 손으로 닫지 않는다. 연결된 use case가 모두 guidance와 `expectations.md`를 갖추면 sync가 닫고, 한번 닫힌 이슈는 다시 열지 않는다. `use-cases-start`와 `use-cases-end` 사이 checklist도 sync가 다시 쓰므로 고치지 않는다.[](source:pf-handle) |
| comment 작성, 본문 수정, label 변경, status 설정, 이슈 닫기 전에는 항상 사용자에게 확인한다.[](source:pf-confirm) |

## 다른 스킬과 어디에서 이어지나? {#position}

이 스킬은 guide 작성 흐름의 첫 단계다. 앞 단계는 컬렉션 안에 없다(자동화가 올린 이슈나 사람이 올린 이슈). 원문은 use case보다 앞이라고만 쓰고 단계 번호는 매기지 않는다. 0단계는 이 분석의 표기다.[](source:pf-intro)

@workflow id=position-flow title="feature 분류에서 use case로"
| current | project-features | backend | source:pf-intro |
| next | project-use-cases | backend | source:uc-front |
| ref | project-guides | external | source:pg-front |
| current > next | 넘김 R01 | emphasis |
| current > ref | 참고 R02 | dashed |

@steps id=position-steps
| p1 | project-features | 이 페이지의 스킬이다. 자격과 ID가 정해진 이슈만 다음으로 간다. | position-flow | current |
| p2 | project-use-cases | ATL이 use case를 찾는 단계다. | position-flow | next |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R01 · 넘김 → `project-use-cases` | 자격을 통과한 뒤 ATL이 use case를 찾는다. ATL은 새 use-case 이슈를 올리거나, 각 use case의 stub guide를 추가하거나, 기존 guide의 `web-feature-ids`에 이 feature의 ID를 더한다. 이 feature의 ID가 이슈에서 use-case 이슈와 `guide.md` frontmatter로 이어진다. 기존 완료 guide에 ID를 더할 때는 guide 내용과 `expectations.md`를 고치는 PR에 함께 넣는다. 따로 넣으면 sync가 feature 이슈를 이미 끝난 것으로 보고 곧바로 닫는다.[](source:pf-after)[](source:uc-front) |
| R02 · 참고 → `project-guides` | use-case 이슈는 non-draft guidance와 `expectations.md`가 `main`에 오르면 닫힌다. 원문은 이 부분을 `project-guides` skill을 보라고만 안내한다.[](source:pf-after)[](source:pg-front) |
| R34 · 공유 상태 (범위 밖) | 이슈 body checklist와 상태(Needs use cases, Needs guidance)는 `src/ci/sync-use-cases.ts`가 관리한다. 그 파일은 이 컬렉션에 없어 동작은 지시상 동작으로만 적는다.[](source:pf-handle)[](source:pf-after) |
| R33 · 같은 계열 → `project-maintenance` | 둘 다 web-features 갱신 뒤 `src/ci/generate-feature-to-groups.ts`를 실행하라고 한다. 연결을 지시한 문장은 없다.[](source:pf-id) |

전체 흐름은 색인 기준 `_group-guide-authoring-pipeline/guide-authoring-pipeline.html`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `modern-web-guidance-src/project-features/SKILL.md` 1개, 16,922B를 끝까지 읽었다.[](source:pf-full) 이 폴더에는 다른 파일이 없다 |
| 관계 확인용 | `project-use-cases/SKILL.md`는 1~14줄, `project-guides/SKILL.md`는 1~12줄만 읽었다. 관계 원장과 `skills-lock.json`(3,621B)도 확인했다[](source:uc-front)[](source:pg-front)[](source:lock) |
| 제외 | 번역본은 이 컬렉션에 없다. 바이너리도 없다 |
| 부분 읽음 | 대상 스킬 폴더는 0개 |

원문의 활성화 조건, 질문 4개와 닫는 경우 7개, 중복 검색 대상 3가지, ID 규칙 6개, parser 함정 6개, 필드 6개, 처리 상황 5개, 사용자 확인 조건을 모두 대조했다. 원문의 `git grep`, `node`, GitHub 이슈 조작 지시는 읽기만 했고 실행하지 않았다.

@callout level=open-question title="확인하지 못한 부분"
| `src/ci/atl-triage.ts`, `src/ci/sync-use-cases.ts`, `src/core/feature-parser.ts`, `.github/atls.json`, `features/pending-web-features.json`은 이 저장소에 없다. 원문이 설명하는 자동화 동작(ATL 배정, checklist 재작성, 이슈 닫기, parser가 오류 없이 무시하는 입력)은 SKILL.md의 서술로만 옮겼고 코드로 검증하지 못했다. 실제 이슈 분류 결과도 실행으로 확인하지 않았다. |

분석 중 원본은 수정하지 않았다. 새 분석 초안과 HTML만 썼다.
