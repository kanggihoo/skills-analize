# emil-design-eng — UI 완성도와 애니메이션 판단 기준을 적용한다 {#overview}

`emil-design-eng`는 에이전트가 UI 컴포넌트의 상호작용을 만들거나 리뷰할 때, 눈에 잘 띄지 않는 세부 동작과 모션 기준을 적용하게 하는 원칙 모음이다.[](source:s-fm)[](source:s-phil)

- 특정 질문 없이 처음 켜면 안내 문장 한 줄만 답하고 기다리며, 이후 UI 상호작용·폴리시 구현이나 코드 리뷰에서 더 좁은 스킬이 맞지 않을 때 기준을 적용한다.[](source:s-fm)[](source:s-init)
- 코드 리뷰에서는 문제마다 `Before`·`After`·`Why` 세 열로 된 단일 Markdown 표를 내놓고, 구현에서는 custom easing 곡선, `clip-path`, 스프링, 접근성 처리가 반영된 코드를 남긴다.[](source:s-rev)[](source:s-ease)[](source:s-a11y)
- 다른 스킬과의 관계: `break-ui`가 시각 디자인 비평의 대안으로 이 스킬을 가리키고, 이 스킬은 그룹 stagger(요소마다 시작을 조금씩 늦추기) 구현과 리뷰에서 `choreograph`를 참고한다.
- 하루 100회 이상 쓰는 키보드 시작 동작에는 애니메이션을 넣지 않고, `ease-in`이나 `scale(0)`으로 시작하는 UI 모션을 금지하며, 리뷰에서 표 대신 목록 형식을 쓰지 않는다.[](source:s-rev)[](source:s-freq)[](source:s-phys)

@answer scope="design/emilkowalski/emil-design-eng · 원본 파일 1개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source s-fm title="frontmatter: name과 description" path=design/emilkowalski/emil-design-eng/SKILL.md lines=1:4
@source s-init title="질문 없이 첫 호출 시 응답" path=design/emilkowalski/emil-design-eng/SKILL.md lines=8:14
@source s-phil title="핵심 철학: 훈련된 취향과 보이지 않는 세부" path=design/emilkowalski/emil-design-eng/SKILL.md lines=20:36
@source s-rev title="필수 리뷰 출력 표 형식" path=design/emilkowalski/emil-design-eng/SKILL.md lines=38:60
@source s-freq title="애니메이션 판단 1단계: 빈도와 키보드 금지" path=design/emilkowalski/emil-design-eng/SKILL.md lines=66:80
@source s-purp title="애니메이션 판단 2단계: 목적" path=design/emilkowalski/emil-design-eng/SKILL.md lines=81:94
@source s-ease title="애니메이션 판단 3단계: easing과 custom 곡선" path=design/emilkowalski/emil-design-eng/SKILL.md lines=95:124
@source s-dur title="애니메이션 판단 4단계: 지속시간과 체감 속도" path=design/emilkowalski/emil-design-eng/SKILL.md lines=125:146
@source s-spr title="spring 애니메이션과 중단 가능성" path=design/emilkowalski/emil-design-eng/SKILL.md lines=147:197
@source s-phys title="버튼 누름, scale(0) 금지, 팝오버 기준점" path=design/emilkowalski/emil-design-eng/SKILL.md lines=199:248
@source s-comp title="툴팁, transition 대 keyframe, blur, @starting-style" path=design/emilkowalski/emil-design-eng/SKILL.md lines=249:346
@source s-clip title="CSS 변환과 clip-path 활용" path=design/emilkowalski/emil-design-eng/SKILL.md lines=348:440
@source s-gest title="제스처와 드래그 물리 규칙" path=design/emilkowalski/emil-design-eng/SKILL.md lines=441:478
@source s-perf title="성능 규칙과 Motion 14.2 가속 주의" path=design/emilkowalski/emil-design-eng/SKILL.md lines=479:528
@source s-a11y title="접근성: reduced motion과 터치 호버 게이트" path=design/emilkowalski/emil-design-eng/SKILL.md lines=529:566
@source s-sonner title="Sonner 6원칙, 일관성, 비대칭 타이밍" path=design/emilkowalski/emil-design-eng/SKILL.md lines=567:611
@source s-stag title="stagger 애니메이션과 choreograph 참조" path=design/emilkowalski/emil-design-eng/SKILL.md lines=613:646
@source s-dbg title="디버깅: 슬로우 모션, 프레임 검사, 실기기" path=design/emilkowalski/emil-design-eng/SKILL.md lines=647:667
@source s-chk title="리뷰 체크리스트 11항목" path=design/emilkowalski/emil-design-eng/SKILL.md lines=668:684
@source rel-brk title="break-ui의 시각 디자인 비평 대안 안내" path=design/emilkowalski/break-ui/SKILL.md lines=3:16

## 어떻게 동작하나 {#flow span=12}

| 적용 상황 | 참조 파일 | 바뀌는 판단 | 출력 사례 |
| --- | --- | --- | --- |
| 질문 없이 첫 호출 | `SKILL.md` 첫 응답 절 | 다른 설명이나 규칙을 미리 내지 않고 정해진 한 문장만 답한 뒤 사용자 질문을 기다린다.[](source:s-init) | Emil Kowalski의 디자인 엔지니어링 철학을 바탕으로 도울 준비가 됐다는 한 문장만 출력한다.[](source:s-init) |
| UI 코드 리뷰 요청 | `SKILL.md` 리뷰 형식·체크리스트 절 | `Before:`·`After:` 줄 목록을 쓰지 않고 반드시 `Before`, `After`, `Why` 세 열 표로 11가지 기준 위반을 정리한다.[](source:s-rev)[](source:s-chk) | `transition: all 300ms` 행을 `transition: transform 200ms var(--ease-out)`으로 고치는 표 한 장을 낸다.[](source:s-rev) |
| 새 애니메이션 추가 전 | `SKILL.md` 판단 프레임워크 1·2단계 | 일 100회 이상·키보드 동작은 모션을 아예 뺀다. 그 외엔 공간 일관성·상태 표시·설명·피드백·급변 방지 중 목적을 먼저 정한다.[](source:s-freq)[](source:s-purp) | 커맨드 팔레트 열기/닫기에는 애니메이션을 넣지 않고 즉시 전환으로 둔다.[](source:s-freq) |
| easing·시간·spring 선택 | `SKILL.md` 판단 3·4단계·spring 절 | 진입·이탈에 `ease-in`을 금지하고 강한 custom 곡선을 쓰며 UI는 300ms 미만으로 묶는다. 드래그·중단 가능 제스처는 spring을 쓴다.[](source:s-ease)[](source:s-dur)[](source:s-spr) | `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`과 `{ type: "spring", duration: 0.5, bounce: 0.2 }`를 쓴다.[](source:s-ease)[](source:s-spr) |
| 컴포넌트·클립패스 구현 | `SKILL.md` 컴포넌트·transform·clip-path 절 | 버튼 `:active`에 `scale(0.97)`을 두고, `scale(0)` 대신 `scale(0.9)` 이상과 `opacity`를 쓰며, 팝오버는 트리거 기준점으로 연다.[](source:s-phys)[](source:s-clip) | 툴팁 두 번째 호버는 `[data-instant]`로 0ms 즉시 열고, 교차 페이드는 `filter: blur(2px)`로 잇는다.[](source:s-comp)[](source:s-clip) |
| 제스처·성능·접근성 점검 | `SKILL.md` 제스처·성능·접근성 절 | `transform`·`opacity`만 움직이고 부모 CSS 변수로 자식 변환을 막으며, reduced motion과 포인터 호버 게이트를 함께 넣는다.[](source:s-perf)[](source:s-a11y) | 드래그 속도가 0.11 초과면 거리와 무관하게 닫고, `@media (hover: hover) and (pointer: fine)` 안에 호버를 둔다.[](source:s-gest)[](source:s-a11y) |
| 복수 요소 등장·검증 | `SKILL.md` stagger·디버깅 절 | 항목마다 30~80ms 비균일 지연을 두되 조작을 막지 않고, 2~5배 슬로우 모션과 USB 실기기로 느낌을 점검하게 안내한다.[](source:s-stag)[](source:s-dbg) | 첫째~넷째 항목에 0·50·90·120ms 지연을 주고 그룹 등장은 `../choreograph/SKILL.md`를 따르게 한다.[](source:s-stag) |

이 스킬은 사소한 디테일이 모여 전체 완성도를 만든다는 전제 아래, "기능만 동작하는 UI"를 "실제 물리 법칙과 반응 속도가 맞는 UI"로 바꾸는 기준표 역할을 한다.[](source:s-phil) 본문 자체가 순서 있는 작업 단계가 아니라 상황별 판단 기준을 모아 둔 원칙형 문서다.

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(`description`). UI 상호작용과 완성도를 다룰 때 더 좁은 스킬이 맞지 않으면 켜진다. 호출 제한 필드는 없다.[](source:s-fm) |
| 성격 | 원칙형. 디자인 엔지니어링 철학·모션 판단 프레임워크·구현 패턴·체크리스트를 적용하는 기준 모음이다.[](source:s-phil)[](source:s-chk) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `break-ui` {#rel-r25} | **이 스킬** | 대안 | 역할 경계: `break-ui`는 최악 데이터 스트레스 테스트만 맡고, 시각 디자인 비평은 사용자가 이 스킬을 선택한다.[](source:rel-brk) |
| **이 스킬** {#rel-r28} | `choreograph` | 참고 | 그룹 stagger 등장 구현(645줄)과 리뷰 체크리스트(684줄)에서 `../choreograph/SKILL.md`를 참고로 가리킨다(미설치, 범위 밖).[](source:s-stag)[](source:s-chk) |

@architecture id=relation-map title="emil-design-eng와 이어지는 스킬"
| brk | break-ui | backend |
| self | emil-design-eng(이 스킬) | backend |
| chor | choreograph | external |
| brk > self | 대안 |
| self > chor | 참고 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 첫 응답 규칙, 핵심 철학, 리뷰 표 형식, 4단계 판단 기준, 구현 패턴, 11항목 체크리스트를 담은 본문 684줄 | 스킬이 켜질 때 읽는다 | 질문 없이 첫 호출, UI 코드 리뷰 요청, 새 애니메이션 추가 전, easing·시간·spring 선택, 컴포넌트·클립패스 구현, 제스처·성능·접근성 점검, 복수 요소 등장·검증 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 특정 질문 없이 스킬이 처음 켜질 때 | 다른 안내를 붙이지 않고 정해진 한 문장만 답한 뒤 멈춘다. | [](source:s-init) |
| UI 코드를 리뷰할 때 | `Before:`·`After:` 줄 목록을 금지하고 반드시 `Before`, `After`, `Why` 세 열 Markdown 표를 출력한다. | [](source:s-rev) |
| 하루 100회 이상 쓰이거나 키보드로 시작하는 동작 | 애니메이션을 일절 넣지 않는다. 커맨드 팔레트 등도 예외 없다. | [](source:s-freq) |
| 목적이 "멋져 보여서"뿐이고 자주 보이는 요소일 때 | 애니메이션을 만들지 않는다. | [](source:s-purp) |
| UI 요소에 `ease-in`을 쓰려 할 때 | 절대 금지. 진입·이탈에는 `ease-out`이나 강한 custom 곡선을 쓴다. | [](source:s-ease) |
| UI 애니메이션 지속시간이 300ms를 넘을 때 | 300ms 미만으로 줄인다. 모달·서랍·시트·토스트만 문서화된 예외(모달·서랍 최대 500ms, 토스트 400ms `ease`)다. | [](source:s-dur) |
| 요소가 `scale(0)`에서 등장할 때 | 금지. `scale(0.9)` 이상과 `opacity: 0`에서 시작한다. | [](source:s-phys) |
| 팝오버·드롭다운에 `transform-origin: center`를 둘 때 | 금지. 트리거 위치(`var(--transform-origin)`)에서 열리게 한다. 모달만 중앙 유지 예외다. | [](source:s-phys)[](source:s-chk) |
| 빠르게 반복되는 UI에 `@keyframes`를 쓸 때 | 중단 시 0부터 다시 시작하므로 금지하고, 중간에 방향을 바꿀 수 있는 CSS transition이나 spring을 쓴다. | [](source:s-spr)[](source:s-comp) |
| 전환 중 `filter: blur()`나 `layout` 속성을 쓸 때 | `blur`는 20px 미만으로 제한하고, `padding`·`margin`·`height`·`width` 대신 `transform`과 `opacity`만 쓴다. | [](source:s-comp)[](source:s-perf) |
| Motion 14.2 미만에서 `x`/`y` 단축 속성을 쓸 때 | 메인 스레드에서 돌므로 14.2 이상으로 올리거나 `transform: "translateX(...)"` 전체 문자열을 쓴다. `layout`·`layoutId`는 모든 버전에서 메인 스레드를 쓴다. | [](source:s-perf) |
| `prefers-reduced-motion: reduce`·터치 호버 처리 시 | reduced motion에서 모션을 0으로 지우지 말고 위치 이동만 빼며, 호버는 `@media (hover: hover) and (pointer: fine)` 안에 둔다. | [](source:s-a11y) |
| 누르기·놓기 비대칭 타이밍이 필요할 때 | 의도적 결정 동작(예: 길게 눌러 삭제 2초 `linear`)은 느리게, 시스템 복귀(200ms `ease-out`)는 빠르게 둔다. | [](source:s-sonner) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 4단계 애니메이션 판단 기준과 수치표 — 맡을 개요 항목: easing·시간·spring 선택 · custom 곡선, 요소별 ms 예산, Apple식 대 물리식 spring 수치 세부가 길어서 뺐다.
- `clip-path`·제스처·Sonner 6원칙 패턴 — 맡을 개요 항목: 컴포넌트·클립패스 구현 · 탭 색 전환, 2초 삭제 오버레이, 속도 0.11 해제 코드와 Sonner 설계 원칙을 개요에 담지 않았다.
- 성능 예외와 11항목 리뷰 체크리스트 — 맡을 개요 항목: UI 코드 리뷰 요청 · Motion 버전별 가속 조건과 디버깅 3법 세부를 뺐다.

@callout level=open-question title="확인하지 못한 것"
| `../choreograph/SKILL.md`는 저장소에 설치되어 있지 않아(`범위 밖`) 그룹 stagger 등장의 세부 규칙을 확인하지 못했다. |

읽은 원본: 텍스트 파일 1개. 제외: `SKILL.ko.stale.md` 1개(낡은 번역본).
