# aimotion — 166개 웹 그래픽 데모에서 기법만 뽑아 영상 코드로 다시 짠다 {#overview}

`aimotion`은 에이전트가 장면에 맞는 표현 기법을 166편의 내장 웹 그래픽 데모에서 찾아 원리와 소스를 이해한 뒤, 데모의 소재·장면·색·9:16 틀은 버리고 기술만 작업 중인 영상의 대본에 맞춰 다시 짜게 하는 참고서 스킬이다.[](source:s-fm)[](source:s-intro) **부분 분석**: 166개 데모 전체가 아니라 스킬 안내 문서, 인덱스 구조, 공통 런타임, 표본 1편(`01-svg-ink`)만 확인했다.

- 모델이 셰이더·입자·유체·수채·잉크 질감·키네틱 타이포그래피·장면 전환·3D 등 표현력 향상이 필요하다고 판단할 때 `description`으로 켠다.[](source:s-fm)
- 결과로 `aimotion` 파일을 직접 import하지 않고 작업 중인 영상 프로젝트 안에 재구현된 알고리즘·셰이더·굽기 코드와 기법 한 줄 요약이 남는다.[](source:s-rule)[](source:s-port)
- 다른 스킬과의 관계: `script-to-motion`이 5단계에서 자체 로더로 이 스킬의 검색 스크립트를 호출하며, 이 스킬은 작업 중인 영상 스킬의 규칙을 우선하도록 참고 안내한다.[](source:s-port)[](source:rel-stm5)
- 데모가 그린 사물·인물·구도·문구·색과 9:16(1080×1920)·8~10초 틀을 그대로 옮기거나 데모 파일을 영상에서 직접 불러오는 일을 금지한다.[](source:s-rule)[](source:s-port)

@answer scope="video/cokacmotion/skills/aimotion · 원본 파일 7개(166개 데모는 구조·표본만 확인) · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=f53b74e8bae4a9f9a8a11d2d3d0dc2b980b855ed
@source s-fm title="frontmatter: name, description" path=video/cokacmotion/skills/aimotion/SKILL.md lines=1:4
@source s-intro title="aimotion 개요와 내장 데모 구성" path=video/cokacmotion/skills/aimotion/SKILL.md lines=6:11
@source s-rule title="가장 중요한 규칙: 기술만 가져간다" path=video/cokacmotion/skills/aimotion/SKILL.md lines=12:36
@source s-use title="쓰는 법 7단계와 aimotion.mjs 명령" path=video/cokacmotion/skills/aimotion/SKILL.md lines=37:54
@source s-port title="영상에 옮길 때: 규칙·시계 대응·결정성·셰이더 함정" path=video/cokacmotion/skills/aimotion/SKILL.md lines=55:78
@source sc-cli title="aimotion.mjs: search·list·show·path·common 구현" path=video/cokacmotion/skills/aimotion/scripts/aimotion.mjs lines=1:92
@source idx-md title="INDEX.md: 12개 분류 166편 목록 머리말" path=video/cokacmotion/skills/aimotion/INDEX.md lines=1:13
@source idx-json title="index.json: 12개 분류와 데모 메타데이터 구조" path=video/cokacmotion/skills/aimotion/index.json lines=1:56
@source lib-stage title="demos/_lib/stage.js: 데모 공통 시계·seed 난수 규약" path=video/cokacmotion/skills/aimotion/demos/_lib/stage.js lines=1:30
@source lib-type title="demos/_lib/type.js: SIL OFL 1.1 폰트·거리장·윤곽 도우미" path=video/cokacmotion/skills/aimotion/demos/_lib/type.js lines=1:30
@source d01-note title="표본 데모 01-svg-ink/NOTES.md: 화면·기법·결정성 구조" path=video/cokacmotion/skills/aimotion/demos/01-svg-ink/NOTES.md lines=1:56
@source rel-stm5 title="script-to-motion 5단계의 cokacmotion 호출" path=video/script-to-motion/SKILL.md lines=840:849
@source rel-stm-ref title="script-to-motion cokacmotion.md의 함정 절 참조" path=video/script-to-motion/references/cokacmotion.md lines=123:125

## 어떻게 동작하나 {#flow span=12}

에이전트는 데모를 먼저 고르지 않고 영상 대본이 요구하는 표현을 먼저 정한 뒤 7단계 순서로 기법을 찾아 이식한다.[](source:s-rule)[](source:s-use) 마지막 확인에서 데모를 본 사람이 영상 속 장면을 알아볼 수 있으면 대본 단계로 되돌아가 다시 짠다.[](source:s-rule)[](source:s-use)

@workflow id=flow-diagram title="aimotion 흐름"
| lane find | 탐색·이해 |
| lane port | 추상화·이식 |
| search | 1. 대본 기반 기법 찾기 | backend | find | source:s-use |
| view | 2. poster·sheet 확인 | backend | find | source:s-use |
| principle | 3~4. NOTES·소스 읽기 | backend | find | source:s-use |
| distill | 5. 소재 뺀 기술 요약 | backend | port | source:s-rule |
| rewrite | 6. 영상 코드로 재작성 | backend | port | source:s-port |
| verify | 7. 데모 장면 비노출? | backend | port | source:s-rule |
| search > view | 후보 데모 id 선정 |
| view > principle | 시각 결과 확인 |
| principle > distill | 원리·줄 번호 파악 |
| distill > rewrite | 기술 한 문장 확정 |
| rewrite > verify | 시계·비율·결정성 이식 |
| verify > search | 데모 장면 알아봄 | dashed |

@steps id=flow-steps
| s-search | 1. 대본 기반 기법 찾기 | **입력** 영상 대본의 표현 요구 · **참조** `INDEX.md`, `index.json` · **실행** `node scripts/aimotion.mjs search <검색어>` 또는 `list` · **출력** 후보 데모 `<id>` 목록. **처리** 네트워크 없이 내장 `index.json`에서 제목·기법·배울 점·라이브러리·분류 점수로 데모를 찾는다.[](source:s-use)[](source:sc-cli)[](source:idx-md)[](source:idx-json) | flow-diagram | search |
| s-view | 2. poster·sheet 확인 | **입력** 후보 데모 `<id>` · **실행** `node scripts/aimotion.mjs path <id>` · **출력** `out/poster.jpg`와 `out/sheet.jpg` 시각 확인. **처리** 절정 한 장(`poster.jpg`)과 1초 간격 시트(`sheet.jpg`) 이미지를 열어 효과가 화면에서 어떻게 보이는지 확인한다.[](source:s-use)[](source:sc-cli) | flow-diagram | view |
| s-principle | 3~4. NOTES·소스 읽기 | **입력** 데모 폴더 · **참조** `demos/<id>/NOTES.md`, `demos/_lib/stage.js`, `demos/_lib/type.js` · **실행** `node scripts/aimotion.mjs show <id>` 및 `common` · **출력** 구현 원리와 결정성 전략 이해. **처리** `NOTES.md`의 "기법과 원리"가 가리키는 `main.js:줄`과 공통 런타임(`stage.js`, `type.js`)을 읽어 왜 그렇게 짰는지 설명할 수 있을 때까지 파악한다.[](source:s-use)[](source:sc-cli)[](source:lib-stage)[](source:lib-type)[](source:d01-note) | flow-diagram | principle |
| s-distill | 5. 소재 뺀 기술 요약 | **입력** 파악한 원리 · **출력** 데모 소재가 제거된 기술 한 문장. **처리** 데모의 사물·배경·구도를 모두 빼고 알고리즘·셰이더·굽기 원리만 한 문장으로 적는다.[](source:s-rule)[](source:s-use) | flow-diagram | distill |
| s-rewrite | 6. 영상 코드로 재작성 | **입력** 기술 한 문장과 작업 중인 영상 대본 · **출력** 영상 프로젝트 내 재구현 코드. **처리** `aimotion` 파일을 import하지 않고 작업 중인 영상 스킬 규칙과 `t` 순수 함수, 셰이더 함정 회피 규칙에 맞춰 새 무대 비율과 좌표로 다시 짠다.[](source:s-port) | flow-diagram | rewrite |
| s-verify | 7. 데모 장면 비노출? | **입력** 재작성된 영상 장면 · **출력** 통과 또는 재설계 결정. **처리** 데모를 본 사람이 영상에서 그 데모 장면을 알아볼 수 없는지, 그리고 다른 `t` 순서로 seek해도 같은 그림이 나오는지 확인한다.[](source:s-rule)[](source:s-use)[](source:s-port) | flow-diagram | verify |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 호출형. `description`이 잉크·수채·셰이더·유체·입자·타이포·전환·3D 등 표현 기법 참고나 "표현력 향상", "그래픽 업그레이드" 요청에 켜도록 안내한다.[](source:s-fm) |
| 성격 | 절차형(내장 166개 데모에서 원리를 검색·독해하고 소재를 덜어낸 뒤 영상 코드로 재작성하는 7단계 참고서). |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `script-to-motion` {#rel-r16} | **이 스킬** | 호출 | 5단계에서 beat마다 자체 `cokacmotion.mjs`로 저장소를 받아 `aimotion.mjs`를 실행하며, 셰이더·캔버스 함정 절을 직접 참조한다.[](source:s-port)[](source:rel-stm5)[](source:rel-stm-ref) |
| **이 스킬** {#rel-r17} | `(작업 중인 영상 스킬)` | 참고 | 라이브러리·글꼴·소리·데이터·네트워크 규칙은 작업 중인 영상 스킬이 우선한다고 적는다(특정 스킬명은 원문에 명시 없음).[](source:s-port) |

@architecture id=relation-map title="aimotion과 이어지는 스킬"
| stm | script-to-motion | backend |
| self | aimotion(이 스킬) | backend |
| host | (작업 중인 영상 스킬) | external |
| stm > self | 호출 |
| self > host | 참고 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | "기술만 가져간다" 핵심 규칙, 7단계 사용법, 시계 대응표, 결정성·셰이더 함정 | 스킬이 켜질 때 읽는다 | 1. 대본 기반 기법 찾기, 2. poster·sheet 확인, 3~4. NOTES·소스 읽기, 5. 소재 뺀 기술 요약, 6. 영상 코드로 재작성, 7. 데모 장면 비노출? |
| `scripts/aimotion.mjs` | 의존성 없는 Node 18+ CLI(`search`·`list`·`show`·`path`·`common`) | 기법을 검색하거나 노트·소스·공통 코드를 출력할 때 실행[](source:s-use)[](source:sc-cli) | 1. 대본 기반 기법 찾기, 2. poster·sheet 확인, 3~4. NOTES·소스 읽기 |
| `INDEX.md` | 12개 분류별 166편 데모 목록(장면 예시·배울 점·라이브러리·영상 주의) | 전체 기법을 훑을 때 읽는다[](source:s-use)[](source:idx-md) | 1. 대본 기반 기법 찾기 |
| `index.json` | 12개 분류 메타와 166편 데모 검색용 JSON 인덱스 | `aimotion.mjs`가 검색·목록 출력 시 읽는다[](source:sc-cli)[](source:idx-json) | 1. 대본 기반 기법 찾기 |
| `demos/_lib/stage.js` | 모든 데모가 공유하는 1080×1920 무대·`t` 순수 함수 시계·`rand(seed)` | `aimotion.mjs common`으로 공통 런타임을 파악할 때 읽는다[](source:s-use)[](source:lib-stage) | 3~4. NOTES·소스 읽기 |
| `demos/_lib/type.js` | 데모 51+가 쓰는 SIL OFL 1.1 폰트·부호 거리장·윤곽 추출 도우미 | 타이포 데모의 공통 코드를 파악할 때 읽는다[](source:s-use)[](source:lib-type) | 3~4. NOTES·소스 읽기 |
| `demos/01-svg-ink/NOTES.md` | 데모별 구현 노트 표본(화면 예시·기법과 원리 `main.js:줄`·결정성 전략) | 각 데모의 원리를 파악할 때 `show <id> --notes`로 읽는다[](source:s-use)[](source:d01-note) | 3~4. NOTES·소스 읽기 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 데모의 소재·장면·색·구도·9:16 틀을 복사할 때 | 색·크기·문구를 바꿨더라도 실패로 보고 대본 단계로 되돌아가 다시 짠다. | [](source:s-rule) |
| 데모를 먼저 고르고 대본을 맞출 때 | 금지한다. 반드시 대본이 요구하는 장면과 소재를 먼저 정한 뒤 기법을 찾는다. | [](source:s-rule) |
| 영상 프로젝트가 `aimotion` 파일을 직접 불러올 때 | 금지한다. 원리만 이해한 뒤 영상 프로젝트 코드로 다시 쓴다. | [](source:s-port) |
| 데모의 라이브러리가 영상 스킬 규칙에 없을 때 | 해당 라이브러리를 넣지 않고 Canvas 2D·SVG·WebGL로 직접 구현하며, 물리는 미리 구워 `t`로 읽는다. | [](source:s-port) |
| 시뮬레이션·랜덤·타이밍을 구현할 때 | `Math.random`·`Date`·타이머·CSS transition을 금지하고 `t` 순수 함수와 고정 `dt` 체크포인트·사전 굽기만 쓴다. | [](source:s-port) |
| 목록에 "CPU 검증 프레임당 1초 초과" 경고가 있을 때 | 그대로 쓰면 프레임 렌더가 매우 느리므로 해상도를 낮추거나 미리 굽는다. | [](source:s-port) |
| WebGL 셰이더·Canvas 2D를 이식할 때 | 음수 밑 `pow` 방지(`max(x, 0.0)`), NaN 블룸 번짐 차단, 프레임마다 2D 컨텍스트 상태 초기화를 지킨다. | [](source:s-port) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 12개 분류 166편 데모 분포와 성능 주의 목록 — 맡을 개요 항목: 1. 대본 기반 기법 찾기 · 분류별 기법 스펙트럼과 무거운 시뮬레이션(Gray–Scott, Stable Fluids 등) 기준을 뺐다.
- `demos/_lib/stage.js`·`type.js`의 `replay`·거리장 구현 — 맡을 개요 항목: 3~4. NOTES·소스 읽기 · 체크포인트 기반 상태 시뮬레이션 재계산과 폰트 윤곽 추출 세부 구현을 뺐다.

@callout level=open-question title="확인하지 못한 것"
| `demos/` 아래 166개 데모 전체 소스와 `NOTES.md`, `out/poster.jpg`·`out/sheet.jpg`는 표본(`01-svg-ink/NOTES.md`)과 `INDEX.md`·`index.json` 구조만 확인하고 전수 열람하지 않았다. |

읽은 원본: 텍스트 파일 7개(`SKILL.md`, `scripts/aimotion.mjs`, `INDEX.md` 앞부분, `index.json` 구조, `demos/_lib/stage.js`, `demos/_lib/type.js`, 표본 `demos/01-svg-ink/NOTES.md`). 제외: 나머지 165개 데모 폴더(구조·표본만 확인) 및 `out/*.jpg`·폰트 바이너리.