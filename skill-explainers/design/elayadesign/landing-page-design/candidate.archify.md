# landing-page-design 스킬은 에이전트를 어떻게 바꾸나 {#landing-page-design-skill}

`landing-page-design`을 쓰면 에이전트는 랜딩 페이지를 그리기 전에 무엇을 말할지부터 정한다. 질문으로 목표 행동과 대상을 모으고, 섹션 구성과 레이아웃 유형을 고른 뒤, 고정된 글꼴·크기·간격·색·모션 값만으로 화면을 만든다. 원문은 이를 "one offer → one audience → one primary action"으로 요약하고, 전략(Part A)을 끝낸 뒤에 시각 규칙(Part B)을 다루라고 한다.[](source:lp-intro)

- 켜지는 때: 랜딩 페이지뿐 아니라 마케팅 사이트, 웹 UI, 섹션, 컴포넌트, 프로토타입을 만들거나 고치거나 리뷰할 때다. 호출 제한 필드는 없다.[](source:lp-fm)
- 강제하는 것: 승인된 글꼴 4종, Tailwind 기본 type scale, 13개 spacing 값, 배경 그라디언트 금지, 모든 텍스트에 이름 붙은 텍스트 스타일 적용이다.[](source:lp-font)[](source:lp-space)[](source:lp-bg)[](source:lp-styles)
- 사람의 몫: 에이전트가 빠진 정보만 한 번에 묻는다. 사용자가 답하지 못하면 가정을 한 줄로 밝히고 계속 만든다.[](source:lp-intake)
- 쓰면 안 되는 때: 이미 있는 사이트를 개선하는 일은 원문이 별도 스킬 `redesign-existing-projects`로 보낸다. 사용자가 명시한 지시와 충돌하면 사용자 지시가 이긴다.[](source:lp-scope)

@answer scope="design/elayadesign/landing-page-design · SKILL.md 1개 22,115B · 커밋 4e3fc89 · 지시상 동작 · 실행하지 않음"
@meta locale=ko
@source lp-fm title="design/elayadesign/landing-page-design/SKILL.md · 22115B · frontmatter" path=design/elayadesign/landing-page-design/SKILL.md lines=1:4
@source lp-intro title="SKILL.md · 랜딩 페이지 정의와 두 부분 구성" path=design/elayadesign/landing-page-design/SKILL.md lines=6:12
@source lp-scope title="SKILL.md · Scope 절과 companion skill" path=design/elayadesign/landing-page-design/SKILL.md lines=14:18
@source lp-intake title="SKILL.md · A1 Intake" path=design/elayadesign/landing-page-design/SKILL.md lines=24:50
@source lp-struct title="SKILL.md · A2 페이지 구조" path=design/elayadesign/landing-page-design/SKILL.md lines=52:72
@source lp-layout title="SKILL.md · A3 레이아웃 유형" path=design/elayadesign/landing-page-design/SKILL.md lines=74:83
@source lp-conv title="SKILL.md · A4 전환 규칙" path=design/elayadesign/landing-page-design/SKILL.md lines=85:99
@source lp-copy title="SKILL.md · A5 카피" path=design/elayadesign/landing-page-design/SKILL.md lines=101:114
@source lp-build title="SKILL.md · A6 만드는 순서" path=design/elayadesign/landing-page-design/SKILL.md lines=116:127
@source lp-seo title="SKILL.md · A7 SEO와 AEO" path=design/elayadesign/landing-page-design/SKILL.md lines=129:133
@source lp-pit title="SKILL.md · A8 흔한 실수" path=design/elayadesign/landing-page-design/SKILL.md lines=135:142
@source lp-font title="SKILL.md · B1 글꼴" path=design/elayadesign/landing-page-design/SKILL.md lines=146:162
@source lp-copyrule title="SKILL.md · B1 카피 규칙" path=design/elayadesign/landing-page-design/SKILL.md lines=164:168
@source lp-scale title="SKILL.md · B1 type scale" path=design/elayadesign/landing-page-design/SKILL.md lines=170:192
@source lp-styles title="SKILL.md · B1 텍스트 스타일" path=design/elayadesign/landing-page-design/SKILL.md lines=194:237
@source lp-space title="SKILL.md · B2 spacing" path=design/elayadesign/landing-page-design/SKILL.md lines=239:259
@source lp-radius title="SKILL.md · B3 corner radius" path=design/elayadesign/landing-page-design/SKILL.md lines=261:273
@source lp-bg title="SKILL.md · B4 테두리와 배경" path=design/elayadesign/landing-page-design/SKILL.md lines=275:284
@source lp-hero title="SKILL.md · B5 hero" path=design/elayadesign/landing-page-design/SKILL.md lines=286:299
@source lp-icon title="SKILL.md · B6 아이콘" path=design/elayadesign/landing-page-design/SKILL.md lines=301:305
@source lp-motion title="SKILL.md · B7 모션 기본" path=design/elayadesign/landing-page-design/SKILL.md lines=307:315
@source lp-nav title="SKILL.md · B7 내비게이션" path=design/elayadesign/landing-page-design/SKILL.md lines=317:325
@source lp-reveal title="SKILL.md · B7 scroll reveal" path=design/elayadesign/landing-page-design/SKILL.md lines=327:331
@source lp-real title="SKILL.md · B8 콘텐츠 현실성" path=design/elayadesign/landing-page-design/SKILL.md lines=335:346
@source lp-states title="SKILL.md · B9 상태" path=design/elayadesign/landing-page-design/SKILL.md lines=348:359
@source lp-ship title="SKILL.md · B10 출시 요건" path=design/elayadesign/landing-page-design/SKILL.md lines=361:375
@source lp-tag title="SKILL.md · B11 tagline reveal 섹션" path=design/elayadesign/landing-page-design/SKILL.md lines=377:394
@source lp-out title="SKILL.md · Output format" path=design/elayadesign/landing-page-design/SKILL.md lines=398:410
@source lp-check title="SKILL.md · Quick checklist" path=design/elayadesign/landing-page-design/SKILL.md lines=414:443
@source lp-credit title="SKILL.md · Credits(taste-skill 출처 표기)" path=design/elayadesign/landing-page-design/SKILL.md lines=447:451
@source lp-lock title="design/elayadesign/skills-lock.json · 원격 출처" path=design/elayadesign/skills-lock.json lines=4:9
@source tf-desc title="design/taste/design-taste-frontend/SKILL.md · r40·r44 확인용 description" path=design/taste/design-taste-frontend/SKILL.md lines=3:11
@source tf-lock title="design/taste/skills-lock.json · taste-skill 원격 저장소" path=design/taste/skills-lock.json lines=4:7
@source im-desc title="design/impeccable/impeccable/SKILL.md · r41 확인용 description" path=design/impeccable/impeccable/SKILL.md lines=3:3
@source wde-desc title="design/garden-skills/web-design-engineer/SKILL.md · r45 확인용 description" path=design/garden-skills/web-design-engineer/SKILL.md lines=3:3

## 언제 켜지고, 사람은 어디서 개입하나 {#trigger}

@code source=lp-fm language=yaml

호출 제한 필드가 없어서 모델이 `description`을 참고해 스스로 켤 수 있다.[](source:lp-fm)

- `description`은 랜딩 페이지에 한정하지 않는다. 웹 UI·컴포넌트·프로토타입 작업 전반에서 "디자인이라는 말이 없어도" 쓰라고 한다.[](source:lp-fm)
- 섹션, 헤드라인, CTA(행동 유도 버튼), 글꼴, 간격, radius, 배경색, 아이콘, 전환 효과를 고르기 전에 늘 참고하라고 적는다.[](source:lp-fm)

판정: 켜지는 범위가 넓어서 대시보드 작업에도 Part B의 고정 값이 적용된다. 근거는 Scope 절이 대시보드를 대상에 넣은 문장이다.[](source:lp-scope)

규칙이 서로 부딪칠 때의 우선순위는 원문이 정해 두었다.[](source:lp-scope)

| 충돌 | 이기는 쪽 |
| --- | --- |
| 이 파일의 규칙과 프레임워크 기본값 | 이 파일 {good:스킬 규칙} |
| 이 파일의 규칙과 사용자가 명시한 지시 | 사용자 {good:사용자 지시} |

사람이 개입하는 곳은 두 군데다.

| 지점 | 에이전트가 하는 일 | 사람의 몫 |
| --- | --- | --- |
| A1 Intake | 목적, 대상, 증거 자료, 제약 중 빠진 것만 한 묶음으로 묻는다. 한 번에 하나씩 묻지 않는다[](source:lp-intake) | {caution:답하거나 넘긴다} |
| 답을 못 받을 때 | 합리적인 가정을 한 줄로 밝히고 계속 만든다. 원문은 "Do not stall the build"라고 한다[](source:lp-intake) | 가정을 확인한다 |
| 실제 제품의 사실 | 가격, 보증, 통계, 고객 수, 후기, 로고는 사용자나 실제 출처에서만 가져온다. 없으면 `{{price}}`, `{{testimonial}}` 같은 표시된 자리표시자를 쓴다[](source:lp-real) | {bad:사실을 제공한다} |

Output format 절의 7개 항목을 "코드를 쓰기 전에" 돌려주라는 지시가 있지만, 그 뒤에 사용자 승인을 기다리라는 문장은 없다.[](source:lp-out) 승인 대기 여부는 `원문에 명시 없음`이다.

**쓰지 말아야 할 때.** 이미 있는 사이트를 손볼 때는 `redesign-existing-projects`(`github.com/elayadesign/redesign-skill`)를 쓰라고 한다. 그 스킬은 일반적인 패턴을 진단하고, 구체적인 값은 이 파일을 따른다.[](source:lp-scope)

`redesign-existing-projects`는 이 저장소에 없어서 관계 원장에 행이 없다(`범위 밖`).

## Part A는 어떤 순서로 페이지를 정하나 {#strategy}

@workflow id=strategy-flow title="Part A 전략에서 구현까지"
| sf-intake | A1 Intake | external |
| sf-struct | A2 섹션 구성 | backend |
| sf-layout | A3 레이아웃 고르기 | backend |
| sf-out | 7개 항목 출력 | backend |
| sf-build | A6 섹션별 구현 | backend |
| sf-check | 체크리스트 확인 | backend |
| sf-intake > sf-struct | |
| sf-struct > sf-layout | |
| sf-layout > sf-out | |
| sf-out > sf-build | 코드 전에 | emphasis |
| sf-build > sf-check | |

@steps id=strategy-steps
| sf-intake | A1 Intake | 한 가지 주요 행동(체험, 데모, 구매, 대기 명단, 다운로드), 제공물, 전환의 정의를 모은다. 대상(ICP, 고객 프로필), 해결하려는 문제, 상위 3개 반대 이유, 유입 경로(광고·검색·소셜·이메일), 방문자가 이미 아는 것도 묻는다. 증거 자료와 브랜드 말투·디자인 방향·모바일 우선 여부도 포함한다.[](source:lp-intake) | strategy-flow | sf-intake |
| sf-struct | A2 섹션 구성 | 아래 12개 섹션 표를 따른다. B11의 tagline reveal 섹션을 중간 논증 구간에 반드시 넣는다. 보통 hero 바로 뒤나 benefits 뒤다.[](source:lp-struct) | strategy-flow | sf-struct |
| sf-layout | A3 레이아웃 고르기 | A~D 중 하나를 고르고 이유를 말한다.[](source:lp-layout) | strategy-flow | sf-layout |
| sf-out | 7개 항목 출력 | 처음부터 만들 때는 코드 전에 페이지 개요, hero 카피, benefits 3~5개, how it works 3단계, FAQ 6~12개, SEO/AEO 권고, 레이아웃 추천을 이 순서로 낸다.[](source:lp-out) | strategy-flow | sf-out |
| sf-build | A6 섹션별 구현 | Hero, Benefits, How it works, Proof, FAQ, Final CTA 순서로 하나씩 만든다. 매번 페이지 전체를 다시 만들지 않는다. 원문은 이렇게 해야 diff를 리뷰할 수 있다고 한다.[](source:lp-build) | strategy-flow | sf-build |
| sf-check | 체크리스트 확인 | 전략 6개, 시각 13개, 콘텐츠·출시 4개 항목을 확인한다.[](source:lp-check) | strategy-flow | sf-check |

페이지 구조는 세 구간 12개 섹션이다.[](source:lp-struct)

| 구간 | 섹션 |
| --- | --- |
| 첫 화면(필수) | 1 헤드라인(결과와 대상), 2 서브헤드라인(방법과 구체성), 3 주요 CTA(동사와 얻는 것), 4 증거 신호 하나(로고 줄, 수치, 짧은 후기), 5 hero 시각물 |
| 중간(논증) | 6 문제에서 해결로 한 섹션, 7 benefits 3~5개, 8 how it works 3단계, 9 사회적 증거 |
| 하단(반대 이유 처리) | 10 FAQ 6~12개, 11 위험 제거(체험, 언제든 해지, 보증), 12 마지막 CTA(맨 위와 같게) |

| 레이아웃 | 쓰는 때 |
| --- | --- |
| A. 고전적 hero와 섹션 | hero 스크린샷만 봐도 제품을 알 수 있을 때. 가장 흔하다 |
| B. 긴 이야기형 | 교육하고 의심을 넘겨야 할 때 |
| C. 최소 전환 페이지 | 의도가 강한 유입(아는 사용자에게 보낸 이메일)이나 다운로드·대기 명단 같은 짧은 제안 |
| D. 비교 페이지 | 검색 의도에 대안이 들어 있을 때("X vs Y", "best for"). 보통 SEO 페이지와 짝을 이룬다 |

전환과 카피 규칙은 이렇다.[](source:lp-conv)[](source:lp-copy)

- 광고에서 들어오면 hero가 광고 헤드라인을 그대로 받아 같은 약속과 시각 톤을 유지한다.
- 첫 화면에는 주요 CTA 하나만 둔다. 경쟁하는 CTA를 두지 않는다.
- 막연한 말 대신 수치를 쓴다. 원문 예: "Save time and streamline" 대신 "Cut your weekly reporting from 4 hours to 15 minutes".
- 무료 체험, 무료 플랜, 카드 불필요, 언제든 해지, 환불 보증 중 적어도 하나를 넣는다.
- 반대 이유는 독립 섹션으로 다룬다. 마찰이 큰 제안이면 FAQ를 앞으로 옮기고, 증거는 그 주장 바로 옆에 둔다.
- 헤드라인 공식 예: "{Outcome} without {pain}", "The {category} for {audience}", "Ship {result} in {time}".
- CTA는 동사와 얻는 것으로 쓴다. "Learn more", "Submit"은 금지이고 "Start free trial", "Book a demo"를 예로 든다.

SEO는 페이지 성격으로 가른다. 광고 전용 캠페인이나 기간이 짧은 제안은 `noindex`로 둔다. 오래 가는 제안은 색인하고 title, meta description, 내부 링크, 질문·답 형식 FAQ를 넣는다. 적절하면 FAQ schema도 넣는다.[](source:lp-seo)

A8은 피할 실수로 첫 화면의 CTA 과다, "streamline"·"optimize" 같은 막연한 가치 제안, 결과 없는 기능 목록, 바닥에 묻힌 증거, 읽기 어려운 모바일 배치, 다음 단계 부재를 든다.[](source:lp-pit)

## Part B는 어떤 값을 고정하나: 글꼴·크기·간격·색 {#visual-tokens}

Part B는 모든 시각 값이 이 규칙을 거쳐 정해져야 하고, 그때그때 지어내면 안 된다고 한다.[](source:lp-font)

| 영역 | 허용 | 금지 |
| --- | --- | --- |
| 글꼴 | Geist, Manrope, Geist Mono, Poppins. 사이트당 한 서체만 쓰고, Geist Mono는 코드·데이터·숫자 UI에만 함께 쓴다[](source:lp-font) | Inter, Roboto, Arial, Open Sans, Helvetica. 기울임꼴. 900(black) 굵기 {bad:금지} |
| 카피 | 제목은 `text-wrap: balance`, 본문은 `text-wrap: pretty`로 마지막 줄에 한 단어만 남지 않게 한다[](source:lp-copyrule) | 본문·제목·라벨 안의 `-` {bad:금지} |
| 아이콘 | Phosphor, Solar, Iconamoon[](source:lp-icon) | Material Icons, Material Symbols |
| 테두리 | 카드 테두리는 네 면 모두 두르거나 아예 두지 않는다[](source:lp-bg) | 한쪽 면만 테두리 {bad:금지} |
| 배경 | 단색. 다크 모드 배경은 `#000000`, `#181818`, `#1F1F1F`, `#272727`, `#313131`, `#131209`만 쓴다[](source:lp-bg) | 배경 그라디언트 {bad:금지} |
| hero 제목색 | 다크는 `#FFFFFF`에서 `#9B9B9B`, 라이트는 `#000000`에서 `#666666`으로 왼쪽에서 오른쪽 그라디언트. 그라디언트를 쓰는 유일한 곳이고 글자에만 쓴다[](source:lp-hero) | - |

**type scale.** 에이전트는 글자 크기를 Tailwind 기본 단계(`text-xs` 12px부터 `text-9xl` 128px까지 13단계)로만 쓴다. `text-[19px]`, `font-size: 22px`, `1.4rem` 같은 임의 값을 남기지 않는다. 기존 크기가 단계에 맞지 않으면 **바로 아래 단계**로 내리고, 그 단계의 line height를 함께 가져간다.

자간과 line height는 그 단계가 준 값 안에서만 조정한다.[](source:lp-scale)

**텍스트 스타일.** 모든 텍스트는 이름 붙은 스타일 하나를 쓰고, 크기와 굵기를 따로 붙이지 않는다. 코드에서는 스타일마다 kebab case 클래스나 token을 한 번 정의해 쓴다(`heading-1`, `body-4`, `button-md`).[](source:lp-styles) 26개 스타일은 다섯 묶음이다.

| 묶음 | 개수와 범위 | 쓰는 곳 |
| --- | --- | --- |
| Heading 1~6 | `text-6xl`(60/60)부터 `text-xl`(20/28), 모두 Semibold. Heading 1이 hero다 | 페이지·섹션 제목 |
| Title 1~5 | `text-xl`부터 `text-xs`, 모두 Medium | 카드 제목, 목록 제목, 블록 라벨, 내비 항목 |
| Body 1~6 | `text-base` 1~3, `text-sm` 4~6. 크기마다 Semibold, Medium, Regular 순 | 본문 |
| Button-lg, -md, -sm, -Xsm | `text-lg`부터 `text-xs`, 모두 Semibold. 주 버튼은 Button-md, 작은 헤더 버튼은 Button-sm | 버튼 안 글자만 |
| Caption 1~5 | `text-sm` 2개, `text-xs` 3개 | 메타데이터, 도움말, 배지, 시각, 작은 글씨 |

새 스타일이 필요하면 새 이름을 짓지 않고 그 묶음의 다음 번호(예: Body 7)를 scale 단계로 만든다.[](source:lp-styles)

@facts
| spacing | 0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96px의 13개만 쓴다(Spacing-0부터 Spacing-900). 사이 값과 바깥 값은 금지다[](source:lp-space) |
| 주 버튼 padding | 세로 8px, 가로 12px(의무)[](source:lp-space) |
| radius | Tailwind radius 값만 쓴다[](source:lp-radius) |
| 중첩 radius | 두 도형 사이 간격이 32px 미만이면 안쪽 radius = 바깥 radius − 간격. 결과가 2보다 클 때만 적용하고, 아니면 안쪽을 직각이나 그대로 둔다. 원문 예: 바깥 `rounded-2xl`(16px)에 padding 8px이면 안쪽은 8px(`rounded-lg`)[](source:lp-radius) |
| hero 폭 | 헤드라인과 서브헤드라인 최대 폭 680px. 줄바꿈은 생각이 끊기는 곳에서 한다[](source:lp-hero) |

## Part B는 무엇을 더 요구하나: 모션·콘텐츠·상태·출시 {#visual-behavior}

**모션.** 에이전트는 브라우저 기본 곡선(`ease`, `linear`, `ease-in-out`)을 쓰지 않는다. `transform`과 `opacity`만 움직이고 `top`, `left`, `width`, `height`는 움직이지 않는다. `prefers-reduced-motion`이면 움직임을 단순한 opacity 변화로 바꾼다.[](source:lp-motion)

| 값 | 성격 | 적용 조건 |
| --- | --- | --- |
| `ease-[cubic-bezier(0.22,1,0.36,1)]` + `duration-500` | 기본 곡선(의무) | 레이아웃·위치 변화[](source:lp-motion) |
| `duration-300`, 최소 200ms | 허용 | hover의 색·opacity 변화[](source:lp-motion) |
| 24px 위로, 항목마다 60ms 간격, 전체 400ms 상한 | 의무 | 열린 메뉴 안 링크 등장[](source:lp-nav) |
| 32px 위로, 600~800ms에 opacity 0에서 1 | 의무 | 섹션 scroll reveal. 한 번만 하고 위로 다시 스크롤해도 재생하지 않는다[](source:lp-reveal) |
| 25~35% opacity에서 시작 | 대략값("roughly") | tagline reveal의 흐린 글자색[](source:lp-tag) |

scroll reveal은 `IntersectionObserver`나 Framer Motion의 `whileInView`로 건다. 조절하지 않은 `window.addEventListener('scroll')`은 프레임마다 돌아 모바일 성능을 떨어뜨리므로 금지다.[](source:lp-reveal) 내비게이션은 위 가장자리에서 떨어져 떠 있는 작은 바로 두고, 반투명 표면과 배경 blur를 쓴다. 메뉴 아이콘은 두 상태 사이를 애니메이션으로 바꾸고, 모바일 메뉴는 작은 dropdown 대신 전체 높이 패널로 연다.[](source:lp-nav)

**tagline reveal 섹션(필수).** 모든 랜딩 페이지에 hero와 떨어진 큰 글자 섹션을 하나 둔다. 최소 두 줄이고, 일반 섹션 제목이 아닌 혜택 문장이나 tagline이다. 글자는 Heading 3~1 스타일을 줄 수에 따라 쓴다.[](source:lp-tag)

스크롤로 섹션이 들어오면 단어가 읽는 순서대로 하나씩 흐린 색에서 원래 색으로 바뀐다. 블록 전체가 한 번에 바뀌면 안 되고, 기본 곡선을 쓰며 linear fade는 금지다.[](source:lp-tag)

구현은 단어마다 `IntersectionObserver`를 쓰거나 `requestAnimationFrame`으로 조절한 scroll listener 하나를 쓴다. `prefers-reduced-motion`이면 처음부터 원래 색으로 보여 준다.[](source:lp-tag)

**콘텐츠 현실성.** 에이전트는 자리표시 라틴어나 "Your headline here"를 쓰지 않고 제품 말투로 실제 문장을 쓴다. 후기와 팀원에게는 대상과 지역에 맞는 구체적인 이름을 주고, 한 얼굴을 두 사람에게 쓰지 않는다.[](source:lp-real)

지어낸 이름과 브랜드는 가상 데모와 프로토타입에서만 허용된다. 그때도 숫자는 너무 둥글지 않게 쓴다. 실제 제품 페이지의 사실은 위 개입 표처럼 자리표시자로 남긴다.[](source:lp-real)

| 금지 | 대신 |
| --- | --- |
| "revolutionize", "supercharge", "cutting edge", "effortless", "transform your workflow", "take it to the next level", "harness the power", "world class" | 제품이 하는 일을 평범한 말로 쓴다[](source:lp-real) |
| 귀여운 감탄사, 느낌표가 든 시스템 메시지 | "Invoice sent to Dana", "Upload failed. The file is over 20 MB."처럼 무엇이 실패했고 다음에 뭘 할지 쓴다[](source:lp-real) |
| 원형 spinner, 빈 패널, `window.alert()` | 실제 레이아웃 모양의 skeleton, "getting started" 화면, 인라인 오류[](source:lp-states) |
| `#`을 가리키는 버튼 | 링크를 연결하거나 비활성으로 보이게 한다. 현재 페이지를 내비에 표시한다[](source:lp-states) |

제목과 버튼은 sentence case로 쓴다.[](source:lp-real) 상호작용 요소는 hover, active(`scale(0.98)`이나 `translateY(1px)`), focus ring, loading, empty, error 여섯 상태를 모두 갖춘다. focus ring은 접근성 요건이라 선택 사항이 아니다.[](source:lp-states)

출시 전에 빠지기 쉬운 것으로 원문이 드는 항목은 다음과 같다.[](source:lp-ship)

- [ ] footer의 개인정보 처리방침·약관 링크
- [ ] 브랜드를 입힌 404 페이지와 favicon
- [ ] 이메일 형식과 필수 필드의 클라이언트 쪽 검증
- [ ] 키보드 사용자를 위한 본문 바로가기 링크
- [ ] 관할에 따라 필요한 쿠키 동의
- [ ] `<title>`, meta description, `og:image`, 소셜 공유 태그
- [ ] 의미 있는 이미지마다 alt text
- [ ] `<nav>`, `<main>`, `<article>`, `<aside>`, `<section>` 같은 시맨틱 HTML
- [ ] 모든 페이지에서 돌아갈 길
- [ ] 390px 폭에서 가로 넘침이 없고, 버튼 글자가 안에 있고, 첫 화면에 주요 행동이 보이는지

## 비슷한 스킬과 무엇이 다른가 {#similar}

이 스킬은 `site-design-choice` 묶음의 선택지다. 묶음 안의 스킬은 서로 호출하거나 넘기지 않는다. 관계는 모두 같은 계열이고, 아래 표의 rel-id는 `design/relations.md`의 행이다.

| 상대 | rel-id | 근거 방식 | 무엇이 같고 다른가 |
| --- | --- | --- | --- |
| `design-taste-frontend` | r40 | 명시-이름 | 이 스킬의 Credits 절이 taste-skill(MIT)에서 리디자인 감사 구조, 콘텐츠 현실성 점검, 모션·내비게이션 아이디어를 가져와 다시 썼다고 적는다. taste-skill은 `design-taste-frontend`의 원격 저장소 `Leonxlnx/taste-skill`이다. 사용 지시가 아닌 계보 표기다[](source:lp-credit)[](source:tf-lock) |
| `impeccable` | r41 | 추론 | 둘 다 랜딩 페이지와 웹 UI를 만들고 리뷰한다. 이 스킬은 전환율과 고정 시각 규칙이 중심이고, `impeccable`은 design, critique, audit 같은 명령별 작업이 중심이다[](source:lp-fm)[](source:im-desc) |
| `web-design-engineer` | r45 | 추론 | 둘 다 랜딩 페이지, 프로토타입, 컴포넌트를 만든다. `web-design-engineer`는 슬라이드, 데이터 시각화 같은 브라우저 결과물 전반을 다룬다[](source:wde-desc)[](source:lp-fm) |

판정: 고를 때 가르는 기준은 두 가지다. 전환 중심 카피와 섹션 구성이 필요하면 이 스킬이 맞다. 값이 정해진 디자인 시스템 없이 다른 시각 방향을 원하면 이 스킬의 고정 값(글꼴 4종, 배경 단색, 13개 spacing)이 걸림돌이 된다. 근거는 Part B가 모든 값을 이 규칙으로 정하라고 한 문장이다.[](source:lp-font)

`design-taste-frontend`의 description은 회사·제품 웹사이트를 실제 브라우저 검사기로 확인한다고 적는다.[](source:tf-desc) 이 스킬에는 자동 검사 도구가 없고, 확인은 Quick checklist를 사람이나 에이전트가 따라가는 방식이다.[](source:lp-check) 묶음 전체 비교는 `design/_group-site-design-choice/site-design-choice.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 1개, `SKILL.md` 22,115B다. 스킬 폴더에 다른 파일은 없다. 관계 확인용으로 `design/elayadesign/skills-lock.json`과 다른 스킬 3개의 description, `design/taste/skills-lock.json`을 해당 줄만 읽었다.[](source:lp-lock)
- 번역본: 이 폴더에 번역본이 없다. 다른 컬렉션에 같은 이름의 스킬도 없다(`design/relations.md`).
- 바이너리: 없다.
- 이번 최신화(commit `4e3fc89`)로 바뀐 곳: "Button type" 두 줄이 26개 텍스트 스타일 표로 바뀌었다. 실제 제품에서 사실을 지어내지 말라는 규칙, 390px 확인, tagline reveal의 `prefers-reduced-motion` 처리, 체크리스트 3줄, Credits 절이 추가됐다. tagline 크기 규칙은 `text-4xl`~`text-6xl`에서 Heading 3~1로 바뀌었다. 이 내용은 `git show 4e3fc89`로 확인했다.
- 원문 대조 범위(1): 활성화 제한 1개(호출 제한 필드 없음), 우선순위 규칙 2개, 사람 개입 3곳을 대조했다.
- 원문 대조 범위(2): 금지 규칙 16종을 대조했다(글꼴, 기울임꼴, 굵기, 하이픈, 임의 크기, spacing 밖 값, 한쪽 테두리, 배경 그라디언트, Material 아이콘, 기본 곡선, 레이아웃 속성 애니메이션, 조절 없는 scroll listener, 금지어, 사실 지어내기, 죽은 링크, `window.alert()`).
- 원문 대조 범위(3): 수치를 모두 대조했다(type scale 13단계, 26개 스타일, spacing 13개, 버튼 padding, radius 공식 32px·2, hero 680px, 모션 값 5행, FAQ 6~12, benefits 3~5, how it works 3단계, 390px).
- 분석 중 바뀐 파일: 없다.

@callout level=open-question title="원문에서 확인하지 못했거나 부딪치는 곳"
- Output format 절의 7개 항목을 낸 뒤 사용자 확인을 기다리는지는 `원문에 명시 없음`이다. A1은 "빌드를 멈추지 말라"고 해서, 판정으로는 기다리지 않고 바로 섹션별 구현으로 가는 쪽에 가깝다.[](source:lp-out)[](source:lp-intake)
- B1은 글 안의 `-`를 금지하는데, A5의 benefit bullet 예시는 굵은 혜택 뒤에 대시를 쓴다("**Faster iteration** — generate ..."). 금지 대상이 하이픈만인지 대시까지인지는 원문이 구분하지 않는다.[](source:lp-copyrule)[](source:lp-copy)
- Scope 절은 대시보드에도 적용한다고 하지만 Part A의 섹션 구성과 tagline reveal 필수 규칙은 랜딩 페이지 전용이다. 대시보드에서 Part A를 건너뛰어도 되는지는 `원문에 명시 없음`이다.[](source:lp-scope)[](source:lp-tag)
- `redesign-existing-projects`는 이 저장소에 없어 읽지 않았다. "구체적인 값은 이 파일을 따른다"는 설명은 이 스킬 쪽 문장만 근거다.[](source:lp-scope)
- 원장 r40의 출처 줄 `landing-page-design:451-454`에서 taste-skill 표기는 451줄이다. 453~454줄은 라이선스 접기 태그 시작이다.
