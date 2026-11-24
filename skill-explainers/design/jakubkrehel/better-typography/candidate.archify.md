# better-typography — 텍스트 렌더링 규칙을 설정하고 리뷰한다 {#overview}

`better-typography`는 에이전트가 UI와 본문의 텍스트 렌더링을 설정하거나 리뷰할 때 따라야 할 타이포그래피 기준과 수정 원칙을 정해 주는 스킬이다.[](source:bt-intro)

- 타입 스케일, 폰트 선택과 로드, 행간·자간, 줄바꿈·말줄임, 문장부호·숫자 정렬, 모바일 입력 크기를 다룰 때 켜진다.[](source:bt-fm)[](source:bt-intro)
- 결과는 프로젝트의 기존 스타일링 체계로 고친 코드이거나, 원칙별 위반표와 `Block`/`Approve` 판정 결과가 담긴 리뷰 보고서다.[](source:bt-intro)[](source:bt-report)
- `better-interface`·`interface-review`가 이 스킬을 호출하고 `better-accessibility`가 소유권을 참고하며, `break`는 깨짐을 귀속한다. 이 스킬은 `better-colors`를 호출하고 `better-layout`·`better-writing`·`better-accessibility`를 참고한다.
- 서체 변경 요청이 없으면 유·무료 새 서체를 제안하지 않으며, `font-kerning: none`을 해결책으로 쓰지 않는다.[](source:bt-meas)[](source:bt-letter)

@answer scope="design/jakubkrehel/better-typography · 원본 파일 9개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source bt-fm title="frontmatter: 이름과 description" path=design/jakubkrehel/better-typography/SKILL.md lines=1:4
@source bt-oa title="agents/openai.yaml: UI 표시 정보" path=design/jakubkrehel/better-typography/agents/openai.yaml lines=1:3
@source bt-intro title="스킬 범위와 도메인 경계" path=design/jakubkrehel/better-typography/SKILL.md lines=6:10
@source bt-meas title="정확한 측정치와 경험적 기준 구분" path=design/jakubkrehel/better-typography/SKILL.md lines=12:16
@source bt-fonts title="폰트 수량과 굵기 제한" path=design/jakubkrehel/better-typography/SKILL.md lines=18:22
@source bt-load title="폰트 로드와 임의 synthesis 제한" path=design/jakubkrehel/better-typography/SKILL.md lines=24:26
@source bt-props title="표준 CSS 속성 우선 사용" path=design/jakubkrehel/better-typography/SKILL.md lines=28:32
@source bt-scale title="타입 스케일과 제목 계층" path=design/jakubkrehel/better-typography/SKILL.md lines=34:42
@source bt-lh title="역할별 행간 기준" path=design/jakubkrehel/better-typography/SKILL.md lines=44:48
@source bt-letter title="크기별 자간과 kerning 금지" path=design/jakubkrehel/better-typography/SKILL.md lines=50:54
@source bt-wrap title="줄 길이·줄바꿈·정렬·숫자·말줄임" path=design/jakubkrehel/better-typography/SKILL.md lines=56:77
@source bt-punct title="대소문자·문장부호·밑줄" path=design/jakubkrehel/better-typography/SKILL.md lines=79:89
@source bt-zoom title="모바일 16px 입력 줌과 최소 크기·font smoothing" path=design/jakubkrehel/better-typography/SKILL.md lines=91:108
@source bt-i18n title="언어·양방향 텍스트·text-box·장식·선택 허용" path=design/jakubkrehel/better-typography/SKILL.md lines=110:126
@source bt-finish title="마감 전 안티패턴 19개 점검표" path=design/jakubkrehel/better-typography/SKILL.md lines=128:150
@source bt-report title="검증 기준과 보고서 참조" path=design/jakubkrehel/better-typography/SKILL.md lines=152:156
@source bt-choose title="폰트 컷 선택·폴백·파일 형식" path=design/jakubkrehel/better-typography/choosing-fonts.md lines=5:29
@source bt-var title="정적·가변 폰트, synthesis, 축과 OpenType 기능" path=design/jakubkrehel/better-typography/variable-fonts-and-opentype.md lines=5:76
@source bt-sz title="타입 스케일·제목·행간·text-box 레시피" path=design/jakubkrehel/better-typography/spacing-and-sizing.md lines=5:78
@source bt-wp title="measure, 문장부호 치환, 양방향 처리" path=design/jakubkrehel/better-typography/wrapping-and-punctuation.md lines=5:23
@source bt-det title="밑줄·선택·모바일 입력 줌·장식 텍스트 레시피" path=design/jakubkrehel/better-typography/details-and-accessibility.md lines=5:84
@source bt-cheat title="Tailwind 4 복합·임의 유틸리티 대응표" path=design/jakubkrehel/better-typography/css-cheat-sheet.md lines=5:27
@source bt-repref title="단독 리뷰 심각도와 형식" path=design/jakubkrehel/better-typography/reporting.md lines=1:14
@source bi-order title="better-interface의 도메인 스킬 순차 호출" path=design/jakubkrehel/better-interface/SKILL.md lines=42:58
@source ir-sig title="interface-review의 타이포그래피 제거 신호" path=design/jakubkrehel/interface-review/removed-signals.md lines=14:15
@source ir-font title="interface-review의 폰트 파일 예외" path=design/jakubkrehel/interface-review/scope-resolution.md lines=73:73
@source ba-own title="better-accessibility의 도메인 경계" path=design/jakubkrehel/better-accessibility/SKILL.md lines=12:12
@source ba-zoom title="better-accessibility의 iOS 16px 입력 규칙 참조" path=design/jakubkrehel/better-accessibility/SKILL.md lines=106:106
@source bc-con title="better-colors의 대비 측정 위임" path=design/jakubkrehel/better-colors/contrast.md lines=5:5
@source bl-trunc title="better-layout의 말줄임 복구 소유권" path=design/jakubkrehel/better-layout/SKILL.md lines=42:42
@source bw-own title="better-writing의 문구 소유권" path=design/jakubkrehel/better-writing/SKILL.md lines=12:12
@source bk-rep title="break의 타이포그래피 깨짐 보고" path=design/jakubkrehel/break/SKILL.md lines=55:57

## 어떻게 동작하나 {#flow span=12}

원칙형이다. 원문은 실행 순서 없이 정확한 측정치와 경험적 기준을 나눠 정하고, 작업 끝에 점검표와 보고 규칙으로 결과를 검증하게 한다.[](source:bt-meas)[](source:bt-finish)

| 적용 상황 | 참조 파일 | 바뀌는 판단 | 출력 사례 |
| --- | --- | --- | --- |
| 판정 기준과 폰트 선택 | `SKILL.md`, `choosing-fonts.md` | 정확한 측정치(단위 없는 `line-height`, `18px` 미만 `400` 이상, `60–75`자 measure(한 줄 글자 수), iOS `16px` 입력, `tabular-nums`) 누락만 지적으로 보고한다. 폰트는 보통 3개 이하로 제한하고, 크기에 맞는 `Display`/`Text` 컷과 `.woff2`를 쓴다. | `18px` 미만 본문 weight `400` 이상 유지, `28px` 이상에만 `100`–`300` 허용[](source:bt-meas)[](source:bt-fonts)[](source:bt-choose) |
| 폰트 로드와 OpenType 속성 | `SKILL.md`, `variable-fonts-and-opentype.md` | 브라우저가 없는 굵기와 기울임을 만들어 내는 synthesis를 막도록 사용하는 모든 페이스(face)를 로드한다. `font-synthesis: none` 대신 폴백 확인 후 필요한 longhand만 좁혀 끈다. `font-variation-settings`·`font-feature-settings` 대신 표준 CSS 속성을 우선한다. | `"wght" 650` 태그 대신 `font-weight: 650` 사용[](source:bt-load)[](source:bt-props)[](source:bt-var) |
| 타입 스케일·행간·자간 | `SKILL.md`, `spacing-and-sizing.md` | 크기·행간·무게를 역할 이름으로 묶어 타입 스케일을 정하고, 제목 크기는 수준별 내림차순을 지킨다. 행간은 단위 없이(Display `1.1`, 제목 `1.2`–`1.3`, 본문 `1.5`–`1.6`, 3줄 이상 `1.4` 이상), 자간은 `em`으로 둔다. | 3줄 이상 설명 `line-height: 1.4` 이상, `text-box: trim-both cap alphabetic`[](source:bt-scale)[](source:bt-lh)[](source:bt-letter)[](source:bt-sz) |
| 줄 길이·줄바꿈·말줄임·숫자 | `SKILL.md`, `wrapping-and-punctuation.md` | 긴 글은 한 줄 `60–75`자(`45ch`–`60ch`, `16px` 기준 `420px`–`570px`)로 제한한다. 제목은 `text-wrap: balance`, 문단은 `text-wrap: pretty`, 긴 토큰은 `overflow-wrap: break-word`를 쓴다. 바뀌는 숫자·표 열은 `tabular-nums`로 고정한다. | 타이머·가격에 `font-variant-numeric: tabular-nums`, 본문 `max-w-md`·`max-w-lg`[](source:bt-wrap)[](source:bt-wp) |
| 문장부호·국제화·양방향 | `SKILL.md`, `wrapping-and-punctuation.md` | 원문은 일반 대소문자로 저장하고 `text-transform`으로 바꾼다. 코드 밖 텍스트에는 직선 따옴표·`...`·`--` 대신 둥근 따옴표·`…`·em/en dash·`&nbsp;`를 쓴다. `lang`·`dir`을 지정하고 혼재 숫자·이름·URL은 `<bdi>`로 감싼다. | `2010-2020` 대신 `2010–2020`, RTL 안의 전화번호·영문은 `<bdi>` 적용[](source:bt-punct)[](source:bt-i18n)[](source:bt-wp) |
| 모바일 입력 줌·세부 CSS | `SKILL.md`, `details-and-accessibility.md`, `css-cheat-sheet.md` | iOS 자동 줌 방지를 위해 `<input>`을 `16px` 이상으로 두며, 두 해법(모바일 크기 확대 vs `scale()` 보정) 중 디자인 의도를 묻는다. 본문 기본 `16px`(`rem`), 입력 `14px`, 캡션 `13px`을 지키고 font smoothing은 root 요소에만 둔다. 비직관적 Tailwind 4 유틸리티는 치트 시트를 따른다. | `<input className="text-base sm:text-sm" />` 또는 `scale-[0.8125]` 보정, root 요소에 `antialiased`[](source:bt-zoom)[](source:bt-i18n)[](source:bt-det)[](source:bt-cheat) |
| 마감 점검과 보고 | `SKILL.md`, `reporting.md` | 작업 끝에 19개 안티패턴 점검표로 누락을 확인한다. 브라우저 유무에 따라 선언값 검사·실제 렌더·리사이즈를 확인하고 못 돌린 검사는 `Not verified`로 남긴다. 단독 리뷰는 `HIGH`·`MEDIUM`·`LOW`와 `Block`/`Approve` 판정 결과를 낸다. | 320px 폭·200% 확대에서 텍스트 잘림 발견 시 `HIGH` 및 `Block`[](source:bt-finish)[](source:bt-report)[](source:bt-repref) |

정확치와 경험치를 나눈 이유는 취향으로 프로젝트 스케일을 뒤집지 않게 하기 위해서다.[](source:bt-meas) 표준 CSS 속성을 우선해야 가변 폰트 폴백이 실패해도 굵기와 숫자 정렬이 유지된다.[](source:bt-props)[](source:bt-var) 예컨대 본문 `300` 무게를 `400`으로 올리고, 3줄 이상 설명 행간을 `1.4` 이상으로 고친다.[](source:bt-finish)[](source:bt-sz)

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령은 원문에 명시 없음. 모델이 `description`을 보고 켠다. 호출 제한 필드는 frontmatter와 `agents/openai.yaml`에 없다.[](source:bt-fm)[](source:bt-oa) |
| 성격 | 텍스트 렌더링 규칙을 적용·검증하는 도메인 스킬(`better-interface`의 4번째 리뷰 단계). |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `better-interface` {#rel-r49} | **이 스킬** | 호출 | 의무: `better-interface`가 4번 순서로 이 스킬을 로드해 리뷰하고, 단독 심각도·형식은 `better-interface` 기준으로 대체해 통합한다(사용자 개입 없음).[](source:bi-order) |
| `interface-review` {#rel-r59} | **이 스킬** | 호출 | diff `-` 쪽에서 `lang=`·`dir=`·`text-wrap`·`line-clamp`·`tabular-nums` 등이 제거되거나 폰트 파일이 추가·교체될 때 확인을 위임한다(사용자 개입 없음).[](source:ir-sig)[](source:ir-font) |
| `better-accessibility` {#rel-r64} | **이 스킬** | 참고 | 텍스트 크기, iOS `16px` 입력 줌 방지, 언어 메타데이터(`lang`) 규칙 소유권이 이 스킬에 있음을 참조한다(사용자 개입 없음).[](source:ba-own)[](source:ba-zoom) |
| `break` {#rel-r83} | **이 스킬** | 결과 전달 | `break`가 줄바꿈·말줄임 실패를 관찰하면 `owner` 스킬로 이 스킬을 적어 보고하고, 수정 요청이 있을 때만 이 스킬 규칙을 적용한다(수정 요청 필요).[](source:bk-rep) |
| **이 스킬** {#rel-r67} | `better-colors` | 호출 | 가독성 대비 측정을 `better-colors`에 맡긴다. 통과 여부 판정은 `better-accessibility`가 한다(사용자 개입 없음).[](source:bt-intro)[](source:bc-con) |
| **이 스킬** {#rel-r68} | `better-layout` | 참고 | 말줄임 뒤 전체 텍스트를 보는 UI와 공간 RTL 배치 규칙이 `better-layout` 소유임을 참조한다(사용자 개입 없음).[](source:bt-intro)[](source:bt-wrap)[](source:bl-trunc) |
| **이 스킬** {#rel-r69} | `better-writing` | 참고 | 문구 자체와 어휘 선택은 `better-writing` 소유임을 참조한다(사용자 개입 없음).[](source:bt-intro)[](source:bw-own) |
| **이 스킬** {#rel-r70} | `better-accessibility` | 참고 | 시맨틱 제목 계층과 대비 통과 판정 소유권이 `better-accessibility`에 있음을 참조한다(사용자 개입 없음).[](source:bt-intro)[](source:ba-own) |

@architecture id=relation-map title="better-typography와 이어지는 스킬"
| bi | better-interface | backend |
| ir | interface-review | backend |
| bk | break | backend |
| self | better-typography(이 스킬) | backend |
| bc | better-colors | backend |
| bl | better-layout | backend |
| bw | better-writing | backend |
| ba | better-accessibility | backend |
| bi > self | 호출 | |
| ir > self | 호출 | |
| bk > self | 결과 전달 | |
| ba > self | 참고 | dashed |
| self > bc | 호출 | |
| self > bl | 참고 | |
| self > bw | 참고 | |
| self > ba | 참고 | |

@code source=bt-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 측정치·경험치 구분, 타이포그래피 규칙, 19개 마감 점검표, 보고 지시 본문 | 스킬이 켜질 때 읽는다 | 판정 기준과 폰트 선택; 폰트 로드와 OpenType 속성; 타입 스케일·행간·자간; 줄 길이·줄바꿈·말줄임·숫자; 문장부호·국제화·양방향; 모바일 입력 줌·세부 CSS; 마감 점검과 보고 |
| `choosing-fonts.md` | `Display`/`Text` 컷 구분, `system-ui`·브랜드 폴백 스택, `.woff2` 형식 기준 | 폰트 컷이나 서체 변경이 필요할 때 읽는다 | 판정 기준과 폰트 선택 |
| `variable-fonts-and-opentype.md` | 정적·가변 폰트 선택, 좁은 `font-synthesis` 해제, 축·OpenType 기능 레시피 | 가변 폰트 축·OpenType 기능·합성 차단을 다룰 때 읽는다 | 폰트 로드와 OpenType 속성 |
| `spacing-and-sizing.md` | 역할 기반 시작 타입 스케일, 제목 매핑, 3줄 이상 행간, `text-box` 트림 | 타입 스케일·행간·`text-box` 설정 시 읽는다 | 타입 스케일·행간·자간 |
| `wrapping-and-punctuation.md` | `ch`/`px`/Tailwind 폭 비교, 문장부호 치환표, 다국어·숫자 양방향 규칙 | 줄 길이·문장부호·국제화 처리 시 읽는다 | 줄 길이·줄바꿈·말줄임·숫자; 문장부호·국제화·양방향 |
| `details-and-accessibility.md` | 밑줄, 선택 범위, iOS `16px` 입력 줌 두 가지 레시피, CSS 장식 텍스트 | 밑줄·입력 줌·장식 텍스트·선택 스타일링 시 읽는다 | 모바일 입력 줌·세부 CSS |
| `css-cheat-sheet.md` | 복합 유틸리티 4종과 임의 값 문법 8종의 Tailwind 4 대응표 | 프로젝트가 Tailwind 4를 쓸 때 읽는다 | 모바일 입력 줌·세부 CSS |
| `reporting.md` | 단독 리뷰의 `HIGH`/`MEDIUM`/`LOW` 기준, 표 형식, `Block`/`Approve` 규칙 | `better-interface` 없이 단독 리뷰를 보고할 때 읽는다 | 마감 점검과 보고 |
| `agents/openai.yaml` | 호스트 UI 표시 이름(`Better Typography`)과 짧은 설명 | 호스트가 UI 표시 정보를 읽을 때 사용한다 | 원문에 명시 없음 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 작업 요청에 서체 변경이 없다 | 유·무료 새 서체 제안 금지(Never) | [](source:bt-meas) |
| 아래 5가지 측정치 누락: 단위 없는 `line-height`, `18px` 미만 `400`+ 무게, `60–75`자 measure, iOS `16px` 입력, `tabular-nums` | 지적으로 보고한다. 자간·폰트 조합·배율은 프로젝트 스케일을 깰 때만 보고한다 | [](source:bt-meas) |
| `font-kerning: none`, `text-align: justify`(앱 UI), 문단 `text-wrap: balance` | 금지. 각각 기본 kerning 유지, `text-align: start`, `text-wrap: pretty`를 쓴다 | [](source:bt-letter) [](source:bt-wrap) |
| `18px` 미만 텍스트 무게 | `400` 이상을 쓴다. `100`–`300`은 `28px` 이상에서만 배경과 대비를 확인한 뒤 쓴다 | [](source:bt-fonts) |
| 3줄 이상으로 줄바꿈되는 설명·카드 본문 | 높이 제한 행이라도 `line-height` 최소 `1.4`를 적용한다 | [](source:bt-lh) |
| iOS Safari 입력창 `<input>` 크기(`16px` 미만 시 줌) | 모바일 크기 키우기와 `16px` 유지 후 `transform: scale()` 축소 중 디자인 의도를 사람에게 묻거나 둘 다 제안한다 | [](source:bt-zoom) |
| 본문 기본 크기 및 최소 크기 | 긴 본문은 `16px`(`rem`), 입력·메뉴는 `14px`, 캡션은 `13px`에서 시작하며 `12px` 미만은 드물게만 쓴다 | [](source:bt-zoom) |
| `user-select: none` | 드래그·제스처 표면에만 허용한다. 인터페이스 전역이나 버튼 레이블 선택 방지에 쓰지 않는다 | [](source:bt-i18n) |
| 단독 리뷰에서 읽기 불가, 복구 수단 없는 말줄임, 320px/200% 확대 잘림이 남음 | `HIGH`(후자 둘은 `better-interface` 격상 조건)로 판정하고 `Block`으로 끝낸다 | [](source:bt-repref) |
| 확인하지 못한 검증 항목 | 검사하지 않은 영역은 `Approve` 금지. `Not verified`로 보고한다 | [](source:bt-report) [](source:bt-repref) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- iOS `16px` 입력 줌 두 가지 레시피 — 모바일 입력 줌·세부 CSS · `scale-[0.8125]` 적용 시 너비·행간 역보정과 래퍼 포커스 링 계산을 담았다.
- 가변 폰트 축·OpenType·synthesis 제어 — 폰트 로드와 OpenType 속성 · `font-synthesis-*` 개별 속성과 `ss01`/`cv11` 슬롯 차이를 모았다.
- Tailwind 4 유틸리티·`text-box` 트림 대응표 — 타입 스케일·행간·자간 · `css-cheat-sheet.md` 전체 목록과 브라우저 지원 조건을 정리했다.

@callout level=open-question title="확인하지 못한 것"
| `SKILL.md` 89줄이 색 이외 밑줄 애니메이션 소유 스킬로 언급한 `better-motion`은 저장소에 없어 확인하지 못했다(`범위 밖`). |

읽은 원본: 텍스트 파일 9개. 제외: 없음.
