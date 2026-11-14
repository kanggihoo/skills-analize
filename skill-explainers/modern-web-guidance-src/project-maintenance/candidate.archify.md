# project-maintenance는 무엇을 정기적으로 점검하라고 하나? {#project-maintenance-page}

`project-maintenance`는 저장소에서 "어느 정도 주기로" 해야 할 점검 3가지를 모아 둔 목록이다. vendored 의존성 `detect-agent` 갱신 확인, web 표준·호환성 dataset 갱신, 문서 일관성·링크 점검이다. 얼마나 자주 하는지, 누가 하는지, 언제 끝나는지는 원문에 명시되어 있지 않다.[](source:intro)[](source:vend)[](source:data)[](source:coh)

- vendored 코드는 upstream 버전과 비교해 오래됐으면 `src/cli/telemetry/detect-agent.ts`를 맞추고 테스트 2개를 돌린다.[](source:vend)
- `web-features`는 workflow가 월·목에 자동으로 갱신한다. 수동 갱신 뒤에는 CI 스크립트 2개를 더 돌린다.[](source:data)
- 문서 점검은 `coherence-auditor`의 스크립트를 돌린다.[](source:coh)

@answer scope="로컬 원본 분석 · 명령 실행 없음 · 원본 저장소의 src·workflow 파일 미확인"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source full title="modern-web-guidance-src/project-maintenance/SKILL.md · 1267B · 원본" path=modern-web-guidance-src/project-maintenance/SKILL.md
@source front title="modern-web-guidance-src/project-maintenance/SKILL.md · 1267B · 원본" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=1:4
@source intro title="modern-web-guidance-src/project-maintenance/SKILL.md · 1267B · 원본" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=8:8
@source vend title="modern-web-guidance-src/project-maintenance/SKILL.md · 1267B · 원본" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=10:15
@source vend-cmd title="modern-web-guidance-src/project-maintenance/SKILL.md · 1267B · 원본" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=13:13
@source data title="modern-web-guidance-src/project-maintenance/SKILL.md · 1267B · 원본" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=17:19
@source coh title="modern-web-guidance-src/project-maintenance/SKILL.md · 1267B · 원본" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=21:23
@source coh-cmd title="modern-web-guidance-src/project-maintenance/SKILL.md · 1267B · 원본" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=23:23
@source coh-skill title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · 원본(관계 확인용 일부)" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=25:25
@source coh-desc title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · 원본(관계 확인용 일부)" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=3:3
@source coh-glob title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · 원본(관계 확인용 일부)" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=34:34
@source feat-gen title="modern-web-guidance-src/project-features/SKILL.md · 16922B · 원본(관계 확인용 일부)" path=modern-web-guidance-src/project-features/SKILL.md lines=72:72
@source feat-tmp title="modern-web-guidance-src/project-features/SKILL.md · 16922B · 원본(관계 확인용 일부)" path=modern-web-guidance-src/project-features/SKILL.md lines=121:121
@source lock title="modern-web-guidance-src/skills-lock.json · 설치 출처" path=modern-web-guidance-src/skills-lock.json

## 언제 켜지고 무엇을 점검하나? {#items}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻은 아니다. `disable-model-invocation` 같은 호출 제한 필드는 원문에 명시되어 있지 않다.[](source:front)

@code source=front language=yaml

본문 머리말은 "Things that should happen with some regularity"라고만 쓴다. 호출 시점이나 주기를 정하는 문장은 없다.[](source:intro) 

판정 · 호출 조건이 따로 없으므로 이 스킬은 에이전트를 움직이는 절차라기보다 사람과 에이전트가 함께 참고하는 점검 목록이다.[](source:intro)[](source:front)

| 점검 항목 | 에이전트의 행동 | 확인 방법 |
|---|---|---|
| vendored 의존성 | upstream `@vercel/detect-agent` 최신 버전과 vendored 버전을 비교한다. 새 릴리스가 있으면 `src/cli/telemetry/detect-agent.ts`에 변경을 반영하고 버전 주석을 올린 뒤 `node --test src/cli/telemetry/detect-agent.test.ts src/cli/telemetry/clearcut-logger.test.ts`를 돌린다.[](source:vend) | vendored 버전은 파일 안의 `detect-agent@<버전>` 표기에서 `grep`으로 뽑는다.[](source:vend) |
| `web-features` | `.github/workflows/update-web-features.yml`이 월·목에 자동 갱신한다. 수동으로는 `pnpm update web-features`를 돌리고 이어서 `src/ci/generate-feature-to-groups.ts`와 `src/ci/validate-after-web-feature-update.ts`를 돌린다.[](source:data) | CI workflow와 두 스크립트 |
| compat·WebRef | `@mdn/browser-compat-data`, `@webref/css`, `@webref/elements`, `@webref/idl`, `caniuse-lite`, `mdn-data` 6개를 "periodically" 올린다. 주기 수치는 원문에 명시 없음.[](source:data) | 확인 명령 원문에 명시 없음 |
| 문서 일관성·링크 | `coherence-auditor`의 `coherence-audit.ts`를 실행한다.[](source:coh) | 스크립트 출력 |

원문이 보여 주는 명령 두 개다. 이 분석에서는 실행하지 않았다.

@code source=vend-cmd language=bash

@code source=coh-cmd language=bash

@callout level=warning title="분석에서 실행하지 않은 명령"
| 첫 명령은 `npm info`로 외부 registry를 조회한다. 이 분석에서는 어떤 명령도 실행하지 않았으므로 버전 비교와 테스트 결과는 확인하지 못했다.[](source:vend-cmd) |

## 다른 스킬과 어디에서 이어지나? {#position}

@workflow id=position-flow title="정기 점검에서 문서 감사로"
| current | project-maintenance | backend | source:intro |
| audit | coherence-auditor | backend | source:coh-desc |
| current > audit | R29 넘김 | emphasis |

@steps
| highlight | project-maintenance | 이 페이지의 스킬이다. 문서 점검 항목에서 coherence 스크립트를 실행하라고 안내한다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R29 · 넘김 | "Document Coherence & Link Integrity" 항목이 `node .agents/skills/coherence-auditor/scripts/coherence-audit.ts` 실행을 안내한다. 얼마나 자주인지와 사용자 개입은 원문에 명시 없음. 넘기는 것은 없고 감사 보고를 받는다.[](source:coh-cmd)[](source:coh-skill) |
| R31 · 참고(`coherence-auditor`가 이 스킬을 읽음) | `coherence-auditor`가 `.agents/skills/project-*/SKILL.md` glob으로 이 스킬을 포함한 `project-*` 스킬의 단계·역할·기술 요구가 모순되지 않는지 읽고 확인한다.[](source:coh-glob) |
| R33 · 같은 계열(`project-features`) | 둘 다 `web-features` 갱신 뒤 `src/ci/generate-feature-to-groups.ts`를 실행하라고 한다. 연결을 지시한 문장은 없다.[](source:data)[](source:feat-gen)[](source:feat-tmp) |

전체 흐름은 색인 기준 `_group-repo-upkeep/repo-upkeep.html`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `modern-web-guidance-src/project-maintenance/SKILL.md` 1개, 1,267B(24줄)를 끝까지 읽었다.[](source:full) |
| 관계 확인 | 관계 행 R29·R31·R33 3개를 이웃 파일의 인용 줄과 대조했다. 이웃 파일 2개는 해당 줄만 읽었다. |
| 설치 출처 | `skills-lock.json`의 항목을 확인했다. 원격 경로는 `.agents/skills/project-maintenance/SKILL.md`다.[](source:lock) |
| 제외 | 번역본은 이 컬렉션에 없다. 바이너리는 없다. 부분 읽음 파일은 이 스킬 기준 0개다. |

원문의 점검 항목 4개(`detect-agent`, `web-features`, compat·WebRef, 문서 점검), 명령 6개, 월·목 자동 갱신 수치를 모두 대조했다. 강제나 금지 문장, 종료 조건, 사람 승인은 원문에 명시되어 있지 않다.

@callout level=open-question title="확인하지 못한 부분"
| `.github/workflows/update-web-features.yml`, `src/ci/` 스크립트, `src/cli/telemetry/` 파일은 이 저장소에 없어 읽지 못했다. 파일 이름과 역할은 SKILL.md 서술만 옮겼다. |
| 호스트가 실제로 이 스킬을 활성화하는 조건은 실행으로 확인하지 않았다. |

분석 중 원본은 수정하지 않았다. 원문의 명령과 설치·설정 변경은 실행하지 않았다.
