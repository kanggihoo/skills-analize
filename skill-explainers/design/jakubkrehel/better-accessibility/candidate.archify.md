# better-accessibility 스킬은 에이전트를 어떻게 바꾸나 {#better-accessibility-skill}

`better-accessibility`를 쓰면 에이전트는 화면을 두 번 걷는다. 먼저 키보드만으로 모든 흐름이 끝나는지 보고, 다음에 스크린 리더로 모든 컨트롤이 이름·역할·상태를 읽어 주는지 본다. 위반은 WCAG 2.2 Level A·AA 기준 번호나 보조기기 사용자가 못 하는 구체적인 작업으로 지적하고, 고치는 코드는 프로젝트의 스타일링 방식으로 쓴다. 확신이 없으면 직접 만든 widget 대신 플랫폼 기본 요소를 택하고, ARIA는 더하지 않고 **뺀다**.[](source:ba-intro)[](source:ba-crit)

- 켜지는 때: frontmatter에 호출 제한 필드가 없어서 모델이 `description`을 보고 켤 수 있다. `better-interface`가 도메인 리뷰 1번째로 부르는 경로도 원문에 있다.[](source:ba-fm)[](source:bi-order)
- 강제하는 것: 지적은 WCAG A·AA 기준 번호나 구체적인 작업 실패로 댄다. 그 밖의 것(AAA, APG 관례, 44px·40px 목표 크기)은 권고이고 `HIGH`가 될 수 없다.[](source:ba-crit)
- 끝내는 방법: `HIGH`가 하나라도 남으면 `Block`, 아니면 `Approve`다. 확인하지 않은 범위는 `Approve`하지 않는다.[](source:ba-fmt)
- 쓰면 안 되는 때: 대비 측정과 색 수정, 글자 크기, target 사이 간격, 문구, 애니메이션 레시피는 다른 `better-*` 스킬 몫이다.[](source:ba-bound)

@answer scope="design/jakubkrehel/better-accessibility · 원본 텍스트 8개 36,021B · 커밋 0465878 · 관계 확인용으로 다른 스킬 줄만 읽음 · 지시는 읽기만 하고 실행하지 않음 · 지시상 동작"
@meta locale=ko
@source ba-fm title="design/jakubkrehel/better-accessibility/SKILL.md · 10949B · 지시 본문과 frontmatter" path=design/jakubkrehel/better-accessibility/SKILL.md lines=1:4
@source ba-intro title="SKILL.md · 하는 일과 두 번 걷기" path=design/jakubkrehel/better-accessibility/SKILL.md lines=8:10
@source ba-bound title="SKILL.md · 다른 스킬의 몫" path=design/jakubkrehel/better-accessibility/SKILL.md lines=12:12
@source ba-crit title="SKILL.md · 기준이지 관례가 아니다" path=design/jakubkrehel/better-accessibility/SKILL.md lines=14:16
@source ba-native title="SKILL.md · 네이티브 요소 먼저" path=design/jakubkrehel/better-accessibility/SKILL.md lines=20:20
@source ba-dis title="SKILL.md · disabled는 쓸 수 없다는 뜻" path=design/jakubkrehel/better-accessibility/SKILL.md lines=24:24
@source ba-focus title="SKILL.md · 보이는 focus ring" path=design/jakubkrehel/better-accessibility/SKILL.md lines=28:32
@source ba-kbd title="SKILL.md · 전체 keyboard 지원" path=design/jakubkrehel/better-accessibility/SKILL.md lines=36:38
@source ba-trap title="SKILL.md · focus 가두기와 되돌리기" path=design/jakubkrehel/better-accessibility/SKILL.md lines=42:44
@source ba-hit title="SKILL.md · 최소 hit area" path=design/jakubkrehel/better-accessibility/SKILL.md lines=48:52
@source ba-form title="SKILL.md · 컨트롤마다 label과 type" path=design/jakubkrehel/better-accessibility/SKILL.md lines=56:58
@source ba-err title="SKILL.md · 안내되는 에러" path=design/jakubkrehel/better-accessibility/SKILL.md lines=62:62
@source ba-name title="SKILL.md · 접근 가능한 이름" path=design/jakubkrehel/better-accessibility/SKILL.md lines=66:66
@source ba-color title="SKILL.md · 색과 두 번째 단서, 대비 표" path=design/jakubkrehel/better-accessibility/SKILL.md lines=70:80
@source ba-motion title="SKILL.md · prefers-reduced-motion" path=design/jakubkrehel/better-accessibility/SKILL.md lines=84:84
@source ba-timer title="SKILL.md · 타이머에 맡기지 않는다" path=design/jakubkrehel/better-accessibility/SKILL.md lines=88:88
@source ba-live title="SKILL.md · 동적 내용 안내" path=design/jakubkrehel/better-accessibility/SKILL.md lines=92:94
@source ba-alt title="SKILL.md · 목적별 alt" path=design/jakubkrehel/better-accessibility/SKILL.md lines=98:98
@source ba-struct title="SKILL.md · 구조가 곧 이동 수단" path=design/jakubkrehel/better-accessibility/SKILL.md lines=102:102
@source ba-zoom title="SKILL.md · 확대와 글자 키우기" path=design/jakubkrehel/better-accessibility/SKILL.md lines=106:106
@source ba-pat title="SKILL.md · 끝내기 전 점검 표" path=design/jakubkrehel/better-accessibility/SKILL.md lines=110:124
@source ba-sev title="SKILL.md · 심각도" path=design/jakubkrehel/better-accessibility/SKILL.md lines=128:128
@source ba-ver title="SKILL.md · 검증" path=design/jakubkrehel/better-accessibility/SKILL.md lines=130:130
@source ba-fmt title="SKILL.md · 보고 형식과 끝맺음" path=design/jakubkrehel/better-accessibility/SKILL.md lines=132:139
@source ba-yaml title="design/jakubkrehel/better-accessibility/agents/openai.yaml · 121B · 표시 이름과 짧은 설명" path=design/jakubkrehel/better-accessibility/agents/openai.yaml lines=1:3
@source fm-lab title="design/jakubkrehel/better-accessibility/forms.md · 3491B · label과 에러" path=design/jakubkrehel/better-accessibility/forms.md lines=5:42
@source fm-ac title="forms.md · autocomplete와 입력 type" path=design/jakubkrehel/better-accessibility/forms.md lines=44:70
@source fm-sub title="forms.md · 제출 동작" path=design/jakubkrehel/better-accessibility/forms.md lines=72:77
@source ha-size title="design/jakubkrehel/better-accessibility/hit-areas.md · 3262B · target 크기와 확장" path=design/jakubkrehel/better-accessibility/hit-areas.md lines=5:18
@source ha-exp title="hit-areas.md · hit area 넓히기와 겹침 규칙" path=design/jakubkrehel/better-accessibility/hit-areas.md lines=20:71
@source ha-deco title="hit-areas.md · 장식 레이어" path=design/jakubkrehel/better-accessibility/hit-areas.md lines=73:87
@source ha-ges title="hit-areas.md · 제스처와 드래그" path=design/jakubkrehel/better-accessibility/hit-areas.md lines=89:93
@source fk-ring title="design/jakubkrehel/better-accessibility/focus-and-keyboard.md · 6492B · focus ring과 keyboard 패턴" path=design/jakubkrehel/better-accessibility/focus-and-keyboard.md lines=5:35
@source fk-obs title="focus-and-keyboard.md · 가려진 focus" path=design/jakubkrehel/better-accessibility/focus-and-keyboard.md lines=37:39
@source fk-skip title="focus-and-keyboard.md · skip link" path=design/jakubkrehel/better-accessibility/focus-and-keyboard.md lines=41:64
@source fk-tab title="focus-and-keyboard.md · tabindex와 roving tabindex" path=design/jakubkrehel/better-accessibility/focus-and-keyboard.md lines=66:91
@source fk-trap title="focus-and-keyboard.md · focus 가두기와 되돌리기" path=design/jakubkrehel/better-accessibility/focus-and-keyboard.md lines=93:120
@source fk-keys title="focus-and-keyboard.md · APG keyboard 패턴" path=design/jakubkrehel/better-accessibility/focus-and-keyboard.md lines=122:139
@source fk-spa title="focus-and-keyboard.md · SPA 경로 변경" path=design/jakubkrehel/better-accessibility/focus-and-keyboard.md lines=141:143
@source mz-rm title="design/jakubkrehel/better-accessibility/motion-and-zoom.md · 2437B · 움직임과 확대" path=design/jakubkrehel/better-accessibility/motion-and-zoom.md lines=5:34
@source mz-timer title="motion-and-zoom.md · 자동 재생과 시간 제한 UI" path=design/jakubkrehel/better-accessibility/motion-and-zoom.md lines=36:41
@source mz-zoom title="motion-and-zoom.md · 확대와 reflow" path=design/jakubkrehel/better-accessibility/motion-and-zoom.md lines=43:48
@source sa-rules title="design/jakubkrehel/better-accessibility/semantics-and-aria.md · 4636B · 시맨틱과 ARIA 규칙" path=design/jakubkrehel/better-accessibility/semantics-and-aria.md lines=5:12
@source sa-btn title="semantics-and-aria.md · button, link, div" path=design/jakubkrehel/better-accessibility/semantics-and-aria.md lines=14:32
@source sa-land title="semantics-and-aria.md · landmark와 heading" path=design/jakubkrehel/better-accessibility/semantics-and-aria.md lines=34:39
@source sa-name title="semantics-and-aria.md · 접근 가능한 이름" path=design/jakubkrehel/better-accessibility/semantics-and-aria.md lines=41:61
@source sa-mist title="semantics-and-aria.md · 흔한 ARIA 실수" path=design/jakubkrehel/better-accessibility/semantics-and-aria.md lines=63:70
@source sa-dis title="semantics-and-aria.md · disabled 상태" path=design/jakubkrehel/better-accessibility/semantics-and-aria.md lines=72:81
@source sr-hid title="design/jakubkrehel/better-accessibility/screen-readers.md · 4633B · 스크린 리더 안내" path=design/jakubkrehel/better-accessibility/screen-readers.md lines=5:28
@source sr-choose title="screen-readers.md · 변화를 알리는 방법 고르기" path=design/jakubkrehel/better-accessibility/screen-readers.md lines=30:37
@source sr-live title="screen-readers.md · live region" path=design/jakubkrehel/better-accessibility/screen-readers.md lines=39:61
@source sr-ah title="screen-readers.md · aria-hidden" path=design/jakubkrehel/better-accessibility/screen-readers.md lines=63:65
@source sr-alt title="screen-readers.md · alt 텍스트" path=design/jakubkrehel/better-accessibility/screen-readers.md lines=67:79
@source sr-svg title="screen-readers.md · SVG" path=design/jakubkrehel/better-accessibility/screen-readers.md lines=81:95
@source sr-av title="screen-readers.md · 영상과 음원" path=design/jakubkrehel/better-accessibility/screen-readers.md lines=97:99
@source bi-fm title="design/jakubkrehel/better-interface/SKILL.md · 8779B · r60 확인용" path=design/jakubkrehel/better-interface/SKILL.md lines=1:12
@source bi-order title="better-interface/SKILL.md · 도메인 스킬을 이 순서로 모두 불러 쓴다" path=design/jakubkrehel/better-interface/SKILL.md lines=42:57
@source bi-trig title="better-interface/SKILL.md · escalation trigger" path=design/jakubkrehel/better-interface/SKILL.md lines=77:95
@source ir-fm title="design/jakubkrehel/interface-review/SKILL.md · 10128B · r69 확인용 frontmatter" path=design/jakubkrehel/interface-review/SKILL.md lines=1:5
@source ir-sig title="interface-review/SKILL.md · 제거된 줄 읽기" path=design/jakubkrehel/interface-review/SKILL.md lines=56:61
@source rs-a11y title="design/jakubkrehel/interface-review/removed-signals.md · 3228B · a11y 신호 행" path=design/jakubkrehel/interface-review/removed-signals.md lines=7:11
@source ui-bound title="design/jakubkrehel/better-ui/SKILL.md · r76 확인용" path=design/jakubkrehel/better-ui/SKILL.md lines=16:16
@source ui-border title="better-ui/SKILL.md · 입력 border와 focus ring" path=design/jakubkrehel/better-ui/SKILL.md lines=28:28
@source ui-rm title="better-ui/SKILL.md · reduced motion 요구" path=design/jakubkrehel/better-ui/SKILL.md lines=52:52
@source ui-icons title="design/jakubkrehel/better-ui/icons.md · 아이콘 전용 버튼 이름" path=design/jakubkrehel/better-ui/icons.md lines=105:105
@source lay-bound title="design/jakubkrehel/better-layout/SKILL.md · r86 확인용" path=design/jakubkrehel/better-layout/SKILL.md lines=12:12
@source lay-sp title="design/jakubkrehel/better-layout/spacing-and-adaptivity.md · target 간격" path=design/jakubkrehel/better-layout/spacing-and-adaptivity.md lines=30:30
@source ty-bound title="design/jakubkrehel/better-typography/SKILL.md · r92 확인용" path=design/jakubkrehel/better-typography/SKILL.md lines=10:10
@source wr-bound title="design/jakubkrehel/better-writing/SKILL.md · r97 확인용" path=design/jakubkrehel/better-writing/SKILL.md lines=12:12
@source wr-toast title="better-writing/patterns.md · undo toast 표시 시간" path=design/jakubkrehel/better-writing/patterns.md lines=15:15
@source bk-scen title="design/jakubkrehel/break/scenarios.md · r119 확인용" path=design/jakubkrehel/break/scenarios.md lines=72:78
@source bd-bound title="design/jakubkrehel/build-design/SKILL.md · r135 확인용" path=design/jakubkrehel/build-design/SKILL.md lines=12:12
@source td-bound title="design/jakubkrehel/teardown/SKILL.md · r146 확인용" path=design/jakubkrehel/teardown/SKILL.md lines=14:14
@source td-prev title="design/jakubkrehel/teardown/preview-page.md · 컨트롤 시맨틱" path=design/jakubkrehel/teardown/preview-page.md lines=31:31
@source td-svg title="design/jakubkrehel/teardown/sheet-and-svg.md · SVG 접근성" path=design/jakubkrehel/teardown/sheet-and-svg.md lines=58:58
@source sc-img title="design/jakubkrehel/interface-review/scope-resolution.md · 추가 이미지의 담당" path=design/jakubkrehel/interface-review/scope-resolution.md lines=68:68

## 언제 켜지고, 언제 다른 스킬로 가야 하나 {#trigger}

@code source=ba-fm language=yaml

frontmatter에는 `name`과 `description`만 있다. 호출 제한 필드가 없으므로 모델이 `description`을 보고 켤 수 있다.[](source:ba-fm)

- 판정: `description`은 모델이 판단할 때 참고하는 설명이다. "keyboard"나 "ARIA"라는 단어가 나와야만 켜지는 목록은 아니다.
- `agents/openai.yaml`에도 표시 이름과 짧은 설명 두 필드뿐이고 호출 제한은 없다.[](source:ba-yaml)

사용자가 이 스킬을 직접 부를 때의 인자, 첫 응답 규칙, 사람 승인 지점은 `원문에 명시 없음`이다. 원문에서 사용자 요청이 조건이 되는 곳은 한 군데다. 대비가 실패해도 사용자가 요청하기 전에는 색을 바꾸지 않는다.[](source:ba-color)

이 스킬은 접근성 규칙의 주인이고, 아래 일은 다른 스킬 몫이라고 이름을 들어 적는다.[](source:ba-bound)

| 하려는 일 | 이 스킬 대신 | 이 스킬이 하는 일 | rel-id |
| --- | --- | --- | --- |
| 대비를 재고 색을 고친다 | `better-colors` {caution:범위 밖} | 어떤 대비 기준이 적용되는지만 정한다. 쌍을 재고 실패하면 쌍과 놓친 기준을 보고하고 색은 두지 않는다[](source:ba-color) | r79 |
| 글자 크기, iOS input 확대, 언어 메타데이터를 다룬다 | `better-typography` {caution:범위 밖} | iOS input 확대는 그쪽의 `16px` 규칙으로 고친다고 가리킨다[](source:ba-zoom) | r80 |
| target 사이 간격, 공간 RTL, sticky 가림을 고친다 | `better-layout` {caution:범위 밖} | 요구는 이 스킬이 정하고, scroller 패딩 같은 수정은 그쪽 것이라고 적는다[](source:ba-focus)[](source:ba-zoom) | r81 |
| label·에러·alt 문구를 쓴다 | `better-writing` {caution:범위 밖} | 문구가 아니라 마크업·연결·안내 방식을 본다 | r82 |
| 애니메이션 레시피, hover 스타일, 스크롤 격리를 만든다 | `better-ui` {caution:범위 밖} | reduced motion 요구를 정한다 | r83 |

## 무엇을 지적으로 세고, 수치는 얼마인가 {#criteria}

지적은 두 층으로 나뉜다. WCAG 2.2 Level A·AA 기준 번호나 보조기기 사용자가 끝내지 못하는 구체적인 작업을 대면 지적이고, 나머지는 권고라서 `HIGH`가 될 수 없다. 권고에 드는 것은 AAA 기준, APG 관례, "`<h1>` 하나, 수준 건너뛰기 금지" 개요, 44px·40px 목표 크기다. 기준 임계값은 정확한 값이고, 더 큰 target은 휴리스틱이라서 이미 쓸 만한 밀도가 있으면 유지한다.[](source:ba-crit)

판정: 이 구분 때문에 같은 코드라도 "WCAG 2.5.8을 어겼다"와 "44px 목표에 못 미친다"는 심각도가 다르게 나온다. 앞의 것은 A·AA 기준이라 지적이고, 뒤의 것은 권고다. 출처: 기준 문장.[](source:ba-crit)[](source:ha-size)

@facts
| 텍스트 대비 (1.4.3 AA) | 4.5:1[](source:ba-color) |
| 큰 텍스트 대비 (1.4.3 AA) | 3:1. 큰 텍스트는 `24px` 이상, 또는 굵은 `18.67px` 이상[](source:ba-color) |
| UI 컴포넌트 경계·상태·의미 있는 그래픽 (1.4.11 AA) | 3:1. 비활성 컨트롤과 로고는 면제[](source:ba-color) |
| 커스텀 focus ring (1.4.11) | 가로지르는 인접 색마다 3:1, `currentColor` 포함[](source:ba-focus) |
| target 크기 (2.5.8 AA, 의무) | 24×24 CSS px, 또는 예외 하나. 예외는 간격, 대등한 컨트롤, 인라인, user agent, essential이다[](source:ba-hit)[](source:ha-size) |
| 간격 예외 | target 중심에 둔 24px 원이 다른 target이나 다른 작은 target의 원과 겹치지 않으면 통과. 단순한 경우 20px target은 4px 간격[](source:ha-size) |
| target 크기 (권고) | touch 44×44px, desktop 40×40px, 밀도가 허락할 때[](source:ba-hit) |
| 다른 표준의 target 크기 (비교용) | WCAG 2.5.5 AAA 44×44px, Apple HIG 44×44pt, Material 48×48dp[](source:ha-size) |
| 스스로 움직이는 것 (2.2.2) | 5초를 넘기면 보이는 pause 또는 stop 컨트롤[](source:ba-timer)[](source:mz-timer) |
| 시간이 지나면 사라지는 toast | 꼭 사라져야 하면 5초 이상, hover나 focus 중에는 타이머 정지[](source:mz-timer) |
| 글자 키우기 (1.4.4) | 200%에서도 모든 내용과 기능이 남는다[](source:ba-zoom)[](source:mz-zoom) |
| reflow (1.4.10) | 320px 폭, 즉 1280px viewport의 400% 확대에서 세로 스크롤만으로 동작. 표·지도·코드 블록은 자기 컨테이너 안에서 스크롤[](source:ba-zoom)[](source:mz-zoom) |
| focus 가림 (2.4.11) | focus된 요소가 sticky header·footer·banner 뒤에 완전히 가려지면 안 된다[](source:ba-focus) |
| 커스텀 ring의 AAA 목표 (2.4.13) | 2px 실선 둘레와 3:1의 대비 변화. 권고[](source:ba-focus) |

위 대비 세 행은 이 스킬이 "어느 기준이 적용되는가"를 정하는 값이다. 실제 쌍을 재는 일은 `better-colors` 몫이다.[](source:ba-color)

## 무엇을 강제하고 무엇을 권하나 {#rules}

아래 표에서 "WCAG"는 원문이 기준 번호를 대는 요구, "규칙"은 번호 없이 `never`·`must`로 쓴 요구, "권고"는 `prefer`·`aim`으로 쓴 것이다. 구분은 원문 표현을 옮긴 것이다.

**키보드와 focus**

| 영역 | 에이전트가 따르는 규칙 | 구분 |
| --- | --- | --- |
| 네이티브 요소 | 동작은 `<button>`, 이동은 `<a href>`를 쓴다. `<div onClick>`은 쓰지 않는다. 진짜 링크는 Cmd/Ctrl/가운데 클릭을 지원해야 한다[](source:ba-native)[](source:sa-btn) | 규칙 |
| ARIA | 네이티브 요소가 있으면 ARIA를 쓰지 않는다. 모든 interactive ARIA 컨트롤은 keyboard로 조작되고 접근 가능한 이름이 있어야 한다. 쓸 땐 role이 전체 keyboard 모델을 약속한다[](source:sa-rules) | 규칙 |
| focus 표시 | `:focus-visible`을 꾸미고 맨 `:focus`는 쓰지 않는다. 브라우저 기본 표시를 바꾸지 않는 쪽을 권한다. 검증된 대체 없이 `outline: none`은 금지다[](source:ba-focus)[](source:fk-ring) | 규칙·권고 |
| 커스텀 ring | 프로젝트 focus token이나 명시한 색을 쓰고, 둘레 전체를 인접 색과 3:1로 맞춘다. forced-colors에서는 시스템 색을 보존한다[](source:ba-focus)[](source:fk-ring) | WCAG 1.4.11 |
| 모든 pointer 동작 | keyboard 경로가 있어야 한다. Escape는 overlay를 닫고, 화살표는 composite widget 안을 움직이고, Tab은 widget 사이를 옮기고, Enter와 Space는 버튼을 누른다[](source:ba-kbd)[](source:fk-keys) | 규칙 (APG는 권고) |
| tabindex | `0`과 `-1`만 쓴다. 양수는 금지다. composite widget은 roving tabindex(활성 항목만 `0`)를 쓰고, input에 focus가 남아야 하는 combobox는 `aria-activedescendant`를 쓴다[](source:ba-kbd)[](source:fk-tab) | 규칙 |
| 모달 | `<dialog>`와 `showModal()`을 우선한다. 직접 만든 overlay는 배경에 `inert`, 자신에 `role="dialog"`와 `aria-modal="true"`를 둔다. 열면 focus를 안으로, 닫으면 트리거로 되돌린다[](source:ba-trap)[](source:fk-trap) | 규칙 |
| 모달의 첫 focus | 파괴적 확인창은 가장 덜 파괴적인 동작에 focus한다. 트리거가 없어졌으면 가장 가까운 논리적 컨테이너로 돌려준다[](source:fk-trap) | 규칙 |
| 경로 변경 | 클라이언트 라우팅 뒤에 `document.title`을 바꾸고 새 화면의 `<h1>`(`tabindex="-1"`)이나 `<main>`으로 focus를 옮긴다. 뒤로·앞으로 이동에서는 스크롤 위치를 복원하고, 새 이동에서는 맨 위로 올린다[](source:ba-trap)[](source:fk-spa) | 규칙 |
| APG key map | Dialog는 Tab·Shift+Tab이 안에서 순환하고 Escape로 닫는다. Tabs는 화살표로 이동하고(끝에서 순환), Tab으로 panel로 나가며, Home·End로 처음·끝에 간다. Menu button은 Enter·Space·ArrowDown으로 열어 첫 항목에, ArrowUp으로 열어 마지막 항목에 간다. Combobox는 ArrowDown으로 목록에 들어가고 Enter로 고르며 Escape로 닫고 input으로 돌아온다. Listbox·radio group은 화살표로 선택을 옮기고 Tab 정지점은 하나다[](source:fk-keys) | 권고 (APG 관례) |
| 키 보충 규칙 | Escape는 마지막에 연 것부터 닫는다(tooltip, menu, dialog 순). Tabs는 panel이 즉시 뜨면 automatic, 전환 비용이 크면 manual(Enter·Space) 활성화를 고른다. `<textarea>`의 Enter는 줄바꿈이고 ⌘/Ctrl+Enter 제출은 구현해야만 동작한다[](source:fk-keys) | 권고 |
| hit area | 보이는 요소가 작으면 wrapper나 `<button>`의 pseudo-element로 넓힌다. `<input>`에는 붙이지 않는다. 넓힌 영역끼리 겹치지 않게 하고, 겹치면 부딪치지 않는 가장 큰 크기로 줄인다[](source:ba-hit)[](source:ha-exp) | 규칙 |
| 장식 레이어 | 그라데이션 scrim, glow 같은 장식 레이어는 `pointer-events: none`이다. 요소인 경우 `aria-hidden="true"`도 붙인다. 클릭으로 닫히는 modal scrim은 컨트롤이라 예외다[](source:ba-hit)[](source:ha-deco) | 규칙 |
| 드래그·제스처 | 모든 드래그에 단일 pointer 대안이 필요하다(2.5.7). pinch·swipe 같은 다점·경로 제스처도 같다(2.5.1). `touch-action: none`은 그 표면에만 건다[](source:ba-hit)[](source:ha-ges) | WCAG |

**컨트롤, 폼, 이름**

| 영역 | 에이전트가 따르는 규칙 | 구분 |
| --- | --- | --- |
| label | 모든 input에 `<label for>`나 감싸는 `<label>`을 단다. placeholder는 label이 아니다. label과 컨트롤은 hit target 하나를 나눈다. 필수 필드는 네이티브 `required`와 보이는 표시를 쓰고, 표시의 뜻은 폼마다 한 번만 설명한다[](source:ba-form)[](source:fm-lab) | 규칙 |
| autocomplete | 사용자 정보 필드에는 유효한 `autocomplete` 토큰을 쓴다(1.3.5). 설명적인 `name`, 진짜 `<form>`, 가짜 input 금지다. 붙여넣기를 막지 않는다[](source:ba-form)[](source:fm-ac) | WCAG 1.3.5 |
| 입력 type | `type`과 `inputmode`로 알맞은 keyboard를 띄운다. OTP·PIN·카드 번호는 `type="text" inputmode="numeric"`, 금액·소수는 `inputmode="decimal"`이다. email·코드·사용자 이름에는 `spellcheck="false"`를 둔다[](source:fm-ac) | 규칙 |
| 에러 | 제출할 때 검증하고, 유효해질 때까지 submit을 비활성화하지 않는다. 실패한 필드에 `aria-invalid="true"`, 에러 문구에 `aria-describedby`를 걸고 첫 invalid 필드에 focus한다[](source:ba-err)[](source:fm-lab) | 규칙 |
| 입력 허용 | 자유 입력을 받고 나중에 검증한다. 입력 중 문자를 막거나 걸러 내지 않는다. 검증 전에 값을 trim한다. 에러는 필드 옆에 아이콘이나 텍스트로 낸다. 빨간 border만으로는 안 된다[](source:fm-lab) | 규칙 |
| 제출 중 | 요청이 시작될 때까지 submit을 활성으로 둔다. 진행 중에는 원래 label 옆에 spinner를 보인다. 진행 중 버튼은 `aria-disabled="true"`로 하고 반복 클릭은 handler에서 무시한다. 네이티브 `disabled`는 focus를 `<body>`로 떨어뜨린다[](source:fm-sub) | 규칙 |
| 제출 결과 | 성공은 polite live region으로, 실패는 첫 invalid 필드 focus로 알린다. `role="alert"`는 필드에 묶이지 않은 폼 단위 에러에만 쓴다. 저장하지 않은 변경은 이동 전에 경고한다. 리렌더가 입력값을 지우거나 focus를 빼앗으면 안 된다[](source:fm-sub) | 규칙 |
| 아이콘 전용 컨트롤 | 설명적인 `aria-label`이 필요하다. 보이는 label 글자는 접근 가능한 이름에 들어가야 한다(2.5.3). 이름 우선순위는 `aria-labelledby`, `aria-label`, 네이티브 label, `title` 순이고, 보이는 글자나 `aria-labelledby`를 `aria-label`보다 낫게 본다[](source:ba-name)[](source:sa-name) | WCAG 2.5.3·규칙 |
| `aria-hidden` | 장식 요소에 쓴다. focus 가능한 요소나 그 조상에는 쓰지 않는다[](source:ba-name)[](source:sr-ah) | 규칙 |
| disabled | 정말 쓸 수 없으면 네이티브 `disabled`다. focus가 남아야 할 때만 `aria-disabled="true"`를 쓰고, 그때는 pointer·keyboard·폼 동작을 코드로 막고 상태 스타일을 직접 입힌다. 둘을 한 요소에 함께 쓰지 않는다. 비활성 컨트롤은 대비 최소값이 면제된다[](source:ba-dis)[](source:sa-dis) | 규칙 |
| 흔한 ARIA 실수 | `<div>`·`<span>`의 `aria-label`, `<button role="button">`, 없는 ID를 가리키는 `aria-labelledby`·`aria-describedby`, 내비게이션 목록에 `role="menu"`를 쓰지 않는다[](source:sa-mist) | 규칙 |

**안내, 움직임, 구조, 확대**

| 영역 | 에이전트가 따르는 규칙 | 구분 |
| --- | --- | --- |
| 색 | 상태에는 아이콘·텍스트·밑줄 같은 두 번째 단서를 붙인다(1.4.1)[](source:ba-color) | WCAG 1.4.1 |
| 변화 안내 | 필드별 검증은 `aria-describedby`, toast·결과 수 같은 비긴급 갱신은 `role="status"`, 필드에 묶이지 않은 긴급 에러는 `role="alert"`다. 반복되는 polite 안내는 비어 있는 region을 먼저 렌더링한 뒤 텍스트를 바꾼다. 동적으로 넣은 alert는 지원이 달라서 대상 스크린 리더에서 시험한다. toast로는 focus를 옮기지 않는다[](source:ba-live)[](source:sr-live) | 규칙 |
| alt | 장식은 `alt=""`, 정보 이미지는 의미, 기능 이미지는 동작(예: 검색 아이콘은 "Search")을 적는다. `alt` 속성이 아예 없는 것이 비어 있는 것보다 나쁘다[](source:ba-alt)[](source:sr-alt) | 규칙 |
| 영상·음원 | 녹화 영상은 자막(1.2.2), 녹음은 transcript(1.2.1)가 필요하다. 소리가 있는 자동 재생은 금지(1.4.2)이고 컨트롤을 항상 렌더링한다[](source:sr-av) | WCAG |
| reduced motion | 움직임은 `@media (prefers-reduced-motion: no-preference)` 안에 둬서 opt-in으로 만든다. 줄여야 할 때 slide·scale은 opacity cross-fade로 바꾸고, parallax와 자동 재생은 완전히 끈다[](source:ba-motion)[](source:mz-rm) | 규칙 |
| 시간 제한 | 액션이나 에러가 있는 toast는 닫을 때까지 둔다. 자동으로 닫는 것은 위험이 낮은 확인에만 맞다. 유일한 undo 링크를 시간 제한 요소에만 두지 않는다[](source:ba-timer)[](source:mz-timer) | 규칙 |
| heading·landmark | heading은 구조이고 스타일이 아니다. 보이는 주요 `<main>` landmark는 하나다. 반복되는 chrome이 앞서면 "Skip to content"를 첫 focusable로 둔다. 같은 종류 landmark가 여럿이면 label로 구분한다. anchor 대상에는 `scroll-margin-block-start`를 준다. `<title>`은 현재 맥락에 맞게 가장 구체적인 것부터 쓴다(2.4.2, 예: `Billing · Settings · Acme`)[](source:ba-struct)[](source:sa-land)[](source:fk-skip) | 규칙 |
| 시각적으로만 숨기기 | `.sr-only`는 `0`이 아니라 `1px` 상자로 숨기고 `white-space: nowrap`을 둔다. `display: none`과 `visibility: hidden`은 보조기기에서도 지우므로 쓰지 않는다[](source:sr-hid) | 규칙 |
| 로딩 | 갱신 중인 region에 `aria-busy="true"`를 두고 "Loading…"을 polite로 알린 뒤 결과를 알린다[](source:sr-live) | 규칙 |
| SVG | 장식 SVG는 `aria-hidden="true"`, 의미 있는 inline SVG는 `role="img"`와 `aria-label` 또는 첫 자식 `<title>`을 `aria-labelledby`로 가리킨다. 간단하면 `<img src="icon.svg" alt="…">`가 가장 믿을 만하다[](source:sr-svg) | 규칙 |
| 확대 | 글자 컨테이너에는 `height` 대신 `min-height`를 준다. viewport meta에 `maximum-scale=1`이나 `user-scalable=no`를 쓰지 않는다. media query는 가능하면 `rem`·`em`으로 쓴다[](source:ba-zoom)[](source:mz-zoom) | 규칙 |

reduced motion에서 무엇을 끄고 무엇을 남기는지는 세 갈래로 나뉜다.[](source:mz-rm)

| 완전히 끈다 | 바꾼다 | 남긴다 |
| --- | --- | --- |
| parallax 스크롤 | slide·scale·zoom 전환 → opacity cross-fade | 로딩 spinner와 진행 표시 |
| 자동 재생 영상·GIF, 반복 장식 | 부드러운 스크롤 → 즉시 점프 | 즉각적인 상태 변화(hover 색, focus ring) |
| 회전, 화면을 가로지르는 큰 움직임 | 자동 회전 carousel → 멈춘 채 시작 | 버튼 누름 같은 짧은 기능 피드백 |

예시 값도 있다. skip link의 `-999px`와 `16px`, anchor의 `scroll-margin-block-start: 80px`은 원문의 예시 코드이고 의무가 아니다.[](source:fk-skip)

## 어떤 순서로 보고, 어떻게 보고하나 {#flow}

리뷰는 두 번 걷는 것이다. 에이전트가 두 걸음에서 무엇을 보는지는 원문에 한 줄씩 있다.[](source:ba-intro)

| 걷기 | 합격 조건 |
| --- | --- |
| keyboard만 | 마우스 없이 모든 흐름이 끝난다 |
| 스크린 리더 | 모든 컨트롤이 이름, 역할, 상태를 말한다 |

변화를 알리는 방법은 위에서부터 내려가다가 처음 맞는 곳에서 멈춘다. 이 순서는 `screen-readers.md`에 번호로 적혀 있다.[](source:sr-choose)

@workflow id=announce-choice title="변화를 알리는 방법 고르기"
| f1 | focus가 이동하나? | backend |
| f2 | 컨트롤에 묶였나? | backend |
| f3 | 긴급한가? | backend |
| r1 | 추가 안내 없음 | external |
| r2 | aria-describedby | external |
| r3 | role=status | external |
| r4 | role=alert | external |
| f1 > r1 | 예 | emphasis |
| f1 > f2 | 아니오 | |
| f2 > r2 | 예 | emphasis |
| f2 > f3 | 아니오 | |
| f3 > r4 | 예 | emphasis |
| f3 > r3 | 아니오 | emphasis |

@steps id=announce-steps
| st-f1 | focus가 이동하나? | 열린 modal이나 첫 invalid 필드처럼 focus가 이미 옮겨 가면 focus 이동이 곧 안내다. 더 할 것이 없다. | announce-choice | f1 |
| st-f2 | 컨트롤에 묶였나? | 필드 에러나 글자 수처럼 한 컨트롤에 묶이면 그 컨트롤에 `aria-describedby`를 걸어 필드와 함께 읽히게 한다. | announce-choice | f2 |
| st-f3 | 긴급한가? | 폼 단위 실패나 세션 만료처럼 긴급하고 컨트롤에 묶이지 않으면 `role="alert"`, 긴급하지 않으면 `role="status"`다. | announce-choice | f3 |

보고할 때의 기준과 마무리 규칙은 아래 표와 같다.

| 항목 | 원문 내용 |
| --- | --- |
| `HIGH` | 작업을 막거나, 보조기기에서 내용을 숨기거나, 시스템 전체에 퍼진 실패[](source:ba-sev) |
| `MEDIUM` | 상호작용을 눈에 띄게 어렵게 한다[](source:ba-sev) |
| `LOW` | 고립된 다듬기[](source:ba-sev) |
| `HIGH`로 바로 올리는 것 | 접근 가능한 이름 없음, focus 표시 없음, keyboard 경로 없는 pointer 경로, reduced motion 무시, 320px·200%에서 잃는 것, 색만으로 전하는 의미. `better-interface` escalation trigger 중 이 도메인 몫이다[](source:ba-sev)[](source:bi-trig) |
| 브라우저 없이 확인 | 모든 interactive 요소의 접근 가능한 이름, 네이티브가 아닌 컨트롤의 keyboard handler, focus 스타일, `prefers-reduced-motion` 가드, input에 묶인 label[](source:ba-ver) |
| 브라우저로 확인 | 순서대로 Tab, 접근성 트리의 이름·role 읽기, 모든 정지점의 focus 표시 확인, 자동 감사 실행[](source:ba-ver) |
| 못 한 검사 | 전부 `Not verified`로 적는다[](source:ba-ver) |
| 보고 형식 | 어긴 원칙별로 묶고 심각도 순. 뿌리 원인마다 한 행에 모든 위치를 적는다. 열은 Severity, Location(`path/to/file:line`), Before, After, Why이고 `Why`에 WCAG 기준이나 원칙과 사용자 영향을 쓴다[](source:ba-fmt) |
| 끝맺음 | `HIGH`가 남으면 `Block`, 아니면 `Approve`. 나머지는 표에 할 일로 남긴다. 보지 않은 범위는 `Approve`하지 않는다. 지적이 없으면 "No actionable accessibility findings"와 검증 결과를 쓴다[](source:ba-fmt) |

판정: `better-interface`가 이 스킬을 부르면 이 스킬의 심각도 사다리와 보고 형식은 쓰이지 않는다. `better-interface`가 "혼자 쓸 때를 위한 것이니 이 파일의 것으로 대체한다"고 적었기 때문이다. 출처: 해당 문장.[](source:bi-order)

끝내기 전에 코드에서 훑는 패턴은 13개다.[](source:ba-pat)

| 이런 패턴이 보이면 | 이렇게 고친다 |
| --- | --- |
| `focus-visible` 대체 없이 `outline: none`, `outline-none` | 브라우저 ring을 되살리거나 검증한 커스텀 ring을 둔다 |
| `<div onClick`, `<span onClick` | `<button>`, 이동이면 `<a href>` |
| `onKeyDown` 없는 `role="button"`·`role="tab"` | 네이티브 요소, 아니면 APG key map 구현 |
| `tabIndex={1}` 같은 양수 `tabindex` | DOM 순서를 고치고 `0` |
| submit 버튼의 `disabled={!isValid}` | 활성으로 두고 제출 시 검증 |
| `{msg && <div role="status">`처럼 텍스트와 함께 마운트되는 region | 빈 region을 먼저 렌더링하고 텍스트를 갱신 |
| 성공 toast의 `aria-live="assertive"` | `role="status"` |
| `alt` 속성 없는 `<img` | 장식이면 `alt=""`, 아니면 목적을 쓴다 |
| 보이는 label을 빠뜨린 `aria-label` | 보이는 글자로 이름을 시작 |
| 버튼·링크·input의 조상에 있는 `aria-hidden` | 제거하거나 그 하위 트리를 inert로 |
| `maximum-scale=1`, `user-scalable=no` | 제거 |
| 네이티브 `disabled` 컨트롤의 tooltip | 옆에 텍스트를 두거나 `aria-disabled`로 focus를 유지 |
| 버튼 대안 없는 `onDragStart`나 드래그 라이브러리 | 같은 결과에 닿는 단일 pointer 경로 추가 |

## 흐름 속 위치 {#position}

`better-accessibility`는 묶음 `interface-audit`에 속하는 도메인 스킬이다. `better-interface`가 여섯 도메인을 정해진 순서로 부를 때 1번째다. `interface-review`는 변경의 제거된 줄에서 접근성 신호를 찾으면 이 스킬로 보내 판단하게 한다.[](source:bi-order)[](source:ir-sig)

@workflow id=a11y-position title="better-accessibility 앞뒤"
| pos-ir | interface-review | backend |
| pos-bi | better-interface | backend |
| pos-ba | better-accessibility | backend |
| pos-rep | 통합 보고서 | external |
| pos-ir > pos-ba | 제거된 줄 신호 | dashed |
| pos-bi > pos-ba | 1번째 위임 | emphasis |
| pos-ba > pos-rep | 도메인 증거 | |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `better-interface`(앞) | 리뷰 범위 | 도메인 리뷰 증거 | 의무형. 여섯 도메인을 모두 불러 마친 뒤 통합한다. 원칙·references·검증만 가져가고 심각도·형식은 `better-interface` 것으로 대체한다. 이 스킬이 없으면 이 도메인을 `Not reviewed`로 표시하고 이어 간다[](source:bi-order) | r60 |
| `interface-review`(앞) | 일치한 제거 줄 | 그 줄이 접근성 회귀인지 판단 | 조건부. `-` 쪽 줄이 `aria-label`, `alt=`, `<label`, `<button>` 교체, `:focus-visible`·`outline`·`tabindex`, `prefers-reduced-motion` 신호와 맞을 때. 신호는 단서일 뿐이고 대체물이 변경 안에 없을 때만 회귀다. `interface-review`는 `disable-model-invocation: true`라서 사용자가 직접 부른다[](source:ir-fm)[](source:ir-sig)[](source:rs-a11y) | r69 |
| `better-interface`(뒤) | - | 도메인 리뷰 증거 | 받는 쪽이 통합 보고서와 판정 결과를 소유한다. 이 스킬의 `HIGH` 6가지는 `better-interface`의 escalation trigger 목록의 일부다[](source:ba-sev)[](source:bi-trig) | r60, r103 |
| `better-colors` | - | - | 참고. 대비 측정과 색 수정은 그쪽 몫이다. 호출하라는 지시는 아니다[](source:ba-bound)[](source:ba-color) | r79 |
| `better-typography` | - | - | 참고. 글자 크기·iOS input 확대·언어 메타데이터는 그쪽 몫이다. 그쪽은 heading 구조의 의미를 이 스킬 몫이라고 적는다[](source:ba-bound)[](source:ty-bound) | r80, r92 |
| `better-layout` | - | - | 참고. target 사이 간격·공간 RTL·sticky 가림 수정은 그쪽 몫이다. 그쪽은 hit area·focus 동작을 이 스킬 몫이라고 적고, 넓힌 hit area가 겹치지 않게 간격을 잡는다[](source:ba-bound)[](source:lay-bound)[](source:lay-sp) | r81, r86 |
| `better-writing` | - | - | 참고. label·에러·alt 문구는 그쪽 몫이다. 그쪽은 에러 마크업·안내·접근 가능한 이름을 싣는 속성·undo toast 표시 시간을 이 스킬 몫이라고 적는다[](source:ba-bound)[](source:wr-bound)[](source:wr-toast) | r82, r97 |
| `better-ui` | - | - | 참고. 애니메이션 레시피·hover 스타일·스크롤 격리는 그쪽 몫이다. 그쪽은 hit area·keyboard·ARIA·reduced motion 요구와 focus ring, input의 3:1 비텍스트 대비를 이 스킬 몫이라고 적는다[](source:ba-bound)[](source:ui-bound)[](source:ui-border)[](source:ui-rm) | r83, r76 |
| `break`, `build-design`, `teardown`(묶음 밖) | - | - | 참고. `break`는 깨짐을 이 스킬의 어휘로 이름 붙이고, `build-design`은 디자인이 접근성 규칙을 깨면 디자인대로 만들고 충돌을 이 스킬에 보고하며, `teardown`은 접근 가능한 임베딩을 이 스킬에 넘긴다[](source:bk-scen)[](source:bd-bound)[](source:td-bound)[](source:td-svg) | r119, r135, r146 |

그림에는 r60, r69만 그렸다. r79~r83, r86, r92, r97, r76은 "그 일은 저 스킬 몫"이라는 참고라서 순서가 없다. 판정: r69의 점선은 조건부 위임이라서 일부러 점선으로 그렸다.

전체 흐름은 `design/_group-interface-audit/interface-audit.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 8개, 합계 36,021B다. `SKILL.md` 10,949B, `forms.md` 3,491B, `hit-areas.md` 3,262B, `focus-and-keyboard.md` 6,492B, `motion-and-zoom.md` 2,437B, `semantics-and-aria.md` 4,636B, `screen-readers.md` 4,633B, `agents/openai.yaml` 121B를 끝까지 읽었다. 구조·표본만 본 파일은 0개다.
- 관계 확인용으로 다른 스킬 16개 파일의 해당 줄만 읽었다. `better-interface` 1~12·42~57·77~95줄, `interface-review` 1~5·56~61줄과 `removed-signals.md` 7~11줄과 `scope-resolution.md` 68줄, `better-ui` 16·28·52줄과 `icons.md` 105줄, `better-layout` 12줄과 `spacing-and-adaptivity.md` 30줄, `better-typography` 10줄, `better-writing` 12줄과 `patterns.md` 15줄, `break/scenarios.md` 72~78줄, `build-design` 12줄, `teardown` 14줄과 `preview-page.md` 31줄과 `sheet-and-svg.md` 58줄이다. 이 파일들은 위 개수에 넣지 않았다.
- 제외한 파일: 없음. 번역본과 바이너리 파일이 없다. `scripts/`와 `assets/`도 없다.
- 원문 대조 범위: 활성화 제한 1개(호출 제한 필드 없음), 수치 14개(대비 3, target 크기와 예외, 5초, 200%, 320px 등), 보고 `Block`·`Approve` 조건 2개, `HIGH` 6가지, 점검 패턴 13행, 관계 행 r60, r69, r76, r79~r83, r86, r92, r97, r103, r119, r135, r146을 원장과 원문 줄로 대조했다. 승인·종료 조건은 위 보고 끝맺음 외에는 원문에 없다.
- 옮기지 않은 것: `forms.md`의 `autocomplete` 토큰 표 8행(이름·이메일·전화·주소·카드·로그인·가입·2FA)과 `type` 표 4행의 개별 값 일부, 모든 파일의 CSS·HTML·Tailwind 코드 예시, `semantics-and-aria.md`의 button·link·div 비교 표(이 페이지는 규칙 문장으로 대신함), `screen-readers.md`의 alt 표 중 "텍스트 이미지"·"복잡한 이미지" 행이다. 이 밖의 규칙 문장은 표에 옮겼다.
- 분석 중 바뀐 파일: 없음. `design/` 작업 트리는 commit `0465878` 그대로다.
- 사람 검토: 미실시.

@callout level=open-question title="확인하지 못한 것"
- 이 스킬이 실제로 에이전트의 동작을 바꾸는지는 실행해 보지 않아 확인하지 않았다. 페이지의 모든 동작은 지시상 동작이다.
- "자동 감사를 실행한다"고 하지만 어떤 도구를 쓰는지는 `원문에 명시 없음`이다.
- `better-colors`가 없을 때 렌더된 쌍을 누가 측정하는지는 `원문에 명시 없음`이다. 이 스킬은 측정을 그쪽에 맡긴다.[](source:ba-color)
- 사용자가 이 스킬을 직접 불렀을 때의 첫 응답이나 사람 승인 지점은 `원문에 명시 없음`이다.
