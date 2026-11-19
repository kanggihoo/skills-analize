# 소스에서 취약점을 찾을 때 일곱 스킬은 어떻게 이어지나? {#group-scan-vulnerabilities}

사용자는 대상 범위에 따라 `security-scan`, `security-diff-scan`, `deep-security-scan` 중 하나를 고른다. **단계 스킬 네 개를 순서대로 부르는 것은 `security-diff-scan`뿐이고, Standard와 Deep은 단계 스킬을 부르지 않는다.**[](source:diff-flow)[](source:fd-skip)

- 저장소나 경로는 `security-scan`이 기본이다. 변경분은 diff 스킬, 명시한 deep 요청은 deep 스킬이다.[](source:scan-desc)[](source:diff-desc)[](source:deep-desc)
- `security-diff-scan`은 `threat-model`, `finding-discovery`, `validation`, `attack-path-analysis`를 이 순서로 한 번씩 부른다.[](source:diff-flow)
- 단계 스킬 넷은 `candidate_ledger.jsonl`과 `threatmodel.md`를 통해 이어진다. 서로를 직접 부르지 않는다.[](source:ledger-doc)
- 스킬 내부 규칙은 각 스킬의 개요 페이지에서 본다. 이 페이지는 스킬 사이의 순서와 주고받는 것만 다룬다.

@answer scope="codex-security 컬렉션 · 묶음 scan-vulnerabilities · 스킬 7개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source scan-desc title="security-scan description" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=3:3
@source scan-core title="security-scan: core audit 사용" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=10:10
@source diff-desc title="security-diff-scan description" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=3:3
@source diff-setup title="diff scan 설정과 scan 시작" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=12:14
@source diff-tm title="diff scan 1단계: threat-model" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=28:28
@source diff-fd title="diff scan 2~3단계: 목록과 discovery" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=29:30
@source diff-val title="diff scan 4단계: validation과 attack-path" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=31:31
@source diff-fin title="diff scan 5~6단계: 초안과 완료" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=32:33
@source diff-flow title="diff scan 단계 전체" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=28:33
@source deep-desc title="deep-security-scan description" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=3:3
@source deep-intro title="Deep scan 동작 요약" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=8:8
@source deep-mode title="Deep 이어 실행 시 모드별 스킬" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=10:10
@source deep-done title="Deep 완료 보고" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=14:14
@source tm-skip title="threat-model: Standard·Deep은 호출하지 않음" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=8:8
@source tm-keep title="threat-model: 결과 보관" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=25:25
@source fd-skip title="finding-discovery: 워크플로 선택" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=14:18
@source fd-use title="finding-discovery: 근거와 설명" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=8:8
@source val-skip title="validation: scan 통합" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=21:21
@source val-diff title="validation: compact diff 계약" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=25:30
@source ap-skip title="attack-path-analysis: scan 통합" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=27:27
@source ap-diff title="attack-path-analysis: compact diff 계약" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=31:36
@source ap-model title="attack-path-analysis: scan 단계 입력" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=12:12
@source core-scan title="core-scan: 단계 스킬을 부르지 않음" path=codex-security/plugins/codex-security/references/core-scan.md lines=18:18
@source ledger-doc title="compact diff의 후보 ledger" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=41:49
@source tm-doc title="per-scan threatmodel.md 정의" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=28:29
@source tm-render title="threatmodel.md 렌더링 코드" path=codex-security/plugins/codex-security/mcp-app/src/threat-model-document.ts lines=33:70
@source seal-doc title="봉인 문서 정의" path=codex-security/plugins/codex-security/references/scan-contract.md lines=9:14
@source primary-doc title="Deep 부모의 primary model" path=codex-security/plugins/codex-security/references/scan-contract.md lines=173:173
@source phase-code title="scan 진행 phase 순서" path=codex-security/plugins/codex-security/scripts/workbench_progress.py lines=267:268

## 어떤 대상에 어떤 스킬을 쓰나? {#choice span=12}

판단은 "무엇을 스캔하나?" 하나다. 저장소나 경로면 `security-scan`, 변경분이면 `security-diff-scan`, 사용자가 deep을 명시했으면 `deep-security-scan`이다. 스킬이 세 갈래를 직접 가르는 것은 `security-scan`의 description이고, 호스트와 사용자가 실제로 고른다(R01, R02).

그림에는 R01과 R02만 그렸다. R03~R05는 아래 표에 있고 "그림에서 생략"이다.

@workflow id=choice-flow title="대상에 따른 스캔 스킬 선택"
| ask | 스캔 대상이 무엇인가? | external | source:scan-desc |
| std | security-scan | backend | source:scan-core |
| diff | security-diff-scan | backend | source:diff-desc |
| deep | deep-security-scan | backend | source:deep-intro |
| ask > std | 저장소·경로 | emphasis |
| ask > diff | PR·commit·branch·working tree 변경 |
| ask > deep | deep 명시 요청 |

@steps id=choice-steps
| c-ask | 스캔 대상이 무엇인가? | 사용자가 말한 대상이 저장소·경로인지, 변경분인지, deep 요청인지 가른다.[](source:scan-desc) | choice-flow | ask |
| c-std | security-scan | 현재 source를 한 번의 audit로 감사한다. 이 묶음의 기본 단일 감사다.[](source:scan-desc)[](source:scan-core) | choice-flow | std |
| c-diff | security-diff-scan | 변경된 텍스트 파일을 모두 보고 변경 동작이 닿는 지원 코드까지 따라간다.[](source:diff-desc) | choice-flow | diff |
| c-deep | deep-security-scan | 호스트가 Standard audit를 반복해 finding을 병합한다.[](source:deep-intro) | choice-flow | deep |

## diff scan은 단계 스킬을 어떤 순서로 부르나? {#diff-order span=12}

`security-diff-scan`이 `threat-model`, `finding-discovery`, `validation`, `attack-path-analysis`를 순서대로 부르고 끝나면 돌아온다(R06~R09). `validation`은 후보가 있을 때만 돌고, `attack-path-analysis`는 `reportable` 또는 `deferred`인 후보만 받는다.[](source:diff-val)

그림은 R06~R09만 그렸다. 후보가 있는지 묻는 노드는 원문 4단계 "If candidates exist"를 옮긴 것이다. 도구가 요구하는 입력 조건은 스킬 페이지에서 본다.

@workflow id=diff-flow title="diff scan의 단계 호출 순서"
| setup | scan 시작 | backend | source:diff-setup |
| tm | threat-model | security | source:diff-tm |
| fd | finding-discovery | security | source:diff-fd |
| has | 후보가 있는가? | backend | source:diff-val |
| val | validation | security | source:diff-val |
| ap | attack-path-analysis | security | source:diff-val |
| fin | 초안 저장과 완료 | backend | source:diff-fin |
| setup > tm | |
| tm > fd | 모델 |
| fd > has | |
| has > val | yes | emphasis |
| has > fin | no |
| val > ap | reportable·deferred만 |
| ap > fin | |

@steps id=diff-steps
| d-setup | scan 시작 | `security-diff-scan`이 Git range나 local patch를 고정하고 `start_codex_security_prompt_only_scan`으로 scan을 연다.[](source:diff-setup) | diff-flow | setup |
| d-tm | threat-model | 위협 모델을 한 번 만들거나 사용자가 준 모델을 쓰고 `complete: false` 초안으로 저장한다.[](source:diff-tm) | diff-flow | tm |
| d-fd | finding-discovery | 변경 파일 목록을 읽고 후보를 한 번에 기록한다.[](source:diff-fd) | diff-flow | fd |
| d-has | 후보가 있는가? | 후보가 없으면 validation을 돌리지 않는다. 원문 4단계가 정한 조건이다.[](source:diff-val) | diff-flow | has |
| d-val | validation | 후보마다 근거를 따져 처분하고 한 번에 제출한다.[](source:val-diff) | diff-flow | val |
| d-ap | attack-path-analysis | `reportable`·`deferred` 후보의 공격 경로와 보고 여부를 정해 한 번에 제출한다.[](source:ap-diff) | diff-flow | ap |
| d-fin | 초안 저장과 완료 | 최종 초안을 저장하고 `complete_codex_security_scan`을 한 번 부른다. SDK가 완료를 맡는 scan은 예외다.[](source:diff-fin) | diff-flow | fin |

@callout level=open-question title="후보가 0건일 때 validation을 부르나?"
`security-diff-scan`은 후보가 있을 때만 `$validation`을 돌리라고 한다.[](source:diff-val) `validation`은 빈 집합에도 `validations: []`를 제출하라고 한다.[](source:val-diff) 원문은 우선순위를 정하지 않는다(원문에 명시 없음). 도구 쪽은 빈 배열을 받는다는 코드 확인이 원장 R08에 있다. 이 해석은 판정이다.

## 스킬 사이에 무엇을 넘기고 참고하나? {#relations span=12}

원장의 관계 중 이 묶음 스킬끼리 이어진 행이다. 다음 안내와 참고는 자동 실행이 아니다. "호출"은 `security-diff-scan` 안에서 순서대로 실행하고 끝나면 돌아오는 관계다.

| 누가 | 누구를 | 관계 | 언제 | 그림 |
| --- | --- | --- | --- | --- |
| `security-scan` {#g-r01} | `security-diff-scan` | 다음 안내 | 대상이 PR, commit, branch, working-tree 변경이면 쓰라고 description이 정한다. 스킬 이름은 적지 않는다[](source:scan-desc) | 선택 그림 |
| `security-scan` {#g-r02} | `deep-security-scan` | 다음 안내 | 사용자가 deep scan을 명시적으로 요청했을 때만 쓰라고 한다[](source:scan-desc) | 선택 그림 |
| `deep-security-scan` {#g-r03} | `security-diff-scan` | 다음 안내 | 변경 범위에는 diff 스킬을 쓰라고 한다. 이어 실행하는 scan의 저장된 모드가 diff면 대응하는 scan 스킬로 계속한다[](source:deep-desc)[](source:deep-mode) | 그림에서 생략 |
| `deep-security-scan` {#g-r04} | `security-scan` | 다음 안내 | 저장된 모드가 Standard면 "the corresponding scan skill"로 계속한다. 대응 스킬 이름은 적지 않는다[](source:deep-mode) | 그림에서 생략 |
| `deep-security-scan` {#g-r05} | `security-scan` | 참고 | 호스트가 Standard audit를 반복하고 `core-scan.md`를 공유한다. deep이 security-scan `SKILL.md`를 호출한다는 문장은 없다[](source:deep-intro)[](source:scan-core) | 그림에서 생략 |
| `security-diff-scan` {#g-r06} | `threat-model` | 호출 | "Run `$threat-model` once, or use the supplied model". 한 번만 실행하고 사용자가 모델을 주면 그것을 쓴다[](source:diff-tm) | diff 그림 |
| `security-diff-scan` {#g-r07} | `finding-discovery` | 호출 | compact diff mode로 변경 파일 인벤토리 전체에 실행한다[](source:diff-fd) | diff 그림 |
| `security-diff-scan` {#g-r08} | `validation` | 호출 | 후보가 있을 때 한 번 실행한다. 후보 0건 처리는 위 열린 질문이다[](source:diff-val) | diff 그림 |
| `security-diff-scan` {#g-r09} | `attack-path-analysis` | 호출 | `validation` 다음에 한 번, `reportable`·`deferred` 후보에만 실행한다. 해당 후보가 없으면 `attackPaths: []`를 제출한다[](source:diff-val)[](source:ap-diff) | diff 그림 |

## 그림에서 뺀 관계는 무엇인가? {#omitted span=12}

단계 스킬끼리의 산출물 호환(R10~R13)과 "Standard·Deep은 호출하지 않는다"(R14~R18)는 순서가 아니라서 그림에서 뺐다.

| 누가 | 누구를 | 관계 | 언제 | 그림 |
| --- | --- | --- | --- | --- |
| `threat-model` {#g-r10} | `finding-discovery` | 결과 전달 | discovery는 위협 모델과 보안 정책을 근거로 쓴다. 순서를 강제하는 곳은 diff scan뿐이다. 단독 호출에서 모델 없이 돌려도 되는지는 원문에 명시 없음[](source:fd-use) | 그림에서 생략 |
| `finding-discovery` {#g-r11} | `validation` | 결과 전달 | 후보 ID와 discovery 필드를 보존해 이어받는다. discovery 안에서 validation을 반복하지 않는다[](source:fd-use)[](source:val-skip) | 그림에서 생략 |
| `validation` {#g-r12} | `attack-path-analysis` | 결과 전달 | `reportable` 또는 `deferred` 후보만 분석한다[](source:ap-diff) | 그림에서 생략 |
| `threat-model` {#g-r13} | `attack-path-analysis` | 결과 전달 | scan 단계에서 per-scan 위협 모델과 후보 집합을 쓴다. 단독 분석에서는 per-scan 산출물이 필요 없다[](source:ap-model) | 그림에서 생략 |
| `threat-model` {#g-r14} | `security-scan` | 참고 | Standard와 Deep은 위협 모델을 자기 workflow 안에서 만들고 이 스킬을 부르지 않는다[](source:tm-skip) | 그림에서 생략 |
| `finding-discovery` {#g-r15} | `security-scan` | 참고 | Standard와 Deep은 이 스킬 본문 대신 coordinator의 prompt를 쓴다. `core-scan.md`도 단계 스킬 호출을 금지한다[](source:fd-skip)[](source:core-scan) | 그림에서 생략 |
| `validation` {#g-r16} | `security-scan` | 참고 | Standard와 Deep은 validation을 자기 workflow 안에서 하고 이 스킬을 부르지 않는다[](source:val-skip) | 그림에서 생략 |
| `attack-path-analysis` {#g-r17} | `security-scan` | 참고 | Standard와 Deep은 공격 경로를 자기 workflow 안에서 평가하고 이 스킬을 부르지 않는다[](source:ap-skip) | 그림에서 생략 |
| `finding-discovery` {#g-r18} | `security-scan` | 참고 | compact 인벤토리 없이 diff를 단독 발견할 때만 `security-scan/references/scan-artifacts-and-ledger.md`를 읽는다. 이 묶음의 어느 scan 스킬도 이 경로를 쓰지 않는다[](source:fd-skip) | 그림에서 생략 |

## 스킬들이 어떤 파일과 상태를 공유하나? {#shared-state span=12}

`threatmodel.md`와 후보 ledger는 호스트 workbench가 쓴다. 스킬은 도구에 값을 제출하고, 파일 이름과 형식은 호스트가 정한다.

| 파일 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `threatmodel.md` {#f-tm} | 호스트가 `scan-manifest.json`의 `scan.threatModel`에서 렌더링한다. diff scan은 `threat-model`이 만든 모델을 저장한다(R06, R71)[](source:diff-tm)[](source:tm-render) | `attack-path-analysis`(R13); 묶음 밖 `threat-model-visualize`(R43, R71, R72)[](source:ap-model)[](source:tm-doc) |
| `threatmodel.md`(Deep) {#f-tm-deep} | Deep 부모 scan의 primary model에서 호스트가 만든다. 다른 worker의 모델은 worker 기록에 둔다(R72)[](source:primary-doc) | 묶음 밖 `threat-model-visualize`[](source:primary-doc) |
| `candidate_ledger.jsonl` {#f-ledger} | `finding-discovery`가 후보를 쓰고(replace), `validation`이 `validation` 객체를, `attack-path-analysis`가 `attack_path` 객체를 더한다(R74)[](source:ledger-doc)[](source:val-diff)[](source:ap-diff) | `validation`, `attack-path-analysis`[](source:val-diff)[](source:ap-diff) |
| `scan-manifest.json`, `findings.json` {#f-seal} | scan이 끝날 때 호스트가 봉인한다. Deep은 코디네이터가 봉인하고, SDK 소유 scan은 SDK가 봉인한다(R24~R26)[](source:seal-doc)[](source:deep-done) | 묶음 밖 `track-findings`(R24~R26), 사용자가 `findings.json`을 주면 `triage-finding`(R75)[](source:seal-doc) |

호스트의 진행 phase는 `preflight`, `threat_model`, `discovery`, `validation`, `attack_path`, `reporting` 순이고 이전 phase로 못 돌아간다(R65).[](source:phase-code) 이것은 호스트 상태이고 스킬 호출 순서가 아니다. Standard scan에도 같은 phase가 있어서(R82) 단계 스킬을 부르지 않는 scan도 이 phase를 지난다.
