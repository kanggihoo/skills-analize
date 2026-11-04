# explainer-engaging 스킬은 에이전트를 어떻게 바꾸나 {#explainer-engaging-skill}

`explainer-engaging`을 쓰면 에이전트는 제품의 워크플로 단계를 '스테이션'으로 바꿔 큰 캔버스 하나에 깔고, 주인공 요소 하나가 그 위를 지나가게 짠다. 카메라는 컷 없이 주인공을 따라가다 마지막에 코스 전체를 보여 주고, 다시 처음으로 돌아가 루프가 닫힌다. 결과물은 10–30초(기본 12초)의 원테이크 영상이다.[](source:e-intro)

- 질문은 한 메시지에 모아 한 번만 한다. 제품만 필수이고, 제품의 워크플로를 3–6단계로 함께 묻는다.[](source:e-ask)[](source:e-extra)
- 컷, 검은 화면으로의 페이드, 장면을 설명하는 글자 오버레이, 두 번째 주인공, 반응하지 않는 스테이션은 쓰지 않는다.[](source:e-banned)
- 루프의 이음매는 영웅이 첫 스테이션에 착지하는 순간이어야 하고, `seek(duration)`은 `seek(0)`과 똑같이 보여야 한다.[](source:e-seam)
- 최종 렌더 전에 초안 MP4로 사용자 의견을 받고, 최종 렌더는 서브프레임 8개로 오래 돌리니 시작 전에 알린다.[](source:e-draft)[](source:e-final)

@answer scope="video/Barty-Bart/explainer-engaging · 원본 텍스트 2개 · 커밋 23e8047 · 렌더 결과 미확인 · 지시상 동작"
@meta locale=ko
@source e-fm title="video/Barty-Bart/explainer-engaging/SKILL.md · 23722B · frontmatter" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=1:4
@source e-intro title="SKILL.md · 목적" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=8:12
@source e-ask title="SKILL.md · 질문은 한 메시지" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=16:16
@source e-q1 title="SKILL.md · 질문 1 제품" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=18:18
@source e-q2 title="SKILL.md · 질문 2 기억할 한 가지" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=19:19
@source e-q3 title="SKILL.md · 질문 3 브랜드" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=20:20
@source e-q4 title="SKILL.md · 질문 4 형식" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=21:21
@source e-q5 title="SKILL.md · 질문 5 길이" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=22:22
@source e-q6 title="SKILL.md · 질문 6 음악" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=23:23
@source e-q7 title="SKILL.md · 질문 7 방향" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=24:24
@source e-url title="SKILL.md · URL을 주면 읽는다" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=26:26
@source e-nofact title="SKILL.md · 사실을 지어내지 않는다" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=28:28
@source e-logo title="SKILL.md · 로고" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=30:30
@source e-extra title="SKILL.md · 추가 선택 질문" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=32:32
@source e-len title="SKILL.md · 길이" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=34:34
@source e-rules title="SKILL.md · 연출 규칙" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=87:90
@source e-sound title="SKILL.md · 소리 방향" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=94:94
@source e-onefile title="SKILL.md · HTML 한 파일" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=98:98
@source e-contract title="SKILL.md · 페이지 계약" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=101:108
@source e-audio title="SKILL.md · buildAudio" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=135:135
@source e-beat title="SKILL.md · beat sheet 주석" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=151:151
@source e-setup title="SKILL.md · 렌더 준비" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=155:155
@source e-stills title="SKILL.md · 스틸 점검" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=157:157
@source e-draft title="SKILL.md · 초안 렌더" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=158:158
@source e-final title="SKILL.md · 최종 렌더" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=159:159
@source e-deliver title="SKILL.md · 전달" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=160:160
@source e-args title="SKILL.md 안 render.mjs · 인수 기본값" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=173:173
@source e-sub title="SKILL.md 안 render.mjs · 프레임 수와 워커" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=214:214
@source e-shutter title="SKILL.md 안 render.mjs · 서브프레임 셔터" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=227:227
@source e-hasaudio title="SKILL.md 안 render.mjs · buildAudio 유무에 따른 소리 입힘" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=242:243
@source e-norm title="SKILL.md 안 render.mjs · 음량 정규화와 출력" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=255:257
@source rd-intro title="video/Barty-Bart/explainer-engaging/README.md · 2174B · 안내 문서(SKILL.md 아님)" path=video/Barty-Bart/explainer-engaging/README.md lines=7:9
@source rd-table title="README.md · 세 스킬 비교표" path=video/Barty-Bart/explainer-engaging/README.md lines=11:15
@source rd-use title="README.md · 사용법과 산출물" path=video/Barty-Bart/explainer-engaging/README.md lines=17:21
@source rd-req title="README.md · 요구 사항" path=video/Barty-Bart/explainer-engaging/README.md lines=23:23
@source se-desc title="video/Barty-Bart/sound-effects/SKILL.md · r04 확인용 description" path=video/Barty-Bart/sound-effects/SKILL.md lines=3:3
@source se-nosynth title="video/Barty-Bart/sound-effects/SKILL.md · r04 확인용 금지 문장" path=video/Barty-Bart/sound-effects/SKILL.md lines=28:28
@source e-hero title="SKILL.md · 영웅 고르기" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=40:40
@source e-mech title="SKILL.md · 스테이션 장치표" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=48:55
@source e-labels title="SKILL.md · 스테이션 문구" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=57:57
@source e-world title="SKILL.md · 월드 배치" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=61:61
@source e-roll title="SKILL.md · 구르기" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=67:67
@source e-hops title="SKILL.md · 도약과 낙하" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=68:68
@source e-impact title="SKILL.md · 충격" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=69:69
@source e-launch title="SKILL.md · 발사" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=70:70
@source e-seam title="SKILL.md · 이음매" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=71:71
@source e-gravity title="SKILL.md · 옆에서 본 중력" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=72:72
@source e-slot title="SKILL.md · 빈 슬롯" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=73:73
@source e-camhard title="SKILL.md · 카메라가 가장 어렵다" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=77:77
@source e-follow title="SKILL.md · 팔로우" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=79:79
@source e-zoom title="SKILL.md · 줌" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=80:80
@source e-payoff title="SKILL.md · 페이오프 유지" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=81:81
@source e-reveal title="SKILL.md · 리빌과 다이브" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=82:82
@source e-blur title="SKILL.md · 모션 블러" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=83:83
@source e-pal title="SKILL.md · 팔레트" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=87:87
@source e-ui title="SKILL.md · 시스템 UI" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=88:88
@source e-cursor title="SKILL.md · 커서" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=89:89
@source e-banned title="SKILL.md · 금지" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=90:90

## 언제 켜지고, 무엇을 묻고, 언제 맞지 않나 {#trigger}

@code source=e-fm language=yaml

호출 제한 필드(`disable-model-invocation` 등)가 없고 `name`과 `description`만 있다. 그래서 모델이 `description`을 보고 켤 수도 있고, 사용자가 직접 부를 수도 있다.[](source:e-fm) `README.md`는 Claude Code에서 스킬을 직접 실행하라고 안내하며 `/explainer-default`를 예로 든다.[](source:rd-use)

판정: `description`은 판단용 설명이지 특정 단어가 있으면 켜지는 목록이 아니다. 제품 종류에 대한 활성화 제한은 `description`의 "any product" 외에 원문에 명시 없음.[](source:e-fm)

켜진 뒤 에이전트는 질문을 한 메시지에 모아 묻고, 그다음에는 스스로 진행한다. 제품 하나만 필수다.[](source:e-ask)

| 번호 | 질문 | 필수 여부 | 비워 두면 |
| --- | --- | --- | --- |
| 1 | 제품: 이름과 몇 문장 설명. 웹사이트 URL이면 더 좋다 | 필수(이것만) | -[](source:e-q1)[](source:e-ask) |
| 2 | 시청자가 기억할 한 가지 | 선택 | 에이전트가 정하고 무엇을 골랐는지 말한다[](source:e-q2) |
| 3 | 브랜드: 색, 글꼴, 로고 파일, 또는 "웹사이트를 따른다" | 선택 | 스타일의 기본 팔레트[](source:e-q3) |
| 4 | 형식: 16:9(1920×1080) 또는 9:16(1080×1920) | 선택 | 16:9[](source:e-q4) |
| 5 | 길이 | 선택 | 스타일 기본값[](source:e-q5) |
| 6 | 음악: 가진 파일 경로, 또는 합성 | 선택 | 합성[](source:e-q6) |
| 7 | 방향: 원하는 장면, 태그라인, 행동 유도 문구, 피할 것 | 선택 | 에이전트가 정한다[](source:e-q7) |

선택 질문이 하나 더 있다. 제품의 워크플로 3–6단계(사용자가 하는 일, 제품이 하는 일, 결과)다. URL이 있으면 사이트에서 뽑는다.[](source:e-extra)

기본 길이는 12초의 끊김 없는 루프이고 범위는 10–30초다. 길어지면 스테이션이 늘어날 뿐 스테이션이 느려지지는 않는다.[](source:e-len)

판정(계산): 페이오프 유지 0.4–0.6초와 리빌 유지 약 1초를 빼면 12초 중 약 10.4–10.6초가 스테이션 3–6개 몫이다. 리빌 이동과 다이브 시간은 원문에 명시 없어 뺐다.[](source:e-payoff)[](source:e-reveal)

@callout level=warning title="사실을 지어내지 않는다: 의무형 금지"
고객 수, 매출, 평점, 후기, 인용문은 만들지 않는다. 수치는 사용자나 웹사이트가 밝힌 것만 쓰고, 없으면 상대 막대, 진행률, 자리표시 줄로 대신한다.[](source:e-nofact)
UI 안의 예시 내용(프롬프트, 파일 이름, 프로젝트 이름, 영수증 가격)은 그럴듯하게 써도 된다. 제품 자체에 대한 주장(통계, 사용자 수, 평점, "무료" 같은 제안)은 안 된다.[](source:e-nofact)
행동 유도 문구는 사용자나 웹사이트가 준 URL이나 제안만 쓴다. 없으면 이름과 태그라인으로 끝낸다.[](source:e-nofact)
로고는 사용자가 파일을 줬거나 사용자 본인 제품이고 요청했을 때만 쓴다. 아니면 이름을 브랜드 글꼴 텍스트로 쓴다. 제3자 로고도 파일이 있을 때만 쓰고, 없으면 이름이 든 둥근 타일로 대신한다.[](source:e-logo)

원문은 '이럴 때는 쓰지 말라'는 목록을 따로 두지 않는다(원문에 명시 없음). 아래 표는 원문의 금지 규칙과 `README.md`의 형제 스킬 비교에서 끌어낸 판정이다.[](source:rd-table)

| 요청 | 이 스킬 | 판정과 근거 |
| --- | --- | --- |
| 10–30초, 3–6단계 워크플로를 한 번에 이어 보여 주는 반복 영상 | {good:맞다} | `description`과 기본값이다.[](source:e-fm)[](source:e-len) |
| 화면에 설명 문구를 얹어야 하는 영상 | {bad:금지} | 설명하는 글자 오버레이를 금지하고 스테이션 자체의 라벨만 글자로 둔다.[](source:e-banned) |
| 장면 컷이나 페이드로 이어 붙이는 영상 | {bad:금지} | 컷과 검은 화면으로의 페이드를 금지한다.[](source:e-banned) |
| 주인공이 둘 이상인 이야기 | {bad:금지} | 주인공은 하나이고 사라지거나 바뀌지 않는다.[](source:e-hero)[](source:e-banned) |
| 1분 안팎의 차분한 기능 데모 | {caution:다른 스킬} | `README.md`는 기본 60초인 `explainer-default`를 따로 둔다. 범위 밖 요청의 처리는 원문에 명시 없음.[](source:rd-table) |
| 한 경로로 펼치기 어려운 워크플로 | {caution:맞지 않을 수 있다} | 판정: 스테이션을 방문 순서대로 한 캔버스에 놓는 것이 전제다.[](source:e-world) |

## 어떤 순서로 만들고, 사람은 어디서 끼어드나 {#flow}

흐름은 원문의 Step 1–3이다. 다만 대본 단계가 '코스 설계'로 바뀐다. 영웅을 고르고, 스테이션에 대응시키고, 캔버스에 배치하고, 경로와 카메라를 정하는 순서이며 카메라가 가장 어렵다고 원문이 말한다.[](source:e-camhard)

@workflow id=e-flow title="작업 흐름과 사람 개입"
| lane brief | 브리프 |
| lane build | 제작 |
| lane render | 렌더와 전달 |
| ask | 질문 한 번 | external | brief |
| script | 코스 설계 | backend | brief |
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

@steps id=e-steps
| ask | 질문 한 번 | 에이전트가 질문을 한 메시지에 모아 던진다. 제품만 필수이고 빈 칸은 직접 정해 무엇을 골랐는지 말한다. URL이 있으면 `web fetch`로 읽어 실제 문구·기능·색·글꼴 이름을 확인하고 UI 라벨과 태그라인에 그 말을 쓴다.[](source:e-ask)[](source:e-url) | e-flow | ask |
| script | 코스 설계 | 에이전트가 영웅 하나를 고르고, 워크플로 각 단계를 영웅이 몸으로 건드리는 스테이션에 대응시키고, 한 캔버스에 배치하고, 영웅의 경로와 카메라를 정한다. 카메라를 다른 무엇보다 먼저 맞춘다.[](source:e-hero)[](source:e-camhard) | e-flow | script |
| page | HTML 페이지 | 에이전트가 인라인 CSS·JS의 HTML 한 파일을 쓴다. 이미지는 사용자가 준 것만 넣는다. `VIDEO`, `seek(t)`, `buildAudio(ctx)`를 만들고 맨 위에 beat sheet를 주석으로 둔다.[](source:e-onefile)[](source:e-beat) | e-flow | page |
| stills | 스틸 점검? | `render.mjs --stills`로 beat sheet 행마다 한 장씩 뽑아 본다. 잘림, 겹침, 읽기 어려움, 브랜드 이탈, 나쁜 구도, 빈 화면이 있으면 고치고 다시 본다. 반복 횟수 제한은 원문에 명시 없음.[](source:e-stills) | e-flow | stills |
| draft | 초안 MP4 | 30 fps, 모션 블러 없음, 워커 4개로 빠르게 렌더한다. 이것이 검토용 사본이다.[](source:e-draft) | e-flow | draft |
| review | 사용자 검토 | 에이전트가 초안과 HTML을 사용자에게 보내고 최종 전에 수정 의견을 묻는다. 답이 올 때까지 멈추는지는 원문에 명시 없음.[](source:e-draft) | e-flow | review |
| final | 최종 MP4 | `node render.mjs demo.html demo.mp4 60 8 8`로 렌더한다. 오래 걸리니 시작 전에 사용자에게 알린다.[](source:e-final) | e-flow | final |
| deliver | 전달 | HTML, MP4들, 짧은 노트(beat sheet, 자리표시인 것, 두 번째 버전에서 바꿀 것)를 내고 대안 연출을 한 문장으로 제안한다.[](source:e-deliver) | e-flow | deliver |

@callout level=note title="사람이 끼어드는 곳과 끝나는 곳"
사람이 하는 일은 세 번이다. 처음 질문 메시지에 답하고, 초안을 보고 수정 의견을 주고, 최종 렌더가 오래 걸린다는 안내를 받는다.[](source:e-ask)[](source:e-draft)[](source:e-final)
최종 렌더를 시작해도 되는지 승인을 받으라는 문장은 없다. 원문은 초안을 보내 "최종 전에 수정을 요청하라"고만 쓴다. 판정: 이 승인 지점의 엄격함은 원문에 명시 없음.[](source:e-draft)
끝 조건은 전달 단계의 산출물과 노트를 내는 것이다. 노트에 '두 번째 버전에서 바꿀 것'을 적으라는 지시는 있지만, 이후 사용자 요청을 어떻게 이어받는지는 원문에 명시 없음.[](source:e-deliver)

렌더 준비도 지시로 적혀 있다. `npm i playwright`, 필요하면 `npx playwright install chromium`, `ffmpeg`가 `PATH`에 있어야 하고, 스킬 맨 아래 스크립트를 `render.mjs`로 저장한다.[](source:e-setup) `README.md`는 Node 18 이상, ffmpeg, Playwright를 요구 사항으로 적는다.[](source:rd-req) 이 분석은 이 중 어느 것도 실행하지 않았다.

## 연출은 무엇을 강제하나 {#style}

이 스킬의 규칙은 영웅의 물리와 카메라에 몰려 있다. 영웅은 사라지거나 바뀌지 않고, 모든 스테이션은 영웅 때문에 눈에 띄게 변해야 한다.[](source:e-hero)[](source:e-mech)

@workflow id=engaging-course title="영웅이 코스를 한 바퀴 도는 순서"
| follow | 스테이션 따라가기 |
| hold | 페이오프 유지 |
| launch | 발사와 슬로모션 |
| reveal | 코스 전체 공개 |
| dive | 첫 스테이션으로 다이브 |
| follow > hold | 마지막 스테이션 |
| hold > launch | 0.4–0.6초 |
| launch > reveal | 카메라 이탈 |
| reveal > dive | 약 1초 |
| dive > follow | 루프 | emphasis |

| 장치 | 영웅이 | 스테이션 반응 |
| --- | --- | --- |
| 토글·버튼 | 손잡이가 되거나 누른다 | 켜지고 색이 찬다[](source:e-mech) |
| 슬라이더·진행 | 썸으로서 굴러간다 | 말풍선 값이 올라가고 트랙이 찬다[](source:e-mech) |
| 알림 더미 | 떨어져 카드마다 튕긴다 | 맞을 때마다 카드가 뜨고 이야기를 들려 준다[](source:e-mech) |
| 키보드·입력 | 키에서 키로 튄다 | 키가 눌리고 위 입력창에 글자가 나타난다[](source:e-mech) |
| 목록·표 | 행을 따라 미끄러진다 | 행이 강조되거나 체크되거나 정렬된다[](source:e-mech) |
| 차트 | 선의 선두 점이 된다 | 뒤로 선이 그려지고 막대가 오른다[](source:e-mech) |
| 채팅 | 말풍선으로 들어온다 | 답이 타이핑된다[](source:e-mech) |
| 배포·전송 버튼 | 버튼에 의해 발사된다 | 토스트나 URL이 나타난다[](source:e-mech) |

스테이션 문구는 짧고 재치 있게, 제품의 실제 워크플로에서 쓴다(원문 예: `Agent · Writing 12 files`, `Live at myapp.app`).[](source:e-labels)

| 항목 | 규칙 | 구분 |
| --- | --- | --- |
| 캔버스 | 프레임의 약 3배, 방문 순서대로 배치해 경로가 지그재그가 되게 한다. 위쪽은 오른쪽으로, 가운데는 아래로, 아래쪽은 가로질러 간다. 스테이션 자리는 영상 내내 고정[](source:e-world) | 서술 |
| 중력 | 영상 전체에서 일정. 낙하는 아래로, 발사는 위로[](source:e-world)[](source:e-hops) | 의무 |
| 충격 | 접촉 순간 약 60ms 동안 1.25×0.8로 찌그러졌다 복원, 비행 중에는 속도 방향으로 최대 1.15×0.9로 늘어난다. 맞은 것은 살짝 눌린다[](source:e-impact) | 권고 |
| 발사 | 마지막 스테이션이 영웅을 시작점 쪽으로 긴 포물선으로 쏜다. 그동안 스테이션은 거꾸로 초기화된다[](source:e-launch) | 의무 |
| 슬로모션 | 포물선 정점 높이를 먼저 정해 실제 비행 시간을 구하고, 리빌 구간에 맞춰 시간을 늘린다. 정점에서 가장 느리고 흔히 5–10배. 예: 속도 `1 − 0.9·sin(πu)^0.6`[](source:e-launch) | 예시 |
| 초기화 시점 | 발사 순간이 아니라, 시청자가 코스 전체를 본 뒤인 리빌 유지 구간[](source:e-launch) | 의무 |
| 이음매 | 루프 지점은 영웅이 첫 스테이션에 착지하는 순간. 착지 찌그러짐과 키 눌림이 0초에도 보인다. 소리는 조금 더 긴 `OfflineAudioContext`에 만든 뒤 `duration`을 넘는 꼬리를 앞으로 접어 넣는다[](source:e-seam) | 의무 |
| 옆에서 본 중력 | 알림 카드는 계단식으로 놓고, 각 카드를 카드 너비보다 크게 옆으로 어긋나게 해서 영웅이 카드를 뚫지 않게 한다. 키보드는 정면에서 보고 키 사이를 작은 호로 튄다[](source:e-gravity) | 의무 |
| 빈 슬롯 | 영웅이 손잡이 같은 스테이션의 일부였다가 떠나면, 떠난 자리의 희미한 윤곽을 남기고 돌아오면 채운다[](source:e-slot) | 서술 |

| 카메라 | 규칙 | 구분 |
| --- | --- | --- |
| 팔로우 | 목표 = 영웅 위치(속도 약 0.15초 선행)와 스테이션 고정 앵커의 혼합. 임계 감쇠 스프링 `w` ≈ 6으로 부드럽게. 앵커 가중치는 상호작용 약 0.7, 낙하·도약 약 0.15, 페이오프 약 0.85. 로드 때 bake하고 처음 0.8초 동안 팔로우로 섞는다. 영웅은 프레임 가운데 절반 밖으로 나가지 않는다[](source:e-follow) | 의무와 권고 |
| 줌 | 상호작용 때 스테이션이 프레임 너비의 약 절반, 영웅은 1080p에서 화면 50–70px. 낙하·도약 때는 약간 넓게[](source:e-zoom) | 권고 |
| 페이오프 | 발사 전 0.4–0.6초 동안 최종 결과(토스트, 실제 URL)를 완전히 프레임 안에 둔다[](source:e-payoff) | 의무 |
| 리빌 | 팔로우를 멈추고 코스 전체가 들어오는 고정 프레이밍(약 0.3배)으로 이동, `perspective`와 `rotateX` 15–25도의 약한 3D 기울임. 약 1초 유지. 영웅은 키우고 후광을 줘서 화면에서 24px 이상[](source:e-reveal) | 권고 |
| 다이브 | 영웅이 도착하는 순간에 맞춰 첫 스테이션의 고정 프레이밍으로 내려와 팔로우로 되돌아간다[](source:e-reveal) | 의무 |

@facts id=engaging-look
| 캔버스 | `#0C0C0E`, 점 격자 `#1E1E22`. 격자는 카메라와 함께 움직여 카메라 이동이 읽히게 한다[](source:e-pal)[](source:e-world) |
| 면·글자 | 면 `#1C1C1F`와 `#2C2C2E`, 글자 `#F2F2F7`, 보조 `#8E8E93`[](source:e-pal) |
| 강조·영웅 | 강조 `#0A84FF`, 영웅 흰색 `#FFFFFF`. 영웅이 화면에서 가장 밝아야 한다. 밝은 브랜드는 캔버스 `#F2F2F4`에 영웅을 강조색으로 해도 된다[](source:e-pal) |
| 소리 | 110–120 BPM의 미니멀한 그루브. 영웅의 접촉이 주 악기여서 충돌마다 음이 있고 이야기가 진행될수록 높아진다. 키 클릭, 값에 따라 빨라지는 슬라이더 틱, 알림 팝, 발사는 위로 whoosh, 다이브는 아래로 whoosh. 모든 소리는 시각 접촉에 정확히 맞는다[](source:e-sound) |

@callout level=warning title="금지"
컷, 검은 화면으로의 페이드, 무슨 일이 일어나는지 설명하는 글자 오버레이(스테이션 자체의 라벨만 글자), 주인공 둘 이상, 반응하지 않는 스테이션, 둥둥 뜬 듯한 물리는 쓰지 않는다.[](source:e-banned) 커서는 첫 스테이션을 누르며 사슬을 시작해도 되지만 곧 비켜난다.[](source:e-cursor)

## 페이지와 렌더는 무엇을 지켜야 하나 {#contract}

이 스킬이 가장 단단히 묶는 부분이다. 연출은 취향 문제지만 아래 계약을 어기면 렌더가 틀어진다고 원문이 못박는다.[](source:e-contract)

| 규칙 | 내용 | 구분 |
| --- | --- | --- |
| `window.VIDEO`, `window.seek(t)` | `VIDEO = {w, h, duration}`. `seek(t)`는 시간 `t`(초)만으로 모든 요소를 정하는 순수 함수다. CSS transition·animation, `setTimeout`, 이전 프레임 상태는 쓰지 않는다. 어느 프레임이든 혼자, 어떤 순서로든 맞게 그려져야 한다[](source:e-contract) | 의무 |
| 난수 | 시드를 준 생성기만 쓴다. `Math.random`은 쓰지 않는다[](source:e-contract) | 금지 |
| 이력이 필요한 값 | 뒤처지는 카메라나 시뮬레이션은 로드 때 한 번 미리 계산해 저장(bake)한다. 0부터 `duration`까지 1/240초 간격으로 돌려 값을 저장하고, `seek`가 보간해 읽는다[](source:e-contract) | 의무 |
| 루프 | `seek(t)`는 `t % duration`을 쓰고, 이음매에 걸치는 효과는 양쪽 끝에 그리거나 섞는다[](source:e-contract) | 서술 |
| `?render` | 주소에 있으면 컨트롤과 미리보기 스케일이 없고 화면 영역(stage)이 정확히 `w × h`로 좌상단에 놓인다. 없으면 창에 맞춰 CSS로 줄이고 컨트롤을 보여 준다[](source:e-contract) | 서술 |
| 글꼴 | woff2를 받아 base64 `@font-face`로 넣는다. 렌더가 조용히 대체 글꼴로 떨어지지 않게 한다[](source:e-contract) | 의무 |
| 레이어 | 장면 레이어 배경은 투명, 바탕색은 stage 하나가 준다. 절대 위치 텍스트에는 `white-space: nowrap`[](source:e-contract) | 의무 |
| 속도 | 큰 CSS `filter: blur()`와 큰 블러 그라디언트는 스크린샷이 매우 느리다. canvas에 한 번 그려 두고 그것을 움직인다[](source:e-contract) | 권고 |
| `window.buildAudio(ctx)` | 음악과 효과음 전체를 시간 0부터, 받은 `AudioContext`나 `OfflineAudioContext`에 시각 쪽과 같은 시간표로 예약한다. 사용자 음악 파일이 있으면 `fetch`와 `decodeAudioData`로 읽고 박자 격자를 측정해 맞춘 뒤 효과음만 얹는다[](source:e-audio) | 의무 |
| beat sheet 주석 | 스크립트 맨 위에 순간마다 시간, 일어나는 일, 소리를 한 행씩 적는다[](source:e-beat) | 의무 |

@facts id=e-render-facts
| 스틸 점검 | `--stills 0.5,1.2,…`: beat sheet 행마다 시각 하나, 시트는 한 줄에 3장[](source:e-stills) |
| 초안 | `node render.mjs demo.html draft.mp4 30 1 4`: 30 fps, 서브프레임 1(모션 블러 없음), 워커 4. 마지막 수는 머신의 코어 수로 바꾸라는 권고[](source:e-draft) |
| 최종 | `node render.mjs demo.html demo.mp4 60 8 8`: 60 fps, 서브프레임 8, 워커 8. 모션 블러는 렌더 시간을 서브프레임 수만큼 곱하고, 60초짜리 최종은 노트북에서 20–60분 걸릴 수 있으니 시작 전에 알린다[](source:e-final) |
| 코드 기본값 | 인수를 생략하면 60 fps, 서브프레임 4, 워커 4[](source:e-args) |
| 프레임 수 | `round(duration × fps)`개를 워커 수로 나눠 맡긴다. 이 스킬의 기본 길이로 계산하면 12초 × 60 fps = 720프레임, 서브프레임 8개면 스크린샷 5,760장(판정: 계산값)[](source:e-sub) |
| 셔터 | 서브프레임을 반 프레임 길이에 퍼뜨린다(180도 셔터)[](source:e-shutter) |
| 소리 | 페이지에 `buildAudio`가 있을 때만 소리를 입힌 `demo.mp4`를 만든다. 없으면 `demo_silent.mp4`만 남는다(판정: 코드 흐름 읽기)[](source:e-hasaudio) |
| 음량 | `loudnorm=I=-16:TP=-1.5:LRA=11`(약 −16 LUFS), AAC 192k[](source:e-norm) |
| 산출 | `demo.mp4`와 `demo_silent.mp4`[](source:e-final) |

@callout level=warning title="SKILL.md 안의 코드는 읽기만 했다"
스킬 안의 `render.mjs`와 소리 재생 조각은 분석 자료로만 읽었고 실행하지 않았다. 위 수치 중 "코드 기본값"과 "소리", "음량" 행은 코드를 읽어 얻은 값이다. 의무나 권고로 적힌 문장이 아니다.[](source:e-args)[](source:e-norm)

## 흐름 속 위치 {#position}

@workflow id=e-position title="explainer-engaging 선택 자리"
| pick | 연출 고르기? | external |
| n_default | explainer-default | backend |
| n_engaging | explainer-engaging | backend |
| n_energy | explainer-high-energy | backend |
| pick > n_default | 차분한 데모 | dashed |
| pick > n_engaging | 원테이크 | emphasis |
| pick > n_energy | 빠른 홍보 | dashed |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `explainer-default` | - | - | `README.md`가 서로를 "Sister skills"로 부르고 길이와 연출 차이를 표로 비교한다. 사용자가 고르며 순서가 없다[](source:rd-intro)[](source:rd-table) | r06 |
| `explainer-high-energy` | - | - | r06과 같다[](source:rd-intro)[](source:rd-table) | r08 |
| `sound-effects` | - | - | 연결 `미확인`. `sound-effects`는 "코드로 음악·효과음을 합성하지 말라"고 하고, 이 스킬은 `buildAudio`로 직접 합성한다. 서로 부르지 않으며 후속 사용 여부는 원문에 명시 없음[](source:se-nosynth)[](source:e-audio) | r04 |

그림은 사용자가 세 스킬 중 하나를 고르는 자리만 그렸다. 세 스킬은 선택지이고 순서가 아니다.[](source:rd-intro)

`sound-effects`와의 관계(r04)는 연결이 확인되지 않아 그리지 않고 표에만 남겼다. 같은 계열 표시도 표에만 있다.

전체 흐름은 `video/_group-product-explainer/product-explainer.html`에 있고, 관계 근거는 `video/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md` 23722B, `README.md` 2174B. 텍스트 2개, 합계 25896B. `README.md`는 SKILL.md가 아닌 안내 문서다. 이 스킬에는 `references/`, `scripts/` 폴더가 없고, `render.mjs`와 소리 재생 코드는 `SKILL.md` 안에 들어 있다.[](source:rd-req)
- 제외한 파일: 번역본은 이 폴더에 없다. `README.md`가 가리키는 `../../docs/*.gif`는 바이너리라 열 수 없어서 읽었다고 하지 않는다.[](source:rd-intro)
- 원문 비교: 같은 이름의 스킬은 다른 컬렉션에 없다. 세 explainer 스킬은 브리프 질문 일곱 개, 사실 규칙, 페이지 계약, 렌더 코드가 거의 같다. 렌더 코드는 `diff`로 대조했고 최종 렌더 명령의 서브프레임 수만 다르다(`explainer-default`는 4, 나머지 둘은 8). 페이지는 스킬마다 따로 읽고 썼다.
- 관계 확인: r04, r06, r08를 `video/relations.md`와 대조했고 원장과 같다. 다른 스킬은 관계 확인용으로 해당 줄만 읽었다.
- 대조 범위: 활성화 제한, 강제·금지, 수치, 종료·승인 조건으로 표에 옮긴 항목은 줄 번호가 붙은 원문과 모두 대조했다. 일반 설명은 전부 읽었으나 줄마다 대조하지는 않았다.
- 실행하지 않았다. 페이지의 동작은 모두 지시상 동작이고, 렌더와 web fetch, 설치 명령은 하나도 돌리지 않았다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
`60초짜리 최종은 노트북에서 20–60분`이라는 문장은 세 스킬이 공유한다. 이 스킬의 기본은 12초라서 그 수치가 그대로 맞는지는 원문에 명시 없다. 측정하지 않았다.
공통 규칙은 제안이 없으면 이름과 태그라인으로 끝내라고 하지만, 이 스킬은 스테이션 라벨이 유일한 글자라고 한다. 이 스킬에서 이름·태그라인 장면을 둘지는 원문에 명시 없음.[](source:e-nofact)[](source:e-banned)
렌더 결과가 실제로 좋은지, 영상과 음악이 설명대로 나오는지는 확인하지 못했다. 이 분석은 SKILL.md의 지시를 읽은 것이고, 영상과 음악의 내용은 분석하지 않았다.
