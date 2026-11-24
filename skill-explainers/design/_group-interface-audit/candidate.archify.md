# 묶음: interface-audit — Jakubkrehel 도메인 규칙으로 인터페이스 전체와 변경분을 리뷰·개선한다 {#overview}

이 묶음은 `jakubkrehel`의 총괄 리뷰(`better-interface`)와 변경분 리뷰(`interface-review`), 6개 도메인 스킬(`better-accessibility`, `better-layout`, `better-writing`, `better-typography`, `better-colors`, `better-ui`), 구현·자율 개선 스킬(`build-design`, `afk`)로 이루어진다.

- 전체 화면·저장소 리뷰는 `better-interface`가 7개 도메인 스킬을 정해진 순서로 `호출`해 단일 보고서로 통합하고, 변경분 리뷰는 `interface-review`가 영향 범위와 제거 신호를 추려 `better-interface`에 넘긴다.[](source:sbi)[](source:sir)
- 도메인 스킬 사이에서는 `better-accessibility`와 `better-typography`가 렌더링 대비 측정을 `better-colors`에 `호출`하고, 나머지 도메인 간 경계는 `참고`로 나눈다.[](source:sa11y)[](source:styp)

@answer scope="design/_group-interface-audit · 10개 스킬 · 관계 원장 기준"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source sbi title="better-interface 오케스트레이션" path=design/jakubkrehel/better-interface/SKILL.md lines=28:56
@source sir title="interface-review의 better-interface 이관" path=design/jakubkrehel/interface-review/SKILL.md lines=93:97
@source sir-rem title="interface-review 제거 신호 라우팅" path=design/jakubkrehel/interface-review/removed-signals.md lines=7:17
@source sa11y title="better-accessibility 대비 측정 위임" path=design/jakubkrehel/better-accessibility/SKILL.md lines=80:80
@source scol title="better-colors 역할" path=design/jakubkrehel/better-colors/SKILL.md lines=1:14
@source slay title="better-layout 역할" path=design/jakubkrehel/better-layout/SKILL.md lines=1:14
@source styp title="better-typography 대비 측정 위임" path=design/jakubkrehel/better-typography/SKILL.md lines=10:10
@source sui title="better-ui 역할" path=design/jakubkrehel/better-ui/SKILL.md lines=1:18
@source swri title="better-writing 역할" path=design/jakubkrehel/better-writing/SKILL.md lines=1:14
@source sbld title="build-design 도메인 충돌 경계" path=design/jakubkrehel/build-design/SKILL.md lines=12:12
@source safk title="afk 5단계 도메인 통과 의무" path=design/jakubkrehel/afk/SKILL.md lines=95:95

## 스킬 사이의 선택과 흐름 {#flow span=12}

그림은 리뷰 오케스트레이션(`interface-review` ↔ `better-interface` → 6개 도메인 스킬)을 중심으로 그렸으며, `better-colors` 호출과 `build-design`·`afk`·도메인 간 `참고` 관계는 아래 표에 정리했다. (`better-motion`은 저장소에 없어 `Not reviewed` 처리된다.)

@architecture id=group-flow title="interface-audit 리뷰 연결"
| ir | interface-review | backend |
| bi | better-interface | backend |
| a11y | better-accessibility | backend |
| lay | better-layout | backend |
| wri | better-writing | backend |
| typ | better-typography | backend |
| col | better-colors | backend |
| ui | better-ui | backend |
| ir > bi | 호출 |
| bi > ir | 다음 안내 | dashed |
| bi > a11y | 호출(1) |
| bi > lay | 호출(2) |
| bi > wri | 호출(3) |
| bi > typ | 호출(4) |
| bi > col | 호출(5) |
| bi > ui | 호출(6) |

@steps id=group-steps
| s-ir | interface-review | 이 단계에서 하는 일: 브랜치·PR·미커밋 변경분의 영향 범위와 제거 신호를 추출해 `better-interface`에 넘긴다.[](source:sir) | group-flow | ir |
| s-bi | better-interface | 이 단계에서 하는 일: 7개 도메인 스킬을 순서대로 호출해 증거를 모으고 단일 우선순위 보고서로 통합한다.[](source:sbi) | group-flow | bi |
| s-a11y | better-accessibility | 이 단계에서 하는 일: WCAG 2.2 기준으로 키보드·포커스·ARIA·폼·확대 대응을 검토하고 수정한다.[](source:sa11y) | group-flow | a11y |
| s-lay | better-layout | 이 단계에서 하는 일: 그룹화·정렬·여백·읽기 순서·반응형·RTL 대응을 설계하고 검증한다.[](source:slay) | group-flow | lay |
| s-wri | better-writing | 이 단계에서 하는 일: 레이블·에러·빈 상태 등 인터페이스 카피를 제품 어조에 맞춰 작성·리뷰한다.[](source:swri) | group-flow | wri |
| s-typ | better-typography | 이 단계에서 하는 일: 타입 스케일·폰트·줄바꿈·문장부호·숫자 정렬 등 텍스트 렌더링을 설정·리뷰한다.[](source:styp) | group-flow | typ |
| s-col | better-colors | 이 단계에서 하는 일: OKLCH 팔레트 생성, 시맨틱 토큰 명명, 포맷 변환 및 렌더링 대비 측정을 수행한다.[](source:scol) | group-flow | col |
| s-ui | better-ui | 이 단계에서 하는 일: 모서리 반경·광학적 정렬·그림자·아이콘 상태를 정밀 수치로 마감한다.[](source:sui) | group-flow | ui |

## 주고받는 것과 관계 표 {#relations span=12}

| 누가 | 누구를 | 관계 | 조건과 주고받는 것 |
| --- | --- | --- | --- |
| `better-interface` {#r-46-51} | 6개 `better-*` 도메인 | 호출 | 의무: 1(`accessibility`)→2(`layout`)→3(`writing`)→4(`typography`)→5(`colors`)→6(`ui`) 순으로 로드·리뷰 후 결과를 통합한다(7번 `better-motion`은 미설치로 `Not reviewed`).[](source:sbi) |
| `better-interface` {#r-53} | `interface-review` | 다음 안내 | 의무: 변경분 리뷰 요청이면 사용자에게 `interface-review` 실행을 요청한다.[](source:sbi) |
| `interface-review` {#r-54} | `better-interface` | 호출 | 의무: 7단계에서 범위 블록과 영향 화면을 넘겨 통합·판정한다.[](source:sir) |
| `interface-review` {#r-56-61} | 6개 `better-*` 도메인 | 호출 · 참고 | 제거 신호·폰트·이미지 변경 시 해당 도메인 스킬로 확인을 라우팅한다(그림에서 생략).[](source:sir-rem) |
| `better-accessibility`, `better-typography` {#r-62-67} | `better-colors` | 호출 | 렌더링 색상 대비 측정을 위임한다(그림에서 생략).[](source:sa11y)[](source:styp) |
| `build-design`, `afk` {#r-84-75} | 도메인 스킬 · `interface-review` | 참고 · 호출 · 대안 | `build-design`은 디자인 충돌 시 도메인 스킬을 준수하고 사후 리뷰는 `interface-review`로 넘기며, `afk`는 UI 구현 시 도메인 규칙을 통과한다(그림에서 생략).[](source:sbld)[](source:safk) |

## 공유 상태 {#shared-state span=12}

| 파일·폴더 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `CODING_STANDARDS.md` (대상 저장소) | - | `afk`, `better-interface` (사전 정찰 시) |