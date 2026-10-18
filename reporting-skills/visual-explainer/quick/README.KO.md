# Quick 렌더러

에이전트는 간결한 JSON 스펙을 생성하고, `render.mjs`가 이를 검증한 뒤 자체 포함형 HTML 페이지 하나를 씁니다. Pi의 경우:

```json
{
  "action": "render_quick",
  "filename": "auth-flow-quick",
  "spec": {
    "title": "Authentication flow",
    "sections": [
      {
        "title": "Request path",
        "flow": {
          "nodes": [
            { "id": "browser", "label": "Browser" },
            { "id": "api", "label": "API", "tone": "positive" }
          ],
          "edges": [{ "from": "browser", "to": "api", "label": "token" }]
        }
      }
    ]
  }
}
```

그 외 환경에서는 스펙을 저장한 뒤 `node <skill>/quick/render.mjs spec.json ~/.agent/diagrams/auth-flow-quick.html`을 실행하세요. 오류가 나면 전체 페이지를 대신 작성하세요.

`schema.json`이 권위 있는 스키마입니다. 스펙에는 `title`, 선택 항목인 `subtitle`과 `summary`, 그리고 하나 이상의 `sections`가 있으며, 각 섹션에는 다음 중 하나 이상이 올 수 있습니다: `cards`(발견 사항 또는 개념), `table`(열과 문자열 행), `risks`(심각도 태그), `files`(경로, 세부 정보, 변경 상태), `steps`(순서가 있는 작업 또는 타임라인), `flow`(노드와 방향 엣지), `callouts`(메모, 결정, 경고), `evidence`(라벨, 값, 선택적 출처). 모든 텍스트는 HTML 이스케이프됩니다. 알 수 없는 속성, 잘못된 enum 값, 잘못된 flow 참조, 열 개수가 맞지 않는 행은 검증에 실패합니다.
