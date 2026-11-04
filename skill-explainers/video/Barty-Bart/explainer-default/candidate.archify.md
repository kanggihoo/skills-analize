# explainer-default 스킬은 에이전트를 어떻게 바꾸나 {#explainer-default-skill}

`explainer-default`를 쓰면 에이전트는 바로 코드를 짜지 않고, 질문 한 번으로 브리프를 받은 뒤 대본과 beat sheet(화면 문구·UI 순간·시간을 적은 표)부터 쓴다. 그 대본으로 `seek(t)` 하나가 모든 프레임을 그리는 HTML 한 장을 만들고, 스틸 점검, 초안 MP4, 사용자 검토, 최종 MP4 순서로 낸다. 결과물은 45–90초(기본 60초)의 차분한 제품 데모다.[](source:d-intro)

- 질문은 한 메시지에 모아 한 번만 한다. 제품만 필수이고, 빈 칸은 에이전트가 정한 뒤 무엇을 골랐는지 말한다.[](source:d-ask)
- 수치와 후기는 지어내지 않는다. 사용자나 웹사이트가 말한 것만 쓰고, 없으면 상대 막대와 자리표시 줄로 대신한다.[](source:d-nofact)
- `seek(t)`는 시간만으로 화면을 정하는 순수 함수여야 한다. CSS transition, `setTimeout`, `Math.random`은 쓰지 않는다.[](source:d-contract)
- 최종 렌더 전에 초안 MP4를 사용자에게 보내 수정 의견을 묻고, 최종 렌더는 오래 걸리니 시작 전에 알린다.[](source:d-draft)[](source:d-final)

@answer scope="video/Barty-Bart/explainer-default · 원본 텍스트 2개 · 커밋 23e8047 · 렌더 결과 미확인 · 지시상 동작"
@meta locale=ko
@source d-fm title="video/Barty-Bart/explainer-default/SKILL.md · 21739B · frontmatter" path=video/Barty-Bart/explainer-default/SKILL.md lines=1:4
@source d-intro title="SKILL.md · 목적" path=video/Barty-Bart/explainer-default/SKILL.md lines=8:10
@source d-ask title="SKILL.md · 질문은 한 메시지" path=video/Barty-Bart/explainer-default/SKILL.md lines=14:14
@source d-q1 title="SKILL.md · 질문 1 제품" path=video/Barty-Bart/explainer-default/SKILL.md lines=16:16
@source d-q2 title="SKILL.md · 질문 2 기억할 한 가지" path=video/Barty-Bart/explainer-default/SKILL.md lines=17:17
@source d-q3 title="SKILL.md · 질문 3 브랜드" path=video/Barty-Bart/explainer-default/SKILL.md lines=18:18
@source d-q4 title="SKILL.md · 질문 4 형식" path=video/Barty-Bart/explainer-default/SKILL.md lines=19:19
@source d-q5 title="SKILL.md · 질문 5 길이" path=video/Barty-Bart/explainer-default/SKILL.md lines=20:20
@source d-q6 title="SKILL.md · 질문 6 음악" path=video/Barty-Bart/explainer-default/SKILL.md lines=21:21
@source d-q7 title="SKILL.md · 질문 7 방향" path=video/Barty-Bart/explainer-default/SKILL.md lines=22:22
@source d-url title="SKILL.md · URL을 주면 읽는다" path=video/Barty-Bart/explainer-default/SKILL.md lines=24:24
@source d-nofact title="SKILL.md · 사실을 지어내지 않는다" path=video/Barty-Bart/explainer-default/SKILL.md lines=26:26
@source d-logo title="SKILL.md · 로고" path=video/Barty-Bart/explainer-default/SKILL.md lines=28:28
@source d-extra title="SKILL.md · 추가 선택 질문" path=video/Barty-Bart/explainer-default/SKILL.md lines=30:30
@source d-len title="SKILL.md · 길이" path=video/Barty-Bart/explainer-default/SKILL.md lines=32:38
@source d-rules title="SKILL.md · 연출 규칙" path=video/Barty-Bart/explainer-default/SKILL.md lines=61:68
@source d-sound title="SKILL.md · 소리 방향" path=video/Barty-Bart/explainer-default/SKILL.md lines=72:72
@source d-onefile title="SKILL.md · HTML 한 파일" path=video/Barty-Bart/explainer-default/SKILL.md lines=76:76
@source d-contract title="SKILL.md · 페이지 계약" path=video/Barty-Bart/explainer-default/SKILL.md lines=79:86
@source d-audio title="SKILL.md · buildAudio" path=video/Barty-Bart/explainer-default/SKILL.md lines=113:113
@source d-beat title="SKILL.md · beat sheet 주석" path=video/Barty-Bart/explainer-default/SKILL.md lines=129:129
@source d-setup title="SKILL.md · 렌더 준비" path=video/Barty-Bart/explainer-default/SKILL.md lines=133:133
@source d-stills title="SKILL.md · 스틸 점검" path=video/Barty-Bart/explainer-default/SKILL.md lines=135:135
@source d-draft title="SKILL.md · 초안 렌더" path=video/Barty-Bart/explainer-default/SKILL.md lines=136:136
@source d-final title="SKILL.md · 최종 렌더" path=video/Barty-Bart/explainer-default/SKILL.md lines=137:137
@source d-deliver title="SKILL.md · 전달" path=video/Barty-Bart/explainer-default/SKILL.md lines=138:138
@source d-args title="SKILL.md 안 render.mjs · 인수 기본값" path=video/Barty-Bart/explainer-default/SKILL.md lines=151:151
@source d-sub title="SKILL.md 안 render.mjs · 프레임 수와 워커" path=video/Barty-Bart/explainer-default/SKILL.md lines=192:192
@source d-shutter title="SKILL.md 안 render.mjs · 서브프레임 셔터" path=video/Barty-Bart/explainer-default/SKILL.md lines=205:205
@source d-hasaudio title="SKILL.md 안 render.mjs · buildAudio 유무에 따른 소리 입힘" path=video/Barty-Bart/explainer-default/SKILL.md lines=220:221
@source d-norm title="SKILL.md 안 render.mjs · 음량 정규화와 출력" path=video/Barty-Bart/explainer-default/SKILL.md lines=233:235
@source rd-intro title="video/Barty-Bart/explainer-default/README.md · 2156B · 안내 문서(SKILL.md 아님)" path=video/Barty-Bart/explainer-default/README.md lines=7:9
@source rd-table title="README.md · 세 스킬 비교표" path=video/Barty-Bart/explainer-default/README.md lines=11:15
@source rd-use title="README.md · 사용법과 산출물" path=video/Barty-Bart/explainer-default/README.md lines=17:21
@source rd-req title="README.md · 요구 사항" path=video/Barty-Bart/explainer-default/README.md lines=23:23
@source se-desc title="video/Barty-Bart/sound-effects/SKILL.md · r04 확인용 description" path=video/Barty-Bart/sound-effects/SKILL.md lines=3:3
@source se-nosynth title="video/Barty-Bart/sound-effects/SKILL.md · r04 확인용 금지 문장" path=video/Barty-Bart/sound-effects/SKILL.md lines=28:28
@source d-len45 title="SKILL.md · 45초 예산" path=video/Barty-Bart/explainer-default/SKILL.md lines=36:36
@source d-len60 title="SKILL.md · 60초 예산" path=video/Barty-Bart/explainer-default/SKILL.md lines=37:37
@source d-len90 title="SKILL.md · 90초 예산" path=video/Barty-Bart/explainer-default/SKILL.md lines=38:38
@source d-script title="SKILL.md · 대본 먼저" path=video/Barty-Bart/explainer-default/SKILL.md lines=44:44
@source d-camera title="SKILL.md · 장면마다 자기 카메라" path=video/Barty-Bart/explainer-default/SKILL.md lines=46:46
@source d-open title="SKILL.md · 1 열기" path=video/Barty-Bart/explainer-default/SKILL.md lines=48:48
@source d-problem title="SKILL.md · 2 문제 또는 질문" path=video/Barty-Bart/explainer-default/SKILL.md lines=49:49
@source d-chapter title="SKILL.md · 3 기능 챕터" path=video/Barty-Bart/explainer-default/SKILL.md lines=50:53
@source d-proof title="SKILL.md · 4 증명" path=video/Barty-Bart/explainer-default/SKILL.md lines=54:54
@source d-integ title="SKILL.md · 5 통합" path=video/Barty-Bart/explainer-default/SKILL.md lines=55:55
@source d-closer title="SKILL.md · 6 마무리" path=video/Barty-Bart/explainer-default/SKILL.md lines=56:56
@source d-endcard title="SKILL.md · 7 엔드 카드" path=video/Barty-Bart/explainer-default/SKILL.md lines=57:57
@source d-one title="SKILL.md · 한 번에 하나" path=video/Barty-Bart/explainer-default/SKILL.md lines=61:61
@source d-cam title="SKILL.md · 카메라가 편집자" path=video/Barty-Bart/explainer-default/SKILL.md lines=62:62
@source d-realui title="SKILL.md · 진짜 UI" path=video/Barty-Bart/explainer-default/SKILL.md lines=63:63
@source d-cursor title="SKILL.md · 커서" path=video/Barty-Bart/explainer-default/SKILL.md lines=64:64
@source d-type title="SKILL.md · 글꼴" path=video/Barty-Bart/explainer-default/SKILL.md lines=65:65
@source d-pal title="SKILL.md · 팔레트" path=video/Barty-Bart/explainer-default/SKILL.md lines=66:66
@source d-pace title="SKILL.md · 속도" path=video/Barty-Bart/explainer-default/SKILL.md lines=67:67
@source d-banned title="SKILL.md · 금지" path=video/Barty-Bart/explainer-default/SKILL.md lines=68:68
@source bm-desc title="video/bangtutorial/bang-motion/SKILL.md · r11 확인용 description" path=video/bangtutorial/bang-motion/SKILL.md lines=3:3
@source lo-desc title="video/lemomo-ai/lemo-opuscar/SKILL.md · r13 확인용 description" path=video/lemomo-ai/lemo-opuscar/SKILL.md lines=3:3

## 언제 켜지고, 무엇을 묻고, 언제 맞지 않나 {#trigger}

@code source=d-fm language=yaml

호출 제한 필드(`disable-model-invocation` 등)가 없고 `name`과 `description`만 있다. 그래서 모델이 `description`을 보고 켤 수도 있고, 사용자가 직접 부를 수도 있다.[](source:d-fm) `README.md`는 Claude Code에서 스킬을 직접 실행하라고 안내하며 `/explainer-default`를 예로 든다.[](source:rd-use)

판정: `description`은 판단용 설명이지 특정 단어가 있으면 켜지는 목록이 아니다. 제품 종류에 대한 활성화 제한은 `description`의 "any software product" 외에 원문에 명시 없음.[](source:d-fm)

켜진 뒤 에이전트는 질문을 한 메시지에 모아 묻고, 그다음에는 스스로 진행한다. 제품 하나만 필수다.[](source:d-ask)

| 번호 | 질문 | 필수 여부 | 비워 두면 |
| --- | --- | --- | --- |
| 1 | 제품: 이름과 몇 문장 설명. 웹사이트 URL이면 더 좋다 | 필수(이것만) | -[](source:d-q1)[](source:d-ask) |
| 2 | 시청자가 기억할 한 가지 | 선택 | 에이전트가 정하고 무엇을 골랐는지 말한다[](source:d-q2) |
| 3 | 브랜드: 색, 글꼴, 로고 파일, 또는 "웹사이트를 따른다" | 선택 | 스타일의 기본 팔레트[](source:d-q3) |
| 4 | 형식: 16:9(1920×1080) 또는 9:16(1080×1920) | 선택 | 16:9[](source:d-q4) |
| 5 | 길이 | 선택 | 스타일 기본값[](source:d-q5) |
| 6 | 음악: 가진 파일 경로, 또는 합성 | 선택 | 합성[](source:d-q6) |
| 7 | 방향: 원하는 장면, 태그라인, 행동 유도 문구, 피할 것 | 선택 | 에이전트가 정한다[](source:d-q7) |

선택 질문이 하나 더 있다. 보여 줄 기능이나 워크플로 단계 3–5개와, 제품이 연결되는 통합이다. URL이 있으면 사이트에서 뽑는다.[](source:d-extra)

기본 길이는 60초이고 범위는 45–90초다. 길이마다 기능 수와 선택 구간 예산이 다르고, 줄일 때는 선택 구간부터 뺀다.[](source:d-len)

| 길이 | 기능 수 | 선택 구간(증명·통합) |
| --- | --- | --- |
| 45초 | 2–3개, 기능당 약 9초[](source:d-len45) | 둘 중 하나만 |
| 60초 | 3–4개, 기능당 약 10초[](source:d-len60) | 둘 중 하나 |
| 90초 | 4–5개, 기능당 약 12초[](source:d-len90) | 둘 다 |

판정(계산): 열기 5초, 문제 약 5초, 엔드 카드 3초를 기능 구간에 더하고 남는 시간을 구했다.[](source:d-open)[](source:d-problem)[](source:d-endcard)

@facts id=default-budget
| 45초 | 5+5+(2–3)×9+3 = 31–40초, 남는 시간 5–14초 |
| 60초 | 5+5+(3–4)×10+3 = 43–53초, 남는 시간 7–17초 |
| 90초 | 5+5+(4–5)×12+3 = 61–73초, 남는 시간 17–29초 |

남는 시간이 마무리와 선택 구간 몫이다. 마무리 장면의 길이는 원문에 명시 없음.

@callout level=warning title="원문끼리 충돌: 기능 챕터 수"
구조 절은 기능 챕터를 3–5개로 쓰는데, 45초 예산 행은 2–3개로 쓴다. 어느 쪽이 우선인지는 원문에 명시 없음.[](source:d-chapter)[](source:d-len45)

@callout level=warning title="사실을 지어내지 않는다: 의무형 금지"
고객 수, 매출, 평점, 후기, 인용문은 만들지 않는다. 수치는 사용자나 웹사이트가 밝힌 것만 쓰고, 없으면 상대 막대, 진행률, 자리표시 줄로 대신한다.[](source:d-nofact)
UI 안의 예시 내용(프롬프트, 파일 이름, 프로젝트 이름, 영수증 가격)은 그럴듯하게 써도 된다. 제품 자체에 대한 주장(통계, 사용자 수, 평점, "무료" 같은 제안)은 안 된다.[](source:d-nofact)
행동 유도 문구는 사용자나 웹사이트가 준 URL이나 제안만 쓴다. 없으면 이름과 태그라인으로 끝낸다.[](source:d-nofact)
로고는 사용자가 파일을 줬거나 사용자 본인 제품이고 요청했을 때만 쓴다. 아니면 이름을 브랜드 글꼴 텍스트로 쓴다. 제3자 로고도 파일이 있을 때만 쓰고, 없으면 이름이 든 둥근 타일로 대신한다.[](source:d-logo)

원문은 '이럴 때는 쓰지 말라'는 목록을 따로 두지 않는다(원문에 명시 없음). 아래 표는 원문의 범위와 금지 규칙에서 끌어낸 판정이고, `README.md`의 형제 스킬 비교를 근거로 쓴다.[](source:rd-table)

| 요청 | 이 스킬 | 판정과 근거 |
| --- | --- | --- |
| 45–90초의 차분한 제품·SaaS 데모 | {good:맞다} | `description`의 범위다.[](source:d-fm) |
| 15초 안팎의 빠른 홍보나 하이프 릴 | {caution:다른 스킬} | `README.md`는 기본 15초인 `explainer-high-energy`를 따로 둔다. 범위 밖 요청을 이 스킬이 어떻게 처리하는지는 원문에 명시 없음.[](source:rd-table) |
| 통계, 고객 수, 평점, 후기를 내세우는 영상 | {bad:이 스킬은 거부} | 사용자나 웹사이트가 준 수치만 쓴다.[](source:d-nofact) |
| 실제 화면 녹화나 스크린샷을 쓰는 영상 | {caution:맞지 않을 수 있다} | UI는 스크린샷이 아니라 벡터로 새로 만들고, 이미지는 사용자가 준 것만 쓴다. 판정: 녹화 위주 영상은 이 방식과 어긋난다.[](source:d-chapter)[](source:d-onefile) |

## 어떤 순서로 만들고, 사람은 어디서 끼어드나 {#flow}

흐름은 원문의 Step 1–3과 같다. 사람과 대화하는 곳은 질문 단계 하나이고, 나머지는 에이전트가 혼자 돌린다. 스틸 점검만 고친 뒤 다시 보는 반복이 있다.[](source:d-ask)[](source:d-stills)

@workflow id=d-flow title="작업 흐름과 사람 개입"
| lane brief | 브리프 |
| lane build | 제작 |
| lane render | 렌더와 전달 |
| ask | 질문 한 번 | external | brief |
| script | 대본·beat sheet | backend | brief |
| page | HTML 페이지 | backend | build |
| stills | 스틸 점검? | backend | build |
| draft | 초안 MP4 | backend | render |
| review | 사용자 검토 | external | render |
| final | 최종 MP4 | backend | render |
| deliver | 전달 | backend | render |
| ask > script | 빈 칸은 직접 |
| script > page | |
| page > stills | |
| stills > page | 문제 있음 | dashed |
| stills > draft | 문제 없음 |
| draft > review | |
| review > final | 의견 받은 뒤 | emphasis |
| final > deliver | |

@steps id=d-steps
| ask | 질문 한 번 | 에이전트가 질문을 한 메시지에 모아 던진다. 제품만 필수이고 빈 칸은 직접 정해 무엇을 골랐는지 말한다. URL이 있으면 `web fetch`로 읽어 실제 문구·기능·색·글꼴 이름을 확인하고 UI 라벨과 태그라인에 그 말을 쓴다.[](source:d-ask)[](source:d-url) | d-flow | ask |
| script | 대본·beat sheet | 에이전트가 화면 문구 전부, 그 뒤에 오는 UI 순간, 시간을 적은 대본과 beat sheet를 먼저 쓴다. 시간을 더해 길이 예산에 맞춘다. 화면 문구가 유일한 '목소리'라서 문구만으로 이야기가 서야 한다.[](source:d-script) | d-flow | script |
| page | HTML 페이지 | 에이전트가 인라인 CSS·JS의 HTML 한 파일을 쓴다. 이미지는 사용자가 준 것만 넣는다. `VIDEO`, `seek(t)`, `buildAudio(ctx)`를 만들고 맨 위에 beat sheet를 주석으로 둔다.[](source:d-onefile)[](source:d-beat) | d-flow | page |
| stills | 스틸 점검? | `render.mjs --stills`로 beat sheet 행마다 한 장씩 뽑아 본다. 잘림, 겹침, 읽기 어려움, 브랜드 이탈, 나쁜 구도, 빈 화면이 있으면 고치고 다시 본다. 반복 횟수 제한은 원문에 명시 없음.[](source:d-stills) | d-flow | stills |
| draft | 초안 MP4 | 30 fps, 모션 블러 없음, 워커 4개로 빠르게 렌더한다. 이것이 검토용 사본이다.[](source:d-draft) | d-flow | draft |
| review | 사용자 검토 | 에이전트가 초안과 HTML을 사용자에게 보내고 최종 전에 수정 의견을 묻는다. 답이 올 때까지 멈추는지는 원문에 명시 없음.[](source:d-draft) | d-flow | review |
| final | 최종 MP4 | `node render.mjs demo.html demo.mp4 60 4 8`로 렌더한다. 오래 걸리니 시작 전에 사용자에게 알린다.[](source:d-final) | d-flow | final |
| deliver | 전달 | HTML, MP4들, 짧은 노트(beat sheet, 자리표시인 것, 두 번째 버전에서 바꿀 것)를 내고 대안 연출을 한 문장으로 제안한다.[](source:d-deliver) | d-flow | deliver |

@callout level=note title="사람이 끼어드는 곳과 끝나는 곳"
사람이 하는 일은 세 번이다. 처음 질문 메시지에 답하고, 초안을 보고 수정 의견을 주고, 최종 렌더가 오래 걸린다는 안내를 받는다.[](source:d-ask)[](source:d-draft)[](source:d-final)
최종 렌더를 시작해도 되는지 승인을 받으라는 문장은 없다. 원문은 초안을 보내 "최종 전에 수정을 요청하라"고만 쓴다. 판정: 이 승인 지점의 엄격함은 원문에 명시 없음.[](source:d-draft)
끝 조건은 전달 단계의 산출물과 노트를 내는 것이다. 노트에 '두 번째 버전에서 바꿀 것'을 적으라는 지시는 있지만, 이후 사용자 요청을 어떻게 이어받는지는 원문에 명시 없음.[](source:d-deliver)

렌더 준비도 지시로 적혀 있다. `npm i playwright`, 필요하면 `npx playwright install chromium`, `ffmpeg`가 `PATH`에 있어야 하고, 스킬 맨 아래 스크립트를 `render.mjs`로 저장한다.[](source:d-setup) `README.md`는 Node 18 이상, ffmpeg, Playwright를 요구 사항으로 적는다.[](source:rd-req) 이 분석은 이 중 어느 것도 실행하지 않았다.

## 연출은 무엇을 강제하나 {#style}

연출 규칙의 중심은 두 가지다. 한 번에 한 가지만 보여 주고, 장면 전환은 하드 컷이 아니라 카메라 이동이나 블러 디졸브로 한다.[](source:d-one)[](source:d-cam)

@workflow id=default-scenes title="장면 구성: 순서와 선택 구간"
| sc_open | 열기 |
| sc_problem | 문제 또는 질문 |
| sc_chapter | 기능 챕터 |
| sc_proof | 증명(선택) |
| sc_integ | 통합(선택) |
| sc_closer | 마무리 |
| sc_end | 엔드 카드 |
| sc_open > sc_problem | |
| sc_problem > sc_chapter | 3–5개 |
| sc_chapter > sc_proof | 실제 수치 | dashed |
| sc_proof > sc_integ | 길이 따라 | dashed |
| sc_integ > sc_closer | | dashed |
| sc_chapter > sc_closer | 선택 생략 |
| sc_closer > sc_end | | emphasis |

| 장면 요소 | 규칙 | 구분 |
| --- | --- | --- |
| 열기 | 0–5초. 밝은 캔버스에 작은 `Introducing`이 떴다가 브랜드 그라디언트로 녹아든다[](source:d-open) | 서술 |
| 문제 또는 질문 | 약 5초. 시청자가 알아볼 짧은 문장, 또는 곧장 제품 입력창[](source:d-problem) | 서술 |
| 제목 줄 | 한 문장, 1080p에서 약 28px, 가운데. 카메라가 줄 너비가 프레임의 약 75%가 될 때까지 밀고 들어가고, 핵심 단어에 하이라이트 박스가 지나간다[](source:d-chapter) | 서술 |
| UI 순간 | 스크린샷이 아닌 벡터로 새로 만든 제품 UI. 필요한 부분만 크게 보이고 카메라가 동작을 따라간다. 타이핑은 `measureText`로 캐럿 위치를 잰다[](source:d-chapter)[](source:d-realui) | 서술 |
| 풀백 | 동작 뒤 카메라가 물러나 전체 화면을 잠깐 보여 준 뒤 다음으로 간다[](source:d-chapter) | 서술 |
| 증명 | 실제 수치가 있을 때만. 숫자가 올라가며 세고 점선 지구본이나 격자 위에 놓인다[](source:d-proof) | 선택 |
| 통합 | 앱 타일 8–12개가 가장자리에서 떠 들어온다. 로고는 사용자가 줄 때만, 아니면 이름 든 타일. 텍스트는 카메라 대신 스스로 커진다[](source:d-integ) | 선택 |
| 마무리 | 브랜드 그라디언트 위 한 문장에 하이라이트 단어가 돌아가고, 제품에 실제 있을 때만 다른 사용법(예: `Or just ask Claude`)을 붙인다[](source:d-closer) | 서술 |
| 엔드 카드 | 3초. 로고나 이름, 아래에 URL이나 행동 유도 문구[](source:d-endcard) | 서술 |
| 전환 | 하드 컷 없음. 카메라 이동이나, 평평한 캔버스 위 짧은 블러 디졸브(0.3–0.4초)[](source:d-camera)[](source:d-cam) | 금지·의무 |
| 카메라 이징 | `ease` 0.6–1.2초, 또는 거의 감쇠한 스프링(`z` ≥ 0.95). 튕김 없음[](source:d-cam) | 의무 |
| 속도 | 제목 줄은 착지 후 약 2초 유지, 타이핑 약 초당 25자, 결과 뒤 0.5초 멈춤[](source:d-pace) | 권고 |
| 커서 | macOS식 화살표, 완만한 곡선, 클릭 한 박자 전에 도착, 눌림과 잔물결[](source:d-cursor) | 서술 |
| 글꼴 | 브랜드 글꼴, 없으면 Inter 또는 Geist. 제목 줄은 작고 보통 굵기[](source:d-type) | 기본값 |

@facts id=default-palette
| 캔버스 | `#F7F7F8`[](source:d-pal) |
| 글자 | `#111114`, 보조 `#8A8A94`[](source:d-pal) |
| UI 면 | 흰색, 테두리 `#E7E7EC`[](source:d-pal) |
| 강조색 | `#2E6BFF`, 하이라이트 박스는 강조색 15–20% 불투명도. 브랜드 색이 있으면 대체[](source:d-pal) |
| 소리 | 100–110 BPM의 조용한 배경, 타이핑 틱·부드러운 클릭·단계 완료 틱·큰 카메라 이동의 whoosh·엔드 카드 차임. 음악은 영상을 끌고 가지 않고 배경처럼 앉는다[](source:d-sound) |

@callout level=warning title="금지"
어수선한 배경 위의 UI, 강조색 둘 이상, 튕기는 이징, 이모지, 큰 드롭 섀도, 곳곳의 글라스모피즘, 지어낸 수치나 후기는 쓰지 않는다. 한 화면에는 텍스트 한 줄과 UI 하나를 넘기지 않고, 텍스트 장면과 UI 장면은 거의 같은 프레임에 놓지 않는다.[](source:d-banned)[](source:d-one)

## 페이지와 렌더는 무엇을 지켜야 하나 {#contract}

이 스킬이 가장 단단히 묶는 부분이다. 연출은 취향 문제지만 아래 계약을 어기면 렌더가 틀어진다고 원문이 못박는다.[](source:d-contract)

| 규칙 | 내용 | 구분 |
| --- | --- | --- |
| `window.VIDEO`, `window.seek(t)` | `VIDEO = {w, h, duration}`. `seek(t)`는 시간 `t`(초)만으로 모든 요소를 정하는 순수 함수다. CSS transition·animation, `setTimeout`, 이전 프레임 상태는 쓰지 않는다. 어느 프레임이든 혼자, 어떤 순서로든 맞게 그려져야 한다[](source:d-contract) | 의무 |
| 난수 | 시드를 준 생성기만 쓴다. `Math.random`은 쓰지 않는다[](source:d-contract) | 금지 |
| 이력이 필요한 값 | 뒤처지는 카메라나 시뮬레이션은 로드 때 한 번 미리 계산해 저장(bake)한다. 0부터 `duration`까지 1/240초 간격으로 돌려 값을 저장하고, `seek`가 보간해 읽는다[](source:d-contract) | 의무 |
| 루프 | `seek(t)`는 `t % duration`을 쓰고, 이음매에 걸치는 효과는 양쪽 끝에 그리거나 섞는다[](source:d-contract) | 서술 |
| `?render` | 주소에 있으면 컨트롤과 미리보기 스케일이 없고 화면 영역(stage)이 정확히 `w × h`로 좌상단에 놓인다. 없으면 창에 맞춰 CSS로 줄이고 컨트롤을 보여 준다[](source:d-contract) | 서술 |
| 글꼴 | woff2를 받아 base64 `@font-face`로 넣는다. 렌더가 조용히 대체 글꼴로 떨어지지 않게 한다[](source:d-contract) | 의무 |
| 레이어 | 장면 레이어 배경은 투명, 바탕색은 stage 하나가 준다. 절대 위치 텍스트에는 `white-space: nowrap`[](source:d-contract) | 의무 |
| 속도 | 큰 CSS `filter: blur()`와 큰 블러 그라디언트는 스크린샷이 매우 느리다. canvas에 한 번 그려 두고 그것을 움직인다[](source:d-contract) | 권고 |
| `window.buildAudio(ctx)` | 음악과 효과음 전체를 시간 0부터, 받은 `AudioContext`나 `OfflineAudioContext`에 시각 쪽과 같은 시간표로 예약한다. 사용자 음악 파일이 있으면 `fetch`와 `decodeAudioData`로 읽고 박자 격자를 측정해 맞춘 뒤 효과음만 얹는다[](source:d-audio) | 의무 |
| beat sheet 주석 | 스크립트 맨 위에 순간마다 시간, 일어나는 일, 소리를 한 행씩 적는다[](source:d-beat) | 의무 |

@facts id=d-render-facts
| 스틸 점검 | `--stills 0.5,1.2,…`: beat sheet 행마다 시각 하나, 시트는 한 줄에 3장[](source:d-stills) |
| 초안 | `node render.mjs demo.html draft.mp4 30 1 4`: 30 fps, 서브프레임 1(모션 블러 없음), 워커 4. 마지막 수는 머신의 코어 수로 바꾸라는 권고[](source:d-draft) |
| 최종 | `node render.mjs demo.html demo.mp4 60 4 8`: 60 fps, 서브프레임 4, 워커 8. 모션 블러는 렌더 시간을 서브프레임 수만큼 곱하고, 60초짜리 최종은 노트북에서 20–60분 걸릴 수 있으니 시작 전에 알린다[](source:d-final) |
| 코드 기본값 | 인수를 생략하면 60 fps, 서브프레임 4, 워커 4[](source:d-args) |
| 프레임 수 | `round(duration × fps)`개를 워커 수로 나눠 맡긴다. 이 스킬의 기본 길이로 계산하면 60초 × 60 fps = 3,600프레임, 서브프레임 4개면 스크린샷 14,400장(판정: 계산값)[](source:d-sub) |
| 셔터 | 서브프레임을 반 프레임 길이에 퍼뜨린다(180도 셔터)[](source:d-shutter) |
| 소리 | 페이지에 `buildAudio`가 있을 때만 소리를 입힌 `demo.mp4`를 만든다. 없으면 `demo_silent.mp4`만 남는다(판정: 코드 흐름 읽기)[](source:d-hasaudio) |
| 음량 | `loudnorm=I=-16:TP=-1.5:LRA=11`(약 −16 LUFS), AAC 192k[](source:d-norm) |
| 산출 | `demo.mp4`와 `demo_silent.mp4`[](source:d-final) |

@callout level=warning title="SKILL.md 안의 코드는 읽기만 했다"
스킬 안의 `render.mjs`와 소리 재생 조각은 분석 자료로만 읽었고 실행하지 않았다. 위 수치 중 "코드 기본값"과 "소리", "음량" 행은 코드를 읽어 얻은 값이다. 의무나 권고로 적힌 문장이 아니다.[](source:d-args)[](source:d-norm)

## 흐름 속 위치 {#position}

@workflow id=d-position title="explainer-default 선택 자리"
| pick | 연출 고르기? | external |
| n_default | explainer-default | backend |
| n_engaging | explainer-engaging | backend |
| n_energy | explainer-high-energy | backend |
| pick > n_default | 차분한 데모 | emphasis |
| pick > n_engaging | 원테이크 | dashed |
| pick > n_energy | 빠른 홍보 | dashed |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `explainer-engaging` | - | - | `README.md`가 서로를 "Sister skills"로 부르고 길이와 연출 차이를 표로 비교한다. 사용자가 고르며 순서가 없다[](source:rd-intro)[](source:rd-table) | r06 |
| `explainer-high-energy` | - | - | r06과 같다[](source:rd-intro)[](source:rd-table) | r07 |
| `sound-effects` | - | - | 연결 `미확인`. `sound-effects`는 "코드로 음악·효과음을 합성하지 말라"고 하고, 이 스킬은 `buildAudio`로 직접 합성한다. 서로 부르지 않으며 후속 사용 여부는 원문에 명시 없음[](source:se-nosynth)[](source:d-audio) | r04 |
| `bang-motion` | - | - | 같은 계열(추론). 둘 다 설명·데모 영상을 HTML로 만든다. 직접 연결 없음[](source:d-fm)[](source:bm-desc) | r11 |
| `lemo-opuscar` | - | - | 같은 계열(추론). 이름 붙은 스타일을 고르는 방식이 다르다. 직접 연결 없음[](source:d-fm)[](source:lo-desc) | r13 |

그림은 사용자가 세 스킬 중 하나를 고르는 자리만 그렸다. 세 스킬은 선택지이고 순서가 아니다.[](source:rd-intro)

`sound-effects`와의 관계(r04)는 연결이 확인되지 않아 그리지 않고 표에만 남겼다. 같은 계열 표시도 표에만 있다.

전체 흐름은 `video/_group-product-explainer/product-explainer.html`에 있고, 관계 근거는 `video/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md` 21739B, `README.md` 2156B. 텍스트 2개, 합계 23895B. `README.md`는 SKILL.md가 아닌 안내 문서다. 이 스킬에는 `references/`, `scripts/` 폴더가 없고, `render.mjs`와 소리 재생 코드는 `SKILL.md` 안에 들어 있다.[](source:rd-req)
- 제외한 파일: 번역본은 이 폴더에 없다. `README.md`가 가리키는 `../../docs/*.gif`는 바이너리라 열 수 없어서 읽었다고 하지 않는다.[](source:rd-intro)
- 원문 비교: 같은 이름의 스킬은 다른 컬렉션에 없다. 세 explainer 스킬은 브리프 질문 일곱 개, 사실 규칙, 페이지 계약, 렌더 코드가 거의 같다. 렌더 코드는 `diff`로 대조했고 최종 렌더 명령의 서브프레임 수만 다르다(`explainer-default`는 4, 나머지 둘은 8). 페이지는 스킬마다 따로 읽고 썼다.
- 관계 확인: r04, r06, r07, r11, r13를 `video/relations.md`와 대조했고 원장과 같다. 다른 스킬은 관계 확인용으로 해당 줄만 읽었다.
- 대조 범위: 활성화 제한, 강제·금지, 수치, 종료·승인 조건으로 표에 옮긴 항목은 줄 번호가 붙은 원문과 모두 대조했다. 일반 설명은 전부 읽었으나 줄마다 대조하지는 않았다.
- 실행하지 않았다. 페이지의 동작은 모두 지시상 동작이고, 렌더와 web fetch, 설치 명령은 하나도 돌리지 않았다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
`60초짜리 최종은 노트북에서 20–60분`이라는 문장의 근거 측정은 원문에 없다. 이 분석도 측정하지 않았다.
이 스킬이 반복 재생되는 영상인지(루프)는 원문에 명시 없음. 페이지 계약은 루프를 말하지만 '그 스타일의 이음매 규칙'은 이 스킬에 적혀 있지 않다.[](source:d-contract)
렌더 결과가 실제로 좋은지, 영상과 음악이 설명대로 나오는지는 확인하지 못했다. 이 분석은 SKILL.md의 지시를 읽은 것이고, 영상과 음악의 내용은 분석하지 않았다.
