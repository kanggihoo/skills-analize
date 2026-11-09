# better-ui 스킬은 에이전트를 어떻게 바꾸나 {#better-ui-skill}

`better-ui`를 쓰면 에이전트는 UI 다듬기를 취향으로 두지 않고, 표면·아이콘·모션마다 정해 둔 정확한 값을 코드에 대 본다. 중첩 radius는 `안쪽 radius + padding + border 두께`, 버튼 눌림은 `0.96`·`150ms`처럼 값이 이미 정해져 있다. 리뷰 결과는 원인 하나에 한 행인 표로 내고, `HIGH`가 남으면 `Block`으로 끝낸다.[](source:exact)[](source:radius)[](source:press)[](source:format)

- 켜지는 때: 호출 제한 필드가 없다. 모델이 `description`을 보고 켤 수 있다. 사용자가 직접 부를 때만 켜진다는 말은 없다.[](source:fm)
- 강제하는 것: `SKILL.md`의 값은 어림하지 않는 정확한 값이다. 예외는 광학 정렬의 눈대중과 padding `24px` 기준 둘뿐이다.[](source:exact)
- 지키는 선: 프로젝트가 일관되게 정한 관례는 지적이 아니라 선호다. 같은 디테일을 두 방식으로 했을 때만 지적이다.[](source:conv)
- 쓰면 안 되는 때: 바탕 상호작용이 깨져 있을 때다. 다듬기 지적은 깨진 상호작용보다 앞서지 않는다. 글자·접근성·배치·색은 다른 스킬 몫이다.[](source:intro)[](source:owners)

@answer scope="design/jakubkrehel/better-ui · 원본 텍스트 8개 32,213B · 커밋 0465878 · 호출 제한 없음 · 지시상 동작"
@meta locale=ko
@source fm title="design/jakubkrehel/better-ui/SKILL.md · 11122B · 지시 본문과 frontmatter" path=design/jakubkrehel/better-ui/SKILL.md lines=1:4
@source intro title="SKILL.md · 적용 시점" path=design/jakubkrehel/better-ui/SKILL.md lines=8:8
@source exact title="SKILL.md · 정확한 값과 눈대중 예외" path=design/jakubkrehel/better-ui/SKILL.md lines=12:12
@source conv title="SKILL.md · 프로젝트 관례" path=design/jakubkrehel/better-ui/SKILL.md lines=14:14
@source owners title="SKILL.md · 다른 스킬의 몫" path=design/jakubkrehel/better-ui/SKILL.md lines=16:16
@source radius title="SKILL.md · 중첩 radius" path=design/jakubkrehel/better-ui/SKILL.md lines=20:20
@source optical title="SKILL.md · 광학 정렬" path=design/jakubkrehel/better-ui/SKILL.md lines=24:24
@source shadow title="SKILL.md · shadow와 border" path=design/jakubkrehel/better-ui/SKILL.md lines=28:30
@source outline title="SKILL.md · 이미지 outline" path=design/jakubkrehel/better-ui/SKILL.md lines=34:34
@source trans title="SKILL.md · transition과 keyframes" path=design/jakubkrehel/better-ui/SKILL.md lines=38:38
@source press title="SKILL.md · 눌림 scale" path=design/jakubkrehel/better-ui/SKILL.md lines=42:42
@source freq title="SKILL.md · 고빈도 상호작용과 정적 단서" path=design/jakubkrehel/better-ui/SKILL.md lines=46:48
@source rm title="SKILL.md · reduced motion" path=design/jakubkrehel/better-ui/SKILL.md lines=52:52
@source stagger title="SKILL.md · 진입 stagger" path=design/jakubkrehel/better-ui/SKILL.md lines=56:56
@source exit title="SKILL.md · 퇴장" path=design/jakubkrehel/better-ui/SKILL.md lines=60:60
@source initial title="SKILL.md · 첫 렌더" path=design/jakubkrehel/better-ui/SKILL.md lines=64:64
@source icon title="SKILL.md · 아이콘 cross-fade" path=design/jakubkrehel/better-ui/SKILL.md lines=68:70
@source theme title="SKILL.md · theme 전환" path=design/jakubkrehel/better-ui/SKILL.md lines=74:74
@source only title="SKILL.md · 바뀌는 속성만 transition" path=design/jakubkrehel/better-ui/SKILL.md lines=78:78
@source willch title="SKILL.md · will-change" path=design/jakubkrehel/better-ui/SKILL.md lines=82:82
@source hover title="SKILL.md · hover 가능한 포인터" path=design/jakubkrehel/better-ui/SKILL.md lines=86:86
@source overscroll title="SKILL.md · overlay 스크롤" path=design/jakubkrehel/better-ui/SKILL.md lines=90:90
@source stroke title="SKILL.md · 아이콘 stroke" path=design/jakubkrehel/better-ui/SKILL.md lines=94:94
@source svg title="SKILL.md · 아이콘 색과 변형" path=design/jakubkrehel/better-ui/SKILL.md lines=98:98
@source detect title="SKILL.md · 끝내기 전 검사 15개" path=design/jakubkrehel/better-ui/SKILL.md lines=102:118
@source sev title="SKILL.md · 심각도" path=design/jakubkrehel/better-ui/SKILL.md lines=122:122
@source verify title="SKILL.md · 검증" path=design/jakubkrehel/better-ui/SKILL.md lines=124:124
@source format title="SKILL.md · 보고 형식과 Block·Approve" path=design/jakubkrehel/better-ui/SKILL.md lines=126:133
@source an-int title="design/jakubkrehel/better-ui/animations.md · 4923B · 중단 가능한 전환, 눌림, 첫 렌더, theme, reduced motion recipe" path=design/jakubkrehel/better-ui/animations.md lines=7:11
@source an-press title="animations.md · 눌림 recipe" path=design/jakubkrehel/better-ui/animations.md lines=29:57
@source an-skip title="animations.md · 첫 렌더 건너뛰기" path=design/jakubkrehel/better-ui/animations.md lines=84:86
@source an-theme title="animations.md · theme 전환 recipe" path=design/jakubkrehel/better-ui/animations.md lines=99:136
@source an-rm title="animations.md · reduced motion 대체" path=design/jakubkrehel/better-ui/animations.md lines=155:170
@source ee-enter title="design/jakubkrehel/better-ui/enter-exit.md · 3596B · 진입·퇴장 recipe" path=design/jakubkrehel/better-ui/enter-exit.md lines=7:10
@source ee-start title="enter-exit.md · display: none 진입" path=design/jakubkrehel/better-ui/enter-exit.md lines=75:101
@source ee-full title="enter-exit.md · 전체 퇴장" path=design/jakubkrehel/better-ui/enter-exit.md lines=122:122
@source it-lib title="design/jakubkrehel/better-ui/icon-transitions.md · 2647B · 아이콘 교체 recipe" path=design/jakubkrehel/better-ui/icon-transitions.md lines=7:7
@source it-which title="icon-transitions.md · 애니메이션할 아이콘" path=design/jakubkrehel/better-ui/icon-transitions.md lines=66:72
@source ic-stroke title="design/jakubkrehel/better-ui/icons.md · 3963B · stroke·크기·색·변형·RTL" path=design/jakubkrehel/better-ui/icons.md lines=7:13
@source ic-lib title="icons.md · 라이브러리와 크기" path=design/jakubkrehel/better-ui/icons.md lines=29:30
@source ic-var title="icons.md · outline과 fill" path=design/jakubkrehel/better-ui/icons.md lines=57:79
@source ic-rtl title="icons.md · RTL" path=design/jakubkrehel/better-ui/icons.md lines=83:105
@source pf-all title="design/jakubkrehel/better-ui/performance.md · 2265B · transition 범위와 will-change" path=design/jakubkrehel/better-ui/performance.md lines=7:7
@source pf-tw title="performance.md · Tailwind transition 유틸리티" path=design/jakubkrehel/better-ui/performance.md lines=31:31
@source pf-wc title="performance.md · will-change 부작용" path=design/jakubkrehel/better-ui/performance.md lines=35:63
@source su-rad title="design/jakubkrehel/better-ui/surfaces.md · 3584B · radius·광학 정렬·shadow·이미지 outline recipe" path=design/jakubkrehel/better-ui/surfaces.md lines=5:29
@source su-opt title="surfaces.md · 광학 정렬" path=design/jakubkrehel/better-ui/surfaces.md lines=47:92
@source su-shadow title="surfaces.md · shadow 값" path=design/jakubkrehel/better-ui/surfaces.md lines=94:139
@source su-img title="surfaces.md · 이미지 outline" path=design/jakubkrehel/better-ui/surfaces.md lines=141:166
@source yaml title="design/jakubkrehel/better-ui/agents/openai.yaml · 113B · 표시 이름과 한 줄 설명" path=design/jakubkrehel/better-ui/agents/openai.yaml lines=1:3
@source bi-order title="design/jakubkrehel/better-interface/SKILL.md · r65 확인용 도메인 순서" path=design/jakubkrehel/better-interface/SKILL.md lines=42:57
@source bi-trig title="design/jakubkrehel/better-interface/SKILL.md · r100 확인용 escalation trigger" path=design/jakubkrehel/better-interface/SKILL.md lines=77:91
@source bi-ro title="design/jakubkrehel/better-interface/SKILL.md · 기본은 읽기 전용 리뷰" path=design/jakubkrehel/better-interface/SKILL.md lines=113:115
@source ir-exc title="design/jakubkrehel/interface-review/scope-resolution.md · r74 확인용 이미지 예외" path=design/jakubkrehel/interface-review/scope-resolution.md lines=68:68
@source ac-own title="design/jakubkrehel/better-accessibility/SKILL.md · r83 확인용" path=design/jakubkrehel/better-accessibility/SKILL.md lines=12:12
@source co-own title="design/jakubkrehel/better-colors/SKILL.md · r85 확인용" path=design/jakubkrehel/better-colors/SKILL.md lines=12:12
@source la-own title="design/jakubkrehel/better-layout/SKILL.md · r87 확인용" path=design/jakubkrehel/better-layout/SKILL.md lines=12:12
@source ty-own title="design/jakubkrehel/better-typography/SKILL.md · r95 확인용" path=design/jakubkrehel/better-typography/SKILL.md lines=89:89
@source br-sc title="design/jakubkrehel/break/scenarios.md · r120 확인용" path=design/jakubkrehel/break/scenarios.md lines=72:72
@source bd-own title="design/jakubkrehel/build-design/SKILL.md · r140 확인용" path=design/jakubkrehel/build-design/SKILL.md lines=12:12
@source em-desc title="design/emilkowalski/emil-design-eng/SKILL.md · r151 확인용 description" path=design/emilkowalski/emil-design-eng/SKILL.md lines=3:3
@source em-press title="design/emilkowalski/review-animations/STANDARDS.md · 눌림 수치 비교용" path=design/emilkowalski/review-animations/STANDARDS.md lines=59:59
@source em-stag title="design/emilkowalski/review-animations/STANDARDS.md · stagger 수치 비교용" path=design/emilkowalski/review-animations/STANDARDS.md lines=149:151

## 언제 켜지고, 무엇이 다른 스킬의 몫인가 {#trigger}

@code source=fm language=yaml

frontmatter에는 `name`과 `description`만 있다. 호출 제한 필드가 없으므로 모델이 `description`을 보고 켤 수 있다.[](source:fm)

판정: `description`은 모델이 판단할 때 참고하는 설명이다. "polish"라는 단어가 나와야만 켜지는 목록은 아니다. 첫 응답 규칙이나 호출 인자는 `원문에 명시 없음`이다.

`agents/openai.yaml`에는 표시 이름 `Better UI`와 한 줄 설명만 있고, 동작 지시는 없다.[](source:yaml)

이 스킬은 바탕 상호작용이 이미 제대로 동작할 때 적용된다.[](source:intro) 다음 네 영역은 다른 스킬이 맡는다.[](source:owners)

| 영역 | 담당 스킬 | 이 스킬에 남는 것 |
| --- | --- | --- |
| 글자 줄바꿈, 폰트 렌더링, tabular numbers, 글자 간격 | `better-typography` | 없음 |
| hit area, 키보드, ARIA, reduced motion 요구 | `better-accessibility` | reduced motion을 지키는 recipe는 이 스킬이 쓴다. focus ring과 form input의 3:1 비텍스트 대비는 그쪽 몫이다[](source:shadow)[](source:rm) |
| 묶음, 섹션 간격, breakpoint, 공간 RTL | `better-layout` | 방향 아이콘 뒤집기만 이 스킬이 한다[](source:ic-rtl) |
| color token, 대비 측정 | `better-colors` | 없음 |

- 프로젝트의 컴포넌트 라이브러리, token, density를 그대로 둔다.[](source:conv)
- 규칙이 값을 주지 않는 곳은 프로젝트의 모션 언어에 맞춘다.[](source:conv)
- shadow를 안 쓰는 스타일처럼 일관되게 정한 관례는 선호이지 지적이 아니다. 같은 디테일을 프로젝트 안에서 두 방식으로 했을 때만 지적이다.[](source:conv)

## 표면과 아이콘에는 어떤 값을 쓰나 {#surface-icon}

`SKILL.md`가 값을 정확하다고 못 박은 곳과 눈으로 판단하라고 한 곳이 섞여 있다. 눈대중이 허용되는 곳은 광학 정렬의 미세 조정과 padding `24px` 기준 둘이고, 둘 다 출발점이다.[](source:exact) recipe 파일의 값이 의무인지 예시인지는 원문이 따로 밝히지 않는다. 표의 `구분` 열이 이 차이를 보여 준다.

| 항목 | 값과 조건 | 구분 |
| --- | --- | --- |
| 중첩 radius | 바깥 radius = 안쪽 radius + padding + border 두께다. 예: 안쪽 `12px`에 padding `8px`이면 바깥 `20px`이다. padding이 `24px`를 넘거나 비대칭이면 층마다 자기 radius token을 유지한다[](source:radius)[](source:su-rad) | 공식은 정확한 값. `24px` 기준은 {caution:눈대중}이고 `surfaces.md`에는 없다 |
| 광학 정렬 | 아이콘 쪽 padding을 글자 쪽보다 `2px` 줄인다(예: `16px`과 `14px`). 재생 삼각형은 뾰족한 쪽으로 `translateX(2px)` 민다. 비대칭 아이콘은 SVG의 `viewBox`나 path를 고치고, 못 고치면 wrapper를 `translate-x-px`로 민다[](source:optical)[](source:su-opt) | {caution:눈대중} 출발점 |
| 깊이용 border | 깊이만 만드는 border는 겹친 투명 `box-shadow`로 바꾼다. divider, separator, table cell, selected state, form input의 border는 둔다[](source:shadow) | 규칙 |
| light shadow | 세 겹이다. `0 0 0 1px oklch(0 0 0 / 0.06)`, `0 1px 2px -1px oklch(0 0 0 / 0.06)`, `0 2px 4px 0 oklch(0 0 0 / 0.04)`. hover는 알파가 `0.08`, `0.08`, `0.06`이다. 전환은 `150ms ease-out`이다[](source:su-shadow) | recipe 값 |
| dark shadow | 깊이 shadow가 어두운 배경에서 사라지므로 흰 ring 하나만 둔다. `0 0 0 1px oklch(1 0 0 / 0.08)`, hover는 `0.13`이다[](source:su-shadow) | recipe 값 |
| forced-colors | forced-colors mode는 모든 `box-shadow`를 지운다. shadow ring 밑에 `border: 1px solid transparent`를 두어 가장자리를 남긴다. 이 border는 대체한 border와 box 크기를 같게 한다[](source:shadow)[](source:su-shadow) | 규칙 |
| 이미지 outline | 콘텐츠 이미지에 `1px` outline을 `outline-offset: -1px`로 넣는다. 라이트는 `oklch(0 0 0 / 0.1)`, 다크는 `oklch(1 0 0 / 0.1)`이다. 팔레트의 near-black, 색이 낀 neutral, accent 색은 쓰지 않는다. 색 테두리로 보이기 때문이다. 로고와 일러스트 같은 투명 그림은 건너뛴다. `border`가 아니라 `outline`을 쓰는 이유는 이미지 크기가 변하지 않기 때문이다[](source:outline)[](source:su-img) | 정확한 값 |
| 아이콘 stroke | 글자 굵기를 따른다. Regular(400) 14–16px는 `1.5px`, 500–600은 `2px`, Bold(700)나 강조한 단독 아이콘은 `2.5px`다. 값은 렌더된 픽셀이다. 24px grid 아이콘을 16px로 그리면 stroke가 16/24배라 `stroke-width="2"`가 약 `1.33px`가 된다. 라이브러리의 절대 stroke 옵션이나 `vector-effect: non-scaling-stroke`로 맞춘다[](source:stroke)[](source:ic-stroke) | `SKILL.md`는 양 끝(`1.5px`~`2.5px`)만 적고, 중간 값은 `icons.md` 표 |
| 아이콘 라이브러리와 크기 | 한 표면에는 라이브러리 하나만 쓴다. stroke 변형이 없는 라이브러리는 기본 stroke를 두고 크기나 색으로 강조한다. 인라인 아이콘은 옆 글자 크기의 `1em`–`1.25em`이다[](source:ic-lib) | 규칙 |
| 아이콘 색과 변형 | 아이콘은 `currentColor`로 그리고 hover, selected, disabled는 CSS color와 opacity가 맡는다. 상태별 asset은 쓰지 않는다. 기본은 outline, active는 fill이며 둘을 섞어 쓰지 않는다[](source:svg)[](source:ic-var) | 규칙 |
| 아이콘 render 크기 | 가장 작게 그려지는 크기(흔히 `16px`)에서 알아볼 수 있어야 한다. grid가 `16`, `20`, `24`로 나뉘면 render 크기에 맞는 grid를 쓴다. 항상 SVG이고 raster는 쓰지 않는다[](source:ic-var) | 규칙 |
| RTL | `dir="rtl"`에서 읽는 방향과 뜻이 묶인 아이콘만 뒤집는다. 뒤로·앞으로 화살표, 내비게이션 chevron, 정렬·목록·들여쓰기 glyph, 스피커 파동, "send" 같은 방향 glyph가 해당한다. 로고, 체크 표시, 시계·컵·연필 같은 물체, 미디어 재생 아이콘은 뒤집지 않는다. 요소 하나에는 뒤집는 방법 하나만 쓴다[](source:ic-rtl) | 규칙 |

## 모션에는 어떤 값을 쓰고 무엇을 하지 않나 {#motion}

`cubic-bezier(0.2, 0, 0, 1)`은 `cubic-bezier(0.4, 0, 0.2, 1)`이 아니고, `0.96`은 `0.95`가 아니다. 어림하는 범위가 아니라 정확한 값이다.[](source:exact)

@facts
| 버튼 눌림 | `scale: 0.96`, `150ms`, `ease-out`[](source:press) |
| 고빈도 상호작용 | 즉시 반응하거나 `opacity`·`background-color`를 `150ms` 이하로 transition한다[](source:freq) |
| 진입 stagger | 의미 덩어리 사이 `100ms`. 덩어리마다 opacity `0`에서 `1`, blur `4px`에서 `0`, `translateY(12px)`에서 `0`을 `300ms` `ease-out`으로 한다[](source:stagger) |
| 짧은 headline | 단어 사이 `80ms`. recipe에만 있다[](source:ee-enter) |
| 퇴장 | opacity `0`, blur `4px`, 고정 `translateY(-12px)`를 `150ms` `ease-out`으로 한다[](source:exit) |
| 아이콘 교체(motion library) | scale `0.25`에서 `1`, opacity `0`에서 `1`, blur `4px`에서 `0px`. `{ type: "spring", duration: 0.3, bounce: 0 }`[](source:icon) |
| 아이콘 교체(library 없음) | 두 아이콘을 DOM에 두고 `300ms`, `cubic-bezier(0.2, 0, 0, 1)`로 cross-fade한다[](source:icon) |
| 전체 슬라이드 퇴장(recipe 예시) | `x: "-100%"`, `200ms`, `ease-out`[](source:ee-full) |
| `display: none` 진입(recipe 예시) | 열릴 때 `300ms`, 닫힐 때 `150ms`, `translate: 0 12px`[](source:ee-start) |

위 값은 `SKILL.md`의 규칙과 recipe 파일의 예시를 함께 모았다. 마지막 두 줄과 "짧은 headline"은 recipe 파일에만 있는 값이다.

| 움직임 | 하는 것 | 하지 않는 것 |
| --- | --- | --- |
| 상호작용 상태 전환 | CSS transition이나 motion library의 spring을 쓴다. 사용자가 도중에 되돌리면 새 목표로 방향을 바꾼다[](source:trans)[](source:an-int) | keyframes는 고정 타임라인이라 되돌릴 수 없다. 한 번만 도는 시퀀스에만 쓴다 |
| 버튼 눌림 | 끄는 방법은 컴포넌트의 variant API나 `static` prop이다. `:not(:disabled):active`나 `enabled:active:`로 disabled를 뺀다[](source:press)[](source:an-press) | disabled 버튼은 절대 scale하지 않는다. `0.96`보다 작은 값은 지적이다 {bad:지적} |
| 고빈도 상호작용 | keystroke, row hover, tab 전환에는 즉시 피드백을 준다[](source:freq) | 표현이 큰 모션은 첫 로드, 성공 상태, 빈 상태 같은 드문 순간에만 쓴다 |
| 정적 단서 | 애니메이션이 있는 상태 변경마다 color, icon, label 중 하나를 남긴다[](source:freq) | 모션을 유일한 피드백으로 두지 않는다. 이 경우는 보이는 즉시 `HIGH`다[](source:sev) |
| reduced motion | 이동, scale, blur는 `prefers-reduced-motion: no-preference`에서만 돌리고, 그 밖에는 opacity cross-fade로 바꾼다. Tailwind는 `motion-safe:`, Motion은 `<MotionConfig reducedMotion="user">`를 쓴다[](source:rm)[](source:an-rm) | 요소를 즉시 없애지 않는다. `MotionConfig`는 blur를 끄지 않으므로 `filter`를 쓰는 recipe는 `useReducedMotion()`으로 가른다 |
| 진입 stagger | 제목, 설명, action처럼 의미 덩어리로 나눠 차례로 들인다[](source:stagger)[](source:ee-enter) | 일상 상호작용에는 stagger를 쓰지 않는다 |
| `display: none`에서 진입 | `@starting-style`과 `transition-behavior: allow-discrete`를 쓴다. 열린 상태의 duration이 진입에, 닫힌 상태의 duration이 퇴장에 적용된다[](source:ee-start) | `overlay`는 Chromium 전용이다. 지원하지 않는 브라우저는 즉시 보이고 숨는다 |
| 퇴장 | 모션이 정보를 더하지 않으면 요소를 즉시 지운다[](source:exit) | 컨테이너 높이만큼 전부 움직이지 않는다. 도착지가 뜻을 가질 때(drawer 닫기, 카드가 목록으로 돌아가기)만 완전히 밀어낸다[](source:ee-full) |
| 첫 렌더 | 상태 swap을 감싼 `AnimatePresence`에 `initial={false}`를 둔다[](source:initial) | 의도한 진입(stagger hero) 둘레에는 두지 않는다. 진입이 통째로 사라지므로 전체 새로고침으로 먼저 확인한다[](source:an-skip) |
| 아이콘 교체 | 드문 상태 변화(play와 pause, copy와 copied)만 cross-fade한다. `package.json`에서 `motion`이면 `"motion/react"`, `framer-motion`이면 `"framer-motion"`을 import한다. 둘 다 있으면 주변 컴포넌트의 import를 따른다[](source:icon)[](source:it-lib) | `bounce`는 항상 `0`이다 {bad:금지}. tab 아이콘 교체와 hover로 드러나는 row action은 애니메이션하지 않는다. 아이콘 전환만을 위해 dependency를 추가하지 않는다[](source:it-which) |
| theme 전환 | 모든 transition을 끄고, style을 강제로 flush하고, 다음 frame 뒤에 되돌린다. recipe는 `requestAnimationFrame`을 두 번 중첩한다. OS 변경뿐 아니라 앱 안 토글도 같은 순서로 하며, `next-themes`는 `disableTransitionOnChange`를 제공한다[](source:theme)[](source:an-theme) | 끄지 않으면 모든 색 transition이 한꺼번에 일어나 화면이 번진다 |

| 성능·환경 | 하는 것 | 하지 않는 것 |
| --- | --- | --- |
| transition 범위 | 바뀌는 속성을 이름으로 적는다. 예: `transition-property: scale, opacity`[](source:only) | `all`. 의도하지 않은 색까지 움직이고, `width`·`padding`이면 frame마다 layout을 다시 돌린다. Tailwind의 bare `transition`은 `all`이 아니라 정해진 목록이지만 대개 필요한 것보다 넓다[](source:pf-all) |
| Tailwind 유틸리티 | Tailwind 4의 `transition-transform`은 `transform, translate, scale, rotate`를 덮고, Tailwind 3은 `transform`만 덮는다. 섞으면 `transition-[scale,opacity,filter]`처럼 쓴다[](source:pf-tw) | - |
| `will-change` | 첫 frame stutter를 본 뒤에만 쓴다. 움직이는 속성 이름(`scale`에는 `scale`)을 적고 transform 계열, `opacity`, `filter`로 제한한다[](source:willch)[](source:pf-wc) | `all`, 미리 붙이기, 움직이지 않는 요소. transform 계열이나 `filter`에 걸면 그 요소가 `position: fixed` 자손의 containing block이 되고 stacking context도 생긴다 |
| hover | hover 전용 스타일은 `@media (hover: hover)` 안에 둔다. 자체 pressed 상태가 있으면 `-webkit-tap-highlight-color: transparent`를 쓴다[](source:hover) | touch에서 `:hover`가 탭 뒤에도 남아 선택된 것처럼 보이게 두지 않는다. Tailwind 4의 `hover:`는 이미 그 query 아래로 컴파일되고 Tailwind 3은 아니다 |
| overlay 스크롤 | 스크롤되는 dialog, drawer, menu, side panel에 `overscroll-behavior: contain`을 둔다[](source:overscroll) | 끝을 넘긴 스크롤이 뒤 페이지를 움직이게 두지 않는다 |

## 리뷰는 어떻게 하고 어떻게 끝나나 {#review}

브라우저가 없으면 에이전트는 컴포넌트가 정의한 모든 상태(hover, pressed, selected, loading, empty)를 코드에서 읽고 duration과 easing을 확인한다. 브라우저가 있으면 상태마다 걸어 보고, 브라우저의 Animations panel에서 모션을 `10%` 속도로 다시 재생한다. 하지 못한 확인은 `Not verified`로 보고한다.[](source:verify)

@facts
| `HIGH` | 상호작용을 깬다. 예: 되돌릴 수 없는 keyframe 토글, touch에서 달라붙는 hover. `better-interface`의 escalation trigger 둘이 여기 해당하고 보이는 즉시 `HIGH`다. `prefers-reduced-motion`을 무시하는 모션과 모션만으로 전한 상태 변경이다[](source:sev) |
| `MEDIUM` | 표면, 아이콘, 모션의 눈에 보이는 불일치다[](source:sev) |
| `LOW` | 고립된 다듬기다[](source:sev) |

지적은 어긴 원칙별로 묶고, 심각도 순으로 놓고, 원인 하나에 한 행으로 쓰며 그 원인이 나타나는 위치를 모두 적는다. 열은 `Severity`, `Location`, `Before`, `After`, `Why`이고, `Location`은 `path/to/file:line`, `Why`는 원칙과 사용자 영향이다.[](source:format)

`HIGH`가 하나라도 남으면 `Block`, 아니면 `Approve`로 끝낸다. 나머지 지적은 표에 할 일로 남는다. 검사하지 않은 범위는 `Approve`하지 않는다. 지적이 없으면 "No actionable UI-polish findings"라고 쓰고 검증 결과를 보고한다.[](source:format)

판정: 이 스킬 단독 리뷰에서 `Block`은 상호작용을 깨는 문제나 escalation trigger가 있을 때뿐이다. 값만 틀린 `MEDIUM`·`LOW` 지적만 남은 diff는 `Approve`로 끝난다.[](source:sev)[](source:format)

끝내기 전에 코드에서 아래 15개를 찾는다.[](source:detect)

| 찾을 것 | 고치는 것 |
| --- | --- |
| padding이 있는 부모와 자식에 같은 `rounded-*`나 `border-radius`가 있다 | 바깥 radius에 padding을 더한다 |
| 옆에 `border` 없이 `box-shadow: 0 0 0 1px` ring만 있다 | `border: 1px solid transparent`를 둔다 |
| `img`에 `outline-slate-*`, `outline-zinc-*`나 hex outline 색이 있다 | `outline-black/10`과 `dark:outline-white/10`을 쓴다 |
| `transition-all`이나 `transition: all`이 있다 | 바뀌는 속성을 이름으로 적는다 |
| `:hover`, `.open` 같은 토글 class에 `animation:`을 걸었다 | 같은 속성의 transition으로 바꾼다 |
| `active:scale-95`, `scale-90`, `0.96`보다 작은 `whileTap`이 있다 | `0.96`으로 바꾼다 |
| `:disabled` 제외 없이 `:active`에 scale을 건다 | `enabled:active:`나 `:not(:disabled):active`를 쓴다 |
| `bounce:`가 `0`이 아니다 | `bounce: 0`으로 바꾼다 |
| base rule의 `opacity: 0`을 `animation`만 드러낸다 | 숨김 상태를 `from` keyframe에 두고 `animation-fill-mode: both`를 쓴다 |
| `translate`, `scale`, `filter`, `motion.*` 애니메이션에 `prefers-reduced-motion`, `motion-safe:`, `MotionConfig` guard가 없다 | guard를 걸고 reduced motion에서는 opacity cross-fade를 쓴다 |
| color transition과 theme 토글이 있는데 `disableTransitionOnChange`나 override가 없다 | theme 전환 suppression recipe를 쓴다 |
| `will-change: all`이나, 애니메이션하지 않는 요소의 `will-change`가 있다 | 움직이는 속성 이름을 적거나 지운다 |
| 아이콘 SVG 안에 `fill="#..."`나 `stroke="#..."`가 있다 | `currentColor`로 바꾼다 |
| `@media (hover: hover)` 밖에 plain CSS `:hover`나 Tailwind 3 `hover:`가 있다 | query로 감싼다 |
| dialog, drawer, menu에 `overflow: auto`나 `overflow-y-auto`만 있고 `overscroll-behavior`가 없다 | `overscroll-behavior: contain`을 둔다 |

## 흐름 속 위치 {#position}

@workflow id=ui-position title="better-ui 앞뒤"
| u-ir | interface-review | backend |
| u-bi | better-interface | backend |
| u-prev | 앞선 도메인 5개 | backend |
| u-ui | better-ui | backend |
| u-out | 통합 보고서 | external |
| u-bi > u-prev | 내부 위임 |
| u-prev > u-ui | 6번째 | emphasis |
| u-ui > u-out | 도메인 증거 |
| u-ir > u-ui | 이미지 추가 | dashed |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `better-interface`(앞) | 리뷰할 화면·흐름·저장소 범위 | 도메인 리뷰 증거 | 의무형 내부 위임이다. 여섯 도메인 중 6번째이고, 기초 실패가 장식에 가려지지 않게 이 순서로 한다. `better-interface`는 이 스킬에서 원칙, references, 검증만 가져가고 심각도와 형식은 자기 것으로 바꾼다. 이 스킬을 쓸 수 없으면 그 도메인을 `Not reviewed`로 표시하고 기억으로 규칙을 만들지 않는다[](source:bi-order) | r65 |
| `better-interface`의 escalation trigger | - | - | 참고. 13개 중 모션 둘이 이 스킬 몫이고 `HIGH`다[](source:bi-trig)[](source:sev) | r100 |
| `interface-review`(앞) | - | - | 참고. 컴포넌트에 추가된 이미지는 이 스킬과 `better-accessibility`의 변경이다(outline과 `alt`). 바이트가 아니라 참조하는 코드를 리뷰한다[](source:ir-exc) | r74 |
| `better-typography`, `better-accessibility`, `better-layout`, `better-colors` | - | - | 참고. 위 "몫" 표와 같은 경계 구분이고 호출하라는 지시는 아니다[](source:owners) | r75~r78 |
| 위 네 스킬 쪽 문장 | - | - | 참고. `better-accessibility`는 애니메이션 recipe·hover 스타일·스크롤 격리를, `better-colors`는 표면·shadow·아이콘 색을, `better-layout`은 radius·shadow·애니메이션을, `better-typography`는 밑줄 외 애니메이션 모션을 이 스킬 몫으로 적는다[](source:ac-own)[](source:co-own)[](source:la-own)[](source:ty-own) | r83, r85, r87, r95 |
| `break`(묶음 밖) | - | - | 참고. 순수하게 시각적인 상태 다듬기에서 생긴 깨짐은 이 스킬 어휘로 이름 붙인다. 호출 지시는 아니다[](source:br-sc) | r120 |
| `build-design`(묶음 밖) | - | 충돌 보고 | 참고. 디자인이 표면·아이콘·모션 규칙을 깨면 디자인대로 만들고 충돌을 소유자와 함께 보고한다(의무형). 이 스킬을 실행한다는 말은 없다[](source:bd-own) | r140 |
| `emil-design-eng`(묶음 밖) | - | - | 같은 계열(추론). 둘 다 UI 다듬기와 모션을 수치 원칙으로 다루고, 서로 이름으로 부르지 않는다[](source:fm)[](source:em-desc) | r151 |
| `emilkowalski/review-animations`(묶음 밖) | - | - | 원장에 없는 수치 차이다. 그 스킬은 눌림을 `scale(0.97)`(범위 0.95~0.98)·`160ms`로, stagger를 `30–80ms`로 적는다. 이 스킬은 `0.96`·`150ms`와 `100ms`이고 `0.96` 미만은 지적이다. 판정: 두 스킬을 함께 쓰면 같은 코드에 서로 다른 지적이 나올 수 있다[](source:em-press)[](source:em-stag)[](source:press)[](source:stagger) | - |

그림은 묶음 안의 r65와 r74만 그렸다. 나머지는 참고나 역할 구분, 같은 계열이라 표에만 남겼다. 전체 흐름은 `design/_group-interface-audit/interface-audit.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 8개, 합계 32,213B다. `SKILL.md` 11,122B, `animations.md` 4,923B, `icons.md` 3,963B, `enter-exit.md` 3,596B, `surfaces.md` 3,584B, `icon-transitions.md` 2,647B, `performance.md` 2,265B, `agents/openai.yaml` 113B를 모두 읽었다. 구조·표본만 본 파일은 0개다.
- 제외한 파일: 없음. 번역본과 바이너리 파일은 이 폴더에 없다.
- 관계 확인용으로 다른 스킬의 해당 줄만 읽었다. `better-interface` 42~57줄·77~91줄·113~115줄, `interface-review/scope-resolution.md` 68줄, `better-accessibility`·`better-colors`·`better-layout` 각 12줄, `better-typography` 89줄, `break/scenarios.md` 72줄, `build-design` 12줄, `emil-design-eng` 3줄, `review-animations/STANDARDS.md` 59줄과 149~151줄이다.
- 원문 대조 범위(`SKILL.md`): frontmatter와 호출 제한 필드 0개, 규칙 절 20개(정확한 값 절부터 아이콘 색까지), 검사 표 15행, 심각도 3단계, 검증 규칙, 보고 형식, `Block`·`Approve` 조건을 모두 대조했다. recipe 파일 6개의 값과 규칙은 `SKILL.md`가 가리키는 절마다 대조했다.
- 관계 행 대조: r65, r74, r75~r78, r83, r85, r87, r95, r100, r120, r140, r151 모두 14행을 원문과 다시 대조했고 원장과 같다. 사람 승인 지점과 종료 조건은 원문에 `Block`·`Approve` 외에 없다.
- 분석 중 바뀐 파일: 없음. `design/` 아래는 commit `0465878` 그대로다.
- 사람 검토: 미실시.

@callout level=open-question title="확인하지 못한 것"
- 이 스킬만 부를 때 에이전트가 파일을 고치는지 보고만 하는지는 `원문에 명시 없음`이다. `better-interface`를 거치면 기본이 읽기 전용이다.[](source:bi-ro)
- recipe 파일의 shadow 알파, `150ms`·`200ms`·`300ms` 같은 값이 의무인지 예시인지 원문이 구분하지 않는다.
- padding `24px` 기준의 근거는 원문에 없다.
- 이 스킬을 실제로 돌려 보지 않았다. 에이전트가 표와 `Block`·`Approve` 형식을 지키는지는 확인하지 않았다.
