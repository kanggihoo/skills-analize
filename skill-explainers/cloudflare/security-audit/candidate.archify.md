# security-audit — 신뢰 경계를 넘는 취약점을 소스 근거로 찾아 보고하는 보안 감사 {#overview}

`security-audit`은 코드베이스에서 실제 신뢰 경계를 넘는 취약점만 골라, 소스 근거·안전한 재현 방법·우선순위·가장 작은 수정안을 소유자에게 보고하도록 에이전트를 이끄는 스킬이다.[](source:skm-purpose)

- 보안 질문에는 안내 모드로 답한다. codebase audit나 pen-test, 전체·종합·end-to-end 리뷰, 보고서 산출물을 요청받았을 때만 6단계 전체 감사가 돈다.[](source:skm-modes)
- 전체 감사는 출력 폴더에 `findings.json`과 보고서 세 개를 남긴다. 후보는 `confirmed`, `needs_validation`, `rejected` 중 하나로 판정되고 severity는 `confirmed`에만 붙는다.[](source:skm-priority)[](source:val-p6)
- 다른 스킬과의 관계는 조사 범위에서 확인된 연결 없음이다. 일을 나눌 때는 스킬이 아니라 `research`·`general` agent에 위임한다.[](source:skm-agents)
- 대상 소스를 고치지 않고, 배포된 endpoint에 접속하지 않으며, 샌드박스 통제를 모두 걸 수 없으면 대상 코드를 실행하지 않는다.[](source:skm-fix)[](source:skm-safety)

@answer scope="cloudflare/security-audit · 원본 파일 20개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source skm-fm title="frontmatter" path=cloudflare/security-audit/SKILL.ko.md lines=1:4
@source skm-purpose title="목적 정의" path=cloudflare/security-audit/SKILL.ko.md lines=6:8
@source skm-modes title="운영 모드 선택" path=cloudflare/security-audit/SKILL.ko.md lines=10:17
@source skm-agents title="agent 역할 용어" path=cloudflare/security-audit/SKILL.ko.md lines=19:29
@source skm-safety title="실행 안전 규칙" path=cloudflare/security-audit/SKILL.ko.md lines=31:42
@source skm-setup title="전체 감사 설정값" path=cloudflare/security-audit/SKILL.ko.md lines=44:52
@source skm-isolation title="쓰기 격리" path=cloudflare/security-audit/SKILL.ko.md lines=54:66
@source skm-meta title="run-metadata.json 작성" path=cloudflare/security-audit/SKILL.ko.md lines=86:86
@source skm-budget title="비용 예산과 정찰 전 gate" path=cloudflare/security-audit/SKILL.ko.md lines=119:134
@source skm-priority title="심각도와 확실성 분리" path=cloudflare/security-audit/SKILL.ko.md lines=150:162
@source skm-fix title="최소 수정 권고" path=cloudflare/security-audit/SKILL.ko.md lines=164:166
@source skm-workflow title="6단계와 종료 상태" path=cloudflare/security-audit/SKILL.ko.md lines=168:179
@source rec-agents title="정찰 agent 네 개" path=cloudflare/security-audit/RECONNAISSANCE.md lines=7:57
@source rec-arch title="architecture.md와 companion 선택" path=cloudflare/security-audit/RECONNAISSANCE.md lines=73:88
@source rec-unit title="ledger unit 필드" path=cloudflare/security-audit/RECONNAISSANCE.md lines=104:139
@source rec-run title="ledger 검증기 실행" path=cloudflare/security-audit/RECONNAISSANCE.md lines=156:156
@source hun-assign title="hunter 배정과 unit 상태 전환" path=cloudflare/security-audit/HUNTING.md lines=3:9
@source hun-prompt title="hunter 지시문 구성" path=cloudflare/security-audit/HUNTING.md lines=11:25
@source hun-critic title="coverage critic wave" path=cloudflare/security-audit/HUNTING.md lines=221:247
@source hun-quick title="quick 프로필의 wave 한도" path=cloudflare/security-audit/HUNTING.md lines=249:249
@source val-p3 title="Phase 3 검증 배정" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=3:7
@source val-decide title="판정 승격·강등·기각" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=87:93
@source val-p4 title="findings.json 작성과 검증 명령" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=95:118
@source val-p5 title="최종 기록 검증" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=120:149
@source val-p6 title="보고서 세 개" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=151:186
@source vf-run title="validate-findings.cjs 실행 진입점" path=cloudflare/security-audit/validate-findings.cjs lines=703:757
@source vl-run title="validate-coverage-ledger.cjs 실행 진입점" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=808:853

## 어떻게 동작하나 {#flow span=12}

전체 감사는 절차형이다. 원문이 6단계를 순서대로 모두 따르라고 한다.[](source:skm-workflow) 그림은 모드 판단까지 포함해 10개 노드다. 이 페이지의 용어는 이렇다. parent는 감사를 조율하고 공유 파일을 혼자 쓰는 메인 에이전트다.[](source:skm-agents) hunter는 취약점 후보를 찾는 `general` agent다.[](source:hun-assign) verifier는 그 후보를 사냥하지 않은 새 agent다.[](source:val-p3) critic은 빠진 범위를 제안하는 새 `research` agent다.[](source:hun-critic) coverage ledger(검토 범위를 unit 단위로 적은 `coverage-ledger.json`)가 coverage 주장의 근거다.[](source:rec-unit)

그림에서 생략한 것이 둘 있다. 하나는 검증기가 오류를 내면 고쳐서 다시 돌리는 반복이고, 다른 하나는 profile과 budget이 wave 수를 줄이는 조기 종료다. 앞의 것은 `findings 작성` 설명과 상세에, 뒤의 것은 `범위 점검?` 설명과 상세에 있다.

@workflow id=flow-diagram title="security-audit 전체 흐름"
| lane start | 시작 |
| lane find | 찾기 |
| lane check | 검증 |
| lane out | 보고 |
| mode | 모드 판단? | external | start | source:skm-modes |
| guide | 안내 답변 | frontend | start | source:skm-modes |
| setup | 감사 설정 | backend | start | source:skm-setup |
| recon | 정찰 | backend | find | source:rec-agents |
| hunt | 사냥 | backend | find | source:hun-prompt |
| critic | 범위 점검? | backend | find | source:hun-critic |
| validate | 후보 검증 | security | check | source:val-p3 |
| findings | findings 작성 | database | check | source:val-p4 |
| final | 최종 검증 | security | check | source:val-p5 |
| report | 보고서 | frontend | out | source:val-p6 |
| mode > setup | 전체 감사 | emphasis |
| mode > guide | 안내 |
| setup > recon | |
| recon > hunt | |
| hunt > critic | |
| critic > hunt | 새 작업 |
| critic > validate | 없음 | emphasis |
| validate > findings | |
| findings > final | |
| final > report | 통과 | emphasis |
| final > validate | 새 root cause |

@steps id=flow-steps
| s-mode | 모드 판단? | **입력** 사용자 요청 · **참조** `SKILL.md` · **출력** 모드 결정 또는 질문 하나. **처리** 에이전트가 요청을 읽고 안내 모드와 전체 감사 모드 중 하나를 고른다.[](source:skm-modes) **다음** 어느 쪽인지 모호하면 파일을 만들거나 전체 workflow를 시작하기 전에 질문을 하나 한다. **상세** [감사 설정과 실행 안전](page:security-audit.setup.html) | flow-diagram | mode |
| s-guide | 안내 답변 | **입력** 안내 모드 요청 · **참조** `SKILL.md`의 관련 부분 · **출력** 요청에 대한 답(출력 폴더와 감사 산출물 없음). **처리** 6단계를 자동으로 돌리지 않고 관련 부분만 쓴다. 필요하면 집중 agent를 띄우고, 그 agent는 결과를 현재 작업에 돌려준다.[](source:skm-modes) **다음** 여기서 끝난다. **상세** [감사 설정과 실행 안전](page:security-audit.setup.html) | flow-diagram | guide |
| s-setup | 감사 설정 | **입력** target 경로·요청·이전 실행 기록 · **참조** `SKILL.md` · **출력** 출력 폴더와 `run-metadata.json`(`run_status: "in_progress"`). **처리** parent가 skill 폴더, target, repo name, 출력 폴더, source ref를 정하고 profile과 budget을 기록한다. 이전 실행의 ledger와 findings가 있으면 먼저 읽는다.[](source:skm-setup)[](source:skm-meta) **다음** budget이 정찰 최소 비용을 못 대면 agent를 띄우지 않는다.[](source:skm-budget) **상세** [감사 설정과 실행 안전](page:security-audit.setup.html), [감사 계획](page:security-audit.planning.html) | flow-diagram | setup |
| s-recon | 정찰 | **입력** target 소스·이전 실행 기록 · **참조** `RECONNAISSANCE.md`, `ATTACK-CLASSES.md` · **실행** `node <skill-dir>/validate-coverage-ledger.cjs <output-dir>/coverage-ledger.json` · **출력** `architecture.md`, `coverage-ledger.json`(unit 상태 `planned`), 선택한 도메인 지침. **처리** `research` agent 네 개를 병렬로 띄워 사실을 받고, parent가 architecture.md와 ledger를 쓴다.[](source:rec-agents)[](source:rec-arch)[](source:rec-run) → 내부: `validate-coverage-ledger.cjs`는 ledger 파일 하나만 읽는다(코드 확인).[](source:vl-run) **상세** [정찰과 coverage ledger](page:security-audit.recon.html), [attack class와 도메인 지침](page:security-audit.rules.html) | flow-diagram | recon |
| s-hunt | 사냥 | **입력** `planned` unit · **참조** `HUNTING.md`, `ATTACK-CLASSES.md`, 고른 도메인 지침 · **실행** `node <skill-dir>/validate-coverage-ledger.cjs <output-dir>/coverage-ledger.json`(갱신마다) · **출력** hunter별 JSON 결과, 갱신된 ledger, 후보 fingerprint. **처리** parent가 unit을 `in_progress`로 바꾸고, `general` hunter에게 architecture.md와 선택 블록 원문을 담은 지시문을 줘서 사냥시킨다.[](source:hun-assign)[](source:hun-prompt) **상세** [사냥](page:security-audit.hunt.html), [attack class와 도메인 지침](page:security-audit.rules.html) | flow-diagram | hunt |
| s-critic | 범위 점검? | **입력** architecture.md·전체 ledger·후보 상태 · **참조** `HUNTING.md` · **출력** critic JSON(`missing_units`, `reassign_ids`, `resolved_prior_leads`, `stop`). **처리** 새 `research` critic이 coverage 빈틈을 제안한다. 수락할 작업이 있으면 사냥으로 돌아가고, 없으면 후보 검증으로 간다.[](source:hun-critic) **다음** standard·deep은 별도의 final-clean critic을 한 번 더 쓴다. quick은 hunter wave 한 번과 critic 한 번으로 끝난다.[](source:hun-quick) **상세** [사냥](page:security-audit.hunt.html) | flow-diagram | critic |
| s-validate | 후보 검증 | **입력** fingerprint로 통합한 후보 · **참조** `VALIDATION-AND-REPORTING.md`, `report-schema.json` · **출력** verifier JSON `{"decision": ..., "record": ...}`. **처리** 그 후보를 사냥하지 않은 새 `general` verifier가 소스와 제한된 local 증거로 반박해 본다.[](source:val-p3) 결과는 `confirmed`, `needs_validation`, `rejected` 중 하나다.[](source:val-decide) **상세** [후보 검증](page:security-audit.verify.html), [핵심 원칙과 심각도 기준](page:security-audit.principles.html) | flow-diagram | validate |
| s-findings | findings 작성 | **입력** verifier가 판정한 record · **참조** `report-schema.json` · **실행** `node <skill-dir>/validate-findings.cjs <output-dir>/findings.json`, `node <skill-dir>/validate-coverage-ledger.cjs <output-dir>/coverage-ledger.json` · **출력** fingerprint 순으로 정렬한 `findings.json`. **처리** parent가 쓰기 직전에 schema를 읽고 기록하며, 검증기는 형식과 ledger 일관성만 증명한다.[](source:val-p4) → 내부: `validate-findings.cjs`가 같은 폴더의 `report-schema.json`을 직접 읽는다(코드 확인).[](source:vf-run) **다음** 오류가 나면 모두 고친 뒤 다시 돌린다. **상세** [findings.json과 검증기](page:security-audit.records.html) | flow-diagram | findings |
| s-final | 최종 검증 | **입력** `findings.json`의 `confirmed`·`needs_validation` record · **참조** `VALIDATION-AND-REPORTING.md` · **출력** `{"decision":"verified",...}` 또는 `replace`. **처리** record마다 새 `research` verifier가 trace, 조건, severity, blocker를 다시 확인한다.[](source:val-p5) **다음** 별개의 root cause가 나오면 새 fingerprint로 후보 검증부터 다시 간다. 교체를 적용하면 검증기 두 개를 다시 돌린다. **상세** [최종 검증과 보고서](page:security-audit.final.html) | flow-diagram | final |
| s-report | 보고서 | **입력** 최종 record·ledger·hunter의 `hardening` 노트 · **참조** `VALIDATION-AND-REPORTING.md` · **출력** `REPORT.md`, `FINDINGS-DETAIL.md`, `NEEDS-VALIDATION.md`. **처리** Phase 5를 통과한 record로만 보고서를 쓰고, verdict·severity·blocker는 바꾸지 않는다.[](source:val-p6) **다음** 끝나는 상태는 둘뿐이다. 보고서가 모두 쓰이고 검증기 두 개가 통과하거나, `run_status: "incomplete"`와 이유를 기록하고 빈틈을 보고서에 밝힌다.[](source:skm-workflow) **상세** [최종 검증과 보고서](page:security-audit.final.html) | flow-diagram | report |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 슬래시 명령은 원문에 명시 없음. 모델이 `description`을 보고 판단한다. 호출 제한 필드는 frontmatter에 없다.[](source:skm-fm) |
| 성격 | 요청이 질문인지 감사인지 가르고, 감사면 6단계를 하위 agent에게 나눠 시켜 `findings.json`과 보고서 세 개를 만든다.[](source:skm-workflow) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| 없음 {#none} | - | - | 조사 범위에서 확인된 연결 없음 |

스킬을 불러온 것만으로 전체 감사가 시작되지 않는다. 불러온 뒤에 에이전트가 요청을 읽고 모드를 고른다.[](source:skm-modes) 아래는 frontmatter 전문이다. `description`은 모델이 켤지 판단할 때 참고하는 설명이고, 문구가 일치해야 켜지는 사전이 아니다.

@code source=skm-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 모드 선택, 실행 안전 규칙, 설정값, 쓰기 격리, 프로필·예산, 핵심 원칙, 6단계 순서 | 스킬을 켜면 읽는다 | 모드 판단?, 안내 답변, 감사 설정 |
| `RECONNAISSANCE.md` | 정찰 agent 네 개의 지시문, architecture.md 규칙, coverage ledger 구조 | Phase 1에서 읽는다 | 정찰 |
| `HUNTING.md` | hunter 지시문 구성, 결과 JSON 형식, ledger 갱신, coverage critic 규칙 | Phase 2에서 읽는다 | 사냥, 범위 점검? |
| `ATTACK-CLASSES.md` | 일반 attack class 아홉 개와 도메인 지침 연결 | 정찰이 attack class를 고를 때, hunter 지시문에 블록을 복사할 때 읽는다 | 정찰, 사냥 |
| 도메인 지침 열 개(`AI-AND-LLM.md` 외) | 영역별 core discipline, attack class, universal moves, validation rules | 정찰이 해당 trust boundary를 찾았을 때 그 파일만 쓴다 | 정찰, 사냥 |
| `VALIDATION-AND-REPORTING.md` | verifier 지시문, 판정 규칙, findings.json 규칙, 최종 검증, 보고서 세 개 | Phase 3~6에서 읽는다 | 후보 검증, findings 작성, 최종 검증, 보고서 |
| `report-schema.json` | `confirmed`·`needs_validation`·`rejected` record 형식 | hunter·verifier 지시문에 branch를 복사하고, findings.json을 쓰기 직전에 읽는다 | 사냥, 후보 검증, findings 작성 |
| `validate-findings.cjs` | findings.json의 형식과 의미를 검사하는 CLI | Phase 4에서 `node`로 실행한다 | findings 작성 |
| `validate-coverage-ledger.cjs` | coverage-ledger.json의 필드·상태 불변식·coverage_id를 검사하는 CLI | ledger를 시드한 뒤, 갱신할 때마다, Phase 6 전에 실행한다 | 정찰, 사냥, findings 작성 |
| `validate-findings.test.cjs`, `validate-coverage-ledger.test.cjs` | 두 검증기의 시험 | 원문이 읽거나 실행하라고 지시한 곳은 원문에 명시 없음 | 원문에 명시 없음 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 요청이 안내인지 감사인지 모호하다 | 파일을 만들거나 워크플로를 시작하기 전에 질문을 하나 한다 | [](source:skm-modes) |
| 샌드박스 통제(외부 네트워크 차단, 빈 환경, 읽기 전용 target, 자원 상한) 중 하나라도 걸 수 없다 | 대상 코드를 실행하지 않고 빠진 기능을 `needs_validation` blocker로 보고한다 {good:강제} | [](source:skm-safety) |
| 배포된 endpoint, 외부 서비스, 운영 계정, 다른 사용자 데이터 | 건드리지 않는다. 더미 주체·fixture·secret만 쓴다 {good:금지} | [](source:skm-safety) |
| 후보가 나왔다 | 사냥하지 않은 새 verifier를 통과해야 `confirmed`가 된다. severity는 `confirmed`에만 붙는다 | [](source:skm-priority)[](source:val-decide) |
| 출력 폴더를 target 안에 두고 싶다 | 사용자가 고르고 version control이 폴더 전체를 ignore하는지 parent가 확인할 때만 쓴다. 아니면 멈추고 외부 경로를 요청한다 | [](source:skm-setup) |
| 공유 파일 일곱 개 | parent만 쓴다. hunter와 verifier는 `agents/<agent-id>/` 아래 자기 `scratch/`에만 쓴다 | [](source:skm-isolation) |
| strict budget이 후보 검증을 다 못 덮는다 | fingerprint 순으로 검증하다 멈추고 `run_status: "incomplete"`로 기록한다. 검증하지 못한 후보는 `findings.json`에 넣지 않는다 {caution:부분 결과} | [](source:skm-budget) |
| 감사를 끝낸다 | 종료 상태는 정확히 둘이다. 산출물과 검증기가 모두 통과하거나, `incomplete`와 이유를 남긴다 | [](source:skm-workflow) |
| 수정안을 낸다 | 대상 소스는 고치지 않는다. 고칠 곳과 regression case를 설명만 한다 | [](source:skm-fix) |

원문에 "이 스킬을 쓰지 말라"는 절은 명시 없음이다. 아래는 금지 규칙에서 끌어낸 판정이다.[](source:skm-safety)

- 판정: 배포된 서비스를 직접 두드려 보는 점검에는 맞지 않는다. 그 결정적 사실은 `needs_validation`으로 남기고 소유자가 확인하게 한다.
- 판정: 대상 코드를 고치는 작업에는 맞지 않는다. 이 스킬은 수정안을 설명할 뿐 소스를 바꾸지 않는다.
- 판정: 격리 샌드박스를 만들 수 없는 환경에서는 대상 코드 실행이 필요한 확인이 모두 막힌다.

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- [감사 설정과 실행 안전](page:security-audit.setup.html) — 모드 선택, 공통 실행 안전, 설정값, 쓰기 격리, artifact 승격 절차
- [감사 계획](page:security-audit.planning.html) — 프로필과 범위, 비용 예산, 이전 실행 활용
- [핵심 원칙과 심각도 기준](page:security-audit.principles.html) — 핵심 원칙 다섯 개, 심각도 기준, anti-pattern 열 개
- [정찰과 coverage ledger](page:security-audit.recon.html) — 정찰 agent 네 개, architecture.md, ledger 구조와 상태 규칙
- [사냥](page:security-audit.hunt.html) — hunter 지시문, 결과 형식, 후보 통합, coverage critic wave
- [attack class와 도메인 지침](page:security-audit.rules.html) — 일반 attack class와 도메인 지침 열 개의 선택 조건
- [후보 검증](page:security-audit.verify.html) — Phase 3 후보 검증과 판정 규칙
- [findings.json과 검증기](page:security-audit.records.html) — Phase 4 `findings.json`, schema, 검증기 두 개
- [최종 검증과 보고서](page:security-audit.final.html) — Phase 5 최종 기록 검증과 Phase 6 보고서 세 개

상세 후보(요청하면 만든다):

- 없음

@callout level=open-question title="확인하지 못한 것"
| 사용자 슬래시 명령과 호출 제한 필드는 원문에 명시 없음이다. |
| 두 시험 파일을 읽거나 실행하라는 지시는 원문에 명시 없음이다. 시험 파일은 구조만 확인했다. |
| `.cjs` 검증기 두 개는 실행 진입점과 한도만 읽었고, 내부 검사 규칙 전체를 줄 단위로 읽지는 않았다. `O_NOFOLLOW`와 `O_NONBLOCK`이 없는 플랫폼에서 입력을 거부하는지, Windows가 이에 해당하는지는 확인하지 못했다. |

읽은 원본: 텍스트 파일 20개(`.md` 15개 전문, `report-schema.json`, `.cjs` 4개는 구조·진입점 위주). 제외: 번역본 `*.ko.md` 15개는 분석 근거로 쓰지 않았다.
