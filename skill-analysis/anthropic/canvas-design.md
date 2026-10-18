# canvas-design 분석

## 원본

- 원본 경로: `.agents/skills/canvas-design/`
- 핵심 파일: `SKILL.md`
- 보조 파일: `canvas-fonts/`, `LICENSE.txt`
- 확인한 규모: 83개 파일, 약 2,871줄, 폰트 54개와 라이선스 txt 27개
- 성격: 정적인 `.png` 또는 `.pdf` visual art/design artifact를 만드는 창작형 스킬

## 적용 조건

사용자가 poster, static art, design piece, visual design, canvas artwork, PDF/PNG 기반 시각물을 요청할 때 사용한다.

이 스킬은 “문서에 장식을 넣는 것”이 아니라 visual philosophy를 만들고 이를 canvas에 표현하는 방식으로 작동한다.

## 동작 과정

1. 먼저 visual philosophy를 만든다.
   사용자의 요청을 직접적인 레이아웃이나 템플릿으로 바꾸지 않고, 1-2단어 movement name과 4-6문단의 디자인 철학으로 정리한다.

2. 철학은 form, space, color, composition, scale, rhythm, visual hierarchy를 중심으로 쓴다.
   정보 전달은 긴 설명문이 아니라 시각 질서와 공간으로 이루어진다는 전제를 둔다.

3. 사용자의 요청에서 subtle reference를 추출한다.
   이 reference는 작품에 노골적으로 쓰지 않고 form, color, composition 안에 은근히 녹인다.

4. 단일 페이지 canvas를 만든다.
   기본은 한 장짜리 고품질 `.pdf` 또는 `.png`이며, 요청이 있을 때만 multi-page로 확장한다.

5. 텍스트는 최소화한다.
   텍스트는 본문 설명이 아니라 visual accent, label, typographic gesture로 쓰인다.

6. `canvas-fonts/` 폴더를 확인해 적합한 font를 선택한다.
   스킬은 “different fonts if writing text”를 요구하며, 기본 시스템 폰트만 반복하지 않도록 한다.

7. 2차 refinement를 수행한다.
   마지막 단계는 그래픽을 더 추가하는 것이 아니라 기존 composition을 crisp하게 다듬는 방향이다.

## 보조 리소스

`canvas-fonts/`에는 다양한 `.ttf` 폰트와 OFL 라이선스 파일이 포함되어 있다. 확인된 계열에는 ArsenalSC, BigShoulders, Boldonse, BricolageGrotesque, CrimsonPro, DMMono, EricaOne, GeistMono, Gloock, IBMPlexMono, IBMPlexSerif, InstrumentSans, InstrumentSerif, Italiana, JetBrainsMono, Jura, LibreBaskerville, Lora 등이 있다.

## 핵심 규칙

- visual philosophy 먼저, canvas creation은 그 다음이다.
- 결과물은 90% visual design, 10% essential text여야 한다.
- sophisticated하고 museum/magazine quality를 목표로 한다.
- 텍스트와 그래픽은 canvas 경계 안에 있어야 하며 겹치거나 잘리면 안 된다.
- 마지막 refinement는 더 많이 추가하기보다 이미 있는 것을 더 정교하게 만드는 방향이다.
- 기존 작가 스타일을 복제하지 않고 독창적 디자인을 만든다.

## 산출물 특성

- design philosophy `.md`
- 최종 visual artifact `.pdf` 또는 `.png`
- 요청 시 multi-page PDF 또는 여러 PNG
- 시각 중심, sparse typography, 정교한 composition을 가진 artifact

## 주의점

- cartoony하거나 amateur한 방향으로 흐르면 안 된다.
- 텍스트가 많으면 스킬의 “visual-first” 목적과 어긋난다.
- 폰트는 실제 canvas-fonts 자원을 확인해 선택해야 한다.
- 사용자가 “완벽하지 않다”고 말한 상태를 이미 전제하므로, 최종 pass에서 반드시 polish를 강화해야 한다.
