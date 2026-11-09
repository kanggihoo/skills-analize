# The Hero-Video Laws and Prompt Construction

생성하기 **전에** 모든 샷을 이 법칙들로 설계한다. 이 법칙들은 야심 찬 컨셉을 통제 가능한 이미지로 바꾸는 데 도움이 된다. 첫 시도에서 성공을 보장하지는 않는다. 실용적인 출발점일 뿐이다. 모델 선택과 탐색은 선택된 생산 등급을 따른다.

## The twelve laws

1. **The motion agrees with the scroll.** 스크롤을 내릴 때 움직임이 아래로 가는 것, 열리는 것, 도착하는 것으로 읽혀야 한다. 쏟아짐, 하강, 해체, 접근처럼. 모든 컨셉에 대해 물어본다: "방문자가 아래로 스크롤할 때, 이 움직임이 아래로 느껴지는가?" 방문자가 스크롤 내릴 때 피사체가 위로 날아가면 페이지와 싸우게 되고, 결국 항상 진다.

2. **One coherent story.** 필요한 모션과 사용 가능한 모델 컨트롤에 맞춰 연속 take 또는 chain을 고른다. clip 개수를 미리 정하지 않는다. 공유 키프레임은 외형을 제약하지만 끝점의 속도를 제약하지는 않는다. 정확히 맞춘 hard cut이 가장 깨끗한 join일 수 있다. 실제 프레임과 속도를 검사한다. 복잡한 평면 뷰 변형에는 모델이 정체성과 해부학을 유지할 수 있다는 근거가 필요하다. 동기가 있는 가림(occlusion)은 한 take 안이나 segment 사이에서 제어를 제공할 수 있다. 연결된 전환에서는 호환되는 방향과 속도를 이어 간다. 경로와 take 방법은 `shots.md`를, 증거 프로토콜은 [visual-validation.md](visual-validation.md)를 쓴다.

3. **Lock the path, free the body.** 궤적은 고정되어 있어도, 그 위의 피사체는 살아 있어야 한다. 자연스러운 움직임, 물결, 작은 조정. 장면에도 생명이 필요하다. 흩어지는 수증기, 흐르는 구름, 바뀌는 빛. 피사체를 얼려서 샷을 안정시키지 않는다. 깨끗한 경로 위에서 얼어 있는 피사체는 죽은 영상처럼 보인다.

4. **Plan the ending first.** 마지막 프레임은 페이지가 멈추는 곳이다. 그러니 합성되고 만족스러운 도착을 프롬프트에 명시적으로 써 넣는다: 컵이 카운터에 놓인 상태, 제품이 조립된 상태, 목적지에 도착한 상태. 어색한 끝은 어색한 웹사이트를 만든다. 엔딩이 제품 쇼케이스라면, 전체 제품 위아래로 넉넉한 여백을 두고 구도를 잡는다. 사이트 header가 프레임 위쪽에 겹치고, cover crop은 넓거나 짧은 화면에서 가장자리를 잘라낸다. 위가 잘린 제품은 사고처럼 보이고, nav에 붙은 제품은 복잡해 보인다. 문제를 완전히 피하는 방법은 자를 것이 없는 전면 텍스처로 끝내는 것이다. 그러면 모든 화면에서 텍스트 안전 영역이 보장된다. 승인 전에 header를 덮은 상태로 엔딩 프레임을 넓은 창과 짧은 창에서 확인한다.

5. **Plan for difficult detail.** 유체, 대기, 재질은 보통 잘 렌더링된다. 익숙한 해부학, 손, 얼굴, 복잡한 제품은 능력 있는 모델, 정체성 지원, 더 가까운 검사가 필요하다. 필요하면 참조나 통제된 구도를 쓴다. 가장 쉬운 레시피를 따르느라 브랜드를 정의하는 피사체를 숨기지 않는다.

6. **Prefer a vertical motion axis.** 위아래로 곧게 이어지는 여정은 스크롤 축과 일대일로 맞아, reveal이 두 방향 모두에서 페이지와 함께 움직인다. 필수는 아니지만, 두 컨셉이 동등하면 수직 쪽을 택한다.

7. **Compose picture and typography together.** 컨셉 설계 단계에서 액션 레인, 텍스트 크기와 위치, 움직임의 관계, 읽을 수 있는 정지 상태를 함께 계획한다. 가독성이 허용하면 글자가 액션을 감싸거나, 따라가거나, 프레임을 만들 수 있다. 사이트를 완성하기 전에 wide와 phone 레이아웃에서 treatment를 증명한다.

8. **Sell the boundary crossings.** 카메라가 표면을 통과할 때(물속으로, 안개를 통과해, 유리를 지나서), 물리적인 렌즈 순간을 프롬프트에 쓴다. 물방울, 렌즈에 맺힌 물, 잠깐의 블러. 경계를 깔끔하게 통과하면 가짜처럼 읽힌다. 엉망인 순간이 사실감을 만든다.

9. **If the hero features a product, brand it or frame it close.** 브랜드가 없는 일반적인 물체를 멀리서 보여주면 placeholder처럼 읽힌다. 애니메이션 전에 이미지 편집으로 브랜드 마크를 넣거나, 물체의 디자인이 전달될 만큼 가까이에서 끝나도록 엔딩을 쓴다.

10. **Text over footage earns its legibility.** 텍스트 뒤의 라이브 영상은 프레임마다 통제할 수 없는 움직이는 배경이다. 그러므로 모든 텍스트 밴드에는 가독성 시스템이 필요하다. 밴드가 활성일 때만 짙어지는 국소 scrim(글자 뒤의 부드러운 어두운 그라데이션), 실제 text shadow, 그리고 평균이 아니라 그 밴드의 **가장 나쁜** 프레임에 대한 대비 검사. 각 밴드는 해당 프레임에서 가장 차분한 영역에 둔다. 밴드에서 가장 바쁜 순간에 한눈에 읽히지 않는 줄이라면 실패다. 작업 레이어는 `engine.md`에 있고, `check.mjs`는 모든 캡션을 최악의 프레임과 비교해 측정한다.

11. **Pace text in scroll distance, not seconds.** 스크롤 사이트는 24fps로 재생되는 것이 아니라 flick으로 읽힌다. 모든 캡션 비트에 긴 완전 표시 plateau(밴드의 대부분, 일반 스크롤 flick 여러 번을 견딜 만큼)를 주고, 가장자리에는 짧은 easing 램프를 둔다. 그래야 독자가 두 번의 flick 사이에 텍스트가 튀어나왔다 사라지는 것을 보지 않고, 한 줄을 읽으려고 완전히 멈추지 않아도 된다. 실제 방문자처럼 flick 스크롤해서 비트 맵을 테스트한다. 천천히 드래그하는 방식으로 테스트하지 않는다. 크기 규칙은 `engine.md`에 있고, `check.mjs`가 flick 테스트를 실행한다.

12. **Preserve identity and review honestly.** 요청하지 않은 글자와 마크는 제외하되, 승인된 제품 글자와 로고는 보존한다. 디자인된 샷을 해치는 일반 프리셋은 거절한다. 승인된 핵심 이미지를 사용해 초기 작업용 visual treatment를 보여 주고, 임시 영상임을 명확히 표시한다. 최종으로 취급하기 전에 전체 필름을 검증한다. 현재 `SKILL.md`의 승인/위임 정책을 따른다. 렌더링 중에도 골격과 독립적인 섹션은 진행할 수 있다. 장면 정체성, 디테일, 참조 역할, 변경 후 리뷰 무효화는 [visual-validation.md](visual-validation.md)를 쓴다.

## Prompt construction

### Start frame template (image, 16:9, high resolution; preflight the price with `openart_model_cost`)

비디오 히어로에서는 `shots.md`의 키프레임 방법을 먼저 적용한다. 즉, REST 프레임을 먼저 설계하고, 그 프레임으로 각 이전 키프레임을 새 샷으로 만든다. 아래 템플릿은 여전히 좋은 시작 프레임을 설명한다.

구도를 모션의 첫 프레임으로 만든다. 여정이 시작될 수 있도록 피사체를 배치한다.

```
[SUBJECT] at [POSITION IN FRAME], composed as the first moment of a motion
that will [ONE-SENTENCE JOURNEY]. [LIGHTING: source, direction, mood].
[PALETTE: the three to five brand colors described as materials and light,
not hex codes]. [ATMOSPHERE: the ambient life the scene carries]. Intentional
negative space at [WHERE THE CAPTIONS WILL LIVE]. Cinematic, photorealistic,
16:9. No unrequested text or logos. Preserve approved product marks.
```

**The negative-space phrasing trap: 빈 공간을 어둠이나 공허함으로 명명하지 않는다.** 캡션을 위한 공간을 남길 때는, 장면을 프레임 가장자리부터 가장자리까지 채워진 하나의 연속된 세계로 묘사하고, 차분한 영역도 그 세계의 일부로 둔다. 예: 부드러운 그림자, 멀어지는 깊이, 평평한 표면. "좌우에 넉넉한 빈 어둠"이라고 요청하면 모델이 실제 검은 측면 패널을 그려서 재시도 비용이 든다. 결과를 확인한다. 가장자리부터 가장자리까지 쓰는 표현은 이 실패를 줄이지만 성공을 보장하지는 않는다.

같은 함정의 대칭 사례도 있다. 구도에 가운데 정렬된 피사체가 필요하면, "centered"만으로는 부족하다. 피사체가 프레임을 정확히 둘로 나누며, 왼쪽 가장자리와 오른쪽 가장자리에서 같은 거리에 있다고 명시한다. 양쪽 절반을 하나의 동일한 treatment로 묘사하고, 양쪽의 물체, 기계 부품, 밝은 하이라이트를 명시적으로 금지한다. 실제 빌드에서는 이 표현에 도달하기까지 세 번 시도해야 했다.

사용자가 제공한 실제 사진이 컨셉에 맞으면, 그 사진을 시작 프레임으로 쓴다. 먼저 다듬는다(`openart.md`의 fidelity와 retouching 레시피). 캡션 공간을 확장에 포함해 16:9로 확장한다. 애니메이션 전에 다듬어진 프레임이 원본과 충실한지, 해상도와 구도가 맞는지 확인한다. 비디오 프롬프트에서는 실제 제품을 보이는 그대로 정확히 묘사하고, 모션 전체에서 모양, 라벨, 색을 바꾸지 말라고 지시한다.

피사체가 실제 사람(사업주, 셰프, 제작자)이면, 그 사람의 사진은 시작 프레임이 아니라 참조 이미지로 넣는다. 캐릭터 참조를 받는 모델로 시작 프레임을 만들고, 프롬프트에 알아볼 수 있는 특징(머리, 안경, 옷차림)을 다시 적는다. 상표를 검사하듯 닮음도 검사한다. 닮음은 브랜드 일관성의 디테일이다. 조금 어긋난 얼굴은 사이트 전체를 실패로 만든다. 그리고 어떤 얼굴이든 생성하기 전 하나의 엄격한 규칙이 있다: 사용자 본인의 사진이거나 사이트 출연에 동의한 사람의 사진만 쓴다. 다른 사람의 사진이라면 생성 전에 멈추고 묻는다.

### Still for a layered depth scene (resolution selected for the production plan)

사진 자체가 히어로이므로, 사진이 스스로 깊이를 가져야 한다. 프롬프트를 세 가지 거리에 맞춰 구성한다:

```
[FOREGROUND ELEMENT close to the camera, partly framing the view], [MAIN SUBJECT]
in the middle distance, and [BACKDROP] far behind. Eye-level camera, the view
reaching deep into the scene. [LIGHTING]. [PALETTE as materials and light].
A calm, softly lit area at [WHERE THE CAPTIONS WILL LIVE], part of the same scene.
Sharp from front to back, no motion blur. Photorealistic, 16:9. No unrequested text or logos.
Preserve approved product marks.
```

밝은 배경 앞의 얇은 가까운 디테일(머리카락, 난간, 전선, 하늘을 배경으로 한 나뭇잎)은 피하라. 장면이 움직일 때 번진다. 카메라를 정면으로 보는 넓고 평평한 벽은 깊이를 거의 보여 주지 않는다. 프레임은 포스터이기도 하므로, wide와 phone 구도를 모두 검사한다. 승인된 생산 계획에서 요구하면 전용 portrait 스틸을 쓴다.

### Video template (one controlled take, sound off; model, duration and quality from the approved production plan)

```
One continuous shot, no cuts. [SUBJECT] [VERB OF THE JOURNEY: pours, descends,
approaches, assembles] from [START STATE] to [END STATE] along [THE EXPLICIT
TRAJECTORY: starting distance/height, travel direction, passage and ending bearing].
The [SUBJECT] stays alive throughout: [SMALL NATURAL MOTION: ripple, sway,
micro-adjustments]. The scene stays alive: [AMBIENT LIFE: drifting steam,
shifting light, streaking cloud]. [IF A BOUNDARY IS CROSSED: the physical
lens moment, e.g. a splash and droplets on the lens with a beat of blur].
[PACE CURVE and observable beat timing]. [ENDING: continue through the boundary
with the specified direction and speed for a following clip, OR decelerate only
into the final arrival]. [END COMPOSITION: what sits where and what the light does].
No unrequested text or lettering.
Preserve approved product marks.
```

생성 품질과 delivery 크기를 분리한다. 선택된 등급과 샷이 정당화하면 고품질 master를 고른다. 디테일이나 리프레이밍을 개선하는 더 높은 해상도도 포함한다. Full throttle은 품질 우선이므로, 일괄적인 720p/1080p 상한을 적용하지 않는다. 이후 효율적인 웹 파일을 인코딩하고, 압축 후에도 의도한 이미지가 유지되는지 확인한다. 사운드가 승인된 경험의 명시적 일부가 아니라면 사운드는 끈다.

## Choosing and assembling takes

듀레이션과 비트 타이밍은 승인된 스토리에서 정한다. 실제 모델 능력과 모션 근거를 가지고 연속 take와 chain을 비교한다. 연속된 카메라 경로가 중요하고, 중간 끝점 제약 때문에 반복해서 정착(settling)이 생기면 continuous take를 고른다. 이때 중간 구도는 모델이 제약할 수 없다면 가이드로만 취급한다. 독립적으로 제어되는 상태나 동기가 있는 전환이 join을 정당화하면 chain을 고른다. clip을 많이 쓴다고 드라마가 커지지 않으며, 하나의 take가 품질 하락을 의미하지도 않는다. 의존적인 생산을 하기 전에 [visual-validation.md](visual-validation.md)가 요구하는 대표 파일럿을 실행한다.

Chain이 정당화될 때는 다음과 같이 한다:

1. 공유 키프레임을 계획한다(`shots.md`). 인접한 clip은 같은 join 화면을 목표로 한다. 대표적인 모션과 정체성 검사를 통과한 뒤, 소스는 현재 위임 정책에 따라 승인되고 비용이 확보되면, 독립적인 clip을 동시에 렌더링할 수 있다. 생성된 끝점은 여전히 다를 수 있으므로 검사해야 한다.
2. Join의 양쪽에서 호환되는 방향, 조명, 속도를 설명한다. 페이스 변화는 부드럽고 의도적이어야 한다. Clip이 거의 빈 프레임이나 검은 프레임에서 시작하면, 그 안에서 무엇이 나타나는지 묘사한다. 프롬프트로 쓴 연속성은 렌더링된 연속성의 증거가 아니다.
3. 각 clip은 수용 전에 검사한다. 수정 허용량을 쓰기 전에 거절 원인을 진단한다. 국소 결함이라면 한 번의 교체가 필요할 수 있다. 반복된 내부 정지라면 다른 take 구조가 필요할 수 있다. 전체 필름을 자동으로 재생성하거나, 같은 실패한 요청을 반복하지 않는다.
4. Clip을 대신 추출한 프레임에서 이어 가야 할 때(rescue 또는 end frame이 없는 모델), 승인된 clip의 마지막 프레임을 ffmpeg로 full-quality PNG로 추출한다(정확한 명령은 `ffmpeg-recipes.md`). 리뷰용 jpg로는 이어 붙이기에 충분하지 않다. 업로드하고(`openart.md`), 다음 `startFrame`으로 넘긴다.
5. RAW segment를 하나의 고품질 중간 파일로 정규화한 뒤, 웹용으로 join된 필름을 한 번 인코딩한다(`ffmpeg-recipes.md`). 먼저 matched cut으로 시작한다. 공유 끝점이 중복된다는 것을 프레임 단위로 확인했을 때만 중복 프레임을 제거한다. 실제 join을 개선하는 경우에만 짧은 blend를 쓴다. 인코딩 파라미터를 맞추면 기술적 불일치는 막지만, 시각적 불연속은 고치지 못한다.
6. Join된 파일을 일반 재생, 0.5배속, 양방향 프레임 step으로 검토한 뒤, 휴대폰 버전도 검토한다. `shots.md`에 설명된 review player를 쓴다. Duration과 승인된 비트를 기록한다. 한 seam만 수정할 때는 이를 보존한다. 실질적인 페이싱이나 장면 변화는 창작상의 결정이 필요하다.

마지막 segment에만 합성된 정지 엔딩(법칙 4)이 필요하다. 중간 segment는 모션 도중에 끝나야 다음 segment가 이어 갈 수 있다.

예상된 움직이는 끝점이 멈춰 보인다면, 카메라 이동과 잔여 텍스처 또는 잎의 움직임을 구분한다. 마지막 프레임만이 아니라 마지막 접근을 검토한다. 실패한 경로를 숨기기 위해 샷을 줄이거나 리타이밍하지 않는다. 더 넓은 창작 변경이 승인되지 않았다면 승인된 내용과 페이싱을 보존한다.

**The seam law: texture identity does not carry over.** 각 생성은 시작 프레임에서 미세 텍스처를 다시 상상한다. 위치는 이어지지만, 정확한 직조, 그레인, 피부는 이어지지 않는다. 그래서 구체적인 텍스처가 있는 rest-to-rest join은 모션 벡터가 완벽해도 보이는 컷으로 드러난다. 모든 seam은 모션 안에서, 또는 텍스처 갱신을 정당화하는 순간(렌즈를 가로지르는 스윕, 블러 비트, 잠깐의 어둠, 빛의 변화) 안에서 떨어지도록 스토리보드를 짠다. 두 rest 상태를 구체적인 텍스처 위에서 맞대지 않는다. Seam이 보이면, 수정을 고르기 전에 양 끝점과 근처 프레임을 검사한다. Matched cut, 확인된 중복 프레임 제거, 짧은 blend, 또는 대상 clip 재생성 중에서 고른다. Blend는 고스팅을 만들 수 있으므로 자동 구제책이 아니다.

**Which worlds may simplify chaining:** 빛, 입자, 대기는 인식 가능한 해부학과 텍스처 제약을 줄일 수 있다. 그래도 모션과 join 검토는 필요하다. 생산을 쉽게 하려고 피사체의 핵심 세계를 바꾸지 않는다.

## Declining presets

생성기는 가끔 프롬프트에 패턴을 맞춰 샷을 생성하는 대신 내장 프리셋을 제안한다. 거절하고, 그대로 된 프롬프트로 재시도한다. 디자인된 샷은 법칙을 따르고 레이아웃에 맞게 구성된다. 프리셋은 둘 다 하지 않는다.

## Cost preflighting

단일 생산 등급 및 승인 정책은 `SKILL.md`와 `openart.md`를 따른다. 모든 정확한 호출은 `openart_model_cost`로 preflight하고, 승인된 견적과 반복 허용량 기준으로 비용을 계산한다. 사용자는 생산 계획과 의미 있는 변경을 승인한다. 이미 그 승인에 포함된 일상적인 호출로 사용자를 방해하지 않는다.

의도한 샷에 대해 현재의 근거로 모델과 설정을 추천하고, 창작 결과와 예상 비용을 쉬운 말로 설명한다. Full throttle은 워크플로우 전체에 최상위 GPT를 쓰고, 현재 가장 강력하고 적합한 image 및 video 모델을 고품질 설정과 의도적인 탐색으로 쓴다. 더 저렴한 기본값이나 clip별 상한을 다시 도입하지 않는다. 지출을 실질적으로 늘리는 경우에는 수정된 구체적 제안이 필요하다. 허용량이 무제한 지출을 뜻하지는 않는다. 잔액이 승인된 경로를 감당하지 못하면, `SKILL.md`의 기존 가입/크레딧 안내를 따른다.
