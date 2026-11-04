# launch-video 묶음은 어떻게 이어지나 {#launch-video-group}

`brag`와 `brag-slim`은 같은 일을 하는 두 길이다. 둘 다 프로젝트를 소개하는 짧은 출시 영상을 만든다. 기본 입구는 `/brag`이고, 모델이 Claude Opus 5.5이며 `--full`이나 `--voice`를 요구하지 않았을 때만 `brag`가 `brag-slim`으로 넘긴다(r01).[](source:lv-dispatch)

- `brag`는 프로젝트 코드를 읽고 Hyperframes에 구성을 맡겨 영상을 만든다. `brag-slim`은 파일 하나로 모델이 스토리·화면·소리·렌더를 혼자 끝낸다.[](source:lv-brag-desc)[](source:lv-slim-intro)
- 넘김은 한 방향이다. `brag-slim` 본문에는 `brag`를 부르는 단계가 없고, `description`에서 "`/brag`가 있으면 그쪽에 맡긴다"고만 밝힌다(r02).[](source:lv-slim-desc)
- 음성 해설은 `brag`의 `--voice`에만 있다. `brag-slim`은 음성 해설을 하지 않는다고 `brag`가 적는다.[](source:lv-dispatch)

@answer scope="video/latent-spaces brag · brag-slim · 커밋 23e8047 · 지시상 동작 · 영상 결과는 확인하지 못함"
@meta locale=ko
@source lv-brag-desc title="video/latent-spaces/brag/SKILL.md · 9440B · frontmatter" path=video/latent-spaces/brag/SKILL.md lines=1:4
@source lv-dispatch title="brag/SKILL.md · 호출 분기(Model check)" path=video/latent-spaces/brag/SKILL.md lines=10:12
@source lv-brag-opts title="brag/SKILL.md · 옵션 표" path=video/latent-spaces/brag/SKILL.md lines=40:54
@source lv-brag-out title="brag/SKILL.md · 출력 폴더 규칙" path=video/latent-spaces/brag/SKILL.md lines=70:82
@source lv-brag-assets title="brag/SKILL.md · 번들 자산 위치" path=video/latent-spaces/brag/SKILL.md lines=84:86
@source lv-brag-hf title="brag/SKILL.md · 3단계 Hyperframes에 넘김" path=video/latent-spaces/brag/SKILL.md lines=112:122
@source lv-brag-deliver title="brag/SKILL.md · 4단계 결과물" path=video/latent-spaces/brag/SKILL.md lines=126:132
@source lv-slim-desc title="video/latent-spaces/brag-slim/SKILL.md · 9142B · frontmatter" path=video/latent-spaces/brag-slim/SKILL.md lines=1:4
@source lv-slim-intro title="brag-slim/SKILL.md · 소개" path=video/latent-spaces/brag-slim/SKILL.md lines=6:12
@source lv-slim-opts title="brag-slim/SKILL.md · 옵션과 출력 폴더" path=video/latent-spaces/brag-slim/SKILL.md lines=12:20
@source lv-slim-input title="brag-slim/SKILL.md · 입력 종류" path=video/latent-spaces/brag-slim/SKILL.md lines=24:31
@source lv-slim-plan title="brag-slim/SKILL.md · 계획 파일" path=video/latent-spaces/brag-slim/SKILL.md lines=59:59
@source lv-slim-install title="brag-slim/SKILL.md · 도구와 설치 승인" path=video/latent-spaces/brag-slim/SKILL.md lines=97:97
@source lv-slim-deliver title="brag-slim/SKILL.md · 4단계 결과물" path=video/latent-spaces/brag-slim/SKILL.md lines=101:105
@source lv-slim-same title="video/latent-spaces/brag/slim.md · 9142B · brag-slim/SKILL.md와 shasum 동일" path=video/latent-spaces/brag/slim.md lines=1:4

## 언제 brag-slim으로 넘어가나 {#handoff span=12}

@workflow id=brag-handoff title="/brag 호출 뒤 갈림길"
| call | /brag 호출 | external |
| model | Opus 5.5인가? | backend |
| flag | --full 또는 --voice인가? | backend |
| slim | brag-slim으로 진행 | backend |
| full | brag 4단계 진행 | backend |
| call > model | |
| model > flag | 예 |
| model > full | 아니오·모름 |
| flag > full | 예 |
| flag > slim | 아니오 | emphasis |

@steps id=handoff-steps
| call | /brag 호출 | 사용자가 `/brag`를 부르면 에이전트는 먼저 호출 전체를 읽는다. 분기 검사가 프로젝트 점검보다 앞선다. | brag-handoff | call |
| model | Opus 5.5인가? | 에이전트가 자신이 Opus 5.5인지 판단한다. 다른 모델이거나 알 수 없으면 이 검사를 건너뛴다. | brag-handoff | model |
| flag | --full 또는 --voice인가? | `--full`, "use the full brag", `--voice` 중 하나라도 있으면 넘기지 않는다. | brag-handoff | flag |
| slim | brag-slim으로 진행 | 사용자에게 한 줄로 알린 뒤 `slim.md`를 읽고 "이번 실행의 나머지"를 그 지시로 따른다. | brag-handoff | slim |
| full | brag 4단계 진행 | 점검, 계획, Hyperframes 구성, 검증·렌더 순서로 진행한다. | brag-handoff | full |

넘김은 의무형이다. 조건이 맞으면 `brag`는 "switch"하라고 적는다.[](source:lv-dispatch)

- 사용자는 알림을 본 뒤 "use the full brag"라고 말해 되돌릴 수 있다.[](source:lv-dispatch)
- 판정: 이 분기는 에이전트가 자기 모델을 스스로 판단하는 데 달려 있다. 모델을 확인하는 수단은 원문에 명시 없음이다.

## 두 스킬은 무엇이 다른가 {#compare}

| 기준 | brag | brag-slim |
| --- | --- | --- |
| 입력 | 현재 프로젝트 코드. URL이나 스크린샷은 필요 없다고 `description`이 적는다. URL 입력은 원문에 명시 없음[](source:lv-brag-desc) | 프로젝트 폴더 또는 `http(s)://` URL·도메인. 어느 쪽에도 맞지 않으면 사용자에게 묻는다[](source:lv-slim-input) |
| 영상 제작 도구 | Hyperframes. 구성·타이밍·렌더는 Hyperframes가 맡는다 {caution:범위 밖 스킬 의존}[](source:lv-brag-hf) | 기계에 있는 도구를 쓴다. 꼭 필요한 도구가 없으면 설치 전에 묻는다[](source:lv-slim-intro)[](source:lv-slim-install) |
| 번들 자산 | `assets/`와 `scripts/`가 따로 있다[](source:lv-brag-assets) | 파일 하나, 번들 자산 없음[](source:lv-slim-desc) |
| 음성 해설 | `--voice`일 때만. 기본은 꺼짐[](source:lv-brag-opts) | 하지 않는다고 `brag`가 적는다[](source:lv-dispatch) |
| 길이 | 자동 15~25초(기본값). 그 밖의 값 처리는 원문에 명시 없음[](source:lv-brag-opts) | 약 20초(기본값)[](source:lv-slim-opts) |
| 형식 | 기본 `landscape`. 해상도는 원문에 명시 없음[](source:lv-brag-opts) | 기본 `landscape` 1920×1080, `vertical` 1080×1920, `square` 1080×1080, 30fps[](source:lv-slim-opts) |

두 스킬의 `slim.md`와 `brag-slim/SKILL.md`는 `shasum`이 같다. 그래서 `brag`가 넘기는 지시와 `/brag-slim`을 직접 부를 때의 지시는 같은 글이다.[](source:lv-slim-same)

## 두 스킬은 무엇을 주고받고 어디에 쓰나 {#state}

넘길 때 `brag`는 사용자 입력을 그대로 전달하고, `--no-music`, `--title` 같은 옵션은 평문 지시로 바꿔 전달한다(r01). 이 전달은 파일이 아니라 대화 속 지시이며 상태를 관리하는 외부 도구는 원문에 명시 없음이다.[](source:lv-dispatch)

| 파일·폴더 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `brag-output/` 또는 `brag-output-YYYY-MM-DD-HHmmss/` | brag, brag-slim. 이미 폴더가 있으면 시각이 붙은 폴더를 쓴다[](source:lv-brag-out)[](source:lv-slim-opts) | 사용자. 다른 스킬이 읽는다는 말은 원문에 명시 없음 |
| `brag-plan.md` | brag(계획 단계), brag-slim(계획 단계)[](source:lv-brag-out)[](source:lv-slim-plan) | 같은 스킬의 다음 단계 |
| `brag.mp4`, `brag.jpg`, `share-copy.txt` | brag(4단계), brag-slim(4단계)[](source:lv-brag-deliver)[](source:lv-slim-deliver) | 사용자 |
| `<output-dir>/composition/` | brag만. Hyperframes로 만든 구성[](source:lv-brag-hf) | brag의 렌더 단계 |
| `work/`(중간 파일) | brag-slim만[](source:lv-slim-opts) | brag-slim |

두 스킬이 같은 폴더 이름을 쓰므로, `brag`가 넘긴 뒤의 산출물은 `brag-slim` 규칙에 따라 같은 `brag-output/`에 놓인다. 판정: 넘기기 전에 `brag`는 아직 출력 폴더를 만들지 않는다(분기가 먼저라서). 다만 이 순서가 폴더 충돌을 막는지는 원문에 명시 없음이다.

## 그림에서 뺀 관계와 쓰면 안 될 때 {#omitted}

| rel-id | 종류 | 그림에 있나 | 내용 |
| --- | --- | --- | --- |
| r01 | 넘김 | 있음 | 위 갈림길 |
| r02 | 참고 | 생략 | `brag-slim`이 `description`에서 `/brag`를 가리킨다. 본문에서 부르지 않는다[](source:lv-slim-desc) |
| r09 | 내부 위임 | 생략 | `brag`가 Hyperframes 스킬 4개를 읽는다. 저장소에 없어 `범위 밖`이다. `references/types/*`, `story.md`, `SPEC.md`, `usage`, `history`, `feedback`, REVIEW.md 단계는 건너뛴다[](source:lv-brag-hf) |
| r14 | 같은 계열 | 생략 | `explainer-high-energy`와 목적이 비슷하다. 연결은 없다 |

@callout level=open-question title="확인하지 못한 것"
영상, 음악, 효과음이 실제로 잘 나오는지는 확인하지 못했다. 두 스킬을 실행하지 않았다.
Hyperframes 스킬 4개의 본문이 이 저장소에 없어서 `brag` 3단계의 세부는 확인하지 못했다.

@callout level=note title="이 묶음의 읽은 원문"
`brag/SKILL.md`, `brag-slim/SKILL.md`를 다시 읽고 줄 번호를 확인했다. 스킬 내부 규칙과 수치는 각 스킬 페이지(`video/latent-spaces/brag/brag.html`, `video/latent-spaces/brag-slim/brag-slim.html`)에 있다.
