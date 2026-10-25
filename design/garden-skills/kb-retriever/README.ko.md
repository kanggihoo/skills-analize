# Kb Retriever Skill — 로컬 지식 베이스 검색기

> AI 에이전트가 **여러 형식의 로컬 지식 디렉터리**에서 계층형 인덱스 탐색과 점진적 검색으로 질문에 효율적으로 답하도록 돕는 스킬입니다. 파일 전체를 컨텍스트에 로드하지 않습니다.

[中文文档](./README.zh-CN.md) · [컬렉션 루트로 돌아가기](../../README.md)

![Kb Retriever Skill](../../dist/imgs/covers/kb-retriever.webp)

## 기능

Markdown, PDF, Excel 등 여러 형식의 파일이 있는 로컬 디렉터리를 에이전트에 지정하고 자연어로 질문합니다. 이 스킬은 다음 절차를 수행합니다.

1. `data_structure.md` 계층 인덱스를 따라가며 답변이 들어 있을 가능성이 높은 파일을 찾습니다.
2. PDF 또는 Excel을 만나면 파일 전체를 무작정 읽는 대신 해당 `references/*.md`를 먼저 읽고 권장 도구를 사용하도록 합니다.
3. 파일 전체를 컨텍스트에 덤프하지 않고 `grep` + 작은 범위의 부분 읽기(offset/limit)로 점진적으로 검색합니다.
4. 답변 근거가 충분해질 때까지 최대 5회 반복하며 매번 키워드 범위를 좁힙니다.

---

## 주요 기능

- ✅ **다중 형식 지원**: Markdown / 텍스트, PDF, Excel. 파일 유형별로 확장 가능.
- ✅ **계층형 인덱스**: 각 디렉터리에 자체 `data_structure.md`가 있어 에이전트가 탐색하는 인덱스 트리를 이룸.
- ✅ **점진적 검색**: grep 우선, 구간 읽기, 파일 전체 로드 금지. 대용량 코퍼스에서도 토큰 사용량을 낮게 유지.
- ✅ **필수 사전 학습 단계**: PDF / Excel 처리는 알맞은 `references/*.md`를 먼저 읽어야 시작 가능.
- ✅ **제한된 반복**: 명시적인 종료 조건과 함께 검색 라운드를 최대 5회로 제한.

---

## 스킬 구조

```text
skills/kb-retriever/
├── SKILL.md                            Main skill (frontmatter name: kb-retriever)
├── README.md  /  README.zh-CN.md       This document
├── references/
│   ├── pdf_reading.md                  How to handle PDFs (pdftotext / pdfplumber / pypdf)
│   ├── excel_reading.md                How to read Excel with pandas (nrows, dtype, etc.)
│   └── excel_analysis.md               How to filter / aggregate / derive metrics on Excel
└── scripts/
    └── convert_pdf_to_images.py        Convert PDF pages to images when text extraction fails
```

---

## 지식 베이스 설정

이 스킬에는 **지식 베이스가 포함되어 있지 않습니다**. 사용자가 직접 준비해야 합니다. 연결 방법은 두 가지입니다.

### 기본 위치

에이전트를 실행하는 작업 공간의 루트에 `knowledge/` 디렉터리를 둡니다.

```text
your-project/
├── .claude/skills/  or  .agents/skills/
│   └── kb-retriever/             ← 이 스킬 폴더
└── knowledge/                    ← ← ← 사용자 지식 베이스
    ├── data_structure.md         (루트 인덱스, 아래 템플릿 참고)
    ├── <domain-1>/
    │   ├── data_structure.md
    │   └── ...
    └── <domain-2>/
        └── ...
```

### 사용자 지정 위치

질문에서 사용할 경로를 알려 줍니다. 예: *"`./docs`에서 답해 줘"* 또는 *"내 지식 베이스는 `/data/kb`에 있어"*. 스킬은 해당 경로를 사용합니다.

기본 `knowledge/`가 없고 사용자가 경로를 지정하지 않았다면 추측하지 말고 물어봅니다.

### `data_structure.md` 템플릿

인덱싱하는 디렉터리마다 다음과 같은 파일을 둡니다.

```markdown
# [Directory name]

## Purpose
What this directory is for and when it should be searched.

## Files
- file1.pdf — what it contains, time / version range
- file2.xlsx — schema summary, key columns
- subdir/ — what lives in this subdirectory

## Coverage
Time range, version, source, anything else that helps the agent prioritize.
```

---

## 검색 방식

### 1. 계층형 인덱스 탐색

각 디렉터리 수준에서 `data_structure.md`를 읽고 사용자 질문과 가장 관련된 하위 디렉터리 / 파일을 선택한 뒤 재귀적으로 탐색합니다. 따라서 트리 전체를 한꺼번에 훑지 않습니다.

### 2. 처리 전 학습(PDF / Excel)

후보 파일에 PDF 또는 Excel이 있으면 해당 참고 문서를 먼저 읽어야 합니다.

```text
✅ references/pdf_reading.md / excel_reading.md / excel_analysis.md 읽기
✅ 권장 도구와 플래그 이해
✅ 해당 도구로 파일 변환 / 추출
⏭️  그 후 검색 시작
```

금지 사항:

- ❌ `pdf_reading.md`를 읽지 않고 PDF 처리를 시도
- ❌ `excel_reading.md` / `excel_analysis.md`를 읽지 않고 Excel 처리를 시도
- ❌ 변환 단계를 건너뛰고 원시 바이너리를 grep

### 3. 점진적 검색

- 파일 전체를 읽지 않습니다.
- `grep`으로 먼저 키워드를 찾습니다.
- 일치한 구간만 읽습니다(`limit` 약 200~500줄).
- 최대 5회 반복하며 키워드를 구체화합니다.

### 4. 파일 형식별 도구 전략

| 형식 | 도구 | 참고 |
|---|---|---|
| Markdown / 텍스트 | `grep` + 구간 지정 `read_file` | 항상 offset/limit을 지정하고 파일 전체를 읽지 않음. |
| PDF | `pdftotext input.pdf output.txt` → 추출한 텍스트에서 `grep` | **항상 파일로 추출**하고 stdout으로 내보내지 않음. 대용량 PDF는 페이지 범위에 `-f / -l` 사용. |
| Excel | 먼저 `nrows`로 스키마 확인 후 pandas로 필터링 읽기 | 질의 전에 핵심 열(id / time / category) 확인. |

### 5. 반복 검색 루프

각 라운드에서:

1. 키워드 생성 / 업데이트
2. 충분히 탐색하지 않은 후보 파일 선택
3. grep / 구간 읽기 실행
4. 발췌 내용 확인
5. 답변 근거가 충분한지 판단. 충분하면 중단하고, 아니면 반복

답변 근거를 찾았거나 검색 라운드 5회에 도달하면 종료합니다.

---

## 모범 사례

### 권장

1. 항상 `data_structure.md`에서 시작합니다.
2. PDF 또는 Excel을 다루기 전에 해당 `references/*.md`를 읽습니다.
3. 가장 관련 있는 파일부터 검색하고 필요한 경우에만 범위를 넓힙니다.
4. 정확한 구간만 읽도록 `offset` + `limit`을 사용합니다.
5. PDF는 파일로 추출한 뒤 grep하고 바이너리를 컨텍스트에 붙여 넣지 않습니다.

### 피해야 할 사항

1. ❌ 용량이 큰 파일을 한 번에 전부 읽기.
2. ❌ 참고 문서를 먼저 읽지 않고 PDF / Excel 처리.
3. ❌ `pdftotext input.pdf -`(stdout) 사용 — 토큰을 많이 소모함.
4. ❌ Excel 시트 전체를 한 번에 로드.
5. ❌ 모든 디렉터리를 무차별적으로 검색.

---

## 자주 묻는 질문

**Q1: 왜 에이전트가 먼저 `references/*.md`를 읽게 하나요?**
올바른 플래그와 도구를 사용하게 하기 위해서입니다. 그렇지 않으면 파일 전체를 컨텍스트에 덤프하거나 느리거나 작동하지 않는 도구를 선택하는 경향이 있습니다.

**Q2: 아주 큰 PDF는 어떻게 처리하나요?**
페이지 범위를 지정해 추출합니다(`pdftotext -f 1 -l 10`). 결과 텍스트를 grep한 다음 일치하는 페이지만 읽습니다.

**Q3: 지식 베이스를 어디에나 둘 수 있나요?**
네. 질문에서 경로를 알려 주세요. 예: *"`/data/my-kb`에서 답해 줘"*.

**Q4: 검색 정확도를 높이려면 어떻게 하나요?**
구체적인 키워드를 쓰고 시간 / 파일 이름 힌트로 범위를 좁히며 일반적인 단어보다 도메인 용어를 우선합니다.

---

## 도구 요구 사항

이 스킬은 에이전트가 다음 도구를 사용할 수 있다고 가정합니다.

- `grep` — 텍스트 검색
- `read_file` — offset / limit을 지정한 구간 읽기
- `pdftotext`(poppler) 또는 `pdfplumber` — PDF 텍스트 추출
- `pandas` — Excel 읽기 및 분석

텍스트 추출이 유용한 결과를 내지 못하는 스캔 PDF의 대체 처리용으로 `scripts/convert_pdf_to_images.py`를 제공합니다.

---

## 라이선스

MIT
