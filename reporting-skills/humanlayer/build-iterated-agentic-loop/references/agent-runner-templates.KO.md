# 에이전트 실행기 템플릿

워크플로의 에이전트 실행 단계 안에서 이 중 하나를 사용합니다. 광범위한 권한 모드는 신뢰할 수 있고 격리된 러너에서만 적합합니다.

각 에이전트의 출력 형식이 다르므로 응답 추출 방식도 다릅니다. 목표는 에이전트의 최종 형식화된 응답을 PR 본문용 `/tmp/pr-body.md`에 가져오는 것입니다.

---

## Claude Code

시크릿: `ANTHROPIC_API_KEY`.

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 24
- run: npm install -g @anthropic-ai/claude-code
- name: Run Claude Code
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  run: |
    claude -p "$PROMPT" \
      --permission-mode bypassPermissions \
      --output-format stream-json \
      --verbose \
      2>&1 | tee /tmp/agent-output.txt
```

저장소에 비용 가드가 필요하면 `--max-turns` 또는 `--max-budget-usd`를 사용합니다.

**응답 추출:** `--output-format stream-json`을 사용하는 Claude Code는 JSON 라인을 출력합니다. 마지막 어시스턴트 메시지를 추출합니다.

```yaml
- name: Extract PR body
  run: |
    # stream-json 출력에서 마지막 어시스턴트 텍스트 메시지를 추출
    cat /tmp/agent-output.txt \
      | grep '^{' \
      | jq -s '[.[] | select(.type == "assistant" and .message.content)] | last | .message.content[] | select(.type == "text") | .text' -r \
      > /tmp/pr-body.md
```

---

## Codex CLI

시크릿: `OPENAI_API_KEY`.

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 24
- run: npm install -g @openai/codex
- name: Login Codex
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  run: printenv OPENAI_API_KEY | codex login --with-api-key
- name: Run Codex
  run: |
    codex exec "$PROMPT" \
      --cd "$GITHUB_WORKSPACE" \
      --ask-for-approval never \
      --sandbox danger-full-access \
      --json \
      --output-last-message /tmp/pr-body.md \
      2>&1 | tee /tmp/agent-output.txt
```

**응답 추출:** Codex는 `--output-last-message /tmp/pr-body.md`로 기본 지원합니다. 추가 추출이 필요하지 않습니다.

---

## OpenCode

시크릿: 제공자별로 다르며, 보통 `ANTHROPIC_API_KEY` 또는 `OPENAI_API_KEY`입니다.

```yaml
- uses: oven-sh/setup-bun@v2
- run: bun install -g opencode-ai
- name: Run OpenCode
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  run: |
    opencode run "$PROMPT" \
      --dir "$GITHUB_WORKSPACE" \
      --model anthropic/claude-sonnet-4-5 \
      --format json \
      --dangerously-skip-permissions \
      2>&1 | tee /tmp/agent-output.txt
```

`--model`과 env 시크릿은 함께 바꿉니다. 예를 들어 `openai/...` 모델과 `OPENAI_API_KEY`로 바꿀 수 있습니다.

**응답 추출:** `--format json`을 사용하는 OpenCode는 구조화된 JSON을 출력합니다. 최종 메시지를 추출합니다.

```yaml
- name: Extract PR body
  run: |
    # OpenCode JSON 출력에서 마지막 어시스턴트 메시지를 추출
    cat /tmp/agent-output.txt \
      | jq -r '.messages | map(select(.role == "assistant")) | last | .content' \
      > /tmp/pr-body.md
```

---

## CodeLayer

시크릿: Anthropic 기반 실행에서는 보통 `ANTHROPIC_API_KEY`입니다.

```yaml
- uses: oven-sh/setup-bun@v2
- name: Run CodeLayer
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    FORCE_COLOR: "3"
  run: |
    bunx @humanlayer/cli@latest codelayer \
      --provider anthropic \
      --model claude-opus-4-8 \
      --thinking high \
      --prompt "$PROMPT" \
      2>&1 | tee /tmp/agent-output.txt
```

저장소가 이미 HumanLayer/CodeLayer 관례에 의존하거나 CodeLayer의 PR 지향 동작을 원할 때 이것을 사용합니다.

**응답 추출:** CodeLayer는 ANSI 색상이 포함된 일반 텍스트를 출력합니다. 파서 스크립트를 사용하거나 서식을 제거합니다.

```yaml
- name: Extract PR body
  run: |
    # codelayer-output 파서 스크립트가 있는 경우:
    # bun ci-scripts/codelayer-output.ts < /tmp/agent-output.txt > /tmp/pr-body.md

    # 그렇지 않으면 ANSI 코드를 제거하고 원시 출력을 사용:
    cat /tmp/agent-output.txt | sed 's/\x1b\[[0-9;]*m//g' > /tmp/pr-body.md
```

더 깔끔한 추출을 원하면, 최종 응답 부분만 뽑아내는 `ci-scripts/codelayer-output.ts` 같은 파서 스크립트를 사용합니다.

---

## 참고

- 모든 에이전트는 아티팩트 업로드와 디버깅을 위해 출력을 `/tmp/agent-output.txt`에 tee해야 합니다.
- 추출된 응답은 PR 생성 단계에서 사용하는 `/tmp/pr-body.md`로 갑니다.
- 추출이 실패하면 워크플로는 우아하게 대체해야 합니다(예: 원시 출력이나 자리표시자 메시지 사용).
