# track-findings — 봉인된 scan의 finding을 issue tracker에 승인받고 기록한다 {#overview}

track-findings는 끝난 scan 하나의 finding을 Linear, Jira, GitHub issue, 초안 advisory 중 한 곳에 만들거나 고치게 하는 스킬이다. 쓰기 전에 payload를 미리 보여 주고 승인을 받는다.[](source:intro)

- 사용자가 검증된 finding을 tracker에 올려 달라고 하면 켜진다. 목적지가 Linear, Jira, GitHub issue이면 issue 경로이고, advisory이면 finding 하나만 받는 별도 경로다.[](source:fm)[](source:v)[](source:adv-access)
- 결과는 외부 tracker의 issue 또는 초안 advisory와, 로컬 issue 이력에 남는 영수증이다. scan 폴더는 바뀌지 않는다.[](source:intro)[](source:apply)
- 관계: security-scan, security-diff-scan, deep-security-scan의 봉인된 결과를 받는다(결과 전달). issue는 triage-finding이 입력으로 읽을 수 있다(결과 전달, 추론).
- 하지 않는 것: scan과 fix는 하지 않는다. 한 번에 tracker 하나만 쓰고, 계정과 transport를 조용히 바꾸지 않는다.[](source:fm)[](source:intro)[](source:access)

@answer scope="codex-security/plugins/codex-security/skills/track-findings · 원본 파일 6개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source fm title="frontmatter: name과 description" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=1:4
@source intro title="목표와 사용할 도구" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=8:12
@source v title="1단계: 소스 검증 helper" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=14:26
@source dest title="2단계: 목적지와 접근 확인" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=28:43
@source access title="gh 계정 고정과 provider 접근 한계" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=37:43
@source src title="소스 저장소 확인과 source status" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=45:51
@source dup title="3단계: 중복 확인과 결과 네 가지" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=53:68
@source prev title="4단계: 미리보기와 승인" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=70:80
@source apply title="5단계: 쓰기와 영수증 기록" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=82:90
@source pause title="멈췄다 재개할 때 다시 확인할 것" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=84:86
@source rb title="읽어 보기와 실패 처리" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=92:98
@source adv-access title="advisory: 접근과 허용 API" path=codex-security/plugins/codex-security/skills/track-findings/references/github-security-advisories.md lines=5:24
@source adv-dup title="advisory: 중복과 생성 검증" path=codex-security/plugins/codex-security/skills/track-findings/references/github-security-advisories.md lines=34:46
@source jira title="Jira: 대상, 중복, 쓰기 범위" path=codex-security/plugins/codex-security/skills/track-findings/references/jira.md lines=5:31
@source yaml title="openai.yaml의 호출 정책" path=codex-security/plugins/codex-security/skills/track-findings/agents/openai.yaml lines=1:7
@source helper title="helper 코드: 선택자 검사" path=codex-security/plugins/codex-security/mcp-app/src/helpers/validate-tracking-source.ts lines=13:41
@source tools title="issue 이력 MCP 도구 계약" path=codex-security/plugins/codex-security/mcp-app/src/server/finding-issue-tools.ts lines=89:112

## 어떻게 동작하나 {#flow span=12}

절차형이다. 그림은 한 finding 묶음의 기본 경로다. 설명이 붙지 않은 중단 간선은 모든 단계에서 "검사 실패·불확실"일 때 일어난다.[](source:apply)

@workflow id=flow-diagram title="track-findings 흐름"
| lane prep | 준비 |
| lane review | 검토 |
| lane write | 기록 |
| val | 소스 검증 | backend | prep | source:v |
| dest | 대상·접근 정하기 | backend | prep | source:dest |
| dup | 중복 확인 | backend | prep | source:dup |
| prev | 미리보기 | backend | review | source:prev |
| ok | 승인? | external | review | source:prev |
| write | 쓰기 | backend | write | source:apply |
| rb | 기록·읽기 확인 | backend | write | source:rb |
| rep | 결과 보고 | backend | write | source:rb |
| stop | 중단 | security | write | source:apply |
| val > dest | 통과 |
| val > stop | helper 실패 | dashed |
| dest > dup | |
| dest > stop | 접근 막힘 | dashed |
| dup > prev | create·reuse·update |
| dup > stop | blocked | dashed |
| prev > ok | |
| ok > write | 예 | emphasis |
| ok > prev | 아니오·변경 |
| write > rb | |
| write > stop | 실패·불확실 | dashed |
| rb > rep | |

@steps id=flow-steps
| s-val | 소스 검증 | **입력** 사용자가 준 scan 폴더, 선택 `--finding-id` 또는 `--fingerprint` · **실행** `<plugin-root>/scripts/launch_codex_security_mcp --helper validate-tracking-source <scan-dir>` · **출력** scan 순서의 finding ID 목록. **처리** helper가 봉인된 scan을 검증하고, 에이전트는 `scan-manifest.json`과 `findings.json`에서 finding 내용을 읽는다.[](source:v) **다음** 명령이 실패하면 tracking을 멈춘다. 선택자가 정확히 한 finding으로 풀리지 않아도 실패한다(코드 확인).[](source:v)[](source:helper) | flow-diagram | val |
| s-dest | 대상·접근 정하기 | **입력** 사용자의 목적지 선택, 저장소·조직 정책 · **참조** `references/jira.md`(Jira), `references/github-security-advisories.md`(advisory) · **실행** `gh auth status --active --hostname <host>`(CLI 사용 시) · **출력** provider, 목적지, 공개 범위, 계정, source status. **처리** 목적지 하나와 접근 권한을 실시간으로 확인하고, finding 경로가 scan된 revision에 있는지 가능하면 검증한다.[](source:dest)[](source:src) **다음** 공개 범위가 넓거나 모르면 노출을 설명하고 확인받는다. advisory는 source를 검증하지 못하면 막힌다.[](source:dest)[](source:src) | flow-diagram | dest |
| s-dup | 중복 확인 | **입력** 확인된 목적지, 선택 finding · **실행** `get_codex_security_finding_issues`, provider 검색 · **출력** finding별 `create`, `reuse`, `update`, `blocked` 중 하나. **처리** 저장된 연결을 후보로만 쓰고, finding id와 fingerprint를 모든 상태에서 provider에서 다시 검색해 결과를 정한다.[](source:dup) **다음** 라우팅, 접근, 공개, 중복 모호성이 있으면 `blocked`다. advisory는 `create`, `reuse`, `blocked`만 쓴다.[](source:dup)[](source:adv-dup) | flow-diagram | dup |
| s-prev | 미리보기 | **입력** 검증된 finding의 영향·원인·수정안·검증 근거 · **출력** finding별 제목, 본문, metadata, 생략한 민감 내용, 경고. **처리** 목적지·계정·중복 결과·source status와 함께 정확한 payload를 보여 주고, 모든 본문에 finding id와 fingerprint 표지를 넣는다.[](source:prev) **다음** 일괄 처리는 실행 순서의 전체 목록을 보여 준다. advisory는 JSON payload와 header도 보여 준다.[](source:prev) | flow-diagram | prev |
| s-ok | 승인? | **입력** 미리보기 목록 · **출력** 승인된 payload 목록 또는 변경 요구. **처리** 사용자가 본 payload만 승인된 것이다. "finding을 tracking해 줘"라는 일반 요청은 승인이 아니다.[](source:prev) **다음** source, 계정, transport, 목적지, 공개 범위, 중복 결정, payload, 구성이 바뀌면 새 미리보기와 새 승인이 필요하다. reuse는 쓰기 승인이 필요 없다.[](source:prev) | flow-diagram | ok |
| s-write | 쓰기 | **입력** 승인된 payload 목록 · **참조** `references/jira.md`, `references/github-security-advisories.md` · **실행** helper를 finding마다 `--finding-id <id>`로 다시 실행한 뒤 provider의 create, update 또는 reuse · **출력** provider 응답(issue 식별자, URL). **처리** finding을 승인된 순서로 하나씩 처리하고, 응답이 오면 즉시 `record_codex_security_finding_issues`로 영수증을 로컬 이력에 남긴다.[](source:apply) **다음** 승인 뒤 멈췄다 재개하면 소스, 계정, 목적지, 중복을 다시 확인한다. 실패하거나 불확실하면 batch를 멈춘다.[](source:pause)[](source:apply) | flow-diagram | write |
| s-rb | 기록·읽기 확인 | **입력** 영수증을 기록한 issue · **실행** `gh issue view "$issue_url" --json number,url,title,body`(CLI 사용 시), advisory는 허용된 GET · **출력** `readback` 상태가 붙은 영수증. **처리** 같은 transport로 객체를 읽어 식별과 바뀐 필드를 확인하고, 같은 영수증을 `readback` `verified` 또는 `failed`로 다시 기록한다.[](source:rb)[](source:adv-dup) **다음** 읽기 실패는 쓰기 실패가 아니다. 읽을 수 없어도 다시 create하지 않는다.[](source:rb) | flow-diagram | rb |
| s-rep | 결과 보고 | **입력** 처리 결과 전체 · **출력** completed, reused, blocked, failed, uncertain, unprocessed별 목록. **처리** provider 영수증이나 읽기에서 얻은 URL, URL이 없으면 돌려받은 식별자를 적고, 받아들여진 쓰기와 읽기 실패와 접근 실패를 따로 보고한다.[](source:rb) | flow-diagram | rep |
| s-stop | 중단 | **입력** 실패한 검사나 불확실한 변경 · **출력** 중단 사유와 미처리 finding 목록. **처리** 쓰기가 성공했을 수 있으면 재시도 전에 정확한 읽기나 binding 검색으로 먼저 확인한다.[](source:rb) **다음** 결과가 계속 불확실하면 멈춘다. 중단된 batch를 재개할 때는 완료 항목의 영수증을 맞춰 보고 나머지만 검증하며, 목적지와 남은 쓰기가 같으면 승인은 유지된다.[](source:rb) | flow-diagram | stop |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(description)이 켠다. `allow_implicit_invocation: true`이고, description이 scan·fix에는 쓰지 말라고 한다.[](source:fm)[](source:yaml) |
| 성격 | 봉인된 scan의 finding을 한 provider·한 목적지에 승인받아 기록하는 쓰기 스킬이다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| security-scan {#rel-r24} | **이 스킬** | 결과 전달 | scan이 끝나면 `scan-manifest.json`과 `findings.json`이 생기고, 이 스킬은 봉인된 scan 하나만 받는다. 사용자가 요청할 때 따로 부르며 자동 순서는 없다.[](source:intro)[](source:v) |
| security-diff-scan {#rel-r25} | **이 스킬** | 결과 전달 | diff scan이 `complete_codex_security_scan`으로 봉인한 결과도 같은 계약으로 받는다. 중단 상태(`failed` 등) bundle을 거부하는 검사는 확인하지 못했다.[](source:v) |
| deep-security-scan {#rel-r26} | **이 스킬** | 결과 전달 | deep scan도 봉인된 결과를 남기므로 같은 방식으로 받는다. 중단 상태 bundle을 거부하는지는 R25와 같이 확인하지 못했다.[](source:v) |
| **이 스킬** {#rel-r40} | triage-finding | 결과 전달 | 만든 Jira·Linear ticket이 finding id와 fingerprint를 담으므로 triage-finding이 입력으로 읽을 수 있다. 서로를 지목하지 않으므로 판정: 약한 연결이다.[](source:prev) |
| **이 스킬** {#rel-r67} | Linear·Atlassian·GitHub 도구와 `gh` | 참고 | 쓰기 전에 미리보기와 승인을 받는다. provider 도구의 동작은 이 저장소에 없어 범위 밖이다.[](source:intro)[](source:prev) |

@architecture id=relation-map title="track-findings와 이어지는 스킬"
| scan | security-scan | backend |
| diff | security-diff-scan | backend |
| deep | deep-security-scan | backend |
| tri | triage-finding | backend |
| prov | Linear·Atlassian·GitHub(범위 밖) | external |
| self | track-findings(이 스킬) | backend |
| scan > self | 결과 전달 |
| diff > self | 결과 전달 |
| deep > self | 결과 전달 |
| self > tri | 결과 전달 | dashed |
| self > prov | 참고 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 5단계 절차, 접근·승인·중복·영수증 규칙 | 스킬이 켜지면 읽는다 | 소스 검증, 대상·접근 정하기, 중복 확인, 미리보기, 승인?, 쓰기, 기록·읽기 확인, 결과 보고, 중단 |
| `references/jira.md` | Jira의 도구 순서, 필드 확인, 중복 검색, 쓰기 범위 | Jira 작업 전에 읽는다 | 대상·접근 정하기, 중복 확인, 쓰기 |
| `references/github-security-advisories.md` | 초안 advisory의 접근 조건, API, payload, 중복, 생성 검증 | advisory 작업 전에 읽는다 | 대상·접근 정하기, 중복 확인, 쓰기, 기록·읽기 확인 |
| `agents/openai.yaml` | 표시 이름, 기본 prompt, 암시적 호출 허용 | 스킬 목록 표시와 호출 정책에 쓰인다 | 원문에 명시 없음 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| provider 호출이나 목적지 탐색 전 | helper로 소스를 먼저 검증한다. 실패하면 tracking을 멈춘다 | [](source:v) |
| 쓰기 전 | 정확한 payload를 미리 보여 주고 승인받는다. 일반 요청은 승인이 아니다 | [](source:prev) |
| source, 계정, transport, 목적지, 공개 범위, 중복 결정, payload, 구성이 바뀜 | 새 미리보기와 새 승인이 필요하다 | [](source:prev) |
| 계정이나 transport를 바꿔야 함 | 조용히 바꾸지 않는다. app이 목적지에 닿지 않으면 CLI 계정을 보여 주고 사용 허락을 받는다. browser 자동화와 직접 HTTP 호출은 쓰지 않는다 | [](source:intro) |
| `gh` 계정이 고정되지 않거나 인증 경고가 있음 | 선택 사항인 source 링크는 건너뛴다. 목적지 연결이 이 검사에 실패하면 GitHub tracking을 멈춘다 | [](source:access) |
| 민감한 finding의 목적지 | Linear는 비공개 team, GitHub issue는 비공개 저장소가 기본이다. 더 넓은 공개 범위는 경고와 명시적 확인이 필요하다 | [](source:dest) |
| 공개 GitHub issue | 완전한 제목과 본문을 승인받고, 내부 근거·attack path·exploit 세부·비공개 링크는 뺀다 | [](source:prev) |
| 본문 | finding id와 primary fingerprint 표지를 넣는다. 자격 증명, signed URL, 로컬 파일 URL은 넣지 않는다 | [](source:prev) |
| source status가 `verified`이고 `git_revision`일 때만 | commit을 고정한 링크를 쓴다. 그 밖에는 `path:line-range`만 쓴다 | [](source:src) |
| advisory | 검증된 `git_revision`, 공개 canonical non-fork 저장소, 기본 branch, `ADMIN` 권한이 필요하다. finding 하나만 받고 batch는 안 된다. 허용 API는 GET 둘과 POST 하나뿐이다 | [](source:adv-access) [](source:dest) |
| advisory 중복 | `draft` 또는 `published` 일치 하나는 reuse한다. `triage`·`closed`·다수 일치·의미 모호성은 막는다 | [](source:adv-dup) |
| advisory 성공 판정 | 읽기 결과가 승인한 payload와 맞고 `state: draft`여야 성공으로 보고한다 | [](source:adv-dup) |
| 쓰기마다 | helper를 그 finding ID로 다시 실행하고 승인된 순서로 하나씩 처리한다. 실패하거나 불확실하면 batch를 멈춘다 | [](source:apply) |
| 로컬 영수증 기록 실패 | batch를 멈춘다. 저장 실패는 다른 create의 허가가 아니다 | [](source:apply) |
| 쓰기가 성공했을 수 있는 실패·timeout | 재시도 전에 정확한 읽기나 binding 검색으로 확인한다. 불확실하면 멈춘다 | [](source:rb) |
| Jira | comment, transition, 첨부, watcher, 프로젝트·사용자 생성, 설정 변경은 하지 않는다 | [](source:jira) |
| 저장소·설정 | repository 생성, 설정·app 접근 변경, source push, 정책 우회는 하지 않는다. finding 내용과 공개 승인은 memory에 저장하지 않는다 | [](source:access) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 목적지별 확인 규칙(Linear, Jira, GitHub issue) — 대상·접근 정하기 · provider마다 공개 범위와 권한을 확인하는 항목이 많다
- source status 판정 — 대상·접근 정하기 · `verified`, `unverified`, `unavailable`을 가르는 검사와 링크 규칙
- 중복 판정 기준 — 중복 확인 · binding 비교, 검색 범위, 네 가지 결과의 조건
- 미리보기에 들어가는 항목 — 미리보기 · 공개 issue, advisory payload, 일괄 승인 규칙
- 영수증과 로컬 이력 — 쓰기, 기록·읽기 확인 · `receipt` 필드, 재기록 규칙, 이력 도구 계약
- GitHub 초안 advisory 경로 — 대상·접근 정하기 · payload 필수 항목, 허용 API, 읽기 검증
- 중단 후 재개 — 쓰기 · 승인 뒤 재개할 때 다시 확인할 것과 승인 유지 조건

@callout level=open-question title="확인하지 못한 것"
| Linear, Atlassian, GitHub app의 도구와 `gh issue create` 같은 provider 쪽 동작은 이 저장소에 없어 확인하지 못했다. |
| 중단 상태(`failed`, `canceled`, `interrupted`)의 scan bundle을 이 스킬이 거부하는지는 원문과 코드에서 확정하지 못했다. SKILL.md에 중단된 scan을 다루는 문장이 없다. |
| 소스 검증 helper의 봉인 검증 구현(`sealed-contract.ts`)은 선택자 검사 부분만 읽었다. 로컬 이력의 저장 코드(`workbench_publication.py`)는 읽지 않았다. |

읽은 원본: 텍스트 파일 6개(SKILL.md, references 2개, openai.yaml, MCP 코드 2개 중 필요한 부분). 제외: 없음.
