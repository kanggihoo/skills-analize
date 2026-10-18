# 최선 노력(best-effort) PPTX 내보내기

`visual-explainer-pptx`는 생성된 visual-explainer HTML 슬라이드 덱을 정적 `.pptx` 파일로 변환합니다.

HTML 덱이 원본(source of truth)입니다. 이 내보내기 도구는 의도적으로 최선 노력 방식이며, `<section class="slide">` 요소를 사용하는 단순한 덱을 지원합니다. 슬라이드 제목, 짧은 텍스트, 글머리 기호, 단순한 표, 코드 블록, Mermaid 소스 자리표시자를 추출합니다.

다음은 보존하지 않습니다:

- 애니메이션 또는 전환 효과;
- 리더 레일, 목차, 도움말, 딥 링크, 이어보기 상태;
- 반응형 레이아웃;
- 사용자 지정 웹 폰트;
- 실시간 Mermaid 렌더링, Chart.js, SVG, canvas 또는 JavaScript 동작.

## 사용법

패키지 설치본에서:

```bash
visual-explainer-pptx ~/.agent/diagrams/my-deck.html ~/.agent/diagrams/my-deck.pptx
```

체크아웃에서는 먼저 의존성을 설치하세요:

```bash
npm install --no-package-lock
node plugins/visual-explainer/pptx/export.mjs ~/.agent/diagrams/my-deck.html ~/.agent/diagrams/my-deck.pptx
```

출력 경로를 생략하면 입력 파일 옆에 `.pptx` 접미사를 붙여 저장합니다.

최종 충실도가 필요하면 HTML 출력을 사용하세요. 프레젠테이션 파일이 꼭 필요할 때는 휴대 가능한 정적 전달본으로 `.pptx`를 사용하세요.
