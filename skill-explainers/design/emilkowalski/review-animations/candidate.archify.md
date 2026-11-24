# review-animations — 애니메이션 코드를 엄격한 기준표로 리뷰해 판정한다 {#overview}

`review-animations`는 에이전트가 애니메이션·모션 코드의 변경분을 10가지 기준과 즉시 차단 목록으로 검사해 수정 전후와 이유를 담은 비교 표를 내고, 최종 승인 또는 차단 판정을 내리게 하는 리뷰 스킬이다.[](source:s-fm)[](source:s-out)[](source:s-verd)

- 사용자가 `/review-animations`로 직접 부를 때만 켜지며(`disable-model-invocation: true`), 질문 없이 처음 부르면 정해진 한 줄만 답하고 대기한다.[](source:s-fm)[](source:s-init)
- 결과로 문제별 수정 표(`Before`/`After`/`Why`), 6단계 영향 순 평론, 그리고 명시적인 `Block` 또는 `Approve` 판정문이 남는다.[](source:s-out)[](source:s-verd)
- 다른 스킬과의 관계: `improve-animations`가 실행 서브에이전트의 diff를 이 스킬의 `STANDARDS.md` 기준으로 검증하고(참고), 7개 형제 스킬(`animate`, `animation-performance`, `break-ui`, `find-animation-opportunities`, `improve-animations`, `mobile-native`, `prototype`)이 모션 리뷰 대안으로 이 스킬을 가리키며, 이 스킬은 stagger 규칙에서 `choreograph`를 참고한다.
- 모션과 무관한 일반 코드 리뷰나 기능 구현·버그 수정 요청은 거절하며, `STANDARDS.md`를 읽기 전에 판정을 쓰지 않는다.[](source:s-init)[](source:s-post)

@answer scope="design/emilkowalski/review-animations · 원본 파일 2개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source s-fm title="frontmatter: name, description, disable-model-invocation" path=design/emilkowalski/review-animations/SKILL.md lines=1:5
@source s-init title="질문 없이 첫 호출 시 응답과 비모션 코드 거절" path=design/emilkowalski/review-animations/SKILL.md lines=9:17
@source s-post title="엄격한 리뷰 기조와 STANDARDS.md 먼저 읽기" path=design/emilkowalski/review-animations/SKILL.md lines=19:24
@source s-std title="10가지 타협 없는 기준" path=design/emilkowalski/review-animations/SKILL.md lines=25:48
@source s-esc title="즉시 차단 에스컬레이션 목록 14항목" path=design/emilkowalski/review-animations/SKILL.md lines=49:67
@source s-chor title="SKILL.md: choreograph 참조" path=design/emilkowalski/review-animations/SKILL.md lines=66:66
@source s-rem title="9단계 교정 우선순위" path=design/emilkowalski/review-animations/SKILL.md lines=68:81
@source s-out title="Part 1: 단일 Findings 표 형식" path=design/emilkowalski/review-animations/SKILL.md lines=82:96
@source s-verd title="Part 2: 6단계 평론과 Block/Approve 판정" path=design/emilkowalski/review-animations/SKILL.md lines=97:113
@source st-core title="STANDARDS.md: 빈도·easing·지속시간·물리성 기준" path=design/emilkowalski/review-animations/STANDARDS.md lines=1:109
@source st-perf title="STANDARDS.md: 성능·제스처·stagger·접근성·디버깅" path=design/emilkowalski/review-animations/STANDARDS.md lines=110:188
@source st-chor title="STANDARDS.md: choreograph 참조" path=design/emilkowalski/review-animations/STANDARDS.md lines=151:151
@source rel-anim-ref title="animate의 자가 점검 기준 일치 명시" path=design/emilkowalski/animate/SKILL.md lines=20:179
@source rel-anim-alt title="animate의 리뷰 대안 안내" path=design/emilkowalski/animate/SKILL.md lines=3:16
@source rel-perf title="animation-performance의 모션 리뷰 대안 안내" path=design/emilkowalski/animation-performance/SKILL.md lines=3:16
@source rel-brk title="break-ui의 모션 리뷰 대안 안내" path=design/emilkowalski/break-ui/SKILL.md lines=3:16
@source rel-find title="find-animation-opportunities의 리뷰 대안 안내" path=design/emilkowalski/find-animation-opportunities/SKILL.md lines=3:16
@source rel-imp-exe title="improve-animations의 execute 검증 위임" path=design/emilkowalski/improve-animations/SKILL.md lines=108:108
@source rel-imp-alt title="improve-animations의 단일 diff 리뷰 대안 안내" path=design/emilkowalski/improve-animations/SKILL.md lines=18:18
@source rel-mob title="mobile-native의 모션 리뷰 대안 안내" path=design/emilkowalski/mobile-native/SKILL.md lines=16:16
@source rel-proto title="prototype의 기존 UI 리뷰 대안 안내" path=design/emilkowalski/prototype/SKILL.md lines=17:17

## 어떻게 동작하나 {#flow span=12}

| 적용 상황 | 참조 파일 | 바뀌는 판단 | 출력 사례 |
| --- | --- | --- | --- |
| 질문 없이 첫 호출 | `SKILL.md` 첫 응답 절 | 다른 정보를 미리 내놓지 않고 정해진 한 문장만 답한 뒤 질문을 기다린다.[](source:s-init) | Emil Kowalski 애니메이션 철학을 기준으로 리뷰할 준비가 됐다는 한 문장만 출력한다.[](source:s-init) |
| 일반 코드·기능 작업 요청 | `SKILL.md` 소개 절 | 비모션 일반 코드 리뷰·기능 구현·무관한 버그 수정을 거절하고 일반 리뷰 스킬로 안내한다.[](source:s-init) | 애니메이션·모션 코드가 아니므로 일반 코드 리뷰 스킬을 쓰라고 안내하고 멈춘다.[](source:s-init) |
| 리뷰 착수와 수치 인용 | `SKILL.md` 기조 절, `STANDARDS.md` | 돌아가기만 하는 모션을 통과시키지 않고 기본적으로 지적 쪽으로 기울며, 판정 전에 `STANDARDS.md`를 읽어 정확한 수치를 가져다 쓴다.[](source:s-post)[](source:s-verd) | 임의의 베지어 곡선 대신 `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`과 150~250ms 예산을 인용한다.[](source:st-core) |
| 빈도·목적·키보드 위반 | `SKILL.md` 기준 1·2, 즉시 차단 목록 | 일 100회 이상이나 키보드 시작 동작·목적 없는 모션은 교정 1순위(삭제)를 제안하고 즉시 `Block` 사유로 잡는다.[](source:s-std)[](source:s-esc)[](source:s-rem) | 커맨드 팔레트 열기/닫기 전환을 더 빠르게 줄이지 않고 아예 삭제하는 행을 적는다.[](source:s-rem)[](source:st-core) |
| easing·시간·물리성 위반 | `SKILL.md` 기준 3~5, `STANDARDS.md` | UI의 `ease-in`, 근거 없는 300ms 초과(모달·서랍·시트·토스트 예외), `scale(0)`, 중심 원점 팝오버를 즉시 차단한다.[](source:s-std)[](source:s-esc) | 드롭다운 `ease-in`은 `ease-out` custom 곡선으로, 팝오버 중심 원점은 `var(--transform-origin)`으로 바꾸게 적는다.[](source:s-out) |
| 중단·GPU·접근성·일관성 | `SKILL.md` 기준 6~10, `STANDARDS.md` | 빠른 UI의 keyframe, `transition: all`·레이아웃 속성, 부모 CSS 변수 변환, reduced motion·호버 게이트 누락, 대칭 타이밍을 지적한다.[](source:s-std)[](source:s-esc) | 토스트 `@keyframes`는 CSS transition으로 바꾸고, 호버는 `@media (hover: hover) and (pointer: fine)`으로 감싸게 한다.[](source:s-rem)[](source:st-perf) |
| 보고서 작성과 최종 판정 | `SKILL.md` 필수 출력 형식 | `Before:`·`After:` 줄 목록을 금지하고 단일 표(Part 1)와 6단계 영향 순 평론(Part 2) 뒤 `Block` 또는 `Approve`를 선언한다.[](source:s-out)[](source:s-verd) | `file:line` 근거와 `STANDARDS.md` 수치를 묶은 표 아래 체감 파괴 회귀부터 접근성 순으로 적고 `Block`을 내린다.[](source:s-verd) |

이 스킬은 순서 있는 실행 파이프라인이 아니라, diff의 모든 애니메이션을 10가지 기준과 14가지 즉시 차단 조건에 대조한 뒤 9단계 교정 우선순위에 따라 대안을 고르는 원칙형 심사 기준표다.[](source:s-std)[](source:s-esc)[](source:s-rem) 승인은 기본값이 아니라 모든 조건을 통과했을 때만 얻는다.[](source:s-post)[](source:s-verd)

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 호출형(`/review-animations`). `disable-model-invocation: true`가 설정되어 모델이 자동으로 켜지 않는다.[](source:s-fm) |
| 성격 | 원칙형(리뷰 기준·즉시 차단 판정). 10가지 기준과 `STANDARDS.md` 수치로 diff를 감사해 `Before`/`After`/`Why` 표와 `Block`/`Approve`를 낸다.[](source:s-std)[](source:s-out) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `animate` {#rel-r14} | **이 스킬** | 참고 | `animate`가 완료 전 자가 점검 항목 8가지가 이 스킬의 자동 `Block` 기준과 같음을 명시한다(사용자 개입 없음).[](source:rel-anim-ref) |
| `animate` {#rel-r15} | **이 스킬** | 대안 | 역할 경계: 새 모션 구현이 아니라 기존 모션 비평·diff 리뷰는 사용자가 이 스킬을 고른다.[](source:rel-anim-alt) |
| `animation-performance` {#rel-r22} | **이 스킬** | 대안 | 역할 경계: 프레임 예산 진단 외에 모션 전반 리뷰나 존재 여부 판단은 사용자가 이 스킬을 고른다.[](source:rel-perf) |
| `break-ui` {#rel-r26} | **이 스킬** | 대안 | 역할 경계: 최악 데이터 테스트 외에 모션 리뷰는 사용자가 이 스킬을 고른다.[](source:rel-brk) |
| `find-animation-opportunities` {#rel-r30} | **이 스킬** | 대안 | 역할 경계: 새 기회 탐색이 아니라 기존 애니메이션 수정·리뷰는 사용자가 이 스킬을 고른다.[](source:rel-find) |
| `improve-animations` {#rel-r33} | **이 스킬** | 참고 | `improve-animations execute <plan>` 시 실행 서브에이전트 diff를 `../review-animations/STANDARDS.md` 기준으로 검증한다(사용자 개입 없음).[](source:rel-imp-exe)[](source:st-core) |
| `improve-animations` {#rel-r34} | **이 스킬** | 대안 | 역할 경계: 전체 감사가 아니라 단일 diff 리뷰만 필요하면 사용자가 이 스킬을 고른다.[](source:rel-imp-alt) |
| `mobile-native` {#rel-r39} | **이 스킬** | 대안 | 역할 경계: 모바일 플랫폼 수정이 아니라 모션 리뷰는 사용자가 이 스킬을 고른다.[](source:rel-mob) |
| `prototype` {#rel-r40} | **이 스킬** | 대안 | 역할 경계: 새 버전 비교가 아니라 기존 UI 리뷰는 사용자가 이 스킬을 고른다.[](source:rel-proto) |
| **이 스킬** {#rel-r45} | `choreograph` | 참고 | 즉시 차단 목록(66줄)과 `STANDARDS.md`(151줄)에서 그룹 stagger 규칙으로 `../choreograph/SKILL.md`를 참고한다(미설치, 범위 밖).[](source:s-chor)[](source:st-chor) |

@architecture id=relation-map title="review-animations와 이어지는 스킬"
| anim | animate | backend |
| perf | animation-performance | backend |
| brk | break-ui | backend |
| find | find-animation-opportunities | backend |
| imp | improve-animations | backend |
| mob | mobile-native | backend |
| proto | prototype | backend |
| self | review-animations(이 스킬) | backend |
| chor | choreograph | external |
| anim > self | 참고 · 대안 |
| perf > self | 대안 |
| brk > self | 대안 |
| find > self | 대안 |
| imp > self | 참고 · 대안 |
| mob > self | 대안 |
| proto > self | 대안 |
| self > chor | 참고 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 첫 응답, 10대 기준, 14가지 즉시 차단 목록, 9단계 교정 우선순위, 2부 출력·판정 형식을 담은 본문 113줄 | 사용자가 `/review-animations`를 호출할 때 읽는다 | 질문 없이 첫 호출, 일반 코드·기능 작업 요청, 리뷰 착수와 수치 인용, 빈도·목적·키보드 위반, easing·시간·물리성 위반, 중단·GPU·접근성·일관성, 보고서 작성과 최종 판정 |
| `STANDARDS.md` | 빈도 표, custom 곡선, 지속시간 예산, 스프링, `@starting-style`, Motion 14.2 가속, 제스처, stagger, 디버깅 수치 기준표 188줄 | `SKILL.md`가 판정 쓰기 전에 반드시 읽고 수치를 인용하라고 지시한다[](source:s-post)[](source:s-verd) | 리뷰 착수와 수치 인용, easing·시간·물리성 위반, 중단·GPU·접근성·일관성 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 질문 없이 처음 호출될 때 | 정해진 한 문장만 답하고 대기한다. | [](source:s-init) |
| 모델이 이 스킬을 자동으로 켜려 할 때 | `disable-model-invocation: true` 때문에 자동 호출되지 않는다. | [](source:s-fm) |
| 애니메이션이 아닌 일반 코드 리뷰·기능 개발·버그 수정을 요청받을 때 | 거절하고 일반 리뷰 스킬을 쓰라고 안내한다. | [](source:s-init) |
| `STANDARDS.md`를 확인하기 전일 때 | 판정을 작성하지 않고 먼저 기준 수치를 읽는다. | [](source:s-post) |
| 즉시 차단 목록 14항목 중 하나라도 걸릴 때 | `transition: all`, `scale(0)`·초기 변환 없는 순수 페이드, `ease-in`, 키보드·100+/일 모션, 근거 없는 UI 300ms 초과, 팝오버 중심 원점, 빠른 UI의 keyframe, 레이아웃 속성 애니메이션, 부모 CSS 변수 자식 변환, `prefers-reduced-motion` 누락, 미게이트 `:hover`, 대칭 입·출력 타이밍 등은 무조건 지적하고 `Block` 사유로 삼는다. | [](source:s-esc)[](source:s-verd) |
| 수정안을 제시할 때 | 먼저 삭제(1순위)→축소(2순위)→easing(3순위) 순의 9단계 교정 우선순위를 따른다. | [](source:s-rem) |
| 출력 형식을 구성할 때 | `Before:`/`After:` 줄 목록은 금지하고 단일 Markdown 표(Part 1)와 빈 계층을 뺀 6단계 영향 순 평론(Part 2)을 지킨다. | [](source:s-out)[](source:s-verd) |
| 코드만으로 모션 느낌이 불확실할 때 | `STANDARDS.md` 디버깅 절에 따라 2~5배 슬로우 모션, 프레임 단위 DevTools 검사, 실기기 확인을 권고한다. | [](source:st-perf) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- `STANDARDS.md` 수치 기준표와 예외 목록 — 맡을 개요 항목: 리뷰 착수와 수치 인용 · custom 곡선, Sonner 토스트 400ms `ease` 예외, `Motion` 14.2 기준, 속도 0.11 드래그 해제, 디버깅 4법을 개요에서 줄였다.
- 9단계 교정 우선순위와 6단계 평론 계층 — 맡을 개요 항목: 보고서 작성과 최종 판정 · 수정 제안 우선순위 9단계 전체와 `Block`/`Approve` 세부 경계를 개요에 모두 담지 않았다.

@callout level=open-question title="확인하지 못한 것"
| `../choreograph/SKILL.md`는 저장소에 설치되어 있지 않아(`범위 밖`) 그룹 stagger 등장 세부 규칙을 확인하지 못했다. |

읽은 원본: 텍스트 파일 2개(`SKILL.md`, `STANDARDS.md`). 제외: `SKILL.ko.stale.md`, `STANDARDS.ko.stale.md` 2개(낡은 번역본).
