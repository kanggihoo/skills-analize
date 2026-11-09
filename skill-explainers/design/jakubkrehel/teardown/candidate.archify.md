# teardown 스킬은 에이전트를 어떻게 바꾸나 {#teardown-skill}

`teardown`을 쓰면 에이전트는 물체나 개념을 증거 표부터 만들고, 모델 하나에서 모든 뷰를 투영해 기술 일러스트로 그린다. 그린 뒤에는 렌더한 그림을 직접 확인하고, 한 파일짜리 preview 페이지로 묶는다. 결과는 설명용이다. **제조 도면이 아니다.**[](source:td-scope)

- 켜지는 때: 물체, 사진, CAD 모델, 개념을 기술 일러스트로 그려 달라고 할 때다. 호출 제한 필드는 없다.[](source:td-fm)
- 강제하는 것: `evidence.md`에 근거 종류를 적고, 모든 뷰를 한 모델에서 만들고, 렌더한 그림을 보고 고친다. 지어낸 치수는 지어낸 채로 둔다.[](source:td-ev)[](source:td-s3)[](source:td-s5)
- 쓰면 안 되는 때: 부품을 만들 도면이 필요할 때다. 이때는 그렇게 말하고 CAD 도구의 drawing workflow로 안내한다.[](source:td-scope)
- 실제로 켜면 하는 일: `tools/teardown/`에 코드를 복사하고, 패키지를 설치하고, `node` 스크립트와 headless Chrome을 쓴다. 이 분석은 어느 것도 실행하지 않았다.[](source:td-s3)[](source:vw-cfg)[](source:vw-test)

@answer scope="design/jakubkrehel/teardown · 지시상 동작 · 코드 4개는 부분 읽음 · 실행 안 함"
@meta locale=ko
@source td-fm title="design/jakubkrehel/teardown/SKILL.md · 10593B · 지시 본문과 frontmatter" path=design/jakubkrehel/teardown/SKILL.md lines=1:4
@source td-scope title="SKILL.md · 만드는 것과 제조 도면이 아니라는 선" path=design/jakubkrehel/teardown/SKILL.md lines=8:10
@source td-exact title="SKILL.md · 정확해야 하는 것과 시작 레시피" path=design/jakubkrehel/teardown/SKILL.md lines=12:12
@source td-bound title="SKILL.md · 이웃 스킬 경계" path=design/jakubkrehel/teardown/SKILL.md lines=14:14
@source td-s1 title="SKILL.md · 1단계 대상과 reference 읽기" path=design/jakubkrehel/teardown/SKILL.md lines=18:24
@source td-ev title="SKILL.md · 증거 표와 1단계 완료 조건" path=design/jakubkrehel/teardown/SKILL.md lines=26:40
@source td-ask title="SKILL.md · 가정을 밝히고 진행, 질문 조건" path=design/jakubkrehel/teardown/SKILL.md lines=38:38
@source td-s2 title="SKILL.md · 2단계 뷰 고르기" path=design/jakubkrehel/teardown/SKILL.md lines=44:52
@source td-viewer title="SKILL.md · viewer가 하는 일과 범위 밖" path=design/jakubkrehel/teardown/SKILL.md lines=54:58
@source td-s2done title="SKILL.md · 2단계 완료 조건" path=design/jakubkrehel/teardown/SKILL.md lines=60:60
@source td-s3 title="SKILL.md · 3단계 모델과 투영" path=design/jakubkrehel/teardown/SKILL.md lines=64:68
@source td-order title="SKILL.md · 모델링 순서 네 가지" path=design/jakubkrehel/teardown/SKILL.md lines=70:77
@source td-s3proof title="SKILL.md · 3단계 quick proof와 완료 조건" path=design/jakubkrehel/teardown/SKILL.md lines=79:81
@source td-s4 title="SKILL.md · 4단계 선과 주석" path=design/jakubkrehel/teardown/SKILL.md lines=85:89
@source td-s5 title="SKILL.md · 5단계 렌더와 확인" path=design/jakubkrehel/teardown/SKILL.md lines=93:97
@source td-s6 title="SKILL.md · 6단계 포장과 시험" path=design/jakubkrehel/teardown/SKILL.md lines=101:105
@source td-fin title="SKILL.md · 끝내기 전 증상 표 13행" path=design/jakubkrehel/teardown/SKILL.md lines=109:123
@source td-del title="SKILL.md · 전달 방식" path=design/jakubkrehel/teardown/SKILL.md lines=127:129
@source oy title="agents/openai.yaml · 113B · 표시 이름과 짧은 설명" path=design/jakubkrehel/teardown/agents/openai.yaml lines=1:3
@source va title="views-and-annotations.md · 3405B · 뷰별 주석 문법" path=design/jakubkrehel/teardown/views-and-annotations.md lines=1:53
@source va-ortho title="views-and-annotations.md · 정투상 정렬" path=design/jakubkrehel/teardown/views-and-annotations.md lines=5:11
@source va-balloon title="views-and-annotations.md · balloon 규칙" path=design/jakubkrehel/teardown/views-and-annotations.md lines=25:35
@source va-dim title="views-and-annotations.md · 치수 규칙" path=design/jakubkrehel/teardown/views-and-annotations.md lines=39:53
@source ex title="exploded-views.md · 3032B · 분해 벡터와 간격" path=design/jakubkrehel/teardown/exploded-views.md lines=1:33
@source ex-gap title="exploded-views.md · 간격과 원점 복원" path=design/jakubkrehel/teardown/exploded-views.md lines=9:11
@source ge title="geometry.md · 8848B · 모델링 규칙" path=design/jakubkrehel/teardown/geometry.md lines=1:107
@source ge-cam title="geometry.md · 카메라 방향" path=design/jakubkrehel/teardown/geometry.md lines=9:23
@source ge-concept title="geometry.md · 개념은 층진 부품으로" path=design/jakubkrehel/teardown/geometry.md lines=41:49
@source ge-prove title="geometry.md · 장식 전에 조립 증명" path=design/jakubkrehel/teardown/geometry.md lines=99:107
@source gl title="geometry-library.md · 13316B · 도우미 함수 표와 render 옵션" path=design/jakubkrehel/teardown/geometry-library.md lines=1:161
@source gl-render title="geometry-library.md · render 옵션과 범위" path=design/jakubkrehel/teardown/geometry-library.md lines=105:140
@source sv title="sheet-and-svg.md · 6288B · 손으로 짜는 시트" path=design/jakubkrehel/teardown/sheet-and-svg.md lines=1:109
@source sv-size title="sheet-and-svg.md · 시트 크기와 선 굵기 레시피" path=design/jakubkrehel/teardown/sheet-and-svg.md lines=3:30
@source sv-fact title="sheet-and-svg.md · 확립된 사실만" path=design/jakubkrehel/teardown/sheet-and-svg.md lines=42:48
@source sv-a11y title="sheet-and-svg.md · SVG title과 desc, 접근성 위임" path=design/jakubkrehel/teardown/sheet-and-svg.md lines=56:58
@source sv-export title="sheet-and-svg.md · PNG와 PDF 내보내기" path=design/jakubkrehel/teardown/sheet-and-svg.md lines=101:109
@source vf title="verification.md · 4896B · 렌더 확인 절차" path=design/jakubkrehel/teardown/verification.md lines=1:67
@source vf-proof title="verification.md · proof 명령 표" path=design/jakubkrehel/teardown/verification.md lines=5:21
@source vf-trace title="verification.md · 대응 확인 표" path=design/jakubkrehel/teardown/verification.md lines=35:51
@source vf-fin title="verification.md · 종료 조건" path=design/jakubkrehel/teardown/verification.md lines=65:67
@source vw title="viewer-assets.md · 7141B · viewer 설정과 빌드" path=design/jakubkrehel/teardown/viewer-assets.md lines=1:112
@source vw-cfg title="viewer-assets.md · drawing.json과 의존 설치" path=design/jakubkrehel/teardown/viewer-assets.md lines=7:49
@source vw-model title="viewer-assets.md · 모델 경계" path=design/jakubkrehel/teardown/viewer-assets.md lines=53:86
@source vw-build title="viewer-assets.md · 한 파일 빌드와 전달 파일" path=design/jakubkrehel/teardown/viewer-assets.md lines=90:100
@source vw-test title="viewer-assets.md · 컨트롤과 다운로드 시험" path=design/jakubkrehel/teardown/viewer-assets.md lines=104:112
@source pp title="preview-page.md · 8081B · 직접 만드는 viewer" path=design/jakubkrehel/teardown/preview-page.md lines=1:117
@source pp-ctl title="preview-page.md · 컨트롤 표와 이웃 스킬" path=design/jakubkrehel/teardown/preview-page.md lines=13:31
@source pp-color title="preview-page.md · 색과 better-colors" path=design/jakubkrehel/teardown/preview-page.md lines=61:71
@source pp-export title="preview-page.md · 내보내기 규칙" path=design/jakubkrehel/teardown/preview-page.md lines=73:93
@source sc-build title="scripts/build-viewer.cjs · 2262B · 한 파일 HTML 빌더" path=design/jakubkrehel/teardown/scripts/build-viewer.cjs lines=1:47
@source sc-check title="scripts/check-viewer.cjs · 5819B · headless Chrome 점검" path=design/jakubkrehel/teardown/scripts/check-viewer.cjs lines=1:111
@source sc-cmd title="scripts/commands.cjs · 554B · Chrome 찾기" path=design/jakubkrehel/teardown/scripts/commands.cjs lines=1:17
@source sc-config title="scripts/config.cjs · 2039B · drawing.json 검증" path=design/jakubkrehel/teardown/scripts/config.cjs lines=1:42
@source sc-proof title="scripts/proof.cjs · 10632B · proof 시트 생성" path=design/jakubkrehel/teardown/scripts/proof.cjs lines=1:202
@source ts-flip title="scripts/test-flipbook.cjs · 2868B · 스킬 자체 시험" path=design/jakubkrehel/teardown/scripts/test-flipbook.cjs
@source ts-geo title="scripts/test-geometry.cjs · 27177B · 스킬 자체 시험, 구조·표본만 확인" path=design/jakubkrehel/teardown/scripts/test-geometry.cjs
@source ts-queue title="scripts/test-render-queue.cjs · 4559B · 스킬 자체 시험" path=design/jakubkrehel/teardown/scripts/test-render-queue.cjs
@source ts-theme title="scripts/test-theme.cjs · 3208B · 스킬 자체 시험" path=design/jakubkrehel/teardown/scripts/test-theme.cjs
@source ts-build title="scripts/test-viewer-builder.cjs · 3729B · 스킬 자체 시험" path=design/jakubkrehel/teardown/scripts/test-viewer-builder.cjs
@source as-export title="assets/export.js · 6085B · SVG·PNG·PDF 저장" path=design/jakubkrehel/teardown/assets/export.js lines=1:146
@source as-flip title="assets/flipbook.js · 1858B · 조립과 분해 사이 프레임 미리 그리기" path=design/jakubkrehel/teardown/assets/flipbook.js lines=1:50
@source as-geo title="assets/geometry.js · 27027B · 도우미 함수 구현, 구조·표본만 확인" path=design/jakubkrehel/teardown/assets/geometry.js lines=1:531
@source as-proj title="assets/projection.js · 28466B · 투영과 은선 제거, 구조·표본만 확인" path=design/jakubkrehel/teardown/assets/projection.js lines=1:603
@source as-queue title="assets/render-queue.js · 2203B · worker 작업 줄" path=design/jakubkrehel/teardown/assets/render-queue.js lines=1:81
@source as-sheet title="assets/sheet.js · 901B · 시트 크기와 선 굵기 프리셋" path=design/jakubkrehel/teardown/assets/sheet.js lines=1:21
@source as-theme title="assets/theme.js · 1467B · 밝고 어두운 모드" path=design/jakubkrehel/teardown/assets/theme.js lines=1:47
@source as-html title="assets/viewer.html · 17988B · viewer 마크업과 스타일, 구조·표본만 확인" path=design/jakubkrehel/teardown/assets/viewer.html
@source as-html-ctl title="assets/viewer.html · 컨트롤 마크업" path=design/jakubkrehel/teardown/assets/viewer.html lines=251:287
@source as-viewer title="assets/viewer.js · 25359B · viewer 상태와 동작" path=design/jakubkrehel/teardown/assets/viewer.js lines=1:578
@source as-vw-pre title="assets/viewer.js · 미리보기 맞춤" path=design/jakubkrehel/teardown/assets/viewer.js lines=16:16
@source as-vw-flip title="assets/viewer.js · flipbook worker 수" path=design/jakubkrehel/teardown/assets/viewer.js lines=66:70
@source as-vw-zoom title="assets/viewer.js · 확대 범위" path=design/jakubkrehel/teardown/assets/viewer.js lines=391:404
@source as-vw-key title="assets/viewer.js · 키보드 확대 단계" path=design/jakubkrehel/teardown/assets/viewer.js lines=543:552
@source as-vw-store title="assets/viewer.js · 색 저장" path=design/jakubkrehel/teardown/assets/viewer.js lines=8:8
@source as-worker title="assets/worker.js · 439B · 모델 호출" path=design/jakubkrehel/teardown/assets/worker.js lines=1:10

## 언제 켜지고, 무엇은 이 스킬의 일이 아닌가 {#trigger}

@code source=td-fm language=yaml

frontmatter에는 `name`과 `description`만 있다. `disable-model-invocation` 같은 호출 제한 필드는 `SKILL.md`에도 `agents/openai.yaml`에도 없다.[](source:td-fm)[](source:oy) 판정: `description`은 모델이 켤지 판단할 때 참고하는 설명이다. 특정 단어가 있어야만 켜지는 사전은 아니다.

@code source=oy language=yaml

사람 개입은 한 곳뿐이다. 에이전트는 가정을 밝히고 진행하고, 답이 그림 내용을 바꿀 때만 묻는다. 원문이 든 예는 어느 내부 구조가 중요한지다.[](source:td-ask) 승인을 받고 넘어가는 지점은 `원문에 명시 없음`이다.

| 요청 | 에이전트가 하는 일 | 근거 |
| --- | --- | --- |
| 물체, 사진, CAD, 개념을 설명하는 그림 | 아래 6단계로 진행한다 {good:기본} | 원문 1~6단계[](source:td-s1) |
| 부품을 만들 도면 | 제조 도면이 아니라고 말하고, CAD 도구의 drawing workflow를 안내한다 {caution:범위 밖} | 원문 도입[](source:td-scope) |
| 물체 animation이나 simulation | 요청하지 않으면 하지 않는다 {caution:범위 밖} | 2단계 끝 문장[](source:td-viewer) |
| balloon이나 치수가 든 시트 | 기본 viewer에는 없다. 요청이 있을 때만 렌더한 뷰 둘레에 별도 SVG 시트를 짠다 {caution:요청 때만} | 2단계, `sheet-and-svg.md`[](source:td-viewer)[](source:sv-size) |
| 프로젝트 인터페이스에 끼우기, 기본 페이지 교체 | `preview-page.md`를 읽고 그 기준으로 만든다 | 6단계[](source:td-s6) |

이 스킬은 묶음에 속하지 않는다. 역할은 선택지이고, 아래 다섯 스킬과는 호출 순서가 없다. 원문은 이 스킬이 하지 않는 일을 이웃 스킬의 몫으로 적을 뿐, 그 스킬을 부르라고 하지 않는다. 호출 지시는 `원문에 명시 없음`이다.

| 이웃 스킬 | 원문이 그쪽에 맡기는 일 | rel-id |
| --- | --- | --- |
| `better-typography` | 글자 렌더링[](source:td-bound) | r144 |
| `better-colors` | 팔레트, 렌더된 대비[](source:td-bound)[](source:pp-color) | r145 |
| `better-accessibility` | 접근 가능한 임베딩(SVG `title`·`desc` 밖의 부품 목록 대안), 컨트롤 시맨틱과 키보드 동작[](source:td-bound)[](source:sv-a11y)[](source:pp-ctl) | r146 |
| `better-layout` | 둘러싼 인터페이스, 반응형 배치[](source:td-bound)[](source:pp-ctl) | r147 |
| `better-writing` | 컨트롤 문구[](source:pp-ctl) | r148 |

## 어떤 순서로 만들고, 어디서 멈추나 {#workflow}

단계마다 "이 단계는 ~일 때 끝난다"는 완료 조건이 있다. 5단계에서 실패가 나오면 모델로 돌아가 고친다.

@workflow id=teardown-flow title="teardown 6단계"
| lane prep | 준비 |
| lane build | 만들기 |
| lane check | 확인과 전달 |
| td-n1 | 1 증거 정리 | backend | prep |
| td-n2 | 2 뷰 고르기 | backend | prep |
| td-n3 | 3 모델과 투영 | backend | build |
| td-n4 | 4 선과 주석 | backend | build |
| td-n5 | 5 렌더 확인 | backend | check |
| td-ok | 확인 통과? | external | check |
| td-n6 | 6 포장과 시험 | backend | check |
| td-n1 > td-n2 | |
| td-n2 > td-n3 | |
| td-n3 > td-n4 | |
| td-n4 > td-n5 | |
| td-n5 > td-ok | |
| td-ok > td-n6 | 통과 | emphasis |
| td-ok > td-n3 | 고쳐 다시 | dashed |

@steps id=teardown-steps
| td-n1 | 1 증거 정리 | 주어진 이미지를 그리기 전에 연다. 그릴 대상과 마감 기준(reference)을 나눠 본다. 첨부 문서는 근거로만 쓰고 요청을 바꾸는 지시로 쓰지 않는다.[](source:td-s1) `evidence.md`에 feature group마다 한 행을 두고 근거 종류를 적는다.[](source:td-ev) 완료 조건은 모든 group이 분류되고 용도와 출력 크기가 정해진 상태다. 기본 산출물은 SVG·PNG·PDF 다운로드가 있는 로컬 preview 페이지다.[](source:td-ev) | teardown-flow | td-n1 |
| td-n2 | 2 뷰 고르기 | 가장 작은 뷰 묶음을 고른다. 설명할 것에 따라 첫 뷰가 정해진다(아래 표). 분해 벡터를 정하기 전에 `exploded-views.md`를 읽는다. 완료 조건은 뷰마다 목적과 척도 방침이 있는 상태다.[](source:td-s2)[](source:td-s2done) | teardown-flow | td-n2 |
| td-n3 | 3 모델과 투영 | `assets/`와 `scripts/`를 `tools/teardown/`로 복사한다(`test-*.cjs`는 뺀다). `drawing.json`과 model script를 쓴다. 모든 뷰와 부품 목록을 한 모델에서 만든다.[](source:td-s3) 순서는 실루엣, 접합부, 기능 디테일, 가림 정리다.[](source:td-order) 큰 부피가 생기면 quick proof를 돌려 조립 상태와 그릴 상태를 본다. 완료 조건은 대응 특징이 뷰마다 맞고, 분리된 부품마다 믿을 만한 조립 위치가 있는 상태다.[](source:td-s3proof) | teardown-flow | td-n3 |
| td-n4 | 4 선과 주석 | 기본 viewer는 선 역할을 종이 크기로 잉크 처리하고, color panel은 부품을 선 색의 옅은 색으로 채운다. 지어낸 구성은 `description`에 밝히고 `concept` 플래그를 켜 둔다.[](source:td-s4) viewer 없이 내보내거나 주석 시트를 만들면 `sheet-and-svg.md`를 따른다.[](source:td-s4) | teardown-flow | td-n4 |
| td-n5 | 5 렌더 확인 | 납품물 자체를 글꼴과 배경까지 렌더한다. 소스만 보고는 시각 품질을 확인할 수 없다. 가장 큰 실패부터 고치고, 고친 영역과 전체 구도를 다시 본다.[](source:td-s5) 렌더할 수 없으면 편집 가능한 source만 내고 시각 확인 미완료를 밝힌다. 파일 쓰기 성공을 본 preview로 치지 않는다.[](source:td-s5) | teardown-flow | td-n5 |
| td-ok | 확인 통과? | 끝내는 조건은 geometry, 대응, 가독성, export 확인을 모두 통과하는 것이다. 통과하지 못한 한계가 남으면 그 뷰나 특징을 이름으로 적고 정밀하다고 주장하지 않는다.[](source:vf-fin) | teardown-flow | td-ok |
| td-n6 | 6 포장과 시험 | 독립 실행 페이지를 빌드하고 컨트롤과 다운로드 파일을 시험한다. 완료 조건은 컨트롤이 동작하고 모든 다운로드가 선택한 geometry·선·색을 보존하는 상태다. 지원하지 못한 포맷과 확인하지 못한 브라우저 동작은 명시해 보고한다.[](source:td-s6) | teardown-flow | td-n6 |

뷰는 설명할 것에 따라 고른다.[](source:td-s2)

| 설명할 것 | 시작 뷰 |
| --- | --- |
| 부품이 맞물리는 방식 | 분해 axonometric 뷰. 조립 뷰는 스위치 하나로 바꾼다 {good:기본} |
| 한 물체의 바깥 모양 | 평행 투영 뷰 하나. 필요하면 상세 inset |
| 모양과 지정 치수 | 정렬된 정투상 뷰 |
| 내부 통로나 접합부 | 그 부분을 지나는 단면 |
| subpixel, 합성된 UI 층 같은 개념의 층 구조 | 층마다 부품 하나인 분해된 plate 더미. 색으로 층을 구분한다 |

근거 종류는 다섯 가지고, 종류마다 처리가 다르다. `evidence.md`는 이 표 아래에 도면을 다시 빌드하고 proof하는 명령도 적는다.[](source:td-ev)

| 근거 종류 | 에이전트가 하는 일 |
| --- | --- |
| 제공된 geometry나 치수 | 그대로 보존하고 출처를 적는다 |
| 사진에서 보이는 특징 | 비율을 복원하되 추정이라고 표시한다 |
| 숨겨져 있거나 지정되지 않은 구조 | 생략하거나, 빠진 reference를 요청하거나, 예시용이라고 밝힌다 {caution:지어내지 않음} |
| 사용자가 요청한 가상의 물체 | 앞뒤가 맞는 조립을 설계하고 시트에 concept라고 표시한다 |
| 픽셀, 레이어, 메모리처럼 물리 형태가 없는 개념 | 아이디어마다 부품을 주고 얇은 plate로 만든 뒤 concept라고 표시한다 |

@callout level=warning title="켜면 파일과 패키지를 건드린다"
원문은 프로젝트에 `tools/teardown/`을 만들어 코드를 복사하고, `jspdf`·`svg2pdf.js`·`@fontsource-variable/inter`를 설치하고, `node` 스크립트와 headless Chrome을 쓰라고 한다.[](source:td-s3)[](source:vw-cfg)[](source:vw-test) 이 페이지에 적힌 단계는 모두 지시상 동작이다. 분석하는 쪽은 아무것도 실행하지 않았다.

## 무엇을 강제하고, 어떤 수치를 쓰나 {#rules}

원문은 규칙을 두 등급으로 나눈다. 형상과 주석의 대응은 정확해야 하고, 시트 비율과 선 굵기는 reference와 출력 크기에 맞춰 조정하는 시작 레시피다.[](source:td-exact) 수치마다 어느 등급인지 아래에서 구분했다.

| 규칙 | 에이전트가 하는 일 | 피하는 것 |
| --- | --- | --- |
| 모델은 하나 | 모든 뷰를 같은 inventory와 geometry에서 만든다. 어긋남은 part data를 고쳐 푼다[](source:td-fin)[](source:ge-prove) | {bad:한 뷰의 잉크만 밀어 맞추기} |
| 투영 약속 | 제공된 투영 약속을 따르거나, 고르고 명시한다. 제3각은 평면도를 정면도 위에, 우측면도를 오른쪽에 둔다[](source:va-ortho) | {bad:제1각과 제3각을 한 시트에 섞기} |
| 척도 | 맞춤 일러스트에는 `NTS`를 쓴다. 숫자 척도는 모델 단위, 투영, 실제 출력을 모두 확인했을 때만 쓴다[](source:va-dim)[](source:td-fin) | {bad:맞춤 뷰의 제목란에 숫자 척도} |
| 치수 | 모델 parameter에서 라벨을 끌어낸다. 분해 간격은 제품 치수가 아니다[](source:va-dim) | 지어낸 치수를 확립된 것처럼 적기 |
| 시트 메타데이터 | 값이 확립된 것만 적는다. 알 수 없는 공차, 재질, 승인 서명, 규정 준수 주장은 비워 둔다[](source:sv-fact) | 공차·서명 칸 채우기 |
| balloon | 번호는 inventory 것을 쓰고 레이아웃이 바뀌어도 다시 매기지 않는다. 한 balloon은 한 item만 가리킨다[](source:va-balloon) | 번호 재배정 |
| 분해 | 모든 이동량이 0이면 조립이 복원돼야 한다. 부품마다 분해 벡터는 하나다[](source:ex-gap)[](source:ex) | 부품 하나에 벡터 여러 개 |
| 개념 | 아이디어마다 부품을 주고, 층 사이에 판 두께의 약 10분의 1을 둔다. 같은 평면을 공유하면 가시성이 깨진다[](source:ge-concept) | {bad:같은 평면에 층을 겹치기} |
| 시각 확인 | 렌더한 그림을 눈으로 본다. 확인 도구는 그림의 좋고 나쁨을 판단하지 못한다[](source:vf-proof) | 소스만 보고 통과 처리 |

수치는 세 가지로 갈린다. 코드가 막는 한도, 문서가 시작값으로 주는 레시피, 진단에 쓰는 기준이다. 코드가 막는 한도는 `assets/`와 `scripts/`에서 직접 확인했다.

@facts
| 코드가 막는 한도: 분해 비율 | `explosion`과 `fitExplosion`은 0~2. 범위를 벗어나면 `render`가 오류를 낸다[](source:as-proj) |
| 코드가 막는 한도: 시각 표본 간격 | `sample`은 종이 위 0.01~0.2 mm, 기본 0.045 mm[](source:as-proj)[](source:gl-render) |
| 코드가 막는 한도: 파라미터 | `max`는 `min`보다 크고 `default`는 그 사이, `step`은 0보다 큼. 어기면 빌드가 실패한다[](source:sc-config) |
| 코드가 막는 한도: hex 점 | `lathe`의 hex 점은 segment 수가 12로 나눠떨어져야 한다. 기본 segment는 144[](source:as-geo) |
| 코드가 막는 한도: 강체 변환 | `transform`은 오른손 직교 좌표축만 받는다. 기울임이나 shear는 정점을 직접 옮긴다[](source:as-geo)[](source:gl) |

@facts
| 시작 레시피: 분해 간격 | 투영 뒤 실루엣 사이 8~15 mm에서 시작해, 리더나 안쪽 면에 필요하면 늘린다[](source:ex-gap) |
| 시작 레시피: 단면 해칭 | 45°, 종이 위 2~3 mm 간격. 좁은 영역은 검게 막히기 전에 키운다. 형식 도면이 아니다[](source:va) |
| 시작 레시피: 치수선 | 첫 치수는 실루엣에서 10 mm, 다음마다 7 mm씩 바깥. 보조선은 1 mm 띄워 시작해 치수선을 2 mm 넘긴다. 화살촉 길이는 약 2.5 mm. 지정된 제도 표준이 있으면 그것이 먼저다[](source:va-dim) |
| 시작 레시피: balloon | 지름 7 mm 원에서 시작한다. 리더와 관계없는 글자 사이는 2 mm 이상 띄운다[](source:va-balloon) |
| 시작 레시피: 시트 | 주석 시트는 여백 12 mm, 제목 띠 24 mm에서 시작한다. 선은 리더·치수선 0.16 mm, 해칭 0.13 mm, 중심선 0.13 mm. 글자는 제목 5 mm, 항목 번호와 라벨 3 mm, 보조 2.5 mm. 기준표가 아니라 레시피다[](source:sv-size) |
| 시작 레시피: 기본 선 굵기 | `technical`은 outline 0.35, edge 0.22, detail 0.13, texture 0.09, axis 0.13 mm. 중심선 대시는 `6 1 1 1`[](source:as-sheet) |
| 진단 기준: 검게 막힘 | 종이 위 약 0.5 mm보다 가까운 면은 검은 덩어리로 그려진다. 얇은 부품은 두껍게 하거나 외곽선 하나로 그린다[](source:ge) |
| 진단 기준: 곡선 표본 | 투영된 현 오차를 종이 위 0.05 mm 아래로 둔다. 자유 곡면 날개는 긴 곡선 변마다 표본 약 40개[](source:ge) |
| 진단 기준: 가려진 부품 | 분해한 부품의 선이 혼자 있을 때의 50% 미만만 보이면 `proof.cjs`가 경고한다. 경로를 늘리거나 카메라를 돌린다[](source:vf-proof)[](source:sc-proof) |
| 진단 기준: 부드러운 꺾임 | 꼭짓점에서 35°보다 덜 꺾이면 곡선으로 이어 그린다. 가파른 각도에서 보이는 원은 segment를 늘린다[](source:gl-render)[](source:as-proj) |

원문이 문서로만 적고 코드가 막지 않는 값은 시작값이다. 판정: 시작값은 에이전트가 reference와 출력 크기에 맞춰 바꿀 수 있고, 원문도 그렇게 허용한다.[](source:td-exact)

끝내기 전에 에이전트는 아래 증상을 훑는다. 원문 13행 가운데 결정적인 여덟 행만 옮겼고, 나머지 다섯 행은 `SKILL.md`에 있다.[](source:td-fin)

| 이런 증상이 보이면 | 이렇게 고친다 |
| --- | --- |
| 모든 edge가 모든 면을 뚫고 보인다 | 디테일을 더하기 전에 가시성부터 푼다 |
| 뷰마다 rib나 hole 수가 다르다 | 같은 inventory에서 두 뷰를 다시 만든다 |
| proof가 한 부품의 선이 절반 미만만 보인다고 경고한다 | 분해 경로를 늘리거나, 평행한 줄로 옮기거나, 카메라를 돌린다 |
| 같은 부품이 한 줄에 쌓인다 | 두 부품이 시선 방향의 한 직선에 놓이지 않게 카메라를 돌린다 |
| 매끈한 회전면에 동심 줄무늬가 보인다 | `lathe`에 `creaseAngle`을, `loft`에 `lines` 옵션을 준다 |
| 제목란이 맞춤 뷰가 지킬 수 없는 척도를 주장한다 | `NTS`를 쓰거나 물리 출력 척도를 계산해 확인한다 |
| 사진이 설명 없는 상세한 내부가 된다 | 근거 없는 구조를 빼거나 예시용이라고 표시한다 |
| 채운 부품의 색이 군데군데 빠진다 | 각 shell을 닫고 triangle 감는 방향을 맞춘다 |

## 무엇을 만들고, viewer 안에서는 무엇이 돌아가나 {#outputs}

전달하는 파일은 `viewer-assets.md`가 정한다. 한 파일짜리 HTML 곁에 `evidence.md`, 설정, model script, 의존성 lockfile, 그리고 나란히 둔 `assets/`·`scripts/` 복사본을 함께 낸다.[](source:vw-build) 채팅에는 렌더한 이미지를 보이고 그림 파일 링크도 같이 준다. 재구성 가정, 확인한 출력 크기, 남은 시각·export 결함을 밝힌다.[](source:td-del)

@tree id=teardown-output title="프로젝트에 생기는 것"
| prj | 프로젝트 폴더 | - |
| evi | evidence.md | prj |
| cfg | drawing.json | prj |
| mdl | model.js | prj |
| tools | tools/teardown/ | prj |
| tl-assets | assets/ | tools |
| tl-scripts | scripts/ | tools |
| deps | node_modules와 lockfile | prj |
| dist | dist/index.html | prj |
| pf | proof/ | prj |
| ck | check/ | prj |

`proof/`와 `check/`는 원문 명령에 나온 출력 폴더 이름이다. 둘은 전달 목록에 없다. 확인용 결과이고 전달 파일은 아니다. `proof/`에는 `proof.cjs`가 SVG와 PNG를, `check/`에는 `check-viewer.cjs`가 화면 캡처를 쓴다.[](source:vf-proof)[](source:vw-test)

빌드한 viewer는 미리보기를 main 쪽에서 직접 그리지 않는다. 모델 호출을 worker에 맡기고, 결과 SVG를 받아 스타일을 입힌다.

@architecture id=viewer-runtime title="한 파일 viewer 안의 흐름"
| vw-ui | viewer.js | frontend | source:as-viewer |
| vw-q | render-queue.js | backend | source:as-queue |
| vw-w | worker.js | backend | source:as-worker |
| vw-m | 모델 스크립트 | backend | source:vw-model |
| vw-p | projection.js | backend | source:as-proj |
| vw-f | flipbook.js | backend | source:as-flip |
| vw-x | export.js | backend | source:as-export |
| vw-s | localStorage | database | source:as-vw-store |
| vw-ui > vw-q | 요청 |
| vw-q > vw-w | 한 번에 하나 |
| vw-w > vw-m | 옵션 전달 |
| vw-m > vw-p | render 호출 |
| vw-ui > vw-f | 프레임 준비 |
| vw-f > vw-w | 프레임 요청 | dashed |
| vw-ui > vw-x | 다운로드 |
| vw-ui > vw-s | 색 저장 | dashed |

글의 설명과 코드가 맞는 곳과 어긋나는 곳을 나눠 적는다. 코드 쪽은 `viewer.js` 전체와 작은 asset·script 전체를 읽고 확인했다.

| 항목 | 값 | 확인 |
| --- | --- | --- |
| 확대 범위 | 25~400%, 한 번에 5%p. 키는 `+`·`=`·`-`·`0`(`0`은 맞춤)[](source:as-vw-zoom)[](source:as-vw-key) | 문서의 시작 범위 25~400%와 같음[](source:pp-ctl) |
| 미리보기 debounce | 슬라이더 입력 뒤 120 ms | 문서는 debounce만 말하고 값은 `원문에 명시 없음`[](source:vw-build) |
| PNG 크기 | 300 dpi. A3 가로는 420 mm ÷ 25.4 × 300 = 4960.6, 297 mm ÷ 25.4 × 300 = 3507.9이므로 4961 × 3508 px[](source:as-export)[](source:sv-export) | 문서와 코드가 같음 |
| crop 여백 | 그림 경계에 3 mm[](source:as-export)[](source:pp-export) | 문서와 코드가 같음 |
| 다운로드 잠금 | 그림이 `ready`가 아니거나 내보내는 중이면 버튼이 꺼진다[](source:as-viewer)[](source:vw-build) | 문서와 코드가 같음 |
| 새 미리보기가 이전 것을 대체 | 이전 미리보기의 결과를 버린다. 돌던 worker 작업은 끝날 때까지 기다린다[](source:as-queue)[](source:ts-queue) | 문서의 "supersedes"는 결과 폐기까지만 뜻함 {caution:표현 차이} |
| 내보내기 우선 | 내보내기 작업은 미리보기보다 먼저 보낸다. 요청 시점의 값을 복사해 둔다[](source:as-queue)[](source:ts-queue) | 문서에 `원문에 명시 없음` |
| 분해 애니메이션 | 조립과 분해 사이 85개 프레임을 worker 2~6개로 미리 그리고, 양 끝 프레임에만 라벨을 넣는다. `prefers-reduced-motion`이면 재생하지 않는다[](source:as-flip)[](source:as-vw-flip)[](source:as-viewer) | 문서에 `원문에 명시 없음` |
| 배치 맞춤 | 코드는 간격이 0이어도 `fitExplosion`을 1 이상으로 보낸다[](source:as-vw-pre)[](source:as-viewer) | 문서는 "0보다 클 때"만 적음[](source:gl-render) |
| 모델 옵션 | worker는 `explosion` 등 다섯 개에 `labels`를 더해 넘긴다. 이 값을 채우는 쪽은 애니메이션 프레임 요청이다[](source:as-worker)[](source:as-flip) | 문서 목록은 다섯 개뿐이고 `labels`가 없음[](source:vw-model)[](source:gl-render) |
| 네트워크 | `check-viewer.cjs`는 `file`·`data`·`blob`·`about` 밖 요청을 문제로 센다[](source:sc-check) | 문서의 "네트워크 요청 없음"과 같음[](source:vw-cfg) |
| 저장소 | 색은 `teardown-colors`, 모드는 `teardown-appearance`에 저장하고, 막혀도 동작한다[](source:as-vw-store)[](source:as-theme)[](source:ts-theme) | 문서와 같음[](source:pp) |

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 30개, 합계 240,353B다. 바이너리는 없다(`find`로 확인). 번역본과 제외한 파일도 없다.
- 끝까지 읽은 파일은 26개, 139,695B다. `SKILL.md`와 참조 문서 8개, `agents/openai.yaml`, `scripts/`의 `build-viewer.cjs`·`check-viewer.cjs`·`commands.cjs`·`config.cjs`·`proof.cjs`, 시험 4개(`test-flipbook`·`test-render-queue`·`test-theme`·`test-viewer-builder`), `assets/`의 `export.js`·`flipbook.js`·`render-queue.js`·`sheet.js`·`theme.js`·`worker.js`·`viewer.js`다.
- 구조·표본만 확인(전부 읽지 않음)한 파일은 4개, 합계 100,658B다. `assets/geometry.js`(27,027B)는 상수와 오류 조건, 함수 목록, 앞 50줄을 봤다. `assets/projection.js`(28,466B)는 카메라, 부드러운 경로, 맞춤, `render` 앞뒤를 봤다. `assets/viewer.html`(17,988B)은 컨트롤 마크업과 앞뒤 일부를 봤다. `scripts/test-geometry.cjs`(27,177B)는 시험 이름 목록만 봤다.
- 원문 대조 범위: 활성화 제한 필드 2곳(`SKILL.md`, `agents/openai.yaml`), 관계 행 r144~r148 다섯 개, 완료 조건 6개(1~6단계), 사람 개입 1곳, 종료 조건 1곳, 끝내기 전 증상 13행, 수치 중 위 두 `@facts` 묶음 16개를 대조했다. 증상 13행 가운데 8행을 옮겼다.
- 문서와 코드 대조는 확대 범위, 선 굵기, 분해·표본 범위, 파라미터 검증, PNG 크기, crop 여백, 부드러운 꺾임, 내보내기 잠금을 했다. 일치한 항목과 어긋난 항목을 위 표에 나눠 적었다.
- 문서 결함 후보: `viewer-assets.md`와 `geometry-library.md`는 viewer가 모델에 넘기는 옵션을 다섯 개로 적는다. 코드는 애니메이션 프레임 요청에 `labels`도 실어 여섯 개를 넘긴다.[](source:vw-model)[](source:gl-render)[](source:as-worker)[](source:as-flip)
- 분석 중 바뀐 파일: 없음. `design/` 작업 트리는 commit `0465878` 그대로다.

@callout level=open-question title="확인하지 못한 것"
- 이 스킬이 실제로 에이전트의 동작을 바꾸는지는 실행해 보지 않아 확인하지 않았다. 페이지의 모든 동작은 지시상 동작이다. 스킬의 `node` 스크립트, 설치, headless Chrome은 실행하지 않았다.
- `geometry.js`와 `projection.js`의 본문 대부분, `viewer.html`의 스타일, `test-geometry.cjs`의 본문은 읽지 않았다. 문서가 말한 가시성 판정, 채움, 주석 배치가 코드에서 그대로 구현되는지는 확인하지 못했다.
- 원문은 에이전트가 사용자에게 승인을 받는 지점을 적지 않는다(`원문에 명시 없음`). 이를 "승인이 필요 없다"는 뜻으로 읽지 않았다.
- 다섯 이웃 스킬이 `teardown`의 결과물에 실제로 쓰이는지는 `원문에 명시 없음`이다. 이 스킬 문서는 경계만 적는다.
