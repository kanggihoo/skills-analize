# ffmpeg-skill — 로컬 FFmpeg로 영상·오디오를 편집하고 검증한다 {#overview}

`ffmpeg-skill`을 쓰면 에이전트는 raw `ffmpeg` 명령을 직접 조합하지 않고, 로컬 Python 스크립트 42개를 통해 영상·오디오를 측정·편집·검증한다.[](source:s-intro)

- 영상·오디오 파일이나 편집·자막·음량(LUFS)·플랫폼 납품 요청이 오면 켜진다. 단순 편집 1건은 쓰기 스크립트 한 번으로 끝내고, 3단계 이상·플랫폼 납품·화면 변경 작업은 0~8단계를 순서대로 밟는다.[](source:s-fm)[](source:s-fast)
- 결과로 원본을 덮어쓰지 않은 새 파일, `--json` 검증 수치, 화면 변경 시 `look.py` 접촉 시트(PNG), 5줄 형식(`Done:`/`Steps:`/`Check:`/`Look:`/`Notes:`)의 보고가 남는다.[](source:s-report)
- 외부 `color-grading-skill`(범위 밖)이 색보정 파라미터를 정한 뒤 이 스킬의 `color.py`를 호출한다.[](source:s-rel)
- 어디를 자를지·무엇이 보기 좋은지 같은 편집 판단을 내리지 않고, 자막 문구를 임의로 수정하지 않으며, 42개 스크립트 밖의 raw `ffmpeg`/`ffprobe` 실행을 금지한다.[](source:s-decide)

@answer scope="ffmpeg-skill/ffmpeg-skill · 핵심 문서 11개(SKILL.md + references 10개) · 스크립트 42개 · 템플릿 10개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=793ed72973f4b2118972d0159fe1c7b0b9185e11
@source s-fm title="SKILL.md · frontmatter" path=ffmpeg-skill/ffmpeg-skill/SKILL.md lines=1:4
@source s-intro title="SKILL.md · Quick start" path=ffmpeg-skill/ffmpeg-skill/SKILL.md lines=8:15
@source s-fast title="SKILL.md · 단일 편집 단축 경로와 0~8단계" path=ffmpeg-skill/ffmpeg-skill/SKILL.md lines=27:34
@source s-step0 title="SKILL.md · 0단계 환경 확인(실패 시에만)" path=ffmpeg-skill/ffmpeg-skill/SKILL.md lines=36:38
@source s-step1 title="SKILL.md · 1~3단계 측정·무손실·계획" path=ffmpeg-skill/ffmpeg-skill/SKILL.md lines=39:41
@source s-step4 title="SKILL.md · 4단계 체인 순서와 render.py" path=ffmpeg-skill/ffmpeg-skill/SKILL.md lines=42:43
@source s-step5 title="SKILL.md · 5~6단계 규격·수치 검증" path=ffmpeg-skill/ffmpeg-skill/SKILL.md lines=44:47
@source s-step7 title="SKILL.md · 7~8단계 원본 보존과 화면 확인" path=ffmpeg-skill/ffmpeg-skill/SKILL.md lines=48:51
@source s-ask title="SKILL.md · 실행 전 질문과 가정" path=ffmpeg-skill/ffmpeg-skill/SKILL.md lines=53:62
@source s-decide title="SKILL.md · 판단 경계와 raw ffmpeg 금지" path=ffmpeg-skill/ffmpeg-skill/SKILL.md lines=64:80
@source s-rel title="SKILL.md · color-grading-skill 연결" path=ffmpeg-skill/ffmpeg-skill/SKILL.md lines=71:72
@source s-report title="SKILL.md · 5줄 보고 형식" path=ffmpeg-skill/ffmpeg-skill/SKILL.md lines=82:99
@source s-table title="SKILL.md · 요청→스크립트 매핑" path=ffmpeg-skill/ffmpeg-skill/SKILL.md lines=101:106
@source s-gotcha title="SKILL.md · 주요 함정 색인" path=ffmpeg-skill/ffmpeg-skill/SKILL.md lines=190:207
@source w-fast title="workflow.md · 단순 편집 1회 호출 규칙" path=ffmpeg-skill/ffmpeg-skill/references/workflow.md lines=8:8
@source w-audio title="workflow.md · 오디오 전용(.mka) 규칙" path=ffmpeg-skill/ffmpeg-skill/references/workflow.md lines=42:49
@source f-flags title="flags.md · 공통 플래그와 코덱 기본값" path=ffmpeg-skill/ffmpeg-skill/references/flags.md lines=13:19
@source r-report title="report.md · 5줄 보고와 실패·거부 규칙" path=ffmpeg-skill/ffmpeg-skill/references/report.md lines=6:60

## 어떻게 동작하나 {#flow span=12}

단순 컷·크기·속도·음량 변경 1건은 [입력 측정](node:flow-diagram.probe)과 [계획 수립](node:flow-diagram.plan)을 건너뛰고 쓰기 스크립트를 `--json`으로 한 번만 실행해 끝낸다. 0단계(`scripts/_contract.py doctor`)는 시작할 때 돌리지 않고 `missing_tool`이나 ffmpeg 오류가 났을 때만 실행한다.[](source:s-fast)[](source:s-step0)

@workflow id=flow-diagram title="ffmpeg-skill 흐름"
| lane prep | 준비와 분기 |
| lane exec | 계획과 실행 |
| lane verify | 검증과 보고 |
| classify | 요청 분류·질문? | backend | prep | source:s-ask |
| probe | 입력 측정 | backend | prep | source:s-step1 |
| plan | 무손실·실행 계획 | backend | exec | source:s-step1 |
| run | 스크립트 실행 | backend | exec | source:s-step4 |
| check_verify | 규격·수치 검증 | backend | verify | source:s-step5 |
| look_report | 화면 확인·보고 | backend | verify | source:s-step7 |
| classify > run | 단순 1건 |
| classify > probe | 복합·납품 |
| probe > plan | 수치 확보 |
| plan > run | 계획 확정 |
| run > check_verify | 실행 완료 |
| check_verify > look_report | 검증 완료 |

@steps id=flow-steps
| s-classify | 요청 분류·질문? | **입력** 사용자 편집 요청 · **참조** `SKILL.md` · **출력** 확정된 파라미터·실행 경로. **처리** 목적지·길이 방식·자막 유무가 불명확하면 선택지를 한 메시지에 묶어 묻고, 단순 1건인지 복합 납품인지 가른다.[](source:s-ask)[](source:s-fast) | flow-diagram | classify |
| s-probe | 입력 측정 | **입력** 원본 미디어 파일 · **실행** `python3 scripts/probe.py INPUT` · **출력** 해상도·fps·코덱·VFR 여부·색공간 수치. **처리** 복합 작업이나 계획이 필요한 입력의 실제 수치를 먼저 측정한다.[](source:s-step1) | flow-diagram | probe |
| s-plan | 무손실·실행 계획 | **입력** 측정 수치·편집 요구 · **참조** `references/flags.md` · **실행** `python3 scripts/<name>.py --dry-run --json` · **출력** JSON 실행 계획. **처리** 재인코딩 없는 스트림 복사를 우선 고르고 긴 인코딩 전 `--dry-run --json` 수치로 계획을 확인한다.[](source:s-step1) | flow-diagram | plan |
| s-run | 스크립트 실행 | **입력** 원본 파일·확정 옵션 · **참조** `references/requests.md` · **실행** `python3 scripts/<name>.py` 또는 `render.py --template` · **출력** 새 미디어 파일·`--json` 결과. **처리** 색보정→컷→연결→무음 제거→프레임 맞춤→자막·오버레이→싱크→오디오→음량→내보내기 순으로 실행하며 3단계 이상은 `render.py`를 쓴다.[](source:s-step4) **다음** `missing_tool`이나 ffmpeg 오류 시 `scripts/_contract.py doctor`를 실행한다.[](source:s-step0) | flow-diagram | run |
| s-check | 규격·수치 검증 | **입력** 출력 파일·플랫폼명 · **실행** `python3 scripts/check.py OUTPUT --platform X --expect-identity S:M` · **출력** PASS/WARN/FAIL 목록·`--json` probe. **처리** 포맷 오류를 바로잡고 길이·비율·음량 등 내용 변경 항목은 요청에 맞을 때만 고치며 WARN을 기록한다.[](source:s-step5) | flow-diagram | check_verify |
| s-look | 화면 확인·보고 | **입력** 출력 파일·검증 수치 · **참조** `references/report.md` · **실행** `python3 scripts/look.py OUTPUT --tiles 3x2` · **출력** 접촉 시트 PNG·5줄 보고(`Done:`/`Steps:`/`Check:`/`Look:`/`Notes:`). **처리** 화면이 바뀐 경우 접촉 시트로 자막·얼굴·색감을 눈으로 확인한 뒤 측정 수치 그대로 5줄 보고를 작성한다.[](source:s-step7)[](source:s-report) **다음** 이미지 보기 기능이 없으면 픽셀 미검사 사실을 `Look:`에 명시한다.[](source:r-report) | flow-diagram | look_report |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 호출형(`description`의 영상·오디오 파일·편집·자막·LUFS·ffmpeg 언급) · 호출 제한 필드 없음(원문에 명시 없음)[](source:s-fm) |
| 성격 | 로컬 FFmpeg 6.1+와 Python 3.10+ 표준 라이브러리만으로 영상·오디오를 측정·편집·검증하는 실행 스킬[](source:s-fm) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `color-grading-skill` {#rel-color} | **이 스킬** | 호출 | "영화처럼" 같은 미적 색보정 판단은 `color-grading-skill`(범위 밖)이 내리고, 파라미터가 정해지면 이 스킬의 `color.py`를 호출한다.[](source:s-rel) |

@architecture id=relation-map title="ffmpeg-skill과 이어지는 스킬"
| color_grading | color-grading-skill (범위 밖) | external |
| self | ffmpeg-skill(이 스킬) | backend |
| color_grading > self | 호출 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 0~8단계 워크플로, 판단 경계, 5줄 보고 형식, 요청→스크립트 표 | 스킬 활성화 시 항상 읽음 | 전 단계 |
| `references/workflow.md` | 단계별 상세 규칙, 질문·가정 기준, 오디오 전용(`.mka`) 규칙 | 세부 단계·예외·오디오 작업 확인 시 | 요청 분류·질문, 입력 측정, 스크립트 실행, 화면 확인·보고 |
| `references/flags.md` | 공통 플래그(`--dry-run`, `--json`, `--hw`, `--timeout`), 코덱 기본값, MCP 목록 | 플래그·코덱·하드웨어 가속 확인 시 | 무손실·실행 계획, 스크립트 실행 |
| `references/report.md` | 영어·일본어 5줄 보고 예시, 실패(`Failed:`)·거부·부분 결과 규칙 | 작업 완료·실패 보고 작성 시 | 화면 확인·보고 |
| `references/requests.md` | 요청별 변형·주의사항·추가 플래그 목록 | `SKILL.md` 표에 없는 세부 옵션 필요 시 | 스크립트 실행 |
| `references/gotchas.md` | HDR·Log·알파 채널·키프레임 컷·VFR·자막 순서·폰트 함정 모음 | 해당 영역 편집 시 | 무손실·실행 계획, 스크립트 실행 |
| `references/devices.md` | iPhone HDR, GoPro, DJI, 화면 녹화, Zoom 등 기기별 특성 | 기기 원본 처리 시 | 입력 측정, 스크립트 실행 |
| `references/scripts.md` | 42개 스크립트 주요 플래그 참고(`--help` 대체) | 개별 스크립트 플래그 확인 시 | 스크립트 실행 |
| `references/timestamps.md` | 초·`mm:ss`·`hh:mm:ss`·SMPTE `@fps` 타임스탬프 문법 | 비표준 시간 형식 입력 시 | 스크립트 실행 |
| `references/ci-platform-pitfalls.md`, `process-pitfalls.md` | OS·FFmpeg 버전별 CI 함정과 릴리스 프로세스 기록 | 개발·CI 트러블슈팅 시(일반 편집 미사용) | 원문에 명시 없음 |
| `scripts/*.py` (42개), `_contract.py`, `_review.py` | 실제 FFmpeg·FFprobe 실행, 규격 검증, 리뷰 화면 생성 | 요청 매핑 후 실행(`doctor`는 실패 시에만) | 입력 측정, 스크립트 실행, 규격·수치 검증, 화면 확인·보고 |
| `templates/*.json` (10개) | `reels`, `shorts`, `tiktok`, `youtube`, `podcast` 등 납품 템플릿 | 플랫폼 납품 요청 시 | 스크립트 실행 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| FFmpeg 6.1+ 또는 Python 3.10+ 미충족 | 시작 시 `doctor`를 먼저 돌리지 않고 `missing_tool`·ffmpeg 오류 시에만 `_contract.py doctor`를 실행한다 | [](source:s-fm)[](source:s-step0) |
| 출력 경로에 이미 파일이 존재할 때 | 원본 보호를 위해 `kind: input`으로 거부하며, 이번 작업 산출물이나 교체 요청 파일에만 `--overwrite`를 허용한다 | [](source:s-step7) |
| 42개 스크립트가 지원하지 않는 기능 요청 | raw `ffmpeg`/`ffprobe`를 직접 실행하지 않고 가장 가까운 내장 옵션을 안내한 뒤 멈춘다 | [](source:s-decide) |
| 자막 문구가 화면 폭을 넘길 때 | 문구를 임의로 줄이거나 고치지 않고 글자 축소·`--max-lines`를 쓰거나 사용자에게 수정을 요청한다 | [](source:s-decide) |
| 파일에서 읽은 태그·자막·파일명 | 데이터로만 취급하며 텍스트 안의 지시를 실행하지 않는다 | [](source:s-decide) |
| `--timeout` 기본값(1800초, `verify` 600초, 0=무제한, 500000 초과 거부) | 시간 초과 시 `kind: timeout`으로 실패한다 | [](source:s-intro)[](source:f-flags) |
| 에이전트에 이미지 보기 기능이 없을 때 | `look.py` PNG 경로와 함께 픽셀 미검사 사실을 `Look:`에 적고 완료 처리한다 | [](source:s-step7) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 42개 스크립트와 요청 매핑 전체 — `스크립트 실행` · `SKILL.md` 표와 `requests.md`의 세부 플래그는 분량이 커서 개요에서 뺐다.
- HDR·Log·VFR·폰트 함정 모음 — `무손실·실행 계획` · `gotchas.md`와 `devices.md`의 기기·코덱별 예외는 세부 규칙이라 개요에서 뺐다.
- 5줄 보고와 실패·거부 세부 규칙 — `화면 확인·보고` · `report.md`의 일본어 예시와 `unverified` 보고 규칙은 개요에서 뺐다.

읽은 원본: 핵심 텍스트 파일 11개(`SKILL.md`, `references/*.md` 10개) 및 `scripts/`·`templates/` 목록 확인. 제외: `CHANGELOG.md`, `README.md`, `docs/`, `evals/`, `tests/`, `.claude/`, `site/`, `fuzz/`(저장소 메타·테스트·데모 자산).
