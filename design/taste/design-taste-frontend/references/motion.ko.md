# 모션

애니메이션을 추가하기 전에 읽습니다. 정적인 페이지가 먼저 완성되어 inspect.mjs를 통과해야 합니다. 모션은 마지막 단계이며 약한 레이아웃을 구제하는 수단이 아닙니다.

## 목차

1. 모션 예산
2. 잘 만든 페이지의 모션
3. 애니메이션 전에 답할 질문 네 가지
4. 토큰
5. 스크롤 동작 순위
6. 레시피 (복사한 뒤 조정)
7. 시그니처 동작
8. 모션 감소와 성능
9. 생성형 모션을 드러내는 특징
10. 모션 규칙

## 1. 모션 예산

움직임이 없는 페이지는 목업처럼 읽힙니다. inspector는 페이지가 로드되고 스크롤되는 동안 움직이는 요소를 세며 여덟 개 미만이면 실패 처리합니다. 모션 레이어는 다섯 부분으로 구성됩니다.

- **스크롤 장면 두세 개:** 수상 사이트가 기억되는 스크롤 기반 큰 장면 (사진 필드를 통과하는 카메라 비행, 창에서 전체 화면으로 커지는 사진, 고정된 무대 위를 지나가는 글자, 펼쳐져 쌓이는 카드 등). 라이브러리에 brief와 맞는 장면이 있으면 방향표가 library/scenes.json에서 선택합니다. 채우고 크기를 맞추는 방법은 references/scenes.md에 있습니다. 페이지에서 대담한 부분은 여기이며, 그 동작이 돋보이도록 나머지는 차분하게 유지합니다.
- **시그니처 순간 하나:** 한 시간 뒤에도 방문자가 설명할 장면. 마스크에서 떠오르는 헤드라인, 셔터처럼 열리는 이미지, 스크롤에 따라 크기가 달라지는 워드마크 등입니다. draw.mjs의 방향표가 하나를 지정합니다. 그 하나를 잘 만들고 크게 보여줄 수 있는 동작은 이것 하나뿐입니다.
- **섹션별로 연출한 진입 동작:** 각 섹션의 요소가 읽기 순서 (제목, 문구, 사진, 세부 내용)대로 60–90ms 간격을 두고 16–32px 올라오며 opacity가 바뀌고 한 번 실행됩니다. 모든 곳에 같은 프리셋을 찍어내지 말고 콘텐츠에 맞춥니다: 목록은 행별로, 사진은 마스크를 열거나 살짝 확대했다가 안정시키고, 숫자는 한 번 세며, 문장은 줄별로 나타냅니다.
- **사용자 동작에 대한 피드백:** 누를 때 반응하는 버튼, 포인터에 응답하는 링크, hover에 반응하는 카드와 사진, 클릭한 위치에서 열리는 메뉴.
- **움직이는 이미지 하나:** 포스터 프레임이 있는 음소거 루프 영상, 큰 사진의 느린 이동이나 확대, hero 사진의 스크롤 연동 동작 중 하나.

계속 금지되는 것: 모든 블록에 같은 타이밍으로 fade-and-slide-up을 적용하는 것 (생성형 페이지에서 가장 많이 언급되는 모션 흔적), 스크립트가 실행되어야만 보이는 콘텐츠와 대체 경로가 없는 상태, bounce / elastic easing, 레이아웃 속성을 애니메이션하는 것. 균일한 모션은 아무도 결정하지 않았음을 드러냅니다. 하나의 보호된 순간을 가진 연출된 모션은 누군가 결정했음을 보여줍니다.

## 2. 잘 만든 페이지의 모션

2026년 7월부터 10월까지 Awwwards Sites of the Day 99개를 1440px과 390px에서 측정하고 페이지가 로드되고 스크롤될 때 실행된 전환, tween, 스크롤 트리거를 기록했습니다. 갤러리에서 하우스 규칙에 어긋나는 방식이 발견된 경우 하우스 규칙을 따릅니다.

- **스택.** 3분의 2는 smooth-scroll 라이브러리를 사용했고 5분의 3은 Three.js를 포함했습니다. GSAP은 56개에서 확인됐습니다. 아래쪽의 차분한 레이어 (reveal, 선이 올라오는 동작, 잉크 채우기)에는 라이브러리가 필요 없습니다. CSS scroll timeline과 view transition으로 할 수 있지만 실제 사용한 사이트는 각각 3개와 6개뿐입니다. 큰 스크롤 장면은 수상 사이트처럼 assets/scenes/의 공유 stage와 GSAP ScrollTrigger로 만듭니다 (references/scenes.md).
- **곡선.** 실제 실행된 곡선은 강한 ease-out입니다: expo out (.16,1,.3,1 및 .19,1,.22,1)은 14개 사이트, cubic out은 13개, quint out은 7개에서 실행됐습니다. 전환 횟수로 보면 quint와 expo out이 선택된 모든 곡선보다 많았습니다. 화면을 닦듯 바꾸거나 이동하는 요소에는 in-out 곡선 (cubic 및 quart in-out)을 사용했습니다 (각 약 15개 사이트). Ease-in은 퇴장 때만 짧게 사용하고 느린 등장을 돕습니다. 색상 변화는 일반 ease를 사용합니다 (46개 사이트). Overshoot은 스타일시트 19개에 있었지만 실제 실행은 2개에서만 확인됐습니다.
- **시간.** hover 색상 200–300ms, 작은 인터페이스 이동 300–450ms, reveal과 선 상승 600–1,000ms, 사진 열기와 wipe 1,100–1,600ms. 사이트에서 실행된 전체 동작 시간 중앙값은 420ms입니다.
- **Stagger.** 글자 사이 20–40ms, 줄 사이 75–120ms, 목록 항목 사이 50–100ms.
- **스크롤 연동은 스크롤바에 고정.** scrub을 사용한 사이트 18개 중 14개는 부드럽게 보정하지 않고 스크롤바에 고정했습니다. 나머지 네 곳은 0.1–3초 동안 부드럽게 보정했습니다. reveal은 요소 상단이 viewport 아래쪽에서 80–95% 지점에 오면 한 번 실행됩니다.
- **움직이는 양.** 한 페이지에서 스크립트로 움직이는 요소의 중앙값은 130개지만 몇 가지 제스처에서 나옵니다. 분리된 헤드라인 하나가 20–60개 요소일 수 있습니다. inspector 기준 (최소 8, 16 미만 경고)은 합격선이지 목표치가 아닙니다.
- **대기가 가장 흔한 비용.** 99개 중 60개가 로딩 화면으로 시작했고 그중 26개는 카운터가 있었습니다. 사용 가능한 페이지 절반은 브라우저가 페이지 로드를 알린 뒤 2.5초가 지나도 읽기 어려웠고 3분의 1은 4.5초 뒤에도 읽기 어려웠습니다. preloader는 느린 페이지를 가린 것도 아닙니다 (이 페이지들은 다른 페이지보다 빠르게 로드됨). 기다림과 무관하게 독자의 디자인 평가는 같고 사용성만 떨어졌습니다. 하우스 규칙: preloader 없음. 첫 프레임부터 문구를 읽을 수 있고 로드 시퀀스는 1.2초 안에 끝냅니다.
- **고정은 페이지를 길게 만듭니다.** 스크롤 페이지 3분의 2가 sticky나 pinned 요소를 사용했습니다. 그런 페이지는 두 배로 길고 (화면 수 중앙값 16.6 대 7.5), 화면당 단어는 더 적었습니다 (27 대 46). 하우스 규칙: 고정 스테이지는 최대 두 개, 단계당 약 한 화면, 스테이지당 세 화면.
- **Reduced motion 지원이 대부분 빠져 있습니다.** 99개 중 35개만 prefers-reduced-motion 규칙이 있고 16개는 세 개 이상이었습니다. 스크롤 scrub 장면 26개 중 다섯 개만 지원했습니다. 여기 레시피는 모두 완성 상태를 reduced-motion 상태로 사용합니다.

## 3. 애니메이션 전에 답할 질문 네 가지

1. **사용자는 얼마나 자주 보나요?** 방문당 한 번 (hero 로드, 섹션 reveal)이면 천천히 보여도 됩니다. 방문 중 여러 번 (hover, 메뉴, 아코디언)이면 빠르고 작게. 수백 번 (키보드 입력, 타이핑)이면 애니메이션하지 않습니다.
2. **목적이 무엇인가요?** 타당한 답은 다음과 같습니다: 대상이 어디에서 왔는지 보여준다, 동작을 확인해 준다, 변화가 갑작스럽지 않게 잇는다, 제품 작동 방식을 설명한다, 시그니처 순간이다. “보기 좋다”는 시그니처 순간에만 유효합니다.
3. **어떤 easing을 쓰나요?** 진입과 퇴장에는 ease-out을 써 움직임이 눈에 들어오는 순간 시작하게 합니다. 화면의 두 위치 사이 이동에는 ease-in-out. hover 색상과 opacity에는 ease. marquee와 진행 표시처럼 일정하게 이동하는 것은 linear. Ease-in은 첫 프레임이 거의 움직이지 않아 인터페이스를 느리게 보이게 하므로 사용하지 않습니다. CSS 기본 곡선은 약하므로 아래 토큰을 사용합니다.
4. **얼마나 오래 걸리나요?** 누름 피드백 100–160ms, hover 150–200ms, 메뉴와 popover 150–250ms, 대화상자와 drawer 250–450ms, 섹션 및 hero reveal 500–900ms. 퇴장은 진입 시간의 약 70%로 더 빠르게 합니다.

## 4. 토큰

```css
:root {
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);        /* 진입, 움직이는 hover, 600ms 미만 UI */
  --ease-expo: cubic-bezier(0.16, 1, 0.3, 1);        /* 신규: 800ms 이상 reveal, 선 상승, 열기 */
  --ease-in-out: cubic-bezier(0.76, 0, 0.24, 1);     /* wipe, 패널, 화면에 보이는 이동 */
  --ease-soft: cubic-bezier(0.33, 1, 0.68, 1);       /* 사진의 느린 확대와 이동 */
  --ease-exit: cubic-bezier(0.55, 0.055, 0.675, 0.19); /* 신규: 완전히 사라지는 짧은 퇴장 */
  --t-press: 140ms;
  --t-hover: 180ms;
  --t-ui: 240ms;
  --t-reveal: 800ms;
  --t-open: 1200ms;                                  /* 신규: 사진 열기와 clip wipe */
  --stagger-line: 90ms;                              /* 신규 */
  --stagger-item: 70ms;                              /* 신규 */
}
```

각 항목의 연구 근거:

- --ease-out (quint out)은 비슷한 곡선과 함께 스타일시트 28개에 있었고 실제 실행된 전환 중 가장 많이 선택된 곡선입니다. 유지합니다.
- --ease-expo는 새 토큰입니다. Expo out (.16,1,.3,1 및 .19,1,.22,1)은 스타일시트 28개, 실행된 사이트 14개에 나타나 선택된 계열 중 가장 많았습니다. 선이 올라오는 동작, 사진 열기, 0.9–1.6초 카드 등장 같은 긴 reveal에 사용합니다. --t-reveal 이상에는 --ease-out 대신 사용합니다. 마스크 헤드라인과 스크롤 reveal 레시피도 이 곡선으로 바꿉니다.
- --ease-in-out (quart in-out)은 해당 계열과 맞습니다 (스타일시트 14개, 실행 7개). wipe, 셔터, 메뉴, 페이지 전환에 유지합니다.
- --ease-soft (cubic out)은 cubic-out 계열과 맞지만 (스타일시트 21개, 실행 13개), 연구에서 0.3–0.8초의 인터페이스 이동에도 쓰여 이미 --ease-out이 담당합니다. 사진의 느린 확대와 이동에만 좁혀 씁니다.
- --ease-exit은 새 토큰입니다. Ease-in은 영구 퇴장 동작에만 맞습니다 (나가는 캡션, 교체되는 슬라이드, 닫히는 패널). 짧게, 대응하는 진입의 60–70% 정도로 씁니다. 방문자가 기다리는 요소에는 쓰지 않습니다.
- 채택하지 않은 곡선: .4,0,.2,1은 스타일시트 38개에서 발견된 프레임워크 기본값이며 overshoot 곡선 (19개)은 인터페이스 요소에서 계속 금지합니다.
- --t-hover는 180ms로 유지합니다. 연구의 색상 hover는 200–300ms였지만 조금 빠르게 하면 더 정확하게 느껴집니다. 라벨 롤이나 화살표처럼 hover에서 요소가 움직이면 --t-ui를 400ms까지 사용합니다.

## 5. 스크롤 동작 순위

| 동작 | 99개 중 사용 페이지 | 목적 | 하우스 버전 |
| --- | --- | --- | --- |
| Smooth-scroll 라이브러리 | 67 | 무게감; scrub 장면 구현 보조 | 선택 사항. Stage.smooth()로 Lenis lerp 0.1–0.14, 터치 / reduced motion에서는 끔 |
| 고정 (sticky / pinned) 스테이지 | 44 | 한 사진이나 오브젝트가 여러 주장을 담당; 챕터 | 사용 가능: references/scenes.md의 스크롤 장면, 페이지당 두세 개, 장면당 화면 한 개에서 네 개; 기타 sticky는 최대 세 화면 |
| 텍스트 분할 | 40 | 읽는 동안 줄 / 단어가 나타남; hover 롤 | 제목과 문장은 줄 단위, 잉크 채우기만 단어 단위, 한두세 단어 제목만 글자 단위 |
| 챕터별 색상 | 34 | 띠 여백 없이 챕터 구분 | 사용 가능. 섹션 경계에서 하드 컷, 고정 헤더 잉크색은 300ms 동안 전환 |
| 스크롤 scrub 장면 (카메라, 오브젝트, 이미지 시퀀스) | 26 | 오브젝트 이동으로 제품 설명 | 사용 가능. 장면 라이브러리에서 공유 stage 기반으로 만들며 reduced motion용 완성 구도도 제공 |
| 깊이 parallax | 24 | 콜라주 깊이; 큰 프레임 안 사진 이동 | 요소 이동은 8% 미만, 사진은 프레임의 106–110% |
| Marquee | 21 | 정적 띠에 생동감 부여 | 기존 “Edge-to-edge marquee”: 페이지당 하나, 일시정지 지원 |
| 마스크 줄 / 단어 상승 | 18 | 조판된 글자가 도착하는 제목 | 사용 가능: 로드 시 “Masked line reveal”, 첫 화면 아래 “Lines that rise on scroll” |
| 휠이 장면을 제어하고 페이지는 스크롤하지 않음 | 16 | 하나의 사물을 탐색 | 사용 안 함 (2.6 참고) |
| Blur-in | 15 | 부드러운 등장 | blur 최대 8px, 600ms, 정착 후 제거; 본문에 사용 금지 |
| 인셋 프레임에서 전체 화면으로 사진 열기 | 14 | 타이포그래피 화면에서 큰 사진으로 인계 | 사용 가능: “Opening window”, 스크롤 약 한 화면 |
| 회색에서 잉크색으로 텍스트 채우기 | 14 | 문장 하나의 리듬 조절 | 사용 가능: 페이지당 한 번, 45% 잉크로 시작하는 “Ink fill” |
| 고정 사진 위로 시트가 올라옴 | 11 | 챕터 사이 페이지 전환 리듬 | 새 동작 “Sheet over a held picture” |
| 글자 섞기 / 디코딩 | 11 | “코드” 어조 | 사용 안 함 (2.6 참고) |
| 챕터별 헤더 잉크색 | 10 | 고정 헤더 가독성 유지 | 챕터별 색상과 함께 사용 |
| 세로 스크롤에 고정된 가로 트랙 | 8 | 방이나 컬렉션을 둘러봄 | 기본은 native drag 행; 세 화면보다 짧은 행만 keyboard 지원과 함께 고정 (“Sideways gallery”) |
| 커튼형 footer | 8 | 장면처럼 끝나는 페이지 | 기존 동작 |
| 숫자 롤링 | 6 | 숫자가 도착하는 움직임 | 페이지 주장이 숫자 몇 개에 달린 경우 사용 (“Rolling figures”) |
| hover 미리보기 인덱스 | 5 | 이름으로 작업 탐색 | 행에 고정되는 미리보기 인덱스 개선판 |

텍스트 분할은 글자 단위가 약 20페이지, 줄 단위 약 14페이지, 단어 단위 약 11페이지에서 사용됐습니다. 글자 분할은 짧은 제목과 버튼 롤에 적합합니다. 긴 문장에 쓰면 스크롤 중 글자 조각만 남습니다.

## 6. 레시피

모든 레시피는 JavaScript가 꺼져 있을 때도 콘텐츠를 보이게 하고, 숨김 상태는 prefers-reduced-motion: no-preference 안에서만 적용하며 위 토큰을 사용합니다. 여러 레시피에 공통으로 적용되는 참고사항 두 가지:

- **Scroll timeline은 관찰할 스크롤 컨테이너가 필요합니다.** animation-timeline: view()는 가장 가까운 스크롤 컨테이너를 사용하고 overflow: hidden도 스크롤 컨테이너가 됩니다. 따라서 overflow: hidden 프레임 안의 사진은 애니메이션되지 않습니다. 프레임에는 overflow: clip을 쓰거나 섹션에 view-timeline-name: --hero를 지정하고 자식에서 그 이름을 참조합니다. 기존 “Scroll-linked progress” 레시피에도 동일하게 적용됩니다.
- **스크롤 연동은 선형입니다.** 스크롤 자체가 easing입니다. scrub을 쓴 사이트 18개 중 14개는 움직임을 스크롤바에 고정했으며 CSS scroll timeline도 같은 방식으로 동작합니다.

모든 레시피는 JavaScript가 꺼져 있거나 느려도 콘텐츠가 보입니다. 숨김 상태는 html.js로만 적용하며 페이지에 넣는 한 줄 스크립트가 해당 클래스를 설정합니다.

```html
<script>document.documentElement.classList.add('js')</script>
```

### 로드 후 1.2초 시퀀스

모든 콘텐츠는 HTML에 있어 첫 프레임부터 그려집니다. 시퀀스는 진입 동작만 더합니다. load 이벤트를 기다리지 않으며 내비게이션은 움직이지 않습니다.

```html
<header class="hero">
  <h1 class="display lines">
    <span class="line"><span data-line style="--i:0">Stools for</span></span>
    <span class="line"><span data-line style="--i:1">small kitchens</span></span>
  </h1>
  <p class="lead" data-load style="--d:420ms">…</p>
  <a class="button" data-load style="--d:480ms" href="#stools">See the stools</a>
  <figure class="hero__picture" data-open><img src="stool.jpg" alt="…" fetchpriority="high"></figure>
</header>
```

```css
.hero__picture { overflow: clip; margin: 0; }
@media (prefers-reduced-motion: no-preference) {
  .js .hero [data-line] { transform: translateY(105%); animation: load-line 800ms var(--ease-expo) forwards; animation-delay: calc(100ms + var(--i) * var(--stagger-line)); }
  .js .hero [data-load] { opacity: 0; transform: translateY(12px); animation: load-rise 500ms var(--ease-out) forwards; animation-delay: var(--d); }
  .js .hero [data-open] { clip-path: inset(0 0 100% 0); animation: load-open 1000ms var(--ease-in-out) 150ms forwards; }
  .js .hero [data-open] img { transform: scale(1.08); animation: load-settle 1100ms var(--ease-expo) 100ms forwards; }
}
@keyframes load-line { to { transform: none; } }
@keyframes load-rise { to { opacity: 1; transform: none; } }
@keyframes load-open { to { clip-path: inset(0); } }
@keyframes load-settle { to { transform: none; } }
```

타임라인: 헤드라인 줄은 100–990ms에 올라오고 사진은 150–1,150ms 사이에 열립니다. 문장과 버튼은 420–980ms에 등장합니다. 네 요소 모두 1.2초 안에 정착합니다. 실제 글꼴로 헤드라인이 올라오도록 디스플레이 글꼴을 preload 합니다 (<link rel="preload" as="font" type="font/woff2" crossorigin>). 이미지에는 fetchpriority="high"와 이미지에서 추출한 바탕색을 줘 느리게 로드되어도 빈 상자가 아니라 자체 색 위에서 열리게 합니다. 연구에서 첫 인트로 프레임부터 읽을 수 있었던 페이지는 91개 중 22개였고, 1.2초까지 11개가 더 읽을 수 있게 됐습니다. 독자가 정중하다고 평가한 인트로는 약 1–1.2초에 끝났고 3분의 1은 4.5초가 지나도 읽기 어려웠습니다.

### 마스크 줄 공개 (갤러리의 대표 헤드라인)

각 줄이 자체 기준선 아래에서 올라옵니다. 헤드라인은 최대 두 줄이므로 줄바꿈을 직접 지정하고 각 줄을 감쌉니다.

```html
<h1 class="lines">
  <span class="line"><span data-line style="--i:0">Stools for</span></span>
  <span class="line"><span data-line style="--i:1">small kitchens</span></span>
</h1>
```

```css
.lines .line { display: block; overflow: hidden; padding-bottom: 0.08em; margin-bottom: -0.08em; }
.lines [data-line] { display: block; }
@media (prefers-reduced-motion: no-preference) {
  .js .lines [data-line] {
    transform: translateY(105%);
    animation: line-up 900ms var(--ease-out) forwards;
    animation-delay: calc(var(--i) * 110ms + 150ms);
  }
}
@keyframes line-up { to { transform: none; } }
```

padding-bottom과 음수 margin을 함께 써 g, y, p 같은 글자의 하강부가 마스크에 잘리지 않게 합니다. 좁은 휴대폰에서 지정한 두 줄이 각각 자동으로 줄바꿈될 수 있으므로 모바일 스크린샷을 확인합니다. 자동 줄바꿈되면 br class="only-wide" 패턴으로 모바일 줄바꿈을 따로 지정하거나 글자 크기를 줄입니다.

### 스크롤 reveal (한 번)

모든 블록이 아니라 reveal이 필요한 두세 섹션에만 적용합니다.

```css
@media (prefers-reduced-motion: no-preference) {
  .js [data-reveal] { opacity: 0; transform: translateY(24px); transition: opacity 700ms var(--ease-out), transform 900ms var(--ease-out); }
  .js [data-reveal].is-in { opacity: 1; transform: none; }
}
```

```js
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
}, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });
document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
```

scroll listener로 reveal을 연결하지 않습니다. 요소가 다시 들어올 때 반복 실행하지 않습니다. observer가 실행되지 않아도 요소가 opacity: 0에 머물지 않게 합니다 (JavaScript가 없는 경우는 html.js 게이트, 반복 방지는 unobserve로 처리).

### 이미지 셔터

이미지 프레임 안에서 살짝 축소되며 한쪽 가장자리부터 열립니다. 갤러리에서 흔히 쓰는 동작이며 hero 또는 showcase 이미지 하나에 사용합니다.

```css
.shutter { overflow: hidden; }
@media (prefers-reduced-motion: no-preference) {
  .js .shutter { clip-path: inset(0 0 100% 0); transition: clip-path 1100ms var(--ease-in-out); }
  .js .shutter img { transform: scale(1.12); transition: transform 1500ms var(--ease-soft); }
  .js .shutter.is-in { clip-path: inset(0); }
  .js .shutter.is-in img { transform: none; }
}
```

### 누름과 hover

```css
.button { transition: transform var(--t-press) var(--ease-out), background-color var(--t-hover) ease, color var(--t-hover) ease; }
.button:active { transform: scale(0.97); }
.link { text-decoration: underline; text-decoration-color: transparent; text-underline-offset: 0.2em; text-decoration-thickness: 0.07em; transition: text-decoration-color var(--t-hover) ease; }
@media (hover: hover) and (pointer: fine) {
  .button:hover { background-color: var(--accent-strong); }
  .link:hover { text-decoration-color: currentColor; }
}
```

터치 기기는 탭에서도 hover를 발생시킨 뒤 상태를 고정할 수 있으므로 hover 스타일은 (hover: hover) 조건 안에 둡니다. Hover는 대비를 높여야 하고 낮추면 안 됩니다. hover에서 글꼴 굵기를 바꾸지 않습니다 (줄바꿈이 달라짐). 모든 카드와 이미지를 hover에서 띄우거나 확대하지 않습니다. 일관되고 작은 반응 하나면 충분합니다.

### JavaScript 없는 스크롤 연동 progress

Hero가 화면을 떠날 때 워드마크가 축소되거나 이미지가 몇 퍼센트 이동하거나 진행 표시줄을 표시할 때 사용합니다. scroll timeline이 없는 브라우저에서는 정적 상태를 유지하도록 @supports로 감쌉니다.

```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .drift { animation: drift linear both; animation-timeline: view(); animation-range: entry 0% exit 100%; }
    @keyframes drift { from { transform: translateY(-4%); } to { transform: translateY(4%); } }
  }
}
```

이동은 요소 크기의 8% 미만으로 유지합니다. 큰 parallax는 글을 읽기 어렵게 하고 시대에 뒤떨어져 보입니다.

### 고정 이야기

항목이 지나가는 동안 제목을 고정합니다. 스크롤을 가로채지 말고 position: sticky를 사용합니다.

```css
.story { display: grid; grid-template-columns: 5fr 7fr; gap: var(--gutter); align-items: start; }
.story__title { position: sticky; top: 18vh; }
@media (max-width: 800px) { .story { grid-template-columns: 1fr; } .story__title { position: static; } }
```

### 행에 고정되는 미리보기 인덱스

이름 행 위에 포인터를 올리거나 키보드로 focus하면 같은 높이에서 해당 행의 이미지 하나가 열립니다. 프레임은 포인터가 아니라 행을 따라갑니다.

```html
<section class="index">
  <ul class="index__list">
    <li><a class="index__row" href="/work/harbour-house" data-preview="/img/harbour-house.jpg">
      <span class="index__name">Harbour House</span><span class="index__year">2025</span>
      <img class="index__thumb" src="/img/harbour-house-small.jpg" alt="" loading="lazy" width="640" height="400">
    </a></li>
    <!-- … -->
  </ul>
  <div class="index__frame" aria-hidden="true"><img alt=""></div>
</section>
```

```css
.index { position: relative; }
.index__list { list-style: none; margin: 0; padding: 0; }
.index__row { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 0 var(--gutter); padding-block: 0.3em; font-size: var(--step-head); color: inherit; text-decoration: none; transition: opacity var(--t-hover) ease; }
.index__thumb { order: -1; flex-basis: 100%; width: 100%; height: auto; margin-bottom: 0.4rem; }
.index__frame { display: none; }
@media (hover: hover) and (pointer: fine) {
  .index__list { max-width: 62%; }
  .index__thumb { display: none; }
  .index__list:has(.index__row:hover, .index__row:focus-visible) .index__row:not(:hover, :focus-visible) { opacity: 0.4; }
  .index__frame { display: block; position: absolute; top: 0; right: var(--margin); width: 30%; aspect-ratio: 4 / 3; z-index: 1; pointer-events: none; clip-path: inset(100% 0 0 0); transition: clip-path 320ms var(--ease-out), transform 360ms var(--ease-out); }
  .index__frame.is-open { clip-path: inset(0); }
  .index__frame img { width: 100%; height: 100%; object-fit: cover; }
}
@media (prefers-reduced-motion: reduce) { .index__frame { transition: none; } }
```

```js
(() => {
  const root = document.querySelector('.index');
  if (!root) return;
  const frame = root.querySelector('.index__frame');
  const picture = frame.querySelector('img');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let warmed = false;
  const show = (row) => {
    if (!fine.matches) return;
    if (!warmed) { warmed = true; root.querySelectorAll('[data-preview]').forEach((a) => { new Image().src = a.dataset.preview; }); }
    picture.src = row.dataset.preview;
    const y = row.offsetTop + row.offsetHeight / 2 - frame.offsetHeight / 2;
    const max = root.offsetHeight - frame.offsetHeight;
    const opening = !frame.classList.contains('is-open');
    if (opening) frame.style.transitionProperty = 'clip-path';   // 제자리에서 열고 위쪽에서 밀려 들어오지 않게 함
    frame.style.transform = 'translateY(' + Math.min(max, Math.max(0, y)) + 'px)';
    if (opening) { frame.getBoundingClientRect(); frame.style.transitionProperty = ''; }
    frame.classList.add('is-open');
  };
  const hide = () => frame.classList.remove('is-open');
  root.querySelectorAll('.index__row').forEach((row) => {
    row.addEventListener('pointerenter', () => show(row));
    row.addEventListener('focus', () => show(row));
  });
  root.addEventListener('pointerleave', hide);
  root.addEventListener('focusout', (e) => { if (!root.contains(e.relatedTarget)) hide(); });
})();
```

터치 화면에서는 각 행이 이름 위에 자체 사진을 보여줍니다. 연구에서는 5개 페이지가 이 방식으로 작업을 탐색했습니다. 목록 뒤 프레임은 약 470×270부터 대형 판형까지였고 나머지 행의 불투명도를 약 0.3으로 낮췄습니다 (여기서는 흐린 텍스트의 최소 기준을 위해 0.4). 연구에서 본 이미지 잔상과 커서를 따라다니는 미리보기는 장난처럼 보입니다.

### 스크롤 시 줄 상승

줄바꿈을 지정할 수 없는 섹션 제목이나 문장에 사용합니다. 글꼴이 로드된 뒤 분할해 한 번 보여주고 평문으로 되돌려 정상적으로 줄바꿈되게 합니다. 링크나 강조가 들어간 텍스트에는 적용하지 않습니다.

```html
<h2 class="head" data-lines>Turned by hand in one small workshop</h2>
```

```css
[data-lines] .line { display: block; overflow: clip; padding-bottom: 0.12em; margin-bottom: -0.12em; }
[data-lines] .line > span { display: block; }
@media (prefers-reduced-motion: no-preference) {
  .is-split .line > span { transform: translateY(110%); }
  .is-split.is-in .line > span { transform: none; transition: transform 900ms var(--ease-expo) calc(var(--i) * var(--stagger-line)); }
}
```

```js
(() => {
  const els = [...document.querySelectorAll('[data-lines]')];
  if (!els.length || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const restore = (el) => { el.textContent = el.dataset.text; el.classList.remove('is-split', 'is-in'); };
  const split = (el) => {
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    el.dataset.text = text;
    el.textContent = '';
    const words = text.split(' ').map((word) => {
      const s = document.createElement('span');
      s.style.display = 'inline-block';
      s.textContent = word;
      el.append(s, ' ');
      return s;
    });
    const lines = [];                                   // 실제 배치된 줄에 따라 단어 그룹화
    for (const w of words) {
      const last = lines.at(-1);
      if (last && Math.abs(last.top - w.offsetTop) < 4) last.words.push(w.textContent);
      else lines.push({ top: w.offsetTop, words: [w.textContent] });
    }
    el.textContent = '';
    lines.forEach((line, i) => {
      const mask = document.createElement('span');
      const inner = document.createElement('span');
      mask.className = 'line';
      inner.style.setProperty('--i', i);
      inner.textContent = line.words.join(' ');
      mask.append(inner);
      el.append(mask, ' ');
    });
    el.classList.add('is-split');
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      e.target.classList.add('is-in');
      e.target.querySelector('.line:last-of-type > span')
        .addEventListener('transitionend', () => restore(e.target), { once: true });
    }
  }, { rootMargin: '0px 0px -12% 0px' });
  document.fonts.ready.then(() => els.forEach((el) => { split(el); io.observe(el); }));
  let width = innerWidth;                               // reveal 전 너비 변경 시 원문 복구
  addEventListener('resize', () => {
    if (innerWidth === width) return;
    width = innerWidth;
    els.filter((el) => el.matches('.is-split:not(.is-in)')).forEach((el) => { io.unobserve(el); restore(el); });
  });
})();
```

연구에서 마스크 상승은 줄 아래 100–120%에서 시작해 0.6–1.2초 동안 진행됐고 줄 사이 간격은 75–120ms였습니다. 블록 상단이 viewport 아래에서 80–95% 지점에 올 때 한 번 실행했습니다. Reduced motion에서는 스크립트가 실행되지 않아 텍스트가 평문으로 보입니다.

### Opening window

타이포그래피 화면에서 큰 사진으로 넘기는 동작입니다. 처음에는 고정 스테이지 가운데의 창에 사진이 보이고 약 한 화면의 스크롤 동안 블리드 전체로 열립니다.

```html
<section class="opening">
  <div class="opening__stage">
    <img src="workshop-wide.jpg" alt="새벽에 작업대가 치워진 공방" width="2400" height="1500">
  </div>
</section>
```

```css
.opening__stage { height: 100svh; overflow: clip; }
.opening__stage img { display: block; width: 100%; height: 100%; object-fit: cover; }
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .opening { height: 200svh; view-timeline-name: --opening; --inset-y: 20%; --inset-x: 28%; }
    .opening__stage { position: sticky; top: 0; animation: opening-window linear both; animation-timeline: --opening; animation-range: contain 0% contain 75%; }
    .opening__stage img { animation: opening-settle linear both; animation-timeline: --opening; animation-range: contain 0% contain 75%; }
  }
}
@media (max-width: 700px) { .opening { --inset-y: 18%; --inset-x: 8%; } }
@keyframes opening-window { from { clip-path: inset(var(--inset-y) var(--inset-x)); } to { clip-path: inset(0); } }
@keyframes opening-settle { from { transform: scale(1.15); } to { transform: none; } }
```

섹션은 두 화면 높이입니다. 스테이지는 한 화면 동안 고정되고 스크롤의 4분의 3 지점에서 창이 완전히 열려 전체 화면 사진이 잠시 유지된 뒤 다음 내용으로 넘어갑니다. 연구 대상 14페이지에서는 시작 창 너비가 38–60%였고 진행 구간은 600–1,800px였습니다. 독자는 한두 화면을 적절하다고 했습니다. Scroll timeline이 없거나 reduced motion이면 사진은 전체 화면 정지 이미지가 됩니다.

### 고정 이미지, 지나가는 캡션

사진은 한쪽에서 고정되고 반대쪽으로 짧은 캡션이 지나가는 사진용 pinned story입니다. 화면 가운데에 온 캡션은 강조하고 그에 맞는 사진을 보여줍니다.

```html
<section class="steps">
  <figure class="steps__media">
    <div class="steps__pictures">
      <img src="seasoning.jpg" alt="건조를 위해 쌓아 둔 물푸레나무 판재" class="is-on">
      <img src="turning.jpg" alt="선반에서 다리를 깎는 모습">
      <img src="finish.jpg" alt="완성된 좌판에 오일을 문지르는 모습">
    </div>
    <figcaption class="steps__count" aria-hidden="true"></figcaption>
  </figure>
  <ol class="steps__list">
    <li class="steps__item"><h3>1년간 건조</h3><p>…</p></li>
    <li class="steps__item"><h3>손으로 깎기</h3><p>…</p></li>
    <li class="steps__item"><h3>오일로 마감</h3><p>…</p></li>
  </ol>
</section>
```

```css
.steps { display: grid; grid-template-columns: 7fr 5fr; column-gap: var(--gutter); }
.steps__media { margin: 0; align-self: start; }           /* 늘어난 grid item은 sticky가 될 수 없음 */
.steps__pictures img { display: block; width: 100%; height: auto; }
.steps__list { list-style: none; margin: 0; padding: 0; }
.steps__item { min-height: 80svh; display: flex; flex-direction: column; justify-content: center; }
.js .steps__media { position: sticky; top: 0; height: 100svh; display: flex; flex-direction: column; justify-content: center; gap: 0.75rem; }
.js .steps__pictures { position: relative; aspect-ratio: 4 / 5; max-height: 80svh; }
.js .steps__pictures img { position: absolute; inset: 0; height: 100%; object-fit: cover; opacity: 0; transition: opacity 500ms ease; }
.js .steps__pictures img.is-on { opacity: 1; }
.js .steps__item { opacity: 0.4; transition: opacity var(--t-ui) ease; }
.js .steps__item.is-active { opacity: 1; }
@media (max-width: 800px) {
  .steps { display: block; }                               /* 격자 영역이 아니라 섹션이 sticky 사진을 포함 */
  .js .steps__media { height: auto; z-index: 1; background: var(--bg); padding-block: 0.5rem; }
  .js .steps__pictures { aspect-ratio: 3 / 2; max-height: 42svh; }
  .steps__item { min-height: 60svh; }
}
@media (prefers-reduced-motion: reduce) { .js .steps__pictures img, .js .steps__item { transition: none; } }
```

```js
(() => {
  const root = document.querySelector('.steps');
  if (!root || !('IntersectionObserver' in window)) return;
  const items = [...root.querySelectorAll('.steps__item')];
  const pictures = [...root.querySelectorAll('.steps__pictures img')];
  const count = root.querySelector('.steps__count');
  const show = (i) => {
    items.forEach((el, k) => el.classList.toggle('is-active', k === i));
    pictures.forEach((el, k) => el.classList.toggle('is-on', k === i));
    if (count) count.textContent = \`${i + 1} of ${items.length}\`;
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) show(items.indexOf(e.target));
  }, { rootMargin: '-45% 0px -45% 0px' });                 // 화면 중간을 가로지르는 영역
  items.forEach((el) => io.observe(el));
  show(0);
})();
```

JavaScript가 없으면 사진과 캡션이 단순한 두 열로 나옵니다. 연구에서는 비활성 항목 투명도를 20–40%로 낮췄습니다. 10–15%는 텍스트가 사라진 듯 읽혀 여기서는 최소 40%를 유지합니다. 항목당 약 한 화면이며 crossfade는 400–600ms였습니다. 독자는 두 단계보다 많은 고정 순서에서 표시되는 카운터를 원했습니다. 카운터는 01처럼 0을 채운 숫자가 아니라 본문 글꼴의 일반 문장입니다.


### 가로 갤러리

세로 스크롤 중 무대가 고정되고 사진 행이 옆으로 이동합니다. 항목 여덟 개 이하의 짧은 컬렉션에 적합합니다. 기본은 native drag 행이며 모션을 허용하는 넓은 화면에서 행이 세 화면보다 짧을 때만 pinned 버전을 추가합니다.

```html
<section class="gallery">
  <div class="gallery__stage">
    <h2 class="head">Eight kitchens, one stool</h2>
    <ul class="gallery__track">
      <li class="gallery__item"><a href="/kitchens/leith"><img src="leith.jpg" alt="리스의 좁은 갤리 주방" width="1200" height="1500"><span>Leith</span></a></li>
      <!-- … -->
    </ul>
  </div>
</section>
```

```css
.gallery__track { display: flex; gap: var(--gutter); list-style: none; margin: 0; padding: 0 var(--margin); overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding-inline: var(--margin); }
.gallery__item { flex: 0 0 min(72vw, 28rem); scroll-snap-align: start; }
.gallery__item img { display: block; width: 100%; height: auto; aspect-ratio: 4 / 5; object-fit: cover; }
.gallery.is-pinned .gallery__stage { position: sticky; top: 0; height: 100svh; display: flex; flex-direction: column; justify-content: center; gap: 2rem; overflow: clip; }
.gallery.is-pinned .gallery__track { overflow: visible; scroll-snap-type: none; }
.gallery.is-pinned .gallery__item { flex-basis: calc(62svh * 0.8); }
```

```js
(() => {
  const root = document.querySelector('.gallery');
  if (!root) return;
  const track = root.querySelector('.gallery__track');
  const wide = matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)');
  let dx = 0, queued = false;
  const place = () => {
    queued = false;
    if (!root.classList.contains('is-pinned')) return;
    const p = Math.min(1, Math.max(0, -root.getBoundingClientRect().top / dx));
    track.style.transform = `translate3d(${(-p * dx).toFixed(1)}px, 0, 0)`;
  };
  const measure = () => {
    root.classList.add('is-pinned');                     // pinned일 때 행의 크기를 측정
    track.style.transform = '';
    dx = track.scrollWidth - track.clientWidth;
    const pin = wide.matches && dx > 0 && dx < innerHeight * 3;
    root.classList.toggle('is-pinned', pin);
    root.style.height = pin ? `${innerHeight + dx}px` : ''; // 스크롤 1px에 행도 1px 이동
    place();
  };
  track.addEventListener('focusin', (e) => {             // 키보드: focus된 항목을 화면에 표시
    if (!root.classList.contains('is-pinned')) return;
    const item = e.target.closest('.gallery__item');
    const x = Math.min(dx, Math.max(0, item.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft)));
    scrollTo({ top: root.getBoundingClientRect().top + scrollY + x, behavior: 'instant' });
  });
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(place); } }, { passive: true });
  addEventListener('resize', measure);
  addEventListener('load', measure);
  wide.addEventListener('change', measure);
  measure();
})();
```

연구에서는 8개 페이지가 가로 트랙을 고정했습니다. 페이지 길이 중앙값은 25화면이었고 최악 사례는 카드 세 장에 9화면, 한 트랙에 휠 이동 10,000–23,000px가 들었습니다. 여기서는 속도를 1:1로 맞추고 마지막 사진이 여백에 도달하면 고정을 끝냅니다. 휴대폰, 좁은 창, reduced motion, 긴 행은 모두 기본 가로 행을 사용하며 이는 터치, 트랙패드, 키보드로도 작동합니다. 움직이는 행 안에 CTA의 유일한 사본을 두지 않습니다.

### 물러나는 hero

첫 화면이 떠날 때 사진은 조금 가라앉고 어두워지며 문구는 더 빠르게 위로 올라옵니다. hero가 단순히 스크롤로 사라지는 대신 물러나는 느낌을 줍니다.

```html
<header class="hero">
  <img class="hero__picture" src="kitchen.jpg" alt="…" width="2400" height="1600" fetchpriority="high">
  <div class="hero__copy"><h1 class="display">…</h1><p class="lead">…</p></div>
</header>
```

```css
.hero { position: relative; min-height: 100svh; overflow: clip; display: grid; align-items: end; view-timeline-name: --hero; }
.hero__picture { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero::after { content: ''; position: absolute; inset: 0; background: var(--ink); opacity: 0; pointer-events: none; }
.hero__copy { position: relative; z-index: 1; padding: var(--margin); }
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .hero__picture { animation: hero-sink linear both; animation-timeline: --hero; animation-range: exit 0% exit 100%; }
    .hero::after { animation: hero-dim linear both; animation-timeline: --hero; animation-range: exit 0% exit 100%; }
    .hero__copy { animation: hero-lift linear both; animation-timeline: --hero; animation-range: exit 0% exit 70%; }
  }
}
@keyframes hero-sink { to { transform: translateY(8%) scale(1.06); } }
@keyframes hero-dim { to { opacity: 0.35; } }
@keyframes hero-lift { to { transform: translateY(-6%); opacity: 0; } }
```

exit 구간은 hero 상단이 화면 상단에 닿는 순간부터 hero 하단이 지나갈 때까지입니다. 첫 화면 hero에서는 화면 한 장 분량의 스크롤입니다. 연구에서는 hero 사진이 빠져나가며 가라앉고 어두워졌고, 헤딩이 140px에서 60px로 scrub되거나 휴대폰에서 타이틀 카드가 축소되는 사례가 있었습니다. 독자는 조용한 동작이라고 했고 페이지를 “한 장의 종이”라고 표현했습니다. 이동은 8% 미만이고 오버레이는 그라데이션이 아니라 잉크색 평면에 opacity 최대 35%입니다. 지원하지 않는 환경이나 reduced motion에서는 정적으로 표시합니다.

### 페이지 간 전환

브라우저 자체 view transition으로 사이트 페이지를 이동합니다. 이전 페이지는 빠르게 페이드되고 새 페이지는 살짝 올라오며, 사용자가 누른 사진은 새 페이지의 hero 위치로 이동합니다. 라이브러리나 전체 화면 커튼은 쓰지 않습니다.

```css
/* 모든 페이지에 적용 */
@view-transition { navigation: auto; }
@media (prefers-reduced-motion: reduce) { @view-transition { navigation: none; } }
::view-transition-old(root) { animation: vt-leave 200ms var(--ease-exit) both; }
::view-transition-new(root) { animation: vt-arrive 380ms var(--ease-out) 60ms both; }
::view-transition-group(*) { animation-duration: 480ms; animation-timing-function: var(--ease-in-out); }
::view-transition-image-pair(*.picture) { overflow: clip; }
::view-transition-old(*.picture), ::view-transition-new(*.picture) { height: 100%; object-fit: cover; }
@keyframes vt-leave { to { opacity: 0; } }
@keyframes vt-arrive { from { opacity: 0; transform: translateY(16px); } }
```

```html
<!-- 인덱스: 특정 작업의 카드 사진 -->
<img src="/img/leith.jpg" alt="…" style="view-transition-name: kitchen-leith; view-transition-class: picture">
<!-- 해당 작업 페이지: hero 사진 -->
<img src="/img/leith-wide.jpg" alt="…" style="view-transition-name: kitchen-leith; view-transition-class: picture">
```

페이지마다 같은 이름은 한 번만 사용할 수 있습니다. 문서 간 view transition을 지원하지 않는 브라우저에서는 기본 페이지 이동이 일어납니다. 연구에서 16개 페이지가 페이지 전환 라이브러리를 사용해 0.7–2.4초 전체 화면 커튼을 넣었고, 6개 페이지가 view transition을 사용했습니다. 새 페이지는 0.5초 안에 읽을 수 있어야 합니다.

### 잉크 채우기

화면을 지나 위로 올라오는 문장 하나를 일부 잉크색에서 완전한 잉크색으로 줄별로 채웁니다. 채우기 전에도 읽을 수 있어야 하며 이 동작은 리듬만 조절합니다.

```html
<p class="statement head" data-fill>Nine people, one workshop, no catalogue: every stool is made for the kitchen it goes to.</p>
```

```css
[data-fill] { --fill: var(--ink); color: var(--fill); }
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .is-filling > span { display: inline-block; color: color-mix(in oklab, var(--fill) 45%, transparent); animation: ink-fill linear both; animation-timeline: view(); animation-range: cover 20% cover 45%; }
  }
}
@keyframes ink-fill { to { color: var(--fill); } }
```

```js
(() => {
  if (!CSS.supports('animation-timeline: view()') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('[data-fill]').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((word, i) => {
      const s = document.createElement('span');
      s.textContent = word;
      el.append(s, i < words.length - 1 ? ' ' : '');
    });
    el.classList.add('is-filling');
  });
})();
```

각 단어가 자체 위치를 관찰하므로 줄이 화면 아래쪽 4분의 3에서 가운데보다 약간 위까지 이동하는 동안 같은 줄의 단어가 함께 채워집니다. 어두운 챕터에서는 --fill을 챕터 잉크색으로 설정합니다. 연구의 14개 페이지가 문장을 회색에서 잉크색으로 scrub했습니다. 읽히기 전 단어가 약 25–30% 잉크로 시작했고 정지 프레임에도 반쯤 흐린 문장이 남아 비활성 텍스트처럼 보였습니다. 여기서는 페이지당 문장 하나, 세 줄에서 다섯 줄, 크기 32px 이상으로 설정하고 45% 잉크에서 시작합니다 (바탕과 약 3:1 대비라 큰 글자에 충분). Scroll timeline이 없거나 reduced motion이면 완전한 잉크색으로 표시합니다.

### 숫자 롤링

페이지의 핵심 근거가 숫자 몇 개일 때 사용합니다. 각 숫자가 한 번 위로 굴러가며 열마다 박자 차이를 둡니다. 스크린 리더와 검색을 위해 실제 숫자는 텍스트에 남겨 둡니다.

```html
<p class="figure"><span class="display" data-roll>1987</span> the year the first stool was sold</p>
```

```css
.roll__digits { display: inline-flex; font-variant-numeric: tabular-nums; line-height: 1; }
.roll__col { display: inline-block; height: 1em; overflow: clip; }
.roll__strip { display: flex; flex-direction: column; transform: translateY(calc(var(--d) * -1em)); }
.roll__strip > span { height: 1em; }
@media (prefers-reduced-motion: no-preference) {
  .roll:not(.is-in) .roll__strip { transform: none; }
  .roll.is-in .roll__strip { transition: transform 1100ms var(--ease-expo) calc(var(--i) * var(--stagger-item)); }
}
```

```js
(() => {
  const els = [...document.querySelectorAll('[data-roll]')];
  if (!els.length) return;
  els.forEach((el) => {
    const value = el.textContent.trim();
    const said = Object.assign(document.createElement('span'), { className: 'sr-only', textContent: value });
    const shown = Object.assign(document.createElement('span'), { className: 'roll__digits' });
    shown.setAttribute('aria-hidden', 'true');
    let i = 0;
    for (const ch of value) {
      if (!/\d/.test(ch)) { shown.append(ch); continue; }
      const col = Object.assign(document.createElement('span'), { className: 'roll__col' });
      const strip = Object.assign(document.createElement('span'), { className: 'roll__strip' });
      strip.style.setProperty('--d', ch);
      strip.style.setProperty('--i', i++);
      for (let n = 0; n < 10; n++) strip.append(Object.assign(document.createElement('span'), { textContent: n }));
      col.append(strip);
      shown.append(col);
    }
    el.classList.add('roll');
    el.replaceChildren(said, shown);
  });
  if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -15% 0px' });
  els.forEach((el) => io.observe(el));
})();
```

연구에서 숫자 열을 롤링한 페이지는 6개였습니다 (통계, 연도, 좌표). 열마다 expo-out을 사용해 약 0.9–1.1초 동안 애니메이션하고 열별로 stagger를 적용했습니다. 디스플레이 크기의 숫자 세네 개에만 씁니다. 본문 텍스트나 페이지 로딩 후 바뀌는 값에는 사용하지 않습니다. Reduced motion에서는 수치가 최종 값으로 표시됩니다.

### Accordion

```css
.acc__panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 320ms var(--ease-out); }
.acc__panel > div { overflow: hidden; }
.acc[open] .acc__panel, .acc__item.is-open .acc__panel { grid-template-rows: 1fr; }
```

grid-template-rows를 0fr에서 1fr로 애니메이션하면 JavaScript에서 높이를 측정하지 않고도 실제 콘텐츠 높이로 열립니다.

### 메뉴 또는 대화상자

```css
.menu { transform-origin: top right; transition: opacity var(--t-ui) var(--ease-out), transform var(--t-ui) var(--ease-out); }
.menu[hidden], .menu.is-closed { opacity: 0; transform: scale(0.97) translateY(-6px); pointer-events: none; }
```

메뉴는 호출한 위치에서 열립니다 (transform-origin을 트리거에 맞춤). scale(0)에서 시작하지 말고 0.95–0.98에서 시작합니다. 중앙 대화상자만 가운데에서 확대할 수 있습니다.

## 7. 시그니처 동작

방향표가 하나를 지정합니다. 아래 동작은 조사한 갤러리 사이트에서 반복해서 발견했습니다.

| 동작 | 화면에서 일어나는 일 | 구현 방법 |
| --- | --- | --- |
| 마스크 헤드라인 | 로드 시 줄이 기준선 아래에서 올라옴 | 마스크 줄 공개 레시피 |
| 셔터 이미지 | hero 또는 showcase 이미지가 가장자리부터 열리고 1.12 배율에서 안정 | 이미지 셔터 레시피 |
| 축소되는 워드마크 | hero가 스크롤로 사라질 때 큰 워드마크가 몇 퍼센트 축소 / 확대 | scale에 스크롤 연동 레시피 적용 |
| 고정 이야기 | 항목이 지나가는 동안 제목 고정 | sticky 레시피 |
| 미리보기 인덱스 | 텍스트 행마다 hover 이미지 표시 | 행에 고정되는 미리보기 인덱스 |
| 커튼형 footer | 끝에 도달하면 페이지 아래에서 마지막 섹션이 드러남 | main에 배경과 z-index를 주고 footer를 position: sticky; bottom: 0으로 배치 |
| 느린 crossfade | hero 사진 3–4장을 5–6초마다 crossfade | 사진 겹치기, opacity keyframes, 탭이 숨겨지면 일시정지 |
| 가장자리 marquee | 매우 큰 글자 한 줄을 천천히 옆으로 이동 | 콘텐츠 복제, translateX(-50%) 선형 루프, hover와 reduced motion에서 일시정지 |
| Drag 행 | 큰 이미지의 가로 스크롤 행과 scroll snap | overflow-x: auto; scroll-snap-type: x mandatory, 라이브러리 없음 |
| 챕터별 색상 | 챕터마다 전체 색면을 사용해 섹션 경계에서 바탕색이 바뀜. 고정 헤더는 아래 챕터의 잉크색을 따라감 | CSS로 섹션 바탕 지정; base.js가 data-ink에서 --header-ink 설정. observer로 페이지 전체 색을 다시 칠하지 않음 |
| Opening window | 타이포그래피 화면에서 큰 사진으로 인계: 고정 스테이지 가운데의 창이 약 한 화면 동안 전체 폭으로 열림 | Opening window 레시피 |
| 잉크 채우기 문장 | 문장 하나가 화면을 지나며 45%에서 완전한 잉크색으로 채워짐 | 잉크 채우기 레시피 |
| 고정 이미지 위 시트 | 전체 화면 사진이 한 화면 동안 고정되고 다음 챕터가 불투명한 시트처럼 위로 올라옴 | 100svh의 position: sticky; top: 0 figure 다음에 자체 배경과 높은 z-index가 있는 섹션. 스크립트 불필요 |
| 가로 갤러리 | 세로 스크롤이 고정 무대 위의 짧은 이미지 행을 수평으로 이동 | 가로 갤러리 레시피 |
| 밀려나는 줄 | 아주 큰 글자 한 줄이 스크롤에 따라 옆으로 밀리고 이동 중간에서 전체가 읽힘 | 줄에 animation-timeline: view(), translateX 12%에서 -12%, linear. 미지원 시 정지 |
| 숫자 롤링 | 핵심을 설명하는 소수의 수치가 한 번 굴러 올라옴 | 숫자 롤링 레시피 |
| 이동하는 사진 | 목록에서 클릭한 사진이 다음 페이지 hero 위치로 이동 | 페이지 간 전환 레시피 |

주제에 따라 선택합니다. 포트폴리오는 미리보기 인덱스, 레스토랑은 느린 crossfade, 제품은 hero 오브젝트에 셔터 효과가 잘 맞습니다. 주제에 대해 아무 말도 하지 않는 동작은 장식이며 페이지에서 빼는 편이 낫습니다.

이전과 같이 주제로 고릅니다: 훌륭한 사진이 하나 있는 제품이나 장소에는 opening window, 각자 사진이 있는 챕터에는 시트, 짧은 객실 / 주방 / 작품 모음에는 가로 갤러리, 주장이 단어 하나인 브랜드에는 밀려나는 줄, 숫자로 앞서는 보고서 / 펀드 / 업무에는 숫자 롤링, 인덱스와 사례 페이지를 함께 만드는 포트폴리오에는 이동하는 사진이 잘 맞습니다.

## 8. Reduced motion과 성능

- prefers-reduced-motion: reduce는 모션을 모두 없애라는 뜻이 아니라 더 적고 부드럽게 하라는 뜻입니다. opacity와 색상 변화를 유지하고 이동, 확대, parallax, autoplay를 제거합니다. 위 레시피는 no-preference 블록 안에 숨김 상태를 둬 reduced-motion 상태가 완성 화면이 되게 합니다.
- transform, opacity, clip-path만 애니메이션합니다. width, height, top, left, margin, padding을 애니메이션하면 매 프레임 레이아웃이 다시 계산됩니다. 아코디언의 grid-template-rows는 짧고 드물게 사용하므로 허용된 예외입니다.
- 부모에서 바뀌는 CSS 변수 하나로 자식 여러 개를 움직이지 말고 움직이는 요소에 transform을 적용합니다.
- will-change는 곧 애니메이션할 요소에만 추가하고 끝난 뒤 제거합니다.
- 화면 밖의 루프와 탭이 숨겨졌을 때 루프를 일시정지합니다.
- 스크롤을 가로채거나 사용자 지정 커서를 만들지 않습니다. 사용성을 해치며 Awwwards 점수의 30%를 차지하고 수상작도 가장 낮은 점수를 받은 영역입니다. 부드러운 스크롤은 Stage.smooth()로만 적용합니다. 터치와 reduced motion에서는 끕니다.

## 9. 생성형 모션을 드러내는 특징

- 모든 블록에 같은 fade-up 애니메이션을 적용.
- hero에 stagger 등장 열두 개를 사용.
- 모든 카드와 이미지에 hover 확대 / 이동을 적용.
- 인터페이스 요소에 bounce / elastic easing.
- 의미 없는 무한 루프: 맥동하는 점, 떠다니는 도형, 반짝이는 텍스트, 회전 배지.
- reveal이 실행되지 않아 페이지에 빈 띠가 남음. 모션 단계를 마친 뒤 inspect.mjs를 실행하고 누락된 콘텐츠가 있는 스크린샷이 있는지 모두 확인.

### 최신 Sites of the Day에서 확인된 항목

연구에서 발견한 패턴, 빈도, 하우스 스타일의 대체 방법입니다.

- **Preloader와 카운터 (99개 중 60개, 그중 26개는 카운터 포함).** 사용 가능한 페이지 절반은 로드 후 2.5초에도 읽기 어려웠고 3분의 1은 4.5초에도 그랬습니다. 대부분 이미 로드된 페이지 위에서 preloader를 표시했으며 3초 이내에 로드된 페이지 29개 중 25개는 4.5초에도 읽을 수 있는 콘텐츠가 없었습니다. 카운터는 멈추거나 로드보다 오래 걸렸거나 뒤에 아무것도 없는 tween이었습니다. 하우스 규칙: preloader 없음. 장면 로딩이 필요하면 HTML 첫 화면 (헤드라인, 사진, 액션)은 즉시 보이고 준비되는 동안 장면을 뒤에서 fade-in합니다.
- **Gate (99개 중 10개): 콘텐츠 전에 진입, 사운드, 연령 확인, 제스처 요구.** 하우스 규칙: 사용하지 않습니다. 사운드는 기본 꺼짐인 페이지 컨트롤로 제공합니다.
- **스크롤 가로채기 (휠 조작 장면 16개, 그중 9개는 무한. 휠이 아무 일도 하지 않는 단일 화면도 14개).** 방문자는 위치, 남은 길이, 빠져나오는 법을 알 수 없고 키보드와 스크린 리더도 사용할 수 없습니다. 사용성 평균은 6.01이며 일반 스크롤 페이지는 6.50이었습니다. 하우스 규칙: 기본 스크롤을 사용합니다. 장면은 끝나는 고정 스테이지에서 스크롤 위치로 구동하고 카운터를 표시합니다.
- **Smooth-scroll 라이브러리 (99개 중 67개).** scrub 장면에 무게감을 주지만 손과 페이지 사이에 지연을 넣습니다. easing이 길면 휠을 멈춘 뒤에도 페이지가 계속 움직입니다.
- **사용자 지정 커서 (99개 중 28개).** 따라오는 커서, 이미지 잔상, 헤드라인을 흐리게 하는 렌즈, hover에서만 나타나는 라벨. 28개 중 10개만 reduced-motion 규칙이 있었습니다. 하우스 규칙: 시스템 커서를 쓰고 라벨은 페이지에 표시합니다.
- **문자 섞기 / 타자기 효과 (11개와 5개).** 헤드라인이 4초 동안 읽히지 않고 본문이 스크롤 중 깨지며 타이핑이 끝날 때까지 동작을 보류합니다. 하우스 규칙: 사용하지 않습니다. 완성된 실제 문구가 처음부터 나타납니다.
- **지나치게 긴 고정 구간.** 고정이 있는 페이지는 두 배로 길고 화면당 단어는 더 적었습니다. 17개 페이지가 20화면 이상이며 일부는 느린 회전만 있는 화면을 여러 장 유지했습니다. 하우스 규칙: 단계당 약 한 화면, 장면당 최대 세 화면이며 모든 고정 화면에 문장 하나를 둡니다.
- **opacity 0으로 숨겨 둔 콘텐츠.** 스크롤이 멈출 때까지 텍스트를 숨기는 reveal, 비활성 항목을 10–15%로 낮춤, 문장을 반투명 상태로 방치. 하우스 규칙: 첫 화면 아래에서만 한 번 reveal하며 화면에 보인 뒤 900ms를 넘기지 않습니다. 비활성 항목은 최소 40%, 잉크 채우기는 45%에서 시작합니다.
- **글자 위를 지나는 모션.** Marquee나 떠다니는 요소가 문장을 가로지르고 슬라이딩 선이 자기 글자를 잘라내며 이동 중 텍스트에 blur를 남깁니다. 하우스 규칙: 방문자가 읽는 텍스트 위로 아무것도 움직이지 않습니다. 움직이는 줄은 이동 중 어느 시점에서든 전체를 읽을 수 있어야 합니다.
- **Overshoot과 bounce (스타일시트 19개).** 하우스 규칙: 인터페이스 요소에서는 계속 금지합니다.
- **끄는 방법이 없는 무한 루프.** 그레인, 맥동 점, 이퀄라이저, 회전 배지 등. 대부분 페이지에는 reduced-motion 규칙도 없습니다. 하우스 규칙: 화면 밖에서는 일시정지하고 reduced motion에서는 멈춥니다.

연구의 동작이 하우스 규칙과 충돌하면 하우스 버전을 사용합니다. 예를 들어 고정 스테이지의 헤어라인 진행 표시줄 / 눈금은 본문 글꼴의 일반 카운터 (“2 of 4”)로, 0을 채운 카운터 (“01/08”)는 일반 카운터나 없음으로, 그라데이션 바탕 간 crossfade는 챕터 경계의 평면 색 하드 컷으로, monospace HUD 라벨은 본문 글꼴의 작은 텍스트로 바꿉니다.

## 10. 모션 규칙

1. **첫 프레임.** 헤드라인, 문장, 사진은 HTML에 들어 있고 첫 프레임부터 그려져야 합니다. 로드 이벤트를 기다리지 않고 시작하며 모션은 1.2초까지 끝나야 합니다. 동시에 움직이는 요소는 최대 네 개.
2. **Preloader, 카운터, Gate, 사용자 지정 커서, 휠 가로채기 금지.** Smooth-scroll은 Stage.smooth()로만 적용 (Lenis lerp 0.1–0.14, 터치와 reduced motion에서 끔). 무게감은 줄 수 있지만 손을 멈춘 뒤에도 페이지를 움직이면 안 됩니다.
3. **곡선.** 600ms 미만은 --ease-out, 800ms 이상 reveal은 --ease-expo, wipe와 이동에는 --ease-in-out, 영구 퇴장에만 --ease-exit, 스크롤 연동과 루프에는 linear, 색상에는 기본 ease. Overshoot 금지.
4. **시간.** 누름 140ms, hover 색상 180–200ms, 이동이 있는 hover 300–400ms, 메뉴 240ms, reveal 700–900ms, 사진 열기 1,100–1,300ms, 퇴장은 대응 진입의 60–70%.
5. **Stagger.** 줄 80–110ms, 목록 항목 50–90ms, 글자 20–40ms (한두세 단어 제목에서만). 한 시퀀스에 네 단계 이하.
6. **Reveal.** 한 번만 실행하고 요소 상단이 viewport 아래쪽 85–90%에 올 때 시작합니다. 줄 마스크 또는 12–32px 상승을 사용합니다. 화면 안에 들어온 콘텐츠를 900ms 넘게 숨기지 않습니다. 첫 화면 위의 콘텐츠가 스크롤을 기다리지 않게 합니다.
7. **스크롤 장면이 페이지의 대담한 부분입니다.** 큰 모션은 장면 라이브러리 (references/scenes.md)에서 선택합니다. 방향표가 페이지당 두세 개를 뽑고 각각 assets/scenes/stage.js 기반으로 한 화면에서 네 화면 동안 고정하며 휴대폰 버전과 완성된 구도를 가집니다. 장면 안에서는 사진이 작은 창에서 전체 화면으로 열리거나, 텍스트가 무대를 가로지르거나, 사진 필드를 카메라가 지나가는 등의 전용 수치를 쓸 수 있습니다. 하지만 8번과 10번은 방문자가 읽는 텍스트에 계속 적용됩니다.
8. **장면 밖의 스크롤 연동 이동은 차분하게.** linear이며 스크롤바에 고정합니다. parallax는 요소의 8% 미만, scale은 0.94–1.15 사이. @supports 안에서 scroll timeline으로 만들고 미지원 브라우저에서는 정지합니다. 기타 고정 스테이지는 sticky를 쓰며 단계당 약 한 화면, 최대 세 화면으로 제한하고 고정된 모든 화면에 한 문장을 둡니다.
9. **각 동작은 하나씩.** 시그니처 동작 하나 (추첨된 장면이 맡을 수 있음), 움직이는 이미지 하나, marquee 최대 하나. 장면 사이에 조용한 섹션을 둬 각 장면이 눈에 띄게 합니다.
10. **텍스트는 계속 읽을 수 있어야 합니다.** 잉크 채우기는 45%에서 시작하고 비활성 텍스트는 40%보다 흐리지 않게 합니다. Blur는 최대 8px이며 정착하면 사라져야 합니다. 읽는 텍스트 위를 움직이는 요소는 금지합니다.
11. **챕터 색상은** 섹션 경계에서 하드 컷으로 바꾸고 고정 헤더 잉크색은 300ms 동안 전환합니다.
12. **가로 이동.** 기본은 native drag 행. 3화면보다 짧은 행만 키보드 지원과 함께 가로 갤러리로 고정합니다.
13. **페이지 간 이동.** view transition을 최대 480ms로 사용하고 reduced motion에서는 끕니다.
14. **Reduced motion.** 숨김 상태는 모두 prefers-reduced-motion: no-preference 안에 둡니다. reduced 페이지가 완성된 페이지여야 하고 루프는 멈춥니다. 수상 페이지 3분의 2가 이를 빠뜨렸습니다. 따라 할 이유가 아니라 구현해야 할 이유입니다.
