# slack-gif-creator 분석

## 원본

- 원본 경로: `.agents/skills/slack-gif-creator/`
- 핵심 파일: `SKILL.md`
- 보조 파일: `core/easing.py`, `core/frame_composer.py`, `core/gif_builder.py`, `core/validators.py`, `requirements.txt`
- 확인한 규모: 7개 파일, 약 1,280줄
- 성격: Slack에 적합한 animated GIF를 PIL 기반으로 만들고 최적화/검증하는 스킬

## 적용 조건

사용자가 Slack용 animated GIF, emoji GIF, message GIF를 만들어 달라고 할 때 사용한다. 예: “Slack에서 쓸 X가 Y하는 GIF 만들어줘”.

## 동작 과정

1. GIF 용도를 정한다.
   emoji GIF면 128x128, message GIF면 480x480을 권장한다.

2. FPS, duration, color count를 정한다.
   emoji GIF는 3초 이하, 10-30 FPS, 48-128 colors를 기준으로 한다.

3. `GIFBuilder`를 생성한다.
   width, height, fps를 지정한다.

4. PIL로 frame을 생성한다.
   `Image.new`, `ImageDraw`를 사용해 shape, line, polygon, ellipse, text를 그린다.

5. 필요하면 user-uploaded image를 PIL로 로드한다.
   사용자가 직접 animate를 원하는지, reference로만 쓰길 원하는지 구분한다.

6. easing 함수를 사용해 motion을 부드럽게 만든다.
   bounce, pulse, spin, fade, slide, zoom, particle burst 같은 animation concept을 조합한다.

7. frame을 builder에 추가하고 GIF로 저장한다.
   `num_colors`, `optimize_for_emoji`, `remove_duplicates`를 사용해 Slack에 맞게 최적화한다.

8. validator로 결과를 확인한다.
   `validate_gif` 또는 `is_slack_ready`를 사용한다.

## 보조 모듈 역할

- `core/gif_builder.py`: frame collection, GIF 저장, 색상 최적화, emoji mode, duplicate frame 제거
- `core/validators.py`: Slack dimension/file readiness 검사
- `core/easing.py`: linear, ease in/out, bounce, elastic, back, squash/stretch, arc motion
- `core/frame_composer.py`: blank frame, gradient background, circle, text, star helper
- `requirements.txt`: pillow, imageio, numpy 의존성

## 핵심 규칙

- emoji font rendering에 의존하지 않는다.
- prebuilt graphic library가 있다고 가정하지 않는다.
- PIL primitives로 직접 그린다.
- outline은 1px처럼 얇게 두지 말고 충분히 두껍게 한다.
- 색상 대비, depth, highlight, glow, pattern 등으로 placeholder처럼 보이지 않게 한다.
- 파일 크기를 줄여 달라는 요청이 있을 때만 frame/color/dimension 최적화를 적극 적용한다.

## 산출물 특성

- Slack emoji용 128x128 animated GIF
- Slack message용 480x480 animated GIF
- 최적화된 색상 수와 FPS를 가진 GIF
- validator 결과

## 주의점

- 이 스킬은 animation logic을 대신해 주는 rigid template 모음이 아니다.
- Slack GIF는 작게 보이므로 두꺼운 선, 명확한 silhouette, 강한 대비가 중요하다.
- 480x480 message GIF와 128x128 emoji GIF는 설계 기준이 다르다.
