# 71 · 물결 넘김 포스터 — PixiJS 8 · DisplacementFilter · GSAP PixiPlugin

> **가장 중요한 규칙: 기술만 가져간다.** 아래 "화면"은 이 데모가 그린 것이다. 기법을 보여 준 예일 뿐이니 소재·장면·이야기·구도·문구·색은 영상에 옮기지 않는다.
> 노트와 코드를 충분히 읽어 "기법과 원리"의 기술만 가져가고, 장면은 작업 중인 영상의 대본으로 새로 짓는다.

## 화면

10초, 1080×1920. 패션 잡지 「WAVE」 7호의 포스터 네 장이 액체처럼 넘어간다. 색은 토마토 레드, 울트라마린, 애시드 옐로, 크림, 잉크 다섯 가지다.

- **0–0.6 s 시작**: 크림 화면에 토마토색이 아래에서 물결치며 차오른다. 출렁이는 앞면은 변위 필터가 만들고, 이때 RGB가 살짝 갈라진다.
- **0.3–2.5 s 포스터 1 「물결」(토마토)**: 머리글 「WAVE / Nº 07 — SS/27」 아래로 크림색 헤어라인이 그어진다. 울트라마린 원판이 튀어나오고 그 위에서 원형 사진이 조리개처럼 열린다. 사진은 분홍 사이클로라마 위의 광택 있는 파란 덩어리다.
  거대한 「물결」은 자기 줄 마스크 아래에서 한 글자씩 솟아오른다. 이어서 애시드 스티커 「NEW ISSUE」가 탄성 있게 돌며 붙는다. 오른쪽 가장자리에는 세로 글자, 아래에는 Fraunces의 가는 「the liquid issue」와 한국어 본문이 들어온다.
- **2.55–3.4 s 전환 1**: 원형 사진의 중심에서 울트라마린 포스터가 출렁이는 원으로 열린다(아이리스). 이때 변위가 일어나고 RGB가 좌우로 갈라지며 밝기가 번쩍인다. 나가는 포스터는 밀려 들어가고(1→1.1) 들어오는 포스터는 1.14에서 자리 잡는다.
- **2.9–4.95 s 포스터 2 「FLOW / 흐름」(울트라마린)**: 「FLOW」가 아래에서 솟고, 아치 창이 창턱부터 자라며 크롬 물방울 사진을 드러낸다. 오른쪽에서 「흐」「름」이 밀려 들어오고, 토마토색 해가 튀어나오며, 줄무늬가 오른쪽부터 그어진다. 머무는 동안 「FLOW」 위로 물결이 한 번 지나간다.
- **4.95–5.8 s 전환 2**: 애시드 옐로가 위에서 쏟아진다. 떨어지는 앞면은 세로로 번지고(BlurFilter Y), 색은 과포화되며(채도 1.7·대비 1.12), RGB는 위아래로 갈라진다.
- **5.2–7.15 s 포스터 3 「색 / Chroma」(애시드)**: 화면 왼쪽 밖으로 넘치는 울트라마린 「색」이 기울어진 큰 상태에서 자리 잡는다. 토마토 액자가 −120°에서 돌아 들어와 무광 구체 사진을 품는다. 「Chroma」가 솟고, 점 격자는 가운데부터 튀어나왔다가 물결처럼 한 번 줄어든다. 아래의 잉크 띠에 자막이 놓인다.
- **7.15–8.1 s 전환 3(절정)**: 가운데부터 블라인드 12장이 열린다. 가장 강한 액체 변위(440), 가장 넓은 RGB 분리(±44 px), 밝기 1.65배의 과노출 플래시가 함께 온다.
- **7.55–10 s 포스터 4 표지(크림, 여운)**: 마스트헤드 「WAVE」가 위에서 떨어진다. 표지 사진(아크릴 푸어링)이 왼쪽부터 닦이듯 드러나며 끝까지 천천히 줌아웃한다.
  「특집」 라벨, 「물결 넘김」 표제, 팔레트 띠, 울트라마린 하단 띠, 바코드가 차례로 들어오고 「Nº 07」 스티커가 붙는다. 처음의 크림색으로 끝나므로 반복 재생 때 색이 이어진다.

## 기법과 원리

**PixiJS 8**
- **앱**: `autoStart: false`, `sharedTicker: false`, `preserveDrawingBuffer`, `preference: 'webgl'`로 만들고 티커를 멈춘다(`main.js:68`). 그림은 `frame(t)`의 `renderer.render` 두 번(`main.js:250`)이 전부다.
- **그리기 경로**: 포스터 네 장, 전환 마스크, 변위 맵 스프라이트가 `inner`에 있다. 그 위의 `fx` 컨테이너에 `[DisplacementFilter, BlurFilter, ColorMatrixFilter]`를 건다(`main.js:135–139`).
  이 세계를 사방 PAD 96 px 여백이 있는 MSAA RenderTexture(`main.js:141`)에 그린다. 필터는 `antialias: 'inherit'`라서 필터가 켜져도 도형 가장자리가 계단지지 않는다.
- **RGB 분리 = 색 채널 사본 세 장**: 같은 RenderTexture를 스프라이트 셋으로 그린다. 각각 `tint` 0xff0000(normal), 0x00ff00(add), 0x0000ff(add)다(`main.js:144–153`).
  오프셋이 0이면 세 채널의 합이 원본과 정확히 같다. R·B 사본을 반대로 밀면 RGB가 갈라진다. 커스텀 셰이더 없이 틴트 곱과 가산 블렌드만 쓴다.
  여백(PAD) 덕분에 사본을 밀어도 화면 가장자리가 비지 않는다.
- **액체 전환 = 마스크 + 변위**: 들어오는 포스터를 도형 마스크로 연다. 도형은 물결 앞면 다각형(`posters.js:381`), 원(아이리스), 블라인드(`posters.js:393`)다.
  그 위의 `fx`에 걸린 `DisplacementFilter`가 마스크의 직선 가장자리를 액체 앞면으로 바꾼다. 변위 맵은 setup에서 만든 512² 타일 가능 벡터장이다(R = x 밀기, G = y 밀기). 정수 주파수 사인과 도메인 워프로 만들었다(`art.js:234`).
  이 맵을 `addressMode: 'repeat'`로 2.6배 키워 10초 동안 흘려보낸다(`main.js:175`). 그래서 출렁임이 제자리에서 떨지 않고 흐른다.
- **SplitText(Pixi 8 내장)**: 큰 글자들(「물결」「FLOW」「Chroma」「WAVE」「물결 넘김」)을 글자별 Text로 쪼갠다(`kit.js:72`). 글자마다 줄 마스크 아래에서 솟거나(`posters.js:37`) 떨어진다.
- **잉크 상자 배치**(`kit.js:41`): Pixi는 텍스처 상자로 글자를 놓는다. 그래서 canvas `measureText`의 actualBoundingBox와 Pixi가 쓰는 ascent(`CanvasTextMetrics.measureFont`)로 실제 잉크 위치를 구한다.
  헤드라인은 원하는 폭에 맞춰 크기를 정한다(`fitSize`, `kit.js:57`). 그래서 폰트 메트릭이 달라도 구도가 무너지지 않는다.
- **생성 이미지**(`art.js`): 사진 셋은 "스튜디오 촬영" 풍이다(`art.js:75`). 사이클로라마 그라디언트, 색 젤 조명, 접촉 그림자, 키·림·스페큘러 광, 비네트, 필름 그레인으로 만든다. 사물은 광택 덩어리, 크롬 물방울, 무광 구체다.
  표지는 아크릴 푸어링 풍이다(`art.js:182`). 워프된 띠를 팔레트로 칠하고, 띠 경계의 크림 셀 선과 기울기 엠보스를 더한다.
- **NoiseFilter 그레인**: 합성 위에 noise 0.05를 건다(`main.js:155`). seed는 GSAP이 `steps(240)` 이징으로 초당 24번 바꾼다(`main.js:176`).

**GSAP 3.15**
- **마스터 타임라인 하나**(`paused: true`): 위치·크기·회전·알파, 마스크, 필터 세기, RGB 오프셋, 플래시, 그레인 seed가 모두 이 타임라인의 트윈이다.
- **PixiPlugin**: 표시 객체는 `pixi: { x, y, scale, scaleX/Y, rotation(도 단위), alpha }`로 움직인다. 색 행렬 플래시는 `pixi: { brightness, saturation, contrast }`로 낸다(`main.js:192`, `206`, `219`).
  색 행렬은 플러그인이 `fx.filters` 안의 ColorMatrixFilter를 instanceof로 찾아 행렬 원소를 직접 트윈한다. DisplacementFilter의 `scale`과 BlurFilter의 `strengthY`는 플러그인이 다루지 않으므로 GSAP 코어로 바로 트윈한다(PixiPlugin의 `blur`는 v8에서 폐기 예정인 접근자를 쓴다).
- **PixiPlugin과 ESM**: 플러그인은 등록될 때 `window.PIXI.VERSION`으로 v8 여부를 판단한다. 그래서 `pixi-global.js`가 먼저 평가되며 `globalThis.PIXI`를 둔다. 그다음 `registerPIXI(PIXI)`를 부르고 `registerPlugin`을 부른다(`main.js:17`, `main.js:27`).
- **스태거**: 글자에는 `stagger: 0.07–0.1`, 점 격자에는 `stagger: { grid: [4, 5], from: 'center' }`, 블라인드에는 `stagger: { each, from: 'center' }`를 쓴다. `from: 'random'`은 내부에서 Math.random을 쓰므로 쓰지 않는다.
- **CustomEase 'liquid'**: 전환 마스크 전용 곡선이다(`main.js:31`). 출발이 무겁고 가운데를 빠르게 지나 길게 안착한다.
  엘라스틱(스티커), back(원판·해·액자), expo.out(글자), sine(머무는 동안의 흔들림)으로 역할마다 이징을 나눴다.

참고: PixiJS v8 Filters/DisplacementFilter, SplitText 가이드(pixijs.com/8.x/guides), GSAP PixiPlugin(gsap.com/docs/v3/Plugins/PixiPlugin), CustomEase(gsap.com/docs/v3/Eases/CustomEase), Staggers(gsap.com/resources/getting-started/Staggers).

## 결정성 전략

- **타임라인은 멈춰 있고 탐색만 한다**: `frame(t)`는 `tl.time(t, true)`를 한 뒤(`main.js:242`) 한 번 그린다. Pixi 티커와 GSAP 자체 시계에는 아무것도 맡기지 않는다.
- **프라이밍**: 타임라인을 만든 직후 `tl.progress(1).progress(0)`으로 끝까지 한 번 돌렸다가 되돌린다(`main.js:228`).
  모든 트윈이 시간 순서대로 초기화되며 시작값을 기록하므로, 이후로는 같은 t에 대해 앞에서 오든 뒤에서 오든 같은 상태가 된다.
- **트윈 작성 규칙**(`posters.js` 머리말):
  1. 모든 초기 상태는 타임라인을 만들기 전에 직접 대입한다.
  2. `.to()`만 쓴다(`from/fromTo`의 immediateRender를 피한다).
  3. 같은 객체의 같은 속성을 겹치는 시간에 두 트윈이 건드리지 않는다. 연속된 트윈은 앞 트윈의 끝값에서 시작한다.
  4. `lazy: false`를 쓴다.
- **필터 켜고 끄기**: 값을 보고 `enabled`를 정한다(`main.js:246`). 변위 0, 블러 0, 색 행렬이 항등이면 끈다. 포스터의 보이기·숨기기는 전환 일정표에서 t로 정한다(`main.js:231`). 둘 다 탐색한 뒤의 상태만으로 정하는 순수 함수다.
- **난수**: 그레인 seed와 사진의 그레인·먼지·바코드는 `rand(seed)`(mulberry32)로 만든다. NoiseFilter의 seed 기본값은 Math.random이므로 생성자에서 고정한다. 폰트는 Pixi가 처음 측정하기 전에 `fontReady`로 모두 받는다(`main.js:54`). Pixi는 첫 측정값을 캐시하므로, 대체 폰트로 측정된 값이 남지 않게 하기 위해서다.

## 한계와 조정 손잡이

- 이 환경에서는 화면을 보지 않고 smoke만 통과시켰다. 레이아웃은 런타임 측정(잉크 상자·폭 맞춤)이라 메트릭 차이에는 강하지만 시각 검토가 필요하다.
  특히 볼 곳은 다음과 같다.
  - 「물결」 아래 본문이 1640 px 위에서 끝나는지
  - 포스터 4 표지 문구가 사진 위에서 읽히는지
  - 아치 창과 「흐름」 열의 간격
- **실제 GPU 비용**: 평소에는 MSAA RT 1272×2112 한 번, 합성 스프라이트 셋, 그레인 패스 하나다. 전환 중에는 필터 1–3 패스가 더 붙는다. 30 ms 안쪽으로 예상하지만 재지 않았다.
- **변위가 PAD보다 클 때**: 최대 440 × 0.44 ≈ 190 px로 PAD 96보다 커서 가장자리가 클램프되어 늘어난 줄무늬가 잠깐 보일 수 있다(전환 중에만).
- **조정 손잡이**
  - 전환 시각: `posters.js:15` `T` (intro / t1 / t2 / t3). 포스터 등장 시각은 모두 이 값에 상대적이다.
  - 변위 세기: `main.js:180`(시작 150), `main.js:190`(T1 230), `main.js:202`(T2 300), `main.js:216`(T3 440).
  - 변위 맵의 크기와 흐름: `main.js:134` scale 2.6, `main.js:175` 이동량. 맵 모양은 `art.js:234`.
  - RGB 분리 폭: `main.js:181`, `main.js:191`, `main.js:205`, `main.js:218`(dx, dy).
  - 색 행렬 플래시: `main.js:192` 밝기 1.22, `main.js:206` 채도·대비, `main.js:219` 밝기 1.65. 크림 플래시 알파: `main.js:221`.
  - 세로 블러: `main.js:203` strengthY 28. 블러 품질: `main.js:137`.
  - 그레인: `main.js:155` noise 0.05, `main.js:176` 초당 단계 수.
  - 마스크 곡선: `main.js:31` CustomEase 'liquid'. 물결 앞면 진폭: `posters.js:381` amp 44. 블라인드 수: `main.js:128`.
  - 팔레트: `kit.js:14`. 헤드라인 폭 맞춤: `posters.js:95`(물결), `posters.js:133`(FLOW), `posters.js:164`(흐름), `posters.js:207`(색), `posters.js:235`(Chroma), `posters.js:276`(WAVE), `posters.js:302`(표제).
  - 원형 사진의 위치·반지름: `posters.js:50` `ORB`. 아이리스 중심도 이 값을 따른다.
  - 사진 레시피: `main.js:81–102`. 아크릴 띠 밀도: `art.js:195` `NB`.
  - 글자 등장 공통값: `posters.js:26` `rise`, `posters.js:37` `charsIn`(이징, 스태거, 거리).
