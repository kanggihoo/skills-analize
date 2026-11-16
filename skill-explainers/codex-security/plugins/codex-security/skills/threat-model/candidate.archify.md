# threat-model은 언제 켜지고 위협 모델을 어떻게 고르고 저장하나? {#threat-model-page}

`threat-model`은 저장소의 실제 구조, 공격자 능력, 신뢰 경계로 위협 모델을 만들거나 재사용하는 단계 스킬이다.[](source:purpose) scan이 이미 위협 모델 단계에 있거나, 사용자가 `$threat-model`을 직접 부르거나, 저장소 위협 모델의 작성·갱신·저장을 명시적으로 요청할 때 쓴다. 전체 PR, commit, branch, patch, 저장소 scan을 시작하는 1차 트리거로는 쓰지 않는다.[](source:fm)

- 모델 선택에는 순서가 있다. 받은 모델과 사용자가 지정한 권위 있는 지침은 갱신 요청이 없으면 그대로 둔다. 맥락이나 좁은 범위가 붙은 scan은 공유 캐시를 읽지도 바꾸지도 않는다.[](source:select)
- 공유 모델은 끝의 `Repository`와 `Version` 줄이 현재 대상과 같고 사용자가 새로 만들라고 하지 않았을 때만 재사용한다.[](source:select)[](source:cache)
- 읽기 전용·오프라인으로 만든다. 모델 안의 시나리오는 가설이고, 코드로 확인한 사실과 가정·모르는 것을 나눠 적는다.[](source:ref-ro)[](source:ref-cite)
- Standard scan과 Deep worker는 이 스킬을 부르지 않는다. 자기 workflow 안에서 같은 `threat-model.md` 지침을 직접 읽는다.[](source:purpose)[](source:core11)

@answer scope="로컬 원본 분석 · 스킬·도구 실행 없음 · 커밋 cd5035b 기준"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source fm title="codex-security/plugins/codex-security/skills/threat-model/SKILL.md · 2986B · frontmatter" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=1:4
@source purpose title="codex-security/plugins/codex-security/skills/threat-model/SKILL.md · 2986B · 목적과 Standard·Deep 제외" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=8:8
@source inputs title="codex-security/plugins/codex-security/skills/threat-model/SKILL.md · 2986B · 읽을 문서와 필수 입력" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=10:10
@source select title="codex-security/plugins/codex-security/skills/threat-model/SKILL.md · 2986B · 모델 선택 4규칙" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=14:17
@source policy title="codex-security/plugins/codex-security/skills/threat-model/SKILL.md · 2986B · 정책 해석" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=19:19
@source gen title="codex-security/plugins/codex-security/skills/threat-model/SKILL.md · 2986B · 생성·갱신" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=21:21
@source retain title="codex-security/plugins/codex-security/skills/threat-model/SKILL.md · 2986B · 결과 보관" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=25:27
@source yaml title="codex-security/plugins/codex-security/skills/threat-model/agents/openai.yaml · 171B · 표시 이름과 기본 prompt" path=codex-security/plugins/codex-security/skills/threat-model/agents/openai.yaml
@source ref-ro title="codex-security/plugins/codex-security/references/threat-model.md · 7751B · 읽기 전용·오프라인, 허가 아님" path=codex-security/plugins/codex-security/references/threat-model.md lines=3:3
@source ref-arch title="codex-security/plugins/codex-security/references/threat-model.md · 7751B · 구조와 경계" path=codex-security/plugins/codex-security/references/threat-model.md lines=7:12
@source ref-cite title="codex-security/plugins/codex-security/references/threat-model.md · 7751B · 인용·검증·secret" path=codex-security/plugins/codex-security/references/threat-model.md lines=14:14
@source ref-rev title="codex-security/plugins/codex-security/references/threat-model.md · 7751B · 독립 reviewer" path=codex-security/plugins/codex-security/references/threat-model.md lines=16:28
@source ref-scn title="codex-security/plugins/codex-security/references/threat-model.md · 7751B · 위협 시나리오" path=codex-security/plugins/codex-security/references/threat-model.md lines=30:36
@source ref-contract title="codex-security/plugins/codex-security/references/threat-model.md · 7751B · scan 결과 계약" path=codex-security/plugins/codex-security/references/threat-model.md lines=38:42
@source ref-fields title="codex-security/plugins/codex-security/references/threat-model.md · 7751B · 필드 6개와 정리 규칙" path=codex-security/plugins/codex-security/references/threat-model.md lines=44:55
@source ref-stand title="codex-security/plugins/codex-security/references/threat-model.md · 7751B · 단독 문서" path=codex-security/plugins/codex-security/references/threat-model.md lines=57:59
@source store-scan title="codex-security/plugins/codex-security/references/artifact-storage.md · 7947B · scan 소유권" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=7:9
@source store-supp title="codex-security/plugins/codex-security/references/artifact-storage.md · 7947B · 보조 파일과 소유자" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=13:18
@source store-kind title="codex-security/plugins/codex-security/references/artifact-storage.md · 7947B · storage 종류" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=20:23
@source store-path title="codex-security/plugins/codex-security/references/artifact-storage.md · 7947B · 허용 path와 threatmodel.md" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=37:37
@source cache title="codex-security/plugins/codex-security/references/artifact-storage.md · 7947B · 위협 모델 캐시와 footer" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=47:54
@source paths title="codex-security/plugins/codex-security/references/scan-artifacts.md · 11701B · 위협 모델 경로" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=24:29
@source guide-res title="codex-security/plugins/codex-security/references/security-guidance.md · 2830B · 정책 해석 명령과 규칙" path=codex-security/plugins/codex-security/references/security-guidance.md lines=5:12
@source guide-rule title="codex-security/plugins/codex-security/references/security-guidance.md · 2830B · chain 순서와 untrusted" path=codex-security/plugins/codex-security/references/security-guidance.md lines=34:36
@source contract title="codex-security/plugins/codex-security/references/scan-contract.md · 16529B · 192줄 중 일부만 읽음, scan.threatModel" path=codex-security/plugins/codex-security/references/scan-contract.md lines=173:173
@source contract-kind title="codex-security/plugins/codex-security/references/scan-contract.md · 16529B · target 종류" path=codex-security/plugins/codex-security/references/scan-contract.md lines=58:62
@source core11 title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · Standard의 위협 모델 3단계" path=codex-security/plugins/codex-security/references/core-scan.md lines=11:11
@source core18 title="codex-security/plugins/codex-security/references/core-scan.md · 7479B · 단계 스킬 호출 금지" path=codex-security/plugins/codex-security/references/core-scan.md lines=18:18
@source doc-save title="codex-security/plugins/codex-security/mcp-app/src/threat-model-document.ts · 2657B · threatmodel.md 만들기" path=codex-security/plugins/codex-security/mcp-app/src/threat-model-document.ts lines=12:31
@source doc-write title="codex-security/plugins/codex-security/mcp-app/src/threat-model-document.ts · 2657B · 원본 위치와 provisional" path=codex-security/plugins/codex-security/mcp-app/src/threat-model-document.ts lines=33:73
@source render-body title="codex-security/plugins/codex-security/mcp-app/src/threat-model-render.ts · 5406B · 본문 만들기" path=codex-security/plugins/codex-security/mcp-app/src/threat-model-render.ts lines=44:89
@source render-foot title="codex-security/plugins/codex-security/mcp-app/src/threat-model-render.ts · 5406B · Saved Model Context footer" path=codex-security/plugins/codex-security/mcp-app/src/threat-model-render.ts lines=138:167
@source store-ts title="codex-security/plugins/codex-security/mcp-app/src/artifact-storage.ts · 8872B · 140~185줄만 읽음, 허용 path" path=codex-security/plugins/codex-security/mcp-app/src/artifact-storage.ts lines=154:169
@source tools-draft title="codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts · 15421B · draft 도구 설명" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=168:186
@source dscan title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 위임하는 쪽" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=28:28
@source disc title="codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md · 5076B · 위협 모델을 근거로 쓴다" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=8:10
@source atk title="codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md · 5355B · 위협 모델을 쓰는 곳" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=12:14
@source vis title="codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md · 19102B · 83줄 중 1~16줄과 72줄만 읽음" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=10:10
@source vis72 title="codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md · 19102B · --assessment 명령" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=70:74
@source pol8 title="codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md · 5982B · 93줄 중 1~40줄만 읽음, SECURITY.md는 정책 맥락" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=8:8
@source pol36 title="codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md · 5982B · 경계 확인용으로 읽는 자료" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=36:36
@source scan10 title="codex-security/plugins/codex-security/skills/security-scan/SKILL.md · 2972B · 1~21줄만 읽음, core audit 사용" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=10:10
@source readme title="codex-security/plugins/codex-security/skills/README.md · 3752B · threat-model 안내 줄" path=codex-security/plugins/codex-security/skills/README.md lines=19:19
@source readme-scan title="codex-security/plugins/codex-security/skills/README.md · 3752B · scan 선택 안내" path=codex-security/plugins/codex-security/skills/README.md lines=5:9
@source mcpjson title="codex-security/plugins/codex-security/.mcp.json · 2078B · MCP 서버 codex-security" path=codex-security/plugins/codex-security/.mcp.json lines=1:6
@source pluginjson title="codex-security/plugins/codex-security/.codex-plugin/plugin.json · 1682B · skills 폴더 선언" path=codex-security/plugins/codex-security/.codex-plugin/plugin.json lines=18:20

## 언제 켜지고 언제 쓰면 안 되나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 문구와 정확히 일치해야 켜진다는 뜻은 아니다.

`disable-model-invocation` 같은 호출 제한 필드는 원문에 명시 없음이다. `agents/openai.yaml`에도 `policy`가 없고 표시 이름과 기본 prompt만 있다.[](source:fm)[](source:yaml)

@code source=fm language=yaml

| 상황 | 에이전트의 행동 |
|---|---|
| scan이 이미 위협 모델 단계에 있다 | 이 스킬을 쓴다.[](source:fm) |
| 사용자가 `$threat-model`을 직접 부른다 | 이 스킬을 쓴다. 기본 prompt는 저장소 위협 모델을 만들라는 문장이다.[](source:fm)[](source:yaml) |
| 사용자가 저장소 위협 모델의 작성·갱신·저장을 명시적으로 요청한다 | 이 스킬을 쓴다.[](source:fm) |
| 전체 PR, commit, branch, patch, 저장소 scan을 시작하라는 요청 | 이 스킬을 1차 트리거로 쓰지 않는다. 벤더 안내문은 scan 선택을 `security-scan`, `security-diff-scan`, `deep-security-scan`에 둔다.[](source:fm)[](source:readme-scan) |
| Standard scan이나 Deep worker 안 | 이 스킬을 호출하지 않는다. 자기 workflow에서 모델을 만들고 `threat-model.md`를 직접 읽는다. `core-scan.md`도 별도 단계 스킬을 부르지 말라고 한다.[](source:purpose)[](source:core11)[](source:core18) |
| 필수 입력이 명시됐는데 없다 | 생성한 모델로 대신하지 않고 사용자에게 그 입력을 요청한다.[](source:inputs) |

명시된 경로는 그대로 따른다. 모델을 만들기 전에 `../../references/artifact-storage.md`와 `scan-artifacts.md`를 읽고, 적용되는 `SECURITY.md` 정책은 호출자가 주지 않았을 때 `security-guidance.md` 방식으로 해석한다.[](source:inputs)[](source:policy)

## 어떤 모델을 쓰고 언제 새로 만드나? {#select}

원문은 모델 선택을 네 규칙으로 쓴다. 규칙끼리 우선순위를 번호로 정하지는 않았다. 아래 그림은 규칙의 조건문을 읽어 순서를 세운 판정이다.[](source:select)

@workflow id=select-flow title="위협 모델 선택"
| need | 모델이 필요하다 | external |
| ctx | 받은 모델·맥락이 있나? | backend |
| fresh | scan 전용 모델 | backend |
| reuse | 공유 모델 재사용? | backend |
| shared | 공유 모델 사용 | backend |
| gen | 새로 생성 | backend |
| need > ctx | |
| ctx > fresh | 있음 | emphasis |
| ctx > reuse | 없음 |
| reuse > shared | 조건 충족 |
| reuse > gen | 아님 |

@steps id=select-steps
| need | 모델이 필요하다 | 받은 모델이나 사용자가 지정한 권위 있는 보안 지침은 갱신 요청이 없으면 그대로 둔다.[](source:select) | select-flow | need |
| ctx | 받은 모델·맥락이 있나? | scan에 받은 모델, 비어 있지 않은 `userContext`, 권위 있는 knowledge base, 더 좁은 범위 중 하나라도 있는지 본다.[](source:select) | select-flow | ctx |
| fresh | scan 전용 모델 | 받은 모델을 보존하거나 이 scan만의 새 모델을 만든다. 공유 캐시는 읽지도 바꾸지도 않는다.[](source:select) | select-flow | fresh |
| reuse | 공유 모델 재사용? | 공유 모델은 끝의 `Repository`와 `Version` 줄이 대상과 현재 revision 또는 snapshot digest에 맞고, 사용자가 교체·생성·갱신을 요청하지 않았을 때만 쓴다. host가 캐시를 우회하라고 하면 따른다.[](source:select) | select-flow | reuse |
| shared | 공유 모델 사용 | 유효한 캐시 적중이면 새로 만들지 않고 기존 문서 경로를 돌려준다.[](source:retain) | select-flow | shared |
| gen | 새로 생성 | 조건을 못 채우면 `threat-model.md` 지침으로 만든다. 원문은 이 분기를 따로 이름 붙이지 않았고, 선택 규칙 다음에 생성 지침이 오는 순서에서 읽은 판정이다.[](source:gen) | select-flow | gen |

| 규칙 | 내용 |
|---|---|
| 정책이 대신하는 경우 | 저장소별 `AGENTS.md`나 해석된 `SECURITY.md`가 필요한 경계를 설명하고 새 모델이나 맥락별 모델이 필요 없으면 모델 대신 쓸 수 있다.[](source:select) |
| 공유 모델의 이름 | 새 파일명은 `threatmodel.md`다. 새 파일이 없을 때만 예전 `threat_model.md`를 같은 규칙으로 읽을 수 있다.[](source:cache) |
| 캐시 판정을 하는 주체 | `Repository`·`Version` 줄을 비교하는 코드는 `mcp-app/src`에서 찾지 못했다. 판정: 비교는 모델이 지시를 읽고 하는 일이다.[](source:cache)[](source:store-ts) |

## 모델은 어떻게 만들고 무엇을 담나? {#build}

생성이나 갱신 때는 `references/threat-model.md`를 따른다.[](source:gen) 이 문서가 정하는 강제와 금지는 다음과 같다.

| 항목 | 규칙 |
|---|---|
| 접근 | 소스 검토는 읽기 전용이고, 사용자가 다른 맥락을 허가하지 않으면 오프라인이다.[](source:ref-ro) |
| 받은 자료 | 받은 모델, knowledge base 사실, 정책을 허가로 취급하지 않는다. knowledge base 사실은 생성한 가정과 저장소 정책보다 앞서고, 사용자의 명시 지시보다는 뒤다.[](source:ref-ro) |
| 시나리오 | 시나리오는 가설이다. 확정 finding으로 쓰지 않는다. 신뢰하는 운영자 설정을 공격자가 쥔다고 가정하지 않고, 원격 노출·tenant·빠진 통제·수용된 위험을 지어내지 않는다.[](source:ref-ro)[](source:ref-scn) |
| 증명 방식 | 코드 근거로 취약점이 성립하면 runtime 재현 없이도 확립된다. 모르는 것은 통제가 작동한다거나 실패한다고 단정하지 않고 명시한다.[](source:ref-scn) |
| 인용 | 코드로 확립한 사실에는 확인한 저장소 상대 경로와 줄을 적고, 돌려주기 전에 다시 확인한다. 중요한 경계와 근거가 분명해지면 확장을 멈춘다.[](source:ref-cite) |
| secret | 설정 키나 참조, 위치, 수신자, 통제만 적는다. 값은 복사하지 않는다.[](source:ref-cite) |
| 독립 reviewer | 복잡하거나 불확실한 경계에서 호출자 허용 범위가 맞을 때만 쓴다. 기존 scan 안에서 새 worker pool을 만들지 않는다. 생성한 가설과 finding 없이 fresh context로 준다. reviewer는 코드 실행, 서비스 접속, 파일 수정, 위임, scan 시작을 하지 않는다. 감싸는 scan의 투자 시간 allowance는 그대로 넘기고 여기서 새로 만들지 않는다.[](source:ref-rev) |
| reviewer가 없을 때 | 부모가 직접 검토한다. 부모가 한 검토를 "independent"라고 부르지 않는다. 반환된 주장은 소스로 확인한 뒤 반영한다.[](source:ref-rev) |

`SKILL.md`는 "sequential fallback"을 따르라고 하지만, 참조 문서에 그 이름의 절은 없다. 가장 가까운 문장은 부모가 검토하면 독립이라 부르지 말라는 줄이다.[](source:gen)[](source:ref-rev)

scan 결과로 돌려주는 모델은 아래 여섯 필드에 나눠 담는다.[](source:ref-fields)

@facts
| `summary` | 제품 목적, 구성 요소, 데이터 흐름, 일반적인 배포.[](source:ref-fields) |
| `assets` | 보호할 데이터, 신원, 권한, 무결성 보장.[](source:ref-fields) |
| `trustBoundaries` | 주체, 넘어가는 권한과 데이터, 실효 통제, 소스 근거.[](source:ref-fields) |
| `attackerCapabilities` | 시작 능력, 없는 권한, 얻을 수 있는 추가 능력.[](source:ref-fields) |
| `securityObjectives` | 지켜야 할 불변식. 사용자가 요청한 설정과 한도를 포함한다.[](source:ref-fields) |
| `assumptions` | 전제, 제외, 문서와 구현의 차이, 모르는 것.[](source:ref-fields) |

시나리오는 finding, 소스로 확인한 처분, 열린 질문으로 정리한다. 해소된 통제 질문과 기각은 `reviewState.surfaces[].notes`에 소스 앵커와 함께, 풀리지 않은 전제는 `reviewState.openQuestions`에 둔다. 별도의 추측 finding 목록은 만들지 않는다.[](source:ref-fields)

## 결과는 어디에 어떻게 저장되나? {#retain}

| 상황 | 에이전트의 행동 |
|---|---|
| 실행 중인 scan | `{ "format": "markdown", "content": "<exact model text>" }`를 호출자에게 돌려주고, 검토한 surface와 남은 일을 담은 `complete: false` checkpoint를 일찍 저장한다. `<scan_dir>/threatmodel.md`는 host가 만든다. 이후 단계는 선택한 텍스트를 그대로 쓴다.[](source:retain)[](source:ref-contract) |
| 받은 모델이 있다 | 받은 텍스트는 `origin: "provided"`로 원문 그대로 보관한다. 선언된 범위를 알면 기록하고, 받은 worker 모델이 부모 범위를 덮는다고 가정하지 않는다.[](source:ref-contract) |
| 단독 요청 | `threatmodel.md`를 artifact storage 도구로 저장하거나, 유효한 캐시 적중이면 기존 경로를 돌려준다. 저장소 모델은 `targetPath`와 `persistent`로 쓴다.[](source:retain)[](source:cache) |
| 재사용할 저장소 모델을 직접 만들거나 고치라는 요청 | host가 금지하지 않으면 공유 출력을 갱신할 수 있다. 이때만 `Repository`와 `Version` 줄을 붙인다.[](source:retain) |
| scan 모델의 저장·export | 공유 캐시를 갱신해도 된다는 허가가 아니다.[](source:retain) |
| Deep 부모 scan | 첫 모델을 `scan.threatModel`에 두고 다른 worker의 모델은 worker 기록에 둔다. 모델은 구조화 형태이거나 `{ "format": "markdown", "content": ... }`일 수 있다. `threatmodel.md`는 주 모델에서 host가 만든 export이고 따로 쓰는 입력이 아니다.[](source:contract) |
| 벤더 안내 | 단독으로 돌렸다면 scan 출력 폴더가 아니라 plugin의 artifact storage에서 그 repo의 `threatmodel.md`를 찾으라고 한다.[](source:readme) |

공유 모델의 끝에 붙는 두 줄은 `Repository: <stable target identity>`와 `Version: <immutable Git tree면 revision, 아니면 snapshot digest>`다. 대상 종류는 `git_revision`, `git_worktree`, `git_diff`, `directory_snapshot`이다.[](source:cache)[](source:contract-kind)

@callout level=warning title="scan용 threatmodel.md와 공유 캐시는 다른 파일이다"
| 실행 중인 scan의 `threatmodel.md`는 host가 `scan-manifest.json`의 `scan.threatModel`에서 렌더링한다. 보조 파일 저장 도구로는 바꿀 수 없다. 저장 도구가 `threatmodel.md`를 쓰는 것은 scanId 없이 standalone으로 부를 때뿐이다.[](source:store-path)[](source:store-ts)[](source:doc-write) |

host가 쓰는 `threatmodel.md`의 모양은 코드를 읽어 확인했다.

- markdown 모델이면 본문을 그대로 쓰고, 구조화 모델이면 `# Threat Model` 아래 절로 렌더링한다.[](source:render-body)
- 뒤에 `Saved Model Context` footer를 붙인다. source, scan, target, revision, snapshot, 결과 상태, 모델 origin과 범위가 들어간다.[](source:render-foot)
- scan이 `complete`가 아니면 provisional model이라는 문장도 붙는다.[](source:render-foot)[](source:doc-write)
- 이 문서를 쓰다 실패해도 모델 저장은 성공으로 남고 실패 이유만 문자열로 돌려준다.[](source:doc-save)[](source:doc-write)

## 흐름 속 위치는 어디인가? {#position}

@workflow id=position-flow title="diff scan에서 발견과 시각화로"
| before | security-diff-scan | backend | source:dscan |
| current | threat-model | backend | source:fm |
| after | finding-discovery | backend | source:disc |
| viz | threat-model-visualize | backend | source:vis |
| before > current | 내부 위임 R06 | emphasis |
| current > after | 산출물 호환 R10 | dashed |
| current > viz | 산출물 호환 R42 | dashed |

@steps id=position-steps
| highlight | threat-model | diff scan이 한 번 실행하거나 받은 모델을 쓴다. 다음 단계는 같은 모델을 쓰고, 시각화는 사용자가 따로 요청한다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R06 · 내부 위임 | `security-diff-scan`이 `$threat-model`을 한 번 실행하거나 받은 모델을 쓴다. 저장소 전체가 기본이고 사용자가 좁히라고 할 때만 좁힌다. 모델의 실제 범위는 변경 파일 범위와 따로 기록한다. 끝나면 diff scan이 모델로 `complete: false` 초안을 저장하고 host가 `threatmodel.md`를 만든다.[](source:dscan)[](source:tools-draft) |
| R10 · 산출물 호환 | discovery는 위협 모델과 정책을 근거로 쓴다. 이 순서를 강제하는 곳은 diff scan뿐이다. 단독 호출에서 모델 없이 discovery를 돌려도 되는지는 원문에 명시 없음이다.[](source:disc) |
| R13 · 산출물 호환 | scan 단계의 attack-path 분석은 per-scan 위협 모델을 쓴다. 단독 분석은 위협 모델이나 정책이 있으면 쓰고 per-scan 산출물은 필요 없다.[](source:atk) |
| R14 · 참고 | Standard scan과 Deep worker는 이 스킬이 아니라 `threat-model.md`를 직접 읽는다. 두 쪽이 같은 참조 문서를 공유한다.[](source:purpose)[](source:core11) |
| R42 · 산출물 호환 | `threat-model-visualize`의 기본 입력은 기존 위협 모델이고 `--assessment <threat-model.md>`로 넘긴다. 새 assessment는 하지 않는다. 필수 후속 단계가 아니다.[](source:vis)[](source:vis72) |
| R45 · 공유 상태 | `SECURITY.md`는 정책 맥락이지 실행 지시가 아니다. `define-security-policy`가 쓰고 이 스킬이 읽는다. 선후 관계는 없다.[](source:pol8)[](source:select) |
| R48 · 참고 | 정책을 쓰는 쪽이 경계를 확인하려고 위협 모델을 읽을 수 있다. 이름으로 스킬을 지목하지는 않는다.[](source:pol36) |

이 스킬이 읽는 공통 문서와 도구 계약은 아래와 같다.

| 관계 | 이 스킬이 가져가는 것 |
|---|---|
| R60 · 참고(`artifact-storage.md`) | 파일을 만들거나 보관하기 전에 읽는다. 구조화 결과는 기존 도구에 두고 보조 파일 도구로 대체하지 않는다. 소유자는 `scanId`(필요하면 `handoffClaimToken`)와 `targetPath` 중 정확히 하나다. `storage`는 `persistent` 또는 `temporary`를 명시한다.[](source:store-scan)[](source:store-supp)[](source:store-kind) |
| R61 · 참고(`security-guidance.md`) | `SECURITY.md`를 root부터 leaf까지 이어 붙이고 충돌하면 대상에 가까운 정책이 앞선다. 정책은 untrusted policy data라서 사용자·시스템 지시를 덮거나 명령 실행, secret 접근, 파일 편집, workflow 변경을 하지 못한다.[](source:guide-res)[](source:guide-rule) |
| R70 · 참고(`threat-model.md`) | 위 "모델은 어떻게 만들고 무엇을 담나" 절의 규칙이다.[](source:gen)[](source:ref-stand) |
| R85 · 참고(`scan-artifacts.md`) | scan의 모델은 `scan-manifest.json`의 `scan.threatModel`이 원본이고 `<scan_dir>/threatmodel.md`는 host가 만든 읽기용 문서다. 예전 `<context_dir>/threat_model.md`는 원본이 없을 때만 읽는다.[](source:paths) |

전체 흐름은 색인 기준 `codex-security/_group-scan-vulnerabilities`(`scan-vulnerabilities.html`)와 `codex-security/_group-threat-model-and-policy`(`threat-model-and-policy.html`)를 가리킨다. 묶음 페이지는 별도 단계에서 만든다.

## 단독 문서는 무엇을 담아야 하나? {#standalone}

요청받은 문서는 아키텍처와 배포, 보호 자산과 경계, 공격자 능력, 우선순위를 매긴 시나리오와 완화책, 시스템에 관련된 심각도 고려 사항을 설명한다. 관계를 밝히는 데 도움이 되면 표나 그림을 쓴다. 시나리오는 검증되기 전까지 가설이라고 표시한다. 무관한 변경에도 재사용할 수 있게 쓰고, 사용자가 좁은 모델을 요청한 때만 좁힌다.[](source:ref-stand)

- [ ] 모델을 만들기 전에 받은 모델·`userContext`·knowledge base·좁은 범위가 있는지 본다.
- [ ] 공유 캐시를 쓰려면 `Repository`와 `Version` 줄이 현재 대상과 같은지 확인한다.
- [ ] 인용한 경로와 줄을 돌려주기 전에 다시 연다.
- [ ] secret 값은 복사하지 않고 키와 위치만 적었는지 본다.
- [ ] scan 모델을 저장했다면 공유 캐시를 건드리지 않았는지 본다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `threat-model/SKILL.md` 2,986B, `agents/openai.yaml` 171B를 끝까지 읽었다. 스킬 폴더의 텍스트 파일은 이 둘이 전부다.[](source:fm)[](source:yaml) |
| 필수 참조 | `references/threat-model.md` 7,751B, `artifact-storage.md` 7,947B, `scan-artifacts.md` 11,701B, `security-guidance.md` 2,830B를 끝까지 읽었다.[](source:ref-fields)[](source:cache)[](source:paths)[](source:guide-rule) |
| 도구 구현 | `threat-model-document.ts` 2,657B와 `threat-model-render.ts` 5,406B를 끝까지 읽었다. 렌더러가 가져오는 `threat-model-format.ts`, `threat-model-schema.ts`는 읽지 않았다.[](source:doc-write)[](source:render-foot) |
| 구조·표본만 확인(전부 읽지 않음) | `scan-contract.md`(16,529B)는 target 종류와 `scan.threatModel` 줄만, `artifact-storage.ts`(8,872B)는 허용 path 함수 주변 140~185줄만, `threat-model-visualize/SKILL.md`(19,102B)는 1~16줄과 70~74줄만, `define-security-policy/SKILL.md`는 1~40줄만, `security-scan/SKILL.md`는 1~21줄만 읽었다. |
| 관계 근거 | `security-diff-scan/SKILL.md` 5,405B, `finding-discovery`와 `attack-path-analysis`의 인용 줄, `core-scan.md` 7,479B를 읽었다. `skills/README.md`, `.mcp.json`, `plugin.json`은 공통 확인용으로 읽었다.[](source:dscan)[](source:core11)[](source:readme)[](source:mcpjson)[](source:pluginjson) |
| 제외 | 번역본 없음. 바이너리 없음. 외부 URL은 열지 않았다. |

읽은 텍스트 파일은 21개이고 이 중 부분 읽음은 5개다. 원문의 활성화 조건 3개, 선택 규칙 4개, 필수 입력 질문, scan·단독 저장 방식, 필드 6개, 독립 reviewer 조건을 모두 대조했다. 이 스킬에는 원문 수치 한도가 없다.

@callout level=open-question title="확인하지 못한 것"
| 렌더러가 가져오는 `threat-model-format.ts`와 `threat-model-schema.ts`를 읽지 않아서, 구조화 모델(`summary`·`assets` 등)과 markdown 모델이 어떤 검증을 통과하는지는 확인하지 못했다. 캐시의 `Repository`·`Version` 비교 코드는 찾지 못했다. host 도구를 호출하지 않았고, `threatmodel.md`가 실제로 만들어지는 모습은 코드를 읽어서만 확인했다.[](source:render-foot)[](source:doc-write) |

분석 중 원본은 수정하지 않았고, 스킬의 어떤 명령도 실행하지 않았다.
