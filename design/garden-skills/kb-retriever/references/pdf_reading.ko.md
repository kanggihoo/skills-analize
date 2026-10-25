# PDF 읽기 및 분석

> ⚠️ **이 문서를 사용하기 전에**: 실제 PDF 파일을 처리하기 전에 이 문서 전체를 읽고 가장 적절한 도구와 방법을 선택하세요. 이 문서를 읽지 않은 채 PDF 처리를 시도하지 마세요.

PDF 파일에서 텍스트, 표, 메타데이터를 추출하는 방법을 설명합니다.

## 빠른 선택 표

| 상황 | 권장 도구 | 이유 | 명령 / 코드 예시 |
|------|----------|------|--------------|
| 纯文本提取（最常见） | pdftotext 命令 | 最快最简单 | `pdftotext input.pdf output.txt` |
| 需要保留布局 | pdftotext -layout | 保持原始排版 | `pdftotext -layout input.pdf output.txt` |
| 需要提取表格 | pdfplumber | 表格识别能力强 | `page.extract_tables()` |
| 需要元数据 | pypdf | 轻量级 | `reader.metadata` |
| 扫描PDF（图片） | OCR (pytesseract) | 无其他选择 | 先转图片再OCR |

## 텍스트 추출 우선순위

**권장 순서(우선순위가 높은 순)**:
1. **pdftotext 명령줄 도구**(가장 빠르며 대부분의 PDF에 적합)
2. pdfplumber(레이아웃 보존 또는 표 추출에 적합)
3. pypdf(가벼우며 간단한 추출에 적합)
4. OCR(스캔 PDF 또는 텍스트를 직접 추출할 수 없는 경우에만 사용)

## 빠른 시작: pdftotext 사용(권장)

> ⚠️ **중요**: 출력을 반드시 파일에 저장하고 터미널(stdout)로 직접 출력하지 마세요. 많은 토큰을 소모할 수 있습니다.

```bash
# ✅ 正确：提取文本到文件（最快最简单）
pdftotext input.pdf output.txt

# ✅ 正确：保留布局并输出到文件
pdftotext -layout input.pdf output.txt

# ✅ 正确：提取特定页面到文件
pdftotext -f 1 -l 5 input.pdf output.txt  # 第1-5页

# ❌ 错误：不要使用 stdout（会占用大量 token）
# pdftotext input.pdf -
```

**사용 흐름**:
1. pdftotext로 텍스트를 임시 파일에 추출합니다.
2. grep 또는 Read 도구로 생성된 텍스트 파일을 검색합니다.
3. 전체가 아니라 일치한 부분 주변 문맥만 읽습니다.

Python에서 처리해야 한다면:

```python
from pypdf import PdfReader

# PDF 읽기
reader = PdfReader("document.pdf")
print(f"Pages: {len(reader.pages)}")

# 텍스트 추출
text = ""
for page in reader.pages:
    text += page.extract_text()
```

## Python 라이브러리

### pypdf - 기본 텍스트 추출

```python
from pypdf import PdfReader

reader = PdfReader("document.pdf")

# 전체 텍스트 추출
for page in reader.pages:
    text = page.extract_text()
    print(text)

# 메타데이터 추출
meta = reader.metadata
print(f"Title: {meta.title}")
print(f"Author: {meta.author}")
print(f"Subject: {meta.subject}")
print(f"Creator: {meta.creator}")
```

### pdfplumber - 레이아웃을 포함한 텍스트 및 표 추출

#### 텍스트 추출(레이아웃 보존)

```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        print(text)
```

#### 표 추출

```python
with pdfplumber.open("document.pdf") as pdf:
    for i, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        for j, table in enumerate(tables):
            print(f"Table {j+1} on page {i+1}:")
            for row in table:
                print(row)
```

#### 고급 표 추출(DataFrame으로 변환)

```python
import pandas as pd

with pdfplumber.open("document.pdf") as pdf:
    all_tables = []
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            if table:  # 检查表格非空
                df = pd.DataFrame(table[1:], columns=table[0])
                all_tables.append(df)

# 모든 표 병합
if all_tables:
    combined_df = pd.concat(all_tables, ignore_index=True)
    combined_df.to_excel("extracted_tables.xlsx", index=False)
```

#### 좌표를 사용한 정밀 텍스트 추출

```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    page = pdf.pages[0]
    
    # 모든 문자와 좌표 추출
    chars = page.chars
    for char in chars[:10]:  # 처음 10개 문자
        print(f"Char: '{char['text']}' at x:{char['x0']:.1f} y:{char['y0']:.1f}")
    
    # 경계 상자(left, top, right, bottom) 내 텍스트 추출
    bbox_text = page.within_bbox((100, 100, 400, 200)).extract_text()
```

#### 복잡한 표를 위한 고급 설정

```python
import pdfplumber

with pdfplumber.open("complex_table.pdf") as pdf:
    page = pdf.pages[0]
    
    # 표 추출 설정 사용자 지정
    table_settings = {
        "vertical_strategy": "lines",
        "horizontal_strategy": "lines",
        "snap_tolerance": 3,
        "intersection_tolerance": 15
    }
    tables = page.extract_tables(table_settings)
    
    # 시각화하여 디버깅
    img = page.to_image(resolution=150)
    img.save("debug_layout.png")
```

### pypdfium2 - 빠른 렌더링과 텍스트 추출

```python
import pypdfium2 as pdfium

# PDF 로드
pdf = pdfium.PdfDocument("document.pdf")

# 텍스트 추출
for i, page in enumerate(pdf):
    text = page.get_text()
    print(f"Page {i+1} text length: {len(text)} chars")
```

#### PDF 페이지를 이미지로 렌더링

```python
import pypdfium2 as pdfium
from PIL import Image

pdf = pdfium.PdfDocument("document.pdf")

# 한 페이지 렌더링
 page = pdf[0]  # 첫 페이지
bitmap = page.render(
    scale=2.0,  # 고해상도
    rotation=0  # 회전 없음
)

# PIL Image로 변환
img = bitmap.to_pil()
img.save("page_1.png", "PNG")

# 여러 페이지 처리
for i, page in enumerate(pdf):
    bitmap = page.render(scale=1.5)
    img = bitmap.to_pil()
    img.save(f"page_{i+1}.jpg", "JPEG", quality=90)
```

## 명령줄 도구

### pdftotext(poppler-utils)

> ⚠️ **성능 최적화**: 토큰 사용을 줄이도록 항상 파일로 출력합니다.

```bash
# ✅ 텍스트를 파일로 추출
pdftotext input.pdf output.txt

# ✅ 레이아웃을 보존해 파일로 추출
pdftotext -layout input.pdf output.txt

# ✅ 지정한 페이지를 파일로 추출
pdftotext -f 1 -l 5 input.pdf output.txt  # 第1-5页

# ✅ 좌표가 포함된 텍스트를 XML 파일로 추출(구조화 데이터용)
pdftotext -bbox-layout document.pdf output.xml

# ❌ 금지: 출력 파일 이름을 생략하지 않음(stdout로 출력됨)
# pdftotext input.pdf
```

### 고급 이미지 변환(pdftoppm)

```bash
# 해상도를 지정해 PNG로 변환
pdftoppm -png -r 300 document.pdf output_prefix

# 지정한 페이지 범위를 고해상도로 변환
pdftoppm -png -r 600 -f 1 -l 3 document.pdf high_res_pages

# 품질을 지정해 JPEG로 변환
pdftoppm -jpeg -jpegopt quality=85 -r 200 document.pdf jpeg_output
```

### 내장 이미지 추출(pdfimages)

```bash
# 모든 이미지 추출
pdfimages -j input.pdf output_prefix

# 이미지를 추출하지 않고 정보만 나열
pdfimages -list document.pdf

# 원래 형식으로 추출
pdfimages -all document.pdf images/img
```

## OCR 추출(스캔 PDF)

```python
# 需要: pip install pytesseract pdf2image
import pytesseract
from pdf2image import convert_from_path

# PDF를 이미지로 변환
images = convert_from_path('scanned.pdf')

# 각 페이지 OCR 처리
text = ""
for i, image in enumerate(images):
    text += f"Page {i+1}:\n"
    text += pytesseract.image_to_string(image)
    text += "\n\n"

print(text)
```

## 암호화된 PDF 처리

```python
from pypdf import PdfReader

try:
    reader = PdfReader("encrypted.pdf")
    if reader.is_encrypted:
        reader.decrypt("password")
    
    # 복호화 후 일반적인 텍스트 추출 가능
    for page in reader.pages:
        text = page.extract_text()
        print(text)
except Exception as e:
    print(f"Failed to decrypt: {e}")
```

```bash
# qpdf로 복호화(암호를 알아야 함)
qpdf --password=mypassword --decrypt encrypted.pdf decrypted.pdf

# 암호화 상태 확인
qpdf --show-encryption encrypted.pdf
```

## 일괄 처리

```python
import os
import glob
from pypdf import PdfReader
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def batch_extract_text(input_dir):
    """텍스트 일괄 추출"""
    pdf_files = glob.glob(os.path.join(input_dir, "*.pdf"))
    
    for pdf_file in pdf_files:
        try:
            reader = PdfReader(pdf_file)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
            
            output_file = pdf_file.replace('.pdf', '.txt')
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(text)
            logger.info(f"Extracted text from: {pdf_file}")
            
        except Exception as e:
            logger.error(f"Failed to extract text from {pdf_file}: {e}")
            continue
```

## 성능 최적화

1. **파일 출력 우선**: pdftotext 결과를 항상 파일에 저장한 뒤 grep / Read로 검색합니다. 터미널 직접 출력으로 토큰을 많이 쓰지 않도록 합니다.
2. **대용량 PDF**: 전체를 한 번에 로드하지 말고 스트리밍 방식으로 페이지별 처리합니다.
3. **텍스트 추출**: `pdftotext`가 가장 빠르고, pdfplumber는 구조화된 데이터와 표에 적합합니다.
4. **이미지 추출**: `pdfimages`는 페이지 렌더링보다 훨씬 빠릅니다.
5. **메모리 관리**: 대용량 파일은 페이지별 또는 청크별로 처리합니다.

## 빠른 참조

| 작업 | 최적 도구 | 명령 / 코드 |
|------|----------|-----------|
| 提取文本 | pdfplumber | `page.extract_text()` |
| 提取表格 | pdfplumber | `page.extract_tables()` |
| 命令行提取 | pdftotext | `pdftotext -layout input.pdf` |
| OCR 扫描PDF | pytesseract | 先转图片再OCR |
| 提取元数据 | pypdf | `reader.metadata` |
| PDF转图片 | pypdfium2 | `page.render()` |

## 사용 가능한 패키지

- **pypdf** - 기본 작업(BSD 라이선스)
- **pdfplumber** - 텍스트 및 표 추출(MIT 라이선스)
- **pypdfium2** - 빠른 렌더링 및 추출(Apache/BSD 라이선스)
- **pytesseract** - OCR(Apache 라이선스)
- **pdf2image** - PDF를 이미지로 변환
- **poppler-utils** - 명령줄 도구(GPL-2 라이선스)
