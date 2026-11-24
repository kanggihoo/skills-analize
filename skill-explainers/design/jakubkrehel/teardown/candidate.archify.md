# teardown — 실물·개념의 조립·분해 기하 모델을 구축해 독립 뷰어 HTML로 패키징한다 {#overview}

`teardown`은 실물·사진·CAD 모델 또는 비물리적 개념을 하나의 기하 모델로 구축하고, 다중 뷰 투영과 검증(`proof`)을 거쳐 확대·색상·SVG·PNG·PDF 내보내기를 지원하는 독립 HTML 뷰어로 패키징하게 하는 스킬이다.[](source:sk-intro) **부분 분석**: 문서 9개와 설정·핵심 스크립트·에셋 13개는 전문을 읽었으나, 대형 런타임 파일 4개와 테스트 4개는 앞부분 구조·표본만 확인했다.

- 실물 조립품, 단일 외형, 정투상·단면, 또는 픽셀·UI 레이어 같은 개념의 분해·단면 기술 일러스트를 요청받을 때 모델 판단(`description`)으로 켜진다.[](source:fm)[](source:sk-step2)
- 결과로 남는 것은 부품별 증거 등급을 적은 `evidence.md`, `drawing.json`·모델 스크립트, `assets/`·`scripts/` 사본, 단일 오프라인 HTML 뷰어(또는 요청 시 어노테이션 A3 SVG)다.[](source:sk-step1)[](source:sk-step3)[](source:sk-deliver)
- 다른 스킬과의 관계: 일러스트를 제품 화면에 통합할 때 접근성 이름·부품 목록 대안·컨트롤 규약은 `better-accessibility`를 참고한다(참고).[](source:sk-intro)[](source:sh-svg)[](source:pp-guide)
- 하지 않는 것: 공차·제조 규격이 들어간 가공용 제작 도면을 만들지 않고, 숨은 내부 구조를 추정해 사실처럼 채우지 않으며, 요청 없는 애니메이션·시뮬레이션·갤러리 프레임을 넣지 않는다.[](source:sk-intro)[](source:sk-step1)[](source:sk-step2)[](source:sk-checks)

@answer scope="design/jakubkrehel/teardown · 원본 30개(일부 표본) · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source fm title="frontmatter: name과 description" path=design/jakubkrehel/teardown/SKILL.md lines=1:4
@source sk-intro title="목적, 제조 도면과 구분, 도메인 소유권" path=design/jakubkrehel/teardown/SKILL.md lines=6:15
@source sk-step1 title="1단계: 대상·참고 구분과 evidence.md 기록" path=design/jakubkrehel/teardown/SKILL.md lines=16:41
@source sk-step2 title="2단계: 뷰·축척 선택과 시트 분기" path=design/jakubkrehel/teardown/SKILL.md lines=42:61
@source sk-step3 title="3단계: 도구 복사, 단일 모델 구축, 빠른 검증" path=design/jakubkrehel/teardown/SKILL.md lines=62:82
@source sk-step4 title="4단계: 선 역할, concept 플래그, 시트 조판" path=design/jakubkrehel/teardown/SKILL.md lines=83:90
@source sk-step5 title="5단계: proof 렌더·inspect·교정 루프" path=design/jakubkrehel/teardown/SKILL.md lines=91:98
@source sk-step6 title="6단계: 독립 뷰어 패키징·테스트" path=design/jakubkrehel/teardown/SKILL.md lines=99:106
@source sk-checks title="마무리 전 결함 교정 13항목" path=design/jakubkrehel/teardown/SKILL.md lines=107:124
@source sk-deliver title="산출물과 한계 전달" path=design/jakubkrehel/teardown/SKILL.md lines=125:129
@source ev-guide title="분해 축, 종이 여백 8~15mm, 경로선 규칙" path=design/jakubkrehel/teardown/exploded-views.md lines=1:33
@source geo-rules title="단일 모델 데이터, 카메라 각도, 개념 레이어" path=design/jakubkrehel/teardown/geometry.md lines=1:50
@source geo-mesh title="커스텀 메시·곡률 샘플·조립 일치 검사" path=design/jakubkrehel/teardown/geometry.md lines=51:107
@source glib-helpers title="geometry.js 헬퍼와 선 역할 5종" path=design/jakubkrehel/teardown/geometry-library.md lines=1:88
@source glib-proj title="메시 계약과 projection.render 투영 규칙" path=design/jakubkrehel/teardown/geometry-library.md lines=89:161
@source va-orth title="정투상·단면·balloon·치수·NTS 규약" path=design/jakubkrehel/teardown/views-and-annotations.md lines=1:53
@source sh-svg title="A3 mm 시트 조판과 SVG·PNG·PDF 내보내기" path=design/jakubkrehel/teardown/sheet-and-svg.md lines=1:109
@source ver-proof title="proof.cjs 실행, 2거리 점검, 일치 추적표" path=design/jakubkrehel/teardown/verification.md lines=1:67
@source vas-config title="drawing.json, concept 플래그, 의존성 3종" path=design/jakubkrehel/teardown/viewer-assets.md lines=1:50
@source vas-model title="self.DrawingModels 경계와 SVG 계약" path=design/jakubkrehel/teardown/viewer-assets.md lines=51:87
@source vas-build title="build-viewer.cjs·check-viewer.cjs 절차" path=design/jakubkrehel/teardown/viewer-assets.md lines=88:112
@source pp-guide title="직접 제작 뷰어의 컨트롤·테마·내보내기 규격" path=design/jakubkrehel/teardown/preview-page.md lines=1:117
@source scr-build title="build-viewer.cjs: 오프라인 HTML 조립" path=design/jakubkrehel/teardown/scripts/build-viewer.cjs lines=1:47
@source scr-check title="check-viewer.cjs: Headless Chrome CDP 검사" path=design/jakubkrehel/teardown/scripts/check-viewer.cjs lines=1:111
@source scr-proof title="proof.cjs: 시트·크롭·가림률 검사" path=design/jakubkrehel/teardown/scripts/proof.cjs lines=1:202
@source scr-cfg title="config.cjs: drawing.json 스키마 검증" path=design/jakubkrehel/teardown/scripts/config.cjs lines=1:42
@source ast-sheet title="sheet.js: A3 규격과 3종 선 굵기 preset" path=design/jakubkrehel/teardown/assets/sheet.js lines=1:21
@source ast-worker title="worker.js: 워커 모델 디스패치" path=design/jakubkrehel/teardown/assets/worker.js lines=1:10
@source ast-export title="export.js: SVG·300dpi PNG·PDF 저장" path=design/jakubkrehel/teardown/assets/export.js lines=1:146
@source oai title="UI 표시 이름과 설명" path=design/jakubkrehel/teardown/agents/openai.yaml lines=1:3
@source ba-intro title="better-accessibility의 접근성 규칙 소유 범위" path=design/jakubkrehel/better-accessibility/SKILL.md lines=1:12

## 어떻게 동작하나 {#flow span=12}

절차형이다. 원문 1~6단계를 조사·설계, 모델·증명, 패키징·전달 3개 국면으로 묶어 그렸다.[](source:sk-step1)[](source:sk-step6)

그림이 생략한 예외가 하나 있다. 렌더 환경(`rsvg-convert`·`resvg`·Chrome·Quick Look)을 쓸 수 없으면 5단계 시각 검증과 6단계 브라우저 검사를 건너뛰고 편집 가능한 원본과 미검증 상태를 밝혀 전달한다.[](source:sk-step5)[](source:scr-proof)[](source:vas-build)

@workflow id=flow-diagram title="teardown 흐름"
| lane plan | 조사·설계 |
| lane model | 모델·증명 |
| lane ship | 패키징·전달 |
| evidence | 대상·증거 분류 | backend | plan | source:sk-step1 |
| views | 뷰·축척 선택 | backend | plan | source:sk-step2 |
| build | 단일 모델·투영 구축 | backend | model | source:sk-step3 |
| ink | 선·주석·시트 구성 | backend | model | source:sk-step4 |
| proof | proof 렌더·점검 | backend | model | source:sk-step5 |
| pass | 검증 통과? | backend | model | source:sk-step5 |
| package | 독립 뷰어 빌드·검사 | frontend | ship | source:sk-step6 |
| deliver | 소스·산출물 전달 | frontend | ship | source:sk-deliver |
| evidence > views | | |
| views > build | | |
| build > ink | | |
| ink > proof | | |
| proof > pass | | |
| pass > build | 결함 수정 | |
| pass > package | 통과 | emphasis |
| package > deliver | | emphasis |

@steps id=flow-steps
| s-evidence | 대상·증거 분류 | **입력** 대상 설명·사진·CAD·참고 이미지 · **출력** `evidence.md`(기능 묶음별 5종 증거 분류, 용도·크기, 재빌드·검증 명령). **처리** 대상과 스타일 참고 자료를 분리해 읽고, 실측·사진 추정·미지정 내부·가상 사물·비물리 개념 중 가장 덜 추측하는 경로를 골라 기록한다.[](source:sk-step1) **다음** 무엇을 그릴지 달라질 때만 사용자에게 묻고, 별도 요청이 없으면 기본 산출물을 로컬 미리보기 페이지로 잡는다.[](source:sk-step1) | flow-diagram | evidence |
| s-views | 뷰·축척 선택 | **입력** `evidence.md` · **참조** `views-and-annotations.md`, `exploded-views.md` · **출력** 최소 뷰 세트, 축척 정책(`NTS` 등). **처리** 설명 목적에 맞는 최소 뷰(`axonometric 뷰`(축측 투영) 분해, 평행 투시, 정투상, 단면, 개념 레이어 판)를 고르고 분해 축·여백을 정한다.[](source:sk-step2)[](source:ev-guide)[](source:va-orth) **다음** 내장 뷰어는 리더 주석만 지원하므로 `balloon`(번호 원)이나 치수가 든 별도 시트는 사용자가 요청할 때만 할당 영역까지 잡아 추가한다.[](source:sk-step2) | flow-diagram | views |
| s-build | 단일 모델·투영 구축 | **입력** 뷰·축척 정책 · **참조** `geometry.md`, `geometry-library.md`, `viewer-assets.md` · **실행** `node tools/teardown/scripts/proof.cjs drawing.json proof/ --quick` (→ 내부: `config.cjs`·`assets/sheet.js`·`assets/geometry.js`·`assets/projection.js`·`scripts/commands.cjs`, 코드 확인) · **출력** `tools/teardown/` 사본, `drawing.json`, 모델 스크립트, 초기 proof 시트. **처리** `test-*.cjs`를 뺀 `assets/`·`scripts/`를 복사하고, 한 모델에서 모든 뷰와 부품 목록을 뽑은 뒤 외곽→접합부→기능 디테일→가림 정리 순으로 구축해 `proof`로 떠 있는 부품·구멍 어긋남을 잡는다.[](source:sk-step3)[](source:geo-rules)[](source:geo-mesh)[](source:glib-helpers)[](source:glib-proj)[](source:vas-model)[](source:scr-cfg)[](source:scr-proof) **다음** 불리언 컷이 필요하거나 CAD 모델이 이미 있으면 CAD 투영 SVG를 `{markup}` 계약으로 연결한다.[](source:sk-step3)[](source:vas-model) | flow-diagram | build |
| s-ink | 선·주석·시트 구성 | **입력** 투영된 모델과 `drawing.json` · **참조** `sheet-and-svg.md`, `viewer-assets.md` · **출력** 선 역할·채색 설정 또는 수작업 A3 SVG 시트. **처리** 내장 뷰어에서는 5종 선 역할(`outline`·`edge`·`detail`·`texture`·`axis`)과 `concept` 플래그(기본 `true`)·`colors`를 맞추고, 별도 어노테이션 시트·단독 내보내기 요청이면 `420×297mm` SVG 시트를 직접 조판한다.[](source:sk-step4)[](source:vas-config)[](source:sh-svg)[](source:ast-sheet) | flow-diagram | ink |
| s-proof | proof 렌더·점검 | **입력** `drawing.json`과 모델 스크립트 · **참조** `verification.md` · **실행** `node tools/teardown/scripts/proof.cjs drawing.json proof/` 및 `--view=exploded --crop=x,y,w,h` (→ 내부: `config.cjs`·`commands.cjs`·래스터라이저, 코드 확인) · **출력** 조립·분해·150% 전개·극값 시트, `contact.png`, 3~4배 확대 크롭 PNG. **처리** 기본값·파라미터 극값·부품 가림률(`50%` 미만 경고)을 모두 렌더한 뒤, 전체 거리와 3~4배 확대 두 거리에서 윤곽·겹침·리더·일치표를 육안으로 점검한다.[](source:sk-step5)[](source:ver-proof)[](source:scr-proof) | flow-diagram | proof |
| s-pass | 검증 통과? | **입력** proof 경고와 육안·XML 점검 결과 · **출력** 재수정 또는 패키징 진행 판단. **처리** 가장 큰 시각 결함부터 고쳐 모델 데이터를 수정하고 다시 렌더하며, 기하·일치성·가독성·내보내기 검사를 통과할 때까지 반복한다.[](source:sk-step5)[](source:sk-checks)[](source:ver-proof) **다음** 렌더 도구가 없으면 통과로 넘기지 않고 편집 가능한 원본과 미완료 상태를 명시해 다음으로 간다.[](source:sk-step5) | flow-diagram | pass |
| s-package | 독립 뷰어 빌드·검사 | **입력** 검증된 모델과 `node_modules`(`jspdf`·`svg2pdf.js`·`@fontsource-variable/inter`) · **참조** `viewer-assets.md`, `preview-page.md` · **실행** `node tools/teardown/scripts/build-viewer.cjs drawing.json dist/index.html` 및 `node tools/teardown/scripts/check-viewer.cjs dist/index.html check/` (→ 내부: `config.cjs`·`viewer.html`·런타임 6종·`commands.cjs`, 코드 확인) · **출력** 단일 오프라인 HTML과 라이트·다크 스크린샷. **처리** 외부 네트워크 요청 없는 단일 HTML을 조립하고 `worker.js`에서 모델을 실행해 헤드리스 Chrome으로 전 도면 렌더링·콘솔 무오류를 검증한 뒤, 확대·회전·색·채우기·주석·SVG/PNG/PDF 내보내기를 직접 확인한다.[](source:sk-step6)[](source:vas-build)[](source:scr-build)[](source:scr-check)[](source:ast-worker)[](source:ast-export) **다음** 프로젝트 UI에 직접 통합하거나 뷰어를 교체할 때만 `preview-page.md` 규격을 따르고, 브라우저 테스트 불가 시 한계를 밝힌다.[](source:sk-step6)[](source:vas-build) | flow-diagram | package |
| s-deliver | 소스·산출물 전달 | **입력** 빌드·검증 완료된 뷰어와 원본 · **출력** HTML 경로, 렌더 이미지, 파일 링크, 가정·크기·결함 보고. **처리** 미리보기 HTML과 함께 `evidence.md`, `drawing.json`, 모델 스크립트, 의존성 lockfile, `assets/`·`scripts/` 사본을 넘기고, 재구성 가정·검증된 출력 크기·미해결 결함을 명시한다.[](source:sk-deliver)[](source:vas-build) | flow-diagram | deliver |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 호출형(`description` 기반) 및 사용자 호출 가능. `frontmatter`와 `agents/openai.yaml`에 호출 제한 필드가 없다.[](source:fm)[](source:oai) |
| 성격 | 절차형. 기하 모델 구축·렌더 검증·단일 HTML 뷰어 패키징을 수행하며, 주변 UI·텍스트·접근성 규칙은 도메인 스킬에 위임한다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#rel-r87} | `better-accessibility` | 참고 | 일러스트를 제품 화면에 임베딩할 때 접근성 이름·부품 목록 대안·컨트롤 규칙을 참조한다(사용자 개입 없음).[](source:sk-intro)[](source:sh-svg)[](source:pp-guide)[](source:ba-intro) |

@architecture id=relation-map title="teardown과 이어지는 스킬"
| self | teardown(이 스킬) | backend |
| ba | better-accessibility | backend |
| self > ba | 참고 |

참고로 `SKILL.md`와 `preview-page.md`는 `better-accessibility` 외에도 텍스트 렌더링은 `better-typography`, 팔레트·대비는 `better-colors`, 주변 레이아웃·반응형 배치는 `better-layout`, 컨트롤 문구는 `better-writing` 소관으로 함께 나눈다.[](source:sk-intro)[](source:pp-guide)

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 6단계 일러스트 제작·검증·패키징 절차와 실수 교정 13항목 본문 | 스킬이 켜지면 항상 읽는다 | 대상·증거 분류, 뷰·축척 선택, 단일 모델·투영 구축, 선·주석·시트 구성, proof 렌더·점검, 검증 통과?, 독립 뷰어 빌드·검사, 소스·산출물 전달 |
| `exploded-views.md` | 분해 축·순서, 종이 여백(`8~15mm`), 동축 스택, 분해 경로선 규칙 | 분해 벡터를 정하기 전에 읽는다 | 뷰·축척 선택 |
| `views-and-annotations.md` | 제1각·제3각 정투상, 단면(`SECTION A-A`), `balloon`·리더, 치수·`NTS` 규약 | 고른 뷰 규약을 정할 때 읽는다 | 뷰·축척 선택, 선·주석·시트 구성 |
| `geometry.md` | 모델 데이터 분리, 카메라 벡터, 개념 레이어 판, 수동 메시·곡률·조립 검증 | 3단계 모델 구축 전에 읽는다 | 단일 모델·투영 구축 |
| `geometry-library.md` | `geometry.js` 23개 헬퍼, 메시 계약, `projection.js` 투영·채우기·주석·경로선 API | 내장 기하 헬퍼와 투영 API를 쓸 때 읽는다 | 단일 모델·투영 구축 |
| `sheet-and-svg.md` | `420×297mm` A3 mm 좌표 조판, 선 굵기·점선, 자체 완결 SVG·PNG·PDF 내보내기 | 어노테이션 시트나 뷰어 없는 내보내기 시 읽는다 | 선·주석·시트 구성 |
| `verification.md` | `proof.cjs` quick·crop·full 모드, 2거리 육안 점검, 유형별 일치표, XML 검사 | 3단계 조기 검증과 5단계 전체 점검 시 읽는다 | 단일 모델·투영 구축, proof 렌더·점검, 검증 통과? |
| `viewer-assets.md` | `drawing.json` 스키마, `self.DrawingModels` 경계, `build-viewer.cjs`·`check-viewer.cjs` 실행 | 3·4·6단계에서 뷰어 설정·빌드·테스트 시 읽는다 | 단일 모델·투영 구축, 선·주석·시트 구성, 독립 뷰어 빌드·검사, 소스·산출물 전달 |
| `preview-page.md` | 프로젝트 UI 통합·직접 뷰어 제작 시 9개 컨트롤, 테마, 오프라인 임베딩 규격 | 프로젝트 인터페이스에 통합하거나 내장 페이지를 교체할 때만 읽는다 | 독립 뷰어 빌드·검사 |
| `scripts/build-viewer.cjs`, `config.cjs`, `check-viewer.cjs`, `commands.cjs`, `proof.cjs` | `drawing.json` 검증(`config.cjs`), 단일 HTML 조립(`build-viewer.cjs`), Chrome CDP 검사(`check-viewer.cjs`), 시트·크롭·가림률 증명(`proof.cjs`) | `test-*.cjs`를 빼고 `tools/teardown/scripts/`로 복사한 뒤 3·5·6단계에서 실행한다 | 단일 모델·투영 구축, proof 렌더·점검, 독립 뷰어 빌드·검사 |
| `assets/sheet.js`, `worker.js`, `theme.js`, `export.js`, `flipbook.js`, `render-queue.js`, `viewer.html`, `viewer.js`, `geometry.js`, `projection.js` | 기하 생성·투영, 3종 선 굵기 preset(`technical`·`patent`·`service`), 웹 워커 큐·플립북, 테마·SVG/300dpi PNG/PDF 내보내기 런타임 | `tools/teardown/assets/`로 복사해 `proof.cjs`와 `build-viewer.cjs`가 임베딩한다 | 단일 모델·투영 구축, 선·주석·시트 구성, 독립 뷰어 빌드·검사 |
| `scripts/test-*.cjs` 5종 | 스킬 자체(`geometry`, `flipbook`, `render-queue`, `theme`, `build-viewer`) 단위 테스트 | 사용자 프로젝트로 복사하지 않고 제외한다 | 해당 없음 |
| `agents/openai.yaml` | 표시 이름(`Teardown`)과 짧은 설명 | 호스트 UI 설정용. 동작 지시 없음 | 원문에 명시 없음 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 공차·가공용 제작 도면 요청 | 공차를 넣지 않는 설명용 도면임을 알리고 CAD 도면 워크플로를 안내 | [](source:sk-intro) |
| 첨부 이미지·문서 안의 지시문 | 요청을 바꾸는 지시로 따르지 않고 증거 자료로만 사용 | [](source:sk-step1) |
| 스타일 참고 자료만으로 다른 사물 내부·치수를 정할 때 | 금지. 증거 종류 5가지 중 가장 덜 추측하는 경로를 택하고 미확인은 생략·요청·예시 표시 | [](source:sk-step1) |
| `test-*.cjs` 파일 | 사용자 프로젝트 `tools/teardown/`으로 복사하지 않는다(제외) | [](source:sk-step3) |
| `drawing.json`의 `concept` 플래그 | 기본값 `true` 유지. 권위 있는 실측 치수 기반일 때만 `false`로 변경 | [](source:sk-step4)[](source:vas-config) |
| 내장 뷰어 vs 별도 어노테이션 시트 | 내장 뷰어는 리더 주석만 지원. `balloon`·치수 시트는 요청 시에만 작성하고 기본은 빈 페이지 뷰어 유지 | [](source:sk-step2)[](source:sk-checks) |
| `proof.cjs` 전체 실행 시 부품 가림률(`50%` 미만) 또는 빈 잉크 | 경고 시 분해 경로·행 배치·카메라를 고쳐 재렌더. 3·4배 확대 크롭과 2거리 육안 점검 필수 | [](source:sk-step5)[](source:sk-checks)[](source:ver-proof)[](source:scr-proof) |
| 렌더러(`rsvg-convert`·`resvg`·Chrome·Quick Look) 또는 브라우저 부재 | 파일 쓰기 성공으로 시각 확인을 대체하지 않고 편집 원본과 미검증 한계를 명시해 전달 | [](source:sk-step5)[](source:vas-build) |
| 독립 HTML 뷰어 빌드(`build-viewer.cjs`) | `jspdf`·`svg2pdf.js`·`@fontsource-variable/inter`를 인라인 임베딩해 런타임 네트워크 요청 `0`건 유지 | [](source:vas-build)[](source:scr-build)[](source:scr-check) |
| 제1각·제3각 정투상과 `NTS` 축척 | 한 시트에 두 투상법 혼용 금지. 모델 단위·투영·물리 출력 크기를 모두 검증하지 않았으면 `NTS` 표기 | [](source:sk-checks)[](source:va-orth) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- `geometry.js`·`projection.js` 기하·투영 규격 — 단일 모델·투영 구축 · 23개 헬퍼, `0.045mm` 가시성 샘플링, 35도 곡선 스냅, 개념 레이어 판 겹침 방지
- `proof.cjs`·`check-viewer.cjs`·`export.js` 검증·내보내기 내부 — proof 렌더·점검, 독립 뷰어 빌드·검사 · 150% 전개 가림률 계산, 300dpi PNG `pHYs` 청크, Chrome CDP 게이트
- 정투상·단면·`balloon`·직접 제작 뷰어 규격 — 뷰·축척 선택, 독립 뷰어 빌드·검사 · `420×297mm` 시트 여백, `SECTION A-A`, 커스텀 뷰어 9개 컨트롤

@callout level=open-question title="확인하지 못한 것"
| `assets/geometry.js`(531줄)·`assets/projection.js`(603줄)·`assets/viewer.html`(299줄)·`assets/viewer.js`(578줄)는 앞 60줄씩, `scripts/test-flipbook.cjs`·`test-geometry.cjs`·`test-render-queue.cjs`·`test-theme.cjs`는 앞 30줄씩 구조·표본만 확인해 내부 투영 알고리즘·뷰어 이벤트 세부 구현은 검증하지 못했다(**부분 분석**). |
| `viewer-assets.md`가 요구하는 `jspdf`·`svg2pdf.js`·`@fontsource-variable/inter` 패키지의 정확한 버전 제약이나 미설치 시 오류 복구 절차는 원문에 명시 없음.[](source:vas-config)[](source:scr-build) |
| `SKILL.md`는 "무엇을 그릴지 바뀔 때만 묻는다"고 정하지만, 참고 자료 부족 시 최대 질의 횟수나 중단 기준은 원문에 명시 없음.[](source:sk-step1) |

읽은 원본: 텍스트 파일 30개(문서 9개·`agents/openai.yaml`·핵심 스크립트 5개·에셋 6개·`test-viewer-builder.cjs` 총 22개 전문, `geometry.js`·`projection.js`·`viewer.html`·`viewer.js`·나머지 `test-*.cjs` 4개 총 8개 구조·표본만 확인). 제외: 없음.
