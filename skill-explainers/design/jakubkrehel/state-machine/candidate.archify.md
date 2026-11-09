# state-machine 스킬은 에이전트를 어떻게 바꾸나 {#state-machine-skill}

`state-machine`을 부르면 에이전트는 사용자가 고른 컴포넌트 하나를 앱 안의 임시 route에 올리고, 코드에 이미 있는 상태마다 mock 데이터를 넣어 전환기(`switcher`)로 넘겨 볼 수 있게 한다. 에이전트는 URL·상태 목록·전환 키만 건네고 멈춘다. 컴포넌트는 고치지 않고, 화면 모양을 바꾸는 일은 사용자의 다음 요청이며, 임시 페이지는 사용자가 말할 때만 지운다.[](source:sm-what)[](source:sm-s6b)[](source:sm-remove)

- 켜지는 때: 사용자가 직접 부를 때만이다. SKILL.md에 `disable-model-invocation: true`가, `agents/openai.yaml`에 `allow_implicit_invocation: false`가 있다.[](source:sm-fm)[](source:sm-oy)
- 강제하는 것: 프로젝트의 실제 컴포넌트를 그대로 import한다. 코드가 닿을 수 있는 상태만 그린다. 데이터는 컴포넌트가 받는 자리에서 넣는다. 로딩은 전환기가 움직일 때까지 멈춰 둔다.[](source:sm-s3a)[](source:sm-unreach)[](source:sm-s4)[](source:sm-s4d)
- 하지 않는 것: 컴포넌트에 branch를 더하는 일, 적대적 시나리오를 쌓는 스트레스 테스트, 대안 디자인 탐색, 끝난 작업 리뷰다.[](source:sm-unreach)[](source:sm-split)
- 사람이 개입하는 곳: 범위가 여럿이면 어느 것인지 묻는다. 컴포넌트를 고쳐야만 데이터가 들어가면 seam(데이터를 끼워 넣는 자리)을 더하기 전에 묻는다. 삭제는 사용자가 말한 뒤에 한다.[](source:sm-s1)[](source:sm-s4b)[](source:sm-remove)

@answer scope="design/jakubkrehel/state-machine · 텍스트 3개 13,450B · 커밋 0465878 · 지시상 동작"
@meta locale=ko
@source sm-fm title="design/jakubkrehel/state-machine/SKILL.md · 6295B · 지시 본문과 frontmatter" path=design/jakubkrehel/state-machine/SKILL.md lines=1:5
@source sm-what title="SKILL.md · 하는 일 한 가지" path=design/jakubkrehel/state-machine/SKILL.md lines=9:9
@source sm-split title="SKILL.md · 워크벤치이고 리뷰가 아니라는 구분과 다른 스킬의 몫" path=design/jakubkrehel/state-machine/SKILL.md lines=11:11
@source sm-s1 title="SKILL.md · 1단계 컴포넌트 하나로 좁히기" path=design/jakubkrehel/state-machine/SKILL.md lines=15:17
@source sm-kinds title="SKILL.md · 2단계 상태 종류 표" path=design/jakubkrehel/state-machine/SKILL.md lines=21:27
@source sm-unreach title="SKILL.md · 2단계 닿을 수 없는 상태는 상태가 아니다" path=design/jakubkrehel/state-machine/SKILL.md lines=29:29
@source sm-write title="SKILL.md · 2단계 목록을 적고 이름·그룹 제목 정하기" path=design/jakubkrehel/state-machine/SKILL.md lines=31:31
@source sm-s3a title="SKILL.md · 3단계 scratch route와 실제 컴포넌트" path=design/jakubkrehel/state-machine/SKILL.md lines=35:35
@source sm-s3b title="SKILL.md · 3단계 서버·클라이언트 경계" path=design/jakubkrehel/state-machine/SKILL.md lines=37:37
@source sm-s3c title="SKILL.md · 3단계 컨테이너 폭과 한 폴더" path=design/jakubkrehel/state-machine/SKILL.md lines=39:39
@source sm-s4 title="SKILL.md · 4단계 데이터를 넣는 순서" path=design/jakubkrehel/state-machine/SKILL.md lines=43:46
@source sm-s4b title="SKILL.md · 4단계 깊은 props와 seam 승인" path=design/jakubkrehel/state-machine/SKILL.md lines=48:48
@source sm-s4c title="SKILL.md · 4단계 제품처럼 보이는 데이터" path=design/jakubkrehel/state-machine/SKILL.md lines=50:50
@source sm-s4d title="SKILL.md · 4단계 로딩은 멈춰 둔다" path=design/jakubkrehel/state-machine/SKILL.md lines=52:52
@source sm-s5 title="SKILL.md · 5단계 전환기" path=design/jakubkrehel/state-machine/SKILL.md lines=56:56
@source sm-s6a title="SKILL.md · 6단계 모든 상태를 그려 보기" path=design/jakubkrehel/state-machine/SKILL.md lines=60:60
@source sm-s6b title="SKILL.md · 6단계 브라우저가 없을 때와 넘기고 멈춤" path=design/jakubkrehel/state-machine/SKILL.md lines=62:64
@source sm-recheck title="SKILL.md · 변경 뒤 모든 상태 다시 보기" path=design/jakubkrehel/state-machine/SKILL.md lines=68:68
@source sm-remove title="SKILL.md · 사용자가 말하면 한 번에 지우기" path=design/jakubkrehel/state-machine/SKILL.md lines=72:72
@source sm-mis title="SKILL.md · 마무리 전 실수 표" path=design/jakubkrehel/state-machine/SKILL.md lines=76:90
@source sw-out title="design/jakubkrehel/state-machine/switcher.md · 6978B · 전환기 규격" path=design/jakubkrehel/state-machine/switcher.md lines=3:9
@source sw-list title="switcher.md · 그룹 목록" path=design/jakubkrehel/state-machine/switcher.md lines=11:16
@source sw-beh title="switcher.md · 동작 규칙" path=design/jakubkrehel/state-machine/switcher.md lines=18:26
@source sw-place title="switcher.md · 배치와 수치" path=design/jakubkrehel/state-machine/switcher.md lines=62:71
@source sw-btn title="switcher.md · 버튼 CSS" path=design/jakubkrehel/state-machine/switcher.md lines=120:141
@source sw-cq title="switcher.md · 컨테이너 쿼리" path=design/jakubkrehel/state-machine/switcher.md lines=181:201
@source sw-end title="switcher.md · 프레임워크에서의 변환" path=design/jakubkrehel/state-machine/switcher.md lines=204:204
@source sm-oy title="design/jakubkrehel/state-machine/agents/openai.yaml · 177B · 호출 정책" path=design/jakubkrehel/state-machine/agents/openai.yaml lines=1:5
@source vr-fm title="design/jakubkrehel/variant/SKILL.md · r107 확인용 frontmatter" path=design/jakubkrehel/variant/SKILL.md lines=1:5
@source vr-split title="variant/SKILL.md · r107 확인용 역할 구분" path=design/jakubkrehel/variant/SKILL.md lines=11:11
@source vr-btn title="variant/picker.md · 전환기와 비교한 버튼 CSS" path=design/jakubkrehel/variant/picker.md lines=120:142
@source br-fm title="design/jakubkrehel/break/SKILL.md · r122 확인용 frontmatter" path=design/jakubkrehel/break/SKILL.md lines=1:5
@source br-split title="break/SKILL.md · r115 확인용 역할 구분" path=design/jakubkrehel/break/SKILL.md lines=11:11
@source ir-fm title="design/jakubkrehel/interface-review/SKILL.md · r124 확인용 frontmatter" path=design/jakubkrehel/interface-review/SKILL.md lines=1:5

## 언제 켜지고, 언제 다른 스킬로 가야 하나 {#trigger}

@code source=sm-fm language=yaml

@code source=sm-oy language=yaml

두 파일 모두 암묵 호출을 막는다. 판정: 모델이 `description`만 보고 스스로 켜는 스킬이 아니라 사용자가 직접 불러야 하는 스킬로 읽힌다. 원문은 이 필드가 실행 환경에서 어떻게 처리되는지 설명하지 않는다(`원문에 명시 없음`).[](source:sm-fm)[](source:sm-oy) `description`은 모델이 참고하는 설명이지 정확히 일치해야 하는 사전이 아니다.

입력은 사용자가 고른 컴포넌트 하나다. 호출 인자 형식과 첫 응답 규칙은 `원문에 명시 없음`이다. 스킬은 스스로를 "리뷰가 아니라 워크벤치"라고 부르고, 페이지가 떠 있는 동안 사용자가 화면을 다듬는다고 설명한다.[](source:sm-split)

원문은 아래 일을 다른 스킬의 몫이라고 이름을 들어 적는다.[](source:sm-split)

| 하려는 일 | 이 스킬 대신 | 그 스킬이 켜지는 방식 |
| --- | --- | --- |
| 적대적 시나리오를 한 페이지에 쌓아 한 번 본다 | `break` {caution:범위 밖} | `disable-model-invocation: true`. 사용자가 직접 불러야 한다[](source:br-fm) |
| 대안 디자인을 탐색한다 | `variant` {caution:범위 밖} | `disable-model-invocation: true`. 사용자가 직접 불러야 한다[](source:vr-fm) |
| 끝난 작업을 리뷰한다 | `interface-review` {caution:범위 밖} | `disable-model-invocation: true`. 사용자가 직접 불러야 한다[](source:ir-fm) |

판정: 세 스킬 모두 모델이 스스로 켤 수 없으므로, 에이전트가 이쪽으로 넘길 때는 사용자에게 그 스킬을 부르라고 안내하는 형태가 된다. 원문은 넘기는 방법을 적지 않는다(`원문에 명시 없음`).

## 어떤 순서로 만들고, 어디서 멈추나 {#workflow}

번호 단계는 6개다. 6단계에서 mock이 안 보이면 4단계의 배관으로 돌아가고, 화면을 바꾼 뒤에는 모든 상태를 다시 본다. 삭제는 번호가 없는 마지막 절이다.[](source:sm-s6a)[](source:sm-recheck)[](source:sm-remove)

@workflow id=state-flow title="state-machine 6단계와 뒷일"
| lane prep | 고르기 |
| lane build | 만들기 |
| lane check | 확인하고 넘기기 |
| lane after | 뒷일 |
| st-scope | 1 컴포넌트 하나 | backend | prep |
| st-find | 2 상태 찾기 | backend | prep |
| st-page | 3 임시 페이지 | backend | build |
| st-data | 4 상태별 데이터 | backend | build |
| st-switch | 5 전환기 | backend | build |
| st-check | 6 모두 그려지나? | backend | check |
| st-hand | 넘기고 멈춤 | external | check |
| st-change | 화면을 바꾼 뒤 | external | after |
| st-remove | 사용자 말 뒤 삭제 | backend | after |
| st-scope > st-find | |
| st-find > st-page | |
| st-page > st-data | |
| st-data > st-switch | |
| st-switch > st-check | |
| st-check > st-hand | 예 | emphasis |
| st-check > st-data | 아니오 | dashed |
| st-hand > st-change | |
| st-change > st-check | 전부 다시 | dashed |
| st-hand > st-remove | 사용자 말 | emphasis |

@steps id=state-steps
| st-scope | 1 컴포넌트 하나 | 한 번에 컴포넌트 하나만 다룬다. 원문 예는 audit log 표, network 패널, billing 카드다. "설정 페이지"는 여러 컴포넌트에 걸치므로 목록으로 나열하고 어느 것인지 묻는다. 그 뒤 컴포넌트가 보여 주는 것, 제품에서 그려지는 곳, 데이터의 출처를 한 문장으로 다시 적는다.[](source:sm-s1) | state-flow | st-scope |
| st-find | 2 상태 찾기 | 컴포넌트와 data hook을 읽어 코드에 이미 있는 branch를 모두 찾는다. 만들기 전에 한 줄씩 적는다. 이름은 제품이 부르는 대로(`empty`, `enterprise`, `member-no-access`), 그룹 제목도 제품의 말로 쓴다(`Data`, `Account`, `Connection`, `Access`). 버린 종류와 이유는 한 줄로 말한다. 종류를 합치는 것은 코드가 그 조합으로 분기할 때만이다(`member-empty`). 곱집합은 만들지 않는다.[](source:sm-write) | state-flow | st-find |
| st-page | 3 임시 페이지 | 앱 안의 scratch route에 프로젝트의 실제 컴포넌트를 손대지 않고 import한다. 앱의 layout·글꼴·전역 스타일·provider를 그대로 물려받는다. 서버와 클라이언트 컴포넌트를 나누는 프레임워크에서는 페이지가 클라이언트 코드여야 한다(Next는 `"use client"`). 아니면 fixture가 경계를 넘다 사라져 빈 화면이 될 수 있다. 컴포넌트 하나를 프로덕션과 같은 폭의 컨테이너에 그린다. 페이지·fixture·전환기는 한 폴더에 둔다(예: `/states/audit-log`).[](source:sm-s3a)[](source:sm-s3b)[](source:sm-s3c) | state-flow | st-page |
| st-data | 4 상태별 데이터 | 데이터는 컴포넌트가 받는 자리에서 페이지가 넣는다. 첫째는 props, 둘째는 앱 자체의 data seam(시드한 query cache, mock provider, 프로젝트의 request mock)이다. 컴포넌트를 고쳐야만 들어가면 그렇다고 말하고 seam을 더하기 전에 묻는다. 이름·시각·금액·항목 수는 제품에 실제로 있는 모양으로 쓴다. 로딩과 pending 상태는 timeout으로 풀지 않고 전환기가 움직일 때까지 멈춰 둔다.[](source:sm-s4)[](source:sm-s4b)[](source:sm-s4c)[](source:sm-s4d) | state-flow | st-data |
| st-switch | 5 전환기 | 컴포넌트 옆의 그룹 목록이 `__state` search param을 바꿔서 모든 상태가 링크가 된다. 옆에 자리가 없으면 같은 그룹을 가진 `select`를 컴포넌트 위에 둔다. 이중 밑줄은 앱 layout이 읽는 param과 겹치지 않게 한다. 규격은 `switcher.md`에 있다.[](source:sm-s5) | state-flow | st-switch |
| st-check | 6 모두 그려지나? | 브라우저가 이미 있으면 한 번 띄워 모든 상태를 넘겨 본다. 컴포넌트가 mock 데이터를 보여야 하고 진짜 데이터나 빈 영역이면 안 된다. mock이 안 보이는 일이 흔한 실패다. 원인은 live sync, seed를 덮어쓰는 refetch, fixture를 떨구는 서버 경계다. 넘기기 전에 배관을 고친다. 브라우저가 없으면 없다고 말하고 URL을 넘겨 사용자가 확인하게 한다.[](source:sm-s6a)[](source:sm-s6b) | state-flow | st-check |
| st-hand | 넘기고 멈춤 | URL, 상태 목록, 전환 키를 건네고 멈춘다. 상태의 모양을 바꾸는 일은 사용자의 다음 요청이고 이번 작업에 속하지 않는다.[](source:sm-s6b) | state-flow | st-hand |
| st-change | 화면을 바꾼 뒤 | 시각을 바꾼 뒤에는 모든 상태를 다시 넘겨 본다. 한 상태를 고치면 다른 상태가 깨지는 일이 흔해서다.[](source:sm-recheck) | state-flow | st-change |
| st-remove | 사용자 말 뒤 삭제 | 사용자가 말하면 페이지 폴더와 사용자가 승인한 seam을 지운다. 그 뒤 route와 fixture 이름을 코드베이스에서 검색하고, diff가 이 설정 외에는 건드리지 않았는지 확인한다. 만든 같은 턴에는 지우지 않는다.[](source:sm-remove)[](source:sm-mis) | state-flow | st-remove |

멈추는 지점은 두 곳이다. 6단계 뒤 넘기고 멈추는 곳과, 삭제를 사용자 말까지 미루는 곳이다. 원문은 상태 목록을 적은 뒤 사용자 확인을 기다리라고 쓰지 않는다(`원문에 명시 없음`).[](source:sm-s6b)[](source:sm-remove)

## 무엇을 강제하고, 상태는 어디서 찾나 {#rules}

상태는 새로 만드는 것이 아니라 컴포넌트가 이미 가진 branch다. 원문은 찾을 곳을 세 종류로 나눈다.[](source:sm-kinds)

| 종류 | 찾을 상태 후보 |
| --- | --- |
| Data(8개) | 로딩, 비어 있음, 에러, 항목 하나, 보통 규모, 스크롤·페이지가 필요한 규모, 일부 요청만 끝나고 나머지는 pending, 오래된 데이터를 refetch하는 중[](source:sm-kinds) |
| Account(3개) | plan 등급, 역할·권한 확인, owner와 member[](source:sm-kinds) |
| Feature(4개) | flag, trial, 한도 도달, 비활성 또는 잠긴 기능[](source:sm-kinds) |

코드가 닿을 수 없는 상태는 상태가 아니다. 그 상태를 보이려고 branch를 더하지 않는다. 디자인에는 있고 코드에는 없는 상태는 "없는 상태"로 목록에 적고 페이지에서는 뺀다.[](source:sm-unreach)

규칙은 마무리 전 실수 표 13행에 가장 촘촘하다. 각 행이 어긴 모습과 고치는 법이다.[](source:sm-mis)

| 실수 | 고치는 법 |
| --- | --- |
| 컴포넌트를 고쳐서 fixture를 받게 했다 | 페이지에서 props나 앱의 data seam으로 넣는다. seam을 더하기 전에 묻는다 |
| 비슷하게 다시 만든 컴포넌트를 올렸다 | 프로젝트의 실제 컴포넌트를 import한다 |
| 페이지가 컴포넌트를 다시 꾸미거나 테마를 바꾼다 | 앱의 layout·글꼴·token을 그대로 둔다 |
| fixture를 트리 깊은 곳까지 props로 내려 보냈다 | 컴포넌트가 데이터를 받는 자리에서 넣는다 |
| 상태를 보이려고 컴포넌트에 branch를 더했다 | 코드가 닿을 수 없는 상태는 빼고 없는 상태는 목록에 적는다 |
| "Item 1", "Test user", 세 줄 | 제품처럼 생긴 데이터와 실제 수량 |
| 로딩이 timeout 뒤에 풀린다 | 전환기가 움직일 때까지 멈춰 둔다 |
| 상태를 하나도 안 띄우고 넘겼다 | 모든 상태를 띄운다. 빈 화면이나 진짜 데이터면 배관이 깨진 것이다 |
| 전환기에 프로젝트 token을 입혔다 | 디자인 시스템 밖에 눈에 띄게 둔다 |
| 상태마다 탭 하나씩 한 줄로 늘어놓았다 | 컴포넌트 옆의 스스로 스크롤하는 그룹 목록, 안 들어가면 위의 select |
| 시켜 보지 않은 화면을 바꿨다 | 넘기고 기다린다 |
| 만든 같은 턴에 페이지를 지웠다 | 사용자가 말할 때만 지운다 |
| 지운 뒤 route·fixture 이름이 남았다 | 지운 뒤 둘 다 검색한다 |

@facts
| 상태 후보 | Data 8 + Account 3 + Feature 4 = 15개(원문 표의 후보 수이고 의무가 아닌 길잡이다)[](source:sm-kinds) |
| 탭 줄의 한계 | 약 7개를 넘으면 화면 밖으로 간다(원문 설명). 그룹 목록은 30개에서도 훑을 만하다[](source:sw-list) |
| 이름 예시 | `empty`, `enterprise`, `member-no-access`, `member-empty`[](source:sm-write) |

## 전환기는 어떻게 만들어야 하나 {#switcher}

`switcher.md`는 전환기의 규격이다. "판단하려는 것 옆에 놓이므로 규격대로 만들고 건드리지 않는다"가 출발점이다.[](source:sw-out) 구조와 CSS는 `variant`의 `picker.md`와 이름만 다르다. 상태 이름은 2단계 그룹 제목에서 가져온다.[](source:sw-list)

| 규칙 | 내용 |
| --- | --- |
| 디자인 시스템 밖 | 프로젝트의 token·글꼴·색을 쓰지 않는다. 어두운 중립 면 하나, 시스템 글꼴, 프로젝트 변수 없음. 어두운 면은 밝은 페이지와 어두운 페이지 모두에서 도구 chrome으로 읽히므로 테마를 따르지 않는다[](source:sw-out) |
| 그룹 목록 | 세로 목록이고 그룹 제목은 2단계에서 정한 이름이다. 그룹이 하나뿐이어도 제목이 있고 제목마다 같은 작은 화살표 아이콘이 붙는다. 상태와 그룹은 적은 순서를 유지한다[](source:sw-list) |
| URL이 원천 | `__state` search param을 쓰고 읽는다. 그래서 상태마다 링크다[](source:sw-beh) |
| 방향키 | 위·아래·좌·우 키가 목록 순서대로 그룹을 넘어 모든 상태를 지난다[](source:sw-beh) |
| `H` 키 | 전환기(목록과 select 모두)를 숨기거나 보인다. screenshot과 화면 녹화용이다[](source:sw-beh) |
| 키 입력 제외 | 수정 키가 눌린 이벤트, 이미 `defaultPrevented`인 이벤트, input·textarea·select·contenteditable에서 온 이벤트는 무시한다[](source:sw-beh) |
| 접근성 | 활성 버튼에 `aria-pressed="true"`를 달고 목록 안에서 보이도록 스크롤한다. 목록에 라벨이 있고 각 그룹은 제목이 라벨인 `role="group"`이다[](source:sw-beh) |
| 전환 | 컴포넌트는 즉시 바뀌고 스크롤 위치를 유지한다[](source:sw-beh) |
| 배치 | 목록과 `select`를 항상 둘 다 그리고 `container query`가 하나만 보이게 한다. 크기를 바꿔도 활성 상태가 남는다[](source:sw-beh) |

좁은 곳에서는 `select`가 컴포넌트 위에 놓이고, 휴대폰에서는 네이티브 메뉴가 열린다. 넓은 곳에서는 목록이 왼쪽에 붙어(sticky) 있다가 뷰포트보다 길어지면 안에서 스크롤한다.[](source:sw-place)

@facts
| 전환 폭 | 목록 208px + 간격 24px = 232px에 컴포넌트의 프로덕션 폭을 더한 값. 원문 CSS 예시는 컴포넌트 644px라서 876px(208 + 24 + 644)이다[](source:sw-place)[](source:sw-cq) |
| 목록 안쪽 여백 | 6px. 목록이 스스로 스크롤할 때 focus ring이 잘리지 않게 한다[](source:sw-place) |
| 프로덕션 폭 반영 | `max-width`와 grid 열에 프로덕션 폭을 넣고 query는 232px에 그 폭을 더해 맞춘다[](source:sw-place) |

@callout level=warning title="원문 안의 어긋남: 굵기 전환"
`switcher.md`의 동작 규칙은 "활성 라벨의 굵기만 부드럽게 바뀐다"고 쓴다.[](source:sw-beh) 그런데 같은 파일의 버튼 CSS는 `transition: color 200ms ease-out`만 있고, 활성 상태에 `font-weight`가 없다.[](source:sw-btn) `variant`의 `picker.md`는 `transition`에 `font-weight 200ms ease-out`이 있고 활성 상태에 `font-weight: 500`이 있다.[](source:vr-btn) 판정: CSS를 그대로 옮기면 굵기는 변하지 않으므로 문장과 CSS 중 어느 쪽이 의도인지 원문만으로 알 수 없다. 두 파일의 다른 줄은 이름(state·variant 등)뿐이다(분석자가 두 파일을 줄 단위로 비교).

원문은 HTML 구조와 CSS만 준다. 키 처리·URL 읽기·`H` 키를 구현하는 스크립트는 없다(`원문에 명시 없음`). 프레임워크에서는 클래스 이름과 구조를 그대로 두고 렌더링 문법만 바꾸라고 한다.[](source:sw-end)

## 흐름 속 위치 {#position}

`state-machine`은 묶음 `component-workbench`에 속한다. 같은 묶음의 `break`, `variant`와 순서로 이어지지 않고, 원장의 관계는 모두 역할 구분 참고다. 이 스킬이 부르는 다른 스킬은 없다.[](source:sm-split)

@workflow id=state-position title="state-machine 앞뒤"
| p-user | 사용자 명시 호출 | external |
| p-sm | state-machine | backend |
| p-out | URL·상태 목록·전환 키 | external |
| p-user > p-sm | 컴포넌트 하나 | emphasis |
| p-sm > p-out | 넘기고 멈춤 | emphasis |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| 사용자(앞) | 고른 컴포넌트 하나 | - | 명시 호출만 받으므로 실제 시작점은 사람이다[](source:sm-fm) | - |
| `break` | - | - | 역할 구분. 적대적 시나리오를 한 페이지에 쌓아 한 번 보는 일은 그쪽 몫이다. `break`도 "제품 상태를 한 번에 하나씩 작업하는 일은 `state-machine`"이라고 가리킨다[](source:sm-split)[](source:br-split) | r122 · r115 |
| `variant` | - | - | 역할 구분. 대안 디자인 탐색은 그쪽 몫이다. `variant`도 "컴포넌트 상태를 하나씩 작업하는 일은 `state-machine`"이라고 가리킨다[](source:sm-split)[](source:vr-split) | r123 · r107 |
| `interface-review` | - | - | 역할 구분. 끝난 작업 리뷰는 그쪽 몫이다. `interface-review`는 명시 호출만 된다[](source:sm-split)[](source:ir-fm) | r124 |
| (뒤) | - | URL, 상태 목록, 전환 키 | 받는 쪽은 사용자다. 모양을 바꾸는 일은 사용자의 다음 요청이다[](source:sm-s6b) | - |

그림에는 사용자 시작과 사용자에게 넘기는 것만 그렸다. 원장의 r107, r115, r122~r124는 모두 "그 일은 저 스킬의 몫"이라는 참고라 순서가 없어서 표에만 남겼다. `state-machine`에서 나가는 관계가 셋이고(r122~r124), 들어오는 관계가 둘이다(r107, r115). 원문은 이 스킬이 어느 스킬을 실행하거나, 어느 스킬이 이 스킬을 실행한다고 쓰지 않는다.

전체 흐름은 `design/_group-component-workbench/component-workbench.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 3개, 합계 13,450B다. `SKILL.md` 6,295B, `switcher.md` 6,978B, `agents/openai.yaml` 177B를 끝까지 읽었다. 구조·표본만 확인한 파일(부분 읽음)은 0개다.
- 관계 확인용으로 다른 스킬 3개의 해당 줄만 읽었다. `variant`의 frontmatter와 11줄(그리고 `picker.md` 120~142줄), `break`의 frontmatter와 11줄, `interface-review`의 frontmatter다. 이 파일들은 위 개수에 넣지 않았다.
- 제외한 파일: 없음. 번역본과 바이너리가 없고 `scripts/`·`assets/` 폴더도 없다(`find`로 확인).
- 다른 컬렉션에 이름이 같은 스킬은 없다(`design/relations.md`).
- 원문 대조 범위: 활성화 제한 2개(`disable-model-invocation`, `allow_implicit_invocation`), 번호 단계 6개와 뒷일 2개(재확인, 삭제), 상태 후보 15개(Data 8·Account 3·Feature 4), 데이터 넣는 순서 2개, 마무리 전 실수 표 13행, 전환기 동작 규칙 7개를 모두 대조했다. 수치(약 7개·30개, 208px·24px·232px·644px·876px, 6px, `200ms`)를 대조했다. 관계 행 r107, r115, r122, r123, r124는 원장과 원문 줄을 다시 대조했고 같다. `interface-review`는 원장이 description 줄을 3줄로 적었지만 실제 3줄은 `disable-model-invocation: true`이고 description은 4줄이다.[](source:ir-fm)
- 분석 중 바뀐 파일: 없음. `design/` 작업 트리는 commit `0465878` 그대로다.
- 사람 검토: 미실시.

@callout level=open-question title="확인하지 못한 것"
- 이 스킬이 실제로 에이전트의 동작을 바꾸는지는 실행해 보지 않아 확인하지 않았다. 페이지의 모든 동작은 지시상 동작이다.
- 2단계에서 상태 목록을 적은 뒤 사용자 확인을 기다리라는 문장은 `원문에 명시 없음`이다. 원문에서 사람이 개입하는 곳은 1단계의 범위 질문, 4단계의 seam 승인, 삭제를 사용자 말까지 미루는 곳이다.[](source:sm-write)[](source:sm-s1)[](source:sm-s4b)[](source:sm-remove)
- 앱 안에 route를 만들 곳이 없을 때의 대체 방법은 `원문에 명시 없음`이다. `variant`는 독립 HTML 한 파일을 대안으로 적지만 이 스킬에는 같은 문장이 없다.[](source:sm-s3a)
- 사용자가 삭제를 "말하는" 형식과 seam을 "승인하는" 형식은 원문에 명시 없음이다. 승인 없이 seam을 더했을 때의 처리도 적혀 있지 않다.[](source:sm-s4b)[](source:sm-remove)
- 굵기 전환 문장과 CSS가 어긋나는 문제는 위 callout에 적었다.[](source:sw-beh)[](source:sw-btn)
