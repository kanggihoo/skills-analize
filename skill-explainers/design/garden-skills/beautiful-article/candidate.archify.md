# beautiful-article — 원자료를 8단계 공정과 3중 확인으로 오프라인 웹 아티클로 만든다 {#overview}

에이전트는 사용자가 준 원자료(웹 주소·문서·메모)를 정제된 텍스트로 바꾼 뒤, 기획·첫 화면·종심의 세 확인 지점을 거쳐 오프라인으로 열리는 단일 HTML 아티클로 만든다.[](source:fm)[](source:overview)[](source:p8)

- URL·PDF·DOCX·Markdown·텍스트·스크린샷으로 읽기용 장문 아티클·브리핑·튜토리얼·리뷰를 만들 때 켜지며, 글 유형 10종 중 하나로 갈린다.[](source:fm)[](source:p0)[](source:types)
- 결과로 작업 폴더(`source/`, `plan/plan.md`, `article/sections/*.tsx`, `review/`)와 단일 파일 `article/article.html`(선택 시 `article.pdf`)이 남는다.[](source:overview)[](source:p8)
- `web-design-engineer`와 상호 대안 관계로 웹 앱은 그쪽으로 보내고, 컴포넌트 세부 API가 필요할 때는 `reacticle-authoring`을 참고한다.[](source:readme-route)[](source:wde-excl)[](source:comp-ref)
- 백엔드·폼·드래그 작업대·dashboard·제품 프로토타입·일반 웹 앱은 만들지 않으며, 확인 지점에서 사용자 대신 결정을 건너뛰지 않는다.[](source:bound)[](source:qa-proto)

@answer scope="design/garden-skills/beautiful-article · 원본 파일 58개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source fm title="frontmatter: name·description" path=design/garden-skills/beautiful-article/SKILL.md lines=1:4
@source bound title="적용 경계와 금지 대상" path=design/garden-skills/beautiful-article/SKILL.md lines=13:21
@source overview title="8단계 공정과 작업 폴더 구조" path=design/garden-skills/beautiful-article/SKILL.md lines=25:62
@source qa-proto title="단계별 질적 검증 프로토콜과 철칙" path=design/garden-skills/beautiful-article/SKILL.md lines=66:101
@source p0 title="Phase 0 요청 판별과 목표 언어 기록" path=design/garden-skills/beautiful-article/SKILL.md lines=121:138
@source p1 title="Phase 1 원자료 추출·자체점검·번역" path=design/garden-skills/beautiful-article/SKILL.md lines=142:160
@source p2 title="Phase 2 plan.md 작성과 인라인 점검" path=design/garden-skills/beautiful-article/SKILL.md lines=164:182
@source p3 title="Phase 3 Checkpoint 1 5개 항목 독립 확인" path=design/garden-skills/beautiful-article/SKILL.md lines=186:253
@source p4 title="Phase 4 첫 화면·표지·골격 생성" path=design/garden-skills/beautiful-article/SKILL.md lines=257:281
@source cp2 title="Checkpoint 2 수락과 개발 모드 선택" path=design/garden-skills/beautiful-article/SKILL.md lines=285:306
@source p5 title="Phase 5 절별 분리 구현과 리뷰" path=design/garden-skills/beautiful-article/SKILL.md lines=310:336
@source p6 title="Phase 6 3관점 최종 리뷰" path=design/garden-skills/beautiful-article/SKILL.md lines=340:351
@source p7 title="Phase 7 최소 조각 수정" path=design/garden-skills/beautiful-article/SKILL.md lines=355:359
@source cp3 title="Checkpoint 3 전달 형식 확인" path=design/garden-skills/beautiful-article/SKILL.md lines=363:371
@source p8 title="Phase 8 HTML·PDF 산출과 전달" path=design/garden-skills/beautiful-article/SKILL.md lines=375:388
@source defaults title="기본 정책, 표지·colophon·PDF 규칙" path=design/garden-skills/beautiful-article/SKILL.md lines=392:422
@source types title="글 유형 10종과 표준 정보 보존 비율" path=design/garden-skills/beautiful-article/references/article-types.md lines=16:28
@source density-ref title="Checkpoint 1 문항 수 표기(4개)" path=design/garden-skills/beautiful-article/references/information-density.md lines=45:50
@source asset-ref title="배경 이미지 모드와 Raw 직교 규칙" path=design/garden-skills/beautiful-article/references/asset-policy.md lines=6:29
@source cover-ref title="표지 5대 강제 제약(오프라인 포함)" path=design/garden-skills/beautiful-article/references/cover.md lines=54:74
@source comp-ref title="reacticle-authoring 온디맨드 참조" path=design/garden-skills/beautiful-article/references/component-policy.md lines=57:59
@source raw-ref title="Raw 자유층 허용·금지 규칙" path=design/garden-skills/beautiful-article/references/raw-policy.md lines=20:41
@source src-ref title="MarkItDown과 fallback 추출 스크립트 규칙" path=design/garden-skills/beautiful-article/references/source-to-markdown.md lines=37:91
@source sec-ref title="절별 파일 분리와 병렬 서브에이전트 규칙" path=design/garden-skills/beautiful-article/references/section-build.md lines=38:90
@source html-ref title="단일 HTML 빌드 명령" path=design/garden-skills/beautiful-article/references/html-output.md lines=6:20
@source pdf-ref title="HTML → PDF 인쇄 규칙과 헤드리스 조건" path=design/garden-skills/beautiful-article/references/pdf-output.md lines=1:45
@source themes-json title="등록된 11개 런타임 테마 목록" path=design/garden-skills/beautiful-article/theme-profiles/index.json lines=1:112
@source theme-sel title="런타임 테마 목록(tufte·press 표기)" path=design/garden-skills/beautiful-article/references/theme-selection.md lines=8:19
@source tmpl-html title="골격 index.html의 Google Fonts 링크" path=design/garden-skills/beautiful-article/assets/scaffold-template/index.html lines=7:14
@source readme-route title="웹 앱·대시보드 경계와 대안 스킬 안내" path=design/garden-skills/beautiful-article/README.md lines=420:421
@source wde-excl title="web-design-engineer의 장문 아티클 제외 조항" path=design/garden-skills/web-design-engineer/SKILL.md lines=18:18

## 어떻게 동작하나 {#flow span=12}

에이전트는 요청 판별부터 최종 HTML·PDF 전달까지 8개 단계와 3개의 사람 확인 지점(`Checkpoint 1`·`2`·`3`)을 순서대로 밟는다.[](source:overview) 그림은 주 흐름을 보이며, 각 단계의 세부 리뷰 체크리스트와 10종 글 유형별 규칙은 상세 후보로 남겼다.

@workflow id=flow-diagram title="beautiful-article 흐름"
| lane intake | 원자료 정제와 기획 |
| lane build | 첫 화면과 절별 구현 |
| lane deliver | 종심·수정·전달 |
| p0 | 글 요청 판별? | external | intake | source:p0 |
| stop | 안내 후 중단 | security | intake | source:p0 |
| p1 | 원자료 변환·번역 | backend | intake | source:p1 |
| p2 | 기획서 작성·점검 | backend | intake | source:p2 |
| cp1 | Checkpoint 1 | security | intake | source:p3 |
| p4 | 첫 화면·골격 | backend | build | source:p4 |
| cp2 | Checkpoint 2 | security | build | source:cp2 |
| p5 | 절별 구현·리뷰 | backend | build | source:p5 |
| p6 | 3관점 최종 리뷰 | backend | deliver | source:p6 |
| p7 | 최소 단위 수정 | backend | deliver | source:p7 |
| cp3 | Checkpoint 3 | security | deliver | source:cp3 |
| p8 | HTML·PDF 산출 | backend | deliver | source:p8 |
| p0 > stop | 앱·무소재 | dashed |
| p0 > p1 | 글 요청 | emphasis |
| p1 > p2 | |
| p2 > cp1 | |
| cp1 > p4 | 5개 항목 확정 | emphasis |
| p4 > cp2 | 리뷰·수정 완료 |
| cp2 > cp1 | 테마·판형 변경 | dashed |
| cp2 > p4 | 부분 수정 | dashed |
| cp2 > p5 | 수락·모드 확정 | emphasis |
| p5 > p6 | |
| p6 > p7 | fail 발견 |
| p6 > cp3 | 전부 통과 | emphasis |
| p7 > cp3 | 수정 완료 |
| cp3 > p7 | 추가 수정 요청 | dashed |
| cp3 > p8 | 전달 승인 | emphasis |

@steps id=flow-steps
| s-p0 | 글 요청 판별? | **입력** 사용자 요청과 첨부 자료 · **참조** `references/harness.md` · **출력** 진행 여부와 목표 언어. **처리** 요청이 글인지 웹 앱인지 가르고, 목표 언어를 기록한다.[](source:p0) **다음** 소재 없이 주제만 주면 소재를 먼저 요구하고, 앱·dashboard 요청이면 중단한다.[](source:p0) | flow-diagram | p0 |
| s-stop | 안내 후 중단 | **입력** 앱 요청 또는 소재 부재 판정 · **출력** 경계 안내 또는 소재 요청. **처리** 아티클이 아닌 요청이나 소재 없는 요청에는 작업을 시작하지 않고 멈춰서 사용자에게 알린다.[](source:bound)[](source:p0) | flow-diagram | stop |
| s-p1 | 원자료 변환·번역 | **입력** URL·PDF·DOCX·텍스트·이미지 · **참조** `references/source-to-markdown.md` · **실행** `python3.10 <skill>/scripts/source-to-markdown-markitdown.py <input> -o source/source.md` 또는 `python3 <skill>/scripts/source-to-markdown.py <input> -o source/source.md` · **출력** `source/source.md`, `source/extraction-notes.md`, 필요 시 번역본 `source/source.<lang>.md`. **처리** 원문을 추출해 5항목 인라인 자가 점검을 마치고, 목표 언어가 다르면 번역본을 만든다.[](source:p1)[](source:src-ref) **다음** 저신뢰·복잡 원본이면 `Source Reviewer` 서브에이전트로 `review/source-review.md`를 추가 작성한다.[](source:qa-proto)[](source:p1) | flow-diagram | p1 |
| s-p2 | 기획서 작성·점검 | **입력** 정제된 `source.md`(또는 번역본) · **참조** `references/plan-template.md`, `references/article-types.md`, `references/information-density.md`, `references/theme-selection.md`, `references/layout.md`, `references/asset-policy.md`, `references/cover.md` · **출력** 4개 절(`Brief`, `Outline`, `Theme`, `Assets`)을 담은 `plan/plan.md`. **처리** 글 유형·표준 정보 보존 비율·테마·구성을 짜고 메인 에이전트가 5개 항목을 인라인 점검한다.[](source:p2) **다음** 이 단계에서는 서브에이전트 생성과 `review/plan-review.md` 작성을 금지한다.[](source:qa-proto)[](source:p2) | flow-diagram | p2 |
| s-cp1 | Checkpoint 1 | **입력** 점검된 `plan/plan.md` · **출력** 사용자가 개별 확정한 5개 결정(글 유형·테마·판형 너비·배경 이미지 모드·표지 사용 여부). **처리** 5개 항목을 추천 사유와 함께 각각 독립 질문으로 제시해 모두 답을 받을 때까지 멈춘다.[](source:p3) **다음** 사용자가 표준 정보 보존 비율을 덮어쓰면 `plan.md`에 별도 표기한다.[](source:p3) | flow-diagram | cp1 |
| s-p4 | 첫 화면·골격 | **입력** 확정된 기획과 테마 · **참조** `references/scaffold.md`, `references/cover.md`, `references/component-policy.md`, `references/raw-policy.md` · **실행** `bash <skill>/scripts/scaffold.sh ./my-article --theme=<id>` (`--no-cover` 선택) 및 `npm run dev` · **출력** Vite 프로젝트, `Cover.tsx`, `Article.tsx`, `sections/01-*.tsx`, `review/first-spread-review.md`. **처리** 골격 생성 후 표지·첫 화면·첫 절을 구현하고 `First Spread Reviewer` 서브에이전트 리뷰와 수정을 끝낸다.[](source:p4) | flow-diagram | p4 |
| s-cp2 | Checkpoint 2 | **입력** 첫 화면 미리보기와 수정된 리뷰 결과 · **출력** 수용 여부와 이후 개발 모드(A 순차 / B 병렬). **처리** 수용 판정과 개발 모드를 두 개의 독립 질문으로 확인하며 하나로 묶어 묻지 않는다.[](source:cp2) **다음** 테마·판형이 어긋나면 `Checkpoint 1`로 되돌아가고, 부분 수정이면 `첫 화면·골격`을 고친다.[](source:cp2) | flow-diagram | cp2 |
| s-p5 | 절별 구현·리뷰 | **입력** `plan/plan.md`와 확정된 개발 모드 · **참조** `references/section-build.md`, `references/component-policy.md`, `references/raw-policy.md`, `theme-profiles/<id>.md` · **실행** 병렬 라운드마다 `npm run typecheck`, `npm run build` · **출력** 절별 파일 `article/sections/NN-*.tsx`, 대형 시각 블록 `article/raw-blocks/NN-*.tsx`, 조립된 `Article.tsx`. **처리** 한 절을 한 파일에 쓰며 절마다 `Section Reviewer` 서브에이전트가 메시지로 `pass`/`fail`을 돌려주면 즉시 고친다.[](source:p5)[](source:sec-ref) **다음** `review/section-NN-review.md` 파일은 만들지 않는다.[](source:qa-proto)[](source:p5) | flow-diagram | p5 |
| s-p6 | 3관점 최종 리뷰 | **입력** 조립된 전체 아티클 · **참조** `references/review-checklist.md` · **출력** `review/final-review.md`. **처리** Editorial·Visual·Technical 세 관점 서브에이전트가 문체·테마 토큰·빌드·장절 번호 일관성을 감사해 기록한다.[](source:p6) **다음** 서브에이전트 도구가 없으면 메인 에이전트가 대신 점검하고 파일 첫머리에 대체 사실을 적는다.[](source:qa-proto) | flow-diagram | p6 |
| s-p7 | 최소 단위 수정 | **입력** `review/final-review.md`의 실패 항목 또는 사용자 수정 요청 · **참조** `references/repair-policy.md` · **출력** 수정된 해당 절·블록·설정 파일과 `review/repair-log.md`. **처리** 문제가 난 최소 단위만 고치며, 실제 수정이 있을 때만 `repair-log.md`를 남긴다.[](source:p7) | flow-diagram | p7 |
| s-cp3 | Checkpoint 3 | **입력** 검증을 마친 아티클과 미리보기 · **출력** 전달 결정 1건(HTML만 / HTML+PDF / 부분 수정 / 보류). **처리** 내보내기 방식을 사용자에게 직접 묻고 답변 전에는 산출 명령을 실행하지 않는다.[](source:cp3) | flow-diagram | cp3 |
| s-p8 | HTML·PDF 산출 | **입력** 확정된 전달 방식 · **참조** `references/html-output.md`, `references/pdf-output.md` · **실행** `npm run html`, 선택 시 `bash <skill>/scripts/html-to-pdf.sh` · **출력** 단일 파일 `article/article.html`, 선택 시 `article/article.pdf`, 짧은 편집 요약. **처리** CSS와 JS를 한 HTML 파일로 묶고, 사용자가 선택했을 때만 헤드리스 브라우저로 PDF를 인쇄해 전달한다.[](source:p8) | flow-diagram | p8 |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자가 URL·PDF·DOCX·메모 등을 주며 웹 아티클·장문·브리핑·튜토리얼·시각 아티클로 만들어 달라고 요청하면 모델이 `description`을 보고 켠다. 호출 제한 필드는 없다.[](source:fm) |
| 성격 | 단순 HTML 생성기가 아니라 자료 추출·기획·3단계 확인·절별 분리 빌드·3관점 종심을 관리하는 편집 하네스다.[](source:overview)[](source:qa-proto) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#rel-r05} | web-design-engineer | 대안 | 웹 앱·dashboard·폼·프로토타입·랜딩 페이지 요청은 `web-design-engineer` 소관이며, 모호하면 멈추고 사용자에게 묻는다.[](source:readme-route) |
| **이 스킬** {#rel-r06} | reacticle-authoring | 참고 | `reacticle` 컴포넌트의 상세 속성과 사용법이 필요할 때만 해당 참조 파일(`structure`, `insight`, `structured`, `decision`, `technical`)을 온디맨드로 읽는다.[](source:comp-ref) |
| web-design-engineer {#rel-r11} | **이 스킬** | 대안 | `web-design-engineer`는 원자료→장문 HTML 아티클 변환을 적용 제외 대상으로 두고 전용 스킬이 있으면 이쪽으로 라우팅한다.[](source:wde-excl) |

@architecture id=relation-map title="beautiful-article과 이어지는 스킬"
| self | beautiful-article(이 스킬) | backend |
| wde | web-design-engineer | backend |
| reacticle | reacticle-authoring | external |
| self > wde | 대안 |
| wde > self | 대안 |
| self > reacticle | 참고 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 8단계 공정, 질적 검증 철칙, 확인 지점 질문 틀, 기본 정책을 담는다 | 스킬이 켜지면 읽는다 | 모든 단계 |
| `references/harness.md` | 6요소 하네스 설계와 장기 기억 파일 목록을 설명한다 | Phase 0에서 읽는다 | 글 요청 판별? |
| `references/source-to-markdown.md`, `scripts/source-to-markdown*.py` | 입력 형식별 추출 규칙, MarkItDown 및 fallback 스크립트, 5항목 점검을 제공한다 | Phase 1 원자료 변환 때 읽고 실행한다[](source:src-ref) | 원자료 변환·번역 |
| `references/plan-template.md`, `article-types.md`, `article-types/*.md`(10종) | 단일 `plan.md` 4단 구조와 글 유형 10종별 비율·구조·자체 점검을 제공한다 | Phase 2 기획 시 읽으며 유형 확정 뒤 해당 유형 파일만 연다 | 기획서 작성·점검 |
| `references/information-density.md`, `theme-selection.md`, `layout.md`, `asset-policy.md`, `cover.md` | 정보 보존 비율, 테마 분리, 열 너비·TOC, 이미지 모드, 3:4 표지 규약을 정한다 | Phase 2 기획 및 Phase 4 표지 구현 시 읽는다 | 기획서 작성·점검 · 첫 화면·골격 |
| `theme-profiles/index.json`, `theme-profiles/*.md`(11종) | `tufte`·`press` 등 11개 런타임 테마의 문체·색·`Raw`·금지 규칙을 담는다 | Phase 2 추천과 Phase 5 절 구현 전마다 읽는다 | 기획서 작성·점검 · 절별 구현·리뷰 |
| `scripts/scaffold.sh`, `references/scaffold.md`, `assets/scaffold-template/` | Vite·React·TS 작업 폴더를 만들고 `reacticle` 최신판을 설치한다 | Phase 4 첫 화면 시작 때 한 번 실행한다[](source:p4) | 첫 화면·골격 |
| `references/section-build.md`, `component-policy.md`, `raw-policy.md` | 1절 1파일 철칙, 병렬 프롬프트, `reacticle` 핵심·특례 컴포넌트, `--ra-*` 토큰 `Raw` 규칙을 정한다 | Phase 4·5에서 매 절 작성 전에 다시 읽는다[](source:raw-ref) | 첫 화면·골격 · 절별 구현·리뷰 |
| `references/review-checklist.md`, `repair-policy.md` | Plan·First Spread·Section·Final 3관점 감사 목록과 최소 조각 수정표를 제공한다 | Phase 2·4·5·6·7 각 검증·수정 시점에 읽는다 | 기획서 작성·점검 · 첫 화면·골격 · 절별 구현·리뷰 · 3관점 최종 리뷰 · 최소 단위 수정 |
| `references/html-output.md`, `pdf-output.md`, `scripts/html-to-pdf.sh`, `scripts/pdf-print-overrides.css` | 단일 HTML 빌드와 선택적 헤드리스 Chromium PDF 인쇄·CSS 주입을 수행한다 | Phase 8 전달 시 읽고, PDF는 사용자가 선택했을 때만 실행한다[](source:p8) | HTML·PDF 산출 |
| `README.md`, `README.zh-CN.md`, `manifest.json` | 사람용 안내서와 패키지 메타데이터를 담는다 | 에이전트 실행 지시에서는 읽지 않는다 | 흐름 밖: 사용자 문서·메타 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 사용자가 웹 앱·폼·dashboard·프로토타입 요청 또는 소재 없이 주제만 제시 | 작업을 시작하지 않고 멈춰서 경계를 설명하거나 소재를 먼저 요청한다 | [](source:bound)[](source:p0) |
| Phase 2 `plan/plan.md` 작성 뒤(`Checkpoint 1` 전) | 금지: 서브에이전트 생성과 `review/plan-review.md` 작성을 금지하며 메인 에이전트 인라인 5항목 점검만 한다 | [](source:qa-proto)[](source:p2) |
| `Checkpoint 1`·`2`·`3` 결정 수집 | 강제: 추천은 가능하나 묵시적 기본값 적용이나 한 번에 묶어 묻는 질문을 금지하며, 항목마다 독립 응답을 기다린다 | [](source:qa-proto)[](source:p3)[](source:cp2)[](source:cp3) |
| `Checkpoint 1` 문항 수 문서 불일치 | `information-density.md`는 4개 문항으로 적고 `SKILL.md`는 표지 포함 5개 문항을 필수로 요구한다(원문 간 불일치) | [](source:p3)[](source:density-ref) |
| Phase 5 `Section Reviewer` 실행 | 강제: `review/section-NN-review.md` 파일 작성을 금지하고 메시지로만 `pass`/`fail`을 받아 즉시 수정한다 | [](source:qa-proto)[](source:p5) |
| Phase 4·5 절 구성 및 번호 매김 | 강제: 1절 1파일(`article/sections/NN-*.tsx`)을 지키며 `Article.tsx`는 조립과 전체 장절 번호 교정만 맡는다 | [](source:p5)[](source:sec-ref) |
| 이미지 모드와 `Raw` 자유층 관계 | `Raw`는 항상 기본 활성이고 이미지 모드(`none` 포함)는 외부 `Image` 사용 여부만 정한다. `ai-generated`는 사용자 명시 선택 없이 자동 생성하지 않는다 | [](source:defaults)[](source:asset-ref) |
| 표지(`Cover.tsx`)와 `colophon` | 강제: 3:4 비율·PDF 첫 쪽 단독 배치·`--ra-*` 토큰·원격 이미지 금지, 그리고 `Article.tsx` 끝의 `colophon` 삭제·이동을 금지한다 | [](source:defaults)[](source:cover-ref) |
| 오프라인 규약과 템플릿 코드 불일치 | `cover.md`는 동적 Google Fonts 로딩을 금지하나 `assets/scaffold-template/index.html`에는 Google Fonts 링크가 들어 있다(원문 충돌) | [](source:cover-ref)[](source:tmpl-html) |
| 등록 테마 목록 표기 차이 | `theme-selection.md`와 `html-output.md`는 `tufte`·`press`만 적었으나 `theme-profiles/index.json`에는 11개 테마가 등록돼 있다 | [](source:theme-sel)[](source:html-ref)[](source:themes-json) |
| Phase 7 수정 및 `repair-log.md` | 금지: 한 곳 피드백에 전체 재작성, 확정 구조 변경, 필수 보존 내용 삭제를 금지하며, 실제 수정이 있을 때만 로그를 쓴다 | [](source:p7) |
| Phase 8 PDF 내보내기 | `article/article.html`이 주 산출물이며, `html-to-pdf.sh`는 `Checkpoint 3`에서 사용자가 PDF 포함을 고른 경우에만 실행한다 | [](source:defaults)[](source:pdf-ref) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 글 유형 10종과 정보 보존 비율 체계 — `기획서 작성·점검` · `longform`~`interactive-explainer` 10종의 권장 비율, 컴포넌트 경계, 예외 재구성(`~25%`) 규칙을 개요에서 생략했다.
- `reacticle` 컴포넌트·`Raw`·표지 규약 — `첫 화면·골격`과 `절별 구현·리뷰` · 핵심·특례 컴포넌트 목록, `--ra-*` 토큰 규칙, 표지 구도 5종(A~E)이 개요 밖에 있다.
- 단계별 리뷰 체크리스트와 서브에이전트 프롬프트 — `3관점 최종 리뷰` · Plan·First Spread·Section·Final 3관점 상세 감사 항목과 프롬프트 템플릿을 생략했다.
- `scripts/` 추출·PDF 인쇄 동작 — `원자료 변환·번역`과 `HTML·PDF 산출` · MarkItDown·fallback 분기, `pdf-print-overrides.css` 3단 인쇄 규칙, 브라우저 미탐지 시 수동 인쇄 폴백을 담지 않았다.

@callout level=open-question title="확인하지 못한 것"
| `theme-profiles/` 11개 `.md` 중 `tufte.md`·`press.md`와 `index.json`만 읽었고 나머지 9개 프로필 본문은 읽지 않았다. |
| 외부 npm 패키지 `reacticle`의 실제 런타임 컴포넌트 코드와 `reacticle-authoring` 스킬 파일은 저장소 밖 대상이라 확인하지 못했다. |

읽은 원본: 텍스트 파일 58개 중 48개 읽기(`SKILL.md`, `manifest.json`, `README.md`, `references/` 27개, `scripts/` 5개, `assets/scaffold-template/` 10개, `theme-profiles/index.json`·`tufte.md`·`press.md`). 표본 확인: `theme-profiles/*.md` 9개. 제외: `README.zh-CN.md` 1개(`README.md`의 중국어판), `*.ko.md` 번역본 40개.
