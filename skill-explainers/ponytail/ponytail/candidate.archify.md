# ponytail은 새 코드를 줄이면서 어디까지 끝내게 하나? {#ponytail-page}

`ponytail`은 필요한 변경을 끝까지 마치면서 새 코드를 최소화한다. 호출자와 테스트까지 영향 범위를 먼저 잡으므로, 줄 수를 줄이려고 필요한 수정을 빼먹지 못하게 한다.[](source:scope)[](source:rules)

- 기존 코드, standard library, 설치된 dependency 순으로 재사용할 방법을 찾는다.[](source:choose)
- validation, 데이터 손실 방지, security, accessibility와 사용자 요구는 줄이지 못한다.[](source:limits)
- 세션 동안 유지되며 기본 수준은 `full`이다.[](source:mode)[](source:levels)

@answer scope="로컬 원본 분석 · 실제 코딩 수행 없음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=835ad00af6ccb24e5ab01bbe0a91f878f95cc417
@source full title="ponytail/ponytail/SKILL.md · 3548B · 원본" path=ponytail/ponytail/SKILL.md
@source front title="ponytail/ponytail/SKILL.md · 3548B · 원본" path=ponytail/ponytail/SKILL.md lines=1:11
@source scope title="ponytail/ponytail/SKILL.md · 3548B · 원본" path=ponytail/ponytail/SKILL.md lines=19:21
@source choose title="ponytail/ponytail/SKILL.md · 3548B · 원본" path=ponytail/ponytail/SKILL.md lines=23:32
@source rules title="ponytail/ponytail/SKILL.md · 3548B · 원본" path=ponytail/ponytail/SKILL.md lines=34:42
@source limits title="ponytail/ponytail/SKILL.md · 3548B · 원본" path=ponytail/ponytail/SKILL.md lines=44:44
@source mode title="ponytail/ponytail/SKILL.md · 3548B · 원본" path=ponytail/ponytail/SKILL.md lines=15:17
@source levels title="ponytail/ponytail/SKILL.md · 3548B · 원본" path=ponytail/ponytail/SKILL.md lines=46:52
@source help title="ponytail/ponytail-help/SKILL.md · 3264B · 원본" path=ponytail/ponytail-help/SKILL.md lines=27:41
@source debt title="ponytail/ponytail-debt/SKILL.md · 1813B · 원본" path=ponytail/ponytail-debt/SKILL.md lines=15:24
@source review-limit title="ponytail/ponytail-review/SKILL.md · 5244B · 원본" path=ponytail/ponytail-review/SKILL.md lines=63:64
@source audit-limit title="ponytail/ponytail-audit/SKILL.md · 5520B · 원본" path=ponytail/ponytail-audit/SKILL.md lines=63:64
@source lock title="ponytail/skills-lock.json · 1497B · 설치 출처" path=ponytail/skills-lock.json

## 언제 켜지고 언제 끝나나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻은 아니다. `disable-model-invocation` 필드는 이 원문에 명시되어 있지 않다.[](source:front)

@code source=front language=yaml

원문은 모든 코딩 작업에 사용하라고 한다. `ponytail`, `be lazy`, `simplest solution`, `yagni`와 과도한 설계에 대한 불만도 호출 맥락으로 든다.[](source:front)

| 수준·종료 | 에이전트의 행동 |
|---|---|
| `lite` | 요청한 것을 만든다. 더 작은 선택지를 한 줄로 제시하고 사용자가 고르게 한다.[](source:levels) |
| `full` | 최소한의 완전한 변경 규칙을 적용한다. 기본 수준이다.[](source:levels) |
| `ultra` | 만들기 전에 필요가 뒷받침하지 않는 요구를 짚고 반대 의견을 낸다.[](source:levels) |
| 변경·종료 | `/ponytail lite\|full\|ultra`로 수준을 바꾼다. `stop ponytail`, `normal mode`까지 세션에 유지된다. `ponytail-help`는 `/ponytail off`도 안내한다.[](source:mode)[](source:help) |

## 어떤 순서로 구현 방법을 고르나? {#decision}

에이전트는 먼저 호출자, 테스트, fixture, config, exports와 데이터 손실·노출 위험을 확인한다. 그 범위를 해결하는 첫 번째 선택지를 쓴다.[](source:scope)[](source:choose)

@steps
| need | 필요 확인 | 요청하지 않은 기능과 유연성을 빼고 무엇을 뺐는지 한 줄로 적는다.[](source:choose) |
| reuse | 기존 코드 | 저장소의 helper, component, service, 관례를 같은 방식으로 쓴다.[](source:choose) |
| native | standard library | 프로젝트 자체 구현이 있으면 그것을 우선한다.[](source:choose) |
| installed | 설치된 dependency | 몇 줄을 위해 새 dependency를 추가하지 않는다.[](source:choose) |
| short | 읽히는 한 줄 | 한눈에 이해할 수 있을 때만 한 줄로 쓴다.[](source:choose) |
| minimal | 최소 구현 | 앞선 선택지로 해결되지 않을 때 필요한 코드만 쓴다.[](source:choose) |

## 적게 쓰더라도 무엇을 지켜야 하나? {#boundaries}

| 조건 | 강제되는 행동 |
|---|---|
| 구현·수정 | 깨진 호출자, 테스트, fixture까지 마친다. 기존 layer와 interface를 유지한다.[](source:rules) |
| bug fix | 수정 전에 모든 호출자를 검색하고 공유 코드에서 원인을 한 번 고친다.[](source:rules) |
| 이동·병합 | error handling과 validation을 보존한다. 크기가 같으면 edge case에 맞는 쪽을 고른다.[](source:rules) |
| 새 로직 | branch, loop, parser, 돈·security, 새 script·app에는 작은 테스트 1개 또는 assert 기반 self-check를 남긴다. 사소한 변경은 제외한다.[](source:rules) |
| 주석 | 코드가 보여 주지 못하는 이유만 한 줄로 쓴다. 한계가 있는 지름길에는 `shortcut: <the limit>, <when to upgrade>`를 남긴다.[](source:rules) |
| 답변 | 마지막 1~2줄에 생략했거나 확인하지 않은 일과 사용자에게 필요한 위험을 적는다.[](source:mode) |

@callout level=warning title="줄일 수 없는 요구"
| 신뢰 경계의 validation, 데이터 손실을 막는 error handling, security, accessibility, 실제 hardware의 calibration과 사용자 요구는 생략하지 못한다.[](source:limits) |

판정 · 코드 길이만 줄이려는 작업에는 이 스킬의 제약도 함께 적용해야 한다. 설명용 예시로, 함수 signature를 바꿨다면 함수 본문이 짧아져도 호출자 수정이 끝나야 완료다.[](source:scope)[](source:rules)

## 다른 스킬과 어디에서 이어지나? {#position}

@workflow id=position-flow title="안내에서 구현과 선택적 집계로"
| before | ponytail-help | external | source:help |
| current | ponytail | backend | source:rules |
| after | ponytail-debt | backend | source:debt |
| before > current | 참고 R01 | emphasis |
| current > after | 호환 R06 | dashed |

@steps
| highlight | ponytail | 이 페이지의 스킬이다. 주석을 남기면 debt가 집계할 수 있다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R01 · 참고 | `ponytail-help`가 명령을 안내한다. 사용자가 호출하며 자동 실행하지 않는다.[](source:help) |
| R06 · 산출물 호환 | 한계와 재검토 조건을 적은 `shortcut:` 주석을 `ponytail-debt`가 읽을 수 있다. 필수 후속 단계는 아니다.[](source:rules)[](source:debt) |
| R07·R08 · 공유 상태 | `ponytail-review`와 audit도 이 주석을 읽는다. 예상 부하가 한계를 넘는지 판단한다. 전체 관계는 묶음에 남겼다.[](source:rules)[](source:review-limit)[](source:audit-limit) |

전체 흐름은 색인 기준 `_group-minimal-code/minimal-code.html`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `ponytail/ponytail/SKILL.md` 1개, 3,548B를 끝까지 읽었다.[](source:full) |
| 관계와 설치 출처 | 참조한 다른 스킬과 `skills-lock.json`을 포함해 텍스트 6개, 20,886B를 전부 읽었다. lock의 6개 항목을 확인했다.[](source:lock) |
| 제외 | 이 폴더의 `SKILL.ko.md`는 번역본이라 열지 않았다. 바이너리는 없다. |
| 부분 읽음 | 0개. 원자료가 없는 경우는 아래 미확인 항목에 따로 적었다. |

원본의 활성화 범위, 수준 3개, 종료 표현, 최소 테스트 조건과 생략 금지를 모두 대조했다. 외부 파일을 필수로 읽으라는 지시는 없다.

@callout level=open-question title="실행으로 확인하지 않은 부분"
| 호스트가 실제로 스킬을 활성화하거나 상태를 유지하는지는 실행으로 확인하지 않았다. |

분석 중 원본은 수정하지 않았다. 분석 전 사용자 승인으로 컬렉션 7개 파일을 commit했다. 새 분석 초안과 HTML, 관계 원장, 색인, 검증 보고서를 작성했다. 원문의 명령과 설치·설정 변경은 실행하지 않았다.
