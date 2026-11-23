# Motion

모든 페이지는 micro-interaction 레이어를 로드한다. `<html data-motion>`, `ui/cards.css` 뒤의 `assets/motion/motion.css`, `system.js` 뒤의 `assets/motion/motion.js`(module)다(`starter.html`에 셋 다 있다). **It is not optional:** 이를 제거하거나, 건너뛰거나, 덮어쓰지 않는다. 검사가 이에 대해 불평하면 레이어가 아니라 마크업을 고친다. hover 레이어가 없거나 보이지 않는 것은 모든 kind에서 결함이다(라운드 C: 핀테크, 카페, 게스트하우스 페이지가 hover된 카드나 버튼에 변화가 없어서 motion 점수를 잃었다). 정지된 페이지는 결함이 아니다. 동작시킬 마크업을 준다. 링크된 카드는 링크를 담은 `.card`여야 한다(`.m-nolift`는 절대 아니다). 링크로 가는 사진은 `<img>` 주위의 `<a class="m-zoom">`이다(링크된 프레임 안이라면 `img.frame__img`). 버튼은 `.btn`, 본문 안의 링크는 `.link`다. 1440에서 hover된 카드와 hover된 사진을 찍어서 변화를 확인한다. 카드는 2px 올라가고, 사진은 1.03배가 된다. `assets/motion/demo.html`이 모든 인터랙션을 보여 준다. 이 파일은 모든 hover, press, loop, reduced-motion 수치를 담는다. 다른 파일은 여기를 가리킨다.

무엇이 움직일 수 있는지는 kind별로 정한다(house rules 5와 8).
- **Every kind:** hover와 focus 레이어(아래), 그리고 클릭이나 탭으로 일어나는 전환(software의 탭, peek-list의 사진). 모든 변화는 방문자가 일으킨다.
- **Tech:** 카드 visual 안의 loop도 가능하다(diagram 맥동 포함). hero나 `[data-visual]` 프레임의 시간 기반 loop 하나, count 하나, 그리고 `effects-usage.md`가 배분하는 effect, moment, 장면.
- **Other (product, service, place):** hover 레이어만 가능하다. 스스로 움직이는 것은 없다. 로드, 시간, 스크롤에 의한 등장, ticker, marquee, slideshow, 반복되는 사진, 맥동하는 점, count, moment도 없다. 영업 중 표시 줄은 로드 시 한 번 채울 수 있다. 페이지는 그것이 없어도 읽힌다. 제품 렌더는 기본이 still이다. 요청이 있을 때만 live(`data-product-mode="live"`)이며, live는 최대 context 하나를 쓰고, 구석에 일시 정지 버튼이 있으며, 휴대폰과 reduced motion에서는 still이다(`effects-objects.md`).

## Tokens

`--m-in` 140ms(hover 진입), `--m-out` 200ms, `--m-press` 90ms, `--m-panel` 200ms, `--m-slide` 240ms(이동하는 indicator), `--m-image` 600ms, `--m-cycle` 3.2s. tech loop 토큰은 `--m-roll` 700ms, `--m-count` 1000ms, `--m-level` .6s, `--m-bob` 3.2s다. Ease는 모든 UI 단계에 `--m-ease` cubic-bezier(.2,.8,.2,1)를 쓴다. `--m-ease-io` cubic-bezier(.65,0,.35,1)는 이동(travel)에만 쓴다. cubic-bezier(.22,1,.36,1)는 숫자 롤에만 쓴다. loop와 drift는 linear다. bounce와 overshoot는 없다. 거리: 카드 lift 2px, 사진 zoom 1.02~1.03, 화살표 3px, 메뉴 drop 6px, 버튼 step 위로 1px(`.btn--xl`은 2px, `arrow`와 `block` look의 텍스트 링크 secondary는 없음), press는 아래로 1px과 scale .985(그 secondary는 scale만). 그 밖의 거리는 없다(`assets/motion/motion.css`, buttons).

## The hover layer

Hover는 fine pointer에서만 쓴다. 모든 hover 컨트롤은 탭과 키보드로도 동작하며 focus 상태를 가진다. 무엇도 크기가 바뀌거나 이웃을 밀면 안 된다. rotate, skew, glow, shine sweep, chip glide는 쓰지 않는다.

| Part | Motion | Time |
|---|---|---|
| Button | hover 시 fill이 잉크 쪽으로 14% 이동한다(outline은 옅은 fill을 얻고 테두리가 진해진다). 상자는 1px 위로 올라간다(`.btn--xl`은 2px). press 시 rest보다 1px 아래로 가라앉고 .985로 scale된다. 그래서 hover 샷과 press 샷에 각각 움직임이 보인다. `arrow`와 `block` look의 텍스트 링크 secondary는 밑줄을 유지하고 올라가지 않는다(press는 scale .985만). fine pointer에서만. 페이지 CSS는 `.btn`의 `transform`이나 `transition`을 설정하지 않는다 | 140ms 진입, 200ms 퇴장, 90ms press |
| Arrow | `svg.m-arrow`가 3px 오른쪽으로 움직였다가 돌아온다. 페이지에 화살표 스타일은 하나 | 140 / 200ms |
| Link | 밑줄 스타일은 하나이며, 일반 굵기다. 본문과 `.link`는 옅은 1px 헤어라인 위에 있다가, 잉크 선이 왼쪽에서 오른쪽으로 그어지고, 오른쪽으로 빠져나간다. nav와 footer의 단어는 밑줄 없이 있다가 진해지며, 단어에서 4px 아래에 1px 선이 그어진다 | 140 / 200ms |
| Nav | 단어는 그려진 밑줄을 가진다(어떤 kind에서도 미끄러지는 pill은 없다). 패널은 150ms의 의도 뒤에 열리며, 6px drop과 함께 페이드 인하고, 열들이 함께 움직이며, 120ms 안에 닫힌다. 하나가 열려 있을 때 다음 단어를 누르면 즉시 바뀐다. 쉐브론은 tech에서 180도 돌고, 그 밖에서는 즉시 뒤집힌다 | 200ms, 120ms |
| Current page | 현재 nav 단어 아래의 2px 바(`aria-current="page"`) | still |
| Tabs (software, click only) | 하나의 indicator가 클릭된 탭으로 미끄러진다. `system.css`가 그리는 잉크 pill이며, 그 라벨은 ground 색이다. 패널이 바뀐다(최대 200ms). 모든 패널은 고정된 높이 하나를 가진다. 그 밖의 kind에는 탭이 없다 | 240ms |
| Card with a link | 2px 올라가고, 테두리가 한 단계 진해지며, 선택적으로 옅은 그림자(blur 24px, 잉크 10% 이하, hover 때만) | 180ms, 테두리 140 / 200ms |
| Card without a link | 아무것도 없다(`.m-nolift`) | |
| Photograph in a linked card or link | 프레임 안(`overflow: hidden`)에서 1.02~1.03배로 scale된다. 프레임, 카드, 상자는 커지지 않는다. 어둡게 되거나, 페이드되거나, 오버레이를 받지 않는다. 제품 카드의 이름은 이와 함께 밑줄이 그어진다(다른 래퍼는 `.m-zoom`) | 600ms |
| Focus | accent 색의 2px ring이며, offset이 6px에서 2px로 자리 잡는다 | 200ms |
| Field | action 테두리와 3px의 부드러운 ring | 140ms |
| `.m-switch`, `.m-check` (tech) | 누르는 동안 knob이 16px 미끄러지며 4px 늘어난다. 체크 표시가 그려진다. 그 밖의 kind에서는 그냥 바뀐다 | 180, 90, 160ms |
| Copy button (tech) | 글리프가 제자리에서 체크 표시로 바뀌고, 1.5~2초 머물렀다가 돌아온다 | 150ms |

FAQ는 모든 답을 열린 상태로 보여 준다(`system.css`). 아코디언은 없으며, 높이, max-height, padding은 절대 애니메이션하지 않는다. Hook: `[data-m-loop]`(자기 CSS loop, tech), `data-ui-loop`(카드 그룹의 fragment loop 하나, tech), `data-m-count`(tech hero 전용), `.m-link`, `.m-zoom`, `.m-nolift`.

## Loops inside a card's visual (tech)

House rule: 조금 더 빠르고, 반복된다.

- 한 cycle은 2.5~4초(`--m-cycle`, 기본 3.2초)이며 다시 시작한다. 완성된 그림에서 시작하며, 빈 창을 절대 보여 주지 않는다. ui.js fragment는 첫 cycle 전에 그 위에서 600ms 머문다. `[data-m-loop]`은 즉시 시작한다. 각 cycle의 마지막 10~15%는 완성된 그림을 유지하며, reset은 어둡게 하고 다시 쓰지만 비우지는 않는다.
- 포인터나 키보드 focus가 카드에 들어오면 처음부터 다시 시작한다(처음 800ms 동안은 아니다). 일시 정지된 loop는 계속 일시 정지 상태다. 카드, 패널, 창은 움직이지 않는다. 창 안에서 zoom, tilt, 카메라 pan은 없다.
- cycle마다 주체 하나만 있다(포인터가 클릭하고, 상태가 바뀌고, 막대가 차고, 줄이 써진다). 1~2초마다 하나의 변화만 있으며, 각 변화는 300ms 이하다. 여러 주체가 있으면 cycle마다 다음 주체가 움직인다. 바뀌는 라벨은 두 단어를 동시에 보여 주지 않는다.
- 카드 그룹마다 fragment loop는 하나(`data-ui-loop`)다. 나머지 fragment는 완성된 그림을 유지하며, 포인터가 그 카드에 머무는 동안에만 재생된다. 작은 diagram 카드의 맥동은 그 카드 자신의 loop이며, 같은 cycle, restart, pause 규칙을 따른다(house rule: 선을 따라 달리는 맥동). system.js는 이를 붙잡지 않는다(`data-ui-still`은 diagram에 닿지 않는다). hero 아래에서는 같은 화면에 두 loop가 올라오지 않는다. 맥동하는 diagram이 있는 그룹에서는 fragment에 `data-ui-still`을 함께 주거나, diagram에 `data-dg-still`을 준다(그러면 포인터 아래에서만 재생된다).
- 페이지 자체 CSS loop는 `[data-m-loop]` 안에 둔다. 모든 keyframe은 `var(--m-cycle)`을 쓰며, `--m-still`(0~1)은 완성된 프레임이다. 일시 정지 버튼을 위해 48px 띠(`--m-safe`)를 비워 둔다.
- 생명 신호는 움직이는 visual 안에서만 쓴다. 스피너 1초(12~16px, 그다음 체크), 살아 있는 점 2.4초(점은 정지하고, ring이 커지며 사라진다), 캐럿 1초(입력 필드 안에서 딱딱한 step), 레벨 막대 .6초. 타이핑 점은 쓰지 않는다. 다른 곳에서 혼자 맥동하는 점은 쓰지 않는다. 헤드라인 뒤의 블록 커서는 쓰지 않는다.
- 카드 이야기의 종류(각각 고정 높이 상자 안에서): prompt는 초당 12~20자로 타이핑하고 멈춘다. 답변은 초당 약 말풍선 하나씩 스트리밍된다. 알림은 위에서 들어오고 가장 오래된 것은 fade를 거쳐 나간다. 체크리스트는 초당 한 번쯤 체크된다. 캘린더의 일정은 하나씩 페이드 인한다. 포인터는 1초에 약 200px 미끄러지고, 누르며(최소 scale .96, 28px ring), 머문다. 스피커나 아바타의 앞 항목은 3초보다 자주 바뀌지 않는다. 차트는 정지해 있다.
- 아직 배치되지 않아서 쓰지 않는 것: 한 칸씩 움직이는 슬롯 strip, before/after 구분선, 경로를 따라가는 항목, 커지는 dock 탭, 포인터를 따라가는 마스코트, hero 가닥을 따라가는 혜성.

## Tech budget

- **One timed loop** 페이지당 하나. hero나 `[data-visual]` 프레임에 있으며, 형태는 자유다(story, reel, 빛나는 테두리, 살아 있는 ground, 도는 오브젝트, marquee). 그 생명 신호는 이 loop의 일부다. 시간 기반 loop 하나에 effect 최대 하나. 살아 있는 effect가 hero에 있으면 다른 시간 기반 loop는 돌지 않는다. 900px 창 하나에는 스스로 움직이는 것을 두 개 두지 않는다. 패널 하나에는 loop를 두 개 두지 않는다. 카드 loop(카드 그룹마다 하나), diagram 맥동(diagram 카드마다 하나), 배분된 moment는 이 개수에 들어가지 않는다.
- **A count** 페이지당 한 번(`data-m-count` 또는 `counter-rolls` moment. 둘 다는 안 된다). 로드 시 hero에서(1000ms, 최대 1.2초), 또는 배분된 counter moment로 자기 섹션에서. 열린 ground에서만 쓰며, 카드, 패널, `[data-visual]` 안에서는 쓰지 않는다. 폭은 미리 확보하고, 최종 숫자는 HTML 안에 두며, reduced motion, 스크립트 없음, 휴대폰에서 그대로 보인다. 연도, 가격, 전화번호에는 쓰지 않는다. 살아 있는 counter는 마지막 한 자리에서 세 자리만 바뀐다.
- **Load:** hero 텍스트는 모든 kind에서 첫 프레임에 제자리에 있다. 페이드되거나 움직이지 않는다. tech에서는 hero나 `[data-visual]` 안의 로드 시 한 번 움직이는 motion을 최대 하나 둔다(visual이 조립되는 것, 600~1200ms). 1.5초까지 정착한다. 클릭 전환은 400~600ms다. gate, loader, intro는 없다.
- **Pause:** 본 뒤 5초가 지나도 계속 움직이는 것에는 패널마다 하나의 둥근 일시 정지 버튼을 둔다. 32px의 단색 원이며, 오른쪽 아래에서 12px 안쪽에 있다(카드에서는 제목 옆). 항상 보이거나 hover와 focus에서 페이드 인하며, 모든 카드에서 크기와 위치가 같다. 글 위에 두지 않으며, still 위에도 두지 않는다. 클릭하면 프레임이 멈추고 재생 글리프로 바뀐다(자기 mover에는 `ui.pausable(panel, ctrl)`). 스크롤 기반 moment에는 필요 없다.
- **Timed loops start on load** 그리고 스크롤에서 시작, 정지, 재개하지 않는다. IntersectionObserver는 지연 마운트에만 쓴다. canvas는 화면 밖에서 그리기를 건너뛸 수 있지만, 로드 시점의 시계에 따라서만 그렇다. 그래서 돌아왔을 때 보이는 시작 지점이 생기지 않는다. 숨겨진 탭은 모든 것을 일시 정지할 수 있다.

## Scroll

- **Other kinds, and every card on every kind:** 스크롤에 따라 아무것도 애니메이션되지 않는다. pinned나 sticky 장면, scroll-snap, scroll이나 view timeline, 어떤 종류의 reveal(fade, rise, stagger, mask wipe, 글자 채우기, 단어 켜기, 선 그리기)도 없다. parallax, drift, 스크롤에 따라 색이 바뀌는 ground, 진행 줄, scroll-spy 마커, 보일 때 세는 count도 없다.
- **Tech:** 큰 장면과 배분된 섹션 moment 한두 개는 스크롤을 따를 수 있다. 각각 자기 섹션 안에 있다(`data-big-scene`에 `{"hold": 1}`, `data-moment`). 섹션은 1H 또는 2H로 유지된다(`scenes.md`, Its height). 고정하려면 그 박스 안에서 `position: sticky`만 쓴다. 텍스트는 살아 있으며, motion 없이도 보인다(opacity 1, 모든 단계에서 대비 4.5:1). reduced motion과 스크립트 없음은 완성된 still을 보여 준다. 휴대폰은 still이나 가벼운 버전을 받는다(transform과 opacity, WebGL 없음). `perf.mjs`를 통과한다. 카드, 사진, 가격, FAQ, 인용 블록, footer는 절대 움직이지 않는다. 구동 방식은 native `animation-timeline`, 프레임당 한 번 custom property에 쓰는 passive scroll 읽기, 또는 그 섹션에만 범위를 준 GSAP ScrollTrigger(pin 없이)다. smooth-scroll 라이브러리(Lenis, Locomotive, ScrollSmoother)는 어떤 페이지에서도 쓰지 않으며, other에는 animation 라이브러리를 아예 쓰지 않는다.
- 헤더와 휴대폰 바는 스크롤 위치와 무관하게 항상 같아 보인다.

## Reduced motion, no script, phones

색은 여전히 바뀐다. 메뉴는 페이드된다. 탭 indicator는 바로 바뀐다. 밑줄은 이동하지 않고 나타난다(링크, `.m-tab-ind`, `.m-switch::before`, `.m-check::before`에서 `transition-property: opacity, color, background-color, border-color`). 모든 loop, effect, moment, 장면은 완성된 프레임을 보여 준다. marquee는 정지된 행으로 서며, 숫자는 최종 텍스트를 보여 주고, 일시 정지 버튼은 숨는다. 휴대폰에서는 카드 loop와 effect가 완성된 그림이나 poster를 유지하고, 무거운 canvas는 still이 되며, hover 상태와 포인터 시뮬레이션은 없다.

## Never

- 페이지가 스크롤될 때 등장, stagger, 슬라이드, fade하는 카드, 행, 타일. tech 페이지의 배분된 moment와 장면 밖에서 parallax나 스크롤 scrub.
- 기울고, 뒤집히고, scale되고, 포인터를 따라가고, 커서에서 빛나는 카드. magnetic 버튼.
- Carousel, 스스로 넘어가는 slider, 시간에 따라 바뀌는 탭, 돌아가는 알림, 로고 marquee.
- 무작위 깜빡임: 반짝이는 점, glitter, flicker, hue cycling, 섞인 텍스트. 모든 변화는 상태, 단계, 실제 데이터를 보여 준다.
- 한 번만 재생되는 loop(카드 story의 replay 밖), 카드 loop의 cycle이 4초를 넘는 것, 패널 하나에 loop 둘.
- Hover가 자기 token보다 느린 것, overshoot하는 ease, 버튼이 반응하기까지의 지연, 두 번째 밑줄이나 indicator 스타일.
