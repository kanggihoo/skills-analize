# product-explainer 묶음은 어떻게 이어지나 {#product-explainer-group}

`explainer-default`, `explainer-engaging`, `explainer-high-energy`는 순서대로 거치는 단계가 아니다. 같은 제품 소개 영상을 서로 다른 연출로 만드는 세 선택지이고, 사용자가 스킬 이름으로 하나를 고른다(r06~r08).[](source:pe-readme-def)

- 세 스킬은 README에서 서로를 "Sister skills"로 부르고, 연출과 기본 길이를 표로 비교한다. 기본 길이는 `explainer-high-energy` 15초, `explainer-default` 60초, `explainer-engaging` 12초(루프)다.[](source:pe-readme-def)[](source:pe-readme-eng)[](source:pe-readme-he)
- 세 스킬은 질문 일곱 개를 한 번에 묻는 짜임새가 같다. 필수 답은 제품 하나뿐이고, 비운 칸은 에이전트가 정한 뒤 무엇을 골랐는지 알린다.[](source:pe-q-def)
- 세 스킬은 서로를 부르지 않는다. 앞뒤 순서도 없다.

@answer scope="video/Barty-Bart explainer 3종 · 커밋 23e8047 · 지시상 동작 · 렌더 결과는 확인하지 못함"
@meta locale=ko
@source pe-def-fm title="video/Barty-Bart/explainer-default/SKILL.md · 21739B · frontmatter" path=video/Barty-Bart/explainer-default/SKILL.md lines=1:4
@source pe-def-page title="explainer-default/SKILL.md · 페이지 구성 한 줄" path=video/Barty-Bart/explainer-default/SKILL.md lines=10:10
@source pe-q-def title="explainer-default/SKILL.md · 1단계 질문 일곱 개" path=video/Barty-Bart/explainer-default/SKILL.md lines=14:22
@source pe-len-def title="explainer-default/SKILL.md · 기본 길이와 예산" path=video/Barty-Bart/explainer-default/SKILL.md lines=30:32
@source pe-snd-def title="explainer-default/SKILL.md · 소리" path=video/Barty-Bart/explainer-default/SKILL.md lines=70:72
@source pe-render-def title="explainer-default/SKILL.md · 3단계 렌더" path=video/Barty-Bart/explainer-default/SKILL.md lines=135:137
@source pe-eng-fm title="video/Barty-Bart/explainer-engaging/SKILL.md · 23722B · frontmatter" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=1:4
@source pe-len-eng title="explainer-engaging/SKILL.md · 기본 길이" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=32:34
@source pe-snd-eng title="explainer-engaging/SKILL.md · 소리" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=92:94
@source pe-render-eng title="explainer-engaging/SKILL.md · 3단계 렌더" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=157:159
@source pe-he-fm title="video/Barty-Bart/explainer-high-energy/SKILL.md · 20756B · frontmatter" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=1:4
@source pe-len-he title="explainer-high-energy/SKILL.md · 기본 길이" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=30:30
@source pe-snd-he title="explainer-high-energy/SKILL.md · 소리" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=59:61
@source pe-render-he title="explainer-high-energy/SKILL.md · 3단계 렌더" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=124:126
@source pe-readme-def title="explainer-default/README.md · 2156B · Sister skills 표" path=video/Barty-Bart/explainer-default/README.md lines=9:15
@source pe-readme-eng title="explainer-engaging/README.md · 2174B · Sister skills" path=video/Barty-Bart/explainer-engaging/README.md lines=9:9
@source pe-readme-he title="explainer-high-energy/README.md · 2168B · Sister skills" path=video/Barty-Bart/explainer-high-energy/README.md lines=9:9
@source pe-sfx-fm title="video/Barty-Bart/sound-effects/SKILL.md · 13793B · frontmatter" path=video/Barty-Bart/sound-effects/SKILL.md lines=1:4
@source pe-sfx-rule title="sound-effects/SKILL.md · 합성 금지 규칙" path=video/Barty-Bart/sound-effects/SKILL.md lines=28:28
@source pe-def-audio title="explainer-default/SKILL.md · buildAudio 계약" path=video/Barty-Bart/explainer-default/SKILL.md lines=112:113

## 어느 스타일을 고르나 {#choose span=12}

@workflow id=style-choice title="제품 소개 영상의 세 선택지"
| start | 제품 영상 요청 | external |
| pick | 어느 스타일인가? | backend |
| def | explainer-default | backend |
| eng | explainer-engaging | backend |
| he | explainer-high-energy | backend |
| render | 초안 렌더·수정 요청 | backend |
| start > pick | |
| pick > def | 차분한 데모 |
| pick > eng | 원테이크 |
| pick > he | 빠른 홍보 |
| def > render | |
| eng > render | |
| he > render | |

@steps id=choice-steps
| pick | 어느 스타일인가? | 사용자가 스킬 이름(예: `/explainer-default`)으로 고른다. 세 스킬 사이의 자동 전환은 원문에 명시 없음이다. | style-choice | pick |
| def | explainer-default | 밝은 캔버스에 짧은 문장 하나씩, 카메라가 밀고 들어가며 제품 UI를 크게 보여 준다. | style-choice | def |
| eng | explainer-engaging | 주인공 요소 하나가 워크플로 스테이션을 지나가고, 마지막에 카메라가 빠지며 전체 여정을 보여 준다. | style-choice | eng |
| he | explainer-high-energy | 박자마다 새 아이디어가 나오고 전환마다 도형이 다음 장면으로 이어진다. | style-choice | he |
| render | 초안 렌더·수정 요청 | 세 스킬 모두 초안(30fps)을 사용자에게 보내 수정 요청을 받은 뒤 최종을 렌더한다. | style-choice | render |

선택 근거는 README 표의 연출 설명과 `description`이다.[](source:pe-readme-def)[](source:pe-def-fm)[](source:pe-eng-fm)[](source:pe-he-fm) 판정: 그림의 "사용자가 고른다"는 README의 사용 예시(`/explainer-default`)에서 읽은 것이고, 에이전트가 스타일을 대신 고르는 규칙은 원문에 명시 없음이다.

## 세 스타일은 무엇이 다른가 {#compare}

| 기준 | explainer-default | explainer-engaging | explainer-high-energy |
| --- | --- | --- | --- |
| 기본 길이(범위) | 60초(45~90초)[](source:pe-len-def) | 12초 루프(10~30초)[](source:pe-len-eng) | 15초, 128 BPM 8마디(12~20초)[](source:pe-len-he) |
| 연출 | 차분한 홈페이지 데모 {good:UI를 크게} | 원테이크 영웅 이동 {caution:루프 이음매 규칙} | 빠른 박자 전환·키네틱 타이포 |
| 추가 질문 | 기능 3~5개, 연동 대상(선택)[](source:pe-len-def) | 워크플로 3~6단계(선택)[](source:pe-len-eng) | 없음. 원문에 명시 없음 |
| 소리(원문의 설명) | 100~110 BPM의 차분한 음악[](source:pe-snd-def) | 110~120 BPM의 미니멀한 리듬[](source:pe-snd-eng) | 120~140 BPM 격자 위[](source:pe-snd-he) |
| 최종 렌더 명령 인수(fps 서브프레임 워커) | `60 4 8`[](source:pe-render-def) | `60 8 8`[](source:pe-render-eng) | `60 8 8`[](source:pe-render-he) |

연출과 길이는 description·README의 설명이다. 각 스킬 내부의 장면 구성, 수치, 금지 목록은 스킬 페이지에 있다(`video/Barty-Bart/explainer-default/explainer-default.html` 등).

## 세 스킬이 공유하는 계약은 무엇인가 {#shared}

| 공유하는 규칙 | 근거 |
| --- | --- |
| 질문 일곱 개(제품, 기억할 한 가지, 브랜드, 형식 16:9·9:16, 길이, 음악, 방향)를 한 번에 묻는다. 필수는 제품 하나뿐이다 | 세 스킬 모두 같다[](source:pe-q-def) |
| 음악은 사용자의 파일 또는 합성이 기본값이다 | 세 스킬 모두 질문 6번이다[](source:pe-q-def)[](source:pe-snd-def) |
| 영상은 "시간 값으로 어느 프레임이든 그리는 HTML 한 장"으로 쓰고 MP4로 렌더링한다 | `explainer-default` 10줄. 나머지 둘도 같은 문장 구조다[](source:pe-def-page) |
| 초안은 `30 1 4`(빠른 검토 사본)로 렌더하고 사용자에게 수정 요청을 받은 뒤 최종을 렌더한다 | 세 스킬 모두 같다[](source:pe-render-def)[](source:pe-render-eng)[](source:pe-render-he) |
| 60초 최종 렌더는 노트북에서 20~60분이 걸릴 수 있다고 시작 전에 알린다 | 세 스킬이 같은 문장을 쓴다. 12초·15초 영상에도 맞는지는 원문에 명시 없음[](source:pe-render-eng) |

판정: 세 스킬이 싣고 있는 `render.mjs` 코드 조각(각 98줄)은 `diff`로 같다. 세 스킬의 차이는 3단계의 최종 렌더 명령 인수(서브프레임 `4` 대 `8`)뿐이다. 이 비교는 이 묶음 작성자가 직접 했다.

## 그림에서 뺀 관계와 확인하지 못한 것 {#omitted}

| rel-id | 종류 | 그림에 있나 | 내용 |
| --- | --- | --- | --- |
| r06~r08 | 같은 계열 | 있음 | 세 스킬이 서로의 선택지다[](source:pe-readme-def) |
| r04 | 산출물 호환 | 생략 | `sound-effects`와의 관계는 `미확인`이다. 서로를 부르지 않는다 |
| r11~r13 | 같은 계열 | 생략 | `bang-motion`, `lemo-opuscar`와 목적이 비슷하다. 직접 연결은 없다 |
| r14 | 같은 계열 | 생략 | `brag`와 목적이 비슷하다. 직접 연결은 없다 |

@callout level=open-question title="`sound-effects`와 맞물리는지는 원문에 명시 없음"
세 explainer는 `window.buildAudio`로 음악과 효과음을 코드에서 합성한다.[](source:pe-def-audio) 같은 컬렉션의 `sound-effects`는 코드로 음악·효과음을 합성하지 말고 실제 녹음 파일을 쓰라고 한다.[](source:pe-sfx-rule)
`sound-effects`의 적용 대상은 "Claude Code로 만든 모션그래픽 영상"이다.[](source:pe-sfx-fm) 어느 SKILL.md도 서로를 부르지 않으므로, explainer 결과물에 `sound-effects`를 쓰는지, 쓰면 합성 소리를 어떻게 하는지는 확인하지 못했다.

@callout level=open-question title="확인하지 못한 것"
렌더한 영상이 실제로 좋은지, 20~60분이라는 렌더 시간이 맞는지는 측정하지 않았다. 세 스킬을 실행하지 않았다.
