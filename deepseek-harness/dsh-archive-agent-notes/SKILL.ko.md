---
name: dsh-archive-agent-notes
description: deepseek-harness에서 Agent Notes를 추가, 감사, 정리, 보관, 복원, 리뷰할 때 사용한다. 새 노트마다 대체된 active 기록이 있는지 확인하고, 작은 UI 변경이나 순수 기계적 변경의 기록은 삭제하며, 나머지 구현된 노트는 향후 결정 가치로 분류한다. 더 이상 솔깃한 오류를 막지 못하는 거부된 노트는 삭제하고, 고정된 archived/{kind} 세트와 manifest 규칙을 적용한다.
---

# DeepSeek Harness Agent Notes 보관

이력 중 아직 작업을 안내할 수 있는 부분은 지우지 않으면서, active 결정 코퍼스를 줄인다. 모든 노트를 의미 기준으로 판단한다. 단어 수와 나이는 찾기 위한 보조 지표일 뿐, 보관 기준이 아니다.

## 계약을 읽는다

분류하기 전에 [Agent Note 규칙](../../notes/README.md), [보관 지침](../../notes/archived/AGENTS.md), 그리고 해당되는 active 생명주기 지침을 읽는다. 현재 코드, 설정, 패키지 문서, 생성된 catalog, 더 새로운 Agent Notes, inbound 링크를 사용해 근거가 아직 무언가를 소유하거나 제약하는지 확인한다.

## 노트를 추가할 때 대체 여부를 확인한다

초안을 쓰기 전에 [작성 기준](../../notes/README.md#when-to-write-one)을 적용한다. 새 Agent Note마다, 같은 결정, 메커니즘, 거부된 대안을 다루는 active 노트를 범위를 정해 감사한다. 완전 또는 부분 대체를 새 노트를 쓰는 동안 각각 분류한다. 자격을 갖춘 구현된 triplet은 같은 PR에서 보관하고, 부분 대체나 독립적으로 유용한 근거는 유지하며 상호 링크를 건다. obsolete 제안은 거부하고, 더 이상 그럴듯한 실수를 막지 못하는 거부된 노트는 삭제한다. 새 owner가 고유한 명제를 모두 흡수하면 Agent Note 통합 규칙을 적용한다. 알고 있는 중복을 나중의 코퍼스 감사로 미루지 않는다.

## 향후 가치로 분류한다

생명주기별 결과는 다음과 같다.

- **구현됨 — 삭제:** 작은 UI 조정이나 순수 기계적 변경만 설명하는 완전한 triplet은 삭제하고, inbound 링크를 고치거나 제거한다. 지역 버그 수정, 성능 변경, 새 기능, 실질적인 동작이나 소유권 결정은 구현되었다는 이유만으로 이 기준에 해당하지 않는다. 이 기준은 keep/archive 분류보다 먼저 적용한다.
- **구현됨 — active 유지:** 근거, 대안, 부정적 보장, durable/wire 의미, 소유권 경계, 보안 규칙, 재도입 조건이 향후 변경을 안내할 가능성이 있으면 노트를 유지한다. 결정을 분류하며, 구현의 기계적 세부사항으로 판단하지 않는다. 기계적 rename이나 타입 추출도 지속적인 이름, 호환성, 소유권 규칙을 기록할 수 있다. 길이는 기준이 아니다.
- **구현됨 — 보관:** 실질적인 과거 결정이 완전하고 향후 작업을 안내할 가능성은 낮지만, 역사적 근거는 보존할 가치가 있으면 보관한다. 직접 삭제 기준에 해당하는 기록은 보관하지 않는다.
- **제안됨 — 보관하지 않음:** 살아 있는 제안은 active로 둔다. 더 이상 추진할 가치가 없으면 정직한 이유와 함께 거부하고, 거부된 생명주기 형식을 만족시킨다.
- **거부됨 — 가드레일로만 유지:** 버려진 제안이 여전히 솔깃하고 의미 있는 실수로 남아 있고, 노트가 왜 그 제안이 지는지 설명할 때만 거부 기록을 유지한다.
- **거부됨 — 삭제:** 거부된 아이디어가 obsolete, 대체됨, 더 이상 그럴듯하지 않음, 재논쟁을 막을 가능성이 낮을 때 triplet 전체를 삭제한다. inbound 링크는 고치거나 삭제한다.

할당량을 채우려고 보관하지 않는다. 범위 안의 모든 노트를 검토하고, 비슷한 묶음은 하나의 원칙으로 분류하며, 애매한 경우는 최선의 판단을 쓰고, 정말 경계선에 있는 결정은 인계 사항에 기록한다.

## 보정된 예시

아래 예시가 기준을 정한다. 단어 수는 크기가 테스트가 아님을 보여 준다.

구현된 노트 중 삭제 대상:

- collapsed sidebar control rail — 533 words: 닫혀 있고 사소한 UI 동작;
- issue-policy module ownership — 함수 재배치와 import 재작성이 끝났고 동작은 바뀌지 않음.

구현된 노트 중 유지 대상:

- event-sourced sessions — 248 words: 기초가 되는 권한과 durability 경계;
- single Harness-home resolver — 596 words: 여러 제품에 걸친 소유권 규칙;
- project session directories — 628 words: 지속적인 저장과 식별 정책;
- parallel pre-push gates — 400 words: 경계선에 있지만 gate 스케줄링과 리소스 튜닝을 여전히 안내함;
- dropped image content block — 334 words: 멀티모달 지원이 들어올 때까지 유지함. 조정된 재도입 조건을 명시하기 때문이다.

거부된 노트:

- keep folding the compaction package split — 426 words: 패키지를 합치려는 유혹이 여전히 의미 있음;
- delete streaming workflow progress through tool calls — 972 words: ACP/UI 전제가 obsolete함;
- delete dropping ACP terminal metadata — 362 words: 이후의 automation-only ACP 결정이 질문을 해결함.

## 구현된 triplet 하나를 보관한다

1. 완전한 `foo.md`, `foo.zh.md`, `foo.i18n.yaml` triplet을 `implemented/<kind>/`에서 `archived/<kind>/`로 옮긴다. 보관 경로에는 `implemented`가 의도적으로 없다.
2. 본문은 수정하지 않는다. 두 언어 파일 모두에서 `Status: implemented` 바로 아래에 `Archived: YYYY-MM-DD`만 넣는다. 보관 날짜를 쓰고, 양쪽의 값은 같게 한다.
3. 메타데이터만 바뀐 두 파일의 sidecar 해시를 기계적으로 다시 기록한다. 노트를 번역하거나, 형식을 바꾸거나, 사실을 갱신하거나, 노트 안의 링크를 고치지 않는다. 제목 구두점, 빈 줄 배치, 언어 전환 문구는 보존하며, 보관의 전제 조건이 아니다.
4. active 산문에서 오는 inbound 링크를 찾는다. 현재 authority로 다시 연결하거나, 과거 스냅샷을 의도적으로 인용하는 경우에만 보관 경로로 다시 연결하거나, 삭제한다. 보관된 노트에서 나가는 링크를 검증하거나 고치지 않는다.
5. `pnpm run verify-archived-agent-notes --write`를 실행한다. append-only 모드는 먼저 기존 seal이 모두 맞는지 증명한 뒤, 새 triplet의 해시만 추가한다. 그 뒤 일반 verifier를 실행한다.

triplet이 seal된 뒤에는 편집, 이동, 번역, 형식 변경, 삭제를 하지 않는다. 보관된 노트는 inbound 링크의 유효한 대상으로 남지만, 과거 스냅샷이며 현재 동작의 authority가 아니다.

## 검증과 보고

archive verifier의 집중 테스트, `pnpm run verify-archived-agent-notes`, `pnpm run doc-sync`, `pnpm run lint`, `git diff --check`를 실행한다. 추가 증거가 필요하면 [dsh-pre-push-checks](../dsh-pre-push-checks/SKILL.md)로 선택한다.

보고에는 유지한 active 구현 노트, 삭제하거나 보관한 구현 노트, 유지하거나 삭제한 거부 노트, 거부한 제안된 노트(있다면), 그리고 단어 수와 선택한 결과를 포함한 모든 경계선 사례를 적는다. 보관된 노트의 outbound 링크가 유효하다고 주장하지 않는다. archive verifier는 의도적으로 그 링크를 검사하지 않는다.
