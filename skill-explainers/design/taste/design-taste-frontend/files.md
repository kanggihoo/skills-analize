# design-taste-frontend 읽은 파일 목록

대상: `design/taste/design-taste-frontend` (commit `4e3fc89`). 스크립트는 하나도 실행하지 않았다. 번역본(`*.ko.stale.md`, 분석 중 새로 생긴 커밋되지 않은 `*.ko.md`)은 열지 않았다.

| 구분 | 파일 수 | 바이트 |
|---|---|---|
| 끝까지 읽음 | 19 | 347,624 |
| 검사 기준 위주로 일부 읽음 | 13 | 1,327,112 |
| 구조·표본만 확인(전부 읽지 않음) | 1,435 | 7,300,211 |
| 제외한 바이너리 | 151 | 25,144,954 |
| 제외한 번역본(커밋됨) | 13 | - |

## 끝까지 읽은 텍스트 파일 19개

`references/` 5개(sections, sections-library, photos, effects-creative, effects-objects)는 분석 보조 에이전트가 `cat -n`으로 끝까지 읽고 줄 번호와 함께 요약했다. 나머지는 분석자가 직접 읽었다.

| # | 경로 | 바이트 | 역할 |
|---|---|---|---|
| 1 | `SKILL.md` | 21111 | 본문. house rule 9개, 업종 표, 페이지 계획, 자산 표, 제작 순서, 체크리스트, Never |
| 2 | `references/copy.md` | 10355 | 문구 규칙, 가정해도 되는 것, 연락처, 금지어 |
| 3 | `references/system.md` | 10710 | token, 글자, 색(보라 금지), 버튼, nav, footer, 폼 |
| 4 | `references/layout-v4.md` | 22429 | 한 화면 한 섹션, 콘텐츠 높이 구간, hero 11종, 격자, 글꼴, `check.mjs` finding |
| 5 | `references/sections.md` | 55009 | 화면 단위 계획, 템플릿 부품 뽑기, 업종별 섹션 순서, place 규격 |
| 6 | `references/sections-library.md` | 64958 | 섹션 레시피 40개와 업종별 예시 계획 5개 |
| 7 | `references/cards.md` | 24080 | 기능 카드, panel, UI 조각 배치, 카드 loop |
| 8 | `references/motion.md` | 12812 | motion token, hover layer, tech loop 예산, 스크롤 규칙 |
| 9 | `references/effects-usage.md` | 12922 | 효과 관문, 업종별 허용 표, tech 예산, 효과 뽑기 |
| 10 | `references/effects-creative.md` | 18582 | `fx-*` WebGL 부품, `fx-map` bake(Overpass) |
| 11 | `references/effects-objects.md` | 22862 | object 13종, product render builder, GPU 표 |
| 12 | `references/moments.md` | 12760 | moment 17개, 뽑기, still 규칙, `moments.mjs check` |
| 13 | `references/scenes.md` | 8708 | big scene 11개, 높이, 검사 |
| 14 | `references/backgrounds.md` | 7912 | ground token 3개, tech CSS ground 16개 |
| 15 | `references/diagrams.md` | 6860 | diagram preset 27개, pulse loop |
| 16 | `references/icons.md` | 6758 | 아이콘 출처 4세트와 라이선스, 보라 로고 판정 |
| 17 | `references/photos.md` | 22805 | 사진 출처 순서, `photos.mjs`, 크기 상한, 크레딧 |
| 18 | `references/perf.md` | 5707 | `perf.mjs` WARN·FAIL 표와 고치는 법 |
| 19 | `design/taste/skills-lock.json` | 284 | 원격 출처 `Leonxlnx/taste-skill` |

비교용으로 다른 스킬의 인용 줄만 읽었다: `design/elayadesign/landing-page-design/SKILL.md`(3, 451줄), `design/impeccable/impeccable/SKILL.md`(3줄), `design/10k-websites/10k-websites/SKILL.md`(3줄).

## 검사 기준 위주로 일부 읽은 파일 13개

분석 보조 에이전트가 읽었다. 무엇을 검사하고 어떤 기준으로 실패시키는지를 찾는 범위다.

| # | 경로 | 바이트 | 줄 | 읽은 범위 |
|---|---|---|---|---|
| 1 | `scripts/consistency.mjs` | 885627 | 10140 | 1~345(머리 주석, visual 모듈), 1191~1275, 1649~1780, 2280~2550 일부, 3161~3310, 3540~3760(CLI, 서버, Chrome), 6662~6675, 8005~8132(FIX 레지스트리), 8380~8462, 8850~8990, 9330~9362, 9790~9858, 10085~10140. 약 1,100줄(11%), 나머지는 grep |
| 2 | `scripts/perf.mjs` | 33660 | 422 | 1~75, 280~334, 415~422, grep |
| 3 | `scripts/shoot.mjs` | 39441 | 471 | 1~60, 455~471, grep |
| 4 | `scripts/start.mjs` | 19170 | 327 | 1~60, 260~327 |
| 5 | `scripts/effects.mjs` | 32298 | 548 | 1~69, 195~230, 512~548 |
| 6 | `scripts/moments.mjs` | 39481 | 544 | 1~79, 410~420, 487~516 |
| 7 | `scripts/icons.mjs` | 45101 | 598 | 1~64, 83, 155~172, grep |
| 8 | `scripts/photos.mjs` | 79349 | 841 | 1~71, grep |
| 9 | `scripts/fx-gallery.template.html` | 87701 | 1319 | `<title>`만 |
| 10 | `scripts/fx-lab.template.html` | 22567 | 389 | `<title>`만 |
| 11 | `assets/layout/check.mjs` | 14418 | 180 | 1~60, 그 뒤 grep |
| 12 | `assets/layout/layout-check.js` | 19786 | 254 | 1~57, 130~152, 180~254 |
| 13 | `assets/layout/deal.mjs` | 8513 | 119 | 1~40, 84~102, grep |

## 구조·표본만 확인한 파일 1,435개

| 위치 | 텍스트 파일 수 | 확인한 것 |
|---|---|---|
| `library/palettes.json`, `library/type.json` | 2 | 배열 길이(56, 39)와 항목 키, 앞부분 표본 |
| `assets/icons/` | 932(SVG 928, JSON 2, HTML 1, CSS 1) | `index.json` 키: sets 4개, apps 458, files 38, ui 435, boxes |
| `assets/objects/` | 74 텍스트(바이너리 제외) | 폴더 17개 이름 |
| `assets/ui/` | 117 | 폴더 21개 이름 |
| `assets/components/` | 86 텍스트 | `fx-*` 폴더 20개 이름 |
| `assets/moments/` | 75 텍스트 | `index.json` 키, moment 17개, dealt 15, budget 4 |
| `assets/scenes/` | 54 텍스트 | `index.json` 키, scene 11개 |
| `assets/effects/` | 56 | `index.json` 키, 효과 25개, family 7개 |
| `assets/layout/` | 17 텍스트(위 3개 제외) | `heroes.json` 키, hero 11개, `hero-*.html` 11개 |
| `assets/photos/` | 1 | `photos.json` 키, 사진 413장(로컬 webp는 66장) |
| `assets/backgrounds/` | 7 | `index.json` 키, ground 16개 |
| `assets/diagrams/` | 6 | `presets.json` preset 27개 |
| `assets/motion/` | 5 | 파일 이름 |
| `assets/` 최상위 | 3 | `starter.html` 앞 30줄 |

## 제외한 바이너리 151개

| 종류 | 개수 | 바이트 |
|---|---|---|
| jpg | 39 | 9,942,054 |
| png | 46 | 5,461,134 |
| webp | 66 | 11,741,766 |

## 제외한 번역본

커밋된 `*.ko.stale.md` 13개: `SKILL`, `README`, `references/`의 app-screens, colour, copy, critique, imagery, layout, motion, research, scenes, tells, type. 이 중 `README`와 references 8개(app-screens, colour, critique, imagery, layout, research, tells, type)는 원본이 commit `4e3fc89`에서 지워졌다.

분석 중 커밋되지 않은 번역 파일 23개가 새로 생겼다(`references/*.ko.md`, `*.ko.md.part01` 등). 열지 않았다.
