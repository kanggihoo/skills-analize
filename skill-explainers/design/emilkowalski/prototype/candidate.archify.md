# prototype — 방향이 다른 여러 UI 버전을 비교 화면으로 띄워 고른다 {#overview}

`prototype`은 에이전트가 UI 요소 하나를 서로 다른 축으로 3~5개 버전으로 구현해 격리된 비교 화면과 고정된 선택기에 올려 두고, 사용자가 직접 전환하며 고른 안만 실제 코드에 통합하게 하는 스킬이다.[](source:s-fm)[](source:s-intro)

- 사용자가 `/prototype <설명>`이나 `x5`, `riff`, `keep` 변형으로 부를 때만 켜지며(`disable-model-invocation: true`), 질문 없이 처음 부르면 정해진 한 줄만 답하고 대기한다.[](source:s-fm)[](source:s-init)[](source:s-var)
- 결과로 격리 경로(`/prototypes/<slug>`)나 단일 HTML 비교 화면, 그리고 선택을 마친 뒤 프로덕션 위치에 통합된 최종 버전 코드가 남는다.[](source:s-p4)[](source:s-p6)
- 다른 스킬과의 관계: `break-ui`가 재설계 대안으로 이 스킬을 안내하고, 이 스킬은 `review-animations`·`improve-animations`·`pick-ui-library`·`jakubkrehel/variant`와 대안 관계다.
- 탐색 도중에는 프로덕션 코드를 수정하지 않으며, 선택기 외형을 프로젝트 토큰에 맞춰 고치거나 가짜 문구(`lorem ipsum`)·미작동 버튼을 넣는 일을 금지한다.[](source:s-rule)

@answer scope="design/emilkowalski/prototype · 원본 파일 2개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source s-fm title="frontmatter: name, description, disable-model-invocation" path=design/emilkowalski/prototype/SKILL.md lines=1:5
@source s-init title="질문 없이 첫 호출 시 응답" path=design/emilkowalski/prototype/SKILL.md lines=9:15
@source s-intro title="발산 스킬 역할과 다른 스킬과의 경계" path=design/emilkowalski/prototype/SKILL.md lines=17:24
@source s-rule title="5가지 절대 규칙" path=design/emilkowalski/prototype/SKILL.md lines=25:32
@source s-p1 title="Phase 1: 범위 한정" path=design/emilkowalski/prototype/SKILL.md lines=35:38
@source s-p2 title="Phase 2: 정찰" path=design/emilkowalski/prototype/SKILL.md lines=39:49
@source s-p3 title="Phase 3: 방향 3~5개 선정" path=design/emilkowalski/prototype/SKILL.md lines=50:57
@source s-p4 title="Phase 4: 비교 화면과 선택기 구축" path=design/emilkowalski/prototype/SKILL.md lines=58:66
@source s-p5 title="Phase 5: 검증, 비교 표 제시, 선택 대기" path=design/emilkowalski/prototype/SKILL.md lines=67:81
@source s-p6 title="Phase 6: 선택안 통합과 비교 화면 정리" path=design/emilkowalski/prototype/SKILL.md lines=82:87
@source s-var title="5가지 호출 변형과 정직한 비교 어조" path=design/emilkowalski/prototype/SKILL.md lines=88:100
@source pk-spec title="PICKER.md: 선택기 고정 외형, 마크업, CSS" path=design/emilkowalski/prototype/PICKER.md lines=1:125
@source pk-rule title="PICKER.md: 규칙과 키보드·URL 동작 계약" path=design/emilkowalski/prototype/PICKER.md lines=127:142
@source pk-js title="PICKER.md: 참조 JS 배선" path=design/emilkowalski/prototype/PICKER.md lines=143:201
@source rel-brk title="break-ui의 재설계 대안 안내" path=design/emilkowalski/break-ui/SKILL.md lines=16:16
@source rel-var title="jakubkrehel/variant의 유사 목적 비교" path=design/jakubkrehel/variant/SKILL.md lines=1:25

## 어떻게 동작하나 {#flow span=12}

질문 없이 처음 호출하면 지정 문장 한 줄만 답하고 대기한다.[](source:s-init) 사용자가 `<description> x5`로 부르면 최대 5개 버전까지 만들고, `keep <variant>, leave the picker`로 부르면 통합 뒤에도 비교 화면을 지우지 않고 남긴다.[](source:s-var)

@workflow id=flow-diagram title="prototype 흐름"
| lane design | 범위·방향 |
| lane build | 구현·검증 |
| lane ship | 선택·통합 |
| scope | Phase 1 범위 한정 | backend | design | source:s-p1 |
| recon | Phase 2 정찰 | backend | design | source:s-p2 |
| direct | Phase 3 방향 선정 | backend | design | source:s-p3 |
| harness | Phase 4 비교 화면 구축 | backend | build | source:s-p4 |
| verify | Phase 5 검증·표 제시 | backend | build | source:s-p5 |
| choice | 사용자 선택? | backend | ship | source:s-p5 |
| promote | Phase 6 통합·정리 | backend | ship | source:s-p6 |
| scope > recon | 대상 1개 확정 |
| recon > direct | 토큰·맥락 확보 |
| direct > harness | 3~5개 축 확정 |
| harness > verify | 선택기 연결 |
| verify > choice | 표·경로 전달 |
| choice > direct | riff 요청 | dashed |
| choice > promote | keep 선택 | emphasis |

@steps id=flow-steps
| s-scope | Phase 1 범위 한정 | **입력** UI 설명 요청 · **출력** 한 문장 작업 요약. **처리** 여러 컴포넌트를 아우르는 요청이면 가장 영향 큰 단일 UI 하나만 고르고 나머지는 후속 실행으로 돌린다.[](source:s-p1) | flow-diagram | scope |
| s-recon | Phase 2 정찰 | **입력** 현재 작업 폴더 · **출력** 스택·토큰·제품 성격·렌더 맥락 기록. **처리** 모든 버전이 내일 바로 배포해도 어색하지 않도록 기존 색상·간격·모션 토큰을 먼저 파악한다.[](source:s-p2) **다음** 프로젝트가 없는 빈 폴더면 중립 회색·단일 강조색·시스템 폰트 기본값으로 건너뛴다.[](source:s-p2) | flow-diagram | recon |
| s-direct | Phase 3 방향 선정 | **입력** 정찰 기록과 범위 요약 · **출력** 이름과 축이 겹치지 않는 3~5개 버전 목록. **처리** 레이아웃·밀도·성격·모션·상호작용 모델 등 서로 다른 축에 자리 잡도록 기본 3개(최대 5개) 방향을 정한다.[](source:s-p3) **다음** `Option A/B/C` 대신 방향을 뜻하는 이름을 붙이며, 강조 색이나 문구만 다르면 하나로 합친다.[](source:s-p3) | flow-diagram | direct |
| s-harness | Phase 4 비교 화면 구축 | **입력** 선정된 방향들과 토큰 · **참조** `PICKER.md` · **출력** 격리된 비교 화면(`/prototypes/<slug>` 또는 단일 HTML)과 선택기. **처리** `PICKER.md`의 마크업·스타일·키보드 계약을 그대로 복사한 선택기를 띄우고, 한 번에 한 버전만 실제 주변 맥락 속에 실크기로 렌더링한다.[](source:s-p4)[](source:pk-spec)[](source:pk-js) **다음** 버전 전환은 일 100회 이상 조작이므로 애니메이션 없이 즉시 바꾸며, 각 버전은 Emil Kowalski 모션 기준을 지켜야 한다.[](source:s-intro)[](source:s-p4) | flow-diagram | harness |
| s-verify | Phase 5 검증·표 제시 | **입력** 구축된 비교 화면 · **출력** 장단점 비교 표, 실행 주소, 전환 단축키. **처리** 모든 버전의 동작과 콘솔 무오류를 확인하고(브라우저 도구가 있으면 스크린샷) 표를 낸 뒤 멈춘다.[](source:s-p5) **다음** 추천 안을 미리 찍지 않고 사용자의 결정을 기다린다.[](source:s-p5)[](source:s-var) | flow-diagram | verify |
| s-choice | 사용자 선택? | **입력** 사용자의 `keep` 또는 `riff` 응답 · **출력** 통합 또는 재발산 분기. **처리** 승자가 정해지면 통합으로 넘기고, 추가 탐색을 원하면 선택한 방향을 중심으로 Phase 3을 다시 돌린다.[](source:s-p6)[](source:s-var) | flow-diagram | choice |
| s-promote | Phase 6 통합·정리 | **입력** 선택된 버전과 비교 화면 · **출력** 프로덕션 통합 코드와 정리된 작업 공간. **처리** 프로젝트 관례와 토큰에 맞춰 실제 코드에 심고 검사를 통과시킨 뒤, 유지 요청이 없으면 비교 화면을 삭제한다.[](source:s-rule)[](source:s-p6) | flow-diagram | promote |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 호출형(`/prototype`). `disable-model-invocation: true`가 설정되어 모델이 자동으로 켜지 않는다.[](source:s-fm) |
| 성격 | 절차형(6단계 발산 탐색·통합). 서로 다른 축의 작동하는 버전 3~5개를 격리 비교 화면으로 보여 준 뒤 선택된 1개만 통합한다.[](source:s-intro) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `break-ui` {#rel-r27} | **이 스킬** | 대안 | 역할 경계: `break-ui`는 최악 데이터로 깨지는 지점만 찾고, 컴포넌트 재설계는 사용자가 이 스킬을 선택한다.[](source:rel-brk) |
| **이 스킬** {#rel-r40} | `review-animations` | 대안 | 역할 경계: 기존 UI와 모션 리뷰는 이 스킬이 아니라 사용자가 `review-animations`를 선택한다.[](source:s-intro) |
| **이 스킬** {#rel-r41} | `improve-animations` | 대안 | 역할 경계: 기존 애니메이션 감사와 수정 계획 수립은 사용자가 `improve-animations`를 선택한다.[](source:s-intro) |
| **이 스킬** {#rel-r42} | `pick-ui-library` | 대안 | 역할 경계: 구현용 라이브러리 의존성 선택은 사용자가 `pick-ui-library`를 선택한다.[](source:s-intro) |
| **이 스킬** {#rel-r43} | `jakubkrehel/variant` | 대안 | 목적 유사(다중 UI 버전을 만들고 선택기로 고름)하나 작성자와 구조(`PICKER.md` 고정 플로팅 pill 대 `better-*` 축 소유권)가 다르다.[](source:s-fm)[](source:rel-var) |

@architecture id=relation-map title="prototype과 이어지는 스킬"
| brk | break-ui | backend |
| self | prototype(이 스킬) | backend |
| rev | review-animations | backend |
| imp | improve-animations | backend |
| pick | pick-ui-library | backend |
| jvar | jakubkrehel/variant | backend |
| brk > self | 대안 |
| self > rev | 대안 |
| self > imp | 대안 |
| self > pick | 대안 |
| self > jvar | 대안 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 5가지 절대 규칙, 6단계 탐색·통합 워크플로, 5종 호출 변형, 모션 품질 기준을 담은 본문 100줄 | 사용자가 `/prototype`으로 부를 때 읽는다 | Phase 1 범위 한정, Phase 2 정찰, Phase 3 방향 선정, Phase 4 비교 화면 구축, Phase 5 검증·표 제시, 사용자 선택?, Phase 6 통합·정리 |
| `PICKER.md` | 하단 중앙 플로팅 선택기 마크업·CSS·키보드(`1~N`, `←`/`→`, `R`)·URL(`?v=2`)·JS 배선 규격 201줄 | `SKILL.md`가 비교 화면을 만들 때 원문 그대로 복사하도록 지시한다[](source:s-rule)[](source:s-p4)[](source:pk-js) | Phase 4 비교 화면 구축 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 질문 없이 처음 호출될 때 | 정해진 한 문장만 답하고 대기한다. | [](source:s-init) |
| 모델이 이 스킬을 자동으로 켜려 할 때 | `disable-model-invocation: true` 때문에 자동 호출되지 않는다. | [](source:s-fm) |
| 탐색(Phase 1~5) 중일 때 | 프로덕션 코드를 절대 건드리지 않고 격리된 `/prototypes/<slug>`나 단일 HTML 파일 안에서만 작업한다. | [](source:s-rule)[](source:s-p4) |
| 버전 수와 축을 정할 때 | 기본 3개·최대 5개로 제한하며, 색·문구만 바꾼 중복 방향은 빼고 2개로 줄이더라도 실제 다른 축만 남긴다. | [](source:s-rule)[](source:s-p3)[](source:s-var) |
| 버전을 구현할 때 | `lorem ipsum`이나 동작하지 않는 버튼을 금지하고, 각 버전마다 `ease-out`·300ms 미만(예외 포함)·기준점·reduced motion 기준을 지킨다. | [](source:s-intro)[](source:s-rule) |
| 선택기 UI를 만들 때 | `PICKER.md`의 HTML·CSS·색상을 그대로 유지해 프로젝트 테마를 입히지 않으며, 하단 중앙을 가리는 버전일 때만 `data-position="top"`으로 올린다. | [](source:s-rule)[](source:pk-rule) |
| 선택기 동작과 버전 전환을 구현할 때 | 선택기 하이라이트는 250ms 슬라이드하되 버전 전환 자체는 애니메이션 없이 즉시 바뀌어야 하며, 재실행(`↻`/`R`)은 모션이 있는 비교에서만 보인다. | [](source:s-p4)[](source:pk-rule) |
| Phase 5 비교 표를 제시한 뒤 | 선호 버전을 미리 찍지 않고 사용자가 `keep` 또는 `riff`를 고를 때까지 멈춘다. | [](source:s-p5)[](source:s-var) |
| Phase 6 승자 통합 후 | `leave the picker` 요청이 없으면 비교 화면 파일과 경로를 지우고 프로덕션에서 아무것도 비교 화면을 import하지 않게 정리한다. | [](source:s-rule)[](source:s-p6) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- `PICKER.md` 전체 CSS·JS 배선과 키보드 계약 — 맡을 개요 항목: Phase 4 비교 화면 구축 · 하이라이트 이동(`data-ready`), URL `?v=2` 동기화, 입력창 키 무시 조건 등 원문 코드가 길어서 뺐다.

@callout level=open-question title="확인하지 못한 것"
| Phase 6에서 "프로젝트의 검사를 통과한다"가 가리키는 구체적 명령(`lint`, `typecheck`, `test` 등)은 대상 저장소에 따라 다르므로 원문에 명시 없음.[](source:s-p6) |

읽은 원본: 텍스트 파일 2개(`SKILL.md`, `PICKER.md`). 제외: `SKILL.ko.stale.md`, `PICKER.ko.stale.md` 2개(낡은 번역본).
