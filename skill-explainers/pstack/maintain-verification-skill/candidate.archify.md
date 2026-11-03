# maintain-verification-skill 스킬은 에이전트를 어떻게 바꾸나 {#maintain-verification-skill-skill}

`maintain-verification-skill`을 쓰면 에이전트는 검증 스킬의 기능 지도가 지금 앱과 맞는지 기능 단위로 다시 확인한다. 소스로 한 번, 실제 조작으로 한 번 확인하고, 증명된 수정만 PR 하나로 낸다.[](source:skill-intro)[](source:skill-fm)

- 결과는 `clean`, `changed`, `blocked` 중 하나이고, 무엇인지 밝힌다.[](source:skill-outcomes)
- 고치는 범위는 검증 스킬 자기 폴더뿐이다. 제품 코드는 고치지 않는다.[](source:skill-scope)
- 기능 파일마다 읽기 전용 서브에이전트를 하나씩 동시에 띄운다. 앱 조작은 조정자 혼자 한다.[](source:skill-wave)[](source:skill-live)
- 소스가 깨끗해 보여도 실제 조작 단계는 반드시 한다.[](source:skill-live)

@answer scope="pstack/maintain-verification-skill · 원본 텍스트 파일 1개 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/maintain-verification-skill/SKILL.md · 4922B · frontmatter" path=pstack/maintain-verification-skill/SKILL.md lines=1:5
@source skill-intro title="pstack/maintain-verification-skill/SKILL.md · 목적과 엄밀함의 단위" path=pstack/maintain-verification-skill/SKILL.md lines=9:9
@source skill-outcomes title="pstack/maintain-verification-skill/SKILL.md · 결과 세 가지" path=pstack/maintain-verification-skill/SKILL.md lines=11:17
@source skill-scope title="pstack/maintain-verification-skill/SKILL.md · 수정 범위" path=pstack/maintain-verification-skill/SKILL.md lines=19:21
@source skill-locate title="pstack/maintain-verification-skill/SKILL.md · 0 대상 찾기" path=pstack/maintain-verification-skill/SKILL.md lines=25:25
@source skill-index title="pstack/maintain-verification-skill/SKILL.md · 1 색인 정리" path=pstack/maintain-verification-skill/SKILL.md lines=27:27
@source skill-wave title="pstack/maintain-verification-skill/SKILL.md · 2 소스 조사" path=pstack/maintain-verification-skill/SKILL.md lines=29:29
@source skill-recon title="pstack/maintain-verification-skill/SKILL.md · 3 대조" path=pstack/maintain-verification-skill/SKILL.md lines=31:31
@source skill-live title="pstack/maintain-verification-skill/SKILL.md · 4 실제 조작" path=pstack/maintain-verification-skill/SKILL.md lines=33:33
@source skill-triage title="pstack/maintain-verification-skill/SKILL.md · 5 분류" path=pstack/maintain-verification-skill/SKILL.md lines=35:35
@source skill-ship title="pstack/maintain-verification-skill/SKILL.md · 6 내보내기와 실행 노트" path=pstack/maintain-verification-skill/SKILL.md lines=37:39
@source create-offer title="pstack/create-verification-skill/SKILL.md · 5단계 유지 안내" path=pstack/create-verification-skill/SKILL.md lines=42:44
@source create-paths title="pstack/create-verification-skill/SKILL.md · 생성 경로" path=pstack/create-verification-skill/SKILL.md lines=25:25
@source create-helpers title="pstack/create-verification-skill/SKILL.md · Helpers 규칙" path=pstack/create-verification-skill/SKILL.md lines=32:32

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/maintain-verification-skill`을 입력하거나 다른 스킬이 부를 때 켜진다. `description`은 이 스킬을 주기적으로 도는 점검이라고 소개한다.

대상은 `/create-verification-skill`이 만든 스킬, 또는 기능 지도를 가진 다른 프로젝트 검증 스킬이다.[](source:skill-intro) `create-verification-skill`은 생성을 마치면 사용자에게 이 스킬을 알려 준다. 점검 주기는 사용자가 물을 때만 제안한다.[](source:create-offer) 주기를 정해 자동으로 돌리는 장치는 원문에 명시 없음.

엄밀함의 단위는 문장이 아니라 기능이다. 모든 기능 파일을 소스로 확인하고 모든 기능을 실제로 조작하지만, 문장 하나하나를 터미널에서 검증하지는 않는다.[](source:skill-intro)

## 한 번의 점검은 어떻게 진행하나 {#flow}

@workflow id=mvs-flow title="유지 점검 흐름"
| lane src | 소스 확인 |
| lane run | 대조와 실제 확인 |
| locate | 대상? | backend | src |
| stop | 멈춤 | external | src |
| index | 색인 | backend | src |
| wave | 소스 | backend | src |
| recon | 대조 | backend | run |
| live | 조작 | backend | run |
| triage | 분류 | backend | run |
| ship | 보고 | frontend | run |
| locate > index | 하나 | emphasis |
| locate > stop | 없음 | |
| index > wave | | |
| wave > recon | | |
| recon > live | | |
| live > triage | | |
| triage > live | 재조작 | dashed |
| triage > ship | | emphasis |

@steps id=mvs-steps
| s-locate | 대상? | 실행·조작 절과 기능 지도를 가진 프로젝트 검증 스킬을 찾는다. 보통 `.cursor/skills/verify-*/`다. 후보가 여럿이면 사용자에게 어느 것인지 묻는다. | mvs-flow | locate |
| s-stop | 멈춤 | 후보가 없으면 대상을 지어내지 않고 멈춘다. `/create-verification-skill`을 안내한다. | mvs-flow | stop |
| s-index | 색인 | 기능 지도 `README`를 읽고 같은 폴더 파일을 `glob` 패턴으로 모은다. 빠졌거나, 남거나, 중복이거나, 죽은 항목을 고친다. 가볍게 하고 목록 파일을 따로 생성하지 않는다. | mvs-flow | index |
| s-wave | 소스 | 기능 파일마다 읽기 전용 서브에이전트 하나를 동시에 띄운다. 각자 "이 기능은 어떻게 동작하나"를 소스로 설명하고, 문서가 어긋났을 만한 곳을 인용과 함께 짚고, 실제 검증 절차 하나를 돌려준다. | mvs-flow | wave |
| s-recon | 대조 | 모든 기능 파일에 요약이 돌아왔는지 본다. 겹치는 절차를 가능한 한 적은 앱 상태로 합친다. 인용된 어긋남은 표본으로 확인하고, 깨끗하다는 주장은 다시 증명하지 않는다. 최근 변경에서 지도에 빠진 사용자 표면을 찾는다. 빠졌다고 하려면 구체적인 소스 경로가 있어야 한다. | mvs-flow | recon |
| s-live | 조작 | 조정자가 모든 조작을 맡는다. 검증 스킬의 Launch 절이 정한 방식을 따른다. 서버·UI는 오래 사는 인스턴스 하나를 순서대로, 수명이 짧은 CLI 앱은 조작마다 새 격리 세션을 쓴다. 모든 기능을 최소 한 번 조작하고 아래 불변 조건 세 개를 지킨다. | mvs-flow | live |
| s-triage | 분류 | 아래 분류표대로 나눈다. 하네스 수정은 내보내기 전에 실제로 다시 조작해 본다. | mvs-flow | triage |
| s-ship | 보고 | `changed`면 바뀐 파일을 모두 다시 읽고 증명된 수정만 PR 하나로 낸다. `clean`·`blocked`면 PR 없이 결과와 확인 범위를 그대로 보고한다. | mvs-flow | ship |

흐름은 원문 Pass 0~6을 따랐다.[](source:skill-locate)[](source:skill-index)[](source:skill-wave)[](source:skill-recon)[](source:skill-live)[](source:skill-triage)[](source:skill-ship) 소스 조사 서브에이전트는 앱을 조작하지도, 파일을 고치지도 않는다. 돌려주는 모양은 기능 요약 / 소스 진입점 / 어긋남 후보 또는 없음 / 절차 하나다.[](source:skill-wave)

## 실제 조작 단계에서 무엇을 지키나 {#live}

| 불변 조건 | 원문이 요구하는 것 |
| --- | --- |
| 1 점검한 인스턴스만 조작 | 마지막으로 이상한 일을 한 뒤 상태 점검(doctor)을 하지 않은 인스턴스는 조작하지 않는다. 첫 조작 전, 세션이 단위면 새 세션마다, 실패한 조작 뒤마다 점검한다. 점검이 못 보는 실패(프로세스는 멀쩡한데 UI가 멈춤)는 알려진 상태로 되돌리거나 다시 띄운다[](source:skill-live) |
| 2 근거는 정리에서 살아남음 | 지금까지 남긴 근거가 매번 정리 뒤에도 지정 위치에 있는지 확인한다. 있다고 가정하지 않는다[](source:skill-live) |
| 3 쓸모가 끝난 것은 남기지 않음 | 조작이 띄운 것은 쓸모가 끝나면 없앤다. 세션이 멈췄든 끝났든 공유든 실패한 시도의 찌꺼기를 치운다. 공유 인스턴스는 인스턴스가 아니라 찌꺼기만 치운다[](source:skill-live) |

@facts
| 소스 조사 서브에이전트 | 기능 파일 1개당 1개, 동시 실행, 읽기 전용 |
| 기능별 실제 조작 | 최소 1회 |
| 점검 실패가 스킬 어긋남일 때 | 범위 안에서 고치고 1회 재시도 |
| PR | 최대 1개(`changed`일 때만) |

상태 점검 실패가 검증 스킬의 어긋남 때문이면 그것도 어긋남이다. 수정 범위 안에서 고치고, 그 수정이 무효로 만든 것만 다시 시작해 한 번 재시도한다. 그래도 안 되면 `blocked`다.[](source:skill-live)

닿지 못한 기능은 구체적인 전제(인증, 권한, OS, 외부 상태)와 시도한 경로가 있을 때만 `verified-unreachable`로 적는다. 지도에 그 전제가 빠져 있으면 그것도 어긋남이다. 마지막 정리는 재검증까지 포함한 마지막 조작 뒤에 한다. 근거는 스킬이 정한 대로 남긴다.[](source:skill-live)

## 무엇을 고치고 무엇을 보고만 하나 {#triage}

| 분류 | 판단 기준 | 처리 |
| --- | --- | --- |
| 문서 어긋남(doc drift) | 사용자 관점 설명이 틀리거나 빠졌다 | 지도를 고친다 {good:이번 PR}[](source:skill-triage) |
| 하네스 빈틈(harness gap) | 앱은 잘 동작하는데 하네스가 조작하지 못한다 | 하네스를 고친다. 스크립트는 실행 가능, 호출 방법은 본문에[](source:skill-triage)[](source:create-helpers) |
| 제품 빈틈(product gap) | 앱 동작이 실제로 깨졌다 | 사용자에게 기록해 둔다 {bad:PR 제외}[](source:skill-triage) |

지도가 말하는 동작을 앱이 더는 하지 않으면 둘 중 하나다. 문서가 어긋났거나 제품이 퇴행했다. 퇴행을 문서 수정으로 덮지 않는다.[](source:skill-scope)

| 결과 | 뜻 | 브랜치·PR |
| --- | --- | --- |
| `clean` | 모든 기능이 소스와 실제 조작으로 확인됐고 낼 것이 없다 | 없음[](source:skill-outcomes) |
| `changed` | 증명된 문서, 하네스, 지도 수정이 있다 | PR 하나 {good:최대 1개}[](source:skill-outcomes) |
| `blocked` | 확인을 끝내지 못했거나 증명된 수정을 안전하게 내지 못했다 | 없음. 무엇이 막았는지 정확히 밝힌다[](source:skill-outcomes) |

수정 범위는 검증 스킬의 `SKILL.md`, `features/`, 그 스킬이 가진 하네스 스크립트다.[](source:skill-scope) 실행 노트(확인한 기능, 닿지 못한 전제, 확인된 어긋남, 결과)는 임시 위치에 짧게 남기고 커밋하지 않는다.[](source:skill-ship)

## 흐름 속 위치 {#position}

@workflow id=mvs-position title="maintain-verification-skill 앞뒤"
| create | create-verification-skill | backend |
| maint | maintain-verification-skill | backend |
| back | create 안내 | external |
| create > maint | 유지 안내 | |
| maint > back | 대상 없음 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `create-verification-skill`의 안내 | - | 생성을 마친 뒤 사용자에게 알린다. 주기는 물을 때만 | r80 |
| `verify-<app>/SKILL.md`, `features/*.md` | 같은 파일의 수정 | `create-verification-skill`이 쓰고 이 스킬이 찾아 고친다. 대상 프로젝트 저장소에 있다[](source:create-paths) | r81 |
| 후보 없음 | `/create-verification-skill` 안내 | 대상이 없으면 멈춘다. 여럿이면 사용자에게 묻는다 | r82 |

전체 흐름은 `pstack/_group-verify-harness/verify-harness.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md` 하나. 이 폴더의 원본은 이것뿐이다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: `verification-skills/pstack/maintain-verification-skill/SKILL.md`와 원문 동일(원장 기준, `shasum` 일치).
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
소스 조사 서브에이전트의 모델이나 개수 상한은 원문에 명시 없음. 기능 파일이 많으면 그 수만큼 동시에 띄우게 된다. PR을 사람이 승인하는 단계도 원문에 명시 없음. 실행 노트를 둘 임시 위치도 원문에 명시 없음.
