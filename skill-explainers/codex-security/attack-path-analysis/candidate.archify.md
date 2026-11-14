# attack-path-analysis는 finding을 어떤 근거로 보고하고 어떤 근거로 버리나? {#attack-path-page}

`attack-path-analysis`는 finding마다 공격자가 source에서 sink까지 가는 경로, 영향, 심각도, 보고 여부를 정한다. 사실 정리, 심각도 보정, 최종 정책 결정을 결과에서 따로 보이게 두고, 이미 정한 사실을 바꾸려고 discovery를 다시 열지 않는다.[](source:intro)[](source:establish)[](source:sev1) 전체 PR, commit, branch, patch, 저장소 scan을 시작하는 1차 트리거는 아니다.[](source:front)

- 공격자 위치, 진입점, 조작 입력, 보안 경계, 민감한 동작을 저장소 근거로 따라간다. 근거 없는 공격 사슬은 만들지 않는다.[](source:est1)[](source:safe)
- 자기 영향만 있거나 달성하기 매우 어려운 전제는 hard suppression 대상이다. 특권, 운영자, 개발자, 물리 접근이 전제이면 `ignore`다. 권한 상승 차이가 문제일 때만 예외다.[](source:rep)
- 영향이나 가능성이 낮다는 이유만으로 진짜 reportable finding을 버리지 않고 낮은 심각도를 준다.[](source:rep)
- 심각도는 `critical` `P0`, `high` `P1`, `medium` `P2`, `low` `P3`으로 대응한다. 무시한 finding은 우선순위가 없다.[](source:prio)

@answer scope="로컬 원본 분석 · 스킬 실행 없음 · 부분 분석(플러그인 루트 reference 미확인)"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source full title="codex-security/attack-path-analysis/SKILL.md · 5355B · 스킬 본문(원본)" path=codex-security/attack-path-analysis/SKILL.md
@source front title="codex-security/attack-path-analysis/SKILL.md · 5355B · frontmatter" path=codex-security/attack-path-analysis/SKILL.md lines=1:4
@source intro title="codex-security/attack-path-analysis/SKILL.md · 5355B · 목적과 읽을 reference" path=codex-security/attack-path-analysis/SKILL.md lines=8:8
@source establish title="codex-security/attack-path-analysis/SKILL.md · 5355B · 경로 수립 전체" path=codex-security/attack-path-analysis/SKILL.md lines=12:23
@source scanin title="codex-security/attack-path-analysis/SKILL.md · 5355B · scan 입력과 단독 입력" path=codex-security/attack-path-analysis/SKILL.md lines=12:14
@source est1 title="codex-security/attack-path-analysis/SKILL.md · 5355B · 단계 1" path=codex-security/attack-path-analysis/SKILL.md lines=16:16
@source est2 title="codex-security/attack-path-analysis/SKILL.md · 5355B · 단계 2" path=codex-security/attack-path-analysis/SKILL.md lines=17:17
@source est3 title="codex-security/attack-path-analysis/SKILL.md · 5355B · 단계 3" path=codex-security/attack-path-analysis/SKILL.md lines=18:18
@source est4 title="codex-security/attack-path-analysis/SKILL.md · 5355B · 단계 4" path=codex-security/attack-path-analysis/SKILL.md lines=19:19
@source cont title="codex-security/attack-path-analysis/SKILL.md · 5355B · AWS Continuum 증거" path=codex-security/attack-path-analysis/SKILL.md lines=21:21
@source safe title="codex-security/attack-path-analysis/SKILL.md · 5355B · 증거 취급과 네트워크" path=codex-security/attack-path-analysis/SKILL.md lines=23:23
@source integ title="codex-security/attack-path-analysis/SKILL.md · 5355B · Standard 통합" path=codex-security/attack-path-analysis/SKILL.md lines=27:27
@source wb title="codex-security/attack-path-analysis/SKILL.md · 5355B · Compact Workbench Diff" path=codex-security/attack-path-analysis/SKILL.md lines=31:36
@source phase title="codex-security/attack-path-analysis/SKILL.md · 5355B · 다른 phase-based scan" path=codex-security/attack-path-analysis/SKILL.md lines=40:42
@source out title="codex-security/attack-path-analysis/SKILL.md · 5355B · 출력" path=codex-security/attack-path-analysis/SKILL.md lines=46:54
@source sev title="codex-security/attack-path-analysis/references/severity-policy.md · 2644B · 심각도와 정책(원본)" path=codex-security/attack-path-analysis/references/severity-policy.md
@source sev1 title="codex-security/attack-path-analysis/references/severity-policy.md · 2644B · 보정 원칙" path=codex-security/attack-path-analysis/references/severity-policy.md lines=3:5
@source cat title="codex-security/attack-path-analysis/references/severity-policy.md · 2644B · SSRF CSRF XSS" path=codex-security/attack-path-analysis/references/severity-policy.md lines=7:7
@source rep title="codex-security/attack-path-analysis/references/severity-policy.md · 2644B · reportability" path=codex-security/attack-path-analysis/references/severity-policy.md lines=11:17
@source lik title="codex-security/attack-path-analysis/references/severity-policy.md · 2644B · 가능성" path=codex-security/attack-path-analysis/references/severity-policy.md lines=19:24
@source prio title="codex-security/attack-path-analysis/references/severity-policy.md · 2644B · 우선순위" path=codex-security/attack-path-analysis/references/severity-policy.md lines=28:35
@source facts title="codex-security/attack-path-analysis/references/attack-path-facts.md · 1585B · 경로 사실 필드(원본)" path=codex-security/attack-path-analysis/references/attack-path-facts.md
@source yaml title="codex-security/attack-path-analysis/agents/openai.yaml · 261B · 표시 이름과 기본 prompt" path=codex-security/attack-path-analysis/agents/openai.yaml
@source dscan title="codex-security/security-diff-scan/SKILL.md · 5405B · 위임하는 쪽(원본)" path=codex-security/security-diff-scan/SKILL.md lines=31:31
@source scan21 title="codex-security/security-scan/SKILL.md · 2972B · 21줄만 읽음" path=codex-security/security-scan/SKILL.md lines=21:21
@source val title="codex-security/validation/SKILL.md · 4619B · 처분을 넘기는 쪽" path=codex-security/validation/SKILL.md lines=28:28
@source tm title="codex-security/threat-model/SKILL.md · 2986B · 위협 모델 반환" path=codex-security/threat-model/SKILL.md lines=25:27
@source pub title="codex-security/publish-findings/SKILL.md · 11118B · 25줄만 읽음" path=codex-security/publish-findings/SKILL.md lines=25:25
@source lock title="codex-security/skills-lock.json · 6525B · attack-path-analysis 항목" path=codex-security/skills-lock.json lines=10:15

## 언제 켜지고 무엇을 입력으로 받나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 문구와 정확히 일치해야 켜진다는 뜻은 아니다.

`disable-model-invocation` 같은 호출 제한 필드는 원문에 명시 없음이다. `agents/openai.yaml`에도 `policy`가 없다.[](source:front)[](source:yaml)

@code source=front language=yaml

| 상황 | 에이전트의 행동 |
|---|---|
| scan이 attack-path 단계에 있다 | scan별 위협 모델과 후보 집합을 쓴다. 입력 경로는 그대로 쓰고, 필요한 scan 산출물이 없으면 없다고 보고한다.[](source:scanin) |
| 사용자가 source에서 sink까지의 경로와 심각도 보정을 직접 요청한다(단독 분석) | 주어진 finding, 저장소, 위협 모델이나 보안 정책, 맥락을 쓴다. scan별 산출물은 필요 없다. 중요한 가정은 밝히고, 의미 있는 평가가 막힐 때만 빠진 맥락을 묻는다.[](source:scanin) |
| Standard scan, Deep Scan worker | 자기 Standard workflow 안에서 경로를 평가하고 이 스킬을 호출하지 않는다.[](source:integ)[](source:scan21) |

파일을 만들거나 보관하기 전에 `../../references/artifact-storage.md`를 읽는다.[](source:intro) 공급된 artifact는 근거로 다룬다. 네트워크는 사용자가 명시적으로 승인했을 때만 접근하고, 오프라인 scan은 접근하지 않는다.[](source:safe)

## 경로는 어떻게 세우고 무엇을 보고하나? {#path}

@steps
| actor | 공격자와 표면 | 범위 안의 공격자, 영향받는 제품 표면, 진입점, 조작 입력, 보안 경계, 민감한 동작을 정한다. 저장소 근거와 공급된 관찰로 각 단계를 따라간다.[](source:est1) |
| control | 통제와 반증 | 관련 통제와 가장 강한 반증을 찾는다. 그것이 무엇을 확립하고 어떤 전제가 남는지, 주장한 경계를 정확히 넘는지 설명한다.[](source:est2) |
| decide | 영향과 정책 | 사실에서 영향과 가능성을 평가하고 `references/severity-policy.md`로 최종 결정한다. scan이 심각도 rubric을 주면 reportable finding을 그것으로 채점하고 영향이 없는 후보는 `ignore`로 둔다. 사실, 심각도 보정, 최종 결정을 결과에서 구분한다.[](source:est3) |
| every | 모든 후보 결정 | 자격이 있는 후보마다 명시적 결정을 낸다. 무시하거나 `deferred`인 후보도 포함한다. 뒷받침된 인스턴스를 이웃 finding으로 바꾸거나 root-control 위치를 잃지 않는다.[](source:est4) |

| 강제·금지 | 내용 |
|---|---|
| 근거 없는 사슬 | 뒷받침되지 않은 공격 사슬을 만들지 않는다. 배포나 공개 ingress 근거가 없는 것은 확신도를 낮추거나 사실을 미지로 둘 수 있을 뿐, 다른 근거가 받치는 finding을 깨지는 못한다.[](source:safe) |
| 기준 보존 | 심각도 정책은 확립된 사실에 적용한다. discovery를 다시 열거나 다른 공격 이야기로 바꾸지 않는다.[](source:out)[](source:sev1) |
| 설명 보존 | 살아남은 finding과 suppress한 finding을 모두 설명할 만큼의 근거를 남긴다.[](source:out) |
| 출력 항목 | 제목과 candidate, instance, ledger ID, 정확한 위치와 공격자에서 영향까지의 단계, `references/attack-path-facts.md`의 사실, 통제·반증·전제·증명 간극, 영향·가능성·보정된 심각도·최종 결정과 이유.[](source:out) |

공격 경로 사실 필드는 범위와 맥락, 공격 경로, 노출과 벡터, 신원과 전제, 영향, 통제와 반증, 불확실성, 결정이다. 알 수 없는 것은 중요하면 명시한다. 사실과 심각도·suppress 결정을 섞지 않는다.[](source:facts)

AWS Continuum에서 가져온 issue는 finding 증거의 `source_data.evidence_artifacts`를 읽는다. 시험 대상, 공격자 권한, 관찰된 효과를 주장한 경로와 맞춰 보고, 단계를 받치거나 반박하는 artifact ID와 관찰을 인용한다.[](source:cont)

| Continuum 증거 | 확립하는 것 |
|---|---|
| `VALIDATION_EVIDENCE`의 `body.validationEvidence` | 저장소가 보여 주지 못하는 단계를 확립할 수 있다.[](source:cont) |
| bundled issue의 `perFindingResults`, `flowVerdicts` | 있으면 관련 finding과 flow를 고르는 데 쓴다.[](source:cont) |
| HTTP `exploitArtifact` | 시험한 위치에서의 도달 가능성[](source:cont) |
| `executedProof` | 그 시험 환경에서 실제 실행된 것[](source:cont) |
| `sourceAnalysis` | 정적 추론이다. `exploitable` 판정만으로는 배포된 도달 가능성이 증명되지 않는다.[](source:cont) |

## 보고 여부와 심각도는 어떤 정책으로 정하나? {#severity}

심각도 정책은 경로, 범위, 반증을 세운 뒤 적용한다. 후보의 심각도 가설에서 출발해 저장소와 validation 근거가 뒷받침하는 영향, 가능성, 전제, 완화로 조정한다. 채점은 scan의 rubric을 쓰고 없으면 `../../../references/default-severity-rubric.md`를 쓴다.[](source:sev1)

| 상황 | 결정 |
|---|---|
| 반증됐거나 의미 있는 보안 영향이 없는 버그 | `ignore`[](source:rep) |
| 진짜 reportable finding인데 영향이나 가능성이 낮다 | 버리지 않고 낮은 심각도로 보고한다.[](source:rep) |
| 자기 자신에게만 영향이 있다, 달성 불가능하거나 매우 비현실적인 전제가 필요하다 | {caution:hard suppression}[](source:rep) |
| 특권, 운영자, 개발자, 물리 접근, 보호된 쓰기 경로가 전제다 | {caution:`ignore`} 단, 권한 상승 차이(delta)가 문제인 경우는 예외다.[](source:rep) |
| 낮은 권한의 범위 안 공격자 경로를 저장소나 validation 근거로 세울 수 없다 | `ignore`[](source:rep) |
| 내부 노출만 있는 실제 제품·프로덕션 workflow의 권한, 신원, 신뢰 경계, 보안 통제 실패 | 내부라는 이유만으로 suppress하지 않는다. 배포나 ingress 근거 부재는 확신도를 낮출 뿐이다.[](source:rep) |

| 노출 벡터 | 가능성 가중 |
|---|---|
| `remote` | 공격자 위치가 현실적이고 범위 안이면 보통 high[](source:lik) |
| `local_network` | 근거가 다른 수준을 뒷받침하지 않으면 보통 medium[](source:lik) |
| `localhost` | 보통 low. 낮은 권한의 공격자가 listener에 현실적으로 닿을 수 있으면 예외다.[](source:lik) |
| `none` | 노출로 가능성을 높이지 않는다[](source:lik) |

| 취약점 유형 | 정책이 정한 점검 |
|---|---|
| SSRF | 문서화된 외부 요청 기능이나 선택적 운영자 필터가 있어도, 목적지 제어 우회가 입증됐다면 무력화되지 않는다.[](source:cat) |
| CSRF | 브라우저 credential 첨부, cookie 정책, preflight, 요청 파싱, 실제 통제를 평가한다. method나 JSON content type만으로는 방어가 아니다.[](source:cat) |
| XSS | 자기에게만 미치는 영향과 피해자 영향을 구분한다. `alert` 재현은 스크립트 실행을 증명하지만 심각도를 정하지는 못한다.[](source:cat) |

| 최종 reportable 심각도 | 우선순위 |
|---|---|
| `critical` | `P0`[](source:prio) |
| `high` | `P1`[](source:prio) |
| `medium` | `P2`[](source:prio) |
| `low` | `P3`[](source:prio) |

판정 · 정책의 핵심은 "얼마나 위험한가"보다 "범위 안의 낮은 권한 공격자가 실제로 이 경로를 밟을 수 있는가"를 먼저 묻는 것이다. 이 질문에서 걸러지면 심각도 단계에 가지 않고 `ignore`가 된다.[](source:rep)

## 흐름 속 위치와 scan 제출은 어떻게 되나? {#position}

| 모드 | 입력과 제출 |
|---|---|
| Compact Workbench Diff(`scanId` 있음) | `list_codex_security_candidates({ scanId, cursor?, limit? })`로 scan별 위협 모델과 검증된 후보 전체를 읽는다. `reportable` 또는 `deferred`인 validation 후보를 모두 분석하고 candidate 정체성과 기존 discovery, validation 필드를 보존한다. 모든 결정을 `record_candidate_attack_paths({ scanId, attackPaths: [{ candidateId, attackPath }] })` 한 번으로 제출하고, 단계에 들어갈 후보가 없으면 `attackPaths: []`를 제출한다. 도구가 후보 순서를 보존한다. 이 결정이 단계 산출물 전부이며 중복 보고서, receipt, 수동 ledger는 만들지 않는다.[](source:wb) |
| 다른 phase-based scan | 활성 workflow의 보고서와 receipt 경로를 쓴다. 단계에 들어온 후보마다 명시적 결정과 receipt(ID, 사실이나 정확한 증명 간극, 보고서 참조)가 있어야 한다. 무시한 후보도 살아남는 finding 집합에서 빼기 전에 기록한다.[](source:phase) |
| 저장소 전체 또는 범위 지정 scan | discovery가 다듬은 finding 번호를 주지 않았더라도 `reportable` 또는 `survives: yes`인 validation closure 행을 포함한다. validation이 준 entrypoint, wrapper, root-control, sink, concrete-implementation 위치를 보존한다.[](source:phase) |

@workflow id=position-flow title="처분 뒤 attack-path"
| before | validation | backend | source:val |
| current | attack-path-analysis | backend | source:wb |
| after | 보고 결정 | external | source:out |
| before > current | reportable 또는 deferred R12 | emphasis |
| current > after | 최종 결정 | emphasis |

@steps
| highlight | attack-path-analysis | validation 처분이 `reportable` 또는 `deferred`인 후보만 받는다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R09 · 내부 위임 | `security-diff-scan`이 validation 다음에 한 번, `reportable` 또는 `deferred` 후보에만 실행한다. 후보가 없으면 `attackPaths: []`를 제출한다. 호스트 `record_candidate_attack_paths`가 상태를 관리한다.[](source:dscan)[](source:wb) |
| R12 · 산출물 호환 | 검증된 후보 중 `reportable` 또는 `deferred`만 분석한다. 후보 정체성과 기존 필드를 보존한다.[](source:wb)[](source:val) |
| R13 · 산출물 호환 | scan 단계에서는 scan별 위협 모델과 후보 집합을 쓴다. 단독 분석에서는 위협 모델이나 보안 정책을 쓰고 per-scan 산출물은 필요 없다.[](source:scanin)[](source:tm) |
| R17 · 참고 | Standard scan과 Deep Scan worker는 이 단계 스킬을 호출하지 않는다.[](source:integ)[](source:scan21) |
| R36 · 넘김 | `publish-findings`가 AWS Continuum 항목에 한해 저장된 `.evidence`와 validation artifact를 이 스킬에 주라고 한다. 이 스킬은 `source_data.evidence_artifacts`를 읽는 규칙을 따로 가진다. 에이전트가 선택한 issue를 넘긴다.[](source:pub)[](source:cont) |

전체 흐름은 색인 기준 `_group-scan-vulnerabilities/scan-vulnerabilities.html`을 가리킨다. 묶음 페이지는 별도 단계에서 만든다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `codex-security/attack-path-analysis/SKILL.md` 5,355B, `references/severity-policy.md` 2,644B, `references/attack-path-facts.md` 1,585B, `agents/openai.yaml` 261B를 끝까지 읽었다.[](source:full)[](source:sev)[](source:facts)[](source:yaml) |
| 관계 근거 | `security-diff-scan` 5,405B는 끝까지 읽었다. `security-scan`, `validation`, `threat-model`, `publish-findings`는 인용한 줄 범위만 읽었다. `skills-lock.json`은 이 스킬 항목 10~15줄을 확인했다.[](source:lock) |
| 부분 읽음 | 파일 4개(`security-scan`, `validation`, `threat-model`, `publish-findings`)는 이 페이지에서 줄 범위만 인용했다. |
| 제외 | 번역본 없음. 바이너리 없음. |

원문의 호출 제한, 사용자 질문 조건, 처분 규칙 5개, 가능성 4단계, 심각도 4개와 우선순위 대응, Continuum artifact 규칙, 제출 방식 3가지를 모두 대조했다.

@callout level=open-question title="읽지 못한 필수 자료"
| 이 스킬은 `../../references/artifact-storage.md`, `scan-artifacts.md`, `../../../references/default-severity-rubric.md`를 읽으라고 한다. 컬렉션에 플러그인 루트의 `references/`가 없어서 기본 심각도 rubric, 저장 정책, scan별 보고서·receipt 경로는 확인하지 못했다. 이 페이지의 심각도 설명은 `severity-policy.md`가 정한 범위까지다. 부분 분석이다.[](source:intro)[](source:sev1)[](source:phase) |

@callout level=open-question title="실행으로 확인하지 않은 부분"
| `record_candidate_attack_paths`가 결정을 어떻게 저장하는지, Continuum의 `evidence_artifacts` 실제 형식은 확인하지 못했다. 호스트 도구를 호출하지 않았다.[](source:wb)[](source:cont) |

분석 중 원본은 수정하지 않았고, 스킬의 어떤 명령도 실행하지 않았다.
