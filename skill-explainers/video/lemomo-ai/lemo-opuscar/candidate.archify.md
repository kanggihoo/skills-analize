# lemo-opuscar — 외부 스타일 라이브러리를 받아 영상을 만든다 {#overview}

`lemo-opuscar`는 에이전트가 외부 Lemo-Opuscar 스타일 라이브러리를 sparse clone(필요한 폴더만 내려받는 git 복제)으로 설치하고, 이후 연출·제작·전달 지침을 그 라이브러리의 안내 문서로 넘기는 입구 스킬이다.[](source:s-fm)[](source:s-intro) **부분 분석**: `setup.sh`가 내려받는 외부 저장소(`github.com/lemomo-ai/lemo-opuscar`)의 `AGENTS.md`, `DIRECTOR.md`, `TECHNIQUE.md`, `STYLE.md`가 이 저장소에 없어 실제 연출·렌더 절차는 확인하지 못했다.[](source:s-intro)[](source:s-follow)

- 사용자가 유화·수채화·우키요에·제품 분해·자료 영상 다큐멘터리 등 이름 붙은 스타일의 단편 영상을 요청하거나 빈 입력으로 부르면 모델이 `description`으로 판단해 켠다.[](source:s-fm)
- 결과로 로컬 라이브러리(`~/lemo-opuscar` 등)와 의존성 환경(`.venv`, `node_modules`)이 준비되고, 최종 영상 산출물은 사용자가 시작한 폴더 아래 `<name>/`에 남긴다.[](source:s-intro)[](source:s-mode)
- 다른 스킬과의 관계: `explainer-default`와 코드로 설명·홍보 영상을 만드는 `대안` 관계다.[](source:s-fm)[](source:rel-edef)
- 사용자의 기존 영상 파일을 단순 편집·자르기·변환하는 작업은 다루지 않으며, 누락된 시스템 도구(Node 20+, ffmpeg 7+, Python 3.11+)를 에이전트가 직접 설치하지 않고 사용자에게 보고한다.[](source:s-fm)[](source:s-deps)

@answer scope="video/lemomo-ai/lemo-opuscar · 원본 파일 2개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=f53b74e8bae4a9f9a8a11d2d3d0dc2b980b855ed
@source s-fm title="frontmatter: name, description" path=video/lemomo-ai/lemo-opuscar/SKILL.md lines=1:4
@source s-intro title="외부 라이브러리 안내와 1단계 라이브러리 확보" path=video/lemomo-ai/lemo-opuscar/SKILL.md lines=6:10
@source s-deps title="2단계 핵심 도구·계층별 의존성 설치" path=video/lemomo-ai/lemo-opuscar/SKILL.md lines=11:11
@source s-follow title="3단계 외부 AGENTS.md 위임" path=video/lemomo-ai/lemo-opuscar/SKILL.md lines=12:12
@source s-mode title="스킬 모드 경로 규약과 DIRECTOR.md §11 전달" path=video/lemomo-ai/lemo-opuscar/SKILL.md lines=14:24
@source sh-lib title="setup.sh: 라이브러리 경로 탐지와 sparse clone·갱신" path=video/lemomo-ai/lemo-opuscar/scripts/setup.sh lines=1:46
@source sh-deps title="setup.sh: deps(core, voice, music) 잠금·설치" path=video/lemomo-ai/lemo-opuscar/scripts/setup.sh lines=69:115
@source sh-demo title="setup.sh: demo slug 추가와 시스템 도구 점검" path=video/lemomo-ai/lemo-opuscar/scripts/setup.sh lines=115:150
@source rel-edef title="explainer-default의 코드 기반 설명 영상 목적" path=video/Barty-Bart/explainer-default/SKILL.md lines=1:4

## 어떻게 동작하나 {#flow span=12}

에이전트는 먼저 셸 스크립트로 외부 라이브러리를 받고 도구 설치를 백그라운드로 띄운 뒤, 그 라이브러리 안의 `AGENTS.md`와 `DIRECTOR.md`를 읽어 제작을 이어간다.[](source:s-intro)[](source:s-deps)[](source:s-follow) 데모 소스는 기본적으로 내려받지 않으며, `TREATMENT.md`(연출 계획) 작성 후 기법 참고용으로 `setup.sh demo <slug>`를 추가한다(단 Edit & Documentary 스타일은 도구 사용을 위해 treatment 전에 받는다).[](source:s-mode)

@workflow id=flow-diagram title="lemo-opuscar 흐름"
| lane setup | 라이브러리·도구 준비 |
| lane delegate | 외부 지침 위임 |
| get-lib | 1. 라이브러리 확보 | backend | setup | source:s-intro |
| install-deps | 2. 핵심 도구 설치 | backend | setup | source:s-deps |
| follow-lib | 3. 라이브러리 지침 따르기 | backend | delegate | source:s-follow |
| demo-fetch | 데모 소스 추가(선택) | backend | delegate | source:s-mode |
| deliver | 산출물 전달 | backend | delegate | source:s-mode |
| get-lib > install-deps | LIB 경로 확인 |
| install-deps > follow-lib | core 설치 시작 |
| follow-lib > demo-fetch | 기법 참고·도구 필요 시 | dashed |
| demo-fetch > deliver | 제작 완료 |
| follow-lib > deliver | 데모 불필요 시 |

@steps id=flow-steps
| s-get-lib | 1. 라이브러리 확보 | **입력** `$LEMO_OPUSCAR_HOME` 또는 현재 git 저장소 상태 · **참조** `scripts/setup.sh` · **실행** `sh "<skill base directory>/scripts/setup.sh"` · **출력** 로컬 라이브러리 경로(`LIB=<path>`)와 누락 시스템 도구 목록. **처리** `lemomo-ai/lemo-opuscar` 저장소를 데모·갤러리·큰 이미지 없이 sparse clone하거나 최신 `main`으로 갱신한다.[](source:s-intro)[](source:sh-lib)[](source:sh-demo) | flow-diagram | get-lib |
| s-install-deps | 2. 핵심 도구 설치 | **입력** `LIB` 경로와 제작할 스타일 요구사항 · **참조** `scripts/setup.sh` · **실행** `sh "<skill base directory>/scripts/setup.sh" deps` · **출력** `node_modules/`, Playwright `chromium-headless-shell`, Python `.venv` core 계층. **처리** 백그라운드로 핵심 패키지를 설치하고, `voice`(TTS)나 `music`(`pluck.py`) 계층은 `$LIB/TECHNIQUE.md` §1상 필요할 때만 추가한다.[](source:s-deps)[](source:sh-deps) **다음** 누락된 Node·ffmpeg·Python은 한 번의 질문 라운드에서 사용자에게 보고한다.[](source:s-deps) | flow-diagram | install-deps |
| s-follow-lib | 3. 라이브러리 지침 따르기 | **입력** `$LIB/AGENTS.md`와 사용자 요청 · **출력** 스타일 선택, 한 번의 질문 응답, `TREATMENT.md`, 프로젝트 폴더(`<name>/`). **처리** `$LIB/AGENTS.md`의 **Start**(`~/lemo-my-styles/` 포함)부터 읽어 스타일을 정하고, 스킬 모드 경로 규약(`/core/lib.js`, `/@film/`, `$LIB/…`)에 맞춰 제작한다.[](source:s-follow)[](source:s-mode) **다음** `✦` 표시 스타일이면 사용자 제공 이미지 생성기를 요구하고, 스타일별 패키지는 프로젝트 폴더에 직접 설치한다.[](source:s-deps) | flow-diagram | follow-lib |
| s-demo-fetch | 데모 소스 추가(선택) | **입력** 스타일 `<slug>` · **참조** `scripts/setup.sh` · **실행** `sh "<skill base directory>/scripts/setup.sh" demo <slug>` · **출력** `$LIB/styles/<slug>/demo/`와 `poster.jpg`. **처리** `TREATMENT.md` 작성 후 기법을 참고하거나, Edit & Documentary 스타일일 때 `demo/tools/`를 쓰기 위해 데모 소스를 sparse checkout에 추가한다.[](source:s-mode)[](source:sh-demo) | flow-diagram | demo-fetch |
| s-deliver | 산출물 전달 | **입력** 완성된 `<name>/` 프로젝트와 `$LIB/DIRECTOR.md` §11 · **출력** 최종 영상 산출물과 위치 안내. **처리** `$LIB/DIRECTOR.md` §11이 정한 산출물을 프로젝트 폴더에 내고 사용자에게 위치를 알린다.[](source:s-mode) | flow-diagram | deliver |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 요청 또는 모델 판단(`description` 일치 시 자동 선택). 호출 제한 필드 없음.[](source:s-fm) |
| 성격 | 절차형(외부 라이브러리 부트스트랩 및 위임). 로컬 환경만 준비하고 실제 연출·제작 규칙은 외부 `lemomo-ai/lemo-opuscar` 저장소에 맡긴다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `explainer-default` {#rel-r13} | **이 스킬** | 대안 | 둘 다 코드로 설명·홍보 영상을 만든다. `lemo-opuscar`는 외부 라이브러리의 이름 붙은 스타일을 고르는 방식이다.[](source:s-fm)[](source:rel-edef) |

@architecture id=relation-map title="lemo-opuscar와 이어지는 스킬"
| edef | explainer-default | backend |
| self | lemo-opuscar(이 스킬) | backend |
| edef > self | 대안 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 라이브러리 설치·의존성 지시, 스킬 모드 경로 규약, 외부 문서 위임 본문 24줄 | 스킬이 켜질 때 읽는다 | 1. 라이브러리 확보, 2. 핵심 도구 설치, 3. 라이브러리 지침 따르기, 데모 소스 추가(선택), 산출물 전달 |
| `scripts/setup.sh` | sparse clone·갱신, 잠금 기반 `deps` 설치, `demo` 추가, 도구 버전 점검 150줄 | 1단계·2단계·데모 추가 시 `sh`로 실행한다 | 1. 라이브러리 확보, 2. 핵심 도구 설치, 데모 소스 추가(선택) |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 사용자의 기존 영상 단순 편집·자르기·변환 요청일 때 | 이 스킬의 대상이 아니다. | [](source:s-fm) |
| 시스템 도구(Node 20+, ffmpeg 7+, Python 3.11+ 또는 `uv`)가 없을 때 | 에이전트가 직접 설치하지 않고 한 번의 질문 라운드에서 사용자에게 보고한다. | [](source:s-deps)[](source:sh-demo) |
| `$LIB` 폴더가 비어 있지 않고 Lemo-Opuscar 라이브러리가 아닐 때 | `setup.sh`가 오류를 내고 멈추며 `LEMO_OPUSCAR_HOME` 변경을 요구한다. | [](source:sh-lib) |
| 다른 세션이 이미 `setup.sh deps`를 실행 중일 때 | `.lemo-deps.lock`으로 최대 30분(1800초)까지 대기하며 동시 설치를 막는다. | [](source:sh-deps) |
| `demo` 소스를 내려받을 때 | Edit & Documentary 스타일이 아니면 `TREATMENT.md` 작성 전에는 받지 않으며, 받은 데모는 렌더링용이 아니라 참고용으로만 쓴다. | [](source:s-mode) |
| 페이지·스크립트 경로를 작성할 때 | 프로젝트 폴더는 소문자·숫자·하이픈만 쓰고 `#`·`?`를 피하며, `build.sh`에서는 `../..` 대신 `$LIB/…`를 쓴다. | [](source:s-mode) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- `scripts/setup.sh` 내부 잠금·체크섬·Windows shim 동작 — 맡을 개요 항목: 1. 라이브러리 확보, 2. 핵심 도구 설치 · 플랫폼별 venv 처리와 `cksum` 기반 재설치 조건을 개요에서 줄였다.

@callout level=open-question title="확인하지 못한 것"
| 내려받는 외부 저장소(`lemomo-ai/lemo-opuscar`) 안의 `AGENTS.md`, `DIRECTOR.md` §11, `TECHNIQUE.md` §1, 각 `STYLE.md` 목록과 세부 제작 규칙은 이 저장소에 없어 확인하지 못했다.[](source:s-deps)[](source:s-follow)[](source:s-mode) |

읽은 원본: 텍스트 파일 2개(`SKILL.md`, `scripts/setup.sh`). 제외: 없음.