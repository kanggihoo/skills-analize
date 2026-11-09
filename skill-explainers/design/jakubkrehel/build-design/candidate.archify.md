# build-design 스킬은 에이전트를 어떻게 바꾸나 {#build-design-skill}

`build-design`을 쓰면 에이전트는 Figma 파일이나 디자인 이미지를 읽고, 프로젝트에 이미 있는 token과 컴포넌트로 **같은 모양의 UI**를 만든다. 값은 디자인이 정하고 에이전트의 취향은 쓰지 않는다. 디자인에 없는 변경은 사용자가 정한다. 만든 뒤에는 디자인과 나란히 비교하고, 표로 보고하고 멈춘다.[](source:bd-intro)[](source:bd-rep)

- 켜지는 때: 사용자가 Figma 링크나 디자인 이미지를 주고 구현을 요청할 때다. frontmatter에 호출 제한 필드가 없다.[](source:bd-fm)
- 강제하는 것: 새 token·컴포넌트 variant·임의 값을 숫자에 맞추려고 만들지 않는다. 디자인이 그리지 않은 것은 만들지 않는다. 보지 않은 비교를 일치로 보고하지 않는다.[](source:bd-never)[](source:bd-around)[](source:bd-browser)
- 사람이 정하는 지점: Figma 도구가 없거나 로그인이 안 됐을 때, 반올림이 2px를 넘거나 색이 다른 step이 될 때, 대응 컴포넌트가 없을 때 에이전트는 멈추고 묻는다.[](source:bd-figma)[](source:bd-never)[](source:bd-maptbl)
- 쓰면 안 되는 때: 끝난 작업 리뷰(`interface-review`), 대안 탐색(`variant`), 컴포넌트 stress test(`break`)다. 도메인 규칙의 판단도 이 스킬의 몫이 아니다.[](source:bd-owner)

@answer scope="원본 3개 8,735B · 커밋 0465878 · 지시상 동작"
@meta locale=ko
@source bd-skill title="design/jakubkrehel/build-design/SKILL.md · 6085B · 지시 본문" path=design/jakubkrehel/build-design/SKILL.md
@source bd-oa title="design/jakubkrehel/build-design/agents/openai.yaml · 107B · 표시 이름" path=design/jakubkrehel/build-design/agents/openai.yaml lines=1:3
@source fg-all title="design/jakubkrehel/build-design/figma.md · 2543B · Figma MCP 도구와 신뢰 순서" path=design/jakubkrehel/build-design/figma.md
@source bd-fm title="SKILL.md · frontmatter" path=design/jakubkrehel/build-design/SKILL.md lines=1:4
@source bd-intro title="SKILL.md · 하는 일과 디자인이 결정한다는 원칙" path=design/jakubkrehel/build-design/SKILL.md lines=8:10
@source bd-owner title="SKILL.md · 도메인 규칙은 소유하지 않는다" path=design/jakubkrehel/build-design/SKILL.md lines=12:12
@source bd-figma title="SKILL.md · 1단계 Figma 링크는 Figma MCP로" path=design/jakubkrehel/build-design/SKILL.md lines=16:16
@source bd-img title="SKILL.md · 1단계 이미지는 추정" path=design/jakubkrehel/build-design/SKILL.md lines=18:18
@source bd-scope title="SKILL.md · 1단계 이름 붙은 frame만" path=design/jakubkrehel/build-design/SKILL.md lines=20:20
@source bd-s1done title="SKILL.md · 1단계 완료 조건" path=design/jakubkrehel/build-design/SKILL.md lines=22:22
@source bd-maptbl title="SKILL.md · 2단계 매핑 표" path=design/jakubkrehel/build-design/SKILL.md lines=26:35
@source bd-never title="SKILL.md · 2단계 추가 금지와 2px 기준" path=design/jakubkrehel/build-design/SKILL.md lines=37:37
@source bd-data title="SKILL.md · 2단계 데이터와 unwired" path=design/jakubkrehel/build-design/SKILL.md lines=39:39
@source bd-states title="SKILL.md · 3단계 구현 범위와 그리지 않은 상태" path=design/jakubkrehel/build-design/SKILL.md lines=43:43
@source bd-around title="SKILL.md · 3단계 주변을 건드리지 않는다" path=design/jakubkrehel/build-design/SKILL.md lines=45:45
@source bd-render title="SKILL.md · 4단계 frame 너비마다 렌더해 비교" path=design/jakubkrehel/build-design/SKILL.md lines=49:49
@source bd-browser title="SKILL.md · 4단계 브라우저가 없으면" path=design/jakubkrehel/build-design/SKILL.md lines=51:51
@source bd-s4done title="SKILL.md · 4단계 수정과 완료 조건" path=design/jakubkrehel/build-design/SKILL.md lines=53:53
@source bd-rep title="SKILL.md · 5단계 보고 표와 목록" path=design/jakubkrehel/build-design/SKILL.md lines=55:69
@source bd-fin title="SKILL.md · 끝내기 전 점검표" path=design/jakubkrehel/build-design/SKILL.md lines=71:83
@source fg-head title="figma.md · 이 문서의 범위" path=design/jakubkrehel/build-design/figma.md lines=3:3
@source fg-link title="figma.md · 링크에서 node까지" path=design/jakubkrehel/build-design/figma.md lines=5:7
@source fg-calls title="figma.md · 호출할 도구 표" path=design/jakubkrehel/build-design/figma.md lines=9:20
@source fg-trust title="figma.md · 무엇을 믿나" path=design/jakubkrehel/build-design/figma.md lines=22:29
@source ba-fm title="design/jakubkrehel/better-accessibility/SKILL.md · r135 확인용 description" path=design/jakubkrehel/better-accessibility/SKILL.md lines=2:4
@source bc-fm title="design/jakubkrehel/better-colors/SKILL.md · r136 확인용 description" path=design/jakubkrehel/better-colors/SKILL.md lines=2:4
@source bt-fm title="design/jakubkrehel/better-typography/SKILL.md · r137 확인용 description" path=design/jakubkrehel/better-typography/SKILL.md lines=2:4
@source bl-fm title="design/jakubkrehel/better-layout/SKILL.md · r138 확인용 description" path=design/jakubkrehel/better-layout/SKILL.md lines=2:4
@source bw-fm title="design/jakubkrehel/better-writing/SKILL.md · r139 확인용 description" path=design/jakubkrehel/better-writing/SKILL.md lines=2:4
@source bu-fm title="design/jakubkrehel/better-ui/SKILL.md · r140 확인용 description" path=design/jakubkrehel/better-ui/SKILL.md lines=2:4
@source ir-fm title="design/jakubkrehel/interface-review/SKILL.md · r141 확인용 frontmatter" path=design/jakubkrehel/interface-review/SKILL.md lines=1:5
@source va-fm title="design/jakubkrehel/variant/SKILL.md · r142 확인용 frontmatter" path=design/jakubkrehel/variant/SKILL.md lines=1:5
@source br-fm title="design/jakubkrehel/break/SKILL.md · r143 확인용 frontmatter" path=design/jakubkrehel/break/SKILL.md lines=1:5

## 언제 켜지고, 무엇을 입력으로 받나 {#trigger}

@code source=bd-fm language=yaml

frontmatter에는 `name`과 `description`만 있고 호출 제한 필드가 없다. 같은 폴더의 `agents/openai.yaml`에도 `display_name`과 `short_description`뿐이다.[](source:bd-fm)[](source:bd-oa)

판정: `description`은 모델이 판단할 때 참고하는 설명이다. "Figma"라는 단어가 나와야만 켜지는 목록은 아니다. 호출 제한이 없으므로 사용자가 부르지 않아도 모델이 켤 수 있다.

@code source=bd-oa language=yaml

입력은 두 가지다. 어느 쪽이든 에이전트는 먼저 디자인에서 값을 읽는다.

| 입력 | 에이전트가 하는 일 | 한계 |
| --- | --- | --- |
| Figma 링크 | Figma MCP로 읽는다. 도구가 안 보이면 "연결 안 됨"이라고 쓰기 전에 사용 가능한 도구와 deferred 도구에서 `figma`를 검색한다. 서버가 `authenticate` 도구만 보이면 연결은 됐지만 로그인이 안 된 것이므로 사용자에게 인증을 부탁한다. Figma 도구가 전혀 없으면 연결을 부탁하고, 그동안 기억이나 짐작으로 만들지 않는다[](source:bd-figma) | 값이 정확하다 |
| 스크린샷·내보낸 이미지 | 값을 읽을 수 없다. 크기는 캡처에 대한 비율이므로 가정한 scale을 밝히고 모든 측정을 추정으로 다룬다. Figma 링크가 있으면 달라고 요청한다. 링크가 추정 전체를 대신하기 때문이다[](source:bd-img) | {caution:모든 값이 추정} |

범위는 사용자가 이름 붙인 frame으로 좁힌다. 너비만 다른 frame은 별개의 조각이 아니라 한 조각의 여러 breakpoint다.[](source:bd-scope)

이 스킬은 도메인 규칙을 소유하지 않는다. 대비, focus, 글자, 간격, 색, 카피, 표면·아이콘·모션 규칙은 각 `better-*` 스킬의 몫이고, 끝난 작업 리뷰·대안 탐색·stress test는 `interface-review`·`variant`·`break`의 몫이다. 디자인이 규칙을 깨면 디자인대로 만들고 충돌을 소유 스킬 이름과 함께 보고한다. 세부 표는 아래 [보고 패널](block:report)에 있다.[](source:bd-owner)

## 어떤 순서로 만들고, 어디서 멈추나 {#workflow}

원문은 다섯 단계를 번호로 매긴다. 에이전트는 디자인을 원천에서 읽고, 프로젝트에 매핑하고, 디자인이 보여 주는 것만 구현하고, 디자인과 비교하고, 보고하고 멈춘다.[](source:bd-intro)

@workflow id=build-flow title="build-design 5단계"
| lane in | 입력 |
| lane make | 구현 |
| lane check | 검증 |
| bd-read | 1 디자인 읽기 | external | in |
| bd-map | 2 token에 매핑 | backend | make |
| bd-round | 눈에 띄는 반올림? | backend | make |
| bd-user | 사용자에게 묻기 | external | make |
| bd-build | 3 그린 것만 구현 | backend | make |
| bd-cmp | 4 디자인과 비교 | backend | check |
| bd-diff | 내가 만든 차이? | backend | check |
| bd-report | 5 보고하고 멈춤 | backend | check |
| bd-read > bd-map | |
| bd-map > bd-round | |
| bd-round > bd-user | 2px 초과 |
| bd-user > bd-build | 답 | emphasis |
| bd-round > bd-build | 아니오 |
| bd-build > bd-cmp | |
| bd-cmp > bd-diff | |
| bd-diff > bd-cmp | 예, 수정 후 | dashed |
| bd-diff > bd-report | 아니오 | emphasis |

@steps id=build-steps
| bd-read | 1 디자인 읽기 | 이름 붙은 frame마다 screenshot을 받고, 간격·크기·radius·색·글자·쓰인 컴포넌트의 값을 모은다. 완료 조건은 모든 frame의 screenshot과 값을 쥔 상태다. Figma에서는 값이 정확하고 이미지에서는 가정한 scale의 추정이다.[](source:bd-s1done) | build-flow | bd-read |
| bd-map | 2 token에 매핑 | 코드를 쓰기 전에 프로젝트의 token과 컴포넌트 라이브러리를 읽는다. 디자인 값을 하나씩 이미 있는 것에 대응시킨다.[](source:bd-maptbl) | build-flow | bd-map |
| bd-round | 눈에 띄는 반올림? | 반올림하면 디자인이 눈에 띄게 달라질 때, 곧 간격·크기가 2px 넘게 바뀌거나 색이 다른 step에 닿을 때는 멈추고 어느 쪽으로 갈지 묻는다.[](source:bd-never) | build-flow | bd-round |
| bd-build | 3 그린 것만 구현 | frame, frame이 정의한 breakpoint, 파일이 그린 상태(hover, empty, error 등)만 구현한다. 주변은 그대로 둔다.[](source:bd-states)[](source:bd-around) | build-flow | bd-build |
| bd-cmp | 4 디자인과 비교 | frame 너비마다 렌더해 screenshot 옆에 놓고 요소별로 걷는다. 1단계에서 모은 속성을 비교한다.[](source:bd-render) | build-flow | bd-cmp |
| bd-diff | 내가 만든 차이? | 내가 만든 불일치는 모두 고치고 다시 비교한다. 남은 차이가 반올림이나 질문뿐이면 끝난다.[](source:bd-s4done) | build-flow | bd-diff |
| bd-report | 5 보고하고 멈춤 | 요소별 표와 세 목록으로 보고한 뒤 어디서 도는지와 비교한 너비를 말하고 멈춘다.[](source:bd-rep) | build-flow | bd-report |

멈추는 곳은 두 종류다. 하나는 사람이 정해야 해서 멈추는 곳이다. Figma 도구 연결·인증, 눈에 띄는 반올림, 대응 컴포넌트가 없을 때의 "컴포넌트를 만들까" 질문이 여기에 든다.[](source:bd-figma)[](source:bd-never)[](source:bd-maptbl)

다른 하나는 5단계 보고 뒤의 마무리다. 원문은 그 뒤에 이어지는 단계를 적지 않는다(`원문에 명시 없음`).

브라우저가 있으면 너비마다 screenshot을 찍어 비교한다. 없으면 로컬 URL과 확인할 너비를 넘기고 비교가 확인되지 않았다고 말한다. 본 적 없는 일치는 보고하지 않는다.[](source:bd-browser)

## 디자인 값을 프로젝트 token에 어떻게 옮기나 {#mapping}

에이전트는 디자인의 모든 값을 프로젝트에 이미 있는 것에 대응시킨다.[](source:bd-maptbl)

| 디자인에 있는 것 | 코드에서 하는 일 |
| --- | --- |
| 연결된 variable이나 style | 같은 이름이거나 같은 값의 token |
| token과 같은 raw 값 | 그 token |
| token이 없는 raw 값 | 가장 가까운 기존 token, 보고에 "rounded"로 적는다 |
| 컴포넌트 instance | 같은 이름의 프로젝트 컴포넌트, 디자인이 보여 주는 variant로 |
| 프로젝트에 대응이 없는 instance | 그 자리의 평범한 markup, deviation으로 적고 컴포넌트가 있어야 하는지 묻는다 {caution:사용자 질문} |
| 한 번만 쓰는 layer 묶음 | 그 자리의 평범한 markup. 새 컴포넌트를 만들지 않는다 |

원문은 숫자에 맞추려고 token, 컴포넌트 variant, 임의 값(예: `w-[343px]`, raw hex)을 더하지 말라고 한다. 반올림이 디자인을 눈에 띄게 바꾸면 멈추고 묻는다. 눈에 띄는 기준은 간격·크기가 2px 넘게 바뀌거나 색이 다른 step에 닿는 경우다.[](source:bd-never)[](source:bd-fin)

@facts
| 반올림에서 멈추는 기준 | 간격·크기가 2px 넘게 바뀔 때, 또는 색이 다른 step에 닿을 때(의무)[](source:bd-never) |
| 비교 대상 너비 | frame마다 그 frame의 너비. 이미지 입력은 가정한 scale의 추정[](source:bd-render)[](source:bd-img) |
| `get_design_context` | 범위 안의 frame마다 한 번씩. screenshot은 같은 호출에서 요청한다[](source:fg-calls) |
| `node-id` 표기 | URL은 `1-2`, 도구는 `1:2`. branch URL은 branch key를 file key로 넘긴다[](source:fg-link) |

데이터는 이미 있는 것에 연결한다. 일부의 backend가 아직 없으면 그 부분은 props로 채우는 UI로 만들고 보고에 `unwired`로 적는다.[](source:bd-data)

구현 범위는 frame, frame이 정의한 breakpoint, 파일이 그린 상태다. 그리지 않은 상태는 에이전트가 디자인할 몫이 아니다. 기존 컴포넌트의 기본값에 맡기고 `Missing states`에 적는다.

주변 문구 수정, 아이콘 교체, "하는 김에" 정리도 하지 않는다. 원문은 디자인보다 넓은 diff가 이 스킬이 가장 흔히 틀어지는 방식이라고 한다.[](source:bd-states)[](source:bd-around)

값을 Figma에서 어떻게 꺼내는지는 `figma.md`가 정한다. 도구 이름은 공식 Figma MCP 서버의 것이고, 서버에 Figma 스킬이 딸려 오면 첫 호출 전에 로드하라고 한다. 링크에서 파일 key는 `/design/`이나 `/file/` 뒤에, node는 `node-id`에 있다. `node-id`가 없는 링크는 특정 frame을 가리키지 않으므로 `get_metadata`로 frame을 나열하고 어느 것이 나가는지 확인한 뒤 읽는다.[](source:fg-head)[](source:fg-link)

| 도구 | 주는 것 | 쓰는 곳 |
| --- | --- | --- |
| `get_design_context` | 참고 코드, 정확한 값, 연결된 variable, 컴포넌트 instance, asset 내려받기, 선택적으로 screenshot | 범위 안의 모든 frame, 한 번씩 |
| `get_screenshot` | node의 렌더 | 디자인 컨텍스트가 screenshot을 주지 않았을 때의 비교 대상 |
| `get_variable_defs` | node가 쓰는 variable의 이름과 값 | 디자인 variable을 프로젝트 token에 대응시킬 때 |
| `get_metadata` | id와 크기가 있는 layer tree, 스타일 없음 | 큰 페이지에서 읽을 자식 node를 찾을 때 |

원문은 `get_design_context`가 돌려주는 참고 코드를 번역해서 쓰라고 한다. 기본은 raw 값을 쓴 React와 Tailwind이므로 그대로 붙이지 않고 위 매핑 표를 거친다. `sparse`로 표시된 디자인 컨텍스트는 값이 아니라 요약이다. 그것이 지목한 보이는 자식 node들을 병렬로 읽고 그 답으로 만든다.[](source:fg-calls)

무엇을 믿을지도 정해 두었다.[](source:fg-trust)

| 먼저 믿을 것 | 나중에 볼 것 | 이유 |
| --- | --- | --- |
| variable 이름 | raw 값 | `gray/600`에 묶인 fill은 hex가 달라졌어도 프로젝트의 `gray-600`으로 간다 |
| Code Connect 매핑 | 이름 맞추기 | 매핑된 node는 정확한 컴포넌트와 props를 가리킨다. 표현할 수 없으면 그 경우를 보고한다 |
| auto layout | 절대 위치 | auto layout의 gap과 padding이 간격 의도다. 자유 배치 layer의 x·y는 누군가 놓은 자리다 |
| 내려받은 asset | Figma URL | 서버가 준 asset URL은 만료된다. 프로젝트에 저장하고 코드에 Figma URL을 남기지 않는다 |

screenshot은 비교 대상이고 빌드의 asset이 아니다.[](source:fg-trust)

## 규칙 충돌과 결과를 어떻게 보고하나 {#report}

디자인이 도메인 규칙을 깨면 에이전트는 디자인대로 만들고, 최종 보고의 `Domain conflicts` 목록에 규칙을 소유한 스킬 이름과 함께 적는다.[](source:bd-owner)[](source:bd-rep) 원문은 소유 스킬을 실행하라고 하지 않는다. 판정: 보고 대상은 사용자이고, 소유 스킬은 충돌의 이름표 역할만 한다.

| 규칙 영역 | 소유 스킬 | 호출 제한 | rel-id |
| --- | --- | --- | --- |
| 대비 요구, focus, 시맨틱 | `better-accessibility`[](source:ba-fm) | 호출 제한 필드 없음 | r135 |
| 대비 측정, 팔레트 | `better-colors`[](source:bc-fm) | 호출 제한 필드 없음 | r136 |
| 글자 | `better-typography`[](source:bt-fm) | 호출 제한 필드 없음 | r137 |
| 간격, 구조 | `better-layout`[](source:bl-fm) | 호출 제한 필드 없음 | r138 |
| 카피 | `better-writing`[](source:bw-fm) | 호출 제한 필드 없음 | r139 |
| 표면, 아이콘, 모션 | `better-ui`[](source:bu-fm) | 호출 제한 필드 없음 | r140 |
| 끝난 작업 리뷰 | `interface-review`[](source:ir-fm) | `disable-model-invocation: true` | r141 |
| 대안 탐색 | `variant`[](source:va-fm) | `disable-model-invocation: true` | r142 |
| 컴포넌트 stress test | `break`[](source:br-fm) | `disable-model-invocation: true` | r143 |

앞 여섯 줄은 "충돌을 보고할 곳"이고, 끝 세 줄은 "이 스킬이 하지 않는 일을 맡은 곳"이다. 이 스킬은 어느 쪽도 호출하지 않으며 이름을 들어 책임을 가를 뿐이다(`원문에 명시 없음`: 호출 방법).[](source:bd-owner)

보고는 요소별 표로 시작한다. 아래는 원문 예시다.[](source:bd-rep)

| Element | Design | Built | Status |
| --- | --- | --- | --- |
| Card padding | 20px | `p-5` | Matches {good:일치} |
| Title size | 15px | `text-sm`, 14px | Rounded to token {caution:반올림} |
| Badge | Filled pill | Text label | Deviates, asked: no badge component exists {bad:이탈} |

표 다음에 세 목록을 한 줄씩 적는다. 내용이 없는 목록은 뺀다.[](source:bd-rep)

- `Unwired`: backend가 생길 때까지 props로 그리는 부분
- `Missing states`: 디자인이 그리지 않은 상태
- `Domain conflicts`: 디자인이 규칙을 깬 곳과 소유 스킬

끝에는 빌드가 어디서 돌고 있는지, 어느 너비에서 비교했는지를 말한다.[](source:bd-rep)

끝내기 전 점검표는 아홉 행이다.[](source:bd-fin)

| 눈에 띄는 것 | 고칠 일 |
| --- | --- |
| 도구 검색 없이 "Figma 연결 안 됨"이라고 씀 | 먼저 `figma`를 검색한다 |
| Figma 응답에는 없고 screenshot에만 있는 값이 코드에 있음 | 디자인 컨텍스트에서 값을 읽는다 |
| diff에 `w-[343px]` 같은 임의 값이나 raw hex | token에 대응시키거나, 반올림이 눈에 띄면 묻는다 |
| 컴포넌트가 아닌 frame 때문에 components 폴더에 새 파일 | 평범한 markup으로 인라인한다 |
| 디자인이 그리지 않은 loading·error 분기 | 지우고 기본값을 두고 `Missing states`에 적는다 |
| 어떤 frame도 닿지 않는 파일이 diff에 있음 | 되돌린다 |
| 디자인에 없는 대비·focus 변경 | 디자인으로 되돌리고 소유 스킬과 함께 충돌을 보고한다 |
| 빌드 screenshot 없이 비교했다고 주장 | frame 너비마다 렌더하거나 확인되지 않았다고 쓴다 |
| 보고에 언급 없는 하드코딩 샘플 데이터 | `Unwired` 아래에 적는다 |

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 3개, 합계 8,735B다. `SKILL.md` 6,085B, `figma.md` 2,543B, `agents/openai.yaml` 107B를 끝까지 읽었다. 30개 이하라 모두 `@source`로 선언했다.
- 관계 확인용으로 `better-accessibility`, `better-colors`, `better-typography`, `better-layout`, `better-writing`, `better-ui`, `interface-review`, `variant`, `break`의 `SKILL.md` 앞 몇 줄만 읽었다. 위 개수에 넣지 않았다.
- 구조·표본만 확인한 파일: 없음. 바이너리: 없음. 제외한 파일: 없음. 번역본: 없음.
- 다른 컬렉션에 이름이 같은 스킬은 없다(`design/relations.md`).
- 원문 대조 범위: 호출 제한(frontmatter와 `agents/openai.yaml`에 제한 필드 없음), 단계별 완료 조건(1단계, 4단계), 멈춤 지점(Figma 도구 부재·로그인, 2px 초과 반올림·다른 color step, 대응 컴포넌트 없음, 5단계 보고 뒤), 점검표 9행, 수치(2px, 한 frame에 한 번의 `get_design_context`, `1-2` → `1:2`), 관계 행 r135~r143 아홉 행을 모두 대조했다.
- 원장 r135~r143의 "충돌을 X에 보고한다"는 원문(SKILL.md 12줄, 67줄)에 맞춰 읽으면 "최종 보고에 소유 스킬 이름을 달아 적는다"이다. 소유 스킬을 호출하지는 않는다.[](source:bd-owner)[](source:bd-rep)
- 분석 중 바뀐 파일: 없음. `design/` 작업 트리는 commit `0465878` 그대로다.

@callout level=open-question title="확인하지 못한 것"
- 이 스킬이 실제로 에이전트 동작을 바꾸는지는 실행하지 않아 확인하지 않았다. 페이지의 모든 동작은 지시상 동작이다.
- `figma.md`가 적은 도구 이름과 반환값이 현재 공식 Figma MCP 서버와 맞는지는 서버를 호출하지 않아 확인하지 않았다.
- 원문은 "서버에 Figma 스킬이 딸려 오면 먼저 로드하라"고 하지만 그 스킬의 이름과 위치는 적지 않는다(`원문에 명시 없음`). 이 스킬은 `design/` 컬렉션 밖이라 `범위 밖`이다.[](source:fg-head)
- 브라우저 없이 끝나는 경우의 종료 조건("확인되지 않았다고 말한다" 뒤 무엇을 하는지)은 원문이 더 적지 않는다.[](source:bd-browser)
