# beautiful-article 스킬은 에이전트를 어떻게 바꾸나 {#beautiful-article-skill}

`beautiful-article`를 쓰면 에이전트는 자료를 받자마자 HTML을 쓰지 않는다. 먼저 자료를 `source/source.md`로 옮기고 `plan/plan.md`를 쓴 뒤, 결정 다섯 가지를 사람에게 하나씩 묻고 답이 올 때까지 멈춘다. 그다음 표지와 첫 화면만 만들어 다시 확인받고, 섹션을 한 파일씩 만들어 리뷰를 거친 뒤 오프라인으로 열리는 `article/article.html` 한 파일을 넘긴다.[](source:flow)[](source:p8)

- 켜지는 때: URL·PDF·DOCX·Markdown·텍스트·스크린샷 같은 자료를 공유용 웹 기사로 만들어 달라는 요청이다. 호출 제한 필드는 없다.[](source:fm)
- 강제하는 것: 결정은 항목마다 따로 묻고 에이전트가 대신 정하지 않는다. 기본값은 `longform` 유형, 정보 100% 보존이다.[](source:law5)[](source:defs)
- 멈추는 곳: `description`은 "双确认"(두 번 확인)이라고 적지만, 본문은 Checkpoint 1·2·3 세 곳에서 멈춘다.[](source:fm)[](source:flow)
- 쓰면 안 되는 때: 관리 화면, 폼, 대시보드, 제품 프로토타입, 범용 웹앱이다. 앱을 원하면 에이전트는 멈추고 되묻는다.[](source:bound)

@answer scope="design/garden-skills/beautiful-article · 원본 텍스트 57개 253,012B 전부 읽음(목록은 같은 폴더 files.md) · 커밋 4e3fc89 · 번역본 40개와 README.zh-CN.md 제외 · 스크립트는 읽기만 하고 실행하지 않음 · 지시상 동작"
@meta locale=ko
@source fm title="design/garden-skills/beautiful-article/SKILL.md · 31482B · frontmatter" path=design/garden-skills/beautiful-article/SKILL.md lines=1:4
@source bg title="SKILL.md · 배경 원칙" path=design/garden-skills/beautiful-article/SKILL.md lines=8:10
@source bound title="SKILL.md · 경계(이 스킬에 들어갈지 먼저 판단)" path=design/garden-skills/beautiful-article/SKILL.md lines=13:21
@source flow title="SKILL.md · 워크플로 개요" path=design/garden-skills/beautiful-article/SKILL.md lines=25:50
@source ws title="SKILL.md · 작업 폴더 구조" path=design/garden-skills/beautiful-article/SKILL.md lines=52:62
@source qc title="SKILL.md · 품질 점검 프로토콜 표" path=design/garden-skills/beautiful-article/SKILL.md lines=66:79
@source law14 title="SKILL.md · 철칙 1~4" path=design/garden-skills/beautiful-article/SKILL.md lines=80:90
@source law5 title="SKILL.md · 철칙 5 결정 수집" path=design/garden-skills/beautiful-article/SKILL.md lines=91:99
@source read title="SKILL.md · 단계별 파일 읽기 안내" path=design/garden-skills/beautiful-article/SKILL.md lines=105:117
@source p0 title="SKILL.md · Phase 0 Intake" path=design/garden-skills/beautiful-article/SKILL.md lines=121:138
@source p1 title="SKILL.md · Phase 1 Source → Markdown" path=design/garden-skills/beautiful-article/SKILL.md lines=142:160
@source p2 title="SKILL.md · Phase 2 Editorial Planning" path=design/garden-skills/beautiful-article/SKILL.md lines=164:182
@source cp1law title="SKILL.md · Phase 3 Checkpoint 1 수집 방식" path=design/garden-skills/beautiful-article/SKILL.md lines=186:200
@source cp1tab title="SKILL.md · Checkpoint 1 필수 결정 5개" path=design/garden-skills/beautiful-article/SKILL.md lines=202:210
@source cp1def title="SKILL.md · TOC·기본값·비표준 보존 비율" path=design/garden-skills/beautiful-article/SKILL.md lines=212:230
@source cp1tpl title="SKILL.md · Checkpoint 1 시작 메시지와 진행 조건" path=design/garden-skills/beautiful-article/SKILL.md lines=232:253
@source p4 title="SKILL.md · Phase 4 First Spread" path=design/garden-skills/beautiful-article/SKILL.md lines=257:281
@source cp2 title="SKILL.md · Checkpoint 2" path=design/garden-skills/beautiful-article/SKILL.md lines=285:306
@source p5 title="SKILL.md · Phase 5 Full Article Build" path=design/garden-skills/beautiful-article/SKILL.md lines=310:336
@source p6 title="SKILL.md · Phase 6 Final Review" path=design/garden-skills/beautiful-article/SKILL.md lines=340:351
@source p7 title="SKILL.md · Phase 7 Repair" path=design/garden-skills/beautiful-article/SKILL.md lines=355:359
@source cp3 title="SKILL.md · Checkpoint 3" path=design/garden-skills/beautiful-article/SKILL.md lines=363:371
@source p8 title="SKILL.md · Phase 8 Delivery" path=design/garden-skills/beautiful-article/SKILL.md lines=375:388
@source defs title="SKILL.md · 기본 전략(colophon·표지·PDF 포함)" path=design/garden-skills/beautiful-article/SKILL.md lines=392:422
@source success title="SKILL.md · 성공 기준" path=design/garden-skills/beautiful-article/SKILL.md lines=426:435
@source rd-layer title="design/garden-skills/beautiful-article/README.md · 24181B · reacticle과의 관계" path=design/garden-skills/beautiful-article/README.md lines=13:27
@source rd-core title="README.md · 핵심 아이디어" path=design/garden-skills/beautiful-article/README.md lines=239:248
@source rd-flow title="README.md · 워크플로(세 개의 ★ Checkpoint)" path=design/garden-skills/beautiful-article/README.md lines=252:276
@source rd-faq title="README.md · FAQ(쓰지 말아야 할 때)" path=design/garden-skills/beautiful-article/README.md lines=418:433
@source rd-tools title="README.md · 도구 요구 사항" path=design/garden-skills/beautiful-article/README.md lines=437:444
@source mf title="design/garden-skills/beautiful-article/manifest.json · 733B · 영어 description" path=design/garden-skills/beautiful-article/manifest.json lines=1:15
@source harness title="references/harness.md · 2123B · 상태 파일이 장기 기억" path=design/garden-skills/beautiful-article/references/harness.md lines=14:30
@source s2m-tab title="references/source-to-markdown.md · 6401B · 입력별 처리" path=design/garden-skills/beautiful-article/references/source-to-markdown.md lines=26:35
@source s2m-script title="source-to-markdown.md · 추출 스크립트 선택" path=design/garden-skills/beautiful-article/references/source-to-markdown.md lines=37:90
@source s2m-check title="source-to-markdown.md · 5개 자체 점검과 Source Reviewer 승격" path=design/garden-skills/beautiful-article/references/source-to-markdown.md lines=92:117
@source rep title="references/repair-policy.md · 1236B · 최소 단위 수리" path=design/garden-skills/beautiful-article/references/repair-policy.md lines=1:35
@source html title="references/html-output.md · 1988B · 명령과 테마 전환" path=design/garden-skills/beautiful-article/references/html-output.md lines=6:20
@source lay title="references/layout.md · 2003B · 폭 모드와 TOC" path=design/garden-skills/beautiful-article/references/layout.md lines=6:26
@source tsel title="references/theme-selection.md · 2301B · 선택 절차" path=design/garden-skills/beautiful-article/references/theme-selection.md lines=8:20
@source tnew title="theme-selection.md · 신규 테마 조건" path=design/garden-skills/beautiful-article/references/theme-selection.md lines=39:48
@source at title="references/article-types.md · 3767B · 유형과 보존 비율" path=design/garden-skills/beautiful-article/references/article-types.md lines=5:27
@source dens title="references/information-density.md · 3238B · 밀도 단계" path=design/garden-skills/beautiful-article/references/information-density.md lines=12:32
@source dens-ask title="information-density.md · Plan Checkpoint 필수 질문" path=design/garden-skills/beautiful-article/references/information-density.md lines=45:50
@source plan-tpl title="references/plan-template.md · 5851B · plan.md Brief" path=design/garden-skills/beautiful-article/references/plan-template.md lines=19:43
@source asset title="references/asset-policy.md · 3833B · 이미지 모드와 Raw" path=design/garden-skills/beautiful-article/references/asset-policy.md lines=6:43
@source cv-size title="references/cover.md · 11868B · 3:4 크기" path=design/garden-skills/beautiful-article/references/cover.md lines=22:46
@source cv-hard title="cover.md · 하드 제약 5개" path=design/garden-skills/beautiful-article/references/cover.md lines=54:73
@source cv-tpl title="cover.md · 구도 템플릿 A~E" path=design/garden-skills/beautiful-article/references/cover.md lines=106:117
@source cv-check title="cover.md · 필수 자체 점검 5개" path=design/garden-skills/beautiful-article/references/cover.md lines=155:167
@source cv-off title="cover.md · 표지를 끄는 경우" path=design/garden-skills/beautiful-article/references/cover.md lines=185:195
@source sb-num title="references/section-build.md · 5405B · 장 번호는 메인 에이전트가" path=design/garden-skills/beautiful-article/references/section-build.md lines=38:51
@source sb-mode title="section-build.md · 개발 모드 A/B" path=design/garden-skills/beautiful-article/references/section-build.md lines=53:71
@source comp title="references/component-policy.md · 5543B · 핵심 규칙" path=design/garden-skills/beautiful-article/references/component-policy.md lines=3:31
@source raw title="references/raw-policy.md · 4485B · 허용과 금지" path=design/garden-skills/beautiful-article/references/raw-policy.md lines=20:40
@source raw-check title="raw-policy.md · Raw 자체 점검" path=design/garden-skills/beautiful-article/references/raw-policy.md lines=81:86
@source rc-plan title="references/review-checklist.md · 7312B · Plan 자체 점검 5개" path=design/garden-skills/beautiful-article/references/review-checklist.md lines=21:36
@source rc-final title="review-checklist.md · 최종 리뷰 세 관점" path=design/garden-skills/beautiful-article/references/review-checklist.md lines=95:133
@source scaf title="references/scaffold.md · 3602B · scaffold가 하는 일" path=design/garden-skills/beautiful-article/references/scaffold.md lines=20:35
@source pdf-req title="references/pdf-output.md · 10041B · 전제와 대체 경로" path=design/garden-skills/beautiful-article/references/pdf-output.md lines=25:44
@source pdf-flags title="pdf-output.md · Chrome 플래그" path=design/garden-skills/beautiful-article/references/pdf-output.md lines=118:125
@source pdf-not title="pdf-output.md · 하지 않는 일" path=design/garden-skills/beautiful-article/references/pdf-output.md lines=203:208
@source pdf-ie title="pdf-output.md · interactive-explainer와 PDF" path=design/garden-skills/beautiful-article/references/pdf-output.md lines=129:136
@source idx title="theme-profiles/index.json · 5912B · 테마 등록부 11개" path=design/garden-skills/beautiful-article/theme-profiles/index.json lines=1:112
@source sh-guard title="scripts/scaffold.sh · 7516B · 대상 폴더와 npm 확인" path=design/garden-skills/beautiful-article/scripts/scaffold.sh lines=71:79
@source sh-npm title="scaffold.sh · reacticle 최신판 설치와 typecheck" path=design/garden-skills/beautiful-article/scripts/scaffold.sh lines=132:146
@source sh-theme title="scaffold.sh · 테마 전환 안내 문구" path=design/garden-skills/beautiful-article/scripts/scaffold.sh lines=165:165
@source pdf-sh title="scripts/html-to-pdf.sh · 6377B · 브라우저 없을 때 대체 경로" path=design/garden-skills/beautiful-article/scripts/html-to-pdf.sh lines=106:117
@source tpl-font title="assets/scaffold-template/index.html · 755B · Google Fonts 링크" path=design/garden-skills/beautiful-article/assets/scaffold-template/index.html lines=7:13
@source tpl-main title="assets/scaffold-template/article/main.tsx · 1173B · 테마 주석" path=design/garden-skills/beautiful-article/assets/scaffold-template/article/main.tsx lines=10:12
@source tpl-colo title="assets/scaffold-template/article/Article.tsx · 2811B · colophon" path=design/garden-skills/beautiful-article/assets/scaffold-template/article/Article.tsx lines=26:66
@source tpl-pkg title="assets/scaffold-template/package.json · 783B · 스크립트와 의존성" path=design/garden-skills/beautiful-article/assets/scaffold-template/package.json lines=6:16
@source brief-t title="references/article-types/briefing.md · 2177B · 수치" path=design/garden-skills/beautiful-article/references/article-types/briefing.md lines=5:17
@source ie-t title="references/article-types/interactive-explainer.md · 5042B · 보존 비율과 자체 점검" path=design/garden-skills/beautiful-article/references/article-types/interactive-explainer.md lines=12:59
@source lf-t title="references/article-types/longform.md · 2325B · TOC 조건" path=design/garden-skills/beautiful-article/references/article-types/longform.md lines=6:9
@source css-head title="scripts/pdf-print-overrides.css · 6457B · 머리 주석(네 묶음)" path=design/garden-skills/beautiful-article/scripts/pdf-print-overrides.css lines=8:18
@source wde title="design/garden-skills/web-design-engineer/SKILL.md · r32 확인용" path=design/garden-skills/web-design-engineer/SKILL.md lines=14:18

## 언제 켜지고, 언제 쓰면 안 되나 {#trigger}

@code source=fm language=yaml

이 스킬에는 호출 제한 필드가 없다. 그래서 모델이 `description`을 참고해 스스로 켤 수 있다.[](source:fm) 판정: `description`은 판단용 설명일 뿐이고, 특정 단어가 들어 있다고 켜지는 목록이 아니다.

`description`이 요약한 흐름을 풀면 이렇다.[](source:fm)

| 원문 표기 | 뜻 | 본문의 해당 단계 |
| --- | --- | --- |
| source | 자료를 Markdown으로 옮긴다 | Phase 1[](source:p1) |
| 规划 | 편집 기획을 `plan/plan.md` 한 파일로 쓴다 | Phase 2[](source:p2) |
| 双确认 | 사람이 두 번 확인한다 | Checkpoint 1(기획), Checkpoint 2(첫 화면)[](source:flow) |
| 生成 | 기사 전체를 만든다 | Phase 5[](source:p5) |
| 终审 | 세 관점으로 최종 리뷰한다 | Phase 6[](source:p6) |
| 修复 | 가장 작은 단위로 고친다 | Phase 7[](source:p7) |
| 100% 信息保留 | 기본값은 원문 정보를 100% 남기는 장문이다 | 기본 전략, `longform`[](source:defs) |

판정: "双确认"는 Checkpoint 1과 2에 해당한다. 본문은 그 뒤 Checkpoint 3(납품 확인)에서도 "반드시 멈춰서 묻는다"고 적어서, 실제로 사람이 개입하는 지점은 세 곳이다. 영어 `manifest.json`도 "double-confirmation"이라고 쓰고, README는 "three hard checkpoints"라고 쓴다.[](source:flow)[](source:cp3)[](source:mf)[](source:rd-flow)

에이전트는 Phase 0에서 먼저 이 스킬에 들어갈지 판단한다.[](source:p0)

| 사용자가 준 것 | 에이전트가 하는 일 |
| --- | --- |
| 자료 하나 이상(URL, PDF, DOCX, MD, 텍스트, 스크린샷) | Phase 1로 간다[](source:p0) |
| "X 글 만들어 줘"만 있고 자료가 없다 | 자료나 개요부터 되묻는다. 내용을 지어내지 않는다 {caution:되묻기}[](source:p0) |
| 분명히 앱·도구·대시보드를 원한다 | 멈추고 확인한다. 이 스킬에 들어가지 않는다 {bad:진입 안 함}[](source:p0) |

에이전트는 같은 단계에서 사용자가 원하는 최종 언어도 기록한다. 사용자가 언어를 정하지 않으면 원문 언어를 따르고 번역하지 않는다.[](source:p0)

**쓰면 안 되는 경우**

- 최종 결과물이 기사가 아니라 웹 애플리케이션일 때다. 원문이 직접 막는 목록은 관리 화면, 폼, 드래그 작업대, 완전한 대시보드, 제품 프로토타입, 범용 웹앱이다.[](source:bound)
- README는 웹앱, 대시보드, 폼, 프로토타입, 일반 랜딩 페이지는 `web-design-engineer`로 가라고 한다. 애매하면 스킬이 멈추고 묻는다고 적는다.[](source:rd-faq)
- 기사 안에도 Raw 자유층(HTML·CSS·JS·React로 쓰는 인터랙션, 레이아웃, 모션, 작은 도구, SVG·canvas 도해)을 넣을 수 있다. 다만 읽기, 설명, 논증, 리듬, 미감에 봉사해야 한다.[](source:bound)

README는 실행 환경이 셸 명령, 작업 폴더 파일 읽기·쓰기를 할 수 있다고 가정한다. 서브에이전트와 Python `MarkItDown`은 있으면 쓰는 선택 사항이다.[](source:rd-tools) 판정: scaffold가 `npm install`과 `reacticle@latest` 설치를 하므로 네트워크와 npm이 없으면 Phase 4부터 진행하기 어렵다. 근거는 scaffold의 npm 확인과 설치 줄이다.[](source:sh-guard)[](source:sh-npm)

## 어떤 순서로 진행하고, 누가 점검하나 {#procedure}

@workflow id=article-flow title="자료에서 기사 납품까지"
| lane prep | 준비 |
| lane check1 | 기획 확인 |
| lane spread | 첫 화면 |
| lane build | 생성과 리뷰 |
| lane ship | 납품 |
| p0 | Phase 0 Intake | external | prep |
| p1 | 자료→Markdown | backend | prep |
| p2 | 편집 기획 | backend | prep |
| cp1 | Checkpoint 1 | external | check1 |
| p4 | First Spread | backend | spread |
| cp2 | 첫 화면 통과? | external | spread |
| p5 | 전체 생성 | backend | build |
| p6 | 최종 리뷰 | backend | build |
| p7 | 최소 단위 수리 | backend | build |
| cp3 | Checkpoint 3 | external | ship |
| p8 | Delivery | backend | ship |
| p0 > p1 | 자료 있음 |
| p1 > p2 | |
| p2 > cp1 | 자체 점검 후 |
| cp1 > p4 | 5개 답 수집 | emphasis |
| p4 > cp2 | 리뷰 후 |
| cp2 > p5 | 통과 | emphasis |
| cp2 > cp1 | 테마·판형 부적합 | dashed |
| p5 > p6 | |
| p6 > p7 | fail 항목 |
| p7 > cp3 | |
| cp3 > p8 | 납품 결정 | emphasis |

@steps id=article-steps
| p0 | Phase 0 Intake | 이 스킬에 들어갈지, 처음 기사 유형과 최종 언어를 정한다. 자료가 없으면 되묻고, 앱 요청이면 멈춘다. 처음에 읽을 파일은 `references/harness.md`다.[](source:p0)[](source:read) | article-flow | p0 |
| p1 | 자료→Markdown | 어떤 입력이든 `source/source.md`로 통일하고 불확실한 점은 `source/extraction-notes.md`에 적는다. 사용자가 원문과 다른 언어를 지정했을 때만 `source/source.<lang>.md` 번역본을 만들고, 이후 단계는 그 번역본을 사실 기반으로 쓴다.[](source:p1) | article-flow | p1 |
| p2 | 편집 기획 | HTML은 쓰지 않는다. `plan/plan.md` 한 파일에 Brief, Outline, Theme, Assets 네 단락을 쓴다. 쓴 뒤 메인 에이전트가 자리에서 5개 항목으로 점검하고 고친다.[](source:p2)[](source:rc-plan) | article-flow | p2 |
| cp1 | Checkpoint 1 | 결정 5개를 하나씩 묻고 모두 답을 받을 때까지 다음 일을 하지 않는다. 자세한 항목은 다음 패널에 있다.[](source:cp1tpl) | article-flow | cp1 |
| p4 | First Spread | 여기서 scaffold로 작업 폴더를 만든다. 표지(켰다면), 첫 화면, 첫 Section, 대표 시각 블록 하나를 만든다. 첫 Section은 반드시 `article/sections/01-*.tsx` 독립 파일이다. 끝나면 First Spread Reviewer 서브에이전트가 `review/first-spread-review.md`를 쓰고, 에이전트는 fail 항목을 고친다.[](source:p4) | article-flow | p4 |
| cp2 | 첫 화면 통과? | 수용 결론과 개발 모드 A/B를 따로 묻는다. "테마나 판형이 맞지 않음"을 고르면 Checkpoint 1로 돌아간다.[](source:cp2) | article-flow | cp2 |
| p5 | 전체 생성 | Checkpoint 2에서 고른 모드로 섹션을 한 파일씩 만든다. 섹션마다 Section Reviewer 서브에이전트가 `pass`·`fail` 결론과 고칠 점을 메시지로 돌려준다.[](source:p5) | article-flow | p5 |
| p6 | 최종 리뷰 | Editorial, Visual, Technical 세 관점으로 검토해 `review/final-review.md`를 쓴다.[](source:p6) | article-flow | p6 |
| p7 | 최소 단위 수리 | 문제가 난 Section, Raw 블록, 파일과 줄 단위로만 고친다. 고친 것이 있을 때만 `review/repair-log.md`를 쓴다.[](source:p7)[](source:rep) | article-flow | p7 |
| cp3 | Checkpoint 3 | 납품 결정 하나를 묻는다. 결정이 하나뿐이어도 반드시 멈춰서 묻고, HTML 내보내기를 기본으로 진행하지 않는다.[](source:cp3) | article-flow | cp3 |
| p8 | Delivery | `article/article.html`과 짧은 편집 설명을 넘긴다. PDF는 사용자가 골랐을 때만 만든다.[](source:p8) | article-flow | p8 |

Checkpoint 2에서 "부분 수정"을, Checkpoint 3에서 "부분 수리"를 고른 뒤 어느 단계로 돌아가는지는 `원문에 명시 없음`이라 그림에 그리지 않았다.[](source:cp2)[](source:cp3)

원문은 서브에이전트를 어디서 쓰고 어디서 쓰지 않을지를 표로 못 박는다. 이유로 "잘못 띄운 서브에이전트와 잘못 쓴 파일이 첫째 성능 문제"라고 든다.[](source:qc)

| 지점 | 점검 방식 | 남기는 것 |
| --- | --- | --- |
| Phase 1(기본) | 메인 에이전트가 자리에서 5개 점검 | 파일 없음[](source:qc) |
| Phase 1(복잡하거나 확신이 낮은 자료만) | Source Reviewer 서브에이전트가 `original.*`와 대조 | `review/source-review.md`[](source:s2m-check) |
| Phase 2, Checkpoint 1 전 | 메인 에이전트 자체 점검. {bad:서브에이전트 금지} | 파일 없음. `review/plan-review.md` 금지[](source:p2) |
| Phase 4, Checkpoint 2 전 | First Spread Reviewer 서브에이전트 | `review/first-spread-review.md`[](source:qc) |
| Phase 5, 섹션마다 | Section Reviewer 서브에이전트 | 메시지로 pass/fail만. `review/section-NN-review.md` 금지[](source:law14) |
| Phase 6, Checkpoint 3 전 | Editorial·Visual·Technical 서브에이전트 | `review/final-review.md`[](source:qc) |

- 서브에이전트를 쓸 수 없는 환경이면 메인 에이전트가 대신 점검하고, 파일 맨 앞에 "无 SubAgent 环境，主 Agent 兜底"라고 적는다.[](source:law14)
- 점검 결과를 받으면 fail 항목을 먼저 고친 다음 "끝냈다, 점검 결론, 고친 것"을 보고한다. 고치지 않고 결과만 전하면 원문은 위반으로 본다.[](source:law14)
- 에이전트는 결정을 대화 기억에 맡기지 않는다. 확인된 결정이 헷갈리면 `plan/plan.md`, `review/` 같은 상태 파일을 다시 읽는다.[](source:harness)

## 세 번의 사람 확인 지점(Checkpoint)에서 무엇을 묻나 {#checkpoints}

세 Checkpoint 모두 같은 수집 규칙을 따른다. 에이전트는 추천할 수 있지만 "이미 X로 정했으니 아니면 말해 달라"고 하면 안 된다.[](source:law5)

- `AskQuestion` 도구가 있으면 결정마다 질문을 하나씩 넣는다. 한 번 호출에 여러 질문을 넣어도 된다.[](source:cp1law)
- 도구가 없으면 질문에 번호를 붙여 문단마다 하나씩 쓰고, 추천안·이유·대안을 적는다. "我等你逐项答复后再继续"(항목마다 답을 받은 뒤 계속하겠다)라고 쓰고 다음 작업을 하지 않는다.[](source:cp1law)
- 여러 결정을 "전부 추천대로 할까요?" 같은 예/아니오 하나로 묶지 않는다.[](source:law5)

**Checkpoint 1: 기획 확인, 결정 5개**[](source:cp1tab)

| # | 결정 | 선택지 | 원문 메모 |
| --- | --- | --- | --- |
| 1 | 글 유형(보존 비율 포함) | 아래 유형 표의 10개 | AI가 하나를 추천하고 이유를 한 줄 쓴다. 비율은 유형 안에 묶여 따로 묻지 않는다 |
| 2 | 테마 | `tufte`, `press`, 그 밖의 등록 테마(`theme-profiles/index.json`) | AI가 하나를 추천한다 |
| 3 | 판형 폭 | `narrow`, `regular`, `wide`, `full` | 기본 `regular` |
| 4 | 이미지 모드 | `none`, `user-assets`, `placeholders`, `ai-generated` | 필수 선택. "기본으로 통과"를 허용하지 않는다 {caution:필수} |
| 5 | 표지 | 켬(기본), 끔 | 켜면 구도 아이디어와 템플릿 A~E를 한 줄 제시. `briefing`·`dialogue`는 끄기를 추천할 수 있다 |

- 다섯 개 답이 모두 와야 Phase 4로 간다. 사용자가 비표준 보존 비율을 자유 문장으로 주면, `plan/plan.md`에 적은 것을 확인한 뒤 Phase 4로 간다.[](source:cp1tpl)
- TOC는 따로 묻지 않는다. 시작 메시지에서 "TOC 켬, 끄려면 알려 달라"고 한 줄로 알린다.[](source:cp1def)
- 따로 묻지 않는 기본값도 시작 메시지에 밝혀 번복할 기회를 준다. 최종 언어는 원문을 따르고, 편집 삭제·재구성·어조 변경은 허용하며, 첫 화면 시안을 먼저 만든다.[](source:cp1def)
- 사용자가 테마를 "네가 정해"라고 하면 첫 추천을 고르되, 다른 후보와 나란히 "기본 · AI 추천"으로 표시해 번복할 여지를 남긴다.[](source:cp1def)
- 사용자가 "longform인데 60%만"처럼 비율을 바꾸면 `plan/plan.md` Brief에 유형, 표준 비율, 사용자 지정 비율을 함께 적는다. 비표준 조합이라는 것도 알린다.[](source:cp1def)
- 이미지 모드는 외부 `Image` 사용만 정한다. Raw는 어느 모드에서도 그대로 쓴다. `ai-generated`를 고르면 에이전트는 이미지 프롬프트를 먼저 만들고 사용자가 확인한 뒤에 이미지를 만든다.[](source:asset)

**Checkpoint 2: 첫 화면 확인, 결정 2개**[](source:cp2)

| 질문 | 선택지 |
| --- | --- |
| 수용 결론 | 통과 · 전체 생성으로 / 부분 수정 · 고칠 곳은 따로 말함 / 테마나 판형이 맞지 않음 · Checkpoint 1로 |
| 개발 모드 | A · 메인 에이전트 혼자 차례로(기본, 가장 안정적이고 문체가 고름) / B · 여러 에이전트 병렬(가장 빠르고 문체가 조금 다름) |

원문은 "통과 + A 괜찮나요?"로 묶지 말라고 한다. 사용자가 통과시키면서 B를 원할 수도 있기 때문이다.[](source:cp2)

**Checkpoint 3: 납품 확인, 결정 1개**[](source:cp3)

| 질문 | 선택지 |
| --- | --- |
| 납품 결정 | 통과 · HTML 내보내기 / 통과 · HTML과 PDF 함께 / 아직 부분 수리 있음 · 고칠 곳을 적음 / 잠깐 멈춤 · 더 보겠음 |

**글 유형과 보존 비율.** SKILL.md는 유형마다 표준 비율 하나를 적고, `references/article-types.md`는 범위를 적는다.[](source:cp1tab)[](source:at)

| 유형 | 쓰는 곳 | SKILL.md 표준 | article-types.md 범위 |
| --- | --- | --- | --- |
| `longform` | 완전한 장문, 보관 | ~100% | 100% |
| `full-report` | 연구 보고서, 공식 분석 | ~80% | 80% |
| `tutorial` | 단계별 따라 하기 | ~90% | 80-100% |
| `explainer` | 개념·시스템 설명 | ~80% | 80% |
| `dialogue` | 대담, 인터뷰, 팟캐스트 | ~80% | 80% |
| `review` | PR, 설계안, 사고 리뷰 | ~70% | 60-80% |
| `essay` | 의견, 평론, 서사 | ~70% | 60-80% |
| `interactive-explainer` | 직접 조작하며 배우기 | 원문 발췌 ~25% + AI 재구성 75% | ~25%(원문 발췌 비중) |
| `briefing` | 바쁜 사람용 결정 요약 | ~50% | 40-60% |
| `visual-essay` | 그림 위주, 전파용 | ~40% | 20-60% |

`interactive-explainer`의 25%는 원문을 75% 지운다는 뜻이 아니다. 완성본에서 원문 문장·문단이 차지하는 비중이 25% 정도이고, 나머지는 AI가 새로 쓴 안내와 인터랙션이다. 자체 점검에서는 40%를 넘으면 너무 높고 10% 미만이면 너무 낮다고 본다.[](source:ie-t)

**테마.** `theme-profiles/index.json`에는 11개가 등록돼 있고, 각각 `runtimeTheme`이 있다. 테마 프로필은 CSS가 아니라 AI가 쓰기 전에 읽는 지침이다.[](source:idx)[](source:tsel)

| id | 분위기(요약) | 원문 `bestFor` |
| --- | --- | --- |
| `tufte` | 증거·데이터, 장식 최소 | longform, full-report, explainer, review, tutorial |
| `press` | 출판·서사, 따뜻한 편집 | essay, briefing, visual-essay, longform, explainer |
| `shannon` | 어두운 바탕의 공학 증거 | postmortem, system-design, benchmark, explainer, review, tutorial |
| `vignelli` | 스위스 그리드, 차가운 중성 문서 | docs, spec, changelog, reference, explainer, tutorial |
| `knuth` | 학술 프리프린트, 수식·번호 우선 | paper, preprint, research, literature-review, explainer, full-report |
| `freddie` | 따뜻한 노랑, 친근함 | explainer, tutorial, product-intro, changelog, faq |
| `andy` | 차분하고 부드러움 | explainer, tutorial, wellness, onboarding, lifestyle |
| `bodoni` | 흑백 고대비 신문 | longform, essay, manifesto, feature, review |
| `bayer` | 바우하우스 삼원색 기하 | explainer, tutorial, manifesto, product-intro, brand |
| `fuller` | 청사진, 공학 도면 | spec, system-design, rfc, reference, explainer |
| `sottsass` | 멤피스 80년대 원색 대비 | explainer, tutorial, culture, launch, design-writing |

에이전트는 기술·증거 자료면 `tufte`, 서사·평론 자료면 `press`를 우선 추천한다.[](source:defs) 새 테마는 컴포넌트 라이브러리의 runtime 등록, Skill profile, `index.json` 연결이 모두 있어야 정식 생성에 쓴다.[](source:tnew)

## 무엇을 강제하고 금지하나, 수치는 무엇인가 {#rules}

| 규칙 | 에이전트가 하는 일 | 근거 |
| --- | --- | --- |
| 기사 우선 | 결과물은 앱이 아니라 기사여야 한다. Raw와 이미지는 읽기를 돕는다 | 경계, 성공 기준[](source:bound)[](source:success) |
| 결정 대리 금지 | Checkpoint마다 결정을 하나씩 묻고 답을 기다린다 {bad:대신 정하기 금지} | 철칙 5[](source:law5) |
| 한 Section 한 파일 | 섹션마다 `article/sections/NN-*.tsx` 파일을 만든다. 여러 섹션을 한 컴포넌트에 쓰지 않는다. `Article.tsx`는 메인 에이전트가 가진 조립 파일이다 {bad:한 파일에 몰기 금지} | Phase 5[](source:p5) |
| 장 번호 | 전체 번호는 메인 에이전트가 정한다. 병렬 서브에이전트는 "너는 `<NN>`장"을 받아 쓰고, 08장 아래 소절은 8.1, 8.2만 쓴다 | `section-build.md`[](source:sb-num) |
| 컴포넌트 규약 | 맨 `div`, `className`, 인라인 `style`, CSS를 직접 쓰지 않고 `reacticle` 의미 컴포넌트를 쓴다. 필수 값이 없으면 지어내지 말고 비워 `⚠ 未指定` 표시가 보이게 둔다. 코드는 `CodeBlock`만 쓴다 | `component-policy.md`[](source:comp) |
| Raw 토큰 | Raw 안은 자유롭지만 색·글꼴·간격은 `--ra-*` 토큰에서 가져온다 {bad:임의 스타일 금지} | Phase 5, `raw-policy.md`[](source:p5)[](source:raw) |
| Raw 금지 목록 | 복잡한 폼, 드래그 작업대, 완전한 대시보드, 제품 프로토타입, 글과 무관한 애니메이션, 테마와 따로 노는 색, 고정 위젯 재사용 | `raw-policy.md`[](source:raw) |
| colophon | scaffold가 넣은 "Made with beautiful-article · `<테마>` theme" 줄을 지우거나 옮기지 않는다. 테마를 바꾸면 `main.tsx`와 이 줄을 함께 고친다 | 기본 전략, 템플릿[](source:defs)[](source:tpl-colo) |
| 표지 | 3:4 외곽을 건드리지 않는다. 그림과 글자가 모두 있어야 하고, `--ra-*` 토큰만 쓰고, 원격 이미지를 쓰지 않고, Hero 내용을 반복하지 않는다 | 기본 전략, `cover.md`[](source:defs)[](source:cv-hard) |
| AI 이미지 | 이미지를 먼저 만들지 않는다. `ai-generated`는 사용자가 명시적으로 골라야 한다 | 기본 전략, `asset-policy.md`[](source:defs)[](source:asset) |
| 수리 범위 | 지적 하나에 전체를 다시 쓰지 않는다. 시각 문제로 확정된 구조를 바꾸지 않는다. 압축하려고 반드시 남길 내용을 지우지 않는다 | Phase 7[](source:p7)[](source:rep) |
| PDF | 사용자가 Checkpoint 3에서 고를 때만 만든다. 기본으로 체크하지 않는다 | 기본 전략, `pdf-output.md`[](source:defs)[](source:pdf-not) |

Raw를 하나 넣을 때마다 에이전트는 네 가지를 묻는다. 지우면 이해가 나빠지는가, 어느 단락을 돕는가, `--ra-*` 토큰을 쓰는가, 기사를 앱처럼 만드는가.[](source:raw-check)

최종 리뷰의 핵심 기준도 원문에 적혀 있다. 여전히 기사인가, 보존 비율이 Plan과 맞는가, 반드시 남길 정보가 남았는가, 테마가 통일됐는가, Raw에 임의 스타일이 없는가, AI 티 나는 표현이 없는가, 데스크톱과 모바일에서 읽히는가, HTML이 빌드되고 열리는가.[](source:p6) Visual Reviewer는 장식용 시각, 보라·분홍 그라데이션, 둥근 색 카드, 가짜 일러스트, 이모지 장식을 AI 티로 본다.[](source:rc-final)

수치는 성격을 나눠서 읽는다.

| 값 | 성격 | 적용 조건 |
| --- | --- | --- |
| 결정 5개 / 2개 / 1개 | 의무 | Checkpoint 1 / 2 / 3에서 각각 따로 묻는다[](source:cp1tab)[](source:cp2)[](source:cp3) |
| 자체 점검 5개 | 의무 | Phase 1 자료 점검, Phase 2 Plan 점검, 표지 점검이 각각 5개다[](source:s2m-check)[](source:rc-plan)[](source:cv-check) |
| plan 200-400줄, 기사 5-15절 | 설명 | 서브에이전트를 쓰지 않는 이유와 섹션별 리뷰 파일을 쓰지 않는 이유로 든 값이다[](source:qc) |
| 폭 `narrow` ~34rem, `regular` ~46rem, `wide` ~58rem, `full` ~78rem | 기본값과 권고 | 기본은 `regular`. 표·코드가 많으면 최소 `wide`. `reacticle` 0.2.0 이상 필요[](source:lay) |
| TOC 최대 3단계, 1000px 미만에서 한 단 | 동작 | TOC를 켜면 왼쪽 목차와 본문 두 단이 된다[](source:lay) |
| 표지 3:4, 최대 폭 `min(100%, 48rem, calc((100vh - 8rem) * 3 / 4))` | 의무 | 1024px보다 높은 화면에서 768×1024. PDF에서 A4는 위아래 약 4%, Letter는 약 3% 여백이 남는다[](source:cv-size) |
| 표지 템플릿 A~E 중 하나 | 권고 | 기사 하나에 템플릿 하나, 섞지 않는다[](source:cv-tpl) |
| `briefing` 3-5분, 문단 3문장 이하, Raw 0-2개, 핵심 사실 3-5개 | 유형별 권고 | `briefing.md`[](source:brief-t) |
| `longform` TOC 조건: 10절 초과 또는 예상 15분 초과 | 유형별 권고 | SKILL.md는 TOC를 기본으로 켠다[](source:lf-t)[](source:defs) |
| MarkItDown은 Python 3.10 이상 | 전제 | PDF·DOCX·복잡한 HTML이나 80-100% 보존이면 먼저 시도한다. `markitdown[all]`을 기본으로 설치하지 않는다[](source:s2m-script) |
| PDF `--virtual-time-budget=5000` | 스크립트 기본값 | 페이지 JS에 5초를 준다. Raw가 덜 그려지면 10000 이상으로 올리라고 한다[](source:pdf-flags) |

성공 기준에는 정성 기준도 있다. 40% 보존이면 줄인 요약이 아니라 편집된 기사처럼, 100% 보존이면 원문 옮기기가 아니라 다듬은 장문처럼 읽혀야 한다.[](source:success)

## 무엇을 만들고 무엇을 남기나 {#outputs}

에이전트는 Phase 4에서 `scripts/scaffold.sh`를 한 번 실행해 작업 폴더를 만든다. 원문 예시는 `bash <path>/scripts/scaffold.sh ./my-article --theme=<id>`이고, 표지를 끄면 `--no-cover`를 붙인다.[](source:p4)

@tree id=workspace-layout title="scaffold가 만드는 작업 폴더"
| ws | workspace/ | - | source:ws |
| src | source/ | ws | source:p1 |
| srcmd | source.md, extraction-notes.md | src | source:p1 |
| plan | plan/plan.md | ws | source:p2 |
| art | article/ | ws | source:ws |
| cover | Cover.tsx (표지, 기본) | art | source:p4 |
| assm | Article.tsx (조립 파일) | art | source:p5 |
| secs | sections/NN-*.tsx | art | source:p5 |
| raws | raw-blocks/NN-*.tsx | art | source:p5 |
| outhtml | article.html (납품물) | art | source:p8 |
| rev | review/ | ws | source:ws |
| fsr | first-spread-review.md | rev | source:p4 |
| fin | final-review.md | rev | source:p6 |
| optrev | source-review.md, repair-log.md (조건부) | rev | source:ws |
| tool | package.json, vite.config.ts 등 | ws | source:ws |

- scaffold는 Vite + React + TypeScript 템플릿을 복사하고, `npm install` 뒤 `npm install reacticle@latest`로 최신판을 받는다. 대상 폴더가 비어 있지 않으면 중단한다.[](source:sh-guard)[](source:sh-npm)[](source:scaf)
- `npm run html`은 타입 검사와 빌드를 한 뒤 `dist/index.html`을 `article/article.html`로 복사한다. CSS와 JS는 `vite-plugin-singlefile`이 인라인한다.[](source:html)[](source:tpl-pkg)
- 납품물은 `article/article.html`과 짧은 편집 설명이다. 설명에는 글 유형, 보존 비율, 테마, 이미지 전략, 주요 편집 판단을 적는다.[](source:p8)
- PDF를 고르면 `scripts/html-to-pdf.sh`가 설치된 Chromium 계열 브라우저를 찾아 창 없이(headless) 인쇄한다. 브라우저가 없으면 인쇄용 CSS를 넣은 HTML 경로를 알려 주고, 사용자가 직접 `Cmd+P`로 저장하게 한다.[](source:pdf-req)[](source:pdf-sh)
- PDF에서는 Raw 인터랙션이 초기 상태로만 그려진다.[](source:pdf-ie)

## 흐름 속 위치 {#position}

@workflow id=ba-position title="beautiful-article 앞뒤"
| pos-req | 자료와 기사 요청 | external |
| pos-wde | web-design-engineer | backend |
| pos-ba | beautiful-article | backend |
| pos-req > pos-ba | 자료+기사 | emphasis |
| pos-wde > pos-ba | 기사 변환 (r32) | dashed |
| pos-ba > pos-wde | 앱·대시보드 (r34) | dashed |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `web-design-engineer`(앞) | 자료를 장문 HTML 기사로 바꾸는 요청 | - | `web-design-engineer`는 이 작업을 적용 대상에서 빼고 "있으면 전용 스킬로 넘기라"고 한다. 이름은 적지 않았다(명시-역할). 같은 컬렉션에서 그 역할에 맞는 스킬은 `beautiful-article` 하나다[](source:wde)[](source:fm) | r32 |
| `web-design-engineer`(옆) | - | 웹앱·대시보드·폼·프로토타입·일반 랜딩 페이지 요청 | README FAQ가 이름을 들어 넘긴다. 애매하면 멈추고 묻는다. `SKILL.md`는 "기사만 만든다"는 경계와 "앱이면 멈추고 확인한다"만 적고 이름은 부르지 않는다[](source:rd-faq)[](source:bound) | r34 |
| (뒤) | - | `article/article.html`, 선택 시 `article/article.pdf`, 편집 설명 | 받는 쪽은 사람이다. 원장에 이 스킬 뒤에 오는 스킬은 없다[](source:p8) | - |

두 관계 모두 사용자 요청을 넘기는 넘김이고, 공유 파일은 없다. 이미지 모드 `ai-generated`도 `gpt-image-2`를 이름으로 부르지 않으며, 원장에 둘 사이 관계는 없다.[](source:asset)

전체 흐름은 `design/_group-garden-visual/garden-visual.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 원본 텍스트 파일은 57개, 합계 253,012B다. 모두 끝까지 읽었고 구조·표본만 본 파일은 없다. 파일별 바이트와 역할은 같은 폴더의 `files.md`에 있다.
- 제외한 파일: 번역본 40개(`*.ko.md`)와 `README.zh-CN.md`(23,731B). 영어 `README.md`가 같은 폴더에 있어 중국어 README를 번역본으로 보고 열지 않았다. 바이너리 파일은 이 폴더에 없다.
- 스크립트(`scaffold.sh`, `html-to-pdf.sh`, 추출 스크립트 둘)는 읽기만 했다. 실행하지 않았으므로 실제 빌드, PDF 결과, 설치되는 `reacticle` 판은 확인하지 않았다.
- 원문 대조 범위: 활성화 제한 1개(호출 제한 필드 없음), 진입 판단 3행, 사람 확인 지점 3곳의 결정 8개와 선택지, 품질 점검 표 6행, 금지·강제 12행, 수치 11행, 종료 조건(Checkpoint 3 결정 뒤 Phase 8 납품)을 모두 대조했다. 관계 행 r32, r34는 원장과 원문을 다시 대조했고 같다.
- 분석 중 바뀐 파일: 없음. `design/` 아래 작업 트리는 commit `4e3fc89` 그대로다.

원문끼리 어긋나는 곳이다. 우선순위가 적혀 있지 않아 정리하지 않고 그대로 둔다.

| 항목 | 한쪽 | 다른 쪽 |
| --- | --- | --- |
| 사람 확인 횟수 | `description`의 "双确认", `manifest.json`의 "double-confirmation"[](source:fm)[](source:mf) | 본문과 README는 ★ Checkpoint 세 개[](source:flow)[](source:rd-flow) |
| 쓸 수 있는 runtime 테마 | `html-output.md`, `theme-selection.md`, `scaffold.sh` 안내 문구, `main.tsx` 주석은 `tufte`·`press`만 든다[](source:html)[](source:tsel)[](source:sh-theme)[](source:tpl-main) | `index.json`은 11개 모두에 `runtimeTheme`을 적고, README도 11개라고 한다[](source:idx)[](source:rd-core) |
| 표지 템플릿 이름 | `cover.md`: A 위 글자 아래 그림, B 큰 글자가 그림 덮기, C 위아래 분할, D 전면 콜라주, E 미니멀 틀[](source:cv-tpl) | `plan-template.md`: A 왼쪽 글자 오른쪽 그림, B 큰 글자가 그림 덮기, C 위 글자 아래 그림, D 기하 콜라주, E 미니멀 틀[](source:plan-tpl) |
| Plan Checkpoint 필수 질문 수 | `information-density.md`는 "4개 필수 질문 중 하나"[](source:dens-ask) | SKILL.md는 5개[](source:cp1tab) |
| 최종 리뷰 서브에이전트 | 철칙 2: First Spread와 Final은 반드시 서브에이전트[](source:law14) | Phase 6: 리뷰어 셋을 "추천"하고, Teams가 없으면 적어도 독립 서브에이전트 하나[](source:p6) |
| PDF 결정 시점 | SKILL.md: Checkpoint 3에서 고른다[](source:cp3) | `pdf-output.md`: `interactive-explainer`는 "Plan 단계에서" PDF를 켜지 않을 수 있다[](source:pdf-ie) |

@callout level=open-question title="확인하지 못한 것"
- 오프라인 보장: scaffold 템플릿 `index.html`은 Google Fonts를 `<link>`로 불러온다. `vite-plugin-singlefile`이 이 외부 링크까지 넣어 주는지는 빌드해 보지 않아 모른다. 판정: 오프라인에서는 글꼴이 대체 글꼴로 바뀔 가능성이 있다. `cover.md`는 표지에서 Google Fonts 동적 로드를 금지한다.[](source:tpl-font)[](source:cv-hard)
- `section-build.md`는 조립 뒤 번호를 `outline.md` 순서와 대조하라고 한다. 지금 구조에는 `outline.md`가 없고 Outline은 `plan/plan.md` 안에 있다. 같은 것을 가리키는지 원문에 명시 없음이다.[](source:sb-num)[](source:p2)
- `pdf-print-overrides.css` 머리 주석은 네 묶음(0, A, B, C)이라 하고 `pdf-output.md`는 세 묶음(A, B, C)으로 설명한다. 내용 차이는 0번 묶음(종이색 유지)뿐인 것으로 읽었다.[](source:css-head)
- 이 스킬이 실제로 사람 확인을 지키는지, 서브에이전트 비용 규칙이 성능을 바꾸는지는 실행해 보지 않아 판단하지 않았다.
