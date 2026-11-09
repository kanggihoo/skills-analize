# 10k-websites 스킬은 에이전트를 어떻게 바꾸나 {#tenk-websites-skill}

`10k-websites`를 쓰면 에이전트는 초보자의 브리프 하나로 웹사이트 제작 전체를 맡는다. OpenArt로 이미지와 영상을 만들고, 스크롤에 맞춰 그 영상이 감기는 사이트를 짓고, Hostinger에 올려 실제로 열리는지까지 확인한다. 사용자는 취향을 말하고 선택지에 답하며, 로그인·결제·비밀번호만 직접 한다.[](source:sk-intro)[](source:sk-start)

- 켜지는 때: 이 웹사이트 작업을 새로 하거나 이어 하거나, 이 스킬의 도구와 배포를 다룰 때다. 호출 제한 필드는 없다.[](source:sk-fm)
- 강제하는 것: 생성 전에 이야기와 지출을 승인받는다. hero 글자는 영상 속 움직임에 맞춰 움직여야 한다.[](source:sk-p5)[](source:sk-type)
- 고정된 도구: 이미지·영상은 OpenArt, 사이트는 함께 들어 있는 엔진, 게시는 Hostinger다. 바꾸려면 사용자의 명시 지시가 필요하다.[](source:sk-pipe)
- 쓰면 안 되는 때: framework나 build step이 있는 사이트를 원할 때다. 판정: ChatGPT(Codex)용으로 쓰여 있어 Claude에서는 모델 정책 부분이 맞지 않는다.[](source:sk-pipe)[](source:htu)

@answer scope="design/10k-websites/10k-websites · 텍스트 52개 497,217B · 커밋 4e3fc89 · 코드는 읽기만 함 · 지시상 동작"
@meta locale=ko
@source sk-fm title="design/10k-websites/10k-websites/SKILL.md · 21728B · frontmatter" path=design/10k-websites/10k-websites/SKILL.md lines=1:4
@source sk-intro title="SKILL.md · 사용자와 에이전트의 몫" path=design/10k-websites/10k-websites/SKILL.md lines=8:8
@source sk-start title="SKILL.md · 시작과 재개" path=design/10k-websites/10k-websites/SKILL.md lines=12:15
@source sk-pipe title="SKILL.md · 파이프라인과 경계" path=design/10k-websites/10k-websites/SKILL.md lines=19:21
@source sk-type title="SKILL.md · 글자는 영상과 함께 움직인다" path=design/10k-websites/10k-websites/SKILL.md lines=23:23
@source sk-level title="SKILL.md · 제작 등급 표" path=design/10k-websites/10k-websites/SKILL.md lines=27:33
@source sk-levelrule title="SKILL.md · 등급 제안과 몰래 낮추기 금지" path=design/10k-websites/10k-websites/SKILL.md lines=35:39
@source sk-talk title="SKILL.md · 대화 방식" path=design/10k-websites/10k-websites/SKILL.md lines=43:43
@source sk-review title="SKILL.md · 기본 검토 지점과 위임" path=design/10k-websites/10k-websites/SKILL.md lines=45:45
@source sk-gen title="SKILL.md · 생성 작업 끝까지 책임지기" path=design/10k-websites/10k-websites/SKILL.md lines=47:49
@source sk-p12 title="SKILL.md · 1~2단계 설정과 브리프" path=design/10k-websites/10k-websites/SKILL.md lines=53:55
@source sk-p34 title="SKILL.md · 3~4단계 리서치와 컨셉" path=design/10k-websites/10k-websites/SKILL.md lines=59:61
@source sk-p5 title="SKILL.md · 5단계 디자인 패키지와 견적" path=design/10k-websites/10k-websites/SKILL.md lines=65:69
@source sk-p6 title="SKILL.md · 6단계 생성·검수·조립" path=design/10k-websites/10k-websites/SKILL.md lines=73:81
@source sk-p78 title="SKILL.md · 7~8단계 에셋과 빌드" path=design/10k-websites/10k-websites/SKILL.md lines=85:89
@source sk-p9 title="SKILL.md · 9단계 점검과 미리보기" path=design/10k-websites/10k-websites/SKILL.md lines=93:97
@source sk-p10 title="SKILL.md · 10단계 게시와 완료" path=design/10k-websites/10k-websites/SKILL.md lines=101:107
@source sk-p11 title="SKILL.md · 11단계 반복" path=design/10k-websites/10k-websites/SKILL.md lines=111:111
@source sk-links title="SKILL.md · 가입 링크 규칙" path=design/10k-websites/10k-websites/SKILL.md lines=115:130
@source sk-res title="SKILL.md · 자원과 복구" path=design/10k-websites/10k-websites/SKILL.md lines=134:134
@source htu title="design/10k-websites/10k-websites/HOW-TO-USE.txt · 1219B · ChatGPT 설치 안내" path=design/10k-websites/10k-websites/HOW-TO-USE.txt lines=1:22
@source pr-choose title="references/production.md · 7558B · 등급 고르기" path=design/10k-websites/10k-websites/references/production.md lines=7:9
@source pr-table title="production.md · 등급별 결정 표" path=design/10k-websites/10k-websites/references/production.md lines=11:17
@source pr-allow title="production.md · 생산 허용치 승인" path=design/10k-websites/10k-websites/references/production.md lines=37:45
@source oa-connect title="references/openart.md · 10522B · 연결" path=design/10k-websites/10k-websites/references/openart.md lines=5:12
@source oa-exec title="openart.md · 실행 규칙" path=design/10k-websites/10k-websites/references/openart.md lines=24:29
@source oa-wait title="openart.md · 대기와 저장" path=design/10k-websites/10k-websites/references/openart.md lines=41:43
@source oa-bal title="openart.md · 잔액과 충전" path=design/10k-websites/10k-websites/references/openart.md lines=69:71
@source oa-cli title="openart.md · connector 실패 시 CLI" path=design/10k-websites/10k-websites/references/openart.md lines=75:75
@source de-job title="references/design.md · 15631B · 방문자의 일" path=design/10k-websites/10k-websites/references/design.md lines=7:15
@source de-review title="design.md · 약한 구간 비평과 대안 비교" path=design/10k-websites/10k-websites/references/design.md lines=44:44
@source de-type title="design.md · 글자와 간격 수치" path=design/10k-websites/10k-websites/references/design.md lines=72:78
@source de-motion title="design.md · hero 밖 모션" path=design/10k-websites/10k-websites/references/design.md lines=82:86
@source de-machine title="design.md · 기계가 만든 티" path=design/10k-websites/10k-websites/references/design.md lines=88:95
@source de-copy title="design.md · 카피 규칙" path=design/10k-websites/10k-websites/references/design.md lines=99:99
@source de-floor title="design.md · 품질 하한" path=design/10k-websites/10k-websites/references/design.md lines=101:109
@source de-scene title="design.md · 스토리보드 때 글자 놓을 표면" path=design/10k-websites/10k-websites/references/design.md lines=56:56
@source dp-band title="design-package.md · hero 구간 표" path=design/10k-websites/10k-websites/references/design-package.md lines=58:68
@source dp-rules title="references/design-package.md · 10570B · 두 규칙" path=design/10k-websites/10k-websites/references/design-package.md lines=3:8
@source vv-head title="references/visual-validation.md · 6157B · 내부 검토 단계" path=design/10k-websites/10k-websites/references/visual-validation.md lines=3:3
@source sh-wow title="references/shots.md · 26546B · wow 관문과 story 관문" path=design/10k-websites/10k-websites/references/shots.md lines=9:29
@source pl-person title="references/prompt-laws.md · 16349B · 실존 인물 얼굴" path=design/10k-websites/10k-websites/references/prompt-laws.md lines=54:54
@source en-layout title="references/engine.md · 21240B · 프로젝트 구조" path=design/10k-websites/10k-websites/references/engine.md lines=7:28
@source en-span title="engine.md · journey 길이 정하기" path=design/10k-websites/10k-websites/references/engine.md lines=75:80
@source en-legib title="engine.md · 최악 프레임 대비" path=design/10k-websites/10k-websites/references/engine.md lines=95:95
@source en-sync title="engine.md · 보이는 프레임 기준 글자" path=design/10k-websites/10k-websites/references/engine.md lines=99:103
@source en-track title="engine.md · 영상에 고정된 글자" path=design/10k-websites/10k-websites/references/engine.md lines=112:117
@source en-paint title="engine.md · 15% 이상 커지는 글자" path=design/10k-websites/10k-websites/references/engine.md lines=161:161
@source en-depth title="engine.md · depth scene 수치" path=design/10k-websites/10k-websites/references/engine.md lines=181:181
@source en-tools title="engine.md · 도구 메모" path=design/10k-websites/10k-websites/references/engine.md lines=202:205
@source en-self title="engine.md · 사용자에게 보이기 전 자체 점검" path=design/10k-websites/10k-websites/references/engine.md lines=207:214
@source fx-head title="references/effects.md · 6412B · 효과 라이브러리 규칙" path=design/10k-websites/10k-websites/references/effects.md lines=3:5
@source fx-fake title="effects.md · 효과를 위해 내용을 지어내지 않는다" path=design/10k-websites/10k-websites/references/effects.md lines=15:15
@source mo-basics title="references/mobile.md · 5772B · 휴대폰 기본" path=design/10k-websites/10k-websites/references/mobile.md lines=28:29
@source mo-phone title="mobile.md · 실제 휴대폰 확인" path=design/10k-websites/10k-websites/references/mobile.md lines=41:41
@source ck-score title="references/checklist.md · 4708B · 8개 항목 채점" path=design/10k-websites/10k-websites/references/checklist.md lines=3:14
@source ck-after title="checklist.md · 전후 점수 표와 한계" path=design/10k-websites/10k-websites/references/checklist.md lines=22:30
@source la-search title="references/launch.md · 4569B · 검색 기본" path=design/10k-websites/10k-websites/references/launch.md lines=14:17
@source la-report title="launch.md · launch report" path=design/10k-websites/10k-websites/references/launch.md lines=24:24
@source la-client title="launch.md · client 모드" path=design/10k-websites/10k-websites/references/launch.md lines=28:35
@source dl-target title="references/deploy.md · 6896B · 대상 확인" path=design/10k-websites/10k-websites/references/deploy.md lines=26:26
@source dl-archive title="deploy.md · 배포 압축에서 뺄 것" path=design/10k-websites/10k-websites/references/deploy.md lines=40:40
@source dl-verify title="deploy.md · 응답과 별개로 검증" path=design/10k-websites/10k-websites/references/deploy.md lines=44:50
@source be-choice title="references/backend.md · 7178B · 폼 처리 선택지" path=design/10k-websites/10k-websites/references/backend.md lines=7:14
@source be-safety title="backend.md · 안전장치" path=design/10k-websites/10k-websites/references/backend.md lines=35:40
@source be-owner title="backend.md · 소유자 인계" path=design/10k-websites/10k-websites/references/backend.md lines=50:54
@source be-record title="backend.md · 상태를 따로 기록" path=design/10k-websites/10k-websites/references/backend.md lines=68:68
@source tr-three title="references/troubleshooting.md · 23312B · 세 번 실패" path=design/10k-websites/10k-websites/references/troubleshooting.md lines=15:15
@source tr-size title="troubleshooting.md · 12 MB 넘는 영상" path=design/10k-websites/10k-websites/references/troubleshooting.md lines=34:34
@source tr-hang title="troubleshooting.md · 연속 무응답" path=design/10k-websites/10k-websites/references/troubleshooting.md lines=115:115
@source ff-head title="references/ffmpeg-recipes.md · 7857B · 이야기 보존" path=design/10k-websites/10k-websites/references/ffmpeg-recipes.md lines=3:3
@source pg-head title="references/pages.md · 3334B · 페이지·언어 추가" path=design/10k-websites/10k-websites/references/pages.md lines=3:3
@source tk-head title="tools/track.mjs · 36315B · 명령 설명" path=design/10k-websites/10k-websites/tools/track.mjs lines=1:26
@source ts-fail title="tools/typesync.mjs · 13372B · 불일치 판정" path=design/10k-websites/10k-websites/tools/typesync.mjs lines=110:110
@source cm-dead title="tools/check.mjs · 34928B · dead scroll" path=design/10k-websites/10k-websites/tools/check.mjs lines=106:111
@source cm-band title="check.mjs · 자막 최대 불투명도와 flick" path=design/10k-websites/10k-websites/tools/check.mjs lines=122:133
@source cm-contrast title="check.mjs · 최악 프레임 대비 3.5:1" path=design/10k-websites/10k-websites/tools/check.mjs lines=164:164
@source cm-phone title="check.mjs · 휴대폰 viewport 세 개" path=design/10k-websites/10k-websites/tools/check.mjs lines=201:201
@source cm-reduced title="check.mjs · reduced motion 검사" path=design/10k-websites/10k-websites/tools/check.mjs lines=233:236
@source cm-reuse title="check.mjs · 그림 재사용 검사" path=design/10k-websites/10k-websites/tools/check.mjs lines=311:326
@source cm-exit title="check.mjs · 종료 코드" path=design/10k-websites/10k-websites/tools/check.mjs lines=342:342
@source enc-head title="tools/encode.mjs · 9979B · 사용법" path=design/10k-websites/10k-websites/tools/encode.mjs lines=3:10
@source enc-fit title="encode.mjs · 크기 목표와 압축 단계" path=design/10k-websites/10k-websites/tools/encode.mjs lines=76:99
@source enc-phone title="encode.mjs · 휴대폰 crop" path=design/10k-websites/10k-websites/tools/encode.mjs lines=114:120
@source us-head title="tools/usage.mjs · 5525B · 읽기 전용 사용량" path=design/10k-websites/10k-websites/tools/usage.mjs lines=1:4
@source us-read title="usage.mjs · Codex 세션 기록 읽기" path=design/10k-websites/10k-websites/tools/usage.mjs lines=47:62
@source us-dir title="usage.mjs · 읽는 폴더" path=design/10k-websites/10k-websites/tools/usage.mjs lines=93:95
@source sv-bind title="tools/server.mjs · 6086B · loopback과 금지 경로" path=design/10k-websites/10k-websites/tools/server.mjs lines=7:37
@source lb-stamp title="backend/api/lib.php · 10099B · 제출 시간 스탬프" path=design/10k-websites/10k-websites/backend/api/lib.php lines=122:128
@source sb-rate title="backend/api/submit.php · 3526B · 봇 필드와 전송 제한" path=design/10k-websites/10k-websites/backend/api/submit.php lines=25:32
@source ad-lock title="backend/admin/index.php · 11660B · 비밀번호 잠금" path=design/10k-websites/10k-websites/backend/admin/index.php lines=23:26
@source pkg title="tools/package.json · 625B · 의존성" path=design/10k-websites/10k-websites/tools/package.json lines=1:21
@source dtf-desc title="design/taste/design-taste-frontend/SKILL.md · r44 대조용 description" path=design/taste/design-taste-frontend/SKILL.md lines=3:11

## 언제 켜지고, 사람은 어디서 개입하고, 언제 쓰면 안 되나 {#trigger}

@code source=sk-fm language=yaml

이 스킬에는 `disable-model-invocation` 같은 호출 제한 필드가 없다. 그래서 모델이 `description`을 참고해 스스로 켤 수 있다.[](source:sk-fm) 판정: `description`은 판단을 돕는 설명이다. 특정 단어가 있다고 켜지는 목록이 아니다.

시작할 때 에이전트는 요청 종류부터 가른다.[](source:sk-start)

- 설치 요청이면 폴더 전체를 개인 스킬로 설치하고, 확인한 뒤 호출 방법 하나만 알려 준다. 설치 대화에서는 웹사이트를 시작하지 않는다.
- 이어서 만드는 경우면 `.10k/plan.md`를 읽는다. 기록된 제작 등급, 승인, 에셋, 수정 사항을 그대로 이어 간다. 돌아왔다고 브리프나 예산을 처음부터 다시 정하지 않는다.
- 새로 만드는 경우면 폴더, Node.js, FFmpeg, Chrome이나 Edge, OpenArt 연결과 실제 잔액을 확인한다. Hostinger 연결 여부는 조용히 적어 두고 게시할 때 설정한다.

사람은 아래 지점에서 개입한다. 에이전트는 설치·설정은 직접 하고, 사람에게는 꼭 필요한 동작만 하나씩 부탁한 뒤 결과를 스스로 확인한다.[](source:sk-start)[](source:sk-p12)

| 지점 | 에이전트가 하는 일 | 사람의 몫 |
| --- | --- | --- |
| 로그인·구매·비밀번호 | 한 번에 한 동작씩 안내하고 결과를 직접 확인한다. "끝났다"는 말을 확인으로 치지 않는다[](source:sk-start) | {bad:사람만 한다} |
| 제작 등급 | Full throttle, Studio, Focused budget을 모두 보통 선택지로 제안하고 하나를 추천한다[](source:sk-levelrule) | {caution:등급을 고른다} |
| 이야기와 지출 | 구체적인 Visual Story와 정확한 견적을 실제 잔액과 함께 보인다. 생성 전에 승인받는다[](source:sk-p5) | {bad:승인} |
| 기본 검토 5곳 | 컨셉·견적, 애니메이션 전 핵심 이미지, 완성 영상, 완성 사이트, 게시 순서로 보여 준다[](source:sk-review) | {caution:검토하거나 위임한다} |
| 범위·지출 확대 | 승인된 허용치를 넘으면 새 제안을 낸다. 크레딧을 대신 사지 않는다[](source:sk-review)[](source:pr-allow) | {bad:새 승인} |
| 게시 | 사용자가 게시를 허락하면 멈추지 않고 배포까지 이어 간다[](source:sk-p10) | {bad:게시 허락} |
| 받은편지함 비밀번호 | 설정 코드만 건네고 비밀번호는 묻지도 정하지도 않는다[](source:be-owner) | {bad:소유자가 정한다} |
| 실제 휴대폰 | 실제 휴대폰으로 스크롤해 보라고 권하고, 했는지 기록한다[](source:sk-p10)[](source:mo-phone) | {caution:직접 확인한다} |
| 실존 인물 얼굴 | 사용자 본인이나 동의한 사람의 사진만 쓴다. 다른 사람이면 멈추고 묻는다[](source:pl-person) | {bad:동의 확인} |

사용자가 창작 결정을 위임하면 에이전트는 검토를 내부에서 하고, 매번 계속할지 묻지 않고 검토·수정·확인을 반복한다. 위임해도 지출이 늘거나 요청하지 않은 외부 동작이 허락되지는 않는다.[](source:sk-review) 연속성 검증 같은 단계는 내부 검토이고 사용자 승인 지점을 늘리지 않는다.[](source:vv-head)

**금지된 것**은 다음과 같다.

| 금지 | 근거 |
| --- | --- |
| 사용자의 명시 지시 없이 OpenArt 대신 다른 생성기나 Hostinger 대신 다른 호스팅을 쓴다 {bad:금지} | 원문 규칙[](source:sk-pipe) |
| 배포 폴더 `site/`에 framework, build step, npm을 넣는다. 함께 들어 있는 엔진 파일을 고친다 {bad:금지} | 원문 규칙[](source:sk-pipe) |
| 실존 업체의 후기, 수상, 주소, 제품 주장을 지어낸다. 지어낸 브랜드는 그렇다고 밝힌다 {bad:금지} | 원문 규칙[](source:sk-pipe)[](source:fx-fake) |
| Full throttle의 모델을 요금제, 잔액, 사용량 때문에 몰래 낮춘다 {bad:금지} | 원문 규칙[](source:sk-levelrule) |
| 크레딧을 사용자 대신 산다. 잔액이 있다는 이유로 쓴다 {bad:금지} | 원문 규칙[](source:sk-review)[](source:sk-p5) |
| 시작한 생성 작업이 도는 중에 턴을 끝내 사용자가 끝났는지 묻게 한다 {bad:금지} | 원문 규칙[](source:sk-gen) |
| 이음새 하나를 고치면서 승인된 장면, 순서, 속도를 바꾼다. 더 큰 편집은 동의가 필요하다 | 원문 규칙[](source:sk-p6)[](source:ff-head) |
| 카메라 움직임을 눈대중으로 추측해 글자를 붙인다 | 원문 규칙[](source:sk-type) |
| 짐작으로 고른 다른 사이트를 덮어쓴다 | 원문 규칙[](source:sk-p10)[](source:dl-target) |

가입 링크 규칙은 별도로 강하다. OpenArt와 Hostinger 링크는 스킬 제작자의 partner 링크다. 에이전트는 공유할 때마다 그 사실을 한 줄로 밝힌다. 다음 네 순간에는 링크를 반드시 넣는다.[](source:sk-links)

- 1단계에서 OpenArt가 아직 설정되지 않았을 때(OpenArt 링크)
- 잔액이 다음 승인 생성을 못 덮거나, 사용자가 충전·업그레이드를 물을 때(OpenArt 링크)
- 10단계에서 게시할 준비가 됐는데 Hostinger 계정이 없을 때(Hostinger 링크, 추가 10% 할인과 무료 도메인 안내)
- 나중에 새 도메인, 업무 메일, 두 번째 사이트, 호스팅 확장, 사이트 이전을 물을 때(Hostinger 링크)

이미 계정이 있거나 가입·결제와 상관없는 순간에는 링크를 넣지 않는다. 이 두 서비스에 다른 가입 링크를 쓰거나 경쟁 서비스 링크를 주는 것은 금지다.[](source:sk-links)

판정: 이 절은 제작자의 수익 링크를 정해진 순간에 노출하게 만든다. 사용자는 이 점을 알고 쓰는 편이 좋다. 근거는 링크가 "the creator's partner links"라는 원문 표기다.[](source:sk-links)

**쓰면 안 되는 경우**를 원문이 따로 정하지는 않았다. 판정: 아래 경우에는 맞지 않을 가능성이 크다.

- React나 Next.js 같은 framework, build step이 필요한 사이트. 배포 폴더는 순수 HTML/CSS/JavaScript여야 한다.[](source:sk-pipe)
- OpenArt나 Hostinger를 쓸 수 없는 환경. connector 실패 시 OpenArt CLI가 있지만, 승인된 모델과 품질을 지킬 수 없으면 먼저 그 한계를 해결하라고 한다.[](source:oa-cli)
- Claude 같은 다른 에이전트. 설치 안내는 ChatGPT 데스크톱 앱의 Codex를 전제하고, connector 추가 명령은 `codex mcp add`이며, 제작 등급은 "top GPT"를 고르는 정책이다.[](source:htu)[](source:oa-connect)[](source:sk-level)

## 어떤 순서로 진행하나 {#pipeline}

원문은 11단계를 적는다. 기본 검토 지점은 이 단계들 사이에 놓이고, 결과를 함께 볼 수 있으면 합친다.[](source:sk-review) 아래 그림은 승인 두 곳을 결정 노드로 그렸다.

@workflow id=build-flow title="10k-websites 제작 흐름"
| lane prep | 준비 |
| lane plan | 기획 |
| lane make | 제작 |
| lane ship | 게시 |
| bf-setup | 1-2 설정·브리프 | external | prep |
| bf-concept | 3-4 리서치·컨셉 | backend | prep |
| bf-package | 5 디자인 패키지 | backend | plan |
| bf-approve | 이야기·지출 승인? | external | plan |
| bf-gen | 6 생성·검수 | backend | make |
| bf-build | 7-8 에셋·빌드 | backend | make |
| bf-check | 9 점검·미리보기 | backend | make |
| bf-publish | 게시 허락? | external | ship |
| bf-deploy | 10 배포·검증 | cloud | ship |
| bf-iter | 11 반복 | backend | ship |
| bf-setup > bf-concept | |
| bf-concept > bf-package | |
| bf-package > bf-approve | 견적 |
| bf-approve > bf-package | 아니오 |
| bf-approve > bf-gen | 예 | emphasis |
| bf-gen > bf-build | 영상 승인 |
| bf-build > bf-check | |
| bf-check > bf-publish | |
| bf-publish > bf-deploy | 예 | emphasis |
| bf-deploy > bf-iter | |

@steps id=build-steps
| bf-setup | 1-2 설정·브리프 | 도구와 연결을 확인하고 빠진 것만 묻는다. 사업·방문자 목표, 실제 사진 여부, 내 사이트인지 client 사이트인지, 원하는 느낌, 참고 사이트, 제작 등급이다. 도구를 `.10k/tools/`에 복사하고 script를 끈 채 한 번 설치한다. `.10k/plan.md`에 브리프, `production_level`, 모델 선택, 비용 승인, 실제 지출, 다음 동작을 적는다.[](source:sk-p12) | build-flow | bf-setup |
| bf-concept | 3-4 리서치·컨셉 | 실제 고객 근거를 조사해 방문자의 일과 반론을 이해한다. 서로 확실히 다른 컨셉 몇 개를 짧은 영상과 페이지 전체 경험으로 제안하고 가장 강한 것을 추천한다.[](source:sk-p34) 컨셉은 wow 관문 다섯 항목을 모두 통과해야 보여 준다.[](source:sh-wow) | build-flow | bf-concept |
| bf-package | 5 디자인 패키지 | `.10k/design-package.md`에 이야기, 글자, 위계, 이미지, 모션, 전환 경로를 함께 설계한다. 패키지의 카피는 빌드에서 한 글자도 바꾸지 않는다.[](source:sk-p5)[](source:dp-rules) Visual Story(장면 / 방문자가 보는 것 / 화면의 글)와 모델·설정별 현재 가격을 보인다.[](source:sk-p5) | build-flow | bf-package |
| bf-approve | 이야기·지출 승인? | 구체적인 이야기와 지출을 승인받아야 생성을 시작한다. 잔액만으로는 지출 승인이 아니다.[](source:sk-p5) 승인 뒤 핵심 이미지가 나오면 hero 글자, 아래 구간 하나, 휴대폰 화면을 담은 작은 HTML 미리보기를 먼저 보인다.[](source:sk-p5) | build-flow | bf-approve |
| bf-gen | 6 생성·검수 | 등급에 맞는 이미지·영상 모델을 고른다. 마지막 장면(reveal) 참조 이미지를 먼저 만들고 그 앞 장면들을 만든다. 불확실한 움직임은 대표 시험 영상(pilot)으로 먼저 증명한다. 영상은 `review.mjs`로 전체 재생과 이음새를 확인하고, 위임받지 않았으면 승인을 받는다.[](source:sk-p6) | build-flow | bf-gen |
| bf-build | 7-8 에셋·빌드 | 승인된 원본 영상(master)을 `encode.mjs`로 인코딩하고 전체 세로 화면 흐름을 확인한다. 엔진은 그대로 두고 프로젝트 전용 동작만 쓴다. 폼 처리 방식을 정하고 brand kit과 검색 기본을 만든다.[](source:sk-p78) | build-flow | bf-build |
| bf-check | 9 점검·미리보기 | `check.mjs site review`로 결함을 고치고, 카피 검토와 8항목 채점을 한다. `filmtype.js`를 쓰면 `typesync.mjs`를 돌리고 직접 빠르게·느리게 스크롤해 본다. `preview.mjs`로 미리보기를 띄우고 URL이 응답하는지 확인한 뒤 건넨다.[](source:sk-p9) | build-flow | bf-check |
| bf-publish | 게시 허락? | 사용자가 게시를 허락해야 `deploy.md`를 읽고 진행한다.[](source:sk-p10) | build-flow | bf-publish |
| bf-deploy | 10 배포·검증 | 주소를 정하고 canonical·OG·backend URL을 고친다. `report.mjs ... --seo-only`를 돌리고 배포 가능한 파일만 압축해 Hostinger로 올린다. 요청 접수가 아니라 실제 완료와 라이브 내용을 확인한다. HTTPS, 두 영상, backend 보호를 확인하고 휴대폰 보고서를 보인다.[](source:sk-p10) | build-flow | bf-deploy |
| bf-iter | 11 반복 | 이후 수정은 받아들인 작업을 지키고, 허락 범위 안에서 다시 배포해 라이브 버전을 확인한다. 결함 하나에 대한 피드백은 그 결함만 고친다.[](source:sk-p11) | build-flow | bf-iter |

에이전트는 생성 작업을 시작하면 끝까지 책임진다.[](source:sk-gen)

- 다운로드, 검사, 조립, 보여 주기까지 맡는다. 오래 걸리면 중간에 알리고 그사이 다른 일을 한다.
- 계속할 수 없으면 job ID와 상태를 저장하고 정확한 다음 동작을 설명한다. 예약된 후속 작업이 있는 척하지 않는다.

OpenArt 결과를 기다릴 때는 한 script 안에서 20초마다 확인하라고 권한다. 한 번 확인할 때마다 대화 전체를 다시 보내기 때문이다.[](source:oa-wait)

원문에 있는 멈춤 조건은 셋이다.

- 근거 있는 다음 개선이 없으면 지출을 멈춘다. 같은 실패가 반복되면 진단하고 다른 방법을 제안한다.[](source:sk-p6)
- 한 컨셉에서 영상이 세 번 실패하면 컨셉 문제로 보고 지출을 멈춘 뒤 진단한다.[](source:tr-three)
- 호출 두 번이 연달아 응답이 없으면 맹목적 재시도를 멈추고 인증, 도구 상태, 연결을 진단한다.[](source:tr-hang)

## 무엇을 강제하나: 등급, 지출, 영상 위의 글자 {#rules}

제작 등급은 GPT 모델과 이미지·영상 제작 정책을 **둘 다** 정한다. 요금제나 현재 잔액은 참고 정보일 뿐 이 선택을 대신하지 않는다.[](source:sk-level)

| 등급 | GPT | 이미지·영상 |
| --- | --- | --- |
| Full throttle | 모든 단계와 위임 작업에 현재 최상위 GPT[](source:sk-level) | 가장 강한 적합 모델, 고품질 설정, 탐색과 다듬기, 필요하면 세로 전용 제작[](source:sk-level) |
| Studio | 방향과 창작 검토는 최상위 GPT, 일상 실행은 합의한 GPT[](source:sk-level) | 강한 모델, 눈에 띄게 도움 되는 곳만 premium[](source:sk-level) |
| Focused budget | 사용자와 합의한 효율적인 GPT, 허용되면 검토만 강하게[](source:sk-level) | 예산 안 최선, 실험 줄임[](source:sk-level) |

- 최고 품질이나 "예산 제한 없음"을 원하면 Full throttle을 추천한다. 그 밖에는 브리프에 맞게 추천하되 premium 선택지를 숨기지 않는다.[](source:sk-levelrule)
- 모든 등급이 독창적인 방향, 읽히는 모션, 접근성, 작동하는 사이트를 받는다. 등급은 모델과 제작 깊이를 바꿀 뿐이다.[](source:pr-choose)
- 모델 이름은 고정하지 않는다. 매번 현재 모델 목록과 증거로 고르고, 바꿀 수 없는 모델 전환을 했다고 말하지 않는다.[](source:sk-levelrule)
- `.10k/plan.md`에 `production_level: full-throttle | studio | focused`를 기록한다.[](source:pr-choose)

지출은 승인된 묶음 단위로 움직인다.

- 한 번 승인하면 그 묶음과 허용치 안 수정은 덮인다. 총액이 커지거나, 새 유료 범위가 생기거나, 모델 선호가 바뀌거나, 허용치를 다 쓰면 구체적인 새 선택을 받는다.[](source:pr-allow)
- 에이전트는 유료 호출마다 미리 비용을 확인하고 실제 잔액을 본다.[](source:oa-exec)[](source:oa-bal)
- 잔액이 모자라면 정확한 부족분을 말하고 OpenArt 링크를 준다. Full throttle은 자동으로 낮추지 않고, 더 싼 경로는 명시적 대안으로만 제시한다.[](source:oa-bal)

**영상 위의 글자**는 이 스킬의 가장 독특한 강제 사항이다. 영화 같은 사이트라면 주요 hero 글자를 실제 영상의 식별 가능한 움직임에 맞춰 이동, 크기 변화, 방향 변화로 연출해야 한다. 일반적인 등장 효과나 투명도 fade만으로는 이 요구를 채우지 못한다.[](source:sk-type)

- 글자는 스크롤 값이 아니라 화면에 실제로 보이는 프레임을 기준으로 움직인다. 엔진이 seek를 조절하므로 스크롤이 영상보다 앞서가기 때문이다. 손으로 쓸 때는 `requestVideoFrameCallback`의 media time과 `seeked`를 읽는다.[](source:en-sync)
- 가장 강한 방법은 벽, 길, 테이블, 제품 면 같은 영상 속 표면에 글자를 붙이는 것이다. `tools/track.mjs`가 표면 움직임을 재서 `site/filmtrack.js`를 쓰고, `engine/filmtype.js`가 보이는 프레임에 글자를 놓는다.[](source:en-track)[](source:tk-head)
- 휴대폰용 연출은 따로 쓴다. 되감기와 임의 위치 이동에서도 같은 프레임이면 같은 상태여야 한다. reduced motion과 영상 실패 때는 읽을 수 있는 정적 구성을 보인다.[](source:sk-type)[](source:en-sync)

판정: 이 강제 사항 때문에 에이전트는 글자 디자인을 영상 생성보다 먼저 계획하게 된다. 원문은 스토리보드 단계에서 글자를 놓을 평평하고 질감 있는 표면을 확보하라고 한다.[](source:de-scene) 디자인 패키지에는 hero 구간마다 영상의 움직임 시점과 글자 변환을 한 행씩 적게 한다.[](source:dp-band)

## 무엇을 만들고, 무엇으로 검사하나 {#outputs}

에이전트는 사용자의 웹사이트 폴더에 아래 구조를 만든다. 온라인에 올라가는 것은 `site/`뿐이다.[](source:en-layout)

@tree id=project-layout title="웹사이트 폴더 구조"
| root | my-site/ | - | source:en-layout |
| site | site/ (온라인) | root | source:en-layout |
| index | index.html | site | source:en-layout |
| engine | scene.js·fx.js·filmtype.js (복사본) | site | source:en-layout |
| style | style.css (사이트 고유) | site | source:en-layout |
| assets | assets/ (웹용 이미지·영상) | site | source:en-layout |
| photos | photos/ (원본 사진) | root | source:en-layout |
| review | review/ (후보·검사 결과) | root | source:en-layout |
| tenk | .10k/ | root | source:en-layout |
| plan | plan.md (결정·예산·지출) | tenk | source:en-layout |
| design | design-package.md | tenk | source:dp-rules |
| tools | tools/ (복사본과 node_modules) | tenk | source:en-layout |

이 밖에 실제 받은편지함을 고르면 `site/` 안에 `api/`, `admin/`, `data/`, `forms.js`가 생긴다.[](source:be-choice) client 사이트면 `client-kit/`에 `brand-guide.pdf`와 `handover.pdf`를 만들고, 이 폴더는 온라인에 올리지 않는다.[](source:la-client)

| 도구 | 하는 일 |
| --- | --- |
| `encode.mjs` | 영상을 스크롤 스크럽용으로 다시 인코딩하고 마지막 프레임을 포스터로 만든다. `--mobile`이면 720x1280 세로 crop도 만든다[](source:enc-head)[](source:enc-phone) |
| `track.mjs` / `typesync.mjs` | 표면 움직임을 재고, 글자가 보이는 프레임에 붙어 있는지 데스크톱과 휴대폰에서 검사한다[](source:tk-head)[](source:ts-fail) |
| `check.mjs` | 실제 Chrome·Edge로 hero, 자막, 대비, 휴대폰, reduced motion, 링크, 그림 중복을 검사한다. 문제가 있으면 종료 코드 1이다[](source:cm-exit) |
| `report.mjs` | Lighthouse 휴대폰·desktop 점수와 검색 기본을 보고하고, `--seo`로 `sitemap.xml`·`robots.txt`를 쓴다[](source:la-report)[](source:la-search) |
| `preview.mjs` / `review.mjs` | 127.0.0.1에만 묶인 미리보기 서버다. PHP, 개인 폴더, dotfile은 내보내지 않는다[](source:sv-bind) |
| `usage.mjs` | GPT 사용량 읽기 전용 대안. 로컬 `~/.codex/sessions`의 최근 7일 `.jsonl` 기록을 최대 25개 읽는다[](source:us-head)[](source:us-read)[](source:us-dir) |
| `depth.mjs`, `brand.mjs`, `kit.mjs`, `backend.mjs` | depth map, favicon·`og.jpg`, client kit PDF, 받은편지함 파일 복사를 맡는다. 의존성은 `playwright-core`, `sharp`, `@huggingface/transformers`다[](source:pkg) |

원문과 코드의 수치는 성격이 다르다. 아래는 의무·통과 조건·권고를 나눠 옮긴 것이다.

| 값 | 성격 | 적용 조건 |
| --- | --- | --- |
| 자막 대비 3.5:1 | 통과 조건. 미달이면 `check.mjs`가 고칠 것으로 낸다 | 각 자막의 최악 프레임 기준[](source:en-legib)[](source:cm-contrast) |
| 자막 1개당 화면 80~130% 스크롤, 자막 사이 약 0.08 | 권고("about") | `data-k-span` 3(depth)·4·5(기본)·6[](source:en-span) |
| 최대 불투명도 0.98 미만, 120px 휠 이동 1~4번만 읽힘, 360px 휠 이동 한 번에 건너뜀 | `check.mjs` 문제 판정 | hero 자막마다[](source:cm-band) |
| hero 스크롤 15% 구간에서 화면 변화가 거의 없음 | `check.mjs` dead scroll 판정 | 차이 1.2 미만[](source:cm-dead) |
| 글자-영상 불일치 3% 초과 또는 2프레임 초과 | `typesync.mjs` 문제 판정 | 그려진 프레임 기준[](source:ts-fail) |
| 15% 넘게 커지는 글자는 한 번 그려 크기만 바꾼다 | 기본 동작 | `data-ft-paint`로 바꿀 수 있다[](source:en-paint) |
| 영상 12 MB(8초 넘으면 14 MB) | `encode.mjs` 기본 목표. 넘으면 CRF를 올리고 폭을 1600px로 줄인다. 최대 3회 추가 | 장면을 잘라 맞추지는 않는다[](source:enc-fit)[](source:tr-size) |
| 본문 17~20px, 줄 길이 45~75자, 줄 높이 약 1.5~1.65 | 권고 | 간격 척도 예: 4, 8, 12 … 128[](source:de-type) |
| 본문 대비 4.5:1, 큰 글자와 컨트롤 테두리 3:1, 터치 44px | 품질 하한(모든 빌드) | `(pointer: coarse)`에서 44px[](source:de-floor) |
| 휴대폰 320px, 375~390px, 높이 667px | 확인 폭 | `check.mjs`는 390x844, 375x812, 375x667을 돈다[](source:mo-basics)[](source:cm-phone) |
| 등장 stagger 60~150ms | 권고 | hero 밖 섹션[](source:de-motion) |
| CTA 하나, 최대 세 번, 같은 문구 | 카피 규칙 | em dash와 stock word 금지[](source:de-copy) |
| title 65자 이하, meta description 50~160자 | 검색 기본 | 모든 페이지[](source:la-search) |
| Lighthouse 90 미만 항목 수정 | 권고. 100을 약속하지 않는다 | 라이브 주소에서[](source:la-report) |
| 8항목 1~10점, 합계 80점 | 디자인 판단(객관 인증 아님) | 첫 미리보기와 다듬은 뒤[](source:ck-score)[](source:ck-after) |
| 폼 3초 안 제출 거부, 방문자당 10분에 5회 | backend 안전장치 | 코드는 3초~24시간 스탬프만 받는다[](source:be-safety)[](source:lb-stamp)[](source:sb-rate) |
| 받은편지함 비밀번호 8회 실패 잠금 | backend 안전장치 | 코드는 15분 창(900초)으로 센다[](source:be-safety)[](source:ad-lock) |
| 영상 길이 10~15초 | 출발점 예시. 최대나 목표가 아니다 | 모델이 지원하는 실제 길이로 견적[](source:oa-exec) |

에이전트는 자동 검사를 품질 인증으로 쓰지 않는다. `check.mjs`는 디자인 품질이나 모든 상호작용을 인증하지 않고, 스크린샷과 일반 스크롤 애니메이션은 동기화를 증명하지 못한다.[](source:sk-p9) 게시 뒤에는 사이트 게시, 받은편지함 활성화, 알림 전달을 서로 다른 상태로 보고한다. health check로 전달을 주장하지 않는다.[](source:sk-p10)[](source:be-record)

## 비슷한 스킬과 무엇이 다른가 {#similar}

이 스킬은 묶음 `site-design-choice`의 선택지 하나다. 이 묶음은 랜딩 페이지와 회사 웹사이트를 만들 스킬을 고르는 비교이고, 스킬끼리 서로를 부르지 않는다. 관계 원장에서 이 스킬과 이어진 행은 r44 하나다. `landing-page-design`, `impeccable`, `web-design-engineer`와 이어진 원장 행은 없다.

| 기준 | `10k-websites` | `design-taste-frontend` |
| --- | --- | --- |
| 무엇을 만드나 | 브리프에서 시작해 OpenArt 이미지·영상, 스크롤 영상 사이트, Hostinger 라이브 사이트까지[](source:sk-fm) | 회사·제품 웹사이트와 랜딩 페이지를 만들고 리디자인·리뷰한다[](source:dtf-desc) |
| 이미지 출처 | OpenArt로 생성 {caution:생성 중심}[](source:sk-pipe) | 실제 사진과 실제 제품 UI, 사진이 없으면 제품 렌더[](source:dtf-desc) |
| 기술 범위 | 순수 HTML/CSS/JavaScript만. framework 금지 {caution:좁음}[](source:sk-pipe) | HTML/CSS, React, Next.js, Vue, Svelte, Astro, Tailwind 등 어떤 stack이든[](source:dtf-desc) |
| 검사 | `check.mjs`, `typesync.mjs`, Lighthouse report[](source:sk-p9) | 실제 브라우저에서 규칙을 강제하는 checker[](source:dtf-desc) |
| 배포·비용 | 배포와 유료 생성 지출 승인까지 포함 {good:끝까지}[](source:sk-p10) | `원문에 명시 없음`(description 기준) |

r44는 `같은 계열`, 근거 방식은 `추론`이다. 두 description이 모두 회사·브랜드 웹사이트를 처음부터 만든다는 점이 근거다. 순서나 호출 관계는 없다.[](source:sk-fm)[](source:dtf-desc)

판정: 생성한 영상으로 hero를 만들고 실제 게시까지 원하는 초보자라면 `10k-websites`가 맞다. 기존 코드 stack 안에서 실제 사진으로 작업하거나 리뷰만 원하면 `design-taste-frontend` 쪽이 맞을 가능성이 크다. 근거는 위 두 description의 범위 차이다.[](source:sk-fm)[](source:dtf-desc)

전체 비교는 `design/_group-site-design-choice/site-design-choice.html`에 있다. 관계 근거는 `design/relations.md`의 r44로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 52개, 합계 497,217B다. 파일별 바이트·역할·읽은 정도는 같은 폴더의 `files.md`에 있다. 페이지에는 인용한 파일만 `@source`로 선언했다.
- 전부 읽은 파일: `SKILL.md`, `HOW-TO-USE.txt`, `references/` 17개, `tools/` 중 10개(`backend`, `brand`, `depth`, `encode`, `kit`, `preview`, `review`, `server`, `usage` script와 `package.json`), backend의 `.htaccess` 2개와 `submit.php`, engine CSS 일부.
- 부분만 읽은 파일: 큰 코드(`check.mjs`, `track.mjs`, `typesync.mjs`, `report.mjs`, `scene.js`, `fx.js`, `filmtype.js`, `lib.php`, `admin/index.php`, `forms.js`, `fx.css`, `scene.css`)는 머리 주석, 오류·출력 메시지, 판정 줄을 중심으로 읽었다. 추적 알고리즘과 WebGL 렌더링 세부는 확인하지 않았다.
- 테스트 6개(`tools/tests/*.test.mjs`)는 테스트 이름 수준으로만 확인했다. 실행하지 않았다.
- 구조·표본만 확인한 대형 생성 데이터는 없다. 바이너리 파일도 없다. 작업 트리에 commit되지 않은 `*.ko.md` 번역본이 있지만 열지 않았다.
- 제외한 파일: `design/10k-websites/README.md`(4,544B)는 이 저장소 관리자가 쓴 한국어 소개다. 스킬 원본이 아니어서 근거로 쓰지 않았다.
- 원문 대조 범위: 활성화 제한 1개(호출 제한 필드 없음), 사람 개입 지점 9행, 금지 9행, 가입 링크 필수 순간 4개, 등급 3행, 수치 18행, 멈춤 조건 3개(지출 중단, 세 번 실패, 연속 무응답)를 원문과 대조했다. 관계 행 r44는 원장과 두 description을 다시 대조했고 같다.
- 분석 중 바뀐 파일: 없음. 스킬 지시(설치, connector 추가, 배포, script 실행)는 하나도 실행하지 않았다.

@callout level=open-question title="원문과 코드가 어긋나거나 확인하지 못한 곳"
- 그림 재사용 규칙이 다르다. `design.md`와 `troubleshooting.md`는 의도한 반복 motif나 비교를 허용한다. `check.mjs`는 hero 밖에서 같은 그림이 두 번 쓰이거나 `hero-` 이름 그림이 아래에 나오면 모두 "고칠 것"으로 내고 종료 코드 1을 돌려준다. `engine.md`는 고칠 것이 없을 때까지 `check.mjs`를 돌리라고 한다. 둘 사이의 우선순위는 `원문에 명시 없음`이다.[](source:de-machine)[](source:cm-reuse)[](source:en-self)
- `usage.mjs`는 인자 없이 실행하면 `CODEX_HOME`이나 `~/.codex/sessions`의 로컬 세션 기록을 읽는다. rate limit 관련 줄만 파싱하지만, 다른 에이전트 환경에서는 읽을 대상이 없다. 실행해 확인하지 않았다.[](source:us-read)[](source:us-dir)
- 원문은 OpenArt connector 도구 이름(`openart_` 접두어)과 Hostinger connector를 ChatGPT 환경 기준으로 적는다. Claude 환경에서 같은 도구가 있는지는 확인하지 않았다.[](source:oa-connect)
- backend 문서는 "3초", "8회 실패"만 적는다. 코드에는 스탬프 유효기간 24시간과 잠금 창 15분이 더 있다. 문서와 충돌은 아니지만 문서에 없는 값이다.[](source:lb-stamp)[](source:ad-lock)
- 이 스킬이 실제로 에이전트의 출력을 얼마나 바꾸는지는 실행하지 않아 확인하지 못했다.
