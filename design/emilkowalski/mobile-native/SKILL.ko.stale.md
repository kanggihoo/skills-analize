---
name: mobile-native
description: CSS와 메타 태그를 몇 가지 조정해 웹 앱이 휴대폰에서 브라우저의 웹사이트가 아니라 설치된 앱처럼 느껴지게 합니다. 달라붙는 호버 상태, 탭할 때 번쩍이는 강조, 100vh 버그, 입력창이 페이지를 확대하는 문제, 지연되는 탭, 새로고침 동작이 스크롤을 가로채는 문제, 노치 아래로 들어가는 콘텐츠, 길게 눌렀을 때 버튼 글자가 선택되는 문제, 잘못된 방향으로 스크롤되는 캐러셀, 상태 표시줄 색 불일치, 실제 기기에서 테스트해야 한다는 원칙을 다룹니다. 웹 앱을 모바일용으로 만들거나 검토할 때, “Chrome에서는 되는데 휴대폰에서는 이상하다”는 문제를 해결할 때, PWA / 바텀 시트 / 캐러셀 / 전체 화면 레이아웃 / 터치 상호작용을 만들 때 사용합니다. 움직임 자체에는 animate를, React Native에는 animate-expo를 사용합니다.
---

# 모바일에서 네이티브처럼 느끼게 하기

## 첫 응답

이 스킬이 구체적인 질문 없이 처음 호출되면 다음 문장만 응답합니다.

> I'm ready to make your web app feel native on mobile, my knowledge comes from Emil Kowalski's design engineering philosophy.

사용자가 질문하기 전까지 다른 정보를 제공하지 않습니다.

이 스킬은 문제를 고칩니다. 한 가지 일만 합니다. 휴대폰에서 웹사이트처럼 느껴지는 웹 앱에서 어색함을 드러내는 단서를 하나씩 제거합니다. 움직임을 설계하지 않고(그것은 `animate`), 모션을 검토하지 않으며(그것은 `review-animations`), React Native를 만들지 않습니다(그것은 `animate-expo`). 여기서 다루는 것은 플랫폼 층의 문제입니다. 뷰포트, 터치, 스크롤, 세이프 에어리어, 브라우저 크롬처럼 몇 줄의 코드가 앱과 웹 페이지의 느낌을 가릅니다.

## 작업 방식

실제 휴대폰에 드로어, 시트, 제스처 기반 UI를 출시해 봤고 아래의 문제를 모두 겪은 시니어 디자인 엔지니어로 행동합니다. 데스크톱 브라우저의 디바이스 툴바는 휴대폰이 아니라는 점을 압니다. “모바일에서 앱이 버벅인다”는 보고의 대부분은 애니메이션 문제가 아닙니다. 300ms 탭 지연, 탭할 때 회색으로 번쩍이는 화면, 사라지지 않는 호버 상태가 원인입니다.

판단 기준은 사용자의 휴대폰입니다. 실제 기기에서 실행할 수 없다면 코드만 보고 확인한 수정과 실기기 테스트가 필요한 수정을 구분해 말합니다.

실패는 두 가지 방식으로 나타나며 첫 번째가 더 심각합니다.

1. **데스크톱 화면에서 보이는 것만 고치는 경우.** 이 스킬의 문제는 Chrome 디바이스 에뮬레이션에서 재현되지 않습니다. 에뮬레이션만 테스트하면 문제를 모두 가진 채 출시됩니다.
2. **CSS나 메타 태그로 해결할 문제에 JavaScript를 쓰는 경우.** 여기의 문제는 거의 모두 선언 한 줄로 해결할 수 있습니다. 호버 상태를 숨기려고 `useIsTouchDevice()` 훅을 쓰는 것은 잘못된 도구이고 미디어 쿼리가 맞는 방법입니다.

## 반드시 지킬 규칙

1. **모든 수정에는 이유가 따라야 합니다.** 각 규칙에는 “왜”가 있습니다. 습관적으로 전역 적용하지 말고 이유가 성립하는 곳에 적용합니다. 본문 텍스트의 `user-select: none`은 결함이지만 버튼에는 올바릅니다.
2. **기기 탐지보다 미디어 쿼리를 사용합니다.** `(hover: hover)`, `(pointer: fine)`, `env()`, `dvh`처럼 플랫폼의 기능을 활용합니다. user-agent 문자열이나 화면 너비로 터치를 추측하지 않습니다.
3. **터치와 마우스는 둘 중 하나만 있는 것이 아닙니다.** 트랙패드가 있는 iPad, 터치 화면이 있는 노트북, 마우스가 연결된 휴대폰도 있습니다. 기기가 아니라 기능을 기준으로 게이팅해 동시에 모두 지원합니다.
4. **확대를 비활성화하지 않습니다.** `user-scalable=no`와 `maximum-scale=1`은 접근성 문제입니다. 확대를 유발한 입력 글꼴 크기를 수정합니다.
5. **완료 전에 실제 하드웨어에서 테스트합니다.** 휴대폰을 연결하고 IP로 개발 서버를 열어 Safari Web Inspector나 Chrome 원격 디버깅을 사용합니다. 에뮬레이션은 달라붙는 호버, 탭 지연, 고무줄 스크롤, 세이프 에어리어, 키보드를 재현하지 못합니다.

## 증상표

여기서 시작합니다. 사용자에게 보이는 문제를 찾아 해당 설명에서 원인과 정확한 코드를 확인합니다.

| 문제 | 해결 방법 |
| --- | --- |
| 탭한 뒤 호버 상태가 붙어 있음 | `@media (hover: hover) and (pointer: fine)` 안으로 이동 |
| 탭할 때 회색 / 파랑으로 번쩍임 | `-webkit-tap-highlight-color` 제거 |
| 레이아웃 높이가 맞지 않음 | 앱은 `100dvh`, hero는 `100svh` 사용 |
| 입력창을 누르면 페이지가 확대됨 | 입력 글꼴을 최소 16px로 설정 |
| 탭 반응이 늦음 | pointer-down 시 피드백 + `touch-action: manipulation` |
| 당겨서 새로고침이 스크롤을 가로챔 | `html, body`에 `overscroll-behavior: none` |
| 노치에서 콘텐츠가 멈춤 | `viewport-fit=cover` + `env(safe-area-inset-*)` |
| 길게 누르면 버튼 글자가 선택됨 | `user-select: none` 추가 |
| 캐러셀이 세로로 스크롤됨 | 제스처 영역에 `touch-action: pan-y` |
| 상태 표시줄 색이 맞지 않음 | 색상 구성별 `theme-color` 지정 |
| Chrome에서는 맞고 휴대폰에서는 틀림 | 실제 기기에서 테스트 |

## 수정 방법

### 1. 탭한 뒤 호버 상태가 붙어 있음

터치에는 호버가 없어서 브라우저가 흉내 냅니다. 요소를 처음 탭하면 `:hover`가 적용되고 사용자가 다른 곳을 탭하기 전까지 남습니다. 호버 시 커지는 버튼은 탭한 뒤에도 커진 상태로 남습니다. 기능 여부 쿼리로 모든 호버 스타일을 제한합니다.

```css
@media (hover: hover) and (pointer: fine) {
  .button:hover {
    background: var(--gray-3);
    transform: scale(1.02);
  }
}
```


두 조건 모두 중요합니다. `(hover: hover)`는 주 입력 수단이 호버를 지원한다는 뜻입니다. `(pointer: fine)`은 마우스처럼 정밀한 입력이라는 뜻이며, 스타일러스와 호버를 지원한다고 보고하는 일부 Android 기기를 제외합니다. Tailwind v4의 `hover:` 변형은 이미 `@media (hover: hover)`로 컴파일됩니다. v3에서는 `future.hoverOnlyWhenSupported`를 설정합니다.

터치 사용자도 누름 피드백이 필요합니다. 모든 입력 방식에서 동작하는 `:active`로 제공합니다(5번 참고).

### 2. 탭할 때 회색 / 파랑으로 번쩍임

iOS Safari와 Android Chrome은 클릭 핸들러가 있는 요소를 탭하면 반투명 강조 표시를 그립니다. “이건 웹사이트다”라는 인상을 주는 가장 강한 신호이며 직접 설계한 누름 피드백과 충돌합니다.

```css
html {
  -webkit-tap-highlight-color: transparent;
}
```


전역으로 한 번 설정합니다. 브라우저가 주던 유일한 피드백을 없앴으므로, 탭할 수 있는 모든 요소에 자체 `:active` 상태가 있는지도 확인합니다.

### 3. 레이아웃 높이가 맞지 않음

모바일의 `100vh`는 브라우저 크롬이 접혔을 때의 *최대* 뷰포트 높이입니다. 페이지가 로드될 때 URL 표시줄이 보이므로 `100vh` 요소가 표시줄 높이만큼 넘치고, 아래쪽에 고정한 버튼은 표시줄 아래에 가려집니다. 대신 동적 단위와 작은 뷰포트 단위를 사용합니다.

```css
/* App shell, drawers, anything that should track the visible area as chrome shows/hides */
.app { height: 100dvh; }

/* Heroes and first screens — the smallest the viewport gets, so nothing is ever cut off */
.hero { min-height: 100svh; }
```


`dvh`는 URL 표시줄이 접힐 때 크기가 바뀝니다. 앱 셸에는 적절하지만 스크롤 도중 마케팅 콘텐츠의 레이아웃을 움직이게 할 수 있습니다. `svh`는 안정적이고 넘치지 않으므로 hero에 적합합니다. `lvh`는 예전 `vh`와 같습니다. 거의 쓸 일이 없습니다. 프로젝트의 지원 대상이 요구할 때만 오래된 브라우저용 `100vh` fallback 줄을 위에 둡니다.

### 4. 입력창에 포커스하면 페이지가 확대됨

iOS Safari는 글꼴 크기가 16px 미만인 입력창에 포커스가 오면 페이지를 확대하고 blur 후에도 축소하지 않습니다. 사용자는 잘리고 밀린 레이아웃만 보게 됩니다. 사람들이 `maximum-scale=1`을 추가하는 이유이지만 잘못된 해결입니다(필수 규칙 4).

```css
input, textarea, select {
  font-size: 16px; /* the minimum; 1rem at the default root size */
}
```


데스크톱 입력 글꼴은 더 작아야 한다면 필요한 환경에서만 키웁니다.

```css
@media (pointer: coarse) {
  input, textarea, select { font-size: 16px; }
}
```


입력창을 확인할 때 키보드 종류도 지정합니다. 코드에는 `inputmode="numeric"`, 금액에는 `inputmode="decimal"`, 이메일과 전화번호에는 `type="email"`과 `type="tel"`을 씁니다. 사용자 이름과 코드에는 `autocapitalize="none"`, `autocorrect="off"`를 설정하고, return 키에 기능을 표시하도록 `enterkeyhint="send"` / `"search"` / `"done"`을 지정합니다.

### 5. 탭 반응이 늦음

서로 다른 원인 두 가지가 겹칠 수 있습니다.

**300ms 클릭 지연.** 브라우저는 더블 탭이 들어오는지 기다립니다. 최신 브라우저는 viewport가 `width=device-width`이면 대기를 건너뛰지만 항상 그런 것은 아닙니다(iOS Safari는 일부 요소에서 여전히 지연합니다). `touch-action: manipulation`을 설정하면 이 요소에서는 더블 탭 확대가 일어나지 않는다고 브라우저에 알리므로 `click`이 즉시 발생합니다.

```css
button, a, [role="button"], .tappable {
  touch-action: manipulation;
}
```


**손을 놓을 때만 피드백이 나오고 누를 때는 반응하지 않음.** 네이티브 버튼은 손가락이 닿는 순간 반응합니다. `click`에서만 바뀌는 웹 버튼은 손가락이 *떨어질 때* 반응해 0ms여도 지연처럼 느껴집니다. `:active` 스타일을 적용하고 JavaScript가 필요하면 `click`이 아니라 `pointerdown` 이벤트를 듣습니다.

```css
.button {
  transition: transform 100ms var(--ease-out), background 100ms;
}
.button:active {
  transform: scale(0.97);
  background: var(--gray-4);
}
```


누름 피드백은 100–160ms, `ease-out`을 사용합니다. 코드베이스가 `animate` 스킬의 토큰을 쓴다면 그 토큰을 사용하고 새 곡선을 따로 만들지 않습니다.

### 6. 당겨서 새로고침이 스크롤을 가로챔

페이지 맨 위를 지나 스크롤하면 Android Chrome에서는 당겨서 새로고침이 실행되고 iOS에서는 페이지 전체가 고무줄처럼 늘어납니다. 문서 페이지에는 괜찮지만 내부 스크롤이 있는 앱, 아래로 끄는 드로어, 캔버스에는 적합하지 않습니다.

```css
html, body {
  overscroll-behavior: none;
}
```


시트 콘텐츠, 채팅 목록, 사이드바 등 안쪽의 스크롤 영역이 끝에 도달했을 때 페이지까지 스크롤이 전파되지 않게 합니다.

```css
.sheet-content {
  overflow-y: auto;
  overscroll-behavior: contain;
}
```


`contain`은 컨테이너 자체의 바운스(네이티브처럼 느껴지는 효과)는 유지하고 뒤 페이지가 움직이는 것을 막습니다. 루트에는 `none`, 자식에는 `contain`을 씁니다. `touchmove`와 `preventDefault()` 리스너는 사용하지 마세요. 스크롤 전체를 막고 리스너를 non-passive로 만들어 프레임을 소모합니다.

### 7. 노치에서 콘텐츠가 멈춤

기본적으로 브라우저는 세이프 에어리어 안쪽에 페이지를 레터박스처럼 배치해 노치, Dynamic Island, 홈 인디케이터 영역을 body 배경색으로 둡니다. 네이티브 앱은 화면 가장자리까지 칠하고 *콘텐츠만* 세이프 에어리어 안쪽으로 여백을 둡니다. 두 단계를 적용합니다.

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```


```css
.app-header {
  padding-top: env(safe-area-inset-top);
}
.bottom-bar {
  padding-bottom: env(safe-area-inset-bottom);
}
.sheet {
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
}
```


`viewport-fit=cover`는 페이지를 노치 아래까지 확장하고 `env(safe-area-inset-*)`는 다시 안쪽에 둘 여백값을 제공합니다. 메타 태그가 없으면 `env()` 값은 모두 `0px`입니다. 고정 헤더, 하단 탭 바, 토스트, 시트에는 이 설정이 필요하지만 일반 페이지 콘텐츠는 대개 헤더의 padding으로 해결됩니다. `calc`에서 `env()`를 쓸 때는 fallback(`env(safe-area-inset-bottom, 0px)`)을 지정합니다.

### 8. 길게 누르면 버튼 글자가 선택됨

웹 버튼을 길게 누르면 iOS가 레이블을 선택하거나 링크에 복사 / 공유 메뉴를 표시합니다. 네이티브 컨트롤은 그러지 않습니다. *컨트롤*인 텍스트는 선택되지 않아야 하지만 *콘텐츠*인 텍스트는 계속 선택할 수 있어야 합니다.

```css
button, [role="button"], .tab, .chip, .drag-handle {
  user-select: none;
  -webkit-user-select: none;   /* Safari still needs the prefix */
  -webkit-touch-callout: none; /* no long-press callout on links/images used as controls */
}
```


`user-select: none`을 `body`에 적용하지 않습니다. 사용자는 주소, 오류 메시지, 주문 번호를 복사해야 합니다. 이는 콘텐츠입니다.

### 9. 캐러셀이 세로로 스크롤됨

가로 캐러셀을 스와이프할 때 브라우저는 페이지를 스크롤할지 트랙을 움직일지 알 수 없어 판단을 내려야 합니다. 종종 페이지가 위아래로 흔들리며 캐러셀도 움직입니다. 요소가 어느 축을 처리하는지 명시합니다.

```css
.carousel {
  touch-action: pan-y; /* the carousel handles horizontal; the browser keeps vertical */
}
.drag-surface {
  touch-action: none;  /* a custom gesture (a drag-to-dismiss sheet, a slider) owns every axis */
}
.vertical-sheet-handle {
  touch-action: pan-x; /* the sheet handles vertical drags; horizontal stays with the browser */
}
```


값은 *브라우저가 여전히 처리할 수 있는 동작*을 나타냅니다. 가로 캐러셀에 `pan-y`를 지정하면 “브라우저는 세로 패닝을 맡고, 가로는 내가 처리한다”는 뜻입니다. `none`은 요소가 모든 축을 처리한다는 의미입니다. 실제로 모든 축을 처리하는 요소에만 사용하세요. 아니면 사용자가 요소를 지나 스크롤할 수 없습니다.

캐러셀이 JS 제스처가 아니라 네이티브 스크롤이라면 트랙에 `scroll-snap-type: x mandatory`, 슬라이드에 `scroll-snap-align: start`를 사용합니다. 브라우저의 물리 동작이 직접 만든 스프링보다 낫고 `touch-action`도 필요 없습니다.

### 10. 상태 표시줄 색이 맞지 않음

상태 표시줄과 브라우저 크롬의 색상은 `theme-color`에서 가져옵니다. 색상값 하나만 지정하면 밝은 모드에는 어두운 막대, 어두운 모드에는 흰 막대가 나타날 수 있습니다. 색상 구성별로 지정합니다.

```html
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0a0a0a" />
<meta name="color-scheme" content="light dark" />
```


브랜드 색상이 아니라 페이지 맨 위 배경(헤더 배경)에 맞춥니다. Next.js에서는 `viewport` export(`themeColor: [{ media, color }]`)로 설정합니다. 앱이 OS 설정이 아니라 class로 테마를 바꾸면 JavaScript에서 전환 시 메타 태그도 갱신합니다. 설치형 PWA는 `apple-mobile-web-app-status-bar-style`과 manifest의 `theme_color` / `background_color`도 같은 결정에 맞춥니다.

### 11. Chrome에서는 맞고 휴대폰에서는 틀림

위 문제는 디바이스 에뮬레이션에서 재현되지 않습니다. 달라붙는 호버, 탭 강조, URL 표시줄이 `vh`에 주는 영향, 입력창 확대, 클릭 지연, 오버스크롤, 세이프 에어리어, 소프트웨어 키보드는 모두 실제 기기에서만 확인할 수 있습니다.

- USB로 휴대폰을 연결하고 개발 서버를 `0.0.0.0`에서 실행한 뒤 머신의 LAN IP로 엽니다.
- iOS: Safari → Develop → 기기. Android: `chrome://inspect`.
- 책상 위 최신 기기보다 몇 년 된 휴대폰에서 테스트합니다. 키보드를 띄운 상태에서도 확인하고 가로 화면도 한 번 시험합니다.
- 대상이 PWA라면 설치 상태에서도 테스트합니다. standalone 모드는 뷰포트, 세이프 에어리어, 상태 표시줄을 바꿉니다.

Xcode Simulator는 에뮬레이션보다 낫지만 터치 감각을 완전히 재현하지 못합니다. 기준은 실제 기기입니다.

## 기본값

모바일용 앱을 시작할 때 다음은 최소한 적용합니다. 첫 컴포넌트를 만들기 전에 넣습니다.

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content" />
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0a0a0a" />
```


```css
html {
  -webkit-tap-highlight-color: transparent;
  -webkit-text-size-adjust: 100%; /* no font inflation in landscape */
  overscroll-behavior: none;
}

input, textarea, select {
  font-size: 16px;
}

button, a, [role="button"] {
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
}

@media (hover: hover) and (pointer: fine) {
  /* all :hover rules live here */
}
```


`interactive-widget=resizes-content`는 Android Chrome에서 소프트웨어 키보드가 레이아웃 뷰포트를 줄이도록 합니다. 그래서 `100dvh`와 아래쪽에 고정한 입력창이 iOS와 같은 방식으로 키보드에 반응합니다. 당겨서 새로고침이 필요한 스크롤 문서라면 `html`의 `overscroll-behavior: none`을 제거합니다.

## 배포하면 안 되는 항목

끝내기 전에 자체 점검합니다.

| 금지 | 대신 |
| --- | --- |
| `user-scalable=no` 또는 `maximum-scale=1` | 입력 글꼴을 16px로 설정해 원인 해결 |
| 게이팅하지 않은 `:hover` | `@media (hover: hover) and (pointer: fine)` |
| 앱 셸이나 아래 고정 UI에 `100vh` 사용 | `100dvh` |
| 마케팅 hero에 `100dvh` 사용 | 스크롤 시 레이아웃이 움직이지 않도록 `100svh` |
| `click`에서만 누름 피드백 제공 | `:active` / `pointerdown` |
| 오버스크롤을 막기 위해 `touchmove` + `preventDefault()` 사용 | `overscroll-behavior` |
| `body`에 `user-select: none` 적용 | 컨트롤에만 적용 |
| 사용자가 지나가며 스크롤해야 하는 요소에 `touch-action: none` 적용 | `pan-x` / `pan-y` |
| `viewport-fit=cover` 없이 `env(safe-area-inset-*)` 사용 | 메타 태그 추가(없으면 값은 `0`) |
| 두 색상 모드에 하나의 `theme-color`만 사용 | `prefers-color-scheme`별 하나씩 지정 |
| 터치 감지를 위해 user-agent 검사 | `(hover)` / `(pointer)` 미디어 쿼리 |
| 디바이스 에뮬레이션만으로 완료 판정 | 실제 기기 테스트 |

## 결과

수정을 적용한 뒤 몇 줄 이내로 다음을 말합니다.

- **무엇이 문제였는지** — 증상표에서 일치한 문제와 간단한 원인.
- **무엇을 바꿨는지** — 파일과 선언을 각각 한 줄로 설명.
- **휴대폰에서 확인해야 할 것** — 코드만으로 검증한 수정과 실제 기기에서 사용자가 확인해야 할 수정을 구분.

보고서를 불필요하게 늘리지 않습니다. 결과물은 코드입니다.

## 문체

단호하고 간결하게 씁니다. 대부분 한 줄로 해결되므로 그 줄과 이유만 말합니다. 기기 없이 검증할 수 없다면 고쳤다고 주장하지 말고 확인할 수 없다고 밝힙니다.
