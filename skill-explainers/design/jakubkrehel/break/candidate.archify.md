# break 스킬은 에이전트를 어떻게 바꾸나 {#break-skill}

`break`를 쓰면 에이전트는 컴포넌트 하나를 골라, 그 컴포넌트에 실제로 닿을 수 있는 모든 시나리오로 임시 페이지에 나란히 그린다. 그 페이지가 결과물이다. 에이전트는 페이지를 한 번만 보고, 눈에 띄게 깨진 것만 표로 보고한 뒤 멈춘다.[](source:bk-intro)[](source:bk-s4)[](source:bk-s5)

- 켜지는 때: 사용자가 직접 `break`를 부를 때만이다. `disable-model-invocation: true`가 걸려 있다.[](source:bk-fm)[](source:bk-yaml)
- 강제하는 것: 한 번에 컴포넌트 하나만 다룬다. 프로젝트의 진짜 컴포넌트를 건드리지 않고 import하고, harness가 더하는 것은 라벨, 컨테이너 폭, fixture props뿐이다. 눈으로 본 것만 보고하고 판정은 하지 않는다.[](source:bk-s1)[](source:bk-s3)[](source:bk-s5)
- 끝나는 때: 보고서를 내면 끝이다. 실행 전체가 "분 단위"이고 두 번째 패스를 정당화하는 일은 없다고 한다. 고치는 일은 사용자가 요청할 때만 한다. 페이지는 사용자가 다 봤다고 말할 때만 지운다.[](source:bk-intro)[](source:bk-s5)[](source:bk-s6)
- 쓰면 안 되는 때: 코드를 기준에 맞춰 리뷰하는 일(`interface-review`, `better-interface`), 디자인 대안 탐색(`variant`), 상태를 하나씩 작업하는 일(`state-machine`)이다. 원문이 그 일을 각 스킬의 몫으로 가른다.[](source:bk-intro)

@answer scope="design/jakubkrehel/break · 원본 텍스트 3개 10,689B · 커밋 0465878 · 관계 확인용으로 다른 스킬 frontmatter 4개 · 지시는 읽기만 하고 실행하지 않음 · 지시상 동작"
@meta locale=ko
@source bk-fm title="design/jakubkrehel/break/SKILL.md · 6145B · 지시 본문과 frontmatter" path=design/jakubkrehel/break/SKILL.md lines=1:5
@source bk-intro title="SKILL.md · 하는 일, 관찰만 한다는 선, 시간 예산" path=design/jakubkrehel/break/SKILL.md lines=9:15
@source bk-s1 title="SKILL.md · 1단계 컴포넌트 하나로 범위 잡기" path=design/jakubkrehel/break/SKILL.md lines=17:21
@source bk-s2 title="SKILL.md · 2단계 컴포넌트에서 시나리오 추론" path=design/jakubkrehel/break/SKILL.md lines=23:29
@source bk-s3 title="SKILL.md · 3단계 harness 페이지 만들기" path=design/jakubkrehel/break/SKILL.md lines=31:41
@source bk-s4 title="SKILL.md · 4단계 한 번만 보기" path=design/jakubkrehel/break/SKILL.md lines=43:49
@source bk-s5 title="SKILL.md · 5단계 깨진 것을 보고하고 멈춤" path=design/jakubkrehel/break/SKILL.md lines=51:64
@source bk-s5t title="SKILL.md · 5단계 보고 표 예" path=design/jakubkrehel/break/SKILL.md lines=53:58
@source bk-s6 title="SKILL.md · 6단계 페이지를 남기고 요청 시 삭제" path=design/jakubkrehel/break/SKILL.md lines=66:68
@source bk-check title="SKILL.md · 끝내기 전 점검 표" path=design/jakubkrehel/break/SKILL.md lines=70:85
@source bk-yaml title="design/jakubkrehel/break/agents/openai.yaml · 166B · 표시 이름과 암시 호출 정책" path=design/jakubkrehel/break/agents/openai.yaml lines=1:6
@source sc-intro title="design/jakubkrehel/break/scenarios.md · 4378B · 시나리오 축 목록" path=design/jakubkrehel/break/scenarios.md lines=1:5
@source sc-len title="scenarios.md · Content length 축" path=design/jakubkrehel/break/scenarios.md lines=7:19
@source sc-shape title="scenarios.md · Content shape 축" path=design/jakubkrehel/break/scenarios.md lines=21:33
@source sc-qty title="scenarios.md · Quantity 축" path=design/jakubkrehel/break/scenarios.md lines=35:46
@source sc-con title="scenarios.md · Container 축" path=design/jakubkrehel/break/scenarios.md lines=48:58
@source sc-state title="scenarios.md · State 축" path=design/jakubkrehel/break/scenarios.md lines=60:72
@source sc-env title="scenarios.md · Environment 축" path=design/jakubkrehel/break/scenarios.md lines=74:78
@source vr-fm title="design/jakubkrehel/variant/SKILL.md · 확인용 frontmatter" path=design/jakubkrehel/variant/SKILL.md lines=1:5
@source sm-fm title="design/jakubkrehel/state-machine/SKILL.md · 확인용 frontmatter" path=design/jakubkrehel/state-machine/SKILL.md lines=1:5
@source ir-fm title="design/jakubkrehel/interface-review/SKILL.md · 확인용 frontmatter" path=design/jakubkrehel/interface-review/SKILL.md lines=1:5
@source bi-fm title="design/jakubkrehel/better-interface/SKILL.md · 확인용 frontmatter" path=design/jakubkrehel/better-interface/SKILL.md lines=1:4

## 언제 켜지고, 언제 다른 스킬로 가야 하나 {#trigger}

@code source=bk-fm language=yaml

- `SKILL.md`: `disable-model-invocation: true`가 있다. 모델은 이 스킬을 스스로 고를 수 없고 사용자가 직접 불러야 한다.[](source:bk-fm)
- `agents/openai.yaml`: `allow_implicit_invocation: false`가 있다. 같은 제한이 한 번 더 적혀 있다.[](source:bk-yaml)

판정: 직접 호출만 받으므로 시작점은 항상 사람이다. 시작한 뒤에도 요청에 컴포넌트가 여럿이면 후보를 나열하고 어느 것을 시험할지 물으라고 한다. 근거는 위 두 제한과 1단계다.[](source:bk-s1)

원문은 이 스킬을 "관찰하는 스킬"이라고 규정한다. 발견은 페이지에서 눈에 띄게 깨진 것이고, 고칠 도메인 스킬의 어휘로 이름만 붙인다.[](source:bk-intro) 아래 일은 다른 스킬의 몫이라고 이름을 들어 가른다.

| 하려는 일 | `break` 대신 | 그 스킬의 호출 조건 |
| --- | --- | --- |
| 코드를 기준에 맞춰 리뷰한다 | `interface-review`, `better-interface` {caution:범위 밖} | `interface-review`는 `disable-model-invocation: true`. `better-interface`는 호출 제한 필드 없음[](source:ir-fm)[](source:bi-fm) |
| 디자인 대안을 탐색한다 | `variant` {caution:범위 밖} | `disable-model-invocation: true`[](source:vr-fm) |
| 컴포넌트의 상태를 하나씩 작업한다 | `state-machine` {caution:범위 밖} | `disable-model-invocation: true`[](source:sm-fm) |

`variant`와의 차이는 격리 여부다. `variant`는 실제 페이지를 고집하지만 `break`는 일부러 컴포넌트를 격리한다. 맥락 속 모양이 아니라 최악 내용에서 스스로를 지키는지를 보기 때문이다.[](source:bk-intro) 같은 이유로 `state-machine`은 상태를 하나씩 작업하고, `break`는 적대적 시나리오를 한 페이지에 쌓는다.[](source:bk-intro)

## 어떤 순서로 만들고, 어디서 멈추나 {#workflow}

전체가 "build, look once, report"이고 시간은 분 단위다. 계측, 브라우저 디버깅, 두 번째 패스를 정당화하는 일은 이 흐름에 없다고 원문이 적는다.[](source:bk-intro)

@workflow id=break-flow title="break 6단계"
| lane plan | 계획 |
| lane page | 페이지 |
| lane report | 보고 |
| bk-scope | 1 컴포넌트 하나 | backend | plan |
| bk-infer | 2 시나리오 추론 | backend | plan |
| bk-build | 3 harness 페이지 | backend | page |
| bk-browser | 브라우저가 손 닿는 곳에 있나? | external | page |
| bk-look | 4 한 번 보기 | backend | page |
| bk-url | URL과 시나리오 목록만 | backend | report |
| bk-report | 5 표로 보고하고 멈춤 | backend | report |
| bk-keep | 6 페이지를 남김 | backend | report |
| bk-scope > bk-infer | |
| bk-infer > bk-build | 한 줄씩 적은 뒤 |
| bk-build > bk-browser | |
| bk-browser > bk-look | 있음 |
| bk-browser > bk-url | 없음 | dashed |
| bk-look > bk-report | 페이지에 표시 | emphasis |
| bk-report > bk-keep | |
| bk-url > bk-keep | |

@steps id=break-steps
| bk-scope | 1 컴포넌트 하나 | 한 번에 컴포넌트 하나만 다룬다. "설정 페이지"는 컴포넌트가 아니고 "프로필 폼의 text input"은 컴포넌트다. 여러 개가 걸리면 후보를 나열하고 어느 것을 시험할지 묻는다. 그다음 그 컴포넌트가 무엇을 받고, 무엇을 그리고, 어디에 놓일지를 한 문장으로 다시 말한다.[](source:bk-s1) | break-flow | bk-scope |
| bk-infer | 2 시나리오 추론 | 변하는 것만 시험한다. props, slot, 상태, 그리는 데이터를 먼저 읽고, `scenarios.md`의 축마다 단서(cue)가 맞는지 대조해 맞는 축만 남긴다. 남긴 시나리오를 한 줄씩 먼저 적고, 버린 축과 이유도 한 줄로 말해서 잘못된 추론을 싸게 잡게 한다.[](source:bk-s2) | break-flow | bk-infer |
| bk-build | 3 harness 페이지 | 시나리오마다 컴포넌트를 한 번씩 한 열에 그리고, 인스턴스 위에 짧은 텍스트 라벨을 단다. 앱 안의 임시 route에 프로젝트의 진짜 컴포넌트를 손대지 않고 import한다. 서버·클라이언트 컴포넌트를 나누는 framework에서는 페이지를 client 코드(Next의 `"use client"`)로 쓴다. 경계를 넘다가 fixture 데이터가 사라지는 일을 막기 위해서다.[](source:bk-s3) | break-flow | bk-build |
| bk-browser | 브라우저가 손 닿는 곳에 있나? | 이미 열려 있는 브라우저가 있으면 거기서 본다. 없으면 없다고 말하고 URL을 사용자에게 넘긴다. 브라우저를 띄우거나, 창을 다루거나, 디버깅하는 일은 예산 밖이다.[](source:bk-s4) | break-flow | bk-browser |
| bk-look | 4 한 번 보기 | 페이지를 한 번 로드하고 위에서 아래로 훑으며 눈에 띄게 깨진 것을 적는다. "텍스트가 필드의 오른쪽 가장자리를 넘는다"처럼 쓰고, "간격이 빡빡하다"는 쓰지 않는다. 예측한 실패는 발견이 아니다. 본 깨짐은 해당 시나리오 라벨 아래에 한 줄 메모로 한 번의 edit에 표시해서, 페이지만 보고도 보고서처럼 읽히게 한다.[](source:bk-s4) | break-flow | bk-look |
| bk-url | URL과 시나리오 목록만 | 본 적이 없으므로 보고는 URL과 시나리오 목록뿐이다. 발견 표도 페이지 메모도 없다.[](source:bk-s4) | break-flow | bk-url |
| bk-report | 5 표로 보고하고 멈춤 | 발견을 표로 보고하고 깨진 시나리오를 먼저 적는다. 열은 Scenario, Observed, Owner다. 도메인 규칙은 소유하지 않고 판정도 내리지 않는다. "전부 버텼다"도 완전하고 쓸모 있는 보고다. 페이지에 오른 시나리오와 실행 중인 곳을 말하고 끝낸다.[](source:bk-s5) | break-flow | bk-report |
| bk-keep | 6 페이지를 남김 | 페이지는 보고서의 절반이므로 보고 뒤에도 실행 중으로 둔다. 사용자가 다 봤다고 말하면 그때 페이지와 fixture를 지우고, route 이름과 fixture 이름을 검색해 diff에 harness가 남지 않았는지 확인한다.[](source:bk-s6) | break-flow | bk-keep |

멈추는 지점은 5단계 보고 뒤 한 곳이다. 고치라는 요청이 오면 그때 owner 스킬의 규칙으로 고치고, 실패했던 시나리오만 다시 그려 확인한다.[](source:bk-s5)

사람이 개입하는 곳은 세 군데다.

- 1단계: 요청에 컴포넌트가 여럿이면 사용자가 하나를 고른다.[](source:bk-s1)
- 4단계: 브라우저가 없으면 사용자가 URL을 열어 직접 확인한다.[](source:bk-s4)
- 6단계: 사용자가 다 봤다고 말해야 페이지를 지운다.[](source:bk-s6)

## 어떤 시나리오를 그리나 {#scenarios}

시나리오는 모든 컴포넌트에 같은 것을 던지지 않고 컴포넌트에서 추론한다.[](source:bk-s2)

- text input은 content length와 state를 얻고 item quantity는 얻지 못한다.[](source:bk-s2)
- 고정 라벨이 붙은 static icon button은 container와 environment만 얻고 긴 텍스트는 얻지 못한다.[](source:bk-s2)
- 축이 남으면 `scenarios.md`의 시나리오를 그대로 쓰고, 컴포넌트의 props가 더 나쁘게 만드는 값(예: 실제 데이터셋에서 가장 긴 옵션)은 fixture로 더한다.[](source:sc-intro)

| 축 | 남기는 단서(cue) | 시나리오 | 깨짐의 owner |
| --- | --- | --- | --- |
| Content length | 컴포넌트가 직접 쓰지 않은 텍스트를 그린다(사용자 입력, CMS, API, 번역). 코드베이스가 정한 고정 라벨은 해당 없음[](source:sc-len) | 빈 문자열, 한 단어, 일반 내용, 여러 문장, 줄바꿈 기회 없는 긴 문자열(긴 URL, `Donaudampfschiffahrtsgesellschaft`) | `better-typography`(줄바꿈·말줄임), `better-layout`(컨테이너에 공간이 없을 때), `better-writing`(원문 카피가 문제일 때) |
| Content shape | 팀이 쓰지 않는 언어·사용자에게서 텍스트가 올 수 있다[](source:sc-shape) | emoji(단독, 섞임), RTL, 혼합 방향, 발음 부호와 키 큰 문자, 열을 맞추는 숫자 | `better-typography`, 공간 반전은 `better-layout` |
| Quantity | 컴포넌트가 항목을 반복한다(목록, 표, grid, tag 줄, avatar 묶음). 단일 컴포넌트는 해당 없음[](source:sc-qty) | 0개, 1개, 현실적인 개수, 현실적인 개수의 10배 | 0개는 `better-writing`(빈 상태)과 `better-layout`(영역), 나머지는 `better-layout` |
| Container | 항상 해당한다. 컴포넌트는 컨테이너 폭을 고르지 못한다[](source:sc-con) | 320px 컨테이너, flex·grid 형제에 눌린 폭, 아주 넓은 컨테이너 | `better-layout` |
| State | 컴포넌트가 그 상태를 가진다. props로 들어오는 상태만 그린다. static 컴포넌트는 해당 없음[](source:sc-state) | loading, error, disabled | `better-accessibility`, 순수 시각 상태 다듬기는 `better-ui` |
| Environment | 프로젝트가 그 모드를 지원한다[](source:sc-env) | 페이지에는 그리지 않는다. OS 다크 모드, 브라우저 확대, reduced motion을 보고서에 이름만 적어 사용자가 보면서 켜게 한다 | 다크 모드는 `better-colors`, 확대와 모션은 `better-accessibility` |

각 축이 잡는 것은 원문의 `What it catches` 칸에 적혀 있다. 대표 예만 옮긴다.[](source:sc-len)[](source:sc-shape)[](source:sc-qty)[](source:sc-con)[](source:sc-state)

| 시나리오 | 잡는 것 |
| --- | --- |
| 빈 문자열 | 무너진 상자, 띄울 내용이 없는 floating label, placeholder만 있는 input |
| 줄바꿈 기회 없는 긴 문자열 | wrap 없는 overflow |
| 발음 부호와 키 큰 문자 | 좁은 line box에서 잘린 ascender·descender |
| 숫자(열 맞춤) | 표와 타이머에서 흔들리는 비례폭 숫자 |
| 10배 개수 | 없는 scroll·pagination, 성능 붕괴, sticky 요소가 풀림 |
| 320px 컨테이너 | clipping, 가로 scroll, 상자를 벗어난 컨트롤 |
| loading | 내용이 도착할 때 layout shift, 접근 가능한 이름 없는 spinner |

State 축에서 focus와 hover는 에이전트가 harness에서 흉내 내지 않는다. 사용자가 페이지를 보면서 직접 해 보도록 보고서에서 tab으로 인스턴스를 돌아보라고 권한다.[](source:sc-state) Environment 축을 페이지에서 흉내 내는 것(예: class 아래에 다크 token을 다시 선언)은 다른 컴포넌트를 관찰하는 일이라고 원문이 못 박는다.[](source:sc-env)

## 무엇을 강제하고 금지하나 {#rules}

harness가 더해도 되는 것은 "라벨, 컨테이너 폭, fixture props"뿐이다. 이 선이 `break`의 핵심 규칙이다.[](source:bk-s3) 아래 표는 3단계와 점검 표를 합친 것이다.

| 규칙 | 에이전트가 하는 일 | 하지 않는 일 |
| --- | --- | --- |
| 진짜 컴포넌트 | 프로젝트에서 import한 그대로 쓴다[](source:bk-s3)[](source:bk-check) | {bad:비슷하게 다시 만든 컴포넌트} |
| 페이지가 더하는 것 | 라벨, 컨테이너 폭, fixture props만 더한다. 앱의 layout, 글꼴, 전역 스타일, provider를 그대로 물려받는다[](source:bk-s3) | {bad:harness 자체의 글꼴·스타일, 흉내 낸 theme, token 교체, probe} |
| 데이터 방향 | 시나리오를 props와 fixture 데이터로 넣는다[](source:bk-s3) | production 상태 import, live 데이터 연결, production이 harness를 import하는 일 |
| 폭 | 폭은 페이지 안의 고정 컨테이너로 두어 한 번 로드로 모두 본다[](source:bk-check)[](source:sc-con) | 시나리오마다 viewport를 바꾸기 |
| 관찰 | 눈에 띄게 본 것만 적는다. "텍스트가 필드의 오른쪽 가장자리를 넘는다"[](source:bk-s4) | {bad:예측한 실패를 발견으로 보고}, 취향 표현으로 쓴 발견 |
| 보고 | 깨진 것마다 owner(고칠 도메인 스킬)를 적는다. 판정은 내리지 않는다[](source:bk-s5)[](source:bk-check) | owner 없는 깨짐 |
| 깨끗한 결과 | "전부 버텼다"와 시나리오 목록이 보고의 전부다[](source:bk-s5) | 제안으로 채우기 |
| 수정 | 요청이 올 때만 owner 스킬의 규칙으로 고치고 실패한 시나리오를 다시 그린다[](source:bk-s5) | {bad:묻지 않은 수정} |
| 페이지 | 사용자가 말하기 전에는 지우지 않는다[](source:bk-s6) | 보고와 같은 턴에 삭제 |

아래는 원문이 보고 표의 모양으로 든 예 두 행이다. 이 컴포넌트를 실제로 본 결과가 아니라 형식 예시다.[](source:bk-s5t)

| Scenario | Observed | Owner |
| --- | --- | --- |
| 줄바꿈 기회 없는 60자 문자열 | 카드를 넘친다. wrap도 말줄임도 없다 | `better-typography` |
| 항목 0개 | 메시지 없이 빈 영역 | `better-writing` |

점검 표 12줄은 대부분 위 규칙을 되풀이한다. 위 표에 없는 처방은 둘이다. 첫째, 시나리오에 내용이 안 들어온 것은 컴포넌트가 아니라 harness 문제이므로, 페이지를 client 코드로 만들고 한 번만 다시 로드한다. 둘째, 깨짐이 표에는 있는데 페이지에 표시가 없으면 라벨 아래에 메모를 단다.[](source:bk-check)

## 흐름 속 위치 {#position}

`break`는 묶음 `component-workbench`에 속한다. 같은 묶음의 `variant`, `state-machine`과 순서로 이어지지 않는다. 원장의 관계는 모두 역할을 가르는 참고다.

- 들어오는 관계: `variant`(r106), `state-machine`(r122), 묶음 밖의 `build-design`(r143).
- 셋 다 "스트레스 테스트는 `break`의 몫"이라는 구분이다.

@workflow id=break-position title="break 앞뒤"
| pos-user | 사용자가 컴포넌트 지정 | external |
| pos-break | break | backend |
| pos-page | 임시 페이지와 보고 표 | external |
| pos-owner | owner 스킬 | backend |
| pos-user > pos-break | 직접 호출 | emphasis |
| pos-break > pos-page | 한 번 본 뒤 | emphasis |
| pos-page > pos-owner | 고치라는 요청이 있을 때 | dashed |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| 사용자(앞) | 시험할 컴포넌트 하나 | - | 직접 호출만 받는다. 컴포넌트가 여럿이면 되묻는다[](source:bk-fm)[](source:bk-s1) | - |
| `interface-review` | - | - | 참고. 코드를 기준에 맞춰 리뷰하는 일은 그쪽 몫이다[](source:bk-intro)[](source:ir-fm) | r112 |
| `better-interface` | - | - | 참고. 기준에 맞춘 리뷰는 그쪽 몫이다[](source:bk-intro) | r113 |
| `variant` | - | - | 참고. 대안 탐색은 그쪽 몫이다. `variant`는 실제 페이지를, `break`는 격리를 고집한다[](source:bk-intro) | r114 |
| `state-machine` | - | - | 참고. 상태를 하나씩 작업하는 일은 그쪽 몫이다. `break`는 시나리오를 한 페이지에 쌓는다[](source:bk-intro) | r115 |
| `better-typography` 외 5개 | - | 깨짐 이름(owner) | 참고. 깨짐을 고칠 도메인 스킬의 어휘로 이름을 붙일 뿐 호출 지시는 아니다. 단 고치라는 요청이 오면 그 owner 스킬의 규칙을 따른다[](source:bk-intro)[](source:bk-s5)[](source:sc-len) | r116~r121 |
| (뒤) | - | 임시 페이지, 보고 표, 시나리오 목록 | 받는 쪽은 사용자다[](source:bk-s5)[](source:bk-s6) | - |

그림에는 점선 하나만 그렸다. 고치라는 요청이 왔을 때 owner 스킬로 간다는 줄(5단계)이다. 나머지 r112~r115는 역할 구분이라 표에만 둔다.

같은 계열(r149)인 `break-ui`(`design/emilkowalski/break-ui`)는 목적이 같지만 서로 부르지 않는다. 원장은 이 관계를 추론으로 적었다. `break-ui`의 내용은 이 페이지에서 읽지 않았다.

묶음 전체는 `design/_group-component-workbench/component-workbench.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 3개(`SKILL.md`, `scenarios.md`, `agents/openai.yaml`), 합계 10,689B다. 세 파일을 끝까지 읽었다.
- 관계 확인용으로 `variant`, `state-machine`, `interface-review`, `better-interface`의 `SKILL.md` frontmatter(각 4~5줄)만 읽었다. 위 개수에는 넣지 않았다.
- 구조·표본만 확인한 파일: 없음. 바이너리: 없음. 제외한 파일: 없음. 번역본은 없다.
- 다른 컬렉션에 이름이 같은 스킬은 없다. 같은 계열로 `break-ui`가 있고(원장 r149) 내용은 다르다.
- 원문 대조 범위: 활성화 제한 2곳, 단계 6개, 보고 표 열 3개, 시나리오 축 6개와 단서 6개와 시나리오 20개(Environment 3개는 페이지에 그리지 않음), 점검 표 12행, "분 단위"와 "한 번 로드"와 "한 번 보기" 같은 예산 문구를 대조했다. 관계 행 r112~r121은 원장과 원문이 같다. r116~r121은 원장이 "호출 지시는 아니다"라고 적었는데, 5단계의 "고치라는 요청에는 owner 스킬의 규칙을 따른다"는 조건부 문장이 있어 이 페이지가 그 조건을 더했다.
- 분석 중 바뀐 파일: 없음. `design/` 작업 트리는 commit `0465878` 그대로다.

@callout level=open-question title="확인하지 못한 것"
- 이 스킬이 실제로 에이전트의 동작을 바꾸는지는 실행해 보지 않아 확인하지 않았다. 페이지의 모든 동작은 지시상 동작이다.
- 브라우저가 "손 닿는 곳"에 있다는 기준이 무엇인지(이미 열린 탭, 사용 가능한 도구 등)는 `원문에 명시 없음`이다.[](source:bk-s4)
- 사용자가 고치기를 요청했을 때 어떤 owner 스킬을 어떻게 실행하는지(skill 호출인지 규칙만 읽는지)는 `원문에 명시 없음`이다. owner 스킬이 설치되어 있지 않을 때의 동작도 같다.[](source:bk-s5)
- 임시 route를 만들 framework가 없는 프로젝트(정적 HTML 등)에서 harness를 어떻게 만드는지는 `원문에 명시 없음`이다.[](source:bk-s3)
