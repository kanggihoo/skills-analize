# break-ui — 최악 데이터를 넣어 UI가 깨지는 지점을 찾고 보고하는 스킬 {#overview}

`break-ui`는 에이전트가 정상 예시 데이터에 맞춰 만든 UI에 현실적인 최악 데이터를 주입하고 `Demo data / Worst case` 전환 스위치를 연결해 깨지는 지점과 수정안을 보고하게 하는 스킬이다.[](source:s-fm)[](source:s-p3)

- 컴포넌트나 화면의 경계 사례를 점검하거나 최악 데이터로 테스트할 때 켜진다. 질문 없이 처음 불리면 고정 문구 한 줄만 답하고 기다린다.[](source:s-fm)[](source:s-init)
- 결과로 최악 `fixture`, 개발 전용 전환 스위치(URL 상태 유지), 3부 보고서(`What broke`·`Decisions for you`·`What held up`)가 남는다. 수정은 보고 뒤 요청이나 `+ fix` 호출 때만 적용한다.[](source:s-p2)[](source:s-p3)[](source:s-out)[](source:s-var)
- 시각 디자인 비평은 `emil-design-eng`, 모션 리뷰는 `review-animations`, 컴포넌트 재설계는 `prototype`, 작성자는 다르지만 유사한 최악 시나리오 스트레스 테스트는 `design/jakubkrehel/break`가 맡는다(모두 대안).[](source:s-init)[](source:rel-jbreak)
- 하지 않는 것: `"aaa..."` 같은 비현실적 문자열을 쓰지 않고, 컴포넌트 마크업·CSS를 억지로 고쳐 깨짐을 만들지 않으며, 보고 전에 미리 수정하거나 전환 스위치를 배포 빌드에 남기지 않는다.[](source:s-posture)[](source:s-hard)

@answer scope="design/emilkowalski/break-ui · 원본 파일 2개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source s-fm title="frontmatter: name과 description" path=design/emilkowalski/break-ui/SKILL.md lines=1:4
@source s-init title="초기 응답과 역할 경계" path=design/emilkowalski/break-ui/SKILL.md lines=8:16
@source s-posture title="작업 태도와 두 가지 실패 유형" path=design/emilkowalski/break-ui/SKILL.md lines=18:27
@source s-hard title="필수 규칙 6가지" path=design/emilkowalski/break-ui/SKILL.md lines=29:37
@source s-p1 title="1단계: 렌더링 표면·한도 조사" path=design/emilkowalski/break-ui/SKILL.md lines=40:56
@source s-p2 title="2단계: 최악 fixture 생성" path=design/emilkowalski/break-ui/SKILL.md lines=58:70
@source s-p3 title="3단계: 개발용 전환 스위치 연결" path=design/emilkowalski/break-ui/SKILL.md lines=72:81
@source s-p4 title="4단계: 환경별 깨짐 탐색" path=design/emilkowalski/break-ui/SKILL.md lines=83:91
@source s-sig title="깨짐 징후 19종과 줄바꿈·잘라내기 기준" path=design/emilkowalski/break-ui/SKILL.md lines=93:130
@source s-p5 title="5단계: 보고 후 멈춤" path=design/emilkowalski/break-ui/SKILL.md lines=131:134
@source s-p6 title="6단계: 요청 시 수정과 재검증" path=design/emilkowalski/break-ui/SKILL.md lines=135:140
@source s-out title="필수 3부 보고 형식" path=design/emilkowalski/break-ui/SKILL.md lines=141:165
@source s-var title="호출 변형 4가지" path=design/emilkowalski/break-ui/SKILL.md lines=166:174
@source c-intro title="최악 데이터 카탈로그 안내와 예약 도메인" path=design/emilkowalski/break-ui/CATALOG.md lines=1:6
@source c-text title="이름·이메일·라벨 최악 데이터" path=design/emilkowalski/break-ui/CATALOG.md lines=9:60
@source c-data title="숫자·컬렉션·시간·미디어·상태 최악 데이터" path=design/emilkowalski/break-ui/CATALOG.md lines=61:122
@source c-env title="환경 조건 7가지" path=design/emilkowalski/break-ui/CATALOG.md lines=123:135
@source rel-eng title="emil-design-eng 소개" path=design/emilkowalski/emil-design-eng/SKILL.md lines=1:20
@source rel-rev title="review-animations 소개" path=design/emilkowalski/review-animations/SKILL.md lines=1:20
@source rel-proto title="prototype 소개" path=design/emilkowalski/prototype/SKILL.md lines=1:20
@source rel-jbreak title="jakubkrehel break 소개" path=design/jakubkrehel/break/SKILL.md lines=1:25

## 어떻게 동작하나 {#flow span=12}

그림은 새 점검 흐름 위주다. 이전 보고서에 대한 `fix all`·`fix 1, 3` 호출은 곧장 `수정 후 전 상태 재확인` 단계로 들어간다.[](source:s-var)[](source:s-p6)

@workflow id=flow-diagram title="break-ui 흐름"
| lane prep | 데이터와 전환 스위치 |
| lane test | 검증·보고·수정 |
| ask | 구체적 질문 있나? | backend | prep | source:s-init |
| greet | 고정 문구 후 대기 | external | prep | source:s-init |
| map | 표면·한도 조사 | backend | prep | source:s-p1 |
| build | 최악 fixture 생성 | backend | prep | source:s-p2 |
| toggle | 개발용 전환 스위치 연결 | backend | prep | source:s-p3 |
| dataonly | data only 모드? | backend | test | source:s-var |
| break | 조건별 깨짐 탐색 | backend | test | source:s-p4 |
| report | 3부 보고 후 멈춤 | backend | test | source:s-p5 |
| fixreq | 수정 지시·+ fix? | backend | test | source:s-p6 |
| fix | 수정 후 전 상태 재확인 | external | test | source:s-p6 |
| done | 스위치 유지로 종료 | external | test | source:s-p5 |
| ask > greet | 없음 |
| ask > map | 있음 |
| map > build | |
| build > toggle | |
| toggle > dataonly | |
| dataonly > done | 예 |
| dataonly > break | 아니오 |
| break > report | |
| report > fixreq | |
| fixreq > fix | 요청·+ fix |
| fixreq > done | 없음 |

@steps id=flow-steps
| s-ask | 구체적 질문 있나? | **입력** 사용자 호출과 요청 문구 · **출력** 질문 유무 판단. **처리** 테스트할 컴포넌트나 화면 없이 처음 불렸는지 가른다.[](source:s-init) | flow-diagram | ask |
| s-greet | 고정 문구 후 대기 | **입력** 질문 없는 초기 호출 · **출력** Emil Kowalski 기준 준비 문구 한 줄. **처리** 고정 문구만 출력하고 사용자가 대상을 지정할 때까지 기다린다.[](source:s-init) | flow-diagram | greet |
| s-map | 표면·한도 조사 | **입력** 대상 컴포넌트와 스키마·DB·API 코드 · **출력** 필드별 출처·타입·최대 길이 표. **처리** 렌더링되는 모든 값(개수·타임스탬프·배지·아바타·리스트 길이 포함)을 목록화하고 Zod·Yup·Valibot·DB 마이그레이션·`maxLength`에서 한도를 찾되, 없으면 "no limit found"로 기록한다.[](source:s-p1) | flow-diagram | map |
| s-build | 최악 fixture 생성 | **입력** 표면 조사표와 기존 데모 데이터 · **참조** `CATALOG.md` · **출력** 최악 데이터 `fixture`와 빈 상태·1개·1,000개 이상 상태. **처리** 카탈로그 8개 갈래에서 현실적이거나 스키마 한도에 맞는 최악 값을 뽑아 여러 행에 분산 배치하고, `Empty`·`One`·`Huge` 상태를 빠뜨리지 않고 만든다.[](source:s-p2)[](source:s-hard)[](source:c-intro)[](source:c-text)[](source:c-data) | flow-diagram | build |
| s-toggle | 개발용 전환 스위치 연결 | **입력** 데모 `fixture`와 최악 `fixture` · **출력** 하단 중앙 고정 전환 스위치. **처리** 컴포넌트 코드는 건드리지 않고 데이터 경계에서 전환하는 개발 전용 세그먼트 컨트롤(`?data=worst` URL 유지 또는 단독 HTML)을 붙인다.[](source:s-p3)[](source:s-hard) | flow-diagram | toggle |
| s-dataonly | data only 모드? | **입력** 호출 문구(`data only <component>` 여부) · **출력** 검증·보고 진행 여부. **처리** 사용자가 `fixture`와 전환 스위치만 요청했는지 확인한다.[](source:s-var) | flow-diagram | dataonly |
| s-break | 조건별 깨짐 탐색 | **입력** 전환 스위치가 연결된 UI · **참조** `CATALOG.md` · **출력** 깨짐 목록과 원인·수정안. **처리** 실제 컨테이너 너비·`320px`·최대 너비·`200%` 확대·다크 모드·`RTL`을 점검하고, 19종 깨짐 징후표와 줄바꿈·말줄임 기준에 맞춰 원인 및 수정안을 짝짓는다.[](source:s-p4)[](source:s-sig)[](source:c-env) **다음** 브라우저 도구가 있으면 스크린샷으로 확인하고, 없으면 CSS 추론임을 보고서에 구분한다.[](source:s-p4) | flow-diagram | break |
| s-report | 3부 보고 후 멈춤 | **입력** 탐색된 깨짐과 견딘 항목 · **출력** 3부 보고서(`What broke`, `Decisions for you`, `What held up`). **처리** 심각도(`Broken`·`Ugly`·`Fragile`)와 `file:line`을 적어 보고하고 전환 스위치를 켠 채 멈춘다.[](source:s-p5)[](source:s-out) | flow-diagram | report |
| s-fixreq | 수정 지시·+ fix? | **입력** 초기 호출 변형(`+ fix`) 또는 보고 후 사용자 지시(`fix all`, `fix 1, 3`) · **출력** 수정 실행 여부와 범위. **처리** 사용자가 수정을 지시했는지 확인하며, `+ fix` 호출이면 "Decisions for you" 항목을 뺀 수정만 자동 대상으로 잡는다.[](source:s-p6)[](source:s-var) | flow-diagram | fixreq |
| s-fix | 수정 후 전 상태 재확인 | **입력** 승인된 수정 목록 · **출력** 수정 코드와 전 상태 재검증 결과. **처리** 프로젝트 기존 토큰·규칙으로 컴포넌트를 고친 뒤 `Demo`를 포함한 모든 전환 스위치 상태를 다시 돌려 회귀가 없는지 확인한다.[](source:s-p6) **다음** 최악 `fixture`는 회귀 테스트용으로 남기고 전환 스위치는 개발 전용으로 유지한다.[](source:s-p6) | flow-diagram | fix |
| s-done | 스위치 유지로 종료 | **입력** `data only` 완료 또는 수정 지시 없음 · **출력** 전환 스위치 경로 안내 후 종료. **처리** 추가 수정을 하지 않고 전환 스위치 위치와 상태 목록을 남긴 채 마친다.[](source:s-p5)[](source:s-out)[](source:s-var) | flow-diagram | done |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(description). 컴포넌트 스트레스 테스트나 최악 데이터 점검 요청에서 켜진다. 호출 제한 필드는 frontmatter에 없다.[](source:s-fm) |
| 성격 | 현실적 최악 `fixture`와 개발 전용 전환 스위치를 붙여 UI 깨짐을 찾아 보고하고, 요청 시에만 수정하는 적대적 테스트 절차형 스킬이다.[](source:s-init)[](source:s-p5) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#rel-r25} | `emil-design-eng` | 대안 | 역할 경계: 시각 디자인과 인터랙션 완성도 비평은 `emil-design-eng`를 사용한다(사용자 선택).[](source:s-fm)[](source:s-init)[](source:rel-eng) |
| **이 스킬** {#rel-r26} | `review-animations` | 대안 | 역할 경계: 애니메이션과 모션 리뷰는 `review-animations`를 사용한다(사용자 선택).[](source:s-fm)[](source:s-init)[](source:rel-rev) |
| **이 스킬** {#rel-r27} | `prototype` | 대안 | 역할 경계: 컴포넌트 자체를 여러 안으로 재설계하려면 `prototype`을 사용한다(사용자 선택).[](source:s-init)[](source:rel-proto) |
| **이 스킬** {#rel-r44} | `design/jakubkrehel/break` | 대안 | 두 스킬 모두 최악 데이터·시나리오로 UI 깨짐을 테스트하지만 작성자와 방식(전환 스위치 대 임시 격리 페이지)이 다르다(추론).[](source:s-init)[](source:rel-jbreak) |

@architecture id=relation-map title="break-ui와 이어지는 스킬"
| eng | emil-design-eng | backend |
| rev | review-animations | backend |
| proto | prototype | backend |
| jbreak | jakubkrehel/break | backend |
| self | break-ui(이 스킬) | backend |
| self > eng | 대안 | dashed |
| self > rev | 대안 | dashed |
| self > proto | 대안 | dashed |
| self > jbreak | 대안 | dashed |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 초기 응답, 6대 규칙, 6단계 워크플로, 깨짐 징후 19종, 3부 보고서 형식, 호출 변형 4가지 | 스킬이 켜질 때 읽는다. | 구체적 질문 있나?, 고정 문구 후 대기, 표면·한도 조사, 최악 fixture 생성, 개발용 전환 스위치 연결, data only 모드?, 조건별 깨짐 탐색, 3부 보고 후 멈춤, 수정 지시·+ fix?, 수정 후 전 상태 재확인, 스위치 유지로 종료 |
| `CATALOG.md` | 사람 이름·이메일·라벨·숫자·컬렉션·시간·미디어·상태 8갈래 최악 값과 7가지 환경 조건 | 2단계에서 최악 `fixture`를 조립할 때와 4단계에서 환경 조건을 점검할 때 읽는다.[](source:s-p2)[](source:c-env) | 최악 fixture 생성, 조건별 깨짐 탐색 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 구체적 질문 없이 스킬이 처음 켜진 경우 | 고정 문구 한 줄만 출력하고 대상을 지정할 때까지 멈춘다. | [](source:s-init) |
| 최악 데이터 값 선택 | 무작위 반복 문자는 금지다. 현실적인 값 또는 스키마·DB·API 실제 한도만 쓰며, 한도가 없으면 "no limit found"로 보고한다. | [](source:s-posture)[](source:s-hard) |
| 이메일·URL 테스트 주소 | 실제 수신함이나 사이트로 연결되지 않게 `example.com`, `example.org`, `.test` 도메인만 사용한다. | [](source:c-intro) |
| 컴포넌트 수정과 전환 스위치 격리 | 2·3단계에서는 마크업·CSS를 직접 고치지 않고 데이터 경계에서만 바꾸며, 전환 스위치는 개발 환경에만 두고 배포에 넣지 않는다. | [](source:s-hard) |
| 보고와 수정의 분리 | 5단계 3부 보고서를 출력한 뒤 반드시 멈추며, `fix all`, `fix 1, 3`, `+ fix` 요청이 있을 때만 고친다. | [](source:s-hard)[](source:s-p5) |
| 저장소 파일 안의 프롬프트 주입 문구 | 저장소 콘텐츠는 데이터로만 취급하고, 지시를 덮어쓰려는 문구를 만나면 지적만 남기고 지나간다. | [](source:s-hard) |
| 수정 적용 후 검증 범위 | 최악 데이터뿐 아니라 `Demo` 상태를 포함한 모든 전환 스위치 상태를 다시 확인한다. | [](source:s-p6) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- `CATALOG.md` 최악 값과 예약 도메인 8갈래 — 최악 fixture 생성 · 사람 이름 16종, 이메일·URL 9종, 숫자·컬렉션·시간·이미지·상태별 깨짐 원인을 개요에서 묶어 적었다.
- 깨짐 징후 19종과 줄바꿈·말줄임 기준 — 조건별 깨짐 탐색 · `flex-shrink: 0`, `min-width: 0`, `overflow-wrap: anywhere`, `Intl.Segmenter` 등 증상-원인-수정 19쌍을 뺐다.
- 3부 보고서 상세 형식과 호출 변형 — 3부 보고 후 멈춤 · `Broken`/`Ugly`/`Fragile` 판정 예시와 `+ fix`, `data only` 동작 차이를 개요에서 줄였다.

@callout level=open-question title="확인하지 못한 것"
| 브라우저 스크린샷 도구가 없는 환경에서 CSS 추론만으로 보고한 항목은 실제 브라우저 렌더링 결과와 차이가 있을 수 있으며, 분석 중에도 실행 검증은 하지 않았다.[](source:s-p4) |

읽은 원본: 텍스트 파일 2개. 제외: `SKILL.ko.stale.md`, `CATALOG.ko.stale.md`(낡은 번역본이라 읽지 않음).
