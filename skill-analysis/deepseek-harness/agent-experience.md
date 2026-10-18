# agent-experience 분석

## 1. 개요
- 원본 경로: `/Users/kkh/Desktop/skills-analize/deepseek-harness/agent-experience/` (컬렉션: deepseek-harness)
- 읽은 파일 전체 (디렉터리 재귀 조사 결과, 파일 1개뿐):

| 파일 | 크기 | 역할 |
|---|---|---|
| `SKILL.md` | 2093 bytes / 19줄 | 유일한 파일. frontmatter(1-4줄) + 일반 원칙 6개(6-11줄) + "Tool definitions" 규칙 5개(13-19줄) |

- 보조 파일: `references/`, `scripts/`, `templates/`, `assets/` 모두 없음. 실행 스크립트 없음.
- 성격: **검증/가이드라인(planning에 가까운 작성 규범)**. 코드를 생성하거나 게이트를 돌리지 않고, 모델 대상 도구 정의·스킬·컨텍스트 로딩을 작성할 때 따를 설계 원칙을 준다. 5개 분류 중 가장 가까운 것은 계획(planning)/작성 규범이며, 원문이 스스로 분류를 밝히지는 않는다 (`원문에 명시 없음`).
- 자기 규정 (description 인용):
  > Use when writing or changing a model-facing tool definition (name, description, parameter schema, or its system-prompt section), and when designing skills, context loading, or multi-step workflows, to make information discoverable and use context efficiently. (`SKILL.md:3`)
- 이름 "agent-experience"는 `SKILL.md:2`. 본문에서 이 용어를 정의하는 문장은 없다 (`원문에 명시 없음`).

## 2. 활성화 조건 (언제 켜지는가)
- frontmatter `description` 전문:
  > Use when writing or changing a model-facing tool definition (name, description, parameter schema, or its system-prompt section), and when designing skills, context loading, or multi-step workflows, to make information discoverable and use context efficiently.
- description을 두 갈래로 분해하면:
  1. 모델이 보는 도구 정의를 쓰거나 바꿀 때: 대상은 name, description, parameter schema, 해당 도구의 system-prompt 섹션.
  2. 스킬, 컨텍스트 로딩, 다단계 워크플로우를 설계할 때.
- 매칭되는 사용자 발화 예시 (description 문구에서 추출. 원문에 예시 발화 목록은 없음):
  1. "이 MCP 도구의 description을 다시 써줘" (tool definition 변경)
  2. "새 도구의 parameter schema를 설계해줘" (parameter schema)
  3. "system prompt에서 이 도구 설명 섹션을 줄여줘" (system-prompt section)
  4. "스킬을 새로 설계하려는데 SKILL.md에 뭘 넣고 뭘 references로 뺄까" (designing skills)
  5. "대용량 로그를 에이전트에게 어떻게 넘길지 컨텍스트 로딩 설계해줘" (context loading)
  6. "여러 단계로 도는 워크플로우에서 각 단계 출력 크기를 어떻게 제한할까" (multi-step workflows)
  7. "도구 정의 바꾼 뒤 첫 턴 토큰이 줄었는지 확인하고 싶어" (`SKILL.md:19`의 Measure the change)
- 의도적으로 배제되는 발화 / 넘길 스킬: 원문에 배제 조건이나 다른 스킬로의 라우팅 규칙이 없다 (`원문에 명시 없음`). 형제 스킬 이름 언급도 없음.
- frontmatter 필드: `name`, `description` 두 개뿐. `allowed-tools`, `model`, `metadata` 등은 없음.

## 3. 적합 / 부적합
- 적합 (원문 trigger에서 도출되는 상황만):
  - 모델이 호출하는 도구(함수 호출, MCP 등)의 정의를 새로 쓰거나 수정하는 작업.
  - 스킬·컨텍스트 로딩·멀티스텝 워크플로우처럼 "정보를 언제 얼마나 노출할지"를 결정하는 설계 작업.
  - 도구 정의가 길어져 프롬프트 토큰이 문제인 하네스 (`SKILL.md:19`가 첫 턴 프롬프트 토큰 비교를 요구).
- 부적합·과함: 원문에 "쓰지 말라"는 조건이 명시돼 있지 않다 (`원문에 명시 없음`). 다만 trigger가 "model-facing tool definition 작성/변경, 스킬/컨텍스트/워크플로우 설계"로 한정되므로, 일반 애플리케이션 코드나 사람 대상 문서 작성은 description의 trigger 범위 밖이다.
- 형제 스킬 대신 고르는 기준 한 줄: 형제 스킬 언급이 원문에 없으므로 비교 기준은 `원문에 명시 없음`; 작업 대상이 "모델이 읽는 정의/컨텍스트의 설계"이면 이 스킬.

## 4. 전제 조건과 외부 의존성
- 실행 스크립트: 없음. 런타임·패키지·CLI 도구: 원문에 요구 없음.
- API 키·환경변수·네트워크: 불필요 (언급 없음).
- 리포지토리 전제 (테스트 러너, CI, 린터, 타입 시스템, 커밋 권한, 브랜치 전략): 원문에 명시 없음.
- 단, 규칙 하나는 측정 수단을 암묵적으로 요구한다: 
  > Measure the change. Compare first-turn prompt tokens before and after a tool-definition change. (`SKILL.md:19`)
  첫 턴 프롬프트 토큰 수를 얻는 방법(토크나이저, API usage 필드 등)은 원문에 명시 없음.
- 비용 발생 지점: 토큰 측정 자체의 비용은 언급 없음. 스킬 목적이 토큰 절감이라는 점만 `SKILL.md:3`("use context efficiently")에서 확인된다.
- 상태 파일·산출물 디렉터리 생성: 없음 (`plan.md`, `.claude/` 등 언급 없음).

## 5. 워크플로우
이 스킬은 순서가 있는 단계형 워크플로우를 정의하지 않는다. 번호 매긴 단계, "run in order", "do not skip" 류 문구, 재시도 상한, 수렴 조건이 모두 `원문에 명시 없음`. 아래는 원문 항목을 그대로 두 묶음으로 나눈 것이며, 순서 강제는 없다.

### 5-A. 일반 원칙 (`SKILL.md:6-11`) — 모두 비게이트
| 원칙 | 입력 → 행동 → 출력 | 통과 조건 |
|---|---|---|
| Start with minimal context | 설계 대상 → purpose, available actions, constraints를 먼저 노출 → 상세는 필요 시 로드 | 판정 기준 명시 없음 |
| Make discovery explicit | deferred resource → 명확한 description + 신뢰할 수 있는 retrieval 수단 부여 | 명시 없음 |
| Keep critical constraints visible | permissions/destructive effects/required validation → 해당 action 앞에 배치 | 명시 없음 |
| Prefer bounded outputs | 도구 결과 → 간결한 결과 + 상세 조회용 identifier/path | 명시 없음 |
| Use locality | 작업 결과 → 인접 맥락 소량 동봉, 생략·잘림 표시, 추가 조회 수단 제공 | 명시 없음 |
| Evaluate total work | 컨텍스트 절감안 → 추가 검색·반복 읽기·실수가 늘지 않는지 확인 | 명시 없음 |

원문 인용 (각 항목):
> **Start with minimal context:** expose purpose, available actions, and constraints first; load detailed instructions when needed. (`SKILL.md:6`)

> **Make discovery explicit:** every deferred resource needs a clear description and a reliable way to retrieve it. (`SKILL.md:7`)

> **Keep critical constraints visible:** permissions, destructive effects, and required validation should appear before the relevant action. (`SKILL.md:8`)

> **Prefer bounded outputs:** return concise results with identifiers or paths for retrieving details; avoid dumping entire logs or documents. (`SKILL.md:9`)

> **Use locality:** include a bounded amount of likely needed adjacent context with an operation's result. For example, deliver a thread reply with a few preceding messages. Mark omissions and truncation explicitly, and provide a way to retrieve more. (`SKILL.md:10`)

> **Evaluate total work:** saving context is useful only if it does not cause more searches, repeated reads, or mistakes. (`SKILL.md:11`)

### 5-B. 도구 정의 규칙 (`SKILL.md:13-19`) — 모두 비게이트
도구 정의를 작성/수정할 때 적용. 입력은 기존(또는 초안) 도구 정의, 출력은 수정된 정의.
1. Delete obvious constraints (`:15`)
2. Describe behavior, not implementation (`:16`)
3. Put parameter rules on the parameter (`:17`)
4. Say each fact once (`:18`)
5. Measure the change (`:19`) — 유일하게 "측정"을 수반하는 단계. 다만 통과 임계값(몇 % 감소 등)이 원문에 없으므로 게이트가 아니라 비교 행위로만 기술돼 있다.

- 게이트(탈락 가능) 단계: 없음.
- 루프 구조: 없음. 다만 `:11`(총 작업량 평가)과 `:19`(변경 전후 비교)는 변경 → 측정 → 판단이라는 피드백 성격의 문장이나, 반복 횟수·종료 조건은 `원문에 명시 없음`.
- 사람 개입 지점(승인 요청, 질문 라운드): 없음.

## 6. 엔지니어링 규칙 분석

### 6-1. 금지 규칙 (anti-pattern) — 원문 그대로 + 막으려는 실패 모드
이 스킬은 "하지 마라" 형식보다 명령형 처방이 많다. 부정형으로 쓰인 것과 처방의 반대면을 구분한다.

| 원문 | 위치 | 막으려는 실패 모드 (원문이 직접 말한 범위) |
|---|---|---|
| "avoid dumping entire logs or documents" | `:9` | 로그/문서 전체를 결과로 덤프 |
| "omit rules the model learns from the call result, such as a missing file failing to read or a failed send not being delivered" | `:15` | 호출 결과로 모델이 알게 될 자명한 제약을 정의에 중복 기재 |
| "omit internal mechanisms, output markers the model sees in results, and enforcement details" | `:16` | 구현 세부, 결과에 보이는 출력 마커, 강제 방식 설명을 정의에 포함 |
| "Do not repeat the tool definition in its system-prompt section, a parameter description in the tool description, or one tool's rules in another tool." | `:18` | 같은 사실을 여러 위치에 반복 |
| "saving context is useful only if it does not cause more searches, repeated reads, or mistakes" | `:11` | 컨텍스트를 줄이려다 오히려 추가 검색·재읽기·오류가 늘어나는 역효과 |
| "a description that varies with configuration usually means the varying part belongs to a parameter" | `:17` | 설정에 따라 달라지는 description (원문은 "usually"라는 한정어를 씀) |

각 항목이 방지하려는 구체 실패 사례는 위 인용된 예시(missing file, failed send, thread reply) 외에는 `원문에 명시 없음`.

### 6-2. 강제 규칙 (수치·임계값)
- 원문 전체에 **숫자 임계값이 없다**. 토큰 상한, 줄 수 제한, 재시도 횟수, 타임아웃, 커버리지 % 모두 `원문에 명시 없음`.
- 수량 표현은 전부 정성적이다:
  | 표현 | 위치 |
  |---|---|
  | "a bounded amount of likely needed adjacent context" | `:10` |
  | "a few preceding messages" (예시) | `:10` |
  | "concise results" | `:9` |
  | "first-turn prompt tokens before and after" | `:19` |
  "bounded", "concise", "a few"의 구체 수치는 정의돼 있지 않다.
- 강제 규칙 목록(수치 없음, 전부 should/명령형):
  | 규칙 | 근거 |
  |---|---|
  | purpose, available actions, constraints 먼저 노출 | `:6` |
  | deferred resource마다 description + retrieval 수단 | `:7` |
  | permissions, destructive effects, required validation은 해당 action 앞에 표시 | `:8` |
  | 상세는 identifier/path로 조회 | `:9` |
  | 생략·잘림은 명시적으로 표시하고 추가 조회 경로 제공 | `:10` |
  | 파라미터 규칙(defaults, ranges, pairing, when-to-set)은 파라미터에 기재 | `:17` |
  | 도구 정의 변경 시 첫 턴 프롬프트 토큰 전후 비교 | `:19` |

### 6-3. 검증 방식
- 유일한 객관 검증: 도구 정의 변경 전후 **first-turn prompt tokens 비교** (`:19`). 이는 측정 가능한 수치 기반 검증이다.
- 나머지 원칙의 "됐다" 판정: 원문에 판정 기준이 없다. `:11`은 "추가 검색·반복 읽기·실수가 없는가"라는 사후 점검 기준을 주지만, 이를 어떻게 관찰하는지(로그, 평가셋 등)는 `원문에 명시 없음`.
- 테스트 통과, 커버리지, 빌드, 사람 확인에 대한 언급: 없음. 위 `:19`를 제외하면 사실상 에이전트 자기 판단에 의존하는 구조.

### 6-4. 도구 사용 규칙
- 이 스킬이 에이전트 자신에게 어떤 도구를 쓰라/쓰지 말라고 지시하는 문장: 없음 (`allowed-tools` 필드 없음).
- 규칙의 대상은 "에이전트가 쓰는 도구"가 아니라 "작성 중인 도구 정의"이다. 도구 정의 안에 포함할 내용/뺄 내용을 규정한다 (`:15-19`).
- 도구 정의 안에 넣어야 한다고 한 것: 동작과 반환값 ("State what the tool does and returns", `:16`), 파라미터별 기본값·범위·페어링·설정 조건 (`:17`).
- 정의에서 빼라고 한 것: 자명한 제약 (`:15`), 내부 메커니즘·결과에 보이는 출력 마커·강제 세부 (`:16`), 중복 사실 (`:18`).

### 6-5. 컨텍스트·토큰 규율
이 스킬의 중심 주제. 원문에서 지시하는 것:
- 처음엔 최소 컨텍스트, 상세는 필요할 때 로드 (`:6`).
- 지연 로드 자원은 설명 + 신뢰할 검색 수단 필수 (`:7`).
- 결과는 간결하게, 상세는 식별자/경로로 (`:9`).
- 인접 맥락은 제한된 양만 동봉하고 생략/잘림을 표시 (`:10`). 예시: "deliver a thread reply with a few preceding messages".
- 총작업량 관점의 평가 (`:11`).
- 서브에이전트 위임, 요약·압축 지시, 파일 읽기 범위 규칙: `원문에 명시 없음`.

### 6-6. 모호어의 조작적 정의
| 모호어 | 원문의 환산 | 판정 |
|---|---|---|
| "minimal context" | "purpose, available actions, and constraints" (`:6`) | 포함 항목으로 환산 (수치 없음) |
| "obvious constraints" | "rules the model learns from the call result, such as a missing file failing to read or a failed send not being delivered" (`:15`) | 예시 2개로 환산 |
| "implementation" | "internal mechanisms, output markers the model sees in results, and enforcement details" (`:16`) | 열거로 환산 |
| "parameter rules" | "Defaults, ranges, pairing, and when-to-set rules" (`:17`) | 열거로 환산 |
| "bounded" / "concise" / "a few" | 환산 규칙 없음 | `원문에 명시 없음` |
| "critical constraints" | "permissions, destructive effects, and required validation" (`:8`) | 열거로 환산 |
| "reliable way to retrieve" | 환산 규칙 없음 | `원문에 명시 없음` |
| "efficient" (description) | `:11`, `:19`에서 각각 "추가 검색/재읽기/실수가 없음", "첫 턴 프롬프트 토큰 전후 비교"로 부분 환산 | 부분적 |

## 7. 산출물
- 최종 결과물 형태: 별도 산출물 정의 없음. 결과는 수정된(또는 새로 쓴) 도구 정의·스킬 문서·컨텍스트 로딩 설계 자체이며, 이는 원문이 명시한 것이 아니라 description의 "writing or changing"에서 읽히는 범위다. 리포트·판정문 형식은 `원문에 명시 없음`.
- 출력 포맷 강제 템플릿: 없음.
- 커밋·PR·브랜치 조작: 언급 없음.
- 파괴적 동작(파일 삭제, force push, 마이그레이션): 언급 없음. 스킬 자체는 파괴적 동작을 지시하지 않으며, `:8`은 작성 중인 도구의 destructive effects를 해당 action 앞에 보이게 하라는 설계 규칙이다.
- 측정 보고 형식: `:19`의 전후 토큰 비교를 어떤 형태로 남기는지 `원문에 명시 없음`.

## 8. 주의점 / 한계 (여기서만 평가)
- **오작동·과잉작동 시나리오**
  - `:15` "Delete obvious constraints"를 과적용하면, 모델이 결과를 보고서야 알게 되는 제약이라도 비용이 큰 경우(되돌릴 수 없는 파괴적 동작)에 필요한 사전 경고까지 지울 수 있다. `:8`이 destructive effects는 action 앞에 보이게 하라고 하므로 두 규칙이 충돌할 여지가 있으나, 어느 쪽이 우선하는지 원문에 없다.
  - `:18` "Say each fact once"를 엄격히 적용하면 도구별 정의가 서로를 참조해야 하는 상황이 생긴다. 모델이 한 정의만 보고 호출하는 경우 필요한 정보가 빠질 수 있다 (원문은 이 경우의 예외를 두지 않음).
  - `:6`의 minimal context를 지나치게 밀면 `:11`이 경고한 추가 검색·재읽기 증가가 발생한다. 원문 스스로 이를 인지하고 `:11`을 넣었지만, 균형점을 가르는 기준은 없다.
- **충돌 가능 지점**: 원문에 다른 스킬 언급이 없어 컬렉션 내부 충돌은 이 파일만으로는 확정 불가. 기존 CLAUDE.md가 도구 설명을 장황하게(규칙 반복, 구현 세부 포함) 쓰라고 지시한다면 `:16`, `:18`과 충돌한다.
- **검증 공백**
  - 수치 기준 부재: "bounded", "concise", "a few"에 상한이 없어 서로 다른 에이전트가 다른 크기로 해석한다.
  - `:19`는 토큰 감소만 비교하라고 하고, 감소가 모델의 도구 호출 정확도를 해치지 않았는지 확인하는 단계는 없다. `:11`의 "mistakes" 점검 방법도 명시되지 않았다.
  - 토큰 측정 수단·기록 위치 미지정.
  - 규칙이 적용되었는지 확인할 체크리스트나 완료 조건이 없다.
- **유지보수 리스크**: 외부 도구 버전, 하드코딩 경로, 모델명 의존이 없다 (파일 1개, 19줄, 평문 규칙). 반대로 예시가 `thread reply` 하나뿐이라 특정 도구군(메시징류)에 치우친 인상이 있으나, 일반화 범위는 원문에 명시 없음.
- **한 줄 판정: 조건부 도입 권장** — 모델용 도구 정의·컨텍스트 설계 규칙은 구체적이고 `:19`처럼 측정 가능한 항목도 있으나, 수치 임계값과 완료 조건이 없어 규칙 충돌 시(`:8` vs `:15`) 판단이 에이전트에 맡겨진다.
