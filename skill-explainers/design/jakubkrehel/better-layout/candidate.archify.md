# better-layout — 그룹화·정렬·여백·읽기 순서·반응형·RTL 대응을 설계하고 검증한다 {#overview}

better-layout은 화면의 그룹화, 정렬, 여백, 읽기 순서, 반응형 구조와 번역·RTL 대응을 설계하고, 크기 변경·번역·좌우 반전 조건에서도 레이아웃이 무너지지 않게 검토하는 스킬이다.[](source:intro)

- 레이아웃·반응형·RTL 구조를 잡거나 리뷰할 때, 또는 `better-interface` 통합 리뷰의 2번 도메인과 `interface-review`의 간격·RTL 제거 신호 확인 시 켜진다.[](source:fm)[](source:bi-rel)[](source:ir-rel)
- 결과로 남는 것은 프로젝트의 스타일 체계로 작성한 레이아웃 수정안과, 단독 리뷰 기준 `Severity | Location | Before | After | Why` 표 및 `Block`·`Approve` 판정이다.[](source:intro)[](source:ref-rep)
- 다른 스킬과의 관계: `better-interface`·`interface-review`가 이 스킬을 `호출`하고, `better-accessibility`·`better-typography`·`variant`가 이 스킬을 `참고`하며, 이 스킬은 주 행동 강조 색상 규칙을 `better-colors` 소유로 `참고`한다.[](source:bi-rel)[](source:ir-rel)[](source:a11y-focus)[](source:typ-rel)[](source:var-rel)[](source:grouping)
- 하지 않는 것: 프로젝트에 이미 간격 스케일·밀도 체계가 있을 때 예시 수치를 강요하거나 깨짐 근거 없는 수치 차이만으로 지적하지 않으며, hit area·모서리 반경·모션·줄 길이·카피 문구 영역을 대신 소유하지 않는다.[](source:intro)

@answer scope="design/jakubkrehel/better-layout · 원본 파일 5개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source fm title="frontmatter: name·description" path=design/jakubkrehel/better-layout/SKILL.md lines=1:4
@source intro title="목표, 기존 토큰 우선, 깨짐 근거 요건, 도메인 경계" path=design/jakubkrehel/better-layout/SKILL.md lines=8:12
@source grouping title="여백 그룹화, 컨트롤 구별, 정렬, 논리 속성, 순서, 주 행동" path=design/jakubkrehel/better-layout/SKILL.md lines=14:36
@source adaptivity title="숨은 콘텐츠 단서, 여백, 가장자리, safe area, breakpoint, 확장" path=design/jakubkrehel/better-layout/SKILL.md lines=38:66
@source finish title="마무리 11패턴 점검표와 브라우저 유무별 검증" path=design/jakubkrehel/better-layout/SKILL.md lines=68:88
@source ref-group title="그룹화·컨트롤 구별·공통 정렬선·RTL 논리 속성·중요도 순서 예시" path=design/jakubkrehel/better-layout/grouping-and-alignment.md lines=1:103
@source ref-space title="컨트롤 간격·가장자리 여백·peek·safe area·컨테이너 쿼리·클리핑 방지" path=design/jakubkrehel/better-layout/spacing-and-adaptivity.md lines=1:156
@source ref-rep title="단독 리뷰 심각도·표 형식과 Block/Approve 판정" path=design/jakubkrehel/better-layout/reporting.md lines=1:14
@source yaml title="UI 표시 이름과 짧은 설명" path=design/jakubkrehel/better-layout/agents/openai.yaml lines=1:3
@source bi-rel title="better-interface 2번 도메인 로드 규칙" path=design/jakubkrehel/better-interface/SKILL.md lines=44:54
@source ir-rel title="interface-review 제거 신호의 better-layout 소유 항목" path=design/jakubkrehel/interface-review/removed-signals.md lines=13:13
@source a11y-focus title="better-accessibility의 고정 chrome 패딩 소유권 참조" path=design/jakubkrehel/better-accessibility/SKILL.md lines=32:32
@source a11y-zoom title="better-accessibility의 텍스트 컨테이너·리플로우 소유권 참조" path=design/jakubkrehel/better-accessibility/SKILL.md lines=106:106
@source typ-rel title="better-typography의 공간 RTL 소유권 참조" path=design/jakubkrehel/better-typography/SKILL.md lines=10:10
@source typ-trunc title="better-typography의 말줄임 복원 UI 소유권 참조" path=design/jakubkrehel/better-typography/SKILL.md lines=77:77
@source var-rel title="variant Structure/Density 축의 better-layout 소유권" path=design/jakubkrehel/variant/SKILL.md lines=17:23

## 어떻게 동작하나 {#flow span=12}

원칙형이다. 공간 배치, 방향 무관 속성, 숨김 단서, 반응형 확장 규칙과 마무리 점검표에 따라 레이아웃을 설계하고 검증한다.

| 적용 상황 | 참조 파일 | 바뀌는 판단 | 출력 사례 |
| --- | --- | --- | --- |
| 그룹화·정렬·중요도 순서 | `SKILL.md`, `grouping-and-alignment.md` | 구분선보다 여백을 먼저 쓰고 그룹 간 간격은 내부의 2배 이상(`8px` vs `16px`)으로 벌린다. 컨트롤은 본문과 구별하고 공통 정렬선·중첩 간격(`16px`)을 맞추며, `order`·`row-reverse` 없이 DOM 순서와 중요도 순서를 일치시키고 주 행동은 1개(보조 4개 이상이면 메뉴)로 둔다. | 균일 간격+구분선 목록을 `space-y-6`·`space-y-2` 여백 계층으로 정리, 주요 지표를 메타데이터 위로 이동[](source:grouping)[](source:ref-group) |
| `logical property`·RTL 반전 | `SKILL.md`, `grouping-and-alignment.md` | 방향 의존 속성은 `margin-inline-start`·`text-align: start` 같은 logical property로 쓰고 표 숫자는 `text-align: end`를 쓴다. `translateX`·`background-position`과 safe area(notch·홈 표시줄을 피한 영역) 물리 좌우는 `[dir="rtl"]` 예외를 둔다. | `ml-4 pr-6 text-left`를 `ms-4 pe-6 text-start`로 교체, 별점·단계 진행은 RTL에서 mirror(RTL에서 좌우 반전)[](source:grouping)[](source:ref-group) |
| 숨김 단서·컨트롤 간격·가장자리 여백 | `SKILL.md`, `spacing-and-adaptivity.md` | 스크롤 밖·접힌 콘텐츠는 다음 항목 `16–32px` peek(다음 항목이 스크롤 가장자리 밖으로 보이는 부분)나 펼침 컨트롤로 알리고, 말줄임 값은 키보드 도달 가능한 복원 수단을 붙인다. 밀도 체계 없을 때 테두리 컨트롤 간 `12px`, 무테두리 글리프 간 `24px`, 본문 풀폭 버튼 좌우 `16px` 이상 여백을 둔다. | 가로 스크롤 카드 폭을 `calc(100% - 12px)`로 잡아 `24px` peek 생성, hover 전용 `title` 대체[](source:adaptivity)[](source:ref-space) |
| `breakpoint`·확장·클리핑 방지 | `SKILL.md`, `spacing-and-adaptivity.md` | 기기 프리셋(`768px`) 대신 콘텐츠가 깨지는 지점에서 끊고 재사용 컴포넌트는 `@container`를 쓰되 shrink-to-fit 컨테이너 단독 크기 격리를 피한다. 텍스트 상자는 `max-width`·`min-height`와 줄바꿈을 허용하고, `minmax(0, 1fr)`·`min-width: 0`·`100dvh`·`scroll-padding-block-start`로 잘림을 막는다. | `width: 96px; overflow: hidden`을 `max-width: 100%; flex-wrap: wrap`으로 바꿔 독일어·유사 현지화 대응[](source:adaptivity)[](source:ref-space)[](source:finish) |
| 검증과 단독 리뷰 판정 | `SKILL.md`, `reporting.md` | 브라우저가 없으면 logical property·지원 폭 대비 쿼리·DOM 순서를 확인하고, 브라우저가 있으면 지원 폭·320px·200% zoom·RTL 반전을 검사한다. 미실행 검사는 `Not verified`로 남기며 단독 리뷰는 `Block`·`Approve`를 판정한다. | 320px/200% 클리핑·단서 없는 스크롤·복원 불가 말줄임을 `HIGH`로 올려 `Block` 판정[](source:finish)[](source:ref-rep) |

적용의 전제는 두 가지다. 프로젝트에 이미 간격 스케일이나 밀도 체계가 있으면 이 스킬의 기본 수치(`8px`, `12px`, `16px`, `24px`) 대신 프로젝트 토큰을 쓰고, 숫자가 다르다는 이유만으로 지적을 올리지 않고 클리핑·겹침·반전 깨짐·오독처럼 드러나는 결함만 잡는다.[](source:intro) 단독 리뷰는 `reporting.md` 형식으로 출력하지만 `better-interface`가 호출하면 그쪽 형식과 심각도로 대체된다.[](source:ref-rep)

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 호출형이다(`description` 기준 모델이 판단해 켠다). frontmatter에 호출 제한 필드가 없다.[](source:fm) |
| 성격 | 그룹화·정렬·여백·읽기 순서·반응형·RTL 규칙을 소유해 단독 리뷰를 수행하고 `better-interface`·`interface-review`·형제 스킬에 기준을 제공하는 도메인 스킬.[](source:intro)[](source:bi-rel) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| better-interface {#rel-r47} | **이 스킬** | 호출 | 의무: `better-interface`가 2번 순서로 로드·리뷰한 뒤 결과를 통합한다. 형식과 심각도는 `better-interface`가 대체한다(사용자 개입 없음).[](source:bi-rel) |
| interface-review {#rel-r58} | **이 스킬** | 호출 | diff의 제거 신호(logical property를 `left`/`right` 물리 속성으로 되돌린 변경 등) 발생 시 확인을 위임한다(사용자 개입 없음).[](source:ir-rel) |
| better-accessibility {#rel-r63} | **이 스킬** | 참고 | 고정 chrome(머리글·바닥글) 포커스 가림 방지 패딩, 텍스트 컨테이너 `min-height`, `breakpoint` 소유권을 참조한다(사용자 개입 없음).[](source:a11y-focus)[](source:a11y-zoom) |
| better-typography {#rel-r68} | **이 스킬** | 참고 | 말줄임 뒤 전체 텍스트 복원 UI와 공간 RTL 레이아웃 소유권을 참조한다(사용자 개입 없음).[](source:typ-rel)[](source:typ-trunc) |
| **이 스킬** {#rel-r71} | better-colors | 참고 | 뷰당 주 행동 강조 색상 규칙을 `better-colors` 소유로 참조한다(사용자 개입 없음).[](source:grouping) |
| variant {#rel-r89} | **이 스킬** | 참고 | `variant`의 변형 축 중 Structure(그룹화·순서·열 수)와 Density(간격 스케일·수용량)를 이 스킬 소유로 참조한다(사용자 개입 없음).[](source:var-rel) |

@architecture id=relation-map title="better-layout과 이어지는 스킬"
| bi | better-interface | backend |
| ir | interface-review | backend |
| a11y | better-accessibility | backend |
| typ | better-typography | backend |
| var | variant | backend |
| self | better-layout(이 스킬) | backend |
| col | better-colors | backend |
| bi > self | 호출 | |
| ir > self | 호출 | |
| a11y > self | 참고 | dashed |
| typ > self | 참고 | dashed |
| var > self | 참고 | dashed |
| self > col | 참고 | dashed |

@code source=fm language=yaml

이 스킬 `SKILL.md` 12줄은 hit area·포커스 동작을 `better-accessibility`, 반경·그림자를 `better-ui`, 애니메이션을 `better-motion`(저장소 미설치, 범위 밖), 줄 길이·텍스트 간격·말줄임 메커니즘을 `better-typography`, 문구 자체를 `better-writing` 소관으로 경계를 긋는다.[](source:intro)

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 12개 레이아웃 원칙, 마무리 11패턴 점검표, 도메인 경계, 검증 기준 | 스킬이 켜지면 읽는다 | 그룹화·정렬·중요도 순서, `logical property`·RTL 반전, 숨김 단서·컨트롤 간격·가장자리 여백, `breakpoint`·확장·클리핑 방지, 검증과 단독 리뷰 판정 |
| `grouping-and-alignment.md` | 여백→배경→구분선 계층, 컨트롤 구별, 정렬선, 물리↔논리 속성 표, RTL·중요도 예시 | 그룹화·정렬·RTL 구조를 잡을 때 읽는다 | 그룹화·정렬·중요도 순서, `logical property`·RTL 반전 |
| `spacing-and-adaptivity.md` | 컨트롤 간격 표, 버튼 여백, peek 계산, safe area·sticky 패딩, `@container`, 클리핑 방지 | 간격·스크롤·safe area·반응형을 다룰 때 읽는다 | 숨김 단서·컨트롤 간격·가장자리 여백, `breakpoint`·확장·클리핑 방지 |
| `reporting.md` | 단독 리뷰 심각도, `HIGH` 기준, 표 형식, `Block`/`Approve` 판정 | 단독 리뷰 보고 시 읽는다 | 검증과 단독 리뷰 판정 |
| `agents/openai.yaml` | UI 표시 이름과 짧은 설명 메타데이터[](source:yaml) | UI가 스킬을 보여 줄 때 쓴다. 지시 본문이 아니다 | 원문에 명시 없음 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 프로젝트에 이미 간격 스케일·밀도 체계가 있음 | 예시 수치 대신 프로젝트 토큰을 따른다. 깨짐 근거 없이 수치만 다르다고 지적하지 않는다 | [](source:intro) |
| CSS `order`, `row-reverse`, 그리드 배치로 시각 순서와 DOM 순서를 어긋나게 함 | 금지다. 시각 순서와 DOM 소스가 일치하도록 마크업 순서를 맞춘다 | [](source:grouping) |
| 말줄임 처리된 값에 hover 전용 `title` 속성만 붙임 | 복원 수단으로 불인정한다. 펼침 컨트롤·상세 링크·키보드 포커스 툴팁을 둔다 | [](source:ref-space) |
| `width: 100vw`, `height: 100vh`(모바일 전체 높이 창), 텍스트 상자 고정 `height` | `width: 100%`, `100dvh`, `min-height`(또는 `max-height`+`overflow-y: auto`)로 바꾼다 | [](source:finish) |
| `1fr` 그리드 트랙·플렉스 자식 넘침 또는 크기 없는 요소의 `container-type: inline-size` | `minmax(0, 1fr)`·`min-width: 0`을 주고, 컨테이너 쿼리 부모에는 확정 폭을 부여한다 | [](source:finish)[](source:ref-space) |
| `env(safe-area-inset-*)` 사용 시 `viewport-fit=cover` 누락 또는 `*-inline-*`과 좌우 inset 혼용 | 메타태그에 `viewport-fit=cover`를 넣고, 좌우 `safe area`는 물리 `left`/`right`와 `[dir="rtl"]`로 분리한다 | [](source:adaptivity)[](source:finish) |
| 고정 헤더에 `scroll-padding-block-start` 누락 | 헤더 높이로 설정해 앵커와 포커스 요소가 가리지 않게 한다 | [](source:adaptivity)[](source:finish) |
| 중요 버튼을 리사이즈·줌·스크롤로 잘리는 위치에 둠 | 일반 흐름이나 안정적인 고정 chrome(안전 영역 패딩 포함)에 배치한다 | [](source:adaptivity)[](source:ref-space) |
| 320px·200% zoom 클리핑·겹침, 단서 없는 숨김·스크롤, 복원 불가 말줄임 | 단독 리뷰에서 항상 `HIGH`이며 남으면 `Block` 판정을 내린다 | [](source:ref-rep) |
| 브라우저 없이 리뷰하거나 지원 폭·320px·200% zoom·RTL을 확인하지 못함 | 못 돌린 검사는 `Not verified`로 보고하고, 미점검 범위는 `Approve`하지 않는다 | [](source:finish)[](source:ref-rep) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- CSS·Tailwind 레시피 모음 — 그룹화·정렬·중요도 순서와 `logical property`·RTL 반전 · 물리↔논리 속성 7종 매핑과 full-bleed 그리드(`1fr min(55ch, calc(100% - 48px)) 1fr`) 코드를 개요에서 줄였다.
- 스크롤 `peek` 계산식과 모달·고정 chrome 클리핑 패턴 — 숨김 단서·컨트롤 간격·가장자리 여백과 `breakpoint`·확장·클리핑 방지 · `100% + padding - gap - peek` 식과 `max-height: 100dvh` 모달 구조를 상세로 풀 수 있다.

@callout level=open-question title="확인하지 못한 것"
| `SKILL.md` 12줄은 애니메이션 소유 스킬로 `better-motion`을 지목하지만, `design/jakubkrehel/better-motion`은 이 저장소에 없어 연계 상세를 확인할 수 없다. |

읽은 원본: 텍스트 파일 5개(`SKILL.md`, `grouping-and-alignment.md`, `spacing-and-adaptivity.md`, `reporting.md`, `agents/openai.yaml`)와 관계 대조용 형제 스킬 원문 일부(`better-interface/SKILL.md`, `interface-review/removed-signals.md`, `better-accessibility/SKILL.md`, `better-typography/SKILL.md`, `variant/SKILL.md`). 제외: 없음.
