# mobile-native — 모바일 웹의 CSS·메타태그를 고쳐 네이티브 사용감을 만든다 {#overview}

`mobile-native`는 에이전트가 모바일 브라우저에서 웹사이트 티가 나는 11가지 플랫폼 결함을 찾아, 자바스크립트 우회 대신 짧은 CSS와 메타태그 선언으로 고치게 하는 스킬이다.[](source:s-fm)[](source:s-post)

- 모바일 웹·PWA·하단 시트·캐러셀·전체 화면 레이아웃을 만들거나 "데스크톱에서는 괜찮은데 폰에서 어색하다"는 문제를 점검할 때 켜지며, 질문 없이 처음 부르면 정해진 한 줄만 답하고 대기한다.[](source:s-fm)[](source:s-init)
- 결과로 수정된 CSS·HTML 메타태그와 함께 원인, 변경 내용(파일·선언), 실기기 확인이 필요한 항목을 몇 줄로 정리한 답이 남는다.[](source:s-out)
- 다른 스킬과의 관계: 코드베이스가 `animate` 스킬의 토큰을 쓰면 새 곡선을 만들지 않고 재사용하며(참고), 모션 설계는 `animate`, React Native는 `animate-expo`, 모션 리뷰는 `review-animations`를 대안으로 둔다.
- 확대 자체를 막는 `user-scalable=no`나 `maximum-scale=1`, 본문 전체의 `user-select: none`, `touchmove` `preventDefault()` 가로채기, 그리고 에뮬레이션만 보고 완료라고 선언하는 일을 금지한다.[](source:s-rule)[](source:s-never)

@answer scope="design/emilkowalski/mobile-native · 원본 파일 1개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source s-fm title="frontmatter: name과 description" path=design/emilkowalski/mobile-native/SKILL.md lines=1:4
@source s-init title="질문 없이 첫 호출 시 응답과 플랫폼 계층 역할" path=design/emilkowalski/mobile-native/SKILL.md lines=8:17
@source s-post title="실기기 진실성과 두 가지 실패 유형" path=design/emilkowalski/mobile-native/SKILL.md lines=18:28
@source s-rule title="5가지 절대 규칙" path=design/emilkowalski/mobile-native/SKILL.md lines=29:36
@source s-sym title="11개 증상-해결 매핑 표" path=design/emilkowalski/mobile-native/SKILL.md lines=37:54
@source s-tap title="§1 호버 고착과 §2 탭 플래시 수정" path=design/emilkowalski/mobile-native/SKILL.md lines=57:85
@source s-view title="§3 뷰포트 높이, §4 입력 확대, §5 탭 지연과 animate 토큰" path=design/emilkowalski/mobile-native/SKILL.md lines=86:145
@source s-scroll title="§6 오버스크롤, §7 노치 safe area, §8 선택, §9 캐러셀, §10 상태 바" path=design/emilkowalski/mobile-native/SKILL.md lines=146:234
@source s-hw title="§11 실기기 원격 디버깅 규칙" path=design/emilkowalski/mobile-native/SKILL.md lines=235:245
@source s-base title="Baseline: 모바일 앱 시작 기본값" path=design/emilkowalski/mobile-native/SKILL.md lines=246:282
@source s-never title="Never Ship: 12가지 출시 금지 자가 점검" path=design/emilkowalski/mobile-native/SKILL.md lines=283:301
@source s-out title="출력 3항목과 솔직한 검증 범위 보고" path=design/emilkowalski/mobile-native/SKILL.md lines=302:314

## 어떻게 동작하나 {#flow span=12}

| 적용 상황 | 참조 파일 | 바뀌는 판단 | 출력 사례 |
| --- | --- | --- | --- |
| 질문 없이 첫 호출 | `SKILL.md` 첫 응답 절 | 다른 정보를 미리 내놓지 않고 정해진 한 문장만 답한 뒤 사용자 질문을 기다린다.[](source:s-init) | Emil Kowalski 철학으로 모바일 웹을 네이티브처럼 고칠 준비가 됐다는 한 문장만 출력한다.[](source:s-init) |
| 모바일 웹 앱 신규 시작 | `SKILL.md` `Baseline` 절 | 첫 컴포넌트를 짜기 전에 메타태그와 전역 CSS 하한을 한꺼번에 깔아 둔다.[](source:s-base) | `viewport-fit=cover`, `interactive-widget=resizes-content`, 라이트·다크 `theme-color`, `16px` 입력을 넣는다.[](source:s-base) |
| 호버 고착·탭 플래시·지연 | `SKILL.md` `The Fixes` §1·§2·§5 | 유저 에이전트 분기나 JS 훅 대신 기능 미디어 쿼리로 호버를 가리고, 누르는 순간(`:active`) 피드백을 준다.[](source:s-rule)[](source:s-tap)[](source:s-view) | `@media (hover: hover) and (pointer: fine)` 안에 호버를 두고 `touch-action: manipulation`과 `100ms` `:active`를 둔다.[](source:s-tap)[](source:s-view) |
| 화면 높이·입력 확대·노치 | `SKILL.md` `The Fixes` §3·§4·§7 | `maximum-scale=1`로 확대를 막지 않고 입력 글자 크기를 키워 원인을 고치며, 화면 역할에 따라 `dvh`·`svh`를 나눈다.[](source:s-rule)[](source:s-view) | 앱 셸은 `100dvh`, 히어로는 `100svh`, 입력은 `16px`, 고정 바에는 `env(safe-area-inset-*)` 패딩을 둔다.[](source:s-view)[](source:s-scroll) |
| 스크롤·선택·캐러셀·상태 바 | `SKILL.md` `The Fixes` §6·§8·§9·§10 | `touchmove` `preventDefault`로 스크롤을 막지 않고 선언형 CSS 축·영역 제어와 색 체계별 메타태그를 쓴다.[](source:s-scroll) | 루트는 `overscroll-behavior: none`, 내부 스크롤은 `contain`, 컨트롤에만 `user-select: none`, 캐러셀에 `pan-y`를 쓴다.[](source:s-scroll) |
| 수정 완료와 결과 보고 | `SKILL.md` §11·`Never Ship`·`Output` | `Never Ship` 12가지를 점검한 뒤 코드를 고치고, 코드로 검증된 것과 실기기가 필요한 것을 솔직히 갈라 몇 줄로 보고한다.[](source:s-hw)[](source:s-never)[](source:s-out) | 원인·변경 파일과 선언·실기기 확인 필요 목록 3항목만 짧게 보고하고 USB 원격 디버깅을 안내한다.[](source:s-hw)[](source:s-out) |

이 스킬은 11가지 모바일 결함을 순서 없이 증상표로 찾아 이유와 함께 1~2줄 선언으로 고치는 원칙·처방 모음이다.[](source:s-sym)[](source:s-rule) 데스크톱 에뮬레이션에서는 재현되지 않는 실제 기기 동작이 중심이므로, 코드 수정 뒤에도 실기기 확인 경계를 반드시 구분해 알린다.[](source:s-post)[](source:s-out)

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(`description`). 모바일 웹·PWA·하단 시트·캐러셀·터치 상호작용 구현 및 점검 시 켜진다. 호출 제한 필드는 없다.[](source:s-fm) |
| 성격 | 원칙형(증상-처방 매칭). 모션 자체가 아니라 뷰포트·터치·스크롤·safe area(notch·홈 표시줄을 피한 영역) 같은 플랫폼 계층을 고친다.[](source:s-init)[](source:s-sym) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#rel-r36} | `animate` | 참고 | 코드베이스가 `animate` 스킬의 모션 토큰을 이미 쓰고 있으면 새 커브를 만들지 않고 그 토큰을 재사용한다(사용자 개입 없음).[](source:s-view) |
| **이 스킬** {#rel-r37} | `animate` | 대안 | 역할 경계: 모션 자체를 설계·구현해야 할 때는 사용자가 `animate`를 선택한다.[](source:s-fm)[](source:s-init) |
| **이 스킬** {#rel-r38} | `animate-expo` | 대안 | 역할 경계: 웹 앱이 아니라 React Native·Expo 앱이라면 사용자가 `animate-expo`를 선택한다.[](source:s-fm)[](source:s-init) |
| **이 스킬** {#rel-r39} | `review-animations` | 대안 | 역할 경계: 플랫폼 결함 수정이 아니라 모션 코드 리뷰가 필요하면 사용자가 `review-animations`를 선택한다.[](source:s-init) |

@architecture id=relation-map title="mobile-native와 이어지는 스킬"
| self | mobile-native(이 스킬) | backend |
| anim | animate | backend |
| expo | animate-expo | backend |
| rev | review-animations | backend |
| self > anim | 참고 · 대안 |
| self > expo | 대안 |
| self > rev | 대안 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 5가지 절대 규칙, 11개 증상표와 수정 코드, `Baseline`, 12개 `Never Ship`, 3줄 출력 규칙을 담은 본문 314줄 | 스킬이 켜질 때 읽는다 | 질문 없이 첫 호출, 모바일 웹 앱 신규 시작, 호버 고착·탭 플래시·지연, 화면 높이·입력 확대·노치, 스크롤·선택·캐러셀·상태 바, 수정 완료와 결과 보고 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 질문 없이 처음 호출될 때 | 정해진 한 문장만 답하고 대기한다. | [](source:s-init) |
| 입력창 확대 문제를 고칠 때 | `user-scalable=no`·`maximum-scale=1`은 접근성 위반으로 금지하며, 입력 글자 크기를 최소 `16px`로 맞춰 원인을 고친다. | [](source:s-rule)[](source:s-view) |
| 터치 기기와 마우스 환경을 구분할 때 | 유저 에이전트 스니핑이나 화면 너비 분기 대신 `(hover: hover)`와 `(pointer: fine)`·`(pointer: coarse)` 미디어 쿼리를 쓴다. | [](source:s-rule)[](source:s-tap) |
| `-webkit-tap-highlight-color: transparent`를 적용할 때 | 브라우저 기본 회색·파란색 탭 표시를 없앤 만큼, 모든 누를 수 있는 요소에 자체 `:active` 피드백(100~160ms, `ease-out`)을 반드시 둔다. | [](source:s-tap)[](source:s-view) |
| `100vh` 대신 새 뷰포트 단위를 고를 때 | 앱 셸·하단 고정 UI는 `100dvh`, 마케팅 히어로는 스크롤 중 흔들리지 않는 `100svh`를 쓴다. | [](source:s-view)[](source:s-never) |
| 스크롤 당겨 새로고침이나 겹친 스크롤을 막을 때 | `touchmove` `preventDefault()`는 스크롤을 망가뜨리고 프레임을 깎으므로 금지하고, 루트 `overscroll-behavior: none`·내부 `contain`을 쓴다. | [](source:s-scroll)[](source:s-never) |
| `env(safe-area-inset-*)` 패딩을 쓸 때 | `<meta name="viewport">`에 `viewport-fit=cover`가 없으면 값이 `0px`가 되므로 반드시 함께 둔다. | [](source:s-scroll)[](source:s-never) |
| `user-select: none`을 붙일 때 | 버튼·탭·칩 등 컨트롤에만 두고, 주소나 오류 메시지 복사가 필요한 `body` 전체에는 절대 붙이지 않는다. | [](source:s-rule)[](source:s-scroll) |
| `touch-action: none`을 붙일 때 | 사용자가 그 위를 지나가며 세로 스크롤할 수 있는 요소에는 금지하며, 가로 캐러셀에는 `pan-y`만 둔다. | [](source:s-scroll)[](source:s-never) |
| 상태 바 색상을 맞출 때 | 한 가지 `theme-color`를 쓰지 말고 `prefers-color-scheme` 라이트·다크 별로 각각 선언하며, 브랜드 색이 아닌 헤더 배경색과 맞춘다. | [](source:s-scroll)[](source:s-never) |
| 코드 수정 후 검증 완료를 판단할 때 | 크롬 기기 에뮬레이션이나 Xcode Simulator만으로 완료 선언을 금지하며, 실기기 확인이 필요한 항목을 사용자에게 분명히 밝힌다. | [](source:s-rule)[](source:s-hw)[](source:s-out) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 11가지 증상별 코드 패턴과 예외 — 맡을 개요 항목: 호버 고착·탭 플래시·지연 외 2행 · Tailwind v3/v4 호버 설정, 입력 `inputmode`·`enterkeyhint` 속성, PWA 상태 바, 스크롤 스냅 세부를 개요에 담지 않았다.
- `Baseline` 전체 스니펫과 `Never Ship` 대조표 — 맡을 개요 항목: 모바일 웹 앱 신규 시작 · 문서형 앱에서 `overscroll-behavior: none` 제외 조건 등 세부 주석을 뺐다.

읽은 원본: 텍스트 파일 1개. 제외: `SKILL.ko.stale.md` 1개(낡은 번역본).
