# dsh-responsive-ui 스킬은 에이전트를 어떻게 바꾸나 {#dsh-responsive-ui-skill}

`dsh-responsive-ui`를 쓰면 에이전트는 클라이언트 화면을 390 CSS px 폭에서 먼저 맞춘다. 공간이 모자라면 배치와 줄바꿈부터 고치고, 주요 동작과 상태는 빼지 않는다. 터치 기기에서는 hover 전용 효과가 남지 않게 한다.[](source:min-vp)[](source:ord-prim)[](source:hov-tap)

- 폭 390px에서 겹침, 잘림, 페이지 전체 가로 스크롤, 닿지 않는 주요 동작이 없어야 한다.[](source:min-vp)
- 줄이는 순서는 공간 배분과 줄바꿈이 먼저고, 그다음이 말줄임·아이콘 전용·More 메뉴다. 에이전트는 전역 잘라내기, 전체 글자 줄이기, 클릭 영역 줄이기로 충돌을 덮지 않는다.[](source:ord-seq)[](source:ord-glob)
- hover 효과는 `@media (hover: hover)` 안에만 둔다. 터치로 탭해도 hover 흔적이 남으면 안 된다.[](source:hov-cond)
- 모바일 텍스트 칸은 `(pointer: coarse)`에서 글자 크기 16px 이상이다.[](source:in-coarse)

@answer scope="dsh-responsive-ui · 파일 1개 · 커밋 475505c · 지시상 동작"
@meta locale=ko
@source skill-fm title="deepseek-harness/dsh-responsive-ui/SKILL.md · 4423B · frontmatter" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=1:4
@source min-vp title="SKILL.md · 1. Minimum viewport" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=10:10
@source ord-seq title="SKILL.md · 2-1 조정 순서" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=14:14
@source ord-prim title="SKILL.md · 2-2 주요 동작·상태" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=15:15
@source ord-glob title="SKILL.md · 2-3 전역 잘라내기 금지" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=16:16
@source ord-font title="SKILL.md · 2-4 글자 크기 축소" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=17:17
@source t1 title="SKILL.md · 3-1 말줄임 내용 열람" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=21:21
@source t2 title="SKILL.md · 3-2 오류·핵심 정보" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=22:22
@source t3 title="SKILL.md · 3-3 한 줄 말줄임" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=23:23
@source t4 title="SKILL.md · 3-4 중요 정보 전체 표시" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=24:24
@source ti1 title="SKILL.md · 4-1 페이지 제목" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=28:28
@source ti2 title="SKILL.md · 4-2 카드 제목" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=29:29
@source icon-req title="SKILL.md · 5. 아이콘 전용 조건" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=33:35
@source icon-ex title="SKILL.md · 5. 아이콘 전용 예시" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=36:38
@source hov-cond title="SKILL.md · 6-1 hover 조건" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=42:42
@source hov-tap title="SKILL.md · 6-2 탭 뒤 흔적" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=43:43
@source hov-state title="SKILL.md · 6-3 상태와 포커스" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=44:44
@source hov-focus title="SKILL.md · 6-4 폭 변화 중 포커스" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=45:45
@source tip-aux title="SKILL.md · 7-1 보조 정보 툴팁" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=49:49
@source tip-sup title="SKILL.md · 7-2 설명 툴팁" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=50:50
@source kbd title="SKILL.md · 8. Mobile keyboard" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=54:54
@source in-css title="SKILL.md · 9-1 미디어 기능" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=58:58
@source in-coarse title="SKILL.md · 9-2 16px 하한" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=59:59
@source ux-ref title="dsh-client-ui-ux/SKILL.md · 반응형 안내(59줄)" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=59:59

## 언제 켜지고 무엇이 기준인가 {#trigger}

@code source=skill-fm language=yaml

머리말에는 `name`과 `description`만 있고 호출 제한 필드가 없다.[](source:skill-fm) 판정: 모델이 `description`을 참고해 스스로 켤 수 있다. `description`은 판단용 설명이지, 특정 단어가 있으면 켜지는 목록이 아니다.

이 스킬을 쓰는 일은 DeepSeek Harness의 반응형 클라이언트 레이아웃, 모바일·터치 판별, 말줄임, 제목 줄바꿈, 아이콘 전용 컨트롤, 모바일 hover·툴팁·키보드, 폭 변화 중 포커스를 설계·구현·리뷰하는 것이다.[](source:skill-fm)

@facts id=responsive-numbers
| 주요 합격 최소 폭 | 390 CSS px. 이 폭에서 의도치 않은 겹침, 잘림, 페이지 전체 가로 스크롤, 닿지 않는 주요 동작이 없어야 한다[](source:min-vp) |
| 390px 미만 | 레이아웃 요구를 완화할 수 있다[](source:min-vp) |
| 모바일 텍스트 칸 글자 크기 하한 | 16px. `(pointer: coarse)`일 때만 적용하고, 정밀 포인터는 기존 compact 크기를 유지한다[](source:in-coarse) |

사람이 개입하는 단계, 종료 조건, 사용자에게 묻는 질문은 원문에 명시 없음. 설계·리뷰 기준만 적은 스킬이다.

## 공간이 모자라면 무엇부터 줄이나 {#decision-order}

@workflow id=shrink-order title="공간이 모자랄 때 줄이는 순서"
| tight | 390px에서 공간 부족 | external |
| alloc | 공간 배분·줄바꿈 조정 | backend |
| shrink | 말줄임·아이콘·More 메뉴 | backend |
| tight > alloc | |
| alloc > shrink | 그다음 | emphasis |

@steps id=shrink-steps
| st-tight | 390px에서 공간 부족 | 주요 합격 폭에서 겹침이나 잘림이 생긴 상황이다. | shrink-order | tight |
| st-alloc | 공간 배분·줄바꿈 조정 | 에이전트가 먼저 공간 배분을 바꾸거나 요소를 다른 줄로 넘긴다. | shrink-order | alloc |
| st-shrink | 말줄임·아이콘·More 메뉴 | 그다음에야 말줄임, 아이콘 전용 컨트롤, 아이콘을 More 메뉴로 옮기는 안을 고려한다. | shrink-order | shrink |

순서는 원문 2절이 먼저 할 일과 그다음 할 일로 정한 그대로다.[](source:ord-seq) 어느 단계에서든 아래는 지킨다.

| 규칙 | 원문 어조 |
| --- | --- |
| 주요 동작과 주요 상태는 빼지 않는다.[](source:ord-prim) | 금지 {bad:주요 동작 생략} |
| 전역 잘라내기, 전체 글자 줄이기, 클릭 영역 줄이기로 충돌을 숨기지 않는다.[](source:ord-glob) | 금지 {bad:전역 잘라내기} |
| 글자 크기는 제품 디자인이 특별히 요구할 때만 줄인다.[](source:ord-font) | 조건부 허용 |

## 말줄임·제목·아이콘 전용은 어떤 규칙을 따르나 {#truncation}

"필수"는 `must`·`requires`로 쓴 것, "금지"는 `do not`으로 쓴 것, "권고"는 `prefer`로 쓴 것이다.

| 대상 | 규칙 | 원문 어조 |
| --- | --- | --- |
| 말줄임: 열람 | 잘린 내용은 보조 페이지나 메뉴로 끝까지 볼 수 있어야 한다. 예: 입력창 아래의 세션 통계.[](source:t1) | 필수 |
| 말줄임: 오류 | 말줄임으로 오류나 핵심 정보를 잃으면 안 된다.[](source:t2) | 필수 |
| 말줄임: 한 줄 | 탭 내비게이션, 보이는 선택기, 버튼, 태그 같은 컴포넌트는 한 줄 말줄임을 선호한다.[](source:t3) | 권고 |
| 말줄임: 중요 정보 | 다른 페이지에서 볼 수 없는 중요한 정보는 말줄임 없이 전부 보여 준다.[](source:t4) | 필수 |
| 페이지 제목 | 전체를 보이는 쪽을 선호한다. 필요하면 액션 영역을 다음 줄로 옮긴다. 예: Plugins 페이지의 제목 줄바꿈.[](source:ti1) | 권고 |
| 카드 제목 | 자연스러운 줄바꿈을 선호한다. 줄 수를 제한해도 전체 제목은 볼 수 있어야 한다.[](source:ti2) | 권고와 필수 |
| 아이콘 전용: 조건 | 컨트롤을 아이콘으로 줄이려면 두 조건을 모두 채운다. 아이콘이 뜻을 분명히 전하거나 사용자에게 익숙한 동작이어야 하고, hover 때 툴팁이 떠야 한다(없으면 추가).[](source:icon-req) | 필수 |
| 아이콘 전용: 금지 예 | "More account information"은 별도 페이지로 이동하는 동작이라 아이콘으로 줄이지 않는다.[](source:icon-ex) | 금지 {bad:아이콘으로 축소} |
| 아이콘 전용: 허용 예 | 입력창의 모델 선택기는 자주 보고 메뉴로 모델을 바꿀 수 있어 아이콘으로 줄일 수 있다. 자동화 작업의 연결된 대화도 예로 든다.[](source:icon-ex) | 예시 {good:허용} |

## 모바일 hover·툴팁·키보드·입력은 어떻게 다루나 {#touch}

| 주제 | 규칙 | 원문 어조 |
| --- | --- | --- |
| hover 조건 | hover 효과는 폭과 상관없이 `@media (hover: hover)`에서 켠다. 이 쿼리는 현재 이벤트가 아니라 주 포인팅 장치를 묻는다. 혼합 입력 기기에서는 JavaScript hover 핸들러가 터치 이벤트를 무시한다.[](source:hov-cond) | 지시와 필수 |
| 탭 뒤 흔적 | 폰에서 탭해도 hover 전용 배경, 강조, 액션 버튼 노출이 남지 않는다. hover가 없으면 액션을 계속 보이거나 명시적 컨트롤로 닿게 하고, 키보드 사용자도 같은 액션을 드러낼 수 있어야 한다.[](source:hov-tap) | 필수 |
| 상태와 포커스 | 선택, 펼침, 활성, 눌림 상태와 포커스 표시는 hover 가능 여부와 무관하게 스타일한다. hover 효과를 없애려고 포커스를 지우지 않는다. `:focus-visible`은 터치로 포커스한 텍스트 칸에도 적용될 수 있다.[](source:hov-state) | 금지 {bad:포커스 지우기} |
| 폭 변화 중 포커스 | 컨트롤이 계속 보이고 쓸 수 있으면 포커스를 유지한다. 레이아웃만 바꾸려고 컨트롤을 다시 마운트하지 않는다. 포커스된 컨트롤이 숨거나 사라지면, 남은 적절한 컨트롤로 포커스를 옮기되 모바일 키보드를 불필요하게 열지 않는다.[](source:hov-focus) | 지시와 권고 |
| 보조 정보 툴팁 | 액션 이름이나 단축키 같은 보조 정보만 주는 툴팁은 모바일에서 띄우지 않는다. 예: 복사 버튼의 "Copy" 툴팁. 탭하면 원래 동작을 바로 실행한다.[](source:tip-aux) | 금지 |
| 설명 툴팁 | 보충 설명을 주는 툴팁은 모바일에서 탭하면 나타나야 한다. 예: Plugins 페이지 설명 옆의 정보 툴팁.[](source:tip-sup) | 필수 |
| 모바일 키보드 | 명시적으로 의도한 경우가 아니면 입력 키보드를 자동으로 올리지 않는다.[](source:kbd) | 금지 |
| 입력 감지 | 화면 표현은 CSS 미디어 기능을 우선한다. `(pointer: coarse)`는 주 포인터의 정확도를, `(hover: none)`은 hover 불가를, 폭 쿼리는 레이아웃 분기를 맡는다. 이 쿼리들로 물리 키보드는 감지하지 못한다. 파싱한 사용자 에이전트로 레이아웃을 가르지 않는다.[](source:in-css) | 권고와 금지 {bad:사용자 에이전트 분기} |
| 모바일 텍스트 칸 | `(pointer: coarse)`에서 16px 하한을 두어, iOS Safari가 포커스할 때 칸을 확대하는 것을 피한다. 정밀 포인터는 기존 compact 크기를 유지한다. 기준은 `PluginManagerPage.module.css`의 칸 규칙이다.[](source:in-coarse) | 지시 |

`PluginManagerPage.module.css`는 원래 저장소의 파일이라 이 저장소에 없다. 열지 않았고, 16px 규칙의 실제 코드는 확인하지 못했다.

## 흐름 속 위치 {#position}

이 스킬은 `client-ui` 묶음에 속하고, 다른 스킬로 넘기지 않는 끝점이다. 화살표는 참고 방향이며 필수 실행 순서가 아니다.

@workflow id=position-flow title="dsh-responsive-ui 앞뒤의 스킬"
| ux | dsh-client-ui-ux | backend |
| rs | dsh-responsive-ui | backend |
| ux > rs | 참고 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `dsh-client-ui-ux`가 가리킨 반응형 판단 | - | 반응형 레이아웃, 모바일·터치 판별, 말줄임, 제목 줄바꿈, 아이콘 전용 컨트롤, 폭 변화 중 포커스를 판단할 때는 이 스킬을 쓴다 | r32 |

- `dsh-client-ui-ux`가 59줄에서 이 스킬을 가리킨다.[](source:ux-ref) 이 스킬을 가리키는 다른 스킬 본문은 찾지 못했다(원장과 폴더 검색 기준).
- 이 스킬 본문은 형제 스킬 이름을 하나도 부르지 않는다. 원장에도 이 스킬에서 나가는 관계가 없다.
- 전체 흐름은 `deepseek-harness/_group-client-ui/client-ui.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `deepseek-harness/dsh-responsive-ui/SKILL.md` 1개, 4,423B(59줄). 원본이고 끝까지 읽었다. 이 폴더에는 다른 텍스트 파일이 없다.
- 관계 확인용으로 읽은 곳: `dsh-client-ui-ux` 59줄.
- 범위 밖: 본문이 가리키는 `packages/client/ui-plugin-manager/src/client/PluginManagerPage.module.css`는 원래 저장소(deepseek-harness)의 파일이다. 이 저장소에 없어 열지 않았다.
- 제외한 파일: 없음. 번역본이 없다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준, 폴더 검색으로도 확인).
- 실행하지 않았다. 이 페이지의 동작은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"주요 동작"과 "주요 상태"가 무엇인지는 원문에 명시 없음. 390px 미만에서 어디까지 완화해도 되는지도 원문에 명시 없음.[](source:min-vp)
"Plugins 페이지의 제목 줄바꿈"과 "입력창 아래 세션 통계" 같은 기준 화면은 원래 저장소의 화면이라 직접 보지 못했다.[](source:t1)[](source:ti1)
