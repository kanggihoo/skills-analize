# finding을 보고서와 구조적 보강안으로 정리할 때 두 스킬은 어떻게 나뉘나? {#finding-reports-page}

이 묶음은 이미 나온 finding, disclosure, 소스를 다른 연구자가 확인할 수 있는 보고서(`vulnerability-writeup`)나 개별 patch를 넘는 구조적 보강안(`propose-security-hardening`)이라는 파생 문서로 정리하려는 작업을 위한 것이다.[](source:w-fm)[](source:h-fm) 두 스킬 사이에 필수 순서는 없다. 서로를 이름으로 부르거나 위임하지 않으며, 원장이 이어 둔 R41은 이름이 아니라 입력 조건이 맞는다는 분석자의 추론이다. 그래서 이 페이지에는 그림이 없고 입력, 산출물 경로, 요청 조건을 비교하는 표를 둔다.

- 어느 쪽이든 Codex Security scan이 없어도 시작할 수 있다. `vulnerability-writeup`은 취약점 메모, PoC, 소스, finding으로, `propose-security-hardening`은 disclosure나 소스 트리로 시작한다.[](source:w-fm)[](source:h-purpose)
- scan 최종 보고 안에서는 저장 위치가 다르다. 보고서는 `findings/<slug>/<slug>.md`이고 schema가 패턴으로 강제한다. 보강안은 `hardening/hardening.md`이고 manifest schema가 상수로 고정한다.[](source:sch-find)[](source:sch-man)
- 두 문서는 scan 완료의 전제 조건이 아닌 파생 문서이며 봉인 목록에 넣지 않는다.[](source:fr-opt)[](source:sa-rule)
- 최종 보고가 어느 scan에서 두 스킬을 부르는지는 두 스킬 원문 모두에 명시 없음. 원장 R22, R23은 `불명`이다.[](source:w-deliv)[](source:h-auto)

@answer scope="스킬 2개 · 관계 9개 · 그림 없음 · 실행 없음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source w-fm title="vulnerability-writeup 머리말" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=1:4
@source w-desc title="vulnerability-writeup description" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=3:3
@source w-purpose title="목적과 저장 전 읽기" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=8:10
@source w-claim title="주장 분해" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=14:14
@source w-src title="소스 유무에 따른 처리" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=16:18
@source w-hist title="릴리스 이력" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=20:20
@source w-layers title="증거 층과 반증" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=22:22
@source w-fmt title="초안 형식" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=26:26
@source w-coll title="여러 건 처리" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=28:28
@source w-review title="완성본 검토" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=30:30
@source w-poc-scope title="PoC 실행 범위" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=34:34
@source w-poc-art title="PoC artifact와 관찰" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=36:38
@source w-deliv title="전달 경로" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=42:42
@source w-port title="이식성과 검증" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=44:46
@source w-yaml title="표시 정보" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/agents/openai.yaml
@source w-rf title="보고서 개요" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/references/report-format.md lines=3:41
@source w-rf-pack title="보고서 저장 경로" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/references/report-format.md lines=43:47
@source h-fm title="propose-security-hardening 머리말" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=1:4
@source h-desc title="propose-security-hardening description" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=3:3
@source h-purpose title="목적" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=6:8
@source h-evid title="증거와 scan context 읽기" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=12:14
@source h-scope title="revision과 봉인 경계" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=16:16
@source h-store title="저장 전 읽기" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=18:18
@source h-look title="구조 원인 찾기" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=22:22
@source h-opp title="기회별 항목" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=24:35
@source h-out title="출력 규모" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=39:39
@source h-auto title="자동 scan 보고" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=41:48
@source h-impl title="구현" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=50:52
@source h-yaml title="표시 정보" path=codex-security/plugins/codex-security/skills/propose-security-hardening/agents/openai.yaml
@source h-pf title="제안 형식" path=codex-security/plugins/codex-security/skills/propose-security-hardening/references/proposal-format.md lines=5:35
@source h-pf-multi title="여러 기회와 저장 경로" path=codex-security/plugins/codex-security/skills/propose-security-hardening/references/proposal-format.md lines=37:49
@source h-pf-struct title="구조화 출력과 구현 계획" path=codex-security/plugins/codex-security/skills/propose-security-hardening/references/proposal-format.md lines=51:59
@source as-scope title="저장 정책 적용 범위" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=3:3
@source as-struct title="구조화 결과는 기존 도구" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=9:9
@source as-tool title="보조 파일 도구와 소유자" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=13:18
@source as-path title="path 규칙" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=37:37
@source as-sealed title="봉인된 scan 규칙" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=55:55
@source fr-opt title="선택 문서 절" path=codex-security/plugins/codex-security/references/final-report.md lines=51:53
@source ffd-proj title="workspace 투영" path=codex-security/plugins/codex-security/references/finding-detail-fields.md lines=26:26
@source ffd-ev title="Evidence 영역" path=codex-security/plugins/codex-security/references/finding-detail-fields.md lines=36:36
@source sa-rows title="최종 산출물 경로 표" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=101:102
@source sa-rule title="report.md 투영과 봉인 목록" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=122:122
@source sd-diff title="diff scan 최종 보고 단계" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=32:32
@source sc-all title="Standard scan 본문 전체" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md
@source des title="desktop handoff" path=codex-security/plugins/codex-security/skills/security-scan/references/desktop-scan.md lines=3:3
@source fx-desc title="fix-finding description" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=3:3
@source rd title="벤더 스킬 선택 안내" path=codex-security/plugins/codex-security/skills/README.md lines=30:38
@source sch-draft title="draft 입력 schema의 writeup 항목" path=codex-security/plugins/codex-security/schemas/tools/scan-draft.schema.json lines=370:380
@source sch-find title="봉인 findings schema의 writeup 항목" path=codex-security/plugins/codex-security/schemas/findings.schema.json lines=89:98
@source sch-man title="manifest schema의 hardening 항목" path=codex-security/plugins/codex-security/schemas/scan-manifest.schema.json lines=129:135
@source cs-schema title="MCP 쪽 writeup 정규식" path=codex-security/plugins/codex-security/mcp-app/scripts/canonical-schemas.mts lines=88:92
@source ts-hard-use title="draft의 hardening 채우기" path=codex-security/plugins/codex-security/mcp-app/src/artifact-scan-draft.ts lines=287:296
@source ts-hard-fn title="hardening 파일 읽기 함수" path=codex-security/plugins/codex-security/mcp-app/src/artifact-scan-draft.ts lines=3470:3485
@source py-miss title="scan 폴더 파일이 없을 때의 오류" path=codex-security/plugins/codex-security/scripts/finalize_scan_contract.py lines=649:652
@source py-wr title="write-up 파일 확인" path=codex-security/plugins/codex-security/scripts/finalize_scan_contract.py lines=698:723
@source py-hard title="hardening 파일 확인" path=codex-security/plugins/codex-security/scripts/finalize_scan_contract.py lines=727:737
@source py-rec-wr title="복구 경로의 write-up 검사" path=codex-security/plugins/codex-security/scripts/finalize_scan_contract.py lines=1288:1304
@source py-rec-hard title="복구 경로의 hardening 검사" path=codex-security/plugins/codex-security/scripts/finalize_scan_contract.py lines=1527:1546
@source py-fin-hard title="완료 준비의 hardening 확인 호출" path=codex-security/plugins/codex-security/scripts/finalize_scan_contract.py lines=3200:3200
@source py-fin title="봉인 여부에 따른 allow_missing" path=codex-security/plugins/codex-security/scripts/finalize_scan_contract.py lines=3221:3234
@source db-fin title="workbench 완료 호출" path=codex-security/plugins/codex-security/scripts/workbench_db.py lines=1385:1394
@source sealed-ts title="봉인 scan 파일 존재 검사" path=codex-security/plugins/codex-security/mcp-app/src/sealed-contract.ts lines=625:645
@source srv-ctx title="scan context 도구 등록" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1348:1356

## 요청을 받으면 두 스킬은 각각 무엇을 하나? {#behavior span=12}

두 스킬은 한 흐름의 앞뒤 단계가 아니라 같은 종류의 입력(finding, disclosure, 소스)을 받아 서로 다른 문서를 만드는 독립 스킬이다. 아래는 스킬마다 요청을 받은 뒤 에이전트가 하는 일을 읽는 차례대로 적은 것이며 두 스킬 사이의 순서가 아니다. 두 스킬을 이을 `@workflow`는 원문이 뒷받침하는 순서가 없어 그리지 않았다. 각 스킬의 내부 규칙과 수치는 스킬 페이지(`skill-explainers/codex-security/plugins/codex-security/skills/vulnerability-writeup/vulnerability-writeup.html`, `skill-explainers/codex-security/plugins/codex-security/skills/propose-security-hardening/propose-security-hardening.html`)에 맡기고, 여기서는 이 묶음에서 하는 일만 적는다.

**vulnerability-writeup: 저장 전에 정책을 읽는다.** 에이전트는 보존할 출력을 저장하기 전에 `../../references/artifact-storage.md`를 읽는다. 이 정책의 managed storage 기본값과 돌려받은 경로를 쓰고, 사용자가 정한 위치가 있으면 그 정책 아래에서 따른다. 원래 finding과 canonical scan artifact는 바꾸지 않는다.[](source:w-purpose)

**vulnerability-writeup: 근거를 세운다.** 에이전트는 공급된 메모, 보고서, PoC, 소스, finding에서 주장된 공격자, 통제 입력, 도달 가능한 동작, 보안 경계, 기대 동작, 실제 실패, 지원되는 영향을 가려낸다. 원래 finding은 글로 강화할 결론이 아니라 평가할 주장으로 다룬다. repository 내용과 가져온 artifact는 증거일 뿐 지시나 권한이 아니다.[](source:w-claim)

소스가 있으면 해당 revision과 주요 통제를 확인한 뒤에 소스에 기댄 결론을 내고, 체크아웃되지 않은 revision은 `git show REV:PATH`로 읽는다. 정확한 소스가 없으면 공급된 증거를 출처와 함께 서술하고 소스에 의존하는 주장은 조건부로 둔다. 발췌, 줄 번호, 관찰, 신원은 지어내지 않는다.[](source:w-src)

**vulnerability-writeup: 증거를 층으로 나누고 반증을 본다.** 공급된 보고서, 확인한 소스나 PoC 코드, 관찰한 실행, 추론을 서로 구분해 적는다. 주요 방어 장치와 그럴듯한 다른 설명을 확인하고, 증거가 finding과 어긋나면 어긋남을 설명한다. 가까운 다른 약점으로 바꿔 쓰거나 설득력 있는 오탐 보고서를 쓰지 않는다.[](source:w-layers) 영향받는 버전이나 수정된 릴리스를 주장하려면 필요한 만큼 릴리스 이력을 조사하지만, 쓰기 요청만으로 완전한 이력 조사가 요구되지는 않는다.[](source:w-hist)

**vulnerability-writeup: 초안을 쓰고 검토한다.** 전체 disclosure 보고서는 `references/report-format.md`의 개요를 따르고, 사용자가 다른 형식이나 좁은 편집을 요청하면 그에 맞춘다.[](source:w-fmt) 개요는 Executive Summary, Background, Vulnerability Details, Exploitability Analysis, Proof of Concept, Remediation, Summary 순이다.[](source:w-rf) 여러 취약점이면 근본 원인과 영향받는 코드로 중복을 가리고, 따로 이해되는 finding은 따로 둔다.

초안 위임과 독립 리뷰는 도움이 될 때 쓰는 선택이며 전제 조건이 아니다.[](source:w-coll) 완성한 뒤에는 결정적 발췌, 전제 조건, 영향, 영향받는 버전, 수정안, 검증 주장을 증거에 맞춰 보고 근거 없는 추론은 고쳐 쓴다.[](source:w-review)

**vulnerability-writeup: PoC는 승인 범위에서만 돌린다.** 에이전트는 사용자가 승인한 범위 안에서만 테스트를 돌린다. crash, 파괴, 권한 상승을 일으키는 PoC는 일회용 로컬 대상에서만 돌리고, 공개·외부·운영 대상은 그 대상에 대한 별도 허가가 있어야 한다.[](source:w-poc-scope) 실제 PoC artifact가 있거나 개발이 요청·승인됐으면 포함한다. 코드 검토, 문법·빌드 확인, 관찰한 실행, 기대했지만 관찰하지 못한 결과를 구분하고, 돌리지 않은 명령, 로그, 스크린샷, crash, 유출 값, 수정 대상 결과는 만들어 쓰지 않는다.[](source:w-poc-art)

**vulnerability-writeup: 저장하고 전달한다.** Codex Security 최종 보고 중이면 보고서를 `findings/<slug>/<slug>.md`에 저장하고 같은 안전한 상대 경로를 `writeup.reportPath`로 돌려준다. 디렉터리 이름과 파일 이름은 소문자로 맞춘다. 최종 보고가 아닐 때는 요청된 파일 이름을 따르고, 없으면 standalone managed collection에 같은 상대 배치를 쓴다.

실제 PoC artifact가 있을 때만 형제 `poc/` 디렉터리를 만든다.[](source:w-deliv) 배포용 보고서는 repository 기준 상대 경로 인용과 보고서 기준 상대 명령을 쓰고 작성자 컴퓨터 경로는 뺀다. 링크, 발췌, 요청된 형식을 확인하고 실제로 확인한 범위와 한계를 보고한다.[](source:w-port)

**propose-security-hardening: 증거를 읽고 범위를 정한다.** 에이전트는 공급된 finding, disclosure, 소스, 위협 모델, 제약을 쓰고 요약에 기대지 않고 밑바탕 증거를 직접 읽는다. workbench로 scan ID를 얻을 수 있으면 `get_codex_security_scan_context`로 그 scan의 context를 불러온다. 스킬은 이때 handoff token을 쓰라고 하지 않는다.

이 도구에는 읽기 전용이 아니라 `writingAnnotations`가 붙어 있고, 도구 설명에 따르면 launch token을 주면 전달이 기록된다. 이 도구를 token 없이 부를 때의 동작은 핸들러를 읽지 않아 알 수 없다.[](source:h-evid)[](source:srv-ctx) 저장하기 전에는 같은 `artifact-storage.md`를 읽고, 형제 output 디렉터리를 지어내지 않으며 완료된 scan을 고치지 않는다.[](source:h-store)

**propose-security-hardening: 증거가 허락하는 범위로 주장을 줄인다.** 에이전트는 확인할 수 있으면 관련 소스 revision을 확인하고, 작업 트리가 영향받은 revision과 다르면 둘을 구분한다. 소스, 커버리지, 재현, 무결성 정보가 빠지면 그만큼 주장 범위를 줄이되 남은 증거의 분석을 멈추지 않는다. scan 최종 보고 중에는 canonical 문서가 아직 봉인되지 않았을 수 있으므로 봉인은 scan 완료에 맡긴다.[](source:h-scope)

**propose-security-hardening: 구조 원인이 증거로 이어질 때만 권한다.** 에이전트는 공유된 위반 불변식, 흩어진 통제 소유, 과도한 권한, 약한 격리, 반복되는 전술적 수리를 찾고 그것이 실제 증거와 이어지는지 확인한다. 독립 finding은 국소 수정이 더 낫다고 판단할 수 있으며 구조 프로젝트를 만들어 내지 않는다.[](source:h-look) 가치 있는 기회마다 현재 경계와 통제 소유처, 지켜야 할 보안 불변식과 제약, 서로 다른 대안(강한 국소 통제 포함)의 비교, 보안 효과와 남는 위험과 비용, 각 선택지가 다루거나 완화하는 finding과 여전히 필요한 전술적 수정, 제약 아래의 추천과 그 추천을 바꿀 증거나 우선순위를 적는다. 관찰한 동작, 추론, 제안한 동작은 구분해 적고 측정값은 지어내지 않는다.[](source:h-opp)

**propose-security-hardening: 요청 규모에 맞춰 낸다.** 좁은 질문에는 증거와 tradeoff가 든 짧은 추천을 낸다. 상세 설계안, 여러 기회의 portfolio, 구조화 분석, 구현 계획을 요청받았을 때 `references/proposal-format.md`를 읽는다. 별도 JSON, 다이어그램 파일, 기회별 문서는 선택이다.[](source:h-out)[](source:h-pf)

큰 분석이면 짧은 portfolio가 개별 proposal을 링크하고, 제안된 상대 경로는 `hardening/hardening.md`, `hardening/proposals/<opportunity-id>.md`, `hardening/diagrams/<opportunity-id>-<view>.mmd`다. scan에 붙일 때 필수인 것은 `hardening/hardening.md` 하나뿐이다.[](source:h-pf-multi)

**propose-security-hardening: 자동 scan 보고에서는 `hardening/hardening.md`를 남긴다.** 에이전트는 scan의 artifact 도구로 파생 분석을 `hardening/hardening.md`에 저장한다. 구조 기회가 있으면 추천과 근거를, 없으면 국소 수정이 낫다는 이유를 적는다. 검증한 상대 경로를 orchestrator에 돌려주면 그 값이 `scan.hardening.portfolioPath`가 되며, 이 경로는 정확히 그 위치의 일반 파일이어야 한다.

이 분석은 봉인된 증거와 분리해 두고 `report.md`는 직접 고치지 않는다.[](source:h-auto) 전달 전에는 중요한 주장을 증거와 대조하고 생성한 링크, 다이어그램, 구조화 데이터를 확인한다.[](source:h-auto)

**propose-security-hardening: 구현은 별도 요청이 있어야 한다.** 분석 요청만으로는 구현이 허락되지 않는다. 사용자가 구현을 요청하면 선택한 설계와 제약을 이어받고, 소스가 바뀌었는지 확인하고, 이전 방어를 이전 도중에도 유지하고, 원래 취약했던 경로를 다시 검증한다. 요청이 선택을 이미 정했으면 별도 선택 절차는 요구하지 않는다.[](source:h-impl)

**두 스킬 사이: 필수 순서가 없다.** 두 본문 어디에도 선행 스킬이나 후속 스킬을 지시하는 문장이 없다.[](source:w-fmt)[](source:h-out) 원장 R41은 `vulnerability-writeup`에서 `propose-security-hardening`으로 가는 산출물 호환(추론)이다. `propose-security-hardening`은 "A supplied disclosure or source tree is enough to begin"이라 하고 `vulnerability-writeup`은 disclosure 보고서를 만든다는 점에서 분석자가 이은 것이며, 어느 스킬도 상대를 지목하지 않는다.[](source:h-purpose)[](source:w-fm)

판정: 같은 증거를 쓰는 병렬 산출물이라 어느 쪽을 먼저 만들어도 원문이 막지 않는다. 한쪽의 보고서를 다른 쪽이 입력으로 받는 방법은 원문에 명시 없음.

**scan 쪽에서 두 스킬로 가는 길.** `security-diff-scan`의 최종 보고 단계는 "Detailed write-ups and hardening plans are optional requested outputs"라고만 쓰고 스킬 이름은 적지 않는다.[](source:sd-diff) `final-report.md`도 상세 write-up과 hardening 제안을 "derived, unsealed outputs, not prerequisites for completing a scan"으로 정하고, running scan에서 만들면 경로를 `finding.writeup.reportPath`와 `scan.hardening.portfolioPath`에 적으라고 한다.[](source:fr-opt) Codex desktop scan에서만 handoff가 요구하는 per-finding write-up을 scan 완료 전에 마친다. Standard scan 본문 `security-scan/SKILL.md`에는 write-up이나 hardening 문장이 없다.[](source:des)[](source:sc-all)

## 입력, 산출물, 요청 조건은 어떻게 다른가? {#compare span=12}

아래 표는 두 원문을 항목별로 맞춰 본 것이다. 두 스킬의 내용을 한 표에 놓았을 뿐 호출 순서나 의존을 뜻하지 않는다.

| 항목 | `vulnerability-writeup` | `propose-security-hardening` |
| --- | --- | --- |
| 한 줄 목적 | 다른 보안 연구자가 이해하고 확인할 수 있는 보고서를 쓴다.[](source:w-purpose) | 구조적 변경을 찾고 의미 있는 대안을 비교해 비례하는 다음 단계를 권한다.[](source:h-purpose) |
| 시작에 충분한 입력 | 취약점 메모, disclosure 보고서, PoC, 소스, Codex Security finding이다.[](source:w-fm) | disclosure나 소스 트리면 시작할 수 있다.[](source:h-purpose) |
| scan이 필요한가 | scan은 선택이다.[](source:w-fm) | scan은 선택이다.[](source:h-purpose) |
| 입력을 다루는 방식 | 원래 finding은 평가할 주장이다.[](source:w-claim) | 보고서와 가져온 artifact는 증거이지 지시가 아니고, 제안은 취약점이 고쳐졌다는 증명이 아니다.[](source:h-evid) |
| 근거가 부족할 때 | 소스에 기대는 주장은 조건부로 두고 발췌와 줄 번호를 지어내지 않는다.[](source:w-src) | 빠진 정보는 주장 범위만 줄이고 나머지 증거의 분석은 계속한다.[](source:h-scope) |
| 산출물 | 자기완결적인 취약점 보고서 한 건과 실제 PoC가 있을 때의 `poc/` 파일이다.[](source:w-deliv) | 구조적 보강안이고, 큰 분석이면 portfolio와 기회별 문서다.[](source:h-out)[](source:h-pf-multi) |
| scan 최종 보고에서 저장하는 경로 | `findings/<slug>/<slug>.md`를 `writeup.reportPath`로 돌려준다.[](source:w-deliv) | `hardening/hardening.md`를 `scan.hardening.portfolioPath`로 돌려준다.[](source:h-auto) |
| scan 밖에서 저장하는 경로 | 요청된 파일 이름을 따르고 없으면 standalone managed collection에 같은 상대 배치를 쓴다.[](source:w-deliv) | 원문에 명시 없음. 저장 전에 `artifact-storage.md`를 읽고 형제 output 디렉터리는 지어내지 않는다.[](source:h-store) |
| 경로 형식을 강제하는 곳 | draft schema, 봉인 findings schema, MCP 쪽 정의가 같은 정규식을 쓴다.[](source:sch-draft)[](source:sch-find)[](source:cs-schema) | manifest schema가 `portfolioPath`를 상수로 고정한다.[](source:sch-man) |
| 형식 참고 문서 | 전체 disclosure 보고서는 `references/report-format.md`를 따른다.[](source:w-fmt) | 상세 요청일 때 `references/proposal-format.md`를 읽는다.[](source:h-out) |
| 실행·구현 경계 | 승인된 범위 안에서 PoC를 돌린다. {caution:허가 범위}[](source:w-poc-scope) | 분석 요청만으로는 구현이 허락되지 않는다. {caution:구현은 별도}[](source:h-impl) |
| 바꾸지 않는 것 | 원래 finding과 canonical scan artifact다.[](source:w-purpose) | 소스 증거와 canonical scan artifact, `report.md`이며 완료된 scan도 고치지 않는다.[](source:h-evid)[](source:h-store)[](source:h-auto) |

## 어떤 요청에 어느 스킬을 쓰나? {#choose span=12}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 두 스킬의 `openai.yaml`에는 `interface`만 있고 `policy` 키가 없으며 `SKILL.md` 머리말에도 호출을 제한하는 필드가 없다.[](source:w-fm)[](source:h-fm)[](source:w-yaml)[](source:h-yaml)

@code source=w-desc language=yaml
@code source=h-desc language=yaml

| 요청 | 스킬 | 경계 |
| --- | --- | --- |
| 취약점 하나를 다른 연구자가 확인할 보고서로 쓴다 | `vulnerability-writeup` | 원래 finding을 글로 강화하지 않는다.[](source:w-claim) {good:주 용도} |
| 여러 취약점의 disclosure campaign을 정리한다 | `vulnerability-writeup` | 근본 원인과 영향받는 코드로 중복을 가린다. 위임과 독립 리뷰는 선택이다.[](source:w-coll) |
| PoC를 만들거나 돌린다 | `vulnerability-writeup` | 승인된 범위 안에서만 한다.[](source:w-poc-scope) {bad:허가 없는 대상} |
| 같은 불변식 위반이 반복되는지 보고 구조 대안을 비교한다 | `propose-security-hardening` | 독립 finding이면 국소 수정이 낫다고 답하고 구조 프로젝트를 만들지 않는다.[](source:h-look) {good:주 용도} |
| scan 최종 보고가 hardening 안내를 요청한다 | `propose-security-hardening` | `hardening/hardening.md`를 저장하고 경로를 돌려준다. 어느 scan이 부르는지는 원문에 명시 없음.[](source:h-desc)[](source:h-auto) |
| 보강안을 구현해 달라고 한다 | `propose-security-hardening` | 구현을 요청받은 뒤에만 이어받는다.[](source:h-impl) {caution:구현은 별도} |
| 취약점을 실제로 고치고 검증하라고 한다 | 이 묶음 밖의 `fix-finding` | 이 묶음의 두 스킬은 고치지 않는다. `fix-finding`은 사용자가 fix and verify를 명시할 때만 쓴다.[](source:h-evid)[](source:fx-desc) |

벤더의 스킬 선택 안내(`skills/README.md`)는 `propose-security-hardening`을 "Fixing a bug" 절에, `vulnerability-writeup`을 "Reports and tickets" 절에 둔다.[](source:rd) 이 묶음은 둘이 모두 파생 문서를 만든다는 산출물 기준으로 묶었고 벤더의 분류와 다르다.

## 두 스킬과 scan 사이에는 어떤 관계가 있나? {#relations span=12}

순서, 선택지, 반복, 위임을 그릴 원문 근거가 없어 이 묶음에는 다이어그램을 넣지 않았다. 아래 관계는 모두 그림에서 생략한 것이 아니라 처음부터 그리지 않은 것이다. rel-id는 `skill-explainers/codex-security/relations.md`의 행이다.

| rel-id · 종류 | 방향과 조건 | 그림 |
| --- | --- | --- |
| R19 · 참고(명시-역할) | `security-diff-scan`에서 `vulnerability-writeup`으로 간다. 최종 보고 단계가 "Detailed write-ups and hardening plans are optional requested outputs"라고 하며, 사용자가 요청할 때만 만들고 스킬 이름은 적지 않는다.[](source:sd-diff)[](source:fr-opt) | 그림 없음 |
| R20 · 참고(명시-역할) | `security-diff-scan`에서 `propose-security-hardening`으로 간다. R19와 같은 문장이며 hardening plan은 요청된 선택 산출물이다.[](source:sd-diff)[](source:fr-opt) | 그림 없음 |
| R21 · 참고(명시-역할) | `security-scan`에서 `vulnerability-writeup`으로 간다. Codex desktop scan에서만 handoff의 per-finding write-up 요구를 따르고 scan 완료 전에 마친다. 스킬 이름은 적지 않는다.[](source:des)[](source:w-deliv) | 그림 없음 |
| R22 · 참고(명시-역할, `불명`) | `propose-security-hardening`에서 scan 스킬 후보 여럿(`security-scan`, `security-diff-scan`, `deep-security-scan`)으로 간다. "when a top-level scan requests final-report hardening guidance"라고만 적고 어느 scan인지 정하지 않는다.[](source:h-desc)[](source:h-auto) | 그림 없음 |
| R23 · 참고(명시-역할, `불명`) | `vulnerability-writeup`에서 scan 스킬 후보 여럿으로 간다. "During Codex Security final reporting"이라고만 적고 어느 scan인지 정하지 않는다.[](source:w-deliv) | 그림 없음 |
| R41 · 산출물 호환(추론) | `vulnerability-writeup`에서 `propose-security-hardening`으로 간다. 필수 순서가 아니다. 보강안은 공급된 disclosure로 시작할 수 있고 write-up은 disclosure 보고서를 만들 뿐 서로를 지목하지 않는다.[](source:h-purpose)[](source:w-fm) | 그림 없음 |
| R34 · 참고(추론) | `propose-security-hardening`에서 `fix-finding`으로 간다. "Independent findings may be best handled by local fixes"라 하고 남는 tactical fix를 적지만 `fix-finding`을 이름으로 지목하지 않는다.[](source:h-look)[](source:h-opp)[](source:fx-desc) | 그림 없음 |
| R60 · 참고(명시-이름) | 두 스킬을 포함한 여러 스킬이 저장 전에 플러그인 루트 `references/artifact-storage.md`를 읽고 그 storage policy를 따르라고 한다. 여기서는 두 스킬의 문장만 확인했다.[](source:w-purpose)[](source:h-store)[](source:as-scope) | 그림 없음 |
| R91 · 참고(명시-이름) | `propose-security-hardening`에서 MCP 도구 `get_codex_security_scan_context`로 간다. workbench로 scan ID를 얻을 수 있을 때 scan context를 읽고 스킬은 handoff token을 쓰라고 하지 않는다. 도구에는 `writingAnnotations`가 붙어 있다.[](source:h-evid)[](source:srv-ctx) | 그림 없음 |

R22와 R23의 `불명`은 두 스킬이 호출하는 scan을 이름으로 가리키지 않기 때문이다. 호출 조건을 더 정한 문장은 읽은 원문에 없다. R60은 원장에서 여러 스킬이 `artifact-storage.md`를 읽는 한 행이다. 이 페이지는 그중 두 스킬의 문장만 다시 읽었다.

## scan 안에서 두 경로는 어떻게 검증되나? {#paths span=12}

scan 안에서 쓸 때 두 산출물은 경로 형식이 schema로 고정된다. 보고서 경로는 draft 입력 schema, 봉인 findings schema, MCP 쪽 정의가 모두 `^findings/([a-z0-9][a-z0-9._-]*)/\1\.md$`를 쓴다. 디렉터리 이름과 파일 이름이 같은 소문자 slug여야 한다는 뜻이다.[](source:sch-draft)[](source:sch-find)[](source:cs-schema) 보강안은 manifest schema가 `portfolioPath`를 상수 `hardening/hardening.md`로 고정한다.[](source:sch-man)

| 검증 단계 | `writeup.reportPath`(R21, R23) | `scan.hardening.portfolioPath`(R22) |
| --- | --- | --- |
| draft 쓰기 | 원문에 명시 없음. 이 단계의 호스트 처리는 읽지 않았다. | draft 도구가 `hardening/hardening.md`를 읽어 보고 있으면 manifest의 `hardening`을 채운다.[](source:ts-hard-use)[](source:ts-hard-fn) |
| draft 쓰기에서 파일이 없을 때 | 해당 없음(위와 같다). | "requested artifact is unavailable" 오류만 삼켜 `hardening`을 생략하고 그 밖의 읽기 오류는 그대로 던진다.[](source:ts-hard-fn) |
| 완료(finalize) 기본 | 각 `reportPath`가 scan 폴더 안의 실제 파일인지 열어 보고 없으면 오류로 실패하는 것이 기본이다.[](source:py-wr)[](source:py-miss) | `portfolioPath`가 가리키는 파일을 열지 못하면 오류다. 완화 인자가 없다.[](source:py-hard)[](source:py-fin-hard) |
| workbench의 봉인 전 완료 | workbench가 `allow_missing_writeups=True`를 주고 봉인된 scan이 아니면 없는 write-up은 그 finding의 `writeup`만 버리고 `Skipped missing writeup for finding N` 경고를 남긴다.[](source:db-fin)[](source:py-fin)[](source:py-wr) | 같은 완화는 원문에 명시 없음. |
| 복구(`recover_unsealed`) 경로 | 형식 오류, 중복 경로, 파일 없음을 모두 `Skipped malformed writeup for finding N` 경고로 버린다.[](source:py-rec-wr) | 형식이나 파일이 맞지 않으면 `hardening`을 버리고 `Skipped malformed hardening portfolio` 경고만 남긴다.[](source:py-rec-hard) |
| 봉인된 scan의 파일 존재 검사 | `tracking` profile이 아니면 각 finding의 `writeup.reportPath` 파일을 확인한다.[](source:sealed-ts) | `tracking` profile이 아니면 `hardening.portfolioPath` 파일을 확인한다.[](source:sealed-ts) |

위 표의 완료, 복구, 읽기 단계는 코드에서 읽은 지시상 동작이다. 실행하지 않았다. 복구 경로를 어떤 status의 scan에 적용하는지는 이 페이지에서 호출 줄을 다시 읽지 않았다.

판정: 두 산출물은 봉인 목록에 들지 않는 파생 문서이면서도 경로가 manifest나 findings에 적히면 완료나 읽기 때 파일 존재를 검사받는다. 두 스킬이 정확한 상대 경로를 돌려주지 않으면 링크가 빠지거나 완료가 실패할 수 있다. 근거는 schema 패턴과 상수, 완료와 복구와 읽기의 확인 코드다.[](source:fr-opt)[](source:sch-find)[](source:sch-man)[](source:py-wr)[](source:py-hard)[](source:sealed-ts)

@callout level=warning title="두 스킬은 scan이 끝났다고 가정하지 않는다"
| scan 최종 보고 중에는 canonical 문서가 아직 봉인 전일 수 있다. `propose-security-hardening`은 봉인을 scan 완료에 맡기고 완료된 scan은 고치지 않는다.[](source:h-scope)[](source:h-store) |
| 완료되거나 봉인된 scan의 파일은 보조 파일 저장 도구로 고치지 못한다. 이후 요청받은 write-up과 hardening은 standalone target collection에 저장하고 돌려받은 파일을 따로 연결한다.[](source:as-sealed) |

## 어떤 파일을 누가 쓰고 읽나? {#state span=12}

공유 상태 표다. 두 스킬이 같은 파일을 쓰는 경우는 원문에 없다. 두 산출물은 서로 다른 경로에 쌓이고, 선후 관계 없이 같은 증거를 읽는다.

| 파일·경로 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `findings/<slug>/<slug>.md` (R21, R23) | `vulnerability-writeup`이 쓴다. scan 밖에서는 요청된 파일 이름을 따른다.[](source:w-deliv) | 이 경로를 읽는 스킬은 원문에 명시 없음. workbench Evidence 영역이 `writeup.reportPath`를 나열하고 완료와 읽기 단계가 존재를 확인한다.[](source:ffd-ev)[](source:py-wr) |
| `findings/<slug>/poc/` (R21, R23) | `vulnerability-writeup`이 실제 PoC artifact가 있을 때만 만든다.[](source:w-deliv) | 읽는 스킬은 원문에 명시 없음. workbench Evidence 영역이 `poc/` 아래 일반 파일을 나열한다.[](source:ffd-ev) |
| `hardening/hardening.md` (R22) | `propose-security-hardening`이 scan의 artifact 도구로 저장한다.[](source:h-auto) | 읽는 스킬은 원문에 명시 없음. draft 도구가 존재하면 manifest에 넣고 완료와 읽기 단계가 존재를 확인한다.[](source:ts-hard-use)[](source:py-hard)[](source:sealed-ts) |
| `hardening/proposals/<opportunity-id>.md`, `hardening/diagrams/<opportunity-id>-<view>.mmd` | `propose-security-hardening`이 큰 분석에서 선택적으로 만든다.[](source:h-pf-multi) | 원문에 명시 없음. |
| `report.md` | 어느 스킬도 직접 쓰지 않는다. finalize가 투영물을 쓰고 기록된 write-up과 hardening 링크를 건다.[](source:sa-rule) | 해당 없음. |
| `scan-manifest.json`, `findings.json` | 두 스킬 모두 쓰지 않는다. 구조화 결과는 기존 draft 도구가 맡는다.[](source:w-purpose)[](source:h-evid)[](source:as-struct) | 두 스킬이 증거로 읽는다.[](source:w-claim)[](source:h-evid) |
| `writeup.reportPath`, `scan.hardening.portfolioPath` 필드 | 호출한 orchestrator가 draft에 적는다. 어느 scan인지는 원문에 명시 없음(R22, R23 `불명`).[](source:w-deliv)[](source:h-auto) | 호스트 renderer가 링크와 화면을 만든다.[](source:fr-opt) |

저장 `path`는 `artifacts/`, `findings/`, `hardening/` 아래 상대 경로여야 하고, 소유자는 `scanId`와 `targetPath` 중 정확히 하나로 정한다. 완료 후 요청된 write-up과 hardening은 `targetPath`로 만든 collection을 쓰며 scan을 시작하지 않는다.[](source:as-tool)[](source:as-path)

## 어디까지 읽고 무엇을 확인하지 못했나? {#audit span=12}

| 조사 구분 | 확인 범위 |
| --- | --- |
| 스킬 폴더 원본 | `vulnerability-writeup`의 `SKILL.md` 5,571B, `references/report-format.md` 4,482B, `agents/openai.yaml` 290B를 끝까지 읽었다. `propose-security-hardening`의 `SKILL.md` 5,026B, `references/proposal-format.md` 4,144B, `agents/openai.yaml` 293B도 끝까지 읽었다. |
| 플러그인 참조 | `references/artifact-storage.md` 7,947B는 55줄 전부 읽었다. `references/final-report.md` 12,135B는 Optional Documents 절 주변만, `references/finding-detail-fields.md` 10,874B는 24~36줄만, `references/scan-artifacts.md` 11,701B는 94~104줄과 120~123줄만 읽었다. |
| 이웃 스킬 | `security-scan/SKILL.md` 2,972B와 `references/desktop-scan.md` 580B는 전부, `security-diff-scan/SKILL.md` 5,405B는 30~34줄만, `skills/README.md` 3,752B는 전부, `fix-finding/SKILL.md` 18,461B는 description 줄만 읽었다. |
| 구현 계약 | `scan-draft.schema.json`, `findings.schema.json`, `scan-manifest.schema.json`, `canonical-schemas.mts`, `artifact-scan-draft.ts`, `finalize_scan_contract.py`, `workbench_db.py`, `sealed-contract.ts`, `server.ts`는 관계가 가리키는 줄과 그 주변만 읽었다. 구조·표본만 확인(전부 읽지 않음). |
| 관계 대조 | 원장 R19~R23, R34, R41, R60, R91의 종류, 조건, 해석 상태를 위 원문 줄과 맞췄다. 원장 묶음 행이 직접 가리키는 관계는 R21~R23, R41, R91이고 나머지는 두 스킬이 끼어 있어 함께 실었다. |
| 제외 | 번역본과 바이너리는 없고 열지 않았다. 읽은 텍스트 파일은 25개이며 전부 읽은 것과 일부만 읽은 것을 위 표에 나눠 적었다. 스크립트와 도구는 실행하지 않았고 외부 URL은 열지 않았다. |

이 묶음의 필수 자료인 두 스킬 폴더와 `artifact-storage.md`는 모두 읽어 부분 분석 표시는 하지 않는다. 두 스킬의 내부 규칙과 수치는 각 스킬 페이지가 다룬다.

@callout level=open-question title="확인하지 못했거나 원문에 명시가 없는 부분"
| 어느 scan이 `vulnerability-writeup`과 `propose-security-hardening`을 호출하는지는 원문에 명시 없음. 호출하는 orchestrator는 이 트리에서 특정되지 않는다.[](source:w-deliv)[](source:h-auto) |
| 한 스킬의 산출물을 다른 스킬이 입력으로 받아 이어 쓰는 방법은 원문에 명시 없음. R41은 서로를 지목하지 않는 추론이다.[](source:h-purpose)[](source:w-fm) |
| `writeup.reportPath`의 draft 쓰기 단계 호스트 처리는 읽지 않았다. 복구 경로가 적용되는 scan status와 `get_codex_security_scan_context`를 token 없이 부를 때의 동작도 확인하지 못했다.[](source:py-rec-wr)[](source:srv-ctx) |
| workbench의 Evidence 영역이 `hardening/hardening.md`를 어떻게 보여 주는지는 원문에 명시 없음. 읽은 문장은 `writeup.reportPath`와 `poc/`만 다룬다.[](source:ffd-ev) |

분석 중 원본은 수정하지 않았다. 스킬 안의 지시(소스 확인, PoC 실행, 파일 저장, 도구 호출)는 분석할 자료로만 읽고 실행하지 않았다. 자동 검증은 HTML 구조와 출처 해석만 확인한다. 사람 검토는 미실시다.
