# theme-factory 분석

## 원본

- 원본 경로: `.agents/skills/theme-factory/`
- 핵심 파일: `SKILL.md`
- 보조 파일: `theme-showcase.pdf`, `themes/*.md`, `LICENSE.txt`
- 확인한 규모: 13개 파일, 약 462줄
- 성격: 문서, 슬라이드, HTML artifact 등에 적용할 color/font theme을 선택하거나 생성하는 스타일링 스킬

## 적용 조건

사용자가 artifact에 일관된 theme, color palette, font pairing, professional styling을 적용하고 싶을 때 사용한다. 슬라이드 deck styling이 주요 목적이지만 다른 artifact에도 적용할 수 있다.

## 동작 과정

1. 먼저 `theme-showcase.pdf`를 보여준다.
   사용자가 10개 preset theme을 시각적으로 보고 선택하게 한다. showcase 파일은 수정하지 않는다.

2. 사용자의 theme 선택을 묻는다.
   명시적 confirmation 없이 임의로 theme을 적용하지 않는다.

3. 선택된 theme 파일을 `themes/`에서 읽는다.

4. theme의 color palette와 typography를 artifact 전체에 일관되게 적용한다.

5. contrast와 readability를 확인한다.

6. preset 중 맞는 것이 없으면 custom theme을 만든다.
   입력 설명에 맞는 색상/font 조합과 theme name을 만들고, 검토 후 적용한다.

## preset theme 목록

- Ocean Depths: deep navy, teal, seafoam, cream
- Sunset Boulevard: burnt orange, coral, warm sand, deep purple
- Forest Canopy: forest green, sage, olive, ivory
- Modern Minimalist: charcoal, slate gray, light gray, white
- Golden Hour: mustard yellow, terracotta, warm beige, chocolate brown
- Arctic Frost: ice blue, steel blue, silver, crisp white
- Desert Rose: dusty rose, clay, sand, deep burgundy
- Tech Innovation: electric blue, neon cyan, dark gray, white
- Botanical Garden: fern green, marigold, terracotta, cream
- Midnight Galaxy: deep purple, cosmic blue, lavender, silver

## 핵심 규칙

- 먼저 showcase를 보여주고 선택을 받아야 한다.
- showcase PDF는 수정하지 않는다.
- 선택된 theme file을 읽은 뒤 적용한다.
- 색상과 font는 artifact 전체에서 일관되어야 한다.
- contrast/readability를 유지해야 한다.
- preset이 맞지 않으면 custom theme을 생성하고 review를 거친다.

## 산출물 특성

- theme이 적용된 slide deck, document, report, HTML artifact
- 선택된 theme specification
- custom theme specification

## 주의점

- theme을 자동으로 골라 버리는 스킬이 아니라 사용자 선택을 받는 스킬이다.
- theme은 장식이 아니라 artifact 전체 identity를 통일하는 역할이다.
- 적용 대상의 기존 구조와 정보 hierarchy를 망가뜨리면 안 된다.
