# animate — 웹 애니메이션을 순서대로 판단해 구현하는 스킬 {#overview}

`animate`는 에이전트가 웹 애니메이션 요청을 받았을 때 구현 여부부터 도구·속성·easing·중단·접근성까지 정해진 순서대로 결정하고 코드를 작성하게 하는 스킬이다.[](source:s-fm)[](source:s-hard)

- 웹 컴포넌트나 화면 전환에 모션을 추가해 달라고 요청할 때 켜진다. 구체적 질문 없이 처음 불리면 고정 문구 한 줄만 답하고 사용자 질문을 기다린다.[](source:s-fm)[](source:s-init)
- 결과로 애니메이션 구현 코드와 짧은 요약(관문 결과·적용 재료·느낌 확인 대상)이 남는다. 빈도나 목적 관문을 넘지 못하면 코드를 쓰지 않고 정적 대안을 제안한다.[](source:s-freq)[](source:s-out)
- UI 컴포넌트 자체(토스트·드롭다운 등)가 필요하면 멈추고 `pick-ui-library`를 읽는다(호출). `review-animations`, `improve-animations`, `find-animation-opportunities`, `animate-expo`와는 역할이 갈린다(대안).[](source:s-tool)[](source:s-init)
- 하지 않는 것: 선택지 메뉴를 나열해 고르게 하지 않고, 코드베이스 밖의 임의 `cubic-bezier` 수치를 지어내지 않는다.[](source:s-posture)[](source:s-hard)

@answer scope="design/emilkowalski/animate · 원본 파일 2개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source s-fm title="frontmatter: name과 description" path=design/emilkowalski/animate/SKILL.md lines=1:4
@source s-init title="초기 응답과 역할 경계" path=design/emilkowalski/animate/SKILL.md lines=8:16
@source s-posture title="작업 태도와 두 가지 실패 유형" path=design/emilkowalski/animate/SKILL.md lines=18:27
@source s-hard title="필수 규칙 5가지" path=design/emilkowalski/animate/SKILL.md lines=29:35
@source s-freq title="1단계: 빈도 관문" path=design/emilkowalski/animate/SKILL.md lines=39:50
@source s-purpose title="2단계: 목적과 기능 점검" path=design/emilkowalski/animate/SKILL.md lines=52:65
@source s-tool title="3단계: 도구 선택과 pick-ui-library 호출" path=design/emilkowalski/animate/SKILL.md lines=67:81
@source s-props title="4단계: 속성 규칙" path=design/emilkowalski/animate/SKILL.md lines=83:96
@source s-timing title="5단계: easing, 지속 시간, spring" path=design/emilkowalski/animate/SKILL.md lines=98:141
@source s-interrupt title="6단계: 중단과 종료" path=design/emilkowalski/animate/SKILL.md lines=143:148
@source s-a11y title="7단계: reduced motion과 hover 제한" path=design/emilkowalski/animate/SKILL.md lines=150:171
@source s-recipes title="레시피 안내" path=design/emilkowalski/animate/SKILL.md lines=173:175
@source s-never title="Never Ship 자가 점검표" path=design/emilkowalski/animate/SKILL.md lines=177:195
@source s-out title="출력 형식과 어조" path=design/emilkowalski/animate/SKILL.md lines=197:209
@source r-intro title="레시피 목록과 공유 토큰" path=design/emilkowalski/animate/RECIPES.md lines=1:6
@source r-group title="그룹 stagger 등장과 choreograph 참조" path=design/emilkowalski/animate/RECIPES.md lines=170:194
@source rel-pick title="pick-ui-library 소개" path=design/emilkowalski/pick-ui-library/SKILL.md lines=1:20
@source rel-rev title="review-animations 소개" path=design/emilkowalski/review-animations/SKILL.md lines=1:20
@source rel-rev-trig title="review-animations 자동 차단 기준" path=design/emilkowalski/review-animations/SKILL.md lines=50:75
@source rel-imp title="improve-animations 소개" path=design/emilkowalski/improve-animations/SKILL.md lines=1:20
@source rel-find title="find-animation-opportunities 소개" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=1:20
@source rel-expo title="animate-expo 소개" path=design/emilkowalski/animate-expo/SKILL.md lines=1:20
@source rel-mob title="mobile-native 소개" path=design/emilkowalski/mobile-native/SKILL.md lines=1:20
@source rel-mob-tok title="mobile-native의 animate 토큰 재사용" path=design/emilkowalski/mobile-native/SKILL.md lines=144:144

## 어떻게 동작하나 {#flow span=12}

구현이 끝난 뒤에도 `Never Ship` 자가 점검에서 어긋난 항목을 고쳐야 출력으로 넘어간다.[](source:s-never) 그룹 `stagger`(요소마다 시작을 조금씩 늦추기) 등장은 미설치 `choreograph` 스킬을 가리킨다.[](source:r-group)

@workflow id=flow-diagram title="animate 흐름"
| lane gate | 관문 판단 |
| lane route | 도구와 레시피 |
| lane build | 구현과 출력 |
| ask | 구체적 질문 있나? | backend | gate | source:s-init |
| greet | 고정 문구 후 대기 | external | gate | source:s-init |
| freq | 빈도·목적 통과? | backend | gate | source:s-freq |
| noanim | 모션 없이 대안 제시 | external | gate | source:s-freq |
| comp | 컴포넌트 필요? | backend | route | source:s-tool |
| picklib | pick-ui-library 읽기 | external | route | source:s-tool |
| tool | 도구·레시피 선택 | backend | route | source:s-tool |
| spec | 속성·커브·중단·접근성 | backend | build | source:s-props |
| check | Never Ship 점검 | backend | build | source:s-never |
| deliver | 코드·요약 출력 | backend | build | source:s-out |
| ask > greet | 없음 |
| ask > freq | 있음 |
| freq > noanim | 거절 |
| freq > comp | 통과 |
| comp > picklib | 예 |
| comp > tool | 아니오 |
| tool > spec | |
| spec > check | |
| check > deliver | emphasis |

@steps id=flow-steps
| s-ask | 구체적 질문 있나? | **입력** 사용자 호출과 요청 문구 · **출력** 질문 유무 판단. **처리** 에이전트가 구체적인 애니메이션 질문 없이 처음 불렸는지 가른다.[](source:s-init) | flow-diagram | ask |
| s-greet | 고정 문구 후 대기 | **입력** 질문 없는 초기 호출 · **출력** Emil Kowalski 철학 준비 문구 한 줄. **처리** 고정 문구만 출력하고 사용자가 질문을 보낼 때까지 다른 정보를 덧붙이지 않는다.[](source:s-init) | flow-diagram | greet |
| s-freq | 빈도·목적 통과? | **입력** 대상 UI와 사용 맥락 · **출력** 빈도 등급, 목적 이름 하나, 기능 충돌 여부. **처리** 하루 100회 이상이나 키보드 단축키 동작인지 먼저 걸러 내고, 6가지 목적(피드백·공간 일관성·상태 표시·급격한 변화 방지·설명·즐거움을 위한 연출) 중 하나를 붙인다.[](source:s-freq)[](source:s-purpose) **다음** 빈도·목적 관문을 통과하지 못하거나 읽고 조작하는 데이터를 장식으로 움직이려 하면 구현을 멈춘다.[](source:s-purpose) | flow-diagram | freq |
| s-noanim | 모션 없이 대안 제시 | **입력** 거절된 요청과 이유 · **출력** 거절 사유와 정적 대안(즉시 상태 전환 등). **처리** 애니메이션이 불필요하다고 분명히 알리고 코드를 한 줄도 쓰지 않은 채 비모션 대안을 제시한다.[](source:s-posture)[](source:s-freq) | flow-diagram | noanim |
| s-comp | 컴포넌트 필요? | **입력** 통과한 요청의 범위 · **출력** 애니메이션 작업인지 UI 컴포넌트 제작인지 판별. **처리** 토스트, drawer, 명령 메뉴, 드롭다운처럼 컴포넌트 자체가 필요한지 확인한다.[](source:s-tool) | flow-diagram | comp |
| s-picklib | pick-ui-library 읽기 | **입력** 컴포넌트 제작 요구 · **참조** `../pick-ui-library/SKILL.md` · **출력** 라이브러리 추천·도입 흐름 전환. **처리** 손으로 구현하지 않도록 작업을 멈추고 `pick-ui-library`를 먼저 읽는다.[](source:s-tool) **다음** 외부 스킬로 넘어가므로 `animate`의 이후 단계로 곧장 이어지지 않는다. | flow-diagram | picklib |
| s-tool | 도구·레시피 선택 | **입력** 모션 요구사항 · **참조** `RECIPES.md` · **출력** 최소 비용 도구와 시작 레시피. **처리** CSS transition부터 `@starting-style`, CSS 애니메이션, WAAPI, `Motion` 순으로 가장 단순한 도구를 고르고 12개 레시피와 겹치면 해당 코드부터 시작한다.[](source:s-tool)[](source:s-recipes)[](source:r-intro) | flow-diagram | tool |
| s-spec | 속성·커브·중단·접근성 | **입력** 선택한 도구·레시피 · **참조** `RECIPES.md` · **출력** 작성할 애니메이션 코드 초안. **처리** `transform`과 `opacity` 위주로 속성을 제한하고, 기존 토큰이나 표준 커브·300ms 미만 시간·`spring`을 고르며 중단 처리와 `prefers-reduced-motion`, hover 제한을 함께 넣는다.[](source:s-props)[](source:s-timing)[](source:s-interrupt)[](source:s-a11y) **다음** 그룹 `stagger`는 미설치 `choreograph` 지침을 참조한다.[](source:r-group) | flow-diagram | spec |
| s-check | Never Ship 점검 | **입력** 작성한 애니메이션 코드 · **출력** 13개 금지 규칙 통과 여부. **처리** `transition: all`, `scale(0)`, `ease-in`, 300ms 초과 UI, `transform-origin: center` 팝오버, 토스트 keyframe, 레이아웃 속성 애니메이션 등 13개 자동 차단 기준이 남아 있지 않은지 검수한다.[](source:s-never) | flow-diagram | check |
| s-deliver | 코드·요약 출력 | **입력** 점검 통과 코드 · **출력** 구현 코드와 짧은 요약. **처리** 코드를 제시한 뒤 빈도 등급·목적·적용 재료(도구·속성·커브·시간 또는 spring)를 각 한 줄로 적고, 코드로 판단할 수 없는 느낌 확인 항목을 짚는다.[](source:s-out) **다음** 보고서처럼 길게 늘이지 않고 종료한다.[](source:s-out) | flow-diagram | deliver |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(description). 애니메이션 구현, 모션 추가, 전환 제작 요청에서 켜진다. 호출 제한 필드는 frontmatter에 없다.[](source:s-fm) |
| 성격 | 웹 애니메이션 구현 여부를 빈도·목적으로 먼저 걸러 내고, 통과한 작업만 정해진 순서로 구현하는 절차형 스킬이다.[](source:s-hard) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#rel-r13} | `pick-ui-library` | 호출 | 의무. 애니메이션이 아니라 토스트·drawer·드롭다운 등 컴포넌트 자체가 필요하면 멈추고 `../pick-ui-library/SKILL.md`를 읽는다(사용자 개입 없음).[](source:s-tool)[](source:rel-pick) |
| **이 스킬** {#rel-r14} | `review-animations` | 참고 | 자가 점검 항목(`Never Ship`)이 `review-animations`의 자동 차단 기준과 같고, 한 번에 통과할 수준으로 쓰라고 명시한다(사용자 개입 없음).[](source:s-posture)[](source:s-never)[](source:rel-rev-trig) |
| **이 스킬** {#rel-r15} | `review-animations` | 대안 | 역할 경계: 기존 모션 비평이나 diff 리뷰는 `review-animations`를 사용한다(사용자 선택).[](source:s-fm)[](source:s-init)[](source:rel-rev) |
| **이 스킬** {#rel-r16} | `improve-animations` | 대안 | 역할 경계: 전체 코드베이스의 모션 감사는 `improve-animations`를 사용한다(사용자 선택).[](source:s-fm)[](source:s-init)[](source:rel-imp) |
| **이 스킬** {#rel-r17} | `find-animation-opportunities` | 대안 | 역할 경계: 애니메이션 추가 후보 탐색은 `find-animation-opportunities`를 사용한다(사용자 선택).[](source:s-init)[](source:rel-find) |
| **이 스킬** {#rel-r18} | `animate-expo` | 대안 | 역할 경계: React Native/Expo 애니메이션은 `animate-expo`를 사용한다(사용자 선택).[](source:s-init)[](source:rel-expo) |
| **이 스킬** {#rel-r19} | `choreograph` | 참고 | 그룹 stagger 등장 구현 시 `../choreograph/SKILL.md` 지침을 참조한다. 저장소에 설치되지 않아 `범위 밖`이다.[](source:r-group) |
| `animate-expo` {#rel-r20} | **이 스킬** | 대안 | 역할 경계: 웹 애니메이션은 `animate`를 사용한다(사용자 선택).[](source:rel-expo)[](source:s-fm) |
| `animation-performance` {#rel-r21} | **이 스킬** | 대안 | 역할 경계: easing, 지속 시간, 애니메이션 여부 결정은 `animate`를 사용한다(사용자 선택).[](source:s-fm) |
| `mobile-native` {#rel-r36} | **이 스킬** | 참고 | 코드베이스가 `animate`의 토큰을 쓰면 새 커브를 만들지 않고 그대로 재사용한다(사용자 개입 없음).[](source:rel-mob-tok)[](source:s-timing) |
| `mobile-native` {#rel-r37} | **이 스킬** | 대안 | 역할 경계: 모션 설계 자체는 `animate`를 사용한다(사용자 선택).[](source:rel-mob)[](source:s-fm) |

@architecture id=relation-map title="animate와 이어지는 스킬"
| pick | pick-ui-library | backend |
| rev | review-animations | backend |
| imp | improve-animations | backend |
| find | find-animation-opportunities | backend |
| expo | animate-expo | backend |
| mob | mobile-native | backend |
| self | animate(이 스킬) | backend |
| self > pick | 호출 |
| self > rev | 참고 · 대안 |
| self > imp | 대안 | dashed |
| self > find | 대안 | dashed |
| self > expo | 대안 | dashed |
| mob > self | 참고 · 대안 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 초기 응답, 5대 원칙, 7단계 제작 순서, 커브·시간표, `Never Ship` 13항목을 담은 본문 | 스킬이 켜질 때 읽는다. | 구체적 질문 있나?, 고정 문구 후 대기, 빈도·목적 통과?, 모션 없이 대안 제시, 컴포넌트 필요?, 도구·레시피 선택, 속성·커브·중단·접근성, Never Ship 점검, 코드·요약 출력 |
| `RECIPES.md` | 버튼 누름, 팝오버, 툴팁, 모달, drawer, 토스트, 아코디언, stagger, 길게 눌러 확인, 탭 표시기, 스크롤 등장, 드래그 닫기, crossfade 블러, WAAPI 코드 14종 | 요청이 해당 컴포넌트나 패턴과 맞을 때 백지 대신 시작점으로 읽는다.[](source:s-recipes) | 도구·레시피 선택, 속성·커브·중단·접근성 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 구체적 질문 없이 스킬이 처음 켜진 경우 | 고정 문구 한 줄만 출력하고 질문이 올 때까지 멈춘다. | [](source:s-init) |
| 하루 100회 이상 쓰거나 키보드로 여는 동작 | 애니메이션을 절대 넣지 않고(의무) 여기서 멈춘 뒤 정적 대안을 제안한다. | [](source:s-freq) |
| 6가지 목적 중 하나를 못 붙이거나 기능 데이터를 장식하려는 경우 | 구현하지 않고 멈춘다. 즐거움을 위한 연출은 드물거나 처음 보는 단계에만 허용한다. | [](source:s-purpose) |
| 애니메이션이 아니라 UI 컴포넌트 자체를 요청한 경우 | 작업을 멈추고 `../pick-ui-library/SKILL.md`를 읽는다. | [](source:s-tool) |
| 임의 `cubic-bezier` 작성 또는 기존 토큰 복제 | 금지. 코드베이스 기존 토큰을 확장하거나 명시된 커브와 외부 easing 사전만 쓴다. | [](source:s-hard)[](source:s-timing) |
| UI 애니메이션 지속 시간과 `scale(0)`·`ease-in` | `scale(0)`과 UI의 `ease-in`은 금지다. UI는 300ms 미만을 지키며 모달·drawer·시트·토스트만 예외다. | [](source:s-props)[](source:s-timing) |
| 빠르게 반복 호출되는 토스트·토글이나 제스처 | `@keyframes`를 쓰지 않고 중간에 끊을 수 있는 CSS transition이나 `spring`을 쓴다. | [](source:s-interrupt) |
| hover 동작과 접근성 대응 | hover 모션은 `@media (hover: hover) and (pointer: fine)` 안에만 두고, `prefers-reduced-motion`을 더 부드러운 전환으로 함께 구현한다. | [](source:s-hard)[](source:s-a11y) |
| `Never Ship` 13개 항목 위반 발견 시 | `review-animations` 자동 차단 사유이므로 출고 전 수정한다. | [](source:s-never) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 컴포넌트별 레시피 14종 — 도구·레시피 선택 · 버튼·모달·토스트·드래그 닫기·WAAPI 등의 구체적 CSS/JS 코드와 예외 수치를 뺐다.
- easing·시간·spring 수치표 — 속성·커브·중단·접근성 · 요소별 ms 범위, 3가지 커스텀 `cubic-bezier`, `spring` 인자 차이를 개요에서 줄였다.
- `Never Ship` 13항목 대조표 — Never Ship 점검 · 금지 항목별 대체 구현 전체를 개요에서 생략했다.

@callout level=open-question title="확인하지 못한 것"
| `RECIPES.md`가 그룹 stagger 등장 지침으로 가리키는 `../choreograph/SKILL.md`는 저장소에 없어 내용을 확인하지 못했다.[](source:r-group) |
| `pick-ui-library`를 읽은 뒤 `animate` 흐름으로 다시 돌아오는지는 원문에 명시 없음이다.[](source:s-tool) |

읽은 원본: 텍스트 파일 2개. 제외: `SKILL.ko.stale.md`, `RECIPES.ko.stale.md`(낡은 번역본이라 읽지 않음).
