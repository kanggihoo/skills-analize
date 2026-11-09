# mobile-native 스킬은 에이전트를 어떻게 바꾸나 {#mobile-native-skill}

`mobile-native`를 쓰면 에이전트는 휴대폰에서 "브라우저 속 웹사이트"처럼 느껴지는 증상을 표에서 찾아, CSS 한 줄이나 meta 태그로 하나씩 고친다. JavaScript나 기기 판별 코드 대신 media query와 플랫폼 기능을 쓰고, 고친 것마다 이유를 붙인다. 마지막에는 코드로 확인한 것과 실제 폰에서 사용자가 확인해야 할 것을 나눠 짧게 보고한다.[](source:mn-scope)[](source:mn-r1)[](source:mn-out)

- 켜지는 때: 모바일용 웹앱을 만들거나 리뷰할 때, "Chrome에선 되는데 폰에선 이상하다"고 할 때, PWA·bottom sheet·carousel·전체 화면 레이아웃·터치 상호작용을 만들 때다. 호출 제한 필드는 없다.[](source:mn-fm)
- 강제하는 것: 확대(zoom)를 끄지 않는다. user agent로 터치를 추측하지 않는다. 실제 기기에서 확인하기 전에는 다 고쳤다고 하지 않는다.[](source:mn-r2)[](source:mn-r4)[](source:mn-r5)
- 대표 수치: 입력란 글꼴 최소 16px, 눌림 피드백 100~160ms `ease-out`, 앱 셸은 `100dvh`, 첫 화면은 `100svh`다.[](source:mn-f4)[](source:mn-f5press)[](source:mn-f3)
- 쓰면 안 되는 때: 모션 자체를 만들 때(`animate`), 모션을 리뷰할 때(`review-animations`), React Native 앱일 때(`animate-expo`)다.[](source:mn-scope)

@answer scope="design/emilkowalski/mobile-native · 원본 텍스트 1개 16,838B · 커밋 4e3fc89 · 관계 확인용으로 다른 스킬 frontmatter 3개 · 기기 동작은 원문 설명이며 이 분석에서 기기로 확인하지 않음 · 지시상 동작"
@meta locale=ko
@source mn-fm title="design/emilkowalski/mobile-native/SKILL.md · 16838B · 지시 본문과 frontmatter" path=design/emilkowalski/mobile-native/SKILL.md lines=1:4
@source mn-init title="SKILL.md · 첫 응답 규칙" path=design/emilkowalski/mobile-native/SKILL.md lines=8:14
@source mn-scope title="SKILL.md · 하는 일 한 가지와 다른 스킬의 몫" path=design/emilkowalski/mobile-native/SKILL.md lines=16:16
@source mn-posture title="SKILL.md · 실제 폰이 기준이라는 자세" path=design/emilkowalski/mobile-native/SKILL.md lines=18:22
@source mn-fail title="SKILL.md · 두 가지 실패 유형" path=design/emilkowalski/mobile-native/SKILL.md lines=24:27
@source mn-r1 title="SKILL.md · Hard Rule 1 고칠 때마다 이유" path=design/emilkowalski/mobile-native/SKILL.md lines=31:31
@source mn-r2 title="SKILL.md · Hard Rule 2 기기 판별 대신 media query" path=design/emilkowalski/mobile-native/SKILL.md lines=32:32
@source mn-r3 title="SKILL.md · Hard Rule 3 터치와 마우스는 공존" path=design/emilkowalski/mobile-native/SKILL.md lines=33:33
@source mn-r4 title="SKILL.md · Hard Rule 4 확대를 끄지 않는다" path=design/emilkowalski/mobile-native/SKILL.md lines=34:34
@source mn-r5 title="SKILL.md · Hard Rule 5 끝내기 전에 기기 테스트" path=design/emilkowalski/mobile-native/SKILL.md lines=35:35
@source mn-table title="SKILL.md · 증상 표" path=design/emilkowalski/mobile-native/SKILL.md lines=37:53
@source mn-f1 title="SKILL.md · 1 탭 뒤 hover가 남는다" path=design/emilkowalski/mobile-native/SKILL.md lines=57:72
@source mn-f2 title="SKILL.md · 2 탭할 때 회색·파란 번쩍임" path=design/emilkowalski/mobile-native/SKILL.md lines=74:84
@source mn-f3 title="SKILL.md · 3 높이가 틀린다(100vh)" path=design/emilkowalski/mobile-native/SKILL.md lines=86:98
@source mn-f4 title="SKILL.md · 4 입력란에서 화면이 확대된다" path=design/emilkowalski/mobile-native/SKILL.md lines=100:118
@source mn-f5 title="SKILL.md · 5 탭이 느리다(300ms)" path=design/emilkowalski/mobile-native/SKILL.md lines=120:130
@source mn-f5press title="SKILL.md · 5 눌림 피드백" path=design/emilkowalski/mobile-native/SKILL.md lines=132:144
@source mn-f6 title="SKILL.md · 6 pull-to-refresh가 스크롤을 가로챈다" path=design/emilkowalski/mobile-native/SKILL.md lines=146:165
@source mn-f7 title="SKILL.md · 7 notch 아래가 비어 있다" path=design/emilkowalski/mobile-native/SKILL.md lines=167:187
@source mn-f8 title="SKILL.md · 8 길게 누르면 버튼 글자가 선택된다" path=design/emilkowalski/mobile-native/SKILL.md lines=189:201
@source mn-f9 title="SKILL.md · 9 carousel이 세로로 스크롤된다" path=design/emilkowalski/mobile-native/SKILL.md lines=203:221
@source mn-f10 title="SKILL.md · 10 상태 표시줄 색이 안 맞는다" path=design/emilkowalski/mobile-native/SKILL.md lines=223:233
@source mn-f11 title="SKILL.md · 11 Chrome에선 맞고 폰에선 틀리다" path=design/emilkowalski/mobile-native/SKILL.md lines=235:244
@source mn-base title="SKILL.md · 기본 바닥(Baseline)" path=design/emilkowalski/mobile-native/SKILL.md lines=246:278
@source mn-never title="SKILL.md · Never Ship 자체 점검 표" path=design/emilkowalski/mobile-native/SKILL.md lines=280:297
@source mn-out title="SKILL.md · 출력" path=design/emilkowalski/mobile-native/SKILL.md lines=299:307
@source mn-tone title="SKILL.md · 어조" path=design/emilkowalski/mobile-native/SKILL.md lines=309:311
@source an-fm title="design/emilkowalski/animate/SKILL.md · r13 확인용 frontmatter" path=design/emilkowalski/animate/SKILL.md lines=1:4
@source an-tok title="animate/SKILL.md · 토큰을 늘리지 말고 확장하라는 규칙(r13 확인용)" path=design/emilkowalski/animate/SKILL.md lines=33:33
@source ax-fm title="design/emilkowalski/animate-expo/SKILL.md · r14 확인용 frontmatter" path=design/emilkowalski/animate-expo/SKILL.md lines=1:4
@source ra-fm title="design/emilkowalski/review-animations/SKILL.md · r15 확인용 frontmatter" path=design/emilkowalski/review-animations/SKILL.md lines=1:5

## 언제 켜지고, 언제 다른 스킬로 가야 하나 {#trigger}

@code source=mn-fm language=yaml

frontmatter에는 `name`과 `description`만 있다. 호출 제한 필드가 없으므로 모델이 `description`을 보고 켤 수 있다.[](source:mn-fm) 판정: `description`은 판단할 때 참고하는 설명이다. "PWA"나 "carousel"이라는 단어가 있어야만 켜지는 목록은 아니다.

사용자가 구체적인 질문 없이 스킬만 부르면, 에이전트는 정해진 한 문장만 답하고 질문을 기다린다. 그 문장은 "웹앱이 모바일에서 네이티브처럼 느껴지게 하겠다, 지식은 Emil Kowalski의 디자인 엔지니어링 철학에서 왔다"는 내용이다.[](source:mn-init)

이 스킬은 플랫폼 층만 다룬다고 범위를 긋는다. 원문이 드는 층은 viewport, 터치, 스크롤, safe area, 브라우저 chrome(주소창·상태 표시줄 같은 브라우저 틀)이다.[](source:mn-scope) 그 밖의 일은 다른 스킬의 몫이라고 이름을 들어 적는다.

| 하려는 일 | 이 스킬 대신 | 그 스킬의 호출 조건 | rel-id |
| --- | --- | --- | --- |
| 모션을 설계·구현한다 | `animate` {caution:범위 밖} | 호출 제한 필드 없음[](source:an-fm) | r13 |
| 모션을 리뷰한다 | `review-animations` {caution:범위 밖} | `disable-model-invocation: true`. 사용자가 직접 불러야 한다[](source:ra-fm) | r15 |
| React Native 앱을 만든다 | `animate-expo` {caution:범위 밖} | 호출 제한 필드 없음[](source:ax-fm) | r14 |

r13에는 토큰 이야기가 하나 더 있다.

- `mobile-native`: 코드베이스가 `animate` 스킬의 토큰을 쓰면 눌림 피드백에 그 토큰을 쓰고, 새 easing 곡선을 만들지 않는다.[](source:mn-f5press)
- `animate`: 기존 `--ease-out`이나 duration 단계가 있으면 그것을 쓴다.[](source:an-tok)

판정: 두 스킬은 코드베이스의 같은 토큰을 읽을 뿐이고, 순서나 호출 관계는 없다.[](source:mn-f5press)[](source:an-tok)

이 스킬은 묶음에 속하지 않는다. 다른 스킬이 `mobile-native`를 부르는 관계도 원장에 없다(`design/relations.md`).

## 어떤 순서로 고치나 {#workflow}

에이전트는 실제 폰에 drawer·sheet·제스처 UI를 배포해 본 시니어 디자인 엔지니어 역할을 맡는다. 원문은 "모바일에서 버벅인다"는 보고의 대부분이 애니메이션 문제가 아니라고 본다. 300ms 탭 지연, 탭할 때의 회색 번쩍임, 떨어지지 않는 hover 상태가 원인이라는 것이다.[](source:mn-posture)

원문은 피해야 할 실패를 두 가지로 나누고, 첫 번째가 더 나쁘다고 한다.[](source:mn-fail)

- 데스크톱이 보여 주는 것만 고치기: 이 스킬의 버그는 Chrome device emulation에서 재현되지 않는다. 거기서만 시험하면 전부 그대로 배포된다.
- CSS나 meta 태그로 될 일에 JavaScript 쓰기: hover를 숨기려고 `useIsTouchDevice()` hook을 만드는 것은 틀린 도구이고, media query가 맞다.

@workflow id=fix-flow title="mobile-native 진행 순서"
| mf-new | 새 모바일 앱인가? | external |
| mf-base | 기본 바닥 적용 | backend |
| mf-match | 증상 표에서 찾기 | backend |
| mf-fix | 해당 절의 수정 적용 | backend |
| mf-check | Never Ship 점검 | backend |
| mf-out | 짧은 보고 | backend |
| mf-phone | 실제 폰 확인 | external |
| mf-new > mf-base | 예 |
| mf-new > mf-match | 아니오 |
| mf-base > mf-match | |
| mf-match > mf-fix | |
| mf-fix > mf-check | |
| mf-check > mf-out | |
| mf-out > mf-phone | 폰 확인 목록 | emphasis |

@steps id=fix-steps
| mf-new | 새 모바일 앱인가? | 모바일용 앱을 새로 시작하면, 첫 컴포넌트보다 먼저 기본 바닥(Baseline)을 넣으라고 한다.[](source:mn-base) | fix-flow | mf-new |
| mf-base | 기본 바닥 적용 | viewport meta에 `width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content`를 넣는다. 색 모드별 `theme-color` 두 줄, `html`의 tap highlight 제거·`-webkit-text-size-adjust: 100%`·`overscroll-behavior: none`, 입력란 16px, 버튼·링크의 `touch-action: manipulation`과 `user-select: none`, hover 규칙을 모을 media query를 둔다. 당겨서 새로고침이 반가운 문서형 앱이면 `html`의 `overscroll-behavior: none`을 뺀다.[](source:mn-base) | fix-flow | mf-base |
| mf-match | 증상 표에서 찾기 | 사용자가 보고 있는 증상을 아래 11행 표에서 찾고, 같은 번호 절에서 이유와 정확한 코드를 읽는다.[](source:mn-table) | fix-flow | mf-match |
| mf-fix | 해당 절의 수정 적용 | 이유가 맞는 곳에만 적용한다. 습관처럼 전역에 넣지 않는다. 원문의 예로, 본문 텍스트의 `user-select: none`은 결함이고 버튼에서는 맞다.[](source:mn-r1) | fix-flow | mf-fix |
| mf-check | Never Ship 점검 | 끝내기 전에 12행 금지 표로 스스로 점검한다.[](source:mn-never) | fix-flow | mf-check |
| mf-out | 짧은 보고 | 수정을 적용한 뒤 몇 줄 안에서 보고한다. 무엇이 잘못됐나(표의 증상과 한 줄 이유), 무엇을 바꿨나(파일과 선언을 한 줄씩), 무엇이 폰을 필요로 하나(코드로 확인한 것과 사용자가 기기에서 확인할 것)다. 보고서로 부풀리지 않고, 코드가 결과물이다.[](source:mn-out) | fix-flow | mf-out |
| mf-phone | 실제 폰 확인 | 폰을 USB로 연결하고 dev server를 `0.0.0.0`에서 띄워 LAN IP로 연다. iOS는 Safari → Develop → 기기, Android는 `chrome://inspect`를 쓴다. 몇 년 된 폰, 키보드를 연 상태, 가로 화면 한 번, 그리고 목표라면 설치된 PWA로 시험한다. Xcode Simulator도 터치 감각은 놓친다.[](source:mn-f11)[](source:mn-r5) | fix-flow | mf-phone |

에이전트가 기기에서 돌려 볼 수 없으면, 어떤 수정은 코드로 확인할 수 있고 어떤 수정은 실제 기기가 필요한지 말해야 한다.[](source:mn-posture) "기기 없이는 확인할 수 없다"가 정직한 답이면 고쳤다고 주장하지 않고 그렇게 말한다.[](source:mn-tone)

## 무엇을 강제하나 {#rules}

| Hard Rule | 에이전트가 하는 일 | 피하는 것 |
| --- | --- | --- |
| 1 고칠 때마다 이유 | 규칙마다 붙은 이유가 해당하는 곳에만 적용한다[](source:mn-r1) | {bad:습관적 전역 적용} |
| 2 media query | `(hover: hover)`, `(pointer: fine)`, `env()`, `dvh`처럼 플랫폼이 알려 주는 능력으로 나눈다[](source:mn-r2) | {bad:user agent·화면 폭으로 터치 추측} |
| 3 터치와 마우스 공존 | trackpad 붙은 iPad, 터치스크린 노트북, 마우스 연결한 폰을 함께 고려하고 기기가 아니라 능력으로 나눈다[](source:mn-r3) | 터치 기기와 마우스 기기를 둘 중 하나로 가름 |
| 4 확대를 끄지 않는다 | 확대의 원인인 입력란 글꼴 크기를 고친다[](source:mn-r4) | {bad:`user-scalable=no`, `maximum-scale=1`} 접근성 실패다 |
| 5 기기에서 확인 | 폰을 연결해 dev server를 IP로 열고 Safari Web Inspector나 Chrome remote debugging을 쓴다. emulation은 sticky hover, 탭 지연, rubber-banding(끝에서 늘어나는 튕김), safe area, 키보드를 재현하지 못한다[](source:mn-r5) | {bad:emulation만 보고 완료} |

아래는 원칙을 적용하기 전과 후를 원문의 증상 11행과 Never Ship 표로 맞춘 것이다. 왼쪽 열이 금지 표의 "Never", 오른쪽 열이 각 절의 수정이다.[](source:mn-table)[](source:mn-never)

| # | 증상 | 적용 전 | 적용 후 | 이유 |
| --- | --- | --- | --- | --- |
| 1 | 탭 뒤 hover가 남는다 | 조건 없는 `:hover` {bad:Never} | `@media (hover: hover) and (pointer: fine)` 안에 넣는다. Tailwind v4의 `hover:`는 이미 이렇게 컴파일되고, v3는 `future.hoverOnlyWhenSupported`를 켠다 | 터치에는 hover가 없어서 브라우저가 첫 탭에 `:hover`를 붙이고 다른 곳을 탭할 때까지 둔다. `(pointer: fine)`은 스타일러스와 hover를 지원한다고 우기는 일부 Android 기기를 걸러 낸다[](source:mn-f1) |
| 2 | 탭할 때 회색·파란 번쩍임 | 브라우저 기본 highlight | `html { -webkit-tap-highlight-color: transparent; }`를 한 번 전역에 두고, 탭할 수 있는 요소마다 `:active`를 준다 | iOS Safari와 Android Chrome이 click handler가 있는 요소에 반투명 막을 칠한다. 가장 큰 "웹사이트 티"다[](source:mn-f2) |
| 3 | 높이가 틀린다 | 앱 셸에 `100vh` {bad:Never} | 앱 셸·drawer는 `100dvh`, 첫 화면은 `min-height: 100svh`. 마케팅 hero에 `100dvh`도 금지다 | 모바일 `100vh`는 주소창이 접힌 가장 큰 높이라서, 처음 열 때 주소창 높이만큼 넘친다. `dvh`는 스크롤 중 layout shift를 낸다. `lvh`는 옛 `vh`라 거의 쓰지 않는다[](source:mn-f3) |
| 4 | 입력란에서 화면이 확대된다 | `maximum-scale=1` {bad:Never} | `input, textarea, select`에 `font-size: 16px`. 데스크톱 글자를 작게 두려면 `@media (pointer: coarse)` 안에서만 키운다 | iOS Safari는 16px 미만 입력란에 focus가 가면 확대하고 blur해도 돌아오지 않는다[](source:mn-f4) |
| 5 | 탭이 느리다 | `click`에서만 피드백 {bad:Never} | 버튼·링크에 `touch-action: manipulation`, 그리고 `:active` 스타일이나 `pointerdown` | 두 원인이 겹친다. 더블탭 확대를 기다리는 300ms click 지연과, 손가락을 뗄 때 반응하는 피드백이다[](source:mn-f5)[](source:mn-f5press) |
| 6 | 당겨서 새로고침이 스크롤을 가로챈다 | `touchmove` + `preventDefault()` {bad:Never} | 루트 `html, body`에 `overscroll-behavior: none`, 안쪽 스크롤 영역에 `contain` | listener 방식은 스크롤을 통째로 막고 passive가 아니게 만들어 프레임을 잃는다. `contain`은 컨테이너 자체의 튕김은 남긴다[](source:mn-f6) |
| 7 | notch 앞에서 내용이 멈춘다 | `viewport-fit=cover` 없이 `env(safe-area-inset-*)` {bad:Never} | viewport meta에 `viewport-fit=cover`를 넣고, 고정 헤더·하단 탭 바·toast·sheet에 `env(safe-area-inset-*)` padding | meta 태그가 없으면 `env()` 값이 모두 `0px`다. `calc` 안에서는 `env(safe-area-inset-bottom, 0px)`처럼 기본값을 준다[](source:mn-f7) |
| 8 | 길게 누르면 버튼 글자가 선택된다 | `body`에 `user-select: none` {bad:Never} | 버튼·탭·chip·drag handle에만 `user-select: none`, `-webkit-user-select: none`, `-webkit-touch-callout: none` | 컨트롤인 글자는 선택되면 안 되고, 주소·오류 메시지·주문 번호 같은 내용은 복사할 수 있어야 한다[](source:mn-f8) |
| 9 | carousel이 세로로 스크롤된다 | 지나가야 할 요소에 `touch-action: none` {bad:Never} | 가로 carousel은 `pan-y`, 모든 축을 직접 다루는 제스처는 `none`, 세로 drag sheet handle은 `pan-x`. 네이티브 스크롤 carousel이면 `scroll-snap-type: x mandatory`와 `scroll-snap-align: start` | 값은 브라우저가 아직 할 수 있는 축을 뜻한다. `none`이면 사용자가 그 요소를 지나 스크롤할 수 없다[](source:mn-f9) |
| 10 | 상태 표시줄 색이 안 맞는다 | 두 색 모드에 `theme-color` 하나 {bad:Never} | `prefers-color-scheme`별 `theme-color` 두 줄과 `color-scheme` meta. 값은 브랜드 색이 아니라 페이지 맨 위 헤더 배경색이다 | Next.js는 `viewport` export의 `themeColor`로 넣는다. class로 테마를 바꾸면 토글할 때 JavaScript로 태그를 바꾼다. 설치형 PWA는 `apple-mobile-web-app-status-bar-style`과 manifest의 `theme_color`·`background_color`도 같은 결정이다[](source:mn-f10) |
| 11 | Chrome에선 맞고 폰에선 틀리다 | emulation만 보고 완료 선언 {bad:Never} | 실제 기기 테스트 | 위 증상은 모두 실제 기기에서만 나는 동작이다[](source:mn-f11) |

Never Ship 표에는 증상 표에 따로 행이 없는 금지가 하나 더 있다. 터치를 알아내려고 user agent를 판별하지 말고 `(hover)`·`(pointer)` media query를 쓰라는 행이다.[](source:mn-never)

## 수치와 값은 어떤 성격인가 {#numbers}

원문의 값은 의무, 권고, 예시가 섞여 있다. 아래는 성격과 적용 조건을 나눠 적은 것이다.

| 값 | 성격 | 적용 조건과 보충 |
| --- | --- | --- |
| 입력란 글꼴 16px | 의무(최소값). 기본 root 크기에서 `1rem`이다 | iOS Safari의 focus 확대를 막는다. 데스크톱만 작게 두려면 `pointer: coarse` 조건으로 키운다[](source:mn-f4) |
| 눌림 피드백 100~160ms, `ease-out` | 권고("Keep") | 코드베이스에 `animate` 토큰이 있으면 그것을 쓴다[](source:mn-f5press) |
| `transition: transform 100ms`, `:active`의 `scale(0.97)` | 예시 코드 값 | 눌림 피드백 예시다[](source:mn-f5press) |
| hover의 `scale(1.02)` | 예시 코드 값 | hover를 media query로 감싸는 예시다[](source:mn-f1) |
| 300ms | 브라우저 동작 설명 | 더블탭 확대를 기다리는 click 지연이다. `width=device-width`면 최신 브라우저는 대개 건너뛰지만 iOS Safari는 일부 요소에서 여전히 지연한다[](source:mn-f5) |
| `100dvh` / `100svh` | 규칙(Never Ship 표에 있음) | 앱 셸·하단 고정 UI는 `100dvh`, 마케팅 hero는 `100svh`. 오래된 브라우저용 `100vh` fallback은 지원 범위가 요구할 때만 둔다[](source:mn-f3)[](source:mn-never) |
| `theme-color` `#ffffff` / `#0a0a0a` | 예시 값 | 실제 값은 페이지 맨 위 색에 맞춘다[](source:mn-f10) |
| `-webkit-text-size-adjust: 100%` | 기본 바닥 값 | 가로 화면의 글꼴 키움을 막는다[](source:mn-base) |
| `calc(1rem + env(safe-area-inset-bottom))` | 예시 코드 값 | sheet 하단 padding 예시다[](source:mn-f7) |
| 테스트 기기 | 권고 | 책상 위 최신 폰 대신 몇 년 된 폰. 키보드를 연 상태와 가로 화면을 한 번씩[](source:mn-f11) |

`interactive-widget=resizes-content`는 Android Chrome에서 소프트웨어 키보드가 layout viewport를 줄이게 해서, `100dvh`와 하단 고정 입력란이 iOS처럼 반응하게 한다.[](source:mn-base) 입력란을 고칠 때는 키보드 종류도 함께 맞춘다. 코드에는 `inputmode="numeric"`, 금액에는 `inputmode="decimal"`, 이메일·전화에는 `type="email"`·`type="tel"`, 사용자 이름과 코드에는 `autocapitalize="none"`·`autocorrect="off"`, return 키에는 `enterkeyhint="send"`·`"search"`·`"done"`을 쓴다.[](source:mn-f4)

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 1개, 16,838B다. `SKILL.md`를 끝까지 읽었다.
- 관계 확인용으로 `animate`, `animate-expo`, `review-animations`의 `SKILL.md` frontmatter와 `animate`의 33줄만 읽었다. 이 세 파일은 위 개수에 넣지 않았다.
- 구조·표본만 확인한 파일: 없음. 바이너리: 없음.
- 제외한 파일: `SKILL.ko.md`(20,578B). 원본을 AI로 번역한 번역본이라 열지 않았다.
- 다른 컬렉션에 이름이 같은 스킬은 없다(`design/relations.md`).
- 원문 대조 범위: 활성화 제한 1개(호출 제한 필드 없음, 첫 응답 규칙), Hard Rule 5개, 증상 표 11행, 수정 절 11개, 기본 바닥, Never Ship 12행, 출력 3항목, 위 수치 10행을 모두 대조했다. 관계 행 r13~r15는 원장과 원문 3줄·16줄·144줄이 같다.
- 분석 중 바뀐 파일: 없음. `design/` 작업 트리는 commit `4e3fc89` 그대로다.

@callout level=open-question title="확인하지 못한 것"
- 원문이 적은 브라우저 동작(300ms 지연, iOS 확대, `100vh` 넘침, `env()`가 `0px`이 되는 조건)은 이 분석에서 실제 기기로 확인하지 않았다. 원문의 설명을 그대로 옮겼다.
- 이 스킬이 실제로 에이전트 동작을 바꾸는지는 실행해 보지 않아 확인하지 않았다. 페이지의 모든 동작은 지시상 동작이다.
- 기본 바닥은 `button, a, [role="button"]` 전체에 `user-select: none`을 건다. 8절은 링크·이미지가 컨트롤일 때만 `-webkit-touch-callout: none`을 쓰라고 하고, 내용 텍스트는 선택할 수 있어야 한다고 한다. 내용 속 일반 링크의 글자 선택을 막아도 되는지 원문은 따로 정리하지 않는다(`원문에 명시 없음`).[](source:mn-base)[](source:mn-f8)
