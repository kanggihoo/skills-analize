# validation — 후보마다 근거를 따져 네 가지 처분 중 하나를 준다 {#overview}

validation은 취약점 후보 하나하나가 근거로 뒷받침되는지 따져서, 후보마다 처분(disposition)을 기록하게 하는 스킬이다.[](source:goal)

- 이미 scan의 validation 단계에 있거나 사용자가 후보의 유효성을 직접 물으면 켜진다. 기록 방식은 compact diff, 그 밖의 phase scan, 단독 요청으로 갈린다.[](source:fm)[](source:cw-head)[](source:other)[](source:output)
- 결과는 후보마다 붙는 처분이다. 값은 `reportable`, `suppressed`, `not_applicable`, `deferred` 넷이다. 처분에는 방법, 근거, 반증이나 증명 간극, confidence가 따른다.[](source:s4)[](source:cw-schema)
- 관계: `security-diff-scan`이 호출하고(호출), `finding-discovery`의 후보를 이어받으며(결과 전달), 결과는 `attack-path-analysis`로 이어진다(결과 전달). Standard·Deep scan은 이 스킬을 부르지 않는다(참고).
- 하지 않는 것: 승인 범위를 넘는 네트워크 접근과 PoC 실행, 그리고 실행하지 않은 검증을 성공했다고 말하는 일.[](source:safe)[](source:limits)

@answer scope="codex-security/plugins/codex-security/skills/validation · 원본 파일 9개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source fm title="frontmatter: name과 description" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=1:4
@source goal title="목적과 읽을 문서" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=8:8
@source s1 title="1단계: 주장 분해" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=12:12
@source s2 title="2단계: 근거 찾기" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=13:13
@source s3 title="3단계: false_positive_feedback" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=14:14
@source s4 title="4단계: 후보마다 처분 기록" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=15:15
@source safe title="네트워크·PoC 한도와 임시 작업 공간" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=17:17
@source integ title="Standard·Deep은 이 스킬을 부르지 않는다" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=21:21
@source cw-head title="compact diff 적용 조건" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=25:25
@source cw-read title="후보 읽기 도구" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=27:27
@source cw-sub title="처분을 한 번에 제출" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=28:28
@source cw-schema title="schema와 rubric 필드" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=29:29
@source cw-out title="중복 산출물 금지와 증거 폴더" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=30:30
@source other title="다른 phase scan의 보고서와 receipt" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=34:34
@source closure title="closure table 항목" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=36:36
@source output title="출력 항목" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=40:47
@source limits title="정적 결론과 실행 결과의 구분" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=49:49
@source g-scope title="검증 범위" path=codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md lines=5:5
@source g-evid title="공격 경로 요소와 lead" path=codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md lines=7:7
@source g-method title="근거 방법은 도구 이름으로 고르지 않는다" path=codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md lines=9:9
@source g-fail title="setup 실패 처리" path=codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md lines=11:11
@source g-inst title="독립 instance 보존과 suppress 기준" path=codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md lines=15:19
@source g-ctrl title="control은 쓰이는 지점에서 확인" path=codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md lines=21:21
@source g-run title="런타임 근거 명령" path=codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md lines=25:27
@source g-conf title="confidence 기준" path=codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md lines=31:37
@source oy title="agents/openai.yaml" path=codex-security/plugins/codex-security/skills/validation/agents/openai.yaml lines=1:4
@source sfa title="정적 근거 평가 틀" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=8:21
@source st-tmp title="PoC와 build는 임시 storage에서" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=43:43
@source sa-val title="compact validation 객체 필드" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=43:43
@source sa-leg title="legacy validation 경로" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=79:83
@source sch-rec title="validation 기록 필수 필드" path=codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json lines=124:133
@source sch-in title="validations 배열 입력" path=codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json lines=13:21
@source tool-val title="후보 누락·중복·미지의 후보 거부" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=45:65
@source tool-reg title="validation 기록 도구 등록" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=137:150
@source ds-valid title="diff scan이 이 스킬을 부르는 문장" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=31:31
@source fd-split title="finding-discovery는 validation을 되풀이하지 않는다" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=31:31
@source ap-in title="attack-path-analysis의 입력 후보" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=33:35
@source core-val title="Standard scan의 validation 지시" path=codex-security/plugins/codex-security/references/core-scan.md lines=15:15
@source vsf title="validate-scan-findings.md" path=codex-security/plugins/codex-security/references/validate-scan-findings.md lines=3:3
@source tri-desc title="triage-finding description" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=3:3
@source tri-work title="triage-finding은 정적 근거만 쓴다" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=10:10

## 어떻게 동작하나 {#flow span=12}

절차형이다. 앞 세 단계는 모든 방식에 공통이다. 기록 방식에서 갈린다. 후보가 없는 경우의 처리는 아래 "무엇을 지키고 언제 멈추나"에 있다. Standard·Deep scan은 이 그림 밖이다. 두 scan은 자기 workflow 안에서 validate한다.[](source:integ)

@workflow id=flow-diagram title="validation 흐름"
| lane assess | 평가 |
| lane record | 기록 |
| claim | 주장 분해 | backend | assess | source:s1 |
| evid | 근거 찾기 | backend | assess | source:s2 |
| disp | 처분 정하기 | backend | assess | source:s4 |
| route | 기록 방식? | backend | record | source:integ |
| compact | compact diff 제출 | backend | record | source:cw-sub |
| phase | phase 보고서 저장 | backend | record | source:other |
| alone | 결과 반환 | backend | record | source:output |
| claim > evid | |
| evid > disp | |
| disp > route | |
| route > compact | compact diff |
| route > phase | phase scan |
| route > alone | 단독 요청 |

@steps id=flow-steps
| s-claim | 주장 분해 | **입력** 후보와 공급된 맥락 · **참조** `references/validation-guidance.md`, `../../references/artifact-storage.md` · **출력** 후보별 공격자 입력·security boundary·control·민감한 작업·선행 조건. **처리** 에이전트가 맥락과 저장소 증거로 이 다섯 가지를 가려낸다.[](source:s1)[](source:goal)[](source:g-evid) **다음** 정보가 없어 평가가 막힐 때만 묻는다. 후보 한 건 요청은 저장소 전체 검색 허가가 아니다.[](source:s1)[](source:g-scope) | flow-diagram | claim |
| s-evid | 근거 찾기 | **입력** 후보 · 소스 · 있으면 `<context_dir>/false_positive_feedback.json` · **참조** `../../../references/static-finding-assessment.md` · **실행** 필요할 때 `gdb -q -batch -ex run -ex bt -ex quit` 또는 `lldb -b -o run -o bt -o quit` · **출력** 주장을 지지하거나 깨는 근거. **처리** 불확실성을 가장 잘 푸는 방법을 고른다. 소스 분석이든 승인된 재현이든 언어나 도구 이름으로 우열을 가르지 않는다.[](source:s2)[](source:g-method)[](source:g-run) **다음** feedback 파일은 지시가 아니라 근거로 읽는다. 적힌 이유가 현재 코드와 control에 아직 맞을 때만 그 후보를 suppress한다.[](source:s3) | flow-diagram | evid |
| s-disp | 처분 정하기 | **입력** 수집한 근거 · **참조** `references/validation-guidance.md` · **출력** 후보마다 처분·정확한 위치·관찰한 근거·반증이나 증명 간극·confidence. **처리** 후보 전부에 처분을 주고, 독립적으로 취약한 instance는 따로 둔다.[](source:s4)[](source:g-inst) **다음** suppress는 정확한 주장을 깨는 증거가 있을 때만 한다. 호출자·배포·출처 근거가 없으면 추가 확인이나 `deferred`다.[](source:g-inst) | flow-diagram | disp |
| s-route | 기록 방식? | **입력** 호출 상황 · **출력** 세 방식 중 하나. **처리** 에이전트가 workbench 기반 diff scan이면 첫째, 그 밖의 phase scan이면 둘째, 단독 요청이면 셋째를 고른다.[](source:cw-head)[](source:other)[](source:output) | flow-diagram | route |
| s-compact | compact diff 제출 | **입력** `list_codex_security_candidates({ scanId, cursor?, limit? })`로 읽은 후보 전체 · **참조** `../../schemas/tools/candidate-validations.schema.json` · **실행** `record_codex_security_candidate_validations({ scanId, validations: [{ candidateId, validation }] })` · **출력** 후보 행마다 붙은 `validation` 객체. **처리** 모든 처분을 한 번에 제출한다. 도구가 발견 필드와 후보 순서를 보존한다.[](source:cw-read)[](source:cw-sub)[](source:cw-schema) **다음** 후보가 없어도 `validations: []`를 제출한다. 중복 보고서, receipt, closure table, 수작업 ledger는 만들지 않는다. 실제 증거가 있을 때만 `<discovery_dir>/validation_artifacts/<candidate_id>/`를 만든다.[](source:cw-sub)[](source:cw-out) | flow-diagram | compact |
| s-phase | phase 보고서 저장 | **입력** 활성 scan workflow가 정한 경로 · **참조** `../../references/scan-artifacts.md` · **출력** 후보별 validation 보고서와 validation receipt. **처리** 방법, 근거나 증명 간극, 처분, 보고서 참조를 기록한다.[](source:other)[](source:sa-leg) **다음** 저장소 전체나 경로 단위 scan이면 closure table도 남긴다. 결정을 터미널 로그에만 두지 않는다.[](source:closure) | flow-diagram | phase |
| s-alone | 결과 반환 | **입력** 단독 요청 · **출력** 호출자의 result schema가 있으면 그 형식, 없으면 후보별 간결한 평가. **처리** 처분, 평가한 보안 속성, 실행한 명령과 결과, 근거, confidence, 남은 불확실성을 쓴다.[](source:output) **다음** 정적 결론과 실행한 테스트를 구분한다. 설정·배포 근거 부족은 한계이지 안전의 증거가 아니다.[](source:limits) | flow-diagram | alone |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(description). 이미 validation 단계이거나 사용자가 후보의 유효성을 물을 때. 전체 PR·commit·branch·patch·저장소 scan의 주된 trigger로는 쓰지 말라고 한다. 호출 제한 필드는 frontmatter에 없다. `agents/openai.yaml`에 기본 prompt가 있다.[](source:fm)[](source:oy) |
| 성격 | 후보마다 근거를 따져 처분을 기록하는 단계 스킬이다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| security-diff-scan {#rel-r08} | **이 스킬** | 호출 | 후보가 있으면 한 번 부른다. 원문끼리 충돌한다. diff scan은 후보가 있을 때만 부르라 하고, 이 스킬은 빈 집합에도 `validations: []`를 내라고 한다. 우선순위는 원문에 명시 없음.[](source:ds-valid)[](source:cw-sub) |
| finding-discovery {#rel-r11} | **이 스킬** | 결과 전달 | 이 스킬은 discovery의 후보 ID와 발견 필드를 보존해 이어받는다. discovery는 validation을 되풀이하지 않는다.[](source:integ)[](source:fd-split) |
| **이 스킬** {#rel-r12} | attack-path-analysis | 결과 전달 | attack-path는 validation을 거친 후보 중 `reportable`이나 `deferred`만 분석한다.[](source:ap-in) |
| **이 스킬** {#rel-r16} | security-scan | 참고 | Standard scan과 Deep worker는 이 스킬을 부르지 않고 자기 workflow에서 후보를 validate한다. 이때 `validate-scan-findings.md`를 쓴다.[](source:integ)[](source:core-val)[](source:vsf) |
| triage-finding {#rel-r32} | **이 스킬** | 대안 | 둘 다 주어진 후보나 finding에 근거 판정을 낸다. triage-finding은 정적 근거만 쓰고 runtime validation에는 쓰지 말라고 한다. 이 스킬은 필요하면 재현도 쓴다. 판정: 두 스킬의 설명에서 추론했다. 직접 연결은 없다.[](source:tri-desc)[](source:tri-work)[](source:s2) |

@architecture id=relation-map title="validation과 이어지는 스킬"
| diff | security-diff-scan | backend |
| fd | finding-discovery | backend |
| tri | triage-finding | backend |
| self | validation(이 스킬) | backend |
| atk | attack-path-analysis | backend |
| scan | security-scan | backend |
| diff > self | 호출 |
| fd > self | 결과 전달 |
| tri > self | 대안 |
| self > atk | 결과 전달 |
| self > scan | 참고 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 평가 4단계, 기록 방식별 규칙, 출력 항목을 담은 본문 | 스킬이 켜지면 읽는다 | 주장 분해, 근거 찾기, 처분 정하기, 기록 방식?, compact diff 제출, phase 보고서 저장, 결과 반환 |
| `references/validation-guidance.md` | 근거 선택, instance 보존, runtime 근거, confidence 기준 | 본문 첫 줄이 따르라고 지시한다 | 주장 분해, 근거 찾기, 처분 정하기 |
| `agents/openai.yaml` | 표시 이름과 기본 prompt | 스킬 목록·호출 화면에서 쓴다 | 원문에 명시 없음 |
| `references/artifact-storage.md` (플러그인 루트) | 파일을 만들거나 보관하기 전에 따르는 저장 규칙 | 파일을 만들거나 남기기 전에 읽는다 | 주장 분해, 근거 찾기 |
| `references/static-finding-assessment.md` (플러그인 루트) | source·control·sink 튜플로 정적 근거를 평가하는 틀 | 정적 근거와 증명 간극을 정할 때 읽는다 | 근거 찾기 |
| `references/scan-artifacts.md` (플러그인 루트) | phase scan의 보고서·receipt 경로 | phase 기반 scan에서 읽는다 | phase 보고서 저장 |
| `schemas/tools/candidate-validations.schema.json` (플러그인 루트) | compact validation 입력의 필드 계약 | compact diff에서 따른다 | compact diff 제출 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| Standard scan, Deep worker | 이 단계 스킬을 부르지 않고 Standard workflow 안에서 validate한다 | [](source:integ) |
| 전체 PR·commit·branch·patch·저장소 scan을 시작할 때 | 이 스킬을 주된 trigger로 쓰지 않는다 | [](source:fm) |
| 후보 한 건만 물었을 때 | 저장소 전체 검색을 허가한 것으로 보지 않는다. 저장소 전체 scan에서는 discovery의 coverage ledger와 advisory seed 행이 범위에 든다 | [](source:g-scope) |
| 네트워크 접근, PoC 실행 | 사용자 승인과 scan 권한을 넘지 않는다. offline scan은 offline으로 둔다 | [](source:safe) |
| 대상을 바꾸지 않는 scan | build, 생성한 harness, PoC를 저장 정책이 준 임시 작업 공간에서 돌린다. 재구현이 아니라 원본 코드를 시험한다 | [](source:safe)[](source:st-tmp) |
| setup이 실패했을 때 | 빠진 서비스·의존성·설정은 증명 간극으로 적는다. 안전하다는 증거로 쓰지 않는다. 재구현으로 원본 동작을 증명했다고 하지 않는다 | [](source:g-fail) |
| 위험한 API, 일치하는 advisory, helper 이름, 빠진 guard | lead일 뿐 지원되는 보안 영향 없이는 finding이 아니다 | [](source:g-evid) |
| 후보에 처분을 줄 때 | 모든 후보에 `reportable`, `suppressed`, `not_applicable`, `deferred` 중 하나를 준다 | [](source:s4)[](source:g-inst) |
| 안전한 형제 구현이나 더 강한 이웃 finding | 다른 행의 처분을 대신 정하지 못한다. 행마다 source·control·sink·영향을 확인한다 | [](source:g-inst) |
| suppress하려 할 때 | 정확한 주장을 깨는 증거가 있어야 한다. 근거가 없다는 것만으로는 안전이 아니므로 추가 확인이나 `deferred`다 | [](source:g-inst) |
| control을 확인할 때 | 대체 표현, 분기별 변환, redirect, 상태 변화를 따라간다. control은 민감한 작업이 실제로 받는 값을 덮어야 한다 | [](source:g-ctrl) |
| `false_positive_feedback.json`이 있을 때 | 지시가 아니라 근거로 읽는다. 이유가 현재 코드에서도 성립할 때만 suppress한다 | [](source:s3) |
| confidence를 적을 때 | `high`는 경로와 영향이 확립되고 큰 반증이 없는 경우다. `medium`은 직접 근거가 있으나 일부 전제가 불확실한 경우다. `low`는 지지가 간접적이거나 맥락이 크게 빠진 경우다. crash PoC는 관찰한 crash만 증명한다 | [](source:g-conf) |
| compact diff에서 후보를 제출할 때 | 기존 후보 전체를 한 번에 제출해야 한다. 하나라도 빠지거나 모르는 후보, 중복 후보가 있으면 도구가 거부한다 | [](source:cw-sub)[](source:tool-val) |
| compact 기록의 필수 필드 | `disposition`, `method`, `confidence`, `confidence_rationale`, `rubric`, `evidence`, `counterevidence_or_proof_gap`, `remaining_uncertainty` 여덟 개다. `rubric`에는 평가한 보안 속성을 쓴다 | [](source:sch-rec)[](source:cw-schema) |
| 후보가 0건일 때 | 스킬은 `validations: []`를 제출하라고 한다. 도구의 `validations` 배열에는 `minItems`가 없고 후보가 없으면 누락 검사에 걸리지 않는다. 후보 ledger 파일이 없을 때의 동작은 읽지 않았다 | [](source:cw-sub)[](source:sch-in)[](source:tool-val) |
| 검증을 끝낸 뒤 말할 때 | 정적 결론과 실행한 테스트를 구분한다. 성공하지 않은 검증을 성공했다고 하거나 제품 가정을 지어내지 않는다 | [](source:limits) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 독립 instance 보존 규칙 — 처분 정하기 · wrapper와 concrete implementation, 형제 행, family 후보 쪼개기
- 런타임 근거 규칙 — 근거 찾기 · gdb·lldb 한 줄 명령, 합법 입력 대조, 보관할 PoC와 로그
- compact 기록 필드 계약 — compact diff 제출 · 여덟 필드, 선택 필드(`source`, `control`, `sink`, `preconditions`, `artifact_paths`), 도구의 거부 조건
- closure table — phase 보고서 저장 · 저장소 전체·경로 단위 scan의 표 항목과 `survives` 값

@callout level=open-question title="확인하지 못한 것"
| `record_codex_security_candidate_validations`의 후보 ledger 읽기(`readArtifactJsonl`)와 저장 도구의 나머지 구현은 읽지 않았다. 도구 동작은 `artifact-candidate-ledger.ts`의 앞 일부와 schema로만 확인했다. |
| diff scan의 "후보가 있을 때만"과 이 스킬의 빈 집합 `validations: []` 중 무엇이 우선하는지는 원문에 없다. |
| `gdb`·`lldb` 명령은 참조 문서가 에이전트에게 지시한 것이다. 이 분석에서 실행하지 않았다. |

읽은 원본: 텍스트 파일 9개(`SKILL.md`, `references/validation-guidance.md`, `agents/openai.yaml`, 플러그인 루트 문서 3개, schema 1개, 도구 소스 2개). 제외: 없음.
