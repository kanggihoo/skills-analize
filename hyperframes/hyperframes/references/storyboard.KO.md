> AI 번역본. 원본: storyboard.md. 분석 근거는 원본이다.

# 스토리보드 레시피 — 사용자가 승인하는 스틸로 영상 기획하기

실행 중에 스토리보드를 만들거나 바꿀 때 사용한다. 사용자가 요청했거나, 애니메이션을 만들기 전에 사용자의 확인을 받고 싶을 때다. 이 파일은 **보드를 만드는 방법**을 다룬다. `storyboard-format.md`는 도구가 파싱하는 `STORYBOARD.md` 파일을 다룬다.

영상의 샷은 `SPEC.md`(`spec.md`)의 SHOTS 줄에서 기획한다. 사용자가 먼저 승인하길 원하면, 스토리보드는 그 샷들을 스틸로 바꾼다. 샷마다 프레임 하나씩이며, 각 프레임은 `reads`와 `sound`를 담는다(`storyboard-format.md`).

사용자는 보드에서 기획을 스틸로 본다. 프레임에 댓글을 달거나 그림을 그리고, 진행하라고 말한다. 보드는 `boards/storyboard.html`이다. 이를 보여주는 도구는 § 2의 클래스로 프레임을 찾는다. 다른 방식으로 표시된 상자(`cell` 상자, `id="frame-NN"` 마커)는 찾지 못한다. HyperFrames Desktop과 `npx hyperframes preview`의 Studio는 미리보기 옆의 Storyboard 탭에 보드를 보여주고, 보드가 쓰이면 앞으로 가져온다. 그러니 보드는 그 탭으로 넘긴다. 미리보기가 실행 중이 아니면 시작하고 링크를 준다. 파일 경로를 주지 않는다. 그 Studio에서 Approve를 누르면 "The storyboard is approved. Build the video from it."가 복사되고, 사용자가 이것을 당신에게 붙여 넣는다. 그것이 사용자의 진행 신호다.

## 1. 실행 순서

1. **샷마다 포즈를 잡는다.** 프로젝트가 렌더링하는 구성, 즉 루트 `index.html`에서 핵심 순간에 맞춘다. 실제 단어, 실제 폰트, 실제 색을 쓴다. 주인공 요소는 휴대폰에서도 읽힐 만큼 크게 둔다. 자체 파일(`compositions/frames/NN-*.html`)에서 포즈를 잡은 샷은, `index.html`에 계획된 시작 시점으로 마운트(`data-composition-src`)된 뒤에야 보인다. `snapshot`은 `index.html`만 렌더링한다. 첫 포즈를 잡기 전에 `index.html`을 `boards/.film.html`로 복사한다. 사용자가 진행을 말하기 전까지 미리보기는 스틸이 아니라 영상을 재생해야 한다(4단계).
2. **한 번의 실행으로 모든 스틸을 스냅샷한다.** 호스트가 스냅샷 도구를 제공하면 그것을 쓴다(각 샷의 초 단위 시간, 출력은 `boards/stills`). 그렇지 않으면 `npx hyperframes snapshot --at <every shot's seconds, in film order> --no-end -o boards/stills`를 쓴다. 각 스틸은 `frame-NN-at-<seconds>s.png`로 이름이 붙는다. NN은 영상에서의 자리 번호다. `snapshot` 실행마다 `-o` 폴더를 비우고 `00`부터 번호를 다시 매긴다. 그러니 단일 순간을 `boards/stills/`에 직접 스냅샷하지 않는다(5단계). 모든 스틸을 직접 본다. 각 스틸이 맞을 때까지 고치고 다시 스냅샷한다.
3. **`boards/storyboard.html`을 쓴다**(§ 2). 완성된 보드처럼 스타일링한다. Inter 또는 시스템 sans-serif를 쓰고, 밝은 페이지에, 각 프레임은 둥근 카드로 만들며, 스틸은 텍스트 위에 둔다. 간격은 고르게 한다.
4. **영상을 되돌린다.** 포즈를 잡은 `index.html`을 `boards/.posed.html`로 복사한 다음, `boards/.film.html`을 `index.html` 위에 다시 복사한다. 보드는 자기 페이지에 머물러야 한다. 미리보기에 고정된 스틸이 있으면 슬라이드쇼처럼 읽힌다.
5. **멈춘다.** 보드를 사용자에게 건네고 진행 신호를 기다린다. 프레임에 대한 메모는 그 프레임만 바꾼다. 메모 하나마다 이렇게 한다. `boards/.posed.html`을 `index.html` 위에 복사하고, 그 프레임을 다시 포즈하고, 그 순간만 `boards/stills/redo/`에 스냅샷한다(`--at <its seconds>`). 그 파일 하나를 프레임의 옛 스틸 위에 옛 이름으로 옮긴다(시간이 바뀌었다면 이름에도 새 시간을 넣고, 페이지의 `src`도 함께 바꾼다). 그다음 영상을 되돌린다(4단계). 페이지를 다시 쓰고 다시 멈춘다.
6. **사용자가 진행을 말하면**, `boards/.posed.html`을 `index.html` 위에 복사하고, 승인된 스틸을 바탕으로 애니메이션을 만든다.

## 2. 페이지

스틸마다 `class="frame"` 상자 하나를 영상 순서대로 둔다. 상자 안에는 이미지, "<두 자리 번호>: <이름>" 형식의 `class="title"` 줄, 초 단위 구간의 `class="time"`을 넣는다. 선택 사항으로, 그 아래에 `class="words"` 줄을 두고, 각 막의 첫 프레임 앞에는 `class="act"` 제목을 둔다.

```html
<section class="act">Act 1: The hook</section>
<div class="frame">
  <img src="stills/frame-00-at-1.5s.png" alt="" />
  <div class="title">01: The hook</div>
  <div class="time">0.0 to 3.0s</div>
  <p class="words">The cursor drops the photo on the timeline; the title lands on the drop.</p>
</div>
```

스틸은 페이지 옆 `boards/stills/`에 쓰인다. 따라서 `src`는 `boards/` 기준 상대 경로이며, `snapshot`이 그 샷에 대해 쓴 파일 이름을 가리킨다. 페이지 뒤에 쓰인 스틸은 저절로 보인다. 그 스틸을 위해 페이지를 다시 열거나 이름을 바꾸지 않는다.

## 3. 옆에 두는 기획 문서

프로젝트 루트의 `STORYBOARD.md`(형식: `storyboard-format.md`)는 같은 프레임을 같은 순서로 적는다. 단어는 페이지의 내용보다 우선한다. 프레임마다 `## Frame 1: The hook (0-3s)`처럼 제목 하나를 쓰고, 막을 나타내는 `- act:` 불릿을 쓰며, 스틸이 포즈를 잡기 전까지는 `- status: outline`으로 둔다.
