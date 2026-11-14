# finding-discovery는 취약점 후보를 어디까지 찾고 어디서 멈추나? {#finding-discovery-page}

`finding-discovery`는 위협 모델과 보안 정책을 근거로 악용 가능해 보이는 취약점 후보를 찾아 근거와 함께 남긴다. 최종 심각도는 정하지 않고, 증명이 모자란 후보도 validation으로 넘긴다.[](source:intro)[](source:evid6) 전체 PR, commit, branch, patch, 저장소 scan을 시작하는 1차 트리거는 아니다.[](source:front)

- 공격자가 조작하는 입력이나 권한 있는 동작을 통제 지점에서 sink까지 따라가고, 통제가 없거나 우회되거나 엉뚱한 값에 걸린 이유를 적는다.[](source:evid1)
- 효과 있는 guard와 containment는 반증으로 남긴다. 안전한 sibling 구현이 있어도 이 후보 경로가 안전해지지 않는다.[](source:evid2)
- crash, 위험한 API, 선택 기능, 빠진 check는 단서일 뿐 finding이 아니다. 실행 가능한 재현이 없다는 이유로 후보를 버리지 않는다.[](source:evid6)
- discovery 안에서 validation과 attack-path 단계를 반복하지 않는다.[](source:split)

@answer scope="로컬 원본 분석 · 스킬 실행 없음 · 부분 분석(플러그인 루트 reference 미확인)"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source full title="codex-security/finding-discovery/SKILL.md · 5076B · 스킬 본문(원본)" path=codex-security/finding-discovery/SKILL.md
@source front title="codex-security/finding-discovery/SKILL.md · 5076B · frontmatter" path=codex-security/finding-discovery/SKILL.md lines=1:4
@source intro title="codex-security/finding-discovery/SKILL.md · 5076B · 목적과 읽을 reference" path=codex-security/finding-discovery/SKILL.md lines=8:10
@source mode title="codex-security/finding-discovery/SKILL.md · 5076B · workflow 선택" path=codex-security/finding-discovery/SKILL.md lines=14:20
@source evid1 title="codex-security/finding-discovery/SKILL.md · 5076B · 근거 기준 1" path=codex-security/finding-discovery/SKILL.md lines=24:24
@source evid2 title="codex-security/finding-discovery/SKILL.md · 5076B · 근거 기준 2" path=codex-security/finding-discovery/SKILL.md lines=25:25
@source evid3 title="codex-security/finding-discovery/SKILL.md · 5076B · 근거 기준 3" path=codex-security/finding-discovery/SKILL.md lines=26:26
@source evid4 title="codex-security/finding-discovery/SKILL.md · 5076B · 근거 기준 4" path=codex-security/finding-discovery/SKILL.md lines=27:27
@source evid5 title="codex-security/finding-discovery/SKILL.md · 5076B · 근거 기준 5" path=codex-security/finding-discovery/SKILL.md lines=28:28
@source evid6 title="codex-security/finding-discovery/SKILL.md · 5076B · 근거 기준 6" path=codex-security/finding-discovery/SKILL.md lines=29:29
@source split title="codex-security/finding-discovery/SKILL.md · 5076B · 작업 분할과 금지" path=codex-security/finding-discovery/SKILL.md lines=31:31
@source out title="codex-security/finding-discovery/SKILL.md · 5076B · 후보 출력" path=codex-security/finding-discovery/SKILL.md lines=35:43
@source done title="codex-security/finding-discovery/SKILL.md · 5076B · 계약과 종료" path=codex-security/finding-discovery/SKILL.md lines=45:45
@source yaml title="codex-security/finding-discovery/agents/openai.yaml · 220B · 표시 이름과 기본 prompt" path=codex-security/finding-discovery/agents/openai.yaml
@source dscan title="codex-security/security-diff-scan/SKILL.md · 5405B · 위임하는 쪽(원본)" path=codex-security/security-diff-scan/SKILL.md lines=30:30
@source scan21 title="codex-security/security-scan/SKILL.md · 2972B · 21줄만 읽음" path=codex-security/security-scan/SKILL.md lines=21:21
@source ledger title="codex-security/security-scan/references/scan-artifacts-and-ledger.md · 7021B · 1줄부터 3줄만 읽음" path=codex-security/security-scan/references/scan-artifacts-and-ledger.md lines=1:3
@source tm title="codex-security/threat-model/SKILL.md · 2986B · 위협 모델 반환" path=codex-security/threat-model/SKILL.md lines=25:25
@source val title="codex-security/validation/SKILL.md · 4619B · 후보를 이어받는 쪽" path=codex-security/validation/SKILL.md lines=8:8
@source val21 title="codex-security/validation/SKILL.md · 4619B · scan 통합" path=codex-security/validation/SKILL.md lines=21:21
@source sec8 title="codex-security/define-security-policy/SKILL.md · 5982B · 8줄만 읽음" path=codex-security/define-security-policy/SKILL.md lines=8:8
@source lock title="codex-security/skills-lock.json · 6525B · finding-discovery 항목" path=codex-security/skills-lock.json lines=46:51

## 언제 켜지고 어떤 방식으로 도나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 문구와 정확히 일치해야 켜진다는 뜻은 아니다.

`disable-model-invocation` 같은 호출 제한 필드는 원문에 명시 없음이다. `agents/openai.yaml`에도 `policy`가 없다.[](source:front)[](source:yaml)

@code source=front language=yaml

| 상황 | 에이전트의 행동 |
|---|---|
| 실행 중인 compact diff | `list_codex_security_review_items`로 받은 inventory의 변경 파일을 모두 검토하고, 후보 전체를 `record_codex_security_discovery_candidates`로 한 번에 기록한다. 순위 worklist, finding별 장부, receipt, discovery 보고서는 만들지 않는다.[](source:mode) |
| compact inventory 없이 diff를 단독으로 발견 | `../security-scan/references/scan-artifacts-and-ledger.md`로 변경 파일 worklist와 단계별 산출물을 만든다. 그 파일은 Standard, Deep, compact Workbench Diff에서는 쓰지 않는다고 스스로 밝힌다.[](source:mode)[](source:ledger) |
| 저장소 단독 발견 | 근거 기준을 승인된 source에 적용하고 후보와 coverage 한계를 돌려준다. scan을 시작하지 않고 diff worklist 파이프라인도 돌리지 않는다.[](source:mode) |
| Standard scan, Deep worker | 이 스킬 대신 coordinator의 자체 prompt를 쓴다.[](source:mode)[](source:scan21) |

diff를 볼 때는 삭제된 파일을 baseline revision에서 확인하고, 바뀐 공유 통제가 영향을 주면 sibling 호출자까지 넓힌다. 관련 없는 저장소 전체 audit으로는 넓히지 않는다.[](source:mode)

원문이 정한 사용자 개입은 하나다. 명시적으로 요구된 입력이 없어 분석 자체가 막힐 때만 그 입력을 요청한다.[](source:intro) 저장하기 전에 `../../references/artifact-storage.md`를, 소스 검토 전에 `../../references/security-guidance.md`를 읽고, 위임한 assignment를 포함해 검토하는 경로마다 정책을 해석한다.[](source:intro)

## 무엇을 후보로 남기나? {#evidence}

| 기준 | 내용 |
|---|---|
| 경로 추적 | 공격자가 조작하는 입력이나 권한 있는 동작을 가장 가까운 통제를 거쳐 sink와 보안 영향까지 따라간다. 통제가 없거나 우회되거나 엉뚱한 값·경계에 걸린 이유를 설명한다.[](source:evid1) |
| 도달 가능성 | runtime 도달 가능성과 배포 가정을 확인한다. 효과 있는 guard와 containment는 반증으로 기록한다. 안전한 sibling 구현은 이 후보 경로가 안전하다는 근거가 아니다.[](source:evid2) |
| 위치 보존 | root control 위치와 entrypoint, wrapper, concrete implementation, sink를 남긴다. 주장이 여러 구현을 다루면 구현을 직접 확인하고 전부 영향받는다고 단정하지 않는다.[](source:evid3) |
| 인스턴스 | 독립적으로 도달 가능한 취약 인스턴스는 따로 지정할 수 있게 둔다. 같은 source, control, sink, impact의 중복 관찰은 합치되 영향 위치와 원래 candidate ID를 모두 남긴다. 겉모양만 다른 변형은 쪼개지 않는다.[](source:evid4) |
| seed 추적 | 사용자나 advisory가 준 seed는 정확한 source와 control까지 따라간다. 뒷받침, 반증, 미해결 중 어느 쪽인지 기록한다. 같은 계열의 이웃 문제로 seed를 닫지 않는다. 승인된 자료만 쓰고 advisory 링크는 허락 없이 가져오지 않는다.[](source:evid5) |
| 영향과 단서 | 구체적 보안 영향과 유지보수·견고성 문제를 구분한다. 증명 간극이 있는 그럴듯한 후보는 근거를 지어내지 말고 validation으로 넘긴다.[](source:evid6) |

가능하면 독립된 검토 assignment를 가용한 worker에게 나눠 주고, 부모가 남은 일을 직접 검토하고 중복을 정리한다. discovery 안에서 validation과 attack-path 단계를 반복하지 않는다.[](source:split)

## 후보에는 무엇을 적나? {#output}

| 항목 | 내용 |
|---|---|
| ID와 제목 | 안정적인 candidate ID와 제목. seed나 ledger ID, advisory 참조는 그대로 보존한다.[](source:out) |
| 위치 | 파일과 줄. 필요하면 `entrypoint/wrapper`, `root_control`, `sink`, `concrete_implementation` 라벨을 붙인다.[](source:out) |
| 경로 | 공격자 조작 source, 가장 가까운 control, sink나 깨진 control, 그럴듯한 영향, 이들을 잇는 source 근거.[](source:out) |
| 반증과 간극 | 반증, 배포 전제 조건, 미해결 질문, validation이 확립해야 할 것.[](source:out) |
| 식별자 | 아는 CWE ID, 없으면 빈 목록. 저장소나 범위 지정 경로의 인스턴스는 호출자가 요구하면 `<family>:<file>:<line>` 형식의 instance key. diff finding은 버그가 diff와 겹치는 곳에만 `relevant_lines`.[](source:out) |

종료 조건은 두 가지다. 배정된 소스 검토와 구체적 후속 조사를 모두 정리했거나, 끝내지 못한 검토를 솔직하게 기록한다. 그럴듯한 후보가 없으면 실제로 검토한 범위와 한계를 담아 없다는 결과를 돌려준다.[](source:done)

구조화된 후보 계약은 호출자의 것을 쓴다. legacy diff는 `../../references/scan-artifacts.md`가 정한 경로에 discovery 보고서와 receipt를 저장하며, 이후 단계는 자기 근거와 receipt를 따로 소유한다.[](source:done)

## 흐름 속 위치는 어디인가? {#position}

@workflow id=position-flow title="위협 모델에서 validation으로"
| before | threat-model | backend | source:tm |
| current | finding-discovery | backend | source:evid1 |
| after | validation | backend | source:val |
| before > current | 산출물 호환 R10 | dashed |
| current > after | 산출물 호환 R11 | emphasis |

@steps
| highlight | finding-discovery | diff scan이 compact 모드로 한 번 실행한다. 후보는 validation이 candidate ID와 discovery 필드를 보존해 이어받는다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R07 · 내부 위임 | `security-diff-scan`이 변경 파일 inventory 전체에 compact diff 모드로 실행한다. 후보는 한 번에 기록한다. 순위 목록, finding별 장부, discovery 보고서는 만들지 않는다.[](source:dscan) |
| R10 · 산출물 호환 | 위협 모델과 정책을 근거로 쓴다. 이 순서를 강제하는 곳은 diff scan뿐이고, 모델 없이 단독 호출해도 되는지는 원문에 명시 없음이다.[](source:intro)[](source:dscan) |
| R11 · 산출물 호환 | validation이 후보 ID와 discovery 필드를 보존해 이어받는다. discovery 안에서는 validation을 반복하지 않는다.[](source:split)[](source:val) |
| R15 · 참고 | Standard와 Deep worker는 이 단계 스킬이 아니라 coordinator의 자체 prompt를 쓴다.[](source:mode)[](source:scan21) |
| R18 · 참고 | compact inventory 없는 단독 diff만 `scan-artifacts-and-ledger.md`를 읽는다.[](source:mode)[](source:ledger) |
| R44 · 공유 상태 | `SECURITY.md`는 정책 맥락이고 실행 지시가 아니다. 이 스킬은 검토하는 경로마다 해당 정책을 찾아 쓴다. 선후 관계는 없다.[](source:sec8)[](source:intro) |

전체 흐름은 색인 기준 `_group-scan-vulnerabilities/scan-vulnerabilities.html`을 가리킨다. 묶음 페이지는 별도 단계에서 만든다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `codex-security/finding-discovery/SKILL.md` 5,076B와 `agents/openai.yaml` 220B를 끝까지 읽었다.[](source:full)[](source:yaml) |
| 관계 근거 | `security-diff-scan` 5,405B는 끝까지 읽었다. `security-scan`, `scan-artifacts-and-ledger.md`, `threat-model`, `validation`, `define-security-policy`는 인용한 줄 범위만 읽었다. `skills-lock.json`은 이 스킬 항목 46~51줄을 확인했다.[](source:lock) |
| 부분 읽음 | 파일 5개(`security-scan`, `scan-artifacts-and-ledger.md`, `threat-model`, `validation`, `define-security-policy`)는 줄 범위만 읽었다. |
| 제외 | 번역본 없음. 바이너리 없음. |

원문의 workflow 3가지, 근거 기준 6개, 후보 출력 항목, 종료 조건, 호출 제한, 사용자 개입 조건을 모두 대조했다. 이 스킬 본문에 수치 기준은 없다.

@callout level=open-question title="읽지 못한 필수 자료"
| 이 스킬은 `../../references/artifact-storage.md`, `security-guidance.md`, `scan-artifacts.md`를 읽으라고 한다. 컬렉션에 플러그인 루트의 `references/`가 없어서 저장 정책, 정책 해석 규칙, legacy diff의 보고서·receipt 경로는 확인하지 못했다. 부분 분석이다.[](source:intro)[](source:done) |

@callout level=open-question title="실행으로 확인하지 않은 부분"
| `list_codex_security_review_items`와 `record_codex_security_discovery_candidates`는 호스트 도구라서 호출하지 않았다. 도구가 후보를 어떻게 저장하는지는 원문에 명시 없음이다.[](source:mode) |

분석 중 원본은 수정하지 않았고, 스킬의 어떤 명령도 실행하지 않았다.
