# mcp-builder 분석

## 원본

- 원본 경로: `.agents/skills/mcp-builder/`
- 핵심 파일: `SKILL.md`
- 보조 파일: `reference/`, `scripts/`, `example_evaluation.xml`, `requirements.txt`
- 확인한 규모: 10개 파일, 약 3,532줄
- 성격: 고품질 MCP 서버를 설계, 구현, 테스트, 평가하는 개발 가이드 스킬

## 적용 조건

사용자가 MCP server를 만들거나 외부 API/service를 LLM tool로 연결하려고 할 때 사용한다. Python FastMCP 또는 Node/TypeScript MCP SDK 기반 구현 모두를 다룬다.

## 동작 과정

1. Phase 1: Deep Research and Planning
   MCP protocol, transport, tool/resource/prompt 개념, 대상 API 문서, authentication, data model을 조사한다.

2. API coverage와 workflow tool 사이의 균형을 잡는다.
   불확실하면 comprehensive API coverage를 우선하되, 실제 agent workflow를 돕는 고수준 도구도 고려한다.

3. framework를 선택한다.
   추천은 TypeScript + MCP TypeScript SDK이며, remote는 streamable HTTP, local은 stdio transport를 사용한다.

4. Phase 2: Implementation
   API client, authentication, error handling, response formatting, pagination 같은 shared infrastructure를 만든다.

5. tool을 구현한다.
   TypeScript는 `server.registerTool()`과 Zod, Python은 `FastMCP`와 Pydantic model을 사용한다.

6. 각 tool에는 명확한 name, description, input schema, output schema/structured content, annotations를 제공한다.

7. Phase 3: Review and Test
   TypeScript는 `npm run build`, Python은 `python -m py_compile` 또는 inspector 테스트를 수행한다.

8. Phase 4: Create Evaluations
   read-only, independent, non-destructive, stable한 10개 evaluation question을 만든다.

9. evaluation script를 사용해 MCP server가 실제로 LLM에게 유용한지 검증한다.

## reference와 script 역할

- `reference/mcp_best_practices.md`: server/tool naming, response format, pagination, transport, security, error handling 규칙
- `reference/node_mcp_server.md`: TypeScript MCP SDK, `registerTool`, Zod, streamable HTTP/stdio, build checklist
- `reference/python_mcp_server.md`: FastMCP, Pydantic v2, `@mcp.tool`, context injection, resources, lifespan
- `reference/evaluation.md`: evaluation question 작성과 검증, XML 형식, evaluation runner 사용법
- `scripts/connections.py`: stdio, SSE, HTTP MCP connection abstraction
- `scripts/evaluation.py`: evaluation XML을 읽고 agent loop로 task별 정확도/도구 호출/시간 보고서를 생성
- `scripts/requirements.txt`: evaluation 실행 의존성

## 핵심 규칙

- tool 이름은 service prefix가 있는 snake_case를 사용한다.
- response는 Markdown과 JSON 둘 다 고려한다.
- list tool에는 pagination과 limit이 필요하다.
- error message는 agent가 다음 행동을 알 수 있도록 actionable해야 한다.
- destructive/read-only/idempotent/open-world annotations를 설정한다.
- TypeScript에서는 deprecated `server.tool()`이 아니라 `server.registerTool()`을 사용한다.
- Python에서는 Pydantic v2 model과 type hint를 적극 사용한다.
- evaluation은 write operation 없이 답할 수 있는 고난도 read-only 질문이어야 한다.

## 산출물 특성

- Python 또는 TypeScript MCP server
- tool/resource/prompt 정의
- API client와 shared utility
- build/test 결과
- `evaluation.xml`과 evaluation report

## 주의점

- MCP 서버 품질은 endpoint 수가 아니라 LLM이 실제 작업을 해낼 수 있는가로 판단한다.
- evaluation question은 keyword search로 쉽게 풀리면 안 된다.
- 답은 direct string comparison 가능한 단일 값이어야 한다.
- stdio server는 stdout에 log를 쓰면 protocol을 깨뜨릴 수 있으므로 stderr를 써야 한다.
