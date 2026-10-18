# dsh-prose-standard 분석
## 1. 개요
- 원본 경로: `/Users/kkh/Desktop/skills-analize/deepseek-harness/dsh-prose-standard/`
- 컬렉션: deepseek-harness
- 읽은 파일 전체 (재귀 전수, 총 2개 파일, 19,078 바이트)

| 파일 | 크기(바이트) | 줄 수 | 역할 |
|---|---|---|---|
| `SKILL.md` | 9,621 | 81 | 핵심. frontmatter + 편집 판단 기준 + 위치별 필수 커버리지 + 워크플로우 + 경계 사례 처리 |
| `references/examples.md` | 9,457 | 169 | 보조. 17개 "Over-trimmed / Balanced / Over-detailed" 증류 예시 |

- `scripts/`, `templates/`, `assets/` 디렉터리: 존재하지 않음 (`find . -type f` 결과 위 2개뿐).
- 성격 한 줄: **검증(verification)·감사(audit)에 가까운 편집 판단 스킬**이면서, 명시적 수정 요청 시에는 산문을 쓰고 고치는 생성(construction) 기능도 겸한다. 스크립트가 없는 순수 지침형이다. 계획(planning)·라우팅(routing) 스킬은 아니지만, 일부 책임을 형제 스킬로 위임하는 라우팅 문장을 본문에 갖는다.
- 원문 자기 규정:
  > Write enough to preserve the contract, then remove reasoning transcripts, repetition, and decoration. (`SKILL.md:8`)
  > This skill owns editorial judgment and required prose coverage; use dsh-doc for placement, budgets, bilingual pairs, and documentation gates, and dsh-trim-cot-leakage for hunting and fixing reasoning-transcript leakage. It is guidance, not a script. (`SKILL.md:8`)
  > Comments describe non-obvious contracts or rationale that code cannot express; they do not restate what code already implies. (`SKILL.md:12`)
- examples.md 자기 규정:
  > Use these examples to identify the governing principle, not as text templates. "Balanced" preserves every load-bearing proposition with the least explanation needed at that location. (`references/examples.md:3`)
- "contract" 의 원문 정의:
  > A contract is an obligation, invariant, precondition, postcondition, or compatibility promise that a caller, callee, implementer, producer, or consumer relies on. (`SKILL.md:8`)

## 2. 활성화 조건 (언제 켜지는가)
### 2.1 frontmatter 전문
```
---
name: dsh-prose-standard
description: Use when writing, reviewing, restoring, trimming, or auditing prose in the deepseek-harness repo, including deciding where documentation or comments are required across Markdown, JSDoc, code and test comments, prompts, descriptions, diagnostics, and CLI or UI strings.
---
```
(`SKILL.md:1-4`)

### 2.2 트리거 동사와 대상
- 동사: writing, reviewing, restoring, trimming, auditing (5개)
- 대상: Markdown, JSDoc, code and test comments, prompts, descriptions, diagnostics, CLI or UI strings (7개 계열)
- 범위 한정: "in the deepseek-harness repo" — 다른 리포지토리에서는 description 상 매칭 대상이 아니다.
- 추가 키워드: "deciding where documentation or comments are required" — 즉 "쓸지 말지" 판단도 트리거에 포함된다.

### 2.3 매칭되는 사용자 발화 예시 (트리거 사전 추출)
description 의 어휘에서 도출한 발화 (원문에 발화 예시 목록은 없음 — 아래는 description 어휘와의 매칭 후보):

1. "deepseek-harness 의 `packages/foo/README.md` 문장 다듬어줘" — writing/trimming, Markdown
2. "이 PR 의 JSDoc 이 너무 장황한지 리뷰해줘" — reviewing, JSDoc
3. "테스트 파일 주석 중에 지워도 되는 거 audit 해줘" — auditing, test comments
4. "과하게 줄인 주석 복원해줘" — restoring
5. "이 모듈에 주석이 꼭 필요한 곳이 어디인지 정해줘" — deciding where comments are required
6. "에러 메시지(diagnostics) 문구가 원인·수정 방법을 말하는지 점검해줘" — diagnostics
7. "CLI 도움말 문자열과 UI 문구 다시 써줘" — CLI or UI strings
8. "시스템 프롬프트 문구 정리해줘" — prompts (단, `SKILL.md:58` 에 따라 소유 snapshot 이 없으면 변경 보류)
9. "Agent Note 가 길다, 줄여줘" — Agent Notes 는 `SKILL.md:54` 에 위치별 규칙이 있음

### 2.4 입력 요건에 의한 사실상 비활성 조건
- 스코프가 없으면 켜져도 즉시 중단한다:
  > Require an explicit `scope`. If it is missing, report the required input and stop; do not infer a repository-wide scope or begin an interview. (`SKILL.md:16`)
  → "문서 좀 정리해줘" 처럼 스코프 없는 발화는 매칭은 되어도 작업이 시작되지 않는다.
- `vendor/` 만 스코프인 경우:
  > If the requested scope contains only `vendor/`, report that no eligible files remain. (`SKILL.md:22`)

### 2.5 의도적으로 배제되는 발화와 넘길 스킬
| 발화 성격 | 원문 근거 | 넘길 스킬 |
|---|---|---|
| 문서 배치, 분량 예산, 이중언어 쌍, 문서 게이트 | `use [dsh-doc](../dsh-doc/SKILL.md) for placement, budgets, bilingual pairs, and documentation gates` (`SKILL.md:8`) | `dsh-doc` |
| 추론 과정(CoT) 누출 사냥·수정 | `[dsh-trim-cot-leakage](../dsh-trim-cot-leakage/SKILL.md) for hunting and fixing reasoning-transcript leakage` (`SKILL.md:8`) | `dsh-trim-cot-leakage` |
| `.agents/notes/archived/` 대상 | `Also exclude .agents/notes/archived/ from prose review and edits.` (`SKILL.md:24`) | 넘길 스킬 지정 없음 (제외) |
| `vendor/` 대상 | `Always exclude vendor/ from discovery, review, and edits` (`SKILL.md:22`) | 넘길 스킬 지정 없음 (제외) |

- `dsh-doc`, `dsh-trim-cot-leakage` 는 이 디렉터리 안에 없고 상대경로(`../dsh-doc/SKILL.md`)로만 지목된다. 존재 여부는 이 분석 범위 밖이므로 `원문에 명시 없음`(이 스킬 폴더 내부 기준).

### 2.6 frontmatter 기타 필드
- `allowed-tools`: 없음
- `model`: 없음
- `metadata`: 없음
- 그 외 필드: 없음. `name`, `description` 2개만 있다 (`SKILL.md:2-3`).

## 3. 적합 / 부적합
### 3.1 적합
- deepseek-harness 리포지토리에서 산문(주석, JSDoc, README, Agent Note, 포스트모템, 프롬프트, 진단 메시지, UI 문자열)을 쓰거나 줄이거나 복원하는 작업.
- 이전 "줄이기 전용" 작업이 지나쳐 계약 정보가 빠졌는지 점검해야 하는 상황. 원문이 "This is not a one-way shortening pass." 라고 명시한다 (`SKILL.md:46`).
- 생성 카탈로그·스냅샷·픽스처가 소스 JSDoc 에서 파생되는 구조:
  > source JSDoc may also feed a generated model-visible catalog (`SKILL.md:26`)
- 모델에게 노출되는 문구(프롬프트, 도구 결과, 에러 텍스트)가 있고 이를 "행동"으로 취급해야 하는 코드베이스 (`SKILL.md:58` "treat wording as behavior").
- 이중언어(영/한 등) 문서 쌍이 있는 리포지토리: `Bilingual pairs have no permanent owner` (`SKILL.md:26`).
- PR 리뷰 인라인 코멘트로 문체 기준을 캘리브레이션하는 협업 (`SKILL.md:79`).

### 3.2 부적합·과함
- 스코프가 정해지지 않은 "전체 정리" 요청: 스킬이 스스로 중단한다 (`SKILL.md:16`).
- deepseek-harness 가 아닌 리포지토리: description 이 리포지토리를 못 박고 있고, 본문이 `docs/AGENTS.md`, `docs/cookbook/adding-a-package.md`, `verify-client-ui-i18n`, Cordis, `ctx.shell` 등 이 리포지토리 고유 자원을 전제한다. 다른 리포지토리에서의 사용 가능성은 `원문에 명시 없음`.
- 문서 위치·분량 예산·이중언어 쌍 배치 자체를 정하는 작업: `dsh-doc` 소관 (`SKILL.md:8`).
- CoT 누출만 집중 사냥하는 작업: `dsh-trim-cot-leakage` 소관 (`SKILL.md:8`).
- 코드 로직 변경이나 기능 구현: 이 스킬의 대상이 아님. 산문만 다룬다 (본문 어디에도 코드 로직 수정 지시 없음).
- `vendor/` 또는 `.agents/notes/archived/` 하위 파일.
- 체크리스트를 기대하는 사용자: 스킬이 "guidance, not a script" 라고 선언하므로 기계적 합격/불합격 판정을 내려주지 않는다 (`SKILL.md:8`).

### 3.3 형제 스킬 대신 이걸 고르는 판정 기준
한 줄: **"이 문장/주석이 계약 명제를 보존하는가, 어디에 어떤 산문이 필수인가"가 질문이면 dsh-prose-standard, "어디에 두고 얼마나 쓰며 이중언어 쌍을 어떻게 맞추는가"가 질문이면 dsh-doc, "추론 서술 누출을 찾아 지우는가"가 질문이면 dsh-trim-cot-leakage.**

## 4. 전제 조건과 외부 의존성
### 4.1 실행 스크립트·런타임
- 실행 스크립트: 없음 (`scripts/` 부재). 스킬 자체가 "guidance, not a script" (`SKILL.md:8`).
- 런타임·패키지: 스킬 자체는 불필요. 단, 워크플로우가 호출하는 도구가 원문에 나온다.

| 언급된 도구/명령 | 원문 위치 | 용도 |
|---|---|---|
| ripgrep (`--glob '!vendor/**'`) | `SKILL.md:22` | `vendor/` 제외 탐색 |
| Git pathspec `:(exclude)vendor/**` | `SKILL.md:22` | Git 명령에서 vendor 제외 |
| `git diff --check` | `SKILL.md:70` | 공백 오류 검사 |
| `verify-client-ui-i18n` | `SKILL.md:58` | 클라이언트 UI 문자열 i18n 검증 |
| "documentation gates" | `SKILL.md:70` | 구체 명령은 `원문에 명시 없음` (`dsh-doc` 소관) |
| "narrow relevant checks" | `SKILL.md:70` | 구체 명령은 `원문에 명시 없음` |
| word counts | `SKILL.md:67` | 후보 탐색용 |

### 4.2 API 키·환경변수·네트워크
- 불필요. 원문에 API 키, 환경변수, 네트워크 호출 언급 없음.

### 4.3 리포지토리 전제
- `AGENTS.md` 파일들이 존재해야 한다: `Confirm the scope, mode, current branch or PR base, and applicable AGENTS.md files.` (`SKILL.md:65`)
- 문서 표준: `docs/AGENTS.md` (`SKILL.md:26`, `SKILL.md:66`), 특히 `#writing-rules` 앵커의 "lightweight routine path" (`SKILL.md:26`).
- 패키지 README 요건: `docs/cookbook/adding-a-package.md#4-write-the-package-readme` (`SKILL.md:53`).
- Git 사용 전제: 현재 브랜치 또는 PR base 확인, `git diff --check`, 최종 diff 의 vendor 경로 검사 (`SKILL.md:65`, `70`).
- `.agents/notes/` 디렉터리 구조(Agent Notes, `archived/` 하위) 전제 (`SKILL.md:24`).
- 모델 노출 문구의 "owning runnable snapshot" 과 "repository-required GUI evidence" 전제 (`SKILL.md:58`).
- 타입이 있는 로케일 사전(typed locale dictionaries)과 Cordis-free primitives 라는 UI 아키텍처 전제 (`SKILL.md:58`).
- 커밋 권한·브랜치 전략: 커밋/푸시 지시는 `원문에 명시 없음`. 브랜치는 "Do not inspect unrelated branches." 로만 언급 (`SKILL.md:65`).
- 테스트 러너·CI·린터: 구체 이름 `원문에 명시 없음`. "behavior tests for visible strings" 를 돌리라는 지시만 있음 (`SKILL.md:70`).

### 4.4 비용 발생 지점
- 유료 API 호출: 없음.
- CI 분: 원문에 CI 실행 지시 없음 (`원문에 명시 없음`).
- 토큰: 읽기 범위가 넓다. 표준 문서(`docs/AGENTS.md`), 소유 코드/문서, 필요 시 examples.md 를 읽고 "requested scope, not only the largest files" 를 검사 (`SKILL.md:66-67`). 서브에이전트 위임 지시는 없음.

### 4.5 상태 파일·산출물 디렉터리
- 스킬이 새로 만드는 상태 파일(`plan.md`, `TODO`, `.claude/` 등): 없음.
- 쓰기 대상은 사용자 스코프 내 기존 산문 파일과 파생 산출물(재생성 결과). 유일한 스킬 자체 갱신 경로는 `references/examples.md` 로, 사용자 결정 후 원칙을 증류해 추가한다:
  > After the user decides, distill the principle and versions into [the examples](references/examples.md), without PR history or reviewer narration (`SKILL.md:81`)

## 5. 워크플로우
원문은 7단계 번호 목록이다 (`SKILL.md:63-71`). 순서 강제 문구("run in order", "do not skip")는 `원문에 명시 없음`. 다만 5번은 "Update the owner before derivative artifacts" 로 소유자 우선 순서를 강제한다.

### 5.0 사전 입력 처리 (워크플로우 이전)
| 항목 | 규칙 | 근거 |
|---|---|---|
| scope | 필수. 없으면 보고 후 중단 (게이트) | `SKILL.md:16` |
| mode | `automatic | interactive`, 기본 `automatic`. 사용자가 명시적으로 질문·캘리브레이션을 요청할 때만 interactive | `SKILL.md:18` |
| 쓰기 권한 | mode 와 무관. 리뷰·감사는 수정 없이 보고, 명시적 write/fix/trim 요청일 때만 명확한 변경 적용 | `SKILL.md:20` |
| 제외 | `vendor/` 항상 제외, 심링크 추적 금지, `.agents/notes/archived/` 제외 | `SKILL.md:22,24` |

### 5.1 단계별 입력 → 행동 → 출력 → 통과 조건
| # | 입력 | 행동 | 출력 | 통과 조건 | 게이트 |
|---|---|---|---|---|---|
| 1 | 사용자 요청 | scope, mode, 현재 브랜치 또는 PR base, 적용 가능한 `AGENTS.md` 확인. 무관한 브랜치는 보지 않음 | 확정된 작업 조건 | scope 존재 (없으면 중단) | **게이트** (scope 없으면 탈락) |
| 2 | 표준 문서, 소유 코드/문서 | `docs/AGENTS.md` 와 소유 코드·문서를 읽은 뒤 판단. 낯선 사례는 `references/examples.md` 읽기 | 판단 근거 확보 | 원문에 통과 기준 명시 없음 | 비게이트 |
| 3 | 스코프 | 큰 파일만 보지 않고 스코프 전체 검사. 검색·단어 수로 후보를 찾고 의미로 판단 | 후보 목록 | 원문에 명시 없음 | 비게이트 |
| 4 | 후보 | 각 후보를 keep / add / trim / restore / restructure / defer 로 분류. 작업이 허용할 때만 명확한 변경 적용 | 분류표, (허용 시) 편집 | "do not manufacture edits to satisfy a deletion target" | 비게이트(자율 판단) |
| 5 | 편집 결과 | 소유자를 파생물보다 먼저 갱신. 새 규칙을 배우면 유사 구절 재점검 | 소유자→파생물 일관성 | 원문에 명시 없음 | 비게이트 |
| 6 | 전체 diff | 좁은 관련 검사, 문서 게이트, `git diff --check`, 가시 문자열 행동 테스트 실행. diff 에 `vendor/` 경로 없는지 확인 | 검사 결과 | `vendor/` 경로 없음 | **게이트**(검증 단계) |
| 7 | 전 과정 | 보고: 검사한 스코프, 명확한 변경, 의도적 유지, 보류 사례, 실제 실행한 검사 | 최종 보고 | 실제 실행한 검사만 보고 | 비게이트 |

단계 인용:
> 1. Confirm the scope, mode, current branch or PR base, and applicable `AGENTS.md` files. Do not inspect unrelated branches. (`SKILL.md:65`)
> 3. Inspect the requested scope, not only the largest files. Use searches and word counts to find candidates, then judge passages semantically. (`SKILL.md:67`)
> 4. Classify each candidate as keep, add, trim, restore, restructure, or defer. Apply clear changes only when the task authorizes edits; do not manufacture edits to satisfy a deletion target. (`SKILL.md:68`)
> 6. Run the narrow relevant checks, documentation gates, `git diff --check`, and behavior tests for visible strings. Verify the final diff contains no `vendor/` path and report any accidental vendor match rather than claiming a clean exclusion history. (`SKILL.md:70`)
> 7. Report the inspected scope, clear changes, deliberate keeps, deferred cases, and checks actually run. (`SKILL.md:71`)

### 5.2 탈락 시 에이전트 행동
| 게이트 | 탈락 시 | 근거 |
|---|---|---|
| scope 없음 | 필요한 입력을 보고하고 중단. 저장소 전체 추정·인터뷰 시작 금지 | `SKILL.md:16` |
| vendor 만 스코프 | "no eligible files remain" 보고 | `SKILL.md:22` |
| 소유 스냅샷 없는 모델 노출 문구 | 문구 변경 보류 + 보류 보고, 또는 소유 시나리오·GUI 증거까지 변경 범위 확대 | `SKILL.md:58`, `references/examples.md:149` |
| diff 에 vendor 경로 | 사고적 매치를 보고 (깨끗한 제외 이력이라 주장 금지) | `SKILL.md:70` |

### 5.3 분기·루프 구조
```
[scope 확인] --없음--> 중단/입력 요청
     |
     v
[mode 판정: 기본 automatic]
     |
     +-- review/audit 요청 --> 수정 없이 findings 보고
     +-- write/fix/trim 요청 --> 명확한 변경 적용
     |
     v
 후보 분류 (keep/add/trim/restore/restructure/defer)
     |
     +-- 명제 보존 답이 1개 --> 적용 (borderline 아님)
     +-- 2개 이상이 원칙 간 트레이드오프 --> borderline
              |
              +-- automatic: 질문 없이 보고
              +-- interactive: 2~3개 안 제시 + 추천 1개
                       |
                       v
                  사용자 결정 --> examples.md 에 증류 --> 유사 구절 전수 재적용 (루프)
```

- 루프: 새 규칙 학습 → "Re-check analogous passages after learning a new rule." (`SKILL.md:69`) / "apply the learned rule to every analogous passage in scope" (`SKILL.md:81`). 재시도 횟수 상한·수렴 조건은 `원문에 명시 없음`.

### 5.4 Borderline 결정 절차
- 정의:
  > A case is borderline only when at least two versions satisfy the complete-proposition rule but trade accepted principles, and this skill does not already resolve the tradeoff. A rewrite with one proposition-preserving answer is not borderline. (`SKILL.md:75`)
- automatic:
  > apply clear edits when authorized and report genuine borderline cases without asking questions. Do not weaken a proposition to make progress. (`SKILL.md:77`)
- interactive:
  > group analogous passages under the governing principle. Present two or three viable versions, recommend one, and state the factual or structural difference. Do not offer inferior distractors. (`SKILL.md:79`)
- PR 인라인 코멘트 캘리브레이션:
  > place the recommended provisional version in the diff and attach the alternatives to that exact line. (`SKILL.md:79`)

### 5.5 사람 개입 지점
| 지점 | 조건 | 근거 |
|---|---|---|
| 질문 라운드 | interactive 모드, 사용자가 명시적으로 질문·캘리브레이션 요청 시에만 | `SKILL.md:18` |
| borderline 결정 | interactive 에서 2~3안 중 사용자 선택 | `SKILL.md:79` |
| 스코프 제공 | scope 누락 시 사용자 입력 요구 | `SKILL.md:16` |
| 소유 시나리오 확장 승인 | 모델 노출 문구에 소유 스냅샷 없을 때 "expand the authorized change" (사용자 승인 여부 형식은 `원문에 명시 없음`) | `references/examples.md:149` |

## 6. 엔지니어링 규칙 분석
### 6.1 금지 규칙(anti-pattern)과 막으려는 실패 모드
| # | 원문 금지/삭제 규칙 | 막으려는 실패 모드 | 근거 |
|---|---|---|---|
| 1 | `do not infer a repository-wide scope or begin an interview` | 스코프 없는 광범위 편집, 불필요한 질문 | `SKILL.md:16` |
| 2 | `Do not follow a symlink into it` (vendor) | 심링크로 vendor 우회 진입 | `SKILL.md:22` |
| 3 | `Put exclusions after inclusion globs so a later include cannot re-admit it` | 이후 include 가 vendor 를 재허용 | `SKILL.md:22` |
| 4 | archived notes: `never to modernize its prose or outbound links` | 동결 스냅샷 변형 | `SKILL.md:24` |
| 5 | `A smaller word count alone is not an improvement.` | 단어 수 감소만 목표로 한 명제 손실 | `SKILL.md:38` |
| 6 | `do not manufacture edits to satisfy a deletion target` | 삭제 목표치 채우려는 억지 편집 | `SKILL.md:68` |
| 7 | `Do not weaken a proposition to make progress.` | borderline 에서 진행을 위해 명제 약화 | `SKILL.md:77` |
| 8 | `Do not offer inferior distractors.` | interactive 에서 열등한 보기로 선택 유도 | `SKILL.md:79` |
| 9 | `Do not add a comment when those facts are already obvious locally.` | 중복 주석 | `SKILL.md:46` |
| 10 | `Delete control-flow narration and code restatement.` (내부 주석) | 코드 낭독식 주석 | `SKILL.md:49` |
| 11 | `Delete walkthroughs and inventories.` (테스트) | 테스트 워크스루·목록 나열 | `SKILL.md:51` |
| 12 | `do not silently fold it into a prose-only edit` (소유 시나리오 없는 모델 노출 문구) | 모델 행동 변경을 산문 편집으로 은폐 | `SKILL.md:58` |
| 13 | `Do not compress a reasoning transcript into shorter narration; remove it.` | 추론 서술의 압축 보존 | `references/examples.md:121` |
| 14 | `Do not inspect unrelated branches.` | 무관 브랜치 탐색 | `SKILL.md:65` |
| 15 | `Do not weaken`·`Do not offer` 외, `Remove ... only when every factual clause survives and the result is clearer` | 명제 손실을 동반한 제거 | `SKILL.md:38` |
| 16 | "not banned words" 용어 8종을 금지어로 취급하지 말 것 | 용어 기계적 삭제 | `SKILL.md:10` |

용어 점검 규칙 원문:
> Treat `contract`, `boundary`, `shape`, `surface`, `seam`, `gate`, and `vocabulary` as terms to check before use, not banned words. First ask whether the exact rule, API, field set, type, validation, timing point, component split, or failure states the fact better. Keep a term when it names the exact technical subject, including caller/callee contracts and security/process boundaries. (`SKILL.md:10`)

- 점검 대상 용어는 7개(`contract, boundary, shape, surface, seam, gate, vocabulary`). 대체 후보 8종(rule, API, field set, type, validation, timing point, component split, failure states).

### 6.2 강제 규칙
#### 6.2.1 명제 보존 체크리스트 (`SKILL.md:30-36`)
| 보존 대상 | 원문 |
|---|---|
| actor and action | 행위자와 행위 |
| condition, timing, and ordering | 조건·시점·순서 |
| modality | `must, may, or never` |
| negative guarantee and exception | 부정 보장·예외 |
| ownership, side effect, failure mode, and consequence | 소유권·부작용·실패 모드·결과 |

#### 6.2.2 위치별 필수 커버리지 (`SKILL.md:48-59`) — 12개 위치
| 위치 | 필수 내용 | 삭제 대상 |
|---|---|---|
| Public JSDoc | caller-visible return distinctions, throws or rejections, side effects, ownership, timing, cancellation, durability | 원문에 명시 없음 (examples 에서 내부 상태머신 분기 서술은 Over-detailed) |
| Internal comments | invariants, race ordering, ownership, security boundaries, surprising failure behavior | control-flow narration, code restatement |
| Module comments | role, dependencies, responsibilities, non-obvious architecture choices(링크) | 원문에 명시 없음 |
| Tests | non-obvious test design (fixture, assertion, platform accommodation, real entry path, indirect observation 이 왜 필요한지) | walkthroughs, inventories |
| Cookbooks | prerequisites, required actions, the real entry path, observable verification, concise warnings | 원문에 명시 없음 |
| READMEs | configuration, semantics, failures, limitations, extension points, model-visible effects. 패키지 소유 모델 노출 텍스트는 인용, 생성 카탈로그·타 패키지 소유분은 링크 | ordinary cleanup inventories |
| Agent Notes | unique rationale, mechanisms, alternatives, consequences, shipped verification evidence, named coverage gaps. 구현 완료분은 현재형 | planning checklists |
| Postmortems | incident sequence, evidence, causal chain, impact, prevention | repeated persuasion, 인과 무관 구현 세부 |
| Skills and agent instructions | behavioral guardrails, explicit scope limitations ("guidance, not a script/checklist"), concise workflow + source of truth 링크 | 원문에 명시 없음 |
| Examples and configuration comments | access limits, non-obvious wiring or load order, security stance, replay behavior, exceptions, likely misuse | 설정이 이미 보여주는 항목의 낭독 |
| Prompts and visible strings | 문구를 행동으로 취급, i18n 사전·props, 스냅샷 갱신 | 원문에 명시 없음 |
| Diagnostics | failing subject or path, violated rule, correction (비자명할 때) | internal execution narration |

핵심 인용:
> This is not a one-way shortening pass. Add or restore prose when code, types, and structure do not communicate a required contract below. (`SKILL.md:46`)
> Preserve searchable mechanism names and meaningful modal, temporal, or negative emphasis. Normalize decorative emphasis only. (`SKILL.md:61`)

#### 6.2.3 소유·링크 규칙
> Keep a complete local contract at the point of use: behavior, failure, ownership, and consequence that a caller or maintainer needs there. Aggressively link to the owning document for architecture, rationale, algorithms, history, or extended examples. One explanation has one home; essential contract facts may repeat locally. (`SKILL.md:40`)
> Keep non-obvious rationale when omitting it could plausibly cause misuse or an incorrect simplification. Otherwise state the consequence and link the rationale home. (`SKILL.md:42`)

#### 6.2.4 파생물 규칙
> Trace every consumer before editing ... Edit the owning source or scenario first, then regenerate every derivative. When a generator extracts a summary from owner prose, make the extracted sentence complete for that surface. (`SKILL.md:26`)

- 이중언어: `either language may be the authored side for an update. Follow the lightweight routine path, update the counterpart minimally, and re-record the pair.` (`SKILL.md:26`)

#### 6.2.5 수치·임계값 일람 (원문에 존재하는 모든 숫자)
| 수치 | 맥락 | 근거 |
|---|---|---|
| 7 | 워크플로우 단계 수 | `SKILL.md:65-71` |
| 6 | 분류 범주 (keep/add/trim/restore/restructure/defer) | `SKILL.md:68` |
| 2 | borderline 성립 최소 버전 수 ("at least two versions") | `SKILL.md:75` |
| 2~3 | interactive 에서 제시할 안 개수 ("two or three viable versions") | `SKILL.md:79` |
| 1 | 추천 안 개수 ("recommend one") / 설명의 거처 ("One explanation has one home") | `SKILL.md:79`, `40` |
| 12 | 위치별 필수 커버리지 항목 수 | `SKILL.md:48-59` |
| 7 | 점검 대상 용어 수 | `SKILL.md:10` |
| 17 | examples.md 증류 예시 섹션 수 | `references/examples.md` (## 헤딩 17개) |
| 4 | README 요건 앵커 번호 `#4-write-the-package-readme` | `SKILL.md:53` |

- 커버리지 %, 파일 줄 수 상한, 재시도 횟수, 타임아웃, 함수 길이, 단어 수 상한, 커밋 단위: 모두 `원문에 명시 없음`. 이 스킬은 의도적으로 수치 목표를 두지 않는다 ("A smaller word count alone is not an improvement.", `SKILL.md:38`).

### 6.3 검증 방식
| 검증 수단 | 근거 | 성격 |
|---|---|---|
| 좁은 관련 검사 + 문서 게이트 | `SKILL.md:70` | 도구 실행 (구체 명령 `원문에 명시 없음`) |
| `git diff --check` | `SKILL.md:70` | 도구 실행 |
| 가시 문자열 행동 테스트 | `SKILL.md:70` | 테스트 통과 |
| `verify-client-ui-i18n` | `SKILL.md:58` | 도구 실행 |
| 모델 노출 문구: 소유 runnable snapshot 과 GUI 증거 | `SKILL.md:58` | 스냅샷·사람 확인(GUI 증거) |
| diff 에 vendor 경로 없음 | `SKILL.md:70` | 도구 실행 가능(방법은 `원문에 명시 없음`) |
| 보고 정직성 | `checks actually run` (`SKILL.md:71`) | 자기 진술 |
| 명제 보존 판정 자체 | 의미 판단 (`then judge passages semantically`, `SKILL.md:67`) | 에이전트 자기 판단 |

- "산문이 좋아졌다"는 판정 자체는 자동 측정 기준이 없고 에이전트의 의미 판단에 의존한다. 커버리지 %나 린트 점수 같은 정량 기준 `원문에 명시 없음`.
- 쿡북의 검증 규칙은 산문 대상이 하는 일에 대한 것이다: `Verify the assertion observes the external result rather than the model's report.` (`references/examples.md:29`)

### 6.4 도구 사용 규칙
- 탐색: ripgrep 사용 예시와 vendor 제외 glob (`SKILL.md:22`), 검색·단어 수 (`SKILL.md:67`).
- Git: 명시 pathspec `:(exclude)vendor/**` (`SKILL.md:22`).
- 금지 도구: 명시적 금지 도구 목록 `원문에 명시 없음`. 대신 금지 행위(심링크 추적, 무관 브랜치 검사, 아카이브 편집)가 있다.
- PR 인라인 코멘트 채널 사용: `Use the user's requested channel` (`SKILL.md:79`). 구체 도구명 `원문에 명시 없음`.

### 6.5 컨텍스트·토큰 규율
- 읽기 범위 규칙: 스코프 전체 검사 (`SKILL.md:67`), 표준 문서와 소유물 읽기 (`SKILL.md:66`).
- 서브에이전트 위임: `원문에 명시 없음`.
- 요약·압축 지시: 산문 자체의 압축은 핵심 주제이나, 에이전트 컨텍스트 압축 지시는 `원문에 명시 없음`.
- 아카이브 노트는 읽기도 제한: `inspect an exact target only to understand a historical inbound citation` (`SKILL.md:24`).
- examples.md 는 "For calibration or unfamiliar cases" 에서만 읽도록 지연 로딩 (`SKILL.md:66`).

### 6.6 모호어의 조작적 정의
| 모호어 | 원문 환산 | 근거 |
|---|---|---|
| contract | obligation, invariant, precondition, postcondition, compatibility promise 중 호출자·피호출자 등이 의존하는 것 | `SKILL.md:8` |
| balanced | 모든 load-bearing 명제를 보존하되 그 위치에서 필요한 최소 설명 | `references/examples.md:3` |
| borderline | 2개 이상 버전이 완전명제 규칙을 만족하나 원칙 간 트레이드오프이고 스킬이 이미 해소하지 않은 경우 | `SKILL.md:75` |
| improvement | 모든 사실 절이 살아남고 결과가 더 명확할 때 (단어 수만으로는 아님) | `SKILL.md:38` |
| clear change | 환산 규칙 `원문에 명시 없음` (borderline 의 여집합으로만 암시) | `SKILL.md:75-77` |
| non-obvious | 환산 규칙 없음. 예시로만 가늠 (`원문에 명시 없음`) | `SKILL.md:12` |
| "obviously complicated local structure" | 정의 없음 | `SKILL.md:49` |
| decorative emphasis | 정의 없음. "meaningful modal, temporal, or negative emphasis" 와 대비 | `SKILL.md:61` |
| load-bearing | 정의 없음. 예시 사용 | `references/examples.md:3` |

## 7. 산출물
### 7.1 최종 결과물 형태
- 작업 유형별로 달라진다:
  - 리뷰·감사: 수정 없는 findings 보고 (`SKILL.md:20`).
  - 명시적 write/fix/trim: 산문 diff (소유 소스 + 재생성된 파생물, 이중언어 쌍은 counterpart 최소 갱신 후 re-record).
  - 모델 노출 문구: 소유 runnable snapshot 갱신, 필요 시 GUI 증거 (`SKILL.md:58`).
  - interactive 캘리브레이션: PR diff 의 추천안 + 그 줄에 붙인 대안 코멘트 (`SKILL.md:79`).
  - 사용자 결정 후: `references/examples.md` 에 증류 예시 추가 (`SKILL.md:81`).

### 7.2 출력 포맷 강제
- 최종 보고 항목 5개를 나열하는 문장이 유일한 포맷 규정:
  > Report the inspected scope, clear changes, deliberate keeps, deferred cases, and checks actually run. (`SKILL.md:71`)
- 보고용 고정 템플릿(표, 마크다운 섹션 제목 등): `원문에 명시 없음`.
- examples.md 항목의 구조 패턴: `**Original / Over-trimmed / Balanced / Over-detailed**` + 한 단락 해설 (`references/examples.md` 전체). 이는 스킬 출력이 아니라 학습 기록 형식이다.

### 7.3 커밋·PR·브랜치·파괴적 동작
| 항목 | 원문 |
|---|---|
| 커밋 생성 | 지시 `원문에 명시 없음` |
| PR 생성 | 지시 `원문에 명시 없음` (PR base 확인, PR 인라인 코멘트로 캘리브레이션은 언급) |
| 브랜치 조작 | 없음. 현재 브랜치·PR base 확인만 (`SKILL.md:65`) |
| force push / 마이그레이션 | 언급 없음 |
| 파일 삭제 | 산문 삭제(trim)는 허용 대상. 파일 단위 삭제 지시 `원문에 명시 없음` |
| 파괴적 위험 | 파생물 재생성(`regenerate every derivative`, `SKILL.md:26`)이 생성 파일을 덮어쓴다 |
| 쓰기 권한 | 리뷰·감사는 무편집 (`SKILL.md:20`) |

## 8. 주의점 / 한계 (여기서만 평가)
### 8.1 오작동·과잉작동 시나리오
1. **"문서 정리해줘" 같은 광범위 요청**: scope 누락으로 즉시 중단되어 사용자가 한 번 되돌아와야 한다. 의도된 안전장치지만, 사용자가 "그냥 알아서" 를 기대하면 마찰이 된다 (`SKILL.md:16`).
2. **모델 노출 문구의 보류 폭주**: 소유 snapshot 이 없는 프롬프트·도구 문구는 모두 "defer" 가 된다. 문구 개선이 목적인 사용자는 매번 시나리오 신규 작성으로 범위 확장이 필요하다 (`SKILL.md:58`, `references/examples.md:149`).
3. **"enough" 의 주관성**: "Write enough to preserve the contract" 의 충분함이 에이전트 의미 판단에 맡겨져 있다. 같은 문장에 대해 에이전트마다 keep/trim 이 갈릴 수 있고, 수치 기준이 없어 재현성이 낮다.
4. **추가 방향 과잉**: "Add or restore prose" 규정(`SKILL.md:46`) 때문에 Public JSDoc 에 throws·cancellation·durability 를 전부 채우려는 경향이 생길 수 있다. 반대로 "Do not add a comment when ... obvious locally" 와의 경계가 "obviously" 판단에 달려 있다.
5. **파생물 재생성 누락**: 생성기 추출 첫 문장 규칙(`SKILL.md:26`)은 생성기가 무엇을 추출하는지 에이전트가 알아야만 지켜진다. 생성기 위치·실행 명령은 원문에 없다.
6. **무관 브랜치 불검사와 PR base 의존**: git 컨텍스트가 없는 환경에서는 1단계를 수행할 수 없다 (대체 절차 `원문에 명시 없음`).

### 8.2 다른 스킬·CLAUDE.md 규칙과의 충돌 가능 지점
- `dsh-doc` 와의 경계: 이 스킬은 "editorial judgment and required prose coverage", dsh-doc 은 "placement, budgets, bilingual pairs, documentation gates". 그러나 이 스킬의 6단계도 "documentation gates" 를 실행하라 하고(`SKILL.md:70`), 이중언어 쌍도 다룬다(`SKILL.md:26`). 두 스킬 모두 켜지는 상황에서 어느 쪽 지시가 우선인지 `원문에 명시 없음`.
- `dsh-trim-cot-leakage` 와의 중복: 이 스킬의 서두가 "remove reasoning transcripts" 를 포함하고(`SKILL.md:8`), examples 에도 "Delete reasoning transcripts entirely" 섹션이 있다(`references/examples.md:115`). 사냥·수정은 위임하되 기준 설명은 이 스킬에도 있어 이중 지시가 된다.
- `docs/AGENTS.md` 의 writing-rules 가 단일 진실원인데, 이 스킬이 일부 규칙(Agent Note 현재형, README 요건 등)을 재진술한다. 문서 갱신 시 드리프트 가능.
- 일반적인 "주석 최소화" 성향의 개인 CLAUDE.md 와는 충돌 가능: 이 스킬은 주석을 *추가*하라고도 한다 (`SKILL.md:46`).
- "단순 삭제 목표" 류 요청(예: 줄 수 N% 감축)과 충돌: `do not manufacture edits to satisfy a deletion target` (`SKILL.md:68`).

### 8.3 검증 공백
- 명제 보존이 지켜졌는지 대조하는 자동 수단이 없다. 편집 전후 명제 목록을 산출물로 남기라는 지시가 없고(보고 항목에도 없음, `SKILL.md:71`), 검증은 에이전트 자기 진술 + 일반 검사에 의존한다.
- `documentation gates`, `narrow relevant checks` 의 구체 명령이 원문에 없어 6단계 "통과" 가 실제로 무엇인지 불명.
- `.agents/notes/archived/` 와 `vendor/` 제외를 확인하는 방법은 diff 의 vendor 경로 검사만 있다. archived 경로가 diff 에 없는지의 확인은 `원문에 명시 없음`.
- 이중언어 쌍 "re-record the pair" 의 구체 절차는 `docs/AGENTS.md` 로 넘겨져 있고 이 스킬 안에서는 검증 불가.
- examples.md 의 예시 문장(예: `ctx.shell`, 'lifecycle Agent Note', 'worker-isolation Agent Note')이 실제 리포지토리에 존재하는지 이 폴더만으로는 확인 불가.

### 8.4 유지보수 리스크
- 하드코딩된 경로: `../dsh-doc/SKILL.md`, `../dsh-trim-cot-leakage/SKILL.md`, `../../../docs/AGENTS.md#writing-rules`, `../../../docs/cookbook/adding-a-package.md#4-write-the-package-readme`, `.agents/notes/archived/`, `vendor/`. 디렉터리 이동이나 앵커 변경 시 링크가 끊긴다.
- 리포지토리 고유 명칭 의존: `Cordis-free primitives`, `verify-client-ui-i18n`, `ctx.shell`. 리팩터링 시 본문 갱신 필요.
- 모델명·외부 도구 버전 하드코딩: 없음.
- examples.md 증가 규칙: 사용자 결정마다 추가되는 구조(`SKILL.md:81`)라 17개 예시가 계속 늘 수 있고, 삭제·정리 규칙은 `원문에 명시 없음`. 스킬 로딩 비용이 점증한다.
- 현재 SKILL.md 9,621 바이트 + examples 9,457 바이트. 크기 상한 규칙 `원문에 명시 없음`.

### 8.5 한 줄 판정
**조건부 도입 권장** — deepseek-harness 리포지토리 내부에서 scope 를 명시해 쓰는 한 명제 보존·위치별 필수 커버리지 기준이 구체적이고 실용적이지만(`SKILL.md:30-36`, `48-59`), 다른 리포지토리 이식은 `docs/AGENTS.md` 등 외부 자원 의존 때문에 비권장이다.
