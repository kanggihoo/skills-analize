# 묶음: motion-craft — 웹·모바일 애니메이션을 설계·진단·개선·리뷰한다 {#overview}

이 묶음은 `emilkowalski`의 모션 전문 스킬 9개를 모았다. 탐색(`find-animation-opportunities`) → 계획·위임(`improve-animations`) → 구현(`animate`, `animate-expo`) → 성능 진단(`animation-performance`) → 리뷰(`review-animations`)가 기준 문서와 핸드오프로 이어지며, 3개 안내 스킬이 용어·철학을 뒷받침한다.

- `find-animation-opportunities`가 제안한 항목을 `improve-animations plan`으로 넘기고, `improve-animations execute`는 `review-animations/STANDARDS.md`로 구현 diff를 검증한다.[](source:find-hand)[](source:imp-exec)
- `animate`의 완료 전 자가 점검은 `review-animations` 자동 차단 기준과 같고, `apple-design`·`mobile-native`는 각각 `animation-performance`와 `animate` 토큰을 참고한다.[](source:anim-rev)[](source:apple-perf)

@answer scope="design/_group-motion-craft · 9개 스킬 · 관계 원장 기준"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source sanim title="animate 소개와 review-animations 기준" path=design/emilkowalski/animate/SKILL.md lines=1:20
@source sexpo title="animate-expo 소개" path=design/emilkowalski/animate-expo/SKILL.md lines=1:20
@source sperf title="animation-performance 소개" path=design/emilkowalski/animation-performance/SKILL.md lines=1:20
@source svocab title="animation-vocabulary 소개" path=design/emilkowalski/animation-vocabulary/SKILL.md lines=1:20
@source sapple title="apple-design 소개" path=design/emilkowalski/apple-design/SKILL.md lines=1:20
@source apple-perf title="apple-design의 animation-performance 참조" path=design/emilkowalski/apple-design/SKILL.md lines=175:175
@source semil title="emil-design-eng 소개" path=design/emilkowalski/emil-design-eng/SKILL.md lines=1:20
@source sfind title="find-animation-opportunities 소개" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=1:20
@source find-hand title="find-animation-opportunities 핸드오프" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=135:135
@source simp title="improve-animations 소개" path=design/emilkowalski/improve-animations/SKILL.md lines=1:20
@source imp-exec title="improve-animations execute 검증 기준" path=design/emilkowalski/improve-animations/SKILL.md lines=108:108
@source srev title="review-animations 소개" path=design/emilkowalski/review-animations/SKILL.md lines=1:20
@source anim-rev title="animate의 review-animations 자동 차단 기준" path=design/emilkowalski/animate/SKILL.md lines=179:179

## 스킬 사이의 선택과 흐름 {#flow span=12}

그림은 핵심 연결(`다음 안내`, `참고`)을 중심으로 그렸으며, 상호 역할 경계(`대안`) 10건과 안내 스킬 2종(`animation-vocabulary`, `emil-design-eng`)의 세부는 아래 관계 표에 남겼다.

@workflow id=group-flow title="motion-craft 주요 흐름"
| lane discover | 탐색과 계획 |
| lane build | 구현과 성능 |
| lane check | 기준 리뷰 |
| find | find-animation-opportunities | backend | discover | source:sfind |
| imp | improve-animations | backend | discover | source:simp |
| anim | animate | backend | build | source:sanim |
| expo | animate-expo | backend | build | source:sexpo |
| perf | animation-performance | backend | build | source:sperf |
| apple | apple-design | backend | build | source:sapple |
| rev | review-animations | backend | check | source:srev |
| find > imp | 다음 안내 | |
| imp > rev | 참고(STANDARDS) | dashed |
| anim > rev | 참고(차단 기준) | dashed |
| apple > perf | 참고 | dashed |

@steps id=group-steps
| s-find | find-animation-opportunities | 이 단계에서 하는 일: 애니메이션 추가 후보를 4단계 게이트로 걸러 구현 없이 수치 제안만 보고한다.[](source:sfind) | group-flow | find |
| s-imp | improve-animations | 이 단계에서 하는 일: 코드베이스 모션을 감사해 우선순위 계획서를 쓰고 요청 시 worktree 서브에이전트에 실행을 위임한다.[](source:simp) | group-flow | imp |
| s-anim | animate | 이 단계에서 하는 일: 웹 애니메이션 필요 여부부터 중단·접근성까지 순서대로 결정해 구현한다.[](source:sanim) | group-flow | anim |
| s-expo | animate-expo | 이 단계에서 하는 일: React Native·Expo 앱에서 UI 스레드 기반 애니메이션과 제스처를 구현한다.[](source:sexpo) | group-flow | expo |
| s-perf | animation-performance | 이 단계에서 하는 일: 프레임 드랍 원인을 진단하고 합성 전용 속성·비메인스레드 전환으로 고친다.[](source:sperf) | group-flow | perf |
| s-apple | apple-design | 이 단계에서 하는 일: Apple 유체 인터페이스·스프링·제스처 원칙을 웹 구현 규칙으로 번역해 적용한다.[](source:sapple) | group-flow | apple |
| s-rev | review-animations | 이 단계에서 하는 일: 애니메이션 코드를 `STANDARDS.md` 기준으로 리뷰해 `Approve`/`Block` 판정을 내린다.[](source:srev) | group-flow | rev |

## 주고받는 것과 관계 표 {#relations span=12}

| 누가 | 누구를 | 관계 | 조건과 주고받는 것 |
| --- | --- | --- | --- |
| `find-animation-opportunities` {#r-29} | `improve-animations` | 다음 안내 | 사용자가 제안 표 항목 구현을 원하면 `improve-animations plan <description>`으로 핸드오프 안내(사용자 요청 필요).[](source:find-hand) |
| `improve-animations` {#r-33} | `review-animations` | 참고 | `execute <plan>` 시 서브에이전트 diff를 `STANDARDS.md` 기준으로 검증한다.[](source:imp-exec) |
| `animate` {#r-14} | `review-animations` | 참고 | 완료 전 자가 점검(`Never Ship`)이 `review-animations`의 자동 차단 기준과 같다.[](source:anim-rev) |
| `apple-design` {#r-24} | `animation-performance` | 참고 | 합성기 친화적 속성과 `will-change` 상세 기준을 참조한다.[](source:apple-perf) |
| `animate` ↔ `animate-expo`·`animation-performance`·`improve-animations`·`find-animation-opportunities`·`review-animations` {#r-alt} | 상호 역할 경계 | 대안 | 웹 구현(`animate`), RN 구현(`animate-expo`), 성능(`animation-performance`), 탐색(`find`), 감사(`improve`), 리뷰(`review`)로 역할을 나눈다(사용자 선택; 그림에서 생략).[](source:sanim)[](source:sperf) |
| `animation-vocabulary`, `emil-design-eng` {#r-guide} | 묶음 내 안내 | 안내 | 용어 역조회(`animation-vocabulary`)와 디자인 엔지니어링 철학(`emil-design-eng`)을 제공한다(그림에서 생략).[](source:svocab)[](source:semil) |

## 공유 상태 {#shared-state span=12}

| 파일·폴더 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `review-animations/STANDARDS.md` | `review-animations` | `improve-animations` (`execute <plan>` 검증 시)[](source:imp-exec) |
| `plans/*.md` (대상 프로젝트 내) | `improve-animations` | `improve-animations` (`execute` 서브에이전트) |