# Source → Markdown

입력 형식과 관계없이 Phase 1에서는 먼저 통일된 `source/source.md`를 만들고 위험 요소를 `source/extraction-notes.md`에 기록합니다.

## 산출물

`source.md`에는 다음이 포함되어야 합니다. 제목 · 출처 · 작성자 / 날짜 / 링크(확인할 수 있는 경우) · 본문 · 표 · 이미지 자리표시자 · 코드 블록 · 인용 · 부록 / 각주.

`extraction-notes.md`에는 다음을 기록합니다. 입력 형식 · 추출 방법 · 누락 가능성이 있는 정보 · PDF/DOCX에서 안정적으로 복원할 수 없는 레이아웃 · 이미지 / 표 / 각주 / 코드가 온전히 보존됐는지 · 사용자가 보충해야 하는 자료나 맥락 · **원본 언어, 번역 필요 여부, 목표 언어, 번역본 파일명 및 번역 설명**.

## 언어와 번역

추출한 뒤 `source.md`의 언어를 확인하고 Phase 0에서 정한 목표 언어를 적용합니다.

- 목표 언어를 지정하지 않았거나 원본과 같으면 **번역하지 않습니다.** 최종 글의 언어는 원본 언어입니다.
- 목표 언어를 지정했고 원본과 다르면 `source/source.<lang>.md`(예: `source.zh.md` / `source.en.md`)를 만들어 Phase 2 이후의 **사실 기준 원본**으로 사용합니다. 기존 `source.md`는 참조용으로 보존합니다.
  - 번역 기준: **자연스럽고 번역투가 없어야 합니다.** 목표 언어의 표현 습관에 맞춰 문장을 재구성하며, 단어 대 단어로 옮기거나 부자연스러운 외국어 어순 / 수동형 반복 / 이질적인 문장 부호를 남기지 않습니다. 용어 / 숫자 / 코드 / 공식 / 인용은 정확히 보존합니다. 제목 계층, 구조, 정보 보존 비율은 유지합니다.
  - 원문 단계에서 한 번만 번역하고 이후의 편집, 어조 수정, 컴포넌트 구성은 번역본에 적용합니다.

## 입력 형식별 처리 원칙

| 입력 | 처리 방법 | 자체 점검 항목 |
| --- | --- | --- |
| URL | 웹페이지 본문을 가져오고 내비게이션 / 광고 / 추천을 제거 | 본문이 추출됐고 링크와 이미지가 보존됐는지 |
| PDF | 텍스트 / 절 / 표 / 이미지 자리표시자를 추출 | 줄바꿈 오류, 머리글 / 바닥글 혼입, 표 누락 |
| DOCX | 제목 계층 / 문단 / 표 / 이미지 자리표시자를 추출 | 스타일보다 구조와 내용의 완전성을 우선 |
| Markdown | 원래 제목 / 코드 블록 / 표 유지 | 원문을 지나치게 고쳐 쓰지 않기 |
| 일반 텍스트 | 구조를 파악하고 불확실한 부분 표시 | 계층을 임의로 만들어내지 않기 |
| 스크린샷 / 이미지 | 이미지 자리표시자와 설명을 만들고 용도를 기록 | `extraction-notes`에 남기고 사용자 확인 기다리기 |

## 추출 스크립트 선택

Skill에는 MarkItDown 기본 경로와 경량 fallback 두 가지가 있습니다. Agent는 Phase 1에서 입력 유형, 필요한 정보 보존 수준, 로컬 환경을 확인한 뒤 스크립트를 선택합니다.

### 1. MarkItDown 기본 경로

PDF / DOCX / PPTX / HTML 및 복잡한 문서, 특히 사용자가 정보 보존율 80–100%를 요구하면 `scripts/source-to-markdown-markitdown.py`를 우선 사용합니다.

```bash
python3.10 <path-to-beautiful-article>/scripts/source-to-markdown-markitdown.py <input> -o source/source.md
```


MarkItDown은 Python 3.10 이상이 필요합니다. 선택형 보조 의존성이며 컴포넌트 라이브러리나 스캐폴드에서 강제 설치하지 않습니다. 설치되어 있지 않으면 필요에 따라 설치 안내를 제공합니다.

```bash
python3.10 -m pip install "markitdown[pdf,docx]"
```


로컬에 `python3.10` 명령이 없고 `uv`가 있다면 MarkItDown을 포함한 임시 환경을 실행할 수 있습니다.

```bash
uv run --python 3.12 --with "markitdown[pdf,docx]" python \
  <path-to-beautiful-article>/scripts/source-to-markdown-markitdown.py <input> -o source/source.md
```


사용자가 PPTX / XLSX / 오디오 / YouTube / Azure 같은 추가 형식을 명시적으로 요청하지 않았다면 `markitdown[all]`을 기본으로 설치하지 않습니다. 패키지가 무겁고 환경 문제를 일으킬 가능성도 높아집니다.

### 2. 경량 fallback

MarkItDown을 사용할 수 없거나 Python 버전이 부족하거나 변환에 실패한 경우, 입력이 Markdown / TXT / 단순 HTML인 경우 `scripts/source-to-markdown.py`를 사용합니다.

```bash
python3 <path-to-beautiful-article>/scripts/source-to-markdown.py <input> -o source/source.md
```


스크립트가 사용할 수 있는 파서 라이브러리(pdfminer / pdfplumber / python-docx / BeautifulSoup)를 탐색합니다. 누락된 라이브러리는 설치 안내를 출력하고 가능한 범위에서 graceful fallback을 수행합니다. 스크립트는 **기계적 추출만** 담당합니다. 본문 정리, 자리표시자 표시, 위험 기록은 여전히 Agent가 수행합니다. URL은 Agent의 웹 페이지 가져오기 기능으로 직접 본문을 가져와 정리할 수도 있습니다.

### 3. Agent의 선택 규칙

- PDF / DOCX / PPTX / 복잡한 HTML: MarkItDown부터 시도합니다.
- Markdown / TXT: fallback을 바로 사용하고 원문 구조를 유지합니다. 불필요한 처리를 하지 않습니다.
- URL: Agent의 웹 가져오기 기능으로 본문을 받을 수 있습니다. HTML 파일로 이미 저장돼 있으면 복잡도에 따라 MarkItDown 또는 fallback을 선택합니다.
- 정보 보존율 100%: 추출 후 더 엄격하게 검사합니다. 필요하면 MarkItDown과 fallback을 둘 다 실행해 표 / 코드 / 각주 / 이미지 자리표시자가 누락됐는지 비교합니다.
- 스크립트의 결과는 `source.md` 초안일 뿐입니다. Agent가 노이즈를 정리하고 이미지 자리표시자를 추가하며 `source/extraction-notes.md`를 작성해야 합니다.

## Source 단계 자체 점검(주 Agent 인라인 · 체크리스트 5개)

원본 자료 확인은 **필수 하위 에이전트 검사 항목이 아닙니다.** Phase 2 전에 주 Agent가 어차피 `source.md`를 처음부터 끝까지 읽으므로, 이 다섯 항목을 확인하고 직접 수정하면 됩니다(별도의 review 파일은 필요 없음).

1. **완전성:** 내용이 잘렸는가? 양이 원문과 비슷한가(긴 PDF / 문서가 절반만 추출되거나 첫 화면만 들어오지 않았는가)?
2. **구조:** 제목 계층이 보존됐는가? 이후 절을 나눌 수 없게 본문 전체가 평탄화되지는 않았는가?
3. **핵심 매체:** 표 / 코드 / 공식 / 인용 / 각주가 보존됐고 손상되지 않았는가(표가 한 줄로 뭉치지 않음, 코드 들여쓰기 유지, 공식이 깨진 문자로 변하지 않음)?
4. **노이즈:** 내비게이션 / 광고 / 쿠키 배너 / 추천 읽을거리 / 머리글 / 바닥글 / 페이지 번호가 본문에 잘못 들어오지 않았는가? 인코딩은 괜찮은가(깨진 문자, 합자 `ﬁ`, 단어 안에 남은 soft hyphen, 두 단 PDF의 잘못된 읽기 순서)?
5. **불확실한 요소:** 이미지가 자리표시자로 표시됐는가? 불확실한 항목을 모두 `extraction-notes.md`에 적었는가?

> ⚠️ 위 1 / 4는 Markdown만 읽어도 찾을 수 있지만 **2 / 3의 “조용히 사라진” 표 / 문단**은 원문과 대조하지 않으면 확인할 수 없습니다. 반드시 `original.*`을 확인합니다.

## 독립 Source Reviewer로 상향하는 경우(복잡하거나 신뢰도가 낮은 원본만)

**다음 조건에 해당할 때만** 별도의 하위 에이전트를 실행합니다. `extraction-notes.md`에 “신뢰도 낮음 / 복잡한 PDF/DOCX / 변환 결과 불확실 / 100% 보존이 필요한 핵심 자료”가 기록돼 있어야 합니다. 원본과 대조하는 diff식 검사를 **필수로** 수행하고 `review/source-review.md`에 기록합니다.

```text
请作为 Source Reviewer。同时读取 source/original.*（原件）和 source/source.md（转换产物）。
逐项做 diff 式核查：对照原件，source.md 是否漏掉了表格 / 段落 / 脚注 / 代码 / 图，
是否混入噪音，是否有结构塌陷或编码损坏。
只输出"按出现顺序的差异清单 + 必须修复项"，不评价文章好不好看，不要替我改文件。
```

