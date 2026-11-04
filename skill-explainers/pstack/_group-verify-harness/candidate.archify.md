# 검증 도구 묶음(verify-harness)은 어떻게 이어지나 {#verify-harness-group}

이 묶음은 앱을 사용자처럼 직접 돌려 변경을 증명할 도구를 만들고 유지하는 스킬 세 개다. `create-verification-skill`이 대상 프로젝트에 검증 스킬을 만들고, `maintain-verification-skill`이 그 스킬을 앱에 맞게 고친다.[](source:cvs-intro)[](source:mvs-intro)

- 두 스킬은 같은 폴더 `.cursor/skills/verify-<app>/`를 쓰고 읽는다. 이 폴더는 pstack 저장소가 아니라 대상 프로젝트 저장소에 있다.[](source:cvs-generate)[](source:mvs-locate)
- 설정 마지막에 앱을 직접 돌릴 수단이 없으면, `setup-pstack`은 검증 스킬 만들기를 한 번만 제안한다. 사용자가 예라고 할 때만 실행한다.[](source:setup-offer)
- `create-verification-skill`은 끝에서 유지 스킬을 안내만 한다. 유지 주기는 사용자가 물을 때만 제안한다.[](source:cvs-maintain)
- `maintain-verification-skill`은 대상 검증 스킬이 없으면 멈추고 `create-verification-skill`을 가리킨다.[](source:mvs-locate)

@answer scope="pstack/verify-harness 묶음 · 스킬 3개와 poteto-help SKILL.md · 커밋 5760176 · 관계는 relations.md의 rel-id 기준"
@meta locale=ko
@source setup-fm title="pstack/setup-pstack/SKILL.md · 5548B · frontmatter" path=pstack/setup-pstack/SKILL.md lines=1:4
@source setup-offer title="pstack/setup-pstack/SKILL.md · Step 7 검증 스킬 제안" path=pstack/setup-pstack/SKILL.md lines=72:74
@source cvs-fm title="pstack/create-verification-skill/SKILL.md · 5879B · frontmatter" path=pstack/create-verification-skill/SKILL.md lines=1:5
@source cvs-intro title="pstack/create-verification-skill/SKILL.md · 목적" path=pstack/create-verification-skill/SKILL.md lines=9:9
@source cvs-interview title="pstack/create-verification-skill/SKILL.md · 1. 저장소 조사" path=pstack/create-verification-skill/SKILL.md lines=13:13
@source cvs-generate title="pstack/create-verification-skill/SKILL.md · 2. 스킬 생성" path=pstack/create-verification-skill/SKILL.md lines=25:25
@source cvs-map title="pstack/create-verification-skill/SKILL.md · 3. 기능 지도" path=pstack/create-verification-skill/SKILL.md lines=36:36
@source cvs-prove title="pstack/create-verification-skill/SKILL.md · 4. 생성한 스킬 증명" path=pstack/create-verification-skill/SKILL.md lines=40:40
@source cvs-maintain title="pstack/create-verification-skill/SKILL.md · 5. 유지 안내" path=pstack/create-verification-skill/SKILL.md lines=42:44
@source mvs-fm title="pstack/maintain-verification-skill/SKILL.md · 4922B · frontmatter" path=pstack/maintain-verification-skill/SKILL.md lines=1:5
@source mvs-intro title="pstack/maintain-verification-skill/SKILL.md · 목적" path=pstack/maintain-verification-skill/SKILL.md lines=9:9
@source mvs-scope title="pstack/maintain-verification-skill/SKILL.md · 수정 범위" path=pstack/maintain-verification-skill/SKILL.md lines=21:21
@source mvs-locate title="pstack/maintain-verification-skill/SKILL.md · 0. 대상 찾기" path=pstack/maintain-verification-skill/SKILL.md lines=25:25
@source mvs-index title="pstack/maintain-verification-skill/SKILL.md · 1. 색인 정리" path=pstack/maintain-verification-skill/SKILL.md lines=27:27
@source help-state title="pstack/poteto-help/SKILL.md · 12884B · 하네스 유무 확인" path=pstack/poteto-help/SKILL.md lines=28:28
@source help-table title="pstack/poteto-help/SKILL.md · 검증 스킬 표 행" path=pstack/poteto-help/SKILL.md lines=76:77

## 어떤 순서로 이어지나 {#flow span=12}

@workflow id=verify-flow title="verify-harness 묶음 흐름"
| setup | setup-pstack | backend |
| create | 검증 스킬 생성 | backend |
| maintain | 검증 스킬 유지 | backend |
| skill | verify 폴더 | database |
| setup > create | 수락 시 | dashed |
| create > skill | 생성 | emphasis |
| maintain > skill | 고침 | |

@steps id=verify-steps
| s-setup | setup-pstack | `setup-pstack`은 설정 마지막 단계에서 프로젝트에 앱을 직접 돌릴 수단이 있는지 본다. 없으면 한 번만 제안하고, 사용자 답이 예일 때만 실행한다. | verify-flow | setup |
| s-create | 검증 스킬 생성 | `create-verification-skill`이 저장소를 조사해 프로젝트 전용 검증 스킬과 기능 지도를 만든다. 넘기기 전에 생성한 스킬을 한 번 끝까지 돌려 증명한다. | verify-flow | create |
| s-maintain | 검증 스킬 유지 | `maintain-verification-skill`이 기능 지도의 기능마다 소스를 읽고 앱을 직접 돌려, 검증 스킬과 앱이 어긋난 곳을 고친다. | verify-flow | maintain |
| s-skill | verify 폴더 | `create-verification-skill`이 `.cursor/skills/verify-<app>/`에 만드는 `SKILL.md`와 `features/`다. 대상 프로젝트 저장소에 생긴다. | verify-flow | skill |

그림에 없는 안내가 두 가지 있다. `create-verification-skill`은 끝에서 사용자에게 유지 스킬을 안내한다(r80).[](source:cvs-maintain) `maintain-verification-skill`은 대상 검증 스킬을 찾지 못하면 멈추고 `create-verification-skill`을 가리킨다(r82).[](source:mvs-locate)

각 스킬의 내부 단계는 `pstack/create-verification-skill/create-verification-skill.html`, `pstack/maintain-verification-skill/maintain-verification-skill.html`에 있다.

## 관계와 조건 {#relations}

| rel-id | from → to | 종류 | 조건·강도·사용자 개입 | 그림 |
| --- | --- | --- | --- | --- |
| r37 | `setup-pstack` → `create-verification-skill` | 넘김 | 앱을 직접 돌릴 수단(`verify-*` 스킬이나 기존 하네스)이 없으면 한 번만 제안한다. 사용자 답이 예이면 실행하고, 아니면 밀어붙이지 않고 넘어간다(선택 단계)[](source:setup-offer) | 수락 시 간선 |
| r80 | `create-verification-skill` → `maintain-verification-skill` | 넘김 | 앱이 바뀔 때 기능 지도를 맞게 유지하려면 `maintain-verification-skill`을 쓰라고 사용자에게 안내한다. 주기는 사용자가 물을 때만 제안한다[](source:cvs-maintain) | 생략 |
| r81 | `create-verification-skill` → `maintain-verification-skill` | 공유 상태 | `create-verification-skill`이 쓰고 `maintain-verification-skill`이 찾아 고친다[](source:cvs-generate)[](source:cvs-map)[](source:mvs-locate) | 생성·고침 간선 |
| r82 | `maintain-verification-skill` → `create-verification-skill` | 넘김 | 대상 검증 스킬이 없으면 멈추고 `create-verification-skill`을 안내한다. 후보가 여럿이면 사용자에게 묻는다[](source:mvs-locate) | 생략 |
| r24 | `poteto-help` → `create-verification-skill` | 참고 | 프로젝트에 `verify-*` 스킬이 없고 질문이 "변경이 동작함을 증명"에 관한 것일 때만 언급한다[](source:help-state) | 생략 |

`poteto-help`의 상황별 표도 두 스킬을 각각 "앱을 직접 돌려 동작을 증명할 수단 만들기", "검증 스킬과 기능 지도를 앱에 다시 맞추기"로 안내한다.[](source:help-table)

## 공유 상태 {#shared-state}

| 파일 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `.cursor/skills/verify-<app>/SKILL.md` | `create-verification-skill`. 머리말(frontmatter)의 `name: verify-<app>`과 `description`이 없으면 스킬이 등록되지 않는다[](source:cvs-generate) | `maintain-verification-skill`이 찾아서 고친다(r81)[](source:mvs-locate)[](source:mvs-scope). `setup-pstack`과 `poteto-help`는 `verify-*` 스킬이 있는지만 본다(r37, r24)[](source:setup-offer)[](source:help-state) |
| `.cursor/skills/verify-<app>/features/` | `create-verification-skill`. `README.md` 색인과 기능별 파일을 처음 만든다[](source:cvs-map) | `maintain-verification-skill`이 색인과 기능 파일을 읽고 고친다(r81)[](source:mvs-index) |

이 상태는 대상 프로젝트 저장소에 있다. `maintain-verification-skill`은 이 폴더(검증 스킬의 `SKILL.md`, `features/`, 스킬이 가진 하네스 스크립트)만 고친다. 제품 코드는 고치지 않는다.[](source:mvs-scope) `maintain-verification-skill`은 `create-verification-skill`이 만들지 않은 검증 스킬이라도, 기능 지도만 있으면 대상으로 삼는다.[](source:mvs-intro)

## 언제 켜지나, 어디서 사람이 끼어드나 {#activation}

| 스킬 | 켜지는 방식 | 사람 개입 |
| --- | --- | --- |
| `setup-pstack` | `disable-model-invocation`이 없다. 사용자 말만으로 켜질 수 있다[](source:setup-fm) | 검증 스킬 제안에 예·아니오로 답한다[](source:setup-offer) |
| `create-verification-skill` | `disable-model-invocation: true`. 사용자가 입력하거나 `setup-pstack`이 부를 때[](source:cvs-fm)[](source:setup-offer) | 코드에서 관찰할 수 없는 것만 사용자에게 묻는다[](source:cvs-interview) |
| `maintain-verification-skill` | `disable-model-invocation: true`. 사용자가 입력할 때[](source:mvs-fm) | 대상 후보가 여럿이면 어느 것인지 묻는다[](source:mvs-locate) |

`maintain-verification-skill`을 부르는 다른 스킬은 원장에 없다. 판정: 이 스킬은 사용자가 직접 돌리는 주기 작업이다. `create-verification-skill`도 사용자에게 안내만 한다.[](source:cvs-maintain)[](source:mvs-fm)

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `pstack/setup-pstack/SKILL.md`, `pstack/create-verification-skill/SKILL.md`, `pstack/maintain-verification-skill/SKILL.md`, `pstack/poteto-help/SKILL.md`. 모두 원본이다.
- 읽지 않은 파일: `create-verification-skill/references/feature-map-example/`. 기능 지도의 예시이며 스킬 페이지가 다룬다.
- 제외한 파일: `*.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: r24, r37, r80~r82의 출처 줄을 원문과 대조했다. 종류와 조건이 원장과 같다.
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 스킬 문서가 지시하는 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
`setup-pstack`은 `/create-verification-skill`을 워크스페이스, 사용자, 플러그인 중 pstack을 설치한 위치에서 찾을 수 있다고 적는다. 셋 중 어느 것을 먼저 찾는지는 원문에 명시 없음.[](source:setup-offer)
`maintain-verification-skill`을 얼마나 자주 돌릴지는 원문에 명시 없음. `create-verification-skill`은 사용자가 물을 때만 주기를 제안한다.[](source:cvs-maintain)
