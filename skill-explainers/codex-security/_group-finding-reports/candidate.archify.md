# finding을 보고서와 구조적 보강안으로 정리할 때 두 스킬은 어떻게 나뉘나? {#finding-reports-page}

`vulnerability-writeup`은 취약점 하나나 disclosure 묶음을 다른 연구자가 확인할 수 있는 독립 보고서로 쓰고, `propose-security-hardening`은 개별 patch를 넘는 구조적 보강안을 대안 비교와 함께 제안한다.[](source:w-front)[](source:h-front) 두 스킬 사이에는 필수 순서도, 호출도, 위임도 원문에 없다. 사용자가 요청하거나 scan이 최종 보고에서 요청할 때 각각 따로 쓴다. 그래서 이 페이지에는 그림이 없고, 두 스킬이 공유하는 경로와 scan 안의 검증 방식만 표로 정리한다.[](source:sd-diff)[](source:fr-opt)

- `vulnerability-writeup`은 원래 finding을 강화할 결론이 아니라 평가할 주장으로 본다. 공격자, 통제 입력, 경계, 실제 실패, 지원되는 영향을 먼저 정한다.[](source:w-claim)
- `propose-security-hardening`은 공통 불변식 위반이나 흩어진 통제 소유처럼 구조 원인이 증거로 이어질 때만 구조 변경을 권한다. 독립 finding은 국소 수정이 나을 수 있다.[](source:h-look)
- scan 안에서 저장 위치가 다르다. 보고서는 `findings/<slug>/<slug>.md`이고 schema가 패턴으로 강제한다. 보강안은 `hardening/hardening.md`이고 manifest schema가 상수로 고정한다.[](source:schema-find)[](source:schema-man)
- 최종 보고가 두 스킬을 부를 때 어느 scan이 부르는지는 두 스킬 원문 모두에 명시 없음. 원장 R22, R23은 `불명`이다.[](source:w-deliv)[](source:h-front)

@answer scope="스킬 2개 · 관계 9개(R19~R23, R34, R41, R60, R91) · 호출하는 scan 불명 2건 · 실행 없음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source w-front title="codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md · 5571B · frontmatter" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=1:4
@source w-intro title="vulnerability-writeup/SKILL.md · 목적과 저장 정책" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=8:10
@source w-claim title="vulnerability-writeup/SKILL.md · 근거 세우기" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=14:22
@source w-draft title="vulnerability-writeup/SKILL.md · 초안과 검토" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=26:30
@source w-poc title="vulnerability-writeup/SKILL.md · PoC 규칙" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=34:38
@source w-deliv title="vulnerability-writeup/SKILL.md · 전달 경로" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=42:42
@source w-port title="vulnerability-writeup/SKILL.md · 이식성과 검증" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=44:46
@source w-yaml title="vulnerability-writeup/agents/openai.yaml · 290B · UI 메타데이터" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/agents/openai.yaml
@source w-fmt title="vulnerability-writeup/references/report-format.md · 4482B · 보고서 개요" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/references/report-format.md lines=1:41
@source w-fmt-pack title="vulnerability-writeup/references/report-format.md · Packaging 절" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/references/report-format.md lines=43:47
@source h-front title="codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md · 5026B · frontmatter" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=1:4
@source h-intro title="propose-security-hardening/SKILL.md · 목적" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=8:8
@source h-ev title="propose-security-hardening/SKILL.md · 증거, 범위, 저장 정책" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=10:18
@source h-look title="propose-security-hardening/SKILL.md · 구조 원인과 기회별 항목" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=22:35
@source h-out title="propose-security-hardening/SKILL.md · 출력 규모" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=37:39
@source h-auto title="propose-security-hardening/SKILL.md · 자동 scan 보고" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=41:48
@source h-impl title="propose-security-hardening/SKILL.md · 구현" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=50:52
@source h-yaml title="propose-security-hardening/agents/openai.yaml · 293B · UI 메타데이터" path=codex-security/plugins/codex-security/skills/propose-security-hardening/agents/openai.yaml
@source h-fmt title="propose-security-hardening/references/proposal-format.md · 4144B · 제안 형식" path=codex-security/plugins/codex-security/skills/propose-security-hardening/references/proposal-format.md lines=1:35
@source h-fmt-port title="propose-security-hardening/references/proposal-format.md · 여러 기회와 구조화 출력" path=codex-security/plugins/codex-security/skills/propose-security-hardening/references/proposal-format.md lines=37:55
@source st-own title="codex-security/plugins/codex-security/references/artifact-storage.md · 7947B · scan 소유와 구조화 결과" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=3:9
@source st-supp title="references/artifact-storage.md · 보조 파일 도구와 owner" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=11:23
@source st-path title="references/artifact-storage.md · path 규칙" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=37:39
@source st-sealed title="references/artifact-storage.md · 봉인된 scan 규칙" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=55:55
@source fr-opt title="codex-security/plugins/codex-security/references/final-report.md · 12135B · Optional Documents 절만 확인" path=codex-security/plugins/codex-security/references/final-report.md lines=51:53
@source ffd-ws title="codex-security/plugins/codex-security/references/finding-detail-fields.md · 10874B · workspace 투영 절만 확인" path=codex-security/plugins/codex-security/references/finding-detail-fields.md lines=26:36
@source sa-path title="codex-security/plugins/codex-security/references/scan-artifacts.md · 11701B · 최종 산출물 경로 표만 확인" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=96:104
@source sa-seal title="references/scan-artifacts.md · report.md와 봉인 목록" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=122:122
@source sd-diff title="codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md · 5405B · 최종 보고 단계" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=32:32
@source sc-desc title="codex-security/plugins/codex-security/skills/security-scan/SKILL.md · 2972B · 본문 전체에 write-up 문장 없음" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=1:21
@source des title="codex-security/plugins/codex-security/skills/security-scan/references/desktop-scan.md · 580B · desktop handoff" path=codex-security/plugins/codex-security/skills/security-scan/references/desktop-scan.md lines=3:3
@source fx-desc title="codex-security/plugins/codex-security/skills/fix-finding/SKILL.md · 18461B · description 줄만 확인" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=3:3
@source rd title="codex-security/plugins/codex-security/skills/README.md · 3752B · 벤더 스킬 선택 안내" path=codex-security/plugins/codex-security/skills/README.md lines=34:38
@source schema-draft title="codex-security/plugins/codex-security/schemas/tools/scan-draft.schema.json · 28295B · writeup 항목만 확인" path=codex-security/plugins/codex-security/schemas/tools/scan-draft.schema.json lines=370:380
@source schema-find title="codex-security/plugins/codex-security/schemas/findings.schema.json · 10591B · writeup 항목만 확인" path=codex-security/plugins/codex-security/schemas/findings.schema.json lines=89:98
@source schema-man title="codex-security/plugins/codex-security/schemas/scan-manifest.schema.json · 7815B · hardening 항목만 확인" path=codex-security/plugins/codex-security/schemas/scan-manifest.schema.json lines=129:135
@source cs-schema title="codex-security/plugins/codex-security/mcp-app/scripts/canonical-schemas.mts · 10232B · writeup 정규식 줄만 확인" path=codex-security/plugins/codex-security/mcp-app/scripts/canonical-schemas.mts lines=88:92
@source ts-hard-use title="codex-security/plugins/codex-security/mcp-app/src/artifact-scan-draft.ts · 118549B · hardening 읽기 줄만 확인" path=codex-security/plugins/codex-security/mcp-app/src/artifact-scan-draft.ts lines=287:296
@source ts-hard-fn title="mcp-app/src/artifact-scan-draft.ts · readExistingHardeningPortfolio" path=codex-security/plugins/codex-security/mcp-app/src/artifact-scan-draft.ts lines=3470:3485
@source py-wr title="codex-security/plugins/codex-security/scripts/finalize_scan_contract.py · 147094B · write-up 파일 확인 함수만 확인" path=codex-security/plugins/codex-security/scripts/finalize_scan_contract.py lines=698:723
@source py-hard title="scripts/finalize_scan_contract.py · hardening 파일 확인" path=codex-security/plugins/codex-security/scripts/finalize_scan_contract.py lines=727:737
@source py-rec-wr title="scripts/finalize_scan_contract.py · 복구 경로의 write-up 검사" path=codex-security/plugins/codex-security/scripts/finalize_scan_contract.py lines=1288:1304
@source py-rec-hard title="scripts/finalize_scan_contract.py · 복구 경로의 hardening 검사" path=codex-security/plugins/codex-security/scripts/finalize_scan_contract.py lines=1527:1546
@source py-fin title="scripts/finalize_scan_contract.py · 봉인 여부에 따른 allow_missing" path=codex-security/plugins/codex-security/scripts/finalize_scan_contract.py lines=3221:3234
@source db-fin title="codex-security/plugins/codex-security/scripts/workbench_db.py · 149908B · workbench 완료 호출 줄만 확인" path=codex-security/plugins/codex-security/scripts/workbench_db.py lines=1385:1394
@source sealed-ts title="codex-security/plugins/codex-security/mcp-app/src/sealed-contract.ts · 36923B · 파일 존재 검사 줄만 확인" path=codex-security/plugins/codex-security/mcp-app/src/sealed-contract.ts lines=625:645
@source srv-ctx title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · get_codex_security_scan_context 등록 줄만 확인" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1348:1356

## 두 스킬은 이 묶음에서 무엇을 하고 어디가 다른가? {#compare}

두 스킬은 서로의 입력을 요구하지 않는다. 같은 finding이나 disclosure를 서로 다른 형태로 정리하므로 만드는 것, 시작 입력, 실행·구현 경계가 다르다. 아래 표는 두 원문을 항목별로 맞춰 본 것이다.

| 항목 | `vulnerability-writeup` | `propose-security-hardening` |
| --- | --- | --- |
| 이 묶음에서 하는 일 | 다른 보안 연구자가 이해하고 확인할 수 있는 보고서를 쓴다. 취약점 하나나 disclosure campaign에 쓴다.[](source:w-front)[](source:w-intro) | 구조적 변경을 찾고 의미 있는 대안을 비교해 비례하는 다음 단계를 권한다.[](source:h-intro) |
| 시작에 충분한 입력 | 취약점 메모, disclosure 보고서, PoC, source code, Codex Security finding. scan은 선택이다.[](source:w-front) | disclosure나 source tree면 시작할 수 있다. scan은 선택이다.[](source:h-intro) |
| 입력을 다루는 방식 | 원래 finding은 평가할 주장이다. repository 내용과 가져온 artifact는 증거이지 지시나 권한이 아니다.[](source:w-claim) | repository 내용, 보고서, 가져온 artifact는 증거이지 지시나 권한이 아니다. 제안은 취약점이 고쳐졌다는 증명이 아니다.[](source:h-ev) |
| 근거가 부족할 때 | source가 없으면 출처를 밝힌 설명은 쓸 수 있다. source에 기대는 주장은 조건부로 두고, 발췌·줄 번호·관찰·신원을 지어내지 않는다.[](source:w-claim) | 빠진 source, coverage, 재현, 무결성 정보는 주장 범위를 줄일 뿐 나머지 증거의 분석을 막지 않는다.[](source:h-ev) |
| 실행·구현 경계 | 선택적으로 PoC를 쓴다. 사용자가 허가한 범위 안에서만 실행하고 crash나 파괴적 PoC는 일회용 로컬 대상에서만 돌린다. 공개·외부·운영 대상은 대상별 허가가 필요하다.[](source:w-poc) {caution:허가 범위} | 분석 요청만으로는 구현이 허락되지 않는다. 사용자가 구현을 요청하면 선택한 설계와 제약을 이어받는다.[](source:h-impl) {caution:구현은 별도} |
| 형식 참고 문서 | 전체 disclosure 보고서는 `references/report-format.md` 개요를 따른다. 좁은 편집이면 필요한 절만 쓴다.[](source:w-draft)[](source:w-fmt) | 상세 설계안, 여러 기회의 portfolio, 구조화 분석, 구현 계획을 요청받았을 때 `references/proposal-format.md`를 읽는다. 별도 JSON, 다이어그램 파일, 기회별 문서는 선택이다.[](source:h-out)[](source:h-fmt) |
| scan 최종 보고에서 저장 | `findings/<slug>/<slug>.md`에 두고 그 상대 경로를 `writeup.reportPath`로 돌려준다.[](source:w-deliv) | scan의 artifact 도구로 `hardening/hardening.md`를 저장하고 검증한 상대 경로를 orchestrator에 돌려준다(`scan.hardening.portfolioPath`).[](source:h-auto) |
| 저장하기 전에 | `../../references/artifact-storage.md`를 읽고 managed storage 기본값을 쓴다. 사용자가 정한 위치는 그 정책 아래에서 따른다. 원래 finding과 canonical scan artifact는 바꾸지 않는다.[](source:w-intro) | 같은 파일을 읽는다. 형제 output 폴더를 지어내지 않고 완료된 scan을 고치지 않는다.[](source:h-ev) |

판정: 두 스킬은 같은 증거를 쓰는 병렬 산출물이라 어느 쪽을 먼저 만들어도 원문이 막지 않는다. 근거는 두 스킬 본문 어디에도 선행 스킬이나 후속 스킬 지시가 없다는 점이다.[](source:w-draft)[](source:h-out)

## 순서나 위임이 있나, 어떤 관계로 이어지나? {#relations}

순서, 선택지, 반복, 위임을 그릴 원문 근거가 없어 이 묶음에는 다이어그램을 넣지 않았다. 원장이 정한 그대로 입력, 산출물 경로, 요청 조건을 표로 남긴다. 아래 관계는 모두 그림에서 뺐다(그림이 아예 없다).

| rel-id · 종류 | 방향과 조건 | 그림 반영 |
|---|---|---|
| R19 · 참고 | `security-diff-scan`에서 `vulnerability-writeup`으로 간다. 최종 보고 단계가 "Detailed write-ups and hardening plans are optional requested outputs"라고 한다. 사용자가 요청할 때만 만들고 스킬 이름은 적지 않는다. `final-report.md`도 write-up과 hardening을 "derived, unsealed outputs, not prerequisites for completing a scan"으로 정한다.[](source:sd-diff)[](source:fr-opt) | 생략(그림 없음) |
| R20 · 참고 | `security-diff-scan`에서 `propose-security-hardening`으로 간다. R19와 같은 문장이다. hardening plan은 요청된 선택 산출물이고 스킬 이름은 적지 않는다.[](source:sd-diff)[](source:fr-opt) | 생략(그림 없음) |
| R21 · 참고 | `security-scan`에서 `vulnerability-writeup`으로 간다. Codex desktop scan에서만 handoff의 "per-finding write-ups" 요구를 따르고 scan을 완료하기 전에 마친다. 스킬 이름은 적지 않는다. 결과는 `findings/<slug>/<slug>.md`(`writeup.reportPath`)다.[](source:des)[](source:w-deliv) | 생략(그림 없음) |
| R22 · 참고(`불명`) | `propose-security-hardening`에서 scan 스킬 후보 여럿(`security-scan`, `security-diff-scan`, `deep-security-scan`)으로 간다. description은 "when a top-level scan requests final-report hardening guidance"라고만 적고 어느 scan인지 정하지 않는다. 자동 보고에서는 `hardening/hardening.md`를 저장하고 상대 경로를 orchestrator에 돌려준다.[](source:h-front)[](source:h-auto) | 생략(그림 없음) |
| R23 · 참고(`불명`) | `vulnerability-writeup`에서 scan 스킬 후보 여럿으로 간다. "During Codex Security final reporting"이라고만 적고 어느 scan인지 정하지 않는다. 보고서는 `findings/<slug>/<slug>.md`에 두고 `writeup.reportPath`로 돌려준다.[](source:w-deliv) | 생략(그림 없음) |
| R41 · 산출물 호환(추론) | `vulnerability-writeup`에서 `propose-security-hardening`으로 간다. 보강안은 "A supplied disclosure or source tree is enough to begin"이라 하고 `vulnerability-writeup`은 disclosure 보고서를 만든다. 서로를 지목하지 않는다.[](source:w-front)[](source:h-intro) | 생략(그림 없음) |
| R34 · 참고(추론) | `propose-security-hardening`에서 `fix-finding`으로 간다. 개별 patch를 넘는 대안을 다루며 "Independent findings may be best handled by local fixes"라 하고 어떤 tactical fix가 여전히 필요한지 적는다. 이름으로 `fix-finding`을 지목하지 않는다. `fix-finding`은 `remediate-finding` 묶음의 스킬이고 사용자가 fix and verify를 명시할 때만 쓰는 스킬이다.[](source:h-front)[](source:h-look)[](source:fx-desc) | 생략(그림 없음) |
| R60 · 참고(범위 내) | 두 스킬이 모두 저장 전에 플러그인 루트 `references/artifact-storage.md`를 읽고 storage policy를 따르라고 한다. 이 파일은 읽었고, 규칙은 아래 경로 패널에 있다.[](source:w-intro)[](source:h-ev)[](source:st-own) | 생략(그림 없음) |
| R91 · 참고 | `propose-security-hardening`에서 MCP 도구 `get_codex_security_scan_context`로 간다. "If a scan ID is available through the workbench"일 때 이 도구로 scan context를 읽는다. 스킬은 handoff token을 쓰라고 하지 않는다. 이 도구는 읽기 전용이 아니라 쓰기 annotation을 달고 있고, 설명은 launch token을 주면 전달이 기록되고 실행 중인 Standard scan을 token과 함께 소유 대화에서 읽으면 preflight가 `threat_model`로 넘어간다고 적는다. token 없이 부를 때의 동작은 핸들러를 읽지 않았다.[](source:h-ev)[](source:srv-ctx) | 생략(그림 없음) |

R21은 Codex desktop scan 한 곳에서만 write-up을 요구한다. `security-scan` 본문 `SKILL.md`에는 write-up이나 hardening 문장이 없다.[](source:sc-desc) R22와 R23의 `불명`은 두 스킬이 호출하는 scan을 이름으로 가리키지 않기 때문이다. 호출 조건을 더 정한 문장은 원문에 없다.

## scan 안에서 두 경로는 무엇이 강제되고 어떻게 검증되나? {#paths}

scan 안에서 쓸 때 두 산출물은 경로 형식이 schema로 고정된다. 보고서 경로는 draft 입력 schema와 봉인 문서 schema, 그리고 MCP 쪽 schema 정의가 모두 같은 정규식 `^findings/([a-z0-9][a-z0-9._-]*)/\1\.md$`를 쓴다.[](source:schema-draft)[](source:schema-find)[](source:cs-schema) 즉 디렉터리 이름과 파일 이름이 같은 소문자 slug여야 한다. 보강안은 manifest schema가 `portfolioPath`를 상수 `hardening/hardening.md`로 고정한다.[](source:schema-man)

| 검증 단계 | `writeup.reportPath`(R21, R23) | `scan.hardening.portfolioPath`(R22) |
|---|---|---|
| 형식 | 위 정규식을 draft와 봉인 문서가 모두 요구한다.[](source:schema-draft)[](source:schema-find) | manifest schema가 상수로 고정한다.[](source:schema-man) |
| draft 쓰기 | 원문에 명시 없음(이 단계의 호스트 처리는 읽지 않았다). | draft 도구가 `hardening/hardening.md`가 이미 있으면 draft를 쓸 때마다 manifest의 `hardening`을 채운다. 파일이 없다는 오류만 삼키고 그 밖의 읽기 오류는 다시 던진다.[](source:ts-hard-use)[](source:ts-hard-fn) |
| 완료(finalize) 기본 | 각 `reportPath`가 scan 폴더 안의 실제 파일인지 열어 보고, 없으면 오류로 실패하는 것이 기본이다.[](source:py-wr) | `portfolioPath`가 가리키는 파일이 없으면 오류다.[](source:py-hard) |
| workbench의 봉인 전 완료 | workbench의 완료 경로가 `allow_missing_writeups=True`를 주고, 봉인되지 않은 scan이면 없는 write-up은 그 finding의 `writeup`만 버리고 `Skipped missing writeup for finding N` 경고를 남긴다. 그래서 write-up 파일이 없어도 링크만 빠진 채 완료될 수 있다.[](source:db-fin)[](source:py-wr)[](source:py-fin) | 이 경로에 같은 완화는 원문에 명시 없음. |
| 복구(`recover_unsealed`, completed가 아닌 봉인 전 scan) | 형식 오류, 중복 경로, 파일 없음을 모두 `Skipped malformed writeup for finding N` 경고로 버린다. 중복 경로 검사는 이 갈래에만 있다.[](source:py-rec-wr) | 형식이나 파일이 맞지 않으면 `hardening`을 버리고 `Skipped malformed hardening portfolio` 경고만 남긴다.[](source:py-rec-hard) |
| 봉인된 scan을 읽을 때 | 기본 profile은 write-up 파일 존재를 확인하고, `tracking` profile은 건너뛴다.[](source:sealed-ts) | 기본 profile은 `portfolioPath` 파일 존재를 확인한다. `tracking` profile은 건너뛴다.[](source:sealed-ts) |

위 표의 완료·복구·읽기 단계는 호스트 구현에서 확인한 지시상 동작이다. 실행하지 않았고, `workbench_db.py`와 `finalize_scan_contract.py`는 해당 함수 줄만 읽었다.

판정: 두 산출물은 봉인에 들지 않는 파생 문서이면서도, 경로가 manifest나 findings에 적히면 완료 때 파일 존재가 검사된다. 두 스킬이 "정확한 상대 경로를 돌려준다"는 지시를 어기면 링크가 빠지거나 완료가 실패한다. 근거는 schema 패턴, `portfolioPath` 상수, 완료·복구 경로의 확인 코드다.[](source:fr-opt)[](source:schema-find)[](source:schema-man)[](source:py-wr)[](source:py-hard)

## 어떤 파일을 만들고 누가 읽나? {#state}

| 파일·경로 | 쓰는 스킬·주체 | 읽는 스킬·주체 |
|---|---|---|
| `findings/<slug>/<slug>.md` · R21, R23 | `vulnerability-writeup`이 쓴다. 디렉터리 이름과 파일 이름은 소문자로 맞추고 `writeup.reportPath`로 경로를 돌려준다. scan 밖에서는 요청된 파일 이름을 따르고 없으면 standalone managed collection에 같은 상대 배치를 쓴다.[](source:w-deliv) | workbench 화면의 Evidence 영역이 `writeup.reportPath`와 형제 `poc/` 아래 파일을 나열한다. 완료와 읽기 단계는 파일 존재를 확인한다. 이 경로를 읽는 스킬은 원문에 명시 없음.[](source:ffd-ws)[](source:py-wr) |
| 보고서 옆 `findings/<slug>/poc/` · R21, R23 | `vulnerability-writeup`이 실제 PoC artifact가 있을 때만 만든다.[](source:w-deliv) | workbench Evidence 영역이 나열한다. 읽는 스킬은 원문에 명시 없음.[](source:ffd-ws) |
| `hardening/hardening.md` · R22 | `propose-security-hardening`이 scan의 artifact 도구로 저장한다. 일반 파일이어야 하고 `report.md`는 직접 고치지 않는다.[](source:h-auto) | draft 도구가 존재하면 manifest의 `hardening`에 넣고, 완료·읽기 단계가 존재를 확인한다. `report.md` 투영물이 링크한다. 읽는 스킬은 원문에 명시 없음.[](source:ts-hard-use)[](source:py-hard)[](source:sa-seal) |
| `hardening/proposals/<opportunity-id>.md`, `hardening/diagrams/<opportunity-id>-<view>.mmd` | `propose-security-hardening`이 큰 분석에서 선택적으로 만든다. 제안된 상대 경로이며 scan에 붙일 때 필수인 것은 `hardening/hardening.md` 하나뿐이다.[](source:h-fmt-port) | 원문에 명시 없음. |
| 원래 finding과 canonical scan artifact(`scan-manifest.json`, `findings.json`) | 두 스킬 모두 쓰지 않는다. 보강안은 `report.md`도 직접 고치지 않는다. 이 문서들은 봉인 목록에 넣지 않는다.[](source:w-intro)[](source:h-ev)[](source:sa-seal) | 두 스킬이 증거로 읽는다.[](source:w-claim)[](source:h-ev) |
| `scan.hardening.portfolioPath`, `writeup.reportPath` 필드 | 호출한 orchestrator가 draft에 적는다. 어느 scan이 호출하는지는 원문에 명시 없음(R22, R23 `불명`).[](source:w-deliv)[](source:h-auto) | 호스트 renderer가 링크와 화면을 만든다.[](source:fr-opt) |

완료되거나 봉인된 scan의 파일은 보조 파일 저장 도구로 고치지 못한다. 이후에 요청받은 write-up과 hardening은 standalone target collection을 쓰고, 돌려받은 파일을 따로 연결한다.[](source:st-sealed) 이 collection은 `targetPath`를 소유자 식별로 쓰며 scan을 시작하지 않는다.[](source:st-supp) 저장 `path`는 `artifacts/`, `findings/`, `hardening/` 아래 상대 경로여야 한다.[](source:st-path)

## 어떤 요청에 어느 스킬을 쓰고 무엇은 하지 않나? {#choose}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 두 스킬의 `agents/openai.yaml`에는 `interface`만 있고 `policy` 키가 없으며 `SKILL.md`에도 호출 제한 필드가 없다.[](source:w-front)[](source:h-front)[](source:w-yaml)[](source:h-yaml)

| 요청 | 스킬 | 경계 |
| --- | --- | --- |
| 취약점 하나를 다른 연구자가 확인할 보고서로 쓴다 | `vulnerability-writeup` | 원래 finding을 글로 강화하지 않는다. 근거가 finding과 어긋나면 어긋남을 설명하고 가까운 다른 약점으로 바꿔 쓰지 않는다.[](source:w-claim) {good:주 용도} |
| 여러 취약점의 disclosure campaign을 정리한다 | `vulnerability-writeup` | 취약점을 근본 원인과 영향받는 코드로 가려 중복을 찾는다. 따로 이해되는 finding은 따로 둔다. 규모가 크면 초안 작성을 위임하거나 독립 리뷰를 받을 수 있지만 전제 조건은 아니다.[](source:w-draft) |
| 같은 불변식 위반이 반복되는지 보고 구조 대안을 비교한다 | `propose-security-hardening` | 구조 프로젝트를 지어내지 않는다. 독립 finding이면 국소 수정이 낫다고 답한다.[](source:h-look) {good:주 용도} |
| 보강안을 구현해 달라고 한다 | `propose-security-hardening` | 분석 요청만으로는 구현을 허락받지 않는다. 구현을 요청받으면 선택한 설계와 제약을 이어받고, 원래 취약한 경로를 다시 검증한다. 요청이 선택을 이미 정했으면 별도 선택 절차를 요구하지 않는다.[](source:h-impl) {caution:구현은 별도} |
| PoC를 만들거나 돌린다 | `vulnerability-writeup` | 사용자가 허가한 범위 안에서만 한다. 실행하지 않은 명령, 로그, 스크린샷, crash, 유출 값을 지어내지 않는다.[](source:w-poc) {bad:허가 없는 대상} |
| 취약점을 실제로 고치고 검증한다 | 이 묶음 밖의 `fix-finding` | 이 묶음의 두 스킬은 하지 않는다. 보강안은 제안이 취약점을 고쳤다는 증명이 아니라고 명시한다.[](source:h-ev)[](source:fx-desc) |

@callout level=warning title="두 스킬은 scan이 끝났다고 가정하지 않는다"
| scan 최종 보고 중에는 canonical 문서가 아직 봉인 전일 수 있다. `propose-security-hardening`은 봉인을 scan 완료에 맡기고, 완료된 scan은 수정하지 않는다.[](source:h-ev) |
| write-up과 hardening은 완료 조건이 아니다. 이미 봉인된 scan에는 새 write-up이나 hardening 파일을 끼워 넣지 못하므로 standalone collection을 쓴다.[](source:fr-opt)[](source:st-sealed) |

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 폴더 원본 | `vulnerability-writeup`의 `SKILL.md` 5,571B와 `references/report-format.md` 4,482B, `agents/openai.yaml` 290B를 끝까지 읽었다. `propose-security-hardening`의 `SKILL.md` 5,026B와 `references/proposal-format.md` 4,144B, `agents/openai.yaml` 293B도 끝까지 읽었다.[](source:w-front)[](source:w-fmt-pack)[](source:h-front)[](source:h-fmt-port) |
| 플러그인 참조 | `references/artifact-storage.md` 7,947B는 55줄 전부 읽었다. `references/final-report.md` 12,135B는 Optional Documents 절만, `references/finding-detail-fields.md` 10,874B는 workspace 투영 절만, `references/scan-artifacts.md` 11,701B는 최종 산출물 표와 122줄만 읽었다. 표본만 읽은 파일은 이 3개다.[](source:st-own)[](source:fr-opt)[](source:ffd-ws)[](source:sa-path) |
| 상대 스킬 | `security-diff-scan/SKILL.md`와 `security-scan/SKILL.md`, `security-scan/references/desktop-scan.md`, `skills/README.md`는 전부 읽었다. `fix-finding/SKILL.md`는 description 줄만 읽었다.[](source:sd-diff)[](source:sc-desc)[](source:des)[](source:rd)[](source:fx-desc) |
| 구현 계약 | schema 3개와 `canonical-schemas.mts`, `artifact-scan-draft.ts`, `finalize_scan_contract.py`, `workbench_db.py`, `sealed-contract.ts`, `server.ts`는 관계가 가리키는 줄만 읽었다. 대형 파일의 나머지는 읽지 않았다.[](source:schema-draft)[](source:py-fin)[](source:db-fin)[](source:srv-ctx) |
| 관계 대조 | 원장 R19~R23, R34, R41, R60, R91을 원문 줄과 맞춰 봤다. 이 묶음의 두 스킬을 가리키는 scan 쪽 문장은 R19~R21의 세 줄이 전부였다(`security-diff-scan` 한 줄, `desktop-scan.md` 한 줄. `security-scan/SKILL.md`에는 없다). |
| 제외 | 번역본과 바이너리는 열지 않았다. 읽은 텍스트 파일은 총 24개이고, 그중 전부 읽은 파일 11개와 표본·해당 줄만 읽은 파일 13개다. 어떤 스크립트나 도구도 실행하지 않았고 외부 URL을 열지 않았다. |

이 묶음의 필수 자료(두 스킬 폴더와 `artifact-storage.md`)는 모두 읽어 부분 분석 표시는 하지 않는다. 호스트 구현 파일의 내부 동작은 이 페이지의 범위가 아니며 줄 범위로만 확인했다. 두 스킬의 내부 규칙과 수치는 `codex-security/plugins/codex-security/skills/vulnerability-writeup`과 `codex-security/plugins/codex-security/skills/propose-security-hardening` 페이지에 있다.

@callout level=open-question title="확인하지 못했거나 원문에 명시가 없는 부분"
| 어느 scan이 `vulnerability-writeup`과 `propose-security-hardening`을 호출하는지는 원문에 명시 없음. R22, R23은 `불명`으로 두었다. 호출하는 orchestrator는 이 트리에서 특정되지 않는다.[](source:w-deliv)[](source:h-front) |
| `vulnerability-writeup`의 보고서를 `propose-security-hardening`이 입력으로 받는 일은 서로 지목하지 않는 추론(R41)이다. 같은 요청에서 두 산출물을 이어 쓰는 방법은 원문에 명시 없음.[](source:w-front)[](source:h-intro) |
| `writeup.reportPath`의 draft 쓰기 단계 호스트 처리는 읽지 않았다. 완료·복구·읽기 단계만 확인했다.[](source:py-wr)[](source:sealed-ts) |
| `get_codex_security_scan_context`를 token 없이 부를 때의 동작은 핸들러를 읽지 않아 도구 설명 기준으로만 적었다. 자동 보고 동작은 지시상 동작이다.[](source:srv-ctx) |

분석 중 원본은 수정하지 않았다. 스킬 안의 지시(source 확인, PoC 실행, 파일 저장, 도구 호출)는 분석할 자료로만 읽고 실행하지 않았다. 자동 검증은 HTML 구조와 출처 해석만 확인한다. 사람 검토는 미실시다.
