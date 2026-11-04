# bang-motion 스킬은 에이전트를 어떻게 바꾸나 {#bang-motion-skill}

`bang-motion`을 쓰면 에이전트는 코드를 쓰기 전에 `style brief`(스타일 설계 메모)와 `rundown`(초 단위 장면표)을 사용자에게 보여 주고 승인받는다. 완성한 뒤에는 "슬라이드처럼 보이지 않는가"를 구조 금지 8개로 코드에서 검사하고, 하나라도 걸리면 사용자에게 보이기 전에 뜯어고친다. 결과물은 더블클릭으로 재생되는 `index.html` 하나이고, MP4는 사용자가 요청할 때만 만든다.[](source:w0)[](source:w2)[](source:bf)[](source:w6)

- 켜지는 조건은 넓다. `description`은 "video promo"·"opener" 같은 요청뿐 아니라 "PPT 같다"는 불만, MP4 렌더 요청, After Effects 안에서 만들어 달라는 요청까지 든다. 호출 제한 필드는 없다.[](source:fm)
- 강제하는 것은 세 가지다. 승인 전 코드 금지, 구조 금지 8개, 화면을 `tl.time()` 하나로 정하는 결정론(Hukum #2)이다.[](source:w0)[](source:bf)[](source:h2)
- 사람이 끼어드는 곳은 시작 질문 한 번, 설계 승인, 사진·영상 출처, 설명 영상의 VO 대본 전달이다.[](source:w0)[](source:w2)[](source:w7)
- 쓰면 안 되는 경우를 못 박은 문장은 원문에 명시 없음. 이 스킬이 스스로 접는 경우(사진을 못 구한 사진 컨셉, 결과물이 시각적이지 않은 컨셉 15)는 있다. 결과 영상이 실제로 영화처럼 보이는지는 확인하지 못했다.[](source:ok-ph)[](source:ok-c15)

@answer scope="1.19.0 · 텍스트 31개 · 지시상 동작"
@meta locale=ko
@source fm title="SKILL.md · 39343B · frontmatter" path=video/bangtutorial/bang-motion/SKILL.md lines=1:11
@source pre title="SKILL.md · 선행 조건(브라우저만, ffmpeg 선택)" path=video/bangtutorial/bang-motion/SKILL.md lines=22:45
@source pl title="SKILL.md · 플레이어 없음, 자동 재생, 반복" path=video/bangtutorial/bang-motion/SKILL.md lines=47:56
@source b1 title="SKILL.md · 구조 금지 1(section 장면을 fade)" path=video/bangtutorial/bang-motion/SKILL.md lines=63:70
@source b2 title="SKILL.md · 구조 금지 2(시각적 줄기)" path=video/bangtutorial/bang-motion/SKILL.md lines=71:76
@source b3 title="SKILL.md · 구조 금지 3(텍스트 3단계)" path=video/bangtutorial/bang-motion/SKILL.md lines=77:80
@source b4 title="SKILL.md · 구조 금지 4(Ken Burns만)" path=video/bangtutorial/bang-motion/SKILL.md lines=81:90
@source b5 title="SKILL.md · 구조 금지 5(전환 한 종류)" path=video/bangtutorial/bang-motion/SKILL.md lines=91:92
@source b6 title="SKILL.md · 구조 금지 6(starter 선택)" path=video/bangtutorial/bang-motion/SKILL.md lines=93:99
@source b7 title="SKILL.md · 구조 금지 7(미니어처)" path=video/bangtutorial/bang-motion/SKILL.md lines=101:104
@source b8 title="SKILL.md · 구조 금지 8(템플릿 골격)" path=video/bangtutorial/bang-motion/SKILL.md lines=106:110
@source bf title="SKILL.md · 하나라도 실패하면 다시 만든다" path=video/bangtutorial/bang-motion/SKILL.md lines=112:112
@source ty title="SKILL.md · 작업 종류별 길이 표" path=video/bangtutorial/bang-motion/SKILL.md lines=127:134
@source gen title="SKILL.md · 범위는 웹 모션 그래픽 일반" path=video/bangtutorial/bang-motion/SKILL.md lines=116:118
@source ex title="SKILL.md · 설명 영상과 캐릭터" path=video/bangtutorial/bang-motion/SKILL.md lines=136:145
@source h1 title="SKILL.md · Hukum #1 슬라이드가 아니라 영상" path=video/bangtutorial/bang-motion/SKILL.md lines=152:173
@source h2 title="SKILL.md · Hukum #2 결정론" path=video/bangtutorial/bang-motion/SKILL.md lines=175:182
@source h3a title="SKILL.md · Hukum #3 style brief 항목" path=video/bangtutorial/bang-motion/SKILL.md lines=190:223
@source h3s title="SKILL.md · starter는 구조, 레퍼런스는 리듬" path=video/bangtutorial/bang-motion/SKILL.md lines=224:238
@source h3d title="SKILL.md · 이전 프로젝트와 달라야 한다" path=video/bangtutorial/bang-motion/SKILL.md lines=239:247
@source h3bg title="SKILL.md · 배경은 기본 어둡지 않고 정지하지 않는다" path=video/bangtutorial/bang-motion/SKILL.md lines=248:262
@source arah title="SKILL.md · 스타일 방향 표 10행" path=video/bangtutorial/bang-motion/SKILL.md lines=275:289
@source h4 title="SKILL.md · Hukum #4 텍스트와 배경 대비" path=video/bangtutorial/bang-motion/SKILL.md lines=291:325
@source w0 title="SKILL.md · 작업 순서 0, 0b" path=video/bangtutorial/bang-motion/SKILL.md lines=329:336
@source w1 title="SKILL.md · 작업 순서 1(레퍼런스와 브랜드 수집)" path=video/bangtutorial/bang-motion/SKILL.md lines=337:342
@source w2 title="SKILL.md · 작업 순서 2(장면표와 승인)" path=video/bangtutorial/bang-motion/SKILL.md lines=343:347
@source w3 title="SKILL.md · 작업 순서 3(scaffold)" path=video/bangtutorial/bang-motion/SKILL.md lines=348:357
@source w4 title="SKILL.md · 작업 순서 4(장면 제작)" path=video/bangtutorial/bang-motion/SKILL.md lines=358:361
@source w5 title="SKILL.md · 작업 순서 5(프레임 검증)" path=video/bangtutorial/bang-motion/SKILL.md lines=362:370
@source w6 title="SKILL.md · 작업 순서 6(단일 HTML 전달, MP4)" path=video/bangtutorial/bang-motion/SKILL.md lines=371:381
@source w7 title="SKILL.md · 작업 순서 7(VO 대본)" path=video/bangtutorial/bang-motion/SKILL.md lines=383:386
@source ck title="SKILL.md · 전달 전 체크리스트 39항목" path=video/bangtutorial/bang-motion/SKILL.md lines=388:502
@source ck-ui title="SKILL.md · 체크리스트: 앱·SaaS는 살아 있는 UI 장면" path=video/bangtutorial/bang-motion/SKILL.md lines=405:409
@source ck-surf title="SKILL.md · 체크리스트: 배경 표면 2겹 이상" path=video/bangtutorial/bang-motion/SKILL.md lines=422:425
@source ck-hold title="SKILL.md · 체크리스트: 죽은 hold 금지" path=video/bangtutorial/bang-motion/SKILL.md lines=446:448
@source ck-mb title="SKILL.md · 체크리스트: 방향성 motion blur" path=video/bangtutorial/bang-motion/SKILL.md lines=449:449
@source ck-font title="SKILL.md · 체크리스트: 표시 폰트와 목업 폰트" path=video/bangtutorial/bang-motion/SKILL.md lines=456:457
@source ck-act title="SKILL.md · 체크리스트: 액션형 설명 영상" path=video/bangtutorial/bang-motion/SKILL.md lines=486:492
@source ck-tab title="SKILL.md · 체크리스트: 변하는 숫자의 폭" path=video/bangtutorial/bang-motion/SKILL.md lines=500:502
@source ck-six title="SKILL.md · 체크리스트의 구조 금지 6점" path=video/bangtutorial/bang-motion/SKILL.md lines=438:440
@source ck-glow title="SKILL.md · 체크리스트: 객체에만 glow" path=video/bangtutorial/bang-motion/SKILL.md lines=454:455
@source ck-det title="SKILL.md · 체크리스트: Date.now 대신 tl.time" path=video/bangtutorial/bang-motion/SKILL.md lines=458:458
@source ck-snd title="SKILL.md · 체크리스트: 소리와 자동 재생" path=video/bangtutorial/bang-motion/SKILL.md lines=461:463
@source ck-ratio title="SKILL.md · 체크리스트: 비율 기본값" path=video/bangtutorial/bang-motion/SKILL.md lines=483:485
@source ck-size title="SKILL.md · 체크리스트: 글자 최소 크기" path=video/bangtutorial/bang-motion/SKILL.md lines=493:495
@source ae title="SKILL.md · After Effects 경로" path=video/bangtutorial/bang-motion/SKILL.md lines=514:525
@source map title="SKILL.md · 파일 지도 표" path=video/bangtutorial/bang-motion/SKILL.md lines=527:551
@source ex-q title="references/explainer.md · 34066B · 첫 질문" path=video/bangtutorial/bang-motion/references/explainer.md lines=25:34
@source ex-style title="references/explainer.md · 스타일 6종 표" path=video/bangtutorial/bang-motion/references/explainer.md lines=36:44
@source ex-q2 title="references/explainer.md · 비율·길이·소리 기본값과 길이 제한" path=video/bangtutorial/bang-motion/references/explainer.md lines=46:61
@source ex-ho title="references/explainer.md · VO 대본 전달" path=video/bangtutorial/bang-motion/references/explainer.md lines=63:79
@source ex-df title="references/explainer.md · 자주 틀리는 기본값" path=video/bangtutorial/bang-motion/references/explainer.md lines=106:122
@source ex-acc title="references/explainer.md · 장면당 요소 3~5개" path=video/bangtutorial/bang-motion/references/explainer.md lines=142:184
@source ex-vo title="references/explainer.md · VO 나중에 맞추기" path=video/bangtutorial/bang-motion/references/explainer.md lines=235:246
@source ex-ent title="references/explainer.md · 언급한 대상은 반드시 보여 준다" path=video/bangtutorial/bang-motion/references/explainer.md lines=270:285
@source ex-mob title="references/explainer.md · 휴대폰에서 읽히는 글자 크기" path=video/bangtutorial/bang-motion/references/explainer.md lines=287:304
@source ex-snd title="references/explainer.md · 소리가 처음부터 들려야 한다" path=video/bangtutorial/bang-motion/references/explainer.md lines=367:385
@source ex-rel title="references/explainer.md · 오프너와 달리 두 가지 완화" path=video/bangtutorial/bang-motion/references/explainer.md lines=20:23
@source ex-top title="references/explainer.md · 가장 흔한 두 스타일 표" path=video/bangtutorial/bang-motion/references/explainer.md lines=9:18
@source ok-law title="references/opener-konsep.md · 58022B · 골격 법칙" path=video/bangtutorial/bang-motion/references/opener-konsep.md lines=12:51
@source ok-menu title="references/opener-konsep.md · 컨셉 메뉴 19개" path=video/bangtutorial/bang-motion/references/opener-konsep.md lines=53:78
@source ok-c15 title="references/opener-konsep.md · 컨셉 15는 결과가 시각적일 때" path=video/bangtutorial/bang-motion/references/opener-konsep.md lines=195:196
@source ok-ph title="references/opener-konsep.md · 사진 출처는 사용자와 정한다" path=video/bangtutorial/bang-motion/references/opener-konsep.md lines=323:341
@source ok-prep title="references/opener-konsep.md · 사진 준비" path=video/bangtutorial/bang-motion/references/opener-konsep.md lines=357:366
@source ok-gen title="references/opener-konsep.md · MCP로 사진 생성" path=video/bangtutorial/bang-motion/references/opener-konsep.md lines=342:356
@source ok-ui title="references/opener-konsep.md · 앱·SaaS UI 장면" path=video/bangtutorial/bang-motion/references/opener-konsep.md lines=443:458
@source tq-intro title="references/techniques.md · 머리말" path=video/bangtutorial/bang-motion/references/techniques.md lines=1:4
@source tq-3 title="references/techniques.md · push-through 영상당 한 번 안팎" path=video/bangtutorial/bang-motion/references/techniques.md lines=166:169
@source tq-7c title="references/techniques.md · 배경 움직임 메뉴 12행" path=video/bangtutorial/bang-motion/references/techniques.md lines=428:457
@source tq-4c title="references/techniques.md · 44953B · 전환 메뉴 조건" path=video/bangtutorial/bang-motion/references/techniques.md lines=308:309
@source tq-8 title="references/techniques.md · UI 클릭을 따라가는 카메라" path=video/bangtutorial/bang-motion/references/techniques.md lines=575:589
@source tq-9b title="references/techniques.md · 영상 클립을 footage 레이어로" path=video/bangtutorial/bang-motion/references/techniques.md lines=615:673
@source tq-7x title="references/techniques.md · 단색 허용 예외" path=video/bangtutorial/bang-motion/references/techniques.md lines=476:479
@source tq-7d title="references/techniques.md · 그레인 gradient 인코딩 주의" path=video/bangtutorial/bang-motion/references/techniques.md lines=522:527
@source kp-def title="references/kartun-panggung.md · 11892B · 정의" path=video/bangtutorial/bang-motion/references/kartun-panggung.md lines=8:12
@source kp-l6 title="references/kartun-panggung.md · 캡션 0개, 글자는 세계 안 물체만" path=video/bangtutorial/bang-motion/references/kartun-panggung.md lines=147:153
@source kp-l1 title="references/kartun-panggung.md · 카메라는 1.08 미만 금지" path=video/bangtutorial/bang-motion/references/kartun-panggung.md lines=25:41
@source kp-l2 title="references/kartun-panggung.md · 무대 전환 수치" path=video/bangtutorial/bang-motion/references/kartun-panggung.md lines=43:65
@source kp-l3 title="references/kartun-panggung.md · 무대당 움직이는 물체 10개" path=video/bangtutorial/bang-motion/references/kartun-panggung.md lines=71:80
@source kp-ver title="references/kartun-panggung.md · 검증" path=video/bangtutorial/bang-motion/references/kartun-panggung.md lines=213:221
@source ae-in title="references/ae-bridge-higgsfield.md · 11812B · 읽는 조건과 참고 빌드" path=video/bangtutorial/bang-motion/references/ae-bridge-higgsfield.md lines=1:8
@source ae-can title="references/ae-bridge-higgsfield.md · bridge가 못 하는 것" path=video/bangtutorial/bang-motion/references/ae-bridge-higgsfield.md lines=10:21
@source ae-comp title="references/ae-bridge-higgsfield.md · 타협점은 처음에 말한다" path=video/bangtutorial/bang-motion/references/ae-bridge-higgsfield.md lines=136:145
@source ae-chk title="references/ae-bridge-higgsfield.md · bridge 체크리스트" path=video/bangtutorial/bang-motion/references/ae-bridge-higgsfield.md lines=147:160
@source ap-rhythm title="references/anti-ppt.md · 11453B · 입장·퇴장 리듬" path=video/bangtutorial/bang-motion/references/anti-ppt.md lines=91:93
@source tq-4b title="references/techniques.md · 카메라 숨쉬기 4~5%" path=video/bangtutorial/bang-motion/references/techniques.md lines=280:284
@source ar-fit title="references/architecture.md · 7663B · 무대 1920x1080 고정" path=video/bangtutorial/bang-motion/references/architecture.md lines=24:36
@source ar-det title="references/architecture.md · 결정론 금지 목록" path=video/bangtutorial/bang-motion/references/architecture.md lines=107:115
@source ar-exp title="references/architecture.md · 검증과 내보내기는 다르다" path=video/bangtutorial/bang-motion/references/architecture.md lines=125:146
@source ar-del title="references/architecture.md · 단일 파일, 서버 없이" path=video/bangtutorial/bang-motion/references/architecture.md lines=164:188
@source rm-use title="references/roadmap.md · 4515B · 개발용 문서" path=video/bangtutorial/bang-motion/references/roadmap.md lines=70:76
@source rd-len title="README.md · 19806B · 만들 수 있는 것과 길이" path=video/bangtutorial/bang-motion/README.md lines=29:41
@source rd-gal title="README.md · 갤러리는 정적 한 장면" path=video/bangtutorial/bang-motion/README.md lines=45:45
@source rd-det title="README.md · 자세한 규칙은 SKILL.md와 references" path=video/bangtutorial/bang-motion/README.md lines=249:249
@source rd-six title="README.md · 설명 영상 스타일 6종" path=video/bangtutorial/bang-motion/README.md lines=123:135
@source cl title="CHANGELOG.md · 2544B · 1.19.0 항목" path=video/bangtutorial/bang-motion/CHANGELOG.md lines=3:4
@source pj title="plugin.json · 780B · 설명" path=video/bangtutorial/bang-motion/.claude-plugin/plugin.json lines=5:5
@source mp title="marketplace.json · 990B · 설명" path=video/bangtutorial/bang-motion/.claude-plugin/marketplace.json lines=12:12
@source sn title="scripts/snap.mjs · 3086B · 검증 촬영" path=video/bangtutorial/bang-motion/scripts/snap.mjs lines=1:23
@source sn-url title="scripts/snap.mjs · 기본 URL" path=video/bangtutorial/bang-motion/scripts/snap.mjs lines=30:30
@source ef title="scripts/export-frames.mjs · 2677B · 프레임 내보내기" path=video/bangtutorial/bang-motion/scripts/export-frames.mjs lines=1:15
@source ef-url title="scripts/export-frames.mjs · 기본 URL과 FPS" path=video/bangtutorial/bang-motion/scripts/export-frames.mjs lines=20:23
@source ef-vp title="scripts/export-frames.mjs · 뷰포트 고정" path=video/bangtutorial/bang-motion/scripts/export-frames.mjs lines=32:32
@source sv title="scripts/serve.py · 854B · no-cache 서버" path=video/bangtutorial/bang-motion/scripts/serve.py lines=1:8
@source vp title="scripts/vo-pauses.html · 4793B · VO 휴지 감지" path=video/bangtutorial/bang-motion/scripts/vo-pauses.html lines=6:18
@source vp-d title="scripts/vo-pauses.html · 기본 임계값" path=video/bangtutorial/bang-motion/scripts/vo-pauses.html lines=30:30
@source kep title="scripts/kepala-ekspresi.py · 4399B · 머리 표정 변형" path=video/bangtutorial/bang-motion/scripts/kepala-ekspresi.py lines=1:17
@source aset title="scripts/ae/bridge/aset-svg.py · 5978B · 에셋 SVG" path=video/bangtutorial/bang-motion/scripts/ae/bridge/aset-svg.py lines=1:8
@source rig title="scripts/ae/bridge/rig-tokoh.py · 7319B · 캐릭터 rig op 생성" path=video/bangtutorial/bang-motion/scripts/ae/bridge/rig-tokoh.py lines=1:11
@source svg2 title="scripts/ae/bridge/svg2png.cjs · 1074B · SVG를 PNG로" path=video/bangtutorial/bang-motion/scripts/ae/bridge/svg2png.cjs lines=1:3
@source pkg title="scripts/ae/bridge/package.json · 272B · 의존성" path=video/bangtutorial/bang-motion/scripts/ae/bridge/package.json lines=12:14
@source so-h title="assets/starter-opener.html · 30608B · 머리말 주석" path=video/bangtutorial/bang-motion/assets/starter-opener.html lines=7:37
@source so-ver title="assets/starter-opener.html · 버전 표기" path=video/bangtutorial/bang-motion/assets/starter-opener.html lines=3:3
@source so-dur title="assets/starter-opener.html · DURATION" path=video/bangtutorial/bang-motion/assets/starter-opener.html lines=299:299
@source so-rdy title="assets/starter-opener.html · 시작 코드" path=video/bangtutorial/bang-motion/assets/starter-opener.html lines=449:449
@source se-dur title="assets/starter-explainer.html · 18416B · DUR" path=video/bangtutorial/bang-motion/assets/starter-explainer.html lines=76:76
@source se-snd title="assets/starter-explainer.html · 소리 시작 코드" path=video/bangtutorial/bang-motion/assets/starter-explainer.html lines=212:213
@source sk-dur title="assets/starter-explainer-kartun.html · 17035B · DUR" path=video/bangtutorial/bang-motion/assets/starter-explainer-kartun.html lines=72:72
@source sj-dur title="assets/starter-explainer-jurnalisme.html · 17027B · DUR" path=video/bangtutorial/bang-motion/assets/starter-explainer-jurnalisme.html lines=72:72
@source sg-dur title="assets/starter-explainer-katalog.html · 19528B · DUR" path=video/bangtutorial/bang-motion/assets/starter-explainer-katalog.html lines=86:86
@source sc-dur title="assets/starter-explainer-sketsa.html · 17302B · DUR" path=video/bangtutorial/bang-motion/assets/starter-explainer-sketsa.html lines=70:70
@source sp-dur title="assets/starter-explainer-panggung.html · 20733B · DUR" path=video/bangtutorial/bang-motion/assets/starter-explainer-panggung.html lines=33:33
@source sp-ver title="assets/starter-explainer-panggung.html · 버전 표기" path=video/bangtutorial/bang-motion/assets/starter-explainer-panggung.html lines=3:3
@source ed-d title="Barty-Bart/explainer-default/SKILL.md · r11 확인용" path=video/Barty-Bart/explainer-default/SKILL.md lines=3:3
@source eh-d title="Barty-Bart/explainer-high-energy/SKILL.md · r12 확인용" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=3:3

## 이 스킬은 언제 켜지고, 어디까지가 범위인가 {#trigger}

@code source=fm language=yaml

`frontmatter`에 호출 제한 필드(`disable-model-invocation` 등)가 없다.[](source:fm) 그래서 모델이 `description`을 보고 켤지 판단하는 모델 호출형이다. 판정: `description`은 판단용 설명이지, 아래 단어가 있으면 켜지는 사전이 아니다. 아래 표의 따옴표 표기는 `description` 원문 그대로다.

| 요청이 이럴 때 | `description` 원문 표기 | 읽는 법 |
| --- | --- | --- |
| 직접 요청 | "video promo", "opener", "intro animasi", "motion graphic", "bumper", "kinetic typography", "animasi teks sinematik", "explainer", "video penjelasan"(jurnalisme visual, kartun edukasi, kolase) | 예시 나열이다. "setiap kali user meminta"라는 틀 안에 있다 |
| 용어 없이 요청 | "bahkan bila mereka tidak menyebut kata motion graphic secara eksplisit" | "motion graphic"이라는 말이 없어도 켜질 수 있다 |
| 참고 영상 | "menunjukkan referensi video promosi/explainer dan ingin dibuatkan versi web-nya" | 참고 영상의 웹 버전을 원할 때 |
| 불만 | 웹 애니메이션이 "seperti PPT/presentasi"라서 더 sinematik하게 원할 때 | 이미 만든 결과를 고치는 요청도 든다 |
| MP4 | "ingin merender animasi web menjadi file video MP4" | 웹 애니메이션을 MP4로 렌더하려는 요청 |
| After Effects | "ingin explainer kartun/animasi dibangun LANGSUNG di After Effects lewat bridge/MCP Higgsfield" | 아래 표의 AE 줄과 같은 조건(원장 r10) |

범위는 `HTML + CSS + GSAP`(필요하면 `Three.js`)로 브라우저에서 만드는 영상이다.[](source:fm) 원문은 이 스킬을 "motion graphic web secara UMUM"용이라 하고, 설명 영상은 그중 한 종류일 뿐이라고 말한다.[](source:gen) 활성화 예외나 "쓰지 말 것" 목록은 원문에 명시 없음(`SKILL.md`에서 `jangan gunakan`, `tidak cocok`, `bukan untuk`를 찾았으나 해당 문장이 없다). 대신 이 스킬이 스스로 접거나 요청이 있을 때만 하는 일이 있다.

| 상황 | 스킬이 정한 처리 | 출처 |
| --- | --- | --- |
| MP4 파일이 필요하다 | 사용자가 요청할 때만 `scripts/export-frames.mjs`로 프레임을 렌더한다. Node, puppeteer, ffmpeg가 필요하다. 없으면 화면 녹화를 권하되 프레임이 빠질 수 있다고 설명한다 {caution:요청 시만} | [](source:w6)[](source:pre) |
| After Effects 안에서 만들어 달라 | 세 조건이 모두 맞을 때만 bridge로 짓는다. AE가 열려 있고, `ae_*` Higgsfield MCP bridge가 연결돼 있고, 사용자가 AE에서 짓기를 요청한 경우다. 맞으면 지시는 명령형이고, 안 맞으면 기본 경로(브라우저 HTML)다 {caution:조건 3개} | [](source:ae)[](source:ae-in) |
| 사진 컨셉인데 사진이 없다 | 컨셉을 바꾸거나 일러스트 렌더를 고른다. 몰래 일러스트로 바꾸지 않는다 | [](source:ok-ph) |
| 컨셉 15(클레임, 방법, 결과)인데 결과물이 시각적이지 않다 | 다른 컨셉을 쓴다("pakai konsep lain") | [](source:ok-c15) |
| 레퍼런스 영상의 외형을 그대로 닮게 해 달라 | 사용자가 건넨 것이라도 위반이다. 한 문장으로 알리고 주제에서 태어난 버전을 제안한다 {bad:복제 금지} | [](source:h3s) |
| 설명 영상 10분을 요청한다 | 확인한 뒤 장당 90초 이하 파일로 쪼갠다 | [](source:ex-q2) |
| 9:16 세로 영상 | 사용자가 요청할 때만 쓴다. 기본은 16:9이거나 화면을 따른다 | [](source:ck-ratio)[](source:ex-df) |

## 어떤 순서로 일하고, 사람은 어디서 끼어드나 {#flow}

@workflow id=bm-flow title="bang-motion 제작 흐름"
| kind | 작업 종류 확인 | backend |
| ask | 질문 한 번 | external |
| brief | brief·rundown 제시 | external |
| ok | 사용자 승인? | external |
| build | 장면 제작 | backend |
| snap | 핵심 프레임 촬영 | backend |
| pass | 체크리스트 통과? | backend |
| deliver | 단일 HTML 전달 | backend |
| vo | VO 대본 첨부 | external |
| kind > ask | |
| ask > brief | |
| brief > ok | |
| ok > brief | 아니오 | dashed |
| ok > build | 예 | emphasis |
| build > snap | |
| snap > pass | |
| pass > build | 아니오 | dashed |
| pass > deliver | 예 | emphasis |
| deliver > vo | 설명 영상만 |

@steps id=bm-steps
| st-kind | 작업 종류 확인 | 작업 종류 표(오프너 25~40초, 설명 영상 30~90초 등)에서 종류를 정한다. 설명 영상이면 `references/explainer.md`의 "Langkah nol"을 따른다.[](source:w0)[](source:ty) | bm-flow | kind |
| st-ask | 질문 한 번 | 설명 영상은 스타일·비율·길이·소리를 한 번에 묻는다. 다른 종류는 브리프에서 정할 수 없는 것(비율, 길이, 음악·VO 유무)만 한 번에 묻는다.[](source:w0) | bm-flow | ask |
| st-brief | brief·rundown 제시 | `style brief`를 쓰고 `rundown`(초, 장면, 문장, 화면)과 함께 사용자에게 보여 준다. 오프너는 컨셉 후보 3개를 쓰고 하나를 근거와 함께 고른다.[](source:w0)[](source:h3a) | bm-flow | brief |
| st-ok | 사용자 승인? | `style brief`가 승인되지 않으면 코드를 건드리지 않는다. `rundown`도 코드 전에 승인받는다. 이유는 "merombak rundown murah, merombak kode mahal"이다.[](source:w0)[](source:w2) | bm-flow | ok |
| st-build | 장면 제작 | starter를 복사하자마자 색·폰트·배경 언어를 `style brief`로 바꾼다. 장면을 하나씩 쌓고, techniques 레시피는 컨셉이 요구하는 것만 쓴다("perkakas, bukan daftar belanja").[](source:w3)[](source:w4) | bm-flow | build |
| st-snap | 핵심 프레임 촬영 | 장면 시작·텍스트 등장·전환 같은 핵심 6~20초를 `scripts/snap.mjs`로 찍어 접촉 시트로 만들고 감독처럼 평가한다. 전 프레임 렌더는 검증이 아니다.[](source:w5) | bm-flow | snap |
| st-pass | 체크리스트 통과? | 체크리스트 39항목 중 해당하는 것을 확인한다. 구조 금지 하나라도 실패하면 보여 주기 전에 다시 만들고, 프레임 검증에서 걸리면 "Perbaiki, potret lagi"이다.[](source:ck)[](source:bf)[](source:w5) | bm-flow | pass |
| st-deliver | 단일 HTML 전달 | CSS·JS를 안에 넣은 `index.html` 하나를 서버·Node 없이 열리게 전달하고 `?debug=1`로 스크럽할 수 있다고 알린다. MP4는 요청 시에만.[](source:w6) | bm-flow | deliver |
| st-vo | VO 대본 첨부 | 설명 영상이면 마지막 메시지에 VO 대본 전체를 싣고, 사용자에게 녹음하거나 생성한 오디오를 다시 보내 달라고 요청한다.[](source:w7)[](source:ex-ho) | bm-flow | vo |

판정: 그림의 "아니오"로 되돌아가는 선 중 승인 거절 쪽은 원문이 절차를 적지 않아, 위 `rundown` 수정 비용 문장에서 추론했다. 승인을 몇 번까지 되풀이하는지는 원문에 명시 없음. 검증 실패 쪽은 "Perbaiki, potret lagi"가 원문이다.[](source:w2)[](source:w5)

사람이 끼어드는 곳은 아래와 같다. 구분의 의무는 원문이 명령형이거나 "wajib"로 쓴 경우다.

| 시점 | 에이전트가 하는 일 | 구분 | 출처 |
| --- | --- | --- | --- |
| 시작, 설명 영상 | 스타일(추천 한 줄 포함), 비율, 길이, 소리를 한 번에 묻는다. 사용자가 이미 말한 항목은 건너뛴다. "terserah"이면 16:9, 60초, 무음(VO 대본은 쓴다)이다 | 의무 | [](source:ex-q)[](source:ex-q2) |
| 시작, 그 밖의 종류 | 브리프에서 정할 수 없는 것만 한 번에 묻는다 | 의무 | [](source:w0) |
| 코드 전 | `style brief`와 `rundown`을 보여 주고 승인받는다. 승인 전 코드 금지 | 의무 | [](source:w0)[](source:w2) |
| 사진이 필요한 컨셉 | 사진 출처(사용자 사진, Higgsfield MCP 생성, 허가받은 스톡)를 `style brief` 확정 전에 묻는다. 사용자 사진이 우선이고 생성은 동의가 있을 때만이다. 생성 결과는 애니메이션 전에 보여 준다 | 의무 | [](source:ok-ph)[](source:ok-gen) |
| 영상 클립 | 출처를 사진과 같은 방식으로 묻는다. MCP로 만들면 비용을 먼저 확인한다. 사실이 주제면 생성 클립에 "ilustrasi/rekonstruksi" 표시를 붙인다 | 의무 | [](source:tq-9b) |
| 언급한 인물·회사·장소 | 이미지를 얻는 방법이 모두 실패하면 실루엣이나 임시 이미지를 쓰기 전에 사용자에게 묻는다 | 의무 | [](source:ex-ent) |
| UI가 없는 앱 | 최소 UI를 설계해 `style brief`와 함께 먼저 보여 준다 | 의무 | [](source:ok-ui) |
| 레퍼런스 복제 요구 | 한 문장으로 알리고 대안을 제안한다 | 의무 | [](source:h3s) |
| After Effects 경로 | 시작 때 타협점(레이어 순서 재정렬 불가 등)을 말하고, 마지막에 Ctrl+S·시험 comp 삭제·`aerender` 명령을 알린다 | 의무 | [](source:ae-comp)[](source:ae-chk) |
| MP4와 ffmpeg | MP4는 요청할 때만이다. ffmpeg가 없으면 설치 한 줄을 제안하거나 화면 녹화를 권한다 | 조건부 | [](source:w6)[](source:pre) |
| 설명 영상 전달 | VO 대본과 녹음 요청을 마지막 메시지에 싣는다. 오디오가 오면 그 길이에 맞춰 영상을 다시 맞춘다 | 의무 | [](source:w7)[](source:ex-ho) |

## 무엇을 강제하고 무엇을 금지하나 {#rules}

"Larangan struktural"(구조 금지) 8개 중 하나라도 실패하면 사용자에게 보이기 전에 다시 만든다.[](source:bf) 아래는 걸리는 조건과 고치는 방향이다.

| # | 걸리는 조건 | 고치는 방향 | 출처 |
| --- | --- | --- | --- |
| 1 | `grep -c`로 센 장면 `<section>`(`class="scene"` 포함)이 3 이상이고 `autoAlpha`·opacity로 켜고 끈다 {bad:슬라이드 덱} | 카메라·세계가 움직여서 장면이 바뀌게 한다. 예외로 카툰 무대는 cut이나 96px 이동이 허용된다(무대마다 물체 10개 이상이 움직일 때) | [](source:b1) |
| 2 | 지속하는 시각적 줄기가 없다. 장면마다 그림 1개와 문장 1개가 바뀌면 카메라가 움직여도 슬라이드쇼다 | 한 주체의 연속 행동이거나 카메라가 훑는 한 세계. 장면당 3~5개 요소를 구절별로 쌓는다 | [](source:b2) |
| 3 | 장면의 텍스트가 3단계(eyebrow·제목·본문)다 | 최대 2단계. 큰 숫자나 문장 1개와 세계 안 label 1개다. 도장·문서·날짜 블록은 3줄 이하면 물체로 센다 | [](source:b3) |
| 4 | Ken Burns(1.0에서 1.05)가 유일한 움직임이다 | 매초의 움직임은 `style brief`에서 고른 배경 움직임 언어(techniques 7c)에서 온다. 옆으로 지나가는 막대·선은 연속 두 프로젝트가 써서 기본값이 아니다 | [](source:b4) |
| 5 | 모든 cut이 fade, scale bump, light leak뿐이다 | whip, 계기판 cut, push-through 같은 카메라 전환을 쓴다 | [](source:b5) |
| 6 | 설명 영상을 `starter-opener.html`에서 시작했거나 처음부터 짰다 | 스타일에 맞는 `starter-explainer*.html` 파일에서 시작한다 | [](source:b6) |
| 7 | 카메라 zoom이 1.08 미만이라 집이 엄지만 하고 빈 땅이 화면 절반이다(미니어처) | 세계를 프레임 크기 무대로 쪼갠다 | [](source:b7) |
| 8 | 오프너·홍보에서 템플릿 골격 지표 둘 이상이 컨셉의 요구 없이 나온다. 첫 장면 텍스트 확대 후 왼쪽 퇴장, 카드 3개 나란히, 타이핑 입력창, hook-기능-기능-약속-로고-CTA 순서다 | `opener-konsep.md`에서 골격을 다시 고른다 | [](source:b8) |

판정: 1번 검사의 `grep -c`는 일치한 줄 수를 센다. 그래서 HTML을 한 줄로 압축하면 값이 실제보다 작게 나온다. 원문은 이 한계를 적지 않았다.[](source:b1)

법칙 4개는 의무·금지와 권고·예시가 섞여 있다. 줄마다 구분을 달았다.

| 법칙 | 의무·금지 | 권고·예시 | 출처 |
| --- | --- | --- | --- |
| Hukum #1, 오프너 | 장면당 짧은 문장 하나와 주 객체 최대 하나. kicker, 부제, 설명 단락, 기능 chip·badge, 메타데이터(패키지명, 긴 URL)는 금지한다. 제품 UI의 일부인 chip·버튼·라벨은 예외다. 앱·SaaS 오프너는 최소 한 장면에서 UI를 조립하고, 쓰고, 결과를 내는 모습을 보여 준다(정지 스크린샷 확대 금지) | "Zoom in-out"은 카메라 숨쉬기가 아니라 샷 크기 변화(wide, medium close-up, close-up)로 푼다. 큰 물체 동작이 없는 장면에는 샷 크기 변화나 느린 `push`를 주고, 숨쉬기만으로는 `hold`를 채운 것으로 치지 않는다 | [](source:h1)[](source:ck-ui)[](source:ck-hold) |
| Hukum #1, 설명 영상 | `explainer.md`는 두 가지를 완화한다. 한 장면에 문장 하나와 숫자·주석 하나까지 허용하고, mockup·지도·그래프는 "padat"(빽빽해도) 된다. 액션형이면 주체 하나가 처음부터 끝까지 있고, 같은 시점이 세 장면 연속이면 안 된다 | SKILL.md는 "Pedoman khusus explainer ini memperjelas aturan opener"라고만 적고, 어느 쪽이 우선인지는 따로 적지 않는다 | [](source:ex-rel)[](source:ex)[](source:ck-act) |
| Hukum #2 | 시스템 시계를 읽는 줄이 하나도 없다. 모든 시각은 `tl.time()`의 함수다. 카메라 흔들림은 고주파 sin이고, 흐르는 물체는 거리 값을 `tween`한다. 렌더 경로에서 `Date.now()`·`Math.random()`은 0회다 | 설치 시점에 시드(seed)를 만드는 `Math.random()`은 허용한다 | [](source:h2)[](source:ck-det)[](source:ar-det) |
| Hukum #3 | 코드 전에 `style brief`를 쓴다. 팔레트는 hex와 출처, 표시 폰트는 Poppins·Inter·Roboto·Montserrat·Arial이 아니어야 한다. 레퍼런스에서는 리듬만 가져온다. 이전 프로젝트와 팔레트·폰트·배경 언어·서명 동작 중 3개 이상 달라야 한다. 옛 프로젝트 폴더를 "예시"로 열지 않는다 | 배경은 기본 어둡지 않게 스타일 방향 표 10개에서 고르고, 정지하지 않는다(색은 눈에 보이는 계기가 있을 때 바꾼다). 객체 렌더 스타일은 한 계열이다. 두 오프너 연속으로 같은 줄을 고르면 "tanda bahaya"다 | [](source:h3a)[](source:h3s)[](source:h3d)[](source:h3bg)[](source:arah) |
| Hukum #4 | 문장형 대소문자, 굵기 500~600. 제목·주장은 기본으로 마침표 없음. 텍스트 영역의 배경 밝기는 25% 이하이거나 80% 이상이고, 배경 요소는 opacity 0.35 이하, 밝은 요소는 40개 이하다. 텍스트 입·퇴장에는 방향성 `motion blur`를 쓴다. 표시 폰트와 UI 목업 폰트는 다르고, 목업은 제품 원래 폰트다 | 단어 강조(pill, 밑줄 등)는 선택이고 `style brief`에서 정한다. 어두운 장면과 밝은 장면을 번갈아도 된다("bukan kewajiban mekanis") | [](source:h4)[](source:ck-mb)[](source:ck-font) |

전달물 규칙은 아래와 같다.

| 규칙 | 구분 | 출처 |
| --- | --- | --- |
| 보기 위해 `npm install`이 필요한 결과물은 만들지 않는다 | 금지 | [](source:pre) |
| CSS·JS를 안에 넣은 `index.html` 하나로 낸다. 로컬 `type="module" src`는 `file://`에서 CORS로 막히므로 쓰지 않는다. 라이브러리는 CDN, 에셋은 상대 경로다 | 의무 | [](source:w6)[](source:ar-del) |
| 화면에 플레이어(player)를 두지 않고 자동 재생하며 끝나면 반복한다. R은 처음부터, Space는 일시정지다. `?debug=1`은 스크럽 패널, `?clean=1`은 자동 재생을 멈춘다(내보내기용) | 기본값 | [](source:pl) |
| 소리가 있고 자동 재생이 막히면 0프레임에서 기다렸다가 첫 클릭에 시작한다. 소리 없이 시작하지 않고, 런처 파일(`.cmd`, `.bat`)을 만들지 않는다 | 의무 | [](source:ck-snd)[](source:ex-snd) |
| 변하는 숫자(시계, 카운터)는 `font-variant-numeric:tabular-nums`와 `min-width`로 폭이 흔들리지 않게 한다 | 의무 | [](source:ck-tab) |
| glow는 객체에만 쓰고 제목은 깨끗하게(흰색에 얇은 그림자) 둔다. 사용자가 반대로 요청하면 예외다 | 의무 | [](source:ck-glow) |
| 설명 영상 장면은 요소 3~5개(최대 5개)가 구절마다 하나씩 쌓인다 | 의무 | [](source:ex-acc) |
| 카툰 무대: zoom 1.08 미만 금지, 카메라는 무대 안에서만 움직이고, 캡션은 0개이며 글자는 무대 안 물체(plat, 푯말)에만 쓴다. 관절 회전에 GSAP `transformOrigin`·`rotation`을 쓰지 않는다 | 의무 | [](source:kp-l1)[](source:kp-l6)[](source:ck) |

## 수치는 의무인가, 권고인가 {#numbers}

수치는 원문의 단위와 적용 조건 그대로 옮겼다. 구분 칸에 의무·권고·예시를 적었다. 원문이 "±"나 "terbukti"(검증됨)로 적은 값은 권고나 예시로 분류했다.

| 항목 | 값 | 구분 | 적용 조건과 출처 |
| --- | --- | --- | --- |
| 오프너·홍보 `rundown` 총 길이 | 25~40초 | 의무 | 작업 순서 2 문장. 종류 표의 "durasi lazim"도 같은 값이다[](source:w2)[](source:ty) |
| 다른 종류의 보통 길이 | 범퍼 3~8초, 채널 인트로·아웃트로 5~12초, 키네틱 타이포 15~60초, 타이틀·로워서드 2~6초, 설명 영상 30~90초 | 권고("lazim") | 종류 표[](source:ty) |
| 설명 영상 길이 선택지 | 30·60·90초, "terserah"이면 60초 | 기본값 | 첫 질문. 10분 요청은 확인 후 90초 이하로 쪼갠다[](source:ex-q2) |
| 비율 | 기본 16:9(1920x1080) 또는 화면을 따름, 9:16(1080x1920)은 요청 시만 | 기본값 | 설명 영상[](source:ck-ratio)[](source:ex-df) |
| 무대 | 1920x1080 고정 뒤 창 크기에 맞춰 scale | 설계 | starter와 architecture 문서[](source:ar-fit) |
| 글자 최소 크기 | 1080 폭 무대에서 본문 44px, label 34px, 크레딧 30px, 손글씨 주석 48px, 제목 100px 이상. 30px 미만은 금지 | 의무("aturan keras") | 안전 영역 scale 0.78을 쓰면 먼저 1/0.78을 곱한다[](source:ex-mob)[](source:ck-size) |
| 텍스트 영역 배경 | 밝기 25% 이하이거나 80% 이상, 배경 요소 opacity 0.35 이하, 밝은 요소 40개 이하 | 의무 | 텍스트 주머니 안. 주머니 밖은 오히려 풍부해야 한다[](source:h4) |
| 배경 표면 | 2겹 이상(바탕과 빛·질감·blob), 단색 금지, 순수 검정·흰색 금지 | 의무 | 단색은 포스터 color-block(grain 포함)과 flat pop 방향만 예외이며, 이 예외는 techniques 7d에서 나온다[](source:ck-surf)[](source:tq-7x) |
| 문장 굵기 | 500~600 | 의무(기본) | 대문자 굵은 글씨는 한 장면만[](source:h4) |
| 검증 촬영 | 핵심 6~20초. 카툰 무대는 20~24초 | 의무, 무대는 참고 | 전 프레임 렌더로 검증하지 않는다[](source:w5)[](source:kp-ver) |
| MP4 렌더 | 60fps PNG를 ffmpeg로 합침 | 조건부 | 사용자가 요청할 때만[](source:w6) |
| 카메라 숨쉬기 | 장면당 ±4~5% 느린 zoom drift, 방향을 번갈아 이어 붙임 | 권고 | 기본 층일 뿐 "zoom in-out"으로 치지 않는다[](source:tq-4b) |
| 입장·퇴장 리듬 | 입장 0.7~1.3초(`power4.out`), 퇴장 0.35~0.55초(`power2.in`) | 권고 | 대칭이면 기계적으로 느껴진다[](source:ap-rhythm) |
| 전환 | 한 영상에서 2종 이상, 그중 1종 이상은 깊이감, wipe는 2회 이하. push-through는 영상당 ±1회 | 의무와 권고 | 전환 메뉴 조건. "±1"은 권고[](source:tq-4c)[](source:tq-3) |
| 오프너 컨셉 | 후보 3개 중 1개, 정형 컴포넌트 2개 이하, 이전과 구조 지문 5요소 중 3개 이상 달라야 함 | 의무 | 컨셉 19개 메뉴에서 고른다[](source:ok-law)[](source:ok-menu) |
| 프로젝트 간 차이 | 팔레트·폰트·배경 언어·서명 동작 중 3개 이상 | 의무 | 한 영상 안이 아니라 이전 프로젝트와의 비교[](source:h3d) |
| 카툰 무대 카메라와 전환 | zoom 1.08~1.95, 가로 96px 또는 세로 72px 이동, blur 10px 이하, 나가기 0.28초와 들어오기 0.42초, 무대당 움직이는 물체 10개 이상 | 의무(zoom·물체), 예시(시간) | "terbukti" 값은 참고 프로젝트에서 나온 수치다[](source:kp-l1)[](source:kp-l2)[](source:kp-l3) |
| UI 클릭 카메라 | scale 1.4~2.2, 0.6~0.9초, 클릭 직전 0.3~0.5초. 장면당 1~3회 | 권고 | "titik awal"로 소개된 시작값이다[](source:tq-8) |
| 영상 클립 | 3~8초, 720p~1080p, 무음, 동시에 2~3개 이하 | 권고 | 점검 항목("Jaga-jaga")[](source:tq-9b) |
| 사진 해상도 | 최대 표시 크기의 1.5~2배 이상 | 권고 | 줌과 push용 여유[](source:ok-prep) |
| 그레인 gradient 인코딩 | `-crf 10-12 -tune grain` | 권고 | 인코딩 뒤 MP4를 직접 열어 본다[](source:tq-7d) |
| VO 휴지 감지 기본값 | 무음 기준 피크 대비 -30dB, 휴지 0.45초 이상, 문단 0.8초 이상 | 도구 기본값 | VO가 시끄러우면 조정한다[](source:ex-vo)[](source:vp-d) |
| AE 참고 빌드 | VO 103초, 무대 10개, 관절 캐릭터 20개, PNG 96개, 약 67분, 약 100회 호출, 크레딧 0 | 예시(측정 결과) | 1회 빌드에서 나온 값이다[](source:ae-in) |

## 부속 파일은 어느 단계에서 지목되고, 스크립트는 설명대로인가 {#files}

설명 영상은 스타일별 starter에서 시작한다.[](source:b6) starter 7개는 아래와 같다. 파일 안 길이는 예시이고 교체 대상이다. 줄마다 코드를 풀지 않는다.

| 파일 | 쓰는 경우 | SKILL.md 지목 위치 | 파일 안 예시 길이 |
| --- | --- | --- | --- |
| `assets/starter-opener.html` | 오프너·홍보·범퍼·인트로·키네틱 타이포. 장면을 일부러 넣지 않았고 색·폰트는 회색 placeholder다 | 작업 순서 3, 구조 금지 6("BUKAN dari")[](source:w3)[](source:so-h) | 8.0초[](source:so-dur) |
| `assets/starter-explainer.html` | 설명 영상, 연속 액션(흐름 모드, 지도, whip, 콜라주 예시) | 작업 순서 3, 구조 금지 6[](source:w3) | 22초[](source:se-dur) |
| `assets/starter-explainer-kartun.html` | 카툰 콜라주 | 작업 순서 3, 구조 금지 6[](source:w3) | 18초[](source:sk-dur) |
| `assets/starter-explainer-jurnalisme.html` | 시각 저널리즘 | 작업 순서 3, 구조 금지 6[](source:w3) | 18초[](source:sj-dur) |
| `assets/starter-explainer-katalog.html` | 흰 카탈로그 | 작업 순서 3, 구조 금지 6[](source:w3) | 18초[](source:sg-dur) |
| `assets/starter-explainer-sketsa.html` | 빈티지 스케치 | 작업 순서 3, 구조 금지 6[](source:w3) | 18초[](source:sc-dur) |
| `assets/starter-explainer-panggung.html` | 카툰 무대(2무대 예시, 관절 `J()`) | 구조 금지 6, 설명 영상과 캐릭터 절[](source:b6)[](source:ex) | 12초[](source:sp-dur) |

참조 문서와 스크립트는 아래와 같다. 마지막 칸은 코드를 읽고 SKILL.md 설명과 대조한 결과다. 스크립트는 하나도 실행하지 않았다.

| 파일 | 읽거나 쓰라고 하는 때 | 강도 | 코드·내용 대조 |
| --- | --- | --- | --- |
| `references/anti-ppt.md` | 장면을 설계하기 전 | 의무("SEBELUM") | 위반과 고침 표. 구조 금지의 근거 문서다[](source:h1) |
| `references/opener-konsep.md` | 오프너·홍보 `rundown` 전, 컨셉 후보 고를 때 | 의무형 | 컨셉 메뉴가 SKILL.md의 "19"와 같다[](source:ok-menu)[](source:map) |
| `references/explainer.md` | 설명 영상 요청 | 의무형("buka ... dan ikuti") | 스타일 표가 6행이다[](source:ex-style)[](source:w0) |
| `references/kartun-panggung.md` | 카툰 무대나 슬라이드·미니어처 느낌 수정 | 지시("baca") | 법칙 7개. 무대 수치가 SKILL.md와 같다[](source:ex)[](source:kp-l1) |
| `references/techniques.md` | 장면·효과를 만들 때 | 도구함, 컨셉이 요구하는 것만 | 머리말이 수치를 "titik awal"(시작값)이지 법이 아니라고 말한다[](source:tq-intro)[](source:w4) |
| `references/architecture.md` | scaffold할 때, 구조 이유가 필요할 때 | 참고 | 단일 파일·결정론 규칙이 SKILL.md와 같다[](source:w3)[](source:ar-del) |
| `references/ae-bridge-higgsfield.md` | AE 직접 구축 조건이 맞을 때 | 조건부 의무(원장 r10) | 조건·한계가 SKILL.md와 같다[](source:ae)[](source:ae-in) |
| `references/roadmap.md` | "saat mengembangkan skill ini lebih lanjut" | 개발용 | 사용 단계에서 읽으라는 문장은 없다[](source:map)[](source:rm-use) |
| `scripts/snap.mjs` | 검증 촬영(선택, Node와 puppeteer 필요) | 선택 | 설명대로 `file://` 기본 URL이고 서버가 필요 없다[](source:sn)[](source:sn-url) |
| `scripts/export-frames.mjs` | MP4 내보내기(요청 시) | 조건부 | 어긋남. 기본 URL이 서버 주소이고 뷰포트가 1920x1080으로 고정이다[](source:ef-url)[](source:ef-vp) |
| `scripts/serve.py` | 로컬 module을 쓸 때만 | 선택 | 설명대로 `Cache-Control: no-store`를 보낸다[](source:sv) |
| `scripts/vo-pauses.html` | ffmpeg 없이 VO 휴지·문단 감지 | 선택 | 설명과 같고 임계값이 -30dB, 0.45초, 0.8초다[](source:vp)[](source:vp-d) |
| `scripts/kepala-ekspresi.py` | 카툰 무대 머리 표정 변형 | 선택 | 설명대로 3표정과 눈 깜빡임 변형을 만든다. Pillow, numpy, opencv-python이 필요한데 SKILL.md에는 없다[](source:kep) |
| `scripts/ae/bridge/*` | AE 경로 | 조건부 | `rig-tokoh.py`는 `ae_batch`에 넣을 JSON op만 출력한다. bridge를 직접 부르지 않는다[](source:rig)[](source:aset)[](source:svg2) |

## 이 분석의 범위, 어긋난 곳, 확인하지 못한 것 {#audit}

- 읽은 파일: 텍스트 31개, 합계 422,025B. 전부 `skill-explainers/video/bangtutorial/bang-motion/files.md`에 적었다. `references/opener-konsep.md`는 이름에 `konsep`이 든 인도네시아어 원본이다. 번역본(`-KO`, `.ko`)은 이 폴더에 없다.
- 제외한 파일: 바이너리 14개, 합계 1,920,340B. `docs/gallery/*.jpg` 13개(1,742,238B)와 `icon.png` 1개(178,102B)다. 이미지 내용은 열어 보지 않았다. README는 갤러리를 "single static scene"(정적인 한 장면)이라 소개한다.[](source:rd-gal)
- 원문 비교: 다른 컬렉션에 같은 이름의 스킬은 없다(원장).
- 실행하지 않았다. `scripts/`, 렌더, After Effects, MCP 호출 모두 읽기만 했다. 페이지의 동작은 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.
- 관련 관계: r10은 `bang-motion`에서 Higgsfield MCP(`ae_*` bridge)로 가는 참고다(범위 밖). 확정한 조건은 AE 열림, bridge 연결, 사용자 요청의 3개가 모두 맞을 때이고, 맞으면 `references/ae-bridge-higgsfield.md`를 읽고 bridge로 짓는다는 명령형이다. SKILL.md는 조건을 "animasi/explainer"로 넓게 쓰지만 참조 문서가 다루는 것은 카툰 무대 설명 영상이다. 원장 종류는 참고이지만 원문 강도는 조건부 명령형이다.[](source:ae)[](source:ae-in)
- r11은 `video/Barty-Bart/explainer-default/explainer-default.html`과 같은 계열(추론)이다. 그쪽 `description`은 45~90초 제품 시연을 코드에서 MP4로 렌더한다고 하고, 이 스킬은 MP4를 요청 시에만 낸다. 직접 연결은 없다.[](source:ed-d)[](source:w6)
- r12는 `video/Barty-Bart/explainer-high-energy/explainer-high-energy.html`과 같은 계열(추론)이다. 그쪽은 12~20초 홍보 영상이고 이 스킬의 오프너·홍보는 25~40초다.[](source:eh-d)[](source:w2)

SKILL.md와 부속 문서가 어긋나는 곳이다. 원문이 우선순위를 밝히지 않아 충돌을 그대로 보여 준다.

| # | 어긋나는 곳 | 근거 |
| --- | --- | --- |
| 1 | 설명 영상 스타일 수. SKILL.md는 종류 표에서 "lima gaya", 첫 질문에서 "lima pilihan"이라 쓰면서 같은 문서에서 "gaya keenam"(카툰 무대)도 쓴다. `explainer.md`와 README는 6개이고, plugin·marketplace 설명은 "five explainer styles"다 | [](source:ty)[](source:ex)[](source:w0)[](source:ex-style)[](source:rd-six)[](source:pj)[](source:mp) |
| 2 | 구조 금지 개수. 본문은 8개인데 체크리스트는 "Lolos 6 poin"이고 괄호에 6개만 적는다 | [](source:b8)[](source:ck-six) |
| 3 | `style brief` 항목 수. "enam baris ini"(여섯 줄)라고 쓴 뒤 불릿이 13개다 | [](source:h3a) |
| 4 | 배경 언어 수. WebGL 배경을 "여덟 가지 배경 언어 중 하나"라고 쓰는데 스타일 방향 표는 10행이고, techniques 7c 메뉴는 12행이다 | [](source:h3s)[](source:arah)[](source:tq-7c) |
| 5 | "kedua starter"(두 starter)라는 표현. 지금은 starter가 7개이고, 소리가 막힐 때의 시작 처리는 explainer starter에만 있다. `starter-opener.html`은 소리 처리가 없다 | [](source:pl)[](source:so-rdy)[](source:se-snd) |
| 6 | 소리가 막힐 때 안내 문구. SKILL.md와 explainer starter는 문구 없음("tanpa teks")인데 `explainer.md`는 작은 안내 문구를 쓰라고 한다 | [](source:pl)[](source:ex-snd)[](source:se-snd) |
| 7 | architecture 문서는 render·snap 스크립트가 `file://`로 서버 없이 기본 동작한다고 쓴다. `snap.mjs`는 그렇지만 `export-frames.mjs`의 기본 URL은 `http://127.0.0.1:5178`이고 머리말도 `python -m http.server`를 요구한다. 뷰포트도 1920x1080 고정이라 9:16 starter에는 맞지 않는다 | [](source:ar-del)[](source:sn-url)[](source:ef)[](source:ef-url)[](source:ef-vp) |
| 8 | 버전과 날짜. 머리말(frontmatter)의 `updated`는 2026-09-14인데 CHANGELOG의 1.19.0은 2026-09-15다. starter 6개는 "v1.0.0", 카툰 무대 starter는 "v1.4.0" 표기를 남겼다 | [](source:fm)[](source:cl)[](source:so-ver)[](source:sp-ver) |
| 9 | 길이. README는 오프너 15~40초, 설명 영상 30~120초라 쓰고 SKILL.md는 25~40초, 30~90초다 | [](source:rd-len)[](source:ty) |
| 10 | `explainer.md`의 가장 흔한 두 스타일 표는 9:16을 쓰는데 같은 문서의 기본값은 16:9다. 표는 "cocok untuk" 예시이고 기본값 문장이 우선이라는 명시는 없다 | [](source:ex-top)[](source:ex-df) |
| 11 | SKILL.md가 지목한 `explainer.md`의 "Kamera explainer" 제목이 없다. 가장 가까운 것은 "Resep kamera kolase" 절이다 | [](source:ck) |
| 12 | 스크립트 머리말의 옛 경로. `svg2png.cjs`는 `render-svg.cjs`, `serve.py`는 `tools/serve.py`, `export-frames.mjs`는 `tools/export-frames.mjs`로 부른다 | [](source:svg2)[](source:sv)[](source:ef) |

@callout level=open-question title="확인하지 못한 것"
결과가 실제로 영화처럼 보이는지는 확인하지 못했다. 영상도 갤러리 이미지도 보지 않았다. 스킬 자신도 에이전트는 영상을 볼 수 없고 프레임만 볼 수 있다고 적는다.[](source:w5)
승인을 거절당했을 때의 절차와 되풀이 횟수 한계는 원문에 명시 없음. 체크리스트 항목 중 일부(AE, 사진, 영상 등)는 조건부라서 모든 작업에 39개가 다 적용되는지는 확인하지 못했다.[](source:ck)
`vo-pauses.html`이 `silencedetect`와 "sama persis"(똑같다)는 주장은 실행하지 않아 확인하지 못했다. 코드는 10ms RMS 창을 쓴다.[](source:vp)
CDN(GSAP, Three.js, Google Fonts)과 Higgsfield MCP는 범위 밖이라 열어 보지 않았다.
