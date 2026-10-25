# HTML 출력 및 빌드

작업 공간은 Vite + React + TS 프로젝트이며 npm에서 `reacticle`(최신 배포판)을 가져옵니다. 글의 소스는 `article/main.tsx`에서 마운트되는 `article/Article.tsx`이며 여기서 테마를 고정합니다.

## 명령(작업 공간 루트에서 실행)

| 명령 | 기능 |
| --- | --- |
| `npm run dev` | 미리보기 서버 시작(Phase 4 / 5에서 작성과 동시에 확인). |
| `npm run build` | `tsc --noEmit` 타입 검사 **와** 자체 완결형 단일 페이지 HTML(`dist/index.html`) 빌드(CSS + JS 인라인)를 실행합니다. TS 오류가 있으면 빌드가 실패해 잘못된 결과가 전달되지 않습니다. |
| `npm run html` | `npm run build`(타입 검사 포함)를 실행한 뒤 단일 페이지 HTML을 `article/article.html`(**배포용 산출물**)로 복사합니다. |
| `npm run typecheck` | 타입 검사만 수행합니다. |

단일 파일은 `vite-plugin-singlefile`이 생성합니다. CSS와 JS가 모두 인라인되어 **오프라인에서 열고 공유할 수 있습니다.**

## 테마 변경

`article/main.tsx`에서 `<ThemeProvider theme="...">`의 값 하나를 바꿉니다. 컴포넌트 라이브러리에 등록된 runtime theme id만 허용됩니다: `tufte` / `press`.

## PDF(선택 · Checkpoint 3에서 요청된 경우)

자세한 내용은 `references/pdf-output.md`를 참고합니다. 기본 사용법은 다음과 같습니다.

```bash
npm run html                                                   # 先有 article/article.html
bash <path-to-beautiful-article>/scripts/html-to-pdf.sh        # → article/article.pdf
```


스크립트가 시스템의 chromium 계열 브라우저를 자동으로 찾고 HTML 헤더에 `@media print` 재정의를 삽입합니다(TOC를 좌우 배치에서 상하 배치로 바꿔 TOC가 한 페이지를 단독으로 차지). 그다음 headless 인쇄로 PDF를 만듭니다. npm 의존성도 Node도 필요하지 않습니다.

> PDF에서 Raw 인터랙션은 초기 상태만 렌더링할 수 있습니다. `interactive-explainer` 유형은 PDF 활용도가 낮을 수 있으므로 Checkpoint 3에서 사용자가 내보낼지 결정합니다.

“프롬프트 / 실행 항목 복사” 버튼이 필요하면 글에 `ExportBar`를 추가할 수 있습니다(PDF와 무관).

## 배포 전 점검

- `npm run html`이 성공하고 `article/article.html`을 브라우저에서 오프라인으로 열 수 있습니다.
- 콘솔 오류가 없으며 데스크톱과 모바일에서 읽을 수 있습니다. 텍스트 넘침 / 가림 / 비정상적인 빈 영역이 없습니다.
