# hyperframes-cli는 에이전트에게 CLI를 어떤 순서로 쓰게 하나? {#hyperframes-cli-page}

`hyperframes-cli`는 HyperFrames(HTML을 영상으로 렌더하는 도구)의 `npx hyperframes` 명령을 에이전트가 작업별로 고르고, 확인을 마치고 사용자가 승인한 뒤에 렌더하도록 정해 둔 CLI 사용 규칙 스킬이다.[](source:s-front)[](source:s-run) **부분 분석**이다. 폴더 안 원본 텍스트 13개는 모두 읽었지만 스킬 밖 reference 5개는 읽지 않았다.[](source:s-plugin)[](source:s-refs)

- 에이전트가 영상 프로젝트에서 scaffold, 확인, 타임라인 편집, preview, render, share, 프로젝트 history를 CLI로 다룰 때 쓴다. description이 이 범위를 말한다.[](source:s-front)
- 에이전트는 `lint`와 `check --json` 결과, `snapshot` PNG를 읽은 판단, preview URL, 승인 뒤 렌더한 파일과 그 확인 결과를 내놓는다.[](source:s-loop1)[](source:s-loop2)[](source:s-loop3)[](source:s-loop4)[](source:s-loop5)
- check가 통과했다는 이유만으로는 render하지 않고, `.hyperframes` 폴더를 지우지 않으며, 폐기된 alias와 `skills update`를 직접 돌리지 않는다.[](source:s-loop4)[](source:s-clean)[](source:s-deprec)[](source:i-skills)
- 영상 내용과 연출은 정하지 않는다. 자막 규칙은 `hyperframes`의 reference로, media 선택은 `media-use`로 보내고, 이 스킬은 개발 루프(명령, 확인 순서, 렌더 위치, 실패 복구)에 머문다.[](source:s-captions)[](source:u-asset)

@answer scope="원본 텍스트 13개 전부 · 스킬 밖 5개 미확인 · 명령 미실행"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=243a9028dc78fe13c6f64b1a5c199bc9939ccc06
@source s-front title="frontmatter" path=hyperframes/hyperframes-cli/SKILL.md lines=1:4
@source s-plugin title="plugin 설치 안내" path=hyperframes/hyperframes-cli/SKILL.md lines=6:6
@source s-beacon title="사용 beacon" path=hyperframes/hyperframes-cli/SKILL.md lines=8:8
@source s-run title="실행 방식과 요구 사항" path=hyperframes/hyperframes-cli/SKILL.md lines=12:12
@source s-notice title="업데이트 알림" path=hyperframes/hyperframes-cli/SKILL.md lines=14:14
@source s-table title="작업별 명령표" path=hyperframes/hyperframes-cli/SKILL.md lines=18:29
@source s-captions title="captions 안내" path=hyperframes/hyperframes-cli/SKILL.md lines=31:31
@source s-deprec title="폐기 alias와 events" path=hyperframes/hyperframes-cli/SKILL.md lines=33:33
@source s-loop1 title="루프 1" path=hyperframes/hyperframes-cli/SKILL.md lines=37:37
@source s-loop2 title="루프 2" path=hyperframes/hyperframes-cli/SKILL.md lines=38:38
@source s-loop3 title="루프 3" path=hyperframes/hyperframes-cli/SKILL.md lines=39:39
@source s-loop4 title="루프 4" path=hyperframes/hyperframes-cli/SKILL.md lines=40:40
@source s-loop5 title="루프 5" path=hyperframes/hyperframes-cli/SKILL.md lines=41:41
@source s-ctx title="현재 선택 요청" path=hyperframes/hyperframes-cli/SKILL.md lines=43:43
@source s-tl-intro title="타임라인 편집 머리말" path=hyperframes/hyperframes-cli/SKILL.md lines=47:47
@source s-tl-list title="timeline --json" path=hyperframes/hyperframes-cli/SKILL.md lines=49:49
@source s-tl-plan title="timeline --plan" path=hyperframes/hyperframes-cli/SKILL.md lines=50:50
@source s-tl-refuse title="편집 거절 조건" path=hyperframes/hyperframes-cli/SKILL.md lines=51:51
@source s-tl-apply title="timeline apply와 undo" path=hyperframes/hyperframes-cli/SKILL.md lines=52:52
@source s-histtrial title="history 시험 표시" path=hyperframes/hyperframes-cli/SKILL.md lines=54:54
@source s-hist title="프로젝트 history" path=hyperframes/hyperframes-cli/SKILL.md lines=56:58
@source s-where title="렌더 위치 표" path=hyperframes/hyperframes-cli/SKILL.md lines=64:70
@source s-detach title="긴 렌더 대기" path=hyperframes/hyperframes-cli/SKILL.md lines=72:72
@source s-fbline title="렌더 뒤 feedback" path=hyperframes/hyperframes-cli/SKILL.md lines=74:74
@source s-fail title="실패 복구 표" path=hyperframes/hyperframes-cli/SKILL.md lines=78:85
@source s-clean title="clean 규칙" path=hyperframes/hyperframes-cli/SKILL.md lines=85:85
@source s-refs title="reference 안내표" path=hyperframes/hyperframes-cli/SKILL.md lines=89:103
@source i-intro title="scaffold 명령 머리말" path=hyperframes/hyperframes-cli/references/init-and-scaffold.md lines=5:5
@source i-init title="init 명령과 템플릿" path=hyperframes/hyperframes-cli/references/init-and-scaffold.md lines=7:21
@source i-flags title="init 플래그" path=hyperframes/hyperframes-cli/references/init-and-scaffold.md lines=23:29
@source i-tw title="Tailwind 규칙" path=hyperframes/hyperframes-cli/references/init-and-scaffold.md lines=31:38
@source i-capture title="capture 명령" path=hyperframes/hyperframes-cli/references/init-and-scaffold.md lines=40:71
@source i-skills title="skills 명령" path=hyperframes/hyperframes-cli/references/init-and-scaffold.md lines=73:75
@source l-intro title="lint와 check 역할" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=3:3
@source l-disc title="모션 작업 규율" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=5:13
@source l-lint title="lint 동작" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=15:26
@source l-check title="check 명령과 옵션" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=28:44
@source l-runtime title="check 감사 항목" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=46:49
@source l-craft title="craft 감사" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=50:55
@source l-audio title="audio 감사" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=56:64
@source l-sev title="심각도 규칙" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=66:68
@source l-escape title="layout 예외 속성" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=70:77
@source l-gates title="선택 검사 플래그" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=79:88
@source l-motion title="motion sidecar" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=90:115
@source l-snap title="snapshot 명령" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=117:133
@source l-clean title="snapshot 저장소와 확인 방법" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=135:141
@source l-zoom title="snapshot zoom" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=143:155
@source l-dep title="폐기 명령 이전" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=157:164
@source c-intro title="compare 계열 머리말" path=hyperframes/hyperframes-cli/references/compare-and-batch.md lines=3:3
@source c-cmp title="compare 명령" path=hyperframes/hyperframes-cli/references/compare-and-batch.md lines=11:34
@source c-grade title="grade-compare 명령" path=hyperframes/hyperframes-cli/references/compare-and-batch.md lines=36:70
@source c-batch title="render --batch" path=hyperframes/hyperframes-cli/references/compare-and-batch.md lines=72:105
@source b-use title="beats 명령" path=hyperframes/hyperframes-cli/references/beats.md
@source p-preview title="preview 명령" path=hyperframes/hyperframes-cli/references/preview-render.md lines=5:16
@source p-url title="preview URL 규칙" path=hyperframes/hyperframes-cli/references/preview-render.md lines=18:26
@source p-ctx title="Studio 선택 context" path=hyperframes/hyperframes-cli/references/preview-render.md lines=28:54
@source p-ctxfail title="context 실패 코드" path=hyperframes/hyperframes-cli/references/preview-render.md lines=56:66
@source p-play title="play 명령" path=hyperframes/hyperframes-cli/references/preview-render.md lines=68:78
@source p-browser title="외부 browser 옵션" path=hyperframes/hyperframes-cli/references/preview-render.md lines=80:98
@source p-render-note title="렌더 시점 규칙" path=hyperframes/hyperframes-cli/references/preview-render.md lines=100:102
@source p-render-cmds title="render 예시와 기본 출력" path=hyperframes/hyperframes-cli/references/preview-render.md lines=104:116
@source p-flags title="render 플래그 표" path=hyperframes/hyperframes-cli/references/preview-render.md lines=118:147
@source p-quality title="품질과 1440p" path=hyperframes/hyperframes-cli/references/preview-render.md lines=149:151
@source p-summary title="render 요약 둘째 줄" path=hyperframes/hyperframes-cli/references/preview-render.md lines=153:153
@source p-vars title="변수 렌더" path=hyperframes/hyperframes-cli/references/preview-render.md lines=155:155
@source p-fb title="feedback 명령" path=hyperframes/hyperframes-cli/references/preview-render.md lines=157:166
@source p-fbpacket title="재현 packet" path=hyperframes/hyperframes-cli/references/preview-render.md lines=167:182
@source p-fbprivacy title="feedback 익명화" path=hyperframes/hyperframes-cli/references/preview-render.md lines=184:188
@source p-publish title="publish 명령" path=hyperframes/hyperframes-cli/references/preview-render.md lines=190:199
@source p-where title="렌더 위치와 attribution" path=hyperframes/hyperframes-cli/references/preview-render.md lines=201:205
@source p-share title="share 규칙" path=hyperframes/hyperframes-cli/references/preview-render.md lines=207:224
@source d-doctor title="doctor 점검" path=hyperframes/hyperframes-cli/references/doctor-browser.md lines=5:32
@source d-sandbox title="macOS sandbox 차단" path=hyperframes/hyperframes-cli/references/doctor-browser.md lines=34:45
@source d-ffmpeg title="FFmpeg 경로 설정" path=hyperframes/hyperframes-cli/references/doctor-browser.md lines=47:68
@source d-browser title="browser 명령" path=hyperframes/hyperframes-cli/references/doctor-browser.md lines=70:80
@source k-intro title="cloud 머리말" path=hyperframes/hyperframes-cli/references/cloud.md lines=3:8
@source k-when title="렌더 위치 선택" path=hyperframes/hyperframes-cli/references/cloud.md lines=10:17
@source k-auth title="cloud 인증" path=hyperframes/hyperframes-cli/references/cloud.md lines=19:35
@source k-pipe title="cloud 렌더 파이프라인" path=hyperframes/hyperframes-cli/references/cloud.md lines=37:47
@source k-limit title="업로드 크기 절차" path=hyperframes/hyperframes-cli/references/cloud.md lines=49:81
@source k-opts title="cloud 렌더 옵션" path=hyperframes/hyperframes-cli/references/cloud.md lines=83:104
@source k-vars title="cloud 변수 렌더" path=hyperframes/hyperframes-cli/references/cloud.md lines=106:126
@source k-nowait title="no-wait와 webhook" path=hyperframes/hyperframes-cli/references/cloud.md lines=128:143
@source k-manage title="cloud 렌더 관리" path=hyperframes/hyperframes-cli/references/cloud.md lines=145:153
@source k-retry title="안전한 재시도" path=hyperframes/hyperframes-cli/references/cloud.md lines=155:165
@source m-intro title="lambda 머리말" path=hyperframes/hyperframes-cli/references/lambda.md lines=3:3
@source m-when title="lambda 선택 기준" path=hyperframes/hyperframes-cli/references/lambda.md lines=26:31
@source m-pre title="lambda 전제 조건" path=hyperframes/hyperframes-cli/references/lambda.md lines=33:37
@source m-deploy title="lambda deploy" path=hyperframes/hyperframes-cli/references/lambda.md lines=39:60
@source m-sites title="lambda sites" path=hyperframes/hyperframes-cli/references/lambda.md lines=62:71
@source m-render title="lambda render" path=hyperframes/hyperframes-cli/references/lambda.md lines=73:110
@source m-batch title="lambda render-batch" path=hyperframes/hyperframes-cli/references/lambda.md lines=112:142
@source m-progress title="lambda progress" path=hyperframes/hyperframes-cli/references/lambda.md lines=144:151
@source m-destroy title="lambda destroy" path=hyperframes/hyperframes-cli/references/lambda.md lines=153:159
@source m-errors title="lambda 재시도 불가 오류" path=hyperframes/hyperframes-cli/references/lambda.md lines=161:166
@source m-iam title="lambda IAM" path=hyperframes/hyperframes-cli/references/lambda.md lines=168:180
@source m-state title="lambda 상태와 비용" path=hyperframes/hyperframes-cli/references/lambda.md lines=182:189
@source n-intro title="cloudrun 사용 조건" path=hyperframes/hyperframes-cli/references/cloudrun.md lines=3:9
@source n-life title="cloudrun 수명주기" path=hyperframes/hyperframes-cli/references/cloudrun.md lines=11:37
@source n-batch title="cloudrun render-batch" path=hyperframes/hyperframes-cli/references/cloudrun.md lines=39:60
@source n-progress title="cloudrun progress와 destroy" path=hyperframes/hyperframes-cli/references/cloudrun.md lines=62:62
@source u-info title="info 명령" path=hyperframes/hyperframes-cli/references/upgrade-info-misc.md lines=5:13
@source u-upgrade title="upgrade 명령" path=hyperframes/hyperframes-cli/references/upgrade-info-misc.md lines=15:26
@source u-tl title="timeline 출력" path=hyperframes/hyperframes-cli/references/upgrade-info-misc.md lines=28:53
@source u-tlq title="timeline jq 질의" path=hyperframes/hyperframes-cli/references/upgrade-info-misc.md lines=55:74
@source u-comp title="compositions와 docs" path=hyperframes/hyperframes-cli/references/upgrade-info-misc.md lines=76:87
@source u-bench title="benchmark 명령" path=hyperframes/hyperframes-cli/references/upgrade-info-misc.md lines=89:98
@source u-tele title="telemetry 명령" path=hyperframes/hyperframes-cli/references/upgrade-info-misc.md lines=100:114
@source u-asset title="asset 전처리 명령" path=hyperframes/hyperframes-cli/references/upgrade-info-misc.md lines=116:126
@source u-usage title="usage 명령" path=hyperframes/hyperframes-cli/references/upgrade-info-misc.md lines=128:134
@source v-json title="JSON과 doctor 관례" path=hyperframes/hyperframes-cli/references/conventions.md lines=3:9
@source v-misc title="비대화형과 run id" path=hyperframes/hyperframes-cli/references/conventions.md lines=10:11
@source v-clean title="디스크 정리 관례" path=hyperframes/hyperframes-cli/references/conventions.md lines=12:12
@source v-strict title="strict 플래그 관례" path=hyperframes/hyperframes-cli/references/conventions.md lines=13:13
@source v-shader title="shader lint 대응" path=hyperframes/hyperframes-cli/references/conventions.md lines=14:14
@source v-path title="경로 redaction과 cloud 한도" path=hyperframes/hyperframes-cli/references/conventions.md lines=15:16
@source v-render title="렌더 시점 관례" path=hyperframes/hyperframes-cli/references/conventions.md lines=17:17
@source f-main title="feedback 보고 규칙" path=hyperframes/hyperframes-cli/references/feedback.md lines=3:9
@source f-extra title="두 가지 추가 보고" path=hyperframes/hyperframes-cli/references/feedback.md lines=11:14
@source ko-skill title="한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/SKILL.KO.md
@source ko-init title="한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/init-and-scaffold.KO.md
@source ko-lint title="한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.KO.md
@source ko-compare title="한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/compare-and-batch.KO.md
@source ko-beats title="한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/beats.KO.md
@source ko-preview title="한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/preview-render.KO.md
@source ko-doctor title="한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/doctor-browser.KO.md
@source ko-cloud title="한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/cloud.KO.md
@source ko-lambda title="한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/lambda.KO.md
@source ko-cloudrun title="한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/cloudrun.KO.md
@source ko-misc title="한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/upgrade-info-misc.KO.md
@source ko-conv title="한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/conventions.KO.md
@source ko-feedback title="한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/feedback.KO.md

## 에이전트는 어떤 순서로 쓰고, 확인하고, 렌더하나? {#behavior span=12}

동작은 그림 세 장으로 나눈다. 그림 1은 쓰고 확인해서 preview에서 멈추는 루프, 그림 2는 렌더 위치를 고르고 마무리하는 경로, 그림 3은 타임라인 편집이다. 세 그림 모두 원문에 적힌 순서만 따른다.

@workflow id=check-loop title="그림 1: 작성에서 preview까지"
| beacon | 시작 beacon | external | source:s-beacon |
| begin | history begin | backend | source:s-hist |
| write | 작성과 lint | backend | source:s-loop1 |
| check | check 통과? | backend | source:s-loop2 |
| snap | snapshot 읽기 | backend | source:s-loop3 |
| prev | preview 전달 | backend | source:s-loop4 |
| wait | 사용자 응답 대기 | external | source:s-loop4 |
| go | 렌더로 이동 | external | source:s-loop5 |
| beacon > begin | |
| begin > write | |
| write > check | |
| check > write | error |
| check > snap | 통과 | emphasis |
| snap > prev | |
| prev > wait | |
| wait > go | 승인·요청 | emphasis |

그림 1은 핵심 경로만 그린다. `init`과 `capture`로 프로젝트를 시작하는 단계, 사용자가 "이 요소"를 가리킬 때의 `preview --context` 분기, 승인 뒤에 사용자가 다시 수정을 요청하는 경우는 노드로 그리지 않았다. 앞의 둘은 `작성과 lint`와 `사용자 응답 대기` 설명에 풀어 썼고, 마지막은 원문에 명시 없음이다.

@steps id=check-loop-steps
| st-beacon | 시작 beacon | 에이전트는 스킬이 시작될 때 `npx hyperframes events --skill=hyperframes-cli`를 한 번 실행하라는 지시를 받는다. 이 명령은 스킬 이름을 CLI의 일반 telemetry와 함께 보내고, 로그인 상태면 계정에 연결되며, 사용자의 opt-out을 따른다.[](source:s-beacon) telemetry는 `telemetry disable`이나 `HYPERFRAMES_NO_TELEMETRY=1`로 끈다.[](source:u-tele) 같은 SKILL.md는 뒤에서 `events`를 "skills' own telemetry"라 부르며 "Don't run them"이라고 쓴다.[](source:s-deprec) 두 문장 중 어느 쪽이 우선하는지 원문에 명시 없음이라 감사 패널에 미확인으로 남겼다. | check-loop | beacon |
| st-begin | history begin | 에이전트는 턴이 시작될 때 `history begin --who <you> --label "<plan>"`을 실행하고, 이어서 `history --since mine --who <you>`로 사용자가 바꾼 것을 읽은 뒤 그 위에 만든다.[](source:s-hist) 원문은 모든 write가 보관되고 되돌릴 수 있다고 쓴다.[](source:s-hist) 이 블록은 "history (trial)" 주석으로 감싸여 있어서 명령과 함께 지울 수 있는 시험 기능이다.[](source:s-histtrial) reference는 영상 작업 시작과 milestone마다 `usage --json`으로 남은 harness 한도를 읽으라고 따로 쓴다. 이 줄은 SKILL.md 본문에는 없고 reference에만 있다.[](source:u-usage) 이 단계를 건너뛰는 조건은 원문에 명시 없음이다. | check-loop | begin |
| st-write | 작성과 lint | 에이전트는 HTML을 쓴 뒤 첫 pass가 끝났을 때와 구조를 바꾼 뒤에 `npx hyperframes lint`를 실행한다.[](source:s-loop1) lint는 `index.html`과 `compositions/` 안 파일을 검사해 error(반드시 고침), warning(고치는 편이 좋음), info(`--verbose`일 때)로 나눠 보고한다. 이 검사는 `data-composition-id` 누락, 같은 `data-track-index`에서 겹치는 트랙, 등록되지 않은 timeline, GSAP와 CSS transform 충돌을 잡는다.[](source:l-lint) lint는 반복 중 빠른 피드백이고 별도의 최종 통과 조건이 아니다.[](source:l-disc) 프로젝트가 아직 없다면 `init <dir> --skip-skills`로 빈 프로젝트를 만들고, `--example`은 사용자가 요청했을 때만 쓰며, URL이 출발점이면 `capture <url>`을 쓴다.[](source:s-table)[](source:i-flags) 이 시작 명령은 그림 1 앞의 준비 단계라 노드로 그리지 않았다. | check-loop | write |
| st-check | check 통과? | 에이전트는 `npx hyperframes check --json`을 실행하고 모든 error를 고친다.[](source:s-loop2) `check`는 같은 linter를 다시 돌린 뒤 한 번의 browser 세션에서 runtime, layout, motion, contrast를 감사하는 필수 최종 통과 조건이고, reference는 check 직전에 따로 lint를 또 돌리지 말라고 쓴다.[](source:l-intro) SKILL.md의 루프는 lint 다음에 check를 바로 적고 있어서 두 문장의 긴장이 있다. 우선순위는 원문에 명시 없음이다. error가 하나라도 남으면 `작성과 lint`로 돌아가 고치고 다시 check한다. error가 없으면 `snapshot 읽기`로 넘어간다. 읽을 것은 JSON의 `ok`, `browserSkipped`, `lint`, `runtime`, `layout`, `motion`, `contrast` 같은 섹션이다.[](source:l-check) `browserSkipped`가 `true`이면 layout, motion, contrast 섹션은 깨끗한 것이 아니라 비어 있다.[](source:l-check) SKILL.md는 lint error가 남아 있으면 layout과 contrast 감사가 돌지 않는다고 쓰지만, reference는 composition을 아예 못 불러오는 경우가 아니면 browser 감사도 함께 돌고 같이 보고된다고 쓴다. 두 문장이 충돌하고 우선순위는 원문에 명시 없다.[](source:s-loop2)[](source:l-check) 설명용 예시: 지어낸 결과에서 contrast error가 나오고 `suggestedColor`가 들어 있다면, 에이전트는 그 색이나 같은 팔레트 계열의 색으로 고친 뒤 다시 check한다.[](source:l-gates) `check`는 `npm run`이 아니라 `npx hyperframes check`로 돌려야 한다. tool timeout이 npm을 바로 끝내도 check는 계속 돌고 보고서를 stderr에 적힌 파일에 저장하기 때문이다.[](source:l-check) | check-loop | check |
| st-snap | snapshot 읽기 | 에이전트는 `npx hyperframes snapshot`을 실행하고 `.hyperframes/artifacts/snapshots/` 아래 PNG를 직접 읽는다. 원문은 이것이 영상을 보는 방법이라고 쓴다.[](source:s-loop3) sub-composition이 있으면 모든 scene의 중간 시점을 찍고, 스타일이 빠진 작은 내용이나 사라진 hero는 mount 결함으로 본다. 그 판별 기준은 스킬 밖 `format.md`에 있고 이 분석은 읽지 않았다.[](source:s-loop3) 프레임 수는 `--frames`가 기본 5개이고, `--range START,END`나 `--composition <id>`로 범위를 좁힌다. `--review`는 beat sheet, 컷 전후 seam strip, 폰 크기 sheet를 만든다.[](source:l-snap) 에이전트는 자동 경고를 손보기 전에 PNG를 먼저 본다. 눈은 감사기가 놓치는 것을 잡고 감사기는 눈이 놓치는 것을 잡기 때문이다.[](source:l-disc) 처음 30초, 모든 mount된 scene, 보고된 문제 구간은 전체 해상도 프레임으로 확인하고, contact sheet는 순간을 찾는 용도로만 쓴다.[](source:l-clean) 특정 finding은 `snapshot --zoom "<selector>"`로 확대하는데, 선택자가 아무것도 못 찾으면 전체 프레임으로 넘어가지 않고 오류로 끝난다.[](source:l-zoom) | check-loop | snap |
| st-prev | preview 전달 | 에이전트는 `npx hyperframes preview --background`로 preview를 띄우고, 출력된 URL이 HTTP 200으로 응답하는지 확인한 뒤 사용자에게 프로젝트 URL을 준다.[](source:s-loop4) URL은 `http://localhost:<port>/#project/<project-name>` 형식이다. `index.html` 경로를 건네지 않고, `#project/...` 해시가 빠졌거나 서버가 죽어 있으면 URL이 죽은 것으로 본다.[](source:p-url) 기본 포트는 3002이고, preview는 파일이 바뀌면 hot-reload하며 Studio를 브라우저로 연다.[](source:p-preview) 검토가 끝나면 `npx hyperframes preview --stop`으로 명시적으로 멈춘다.[](source:p-url) 데스크톱 앱은 preview가 도는 동안 프로젝트를 편집하지 못하고, `npx hyperframes open`이 background preview를 멈춘 뒤 넘겨준다.[](source:p-url) | check-loop | prev |
| st-wait | 사용자 응답 대기 | 에이전트는 URL을 건넨 뒤 기다린다. 사용자가 파일을 요청했거나 중단 없이 하라고 했을 때만 기다리지 않는다.[](source:s-loop4) check가 모두 통과해도 그것만으로는 render할 이유가 되지 않는다.[](source:s-loop4) 사용자가 "이 요소"나 현재 선택을 가리키면 `npx hyperframes preview --context --json --context-fields selection`을 실행하고, 결과가 `no-selection`이면 요소를 클릭해 달라고 요청한다.[](source:s-ctx) 이 명령은 새 server를 띄우지 않고 이미 돌고 있는 Studio에서 선택 정보를 읽어 출력한 뒤 끝난다. 선택된 요소의 source file, composition 경로, timeline 시각, `data-hf-id`나 selector, bbox를 돌려주며, 에이전트는 `selection.target.hfId`를 우선 쓴다.[](source:p-ctx) 실패 코드는 `preview-not-running`, `ambiguous-preview-server`, `preview-port-mismatch`, `no-selection`, `selection-unavailable` 다섯 가지이고, 후보 포트가 나오면 `--port <candidate>`로 다시 실행한다.[](source:p-ctxfail) CLI가 안정적인 target을 줄 수 있을 때는 스크린샷으로 대상을 추정하지 않는다.[](source:p-ctxfail) reference는 이 시점을 "final preview에서 멈추고 승인을 기다린다"고만 쓰고 파일 요청이나 무정지 예외를 적지 않는다. SKILL.md와 `preview-render.md`는 예외를 적는다.[](source:v-render)[](source:p-render-note) | check-loop | wait |
| st-go | 렌더로 이동 | 에이전트는 사용자가 preview를 승인했거나, 파일을 요청했거나, 중단 없이 작업하라고 했을 때 렌더 단계로 간다.[](source:p-render-note) 원문은 이 순간을 "Time to render (step 4)"라고 부른다.[](source:s-loop5) 이 노드는 그림 2로 이어 주는 연결점이고 별도 명령은 없다. 승인 뒤 사용자가 다시 수정을 요청하면 어느 단계로 돌아가는지는 원문에 명시 없음이다. 다만 사용자가 바꾼 것은 `history --since mine`으로 읽고 그 위에 만들라는 규칙이 있다.[](source:s-hist) | check-loop | go |

check가 보는 항목과 판정 규칙은 reference에 길게 적혀 있다. `check` 한 번이 아래를 함께 감사한다.

- `runtime`은 JavaScript console 오류, 처리되지 않은 예외, 실패한 network 요청(미디어 파일의 `ERR_ABORTED`는 걸러냄), HTTP 4xx와 5xx를 본다.[](source:l-runtime)
- `layout`은 container나 canvas 밖으로 나간 글자, 자기 상자에 잘린 글자, 계속 겹치거나 가려진 글자, 대부분의 시간 동안 canvas를 덮는 불투명 요소(`canvas_covered`), 잘림 container를 빠져나간 자식을 본다.[](source:l-runtime)
- `contrast`는 보이는 글자에 WCAG AA를 적용하고 격자 지점 5곳에서 샘플링한다. 일반 글자는 4.5:1, 큰 글자(24px 이상, 굵으면 19px 이상)는 3:1 이상이어야 하고, 실패는 error이며 `suggestedColor`가 붙는다.[](source:l-runtime)[](source:l-gates)
- `craft`는 warning만 낸다. `--strict`에서도 실패하지 않는다. 8 fps로 전체를 훑으며 `line_unread`, `dead_stretch`(3초 넘게 변화 없음), `text_below_floor`(1080에서 28px 미만 글자가 0.5초 이상), `first_frame_empty`, `film_silent`(15초 넘는 영상에 소리 없음)를 알린다.[](source:l-craft)
- `audio`는 render가 섞는 clip을 본다. 오디오로 읽을 수 없거나 오디오 트랙이 없는 `src`는 error라서 render가 멈추고, `data-media-start`가 파일 길이 이상이거나 구간이 통째로 무음이면 warning이다.[](source:l-audio)
- 심각도는 지속 여부로 갈린다. 샘플 한 곳에서만 보인 동적 문제(진입·퇴장 순간)는 `info`로 내려가 통과 조건을 막지 않는다. 여러 샘플에 걸친 문제는 통과 조건을 막고 지속되는 `content_overlap`은 error다.[](source:l-sev)
- 3초 넘는 composition이 모든 샘플에서 변화가 없고 GSAP나 CSS 애니메이션이 같은 시각에 멈춰 있으면 `sweep_static`으로 실패한다. seek가 페이지를 움직이지 못하고 있다는 뜻이다. 그 밖의 정지 화면은 warning이고 `--strict`에서만 실패하며, 일부러 정지한 영상은 root에 `data-no-timeline`을 쓴다.[](source:l-sev) SKILL.md는 이를 "변화 없는 3초 이상 영상은 `sweep_static` 실패"로 줄여 쓴다.[](source:s-loop2)
- 의도적인 예외는 HTML에 표시한다. `data-layout-allow-overflow`, `data-layout-allow-overlap`, `data-layout-allow-occlusion`, `data-layout-allow-caption-zone`, `data-layout-ignore`, `data-hold`가 있다. overlap 예외는 표시한 글자 블록에만 적용되고 scene이나 root wrapper에는 쓰지 않는다.[](source:l-escape)
- `*.motion.json` sidecar가 있으면 check가 자동으로 읽는다. `appearsBy`, `before`, `staysInFrame`, `keepsMoving` 단언을 seek한 timeline에서 검증하고, 선택자가 아무것도 못 찾으면 `motion_selector_missing`으로 크게 실패한다. 단언 실패는 기본 error다.[](source:l-motion)
- 선택 검사로 `--caption-zone`(0~1 비율 band 안에 글자가 겹치는지)과 `--frame-check`(canvas 밖으로 `max(120px, canvas 짧은 변의 6%)` 넘게 나간 media)가 있다. 둘 다 기본으로 꺼져 있다.[](source:l-gates)

@workflow id=render-flow title="그림 2: 렌더 위치와 마무리"
| where | 렌더 위치? | backend | source:s-where |
| local | local render | backend | source:s-where |
| docker | docker render | backend | source:s-where |
| batch | batch render | backend | source:c-batch |
| cloud | cloud render | cloud | source:k-when |
| own | Lambda·Cloud Run | cloud | source:m-when |
| verify | 산출물 확인 | backend | source:s-loop5 |
| fb | feedback 전송 | backend | source:s-fbline |
| endh | history end | backend | source:s-hist |
| where > local | 기본 | emphasis |
| where > docker | 재현성 |
| where > batch | 변수 행 |
| where > cloud | 원격 |
| where > own | 자체 인프라 |
| local > verify | |
| docker > verify | |
| batch > verify | |
| cloud > verify | |
| own > verify | |
| verify > fb | |
| fb > endh | |

그림 2는 선택지를 한 번에 펼친 지도다. 에이전트가 모든 노드를 순서대로 밟는 것이 아니라 `렌더 위치?`에서 하나를 골라 가고, 기본은 `local render`다.

그림에서 생략한 경로가 있다. `cloud render`가 거절되거나 실패하면 `local render`로 돌아가는 경로도 그림에는 없고 `cloud render` 설명에 적었다. `lambda`의 재시도 불가 오류와 batch의 실패 행 처리도 그림에 없고 해당 노드 설명에 적었다.

`feedback 전송`과 `history end`의 선후는 원문에 명시 없다. 판정: 둘 다 턴 끝에 하는 일이라 이 순서로 놓았다.

@steps id=render-flow-steps
| st-where | 렌더 위치? | 에이전트는 필요에 따라 다섯 곳 중 하나를 고른다. 기본은 local이고, 재현성이 필요하면 Docker, 변수 행마다 영상이 필요하면 batch, 로컬 Chrome과 FFmpeg 없이 호스팅 렌더가 필요하면 `cloud render`, 사용자의 AWS나 GCP를 쓰려면 `lambda render`나 `cloudrun render`다.[](source:s-where) local은 가장 빠른 반복 경로라서 작업 중에는 local을 쓰고, preview, snapshot, draft 확인도 local에 머문다.[](source:k-when) `cloud render`는 "클라우드에서 렌더해 줘"라는 요청의 기본 답이다. `lambda`는 이미 AWS에 투자한 경우에만, `cloudrun`은 GCP 소유가 명시된 경우에만 고른다.[](source:k-when) 유료 요금제에는 별도 규칙이 있다. `npx hyperframes auth status`가 `Billing: HyperFrames`와 `Free`가 아닌 요금제를 보이면, 사용자가 받는 최종본이나 공유본은 `cloud render --fps <data-fps> --quality high -o <path>`로 렌더한다. Free면 사용자가 요청하지 않는 한 local로 렌더한다. 소수 fps이거나 프레임이 16:9, 9:16, 1:1이 아니면 local로 렌더한다.[](source:k-when) 어느 쪽이든 매칭 reference를 읽은 뒤에 클라우드 명령을 돌린다.[](source:p-where) | render-flow | where |
| st-local | local render | 에이전트는 `npx hyperframes render --quality looks -o out.mp4`로 렌더한다. 반복 중에는 `draft`, 최종본에는 `delivery`를 쓴다.[](source:s-loop5) `looks`는 기본값이고 standard preset의 CRF 16이며, `delivery`는 `high`와 같다.[](source:p-flags) 출력 파일 이름을 안 주면 `renders/<project>_<YYYY-MM-DD>_<HH-MM-SS>.<ext>`처럼 시각이 붙어 덮어쓰지 않는다.[](source:p-render-cmds) `--fps`는 1~240이거나 `30000/1001` 같은 유리수이고 기본은 root의 `data-fps`, 없으면 30이다. 60 fps는 렌더 시간을 두 배로 만든다.[](source:p-flags) 품질은 `draft`로 반복하고 `looks`로 첫 실제 인코딩을 하며 `delivery`로 최종본을 만든다. `standard`와 `high`도 아직 동작한다.[](source:p-quality) 1440p preset은 720p composition을 2배로 올리거나 4K composition을 내릴 수 있지만, 1920×1080 composition은 4/3이 정수 배율이 아니라 1440p로 올릴 수 없다. 이때는 1440p로 작성하거나 4K로 렌더한 뒤 따로 줄인다.[](source:p-quality) composition이 `data-composition-variables`로 변수를 선언했다면 `--variables '{"title":"Q4 Report"}'`처럼 id를 key로 하는 JSON 객체가 그 기본값을 이번 렌더에서만 덮어쓰고, 빠진 key는 기본값을 쓴다.[](source:p-vars) 30초 영상은 보통 1~2분 걸리므로 foreground로 돌린다. 도구의 timeout보다 오래 걸리는 렌더만 `HYPERFRAMES_RENDER_DETACHED=1`로 떼어 내 자기 process group에서 log로 출력하고, `until grep -qE 'Render (complete|failed)' render.log; do sleep 5; done`으로 기다린다. `pgrep -f`는 자기 루프에 걸려 timeout까지 기다리므로 쓰지 않는다.[](source:s-detach) 렌더가 끝나면 요약의 둘째 줄을 읽는다. 둘째 줄에는 capture 경로, GPU 모드, 단계별 시간이 있고, Linux에서 `screenshot` + `software gpu`면 느린 경로다. 그 이유를 알려고 `--debug`를 켜지는 않는다.[](source:s-fail)[](source:p-summary) Chrome이 시작도 못 하는 macOS agent sandbox에서는 렌더가 불가능하다. 이때는 막힘을 밝히고 확인을 마친 composition을 넘기며, magick나 PIL로 대체 rasterizer를 만들지 않고, 막힘을 알게 된 즉시 최종 요약부터 쓴다.[](source:d-sandbox) | render-flow | local |
| st-docker | docker render | 에이전트는 `render --docker --strict -o out.mp4`로 재현 가능한 container 렌더를 한다.[](source:s-where) Docker 렌더는 byte-identical 출력을 목표로 하고, `--strict`는 lint error가 있으면 렌더를 실패시킨다.[](source:p-render-cmds)[](source:p-flags) Docker는 `doctor`가 점검하는 항목이지만 `render --docker`를 쓸 때만 필요하다.[](source:d-doctor) Chrome 버전을 고정하는 이유는 버전마다 픽셀이 달라지기 때문이고, 번들 Chrome을 쓰면 기계가 바뀌어도 출력이 재현된다.[](source:d-browser) | render-flow | docker |
| st-batch | batch render | 에이전트는 `render --batch rows.json -o "renders/{name}.mp4"`로 변수 행마다 영상을 만든다.[](source:s-where) 설명용 예시: 지어낸 입력으로 `rows`에 `{"name":"alpha","headline":"Hello"}`와 `{"name":"beta","headline":"Welcome"}` 두 행이 있으면 두 파일을 만든다. 변수는 composition에 선언해 둔다.[](source:c-batch) `--batch`는 `--variables`나 `--variables-file`과 함께 쓰지 못한다. `--batch-concurrency` 기본값은 1이고 올릴 때는 보수적으로 올린다. `--batch-fail-fast`가 없으면 독립 행은 계속 돌고 실패는 manifest에 남는다. `--strict-variables`는 렌더 전에 모든 행을 검증하고 변수 계약을 어기면 출력 전에 멈춘다.[](source:c-batch) 출력 템플릿에서 `null`, 객체, 배열 값, 빠진 placeholder, 출력 충돌은 오류다.[](source:c-batch) 끝났다는 기준은 manifest(`manifest.json`)에 실패 행이 없고 완료된 출력이 모두 존재하며 비어 있지 않고 길이가 그럴듯한 것이다.[](source:c-batch) | render-flow | batch |
| st-cloud | cloud render | 에이전트는 먼저 사용자가 `npx hyperframes auth login`으로 로그인하도록 한다. 그 뒤 `cloud render`가 프로젝트를 zip해 올리고 HeyGen 서버에서 렌더해 영상을 내려받는다.[](source:k-intro) 인증은 전용 OAuth client와 `~/.hyperframes/credentials`를 쓰고, 자격 증명은 `HEYGEN_ACCESS_TOKEN`, 로그인 세션, `HEYGEN_API_KEY`, `HYPERFRAMES_API_KEY`, `auth login --api-key`로 저장한 key 순서로 처음 맞는 것이 이긴다.[](source:k-auth) 렌더 옵션 기본값은 `--fps` 30, `--quality` `standard`, `--format` `mp4`, `--resolution` `1080p`이고, `4k`는 1.5배로 과금되며 webm이나 mov(alpha)와 함께 쓰지 못한다.[](source:k-opts) 파이프라인은 프로젝트 확인, 비율 자동 감지(`data-width`, `data-height`), zip, 업로드, 제출(`POST /v3/hyperframes/renders`), 폴링, 다운로드 순서다. `--no-wait`로 폴링을 건너뛰고 `--callback-url`을 함께 주면 완료 webhook으로 fire-and-forget이 된다.[](source:k-pipe)[](source:k-nowait) 업로드 한도는 200 MB이다. 크기 오류가 나면 `cloud render <project> --dry-run --json`으로 압축본을 확인한 다음 정해진 절차를 따른다. 먼저 오래된 렌더, 여분의 snapshot, cache 같은 생성물을 분류하고, 다른 것을 제외하기 전에 `src`, `href`, `url()`, `data-composition-src`, JavaScript 문자열, manifest의 참조를 모두 검색한다. 가장 좁은 root 상대 경로를 `.hyperframesignore`에 추가하고, 크다는 이유만으로 `index.html`, 선택한 composition, 폰트, 이미지, 오디오, 비디오, 스크립트, manifest를 무시하지 않으며 `assets/` 전체도 무시하지 않는다. 통과할 때까지 dry-run을 반복하고 마지막에 `check`를 돌리되, `check`는 동적으로 계산한 asset 경로를 증명하지 못하므로 참조 검색은 여전히 필요하다.[](source:k-limit) CLI는 `401`을 받으면 OAuth token을 새로 고쳐 같은 요청을 다시 보낸다. 읽기에는 무해하지만 zip 업로드(`POST /v3/assets`)는 멱등적이지 않아 맹목적 재시도가 중복 asset과 이중 과금을 만들 수 있으므로, `--idempotency-key "$(uuidgen)"`을 줘서 재시도를 안전하게 한다.[](source:k-retry) 변수 렌더는 `--variables`나 `--variables-file`로 하고, local 프로젝트는 업로드 전에 선언된 schema로 검증된다. 첫 렌더가 찍어 준 `asset_id`에 `--asset-id`로 새 값만 다시 제출하면 zip과 업로드 없이 재렌더한다.[](source:k-vars) cloud 렌더가 거절되거나(네트워크, 할당량) 실패하면 local로 렌더하고 이유를 사용자에게 알린다.[](source:k-when) | render-flow | cloud |
| st-own | Lambda·Cloud Run | 에이전트는 Lambda를 사용자가 자체 AWS 인프라를 명시적으로 원하거나 분산 렌더가 필요할 때만 쓰고, Cloud Run은 자체 GCP 인프라를 명시적으로 원할 때만 쓴다.[](source:m-intro)[](source:n-intro) Lambda는 AWS 자격 증명, AWS SAM CLI, `bun`이 필요하다. `lambda deploy`가 stack을 만들고, `lambda render`가 렌더하며, `lambda progress`로 확인하고, `lambda destroy`로 지운다. `sites create`는 같은 프로젝트를 다시 렌더할 때 업로드를 건너뛰게 해 주는 `siteId`를 만든다. `lambda progress`는 `renderId`나 실행 ARN을 받아 진행률, 렌더한 프레임, 호출 수, 누적 비용, 오류의 스냅샷을 한 번 출력한다.[](source:m-progress) stack 정보는 `<cwd>/.hyperframes/lambda-stack-<name>.json`에 남는데 비밀은 아니지만 AWS 계정을 식별하므로 commit할지 `.gitignore`할지는 작업 방식에 따른다.[](source:m-state) `lambda policies user\|role\|validate`는 CLI가 필요로 하는 최소 IAM 권한을 출력하거나 JSON 정책을 검증한다.[](source:m-iam)[](source:m-pre)[](source:m-deploy)[](source:m-sites)[](source:m-render)[](source:m-destroy) `--width 3840 --height 2160`처럼 composition의 `data-width`와 다른 크기를 주면 조용히 1080p로 나오므로 4K는 `--output-resolution 4k`로 만든다.[](source:m-render) `render-batch`는 JSONL 한 줄마다 실행을 시작하고, `--json` 모드에서는 시작 실패가 있어도 exit 0이므로 모든 행의 `status`를 본다.[](source:m-batch) `progress`가 `ChromeBinaryUnavailableError`를 보이면 `lambda render`를 맹목적으로 다시 내지 않고 Lambda env var를 바꿔 새 실행 환경을 만들거나 다시 `lambda deploy`한다. `FFMPEG_VERSION_MISMATCH`와 `PLAN_HASH_MISMATCH`는 planner와 executor 버전이 어긋난 것이라 재배포한다.[](source:m-errors) `destroy`는 stack만 지우고 S3 bucket은 `Retain`이라 남는다.[](source:m-destroy) Cloud Run은 `gcloud` 인증과 billing, Terraform 1.5 이상, Docker 또는 Cloud Build 권한이 필요하다. `deploy`, `sites create`, `render`, `progress`, `destroy` 순서이며 `render`는 `--width`와 `--height`가 필수다.[](source:n-intro)[](source:n-life) `cloudrun render-batch`는 `--strict-variables`를 받지만 행을 검증하지 않으므로 JSONL 변수 객체를 보내기 전에 직접 검증한다.[](source:n-batch) 두 경로 모두 `--wait` 없이 시작하면 실행 이름이나 `renderId`만 돌려주므로 `progress`로 성공할 때까지 확인한다.[](source:m-render)[](source:n-progress) | render-flow | own |
| st-verify | 산출물 확인 | 에이전트는 렌더가 끝난 뒤 출력 파일이 비어 있지 않은지, `ffprobe`로 잰 길이가 root의 `data-duration`과 같은지 확인하고, 디코드된 프레임을 직접 본다.[](source:s-loop5) 호스팅 경로의 확인 대상은 다르다. cloud는 `video_url`이 짧게 사는 presigned URL이라 캐시하지 말고 `cloud get`으로 다시 받는다.[](source:k-manage) Lambda는 dispatch 성공이 렌더 완료가 아니므로 `progress`로 각 실행을 확인하고, Cloud Run은 보고된 GCS 출력을 확인한다.[](source:m-batch)[](source:n-progress) 영상에 `<video>`가 있으면 장면별로 `snapshot`을 찍어 그 자리에 실제 영상이 나오는지 본다. 검은 패널은 진짜 결함이다.[](source:l-lint) | render-flow | verify |
| st-fb | feedback 전송 | 에이전트는 검증된 렌더 뒤에 `feedback --rating`을 한 번 보낸다. 사용자가 요청했지만 HyperFrames가 못 하는 일이 있으면 그 보고도 따로 보낸다. telemetry가 꺼져 있거나 사용자가 opt-out했으면 보내지 않는다.[](source:s-fbline)[](source:f-main) `--rating`은 0~10 정수이고 `--comment`는 자유 텍스트이며, 깨끗한 렌더는 짧은 결과만 적는다.[](source:p-fb) 재현 packet이 빠진 비-10 comment는 CLI가 경고하지만 막지는 않는다.[](source:p-fbprivacy) 버그나 불편은 재현 packet을 함께 모은다. packet에는 프로젝트 상대 경로의 재현 명령, 기대와 실제 동작, 정확한 오류, 결과 상태, 우회법이 들어간다.[](source:p-fbpacket) 시각 결함을 설명하는 rating 7 이하에는 `COMPOSITION_STRUCTURE:` 블록(구조 anatomy)을 넣는다. 에이전트가 census helper로 채우고 사람이 손으로 채우지 않는다.[](source:f-main) 피드백은 공개 채널로 가므로 절대 경로, home 디렉터리 접두사, 사용자·기계 식별자, 비밀값을 지우고 stack trace는 파일 base name과 줄 번호만 남긴다.[](source:p-fbprivacy)[](source:f-main) `--file-issue`는 최소 재현을 공개 URL에 올리므로 사용자 동의가 있을 때만 쓴다.[](source:f-main) 기능 부재와 host app 문제는 `--comment`만 쓴 두 종류의 보고(`MISSING FEATURE:`, `HOST APP:`)로 따로 보내며, 둘 다 rating metric에 들어가지 않는다. 사람이 말한 이름, 고객, 수치, 경로는 빼고 쓴다.[](source:f-extra) | render-flow | fb |
| st-endh | history end | 에이전트는 턴을 끝낼 때 `history end`를 실행한다.[](source:s-hist) 디스크가 모자라면 `clean --dry-run`으로 목록을 보고 `clean`을 실행한다. `.hyperframes`는 history를 담고 있어서 통째로 지우지 않는다.[](source:s-clean) `clean`은 죽은 렌더가 남긴 것과 다시 만들어지는 idle cache만 지우고 출력물, 소스, 실행 중인 렌더가 쓰는 것은 건드리지 않는다.[](source:v-clean) | render-flow | endh |

마지막 그림은 이미 있는 타임라인을 CLI로 고치는 경로다. Studio가 하는 편집과 같은 방식이라 결과가 Studio의 모양을 유지한다.[](source:s-tl-intro)

@workflow id=timeline-flow title="그림 3: 타임라인 편집"
| list | clip 목록 읽기 | backend | source:s-tl-list |
| plan | --plan 미리보기 | backend | source:s-tl-plan |
| run | 편집 실행 | backend | source:s-tl-plan |
| refused | 거절됐나? | backend | source:s-tl-refuse |
| fix | 겹침·길이 해소 | backend | source:s-tl-refuse |
| receipt | receipt 저장 | backend | source:s-tl-apply |
| undo | undo | backend | source:s-tl-apply |
| list > plan | |
| plan > run | |
| run > refused | |
| refused > fix | 거절 |
| fix > plan | 다시 미리보기 |
| refused > receipt | 적용 | emphasis |
| receipt > undo | 되돌릴 때 |

그림 3은 편집 한 건의 경로다. 여러 편집을 한 번에 할 때 `timeline apply`를 쓰는 길과 `timeline ids`는 각 노드 설명에 적었다. 거절을 `--plan`이 미리 보여 주는지는 원문에 명시 없어서, 거절 노드를 실행 뒤에 두었다.

@steps id=timeline-flow-steps
| st-list | clip 목록 읽기 | 에이전트는 `timeline --json`으로 clip 목록을 받는다. 각 clip의 절대 시작과 끝(`absStart`, `absEnd`), clip을 선언한 파일(`file`), 편집 명령이 받는 `#id` 참조가 들어 있다. id가 없는 clip에는 `timeline ids`가 id를 찍어 준다.[](source:s-tl-list) `index.html`과 각 `data-composition-src` 파일을 직접 열 필요가 없는 이유는 `timeline`이 브라우저 없이 프로젝트 파일을 정적으로 읽기 때문이다.[](source:u-tl) 한 단계 중첩만 읽는다. sub-composition 안의 sub-composition은 `children=unread` 행으로 나오고 그 안의 clip은 세지 않는다.[](source:u-tl) 중첩 clip을 비교할 때는 `start`와 `end`가 아니라 `absStart`, `absEnd`, `file`을 쓴다.[](source:u-tl) 특정 시각에 무엇이 재생되는지, 틈과 겹침이 있는지는 같은 JSON에 `jq`나 node 한 줄을 돌려 찾는다.[](source:u-tlq) | timeline-flow | list |
| st-plan | --plan 미리보기 | 에이전트는 `timeline move\|trim\|split\|set\|duplicate\|delete <ref> … --plan --json`으로 편집 한 건을 미리 본다. `--start`, `--end`, `--duration`은 한쪽 가장자리나 길이를 정한다.[](source:s-tl-plan) 설명용 예시: 지어낸 요청 "outro를 9초로 옮겨 줘"라면 에이전트는 `move` 동사와 `#outro` 참조로 `--plan --json` 미리보기를 먼저 돌린다. 시각을 넘기는 정확한 인자 문법은 원문에 명시 없고, 원문의 JSON 예시는 `"time": "9"`를 쓴다.[](source:s-tl-plan)[](source:s-tl-apply) | timeline-flow | plan |
| st-run | 편집 실행 | 에이전트는 미리 본 같은 명령을 `--plan` 없이 다시 실행한다.[](source:s-tl-plan) 여러 편집이 필요하면 `[{"verb": "move", "ref": "#outro", "time": "9"}]` 같은 JSON 파일을 만들어 `timeline apply plan.json --json`을 실행한다.[](source:s-tl-apply) 이 단계에서 쓰는 명령은 Studio가 하는 편집과 같다.[](source:s-tl-intro) | timeline-flow | run |
| st-refused | 거절됐나? | CLI는 clip이 이웃과 겹치거나 소속 composition의 끝을 넘으면 편집을 거절한다.[](source:s-tl-refuse) 겹침은 `--overwrite`를 쓰거나 이웃을 먼저 옮겨서 푼다. 길이 초과는 root의 `data-duration`을 먼저 늘려야 하고, 어떤 명령도 `data-duration`을 바꾸지 않는다.[](source:s-tl-refuse) 거절되면 `겹침·길이 해소`로 가고, 받아들여지면 `receipt 저장`으로 간다. | timeline-flow | refused |
| st-fix | 겹침·길이 해소 | 에이전트는 이웃 clip을 옮기거나 `--overwrite`를 정하고, 길이를 넘는 경우 root의 `data-duration`을 직접 고친다. 뒤의 경우 `data-duration` 수정은 CLI가 아니라 HTML 편집이다.[](source:s-tl-refuse) 고친 뒤에는 `--plan`부터 다시 한다. | timeline-flow | fix |
| st-receipt | receipt 저장 | 적용할 때마다 CLI는 `receipt`를 출력한다. 에이전트는 이를 저장해 둔다.[](source:s-tl-apply) 이 단계와 별개로, 모든 write는 `history`에도 남는다.[](source:s-hist) | timeline-flow | receipt |
| st-undo | undo | 편집을 되돌려야 하면 `timeline undo receipt.json`을 실행해 그 receipt의 편집을 되돌린다.[](source:s-tl-apply) 프로젝트 전체를 되돌리는 것은 `history undo --who <you>`이고, check가 실패했거나 사용자가 나빠졌다고 말하면 손으로 되돌리지 않고 이 명령을 쓴다.[](source:s-hist) | timeline-flow | undo |

## 이 스킬은 묶음 안에서 어디에 놓이나? {#position span=12}

`hyperframes-cli`는 `build-video` 묶음(HyperFrames로 새 영상 한 편을 만든다)의 "단계" 스킬이다. 앞에는 계약과 작업 순서를 정하는 `hyperframes`가 있고, 뒤에는 명령표에서 이어지는 `hyperframes-registry`, `media-use`, `slideshow`가 있다. 전체 흐름은 `skill-explainers/hyperframes/_group-build-video/build-video.html`에서 본다. 이 패널의 관계는 `skill-explainers/hyperframes/relations.md`의 관계 ID(`rel-id`)를 원문과 다시 대조한 것이다.

@workflow id=build-video-position title="앞·이 스킬·뒤"
| hub | hyperframes | backend | source:s-captions |
| cli | hyperframes-cli | backend | source:s-table |
| reg | hyperframes-registry | backend | source:s-table |
| media | media-use | backend | source:s-table |
| show | slideshow | backend | source:s-table |
| hub > cli | R01·R29 참고 | emphasis |
| cli > reg | R09 참고 |
| cli > media | R10 참고 |
| cli > show | R11 참고 |
| cli > hub | R12 참고 |

@steps id=position-steps
| st-hub | hyperframes | 앞 스킬이다. `hyperframes`는 CLI를 `npx hyperframes <command>`로 돌리고 사용법은 이 스킬에서 보라고 안내한다(R01, R29). 이 스킬은 거꾸로 `captions`가 명령이 아니므로 `transcribe`를 돌린 뒤 `../hyperframes/references/captions.md`를 읽으라고 하고, `keyframes`는 `../hyperframes/references/motion.md`를 읽으라고 한다(R12). 두 파일은 읽지 않았다.[](source:s-captions)[](source:s-refs) 공유 상태로는 `.hyperframes/` history가 있다. `hyperframes`가 변경 전에 `history --since mine`을 읽고, 이 스킬이 `history begin`과 `history end`를 정한다(R27).[](source:s-hist) | build-video-position | hub |
| st-cli | hyperframes-cli | 이 페이지의 스킬이다. 명령을 작업별로 묶고, 확인 루프를 정하며, 렌더 위치와 실패 복구를 안내한다.[](source:s-table)[](source:s-where) | build-video-position | cli |
| st-reg | hyperframes-registry | 뒤 스킬이다. 명령표의 Reuse 행이 `catalog`와 `add`를 `/hyperframes-registry`로 연결한다(R09).[](source:s-table) | build-video-position | reg |
| st-media | media-use | 뒤 스킬이다. 명령표의 Media and sound 행이 `media-treatment`, `grade-compare`, `remove-background`, `tts`, `transcribe`, `beats`, `normalize-audio`를 `/media-use`로 연결한다(R10).[](source:s-table) | build-video-position | media |
| st-show | slideshow | 뒤 스킬이다. 명령표의 Show and ship 행이 `present`를 `/slideshow`로 연결한다(R11).[](source:s-table) | build-video-position | show |

| 관계 | 받는 것 | 넘기는 것 | 조건·강도 |
| --- | --- | --- | --- |
| R01·R29 `hyperframes` → 이 스킬 | CLI 실행 요청 | 명령 사용법 | 참고이고 의무 표현은 없다 |
| R12 이 스킬 → `hyperframes` | 없음 | reference 파일 경로 | `captions`와 `keyframes`일 때 해당 파일을 읽으라고 지목한다 |
| R09 이 스킬 → `hyperframes-registry` | 없음 | `catalog`, `add` 명령 | 명령표 한 행의 참고 |
| R10 이 스킬 → `media-use` | 없음 | media 관련 명령 7개 | 명령표 한 행의 참고 |
| R11 이 스킬 → `slideshow` | 없음 | `present` 명령 | 명령표 한 행의 참고 |
| R27 공유 상태 `.hyperframes/` | history 기록 | history 기록 | 선후 관계가 없고 `hyperframes` CLI가 관리한다. `.hyperframes`는 지우지 않는다[](source:s-clean) |

그림에서 R13(plugin 안이면 `../hyperframes/references/plugin-installation.md`를 따르라는 참고)은 뺐다. 7개 스킬이 모두 같은 줄에 두는 문장이라 이 스킬만의 흐름이 아니다.[](source:s-plugin)

## 언제 켜지고, 무엇을 강제하고 무엇을 금지하나? {#rules span=12}

description은 모델이 켤지 판단할 때 읽는 설명이다. 이 단어가 있으면 켜진다는 사전이 아니다.[](source:s-front)

@code source=s-front language=yaml

- frontmatter에는 `name`과 `description`만 있다.[](source:s-front)
- `disable-model-invocation` 같은 호출 제한 필드는 원문에 명시 없음이다.[](source:s-front)
- 켜진 뒤에는 `npx hyperframes <command>`를 쓰되 프로젝트가 wrapper를 주면 wrapper를 쓴다.[](source:s-run)
- Node.js 22 이상과 FFmpeg가 필요하고, 모든 명령에 `--help`가 있으며 대부분 `--json`을 받는다.[](source:s-run)
- 실패하면 `✗ …` 줄과 `Fix:` 줄을 찍고 0이 아닌 값으로 끝난다.[](source:s-run)
- HyperFrames plugin 안이라면 `../hyperframes/references/plugin-installation.md`의 실행 규칙을 따른다.[](source:s-plugin)
- 이 파일은 읽지 않았다.[](source:s-plugin)
- `--json` 결과에 `_meta.updateNotice`가 있으면 새 릴리스가 나왔다는 뜻이다.[](source:s-notice)
- 에이전트는 대화마다 한 번, 자연스러운 쉼에 자기 말로 전하고, 업데이트할지는 사용자가 정한다.[](source:s-notice)

아래 표는 찾아보기용 규칙 목록이다. 종류는 원문의 어조를 따른 것이다.

| 규칙 | 종류 |
| --- | --- |
| render는 사용자가 preview를 승인했거나 파일을 요청했거나 무정지를 요청했을 때만 한다.[](source:p-render-note)[](source:s-loop4) | 금지 |
| check의 error는 모두 고친다.[](source:s-loop2) | 의무 |
| `validate`, `inspect`, `layout`은 돌리지 않는다. 폐기된 alias이고 `check`가 대신한다. reference는 "아직 돌아가지만 폐기 예정"이라 쓰고, 돌리지 말라고 직접 쓰지는 않는다.[](source:s-deprec)[](source:l-dep) | 금지 |
| `.hyperframes` 폴더는 통째로 지우지 않는다. history와 다른 상태가 들어 있다.[](source:s-clean)[](source:v-clean) | 금지 |
| check가 실패했거나 사용자가 나빠졌다고 하면 `history undo --who <you>`를 쓰고 손으로 되돌리지 않는다.[](source:s-hist) | 의무 |
| `init`은 항상 `--skip-skills`로 돌린다. skill 설치는 사용자의 몫이고, 없으면 `npx hyperframes skills update`를 알려 주되 직접 돌리지 않는다.[](source:i-flags)[](source:i-skills) | 의무·금지 |
| `capture`가 0이 아닌 exit, JSON `ok: false`, `BLOCKED.md` 중 하나를 내면 hard stop이다. 부분 파일에서 아무것도 가져오지 않고 새 `-o` 폴더로 재시도한다.[](source:i-capture)[](source:s-fail) | 금지 |
| Tailwind는 고정된 v4 browser runtime을 유지한다. `cdn.tailwindcss.com`으로 바꾸지 않고 렌더에 중요한 class 이름은 seek 시점에 조립하지 않는다.[](source:i-tw) | 금지 |
| 타임라인 편집은 겹침이나 composition 끝 초과면 거절된다. `data-duration`을 바꾸는 명령은 없다.[](source:s-tl-refuse) | 제한 |
| `share --public`은 사용자가 링크를 가진 누구나 보게 하겠다고 명시했을 때만 쓴다. `--yes`는 대상 공개 범위에 대한 동의가 아니다.[](source:p-share) | 금지 |
| `share --status --json`에서 `ready: true`가 나와야 영상이 볼 준비가 됐다고 말한다.[](source:p-share) | 의무 |
| `publish`는 옛 `/p/` 페이지용이다. review share의 별칭이 아니고 옛 ID를 review 동의로 바꾸지 않는다.[](source:p-share) | 금지 |
| cloud 업로드가 크면 크다는 이유만으로 asset을 무시하지 않는다.[](source:k-limit)[](source:v-path) | 금지 |
| `check`는 `npm run`이 아니라 `npx hyperframes check`로 돌린다.[](source:l-check) | 의무 |
| `doctor --json`은 항상 exit 0이므로 payload의 `.ok`로 판정한다.[](source:s-fail)[](source:v-json) | 의무 |
| FFmpeg는 프로젝트 폴더나 작업 디렉터리 안의 것을 자동 탐색하지 않는다. 프로젝트가 누구에게서 왔는지 모르기 때문이다.[](source:d-ffmpeg) | 금지 |
| 공개 feedback 채널에는 절대 경로와 식별자를 남기지 않는다. `--file-issue`는 동의가 있을 때만 쓴다.[](source:p-fbprivacy)[](source:f-main) | 금지 |
| macOS sandbox에서 Chrome이 못 뜨면 대체 rasterizer를 만들지 않는다.[](source:d-sandbox) | 금지 |

수치와 임계값은 의무, 기본값, 예시를 구분해 아래에 모았다. 괄호는 어느 명령의 값인지 말한다.

@facts
| Node.js 최소 버전(필수) | 22 이상[](source:s-run) |
| check 시간 격자 기본값(기본값) | 9개 샘플, 허용 overflow 2px, 시간 제한 3000 ms와 10000 ms[](source:l-check) |
| check 기본 contrast 기준(WCAG AA) | 일반 글자 4.5:1, 큰 글자 3:1[](source:l-gates) |
| `sweep_static`이 걸리는 최소 길이(통과 조건) | 3초 이상[](source:l-sev) |
| `dead_stretch` 기준(warning) | 3초 넘게 변화 없음. 마지막 3초는 제외[](source:l-craft) |
| `text_below_floor` 기준(warning) | 화면 짧은 변의 2.6%(1080에서 28px) 미만이 0.5초 이상[](source:l-craft) |
| `keepsMoving` 정적 구간 기본값(기본값) | `maxStaticSec` 2초, 영상 마지막 3초 제외[](source:l-motion) |
| snapshot 기본 프레임 수(기본값) | 5개[](source:l-snap) |
| snapshot 보관(자동 정리) | 최신 run 10개, 24시간 안 폴더 보존[](source:l-clean) |
| `compare` 변형 수 상한(제한) | 16개, 넘으면 경고 후 잘림[](source:c-cmp) |
| `grade-compare` 후보 상한(제한) | 16개, 기본 neutral baseline을 더하면 17칸[](source:c-grade) |
| `render --batch` 동시성(기본값) | 1[](source:c-batch) |
| `play` 속도 범위(제한) | `playback-rate`는 0.1~5로 제한되고 0 이하나 유한하지 않은 값은 1[](source:p-play) |
| `render --browser-timeout`(기본값) | 60초, 허용 범위 0.001~86400초[](source:p-flags) |
| 호스팅 업로드 한도(제한) | 200 MB[](source:k-limit) |
| `cloud render` 폴링(기본값) | 2초마다, 최대 60분[](source:k-nowait) |
| `--idempotency-key` 형식(제한) | `[A-Za-z0-9_:.-]` 1~255자[](source:k-retry) |
| `lambda deploy` 기본값(기본값) | concurrency 8, memory 10240 MB, chunk 240 frame, 병렬 chunk 16[](source:m-deploy)[](source:m-render) |
| 일괄 렌더 동시 실행(기본값) | `lambda`와 `cloudrun` 모두 50[](source:m-batch)[](source:n-batch) |
| share 무료 프로젝트 보관(제한) | workspace당 5개[](source:p-share) |
| `publish` 옛 동작 유지 기간(공지) | 60일 창. 시작일은 미정[](source:p-share) |

## 이 스킬은 어떤 명령과 상황에서 한계가 있나? {#limits span=12}

원문에 "이 스킬을 쓰지 말라"고 적은 조건은 명시 없음이다. 아래는 원문이 특정 명령이나 경로를 제한하거나 다른 곳으로 보내는 조건이다.

| 상황 | 원문이 말하는 것 |
| --- | --- |
| 영상 내용과 연출 규칙이 필요한 경우 | `captions`와 `keyframes`는 이 스킬이 아니라 `hyperframes`의 reference를 읽으라고 한다.[](source:s-captions) {caution:다른 스킬} |
| media 생성과 TTS, 자막 체인, 음성 선택이 필요한 경우 | `media-use`를 부르라고 하고 이 스킬은 개발 루프에 집중한다고 한다.[](source:u-asset) {caution:다른 스킬} |
| 자체 GCP 인프라를 원하지 않는 경우 | `cloudrun`은 사용자가 명시적으로 원할 때만 쓴다.[](source:n-intro) {bad:쓰지 않음} |
| 자체 AWS 인프라도 분산 렌더도 필요 없는 경우 | `lambda`는 자체 AWS를 명시적으로 원하거나 분산 렌더가 필요할 때 쓴다.[](source:m-intro) {bad:쓰지 않음} |
| 짧은 한 번짜리 렌더 | Lambda는 deploy 부담 때문에 가치가 없다.[](source:m-when) {bad:쓰지 않음} |
| Free 요금제, 소수 fps, 16:9·9:16·1:1이 아닌 프레임 | 최종본도 local로 렌더한다.[](source:k-when) {caution:local} |
| macOS agent sandbox에서 Chrome이 못 뜨는 경우 | 렌더를 못 한다. 막힘과 확인한 composition만 넘긴다.[](source:d-sandbox) {bad:렌더 불가} |
| `compare`나 `grade-compare`만으로 승인하려는 경우 | 시각 검토용일 뿐 품질 통과 조건이 아니고, 명령 성공이 시각 승인이 아니다.[](source:c-cmp)[](source:c-grade) {bad:대체 불가} |

명령이 실패하면 아래 표대로 복구한다. 원문의 표를 그대로 옮긴 것이고 칸마다 문장 하나씩이다.

| 증상 | 복구 |
| --- | --- |
| Chrome이 없거나 시작하지 않는다 | `npx hyperframes browser ensure`를 실행하고, `doctor --json`은 항상 exit 0이므로 `.ok`로 판정한다.[](source:s-fail) |
| 무거운 페이지가 제때 준비되지 않는다 | `check`나 `snapshot`의 `--timeout`을 올린다.[](source:s-fail) |
| 특이한 codec이 빈 화면으로 보인다 | `--proxy`를 끄지 않고 기본값으로 둔다.[](source:s-fail) |
| Linux에서 렌더가 느리다 | 요약 둘째 줄이 `screenshot` + `software gpu`인지 본다.[](source:s-fail) |
| `capture`가 실패하거나 `BLOCKED.md`를 쓴다 | 부분 파일에서 아무것도 가져오지 않고 새 `-o` 폴더로 재시도한다.[](source:s-fail) |
| 디스크가 모자란다 | `clean --dry-run` 다음 `clean`을 실행하고 `.hyperframes`는 지우지 않는다.[](source:s-fail) |

## reference는 명령 규칙을 어떻게 더하나? {#refs span=12}

SKILL.md 끝의 안내표는 "명령을 실행하기 전에 그 행을 읽는다"고 쓴다.[](source:s-refs) 그림에 노드로 담지 못한 명령 규칙을 reference별로 모았다. 렌더 위치와 cloud, Lambda, Cloud Run, 렌더 feedback은 위 동작 패널에서 다뤘다.

**`init-and-scaffold.md`는 프로젝트를 시작하는 규칙이다.**

- 에이전트는 파일을 손으로 만들지 않고 이 명령을 쓴다.[](source:i-intro)
- TTY에서는 CLI가 wizard로 묻지만 agent나 CI처럼 TTY가 없으면 자동으로 비대화형이 되어 centered blank를 만든다.[](source:i-init)
- 이름 있는 예시로 시작하려면 `--example`을 주고, TTY에서 flag만 쓰려면 `--non-interactive`를 준다.[](source:i-init)
- 템플릿은 `blank`와 예시 8개(`warm-grain`, `play-mode`, `swiss-grid`, `vignelli`, `decision-tree`, `kinetic-type`, `product-promo`, `nyt-graph`)다.[](source:i-init)
- 해상도 preset은 `landscape`(1920×1080), `portrait`(1080×1920), `square`(1080×1080)와 4K·1440p 변형이다.[](source:i-init)[](source:i-flags)
- `--audio`나 `--video`를 주면 Whisper로 자동 전사하고 `--skip-transcribe`로 끈다.[](source:i-flags)
- `--tailwind`를 쓰면 Tailwind v4 browser runtime이 고정된다.[](source:i-tw)
- 테마는 `<style type="text/tailwindcss">`의 `@theme`과 `@utility`에 쓰고, v3의 `@tailwind` 지시자, `tailwind.config.js`, `@config`, `@plugin`은 쓰지 않는다.[](source:i-tw)
- 타이밍은 GSAP 같은 seek 가능한 runtime이 맡는다.[](source:i-tw)
- `capture <url>`은 라이브 URL을 편집 가능한 프로젝트로 바꾼다.[](source:i-capture)
- 사용자가 URL을 출발점으로 줬을 때 쓰고, 에이전트는 `--json`의 `ok`, `lastPhase`를 읽는다.[](source:i-capture)
- `--timeout`은 페이지 이동만, `--capture-budget`은 이동 뒤 작업(폰트, asset, vision, contact sheet)만 제한하고, 바깥 호출자의 deadline은 셋째 timeout이라 그것이 터져도 HyperFrames가 멈췄다는 증거가 아니다.[](source:i-capture)

**`compare-and-batch.md`는 시각 비교 명령이다.**

- `compare`는 같은 시각을 두 개 이상의 프로젝트나 HTML에서 렌더해 라벨 붙은 contact sheet 한 장으로 만든다.[](source:c-cmp)
- 기준선과 후보, 구현 변형, 수리 뒤 모양 유지를 확인할 때 쓴다.[](source:c-cmp)
- `grade-compare`는 원본 프레임에 색보정 후보를 입혀 비교하는 sheet를 만들고, 후보는 `--grades` JSON과 `--luts` 중 정확히 하나로 준다.[](source:c-grade)
- 이 명령은 고른 grade를 composition에 적용하지 않고 `/media-use`의 provenance와 LUT 검증을 대신하지도 않는다.[](source:c-grade)
- 두 명령 모두 `lint`, `check`, 최종 preview 승인, 출력 검증을 대체하지 못한다.[](source:c-intro)

**`beats.md`는 음악 beat 파일 명령이다.**

- 프로젝트에 `data-timeline-role="music"`을 단 로컬 `<audio>`(또는 id에 `music`, `bgm`, `soundtrack`가 든 것)가 있어야 한다.[](source:b-use)
- 에이전트는 `npx hyperframes beats`를 돌려 `beats/<audio-relative-path>.json`을 만든다.[](source:b-use)
- 오디오나 비디오 파일을 직접 주면 분석 결과만 출력하고 아무것도 쓰지 않는다.[](source:b-use)
- 박자가 일정하지 않으면 실패하고 아무것도 쓰지 않으며, ffmpeg가 없으면 `doctor`를 돌린다.[](source:b-use)
- 곡에 맞춰 영상 전체를 자르는 작업은 `/hyperframes`의 `references/film.md`로 보내는데, 이 파일은 읽지 않았다.[](source:b-use)

**`preview-render.md`의 `play`와 `share`는 보여 주는 명령이다.**

- `play`는 Studio 없이 `<hyperframes-player>` web component로 composition을 띄우고 기본 포트는 3003이다.[](source:p-play)
- 공유용 미리보기나 Studio가 무거울 때 쓰며 URL에 `#project/<name>`이 붙지 않는다.[](source:p-play)
- `preview`와 `play`는 `--browser-path`, `--user-data-dir`, `--remote-debugging-port`로 외부 Chromium을 쓸 수 있다.[](source:p-browser)
- CDP 포트는 앞의 둘이 모두 있어야 열려서 주 프로필로 새지 않는다.[](source:p-browser)
- HyperFrames 자체는 CDP 자동화를 하지 않고 endpoint만 연다.[](source:p-browser)
- `share`의 첫 공유 대상은 `--public`, `--team`, `--invite-only`, `--private`이고 workspace 권한에 따른다.[](source:p-share)
- 다시 실행하면 기존 링크를 가져오고 `share --update`만 바뀐 내용을 렌더·업로드한다.[](source:p-share)
- `publish`는 프로젝트 source를 올려 옛 hosted URL을 돌려주고, 새로 올리면 기본이 private이며 `--public`을 줘야 누구나 볼 수 있다.[](source:p-publish)
- 다시 올릴 때 `--public`이 없어도 이미 public인 프로젝트를 private으로 바꾸지 않고, lint 결과는 올리기 전에 보이지만 막지 않는다.[](source:p-publish)

**`doctor-browser.md`는 환경 진단 규칙이다.**

- `doctor`는 Version, Node.js(22 이상), CPU, Memory, Disk, 환경 변수, FFmpeg와 FFprobe, Chrome, Docker, 컨테이너 안의 `/dev/shm`을 각각 `ok`, `warn`, `fail`로 보고한다.[](source:d-doctor)
- render가 Chrome이나 FFmpeg 오류로 실패하거나, preview가 열려도 composition이 안 뜨거나, 처음 쓰는 기계일 때 가장 먼저 돌린다.[](source:d-doctor)
- FFmpeg는 `HYPERFRAMES_FFMPEG_PATH`와 `HYPERFRAMES_FFPROBE_PATH`로 절대 경로를 주고, 설정한 경로가 자동 탐색보다 우선하며, 없으면 `missing`으로 보고된다.[](source:d-ffmpeg)
- 최상위 `ok`에는 Docker 같은 선택 도구도 들어가므로 FFmpeg만 통과 조건으로 걸려면 `jq`로 두 항목만 고른다.[](source:d-ffmpeg)
- `browser ensure`는 고정된 Chrome을 찾거나 받고, `browser path`는 실행 파일 경로를 출력하며, `browser clear`는 캐시된 Chrome을 지운다.[](source:d-browser)

**`upgrade-info-misc.md`는 기타 명령 규칙이다.**

- `info`는 프로젝트 메타데이터(이름, 해상도, 길이, 요소 수, 트랙 수, 크기)를 보여 주고 환경 점검은 `doctor`의 일이다.[](source:u-info)
- `upgrade --check --json`은 질문 없이 current, latest, updateAvailable을 돌려준다.[](source:u-upgrade)
- `upgrade --project`는 프로젝트 `package.json`의 고정된 `npx …hyperframes@<version>…`를 최신으로 고쳐 쓰는데, 항상 `npx hyperframes@latest upgrade --project`처럼 고정 없이 부르고 뒤에 다른 flag가 오면 디렉터리를 명시한다.[](source:u-upgrade)
- `compositions`는 모든 `data-composition-id`를 길이, 해상도, 요소 수와 함께 나열하고, `docs`는 브라우저를 열지 않고 터미널에 주제를 출력한다.[](source:u-comp)
- `benchmark`는 다섯 preset(`30fps draft 2w`, `30fps standard 2w`, `30fps high 2w`, `30fps standard 4w`, `60fps standard 4w`)으로 프로젝트를 렌더해 속도와 크기를 비교하고, 기본 반복은 3회다.[](source:u-bench)
- telemetry는 사용량 카운터뿐이고, 사용자가 HeyGen에 로그인하기 전까지 익명이며 `auth login` 뒤에는 계정(이메일, 사용자 이름)에 연결되므로 로그인한 사용자에게 익명이라고 말하지 않는다.[](source:u-tele)
- `tts`, `transcribe`, `remove-background`는 첫 실행에 모델을 받을 수 있고 선택 규칙은 `media-use` 스킬을 부른다.[](source:u-asset)
- `usage --json`은 Claude Code, Codex, Grok의 남은 한도를 읽는 스냅샷이다.[](source:u-usage)
- 토큰을 쓰지 않고 한도를 예약하거나 다음 영상 비용을 추정하지 않으며, 알 수 없으면 추측하지 않고 `unknown`을 보고하고, 범위와 흐름 선택은 사용자에게 둔다.[](source:u-usage)

**`conventions.md`는 agent와 CI용 관례다.**

- agent와 CI 호출은 `--json`을 선호하지만 server 모드 `render`, `preview`, `play`는 일반 JSON을 내지 않는다.[](source:v-json)
- `preview --selection --json`과 `preview --context --json`은 예외다.[](source:v-json)
- 한 검증 루프에서는 `HYPERFRAMES_RUN_ID` 하나를 쓰고, 경고·변수·CI 조건으로 렌더를 막아야 하면 `--strict`, `--strict-all`, `--strict-variables`를 쓴다.[](source:v-misc)[](source:v-strict)
- shader lint `shader_unbounded_cosine_pow`는 `pow(1 - cosine, exponent)` 앞에서 cosine을 `[0, 1]`로 clamp해야 하며 아래쪽만 막는 `max`는 부족하다.[](source:v-shader)
- 고친 뒤에는 해당 GPU에서 preview와 export로 확인한다.[](source:v-shader)
- JSON 경로는 home 디렉터리를 `$HOME`으로 가리므로 되돌리려 하지 않는다.[](source:v-path)

## 이 페이지에서 확인하지 못한 것과 읽은 범위는? {#audit span=12}

**부분 분석**이다. 폴더 안 원본은 전부 읽었지만 아래 스킬 밖 파일과 번역본은 읽지 않았다. 대상 스킬이 지시하는 명령(`npx hyperframes ...` 전부)은 하나도 실행하지 않았다. `shasum`, `wc` 같은 읽기 전용 확인만 했다.

@callout level=open-question title="events: 시작 때 한 번 실행하라는 문장과 실행하지 말라는 문장"
SKILL.md 8줄은 스킬이 시작될 때 `npx hyperframes events --skill=hyperframes-cli`를 한 번 실행하라고 쓴다.[](source:s-beacon) 33줄은 폐기된 alias 세 개를 말한 뒤 "`events` is skills' own telemetry. Don't run them."이라고 쓴다.[](source:s-deprec) "them"이 alias만 가리키는지 `events`도 포함하는지, 우선순위가 무엇인지 원문에 명시 없음이다.

@callout level=open-question title="lint error가 있을 때 browser 감사가 도는가"
SKILL.md는 lint error가 남아 있으면 layout과 contrast 감사가 돌지 않는다고 쓰지만,[](source:s-loop2) reference는 composition을 못 불러오는 경우가 아니면 browser 감사도 함께 돌고 같이 보고된다고 쓴다.[](source:l-check) 우선순위는 원문에 명시 없음이다.

@callout level=open-question title="lint를 check 직전에 또 돌려도 되나"
SKILL.md 루프는 lint 다음에 check를 적고,[](source:s-loop1)[](source:s-loop2) reference는 check 직전의 중복 lint를 피하라고 쓴다.[](source:l-intro) 어느 쪽이 우선인지 원문에 명시 없음이다.

@callout level=open-question title="승인 예외가 reference에 따라 다르다"
SKILL.md와 `preview-render.md`는 파일 요청이나 무정지 요청이 있을 때 승인 대기를 건너뛸 수 있다고 쓰고,[](source:s-loop4)[](source:p-render-note) `conventions.md`는 예외 없이 "final preview에서 멈춰 승인을 기다린다"고만 쓴다.[](source:v-render) 충돌인지 요약인지 원문에 명시 없음이라 페이지는 예외를 인정하는 쪽으로 썼다.

@callout level=open-question title="스킬 밖 reference 5개를 읽지 않았다"
`../hyperframes/references/plugin-installation.md`,[](source:s-plugin) `captions.md`,[](source:s-captions) `format.md`(mount 결함 기준과 변수 규약),[](source:s-loop3)[](source:k-vars) `motion.md`,[](source:s-refs) `references/film.md`[](source:b-use)를 읽지 않았다. 이 파일들에 이 스킬의 규칙을 바꾸는 내용이 있는지는 확인하지 못했다. 다른 스킬 `/media-use`, `/hyperframes-registry`, `/slideshow`의 내용도 읽지 않았다.

@callout level=open-question title="history 블록은 시험 기능이다"
원문은 history 블록을 "(trial)" 주석으로 감싸고 명령과 함께 지울 수 있다고 쓴다.[](source:s-histtrial) 이 블록이 실제로 CLI에 남아 있는 기능인지, 어느 CLI 버전부터인지 원문에 명시 없다. `history` 명령 자체를 이 스킬 폴더만으로는 확인할 수 없다.

**읽은 파일과 바이트.** 폴더 안 원본 텍스트 13개를 모두 끝까지 읽었다. 바이트는 파일마다 한 번만 적는다.

| 파일(`hyperframes/hyperframes-cli/` 기준) | 바이트 | 읽은 범위 |
| --- | --- | --- |
| `SKILL.md` | 7573 | 전부 |
| `references/init-and-scaffold.md` | 6792 | 전부 |
| `references/lint-validate-inspect.md` | 20082 | 전부 |
| `references/compare-and-batch.md` | 4378 | 전부 |
| `references/beats.md` | 992 | 전부 |
| `references/preview-render.md` | 36764 | 전부 |
| `references/doctor-browser.md` | 4411 | 전부 |
| `references/cloud.md` | 13024 | 전부 |
| `references/lambda.md` | 17907 | 전부 |
| `references/cloudrun.md` | 3553 | 전부 |
| `references/upgrade-info-misc.md` | 11866 | 전부 |
| `references/conventions.md` | 2092 | 전부 |
| `references/feedback.md` | 2539 | 전부 |

합계 131,973바이트다. 구조·표본만 확인한 파일은 없고 부분 읽음은 0개다.

**제외한 파일.**

- 번역본 `*.KO.md` 13개(합계 152,066바이트)는 열지 않았다. 하단 출처에 경로만 선언했고 근거로 쓰지 않았다.
- 바이너리와 생성 데이터는 이 폴더에 없다.
- 분석 중 바뀐 파일은 없다.
