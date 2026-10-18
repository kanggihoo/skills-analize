# full-output-enforcement 분석

## 1. 개요

- **원본 경로**: `skills-collections/taste-skills/full-output-enforcement/`
- **핵심 파일**: `SKILL.md` (2,592 bytes) — **이 컬렉션에서 가장 작은 스킬**
- **보조 파일**: 없음
- **성격**: **출력 절단(truncation) 방지 스킬**. 디자인 지침이 전혀 없으며, LLM의 생략·요약 습성을 금지 목록과 절차로 억제하는 **횡단(cross-cutting) 행동 규칙**.

원문 자기 규정: "Overrides default LLM truncation behavior."

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문:

> "Overrides default LLM truncation behavior. Enforces complete code generation, bans placeholder patterns, and handles token-limit splits cleanly. Apply to any task requiring exhaustive, unabridged output."

**매칭되는 사용자 발화**
- "전체 파일 다 써줘", "생략하지 말고", "`// ...` 없이 완전한 코드로"
- "5개 컴포넌트 전부"
- description의 `Apply to any task requiring exhaustive, unabridged output`가 조건을 매우 넓게 잡음 — 사실상 **다른 스킬과 병행하는 보조 스킬**로 설계됨

**특징**: 트리거가 특정 도메인이 아니라 **출력 형태**에 걸려 있다. 이 컬렉션의 다른 스킬들이 대량의 코드를 산출하므로(design-taste-frontend는 87KB 지침), 그 산출물이 잘리는 것을 막는 짝 스킬로 보인다 — 다만 **상호 참조는 원문에 없다.**

`allowed-tools` / `metadata`: **원문에 명시 없음** (`name`, `description`만).

## 3. 적합한 상황 / 부적합한 상황

**적합**
- 긴 단일 파일(수백~수천 줄)을 통째로 받아야 할 때
- N개 컴포넌트/섹션을 빠짐없이 받아야 할 때 — "Count how many distinct deliverables are expected ... **Lock that number**"
- 이 컬렉션의 다른 디자인 스킬과 병행 — 랜딩 페이지 전체 코드처럼 산출물이 큰 작업
- 토큰 한도에 걸릴 것이 예상되어 **깨끗한 분할**이 필요할 때

**부적합 / 과한 상황**
- 짧은 답변·질의응답 — 완전성 강제가 무의미
- 요약·개요를 원하는 경우 — 이 스킬의 목적과 정반대
- 탐색·논의 단계 — 스켈레톤이나 개요가 오히려 유용한 국면
- 컨텍스트/비용 제약이 큰 환경 — 이 스킬은 명시적으로 "Do not optimize for brevity"

**형제 스킬 대신 이걸 고르는 기준**: 이 스킬은 **대체재가 아니라 보완재**다. 다른 스킬과 함께 켜는 것이 전제이며, 단독으로는 산출물이 없다.

## 4. 외부 의존성

- **API 키**: **불필요.**
- **폴백 모드**: 해당 없음. 다만 토큰 한도 도달 시의 처리가 사실상 폴백 — 아래 §5 참조.
- **필요한 CLI/런타임/패키지**: **없음.** 스크립트 없음, 순수 프롬프트 규칙.
- **네트워크**: 불필요.
- **비용 발생 지점**: **간접적이지만 실질적.** 완전 출력을 강제하므로 **출력 토큰이 크게 늘어난다.** 원문이 이를 정면으로 요구: "Do not optimize for brevity — optimize for completeness." 그리고 "continue" 이어쓰기가 여러 라운드 발생할 수 있다.

## 5. 워크플로우

### Baseline (전제)
"Treat every task as production-critical. **A partial output is a broken output.** Do not optimize for brevity — optimize for completeness. If the user asks for a full file, deliver the full file. If the user asks for 5 components, deliver 5 components. **No exceptions.**"

### Execution Process — 3단계
1. **Scope** — "Read the full request. **Count how many distinct deliverables are expected** (files, functions, sections, answers). **Lock that number.**"
2. **Build** — "Generate every deliverable completely. **No partial drafts, no \"you can extend this later.\"**"
3. **Cross-check** — "Before output, **re-read the original request. Compare your deliverable count against the scope count.** If anything is missing, add it before responding."

→ 1단계에서 고정한 수량이 3단계의 검증 기준이 되는 **수량 대조 구조**.

### Handling Long Outputs — **분기 (토큰 한도 접근 시)**
"When a response approaches the token limit:"
- "**Do not compress** remaining sections to squeeze them in."
- "**Do not skip ahead** to a conclusion."
- "Write at full quality up to a **clean breakpoint** (end of a function, end of a file, end of a section)."
- 종료 마커 고정:
```
[PAUSED — X of Y complete. Send "continue" to resume from: next section name]
```
- 재개 규칙: "On \"continue\", **pick up exactly where you stopped. No recap, no repetition.**"

### Quick Check — 최종 검증 4항목
"Before finalizing any response, verify:"
- "No banned patterns from the list above appear anywhere in the output"
- "Every item the user requested is present and finished"
- "Code blocks contain **actual runnable code**, not descriptions of what code would do"
- "**Nothing was shortened to save space**"

**사용자 확인 요구 지점**: 토큰 한도 도달 시 `[PAUSED]` 마커로 사용자의 "continue"를 대기. 이것이 유일한 정지점.

## 6. 디자인 지침 분석

**이 스킬은 미적 지침을 전혀 담지 않는다.** 타이포그래피·컬러·스페이싱·모션·레이아웃 지침 모두 **원문에 없음.** 대신 **출력 형태에 대한 금지 목록**이 이 컬렉션 공통의 "anti-pattern 열거" 방법론을 그대로 사용한다.

### 금지 규칙 (anti-pattern) — 원문 그대로

"The following patterns are **hard failures**. Never produce them:"

**In code blocks** (원문 전체):
`// ...`, `// rest of code`, `// implement here`, `// TODO`, `/* ... */`, `// similar to above`, `// continue pattern`, `// add more as needed`, bare `...` standing in for omitted code

**In prose** (원문 전체):
"Let me know if you want me to continue", "I can provide more details if needed", "for brevity", "the rest follows the same pattern", "similarly for the remaining", "and so on" (when replacing actual content), "I'll leave that as an exercise"

**Structural shortcuts** (원문 전체):
- "Outputting a skeleton when the request was for a full implementation."
- "Showing the first and last section while skipping the middle."
- "Replacing repeated logic with one example and a description."
- "Describing what code should do instead of writing it."

**긴 출력 처리에서의 금지**:
- "Do not compress remaining sections to squeeze them in."
- "Do not skip ahead to a conclusion."
- "No recap, no repetition." (재개 시)

### 강제 규칙 — 수치 인용

수치 지침은 사실상 없다. 유일하게 형식이 고정된 것:
```
[PAUSED — X of Y complete. Send "continue" to resume from: next section name]
```
그리고 "deliverable count"라는 **가변 수량을 고정(lock)**하라는 규칙이 수치의 역할을 한다.

spacing scale, line-height, border-radius, easing curve, duration, contrast ratio 등은 **원문에 명시 없음** (설계상 범위 밖).

### 항목별 지침

- **타이포그래피 / 컬러 / 스페이싱 / 모션 / 레이아웃**: **원문에 지침 없음.**
- **접근성**: **원문에 지침 없음.**
- **코드 완전성** (이 스킬의 유일한 지침 영역): 금지 패턴 3분류(코드 블록 / 산문 / 구조적 단축) + 수량 대조 + 클린 브레이크포인트.

### 지침을 주는 방식 자체

1. **금지 문구를 문자열 단위로 열거**: `// ...`, `// TODO`, "for brevity" 등을 **정확한 문자열로** 나열. 검출 가능한 형태로 만든 것이 특징 — 감각이 아니라 grep 가능한 패턴.
2. **3분류 체계**: 코드 블록 / 산문 / 구조적 단축. 같은 위반이 나타나는 세 가지 층위를 분리.
3. **"hard failures"라는 강도 선언**: 조건부 예외 없음. "No exceptions."
4. **수량 고정 → 대조 검증**: Scope에서 세고 Cross-check에서 비교. 이 컬렉션에서 가장 단순하지만 명확한 자기 검증 장치.
5. **한계 상황의 프로토콜화**: 토큰 한도를 "실패"가 아니라 "깨끗한 일시정지"로 처리. 고정 마커 + 재개 규칙까지 규정.
6. **최종 Quick Check 4항목**: 배포 전 체크리스트.
7. **페르소나 부여 없음**, **참조 대상 없음**, **예시 코드 없음**.

### 모호한 감각어의 번역

| 모호어 (원문) | 구체적 조작 |
| --- | --- |
| "**exhaustive, unabridged output**" | 금지 문구 목록 + 수량 대조 + 클린 브레이크포인트 |
| "**A partial output is a broken output**" | 부분 출력을 결함으로 재정의 — 판단 여지 제거 |
| "**for brevity**" | **금지 문구로 명시** — 이 표현 자체가 위반 |
| "**production-critical**" | 모든 작업을 이 등급으로 취급하라는 전제 |
| "**clean breakpoint**" | "end of a function, end of a file, end of a section" |
| "**actual runnable code, not descriptions of what code would do**" | Quick Check 항목으로 검증 대상화 |

## 7. 산출물

- **형식**: 산출물이 없다. 이 스킬은 **다른 작업의 출력 형태를 규정**한다.
- **파일 저장 위치 / 네이밍 규칙**: 해당 없음. **원문에 명시 없음.**
- 유일한 고정 출력 형식: 토큰 한도 시의 `[PAUSED — X of Y complete. ...]` 마커.

## 8. 주의점 / 한계

- **비용·컨텍스트 부담이 구조적**: 완전 출력을 강제하므로 출력 토큰이 크게 늘고, 여러 차례 "continue"가 필요할 수 있다. 원문은 이 비용을 인지하고도 명시적으로 완전성을 택한다("Do not optimize for brevity"). 비용 상한·예산 개념은 **원문에 없음.**
- **`// TODO` 금지의 부작용**: 실제로 미구현이 정당한 경우(외부 API 키 대기, 사용자 결정 대기)에도 TODO 주석을 금지한다. 그 경우 무엇을 쓸지는 **원문에 명시 없음.** 다른 스킬들(`web-design-engineer`, `beautiful-article`)이 "placeholder가 fake보다 낫다"고 하는 것과 미묘하게 긴장한다 — 다만 이 스킬의 금지 대상은 "코드 생략"이고 그쪽은 "가짜 데이터"이므로 직접 충돌은 아니다.
- **"continue" 재개의 신뢰성**: "pick up exactly where you stopped. No recap, no repetition."을 요구하지만, 컨텍스트가 요약되거나 세션이 바뀌면 정확한 재개가 어려워진다. 그 경우의 처리는 **원문에 명시 없음.** `[PAUSED]` 마커에 "resume from: next section name"을 넣는 것이 사실상의 방어책.
- **수량 고정의 취약성**: "Count how many distinct deliverables"가 요청 해석에 의존한다. 요청이 애매하면 고정한 수량 자체가 틀릴 수 있고, Cross-check는 그 틀린 수량과 대조할 뿐이다.
- **컬렉션 내 위치의 모호함**: 디자인 컬렉션에 있으나 디자인 지침이 없다. 다른 스킬과 병행 사용이 전제로 보이지만 **어느 스킬과 어떻게 조합하는지 원문에 없다.** 스킬 시스템에서 두 스킬을 동시에 활성화하는 방법도 명시되지 않음.
- **강한 경고 지점**:
  - "**A partial output is a broken output.**"
  - "**No exceptions.**"
  - "The following patterns are **hard failures**."
  - "**Do not compress** remaining sections" / "**Do not skip ahead** to a conclusion."
  - "**Nothing was shortened to save space**"
- **검증 장치**: 수량 대조(Scope ↔ Cross-check) + Quick Check 4항목 + 문자열 단위 금지 목록. 금지 목록이 문자열이므로 **원리적으로 자동 검출 가능**하지만, 실행 가능한 린터·스크립트는 제공되지 않는다.
