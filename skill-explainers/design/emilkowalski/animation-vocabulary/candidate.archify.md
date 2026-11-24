# animation-vocabulary — 모호한 모션 묘사를 정확한 웹 애니메이션 용어로 찾아 주는 스킬 {#overview}

`animation-vocabulary`는 에이전트가 사용자의 모호한 시각·느낌 묘사를 내장 용어집과 대조해 정확한 웹 애니메이션 용어와 원문 정의로 역조회하게 하는 스킬이다.[](source:s-fm)[](source:s-inst)

- "이 움직임을 뭐라고 부르나?"처럼 이름만 모르거나 AI·디자이너에게 요청할 정확한 용어가 필요할 때 켜진다. 질문 없이 처음 불리면 고정 문구 한 줄만 답하고 기다린다.[](source:s-fm)[](source:s-init)
- 결과로 `**용어** — 원문 정의` 형식의 용어 한 줄과, 필요 시 1~2개의 유사 용어 비교가 남는다.[](source:s-quick)
- 다른 스킬과의 관계: 조사 범위에서 확인된 연결 없음.
- 하지 않는 것: 용어집 정의를 임의로 고쳐 쓰거나 새 용어를 지어내지 않고, 애니메이션을 직접 설계하거나 구현하지 않는다.[](source:s-fm)[](source:s-inst)

@answer scope="design/emilkowalski/animation-vocabulary · 원본 파일 1개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source s-fm title="frontmatter: name과 description" path=design/emilkowalski/animation-vocabulary/SKILL.md lines=1:4
@source s-init title="초기 응답과 목적" path=design/emilkowalski/animation-vocabulary/SKILL.md lines=8:16
@source s-quick title="Quick Start 출력 형식" path=design/emilkowalski/animation-vocabulary/SKILL.md lines=18:27
@source s-inst title="조회·인용 규칙 6가지" path=design/emilkowalski/animation-vocabulary/SKILL.md lines=28:36
@source s-ex title="질의 응답 예시 3종" path=design/emilkowalski/animation-vocabulary/SKILL.md lines=37:62
@source s-gl-1 title="용어집: 등장·종료와 순서·타이밍" path=design/emilkowalski/animation-vocabulary/SKILL.md lines=64:83
@source s-gl-2 title="용어집: 이동·전환·스크롤" path=design/emilkowalski/animation-vocabulary/SKILL.md lines=84:109
@source s-gl-3 title="용어집: 피드백·easing·spring" path=design/emilkowalski/animation-vocabulary/SKILL.md lines=110:140
@source s-gl-4 title="용어집: 반복·효과·성능·원칙" path=design/emilkowalski/animation-vocabulary/SKILL.md lines=141:179

## 어떻게 동작하나 {#flow span=12}

원문은 순서 있는 작업 절차 대신 조회·인용·구분 기준 6가지를 정한다. 그래서 상황별 판단과 출력 형식을 표로 묶었다.[](source:s-inst)

| 적용 상황 | 참조 파일 | 바뀌는 판단 | 출력 사례 |
| --- | --- | --- | --- |
| 질문 없는 초기 호출 | `SKILL.md` (`Initial Response`) | 다른 안내나 용어 목록을 미리 내보내지 않고 고정 문구 한 줄만 답한 뒤 사용자 질문을 기다린다. | 준비 문구 한 줄만 출력[](source:s-init) |
| 모호한 느낌·동작 묘사 | `SKILL.md` (`Instructions`, `Glossary`) | 단어 일치가 아니라 사용자가 보거나 느낀 의도를 12개 갈래 91개 용어에 매핑하고, 용어집 정의를 의역 없이 원문 그대로 인용한다. | `**Origin-aware animation** — An element animates out of its trigger...`[](source:s-inst)[](source:s-ex)[](source:s-gl-2) |
| 비슷한 용어 여러 개 해당 | `SKILL.md` (`Quick Start`, `Instructions`) | 가장 잘 맞는 용어를 맨 앞에 두고, 1~2개 대체 후보를 한 줄 차이 설명과 함께 붙여 구분해 준다. | `**Morph**` 아래에 `Crossfade`, `Shared element transition` 차이 1줄씩 제시[](source:s-quick)[](source:s-ex) |
| 정확히 일치하는 용어 없음 | `SKILL.md` (`Instructions`) | 새 용어를 지어내지 않고 가장 가까운 근사 용어를 밝히거나 용어집 단어 조합으로 설명하며, 정말 없으면 없다고 말한다. | `stagger`와 `scale-in` 조합 설명 또는 용어집 부재 알림[](source:s-inst) |
| 답변 길이와 설계·구현 경계 | `SKILL.md` (`description`, `Instructions`) | 장황한 설명 대신 용어와 정의로 바로 시작해 요청 시에만 부연하고, 모션을 설계하거나 구현하지 않는다. | `**Rubber-banding** — Resistance and snap-back...` 한 줄 답변[](source:s-fm)[](source:s-inst)[](source:s-ex) |

이 규칙의 핵심은 용어집을 권위 있는 원천으로 고정하는 데 있다.[](source:s-inst) 사용자가 "팝오버가 버튼에서 커지는 느낌"이나 "iOS에서 당겼다 놓을 때의 저항"처럼 감각만 말해도, 에이전트가 임의 용어를 만들지 않고 정해진 91개 정의 안에서 일관된 이름을 돌려준다.[](source:s-ex)[](source:s-gl-1)[](source:s-gl-3)[](source:s-gl-4)

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(description). "이게 뭐라고 부르나" 같은 질문이나 이름 모를 모션 묘사에서 켜진다. 호출 제한 필드는 frontmatter에 없다.[](source:s-fm) |
| 성격 | 12개 갈래 91개 용어집을 원문 그대로 인용해 모션 이름을 역조회하고 유사 용어를 가려 주는 사전형 원칙 스킬이다.[](source:s-inst)[](source:s-gl-1) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| 없음 {#none} | - | - | 조사 범위에서 확인된 연결 없음 |

`description`은 모션을 설계하거나 구현할 때가 아니라 이름을 찾을 때만 쓰라고 경계를 적지만, 다른 스킬 이름을 직접 가리키지는 않는다.[](source:s-fm)

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 초기 응답, 출력 형식, 6가지 조회 규칙, 예시 3종, 12개 갈래 91개 용어집을 담은 유일한 파일 | 스킬이 켜질 때 읽는다. | 질문 없는 초기 호출, 모호한 느낌·동작 묘사, 비슷한 용어 여러 개 해당, 정확히 일치하는 용어 없음, 답변 길이와 설계·구현 경계 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 구체적 질문 없이 스킬이 처음 켜진 경우 | 고정 문구 한 줄만 출력하고 질문이 올 때까지 멈춘다. | [](source:s-init) |
| 용어집 정의를 인용할 때 | 의역하거나 요약하지 않고 용어집 문구를 그대로 인용한다(의무). | [](source:s-inst) |
| 용어집에 없는 개념을 물을 때 | 새 용어를 지어내는 것은 금지다. 근사치임을 밝히고 기존 용어로 풀거나, 용어집에 없다고 말한다. | [](source:s-inst) |
| 사용자가 설명 확장을 요청하지 않았을 때 | 용어와 정의만 간결히 답하고 에세이처럼 늘이지 않는다. | [](source:s-inst) |
| 애니메이션 설계·구현을 함께 요구할 때 | 이 스킬은 이름 찾기 전용이므로 설계나 구현을 수행하지 않는다. | [](source:s-fm) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 12개 갈래 91개 용어집 전체 — 모호한 느낌·동작 묘사 · 등장·타이밍·이동·전환·스크롤·피드백·`easing`·`spring`·반복·효과·성능·원칙 갈래의 개별 용어 정의는 길어서 개요에서 묶어 적었다.

@callout level=open-question title="확인하지 못한 것"
| 모션 설계·구현을 함께 요청할 때 `animate` 등 다른 형제 스킬로 넘기라는 지시는 원문에 명시 없음이다.[](source:s-fm) |
| 용어집 정의를 한국어로 번역해 답할지 영어 원문 정의를 그대로 둘지는 한국어 질의 기준으로는 원문에 명시 없음이다.[](source:s-inst) |

읽은 원본: 텍스트 파일 1개. 제외: `SKILL.ko.stale.md`(낡은 번역본이라 읽지 않음).
