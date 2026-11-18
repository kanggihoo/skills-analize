# 확정된 finding을 보고서와 보강안으로 정리할 때 두 스킬은 어떻게 이어지나? {#group-finding-reports}

에이전트는 개별 취약점은 `vulnerability-writeup`으로, 구조적 보강안은 `propose-security-hardening`으로 따로 정리한다. **두 스킬 사이에 강제 순서도 서로 부르는 문장도 없다.**[](source:vw-desc)[](source:ph-desc)

- `vulnerability-writeup`은 취약점 메모나 PoC를 다른 연구자가 확인할 수 있는 독립 보고서로 쓴다.[](source:vw-intro)
- `propose-security-hardening`은 개별 patch를 넘는 구조적 대안을 비교해 추천한다.[](source:ph-intro)
- 두 산출물은 scan 완료의 전제가 아니다. 사용자가 요청하거나 scan이 최종 보고에서 요구할 때만 만든다.[](source:diff-opt)[](source:final-opt)
- 스킬 내부 규칙은 각 스킬 개요 페이지에서 본다. 이 페이지는 순서, 주고받는 것, 공유 파일만 다룬다.

@answer scope="codex-security 컬렉션 · 묶음 finding-reports · 스킬 2개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source vw-desc title="보고서 스킬의 용도" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=3:3
@source vw-intro title="보고서의 목표" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=8:8
@source vw-deliv title="scan 안과 밖의 저장 위치" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=42:42
@source ph-desc title="보강안 스킬의 용도" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=3:3
@source ph-intro title="보강안의 목표와 시작 조건" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=8:8
@source ph-ctx title="scan context 읽기" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=12:12
@source ph-local title="국소 수정이 나은 경우" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=22:22
@source ph-out title="scan 최종 보고의 저장과 반환" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=41:46
@source ph-fmt title="scan 첨부 필드" path=codex-security/plugins/codex-security/skills/propose-security-hardening/references/proposal-format.md lines=53:53
@source diff-opt title="write-up과 hardening은 요청 산출물" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=32:32
@source desk title="desktop scan의 write-up handoff" path=codex-security/plugins/codex-security/skills/security-scan/references/desktop-scan.md lines=3:3
@source final-opt title="선택 산출물은 봉인 밖" path=codex-security/plugins/codex-security/references/final-report.md lines=51:53
@source rf-pack title="보고서 포장 경로" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/references/report-format.md lines=45:45
@source store-save title="보조 파일 저장 도구" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=13:13
@source store-late title="봉인된 scan 이후의 요청" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=56:56
@source sch-wr title="writeup.reportPath 패턴" path=codex-security/plugins/codex-security/schemas/findings.schema.json lines=89:98
@source sch-hd title="portfolioPath 고정값" path=codex-security/plugins/codex-security/schemas/scan-manifest.schema.json lines=132:134
@source mcp-ctx title="scan context 도구" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1348:1356

## 두 스킬은 어떤 순서로 쓰나? {#flow span=12}

두 스킬은 서로 독립이다. 한쪽 결과를 다른 쪽이 입력으로 쓸 수는 있어 보이나 원문은 순서를 정하지 않는다(원문에 명시 없음).[](source:ph-intro) 순서가 없고 반복도 없다는 것은 판정이다.

scan이 끝나기 전 최종 보고 단계에서는 호출한 orchestrator가 필요한 쪽을 부른다. 어느 orchestrator인지는 두 스킬 원문에 적혀 있지 않다.[](source:vw-deliv)[](source:ph-out)

@steps id=flow-steps
| s-writeup | vulnerability-writeup | 이 단계에서 하는 일: finding 하나나 취약점 묶음마다 독립 보고서를 쓴다.[](source:vw-intro) |
| s-hardening | propose-security-hardening | 이 단계에서 하는 일: 여러 finding의 공통 원인을 찾아 구조적 대안을 비교하고 추천한다.[](source:ph-intro) |

## 입력과 산출물은 어떻게 다른가? {#compare span=12}

| 비교 | vulnerability-writeup | propose-security-hardening |
| --- | --- | --- |
| 시작 입력 | 취약점 메모, 공개 보고서, PoC, 소스, Codex Security finding[](source:vw-desc) | 공개 보고서나 소스만으로 시작할 수 있다. scan은 선택이다[](source:ph-intro) |
| scan 안 산출물 | `findings/<slug>/<slug>.md`. 디렉터리명과 파일명이 같다[](source:vw-deliv)[](source:rf-pack) | `hardening/hardening.md` 파일 하나[](source:ph-out) |
| scan에 돌려주는 값 | `writeup.reportPath`[](source:vw-deliv) | `scan.hardening.portfolioPath`[](source:ph-out) |
| 경로를 강제하는 곳 | findings schema가 정규식 패턴으로 강제한다[](source:sch-wr) | manifest schema가 상수로 고정한다[](source:sch-hd) |
| scan 밖 산출물 | 요청된 파일 이름. 없으면 standalone 저장소의 같은 상대 경로[](source:vw-deliv) | 사용자가 정한 위치나 저장 정책의 기본 위치[](source:ph-out) |
| 만들지 않는 경우 | 원문에 명시 없음 | 구조적 기회가 없으면 국소 수정이 낫다는 설명만 담는다[](source:ph-out)[](source:ph-local) |
| scan context | 읽으라는 지시 없음(원문에 명시 없음) | scan ID가 있으면 `get_codex_security_scan_context`로 읽는다[](source:ph-ctx) |

## 스킬 사이와 주변에는 어떤 관계가 있나? {#relations span=12}

원장의 관계 중 이 묶음의 두 스킬이 걸린 행이다. 이 묶음에는 그림이 없어서 모든 행이 그림에서 생략되었다. 참고와 결과 전달은 자동 실행이 아니다.

| 누가 | 누구를 | 관계 | 언제 | 그림 |
| --- | --- | --- | --- | --- |
| `vulnerability-writeup` {#g-r41} | `propose-security-hardening` | 결과 전달 | 서로를 지목하지 않는다. 보고서를 보강안의 입력으로 쓸 수 있다는 추론이다. 필수 순서는 아니다[](source:ph-intro) | 그림에서 생략 |
| `codex-security/plugins/codex-security/skills/security-diff-scan` {#g-r19} | `vulnerability-writeup` | 참고 | 최종 보고에서 write-up은 요청된 선택 산출물이다. 스킬 이름은 적지 않는다[](source:diff-opt)[](source:final-opt) | 그림에서 생략 |
| `codex-security/plugins/codex-security/skills/security-diff-scan` {#g-r20} | `propose-security-hardening` | 참고 | 같은 문장에서 hardening plan도 요청된 선택 산출물이다. 스킬 이름은 적지 않는다[](source:diff-opt)[](source:final-opt) | 그림에서 생략 |
| `codex-security/plugins/codex-security/skills/security-scan` {#g-r21} | `vulnerability-writeup` | 참고 | Codex desktop scan에서만 handoff가 요구하는 per-finding write-up을 scan 완료 전에 마친다. 스킬 이름은 적지 않는다[](source:desk) | 그림에서 생략 |
| `propose-security-hardening` {#g-r22} | scan 스킬 후보 여럿(`security-scan`, `security-diff-scan`, `deep-security-scan`) | 참고 | 최상위 scan이 최종 보고 hardening 안내를 요청할 때 쓴다. 어느 scan인지 정하지 않아 해석 상태는 불명이다[](source:ph-desc)[](source:ph-out) | 그림에서 생략 |
| `vulnerability-writeup` {#g-r23} | scan 스킬 후보 여럿(`security-scan`, `security-diff-scan`, `deep-security-scan`) | 참고 | "During Codex Security final reporting"이라고만 적고 어느 scan인지 정하지 않는다. 해석 상태는 불명이다[](source:vw-deliv) | 그림에서 생략 |
| `propose-security-hardening` {#g-r91} | Codex Security MCP 도구 `get_codex_security_scan_context` | 참고 | workbench로 scan ID를 얻었을 때 이 도구로 context를 읽는다. 도구는 쓰기 annotation을 달고 있다[](source:ph-ctx)[](source:mcp-ctx) | 그림에서 생략 |
| `propose-security-hardening` {#g-r34} | `codex-security/plugins/codex-security/skills/fix-finding` | 참고 | 독립 finding은 국소 수정이 나을 수 있다고 한다. 근거 방식은 추론이다. 이름으로 지목하지 않는다[](source:ph-local) | 그림에서 생략 |
| 여러 스킬(두 스킬 포함) {#g-r60} | `codex-security/plugins/codex-security/references/artifact-storage.md` | 참고 | 파일을 저장하기 전에 읽고 저장 정책을 따르라고 한다. 두 스킬 모두 해당한다[](source:store-save) | 그림에서 생략 |

## 어떤 파일과 상태를 함께 쓰나? {#state span=12}

쓰는 주체는 원문이 지시한 동작이다. 실행으로 확인하지 않았다.

| 파일·상태 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `findings/<slug>/<slug>.md` | `vulnerability-writeup`이 scan 최종 보고 중 저장한다[](source:vw-deliv) | 호스트 renderer가 링크를 만든다. 읽는 스킬은 원문에 명시 없음[](source:final-opt) |
| `hardening/hardening.md` | `propose-security-hardening`이 scan의 artifact tool로 저장한다[](source:ph-out) | 호출한 orchestrator가 경로를 받아 `scan.hardening.portfolioPath`에 넣는다[](source:ph-out)[](source:ph-fmt) |
| 봉인된 scan의 파일 | 두 스킬 모두 고치지 않는다. 이후 요청은 standalone 모음에 쓴다[](source:store-late) | 원문에 명시 없음 |
| scan context | 원문에 명시 없음 | `propose-security-hardening`이 scan ID가 있을 때 읽는다[](source:ph-ctx) |

@callout level=open-question title="확인하지 못한 것"
| 두 스킬을 부르는 orchestrator와 write-up handoff를 만드는 코드는 이 플러그인 트리에서 특정하지 못했다.
| token 없이 `get_codex_security_scan_context`를 부를 때의 동작은 핸들러를 읽지 않아 확인하지 못했다.
| 보고서를 보강안의 입력으로 쓰는 흐름(R41)은 추론이며 원문이 서로를 지목하지 않는다.

읽은 원본: 두 스킬의 `SKILL.md`, `agents/openai.yaml`, `references/` 2개와 원장이 인용한 플러그인 참조·schema·도구 줄. 제외: 없음.
