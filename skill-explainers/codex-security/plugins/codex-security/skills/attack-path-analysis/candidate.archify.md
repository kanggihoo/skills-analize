# attack-path-analysis는 finding을 어떤 순서로 추적해 보고 여부와 심각도를 정하나? {#attack-path-page}

`attack-path-analysis`는 넘겨받은 finding마다 뒷받침되는 공격자 경로가 있는지, 영향이 무엇인지, 보고할지를 정하는 단계 스킬이다.[](source:purpose) scan이 이미 attack-path 단계에 있거나 사용자가 finding을 source에서 sink까지 추적해 심각도를 보정해 달라고 명시적으로 요청할 때 쓴다. 전체 PR, commit, branch, patch, 저장소 scan을 시작하는 1차 트리거로는 쓰지 않는다.[](source:fm)

- 경로의 사실, 심각도 보정, 최종 정책 결정을 결과에서 구분해 둔다. 심각도는 확립된 사실에 정책을 적용해 정하고, 이 단계에서 discovery를 다시 열지 않는다.[](source:s-step3)[](source:sev-intro)
- 후보는 `reportable`, `ignore`, `deferred` 중 하나로 결정한다. 위험이 낮다는 이유만으로 실제 finding을 버리지 않고 더 낮은 심각도를 준다.[](source:sev-report)[](source:schema-dec)
- 자기 자신에게만 미치는 영향, 실현 불가능한 전제, 권한 있는 공격자만 가능한 경로는 `ignore`다. 단, 권한 상승 차이가 쟁점이면 예외다.[](source:sev-report)
- compact diff scan에서는 `reportable`이나 `deferred`로 검증된 후보를 하나도 빼지 않고 한 번에 제출한다. 빠지거나 자격 없는 후보가 있으면 도구가 거부한다.[](source:wb)[](source:ledger-miss)

@answer scope="로컬 원본 분석 · 스킬·도구 실행 없음 · 커밋 cd5035b 기준"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source fm title="codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md · 5355B · frontmatter" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=1:4
@source purpose title="codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md · 5355B · 목적과 읽을 문서" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=8:8
@source inputs title="codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md · 5355B · scan 단계와 단독 입력" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=12:14
@source s-step1 title="codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md · 5355B · 1단계 경로 세우기" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=16:16
@source s-step2 title="codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md · 5355B · 2단계 통제와 반증" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=17:17
@source s-step3 title="codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md · 5355B · 3단계 영향·가능성·심각도" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=18:18
@source s-step4 title="codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md · 5355B · 4단계 결정" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=19:19
@source continuum title="codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md · 5355B · AWS Continuum 증거 읽기" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=21:21
@source safe title="codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md · 5355B · artifact와 네트워크 제한" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=23:23
@source integ title="codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md · 5355B · Standard·Deep 제외" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=25:27
@source wb title="codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md · 5355B · Compact Workbench Diff" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=29:36
@source phase title="codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md · 5355B · 다른 phase-based scan" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=38:42
@source out title="codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md · 5355B · 출력" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=44:54
@source yaml title="codex-security/plugins/codex-security/skills/attack-path-analysis/agents/openai.yaml · 261B · 표시 이름과 기본 prompt" path=codex-security/plugins/codex-security/skills/attack-path-analysis/agents/openai.yaml
@source sev-intro title="codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md · 2644B · 적용 순서와 rubric" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=3:5
@source sev-vuln title="codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md · 2644B · SSRF·CSRF·XSS 보정" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=7:7
@source sev-report title="codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md · 2644B · Reportability 규칙" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=9:17
@source sev-like title="codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md · 2644B · 노출 벡터별 가능성" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=19:24
@source sev-prio title="codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md · 2644B · 우선순위 표기" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=26:35
@source facts title="codex-security/plugins/codex-security/skills/attack-path-analysis/references/attack-path-facts.md · 1585B · 경로 사실 8항목" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/attack-path-facts.md lines=3:14
@source rubric title="codex-security/plugins/codex-security/references/default-severity-rubric.md · 3348B · 기본 심각도 기준" path=codex-security/plugins/codex-security/references/default-severity-rubric.md lines=3:33
@source rub-crit title="codex-security/plugins/codex-security/references/default-severity-rubric.md · 3348B · Critical 세 조건" path=codex-security/plugins/codex-security/references/default-severity-rubric.md lines=5:13
@source rub-high title="codex-security/plugins/codex-security/references/default-severity-rubric.md · 3348B · High 세 조건" path=codex-security/plugins/codex-security/references/default-severity-rubric.md lines=15:21
@source rub-low title="codex-security/plugins/codex-security/references/default-severity-rubric.md · 3348B · Medium·Low·Informational" path=codex-security/plugins/codex-security/references/default-severity-rubric.md lines=23:33
@source store-scan title="codex-security/plugins/codex-security/references/artifact-storage.md · 7947B · 구조화 결과는 기존 도구" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=9:9
@source store-model title="codex-security/plugins/codex-security/references/artifact-storage.md · 7947B · 위협 모델 읽기" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=37:37
@source sa-model title="codex-security/plugins/codex-security/references/scan-artifacts.md · 11701B · 위협 모델 경로" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=24:29
@source sa-compact title="codex-security/plugins/codex-security/references/scan-artifacts.md · 11701B · compact attack_path 객체" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=41:49
@source sa-legacy title="codex-security/plugins/codex-security/references/scan-artifacts.md · 11701B · Attack-Path 단계 경로" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=85:90
@source schema title="codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json · 6810B · 입력 전체" path=codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json lines=7:187
@source schema-dec title="codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json · 6810B · 결정 3종" path=codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json lines=36:48
@source schema-rep title="codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json · 6810B · reportable 필수 필드" path=codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json lines=68:105
@source schema-ign title="codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json · 6810B · ignore 필수 필드" path=codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json lines=106:143
@source schema-def title="codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json · 6810B · deferred 필수 필드" path=codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json lines=144:187
@source zod title="codex-security/plugins/codex-security/mcp-app/src/artifact-contracts.ts · 15569B · 488줄 중 20~172줄만 읽음, attack path" path=codex-security/plugins/codex-security/mcp-app/src/artifact-contracts.ts lines=94:133
@source ledger title="codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts · 6121B · attack-path 기록 함수" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=79:159
@source ledger-miss title="codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts · 6121B · 빠진 후보와 자격 없는 후보는 거부" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=117:141
@source ledger-store title="codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts · 6121B · ledger 위치와 교체" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=161:199
@source tool title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 15421B · attack-path 도구" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=152:165
@source tool-list title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 15421B · 후보 목록 도구" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=123:135
@source tool-ctx title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 15421B · scan 문맥 요구" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=353:384
@source disc-list title="codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts · 6305B · 후보 목록은 ledger 행만 읽음" path=codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts lines=180:193
@source final title="codex-security/plugins/codex-security/references/final-report.md · 12135B · compact diff 결과 매핑" path=codex-security/plugins/codex-security/references/final-report.md lines=42:49
@source final-cc title="codex-security/plugins/codex-security/references/final-report.md · 12135B · code-comment 우선순위" path=codex-security/plugins/codex-security/references/final-report.md lines=81:85
@source final-info title="codex-security/plugins/codex-security/references/final-report.md · 12135B · informational 보고" path=codex-security/plugins/codex-security/references/final-report.md lines=30:30
@source desk title="codex-security/plugins/codex-security/skills/security-scan/references/desktop-scan.md · 580B · P0~P3 표기" path=codex-security/plugins/codex-security/skills/security-scan/references/desktop-scan.md lines=5:5
@source core18 title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · 단계 스킬 호출 금지" path=codex-security/plugins/codex-security/references/core-scan.md lines=18:18
@source core34 title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · Finding Severity" path=codex-security/plugins/codex-security/references/core-scan.md lines=34:36
@source dscan title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 위임하는 쪽" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=31:31
@source val28 title="codex-security/plugins/codex-security/skills/validation/SKILL.md · 4619B · 처분을 넘기는 쪽" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=25:30
@source tm title="codex-security/plugins/codex-security/skills/threat-model/SKILL.md · 2986B · 위협 모델을 만드는 쪽" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=25:27
@source pub25 title="codex-security/plugins/codex-security/skills/publish-findings/SKILL.md · 11118B · 3줄과 25줄만 읽음, Continuum 안내" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=25:25
@source scan10 title="codex-security/plugins/codex-security/skills/security-scan/SKILL.md · 2972B · 1~21줄만 읽음, core audit 사용" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=10:10
@source readme title="codex-security/plugins/codex-security/skills/README.md · 3752B · attack-path-analysis 안내 줄" path=codex-security/plugins/codex-security/skills/README.md lines=28:28
@source readme-scan title="codex-security/plugins/codex-security/skills/README.md · 3752B · scan 선택 안내" path=codex-security/plugins/codex-security/skills/README.md lines=5:9
@source mcpjson title="codex-security/plugins/codex-security/.mcp.json · 2078B · MCP 서버 codex-security" path=codex-security/plugins/codex-security/.mcp.json lines=1:6
@source pluginjson title="codex-security/plugins/codex-security/.codex-plugin/plugin.json · 1682B · skills 폴더 선언" path=codex-security/plugins/codex-security/.codex-plugin/plugin.json lines=18:20

## 언제 켜지고 언제 쓰면 안 되나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 문구와 정확히 일치해야 켜진다는 뜻은 아니다.

`disable-model-invocation` 같은 호출 제한 필드는 원문에 명시 없음이다. `agents/openai.yaml`에도 `policy`가 없고 표시 이름과 기본 prompt만 있다.[](source:fm)[](source:yaml)

@code source=fm language=yaml

| 상황 | 에이전트의 행동 |
|---|---|
| scan이 이미 attack-path 단계에 있다 | 이 스킬을 쓴다. 그 scan의 위협 모델과 후보 집합을 입력 경로 그대로 쓴다. 필요한 scan artifact가 없으면 빠진 입력을 보고한다.[](source:fm)[](source:inputs) |
| 사용자가 finding을 source에서 sink까지 추적하고 심각도를 보정해 달라고 명시적으로 요청한다 | 이 스킬을 쓴다. 주어진 finding, 저장소, 위협 모델이나 보안 정책, 맥락을 쓰고 per-scan artifact는 필요 없다. 중대한 가정은 밝히고, 의미 있는 평가가 막힐 때만 빠진 맥락을 묻는다.[](source:fm)[](source:inputs)[](source:yaml) |
| 전체 PR, commit, branch, patch, 저장소 scan을 시작하라는 요청 | 이 스킬을 1차 트리거로 쓰지 않는다. 벤더 안내문은 scan 선택을 `security-scan`, `security-diff-scan`, `deep-security-scan`에 둔다.[](source:fm)[](source:readme-scan) |
| Standard scan이나 Deep Scan worker 안 | 자기 Standard workflow 안에서 공격 경로를 평가하고 이 스킬을 호출하지 않는다. `core-scan.md`는 별도 단계 스킬을 부르지 말라고 하고, 심각도는 공급된 채점 기준(rubric)이나 기본 채점 기준으로 매기게 한다.[](source:integ)[](source:core18)[](source:core34) |
| AWS Continuum에서 가져온 issue | 이 스킬을 쓰되 저장된 증거를 읽는 별도 규칙을 따른다(아래 표).[](source:continuum)[](source:pub25) |

파일을 만들거나 보관하기 전에 `../../references/artifact-storage.md`를 읽는다. 벤더 안내문은 이 스킬을 "공격자가 버그를 어떻게 일으키고 무엇을 얻는지 추적한다"고 소개한다.[](source:purpose)[](source:readme)

## 어떤 순서로 경로를 추적하고 결정하나? {#steps}

@workflow id=attack-flow title="공격 경로 분석 순서"
| path | 경로 세우기 | backend |
| control | 통제와 반증 | backend |
| rate | 영향·심각도 보정 | backend |
| decide | 결정 기록 | backend |
| path > control | |
| control > rate | |
| rate > decide | | emphasis |

@steps id=attack-steps
| path | 경로 세우기 | 범위 안의 공격자, 영향받는 제품 표면, 진입점, 조종 가능한 입력, 보안 경계, 민감한 동작을 정한다. 각 단계를 저장소 근거와 주어진 대상 관찰로 추적한다.[](source:s-step1) | attack-flow | path |
| control | 통제와 반증 | 관련 통제와 가장 강한 반증을 찾는다. 통제가 무엇을 확립하는지, 어떤 전제가 남는지, 주장한 경계를 실제로 넘는지 설명한다.[](source:s-step2) | attack-flow | control |
| rate | 영향·심각도 보정 | 그 사실에서 영향과 가능성을 평가하고 `severity-policy.md`로 최종 결정을 한다. scan이 채점 기준을 주면 그것으로 reportable finding을 매기고, 영향 없는 후보에는 `ignore`를 유지한다.[](source:s-step3) | attack-flow | rate |
| decide | 결정 기록 | 자격이 있는 후보마다 명시적 결정을 낸다. ignore와 deferred도 포함한다. 뒷받침된 인스턴스를 이웃 finding으로 바꾸거나 root-control 위치를 잃지 않는다.[](source:s-step4) | attack-flow | decide |

| 강제·금지 | 내용 |
|---|---|
| 증거 | 넘겨받은 artifact는 증거로 다룬다. 지원되지 않는 공격 사슬을 지어내지 않는다.[](source:safe) |
| 네트워크 | 사용자가 명시적으로 허락했을 때만 접근한다. 오프라인 scan은 절대 접근하지 않는다.[](source:safe) |
| 부족한 배포 근거 | 배포나 public ingress 근거가 없으면 확신을 제한할 수 있지만, 그것만으로 뒷받침된 finding을 깨지 않는다.[](source:safe)[](source:sev-report) |
| discovery 재개 금지 | 심각도 보정 중에는 discovery를 다시 열거나 다른 공격 이야기로 바꾸지 않는다.[](source:sev-intro)[](source:out) |
| 보존 | 후보 정체성, 기존 discovery·validation 필드, 위치를 보존한다.[](source:wb)[](source:s-step4) |

## 보고 여부와 심각도는 어떻게 정하나? {#severity}

이 정책은 확립한 공격 경로와 범위와 반증 뒤에 적용한다. 후보의 심각도 가설에서 출발해 영향, 가능성, 전제, 완화로 조정한다.[](source:sev-intro)

| reportability 규칙 | 에이전트의 행동 |
|---|---|
| 반증됐거나 의미 있는 보안 영향이 없다 | `ignore`로 정한다.[](source:sev-report) |
| 영향이나 가능성이 낮다 | 실제 보고할 finding을 이것만으로 버리지 않고 더 낮은 심각도를 준다.[](source:sev-report) |
| 자기 자신에게만 미치는 영향, 실현 불가능하거나 매우 비현실적인 전제 | hard suppression을 적용한다.[](source:sev-report) |
| 권한 있는 사용자, 운영자, 개발자, 물리 접근, 보호된 쓰기 경로만 전제한다 | 권한 상승 차이가 쟁점이 아니면 `ignore`다.[](source:sev-report) |
| 하위 권한의 범위 안 공격자 경로 | 저장소 근거나 validation 근거, 또는 둘 다로 성립해야 한다. 근거가 그런 경로를 받치지 않으면 `ignore`다.[](source:sev-report) |
| private·internal 노출만 있다 | 실제 제품이나 production workflow의 인가, 신원, 신뢰 경계, 보안 통제 실패를 그것만으로 지우지 않는다. 배포·ingress 근거 부족은 확신을 낮추거나 사실을 모름으로 남긴다.[](source:sev-report) |

노출 벡터로 가능성을 가늠하는 기준은 아래와 같다. 원문은 모두 "usually"라고 쓰므로 권고다.[](source:sev-like)

@facts
| `remote` | 공격자 위치가 현실적이고 범위 안이면 보통 가능성 high를 받친다.[](source:sev-like) |
| `local_network` | 근거가 다른 수준을 받치지 않으면 보통 medium이다.[](source:sev-like) |
| `localhost` | 하위 권한 공격자가 listener에 현실적으로 닿지 않으면 보통 low다.[](source:sev-like) |
| `none` | 노출을 이유로 가능성을 높이지 않는다.[](source:sev-like) |

취약점 유형별 보정도 있다. SSRF는 문서화된 외부 요청 기능이나 선택적 운영자 필터가 입증된 목적지 통제 우회를 지우지 못한다. CSRF는 브라우저 자격 증명 첨부, cookie 정책, preflight, 요청 파싱, 실효 통제를 보고, method나 JSON content type만으로는 범주적 방어가 아니다. XSS는 자기 자신에게만 미치는 효과와 피해자 영향을 구분하고, `alert` 재현은 스크립트 실행만 증명하지 심각도를 정하지 않는다.[](source:sev-vuln)

심각도는 scan이 준 채점 기준으로 매기고, 없을 때만 기본 채점 기준을 쓴다.[](source:sev-intro)[](source:core34) 기본 채점 기준은 공격자의 실제 시작 접근, 넘는 경계, 추가 피해를 보고 confidence와 severity를 분리한다. 증명이 없다는 사실만으로 더 넓은 공격이 불가능하다고 단정하거나 낮추지 않는다.[](source:rubric)

| 등급 | 조건 |
|---|---|
| Critical | 세 조건을 모두 충족해야 한다. 접근: 비인증 인터넷 공격자나 일반 외부 사용자 등. 영향: 중요한 경계를 넘어 상당한 데이터 접근, 권한 있는 동작, 의미 있는 코드 실행, workload 탈출. 근거: 입증된 악용이나 강한 소스 근거 validation이 전체 경로를 확립한다.[](source:rub-crit) |
| High | 같은 세 조건 구조다. 접근은 내부 사용자, 파트너, 초대받은 협업자도 포함한다. 영향은 민감한 고객 데이터, 재사용 가능한 자격 증명, 계정 탈취, cross-tenant 접근, production 제어 같은 상당한 새 능력이다. 위험한 함수나 production 라벨만으로는 경로가 증명되지 않는다.[](source:rub-high) |
| Medium | 영향이 구체적으로 한정된 믿을 만한 취약점이다. 완전히 입증돼도 Medium일 수 있다. 낮추는 근거는 확인된 제약이어야 하고 증거가 없다는 가정이 아니다.[](source:rub-low) |
| Low | 추가 피해가 작고 범위·민감도·기간의 한계가 확인된 약점이다. 심각할 수 있는 경로에 대한 불확실성을 가리는 용도로 쓰지 않는다.[](source:rub-low) |
| Informational | 추가 능력이나 보안 영향이 없는 보강 기회나 관찰이다. 보안 finding이 아닌 관리 기록은 제외될 수 있고, 제외는 심각도가 아니다.[](source:rub-low) |

최종 심각도는 우선순위로 옮긴다. `critical`은 `P0`, `high`는 `P1`, `medium`은 `P2`, `low`는 `P3`이다. `ignore`한 finding은 `ignore` 결정과 심각도를 받고 우선순위는 없다. 같은 표기를 desktop 완료 보고의 `::code-comment`가 쓴다.[](source:sev-prio)[](source:final-cc)[](source:desk)

## AWS Continuum 증거는 어떻게 읽나? {#continuum}

가져온 AWS Continuum issue는 finding 증거의 `source_data.evidence_artifacts`를 읽는다. 이 증거가 저장소로는 보이지 않는 경로의 한 단계를 확립할 수 있다. 시험한 대상, 공격자 권한, 관찰된 효과를 주장한 경로와 맞춰 본다. 쓸 때는 artifact ID와 근거가 되는 관찰을 인용한다.[](source:continuum)

| 증거 종류 | 무엇을 확립하나 |
|---|---|
| `VALIDATION_EVIDENCE`의 `body.validationEvidence` | 저장소가 보여 줄 수 없는 단계를 확립할 수 있다.[](source:continuum) |
| HTTP `exploitArtifact` | 시험한 위치에서의 도달 가능성을 확립할 수 있다.[](source:continuum) |
| `executedProof` | 그 시험 환경에서 실제로 실행된 것을 확립한다.[](source:continuum) |
| `sourceAnalysis` | 정적 추론을 기록한 것이다. `exploitable` 판정 하나는 배포된 곳의 도달 가능성을 보여 주지 않는다.[](source:continuum) |
| 묶음 issue의 `perFindingResults`, `flowVerdicts` | 있으면 관련 finding과 흐름을 가려내는 데 쓴다.[](source:continuum) |

이 증거는 `publish-findings`가 건넨다. 그쪽이 "선택한 issue의 저장된 `.evidence`를 검증 artifact까지 포함해 `$attack-path-analysis`에 주라"고 안내한다(R36).[](source:pub25)

## 결과는 무엇을 담고 어디에 기록되나? {#output}

경로의 사실은 여덟 항목으로 정리한다. 모르는 것은 중요할 때 명시하고, 호출한 workflow의 schema를 따른다. 서술형이면 같은 근거를 여러 제목 아래 되풀이하지 않는다.[](source:facts)

@facts
| 범위와 맥락 | 영향받는 구성 요소, 적용되는 위협 모델 경계, 영향이 자기 자신에게만 미치는지 의미 있는 경계를 넘는지, 그 근거.[](source:facts) |
| 공격 경로 | 공격자가 조종하는 입력, 번호를 붙인 공격자 단계, 민감한 동작, 이를 잇는 근거.[](source:facts) |
| 노출과 벡터 | public, internal, admin-only 접근과 `remote`, `local_network`, `localhost`, `none`, `unknown`. 있으면 routing·배포 근거.[](source:facts) |
| 신원과 전제 | 실효 권한, 필요한 공격자 위치나 능력, 그 전제의 현실성, 가정.[](source:facts) |
| 영향 | 취약점 범주, 영향받는 runtime·데이터·신원·build·네트워크 표면, 대상 도달 범위, 관련 secret 종류.[](source:facts) |
| 통제와 반증 | 실효 완화, 경로나 범위에 대한 가장 강한 반증, 그것이 finding을 깨는지 여부와 이유.[](source:facts) |
| 불확실성 | 확신도, 빠진 사실, 평가를 바꿀 조건.[](source:facts) |
| 결정 | 영향과 가능성의 근거, 보정한 심각도, 최종 정책 결정.[](source:facts) |

경로의 사실은 심각도와 억제 결정과 따로 둔다. validation이 준 정확한 소스 위치와 ID를 보존한다.[](source:facts)

| 모드 | 입력과 제출 |
|---|---|
| Compact Workbench Diff(`scanId` 있음) | 후보를 `list_codex_security_candidates({ scanId, cursor?, limit? })`로 읽고, `reportable`이나 `deferred`로 검증된 후보를 모두 분석한다. 결정을 `record_candidate_attack_paths({ scanId, attackPaths: [{ candidateId, attackPath }] })` 한 번으로 제출한다. 이 단계에 들어갈 후보가 없으면 `attackPaths: []`를 제출한다. 도구가 후보 순서를 보존한다. 중복 보고서, receipt, 수동 ledger는 만들지 않는다.[](source:wb) |
| 다른 phase-based scan | 활성 workflow의 보고서와 receipt 경로를 쓴다. 이 단계에 들어온 후보마다 명시적 결정과, ID·사실이나 정확한 증명 간극·보고서 참조가 든 receipt가 있어야 한다. 무시한 후보도 살아남는 finding 집합에서 빼기 전에 기록한다. 경로는 `<findings_dir>/attack_path_analysis_report.md`와 후보별 `<findings_dir>/<candidate_id>/attack_path_analysis_report.md`다.[](source:phase)[](source:sa-legacy) |
| 저장소 전체 또는 범위 지정 scan | `reportable`이거나 `survives: yes`인 validation closure 행은 discovery가 다듬은 finding 번호를 주지 않았어도 포함한다. validation이 준 진입점·root-control·sink·concrete-implementation 위치를 보존한다.[](source:phase) |
| 단독 분석 | 호출자의 형식을 따르거나 finding마다 간결한 평가를 돌려준다. 제목, 후보·인스턴스·ledger ID, 정확한 위치와 공격자에서 영향까지의 단계, 위 사실, 통제와 반증과 전제, 영향·가능성·보정한 심각도·최종 결정과 이유를 담는다.[](source:out) |

도구가 받는 결정 객체의 모양은 schema가 정한다.[](source:schema)

| 결정 | `severity` | 추가 조건 |
|---|---|---|
| `reportable` | `critical`, `high`, `medium`, `low` 중 하나 | 필수 필드 9개가 모두 있어야 한다.[](source:schema-rep)[](source:schema-dec) |
| `ignore` | 반드시 `ignore` | 필수 필드 9개. 같은 목록이다.[](source:schema-ign) |
| `deferred` | `critical`, `high`, `medium`, `low`, `unknown` 중 하나. 잠정 값이다 | 필수 필드가 10개이고 `proof_gap`이 추가된다.[](source:schema-def)[](source:sa-compact) |

@facts
| 공통 필수 필드 | `decision`, `dataflow`, `reachability`, `counterevidence`, `impact`, `likelihood`, `severity`, `severity_rationale`, `change_conditions`.[](source:schema-rep) |
| `impact`·`likelihood` 값 | `high`, `medium`, `low`, `ignore`, `unknown`.[](source:schema-rep) |
| 추가 키 | schema가 정한 키 밖의 키도 허용한다. 우선순위(`P0`~`P3`) 칸은 schema에 없다.[](source:schema-rep)[](source:zod) |
| 후보 선택 | 도구는 `reportable`이나 `deferred`로 검증된 후보를 모두 요구하고, 모르는 후보, 중복 후보, 그 처분이 아닌 후보를 거부한다.[](source:ledger-miss) |
| 기록 방식 | 후보 파일 전체를 교체하고 해당 행에 `attack_path` 객체를 더한다. 다른 필드와 순서는 바꾸지 않는다.[](source:ledger)[](source:ledger-store) |
| 사용 조건 | 실행 중이고 소유권이 확인된 scan이며 scan 모드가 diff나 Deep이어야 한다.[](source:tool-ctx) |

## 흐름 속 위치는 어디인가? {#flow}

@workflow id=position-flow title="검증에서 최종 보고로"
| scan | security-diff-scan | backend | source:dscan |
| tm | threat-model | backend | source:tm |
| before | validation | backend | source:val28 |
| current | attack-path-analysis | backend | source:wb |
| scan > current | 내부 위임 R09 | emphasis |
| before > current | 산출물 호환 R12 | dashed |
| tm > current | 산출물 호환 R13 | dashed |

@steps id=position-steps
| highlight | attack-path-analysis | diff scan이 validation 다음에 한 번, `reportable`이나 `deferred` 후보에만 실행한다. 이 단계에 들어갈 후보가 없으면 `attackPaths: []`를 제출한다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R09 · 내부 위임 | `security-diff-scan`이 validation 다음에 한 번, `reportable`이나 `deferred`로 표시된 후보에만 `$attack-path-analysis`를 실행한다. 호스트 workbench의 `record_candidate_attack_paths`가 상태를 관리한다.[](source:dscan)[](source:wb) |
| R12 · 산출물 호환 | 검증된 후보 중 `reportable`이나 `deferred`만 받고 후보 정체성과 기존 필드를 보존한다.[](source:val28)[](source:wb) |
| R13 · 산출물 호환 | scan 단계에서는 per-scan 위협 모델과 후보 집합을 쓴다. 단독 분석은 위협 모델이나 보안 정책이 있으면 쓴다.[](source:tm)[](source:inputs) |
| R17 · 참고 | Standard scan과 Deep Scan worker는 이 스킬을 호출하지 않는다. 심각도는 `core-scan.md`의 "Finding Severity"가 공급된 채점 기준이나 기본 채점 기준으로 매기게 한다. 심각도에서 우선순위로 옮기는 표기는 이 스킬, 최종 보고, desktop 보고 세 곳이 같다.[](source:integ)[](source:core18)[](source:core34)[](source:final-cc)[](source:desk) |
| R36 · 넘김 | `publish-findings`가 AWS Continuum issue에 한해 저장된 `.evidence`를 검증 artifact까지 이 스킬에 주라고 안내한다.[](source:pub25)[](source:continuum) |
| R74 · 공유 상태 | compact diff 후보 ledger 하나를 discovery가 쓰고, validation이 `validation`을, 이 스킬이 `attack_path`를 더한다.[](source:sa-compact)[](source:wb) |

이 스킬이 읽는 공통 문서와 도구 계약은 아래와 같다.

| 관계 | 이 스킬이 가져가는 것 |
|---|---|
| R60 · 참고(`artifact-storage.md`) | 파일을 만들거나 보관하기 전에 읽는다. 결과는 기존 도구에 두고 보조 파일 도구로 대체하지 않는다.[](source:purpose)[](source:store-scan) |
| R64 · 참고(`candidate-attack-paths.schema.json`) | 제출 JSON 계약. 결정 3종과 필드.[](source:wb)[](source:schema-dec) |
| R77 · 참고(`default-severity-rubric.md`) | 공급된 채점 기준이 없을 때만 기본 채점 기준으로 reportable finding을 매긴다. Critical·High는 세 조건을 모두 충족해야 한다.[](source:sev-intro)[](source:rub-crit)[](source:rub-high) |
| R85 · 참고(`scan-artifacts.md`) | scan의 위협 모델은 `scan.threatModel`이 원본이고 `<scan_dir>/threatmodel.md`는 host가 만든 읽기용 문서다. compact diff는 `attack_path` 객체가 결과이고, 보고서 경로는 standalone·legacy diff에만 쓴다.[](source:sa-model)[](source:sa-compact)[](source:sa-legacy) |

validation이 이미 처분한 결과가 최종 보고에 놓이는 방식은 이렇다. validation과 attack-path가 모두 `reportable`이면 finding, 한쪽이라도 `deferred`이면 `needs_follow_up`, attack-path가 `ignore`이거나 validation이 `suppressed`이면 `rejected` coverage다.[](source:final) 더 자세한 표는 `codex-security/plugins/codex-security/skills/validation`(`validation.html`)에 있다.

전체 흐름은 색인 기준 `codex-security/_group-scan-vulnerabilities`(`scan-vulnerabilities.html`)를 가리킨다. 묶음 페이지는 별도 단계에서 만든다.

- [ ] 후보마다 공격자, 진입점, 조종 가능한 입력, 경계, 민감한 동작을 근거와 함께 적었는지 본다.
- [ ] 자기 자신에게만 미치는 영향이나 권한 있는 공격자만 가능한 경로를 `ignore`로 정했는지, 권한 상승 차이가 쟁점인 예외를 확인했는지 본다.
- [ ] 낮은 영향만으로 실제 finding을 버리지 않고 더 낮은 심각도를 줬는지 본다.
- [ ] 경로의 사실, 보정한 심각도, 최종 결정을 구분해 적었는지 본다.
- [ ] `reportable`·`deferred` 후보를 모두 한 번의 `record_candidate_attack_paths` 호출로 제출했는지 본다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `attack-path-analysis/SKILL.md` 5,355B, `references/severity-policy.md` 2,644B, `references/attack-path-facts.md` 1,585B, `agents/openai.yaml` 261B를 끝까지 읽었다.[](source:fm)[](source:sev-prio)[](source:facts)[](source:yaml) |
| 필수 참조 | `artifact-storage.md` 7,947B, `scan-artifacts.md` 11,701B, `default-severity-rubric.md` 3,348B, `candidate-attack-paths.schema.json` 6,810B를 끝까지 읽었다.[](source:store-scan)[](source:sa-legacy)[](source:rub-low)[](source:schema)[](source:final) |
| 도구 구현 | `artifact-candidate-ledger.ts` 6,121B, `compact-artifact-tools.ts` 15,421B, `artifact-discovery.ts` 6,305B를 끝까지 읽었다.[](source:ledger)[](source:tool)[](source:disc-list) |
| 구조·표본만 확인(전부 읽지 않음) | `artifact-contracts.ts`(15,569B)는 20~172줄만, `publish-findings/SKILL.md`(11,118B)는 3줄과 25줄만, `security-scan/SKILL.md`는 1~21줄만 읽었다.[](source:zod)[](source:pub25)[](source:scan10) |
| 관계 근거 | `security-diff-scan/SKILL.md` 5,405B, `validation/SKILL.md` 4,619B, `threat-model/SKILL.md` 2,986B, `final-report.md` 12,135B, `core-scan.md` 7,479B, `desktop-scan.md` 580B를 읽었다. `skills/README.md`, `.mcp.json`, `plugin.json`은 공통 확인용이다.[](source:dscan)[](source:val28)[](source:tm)[](source:final-info)[](source:core34)[](source:desk)[](source:readme)[](source:mcpjson)[](source:pluginjson) |
| 제외 | 번역본 없음. 바이너리 없음. 외부 URL과 `scripts/`의 코드는 열거나 실행하지 않았다. |

읽은 텍스트 파일은 23개이고 이 중 부분 읽음은 3개다. 원문의 활성화 조건, 평가 4단계, reportability 6규칙, 노출 벡터 4개, 우선순위 4개, Continuum 증거 5종, 결정 3종과 필수 필드를 모두 대조했다. 수치는 우선순위 표기(`P0`~`P3`)와 필드 개수뿐이다.

@callout level=open-question title="원문끼리 맞지 않거나 명시되지 않은 곳"
| 첫째, `SKILL.md`는 위협 모델과 검증된 후보를 `list_codex_security_candidates`로 읽으라고 쓰지만, 이 도구는 ledger 후보 행만 돌려준다. 위협 모델을 읽는 방법은 이 문장에 없다. 보조 파일 읽기 도구가 running scan의 `threatmodel.md`를 읽을 수 있다는 규정은 `artifact-storage.md`에 있다. 둘째, 기본 rubric은 Informational 등급을 두지만 이 도구의 `reportable` severity에는 `informational`이 없고 `ignore`만 있다. 최종 보고서가 informational finding을 세고 상세를 생략한다는 규정은 따로 있다. 정보성 관찰이 compact diff에서 어디로 가는지는 원문에 명시 없음이다. 셋째, `deferred`를 언제 쓰는지의 정의는 정책 문서에 없고 schema가 `proof_gap`을 요구한다는 사실만 확인했다.[](source:wb)[](source:disc-list)[](source:store-model)[](source:rub-low)[](source:schema-dec)[](source:final-info) |

@callout level=open-question title="확인하지 못한 것"
| 호스트 도구를 호출하지 않았고, `attack_path` 객체가 ledger에 쓰이는 모습은 코드를 읽어서만 확인했다. `publish-findings`가 Continuum 증거를 실제로 어떤 형식으로 저장하는지는 3줄과 25줄만 읽어 확인하지 못했다.[](source:ledger)[](source:pub25) |

분석 중 원본은 수정하지 않았고, 스킬의 어떤 명령도 실행하지 않았다.
