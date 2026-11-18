# hyperframes 관계 원장
분석 커밋: f85af643f25876081562e9820cd87fb45a478480

조사 상태 기준: 스킬 폴더 안 텍스트를 전부 읽었어도, 폴더 밖 참조 대상이나 부분 읽음 파일이 있으면 `부분`이다. 상세는 스킬 페이지 감사 패널.

수집 범위: `hyperframes/` 최상위 폴더의 `SKILL.md` 8개. 같은 이름 스킬은 다른 컬렉션에 없다(`shasum` 대조: 해당 없음). 번역본은 `hyperframes/hyperframes`, `hyperframes/hyperframes-cli`만 만들었다(`*.KO.md`, 읽기용·근거 아님). 컬렉션 밖 대상(`/figma`)은 `범위 밖`이다.

## 스킬
| 경로 ID | 한 줄 요약 | 조사 상태(완료/부분/미조사) | 원문 비교(원문 동일: <경로> / 동명·내용 다름 / -) | 소속 묶음 | 역할(단계/선택지/안내/변형) |
| --- | --- | --- | --- | --- | --- |
| hyperframes/hyperframes | HTML을 영상으로 렌더하는 HyperFrames의 계약·작업 순서를 정하고, 요청 종류에 맞는 하위 스킬과 reference로 안내한다 | 부분 | - | build-video, start-from-reference | 안내 |
| hyperframes/hyperframes-cli | `npx hyperframes` 명령을 작업별로 묶어 쓰는 법, 확인 루프, 렌더 위치, 실패 복구를 정한다 | 부분 | - | build-video | 단계 |
| hyperframes/hyperframes-registry | 약 450개 기성 block·component를 `catalog`로 찾아 `add`로 설치해 직접 만들지 않게 한다 | 부분 | - | build-video | 선택지 |
| hyperframes/media-use | 영상에 넣을 음악·효과음·이미지·로고·음성·cutout·색보정을 `media-use resolve`로 구하거나 만든다 | 부분 | - | build-video | 선택지 |
| hyperframes/remotion-to-hyperframes | Remotion 등 기존 영상 코드를 HyperFrames로 옮기고 원본과 프레임 단위로 대조한다 | 부분 | - | start-from-reference | 선택지 |
| hyperframes/reverse-any-video | 영상 파일 하나를 편집 가능한 HyperFrames 프로젝트로 다시 만들고 원본과 프레임 단위로 대조한다 | 부분 | - | start-from-reference | 선택지 |
| hyperframes/slideshow | 렌더 영상 대신 발표용 slideshow(fragment, hotspot, presenter 모드)를 만들어 `present`로 띄운다 | 완료 | - | - | 변형 |
| hyperframes/style-sampling | 검증된 영상 스타일 템플릿 5종 중 하나로 사용자 주제의 새 에피소드를 만든다 | 부분 | - | start-from-reference | 선택지 |

## 관계
| rel-id | from | to | 종류 | 근거 방식(명시-이름/명시-역할/추론/미확인) | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태(범위 내/범위 밖/불명) | 출처(from 줄; to 줄) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R01 | hyperframes/hyperframes | hyperframes/hyperframes-cli | 참고 | 명시-이름 | CLI는 `npx hyperframes <command>`로 돌리고 사용법은 `/hyperframes-cli`를 본다. 의무 표현 없음 | 명령 실행법 | - | 범위 내 | hyperframes SKILL.md:12; hyperframes-cli SKILL.md:12 |
| R02 | hyperframes/hyperframes | hyperframes/hyperframes-registry | 다음 안내 | 명시-이름 | 이름 붙은 효과·전환·caption 스타일·차트·카드를 손으로 쓰기 전에 registry를 검색한다("Before hand-writing ... search"). 조건부 의무 어조 | 검색 결과 → 설치 | - | 범위 내 | hyperframes SKILL.md:16; hyperframes-registry SKILL.md:14-26 |
| R03 | hyperframes/hyperframes | hyperframes/media-use | 다음 안내 | 명시-이름 | 발표자·avatar·footage·voice·music 같은 모든 media는 `/media-use`가 맡는다. 계약 11번도 grade·grain·blur를 `media-treatment`(`/media-use`)로 보낸다. captions·sound reference도 같은 방향 | media 파일 → `assets/` | `media-use` ledger | 범위 내 | hyperframes SKILL.md:16, 32; format.md:83; captions.md:5,43; sound.md:20; media-use SKILL.md:3, 12-15 |
| R04 | hyperframes/hyperframes | hyperframes/reverse-any-video | 다음 안내 | 명시-이름 | "복사하거나 다시 만들 영상"이 요청일 때. 안내표의 한 행. 강제 아님 | - | - | 범위 내 | hyperframes SKILL.md:64; reverse-any-video SKILL.md:3 |
| R05 | hyperframes/hyperframes | hyperframes/style-sampling | 다음 안내 | 명시-이름 | "검증된 스타일의 에피소드"가 요청일 때. 안내표의 한 행. 강제 아님 | - | - | 범위 내 | hyperframes SKILL.md:65; style-sampling SKILL.md:3 |
| R06 | hyperframes/hyperframes | hyperframes/slideshow | 다음 안내 | 명시-이름 | 요청이 deck(발표)일 때 `/slideshow`. `/slideshow`는 온디맨드 스킬이라 설치돼 있지 않을 수 있다(`skill-lifecycle.md:7-8`, 사용자가 `skills update <name>`으로 설치) | slideshow composition | - | 범위 내 | hyperframes SKILL.md:79; slideshow SKILL.md:3 |
| R07 | hyperframes/hyperframes | hyperframes/remotion-to-hyperframes | 다음 안내 | 명시-이름 | 입력이 Remotion source일 때 `/remotion-to-hyperframes`. 온디맨드 스킬이라 설치돼 있지 않을 수 있다(`skill-lifecycle.md:7-8`) | - | - | 범위 내 | hyperframes SKILL.md:79; remotion-to-hyperframes SKILL.md:3 |
| R08 | hyperframes/hyperframes | figma | 참고 | 명시-이름 | "Figma: `/figma`"로만 적혀 있다. look.md:16, launch.md:9, skill-lifecycle.md:8에도 나온다. 온디맨드 스킬 | - | - | 범위 밖 | hyperframes SKILL.md:79; - |
| R09 | hyperframes/hyperframes-cli | hyperframes/hyperframes-registry | 참고 | 명시-이름 | 명령표의 Reuse 행에서 `catalog`, `add`를 `/hyperframes-registry`로 연결 | - | - | 범위 내 | hyperframes-cli SKILL.md:25; hyperframes-registry SKILL.md:14-20 |
| R10 | hyperframes/hyperframes-cli | hyperframes/media-use | 참고 | 명시-이름 | 명령표의 Media and sound 행(`media-treatment`, `tts` 등)을 `/media-use`로 연결 | - | - | 범위 내 | hyperframes-cli SKILL.md:26; media-use SKILL.md:12-16 |
| R11 | hyperframes/hyperframes-cli | hyperframes/slideshow | 참고 | 명시-이름 | 명령표의 Show and ship 행에서 `present`를 `/slideshow`로 연결 | - | - | 범위 내 | hyperframes-cli SKILL.md:27; slideshow SKILL.md:61 |
| R12 | hyperframes/hyperframes-cli | hyperframes/hyperframes | 참고 | 명시-이름 | `captions`는 명령이 아니므로 `transcribe`를 돌린 뒤 `../hyperframes/references/captions.md`를 읽는다. `keyframes`는 `../hyperframes/references/motion.md`. 파일 경로 지목 | reference 파일 | - | 범위 내 | hyperframes-cli SKILL.md:31, 103; hyperframes captions.md |
| R13 | hyperframes/hyperframes-cli, hyperframes/hyperframes-registry, hyperframes/media-use, hyperframes/remotion-to-hyperframes, hyperframes/reverse-any-video, hyperframes/slideshow, hyperframes/style-sampling | hyperframes/hyperframes | 참고 | 명시-이름 | 7개 스킬이 모두 첫 줄에서 "HyperFrames plugin 안이라면 plugin execution rules를 따르라"며 `../hyperframes/references/plugin-installation.md`를 가리킨다. 조건은 plugin 안일 때뿐 | 파일 `references/plugin-installation.md` | - | 범위 내 | 각 SKILL.md 6줄(전부 6줄); hyperframes SKILL.md:6 |
| R14 | hyperframes/reverse-any-video | hyperframes/hyperframes | 참고 | 명시-이름 | 결과물은 `/hyperframes` 계약에 맞춰 만든다("Build to the `/hyperframes` contract"). 의무 어조 | HyperFrames 프로젝트 | - | 범위 내 | reverse-any-video SKILL.md:12; hyperframes SKILL.md:18-33 |
| R15 | hyperframes/remotion-to-hyperframes | hyperframes/hyperframes | 참고 | 명시-이름 | Native 단계에서 `/hyperframes` 계약으로 번역하고, Hosted 단계는 `../hyperframes/references/runtimes.md`의 seek 규약을 따른다 | HTML+GSAP 프로젝트 | - | 범위 내 | remotion-to-hyperframes SKILL.md:25, 43-45; hyperframes SKILL.md:18-33 |
| R16 | hyperframes/slideshow | hyperframes/hyperframes | 참고 | 명시-이름 | "slideshow는 일반 composition이고 `/hyperframes` 계약이 적용된다" | slideshow composition | - | 범위 내 | slideshow SKILL.md:12; hyperframes SKILL.md:18-33 |
| R17 | hyperframes/remotion-to-hyperframes | hyperframes/hyperframes-registry | 참고 | 명시-역할 | 소스가 쓴 이름 붙은 시각 효과를 손으로 만들기 전에 `catalog --query`를 검색한다. 스킬 이름이 아니라 명령으로 지목 | 검색 결과 | - | 범위 내 | remotion-to-hyperframes SKILL.md:41; hyperframes-registry SKILL.md:19 |
| R18 | hyperframes/slideshow | hyperframes/hyperframes-registry | 참고 | 명시-역할 | 같은 문장으로 `catalog --query` 검색을 권한다. 스킬 이름이 아니라 명령으로 지목 | 검색 결과 | - | 범위 내 | slideshow SKILL.md:47; hyperframes-registry SKILL.md:19 |
| R19 | hyperframes/remotion-to-hyperframes | hyperframes/media-use | 참고 | 명시-이름 | 음량 ramp 형식은 `/media-use` → `references/mixing.md`를 본다 | - | - | 범위 내 | remotion-to-hyperframes references/limitations.md:35, references/media.md:48; media-use SKILL.md:61 |
| R20 | hyperframes/reverse-any-video | hyperframes/media-use | 참고 | 명시-역할 | 사람·애니메이션 재생성은 `media-use generate --type video/image`, 사람 cutout은 `remove-background`를 명령으로 지목한다(people.md:9-17, 23; animated.md:23-26). 로고는 원본에서 오리거나 `media-use resolve --type logo`로 실제 마크를 구하고 손으로 그리지 않는다. 스킬 이름이 아니라 명령으로 지목 | 로고 파일 | `media-use` ledger | 범위 내 | reverse-any-video SKILL.md:26; media-use SKILL.md:27 |
| R21 | hyperframes/style-sampling | hyperframes/reverse-any-video | 다음 안내 | 명시-이름 | 5개 템플릿에 없는 스타일(채널·영화를 이름으로 댄 경우)이면 한 줄로 알리고 두 길을 제안한다. 영상 하나를 프레임 단위로 다시 만들고 내용을 바꾸는 길이 `/reverse-any-video`. 제안이고 사용자가 고른다. 고르기 전에 아무것도 pull하지 않는다. 이름만 댄 스타일은 예시 영상을 요청한다 | 예시 영상 | - | 범위 내 | style-sampling SKILL.md:3, 30; reverse-any-video SKILL.md:3 |
| R22 | hyperframes/style-sampling | hyperframes/hyperframes | 다음 안내 | 명시-이름 | R21의 다른 길: 그 스타일의 문법을 가져와 사용자 주제의 새 영화를 만드는 `/hyperframes`("From a reference", `look.md`). 제안이고 사용자가 고른다 | 예시 영상 | - | 범위 내 | style-sampling SKILL.md:30; hyperframes references/look.md |
| R23 | hyperframes/style-sampling | hyperframes/media-use | 참고 | 명시-이름 | 생성 media는 kit의 도구나 `media-use generate`로 만들고 `media-use`의 Credits 규칙을 따른다. 가격·추정·잔액을 먼저 말하지 않는다 | - | `.hyperframes/credit-limit.json` | 범위 내 | style-sampling SKILL.md:54; media-use SKILL.md:40 |
| R24 | hyperframes/media-use | hyperframes/style-sampling | 같은 파일 | 명시-이름 | 두 스킬이 모두 사용자가 말한 credit 한도를 `.hyperframes/credit-limit.json`에 쓴다. 선후 관계는 없다 | `.hyperframes/credit-limit.json`(`{"credits": N}`) | `media-use` CLI가 이 파일로 유료 호출을 막는다(지시상 동작) | 범위 내 | media-use SKILL.md:40; style-sampling SKILL.md:54 |
| R25 | hyperframes/media-use | hyperframes/hyperframes | 같은 파일 | 명시-이름 | `media-use`는 media를 프로젝트 `assets/`에 local 파일과 ledger 기록으로 둔다. `/hyperframes`는 media와 font가 `assets/`에 있다고 하고 asset 경로를 `assets/...`로 정한다. 선후 관계는 없다 | `assets/` 또는 `.media/<type>/`(원문 안에서도 갈림: SKILL.md:12는 `assets/`, resolve.md·audio.md:3-6은 `.media/`, audio.md:15는 `assets/voice/`·`assets/bgm/`), ledger | `media-use` CLI(ledger) | 범위 내 | media-use SKILL.md:12; hyperframes SKILL.md:13, 33 |
| R26 | hyperframes/hyperframes-registry | hyperframes/hyperframes | 같은 파일 | 명시-이름 | `add`로 설치한 block은 `compositions/<name>.html`에 쓰이고, `/hyperframes`의 `index.html`이 `compositions/`의 sub-composition을 mount한다. 설치 경로는 `hyperframes.json`이 정한다 | `compositions/`(block), `compositions/components/`(component), `hyperframes.json` | `hyperframes` CLI(`add`) | 범위 내 | hyperframes-registry SKILL.md:51-52, 56; hyperframes SKILL.md:13 |
| R27 | hyperframes/hyperframes | hyperframes/hyperframes-cli | 같은 파일 | 명시-이름 | `/hyperframes`는 변경 전에 `history --since mine --who <you>`로 사용자가 바꾼 것을 읽고 그 위에 만든다. `/hyperframes-cli`는 턴 시작에 `history begin`, 끝에 `history end`를 하라고 하고 `.hyperframes`를 지우지 말라고 한다 | `.hyperframes/` 기록 | `hyperframes` CLI(history) | 범위 내 | hyperframes SKILL.md:47; hyperframes-cli SKILL.md:56-60, 85 |
| R28 | hyperframes/reverse-any-video | hyperframes/remotion-to-hyperframes | 대안 | 추론 | 둘 다 기존 작업(영상 파일 / 영상 코드)을 HyperFrames로 가져와 원본과 프레임 단위로 대조한다. 직접 연결은 없다 | - | - | 범위 내 | reverse-any-video SKILL.md:3; remotion-to-hyperframes SKILL.md:3 |
| R30 | hyperframes/hyperframes-registry | hyperframes/hyperframes | 참고 | 명시-이름 | 일부 item(Liquid Glass 등)은 `/hyperframes` → `references/runtimes.md`의 runtime을 가리킨다 | - | - | 범위 내 | hyperframes-registry references/discovery.md:104, 116; hyperframes references/runtimes.md |
| R31 | hyperframes/media-use | hyperframes/hyperframes | 참고 | 명시-이름 | media-use의 reference가 `/hyperframes` → `references/format.md`(operations.md:22), `captions.md`, `motion.md`, `runtimes.md`(audio/references/captions/motion.md:85-86)를 가리킨다 | reference 파일 | - | 범위 내 | media-use references/operations.md:22; audio/references/captions/motion.md:85-86; hyperframes references/format.md |
| R32 | hyperframes/media-use | hyperframes/hyperframes-registry | 참고 | 명시-역할 | marker highlight 등은 registry를 검색(`catalog`, `add`)하라고 한다. 스킬 이름 `/hyperframes-registry`는 audio/references/captions/authoring.md:43에 있다 | 검색 결과 | - | 범위 내 | media-use audio/references/captions/authoring.md:43; hyperframes-registry SKILL.md:19 |
| R29 | hyperframes/hyperframes | hyperframes/hyperframes-cli | 참고 | 명시-이름 | `/hyperframes`는 "렌더·`check`·`snapshot`·`preview`·`render`는 `npx hyperframes`로 한다"고만 쓴다. CLI 안내는 `/hyperframes-cli`에 있다(R01과 같은 연결의 구체 명령) | - | - | 범위 내 | hyperframes SKILL.md:12, 47-50; hyperframes-cli SKILL.md:35-44 |

## 묶음
| group-id | 작업 목표 | 구성 스킬과 역할 | 그림 |
| --- | --- | --- | --- |
| build-video | HyperFrames로 새 영상 한 편을 만든다 | hyperframes(안내), hyperframes-cli(단계), hyperframes-registry(선택지), media-use(선택지) | `@workflow` 작업 루프 + 공유 상태 표 |
| start-from-reference | 이미 있는 영상·코드·스타일에서 출발해 HyperFrames 프로젝트를 만든다 | hyperframes(안내), remotion-to-hyperframes(선택지), reverse-any-video(선택지), style-sampling(선택지) | `@workflow` 결정 노드 |
