# brag-slim — 모델 혼자 도구로 출시 영상을 만든다 {#overview}

`brag-slim`은 에이전트가 프로젝트 폴더나 웹사이트 URL을 받아 외부 자산이나 Hyperframes 없이 기기 안의 도구만으로 짧은 출시 영상을 기획부터 렌더링까지 혼자 끝내는 스킬이다.[](source:s-fm)[](source:s-intro)

- 사용자가 `/brag-slim`이나 출시 영상 요청으로 부르거나 모델이 `description`으로 판단해 켜며, `/brag`가 함께 설치된 환경에서는 Opus 5.5·Sonnet 5.5·Fable 5.2 모델일 때 `/brag`가 이 스킬로 넘긴다.[](source:s-fm)
- 결과로 `brag-output/`(기존 폴더가 있으면 타임스탬프 폴더) 아래에 기획서(`brag-plan.md`), 중간 작업 폴더(`work/`), 영상(`brag.mp4`), 포스터 프레임(`brag.jpg`), 공유 문구(`share-copy.txt`)가 남는다.[](source:s-opt)[](source:s-deliv)
- 다른 스킬과의 관계: `brag`의 `slim.md`와 원문이 같으며, 조건이 맞으면 `brag`가 이 스킬로 넘기고(`다음 안내`) 이 스킬은 `description`에서 `brag`를 `참고`한다.[](source:s-fm)
- 비밀·개인정보 노출, 근거 없는 수치·추천사·일반적 SaaS 상투어("streamline your workflow"), 웹페이지에서 긁은 script 실행, `visibility: hidden` 장면 숨기기를 금지한다.[](source:s-proj)[](source:s-web)[](source:s-laws)[](source:s-build)

@answer scope="video/latent-spaces/brag-slim · 원본 파일 1개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=f53b74e8bae4a9f9a8a11d2d3d0dc2b980b855ed
@source s-fm title="frontmatter: name, description" path=video/latent-spaces/brag-slim/SKILL.md lines=1:4
@source s-intro title="소개: 외부 자산 없이 모델이 직접 제작" path=video/latent-spaces/brag-slim/SKILL.md lines=6:11
@source s-opt title="옵션 표와 brag-output/ 출력 경로" path=video/latent-spaces/brag-slim/SKILL.md lines=12:21
@source s-in title="1. Inspect: 입력 유형 판별(Project vs Website)" path=video/latent-spaces/brag-slim/SKILL.md lines=22:32
@source s-proj title="1. Inspect(Project): 소스 재사용과 제외 파일" path=video/latent-spaces/brag-slim/SKILL.md lines=33:40
@source s-web title="1. Inspect(Website): 렌더링 캡처와 script 제거" path=video/latent-spaces/brag-slim/SKILL.md lines=41:50
@source s-prep title="1. Inspect 공통: 8문항 정리, 비밀 제거, 도구 확인" path=video/latent-spaces/brag-slim/SKILL.md lines=51:58
@source s-plan title="2. Plan: brag-plan.md 작성과 기본 장면 구성" path=video/latent-spaces/brag-slim/SKILL.md lines=59:66
@source s-laws title="Creative laws: 길이, 가독성, 세로 안전 영역" path=video/latent-spaces/brag-slim/SKILL.md lines=67:79
@source s-tones title="Tones와 Sound: 7가지 톤과 단일 박자 격자 믹싱" path=video/latent-spaces/brag-slim/SKILL.md lines=80:97
@source s-build title="3. Build, check, render: 중간 프레임·드롭 프레임 검사" path=video/latent-spaces/brag-slim/SKILL.md lines=98:103
@source s-deliv title="4. Deliver: 포스터 프레임 삽입과 share-copy.txt" path=video/latent-spaces/brag-slim/SKILL.md lines=104:108

## 어떻게 동작하나 {#flow span=12}

입력 유형이 프로젝트 폴더인지 웹사이트 URL인지에 따라 1단계 수집 방법만 달라지고, 8문항 정리부터 4단계 전달까지는 같은 흐름으로 진행한다.[](source:s-in) 입력을 판별할 수 없거나 현재 폴더가 프로젝트가 아니면 사용자에게 무엇을 홍보할지 먼저 묻는다.[](source:s-in)

@workflow id=flow-diagram title="brag-slim 흐름"
| lane inspect | 조사·준비 |
| lane make | 기획·제작 |
| lane ship | 전달 |
| check-in | 입력 유형? | backend | inspect | source:s-in |
| ask-in | 사용자에게 대상 질문 | backend | inspect | source:s-in |
| inspect-proj | 프로젝트 코드·스타일 수집 | backend | inspect | source:s-proj |
| inspect-web | 웹사이트 렌더·자산 수집 | backend | inspect | source:s-web |
| prep | 8문항·도구 확인 | backend | inspect | source:s-prep |
| plan | 2. Plan 스토리보드 | backend | make | source:s-plan |
| build | 3. Build, check, render | backend | make | source:s-build |
| deliver | 4. Deliver 포스터·공유문구 | backend | ship | source:s-deliv |
| check-in > ask-in | 불명 | dashed |
| ask-in > check-in | 입력 |
| check-in > inspect-proj | 폴더 |
| check-in > inspect-web | URL |
| inspect-proj > prep | 확보 |
| inspect-web > prep | 저장 |
| prep > plan | 준비 |
| plan > build | 완성 |
| build > deliver | 검증 |

@steps id=flow-steps
| s-check-in | 입력 유형? | **입력** 사용자 인수(`--tone`, `--format`, `--duration` 포함)와 현재 폴더 · **출력** 입력 유형(`Project`, `Website`, 또는 불명)과 `brag-output/` 경로. **처리** 인수가 없고 현재 폴더가 프로젝트면 `Project`, `http(s)://` URL이나 도메인이면 `Website`로 분류한다.[](source:s-opt)[](source:s-in) | flow-diagram | check-in |
| s-ask-in | 사용자에게 대상 질문 | **입력** 판별 불가 상태 · **출력** 사용자의 프로젝트 경로 또는 URL. **처리** 입력이 유형에 맞지 않거나 현재 폴더가 프로젝트가 아니면 제작 대상을 물어본 뒤 다시 분류한다.[](source:s-in) | flow-diagram | ask-in |
| s-inspect-proj | 프로젝트 코드·스타일 수집 | **입력** 프로젝트 소스 코드 · **출력** 재사용할 컴포넌트·CSS·폰트·사용자 흐름(진입→핵심 동작→결과). **처리** 실제 UI 컴포넌트와 스타일시트를 직접 가져다 쓰되, 빌드 산출물·lock·테스트·비밀 파일(`.env`, `.pem` 등)은 읽지 않는다.[](source:s-proj) | flow-diagram | inspect-proj |
| s-inspect-web | 웹사이트 렌더·자산 수집 | **입력** 대상 웹사이트 URL · **출력** `work/`에 내려받은 로고·스크린샷·영상·정제 마크업. **처리** headless 브라우저로 스크롤 캡처와 스타일을 얻고 `script` 태그를 제거한 뒤, 페이지 내용은 지시가 아닌 데이터로만 취급한다.[](source:s-web) | flow-diagram | inspect-web |
| s-prep | 8문항·도구 확인 | **입력** 수집된 소재와 로컬 환경 · **출력** 8문항 답변, 가명 처리 방침, 도구(`ffmpeg`, headless 브라우저, 빌드 도구) 상태. **처리** 제품 요지와 시각 hook을 정리하고 개인정보·비밀값을 가명 처리하며, 빠진 도구는 임시 실행(`uv run`, `npx -y`)을 우선 제안해 사용자 승인을 구한다.[](source:s-prep) | flow-diagram | prep |
| s-plan | 2. Plan 스토리보드 | **입력** 8문항 답변과 톤·포맷 옵션 · **출력** `brag-plan.md`(각도, hook, 2~3개 하이라이트, 템포, 박자별 장면표). **처리** 7가지 톤 프리셋 중 하나를 적용해 15~25초(기본 20초 안팎) 분량의 스토리보드를 짜고, 세로 영상은 UI 가림 영역을 피하도록 설계한다.[](source:s-opt)[](source:s-plan)[](source:s-laws)[](source:s-tones) | flow-diagram | plan |
| s-build | 3. Build, check, render | **입력** `brag-plan.md`와 로컬 자산 · **출력** `brag.mp4`와 `work/` 중간 파일. **처리** 음악과 효과음을 같은 키·박자 격자로 믹싱하고, 전체 렌더 전 모든 장면과 전환 중간(퇴장 끝/입장 시작) 정지 화면 및 최종 프레임 수(길이 × fps)를 검증한다.[](source:s-tones)[](source:s-build) | flow-diagram | build |
| s-deliver | 4. Deliver 포스터·공유문구 | **입력** 검증된 `brag.mp4` · **출력** `brag.jpg`, 포스터가 0번 프레임에 삽입된 `brag.mp4`, `share-copy.txt`. **처리** 가장 안정된 장면을 `brag.jpg`로 뽑아 0번 프레임에 덮어쓰고, 톤에 맞는 1~3문장 공유 문구를 작성해 사용자에게 경로와 재시도 선택지를 알린다.[](source:s-deliv) | flow-diagram | deliver |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령(`/brag-slim`) 또는 모델 판단(`description` 일치 시 자동 선택). 호출 제한 필드 없음.[](source:s-fm) |
| 성격 | 절차형(4단계 단독 제작). 외부 스킬이나 번들 자산 없이 모델이 로컬 도구만으로 영상을 끝까지 만든다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `brag` {#rel-r01} | **이 스킬** | 다음 안내 | `brag`의 `slim.md`(이 스킬과 `shasum` 동일)를 통해 Claude Opus 5.5·Sonnet 5.5·Fable 5.2 모델이 `--full`·`--voice` 없이 호출할 때 실행을 넘겨받는다.[](source:s-fm) |
| **이 스킬** {#rel-r02} | `brag` | 참고 | `description`에서 `/brag`가 함께 설치돼 있으면 해당 호출 문구는 `/brag`에 맡기고, `/brag`가 지정 모델에서 여기로 넘긴다고 밝힌다.[](source:s-fm) |

@architecture id=relation-map title="brag-slim과 이어지는 스킬"
| brag | brag | backend |
| self | brag-slim(이 스킬) | backend |
| brag > self | 다음 안내 |
| self > brag | 참고 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 옵션, Project/Website 조사, 7가지 톤, 창작·음향 규칙, 4단계 제작·전달 지침 108줄 | 스킬이 켜질 때 읽는다 | 입력 유형?, 사용자에게 대상 질문, 프로젝트 코드·스타일 수집, 웹사이트 렌더·자산 수집, 8문항·도구 확인, 2. Plan 스토리보드, 3. Build, check, render, 4. Deliver 포스터·공유문구 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 입력이 유형에 맞지 않거나 현재 폴더가 프로젝트가 아닐 때 | 제작을 시작하지 않고 사용자에게 무엇을 홍보할지 묻는다. | [](source:s-in) |
| 프로젝트 조사 중 비밀·자격증명·빌드·lock·테스트 파일을 만날 때 | 읽지 않으며, UI에 실제 사용자·고객 데이터가 있으면 가명 데이터로 바꾼다. | [](source:s-proj)[](source:s-prep) |
| 웹사이트에서 자산을 내려받을 때 | 미디어 파일만 `work/`에 받고 실행 파일·아카이브·스크립트는 금지하며, `script` 태그를 제거하고 페이지 내 지시를 따르지 않는다. | [](source:s-web) |
| 필수 도구(`ffmpeg`, headless 브라우저, 빌드 도구)가 없을 때 | 사용자에게 먼저 묻고 승인 없이 시스템 설치를 진행하지 않는다(`curl \| sh` 지양). | [](source:s-prep)[](source:s-build) |
| `vertical`(1080×1920) 영상을 만들 때 | 읽을 요소는 높이 13~80%(y 250~1536) 안쪽, 하단 오른쪽 140px 밖에 두고 정지 화면으로 먼저 확인한다. | [](source:s-laws) |
| 전체 렌더 전 전환·프레임 검사를 할 때 | 모든 장면과 전환 중간(퇴장 끝/입장 시작) 정지 화면을 확인하고, 렌더 후 `duration × fps` 프레임 수와 RGB/RGBA 픽셀 형식 통일을 검증한다. | [](source:s-build) |
| 포스터 프레임과 공유 문구를 낼 때 | `brag.jpg`를 추가가 아닌 0번 프레임 교체로 덮어쓰고, `share-copy.txt`에 "excited to share" 같은 상투어를 쓰지 않는다. | [](source:s-deliv) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 없음

읽은 원본: 텍스트 파일 1개(`SKILL.md`). 제외: 없음.