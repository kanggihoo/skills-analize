# pptx 스킬은 에이전트를 어떻게 바꾸나 {#pptx-skill}

`.pptx`나 `.potx`가 조금이라도 걸린 요청이면 에이전트는 `pptx` 스킬을 켠다. 새 덱은 `pptxgenjs` 스크립트로 만들고, 기존 덱이나 템플릿은 압축을 풀어 슬라이드 XML을 직접 고친다.[](source:sk-route) 끝에는 `validate.py` 검사와 렌더 이미지 눈 점검을 반드시 한다.[](source:sk-qa-head)

- 생성 규칙 중 5개는 어기면 PowerPoint가 파일을 열지 못하거나 chart를 버린다. `#` 색, 음수 shadow `offset`, 누적 막대의 `outEnd`, 보조 축 선언 누락, `<p:presentation>` 자식 순서 변경이다.[](source:sk-34)[](source:sk-36)[](source:sk-46)[](source:sk-47)[](source:sk-49)
- 디자인에는 `NEVER`가 둘 있다. 제목 밑 강조선과 장식용 색 막대·가장자리 줄무늬다.[](source:sk-161)[](source:sk-162)
- 편집은 구조 작업(추가·삭제·순서)을 모두 끝낸 다음에 내용을 고친다. 순서를 어기면 복제본에 수정 내용이 딸려 가거나 방금 쓴 슬라이드가 지워진다.[](source:sk-66)
- 이 스킬은 활성화 제외 조건을 적지 않았다. 그래서 읽기만 하는 요청에도 켜진다.[](source:sk-fm)

@answer scope="anthropics/pptx · 텍스트 파일 56개 중 16개 전부 읽음, 40개 부분 읽음(files.md) · 커밋 b825733"
@meta locale=ko
@source sk-fm title="anthropics/pptx/SKILL.md · 20782B · frontmatter" path=anthropics/pptx/SKILL.md lines=1:5
@source sk-route title="SKILL.md · 작업별 접근 표" path=anthropics/pptx/SKILL.md lines=9:15
@source sk-scripts title="SKILL.md · Scripts 표" path=anthropics/pptx/SKILL.md lines=17:27
@source sk-31 title="SKILL.md · pptxgenjs 사전 설치" path=anthropics/pptx/SKILL.md lines=31:31
@source sk-33 title="SKILL.md · layout과 좌표" path=anthropics/pptx/SKILL.md lines=33:33
@source sk-34 title="SKILL.md · hex 색과 투명도" path=anthropics/pptx/SKILL.md lines=34:34
@source sk-35 title="SKILL.md · 옵션 객체 변형" path=anthropics/pptx/SKILL.md lines=35:35
@source sk-36 title="SKILL.md · shadow offset" path=anthropics/pptx/SKILL.md lines=36:36
@source sk-37 title="SKILL.md · charSpacing" path=anthropics/pptx/SKILL.md lines=37:37
@source sk-38 title="SKILL.md · 목록" path=anthropics/pptx/SKILL.md lines=38:38
@source sk-39 title="SKILL.md · 인스턴스 하나당 파일 하나" path=anthropics/pptx/SKILL.md lines=39:39
@source sk-40 title="SKILL.md · rectRadius" path=anthropics/pptx/SKILL.md lines=40:40
@source sk-41 title="SKILL.md · 그라데이션" path=anthropics/pptx/SKILL.md lines=41:41
@source sk-42 title="SKILL.md · 텍스트 상자 여백" path=anthropics/pptx/SKILL.md lines=42:42
@source sk-43 title="SKILL.md · 발표자 노트" path=anthropics/pptx/SKILL.md lines=43:43
@source sk-44 title="SKILL.md · 네이티브 chart" path=anthropics/pptx/SKILL.md lines=44:44
@source sk-45 title="SKILL.md · 기본 chart는 맨몸" path=anthropics/pptx/SKILL.md lines=45:45
@source sk-46 title="SKILL.md · 누적 막대 라벨 위치" path=anthropics/pptx/SKILL.md lines=46:46
@source sk-47 title="SKILL.md · 보조 축" path=anthropics/pptx/SKILL.md lines=47:47
@source sk-48 title="SKILL.md · writeFile 뒤 validate" path=anthropics/pptx/SKILL.md lines=48:48
@source sk-49 title="SKILL.md · presentation 자식 순서" path=anthropics/pptx/SKILL.md lines=49:49
@source sk-50 title="SKILL.md · 아이콘" path=anthropics/pptx/SKILL.md lines=50:50
@source sk-54 title="SKILL.md · 레이아웃 고르기와 thumbnail" path=anthropics/pptx/SKILL.md lines=54:54
@source sk-56-64 title="SKILL.md · 편집 명령 순서" path=anthropics/pptx/SKILL.md lines=56:64
@source sk-66 title="SKILL.md · 구조 작업 먼저" path=anthropics/pptx/SKILL.md lines=66:66
@source sk-67 title="SKILL.md · 슬라이드 수동 복사 금지" path=anthropics/pptx/SKILL.md lines=67:67
@source sk-68 title="SKILL.md · python-pptx가 못 하는 것" path=anthropics/pptx/SKILL.md lines=68:68
@source sk-69 title="SKILL.md · .ppt 변환과 .potx" path=anthropics/pptx/SKILL.md lines=69:69
@source sk-70 title="SKILL.md · 템플릿 아이콘 재사용" path=anthropics/pptx/SKILL.md lines=70:70
@source sk-74 title="SKILL.md · defusedxml" path=anthropics/pptx/SKILL.md lines=74:74
@source sk-75 title="SKILL.md · 템플릿 슬롯과 원본 항목" path=anthropics/pptx/SKILL.md lines=75:75
@source sk-76 title="SKILL.md · 항목당 a:p 하나" path=anthropics/pptx/SKILL.md lines=76:76
@source sk-77 title="SKILL.md · 글머리표 상속" path=anthropics/pptx/SKILL.md lines=77:77
@source sk-78 title="SKILL.md · xml:space" path=anthropics/pptx/SKILL.md lines=78:78
@source sk-before title="SKILL.md · Before Starting" path=anthropics/pptx/SKILL.md lines=86:89
@source sk-palette title="SKILL.md · Color Palettes" path=anthropics/pptx/SKILL.md lines=93:106
@source sk-slide title="SKILL.md · For Each Slide" path=anthropics/pptx/SKILL.md lines=110:125
@source sk-fonts title="SKILL.md · Typography 글꼴 규칙" path=anthropics/pptx/SKILL.md lines=129:135
@source sk-sizes title="SKILL.md · Typography 크기 표" path=anthropics/pptx/SKILL.md lines=137:142
@source sk-spacing title="SKILL.md · Spacing" path=anthropics/pptx/SKILL.md lines=146:148
@source sk-avoid title="SKILL.md · Avoid 목록" path=anthropics/pptx/SKILL.md lines=152:160
@source sk-161 title="SKILL.md · 제목 밑 강조선 금지" path=anthropics/pptx/SKILL.md lines=161:161
@source sk-162 title="SKILL.md · 색 막대·줄무늬 금지" path=anthropics/pptx/SKILL.md lines=162:162
@source sk-163 title="SKILL.md · 크림색 배경 금지" path=anthropics/pptx/SKILL.md lines=163:163
@source sk-164 title="SKILL.md · 넘치는 글 금지" path=anthropics/pptx/SKILL.md lines=164:164
@source sk-qa-head title="SKILL.md · QA (Required)" path=anthropics/pptx/SKILL.md lines=166:168
@source sk-content title="SKILL.md · Content QA" path=anthropics/pptx/SKILL.md lines=172:184
@source sk-grep title="SKILL.md · 자리 표시 문구 grep" path=anthropics/pptx/SKILL.md lines=181:181
@source sk-file title="SKILL.md · File QA" path=anthropics/pptx/SKILL.md lines=188:202
@source sk-visual title="SKILL.md · Visual QA" path=anthropics/pptx/SKILL.md lines=206:219
@source sk-conv title="SKILL.md · 이미지 변환 명령" path=anthropics/pptx/SKILL.md lines=225:234
@source sk-deps title="SKILL.md · Dependencies" path=anthropics/pptx/SKILL.md lines=238:238
@source lic title="anthropics/pptx/LICENSE.txt · 11357B · 앞부분만" path=anthropics/pptx/LICENSE.txt lines=1:3
@source vd-args title="scripts/office/validate.py · 6142B · 옵션" path=anthropics/pptx/scripts/office/validate.py lines=50:81
@source vd-family title="validate.py · 확장자 계열 판정" path=anthropics/pptx/scripts/office/validate.py lines=99:106
@source vd-case title="validate.py · 계열별 검증기 선택" path=anthropics/pptx/scripts/office/validate.py lines=124:151
@source vd-repair title="validate.py · --auto-repair" path=anthropics/pptx/scripts/office/validate.py lines=153:159
@source vd-exit title="validate.py · 종료 코드" path=anthropics/pptx/scripts/office/validate.py lines=161:169
@source vd-fail title="validate.py · 오류 종료" path=anthropics/pptx/scripts/office/validate.py lines=31:33
@source so-run title="scripts/office/soffice.py · 5927B · 실행 래퍼" path=anthropics/pptx/scripts/office/soffice.py lines=27:46
@source so-shim title="soffice.py · 소켓 shim 조건" path=anthropics/pptx/scripts/office/soffice.py lines=53:74
@source pv-order title="scripts/office/validators/pptx.py · 15966B · 검증 순서" path=anthropics/pptx/scripts/office/validators/pptx.py lines=28:72
@source pv-theme title="validators/pptx.py · master theme 공유 검사" path=anthropics/pptx/scripts/office/validators/pptx.py lines=90:107
@source pv-chart title="validators/pptx.py · chart 검사" path=anthropics/pptx/scripts/office/validators/pptx.py lines=109:121
@source pv-slides title="validators/pptx.py · slide 검사와 --original 기준선" path=anthropics/pptx/scripts/office/validators/pptx.py lines=123:202
@source pv-pre title="validators/pptx.py · notesMasterIdLst 순서 보정" path=anthropics/pptx/scripts/office/validators/pptx.py lines=209:226
@source pv-layout title="validators/pptx.py · layout 관계 검사" path=anthropics/pptx/scripts/office/validators/pptx.py lines=270:374
@source pv-notes title="validators/pptx.py · notes 슬라이드 중복 참조" path=anthropics/pptx/scripts/office/validators/pptx.py lines=376:437
@source bs-ignore title="validators/base.py · 33756B · 무시 오류와 ID 표" path=anthropics/pptx/scripts/office/validators/base.py lines=26:47
@source bs-refs title="validators/base.py · 참조 없는 파일도 오류" path=anthropics/pptx/scripts/office/validators/base.py lines=384:399
@source bs-ct title="validators/base.py · Content_Types 검사" path=anthropics/pptx/scripts/office/validators/base.py lines=517:621
@source bs-tpl title="validators/base.py · 템플릿 태그 제거 후 검사" path=anthropics/pptx/scripts/office/validators/base.py lines=842:871
@source hc-limits title="helpers/pptx_chart.py · 5862B · 허용 위치와 축 개수" path=anthropics/pptx/scripts/office/helpers/pptx_chart.py lines=31:33
@source hc-axes title="helpers/pptx_chart.py · 축 최소 개수" path=anthropics/pptx/scripts/office/helpers/pptx_chart.py lines=67:79
@source hc-checks title="helpers/pptx_chart.py · 검사 목록" path=anthropics/pptx/scripts/office/helpers/pptx_chart.py lines=161:170
@source hs-deny title="helpers/pptx_slide.py · 1675B · 치명 오류 denylist" path=anthropics/pptx/scripts/office/helpers/pptx_slide.py lines=1:46
@source ht-inert title="helpers/pptx_theme.py · 3510B · notes master 공유 예외" path=anthropics/pptx/scripts/office/helpers/pptx_theme.py lines=66:114
@source hp-family title="helpers/__init__.py · 3358B · 확장자 계열" path=anthropics/pptx/scripts/office/helpers/__init__.py lines=10:17
@source hp-zip title="helpers/__init__.py · 안전 압축 해제와 재압축" path=anthropics/pptx/scripts/office/helpers/__init__.py lines=74:111
@source cl-doc title="scripts/clean.py · 10415B · 삭제 대상" path=anthropics/pptx/scripts/clean.py lines=1:16
@source cl-refuse title="clean.py · 삭제를 거부하는 경우" path=anthropics/pptx/scripts/clean.py lines=63:90
@source cl-dirs title="clean.py · 정리하는 폴더" path=anthropics/pptx/scripts/clean.py lines=183:230
@source cl-loop title="clean.py · 반복 정리와 Content_Types" path=anthropics/pptx/scripts/clean.py lines=233:282
@source cl-main title="clean.py · 실행과 종료 코드" path=anthropics/pptx/scripts/clean.py lines=285:309
@source ad-doc title="scripts/add_slide.py · 14537B · 사용법" path=anthropics/pptx/scripts/add_slide.py lines=1:25
@source ad-shared title="add_slide.py · 공유 part와 상수" path=anthropics/pptx/scripts/add_slide.py lines=62:68
@source ad-layout title="add_slide.py · 레이아웃에서 만든 슬라이드" path=anthropics/pptx/scripts/add_slide.py lines=38:60
@source ad-layout-fn title="add_slide.py · 레이아웃에서 만드는 함수" path=anthropics/pptx/scripts/add_slide.py lines=89:112
@source ad-dup title="add_slide.py · 슬라이드 복제" path=anthropics/pptx/scripts/add_slide.py lines=115:151
@source ad-pre title="add_slide.py · 등록 전 점검" path=anthropics/pptx/scripts/add_slide.py lines=154:188
@source ad-out title="add_slide.py · -o 없으면 제자리 덮어쓰기" path=anthropics/pptx/scripts/add_slide.py lines=315:326
@source th-const title="scripts/thumbnail.py · 9802B · 상수" path=anthropics/pptx/scripts/thumbnail.py lines=33:41
@source th-input title="thumbnail.py · 입력 확장자" path=anthropics/pptx/scripts/thumbnail.py lines=68:71
@source th-hidden title="thumbnail.py · 숨김 슬라이드" path=anthropics/pptx/scripts/thumbnail.py lines=99:106
@source th-grid title="thumbnail.py · 격자당 슬라이드 수" path=anthropics/pptx/scripts/thumbnail.py lines=218:244
@source xsd-pml title="scripts/office/schemas/ISO-IEC29500-4_2016/pml.xsd · 83612B · 구조·표본만" path=anthropics/pptx/scripts/office/schemas/ISO-IEC29500-4_2016/pml.xsd lines=1054:1060
@source rel-ledger title="skill-explainers/anthropics/relations.md · 관계 원장" path=skill-explainers/anthropics/relations.md lines=1:3

## 언제 켜지고 무엇을 고르나 {#trigger}

@code source=sk-fm language=yaml

frontmatter에 호출 제한 필드(`disable-model-invocation` 등)가 없다.[](source:sk-fm) 그래서 모델이 `description`을 읽고 스스로 켠다. `description`은 켜질지 판단할 때 참고하는 설명이다. 이 단어가 있으면 켜진다는 사전이 아니다.

`description`은 `.pptx`·`.potx`가 입력이든 출력이든 걸리는 모든 경우를 든다. 덱 만들기, 텍스트 추출, 기존 덱 고치기, 슬라이드 합치기·나누기, 템플릿·레이아웃·발표자 노트·댓글을 적었다.[](source:sk-fm)

판정: 형식이 기준이라 읽기만 하는 요청도 범위 안이다. 활성화에서 빼는 문장은 원문에 명시 없음이다.[](source:sk-fm)

원장 r04, r05의 "활성화 제외" 선언은 `docx`·`xlsx`의 `description`에 있고 `pptx`에는 없다.[](source:rel-ledger)

| 작업 | 접근 | 비고 |
| --- | --- | --- |
| 새 덱 만들기 | `pptxgenjs` 스크립트 작성 | 아래 "만들 때" 패널[](source:sk-route) |
| 기존 덱 편집, 템플릿으로 만들기 | unzip, `ppt/slides/slideN.xml` 편집, zip | 아래 "고칠 때" 패널[](source:sk-route) |
| 내용 읽기 | `markitdown deck.pptx` | slide마다 `<!-- Slide number: N -->` 표시. 격자 이미지는 `scripts/thumbnail.py`[](source:sk-route) |
| 옛 `.ppt` | 먼저 `scripts/office/soffice.py`로 `pptx` 변환 | 변환 없이 편집하는 방법은 원문에 명시 없음[](source:sk-69) |
| `.potx` 템플릿 | 압축 풀기·묶기가 `.pptx`와 같다 | 출력 확장자도 `.potx`로 둔다[](source:sk-69) |

`validate.py`는 `.docx .dotx .pptx .potx .xlsx .xltx` 여섯 확장자를 세 계열로 나누고, `.pptx`와 `.potx`를 같은 pptx 계열로 본다.[](source:hp-family) `.xlsx` 계열이면 XSD 검사 없이 안내만 찍고 0으로 끝난다.[](source:vd-family)[](source:vd-case)

## 만들 때 무엇을 강제하나 {#create}

`pptxgenjs`는 미리 설치돼 있다고 한다. 에이전트는 `npm install`을 먼저 하지 않는다. `require('pptxgenjs')`가 실패할 때만 설치한다.[](source:sk-31) 원문은 이 환경에서 쓰는 API를 모델이 안다고 전제하고, 함정만 적는다.[](source:sk-31)

@callout level=warning title="어기면 파일이 깨지거나 chart가 버려지는 5개"
`#` 붙은 색 또는 8자리 hex. 음수 shadow `offset`. 누적 막대·열 chart의 `dataLabelPosition: outEnd`.[](source:sk-34)[](source:sk-36)[](source:sk-46)
보조 축을 쓰는 combo chart에 `valAxes`와 `catAxes`(각각 항목 2개)를 안 준 경우.[](source:sk-47)
`<p:presentation>` 자식 순서 변경(`<p:notesMasterIdLst>`는 `<p:sldIdLst>` 바로 뒤에 둔다).[](source:sk-49)

| 영역 | 규칙 | 어기면 |
| --- | --- | --- |
| 캔버스 | `pres.layout`을 슬라이드 추가 전에 정한다. 기본 `LAYOUT_16x9`은 10" x 5.625"이고 `LAYOUT_WIDE`는 13.3" x 7.5"다[](source:sk-33) | 가장자리 밖 좌표는 clamp 없이 기록돼 도형이 안 보인다 |
| 색 | `color: "FF0000"`처럼 `#` 없이 6자리. 반투명은 채우기·이미지에 `transparency: 0-100`, 그림자에 `opacity: 0.0-1.0`[](source:sk-34) | `#`·8자리는 파일 손상. 두 옵션은 서로의 자리에서 조용히 무시된다 |
| 옵션 객체 | `add*` 호출마다 새 객체를 만든다. `pptxgenjs`가 값을 EMU로 제자리 변환한다[](source:sk-35) | 공유한 `shadow`·옵션 값이 어긋난다 |
| 그림자 | `offset`은 0 이상. 위로 드리우려면 `angle: 270`에 양수 `offset`[](source:sk-36) | 음수는 파일 손상 |
| 글자 간격 | `charSpacing`을 쓴다[](source:sk-37) | `letterSpacing`은 조용히 무시된다 |
| 목록 | 항목마다 `bullet: true`. 마지막 항목만 빼고 `breakLine: true`. 간격은 `paraSpaceAfter`[](source:sk-38) | 글자 `•`는 글머리표가 둘로 보인다. `lineSpacing`은 간격이 크게 벌어진다 |
| 인스턴스 | 출력 파일 하나에 `new pptxgen()` 하나[](source:sk-39) | 재사용 금지(결과는 원문에 명시 없음) |
| 도형 | `rectRadius`는 `ROUNDED_RECTANGLE`에만 먹는다. 그라데이션 채우기는 지원하지 않아 그라데이션 이미지를 배경으로 쓴다[](source:sk-40)[](source:sk-41) | `RECTANGLE`에서는 무시된다 |
| 텍스트 상자 | 도형·선·아이콘과 x를 맞출 글은 `margin: 0`[](source:sk-42) | 내부 여백만큼 어긋난다 |
| 발표자 노트 | `slide.addNotes("...")`를 슬라이드당 한 번, 일반 텍스트로[](source:sk-43) | 슬라이드 위 텍스트 상자에 쓰지 않는다 |
| chart | PowerPoint가 그릴 수 있는 것은 모두 `addChart()`. combo는 `{type, data, options}` 배열. 추세선·오차 막대는 계열을 직접 계산하거나 OOXML을 후처리한다[](source:sk-44) | 렌더 이미지로 대체 금지. 이미지는 Sankey·network·chord처럼 네이티브가 없는 경우만 |
| chart 외형 | `showTitle`+`title`, `showValue: true`+`dataLabelPosition`, `chartColors`, 축 라벨 색, `valGridLine`, `catGridLine: { style: "none" }`, 단일 계열이면 `showLegend: false`[](source:sk-45) | 기본값은 제목·값 라벨 없이 낡은 색으로 그려진다 |
| 누적 chart | `dataLabelPosition`은 `ctr`, `inEnd`, `inBase` 중 하나[](source:sk-46) | `outEnd`는 파일 손상 |
| 보조 축 | `secondaryValAxis`/`secondaryCatAxis`를 쓰면 `valAxes`·`catAxes` 각각 2개[](source:sk-47) | 선언 없는 축 id가 쓰여 PowerPoint가 chart를 버리고 손상으로 보고한다. `valAxes`만 주는 것도 부족하다 |
| 저장 뒤 | `writeFile()` 다음에 `python scripts/office/validate.py deck.pptx`. 결함은 생성 스크립트에서 고친다[](source:sk-48) | 포장된 XML을 손으로 고치지 않는다 |
| 아이콘 | `react-icons`를 SVG로 렌더하고 `sharp`로 256px 이상 PNG로 만든다. `addImage`의 `data`에 `image/png;base64,` 접두어를 붙인다[](source:sk-50) | 접두어는 필수다 |

판정: 위 표 16행 중 `validate.py`가 기계적으로 잡는 것은 chart 2개(누적 라벨 위치, 축 id)와 presentation 순서가 낳는 theme 공유뿐이다. 나머지는 지시문이라 에이전트가 지켜야 한다. 근거는 chart 검사 목록과 검증 순서에 색·그림자·목록 검사가 없다는 점이다.[](source:hc-checks)[](source:pv-order)

## 기존 덱·템플릿은 어떤 순서로 고치나 {#edit}

@workflow id=edit-flow title="기존 덱 편집 순서"
| thumb | 레이아웃 고르기 | external |
| unpack | 압축 풀기 | backend |
| struct | 구조 작업 | backend |
| clean | 정리 | backend |
| edit | 내용 편집 | backend |
| pack | 묶기와 검증 | backend |
| thumb > unpack | |
| unpack > struct | |
| struct > clean | 삭제했을 때 | |
| clean > edit | | emphasis |
| struct > edit | 삭제 없음 | |
| edit > pack | | emphasis |

@steps id=edit-steps
| st-thumb | 레이아웃 고르기 | `python scripts/thumbnail.py template.pptx template-thumbs`로 격자 이미지를 만든다. 두 번째 인자를 덱 이름으로 꼭 준다. 기본값 `thumbnails`는 같은 폴더의 다른 덱 격자를 덮어쓴다. `markitdown`과 함께 보고 내용 구획마다 템플릿 슬라이드를 고르며, 같은 제목+글머리표 슬라이드만 쓰지 않는다.[](source:sk-54) | edit-flow | thumb |
| st-unpack | 압축 풀기 | python `zipfile`로 `unpacked/`에 푼다.[](source:sk-56-64) | edit-flow | unpack |
| st-struct | 구조 작업 | `add_slide.py`로 슬라이드를 복제하고, 순서 변경·삭제는 `ppt/presentation.xml`의 `<p:sldIdLst>`를 편집한다.[](source:sk-56-64) | edit-flow | struct |
| st-clean | 정리 | 삭제한 뒤 `clean.py unpacked/`로 고아 슬라이드·미디어·rels를 지운다. `<p:sldIdLst>`가 확정된 다음에만 돌린다.[](source:sk-56-64) | edit-flow | clean |
| st-edit | 내용 편집 | `ppt/slides/slideN.xml`을 고친다.[](source:sk-56-64) | edit-flow | edit |
| st-pack | 묶기와 검증 | `unpacked` 안에서 `rm -f ../out.pptx && zip -Xr ../out.pptx .`로 묶는다. 먼저 `rm`하지 않으면 삭제한 part가 남는다. 이어서 `validate.py out.pptx --original deck.pptx`를 돌린다.[](source:sk-56-64) | edit-flow | pack |

| 규칙 | 내용 | 어기면 |
| --- | --- | --- |
| 구조 먼저 | 추가·삭제·순서 변경을 모두 끝낸 뒤에 슬라이드 내용을 고친다[](source:sk-66) | `add_slide.py`는 슬라이드 파일을 그대로 복사하므로 고친 뒤 복제하면 고친 내용이 딸려 온다. `clean.py`는 `<p:sldIdLst>`에 없는 슬라이드를 지우므로 방금 쓴 슬라이드도 지운다 |
| 수동 복사 금지 | 슬라이드는 `add_slide.py`로만 복제한다. 파일 대상으로는 `add_slide.py deck.pptx slide2.xml -o out.pptx`처럼 `-o`를 준다[](source:sk-67) | `-o` 없으면 입력 덱을 제자리에서 덮어쓴다(코드도 출력이 없으면 입력 경로에 쓴다)[](source:ad-out) |
| 공유 part | 복제본은 원본의 chart·SmartArt·내장 개체 part를 복사하지 않고 참조한다[](source:sk-67) | 한 슬라이드의 chart를 고치면 다른 슬라이드도 바뀐다 |
| `python-pptx` | `add_slide(layout)`만 있어 복제가 안 된다. `text_frame.text = "..."`는 한 문단을 서식 없는 run 하나로 만든다(대신 `run.text`에 대입). 템플릿 그림에 많은 SVG·EMF는 `add_picture`가 `UnidentifiedImageError`를 낸다[](source:sk-68) | 세 가지 모두 하지 않는다고 원문이 말한다 |
| 템플릿 아이콘 | 템플릿의 아이콘·이미지를 쓰려면 그것이 든 슬라이드나 레이아웃을 복제한다[](source:sk-70) | - |
| XML 변환 | `defusedxml.minidom`으로 파싱한다[](source:sk-74) | `xml.etree.ElementTree`는 네임스페이스 접두어를 다시 써서 덱이 손상된다 |
| 슬롯과 항목 | 템플릿에 팀원 4명이 있고 내가 가진 것이 3명이면 4번째 그룹 전체(이미지+텍스트 상자)를 지운다[](source:sk-75) | 글자만 지우면 고아 시각 요소가 남아, QA에서 확인해야 한다 |
| 문단 | 목록 항목마다 `<a:p>` 하나. 형제의 `<a:pPr>`를 복사해 간격을 보존하고, 제목·섹션 머리글·인라인 라벨(`Status:`)의 `<a:rPr>`에 `b="1"`[](source:sk-76) | 한 문단에 이어 붙이지 않는다 |
| 글머리표 | 레이아웃에서 상속한다. 바꿀 때만 `<a:buChar>`, `<a:buAutoNum>`, `<a:buNone>`[](source:sk-77) | 글자 `•` 금지 |
| 공백 | 앞뒤 공백이 있는 글은 `<a:t>`에 `xml:space="preserve"`[](source:sk-78) | - |

스크립트가 실제로 하는 일은 코드로 확인했다(실행은 하지 않았다).

| 스크립트 | 코드에서 확인한 동작 |
| --- | --- |
| `add_slide.py` | 복제하면 `.rels`에서 `notesSlide` 관계를 빼서 발표자 노트를 공유하지 않는다. 새 `sldId`는 256 이상으로 매기고, `chart`·`diagramData`·`oleObject`·`package` part가 공유되면 Note를 출력한다.[](source:ad-doc)[](source:ad-shared)[](source:ad-dup) 이전에 지운 슬라이드가 `[Content_Types].xml`이나 rels에 남아 있으면 "`clean.py`를 먼저 돌려라"며 중단한다.[](source:ad-pre) |
| `add_slide.py slideLayoutN.xml` | 판정: 레이아웃의 내용을 복제하는 것이 아니라 빈 `spTree`만 있는 슬라이드를 만들어 그 레이아웃에 연결한다. SKILL.md의 "duplicate a slide (or `slideLayoutN.xml`)"는 이 뜻으로 읽어야 한다. 근거는 `MINIMAL_SLIDE_XML` 상수와 `create_slide_from_layout`이다.[](source:ad-layout)[](source:ad-layout-fn)[](source:sk-scripts) |
| `clean.py` | 정리 대상은 `<p:sldIdLst>`에 없는 슬라이드, `[trash]`, `ppt/` 아래 `media`·`embeddings`·`charts`·`diagrams`·`tags`·`drawings`·`ink`의 참조 없는 파일, 참조 없는 theme·notes 슬라이드다. 더 지울 것이 없을 때까지 반복하고, 지운 part의 `Override`를 `[Content_Types].xml`에서 뺀다.[](source:cl-doc)[](source:cl-dirs)[](source:cl-loop) 목록의 슬라이드가 하나도 디스크와 안 맞거나 어떤 관계도 해석되지 않으면 "Nothing was deleted"로 거부하고 1로 끝난다.[](source:cl-refuse)[](source:cl-main) |
| `thumbnail.py` | `.pptx`만 받는다. 숨김 슬라이드는 `(hidden)` 라벨이 붙은 회색 칸으로 둔다. 열 수 기본 3, 최대 6이고 격자 한 장은 열 x (열+1)장이다. SKILL.md의 "12장 넘으면 `-N.jpg`로 분할"은 기본 열 수 3일 때만 맞다.[](source:th-const)[](source:th-input)[](source:th-hidden)[](source:th-grid)[](source:sk-54) |

## 디자인은 무엇을 금지하고 어떤 수치를 쓰나 {#design}

원문은 "보통 슬라이드를 만들지 말라"로 시작한다. 글머리표만 있는 흰 배경은 인상을 못 남긴다고 본다.[](source:sk-before) 아래 표의 강도는 원문 표기를 그대로 옮겼다. `NEVER`는 대문자 금지, `Don't`는 금지형 권고, `권고`는 "Pick", "Consider" 같은 제안이다.

| 구분 | 규칙 | 강도 |
| --- | --- | --- |
| 팔레트 | 주제에 맞춘 대담한 색. 다른 주제의 덱에 그대로 넣어도 어울리면 선택이 모호한 것이다[](source:sk-before) | 권고 |
| 색 비중 | 주색 하나가 시각 비중 60-70%, 보조색 1-2개, 날카로운 강조색 하나. 색을 같은 비중으로 쓰지 않는다[](source:sk-before) | 권고(수치는 원문 그대로) |
| 명암 | 제목·결론 슬라이드는 어둡게, 내용은 밝게("샌드위치"). 또는 처음부터 끝까지 어둡게[](source:sk-before) | 권고 |
| 모티프 | 특징 있는 요소 하나를 정해 모든 슬라이드에 반복한다. 색 막대·강조선은 모티프로 쓰지 않는다[](source:sk-before) | 권고 |
| 시각 요소 | 모든 슬라이드에 이미지·chart·아이콘·도형 중 하나. 글만 있는 슬라이드는 만들지 않는다[](source:sk-slide)[](source:sk-avoid) | "needs" / Don't |
| 제목 강조선 | 제목 밑에 선을 긋지 않는다. 공백이나 배경색을 쓴다[](source:sk-161) | NEVER |
| 장식 막대 | 폭 전체 머리·바닥 막대, 가장자리 세로 줄무늬, 카드 한쪽 가장자리의 가는 줄무늬, 사각형의 한쪽 테두리를 쓰지 않는다. 카드를 돋보이게 하려면 옅은 배경색·그림자·아이콘[](source:sk-162) | NEVER |
| 배경색 | 지정이 없으면 흰색(`FFFFFF`)이나 사용자 브랜드 색. `F5F5DC`, `FAF0E6`, `FAEBD7`, `FFF8E1` 같은 따뜻한 중간색은 기본값으로 쓰지 않는다[](source:sk-163) | Don't |
| 기본 파랑 | 기본으로 파랑을 고르지 않는다[](source:sk-avoid) | Don't |
| 레이아웃 | 같은 레이아웃을 반복하지 않는다. 본문은 가운데 정렬하지 않고 제목만 가운데[](source:sk-avoid) | Don't |
| 간격 | 0.3"나 0.5" 중 하나를 골라 일관되게 쓴다. 한 슬라이드만 꾸미고 나머지를 방치하지 않는다[](source:sk-avoid) | Don't |
| 대비 | 아이콘과 글 모두 배경과 강한 대비. 밝은 바탕에 밝은 글, 어두운 바탕에 어두운 글 금지[](source:sk-avoid) | Don't |
| 넘침 | 글이 도형 밖으로 넘치거나 잘린 채 두지 않는다. 글자 크기를 줄이거나, 슬라이드를 나누거나, 상자를 키운다[](source:sk-164) | Don't |

| 요소 | 크기 | 비고 |
| --- | --- | --- |
| 슬라이드 제목 | 36-44pt 굵게 | 36pt 이상이어야 본문과 크기 차가 난다[](source:sk-sizes)[](source:sk-avoid) |
| 섹션 머리글 | 20-24pt 굵게 | [](source:sk-sizes) |
| 본문 | 14-16pt | [](source:sk-sizes) |
| 캡션 | 10-12pt 옅은 색 | [](source:sk-sizes) |
| 큰 수치 강조 | 60-72pt 숫자 + 작은 라벨 | 데이터 표시 예시[](source:sk-slide) |
| 바깥 여백 | 최소 0.5" | [](source:sk-spacing) |
| 블록 사이 | 0.3-0.5" | 여백을 남기고 모든 곳을 채우지 않는다[](source:sk-spacing) |

글꼴은 사용자의 PowerPoint가 그린다. QA 렌더는 LibreOffice라서 없는 글꼴을 대체하고, 폭이 달라 넘침이 틀리게 보일 수 있다.[](source:sk-fonts)

| 구분 | 글꼴 | 쓰는 법 |
| --- | --- | --- |
| 안전 글꼴 | Arial, Calibri, Cambria, Times New Roman, Courier New, Bookman Old Style, Century Schoolbook | QA에서도 폭이 맞는다. 본문과 맞춤이 중요한 곳에 쓴다. 제목은 serif(Cambria·Bookman Old Style·Century Schoolbook)에 본문은 sans(Calibri·Arial)를 짝짓는다[](source:sk-fonts) |
| 사용자가 안전 목록 밖을 요청 | 예: Georgia, Trebuchet MS | 요청한 곳에 쓰되 상자에 약 10% 여유를 둔다. 그 요소의 QA 넘침 판정은 믿지 않는다[](source:sk-fonts) |
| QA에서 폭이 틀리는 글꼴 | Georgia, Trebuchet MS, Impact, Arial Black, Garamond, Consolas, Palatino Linotype. Calibri Light도 환경에 따라 달라 같은 취급 | 제목·강조에만, 여유를 두고[](source:sk-fonts) |
| 기본값 금지 | Aptos | 2023년 이후 Office 기본 글꼴인데 이 환경에 폭이 맞는 대체 글꼴이 없고 옛 Office에는 없다. 기본으로 고르지 않는다(원문은 `Never`로 표기)[](source:sk-fonts) |

팔레트 10종은 "영감용"이라고 적혀 있다. 이름과 주색은 아래와 같다.[](source:sk-palette)

| 이름 | 주색 | 보조색 | 강조색 |
| --- | --- | --- | --- |
| Midnight Executive | `1E2761` 남색 | `CADCFC` 연한 하늘 | `FFFFFF` |
| Forest & Moss | `2C5F2D` | `97BC62` | `F5F5F5` |
| Coral Energy | `F96167` | `F9E795` | `2F3C7E` |
| Warm Terracotta | `B85042` | `E7E8D1` | `A7BEAE` |
| Ocean Gradient | `065A82` | `1C7293` | `21295C` |
| Charcoal Minimal | `36454F` | `F2F2F2` | `212121` |
| Teal Trust | `028090` | `00A896` | `02C39A` |
| Berry & Cream | `6D2E46` | `A26769` | `ECE2D0` |
| Sage Calm | `84B59F` | `69A297` | `50808E` |
| Cherry Bold | `990011` | `FCF6F5` | `2F3C7E` |

판정: 디자인 규칙은 스크립트가 검사하지 않는다. `validate.py`의 검증 목록은 구조·관계·스키마·chart·slide 결함뿐이고 색·글꼴·크기·여백 검사가 없다. 지키는지는 에이전트의 판단과 아래 눈 점검에 달려 있다.[](source:pv-order)[](source:sk-visual)

## 끝낼 때 어떤 QA를 하나 {#qa}

QA는 "필수"로 적혀 있다. 첫 렌더에는 보통 실제 문제(겹침, 넘침, 어긋남)가 몇 개 있다. 찾아 고치고, 바꾼 슬라이드만 다시 렌더한 뒤 멈춘다.[](source:sk-qa-head)

@workflow id=qa-loop title="QA 순서"
| content | 내용 QA | backend |
| file | 파일 QA | backend |
| fileok | 검증 통과? | backend |
| visual | 눈 QA | backend |
| issue | 겹침·넘침 있나? | backend |
| fix | 고치고 다시 렌더 | backend |
| done | 멈춤 | frontend |
| content > file | |
| file > fileok | |
| fileok > visual | 예 | emphasis |
| fileok > file | 생성기를 고치고 다시 만듦 | |
| visual > issue | |
| issue > fix | 예 | |
| fix > issue | | |
| issue > done | 아니오 | emphasis |

@steps id=qa-steps
| st-content | 내용 QA | `markitdown output.pptx`로 빠진 내용, 오타, 순서를 본다. 템플릿을 썼다면 아래 `grep`으로 자리 표시 문구를 찾고, 결과가 있으면 성공을 선언하기 전에 고친다.[](source:sk-content) | qa-loop | content |
| st-file | 파일 QA | 처음부터 만들었으면 `validate.py output.pptx`, 템플릿에서 만들었으면 `--original src.pptx`를 붙인다.[](source:sk-file) | qa-loop | file |
| st-fileok | 검증 통과? | 실패마다 고칠 방법이 나온다. 생성기에서 고치고 다시 만든다.[](source:sk-file) | qa-loop | fileok |
| st-visual | 눈 QA | PDF로 바꾸고 `pdftoppm -jpeg -r 150`으로 이미지를 만들어 모든 슬라이드를 본다. 생성 코드를 오래 본 뒤에는 기대한 모습만 보이므로 새 눈으로 본다(서브에이전트가 있으면 좋다).[](source:sk-visual) | qa-loop | visual |
| st-issue | 겹침·넘침 있나? | 아래 결함 목록으로 점검한다. 글이 상자나 슬라이드 경계에서 넘치거나 잘리는지를 가장 먼저 본다.[](source:sk-visual) | qa-loop | issue |
| st-fix | 고치고 다시 렌더 | 고친 뒤 변환 명령 4개를 모두 다시 돌린다. PDF를 `.pptx`에서 다시 만들어야 `pdftoppm`에 반영된다.[](source:sk-conv) | qa-loop | fix |

@code source=sk-grep language=bash

**눈 QA 결함 목록**(원문 열두 가지).[](source:sk-visual)

- 글이 상자나 슬라이드 경계에서 넘치거나 잘림(가장 먼저, 사용자에게 항상 보이는 흔한 결함). 글꼴이 QA에서 틀리게 보이는 것이면 렌더는 근사값이니 남긴 약 10% 여유를 믿는다.
- 요소 겹침(도형을 뚫은 글, 단어를 가르는 선, 쌓인 요소). 출처 표기나 푸터가 위 내용과 부딪침.
- 요소 사이 간격이 0.3" 미만이거나 카드·구획이 거의 붙음. 한 곳은 크게 비고 한 곳은 빽빽한 불균형 간격.
- 슬라이드 가장자리 여백이 0.5" 미만. 열이나 같은 종류 요소의 정렬이 제각각.
- 옅은 회색 글이 크림색 바탕 위에 있는 것 같은 저대비 글, 어두운 바탕 위 어두운 아이콘 같은 저대비 아이콘(대비 원을 둔다).
- 글을 바꾼 뒤 템플릿 장식이 어긋남(예: 제목이 두 줄이 됐는데 밑줄은 한 줄 기준). 글 상자가 너무 좁아 줄바꿈이 많음. 남은 자리 표시 내용.

`validate.py`가 pptx 계열에서 하는 일이다(코드로 확인, 실행하지 않음).

| 검사 | 내용 | 근거 |
| --- | --- | --- |
| 순서 | XML 형식이 틀리면 거기서 중단한다. 이후 namespace, ID 중복, UUID 모양 ID, 파일 참조, layout id, Content_Types, XSD, notes 슬라이드, 관계 id, 중복 layout, master theme 공유, chart, slide 순으로 모두 돌려 하나라도 실패하면 실패다 | [](source:pv-order) |
| 참조 | 관계가 끊겼을 때뿐 아니라 어떤 관계도 가리키지 않는 파일도 오류다. "손상으로 보인다"는 문구와 함께 참조하거나 지우라고 한다 | [](source:bs-refs) |
| chart | 누적 막대(`stacked`·`percentStacked`)에서 `outEnd` 라벨, 그리고 chart 그룹이 해석 가능한 축 id를 2개 미만 가진 경우(3D 계열 일부는 3개) | [](source:hc-limits)[](source:hc-axes)[](source:hc-checks) |
| slide XML | 일곱 가지 스키마 오류만 치명적으로 본다. 한 `<a:tblPr>`에 `<a:tableStyleId>` 둘, 6자리 hex가 아닌 색, 자식 없는 `<p:txBody>`, `lim="NaN"`인 선 이음, 위치가 틀린 `<a:uLnTx>`·`<p:overrideClrMapping>`, 자식 없는 `<p:nvGrpSpPr>` | [](source:hs-deny) |
| `--original` | 템플릿 자체의 XSD·slide 오류를 기준선으로 빼서 내 오류만 보이게 한다. 관계·Content_Types·chart 검사는 `--original`을 무시하고 템플릿에서 물려받은 문제도 보고한다 | [](source:sk-file)[](source:pv-slides) |
| master theme | master가 theme part를 공유하면 실패한다. 단 notes master만 공유하고 `<p:notesMasterIdLst>`가 `<p:sldIdLst>` 바로 뒤에 있으면 무해로 보고 통과시킨다 | [](source:pv-theme)[](source:ht-inert) |
| layout·notes | `<p:sldLayoutId>`의 `r:id`가 slideMaster 관계에 있어야 한다. 슬라이드 하나에 `slideLayout` 관계는 하나여야 한다. notes 슬라이드 하나를 둘 이상의 슬라이드가 참조하면 오류다 | [](source:pv-layout)[](source:pv-notes) |
| Content_Types | `sld`·`sldLayout`·`sldMaster`·`presentation`·`theme` 루트 파일이 `Override`에 없으면 오류다. `png`·`jpg`·`gif` 같은 미디어 확장자가 `Default`에 없어도 오류이고 추가할 줄을 알려 준다 | [](source:bs-ct) |
| 스키마 보조 | XSD 검사 전에 텍스트 노드의 `{{...}}` 템플릿 태그를 지운다(`t` 요소 제외). 오류 메시지에 `hyphenationZone`, `purl.org/dc/terms`가 들어 있으면 무시한다. `sldId`·`sp`·`pic`·`grpSp` 등은 파일 안 ID 중복을, `sldMasterId`·`sldLayoutId`는 전역 중복을 본다 | [](source:bs-tpl)[](source:bs-ignore) |
| 압축 해제 | 포장된 파일은 symlink 항목과 폴더를 벗어나는 경로를 거부하며 푼다. 재압축은 `[Content_Types].xml`을 맨 앞에 무압축으로 둔다 | [](source:hp-zip) |
| 종료 코드 | 통과 0, 검증 실패 1, 인자·파일 오류 2. `SKILL.md`에 없는 옵션이 둘 있다. `--auto-repair`(입력 파일을 제자리에서 고침)와 `-v` | [](source:vd-exit)[](source:vd-fail)[](source:vd-args)[](source:vd-repair) |

판정: `validate.py`가 통과해도 PowerPoint가 열린다는 보증은 아니다. slide 오류는 7개 패턴만 보는 denylist이고, 모르는 오류 종류는 놓치도록 설계됐다고 코드가 적었다. chart도 2개 결함만 본다.[](source:hs-deny)[](source:hc-checks) 그래서 눈 QA가 따로 필요하다.

이미지 변환 명령은 `soffice.py ... --convert-to pdf`, `rm -f slide-*.jpg`, `pdftoppm -jpeg -r 150`, `ls -1 "$PWD"/slide-*.jpg` 순서다. 출력의 절대 경로를 이미지 보기 도구에 그대로 넘긴다.[](source:sk-conv)

`rm`은 현재 폴더의 옛 `slide-*.jpg`를 지운다. `pdftoppm`은 쪽수에 따라 `slide-1.jpg`, `slide-01.jpg`, `slide-001.jpg`로 이름을 맞춘다.[](source:sk-conv)

`soffice.py`는 `SAL_USE_VCLPLUGIN=svp`를 설정하고 임시 프로필(`-env:UserInstallation`)로 `soffice`를 돌린다. 소켓(AF_UNIX) 생성이 막힌 환경에서는 `gcc`로 shim을 컴파일해 임시 폴더에 두고 `LD_PRELOAD`로 건다.[](source:so-run)[](source:so-shim)

@callout level=open-question title="바꾼 슬라이드만 다시 렌더하라는 말과 변환 명령 4개를 모두 다시 돌리라는 말"
QA 도입부는 "바꾼 슬라이드만 다시 렌더하고 멈춘다"고 쓴다.[](source:sk-qa-head)
이미지 절은 "고친 뒤 4개 명령을 모두 다시 돌려라, PDF는 편집한 `.pptx`에서 다시 만들어야 한다"고 쓴다.[](source:sk-conv)
판정: 변환 명령은 덱 전체를 다시 렌더하므로, "바꾼 슬라이드만"은 확인할 이미지의 범위로 읽는 해석이 가능하다. 어느 쪽이 우선인지는 원문에 명시 없음.

## 묶음 안에서 어디에 있나 {#position}

소속 묶음은 `office-ooxml`이다. 세 스킬(`docx`·`pptx`·`xlsx`)은 파일 형식만 다른 변형이라 순서가 없다. 그래서 앞뒤 흐름도를 그리지 않고 원장의 관계를 표로만 둔다. 묶음 전체는 `anthropics/_group-office-ooxml/office-ooxml.html`에서 본다.

| 상대 | 관계 | rel-id | 주고받는 것 | 조건·강도 |
| --- | --- | --- | --- | --- |
| `anthropics/docx` (r01) | 공유 상태(추론) | r01 | `scripts/office/` 도구 사본 | 폴더 전체가 `diff -rq`로 동일하다. 어느 쪽 `SKILL.md`도 상대를 부르지 않는다. 같은 파일의 사본이지 같은 경로를 읽고 쓰는 것이 아니다[](source:rel-ledger) |
| `anthropics/xlsx` (r03) | 공유 상태(추론) | r03 | `scripts/office/` 도구 사본 | r01과 같다. `xlsx`가 이 폴더의 사용을 `SKILL.md`에서 지시하는지는 `xlsx` 페이지에서 확인한다[](source:rel-ledger) |
| `anthropics/docx` (r06) | 산출물 호환(미확인, 해석 상태 불명) | r06 | 없음 | 두 스킬 모두 `soffice.py`로 PDF를 만들고 `pdftoppm`으로 이미지를 뽑아 보는 같은 절차를 쓴다. 서로의 산출물을 입력으로 쓴다는 문장은 없다. `pptx`의 해당 절은 `SKILL.md` 225-234줄이다[](source:sk-conv)[](source:rel-ledger) |

- 이 폴더 사본은 `docx`·`xlsx`와 같은 파일이지만, `pptx` 경로가 실제로 거치는 것은 일부다. `validate.py`가 pptx 계열에 쓰는 것은 `validators/pptx.py`와 `base.py`, `helpers/pptx_*.py`이고 `validators/docx.py`와 `redlining.py`는 호출되지 않는다.[](source:vd-case)
- 판정: 폴더가 같아도 스킬마다 `SKILL.md`가 부르는 파일이 다르다. 그래서 `docx`·`xlsx` 분석에서 내부 동작을 가져다 쓰려면 그 스킬의 필수 참조까지 같은지를 따로 확인해야 한다. 이 페이지는 재사용 없이 `pptx`의 경로에서 새로 읽은 것이다.[](source:vd-case)[](source:sk-scripts)
- 사용자 개입, 넘김, 위임 없음. 이 스킬은 다른 스킬을 부르라고 하지 않는다. `SKILL.md` 전체를 grep했을 때 다른 스킬 이름이 없다.

## 어디까지 확인했고 무엇이 남았나 {#audit}

@facts id=audit-facts
| 대상 | `anthropics/pptx/` 텍스트 파일 56개, 1,149,051B, 분석 커밋 `b825733a707f8debae1a9b5d6e4e796c343b8ae1` |
| 끝까지 읽음 | 16개, 160,781B (`SKILL.md`, 스크립트 3개와 `__init__.py`, `scripts/office/` 파이썬 11개) |
| 구조·표본만 확인(전부 읽지 않음) | 40개, 988,270B. `LICENSE.txt` 1개와 `scripts/office/schemas/` XSD 39개(976,913B) |
| 바이너리 | 없음 |
| 실행 | 스크립트, `pptxgenjs`, `markitdown`, `soffice`는 실행하지 않았다. 동작은 코드를 읽어 서술했다 |
| 분석 중 바뀐 파일 | 없음 |
| 파일 목록 | `skill-explainers/anthropics/pptx/files.md` |

XSD는 구조만 봤다. 폴더별 파일 수는 `ISO-IEC29500-4_2016` 27개, `ecma/fouth-edition` 4개, `mce` 1개, `microsoft` 7개다.

`pml.xsd`에서 `notesMasterIdLst`(1056줄)가 `sldIdLst`(1059줄)보다 앞에 선언된 것을 확인했다.[](source:xsd-pml) 판정: 검증기가 XSD 검사 직전에 순서를 보정하는 이유와 맞는다.[](source:pv-pre)

`microsoft/` 7개는 모두 `wml-*` 이름이라 pptx 경로가 직접 쓰지 않는 것으로 보이지만, 내용은 읽지 않았다.

`LICENSE.txt`는 Apache License 2.0 표준 텍스트로 보이며 앞 3줄만 확인했다.[](source:lic) frontmatter는 `license: Complete terms in LICENSE.txt`라고 적는다.[](source:sk-fm)

@callout level=open-question title="원문 주장 중 실행 없이는 확인할 수 없는 것"
`pptxgenjs`가 이미 설치돼 있다는 말과 `react-icons`·`sharp` 등이 미리 설치돼 있다는 말.[](source:sk-31)[](source:sk-50)
`#` 색, 음수 `offset`, `outEnd`가 파일을 손상시킨다는 말과 PowerPoint가 보조 축 없는 chart를 버린다는 말.[](source:sk-34)[](source:sk-36)[](source:sk-46)[](source:sk-47)
`validate.py`의 chart 검사가 이 두 결함을 감지한다는 것은 코드로 확인했지만, 실제 PowerPoint가 거부하는지는 원문 주장을 옮긴 것이다.[](source:hc-checks)

@callout level=open-question title="의존 도구"
`markitdown[pptx]`, `Pillow`, `defusedxml`, `lxml`(pip), LibreOffice, `pdftoppm`(Poppler)이 필요하다고 적는다.[](source:sk-deps) `python-pptx`는 의존 목록에 없고 대안으로만 언급된다.[](source:sk-68)
`soffice.py`가 소켓 shim을 만들려면 `gcc`가 필요하지만 의존 목록에 없다.[](source:so-shim)[](source:sk-deps)
