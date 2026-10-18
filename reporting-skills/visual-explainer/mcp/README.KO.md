# Visual Explainer MCP 서버

이 디렉터리에는 visual-explainer용 로컬 Model Context Protocol 서버가 들어 있습니다.

## 범위

이 서버는 stdio 전용입니다. 로컬 자식 프로세스를 실행하는 MCP 호스트를 위한 것입니다.
HTTP 리스너를 시작하지 않고, 자격 증명을 다루지 않으며, LLM을 호출하지 않고, 로컬 머신 밖에 출력을 저장하지 않습니다.

렌더링된 파일은 설정된 출력 디렉터리 안에만 기록됩니다. 기본값은 `~/.agent/diagrams/`입니다. `VISUAL_EXPLAINER_OUTPUT_DIR`을 설정하면 같은 머신의 다른 디렉터리로 이 제한 영역을 옮길 수 있습니다. 설정하지 않으면 기본 경로는 그대로 유지됩니다. 설정된 제한 디렉터리는 자기 자신으로 resolve되어야 하며, 심볼릭 링크 경로(macOS `/tmp` 포함)는 아무것도 생성되기 전에 거부됩니다. 기본 디렉터리는 심볼릭 링크된 `~/.agent`를 따라갑니다. 렌더링 대상은 기존 심볼릭 링크를 거부하며, 임시 파일을 거쳐 이름을 바꾸는 방식으로 기록됩니다. 검증과 기록 사이에 다른 로컬 사용자가 렌더링 대상을 교체하지 못하도록, 사용자 본인만 쓸 수 있는 디렉터리를 선택하세요. 누구나 쓸 수 있거나 그룹이 쓸 수 있는 공유 폴더는 피하세요. 파일 이름은 basename이어야 합니다. 경로, 상위 디렉터리 탐색(traversal), 제어 문자, 심볼릭 링크 대상은 거부됩니다.

## 패키지 설치본에서 실행

```json
{
  "mcpServers": {
    "visual-explainer": {
      "command": "visual-explainer-mcp"
    }
  }
}
```

## 체크아웃에서 실행

먼저 의존성을 설치하세요:

```bash
npm install --no-package-lock
```

그다음 호스트가 서버 진입점을 가리키도록 설정하세요:

```json
{
  "mcpServers": {
    "visual-explainer": {
      "command": "node",
      "args": ["/absolute/path/to/visual-explainer/plugins/visual-explainer/mcp/server.mjs"]
    }
  }
}
```

## 제공되는 도구

- `visual_explainer_prepare`: 권장 시각 설명 흐름을 반환합니다. 파일을 쓰지 않습니다.
- `visual_explainer_render_html`: 완전한 HTML 문서를 검증한 뒤 설정된 출력 디렉터리(기본값 `~/.agent/diagrams/`)에 씁니다.
- `visual_explainer_render_quick`: Quick 모드 JSON 스펙을 검증한 뒤 렌더링된 HTML을 설정된 출력 디렉터리(기본값 `~/.agent/diagrams/`)에 씁니다.

렌더링 도구의 기본값은 `open: false`입니다. 서버가 브라우저나 Glimpse 창을 요청하기를 원할 때만 `open: true`를 설정하세요.

## 제공되는 프롬프트

서버는 번들된 명령 템플릿을 MCP 프롬프트로 제공합니다:

- `generate-web-diagram`
- `generate-visual-plan`
- `generate-slides`
- `generate-video`
- `diff-review`
- `plan-review`
- `project-recap`
- `fact-check`

템플릿의 `$@` 인수를 채우려면 `request`를 전달하세요.

## 제공되는 리소스

서버는 표준 스킬, 명령 템플릿, Quick 모드 계약에 대한 읽기 전용 리소스를 제공합니다:

- `visual-explainer://skill/SKILL.md`
- `visual-explainer://commands/*.md`
- `visual-explainer://quick/README.md`
- `visual-explainer://quick/schema.json`
