# state-machine — 컴포넌트의 모든 도달 가능 상태를 임시 페이지와 전환기로 띄운다 {#overview}

`state-machine`은 컴포넌트 하나를 골라 코드에 실제로 존재하는 모든 제품 상태를 모의 데이터(`fixture`)와 전환기(`switcher`)가 달린 임시 페이지에 렌더링해, 사용자가 상태를 오가며 시각 작업을 할 수 있게 하는 스킬이다.[](source:sk-intro)

- 사용자가 `/state-machine <컴포넌트>`를 실행할 때 켜지며, 한 번에 컴포넌트 하나만 다뤄 여러 컴포넌트를 가리키는 요청이면 목록을 내고 선택을 묻는다.[](source:fm)[](source:sk-step1)
- 결과로 남는 것은 앱 레이아웃·스타일을 물려받는 임시 경로(`/states/...` 등), `__state` 검색 파라미터와 화살표·`H` 키로 조작하는 전환기, 상태 목록·전환기 키 안내다.[](source:sk-step3)[](source:sk-step5)[](source:sk-step6)
- 다른 스킬과의 관계: `break`와 서로 대안 관계로 역할 경계를 나누며(대안), `SKILL.md` 본문은 대안 탐색을 `variant`, 리뷰를 `interface-review`로 구분한다.[](source:sk-intro)[](source:brk-rel)
- 하지 않는 것: 리뷰나 판정을 내리지 않고, 코드에 도달할 수 없는 가짜 상태를 억지로 만들지 않으며, 컴포넌트를 건드리지 않고 넘긴 뒤 사용자 지시 없이 상태를 고치지 않는다.[](source:sk-intro)[](source:sk-step2)[](source:sk-step6)

@answer scope="design/jakubkrehel/state-machine · 원본 파일 3개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source fm title="frontmatter: name·description·호출 제한" path=design/jakubkrehel/state-machine/SKILL.md lines=1:5
@source sk-intro title="목적, 워크벤치 정의, 형제 스킬과 경계" path=design/jakubkrehel/state-machine/SKILL.md lines=7:12
@source sk-step1 title="1단계: 컴포넌트 하나 범위 확정" path=design/jakubkrehel/state-machine/SKILL.md lines=13:18
@source sk-step2 title="2단계: 코드 분기에서 상태 추출·그룹화" path=design/jakubkrehel/state-machine/SKILL.md lines=19:32
@source sk-step3 title="3단계: 임시 페이지와 격리 폴더 구성" path=design/jakubkrehel/state-machine/SKILL.md lines=33:40
@source sk-step4 title="4단계: 데이터 경계 주입과 제품형 데이터" path=design/jakubkrehel/state-machine/SKILL.md lines=41:53
@source sk-step5 title="5단계: __state 전환기 연결" path=design/jakubkrehel/state-machine/SKILL.md lines=54:57
@source sk-step6 title="6단계: 전 상태 확인과 인계 후 정지" path=design/jakubkrehel/state-machine/SKILL.md lines=58:65
@source sk-recheck title="시각 수정마다 모든 상태 재확인" path=design/jakubkrehel/state-machine/SKILL.md lines=66:69
@source sk-remove title="사용자 요청 시 일괄 삭제·diff 확인" path=design/jakubkrehel/state-machine/SKILL.md lines=70:73
@source sk-checks title="마무리 전 실수 점검 3항목" path=design/jakubkrehel/state-machine/SKILL.md lines=74:80
@source sw-chrome title="디자인 시스템 밖 크롬과 그룹 목록" path=design/jakubkrehel/state-machine/switcher.md lines=1:17
@source sw-behavior title="__state URL 동기화·키보드·ARIA 동작" path=design/jakubkrehel/state-machine/switcher.md lines=18:27
@source sw-html title="전환기 HTML 구조" path=design/jakubkrehel/state-machine/switcher.md lines=28:61
@source sw-layout title="2열 sticky 목록 vs 상단 select 반응형 전환" path=design/jakubkrehel/state-machine/switcher.md lines=62:72
@source sw-css title="all: unset 기반 전환기 CSS 명세" path=design/jakubkrehel/state-machine/switcher.md lines=73:205
@source oai title="UI 메타데이터와 암묵 호출 차단" path=design/jakubkrehel/state-machine/agents/openai.yaml lines=1:5
@source brk-rel title="break의 state-machine 역할 경계" path=design/jakubkrehel/break/SKILL.md lines=11:11

## 어떻게 동작하나 {#flow span=12}

절차형이다. 원문 1~6단계와 후속 반복·일괄 삭제 지시를 범위·상태 추출, 페이지·전환기 구현, 확인·인계·정리 3개 국면으로 그렸다.[](source:sk-step1)[](source:sk-step6)[](source:sk-recheck)[](source:sk-remove)

@workflow id=flow-diagram title="state-machine 흐름"
| lane prep | 범위·상태 추출 |
| lane build | 페이지·전환기 구현 |
| lane verify | 확인·인계·정리 |
| scope | 컴포넌트 하나 확정 | backend | prep | source:sk-step1 |
| states | 코드에서 상태 추출 | backend | prep | source:sk-step2 |
| page | 임시 페이지 구성 | backend | build | source:sk-step3 |
| data | 경계에 데이터 주입 | backend | build | source:sk-step4 |
| switcher | 전환기 연결 | frontend | build | source:sk-step5 |
| handover | 전 상태 확인·인계 | backend | verify | source:sk-step6 |
| after | 후속 요청? | backend | verify | source:sk-recheck |
| recheck | 수정 후 전 상태 재확인 | backend | verify | source:sk-recheck |
| cleanup | 폴더·seam 일괄 삭제 | backend | verify | source:sk-remove |
| scope > states | | |
| states > page | | |
| page > data | | |
| data > switcher | | |
| switcher > handover | | emphasis |
| handover > after | | |
| after > recheck | 시각 수정 | |
| recheck > after | 다음 요청 | |
| after > cleanup | 삭제 요청 | emphasis |

@steps id=flow-steps
| s-scope | 컴포넌트 하나 확정 | **입력** 사용자 요청 대상 · **출력** 대상 컴포넌트 한 문장 요약(표시 내용·실제 렌더 위치·데이터 출처). **처리** 한 번의 실행에 컴포넌트 하나만 확정하고 역할을 한 문장으로 다시 적는다.[](source:sk-step1) **다음** 요청이 여러 컴포넌트를 아우르면("설정 페이지" 등) 후보 목록을 제시하고 어느 하나를 다룰지 묻는다.[](source:sk-step1) | flow-diagram | scope |
| s-states | 코드에서 상태 추출 | **입력** 컴포넌트와 데이터 hook 코드 · **출력** 그룹별 상태 목록, 빠진 디자인 상태 목록, 제외한 축 설명. **처리** Data·Account·Feature 세 갈래에서 코드가 실제로 분기하는 상태만 뽑아 제품 용어로 그룹화하고, 조합은 코드에 분기가 있을 때만 만든다.[](source:sk-step2) **다음** 코드가 도달할 수 없는 상태는 분기를 추가하지 않고 누락 목록에만 남긴다.[](source:sk-step2) | flow-diagram | states |
| s-page | 임시 페이지 구성 | **입력** 실제 컴포넌트와 프로덕션 너비 · **출력** 앱 내부 임시 라우트 폴더(예: `/states/audit-log`). **처리** 컴포넌트를 수정 없이 import해 실제 너비 컨테이너에 담고, 앱의 레이아웃·글꼴·전역 스타일·`provider`를 그대로 물려받되 페이지·데이터·전환기를 한 폴더에 격리한다.[](source:sk-step3) **다음** 서버·클라이언트 컴포넌트를 가르는 프레임워크(예: Next.js)면 fixture 소실을 막기 위해 페이지를 `"use client"` 클라이언트 코드로 작성한다.[](source:sk-step3) | flow-diagram | page |
| s-data | 경계에 데이터 주입 | **입력** 그룹별 상태 목록 · **출력** 제품 수준의 모의 데이터(`fixture`). **처리** 컴포넌트를 고치지 않고 props 우선, 없으면 쿼리 캐시·mock provider·요청 모의 같은 앱 자체 `seam`(데이터를 끼워 넣는 자리)에 실제 규모·형식의 데이터를 공급한다.[](source:sk-step4) **다음** 로딩·대기 상태는 타임아웃으로 풀지 않고 고정하며, 컴포넌트를 수정해야만 `seam`을 열 수 있으면 추가 전에 사용자에게 묻는다.[](source:sk-step4) | flow-diagram | data |
| s-switcher | 전환기 연결 | **입력** 그룹별 상태 목록과 실제 너비 · **참조** `switcher.md` · **출력** `__state` 기반 전환기 UI. **처리** 디자인 시스템 토큰을 쓰지 않는 어두운 중립 크롬(`all: unset`)으로 그룹 목록과 `<select>`를 모두 렌더링하고, 컨테이너 쿼리(`232px + 실제 너비`)로 배치하며 화살표·`H` 키를 연결한다.[](source:sk-step5)[](source:sw-chrome)[](source:sw-behavior)[](source:sw-html)[](source:sw-layout)[](source:sw-css) | flow-diagram | switcher |
| s-handover | 전 상태 확인·인계 | **입력** 임시 페이지 URL · **출력** URL, 상태 목록, 전환기 키 안내. **처리** 브라우저가 있으면 페이지를 열어 모든 상태에서 실제 데이터 대신 모의 데이터가 그려지는지 확인하고, 문제 시 배선을 고친 뒤 URL·목록·키를 넘긴다.[](source:sk-step6) **다음** 브라우저가 없으면 그 사실을 밝히고 URL을 넘기며, 어느 경우든 인계 직후 멈추고 상태 디자인 수정은 다음 요청을 기다린다.[](source:sk-step6) | flow-diagram | handover |
| s-after | 후속 요청? | **입력** 사용자의 다음 지시 · **출력** 시각 수정 재검증 또는 정리 분기. **처리** 사용자가 특정 상태의 시각 수정을 이어 가는가, 작업 완료 후 임시 페이지 제거를 요청했는가 확인한다.[](source:sk-recheck)[](source:sk-remove) | flow-diagram | after |
| s-recheck | 수정 후 전 상태 재확인 | **입력** 수정된 컴포넌트 · **출력** 전 상태 회귀 점검 결과. **처리** 한 상태를 고치면 다른 상태가 깨질 수 있으므로 시각 변경이 생길 때마다 전환기로 모든 상태를 다시 순회 확인한다.[](source:sk-recheck) | flow-diagram | recheck |
| s-cleanup | 폴더·seam 일괄 삭제 | **입력** 사용자 삭제 지시 · **출력** 임시 페이지·승인 `seam`이 제거된 작업 트리. **처리** 임시 페이지 폴더와 사용자 승인하에 추가했던 `seam`을 한 번에 지운 뒤, 코드베이스에서 경로·fixture 이름을 검색하고 diff에 잔여물이 없는지 확인한다.[](source:sk-remove) | flow-diagram | cleanup |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 호출형(`/state-machine <컴포넌트>`). `disable-model-invocation: true`와 `allow_implicit_invocation: false`가 설정되어 모델이 스스로 켜지 못한다.[](source:fm)[](source:oai) |
| 성격 | 절차형. 컴포넌트 하나를 실제 앱 환경에 올리고 도달 가능한 모든 제품 상태를 전환기로 오가며 작업하게 하는 워크벤치(`workbench`)다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `break` {#rel-r82} | **이 스킬** | 대안 | 역할 경계: 제품 상태별 확인은 `state-machine`을 사용한다(사용자 선택).[](source:brk-rel) |
| **이 스킬** {#rel-r90} | `break` | 대안 | 역할 경계: 최악 시나리오 동시 렌더링은 `break`, 대안 탐색은 `variant`, 리뷰는 `interface-review`를 사용한다(사용자 선택).[](source:sk-intro) |

@architecture id=relation-map title="state-machine과 이어지는 스킬"
| brk | break | backend |
| self | state-machine(이 스킬) | backend |
| brk > self | 대안 |
| self > brk | 대안 |

`SKILL.md`는 `break` 외에도 디자인 대안 탐색은 `variant`, 완성된 작업의 리뷰는 `interface-review`의 역할이라고 명시해 세 스킬을 함께 대안 경계로 구분한다.[](source:sk-intro)

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 6단계 구축·인계 절차, 시각 수정 후 재확인, 일괄 삭제, 실수 점검표 본문 | 스킬이 켜지면 항상 읽는다 | 컴포넌트 하나 확정, 코드에서 상태 추출, 임시 페이지 구성, 경계에 데이터 주입, 전환기 연결, 전 상태 확인·인계, 후속 요청?, 수정 후 전 상태 재확인, 폴더·seam 일괄 삭제 |
| `switcher.md` | 디자인 시스템 격리 크롬, `__state` URL 제어, 화살표·`H` 키, ARIA, HTML·CSS 명세 | 5단계에서 전환기를 구현할 때 읽는다 | 전환기 연결 |
| `agents/openai.yaml` | 표시 이름(`State Machine`), 짧은 설명, 암묵적 호출 차단 정책 | 호스트 UI 설정용. 동작 지시 없음 | 원문에 명시 없음 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| `disable-model-invocation: true` | 모델 자동 호출 금지. 사용자가 `/state-machine`으로 직접 켜야 한다 | [](source:fm) |
| 대상이 여러 컴포넌트를 포함할 때 | 목록을 제시하고 어느 컴포넌트 하나를 고를지 묻고 멈춘다 | [](source:sk-step1) |
| 코드에 도달할 수 없는 상태·무의미한 교차 조합 | 새 분기를 만들어 넣지 않는다. 디자인에만 있는 상태는 누락 목록에 적고 뺀다 | [](source:sk-step2) |
| 컴포넌트를 수정해야만 데이터 `seam`을 넣을 수 있을 때 | 컴포넌트를 고치기 전에 사용자에게 이유를 설명하고 승인을 묻는다 | [](source:sk-step4) |
| 모의 데이터 품질·로딩 상태 | "Item 1"·"Test user"·3행 금지. 실제 규모·형식 데이터를 쓰고 로딩 상태는 타임아웃으로 풀지 않는다 | [](source:sk-step4)[](source:sk-checks) |
| 전환기 스타일·배치 | 프로젝트 토큰·폰트·색 사용 금지(`all: unset` 다크 크롬 유지). 가로 탭 줄 대신 세로 그룹 목록·`<select>` 이중 렌더 | [](source:sk-checks)[](source:sw-chrome)[](source:sw-behavior)[](source:sw-html)[](source:sw-css) |
| 6단계 인계 직후 | URL·상태 목록·전환기 키를 넘긴 뒤 즉시 정지한다. 상태 디자인 수정은 다음 요청에서 처리 | [](source:sk-step6) |
| 브라우저가 없거나 모의 데이터가 안 보일 때 | 브라우저 없음은 알리고 URL을 넘기며, 실제 데이터·빈 화면이 뜨면 배선 고칠 때까지 인계하지 않는다 | [](source:sk-step6) |
| 사용자 삭제 요청 뒤 | 페이지 폴더·승인 `seam` 삭제 후 경로·fixture 이름 `grep`과 diff 점검으로 잔여물 0을 확인 | [](source:sk-remove) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 전환기 HTML·CSS·접근성 규격 — 전환기 연결 · `all: unset` 격리 CSS, `232px + 실제 너비` container query, `H` 키 무시 조건(`modifier`, `input` 등)

@callout level=open-question title="확인하지 못한 것"
| props나 기존 앱 `seam`이 없어 컴포넌트에 새 `seam` 추가 승인을 물었을 때 사용자가 거부하면 그 상태만 뺄지 전체를 중단할지는 원문에 명시 없음.[](source:sk-step4) |
| 6단계에서 사용할 브라우저 도구의 종류(예: `chrome-devtools-mcp`, Playwright 등)는 `explain-interface`와 달리 원문에 명시 없음.[](source:sk-step6) |

읽은 원본: 텍스트 파일 3개(관계 확인용으로 `break` 11줄 추가 확인). 제외: 없음.
