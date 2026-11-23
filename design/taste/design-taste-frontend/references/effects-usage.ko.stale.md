# Effects usage

누가 effect를 받는지, 몇 개를 받는지, 어떻게 배분하고 어디에 놓는지 다룬다. effect는 shader, canvas, WebGL, print pass, scroll drive가 만드는 모든 것을 가리킨다. 여기에는 effect ground(`data-fx`, `assets/effects`), WebGL 창작 파트(`effects-creative.md`), 오브젝트와 print(`effects-objects.md`), 큰 장면(`scenes.md`), moment(`moments.md`), film 또는 3D hero, 시간 기반 loop가 포함된다. 카드 세부 사항은 `cards.md`가 우선하고, 모든 타이밍은 `motion.md`가 정한다.

## The gate (house rule 8)

Effect는 site-kind가 tech, software, gaming인 페이지(AI와 개발자 도구도 software에 포함)와, 기술적 주제(하드웨어, 기기)를 다루는 제품 페이지에만 쓴다. 장소, 일반 제품 브랜드나 상점, 서비스 회사, 에이전시, 스튜디오에는 절대 쓰지 않는다. 이들은 site-kind other다.

other 페이지에서는 사진, 타입, 단색이 페이지를 이끈다. 여기서 금지되는 것은 canvas와 WebGL, 자동 재생 video, 모든 CSS gradient(ground, 패널, glow, scrim 포함), SVG pattern이나 texture ground, `backdrop-filter`(nav 포함), `filter`, `mix-blend-mode`, `mask-image`, glass, grain, halftone, dither, duotone, print, `[data-fx]`, `[data-print]`, `[data-scene]`, `[data-big-scene]`, `[data-moment]`, `[data-ui-loop]`, `[data-m-loop]`, `[data-m-count]`, SVG 애니메이션, GIF, Lottie, 커스텀 커서, 모든 scroll 또는 animation 라이브러리다. 허용되는 것은 `fx-map` baked still, 평범한 사진으로 쓰는 `fx-photo`, 실제 아이콘, still diagram(장소에는 불가), 그리고 사진이 없는 실물 제품의 경우 자체 제품 렌더(`[data-product]`, `effects-objects.md`)다. 제품 렌더는 effect가 아니라 제품 사진이다. 기본은 still이고, 요청이 있을 때만 live(`data-product-mode="live"`)가 되며, live는 최대 하나의 context만 쓰고, 플랫 ground 위에 놓고, 그 아래에 poster를 둔다.

## What each kind gets

| | tech | product, service (other) | place |
|---|---|---|---|
| Lead picture | 클라이언트의 UI (하드웨어는 그 사진이나 렌더, 없으면 제품 렌더. effect나 주문 폼만 단독으로 두지 않는다. 게임은 그 이름과 아트, 없으면 product-render helper로 렌더한 key art이며, effect는 그 뒤에 최대 하나만 둔다) | 그 사진들. 사진이 없는 제품은 제품 렌더 | 그 사진들 (원격 장소는 그 지역의 풍경) |
| The one effect | live ground, WebGL 파트, 오브젝트 또는 큰 장면 | 없음 | 없음 |
| Card panel grounds | 효과 계열에서 고른 still 카드 그룹 하나. 큰 장면이 있으면 lit ground(`data-ground`), `data-fx`는 없음 | 클라이언트의 사진 | 없음 |
| Moments | 섹션에 최대 2개, hero에는 최대 1개 | 없음 | 없음 |
| Big scene | 0 또는 1 (그 자체가 effect) | 없음 | 없음 |
| Diagram cards | 0~2개, 맥동 | 0 또는 1개, still | 없음 |
| Loops | 시간 기반 loop 하나, 카드 그룹마다 하나 | 없음 | 없음 |
| CSS grounds | 0~2개 (`backgrounds.md`) | flat tokens | flat tokens |

**The subject before the effect** (테스트에서 확인함: 로봇 팔을 silk shader와 주문 폼으로 보여 준 경우, 이름 없는 게임을 추상 effect로 보여 준 경우, 둘 다 실제 대상을 보여 준 페이지에 졌다). Effect는 제품, 기기, 게임의 세계가 있어야 할 자리를 대신하지 않는다. 사진이나 클라이언트 렌더가 없는 하드웨어와 아트 파일이 없는 게임은 제품 렌더(`effects-objects.md`, Product renders)를 그림으로 쓴다. 게임의 hero 오브젝트이거나 자기 오브젝트들로 이루어진 장면이며, 스테이지에 통째로 놓이고 world 섹션에서는 full bleed로 쓴다. 렌더가 그림이고 effect는 그림이 아니다. 페이지의 effect 하나는 렌더 뒤에 스테이지의 ground로 놓일 수 있다(모든 렌더 배치는 자기 프레임 위에서 투명하다). 이때 effect는 beat로 세며 렌더와 네 개의 context를 나눠 쓴다. effect가 렌더를 대신하지 않으며, 렌더 옆에 두 번째 중심 시각 요소로 놓이지도 않는다.

effect가 아닌 모든 시각 요소, 즉 카드 ground, moment, 장면, 제품 렌더는 실제 UI 캡처나 실제 사진이다. 사진은 어떤 페이지에서도 필터, print, dither, grade 처리를 하지 않는다.

## Tech budget

- **One effect:** live ground 하나(hero ground, 또는 h2 아래 하나의 framed `[data-visual]` 창 안의 ground), WebGL 파트 하나(context를 점유하는 `fx-*`: 버튼 fill, 검색이나 prompt glow, edge-glow plan, spotlight, globe, avatar, logos, progress, dither object, filled headline 또는 stat), 오브젝트 하나, 큰 장면 하나 중 하나다. grain, dither, texture CSS ground도 이 개수에 포함된다. 고정 레이어에 두지 않고, 본문 뒤에 두지 않으며, 페이지 전체를 덮는 canvas로 만들지 않는다. 3D 세계는 hero에만 둔다.
- **Card grounds** (house rule: "gradients and effects ... as a card's background with a smaller card of text or UI on top"): 카드 그룹 하나에는 effect 계열의 조용한 ground를 여럿 둘 수 있다. 이 ground는 한 번 그려서 그림으로 보관하며(system.js가 그 context를 해제한다), 두 번째 live effect로 세지 않는다. 큰 장면이 있으면 moment 밖에서 `data-fx`를 쓰지 않는다(checker가 MO-16, MO-23으로 FAIL 처리한다). 카드 패널은 lit ground(`data-ground`)를 쓴다.
- **Moments** (house rule): 스크롤을 따라갈 수 있는 섹션 moment는 최대 두 개다(letters, liquid, 섹션 전환, counter, marquee row). 각각 자기 섹션에 있어야 한다. 스크롤이 아닌 moment(load, hover 또는 click)는 최대 하나이며 hero나 `[data-visual]`에 둔다. 장면의 섹션 안이나 옆에는 두지 않는다. 전체 moment는 두 개를 넘지 않는다. `fx` 파트로 만든 moment는 자기 섹션에 자기 `data-fx` id를 가지며, 이것이 두 번째 ground가 되지는 않는다.
- **Beats:** effect, 장면, moment가 페이지의 beat이며, tech에서는 최대 셋이다. 계획에서 각 beat의 이름과 섹션을 적는다. 한 섹션에 두 개를 두지 않으며, 이웃한 섹션에도 두지 않는다. 그 사이에는 조용한 섹션을 둔다. 마지막 close 전 페이지 뒤쪽 3분의 1은 조용하게 둔다. CSS ground, 카드 ground, diagram, 카드 loop, hover는 beat가 아니다.
- **One pointer effect** a page: hover나 liquid moment, `fx-button`, `fx-spotlight`, 또는 포인터를 따라 도는 오브젝트 중 하나만 둔다. 둘 이상은 안 된다. 커서를 바꾸지 않으며, magnetic button도 쓰지 않는다.
- **At most four live WebGL contexts** at once (house rule): effect와 moment들의 자체 canvas를 합친 수. `perf.mjs`는 넷을 넘으면 실패한다.

## Deal the effect, never by taste

`node <skill>/scripts/effects.mjs list`는 각 id의 계열, `quiet` 또는 `focal` 구분, 슬롯을 보여 준다. `<kind>`는 페이지의 ground로 `light`, `dark`, `colour` 중 하나다. `<site-kind>`는 software, gaming, tech 중 하나다.

```bash
# the effect: an effect hero takes --slots hero; a photograph or UI hero puts it in the one [data-visual] frame: --slots band
node <skill>/scripts/effects.mjs pick --page <site-kind> --palette <kind> --slots hero --quiet --seed <S> --history .taste-skill/effects-history.json
# one card group's still grounds, same family (a pattern or dither effect: --family mesh)
node <skill>/scripts/effects.mjs pick --page <site-kind> --palette <kind> --slots card --family <the effect's family> --exclude <the effect>,<NOUI> --quiet --seed <S> --history .taste-skill/effects-history.json
```

`--quiet`는 focal ground만 제외하며, pattern은 제외하지 않는다. 슬롯에 UI(창, 조각, 카드 그룹)가 들어가면 pattern과 print를 `--exclude`에 추가한다. `<NOUI>`는 `ruled-grounds,grid-pulse,contour-lines,dot-terrain,dotted-globe,ridgeline,halftone-screen,bayer-dither,ascii-shade,line-engraving,duotone-grade`다.

- **Quiet** ground는 UI를 받치는 고른 바탕이다(`grain-gradient`, `painterly-landscape`, `gradient-mesh`, `silk-folds`, `fluted-glass`). UI 뒤의 부드러운 면이며, pattern은 아니다. **Focal** ground는 주제가 있다(`orb-sphere`, `spotlight-cone`, `god-rays`, `aurora-curtains`, `caustics`). hero에 단독으로 두며, 그 위에 아무것도 올리지 않는다.
- moment 밖에서 페이지당 최대 두 개의 id를 쓰며, 각 패널은 자기 `data-fx-seed`를 가진다. close에 effect를 되풀이하지 않는다. pattern 패널이나 focal 타일을 두지 않는다. `dotted-globe`는 글로벌 도달이 필요할 때 이름으로만, effect 자체로 쓴다. `duotone-grade`는 클라이언트 사진에 쓰지 않는다. `pick`이 어떤 슬롯에도 맞는 것이 없다고 하면 그 슬롯을 뺀다.
- `.ground-inverse` 위의 visual은 그 kind용으로 만든 id를 쓴다(`--palette dark`).
- 폐기되거나 이름이 바뀐 id는 절대 쓰지 않는다. `mesh-gradient`는 `gradient-mesh`이고, `iridescent-foil`은 `fluted-glass`다. `riso-print`, `paper-texture`, `liquid-chrome`은 없어졌다.

## Deal the moments and the scene

**Moments** (0~2개): `moments.mjs pick --page <kind>`로 배분하며, 제외 목록과 hero 규칙은 `moments.md`(Deal them)에 적힌 대로 따른다. 장면과 effect를 넘겨서 WebGL 합계가 넷 안에 머물게 한다. 장면의 섹션이나 그 옆에는 moment를 두지 않는다.

**Big scene** (0 또는 1개, 페이지의 effect): `assets/scenes/index.json`에서 `types`에 페이지의 site-kind가 있고 `needs`를 brief가 충족하는 장면 중 무작위로 하나를 고른다(`scenes.md`의 표). 최근 세 개는 피한다.

```bash
node -e "const fs=require('fs'),f='.taste-skill/scenes-history.json';let h=[];try{h=JSON.parse(fs.readFileSync(f))}catch{}const a=process.argv.slice(1),k=Math.min(3,a.length-1),p=a.filter(i=>!(k?h.slice(-k):[]).includes(i));const id=p[Math.floor(Math.random()*p.length)];fs.mkdirSync('.taste-skill',{recursive:true});fs.writeFileSync(f,JSON.stringify([...h,id]));console.log(id)" <the fitting ids>
```

배분된 장면의 `needs`가 충족되지 않으면 그 id를 빼고 다시 배분한다. 남은 id가 없으면 장면은 없다. 장면은 `restH`가 1일 때만 hero가 된다. 현재 hero용 장면 세 개는 두 화면에서 쉬므로, 배분된 hero 아래에 두 화면짜리 섹션으로 둔다(`scenes.md`, Who gets one). `index.json`의 `avoidMoments`에 든 moment와 함께 쓰거나 그 쌍둥이 장면과 함께 쓰지 않는다. 장면을 `--scene <id>`로 moment 배분에 넘기면, `pick`이 avoidMoments와 쌍둥이를 스스로 뺀다. 마크업과 검사는 `scenes.md`에 있다.

**Its height (rule 3):** `{"hold": 1}`과 `--h`는 `scenes.md`(Its height)가 말하는 장면의 `restH`로 맞춘다. 페이지 CSS는 쓰지 않는다. 장면이 있는 섹션도 다른 모든 섹션과 같이 한 화면 또는 두 화면으로 유지한다.

## Where things sit

- **The effect:** hero(`.frame.frame--hero`가 `.stage.stage--fade-b`를 담거나 hero의 레이어), 또는 h2 아래 하나뿐인 `[data-visual]` 프레임(1440에서 최대 1280x540, 390에서 342x256인 창), 또는 장면의 자체 섹션. `[data-visual]`은 페이지에 하나만 둔다. 프레임 안에 effect가 있는 hero는 오른쪽에 visual을 둔 5/7 또는 6/6 분할로 하거나, effect를 자체 섹션으로 옮긴다. effect가 hero의 레이어일 때(게임의 세계, 초점 ground)는 글이 그 조용한 부분에 놓이며 대비는 4.5:1을 유지한다.
- **Split frame:** `.frame.frame--split`이 `.stage`를 담는다. 창은 `.at-corner.to-edge`로 56/56에 두며 오른쪽과 아래쪽으로 잘린다. 두 번째 조각(`cursor`, `notify`)은 창 오른쪽 아래 모서리(`.at-over`)에만 둔다. 1024~1279와 휴대폰에서는 숨긴다. 텍스트와 UI는 같은 절반을 나눠 쓰지 않는다.
- **Card panels:** `cards.md`(패널, 패널 위의 조각, fade, lit palette, loop)를 따른다.
- **Text over an effect**는 effect의 조용한 부분에서만, 대비 4.5:1 이상으로 쓴다. 노이즈나 안개 ground에는 내용을 두지 않는다.
- **Video** (tech, hero나 `[data-visual]`에서만, effect나 loop로): muted, inline, poster 먼저, 6~12초 loop 또는 한 번 재생하고 마지막 프레임에서 멈추는 이야기, 일시 정지 버튼, 휴대폰과 데스크톱용 파일을 따로 둔다. other에서는 클릭하면 재생되는 still로 영상을 연다.
- **The lit ground** (`<html data-ground>`, tech): system.js가 UI를 담는 모든 ground에 이를 준다. 그래서 page, card, panel, UI가 거의 검은 레이어 네 개로 겹치지 않는다.

## Motion and cost

- effect는 포인터나 시간에 반응한다(장면과 moment는 스크롤에 반응할 수 있다). 조립이 끝나면 멈춰 있으며, 지속적으로 흔들리지 않는다. 주변 순환은 4초 이상이고, 흐름은 초당 몇 px이며, 0.9초 동안 픽셀의 2~10%만 바뀐다. 쉬고 있거나 일시 정지 버튼이 있다. poster를 먼저 보여 주고, reduced motion, 휴대폰, WebGL 실패 시에는 still fallback을 보여 준다. 진입할 때 소리를 내지 않으며, 터치에서는 포인터 재생을 끈다.
- effect는 자기 박스보다 20~25px 크게 그리고 잘라 낸다. CSS px당 샘플은 하나 이하로 하고(크면 0.75), 약 1.5메가픽셀, 픽셀 비율은 최대 1.5로 한다. 노이즈, 파티클, ray marching은 절반 해상도와 30fps 이하로 한다. 노이즈 ground는 시간에 따라 흐르는 하나의 baked texture이며, caustic net은 평평한 바닥 net만 쓴다.
- Blend mode는 effect 안의 역할(예: glint)에만 쓰며, 텍스트에는 쓰지 않는다. 어떤 kind에서도 glass나 frosted 느낌을 내지 않는다. 메뉴 커튼은 평평한 40% dim으로 만든다.
- system.js가 grounds(`ui.grounds`)를 마운트한다. 페이지 스크립트에서 `fx.mountAll`을 직접 호출하지 않는다. shader를 바꾼 뒤에는 `assets/objects/_print-core`와 `_scenes`에서 `lint-glsl.mjs`를 실행한다. GLSL ES 예약어(`flat`, `smooth`, `sample`, `filter`, `input`, `output`...)는 이름으로 쓰지 않는다. 모든 WebGL 파트는 shader가 실패하면 still fallback을 보여 준다. 속도는 `perf.md`를 따른다.

## Never

- other 페이지에 effect, print, grain, gradient, WebGL을 두지 않는다. 사진이 있어야 할 자리에 effect를 두지 않는다.
- 어떤 kind에서도 사진 위에 print, dither, grade, filter를 쓰지 않는다.
- 카드 안에 live effect나 움직이는 canvas를 두지 않는다. 스크롤에 따라 움직이는 카드를 만들지 않는다.
- visual을 설명하는 캡션을 달지 않는다(크레딧은 footer의 한 줄에 쓴다). 깜빡이거나 무작위로 바뀌는 effect를 쓰지 않는다. violet이나 lavender를 쓰지 않는다.
- 사이트의 코드, 에셋, 시그니처 장치를 복사하지 않는다. 일반적인 아이디어만 가져오고, 스킬 자체의 장면과 moment로, 클라이언트의 콘텐츠를 넣어 만든다.
