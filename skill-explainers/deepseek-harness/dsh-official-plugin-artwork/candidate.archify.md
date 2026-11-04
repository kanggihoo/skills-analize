# dsh-official-plugin-artwork 스킬은 에이전트를 어떻게 바꾸나 {#dsh-official-plugin-artwork-skill}

`dsh-official-plugin-artwork`가 켜지면 에이전트는 공식 플러그인 아이콘을 그리기 전에 실제 기능과 매니페스트부터 조사하고, 기존 공식 아이콘 옆에 놓일 36×36 SVG를 만든다. 툴바·액션 아이콘은 대상이 아니다. 새 글리프는 디자이너 승인 없이 병합하지 않는다.[](source:skill-fm)[](source:draw-size)[](source:review-5) 부분 분석: 선택 사항인 기능 미리보기 절은 규칙을 원래 저장소의 쿡북 문서가 갖고 있는데, 그 문서가 이 저장소에 없어 열지 못했다.[](source:preview)

- 에이전트는 그리기 전에 실제 기능, 그 출력, 소유 매니페스트를 본다. 디자이너가 준 자산은 재사용하고, 브랜드 마크·제품 이름·식별자는 승인 없이 바꾸지 않는다.[](source:subject)
- 에이전트는 아이콘을 `width="36" height="36" viewBox="0 0 36 36"`로 그린다. 색은 절제하고, 빈 영역은 진짜 투명으로 남기고, 글자는 path로 내보낸다.[](source:draw-size)[](source:draw-color)[](source:draw-transparent)[](source:draw-letter)
- 패키지 이미지는 `<img>`로 렌더되므로, 스크립트, 애니메이션, 외부 자원, 폰트, `foreignObject` 없는 자체 완결 SVG로 내보낸다.[](source:export-svg)
- 병합 전에 패키지 검사 명령을 돌리고 라이트·다크 테마에서 눈으로 비교한다. 구조 검사는 시각 리뷰를 대체하지 않는다.[](source:review-3)

@answer scope="dsh-official-plugin-artwork · 파일 1개 · 커밋 475505c · 지시상 동작"
@meta locale=ko
@source skill-fm title="deepseek-harness/dsh-official-plugin-artwork/SKILL.md · 6194B · frontmatter" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=1:4
@source intro title="SKILL.md · 시각 언어와 디자이너 승인" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=8:8
@source preview title="SKILL.md · Optional feature previews" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=12:12
@source subject title="SKILL.md · 대상 조사와 재사용" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=16:16
@source existing title="SKILL.md · 기존 그림과 액션 아이콘 경계" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=17:17
@source affected title="SKILL.md · 영향받는 모든 항목 확인" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=18:18
@source draw-simple title="SKILL.md · 1 단순하게" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=22:22
@source draw-size title="SKILL.md · 2 광학 크기" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=23:23
@source draw-geom title="SKILL.md · 3 기하 일관성" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=24:24
@source draw-color title="SKILL.md · 4 절제된 색" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=25:25
@source draw-letter title="SKILL.md · 5 글자 정렬" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=26:26
@source draw-transparent title="SKILL.md · 6 진짜 투명" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=27:27
@source export-owner title="SKILL.md · 소유처 경로와 복사본" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=31:31
@source export-svg title="SKILL.md · SVG 형식 제한" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=32:32
@source export-local title="SKILL.md · 변경은 국소적으로" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=33:33
@source review-1 title="SKILL.md · 리뷰 1 번호 붙은 대안" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=37:37
@source review-2 title="SKILL.md · 리뷰 2 나란히 비교" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=38:38
@source review-3 title="SKILL.md · 리뷰 3 검사 명령" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=39:39
@source review-4 title="SKILL.md · 리뷰 4 dsh web 점검" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=40:40
@source review-5 title="SKILL.md · 리뷰 5 GUI PR과 승인" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=41:41
@source ux-reuse title="dsh-client-ui-ux/SKILL.md · 아이콘(28줄)" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=28:28
@source gif-must title="record-browser-gif/SKILL.md · GUI PR은 GIF 필수(12~14줄)" path=deepseek-harness/record-browser-gif/SKILL.md lines=12:14

## 언제 켜지고 무엇이 대상인가 {#trigger}

@code source=skill-fm language=yaml

머리말에는 `name`과 `description`만 있고 호출 제한 필드가 없다.[](source:skill-fm) 판정: 모델이 `description`을 참고해 스스로 켤 수 있다. `description`은 판단용 설명이지, 특정 단어가 있으면 켜지는 키워드 목록이 아니다.

| 구분 | 원문 내용 |
| --- | --- |
| 대상 | 공식 DeepSeek Harness 플러그인의 아이콘과 선택적 기능 미리보기다. 실험 플러그인도 포함한다. 패키지 그림과 `PluginArtwork` 글리프를 다룬다.[](source:skill-fm) |
| 대상 아님 | 툴바 아이콘과 액션 아이콘이다. 액션 아이콘은 `dsh-client-ui-ux`의 "Reuse before adding" 절이 맡는다.[](source:skill-fm)[](source:existing) |
| 시각 언어 | 공식 플러그인과 공식 실험 플러그인이 하나의 시각 언어를 쓴다. 실험 상태는 그림이 아니라 UI 라벨이 전한다.[](source:intro) |
| 승인 | 이 지침은 디자이너 승인을 대체하지 않는다.[](source:intro) |
| 기능 미리보기 | 공식 번들 상세 문서 맨 위의 큰 그림을 그리기 전에 원래 저장소의 "adding a plugin feature preview" 문서를 읽고 따른다. 선택 여부, 이미지 수, 캔버스, 위치, 언어 변형, 파일 위치, 승인 기준이 그 문서 소관이다.[](source:preview) |
| 미리보기와 아이콘 크기 | 아래 36 단위 아이콘 규격은 미리보기에 적용되지 않는다. 작은 아이콘은 기하 도형만 쓰고, 미리보기 SVG에 래스터를 넣는 예외는 그 문서가 소유한다.[](source:preview) |

## 어떤 순서로 그리고 언제 승인받나 {#flow}

아래 그림은 원문 절 순서를 따라 그렸다. 절 순서를 엄격한 실행 순서로 강제한다는 문장은 원문에 명시 없음. 다만 원문은 번호 붙은 대안을 다듬기 전에, 디자이너 승인을 병합 전에 하라고 못박는다.[](source:review-1)[](source:review-5)

@workflow id=artwork-flow title="공식 플러그인 그림 작업 순서"
| subject | 대상 조사 | external |
| draw | 그리고 다듬기 | backend |
| export | 소유처에 내보내기 | backend |
| verify | 비교와 검사 | backend |
| approve | 디자이너 승인 | external |
| land | 병합 | backend |
| subject > draw | |
| draw > export | |
| export > verify | |
| verify > approve | |
| approve > land | 승인 뒤 | emphasis |

@steps id=artwork-steps
| st-subject | 대상 조사 | 실제 기능, 출력, 소유 매니페스트와 기존 그림을 본다. 영향받는 항목, 목록, 상세, 컴포넌트 행을 모두 확인한다. | artwork-flow | subject |
| st-draw | 그리고 다듬기 | 그림 규칙 여섯 가지를 따른다. 기하가 불확실하면 번호 붙은 대안 몇 개를 먼저 보여 준다. | artwork-flow | draw |
| st-export | 소유처에 내보내기 | 매니페스트의 `icon` 경로에 자체 완결 SVG를 둔다. | artwork-flow | export |
| st-verify | 비교와 검사 | 기존 그림과 두 테마에서 나란히 비교하고 검사 명령을 돌린다. | artwork-flow | verify |
| st-approve | 디자이너 승인 | 새 글리프는 승인이 있어야 병합한다. | artwork-flow | approve |
| st-land | 병합 | GUI PR이면 저장소 UI 테스트 정책과 `record-browser-gif`를 따른다. | artwork-flow | land |

@callout level=warning title="기존 파일이나 생성한 초안은 승인이 아니다"
대안은 번호를 붙여 몇 개 보여 주고, 라벨을 리뷰 내내 유지한 채 고른 안을 적용한다. 기존 파일이나 생성한 초안이 있다는 사실이 디자이너 승인을 뜻하지 않는다.[](source:review-1) 비교용 산출물은 gitignore된 폴더에 두고 제품 패키지에 넣지 않는다.[](source:review-1) 디자이너가 준 자산은 재사용하고, 브랜드 마크를 지어내거나 제품 이름·식별자·무관한 아이콘을 승인 없이 바꾸지 않는다.[](source:subject)

원문은 승인을 누가 어떤 형태로 남기는지, 승인이 없으면 병합을 막는 장치가 무엇인지 적지 않는다. 원문에 명시 없음.[](source:review-5)

## 그림 규칙은 무엇을 요구하나 {#drawing}

아이콘 규격과 규칙은 아래와 같다. 원문 어조가 지시인 것은 "지시", `do not`·`avoid`인 것은 "금지", `prefer`인 것은 "권고"로 적었다.

| 규칙 | 내용 | 원문 어조 |
| --- | --- | --- |
| 단순하게 | 주 피사체 하나와 설명에 필요한 세부만 쓴다. 관련 기능은 같은 비유를 공유할 수 있고, 비율·실루엣·팔레트로 구분한다. 패널, 기호, 배지를 더해 구분하지 않는다.[](source:draw-simple) | 지시 |
| 규격 | `width="36" height="36" viewBox="0 0 36 36"`을 쓴다. 의도적인 여백을 두고 가운데에 놓는다. 18–22 단위는 시작 범위일 뿐 모든 실루엣이나 넓은 글자 태그에 필수가 아니다.[](source:draw-size) | 지시 |
| 타일 | 표시 크기와 바깥 타일 틀은 페이지 렌더러(`PluginManagerPage.tsx`)가 소유한다. 그 타일을 SVG에 굽거나 툴바 글리프를 키워 채우지 않는다.[](source:draw-size) | 금지 {bad:타일 굽기} |
| 기하 | 주 피사체와 부 요소의 균형을 맞추고, 반복 표시와 모서리를 정렬한다. 꼬리와 손잡이는 의도적이어야 한다. 요청받은 한 차원씩 다듬고 승인된 부분은 바꾸지 않는다.[](source:draw-geom) | 지시 |
| 색 | 기본은 절제한다. 이웃 아이콘과 채도·밝기를 맞추고, Auto Authorization Review나 Codex 서브에이전트 같은 기존 팔레트를 선호한다.[](source:draw-color) | 권고 |
| 선명한 색 | 유난히 선명하거나 네온인 색은 승인된 브랜드 요구, 꼭 필요한 대비, 명시적 디자이너 지시일 때만 쓴다.[](source:draw-color) | 금지 {bad:임의의 네온} |
| 색 조정 | 채도를 색조·명도와 따로 조정한다. 채도를 줄이려고 그림을 회색으로 흐리거나 탁하게 만들지 않는다. 평면 채움이나 짧은 그라디언트와 제한된 레이어를 쓴다.[](source:draw-color) | 지시와 금지 |
| 효과 | glow, drop shadow, 광택 하이라이트, 이모지를 피한다. 페이지 CSS는 여전히 시맨틱 테마 토큰을 쓴다.[](source:draw-color) | 금지 |
| 글자 | 보이는 잉크 기준으로 정렬한다. 자형, 대문자 높이, 기준선, 굵기, 간격을 맞춘다. 좌표가 같아도 획 끝과 이음 때문에 달라 보이므로 렌더된 획 가장자리를 비교한다. 폰트 의존 없이 path로 내보내고 실제 크기에서 읽히게 한다.[](source:draw-letter) | 지시 |
| 투명 | 빈 영역은 진짜 투명이다. 속 빈 렌즈는 다른 도형과 겹치는 곳에서도 배경이 비쳐야 한다. 아래 채움을 국소 마스크나 컷아웃으로 지우고, 흰색이나 어두운 원으로 대체하지 않는다. 두 테마에서 확인한다.[](source:draw-transparent) | 지시와 금지 |

## 어떻게 내보내고 검증하나 {#export-verify}

| 대상 | 규칙 | 원문 어조 |
| --- | --- | --- |
| 경로 | 매니페스트의 `icon` 경로를 쓰고 그 리소스를 게시한다. 번들과 컴포넌트에 의도한 복사본이 있으면 함께 갱신한다. 범위에 들면 현지화된 표시 이름과 설명을 확인한다. 아이콘만 바꾸려고 기능이 만든 자산을 바꾸지 않는다.[](source:export-owner) | 지시와 금지 |
| SVG 형식 | 패키지 이미지는 `<img>`로 렌더되므로 자체 완결 SVG 기하로 내보낸다. 그라디언트·마스크·클립 참조는 이 파일 안에서 고유한 이름으로 만든다.[](source:export-svg) | 지시 |
| SVG 금지 | 스크립트, 이벤트 핸들러, 애니메이션, 외부 이미지·스타일, 폰트, `foreignObject`를 넣지 않는다.[](source:export-svg) | 금지 {bad:외부 자원} |
| 인라인 | 인라인 React 그림은 인스턴스마다 ID가 달라야 한다. 별도 이미지 문서끼리는 ID를 공유하지 않는다.[](source:export-svg) | 지시 |
| 범위 | 그림을 보이려고 런타임 의존성, 프리미티브 export, 렌더러 특수 처리를 더하지 않는다.[](source:export-local) | 금지 |

검증은 리뷰 절의 네 단계다. 아래 명령은 원문이 적은 것이며 이 분석에서 실행하지 않았다.[](source:review-3)

| 명령 | 맡은 일 |
| --- | --- |
| `pnpm run verify-package-meta` | 패키지 메타데이터와 SVG 그림을 검사한다.[](source:review-3) |
| `pnpm run constraints` | 정식 패키지 페이로드를 검사한다.[](source:review-3) |
| `pnpm run verify-official-bundle-catalog` | 공식 번들 카탈로그를 검사한다.[](source:review-3) |
| `pnpm run gen-official-bundle-catalog` | 카탈로그가 낡았을 때만 다시 만든다. 손으로 고치지 않는다.[](source:review-3) |
| `dsh web` | 영향받는 산출물을 빌드한 뒤 실제 페이지를 연다. 승인된 다듬기는 모아서, 메타데이터를 캐시하는 Host를 재시작하기 전에 반영한다. 항목과 중첩 컴포넌트 행을 두 테마에서 확인한다.[](source:review-4) |

비교할 때는 기존 그림과 새 그림을 바뀌지 않은 참조 옆에 두고, 라이트·다크 테마에서, 실제 행·카드 크기와 확대 크기로 본다. 눈여겨볼 것은 균형, 글자, 빈 공간, 잘림, 이미지 디코딩이다.[](source:review-2) 구조 검사가 시각 리뷰를 대체하지 않는다.[](source:review-3) 이 스킬에는 재사용할 그리기 원칙만 기록하고 거절된 초안의 역사는 적지 않는다.[](source:review-5)

## 흐름 속 위치 {#position}

이 스킬은 `client-ui` 묶음에 속하고, 앞에서 이 스킬을 부르는 스킬은 원장에 없다. 화살표는 관계 방향이며 필수 실행 순서가 아니다. 점선은 참고, 굵은 선은 넘김이다.

@workflow id=position-flow title="dsh-official-plugin-artwork 앞뒤의 스킬"
| art | dsh-official-plugin-artwork | backend |
| ux | dsh-client-ui-ux | backend |
| gif | record-browser-gif | backend |
| art > ux | 경계 | dashed |
| art > gif | GUI PR | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| - {#row-r33} | 액션 아이콘 판단 | 액션 아이콘은 `dsh-client-ui-ux`의 "Reuse before adding" 절 소관이고, 이 스킬의 description도 툴바·액션 아이콘은 대상이 아니라고 적는다 | r33 |
| - {#row-r34} | GIF 증거 | GUI PR이면 저장소 UI 테스트 정책과 `record-browser-gif`를 따른다. 새 글리프는 병합 전에 디자이너 승인을 받는다 | r34 |

- 이 스킬이 17줄에서 액션 아이콘을 `dsh-client-ui-ux`로 돌린다.[](source:existing) 그쪽 스킬이 아이콘 규칙을 갖는 것도 확인했다. 새 글리프는 디자이너 승인이 필요하고 아이콘은 기존 라이브러리에서 고른다.[](source:ux-reuse)
- `record-browser-gif`는 제품 사용자에게 보이는 GUI를 바꾸는 모든 PR에 GIF가 필수라고 적는다.[](source:gif-must)
- 전체 흐름은 `deepseek-harness/_group-client-ui/client-ui.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `deepseek-harness/dsh-official-plugin-artwork/SKILL.md` 1개, 6,194B(41줄). 원본이고 끝까지 읽었다. 이 폴더에는 다른 텍스트 파일이 없다.
- 관계 확인용으로 읽은 곳: `dsh-client-ui-ux` 28줄, `record-browser-gif` 12~14줄.
- 범위 밖: 본문이 링크한 `../../../docs/cookbook/adding-a-plugin-preview.md`, `plugin-artwork.tsx`, `PluginManagerPage.tsx`, 예시 아이콘 SVG 두 개, `verify-package-meta.ts`는 원래 저장소(deepseek-harness)의 파일이다. 이 저장소에 없어 열지 않았다.
- 제외한 파일: 없음. 번역본이 없다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준, 폴더 검색으로도 확인).
- 실행하지 않았다. `pnpm` 명령과 `dsh web`은 원문에 적힌 지시로만 읽었다. 이 페이지의 동작은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
기능 미리보기의 선택 여부, 이미지 수, 캔버스, 위치, 언어 변형, 승인 기준은 외부 쿡북이 정한다. 이 페이지는 그 내용을 알지 못한다.[](source:preview)
"유난히 선명한 색", "절제된 색"의 수치 기준은 원문에 명시 없음. 18–22 단위가 권장 시작 범위라는 것 외에 크기 한도도 원문에 명시 없음.[](source:draw-color)[](source:draw-size)
