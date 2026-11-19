# project-maintenance — 저장소에서 정기적으로 챙길 점검 세 가지 {#overview}

`project-maintenance`는 저장소 전체에서 "어느 정도 주기로" 해야 할 점검을 모아 놓고, 에이전트가 항목마다 명령을 실행해 vendored 의존성, web 표준 dataset, 문서 일관성을 확인하게 하는 스킬이다.[](source:pm-head)

- 쓰는 때: 정기 점검이다. 얼마나 자주 하는지는 원문에 "some regularity"라고만 있고 주기는 명시 없음.[](source:pm-head)
- 결과: 점검 결과로 vendored 파일 갱신, dataset 갱신, 문서 감사 보고가 나온다. 이 스킬 자체가 쓰는 파일은 없다.[](source:pm-vendor)[](source:pm-data)[](source:pm-doc)
- 다른 스킬과의 관계: 문서 점검 항목에서 `coherence-auditor`의 script를 실행하라고 한다(다음 안내).[](source:pm-doc)
- 하지 않는 것: 사용자 확인이나 종료 조건은 원문에 명시 없음. 항목 순서도 정하지 않았다.[](source:pm-head)

@answer scope="modern-web-guidance-src/project-maintenance · 원본 파일 1개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source pm-front title="이름과 description" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=1:4
@source pm-head title="정기 점검 머리말" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=6:8
@source pm-vendor title="vendored 의존성 점검" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=10:15
@source pm-data title="web 표준과 호환성 dataset" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=17:19
@source pm-doc title="문서 일관성과 링크 점검" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=21:24
@source ca-front title="coherence-auditor 이름과 description" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=1:4
@source pf-gen title="project-features의 generate-feature-to-groups 안내" path=modern-web-guidance-src/project-features/SKILL.md lines=72:72

## 어떻게 동작하나 {#flow span=12}

원문은 점검 항목 세 개를 나열할 뿐 순서나 선후를 정하지 않는다. 그래서 순서를 그리지 않고 항목마다 한 행으로 적는다.

| 적용 상황 | 참조 파일 | 바뀌는 판단 | 출력 사례 |
| --- | --- | --- | --- |
| Vendored Dependencies. 에이전트가 upstream 패키지에 새 release가 있는지 본다 | `src/cli/telemetry/detect-agent.ts` | upstream 버전과 vendored 버전이 다르면 변경을 sync하고 버전 주석을 올린다 | `npm info @vercel/detect-agent version`과 `grep` 결과를 비교하고, 갱신했으면 `node --test src/cli/telemetry/detect-agent.test.ts src/cli/telemetry/clearcut-logger.test.ts`를 돌린다[](source:pm-vendor) |
| Web Standards & Compatibility Datasets. `web-features`는 자동 갱신이 기본이고 에이전트는 필요할 때 손으로 돌린다 | `.github/workflows/update-web-features.yml`, `src/ci/generate-feature-to-groups.ts`, `src/ci/validate-after-web-feature-update.ts` | workflow가 월요일과 목요일에 자동으로 돌므로, 수동 실행은 `pnpm update web-features` 뒤에 두 `src/ci` script를 잇는다 | `pnpm update web-features`와 두 script 실행 결과[](source:pm-data) |
| Web Standards & Compatibility Datasets. 호환성 패키지는 주기적으로 올린다 | `package.json`은 원문에 명시 없음 | `@mdn/browser-compat-data`, `@webref/css`, `@webref/elements`, `@webref/idl`, `caniuse-lite`, `mdn-data`를 "periodically" 올린다 | 올릴 패키지 이름 여섯 개. 주기와 명령은 원문에 명시 없음[](source:pm-data) |
| Document Coherence & Link Integrity. 문서와 링크가 맞는지 본다 | `.agents/skills/coherence-auditor/scripts/coherence-audit.ts` | script를 그대로 실행한다. 사용자 개입은 원문에 명시 없음 | `node .agents/skills/coherence-auditor/scripts/coherence-audit.ts` 출력[](source:pm-doc) |

위 파일 중 `src/`, `.github/`, `package.json`은 이 컬렉션에 없어 지시상 동작으로만 적는다. 명령은 분석 중 실행하지 않았다.

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령은 원문에 명시 없음. 모델이 description을 보고 켠다. 호출 제한 필드는 없다[](source:pm-front) |
| 성격 | 정기 점검 항목을 모아 둔 안내이고, 항목마다 에이전트가 실행할 명령이 딸려 있다 |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#r29} | `coherence-auditor` | 다음 안내 | "Document Coherence & Link Integrity" 항목에서 감사 script를 실행하라고 한다. 얼마나 자주인지와 사용자 개입은 원문에 명시 없음. 이 스킬이 감사 보고를 받아 처리하는 절차도 쓰지 않았다.[](source:pm-doc)[](source:ca-front) |
| **이 스킬** {#r33} | `project-features` | 대안 | 둘 다 web-features를 갱신한 뒤 `src/ci/generate-feature-to-groups.ts`를 실행하라고 한다. 한쪽이 다른 쪽을 지시하는 문장은 없다(판정: 같은 계열의 추론).[](source:pm-data)[](source:pf-gen) |
| `coherence-auditor` {#r31} | **이 스킬** | 참고 | 원장 R31은 `coherence-auditor`가 `project-*` 접두어 스킬 8개를 읽는 관계다. 이름이 `project-maintenance`인 이 스킬도 그중 하나다. 접두어가 맞는 폴더로 풀었다(판정).[](source:pm-front)[](source:ca-front) |

@architecture id=relation-map title="project-maintenance와 이어지는 스킬"
| ca | coherence-auditor | backend |
| pf | project-features | backend |
| self | project-maintenance(이 스킬) | backend |
| self > ca | 다음 안내 |
| ca > self | 참고 |
| self > pf | 대안 | dashed |

@code source=pm-front language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 점검 항목 세 개와 명령을 담은 유일한 파일이다 | 스킬이 켜질 때 읽는다 | Vendored Dependencies, Web Standards & Compatibility Datasets, Document Coherence & Link Integrity |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| upstream의 `@vercel/detect-agent`가 vendored 버전보다 새롭다 | `src/cli/telemetry/detect-agent.ts`에 변경을 sync하고 버전 주석을 올린 뒤 두 테스트 파일을 `node --test`로 돌린다 | [](source:pm-vendor) |
| `web-features`를 손으로 갱신한다 | `pnpm update web-features` 다음에 `generate-feature-to-groups.ts`와 `validate-after-web-feature-update.ts`를 실행한다 | [](source:pm-data) |
| 점검을 언제, 얼마나 자주 하나 | 원문에 명시 없음. "some regularity"가 전부다 | [](source:pm-head) |
| 사람 승인이나 중단 조건 | 원문에 명시 없음 | [](source:pm-head) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 없음. 원문이 24줄이고 개요에 항목 세 개와 명령을 모두 담았다.

@callout level=open-question title="확인하지 못한 것"
| 본문이 가리키는 `src/`, `.github/workflows/`와 패키지 목록은 이 컬렉션에 없어 동작을 확인하지 못했다. 명령은 모두 지시상 동작으로만 읽었다.[](source:pm-vendor)[](source:pm-data) |

읽은 원본: 텍스트 파일 1개. 제외: 없음.
