# apple-design 스킬은 에이전트를 어떻게 바꾸나 {#apple-design-skill}

`apple-design`을 쓰면 에이전트는 웹 UI의 움직임을 손가락에 붙여 만든다. 누르는 순간 반응하고, 움직이는 중에도 잡아서 되돌릴 수 있게 하며, 손을 뗀 속도를 spring 애니메이션에 그대로 넘긴다. Apple WWDC 발표의 원칙을 CSS, Pointer Events, `requestAnimationFrame`, Motion 같은 spring 라이브러리로 옮긴 원칙형 스킬이다. 절차나 산출물 파일은 없고, 규칙과 기준값을 준다.[](source:ad-thru)

- 켜지는 때: 제스처 UI, spring 애니메이션, drag·swipe·sheet, 반투명 재질, 글자 간격, reduced-motion을 만들거나 리뷰할 때다. 호출 제한 필드는 없다.[](source:ad-fm)
- 강제하는 것: 전환 중에도 입력을 막지 않는다. 새 애니메이션은 화면에 보이는 현재 값에서 시작한다. 제스처로 움직이는 것에는 CSS transition과 `@keyframes`를 쓰지 않는다.[](source:ad-intr)
- 기준값: 기본 spring은 damping `1.0`이고, 튕김(damping 약 `0.8`)은 손으로 던진 동작 뒤에만 쓴다.[](source:ad-spring)
- 사람 개입: 질문 없이 스킬만 부르면 에이전트는 준비됐다는 한 문장만 답하고 사용자의 질문을 기다린다.[](source:ad-init)

@answer scope="design/emilkowalski/apple-design · 원본 텍스트 1개(SKILL.md 23,036B) · 커밋 4e3fc89 · 번역본 제외 · 원칙형이라 실행 절차 없음 · 지시상 동작"
@meta locale=ko
@source ad-fm title="design/emilkowalski/apple-design/SKILL.md · 23036B · frontmatter" path=design/emilkowalski/apple-design/SKILL.md lines=1:4
@source ad-init title="SKILL.md · 첫 응답 규칙" path=design/emilkowalski/apple-design/SKILL.md lines=8:14
@source ad-thru title="SKILL.md · 출처와 관통하는 원칙" path=design/emilkowalski/apple-design/SKILL.md lines=16:18
@source ad-core title="SKILL.md · 핵심 생각과 네 가지 필요" path=design/emilkowalski/apple-design/SKILL.md lines=20:26
@source ad-resp title="SKILL.md · 1. Response" path=design/emilkowalski/apple-design/SKILL.md lines=28:42
@source ad-direct title="SKILL.md · 2. Direct manipulation" path=design/emilkowalski/apple-design/SKILL.md lines=44:59
@source ad-intr title="SKILL.md · 3. Interruptibility" path=design/emilkowalski/apple-design/SKILL.md lines=61:71
@source ad-spring title="SKILL.md · 4. spring 파라미터와 기본값" path=design/emilkowalski/apple-design/SKILL.md lines=73:86
@source ad-ships title="SKILL.md · 4. Apple 출하값 표와 웹 대응" path=design/emilkowalski/apple-design/SKILL.md lines=88:96
@source ad-motion title="SKILL.md · 4. Motion 예시 코드" path=design/emilkowalski/apple-design/SKILL.md lines=98:106
@source ad-vel title="SKILL.md · 5. Velocity handoff" path=design/emilkowalski/apple-design/SKILL.md lines=108:118
@source ad-proj title="SKILL.md · 6. Momentum projection" path=design/emilkowalski/apple-design/SKILL.md lines=120:139
@source ad-spatial title="SKILL.md · 7. Spatial consistency" path=design/emilkowalski/apple-design/SKILL.md lines=141:147
@source ad-hint title="SKILL.md · 8. 제스처 방향 암시" path=design/emilkowalski/apple-design/SKILL.md lines=149:151
@source ad-rubber title="SKILL.md · 9. Rubber-banding" path=design/emilkowalski/apple-design/SKILL.md lines=153:162
@source ad-gest title="SKILL.md · 10. 제스처 세부 점검표" path=design/emilkowalski/apple-design/SKILL.md lines=164:169
@source ad-frame title="SKILL.md · 11. 프레임 단위 매끄러움" path=design/emilkowalski/apple-design/SKILL.md lines=171:177
@source ad-mat title="SKILL.md · 12. Materials & depth" path=design/emilkowalski/apple-design/SKILL.md lines=179:197
@source ad-multi title="SKILL.md · 13. 움직임·소리·햅틱" path=design/emilkowalski/apple-design/SKILL.md lines=199:205
@source ad-a11y title="SKILL.md · 14. Reduced motion과 접근성" path=design/emilkowalski/apple-design/SKILL.md lines=207:224
@source ad-type title="SKILL.md · 15. Typography" path=design/emilkowalski/apple-design/SKILL.md lines=226:245
@source ad-princ title="SKILL.md · 16. 여덟 가지 디자인 원칙" path=design/emilkowalski/apple-design/SKILL.md lines=247:258
@source ad-tact title="SKILL.md · 16. 원칙을 받치는 전술 규칙" path=design/emilkowalski/apple-design/SKILL.md lines=260:265
@source ad-proc title="SKILL.md · 17. Process" path=design/emilkowalski/apple-design/SKILL.md lines=267:271
@source ad-quick title="SKILL.md · Quick Reference 표" path=design/emilkowalski/apple-design/SKILL.md lines=273:290
@source ed-fm title="design/emilkowalski/emil-design-eng/SKILL.md · r47 확인용 description" path=design/emilkowalski/emil-design-eng/SKILL.md lines=1:4

## 언제 켜지고, 언제 쓰면 안 되나 {#trigger}

@code source=ad-fm language=yaml

이 스킬에는 `disable-model-invocation` 같은 호출 제한 필드가 없다. 그래서 모델이 `description`을 참고해 스스로 켤 수 있다.[](source:ad-fm) 판정: `description`은 판단을 돕는 설명일 뿐이다. 여기 나온 단어가 요청에 있다고 반드시 켜지는 것은 아니다.

`description`이 드는 작업은 이렇다.[](source:ad-fm)

| 작업 | 예 |
| --- | --- |
| 제스처로 움직이는 UI | drag, swipe, sheet, 관성(momentum), 중간에 끊을 수 있는 전환 |
| spring 애니메이션 | damping과 response로 움직임 정하기 |
| 재질과 깊이 | 반투명 재질, 계층감 |
| 글자 | optical sizing, tracking(글자 간격), leading(줄 간격) |
| 접근성 | reduced-motion |
| 디자인 기초 | 피드백, 공간 일관성, 절제 |

사람이 개입하는 곳은 한 군데다. 사용자가 구체적인 질문 없이 스킬만 부르면, 에이전트는 아래 한 문장만 답한다. 그리고 사용자가 질문할 때까지 다른 정보를 주지 않는다.[](source:ad-init)

```text title="첫 응답 문장(원문 그대로)"
I'm ready to help you build fluid, Apple-style interfaces on the web, my knowledge comes from Apple's WWDC design talks, translated for the web.
```

종료 조건이나 완료 판정은 `원문에 명시 없음`이다. 규칙과 기준값을 줄 뿐, 언제 일이 끝났다고 볼지는 정하지 않는다.

**쓰면 안 되는 경우**를 원문이 직접 적지는 않았다(`원문에 명시 없음`). 판정: 대상이 웹 플랫폼이다. 근거는 CSS, Pointer Events, `requestAnimationFrame`, Motion으로 옮긴다는 머리말이다.[](source:ad-thru)

그래서 네이티브 iOS 코드나 React Native에는 그대로 맞지 않을 수 있다. 같은 저자의 `write-swift`, `animate-expo`가 그쪽을 다루지만, 이 스킬은 두 스킬을 부르지 않는다.

## 무엇을 강제하나: 움직임 규칙 {#motion-rules}

원문의 관통 원칙은 이렇다. 움직임은 화면의 현재 값에서 시작하고, 사용자의 속도를 이어받고, 관성을 앞으로 투영하고, 언제든 잡아서 되돌릴 수 있어야 한다. spring이 이 네 가지를 자연스럽게 해 주는 도구라고 본다.[](source:ad-thru) 원문은 이 규칙들이 안전·이해·성취·즐거움이라는 네 가지 필요를 위한 것이라고 한다.[](source:ad-core)

원문은 중간 끊기(interruptibility)를 "가장 중요한 원칙"이라고 부른다.[](source:ad-intr) 아래 표의 강도는 원문 표현을 따랐다. "Never"·"must"·"Always"는 의무, "Reach for"·"Start"는 권고로 읽었다.

| 규칙 | 강도 | 원문 근거 |
| --- | --- | --- |
| 손가락을 뗄 때가 아니라 누르는 순간(pointer-down) 반응한다 | 의무형 문장 | 1. Response[](source:ad-resp) |
| debounce, 인위적 타이머, transition 대기, 약 300ms 탭 지연을 점검한다. 입력 경로의 불필요한 지연은 퇴보로 본다 | 점검 지시 | 1. Response[](source:ad-resp) |
| drag·slider·drawer는 제스처 내내 포인터와 1:1로 UI를 갱신한다. 끝날 때만 움직이면 안 된다 | {bad:never} | 1. Response[](source:ad-resp) |
| drag 대상은 손가락에 붙고, 잡은 위치의 오프셋을 지킨다. `setPointerCapture`를 쓰고, 놓을 때 쓸 속도를 위해 최근 `pointermove` 몇 개의 위치·시간 기록을 둔다 | {bad:must} | 2. Direct manipulation[](source:ad-direct) |
| 전환 중에 입력을 막지 않는다 | {bad:Never} | 3. Interruptibility[](source:ad-intr) |
| 새 애니메이션은 목표 값이 아니라 화면에 보이는 현재 값(presentation value)에서 시작한다 | {bad:Always} | 3. Interruptibility[](source:ad-intr) |
| 제스처로 움직이는 것에는 CSS transition과 `@keyframes`를 쓰지 않는다 | 금지 권고(Avoid) | 3. Interruptibility[](source:ad-intr) |
| 제스처 방향이 바뀌면 속도를 끊지 않고 섞는다. 현재 속도에서 목표를 바꿔 주는 spring 라이브러리를 고른다 | 권고 | 3. Interruptibility[](source:ad-intr) |
| 2D 움직임은 X와 Y spring 두 개로 나눈다 | 권고 | 3. Interruptibility[](source:ad-intr) |
| 사용자가 만질 수 있는 것에는 고정 길이 애니메이션 대신 spring을 쓴다 | 권고 | 4. Behavior over animation[](source:ad-spring) |
| 손을 뗄 때 손가락 속도를 spring의 초기 속도로 넘긴다 | {bad:must} | 5. Velocity handoff[](source:ad-vel) |
| 놓은 지점이 아니라 속도로 투영한 도착 지점에서 가장 가까운 snap 지점을 고른다 | 금지 권고(Don't) | 6. Momentum projection[](source:ad-proj) |
| 들어온 길로 나간다. 오른쪽에서 들어온 패널은 오른쪽으로 닫힌다 | 권고 | 7. Spatial consistency[](source:ad-spatial) |
| 메뉴·popover·sheet는 자기를 연 요소에서 나온다. `transform-origin`을 트리거 쪽에 둔다 | 권고 | 7. Spatial consistency[](source:ad-spatial) |
| 되돌릴 수 있는 전환은 두 방향 easing을 거울처럼 맞춘다(역 cubic-bézier 제어점) | 권고 | 7. Spatial consistency[](source:ad-spatial) |
| 중간 프레임이 도착할 곳을 미리 가리킨다. 예: Control Center 모듈이 손가락 쪽으로 커진다 | 권고 | 8. Hint[](source:ad-hint) |
| 가장자리에서 딱 멈추지 않고, 넘어갈수록 저항을 키운다(rubber-banding) | 권고 | 9. Rubber-banding[](source:ad-rubber) |
| 가능한 제스처를 첫 움직임부터 함께 감지하고, 의도가 분명해지면 나머지를 취소한다. 최종 상태만 알려 주는 인식기(`swipeleft` 같은 이벤트)는 피한다 | 권고 | 10. 점검표[](source:ad-gest) |
| 더블탭 감지는 단일 탭을 늦추므로, 더블탭이 정말 있는 곳에서만 쓴다 | 권고 | 10. 점검표[](source:ad-gest) |
| 프레임당 위치 변화를 지각 한계 아래로 둔다. 아주 빠른 움직임에는 은은한 motion blur나 늘림을 준다. `transform`과 `opacity`만 애니메이션하고, 곧 움직일 곳에 `will-change`를 단다 | 권고 | 11. 프레임[](source:ad-frame) |

원문이 직접 든 적용 전후 사례다. 에이전트가 리뷰할 때 이런 차이를 짚게 된다.

| 상황 | 바꾸기 전 | 바꾼 뒤 |
| --- | --- | --- |
| 닫히는 모달을 사용자가 다시 잡음 | 다 닫힌 뒤 다시 열린다 {bad:끊김} | 잡은 순간부터 손가락을 따라온다 {good:연속}[](source:ad-intr) |
| 카드를 잡음 | 요소 중심이 손가락으로 튄다 | 잡은 위치 그대로 따라온다[](source:ad-direct) |
| 버튼 누름 | `click`이나 손을 뗀 뒤에 반응한다 | `:active`에서 `scale(0.97)`로 바로 반응한다[](source:ad-resp) |
| 방향을 바꾼 drag | 애니메이션을 갈아 끼워 속도가 끊긴다. 원문은 이를 "brick wall"이라 부른다 | 속도를 이어받는 spring으로 목표만 바꾼다[](source:ad-intr) |
| 튕김(overshoot) | 그냥 나타난 메뉴가 튕긴다 {bad:어색} | 손으로 던진 카드만 튕긴다 {good:자연}[](source:ad-spring) |
| 패널 닫기 | 오른쪽에서 들어와 아래로 나간다 | 오른쪽으로 들어와 오른쪽으로 나간다[](source:ad-spatial) |
| 목록 끝 | 딱 멈춰 얼어붙은 것처럼 보인다 | 점점 무거워지며 늘어난다[](source:ad-rubber) |

## 손을 떼는 순간 무엇을 하고, 기준값은 무엇인가 {#release-numbers}

원문은 flick(빠르게 튕기는 동작)을 놓는 순간의 처리 순서를 코드로 보여 준다. 에이전트는 먼저 도착 지점을 투영하고, 그 근처의 snap 지점을 고른 뒤, 속도를 spring에 넘긴다.[](source:ad-proj)

@workflow id=release-flow title="손을 뗀 뒤의 처리"
| rf-vel | 놓을 때 속도 | external | source:ad-direct |
| rf-proj | 도착 지점 투영 | backend | source:ad-proj |
| rf-snap | 가까운 snap 지점 | backend | source:ad-proj |
| rf-spring | 속도 넘긴 spring | backend | source:ad-vel |
| rf-vel > rf-proj | |
| rf-proj > rf-snap | |
| rf-snap > rf-spring | velocity | emphasis |

@steps id=release-steps
| rf-vel | 놓을 때 속도 | drag 중에 쌓아 둔 최근 `pointermove` 위치·시간 기록으로 놓는 순간의 속도를 구한다.[](source:ad-direct) | release-flow | rf-vel |
| rf-proj | 도착 지점 투영 | `current + (v/1000)·d/(1−d)`로 멈출 위치를 구한다. d는 감속률이다. 원문은 이것이 Apple 샘플 코드의 식이고, 교과서 식 `v²/(2·decel)`은 Apple이 쓰지 않는다고 적는다.[](source:ad-proj) | release-flow | rf-proj |
| rf-snap | 가까운 snap 지점 | 놓은 지점이 아니라 투영한 지점에서 가장 가까운 snap 지점을 목표로 고른다. 원문은 Vaul, Embla 같은 bottom sheet·carousel이 이렇게 한다고 든다.[](source:ad-proj) | release-flow | rf-snap |
| rf-spring | 속도 넘긴 spring | 놓은 속도를 spring의 초기 속도로 넘겨 drag와 애니메이션 사이에 이음매가 없게 한다. Motion과 Framer Motion은 px/s 속도를 `velocity` 옵션으로 바로 받는다.[](source:ad-vel) | release-flow | rf-spring |

Quick Reference 표에는 본문에 없는 행이 하나 있다. 되돌릴지 확정할지는 놓는 순간의 위치가 아니라 속도의 **부호**로 정하라는 행이다.[](source:ad-quick) 위 그림에는 본문 코드가 보여 주는 순서만 그렸다.

spring은 두 값으로 정한다. damping ratio는 튕김을 정한다. `1.0`은 튕김 없이 멈추고, `1.0`보다 작을수록 더 튕긴다. response는 목표에 닿는 빠르기(초)다.

원문은 response가 duration이 아니라고 강조한다. spring에는 정해진 길이가 없고, 멈추는 시간은 두 값에서 나온다.[](source:ad-spring)

| 값 | 성격 | 적용 조건과 보충 |
| --- | --- | --- |
| damping `1.0` | 권고 기본값 ("Start most UI at") | 대부분의 UI. 집에서 쓰는 기본 스타일로도 권한다[](source:ad-spring)[](source:ad-ships) |
| damping 약 `0.8` | 조건부 권고 ("only when") | 제스처 자체가 관성을 실었을 때만. 예: flick, 던지기, drag 놓기[](source:ad-spring) |
| 이동·재배치(PiP) damping `1.0`, response `0.4` | Apple 출하값(참고표) | 원문이 "Concrete values Apple ships"로 든 값[](source:ad-ships) |
| 회전 damping `0.8`, response `0.4` | Apple 출하값(참고표) | 같은 표[](source:ad-ships) |
| drawer·sheet damping `0.8`, response `0.3` | Apple 출하값(참고표) | 같은 표[](source:ad-ships) |
| response `0.3`~`0.4`초 | 요약표 값 | Quick Reference의 기본·관성 spring 둘 다[](source:ad-quick) |
| Motion `bounce: 0, duration: 0.4` / `bounce: 0.2, duration: 0.4` | 예시 코드 | 앞은 기본, 뒤는 flick 뒤에만. Motion의 `bounce`+`duration`이 damping+response와 가깝게 대응한다고 한다[](source:ad-ships)[](source:ad-motion) |
| 상대 속도 `gestureVelocity / (target − current)` | 공식. 일부 spring API에만 | 예: `y=50`에서 `y=150`(100px 남음), 손가락 50px/s → `50 / 100 = 0.5`[](source:ad-vel) |
| 감속률 `0.998` / `0.99` | 함수 기본값 / 선택 | `0.998`은 일반 스크롤 느낌, `0.99`는 더 빠르게 멈춤[](source:ad-proj) |
| rubberband 상수 `0.55` | 예시 함수의 기본값 | `(overshoot·dimension·c) / (dimension + c·\|overshoot\|)`[](source:ad-rubber) |
| 약 10px 이동 임계(hysteresis) | 권고 | drag·swipe는 이만큼 움직인 뒤 방향을 확정한다. 탭은 대상 둘레에 약 10px 여유를 두고, 벗어났다 돌아오면 취소·복귀할 수 있게 한다[](source:ad-gest) |
| `scale(0.97)`, `100ms ease-out` | 예시 코드 | 버튼 `:active` 반응[](source:ad-resp) |
| 약 300ms | 점검 대상 | 탭 지연. 없앨 대상으로 든다[](source:ad-resp) |

판정: Apple 출하값 표의 drawer·회전은 damping `0.8`이지만, 기본값 규칙은 관성이 있을 때만 `0.8`을 쓰라고 한다. 두 문장은 충돌하지 않는다. drawer·회전은 손으로 끄는 동작이라 관성 조건에 든다고 읽힌다. 근거는 기본값 문단과 출하값 표다.[](source:ad-spring)[](source:ad-ships)

## 움직임 밖에서 무엇을 정하나: 재질·접근성·글자·원칙 {#craft-rules}

| 영역 | 에이전트가 하는 일 | 원문 근거 |
| --- | --- | --- |
| 반투명 재질 | nav·toolbar·sheet를 `backdrop-filter: blur()`와 반투명 배경의 층으로 만들고, 내용이 그 아래로 스크롤되게 한다 | 12[](source:ad-mat) |
| 재질 무게 | 어둡고 무거운 재질은 구조 영역(sidebar), 가벼운 재질은 상호작용 요소(button)에 쓴다. 밝은 반투명 면을 다른 반투명 면 위에 겹치지 않는다 {bad:Never} | 12[](source:ad-mat) |
| 크기와 두께 | 큰 면일수록 blur와 그림자를 강하게 한다. 복잡한 배경 위에서는 그림자를 무겁게, 단색 배경 위에서는 가볍게 한다 | 12[](source:ad-mat) |
| 집중과 흐름 | 모달 작업은 scrim(배경 어둡게 하는 막)과 함께 뒤를 밀어낸다. 흐름을 막지 않는 패널은 scrim 없이 반투명과 오프셋만 쓴다. 겹친 sheet는 부모를 단계적으로 어둡게 한다 | 12[](source:ad-mat) |
| 반투명 위 글자 | 평평한 회색 글자 대신 대비를 높이고 굵기를 조금 올리고 글자 간격을 조금 벌린다. 색은 반투명 전경이 아니라 불투명 층에 둔다 | 12[](source:ad-mat) |
| 경계 | sticky header 아래 1px 선 대신, 떠 있는 UI가 내용과 실제로 겹치는 곳에만 작은 blur·gradient mask를 준다 | 12[](source:ad-mat) |
| 나타나기 | 유리 재질은 opacity만 바꾸지 않고 blur 반경과 scale을 함께 애니메이션한다 | 12[](source:ad-mat) |
| 소리·햅틱 | 인과(실제 원인 사건에서 울림), 조화(화면·소리·햅틱이 같은 프레임), 쓸모(성공·오류·확정·snap 같은 순간에만) 세 규칙을 지킨다 | 13[](source:ad-multi) |
| `prefers-reduced-motion: reduce` | 슬라이드·spring·parallax를 짧은 opacity cross-fade나 정적 전환으로 바꾸고, 튕김을 뺀다. 이해를 돕는 opacity·색 변화는 남긴다 | 14[](source:ad-a11y) |
| `prefers-reduced-transparency: reduce` | 배경 불투명도를 올리고 blur를 뺀다 | 14[](source:ad-a11y) |
| `prefers-contrast: more` | 거의 불투명한 배경에 대비가 뚜렷한 테두리를 준다 | 14[](source:ad-a11y) |
| 피할 움직임 | 화면 전체가 움직이는 배경, 0.2 Hz 근처(5초에 한 번)의 느린 반복, 갑작스러운 밝기 변화를 피한다. 큰 물체는 이동 중 반투명하게, 큰 면은 크게 옮길 때 사라졌다 자리 잡은 뒤 나타나게 한다 | 14[](source:ad-a11y) |
| tracking | 크기마다 다르게 준다. 큰 제목은 음수, 작은 글자는 약간 양수, 본문은 `0` 근처다. 모든 크기에 한 값을 쓰지 않는다 {bad:never} | 15[](source:ad-type) |
| leading | 크기와 반대로 간다. 큰 제목은 좁게, 본문은 넓게 한다. 위아래로 긴 문자는 넓히고, 정보가 빽빽한 UI는 좁힌다 | 15[](source:ad-type) |
| 위계 | 크기만 쓰지 않고 굵기·크기·leading을 한 벌로 쓴다. 강조는 굵기로 한다 | 15[](source:ad-type) |
| 글자 크기 설정 | 사용자 설정(Dynamic Type)을 존중해 간격을 `rem`·`em`으로 잡는다. 기본은 시스템 글꼴이고, 바꿀 이유가 있을 때만 다른 글꼴을 쓴다 | 15[](source:ad-type) |

reduced-motion 예시 코드는 `.sheet`에 `transition: opacity 200ms ease`와 `transform: none !important`를 준다.[](source:ad-a11y) 글자 예시 코드는 큰 제목에 `line-height: 1.05`, `letter-spacing: -0.02em`, `font-size: clamp(2rem, 5vw, 4rem)`을 주고, 본문은 `100%/1.5 system-ui`다.[](source:ad-type) toolbar 예시는 `rgba(255, 255, 255, 0.6)` 배경과 `blur(20px) saturate(180%)`다.[](source:ad-mat) 모두 예시 코드의 값이고 의무 수치는 아니다.

16절은 Apple의 여덟 원칙(Purpose, Agency, Responsibility, Familiarity, Flexibility, Simplicity, Craft, Delight)을 추론에 쓸 이름으로 준다. 원문은 출처를 *Principles of Great Design*, WWDC 2026이라고 적는다.[](source:ad-princ) 구체 예가 붙은 원칙만 추리면 이렇다.

- Agency: 실수는 쉽게 되돌리게 하고, 확인 대화상자는 정말 파괴적이고 되돌릴 수 없는 동작에만 쓴다. 남용하면 사람들이 습관처럼 누르고 지나간다.[](source:ad-princ)
- Responsibility: 알레르기를 고려하는 레시피 앱은 해로운 재료를 제안하면 안 된다. 위험이 가치보다 큰 기능은 뺀다.[](source:ad-princ)
- Familiarity: 같아 보이는 것은 같게 동작하고 같은 곳에 있어야 한다. 예: macOS에서 닫기는 늘 왼쪽 위다. 익숙한 패턴은 더 낫다고 증명하고 시험한 뒤에만 깬다.[](source:ad-princ)
- Simplicity: 남은 시간을 보여 주는 영상 scrubber처럼, 맥락을 더해 단순해지는 경우가 있다. 흔한 경로를 먼저 보이고 고급 옵션은 한 단계 안에 둔다.[](source:ad-princ)

원칙을 받치는 전술 규칙도 있다.[](source:ad-tact)

| 상황 | 바꾸기 전 | 바꾼 뒤 |
| --- | --- | --- |
| 입력 검증 | 제출할 때 한꺼번에 검사한다 | 입력하는 자리에서 바로 검사한다 |
| 메뉴 이름 | "Home"처럼 넓은 이름을 쓴다 | "Progress", "Library"처럼 내용을 가리키는 이름을 쓴다 |
| 컨트롤 배치 | 설명 label이 있어야 무엇을 바꾸는지 안다 | 바꾸는 대상 가까이에, 대상의 배치를 닮게 둔다 |

피드백은 상태·완료·경고·오류 네 종류로 나누고, 모든 화면이 "어디 있나, 어디로 갈 수 있나, 거기 뭐가 있나, 어떻게 나가나"에 답하게 한다.[](source:ad-tact) 작업 방식으로는 정적 시안보다 상호작용 프로토타입을 먼저 만들고, 움직임과 화면을 함께 설계하고, 실제 사람과 맥락에서 시험하며 느린 재생이나 프레임 단위로 움직임을 다시 보라고 한다.[](source:ad-proc)

## 이 분석의 범위와 한계 {#audit}

이 스킬은 독립 스킬이다. 소속 묶음이 없어 흐름 속 위치 패널은 두지 않았다. 원장의 관계는 하나다.

| rel-id | 상대 | 종류 | 근거 방식 | 내용 |
| --- | --- | --- | --- | --- |
| r47 | `emil-design-eng` | 같은 계열 | 추론 | 둘 다 UI 다듬기와 모션 원칙을 담는다. `emil-design-eng`는 Emil Kowalski의 철학이고, 이 스킬은 Apple WWDC 원칙을 웹으로 옮긴 것이다. 서로 이름을 부르지 않고 순서도 없다[](source:ed-fm)[](source:ad-fm) |

전체 관계는 `design/relations.md`, 스킬 목록은 `design/index.html`에서 확인한다. 다른 스킬 페이지를 연결 링크로 걸지 않은 이유는 explainer가 로컬 HTML 링크를 만들지 못하기 때문이다.

- 읽은 텍스트 파일은 1개, 23,036B다(`SKILL.md` 전부). 구조·표본만 본 파일은 없다.
- 제외한 파일: `SKILL.ko.md`(29,283B)는 번역본이라 열지 않았다. 바이너리 파일은 이 폴더에 없다.
- 원문 대조 범위: 활성화 제한 1개(호출 제한 필드 없음), 사람 개입 1개(첫 응답 규칙), 강제·금지 규칙 20행, 수치 13행, 적용 전후 사례 10행을 원문 줄과 대조했다. 종료 조건은 원문에 없다. r47의 출처 줄(`emil-design-eng:3`, `apple-design:3`)을 다시 대조했고 원장과 같다.
- 다른 스킬이 이 스킬을 이름으로 부르는 문장은 찾지 못했다. `emil-design-eng`의 "Apple's approach"(179줄)와 `animate`의 "Apple-style"(137줄), `animate-expo`의 "Apple's two designer parameters"(110줄)는 Apple의 spring 파라미터 방식을 가리킬 뿐 이 스킬을 부르지 않는다.
- WWDC 발표 제목과 연도(2018, 2020, 2026), "Apple이 출하하는 값"은 원문이 적은 내용이다. 이 분석에서 Apple 자료와 대조하지 않았다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="원문만으로 풀리지 않는 곳"
- response와 duration: 원문은 response가 duration이 아니라고 하면서, Motion의 `bounce`+`duration` API가 damping+response에 가깝게 대응한다고 한다. 두 값을 같은 숫자로 넣어도 되는지는 `원문에 명시 없음`이다. 예시 코드는 `duration: 0.4`를 쓴다.[](source:ad-spring)[](source:ad-ships)[](source:ad-motion)
- 속도 부호로 되돌림·확정을 정하라는 규칙은 Quick Reference 표에만 있고 본문 설명이 없다.[](source:ad-quick)
- "지각 한계 아래의 프레임당 위치 변화"에 구체 수치가 없다.[](source:ad-frame)
- 판정 문제가 아닌 사실 질문: 이 스킬이 켜졌을 때 에이전트가 CSS transition을 실제로 덜 쓰는지는 실행해 보지 않아 확인하지 못했다.
