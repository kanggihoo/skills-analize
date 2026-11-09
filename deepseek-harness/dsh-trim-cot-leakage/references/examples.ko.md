# Few-shot 누설(leakage) 예시

2026-08 저장소 전체 정리 작업과 그 리뷰 라운드에서 추려 낸 예시다. 그대로 옮겨 쓰는 템플릿이 아니라, 각 예시의 원리를 파악하는 데 쓴다. 이 파일은 누설된 문구를 보정용 자료로 일부러 인용한다. [recall batteries](recall-batteries.md)는 이 스킬의 디렉터리를 제외하므로, 여기 있는 문구가 다른 곳에서 써도 된다는 허가는 아니다.

## 죽은 인용

### 커밋된 소유자가 있는 결정 번호

**누설:** "Slash input resolves against the visible catalog (decision 21)."

**수정:** "Slash input resolves against the visible catalog — the plain-text-reference decision, owned by [the web input-machine note](../../../notes/archived/architecture/2026-07-25-web-input-machine-and-slash-pipeline.md)."

HEAD에서 결정 번호는 아무 데서도 해석되지 않는다. 해석되는 것은 결정의 이름과 소유 노트의 경로다. 소유 노트의 경로는 파일마다 최소 한 번은 적는다. 링크를 지원하는 표면이면 링크로 적는다. 이후의 언급은 검색 가능한 이름만 써도 된다.

### 소유자가 없는 결정 번호

**누설:** "The registry rejects duplicate names (decision 7: names are flat, no namespacing)."

**수정:** "The registry rejects duplicate names; names are flat, with no namespacing."

"decision 7"을 소유하는 커밋된 아티팩트가 없으므로 인용은 삭제한다. 다만 그 안의 사실적 절(이름이 평평하다, flat names)은 함께 지우지 않고, 독립적으로 읽혀도 성립하도록 다시 쓴다.

### 감사 항목 코드

**누설:** "Rendering is pure: same snapshot, same string (audit R3)."

**수정:** "Rendering is pure: same snapshot, same string."

저장소에 감사 문서가 없다. 이 코드는 세션 중에 쓴 약칭이며, 아무 명제도 담지 않는다.

### 초안 상태의 절 번호

**누설:** "Layering follows the design (v2 §3.2): `src/core/` is the pure core."

**수정:** "Layering: `src/core/` is the pure core."

아무도 커밋하지 않은 초안의 `§N`은 해석할 수 없다. 대비되는 예: "escapes per RFC 9110 §10.1.5"는 남긴다. 외부 표준은 설계상 저장소 바깥에서 해석되며, 자기 문서의 절 번호를 직접 관리하는 커밋된 문서는 절 번호로 인용해도 된다.

### 계획 단계 라벨

**누설:** "`src/client/` is the shell (T4); the P-I migration owns the adapters."

**수정:** "`src/client/` is the shell; the adapters live in `src/client/adapters/`."

단계 라벨은 끝내 완료되지 않은 계획을 가리킨다. 라벨을 그 단계가 만들어 낸 결과로 바꾼다.

## 스택과 PR 관점

### 설명 문서에 들어간 스택 위치

**누설:** "A future remote backend implements this interface (the sandbox backend is a later PR in this stack)."

**수정:** "A remote backend can implement this interface without changing the render layer."

지속되는 설명 문서는 스택을 볼 수 없다. 확장 지점의 계약은 남긴다. 아직 하지 않은 작업의 자리는 그 PR 자체, `TODO`, 또는 이슈가 맡는다.

### README의 "This PR"

**누설:** "This PR adds cursor-based pagination to the session list."

**수정:** "The session list paginates by cursor."

README는 어떤 PR보다 오래 남는다. 메커니즘을 현재의 사실로 적는다.

## 변경 서술과 버전 표지

### PR 번호가 붙은 무용담

**누설:** "Colors used to come from `--widget-*` tokens, which nothing defined, so it always rendered the fallbacks; the alias tokens fixed that (PR #88)."

**수정:** "Colors come from the alias tokens; an undefined token renders the fallbacks."

살아 있는 두 사실, 즉 현재의 메커니즘과 정의되지 않은 토큰의 상시적인 동작을 현재 시제로 다시 쓴다. 버그의 연대기는 PR과 Agent Note에 속한다.

### 제거에 대한 서술

**누설:** "The `probe` field is gone with the removal cut; badges ride the generic projection pair now."

**수정:** "Badges use the generic projection pair."

`probe`를 모르는 독자는 그 필드가 없어졌다는 사실에서 아무것도 배우지 못한다. 삭제된 과거와 대비되는 "now"는 버전 표지다.

### 고쳐진 회귀 → 반사실적 현재

**누설:** "This used to double-encode multibyte labels."

**수정:** "Without the byte-length guard, multibyte labels double-encode."

회귀 고정 테스트는 가드의 이름을 밝히는 현재 시제의 반사실적 문장으로 남긴다. "used to"는 그 문장을 저장소의 과거 기록에 묶어 버린다.

### 지시적 버전 표지

**누설:** "Batch rendering is synchronous this cut; the async path is roadmap work."

**수정:** "Batch rendering is synchronous." (미뤄진 작업은 호출 지점의 `TODO(widget-batch):`에 둔다.)

"this cut", "v1", "today"는 병합되는 순간 낡는다. Agent Note의 변경 서술 절에 있는 역사적 단계 이름("the first cut shipped X")은 현재 상태를 해치지 않는다. 지시적 표현은 어떤 경우에도 안전하지 않다.

## 리뷰 진행 과정

### 산문으로 쓴 리뷰 판정

**누설:** "Rejected in review: caching the resolved spec. We keep resolution per-call."

**수정** (Agent Note의 Alternatives considered 절): "**Caching the resolved spec.** Rejected: the spec depends on per-call cwd, so a cache keyed by request would serve stale roots."

대안 검토(alternatives considered) 장르가 이런 내용의 정식 자리다. 리뷰어와 라운드는 근거의 일부가 아니다.

### 초안 순번

**누설:** "As of v5 of this note, the loader also validates manifests."

**수정:** "The loader validates manifests."

구현된 노트는 실제로 출하된 현실을 적는다. 노트의 수정 이력은 git에 있다.

## 리뷰어를 향한 정당화

### 캐스트 정당화

**누설:** "The cast is safe — the SDK constructed the object, it simply doesn't declare the optionals strictly enough."

**수정:** "The SDK constructs this object with every optional populated; the declared type is looser than the runtime guarantee."

유지보수자가 깨뜨리면 안 되는 불변식을 적는다. "It simply…"는 HEAD에서 아무도 제기하지 않은 이의에 답하는 목소리다. 불변식이 코드에서 이미 보인다면 주석을 삭제한다.

### 리뷰 권위에 호소

**누설:** "This is correct because the reviewer confirmed the wrapping order."

**수정:** (삭제. 래핑 순서는 함수의 `@returns`에 적혀 있다.)

정확성 주장은 불변식이나 테스트로 뒷받침한다. 사람으로 뒷받침하지 않는다.

## 재진술과 도출

### 제어 흐름 서술

**누설:** "First we normalize the label, then we truncate it, then we wrap it."

**수정:** (삭제.)

주석 아래의 세 줄이 같은 내용을 코드로 말하고 있다.

### 테스트 워크스루

**누설:** "This test creates a session, sends two messages, waits for the second reply, and then asserts the log has four entries."

**수정:** "Two round-trips must produce exactly four log entries — the projection dedupes the shared prefix."

자명하지 않은 assertion의 근거만 남긴다. 워크스루는 테스트 본문을 되풀이할 뿐이다.

## 단서와 계획 잔여물

### 표시 없는 보류

**누설:** "Probably fine to render eagerly for now."

**수정:** (삭제. 보류는 이미 `TODO(widget-batch):` 표지를 갖고 있다.)

소유자가 없는 단서는 계획의 잔여물이다. 표지가 없다면 `TODO(name): coalesce per animation frame` 같은 표지를 새로 달고, 단서는 남기지 않는다.

### 모호한 크기 표현

**누설:** "A 64 KiB buffer should be enough for most cases."

**수정:** "64 KiB holds the largest observed frame (48 KiB) with headroom; a larger frame fails loudly in `decode`."

단서를 실제 상한과 초과 시의 실패 동작으로 바꾼다.

## 작성 언어 실수

**누설:** "The renderer runs on the client 端; see the 设计稿 for spacing. ---- 私有 ----"

**수정:** "The renderer runs on the client side; spacing follows the Figma frame `widget-badges`."

작업 중 쓰던 언어의 조각과 세션 구분선은 전사 과정에서 남은 잔여물이다. Figma 프레임 이름은 남긴다. 저장소 바깥에서 해석되도록 설계된 외부 출처이기 때문이다.

### 쌍을 이루는 fence 안의 작성 언어 실수

**두 파일 모두에서 누설:** 그대로 옮기지 않은 코드 블록 안의 `// 更新这里 before returning`

**두 파일 모두에서 수정:** `// Update this before returning.`

블록을 한 번 고치고, 그 바이트 단위로 같은 fence를 두 언어 파일에 복사한다. 중국어 쪽 파일에서 주석을 다르게 번역하면, 각각 자연스러워 보여도 쌍을 이루는 계약이 깨진다.

## 동작에 영향을 주는 후보

**의심:** 내보낸 JSDoc 문장에 "available for now"라고 적혀 있고, 생성기가 그 문장을 모델이 보는 카탈로그에 복사한다.

**잘못:** 문장 정리만 하는 작업에서 원본 문장만 고치거나, 생성된 카탈로그만 손으로 고친다.

**올바름:** 원본에서 생성되는 파생 경로를 추적하고, 소유자를 고치고, 모든 파생물을 다시 생성하고, 소유 실행 스냅샷을 갱신한다. GUI 문자열이라면 저장소가 요구하는 동작 증거를 포함한다. 승인된 범위에 소유 시나리오가 없다면 문구는 그대로 두고 보류를 보고한다.

## 유지 항목

### 이슈 참조는 모든 표면에서 지속된다

**유지:** "The cap applies to the complete rendered value, wrappers included (issue #1470 owns the follow-up)."

보조 없이 한 번 훑는 검토에서 이 문장을 삭제했다. 이슈 인용은 Agent Note에만 속한다고 판단했기 때문이다. 이는 잘못된 방향이다. 이슈는 어떤 표면에서든 HEAD에서 해석되며, README에서 보류된 작업의 정식 자리는 "#N owns the follow-up"이다. Agent Note와 사후 분석은 병합된 PR을 증거로 인용하는 것도 허용한다.

### 죽은 이름 언급은 "소유자를 밝힌 것"이 아니다

**삭제:** "Badge renderer over the widget seam (see the widget-rendering RFC)."

보조 없이 한 번 훑는 검토에서는 이 문장을 "주제로 소유 문서를 밝힌 것"이라며 남겼다. 판단 기준은 형식이 아니라 해석 가능성이다. 커밋된 파일 중 "the widget-rendering RFC"에 답하는 파일이 없으므로 이 포인터는 죽었다. 커밋된 소유자가 있다면 그쪽으로 다시 연결하고, 없다면 삭제한다.

### 억제(suppression)의 정당화

**유지 (수정 후):** `// oxlint-disable-next-line no-non-null-assertion -- the one-element literal guarantees index 0.`

정당화 절은 필수 산문이다. 적힌 이유가 거짓이라면(원문은 "the loop guard above proves a frame exists"라고 썼지만 위에 루프가 없었다) 이유를 고친다. 절을 삭제하지 않는다.

### 측정된 상한

**유지:** "Depth cap (measured: 512 nests ≈ 0.15s synchronous; 4096 blocks the loop)."

측정값은 근거 없이 상수를 바꾸는 일을 막는다. "measured"는 이 수치가 추측이 아니라 데이터임을 표시한다.

### 런타임의 old/new는 변경 이력이 아니다

**유지:** "The old connection drains before the new one accepts."

여기서 "old"와 "new"는 교체 중에 함께 살아 있는 두 런타임 객체를 가리키며, 저장소의 상태를 가리키지 않는다. 변경 서술 금지는 저장소 이력에 대한 것이지 생명주기 어휘에 대한 것이 아니다.

### 런타임의 자연스러운 시간은 버전 표지가 아니다

**유지:** "What is today's date?"

프롬프트는 런타임 시계를 묻는다. "today"는 저장소 상태들을 대비하지 않는다. 이 텍스트는 모델에 전달되므로, 어떤 재작성이든 여전히 소유 동작 증거가 필요하다.

## 과교정 함정

아래 함정은 모두 원래의 정리 작업에서 실제로 나왔고, 리뷰에서 잡혔다. 문단을 줄이기 전에 그 문단이 담은 명제를 모두 나열한다.

### 의무를 찬성으로 뒤집기

**원문:** "These direct registrations are exceptions pending migration to slots."

**과교정:** "These direct registrations are sanctioned exceptions."

**올바름:** "These direct registrations are exceptions pending migration to slots."

"pending migration"은 의무이고, "sanctioned"는 현재 상태를 승인한다. 문장을 줄이는 과정에서 문장의 양상(modality)이 뒤집혔다.

### 가정을 출하된 기능으로 승격하기

**원문:** "A future IPC-based shell subclasses the executor and overrides `spawn`."

**과교정:** "An IPC-based shell subclasses the executor and overrides `spawn`."

**올바름:** "A hypothetical IPC-based shell — no such shell exists — would subclass the executor and override `spawn`."

미래 표지만 지우면 설계 예시가 그 클래스가 출하된다는 주장으로 바뀐다. 미래 표지를 지우는 대신 가정임을 명시적으로 표시한다.

### 참인 사실을 그 옆의 서술과 함께 지우기

**원문:** "The gate notice narrates the check order; the notice text is also what `verify-doc-typecheck` compiles against."

**과교정:** "…" (문장 전체를 서술로 보고 삭제함.)

**올바름:** "The notice text is what `verify-doc-typecheck` compiles against."

문장의 절반은 서술이었고, 나머지 절반은 무게를 지니는 결합 관계였다. 명제들이 한 줄을 공유한다면 문장이 아니라 절 단위로 지운다.

### 숫자는 남기고 측정의 출처를 빼기

**원문:** "The 4 MiB ceiling is measured: the largest generated `py-types` module is 3.1 MiB."

**과교정:** "The ceiling is 4 MiB; the largest generated `py-types` module is 3.1 MiB."

**올바름:** "measured"를 유지한다.

"measured"가 없으면 3.1 MiB는 관찰값이 아니라 정의처럼 읽힌다. 그러면 상한을 올리기 전에 아무도 다시 측정하지 않게 된다.
