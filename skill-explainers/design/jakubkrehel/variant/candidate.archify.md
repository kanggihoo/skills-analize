# variant 스킬은 에이전트를 어떻게 바꾸나 {#variant-skill}

`variant`를 부르면 에이전트는 UI 조각 하나를 **의도적으로 다른 버전 3개**로 만들어, 그 조각이 실제로 들어갈 페이지의 선택기(`picker`) 뒤에 둔다. 에이전트는 장단점 표와 선택기 위치를 건네고 멈추며, 순위는 매기지 않는다. 사용자가 하나를 고르면 그 버전을 제대로 다시 만들고 나머지와 선택기를 지운다.[](source:vr-what)[](source:vr-s5f)[](source:vr-s6a)

- 켜지는 때: 사용자가 직접 부를 때만이다. SKILL.md에 `disable-model-invocation: true`가, `agents/openai.yaml`에 `allow_implicit_invocation: false`가 있다.[](source:vr-fm)[](source:vr-oy)
- 강제하는 것: 주 축 하나만 바꾼다. 모든 버전이 바닥 규칙 11개를 통과한다. 한 번에 한 버전을 원래 크기로 본다.[](source:vr-one)[](source:vr-floor-rule)[](source:vr-s4b)
- 하지 않는 것: 즐겨찾기 표시, 기존 UI 리뷰, 스트레스 테스트, 상태별 작업이다.[](source:vr-s5f)[](source:vr-split)
- 멈추는 때: 장단점 표를 건넨 직후다. 승격과 삭제는 사용자가 고른 뒤에 한다.[](source:vr-s5t)[](source:vr-s6a)

@answer scope="design/jakubkrehel/variant · 텍스트 3개 14,042B · 커밋 0465878 · 지시상 동작"
@meta locale=ko
@source vr-fm title="design/jakubkrehel/variant/SKILL.md · 6848B · 지시 본문과 frontmatter" path=design/jakubkrehel/variant/SKILL.md lines=1:5
@source vr-what title="SKILL.md · 하는 일 한 가지" path=design/jakubkrehel/variant/SKILL.md lines=9:9
@source vr-split title="SKILL.md · 다른 스킬의 몫" path=design/jakubkrehel/variant/SKILL.md lines=11:11
@source vr-axes title="SKILL.md · 축 다섯 개와 담당 스킬" path=design/jakubkrehel/variant/SKILL.md lines=15:23
@source vr-one title="SKILL.md · 주 축은 하나" path=design/jakubkrehel/variant/SKILL.md lines=25:25
@source vr-floor-list title="SKILL.md · 바닥 규칙 목록" path=design/jakubkrehel/variant/SKILL.md lines=29:41
@source vr-floor-rule title="SKILL.md · 바닥 규칙은 모든 버전에 같다" path=design/jakubkrehel/variant/SKILL.md lines=43:43
@source vr-s1 title="SKILL.md · 1단계 조각 하나로 좁히기" path=design/jakubkrehel/variant/SKILL.md lines=47:49
@source vr-s2 title="SKILL.md · 2단계 바탕 읽기" path=design/jakubkrehel/variant/SKILL.md lines=53:60
@source vr-s3 title="SKILL.md · 3단계 코드 전에 축 정하기" path=design/jakubkrehel/variant/SKILL.md lines=64:68
@source vr-s4a title="SKILL.md · 4단계 실제 페이지와 URL param" path=design/jakubkrehel/variant/SKILL.md lines=72:74
@source vr-s4b title="SKILL.md · 4단계 한 번에 하나, import 규칙, 대체 방법" path=design/jakubkrehel/variant/SKILL.md lines=76:80
@source vr-s4c title="SKILL.md · 4단계 현실적인 내용" path=design/jakubkrehel/variant/SKILL.md lines=82:82
@source vr-s5a title="SKILL.md · 5단계 브라우저로 확인" path=design/jakubkrehel/variant/SKILL.md lines=86:86
@source vr-s5t title="SKILL.md · 5단계 장단점 표" path=design/jakubkrehel/variant/SKILL.md lines=88:93
@source vr-s5b title="SKILL.md · 5단계 알려 줄 것" path=design/jakubkrehel/variant/SKILL.md lines=95:95
@source vr-s5f title="SKILL.md · 5단계 favourite 금지" path=design/jakubkrehel/variant/SKILL.md lines=97:97
@source vr-s6a title="SKILL.md · 6단계 고르면 승격하고 삭제" path=design/jakubkrehel/variant/SKILL.md lines=101:101
@source vr-s6b title="SKILL.md · 6단계 한 번 더 요청하면" path=design/jakubkrehel/variant/SKILL.md lines=103:103
@source vr-mis title="SKILL.md · 마무리 전 실수 표" path=design/jakubkrehel/variant/SKILL.md lines=107:117
@source pk-out title="design/jakubkrehel/variant/picker.md · 7042B · 선택기 규격" path=design/jakubkrehel/variant/picker.md lines=3:9
@source pk-list title="picker.md · 그룹 목록" path=design/jakubkrehel/variant/picker.md lines=11:16
@source pk-beh title="picker.md · 동작 규칙" path=design/jakubkrehel/variant/picker.md lines=18:26
@source pk-place title="picker.md · 배치와 수치" path=design/jakubkrehel/variant/picker.md lines=62:71
@source pk-btn title="picker.md · 버튼 CSS" path=design/jakubkrehel/variant/picker.md lines=120:142
@source pk-cq title="picker.md · 컨테이너 쿼리" path=design/jakubkrehel/variant/picker.md lines=181:202
@source pk-end title="picker.md · 프레임워크에서의 변환" path=design/jakubkrehel/variant/picker.md lines=205:205
@source vr-oy title="design/jakubkrehel/variant/agents/openai.yaml · 152B · 호출 정책" path=design/jakubkrehel/variant/agents/openai.yaml lines=1:5
@source bi-fm title="design/jakubkrehel/better-interface/SKILL.md · r105 확인용 frontmatter" path=design/jakubkrehel/better-interface/SKILL.md lines=1:4
@source bi-trig title="better-interface/SKILL.md · r105 확인용 escalation trigger 13개" path=design/jakubkrehel/better-interface/SKILL.md lines=77:91
@source ir-fm title="design/jakubkrehel/interface-review/SKILL.md · r104 확인용 frontmatter" path=design/jakubkrehel/interface-review/SKILL.md lines=1:5
@source br-fm title="design/jakubkrehel/break/SKILL.md · r106 확인용 frontmatter" path=design/jakubkrehel/break/SKILL.md lines=1:5
@source br-split title="break/SKILL.md · r114 확인용 역할 구분" path=design/jakubkrehel/break/SKILL.md lines=11:13
@source sm-fm title="design/jakubkrehel/state-machine/SKILL.md · r107 확인용 frontmatter" path=design/jakubkrehel/state-machine/SKILL.md lines=1:5
@source sm-split title="state-machine/SKILL.md · r123 확인용 역할 구분" path=design/jakubkrehel/state-machine/SKILL.md lines=11:11
@source bl-fm title="design/jakubkrehel/better-layout/SKILL.md · r108 확인용 frontmatter" path=design/jakubkrehel/better-layout/SKILL.md lines=1:4
@source bc-fm title="design/jakubkrehel/better-colors/SKILL.md · r109 확인용 frontmatter" path=design/jakubkrehel/better-colors/SKILL.md lines=1:4
@source bt-fm title="design/jakubkrehel/better-typography/SKILL.md · r110 확인용 frontmatter" path=design/jakubkrehel/better-typography/SKILL.md lines=1:4
@source bw-fm title="design/jakubkrehel/better-writing/SKILL.md · r111 확인용 frontmatter" path=design/jakubkrehel/better-writing/SKILL.md lines=1:4
@source afk-split title="design/jakubkrehel/afk/SKILL.md · r127 확인용 역할 구분" path=design/jakubkrehel/afk/SKILL.md lines=11:11
@source ei-split title="design/jakubkrehel/explain-interface/SKILL.md · r131 확인용 역할 구분" path=design/jakubkrehel/explain-interface/SKILL.md lines=11:11
@source bd-split title="design/jakubkrehel/build-design/SKILL.md · r142 확인용 역할 구분" path=design/jakubkrehel/build-design/SKILL.md lines=12:12
@source pr-fm title="design/emilkowalski/prototype/SKILL.md · r150 확인용 frontmatter" path=design/emilkowalski/prototype/SKILL.md lines=1:5

## 언제 켜지고, 언제 다른 스킬로 가야 하나 {#trigger}

@code source=vr-fm language=yaml

@code source=vr-oy language=yaml

두 파일 모두 암묵 호출을 막는다. 판정: 모델이 `description`만 보고 스스로 켜는 스킬이 아니라 사용자가 직접 불러야 하는 스킬로 읽힌다. 원문은 이 필드가 실행 환경에서 어떻게 처리되는지 설명하지 않는다(`원문에 명시 없음`).[](source:vr-fm)[](source:vr-oy) `description`은 모델이 참고하는 설명이지 정확히 일치해야 하는 사전이 아니다.

입력은 사용자가 서술한 UI 조각 하나다. 호출 인자 형식(`fix` 같은 변형 호출)과 첫 응답 규칙은 `원문에 명시 없음`이다.[](source:vr-what)

원문은 아래 일을 다른 스킬의 몫이라고 이름을 들어 적는다.[](source:vr-split)

| 하려는 일 | 이 스킬 대신 | 그 스킬이 켜지는 방식 |
| --- | --- | --- |
| 이미 있는 UI를 리뷰한다 | `interface-review` {caution:범위 밖} | `disable-model-invocation: true`. 사용자가 직접 불러야 한다[](source:ir-fm) |
| 이미 있는 UI를 리뷰한다(전체 화면·흐름) | `better-interface` {caution:범위 밖} | 호출 제한 필드 없음[](source:bi-fm) |
| 한 컴포넌트를 스트레스 테스트한다 | `break` {caution:범위 밖} | `disable-model-invocation: true`. 사용자가 직접 불러야 한다[](source:br-fm) |
| 컴포넌트의 상태를 하나씩 작업한다 | `state-machine` {caution:범위 밖} | `disable-model-invocation: true`. 사용자가 직접 불러야 한다[](source:sm-fm) |

판정: 명시 호출 스킬 세 개는 모델이 스스로 켤 수 없으므로, 에이전트가 이쪽으로 넘길 때는 사용자에게 그 스킬을 부르라고 안내하는 형태가 된다. 원문은 넘기는 방법을 적지 않는다(`원문에 명시 없음`).

## 어떤 순서로 만들고, 어디서 멈추나 {#workflow}

단계는 번호 6개다. 3단계(축 정하기)는 반복 구간이다. 사용자가 선택 대신 한 번 더를 요청하면 3단계로 돌아간다.[](source:vr-s6b)

@workflow id=variant-flow title="variant 6단계"
| lane scope | 좁히고 읽기 |
| lane build | 만들기 |
| lane pick | 고르기 |
| v-scope | 1 조각 하나 | backend | scope |
| v-ground | 2 바탕 읽기 | backend | scope |
| v-axis | 3 축 정하기 | backend | build |
| v-build | 4 실제 페이지에 넣기 | backend | build |
| v-present | 5 표 주고 멈춤 | backend | build |
| v-choice | 사용자가 골랐나? | external | pick |
| v-promote | 6 승격하고 삭제 | backend | pick |
| v-scope > v-ground | |
| v-ground > v-axis | |
| v-axis > v-build | |
| v-build > v-present | |
| v-present > v-choice | 표 건넴 | emphasis |
| v-choice > v-promote | 골랐다 | emphasis |
| v-choice > v-axis | 한 번 더 | dashed |

@steps id=variant-steps
| v-scope | 1 조각 하나 | UI 조각 하나만 받는다. "대시보드"는 조각이 아니고 "지표 카드"는 조각이다. 요청이 여럿에 걸치면 후보를 나열하고 무엇을 탐색할지 묻는다. 그 뒤 무엇인지, 어디에 그려지는지, 무엇을 해야 하는지를 한 문장으로 다시 적는다.[](source:vr-s1) | variant-flow | v-scope |
| v-ground | 2 바탕 읽기 | 버전이 내일 출시될 수 있어 보이도록 읽는다. 대상은 styling 시스템·컴포넌트 라이브러리·모션 라이브러리, 토큰(색·간격·radius·type scale·easing), 제품의 밀도와 어조, 조각이 놓일 배경·이웃·폭이다. 밀도 높은 전문 도구라면 가장 과감한 버전이 갈 수 있는 거리가 제한된다. 읽을 프로젝트가 없으면 중립 회색, 포인트 색 하나, 시스템 글꼴을 쓰고 그렇게 했다고 말한다.[](source:vr-s2) | variant-flow | v-ground |
| v-axis | 3 축 정하기 | 기본은 3개다. 5개는 사용자가 요청할 때만이다. 코드를 쓰기 전에 이름과 축 위치를 한 줄씩 적는다. 이름은 `Quiet`, `Editorial`, `Dense`처럼 방향을 말하고 `Option A`는 안 된다. 완료 조건은 두 버전이 같은 위치를 쓰지 않고, 버전마다 축을 한 구절로 말할 수 있는 것이다.[](source:vr-s3) | variant-flow | v-axis |
| v-build | 4 실제 페이지에 넣기 | 조각이 들어갈 실제 페이지에 진짜 chrome, 진짜 이웃, 현실적인 데이터와 함께 올린다. 선택은 `?__variant=quiet` 같은 URL search param이라 버전마다 링크가 된다. 한 번에 한 버전을 원래 크기로 그린다. 버전 파일은 프로덕션 컴포넌트를 import해도 되지만 버전을 import하는 곳은 호스팅 페이지뿐이다. 호스팅할 페이지가 없으면 독립 HTML 한 파일에 같은 선택기를 둔다.[](source:vr-s4a)[](source:vr-s4b)[](source:vr-s4c) | variant-flow | v-build |
| v-present | 5 표 주고 멈춤 | 브라우저가 있으면 모든 버전을 넘겨 보고 렌더링·상호작용·콘솔이 깨끗한지 확인한다. 없으면 없다고 말하고 URL을 넘겨 사용자가 확인하게 한다. 이어서 표를 건네고 선택기 위치, 넘기는 키, 판단한 폭을 말한다. `favourite`은 표시하지 않는다.[](source:vr-s5a)[](source:vr-s5t)[](source:vr-s5b)[](source:vr-s5f) | variant-flow | v-present |
| v-choice | 사용자가 골랐나? | 원문은 승격과 삭제를 "선택이 있을 때"로 묶는다. 선택 대신 한 번 더를 요청하면 선택기를 그대로 두고 3단계를 다시 한다. 새 위치는 "기울었던 방향" 주위에서 잡는다.[](source:vr-s6a)[](source:vr-s6b) | variant-flow | v-choice |
| v-promote | 6 승격하고 삭제 | 고른 버전을 프로젝트 관례에 맞춰 제 위치에 제대로 만든다. 그다음 나머지 버전, 선택기, 호스팅 페이지의 버전 import를 지운다. 버전 이름과 `__variant` param을 검색하고 diff에 비교용 장치가 남지 않았는지 확인한다.[](source:vr-s6a) | variant-flow | v-promote |

5단계의 장단점 표는 네 칸이다.[](source:vr-s5t)

| 칸 | 원문 예시 `Quiet` | 원문 예시 `Editorial` |
| --- | --- | --- |
| Axis position | 가장 낮은 시각 무게 | 가장 큰 글자와 가장 많은 여백 |
| Right when | 매일 쓰는 페이지 | 그 순간에 무게를 줄 만할 때 |
| Costs | 가장 기억에 남지 않는다 | 세로 공간을 먹는다 |

알려 줄 것은 세 가지다. 선택기가 도는 곳, 넘기는 키, 판단한 폭이다. 폭에 따라 답이 달라질 수 있어서 원문은 375px과 1440px을 예로 든다.[](source:vr-s5b)

직접 물으면 어떻게 하나. 원문은 "내가 만들면서 즐거웠던 쪽"이 아니라 그 조각이 얼마나 자주 보이는지와 제품의 성격에서 답하라고 한다.[](source:vr-s5f)

## 무엇을 바꾸고, 무엇을 강제하나 {#rules}

각 버전은 같은 요청에 대한 다른 답이다. 색만 바꾸거나 문구만 바꾼 버전은 다른 답으로 치지 않는다. 축 후보는 이 모음이 담당 스킬을 가진 다섯 가지다.[](source:vr-axes)

| 축 | 담당 스킬(원문 Owner) | 달라지는 것 |
| --- | --- | --- |
| Structure | `better-layout` | 묶음, 순서, 열 개수, 무엇이 접히는지[](source:vr-axes)[](source:bl-fm) |
| Density | `better-layout` | 간격 단계, 얼마나 많이 들어가는지[](source:vr-axes)[](source:bl-fm) |
| Emphasis | `better-colors` | 채워진 색이 어디에 가고 무엇이 물러나는지[](source:vr-axes)[](source:bc-fm) |
| Type | `better-typography` | 글자 단계, 굵기 대비, 줄 길이[](source:vr-axes)[](source:bt-fm) |
| Voice | `better-writing` | 라벨, 어조, 문구의 양[](source:vr-axes)[](source:bw-fm) |

**주 축은 하나**만 고르고, 버전마다 그 축에서 다른 위치를 준다. 그 축 이름이 선택기의 그룹 제목이 된다. 나머지 선택은 주 축을 따라오고 스스로 변하지 않는다.[](source:vr-one)

원문 예: 밀도 높은 버전이 더 작은 글자 단계를 써야 할 수 있고, 그것은 두 번째 축이 아니라 일관성이다.[](source:vr-one)

판정: 원문은 축 표의 담당 스킬을 "불러서 실행하라"고 쓰지 않는다. 표는 어느 스킬의 어휘로 축을 다루는지 알려 주는 안내로 읽힌다(원장 r108~r111, 참고).[](source:vr-axes)

모든 버전은 선택기에 들어가기 전에 바닥 규칙을 통과해야 한다. 원문은 이 목록이 `better-interface`의 escalation trigger라고 한다.[](source:vr-floor-rule)

| # | 통과해야 하는 것 |
| --- | --- |
| 1 | 모든 컨트롤에 접근 가능한 이름과 보이는 focus 표시가 있다[](source:vr-floor-list) |
| 2 | 포인터로 닿는 것은 키보드로도 닿는다[](source:vr-floor-list) |
| 3 | 모션과 자동 재생은 `prefers-reduced-motion`을 따른다[](source:vr-floor-list) |
| 4 | 320px 폭이나 200% 확대에서 잘리거나 겹치거나 닿지 못하는 것이 없다[](source:vr-floor-list) |
| 5 | 본문과 컨트롤 글자가 요구 대비 비율을 통과한다[](source:vr-floor-list) |
| 6 | 상태나 의미를 색만으로 전하지 않고, 상태 변화를 모션만으로 전하지 않는다[](source:vr-floor-list) |
| 7 | 파괴 동작에 확인, 실행 취소, 구별되는 처리 중 하나가 있다[](source:vr-floor-list) |
| 8 | 잘린 내용에 전체 값에 닿는 길이 있다[](source:vr-floor-list) |
| 9 | 스크롤 끝 너머나 disclosure 뒤에 숨은 것에 눈에 띄는 단서가 있다[](source:vr-floor-list) |
| 10 | 모든 에러가 복구하는 길을 말한다[](source:vr-floor-list) |
| 11 | `semantic color`를 뜻과 반대로 쓰지 않는다. 예: 파괴적이지 않은 동작에 danger 색[](source:vr-floor-list) |

바닥 규칙은 모든 버전에서 같고, 축이 아니며, 축과 맞바꾸지 않는다.[](source:vr-floor-rule)

@callout level=warning title="바닥 규칙을 깨야만 되는 방향"
어떤 방향이 바닥 규칙을 깨야만 작동하면, 에이전트는 그 사실을 말하고 그 방향을 버린다. 가장 과감한 버전이 키보드나 focus를 건너뛰는 것도 같은 실수로 표에 있다.[](source:vr-floor-rule)[](source:vr-mis)

판정: 원문의 바닥 규칙은 11줄이고 `better-interface`의 `escalation trigger`는 13줄이다. 1번 줄이 trigger 두 개(접근 가능한 이름, focus 표시)를, 6번 줄이 두 개(색만으로 전달, 모션만으로 전달)를 한 줄로 합쳤다. 나머지 9줄은 `escalation trigger`와 하나씩 짝이 맞아 내용은 같다고 읽힌다.[](source:vr-floor-list)[](source:bi-trig)

마무리 전 실수 표는 아홉 행이다. 각 행이 앞의 규칙을 어긴 모습과 고치는 법이다.[](source:vr-mis)

| 실수 | 고치는 법 |
| --- | --- |
| 버전이 포인트 색이나 문구만 다르다 | 주 축에서 다른 위치로 옮기거나 버린다 |
| 모든 축이 한꺼번에 다르다 | 하나만 바꾸고 나머지는 따라오게 한다 |
| 빈 route에서 판단했다 | 조각이 들어갈 페이지에 올린다 |
| lorem ipsum, 세 줄, "Jane Doe" | 실제 문구와 페이지가 실제로 가질 항목 수 |
| 가장 과감한 버전이 키보드나 focus를 건너뛴다 | 바닥 규칙을 통과시키거나 그 방향을 버린다 |
| 표에 `favourite`을 표시했다 | 버전마다 비용을 적고 사용자가 고르게 한다 |
| 선택기에 프로젝트 token을 입혔다 | 디자인 시스템 밖에 눈에 띄게 둔다 |
| 버전마다 탭 하나씩 한 줄로 늘어놓았다 | 조각 옆의 그룹 목록, 자리가 없으면 위의 select |
| 승격 뒤 비교용 장치가 남았다 | 지우고 이름과 param을 검색한다 |

@facts
| 버전 수 | 기본 3개. 5개는 요청할 때만(기본값과 요청 조건)[](source:vr-s3) |
| 바닥 규칙의 폭·확대 | 320px 폭, 200% 확대(통과 조건, 의무형)[](source:vr-floor-list) |
| 판단 폭 | 375px와 1440px는 원문이 든 예시로, 답이 달라질 수 있다는 설명이다[](source:vr-s5b) |
| 탭 줄의 한계 | 약 7개를 넘으면 화면 밖으로 간다(원문 설명). 그룹 목록은 30개에서도 훑을 만하다[](source:pk-list) |

## 선택기는 어떻게 만들어야 하나 {#picker}

`picker.md`는 선택기의 규격이다. "판단하려는 것 옆에 놓이므로 규격대로 만들고 건드리지 않는다"가 출발점이다.[](source:pk-out)

| 규칙 | 내용 |
| --- | --- |
| 디자인 시스템 밖 | 프로젝트의 token·글꼴·색을 쓰지 않는다. 어두운 중립 면 하나, 시스템 글꼴, 프로젝트 변수 없음. 어두운 면은 밝은 페이지와 어두운 페이지 모두에서 도구 chrome으로 읽히므로 테마를 따르지 않는다[](source:pk-out) |
| 그룹 목록 | 세로 목록이고 그룹 제목은 3단계에서 정한 축 이름이다. 그룹이 하나뿐이어도 제목이 있고, 제목마다 같은 작은 화살표 아이콘이 붙는다. 버전과 그룹은 적은 순서를 유지한다[](source:pk-list) |
| URL이 원천 | `__variant` search param을 쓰고 읽는다. 그래서 버전마다 링크다[](source:pk-beh) |
| 방향키 | 위·아래·좌·우 키가 목록 순서대로 그룹을 넘어 모든 버전을 지난다[](source:pk-beh) |
| `H` 키 | 선택기(목록과 select 모두)를 숨기거나 보인다. screenshot과 화면 녹화용이다[](source:pk-beh) |
| 키 입력 제외 | 수정 키가 눌린 이벤트, 이미 `defaultPrevented`인 이벤트, input·textarea·select·contenteditable에서 온 이벤트는 무시한다[](source:pk-beh) |
| 접근성 | 활성 버튼에 `aria-pressed="true"`를 달고 목록 안에서 보이도록 스크롤한다. 목록에 라벨이 있고 각 그룹은 제목이 label인 `role="group"`이다[](source:pk-beh) |
| 전환 | 조각은 즉시 바뀌고 스크롤 위치를 유지한다. 부드럽게 바뀌는 것은 활성 라벨의 굵기뿐이라고 한다. CSS의 `transition`은 `color`와 `font-weight` 모두 `200ms ease-out`이다[](source:pk-beh)[](source:pk-btn) |
| 배치 | 목록과 `select`를 항상 둘 다 그리고 `container query`가 하나만 보이게 한다. 크기를 바꿔도 활성 버전이 남는다[](source:pk-beh) |

좁은 곳에서는 `select`가 조각 위에 놓이고, 휴대폰에서는 네이티브 메뉴가 열린다. 넓은 곳에서는 목록이 왼쪽에 붙어(sticky) 있다가 뷰포트보다 길어지면 안에서 스크롤한다.[](source:pk-place)

@facts
| 전환 폭 | 목록 208px + 간격 24px = 232px에 조각의 프로덕션 폭을 더한 값. 원문 CSS 예시는 조각 644px라서 876px(208 + 24 + 644)이다[](source:pk-place)[](source:pk-cq) |
| 목록 안쪽 여백 | 6px. 목록이 스스로 스크롤할 때 focus ring이 잘리지 않게 한다[](source:pk-place) |
| 프로덕션 폭 반영 | `max-width`와 grid 열에 프로덕션 폭을 넣고 query는 232px에 그 폭을 더해 맞춘다[](source:pk-place) |

원문은 HTML 구조와 CSS만 준다. 키 처리·URL 읽기·`H` 키를 구현하는 스크립트는 없다(`원문에 명시 없음`). 프레임워크에서는 클래스 이름과 구조를 그대로 두고 렌더링 문법만 바꾸라고 한다.[](source:pk-end)

## 흐름 속 위치 {#position}

`variant`는 묶음 `component-workbench`에 속한다. 같은 묶음의 `break`, `state-machine`과 순서로 이어지지 않고, 원장의 관계는 모두 역할 구분이나 참고다. 의무형은 `better-interface`의 기준을 바닥 규칙으로 쓰는 한 곳이다.[](source:vr-split)[](source:vr-floor-rule)

@workflow id=variant-position title="variant 앞뒤"
| p-user | 사용자 명시 호출 | external |
| p-bi | better-interface | backend |
| p-var | variant | backend |
| p-out | 장단점 표와 선택 | external |
| p-user > p-var | UI 조각 | emphasis |
| p-bi > p-var | 바닥 규칙 기준 | dashed |
| p-var > p-out | 표를 건넴 | |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| 사용자(앞) | 서술한 UI 조각 하나 | - | 명시 호출만 받으므로 실제 시작점은 사람이다[](source:vr-fm) | - |
| `better-interface` | escalation trigger 목록(기준만) | - | 의무형. 모든 버전이 선택기에 들어가기 전에 통과해야 한다. 스킬을 실행하라는 문장은 없다. 이 스킬의 기준을 가져다 쓰는 것이다[](source:vr-floor-rule)[](source:bi-trig) | r105 |
| `better-interface` · `interface-review` | - | - | 역할 구분. 기존 UI 리뷰는 그쪽 몫이고 `variant`는 후보만 만들고 순위를 매기지 않는다[](source:vr-split)[](source:ir-fm) | r104 · r105 |
| `break` | - | - | 역할 구분. 한 컴포넌트 스트레스 테스트는 그쪽 몫이다. `break`도 반대 방향으로 이 스킬을 가리키고, "`variant`는 실제 페이지를 고집하지만 이 스킬은 일부러 격리한다"고 쓴다[](source:vr-split)[](source:br-split) | r106 · r114 |
| `state-machine` | - | - | 역할 구분. 컴포넌트 상태를 하나씩 작업하는 일은 그쪽 몫이다. `state-machine`도 "대안 디자인 탐색은 `variant`"라고 가리킨다[](source:vr-split)[](source:sm-split) | r107 · r123 |
| `better-layout` | - | - | 참고. Structure·Density 축의 담당 스킬로 적혀 있다[](source:vr-axes)[](source:bl-fm) | r108 |
| `better-colors` | - | - | 참고. Emphasis 축의 담당 스킬이다[](source:vr-axes)[](source:bc-fm) | r109 |
| `better-typography` | - | - | 참고. Type 축의 담당 스킬이다[](source:vr-axes)[](source:bt-fm) | r110 |
| `better-writing` | - | - | 참고. Voice 축의 담당 스킬이다[](source:vr-axes)[](source:bw-fm) | r111 |
| `afk` | - | - | 들어오는 참고. `afk`가 "한 컴포넌트의 대안 탐색은 `variant`"라고 가리킨다. `afk`가 이 스킬을 실행한다는 지시는 없다[](source:afk-split) | r127 |
| `explain-interface` | - | - | 들어오는 참고. "내 인터페이스의 대안 탐색은 `variant`"라고 가리킨다[](source:ei-split) | r131 |
| `build-design` | - | - | 들어오는 참고. "대안 탐색은 `variant`"라고 가리킨다[](source:bd-split) | r142 |
| `prototype`(`emilkowalski`, 묶음 밖) | - | - | 같은 계열(추론). 둘 다 UI 조각을 다른 여러 버전으로 만들어 화면의 선택기로 비교하게 하고 명시 호출만 한다. 작성자가 다르고 서로 부르지 않는다[](source:vr-fm)[](source:pr-fm) | r150 |
| (뒤) | - | 장단점 표, 선택기 위치와 키, 판단한 폭 | 받는 쪽은 사용자다. 승격과 삭제는 사용자가 고른 뒤에 한다[](source:vr-s5b)[](source:vr-s6a) | - |

그림에는 사용자 시작, 바닥 규칙 기준, 사용자에게 건네는 표만 그렸다. r104, r106, r107, r114, r123, r127, r131, r142는 "그 일은 저 스킬의 몫"이라는 참고라 순서가 없어서, r108~r111은 축 표의 안내라서, r150은 묶음 밖 같은 계열이라서 표에만 남겼다.

전체 흐름은 `design/_group-component-workbench/component-workbench.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 3개, 합계 14,042B다. `SKILL.md` 6,848B, `picker.md` 7,042B, `agents/openai.yaml` 152B를 끝까지 읽었다. 구조·표본만 확인한 파일(부분 읽음)은 0개다.
- 관계 확인용으로 다른 스킬 12개의 해당 줄만 읽었다. `better-interface`(frontmatter와 77~91줄), `interface-review`·`break`·`state-machine`·`prototype`의 frontmatter, `better-layout`·`better-colors`·`better-typography`·`better-writing`의 frontmatter, `break` 11~13줄, `state-machine` 11줄, `afk` 11줄, `explain-interface` 11줄, `build-design` 12줄이다. 이 파일들은 위 개수에 넣지 않았다.
- 제외한 파일: 없음. 번역본과 바이너리가 없고 `scripts/`·`assets/` 폴더도 없다(`find`로 확인).
- 다른 컬렉션에 이름이 같은 스킬은 없다(`design/relations.md`).
- 원문 대조 범위: 활성화 제한 2개(`disable-model-invocation`, `allow_implicit_invocation`), 단계 6개와 반복 1개, 완료 조건 1개(3단계), 축 5개, 바닥 규칙 11개, 마무리 전 실수 표 9행, 선택기 동작 규칙 7개를 모두 대조했다. 수치(3개·5개, 약 7개·30개, 320px·200%, 375px·1440px, 208px·24px·232px·644px·876px, 6px, `200ms`)를 대조했다. 관계 행 r104~r111, r114, r123, r127, r131, r142, r150은 원장과 원문 줄을 다시 대조했다.
- 원장과 다른 점: r104 등이 `interface-review:3`을 description 줄로 적었지만, 실제 3줄은 `disable-model-invocation: true`이고 description은 4줄이다. 관계 내용은 같다.[](source:ir-fm)
- 분석 중 바뀐 파일: 없음. `design/` 작업 트리는 commit `0465878` 그대로다.
- 사람 검토: 미실시.

@callout level=open-question title="확인하지 못한 것"
- 이 스킬이 실제로 에이전트의 동작을 바꾸는지는 실행해 보지 않아 확인하지 않았다. 페이지의 모든 동작은 지시상 동작이다.
- 3단계에서 이름과 축 위치를 적은 뒤 사용자 확인을 기다리라는 문장은 `원문에 명시 없음`이다. 원문에서 사람이 개입하는 곳은 1단계의 범위 질문, 5단계 이후의 선택이다.[](source:vr-s1)[](source:vr-s3)
- 6단계의 "기울었던 방향"을 누가 기울었다는 것인지 원문에 명시 없음이다. 같은 5단계가 `favourite`을 표시하지 말라고 하므로 에이전트의 선호인지 사용자의 반응인지 알 수 없다.[](source:vr-s5f)[](source:vr-s6b)
- 6단계는 "나머지 버전을 지운다"고 쓰고, 고른 버전의 비교용 파일을 어떻게 하는지는 따로 적지 않는다. 마지막 문장의 "비교용 장치가 남지 않았는지"로 포괄한다고 읽었다(판정).[](source:vr-s6a)
- 5개 버전을 요청하는 방법(말투, 호출 인자)은 `원문에 명시 없음`이다.[](source:vr-s3)
