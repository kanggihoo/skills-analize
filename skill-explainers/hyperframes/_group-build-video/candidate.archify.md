# HyperFrames로 새 영상 한 편을 만들 때 네 스킬은 어떻게 이어지나? {#build-video-page}

`hyperframes`가 계약과 작업 순서를 정하고, 명령 실행은 `hyperframes-cli`, 기성 효과는 `hyperframes-registry`, 음악·이미지·음성 같은 media는 `media-use`가 맡는다. 네 스킬을 고정된 순서로 모두 실행하라는 지시는 원문에 없다. 요청에 필요한 스킬만 부른다.[](source:hf-intro)[](source:hf-route)

- `hyperframes`는 이름 붙은 효과를 손으로 쓰기 전에 registry를 검색하고, 모든 media는 `/media-use`로 보내라고 한다.[](source:hf-build)
- `hyperframes-cli`는 `catalog`·`add`와 `media-treatment`·`tts` 같은 명령을 각각 `/hyperframes-registry`, `/media-use` 옆에 적어 두고, 실행법만 정한다.[](source:cli-table)
- 네 스킬은 `assets/`, `compositions/`, `.hyperframes/` 같은 프로젝트 파일을 함께 쓴다. 파일을 통한 연결이라 선후 관계는 없다.[](source:media-assets)[](source:reg-wiring)[](source:cli-history)

@answer scope="스킬 4개 · SKILL.md 기준 · 관계 R01·R02·R03·R09·R10·R24~R27·R29~R32 · 폴더 밖 참조 대상은 읽지 않음"
@meta locale=ko
@source hf-intro title="hyperframes/hyperframes/SKILL.md · 7481B · 원본(개요·CLI)" path=hyperframes/hyperframes/SKILL.md lines=12:13
@source hf-build title="hyperframes/hyperframes/SKILL.md · 7481B · 원본(만들 범위와 위임)" path=hyperframes/hyperframes/SKILL.md lines=16:16
@source hf-contract title="hyperframes/hyperframes/SKILL.md · 7481B · 원본(계약 11번)" path=hyperframes/hyperframes/SKILL.md lines=32:32
@source media-signin title="hyperframes/media-use/SKILL.md · 원본(sign in)" path=hyperframes/media-use/SKILL.md lines=34:34
@source hf-loop title="hyperframes/hyperframes/SKILL.md · 7481B · 원본(작업 루프)" path=hyperframes/hyperframes/SKILL.md lines=45:50
@source hf-route title="hyperframes/hyperframes/SKILL.md · 7481B · 원본(요청별 안내표)" path=hyperframes/hyperframes/SKILL.md lines=60:79
@source cli-table title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 원본(명령표)" path=hyperframes/hyperframes-cli/SKILL.md lines=18:29
@source cli-loop title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 원본(루프)" path=hyperframes/hyperframes-cli/SKILL.md lines=35:44
@source cli-history title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 원본(history)" path=hyperframes/hyperframes-cli/SKILL.md lines=56:60
@source reg-find title="hyperframes/hyperframes-registry/SKILL.md · 원본(검색과 설치)" path=hyperframes/hyperframes-registry/SKILL.md lines=14:26
@source reg-wiring title="hyperframes/hyperframes-registry/SKILL.md · 원본(설치 위치)" path=hyperframes/hyperframes-registry/SKILL.md lines=49:56
@source media-assets title="hyperframes/media-use/SKILL.md · 원본(저장 위치와 resolve)" path=hyperframes/media-use/SKILL.md lines=12:16
@source media-credit title="hyperframes/media-use/SKILL.md · 원본(credit 한도)" path=hyperframes/media-use/SKILL.md lines=40:40

## 네 스킬은 어떤 관계로 이어지나? {#flow}

화살표는 원장의 넘김과 참고다. 앞 스킬이 뒤 스킬을 자동으로 실행한다는 뜻은 아니다. `hyperframes`가 `hyperframes-cli`로 가는 R01·R29는 참고라서 점선이고, 명령 이름만 지목하는 연결은 표에만 남겼다.[](source:hf-build)[](source:cli-table)

@workflow id=build-flow title="영상 제작에서 네 스킬의 연결"
| hf | hyperframes | frontend | source:hf-build |
| cli | hyperframes-cli | backend | source:cli-table |
| reg | hyperframes-registry | backend | source:reg-find |
| media | media-use | backend | source:media-assets |
| hf > cli | 참고 R01 | dashed |
| hf > reg | 넘김 R02 | emphasis |
| hf > media | 넘김 R03 | emphasis |
| cli > reg | 참고 R09 | dashed |
| cli > media | 참고 R10 | dashed |

@steps id=build-steps
| hf-step | hyperframes | 계약 12조와 작업 순서를 정하고 요청에 맞는 스킬로 안내한다. | build-flow | hf |
| cli-step | hyperframes-cli | `lint`, `check`, `snapshot`, `preview`, `render` 명령 사용법을 정한다. | build-flow | cli |
| reg-step | hyperframes-registry | 이름 붙은 효과를 `catalog`로 찾고 `add`로 설치한다. | build-flow | reg |
| media-step | media-use | 음악·이미지·음성 같은 media를 `resolve`로 구해 `assets/`에 둔다. | build-flow | media |

각 스킬의 내부 규칙과 수치는 개별 페이지에 있다. 개별 페이지는 색인 기준 `hyperframes/hyperframes/hyperframes.html` 같은 경로로 찾는다.

## 어떤 관계로 무엇을 주고받나? {#relations}

| rel-id·종류 | 조건과 전달물 | 그림 반영 |
|---|---|---|
| R01·R29 · 참고 | `hyperframes`가 CLI는 `npx hyperframes <command>`로 돌리고 사용법은 `/hyperframes-cli`를 보라고 한다. 의무 표현은 없다.[](source:hf-intro) | 표시(R01) |
| R02 · 넘김 | 이름 붙은 효과·전환·caption 스타일·차트·카드를 손으로 쓰기 전에 registry를 검색한다. 전달물은 검색 결과와 설치된 파일이다.[](source:hf-build)[](source:reg-find) | 표시 |
| R03 · 넘김 | 발표자·avatar·footage·voice·music 같은 media는 `/media-use`가 맡는다. 계약 11번은 grade·grain·blur를 `media-treatment`로 보낸다.[](source:hf-build)[](source:hf-contract) | 표시 |
| R09 · 참고 | 명령표의 Reuse 행에서 `catalog`, `add`를 `/hyperframes-registry`와 연결한다.[](source:cli-table) | 표시 |
| R10 · 참고 | 명령표의 Media and sound 행의 `media-treatment`, `tts` 등을 `/media-use`와 연결한다.[](source:cli-table) | 표시 |
| R12 · 참고 | `captions`는 명령이 아니다. `transcribe`를 돌린 뒤 `../hyperframes/references/captions.md`를 읽는다. 파일 경로를 지목한다.[](source:cli-table) | 생략 |
| R13 · 참고 | 일곱 스킬이 첫 줄에서 plugin 안일 때 `../hyperframes/references/plugin-installation.md`를 따르라고 한다. 조건은 plugin 안일 때뿐이다. | 생략 |
| R30·R31 · 참고 | `hyperframes-registry`와 `media-use`의 reference가 `/hyperframes`의 `runtimes.md`, `format.md`, `captions.md`를 가리킨다. | 생략 |
| R32 · 참고 | `media-use`의 caption reference가 registry 검색을 권한다. 스킬 이름 지목은 `audio/references/captions/authoring.md`에 있다. | 생략 |

관계의 단일 원본은 `relations.md`다. R13·R30~R32의 출처는 폴더 밖 참조까지 걸쳐 있어 이 페이지에서 줄 범위를 다시 열지 않았다. 해당 행은 `relations.md`의 출처 줄을 따른다.

## 어떤 파일과 상태를 공유하나? {#state}

| 파일·상태 | 쓰는 스킬·주체 | 읽는 스킬·조건 |
|---|---|---|
| `assets/` | `media-use`가 local 파일과 ledger 기록으로 둔다. 같은 원문 안에서 `.media/<type>/`로 적힌 곳도 있어 위치가 갈린다.[](source:media-assets) | `hyperframes`가 media와 font는 `assets/`에 있다고 하고 경로를 `assets/...`로 정한다.[](source:hf-intro) |
| `compositions/` | `hyperframes-registry`의 `add`가 block을 `compositions/<name>.html`, component를 `compositions/components/<name>.html`에 쓴다.[](source:reg-wiring) | `hyperframes`의 `index.html`이 `compositions/`의 sub-composition을 mount한다.[](source:hf-intro) |
| `hyperframes.json` | 설치 경로를 정한다. 쓰는 주체는 `hyperframes` CLI다(지시상 동작).[](source:reg-wiring) | `hyperframes-registry`가 설치 경로를 여기서 가져온다.[](source:reg-wiring) |
| `.hyperframes/` history | `hyperframes-cli`가 턴 시작에 `history begin`, 끝에 `history end`를 하라고 한다. `.hyperframes`는 지우지 않는다.[](source:cli-history) | `hyperframes`가 변경 전에 `history --since mine --who <you>`로 사용자 편집을 읽고 그 위에 만든다.[](source:hf-loop) |
| `.hyperframes/credit-limit.json` | 사용자가 말한 credit 한도를 `media-use`가 쓴다.[](source:media-credit) | 유료 호출이 이 한도를 넘으면 거절된다(지시상 동작). `style-sampling`도 같은 파일에 쓴다. |

## 어떤 순서가 강제되고 무엇이 선택인가? {#limits}

판정 · 원문이 강제 순서로 적은 것은 `hyperframes` 안의 작업 루프뿐이다. 새 영화는 type 파일, `story.md`, `SPEC.md`를 거치고, 마지막 edit 뒤에 `check`를 돌린다. 렌더는 사용자가 preview를 승인하거나 파일을 요청하거나 멈추지 말라고 했을 때만 한다.[](source:hf-loop) 나머지 세 스킬은 필요할 때 부르는 선택지다.

- `hyperframes-cli`의 루프는 `lint`, `check --json`, `snapshot`, `preview --background`, `render` 순서이고, 확인이 통과했다는 이유만으로 렌더하지 않는다.[](source:cli-loop)
- 사용자 입력이 필요한 지점은 스킬 안에 있다. media 요청은 `media-use`가 HeyGen이 필요할 때마다 `auth status`를 먼저 돌리고 로그인되지 않았으면 사용자가 로그인을 마칠 때까지 기다리며,[](source:media-signin) credit 한도는 사용자가 정하고,[](source:media-credit) `hyperframes-registry`는 on-device 검색 다운로드를 사용자가 정하게 한다.[](source:reg-find)

@callout level=open-question title="확인하지 못한 것"
이 페이지는 네 스킬의 SKILL.md와 원장만 근거로 썼다. 폴더 밖 참조 대상(`hyperframes/references/*`)과 CLI의 실제 동작은 이 페이지에서 다시 열지 않아 부분 분석이다.
