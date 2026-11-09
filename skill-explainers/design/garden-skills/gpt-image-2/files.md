# gpt-image-2 분석에서 확인한 파일

스킬 경로: `design/garden-skills/gpt-image-2` · 분석 커밋 `4e3fc895a4a5c4dd6c1e09e21a14bb2d1255ba9d` · 경로는 스킬 폴더 기준이다.

| 구분 | 파일 수 | 바이트 |
| --- | --- | --- |
| 전부 읽음 | 10 | 94,680 |
| 표본(일부 절 읽음) | 16 | 101,670 |
| 구조만 확인(전부 읽지 않음) | 76 | 620,951 |
| 합계(원본 텍스트) | 102 | 817,301 |

## 전부 읽음

| 파일 | 바이트 | 역할 |
| --- | --- | --- |
| `SKILL.md` | 26643 | 지시 본문 |
| `README.md` | 19179 | 모드·환경 변수·출력 규약 소개 |
| `manifest.json` | 580 | 버전과 호환 호스트 |
| `scripts/check-mode.js` | 2213 | 모드 판정 |
| `scripts/shared.js` | 6324 | 환경 읽기, 요청, 저장 |
| `scripts/generate.js` | 5681 | 이미지 생성(Mode A) |
| `scripts/edit.js` | 7078 | 이미지 편집(Mode A) |
| `scripts/package.json` | 67 | ESM 표시 |
| `references/prompt-writing.md` | 24019 | 템플릿 방법론과 관리자용 Phase 계획 |
| `references/editing-workflows/object-removal.md` | 2896 | 편집 워크플로 템플릿 표본(전부) |

## 표본: 일부 절을 읽은 템플릿

적용 범위, 빠진 정보 질문 순서(缺失信息优先提问顺序), 피할 것(避免事项)을 읽었다. 첫 네 파일은 앞부분도 읽었다.

| 파일 | 바이트 |
| --- | --- |
| `references/ui-mockups/live-commerce-ui.md` | 8688 |
| `references/academic-figures/publication-chart.md` | 11594 |
| `references/technical-diagrams/system-architecture.md` | 11788 |
| `references/avatars-and-profile/style-transfer-selfie.md` | 5194 |
| `references/product-visuals/white-background-product.md` | 5876 |
| `references/maps/illustrated-city-map.md` | 5029 |
| `references/slides-and-visual-docs/educational-diagram-slide.md` | 5238 |
| `references/poster-and-campaigns/brand-poster.md` | 4502 |
| `references/portraits-and-characters/professional-portrait.md` | 4733 |
| `references/scenes-and-illustrations/minimalist-mood-scene.md` | 4428 |
| `references/storyboards-and-sequences/anime-key-visual.md` | 4809 |
| `references/grids-and-collages/lookbook-grid.md` | 5563 |
| `references/branding-and-packaging/beverage-label-design.md` | 5226 |
| `references/typography-and-text-layout/title-safe-poster.md` | 4766 |
| `references/assets-and-props/game-screenshot-mockup.md` | 5914 |
| `references/infographics/hand-drawn-infographic.md` | 8322 |

## 구조만 확인(전부 읽지 않음)

`##` 제목 목록, `{argument` 개수, ```json` 블록 개수만 셌다.

| 파일 | 바이트 | argument 수 | JSON 블록 수 |
| --- | --- | --- | --- |
| `references/academic-figures/graphical-abstract.md` | 10415 | 16 | 4 |
| `references/academic-figures/mechanism-diagram.md` | 11533 | 25 | 4 |
| `references/academic-figures/method-pipeline-overview.md` | 12888 | 24 | 5 |
| `references/academic-figures/multi-condition-comparison.md` | 11070 | 19 | 4 |
| `references/academic-figures/neural-network-architecture.md` | 9852 | 9 | 4 |
| `references/academic-figures/qualitative-comparison-grid.md` | 9664 | 19 | 4 |
| `references/academic-figures/research-overview-poster.md` | 11741 | 22 | 4 |
| `references/academic-figures/scientific-schematic.md` | 11136 | 14 | 0 |
| `references/assets-and-props/retro-skeuomorphic-icons.md` | 5453 | 21 | 4 |
| `references/avatars-and-profile/character-grid-portrait.md` | 6682 | 11 | 5 |
| `references/avatars-and-profile/cultural-portrait-series.md` | 5449 | 11 | 5 |
| `references/avatars-and-profile/sticker-set.md` | 5406 | 21 | 4 |
| `references/avatars-and-profile/themed-3d-icon.md` | 5122 | 16 | 4 |
| `references/branding-and-packaging/brand-identity-board.md` | 5806 | 20 | 4 |
| `references/branding-and-packaging/character-merch-board.md` | 15100 | 47 | 3 |
| `references/branding-and-packaging/cosmetic-packaging.md` | 5310 | 19 | 4 |
| `references/branding-and-packaging/full-mascot-brand-doc.md` | 13304 | 9 | 4 |
| `references/branding-and-packaging/mascot-brand-kit.md` | 5593 | 18 | 4 |
| `references/editing-workflows/background-replacement.md` | 3712 | 9 | 0 |
| `references/editing-workflows/local-object-replacement.md` | 3427 | 7 | 0 |
| `references/editing-workflows/portrait-local-edit.md` | 3436 | 4 | 0 |
| `references/editing-workflows/product-retouching.md` | 3300 | 6 | 0 |
| `references/grids-and-collages/ad-banner-multi-grid.md` | 10811 | 33 | 3 |
| `references/grids-and-collages/anime-pitch-board.md` | 5809 | 19 | 4 |
| `references/grids-and-collages/banner-grid-2x2.md` | 5779 | 23 | 4 |
| `references/grids-and-collages/mixed-style-multi-panel.md` | 5762 | 15 | 4 |
| `references/infographics/bento-grid-infographic.md` | 8581 | 10 | 4 |
| `references/infographics/comparison-infographic.md` | 7619 | 18 | 4 |
| `references/infographics/kpi-dashboard-infographic.md` | 9048 | 13 | 4 |
| `references/infographics/legend-heavy-infographic.md` | 6713 | 13 | 4 |
| `references/infographics/step-by-step-infographic.md` | 8151 | 13 | 4 |
| `references/maps/food-map.md` | 7140 | 22 | 4 |
| `references/maps/itinerary-day-trip-map.md` | 13874 | 37 | 4 |
| `references/maps/store-distribution-map.md` | 5549 | 18 | 4 |
| `references/maps/travel-route-map.md` | 5933 | 25 | 4 |
| `references/portraits-and-characters/character-sheet.md` | 5480 | 21 | 4 |
| `references/portraits-and-characters/founder-portrait.md` | 5102 | 18 | 4 |
| `references/portraits-and-characters/pose-reference-sheet.md` | 12743 | 42 | 3 |
| `references/portraits-and-characters/virtual-host.md` | 5006 | 20 | 4 |
| `references/poster-and-campaigns/banner-hero.md` | 4756 | 15 | 4 |
| `references/poster-and-campaigns/biomimetic-concept-poster.md` | 11323 | 22 | 4 |
| `references/poster-and-campaigns/campaign-kv.md` | 4932 | 12 | 4 |
| `references/poster-and-campaigns/character-catalog-poster.md` | 13349 | 42 | 4 |
| `references/poster-and-campaigns/editorial-cover.md` | 5241 | 22 | 4 |
| `references/poster-and-campaigns/lineup-comparison-poster.md` | 12319 | 32 | 4 |
| `references/poster-and-campaigns/vintage-editorial-infographic.md` | 12978 | 41 | 4 |
| `references/product-visuals/ecommerce-marketing-board.md` | 14111 | 40 | 4 |
| `references/product-visuals/exploded-view-poster.md` | 8041 | 28 | 4 |
| `references/product-visuals/lifestyle-product-scene.md` | 7331 | 21 | 4 |
| `references/product-visuals/packaging-showcase.md` | 7209 | 28 | 4 |
| `references/product-visuals/premium-studio-product.md` | 6896 | 22 | 4 |
| `references/scenes-and-illustrations/concept-scene.md` | 4570 | 14 | 4 |
| `references/scenes-and-illustrations/healing-scene.md` | 4511 | 17 | 4 |
| `references/scenes-and-illustrations/picture-book-scene.md` | 4531 | 16 | 4 |
| `references/slides-and-visual-docs/dense-explainer-slides.md` | 5597 | 16 | 4 |
| `references/slides-and-visual-docs/policy-style-slide.md` | 5845 | 23 | 4 |
| `references/slides-and-visual-docs/visual-report-page.md` | 5982 | 29 | 4 |
| `references/storyboards-and-sequences/character-relationship-diagram.md` | 5773 | 16 | 4 |
| `references/storyboards-and-sequences/cinematic-storyboard-grid.md` | 11912 | 29 | 4 |
| `references/storyboards-and-sequences/four-panel-comic.md` | 5842 | 17 | 5 |
| `references/storyboards-and-sequences/manga-spread-page.md` | 5819 | 19 | 4 |
| `references/storyboards-and-sequences/process-photo-board.md` | 14365 | 38 | 5 |
| `references/storyboards-and-sequences/product-tvc-storyboard.md` | 11306 | 28 | 4 |
| `references/storyboards-and-sequences/recipe-process-flowchart.md` | 5805 | 23 | 4 |
| `references/technical-diagrams/er-diagram.md` | 11000 | 5 | 4 |
| `references/technical-diagrams/flowchart-decision.md` | 10158 | 7 | 4 |
| `references/technical-diagrams/mind-map-tech.md` | 9889 | 7 | 4 |
| `references/technical-diagrams/network-topology.md` | 11430 | 6 | 4 |
| `references/technical-diagrams/sequence-diagram.md` | 10805 | 16 | 4 |
| `references/technical-diagrams/state-machine.md` | 10134 | 5 | 4 |
| `references/typography-and-text-layout/bilingual-layout-visual.md` | 5549 | 22 | 4 |
| `references/ui-mockups/chat-interface-scene.md` | 9044 | 24 | 4 |
| `references/ui-mockups/landing-page-case-study.md` | 12686 | 32 | 4 |
| `references/ui-mockups/product-card-overlay.md` | 8502 | 25 | 4 |
| `references/ui-mockups/short-video-cover-ui.md` | 7545 | 29 | 4 |
| `references/ui-mockups/social-interface-mockup.md` | 9366 | 32 | 4 |

## 제외

- `README.zh-CN.md` 18,942B: 영어 `README.md`의 다른 언어판이라 열지 않았다.
- 번역본 `*.ko.md` 96개: 열지 않았다.
- 바이너리: 스킬 폴더에 없다. README가 가리키는 `../../dist/imgs/covers/gpt-image-2.webp`와 외부 사례 이미지는 폴더 밖이라 보지 않았다.
