# 세션 종료 자기 평가를 위한 훅 연동

에이전트가 모든 세션의 끝에서 자기 평가를 하도록 상기시키려면 `hooks/hooks.json`에 이 훅을 추가하세요(이 훅은 알림 메시지만 출력하며, 평가기를 자동으로 실행하지는 않습니다):

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo '[Self-Eval] Session complete. Consider running agent-self-evaluation to rate your output.'"
          }
        ],
        "description": "Remind agent to self-evaluate at session end"
      }
    ]
  }
}
```

`Stop` 이벤트에는 `matcher` 필드가 필요하지 않습니다(`scripts/ci/validate-hooks.js` 기준으로 `Stop`, `Notification`, `UserPromptSubmit`, `SubagentStop`에서는 선택 사항입니다). 생략하면 훅 객체에는 `hooks`와 `description` 같은 메타데이터만 있으면 됩니다.

## Python 평가기와의 연동

`scripts/evaluate.py` 스크립트는 독립 실행 도구로 사용할 수 있습니다:

```bash
# 에이전트 출력을 직접 파이프로 전달
echo "Your agent response here" | python3 skills/agent-self-evaluation/scripts/evaluate.py

# 파일에서 입력
python3 skills/agent-self-evaluation/scripts/evaluate.py --task task.txt --output response.txt
```

훅에 연동하려면 먼저 마지막 에이전트 출력을 파일로 저장한 다음 평가기를 실행하세요. 셸 기반 검증 후에 가벼운 알림만 원한다면, 지원되는 단순한 matcher 문자열을 사용하세요:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "echo '[Self-Eval] If this command completed verification for a non-trivial task, consider running agent-self-evaluation.'"
          }
        ],
        "description": "Remind agent to self-evaluate after shell verification"
      }
    ]
  }
}
```

이 방식은 지원되지 않는 명령 표현식 matcher 문법을 문서화하지 않기 위한 것입니다. 사용 중인 하네스가 명령 수준의 matcher 표현식을 지원한다면, `test` 같은 넓은 부분 문자열 대신 `\b(pytest|npm test|go test)\b`처럼 단어 경계가 있는 정규식을 우선 사용하세요.

이 훅들은 선택적으로 켜는 기능입니다. 자동 평가 알림을 원한다면 로컬 `hooks/hooks.json`에 추가하세요.

## 수동 사용 (권장)

가장 안정적인 방법은 수동 호출입니다. `agent-self-evaluation` 스킬이 활성화되어 있으면 에이전트가 작업 흐름의 일부로 자기 평가를 수행하며, 훅 설정이 필요하지 않습니다. 스킬의 "활성화 시점" 섹션에 이미 트리거 조건(여러 파일에 걸친 변경, 디버깅 세션, 설계 문서)이 정리되어 있습니다.
