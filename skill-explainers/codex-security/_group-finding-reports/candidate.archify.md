# finding과 disclosure를 보고서와 구조적 보강안으로 정리할 때 두 스킬을 어떻게 나눠 쓰나? {#finding-reports-page}

`vulnerability-writeup`은 취약점 하나나 disclosure 묶음을 다른 연구자가 확인할 수 있는 독립 보고서로 쓴다. `propose-security-hardening`은 개별 patch를 넘는 구조적 보강안을 대안 비교와 함께 제안한다.[](source:w-front)[](source:h-front) 두 스킬 사이에는 필수 순서도, 호출도, 위임도 원문에 없다. scan이 최종 보고에서 요청하거나 사용자가 요청할 때 각각 따로 쓴다.[](source:x-diff)[](source:x-desktop) 부분 분석이다. 플러그인 루트의 `references/artifact-storage.md`와 호스트의 artifact 도구는 컬렉션에 없어 읽지 못했다.[](source:w-storage)[](source:h-store)

- `vulnerability-writeup`은 원래 finding을 결론으로 삼지 않고 평가할 주장으로 본다. 공격자, 통제 입력, 경계, 실제 실패, 지원되는 영향을 먼저 확인한다.[](source:w-evid)
- `propose-security-hardening`은 공유된 invariant 위반이나 흩어진 통제 소유권처럼 구조 원인이 증거로 이어질 때만 쓴다. 독립 finding은 국소 수정이 나을 수 있다.[](source:h-look)
- 자동 보고에서 저장 위치가 다르다. 보고서는 `findings/<slug>/<slug>.md`, 보강안은 `hardening/hardening.md`다.[](source:w-deliv)[](source:h-auto)
- 어느 scan이 두 스킬을 호출하는지는 두 스킬 원문 모두에 명시 없음. 원장 R22, R23은 `불명`이다.[](source:w-deliv)[](source:h-front)

@answer scope="스킬 2개 · 관계 8개 · 호출하는 scan 불명 2건"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source w-front title="codex-security/vulnerability-writeup/SKILL.md · 5571B · frontmatter" path=codex-security/vulnerability-writeup/SKILL.md lines=1:4
@source w-intro title="codex-security/vulnerability-writeup/SKILL.md · 5571B · 목표" path=codex-security/vulnerability-writeup/SKILL.md lines=8:8
@source w-storage title="codex-security/vulnerability-writeup/SKILL.md · 5571B · 저장 정책 읽기" path=codex-security/vulnerability-writeup/SKILL.md lines=10:10
@source w-evid title="codex-security/vulnerability-writeup/SKILL.md · 5571B · 근거 확립" path=codex-security/vulnerability-writeup/SKILL.md lines=12:22
@source w-draft title="codex-security/vulnerability-writeup/SKILL.md · 5571B · 작성과 검토" path=codex-security/vulnerability-writeup/SKILL.md lines=24:30
@source w-poc title="codex-security/vulnerability-writeup/SKILL.md · 5571B · PoC 규칙" path=codex-security/vulnerability-writeup/SKILL.md lines=32:38
@source w-deliv title="codex-security/vulnerability-writeup/SKILL.md · 5571B · 전달 경로" path=codex-security/vulnerability-writeup/SKILL.md lines=42:42
@source w-yaml title="codex-security/vulnerability-writeup/agents/openai.yaml · 290B · UI 메타데이터" path=codex-security/vulnerability-writeup/agents/openai.yaml
@source w-fmt title="codex-security/vulnerability-writeup/references/report-format.md · 4482B · 보고서 개요" path=codex-security/vulnerability-writeup/references/report-format.md lines=1:41
@source w-fmt-pack title="codex-security/vulnerability-writeup/references/report-format.md · 4482B · Packaging 절" path=codex-security/vulnerability-writeup/references/report-format.md lines=43:47
@source h-front title="codex-security/propose-security-hardening/SKILL.md · 5026B · frontmatter" path=codex-security/propose-security-hardening/SKILL.md lines=1:4
@source h-intro title="codex-security/propose-security-hardening/SKILL.md · 5026B · 목표와 시작 입력" path=codex-security/propose-security-hardening/SKILL.md lines=8:8
@source h-scope title="codex-security/propose-security-hardening/SKILL.md · 5026B · 증거와 범위" path=codex-security/propose-security-hardening/SKILL.md lines=10:16
@source h-store title="codex-security/propose-security-hardening/SKILL.md · 5026B · 저장 정책 읽기" path=codex-security/propose-security-hardening/SKILL.md lines=18:18
@source h-look title="codex-security/propose-security-hardening/SKILL.md · 5026B · 구조 원인 찾기" path=codex-security/propose-security-hardening/SKILL.md lines=22:22
@source h-opts title="codex-security/propose-security-hardening/SKILL.md · 5026B · 기회마다 쓰는 항목" path=codex-security/propose-security-hardening/SKILL.md lines=24:35
@source h-out title="codex-security/propose-security-hardening/SKILL.md · 5026B · 출력 규모" path=codex-security/propose-security-hardening/SKILL.md lines=37:39
@source h-auto title="codex-security/propose-security-hardening/SKILL.md · 5026B · 자동 scan 보고" path=codex-security/propose-security-hardening/SKILL.md lines=41:48
@source h-impl title="codex-security/propose-security-hardening/SKILL.md · 5026B · 구현" path=codex-security/propose-security-hardening/SKILL.md lines=50:52
@source h-yaml title="codex-security/propose-security-hardening/agents/openai.yaml · 293B · UI 메타데이터" path=codex-security/propose-security-hardening/agents/openai.yaml
@source h-fmt title="codex-security/propose-security-hardening/references/proposal-format.md · 4144B · 제안 형식" path=codex-security/propose-security-hardening/references/proposal-format.md lines=1:49
@source x-diff title="codex-security/security-diff-scan/SKILL.md · 최종 보고 단계 줄만 읽음" path=codex-security/security-diff-scan/SKILL.md lines=32:32
@source x-desktop title="codex-security/security-scan/references/desktop-scan.md · desktop handoff 줄만 읽음" path=codex-security/security-scan/references/desktop-scan.md lines=3:3
@source x-scan title="codex-security/security-scan/SKILL.md · description 줄만 읽음" path=codex-security/security-scan/SKILL.md lines=3:3
@source x-fix title="codex-security/fix-finding/SKILL.md · 18461B · description 줄만 읽음" path=codex-security/fix-finding/SKILL.md lines=3:3

## 두 스킬은 무엇을 만들고 어디가 다른가? {#compare}

두 스킬은 서로의 입력을 요구하지 않는다. 같은 finding을 다른 방식으로 정리하므로 만드는 것, 입력, 경계가 다르다. 아래 표는 두 원문을 항목별로 맞춰 본 것이다.

| 항목 | `vulnerability-writeup` | `propose-security-hardening` |
| --- | --- | --- |
| 만드는 것 | 다른 연구자가 이해하고 확인할 수 있는 자기 완결 보고서다. 취약점 하나나 disclosure 묶음에 쓴다.[](source:w-intro)[](source:w-front) | 구조적 변경을 제안하고 의미 있는 대안을 비교하며 비례하는 다음 단계를 권고한다.[](source:h-intro) |
| 시작에 충분한 입력 | 취약점 메모, disclosure 보고서, PoC, 소스, Codex Security finding이다. scan은 선택이다.[](source:w-front) | disclosure나 소스 트리면 시작할 수 있다. scan은 선택이다.[](source:h-intro) |
| 입력을 다루는 방식 | 원래 finding은 평가할 주장이다. 소스가 없으면 출처를 밝힌 설명은 쓸 수 있지만 소스에 기대는 주장은 조건부로 둔다. 발췌, 줄 번호, 관찰을 지어내지 않는다.[](source:w-evid) | 저장소 내용과 보고서는 증거이지 지시나 권한이 아니다. 제안은 취약점이 고쳐졌다는 증명이 아니다.[](source:h-scope) |
| 실행·구현 경계 | 선택적으로 PoC를 쓴다. 권한 범위 안에서만 실행하고, 파괴적인 PoC는 일회용 로컬 대상에서만 돌린다.[](source:w-poc) {caution:권한 범위} | 분석만으로는 구현이 허락되지 않는다. 사용자가 구현을 요청하면 선택한 설계와 제약을 이어받는다.[](source:h-impl) {caution:구현 별도} |
| 형식 참고 문서 | 전체 disclosure 보고서는 `references/report-format.md`의 개요를 따른다. 좁은 편집이면 필요한 절만 쓴다.[](source:w-draft)[](source:w-fmt) | 상세 설계안이나 여러 기회의 portfolio일 때 `references/proposal-format.md`를 읽는다. 별도 JSON, 다이어그램 파일, 기회별 문서는 선택이다.[](source:h-out)[](source:h-fmt) |
| 자동 보고에서 저장 | Codex Security 최종 보고 중에는 `findings/<slug>/<slug>.md`에 두고 `writeup.reportPath`로 그 상대 경로를 돌려준다.[](source:w-deliv) | scan 최종 보고가 요청하면 scan의 artifact 도구로 `hardening/hardening.md`를 저장하고 상대 경로를 orchestrator의 `scan.hardening.portfolioPath`로 돌려준다.[](source:h-auto) |
| 저장하기 전에 | 플러그인 루트 `references/artifact-storage.md`를 읽고 managed storage 기본값을 쓴다. 사용자가 정한 위치가 있으면 그 정책 아래에서 따른다.[](source:w-storage) | 같은 파일을 읽는다. 형제 output 폴더를 지어내지 않고 완료된 scan을 고치지 않는다.[](source:h-store) |

판정 · 두 스킬은 같은 증거를 쓰는 병렬 산출물이라서 어느 쪽을 먼저 만들어도 원문이 막지 않는다. 근거는 두 스킬 어디에도 선행 스킬이나 후속 스킬 지시가 없다는 점이다.[](source:w-draft)[](source:h-out)

## 순서나 위임이 있나, 어떤 관계로 이어지나? {#relations}

순서, 선택지, 반복, 위임을 그릴 만한 원문 근거가 없어 이 묶음에는 다이어그램을 넣지 않았다. 원장이 정한 대로 입력, 산출물 경로, 요청 조건을 표로만 남긴다. 그림에서 뺀 관계는 표에 모두 남기고 `그림 없음`으로 표시했다.

| rel-id · 종류 | 방향과 조건 | 그림 반영 |
|---|---|---|
| R19 · 참고 | `security-diff-scan`에서 `vulnerability-writeup`으로 간다. 최종 보고 단계가 "Detailed write-ups and hardening plans are optional requested outputs"라고 한다. 사용자가 요청할 때만 만들고, 스킬 이름은 적지 않는다.[](source:x-diff)[](source:w-front) | 그림 없음 |
| R20 · 참고 | `security-diff-scan`에서 `propose-security-hardening`으로 간다. R19와 같은 문장이다. hardening plan은 요청된 선택 산출물이고 스킬 이름은 적지 않는다.[](source:x-diff)[](source:h-front) | 그림 없음 |
| R21 · 참고 | `security-scan`에서 `vulnerability-writeup`으로 간다. Codex desktop scan에서만 "per-finding write-ups"를 요구하는 handoff를 따르고 scan 완료 전에 마친다. 스킬 이름은 적지 않는다. 결과는 `findings/<slug>/<slug>.md`(`writeup.reportPath`)다.[](source:x-desktop)[](source:w-deliv) | 그림 없음 |
| R22 · 참고(불명) | `propose-security-hardening`에서 scan 스킬 후보 여럿(`security-scan`, `security-diff-scan`, `deep-security-scan`)으로 간다. "when a top-level scan requests final-report hardening guidance"라고만 적고 어느 scan인지 정하지 않는다. 자동 보고에서는 `hardening/hardening.md`를 저장하고 상대 경로를 orchestrator에 돌려준다.[](source:h-front)[](source:h-auto) | 그림 없음 |
| R23 · 참고(불명) | `vulnerability-writeup`에서 scan 스킬 후보 여럿으로 간다. "During Codex Security final reporting"이라고만 적고 어느 scan인지 정하지 않는다. 보고서는 `findings/<slug>/<slug>.md`에 두고 `writeup.reportPath`로 돌려준다.[](source:w-deliv) | 그림 없음 |
| R41 · 산출물 호환(추론) | `vulnerability-writeup`에서 `propose-security-hardening`으로 간다. 보강안은 "A supplied disclosure or source tree is enough to begin"이라 하고, `vulnerability-writeup`은 disclosure 보고서를 만든다. 서로를 지목하지 않는다.[](source:w-front)[](source:h-intro) | 그림 없음 |
| R34 · 참고(추론) | `propose-security-hardening`에서 `fix-finding`으로 간다. 개별 patch를 넘는 대안을 다루며 "Independent findings may be best handled by local fixes"라 하고 어떤 tactical fix가 여전히 필요한지 적는다. 이름으로 `fix-finding`을 지목하지 않는다. 상대 스킬은 `remediate-finding` 묶음이다.[](source:h-front)[](source:h-look)[](source:h-opts)[](source:x-fix) | 그림 없음 |
| R60 · 참고(범위 밖) | 이 두 스킬을 포함한 여러 스킬이 플러그인 루트 `references/artifact-storage.md`를 읽고 storage policy를 따르라고 한다. 컬렉션에 이 파일이 없어 읽지 못했다.[](source:w-storage)[](source:h-store) | 그림 없음 |

R21은 Codex desktop scan 한 곳에서만 write-up을 요구한다. 같은 폴더의 `security-scan` 본문(`SKILL.md`)에는 write-up이나 hardening 문장이 없다.[](source:x-scan) R22와 R23의 `불명`은 두 스킬이 호출한 scan을 이름으로 가리키지 않기 때문이며, 우선순위나 호출 조건을 더 정한 문장은 원문에 없다.

## 어떤 파일을 만들고 누가 읽나? {#state}

| 파일·경로 | 쓰는 스킬·주체 | 읽는 스킬·조건 |
|---|---|---|
| `findings/<slug>/<slug>.md` · R21, R23 | `vulnerability-writeup`이 쓴다. 디렉터리 이름과 파일 이름은 소문자로 맞추고 `writeup.reportPath`로 경로를 돌려준다.[](source:w-deliv) | 호출한 orchestrator와 호스트 workbench가 경로를 받는다. 이 경로를 읽는 스킬은 원문에 명시 없음. R41은 보강안이 disclosure 보고서를 입력으로 받을 수 있다는 추론이다.[](source:w-deliv)[](source:h-intro) |
| 보고서 옆 `poc/` 디렉터리 | `vulnerability-writeup`이 실제 PoC artifact가 있을 때만 만든다.[](source:w-deliv) | 원문에 읽는 스킬 명시 없음. |
| `hardening/hardening.md` · R22 | `propose-security-hardening`이 scan의 artifact 도구로 저장한다. 일반 파일이어야 하고 `report.md`는 직접 고치지 않는다.[](source:h-auto) | orchestrator가 `scan.hardening.portfolioPath`로 첨부한다. 읽는 스킬은 원문에 명시 없음.[](source:h-auto) |
| `hardening/proposals/<opportunity-id>.md`, `hardening/diagrams/<opportunity-id>-<view>.mmd` | `propose-security-hardening`이 선택적으로 만든다. 제안된 상대 경로이며 필수는 아니다.[](source:h-fmt) | 원문에 명시 없음. |
| 원래 finding과 canonical scan artifact | 쓰지 않는다. 두 스킬 모두 원본을 바꾸지 않고, 보강안은 `report.md`도 직접 고치지 않는다.[](source:w-storage)[](source:h-scope)[](source:h-auto) | 두 스킬이 모두 증거로 읽는다.[](source:w-evid)[](source:h-scope) |

두 경로는 이름과 위치가 다르다. 한쪽 산출물이 다른 쪽 경로에 들어가는 규칙은 원문에 명시 없음. 사용자가 저장 위치를 지정하면 두 스킬 모두 저장 정책 아래에서 그 위치를 따른다.[](source:w-storage)[](source:h-store)

## 어떤 요청에 어느 스킬을 쓰고, 무엇은 하지 않나? {#choose}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 두 스킬의 `SKILL.md`에는 `disable-model-invocation` 같은 호출 제한 필드가 없고 `agents/openai.yaml`에도 `policy`가 없다.[](source:w-front)[](source:h-front)[](source:w-yaml)[](source:h-yaml)

| 요청 | 스킬 | 경계 |
| --- | --- | --- |
| 취약점 하나를 다른 연구자가 확인할 보고서로 쓴다 | `vulnerability-writeup` | 원래 finding을 더 강하게 쓰지 않는다. 증거가 finding과 어긋나면 어긋남을 설명하고 가까운 다른 약점으로 바꿔 쓰지 않는다.[](source:w-evid) {good:주 용도} |
| 여러 취약점의 disclosure campaign을 정리한다 | `vulnerability-writeup` | 취약점을 근본 원인과 영향 코드로 구분해 중복을 가린다. 따로 이해될 finding은 따로 둔다.[](source:w-draft) |
| 같은 invariant 위반이 반복되는지 보고 구조 대안을 비교한다 | `propose-security-hardening` | 구조적 프로젝트를 지어내지 않는다. 독립 finding이면 국소 수정이 낫다고 답한다.[](source:h-look) {good:주 용도} |
| 보강안을 구현해 달라고 한다 | `propose-security-hardening` | 분석 요청만으로는 구현을 허락받지 않는다. 구현을 요청받았을 때만 선택한 설계로 진행한다.[](source:h-impl) {caution:구현 별도} |
| PoC를 만들거나 돌린다 | `vulnerability-writeup` | 사용자의 권한 범위 안에서만 한다. 공개, 외부, 운영 대상은 대상별 허가가 필요하다. 실행하지 않은 로그나 결과를 지어내지 않는다.[](source:w-poc) {bad:허가 없는 대상} |

@callout level=warning title="두 스킬은 취약점이 고쳐졌다고 증명하지 않는다"
| `propose-security-hardening`은 제안이 취약점을 고쳤다는 증명이 아니라고 명시한다. 취약점을 실제로 고치고 검증하는 스킬은 이 묶음 밖의 `fix-finding`이다.[](source:h-scope)[](source:x-fix) |
| `vulnerability-writeup`의 보고서는 제안 코드와 shipped fix, 확인된 fixed release를 구분해 적는다.[](source:w-fmt) |

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 폴더 원본 | `vulnerability-writeup`의 `SKILL.md` 5,571B와 `references/report-format.md` 4,482B(47줄), `agents/openai.yaml` 290B를 끝까지 읽었다. `propose-security-hardening`의 `SKILL.md` 5,026B와 `references/proposal-format.md` 4,144B(59줄), `agents/openai.yaml` 293B도 끝까지 읽었다.[](source:w-front)[](source:w-fmt)[](source:h-front)[](source:h-fmt) |
| 상대 파일 | 관계 근거로 `security-diff-scan`, `security-scan`, `fix-finding`의 `SKILL.md`와 `security-scan/references/desktop-scan.md`를 해당 줄만 읽었다.[](source:x-diff)[](source:x-scan)[](source:x-fix)[](source:x-desktop) |
| 관계 대조 | 원장 R19~R23, R34, R41과 범위 밖 R60을 원문 줄과 맞춰 봤다. 세 scan 스킬에서 `write-up`, `writeup`, `hardening`을 검색한 결과 R19~R21의 세 줄이 전부였다. |
| 제외 | 번역본과 바이너리는 없다. 전부 읽은 파일은 6개이고 부분 읽음 파일은 4개(위 상대 파일)다. |

원문의 입력 규율, 근거 규칙, PoC 금지 사항, 자동 보고 경로와 반환 필드, 구현 경계를 모두 대조했다. 스킬 내부 규칙과 수치는 스킬 페이지에 있다.

@callout level=open-question title="확인하지 못했거나 원문에 명시가 없는 부분"
| 어느 scan이 `vulnerability-writeup`과 `propose-security-hardening`을 호출하는지는 원문에 명시 없음. R22, R23은 `불명`으로 두었다.[](source:w-deliv)[](source:h-front) |
| 플러그인 루트 `references/artifact-storage.md`는 읽지 못했다. 저장 경로와 managed storage 기본값을 더 정하는지는 알 수 없다. 관련 원장 행은 R60이다.[](source:w-storage)[](source:h-store) |
| `get_codex_security_scan_context`, scan의 artifact 도구, `writeup.reportPath`와 `scan.hardening.portfolioPath`를 소비하는 호스트 구현은 컬렉션에 없어 실행하지 않았다. 자동 보고 동작은 지시상 동작이다.[](source:h-scope)[](source:h-auto)[](source:w-deliv) |
| `vulnerability-writeup`의 보고서를 `propose-security-hardening`이 입력으로 받는 일은 서로 지목하지 않는 추론(R41)이다. 같은 요청에서 두 산출물을 어떻게 이어 쓰는지는 원문에 명시 없음.[](source:w-front)[](source:h-intro) |

분석 중 원본은 수정하지 않았다. 스킬 안의 지시(소스 확인, PoC 실행, 파일 저장, 도구 호출)는 분석할 자료로만 읽고 실행하지 않았다. 자동 검증은 HTML 구조와 출처 해석만 확인한다. 사람 검토는 미실시다.
