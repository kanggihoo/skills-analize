# 소스 playbook

why 스킬은 사용 가능한 증거 범주마다 investigator를 하나씩 spawn하며, 각 investigator는 아래의 소스별 playbook 하나를 읽습니다. playbook은 흔한 MCP에 대한 구체적인 예시입니다. 같은 범주의 다른 MCP에 맞게 조정하십시오.

| 범주 | Playbook | 문서화된 예시 MCP |
|---|---|---|
| 소스 컨트롤 이력 | [`code-archaeology.md`](./sources/code-archaeology.md) | git, `gh` |
| 이슈 / 티켓 트래커 | [`linear.md`](./sources/linear.md) | Linear (Jira, GitHub Issues, Plane, Shortcut에 맞게 조정) |
| 장문 문서 | [`notion.md`](./sources/notion.md) | Notion (Confluence, Google Docs, Coda에 맞게 조정) |
| 실시간 팀 채팅 | [`slack.md`](./sources/slack.md) | Slack (Discord, Microsoft Teams, Mattermost에 맞게 조정) |
| 인프라 관측성 | [`datadog.md`](./sources/datadog.md) | Datadog (New Relic, Honeycomb, Grafana, Splunk에 맞게 조정) |
| 에러 / 예외 추적 | [`sentry.md`](./sources/sentry.md) | Sentry (Rollbar, Bugsnag, Airbrake에 맞게 조정) |
| 제품 분석 웨어하우스 | [`databricks.md`](./sources/databricks.md) | Databricks SQL (Snowflake, BigQuery, ClickHouse, dbt에 맞게 조정) |

공통 관점:

- [`incident-postmortem.md`](./sources/incident-postmortem.md). 대상 코드가 방어적으로 보이면(null 검사, 재시도, 타임아웃, 레이트 리밋, feature flag, egress guard, OOM 핸들러) 이것을 추가하십시오.
