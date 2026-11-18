# hyperframes-cli — HyperFrames CLI를 작업별로 쓰는 법 {#overview}

에이전트는 HyperFrames 영상 프로젝트를 `npx hyperframes` 명령으로 만들고, 확인하고, 사람에게 보여 준 뒤 렌더한다.[](source:fm)

- 켜지는 상황: 프로젝트 scaffold, frame 확인, timeline 편집, preview, render, share, 작업 기록(history) 작업이다.[](source:fm) 렌더는 로컬, Docker, 호스팅 cloud, AWS, GCP 가운데 하나로 갈린다.[](source:rw-table)
- 남는 것: `check` 보고서, `snapshot` PNG, preview URL, 승인 뒤 렌더한 영상 파일, `feedback` 한 건이다.[](source:lint)[](source:snap)[](source:prev)[](source:rend)[](source:fbk)
- 다른 스킬과의 관계: `hyperframes`가 이 스킬을 참고로 가리키고, 이 스킬의 명령표가 `hyperframes-registry`, `media-use`, `slideshow`를 참고로 가리킨다. `.hyperframes/` 기록은 `hyperframes`와 같은 파일로 쓴다.[](source:rows)
- 하지 않는 것: 사람 승인 전에 렌더하지 않고, 업데이트와 스킬 설치는 사람에게 맡긴다.[](source:prev)[](source:use)[](source:skills)

@answer scope="hyperframes/hyperframes-cli · 원본 파일 13개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source fm title="frontmatter description" path=hyperframes/hyperframes-cli/SKILL.md lines=1:4
@source plug title="plugin 안일 때 규칙" path=hyperframes/hyperframes-cli/SKILL.md lines=6:6
@source beacon title="시작 beacon 지시" path=hyperframes/hyperframes-cli/SKILL.md lines=8:8
@source use title="명령 실행법과 업데이트 알림" path=hyperframes/hyperframes-cli/SKILL.md lines=12:14
@source rows title="명령표의 스킬 연결 행" path=hyperframes/hyperframes-cli/SKILL.md lines=25:27
@source capt title="captions는 명령이 아님" path=hyperframes/hyperframes-cli/SKILL.md lines=31:31
@source alias title="deprecated 별칭과 events" path=hyperframes/hyperframes-cli/SKILL.md lines=33:33
@source lint title="루프 1단계 lint" path=hyperframes/hyperframes-cli/SKILL.md lines=37:37
@source chk title="루프 2단계 check" path=hyperframes/hyperframes-cli/SKILL.md lines=38:38
@source snap title="루프 3단계 snapshot" path=hyperframes/hyperframes-cli/SKILL.md lines=39:39
@source prev title="루프 4단계 preview" path=hyperframes/hyperframes-cli/SKILL.md lines=40:40
@source rend title="루프 5단계 render" path=hyperframes/hyperframes-cli/SKILL.md lines=41:41
@source tl title="timeline 편집 규칙" path=hyperframes/hyperframes-cli/SKILL.md lines=49:52
@source hist title="Project history 규칙" path=hyperframes/hyperframes-cli/SKILL.md lines=56:58
@source rw-table title="렌더 위치 표" path=hyperframes/hyperframes-cli/SKILL.md lines=64:70
@source fbk title="렌더 뒤 feedback" path=hyperframes/hyperframes-cli/SKILL.md lines=74:74
@source fail title="명령 실패 복구 표" path=hyperframes/hyperframes-cli/SKILL.md lines=78:85
@source refs title="명령별 reference 표" path=hyperframes/hyperframes-cli/SKILL.md lines=91:103
@source kf title="keyframes reference" path=hyperframes/hyperframes-cli/SKILL.md lines=103:103
@source skills title="skills 설치는 사람의 일" path=hyperframes/hyperframes-cli/references/init-and-scaffold.md lines=73:76
@source init-skip title="init은 항상 --skip-skills" path=hyperframes/hyperframes-cli/references/init-and-scaffold.md lines=27:27
@source cap-stop title="capture hard stop" path=hyperframes/hyperframes-cli/references/init-and-scaffold.md lines=67:71
@source lvi-intro title="lint와 check 역할" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=3:3
@source lvi-check title="check 동작과 lint 오류" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=44:44
@source pr-gate title="render 승인 조건" path=hyperframes/hyperframes-cli/references/preview-render.md lines=102:102
@source pr-url title="preview URL과 종료" path=hyperframes/hyperframes-cli/references/preview-render.md lines=18:26
@source share title="share 동의와 상태" path=hyperframes/hyperframes-cli/references/preview-render.md lines=209:216
@source fbk-ref title="feedback 보고 규칙" path=hyperframes/hyperframes-cli/references/feedback.md lines=3:9
@source conv title="렌더 승인 규약" path=hyperframes/hyperframes-cli/references/conventions.md lines=17:17
@source sbx title="Chrome 차단 sandbox" path=hyperframes/hyperframes-cli/references/doctor-browser.md lines=34:45
@source cloud-size title="cloud 업로드 크기 제한" path=hyperframes/hyperframes-cli/references/cloud.md lines=51:67
@source cloud-final title="paid plan 최종 렌더" path=hyperframes/hyperframes-cli/references/cloud.md lines=17:17
@source lambda title="lambda 사용 조건" path=hyperframes/hyperframes-cli/references/lambda.md lines=3:3
@source cloudrun title="cloudrun 사용 조건" path=hyperframes/hyperframes-cli/references/cloudrun.md lines=3:3

## 어떻게 동작하나 {#flow span=12}

절차형이다. 에이전트는 쓰고, 확인하고, 사람에게 보여 주고, 승인 뒤에 렌더한다.[](source:lint)[](source:prev)[](source:rend)

그림은 루프 한 바퀴만 그린다. 뺀 것은 세 가지다. 하나는 턴 시작의 `history begin`과 끝의 `history end`다.[](source:hist) 다른 하나는 `timeline` 편집이다.[](source:tl) 마지막은 렌더 위치 선택(로컬·Docker·batch·cloud·AWS·GCP)이다.[](source:rw-table) 각 항목은 "더 자세히 읽으려면"의 상세 후보에 있다.

@workflow id=flow-diagram title="hyperframes-cli 흐름"
| lane author | 쓰며 확인 |
| lane review | 사람 검토 |
| lane ship | 렌더와 보고 |
| lint | lint 실행 | backend | author | source:lint |
| check | check 통과? | backend | author | source:chk |
| fix | 오류 수정 | backend | author | source:chk |
| snap | snapshot 확인 | backend | author | source:snap |
| prev | preview 승인 | external | review | source:prev |
| render | render 실행 | backend | ship | source:rend |
| verify | 결과 검증 | backend | ship | source:rend |
| fb | feedback 보내기 | backend | ship | source:fbk |
| lint > check | |
| check > snap | 통과 | emphasis |
| check > fix | 오류 |
| fix > check | 다시 |
| snap > prev | |
| prev > render | 승인 | emphasis |
| render > verify | |
| verify > fb | |

@steps id=flow-steps
| s-lint | lint 실행 | **입력** 작성한 `index.html`과 `compositions/` · **참조** `references/lint-validate-inspect.md` · **실행** `npx hyperframes lint` · **출력** error·warning·info 목록. **처리** 에이전트가 첫 작성 뒤와 구조를 바꾼 뒤에 정적 문제를 잡는다.[](source:lint) **다음** `check` 바로 앞에 같은 `lint`를 따로 되풀이하지 않는다.[](source:lvi-intro) | flow-diagram | lint |
| s-check | check 통과? | **입력** 프로젝트 · **참조** `references/lint-validate-inspect.md` · **실행** `npx hyperframes check --json` · **출력** `ok`, `lint`, `layout`, `contrast` 등을 담은 보고서. **처리** 에이전트가 lint·runtime·layout·contrast를 한 번에 돌려 통과 여부를 정한다.[](source:chk)[](source:lvi-intro) **다음** 오류가 하나라도 있으면 `오류 수정`으로 간다. `0 samples`는 아무것도 검사하지 않은 것이다.[](source:chk) | flow-diagram | check |
| s-fix | 오류 수정 | **입력** `check` 오류 목록 · **출력** 고친 composition. **처리** 에이전트가 오류를 모두 고친다. contrast 실패에는 보고서의 `suggestedColor`가 붙는다.[](source:chk) **다음** 고친 뒤 `check`를 다시 돌린다. | flow-diagram | fix |
| s-snap | snapshot 확인 | **입력** `check`를 통과한 프로젝트 · **참조** `references/lint-validate-inspect.md` · **실행** `npx hyperframes snapshot` · **출력** `.hyperframes/artifacts/snapshots/`의 PNG. **처리** 에이전트가 PNG를 읽어 영상을 눈으로 확인한다.[](source:snap) **다음** sub-composition이 있으면 모든 scene의 중간 시점을 찍는다. 아주 작고 스타일 없는 내용이나 빠진 hero는 mount 결함이다.[](source:snap) | flow-diagram | snap |
| s-prev | preview 승인 | **입력** 확인을 마친 프로젝트 · **참조** `references/preview-render.md` · **실행** `npx hyperframes preview --background` · **출력** Studio 프로젝트 URL `http://localhost:<port>/#project/<project-name>`. **처리** 에이전트가 URL이 200으로 응답하는지 확인하고, 사람에게 URL을 주고 기다린다.[](source:prev)[](source:pr-url) **다음** 사람이 파일을 요청했거나 멈추지 말라고 했으면 기다리지 않는다. 검토가 끝나면 `npx hyperframes preview --stop`으로 닫는다.[](source:prev)[](source:pr-url) | flow-diagram | prev |
| s-render | render 실행 | **입력** 승인된 프로젝트 · **참조** `references/preview-render.md` · **실행** `npx hyperframes render --quality looks -o out.mp4` · **출력** 영상 파일. **처리** 에이전트가 승인 뒤에 렌더한다. 반복 중에는 `draft`, 최종은 `delivery`를 쓴다.[](source:rend) **다음** 유료 plan이면 최종 렌더는 `cloud render --fps <data-fps> --quality high -o out.mp4`다.[](source:rend)[](source:cloud-final) | flow-diagram | render |
| s-verify | 결과 검증 | **입력** 렌더한 영상 파일 · **출력** 길이 대조 결과와 decode한 frame 확인. **처리** 에이전트가 파일이 비어 있지 않은지, `ffprobe` 길이가 root `data-duration`과 같은지 본 뒤 decode한 frame을 본다.[](source:rend) | flow-diagram | verify |
| s-fb | feedback 보내기 | **입력** 검증을 마친 렌더 결과 · **참조** `references/feedback.md` · **실행** `npx hyperframes feedback --rating <0-10> --comment "<specific result or friction>"` · **출력** feedback 한 건. **처리** 에이전트가 렌더가 검증된 뒤 평점을 보내고, 해낼 수 없던 요청이 있으면 별도 보고를 더한다.[](source:fbk)[](source:fbk-ref) **다음** telemetry가 꺼져 있거나 사용자가 거절하면 보내지 않는다.[](source:fbk-ref) | flow-diagram | fb |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(`description`). 호출 제한 필드는 없다. 다른 스킬이 `/hyperframes-cli`로 가리킨다.[](source:fm) |
| 성격 | `npx hyperframes` 명령을 작업별로 묶고, 확인 루프와 렌더 위치와 실패 복구를 정한다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| hyperframes {#rel-r01} | **이 스킬** | 참고 | CLI는 `npx hyperframes <command>`로 돌리고 사용법은 `/hyperframes-cli`를 본다. 의무 표현은 없다.[](source:use) |
| **이 스킬** {#rel-r09} | hyperframes-registry | 참고 | 명령표의 Reuse 행에서 `catalog`, `add`를 `/hyperframes-registry`로 연결한다.[](source:rows) |
| **이 스킬** {#rel-r10} | media-use | 참고 | 명령표의 Media and sound 행(`media-treatment`, `tts` 등)을 `/media-use`로 연결한다.[](source:rows) |
| **이 스킬** {#rel-r11} | slideshow | 참고 | 명령표의 Show and ship 행에서 `present`를 `/slideshow`로 연결한다.[](source:rows) |
| **이 스킬** {#rel-r12} | hyperframes | 참고 | `captions`는 명령이 아니므로 `transcribe`를 돌린 뒤 `../hyperframes/references/captions.md`를 읽는다. `keyframes`는 `../hyperframes/references/motion.md`를 읽는다.[](source:capt)[](source:kf) |
| **이 스킬**(외 6개 스킬) {#rel-r13} | hyperframes | 참고 | 7개 스킬이 모두 첫 줄에서 HyperFrames plugin 안일 때만 `../hyperframes/references/plugin-installation.md`의 규칙을 따르라고 한다.[](source:plug) |
| hyperframes {#rel-r27} | **이 스킬** | 같은 파일 | `.hyperframes/` 기록을 함께 쓴다. `/hyperframes`는 변경 전에 `history --since mine --who <you>`로 사용자 변경을 읽는다. 이 스킬은 턴 시작에 `history begin`, 끝에 `history end`를 하라고 하고 `.hyperframes`를 지우지 말라고 한다.[](source:hist)[](source:fail) |
| hyperframes {#rel-r29} | **이 스킬** | 참고 | `/hyperframes`는 렌더·`check`·`snapshot`·`preview`·`render`를 `npx hyperframes`로 하라고만 쓴다. 명령 안내는 이 스킬에 있다.[](source:use) |

그림에는 `같은 파일` 관계(`rel-r27`)와 `hyperframes`가 이 스킬을 가리키는 두 번째 `참고`(`rel-r29`)를 그리지 않았다. 표에만 있다.

@architecture id=relation-map title="hyperframes-cli와 이어지는 스킬"
| hf | hyperframes | backend |
| self | hyperframes-cli(이 스킬) | backend |
| reg | hyperframes-registry | backend |
| media | media-use | backend |
| show | slideshow | backend |
| hf > self | 참고 |
| self > hf | 참고 |
| self > reg | 참고 |
| self > media | 참고 |
| self > show | 참고 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

`../hyperframes/references/`의 `captions.md`, `motion.md`, `plugin-installation.md`는 다른 스킬 폴더의 파일이라 이 표에 넣지 않았다.

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 명령표, 확인 루프, timeline 편집, history, 렌더 위치, 실패 복구, reference 표 | 스킬이 켜지면 읽는다 | 모든 단계 |
| `references/lint-validate-inspect.md` | `lint`, `check`, motion sidecar, `snapshot` 설명 | `lint`, `check`, `snapshot` 명령 전에 읽는다[](source:refs) | lint 실행, check 통과?, snapshot 확인 |
| `references/preview-render.md` | `preview`, `play`, `render`, `share`, `publish`와 Studio context | `preview`, `render`, `share` 명령 전에 읽는다[](source:refs) | preview 승인, render 실행 |
| `references/feedback.md` | 평점·누락 기능·host app 보고 형식 | 렌더 검증 뒤에 읽는다[](source:fbk) | feedback 보내기 |
| `references/conventions.md` | `--json`, `--strict`, run id, `clean` 같은 CLI 규약 | `--strict` 계열, run id, `clean`, shader lint, JSON 경로를 쓸 때 읽는다[](source:refs) | 흐름 밖: 규약 참고 |
| `references/doctor-browser.md` | `doctor`, `browser`, FFmpeg 설정 | `doctor`, `browser` 명령 전에 읽는다[](source:refs) | 흐름 밖: 명령 실패 복구 |
| `references/init-and-scaffold.md` | `init`, `capture`, `skills` 명령 | 이 명령들 전에 읽는다[](source:refs) | 흐름 밖: 프로젝트 시작 |
| `references/compare-and-batch.md` | `compare`, `grade-compare`, `render --batch` | 이 명령들 전에 읽는다[](source:refs) | 흐름 밖: 비교·batch 렌더 |
| `references/beats.md` | `beats` 명령(음악 beat 파일 생성) | `beats` 명령 전에 읽는다[](source:refs) | 흐름 밖: beat 파일 |
| `references/cloud.md` | `auth`, `cloud render`, template 변수, 200 MB 제한 | `auth`, `cloud`, template 변수를 쓸 때 읽는다[](source:refs) | 흐름 밖: render 실행의 cloud 선택 |
| `references/lambda.md` | `lambda` 명령(AWS 렌더) | `lambda` 명령 전에 읽는다[](source:refs) | 흐름 밖: render 실행의 AWS 선택 |
| `references/cloudrun.md` | `cloudrun` 명령(GCP 렌더) | `cloudrun` 명령 전에 읽는다[](source:refs) | 흐름 밖: render 실행의 GCP 선택 |
| `references/upgrade-info-misc.md` | `info`, `upgrade`, `compositions`, `timeline`, `docs`, `usage`, telemetry | 이 명령들 전에 읽는다[](source:refs) | 흐름 밖: 프로젝트 조회·upkeep |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 사람이 승인하기 전, 그리고 파일 요청이나 중단 없음 지시가 없을 때 | `check`를 통과해도 렌더하지 않고 preview 승인을 기다린다. | [](source:prev)[](source:pr-gate)[](source:conv) |
| `check`에 lint 오류가 남았을 때 | SKILL.md는 layout·contrast 감사가 돌지 않는다고 쓴다. reference는 브라우저 감사가 함께 돌고 `browserSkipped`일 때만 빈다고 쓴다. 원문이 충돌한다. | [](source:chk)[](source:lvi-check) |
| `check` 결과가 `0 samples`이거나 `browserSkipped`가 `true`일 때 | 검사하지 않은 것이지 깨끗한 것이 아니다. | [](source:chk)[](source:lvi-check) |
| 3초 이상 영상에서 모든 샘플에 보이는 변화가 없을 때 | `sweep_static`으로 `check`가 실패한다. 한 샘플에서만 잡힌 발견은 info다. | [](source:chk) |
| `timeline` 편집이 이웃 clip과 겹치거나 composition 끝을 넘을 때 | 편집을 거부한다. `--overwrite`를 쓰거나 이웃을 먼저 옮기고, 끝을 넘으면 root `data-duration`을 먼저 올린다. 어떤 명령도 `data-duration`을 바꾸지 않는다. | [](source:tl) |
| 점검이 실패했거나 사람이 결과가 나빠졌다고 말할 때 | `history undo --who <you>`로 되돌린다. 손으로 고쳐 되돌리지 않는다. | [](source:hist) |
| 디스크가 모자랄 때 | `clean --dry-run` 뒤 `clean`을 쓴다. `.hyperframes`는 history를 담고 있으므로 지우지 않는다. | [](source:fail) |
| `capture`가 실패하거나 `BLOCKED.md`를 쓰거나 JSON `ok: false`일 때 | hard stop이다. 부분 파일에서 아무것도 가져오지 않고, 새 `-o` 폴더에 다시 시도한다. | [](source:fail)[](source:cap-stop) |
| agent sandbox가 Chrome 시작을 막을 때 | 막힌 사실을 알리고 점검한 composition을 넘긴다. 대체 rasterizer를 만들지 않는다. 렌더는 `--docker`, cloud, 사람에게 넘긴다. | [](source:sbx) |
| `init`을 돌릴 때 | 항상 `--skip-skills`를 붙인다. 스킬 설치는 사람의 일이고 에이전트는 `skills update`를 돌리지 않는다. | [](source:init-skip)[](source:skills) |
| `_meta.updateNotice`가 나왔을 때 | 대화당 한 번, 자연스러운 때에 사람에게 전한다. 업데이트는 사람이 정한다. | [](source:use) |
| `share --public`을 쓰려 할 때 | 사용자가 링크를 가진 누구나 보게 하려 명시했을 때만 쓴다. `--yes`는 동의가 아니다. `ready: true`여야 시청 준비로 말한다. | [](source:share) |
| 렌더가 검증된 뒤 | `feedback`을 한 건 보낸다. 공개 채널이므로 절대 경로를 지운다. `--file-issue`는 동의가 있을 때만 쓴다. telemetry가 꺼져 있으면 보내지 않는다. | [](source:fbk)[](source:fbk-ref) |
| cloud 업로드가 200 MB를 넘을 때 | `cloud render --dry-run --json`으로 확인한다. `index.html`, 폰트, 미디어 같은 파일은 크다는 이유만으로 무시하지 않는다. | [](source:cloud-size) |
| `lambda`나 `cloudrun`을 고를 때 | 사용자가 AWS나 GCP 소유를 명시했을 때만 쓴다. | [](source:lambda)[](source:cloudrun) |
| `validate`, `inspect`, `layout`을 쓰려 할 때 | `check`의 deprecated 별칭이므로 돌리지 않는다. | [](source:alias) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- `check` 감사 항목과 escape hatch — `check 통과?` · 개요는 통과 여부만 담았다. 항목별 error·warning 코드, `data-layout-allow-*`, `*.motion.json` sidecar, craft 수치(0.4초, 3초, 2.6% 등)가 있다.
- `snapshot` 옵션과 증거 보관 — `snapshot 확인` · `--at`, `--range`, `--review`, `--zoom`, 저장 정리 규칙이 있다.
- Studio selection 읽기 — `preview 승인` · `preview --context`와 `no-selection`, 실패 코드 표가 있다.
- `render` 플래그와 batch — `render 실행` · quality, format, fps, resolution 표와 `--batch` 규칙이 있다.
- 렌더 위치 선택 — `render 실행` · Docker, cloud, `lambda`, `cloudrun`의 인증·비용·재시도·상태 파일 규칙이 있다.
- `timeline` 편집과 `--plan`, `apply`, `undo` — 흐름 밖 · 편집 규칙을 개요는 거부 조건만 담았다.
- project history 사용법 — 흐름 밖 · `history begin`, `history end`, `--since mine`의 trial 블록이다.
- 명령 실패 복구 표와 `doctor` — 흐름 밖 · 증상별 처방과 FFmpeg 설정이 있다.
- feedback 보고 형식 — `feedback 보내기` · 재현 packet, `COMPOSITION_STRUCTURE:`, 개인정보 규칙이 있다.
- `share`와 `publish` — 흐름 밖 · audience 선택, 무료 project 5개 한도, legacy 60일 창이 있다.
- `init`, `capture`, `skills` — 흐름 밖 · 해상도 preset, Tailwind 규칙, capture 예산이 있다.
- 나머지 명령 모음 — 흐름 밖 · `compare`, `grade-compare`, `beats`, `usage`, `upgrade`, `telemetry`가 있다.

@callout level=open-question title="확인하지 못한 것"
| 시작 beacon 충돌: SKILL.md 8줄은 `npx hyperframes events --skill=hyperframes-cli`를 시작 때 한 번 돌리라고 하고, 33줄은 `events`를 "Don't run them"에 함께 묶는다. 어느 쪽이 우선인지 원문에 명시 없음. 이 개요는 둘 다 흐름에 넣지 않았다. |
| lint 오류가 있을 때 `check`가 layout·contrast를 돌리는지: SKILL.md 38줄과 reference 44줄이 다르다. 우선순위는 원문에 명시 없음. |
| `../hyperframes/references/`의 `captions.md`, `motion.md`, `format.md`, `plugin-installation.md`는 읽지 않았다. 부분 분석이다. |
| CLI 내부 구현은 확인하지 않았다. 명령 동작은 원문의 서술이다. |

읽은 원본: 텍스트 파일 13개. 제외: 번역본 `*.KO.md` 13개(근거가 아님).
