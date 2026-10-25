# PDF 출력(선택)

납품용 단일 HTML(`article/article.html`)을 PDF로 변환합니다. **Phase 8 Delivery에서 선택적으로 진행합니다.** Checkpoint 3에서 사용자가 “통과 · HTML + PDF 함께 내보내기”를 선택하면 실행하고, 선택하지 않으면 아무것도 하지 않습니다.

> HTML이 여전히 기본 납품물입니다. 오프라인에서 열 수 있고 공유할 수 있으며 브라우저에서 Raw 인터랙션을 온전히 경험할 수 있습니다. PDF는 “보관 / 인쇄 / 이메일 첨부 / 오프라인 읽기”를 위한 보조 형식입니다. **PDF에서는 Raw 인터랙션이 초기 상태로만 렌더링됩니다.**

---

## 빠른 사용법

```bash
# 工作区根目录
npm run html                                                    # 先确保有 article/article.html
bash <path-to-beautiful-article>/scripts/html-to-pdf.sh         # 默认 article/article.html → article/article.pdf
bash <path-to-beautiful-article>/scripts/html-to-pdf.sh in.html out.pdf  # 自定义路径
```


이 bash 호출을 작업 공간의 `package.json` scripts에 추가해 사용자가 `npm run pdf`로 실행하도록 할 수도 있습니다. 경로는 사용자의 머신에 설치된 Skill의 절대 경로이므로 **스캐폴드 템플릿에 고정하지 않습니다.**

---

## 사전 조건

컴퓨터에 chromium 계열 브라우저가 설치되어 있어야 합니다. 스크립트가 다음 순서로 자동 검색합니다.

```text
chromium / chromium-browser / google-chrome / google-chrome-stable / chrome
brave-browser / microsoft-edge
/Applications/Google Chrome.app/...
/Applications/Chromium.app/...
/Applications/Microsoft Edge.app/...
/Applications/Brave Browser.app/...
/Applications/Arc.app/...
/usr/bin/chromium / /snap/bin/chromium
```


**브라우저를 찾지 못해도** 스크립트는 오류로 종료하지 않고 대체 방법을 안내합니다. 인쇄 CSS를 주입한 임시 HTML 경로를 출력하므로 사용자가 브라우저에서 열어 수동으로 `Cmd+P` / `Ctrl+P` → “PDF로 저장”을 선택하면 됩니다.

Node / npm 패키지 / puppeteer / playwright / weasyprint에는 의존하지 않습니다. 일부러 시스템에 이미 설치된 브라우저만 사용합니다. 별도 환경 설정이 필요하지 않습니다.

---

## 설계 원리(중요 · 스타일 수정 전 먼저 읽기)

### 1. reacticle을 수정하지 않고 print CSS를 주입하는 이유

reacticle의 TOC는 데스크톱에서 **좌우 그리드**(`.ra-article-layout--with-toc`는 2열 `display: grid`, TOC | 본문)를 사용하고 모바일(≤999px)에서만 단일 열 `display: block`으로 바뀝니다.

PDF를 읽을 때는 TOC 다음에 본문이 오는 **상하 배치**가 자연스럽고 모바일과도 일치합니다. 가장 간단한 구현은 PDF 생성 시 `@media print` CSS를 **주입해** `display: block`을 강제하는 것입니다. 모바일 스타일 분기를 재사용하는 셈입니다.

- **reacticle을 수정하지 않습니다.** 어떤 버전의 reacticle에서도 스크립트로 적절한 PDF를 만들 수 있습니다.
- **사용자 `Article.tsx`를 수정하지 않습니다.** 소스는 영향을 받지 않습니다.
- **CSS는 인쇄에만 적용합니다.** 브라우저에서 HTML을 볼 때는 좌우 그리드가 유지됩니다.

### 2. 주입하는 규칙

CSS는 별도 파일인 **`scripts/pdf-print-overrides.css`**(스크립트와 같은 디렉터리)로 분리되어 있으며 세 그룹으로 구성됩니다.

```text
A · TOC 排版（让 TOC 上 / 正文下）
  A1) .ra-article-layout--with-toc { display: block }   → 塌成单列
  A2) .ra-toc { position: static; page-break-after: always } → 解 sticky + 独占首页
  A3) .ra-toc__list { column-count: 2 }                 → 长 TOC 双列省纸
  A4) .ra-toc__item { break-inside: avoid }             → TOC 项不被列间撕开
  A5) .ra-article-layout--with-toc > .ra-article        → 正文在 TOC 后自然流
  A6) .ra-toc a / .ra-article a { text-decoration: none } → 关闭打印链接下划线

B · 分页行为（修长文章的大块空白页）
  B1) .ra-section / .ra-subsection { break-inside: auto !important }
        → 撤销 reacticle print.css 里的 break-inside: avoid-page。
          对长 Section 来说，那条规则会把整节推到下一页、留前一页大半空白。
  B2) h1-h4 + .ra-section__head + .ra-subsection__head { break-after: avoid }
        → 标题不被孤儿化（不会孤零零卡在页底，下面是空白）
  B3) .ra-hero / .ra-lead / .ra-conclusion { break-inside: avoid }
        → 短的开场 / 收束块原子化，不撕开
  B4) p / li / blockquote { orphans: 3; widows: 3 }
        → 段落不留 1-2 行寡行
  B5) figure / .ra-table / .ra-codeblock / .ra-formula / .ra-image / .ra-raw
        { break-inside: avoid }
        → 图表、表格、代码块、Raw 块尽量整块；过高时浏览器仍会自动 fallback 分页

C · 封面（若文章有 3:4 封面，让它独占 PDF 首页）
  C1) .ra-cover { break-after: always; break-inside: avoid }
        → 屏幕和 PDF 都保持 3:4 书封；打印时 TOC 从第二页开始
        → 详见 references/cover.md
```


주석이 포함된 전체 CSS는 `scripts/pdf-print-overrides.css`에서 확인합니다. 스타일(페이지 나누기 정책, 2단 레이아웃 기준 변경, 인쇄용 워터마크 추가 등)을 조정하고 싶다면 bash 스크립트를 만지지 말고 **이 파일을 직접 수정합니다.**

> **CSS를 별도 파일로 둔 이유:** macOS 기본 BSD awk는 `-v inject="$INLINE_CSS"`처럼 여러 줄 문자열을 전달하면 `newline in string` 오류를 내지만 GNU awk에서는 동작합니다. CSS를 파일로 분리하고 awk에서 `getline < file`로 읽으면 양쪽 awk에서 모두 처리할 수 있습니다. CSS를 독립적으로 편집 / lint / diff할 수 있는 리소스로 관리할 수도 있습니다.

reacticle의 `print.css`도 계속 적용됩니다(흰 바탕 / 검은 글자, export bar 숨김, `break-inside: avoid` 등). 이 스크립트는 TOC 레이아웃 규칙만 추가합니다.

### 3. 렌더링 흐름

```
article.html  ──── awk 注入 print CSS ────  /tmp/article-print.html
                                                  │
                                                  ▼
                  探测的浏览器 --headless --print-to-pdf
                                                  │
                                                  ▼
                                          article.pdf
```


Chrome 플래그:

- `--headless=new`(구버전에서는 `--headless`로 fallback): 브라우저 창 없이 실행.
- `--no-pdf-header-footer` / `--print-to-pdf-no-header`: 브라우저 기본 URL / 날짜 / 페이지 번호를 제거합니다(colophon 역할을 뒤집지 않도록).
- `--virtual-time-budget=5000`: 페이지 JS 초기화에 5초를 줘 캡처 전 Raw 컴포넌트, KaTeX, Prism 등이 렌더링되도록 합니다.
- `--hide-scrollbars` / `--disable-gpu` / `--no-sandbox`: 깨끗한 출력에 사용합니다.

### 4. PDF에서 Raw 인터랙션은 어떻게 되나요?

PDF는 **정적 문서**입니다. 모든 Raw 인터랙션(슬라이더, 버튼, 애니메이션, canvas, 동영상)은 **초기 상태**만 렌더링할 수 있습니다. 설계 시 다음을 고려합니다.

- **interactive-explainer 유형:** 핵심이 “직접 조작”이므로 PDF의 가치가 제한적입니다. 사용자는 Plan 단계에서 PDF를 내보내지 않도록 선택할 수 있습니다.
- **그 외 유형:** Raw는 보통 흐름도 / SVG / 추세 그래프 같은 보조 도식입니다. 초기 상태만으로도 이해할 수 있다면 PDF에서 문제없습니다.
- **Raw 안의 콘텐츠가 hover / click 후에만 표시될 때:** 작성 중 “인쇄 친화적인가?”를 고려합니다. 중요한 콘텐츠를 기본 표시하거나 `print:` 스타일을 이용해 인쇄 시 hover 상태를 강제로 펼칩니다.

---

## 문제 해결

### 브라우저를 찾지 못함

스크립트가 인쇄 CSS가 주입된 임시 HTML의 경로를 출력하므로 수동으로 Cmd+P를 실행합니다.

### PDF에서 TOC가 페이지 나눔을 지키지 않거나 본문과 붙어 있음

일부 구형 Chromium은 `page-break-after: always`를 다르게 처리합니다. 다음 방법을 시도합니다.

- Chrome을 최신 주요 버전으로 업그레이드합니다.
- 또는 수동 Cmd+P 대화상자에서 “양면 / 배율 / 사용자 지정 여백” 설정을 조정합니다.

### PDF 페이지 나눔이 이상하거나 넓은 빈 페이지가 생기거나 제목만 페이지 아래에 남음

대개 일부 “원자적 블록”에 강제로 페이지 나눔을 금지해 블록 전체가 다음 페이지로 이동한 경우입니다. `pdf-print-overrides.css`를 확인합니다.

- **B1이 적용됐는지** DevTools Print Preview에서 `.ra-section`의 `break-inside` 값을 확인합니다. reacticle `print.css`에는 `!important`가 없으므로 이쪽의 `!important`가 우선되어야 합니다.
- 직접 작성한 **Raw 블록**에 `style={{ breakInside: 'avoid' }}` 또는 유사한 CSS가 인라인으로 있는지 확인하고 제거합니다.
- 제목이 항상 페이지 아래에 홀로 남지 않게 하려면 B2의 `break-after: avoid`를 `break-before: avoid; break-after: avoid`로 바꿉니다. 더 강한 방법이지만 종이 공간 활용이 조금 나빠질 수 있습니다.

### PDF에서 Raw가 완전히 렌더링되지 않거나 차트가 비어 있음

- `--virtual-time-budget`를 늘립니다(스크립트에서 5000을 10000 이상으로 변경).
- Raw의 JS가 DOMContentLoaded 안에서 동기적으로 렌더링되는지 확인합니다. 원격 이미지 / 데이터처럼 비동기 로딩되는 항목은 캡처 전에 준비되지 않을 수 있습니다.
- Raw를 SSR 가능한 초기 상태 + 클라이언트 hydrate 방식으로 바꿉니다. “JS가 실행된 뒤에야 볼 수 있는” 방식은 피합니다.

### PDF에서 글꼴이 브라우저와 다름

테마가 원격 `@font-face`를 사용하나요? headless Chrome은 원격 글꼴이 로드될 때까지 기본적으로 기다리지 않습니다. 다음을 고려합니다.

- 시스템 글꼴 fallback을 사용합니다(권장, 대부분의 테마에서 이미 적용).
- HTML 안에 글꼴을 `data:`로 인라인합니다. vite-plugin-singlefile은 정적 에셋을 처리하지만 woff 글꼴 처리 여부는 테마 구현을 확인해야 합니다.

### 페이지 여백 / 용지 크기 사용자 지정

Chromium의 `--print-to-pdf`는 명령행에서 페이지 크기나 여백을 지정하는 기능을 제공하지 않습니다. 현재 CSS는 테마 색상이 전체 페이지에 깔리도록 `@page { margin: 0 }`을 쓰고, `.ra-root { padding: 0.45in }`으로 콘텐츠 여백을 줍니다. 여백을 바꾸려면 `scripts/pdf-print-overrides.css`의 `.ra-root` print padding을 우선 조정합니다.

사용자가 정말 사용자 지정을 원하면 다음 방법을 권합니다.

1. 브라우저 GUI에서 인쇄(Cmd+P) — 여백 / 용지 / 배율을 조정할 수 있습니다.
2. 사용자 지정을 지원하는 `html-to-pdf-puppeteer.sh` 파생 스크립트를 별도로 만듭니다. 현재 스크립트는 Chrome 기본 용지 크기(미국 Letter / 그 외 지역 A4)를 사용합니다.

---

## Skill 작업 흐름과의 관계

| 단계 | 트리거 | 동작 |
| --- | --- | --- |
| Phase 8 Delivery | Checkpoint 3에서 “통과 · HTML + PDF 함께 내보내기” 선택 | `npm run html` 실행 → `bash <skill>/scripts/html-to-pdf.sh` 실행 → `article.html` + `article.pdf` 전달 |
| Checkpoint 3의 다른 선택지 | “통과 · HTML 납품” 선택 | PDF 생성 안 함 |
| 사용자가 나중에 PDF 추가 요청 | 언제든지 | 작업 공간 루트에서 `bash <skill>/scripts/html-to-pdf.sh` 실행 |

---

## 하지 않는 일

- ❌ 스캐폴드 과정에서 PDF 관련 npm 패키지를 강제로 설치하지 않습니다(스캐폴드를 가볍게 유지).
- ❌ Checkpoint 3에서 “PDF 내보내기”를 기본 선택하지 않습니다(PDF는 주 납품물이 아님).
- ❌ PDF가 필요한지 대신 결정하지 않습니다. Checkpoint 3에서 사용자가 독립적으로 선택합니다.
- ❌ PDF 지원을 위해 reacticle을 수정하지 않습니다(CSS 주입이 더 가볍고 reacticle 버전과 분리되어 있음).
