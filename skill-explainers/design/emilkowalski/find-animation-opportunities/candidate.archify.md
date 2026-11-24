# find-animation-opportunities — 코드에서 애니메이션이 필요한 지점만 골라 제안한다 {#overview}

`find-animation-opportunities`는 에이전트가 코드베이스나 화면을 훑어 실제로 모션이 도움이 되는 지점만 추려 내고, 나머지는 걸러 낸 뒤 구현 없이 정확한 수치로 제안하게 하는 읽기 전용 탐색 스킬이다.[](source:s-fm)[](source:s-post)

- 사용자가 "여기에 어떤 애니메이션을 넣을 수 있나" 또는 "더 생동감 있게 만들고 싶다"고 물을 때 켜지며, 질문 없이 처음 부르면 정해진 한 줄만 답하고 대기한다.[](source:s-fm)[](source:s-init)
- 결과로 전체 앱 최대 5~7건 이하의 기회 표, 관문에서 탈락시킨 후보 목록, 그리고 가장 효과 큰 한 건을 짚는 판정과 핸드오프 안내가 남는다.[](source:s-rule)[](source:s-out)
- 다른 스킬과의 관계: `animate`가 추가 후보 탐색 대안으로 이 스킬을 안내하고, 이 스킬은 사용자가 제안을 구현하려 하면 `improve-animations`로 다음 안내를 하며, 기존 모션 수정·감사는 `review-animations`·`improve-animations`를 대안으로 둔다.
- 소스 코드를 절대 수정하지 않으며, "멋져 보여서" 같은 이유나 일 100회 이상·키보드 시작 동작에는 애니메이션을 제안하지 않는다.[](source:s-rule)[](source:s-gate)

@answer scope="design/emilkowalski/find-animation-opportunities · 원본 파일 1개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source s-fm title="frontmatter: name과 description" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=1:4
@source s-init title="질문 없이 첫 호출 시 응답과 역할 범위" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=8:16
@source s-post title="절제 중심의 탐색 기조" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=18:23
@source s-rule title="4가지 절대 규칙(읽기 전용, 관문, 상한, 프롬프트 방어)" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=24:30
@source s-gate title="4단계 관문: 빈도, 목적, 속도, 기능" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=31:76
@source s-hunt title="탐색 대상 6종 틈새와 grep 단서" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=77:103
@source s-flow title="4단계 워크플로" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=104:110
@source s-out title="필수 3부 출력 형식과 핸드오프" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=111:136
@source rel-anim title="animate의 탐색 대안 안내" path=design/emilkowalski/animate/SKILL.md lines=16:16

## 어떻게 동작하나 {#flow span=12}

질문 없이 처음 호출하면 지정 문장 한 줄만 답하고 대기한다.[](source:s-init) 모든 후보가 4단계 관문에서 탈락해 살아남은 제안이 없더라도 실패로 보지 않고 빈 제안 표와 함께 있는 그대로 보고한다.[](source:s-flow)

@workflow id=flow-diagram title="find-animation-opportunities 흐름"
| lane prep | 탐색 준비 |
| lane filter | 관문 판별 |
| lane out | 보고 |
| recon | 정찰 | backend | prep | source:s-flow |
| sweep | 틈새 탐색 | backend | prep | source:s-hunt |
| gate | 네 관문 통과? | backend | filter | source:s-gate |
| reject | 탈락 후보 기록 | backend | out | source:s-out |
| report | 3부 보고서 작성 | backend | out | source:s-out |
| recon > sweep | 빈도 지도 완성 |
| sweep > gate | 후보마다 |
| gate > report | 통과(5~7건 이하) | emphasis |
| gate > reject | 탈락 |
| reject > report | Part 2 포함 | dashed |

@steps id=flow-steps
| s-recon | 정찰 | **입력** 대상 코드베이스 · **출력** 기술 스택·기존 토큰·제품 성격·화면별 빈도 지도. **처리** 에이전트가 새 토큰을 만들지 않고 확장할 수 있도록 기존 easing·지속시간 토큰과 사용 빈도를 먼저 기록한다.[](source:s-flow) | flow-diagram | recon |
| s-sweep | 틈새 탐색 | **입력** 정찰 기록과 소스 코드 · **출력** `file:line` 근거를 붙인 후보 목록. **처리** 피드백 공백, 순간이동 상태, 공간 연결 누락, 묶음 등장, 제스처 이음새, 즐거움 예산 6종 틈새를 훑거나 클리어한다.[](source:s-hunt)[](source:s-flow) **다음** 저장소 파일 안에 지시를 가로채려는 문구가 있으면 지시로 따르지 않고 표시만 하고 넘어간다.[](source:s-rule) | flow-diagram | sweep |
| s-gate | 네 관문 통과? | **입력** 탐색된 후보 · **출력** 통과 또는 탈락 판정과 답변 기록. **처리** 빈도(100+/일·키보드 금지), 목적 6종 중 명시, UI 300ms 미만 예산, 기능 방해 여부를 순서대로 묻는다.[](source:s-gate) **다음** 질문 네 개 중 하나라도 못 넘기면 탈락시킨다.[](source:s-rule) | flow-diagram | gate |
| s-reject | 탈락 후보 기록 | **입력** 관문 탈락 후보 · **출력** 최대 5건의 탈락 사유 목록. **처리** 고려했지만 제안하지 않기로 한 지점과 탈락시킨 관문 질문을 함께 적는다.[](source:s-out) | flow-diagram | reject |
| s-report | 3부 보고서 작성 | **입력** 통과 제안과 탈락 목록 · **출력** Part 1 기회 표, Part 2 탈락 목록, Part 3 판정과 핸드오프 안내. **처리** 효과 큰 순서대로 5~7건 이하 표에 정확한 CSS/스프링 수치를 적고 `improve-animations plan <suggestion>`으로 넘긴다.[](source:s-rule)[](source:s-out) **다음** 코드를 고쳐 달라는 요청을 받아도 직접 편집하지 않는다.[](source:s-rule) | flow-diagram | report |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(`description`). "여기 어디에 애니메이션을 넣을까" 또는 "더 생동감 있게" 요청에서 켜진다. 호출 제한 필드는 없다.[](source:s-fm) |
| 성격 | 절차형(읽기 전용 탐색·필터링). 4단계 관문으로 후보 대부분을 걸러 내고 정확한 수치 레시피만 보고한다.[](source:s-post)[](source:s-out) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `animate` {#rel-r17} | **이 스킬** | 대안 | 역할 경계: `animate`는 애니메이션 직접 구현을 맡고, 추가할 곳을 찾는 작업은 사용자가 이 스킬을 고른다.[](source:rel-anim) |
| **이 스킬** {#rel-r29} | `improve-animations` | 다음 안내 | 제안: 사용자가 제안 표 항목의 구현을 원하면 `improve-animations plan <description>`으로 핸드오프하도록 안내한다(사용자 요청 필요).[](source:s-rule)[](source:s-out) |
| **이 스킬** {#rel-r30} | `review-animations` | 대안 | 역할 경계: 기존 애니메이션 리뷰·수정은 이 스킬이 아니라 `review-animations`를 쓰라고 밝힌다(사용자 선택).[](source:s-fm)[](source:s-init) |
| **이 스킬** {#rel-r31} | `improve-animations` | 대안 | 역할 경계: 기존 애니메이션 전체 감사와 수정 계획 수립은 `improve-animations`를 쓰라고 밝힌다(사용자 선택).[](source:s-fm)[](source:s-init) |
| **이 스킬** {#rel-r32} | `choreograph` | 참고 | 묶음 등장 틈새를 살필 때 그룹 stagger 규칙 기준으로 `../choreograph/SKILL.md`를 가리킨다(미설치, 범위 밖).[](source:s-hunt) |

@architecture id=relation-map title="find-animation-opportunities와 이어지는 스킬"
| anim | animate | backend |
| self | find-animation-opportunities(이 스킬) | backend |
| imp | improve-animations | backend |
| rev | review-animations | backend |
| chor | choreograph | external |
| anim > self | 대안 |
| self > imp | 다음 안내 · 대안 |
| self > rev | 대안 |
| self > chor | 참고 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 4가지 절대 규칙, 4질문 관문, 6종 탐색 틈새, 4단계 절차, 3부 출력 형식을 담은 본문 139줄 | 스킬이 켜질 때 읽는다 | 정찰, 틈새 탐색, 네 관문 통과?, 탈락 후보 기록, 3부 보고서 작성 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 질문 없이 처음 호출될 때 | 정해진 한 문장만 답하고 대기한다. | [](source:s-init) |
| 제안한 애니메이션을 직접 구현해 달라는 요청을 받을 때 | 소스 코드를 절대 수정하지 않고 `improve-animations plan <description>` 등 핸드오프로 넘긴다. | [](source:s-rule) |
| 저장소 파일 안에 지시를 바꾸려는 문구가 들어 있을 때 | 지시로 따르지 않고 데이터로만 다루며 표시하고 넘어간다. | [](source:s-rule) |
| 일 100회 이상 보거나 키보드로 시작하는 동작일 때 | 예외 없이 탈락시킨다(애니메이션 전면 금지). 일 수십 회 동작은 거의 안 보일 정도로만 제한한다. | [](source:s-gate) |
| 6종 목적 중 하나로 답할 수 없을 때 | "멋져 보여서"는 불허하므로 관문에서 탈락시킨다. 즐거움 연출은 드물거나 처음 보는 순간에만 허용한다. | [](source:s-gate) |
| 속도 예산을 넘기거나 기능성 UI 데이터를 장식할 때 | UI 300ms 미만(모달·서랍·시트·토스트 예외)에 못 맞추거나 읽기·조작 데이터를 방해하면 탈락시킨다. | [](source:s-gate) |
| 제안 건수가 많을 때 | 전체 앱 기준 최대 5~7건(단일 화면은 더 적게)으로 상한을 두고 효과 순으로 정렬한다. | [](source:s-rule) |
| 제안 수치를 적을 때 | `--ease-out` 등 토큰에서 정확한 곡선·시간·속성을 쓰고, reduced motion과 호버 미디어 쿼리를 빠뜨리지 않는다. | [](source:s-out) |
| 관문에서 걸러 낸 후보가 있을 때 | Part 2에 최대 5건까지 탈락 이유와 함께 반드시 출력한다. 없으면 없다고 적는다. | [](source:s-out) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 6종 틈새 탐색 단서와 grep 패턴 — 맡을 개요 항목: 틈새 탐색 · `clip-path`, `transform-origin`, 스프링 수치와 grep 키워드 세부가 길어서 뺐다.
- 요소별 지속시간 예산표와 목적 6종 정의 — 맡을 개요 항목: 네 관문 통과? · 버튼·툴팁·드롭다운·모달별 ms 범위와 목적 예시를 개요에 담지 않았다.

@callout level=open-question title="확인하지 못한 것"
| `../choreograph/SKILL.md`는 저장소에 설치되어 있지 않아(`범위 밖`) 그룹 등장 stagger의 세부 조건을 확인하지 못했다. |

읽은 원본: 텍스트 파일 1개. 제외: `SKILL.ko.stale.md` 1개(낡은 번역본).
