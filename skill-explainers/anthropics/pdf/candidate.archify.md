# pdf 스킬은 에이전트를 어떻게 바꾸나 {#pdf-skill}

`pdf`를 켜면 에이전트는 PDF 작업을 Python 라이브러리와 CLI 레시피로 풀고, 양식을 채울 때만 `forms.md`의 고정 순서를 따른다. 양식은 fillable 필드(입력 칸이 PDF 안에 정의된 양식)가 있으면 필드 ID로 값을 넣고, 없으면 좌표를 계산해 텍스트 주석을 얹는다.[](source:f-crit)[](source:f-run)[](source:f-s3)

- 켜지는 조건은 넓다. `description`은 PDF 읽기·합치기·나누기·만들기·양식·암호·OCR을 늘어놓고 ".pdf를 언급하거나 PDF를 만들라는 요청이면 쓰라"고 끝맺는다. 호출 제한 필드는 없다.[](source:fm)
- 강제는 두 곳이다. `SKILL.md`는 ReportLab에서 유니코드 첨자 문자를 금지하고, `forms.md`는 단계를 순서대로 끝내기 전에 코드를 쓰지 말라고 한다.[](source:sub)[](source:f-crit)
- 사람 승인, 질문, 종료 조건은 두 문서에 원문에 명시 없음. 양식 채우기는 스크립트가 오류를 내면 고쳐서 다시 돌리는 흐름이고, 마지막 확인은 변환한 이미지를 눈으로 보는 것이다.[](source:f-run)[](source:f-s4)
- 파일 이름 대소문자, 스크립트 이름, 좌표 설명에서 원문끼리 어긋난 곳이 있다. 스크립트는 실행하지 않고 읽기만 했다.[](source:ov)[](source:f-crit)[](source:f-a1)

@answer scope="텍스트 12개 · 지시상 동작 · 스크립트 미실행"
@meta locale=ko
@source fm title="anthropics/pdf/SKILL.md · 8058B · frontmatter" path=anthropics/pdf/SKILL.md lines=1:5
@source ov title="anthropics/pdf/SKILL.md · 개요(REFERENCE.md, FORMS.md 안내)" path=anthropics/pdf/SKILL.md lines=9:11
@source xl title="anthropics/pdf/SKILL.md · 표를 .xlsx로 저장하는 예" path=anthropics/pdf/SKILL.md lines=102:119
@source sub title="anthropics/pdf/SKILL.md · IMPORTANT 첨자 문자 금지" path=anthropics/pdf/SKILL.md lines=169:187
@source cli title="anthropics/pdf/SKILL.md · 명령줄 도구(pdftk은 if available)" path=anthropics/pdf/SKILL.md lines=189:229
@source ocr title="anthropics/pdf/SKILL.md · 스캔 PDF OCR 예" path=anthropics/pdf/SKILL.md lines=233:250
@source enc title="anthropics/pdf/SKILL.md · 암호 걸기 예" path=anthropics/pdf/SKILL.md lines=279:294
@source qr title="anthropics/pdf/SKILL.md · Quick Reference 표" path=anthropics/pdf/SKILL.md lines=296:307
@source nx title="anthropics/pdf/SKILL.md · Next Steps" path=anthropics/pdf/SKILL.md lines=309:314
@source wm title="anthropics/pdf/SKILL.md · 워터마크 예" path=anthropics/pdf/SKILL.md lines=252:269
@source img title="anthropics/pdf/SKILL.md · pdfimages로 이미지 추출" path=anthropics/pdf/SKILL.md lines=271:277
@source qs title="anthropics/pdf/SKILL.md · Quick Start(pypdf로 텍스트 추출)" path=anthropics/pdf/SKILL.md lines=13:26
@source f-crit title="anthropics/pdf/forms.md · 11854B · `CRITICAL`과 fillable 판별" path=anthropics/pdf/forms.md lines=1:4
@source f-info title="anthropics/pdf/forms.md · 필드 정보 JSON 형식" path=anthropics/pdf/forms.md lines=6:55
@source f-val title="anthropics/pdf/forms.md · field_values.json 형식" path=anthropics/pdf/forms.md lines=56:73
@source f-run title="anthropics/pdf/forms.md · fill_fillable_fields 실행과 검증" path=anthropics/pdf/forms.md lines=74:76
@source f-nf title="anthropics/pdf/forms.md · 구조 추출 먼저, 분기 기준" path=anthropics/pdf/forms.md lines=78:92
@source f-a1 title="anthropics/pdf/forms.md · A.1 좌표계 서술(y=0이 위)" path=anthropics/pdf/forms.md lines=100:109
@source f-a2 title="anthropics/pdf/forms.md · A.2 감지 못 하는 요소" path=anthropics/pdf/forms.md lines=111:118
@source f-a3 title="anthropics/pdf/forms.md · A.3 fields.json 만들기" path=anthropics/pdf/forms.md lines=120:161
@source f-a4 title="anthropics/pdf/forms.md · A.4 상자 검증" path=anthropics/pdf/forms.md lines=163:168
@source f-b title="anthropics/pdf/forms.md · Approach B 시각 추정" path=anthropics/pdf/forms.md lines=172:222
@source f-b4 title="anthropics/pdf/forms.md · B.4 image_width 1700x2200 예" path=anthropics/pdf/forms.md lines=224:245
@source f-hy title="anthropics/pdf/forms.md · Hybrid 좌표 변환" path=anthropics/pdf/forms.md lines=256:266
@source f-s2 title="anthropics/pdf/forms.md · Step 2 채우기 전 검증" path=anthropics/pdf/forms.md lines=270:279
@source f-s3 title="anthropics/pdf/forms.md · Step 3 주석으로 채우기" path=anthropics/pdf/forms.md lines=281:284
@source f-s4 title="anthropics/pdf/forms.md · Step 4 결과 확인" path=anthropics/pdf/forms.md lines=286:294
@source r-in title="anthropics/pdf/reference.md · 16692B · 머리말" path=anthropics/pdf/reference.md lines=1:8
@source r-js title="anthropics/pdf/reference.md · pdf-lib·pdfjs-dist 예" path=anthropics/pdf/reference.md lines=46:263
@source r-cli title="anthropics/pdf/reference.md · poppler·qpdf 고급 명령" path=anthropics/pdf/reference.md lines=265:341
@source r-py title="anthropics/pdf/reference.md · pdfplumber·reportlab 고급" path=anthropics/pdf/reference.md lines=343:424
@source r-wf title="anthropics/pdf/reference.md · 이미지 추출, 배치 처리, 자르기" path=anthropics/pdf/reference.md lines=426:526
@source r-perf title="anthropics/pdf/reference.md · 성능 팁" path=anthropics/pdf/reference.md lines=528:565
@source r-ts title="anthropics/pdf/reference.md · 문제 해결(암호, 손상, OCR)" path=anthropics/pdf/reference.md lines=567:601
@source r-lic title="anthropics/pdf/reference.md · 라이브러리 라이선스" path=anthropics/pdf/reference.md lines=603:612
@source r-pdfium title="anthropics/pdf/reference.md · pypdfium2 예" path=anthropics/pdf/reference.md lines=5:44
@source s-cff title="anthropics/pdf/scripts/check_fillable_fields.py · 268B · fillable 판별" path=anthropics/pdf/scripts/check_fillable_fields.py lines=1:11
@source s-efi title="anthropics/pdf/scripts/extract_form_field_info.py · 4300B · 필드 정보 추출" path=anthropics/pdf/scripts/extract_form_field_info.py lines=19:44
@source s-efi2 title="anthropics/pdf/scripts/extract_form_field_info.py · 위치 없는 필드는 무시" path=anthropics/pdf/scripts/extract_form_field_info.py lines=89:94
@source s-fff title="anthropics/pdf/scripts/fill_fillable_fields.py · 3819B · 값 검증 후 채우기" path=anthropics/pdf/scripts/fill_fillable_fields.py lines=11:52
@source s-efs title="anthropics/pdf/scripts/extract_form_structure.py · 3945B · 구조 추출" path=anthropics/pdf/scripts/extract_form_structure.py lines=20:69
@source s-cbb title="anthropics/pdf/scripts/check_bounding_boxes.py · 2774B · 상자 겹침·높이 검사" path=anthropics/pdf/scripts/check_bounding_boxes.py lines=15:56
@source s-cpi title="anthropics/pdf/scripts/convert_pdf_to_images.py · 1008B · 페이지를 PNG로" path=anthropics/pdf/scripts/convert_pdf_to_images.py lines=9:24
@source s-cvi title="anthropics/pdf/scripts/create_validation_image.py · 1258B · 검증 이미지(문서에서 호출 안 됨)" path=anthropics/pdf/scripts/create_validation_image.py lines=9:26
@source s-ffa title="anthropics/pdf/scripts/fill_pdf_form_with_annotations.py · 3235B · 텍스트 주석 추가" path=anthropics/pdf/scripts/fill_pdf_form_with_annotations.py lines=10:95
@source lic title="anthropics/pdf/LICENSE.txt · 11357B · Apache License 2.0" path=anthropics/pdf/LICENSE.txt lines=1:5

## 이 스킬은 언제 켜지고, 어디까지가 범위인가 {#trigger}

@code source=fm language=yaml

`frontmatter`에 `disable-model-invocation` 같은 호출 제한 필드가 없다.[](source:fm) 그래서 모델이 `description`을 보고 켤지 판단하는 모델 호출형이다. 판정: `description`은 판단용 설명이지, 특정 단어가 있으면 켜지는 사전이 아니다. 아래 따옴표는 원문 표기다.

| 요청 | `description` 원문 표기 | 본문의 레시피 |
| --- | --- | --- |
| 읽기 | "reading or extracting text/tables from PDFs" | pypdf, pdfplumber, `pdftotext`[](source:qr) |
| 합치기·나누기·회전 | "combining or merging", "splitting", "rotating pages" | pypdf, `qpdf`, `pdftk`(if available)[](source:cli) |
| 만들기 | "creating new PDFs" | reportlab, `pdf-lib`[](source:qr)[](source:r-js) |
| 워터마크 | "adding watermarks" | pypdf `merge_page`[](source:wm) |
| 양식 | "filling PDF forms" | `forms.md`로 넘긴다[](source:ov) |
| 암호 | "encrypting/decrypting PDFs" | pypdf `encrypt`, `qpdf --decrypt`[](source:enc)[](source:cli) |
| 이미지·OCR | "extracting images", "OCR on scanned PDFs to make them searchable" | `pdfimages`, pytesseract[](source:img)[](source:ocr) |

- 끝 문장은 "If the user mentions a .pdf file or asks to produce one, use this skill."이다. 쓰면 안 되는 경우를 못 박은 문장은 원문에 명시 없음.[](source:fm)
- 판정: description은 OCR을 "searchable하게 만든다"고 하지만 본문 OCR 예는 이미지에서 글자를 뽑아 `print`할 뿐 검색 가능한 PDF를 쓰지 않는다.[](source:fm)[](source:ocr)
- 활성화 제한: 없음. 사람이 끼어드는 곳: 원문에 명시 없음.

## 작업은 어디를 읽고 어떤 도구로 가나 {#routing}

`SKILL.md`는 간단한 작업을 직접 풀고, 두 곳으로 길을 안내한다. 양식 채우기는 `forms.md`로 **넘기고**(r09), 나머지 고급 기능은 `reference.md`를 **참고**하라고 한다(r08).[](source:ov)[](source:nx)

| 작업 | `SKILL.md`의 도구 | 더 가는 곳 |
| --- | --- | --- |
| 합치기, 나누기 | pypdf, 명령줄은 `qpdf --empty --pages ...`[](source:qr) | `reference.md`: 페이지 범위 `1,3-5,8,10-end`, `--split-pages=3`[](source:r-cli) |
| 텍스트·표 추출 | pdfplumber `extract_text()`, `extract_tables()`[](source:qr) | `reference.md`: 좌표 포함 추출, 표 설정[](source:r-py) |
| PDF 만들기 | reportlab Canvas 또는 Platypus[](source:qr) | `reference.md`: 표 스타일, `pdf-lib`[](source:r-py)[](source:r-js) |
| 스캔본 OCR | pytesseract, 먼저 이미지로 변환[](source:qr) | `reference.md`: 같은 방식의 OCR 함수[](source:r-ts) |
| 양식 채우기 | `pdf-lib` 또는 pypdf (`FORMS.md` 참조)[](source:qr) | `forms.md`(아래 패널)[](source:nx) |
| 고급 pypdfium2, JavaScript, 문제 해결 | - | `reference.md`[](source:nx) |

@callout level=warning title="안내한 파일 이름과 실제 이름이 다르다"
`SKILL.md`는 `REFERENCE.md`, `FORMS.md`(대문자)를 읽으라고 하지만 실제 파일은 `reference.md`, `forms.md`(소문자)다.[](source:ov)[](source:nx)[](source:f-crit)[](source:r-in) 판정: 대소문자를 구분하는 파일시스템에서는 지시한 이름으로 열리지 않는다. 지시상 대상은 이 두 파일로 읽는 것이 자연스럽다(관계 원장의 해석과 같다).


- 판정: 도구 선택 우선순위는 한 곳에 모여 있지 않다. Quick Start는 pypdf `extract_text()`를 쓰고, 표는 같은 일에 pdfplumber를 "Best Tool"로 적는다. 어느 쪽을 먼저 쓰라는 문장은 원문에 명시 없음.[](source:qs)[](source:qr)
- `pdf`에서 뽑은 표를 `to_excel("extracted_tables.xlsx")`로 저장하는 pandas 예가 있지만, `xlsx` 스킬을 부르라는 문장은 원문에 명시 없음(관계 원장 r07, 미확인).[](source:xl)

## 양식은 어떤 순서로 채우나 {#forms}

`forms.md`는 첫 줄에서 순서를 지키라고 못 박는다. 먼저 필드가 있는지 판별하고, 결과에 따라 두 갈래 중 하나만 따른다. 갈래마다 쓰는 스크립트와 만드는 파일이 다르다.[](source:f-crit)

@workflow id=form-flow title="PDF 양식 채우기 분기"
| lane judge | 판별 |
| lane field | fillable 경로 |
| lane annot | 주석 경로 |
| lane check | 확인 |
| start | forms.md로 넘어옴 | external | judge |
| chk | 입력 필드가 있나? | backend | judge |
| info | 필드 정보 추출 | backend | field |
| vals | 값 JSON 작성 | backend | field |
| fillf | 필드에 채우기 | backend | field |
| struct | 구조 추출 | backend | annot |
| lab | 라벨이 있나? | backend | annot |
| ca | A 구조 좌표 | backend | annot |
| cb | B 시각 추정 | backend | annot |
| bbox | 상자 검사 | backend | annot |
| fillA | 주석으로 채우기 | backend | annot |
| verify | 이미지로 확인 | backend | check |
| start > chk | |
| chk > info | yes | emphasis |
| info > vals | |
| vals > fillf | |
| fillf > vals | 오류 시 수정 | dashed |
| chk > struct | no |
| struct > lab | |
| lab > ca | yes | emphasis |
| lab > cb | no |
| ca > bbox | |
| cb > bbox | |
| bbox > fillA | |
| fillA > verify | |

@steps id=form-steps
| start | forms.md로 넘어옴 | `SKILL.md`의 "If you need to fill out a PDF form, read FORMS.md and follow its instructions"에서 넘어온다. `forms.md`는 "단계를 순서대로 끝내라, 코드부터 쓰지 마라"로 시작한다. | form-flow | start |
| chk | 입력 필드가 있나? | `scripts/check_fillable_fields`를 돌려 갈래를 정한다. 스크립트는 `reader.get_fields()`가 비어 있지 않으면 "has fillable form fields"를 출력한다. | form-flow | chk |
| info | 필드 정보 추출 | `extract_form_field_info.py`가 field_id, page, rect, type(text, checkbox, radio_group, choice)을 JSON으로 쓴다. 위치를 못 찾은 필드는 무시한다. | form-flow | info |
| vals | 값 JSON 작성 | PDF를 PNG로 바꿔 필드 용도를 눈으로 파악하고, `field_values.json`에 field_id, description, page, value를 쓴다. 체크박스는 `checked_value`, 라디오는 `radio_options`의 value를 쓴다. | form-flow | vals |
| fillf | 필드에 채우기 | `fill_fillable_fields.py`가 필드 ID와 값을 검증한다. 오류를 출력하면 해당 필드를 고쳐 다시 돌린다. | form-flow | fillf |
| struct | 구조 추출 | `extract_form_structure.py`가 라벨 단어, 가로선, 정사각형 체크박스, 행 경계를 좌표와 함께 JSON으로 쓴다. | form-flow | struct |
| lab | 라벨이 있나? | `form_structure.json`에 필드에 해당하는 라벨이 있으면 A, 스캔본이라 라벨이 거의 없으면 B를 쓴다. | form-flow | lab |
| ca | A 구조 좌표 | 라벨 x1에 5를 더해 입력 칸 x0을 잡는 식으로 `fields.json`을 `pdf_width`/`pdf_height` 기준으로 만든다. 이쪽이 "Preferred"다. | form-flow | ca |
| cb | B 시각 추정 | 대략 좌표를 잡고 ImageMagick으로 잘라 확대해 다듬은 뒤 `image_width`/`image_height` 기준으로 `fields.json`을 만든다. | form-flow | cb |
| bbox | 상자 검사 | `check_bounding_boxes.py`가 상자 겹침과 글자 크기보다 낮은 입력 칸을 찾는다. 오류는 채우기 전에 고친다. | form-flow | bbox |
| fillA | 주석으로 채우기 | `fill_pdf_form_with_annotations.py`가 좌표계를 자동 판별해 텍스트 주석(FreeText)을 얹는다. | form-flow | fillA |
| verify | 이미지로 확인 | 채운 PDF를 다시 PNG로 바꿔 글자 위치를 눈으로 확인한다. 어긋나면 갈래별로 좌표 기준을 점검한다. | form-flow | verify |

- 라벨은 있지만 일부 요소(원형 체크박스, 장식 도형, 옅은 색 요소)를 구조 추출이 놓치면 Hybrid로 간다. 감지된 필드는 A, 놓친 필드는 B로 구하고 `pdf_width`/`pdf_height` 하나로 환산해 합친다. 그림에서는 뺐다.[](source:f-a2)[](source:f-hy)
- fillable 경로에는 채운 뒤 확인 단계가 원문에 명시 없음. Step 2~4는 Non-fillable 절 아래에 있다.[](source:f-run)[](source:f-s4)

| 파일 | 만드는 스크립트 | 다음에 쓰는 곳 |
| --- | --- | --- |
| `field_info.json` | `extract_form_field_info.py`[](source:f-info) | 값 JSON을 쓸 때 field_id, page, 선택지를 맞춘다 |
| `field_values.json` | 에이전트가 작성[](source:f-val) | `fill_fillable_fields.py`의 입력 |
| 채운 PDF | `fill_fillable_fields.py`는 필드 값을 쓰고 `NeedAppearances`를 켠다[](source:s-fff) | 최종 결과 |
| `form_structure.json` | `extract_form_structure.py`[](source:f-nf) | A 갈래에서 좌표를 계산하는 근거 |
| `fields.json` | 에이전트가 작성[](source:f-a3)[](source:f-b4) | `check_bounding_boxes.py`와 `fill_pdf_form_with_annotations.py`의 입력 |
| `page_N.png` | `convert_pdf_to_images.py`[](source:s-cpi) | 필드 파악, 확대 자르기, 결과 확인 |
| 채운 PDF(주석) | `fill_pdf_form_with_annotations.py`는 텍스트 주석을 얹는다[](source:s-ffa) | 최종 결과 |

## 무엇을 강제하고 금지하며, 수치는 얼마인가 {#rules}

| 규칙 | 내용 | 종류 | 출처 |
| --- | --- | --- | --- |
| 첨자 금지 | ReportLab PDF에 유니코드 첨자·위첨자 문자(₀–₉, ⁰–⁹)를 쓰지 않는다. 내장 폰트에 글리프가 없어 검은 상자로 나온다. 대신 `<sub>`, `<super>` 태그를 쓴다. 캔버스에 직접 그릴 때는 글꼴 크기와 위치를 손으로 조정한다 | 금지(IMPORTANT, Never) | [](source:sub) |
| 순서 준수 | 양식을 채우려면 단계를 순서대로 끝낸다. 코드 작성으로 건너뛰지 않는다 | 의무(CRITICAL, MUST) | [](source:f-crit) |
| 갈래 선택 | 판별 결과에 따라 "Fillable fields" 또는 "Non-fillable fields" 중 하나를 따른다 | 의무 | [](source:f-crit) |
| 구조 우선 | Non-fillable에서는 구조 추출을 먼저 시도하고, 쓸 만한 라벨이 없을 때만 시각 추정으로 내려간다 | 의무(Try First, Fallback) | [](source:f-nf) |
| 확대 정제 | Approach B에서 필드마다 잘라 확대해 좌표를 다듬는다 | 의무(CRITICAL) | [](source:f-b) |
| 단일 좌표계 | Hybrid에서는 `fields.json` 하나에 PDF 좌표계 하나만 쓴다. 이미지 좌표는 PDF 좌표로 환산한다 | 의무 | [](source:f-hy) |
| 채우기 전 검증 | 채우기 전에 `check_bounding_boxes.py`를 돌리고 오류를 고친다 | 의무(Always) | [](source:f-s2) |
| 값 검증 | `fill_fillable_fields.py`는 잘못된 field_id, 틀린 page, 선택지에 없는 값이 있으면 `ERROR`를 출력하고 종료 코드 1로 끝난다 | 스크립트 동작 | [](source:s-fff) |
| 라이브러리 선택 | 양식 채우기에서는 `pdf-lib`가 "most alternatives"보다 양식 구조(form structure)를 잘 유지한다 | 권고 | [](source:r-perf) |
| 성능 팁 | 큰 PDF는 스트리밍과 `qpdf --split-pages`, 텍스트는 `pdftotext -bbox-layout`이 가장 빠르다, 이미지 추출은 `pdfimages` | 권고 | [](source:r-perf) |

@facts id=pdf-numbers
| 변환 해상도 | `convert_pdf_to_images.py`는 dpi=200으로 렌더하고, 가로·세로 중 큰 쪽이 1000을 넘으면 1000 이하로 줄인다[](source:s-cpi) |
| 입력 칸 간격 | A 갈래에서 입력 칸 x0은 라벨 x1에 5를 더한 값이다(절차 지시)[](source:f-a3) |
| 체크박스 감지 | 정사각형 중 변이 5~15이고 가로세로 차가 2 미만인 것만 체크박스로 본다[](source:s-efs) |
| 행 경계 선 | 가로선 길이가 페이지 폭의 50%를 넘는 것만 행 경계로 쓴다[](source:s-efs) |
| 기본 글꼴 | 주석 채우기 기본값은 Arial, 14pt, 색 `000000`이다. 입력 칸 높이가 글꼴 크기보다 낮으면 오류다[](source:s-ffa)[](source:s-cbb) |
| 오류 출력 상한 | `check_bounding_boxes.py`는 메시지가 20개에 이르면 검사를 멈추고 고친 뒤 다시 하라고 한다[](source:s-cbb) |
| 확대 여백 | 자르기 영역은 필드 주변 약 50px 여백이다(권고)[](source:f-b) |

## 어디까지 확인했고, 원문끼리 어긋난 곳은 어디인가 {#audit}

@facts id=audit-counts
| 읽은 텍스트 파일 | 12개 전부 읽음: `SKILL.md`, `forms.md`, `reference.md`, `LICENSE.txt`, `scripts/*.py` 8개 |
| 구조·표본만 읽은 파일 | 0개 |
| 바이너리·제외 파일 | 없음. 번역본도 없음 |
| 합계 | 텍스트 12개, 68568B. 30개를 넘지 않아 `files.md`는 만들지 않았다 |
| 실행 | 스크립트를 한 번도 돌리지 않았다. 아래 동작은 코드와 문서를 읽은 지시상 동작이다 |

원문끼리 어긋나거나 확인할 수 없었던 곳이다.

| 항목 | 내용 | 판정 |
| --- | --- | --- |
| 스크립트 이름 | `forms.md`는 `python scripts/check_fillable_fields <file.pdf>`라고 쓰지만 파일은 `check_fillable_fields.py`다.[](source:f-crit)[](source:s-cff) | 확장자를 붙여야 실행된다. 에이전트가 보정하는지는 확인하지 못했다 |
| 좌표 설명 | 필드 정보 JSON은 "PDF coordinates, y=0 is the bottom"이라 하고, A.1은 "PDF coordinates where y=0 is at TOP"이라 한다.[](source:f-info)[](source:f-a1) | 두 서술이 충돌한다. 우선순위는 원문에 명시 없음. 주석 스크립트는 `pdf_width`가 있으면 위쪽 기준 좌표를 아래쪽 기준으로 뒤집는다[](source:s-ffa) |
| 이미지 크기 예 | B.4 예시는 `image_width` 1700, `image_height` 2200이다.[](source:f-b4) 변환 스크립트는 긴 변이 1000을 넘으면 줄인다.[](source:s-cpi) | 판정: Letter 크기를 dpi=200으로 변환하면 1700x2200이고, 줄이면 약 772x1000이다. 스크립트 출력 이미지의 실제 크기를 쓰라는 문장은 원문에 명시 없음 |
| 라이브러리 | `SKILL.md`는 양식에 "pdf-lib or pypdf"를 적고, `reference.md`는 `pdf-lib`를 권한다.[](source:qr)[](source:r-perf) 그러나 `forms.md`의 두 갈래 스크립트는 모두 pypdf다.[](source:s-fff)[](source:s-ffa) | `forms.md`가 `pdf-lib`를 쓰는 길을 안내하지 않는다 |
| 검증 이미지 | `create_validation_image.py`는 입력 칸을 빨강, 라벨을 파랑 상자로 그린다.[](source:s-cvi) | 두 `.md`와 `SKILL.md`에서 이 스크립트를 부르지 않는다. 쓰라는 지시 없는 보조 도구다 |
| 감지 한계 | 구조 추출은 정사각형만 체크박스로 보고 원형은 놓친다.[](source:f-a2)[](source:s-efs) | 놓친 요소는 Hybrid로 처리하라고 한다 |

@callout level=open-question title="확인하지 못한 것"
스크립트를 실행하지 않았고 샘플 PDF로 결과를 만들어 보지 않았다. 채운 PDF가 뷰어마다 같게 보이는지, `NeedAppearances`와 `auto_regenerate=False` 조합의 실제 렌더링은 확인하지 못했다.[](source:s-fff) 라이브러리 버전과 설치 조건은 `SKILL.md`에 `pip install pytesseract pdf2image`만 한 번 나오고(예시), 나머지는 원문에 명시 없음.[](source:ocr) 라이선스는 `LICENSE.txt`가 Apache License 2.0이고, `reference.md`는 라이브러리별 라이선스를 나열하며 poppler-utils를 GPL-2로 적는다.[](source:lic)[](source:r-lic)
