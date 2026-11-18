# attack-path-analysis — finding의 공격 경로를 따라가 심각도와 보고 여부를 정한다 {#overview}

attack-path-analysis는 넘겨받은 finding마다 공격자가 source에서 sink까지 실제로 갈 수 있는지 추적하게 하고, 영향·심각도·보고 여부를 결정하게 하는 스킬이다.[](source:fm)[](source:out)

- scan이 이미 이 단계에 와 있거나, 사용자가 finding 하나를 source에서 sink까지 추적해 심각도를 보정해 달라고 할 때 켜진다. 전체 PR·commit·branch·patch·저장소 scan의 첫 진입점으로는 쓰지 않는다. scan 단계와 단독 분석 두 모드가 있다.[](source:fm)[](source:inputs)
- 결과는 후보마다 하나의 결정(`reportable`, `ignore`, `deferred`)이다. 근거가 되는 사실, 통제와 반증, 심각도, 우선순위(P0~P3)가 함께 남는다. compact diff scan에서는 후보 ledger의 `attack_path` 객체로 기록된다.[](source:dec)[](source:compact)[](source:sp-prio)
- 관계: `security-diff-scan`이 호출하고(호출), `validation`과 `threat-model`의 결과를 받으며(결과 전달), `publish-findings`가 Continuum 항목에 한해 안내한다(다음 안내). Standard scan은 이 스킬을 부르지 않고 같은 일을 자기 workflow 안에서 한다(참고).[](source:compact)[](source:integ)
- 하지 않는 것: 근거 없는 공격 사슬을 지어내지 않는다. 승인 없이 네트워크에 접근하지 않고, 발견 단계를 다시 열지 않는다.[](source:evid)[](source:out)

@answer scope="codex-security/plugins/codex-security/skills/attack-path-analysis · 원본 파일 7개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source fm title="frontmatter: name과 description" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=1:4
@source store title="파일 저장 전에 읽을 규칙" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=8:8
@source inputs title="입력: scan 단계와 단독 분석" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=10:14
@source trace title="공격 경로 확립 1단계" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=16:16
@source ctrl title="통제와 반증 2단계" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=17:17
@source sev title="영향·가능성·심각도 3단계" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=18:18
@source dec title="후보마다 명시적 결정 4단계" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=19:19
@source cont title="AWS Continuum 증거 읽기" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=21:21
@source evid title="증거 취급, 네트워크, 지어내기 금지" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=23:23
@source integ title="Standard·Deep은 이 스킬을 부르지 않는다" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=25:27
@source compact title="compact workbench diff 기록" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=29:36
@source other title="그 밖의 phase 기반 scan" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=38:42
@source out title="출력 항목" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=44:54
@source sp-rep title="보고 여부 규칙" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=3:17
@source sp-like title="노출 벡터별 가능성" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=19:24
@source sp-prio title="심각도에서 우선순위로" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=26:35
@source facts title="결과에 담는 사실 항목" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/attack-path-facts.md lines=3:14
@source rub title="기본 심각도 rubric" path=codex-security/plugins/codex-security/references/default-severity-rubric.md lines=3:33
@source stor title="저장 정책" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=9:13
@source sch-rep title="reportable 결정의 severity 값" path=codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json lines=68:105
@source sch-def title="deferred 결정의 severity와 proof_gap" path=codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json lines=144:187
@source ledger title="자격 후보 누락·위반 거부" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=117:141
@source pub title="publish-findings의 Continuum 안내" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=25:25
@source diffscan title="security-diff-scan의 호출 지시" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=31:31
@source valid title="validation의 attack-path 입력 지시" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=28:28
@source tm title="threat-model 결과 취급" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=25:27

## 어떻게 동작하나 {#flow span=12}

절차형이다. 입력을 받는 방식만 모드에 따라 갈리고, 분석 4단계는 같다.[](source:inputs)[](source:trace)

그림이 생략한 것이 둘 있다. 결정 기록 방식은 모드마다 다르다(compact diff는 도구 한 번, 그 밖의 phase scan은 보고서와 receipt, 단독 분석은 호출자 형식).[](source:compact)[](source:other)[](source:out) 그리고 필수 scan 산출물이 없으면 분석하지 않고 없다고 보고한다.[](source:inputs)

@workflow id=flow-diagram title="attack-path-analysis 흐름"
| lane input | 입력 |
| lane analyze | 경로 분석 |
| lane decide | 결정 |
| ctx | 입력 확보 | external | input | source:inputs |
| trace | 공격 경로 추적 | backend | analyze | source:trace |
| ctrl | 통제·반증 확인 | backend | analyze | source:ctrl |
| sev | 영향·심각도 산정 | backend | analyze | source:sev |
| rep | 보고 가능? | backend | decide | source:sp-rep |
| prio | 우선순위 매핑 | backend | decide | source:sp-prio |
| rec | 결정 기록 | backend | decide | source:dec |
| ctx > trace | |
| trace > ctrl | |
| ctrl > sev | |
| sev > rep | |
| rep > prio | reportable |
| rep > rec | ignore·deferred |
| prio > rec | |

@steps id=flow-steps
| s-ctx | 입력 확보 | **입력** finding·후보 집합·위협 모델 또는 보안 정책 · **참조** `../../references/scan-artifacts.md`, `../../references/artifact-storage.md` · **출력** 분석에 쓸 입력 묶음. **처리** scan 단계면 per-scan 위협 모델과 후보 집합을 쓰고 입력 경로를 그대로 둔다. 단독 분석이면 넘겨받은 finding·저장소·맥락을 쓴다.[](source:inputs)[](source:store) **다음** scan 단계에서 필요한 scan 산출물이 없으면 없는 입력을 보고한다. 단독 분석은 per-scan 산출물이 필요 없고, 의미 있는 평가가 막힐 때만 빠진 맥락을 묻는다.[](source:inputs) | flow-diagram | ctx |
| s-trace | 공격 경로 추적 | **입력** 입력 묶음 · **출력** 공격자·진입점·제어 입력·보안 경계·민감 동작이 이어진 경로. **처리** 저장소 근거와 대상에 대해 받은 관찰로 단계마다 추적한다.[](source:trace) **다음** AWS Continuum 항목이면 `source_data.evidence_artifacts`를 읽고 artifact ID와 근거 관찰을 인용한다. `exploitable` 판정만으로는 배포된 도달 가능성을 증명하지 못한다.[](source:cont) | flow-diagram | trace |
| s-ctrl | 통제·반증 확인 | **입력** 추적한 경로 · **출력** 통제, 가장 강한 반증, 남은 전제 조건. **처리** 통제가 무엇을 입증하는지, 주장한 경계를 정확히 넘는지 따진다.[](source:ctrl) **다음** 배포·공개 ingress 증거가 없으면 confidence만 제한하고 뒷받침된 finding은 무너뜨리지 않는다.[](source:evid) | flow-diagram | ctrl |
| s-sev | 영향·심각도 산정 | **입력** 경로 사실·반증 · **참조** `references/severity-policy.md`, `references/attack-path-facts.md` · **출력** 영향, 가능성, 보정된 심각도. **처리** scan이 준 rubric이 있으면 그것으로, 없으면 기본 rubric으로 reportable finding의 등급을 매기고 사실·보정·정책 결정을 구분해 남긴다.[](source:sev)[](source:facts)[](source:sp-rep) | flow-diagram | sev |
| s-rep | 보고 가능? | **입력** 심각도와 경로 사실 · **출력** `reportable`·`ignore`·`deferred` 중 하나. **처리** 반증됐거나 의미 있는 보안 영향이 없으면 `ignore`, 낮은 영향이어도 실제 finding이면 낮은 severity로 보고한다.[](source:sp-rep) **다음** `deferred`는 증명 간극(`proof_gap`)이 필수이고 severity에 `unknown`을 쓸 수 있다.[](source:sch-def) | flow-diagram | rep |
| s-prio | 우선순위 매핑 | **입력** 최종 reportable severity · **출력** 우선순위. **처리** `critical`→P0, `high`→P1, `medium`→P2, `low`→P3으로 옮긴다.[](source:sp-prio) **다음** `ignore`는 우선순위 없이 `ignore` 결정과 severity만 받는다.[](source:sp-prio) | flow-diagram | prio |
| s-rec | 결정 기록 | **입력** 후보마다의 결정 · **실행** `record_candidate_attack_paths({ scanId, attackPaths: [{ candidateId, attackPath }] })` · **출력** 후보 ledger의 `attack_path` 객체. **처리** `reportable` 또는 `deferred`로 검증된 후보 전부의 결정을 한 번에 제출하고, 해당 후보가 없으면 `attackPaths: []`를 제출한다.[](source:compact)[](source:ledger) **다음** compact diff는 이 결정이 단계 출력의 전부라서 중복 보고서·receipt·수동 ledger를 만들지 않는다. 그 밖의 phase scan은 scan 경로의 보고서와 receipt에 후보 ID와 사실·증명 간극을 적는다. 단독 분석은 호출자 형식을 따른다.[](source:compact)[](source:other)[](source:out) | flow-diagram | rec |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(description). scan이 attack-path-analysis 단계에 있을 때 또는 사용자가 source→sink 추적과 심각도 보정을 명시적으로 요청할 때. 호출 제한 필드는 frontmatter에 없다.[](source:fm) |
| 성격 | 단계 스킬(phase skill)이다. 이미 검증된 후보를 받아 공격 경로와 보고 여부를 정한다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| security-diff-scan {#rel-r09} | **이 스킬** | 호출 | validation 다음에 한 번, `reportable` 또는 `deferred` 후보에만 부른다. 진입할 후보가 없으면 `attackPaths: []`를 제출한다.[](source:diffscan)[](source:compact) |
| validation {#rel-r12} | **이 스킬** | 결과 전달 | 처분이 붙은 후보 중 `reportable`·`deferred`만 분석하고 후보 정체성과 기존 필드를 보존한다. 필수 순서는 아니다.[](source:valid)[](source:compact) |
| threat-model {#rel-r13} | **이 스킬** | 결과 전달 | scan 단계에서는 per-scan 위협 모델을 쓴다. 단독 분석에서는 위협 모델이나 보안 정책이 있으면 쓰고 없어도 된다.[](source:inputs)[](source:tm) |
| publish-findings {#rel-r36} | **이 스킬** | 다음 안내 | AWS Continuum 항목에 한해 저장된 `.evidence`(validation artifacts 포함)를 이 스킬에 주라고 안내한다.[](source:pub)[](source:cont) |
| **이 스킬** {#rel-r17} | security-scan | 참고 | Standard scan과 Deep worker는 공격 경로를 자기 workflow 안에서 평가하고 이 단계 스킬을 호출하지 않는다.[](source:integ) |

@architecture id=relation-map title="attack-path-analysis와 이어지는 스킬"
| diff | security-diff-scan | backend |
| val | validation | backend |
| tm | threat-model | backend |
| pub | publish-findings | backend |
| self | attack-path-analysis(이 스킬) | backend |
| scan | security-scan | backend |
| diff > self | 호출 |
| val > self | 결과 전달 |
| tm > self | 결과 전달 |
| pub > self | 다음 안내 |
| self > scan | 참고 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 입력 모드, 분석 4단계, scan 통합과 출력 규칙을 담은 본문 | 스킬이 켜지면 읽는다 | 입력 확보, 공격 경로 추적, 통제·반증 확인, 결정 기록 |
| `references/severity-policy.md` | 보고 여부, 노출 벡터별 가능성, 심각도→우선순위 매핑 | 최종 결정을 낼 때 읽으라고 지시한다 | 영향·심각도 산정, 보고 가능?, 우선순위 매핑 |
| `references/attack-path-facts.md` | 결과에 담을 사실 항목(범위, 경로, 노출, 전제, 영향, 통제, 불확실성, 결정) | 결과를 쓸 때 읽는다 | 영향·심각도 산정, 결정 기록 |
| `agents/openai.yaml` | 표시 이름과 기본 prompt(`$attack-path-analysis`로 source→sink 추적) | UI 설정용. 동작 지시는 없다 | 원문에 명시 없음 |
| `../../references/artifact-storage.md` | 파일을 만들거나 보관하기 전에 따를 저장 정책 | 파일을 만들거나 보관할 때 읽는다 | 입력 확보 |
| `../../references/scan-artifacts.md` | scan 폴더와 phase별 산출물 경로 규약 | scan 단계일 때 읽는다 | 입력 확보, 결정 기록 |
| `../../references/default-severity-rubric.md` | scan이 rubric을 주지 않을 때 쓰는 Critical~Informational 기준 | rubric이 없을 때 읽는다 | 영향·심각도 산정 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 필요한 scan 산출물이 없다 | 가정으로 채우지 않고 없는 입력을 보고한다 | [](source:inputs) |
| 단독 분석에서 맥락이 부족하다 | 중대한 가정을 적고, 의미 있는 평가가 막힐 때만 묻는다 | [](source:inputs) |
| 네트워크 접근 | 사용자가 명시적으로 허가했을 때만 한다. offline scan은 접근하지 않는다 | [](source:evid) |
| 근거 없는 공격 사슬 | 지어내지 않는다. 지지되는 instance를 이웃 finding으로 바꾸거나 root-control 위치를 잃지 않는다 | [](source:evid)[](source:dec) |
| 배포·ingress 증거 부족 | confidence를 제한할 뿐, 달리 뒷받침된 finding을 무효로 하지 않는다 | [](source:evid) |
| 반증됐거나 의미 있는 보안 영향이 없다 | `ignore` | [](source:sp-rep) |
| 영향·가능성이 낮을 뿐인 실제 finding | 버리지 않고 낮은 severity로 보고한다 | [](source:sp-rep) |
| 영향이 self-only이거나 실현 불가능한 전제 | hard suppression 대상이다 | [](source:sp-rep) |
| privileged-only·operator-only·developer-only·physical-access-only 전제 | `ignore`. 권한 상승 delta가 쟁점이면 예외다 | [](source:sp-rep) |
| `localhost` 노출 | 대체로 낮은 가능성. 낮은 권한 공격자가 listener에 실제로 닿으면 예외다. `remote`는 대체로 높음, `local_network`는 대체로 중간 | [](source:sp-like) |
| 기본 rubric의 Critical | Access·Impact·Evidence 세 조건을 모두 충족해야 한다. 증거가 부족해도 더 넓은 공격이 불가능하다고 단정하지 않는다 | [](source:rub) |
| compact diff에서 자격 후보(`reportable`·`deferred`)의 결정이 빠지거나 자격 없는 후보가 들어온다 | 도구가 거부한다 | [](source:ledger) |
| compact diff의 결정 | 단계 출력의 전부다. 중복 보고서·receipt·수동 ledger를 만들지 않는다 | [](source:compact) |
| 파일을 만들거나 보관한다 | 먼저 저장 정책을 읽는다. 구조화 결과를 보조 파일 도구로 대체하지 않는다 | [](source:store)[](source:stor) |
| 심각도 수준 | `reportable` 결정의 severity는 `critical`·`high`·`medium`·`low`뿐이라 compact 단계에서 Informational을 `reportable`로 기록할 칸이 없다. 판정: 기본 rubric은 Informational을 두지만 이 단계 schema는 두지 않는다 | [](source:sch-rep)[](source:rub) |
| 우선순위 | `ignore` 결정은 우선순위가 없다 | [](source:sp-prio) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- AWS Continuum 증거 읽기 — 공격 경로 추적 · `VALIDATION_EVIDENCE`, `exploitArtifact`, `executedProof`, `sourceAnalysis`와 bundled issue의 `perFindingResults`·`flowVerdicts`를 구분하는 규칙
- 심각도 보정 규칙 — 영향·심각도 산정 · SSRF·CSRF·XSS 사례 규칙, 노출 벡터별 가능성, 기본 rubric의 다섯 등급 조건
- 결과 사실 항목 — 결정 기록 · 범위·경로·노출·전제·영향·통제·불확실성·결정 여덟 항목의 쓰임
- phase 기반 scan의 보고 방식 — 결정 기록 · 저장소 전체 scan에서 `survives: yes` 행을 포함하는 규칙과 receipt 내용

@callout level=open-question title="확인하지 못한 것"
| compact diff에서 스킬은 위협 모델과 후보를 `list_codex_security_candidates`로 읽으라고 하지만(33줄), 이 도구는 후보 행만 돌려주는 것으로 원장에 기록돼 있다. 위협 모델은 `threatmodel.md`를 `read_codex_security_artifact`로 읽는 경로가 따로 있다. 이 경로를 코드로 다시 확인하지는 않았다. |
| `record_candidate_attack_paths` 구현은 자격 검사 부분(117~141줄)과 schema만 읽었다. |
| `scan-artifacts.md`와 `candidate-attack-paths.schema.json`은 이 스킬이 쓰는 줄만 읽었다. |

읽은 원본: 텍스트 파일 7개(스킬 폴더 4개, 플러그인 참조 3개). 제외: 없음. 도구 구현과 schema는 계약에 필요한 줄만 확인했다(구조·표본만 확인).
