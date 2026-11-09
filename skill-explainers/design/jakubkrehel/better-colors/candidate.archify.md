# better-colors 스킬은 에이전트를 어떻게 바꾸나 {#better-colors-skill}

`better-colors`를 쓰면 에이전트는 색을 눈대중으로 고르지 않고 ramp(한 hue의 밝기 단계 묶음) 단위로 만들고, 단계마다 역할을 붙이고, 실제로 그려지는 쌍의 대비를 잰다. 재지 않은 대비 값은 보고하지 않고, 계산할 수 있는 색을 추정하지 않는다. 대비가 실패하면 쌍·측정값·못 미친 기준만 보고하고 **색은 두며**, 사용자가 요청할 때만 고친 뒤 다시 잰다.[](source:bc-intro)[](source:bc-measure)

- 켜지는 때: frontmatter에 호출 제한 필드가 없어서 모델이 `description`을 보고 켤 수 있다. `better-interface`가 도메인 리뷰 5번째로 부르는 경로도 원문에 있다.[](source:bc-fm)[](source:bi-order)
- 강제하는 것: component는 semantic token만 쓴다. 토큰은 자기 역할에서만 쓴다. 한 화면에서 채운 색의 primary action은 하나다. status hue는 accent hue에서 OKLCH hue로 `15°` 이상 떨어뜨린다.[](source:bc-sem)[](source:bc-role)[](source:bc-action)[](source:bc-pat)
- 끝내는 방법: `HIGH`가 하나라도 남으면 `Block`, 아니면 `Approve`다. 보지 않은 범위는 `Approve`하지 않는다.[](source:bc-fmt)
- 쓰면 안 되는 때: 그 쌍이 통과해야 하는지의 판단은 `better-accessibility`, 표면·shadow·아이콘 색은 `better-ui` 몫이다. 표기법, tinted neutral, gradient 보간 공간은 프로젝트의 선택이지 발견이 아니다.[](source:bc-bound)[](source:bc-intro)

@answer scope="design/jakubkrehel/better-colors · 원본 텍스트 8개 38,486B · 커밋 0465878 · 관계 확인용으로 다른 스킬 줄만 읽음 · 지시는 읽기만 하고 실행하지 않음 · 지시상 동작"
@meta locale=ko
@source bc-fm title="design/jakubkrehel/better-colors/SKILL.md · 7698B · 지시 본문과 frontmatter" path=design/jakubkrehel/better-colors/SKILL.md lines=1:4
@source bc-intro title="SKILL.md · 하는 일과 발견이 아닌 것" path=design/jakubkrehel/better-colors/SKILL.md lines=8:10
@source bc-bound title="SKILL.md · 다른 스킬의 몫" path=design/jakubkrehel/better-colors/SKILL.md lines=12:12
@source bc-match title="SKILL.md · 프로젝트의 색 체계를 따른다" path=design/jakubkrehel/better-colors/SKILL.md lines=16:18
@source bc-ramps title="SKILL.md · 체계는 색이 아니라 ramp다" path=design/jakubkrehel/better-colors/SKILL.md lines=22:22
@source bc-job title="SKILL.md · 단계마다 일이 있다" path=design/jakubkrehel/better-colors/SKILL.md lines=26:26
@source bc-sem title="SKILL.md · primitive는 hue로, semantic은 역할로 이름 짓는다" path=design/jakubkrehel/better-colors/SKILL.md lines=30:30
@source bc-role title="SKILL.md · 토큰은 자기 역할에서만 쓴다" path=design/jakubkrehel/better-colors/SKILL.md lines=34:34
@source bc-hue title="SKILL.md · ramp 전체에서 hue를 지킨다" path=design/jakubkrehel/better-colors/SKILL.md lines=38:38
@source bc-meaning title="SKILL.md · 색 하나, 뜻 하나" path=design/jakubkrehel/better-colors/SKILL.md lines=42:42
@source bc-action title="SKILL.md · 화면당 채운 action 하나" path=design/jakubkrehel/better-colors/SKILL.md lines=46:48
@source bc-measure title="SKILL.md · 렌더된 쌍을 재고 보고한다" path=design/jakubkrehel/better-colors/SKILL.md lines=52:52
@source bc-grad title="SKILL.md · gradient 보간 공간" path=design/jakubkrehel/better-colors/SKILL.md lines=56:56
@source bc-pat title="SKILL.md · 끝내기 전 점검 표" path=design/jakubkrehel/better-colors/SKILL.md lines=60:78
@source bc-sev title="SKILL.md · 심각도" path=design/jakubkrehel/better-colors/SKILL.md lines=82:84
@source bc-ver title="SKILL.md · 검증" path=design/jakubkrehel/better-colors/SKILL.md lines=86:86
@source bc-fmt title="SKILL.md · 보고 형식과 끝맺음" path=design/jakubkrehel/better-colors/SKILL.md lines=88:95
@source bc-yaml title="design/jakubkrehel/better-colors/agents/openai.yaml · 110B · 표시 이름과 짧은 설명" path=design/jakubkrehel/better-colors/agents/openai.yaml lines=1:3
@source ps-sys title="design/jakubkrehel/better-colors/palette-structure.md · 4923B · ramp 구성과 역할" path=design/jakubkrehel/better-colors/palette-structure.md lines=5:13
@source ps-role title="palette-structure.md · 단계와 역할 표" path=design/jakubkrehel/better-colors/palette-structure.md lines=15:41
@source ps-neu title="palette-structure.md · neutral" path=design/jakubkrehel/better-colors/palette-structure.md lines=43:51
@source ps-stat title="palette-structure.md · status 색" path=design/jakubkrehel/better-colors/palette-structure.md lines=53:60
@source ps-audit title="palette-structure.md · 기존 팔레트 감사" path=design/jakubkrehel/better-colors/palette-structure.md lines=62:72
@source pg-brand title="design/jakubkrehel/better-colors/palette-generation.md · 6096B · 값 만들기" path=design/jakubkrehel/better-colors/palette-generation.md lines=5:13
@source pg-ramp title="palette-generation.md · 올바른 ramp의 성질" path=design/jakubkrehel/better-colors/palette-generation.md lines=15:24
@source pg-lib title="palette-generation.md · 색 라이브러리를 쓴다" path=design/jakubkrehel/better-colors/palette-generation.md lines=26:58
@source pg-hues title="palette-generation.md · 여러 hue를 함께" path=design/jakubkrehel/better-colors/palette-generation.md lines=60:67
@source pg-dark title="palette-generation.md · dark mode" path=design/jakubkrehel/better-colors/palette-generation.md lines=69:91
@source pg-switch title="palette-generation.md · 전환 방식 고르기" path=design/jakubkrehel/better-colors/palette-generation.md lines=93:108
@source cf-note title="design/jakubkrehel/better-colors/color-formats.md · 4565B · 표기법과 gamut" path=design/jakubkrehel/better-colors/color-formats.md lines=5:21
@source cf-conv title="color-formats.md · 변환" path=design/jakubkrehel/better-colors/color-formats.md lines=23:44
@source cf-gamut title="color-formats.md · gamut" path=design/jakubkrehel/better-colors/color-formats.md lines=46:82
@source cf-css title="color-formats.md · 알아 둘 최신 CSS" path=design/jakubkrehel/better-colors/color-formats.md lines=84:90
@source ct-intro title="design/jakubkrehel/better-colors/contrast.md · 3949B · 대비 측정" path=design/jakubkrehel/better-colors/contrast.md lines=3:5
@source ct-wcag title="contrast.md · WCAG 2 임계값" path=design/jakubkrehel/better-colors/contrast.md lines=7:17
@source ct-apca title="contrast.md · APCA 임계값" path=design/jakubkrehel/better-colors/contrast.md lines=19:34
@source ct-fix title="contrast.md · 실패한 쌍은 요청이 있을 때만 고친다" path=design/jakubkrehel/better-colors/contrast.md lines=36:57
@source ct-pol title="contrast.md · 배경에서 글자 극성 고르기" path=design/jakubkrehel/better-colors/contrast.md lines=59:63
@source ct-check title="contrast.md · 점검할 것" path=design/jakubkrehel/better-colors/contrast.md lines=65:70
@source cu-mean title="design/jakubkrehel/better-colors/color-usage.md · 5292B · 색 쓰기" path=design/jakubkrehel/better-colors/color-usage.md lines=5:19
@source cu-tok title="color-usage.md · 토큰은 자기 역할에서" path=design/jakubkrehel/better-colors/color-usage.md lines=21:33
@source cu-act title="color-usage.md · 화면당 채운 action 하나" path=design/jakubkrehel/better-colors/color-usage.md lines=35:48
@source cu-grad title="color-usage.md · gradient" path=design/jakubkrehel/better-colors/color-usage.md lines=50:81
@source cu-cult title="color-usage.md · 문화권별 색" path=design/jakubkrehel/better-colors/color-usage.md lines=83:85
@source cu-dark title="color-usage.md · light, dark, increased contrast" path=design/jakubkrehel/better-colors/color-usage.md lines=87:109
@source tn-tier title="design/jakubkrehel/better-colors/token-naming.md · 5853B · 토큰 이름" path=design/jakubkrehel/better-colors/token-naming.md lines=5:27
@source tn-inv title="token-naming.md · 역할 목록" path=design/jakubkrehel/better-colors/token-naming.md lines=29:41
@source tn-gram title="token-naming.md · 이름 문법" path=design/jakubkrehel/better-colors/token-naming.md lines=43:65
@source tn-anti title="token-naming.md · 나쁜 이름" path=design/jakubkrehel/better-colors/token-naming.md lines=67:76
@source tn-tw title="token-naming.md · Tailwind 프로젝트" path=design/jakubkrehel/better-colors/token-naming.md lines=78:97
@source bi-fm title="design/jakubkrehel/better-interface/SKILL.md · 8779B · r64 확인용" path=design/jakubkrehel/better-interface/SKILL.md lines=1:12
@source bi-order title="better-interface/SKILL.md · 도메인 스킬을 이 순서로 모두 불러 쓴다" path=design/jakubkrehel/better-interface/SKILL.md lines=42:57
@source bi-trig title="better-interface/SKILL.md · escalation trigger" path=design/jakubkrehel/better-interface/SKILL.md lines=77:95
@source ir-fm title="design/jakubkrehel/interface-review/SKILL.md · 10128B · r70 확인용 frontmatter" path=design/jakubkrehel/interface-review/SKILL.md lines=1:5
@source ir-sig title="interface-review/SKILL.md · 제거된 줄 읽기" path=design/jakubkrehel/interface-review/SKILL.md lines=56:61
@source rs-contrast title="design/jakubkrehel/interface-review/removed-signals.md · 3228B · prefers-contrast 행" path=design/jakubkrehel/interface-review/removed-signals.md lines=12:12
@source rs-token title="removed-signals.md · 토큰을 literal로 바꾼 행" path=design/jakubkrehel/interface-review/removed-signals.md lines=16:16
@source ui-bound title="design/jakubkrehel/better-ui/SKILL.md · r78 확인용" path=design/jakubkrehel/better-ui/SKILL.md lines=16:16
@source ty-bound title="design/jakubkrehel/better-typography/SKILL.md · r94 확인용" path=design/jakubkrehel/better-typography/SKILL.md lines=10:10
@source lay-bound title="design/jakubkrehel/better-layout/SKILL.md · r90 확인용" path=design/jakubkrehel/better-layout/SKILL.md lines=36:36
@source wr-bound title="design/jakubkrehel/better-writing/SKILL.md · r99 확인용" path=design/jakubkrehel/better-writing/SKILL.md lines=98:98
@source va-axes title="design/jakubkrehel/variant/SKILL.md · r109 확인용 축 표" path=design/jakubkrehel/variant/SKILL.md lines=17:24
@source bk-bound title="design/jakubkrehel/break/SKILL.md · r121 확인용" path=design/jakubkrehel/break/SKILL.md lines=11:11
@source bk-scen title="design/jakubkrehel/break/scenarios.md · dark mode 깨짐의 담당" path=design/jakubkrehel/break/scenarios.md lines=78:78
@source ex-img title="design/jakubkrehel/explain-interface/from-an-image.md · r132 확인용" path=design/jakubkrehel/explain-interface/from-an-image.md lines=21:25
@source ex-sys title="design/jakubkrehel/explain-interface/read-the-system.md · r132 확인용" path=design/jakubkrehel/explain-interface/read-the-system.md lines=87:87
@source ex-sk title="design/jakubkrehel/explain-interface/SKILL.md · 팔레트 어휘의 담당" path=design/jakubkrehel/explain-interface/SKILL.md lines=11:11
@source bd-bound title="design/jakubkrehel/build-design/SKILL.md · r136 확인용" path=design/jakubkrehel/build-design/SKILL.md lines=12:12
@source td-bound title="design/jakubkrehel/teardown/SKILL.md · r145 확인용" path=design/jakubkrehel/teardown/SKILL.md lines=14:14
@source td-prev title="design/jakubkrehel/teardown/preview-page.md · 팔레트와 렌더된 대비" path=design/jakubkrehel/teardown/preview-page.md lines=71:71
@source ba-bound title="design/jakubkrehel/better-accessibility/SKILL.md · 대비 요구는 이 스킬이 정한다" path=design/jakubkrehel/better-accessibility/SKILL.md lines=12:12
@source ba-color title="better-accessibility/SKILL.md · 대비 표와 실패 시 보고" path=design/jakubkrehel/better-accessibility/SKILL.md lines=70:80

## 언제 켜지고, 언제 다른 스킬로 가야 하나 {#trigger}

@code source=bc-fm language=yaml

frontmatter에는 `name`과 `description`만 있다. 호출 제한 필드가 없으므로 모델이 `description`을 보고 켤 수 있다.[](source:bc-fm)

- 판정: `description`은 모델이 판단할 때 참고하는 설명이다. "palette"나 "contrast"라는 단어가 나와야만 켜지는 목록은 아니다.
- `agents/openai.yaml`에도 표시 이름과 짧은 설명 두 필드뿐이고 호출 제한은 없다.[](source:bc-yaml)
- 사용자가 직접 부를 때의 인자, 첫 응답 규칙, 사람 승인 지점은 `원문에 명시 없음`이다.

이 스킬은 무엇이 발견이고 무엇이 선택인지부터 가른다.[](source:bc-intro)

| 구분 | 예 | 에이전트가 하는 일 |
| --- | --- | --- |
| 발견 | 깨진 역할 매핑, 실패한 쌍, gamut 밖 단계 | 지적하고 보고한다 |
| 프로젝트의 선택 | 표기법, tinted neutral, gradient 보간 공간 | 지적하지 않는다. 프로젝트 방식을 따른다 |

아래 일은 다른 스킬 몫이라고 이름을 들어 적는다.[](source:bc-bound)

| 하려는 일 | 이 스킬 대신 | 이 스킬이 하는 일 | rel-id |
| --- | --- | --- | --- |
| 그 쌍이 통과해야 하는지, 색만으로 의미를 전하면 안 되는지 정한다 | `better-accessibility` {caution:범위 밖} | 어떤 쌍을 재라고 정해 주면 렌더된 쌍을 재서 값과 못 미친 기준을 보고한다. 색만으로 의미를 전하지 말라는 요구는 그쪽 것이라고 적는다[](source:bc-meaning)[](source:ct-intro) | r84 |
| 표면, shadow, 아이콘 색을 다룬다 | `better-ui` {caution:범위 밖} | token과 대비 측정까지만 맡는다 | r85 |

호출 방식에 따라 하는 일이 달라지는 규칙은 원문에 없다. 판정: 색 변환도 스킬이 로드됐다는 이유만으로는 하지 않는다. 변환 조건은 아래 "대비는 어떻게 재고" 패널의 표에 있다. 출처: 변환 문장.[](source:cf-conv)

## 색 시스템은 무엇으로 짓고 이름은 어떻게 붙이나 {#system}

체계는 색이 아니라 ramp다. 대부분의 제품에 필요한 ramp는 세 종류뿐이다.[](source:ps-sys)[](source:bc-ramps)

| Ramp | 개수 | 비고 |
| --- | --- | --- |
| Neutral | 1 | 인터페이스의 80~90%를 맡는다. 배경, border, 본문 글자 |
| Accent | 1 | 브랜드 hue. interactive·selected 상태 |
| Status | 0~4 | `danger`, `warning`, `success`, `info`. 제품이 그 상태를 보여 줄 때만 추가 |

단계마다 일이 있다. 역할이 필요로 하는 단계만 만들고 나머지는 만들지 않는다. 두 번째 accent hue는 두 가지를 한눈에 구분해야 할 때만 들어선다. 아니면 accent ramp의 단계를 더 쓴다.[](source:bc-job)[](source:bc-ramps)[](source:ps-role)

| 역할 | Tailwind | Radix |
| --- | --- | --- |
| Page background | `50` | `1` |
| Subtle background | `50` | `2` |
| Component background | `100` | `3` |
| Component hover | `200` | `4` |
| Component active / selected | `200` | `5` |
| Subtle border, separator | `200` | `6` |
| Border, focus ring | `300` | `7` |
| Hovered border | `400` | `8` |
| Solid fill | `600` | `9` |
| Solid fill hover | `700` | `10` |
| Low-contrast text | `700` | `11` |
| High-contrast text | `900` | `12` |

두 표기의 차이는 번호만이 아니다.[](source:ps-role)

- Radix는 12단계를 역할로 정의한다. 9번이 어느 ramp·어느 appearance에서나 solid fill이다.
- Tailwind는 11단계를 밝기로 정의한다. 위 매핑은 light mode에서만 맞고 dark에서는 뒤집힌다.
- 프로젝트가 쓰는 쪽을 따른다. 새 시스템이면 Radix 모델을 권한다. Tailwind에서는 `50`~`950`을 두고 역할 매핑은 semantic tier에 넣는다.
- 표에서 반복되는 단계의 두 역할은 같게 그려진다. 둘이 달라야 하는 디자인은 12단계 ramp가 필요하다.

Neutral, status, 이름에는 다음 규칙이 걸려 있다.

| 영역 | 규칙 | 구분 |
| --- | --- | --- |
| Neutral | 순수 회색 ramp가 기본이다. accent 쪽으로 기울이는 것(OKLCH chroma `0.005`~`0.02`)은 스타일 선택이지 교정이 아니다. 고르든 안 고르든 ramp 전체에서 지킨다. neutral 단계 수는 accent 단계 수보다 적으면 안 된다[](source:ps-neu) | 규칙·선택 |
| Status | 모든 status hue를 accent에서 OKLCH hue로 `15°` 이상 떨어뜨린다. 브랜드가 빨강이면 danger는 빨강일 수 없다. 옮길 곳이 없으면 파괴적 action에 윤곽선 버튼과 아이콘 같은 구분되는 처리를 준다[](source:ps-stat) | 규칙 |
| Status 단계 수 | accent보다 적다. 대부분 배경·border·solid fill·글자 네 역할이다. 제품이 status 컴포넌트를 전 범위로 꾸밀 때만 전체 ramp를 만든다[](source:ps-stat) | 권고 |
| 두 tier | primitive는 값의 이름(`--blue-600`)이고 component에서 쓰지 않는다. semantic은 역할의 이름(`--color-text-secondary`)이고 primitive를 가리키며 component가 참조하는 유일한 tier다. 이 이음매가 theme 교체를 component 수정 없이 가능하게 한다[](source:bc-sem)[](source:tn-tier) | 규칙 |
| component tier | 특정 component가 의도적으로 시스템에서 벗어날 때만 셋째 tier를 둔다. 하나는 문서화된 예외이고 스무 개면 semantic tier에 역할이 빠진 것이다[](source:tn-tier) | 권고 |
| 역할 목록 | Surfaces는 page background, surface, raised, sunken, overlay scrim이다. Text는 primary, secondary, disabled, inverse, on-accent다. Borders는 subtle, default, strong, focus ring, separator다. Accent는 subtle background, border, solid, solid hover, text다. Status는 제품이 보이는 status마다 subtle background, border, solid, text다. 이 역할마다 토큰이 있어야 완성이다. separator와 border는 값이 같아도 별개 역할이다[](source:tn-inv) | 규칙 |
| 이름 문법 | neutral 역할은 속성이 앞선다: `--color-<property>-<variant>-<state>`이고 property는 `bg`, `text`, `border`다. accent·status 역할은 역할이 앞선다: `--color-<role>-<part>-<state>`이고 role은 `accent`, `danger` 등, part는 `subtle`, `border`, `solid`, `text`다. 개념마다 한 단어만 쓴다[](source:tn-gram) | 규칙 |
| 한 단어씩 | 전경은 `text`, 배경은 `bg`, 가장자리는 `border`, 브랜드색은 `accent`다. `fg`·`foreground`·`content`·`ink`, `fill`, `stroke`·`outline`·`line`, `primary`·`brand`·`theme`은 섞지 않는다. `primary`는 "그룹에서 가장 두드러진 것" 한 가지 뜻으로만 쓴다[](source:tn-gram) | 규칙 |
| 토큰은 자기 역할에서만 | 값이 지금 맞는다고 다른 역할의 토큰을 빌리지 않는다. 역할에 토큰이 없으면 토큰을 만든다. 예: border 토큰을 글자색에, 글자 토큰을 배경에 쓰지 않는다[](source:bc-role)[](source:cu-tok) | 규칙 |
| 색 하나, 뜻 하나 | OKLCH hue `15°` 안은 같은 색으로 본다. 뜻이 있는 자리에서 그 색이 빠져도 안 된다(accent가 interactive라면 neutral로 그린 interactive 요소도 오해를 부른다)[](source:bc-meaning)[](source:cu-mean) | 규칙 |
| 화면당 채운 action 하나 | 채운 색이 primary 강조를 뜻하면 primary action 하나만 채우고 나머지는 neutral로 둔다. 색은 글자가 아니라 배경에 입힌다. 선택된 상태(활성 탭, 체크된 segment)는 강조가 아니라 상태라서 glyph·label에 accent를 써도 된다. 이미 다른 방식으로 강조를 표시하는 기존 체계, 서로 다른 상태·범주를 뜻하는 여러 채운 배경은 유지한다[](source:bc-action)[](source:cu-act) | 규칙 |

나쁜 이름과 고치는 이름은 원문 표에 6개 있다.[](source:tn-anti)

| 이름 | 문제 | 대신 |
| --- | --- | --- |
| `--color-blue-button` | semantic tier에 외형이 들어가 브랜드가 바뀌면 거짓이 된다 | `--color-accent-solid` |
| `--color-sidebar-gray` | 처음 쓴 곳 이름이라 두 번째 사용에서 무의미해진다 | `--color-bg-surface` |
| `--color-light-gray` | dark mode에서는 어두운 색이라 거짓이다 | primitive `--neutral-200` |
| `--color-text-2` | 번호 붙은 semantic은 뜻이 없다 | `--color-text-secondary` |
| `--color-gray-hover` | hue와 상태를 섞고 어느 tier에도 속하지 않는다 | `--color-bg-surface-hover` |
| component에서 쓴 `--blue-600` | semantic tier를 건너뛰어 theme 이음매를 없앤다 | semantic 토큰이 가리키게 한다 |

Tailwind v4에서는 `@theme`에서 선언한 이름이 곧 유틸리티 API가 된다.[](source:tn-tw)

- primitive와 semantic을 같은 `@theme` 블록에 선언한다.
- dark 값은 `.dark` 블록에서 `@theme` 밖에 두고 `inline` 없이 쓴다. 그래야 유틸리티가 렌더 때 semantic 변수를 읽는다.
- 템플릿은 semantic 유틸리티를 쓴다. component의 `bg-blue-600`은 지적할 대상이다.
- `text-text-secondary`처럼 이름이 겹치는 것은 받아들이거나 프로젝트 관례를 따른다.
- 알파가 있는 색은 정적 배경과 대비를 잴 수 없다. 글자가 올라가는 곳에는 solid 토큰을 쓴다.

## 값은 어떻게 만들고 수치는 얼마인가 {#values}

브랜드 색은 값 하나로 온다. ramp를 만들기 전에 두 가지를 정한다.[](source:pg-brand)

| 결정 | 규칙 |
| --- | --- |
| 어느 단계에 두나 | 버튼·링크용 브랜드 색은 solid fill 단계(Tailwind `600`, Radix `9`)에 둔다. 그래야 primary 버튼이 근사가 아니라 실제 브랜드 색이다 |
| 고정인가 맞추는가 | 계약상 고정된 브랜드 색은 그대로 두고 ramp를 그 주위로 짓는다. 그 한 단계의 간격이 약간 고르지 않아도 된다. 그 밖에는 ramp에 맞추는 편이 거의 항상 낫다 |
| 흰 글자 대비에 실패하면 | 그래도 브랜드 색이다. 놓인 단계에 두고 interactive fill은 더 어두운 단계를 쓴다. 브랜드를 몰래 어둡게 하지 않는다 |

원문 예: `#3b82f6`은 `500`에 놓이고, 흰색 대비가 3.68:1이라 fill은 `600`이다.[](source:pg-brand)

올바른 ramp의 성질은 어떤 표기든 확인할 수 있게 적혀 있다. 색 라이브러리(`culori`, `colorjs.io`, `chroma.js`)로 만들고 눈이나 손으로 계산하지 않는다.[](source:pg-ramp)[](source:pg-lib)

@facts
| 밝기 | OKLCH `L`(0~1)이 일정하게 변한다. HSL 밝기는 지각적이지 않다[](source:pg-ramp)[](source:bc-intro) |
| hue | 처음부터 끝까지 일정하다[](source:pg-ramp) |
| 선명도 | 가운데에서 가장 높고 양 끝에서 떨어진다. 가장 밝은 단계와 가장 어두운 단계는 거의 neutral이다[](source:pg-ramp) |
| 밝은 쪽 간격 | `50`~`200`은 OKLCH `L`로 약 `0.04`~`0.05` 간격. 중간 단계는 약 `0.07`~`0.10`[](source:pg-ramp)[](source:bc-pat) |
| 인접 단계 | `L` 차이가 `0.03` 미만이면 단계가 결정보다 많은 것이다. 하나를 뺀다[](source:pg-ramp) |
| 양 끝 | 순수 검정·흰색에 닿지 않는다[](source:pg-ramp) |
| 여러 hue | 같은 단계는 같은 밝기. 선명도는 절대값이 아니라 각 hue가 닿는 최대치의 같은 비율로 맞춘다. 노랑·시안이 보통 낮게 정점에 닿는다[](source:pg-hues) |
| 중복 색 | OKLab ΔE가 `0.02` 이내인 색은 한 색이 흘러 변한 것이다. 많이 쓴 쪽을 남기고 평균 내지 않는다[](source:ps-audit) |
| 보간 | 라이브러리의 선형 샘플링은 출발점이다. 성질에 맞는지 보고 `50`~`200`을 손으로 조인다. ramp 보간은 sRGB가 아니라 perceptual 공간이다. sRGB는 중간 단계가 탁해진다[](source:pg-lib) |

dark mode는 밝은 팔레트를 뒤집은 것이 아니다. 뒤집기는 출발점일 뿐이다. 먼저 semantic 역할을 바꾸고 값을 다듬는다.[](source:pg-dark)

| 손봐야 하는 것 | 이유 |
| --- | --- |
| 선명도를 낮춘다 | 흰 바탕에서 자신 있어 보이는 색이 거의 검은 바탕에서는 네온으로 읽힌다. accent를 한두 단계 덜 선명하게 한다 |
| 어두운 쪽 간격을 넓힌다 | 옅은 배경으로는 구분되던 단계가 어두운 표면에서는 서로 붙는다 |
| 대비를 다시 잰다 | 대비는 뒤집어도 유지되지 않는다. APCA는 거울상 쌍을 다르게 점수 매긴다. 모든 쌍을 두 appearance에서 다시 잰다 |

전환 방식은 하나만 쓴다. 일부 토큰은 media query로, 일부는 class로 바꾸면 사용자가 시스템 설정을 덮어쓰는 순간 절반만 테마가 입혀진다.[](source:pg-switch)[](source:bc-pat)

| 방식 | 언제 | 주의 |
| --- | --- | --- |
| `prefers-color-scheme`만 | theme 토글이 없을 때 | 저장하고 hydrate할 것이 없다 |
| `.dark` class | 사용자가 시스템 설정을 덮어쓸 수 있을 때 | media query는 초기값만 정한다 |
| `light-dark()` | 두 값을 한 선언에 담고 싶을 때 | `color-scheme: light dark`가 필요하다. class로 토글하면 `color-scheme`도 함께 설정해야 한다 |

표기법과 gamut, gradient, 문화권에는 다음이 있다.

| 영역 | 규칙 | 구분 |
| --- | --- | --- |
| 표기법 | 프로젝트가 쓰는 것을 따른다. hex만 쓰는 프로젝트는 틀린 것이 아니다. 새 시스템이면 `oklch()`가 가장 좋은 기본이다(Baseline 2023, 아주 오래된 브라우저 매트릭스는 fallback이 필요). 일관된 hex 체계가 hex 사이에 흩어진 `oklch()`보다 낫다[](source:bc-match)[](source:cf-note) | 규칙·권고 |
| gamut | sRGB로 ramp를 만들고 P3는 향상으로 더한다. sRGB 값을 먼저 쓰고, 더 선명한 값은 `@media (color-gamut: p3)` 안에서 덮어쓴다. 선명도를 줄여 hue와 밝기를 지켜서 고친다. 선명한 `oklch()` chroma에 sRGB 값이 먼저 없으면 지적이다[](source:cf-gamut)[](source:bc-pat) | 규칙 |
| gamut 수치 | OKLCH `L` `0.65`에서 green은 chroma가 약 `0.07`, blue는 약 `0.015` 늘어난다. 시안은 빨강·보라보다 훨씬 낮게 한계에 닿는다[](source:cf-gamut) | 사실 |
| `@supports` | 브라우저 매트릭스가 `oklch()` 이전을 포함할 때만 쓴다. 현대 baseline에서는 군더더기다[](source:cf-gamut) | 권고 |
| `color-mix()`·상대 색 구문 | 상태 파생에 쓸 수 있지만 생성된 값을 token layer에 넣지 않는다. 세 번 연쇄한 파생은 읽을 수 없다. 렌더 때 풀리므로 계산하거나 렌더 결과를 잰 뒤에 대비를 보고한다[](source:cf-css) | 권고 |
| gradient 보간 | 보간 공간은 정확성 설정이 아니라 보이는 느낌이다. 기본은 `in oklab`, 두 hue gradient 가운데가 회색이 되면 `in oklch`다. 다른 방향으로 돌릴 때는 `shorter hue`·`longer hue`를 쓴다. 회색 데드존은 rectangular 공간의 문제라 polar 공간으로 바꾸거나 세 번째 stop을 넣는다[](source:bc-grad)[](source:cu-grad) | 선택 |
| gradient 주의 | 넓은 영역에 대비가 작은 gradient는 8-bit 화면에서 띠가 보인다. 대비를 넓히거나 면적을 줄이거나 noise를 얹는다. gradient 위 글자는 평균이 아니라 최악 영역을 재거나 scrim을 둔다[](source:cu-grad) | 권고 |
| 문화권 | 금융·status·알림처럼 색에 뜻이 있으면 출시하는 locale마다 뜻이 맞는지 확인한다. 중국어권 금융 UI는 상승이 빨강, 하락이 초록이다. 그런 시장이면 손익을 locale별 토큰으로 만든다[](source:cu-cult) | 규칙 |
| increased contrast | dark 값이 있으면 모든 커스텀 색에 dark 변형이 필요하다. `prefers-contrast: more`는 appearance마다 따로 값을 준다. 증가분은 기본값보다 OKLCH `L` 간격을 최소 `0.15` 넓히고 다시 잰다. 본문은 Lc 90을 겨냥한다[](source:cu-dark)[](source:bc-pat) | 규칙 |

대비 임계값은 `better-accessibility`가 어느 것이 적용되는지 정한 뒤 이 스킬이 잰 쌍을 그 기준에 대 본다. 기준이 어디에도 없으면 WCAG 2 결과를 보고하고 APCA 값을 더한다.[](source:ct-intro)

@facts
| WCAG 2 텍스트 | AA 4.5:1, AAA 7:1[](source:ct-wcag) |
| WCAG 2 큰 텍스트 | AA 3:1, AAA 4.5:1. 큰 텍스트는 `24px` 이상 또는 굵은 `18.67px` 이상[](source:ct-wcag) |
| WCAG 2 UI 컴포넌트·그래픽 | AA 3:1, AAA 해당 없음. 비활성·inactive 컨트롤과 로고는 면제[](source:ct-wcag) |
| APCA 본문 | Lc 75 이상, 권장 Lc 90[](source:ct-apca) |
| APCA 비본문 글자(label, headline) | Lc 60[](source:ct-apca) |
| APCA 큰 글자 | Lc 45. 큰 글자는 `36px` regular 또는 `24px` bold 이상[](source:ct-apca) |
| APCA 아이콘·UI | 가는 선·윤곽 아이콘 Lc 45, 채운 아이콘과 UI 컴포넌트 Lc 30, 구분선처럼 보이기만 하면 되는 비텍스트 Lc 15[](source:ct-apca) |
| 비활성·placeholder 글자 | 요구 없음. 읽히도록 Lc 30을 겨냥[](source:ct-apca) |
| Lc 부호 | 양수는 밝은 바탕에 어두운 글자, 음수는 어두운 바탕에 밝은 글자. 절댓값을 임계값과 비교[](source:ct-apca) |
| 중간 밝기 배경의 한계 | OKLCH `L` 약 `0.75` 배경에서는 순수 검정 글자도 약 Lc 60까지만 닿는다. 그럴 때는 배경이 바뀌어야 한다[](source:ct-fix) |
| WCAG 2 극성 교차점 | neutral에서 OKLCH 밝기 약 56%. `oklch(65% 0 0)`에서 검정 약 6.49:1, 흰색 약 3.23:1이라 일반 글자는 검정만 AA를 통과한다. 색이 있는 배경은 쌍을 재고 교차점을 적용하지 않는다[](source:ct-pol) |
| 예시 쌍 | 실패 `#7d93b0` on `#eef2f7`(Lc 약 50), 수정 `#2b3a4f`(Lc 약 88). 원문 예시 값이고 의무가 아니다[](source:ct-fix) |

## 대비는 어떻게 재고, 언제 고치고, 어떻게 보고하나 {#flow}

대비는 전경과 그것이 **실제로 그려지는** 배경 사이에서 잰다. 보통 색을 칠하는 가장 가까운 조상이 그 배경이다. 카드 위 요소를 페이지 배경과 재면 답이 틀린다.[](source:ct-intro)[](source:bc-measure)

@workflow id=contrast-flow title="대비 측정과 수정"
| m1 | 렌더된 배경 찾기 | backend |
| m2 | 쌍 측정 | backend |
| m3 | 기준을 넘나? | backend |
| m4 | 통과로 기록 | external |
| m5 | 쌍·값·기준 보고 | backend |
| m6 | 고쳐 달라고 했나? | backend |
| m7 | 색을 그대로 둠 | external |
| m8 | 명도부터 조정 | backend |
| m1 > m2 | | |
| m2 > m3 | | |
| m3 > m4 | 예 | |
| m3 > m5 | 아니오 | emphasis |
| m5 > m6 | | |
| m6 > m7 | 아니오 | emphasis |
| m6 > m8 | 예 | emphasis |
| m8 > m2 | 다시 측정 | dashed |

@steps id=contrast-steps
| st-m1 | 렌더된 배경 찾기 | 글자가 실제로 놓인 배경을 먼저 정한다. 투명 표면 위는 가장 밝은 내용과 가장 어두운 내용 위에서 시험하거나, 표면을 불투명하게 한다. 이미지 위는 최악 영역을 재거나 scrim을 둔다.[](source:ct-check) | contrast-flow | m1 |
| st-m2 | 쌍 측정 | 선언한 값이 아니라 렌더 결과를 잰다. `color-mix()`·상대 색·불투명도 변경자는 렌더 때 풀린다. 쌍마다 모든 appearance에서 잰다. | contrast-flow | m2 |
| st-m3 | 기준을 넘나? | 기준은 `better-accessibility`가 정한다. 어디에도 없으면 WCAG 2 결과에 APCA 값을 더한다. | contrast-flow | m3 |
| st-m5 | 쌍·값·기준 보고 | 실패하면 쌍, 측정값, 못 미친 기준을 보고하고 색은 그대로 둔다. 색은 디자인 결정이기 때문이다. | contrast-flow | m5 |
| st-m6 | 고쳐 달라고 했나? | 사용자가 요청하지 않았으면 여기서 끝난다. | contrast-flow | m6 |
| st-m8 | 명도부터 조정 | 대비가 반응하는 채널은 명도다. hue와 채도를 지키고 전경을 배경에서 지각 명도로 멀리 옮긴 뒤 다시 잰다. 색이 gamut 밖이 되면 채도를 줄인다. | contrast-flow | m8 |

원문 규칙은 "고쳤다고 가정하지 말고 항상 다시 잰다"이다. 판정: 이 스킬의 사람 개입 지점은 이 "고쳐 달라는 요청" 하나다. 출처: 측정 문장과 수정 문장.[](source:bc-measure)[](source:ct-fix)

기존 팔레트를 정리할 때는 먼저 목록을 만든다. 대부분의 코드베이스는 디자인의 결정보다 몇 배 많은 색을 가진다.[](source:ps-audit)

@steps id=audit-steps
| st-a1 | 모든 literal 모으기 | hex, `rgb(`, `hsl(`, `oklch(`, 프로젝트의 유틸리티 prefix를 grep한다. SVG `fill`·`stroke`, 차트 설정, 이메일 템플릿도 포함한다. |
| st-a2 | 밝기로 정렬 | 각 hue 계열 안에서 지각 밝기로 정렬한다. 중복이 비슷한 이웃으로 드러난다. |
| st-a3 | 비슷한 색 합치기 | OKLab ΔE `0.02` 안의 색은 한 색이다. 가장 많이 쓴 것을 남기고 나머지를 없앤다. 평균 내지 않는다. |
| st-a4 | 살아남은 색에 역할 주기 | 어느 역할에도 안 맞는 색은 토큰이 빠졌거나 실수다. 어느 쪽인지 지적에 적는다. |
| st-a5 | 남은 수 세기 | 필요한 ramp 수보다 많으면 팔레트가 구조를 넘어선 것이다. 제품에 색이 더 필요하다는 뜻이 아니다. |

목록은 바꾸기 전에 보고한다. 팔레트를 합치면 아무도 손대라고 하지 않은 화면의 렌더 결과가 바뀌므로, 사용자가 받아들이기 전까지는 제안으로 남는다. 판정: 이것이 이 스킬의 두 번째 사람 승인 지점이다. 출처: 감사 절차의 마지막 문장.[](source:ps-audit)

표기를 바꾸는 변환은 조건이 정해져 있다.[](source:cf-conv)

| 상황 | 변환하나 |
| --- | --- |
| 사용자가 요청했다 | {good:한다} |
| 합의된 migration이 범위에 있다 | {good:한다} |
| 프로젝트가 한 표기로 통일 중이고 이 값만 남았다 | {good:한다} |
| 다른 것을 의도적으로 쓰는 프로젝트의 고립된 값 | {bad:하지 않는다} |
| 이 스킬이 로드됐다는 이유만 있다 | {bad:하지 않는다} |

변환할 때는 값만 바꾼다. CSS 키워드(`currentColor`, `inherit`, `transparent`, `initial`, `unset`)는 두고, gradient 함수는 두되 안의 color stop만 바꾸며 보간 방법은 건드리지 않는다. 외부 설정의 색은 두고 주석과 서식은 그대로 둔다. 대량 변환은 정리가 아니라 migration이라서 작업 자체여야 하고 부작용이면 안 된다.[](source:cf-conv)

끝내기 전에 코드에서 훑는 패턴은 17개다.[](source:bc-pat)

| 이런 패턴이 보이면 | 이렇게 고친다 |
| --- | --- |
| token이 있는데 component 파일에 hex, `rgb(`, `oklch(` literal | 프로젝트 표기로 역할 토큰을 재사용하거나 추가 |
| 거의 hex인 코드베이스에 `oklch(` 값 하나 | migration이 범위가 아니면 정착된 표기로 쓴다 |
| component 파일의 `var(--blue-600)`, `bg-blue-600` | semantic 토큰이 primitive를 가리키게 하고 그것을 쓴다 |
| `--color-blue-button`, `--color-sidebar-gray`처럼 hue나 component가 들어간 semantic 이름 | 역할로 바꾼다: `--color-accent-solid`, `--color-bg-surface` |
| `--color-primary`와 `--color-text-primary`가 함께 정의됨 | 브랜드 토큰을 `accent`로 바꾼다 |
| `color:` 안의 `border`·`separator` 토큰, `background:` 안의 `text` 토큰 | 빠진 역할의 토큰을 추가 |
| 밝기만 다른 `hsl(` ramp 값 | 지각 hue를 일정하게 하여 프로젝트 표기로 다시 만든다 |
| `50`~`200`이 중간 단계만큼 OKLCH `L`로 벌어져 있음 | 밝은 쪽을 단계당 약 `0.04`~`0.05`로 조인다 |
| 모든 hue의 ramp에 같은 chroma·채도 수를 복사 | 각 hue의 최대치의 같은 비율을 쓴다 |
| accent hue에서 `15°` 안인 status hue | 최소 `15°` 옮기거나 파괴적 action에 구분되는 처리를 준다 |
| light ramp를 단계 순서만 뒤집은 dark 토큰 | accent chroma를 낮추고 어두운 쪽을 넓히고 모든 쌍을 다시 잰다 |
| `prefers-color-scheme`와 `.dark` class 둘 다에 설정된 색 토큰 | 전환 방식을 하나 골라 전체에서 쓴다 |
| hue만 바꾸고 명도는 그대로인 대비 수정 | 대비가 반응하는 명도를 바꾼다 |
| 두 appearance에 한 블록으로 덮어쓴 `prefers-contrast: more` 색 | appearance마다 따로 증가값을 준다 |
| `/50`, `rgba(`, `color-mix(`와 `transparent` 같은 알파 색 위의 글자 | 렌더 결과를 재거나 solid 토큰을 쓴다 |
| Tailwind `500` fill 위의 `text-white` | 잰다. 대부분의 `500` hue에서 흰색은 4.5:1에 못 미치므로 fill을 `600`으로 옮긴다 |
| 앞에 sRGB 값 없이 선언한 sRGB 밖 `oklch()` chroma | sRGB 값을 먼저 쓰고, 더 선명한 값은 `@media (color-gamut: p3)` 안에 둔다 |

보고의 기준은 아래와 같다.

| 항목 | 원문 내용 |
| --- | --- |
| `HIGH` | 내용을 읽을 수 없게 하거나 오해를 부르는 semantic 색을 배정한다[](source:bc-sev) |
| `MEDIUM` | 눈에 띄는 theme·token·gamut 실패[](source:bc-sev) |
| `LOW` | 고립된 다듬기[](source:bc-sev) |
| `HIGH`로 바로 올리는 것 | 본문·컨트롤 글자의 렌더된 쌍이 필요한 비율에 못 미침, 색만으로 전하는 상태·뜻, 뜻을 거스르는 semantic 색. `better-interface` escalation trigger와 맞다[](source:bc-sev)[](source:bi-trig) |
| 브라우저 없이 확인 | token 값, 선언된 모든 색의 gamut, 두 theme 블록의 존재, 선언한 token 쌍에서 계산한 대비[](source:bc-ver) |
| 브라우저로 확인 | 글자 뒤에 실제로 렌더된 배경(불투명도와 그 밑의 이미지 포함)을 light와 dark에서 측정[](source:bc-ver) |
| 못 한 검사 | 전부 `Not verified`로 적는다[](source:bc-ver) |
| 보고 형식 | 어긴 원칙별로 묶고 심각도 순. 뿌리 원인마다 한 행에 모든 위치를 적는다. 열은 Severity, Location(`path/to/file:line`), Before, After, Why이고 `Why`에 원칙과 사용자 영향을 쓴다[](source:bc-fmt) |
| 끝맺음 | `HIGH`가 남으면 `Block`, 아니면 `Approve`. 나머지는 표에 할 일로 남긴다. 보지 않은 범위는 `Approve`하지 않는다. 지적이 없으면 "No actionable color findings"와 검증 결과를 쓴다[](source:bc-fmt) |

판정: `better-interface`가 이 스킬을 부르면 이 스킬의 심각도 사다리와 보고 형식은 쓰이지 않는다. `better-interface`가 "혼자 쓸 때를 위한 것이니 이 파일의 것으로 대체한다"고 적었기 때문이다. 출처: 해당 문장.[](source:bi-order)

## 흐름 속 위치 {#position}

`better-colors`는 묶음 `interface-audit`에 속하는 도메인 스킬이다. `better-interface`가 여섯 도메인을 정해진 순서로 부를 때 5번째다. `interface-review`는 변경의 제거된 줄에서 색 신호를 찾으면 이 스킬로 보내 판단하게 한다.[](source:bi-order)[](source:ir-sig)

@workflow id=colors-position title="better-colors 앞뒤"
| pos-ir | interface-review | backend |
| pos-bi | better-interface | backend |
| pos-bc | better-colors | backend |
| pos-rep | 통합 보고서 | external |
| pos-ir > pos-bc | 제거된 줄 신호 | dashed |
| pos-bi > pos-bc | 5번째 위임 | emphasis |
| pos-bc > pos-rep | 도메인 증거 | |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `better-interface`(앞) | 리뷰 범위 | 도메인 리뷰 증거 | 의무형. 여섯 도메인을 모두 불러 마친 뒤 통합한다. 순서는 5번째이고, 원칙·references·검증만 가져가고 심각도·형식은 `better-interface` 것으로 대체한다. 이 스킬이 없으면 이 도메인을 `Not reviewed`로 표시하고 이어 간다[](source:bi-order) | r64 |
| `interface-review`(앞) | 일치한 제거 줄 | 그 줄이 색 회귀인지 판단 | 조건부. `-` 쪽 줄에서 `prefers-contrast`가 빠졌거나, 색 토큰이 literal로 바뀌었거나 더 옅은 토큰으로 바뀐 신호일 때. 신호는 단서일 뿐이고 대체물이 변경 안에 없을 때만 회귀다. `interface-review`는 `disable-model-invocation: true`라서 사용자가 직접 부른다[](source:ir-fm)[](source:ir-sig)[](source:rs-contrast)[](source:rs-token) | r70 |
| `better-interface`(뒤) | - | 도메인 리뷰 증거 | 받는 쪽이 통합 보고서와 판정 결과를 소유한다. 이 스킬의 `HIGH` 3가지는 `better-interface`의 escalation trigger 목록의 일부다[](source:bc-sev)[](source:bi-trig) | r64, r101 |
| `better-accessibility` | - | - | 참고. 어떤 쌍이 통과해야 하는지와 색만으로 의미를 전하지 않는 요구는 그쪽 몫이다. 그쪽은 대비 측정과 색 수정을 이 스킬 몫이라고 적고, 실패하면 쌍과 놓친 기준만 보고하고 요청이 없으면 색을 두라고 적는다. 호출하라는 지시는 아니다[](source:bc-bound)[](source:ba-bound)[](source:ba-color) | r84, r79 |
| `better-ui` | - | - | 참고. 표면·shadow·아이콘 색은 그쪽 몫이다. 그쪽은 color token과 대비 측정을 이 스킬 몫이라고 적는다[](source:bc-bound)[](source:ui-bound) | r85, r78 |
| `better-typography` | - | - | 참고. 그쪽이 대비 측정은 이 스킬로, 통과 여부는 `better-accessibility`로 가리킨다[](source:ty-bound) | r94 |
| `better-layout` | - | - | 참고. 주 행동을 색으로 표시하는 방식은 이 스킬 몫이라고 그쪽이 적는다[](source:lay-bound) | r90 |
| `better-writing` | - | - | 참고. 파괴 버튼의 구분되는 색은 이 스킬 몫이라고 그쪽이 적는다[](source:wr-bound) | r99 |
| `variant`, `break`, `explain-interface`, `build-design`, `teardown`(묶음 밖) | - | - | 참고. `variant`는 Emphasis 축의 담당으로 적고, `break`는 dark mode 깨짐을 이 스킬 어휘로 부르고, `explain-interface`는 팔레트 어휘의 담당으로 적고 찾은 값을 이 스킬의 기준과 견주되 판정하지 않으며, `build-design`은 디자인이 팔레트 규칙을 깨면 디자인대로 만들고 충돌을 이 스킬에 보고하고, `teardown`은 팔레트와 렌더된 대비를 이 스킬에 맡긴다[](source:va-axes)[](source:bk-bound)[](source:bk-scen)[](source:ex-sk)[](source:ex-img)[](source:ex-sys)[](source:bd-bound)[](source:td-bound)[](source:td-prev) | r109, r121, r132, r136, r145 |

그림에는 r64, r70만 그렸다. r84, r85, r79, r78, r94, r90, r99, r109, r121, r132, r136, r145는 "그 일은 저 스킬 몫"이라는 참고라서 순서가 없다. 판정: r70의 점선은 조건부 위임이라서 일부러 점선으로 그렸다.

전체 흐름은 `design/_group-interface-audit/interface-audit.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 8개, 합계 38,486B다. `SKILL.md` 7,698B, `palette-structure.md` 4,923B, `palette-generation.md` 6,096B, `color-formats.md` 4,565B, `contrast.md` 3,949B, `color-usage.md` 5,292B, `token-naming.md` 5,853B, `agents/openai.yaml` 110B를 끝까지 읽었다. 구조·표본만 본 파일은 0개다.
- 관계 확인용으로 다른 스킬 17개 파일의 해당 줄만 읽었다. 이 파일들은 위 개수에 넣지 않았다.
- 묶음 쪽: `better-interface/SKILL.md` 1~12·42~57·77~95줄, `interface-review/SKILL.md` 1~5·56~61줄, `removed-signals.md` 12·16줄이다.
- 도메인 스킬 쪽: `better-ui` 16줄, `better-typography` 10줄, `better-layout` 36줄, `better-writing` 98줄, `better-accessibility/SKILL.md` 12·70~80줄이다.
- 묶음 밖 스킬 쪽: `variant/SKILL.md` 17~24줄, `break/SKILL.md` 11줄과 `scenarios.md` 78줄, `explain-interface`의 `SKILL.md` 11줄·`from-an-image.md` 21~25줄·`read-the-system.md` 87줄, `build-design` 12줄, `teardown/SKILL.md` 14줄과 `preview-page.md` 71줄이다.
- 제외한 파일: 없음. 번역본과 바이너리 파일이 없다. `scripts/`와 `assets/`도 없다.
- 원문 대조 범위: 활성화 제한 1개(호출 제한 필드 없음), 사람 개입 지점 2개(고쳐 달라는 요청, 팔레트 합치기 수락), `HIGH` 3가지, 점검 패턴 17행을 모두 대조했다.
- 수치 대조: WCAG 3행, APCA 표 6행, 간격 `0.04`~`0.05`·`0.07`~`0.10`·`0.03`, `0.02` ΔE, `15°`, `0.15`, `0.005`~`0.02`, 56%, 6.49:1·3.23:1, 3.68:1, gamut `0.07`·`0.015`를 원문과 대조했다.
- 관계 대조: 행 r64, r70, r78, r79, r84, r85, r90, r94, r99, r101, r109, r121, r132, r136, r145를 원장과 원문 줄로 대조했다.
- 옮기지 않은 것: 모든 파일의 CSS·JS 코드 예시, `palette-generation.md`의 Tailwind blue ramp 값 11개와 `culori` 예시 코드, `color-formats.md`의 변환 전후 코드 예시, `token-naming.md`의 Tailwind 이름 겹침 예시(`text-text-secondary` 외). 모든 규칙 문장은 표에 옮겼다.
- 분석 중 바뀐 파일: 없음. `design/` 작업 트리는 commit `0465878` 그대로다.
- 사람 검토: 미실시.

@callout level=open-question title="확인하지 못한 것"
- 이 스킬이 실제로 에이전트의 동작을 바꾸는지는 실행해 보지 않아 확인하지 않았다. 페이지의 모든 동작은 지시상 동작이다.
- 대비를 잴 도구나 색 라이브러리를 에이전트가 무엇으로 고르는지는 `원문에 명시 없음`이다. `culori`, `colorjs.io`, `chroma.js`는 예로만 든다.[](source:pg-lib)
- `better-accessibility`가 없을 때 어느 기준으로 쌍을 보고하는지는 contrast.md 5줄의 "WCAG 2 결과에 APCA 값을 더한다"가 가장 가깝지만, 이 문장이 그 경우를 뜻하는지는 `원문에 명시 없음`이다.[](source:ct-intro)
- 사용자가 이 스킬을 직접 불렀을 때의 첫 응답은 `원문에 명시 없음`이다.
