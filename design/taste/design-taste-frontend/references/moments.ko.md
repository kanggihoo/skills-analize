# Moments

Moment는 award 사이트 스타일의 페이지 부품이다(house rule 8과 house override). 방문자가 기억하는 일을 페이지가 하는 곳, 한 곳이나 두 곳이며, 나머지는 정지해 있다. 각 moment는 `assets/moments/<id>/` 폴더 하나다(`moment.js`, `moment.css`, `meta.json`, 완전한 `demo.html`). `index.json`이 이들을 나열하고, `gallery.html`이 데모를 연결하며, `moments.js`가 이들을 실행한다. 폴더는 열일곱 개다. 둘은 retired(`headline-arrives`, `closing-lift`), 넷은 house 배분에서 빠지며(아래 참고), 열하나가 배분 대상이다. 배분 대상은 statement로 날아드는 글자, liquid 타입, 배경을 바꾸는 원이나 선, 단어 단위로 켜지는 statement, 거대한 타입을 통해 보이는 사진, 고정된 챕터, counter, marquee row, 포인터 light, liquid 사진이다.

**Which pages.** Kind가 software, gaming, tech(hardware는 기술 주제를 다루는 제품 페이지)인 경우에만 쓴다. 짧은 페이지에는 moment 하나, 긴 페이지(섹션 여덟 개 이상, 서로 다른 두 섹션)에는 둘을 쓴다. 셋은 쓰지 않는다. **A plain product, a service, a place, shop, cafe or guesthouse gets none**: 이들은 사진, 타입, 단색으로 시작한다(house override, point 3). `pick`이 이 규칙을 적용한다. `--page`가 필요하며, 그 밖의 kind는 빈 배분을 돌려준다. moment는 페이지의 big scene(`effects-usage.md`)과 함께 beat 하나로 센다.

## Deal them, never choose by taste

```bash
# the section moments: one on a short page, two on eight sections or more (less a hero moment)
node <skill>/scripts/moments.mjs pick --page <kind> --count 1|2 --fits section,statement \
  --exclude lines-rise,picture-develops,window-parallax,word-rotate \
  [--scene <id>] [--effects <ids>] [--contexts <n>] [--photo] --history .taste-skill/history.json
# a hero moment (0 or 1): the same with --count 1 --fits hero; kept only when the dealt hero lists it
```

- **`--page`**는 페이지의 kind다(`SKILL.md` 1절: `software`, `gaming`, `tech`. `ai`, `saas`, `technical-product`도 읽는다). 그 밖의 kind는 `no moment: ...`를 출력하고 빈 배분을 낸다(`--json`은 `"picks": []`와 `reason`). 종료 코드는 0이다. 그러면 계획에는 "no moment"라고 적는다.
- **`--fits section,statement`:** statement는 자기 섹션을 가진다. letters, liquid type, word-highlight, counter는 statement가 있을 때만 배분된다. `section`만 주면 이들은 하나도 배분되지 않는다.
- **Always out:** `lines-rise`(reveal), `picture-develops`(현상되는 사진), `window-parallax`(사진의 parallax), `word-rotate`(`word` hero는 자기 살아 있는 단어를 가진다. `layout-v4.md`). 배분된 장면의 쌍둥이와 avoidMoments는 `--scene <id>` 자체가 뺀다.
- **The hero moment** (0 또는 1개. 큰 장면 hero에는 절대 두지 않는다)은 배분된 hero가 `heroes.json`의 `moments[].id`에 나열할 때만 유지된다. 제외 목록을 적용한 뒤에는 `split`과 `photo`에서 `liquid-hover`, `product`, `collage`, `film`, `centred`에서 `cursor-spotlight`, `statement`(tech, 여섯 단어 이하의 헤드라인)에서 `liquid-type`이며, 나머지에는 없다. 터치가 아닌 기기에서만 동작하며, reduced motion에서는 쉰다. 전체 moment는 최대 두 개다.
- **The WebGL budget.** 페이지는 최대 4개의 live context를 가진다(`perf.md`). 배분은 페이지가 이미 쓰는 양을 합산하며, 자체 `webgl`(`meta.json`에 있다. `liquid-hover`만 1이다)이 합계를 4 넘게 만들 moment는 배분하지 않는다. 큰 장면은 `--scene <id>`로 넘긴다(그 `webgl`은 `assets/scenes/index.json`에서 읽는다). 배분된 각 effect는 `--effects a,b`로 넘긴다(각각 하나로 센다. 최악의 경우다). 그 밖의 것(object, canvas가 있는 component)은 `--contexts <n>`로 넘긴다. 배분 결과는 도달한 총합을 출력한다.
- **The rest of the deal.** 서로 다른 섹션에 배치한다. 히스토리의 `moments` 목록은 사이클로 읽는다. 맞는 모든 moment가 한 번씩 배분되면 다음 사이클은 빈 상태에서 시작한다. 그래서 id는 나머지 모두가 나온 뒤에만 다시 나오며, 자기 바로 뒤에 나오지 않는다(마지막에 배분된 셋은 사이클이 바뀌어도 계속 뺀다). 같은 종류를 둘 두지 않는다(hover와 liquid는 하나로 센다. 페이지당 포인터 effect는 하나다). 같은 슬롯을 둘 두지 않는다. 서로 피해야 하는 둘을 같이 두지 않는다. 사진이 필요한 moment는 `--photo`가 있을 때만 쓴다. 계획에는 각 id와 섹션을 적는다. 배분된 moment에 담을 것이 없으면 `--exclude`에 더해서 다시 배분한다.
- **Retired** (`meta.retired`, weight 0, 배분되지 않음): `headline-arrives`(MO-62, 헤드라인이 로드 시 숨지 않는다)와 `closing-lift`(자기 closing 띠가 필요하며, 그 글자는 사진 위의 gradient에 놓인다). `magnetic-button`(CK-94)은 없어졌다.

## Where each fits

| id | kind · fits | phone and reduced motion |
|---|---|---|
| word-rotate | text · hero, three rounds then rests | 쓰인 단어가 그대로 선다 |
| lines-rise | text · one section or statement, once | 제목과 줄이 그대로 선다 |
| counter-rolls | text · the proof figures, once; never in a card | 숫자가 그대로 선다 |
| word-highlight | scroll · one statement | statement 전체가 잉크색으로 선다 |
| giant-type-pass | scroll · one statement with a photograph of mid to dark tones | 사진이 글자 안에 그대로 서며, 타입은 더 작아진다 |
| letters-assemble | scroll · one statement of 2-5 words, set very large: its letters fly into the line | statement가 쓰인 그대로 선다 |
| pinned-chapters | scroll · one feature section of 2-4 steps, two screens live | 정적인 행(또는 각 단계와 그 아래의 visual) |
| window-parallax | scroll · one wide photograph | 사진이 자기 프레임에서 그대로 선다 |
| marquee-row | scroll · a row of real words (trades, cities, formats; never logos: a logo never moves), with a pause button | 감싸인 행의 단어들 |
| line-carries-colour | transition · a section on a new ground keeps it edge to edge; inside, an inset panel in the old ground (even gutter, card corners) is cleared by a line climbing from its foot; each block shows whole once the line has passed it | 섹션이 자기 ground 위에 그대로 있으며, 패널도 선도 없다 |
| iris-opens | transition · a section on a new ground keeps it edge to edge; inside, an inset panel in the old ground (even gutter, card corners) opens a disc with a hairline accent ring; each block shows whole once the disc holds it | 섹션이 자기 ground 위에 그대로 있으며, 패널도 링도 없다 |
| picture-develops | transition · one photograph with a clear subject, once | 사진이 그대로 선다 |
| closing-lift | transition · the close, with a photograph | 평범한 closing 섹션 |
| cursor-spotlight | hover · the hero frame | 빛이 쉰다 |
| liquid-type | liquid · a hero or statement headline ripples like water under the pointer, an SVG filter, no WebGL | 헤드라인이 쓰인 그대로 선다 |
| liquid-hover | liquid · one photograph with edges and detail, one WebGL context | 평범한 사진, canvas 없음 |

## The still rule (every moment, no exception)

모든 moment에는 **휴대폰**용과 **reduced motion**용 정적 변형이 있다. 또한 스크립트가 없거나 모듈이 실패했을 때의 완성된 상태가 있다. 로더가 결정한다. 로더는 각 moment에 `lib`을 넘기며, 그 `reduced()`는 `lib.still()`에 답한다. `lib.still()`은 `prefers-reduced-motion`이거나 휴대폰(폭 640px 미만, 또는 가로로 돌린 터치 화면이 500px 미만 높이)일 때 참이다. `reduced()`에 맞춰 쓴 moment는 그곳에서 완성된 상태를 보여 준다. 호스트에는 `data-moment-still="reduced"`, `"phone"`, `"card"`가 붙는다. 이 답은 moment가 마운트될 때 정해진다(640px을 넘어 리사이즈된 창은 다음 로드에서 적용된다. `pinned-chapters`는 리사이즈 때마다 다시 묻는다). 각 `meta.json`은 still이 무엇을 보여 주는지 적는다(`reduced`, `phone`). Hover moment는 터치 화면에서도 아무것도 하지 않는다.

**Nothing on a card moves on scroll** (house rule). moment는 hero, statement, 한 섹션, 전환, close에 놓으며, 카드, 계획, 결과, bento 셀에는 놓지 않는다. 로더는 카드 위의 moment가 실행되면 이를 제외한다(`data-moment-still="card"`, `<html>`의 `data-moments-card`). `moments.mjs check`는 이를 결함으로 본다.

## Put one on the page

호스트는 페이지의 섹션이다(텍스트 moment라면 그 안의 헤드라인이나 행). moment 헤더 주석이 보여 주는 대로 표시한다(`data-moment="<id>"`, 옵션은 `data-moment-opts`). 모든 섹션은 한 화면 또는 두 화면 높이로 유지한다(`layout-v4.md`, `--h`). 살아 있을 때나 쉴 때나 같다. 전환의 호스트는 새 ground 위에 있는 섹션 전체이며, statement moment는 h2가 먼저 오는 한 섹션이다. marquee나 counter 행은 위 섹션에 마지막 행으로 합쳐진다. `<head>`에는 한 줄의 스크립트와, 로더, 그 lib, 배분된 moment를 위한 `modulepreload`를 둔다.

```html
<script>document.documentElement.classList.add('mo-js');setTimeout(()=>document.documentElement.classList.add('mo-safe'),2500)</script>
<link rel="modulepreload" href="assets/moments/moments.js"><link rel="modulepreload" href="assets/moments/lib.js"><link rel="modulepreload" href="assets/moments/<id>/moment.js">
```

그다음 로더를 한 번 불러온다. `system.js`가 있는 페이지에서는 `system.js`가 로더를 import하고 기다린다. 없는 페이지에서는 데모 페이지처럼 `<body>` 끝에 태그를 둔다.

```html
<script type="module" src="assets/moments/moments.js"></script>
```

로더는 각 moment의 CSS를 연결하고 실행한다. `<html data-moments-ready>`가 준비 완료를 알린다. 모듈이 실패하면 그 요소에 `data-moment-failed`와 `mo-safe` 클래스가 붙는다. moment의 CSS는 이를 보고 "지금 완성된 상태를 보여 준다"로 판단한다. 데모의 글과 사진은 자리표시자다. 모든 moment는 페이지의 토큰(`--bg`, `--ink`, `--muted`, `--accent`, `--line`, display 서체)을 쓴다.

## Rules

- **The kind's count, an id once.** `<html>`의 `data-moments-over`와 `data-moments-repeat`는 결함이다.
- **No random effects as you scroll.** 스크롤 moment는 스크롤바에 맞춰 자기 섹션 안에서 scrub되며, 섹션은 한 화면 또는 두 화면으로 유지된다. 목적이 분명한 일 하나만 한다. 섹션의 위쪽과 아래쪽에서는 완성된 상태를 보여 준다(모든 전환과 `letters-assemble`은 섹션 위쪽이 화면의 5분의 1 아래에 올 때까지 끝난다). 그래서 각 judge 타일에는 섹션 하나가 온전히 보인다. 카드, 행, 타일은 스크롤될 때 등장하지 않는다. `consistency.mjs`는 배분된 `[data-moment]` 섹션 안의 스크롤 finding을 보고한다. 그것은 예상된 것이며, 다른 것은 결함이다.
- **Content is readable without the motion:** 글은 HTML 안에 최종 위치로 들어 있다. moment는 로드 시 헤드라인을 숨기지 않는다(`headline-arrives`는 이 이유로 retired다).
- **One count a page:** `counter-rolls` 또는 `data-m-count` 중 하나만 쓴다(`motion.md`). 둘 다는 안 된다.
- **Nothing blinks, bounces or overshoots.** Ease-out을 쓰며, reveal은 600~1,000ms다. loop는 자기 round를 돌고 쉬거나, 일시 정지 버튼을 가진다.
- **The page's edges.** moment의 글은 다른 모든 섹션처럼 `.container`나 `.wrap` 안에 있다. 글은 페이지의 왼쪽과 오른쪽 가장자리에서 끝난다. 전환의 cover는 호스트 섹션 안의 안쪽 패널이며, 모든 쪽에 같은 간격이 있다(카드 모서리이며, 섹션 가장자리에 닿지 않는다). 그 선이나 원은 패널 안에 있다. 모든 제목, 문단, 버튼, 사진은 온전히 나타나며, 선이나 원에 잘리지 않는다(각 moment의 `meta.json`, `look`이 방식을 적는다).
- **Cost:** `liquid-hover`(context 하나, 화면 근처에서만. WebGL이 없거나 shader가 실패하면 평범한 사진)를 제외하고는 WebGL이 없다. `liquid-type`은 헤드라인 하나에 SVG filter 하나이며, ripple이 살아 있는 동안에만 켜진다. 다른 모든 moment는 CSS 변수, transform 또는 clip, passive listener 하나의 비용이다.
- **One pointer effect a page:** hover나 liquid moment는 `fx-button`, `fx-spotlight`, 포인터를 따라 도는 오브젝트를 배제한다. 반대도 마찬가지다. `pick`은 이 둘을 같이 배분하지 않는다.
- **Photographs:** `giant-type-pass`와 `liquid-hover`는 중간에서 짙은 톤이며 가장자리와 디테일이 있는 사진을 원한다. 옅은 황혼 하늘은 글자에서 lavender로 보이며, 평평한 바다는 ripple을 보여 주지 않는다. violet이나 lavender는 절대 쓰지 않는다.
- **No captions;** 사진의 크레딧은 footer 줄에 쓴다.

## Check it

- `node <skill>/scripts/moments.mjs check <page.html> --page tech [--scene <id>] [--effects a,b] [--contexts n]`는 완성된 페이지를 읽는다. moment가 몇 개인지, 두 번 나온 것, retired, 페이지 kind와 맞지 않는 것, 카드 안에 있는 것, figcaption을 가진 것, 서로 피해야 하는 둘, WebGL 합계(4와 비교), 로더 누락을 확인한다. 결함이면 종료 코드 1을 낸다.
- `node <skill>/scripts/moments.mjs shoot --out shots/moments --profile <own chrome dir> --port 5720 --only <id> [--reduced]`는 1440과 390에서 데모의 시작, 중간, 끝 상태를 스킬의 headless Chrome(WebGL은 CPU)으로 찍는다. 끝 상태는 완성된 섹션이어야 한다. 390과 `--reduced`에서는 still 규칙도 확인한다. 호스트가 `data-moment-still`을 가져야 하며, 그 안에서 어떤 애니메이션도 돌면 안 된다(그렇지 않으면 `STILL?` 줄이 나온다). `--probe "<js expression>"`은 각 상태 뒤에 값을 출력한다.
- headless Chrome은 WebGL을 CPU로 그리므로, `liquid-hover`는 GPU보다 옅은 ripple을 보여 주며, 끝 상태는 평범한 사진이 되기까지 6초를 기다린다. 텍스트나 스크롤 moment는 두 환경에서 같아 보인다.
