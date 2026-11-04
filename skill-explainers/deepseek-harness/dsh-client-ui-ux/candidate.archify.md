# dsh-client-ui-ux 스킬은 에이전트를 어떻게 바꾸나 {#dsh-client-ui-ux-skill}

`dsh-client-ui-ux`를 쓰면 에이전트는 제품 사용자에게 보이는 클라이언트 GUI를 바꿀 때, 린트가 잡지 못하는 판단을 따로 점검한다. 점검하는 것은 알림을 어디에 띄울지, 무엇을 재사용할지, 창 가장자리와 플랫폼별 window chrome(창 테두리와 제목 표시줄)에서 화면이 어떻게 동작할지다. 원문은 스스로 "완전한 체크리스트가 아니라 안내"라고 밝힌다.[](source:body-intro)

- 새 색·크기·컴포넌트를 만들기 전에, 에이전트는 대상 화면과 가장 가까운 형제 화면에서 이미 쓰는 값을 찾아 재사용한다.[](source:vis-token)
- 일시적 작업 결과는 만든 화면보다 오래 사는 호스트의 토스트로 알리고, 작업이 실패해도 데이터는 그대로 보여 준다.[](source:fb-toast)[](source:fb-fail)
- 메뉴·팝오버·툴팁은 병합 전에 닫힘, 뷰포트 안 위치, 잘림 없음 세 가지를 모두 확인한다.[](source:ov-intro)
- UI나 상호작용을 눈에 띄게 바꾸는 PR은 디자이너나 제품 리뷰를 받아야 한다.[](source:esc)

@answer scope="dsh-client-ui-ux · 파일 1개 · 커밋 475505c · 지시상 동작"
@meta locale=ko
@source skill-fm title="deepseek-harness/dsh-client-ui-ux/SKILL.md · 9486B · frontmatter" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=1:4
@source body-intro title="SKILL.md · 성격과 소유 문서" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=8:8
@source arch title="SKILL.md · Architecture prerequisites" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=10:15
@source vis-token title="SKILL.md · 토큰 재사용" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=19:19
@source vis-mode title="SKILL.md · 두 테마 확인" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=20:20
@source vis-weight title="SKILL.md · 글자 굵기" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=21:21
@source vis-size title="SKILL.md · 글자 크기" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=22:22
@source vis-align title="SKILL.md · 정렬과 비례" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=23:23
@source reuse-ext title="SKILL.md · 기존 요소 확장" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=27:27
@source reuse-icon title="SKILL.md · 아이콘" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=28:28
@source reuse-side title="SKILL.md · 오른쪽 사이드바" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=29:29
@source reuse-tip title="SKILL.md · Tooltip과 HoverCard" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=30:30
@source fb-intro title="SKILL.md · 피드백 자리 고르기" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=34:34
@source fb-toast title="SKILL.md · 토스트" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=36:36
@source fb-fail title="SKILL.md · 실패해도 데이터 유지" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=37:37
@source fb-inplace title="SKILL.md · in-place notice" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=38:38
@source fb-copy title="SKILL.md · 오류 문구" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=39:39
@source load title="SKILL.md · Loading states" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=43:45
@source ov-intro title="SKILL.md · 오버레이 세 조건" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=49:49
@source ov-dismiss title="SKILL.md · 닫힘" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=51:51
@source ov-fit title="SKILL.md · 뷰포트 안 위치" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=52:52
@source ov-clip title="SKILL.md · 잘림 없음" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=53:53
@source ov-scroll title="SKILL.md · 스크롤바" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=55:55
@source resp title="SKILL.md · Responsive layouts" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=59:59
@source plat-clear title="SKILL.md · macOS 제목 표시줄 여백" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=63:63
@source plat-sum title="SKILL.md · 총 오프셋 명시" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=64:64
@source sp-gap title="SKILL.md · 간격 점검" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=68:69
@source sp-axes title="SKILL.md · 정렬 축과 기준 화면" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=70:73
@source esc title="SKILL.md · Design review escalation" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=77:77
@source cr-list title="dsh-code-review/SKILL.md · 읽을 자료 목록(24줄)" path=deepseek-harness/dsh-code-review/SKILL.md lines=24:24
@source art-edge title="dsh-official-plugin-artwork/SKILL.md · 액션 아이콘 경계(17줄)" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=17:17
@source eh-head title="dsh-error-handling/SKILL.md · 절 제목(20줄)" path=deepseek-harness/dsh-error-handling/SKILL.md lines=20:20

## 언제 켜지고 어디까지 다루나 {#trigger}

@code source=skill-fm language=yaml

머리말에는 `name`과 `description`만 있고 호출 제한 필드가 없다.[](source:skill-fm) 판정: 모델이 `description`을 참고해 스스로 켤 수 있다. `description`은 판단용 설명이지, 특정 단어가 있으면 켜지는 목록이 아니다.

| 구분 | 원문 내용 |
| --- | --- |
| 대상 | `packages/client`에서 제품 사용자에게 보이는 GUI 동작을 추가·변경할 때, 또는 그런 PR을 리뷰할 때다.[](source:skill-fm) |
| 성격 | 안내이지 완전한 체크리스트가 아니다. 린트, 타입 검사, i18n 게이트가 내리지 못하는 판단을 맡는다.[](source:body-intro) |
| 다른 문서와의 분담 | 문구 품질은 `dsh-prose-standard`, 스타일링 소유와 토큰 규칙은 저장소 문서를 따른다. 이 스킬은 그 위에 판단을 더할 뿐 사본을 두지 않는다.[](source:body-intro) |
| 구조 규칙 | 컴포넌트를 다시 설계하기 전에 클라이언트 `AGENTS.md`와 컴포넌트 규칙 문서를 읽으라고 한다.[](source:arch) |

사람이 개입하는 곳은 마지막 디자인 리뷰뿐이다. 스킬 자체에는 사용자에게 묻는 단계가 원문에 명시 없음.

## 결과와 오류는 어디에 보여 주나 {#feedback}

에이전트는 실패 보고에 먼저 `dsh-error-handling`의 "Localized, actionable, visible reports" 절을 적용한다. 그다음 메시지의 수명이 그것을 만든 화면보다 긴지 짧은지로 보일 자리를 고른다.[](source:fb-intro)

@workflow id=feedback-flow title="메시지를 보일 자리 고르기"
| msg | 보일 결과·오류 | external |
| life | 일시적 작업 결과? | backend |
| toast | 앱 전체 토스트 | frontend |
| filled | 패널에 내용 있나? | backend |
| compact | 내용 옆 작은 알림 | frontend |
| full | 가운데 전체 오류 화면 | frontend |
| msg > life | |
| life > toast | 예 | emphasis |
| life > filled | 아니오 | |
| filled > compact | 예 | |
| filled > full | 아니오 | |

@steps id=feedback-steps
| st-life | 일시적 작업 결과? | 에이전트가 삭제처럼 한 번의 작업 결과인지, 조회 실패·필드 검증처럼 화면 자체의 상태인지 가른다. | feedback-flow | life |
| st-toast | 앱 전체 토스트 | 토스트의 상태와 렌더링은 토스트를 만든 화면보다 오래 사는 호스트에 둔다. 성공과 실패를 알리고, 진행 중 상태는 알리지 않는다. | feedback-flow | toast |
| st-filled | 패널에 내용 있나? | 화면 자체의 상태일 때만 이 질문을 한다. | feedback-flow | filled |
| st-compact | 내용 옆 작은 알림 | 내용이 채워진 패널은 남긴 내용 옆에 작은 알림을 둔다. 조회 실패라면 Retry 동작이 함께 있다. | feedback-flow | compact |
| st-full | 가운데 전체 오류 화면 | 패널이 비어 있을 때만 오류 상태를 가운데에 크게 보여 준다. | feedback-flow | full |

원문은 "일시적 작업 결과"와 "화면 자체의 상태" 두 갈래만 적는다. 둘 중 어느 쪽인지 애매한 메시지를 어떻게 가르는지는 원문에 명시 없음.[](source:fb-toast)[](source:fb-inplace)

| 규칙 | 원문 어조 |
| --- | --- |
| 일시적 작업 결과는 앱 전체 `Toast`를 쓰고 in-place notice(작업한 자리에 바로 띄우는 알림)를 쓰지 않는다.[](source:fb-toast) | 지시 |
| 토스트의 상태와 렌더링은 `shell.overlay` 항목(예: `RowActionToast`)처럼 오래 사는 호스트에 둔다. 화면이 직접 그리면 그 화면과 함께 사라진다. 삭제가 패널이나 탭을 닫을 수 있기 때문이다.[](source:fb-toast) | 지시 |
| 실패한 작업은 데이터를 계속 보여 준다. 삭제가 실패하면 행을 남기고 토스트가 실패를 알린다. 일시적 작업의 오류를 보여 주려고 내용을 비우지 않는다.[](source:fb-fail) | 금지 {bad:내용 비우기} |
| 오류 문구는 쉬운 말로 짧게 쓴다. 내부 용어와 기술 명사는 디버깅에 필요한 오류 코드가 아니면 쓰지 않는다. 한 문장을 권장하고, 두 문장으로 설명되는 내용을 문단으로 늘리지 않는다.[](source:fb-copy) | 지시와 권고 |
| 두 문장 이하의 중국어 알림은 끝의 마침표(`。`)를 생략한다.[](source:fb-copy) | 지시 |
| 알림이 기존 레이아웃을 깨면 안 된다. 자리를 미리 잡거나 위에 덮고, 이웃 요소를 밀지 않는다.[](source:fb-copy) | 필수 |

## 시각·재사용·로딩에서 무엇을 강제하나 {#visual-rules}

원문 어조를 그대로 옮긴다. "필수"는 `must`·`requires`로 쓴 것, "금지"는 `never`·`do not`으로 쓴 것, "권고"는 `prefer`로 쓴 것이다. 나머지는 "지시"다.

| 규칙 | 원문 어조 |
| --- | --- |
| 색, 반지름, 간격은 기존 토큰을 쓴다. 리터럴 값을 넣기 전에 대상 페이지와 가장 가까운 형제 페이지(전체 페이지는 보통 Plugins 페이지)에서 쓰는 값을 찾아 따른다. 토스트, 메뉴, 메시지 안 아티팩트 미리보기, 사이드바 탭 배치, 페이지 패딩 같은 처리 전체도 이미 있으면 재사용한다.[](source:vis-token) | 지시 |
| 모든 색은 밝은 테마와 어두운 테마에서 읽혀야 한다. 흐린 색은 장식에는 맞지만 글자에 쓰려면 두 테마를 모두 확인한다.[](source:vis-mode) | 필수 |
| 새로 만들거나 고치는 기능 CSS에서 글자 굵기는 500까지다. 600 이상으로 강조하지 않고 크기나 색으로 구분한다. 마크다운 타이포 토큰(ui-theme 소유)은 예외다.[](source:vis-weight) | 금지 {bad:600 이상} |
| 글자 크기는 역할이 맞는 테마 타이포 변수, 없으면 그 페이지의 기존 크기에서 고른다. 나란한 내용은 같은 크기를 쓰고, 요소 하나만을 위한 크기를 만들지 않는다. 한 페이지의 크기 종류는 적게 유지한다. 13px가 기존 행·상세 크기다.[](source:vis-size) | 지시와 금지 |
| 아이콘과 글자, 이웃 요소는 의도한 축(기준선, 세로 중앙, 공유 가장자리)에 맞춘다. 아이콘 크기는 옆 글자와 비례해야 한다. 어디에도 맞지 않거나 이웃보다 눈에 띄게 큰 요소는 내보내지 않는다.[](source:vis-align) | 금지 |
| 새 컴포넌트를 만들기 전에 기존 컴포넌트·컨테이너·상호작용을 확장한다. 기존 메뉴에 항목 하나를 더하는 편이 옆에 평행 요소를 쌓는 것보다 낫다.[](source:reuse-ext) | 지시 |
| 아이콘은 기존 아이콘 라이브러리에서 의미가 가장 가까운 것을 고른다. 새 글리프는 디자이너 승인이 있어야 들어간다. 그런 PR을 리뷰할 때는 디자이너 리뷰를 요청하라고 제안한다.[](source:reuse-icon) | 필수 |
| 오른쪽 사이드바 내용은 기존 사이드바에 슬롯을 등록하고 별도 사이드바를 만들지 않는다. 모든 사이드바 탭은 의미에 맞는 탭 아이콘을 선언한다.[](source:reuse-side) | 금지와 지시 |
| 뜻이 뻔하지 않은 아이콘 전용 동작에는 `Tooltip`을 둔다. 포인터를 올려 두거나 선택해야 하는 정보에는 `HoverCard`를 쓴다. 임시 `title` 속성보다 이 공유 프리미티브를 권한다.[](source:reuse-tip) | 지시와 권고 |
| 목록은 스켈레톤을 쓰고, 그 밖의 페이지 단위 로딩은 가운데에 맨 스피너를 둔다. 스피너를 페이지 모서리에 두지 않는다.[](source:load) | 금지 |
| 페이지·컴포넌트마다 로딩 처리는 하나다. 동시에 로딩하는 영역이 제각각 다른 모양을 깜빡이지 않게 한다. 맥락이 필요하지 않으면 로딩 문구를 쓰지 않는다(좁은 사이드바는 거의 필요 없다).[](source:load) | 지시 |

## 오버레이·플랫폼·간격·디자인 리뷰는 어떻게 점검하나 {#window-rules}

@callout level=warning title="한 페이지를 고치려고 전역 여백 변수를 바꾸지 않는다"
macOS에서 제목 표시줄 여백은 `--dsh-frame-top-clearance`다. `Menu`, `Modal`, 오버레이 프리미티브가 이 값을 위쪽 안전 여백으로 쓴다. 그래서 한 페이지를 맞추려고 이 변수를 바꾸면, 이 프리미티브를 쓰는 곳이 모두 함께 달라진다. 한 페이지의 어긋남은 그 페이지의 inset에 범위를 좁힌 `[data-platform='darwin']` override로 고치고, 페이지 스타일시트 spec에서 그 override를 단언한다.[](source:plat-clear)

모든 메뉴, 팝오버, 툴팁은 병합 전에 아래 세 가지를 모두 확인한다.[](source:ov-intro)

| 조건 | 확인할 것 |
| --- | --- |
| 닫힘 | 바깥 클릭으로 닫히고, 포커스를 받는 요소는 Escape로도 닫힌다.[](source:ov-dismiss) |
| 뷰포트 안 위치 | 가장자리 여백을 두고 창 안으로 미끄러지거나 뒤집힌다. 실제로 들어가는 쪽으로만 뒤집으며, 어느 쪽도 안 들어갈 때 왔다 갔다 하지 않는다.[](source:ov-fit) |
| 잘림 없음 | `overflow` 조상과 containing block을 벗어나고(필요하면 body로 포털), 이웃 요소에 가려지지 않는다.[](source:ov-clip) |

스크롤바는 컨테이너 안에 머문다. 컴포넌트별 선택자 대신 공유 스크롤바 스타일을 쓴다. 스크롤바가 컨테이너 밖으로 넘치거나 둥근 모서리·가장자리에 잘리지 않는지 확인하고, 가장자리에 붙이지 않고 작은 inset을 둔다.[](source:ov-scroll)

| 점검 | 내용 |
| --- | --- |
| 플랫폼 window chrome | 새 헤더 요소나 전체 페이지는 macOS와 Windows window chrome을 모두 고려한다.[](source:plat-clear) |
| 총 오프셋 | 리뷰할 때 의도한 총 오프셋(여백 + 페이지 inset)을 밝힌다. 두 페이지가 "같은 위쪽 간격"이라고 하면, 두 합이 같은지 본다.[](source:plat-sum) |
| 간격 | 바뀐 영역마다 이웃에 붙어 있는 곳이 없는지, 인접 아이콘이 영역의 기존 간격을 따르는지 본다. 나란한 요소는 대칭을 선호하고, 설명 없는 일회성 간격은 놓친 공유 값의 신호로 본다.[](source:sp-gap) |
| 정렬 축 | 복잡한 페이지는 지역 간격을 만지기 전에 공유 가로·세로 정렬 축부터 세운다. hover, 선택, 펼침·접힘 상태와 이웃 패널과의 관계도 본다.[](source:sp-axes) |

정렬 축의 기준 화면은 세 가지다.[](source:sp-axes) 사이드바는 쌓인 행의 글자 시작점과 앞 아이콘을 맞추고 hover·선택 배경을 위 버튼과 맞춘다. Plugins 페이지는 내용을 공유 가장자리에 왼쪽 정렬하되 목록 행의 hover 배경은 그 가장자리 밖으로 나와도 된다. 대화창과 오른쪽 사이드바 헤더는 첫째·둘째 줄의 높이와 밑줄·구분선 기준선을 맞춘다.

@facts id=review-escalation
| 디자인 리뷰가 필요한 때 | 광범위한 UI 변경, 또는 사용자가 분명히 알아챌 UI·상호작용 변경 |
| 필요한 것 | 디자이너 또는 제품 리뷰 |
| 승인자 역할 보유자가 없으면 | design/product 리뷰어에게 요청하라고 제안 |
| 명단(2026-09 기준) | yx zhang, yifffan, zhangziya, gaokaige. 구성원이 바뀌면 이 스킬에서 갱신 |

위 표의 근거는 원문 한 줄이다.[](source:esc) "광범위"와 "분명히 알아챌 변경"의 경계는 원문에 명시 없음.

## 흐름 속 위치 {#position}

이 스킬은 `client-ui` 묶음과 `review` 묶음에 속한다. 아래 화살표는 관계 방향이며, 필수 실행 순서가 아니다. 점선은 참고, 굵은 선은 위임이다.

@workflow id=position-flow title="dsh-client-ui-ux 앞뒤의 스킬"
| cr | dsh-code-review | backend |
| art | dsh-official-plugin-artwork | backend |
| ux | dsh-client-ui-ux | backend |
| eh | dsh-error-handling | backend |
| rs | dsh-responsive-ui | backend |
| ps | dsh-prose-standard | backend |
| cr > ux | 참고 | dashed |
| art > ux | 경계 | dashed |
| ux > eh | 위임 | emphasis |
| ux > rs | 참고 | dashed |
| ux > ps | 참고 | dashed |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `dsh-code-review`의 읽을 자료 지목 | - | 제품 사용자에게 보이는 GUI 변경을 리뷰할 때. 리뷰 점검 항목이 이 스킬 적용을 따로 지시하지는 않는다 | r03 |
| `dsh-official-plugin-artwork`가 선을 그은 액션 아이콘 | - | 액션 아이콘은 이 스킬의 "Reuse before adding" 절 소관이다. 툴바·액션 아이콘은 그 스킬의 대상이 아니다 | r33 |
| - {#row-r31} | 실패 보고 | 실패를 보고할 때 `dsh-error-handling`의 해당 절을 적용한 뒤 보일 자리를 고른다 | r31 |
| - {#row-r32} | 반응형 판단 | 반응형 레이아웃, 모바일·터치 판별, 말줄임, 제목 줄바꿈, 아이콘 전용 컨트롤, 폭 변화 중 포커스를 판단할 때는 `dsh-responsive-ui`를 쓴다 | r32 |
| - {#row-r30} | UI 문구 품질 | 문구 품질 자체는 `dsh-prose-standard`를 따른다 | r30 |

근거는 다음과 같다.

- `dsh-code-review`는 읽을 자료 목록에 이 스킬을 올린다.[](source:cr-list)
- `dsh-official-plugin-artwork`는 17줄에서 액션 아이콘을 이 스킬로 돌린다.[](source:art-edge)
- 이 스킬은 59줄에서 `dsh-responsive-ui`를, 34줄에서 `dsh-error-handling`을 가리킨다.[](source:resp)[](source:fb-intro) 가리키는 절 제목은 `dsh-error-handling`에 있다.[](source:eh-head)

전체 흐름은 `deepseek-harness/_group-client-ui/client-ui.html`과 `deepseek-harness/_group-review/review.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `deepseek-harness/dsh-client-ui-ux/SKILL.md` 1개, 9,486B(77줄). 모두 원본이고 끝까지 읽었다. 이 폴더에는 다른 텍스트 파일이 없다.
- 관계 확인용으로 읽은 곳: `dsh-code-review` 24줄, `dsh-official-plugin-artwork` 17줄, `dsh-error-handling`의 절 제목 줄.
- 범위 밖: 본문이 링크한 `../../../docs/...`, `../../../packages/...`, `../../notes/...`는 원래 저장소(deepseek-harness)의 파일이다. 이 저장소에 없어 열지 않았다. 토큰 규칙, 컴포넌트 카탈로그, 클라이언트 `AGENTS.md`, 컴포넌트 방어 패턴 문서, locale 소유 결정 노트가 여기에 든다.
- 제외한 파일: 없음. 번역본이 없다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준, 폴더 검색으로도 확인).
- 실행하지 않았다. 이 페이지의 동작은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
범위 밖 문서가 정한 토큰 값, 컴포넌트 카탈로그, 컴포넌트 구조 규칙은 이 페이지가 다루지 않는다. 그 부분은 부분 분석이다.
디자인 리뷰를 받지 못했을 때 병합을 막는 장치가 있는지는 원문에 명시 없음. 원문은 "must get"이라고만 적는다.[](source:esc)
"가장 가까운 형제 페이지"를 고르는 기준이 둘 이상일 때 어느 쪽을 따르는지는 원문에 명시 없음.[](source:vis-token)
