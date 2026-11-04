# explainer-high-energy 스킬은 에이전트를 어떻게 바꾸나 {#explainer-high-energy-skill}

`explainer-high-energy`를 쓰면 에이전트는 6–8개 장면을 박자 격자 위에 짠다. 장면 전환은 컷이 아니라 도형(번지는 선, 커지는 점)이 다음 장면으로 넘겨주고, 화면 모서리에는 카메라 뷰파인더를 흉내 낸 HUD(화면 위 정보 표시)가 항상 붙는다. 결과물은 12–20초(기본 15초, 128 BPM 8마디)의 빠른 홍보 영상이다.[](source:h-intro)[](source:h-struct)

- 질문은 한 메시지에 모아 한 번만 한다. 제품만 필수이고, 일곱 개 외에 추가 질문은 원문에 명시 없음.[](source:h-ask)
- 장면 전환은 도형으로 한다. 하드 컷은 다운비트에서만, 많아야 두 번 허용한다.[](source:h-trans)
- 증명 장면은 실제 수치가 있을 때만 쓴다. 수치가 없으면 장면을 건너뛰거나 제품의 실제 기능 목록을 쾅 하고 보여 준다.[](source:h-proof)
- 큰 변화는 박자에, 글자 움직임은 1/8이나 1/16 음표에 맞춘다. 최종 렌더는 서브프레임 8개로 오래 돌린다.[](source:h-grid)[](source:h-final)

@answer scope="video/Barty-Bart/explainer-high-energy · 원본 텍스트 2개 · 커밋 23e8047 · 렌더 결과 미확인 · 지시상 동작"
@meta locale=ko
@source h-fm title="video/Barty-Bart/explainer-high-energy/SKILL.md · 20756B · frontmatter" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=1:4
@source h-intro title="SKILL.md · 목적" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=8:10
@source h-ask title="SKILL.md · 질문은 한 메시지" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=14:14
@source h-q1 title="SKILL.md · 질문 1 제품" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=16:16
@source h-q2 title="SKILL.md · 질문 2 기억할 한 가지" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=17:17
@source h-q3 title="SKILL.md · 질문 3 브랜드" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=18:18
@source h-q4 title="SKILL.md · 질문 4 형식" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=19:19
@source h-q5 title="SKILL.md · 질문 5 길이" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=20:20
@source h-q6 title="SKILL.md · 질문 6 음악" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=21:21
@source h-q7 title="SKILL.md · 질문 7 방향" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=22:22
@source h-url title="SKILL.md · URL을 주면 읽는다" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=24:24
@source h-nofact title="SKILL.md · 사실을 지어내지 않는다" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=26:26
@source h-logo title="SKILL.md · 로고" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=28:28
@source h-len title="SKILL.md · 길이" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=30:30
@source h-rules title="SKILL.md · 연출 규칙" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=51:57
@source h-sound title="SKILL.md · 소리 방향" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=61:61
@source h-onefile title="SKILL.md · HTML 한 파일" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=65:65
@source h-contract title="SKILL.md · 페이지 계약" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=68:75
@source h-audio title="SKILL.md · buildAudio" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=102:102
@source h-beat title="SKILL.md · beat sheet 주석" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=118:118
@source h-setup title="SKILL.md · 렌더 준비" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=122:122
@source h-stills title="SKILL.md · 스틸 점검" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=124:124
@source h-draft title="SKILL.md · 초안 렌더" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=125:125
@source h-final title="SKILL.md · 최종 렌더" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=126:126
@source h-deliver title="SKILL.md · 전달" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=127:127
@source h-args title="SKILL.md 안 render.mjs · 인수 기본값" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=140:140
@source h-sub title="SKILL.md 안 render.mjs · 프레임 수와 워커" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=181:181
@source h-shutter title="SKILL.md 안 render.mjs · 서브프레임 셔터" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=194:194
@source h-hasaudio title="SKILL.md 안 render.mjs · buildAudio 유무에 따른 소리 입힘" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=209:210
@source h-norm title="SKILL.md 안 render.mjs · 음량 정규화와 출력" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=222:224
@source rd-intro title="video/Barty-Bart/explainer-high-energy/README.md · 2168B · 안내 문서(SKILL.md 아님)" path=video/Barty-Bart/explainer-high-energy/README.md lines=7:9
@source rd-table title="README.md · 세 스킬 비교표" path=video/Barty-Bart/explainer-high-energy/README.md lines=11:15
@source rd-use title="README.md · 사용법과 산출물" path=video/Barty-Bart/explainer-high-energy/README.md lines=17:21
@source rd-req title="README.md · 요구 사항" path=video/Barty-Bart/explainer-high-energy/README.md lines=23:23
@source se-desc title="video/Barty-Bart/sound-effects/SKILL.md · r04 확인용 description" path=video/Barty-Bart/sound-effects/SKILL.md lines=3:3
@source se-nosynth title="video/Barty-Bart/sound-effects/SKILL.md · r04 확인용 금지 문장" path=video/Barty-Bart/sound-effects/SKILL.md lines=28:28
@source h-struct title="SKILL.md · 장면 6–8개와 박자 격자" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=34:34
@source h-beatintro title="SKILL.md · beat sheet 먼저" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=36:36
@source h-spark title="SKILL.md · 1 스파크 오픈" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=38:38
@source h-slam title="SKILL.md · 2 브랜드 슬램" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=39:39
@source h-triplet title="SKILL.md · 3 키네틱 3연타" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=40:40
@source h-sig title="SKILL.md · 4 시그니처 비주얼" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=41:41
@source h-micro title="SKILL.md · 5 제품 미시 순간" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=42:42
@source h-proof title="SKILL.md · 6 증명" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=43:43
@source h-bridge title="SKILL.md · 7 모프 브리지" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=44:44
@source h-endcard title="SKILL.md · 8 엔드 카드" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=45:45
@source h-notevery title="SKILL.md · 모든 장면이 필요하진 않다" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=47:47
@source h-trans title="SKILL.md · 전환은 도형" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=51:51
@source h-grid title="SKILL.md · 박자 격자" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=52:52
@source h-hud title="SKILL.md · HUD 틀" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=53:53
@source h-texture title="SKILL.md · 질감" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=54:54
@source h-type title="SKILL.md · 글꼴" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=55:55
@source h-pal title="SKILL.md · 팔레트" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=56:56
@source h-banned title="SKILL.md · 금지" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=57:57
@source bm-desc title="video/bangtutorial/bang-motion/SKILL.md · r12 확인용 description" path=video/bangtutorial/bang-motion/SKILL.md lines=3:3
@source br-desc title="video/latent-spaces/brag/SKILL.md · r14 확인용 description" path=video/latent-spaces/brag/SKILL.md lines=3:3

## 언제 켜지고, 무엇을 묻고, 언제 맞지 않나 {#trigger}

@code source=h-fm language=yaml

호출 제한 필드(`disable-model-invocation` 등)가 없고 `name`과 `description`만 있다. 그래서 모델이 `description`을 보고 켤 수도 있고, 사용자가 직접 부를 수도 있다.[](source:h-fm) `README.md`는 Claude Code에서 스킬을 직접 실행하라고 안내하며 `/explainer-default`를 예로 든다.[](source:rd-use)

판정: `description`은 판단용 설명이지 특정 단어가 있으면 켜지는 목록이 아니다. 제품 종류에 대한 활성화 제한은 `description`의 "any product" 외에 원문에 명시 없음.[](source:h-fm)

켜진 뒤 에이전트는 질문을 한 메시지에 모아 묻고, 그다음에는 스스로 진행한다. 제품 하나만 필수다.[](source:h-ask)

| 번호 | 질문 | 필수 여부 | 비워 두면 |
| --- | --- | --- | --- |
| 1 | 제품: 이름과 몇 문장 설명. 웹사이트 URL이면 더 좋다 | 필수(이것만) | -[](source:h-q1)[](source:h-ask) |
| 2 | 시청자가 기억할 한 가지 | 선택 | 에이전트가 정하고 무엇을 골랐는지 말한다[](source:h-q2) |
| 3 | 브랜드: 색, 글꼴, 로고 파일, 또는 "웹사이트를 따른다" | 선택 | 스타일의 기본 팔레트[](source:h-q3) |
| 4 | 형식: 16:9(1920×1080) 또는 9:16(1080×1920) | 선택 | 16:9[](source:h-q4) |
| 5 | 길이 | 선택 | 스타일 기본값[](source:h-q5) |
| 6 | 음악: 가진 파일 경로, 또는 합성 | 선택 | 합성[](source:h-q6) |
| 7 | 방향: 원하는 장면, 태그라인, 행동 유도 문구, 피할 것 | 선택 | 에이전트가 정한다[](source:h-q7) |

이 스킬에는 위 일곱 개 외에 따로 묻는 항목이 원문에 없다(원문에 명시 없음).[](source:h-ask)

기본 길이는 15초이고 범위는 12–20초다. 기본값은 128 BPM으로 8마디다.[](source:h-len)

판정(계산): 8마디 × 4박 = 32박이고, 32박 × 60/128 = 15.0초다. 4/4 박자 가정은 원문에 명시 없음. 같은 계산으로 두 박은 약 0.94초, 세 박은 약 1.41초다.[](source:h-len)[](source:h-triplet)

@callout level=warning title="원문끼리 충돌: 장면 수와 길이"
장면 6–8개를 각 1.5–3초로 잡으면 합이 9–24초인데, 길이 범위는 12–20초다. 둘이 어긋날 때의 우선순위는 원문에 명시 없음.[](source:h-struct)[](source:h-len)

@callout level=warning title="사실을 지어내지 않는다: 의무형 금지"
고객 수, 매출, 평점, 후기, 인용문은 만들지 않는다. 수치는 사용자나 웹사이트가 밝힌 것만 쓰고, 없으면 상대 막대, 진행률, 자리표시 줄로 대신한다.[](source:h-nofact)
UI 안의 예시 내용(프롬프트, 파일 이름, 프로젝트 이름, 영수증 가격)은 그럴듯하게 써도 된다. 제품 자체에 대한 주장(통계, 사용자 수, 평점, "무료" 같은 제안)은 안 된다.[](source:h-nofact)
행동 유도 문구는 사용자나 웹사이트가 준 URL이나 제안만 쓴다. 없으면 이름과 태그라인으로 끝낸다.[](source:h-nofact)
로고는 사용자가 파일을 줬거나 사용자 본인 제품이고 요청했을 때만 쓴다. 아니면 이름을 브랜드 글꼴 텍스트로 쓴다. 제3자 로고도 파일이 있을 때만 쓰고, 없으면 이름이 든 둥근 타일로 대신한다.[](source:h-logo)

원문은 '이럴 때는 쓰지 말라'는 목록을 따로 두지 않는다(원문에 명시 없음). 아래 표는 원문의 규칙과 `README.md`의 형제 스킬 비교에서 끌어낸 판정이다.[](source:rd-table)

| 요청 | 이 스킬 | 판정과 근거 |
| --- | --- | --- |
| 12–20초의 홍보, 티저, 런치 스팅 | {good:맞다} | `description`의 범위다.[](source:h-fm) |
| 기능을 하나씩 차분히 보여 주는 1분 안팎의 데모 | {caution:다른 스킬} | `README.md`는 기본 60초인 `explainer-default`를 따로 둔다. 범위 밖 요청의 처리는 원문에 명시 없음.[](source:rd-table) |
| 컷 없이 한 번에 이어지는 영상 | {caution:다른 스킬} | `README.md`는 12초 반복의 `explainer-engaging`을 따로 둔다.[](source:rd-table) |
| 실제 수치가 없는데 증명 장면이 필요한 요청 | {caution:장면을 뺀다} | 수치가 없으면 증명 장면을 건너뛰거나 실제 기능 목록으로 대신한다.[](source:h-proof) |
| 움직임 없는 장면, 이모지, 한 장면에 3색 초과를 요구하는 요청 | {bad:금지} | 모두 금지 목록에 있다. 3색 계산에서 검정과 흰색은 뺀다.[](source:h-banned) |

## 어떤 순서로 만들고, 사람은 어디서 끼어드나 {#flow}

흐름은 원문의 Step 1–3이다. 대본 단계는 beat sheet를 먼저 쓰는 일이고, 장면, 박자 격자 위의 시작 시간, 들어오는 도형과 나가는 도형, 소리를 적는다.[](source:h-beatintro)

@workflow id=h-flow title="작업 흐름과 사람 개입"
| lane brief | 브리프 |
| lane build | 제작 |
| lane render | 렌더와 전달 |
| ask | 질문 한 번 | external | brief |
| script | beat sheet | backend | brief |
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

@steps id=h-steps
| ask | 질문 한 번 | 에이전트가 질문을 한 메시지에 모아 던진다. 제품만 필수이고 빈 칸은 직접 정해 무엇을 골랐는지 말한다. URL이 있으면 `web fetch`로 읽어 실제 문구·기능·색·글꼴 이름을 확인하고 UI 라벨과 태그라인에 그 말을 쓴다.[](source:h-ask)[](source:h-url) | h-flow | ask |
| script | beat sheet | 에이전트가 장면, 박자 격자 위 시작 시간, 들어오는 도형, 나가는 도형, 소리를 적은 beat sheet를 먼저 쓴다. 장면은 6–8개, 장면당 1.5–3초, 120–140 BPM 격자를 쓴다.[](source:h-beatintro)[](source:h-struct) | h-flow | script |
| page | HTML 페이지 | 에이전트가 인라인 CSS·JS의 HTML 한 파일을 쓴다. 이미지는 사용자가 준 것만 넣는다. `VIDEO`, `seek(t)`, `buildAudio(ctx)`를 만들고 맨 위에 beat sheet를 주석으로 둔다.[](source:h-onefile)[](source:h-beat) | h-flow | page |
| stills | 스틸 점검? | `render.mjs --stills`로 beat sheet 행마다 한 장씩 뽑아 본다. 잘림, 겹침, 읽기 어려움, 브랜드 이탈, 나쁜 구도, 빈 화면이 있으면 고치고 다시 본다. 반복 횟수 제한은 원문에 명시 없음.[](source:h-stills) | h-flow | stills |
| draft | 초안 MP4 | 30 fps, 모션 블러 없음, 워커 4개로 빠르게 렌더한다. 이것이 검토용 사본이다.[](source:h-draft) | h-flow | draft |
| review | 사용자 검토 | 에이전트가 초안과 HTML을 사용자에게 보내고 최종 전에 수정 의견을 묻는다. 답이 올 때까지 멈추는지는 원문에 명시 없음.[](source:h-draft) | h-flow | review |
| final | 최종 MP4 | `node render.mjs demo.html demo.mp4 60 8 8`로 렌더한다. 오래 걸리니 시작 전에 사용자에게 알린다.[](source:h-final) | h-flow | final |
| deliver | 전달 | HTML, MP4들, 짧은 노트(beat sheet, 자리표시인 것, 두 번째 버전에서 바꿀 것)를 내고 대안 연출을 한 문장으로 제안한다.[](source:h-deliver) | h-flow | deliver |

@callout level=note title="사람이 끼어드는 곳과 끝나는 곳"
사람이 하는 일은 세 번이다. 처음 질문 메시지에 답하고, 초안을 보고 수정 의견을 주고, 최종 렌더가 오래 걸린다는 안내를 받는다.[](source:h-ask)[](source:h-draft)[](source:h-final)
최종 렌더를 시작해도 되는지 승인을 받으라는 문장은 없다. 원문은 초안을 보내 "최종 전에 수정을 요청하라"고만 쓴다. 판정: 이 승인 지점의 엄격함은 원문에 명시 없음.[](source:h-draft)
끝 조건은 전달 단계의 산출물과 노트를 내는 것이다. 노트에 '두 번째 버전에서 바꿀 것'을 적으라는 지시는 있지만, 이후 사용자 요청을 어떻게 이어받는지는 원문에 명시 없음.[](source:h-deliver)

렌더 준비도 지시로 적혀 있다. `npm i playwright`, 필요하면 `npx playwright install chromium`, `ffmpeg`가 `PATH`에 있어야 하고, 스킬 맨 아래 스크립트를 `render.mjs`로 저장한다.[](source:h-setup) `README.md`는 Node 18 이상, ffmpeg, Playwright를 요구 사항으로 적는다.[](source:rd-req) 이 분석은 이 중 어느 것도 실행하지 않았다.

## 연출은 무엇을 강제하나 {#style}

핵심 규칙은 하나다. 전환은 객체가 넘기고, 모든 변화는 박자 격자에 놓인다.[](source:h-trans)[](source:h-grid)

원문은 장면 유형 여덟 개를 주고 "여기서 골라 제품을 대응시키라"고 한다. 순서를 강제하는지는 원문에 명시 없다. 아래 그림은 목록 순서를 그대로 그린 것이다.[](source:h-struct)

@workflow id=energy-scenes title="장면 유형: 목록 순서와 건너뛸 수 있는 장면"
| sc_spark | 스파크 오픈 |
| sc_slam | 브랜드 슬램 |
| sc_triple | 키네틱 3연타 |
| sc_sig | 시그니처 비주얼 |
| sc_micro | 제품 미시 순간 |
| sc_proof | 증명(선택) |
| sc_bridge | 모프 브리지 |
| sc_end | 엔드 카드 |
| sc_spark > sc_slam | 플러드 |
| sc_slam > sc_triple | 마침표 |
| sc_triple > sc_sig | |
| sc_sig > sc_micro | |
| sc_micro > sc_proof | 실제 수치 | dashed |
| sc_proof > sc_bridge | | dashed |
| sc_micro > sc_bridge | 수치 없음 |
| sc_bridge > sc_end | | emphasis |

모든 장면이 필요하지는 않다. 강한 6개가 약한 8개보다 낫고, 장면마다 아이디어는 하나다.[](source:h-notevery)

| 장면 | 내용 | 수치와 구분 |
| --- | --- | --- |
| 스파크 오픈 | 거의 검은 캔버스와 희미한 격자. 작은 강조 마크가 맥박치다 가는 가로선으로 늘어나 모노 라벨을 달고 한 번 출렁인 뒤, 세로로 번져 강조색이 화면을 채운다. 그 플러드가 다음 배경이다[](source:h-spark) | 서술 |
| 브랜드 슬램 | 제품 이름을 굵은 그로테스크 대문자로 크게. 글자는 연속하는 1/16박마다 마스크로 드러나고, 위에 모노 키커, 아래에 이탤릭 세리프 한 줄(2–4단어). 굵기를 가늘게에서 검게 바꿀 수 있고, 마침표나 글자 점이 떨어져 나와 커지며 다음 장면의 도형이 된다[](source:h-slam) | 1/16박, 2–4단어 |
| 키네틱 3연타 | 가치 제안을 짧은 말 세 개로. 한 개당 두 박(손글씨는 읽을 수 있게 세 박)이고, 각각 자기 배경과 처리로 박자에 맞춰 하드 스왑한다. 이 안의 스왑은 컷으로 세지 않는다. 단어는 빠른 블러·슬라이드로 들어와 살짝 넘쳤다 앉는다[](source:h-triplet) | 두 박 또는 세 박 |
| 시그니처 비주얼 | 제품을 상징하는 "어떻게 만들었지" 순간 하나. 큐브 필드(쌓는 제품), 파티클 흐름(데이터·AI), 액체 덩어리(유연성) 중 고른다. 카메라는 천천히 기울거나 돈다[](source:h-sig) | 선택지 3개 중 1개 |
| 제품 미시 순간 | 3D로 살짝 기울어진 떠 있는 UI 카드 하나와 뒤에 겹친 유령 카드 둘. 커서가 토글을 튕기고, 주 버튼을 누르고, 진행 막대가 강조색으로 퍼센트와 함께 차고, 버튼이 `Done ✓`가 되고, 오른쪽 위에 토스트가 미끄러져 온다. 라벨은 제품의 실제 것을 쓴다[](source:h-micro) | 서술 |
| 증명 | 실제 수치가 있을 때만. 카운트업, 도넛 링, 막대와 선. 없으면 건너뛰거나 실제 기능 목록을 쾅 하고 띄운다[](source:h-proof) | 선택 |
| 모프 브리지 | 앞 장면의 도형이 점으로 접히고, 점이 어두운 배경 위 링 펄스가 되고, 그것이 로고의 점이 된다[](source:h-bridge) | 서술 |
| 엔드 카드 | 2초 유지. 강조 점이 있는 로고나 이름, 이탤릭 세리프 태그라인, 글자씩 타이핑되는 모노 한 줄(실제 URL이나 행동 유도 문구, 없으면 브리프의 짧은 한 줄), 머리카락 선[](source:h-endcard) | 2초 유지 |

| 규칙 | 내용 | 구분 |
| --- | --- | --- |
| 전환은 객체 | 모든 장면이 도형(플러드, 자라는 막대의 와이프, 다음 배경으로 커지는 점, 카메라를 뚫는 단어)으로 다음에 넘긴다. 하드 컷은 다운비트에서 많아야 두 번[](source:h-trans) | 의무와 한도 |
| 박자 격자 | 큰 변화는 박자에, 글자는 1/8이나 1/16 음표에. 충격은 약간 넘쳤다 앉는다(`z` ≈ 0.6–0.7)[](source:h-grid) | 의무와 권고 |
| HUD 틀 | 모든 장면에 모서리 괄호, 오른쪽 위 `SCENE 02 / 07`, 왼쪽 아래 카테고리 라벨, 오른쪽 아래 빨간 점 달린 타임코드. 1080p에서 12–14px, 불투명도 약 50%[](source:h-hud) | 의무와 권고 |
| 질감 | 평평한 배경마다 부드러운 방사형 비네트, 아주 약한 필름 그레인(시드로 미리 만든 몇 장을 순환), 진짜 모션 블러[](source:h-texture) | 의무 |

@facts id=energy-look
| 글꼴 | 굵은 그로테스크는 Inter Tight 900이나 Archivo Black, 사람의 한 줄은 이탤릭 Instrument Serif, HUD와 캡션은 JetBrains Mono나 Geist Mono. 브랜드 글꼴이 있으면 이름에 쓰고 모노는 HUD에 남긴다[](source:h-type) |
| 팔레트 | 잉크 `#0B0B10`, 강조 `#FF4F1A`, 크림 `#EDEBE4`, 일렉트릭 블루 `#2F47FF`, 흰색. 브랜드 주색이 강조를, 보조색이 블루를 대체하고, 한 색 브랜드는 그 색의 짙은 톤을 보조색으로 쓴다[](source:h-pal) |
| 소리 | 128 BPM(또는 사용자 트랙). 매 박 킥, 2박·4박 클랩, 장면 루트를 따르는 서브 베이스, 슬램과 엔드 카드 앞의 필터 라이저, 플러드마다 임팩트(낮은 붐과 노이즈 버스트), 타이핑된 단어마다 짧은 톤 블립, 도형 전환마다 whoosh, 엔드 카드의 부드러운 링아웃. 음악은 히트 아래에 깐다[](source:h-sound) |

@callout level=warning title="금지"
스톡 템플릿 같은 모양, 모든 곳의 글로우, 이모지, 한 장면에 3색 초과(검정·흰색은 세지 않음), 한눈에 읽기 어려운 작은 글자, 움직임 없는 장면은 쓰지 않는다.[](source:h-banned)

## 페이지와 렌더는 무엇을 지켜야 하나 {#contract}

이 스킬이 가장 단단히 묶는 부분이다. 연출은 취향 문제지만 아래 계약을 어기면 렌더가 틀어진다고 원문이 못박는다.[](source:h-contract)

| 규칙 | 내용 | 구분 |
| --- | --- | --- |
| `window.VIDEO`, `window.seek(t)` | `VIDEO = {w, h, duration}`. `seek(t)`는 시간 `t`(초)만으로 모든 요소를 정하는 순수 함수다. CSS transition·animation, `setTimeout`, 이전 프레임 상태는 쓰지 않는다. 어느 프레임이든 혼자, 어떤 순서로든 맞게 그려져야 한다[](source:h-contract) | 의무 |
| 난수 | 시드를 준 생성기만 쓴다. `Math.random`은 쓰지 않는다[](source:h-contract) | 금지 |
| 이력이 필요한 값 | 뒤처지는 카메라나 시뮬레이션은 로드 때 한 번 미리 계산해 저장(bake)한다. 0부터 `duration`까지 1/240초 간격으로 돌려 값을 저장하고, `seek`가 보간해 읽는다[](source:h-contract) | 의무 |
| 루프 | `seek(t)`는 `t % duration`을 쓰고, 이음매에 걸치는 효과는 양쪽 끝에 그리거나 섞는다[](source:h-contract) | 서술 |
| `?render` | 주소에 있으면 컨트롤과 미리보기 스케일이 없고 화면 영역(stage)이 정확히 `w × h`로 좌상단에 놓인다. 없으면 창에 맞춰 CSS로 줄이고 컨트롤을 보여 준다[](source:h-contract) | 서술 |
| 글꼴 | woff2를 받아 base64 `@font-face`로 넣는다. 렌더가 조용히 대체 글꼴로 떨어지지 않게 한다[](source:h-contract) | 의무 |
| 레이어 | 장면 레이어 배경은 투명, 바탕색은 stage 하나가 준다. 절대 위치 텍스트에는 `white-space: nowrap`[](source:h-contract) | 의무 |
| 속도 | 큰 CSS `filter: blur()`와 큰 블러 그라디언트는 스크린샷이 매우 느리다. canvas에 한 번 그려 두고 그것을 움직인다[](source:h-contract) | 권고 |
| `window.buildAudio(ctx)` | 음악과 효과음 전체를 시간 0부터, 받은 `AudioContext`나 `OfflineAudioContext`에 시각 쪽과 같은 시간표로 예약한다. 사용자 음악 파일이 있으면 `fetch`와 `decodeAudioData`로 읽고 박자 격자를 측정해 맞춘 뒤 효과음만 얹는다[](source:h-audio) | 의무 |
| beat sheet 주석 | 스크립트 맨 위에 순간마다 시간, 일어나는 일, 소리를 한 행씩 적는다[](source:h-beat) | 의무 |

@facts id=h-render-facts
| 스틸 점검 | `--stills 0.5,1.2,…`: beat sheet 행마다 시각 하나, 시트는 한 줄에 3장[](source:h-stills) |
| 초안 | `node render.mjs demo.html draft.mp4 30 1 4`: 30 fps, 서브프레임 1(모션 블러 없음), 워커 4. 마지막 수는 머신의 코어 수로 바꾸라는 권고[](source:h-draft) |
| 최종 | `node render.mjs demo.html demo.mp4 60 8 8`: 60 fps, 서브프레임 8, 워커 8. 모션 블러는 렌더 시간을 서브프레임 수만큼 곱하고, 60초짜리 최종은 노트북에서 20–60분 걸릴 수 있으니 시작 전에 알린다[](source:h-final) |
| 코드 기본값 | 인수를 생략하면 60 fps, 서브프레임 4, 워커 4[](source:h-args) |
| 프레임 수 | `round(duration × fps)`개를 워커 수로 나눠 맡긴다. 이 스킬의 기본 길이로 계산하면 15초 × 60 fps = 900프레임, 서브프레임 8개면 스크린샷 7,200장(판정: 계산값)[](source:h-sub) |
| 셔터 | 서브프레임을 반 프레임 길이에 퍼뜨린다(180도 셔터)[](source:h-shutter) |
| 소리 | 페이지에 `buildAudio`가 있을 때만 소리를 입힌 `demo.mp4`를 만든다. 없으면 `demo_silent.mp4`만 남는다(판정: 코드 흐름 읽기)[](source:h-hasaudio) |
| 음량 | `loudnorm=I=-16:TP=-1.5:LRA=11`(약 −16 LUFS), AAC 192k[](source:h-norm) |
| 산출 | `demo.mp4`와 `demo_silent.mp4`[](source:h-final) |

@callout level=warning title="SKILL.md 안의 코드는 읽기만 했다"
스킬 안의 `render.mjs`와 소리 재생 조각은 분석 자료로만 읽었고 실행하지 않았다. 위 수치 중 "코드 기본값"과 "소리", "음량" 행은 코드를 읽어 얻은 값이다. 의무나 권고로 적힌 문장이 아니다.[](source:h-args)[](source:h-norm)

## 흐름 속 위치 {#position}

@workflow id=h-position title="explainer-high-energy 선택 자리"
| pick | 연출 고르기? | external |
| n_default | explainer-default | backend |
| n_engaging | explainer-engaging | backend |
| n_energy | explainer-high-energy | backend |
| pick > n_default | 차분한 데모 | dashed |
| pick > n_engaging | 원테이크 | dashed |
| pick > n_energy | 빠른 홍보 | emphasis |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `explainer-default` | - | - | `README.md`가 서로를 "Sister skills"로 부르고 길이와 연출 차이를 표로 비교한다. 사용자가 고르며 순서가 없다[](source:rd-intro)[](source:rd-table) | r07 |
| `explainer-engaging` | - | - | r07과 같다[](source:rd-intro)[](source:rd-table) | r08 |
| `sound-effects` | - | - | 연결 `미확인`. `sound-effects`는 "코드로 음악·효과음을 합성하지 말라"고 하고, 이 스킬은 `buildAudio`로 직접 합성한다. 서로 부르지 않으며 후속 사용 여부는 원문에 명시 없음[](source:se-nosynth)[](source:h-audio) | r04 |
| `bang-motion` | - | - | 같은 계열(추론). 둘 다 홍보 영상·티저·오프너를 코드로 만든다. 직접 연결 없음[](source:h-fm)[](source:bm-desc) | r12 |
| `brag` | - | - | 같은 계열(추론). 둘 다 제품 홍보·출시 영상을 코드에서 만든다. `brag`는 프로젝트 코드를 읽고, 이 스킬은 질문으로 받는다. 직접 연결 없음[](source:h-fm)[](source:br-desc) | r14 |

그림은 사용자가 세 스킬 중 하나를 고르는 자리만 그렸다. 세 스킬은 선택지이고 순서가 아니다.[](source:rd-intro)

`sound-effects`와의 관계(r04)는 연결이 확인되지 않아 그리지 않고 표에만 남겼다. 같은 계열 표시도 표에만 있다.

전체 흐름은 `video/_group-product-explainer/product-explainer.html`에 있고, 관계 근거는 `video/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md` 20756B, `README.md` 2168B. 텍스트 2개, 합계 22924B. `README.md`는 SKILL.md가 아닌 안내 문서다. 이 스킬에는 `references/`, `scripts/` 폴더가 없고, `render.mjs`와 소리 재생 코드는 `SKILL.md` 안에 들어 있다.[](source:rd-req)
- 제외한 파일: 번역본은 이 폴더에 없다. `README.md`가 가리키는 `../../docs/*.gif`는 바이너리라 열 수 없어서 읽었다고 하지 않는다.[](source:rd-intro)
- 원문 비교: 같은 이름의 스킬은 다른 컬렉션에 없다. 세 explainer 스킬은 브리프 질문 일곱 개, 사실 규칙, 페이지 계약, 렌더 코드가 거의 같다. 렌더 코드는 `diff`로 대조했고 최종 렌더 명령의 서브프레임 수만 다르다(`explainer-default`는 4, 나머지 둘은 8). 페이지는 스킬마다 따로 읽고 썼다.
- 관계 확인: r04, r07, r08, r12, r14를 `video/relations.md`와 대조했고 원장과 같다. 다른 스킬은 관계 확인용으로 해당 줄만 읽었다.
- 대조 범위: 활성화 제한, 강제·금지, 수치, 종료·승인 조건으로 표에 옮긴 항목은 줄 번호가 붙은 원문과 모두 대조했다. 일반 설명은 전부 읽었으나 줄마다 대조하지는 않았다.
- 실행하지 않았다. 페이지의 동작은 모두 지시상 동작이고, 렌더와 web fetch, 설치 명령은 하나도 돌리지 않았다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
`60초짜리 최종은 노트북에서 20–60분`이라는 문장은 세 스킬이 공유한다. 이 스킬의 기본은 15초라서 그 수치가 그대로 맞는지는 원문에 명시 없다. 측정하지 않았다.
키네틱 3연타는 '말 세 개'라고 하면서 처리 네 가지(크림 위 어두운 글자, 검정 위 강조색 외곽선 반복, 파랑 위 흰 글자와 뷰파인더, 손글씨)를 나열한다. 어느 처리가 어느 말에 붙는지는 원문에 명시 없음.[](source:h-triplet)
렌더 결과가 실제로 좋은지, 영상과 음악이 설명대로 나오는지는 확인하지 못했다. 이 분석은 SKILL.md의 지시를 읽은 것이고, 영상과 음악의 내용은 분석하지 않았다.
