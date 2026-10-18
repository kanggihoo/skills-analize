# security-audit 분석

## 1. 개요

- 컬렉션: `cloudflare` (유일한 스킬). 원본 경로: `/Users/kkh/Desktop/skills-analize/cloudflare/security-audit/`
- 잠금 파일 `/Users/kkh/Desktop/skills-analize/cloudflare/skills-lock.json` (전문 읽음, 이 파일의 바이트는 별도 계측 안 함):
  - `"version": 1`, 스킬 키 `security-audit`
  - `"source": "cloudflare/security-audit-skill"`, `"sourceType": "github"`
  - `"skillPath": "skills/security-audit/SKILL.md"`
  - `"computedHash": "98b97aad2873b3b9a8e064007c25e7827b493ba27fda8bfbdb41dab586767973"`
- 참고: 작업 지시는 "4 scripts"를 `scripts/`로 묘사했으나 실제 디렉터리에는 `scripts/` 하위 폴더가 없고 4개 `.cjs`가 스킬 루트에 있다 (`find` 결과 19개 파일 전부 루트 직속). SKILL.md도 `<skill-dir>/validate-coverage-ledger.cjs` 형태로 루트 경로를 지칭한다 (`RECONNAISSANCE.md:156`, `VALIDATION-AND-REPORTING.md:114-115`).

### 1.1 읽은 파일 전체 목록 (19개, 합계 314,670 B)

| # | 파일 | 바이트 | 역할 |
|---|---|---|---|
| 1 | `SKILL.md` | 22,026 | 핵심. 운영 모드, 실행 안전, 6단계 워크플로우, 프로파일/예산, 심각도 앵커, 안티패턴 |
| 2 | `RECONNAISSANCE.md` | 15,902 | Phase 1. 정찰 에이전트 4종 프롬프트, 이전 실행 반입 규칙, `architecture.md`, 커버리지 원장 스키마/상태표 |
| 3 | `HUNTING.md` | 22,446 | Phase 2. 헌터 프롬프트 구성, 핵심 사냥 방법/승격 절차/후보 게이트 블록, 구조화 결과, 커버리지 크리틱 |
| 4 | `VALIDATION-AND-REPORTING.md` | 17,843 | Phase 3-6. 검증자 프롬프트, findings.json 계약, 최종 검증, 리포트 3종 |
| 5 | `ATTACK-CLASSES.md` | 15,695 | 일반 공격 클래스 9종 + 도메인 동반 파일 라우팅 박스 |
| 6 | `AI-AND-LLM.md` | 10,617 | 동반: LLM/에이전트/MCP |
| 7 | `WEB-PROTOCOL-AND-AUTH.md` | 12,300 | 동반: HTTP 프레이밍, 세션, JWT/OAuth/SAML/MFA/API 키/mTLS |
| 8 | `MEMORY-SAFETY-AND-BINARY.md` | 10,513 | 동반: 메모리 안전, FFI, 로더, 커널 |
| 9 | `CLIENT-SIDE.md` | 8,594 | 동반: 브라우저/DOM/서비스워커/XS-Leaks |
| 10 | `CLOUD-AND-DEPLOYMENT.md` | 8,291 | 동반: IAM, 컨테이너, 인그레스, 이벤트 |
| 11 | `DATA-ISOLATION-AND-LIFECYCLE.md` | 7,798 | 동반: 테넌트 격리, 파생 사본, 삭제/복원 |
| 12 | `DESKTOP-MOBILE-AND-LOCAL-IPC.md` | 8,739 | 동반: 딥링크, 웹뷰 브리지, 로컬 IPC, 특권 헬퍼 |
| 13 | `PROTOCOLS-RPC-AND-MESSAGING.md` | 7,483 | 동반: gRPC/브로커/웹훅/리플레이 |
| 14 | `RESOURCE-EXHAUSTION-AND-AVAILABILITY.md` | 7,476 | 동반: 가용성/자원 고갈 |
| 15 | `SUPPLY-CHAIN-AND-RELEASE.md` | 7,258 | 동반: 의존성, CI, 릴리스/업데이트 |
| 16 | `report-schema.json` | 14,494 | findings.json 스키마 (confirmed / needs_validation / rejected 3분기 oneOf) |
| 17 | `validate-findings.cjs` | 28,806 | findings.json 검증기 (자체 구현 JSON Schema 해석기 + 의미 검사) |
| 18 | `validate-coverage-ledger.cjs` | 33,522 | coverage-ledger.json 검증기 |
| 19 | `validate-findings.test.cjs` | 26,384 | findings 검증기 테스트 (`test(` 34개) |
| 20 | `validate-coverage-ledger.test.cjs` | 28,483 | 원장 검증기 테스트 (`test(` 31개) |

- 디렉터리 내 실제 파일은 20개(`find` 결과): SKILL.md 1 + 주제 .md 14 + 스키마 1 + 스크립트 2 + 테스트 2 = 20. 지시문의 "19 files"와 1개 차이가 있으며 합계 314,670 B는 이 20개 전체의 `wc -c` total이다.
- 14개 주제 .md 중 도메인 동반 파일(`AI-AND-LLM`, `WEB-PROTOCOL-AND-AUTH`, `MEMORY-SAFETY-AND-BINARY`, `CLIENT-SIDE`, `CLOUD-AND-DEPLOYMENT`, `DATA-ISOLATION-AND-LIFECYCLE`, `DESKTOP-MOBILE-AND-LOCAL-IPC`, `PROTOCOLS-RPC-AND-MESSAGING`, `RESOURCE-EXHAUSTION-AND-AVAILABILITY`, `SUPPLY-CHAIN-AND-RELEASE`)은 10개. 모두 동일 구조: `When to use this file` / `Core discipline` / 공격 클래스 절 / `Universal moves` / `Validation rules`.
- `templates/`, `assets/`, `references/` 디렉터리: 원문에 명시 없음 (존재하지 않음).

### 1.2 성격 한 줄

- 감사(audit). 코드베이스 취약점 헌팅 + 독립 검증 + 구조화 산출물(JSON) + 보고서를 만드는 다중 에이전트 오케스트레이션 워크플로우. 게이트와 검증 스크립트를 가진 검증(verification)적 요소를 포함하나 중심은 audit.

### 1.3 원문 자기 규정

> Find vulnerabilities that violate a real trust boundary, then give owners the source evidence, safe reproduction, priority, and smallest effective fix. This is a defensive, source-first workflow. A candidate without a concrete affected principal, resource, or security outcome is not a confirmed finding. (`SKILL.md:8`)

> This skill is guidance by default. Loading it does not authorize the complete audit workflow or file creation. (`SKILL.md:12`)

- 이 스킬은 공격 코드(익스플로잇 체인)를 제공하지 않는다. 대신 "무엇을 어떤 경계에서 찾고, 언제 confirmed/needs_validation/rejected로 분류하는가"를 규정한다. ATTACK-CLASSES 서두: "do not develop payload chains, test availability on live services, or take action in shared environments." (`ATTACK-CLASSES.md:5`)

## 2. 활성화 조건 (언제 켜지는가)

### 2.1 frontmatter

```
---
name: security-audit
description: Security guidance and vulnerability review for codebases, APIs, services, CLI tools, libraries, and daemons. Use for security questions, focused reviews, vulnerability research, security audits, or pen tests. Run the complete workflow only for explicit codebase audit or pen-test requests, full/comprehensive/end-to-end reviews, or requested report artifacts.
---
```
(`SKILL.md:1-4`)

- `name`, `description` 외 필드(`allowed-tools`, `model`, `metadata` 등): 없음. (`SKILL.md:1-4` 4줄이 frontmatter 전체)

### 2.2 트리거 발화 예시 (description/본문 기반 추출)

| # | 발화 예 | 매칭되는 모드 | 근거 |
|---|---|---|---|
| 1 | "Is this JWT verification safe?" (security question) | Guidance | `Use for security questions` (`SKILL.md:3`), `SKILL.md:14` |
| 2 | "Review this auth middleware for vulnerabilities" (focused review) | Guidance | `focused reviews` (`SKILL.md:3,14`) |
| 3 | "Do vulnerability research on this parser" | Guidance | `vulnerability research` |
| 4 | "Run a full security audit of this repo" | Full audit | `explicit codebase audit` (`SKILL.md:3,16`) |
| 5 | "Pen-test this codebase" | Full audit | `pen-test requests` |
| 6 | "Do a comprehensive end-to-end security review" | Full audit | `full/comprehensive/end-to-end reviews` |
| 7 | "Write up the security report artifacts for this service" | Full audit | `requested report artifacts` |
| 8 | "Triage this specific finding" | Guidance | `triage, or investigation of specific findings` (`SKILL.md:14`) |

- 위 발화는 원문 문구를 바탕으로 재구성한 예시이며, 원문에 발화 목록 자체는 없다 (`원문에 명시 없음`).

### 2.3 모드 모호 시 라우팅 규칙

> If the request could mean either mode, ask one focused question before creating files or starting the complete workflow. (`SKILL.md:17`)

- Guidance mode: "Do not automatically run all six phases, create an output directory, or write audit artifacts. You may launch focused agents when useful; they return results to the current task." (`SKILL.md:14`)
- Full audit mode: "Run all six phases and write the files defined below." (`SKILL.md:16`)

### 2.4 의도적으로 배제되는 발화

- 일반 보안 질문/집중 리뷰에 대해 전체 워크플로우 자동 실행은 배제 (`SKILL.md:12,14`).
- 다른 스킬로 넘기라는 라우팅 규칙: 원문에 명시 없음 (컬렉션에 스킬이 이것 하나뿐이며 외부 스킬 지목 없음).
- 동반 파일 간 라우팅(스킬 내부 파일 단위): 예 `Use PROTOCOLS-RPC-AND-MESSAGING.md for protocol authorization and state-machine logic, and this file for process integrity...` (`MEMORY-SAFETY-AND-BINARY.md:5`), `Use CLIENT-SIDE.md for browser-side webview behavior...` (`DESKTOP-MOBILE-AND-LOCAL-IPC.md:7`).

## 3. 적합 / 부적합

### 3.1 적합

- 신뢰 경계가 있는 코드: HTTP/API/서비스/CLI/라이브러리/데몬 (`SKILL.md:3`), 그리고 동반 파일이 다루는 도메인(LLM/MCP 에이전트, 브라우저 SPA·확장, 클라우드 IaC·K8s, 브로커/RPC, 멀티테넌트 저장소, 데스크톱/모바일/로컬 IPC, 네이티브/커널, 공급망/CI).
- 소스 가시성이 높은 저장소 — 원문이 소스 밖 사실은 `needs_validation`으로 처리하도록 규정하므로 (`SKILL.md:148`).
- 에이전트를 여러 개 띄울 수 있는 환경 (정찰 4+, 헌터 다수, 크리틱, 검증자 다수; 원문 역할 구분 `research`/`general`).
- 반복 감사: 이전 실행의 `coverage-ledger.json`/`findings.json`을 읽고 carry-over 규칙을 적용 (`SKILL.md:96-105`).

### 3.2 부적합 / 과함 (원문이 명시하는 한도 내)

- 일반 질문에 풀 워크플로우를 돌리지 말 것: Guidance mode가 기본 (`SKILL.md:12`).
- 라이브 서비스·배포된 엔드포인트·공유 인프라 대상 테스트: 금지 (`SKILL.md:42`). 라이브 pen-test 용도는 이 스킬의 범위가 아니라고 원문이 규정.
- 가용성 스트레스 테스트: 금지 (`SKILL.md:42`, `RESOURCE-EXHAUSTION-AND-AVAILABILITY.md:5`: "Never validate by stressing a shared or live service.").
- 원문이 "작은 타깃에는 quick 프로파일"을 제시: "`quick` — a bounded pass for small targets, re-runs, or a fast first look." (`SKILL.md:111`)
- 소규모 스크립트/프로토타입/핫픽스에 대한 별도 권고: 원문에 명시 없음.

### 3.3 형제 스킬 대비 판정 기준

- 형제 스킬 없음(컬렉션 내 단일 스킬). 내부 기준: "full/comprehensive/end-to-end 또는 report artifacts 요청이면 Full audit, 그 외는 Guidance" (`SKILL.md:3,14,16`).

## 4. 전제 조건과 외부 의존성

### 4.1 실행 스크립트 / 런타임

- 실행 스크립트 있음: `validate-findings.cjs`, `validate-coverage-ledger.cjs` (Node.js CommonJS, shebang `#!/usr/bin/env node` — `validate-findings.cjs:1`, `validate-coverage-ledger.cjs:1`).
- 의존성: Node 내장 모듈만 (`fs`, `path`, `util` 또는 `node:fs`, `node:path`, `node:util`). `validate-findings.cjs:7-8`: "This is a dependency-free interpreter for the JSON Schema keywords used by report-schema.json".
- 테스트는 `node:test`, `node:assert/strict`, `node:child_process`, `node:os` 사용 (`validate-findings.test.cjs:1-6`). 내가 `node --test`로 실행: Node v22.23.1, `# tests 65`, `# pass 65`, `# fail 0`, `# skipped 0` (실행 결과 그대로).
- 검증기는 `fs.constants.O_NOFOLLOW`와 `O_NONBLOCK`이 정수이고 0이 아니어야 동작; 아니면 모든 입력을 거부: `throw new SafeInputError("OS no-follow and nonblocking input protection is unavailable")` (`validate-findings.cjs:604-609`, `validate-coverage-ledger.cjs:721-727`, 주석 "Node exposes no race-safe fallback on these platforms, so reject all inputs." `validate-coverage-ledger.cjs:725`).
- 호출 형태: `node <skill-dir>/validate-findings.cjs <output-dir>/findings.json`, `node <skill-dir>/validate-coverage-ledger.cjs <output-dir>/coverage-ledger.json` (`VALIDATION-AND-REPORTING.md:113-116`).

### 4.2 CLI 도구 / 환경

- 감사 대상 코드를 실행할 때 필요한 것은 OS 강제 샌드박스. 4가지 통제를 전부 요구 (`SKILL.md:33-38`):
  - "no external network; use only an isolated loopback namespace when the check needs local client/server traffic;"
  - "an empty environment populated from an explicit allowlist with safe values, with scratch-local `HOME`, temporary directories, and caches;"
  - "a read-only target and toolchain, with the target-controlled process able to write only inside its assigned `scratch/` directory; and"
  - "explicit low CPU, memory, process, file-size, disk, and wall-clock limits."
- 통제를 하나라도 강제 못 하면: "do not execute target code: report the missing sandbox capability as a needs-validation blocker and give a safe validation plan." (`SKILL.md:40`)
- 샌드박스 구현 도구/명령(예: 특정 샌드박스 런타임): 원문에 명시 없음.
- 의존성 설치/가져오기 금지: "Do not install dependencies or let builds fetch them. Use only tools and dependencies already available locally." (`SKILL.md:40`)
- git/gh/docker/playwright 등 특정 CLI 요구: 원문에 명시 없음. 단 "local Git remote"로 repo name을 얻을 수 있음 (`SKILL.md:50`), `mkfifo`는 테스트에서만 사용 (`validate-findings.test.cjs:469`).

### 4.3 API 키 / 환경변수 / 네트워크

- API 키: 불필요. 네트워크: 사용 금지(대상 실행 시 외부 네트워크 차단, 정찰은 "Do not use network access" `RECONNAISSANCE.md:12`). 유료 API 쿼터 소모 금지 (`SKILL.md:42`: "spend paid API quota").
- 환경변수: 대상 프로세스는 빈 환경 + 허용목록. 기록 시 "only the allowlisted environment variable names plus safe non-secret values" (`SKILL.md:84`).

### 4.4 리포지토리 전제

- 테스트 러너/CI/린터/타입 시스템: 요구 없음 (원문에 명시 없음). 오프라인으로 돌 수 있는 빌드/테스트 명령을 정찰 에이전트가 찾도록 함 (`RECONNAISSANCE.md:16`).
- 커밋 권한/브랜치 전략: 요구 없음. 감사는 대상 소스를 수정하지 않음: "The audit describes fixes; it does not modify target source." (`SKILL.md:166`)
- 소스 ref 기록: "the reviewed commit and whether the worktree is dirty." (`SKILL.md:52`)

### 4.5 비용 발생 지점

- 에이전트 호출 수 = 비용 단위. 예산은 "maximum number of agent invocations across all phases" (`SKILL.md:121`).
- 고정 소비 최소치: 정찰 4회, `quick`은 최종 크리틱 1회, `standard`/`deep`은 post-wave 1 + 구별된 final-clean 1, 검증자 최소 1 (`SKILL.md:123`).
- 파일 크기 스케일: 이 스킬의 .md 파일이 전부 헌터/검증자 프롬프트에 verbatim 복사되는 구조 (`HUNTING.md:18`: "Do not send block or companion names alone."). 토큰 비용 수치 원문에 명시 없음.

### 4.6 상태 파일 / 산출물 디렉터리

- 출력 디렉터리 기본: `~/security-audit-skill/<repo-name>/run-<N>` (`<N>` = next unused integer) (`SKILL.md:51`). 대상 저장소 내부는 "the user explicitly selects it and the parent verifies that version control ignores the whole directory"일 때만; 아니면 "stop and request an external path." (`SKILL.md:51`)
- 부모만 쓰는 공유 파일 7개 (`SKILL.md:56-64`): `run-metadata.json`, `architecture.md`, `coverage-ledger.json`, `findings.json`, `REPORT.md`, `FINDINGS-DETAIL.md`, `NEEDS-VALIDATION.md`.
- 에이전트별: `<output-dir>/agents/<agent-id>/` 하위 `scratch/`, `artifacts/` (`SKILL.md:66`).
- Guidance mode에서는 출력 디렉터리/아티팩트 생성 안 함 (`SKILL.md:14`).
- `/tmp` 또는 호스트 홈은 쓰기 폴백으로 사용 금지: "Do not use `/tmp` or the host home directory as a writable fallback." (`SKILL.md:66`)

## 5. 워크플로우

순서 강제: "In full audit mode, follow all six phases in order" (`SKILL.md:170`). 종료 규칙: "Do not end the run before one of exactly two terminal states: (a) all Phase 6 artifacts are written and both validators pass, or (b) `run_status: "incomplete"` is recorded with its exact reason and the gap is disclosed in the report. Never stop mid-phase." (`SKILL.md:179`)

[게이트] 표시는 탈락/중단/강등이 가능한 단계.

### 5.0 Full audit setup (Phase 0)

- 입력: 사용자 요청. 행동: 아래 값을 정찰 전에 해결 (`SKILL.md:46-52`): Skill directory(절대경로), Target(절대 레포 루트), Repo name, Output directory, Source ref.
- `run-metadata.json` 최소 필드 (`SKILL.md:86`): `run_id`, `repo`, `target`, `source_ref`, `profile`, `scope_paths`, `budget` (null if unset), `execution_policy: "sandboxed-source-and-local-only"`, selected companion files, prior-run paths, shared-file owners, `run_status: "in_progress"`. 이 파일에 대한 검증기/스키마: 원문에 명시 없음.
- 프로파일 기본값: "The default is `standard`." (`SKILL.md:109`)
- [게이트] 출력 디렉터리가 대상 내부이고 VCS ignore 미확인 → "stop and request an external path." (`SKILL.md:51`)
- [사람 개입] 요청이 두 모드 중 모호 → "ask one focused question" (`SKILL.md:17`). 프로파일은 "from the user's request or propose one from the target's size and stakes" (`SKILL.md:109`).

### 5.0.1 비용 예산 게이트 (정찰 전)

- [게이트] "Apply the strict budget gate before launching any reconnaissance agent." 예약: 정찰 기본 4회 + (quick: 최종 post-wave 크리틱 1 | standard/deep: post-wave 1 + 별도 final-clean 1) + 검증자 최소 1 (`SKILL.md:123`).
- 탈락 시: "launch no agent: ask for a larger budget, narrower scope, or different profile. If the request remains unchanged, set `run_status: "incomplete"` with `incomplete_reason: "budget_cannot_fund_reconnaissance_and_reserves"` and report that no audit pass ran." (`SKILL.md:123`)
- 지출 순서 (`SKILL.md:125-130`): (1) 정찰/모든 post-wave 크리틱/final-clean 크리틱을 호출로 계산 (2) 헌팅 전 크리틱·검증 예약 — 검증 예약은 "about 1 or 2 agents per expected candidate; when in doubt reserve 30% of the balance after critic reservation" (3) 우선순위 순으로 헌터 배정 (4) 다음 wave 전 재예약, 불가 시 계획 unit을 `deferred`, reason `budget_cannot_reserve_critics_and_validation`.
- 최종 크리틱 예약이 소진되면: "launch no hunters, mark all planned work deferred, set the run incomplete with reason `critic_budget_exhausted`, and make no complete-coverage claim." (`SKILL.md:132`)
- 검증 예산 소진: `run_status: "incomplete"` + `incomplete_reason: "validation_budget_exhausted"`, 후보는 fingerprint 순으로 검증, 미검증 후보는 `candidate` 원장 unit에 남기고 `findings.json`에 넣지 않음; "Never exceed a user-set strict budget silently." (`SKILL.md:134`)
- 파라미터 `budget` 수치 기본값: 원문에 명시 없음 (미설정 시 null).

### 5.1 Phase 1 — Reconnaissance (`RECONNAISSANCE.md`)

| 항목 | 내용 |
|---|---|
| 입력 | 대상 소스, 로컬 빌드/설정 상태, 이전 실행 산출물 |
| 행동 | `research` 에이전트 병렬 실행 (파일 쓰지 않고 구조화 사실 반환, `RECONNAISSANCE.md:7`) |
| Agent 1a | 제품/스택/로컬 운영: 제품 유형, 언어/프레임워크, 진입점, 오프라인 빌드·테스트 명령(실행하지 않음), 비교 가능 소프트웨어, 결손 툴체인 (`RECONNAISSANCE.md:11-20`) |
| Agent 1b | 주체/권한/통제: 낮은 신뢰 주체, 인증, 리소스별 인가, 프로세스/브라우저/CI/플러그인/모델-도구/디바이스/IPC 권한, 권한 변경 경로 (`RECONNAISSANCE.md:24-33`) |
| Agent 1c | 진입 표면/사본/싱크: HTTP·RPC·파일·CLI·플러그인·클라우드 이벤트·모델 컨텍스트·모바일·로컬 IPC (`RECONNAISSANCE.md:37-42`) |
| Agent 1d | 로컬 실행/배포 가시성: 오프라인 테스트, 루프백 가능 프로세스, 금지 명령, 배포 통제 중 소스로 확인 불가한 것, 샌드박스/승격 통제 가능 여부 (`RECONNAISSANCE.md:46-54`) |
| 출력 | `architecture.md`(약 1,000 단어 상한), `coverage-ledger.json` |
| 통과 조건 | 원장 검증기 PASS (seed 후, 모든 부모 갱신 후, Phase 6 전: `RECONNAISSANCE.md:156`) |

- "Return only source facts with repository-relative file:line references." (`RECONNAISSANCE.md:19`)
- 추가 정찰 에이전트: 예산 게이트가 막으면 "launch nothing for it, seed the unmapped area as a `deferred` ledger unit with reason `budget_cannot_reserve_critics_and_validation`, and disclose the gap in the report." (`RECONNAISSANCE.md:57`)
- [게이트] 샌드박스 통제 결손(1d-6) → 대상 실행 불가; 승격 통제 결손(1d-7) → 스크래치 파일을 증거로 사용 불가: "Missing controls block target-controlled execution." / "Missing promotion controls block use of scratch files as evidence." (`RECONNAISSANCE.md:53-54`)
- `architecture.md` 내용 8항목 (`RECONNAISSANCE.md:77-84`): 제품/주체/권한/보호 자원, 비교 소프트웨어 기준선(있을 때만), 스택/배포 경로/오프라인 빌드 한계, 진입 표면과 주요 경로, 신뢰 경계 및 가장 강한 통제, 시작 경로, 이전 커버리지 갭/재검증 대상/제외 목록, 동반 파일 선택 요약.
- 동반 파일 선택 기준: "Do not select a companion file merely because the language or dependency name appears. Select it because reconnaissance found the trust-sensitive boundary described by its `When to use this file` section." (`RECONNAISSANCE.md:88`)

#### 5.1.1 이전 실행 반입 규칙 (`SKILL.md:96-105`, `RECONNAISSANCE.md:59-71`)

| 이전 레코드 | 현재 처리 |
|---|---|
| `confirmed`, 관련 소스·조건 불변 | 후보 집합으로 carry, 같은 fingerprint, `prior_status: "prior_confirmed_same_source"`의 `planned` unit에 연결, 해당 근본 원인만 헌터 제외 목록에, Phase 3 검증자가 unit 소유자가 되어 `candidate`로 이동 |
| `confirmed`, 소스 변경 | `prior_confirmed_changed_source` 재검증 unit(planned), 헌터 제외 목록에 넣지 않음 |
| `needs_validation`/`deferred`/`blocked`/`out_of_scope`/변경 소스 | 현재 작업 (억제 키 아님) |
| 여전히 외부 blocked인 `needs_validation` | 소스 trace 확인 후 같은 fingerprint로 carry, `prior_needs_validation` unit |
| `rejected` | "suppresses only the unchanged failed claim, not coverage of its unit" |
| 이전 `quick`/scoped 원장 | "contributes only its recorded evidence and gaps, never an implied 'rest is fine.'" (`SKILL.md:103`) |
| 원장 없음 | 최종 커버리지 서술에 "say so" (`SKILL.md:105`); 호환 불가 원장은 "Record missing or incompatible ledgers instead of treating them as empty coverage." (`RECONNAISSANCE.md:69`) |

#### 5.1.2 결정론적 커버리지 원장 (`RECONNAISSANCE.md:90-156`)

- 단위: surface × boundary × subsystem × attack_class (+ 선택적 `lifecycle`). `quick`은 subsystem을 `profile/quick/all-in-scope-subsystems` 고정값, `deep`은 lifecycle 모드 추가 (`RECONNAISSANCE.md:92,102`).
- `coverage_id` 도출 (`RECONNAISSANCE.md:96-102`): (1) 각 ref는 Unicode NFC, 유효 scalar, 보이는 내용, 제어/포맷/줄·문단 구분자/default-ignorable 없음, 앞뒤 공백 없음; (2) UTF-8 바이트를 RFC 3986 퍼센트 인코딩 (`A-Z a-z 0-9 - . _ ~`만 비이스케이프, 나머지 대문자 `%HH`); (3) `surface`, `boundary`, `subsystem`, `attack_class`(+`lifecycle`)를 `::`로 연결.
- 블록 참조: "`FILE.md#` plus the exact class name as written in bold or as a heading in that file — a stable identifier matched against the file text, not a rendered HTML anchor." 동반 섹션은 괄호 수식어 앞 제목 텍스트 사용, 예 `Core discipline` (`RECONNAISSANCE.md:94`).
- 정렬: "Sort units lexicographically by `coverage_id` before each assignment. Fail on every duplicate ID." (`RECONNAISSANCE.md:102`)
- unit JSON 필드: `coverage_id`, `canonical_refs`, `surface`, `boundary`, `subsystem`, `attack_class`, `starting_paths`, `ordinary_attack_class_block`, `selected_companion_blocks`, `excluded_blocks`, `prior_status`, `attempts`, `wave`, `status`, `agent_id`, `reviewed_paths`, `local_checks`, `result_fingerprints`, `unresolved` (`RECONNAISSANCE.md:106-133`, 검증기 `REQUIRED_FIELDS` 19개와 일치: `validate-coverage-ledger.cjs:26-46`).
- 상태표 (`RECONNAISSANCE.md:141-150`; 코드 `validate-coverage-ledger.cjs:518-566`와 대조):

| status | unit `agent_id` | `reviewed_paths`/`local_checks` | `result_fingerprints` | `unresolved` |
|---|---|---|---|---|
| `planned` | null | empty | empty | empty |
| `not_applicable`, `out_of_scope`, `deferred` | null | empty | empty | nonempty reason |
| `in_progress` | canonical owner | empty | empty | empty |
| `blocked` | canonical owner | both nonempty | empty | nonempty blocker |
| `covered` | canonical owner | both nonempty | empty | empty |
| `candidate` | canonical owner | both nonempty | nonempty | optional |

- `attempts` 아카이브: critic이 재개방한 evidence-bearing 할당만 (`blocked`/`covered`/`candidate`). "Archived attempts ... use strictly increasing waves below the current wave" (`RECONNAISSANCE.md:139`).
- 원장이 곧 커버리지 주장: "An architecture summary, agent count, or generic 'auth reviewed' sentence is not coverage evidence." (`RECONNAISSANCE.md:154`)

### 5.2 Phase 2 — Coverage-led hunting waves (`HUNTING.md`)

- 입력: `planned` unit. 행동: `general` 에이전트에 unit 배정 (`HUNTING.md:5`). 출력: 에이전트당 정확히 1개의 JSON 객체(구조화 결과). 통과: unit별로 부모가 검증 후 원장 갱신.
- 배정 우선순위 (`HUNTING.md:7`): (1) 비인증/최저 신뢰 진입 표면 우선 (2) 가치 높은 자원 보호 경계 (3) 이전 실행 갭/재검증/변경 소스 (4) 해당 타깃 유형에서 과거 confirmed가 잘 나온 클래스. 동률은 `coverage_id` 사전순.
- 예산/프로파일이 헌터 수를 제한할 때: "no unit may be silently unassigned because of an agent-count limit" (`HUNTING.md:5`).
- 배정 시: unit을 `in_progress`로, canonical 소문자 `agent_id` 설정, `scratch/`·부모 소유 `artifacts/` 생성 (`HUNTING.md:9`).
- 헌터 프롬프트 9구성요소 순서 (`HUNTING.md:13-23`): 2문장 역할 서문 → `architecture.md` verbatim → 배정 coverage ID/경계/시작 경로/블록 맵 → 선택된 블록 원문 복사 (ordinary 블록 + 동반의 `Core discipline`, 선택 클래스 절, `Universal moves`, `Validation rules`) → 제외 블록과 사유 → 핵심 사냥 방법 + 승격 절차 블록 → 핵심 검증 규칙 → carried 제외 목록(fingerprint, title, root cause만)과 동료 소유 coverage ID → 경로/ID/allowlist/바이트 한도/구조화 결과 계약 + 스키마의 confirmed·needs_validation 분기 verbatim.
- 헌터 쓰기 권한: 자기 `scratch/`만; "They never write retained artifacts or edit target source, `architecture.md`, `coverage-ledger.json`, `findings.json`, or another agent's files." (`HUNTING.md:9`)
- 핵심 사냥 방법 블록 (`HUNTING.md:29-97`) 주요 규칙:
  - 목표: "find source-grounded security invariant failures and the smallest fix, not to expand harm beyond the boundary result."
  - 로컬 실행 금지 대상: "Do not contact deployed endpoints, provider APIs, registries, identity systems, message brokers, shared services, or other users. Use local dummy data only."
  - 구체 불변식 6단계: 낮은 신뢰 주체 → 수용 값 → 통제 위치 → 이후 소스 경로 → 최소 영향 지점에서 정지 → 소스 수준 수정+회귀 케이스.
  - "DEPTH BOUND: trace only paths that can reach your assigned boundary or whose guarantees that boundary relies on."
  - 슬픈 경로 점검: absent, empty, zero, negative, maximum, over-limit, duplicate, mixed encoding, stale, revoked, reordered, concurrent, partially migrated, failed dependency, rollback — "only where the interface accepts them".
  - 고/치명 후보의 재사용 근본 원인은 배정된 coverage ID 안에서 변형 탐색; 동료 unit 조사 금지, 변형은 `uncovered`로 반환.
  - 샌드박스 통제 하나라도 없으면 "do not execute: return needs_validation with that exact blocker."
  - "Never stress availability, invoke a live target, use a real credential, publish an artifact, or continue past the minimum observed effect."
- 승격 절차 블록 11단계 (`HUNTING.md:102-135`, `SKILL.md:70-80`과 동일): 상대경로 검증(절대/빈 값/`.`/`..`/심볼릭 거부) → 부모 디스크립터에서 no-follow 순회 → leaf를 no-follow+nonblocking으로 열기 → `fstat`로 일반 파일, 링크 수 정확히 1, 파일별/누적 바이트 한도 이내 → 읽는 중 한도 재강제 → 검증 크기만큼 복사 후 `fstat` 재확인 → 대상 쪽도 no-follow 순회, 누락 디렉터리는 배타 생성 → leaf 배타 생성, 링크 수 1 → 비POSIX는 동등 race-safe API → 재귀 복사/glob/아카이브 풀기/심볼릭·FIFO·소켓·장치·디렉터리·하드링크·변동 파일 금지 → 실패 시 scratch 항목 폐기, 결정적 증거면 `needs_validation`+승격 차단 사유. "Reference only for you: the parent performs these steps; you never perform them."
- 후보 게이트 (`HUNTING.md:141-157`, "Candidate gate" 7항):
  1. 완전한 저장소 상대 소스 trace + 근본 원인 증거(가장 강한 소스 가시 통제 포함)
  2. confirmed 제안 = 제한된 로컬 관측 결과 + 명시된 경계 너머의 의미 있는 영향 + 완전한 조건 + 방해 계층 없음
  3. 크래시→코드 실행, 일반 작업→공유 가용성, 동일 주체 행위→권한 상승으로 강화 금지
  4. 소스 가시/로컬 관측 불가 사실은 `needs_validation`, 정확한 blockers, severity 없음
  5. 대상 주체/자원 없는 베스트 프랙티스 누락은 hardening, "A candidate disproved by source is not needs_validation."
  6. 같은 근본 원인은 모든 상태에서 같은 fingerprint, 패턴 `^[A-Za-z0-9][A-Za-z0-9._:/@+-]*$`, 줄/wave/agent/severity/verdict 포함 금지
  7. 아무것도 통과 못하면 빈 후보 배열 반환
- 로컬 검증 허용/금지 (`HUNTING.md:163-164`): 허용 = 오프라인 빌드, 격리 루프백 프로세스(더미 상태), 단위·통합 테스트, 작은 픽스처, 새니타이저, 제한된 퍼즈/회귀 테스트, 결정적 동시성 검사, 더미 계정 브라우저/에뮬레이터 테스트, 렌더된 매니페스트/정책 평가, 모의 외부/유료 호출. 금지 = 라이브/배포 트래픽, 이 검사용으로 시작하지 않은 서비스 요청, 네트워크 의존성 설치, 실계정/자격 증명, 프로덕션 데이터, 공유 큐/클라우드 자원/러너/레지스트리/서명·릴리스 서비스, 게시, 스트레스/포화/비용 생성, 최소 더미 경계 결과 이후 작업.
- 구조화 헌터 결과 JSON (`HUNTING.md:173-206`): 최상위 키 `units`, `candidates`, `hardening`, `uncovered`. unit 항목 `coverage_id`, `disposition: covered|candidate|blocked`, `reviewed_paths`, `checks[]`(`agent_id`, `reviewed_paths`, `invariant`, `method: source|local`, `result`, `artifact`), `candidate_fingerprints`, `unresolved`.
- 후보 항목은 스키마 형태이나 `verdict` 대신 `proposed_verdict` 사용 (`HUNTING.md:208`).
- "Every assigned coverage ID appears exactly once in `units`." (`HUNTING.md:213`)
- 부모 통합 (`HUNTING.md:217`): 검증 후 정확히 1개 coverage_id에 매핑, 중복/누락 ID·위험한 agent ID·artifact 있는 source 체크·부모 미승격 local artifact는 거부. 실패/불량 결론은 unit을 `planned`로 남겨 재배정. 매 갱신 후 `validate-coverage-ledger.cjs` 실행: "an invalid ledger cannot drive another assignment." [게이트]
- 후보 통합: fingerprint → 근본 원인 순. "One root cause that exposes several entry paths or effects is one candidate with the strongest complete trace." (`HUNTING.md:219`)

### 5.2.1 커버리지 크리틱 웨이브 (`HUNTING.md:221-251`)

- 매 헌터 wave 직후 신선한 `research` post-wave 커버리지 크리틱 1회 (예약분). 입력: `architecture.md`, 전체 원장, 현재 후보 fingerprint/상태, 이전 원장 갭 요약. 소스 읽기만, 쓰기/실행 없음.
- 출력 JSON: `missing_units[]`(surface, boundary, subsystem, attack_class, starting_paths, selected_companion_blocks, excluded_blocks, reason), `reassign_ids`, `resolved_prior_leads`, `stop` (`HUNTING.md:225-243`).
- `stop`: "true only when it accepts no `missing_units` and no `reassign_ids`; the parent's loop condition below, not `stop` alone, decides whether another wave runs."
- [게이트] standard/deep 완료 조건: post-wave 크리틱이 수용 가능한 `missing_units`/`reassign_ids` 없음 + `planned` unit 없음 → 별도 예약된 구별된 final-clean 크리틱 → "Complete coverage only when that critic also returns no accepted work. If it finds work, queue it and repeat the wave, post-wave critic, and final-clean process." (`HUNTING.md:247`)
- reassign: `blocked`/`covered`/`candidate` 증거가 있는 unit의 최종 레코드를 `attempts`에 append(재할당 사유 포함), `wave` 증가, 새 owner는 신선해야 하고 live 증거는 비어 시작; 이전 owner의 checks/artifacts를 새 live 시도에 복사 금지.
- 조기 종료: "mark every untouched unit `deferred`, preserve the critic's reason, and disclose the gap in the report. Never use a silent wave or agent cap as evidence of complete coverage." (`HUNTING.md:247`)
- `quick` 규칙 (`HUNTING.md:249`): 정확히 1 wave + 정확히 1 최종 크리틱; 수용된 `missing_unit`은 `deferred`, reason `quick_profile_final_critic`; reassign은 아카이브 후 `wave` 증가, null owner `deferred`; 두 번째 wave/크리틱 없음. Scoped run은 범위 밖 갭을 `out_of_scope`로 기록.

### 5.3 Phase 3 — 후보 독립 검증 (`VALIDATION-AND-REPORTING.md:3-93`)

- 입력: 깨끗한 크리틱 통과 또는 기록된 조기 종료 후 통합된 고유 후보 + carry된 same-source confirmed. 행동: 각 후보를 "did not hunt it" 신선한 `general` 검증자에게 (`VALIDATION-AND-REPORTING.md:5`). 출력: `{"decision": "confirmed|needs_validation|rejected", "record": { ... }}` (`:42-44`). 통과 조건: 부모가 fingerprint 동일 확인.
- 검증자는 다른 검증자의 결론을 받지 않음 (`:7`). 모든 인용 소스 위치를 재독하고 안전하게 재현 가능한 결정적 검사를 독립 실행.
- 검증자 프롬프트 6항 (`:12-46`): "You did not write this candidate. Try to refute it from repository source and bounded local evidence." 항목 — trace/evidence 재확인, 가장 강한 소스 통제 재구성(비교 기준선은 보정용, 기각 근거 아님), confirmed 최소 결과 독립 재현, likelihood/impact/confidence/수정안이 증거와 일치하는지, needs_validation blocker가 정말 소스/로컬 관측 밖인지, fingerprint 보존.
- 강등/승격 규칙 (`:87`): "A verifier can promote `needs_validation` to `confirmed` only after independently establishing the complete path and bounded observed result." 구체 배포/런타임 사실 불명 시 confirmed→needs_validation 강등. "`needs_validation` is never a parking place for a speculative idea."
- 불량 verifier 결과: "Discard a malformed or prose-wrapped verifier result without repairing it; re-run that candidate with a fresh verifier when the budget permits, otherwise it remains an unvalidated ledger candidate" (`:89`).
- 원장 갱신: 검증자 증거는 check의 `agent_id`를 검증자 ID로, unit 소유자는 유지; carry된 planned unit은 검증자가 소유자가 되어 `candidate`로 (`:91`).

### 5.4 Phase 4 — `findings.json` 작성/검증 (`:95-118`)

- 입력: 독립 판정된 레코드 전부. 행동: 부모가 fingerprint 순으로 `findings.json` 작성. 출력: 레코드 배열 (`confirmed`/`needs_validation`/`rejected`).
- "Read `report-schema.json` immediately before writing. It uses `additionalProperties: false`; do not carry hunter wrapper fields into a record." (`:103`)
- [게이트] 두 검증기 실행; "Fix every structural and semantic error before continuing." (`:118`) "Validator success proves format and ledger consistency only." (`:118`)
- 검증기 세부 임계값은 6절 표 참조.

### 5.5 Phase 5 — 최종 레코드 검증 (`:120-149`)

- 입력: `findings.json`의 `confirmed`/`needs_validation` 레코드. 행동: 레코드당 신선한 `research` 검증자, 병렬. 출력: `{"decision":"verified","fingerprint":"..."}` 또는 `{"decision":"replace","reason":"...","record":{...}}` (`:143`).
- `quick`: Phase 3와 5 병합, "Never skip independent review of a `confirmed` record in any profile." (`:124`)
- [게이트] 실질적 교체(더 강한 판정으로 승격, 근본 원인/trace/실행 입력·관측 결과/영향/심각도 변경): 최종 반영 금지, 헌팅·Phase 3·교체 제안에 관여하지 않은 새 독립 검증자 필요. 예산/독립성 불가 시 "remove the disputed record from `findings.json`, keep its ledger unit as an unresolved candidate, and set `run_status: "incomplete"` with an exact `incomplete_reason`." (`:145`) 비실질적 문구/줄번호 정정은 직접 적용 가능.
- 반영 후: 두 검증기 재실행; 별도 근본 원인이면 새 fingerprint로 후보 검증부터 다시. "Set `run_status: "complete"` only when every ledger candidate has an independent final disposition and every retained record passes Phase 5." (`:147`)
- 원문 경고: "Do not verify only `confirmed` records. A misleading `needs_validation` handoff wastes owner time and can preserve a false premise." (`:149`)

### 5.6 Phase 6 — 리포트 (`:151-186`)

- 입력: Phase 5 통과 레코드 + 원장 + 헌터 `hardening` 노트. 출력: `REPORT.md`, `FINDINGS-DETAIL.md`, `NEEDS-VALIDATION.md` (`SKILL.md:177`). "The prose files never change a verdict, severity, blocker, or demonstrated impact." (`:153`)
- 불완전 실행은 독립 검증된 레코드만 보고하고 미해결 원장 후보를 식별하되 finding으로 제시 금지.
- 세부 포맷은 7절.

### 5.7 루프/수렴 구조 도식

```
Phase1 recon(4+) -> ledger seed -> [validator]
   |
   v
Phase2: wave(hunters, general) -> parent consolidate -> [validator] -> post-wave critic(research)
   ^                                                              |
   |-- accepted missing_units/reassign_ids --------------------<--|
                                                                  v (none, no planned left; standard/deep)
                                              final-clean critic (distinct) --accepted work--> back to wave
                                                                  | none
                                                                  v
Phase3 verifier(general, fresh) per unique candidate
Phase4 findings.json -> [validate-findings] + [validate-coverage-ledger]
Phase5 verifier(research, fresh) per confirmed/needs_validation (replace -> fresh verifier again if material)
Phase6 REPORT / FINDINGS-DETAIL / NEEDS-VALIDATION
terminal: (a) artifacts + both validators pass | (b) run_status "incomplete" + reason
```

- 루프 반복 상한 수치(최대 wave 수): 원문에 명시 없음. 종료는 크리틱 무작업 또는 예산/프로파일 제약으로 결정.

### 5.8 프로파일별 차이 (`SKILL.md:107-117`)

| 프로파일 | 원장 단위 | 헌터 wave | 크리틱 | 검증 |
|---|---|---|---|---|
| `quick` | surface × boundary × attack class (subsystem 고정 `profile/quick/all-in-scope-subsystems`) | 정확히 1 | 정확히 1 최종 | 후보당 신선한 검증자 1개가 후보 검증+최종 레코드 검증 |
| `standard` | 문서대로 | 반복 | post-wave + 별도 final-clean | Phase 3, 5 분리 |
| `deep` | subsystem × lifecycle 모드 분할 | 크리틱 웨이브를 clean pass까지 | clean pass까지 | Phase 3, 5 별도 신선 에이전트, `prior_covered_same_source` unit에 독립 2차 패스 |

- "Profiles change breadth and redundancy, never the evidence bar. Do not scale away the candidate gate, the source/local execution boundary, `needs_validation` discipline, schema validation, or independent verification of `confirmed` records." (`SKILL.md:117`)
- Scoped run: 범위 밖 표면은 `out_of_scope`, 절대 `covered` 아님; "A scoped or `quick` run must present itself as partial coverage." (`SKILL.md:115`)

## 6. 엔지니어링 규칙 분석

### 6.1 금지 규칙 (anti-pattern) 원문 + 막으려는 실패 모드

`SKILL.md:181-192` 10항:

| # | 원문 | 막으려는 실패 모드 |
|---|---|---|
| 1 | Checklist deviations presented as vulnerabilities. | 체크리스트 위반을 취약점으로 부풀림 |
| 2 | Defense-in-depth advice with no reachable boundary violation. | 도달 불가능 경계 권고 남발 |
| 3 | Live or shared-environment testing where bounded local evidence is insufficient. | 라이브 테스트로 증거 보충 |
| 4 | Guessing provider, proxy, browser, identity, or deployment behavior not present in source. | 소스 밖 사실 추측 |
| 5 | Treating intended same-principal authority or self-impact as a cross-boundary result. | 자기 권한/자기 피해를 경계 침범으로 오분류 |
| 6 | Reporting a parser or runtime effect stronger than the observed effect. | 관측보다 과장된 영향 |
| 7 | Emitting prose-only hunter results that cannot be deduplicated or verified. | 중복 제거/검증 불가 산출 |
| 8 | Re-reporting carried same-source prior confirmed records or using them as exemplars that anchor the hunt. | 이전 확정 재보고 및 앵커링 |
| 9 | Assigning severity to `needs_validation` records. | 미확정 건에 심각도 부여 |
| 10 | Writing the report before independent verification or letting prose and JSON disagree. | 검증 전 보고, 산문-JSON 불일치 |

추가 금지/한도(분산 규칙):
- "Do not elevate a missing best practice, guessed deployment behavior, generic parser crash, or self-impact into a security finding." (`SKILL.md:140`)
- "Do not extend the local check beyond the minimum boundary result or produce persistence, post-fault, or concealment material." (`SKILL.md:144`)
- 도메인별 "not a finding" 규칙 예: "Prompt injection alone is not a finding." (`AI-AND-LLM.md:12`), "A missing header, cookie attribute, MFA prompt, or rate limit is not a finding alone." (`WEB-PROTOCOL-AND-AUTH.md:15`), "Self-injection and disclosure of the attacker's own data are not findings." (`CLIENT-SIDE.md:13`), "A missing rate limit is not enough." (`RESOURCE-EXHAUSTION-AND-AVAILABILITY.md:13`).
- Obvious things 에이전트 주의: "A flag is not a finding — trace the impact before reporting." (`ATTACK-CLASSES.md:130`)

### 6.2 강제 규칙 (수치·임계값)

#### 6.2.1 SKILL.md/MD 수치

| 항목 | 값 | 출처 |
|---|---|---|
| 워크플로우 단계 수 | 6 | `SKILL.md:170-177` |
| 정찰 기본 에이전트 수 | 4 (1a-1d) | `SKILL.md:123`, `RECONNAISSANCE.md:9-54` |
| `architecture.md` 상한 | "hard cap of about 1,000 words" | `RECONNAISSANCE.md:75` |
| 검증 예약 | "about 1 or 2 agents per expected candidate; when in doubt reserve 30% of the balance after critic reservation" | `SKILL.md:128` |
| 기본 프로파일 | `standard` | `SKILL.md:109` |
| 기본 출력 경로 | `~/security-audit-skill/<repo-name>/run-<N>` | `SKILL.md:51` |
| Agent ID 정규식 | `^[a-z0-9][a-z0-9_-]{0,63}$` (64자 이내), Windows 장치명 제외 `con`, `prn`, `aux`, `nul`, `com1`-`com9`, `lpt1`-`lpt9` | `SKILL.md:66` |
| 승격 절차 단계 | 11 | `SKILL.md:70-80` |
| 승격 링크 수 | "link count exactly one" | `SKILL.md:73,77` |
| `quick` wave/크리틱 | "exactly one hunter wave followed by exactly one final coverage-critic pass" | `SKILL.md:111` |
| severity 앵커 | critical / high / medium / low / informational (5단계) | `SKILL.md:154-160` |
| 5 MiB 입력 한도 실무 | "roughly 2,000-5,000 realistic units" | `RECONNAISSANCE.md:156` |
| findings 검증기 한도 서술 | "5 MiB, 1,000 top-level findings, or 64 nesting levels, and caps reported error output at 100 messages" | `VALIDATION-AND-REPORTING.md:118` |
| 원장 검증기 한도 서술 | "5 MiB, 64 nesting levels, 10,000 units, 1,000 entries in a nested collection, or 500,000 traversed values" | `RECONNAISSANCE.md:156` |
| 헌터 결과 후보 | 없으면 빈 배열 | `HUNTING.md:156` |

#### 6.2.2 심각도 앵커 원문 (`SKILL.md:154-162`)

- **critical** — an unauthenticated actor gains code execution, full data-store access, or takeover of arbitrary accounts.
- **high** — an actor fully defeats an explicit security control with real consequences: authentication bypass, cross-tenant read or write, stored script execution affecting other users, authenticated code execution, or an unauthenticated remote stop of a shared service.
- **medium** — a real boundary violation with limited blast radius, uncommon preconditions, or consequences confined to a narrow resource set.
- **low** — disclosure of non-secret internals, or an effect requiring sustained effort for minimal gain.
- **informational** — a confirmed but minimal-impact observation, useful mainly as a prerequisite inside a larger finding.
- 판별: "does the demonstrated result fully defeat an explicit control for an action with real consequences, or only weaken it? If you cannot state the concrete damage, the severity is lower than it feels."
- "Only `confirmed` records receive severity." (`SKILL.md:152`); "overall severity cannot exceed demonstrated impact" (`SKILL.md:152`) — 코드로 강제됨 (6.3.3).

#### 6.2.3 report-schema.json 필드/열거형

최상위: `"type": "array"`, `items.oneOf` 3분기 (`report-schema.json:3-6, 246, 363`). `$comment`: "Top-level contract for findings.json. validate-findings.cjs interprets and checks this schema directly." (`:2`)

**confirmed** (`report-schema.json:7-245`)
- `required` 13개 (`:243`): `verdict`, `fingerprint`, `title`, `description`, `root_cause`, `intended_behavior`, `trace`, `evidence`, `conditions`, `execution`, `remediation`, `severity`, `confidence`. `additionalProperties: false`.
- `verdict` const `confirmed`; `fingerprint` minLength 1, pattern `^[A-Za-z0-9][A-Za-z0-9._:/@+-]*$` (`:14-19`).
- `trace` minItems 1, uniqueItems; 항목 required `kind`, `file`, `line`, `scope`, `description`; `kind` enum `["entrypoint", "propagation", "sink"]`; `line` integer minimum 1 (`:40-73`).
- `evidence` minItems 1, uniqueItems; 항목 `file`, `line`(min 1), `description` (`:74-98`).
- `conditions`(uniqueItems, minItems 없음 → 빈 배열 허용); 항목 `kind` enum 9개: `authentication_level`, `authorization_role`, `user_interaction`, `system_configuration`, `network_routing`, `environmental_dependency`, `data_state`, `timing_dependency`, `third_party_dependency`; `description` (`:99-118`).
- `execution` required `attacker_perspective`, `payloads`, `instructions`, `observed_result`; `payloads` minItems 1, uniqueItems, 항목은 string(길이 제한 없음 — 빈 문자열 허용: 테스트 `validate-findings.test.cjs:159-160`); `instructions` minItems 1 (`:119-153`).
- `remediation` required `strategy`; `code_changes[]` 항목 required `file_name`, `fixed_code` (`fixed_code` minLength 없음) (`:154-182`).
- `severity` required `likelihood`, `impact`, `overall_severity`; `likelihood.score`/`impact.score`/`overall_severity` enum `["informational", "low", "medium", "high", "critical"]` (`:183-225`); score 객체 required `score`, `reason`.
- `confidence` required `score`, `reason`; `score` enum `["low", "medium", "high"]` (`:226-241`).

**needs_validation** (`report-schema.json:246-362`)
- `required` 9개 (`:360`): `verdict`, `fingerprint`, `title`, `description`, `claimed_root_cause`, `trace`, `evidence`, `blockers`, `validation_plan`.
- `blockers` minItems 1, uniqueItems, 항목 minLength 1 + visibleContent (`:333-342`).
- `validation_plan` 객체: 속성 `local`, `deployment`(각각 minLength 1 + visibleContent), `required` 없음 (`:343-358`). 둘 중 하나 이상은 코드가 강제 (6.3.3).

**rejected** (`report-schema.json:363-458`)
- `required` 8개 (`:456`): `verdict`, `fingerprint`, `title`, `description`, `claimed_root_cause`, `trace`, `evidence`, `reason`.

`visibleContent`는 표준 JSON Schema 키워드가 아닌 확장 키워드이며 검증기가 직접 지원 (`validate-findings.cjs:33`).

### 6.3 검증기 스크립트 분석 (실제 상수, 임계값, 종료 코드, 실패 조건)

#### 6.3.1 `validate-findings.cjs` 상수/한도

| 상수 | 값 | 줄 |
|---|---|---|
| `LIMITS.inputBytes` | `5 * 1024 * 1024` (5 MiB) | `validate-findings.cjs:43` |
| `LIMITS.nestingDepth` | 64 | `:44` |
| `LIMITS.arrayItems` | 1000 (모든 배열에 적용) | `:45`, 적용 `:222-225`, 텍스트 `:661` |
| `LIMITS.canonicalKeyBytes` | `1024 * 1024` | `:46` |
| `LIMITS.uniqueSetBytes` | `5 * 1024 * 1024` | `:47` |
| `LIMITS.validationErrors` | 100 | `:48` |
| `MAX_DIAGNOSTIC_STRING_LENGTH` | 256 | `:55` |
| `SEVERITY_RANK` | informational 0, low 1, medium 2, high 3, critical 4 | `:35-41` |
| 지원 스키마 키워드 | `$comment`, `additionalProperties`, `const`, `description`, `enum`, `items`, `minimum`, `minItems`, `minLength`, `oneOf`, `pattern`, `properties`, `required`, `type`, `uniqueItems`, `visibleContent` (16개) | `:17-34` |
| 지원 type | object, array, string, integer, number, boolean, null | `:16` |
| 읽기 버퍼 | 64 KiB (`64 * 1024`) | `:630` |

- 스키마 자체 검증: 미지원 키워드(`format`, `maxItems` 등)는 오류 (`:256-258`; 테스트 `validate-findings.test.cjs:531-537`), `visibleContent: true`는 `type: "string"` 필요 (`:333-335`), `enum` 비어있거나 중복 불가 (`:286-306`), `pattern` 정규식 유효성 (`:316-326`).
- `oneOf`: 정확히 1개 분기 통과 필요, 아니면 `must match exactly one schema in oneOf; matched N` (`:369-370`). 0개 매치 시 `verdict` const가 일치하는 단일 분기의 오류를 상세 표시 (`:371-378`).
- 문자열: `minLength`는 코드포인트 기준 (`:441`, `codePointLength` `:127-139`); `visibleContent`는 유효 유니코드 scalar + `VISIBLE_CONTENT` 정규식 (`:444-449`); `VISIBLE_CONTENT = /[^\p{White_Space}\p{Cc}\p{Cf}\p{Default_Ignorable_Code_Point}]/u` (`:50`).
- 소스 경로 안전성 `isSafeRelativeSourcePath` (`:473-483`): 비어 있지 않음, 유효 scalar, 앞뒤 공백 없음, `PATH_FORBIDDEN_CHARACTER`(`\p{Cc}\p{Cf}\p{Zl}\p{Zp}\p{Default_Ignorable_Code_Point}`) 없음, `\` 불가, `:` 불가, POSIX/Win32 절대경로·`^[A-Za-z]:`·`~` 시작 불가, 세그먼트가 빈 값/`.`/`..`/끝이 공백 또는 `.`/Windows 예약 이름(`con|prn|aux|nul|clock$|conin$|conout$|com[1-9¹²³]|lpt[1-9¹²³]` 뒤 `.` 또는 끝, 대소문자 무시) 불가 (`:52`).
- 의미 검사 `collectFindingSemanticErrors` (`:485-583`):
  - fingerprint 중복 금지 (`:497-501`), 배열은 fingerprint 사전순(`previousFingerprint > finding.fingerprint` 시 `findings must be sorted lexicographically`) (`:502-504`).
  - `trace`/`evidence` 항목 `line` 양의 정수, `file` 안전 경로 (`:508-519`); `remediation.code_changes[].file_name` 안전 경로 (`:520-526`).
  - trace 순서: 1항목이면 `entrypoint` 또는 `sink`; 2항목 이상이면 첫째 `entrypoint`, 마지막 `sink`, 중간 `propagation` (`:528-546`).
  - `confirmed`: `claimed_root_cause`, `blockers`, `validation_plan`, `reason` 포함 금지 (`:549-552`); `execution.observed_result` 보이는 산문 (`:553-555`); `remediation.strategy` 보이는 산문 (`:556-558`); `SEVERITY_RANK(overall) > SEVERITY_RANK(impact)`면 오류 `cannot exceed demonstrated impact` (`:559-563`).
  - `needs_validation`: `severity` 금지 (`:565`), `execution`/`remediation`/`reason`/`root_cause` 금지 (`:566-568`), `validation_plan.local` 또는 `.deployment` 중 하나 이상 보이는 산문 (`:569-574`).
  - `rejected`: `severity`, `execution`, `remediation`, `blockers`, `validation_plan`, `root_cause` 금지 (`:575-579`).
- 입력 읽기 `readFileWithinLimit` (`:604-649`): `O_RDONLY | O_NOFOLLOW | O_NONBLOCK`로 열기; `ELOOP`/`EMLINK` → `input must not be a symlink`; `fstat` 비정규 파일 → `input must be a regular file`; 크기 > 5 MiB → `input exceeds 5242880 byte limit`; 읽는 중에도 한도 재검사; UTF-8 fatal 디코더 → `input is not valid UTF-8` (`:53,641-645`).
- JSON 텍스트 사전 점검 `enforceJsonTextLimits` (`:651-701`): 배열 항목 > 1000 → `input exceeds 1000 item array limit`; 중첩 ≥ 64에서 컨테이너 시작 → `input exceeds 64 level nesting depth limit`.
- 데이터 제한 `collectDataLimitErrors` (`:207-245`): 깊이 > 64, 반복/순환 객체 참조("input must not contain repeated or cyclic object references"), 배열 길이 > 1000.
- 진단 안전: 제어/포맷/서로게이트/구분자/default-ignorable 문자를 `\uXXXX`로 이스케이프 (`:54,60-67`); 오류 최대 100개 (`:92-104`).

**종료 코드 (`validate-findings.cjs:703-757, 774`)**

| 상황 | 종료 코드 | 메시지 | 줄 |
|---|---|---|---|
| 인자 없음 | 1 | `Usage: node validate-findings.cjs <path-to-findings.json>` | `:704-707` |
| 스키마 로드/검증 실패 | 1 | `Failed to load report-schema.json:` | `:709-715` |
| 파일 읽기 실패 | 1 | `Failed to read findings JSON: <reason>` (비 SafeInputError는 고정 문구 `input could not be opened or read safely`) | `:717-724` |
| JSON 구조 한도 위반 | 1 | `Failed to parse findings JSON: <reason>` | `:726-732` |
| JSON 문법 오류 | 1 | `Failed to parse findings JSON: invalid JSON syntax` | `:734-740` |
| 검증 중 예외 | 1 | `Failed to validate findings JSON: unexpected validation error` | `:742-748` |
| 오류 ≥ 1 | 1 | `ERROR: ...` 줄들 + `FAIL: N validation error(s)` (정확히 100개면 `; output capped at 100`) | `:749-754` |
| 통과 | 0 | `PASS: N findings valid` | `:755-756` |

- 종료 코드는 0과 1 두 값만 존재. `process.exit(run(process.argv[2]))` (`:774`).
- 스키마 경로는 `path.join(__dirname, "report-schema.json")` 고정 (`:711`).
- 모듈 export: `LIMITS`, `PATH_FORBIDDEN_CHARACTER`, `UNSAFE_DIAGNOSTIC_CHARACTER`, `VISIBLE_CONTENT`, `WINDOWS_RESERVED_COMPONENT`, `collect`, `collectFindingSemanticErrors`, `collectSchemaErrors`, `hasVisibleProse`, `isSafeRelativeSourcePath`, `validateDocument` (`:759-771`).

#### 6.3.2 `validate-coverage-ledger.cjs` 상수/한도

| 상수 | 값 | 줄 |
|---|---|---|
| `LIMITS.inputBytes` | 5 MiB | `validate-coverage-ledger.cjs:14` |
| `LIMITS.units` | 10000 | `:15` |
| `LIMITS.collectionItems` | 1000 | `:16` |
| `LIMITS.objectFields` | 1000 | `:17` |
| `LIMITS.nestingDepth` | 64 | `:18` |
| `LIMITS.preflightValues` | 500000 | `:19` |
| `LIMITS.validationErrors` | 100 | `:20` |
| `MAX_TEXT_LENGTH` | 4096 | `:25` |
| canonical ref 최대 길이 | 1024 (`isVisibleText(value, 1024)`) | `:349` |
| `coverage_id` 최대 길이 | 65536 | `:683` |
| `MAX_DIAGNOSTIC_STRING_LENGTH` | 256 | `:90` |

- `REQUIRED_FIELDS` 19개 (`:26-46`); `REF_FIELDS` = `surface`, `boundary`, `subsystem`, `attack_class` (`:47`), 선택 `lifecycle` (`:370`).
- `STATUSES` 8개: `planned`, `not_applicable`, `out_of_scope`, `in_progress`, `covered`, `candidate`, `blocked`, `deferred` (`:48-57`).
- `ATTEMPT_STATUSES`: `covered`, `candidate`, `blocked` (`:58`).
- `ATTEMPT_FIELDS` 8개: `wave`, `status`, `agent_id`, `reviewed_paths`, `local_checks`, `result_fingerprints`, `unresolved`, `reassignment_reason` (`:59-68`).
- `PRIOR_STATUSES` 11개: `new`, `prior_confirmed_same_source`, `prior_confirmed_changed_source`, `prior_needs_validation`, `prior_deferred`, `prior_blocked`, `prior_out_of_scope`, `prior_covered_same_source`, `prior_covered_changed_source`, `prior_rejected_claim_changed`, `none` (`:69-81`).
- `FINGERPRINT_PATTERN` = `/^[A-Za-z0-9][A-Za-z0-9._:/@+-]*$/` (`:82`); `AGENT_ID_PATTERN` = `/^[a-z0-9][a-z0-9_-]{0,63}$/` (`:83`); `WINDOWS_RESERVED_AGENT_ID` = `/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])$/` (`:84`).
- 체크 객체 (`validateChecks` `:421-451`): 필수 `agent_id`, `reviewed_paths`, `invariant`, `method`, `result`, `artifact`; `method`는 `"source"`/`"local"`; `reviewed_paths` 비어 있으면 안 되고 안전 경로; source 체크는 `artifact: null` (`source-only check must use null`); local 체크는 `agents/<check.agent_id>/artifacts/` 접두 + 접두 뒤 내용 필요 (`isOwnedArtifactPath` `:394-398`).
- unit `reviewed_paths`는 체크들의 `reviewed_paths` 합집합과 정확히 일치: 소유자 없는 경로(`has no check owner`) 또는 집계에 없는 소유 경로 오류 (`:453-469`).
- `excluded_blocks`: 객체, `block`/`reason` 보이는 텍스트, 중복 금지; `selected_companion_blocks`와 겹치면 `block is also selected` (`:471-489, 695-702`).
- `canonical_refs`: 4필드(+선택 lifecycle) 정확히 일치, 추가 필드 금지, NFC, 제어/format 문자 금지, `lifecycle`과 `canonical_refs.lifecycle`은 함께 존재 (`:659-682`). `coverage_id`는 `canonicalCoverageId(refs)`와 일치해야 함 (`:685-687`).
- `canonicalCoverageId`: ref별 UTF-8 percent-encode(`A-Za-z0-9-._~` 비이스케이프, 나머지 대문자 `%HH`), `::`로 결합 (`:354-375`). 예: `route:POST /users` → `route%3APOST%20%2Fusers` (테스트 `validate-coverage-ledger.test.cjs:202`).
- 문서 수준 (`validateDocument` `:761-806`): 최상위 배열 필수(`$: expected a top-level array`), > 10000 → `$: exceeds 10000 coverage units`; `coverage_id` 중복 → `duplicate coverage ID`, 같은 ID에 다른 의미 필드 → `canonical identity collision with different semantic fields`, 같은 의미 튜플에 다른 ID → `semantic tuple already uses coverage ID`, `previousId > coverage_id` → `units must be sorted lexicographically` (`:785-803`).
- attempts 검증 (`validateAttempts` `:568-644`): wave 양의 정수 + 엄격 증가 + 현재 wave보다 작음, status ∈ ATTEMPT_STATUSES, agent_id 안전 + 이전 시도 소유자와 중복 금지(`assignment owner must be fresh for each attempt`), 현재 소유자가 이전 소유자와 같으면 오류(`current assignment owner must be fresh after reassignment`), 이전 시도의 local artifact 재사용 금지, `reassignment_reason` 보이는 텍스트.
- 사전 점검 `preflightJsonText` (`:141-275`): 상태 기계로 구조 점검; 최상위 배열 > 10000 → `exceeds 10000 top-level unit limit`; 중첩 배열 > 1000 → `exceeds 1000 item array limit`; 객체 필드 > 1000 → `exceeds 1000 field object limit`; 총 값 > 500000 → `exceeds 500000 total value limit`; 깊이 → `exceeds nesting depth limit 64`; 잘린/불일치 구조 오류.
- 입력 읽기: findings 검증기와 동일 규격 (`:721-759`).

**종료 코드 (`validate-coverage-ledger.cjs:808-853, 872`)**

| 상황 | 종료 코드 | 메시지 | 줄 |
|---|---|---|---|
| 인자 없음 | 1 | `Usage: node validate-coverage-ledger.cjs <path-to-coverage-ledger.json>` | `:809-812` |
| 읽기 실패 | 1 | `Failed to read coverage ledger: <reason>` | `:814-821` |
| 구조 사전 점검 실패 | 1 | `Failed to parse coverage ledger: <reason>` | `:823-830` |
| JSON 문법 오류 | 1 | `Failed to parse coverage ledger: invalid JSON syntax` | `:831-836` |
| 검증 중 예외 | 1 | `Failed to validate coverage ledger: unexpected validation error` | `:838-844` |
| 오류 ≥ 1 | 1 | `ERROR: ...` + `FAIL: N validation error(s)` (100이면 `; output capped at 100`) | `:845-850` |
| 통과 | 0 | `PASS: N coverage units valid` | `:851-852` |

- 두 검증기의 공유 상수 일치는 테스트가 강제: `VISIBLE_CONTENT`, `PATH_FORBIDDEN_CHARACTER`, `WINDOWS_RESERVED_COMPONENT`, `UNSAFE_DIAGNOSTIC_CHARACTER`의 `source`/`flags`, 공유 LIMITS 키가 정확히 `["inputBytes", "nestingDepth", "validationErrors"]`이고 값 동일, 경로/산문 판정 코퍼스 일치 (`validate-findings.test.cjs:574-652`).

#### 6.3.3 테스트 스위트 요약

- `validate-findings.test.cjs`: `test(` 34개. CLI 타임아웃 `CLI_TIMEOUT_MS = 5000`, 적대적 입력 `HOSTILE_CLI_TIMEOUT_MS = 15000` (`:16-17`). 검증 사례: 스키마가 정확히 3분기(`:151-162`), 파생 값/빈 내용 거부(`:187-202`), 증거 라인 0 거부(`:252-255`), 정확히 1개 분기(`:269-274`), 중복 fingerprint·정렬(`:276-309`), severity > impact 거부(`:311-316`), 위험 경로 33종 거부(`:318-361`), 5 MiB+1 바이트 입력 거부(`:375-381`), 잘못된 UTF-8(`:383-401`), FIFO/심볼릭 거부(`:465-505`), 중첩 65단계 거부(`:507-514`), 1001개 항목 배열 거부(`:516-522`), 1000개 null 입력 시 오류 100개 상한(`:539-550`), 64MB 힙 제한 하 증폭 입력(`:552-572`).
- `validate-coverage-ledger.test.cjs`: `test(` 31개. 사전 점검 한도 사례: 깊이 64 허용/65 거부, 10000 단위(`[${"null,".repeat(10000)}null]`) 거부, 1000 항목, 1001 필드, 500000 값 (`:169-193`); 상태별 증거 규칙(`:330-405`); attempts 재할당 규칙(`:407-491`); 20000단계 중첩과 2,000,000자 중첩이 64MB 힙에서 안전하게 거부(`:668-699`); 1024자 멀티바이트 ref로 만든 근접 최대 canonical ID가 길이 16384 초과 65536 이하에서 통과(`:724-740`).
- 실행: 두 파일 `node --test` 결과 65/65 통과 (4.1 참조).

### 6.4 검증 방식 (무엇을 근거로 "됐다"고 판정하는가)

- 근거 혼합: (a) 소스 trace/증거 인용 (b) 샌드박스 내 제한된 로컬 관측(테스트, 픽스처, 새니타이저 등) (c) 독립 검증자 에이전트 판정(Phase 3, 5) (d) 스키마/원장 검증기 PASS (e) 부모 승격 코드가 만든 아티팩트 파일.
- 자기 진술만으로는 부족: confirmed는 "bounded local observed result"가 필요 (`HUNTING.md:145`), needs_validation은 로컬 불가 사유 명시.
- 검증기 PASS가 보증하는 범위: "Validator success proves format and ledger consistency only." (`VALIDATION-AND-REPORTING.md:118`).
- 코드가 파일 존재, 줄 번호가 실제 소스와 일치하는지, 아티팩트 파일이 실제 있는지 확인하는 부분: 검증기 코드에 해당 로직 없음(경로 문자열 형식 검사만 `validate-findings.cjs:473-483`, `validate-coverage-ledger.cjs:377-398`).
- 독립성 규칙: 검증자는 hunter가 아니어야 함; 재할당 시 신선한 owner (`validate-coverage-ledger.cjs:602-606,630-632`로 코드 강제).

### 6.5 도구 사용 규칙

- 읽기 전용 원칙: "Source inspection is read-only." (`SKILL.md:33`)
- 허용 도구/명령 종류: 위 4.2 및 `HUNTING.md:163`. 금지: 의존성 설치/가져오기, 네트워크 접근, 라이브 엔드포인트 (4.2, 5.2).
- 에이전트 역할: `research` = 집중 소스 탐색·사실 검증, `general` = 광범위 조사·제한된 로컬 실행 (`SKILL.md:25-26`). 정찰=research, 헌터=general, Phase 3 검증자=general, 크리틱=research, Phase 5 검증자=research.
- "Use equivalent platform capabilities while preserving role, write-isolation, prompt, and independence boundaries." (`SKILL.md:29`)
- 쓰기 격리: 부모만 공유 파일 작성; 에이전트는 `scratch/`만 (`SKILL.md:56-66`).

### 6.6 컨텍스트·토큰 규율

- 부모가 중앙 상태를 보유; 에이전트는 구조화 JSON 하나만 반환 ("with no surrounding prose": `HUNTING.md:170`, 검증자 `VALIDATION-AND-REPORTING.md:42`).
- 크리틱은 `architecture.md`+전체 원장 수신 (`HUNTING.md:223`); `architecture.md` 약 1,000단어 상한으로 대규모 실행에서도 프롬프트 크기 통제, unit별 블록 맵은 원장에 둠 (`RECONNAISSANCE.md:86`).
- 서브에이전트 위임이 핵심 구조. "DEPTH BOUND"로 조사 범위 한정 (`HUNTING.md:52-56`).
- 요약/압축 지시: 원문에 명시 없음(파일 verbatim 복사를 요구).
- 헌터에게는 도메인 동반 파일 전체가 아니라 선택된 블록만 전송 (`HUNTING.md:18`).

### 6.7 모호어의 조작적 정의

| 모호어 | 원문 환산 | 근거 |
|---|---|---|
| "confirmed" | 소스 증거 + 제한된 로컬 관측 + 경계 영향; 독립 검증 통과 | `ATTACK-CLASSES.md:7`, `HUNTING.md:145` |
| "needs_validation" | "a specific source-grounded boundary hypothesis is blocked, not a low-confidence confirmed vulnerability, and it has no severity" | `SKILL.md:152` |
| 심각도 | 5단계 앵커 + high/medium 판별 질문 | `SKILL.md:154-162` |
| "complete coverage" | 구별된 final-clean 크리틱이 수용 가능한 작업을 반환하지 않을 때만 | `HUNTING.md:247` |
| "covered" unit | 소유자 + 비어 있지 않은 reviewed_paths/local_checks + 빈 unresolved | 상태표 (`RECONNAISSANCE.md:149`) |
| "safe/low limits" 수치 | 원문에 명시 없음 ("explicit low CPU, memory, process, file-size, disk, and wall-clock limits" — 구체 수치 없음, `SKILL.md:38`) | |
| "same-source unchanged" | "A prior source ref alone is not evidence that a path is unchanged." 현재 관련 소스와 비교 | `SKILL.md:98` |
| "done" (run) | 두 종료 상태 중 하나 | `SKILL.md:179` |
| "quick" 완성도 | partial coverage 명시 | `SKILL.md:115` |

## 7. 산출물

### 7.1 최종 결과물 형태

- 파일 세트 (full audit, `<output-dir>` 하위): `run-metadata.json`, `architecture.md`, `coverage-ledger.json`, `findings.json`, `REPORT.md`, `FINDINGS-DETAIL.md`, `NEEDS-VALIDATION.md`, `agents/<agent-id>/{scratch,artifacts}/` (`SKILL.md:56-66`).
- Guidance mode: 산출 파일 없음, 현재 작업에 결과 반환 (`SKILL.md:14`).
- 포맷 강제 템플릿: `report-schema.json`(findings), 원장 unit JSON(`RECONNAISSANCE.md:106-133`), 헌터 결과 JSON(`HUNTING.md:173-206`), 크리틱 JSON(`HUNTING.md:225-243`), 검증자 JSON(`VALIDATION-AND-REPORTING.md:42-44, 143`).

### 7.2 `findings.json` 규칙

- 모든 레코드: 안정적 fingerprint, title, description, 저장소 상대 소스 경로 (`:109`). 사전순 정렬 (`:97`; 코드 `validate-findings.cjs:502-504`).
- `rejected` 레코드 유지 목적: "retained so future runs do not repeat the unsupported claim without changed evidence." (`VALIDATION-AND-REPORTING.md:101`)
- 미검증 후보는 `findings.json`에 어떤 verdict로도 넣지 않음 (`:93`; `SKILL.md:134`: "Do not put an unvalidated candidate in `findings.json`, relabel it `needs_validation`, or report the run as complete.").

### 7.3 `REPORT.md` 7항목 (`VALIDATION-AND-REPORTING.md:155-165`)

1. 실행 프로파일, 범위, 예산(설정 시) 대비 사용 에이전트 수, 소스 ref, "sandboxed source-and-local-only execution statement", 이전 실행 사용, 명시적 deferred/out-of-scope 커버리지, carry된 same-source confirmed와 changed-source 재검증 명명. quick/scoped/예산 제한/불완전 실행은 부분 패스임을 명시. 검증 예산 소진 시 미검증 fingerprint와 연결 unit 전부 나열, finding으로 서술 금지. 필수 크리틱이 못 돈 경우 어느 크리틱인지 명시하고 clean-coverage 주장 금지.
2. 짧은 보안 태세 요약.
3. confirmed 표: 심각도, 제목, 영향 경계, 한 줄 관측 결과.
4. confirmed 각각: 소스 위치, 낮은 신뢰 주체, 타깃-네이티브 제한 재현, 조건, 실제 결과, 영향, 우선순위 근거, 최소 소스 수정.
5. 별도 `NEEDS VALIDATION` 표: 제목, 저장소 trace, 정확한 blocker, 제한된 로컬 다음 단계, 안전한 소유자 관측 배포 확인. 심각도 부여/확정 취약점 호칭 금지.
6. hardening 노트와 긍정적 소스 패턴 분리.
7. 원장 기반 커버리지 요약: covered/candidate/blocked/deferred 수, 주요 제외, 최종 크리틱 결과.

- "Do not describe rejected records as findings." 
- "A clean run may have zero confirmed records. State that result and the remaining coverage/validation limits without inventing LOW findings." (`:186`)

### 7.4 `FINDINGS-DETAIL.md` / `NEEDS-VALIDATION.md`

- `FINDINGS-DETAIL.md`: confirmed 중 `medium`, `high`, `critical`만 — 순서 있는 trace/evidence, 더미 공격자/자원, 네이티브 입력/호출/픽스처와 정확한 제한 지침, 관측 출력과 증명하는 불변식, 조건/격리, 소스 수준 수정과 회귀 케이스 (`:171-178`).
- `NEEDS-VALIDATION.md`: 미해결 레코드 전부 — trace, 검증된 증거, blocker, 경계, 로컬/소유자 관측 해결 계획. "Do not turn them into live test guidance or assume the missing deployment fact." (`:182`)
- "HTTP is one possible native interface, not the default." (`:184`)

### 7.5 커밋/PR/브랜치/파괴적 동작

- 커밋·PR·브랜치 조작: 원문에 명시 없음. 대상 소스 수정: 금지 (`SKILL.md:166`).
- 대상 저장소 내부 출력 디렉터리는 ignore 확인 후에만 (`SKILL.md:51`).
- 파괴적 동작: 대상에 대한 쓰기/삭제 없음. 단 부모 코드가 `agents/<id>/artifacts/`에 파일을 만들고 scratch 항목을 폐기함 (`SKILL.md:80`). 실제 파일 삭제 명령 명시: 원문에 명시 없음.
- 공격적 헌팅 지침의 범위 (원문이 서술하는 방식): 로컬 더미 데이터·샌드박스 내 최소 효과까지만, 최소 경계 결과 후 중단 (`HUNTING.md:48-51, 91, 164`). 외부 대상에 대한 승인/권한 확인(authorization) 절차 문구: 원문에 명시 없음 — 원문은 "라이브 대상 금지"로 범위를 제한하고, 라이브 테스트용 허가 방안을 제공하지 않음 (`SKILL.md:42`).

### 7.6 Phase 6 보고서의 라이브 프로브 금지

- "derive `REPORT.md`, `FINDINGS-DETAIL.md`, and `NEEDS-VALIDATION.md` from the final records, with no live-probe instructions." (`SKILL.md:177`)

### 7.7 도메인 동반 파일이 규정하는 공통 분류 규칙

- 모든 10개 동반 파일 `Validation rules` 마지막 항목이 동일 구조: "Return `confirmed` ... only with complete source trace ... Return `needs_validation` with the exact ..."로 두 분류를 구분 (예 `AI-AND-LLM.md:83`, `WEB-PROTOCOL-AND-AUTH.md:105`, `MEMORY-SAFETY-AND-BINARY.md:101`).
- 일반 공격 클래스 (`ATTACK-CLASSES.md`, 모두 `subagent_type: general`): Injection, Access control, Resource and file handling, Cryptography and secrets, Business logic, Feature abuse and data leakage, Chained vulnerabilities and trust boundaries, Wildcard, Obvious things (9개). 동반 라우팅 박스 10개 (`ATTACK-CLASSES.md:9-27`).

## 8. 주의점 / 한계 (여기서만 평가)

### 8.1 SKILL.md/문서와 코드/스키마 불일치 (사실 비교 후 지적)

1. 한도 서술 범위: 문서는 "1,000 top-level findings" (`VALIDATION-AND-REPORTING.md:118`)이나 코드의 `arrayItems = 1000`은 모든 배열(예: `trace`, `evidence`, `payloads`)에 적용 (`validate-findings.cjs:222-225`, `:661`). 한 finding의 trace가 1001개면 문서 서술과 무관하게 거부된다.
2. fingerprint 규칙: 문서는 "must not include a line, wave, agent, severity, or verdict" (`HUNTING.md:153-155`)이나 코드/스키마는 정규식 `^[A-Za-z0-9][A-Za-z0-9._:/@+-]*$`만 확인 (`report-schema.json:17`, `validate-coverage-ledger.cjs:82`). 해당 금지어 검사는 없다.
3. 증거 파일 존재: 원장 local 체크의 artifact가 "successfully parent-promoted regular file"이어야 한다는 문서 (`HUNTING.md:213`) vs 코드는 경로 접두(`agents/<id>/artifacts/`) 문자열만 확인 (`validate-coverage-ledger.cjs:394-398`). 파일 존재/승격 이력은 미검증.
4. 블록 참조: `ordinary_attack_class_block`/`selected_companion_blocks`의 `FILE.md#class` 참조가 실제 파일 텍스트에 존재하는지 코드가 검사하지 않는다 (`validate-coverage-ledger.cjs:690-693`은 텍스트 유효성만). 문서는 "matched against the file text" (`RECONNAISSANCE.md:94`).
5. `quick` 고정 subsystem 값 `profile/quick/all-in-scope-subsystems`: 코드 강제 없음 (일반 visible text 검사만).
6. `prior_status` 와 `status`/`wave` 간 정합성(예: carry된 planned unit, 프로파일별 wave 제한)은 코드가 검사하지 않음. 상태표 일관성만 검사.
7. `run-metadata.json`(`run_status`, `incomplete_reason` 열거값 `budget_cannot_fund_reconnaissance_and_reserves`, `critic_budget_exhausted`, `validation_budget_exhausted`)에는 스키마/검증기 없음. 두 "terminal state" 조건 (b)는 에이전트 자기 기록에 의존.
8. `conditions`는 스키마상 required이나 minItems 없음 → 빈 배열 허용 (`report-schema.json:243,99-102`; 테스트 픽스처가 `conditions: []`로 통과 `validate-findings.test.cjs:50`). 문서의 "complete conditions" (`HUNTING.md:145`)와 코드는 일치하지 않는 강도.
9. 문서 서술 `needs_validation` "at least one nonempty `validation_plan.local` or `validation_plan.deployment`" ↔ 스키마는 required 없음, 코드 의미 검사가 보완 (`validate-findings.cjs:569-574`) — 스키마 단독으로는 빈 `{}` 허용 (테스트 `validate-findings.test.cjs:197-198`에서 `{}`와 공백 local 거부 확인).
10. "Windows"·비POSIX: 승격 절차에 "Use equivalent race-safe APIs on non-POSIX systems." (`SKILL.md:78`)이라 쓰나 두 검증기는 `O_NOFOLLOW`/`O_NONBLOCK` 부재 시 모든 입력 거부 (`validate-findings.cjs:604-609`). 원문 서술과 검증기 이식성이 다르다.
11. 에이전트 ID 예약어: `SKILL.md:66`은 Windows 장치명 목록, 코드 `WINDOWS_RESERVED_AGENT_ID`는 `con|prn|aux|nul|com1-9|lpt1-9`로 일치 (불일치 아님, 확인 사실).

### 8.2 오작동·과잉작동 시나리오

- 모드 오판: description이 "security questions"와 "security audits"를 함께 트리거하므로, 짧은 질문에도 전체 파이프라인이 켜질 위험은 `ask one focused question` 규칙으로만 완충됨 (`SKILL.md:17`).
- 샌드박스 요건 미충족: 4가지 통제 전부 강제 불가 시 대상 코드 실행 금지 (`SKILL.md:40`). 스킬이 샌드박스를 구현/제공하지 않으므로 (원문에 명시 없음) 일반 개발 환경에서는 대부분 소스 전용 + `needs_validation` 결과로 수렴할 가능성이 문서 구조상 높다. confirmed가 "bounded local observed result"를 요구 (`HUNTING.md:145`)하는 것과 합쳐 confirmed 도달 장벽이 높다.
- 에이전트 호출 폭증: 정찰 4 + 헌터(unit당) + wave마다 크리틱 2종 + 후보당 검증자 2종(standard)은 예산 미설정 시 상한이 없다 (`budget` null 허용 `SKILL.md:86`). 반복 wave 상한 수치 없음.
- 프롬프트 크기: 헌터는 `architecture.md` + 선택 블록 verbatim + 핵심 방법/승격 절차 블록 + 스키마 분기 verbatim을 매번 받는다 (`HUNTING.md:13-23`). 동일 승격 블록이 SKILL.md, HUNTING.md, VALIDATION 문서에 세 번 중복 기재되어 (`SKILL.md:70-80`, `HUNTING.md:102-135`, `VALIDATION-AND-REPORTING.md:51-84`) 수정 시 동기화 부담.
- 검증기 100개 오류 상한: 대량 오류 시 100개에서 잘려 수정 반복 필요 (`:48`).
- 원장 5 MiB가 10,000 unit보다 먼저 걸린다는 문서 서술(`RECONNAISSANCE.md:156`)대로 대형 타깃은 unit 조정 필요.

### 8.3 다른 스킬/CLAUDE.md와 충돌 가능 지점

- 출력 위치 `~/security-audit-skill/...`(홈 하위, 대상 밖) 쓰기는 작업 디렉터리 제한 설정/권한 정책과 충돌할 수 있다 (`SKILL.md:51`). "/tmp나 호스트 홈은 폴백 금지"(`SKILL.md:66`)와 동시에 기본 경로가 홈 하위이므로 환경 설정에 의존.
- "에이전트는 대상 소스를 수정하지 않는다" (`SKILL.md:166`)는 코드 수정을 기대하는 일반 코딩 워크플로우/CLAUDE.md의 "fix it" 지시와 충돌 가능.
- 서브에이전트 용어 `research`/`general`/Task tool은 플랫폼 중립으로 서술 (`SKILL.md:21-29`); 실행 플랫폼에서 해당 역할이 존재하는지는 원문에 명시 없음.

### 8.4 검증 공백 (원문이 확인하지 않고 넘어가는 것)

- 검증기는 형식과 원장 일관성만 증명 (`VALIDATION-AND-REPORTING.md:118`): 줄 번호가 실제 코드와 맞는지, 인용 파일이 있는지, 관측 결과가 사실인지는 에이전트 판정(LLM)에 의존.
- 산문(REPORT.md 등)과 JSON 일치는 anti-pattern 10에 적혀 있으나 이를 확인하는 스크립트는 없음 (REPORT/DETAIL/NV 마크다운 검증기: 원문에 명시 없음).
- 소유자 관측 `deployment` 검증 계획의 이행 여부는 스킬 범위 밖.
- 크리틱의 `stop`/clean 판정은 모델 주관 판단이며 객관 지표(커버리지 % 등) 없음. 수치 임계값 원문에 명시 없음.

### 8.5 유지보수 리스크

- 하드코딩: 스키마 경로 `__dirname/report-schema.json` (`validate-findings.cjs:711`), 상수 일치를 테스트로 묶음(`validate-findings.test.cjs:574-652`) — 한쪽 변경 시 테스트 동기 갱신 필요. 두 검증기에 중복 구현된 유틸(`escapeUnsafeDiagnosticCharacters`, `safeQuote`, `createErrorList`, `readFileWithinLimit` 등).
- Node 버전: 정규식 `\p{Default_Ignorable_Code_Point}` 유니코드 속성 이스케이프 사용 (`validate-findings.cjs:50`) — 최소 Node 버전 명시: 원문에 명시 없음 (내가 확인한 실행 환경은 v22.23.1에서 65/65 통과).
- `skills-lock.json`의 `computedHash`는 소스 해시 고정이나, 로컬 파일이 해시와 일치하는지 검증하는 도구는 이 스킬에 없음 (원문에 명시 없음).
- 도메인 동반 파일 블록 이름이 `FILE.md#section` 참조로 원장에 박히므로 (`RECONNAISSANCE.md:94`), 동반 파일의 제목 변경은 과거 원장 호환성에 영향.

### 8.6 한 줄 판정

- 조건부 권장: 증거 기준(경계·결과·독립 검증·`needs_validation` 분리)과 검증기 65개 테스트가 갖춰져 있어 명시적 전체 감사 요청에는 유용하나, 샌드박스 4통제를 환경이 강제하지 못하면 confirmed 도달이 막히고 다중 에이전트 호출 비용이 예산 미설정 시 무제한이라는 점이 근거.
