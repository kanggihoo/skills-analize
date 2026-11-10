**CRITICAL: 아래 단계를 순서대로 반드시 따르세요. 코드 작성으로 건너뛰지 마세요.**

PDF 양식을 채워야 한다면, 먼저 그 PDF에 작성 가능한 양식 필드(fillable form fields)가 있는지 확인하세요. 이 파일이 있는 디렉터리에서 다음 스크립트를 실행하고, 결과에 따라 "Fillable fields" 또는 "Non-fillable fields" 섹션으로 가서 그 지침을 따르세요.
 `python scripts/check_fillable_fields <file.pdf>`

# Fillable fields
PDF에 작성 가능한 양식 필드가 있다면 다음을 따르세요.
- 이 파일이 있는 디렉터리에서 `python scripts/extract_form_field_info.py <input.pdf> <field_info.json>`을 실행하세요. 아래 형식으로 필드 목록이 담긴 JSON 파일이 만들어집니다.
```
[
  {
    "field_id": (필드의 고유 ID),
    "page": (페이지 번호, 1부터 시작),
    "rect": ([left, bottom, right, top] 형식의 경계 상자, PDF 좌표 기준이며 y=0은 페이지 하단),
    "type": ("text", "checkbox", "radio_group", "choice" 중 하나),
  },
  // 체크박스에는 "checked_value"와 "unchecked_value" 속성이 있습니다:
  {
    "field_id": (필드의 고유 ID),
    "page": (페이지 번호, 1부터 시작),
    "type": "checkbox",
    "checked_value": (체크박스를 체크하려면 필드에 이 값을 설정),
    "unchecked_value": (체크박스를 해제하려면 필드에 이 값을 설정),
  },
  // 라디오 그룹에는 가능한 선택지를 담은 "radio_options" 목록이 있습니다.
  {
    "field_id": (필드의 고유 ID),
    "page": (페이지 번호, 1부터 시작),
    "type": "radio_group",
    "radio_options": [
      {
        "value": (이 라디오 옵션을 선택하려면 필드에 이 값을 설정),
        "rect": (이 옵션 라디오 버튼의 경계 상자)
      },
      // 다른 라디오 옵션
    ]
  },
  // 객관식 필드에는 가능한 선택지를 담은 "choice_options" 목록이 있습니다:
  {
    "field_id": (필드의 고유 ID),
    "page": (페이지 번호, 1부터 시작),
    "type": "choice",
    "choice_options": [
      {
        "value": (이 옵션을 선택하려면 필드에 이 값을 설정),
        "text": (옵션에 표시되는 텍스트)
      },
      // 다른 선택 옵션
    ],
  }
]
```
- 이 스크립트로 PDF를 페이지마다 하나씩 PNG 이미지로 변환하세요(이 파일이 있는 디렉터리에서 실행).
`python scripts/convert_pdf_to_images.py <file.pdf> <output_directory>`
  그다음 이미지를 분석해 각 양식 필드의 용도를 파악하세요. 이때 경계 상자의 PDF 좌표를 이미지 좌표로 반드시 변환하세요.
- 각 필드에 입력할 값을 아래 형식의 `field_values.json` 파일로 만드세요.
```
[
  {
    "field_id": "last_name", // extract_form_field_info.py에서 나온 field_id와 일치해야 함
    "description": "The user's last name",
    "page": 1, // field_info.json의 "page" 값과 일치해야 함
    "value": "Simpson"
  },
  {
    "field_id": "Checkbox12",
    "description": "사용자가 18세 이상이면 체크할 체크박스",
    "page": 1,
    "value": "/On" // 체크박스라면 그 "checked_value"로 체크합니다. 라디오 버튼 그룹이라면 "radio_options"의 "value" 중 하나를 씁니다.
  },
  // 필드 추가
]
```
- 이 파일이 있는 디렉터리에서 `fill_fillable_fields.py` 스크립트를 실행해 값이 채워진 PDF를 만드세요.
`python scripts/fill_fillable_fields.py <input pdf> <field_values.json> <output pdf>`
  이 스크립트는 입력한 field ID와 값이 유효한지 검증합니다. 오류 메시지가 나오면 해당 필드를 고쳐서 다시 실행하세요.

# Non-fillable fields
PDF에 작성 가능한 양식 필드가 없다면 텍스트 주석(text annotations)을 추가합니다. 먼저 PDF 구조에서 좌표를 추출하고(더 정확함), 필요할 때만 눈으로 보고 좌표를 추정하세요.

## Step 1: 먼저 구조에서 추출 시도

이 스크립트를 실행해 텍스트 라벨, 선, 체크박스를 정확한 PDF 좌표와 함께 추출하세요.
`python scripts/extract_form_structure.py <input.pdf> form_structure.json`

그러면 다음 내용이 담긴 JSON 파일이 만들어집니다.
- **labels**: 모든 텍스트 요소와 정확한 좌표(x0, top, x1, bottom, PDF 포인트 단위)
- **lines**: 행의 경계를 정하는 수평선
- **checkboxes**: 체크박스로 보이는 작은 정사각형 사각형(중심 좌표 포함)
- **row_boundaries**: 수평선으로 계산한 각 행의 상단·하단 위치

**결과를 확인하세요**: `form_structure.json`에 양식 필드에 해당하는 의미 있는 라벨이 있으면 **Approach A: 구조 기반 좌표**를 쓰세요. PDF가 스캔본이나 이미지 기반이라 라벨이 거의 없으면 **Approach B: 시각적 추정**을 쓰세요.

---

## Approach A: 구조 기반 좌표 (우선 권장)

`extract_form_structure.py`가 PDF에서 텍스트 라벨을 찾았을 때 이 방법을 쓰세요.

### A.1: 구조 분석

form_structure.json을 읽고 다음을 찾으세요.

1. **라벨 그룹**: 하나의 라벨을 이루는 인접한 텍스트 요소(예: "Last" + "Name")
2. **행 구조**: `top` 값이 비슷한 라벨은 같은 행에 있습니다.
3. **필드 열**: 입력 영역은 라벨이 끝난 지점 이후에서 시작합니다(x0 = label.x1 + 간격).
4. **체크박스**: 구조 데이터의 체크박스 좌표를 그대로 사용하세요.

**좌표계**: PDF 좌표계에서 y=0은 페이지 상단이고, y 값은 아래로 갈수록 커집니다.

### A.2: 누락된 요소 확인

구조 추출이 모든 양식 요소를 찾지는 못합니다. 흔한 경우는 다음과 같습니다.
- **원형 체크박스**: 구조 추출은 정사각형 사각형만 체크박스로 인식합니다.
- **복잡한 그래픽**: 장식 요소나 표준이 아닌 양식 컨트롤
- **흐리거나 연한 색의 요소**: 추출되지 않을 수 있습니다.

PDF 이미지에는 보이지만 form_structure.json에 없는 필드가 있다면, 그 필드만 **시각적 분석**으로 처리하세요(아래 "Hybrid Approach" 참고).

### A.3: PDF 좌표로 fields.json 만들기

각 필드의 입력 좌표를 추출한 구조 데이터에서 계산하세요.

**텍스트 필드:**
- 입력 영역 x0 = 라벨 x1 + 5(라벨 뒤 약간의 간격)
- 입력 영역 x1 = 다음 라벨의 x0 또는 행 경계
- 입력 영역 top = 라벨 top과 동일
- 입력 영역 bottom = 아래쪽 행 경계선, 또는 라벨 bottom + row_height

**체크박스:**
- form_structure.json의 체크박스 사각형 좌표를 그대로 사용하세요.
- entry_bounding_box = [checkbox.x0, checkbox.top, checkbox.x1, checkbox.bottom]

`pdf_width`와 `pdf_height`를 써서 fields.json을 만드세요(PDF 좌표임을 나타냄).
```json
{
  "pages": [
    {"page_number": 1, "pdf_width": 612, "pdf_height": 792}
  ],
  "form_fields": [
    {
      "page_number": 1,
      "description": "Last name entry field",
      "field_label": "Last Name",
      "label_bounding_box": [43, 63, 87, 73],
      "entry_bounding_box": [92, 63, 260, 79],
      "entry_text": {"text": "Smith", "font_size": 10}
    },
    {
      "page_number": 1,
      "description": "US Citizen Yes checkbox",
      "field_label": "Yes",
      "label_bounding_box": [260, 200, 280, 210],
      "entry_bounding_box": [285, 197, 292, 205],
      "entry_text": {"text": "X"}
    }
  ]
}
```

**중요**: `pdf_width`/`pdf_height`와 form_structure.json의 좌표를 그대로 사용하세요.

### A.4: 경계 상자 검증

채우기 전에 경계 상자 오류가 없는지 확인하세요.
`python scripts/check_bounding_boxes.py fields.json`

이 스크립트는 서로 겹치는 경계 상자와 글꼴 크기에 비해 너무 작은 입력 상자를 확인합니다. 보고된 오류는 채우기 전에 모두 고치세요.

---

## Approach B: 시각적 추정 (대안)

PDF가 스캔본이나 이미지 기반이라 구조 추출로 쓸 만한 텍스트 라벨을 찾지 못했을 때 쓰세요(예: 모든 텍스트가 "(cid:X)" 패턴으로 나오는 경우).

### B.1: PDF를 이미지로 변환

`python scripts/convert_pdf_to_images.py <input.pdf> <images_dir/>`

### B.2: 초기 필드 식별

각 페이지 이미지를 살펴보고 양식 섹션을 파악한 뒤, 필드 위치의 **대략적인 추정치**를 구하세요.
- 양식 필드 라벨과 대략적인 위치
- 입력 영역(선, 상자, 또는 텍스트를 입력할 빈 공간)
- 체크박스와 대략적인 위치

각 필드의 대략적인 픽셀 좌표를 적어 두세요. 아직 정밀할 필요는 없습니다.

### B.3: 확대 보정 (정확도에 매우 중요)

각 필드마다 추정 위치 주변을 잘라 내 좌표를 정밀하게 다듬으세요.

**ImageMagick으로 확대 자르기 이미지를 만드세요:**
```bash
magick <page_image> -crop <width>x<height>+<x>+<y> +repage <crop_output.png>
```

여기서
- `<x>, <y>` = 자르기 영역의 왼쪽 위 모서리(대략적인 추정 좌표에서 여백을 뺀 값)
- `<width>, <height>` = 자르기 영역의 크기(필드 영역에 좌우 각각 약 50px 여백을 더한 값)

**예시:** 약 (100, 150) 부근으로 추정한 "Name" 필드를 보정하려면:
```bash
magick images_dir/page_1.png -crop 300x80+50+120 +repage crops/name_field.png
```

(참고: `magick` 명령이 없으면 같은 인자로 `convert`를 써 보세요.)

**자른 이미지를 살펴보고** 정밀한 좌표를 찾으세요.
1. 입력 영역이 시작되는 정확한 픽셀(라벨 뒤)을 찾습니다.
2. 입력 영역이 끝나는 지점(다음 필드 또는 가장자리 앞)을 찾습니다.
3. 입력 선이나 상자의 위쪽과 아래쪽을 찾습니다.

**잘라낸 이미지의 좌표를 전체 이미지 좌표로 변환하세요:**
- full_x = crop_x + crop_offset_x
- full_y = crop_y + crop_offset_y

예: 자르기가 (50, 120)에서 시작했고 입력 상자가 잘라낸 이미지 안에서 (52, 18)에서 시작한다면:
- entry_x0 = 52 + 50 = 102
- entry_top = 18 + 120 = 138

**필드마다 반복하세요.** 가까운 필드들은 가능하면 한 번의 자르기로 묶어서 처리하세요.

### B.4: 보정된 좌표로 fields.json 만들기

`image_width`와 `image_height`를 써서 fields.json을 만드세요(이미지 좌표임을 나타냄).
```json
{
  "pages": [
    {"page_number": 1, "image_width": 1700, "image_height": 2200}
  ],
  "form_fields": [
    {
      "page_number": 1,
      "description": "Last name entry field",
      "field_label": "Last Name",
      "label_bounding_box": [120, 175, 242, 198],
      "entry_bounding_box": [255, 175, 720, 218],
      "entry_text": {"text": "Smith", "font_size": 10}
    }
  ]
}
```

**중요**: `image_width`/`image_height`와 확대 분석으로 보정한 픽셀 좌표를 사용하세요.

### B.5: 경계 상자 검증

채우기 전에 경계 상자 오류가 없는지 확인하세요.
`python scripts/check_bounding_boxes.py fields.json`

이 스크립트는 서로 겹치는 경계 상자와 글꼴 크기에 비해 너무 작은 입력 상자를 확인합니다. 보고된 오류는 채우기 전에 모두 고치세요.

---

## Hybrid Approach: 구조 + 시각

구조 추출이 대부분의 필드에서는 잘 작동하지만 일부 요소(예: 원형 체크박스, 특이한 양식 컨트롤)를 놓칠 때 쓰세요.

1. 구조 추출로 form_structure.json에서 찾은 필드에는 **Approach A**를 쓰세요.
2. 누락된 필드를 시각적으로 분석하려고 **PDF를 이미지로 변환**하세요.
3. 누락된 필드에는 (Approach B의) **확대 보정**을 쓰세요.
4. **좌표 합치기**: 구조 추출로 얻은 필드는 `pdf_width`/`pdf_height`를 쓰고, 시각적으로 추정한 필드는 이미지 좌표를 PDF 좌표로 변환해야 합니다.
   - pdf_x = image_x * (pdf_width / image_width)
   - pdf_y = image_y * (pdf_height / image_height)
5. fields.json에서는 **하나의 좌표계만 사용하세요.** 모든 값을 `pdf_width`/`pdf_height`를 쓰는 PDF 좌표로 변환하세요.

---

## Step 2: 채우기 전 검증

**채우기 전에 항상 경계 상자를 검증하세요:**
`python scripts/check_bounding_boxes.py fields.json`

이 스크립트는 다음을 확인합니다.
- 서로 겹치는 경계 상자(글자가 겹쳐 보이는 원인)
- 지정한 글꼴 크기에 비해 너무 작은 입력 상자

보고된 오류는 다음 단계로 넘어가기 전에 fields.json에서 모두 고치세요.

## Step 3: 양식 채우기

채우기 스크립트가 좌표계를 자동으로 감지하고 변환까지 처리합니다.
`python scripts/fill_pdf_form_with_annotations.py <input.pdf> fields.json <output.pdf>`

## Step 4: 결과 확인

채워진 PDF를 이미지로 변환해서 텍스트 위치를 확인하세요.
`python scripts/convert_pdf_to_images.py <output.pdf> <verify_images/>`

텍스트 위치가 어긋났다면 다음을 점검하세요.
- **Approach A**: form_structure.json의 PDF 좌표를 `pdf_width`/`pdf_height`와 함께 쓰고 있는지 확인하세요.
- **Approach B**: 이미지 크기가 맞는지, 좌표가 정확한 픽셀인지 확인하세요.
- **Hybrid**: 시각적으로 추정한 필드의 좌표 변환이 맞는지 확인하세요.
