---
name: pptx
description: "Use this skill any time a .pptx or .potx file is involved in any way — as input, output, or both. This includes: creating slide decks, pitch decks, or presentations; reading, parsing, or extracting text from any .pptx or .potx file (even if the extracted content will be used elsewhere, like in an email or summary); editing, modifying, or updating existing presentations; combining or splitting slide files; working with templates (.potx), layouts, speaker notes, or comments. Trigger whenever the user mentions \"deck,\" \"slides,\" \"presentation,\" or references a .pptx or .potx filename, regardless of what they plan to do with the content afterward. If a .pptx or .potx file needs to be opened, created, or touched, use this skill."
license: Complete terms in LICENSE.txt
---

# PPTX 생성, 편집, 분석

`.pptx`는 XML 파일을 묶은 ZIP 아카이브입니다. 작업 종류에 따라 방법을 고릅니다.

| 작업 | 방법 |
|---|---|
| 새 deck **생성** | `pptxgenjs` 스크립트를 작성합니다. 아래 주의사항을 참고하세요 |
| 기존 deck **편집**, 또는 템플릿으로 만들기 | unzip → `ppt/slides/slideN.xml` 편집 → zip |
| 내용 **읽기** | `markitdown deck.pptx` (슬라이드마다 `<!-- Slide number: N -->` 마커 아래에 한 블록씩 출력됩니다). 시각적으로 보려면 격자 이미지: `python scripts/thumbnail.py deck.pptx` |

## 스크립트

경로는 이 skill 디렉터리 기준입니다. 나머지는 일반 Python, `node`, 셸 명령입니다.

| 스크립트 | 역할 |
|---|---|
| `scripts/thumbnail.py deck.pptx [prefix]` | 모든 슬라이드를 번호가 붙은 격자 이미지로 만듭니다. 템플릿 레이아웃을 고를 때 씁니다. `.pptx`만 받습니다. `prefix`를 꼭 넘기세요. 기본값은 `thumbnails`라서, 같은 디렉터리에서 다른 deck을 처리하면 그 격자 이미지를 덮어씁니다 |
| `scripts/add_slide.py unpacked/ slide2.xml [--after slideN.xml]` | 패키지 메타데이터를 모두 갱신하면서 슬라이드(또는 `slideLayoutN.xml`)를 복제합니다. `-o out.pptx`를 붙이면 `.pptx` 파일을 직접 받을 수도 있습니다 |
| `scripts/clean.py unpacked/` | 더 이상 참조되지 않는 슬라이드, 미디어, rels를 삭제합니다. `<p:sldIdLst>`를 확정한 **뒤에** 실행하세요 |
| `scripts/office/validate.py deck.pptx [--original src.pptx]` | 스키마, relationship, content-type, 차트, 슬라이드 검사를 합니다. 실패할 때마다 수정 방법을 함께 알려 줍니다. 템플릿에서 만든 deck이면 `--original`을 넘기세요. 이 옵션은 스키마 검사 기준선을 템플릿으로 맞추므로, 템플릿 자체의 XSD 오류가 내 작업 탓으로 보이지 않습니다 |
| `scripts/office/soffice.py --headless --convert-to pdf deck.pptx` | LibreOffice 래퍼입니다. 이 sandbox에서는 그냥 `soffice`를 실행하면 멈춥니다 |

## pptxgenjs로 생성할 때의 주의사항

`pptxgenjs`는 미리 설치되어 있습니다. `npm install`부터 실행하지 말고, 스크립트를 쓴 뒤 `require('pptxgenjs')`를 바로 호출하세요. `require`가 실패할 때만 `npm install pptxgenjs`를 실행합니다. API 자체는 모델이 이미 알고 있으므로, 여기에는 실수하기 쉬운 부분만 적었습니다.

- **슬라이드를 추가하기 전에 `pres.layout`을 설정하세요.** 기본 캔버스는 `LAYOUT_16x9`이며 크기는 **10" × 5.625"**입니다. 13.3" 너비가 아닙니다. 가장자리를 넘는 좌표는 잘리지 않고 그대로 기록되어, 도형이 슬라이드 밖에 놓입니다. (`LAYOUT_WIDE`는 13.3" × 7.5"입니다.)
- **헥스 색상에는 `#`을 쓰지 말고, 8자리로도 쓰지 마세요.** `color: "FF0000"`처럼 씁니다. `"#FF0000"`이나 헥스 값에 알파를 넣은 `"00000020"` 모두 **파일을 손상시킵니다**. 투명도는 채우기와 이미지에서는 `transparency: 0-100`, 그림자에서는 `opacity: 0.0-1.0`으로 지정합니다. 각 옵션은 다른 쪽에 적용되면 조용히 무시됩니다.
- **pptxgenjs는 옵션 객체를 직접 수정합니다.** 처음 사용할 때 값을 EMU 단위로 바꿉니다. 같은 `shadow`나 옵션 객체를 두 개의 `add*` 호출에 공유하지 마세요. 호출할 때마다 새 객체를 만드세요.
- **그림자 `offset`은 0 이상이어야 합니다.** 음수 offset은 파일을 손상시킵니다. 그림자를 위쪽으로 드리우려면 양수 offset과 `angle: 270`을 함께 쓰세요.
- **`letterSpacing`은 조용히 무시됩니다.** 실제로 쓰는 옵션은 `charSpacing`입니다.
- **목록:** 각 항목에 `bullet: true`를 쓰고, 글머리 기호 문자 `•`를 직접 넣지 마세요. 문자를 넣으면 기호가 두 번 나옵니다. 배열의 마지막 항목을 제외한 모든 항목에 `breakLine: true`를 설정하세요. 글머리 기호가 있는 단락의 간격은 `lineSpacing`이 아니라 `paraSpaceAfter`로 조절하세요. `lineSpacing`을 쓰면 간격이 크게 벌어집니다.
- **`new pptxgen()`은 출력 파일 하나당 한 번만 호출하세요.** 인스턴스를 재사용하지 마세요.
- **`rectRadius`는 `ROUNDED_RECTANGLE`에서만 동작합니다.** `RECTANGLE`에서는 동작하지 않습니다.
- **그라데이션 채우기는 지원되지 않습니다.** 대신 그라데이션 이미지를 배경으로 사용하세요.
- **텍스트 상자에는 내부 여백이 기본으로 들어 있습니다.** 텍스트가 같은 x 좌표의 도형, 선, 아이콘과 맞아야 하면 `margin: 0`을 설정하세요.
- **발표자 노트는 `slide.addNotes("...")`로 넣습니다.** 슬라이드 위의 텍스트 상자에 넣지 마세요. 슬라이드마다 한 번, 일반 텍스트로 씁니다.
- **차트는 네이티브 차트로 유지하세요.** PowerPoint가 차트로 그릴 수 있는 것은 모두 `addChart()`로 만듭니다. 복합 차트는 `{type, data, options}` 객체의 배열을 넘기면 됩니다. 라이브러리가 노출하지 않는 PowerPoint 네이티브 기능(추세선, 오차 막대 등)은 추가 계열을 직접 계산하거나 생성된 OOXML을 후처리해서 구현하세요. 렌더링한 이미지로 대체하지 마세요. PowerPoint에 네이티브 형식이 없는 차트 종류(Sankey, network, chord)만 이미지로 넣습니다.
- **기본 차트는 꾸밈이 없습니다.** 제목도, 데이터 레이블도 없고 팔레트도 오래된 느낌입니다. `showTitle`과 `title`, `showValue: true`와 `dataLabelPosition`, 내 팔레트를 담은 `chartColors: [...]`를 설정하세요. 프레임도 정리하세요. `catAxisLabelColor`/`valAxisLabelColor`, `valGridLine: { color, size }`, `catGridLine: { style: "none" }`를 쓰고, 계열이 하나면 `showLegend: false`로 범례를 끄세요.
- **누적 막대형 또는 누적 세로 막대형 차트에서 `dataLabelPosition`은 `ctr`, `inEnd`, `inBase` 중 하나여야 합니다.** `outEnd`는 **파일을 손상시킵니다**.
- **`secondaryValAxis`/`secondaryCatAxis`를 쓰는 복합 계열에는 차트 옵션에 `valAxes`와 `catAxes`가 모두 있어야 하며, 각각 두 개씩 필요합니다.** 없으면 pptxgenjs는 선언하지 않은 축 *id*를 기록하고, PowerPoint는 그 차트를 **버린 뒤** 파일이 손상되었다고 보고합니다. `valAxes`만 넣는 것으로는 부족합니다.
- **`writeFile()` 후에는 `python scripts/office/validate.py deck.pptx`를 실행하세요.** 위의 차트 문제 두 가지와, PowerPoint가 거부하는 슬라이드 XML 결함을 찾아 줍니다. 각 결함마다 수정 방법도 알려 줍니다. 패킹된 XML을 손으로 고치지 말고, 생성 스크립트에서 수정하세요.
- **`<p:presentation>`의 자식 요소 순서를 바꾸지 마세요.** pptxgenjs는 `<p:sldIdLst>` 바로 뒤에 `<p:notesMasterIdLst>`를 씁니다. 두 마스터는 하나의 theme 파트를 가리킵니다. PowerPoint는 이 구조를 정상으로 읽습니다. 요소를 옮기면 같은 deck을 열 수 없게 됩니다.
- **아이콘:** `react-icons`를 SVG로 렌더링하고(`ReactDOMServer.renderToStaticMarkup`), `sharp`로 256px 이상 래스터화한 뒤, `addImage({ data: "image/png;base64," + buf.toString("base64") })`로 넣으세요. `image/png;base64,` 접두사는 반드시 있어야 합니다. `react-icons`, `react`, `react-dom`, `sharp`도 미리 설치되어 있습니다. `require`가 실패할 때만 `npm install react-icons react react-dom sharp`를 실행하세요.

## 기존 deck과 템플릿 편집

먼저 레이아웃을 고르세요. `python scripts/thumbnail.py template.pptx template-thumbs`는 모든 슬라이드의 번호가 붙은 격자 이미지를 만들고, 생성된 파일 이름을 출력합니다. 결과는 `template-thumbs.jpg`이며, 슬라이드가 12장을 넘으면 `template-thumbs-N.jpg`로 나뉩니다. **두 번째 인자는 항상 deck 이름을 따서 지정하세요.** 기본값은 `thumbnails`라서, 같은 디렉터리에서 deck 두 개를 처리하면 한쪽 격자 이미지가 조용히 사라집니다. 이 이미지는 템플릿 분석용입니다. 시각적 QA에는 [이미지로 변환](#이미지로-변환)에서 만드는 고해상도 렌더링이 필요합니다. 이 스크립트는 `.pptx`만 받으므로, `.potx`는 먼저 `.pptx` 이름으로 복사하세요. `markitdown`과 함께 쓰면 각 내용 섹션을 템플릿 슬라이드에 매핑할 수 있습니다. 레이아웃은 다양하게 쓰세요. 모든 섹션을 같은 제목-글머리 기호 슬라이드에 넣지 마세요.

```bash
python3 -c "import sys,zipfile; zipfile.ZipFile(sys.argv[1]).extractall('unpacked')" deck.pptx
python scripts/add_slide.py unpacked/ slide2.xml --after slide2.xml   # 슬라이드(또는 slideLayoutN.xml)를 복제합니다. 새 슬라이드 경로를 출력합니다
# 순서 변경/삭제 = ppt/presentation.xml의 <p:sldIdLst>를 편집합니다
python scripts/clean.py unpacked/                                     # 삭제 후 실행: 고아 슬라이드, 미디어, rels를 제거합니다
# ppt/slides/slideN.xml에서 슬라이드 내용을 편집합니다
(cd unpacked && rm -f ../out.pptx && zip -Xr ../out.pptx .)           # 반드시 디렉터리 안에서 zip합니다. 먼저 rm하지 않으면 삭제된 파트가 남습니다
python scripts/office/validate.py out.pptx --original deck.pptx
```

- **구조 작업(추가, 삭제, 순서 변경)은 슬라이드 내용을 편집하기 전에 모두 끝내세요.** `add_slide.py`는 슬라이드 파일을 그대로 복사합니다. 편집한 뒤에 복제하면 편집한 내용까지 복제됩니다. `clean.py`는 `<p:sldIdLst>`에 없는 슬라이드를 모두 삭제합니다. 방금 작성한 슬라이드도 예외가 아닙니다.
- **슬라이드 파일을 손으로 복사하지 마세요.** `add_slide.py`가 새 슬라이드에 필요한 등록 작업을 모두 처리하고, 무엇을 만들었는지 알려 줍니다(`Created ppt/slides/slide17.xml from slide2.xml`). 파일에 직접 적용할 수도 있습니다: `add_slide.py deck.pptx slide2.xml -o out.pptx`. **`-o`를 빠뜨리면 입력 deck이 제자리에서 덮어써지므로 꼭 넘기세요.** 복제된 슬라이드는 원본의 차트, SmartArt, 임베디드 객체 파트를 복사하지 않고 *참조*만 합니다. 그래서 한 슬라이드의 차트를 편집하면 다른 슬라이드의 차트도 바뀝니다.
- **`python-pptx`를 쓴다면 다음 세 가지는 직접 처리해야 합니다.** 슬라이드 복제는 하지 않습니다. 진입점이 `add_slide(layout)`뿐이기 때문입니다. `text_frame.text = "..."`로 넣으면 서식이 유지되지 않습니다. 단락이 서식 없는 run 하나로 합쳐지므로, 대신 `run.text`를 설정하세요. 대부분의 템플릿 그림이 쓰는 SVG/EMF를 읽지 못합니다. `add_picture`가 `UnidentifiedImageError`를 던집니다.
- 레거시 `.ppt`는 먼저 변환해야 합니다: `python scripts/office/soffice.py --headless --convert-to pptx file.ppt`. `.potx` 템플릿은 `.pptx`와 똑같이 풀고 묶습니다. 출력 파일은 `.potx` 확장자를 유지하세요.
- 템플릿의 아이콘이나 이미지를 재사용하려면, 그 그림이 이미 들어 있는 슬라이드나 레이아웃을 복제하세요.

템플릿을 채울 때는 다음을 지키세요.

- XML 변환 스크립트를 쓴다면 `defusedxml.minidom`으로 파싱하세요. OOXML을 `xml.etree.ElementTree`로 왕복 변환하면 네임스페이스 prefix가 바뀌어 deck이 손상됩니다.
- **템플릿 슬롯과 실제 항목은 다릅니다.** 템플릿에 팀원이 4명 있는데 실제로 3명이라면, 4번째 팀원의 그룹 전체(그림과 텍스트 상자)를 삭제하세요. 텍스트만 지우면 안 됩니다. 그다음 QA에서 남은 그림이 없는지 확인하세요.
- 목록 항목마다 `<a:p>`를 하나씩 쓰세요. 항목을 한 단락에 이어 붙이지 마세요. 간격을 유지하려면 형제 `<a:pPr>`을 복사하세요. 제목, 섹션 머리글, 인라인 라벨(`Status:`, `Owner:`)의 `<a:rPr>`에는 `b="1"`을 넣으세요.
- 글머리 기호는 레이아웃에서 상속받게 두세요. 재정의가 필요할 때만 `<a:buChar>`, `<a:buAutoNum>`(번호 매기기), `<a:buNone>`을 추가하세요. 텍스트에 `•`를 직접 넣지 마세요.
- 앞뒤에 공백이 있는 텍스트는 해당 `<a:t>`에 `xml:space="preserve"`가 필요합니다.

## 디자인 아이디어

**밋밋한 슬라이드를 만들지 마세요.** 흰 배경에 평범한 글머리 기호만 있으면 누구에게도 인상을 주지 못합니다. 각 슬라이드마다 아래 목록의 아이디어를 검토하세요.

### 시작하기 전에

- **내용에 맞는 과감한 색상 팔레트를 고르세요.** 팔레트는 이 주제를 위해 설계된 것처럼 보여야 합니다. 같은 색을 전혀 다른 발표에 넣어도 "그럭저럭 어울린다"면, 선택이 아직 구체적이지 않은 것입니다.
- **균등한 배분보다 한 색의 지배가 낫습니다.** 한 색이 시각적 무게의 60-70%를 차지하게 하고, 보조 색조 1-2개와 선명한 강조색 하나를 두세요. 모든 색에 같은 비중을 주지 마세요.
- **어두운 배경과 밝은 배경의 대비를 주세요.** 제목과 결론 슬라이드는 어두운 배경을, 내용 슬라이드는 밝은 배경을 씁니다. "샌드위치" 구조입니다. 또는 고급스러운 느낌을 위해 전체를 어둡게 유지하세요.
- **시각적 모티프를 하나 정하고 반복하세요.** 특징적인 요소를 하나 고르고, 모든 슬라이드에 걸쳐 쓰세요. 예를 들면 둥근 이미지 프레임, 색 원 안의 아이콘이 있습니다. **색 막대나 강조 띠를 모티프로 쓰지 마세요**(피해야 할 목록 참고).

### 색상 팔레트

주제에 맞는 색을 고르세요. 기본 파란색으로 두지 마세요. 아래 팔레트를 영감으로 삼으세요.

| 테마 | 기본 | 보조 | 강조 |
|-------|---------|-----------|--------|
| **Midnight Executive** | `1E2761` (navy) | `CADCFC` (ice blue) | `FFFFFF` (white) |
| **Forest & Moss** | `2C5F2D` (forest) | `97BC62` (moss) | `F5F5F5` (cream) |
| **Coral Energy** | `F96167` (coral) | `F9E795` (gold) | `2F3C7E` (navy) |
| **Warm Terracotta** | `B85042` (terracotta) | `E7E8D1` (sand) | `A7BEAE` (sage) |
| **Ocean Gradient** | `065A82` (deep blue) | `1C7293` (teal) | `21295C` (midnight) |
| **Charcoal Minimal** | `36454F` (charcoal) | `F2F2F2` (off-white) | `212121` (black) |
| **Teal Trust** | `028090` (teal) | `00A896` (seafoam) | `02C39A` (mint) |
| **Berry & Cream** | `6D2E46` (berry) | `A26769` (dusty rose) | `ECE2D0` (cream) |
| **Sage Calm** | `84B59F` (sage) | `69A297` (eucalyptus) | `50808E` (slate) |
| **Cherry Bold** | `990011` (cherry) | `FCF6F5` (off-white) | `2F3C7E` (navy) |

### 슬라이드마다

**모든 슬라이드에는 시각 요소가 있어야 합니다.** 그림, 차트, 아이콘, 도형 중 하나를 넣으세요. 글만 있는 슬라이드는 기억에 남지 않습니다.

**레이아웃 선택지:**
- 두 단 구성(왼쪽에 텍스트, 오른쪽에 일러스트)
- 아이콘 + 텍스트 행(색 원 안의 아이콘, 굵은 머리글, 아래 설명)
- 2x2 또는 2x3 격자(한쪽에 그림, 다른 쪽에 내용 블록 격자)
- 절반 꽉 찬 이미지(왼쪽 또는 오른쪽 전체)에 내용을 겹쳐 배치

**데이터 표시:**
- 큰 수치 강조(60-72pt의 큰 숫자, 아래에 작은 라벨)
- 비교 열(전/후, 장점/단점, 나란히 놓은 옵션)
- 타임라인 또는 프로세스 흐름(번호 매긴 단계, 화살표)

**시각적 완성도:**
- 섹션 머리글 옆에 작은 색 원으로 감싼 아이콘
- 핵심 수치나 슬로건에 이탤릭 강조 텍스트

### 타이포그래피

**.pptx에 적는 글꼴 이름은 이 환경이 아니라 사용자의 PowerPoint가 렌더링합니다.** 시각적 QA는 LibreOffice로 렌더링하는데, LibreOffice는 없는 글꼴을 다른 글꼴로 대체합니다. 일부 글꼴은 대체 글꼴의 너비가 달라서, QA 미리보기에서는 텍스트가 넘치거나 맞아 보여도 실제 deck에서는 그렇지 않을 수 있습니다. QA를 믿을 수 있게 유지하려면 다음을 따르세요.

- **안전한 글꼴**(QA에서 너비가 그대로 재현되고 Office에 기본 포함됨): **Arial, Calibri, Cambria, Times New Roman, Courier New, Bookman Old Style, Century Schoolbook**. 본문과 맞춤이 중요한 모든 곳에 이 글꼴을 쓰세요.
- **QA 위험 없이 개성 있는 머리글**: 안전한 목록의 세리프 머리글(Cambria, Bookman Old Style, Century Schoolbook)에 안전한 목록의 산세리프 본문(Calibri 또는 Arial)을 맞추세요. 넘침 검사를 믿을 수 있는 상태를 유지하면서 시각적 대비를 얻을 수 있습니다.
- **안전한 목록 밖의 글꼴을 사용자가 요청한 경우**(예: Georgia 또는 Trebuchet MS): 요청받은 곳에는 그 글꼴을 쓰되, 그 컨테이너는 여유를 더 줍니다(약 10%). 그 요소의 QA 텍스트 맞춤 결과는 믿지 마세요. 그 글꼴의 미리보기는 근사치입니다. 사용자가 지정하지 않았다면 본문에는 안전한 목록의 글꼴을 우선 쓰세요.
- **QA를 믿기 어려운 글꼴**(대체 글꼴의 너비가 달라서 넘침 검사가 틀릴 수 있음): Georgia, Trebuchet MS, Impact, Arial Black, Garamond, Consolas, Palatino Linotype. Calibri Light는 환경마다 대체 글꼴이 달라서 QA를 믿기 어려운 것으로 취급하세요. 여유를 두면 제목이나 강조용으로는 괜찮지만, 이 글꼴들의 QA 텍스트 맞춤 결과는 믿지 마세요.
- **Aptos를 기본값으로 쓰지 마세요.** Office가 2023년 이후 기본값으로 쓰는 글꼴인데, 여기에는 호환되는 대체 글꼴이 없고 구버전 Office에는 설치되어 있지 않습니다. 양쪽 모두에서 믿을 수 없습니다.

| 요소 | 크기 |
|---------|------|
| 슬라이드 제목 | 36-44pt 굵게 |
| 섹션 머리글 | 20-24pt 굵게 |
| 본문 | 14-16pt |
| 캡션 | 10-12pt, 흐리게 |

### 여백

- 최소 0.5" 여백
- 내용 블록 사이 0.3-0.5"
- 여백을 남기세요. 모든 공간을 채우지 마세요.

### 피해야 할 것(흔한 실수)

- **같은 레이아웃을 반복하지 마세요.** 슬라이드마다 열, 카드, 강조 상자를 바꾸세요.
- **본문을 가운데 정렬하지 마세요.** 단락과 목록은 왼쪽 정렬하고, 제목만 가운데 정렬하세요.
- **크기 대비를 아끼지 마세요.** 제목은 14-16pt 본문과 구별되도록 36pt 이상이어야 합니다.
- **기본 파란색으로 두지 마세요.** 이 주제를 드러내는 색을 고르세요.
- **간격을 무작위로 섞지 마세요.** 0.3" 또는 0.5" 중 하나를 골라 일관되게 쓰세요.
- **한 슬라이드만 꾸미고 나머지는 밋밋하게 두지 마세요.** 전체를 꾸미거나, 처음부터 끝까지 단순하게 유지하세요.
- **글만 있는 슬라이드를 만들지 마세요.** 그림, 아이콘, 차트, 시각 요소를 넣으세요. 제목과 글머리 기호만 있는 구성은 피하세요.
- **텍스트 상자 여백을 잊지 마세요.** 줄이나 도형을 텍스트 가장자리에 맞출 때는 텍스트 상자에 `margin: 0`을 설정하거나, 여백을 감안해 도형 위치를 조정하세요.
- **대비가 낮은 요소를 쓰지 마세요.** 아이콘과 텍스트 모두 배경과 뚜렷하게 대비되어야 합니다. 밝은 배경에 밝은 글자, 어두운 배경에 어두운 글자를 피하세요.
- **제목 아래에 강조 줄을 넣지 마세요.** AI가 만든 슬라이드의 전형적인 특징입니다. 여백이나 배경색을 쓰세요.
- **장식용 색 막대나 강조 띠를 넣지 마세요.** 슬라이드 너비를 가로지르는 머리글/바닥글 막대, 슬라이드 한쪽 가장자리를 따라가는 세로 사이드바, 카드나 내용 블록 한쪽 가장자리의 얇은 강조 띠, 사각형의 "한쪽만 있는 테두리"가 모두 해당합니다. 이런 요소는 AI가 채운 군더더기처럼 보입니다. 카드를 구분하고 싶다면 옅은 배경색, 그림자, 아이콘을 쓰세요. 가장자리 띠는 쓰지 마세요.
- **크림색이나 베이지색 배경을 기본값으로 쓰지 마세요.** 배경을 지정하지 않았다면 흰색(`FFFFFF`)이나 사용자의 브랜드 팔레트를 쓰세요. `F5F5DC`, `FAF0E6`, `FAEBD7`, `FFF8E1`처럼 따뜻한 중립색 기본값은 피하세요.
- **도형 밖으로 넘치는 텍스트를 내보내지 마세요.** 텍스트가 맞지 않으면 글꼴 크기를 줄이거나, 슬라이드를 나누거나, 컨테이너를 키우세요. 내용이 잘리거나 경계를 넘어 흘러나오게 두지 마세요.

## QA (필수)

첫 렌더링에는 겹침, 넘침, 정렬 어긋남 같은 실제 문제가 보통 몇 개 있습니다. 이런 문제를 찾아 고치고, 바뀐 슬라이드만 다시 렌더링한 뒤 멈추세요.

### 내용 QA

```bash
markitdown output.pptx
```

빠진 내용, 오타, 잘못된 순서가 없는지 확인하세요.

**템플릿을 쓴 경우, 남은 placeholder 텍스트가 없는지 확인하세요:**

```bash
markitdown output.pptx | grep -iE "\bx{3,}\b|lorem|ipsum|\bTODO|\[insert|this.*(page|slide).*layout"
```

grep 결과가 나오면, 성공이라고 선언하기 전에 고치세요.

### 파일 QA (필수)

```bash
python scripts/office/validate.py output.pptx                      # 처음부터 만든 경우
python scripts/office/validate.py output.pptx --original src.pptx  # 템플릿으로 만든 경우
```

**deck이 템플릿에서 나왔다면 항상 `--original`을 넘기세요.** 템플릿에는 XSD가 거부하는 부분이 있을 수 있습니다. 그래서 옵션 없이 실행하면 내가 만들지 않은 실패가 보고될 수 있고, 실제 회귀는 그 사이에 숨을 수 있습니다. `--original`은 템플릿을 기준선으로 삼아, 템플릿에 이미 있던 스키마와 슬라이드 오류를 억제합니다. 구조 검사(relationship, content type, 차트)는 `--original`의 영향을 받지 않으며, 두 경우 모두 템플릿에서 물려받은 문제를 보고합니다. 그 결과는 그 자체로 판단하세요.

pptxgenjs가 만드는 차트 XML은 PowerPoint가 열지 못하는 경우가 있습니다. 반면 다른 도구는 모두 그 파일을 받아들입니다. python-pptx는 이 deck을 열고, LibreOffice는 렌더링하며, XSD도 통과시킵니다. 모든 실패에는 수정 방법이 함께 나옵니다. 생성 스크립트에서 고친 뒤 다시 빌드하세요.

### 시각적 QA

슬라이드를 이미지로 변환하고([이미지로 변환](#이미지로-변환) 참고), 모든 슬라이드를 점검하세요. 생성 코드를 오래 보고 있으면 실제 렌더링 결과 대신 기대한 결과가 보이기 쉽습니다. 그러니 이미지를 새로운 눈으로 보세요. 사용할 수 있다면 서브에이전트에게 이 검토를 맡기는 것도 좋습니다. 찾아야 할 사용자에게 보이는 결함은 다음과 같습니다.

- **상자나 슬라이드 경계에서 텍스트가 넘치거나 잘리는지 확인하세요. 이것을 가장 먼저 보세요.** 가장 흔한 결함이며, 사용자에게 항상 보입니다. (글꼴 타이포그래피 규칙에 따라 미리보기가 부정확하게 렌더링하는 글꼴이라면, 미리보기는 근사치입니다. 보이는 맞춤 상태보다 남겨 둔 약 10% 여유를 믿으세요.)
- 겹치는 요소(텍스트가 도형을 뚫고 나오거나, 선이 단어를 지나거나, 요소가 쌓여 있는 경우)
- 출처 표기나 바닥글이 위의 내용과 부딪히는 경우
- 요소가 너무 가까운 경우(간격 0.3" 미만), 또는 카드나 섹션이 거의 맞닿은 경우
- 간격이 고르지 않은 경우(한쪽은 큰 빈 공간, 다른 쪽은 빽빽함)
- 슬라이드 가장자리와의 여백이 부족한 경우(0.5" 미만)
- 열이나 비슷한 요소가 일관되게 정렬되지 않은 경우
- 대비가 낮은 텍스트(예: 크림색 배경 위의 밝은 회색 텍스트)
- 텍스트 교체 후 템플릿 장식의 위치가 틀어진 경우(예: 한 줄용으로 배치된 제목 밑줄이, 교체된 제목이 두 줄로 줄바꿈되면서 어긋나는 경우)
- 대비가 낮은 아이콘(예: 대비 원이 없는 어두운 배경 위의 어두운 아이콘)
- 너무 좁아서 줄바꿈이 과도하게 생기는 텍스트 상자
- 남아 있는 placeholder 내용

## 이미지로 변환

프레젠테이션을 슬라이드별 이미지로 변환해서 시각적으로 점검하세요.

```bash
python scripts/office/soffice.py --headless --convert-to pdf output.pptx
rm -f slide-*.jpg
pdftoppm -jpeg -r 150 output.pdf slide
ls -1 "$PWD"/slide-*.jpg
```

**위에서 출력된 절대 경로를 그대로 view 도구에 넘기세요.** `rm`은 이전 실행의 오래된 이미지를 지웁니다. `pdftoppm`은 페이지 수에 따라 번호를 0으로 채웁니다. 10페이지 미만 deck은 `slide-1.jpg`, 10-99페이지는 `slide-01.jpg`, 100페이지 이상은 `slide-001.jpg`입니다.

**수정한 뒤에는 위의 네 명령을 모두 다시 실행하세요.** `pdftoppm`이 수정 내용을 반영하려면, PDF를 편집된 `.pptx`에서 다시 만들어야 합니다.

## 의존성

`pptxgenjs`(npm, 미리 설치됨. `require('pptxgenjs')`가 실패할 때만 설치) · `markitdown[pptx]`, `Pillow`, `defusedxml`, `lxml`(pip. 텍스트 추출, 격자 이미지, clean, validate에 사용) · LibreOffice(`soffice`, `scripts/office/soffice.py`를 통해 sandbox 환경에 맞게 자동 설정됨) · `pdftoppm`(Poppler)
