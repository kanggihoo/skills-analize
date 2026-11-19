# verify-fix — 보안 수정이 실제로 취약점을 막았는지 파일을 바꾸지 않고 판정한다 {#overview}

verify-fix는 보안 수정이 현재 checkout에서 원래 취약점을 막았는지, 저장소를 건드리지 않고 finding마다 판정하게 하는 스킬이다.[](source:obj)

- 사용자가 보안 수정의 검증을 명시적으로 요청할 때만 켜진다. 수정 구현이나 테스트 실행 요청만으로는 켜지지 않는다. 검증은 기본 `standard`이고 호출자가 `static`을 고르면 소스와 diff만 읽는다.[](source:when)[](source:mode)
- 결과는 finding마다 하나씩이다. 판정은 `fixed`, `still_vulnerable`, `inconclusive` 셋 중 하나이고 근거가 붙는다. 대화에서는 Markdown, 자동 계약에서는 JSON 객체 하나로 낸다.[](source:wf5)[](source:res)
- 관계: fix-finding, assess-patch-risk와 대안 관계이고 직접 연결은 없다. 정적 근거 평가 방법은 공유 참조 문서에서 읽는다.
- 하지 않는 것: 저장소 파일의 생성·수정·삭제, patch 적용, commit, artifact 쓰기, issue tracker 수정을 하지 않는다. 읽기 전용 경계를 약하게 해 더 강한 판정을 내지도 않는다.[](source:obj)[](source:never)

@answer scope="codex-security/plugins/codex-security/skills/verify-fix · 원본 파일 3개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source fm title="frontmatter: name과 description" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=1:4
@source when title="언제 쓰나" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=8:10
@source obj title="목표와 읽기 전용 경계" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=12:14
@source ref title="정적 근거 평가 참조" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=18:18
@source mode title="검증 모드 standard와 static" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=20:20
@source wf1 title="1단계: 원래 취약점 파악" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=24:24
@source wf2 title="2단계: 구성요소 확인" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=25:25
@source wf3 title="3단계: exploit 경로 추적" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=26:26
@source wf4 title="4단계: 읽기 전용 실행 검사" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=27:27
@source wf5 title="5단계: finding별 결과" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=28:28
@source res title="결과 형식" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=30:46
@source verdict title="세 판정의 조건" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=48:50
@source never title="금지" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=52:52
@source yaml title="openai.yaml" path=codex-security/plugins/codex-security/skills/verify-fix/agents/openai.yaml lines=1:4
@source sfa title="정적 근거 평가: 튜플" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=3:21
@source sfa-conf title="정적 근거 평가: 확신도" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=52:61
@source fixf title="fix-finding의 모드와 Verify 단계" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=16:20
@source fixv title="fix-finding의 Verify 단계" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=76:76
@source apr title="assess-patch-risk 설명" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=3:3

## 어떻게 동작하나 {#flow span=12}

절차형이다. 5단계 지시를 다섯 노드로 그렸다. 앞의 둘은 맥락을 잡고, 가운데 둘은 근거를 모으고, 마지막이 판정한다.[](source:wf1)

@workflow id=flow-diagram title="verify-fix 흐름"
| lane ctx | 맥락 잡기 |
| lane evid | 근거 모으기 |
| lane out | 판정 |
| orig | 원래 취약점 파악 | backend | ctx | source:wf1 |
| find | 구성요소 찾기 | backend | ctx | source:wf2 |
| trace | exploit 경로 추적 | backend | evid | source:wf3 |
| run | 읽기 전용 실행 검사 | backend | evid | source:wf4 |
| result | finding별 판정 | backend | out | source:wf5 |
| orig > find | |
| find > trace | |
| trace > run | standard | dashed |
| trace > result | static 또는 실행 불가 |
| run > result | |

@steps id=flow-steps
| s-orig | 원래 취약점 파악 | **입력** finding 목록 · **참조** `../../references/static-finding-assessment.md` · **출력** 원래 취약점, 전제 조건, 보안 경계, 유지할 정상 동작. **처리** 에이전트가 공격자 입력(source), 보안 통제, 민감한 sink, 도달 경로, 반증, 증명 간극을 밝힌다. 호출자가 그 참조를 prompt에 이미 줬으면 다시 읽지 않는다.[](source:wf1)[](source:ref)[](source:sfa) | flow-diagram | orig |
| s-find | 구성요소 찾기 | **입력** 현재 checkout · **출력** 영향받는 구성요소의 현재 위치. **처리** 에이전트가 파일이 없어졌거나 줄이 지워졌거나 함수 이름이 바뀐 것을 수리의 증거로 치지 않고, 옮겨진 코드를 따라간다.[](source:wf2) **다음** 저장소가 맞지 않거나 원래 맥락이 없으면 `inconclusive`다.[](source:verdict) | flow-diagram | find |
| s-trace | exploit 경로 추적 | **입력** 현재 구현·원래 취약 경로 · **출력** 경로가 아직 닿는지에 대한 소스 근거. **처리** 에이전트가 원래 exploit 경로를 현재 구현에 따라 추적하고, 가장 가까운 통제와 동등한 경로, 있을 법한 우회를 본다. `static`에서는 호출자와 기존 테스트도 소스로 읽어 정상 동작을 확인한다.[](source:wf3)[](source:mode) **다음** `static`에서는 설치, build, 테스트, 재현, 앱 실행을 하지 않고, 평가가 정적 평가이며 런타임 검사를 하지 않았다고 근거에 적는다.[](source:mode) | flow-diagram | trace |
| s-run | 읽기 전용 실행 검사 | **입력** 원래 재현 방법·회귀 검사·정상 동작 검사 · **실행** 저장소를 바꾸지 않고 돌릴 수 있는 것만(`standard`) · **출력** 실행 결과 또는 정적 근거. **처리** 에이전트가 저장소 수정 없이 돌릴 수 있는 검사만 돌리고, 못 돌리면 정확한 정적 근거를 남긴다.[](source:wf4) | flow-diagram | run |
| s-result | finding별 판정 | **입력** 앞 단계의 근거 · **출력** 요청된 순서의 finding별 결과(`id`, `status`, `evidence`). **처리** 닫힌 ticket, 관련 없는 통과 테스트, 새 scan finding이 없다는 사실은 증명으로 치지 않고 아래 조건으로 판정한다.[](source:wf5)[](source:verdict) **다음** JSON을 요청받았거나 자동 계약이 있으면 `results` 배열이 든 객체 하나만 낸다.[](source:res) | flow-diagram | result |

판정은 세 가지다. 결과 노드의 조건은 아래 표와 같다.

| 판정 | 쓰는 조건 |
| --- | --- |
| `fixed` | 원래 보안 경계가 닫혔고 정상 동작이 유지된다는 근거가 있을 때만 쓴다.[](source:verdict) |
| `still_vulnerable` | 원래 취약 경로가 여전히 닿는다는 근거가 있을 때만 쓴다.[](source:verdict) |
| `inconclusive` | 저장소 불일치, 원래 맥락 부재, 모드가 요구하는 검사를 못 돌림, 증명되지 않은 정상 통제, 그 밖의 중대한 증명 간극일 때 쓴다.[](source:verdict) |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자의 명시적 검증 요청이나 `$verify-fix` 직접 호출(모델 판단, description). description은 fix 구현 중 자동 호출을 막는다. 호출 제한 필드는 frontmatter에 없다.[](source:fm)[](source:when) |
| 성격 | 수정이 원래 취약점을 막았는지 읽기 전용으로 판정한다. 자기가 고치지 않는다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| fix-finding {#rel-r30} | **이 스킬** | 대안 | 둘 다 같은 verification mode를 쓴다. 판정: 두 스킬의 문장에서 추론했다. 직접 연결은 없다.[](source:fixf)[](source:mode) |
| assess-patch-risk {#rel-r31} | **이 스킬** | 대안 | 둘 다 이미 있는 fix를 파일을 바꾸지 않고 점검한다. 하나는 회귀 위험과 merge 자격을, 이 스킬은 원래 취약점이 막혔는지를 본다. 판정: 두 스킬의 문장에서 추론했다.[](source:apr)[](source:obj) |
| **이 스킬** {#rel-r63} | `static-finding-assessment.md` | 참고 | 정적 근거 평가 방법을 이 파일에서 읽는다. 호출자가 내용을 prompt에 이미 줬으면 다시 읽지 않는다.[](source:ref)[](source:sfa) |

@architecture id=relation-map title="verify-fix와 이어지는 스킬"
| fix | fix-finding | backend |
| apr | assess-patch-risk | backend |
| self | verify-fix(이 스킬) | backend |
| sfa | static-finding-assessment.md | external |
| fix > self | 대안 |
| apr > self | 대안 |
| self > sfa | 참고 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 사용 시점, 읽기 전용 목표, 검증 모드, 5단계 작업, 결과 계약, 판정 조건을 담은 본문 | 스킬이 켜지면 읽는다 | 원래 취약점 파악, 구성요소 찾기, exploit 경로 추적, 읽기 전용 실행 검사, finding별 판정 |
| `agents/openai.yaml` | 표시 이름, 짧은 설명, 호출 예시 prompt | 호스트가 스킬 목록을 보여 줄 때 쓴다. 지시상 읽는 조건은 원문에 명시 없음 | 해당 없음 |
| `../../references/static-finding-assessment.md` | source-control-sink 튜플, 증거 탐색 순서, 정적 확신도(high·medium·low)를 정하는 참조 문서 | 원래 취약점을 파악할 때 읽는다. 호출자가 내용을 prompt에 줬으면 읽지 않는다 | 원래 취약점 파악 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 사용자가 보안 수정 검증을 명시적으로 요청하지 않음 | 이 스킬을 켜지 않는다. 수정 구현이나 테스트 실행 요청만으로는 요청이 아니다. 다른 작업은 사용자가 요청한 흐름과 응답 형식을 따른다 | [](source:when) |
| 비보안 수정, 후보 finding 검증, 전체 repository scan | 이 스킬을 쓰지 않는다 | [](source:fm) |
| 어떤 경우든 | 저장소 파일을 만들거나 고치거나 지우지 않고, patch를 적용하지 않고, commit하지 않고, artifact를 쓰지 않고, issue tracker를 고치지 않는다 | [](source:obj) |
| 호출자가 `verificationMode: static`을 고르지 않음 | `standard`로 검증한다 | [](source:mode) |
| `static` 모드 | 의존성 설치, build, 테스트, 재현, 앱 실행을 하지 않는다. 검증 지침이 요구해도 같다. 근거에 정적 평가이며 런타임 검사를 하지 않았다고 쓴다. 런타임 도구가 없는 것만으로는 `inconclusive`가 아니고 소스 근거의 중대한 틈이 있으면 `inconclusive`다 | [](source:mode) |
| `standard`에서 재현이나 회귀·정상 동작 검사가 저장소를 바꿔야 함 | 돌리지 않는다. 저장소를 바꾸지 않고 돌릴 수 있을 때만 돌린다 | [](source:wf4) |
| 파일이 없거나 줄이 지워지거나 함수 이름이 바뀜 | 수리의 증거로 치지 않는다. 옮겨진 코드를 따라간다 | [](source:wf2) |
| 닫힌 ticket, 관련 없는 통과 테스트, 새 scan finding 없음 | 증거로 충분하지 않다 | [](source:wf5) |
| finding이 여럿 | 요청된 순서대로 finding마다 결과 하나를 낸다 | [](source:wf5) |
| 호출자가 JSON이나 자동 결과 계약을 요청함 | `results` 배열이 든 JSON 객체 하나만 낸다. 항목은 `id`, `status`, `evidence`다. CLI 검증 흐름은 이 계약을 명시적으로 요청한다 | [](source:res) |
| 판정 | `fixed`, `still_vulnerable`, `inconclusive` 조건은 위 판정 표를 따른다. 읽기 전용 경계를 약하게 하거나 다른 취약점으로 바꾸거나 빠진 근거를 숨겨 더 강한 판정을 추론하지 않는다 | [](source:verdict)[](source:never) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 정적 근거 평가의 튜플과 확신도 — 원래 취약점 파악 · source, control, sink, 도달 경로, 경계, 반증, 증명 간극과 high·medium·low 기준, 증거 탐색 순서 다섯 단계
- 결과 JSON 계약 — finding별 판정 · `results` 객체 예시와 판정별 `evidence`에 적을 내용
- fix-finding의 Verify 단계와의 차이 — 관계 표의 fix-finding 행 · 원문에 설명이 없어 비교 근거가 부족하다

@callout level=open-question title="확인하지 못한 것"
| workbench의 fix-finding Verify 단계와 이 스킬이 어떻게 겹치는지는 원문에 명시 없다.[](source:fixv) |
| `static-finding-assessment.md`는 증거 탐색 순서와 확신도를 정하지만 `fixed` 판정과 어떻게 이어지는지는 이 스킬이 직접 쓰지 않는다. 호출 스킬이 판정 계약을 가진다고만 적혀 있다.[](source:sfa)[](source:sfa-conf) |

읽은 원본: 텍스트 파일 3개(`SKILL.md`, `agents/openai.yaml`, `static-finding-assessment.md`). 제외: 없음.
