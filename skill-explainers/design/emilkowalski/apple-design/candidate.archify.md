# apple-design — Apple 유체 인터페이스·spring·제스처 원칙을 웹으로 옮기는 스킬 {#overview}

`apple-design`은 에이전트가 Apple WWDC의 유체 인터페이스·타이포그래피·설계 원칙을 웹 플랫폼의 CSS, Pointer Events, `requestAnimationFrame`, `spring` 라이브러리 규칙으로 번역해 적용하게 하는 스킬이다.[](source:s-fm)[](source:s-init)

- 제스처 중심 UI, `spring` 애니메이션, 드래그·시트 상호작용, 반투명 재질, 타이포그래피, reduced motion 또는 Apple식 설계 원칙이 필요할 때 켜진다. 질문 없이 처음 불리면 고정 문구 한 줄만 답하고 기다린다.[](source:s-fm)[](source:s-init)
- 결과로 `damping ratio`·`response`, 모멘텀 투영, `rubber-banding`(끝에서 넘어갈수록 커지는 저항), `backdrop-filter`, 접근성 미디어 쿼리, 타이포그래피 규칙을 반영한 웹 UI 구현이나 리뷰가 나온다.[](source:s-spring)[](source:s-proj)[](source:s-rubber)[](source:s-mat)[](source:s-a11y)[](source:s-type)
- `animation-performance`에서 합성기 친화 속성(`transform`·`opacity`)과 `will-change` 상세 기준을 참조한다(참고).[](source:s-frame)[](source:rel-perf)
- 하지 않는 것: 제스처 모션에 CSS transition이나 `@keyframes`를 쓰지 않고, 밝은 반투명 층 위에 또 다른 밝은 반투명 층을 겹치지 않으며, 모션 없이 입력을 잠그거나 경계에서 딱 멈추지 않는다.[](source:s-inter)[](source:s-rubber)[](source:s-mat)

@answer scope="design/emilkowalski/apple-design · 원본 파일 1개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source s-fm title="frontmatter: name과 description" path=design/emilkowalski/apple-design/SKILL.md lines=1:4
@source s-init title="초기 응답과 핵심 아이디어" path=design/emilkowalski/apple-design/SKILL.md lines=8:27
@source s-resp title="1장: 즉각 반응과 지연 제거" path=design/emilkowalski/apple-design/SKILL.md lines=28:42
@source s-manip title="2장: 1:1 직접 조작" path=design/emilkowalski/apple-design/SKILL.md lines=44:59
@source s-inter title="3장: 중간에 끊을 수 있는 모션" path=design/emilkowalski/apple-design/SKILL.md lines=61:71
@source s-spring title="4장: spring과 damping·response 기준" path=design/emilkowalski/apple-design/SKILL.md lines=73:106
@source s-vel title="5장: 릴리즈 속도 인계" path=design/emilkowalski/apple-design/SKILL.md lines=108:118
@source s-proj title="6장: 모멘텀 착지점 투영" path=design/emilkowalski/apple-design/SKILL.md lines=120:139
@source s-spatial title="7·8장: 공간 일관성과 방향 힌트" path=design/emilkowalski/apple-design/SKILL.md lines=141:150
@source s-rubber title="9장: rubber-banding 경계 저항" path=design/emilkowalski/apple-design/SKILL.md lines=152:161
@source s-gesture title="10장: 제스처 판별 세부 체크리스트" path=design/emilkowalski/apple-design/SKILL.md lines=163:168
@source s-frame title="11장: 프레임 부드러움과 성능 스킬 참조" path=design/emilkowalski/apple-design/SKILL.md lines=170:176
@source s-mat title="12장: 반투명 재질과 깊이" path=design/emilkowalski/apple-design/SKILL.md lines=177:195
@source s-multi title="13장: 모션·소리·햅틱 동시성" path=design/emilkowalski/apple-design/SKILL.md lines=197:204
@source s-a11y title="14장: 모션·투명도·대비 접근성" path=design/emilkowalski/apple-design/SKILL.md lines=205:222
@source s-type title="15장: 광학 크기·자간·행간" path=design/emilkowalski/apple-design/SKILL.md lines=224:243
@source s-found title="16장: 8대 설계 원칙과 전술 규칙" path=design/emilkowalski/apple-design/SKILL.md lines=245:264
@source s-proc title="17장: 인터랙티브 프로토타입과 검토 절차" path=design/emilkowalski/apple-design/SKILL.md lines=265:269
@source s-ref title="빠른 참조 수치표 13행" path=design/emilkowalski/apple-design/SKILL.md lines=271:287
@source rel-perf title="animation-performance frontmatter" path=design/emilkowalski/animation-performance/SKILL.md lines=1:5
@source rel-perf-will title="animation-performance의 will-change 기준" path=design/emilkowalski/animation-performance/SKILL.md lines=160:173

## 어떻게 동작하나 {#flow span=12}

원문은 고정된 작업 순서 대신 17개 주제별 웹 구현 원칙과 빠른 참조 수치표를 둔다. 요청이 닿는 주제의 판단 기준을 적용한다.[](source:s-init)[](source:s-ref)

| 적용 상황 | 참조 파일 | 바뀌는 판단 | 출력 사례 |
| --- | --- | --- | --- |
| 질문 없는 초기 호출 | `SKILL.md` (`Initial Response`) | 다른 안내나 원칙을 미리 열지 않고 고정 문구 한 줄만 출력한 뒤 질문이 올 때까지 멈춘다. | Apple WWDC 기반 준비 문구 한 줄만 출력[](source:s-init) |
| 버튼 누름과 즉각 반응 | `SKILL.md` (`1. Response`) | 릴리즈(`click`)까지 기다리지 않고 `pointerdown`·`:active`에서 즉시 반응하며, 입력 경로의 불필요한 debounce·300ms 지연을 없앤다. | `.button:active`에 `scale(0.97)` 100ms `ease-out`[](source:s-resp) |
| 드래그와 직접 조작 | `SKILL.md` (`2. Direct manipulation`, `10. Gesture design`) | 요소 중앙으로 스냅하지 않고 잡은 위치 오프셋을 지키며, `setPointerCapture`와 약 `10px` 임계값·병렬 인식으로 1:1 추적한다. | `grabOffset` 유지 및 최근 `pointermove` 속도·위치 기록[](source:s-manip)[](source:s-gesture) |
| 중간에 끊을 수 있는 `spring` | `SKILL.md` (`3. Interruptibility`, `4. Behavior over animation`) | 제스처 모션에 CSS transition·`@keyframes`를 쓰지 않고, 현재 화면 위치와 속도를 이어받는 X·Y 독립 `spring`으로 역전을 부드럽게 잇는다. | 기본 `bounce: 0`, `duration: 0.4` / 튕김 뒤 `bounce: 0.2`[](source:s-inter)[](source:s-spring) |
| 손을 뗄 때 속도와 모멘텀 | `SKILL.md` (`5. Velocity handoff`, `6. Momentum projection`) | 릴리즈 지점 기준이 아니라 지수 감쇠 투영(`d ≈ 0.998`)으로 예상 착지점을 계산해 가장 가까운 스냅 지점을 고르고 릴리즈 속도를 인계한다. | `currentPosition + project(releaseVelocity)` 기준 스냅[](source:s-vel)[](source:s-proj) |
| 경계 저항과 공간 일관성 | `SKILL.md` (`7. Spatial consistency`, `8. Hint`, `9. Rubber-banding`) | 들어온 방향으로 나가고 트리거 기준 `transform-origin`을 맞추며, 경계를 넘는 드래그는 딱 막지 않고 점진적 저항(`constant = 0.55`)을 건다. | `rubberband(overshoot, dimension, 0.55)` 감쇠 계산[](source:s-spatial)[](source:s-rubber) |
| 반투명 재질과 다중 감각 | `SKILL.md` (`11. Frame`, `12. Materials`, `13. Multimodal`) | 불투명 막 대신 `backdrop-filter` 위계로 구분하고, `will-change`와 속성 기준은 `animation-performance`를 보며, 소리·햅틱은 시각 변화와 같은 프레임에 낸다. | `blur(20px) saturate(180%)`와 밝은 상단 1px 테두리[](source:s-frame)[](source:s-mat)[](source:s-multi) |
| 접근성과 타이포·설계 원칙 | `SKILL.md` (`14. Reduced motion`~`17. Process`) | 모션·투명도·대비 3가지 미디어 쿼리에 각각 대응하고, 글자 크기마다 자간·행간을 반비례 조정하며 8대 원칙·인터랙티브 프로토타이핑을 따른다. | 대형 제목 `letter-spacing: -0.02em`, `line-height: 1.05`, `rem` 여백[](source:s-a11y)[](source:s-type)[](source:s-found)[](source:s-proc) |

이 원칙들의 공통 축은 화면의 현재 값·사용자 속도·예상 경로·즉시 역전을 끊김 없이 잇는 데 있다.[](source:s-init)[](source:s-inter) 또한 8대 설계 원칙(목적·주체성·책임·친숙함·유연성·단순함·완성도·즐거움을 위한 연출)과 정밀 수치표가 시각과 상호작용을 따로 떼지 않게 묶어 준다.[](source:s-found)[](source:s-proc)[](source:s-ref)

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(description). 제스처 기반 UI, `spring`, 드래그·시트, 반투명 재질, 타이포그래피, reduced motion 또는 Apple식 설계 원칙 요청에서 켜진다. 호출 제한 필드는 frontmatter에 없다.[](source:s-fm) |
| 성격 | Apple의 유체 인터페이스·타이포그래피·8대 설계 원칙을 웹 CSS·Pointer Events·`spring` 수치 규칙으로 번역해 적용하는 원칙형 스킬이다.[](source:s-init)[](source:s-ref) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#rel-r24} | `animation-performance` | 참고 | 11장에서 `transform`·`opacity` 중심의 합성기 친화 속성과 측정 후 `will-change` 적용의 상세 기준을 `../animation-performance/SKILL.md`에서 참조한다(사용자 개입 없음).[](source:s-frame)[](source:rel-perf)[](source:rel-perf-will) |

@architecture id=relation-map title="apple-design과 이어지는 스킬"
| self | apple-design(이 스킬) | backend |
| perf | animation-performance | backend |
| self > perf | 참고 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 초기 응답, 17개 원칙(모션·제스처·재질·다중 감각·접근성·타이포·8대 원칙·프로세스), 빠른 참조 표 13행을 담은 유일한 파일 | 스킬이 켜질 때 읽는다. | 질문 없는 초기 호출, 버튼 누름과 즉각 반응, 드래그와 직접 조작, 중간에 끊을 수 있는 `spring`, 손을 뗄 때 속도와 모멘텀, 경계 저항과 공간 일관성, 반투명 재질과 다중 감각, 접근성과 타이포·설계 원칙 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 구체적 질문 없이 스킬이 처음 켜진 경우 | 고정 문구 한 줄만 출력하고 질문이 올 때까지 멈춘다. | [](source:s-init) |
| 전환 중 입력 처리와 시작 값 | 전환 도중 입력을 잠그지 않으며, 중단 시 목표 값이 아니라 현재 화면 표시 값에서 새 애니메이션을 시작한다. | [](source:s-inter) |
| 제스처 구동 모션 구현과 2D `spring` | CSS transition·`@keyframes` 대신 `spring`을 쓰고, 2D 이동은 X축·Y축 독립 `spring`으로 분리한다. | [](source:s-inter) |
| `spring`의 `bounce` 허용 범위 | 기본은 `damping 1.0`(`bounce: 0`)을 쓰고, `damping ~0.8` 바운스는 드래그·튕기기처럼 모멘텀이 동반된 제스처에만 쓴다. | [](source:s-spring) |
| 모멘텀 투영 공식 선택 | 물리 교과서의 `v²/(2·decel)` 대신 Apple의 지수 감쇠 투영 공식을 사용한다. | [](source:s-proj) |
| 반투명 재질 적층과 대비 | 밝은 반투명 층 위에 또 다른 밝은 반투명 층을 겹치지 않는다(금지). 흐린 배경 위 회색 텍스트 대신 높은 대비와 약간 두꺼운 글꼴·자간을 쓴다. | [](source:s-mat) |
| 다중 감각 피드백 조건 | 소리·햅틱·시각 피드백은 같은 프레임에 맞춰 의미 있는 순간에만 발화하며, 확인 대화상자는 돌이킬 수 없는 파괴적 동작에만 드물게 쓴다. | [](source:s-multi)[](source:s-found) |
| 접근성 3대 신호와 위험 모션 | `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast: more`에 모두 대응하고, 전체 화면 이동 배경이나 약 `0.2 Hz` 느린 왕복 진동은 피한다. | [](source:s-a11y) |
| 타이포그래피 자간·크기 설정 | 모든 글자 크기에 고정 `letter-spacing`을 쓰지 않고 크기에 맞춰 조정하며, `rem`·`em` 단위로 Dynamic Type 확대를 따른다. | [](source:s-type) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 빠른 참조 수치표와 `spring`·투영·저항 수식 — 손을 뗄 때 속도와 모멘텀 · PiP·회전·시트별 `damping`·`response`, 상대 속도 정규화 식, `project()`·`rubberband()` 구현을 개요에서 요약했다.
- 반투명 재질·접근성 3종·타이포그래피 CSS 규칙 — 반투명 재질과 다중 감각 · 모달 스크림 유무, 스크롤 가장자리 마스크, 3가지 미디어 쿼리 CSS, 자간·행간 규칙 세부를 뺐다.
- WWDC 2026 8대 설계 원칙과 전술 규칙 — 접근성과 타이포·설계 원칙 · 8가지 원칙별 세부 지침과 4가지 피드백·길찾기·라벨링 규칙을 개요에서 생략했다.

@callout level=open-question title="확인하지 못한 것"
| `SKILL.md` 본문의 `WWDC 2026` 표기는 원문 연도 표기를 그대로 옮겼으나, 원문 출처 URL이나 외부 문서는 이 저장소에 없어 확인하지 못했다.[](source:s-found) |
| Web Vibration API·`backdrop-filter` 등의 브라우저별 프레임 지연 및 렌더링 성능은 실행해 측정하지 않았다. |

읽은 원본: 텍스트 파일 1개. 제외: `SKILL.ko.stale.md`(낡은 번역본이라 읽지 않음).
