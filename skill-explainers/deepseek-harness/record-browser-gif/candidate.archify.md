# record-browser-gif 스킬은 에이전트를 어떻게 바꾸나 {#record-browser-gif-skill}

`record-browser-gif`가 켜지면 에이전트는 브라우저 조작 데모를 한 번의 격리된 실행에서 녹화해 GIF 하나로 인코딩하고 검증한다. 작업이 PR 첨부까지 포함할 때만 `gh --attach`로 올린다. 제품 사용자에게 보이는 GUI 동작을 바꾸는 PR에는 이 GIF 파일이 필수(MUST)다.[](source:rbg-gui)[](source:rbg-sep)

- 에이전트는 그 PR branch 트리로 띄운 실제 서버, 실제 API 키, 실제 모델 라운드로 녹화한다. 고정 질의, 모의 전송, 합성 이벤트, 테스트 전용 훅은 쓰지 않는다. 사용자가 고정 녹화를 명시적으로 요청한 경우만 예외다.[](source:rbg-gui)
- 녹화와 인코딩은 로컬에서 끝나고 원격 상태를 바꾸지 않는다. 게시는 PR 첨부 작업일 때만 하는 마지막 단계다.[](source:rbg-sep)
- GIF 파일은 어떤 branch에도 commit하지 않는다. 게시는 `gh --attach`(gh v2.99.0 이상)로만 한다.[](source:rbg-publish)
- GIF 파일이 5 MiB 한도를 넘으면, 같은 실행의 연속·비중복 구간으로 나눠 올린다.[](source:rbg-size)

@answer scope="deepseek-harness/record-browser-gif · 원본 텍스트 파일 3개 · 커밋 475505c · 지시상 동작"
@meta locale=ko
@source rbg-fm title="deepseek-harness/record-browser-gif/SKILL.md · 15698B · frontmatter" path=deepseek-harness/record-browser-gif/SKILL.md lines=1:4
@source rbg-intro title="SKILL.md · 목적과 보관 결정 링크" path=deepseek-harness/record-browser-gif/SKILL.md lines=8:10
@source rbg-gui title="SKILL.md · Every GUI pull request includes a GIF" path=deepseek-harness/record-browser-gif/SKILL.md lines=12:16
@source rbg-sep title="SKILL.md · Keep recording separate from publication" path=deepseek-harness/record-browser-gif/SKILL.md lines=18:23
@source rbg-stage title="SKILL.md · Stage the application" path=deepseek-harness/record-browser-gif/SKILL.md lines=25:33
@source rbg-record title="SKILL.md · Record the flow" path=deepseek-harness/record-browser-gif/SKILL.md lines=34:42
@source rbg-video title="SKILL.md · Capture video" path=deepseek-harness/record-browser-gif/SKILL.md lines=44:76
@source rbg-encode title="SKILL.md · Encode the GIF" path=deepseek-harness/record-browser-gif/SKILL.md lines=78:93
@source rbg-shot title="SKILL.md · Screenshot capture" path=deepseek-harness/record-browser-gif/SKILL.md lines=95:105
@source rbg-verify title="SKILL.md · Verify the artifact" path=deepseek-harness/record-browser-gif/SKILL.md lines=107:114
@source rbg-publish title="SKILL.md · Publish the GIF 개요" path=deepseek-harness/record-browser-gif/SKILL.md lines=116:120
@source rbg-gh title="SKILL.md · Attach with gh 요건" path=deepseek-harness/record-browser-gif/SKILL.md lines=124:124
@source rbg-size title="SKILL.md · 5 MiB 한도와 분할" path=deepseek-harness/record-browser-gif/SKILL.md lines=126:126
@source rbg-body title="SKILL.md · 본문 참조와 게시 대상" path=deepseek-harness/record-browser-gif/SKILL.md lines=128:134
@source rbg-head title="SKILL.md · 첨부 전후 head 대조" path=deepseek-harness/record-browser-gif/SKILL.md lines=136:143
@source rbg-assets title="SKILL.md · Existing assets branches" path=deepseek-harness/record-browser-gif/SKILL.md lines=145:147
@source enc-const title="deepseek-harness/record-browser-gif/scripts/encode_gif.py · 12988B · 기본 한도" path=deepseek-harness/record-browser-gif/scripts/encode_gif.py lines=16:16
@source enc-args title="encode_gif.py · 인자 정의" path=deepseek-harness/record-browser-gif/scripts/encode_gif.py lines=156:190
@source enc-checks title="encode_gif.py · 입력 검증" path=deepseek-harness/record-browser-gif/scripts/encode_gif.py lines=199:257
@source enc-filter title="encode_gif.py · ffmpeg 필터 순서" path=deepseek-harness/record-browser-gif/scripts/encode_gif.py lines=259:296
@source enc-verify title="encode_gif.py · 결과 검증" path=deepseek-harness/record-browser-gif/scripts/encode_gif.py lines=298:316
@source tst-trim title="deepseek-harness/record-browser-gif/scripts/test_encode_gif.py · 4726B · 구간·배속·정지" path=deepseek-harness/record-browser-gif/scripts/test_encode_gif.py lines=44:59
@source tst-reject title="test_encode_gif.py · 잘못된 옵션 거부" path=deepseek-harness/record-browser-gif/scripts/test_encode_gif.py lines=61:71
@source tst-shot title="test_encode_gif.py · 스크린숏 입력" path=deepseek-harness/record-browser-gif/scripts/test_encode_gif.py lines=73:90
@source tst-over title="test_encode_gif.py · 덮어쓰기와 크기" path=deepseek-harness/record-browser-gif/scripts/test_encode_gif.py lines=92:99
@source art-gif title="deepseek-harness/dsh-official-plugin-artwork/SKILL.md · 41줄(관계 확인용)" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=41:41
@source perf-gif title="deepseek-harness/dsh-speed-up-perf/SKILL.md · 80줄(관계 확인용)" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=80:80
@source pd-gif title="deepseek-harness/dsh-pr-description/SKILL.md · 63줄(관계 확인용)" path=deepseek-harness/dsh-pr-description/SKILL.md lines=63:63

## 언제 켜지고 GUI PR에서는 무엇이 의무인가 {#trigger}

@code source=rbg-fm language=yaml

`description`은 두 경우를 든다. 브라우저 워크플로를 보여 주는 GIF 파일을 만들거나 녹화해 달라는 요청과, 제품 사용자에게 보이는 GUI 동작을 바꾸는 모든 PR이다.[](source:rbg-fm) 

호출 제한 필드가 없다. 판정: 모델이 `description`을 참고해 스스로 켤 수 있다. `description`은 판단용 설명이지, 특정 단어가 있으면 켜지는 키워드 목록이 아니다.

GUI 동작을 바꾸는 PR에서는 이 스킬로 녹화한 데모 GIF 파일을 PR 본문에 넣어야 한다. 본문에 넣는 방법은 아래 게시 절차다.[](source:rbg-gui) 이 GIF 파일은 녹화 자체가 증거이므로 다음을 GIF 옆에 밝힌다.[](source:rbg-gui)

- 시연한 정확한 commit SHA
- 그 commit을 서빙한 트리와 origin
- 모드 플래그와 브라우저 상태 예외
- 실제 모델 라운드를 돌렸는지 여부

스킬은 사용자에게 질문하거나 승인받는 단계를 따로 두지 않는다. 원문이 사람의 요청이나 조치를 전제하는 곳은 넷이다. PR 첨부를 하라는 작업 요청, 고정 질의 녹화의 명시적 요청, `gh` 버전이 낮을 때 개발자의 업그레이드, 게시가 막혔을 때 개발자에게 하는 보고다.[](source:rbg-gui)[](source:rbg-gh)

## 녹화에서 게시까지 어떤 순서로 하나 {#flow}

@workflow id=rbg-flow title="GIF 파일을 만들고 올리는 순서"
| stage | 앱 띄우기 | backend |
| record | 흐름 녹화 | frontend |
| encode | GIF 인코딩 | backend |
| verify | 산출물 확인 | backend |
| ask | PR에 올리나? | external |
| stop | 경로 보고 후 끝 | external |
| publish | gh로 첨부 | security |
| stage > record | | |
| record > encode | | |
| encode > verify | | |
| verify > ask | | |
| ask > stop | 아니오 | |
| ask > publish | 예 | emphasis |

@steps id=rbg-steps
| stage | 앱 띄우기 | 에이전트는 깨끗한 worktree에서 `git rev-parse HEAD`로 commit을 기록하고, 그 트리를 `pnpm run build && pnpm run build:web`로 빌드한다. 서버는 포트마다 하나씩, 새 `DSH_HOME`, `DSH_AGENTS_HOME`, 워크스페이스, 세션 상태로 띄운다. 브라우저도 새 격리 컨텍스트를 쓴다. 다른 PR로 바꿀 때는 PID나 명령줄이 정확히 일치하는 옛 서버를 끈다.[](source:rbg-stage) | rbg-flow | stage |
| record | 흐름 녹화 | 브라우저 조작 워크플로를 따르고, `recordVideo`가 있으면 같은 컨텍스트에서 켜고 없으면 스크린숏을 쓴다. 브라우저 조작이 아예 안 될 때만 저장소가 선언한 Playwright 라이브러리로 격리된 헤드리스 브라우저를 쓰고 캡처 노트에 밝힌다. 의미 있는 상태 3~6개로 짧은 이야기를 만든다.[](source:rbg-record)[](source:rbg-video) | rbg-flow | record |
| encode | GIF 인코딩 | `python3`, `ffmpeg`, `ffprobe`가 필요하다. 없으면 설치하지 않고 의존성 부족을 보고한다. 번들 인코더가 구간, 배속, 최종 정지, 크기를 처리한다.[](source:rbg-encode) | rbg-flow | encode |
| verify | 산출물 확인 | 인코더의 JSON 요약을 읽는다. 인코딩된 GIF 파일을 직접 눈으로 확인한다. `git status --short`로 산출물이 git이 무시하는 경로에만 있는지 살핀다. 마지막으로 절대 경로와 녹화 방식을 보고한다.[](source:rbg-verify) | rbg-flow | verify |
| ask | PR에 올리나? | 작업이 GIF 파일을 PR에 첨부하는 것까지 포함하지 않으면 확인 단계에서 끝낸다.[](source:rbg-verify)[](source:rbg-sep) | rbg-flow | ask |
| stop | 경로 보고 후 끝 | GIF 파일의 절대 경로를 돌려주고 실제 API인지 고정 질의인지 다른 전송인지 밝힌다.[](source:rbg-verify) | rbg-flow | stop |
| publish | gh로 첨부 | 아래 게시 절차를 따른다.[](source:rbg-publish) | rbg-flow | publish |

## 무엇을 강제하고 무엇을 금지하나 {#rules}

| 규칙 | 강도 |
| --- | --- |
| GUI 동작을 바꾸는 PR에는 이 스킬로 녹화한 GIF 파일을 본문에 넣는다[](source:rbg-gui) | 의무(MUST) |
| 실제 서버, 실제 API 키, 실제 모델 라운드로 녹화한다. 고정 질의, 모의 전송, 합성 이벤트, 테스트 전용 훅을 쓰지 않는다[](source:rbg-gui) | 금지. 사용자가 고정 녹화를 명시적으로 요청하면 예외 |
| 자격 증명이나 서버를 쓸 수 없으면 고정 질의로 대체하지 않고 한계를 보고한다[](source:rbg-sep) | 의무 |
| 자격 증명 값을 읽거나 드러내지 않는다. 앱의 정상 설정 경로와 무해한 데모 프롬프트를 쓴다[](source:rbg-sep) | 금지 |
| 녹화 전에 worktree가 깨끗해야 하고, 그 정확한 commit을 기록한다. 다른 commit의 빌드로 녹화하면 증거가 잘못 귀속된다[](source:rbg-stage) | 의무 |
| 스토리보드 하나는 증거 실행 하나다. 캡처가 실패하면 프레임을 버리고 새 루트에서 다시 돌린다. 서로 다른 실행의 프레임을 이어 붙이거나 빠진 상태를 합성하지 않는다[](source:rbg-stage)[](source:rbg-encode) | 금지 |
| `viewport`와 `recordVideo.size`를 같게 지정한다. 같게 지정하지 않으면 Playwright 라이브러리가 영상을 800×800에 맞춰 줄여 글자가 안 읽힌다[](source:rbg-video) | 의무 |
| `context.close()`를 기다린 뒤에 `video.saveAs()`나 인코딩을 한다. 브라우저만 닫으면 영상이 다 기록된다는 보장이 없다[](source:rbg-video) | 의무 |
| 비밀, 개인 정보, 무관한 탭, 알림을 캡처하지 않는다. 선택한 구간 전체를 확인한다[](source:rbg-video) | 금지 |
| 대기는 고유한 시맨틱 로케이터로 한다. 고정 대기는 상태를 확인한 뒤 읽을 시간을 주는 용도일 뿐 준비 상태를 정하지 못한다[](source:rbg-video) | 의무 |
| 다른 드라이버를 설치하거나 사용자의 브라우저를 열지 않는다[](source:rbg-record) | 금지 |
| `--speed`와 선택 구간을 GIF 옆에 밝혀서 응답 지연을 측정한 것처럼 보이지 않게 한다[](source:rbg-encode) | 의무 |
| 인코딩된 GIF 자체를 눈으로 확인한다. 인코딩 전 프레임은 순서, 팔레트, 최종 정지를 증명하지 못한다[](source:rbg-verify) | 의무 |
| 산출물은 무시되는 `.playwright-mcp/` 아래에 둔다[](source:rbg-record) | 의무 |
| 서버를 끌 때 넓은 `pkill -f` 패턴을 쓰지 않는다. 그 패턴이 자기 자신의 셸을 죽일 수 있다[](source:rbg-stage) | 금지 |

@callout level=warning title="GIF 파일을 어떤 브랜치에도 커밋하지 않는다"
기본 clone과 전체 이력 fetch는 어느 branch에든 commit된 미디어를 내려받는다. 그래서 `gh --attach`로만 올린다. 이 명령은 GitHub 서버에 올리고 본문 참조를 한 번에 고쳐 쓰므로 branch에 미디어가 남지 않는다.[](source:rbg-publish) 예전 PR 본문이 쓰는 `*-assets` 고아 branch는 추가, 삭제, 재작성, 강제 push를 하지 않는다. 병합된 PR 본문이 그 주소를 참조한다.[](source:rbg-assets)

## 인코더는 무엇을 확인하고 수치는 얼마인가 {#encoder}

`scripts/encode_gif.py`는 `ffmpeg`와 `ffprobe`를 불러 GIF 파일을 만들고 JSON 요약을 출력한다. 아래 표는 문서의 설명을 스크립트와 줄 단위로 대조한 결과다.

| 항목 | 값과 조건 |
| --- | --- |
| 크기 한도(`--max-bytes`) | 기본 5 MiB. 5 × 1024 × 1024 = 5,242,880바이트[](source:enc-const) |
| 프레임 속도(`--fps`) | 기본 10. 30을 넘으면 거절. 이 상한은 스킬 문서에 명시 없음[](source:enc-args)[](source:enc-checks) |
| 최대 너비(`--max-width`) | 기본 1200. 인코딩된 너비가 넘으면 거절[](source:enc-args)[](source:enc-verify) |
| 색 수(`--colors`) | 기본 128, 4~256 밖이면 거절[](source:enc-args)[](source:enc-checks) |
| 최종 정지(`--final-hold`) | 영상 입력의 기본 2초. 마지막 선택 프레임을 반복한다[](source:rbg-encode)[](source:enc-checks) |
| 배속, 구간 | 기본 1배속, 전체 영상. `--start` < `--end` ≤ 원본 길이를 지켜야 한다[](source:enc-checks) |
| 최소 선택 길이 | (끝 − 시작) ÷ 배속 ≥ 2 ÷ fps. 출력 프레임 두 개 미만이면 거절[](source:enc-checks) |
| 길이 허용 오차 | 기대 길이와 실제 길이 차가 max(0.2초, 2 ÷ fps)를 넘으면 거절[](source:enc-verify) |
| 애니메이션 | 인코딩 프레임이 2개 미만이면 거절[](source:enc-verify) |
| 덮어쓰기 | 출력이 이미 있으면 `--force` 없이는 거절. 출력은 `.gif`여야 한다[](source:enc-checks) |

문서의 예시 옵션 `--start 2 --end 32 --speed 2 --final-hold 3 --fps 10`으로 계산하면 선택 구간 30초 ÷ 2배속 = 15초에 정지 3초를 더해 기대 길이는 18초다. 최소 선택 길이는 2 ÷ 10 = 0.2초이므로 통과한다. 설명용 계산이며 실제로 돌려 보지 않았다.[](source:rbg-encode)[](source:enc-checks)

스크린숏 디렉터리를 입력으로 주면 영상용 시간 옵션을 쓸 수 없다.

- `--start`, `--end`, `--speed`, `--final-hold`는 영상 전용이다.[](source:rbg-shot)
- `--durations`, `--pattern`은 디렉터리 전용이다.[](source:rbg-shot)
- 디렉터리에는 프레임이 두 장 이상 있어야 하고 크기가 모두 같아야 한다.[](source:enc-checks)
- 길이를 하나만 주면 모든 프레임에 적용하고, 아니면 프레임마다 양수 하나씩 줘야 한다.[](source:rbg-shot)[](source:enc-checks)
- 스크립트의 기본 길이는 프레임당 2초이며 문서에는 없다.[](source:enc-checks)

필터 순서는 자르기와 배속을 먼저 적용하고, 그다음 프레임 속도, 크기 조정, 최종 정지, 팔레트 생성 순이다. 문서의 "팔레트 변환 전에 자르기와 배속을 적용한다"와 같다.[](source:rbg-encode)[](source:enc-filter)

테스트(`test_encode_gif.py`)는 진짜 `ffmpeg`로 6초짜리 영상을 만들어 확인한다. 스킬 문서는 이 로컬 미디어 테스트가 저장소 CI에서 돌지 않는다고 적는다.[](source:rbg-verify)

| 테스트 | 덮는 것 |
| --- | --- |
| 구간·배속·최종 정지 | 1~5초 구간, 2배속, 정지 1초이면 길이 3초, 너비 32×24, 색 순서가 빨강→초록→파랑[](source:tst-trim) |
| 기본값 | 옵션 없이 6초 영상이 6 + 2 = 8초 GIF 파일이 된다[](source:tst-trim) |
| 잘못된 영상 옵션 | 음수 시작, `nan`, `inf`, 빈 구간, 원본보다 긴 끝, 배속 1000, 영상에 `--durations`·`--pattern`. 모두 거절하고 출력 파일을 만들지 않는다[](source:tst-reject) |
| 스크린숏 | 영상 플래그를 거절하고, 빈 `--pattern`·`--durations`와 개수 불일치를 거절하며, 길이 0.5초와 1.5초로 정상 인코딩한다[](source:tst-shot) |
| 덮어쓰기와 크기 | 기존 파일을 지키고, `--max-bytes 1`이면 크기 초과로 거절한다[](source:tst-over) |

## 게시는 어떻게 하고 언제 멈추나 {#attach-flow}

게시는 작업이 GIF 파일을 PR에 붙이는 것까지 포함할 때만 하는 별도 마지막 단계다.[](source:rbg-publish)

@steps id=publish-steps
| ver | gh 요건 확인 | `gh --version`으로 v2.99.0 이상인지, 저장소가 `github.com`에 있는지(GitHub Enterprise Server 불가), 쓰기 권한이 있는지 본다. gh가 더 낮으면 중단하고 개발자에게 업그레이드를 요청하며, 검증한 GIF 파일은 재시도용으로 둔다. 승인 없이 gh를 설치하거나 업그레이드하지 않는다. 인증, 쓰기 권한, `github.com` 밖 저장소, 업로드 오류도 중단하고 보고한다. 다른 방법으로 게시하지 않는다.[](source:rbg-gh) |
| size | 크기 확인 | GIF 파일은 5 MiB 이하만 올린다. 넘으면 `--max-width`, 그다음 `--colors`나 `--fps` 순서로 값을 줄인다. 글자가 읽히는 품질에서도 넘으면 같은 실행의 연속·비중복 구간으로 나눠 번호 붙은 파트를 만든다. 파트마다 인코더 검사를 통과시키고 각 파트 옆에 `2/3` 같은 위치와 원본 구간·프레임을 적는다.[](source:rbg-size) |
| ref | 본문 참조 쓰기 | 본문 파일에 `![<alt>](<GIF 경로>)`를 `--attach`에 줄 경로와 같게 쓴다. `gh`가 그 참조를 업로드 주소로 고쳐 쓰고 위치와 대체 텍스트를 유지한다. 분할 파트의 표시 순서는 본문의 참조 순서다.[](source:rbg-body) |
| head | head 대조 | 시연한 PR의 실시간 head commit을 읽는다. 새 PR이면 push한 branch 끝이 head commit이다. 이 commit을 GIF 옆에 적은 commit과 비교해서, head가 움직였으면 중단하고 다시 녹화한다.[](source:rbg-head) |
| attach | 첨부 | 새 PR은 `gh pr create`, 기존 PR은 `gh pr edit`에 `--body-file`과 `--attach`를 준다. 같은 파일을 두 번 주면 명령이 거부된다. 분할 파트는 파트마다 `--attach`를 하나씩 한 명령에 넣어 head 대조를 한 쌍으로 끝낸다.[](source:rbg-head) |
| post | 사후 확인 | 첨부한 뒤 실시간 head commit이 기록한 commit 그대로인지 다시 읽는다. 이어서 본문 참조가 업로드 주소로 바뀌었는지 읽는다. GitHub Markdown API 호출로 본문을 렌더해 기대한 `<img>`를 확인한다. 업로드 주소를 한 번 받아 `200`과 `image/gif`를 확인한다.[](source:rbg-head) |

```bash title="첨부 명령(원문 예시)"
gh pr create --body-file <body.md> --attach <path/to/demo.gif>     # 새 PR
gh pr edit <pr> --body-file <body.md> --attach <path/to/demo.gif>  # 기존 PR
```

게시 대상은 보통 시연한 PR이다. 도구 PR은 다른 PR의 GIF 파일을 라벨을 분명히 붙여 예시로 넣을 수 있다. 이때는 원본 PR을 이름으로 밝히고, 모든 확인에서 그 원본 PR의 실시간 head commit을 비교한다. 예시를 도구 branch의 것으로 표시하지 않는다.[](source:rbg-body)

본문이 참조하지 않는 GIF 파일은 본문 끝에 덧붙여지고, 이때는 `--attach '<경로>#<alt>'`의 대체 텍스트가 적용된다. gh가 고쳐 쓴 참조는 본문의 대체 텍스트를 유지한다.[](source:rbg-head)

## 이 스킬은 흐름의 어디에 있나 {#position}

묶음은 `ship`과 `client-ui` 두 곳이다. 전체 흐름은 `deepseek-harness/_group-ship/ship.html`과 `deepseek-harness/_group-client-ui/client-ui.html`에 있다. 관계 근거는 `deepseek-harness/relations.md`의 `rel-id`로 확인한다.

@workflow id=rbg-position title="GIF 녹화를 부르는 스킬"
| pd | dsh-pr-description | backend |
| art | dsh-official-plugin-artwork | backend |
| perf | dsh-speed-up-perf | backend |
| rbg | record-browser-gif | backend |
| pd > rbg | GUI 변경 | emphasis |
| art > rbg | GUI PR | |
| perf > rbg | 안내 | dashed |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `dsh-pr-description` | - | GIF 첨부 | 제품 사용자에게 보이는 GUI 동작을 바꾸면 본문에 데모 GIF 파일과 고지를 넣고, GIF 파일이 없으면 없는 이유를 쓴다. GIF 파일을 넣을 때는 `--attach`를 쓴다[](source:pd-gif)[](source:rbg-gui) | r23 |
| `dsh-official-plugin-artwork` | - | GIF | GUI PR이면 저장소 UI 테스트 정책과 이 스킬을 따른다. 새 그림은 병합 전에 디자이너 승인을 받는다(이 승인은 `artwork` 쪽 규칙이다)[](source:art-gif) | r34 |
| `dsh-speed-up-perf` | - | GIF | 제품에 보이는 GUI 변경이면 필요한 브라우저 증거나 GIF 파일을 넣는다. 이 스킬의 이름은 부르지 않고 역할로만 가리킨다. 종류는 참고다[](source:perf-gif) | r35 |

`record-browser-gif` 원문은 위 세 스킬을 이름으로 부르지 않는다. 연결은 모두 상대 쪽 원문에서 온다. 판정: 이 스킬은 호출되는 쪽이라서 "뒤" 스킬이 없고, 산출물인 GIF 파일이 PR 본문으로 돌아간다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `scripts/encode_gif.py`, `scripts/test_encode_gif.py`. 모두 원본이다.
- 범위 밖: `SKILL.md`가 가리키는 `../../notes/archived/process/2026-08-08-browser-gif-evidence-chain.md`(왜 한 스토리보드를 한 격리 실행에서 얻고 게시 때 다시 검증하는지 적은 결정 기록)는 원래 저장소의 파일이라 이 저장소에 없다. `apps/web/package.json`, `~/.dsh/.credentials.yaml`, `dsh-credentials-local` 제공자 설정도 확인하지 않았다. Playwright Videos 문서는 읽지 않았다.
- 관계 확인을 위해 `dsh-pr-description` 63줄, `dsh-official-plugin-artwork` 41줄, `dsh-speed-up-perf` 80줄만 읽었다. 원장 r23, r34, r35의 출처 줄과 같다.
- 원문 비교: 다른 컬렉션에 같은 이름의 스킬이 없다(원장 기준).
- 실행하지 않았다. 스크립트, `gh`, `ffmpeg`, 테스트 모두 지시상 동작만 분석했다. 테스트 결과는 직접 돌려 본 것이 아니라 코드를 읽고 정리한 기대 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
`gh --attach`가 v2.99.0에서 실제로 이 동작을 하는지는 원문에 근거가 없고 확인하지 못했다. "브라우저 조작 워크플로"가 가리키는 구체적인 도구는 원문에 명시 없음. 사람이 GIF 파일의 "시연한 내용이 PR을 실제로 증명하는지" 판단하는 단계도 원문에 명시 없음.
