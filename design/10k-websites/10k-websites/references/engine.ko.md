# 씬 엔진: 히어로 만들기

히어로는 이 스킬과 함께 제공되는 두 파일 `engine/scene.js`와 `engine/scene.css`로 동작한다. 두 파일을 `site/`에 변경 없이 복사한다. 프로젝트를 위해 절대 편집하지 말고, 기억에 의존해 다시 쓰지도 않는다. 대부분의 버그와 낭비된 사용량이 거기서 나왔다. 페이지 고유의 모습은 자체 스타일시트에 두고, 맞춤 코드는 엔진이 게시하는 `--k-p` 변수를 읽는다.

엔진이 이미 처리하므로 직접 쓸 필요가 없는 것들: 고정된 무대, 평활화된 진행률, Blob으로 로드되는 영상(부분 다운로드를 지원하지 않는 호스트에서도 작동)과 로딩 링, 게이트된 탐색(seek), 스크롤 범위에 따라 사라지는 자막, WebGL depth 장면, 포인터 드리프트, 실시간으로 갱신되는 휴대폰 및 동작 감소 게이트, 히어로 아래의 등장 효과, 아무것도 움직이지 않을 때 쉬는 렌더 루프.

## 프로젝트 구조

```
my-site/
  site/            the only folder that goes online
    index.html
    scene.js       copied from the skill's engine/
    scene.css      copied from the skill's engine/
    fx.js, fx.css  the effects library, copied from the skill's engine/ (see effects.md)
    filmtype.js, filmtype.css   words fixed to the film, copied from engine/ (optional)
    filmtrack.js   written by tools/track.mjs (optional)
    pages.css      only for multi-page sites (see pages.md)
    style.css      this site's own look
    assets/        web-ready images and clips only
  photos/          the user's originals (never online)
  review/          candidates, raw renders, check output (never online)
  .10k/
    plan.md        decisions, budget, spend, phase reached
    tools/         copied from the skill's tools/, with node_modules
```

처음 쓰기 전에 도구를 한 번 설정한다(초기 시각/영상 검토 포함). 스킬의 `tools/` 폴더를 `.10k/tools/`로 복사한 뒤, 그 안에서 `npm install --ignore-scripts`를 실행한다(약 1~2분). `.10k/`, `photos/`, `review/`는 압축되는 어떤 것에도 넣지 않는다.

## 히어로 선택하기 (Phase 4, 콘셉트마다 결정)

`shots.md`를 영감으로 쓰고, 이 이야기에 맞는 구조를 고른다. 이것들은 고정된 길이나 닫힌 메뉴가 아니라 출발점이다. 실제로 지원되는 길이와 정확한 모델 설정을 인용한다.

- **스토리 여정.** 예를 들어 설계된 키프레임 세 개(시작, 사건, 드러남)와 클립 두 개: 카메라가 구름을 뚫고 떨어지고, 계곡 위로 터져 나오며, 현관문에 내려앉는다. 부품들이 사방에서 밀려와 조립된다. 물방울이 분수처럼 터지고, 병이 그 속에서 만들어진다. 실제 스틸과 클립의 가격은 `openart.md`를 통해 계산한다.
- **서사시 여정.** 이야기에 볼 만한 네 번째 순간이 있을 때, 키프레임 네 개와 클립 세 개, 약 15초.
- **단일 샷.** 키프레임 두 개와 5초 클립 하나. 브리프에 맞으면 유효한 간결한 이야기다. 크레딧을 아끼려고 승인된 Full throttle 제작을 대신하지는 않는다.
- **레이어드 depth 장면.** 스틸 하나(보통 사용자의 실제 사진을 다듬은 것)와 로컬에서 생성한 depth 맵. 방문자가 스크롤하면 카메라가 천천히 밀고 들어가며, 가까운 것이 먼 것보다 더 많이 움직인다. 적절한 스틸 이미지 콘셉트나 명시적으로 합의된 저비용 경로에 고른다. 크레딧이 부족하다고 해서 Full throttle 영상이 depth로 자동 대체되지는 않는다. 선택된 제작 정책을 보존한다.

이렇게 말한다. "당신의 시작 장면은 10초짜리 영상입니다. [시작], 그다음 [사건], 그리고 [드러남]으로 끝납니다. 재작업 여유를 포함해 약 X 크레딧입니다. 이 방식을 추천하는 이유는..."

## 히어로 마크업

**영상 장면:**
```html
<section class="hero" data-k-hero data-k-span="5" aria-label="Your Business, a short description of the scene">
  <div class="k-stage">
    <video data-k-scrub data-src="assets/hero.mp4" data-src-mobile="assets/hero-m.mp4"
           data-poster="assets/hero-poster.webp" data-poster-mobile="assets/hero-m-poster.webp"
           data-bytes="5400000" muted playsinline></video>
    <div class="shade" aria-hidden="true"></div>
    <div class="k-ring" aria-hidden="true"></div>
    <div class="k-band" data-k-band="0 0.28"><h1>...</h1></div>
    <div class="k-band" data-k-band="0.36 0.62"><p>...</p></div>
    <div class="k-band" data-k-band="0.72 1"><p>...</p><a class="btn" href="#book">...</a></div>
  </div>
</section>
```
`encode.mjs`가 정확한 `<video>` 태그를 출력한다. `--mobile`은 같은 영상에서 무료 세로 클립(`hero-m.mp4`)을 잘라낸다. 그 자르기를 영상 전체에 걸쳐 검사한다. 포스터 한 장만 보지 않는다. 이야기를 잘 전한다면 `data-src-mobile`을 유지한다. 전용 세로 원본이 필요하면 `--name hero-m`으로 따로 인코딩하고, 모바일 속성에 그 클립과 포스터를 쓴다. Full throttle은 자르기가 기술적으로 맞더라도, 결과를 실질적으로 개선할 때 의도적인 세로 제작을 포함한다. `mobile.md`를 참고한다.

**레이어드 depth 장면:**
```html
<section class="hero" data-k-hero data-k-span="3">
  <div class="k-stage">
    <canvas data-k-depth data-image="assets/hero.webp" data-depth="assets/hero-depth.png"
            data-image-mobile="assets/hero-m.webp" data-depth-mobile="assets/hero-m-depth.png"
            data-strength="0.035" data-push="0.06"></canvas>
    <div class="k-plane haze" data-k-layer="0.25" data-k-drift="10" aria-hidden="true"></div>
    <div class="k-band" data-k-band="0 0.45"><h1>...</h1></div>
    <div class="k-band" data-k-band="0.55 1"><p>...</p></div>
  </div>
</section>
```
`depth.mjs`가 정확한 `<canvas>` 태그를 출력한다. depth 장면은 휴대폰에서도 실행된다(세로 자르기에서). 동작 감소 상태에서는 스틸을 받는다.

## 여정의 길이 정하기

- `data-k-span`은 히어로의 길이를 화면 높이 단위로 정한다. 스크롤 거리는 `span - 1`화면이다. 자막이 두 개인 depth 장면에는 3, 자막이 세 개인 단일 샷에는 4, 자막이 세 개나 네 개인 스토리 여정(기본값)에는 5, 서사시 여정에는 6을 쓴다.
- **모든 자막은 최대 강도에서 약 80~130%의 화면 스크롤이 필요하다.** 밴드의 길이(화면 단위)는 `(b - a) * (span - 1)`이다. span 5에서 0.25의 밴드는 정확히 한 화면이다. 밴드 사이에는 약 0.08의 간격을 둬서, 하나가 나가기 전에 다음이 들어오지 않게 한다.
- 첫 번째 밴드는 처음부터 보이고, 마지막 밴드는 끝까지 보인다. 헤드라인을 먼저 두고, CTA를 마지막에 둔다.
- 짧은 비트 여러 개보다 적고 긴 비트가 낫다. 밴드가 검사에 실패하면 줄이지 말고 이웃과 합친다.

## 움직이는 화면 위에서 글자를 읽기 쉽게 하기

라이브 영상은 프레임마다 통제할 수 없는 배경이다. 모든 히어로 자막에는 가장 어두운 프레임에 맞춰 조정한 다음 레이어들을 준다.

1. **기본 음영**: 전체 무대 위에 항상 켜 두어, 어떤 프레임도 텍스트 뒤에서 날것으로 보이지 않게 한다:
   `.shade{position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(ellipse 120% 90% at 50% 45%,transparent 35%,rgb(10 9 8/.55) 100%)}`
2. **자막마다 국소 음영**: 밴드 자체의 페이드를 따라가서, 그 자막이 떠 있는 동안에만 그림을 어둡게 한다. 어둡게 하되 평평하게 만들지 않는다. 가장자리에 닿기 전에 사라지게 한다:
   `.k-band::before{content:"";position:absolute;inset:-30% -12%;z-index:-1;background:radial-gradient(closest-side,rgb(10 9 8/.6),transparent)}`
   정점의 알파는 보통 0.5~0.72 범위다. 가운데 정렬된 주제에 양쪽에 텍스트가 있으면, 열마다 하나씩 두 개의 국소 음영을 쓰고 주제는 밝게 둔다.
3. **레이어드 텍스트 그림자**: 히어로 텍스트에 적용한다(타이트한 가장자리, 중간 번짐, 넓은 감쇠). 버튼에서는 끈다:
   `--k-tshadow:0 1px 2px rgb(8 7 6/.9),0 3px 12px rgb(8 7 6/.7),0 10px 40px rgb(8 7 6/.6)`
4. **작은 라벨에는 칩**: 작고 흐린 배경(scene.css의 `.k-scrim`이 출발점이다).

밝은 장면 위의 어두운 텍스트도 동작한다. 같은 레이어를 반전해서 쓴다. 검사 스크립트는 모든 자막을 가장 어두운 프레임에 대조해 측정하며, 3.5:1 미만은 실패로 처리한다.

## 그림과 함께 움직이는 단어

디자인 패키지의 필름 단서/타입 지도를 프로젝트 자체 CSS/JavaScript로 구현하거나, 아래의 제공된 `filmtype.js`를 쓴다. 핵심 히어로 타입은 선택된 영상의 카메라/피사체 움직임과 관찰 가능한 이동, 크기, 방향의 관계를 가져야 하며, 읽기 위한 plateau가 있어야 한다. 일반적인 등장, 페이드, 또는 순차 효과만으로는 부족하다. 방향은 실제 영상에서 고른다. 보편적인 하강, 기울임, 흩어짐 처리는 없다.

변환은 방문자가 실제로 보는 프레임에서 계산하며, 경과 시간, 한 방향 클래스 트리거, 스크롤만으로 계산하지 않는다. 엔진이 탐색을 게이트하므로 스크롤이 그림보다 앞서 나가고, `--k-p`로 구동되는 타입은 빠른 스크롤 중에 영상과 어긋난다. `filmtype.js`는 이미 표시되는 프레임을 따른다. 직접 쓰는 연출도 같은 방식으로 읽어야 한다(`requestVideoFrameCallback` 미디어 시간과 `seeked`). `--k-p`는 그림에 맞출 필요가 없는 효과에만 쓴다. 역방향 스크롤, 점프, 히어로로 다시 돌아온 뒤에도 같은 프레임은 같은 타입 상태를 준다. 제공된 엔진은 변경하지 않는다. 추가 변환은 프로젝트가 소유한 내부 요소에 준다.

휴대폰 변환, 줄바꿈, 읽기 위치는 세로 영상에 맞춰 작성한다. `transform`과 `opacity`만 쓴다. 주요 액션과 컨트롤은 움직이는 단어에서 떨어뜨리고, 단어가 지나갈 컨트롤은 숨기거나 옮긴다. 정적, 동작 감소, 미디어 실패 상태에서는 커스텀 드라이버와 변환을 끄고, 포스터 위에 완전히 읽을 수 있는 타입을 둔다. 각 헤딩을 하나의 접근 가능한 이름으로 유지한다. 시각적 텍스트는 `aria-hidden="true"`로 두고, 실제 헤딩은 페이지에 남긴다(`data-ft-replaces`가 스크린 리더를 위해 읽을 수 있게 유지하고, 정적 히어로에서 다시 보이게 한다). 의도된 흩어짐에는 시드 난수를 쓴다.

예: 흩어진 점에서 글자가 모이는 효과(글자별로 `--t`, `--x`, `--y`를 분할 시점에 설정):
```css
.ch{--c:clamp(0,(var(--k,1) - var(--t,0))*2.6,1);display:inline-block;opacity:var(--c);
  transform:translate(calc((1 - var(--c))*var(--x,0px)),calc((1 - var(--c))*var(--y,0px)))}
```
`filter` 자체를 애니메이션하지 않는다. 블러에서 선명하게 가려면, 정적으로 블러된 복사본을 선명한 것 아래에 깔고, 두 개의 opacity를 크로스페이드한다.

## 필름에 고정된 단어

가장 강한 영상/타입 관계는 장면 안에 있는 단어다. 벽에 새겨져 있거나, 거리에 서 있거나, 탁자 위에 놓여 있거나, 제품 표면에 붙어 있다. 그 표면이 움직이는 대로 자라고, 미끄러지고, 돈다. 눈으로 움직임을 추측하면 맞지 않는다. 측정해야 한다. 어떤 히어로 영상에도 쓸 수 있도록 두 가지 도구가 제공된다.

- `.10k/tools/track.mjs`는 선택한 표면이 모든 프레임에서 어떻게 움직이는지 측정하고 `site/filmtrack.js`를 쓴다.
- `engine/filmtype.js` + `engine/filmtype.css`(`scene.js`와 마찬가지로 `site/`에 변경 없이 복사한다)는 방문자가 보는 프레임에서 단어를 그 표면 위에 놓는다.

**1. 실제 영상에서 표면을 고른다.** `review.mjs`로 영상을 한 프레임씩 살펴보고, 카메라가 단어를 읽을 만큼 오래 보는 평평하고 눈에 띄게 질감 있는 것들을 목록으로 만든다. 벽, 간판, 가게 앞, 바닥, 탁자 위, 상자, 병, 기기의 면. 각각에 대해 가장 크고 선명하게 보이는 프레임(기준 프레임)과 그 프레임에서 영상 픽셀 기준의 사각형을 적는다. 그 안에서 혼자 움직이는 것(사람, 불꽃, 물, 화면, 반사, 나뭇잎, 바깥이 보이는 창문)을 적어 마스크할 수 있게 한다. 표면이 필요로 하는 모션 모델을 고른다.

| 카메라 / 피사체 움직임 | 모델 |
|---|---|
| 정면 표면을 곧게 밀거나 당김 | `scale` |
| 약간 돌리거나 굴리는 밀기, 옆으로 이동 | `similarity` |
| 거의 같은 각도로 보이는 표면 | `affine` |
| 궤도, 크레인, 기울임, 또는 각도가 변하는 표면(바닥, 땅, 돌아가는 제품 면) | `perspective` |
| 먼 배경을 가로지르는 패닝 | `translate` |

유지되는 가장 단순한 모델을 쓴다. 더 유연한 모델은 노이즈도 따라간다.

**2. 측정한다.** 방문자가 재생하는 클립(원본 마스터가 아니라 `site/assets/hero.mp4`)을 추적해서, 프레임 번호가 방문자의 것과 맞게 한다:
```sh
node .10k/tools/track.mjs surface site/assets/hero.mp4 --name wall --ref 240 --region 712,0,428,425 --mask 645,110,60,330 --model scale
node .10k/tools/track.mjs proof site/assets/hero.mp4 --name wall     # review/track-wall.jpg
node .10k/tools/track.mjs crop site/assets/hero.mp4 site/assets/hero-m.mp4
```
이 도구는 기준 프레임에서 양방향으로 바깥을 향해 추적하고, 스스로 움직이는 디테일을 버리고, 실제 움직임을 지우지 않으면서 결과를 부드럽게 하고, 반복되는 프레임에서는 정지를 유지하며, 그림이 여전히 맞는 구간만 남긴다. 유지된 프레임 수와 그림 검사 결과를 보고한다. **매번 증명 시트를 연다.** 격자가 모든 타일에서 같은 특징에 계속 붙어 있어야 한다. 미끄러지면 마스크를 추가하고, 더 선명한 영역이나 기준 프레임을 고르고, 다른 모델을 쓰거나, `--from`/`--to`로 범위를 제한한다. 영상, 인코딩, 휴대폰 클립이 바뀔 때마다 다시 실행한다.

`encode.mjs --mobile`이 만든 휴대폰 클립은 넓은 영상의 자르기다. `crop`이 그 위치를 찾고, 넓은 화면의 추적이 휴대폰 레이아웃도 구동한다. 전용 세로 영상에는 자체 추적이 필요하다: `track.mjs surface site/assets/hero-m.mp4 ... --variant phone`.

**3. 단어를 놓는다.** 위치와 크기를 기준 프레임(영역을 그린 곳)의 영상 픽셀로 쓴다. 각 `data-ft-at`은 선택적 정렬이 있는 베이스라인 지점이다:
```html
<div class="k-stage">
  <video data-k-scrub ...></video>
  <div class="ft-layer" data-ft-layer aria-hidden="true">
    <div data-ft="wall" data-ft-for="wide" data-ft-fade="178 198 - -">
      <span class="wall-type" data-ft-at="955,244,center" style="font-size:110px">The evening</span>
      <span class="wall-type gold" data-ft-at="955,345,center" style="font-size:110px"><em>is yours.</em></span>
    </div>
    <div data-ft="wall" data-ft-for="phone" ...>...</div>
  </div>
  <div class="k-band" data-k-band="0.7 1"><p class="settle-heading" data-ft-replaces>The evening is yours.</p>...</div>
</div>
<script src="scene.js" defer></script><script src="filmtrack.js" defer></script><script src="filmtype.js" defer></script>
```
- `data-ft-fade="a b c d"`: 프레임 a에서 b까지 페이드인하고, c에서 d까지 페이드아웃한다. `-`는 없음이다. 영상이 끝나기 전에 끝나는 트랙은 마지막 6프레임 동안 스스로 페이드아웃한다.
- `data-ft-depth="1.2"`: 표면보다 가까운(1보다 큼) 또는 먼(1보다 작은) 평면. 카메라가 건물을 향해 밀고 들어갈 때 그 앞에 서 있는 단어에 쓰거나, 옆 방향 이동의 시차에 쓴다. `scale`, `similarity`, `translate` 트랙이 필요하다.
- `data-ft-window="front:862,250,196,470:open"`: 단어가 더 가까운 표면(문, 창문, 아치)의 개구부를 통해 보이는 먼 표면에 있다. 개구부 안에서만 보이고, 그 개구부 자체의 트랙이 끝난 뒤(`open`)에 나타나거나 절대 나타나지 않는다(`hide`). 이것이 없으면 먼 단어가 문틀 앞에 떠 있는 것처럼 보인다.
- `data-ft-for="wide|phone"`: 넓은 화면과 휴대폰 그룹을 따로 두고, 각자의 크기, 줄바꿈, 위치를 준다. 휴대폰 그룹은 자르기에서 같은 표면 위에 있으므로, 휴대폰의 보이는 띠 안에 다시 배치한다.
- 화면 밖으로 나가는 단어는 가장자리에 닿기 전에 페이드아웃한다(`data-ft-edge="off"`는 이를 유지한다).
- 약 15%보다 더 커지는 단어는 가장 큰 크기로 한 번 그려진 뒤, 이후에는 스케일만 바뀐다. 라이브 텍스트는 크기마다 다시 렌더링되어, 커질 때 깜박이거나 맥동한다. `data-ft-paint="on|off"`가 이를 재정의한다.

글꼴, 색, 텍스트 그림자는 span에 걸린 사이트 자체의 CSS에서 온다. 페인팅은 이를 복사한다. 사용하는 모든 스타일에 실제 폰트 파일을 제공한다. 이탤릭용 별도 파일도 포함한다(일반 파일만 있으면 브라우저가 기울인 가짜 이탤릭이 된다). 필름 타입이 대신하는 자막에는 `data-ft-replaces`를 표시한다.

**고정할 평평한 것이 없을 때**(구름, 액체, 연기, 추상적 변형, 질감 없는 가까운 형태), 단어를 가장 안정적인 근처의 것, 예를 들어 배경이나 땅에 고정해서 카메라의 움직임을 함께 공유하게 한다. 또는 위에서 설명한 대로 현재 프레임에 구동되는 영상의 단서에 맞춰 손으로 연출한다. 하드 컷을 가로지르면 트랙이 끝난다. 컷 위로 페이드를 계획하거나, 다음 샷에 별도의 표면을 둔다.

**4. 검증한다.**
```sh
node .10k/tools/typesync.mjs site review
```
데스크톱과 휴대폰에서 앞으로, 뒤로, 점프하면서 스크롤하고, 단어가 놓인 프레임과 화면에 그려진 프레임을 비교한다. 같은 프레임이 항상 같은 단어 위치를 주는지, 동작 감소가 일반 자막을 되돌리는지 확인한다. 또한 `review/typesync-desk.jpg`와 `review/typesync-phone.jpg`를 쓴다. 두 시트를 모두 본다. 단어가 제자리에 있는지, 가장 어두운 프레임 위에서 읽을 수 있는지, 주요 액션과 컨트롤에서 떨어져 있는지 본다. 그다음 실제 페이지를 직접 천천히 그리고 빠르게 스크롤한다. 정지 이미지로는 떨림이나 맥동을 보여 줄 수 없다. `check.mjs`는 여전히 일반 자막의 대비와 타이밍을 측정한다.

## 평면과 스크롤에 연결된 조정

- `data-k-layer="0.3"`은 요소를 히어로 전체에 걸쳐 위로 0.3화면만큼 움직인다. 음수 값은 아래로 움직인다. `data-k-drift="12"`는 데스크톱 포인터를 따라 최대 12px까지 움직인다. 평면은 안개, 빛줄기, 먼지, 앞쪽 프레임, 장면 속에 있는 것처럼 느껴져야 하는 헤드라인에 쓴다.
- **움직이는 평면은 이동 거리만큼 무대보다 높아야 하거나, 양 끝에서 페이드아웃해야 한다.** 그렇지 않으면 가장자리가 단단한 선으로 화면에 미끄러져 들어온다.
- 그 밖의 것은 CSS에서 `--k-p`를 읽을 수 있다. `.hero .shade{opacity:calc(.4 + var(--k-p)*.4)}`는 이야기가 끝나갈수록 음영을 짙게 한다. 따뜻한 오버레이가 이야기 끝에서 페이드인할 수도 있다. 엔진을 건드리지 않고도 사이트마다 고유한 조정을 얻는 방법이다.

## depth 장면 조정

- `data-strength`는 가까운 것이 얼마나 움직이는지다. 0.02는 은은하고, 0.035가 기본값이며, 0.06은 강하다. `data-push`는 천천히 확대되는 정도다. 0.04~0.1.
- depth는 분명한 가까운 요소, 중간의 주제, 먼 배경이 있을 때 가장 잘 읽힌다(시작 프레임을 그렇게 계획한다. `design.md` 참고). 평평하고 정면을 향한 장면은 깊이가 거의 보이지 않는다.
- 얇은 가까운 디테일(머리카락, 난간, 하늘을 배경으로 한 식물 잎)은 가장자리에서 번질 수 있다. 접촉 시트에 번짐이 보이면 `data-strength`를 낮추거나, `depth.mjs`를 `--blur 4`로 다시 실행한다.
- 실제 사진도 생성된 사진만큼 잘 작동한다. 먼저 다듬고, 그다음 depth 맵을 만든다.

## 정적 히어로

세로 클립이 없는 휴대폰, 동작 감소, 로드 실패 상태에서는 모든 자막이 쌓인 포스터를 보여 준다. 이것은 사과가 아니라 설계된 레이아웃이다. 390px 너비에서 확인하고, 쌓인 자막에 여유를 주며, 멀리 스크롤하지 않아도 CTA가 보이게 한다.

## 도구

프로젝트 폴더에서 실행한다:
```sh
node .10k/tools/encode.mjs review/hero-raw.mp4 site/assets --mobile --focus 0.5   # scrub-ready clip, poster, phone crop
node .10k/tools/depth.mjs review/hero-still.png site/assets --mobile --focus 0.5  # web image + depth map + phone crop
node .10k/tools/check.mjs site review                                        # desktop and phone journey checks
node .10k/tools/preview.mjs site --port 8080                                # safe local site preview
node .10k/tools/review.mjs review/hero-joined.mp4 --port 8081                 # film playback, seeking, frame steps
node .10k/tools/track.mjs surface site/assets/hero.mp4 --name wall --ref N --region x,y,w,h   # measure a surface
node .10k/tools/typesync.mjs site review                                     # words stay on the frame shown
```
- `encode.mjs`는 기본적으로 실제 디코딩된 마지막 프레임을 포스터로 쓴다. `--poster last|SECONDS`로 의도적으로 고르고, `--poster-only`로 영상을 바꾸지 않고 포스터만 고친다. 지원되는 WebP 대체 수단은 libwebp가 없는 FFmpeg 빌드를 처리한다.
- `--focus`는 휴대폰 자르기의 중심으로, 0(왼쪽)부터 1(오른쪽)까지다. 전체 영상의 주제/액션 위치에서 정하고, 그다음 세로 접촉 시트 전체를 검사한다.
- 처음 `depth.mjs`를 실행하면 작은 depth 모델(약 27MB)을 한 번 내려받는다.
- `check.mjs`는 컴퓨터에 이미 설치된 Chrome 또는 Edge를 쓴다. 히어로를 순회하며 죽은 스크롤, 자막 타이밍, 대비를 측정하고, 휴대폰과 동작 감소를 검사하며, `review/contact-sheet.png`, `review/phone-top.png`, `review/phone.png`를 쓴다. 또한 여러 뷰포트에서 휴대폰 영상을 순회하며 세로 접촉 시트를 쓴다. 이야기 전체에서 주제의 프레이밍을 이것으로 검사한다. 자동 탐색 검사는 구성을 보증하지 않는다. 전체 페이지 이미지가 너무 높아 읽기 어려우면 하단 페이지 자르기를 쓴다.

## 자체 테스트 (사용자가 무엇인가를 보기 전에)

1. `check.mjs`가 고칠 것이 없다고 보고할 때까지 실행한 뒤, 데스크톱과 휴대폰 여정 이미지, 그리고 읽을 수 있는 하단 페이지 캡처를 검사한다.
2. 모든 버튼과 링크를 실행하고, 폼을 제출한다.
3. 격리된 미리보기에서 히어로 자산 요청을 차단하고 다시 로드한다. 페이지는 포스터 위에서 완전해야 한다. 이후 정상 로딩을 복구한다. 라이브 자산의 이름을 바꾸지 않는다.
4. 잘린 텍스트의 글자 꼬리(g, y, p)를 확인하고, 무엇인가 페이지를 옆으로 밀지 않는지 확인한다.
5. 데스크톱과 휴대폰 재생에서 작성된 모든 타입/영상 단서를 검토한다. 앞으로/뒤로 움직임, 임의의 탐색, 크기 변경, 히어로로 돌아오기를 테스트한다. 같은 위치가 드리프트 없이 같은 타입 상태를 재현하는지 확인한다. 사이트가 `filmtype.js`를 쓰면 `typesync.mjs`를 실행하고, 모든 `track.mjs proof` 시트를 검사한다. 읽을 수 있는 정지 구간과 정적/동작 감소/미디어 실패 구성을 확인한다. 자동 검사와 정지 캡처만으로는 모션 동기화를 확인할 수 없다. 실제 페이지도 직접 본다.
6. 마지막으로 처음 보는 방문자의 눈으로 보는 확인. 모든 요소가 자리를 얻을 만한가? 나란히 있는 항목들이 동등한가? 어떤 구간이 채움처럼 읽히는가? 발견한 것을 고치고, 고친 내용을 보고한다.
