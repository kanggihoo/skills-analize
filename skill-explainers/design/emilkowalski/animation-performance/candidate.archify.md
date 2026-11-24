# animation-performance — 웹 애니메이션 프레임 드랍을 진단·수정하는 스킬 {#overview}

`animation-performance`는 에이전트가 웹 애니메이션의 `jank(끊김)` 원인을 속성 단계·메인 스레드 점유·React 렌더·스타일 재계산 순으로 진단하고 비용 순으로 보고하게 하는 스킬이다.[](source:s-fm)[](source:s-p2)

- 애니메이션이 버벅거리거나, 어떤 속성을 애니메이션할지 고르거나, CSS와 JS 중 성능 기준으로 선택하거나, `will-change` 적용 여부를 판단할 때 켜진다. 질문 없이 불리면 고정 문구 한 줄만 답하고 기다린다.[](source:s-fm)[](source:s-init)
- 결과로 대상별 드라이버·속성 표와 원인·개선 전후·검증 수준을 적은 보고서가 남는다. 보고 뒤 바로 멈추고 사용자가 요청할 때만 코드를 고친다.[](source:s-p1)[](source:s-p3)
- easing·시간·적용 여부 결정은 `animate`, 모션 전반 리뷰는 `review-animations`, React Native 스레드 처리는 `animate-expo`가 맡는다(대안). `apple-design`은 합성기 친화 속성과 `will-change` 기준을 이 스킬에서 가져다 쓴다(참고).[](source:s-init)[](source:rel-apple-ref)
- 하지 않는 것: 고성능 노트북 체감만으로 "괜찮다"고 결론 내리지 않고, 원인 진단 없이 `will-change`부터 뿌리거나 `transition: all`을 쓰지 않는다.[](source:s-posture)[](source:s-hard)

@answer scope="design/emilkowalski/animation-performance · 원본 파일 1개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source s-fm title="frontmatter: name과 description" path=design/emilkowalski/animation-performance/SKILL.md lines=1:4
@source s-init title="초기 응답과 역할 경계" path=design/emilkowalski/animation-performance/SKILL.md lines=8:20
@source s-posture title="작업 태도와 두 가지 함정" path=design/emilkowalski/animation-performance/SKILL.md lines=22:30
@source s-hard title="필수 규칙 5가지" path=design/emilkowalski/animation-performance/SKILL.md lines=31:38
@source s-symp title="증상별 해결 표" path=design/emilkowalski/animation-performance/SKILL.md lines=39:54
@source s-budget title="프레임 예산 기준" path=design/emilkowalski/animation-performance/SKILL.md lines=55:65
@source s-what title="렌더링 파이프라인 3단계와 속성 교체" path=design/emilkowalski/animation-performance/SKILL.md lines=66:99
@source s-where title="실행 스레드와 Motion 14.2+" path=design/emilkowalski/animation-performance/SKILL.md lines=100:126
@source s-react title="React 상태 애니메이션 금지" path=design/emilkowalski/animation-performance/SKILL.md lines=127:141
@source s-traps title="상속 CSS 변수와 blur 함정" path=design/emilkowalski/animation-performance/SKILL.md lines=142:159
@source s-will title="will-change 사용 조건" path=design/emilkowalski/animation-performance/SKILL.md lines=160:173
@source s-js title="JS 애니메이션과 작업 분담" path=design/emilkowalski/animation-performance/SKILL.md lines=174:181
@source s-p1 title="1단계: 애니메이션 목록화" path=design/emilkowalski/animation-performance/SKILL.md lines=182:195
@source s-p2 title="2단계: 7단계 원인 진단" path=design/emilkowalski/animation-performance/SKILL.md lines=196:209
@source s-p3 title="3단계: 비용순 보고와 종료" path=design/emilkowalski/animation-performance/SKILL.md lines=210:222
@source rel-anim title="animate 소개" path=design/emilkowalski/animate/SKILL.md lines=1:20
@source rel-rev title="review-animations 소개" path=design/emilkowalski/review-animations/SKILL.md lines=1:20
@source rel-expo title="animate-expo 소개" path=design/emilkowalski/animate-expo/SKILL.md lines=1:20
@source rel-apple title="apple-design frontmatter" path=design/emilkowalski/apple-design/SKILL.md lines=1:5
@source rel-apple-ref title="apple-design의 animation-performance 참조" path=design/emilkowalski/apple-design/SKILL.md lines=170:176

## 어떻게 동작하나 {#flow span=12}

`SKILL.md`는 증상표와 파이프라인 이론을 앞세우고, 마지막 `Workflow` 절에서 3단계 진단·보고 순서를 정한다.[](source:s-symp)[](source:s-p1) JS 애니메이션 자체를 금지하지는 않으며 단순·혼잡 시점 모션은 CSS로, 제스처·`spring` 모션은 JS로 나눈다.[](source:s-js) 보고 후 수정은 사용자가 따로 요청할 때만 진행한다.[](source:s-p3)

@workflow id=flow-diagram title="animation-performance 흐름"
| lane prep | 접수와 목록화 |
| lane diag | 원인 진단 |
| lane out | 보고와 수정 |
| ask | 구체적 질문 있나? | backend | prep | source:s-init |
| greet | 고정 문구 후 대기 | external | prep | source:s-init |
| list | 애니메이션 목록화 | backend | prep | source:s-p1 |
| diag | 7단계 원인 진단 | backend | diag | source:s-p2 |
| report | 비용순 보고 후 멈춤 | backend | out | source:s-p3 |
| fixreq | 수정 요청 있나? | backend | out | source:s-p3 |
| apply | 원인 명시 후 수정 | external | out | source:s-hard |
| done | 보고로 종료 | external | out | source:s-p3 |
| ask > greet | 없음 |
| ask > list | 있음 |
| list > diag | |
| diag > report | |
| report > fixreq | |
| fixreq > apply | 예 |
| fixreq > done | 아니오 |

@steps id=flow-steps
| s-ask | 구체적 질문 있나? | **입력** 사용자 호출과 질문 내용 · **출력** 질문 유무 판단. **처리** 구체적인 성능 질문 없이 처음 불렸는지 확인한다.[](source:s-init) | flow-diagram | ask |
| s-greet | 고정 문구 후 대기 | **입력** 질문 없는 초기 호출 · **출력** Emil Kowalski 철학 준비 문구 한 줄. **처리** 고정 문구만 출력하고 사용자가 질문을 보낼 때까지 기다린다.[](source:s-init) | flow-diagram | greet |
| s-list | 애니메이션 목록화 | **입력** 대상 코드와 화면 범위 · **출력** 요소별 드라이버·속성·실행 시점 표. **처리** 범위 안의 모든 애니메이션을 찾고 `transition: all`과 Motion 단축 속성을 실제 애니메이션 속성으로 풀어 적는다.[](source:s-p1) | flow-diagram | list |
| s-diag | 7단계 원인 진단 | **입력** 애니메이션 목록과 증상 · **출력** 원인 분류와 검증 구분(코드 확인/기기 녹화 필요). **처리** 속성 단계, 페이지 혼잡 시점, React 상태 렌더, 상속 CSS 변수, 14.2 이전 Motion 단축 속성, `20px` 초과 `blur()`, `will-change` 필요성 순서로 7단계를 짚고 증상표·프레임 예산(120Hz 기준 `8ms`) 기준으로 대조한다.[](source:s-p2)[](source:s-symp)[](source:s-budget) **다음** 고성능 노트북 체감으로 끝내지 않고 중저가 실기기 원격 프로파일링이 필요한 항목을 따로 표시한다.[](source:s-hard)[](source:s-p2) | flow-diagram | diag |
| s-report | 비용순 보고 후 멈춤 | **입력** 진단 결과 목록 · **출력** 비용순(`layout` → `paint` → 혼잡한 메인 스레드 → 유휴 시점) 지적 목록. **처리** 파일과 줄 번호, 원인, Before/After, 검증 구분을 적어 출력한 뒤 코드를 고치지 않고 멈춘다.[](source:s-p3) | flow-diagram | report |
| s-fixreq | 수정 요청 있나? | **입력** 보고 후 사용자 응답 · **출력** 코드 수정 여부 결정. **처리** 사용자가 보고서 확인 뒤 수정 적용을 요청했는지 가른다.[](source:s-p3) | flow-diagram | fixreq |
| s-apply | 원인 명시 후 수정 | **입력** 수정 요청과 진단 원인 · **출력** 수정된 애니메이션 코드. **처리** 각 수정이 7단계 원인 중 무엇을 해결하는지 이름을 밝힌 뒤 `transform`·`opacity`·CSS/WAAPI·`ref.current.style` 등으로 고친다.[](source:s-hard)[](source:s-react) | flow-diagram | apply |
| s-done | 보고로 종료 | **입력** 보고만 원한 상태 · **출력** 종료. **처리** 추가 수정 지시가 없으면 진단 보고만으로 작업을 마친다.[](source:s-p3) | flow-diagram | done |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(description). 애니메이션 끊김 진단, 속성 선택, CSS/JS 성능 판단, `will-change` 판단 요청에서 켜진다. 호출 제한 필드는 frontmatter에 없다.[](source:s-fm) |
| 성격 | 웹 애니메이션의 프레임 예산 준수 여부를 파이프라인 비용과 실행 스레드 기준으로 진단하고 수정안을 보고하는 절차형 스킬이다.[](source:s-init)[](source:s-budget) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#rel-r21} | `animate` | 대안 | 역할 경계: 성능 진단이 아니라 `easing`·지속 시간·애니메이션 여부 결정은 `animate`를 사용한다(사용자 선택).[](source:s-fm)[](source:s-init)[](source:rel-anim) |
| **이 스킬** {#rel-r22} | `review-animations` | 대안 | 역할 경계: 모션 전반 리뷰 및 애니메이션 존재 여부 판단은 `review-animations`를 사용한다(사용자 선택).[](source:s-fm)[](source:s-init)[](source:rel-rev) |
| **이 스킬** {#rel-r23} | `animate-expo` | 대안 | 역할 경계: 웹이 아니라 React Native 스레드 처리는 `animate-expo`를 사용한다(사용자 선택).[](source:s-init)[](source:rel-expo) |
| `apple-design` {#rel-r24} | **이 스킬** | 참고 | 합성기 친화적 속성(`transform`·`opacity`)과 `will-change` 적용 조건의 상세 기준을 `../animation-performance/SKILL.md`에서 참조한다(사용자 개입 없음).[](source:rel-apple-ref)[](source:rel-apple) |

@architecture id=relation-map title="animation-performance와 이어지는 스킬"
| anim | animate | backend |
| rev | review-animations | backend |
| expo | animate-expo | backend |
| apple | apple-design | backend |
| self | animation-performance(이 스킬) | backend |
| self > anim | 대안 | dashed |
| self > rev | 대안 | dashed |
| self > expo | 대안 | dashed |
| apple > self | 참고 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 초기 응답, 증상표, 프레임 예산, 속성·스레드·React·함정 규칙, 3단계 진단 워크플로를 담은 유일한 파일 | 스킬이 켜질 때 읽는다. | 구체적 질문 있나?, 고정 문구 후 대기, 애니메이션 목록화, 7단계 원인 진단, 비용순 보고 후 멈춤, 원인 명시 후 수정 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 구체적 질문 없이 스킬이 처음 켜진 경우 | 고정 문구 한 줄만 출력하고 질문이 올 때까지 멈춘다. | [](source:s-init) |
| 프레임 예산 기준 | 60Hz의 `16.7ms`가 아니라 120Hz 화면 기준 `8ms`를 설계 상한으로 잡는다. | [](source:s-budget) |
| 기본 속성 선택과 `transition: all` | `transform`과 `opacity`를 기본으로 쓰며, `transition: all`은 절대 쓰지 않고 정확한 속성만 나열한다. | [](source:s-hard) |
| 코드를 고칠 때의 진단 조건 | "`will-change`를 넣으니 나아졌다" 식의 추측은 금지하며, 반드시 어떤 원인 항목을 해결하는지 이름을 밝힌다. | [](source:s-hard) |
| 성능 판정 환경 | 개발자 노트북이나 데스크톱 CPU 스로틀링만으로 안전하다고 결론짓지 않고, 코드 확인 항목과 중저가 실기기 녹화가 필요한 항목을 구분한다. | [](source:s-hard)[](source:s-p2) |
| `will-change`와 `blur()` 상한 | `will-change`는 `1px` 밀림이나 프레임 드랍을 관측한 뒤 애니메이션 요소에만 붙이고 `*`·큰 컨테이너에는 금지한다. 애니메이션 `blur()`는 `20px` 미만으로 유지한다. | [](source:s-traps)[](source:s-will) |
| React 핸들러·상속 CSS 변수 | `requestAnimationFrame`, 포인터·스크롤·드래그 핸들러에서 `setState`를 호출하거나 부모 CSS 변수를 갱신해 자식 `transform`을 돌리지 않는다. | [](source:s-react)[](source:s-traps) |
| 3단계 보고 직후 | 비용순 보고서를 낸 뒤 자동으로 코드를 수정하지 않고 멈추며, 사용자가 요청할 때만 고친다. | [](source:s-p3) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 렌더링 파이프라인 3단계와 속성 하향 교체표 — 7단계 원인 진단 · `width`·`top`·`box-shadow`를 `scale()`·`translate()`·`filter: drop-shadow()`로 바꾸는 대응표를 개요에서 줄였다.
- 실행 드라이버별 스레드와 Motion 14.2+ 예외 — 7단계 원인 진단 · CSS/WAAPI 가속 조건과 `layout`·`onUpdate`·드래그가 메인 스레드에 남는 이유를 뺐다.
- 증상별 즉시 매칭표 9행 — 7단계 원인 진단 · 증상별 원인·해결 9쌍과 Vaul 상속 CSS 변수 사례를 개요에서 생략했다.

@callout level=open-question title="확인하지 못한 것"
| `filter`, `clip-path`, `background-color`의 하드웨어 가속 지원과 `filter: drop-shadow()`의 비Chrome 엔진 repaint 여부는 브라우저 버전에 따라 달라 실제 기기 측정이 필요하다.[](source:s-what)[](source:s-where) |
| 분석 중 DevTools Performance 패널이나 실기기 원격 프로파일링은 실행하지 않았다. |

읽은 원본: 텍스트 파일 1개. 제외: `SKILL.ko.stale.md`(낡은 번역본이라 읽지 않음).
