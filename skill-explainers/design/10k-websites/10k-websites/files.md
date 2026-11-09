# 10k-websites 읽은 파일 목록

분석 커밋: `4e3fc895a4a5c4dd6c1e09e21a14bb2d1255ba9d`. `git ls-files design/10k-websites/10k-websites` 기준 52개, 합계 497,217B. 모두 텍스트 파일이고 바이너리는 없다. 작업 트리에는 commit되지 않은 번역본(`*.ko.md`)이 있지만 열지 않았고 개수에 넣지 않았다.

읽은 정도는 세 가지로 적는다. **전부**는 처음부터 끝까지 읽었다는 뜻이다. 코드 파일 일부는 머리 주석, 오류·출력 메시지, 판정 줄을 중심으로 읽었다(행에 범위를 적었다). 테스트 6개는 테스트 이름 수준으로만 확인했다. 어떤 코드도 실행하지 않았다.

| 경로 | 바이트 | 역할 | 읽은 정도 |
|---|---:|---|---|
| `design/10k-websites/10k-websites/HOW-TO-USE.txt` | 1,219 | ChatGPT(Codex) 설치·사용 안내 | 전부 |
| `design/10k-websites/10k-websites/SKILL.md` | 21,728 | 지시 본문과 frontmatter | 전부(줄 번호 포함) |
| `design/10k-websites/10k-websites/backend/admin/index.php` | 11,660 | 소유자 전용 받은편지함 화면(PHP) | 보안 관련 줄(CSRF, 잠금, 설정 코드, CSV) 위주로 읽음 |
| `design/10k-websites/10k-websites/backend/api/.htaccess` | 98 | config.php·lib.php 웹 접근 차단 | 전부 |
| `design/10k-websites/10k-websites/backend/api/lib.php` | 10,099 | 저장소·스팸 방지·메일 공용 함수(PHP) | 함수 목록과 저장 위치·스탬프·암호화 줄을 읽음. SMTP 세부는 훑음 |
| `design/10k-websites/10k-websites/backend/api/submit.php` | 3,526 | 폼 접수 엔드포인트(PHP) | 전부 |
| `design/10k-websites/10k-websites/backend/data/.htaccess` | 58 | data/ 웹 접근 차단 | 전부 |
| `design/10k-websites/10k-websites/backend/forms.js` | 2,778 | 폼을 backend로 보내는 브라우저 스크립트 | 앞부분과 동작 흐름 |
| `design/10k-websites/10k-websites/engine/filmtype.css` | 1,166 | 영상 표면 고정 글자 스타일 | 전부 |
| `design/10k-websites/10k-websites/engine/filmtype.js` | 15,294 | 영상 표면에 글자를 고정하는 엔진 | 머리 주석(속성 설명)과 주석 줄 |
| `design/10k-websites/10k-websites/engine/fx.css` | 10,387 | 효과 라이브러리 스타일 | 앞부분 |
| `design/10k-websites/10k-websites/engine/fx.js` | 22,302 | 효과 라이브러리(expand, rail 등 16개) | 머리 주석(효과 목록)과 주석 줄 |
| `design/10k-websites/10k-websites/engine/pages.css` | 1,041 | 여러 페이지 전환(View Transitions) | 전부 |
| `design/10k-websites/10k-websites/engine/scene.css` | 3,584 | 스크롤 엔진 레이아웃 | 앞부분 |
| `design/10k-websites/10k-websites/engine/scene.js` | 15,443 | 스크롤 스크럽 엔진 | 머리 주석(속성 설명), 휴대폰 판정 조건, 주석 줄 |
| `design/10k-websites/10k-websites/references/backend.md` | 7,178 | 실제 문의함 backend 안내 | 전부 |
| `design/10k-websites/10k-websites/references/checklist.md` | 4,708 | 8개 항목 채점표 | 전부 |
| `design/10k-websites/10k-websites/references/deploy.md` | 6,896 | Hostinger 배포와 검증 | 전부 |
| `design/10k-websites/10k-websites/references/design-package.md` | 10,570 | 디자인 패키지 문서 형식 | 전부 |
| `design/10k-websites/10k-websites/references/design.md` | 15,631 | 디자인 기준과 품질 하한 | 전부 |
| `design/10k-websites/10k-websites/references/effects.md` | 6,412 | 효과 고르는 법과 목록 | 전부 |
| `design/10k-websites/10k-websites/references/engine.md` | 21,240 | 엔진 사용법, 자막·글자 동기화, 자체 점검 | 전부 |
| `design/10k-websites/10k-websites/references/ffmpeg-recipes.md` | 7,857 | ffmpeg 처리법 | 전부 |
| `design/10k-websites/10k-websites/references/launch.md` | 4,569 | brand kit, 검색 기본, launch report, client kit | 전부 |
| `design/10k-websites/10k-websites/references/mobile.md` | 5,772 | 휴대폰 경험 | 전부 |
| `design/10k-websites/10k-websites/references/openart.md` | 10,522 | OpenArt 연결·생성·잔액 | 전부 |
| `design/10k-websites/10k-websites/references/pages.md` | 3,334 | 페이지·언어 추가 | 전부 |
| `design/10k-websites/10k-websites/references/production.md` | 7,558 | 제작 등급과 모델·지출 정책 | 전부 |
| `design/10k-websites/10k-websites/references/prompt-laws.md` | 16,349 | hero 영상 법칙 12개와 프롬프트 | 전부 |
| `design/10k-websites/10k-websites/references/shots.md` | 26,546 | hero 샷 12종, wow/story 관문 | 전부 |
| `design/10k-websites/10k-websites/references/troubleshooting.md` | 23,312 | 증상→원인→해결 표 | 전부 |
| `design/10k-websites/10k-websites/references/visual-validation.md` | 6,157 | 생성물 연속성·정체성 검증 | 전부 |
| `design/10k-websites/10k-websites/tools/backend.mjs` | 3,642 | backend 파일 복사와 config.php 작성 | 전부 |
| `design/10k-websites/10k-websites/tools/brand.mjs` | 6,184 | favicon·og.jpg·manifest 생성 | 전부 |
| `design/10k-websites/10k-websites/tools/check.mjs` | 34,928 | 실제 브라우저로 사이트 검사 | 문제 메시지·구간 주석·phone/reduced motion/중복 그림 검사 부분 |
| `design/10k-websites/10k-websites/tools/depth.mjs` | 4,056 | depth map 생성(Depth Anything V2 Small) | 전부 |
| `design/10k-websites/10k-websites/tools/encode.mjs` | 9,979 | 스크럽용 영상 인코딩·포스터 | 전부 |
| `design/10k-websites/10k-websites/tools/kit.mjs` | 7,678 | client kit PDF 생성 | 전부 |
| `design/10k-websites/10k-websites/tools/package.json` | 625 | 도구 의존성(playwright-core, sharp, transformers) | 전부 |
| `design/10k-websites/10k-websites/tools/preview.mjs` | 935 | 로컬 미리보기 서버 실행 | 전부 |
| `design/10k-websites/10k-websites/tools/report.mjs` | 16,577 | Lighthouse·검색 점검·sitemap/robots | 1~160줄과 출력부 |
| `design/10k-websites/10k-websites/tools/review.mjs` | 7,136 | 영상 검토 플레이어 | 전부 |
| `design/10k-websites/10k-websites/tools/server.mjs` | 6,086 | loopback 전용 정적 서버 | 전부 |
| `design/10k-websites/10k-websites/tools/tests/effects-checks.test.mjs` | 13,845 | check.mjs·fx.js 테스트 | 테스트 이름 수준(요약) |
| `design/10k-websites/10k-websites/tools/tests/media-tools.test.mjs` | 6,719 | encode·review 테스트 | 테스트 이름 수준(요약) |
| `design/10k-websites/10k-websites/tools/tests/report.test.mjs` | 5,929 | report.mjs 테스트 | 테스트 이름 수준(요약) |
| `design/10k-websites/10k-websites/tools/tests/server.test.mjs` | 4,834 | server.mjs 테스트 | 테스트 이름 수준(요약) |
| `design/10k-websites/10k-websites/tools/tests/track.test.mjs` | 5,205 | track.mjs 테스트 | 테스트 이름 수준(요약) |
| `design/10k-websites/10k-websites/tools/tests/usage.test.mjs` | 2,653 | usage.mjs 테스트 | 테스트 이름 수준(요약) |
| `design/10k-websites/10k-websites/tools/track.mjs` | 36,315 | 영상 속 표면 움직임 측정 | 머리 주석(명령 설명), 오류·출력 메시지, 구간 주석 |
| `design/10k-websites/10k-websites/tools/typesync.mjs` | 13,372 | 글자와 영상 프레임 일치 검사 | 머리 주석, 문제 판정 줄 |
| `design/10k-websites/10k-websites/tools/usage.mjs` | 5,525 | GPT 사용량 읽기 전용 확인 | 전부 |

## 스킬 폴더 밖에서 확인한 파일

| 경로 | 바이트 | 쓰임 |
|---|---:|---|
| `design/10k-websites/README.md` | 4,544 | 이 저장소 관리자가 쓴 한국어 소개. 스킬 원본이 아니어서 페이지의 근거로 쓰지 않았다 |
| `design/skills-lock.json` | - | `10k-websites` 항목(출처 `meticsmedia/10k-websites`, `skills/10k-websites/SKILL.md`)만 확인 |
| `design/taste/design-taste-frontend/SKILL.md` | - | r44 대조용으로 1~11줄(description)만 읽음 |
