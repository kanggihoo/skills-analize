# 10k-websites — OpenArt 영상·내장 엔진 웹사이트 구축과 Hostinger 배포 {#overview}

10k-websites는 에이전트가 초보자의 간단한 요구사항을 바탕으로 OpenArt 이미지·영상을 생성하고 내장 스크롤 엔진으로 웹사이트를 만들어 Hostinger에 배포하게 한다.[](source:fm)[](source:bounds)

- 새 웹사이트를 시작하거나 `.10k/plan.md`로 이어서 작업할 때, 또는 스킬 설치 요청을 받았을 때 켠다. 제작 등급은 `Full throttle`, `Studio`, `Focused budget` 세 가지로 나뉜다.[](source:start)[](source:levels)
- 결과로 `site/`(정적 HTML/CSS/JS, 선택적 PHP 받은편지함, 브랜드 키트)와 `.10k/plan.md`, `.10k/design-package.md`, `review/` 검증 산출물, 배포된 HTTPS 사이트가 남는다.[](source:p12)[](source:p35)[](source:p10)
- 다른 스킬과는 `landing-page-design`과 대안 관계로 이어진다.
- `site/` 안에 프레임워크·npm·빌드 과정을 넣지 않고 내장 엔진 파일은 수정하지 않으며, 크레딧을 대신 결제하거나 사실과 다른 후기·주소·수치를 지어내지 않는다.[](source:bounds)[](source:auto)

@answer scope="design/10k-websites/10k-websites · 원본 파일 52개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source fm title="frontmatter: 이름과 description" path=design/10k-websites/10k-websites/SKILL.md lines=1:4
@source start title="설치 분기, 재개, 사전 점검" path=design/10k-websites/10k-websites/SKILL.md lines=10:15
@source bounds title="필수 도구, site 격리, 영상 연동 타이포그래피" path=design/10k-websites/10k-websites/SKILL.md lines=17:23
@source levels title="제작 등급 3종과 모델·크레딧 분리 정책" path=design/10k-websites/10k-websites/SKILL.md lines=25:40
@source auto title="대화 원칙, 승인 지점, 비동기 대기 규칙" path=design/10k-websites/10k-websites/SKILL.md lines=41:50
@source p12 title="Phase 1~2: 연결 점검과 요구사항 수집" path=design/10k-websites/10k-websites/SKILL.md lines=51:56
@source p35 title="Phase 3~5: 리서치, 컨셉, 설계서와 예산 승인" path=design/10k-websites/10k-websites/SKILL.md lines=57:70
@source p6 title="Phase 6: 생성, 시각 검증, 영상 조립" path=design/10k-websites/10k-websites/SKILL.md lines=71:82
@source p78 title="Phase 7~8: 에셋 인코딩, 사이트 구현, 백엔드·브랜드" path=design/10k-websites/10k-websites/SKILL.md lines=83:90
@source p9 title="Phase 9: 자동 점검, 동기화 검사, 미리보기" path=design/10k-websites/10k-websites/SKILL.md lines=91:98
@source p10 title="Phase 10~11: Hostinger 배포, 라이브 검증, 후속 수정" path=design/10k-websites/10k-websites/SKILL.md lines=99:112
@source partner title="OpenArt·Hostinger partner 링크 규칙" path=design/10k-websites/10k-websites/SKILL.md lines=113:131
@source how title="HOW-TO-USE.txt: ChatGPT Codex 설치 및 사용 안내" path=design/10k-websites/10k-websites/HOW-TO-USE.txt lines=1:22
@source prod title="제작 등급별 GPT·미디어·모바일 정책" path=design/10k-websites/10k-websites/references/production.md lines=5:45
@source oa title="OpenArt MCP 연결, 모델 조회, 생성·대기 규칙" path=design/10k-websites/10k-websites/references/openart.md lines=3:44
@source shots title="Wow gate 5항목과 Story gate 3박자" path=design/10k-websites/10k-websites/references/shots.md lines=9:30
@source plaws title="영상 생성 12법칙" path=design/10k-websites/10k-websites/references/prompt-laws.md lines=5:30
@source seam title="질감 불연속(seam) 법칙" path=design/10k-websites/10k-websites/references/prompt-laws.md lines=107:107
@source eng title="엔진 구조, 도구 명령, 자체 점검 6단계" path=design/10k-websites/10k-websites/references/engine.md lines=190:214
@source back title="선택적 PHP 백엔드 안전장치와 검증" path=design/10k-websites/10k-websites/references/backend.md lines=1:68
@source dep title="Hostinger 배포 패키징과 독립 검증" path=design/10k-websites/10k-websites/references/deploy.md lines=28:53
@source launch title="브랜드 키트, 검색 기본, Lighthouse 보고, 클라이언트 키트" path=design/10k-websites/10k-websites/references/launch.md lines=3:39
@source chk1 title="check.mjs: 대비 3.5:1·플릭·모바일·모션 감소 검사" path=design/10k-websites/10k-websites/tools/check.mjs lines=137:238
@source chk2 title="check.mjs: 이미지 중복(dhash) 및 지연 로딩 검사" path=design/10k-websites/10k-websites/tools/check.mjs lines=280:336
@source srv title="server.mjs: 로컬 루프백 전용 보안 static 서버" path=design/10k-websites/10k-websites/tools/server.mjs lines=8:38

## 어떻게 동작하나 {#flow span=12}

그림은 새 빌드와 재개 빌드의 큰 흐름을 세 국면으로 묶어 그렸다. 설치 요청이면 폴더를 개인 스킬로 설치하고 웹사이트 작업을 시작하지 않은 채 멈춘다.[](source:start) Phase 6 내부의 키프레임 검증과 완성 영상 승인(권한 위임 시 자체 처리) 및 배포 뒤 Phase 11 수정 반복은 그림에서 줄여 단계 설명에 남겼다.[](source:auto)[](source:p6)[](source:p10)

@workflow id=flow-diagram title="10k-websites 흐름"
| lane setup | 준비·기획 |
| lane prod | 미디어·구현 |
| lane launch | 검증·출시 |
| entry | 설치·재개 판단 | external | setup | source:start |
| brief | 환경 점검·요구 수집 | backend | setup | source:p12 |
| concept | 리서치·컨셉·설계서 | backend | setup | source:p35 |
| spend | 스토리·예산 승인? | external | setup | source:p35 |
| media | OpenArt 생성·영상 조립 | backend | prod | source:p6 |
| build | 인코딩·추적·사이트 구현 | backend | prod | source:p78 |
| check | 자동 점검·미리보기 | backend | launch | source:p9 |
| pub | 출시 승인됐나? | external | launch | source:p10 |
| deploy | Hostinger 배포·검증 | backend | launch | source:p10 |
| entry > brief | 새·재개 빌드 |
| brief > concept | |
| concept > spend | |
| spend > concept | 아니오, 수정 |
| spend > media | 예 | emphasis |
| media > build | |
| build > check | |
| check > pub | |
| pub > build | 아니오, 보완 |
| pub > deploy | 예 | emphasis |

@steps id=flow-steps
| s-entry | 설치·재개 판단 | **입력** 사용자 요청과 작업 폴더 · **참조** `SKILL.md` · **출력** 설치 완료 또는 `.10k/plan.md` 기반 재개 지점. **처리** 스킬 설치 요청인지, 기존 `.10k/plan.md`를 이어갈지, 새 빌드인지 가른다.[](source:start) **다음** 설치 요청이면 스킬 폴더를 설치해 알리고 그 대화에서 사이트 제작을 시작하지 않는다.[](source:start) | flow-diagram | entry |
| s-brief | 환경 점검·요구 수집 | **입력** 폴더 환경과 사용자 설명 · **참조** `references/openart.md` · `references/production.md` · **실행** `codex mcp add openart --url https://mcp.openart.ai/mcp` · `npm install --ignore-scripts`(내부: `.10k/tools/`로 복사 후 실행, 코드 확인) · **출력** `.10k/plan.md`와 `production_level` 선택. **처리** Node·FFmpeg·Chrome·OpenArt 잔액을 점검하고 누락된 요구사항과 제작 등급을 모은다.[](source:start)[](source:p12) **다음** OpenArt 계정이 없으면 `partner` 링크(제작자 수익 링크)를 안내한다.[](source:partner) | flow-diagram | brief |
| s-concept | 리서치·컨셉·설계서 | **입력** 요구사항과 브랜드 정보 · **참조** `references/design.md` · `shots.md` · `prompt-laws.md` · `design-package.md` · `mobile.md` · **출력** 컨셉 제안, `.10k/design-package.md`, 모델별 견적. **처리** 구매자 근거를 조사해 Wow gate 5항목과 Story gate 3박자를 넘는 컨셉을 고르고 스토리·타이포·견적을 문서화한다.[](source:p35)[](source:shots) | flow-diagram | concept |
| s-spend | 스토리·예산 승인? | **입력** 시각 스토리와 모델별 크레딧 견적 · **출력** 생성 지출 승인 여부. **처리** 구체적인 스토리와 지출 한도를 사용자가 승인했는지 확인한다.[](source:p35)[](source:prod) **다음** 계정 잔액이 있어도 명시적 승인 없이는 유료 생성을 시작하지 않는다.[](source:p35) | flow-diagram | spend |
| s-media | OpenArt 생성·영상 조립 | **입력** 승인된 스토리보드와 프롬프트 · **참조** `references/openart.md` · `visual-validation.md` · `ffmpeg-recipes.md` · **실행** `node .10k/tools/review.mjs review/hero-joined.mp4 --port 8081`(내부: 루프백 영상 뷰어 실행, 코드 확인) · **출력** `review/` 후보 에셋과 결합된 히어로 영상. **처리** REST·OPEN·EVENT 키프레임을 생성·연속성 검증한 뒤 파일럿·영상 클립을 만들고 FFmpeg로 합친다.[](source:p6)[](source:oa) **다음** 완성 영상을 재생해 점검하며, 권한 위임이 없으면 사용자 승인을 받고 다음으로 넘긴다.[](source:auto)[](source:p6) | flow-diagram | media |
| s-build | 인코딩·추적·사이트 구현 | **입력** 승인된 마스터 영상·이미지 · **참조** `references/engine.md` · `effects.md` · `backend.md` · `launch.md` · **실행** `node .10k/tools/encode.mjs review/hero-raw.mp4 site/assets --mobile --focus 0.5` · `node .10k/tools/depth.mjs review/hero-still.png site/assets --mobile --focus 0.5` · `node .10k/tools/track.mjs surface site/assets/hero.mp4 ...` · `node <skill>/tools/backend.mjs site ...` · `node .10k/tools/brand.mjs site ...` (내부: `sharp`·`ffmpeg`·Lucas-Kanade 표면 추적 실행, 코드 확인) · **출력** `site/` 정적 파일과 선택적 `api/`·`admin/`·브랜드 키트. **처리** 영상을 `scrub`(스크롤 위치로 영상 시점을 옮김) 규격으로 인코딩하고 내장 엔진을 무수정 복사해 페이지·영상 연동 타이포그래피·폼·브랜드 에셋을 짠다.[](source:bounds)[](source:p78)[](source:eng) | flow-diagram | build |
| s-check | 자동 점검·미리보기 | **입력** 완성된 `site/` 폴더 · **참조** `references/checklist.md` · `design.md` · `pages.md` · **실행** `node .10k/tools/check.mjs site review` · `node .10k/tools/typesync.mjs site review` · `node .10k/tools/preview.mjs site --port 8080` (내부: Playwright 헤드리스 검증 및 로컬 `server.mjs` 서빙, 코드 확인) · **출력** `review/` 접촉 시트, 8항목 전후 채점표, 미리보기 URL. **처리** 브라우저로 데스크톱·모바일·모션 감소·대비·중복 이미지·프레임 동기화를 검증하고 개선 패스를 마친 뒤 미리보기를 띄운다.[](source:p9)[](source:chk1)[](source:chk2) | flow-diagram | check |
| s-pub | 출시 승인됐나? | **입력** 미리보기와 전후 채점 결과 · **출력** 온라인 배포 승인 여부. **처리** 사용자가 현재 버전을 실제 온라인 주소에 공개할지 결정한다.[](source:p10) **다음** 추가 페이지나 다국어 제안은 미리보기 후 유용할 때만 꺼내며 승인된 출시를 지연시키지 않는다.[](source:p9) | flow-diagram | pub |
| s-deploy | Hostinger 배포·검증 | **입력** 배포 승인된 `site/` · **참조** `references/deploy.md` · `launch.md` · `backend.md` · **실행** `node .10k/tools/report.mjs site review --seo https://address --seo-only` · `node .10k/tools/report.mjs https://their-domain.com review` · `node .10k/tools/kit.mjs .10k/kit.json site client-kit` (내부: Lighthouse·robots·PDF 생성, 코드 확인) · **출력** 라이브 HTTPS 사이트, `launch-report.json`, 선택적 `client-kit/`. **처리** 배포용 파일만 압축해 Hostinger로 올리고 HTTPS·모바일·로봇 차단·실제 메일 도착·클라이언트 인계 문서를 검증한다.[](source:p10)[](source:dep)[](source:launch) | flow-diagram | deploy |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | ChatGPT/Codex에서 `/10k-websites`를 고르거나 모델이 `description`을 보고 자동으로 켠다. 호출 제한 필드는 원문에 명시 없음.[](source:fm)[](source:how) |
| 성격 | OpenArt·Hostinger 커넥터와 내장 스크롤 엔진·도구 스크립트를 11단계로 묶어 진행하는 절차형 스킬이다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| landing-page-design {#rel-r03} | **이 스킬** | 대안 | 추론: 랜딩·웹사이트를 처음부터 구축하는 같은 목적이나 원문에 직접 연결은 없다.[](source:fm) |

@architecture id=relation-map title="10k-websites와 이어지는 스킬"
| lp | landing-page-design | backend |
| self | 10k-websites(이 스킬) | backend |
| lp > self | 대안 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 11단계 워크플로, 제작 등급, 경계, `partner` 링크 규칙 | 스킬이 켜질 때 항상 읽는다 | 설치·재개 판단; 환경 점검·요구 수집; 리서치·컨셉·설계서; 스토리·예산 승인?; OpenArt 생성·영상 조립; 인코딩·추적·사이트 구현; 자동 점검·미리보기; 출시 승인됐나?; Hostinger 배포·검증 |
| `HOW-TO-USE.txt` | Codex 설치 방법과 중단 후 재개 안내 | 사용자가 설치·사용법을 물을 때 | 설치·재개 판단 |
| `references/production.md`, `openart.md` | 제작 등급별 모델·지출 정책과 OpenArt MCP 사용법 | 등급 선택·재개, Phase 1, Phase 6 | 환경 점검·요구 수집; 스토리·예산 승인?; OpenArt 생성·영상 조립 |
| `references/design.md`, `design-package.md`, `shots.md`, `prompt-laws.md`, `visual-validation.md`, `mobile.md` | 아트 디렉션, 설계서 10절, 샷 12종, 프롬프트 12법칙, 연속성·모바일 규칙 | Phase 3~6, Phase 8 디자인·영상 기획 시 | 리서치·컨셉·설계서; OpenArt 생성·영상 조립 |
| `references/ffmpeg-recipes.md`, `engine.md`, `effects.md`, `backend.md`, `pages.md` | FFmpeg 결합, 엔진·표면 추적 규약, 효과 16종, PHP 백엔드, 다중 페이지 | Phase 6~9 미디어·구현 시 | OpenArt 생성·영상 조립; 인코딩·추적·사이트 구현 |
| `references/checklist.md`, `launch.md`, `deploy.md`, `troubleshooting.md` | 8항목 채점표, 브랜드·검색·Lighthouse·클라이언트 키트, Hostinger 배포, 장애 대응 | Phase 8~10 검증·배포 또는 오류 발생 시 | 인코딩·추적·사이트 구현; 자동 점검·미리보기; Hostinger 배포·검증 |
| `engine/scene.js`, `scene.css`, `fx.js`, `fx.css`, `filmtype.js`, `filmtype.css`, `pages.css` | 무수정 복사해 쓰는 스크롤·WebGL 깊이·효과·영상 추적 타이포·페이지 전환 엔진 | Phase 7~8에 `site/`로 복사해 실행 | 인코딩·추적·사이트 구현 |
| `backend/forms.js`, `admin/index.php`, `api/submit.php`, `api/lib.php`, `api/.htaccess`, `data/.htaccess` | 선택적 PHP 폼 저장·스팸 차단·CSV 내보내기·SMTP 메일 알림 백엔드 | Phase 8에서 실제 받은편지함을 선택할 때 `backend.mjs`로 복사 | 인코딩·추적·사이트 구현 |
| `tools/package.json`, `usage.mjs`, `review.mjs`, `encode.mjs`, `depth.mjs`, `track.mjs`, `backend.mjs`, `brand.mjs`, `check.mjs`, `typesync.mjs`, `preview.mjs`, `report.mjs`, `kit.mjs`, `server.mjs` | 사용량 조회, 영상 리뷰·인코딩·깊이·추적, 백엔드·브랜드·점검·보고·PDF 생성 CLI | `.10k/tools/`에 복사(단 `backend.mjs`·`usage.mjs`는 스킬 폴더)해 Phase별 실행 | 환경 점검·요구 수집; OpenArt 생성·영상 조립; 인코딩·추적·사이트 구현; 자동 점검·미리보기; Hostinger 배포·검증 |
| `tools/tests/effects-checks.test.mjs`, `media-tools.test.mjs`, `report.test.mjs`, `server.test.mjs`, `track.test.mjs`, `usage.test.mjs` | 도구와 엔진 동작을 검증하는 Node 테스트 6개 | `npm test`로 도구 자체를 검증할 때 | 쓰지 않음 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 사용자가 다른 생성기·호스팅을 명시하지 않았다 | 강제: 이미지·영상은 OpenArt 커넥터, 웹은 내장 엔진, 배포는 Hostinger 커넥터를 쓴다 | [](source:bounds) |
| `site/` 폴더를 구성한다 | 강제·금지: 순수 HTML/CSS/JS만 두며 프레임워크·npm·빌드 과정을 넣지 않는다. 내장 `engine/` 파일은 수정 금지며 `review/`·`.10k/`·`photos/`는 `site/` 밖에 둔다 | [](source:bounds)[](source:eng) |
| `Full throttle` 등급이 선택됐다 | 강제·금지: 현재 최상위 GPT와 최상위 사진·영상 모델을 쓰며, 요금제·잔액·사용량 임계치·보조 작업 비용 때문에 몰래 `Studio` 등으로 낮추지 않는다 | [](source:levels)[](source:prod) |
| 계정 잔액이 충분해 보인다 | 승인 지점·금지: 잔액만으로 지출이 승인되지 않는다. 구체적 스토리와 견적 승인 전에 생성하지 않으며 에이전트가 크레딧을 대신 결제하지 않는다 | [](source:auto)[](source:p35) |
| 히어로 타이포그래피를 구현한다 | 강제: 실제 선정된 영상 움직임에 맞춘 위치·크기·각도 연동이 필수다. 일반 페이드·등장만으로는 불합격이며 `track.mjs`·`typesync.mjs`와 역방향·임의 탐색을 검증한다 | [](source:bounds)[](source:chk1) |
| 영상을 생성하고 이어 붙인다 | 금지·법칙: 프롬프트에 카메라 장비명(`drone`, `gimbal` 등)과 `zoom` 금지. 질감은 컷을 넘지 못하므로 정지 상태끼리 맞붙이지 않고 움직임·블러 속에 이음매(seam)를 숨긴다 | [](source:plaws)[](source:seam) |
| OpenArt나 Hostinger 계정이 없거나 크레딧·도메인이 부족하다 | 강제·금지: 지정된 4개 시점에만 `partner` 링크를 한 줄 설명(Hostinger는 추가 10% 할인 포함, OpenArt는 할인 주장 금지)과 함께 내고 경쟁 서비스 링크는 금지한다 | [](source:partner) |
| `check.mjs`로 완성 사이트를 점검한다 | 강제: 최악 프레임 기준 자막 대비 3.5:1 이상, 120px/360px 플릭 가독성, 모바일 390/375px 가로 넘침 없음, 모든 섹션 이미지 비중복(dhash 거리 5 초과)을 통과해야 한다 | [](source:chk1)[](source:chk2) |
| 로컬 미리보기(`server.mjs`)를 띄운다 | 강제: `127.0.0.1`·`::1` 루프백만 허용하며 `GET`/`HEAD` 외 요청과 `api`·`admin`·`data`·`.php`·`.env`·`.sqlite` 접근은 403/405로 막는다 | [](source:srv) |
| 실제 폼 백엔드와 라이브 검증을 마친다 | 강제: 소유자 비밀번호는 소유자만 설정 코드(`INBOX_SETUP_CODE`)로 정하며 에이전트가 묻거나 정하지 않는다. 상태 확인과 실제 메일 도착 확인은 분리해 보고한다 | [](source:p10)[](source:back) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 샷 라이브러리 12종과 프롬프트 템플릿 — 개요 항목 "리서치·컨셉·설계서" · `shots.md`의 12가지 히어로 샷(`The Pour`~`The Pick-up`)과 `prompt-laws.md`의 시작/깊이/영상 템플릿은 세부 사례라 뺐다.
- 영상 표면 추적(`track.mjs`)과 효과 16종(`fx.js`) — 개요 항목 "인코딩·추적·사이트 구현" · Lucas-Kanade 5종 모델·창 마스크 규약과 `effects.md`의 효과별 `data-fx-*` 속성은 개요에 넣지 않았다.
- PHP 받은편지함과 Hostinger 배포·트러블슈팅 — 개요 항목 "Hostinger 배포·검증" · `lib.php` SQLite/JSON 이중 저장·스팸 방어·SMTP 암호화, `troubleshooting.md` 증상별 복구표는 세부 구현이라 뺐다.

읽은 원본: 텍스트 파일 52개(`SKILL.md`, `HOW-TO-USE.txt`, `references/` 17개, `engine/` 7개, `backend/` 6개, `tools/` 14개, `tools/tests/` 6개). 제외: `*.ko.md` 18개(번역본).
