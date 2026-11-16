# attack-path-analysis는 finding 하나를 어떻게 따라가 보고 여부와 심각도를 정하나? {#attack-path-page}

`attack-path-analysis`는 보안 scan이 이미 찾아 둔 finding 후보마다 공격자가 실제로 닿는 경로가 있는지 따라가 보고, 영향과 심각도를 정해 보고할지 말지 결정하게 하는 단계 스킬이다.[](source:purpose)

- 쓰는 때: scan이 이미 attack-path 단계에 있거나, 사용자가 finding을 source에서 sink까지 추적해 심각도를 보정해 달라고 명시할 때다. 전체 PR, commit, branch, patch, 저장소 scan을 시작하는 1차 트리거로는 쓰지 않는다.[](source:fm)
- 내놓는 것: 후보마다 `reportable`, `ignore`, `deferred` 중 하나의 결정과 그 근거(경로, 통제, 반증, 영향, 가능성, 심각도)다. workbench가 받치는 compact diff scan에서는 이 결정을 도구 한 번 호출로 제출한다.[](source:cd-sub)
- 하지 않는 것: discovery를 다시 열지 않고, 근거 없는 공격 사슬을 지어내지 않고, 지원된 사례를 이웃 finding으로 바꾸지 않는다. 네트워크는 사용자가 명시적으로 허가했을 때만 쓰고, 오프라인 scan은 절대 쓰지 않는다.[](source:net)[](source:st4)
- 강제하는 것: compact diff에서 호스트 도구가 자격 있는 후보를 하나라도 빼먹은 제출과 자격 없는 후보가 든 제출을 거부한다.[](source:led-unk)[](source:led-miss)

@answer scope="로컬 원본 분석 · 스킬·도구 실행 없음 · 호스트 도구는 소스 코드만 읽어 확인"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=243a9028dc78fe13c6f64b1a5c199bc9939ccc06
@source fm title="frontmatter" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=1:4
@source purpose title="목적과 저장 정책 읽기" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=6:8
@source sc-in title="scan 단계 입력" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=12:12
@source sa-in title="단독 분석 입력" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=14:14
@source st1 title="경로 세우기" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=16:16
@source st2 title="통제와 반증" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=17:17
@source st3 title="영향·심각도·정책 결정" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=18:18
@source st4 title="후보별 명시 결정" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=19:19
@source cont title="Continuum 증거 규칙" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=21:21
@source net title="증거 취급과 네트워크" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=23:23
@source integ title="Standard·Deep scan과의 관계" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=27:27
@source cd-gate title="compact diff 적용 조건" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=31:31
@source cd-load title="compact diff 후보 읽기" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=33:33
@source cd-elig title="compact diff 대상 후보" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=34:34
@source cd-sub title="compact diff 제출" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=35:35
@source cd-fin title="compact diff 완결 출력" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=36:36
@source other title="다른 phase 기반 scan 출력" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=40:40
@source repo title="저장소 전체·범위 지정 scan" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=42:42
@source out-fmt title="단독 분석 출력 형식" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=46:46
@source out-list title="출력 항목" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=48:52
@source out-end title="증거 보존과 정책 적용" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=54:54
@source yaml title="agent 표시 설정" path=codex-security/plugins/codex-security/skills/attack-path-analysis/agents/openai.yaml lines=1:4
@source sev-intro title="정책 적용 시점과 rubric 선택" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=3:5
@source sev-tool title="취약점 유형별 보정" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=7:7
@source sev-ign title="ignore 기본 조건" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=11:11
@source sev-low title="낮은 영향은 낮은 심각도" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=12:12
@source sev-hard title="강제 억제" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=13:13
@source sev-priv title="권한 전제" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=14:14
@source sev-path title="하위 권한 공격자 경로" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=15:15
@source sev-pub title="내부 노출과 배포 증거 부족" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=17:17
@source sev-like title="가능성 가중" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=19:24
@source sev-prio title="우선순위 매핑" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/severity-policy.md lines=28:35
@source fa-intro title="사실 항목 사용법" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/attack-path-facts.md lines=3:3
@source fa-list title="사실 항목 여덟 개" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/attack-path-facts.md lines=5:12
@source fa-end title="사실과 결정 분리" path=codex-security/plugins/codex-security/skills/attack-path-analysis/references/attack-path-facts.md lines=14:14
@source st-scope title="저장 정책 적용 범위" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=3:3
@source st-own title="scan 소유권" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=7:7
@source st-struct title="구조화 결과의 도구" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=9:9
@source st-read title="running scan의 위협 모델 읽기" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=37:37
@source sa-fields title="compact attack_path 필드" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=44:44
@source sa-ledger title="공유 후보 ledger" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=49:49
@source sa-paths title="attack-path 보고서 경로" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=85:90
@source rub-intro title="rubric 판단 원칙" path=codex-security/plugins/codex-security/references/default-severity-rubric.md lines=3:3
@source rub-crit title="Critical 조건" path=codex-security/plugins/codex-security/references/default-severity-rubric.md lines=5:13
@source rub-high title="High 조건" path=codex-security/plugins/codex-security/references/default-severity-rubric.md lines=15:21
@source rub-med title="Medium 조건" path=codex-security/plugins/codex-security/references/default-severity-rubric.md lines=23:25
@source rub-low title="Low 조건" path=codex-security/plugins/codex-security/references/default-severity-rubric.md lines=27:29
@source rub-info title="Informational 조건" path=codex-security/plugins/codex-security/references/default-severity-rubric.md lines=31:33
@source sch-top title="도구 입력 최상위" path=codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json lines=7:22
@source sch-rep title="reportable 결정 schema" path=codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json lines=68:105
@source sch-ign title="ignore 결정 schema" path=codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json lines=106:143
@source sch-def title="deferred 결정 schema" path=codex-security/plugins/codex-security/schemas/tools/candidate-attack-paths.schema.json lines=144:187
@source led-ctx title="scan 묶임 검사" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=99:103
@source led-reg title="입력 검증 위치" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=105:105
@source led-dup title="중복 후보 거부" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=108:116
@source led-unk title="미지·부적격 후보 거부" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=119:130
@source led-miss title="누락 후보 거부" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=133:141
@source led-write title="ledger 교체 기록" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=143:153
@source disc-list title="후보 목록 도구" path=codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts lines=180:193
@source fr-map title="compact diff 결과 매핑" path=codex-security/plugins/codex-security/references/final-report.md lines=42:49
@source dscan title="diff scan 호출 순서" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=31:33
@source val28 title="validation 제출" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=28:28
@source pub25 title="Continuum 넘김" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=25:25
@source tm title="위협 모델 산출" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=25:27

## 에이전트는 finding을 받아 어떤 순서로 판단하고 결정을 내나? {#behavior span=12}

에이전트는 후보 하나를 두 단계로 처리한다. 첫째 그림은 입력을 확인해 영향과 가능성을 평가하기까지이고, 둘째 그림은 정책을 적용해 결정을 제출하기까지다. 아래 노드 이름이 그림의 라벨과 같다.

@workflow id=attack-path-flow title="입력 확인에서 평가까지"
| store | 저장 정책 읽기 | external | source:purpose |
| mode | 어떤 입력인가? | backend | source:sa-in |
| scanin | scan 산출물이 있나? | backend | source:sc-in |
| missing | 누락 입력 보고 | external | source:sc-in |
| alone | 단독 입력 모으기 | backend | source:sa-in |
| trace | 공격 경로 세우기 | backend | source:st1 |
| control | 통제와 반증 확인 | backend | source:st2 |
| assess | 영향·가능성 평가 | backend | source:st3 |
| store > mode | |
| mode > scanin | scan 단계 |
| mode > alone | 단독 분석 |
| scanin > missing | 없음 |
| scanin > trace | 있음 | emphasis |
| alone > trace | |
| trace > control | |
| control > assess | |

@steps id=attack-path-steps
| store | 저장 정책 읽기 | 에이전트는 호출되면 파일을 만들거나 남기기 전에 `artifact-storage.md`를 읽는다. 이 읽기에는 분기가 없고 다음 노드로 이어진다.[](source:purpose) 이 정책은 plugin이 관리하는 scan과 파일을 쓰는 독립 스킬에 적용되며, SDK가 소유한 workflow는 이 정책 대신 SDK가 준 지시를 따른다.[](source:st-scope) attack path 같은 구조화된 결과는 기존 도구에 두고 보조 파일 도구로 대체하지 않는다.[](source:st-struct) 원문에 명시 없음: 파일을 만들 일이 없는 호출에서도 이 문서를 읽어야 하는지는 적혀 있지 않다. | attack-path-flow | store |
| mode | 어떤 입력인가? | 에이전트는 지금이 scan의 attack-path 단계인지, 사용자가 finding을 직접 넘긴 단독 분석인지 가른다. 앞의 경우는 `scan 산출물이 있나?`로, 뒤의 경우는 `단독 입력 모으기`로 간다.[](source:sc-in)[](source:sa-in) 판정: 두 경우를 가르는 기계적 규칙은 원문에 없다. 호출한 쪽이 맥락을 알려 준다고 읽는 것이 description과 맞다.[](source:fm) | attack-path-flow | mode |
| scanin | scan 산출물이 있나? | 에이전트는 scan이 공급한 per-scan 위협 모델과 후보 집합을 `scan-artifacts.md`의 경로 규약에 따라 찾고, 공급된 입력 경로는 바꾸지 않고 그대로 쓴다.[](source:sc-in) 필요한 scan 산출물이 없으면 `누락 입력 보고`로 가고, 있으면 `공격 경로 세우기`로 넘어간다.[](source:sc-in) compact diff scan에서는 후보를 `list_codex_security_candidates`로 읽으라고 하는데, 이 도구는 `candidate_ledger.jsonl`의 후보 행만 돌려주므로 위협 모델은 이 호출로 얻지 못한다.[](source:cd-load)[](source:disc-list) running scan은 호스트가 쓴 `threatmodel.md`를 `read_codex_security_artifact`로 읽을 수 있다고 storage 문서가 적는다.[](source:st-read) 원문에 명시 없음: 위협 모델을 어느 도구로 읽으라고 이 스킬이 직접 지정하는지. | attack-path-flow | scanin |
| missing | 누락 입력 보고 | 에이전트는 빠진 scan 산출물이 무엇인지 보고한다. 이 노드는 종료로 그렸다.[](source:sc-in) 원문에 명시 없음: 보고한 뒤 평가를 이어 가는지, 멈추는지, 대체 입력을 만들어도 되는지. 판정: 대체 산출물을 만들라는 문장이 없고 근거 없는 공격 사슬을 지어내지 말라는 문장이 있으므로, 없는 입력을 지어 채우지 않는다고 읽는다.[](source:net) | attack-path-flow | missing |
| alone | 단독 입력 모으기 | 에이전트는 사용자가 준 finding, 저장소, 위협 모델이나 보안 정책, 맥락을 받는다. per-scan 산출물은 필요 없다.[](source:sa-in) 중요한 가정은 결과에 밝히고, 맥락이 없어 의미 있는 평가를 못 할 때만 사용자에게 묻는다.[](source:sa-in) 입력이 갖춰지면 `공격 경로 세우기`로 넘어간다. 원문에 명시 없음: 위협 모델도 보안 정책도 없을 때의 행동. 가정을 밝히고 진행하는 쪽이 위 조건과 맞는다는 것은 판정이다. | attack-path-flow | alone |
| trace | 공격 경로 세우기 | 에이전트는 받은 finding에서 범위 안의 공격자, 영향받는 제품 표면, 진입점, 조종 가능한 입력, 보안 경계, 민감한 동작을 정하고, 각 단계를 저장소 근거와 주어진 대상 관찰로 추적한다.[](source:st1) 경로를 적을 때는 공격자가 조종하는 입력, 번호를 붙인 공격자 단계, 민감한 동작, 이들을 잇는 근거를 쓴다.[](source:fa-list) imported AWS Continuum 이슈이면 finding 근거의 `source_data.evidence_artifacts`도 읽는다. 저장소가 보여 주지 못하는 단계는 `VALIDATION_EVIDENCE`의 `body.validationEvidence`가 보여 줄 수 있으므로, 시험한 대상과 공격자 권한과 관찰된 효과를 주장한 경로에 맞춰 본다.[](source:cont) 공급된 artifact는 근거로만 다루고, 네트워크는 사용자가 명시적으로 허가했을 때만 쓰며 오프라인 scan은 쓰지 않는다. 근거 없는 공격 사슬은 만들지 않는다.[](source:net) | attack-path-flow | trace |
| control | 통제와 반증 확인 | 에이전트는 관련 통제와 가장 강한 반증을 찾는다. 그 통제가 무엇을 확립하는지, 어떤 전제가 남는지, 주장한 정확한 경계를 실제로 넘는지를 설명한다.[](source:st2) 결과에는 반증이 경로를 무너뜨리는지와 그 이유를 적는다.[](source:fa-list) 배포나 공개 ingress 증거가 없으면 확신도가 낮아질 수는 있지만, 그것만으로 뒷받침된 finding이 무효가 되지는 않는다.[](source:net) 비공개나 내부 노출만으로도 실제 제품의 인가·신원·trust boundary·보안 통제 실패를 억제하지 않는다.[](source:sev-pub) Continuum 증거는 종류마다 확립하는 범위가 다르므로 인용할 때 artifact ID와 그 단계를 뒷받침하거나 반박하는 관찰을 함께 적는다.[](source:cont) | attack-path-flow | control |
| assess | 영향·가능성 평가 | 에이전트는 확인한 사실에서 영향과 가능성을 평가한다.[](source:st3) 영향은 취약점 범주, 영향받는 runtime·data·identity·build·network 표면, 대상 도달 범위, 관련 secret 종류로 적는다.[](source:fa-list) 가능성은 확립된 공격자 위치와 노출 벡터로 가중한다. `remote`는 보통 high, `local_network`는 보통 medium, `localhost`는 하위 권한 공격자가 listener에 현실적으로 닿지 않으면 보통 low를 받치고, `none`은 노출을 근거로 가능성을 올리지 않는다.[](source:sev-like) 출발점은 후보가 제시한 severity 가설이며, 지원되는 영향·가능성·전제·완화에 따라 조정한다.[](source:sev-intro) 평가가 끝나면 다음 그림의 `severity-policy 적용`으로 넘긴다. | attack-path-flow | assess |

위 그림은 후보 하나의 핵심 경로만 그린다.

후보가 여럿이면 후보마다 같은 과정을 거쳐 후보별 결정을 낸다는 것은 판정이다. 원문이 모든 자격 후보에 명시적 결정을 요구하기 때문이다.[](source:st4) 

원문에는 앞 단계로 되돌아가는 간선이 없고, 정책 적용 중 discovery를 다시 열지 말라는 문장만 있다.[](source:sev-intro) Continuum 증거 읽기와 네트워크 제한은 `공격 경로 세우기`와 `통제와 반증 확인` 설명에 풀어 썼다.

@workflow id=decision-flow title="평가에서 결정 제출까지"
| apply | severity-policy 적용 | backend | source:sev-intro |
| decide | 정책 결정은? | backend | source:sev-path |
| rep | reportable 기록 | backend | source:sch-rep |
| ign | ignore 기록 | backend | source:sch-ign |
| defer | deferred 기록 | backend | source:sch-def |
| form | 어느 출력 계약인가? | backend | source:other |
| tool | workbench 도구로 제출 | backend | source:cd-sub |
| receipt | report·receipt 작성 | backend | source:other |
| memo | 평가문 반환 | backend | source:out-fmt |
| apply > decide | |
| decide > rep | 보고 대상 | emphasis |
| decide > ign | 경로 없음 |
| decide > defer | 증명 간극 |
| rep > form | |
| ign > form | |
| defer > form | |
| form > tool | compact diff |
| form > receipt | 다른 phase |
| form > memo | 단독 분석 |

@steps id=decision-steps
| apply | severity-policy 적용 | 에이전트는 세워 둔 사실에 `severity-policy.md`를 적용한다.[](source:st3) 정책은 attack path와 범위와 반증을 확립한 뒤에 적용하며, 보정 중에 discovery를 다시 열지 않는다.[](source:sev-intro) 보고 대상의 등급은 scan이 준 rubric으로 매기고, 없으면 `default-severity-rubric.md`로 매긴다.[](source:sev-intro) 결과에서 사실, 심각도 보정, 최종 정책 결정이 서로 구분되게 둔다.[](source:st3) 취약점 유형별 보정 지침도 있다. SSRF는 문서화된 outbound-request 기능이나 선택적 operator 필터가 입증된 목적지 통제 우회를 막지 못한다고 본다. CSRF는 브라우저 credential 첨부, cookie 정책, preflight, 요청 파싱, 실효 통제를 평가하며 method나 JSON content type만으로는 범주적 방어가 아니다. XSS는 자기 자신에게만 미치는 영향과 피해자 영향을 구분하고, `alert` 재현은 스크립트 실행만 보일 뿐 심각도를 정하지 못한다.[](source:sev-tool) 그다음 `정책 결정은?`으로 간다. | decision-flow | apply |
| decide | 정책 결정은? | 에이전트는 후보를 세 결정 중 하나로 가른다. 현실적인 하위 권한 공격자 경로를 저장소 근거나 공급된 validation 근거로 세울 수 있어야 보고 대상이고, 세울 수 없으면 `ignore`다.[](source:sev-path) 반증된 finding, 의미 있는 보안 영향이 없는 버그, 자기 자신에게만 미치는 영향, 실현 불가능하거나 매우 비현실적인 전제도 `ignore`다.[](source:sev-ign)[](source:sev-hard) 권한 있는 사용자나 operator나 developer나 물리 접근이나 보호된 쓰기 경로만 전제하면 `ignore`이지만, 권한 상승 차이가 쟁점이면 예외다.[](source:sev-priv) 영향이나 가능성이 낮다는 이유만으로 실제 보고 대상 finding을 버리지 않고 더 낮은 심각도를 준다.[](source:sev-low) 증명 간극이 남아 `reportable`로도 `ignore`로도 확정하지 못하는 후보가 `deferred`라는 것은 판정이다. 원문은 이 스킬에서 `deferred`를 고르는 조건을 직접 정의하지 않고, schema가 `proof_gap`을 필수로 요구하기 때문이다.[](source:sch-def)[](source:other) | decision-flow | decide |
| rep | reportable 기록 | 에이전트는 `severity`를 `critical`, `high`, `medium`, `low` 중 하나로 정하고, `decision`과 `dataflow`, `reachability`, `counterevidence`, `impact`, `likelihood`, `severity_rationale`, `change_conditions`까지 아홉 필드를 모두 채운다.[](source:sch-rep) 최종 reportable severity는 `critical`은 `P0`, `high`는 `P1`, `medium`은 `P2`, `low`는 `P3`로 옮긴다.[](source:sev-prio) 원문에 명시 없음: schema에 우선순위 속성이 정의돼 있지 않으므로 compact diff 기록에서 `P0`~`P3`를 어디에 적는지는 알 수 없다.[](source:sch-rep) 기본 rubric의 Informational 등급은 `reportable`의 severity 값 목록에 없다.[](source:rub-info)[](source:sch-rep) 그래서 compact diff attack-path 기록에서 Informational을 `reportable`로 남길 칸이 없다는 것은 판정이다. | decision-flow | rep |
| ign | ignore 기록 | 에이전트는 `decision`과 `severity`를 둘 다 `ignore`로 적는다. schema에서 `severity`는 `ignore` 상수이고, `impact`와 `likelihood`와 `dataflow`와 `reachability`와 `counterevidence`와 `severity_rationale`와 `change_conditions`도 여전히 필수다.[](source:sch-ign) 우선순위는 붙이지 않는다.[](source:sev-prio) 제외하는 후보도 왜 제외했는지 설명할 증거를 남기고, 다른 phase 기반 scan에서는 살아남는 finding 집합에서 빼기 전에 `ignore`를 먼저 기록한다.[](source:out-end)[](source:other) 호스트가 최종 draft로 옮길 때 attack-path `ignore`는 `rejected` coverage가 된다.[](source:fr-map) | decision-flow | ign |
| defer | deferred 기록 | 에이전트는 `decision`을 `deferred`로 두고 `proof_gap`에 빠진 증명을 적는다. 이 칸은 필수이고 `nonEmptyText`로 정의돼 있다.[](source:sch-def) `severity`는 `critical`, `high`, `medium`, `low`, `unknown` 중 하나이며, scan 산출물 문서는 이를 잠정 reportable severity 또는 `unknown`이라고 적는다.[](source:sch-def)[](source:sa-fields) 다른 phase 기반 scan에서는 receipt에 정확한 proof gap을 남긴다.[](source:other) 최종 draft에서는 증명 간극이 달린 `needs_follow_up` surface와 deferred 작업이 된다.[](source:fr-map) | decision-flow | defer |
| form | 어느 출력 계약인가? | 에이전트는 결정을 어디에 어떤 형식으로 내는지 가른다. `scanId`가 있는 workbench 기반 `$security-diff-scan`이면 compact diff 계약을, 다른 phase 기반 scan이면 그 workflow의 report와 receipt 경로를, 단독 분석이면 호출자의 형식을 따른다.[](source:cd-gate)[](source:other)[](source:out-fmt) 세 갈래가 서로 겹치는 호출이 있는지는 원문에 명시 없음이다. 겹치지 않는 세 갈래로 읽는 것은 판정이다. | decision-flow | form |
| tool | workbench 도구로 제출 | 에이전트는 `list_codex_security_candidates({ scanId, cursor?, limit? })`로 후보를 읽고, validation 처분이 `reportable`이나 `deferred`인 후보를 전부 분석한다. 후보 정체성과 기존 discovery·validation 필드는 보존한다.[](source:cd-load)[](source:cd-elig) 그다음 모든 결정을 `record_candidate_attack_paths({ scanId, attackPaths: [{ candidateId, attackPath }] })` 한 번 호출로 제출하고, 들어갈 후보가 없으면 `attackPaths: []`를 제출한다.[](source:cd-sub) 도구는 후보 ID 중복, ledger에 없는 후보, 처분이 `reportable`·`deferred`가 아닌 후보, 빠진 자격 후보, scan에 묶이지 않은 context를 각각 거부한다.[](source:led-dup)[](source:led-unk)[](source:led-miss)[](source:led-ctx) 통과하면 후보 행에 `attack_path` 객체를 더해 ledger 전체를 다시 쓰며, 후보 순서와 기존 필드는 그대로 둔다.[](source:led-write) 이 중첩 결정이 phase의 전체 출력이므로 보고서나 receipt나 수동 ledger를 따로 만들지 않는다.[](source:cd-fin) 원문에 명시 없음: 도구가 거부한 뒤 다시 제출하는 절차. | decision-flow | tool |
| receipt | report·receipt 작성 | 에이전트는 그 workflow의 report와 receipt 경로(`scan-artifacts.md`)에 따라 후보마다 명시적 결정을 낸다. receipt에는 후보 ID, 사실 또는 정확한 proof gap, report 참조가 들어간다.[](source:other) standalone이나 legacy diff workflow는 scan 수준 `<findings_dir>/attack_path_analysis_report.md`나 후보별 `<findings_dir>/<candidate_id>/attack_path_analysis_report.md`를 쓸 수 있다.[](source:sa-paths) 저장소 전체나 범위 지정 경로 scan에서는 discovery가 finding 번호를 다듬지 않았어도, validation closure 행 중 `reportable`이거나 `survives: yes`인 것을 포함하고 validation이 준 진입점·wrapper, root-control, sink, 구체 구현 위치를 보존한다.[](source:repo) 원문에 명시 없음: 이 경로를 쓰는 scan이 구체적으로 어느 호출인지. 원문은 Standard scan과 Deep worker가 이 스킬을 부르지 않는다고 적는다.[](source:integ) | decision-flow | receipt |
| memo | 평가문 반환 | 에이전트는 호출자가 정한 형식으로 답하고, 형식이 없으면 finding마다 간결한 평가를 돌려준다.[](source:out-fmt) 평가에는 제목과 받은 후보·인스턴스·ledger 식별자, 정확한 영향 위치와 공격자에서 영향까지의 단계, 관련 사실, 통제와 반증과 전제와 중요한 proof gap, 영향과 가능성과 보정된 심각도와 최종 정책 결정 및 그 이유가 들어간다.[](source:out-list) 같은 증거를 여러 제목 아래 되풀이하지 않고 간결한 항목이나 문단으로 쓴다.[](source:fa-intro) 남는 finding과 억제한 finding을 모두 설명할 증거를 보존하며, discovery를 다시 열거나 다른 공격 이야기로 바꾸지 않는다.[](source:out-end) | decision-flow | memo |

이 그림도 후보 하나 기준이며 `정책 결정은?` 이후 세 갈래가 `어느 출력 계약인가?`로 다시 모인다. 도구 거부 뒤의 재제출은 원문에 없어서 그리지 않았다. 도구가 거부하는 조건은 `workbench 도구로 제출` 설명과 아래 강제 패널에 있다.

## 설명용 예시로 보면 결정은 어떻게 갈리나? {#example span=12}

설명용 예시다. 입력은 분석자가 지어냈고, 결과는 조건문으로만 쓴다. validation이 `reportable`로 넘긴 후보에서 공격자가 로그인한 일반 사용자이고 영향이 그 사용자 자신의 데이터에 그친다면, 자기 자신에게만 미치는 영향이므로 결정은 `ignore`, severity도 `ignore`다.[](source:sev-hard)[](source:sch-ign)

같은 후보에서 다른 사용자의 데이터에 닿는 경로를 저장소 근거로 세울 수 있다면, 자기 영향에 그치지 않으므로 보고 대상이 될 수 있다. 이때 등급은 scan이 준 rubric이나 default rubric으로 매긴다.[](source:sev-path)[](source:sev-intro)

코드로는 인증 없는 경로가 보이지만 배포 라우팅 증거가 없는 후보도 있다. 증거 부족은 확신도를 낮출 수는 있어도 뒷받침된 finding을 무효로 만들지 않으므로, 이 사실만으로 `ignore`하지 않는다.[](source:net)[](source:sev-pub)

## 보고 여부와 결정 필드는 어떤 규칙으로 갈리나? {#decision-rules span=12}

위 `정책 결정은?` 노드가 쓰는 규칙을 찾아보기 쉽게 모았다. 앞 표는 `ignore`와 보고 대상을 가르는 규칙이고, 뒤 표는 결정마다 compact diff schema가 요구하는 값이다.

| 규칙 | 내용 |
| --- | --- |
| 반증·무영향 | 반증된 finding이나 의미 있는 보안 영향이 없는 버그는 `ignore`다.[](source:sev-ign) |
| 낮은 영향 | 영향이나 가능성이 낮다는 이유만으로 실제 finding을 버리지 않는다. 해당하는 더 낮은 심각도를 준다.[](source:sev-low) |
| 강제 억제 | 자기 자신에게만 미치는 영향, 실현 불가능하거나 매우 비현실적인 전제에는 강제 억제(hard suppression)를 적용한다.[](source:sev-hard) |
| 권한 전제 | privileged-only, operator-only, developer-only, physical-access-only, 보호된 쓰기 경로 전제는 `ignore`다. 권한 상승 차이가 쟁점이면 예외다.[](source:sev-priv) |
| 공격자 경로 | 현실적인 하위 권한·범위 안 공격자 경로를 저장소 근거와 공급된 validation 근거로 세울 수 있어야 한다. 근거가 그런 경로를 받치지 않으면 `ignore`다.[](source:sev-path) |
| 내부 노출 | 비공개·내부 노출만으로는 인가·신원·trust boundary·보안 통제 실패를 억제하지 않는다. 배포·ingress 증거 부족은 확신도를 낮추거나 사실을 미확정으로 남길 뿐이다.[](source:sev-pub) |

| 결정 | `severity` 값 | 결정 전용 필수 필드 |
| --- | --- | --- |
| `reportable` | `critical`, `high`, `medium`, `low`[](source:sch-rep) | 없음. 공통 아홉 필드만 필요하다.[](source:sch-rep) |
| `ignore` | `ignore` 하나[](source:sch-ign) | 없음. 공통 아홉 필드만 필요하다.[](source:sch-ign) |
| `deferred` | `critical`, `high`, `medium`, `low`, `unknown`[](source:sch-def) | `proof_gap`. 열 번째 필수 필드다.[](source:sch-def) |

@facts
| 공통 필드 | `decision`, `dataflow`, `reachability`, `counterevidence`, `impact`, `likelihood`, `severity`, `severity_rationale`, `change_conditions`. 이 중 `dataflow`, `reachability`, `counterevidence`, `severity_rationale`, `change_conditions`는 schema에서 `nonEmptyText`로 정의돼 있다(정의 파일은 읽지 않아 내용은 이름으로만 추정한다).[](source:sch-rep) |
| `impact`·`likelihood` 값 | `high`, `medium`, `low`, `ignore`, `unknown`. 세 결정이 같다.[](source:sch-rep)[](source:sch-ign)[](source:sch-def) |
| 정해진 키 밖의 키 | schema가 허용한다(`additionalProperties: true`).[](source:sch-rep) |

## 심각도와 우선순위는 어떻게 정하나? {#severity span=12}

보고 대상의 등급은 scan이 준 rubric으로 매기고, 없으면 default rubric으로 매긴다.[](source:sev-intro) default rubric은 공격자의 실제 시작 접근, 넘는 경계, 추가 피해로 판단하고 확신도(confidence)와 심각도를 분리한다. 입증하지 못했다는 사실만으로 더 넓은 공격이 불가능하다고 단정하거나 등급을 낮추지 않는다.[](source:rub-intro)

| 등급 | 조건 |
| --- | --- |
| Critical {caution:세 조건 모두} | Access(인터넷의 비인증 공격자나 일반 외부 사용자 등), Impact(중요한 경계를 넘는 의미 있는 접근·실행), Evidence(시연된 exploitation 또는 강한 source 기반 validation이 완전한 경로를 확립)를 모두 충족한다.[](source:rub-crit) |
| High {caution:세 조건 모두} | 더 낮은 신뢰의 행위자가 닿고, 경계를 넘어 상당한 새 능력을 얻고, 그 사이의 현실적 경로가 확인된다. 위험한 함수나 production 라벨만으로는 경로가 입증되지 않는다.[](source:rub-high) |
| Medium | 영향이 구체적으로 한정된 신뢰할 만한 취약점이다. 완전히 시연된 취약점도 Medium일 수 있고, 내림은 검증된 제약에 근거한다.[](source:rub-med) |
| Low | 추가 피해가 작고 범위·민감도·기간의 한계가 검증된 약점이다. 잠재적으로 심각한 경로의 불확실성을 가리는 용도로 쓰지 않는다.[](source:rub-low) |
| Informational | 추가 능력이나 보안 영향이 근거로 확립되지 않은 hardening 관찰이다. 증명 부재를 안전의 증거로 취급하지 않는다.[](source:rub-info) |

가능성은 확립된 공격자 위치와 노출로 가중하고, 확정된 reportable severity는 우선순위로 옮긴다.

@facts
| `remote` | 공격자 위치가 현실적이고 범위 안이면 보통 high 가능성을 받친다.[](source:sev-like) |
| `local_network` | 근거가 다른 수준을 받치지 않으면 보통 medium이다.[](source:sev-like) |
| `localhost` | 하위 권한 공격자가 listener에 현실적으로 닿지 않으면 보통 low다.[](source:sev-like) |
| `none` | 노출을 근거로 가능성을 올리지 않는다.[](source:sev-like) |
| 우선순위 | `critical`은 `P0`, `high`는 `P1`, `medium`은 `P2`, `low`는 `P3`다. `ignore`는 우선순위가 없다.[](source:sev-prio) |

## Continuum 이슈의 증거는 종류별로 어떻게 읽나? {#continuum span=12}

imported AWS Continuum 이슈는 finding 근거의 `source_data.evidence_artifacts`를 읽는다. 저장소가 보여 주지 못하는 단계를 이 증거가 확립할 수 있으므로, 시험한 대상과 공격자 권한과 관찰된 효과가 주장한 경로와 맞는지 대조한다.[](source:cont) `publish-findings`는 Continuum 항목에서 선택한 issue의 저장된 `.evidence`와 validation artifact를 이 스킬에 주라고 한다.[](source:pub25)

| 증거 | 무엇을 확립하나 |
| --- | --- |
| `VALIDATION_EVIDENCE`의 `body.validationEvidence` | 저장소가 보여 주지 못하는 단계를 확립할 수 있다.[](source:cont) |
| bundled issue의 `perFindingResults`, `flowVerdicts` | 있으면 관련 finding과 flow를 식별하는 데 쓴다.[](source:cont) |
| HTTP `exploitArtifact` | 시험한 위치에서의 도달성을 확립한다.[](source:cont) |
| `executedProof` | 시험 환경에서 무엇이 실행됐는지를 확립한다.[](source:cont) |
| `sourceAnalysis` | 정적 추론을 기록한다. `exploitable` 판정만으로는 배포된 도달성을 보이지 못한다.[](source:cont) |

인용할 때는 artifact ID와 그 단계를 뒷받침하거나 반박하는 관찰을 함께 적는다.[](source:cont)

## 무엇을 강제하고 호스트 도구는 무엇을 거부하나? {#enforcement span=12}

앞 표는 스킬 문장이 지시하는 규칙이고, 뒤 표는 compact diff 제출 도구의 코드가 실제로 막는 조건이다. 코드는 읽기만 했고 실행하지 않았다.

| 지시 | 대상 |
| --- | --- |
| 자격 있는 후보마다 명시적 결정(ignore, deferred 포함) | 모든 scan 단계 호출[](source:st4) |
| discovery를 다시 열거나 다른 공격 이야기로 바꾸지 않는다 | 정책 적용 단계[](source:out-end) |
| 후보의 root-control 위치를 잃지 않는다 | 결정 단계[](source:st4) |
| 보고서, receipt, 수동 ledger를 따로 만들지 않는다 | compact diff[](source:cd-fin) |
| 구조화 결과를 보조 파일 도구로 대체하지 않는다 | 저장[](source:st-struct) |
| 네트워크는 사용자가 명시적으로 허가했을 때만, 오프라인 scan은 절대 쓰지 않는다 | 증거 수집[](source:net) |

| 제출 상황 | 도구 반응 |
| --- | --- |
| 같은 `candidateId`를 두 번 넣는다 | 거부한다.[](source:led-dup) |
| ledger에 없는 `candidateId`를 넣는다 | 거부한다.[](source:led-unk) |
| validation 처분이 `reportable`·`deferred`가 아닌 후보를 넣는다 | 거부한다.[](source:led-unk) |
| 자격 있는 후보가 하나라도 빠진다 | 거부한다. 메시지가 "must include every reportable or deferred candidate"로 시작한다.[](source:led-miss) |
| scan에 묶이지 않은 context로 호출한다 | 거부한다.[](source:led-ctx) |
| 입력 모양이 schema와 다르다 | writer 호출 전에 registry가 검증한다. `scanId`와 `attackPaths`만 최상위 키로 받는다.[](source:led-reg)[](source:sch-top) |
| 모두 통과한다 | 후보 행에 `attack_path`를 더해 ledger를 교체하고 `rowsWritten`은 제출한 후보 수다.[](source:led-write) |

판정: 누락 검사가 매 호출마다 전체 자격 후보를 기준으로 하므로, 결정을 나눠 여러 번 제출하면 첫 호출이 거부된다. 그래서 한 번에 전부 제출하라는 지시가 도구에서도 강제된다.[](source:led-miss)[](source:cd-sub)

## 언제 켜지고 언제 쓰면 안 되나? {#when span=12}

description은 모델이 판단하는 데 참고하는 설명이며, 특정 단어가 있어야 켜지는 사전이 아니다. frontmatter에 `disable-model-invocation` 같은 호출 제한 필드는 없다.[](source:fm)

@code source=fm language=yaml

agent 표시 설정의 기본 프롬프트도 같은 방향이다.[](source:yaml)

@code source=yaml language=yaml

| 상황 | 쓰는가 |
| --- | --- |
| scan이 이미 attack-path 단계에 있다 | {good:쓴다} 이 단계에서 부르는 스킬이다.[](source:fm) |
| 사용자가 finding을 source에서 sink까지 추적해 심각도를 보정해 달라고 명시한다 | {good:쓴다} 단독 분석이며 per-scan 산출물은 필요 없다.[](source:fm)[](source:sa-in) |
| 전체 PR, commit, branch, patch, 저장소 scan을 시작하려 한다 | {bad:1차 트리거로 쓰지 않는다}[](source:fm) |
| Standard scan이나 Deep Scan worker가 attack path를 평가한다 | {bad:이 스킬을 부르지 않는다} 자기 Standard scan workflow 안에서 평가한다.[](source:integ) |
| compact diff에서 validation 처분이 `reportable`·`deferred`가 아닌 후보 | {bad:제출에 넣지 않는다} 넣으면 도구가 거부한다.[](source:cd-elig)[](source:led-unk) |
| 증거를 얻으려고 네트워크가 필요하다 | {caution:사용자가 명시적으로 허가했을 때만} 오프라인 scan은 절대 쓰지 않는다.[](source:net) |
| 단독 분석인데 per-scan 산출물이 없다 | {caution:진행한다} 필요 없으며 중요한 가정을 밝힌다.[](source:sa-in) |

## 앞뒤 스킬과 어떻게 이어지나? {#position span=12}

이 스킬은 `scan-vulnerabilities` 묶음의 단계 스킬이다. 전체 흐름은 `codex-security/_group-scan-vulnerabilities/scan-vulnerabilities.html`에 있다. 아래 그림은 compact diff 안에서 앞(validation)과 이 스킬과 뒤(최종 draft 매핑)만 그린다.

@workflow id=position-flow title="validation에서 최종 draft까지"
| before | validation | backend | source:val28 |
| current | attack-path-analysis | backend | source:cd-sub |
| after | 최종 draft 매핑 | external | source:fr-map |
| before > current | R12 후보 전달 | emphasis |
| current > after | R79 결정 매핑 | emphasis |

@steps id=position-steps
| before | validation | 에이전트는 diff scan이 후보가 있을 때 한 번 실행한 `$validation`의 결과를 이어받는다.[](source:dscan) validation은 모든 후보의 처분을 한 번에 제출하며 빈 집합도 `validations: []`로 제출한다.[](source:val28) 이 스킬이 받는 후보는 처분이 `reportable`이나 `deferred`인 것뿐이다.[](source:cd-elig) | position-flow | before |
| current | attack-path-analysis | 이 스킬은 `security-diff-scan`이 validation 다음에 한 번 실행한다.[](source:dscan) 여기서 후보마다 `attack_path`를 정해 도구로 한 번에 제출한다.[](source:cd-sub) 위 `workbench 도구로 제출` 설명이 이 노드의 내부 동작이다. | position-flow | current |
| after | 최종 draft 매핑 | 에이전트는 diff scan 본문에서 `final-report.md`를 읽고 `record_codex_security_scan_draft`로 draft를 저장한다.[](source:dscan) 호스트가 결과를 옮기는 순서는 이렇다. validation `reportable`과 attack-path `reportable`이면 finding, 둘 중 하나가 `deferred`면 `needs_follow_up` surface와 deferred 작업, validation `not_applicable`이면 `not_applicable` coverage, validation `suppressed`나 attack-path `ignore`면 `rejected` coverage다.[](source:fr-map) 원문에 명시 없음: validation `deferred`와 attack-path `ignore` 조합은 2번과 4번에 모두 해당할 수 있어 어느 쪽이 우선하는지 적혀 있지 않다. "순서대로"라는 말로 2번이 먼저 적용된다고 읽는 것은 판정이다. | position-flow | after |

| 관계 | 받는 것 | 넘기는 것 | 조건 |
| --- | --- | --- | --- |
| R09 · 내부 위임 | `security-diff-scan`이 `$attack-path-analysis`를 validation 다음에 한 번 실행한다.[](source:dscan) | 후보별 `attack_path` 결정이다. 호스트 workbench의 `record_candidate_attack_paths`가 상태를 관리한다.[](source:cd-sub) | `reportable`·`deferred` 후보에만 실행한다. 없으면 `attackPaths: []`다.[](source:cd-sub) |
| R12 · 산출물 호환 | validation이 처분을 붙인 후보다.[](source:val28) | 같은 후보와 기존 필드다.[](source:cd-elig) | 처분이 `reportable`·`deferred`인 후보만 분석한다.[](source:cd-elig) |
| R13 · 산출물 호환 | 위협 모델이다. scan에서는 per-scan 모델, 단독에서는 있으면 위협 모델이나 보안 정책이다.[](source:sc-in)[](source:sa-in) | 없다. | 단독 분석에 per-scan 산출물은 필요 없다. 위협 모델 산출 방식은 `threat-model` 스킬이 정한다.[](source:tm) |
| R17 · 참고 | Standard scan과 Deep Scan worker의 attack-path 평가다. | 없다. 이 스킬을 호출하지 않는다.[](source:integ) | 이들은 자기 Standard scan workflow 안에서 평가한다.[](source:integ) |
| R36 · 넘김 | `publish-findings`가 AWS Continuum 항목에서 선택한 issue의 저장된 `.evidence`와 validation artifact를 넘긴다.[](source:pub25) | 없다. | AWS Continuum 항목에 한한다. 에이전트가 선택한 issue를 넘긴다.[](source:pub25) |
| R74 · 공유 상태 | `candidate_ledger.jsonl` 하나를 discovery, validation, attack-path가 이어서 쓴다.[](source:sa-ledger) | attack-path는 `reportable`·`deferred` 후보에만 `attack_path` 객체를 더한다.[](source:sa-ledger)[](source:led-write) | 도구가 후보 순서와 기존 필드를 보존한다.[](source:led-write) |
| R79 · 참고 | 두 phase의 기록이다. | 최종 finding, `needs_follow_up`, coverage 처분이다.[](source:fr-map) | 위 `최종 draft 매핑` 설명의 순서를 따른다.[](source:fr-map) |
| R60·R85·R77 · 참고 | 저장 정책, scan 경로 규약, default rubric 문서다.[](source:purpose)[](source:other)[](source:sev-intro) | 없다. | 이 스킬이 읽으라고 직접 가리키는 문서들이다. |

## 어디까지 확인했고 무엇이 열려 있나? {#audit span=12}

스킬 폴더의 텍스트 원본은 네 개(`SKILL.md`, `references/severity-policy.md`, `references/attack-path-facts.md`, `agents/openai.yaml`)를 모두 읽었다. `scripts/`, `templates/`, 바이너리는 이 폴더에 없다.

스킬이 지목한 참조 파일과 호스트 도구 소스, 관계 원장이 근거로 든 이웃 스킬의 줄은 아래 표와 같다. 번역본은 이 스킬 폴더에 없다.

분석 중 원본은 수정하지 않았고, 스킬이나 호스트 도구의 어떤 지시도 실행하지 않았다. 표의 경로는 `codex-security/plugins/codex-security/`를 기준으로 한다.

| 파일 | 바이트 | 읽은 범위 |
| --- | --- | --- |
| `skills/attack-path-analysis/SKILL.md` | 5355 | 전체 |
| `skills/attack-path-analysis/references/severity-policy.md` | 2644 | 전체 |
| `skills/attack-path-analysis/references/attack-path-facts.md` | 1585 | 전체 |
| `skills/attack-path-analysis/agents/openai.yaml` | 261 | 전체 |
| `references/artifact-storage.md` | 7947 | 전체 |
| `references/scan-artifacts.md` | 11701 | 전체 |
| `references/default-severity-rubric.md` | 3348 | 전체 |
| `schemas/tools/candidate-attack-paths.schema.json` | 6810 | 전체 |
| `mcp-app/src/artifact-candidate-ledger.ts` | 6121 | 전체 |
| `mcp-app/src/artifact-discovery.ts` | 6305 | 부분 읽음: 170~199줄 |
| `references/final-report.md` | 12135 | 부분 읽음: 30~56줄 |
| `skills/security-diff-scan/SKILL.md` | 5405 | 부분 읽음: 26~36줄 |
| `skills/validation/SKILL.md` | 4619 | 부분 읽음: 24~31줄 |
| `skills/publish-findings/SKILL.md` | 11118 | 부분 읽음: 23~26줄 |
| `skills/threat-model/SKILL.md` | 2986 | 부분 읽음: 25~27줄 |

읽은 텍스트 파일은 15개이고 전체 읽음 9개, 부분 읽음 6개다. 파일 크기 합은 88340바이트다. 구조·표본만 확인한 생성 데이터는 없다.

@callout level=open-question title="원문끼리 맞지 않거나 명시되지 않은 곳"
| 첫째, `SKILL.md`는 위협 모델과 검증된 후보를 `list_codex_security_candidates`로 읽으라고 하지만 이 도구는 ledger의 후보 행만 돌려준다. 위협 모델을 읽는 법은 이 문장에 없고, running scan이 `threatmodel.md`를 읽을 수 있다는 규정은 storage 문서에 있다.[](source:cd-load)[](source:disc-list)[](source:st-read) 둘째, severity 우선순위(`P0`~`P3`)를 compact diff 기록 어디에 적는지는 schema에 속성이 없어 알 수 없다.[](source:sev-prio)[](source:sch-rep) 셋째, 기본 rubric의 Informational은 `reportable`의 severity 값에 없다.[](source:rub-info)[](source:sch-rep) 넷째, 이 스킬이 `deferred`를 고르는 조건은 정의돼 있지 않다.[](source:sch-def) 다섯째, validation `deferred`와 attack-path `ignore` 조합의 최종 매핑 우선순위가 명시돼 있지 않다.[](source:fr-map) 여섯째, 도구가 제출을 거부한 뒤의 재시도 절차가 없다.[](source:led-miss) 일곱째, 저장소 전체·범위 지정 경로 scan에서 이 스킬을 부르는 호출이 어느 것인지 명시돼 있지 않다.[](source:repo)[](source:integ) |

@callout level=open-question title="확인하지 못한 것"
| 호스트 도구를 호출하지 않았다. `attack_path` 객체가 ledger에 쓰이는 동작은 TypeScript 소스를 읽어서만 확인했다. `candidate-attack-paths.schema.json`이 가리키는 공통 정의 파일(`artifact-common.schema.json`)은 읽지 않았다. `publish-findings`가 Continuum 증거를 실제로 어떤 형식으로 저장하는지는 25줄만 읽어 확인하지 못했다.[](source:led-write)[](source:sch-top)[](source:pub25) |
