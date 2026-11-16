**중요: 아래 단계를 순서대로 완료해야 합니다. 코드 작성으로 건너뛰지 마세요.**

PDF 양식을 채워야 한다면, 먼저 PDF에 채울 수 있는 양식 필드(fillable form fields)가 있는지 확인합니다. 이 파일이 있는 디렉터리에서 다음 스크립트를 실행합니다.
 `python scripts/check_fillable_fields <file.pdf>`. 결과에 따라 "Fillable fields" 또는 "Non-fillable fields" 섹션으로 가서 그 안의 지침을 따릅니다.

# Fillable fields
PDF에 채울 수 있는 양식 필드가 있다면 다음을 따릅니다.
- 이 파일이 있는 디렉터리에서 `python scripts/extract_form_field_info.py <input.pdf> <field_info.json>`을 실행합니다. 그러면 아래 형식의 필드 목록이 담긴 JSON 파일이 만들어집니다.
```
[
  {
    "field_id": (필드의 고유 ID),
    "page": (페이지 번호, 1부터 시작),
    "rect": ([left, bottom, right, top] 형식의 경계 상자, PDF 좌표계 기준이며 y=0이 페이지 맨 아래),
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
        "value": (이 라디오 옵션을 선택하려면 필드에 설정할 값),
        "rect": (이 옵션의 라디오 버튼 경계 상자)
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
        "value": (이 옵션을 선택하려면 필드에 설정할 값),
        "text": (옵션의 화면 표시 텍스트)
      },
      // 다른 선택 옵션
    ],
  }
]
```
- 다음 스크립트로 PDF를 페이지마다 한 장씩 PNG로 변환합니다(이 파일이 있는 디렉터리에서 실행).
`python scripts/convert_pdf_to_images.py <file.pdf> <output_directory>`
그다음 이미지를 분석해서 각 양식 필드의 용도를 파악합니다. 이때 경계 상자의 PDF 좌표를 이미지 좌표로 변환해야 합니다.
- 각 필드에 입력할 값을 담은 `field_values.json` 파일을 아래 형식으로 만듭니다.
```
[
  {
    "field_id": "last_name", // `extract_form_field_info.py`가 출력한 field_id와 일치해야 함
    "description": "사용자의 성(last name)",
    "page": 1, // field_info.json의 "page" 값과 일치해야 함
    "value": "Simpson"
  },
  {
    "field_id": "Checkbox12",
    "description": "사용자가 18세 이상이면 체크할 체크박스",
    "page": 1,
    "value": "/On" // 체크박스라면 "checked_value" 값으로 체크합니다. 라디오 버튼 그룹이라면 "radio_options"의 "value" 중 하나를 씁니다.
  },
  // 필드 추가
]
```
- 이 파일이 있는 디렉터리에서 `fill_fillable_fields.py`를 실행해 값이 채워진 PDF를 만듭니다.
`python scripts/fill_fillable_fields.py <input pdf> <field_values.json> <output pdf>`
이 스크립트는 입력한 field ID와 값이 유효한지 검증합니다. 오류 메시지가 출력되면 해당 필드를 고치고 다시 실행합니다.

# Non-fillable fields
PDF에 채울 수 있는 양식 필드가 없다면 텍스트 주석(text annotation)을 추가합니다. 먼저 PDF 구조에서 좌표를 추출하고(더 정확함), 그것이 어려우면 눈으로 보고 추정하는 방식으로 넘어갑니다.

## Step 1: 구조 추출을 먼저 시도
다음 스크립트를 실행해서 텍스트 라벨, 선, 체크박스를 정확한 PDF 좌표와 함께 추출합니다.
`python scripts/extract_form_structure.py <input.pdf> form_structure.json`

이 명령은 다음 내용을 담은 JSON 파일을 만듭니다.
- **labels**: 모든 텍스트 요소와 정확한 좌표 (x0, top, x1, bottom, PDF 포인트 단위)
- **lines**: 행 경계를 정하는 수평선
- **checkboxes**: 체크박스인 작은 정사각형 사각형 (중심 좌표 포함)
- **row_boundaries**: 수평선으로 계산한 각 행의 top/bottom 위치

**결과 확인**: `form_structure.json`에 양식 필드에 해당하는 의미 있는 라벨(텍스트 요소)이 있으면 **Approach A: 구조 기반 좌표**를 사용합니다. PDF가 스캔본이거나 이미지 기반이라 라벨이 거의 없으면 **Approach B: 시각적 추정**을 사용합니다.

---

## Approach A: 구조 기반 좌표 (우선 권장)

`extract_form_structure.py`가 PDF에서 텍스트 라벨을 찾았을 때 사용합니다.

### A.1: 구조 분석

form_structure.json을 읽고 다음을 파악합니다.

1. **라벨 그룹**: 하나의 라벨을 이루는 인접 텍스트 요소 (예: "Last" + "Name")
2. **행 구조**: `top` 값이 비슷한 라벨은 같은 행에 있습니다.
3. **입력 칸 열**: 입력 영역은 라벨이 끝난 뒤에서 시작합니다 (x0 = label.x1 + 간격).
4. **체크박스**: 구조 파일의 체크박스 좌표를 그대로 씁니다.

**좌표계**: PDF 좌표계에서 y=0은 페이지 맨 위이고, y는 아래로 갈수록 증가합니다.

### A.2: 빠진 요소 확인

구조 추출이 모든 양식 요소를 찾지는 못할 수 있습니다. 흔한 경우는 다음과 같습니다.
- **원형 체크박스**: 정사각형 사각형만 체크박스로 인식됩니다.
- **복잡한 그래픽**: 장식 요소나 표준이 아닌 양식 컨트롤
- **흐리거나 옅은 색 요소**: 추출되지 않을 수 있습니다.

PDF 이미지에는 보이는데 form_structure.json에 없는 필드가 있다면, 그 필드에 한해서 **시각적 분석**이 필요합니다(아래 "Hybrid Approach" 참고).

### A.3: PDF 좌표로 fields.json 만들기

필드마다 추출한 구조에서 입력 칸 좌표를 계산합니다.

**텍스트 필드:**
- 입력 칸 x0 = 라벨 x1 + 5 (라벨 뒤의 작은 간격)
- 입력 칸 x1 = 다음 라벨의 x0, 또는 행 경계
- 입력 칸 top = 라벨 top과 같음
- 입력 칸 bottom = 아래쪽 행 경계선, 또는 라벨 bottom + row_height

**체크박스:**
- form_structure.json의 체크박스 사각형 좌표를 그대로 씁니다.
- entry_bounding_box = [checkbox.x0, checkbox.top, checkbox.x1, checkbox.bottom]

PDF 좌표를 나타내는 `pdf_width`와 `pdf_height`를 써서 fields.json을 만듭니다.
```json
{
  "pages": [
    {"page_number": 1, "pdf_width": 612, "pdf_height": 792}
  ],
  "form_fields": [
    {
      "page_number": 1,
      "description": "성(Last name) 입력 칸",
      "field_label": "Last Name",
      "label_bounding_box": [43, 63, 87, 73],
      "entry_bounding_box": [92, 63, 260, 79],
      "entry_text": {"text": "Smith", "font_size": 10}
    },
    {
      "page_number": 1,
      "description": "US Citizen 'Yes' 체크박스",
      "field_label": "Yes",
      "label_bounding_box": [260, 200, 280, 210],
      "entry_bounding_box": [285, 197, 292, 205],
      "entry_text": {"text": "X"}
    }
  ]
}
```

**중요**: `pdf_width`/`pdf_height`와 form_structure.json의 좌표를 그대로 씁니다.

### A.4: 경계 상자 검증

채우기 전에 경계 상자에 오류가 없는지 확인합니다.
`python scripts/check_bounding_boxes.py fields.json`

이 스크립트는 서로 겹치는 경계 상자와 글꼴 크기에 비해 너무 작은 입력 상자를 검사합니다. 보고된 오류는 채우기 전에 모두 고칩니다.

---

## Approach B: 시각적 추정 (대체 방법)

PDF가 스캔본이나 이미지 기반이어서 구조 추출로 쓸 만한 텍스트 라벨을 찾지 못했을 때 사용합니다(예: 모든 텍스트가 "(cid:X)" 패턴으로 나오는 경우).

### B.1: PDF를 이미지로 변환

`python scripts/convert_pdf_to_images.py <input.pdf> <images_dir/>`

### B.2: 필드 초기 식별

각 페이지 이미지를 보고 양식 영역을 찾아 **대략적인 위치**를 파악합니다.
- 양식 필드 라벨과 대략적인 위치
- 입력 영역(선, 상자, 또는 텍스트를 쓸 빈 공간)
- 체크박스와 대략적인 위치

필드마다 대략적인 픽셀 좌표를 적어 둡니다. 이 단계에서는 정밀할 필요가 없습니다.

### B.3: 확대 보정 (정확도에 매우 중요)

필드마다 추정 위치 주변을 잘라내서 좌표를 정밀하게 다듬습니다.

**ImageMagick으로 확대 자르기 이미지 만들기:**
```bash
magick <page_image> -crop <width>x<height>+<x>+<y> +repage <crop_output.png>
```

각 값의 의미는 다음과 같습니다.
- `<x>, <y>` = 잘라낼 영역의 왼쪽 위 모서리 (대략 추정 좌표에서 여백을 뺀 값)
- `<width>, <height>` = 잘라낼 영역의 크기 (필드 영역에 좌우 각 약 50px 여백을 더한 값)

**예시:** (100, 150) 근처로 추정한 "Name" 필드를 다듬는 경우:
```bash
magick images_dir/page_1.png -crop 300x80+50+120 +repage crops/name_field.png
```

(참고: `magick` 명령이 없으면 같은 인자로 `convert`를 대신 써 봅니다.)

**잘라낸 이미지를 보고** 정확한 좌표를 찾습니다.
1. 입력 영역이 시작되는 정확한 픽셀 찾기 (라벨 뒤쪽)
2. 입력 영역이 끝나는 위치 찾기 (다음 필드나 가장자리 앞)
3. 입력 선이나 상자의 top과 bottom 찾기

**잘라낸 이미지의 좌표를 전체 이미지 좌표로 되돌립니다.**
- full_x = crop_x + crop_offset_x
- full_y = crop_y + crop_offset_y

예: 자르기 시작점이 (50, 120)이고, 입력 상자가 잘라낸 이미지 안에서 (52, 18)에서 시작한다면:
- entry_x0 = 52 + 50 = 102
- entry_top = 18 + 120 = 138

**필드마다 반복합니다.** 가까운 필드들은 가능하면 한 번에 같이 잘라 처리합니다.

### B.4: 다듬은 좌표로 fields.json 만들기

`image_width`와 `image_height`를 써서 fields.json을 만듭니다(이미지 좌표 기준).
```json
{
  "pages": [
    {"page_number": 1, "image_width": 1700, "image_height": 2200}
  ],
  "form_fields": [
    {
      "page_number": 1,
      "description": "성(Last name) 입력 칸",
      "field_label": "Last Name",
      "label_bounding_box": [120, 175, 242, 198],
      "entry_bounding_box": [255, 175, 720, 218],
      "entry_text": {"text": "Smith", "font_size": 10}
    }
  ]
}
```

**중요**: `image_width`/`image_height`와 확대 분석으로 얻은 픽셀 좌표를 씁니다.

### B.5: 경계 상자 검증

채우기 전에 경계 상자에 오류가 없는지 확인합니다.
`python scripts/check_bounding_boxes.py fields.json`

이 스크립트는 서로 겹치는 경계 상자와 글꼴 크기에 비해 너무 작은 입력 상자를 검사합니다. 보고된 오류는 채우기 전에 모두 고칩니다.

---

## Hybrid Approach: 구조 + 시각

구조 추출은 대부분의 필드에서 잘 되지만 일부 요소(예: 원형 체크박스, 특이한 양식 컨트롤)를 놓칠 때 사용합니다.

1. 구조 파일(form_structure.json)에서 찾은 필드는 **Approach A**를 씁니다.
2. 빠진 필드를 시각적으로 분석하기 위해 PDF를 이미지로 변환합니다.
3. 빠진 필드에는 (Approach B의) **확대 보정**을 씁니다.
4. **좌표 합치기**: 구조 추출로 찾은 필드는 `pdf_width`/`pdf_height`를 씁니다. 눈으로 추정한 필드는 이미지 좌표를 PDF 좌표로 바꿔야 합니다.
   - pdf_x = image_x * (pdf_width / image_width)
   - pdf_y = image_y * (pdf_height / image_height)
5. fields.json에서는 **좌표계를 하나로 통일**합니다. 모든 좌표를 `pdf_width`/`pdf_height` 기준 PDF 좌표로 바꿉니다.

---

## Step 2: 채우기 전에 검증

**채우기 전에는 항상 경계 상자를 검증합니다.**
`python scripts/check_bounding_boxes.py fields.json`

이 스크립트는 다음을 검사합니다.
- 서로 겹치는 경계 상자 (텍스트가 겹쳐 보이는 원인이 됨)
- 지정한 글꼴 크기에 비해 너무 작은 입력 상자

보고된 오류는 fields.json에서 고친 뒤 다음 단계로 넘어갑니다.

## Step 3: 양식 채우기

채우기 스크립트가 좌표계를 자동으로 감지하고 변환까지 처리합니다.
`python scripts/fill_pdf_form_with_annotations.py <input.pdf> fields.json <output.pdf>`

## Step 4: 결과 확인

채워진 PDF를 이미지로 변환해서 텍스트 위치를 확인합니다.
`python scripts/convert_pdf_to_images.py <output.pdf> <verify_images/>`

텍스트 위치가 어긋났다면 다음을 확인합니다.
- **Approach A**: `pdf_width`/`pdf_height`와 함께 form_structure.json의 PDF 좌표를 쓰고 있는지 확인합니다.
- **Approach B**: 이미지 크기가 맞고 좌표가 정확한 픽셀인지 확인합니다.
- **Hybrid**: 눈으로 추정한 필드의 좌표 변환이 맞는지 확인합니다.
