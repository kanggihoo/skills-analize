# better-ui — 표면과 아이콘의 시각 마감을 정밀 수치로 다듬는다 {#overview}

`better-ui`는 에이전트가 UI 표면과 아이콘을 구현하거나 리뷰할 때 모서리 반경, 광학 정렬, 그림자, 이미지 외곽선, 아이콘 굵기와 상태 표현의 정밀 수치를 지키게 하는 스킬이다.[](source:bu-intro)

- 인터랙션이 동작하는 상태에서 카드·버튼·오버레이 표면과 아이콘의 시각 마감을 다듬거나 감사할 때 켠다.[](source:bu-fm)[](source:bu-intro)
- 결과는 프로젝트의 기존 토큰·컴포넌트 체계로 작성한 시각 마감 코드이거나, 원칙별 위반표와 `Block`/`Approve` 판정 결과가 담긴 리뷰 보고서다.[](source:bu-exact)[](source:bu-report)
- `better-interface`가 이 스킬을 호출하고, `interface-review`와 `better-accessibility`가 규칙을 참고한다. 이 스킬은 입력창 경계 대비·포커스 링·아이콘 버튼 접근성 이름 소유권을 `better-accessibility`로 가리켜 참고한다.
- 광학 보정과 중첩 radius 기준 외 수치를 임의로 근사하지 않으며, 프로젝트에 그림자 없음 등 일관된 규칙이 있으면 지적하지 않는다.[](source:bu-exact)

@answer scope="design/jakubkrehel/better-ui · 원본 파일 5개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source bu-fm title="frontmatter: 이름과 description" path=design/jakubkrehel/better-ui/SKILL.md lines=1:4
@source bu-oa title="agents/openai.yaml: UI 표시 정보" path=design/jakubkrehel/better-ui/agents/openai.yaml lines=1:3
@source bu-intro title="적용 전제와 시각 마감 범위" path=design/jakubkrehel/better-ui/SKILL.md lines=6:8
@source bu-exact title="정밀 수치 원칙, 일관성 및 도메인 경계" path=design/jakubkrehel/better-ui/SKILL.md lines=10:16
@source bu-rad title="중첩 모서리 반경 계산 규칙" path=design/jakubkrehel/better-ui/SKILL.md lines=18:20
@source bu-opt title="광학 정렬 규칙" path=design/jakubkrehel/better-ui/SKILL.md lines=22:24
@source bu-shad title="그림자 계층, 구조 테두리, 강제 색상 모드" path=design/jakubkrehel/better-ui/SKILL.md lines=26:30
@source bu-img title="콘텐츠 이미지 순흑·순백 외곽선" path=design/jakubkrehel/better-ui/SKILL.md lines=32:34
@source bu-hover title="hover 미디어 쿼리와 탭 하이라이트" path=design/jakubkrehel/better-ui/SKILL.md lines=36:38
@source bu-scroll title="오버레이 내부 스크롤 격리" path=design/jakubkrehel/better-ui/SKILL.md lines=40:42
@source bu-icon title="아이콘 선 굵기, currentColor, 상태 변형, RTL" path=design/jakubkrehel/better-ui/SKILL.md lines=44:50
@source bu-finish title="마감 전 6개 탐지·수정표" path=design/jakubkrehel/better-ui/SKILL.md lines=52:61
@source bu-report title="검증 기준과 보고서 참조" path=design/jakubkrehel/better-ui/SKILL.md lines=63:67
@source bu-surf title="중첩 radius·광학 정렬·그림자·이미지 외곽선 레시피" path=design/jakubkrehel/better-ui/surfaces.md lines=5:166
@source bu-icons title="아이콘 굵기·상태 색상·크기 그리드·RTL 반전 레시피" path=design/jakubkrehel/better-ui/icons.md lines=5:105
@source bu-repref title="단독 리뷰 심각도와 형식" path=design/jakubkrehel/better-ui/reporting.md lines=1:14
@source bi-order title="better-interface의 도메인 스킬 순차 호출" path=design/jakubkrehel/better-interface/SKILL.md lines=42:58
@source ir-img title="interface-review의 이미지 추가 시 better-ui 확인" path=design/jakubkrehel/interface-review/scope-resolution.md lines=73:73
@source ba-own title="better-accessibility의 도메인 경계" path=design/jakubkrehel/better-accessibility/SKILL.md lines=12:12

## 어떻게 동작하나 {#flow span=12}

원칙형이다. 원문은 기반 인터랙션이 온전한 상태에서 표면과 아이콘에 적용하는 8개 정밀 규칙과 마감 점검표, 보고 기준을 제시한다.[](source:bu-intro)[](source:bu-finish)

| 적용 상황 | 참조 파일 | 바뀌는 판단 | 출력 사례 |
| --- | --- | --- | --- |
| 정밀 수치와 프로젝트 일관성 | `SKILL.md` | 광학 보정과 `24px` 중첩 radius 컷오프만 눈으로 판단하고, 나머지 수치(`oklch(0 0 0 / 0.1)`, `1.5px` 선 굵기 등)는 어림잡지 않는다. 프로젝트 전체에 그림자가 없는 식의 일관된 관례는 허용하되, 같은 프로젝트 안에서 세부 구현이 두 가지로 나뉘면 지적으로 잡는다. | `0.1` 대신 `0.15`를 쓰지 않고, 프로젝트 내 혼재 방식만 지적[](source:bu-exact) |
| 중첩 radius와 광학 정렬 | `SKILL.md`, `surfaces.md` | 안팎 표면이 균일한 안쪽 여백을 공유하면 바깥 반경은 `안쪽 radius + padding + border 두께`로 맞춘다. 안쪽 여백이 `24px`을 넘거나 비대칭이면 별도 표면으로 보고 각 토큰을 유지한다. 기하 중앙이 어긋나면 아이콘 쪽 여백을 `2px` 줄이거나 재생 삼각형을 꼭짓점 쪽으로 `2px` 민다. | `rounded-2xl p-2` 안쪽에 `rounded-lg`, 아이콘 버튼 `ps-4 pe-3.5`[](source:bu-rad)[](source:bu-opt)[](source:bu-surf) |
| 그림자와 강제 색상 모드 | `SKILL.md`, `surfaces.md` | 깊이만 주려고 넣은 테두리는 다층 투명 `box-shadow`로 바꾸고, 구분선·표 셀·선택 상태·입력창(`better-accessibility` `3:1` 대비) 테두리는 남긴다. 다크 모드에서는 깊이 그림자 대신 흰색 링(`oklch(1 0 0 / 0.08)`) 하나를 둔다. `forced-colors mode`에서 `box-shadow`가 지워지므로 `border: 1px solid transparent`를 항상 함께 쓴다. | 카드에 `border: 1px solid transparent`와 다층 `--shadow-border` 병용[](source:bu-shad)[](source:bu-surf) |
| 이미지 외곽선 | `SKILL.md`, `surfaces.md` | 콘텐츠 이미지에는 안쪽으로 `1px` 들어간 `1px` 외곽선을 둔다. 라이트는 `oklch(0 0 0 / 0.1)`, 다크는 `oklch(1 0 0 / 0.1)`만 쓰며 팔레트의 짙은 회색이나 accent 색상은 색 번짐 때문에 금지한다. 로고·일러스트 같은 투명 아트워크는 건너뛴다. | `outline-slate-*` 대신 `outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10`[](source:bu-img)[](source:bu-surf) |
| 터치 hover 제한과 스크롤 격리 | `SKILL.md` | hover 효과는 `@media (hover: hover)` 안에만 두어 터치 기기에서 탭 뒤 hover 상태가 붙어 남지 않게 한다(Tailwind 4 `hover:`는 자동 적용, Tailwind 3은 수동 감싸기 필요). 자체 누름 상태를 그리는 컨트롤에는 `-webkit-tap-highlight-color: transparent`를 넣고, 스크롤 가능한 다이얼로그·드로어·메뉴에는 `overscroll-behavior: contain`을 둔다. | 다이얼로그 스크롤 영역에 `overscroll-behavior: contain` 지정[](source:bu-hover)[](source:bu-scroll) |
| 아이콘 굵기·상태·RTL 반전 | `SKILL.md`, `icons.md` | 한 표면에 아이콘 라이브러리를 하나만 쓰고, 렌더링 굵기를 텍스트 무게(`400`→`1.5px`, `500–600`→`2px`, `700`→`2.5px`)에 맞추며 인라인 크기는 `1em`–`1.25em`으로 둔다. 별도 파일 대신 단일 SVG 요소에 `currentColor`를 쓰고, 기본 외곽선·활성 채움 변형(드문 전환만 `better-motion` 규칙으로 cross-fade)을 쓴다. `dir="rtl"`에서는 읽기 방향 아이콘만 반전한다. | `<Plus size={16} strokeWidth={2} absoluteStrokeWidth />`, `<ChevronRightIcon className="rtl:-scale-x-100" />`[](source:bu-icon)[](source:bu-icons) |
| 마감 점검과 보고 | `SKILL.md`, `reporting.md` | 작업 끝에는 6개 탐지 패턴으로 누락을 거르고, 코드의 모든 컴포넌트 상태와 라이트·다크 양쪽 테마를 검증한다(미확인 항목은 `Not verified`). 단독 리뷰에서는 터치 hover 고착 같은 인터랙션 파괴를 `HIGH`, 스크롤 체이닝·일관성 결함을 `MEDIUM`으로 분류해 `Block`/`Approve` 판정 결과를 낸다. | 터치 hover 고착 발견 시 `HIGH` 및 `Block`, 스크롤 체이닝은 `MEDIUM`[](source:bu-finish)[](source:bu-report)[](source:bu-repref) |

시각 마감 지적이 인터랙션 결함보다 앞설 수 없는 이유는 조작이 깨지면 화면이 아무리 매끄러워도 쓸 수 없기 때문이다.[](source:bu-intro) 이미지 외곽선에 순흑·순백 투명도만 쓰는 이유는 팔레트 색 틴트가 사진 가장자리에 색 띠를 만들기 때문이다.[](source:bu-img) 예컨대 안팎 반경이 같으면 바깥 반경에 안쪽 여백을 더하고, 링 그림자만 있는 카드에는 투명 테두리를 추가한다.[](source:bu-finish)[](source:bu-surf)

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령은 원문에 명시 없음. 모델이 `description`을 보고 켠다. 호출 제한 필드는 frontmatter와 `agents/openai.yaml`에 없다.[](source:bu-fm)[](source:bu-oa) |
| 성격 | UI 표면과 아이콘의 시각 마감을 정밀 수치로 적용·검증하는 도메인 스킬(`better-interface`의 6번째 리뷰 단계). |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `better-interface` {#rel-r51} | **이 스킬** | 호출 | 의무: `better-interface`가 6번 순서로 이 스킬을 로드해 리뷰하고, 단독 심각도·형식은 `better-interface` 기준으로 대체해 통합한다(사용자 개입 없음).[](source:bi-order) |
| `interface-review` {#rel-r61} | **이 스킬** | 참고 | 변경분에 이미지가 추가되면 `alt` 텍스트(`better-accessibility`)와 함께 이 스킬의 외곽선 규칙을 확인한다(사용자 개입 없음).[](source:ir-img) |
| `better-accessibility` {#rel-r66} | **이 스킬** | 참고 | hover 스타일링과 오버레이 스크롤 가둠 규칙 소유권이 이 스킬에 있음을 참조한다(사용자 개입 없음).[](source:ba-own) |
| **이 스킬** {#rel-r72} | `better-accessibility` | 참고 | 폼 입력창 경계의 `3:1` 비텍스트 대비, 포커스 링, 아이콘 전용 버튼의 접근 가능한 이름 규칙이 `better-accessibility` 소유임을 참조한다(사용자 개입 없음).[](source:bu-shad)[](source:bu-icons)[](source:ba-own) |

@architecture id=relation-map title="better-ui와 이어지는 스킬"
| bi | better-interface | backend |
| ir | interface-review | backend |
| self | better-ui(이 스킬) | backend |
| ba | better-accessibility | backend |
| bi > self | 호출 | |
| ir > self | 참고 | dashed |
| ba > self | 참고 | dashed |
| self > ba | 참고 | |

@code source=bu-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 정밀 수치 원칙, 표면·아이콘 8개 규칙, 6개 마감 점검표, 보고 지시 본문 | 스킬이 켜질 때 읽는다 | 정밀 수치와 프로젝트 일관성; 중첩 radius와 광학 정렬; 그림자와 강제 색상 모드; 이미지 외곽선; 터치 hover 제한과 스크롤 격리; 아이콘 굵기·상태·RTL 반전; 마감 점검과 보고 |
| `surfaces.md` | 중첩 radius 계산식, 광학 여백·삼각형·비대칭 아이콘, 라이트·다크 그림자, 이미지 외곽선 코드 | 표면 반경·정렬·그림자·이미지 외곽선 구현 시 읽는다 | 중첩 radius와 광학 정렬; 그림자와 강제 색상 모드; 이미지 외곽선 |
| `icons.md` | 텍스트 무게별 선 굵기표, `currentColor`, 채움·외곽선 상태, 크기 그리드, RTL 반전표 | 아이콘 선 굵기·상태·RTL 반전 구현 시 읽는다 | 아이콘 굵기·상태·RTL 반전 |
| `reporting.md` | 단독 리뷰의 `HIGH`/`MEDIUM`/`LOW` 기준, 표 형식, `Block`/`Approve` 규칙 | `better-interface` 없이 단독 리뷰를 보고할 때 읽는다 | 마감 점검과 보고 |
| `agents/openai.yaml` | 호스트 UI 표시 이름(`Better UI`)과 짧은 설명 | 호스트가 UI 표시 정보를 읽을 때 사용한다 | 원문에 명시 없음 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 우선순위 | 시각 마감 지적은 망가진 인터랙션보다 우선순위가 높을 수 없다 | [](source:bu-intro) |
| 정밀 수치 vs 예외 | 광학 미세 조정과 중첩 radius `24px` 컷오프만 눈으로 판단하며, 나머지 수치는 어림잡지 않는다 | [](source:bu-exact) |
| 프로젝트 스타일 관례 | 그림자 없음 같은 일관된 관례는 허용한다. 같은 세부 구현이 두 방식으로 갈릴 때만 지적한다 | [](source:bu-exact) |
| 중첩 radius 적용 한계 | 안쪽 여백이 `24px`을 넘거나 의도적으로 비대칭이면 중첩 공식을 적용하지 않고 별도 표면 토큰을 쓴다 | [](source:bu-rad) |
| 이미지 외곽선 색상과 대상 | `oklch(0 0 0 / 0.1)`과 `oklch(1 0 0 / 0.1)` 외 팔레트 회색·hex·accent 색상은 금지한다. 투명 로고·일러스트는 제외한다 | [](source:bu-img) [](source:bu-surf) |
| 아이콘 라이브러리와 파일 형식 | 한 표면에는 라이브러리 하나만, 아이콘은 래스터가 아닌 SVG만 쓴다. `fill="#..."`/`stroke="#..."` 하드코딩 대신 `currentColor`를 쓴다 | [](source:bu-icon) [](source:bu-icons) |
| 단독 리뷰에서 인터랙션 파괴 발견(예: 터치 hover 고착) | `HIGH`로 판정하고 `Block`으로 끝낸다 | [](source:bu-repref) |
| 확인하지 못한 검증 항목 | 검사하지 않은 영역은 `Approve` 금지. `Not verified`로 보고한다 | [](source:bu-report) [](source:bu-repref) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 라이트·다크 그림자 3중 토큰과 강제 색상 모드 — 그림자와 강제 색상 모드 · 라이트 3겹 `box-shadow` 수치와 다크 흰색 링 전환, `border: 1px solid transparent` 유지 이유를 담았다.
- 아이콘 선 굵기 보정과 RTL 분해 규칙 — 아이콘 굵기·상태·RTL 반전 · `24px` 그리드의 `16px` 축소 시 `stroke-width` 계산과 복합 아이콘 부분 반전 규칙을 정리했다.

@callout level=open-question title="확인하지 못한 것"
| `SKILL.md` 16줄과 `icons.md` 72줄이 애니메이션·아이콘 cross-fade 수치 소유 스킬로 언급한 `better-motion`은 저장소에 없어 확인하지 못했다(`범위 밖`). |

읽은 원본: 텍스트 파일 5개. 제외: 없음.
