# validation은 후보 보안 finding을 어떻게 따져 처분하나? {#validation-page}

`validation`은 보안 scan이 내놓은 후보(candidate)가 정말 취약점인지 근거로 따져, 후보마다 `reportable`, `suppressed`, `not_applicable`, `deferred` 중 하나로 처분(disposition)을 붙이는 단계 스킬이다.[](source:purpose)[](source:g-disp)

- 쓰는 때: Codex가 이미 scan의 validation 단계에 있거나, 사용자가 후보 보안 finding이 유효한지 판단해 달라고 직접 요청할 때다. PR, commit, branch, patch, 저장소 전체 scan을 시작하는 1차 트리거로는 쓰지 않는다.[](source:fm)
- 내놓는 것: 후보마다 처분, 정확한 위치, 관측한 증거, 반증 또는 증명 간극(proof gap), 확신도와 그 이유다. compact diff scan이면 처분과 근거를 도구 호출 한 번에 담아 제출한다.[](source:out)[](source:wb-submit)
- 하지 않는 것: 설정이나 배포 증거가 없다는 이유로 후보를 안전하다고 하지 않는다. 사용자 승인과 활성 scan 권한을 넘어 네트워크에 접근하거나 PoC를 실행하지도 않는다.[](source:out-static)[](source:safe)
- 부르지 않는 경우: Standard scan과 Deep Scan worker는 자기 workflow 안에서 validation을 직접 하고 이 스킬을 호출하지 않는다.[](source:integ)

@answer scope="로컬 원본 분석 · 스킬·도구·스크립트 실행 없음 · 사람 검토 미실시"
@meta locale=ko
@source fm title="frontmatter와 description" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=1:4
@source purpose title="목적과 읽을 reference" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=8:8
@source st1 title="후보 주장 분해" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=12:12
@source st2 title="근거 탐색과 방법 선택" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=13:13
@source st3 title="false positive 피드백 파일" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=14:14
@source st4 title="처분 기록" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=15:15
@source safe title="승인과 실행 제한" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=17:17
@source integ title="scan 통합과 Standard·Deep 제외" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=21:21
@source wb-list title="후보 읽기" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=27:27
@source wb-submit title="처분 한 번에 제출" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=28:28
@source wb-schema title="schema와 rubric" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=29:29
@source wb-nested title="중첩 기록이 전체 출력" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=30:30
@source phase title="다른 phase-based scan 저장" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=34:34
@source closure title="closure table" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=36:36
@source out title="출력 항목" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=38:47
@source out-static title="정적 결론과 실행 구분" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=49:49
@source yaml title="표시 이름과 기본 prompt" path=codex-security/plugins/codex-security/skills/validation/agents/openai.yaml lines=1:4
@source g-scope title="근거와 범위" path=codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md lines=5:7
@source g-method title="방법 선택과 setup 실패" path=codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md lines=9:11
@source g-disp title="처분과 인스턴스 보존" path=codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md lines=13:21
@source g-rt title="runtime 증거" path=codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md lines=25:27
@source g-conf title="확신도" path=codex-security/plugins/codex-security/skills/validation/references/validation-guidance.md lines=31:37
@source sfa-tuple title="평가 tuple" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=3:21
@source sfa-order title="증거 탐색 순서" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=23:37
@source sfa-surface title="경계와 표면 점검" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=39:50
@source sfa-conf title="정적 확신도" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=52:61
@source store9 title="구조화 결과는 기존 도구" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=9:9
@source store-save title="보조 파일 저장 방법" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=13:13
@source store-kind title="storage 종류" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=20:23
@source store-path title="저장 경로 제한" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=37:37
@source store-gen title="생성 증거와 임시 작업 공간" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=41:45
@source sa-base title="scan 기본 경로" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=15:17
@source sa-disc title="후보 기록과 ID" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=41:42
@source sa-valobj title="validation 객체 필드" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=43:43
@source sa-ledger title="기록 도구와 증거 폴더" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=45:49
@source sa-phase title="Validation 단계 경로" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=77:83
@source schema-top title="입력 구조" path=codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json lines=7:21
@source schema-disp title="처분·method·확신도 필드" path=codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json lines=39:46
@source schema-rubric title="확신도 이유·rubric·evidence 필드" path=codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json lines=47:91
@source schema-gap title="반증·남은 불확실성·증거 경로 필드" path=codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json lines=92:99
@source schema-opt title="선택 필드" path=codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json lines=100:122
@source schema-req title="필수 필드와 추가 속성" path=codex-security/plugins/codex-security/schemas/tools/candidate-validations.schema.json lines=124:135
@source ledger-ctx title="scan 문맥 요구" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=32:36
@source ledger-chk title="알 수 없는·중복·빠진 후보 검사" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=39:65
@source ledger-write title="ledger에 validation 더하고 교체" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=67:77
@source ledger-atk title="attack-path 쪽 후보 검사" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=117:141
@source ledger-elig title="attack-path 대상 판정" path=codex-security/plugins/codex-security/mcp-app/src/artifact-candidate-ledger.ts lines=156:159
@source tool title="validation 도구 등록" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=137:150
@source tool-list title="후보 목록 도구 등록" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=123:135
@source tool-ctx title="scan 문맥과 모드 요구" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=353:384
@source io-miss title="ledger 파일이 없을 때 오류" path=codex-security/plugins/codex-security/mcp-app/src/artifact-io.ts lines=82:103
@source disc-write title="후보 기록은 후보 0건이어도 파일을 쓴다" path=codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts lines=56:101
@source disc-list title="후보 목록 읽기" path=codex-security/plugins/codex-security/mcp-app/src/artifact-discovery.ts lines=179:193
@source dscan title="후보가 있을 때 validation을 한 번 실행" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=30:31
@source dscan3 title="description" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=3:3
@source disc title="validation을 discovery 안에서 반복하지 않음" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=31:31
@source disc3 title="description" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=3:3
@source atk title="처분을 받는 attack-path 단계" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=33:36
@source core9 title="피드백 파일 읽기" path=codex-security/plugins/codex-security/references/core-scan.md lines=9:9
@source core15 title="Standard의 validation 7단계" path=codex-security/plugins/codex-security/references/core-scan.md lines=15:15
@source core18 title="phase 스킬을 호출하지 않음" path=codex-security/plugins/codex-security/references/core-scan.md lines=18:18
@source vsf title="Standard scan의 validation 지침" path=codex-security/plugins/codex-security/references/validate-scan-findings.md lines=3:3
@source standalone title="정적 전용 단독 validation 절차" path=codex-security/plugins/codex-security/references/standalone-validation.md lines=3:11
@source final title="compact diff 결과 매핑" path=codex-security/plugins/codex-security/references/final-report.md lines=42:49
@source scan3 title="description" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=3:3
@source scan10 title="core audit 사용" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=10:10
@source tri3 title="description" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=3:3
@source tri10 title="정적 근거 제한" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=10:10
@source readme title="validation 안내 줄" path=codex-security/plugins/codex-security/skills/README.md lines=27:27

## 후보를 받으면 에이전트는 무엇을 읽고 어떻게 판단해 처분을 내놓나? {#behavior span=12}

원문은 판단 순서를 번호 네 개(주장 식별, 근거 탐색, 피드백 대조, 처분 기록)로 적고, 그 위에 scan 경로별 제출 방식을 얹는다.[](source:st1)[](source:st2)[](source:st3)[](source:st4) 벤더 README는 이 스킬을 "의심되는 버그가 진짜인지 코드를 추적하거나 재현해서 확인한다"고 한 줄로 소개한다.[](source:readme)

아래 첫 그림은 후보 하나를 처분하는 과정이고, 후보마다 반복된다. 둘째 그림은 모인 처분을 어디에 내놓는지다.

노드마다 바로 아래 `@steps` 설명이 붙는다.

@workflow id=candidate-loop title="후보 하나를 처분하는 과정"
| take | 후보 받기 | external |
| claim | 주장 분해 | backend |
| fbq | 피드백 파일 있나? | backend |
| fb | 피드백 대조 | security |
| evid | 근거 모으기 | backend |
| runq | 재현이 필요한가? | backend |
| run | 재현 실행 | security |
| disp | 처분과 확신도 | backend |
| more | 남은 후보 있나? | backend |
| done | 처분 묶음 완성 | external |
| take > claim | |
| claim > fbq | |
| fbq > fb | 있음 |
| fbq > evid | 없음 |
| fb > evid | |
| evid > runq | |
| runq > run | 필요 |
| runq > disp | 불필요 |
| run > disp | |
| disp > more | |
| more > claim | 있음 |
| more > done | 없음 | emphasis |

@steps id=candidate-loop-steps
| a-take | 후보 받기 | 에이전트는 평가할 후보 집합을 받는다. 받는 경로는 호출 형태마다 다르다. workbench-backed `$security-diff-scan`에 `scanId`가 있으면 `list_codex_security_candidates({ scanId, cursor?, limit? })`로 후보를 전부 읽는다.[](source:wb-list) 이 도구는 후보 ledger의 실제 내용을 쪽 단위로 돌려주므로 앞 단계가 기록한 후보와 이미 붙은 필드가 그대로 보인다.[](source:disc-list) 다른 phase-based scan에서는 활성 scan workflow가 정한 경로를 쓰고, 단독 요청에서는 사용자가 넘긴 후보로 시작한다.[](source:integ) 검증 범위는 넘겨받은 주장과 후보 집합이다. 후보 한 건을 단독으로 요청받았다면 저장소 전체 검색은 허가된 것이 아니다. 반대로 저장소 전체 scan이면 discovery의 coverage ledger와 advisory 시드 행은 아직 다듬어진 finding이 아니어도 범위 안에 남는다.[](source:g-scope) 에이전트는 받은 후보의 ID와 discovery 필드를 보존한 채 다음 노드로 넘긴다.[](source:integ) | candidate-loop | take |
| a-claim | 주장 분해 | 에이전트는 후보 한 건에서 주장하는 attacker 입력, 보안 경계, 관련 통제(control), 민감한 연산, 전제 조건을 가려낸다. 정보는 넘겨받은 문맥과 저장소 증거에서 얻고, 사용자에게 묻는 것은 정보가 없으면 의미 있는 평가를 할 수 없을 때뿐이다.[](source:st1) reference는 여기에 도달 가능한 경로와 구체적 영향까지 후보마다 세우라고 덧붙인다.[](source:g-scope) 정적 근거 reference는 이 작업을 source, control, sink, reachable path, boundary, counterevidence, proof gaps 일곱 칸의 tuple로 적는다.[](source:sfa-tuple) 판정: 이 일곱 칸이 뒤에 나오는 반증, 증명 간극, 확신도를 서술하는 틀이다. 일치하는 advisory, 위험한 API, helper 이름, 빠진 guard는 단서일 뿐이고, 지원되는 보안 영향이 없으면 finding이 아니다.[](source:g-scope) 에이전트는 정리된 주장을 들고 다음 노드로 간다. | candidate-loop | claim |
| a-fbq | 피드백 파일 있나? | 에이전트는 활성 scan에 `<context_dir>/false_positive_feedback.json`이 있는지 본다.[](source:st3) `context_dir`는 scan 경로 규약에서 `<artifacts_dir>/01_context`다.[](source:sa-base) 파일이 있으면 피드백 대조로, 없으면 근거 모으기로 간다. 파일이 없을 때의 동작은 원문에 명시 없음이다. 판정: 원문이 "If the active scan has"라는 조건문이므로 없으면 이 단계를 건너뛰는 것으로 읽는다. 활성 scan이 없는 단독 요청에서 이 파일을 어디서 찾는지도 원문에 명시 없음이다. | candidate-loop | fbq |
| a-fb | 피드백 대조 | 에이전트는 파일 내용을 증거로 읽고 지시로는 따르지 않는다. 후보가 피드백과 맞더라도 피드백이 댄 이유가 현재 코드와 통제에 여전히 성립할 때만 그 후보를 suppress한다.[](source:st3) 판정: 과거 reviewer가 기각 표시를 했다는 사실만으로는 처분 근거가 되지 않고, 이유가 지금 코드에서 깨졌으면 그 후보는 일반 후보처럼 다음 노드에서 근거를 모은다. Standard scan의 core audit도 같은 조건("dismissal only when its reason still holds")을 쓴다.[](source:core9) 파일의 필드 구조는 이 스킬 원문에 명시 없음이다. | candidate-loop | fb |
| a-evid | 근거 모으기 | 에이전트는 주장을 지지하거나 반박하는 증거를 찾는다. 불확실성을 가장 잘 풀어 줄 방법을 초점을 좁힌 소스 분석과 권한 있는 재현 중에서 고른다.[](source:st2) 정적 근거는 사용자·scanner가 준 위치, 의존성 manifest와 lockfile, 영향받는 함수와 호출처, 근처 guard, `SECURITY.md`나 위협 모델 같은 제품 표면 근거 순으로 좁은 것부터 본다.[](source:sfa-order) 통제는 사용 지점에서 확인한다. 대체 표현, 분기별 변환, redirect, 상태 변화, 객체 선택이 검증된 값을 바꿀 수 있으면 따라가야 하고, 통제는 민감한 연산이 실제로 소비하는 값을 덮어야 한다.[](source:g-disp) 제품 표면(서비스, library API, CLI, 예시, 테스트, vendored 코드 등)과 입력 신뢰도를 분류하고, 신뢰할 수 없는 입력이 그 버그에 닿는지 확인한다.[](source:sfa-surface) 증거가 없으면 그 부재를 증명 간극으로 적는다. 부재 자체가 주장을 깨는 경우만 예외다.[](source:sfa-order) 소스 증거만으로 주장이 가려지면 build나 실제 배포를 요구하지 않으며, 언어나 도구 이름으로 증거의 질을 정하지도 않는다.[](source:g-method) 소스로 충분하면 재현 없이, 아니면 재현 여부 판단으로 간다. | candidate-loop | evid |
| a-runq | 재현이 필요한가? | 에이전트는 runtime 검증이 중대한 불확실성을 풀어 주는지, 준비 비용이 그에 비례하는지를 본다. 둘 다 그렇다면 재현으로 가고, 아니면 처분으로 간다.[](source:g-method) 가능하고 비례적이면 runtime 검사를 쓰라는 문장이 SKILL.md에도 있다.[](source:st2) 재현을 몇 번 시도하라거나 어떤 경우 반드시 하라는 기준은 원문에 명시 없음이다. 재현할 수 없다는 사실이 후보를 안전하게 만들지 않는다는 점은 아래 노드에서 다시 나온다. | candidate-loop | runq |
| a-run | 재현 실행 | 재현은 사용자 승인과 활성 scan 권한 안에서만 한다. 네트워크 접근과 PoC 실행 모두 해당하고, 오프라인 scan은 계속 오프라인이다.[](source:safe) 대상을 바꾸지 않는 scan이면 build, 생성한 harness, PoC를 storage policy가 주는 disposable workspace에서 돌린다. 먼저 `temporary` storage를 준비하고, 그 안에서만 build·test·생성 명령을 실행하며, PoC 소스와 입력은 저장 도구로 쓴다.[](source:store-gen) 에이전트는 별도 재구현보다 원본 코드를 시험하는 쪽을 택한다. 재구현으로 원본 동작을 증명했다고 주장해서는 안 된다.[](source:safe)[](source:g-method) setup이 실패하면 targeted harness, 기존 test, 원본을 돌리는 disposable build 복사본이 가능한지 찾고, 빠진 서비스·의존성·설정은 안전의 증거가 아니라 증명 간극으로 기록한다. 명령이 아직 진행 중일 수 있으면 멈추기 전에 로그나 프로세스 상태를 본다.[](source:g-method) 명령은 짧고 비대화형이며 주장 범위로 좁힌다. gdb는 `-q -batch -ex run -ex bt -ex quit`, lldb는 `-b -o run -o bt -o quit`가 예로 적혀 있고, 정상 입력을 대조군으로 쓰면 취약점과 일반 실패를 가를 수 있다.[](source:g-rt) 쓸모 있는 PoC, 입력, 로그만 남기고 재현에 필요한 명령과 전제를 적는다. 실행하지 않은 것을 실행했다고 쓰지 않는다.[](source:g-rt) 에이전트는 관측 결과와 실제 실행한 명령을 처분 노드로 넘긴다. | candidate-loop | run |
| a-disp | 처분과 확신도 | 에이전트는 모든 후보에 처분 하나를 붙이고 정확한 위치, 관측한 증거, 반증이나 증명 간극, 확신도를 함께 기록한다. 독립적으로 취약한 인스턴스와 공급받은 범위는 보존한다.[](source:st4) suppress는 정확히 그 주장을 깨는 증거가 있을 때 한다. 호출자, 배포, 출처 증거가 없으면 초점을 좁힌 후속 조사나 `deferred`가 맞고, 부재만으로 안전이 성립하지는 않는다.[](source:g-disp) 대표 재현 하나가 관련 인스턴스를 뒷받침할 수는 있지만, 인스턴스마다 source, control, sink, 영향을 따로 확인한다. 안전한 형제 인스턴스나 더 강한 이웃 finding이 다른 행을 대신 결정하지 않는다. wrapper는 도달 가능성을 보여 줄 뿐이므로 취약점을 일으키는 구체 구현이나 공유 통제를 따로 주소 지정이 가능하게 남기고, 한 후보에 그런 인스턴스가 여럿이면 개별 처분을 적는다.[](source:g-disp) 확신도는 도달 가능성, 침해된 경계, 영향, 반증까지 포함한 finding 전체에 대해 `high`, `medium`, `low` 중 하나로 매긴다. crash를 일으킨 PoC는 관측한 crash만 증명하고 주장한 모든 결과를 증명하지는 않는다.[](source:g-conf) 설명용 예시(입력은 지어낸 것이다): 후보가 업로드 파일명이 `open()`으로 가는 path traversal이라고 주장하고, 검증 함수가 `..`를 막지만 `open()`에 가는 값은 검증 뒤에 한 번 더 디코딩된 문자열이라고 하자. 통제가 민감한 연산이 소비하는 값을 덮지 못하므로 그 검증 함수는 정확한 주장을 깨는 반증이 아니다.[](source:g-disp) 디코딩 뒤 값이 막히지 않는다는 근거를 소스에서 확인했다면 `reportable` 쪽으로, 호출자나 배포 설정을 알 수 없어 도달 가능성이 열려 있다면 `deferred` 쪽으로 기운다. 이 갈림은 조건문이고 관측한 사실이 아니다. | candidate-loop | disp |
| a-more | 남은 후보 있나? | 처분이 없는 후보가 남아 있으면 주장 분해로 돌아간다. 모든 후보에 처분을 기록해야 하기 때문이다.[](source:st4) 한 인스턴스에서 더 일해도 처분이나 심각도가 바뀌지 않을 때는 거기서 멈추고 남은 후보 집합으로 간다.[](source:g-disp) 후보를 한 건씩 순서대로 처리하라는 지시, 반복 횟수와 시간의 상한은 원문에 명시 없음이다. 판정: 그림의 반복은 "모든 후보에 처분을 기록한다"를 풀어 그린 것이다. 후보 우선순위는 지원되는 영향, 도달 가능성, 해소되지 않은 불확실성으로 정한다.[](source:g-disp) | candidate-loop | more |
| a-done | 처분 묶음 완성 | 모든 후보가 처분과 근거를 갖춘 상태다. 에이전트는 이 묶음을 호출 형태에 맞는 곳에 내놓는다. 어디에 내놓는지는 다음 그림이 보여 준다. 이 노드 앞에서 사람에게 승인을 받으라는 지시는 원문에 명시 없음이다. 사용자 승인은 네트워크 접근과 PoC 실행에만 걸려 있다.[](source:safe) | candidate-loop | done |

그림은 후보 하나의 핵심 경로만 그렸다. 생략한 것은 세 가지다.

승인·권한 제한은 재현 실행 설명에, 인스턴스 보존 규칙은 처분과 확신도 설명에, Standard·Deep scan이 이 스킬을 거치지 않는다는 사실은 '이 스킬은 scan 흐름의 어디에 끼나?' 패널에 있다. 후보가 0건일 때의 동작은 원문끼리 충돌하므로 마지막 감사 패널에 따로 적었다.

@workflow id=submit-paths title="처분 묶음을 내놓는 곳"
| bundle | 처분 묶음 도착 | external |
| path | 어느 경로인가? | backend |
| tool | 도구로 한 번에 제출 | backend |
| files | 보고서와 receipt 저장 | backend |
| answer | 후보별 평가 반환 | frontend |
| bundle > path | |
| path > tool | workbench diff | emphasis |
| path > files | 다른 phase scan | |
| path > answer | 단독 요청 | |

@steps id=submit-paths-steps
| b-bundle | 처분 묶음 도착 | 에이전트는 후보마다 처분, 위치, 증거, 반증 또는 증명 간극, 확신도를 갖고 있다. 이 노드는 내용이 아니라 내놓는 형태를 정하는 자리다. 형태는 호출 경로가 정하고, 원문은 경로를 세 갈래로 나눠 적는다.[](source:wb-submit)[](source:phase)[](source:out) | submit-paths | bundle |
| b-path | 어느 경로인가? | 에이전트는 세 경로 중 어느 것인지 가른다. 첫째는 `scanId`가 있는 workbench-backed `$security-diff-scan`, 둘째는 활성 scan workflow가 경로를 정한 다른 phase-based scan, 셋째는 단독 요청이다.[](source:wb-submit)[](source:phase)[](source:out) Standard scan과 Deep Scan worker는 이 갈림에 오지 않는다. 그들은 이 스킬을 호출하지 않기 때문이다.[](source:integ) 어떤 신호로 경로를 판단하는지는 `scanId` 유무 외에는 원문에 명시 없음이다. | submit-paths | path |
| b-tool | 도구로 한 번에 제출 | 에이전트는 `record_codex_security_candidate_validations({ scanId, validations: [{ candidateId, validation }] })`를 한 번 호출해 모든 처분을 제출한다. 후보가 없으면 `validations: []`도 제출한다.[](source:wb-submit) 각 `validation` 객체에는 schema가 필수로 정한 여덟 필드(`disposition`, `method`, `confidence`, `confidence_rationale`, `rubric`, `evidence`, `counterevidence_or_proof_gap`, `remaining_uncertainty`)가 들어가고, `rubric` 칸에 평가한 보안 속성을 적는다.[](source:schema-req)[](source:wb-schema) 도구는 알 수 없는 후보, 중복 후보, 빠진 후보를 거부한다. 빠진 경우 오류 문구는 "Validation must include every existing candidate"이다.[](source:ledger-chk) 이 도구는 실행 중인 scan에 묶인 문맥에서만 동작하고 Deep 또는 diff scan만 받는다.[](source:tool-ctx)[](source:ledger-ctx) 검사를 통과하면 도구가 후보 행마다 `validation` 객체를 더해 ledger를 통째로 교체하고, 기존 discovery 필드와 후보 순서를 보존한다.[](source:ledger-write)[](source:wb-submit) 이렇게 기록한 중첩 객체가 이 phase의 전체 출력이다. 에이전트는 중복 보고서, receipt, closure table, 수작업 ledger를 만들지 않는다. 실제 PoC, 입력, 로그가 있을 때만 `<discovery_dir>/validation_artifacts/<candidate_id>/`를 만들어 record에서 참조한다.[](source:wb-nested)[](source:sa-ledger) 도구가 거부했을 때 에이전트가 무엇을 할지는 원문에 명시 없음이다. 판정: 오류 문구가 빠진 후보 ID를 알려 주므로 빠진 후보를 보충해 같은 호출을 다시 하는 것이 자연스럽지만 원문 지시는 아니다.[](source:ledger-chk) | submit-paths | tool |
| b-files | 보고서와 receipt 저장 | 에이전트는 후보별 validation report를 저장하고 validation receipt를 기록한다. 경로는 활성 scan workflow가 정한 것을 쓰고, receipt에는 method, 증거 또는 정확한 증명 간극, 처분, artifact나 report 참조를 적는다. 보관한 receipt를 고칠 때는 공유 storage policy를 따른다.[](source:phase) standalone이나 legacy diff에서 쓸 수 있는 경로로 scan 규약은 `<findings_dir>/validation_summary.md`, `<findings_dir>/<candidate_id>/validation_report.md`, `<findings_dir>/<candidate_id>/validation_artifacts/`를 든다.[](source:sa-phase) 저장소 전체나 경로 범위 phase scan이면 후보 또는 ledger 행 ID, 인스턴스 키, 가능하면 source 참조와 seed anchor, root-control 위치, entrypoint와 source, sink와 control, 처분, 반증 또는 증명 간극, 그리고 `survives` 값(yes, no, uncertain 중 하나)을 담은 closure table을 남긴다. 결정을 터미널 로그나 임시 메모에만 남기면 안 된다.[](source:closure) 파일은 `save_codex_security_artifact`로 쓰고 shell redirection, `apply_patch`, Python 같은 일반 파일 쓰기는 쓰지 않는다. 경로는 `artifacts/`, `findings/`, `hardening/` 아래 상대 경로다.[](source:store-save)[](source:store-path) | submit-paths | files |
| b-answer | 후보별 평가 반환 | 단독 요청이면 호출자가 result schema를 줬을 때 그것을 따르고, 아니면 후보마다 간결한 평가를 돌려준다.[](source:out) 평가에는 식별자와 제목, 위치(root-control과 서로 다른 seed anchor 포함), 처분과 평가한 보안 속성, 방법과 실제 실행한 명령과 관측 결과, 증거·반증·증명 간극·확신도와 그 이유, 남은 불확실성과 다음 단계, 보관한 증거 경로가 들어간다.[](source:out) 정적 결론과 실제로 실행한 test를 구분해 적는다. 설정이나 배포 증거가 없다는 것은 한계이고 후보가 안전하다는 증거가 아니다. 제품에 대한 가정을 지어내지 않고, 검증이 성공하지 않았는데 성공한 것처럼 쓰지 않는다.[](source:out-static) 단독 요청에서 파일을 남길지는 원문에 명시 없음이다. 파일을 만들거나 보관하기 전에는 storage policy를 읽는다.[](source:purpose) | submit-paths | answer |

둘째 그림은 세 경로의 제출 방식만 그렸다. 후보가 없을 때 이 스킬을 부르는지, 빈 배열이 통과하는지는 감사 패널의 미확인 항목에 있다.

## 이 스킬은 scan 흐름의 어디에 끼나? {#flow-position span=12}

compact diff scan에서 `security-diff-scan`이 이 스킬을 부르고, 앞에는 `finding-discovery`가, 뒤에는 `attack-path-analysis`가 있다. 전체 diff scan 흐름은 묶음 페이지 `codex-security/_group-scan-vulnerabilities/scan-vulnerabilities.html`에 있다. 아래 그림은 이 스킬 앞뒤만 그린다.

@workflow id=position-flow title="validation의 앞과 뒤"
| dscan | security-diff-scan | backend |
| fd | finding-discovery | backend |
| val | validation | backend |
| ap | attack-path-analysis | backend |
| dscan > val | 내부 위임 R08 | emphasis |
| fd > val | 산출물 호환 R11 | |
| val > ap | 산출물 호환 R12 | emphasis |

@steps id=position-steps
| c-dscan | security-diff-scan | 후보가 있으면 `$validation`을 한 번 실행하고, 그다음 `$attack-path-analysis`를 `reportable` 또는 `deferred` 후보에만 한 번 실행한다.[](source:dscan)[](source:atk) 후보가 없을 때를 이 문장이 어떻게 다루는지는 감사 패널에 있다. | position-flow | dscan |
| c-fd | finding-discovery | 후보를 기록하는 앞 단계다. 이 스킬은 후보 ID와 discovery 필드를 보존해 이어받는다.[](source:integ) discovery 안에서 validation을 반복하지 않는다는 말이 discovery 쪽에 있다.[](source:disc) | position-flow | fd |
| c-val | validation | 이 페이지의 대상이다. 받는 것은 후보 전체이고 넘기는 것은 후보마다 붙은 처분이다.[](source:wb-list)[](source:wb-submit) | position-flow | val |
| c-ap | attack-path-analysis | 이 스킬이 처분한 후보 중 `reportable`과 `deferred`만 분석한다. 후보 ID와 기존 필드를 보존하고, 대상 후보가 없으면 `attackPaths: []`를 제출한다.[](source:atk) | position-flow | ap |

| 관계 | 받는 것 | 넘기는 것 | 조건과 경계 |
|---|---|---|---|
| R08 내부 위임 | `security-diff-scan`이 부른 시점의 후보 전체 | `record_codex_security_candidate_validations`로 제출한 처분 전체 | diff scan 원문은 후보가 있을 때만 실행하라고 하고, validation 원문은 빈 집합에도 `validations: []`를 제출하라고 한다. 우선순위는 원문에 명시 없음이다.[](source:dscan)[](source:wb-submit) |
| R11 산출물 호환 | discovery가 기록한 후보와 필드 | 같은 후보에 `validation` 객체를 더한 행 | compact diff에서는 기록 도구가 후보 ID를 결정론적으로 붙이고 같은 CWE id, 위치, 인스턴스 행을 합친다.[](source:sa-disc) 필수 순서는 diff scan이 정한다.[](source:dscan) |
| R12 산출물 호환 | 처분이 붙은 후보 | `attack_path` 객체가 더해질 후보 | 도구가 `reportable` 또는 `deferred` 검증이 있는 후보만 받고, 해당 후보가 하나라도 빠지면 거부한다.[](source:ledger-atk)[](source:ledger-elig) |
| R16 참고 | 없음 | 없음 | Standard와 Deep worker는 이 스킬을 부르지 않는다. `core-scan.md`는 별도 phase 스킬을 호출하지 말고 한 audit 안에서 하라고 하고,[](source:core18) 각 후보는 `validate-scan-findings.md`로 검증한다.[](source:core15) 이 문서는 "source-backed counterevidence"로만 기각하고 실제 배포 증명이나 runtime 재현을 요구하지 않는다.[](source:vsf) 이 스킬은 필요하면 재현을 쓰므로 둘의 규칙이 다르다. |
| R74 공유 상태 | `candidate_ledger.jsonl` | 같은 파일 | discovery가 후보를 쓰고, 이 스킬이 모든 행에 `validation`을 더하고, attack-path가 해당 행에 `attack_path`를 더한다. 도구가 후보 순서와 기존 필드를 보존한다.[](source:sa-ledger)[](source:ledger-write) |

compact diff 결과는 이후 최종 보고로 이렇게 옮겨진다. validation과 attack-path가 모두 `reportable`이면 finding이다.

어느 phase든 `deferred`이면 `needs_follow_up` surface와 증명 간극이 붙은 deferred work다. validation `not_applicable`은 `not_applicable` coverage이고, validation `suppressed`나 attack-path `ignore`는 `rejected` coverage다.

필수 phase record가 빠지면 그 후보는 해소되지 않은 채로 남는다.[](source:final)

## 처분, 확신도, 제출 필드는 무엇이고 무엇을 강제하나? {#rules span=12}

아래는 찾아보는 용도의 규칙표다. 동작 순서는 위 패널을 본다.

| 규칙 | 내용 |
|---|---|
| 처분 4종 | 후보마다 `reportable`, `suppressed`, `not_applicable`, `deferred` 중 하나를 붙인다. 후보 식별자, source 참조, 위치(root control과 서로 다른 seed anchor 포함)를 보존한다.[](source:g-disp) |
| 후보 전부 | 공급받은 후보 하나도 처분 없이 두지 않는다.[](source:st4) 도구는 빠진 후보를 거부한다.[](source:ledger-chk) |
| 안전하다고 보지 않는 경우 | 호출자, 배포, 출처 증거가 없는 것은 한계이고 증명 간극이다. 부재만으로 안전이 성립하지 않는다.[](source:g-disp)[](source:out-static) |
| suppress 조건 | 정확히 그 주장을 깨는 증거가 있을 때만 suppress한다.[](source:g-disp) 피드백 파일은 증거이며, 이유가 현재 코드와 통제에 여전히 성립할 때만 쓴다.[](source:st3) |
| 인스턴스 분리 | 독립적으로 발동하는 연산과 깨진 통제는 따로 주소 지정이 가능하게 둔다.[](source:g-disp) |
| 승인과 권한 | 네트워크 접근과 PoC 실행은 사용자 승인과 활성 scan 권한을 넘지 않는다.[](source:safe) |
| 재구현 금지 | 대상을 재구현으로 바꿔 놓고 그것이 원본 동작을 증명한다고 주장하지 않는다.[](source:g-method) |
| 실행 주장 | 실행하지 않은 것을 실행했다고 쓰지 않는다. 정적 결론과 실제 test를 구분한다.[](source:g-rt)[](source:out-static) |
| 산출물 중복 금지 | compact diff scan에서는 중복 보고서, receipt, closure table, 수작업 ledger를 만들지 않는다.[](source:wb-nested) |
| 파일 저장 | 보관 파일은 저장 도구로만 쓰고, 도구가 만든 구조화 결과를 보조 파일 도구로 대체하지 않는다.[](source:store-save)[](source:store9) |

처분 네 가지의 뜻은 이 스킬 안에서 부분적으로만 정의된다. `suppressed`는 정확한 주장을 깨는 증거가 있을 때이고, `deferred`는 호출자, 배포, 출처 증거 부재가 후속 조사나 보류를 정당화할 때다.[](source:g-disp)

`reportable`과 `not_applicable`의 정의는 SKILL.md와 reference에 명시 없음이다. 같은 plugin의 `standalone-validation.md`는 네 값을 정의하지만 이 스킬이 그 파일을 지목하지 않으므로 이 스킬의 규칙으로 보지 않고 참고로만 적는다.

그 파일은 `reportable`을 소스가 뒷받침하는 취약점, `suppressed`를 구체적 반증이 주장을 깨는 경우, `not_applicable`을 주장이 공급받은 대상에 적용되지 않는 경우, `deferred`를 중대한 증명 간극 때문에 결론을 못 내리는 경우라고 쓴다.[](source:standalone)

| 확신도 | 뜻 |
|---|---|
| `high` | 관련 경로와 보안 영향이 성립하고 해소되지 않은 중대한 반증이 없다.[](source:g-conf) |
| `medium` | 직접 증거가 주장을 뒷받침하지만 중대한 전제나 경로 일부가 불확실하다.[](source:g-conf) |
| `low` | 지지가 간접적이거나 중요한 문맥이 빠져 있다.[](source:g-conf) |

정적 근거가 전체 주장을 성립시키면 정적 증거만으로도 `high`가 될 수 있다.[](source:g-conf) 정적 근거 reference의 `high`, `medium`, `low`도 같은 방향으로 적혀 있고, 증명 간극을 환경·정책·배포 사실로 채워 넣지 않는다고 덧붙인다.[](source:sfa-conf)

compact diff 제출 객체의 필드는 schema가 정한다. 필수 여덟 개는 `disposition`, `method`, `confidence`,[](source:schema-disp) `confidence_rationale`, `rubric`, `evidence`,[](source:schema-rubric) `counterevidence_or_proof_gap`, `remaining_uncertainty`다.[](source:schema-gap)

`rubric`은 문자열, 객체, 비어 있지 않은 배열 중 하나이고 `evidence`는 문자열이거나 비어 있지 않은 문자열 배열이다.[](source:schema-rubric) `artifact_paths`는 선택 필드이고,[](source:sa-valobj) `source`, `control`, `sink`, `preconditions`도 선택이며 scan 규약은 discovery 필드를 보완하거나 다를 때만 더하라고 한다.[](source:schema-opt)[](source:sa-valobj)

`additionalProperties`가 허용이라 위 목록 밖 필드도 schema를 통과한다.[](source:schema-req)

@facts id=validation-numbers
| 처분 종류 | 4개: `reportable`, `suppressed`, `not_applicable`, `deferred`[](source:schema-disp) |
| 확신도 단계 | 3개: `high`, `medium`, `low`[](source:schema-disp) |
| 필수 필드 | 8개[](source:schema-req) |
| 도구 호출 횟수 | 후보 전체를 한 번에 제출한다[](source:wb-submit) |

## 언제 이 스킬을 쓰고 언제 쓰면 안 되나? {#fit span=12}

| 상황 | 이 스킬 | 근거와 대안 |
|---|---|---|
| scan이 이미 validation 단계에 있다 | {good:쓴다} | 해당 호출 조건이다.[](source:fm) |
| 사용자가 후보 보안 finding 하나 이상이 유효한지 판단해 달라고 직접 요청한다 | {good:쓴다} | 해당 호출 조건이다.[](source:fm) |
| PR, commit, branch, patch를 통째로 scan한다 | {bad:1차 트리거로 쓰지 않는다} | description이 금지한다.[](source:fm) `security-diff-scan`의 description이 이 일을 맡는다.[](source:dscan3) |
| 저장소 전체나 선택한 경로를 scan한다 | {bad:1차 트리거로 쓰지 않는다} | description이 금지한다.[](source:fm) `security-scan`이 기본 단일 pass audit이다.[](source:scan3) |
| Standard scan이나 Deep Scan worker 안에서 후보를 검증한다 | {bad:이 스킬을 호출하지 않는다} | 이들은 자기 workflow 안에서 한다.[](source:integ) |
| scanner 보고서나 ticket처럼 외부에서 온 finding을 정적 근거로만 분류한다 | {caution:이 스킬이 아니다} | `triage-finding`의 영역이다. 이 스킬은 필요하면 재현도 쓰고, `triage-finding`은 test, build, PoC, 동적 검증을 쓰지 않는다.[](source:tri10) 판정: 두 스킬이 `static-finding-assessment.md`를 공유하는 같은 계열이다.[](source:sfa-tuple)[](source:tri3) |
| 후보 자체를 찾아야 한다 | {bad:이 스킬이 아니다} | 후보 발견은 `finding-discovery`의 description이 맡는 일이고, 이 스킬은 공급받은 후보 집합이 범위다.[](source:disc3)[](source:g-scope) |
| 단독 요청으로 후보 한 건을 받았는데 저장소 전체를 뒤져야 할 것 같다 | {caution:범위를 넓히지 않는다} | 단독 요청은 저장소 전체 검색을 허가하지 않는다.[](source:g-scope) |

호출 제한 필드는 SKILL.md frontmatter에 `name`과 `description`뿐이고, `agents/openai.yaml`에도 호출 제한을 두는 필드가 없다. 아래가 원문 그대로다.[](source:fm)[](source:yaml) description은 모델이 판단할 때 참고하는 설명이지 이 단어가 있으면 켜진다는 사전이 아니다.

@code source=fm language=yaml

@code source=yaml language=yaml

## 어디까지 확인했고 무엇이 남았나? {#audit span=12}

이 페이지는 스킬 폴더의 텍스트 파일 3개와, 스킬과 required-refs 목록이 가리키는 plugin 참조 파일·schema·도구 구현, 이웃 스킬 몇 줄을 읽기 전용으로 읽고 썼다. 스킬 폴더의 파일은 `SKILL.md`, `agents/openai.yaml`, `references/validation-guidance.md`로 전부이고 전부 읽었다. 번역본, 바이너리, 제외한 파일은 없다.

스킬·도구·스크립트는 실행하지 않았고 외부 URL은 열지 않았다. 읽은 텍스트 파일은 21개다. 아래 표는 파일당 한 번 바이트 수와 읽은 범위를 적는다.

필수 자료는 모두 읽었으므로 부분 분석이 아니다.

| 파일 | 바이트 | 읽은 범위 |
|---|---|---|
| `skills/validation/SKILL.md` | 4619 | 전체 |
| `skills/validation/references/validation-guidance.md` | 4408 | 전체 |
| `skills/validation/agents/openai.yaml` | 183 | 전체 |
| `references/artifact-storage.md` | 7947 | 전체 |
| `references/scan-artifacts.md` | 11701 | 전체 |
| `references/static-finding-assessment.md` | 3949 | 전체 |
| `schemas/tools/candidate-validations.schema.json` | 4519 | 전체 |
| `mcp-app/src/artifact-candidate-ledger.ts` | 6121 | 전체 |
| `mcp-app/src/server/compact-artifact-tools.ts` | 15421 | 부분: 100~155줄, 350~384줄 |
| `mcp-app/src/artifact-io.ts` | 10767 | 부분: 40~162줄 |
| `mcp-app/src/artifact-discovery.ts` | 6305 | 부분: 50~102줄, 175~193줄 |
| `skills/security-diff-scan/SKILL.md` | 5405 | 부분: 3줄, 25~35줄 |
| `skills/finding-discovery/SKILL.md` | 5076 | 부분: 3줄, 29~33줄 |
| `skills/attack-path-analysis/SKILL.md` | 5355 | 부분: 28~37줄 |
| `skills/security-scan/SKILL.md` | 2972 | 부분: 3줄, 10줄, 21줄 |
| `skills/triage-finding/SKILL.md` | 8394 | 부분: 3줄, 10줄 |
| `skills/README.md` | 3752 | 부분: 21~28줄 |
| `references/core-scan.md` | 7479 | 부분: 7~18줄 |
| `references/validate-scan-findings.md` | 1131 | 전체 |
| `references/standalone-validation.md` | 2134 | 전체 |
| `references/final-report.md` | 12135 | 부분: 40~50줄 |

@callout level=open-question title="후보가 0건일 때 validation을 부르는가"
`security-diff-scan` 4단계는 후보가 있을 때만 `$validation`을 실행하라고 하고, validation은 빈 집합에도 `validations: []`를 제출하라고 한다. 두 원문의 우선순위는 명시 없음이다.[](source:dscan)[](source:wb-submit)
도구 쪽에서 확인한 것: schema의 `validations` 배열에는 최소 개수가 없다.[](source:schema-top) 도구는 먼저 후보 ledger 파일을 읽고, 파일이 없으면 "the requested artifact is unavailable" 오류로 실패한다.[](source:ledger-chk)[](source:io-miss) 후보 기록 도구는 후보가 0건이어도 빈 파일을 쓴다.[](source:disc-write) 판정: 이 세 코드 경로를 합치면 discovery를 한 번 기록했다면 `validations: []`는 통과하고 기록하지 않았다면 실패한다. 실행해서 확인한 것은 아니다.

@callout level=open-question title="이 페이지가 확인하지 못한 것"
첫째, `reportable`과 `not_applicable`의 정의가 이 스킬 원문에 없다. `standalone-validation.md`가 정의를 주지만 스킬이 지목하지 않는 파일이라 근거로 쓰지 않았다.[](source:standalone)
둘째, `counterevidence_or_proof_gap`과 `remaining_uncertainty`는 필수 문자열이지만 schema가 최소 길이를 두지 않는다. 빈 문자열을 의도한 것인지는 원문에 명시 없음이다.[](source:schema-gap)
셋째, 도구가 거부한 뒤 에이전트가 무엇을 하는지, 피드백 파일의 필드 구조, 재현 시도의 횟수·시간 상한은 원문에 명시 없음이다.
넷째, schema의 zod 구현(`artifact-contracts.ts`)과 JSON schema가 일치하는지는 확인하지 않았다. 도구 입력은 JSON schema 쪽만 읽었다.[](source:schema-req)
다섯째, 사람 검토는 미실시다. 이 페이지가 이해하기 쉬운지는 아직 판정하지 않았다.
