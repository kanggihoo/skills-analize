# minimax-pdf 분석

## 원본

- 경로: `.agents/skills/minimax-pdf/SKILL.md`
- 성격: 디자인 품질이 중요한 PDF 생성, 양식 채움, 리포맷 스킬
- 주요 도구: Python, ReportLab, pypdf, Node.js, Playwright

## 적용 조건

PDF 생성, 보고서/제안서/이력서/전문 문서, PDF form fill, 기존 문서 리스타일링, Markdown/text/PDF를 보기 좋은 PDF로 변환하는 작업에 사용한다. 외관이 중요할 때 우선 적용한다.

## 동작 과정

1. CREATE/REFORMAT 작업 전 `design/design.md`를 읽는다.
   디자인 token 기반 시스템을 먼저 이해한다.

2. 작업 유형을 라우팅한다.
   새 PDF 생성은 CREATE, 기존 PDF 필드 채움은 FILL, 기존 문서에 디자인을 입히는 것은 REFORMAT이다.

3. CREATE는 full pipeline을 탄다.
   `palette.py`로 design token을 만들고, `cover.py`, `render_cover.js`, `render_body.py`, `merge.py`로 표지와 본문을 합친다.

4. 문서 유형에 맞는 visual identity를 고른다.
   report, proposal, resume, portfolio, academic, minimal, editorial, magazine, terminal 등 type별 cover pattern과 font/색감이 있다.

5. content.json block을 구성한다.
   h1, h2, body, bullet, numbered, callout, table, image, figure, code, math, chart, flowchart, bibliography, pagebreak 등을 사용한다.

6. FILL은 기존 레이아웃을 건드리지 않는다.
   먼저 `fill_inspect.py`로 exact field names를 확인하고 `fill_write.py`로 값만 채운다.

7. REFORMAT은 기존 문서를 parse해 CREATE pipeline으로 보낸다.
   `.md`, `.txt`, `.pdf`, `.json`을 지원한다.

8. 환경을 확인한다.
   `bash scripts/make.sh check`, 필요 시 `fix`, 샘플은 `demo`로 확인한다.

## 핵심 규칙

- CREATE/REFORMAT 전 `design/design.md`를 읽는다.
- accent color는 문서 의미와 업계/대상에 맞춰 선택한다.
- vividly saturated primary color보다 muted/dark neutral accent를 선호한다.
- form fill은 field name을 inspect한 뒤 정확한 이름으로 채운다.
- 기존 PDF form fill에서는 레이아웃과 디자인을 변경하지 않는다.

## 산출물 특성

출력은 print-ready PDF다. 표지와 본문이 token-based design system으로 연결되어 일관된 색, 타이포그래피, spacing을 가진다.

## 주의점

cover rendering은 Node.js/Playwright에 의존하고, body rendering은 Python 패키지에 의존한다. 환경 체크를 생략하면 pipeline 중간에서 실패할 수 있다.
