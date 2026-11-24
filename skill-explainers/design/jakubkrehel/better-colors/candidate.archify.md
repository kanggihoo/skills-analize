# better-colors — OKLCH 팔레트 생성, 시맨틱 토큰 명명, 포맷 변환과 렌더링 대비 측정을 수행한다 {#overview}

better-colors는 색상 체계를 새로 설계하거나 감사할 때 밝기 단계 묶음 생성, 역할 기반 토큰 이름 부여, 표기법 변환과 실제 렌더링 기준 대비 측정을 수행하는 스킬이다.[](source:intro)

- 색상 팔레트 구축·변환·감사 요청을 받거나, `better-interface` 통합 리뷰의 5번 도메인, `interface-review`의 토큰 제거 신호, `better-accessibility`·`better-typography`의 대비 측정 요청이 있을 때 켜진다.[](source:fm)[](source:bi-rel)[](source:ir-rel)[](source:a11y-rel)[](source:typ-rel)
- 결과로 남는 것은 프로젝트 표기법에 맞춘 팔레트·2계층 토큰 정의, 또는 실측 대비 수치와 기준 미달 보고(`Severity | Location | Before | After | Why`, 단독 시 `Block`/`Approve`)다.[](source:match)[](source:measure)[](source:ref-rep)
- 다른 스킬과의 관계: `better-interface`·`interface-review`·`better-accessibility`·`better-typography`가 대비 측정과 색상 확인으로 `호출`하고, `better-layout`·`better-writing`·`explain-interface`가 `참고`로 이어진다.[](source:bi-rel)[](source:ir-rel)[](source:a11y-rel)[](source:typ-rel)[](source:lay-rel)[](source:wri-rel)[](source:exp-rel)
- 하지 않는 것: 측정하지 않은 대비 값이나 어림잡은 색상을 보고하지 않고, 요청 없이 표기법을 일괄 변환하거나 대비 실패 색상을 임의로 고치지 않으며, 대비 통과 의무 판정(`better-accessibility`)과 surface·그림자·아이콘 색(`better-ui`) 영역을 침범하지 않는다.[](source:intro)[](source:measure)[](source:ref-fmt)

@answer scope="design/jakubkrehel/better-colors · 원본 파일 9개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source fm title="frontmatter: name·description" path=design/jakubkrehel/better-colors/SKILL.md lines=1:4
@source intro title="목표, 실측·계산 의무, 도메인 경계" path=design/jakubkrehel/better-colors/SKILL.md lines=8:12
@source match title="기존 색상 체계와 oklch() 기본값" path=design/jakubkrehel/better-colors/SKILL.md lines=14:18
@source ramps title="ramp 구성, 단계 역할, 2계층 토큰과 hue 유지" path=design/jakubkrehel/better-colors/SKILL.md lines=20:38
@source meaning title="색상 의미 일관성과 뷰당 1개 강조 버튼" path=design/jakubkrehel/better-colors/SKILL.md lines=40:48
@source measure title="렌더 쌍 실측 후 보고와 보간 공간 선택" path=design/jakubkrehel/better-colors/SKILL.md lines=50:56
@source finish title="마무리 전 자가 점검 17패턴과 검증 기준" path=design/jakubkrehel/better-colors/SKILL.md lines=58:84
@source ref-fmt title="Hex/rgb/hsl/oklch 비교, 변환 범위, gamut, 모던 CSS" path=design/jakubkrehel/better-colors/color-formats.md lines=1:86
@source ref-struct title="Neutral/Accent/Status 구조, Tailwind·Radix 매핑, 팔레트 감사" path=design/jakubkrehel/better-colors/palette-structure.md lines=1:70
@source ref-token title="2계층 토큰 명명 문법, 역할 목록, 안티패턴, Tailwind v4" path=design/jakubkrehel/better-colors/token-naming.md lines=1:95
@source ref-gen title="브랜드 색 배치, 라이브러리 생성, 다중 색상 균형, 다크 모드" path=design/jakubkrehel/better-colors/palette-generation.md lines=1:108
@source ref-usage title="색상 의미·토큰 역할·그라데이션·문화권·고대비 변형" path=design/jakubkrehel/better-colors/color-usage.md lines=1:109
@source ref-con title="실제 배경 기준 WCAG 2·APCA 측정과 지각 밝기 수정" path=design/jakubkrehel/better-colors/contrast.md lines=1:68
@source ref-rep title="단독 리뷰 심각도·표 형식과 Block/Approve 판정" path=design/jakubkrehel/better-colors/reporting.md lines=1:16
@source yaml title="UI 표시 이름과 짧은 설명" path=design/jakubkrehel/better-colors/agents/openai.yaml lines=1:3
@source bi-rel title="better-interface 5번 도메인 로드 규칙" path=design/jakubkrehel/better-interface/SKILL.md lines=44:54
@source ir-rel title="interface-review 제거 신호의 better-colors 소유 항목" path=design/jakubkrehel/interface-review/removed-signals.md lines=12:16
@source a11y-rel title="better-accessibility의 대비 측정 위임" path=design/jakubkrehel/better-accessibility/SKILL.md lines=80:80
@source typ-rel title="better-typography의 대비 측정 위임" path=design/jakubkrehel/better-typography/SKILL.md lines=10:10
@source lay-rel title="better-layout의 주 행동 색상 소유권 참조" path=design/jakubkrehel/better-layout/SKILL.md lines=36:36
@source wri-rel title="better-writing의 파괴적 버튼 구분 색상 참조" path=design/jakubkrehel/better-writing/SKILL.md lines=98:98
@source exp-rel title="explain-interface의 색상 용어·기준 참조" path=design/jakubkrehel/explain-interface/SKILL.md lines=11:11

## 어떻게 동작하나 {#flow span=12}

원칙형이다. 색상 체계의 구조·명명·생성·사용·측정 원칙과 마무리 점검표에 따라 판단한다.

| 적용 상황 | 참조 파일 | 바뀌는 판단 | 출력 사례 |
| --- | --- | --- | --- |
| 표기법 선택·변환·색역 처리 | `SKILL.md`, `color-formats.md` | 기존 표기법을 유지하고 새 체계만 `oklch()`를 기본으로 쓰며, 일괄 변환은 명시적 마이그레이션 요청일 때만 수행한다. sRGB 밖 색상은 sRGB 값을 먼저 선언한 뒤 `@media (color-gamut: p3)`로 겹친다. | Hex를 `oklch()`로 바꾸되 `currentColor`와 gradient 보간 방식은 보존[](source:match)[](source:ref-fmt) |
| 팔레트 구조·단계 역할·기존 감사 | `SKILL.md`, `palette-structure.md` | 중립 1개·강조 1개·실제 쓰는 상태(0~4개) ramp(한 hue의 밝기 단계 묶음)만 두고, 상태 색상은 강조 색상과 OKLCH 색상(hue)이 `15°` 이상 떨어지게 잡는다. 기존 팔레트는 5단계 목록화 보고 뒤 사용자 승인을 받아 정리한다. | Tailwind `50`–`950` 또는 Radix `1`–`12` 역할 매핑과 OKLab `ΔE < 0.02` 중복 통합안[](source:ramps)[](source:ref-struct) |
| 2계층 토큰 명명·Tailwind v4 | `SKILL.md`, `token-naming.md` | 컴포넌트에 `--blue-600` 같은 primitive 토큰을 직접 쓰지 않고 역할 이름의 semantic 토큰(`--color-accent-solid` 등)만 연결하며, `primary`를 브랜드와 본문에 겹쳐 쓰지 않는다. | `--color-sidebar-gray`를 `--color-bg-surface`로 바꾸고 `@theme` 밖에 `.dark` 재지정[](source:ramps)[](source:ref-token) |
| OKLCH 기반 ramp 생성·다크 모드 | `SKILL.md`, `palette-generation.md` | 눈대중이나 HSL 대신 `culori` 등 라이브러리로 일정한 OKLCH 색상(hue)과 지각 밝기를 계산하되, 밝은 쪽(`50`–`200`) 간격은 `0.04`–`0.05` `L`로 촘촘히 둔다. 다크 모드는 단순 반전이 아니라 채도 하향·어두운 쪽 간격 확대와 전환 방식 1종 통일이 필수다. | `#3b82f6`가 흰 글자와 3.68:1로 실패하면 `500`에 두고 채움은 `600`에 배정[](source:ramps)[](source:ref-gen) |
| 의미 일관성·그라데이션·고대비 변형 | `SKILL.md`, `color-usage.md` | OKLCH hue `15°` 이내를 같은 색으로 취급해 한 의미=한 색을 지키고, 뷰당 채운 주 행동 버튼은 1개만 둔다. 그라데이션 기본 보간 공간은 `in oklab`이며 회색 중간 지대 회피 때만 `in oklch`를 쓴다. | 라이트·다크 각각에 `prefers-contrast: more` 값을 분리 선언해 배경과 `L` `0.15` 이상 격차 확보[](source:meaning)[](source:measure)[](source:ref-usage) |
| 렌더링 대비 측정과 단독 보고 | `SKILL.md`, `contrast.md`, `reporting.md` | 페이지 배경이나 선언문이 아니라 실제 뒤에 깔린 배경·투명도·`color-mix()`·이미지 최악 영역 기준의 렌더 결과를 실측한다. 실패 시 수치와 기준만 보고하고 수정은 요청 시에만 지각 밝기(`L`)를 조절한다. | WCAG 2(4.5:1/3:1)와 APCA(`Lc` 75/60/45/30/15) 결과 보고, 단독 시 `Block`/`Approve` 판정[](source:intro)[](source:measure)[](source:ref-con)[](source:ref-rep) |

원칙의 핵심은 두 가지다. 첫째, 표기법·틴트 중립색·보간 공간 같은 프로젝트 취향은 지적으로 올리지 않고, 역할 매핑 파손·대비 실패·색역(gamut) 클리핑 같은 구조적 결함만 잡는다.[](source:intro) 둘째, 단독 리뷰에서는 `reporting.md` 형식과 `Block`/`Approve` 판정을 쓰지만, `better-interface`가 호출하면 그쪽 보고 형식과 심각도 체계로 대체된다.[](source:ref-rep)

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 호출형이다(`description` 기준 모델이 판단해 켠다). frontmatter에 호출 제한 필드가 없다.[](source:fm) |
| 성격 | OKLCH 기반 팔레트 설계·토큰 명명·포맷 변환·렌더링 대비 실측을 맡는 도메인 스킬.[](source:intro) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| better-interface {#rel-r50} | **이 스킬** | 호출 | 의무: `better-interface`가 5번 순서로 로드·리뷰한 뒤 결과를 통합한다. 형식과 심각도는 `better-interface`가 대체한다(사용자 개입 없음).[](source:bi-rel) |
| interface-review {#rel-r57} | **이 스킬** | 호출 | diff의 제거 신호(`prefers-contrast`, 색상 토큰을 리터럴이나 더 밝은 토큰으로 교체) 발생 시 확인을 위임한다(사용자 개입 없음).[](source:ir-rel) |
| better-accessibility {#rel-r62} | **이 스킬** | 호출 | 의무: 렌더링 색상 대비 측정은 이 스킬을 쓴다. 색상 수정은 사용자 요청 시에만 수행한다.[](source:a11y-rel)[](source:measure) |
| better-typography {#rel-r67} | **이 스킬** | 호출 | 대비 측정은 이 스킬을 쓰고, 통과 여부는 `better-accessibility`가 판단한다(사용자 개입 없음).[](source:typ-rel) |
| better-layout {#rel-r71} | **이 스킬** | 참고 | 뷰당 주 행동 강조 색상 규칙을 이 스킬 소유로 참조한다(사용자 개입 없음).[](source:lay-rel) |
| better-writing {#rel-r74} | **이 스킬** | 참고 | 파괴적 확인 버튼의 구분 색상 규칙을 이 스킬 소유로 참조한다(사용자 개입 없음).[](source:wri-rel) |
| explain-interface {#rel-r86} | **이 스킬** | 참고 | 이미지·시스템 분석 시 이 스킬과 `better-typography`·`better-layout`의 용어와 기준으로 해석한다(사용자 개입 없음).[](source:exp-rel) |

@architecture id=relation-map title="better-colors와 이어지는 스킬"
| bi | better-interface | backend |
| ir | interface-review | backend |
| a11y | better-accessibility | backend |
| typ | better-typography | backend |
| lay | better-layout | backend |
| wri | better-writing | backend |
| exp | explain-interface | backend |
| self | better-colors(이 스킬) | backend |
| bi > self | 호출 | |
| ir > self | 호출 | |
| a11y > self | 호출 | |
| typ > self | 호출 | |
| lay > self | 참고 | dashed |
| wri > self | 참고 | dashed |
| exp > self | 참고 | dashed |

@code source=fm language=yaml

이 스킬 원문(`SKILL.md` 12·42줄, `contrast.md` 5줄)에서도 대비 통과 의무 판정과 색 외 보조 단서 규칙은 `better-accessibility` 소관으로, surface·그림자·아이콘 색은 `better-ui` 소관으로 경계를 긋는다.[](source:intro)[](source:meaning)[](source:ref-con)

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 핵심 10원칙, 마무리 17패턴 표, 도메인 경계, 브라우저 유무별 검증 기준 | 스킬이 켜지면 읽는다 | 표기법 선택·변환·색역 처리, 팔레트 구조·단계 역할·기존 감사, 2계층 토큰 명명·Tailwind v4, OKLCH 기반 ramp 생성·다크 모드, 의미 일관성·그라데이션·고대비 변형, 렌더링 대비 측정과 단독 보고 |
| `color-formats.md` | Hex/`rgb()`/`hsl()`/`oklch()` 비교, 일괄 변환 범위, Display P3·`@supports`, `color-mix()`·상대 색상·`light-dark()` | 표기 변환·색역·모던 CSS를 다룰 때 읽는다 | 표기법 선택·변환·색역 처리 |
| `palette-structure.md` | Neutral/Accent/Status ramp 수, Tailwind `50`–`950`·Radix `1`–`12` 매핑, 기존 팔레트 감사 5단계 | 팔레트 구조 설계나 기존 색 정리를 할 때 읽는다 | 팔레트 구조·단계 역할·기존 감사 |
| `token-naming.md` | 2계층 primitive/semantic 토큰, 역할 목록 5종, 명명 문법, 안티패턴, Tailwind v4 `@theme` 규칙 | 토큰 이름을 짓거나 감사할 때 읽는다 | 2계층 토큰 명명·Tailwind v4 |
| `palette-generation.md` | 브랜드 색 `600`/`9` 배치, `culori` 생성·`L` 간격 수치, 다중 색상 균형, 다크 모드 전환 방식 3종 | ramp 수치 생성과 다크 모드 조정을 할 때 읽는다 | OKLCH 기반 ramp 생성·다크 모드 |
| `color-usage.md` | `15°` 규칙, 채운 버튼 1개, `in oklab`/`in oklch` 그라데이션, 문화권 색 반전, `prefers-contrast: more` | 색상 배치·그라데이션·고대비 변형을 다룰 때 읽는다 | 의미 일관성·그라데이션·고대비 변형 |
| `contrast.md` | WCAG 2·APCA 임계값 표, `L` 우선 수정 제약, 배경 극성 선택, 반투명·이미지 위 점검 | 대비 측정이나 실패 수정을 다룰 때 읽는다 | 렌더링 대비 측정과 단독 보고 |
| `reporting.md` | 단독 리뷰 심각도, 3가지 `HIGH` escalation trigger, `Block`/`Approve` 판정 | 단독 리뷰 보고 시 읽는다 | 렌더링 대비 측정과 단독 보고 |
| `agents/openai.yaml` | UI 표시 이름과 짧은 설명 메타데이터[](source:yaml) | UI가 스킬을 보여 줄 때 쓴다. 지시 본문이 아니다 | 원문에 명시 없음 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 실측하지 않은 대비 값 또는 어림잡아 추정한 색상 | 보고 금지다. 라이브러리로 계산하거나 실제 렌더링된 쌍을 측정한 값만 보고한다 | [](source:intro)[](source:ref-fmt) |
| 요청 없는 표기법 일괄 변환 또는 대비 실패 색상의 임의 수정 | 금지다. 변환은 명시적 요청·마이그레이션일 때만, 대비 실패는 보고만 남기고 요청 시에만 지각 밝기(`L`)를 조절한다 | [](source:measure)[](source:ref-fmt) |
| 기존 팔레트 통합·재구조화 제안 | 임의로 적용하지 않고 목록화 결과를 먼저 보고해 사용자 승인을 받은 뒤 바꾼다 | [](source:ref-struct) |
| 컴포넌트 파일의 원시 색상 리터럴·primitive 토큰 직접 사용, `primary` 충돌 | semantic 토큰으로 바꾸고, `primary`는 브랜드(`accent`)와 본문 텍스트(`--color-text-primary`)에 중복 사용하지 않는다 | [](source:finish)[](source:ref-token) |
| 의미·상태 색상이 강조 색상과 OKLCH hue `15°` 이내임 | 최소 `15°` 이상 떼거나 파괴적 동작에 아이콘·테두리 등 별도 처리를 둔다 | [](source:finish)[](source:ref-struct) |
| `50`–`200` 간격 과다 또는 인접 단계 OKLCH `L` 차이 `0.03` 미만 | 밝은 끝(`50`–`200`)은 `0.04`–`0.05` `L`로 좁히고 `0.03` 미만 인접 단계는 합친다 | [](source:finish)[](source:ref-gen) |
| 다크 모드를 라이트 단계 역순으로만 뒤집음 또는 전환 방식 혼용 | 채도를 낮추고 어두운 끝 간격을 넓혀 다시 실측한다. `prefers-color-scheme`, `.dark`, `light-dark()` 중 하나만 쓴다 | [](source:finish)[](source:ref-gen) |
| `prefers-contrast: more`를 라이트·다크 공용 블록에 둠 | appearance(라이트·다크 외관)마다 각각 선언해 배경과 `L` `0.15` 이상 차이를 만든다 | [](source:finish)[](source:ref-usage) |
| sRGB 밖 `oklch()` 채도 또는 반투명(`/50`, `rgba(`, `color-mix(`) 위 텍스트 | sRGB 값을 먼저 선언하고 `@media (color-gamut: p3)`에 고채도 값을 둔다. 반투명 배경 위 텍스트는 실측하거나 불투명 토큰을 쓴다 | [](source:finish)[](source:ref-fmt) |
| 브라우저 없이 리뷰하거나 일부 영역을 점검하지 못함 | 못 돌린 실측 검증은 `Not verified`로 보고하고, 미검토 영역은 절대 `Approve`하지 않는다 | [](source:finish)[](source:ref-rep) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 기존 팔레트 5단계 감사 절차 — 팔레트 구조·단계 역할·기존 감사 · 리터럴 grep, `OKLab ΔE` `0.02` 기준 중복 통합, 역할 매핑 절차 세부 내용을 개요에서 줄였다.
- Tailwind `50`–`950`과 Radix `1`–`12` 역할 매핑표 및 17패턴 점검표 — 2계층 토큰 명명·Tailwind v4와 OKLCH 기반 ramp 생성·다크 모드 · 12개 역할별 단계 번호와 마무리 표 전체를 상세로 풀 수 있다.
- WCAG 2 vs APCA 임계값과 배경 극성 계산 — 렌더링 대비 측정과 단독 보고 · 본문 `Lc 75`/`90` 등 6개 등급과 중립 교차점(`56%` `L`) 판단을 개요에 다 담지 않았다.

@callout level=open-question title="확인하지 못한 것"
| 색상 연산에 사용하는 `culori`, `colorjs.io`, `chroma.js`나 브라우저 실측 도구는 이 스킬 폴더에 포함되지 않고 대상 프로젝트 환경에 의존한다. |

읽은 원본: 텍스트 파일 9개(`SKILL.md`, `color-formats.md`, `palette-structure.md`, `token-naming.md`, `palette-generation.md`, `color-usage.md`, `contrast.md`, `reporting.md`, `agents/openai.yaml`)와 관계 대조용 형제 스킬 원문 일부(`better-interface/SKILL.md`, `interface-review/removed-signals.md`, `better-accessibility/SKILL.md`, `better-typography/SKILL.md`, `better-layout/SKILL.md`, `better-writing/SKILL.md`, `explain-interface/SKILL.md`). 제외: 없음.
