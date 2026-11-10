---
name: pdf
description: 사용자가 PDF 파일로 무엇이든 하려고 하면 이 스킬을 쓴다. PDF에서 텍스트나 표를 읽고 추출하기, 여러 PDF를 하나로 합치기, PDF를 나누기, 페이지 회전, 워터마크 추가, 새 PDF 만들기, PDF 양식 채우기, 암호화와 복호화, 이미지 추출, 스캔 PDF에 OCR을 적용해 검색 가능하게 만들기가 모두 여기에 든다. 사용자가 .pdf 파일을 언급하거나 PDF 생성을 요청하면 이 스킬을 쓴다.
license: Complete terms in LICENSE.txt
---

# PDF 처리 가이드

## 개요

이 가이드는 Python 라이브러리와 명령줄 도구로 PDF를 처리하는 기본 작업을 다룬다. 고급 기능, JavaScript 라이브러리, 자세한 예시는 REFERENCE.md를 본다. PDF 양식을 채워야 하면 FORMS.md를 읽고 그 지침을 따른다.

## 빠른 시작

```python
from pypdf import PdfReader, PdfWriter

# PDF 읽기
reader = PdfReader("document.pdf")
print(f"Pages: {len(reader.pages)}")

# 텍스트 추출
text = ""
for page in reader.pages:
    text += page.extract_text()
```

## Python 라이브러리

### pypdf - 기본 작업

#### PDF 병합
```python
from pypdf import PdfWriter, PdfReader

writer = PdfWriter()
for pdf_file in ["doc1.pdf", "doc2.pdf", "doc3.pdf"]:
    reader = PdfReader(pdf_file)
    for page in reader.pages:
        writer.add_page(page)

with open("merged.pdf", "wb") as output:
    writer.write(output)
```

#### PDF 분할
```python
reader = PdfReader("input.pdf")
for i, page in enumerate(reader.pages):
    writer = PdfWriter()
    writer.add_page(page)
    with open(f"page_{i+1}.pdf", "wb") as output:
        writer.write(output)
```

#### 메타데이터 추출
```python
reader = PdfReader("document.pdf")
meta = reader.metadata
print(f"Title: {meta.title}")
print(f"Author: {meta.author}")
print(f"Subject: {meta.subject}")
print(f"Creator: {meta.creator}")
```

#### 페이지 회전
```python
reader = PdfReader("input.pdf")
writer = PdfWriter()

page = reader.pages[0]
page.rotate(90)  # 시계 방향으로 90도 회전
writer.add_page(page)

with open("rotated.pdf", "wb") as output:
    writer.write(output)
```

### pdfplumber - 텍스트와 표 추출

#### 레이아웃을 유지하며 텍스트 추출
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

#### 고급 표 추출
```python
import pandas as pd

with pdfplumber.open("document.pdf") as pdf:
    all_tables = []
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            if table:  # 표가 비어 있지 않은지 확인
                df = pd.DataFrame(table[1:], columns=table[0])
                all_tables.append(df)

# 모든 표를 합친다
if all_tables:
    combined_df = pd.concat(all_tables, ignore_index=True)
    combined_df.to_excel("extracted_tables.xlsx", index=False)
```

### reportlab - PDF 생성

#### 기본 PDF 생성
```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas("hello.pdf", pagesize=letter)
width, height = letter

# 텍스트 추가
c.drawString(100, height - 100, "Hello World!")
c.drawString(100, height - 120, "This is a PDF created with reportlab")

# 선 추가
c.line(100, height - 140, 400, height - 140)

# 저장
c.save()
```

#### 여러 페이지 PDF 생성
```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet

doc = SimpleDocTemplate("report.pdf", pagesize=letter)
styles = getSampleStyleSheet()
story = []

# 내용 추가
title = Paragraph("Report Title", styles['Title'])
story.append(title)
story.append(Spacer(1, 12))

body = Paragraph("This is the body of the report. " * 20, styles['Normal'])
story.append(body)
story.append(PageBreak())

# 2페이지
story.append(Paragraph("Page 2", styles['Heading1']))
story.append(Paragraph("Content for page 2", styles['Normal']))

# PDF 빌드
doc.build(story)
```

#### 아래첨자와 위첨자

**중요**: ReportLab PDF에서는 유니코드 아래첨자·위첨자 문자(₀₁₂₃₄₅₆₇₈₉, ⁰¹²³⁴⁵⁶⁷⁸⁹)를 쓰지 않는다. 내장 폰트에 이 글리프가 없어서 글자가 검은 상자로 렌더링된다.

대신 Paragraph 객체에서 ReportLab의 XML 마크업 태그를 쓴다.
```python
from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet

styles = getSampleStyleSheet()

# 아래첨자: <sub> 태그 사용
chemical = Paragraph("H<sub>2</sub>O", styles['Normal'])

# 위첨자: <super> 태그 사용
squared = Paragraph("x<super>2</super> + y<super>2</super>", styles['Normal'])
```

canvas로 직접 그리는 텍스트(Paragraph 객체가 아닌 경우)는 유니코드 아래첨자·위첨자 대신 폰트 크기와 위치를 직접 조정한다.

## 명령줄 도구

### pdftotext (poppler-utils)
```bash
# 텍스트 추출
pdftotext input.pdf output.txt

# 레이아웃을 유지하며 텍스트 추출
pdftotext -layout input.pdf output.txt

# 특정 페이지만 추출
pdftotext -f 1 -l 5 input.pdf output.txt  # 1~5페이지
```

### qpdf
```bash
# PDF 병합
qpdf --empty --pages file1.pdf file2.pdf -- merged.pdf

# 페이지 분할
qpdf input.pdf --pages . 1-5 -- pages1-5.pdf
qpdf input.pdf --pages . 6-10 -- pages6-10.pdf

# 페이지 회전
qpdf input.pdf output.pdf --rotate=+90:1  # 1페이지를 90도 회전

# 암호 제거
qpdf --password=mypassword --decrypt encrypted.pdf decrypted.pdf
```

### pdftk (사용 가능한 경우)
```bash
# 병합
pdftk file1.pdf file2.pdf cat output merged.pdf

# 분할
pdftk input.pdf burst

# 회전
pdftk input.pdf rotate 1east output rotated.pdf
```

## 공통 작업

### 스캔 PDF에서 텍스트 추출
```python
# 필요 패키지: pip install pytesseract pdf2image
import pytesseract
from pdf2image import convert_from_path

# PDF를 이미지로 변환
images = convert_from_path('scanned.pdf')

# 각 페이지에 OCR 적용
text = ""
for i, image in enumerate(images):
    text += f"Page {i+1}:\n"
    text += pytesseract.image_to_string(image)
    text += "\n\n"

print(text)
```

### 워터마크 추가
```python
from pypdf import PdfReader, PdfWriter

# 워터마크 생성 (또는 기존 파일 로드)
watermark = PdfReader("watermark.pdf").pages[0]

# 모든 페이지에 적용
reader = PdfReader("document.pdf")
writer = PdfWriter()

for page in reader.pages:
    page.merge_page(watermark)
    writer.add_page(page)

with open("watermarked.pdf", "wb") as output:
    writer.write(output)
```

### 이미지 추출
```bash
# pdfimages 사용 (poppler-utils)
pdfimages -j input.pdf output_prefix

# 모든 이미지를 output_prefix-000.jpg, output_prefix-001.jpg ... 형식으로 추출한다
```

### 암호 설정
```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
writer = PdfWriter()

for page in reader.pages:
    writer.add_page(page)

# 암호 추가
writer.encrypt("userpassword", "ownerpassword")

with open("encrypted.pdf", "wb") as output:
    writer.write(output)
```

## 빠른 참조

| 작업 | 추천 도구 | 명령/코드 |
|------|-----------|--------------|
| PDF 병합 | pypdf | `writer.add_page(page)` |
| PDF 분할 | pypdf | 페이지마다 파일 하나 |
| 텍스트 추출 | pdfplumber | `page.extract_text()` |
| 표 추출 | pdfplumber | `page.extract_tables()` |
| PDF 생성 | reportlab | Canvas 또는 Platypus |
| 명령줄 병합 | qpdf | `qpdf --empty --pages ...` |
| 스캔 PDF OCR | pytesseract | 먼저 이미지로 변환 |
| PDF 양식 채우기 | pdf-lib 또는 pypdf (FORMS.md 참고) | FORMS.md 참고 |

## 다음 단계

- 고급 pypdfium2 사용법은 REFERENCE.md를 본다
- JavaScript 라이브러리(pdf-lib)는 REFERENCE.md를 본다
- PDF 양식을 채워야 하면 FORMS.md의 지침을 따른다
- 문제 해결 가이드는 REFERENCE.md를 본다
