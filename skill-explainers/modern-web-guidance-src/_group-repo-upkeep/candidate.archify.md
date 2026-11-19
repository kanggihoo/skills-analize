# repo-upkeep — 저장소 코드와 문서를 PR 전에 점검하고 정기 점검을 도는 일 {#repo-upkeep-page}

저장소를 건강하게 유지하는 일은 스킬 셋이 나눠 맡는다. `project-maintenance`는 정기 점검 항목을 모아 둔 안내이고, `coherence-auditor`는 문서·링크·git 상태를 서브에이전트로 감사하며, `project-coding-standards`는 PR 전에 지킬 코드 규칙과 preflight 통과 조건을 정한다.[](source:ru-pm)[](source:ru-ca)[](source:ru-cs)

- 서로 이어지는 선은 하나다. `project-maintenance`가 문서 점검 항목에서 `coherence-auditor`의 script를 실행하라고 안내한다. 얼마나 자주인지와 사용자 개입은 원문에 명시 없음.[](source:ru-pm-doc)
- `coherence-auditor`는 감사 서브에이전트를 필수 단계로 호출하고, 돌아온 보고를 메인 에이전트가 직접 고친다. 서브에이전트는 읽기 전용이다.[](source:ru-ca-spawn)[](source:ru-ca-sub)
- `project-coding-standards`는 이 묶음의 다른 스킬을 부르거나 가리키지 않는다. 같은 `pnpm run preflight`를 요구하는 것과 같은 명령을 쓴다는 점에서만 `coherence-auditor`와 겹친다(대안).[](source:ru-cs-pre)[](source:ru-ca-pre)
- 세 스킬 모두 원본 저장소의 `src/`, `docs/CONTEXT.md`, `.github/`를 전제한다. 이 컬렉션에 그 파일이 없어 동작은 지시상 동작으로만 적었다.

@answer scope="modern-web-guidance-src · 묶음 repo-upkeep · 스킬 3개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source ru-pm title="project-maintenance: 정기 점검 머리말" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=6:8
@source ru-pm-doc title="project-maintenance: 문서 일관성 점검 항목" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=21:24
@source ru-pm-data title="project-maintenance: web 표준 dataset 갱신" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=10:19
@source ru-ca title="coherence-auditor: 소개와 쓰는 때" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=1:8
@source ru-ca-spawn title="coherence-auditor: 서브에이전트 띄우기" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=10:26
@source ru-ca-sub title="coherence-auditor: 서브에이전트의 지시" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=42:49
@source ru-ca-after title="coherence-auditor: 보고 처리" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=51:54
@source ru-ca-pre title="coherence-auditor: preflight 옵션" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=37:40
@source ru-ca-ctx title="coherence-audit.ts: CONTEXT 대조 목록" path=modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts lines=71:76
@source ru-cs title="project-coding-standards: 개요" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=1:11
@source ru-cs-pre title="project-coding-standards: 단계별 preflight" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=79:100
@source ru-cs-list title="project-coding-standards: PR 전 점검표" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=108:118

## 점검은 누가 누구에게 맡기고 돌려받나 {#flow span=12}

`project-maintenance`의 문서 점검 항목이 `coherence-auditor`로 이어지고(R29), `coherence-auditor`가 서브에이전트에게 감사를 맡긴 뒤 보고를 받아 직접 고친다(R30). 아래 그림은 이 위임만 그린다. `project-coding-standards`는 이 위임과 연결이 없어 그림에 넣지 않았고, 관계는 아래 표에 있다.[](source:ru-pm-doc)[](source:ru-ca-spawn)[](source:ru-ca-after)

@sequence id=audit-delegate title="문서 감사의 위임"
| actor pm | project-maintenance | backend |
| actor main | coherence-auditor | backend |
| actor sub | 감사 서브에이전트 | backend |
| actor repo | 저장소 파일 | database |
| pm | main | 감사 script 실행 안내 R29 | emphasis |
| main | sub | define_subagent, invoke_subagent R30 | emphasis |
| sub | repo | script로 점검, 읽기만 | dashed |
| sub | main | 구조화된 감사 보고 | return |
| main | repo | 깨진 링크와 어긋난 파일 수정 |

@steps id=audit-steps
| au-pm | project-maintenance | 정기 점검 항목 세 가지(vendored 의존성, web 표준 dataset, 문서 일관성)를 모아 두고, 문서 항목에서 감사 script를 실행하라고 안내한다.[](source:ru-pm-data)[](source:ru-pm-doc) | audit-delegate | pm |
| au-ca | coherence-auditor | 감사 서브에이전트를 띄워 script와 의미 검토를 맡기고, 돌아온 보고로 깨진 링크를 직접 고친다.[](source:ru-ca-spawn)[](source:ru-ca-after) | audit-delegate | main |
| au-sub | document-coherence-auditor | script를 돌리고 `docs/CONTEXT.md`와 `project-*` 스킬이 서로 모순되지 않는지 읽고 보고한다. 저장소 파일은 고치지 않는다.[](source:ru-ca-sub) | audit-delegate | sub |
| au-cs | project-coding-standards | 코드를 쓰거나 PR을 준비할 때 구조 원칙과 코딩 규칙을 따르고, 모든 PR이 `pnpm run preflight`를 통과하게 한다. 위 위임과 연결이 없다.[](source:ru-cs)[](source:ru-cs-pre) | | |

## 파일과 명령은 누가 쓰고 누가 읽나 {#shared-state span=12}

| 파일·명령 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `.agents/skills/coherence-auditor/scripts/coherence-audit.ts` | 쓰는 스킬 없음 | `project-maintenance`가 실행하라고 안내하고, 서브에이전트가 실행한다[](source:ru-pm-doc)[](source:ru-ca-spawn) |
| 저장소의 markdown 문서와 링크 | `coherence-auditor`의 메인 에이전트(보고를 받은 뒤 깨진 링크를 고친다)[](source:ru-ca-after) | 서브에이전트(읽기 전용)[](source:ru-ca-sub) |
| `docs/CONTEXT.md`와 `.agents/skills/project-*/SKILL.md` | 쓰는 스킬 없음 | 서브에이전트가 읽어 대조한다. script는 `docs/CONTEXT.md`가 있을 때만 `project-*` 목록을 출력한다[](source:ru-ca-ctx) |
| `pnpm run preflight` | 쓰는 스킬 없음. 명령이다 | `coherence-auditor`(`--preflight`로 실행), `project-coding-standards`(모든 PR에 요구)[](source:ru-ca-pre)[](source:ru-cs-pre) |

## 그림에서 뺀 관계와 범위 밖 {#omitted span=12}

| rel-id | 관계 | 종류 | 언제 | 그림 |
| --- | --- | --- | --- | --- |
| R31 | `coherence-auditor` → `project-*` 스킬 8개 | 참고 | 서브에이전트가 `project-*` 스킬과 `docs/CONTEXT.md`의 단계·checkpoint·역할이 모순되지 않는지 읽어 확인한다. 8개는 접두어가 맞는 폴더로 풀었다(판정).[](source:ru-ca-sub)[](source:ru-ca-ctx) | 생략 |
| R27 | `coherence-auditor` ↔ `project-coding-standards` | 대안 | `--preflight`가 `pnpm run preflight`를 실행하고, `project-coding-standards`는 모든 PR에 그 통과를 요구한다. 연결을 지시한 문장은 없다(추론).[](source:ru-ca-pre)[](source:ru-cs-pre) | 생략 |
| R32 | `coherence-auditor` ↔ `project-guide-validation` | 대안 | 둘 다 `node --test src/authoring/guides-integrity.test.ts`를 실행한다. 이 묶음 밖 스킬과의 관계다(추론).[](source:ru-ca-spawn) | 생략 |
| R33 | `project-maintenance` ↔ `project-features` | 대안 | 둘 다 web-features 갱신 뒤 `src/ci/generate-feature-to-groups.ts`를 실행하라고 한다. 이 묶음 밖 스킬과의 관계다(추론).[](source:ru-pm-data) | 생략 |

## 어디까지 읽고 확인했나 {#audit span=12}

| 구분 | 확인 범위 |
| --- | --- |
| 읽은 원본 | 스킬 3개의 `SKILL.md`를 끝까지 읽었다. `coherence-audit.ts`는 검사 목록과 `--preflight` 부분을 대조했다 |
| 대조 | 원장 R27, R29~R33을 원문 줄과 맞춰 봤다 |
| 확인하지 못한 것 | `src/`, `docs/CONTEXT.md`, `.github/workflows/update-web-features.yml`은 이 컬렉션에 없다. `define_subagent`와 `invoke_subagent`의 구현도 확인하지 못했다. 명령은 모두 지시상 동작이고 실행하지 않았다 |

각 스킬의 내부 규칙은 스킬별 개요 페이지에 있다. 이동은 컬렉션 색인이 맡는다.
