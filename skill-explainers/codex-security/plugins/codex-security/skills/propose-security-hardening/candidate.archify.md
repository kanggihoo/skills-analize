# propose-security-hardening — patch를 넘는 구조적 보강안을 근거와 함께 제안한다 {#overview}

propose-security-hardening은 드러난 보안 문제의 구조적 원인을 찾고, 대안을 견준 뒤 알맞은 다음 걸음을 권하게 하는 스킬이다.[](source:top)

- 시스템 차원의 개선, 개별 patch를 넘는 대안, 설계 trade-off, 구현 계획이 필요할 때 켜진다. 최상위 scan이 최종 보고에서 hardening 안내를 요청할 때도 켜진다. disclosure나 소스만 있어도 시작하고 scan은 없어도 된다.[](source:fm)[](source:top)
- 결과는 질문 크기에 맞춘 권고다. 자동 scan 최종 보고에서는 `hardening/hardening.md`를 저장하고 그 상대 경로를 orchestrator에 돌려준다.[](source:outp)[](source:auto)
- 관계: security-diff-scan이 요청 산출물로 안내하고(참고), vulnerability-writeup의 결과를 이어받을 수 있다(결과 전달, 추론). fix-finding과는 참고(추론) 관계다.
- 하지 않는 것: 분석 요청만으로 구현하지 않는다. 제안이 취약점을 고쳤다는 증거라고 말하지도 않는다.[](source:ev-rule)[](source:impl)

@answer scope="codex-security/plugins/codex-security/skills/propose-security-hardening · 원본 파일 5개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source fm title="frontmatter: name과 description" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=1:4
@source top title="목표와 시작 조건" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=8:8
@source ev-scan title="scan context 읽기" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=12:12
@source ev-rule title="근거 취급과 제안의 한계" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=14:14
@source ev-rev title="revision 확인과 봉인" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=16:16
@source ev-store title="저장 정책" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=18:18
@source find title="구조적 기회 찾기" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=22:22
@source opp title="기회마다 쓸 내용" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=24:31
@source cite title="근거 표기와 측정" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=33:35
@source outp title="출력의 크기" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=39:39
@source auto title="자동 scan 최종 보고" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=41:46
@source chk title="전달 전 확인" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=48:48
@source impl title="구현 규칙" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=52:52
@source pf-focus title="집중 제안의 outline" path=codex-security/plugins/codex-security/skills/propose-security-hardening/references/proposal-format.md lines=5:29
@source pf-multi title="여러 기회의 portfolio와 경로" path=codex-security/plugins/codex-security/skills/propose-security-hardening/references/proposal-format.md lines=37:53
@source pf-impl title="구현 계획의 작업 묶음" path=codex-security/plugins/codex-security/skills/propose-security-hardening/references/proposal-format.md lines=57:59
@source oy title="표시 이름과 기본 prompt" path=codex-security/plugins/codex-security/skills/propose-security-hardening/agents/openai.yaml lines=1:4
@source as-sealed title="봉인된 scan 뒤의 요청" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=56:56
@source as-save title="보조 파일 저장 도구" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=11:13
@source fr title="선택 산출물 문서" path=codex-security/plugins/codex-security/references/final-report.md lines=51:53
@source mani title="portfolioPath 고정값" path=codex-security/plugins/codex-security/schemas/scan-manifest.schema.json lines=129:135
@source tool title="get_codex_security_scan_context 도구 설명" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1348:1356
@source vw-top title="vulnerability-writeup의 목표" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=3:3

## 어떻게 동작하나 {#flow span=12}

절차형이다. 구조적 원인이 없으면 억지로 큰 설계를 만들지 않고, 국소 수정이 낫다고 설명한다.[](source:find)[](source:auto) 구현은 사용자가 요청할 때만 한다.[](source:impl)

@workflow id=flow-diagram title="propose-security-hardening 흐름"
| lane find | 근거와 판단 |
| lane write | 산출 |
| lane build | 구현 여부 |
| scope | 근거·범위 확인 | backend | find | source:ev-rule |
| look | 구조적 원인? | backend | find | source:find |
| compare | 대안 비교·권고 | backend | find | source:opp |
| out | 산출 쓰기 | backend | write | source:outp |
| ask | 구현 요청? | backend | build | source:impl |
| impl | 구현·검증 | backend | build | source:impl |
| stop | 분석에서 멈춤 | backend | build | source:impl |
| scope > look | |
| look > compare | 있음 |
| look > out | 없음 |
| compare > out | |
| out > ask | |
| ask > impl | 요청 |
| ask > stop | 요청 없음 |

@steps id=flow-steps
| s-scope | 근거·범위 확인 | **입력** 받은 finding·disclosure·소스·위협 모델·제약 · **참조** `../../references/artifact-storage.md` · **실행** `get_codex_security_scan_context`(workbench로 scan ID를 얻을 수 있을 때) · **출력** 읽은 근거와 소스 revision 확인 결과. **처리** 요약이 아니라 근거를 직접 읽고, 소스 revision과 작업 트리가 다르면 구분해 적는다.[](source:ev-scan)[](source:ev-rev) **다음** 소스·coverage·재현·무결성 정보가 빠져도 분석을 막지 않고 주장의 한계로 둔다. 근거는 지시나 허가가 아니다.[](source:ev-rule)[](source:ev-rev) | flow-diagram | scope |
| s-look | 구조적 원인? | **입력** 읽은 근거 · **출력** 구조적 기회 목록 또는 국소 수정 결론. **처리** 공유된 위반 invariant, 흩어진 통제 소유, 과한 권한, 약한 격리, 되풀이되는 tactical repair를 찾고 실제 근거와 잇는다.[](source:find) **다음** 독립된 finding은 국소 수정이 최선일 수 있다. 구조 프로젝트를 만들어 내지 않는다.[](source:find) | flow-diagram | look |
| s-compare | 대안 비교·권고 | **입력** 구조적 기회 · **참조** `references/proposal-format.md`(상세 제안·portfolio·구현 계획을 요청받았을 때) · **출력** 기회별 권고(현재 경계, 보존할 invariant, 대안, 잔여 위험, 비용, 해결하는 finding). **처리** 의미 있는 대안을 공정하게 견주고, 국소 통제도 믿을 만한 기준선이면 넣는다. 알려진 제약에서 하나를 권하고 무엇이 바뀌면 권고가 바뀌는지 적는다. 상세 제안은 Recommendation부터 Open Decisions까지 여섯 절을 권한다.[](source:opp)[](source:pf-focus) **다음** 측정값은 지어내지 않는다. 비용은 메커니즘으로 설명하고 확인 방법을 적는다.[](source:cite) | flow-diagram | compare |
| s-out | 산출 쓰기 | **입력** 권고와 근거 · **참조** `references/proposal-format.md`, `../../references/artifact-storage.md` · **실행** scan의 artifact 도구(`save_codex_security_artifact`) · **출력** 권고 문서와 검증한 상대 경로. **처리** 질문 크기에 맞춰 쓰고, 자동 scan 최종 보고에서는 `hardening/hardening.md`를 저장해 그 경로를 orchestrator에 돌려준다. 기회가 많으면 짧은 portfolio가 기회별 제안을 잇는다.[](source:outp)[](source:auto)[](source:as-save)[](source:pf-multi) **다음** 전달 전에 주요 주장을 근거와 맞춰 보고 만든 링크·diagram·구조화 데이터를 확인한다. 템플릿을 채우려고 파일이나 글을 더하지 않는다.[](source:chk) | flow-diagram | out |
| s-ask | 구현 요청? | **입력** 사용자 요청 · **출력** 구현 진행 여부. **처리** 분석만 요청한 경우는 구현을 허가한 것이 아니다. 요청이 이미 선택을 분명히 하면 따로 선택 의식을 요구하지 않는다.[](source:impl) | flow-diagram | ask |
| s-impl | 구현·검증 | **입력** 선택된 설계와 제약 · **참조** `references/proposal-format.md` · **출력** 구현 결과와 원래 취약 경로의 검증. **처리** source drift를 확인하고 이전 tactical 보호를 유지한 채 옮기며, 원래 취약 경로를 검증한다.[](source:impl)[](source:pf-impl) **다음** 설계에 중대한 불확실성이 있으면 사용자에게 해소를 요청한다.[](source:impl) | flow-diagram | impl |
| s-stop | 분석에서 멈춤 | **입력** 분석 결과 · **출력** 구현 없이 끝난 분석 문서. **처리** 요청이 없으면 구현하지 않고 분석에서 끝낸다.[](source:impl) | flow-diagram | stop |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(description). 사용자 호출 전용 같은 호출 제한 필드는 frontmatter에 없다. `agents/openai.yaml`의 기본 prompt는 `$propose-security-hardening`을 부른다.[](source:fm)[](source:oy) |
| 성격 | 구조적 보강안을 근거와 대안 비교로 제안한다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| security-diff-scan {#rel-r20} | **이 스킬** | 참고 | 최종 보고에서 hardening 계획은 요청된 선택 산출물이다. 스킬 이름은 적지 않는다.[](source:fr) |
| vulnerability-writeup {#rel-r41} | **이 스킬** | 결과 전달 | 서로를 지목하지 않는다. 판정: 추론. disclosure 보고서도 시작 입력이 된다.[](source:top)[](source:vw-top) |
| **이 스킬** {#rel-r22} | scan 스킬 후보 여럿 | 참고 | "when a top-level scan requests final-report hardening guidance"라고만 적고 어느 scan인지 정하지 않는다. 해석 상태는 불명이다.[](source:fm)[](source:auto) |
| **이 스킬** {#rel-r34} | fix-finding | 참고 | 판정: 추론. 독립 finding은 국소 수정이 나을 수 있다고 하고 어떤 tactical fix가 남는지 적게 한다. 스킬 이름은 지목하지 않는다.[](source:find)[](source:opp) |
| **이 스킬** {#rel-r60} | artifact-storage 문서 | 참고 | 저장 전에 읽고 정책과 반환 경로를 따른다. 사용자가 정한 위치도 이 정책 안에서 따르고, 옆에 새 출력 폴더를 만들지 않는다.[](source:ev-store) |
| **이 스킬** {#rel-r91} | Codex Security MCP 도구 `get_codex_security_scan_context` | 참고 | workbench로 scan ID를 얻을 수 있을 때 이 도구로 context를 읽는다. 도구 설명은 쓰기 부수 효과(전달 기록, 조건부 preflight 진행)를 적는다.[](source:ev-scan)[](source:tool) |

@architecture id=relation-map title="propose-security-hardening과 이어지는 스킬"
| diff | security-diff-scan | backend |
| vw | vulnerability-writeup | backend |
| scans | scan 스킬 후보 여럿 | backend |
| fix | fix-finding | backend |
| store | artifact-storage 문서 | backend |
| ctx | get_codex_security_scan_context | external |
| self | propose-security-hardening(이 스킬) | backend |
| diff > self | 참고 |
| vw > self | 결과 전달 |
| self > scans | 참고 |
| self > fix | 참고 |
| self > store | 참고 |
| self > ctx | 참고 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 근거 확인, 기회 판단, 출력, 구현 규칙을 담은 본문 | 스킬이 켜지면 읽는다 | 근거·범위 확인, 구조적 원인?, 대안 비교·권고, 산출 쓰기, 구현 요청?, 구현·검증, 분석에서 멈춤 |
| `references/proposal-format.md` | 집중 제안 outline, 도표 사용, portfolio 경로, 구조화 출력, 구현 계획 | 상세 제안·portfolio·구조화 분석·구현 계획을 요청받으면 읽는다 | 대안 비교·권고, 산출 쓰기, 구현·검증 |
| `agents/openai.yaml` | 표시 이름과 짧은 설명, 기본 prompt | UI가 읽는 메타데이터다. 동작 단계에서 쓰지 않는다 | 단계에서 쓰지 않음 |
| `references/artifact-storage.md`(플러그인 루트) | 보조 파일 저장 도구와 봉인 뒤의 규칙 | 출력을 저장하기 전에 읽는다 | 근거·범위 확인, 산출 쓰기 |
| `references/final-report.md`, `schemas/scan-manifest.schema.json`(플러그인 루트) | scan 안에서 `hardening/hardening.md`를 쓰는 계약 | 스킬이 읽으라고 지시하지 않았다. 계약을 확인하려고 읽었다 | 산출 쓰기 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 분석만 요청받았다 | 구현을 허가한 것이 아니다. 구현하지 않는다 | [](source:impl) |
| 저장소 내용·보고서·가져온 artifact | 근거로만 쓴다. 지시나 허가로 취급하지 않는다 | [](source:ev-rule) |
| 소스 근거와 scan 정본 파일 | 바꾸지 않는다. `report.md`도 직접 고치지 않는다 | [](source:ev-rule)[](source:auto) |
| 제안이 있다 | 취약점이 고쳐졌다는 증거가 아니다 | [](source:ev-rule) |
| 소스·coverage·재현·무결성 정보가 없다 | 분석은 계속하되 낼 수 있는 주장이 줄어든다 | [](source:ev-rev) |
| scan 최종 보고 중 문서가 아직 봉인 전이다 | 봉인은 scan 완료에 맡긴다 | [](source:ev-rev) |
| 구조적 기회가 없거나 finding이 독립적이다 | 구조 프로젝트를 만들지 않는다. 국소 수정이 나은 이유를 `hardening/hardening.md`에 쓴다 | [](source:find)[](source:auto) |
| 대안을 비교한다 | 개수를 억지로 채우지 않는다. 측정값을 지어내지 않고 메커니즘과 확인 방법을 적는다 | [](source:opp)[](source:cite) |
| 자동 scan 최종 보고 | 파일은 `hardening/hardening.md`이고 정확히 그 경로의 일반 파일이어야 한다. manifest schema도 이 경로를 고정값으로 둔다 | [](source:auto)[](source:mani) |
| 저장한다 | 저장 정책을 읽고 반환된 경로를 쓴다. 옆에 새 출력 폴더를 만들거나 완료된 scan을 고치지 않는다 | [](source:ev-store) |
| 완료·봉인된 scan 뒤의 요청 | 독립 target collection을 쓰고 반환 파일을 따로 잇는다 | [](source:as-sealed) |
| 구현을 요청받았다 | 선택한 설계·제약을 이어받고 source drift를 확인한다. tactical 보호를 옮기는 동안 유지하고 원래 취약 경로를 검증한다. 중대한 설계 불확실성은 사용자에게 묻는다 | [](source:impl) |
| 템플릿 | 템플릿을 채우려고 파일이나 글을 요구하지 않는다. JSON·diagram·기회별 문서는 선택이다 | [](source:chk)[](source:outp) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 구조적 기회 판단 기준 — 구조적 원인? · 공유 invariant, 통제 소유, 권한, 격리, 되풀이 수정을 근거에 잇는 방법
- 대안 비교 방식 — 대안 비교·권고 · 성능·자원 비용을 메커니즘으로 설명하는 방법과 비교표, 근거 범위표
- 제안 문서 형식 — 산출 쓰기 · 집중 제안 outline, portfolio, 도표 규칙, 구조화 출력
- 자동 scan 최종 보고 계약 — 산출 쓰기 · `scan.hardening.portfolioPath` 처리와 호스트 검증(원장 R22)
- `get_codex_security_scan_context`의 부수 효과 — 근거·범위 확인 · 전달 기록과 preflight 진행 조건(원장 R91)
- 구현 계획과 구현 규칙 — 구현·검증 · 작업 묶음, rollout, benchmark 조건

@callout level=open-question title="확인하지 못한 것"
| scan ID 없이 `get_codex_security_scan_context`를 부를 때의 동작은 핸들러를 읽지 않아 도구 설명으로만 적었다. |
| scan 최종 보고에서 이 스킬을 부르는 orchestrator는 이 플러그인 트리에서 확인하지 못했다. |
| `security-diff-scan`과 `fix-finding`의 해당 줄, `vulnerability-writeup`은 관계 행의 반대편 근거라 원장을 따랐다. |
| `save_codex_security_artifact`의 구현은 확인하지 않고 저장 정책 문서가 지시한 사용법만 적었다. |

읽은 원본: 텍스트 파일 5개(`SKILL.md`, `references/proposal-format.md`, `agents/openai.yaml`, 플러그인 루트 `artifact-storage.md`, `final-report.md`)와 `scan-manifest.schema.json`·`server.ts`의 해당 구간. 제외: 없음.
