---
name: dsh-trim-cot-leakage
description: 누출된 추론 기록처럼 읽히는 문장을 감사하거나 고칠 때 사용한다. 예: 죽은 설계 세션 인용(decision N), audit 항목 코드, 미커밋 초안의 §N; "used to", "no longer", "this cut" 같은 변경 서술; "a later PR in this stack", "rejected in review" 같은 stack 또는 리뷰 관점; 리뷰어를 향한 정당화; 제어 흐름 서술; 주석, JSDoc, 문서, Agent Notes에 남은 추측성 계획 잔여물.
---

# Chain-of-Thought 누출 정리

Chain-of-thought 누출은 관점이 저장소가 아니라 작성 세션에 있는 문장이다. 그 세션에서만 보이던 자료를 인용하거나, 현재 상태 대신 변경 과정을 서술하거나, 이미 떠난 리뷰어와 논쟁한다. 문장에 사실 절이 들어 있으면 삭제만으로 고치지 않는다. 각 사실을 HEAD의 관점에서 다시 쓰고, 그 주변의 추론 기록을 지운다. 사실 절이 없는 문장(audit 코드, 제어 흐름 서술)은 바로 삭제한다. **필수 배경:** 이 skill이 적용하는 완전한 명제 규칙은 [dsh-prose-standard](../dsh-prose-standard/SKILL.md)가 소유한다. [보관된 committed-artifact-citations note](../../notes/archived/process/2026-08-09-committed-artifact-citations.md)는 인용 규칙의 역사적 근거를 기록한다. 이 문서는 기계적 스크립트가 아니라 지침이다.

## 하나의 기준

의심되는 문장마다 묻는다. **HEAD에서 세션 기록, PR 스레드, 미커밋 초안에 접근하지 못하는 독자가 모든 참조를 해석하고 모든 주장을 검증할 수 있는가?** 아니라면, 살아남는 사실을 저장소의 관점에서 다시 쓰고 나머지는 삭제한다. 그렇다면 역사적으로 들려도 누출이 아니다. 다만 해석 가능하다는 것은 이 skill의 기준만 통과한다는 뜻이다. 현재 상태를 다루는 표면(README, 문서, JSDoc)에서는 해석 가능한 변경 이야기도 여전히 변경 서술이며, 3번 분류가 그것을 정해진 자리로 보낸다.

## 분류

1. **죽은 설계 세션 인용** — `(decision 7)`, `(audit C2)`, `design §4.7`, `plan §1.4`, 단계 라벨(`T4`, `W3`, `P-I`), "the design ledger", "(B ruling)". 결정에 커밋된 소유자가 있으면 이름과 경로로 인용한다. 없으면 인용을 삭제하고, 사실 절을 독립적으로 읽히게 다시 쓴다.
2. **Stack과 PR 관점** — "a later PR in this stack", "this PR adds", "the previous commit". 배포된 메커니즘이나 확장 지점을 말한다. 나중으로 미룬 작업은 `TODO` 마커나 이슈 참조로 옮긴다.
3. **변경 서술과 버전 스탬프** — "used to", "no longer", "the old X", 그리고 지시적 스탬프("v1", "this cut", "today", 과거 상태와 대비되는 "now"). 현재 동작을 말한다. 고쳐진 회귀는 현재 시제의 반사실적 문장("without X, Y happens")으로 바꾸며, 저장소 이력("used to Y")으로 쓰지 않는다.
4. **리뷰 안무** — "Rejected in review:", "the reviewer confirmed", 초안 순서("v5 of this note"), 라운드 귀속. 살아남은 결정과 근거는 평이한 사실로 유지하고, 누가 언제 말했는지는 삭제한다.
5. **리뷰어를 향한 정당화** — "the cast is safe — it simply…", "this is correct because…". 자신의 정확성을 주장하는 주석은 유지보수자가 아니라 리뷰어에게 말하고 있다. 코드를 안전하게 만드는 불변식을 말하거나, 코드가 이미 보여 주면 주석을 삭제한다.
6. **재진술과 유도 기록** — 제어 흐름 서술("first we X, then we Y"), 테스트 walkthrough, 자명한 분기의 증명. 삭제하고, 명확하지 않은 계약이나 불변식만 남긴다.
7. **가정과 계획 잔여물** — "probably fine for now", "should be enough", 표식 없는 보류. `TODO`/`FIXME`로 올리거나 실제 한계를 말하는 문장으로 바꾸고, 가정은 삭제한다.
8. **작성 언어 누출** — 주된 언어가 영어인 문서에 섞인 작업 언어 조각(端, 设计稿, `---- 私有 ----` 구분선), 또는 zh 대응 문서에 섞인 반대 언어. 번역하거나 삭제한다.

## 누출이 아닌 것

인용 검토를 사람이 기억에 의존해 하면 두 방향으로 틀린다. 살아 있는 참조를 지우거나, 죽은 참조를 남긴다. 아래 보존 규칙은 그대로 적용한다. [예시](references/examples.md)가 각 규칙을 보정한다.

- **이슈 참조** — `#1470`, `TODO(name):`, "issue #N owns the follow-up"은 HEAD에서 해석된다. README를 포함한 모든 표면에서 유지한다. Agent Notes로 옮기지 않는다.
- **Agent Notes와 postmortem 안의 병합된 PR과 이슈 인용** — [문서 표준](../../../docs/AGENTS.md)의 change-story 라우팅에 따라 허용된 근거다.
- **억제 정당화** — `oxlint-disable … -- reason`, coverage-ignore 사유, 빈 catch 설명은 필수 문장이다. 거짓 사유는 고치되 삭제하지 않는다.
- **현재형 반사실 회귀 고정문** — "without X, Y happens", "a naive X would…".
- **측정 경계** — 상수를 보정하는 "(measured: 512 nests ≈ 0.15s)". 증거 단어 "measured"는 문장을 지탱하므로 유지한다.
- **런타임의 이전/새 상태** — "the old connection drains before the new one accepts"는 런타임 생명주기이지 변경 이력이 아니다.
- **note의 변경 이야기 섹션 안의 역사적 단계 이름** — "the first cut shipped X"는 그 자리에서는 현재 상태에 안전하다. 지시적 스탬프("this cut")는 어디서든 금지를 유지한다.
- **저장소 밖에서 해석되도록 설계된 외부 참조** — 표준의 절(RFC 9110 §10.1.5), Figma 프레임 이름. §-금지는 커밋되지 않은 내부 초안을 대상으로 하며, 외부 표준이나 자체 절 번호를 소유한 커밋된 문서는 대상이 아니다.
- **프로젝트 목소리와 문서 형식** — 프로젝트 목소리로서의 "we", note의 Alternatives-considered 절.

## 작업 절차

1. 범위와 제외 대상은 [dsh-prose-standard](../dsh-prose-standard/SKILL.md)를 따른다. 명시적 범위가 필요하며, `vendor/`와 `.agents/notes/archived/`는 건드리지 않는다. 기록된 fixture와 snapshot은 원본이 아니라 파생물이므로 정리 대상으로 보지 않는다. 승인된 동작 변경으로 새 증거가 필요할 때만 소유 원본이나 시나리오를 바꾸고 재생성한다.
2. 먼저 읽기 전용으로 감사한다. [recall batteries](references/recall-batteries.md)를 `--hidden`과 함께 실행해 `.agents/`도 검색되게 한다. 결과를 믿기 전에 각 probe를 알려진 양성 사례와 비슷한 음성 사례로 보정한다. 그다음 모든 결과를 의미 기준으로 판단한다. 배터리는 정의가 아니라 probe다. 원래 purge의 리뷰 라운드마다 배터리가 놓친 사례가 나왔으므로, 패턴 없이도 범위 안의 가장 밀도 높은 문장(module JSDoc, README, Agent Notes)을 직접 읽는다.
3. 표면별로 소유자부터 고친다. 생성된 catalog는 모든 소비자를 추적한 뒤 원본 JSDoc이나 generator 템플릿을 고치고, 모든 파생물을 다시 생성한다. 타입 동등성 fence는 원본 JSDoc을 고친 뒤 두 bilingual 페이지에 다시 붙여 넣는다(`verify-type-equiv`가 이를 고정한다). bilingual 문장은 대응 문서를 최소한으로 고치고, [가벼운 루틴](../../../docs/AGENTS.md#writing-rules)으로 다시 기록한다. bilingual fence는 고쳐진 원본 블록을 [dsh-doc](../dsh-doc/SKILL.md)에 따라 두 쪽에 바이트 단위로 똑같이 복사한 뒤, 그 쌍을 다시 기록한다. 모델이나 사용자에게 보이는 문자열은 [dsh-prose-standard](../dsh-prose-standard/SKILL.md)를 거쳐서, 소유 동작의 증거가 있을 때만 바꾼다. 없으면 그대로 두고 보류를 보고한다.
4. 아무것도 삭제하기 전에 문장의 명제를 나열하고(prose-standard), [과잉 수정 함정](references/examples.md#overcorrection-traps)을 확인한다. 함정은 의무를 승인으로 뒤집는 정리, 가정을 출시된 기능으로 승격하는 정리, 참인 사실을 지우는 정리, 증거의 출처를 빠뜨리는 정리다.
5. 검증한다. 배터리를 다시 실행해서 허용된 보존 항목, 이 skill 디렉터리 자체, 소유 note가 인용한 증거만 남는지 확인한다. 남은 모든 인용이 HEAD에서 해석되는지 확인한다. 수정한 표면에 맞는 gate를 실행한다(문서는 `doc-sync`, `verify-type-equiv`, `verify-translation-pairing`).
