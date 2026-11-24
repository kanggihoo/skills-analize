# explainer-default — 차분한 제품 시연 영상을 HTML에서 MP4로 만든다 {#overview}

`explainer-default`는 에이전트가 한 차례 질문으로 제품 정보를 받은 뒤, 밝은 캔버스 위에 짧은 문장과 직접 재구성한 제품 UI 클로즈업을 카메라 이동으로 잇는 45~90초 데모 영상을 단일 HTML과 MP4로 만들어 주는 스킬이다.[](source:s-fm)[](source:s-intro)

- 사용자가 제품 데모, 출시 영상, 기능 안내 영상을 요청할 때 모델이 `description`을 보고 켜며, 제품 설명만 필수이고 나머지는 빈칸이면 에이전트가 정하고 알린다.[](source:s-fm)[](source:s-s1)
- 결과로 브라우저에서 시간을 문질러 볼 수 있는 `demo.html`, 검토용 `draft.mp4`, 모션 블러와 음향이 합쳐진 최종 `demo.mp4`와 무음 `demo_silent.mp4`가 남는다.[](source:s-s3)[](source:s-rm)
- 다른 스킬과의 관계: `explainer-engaging`·`explainer-high-energy`·`bang-motion`·`lemo-opuscar`·`script-to-motion`과 대안 관계이고, `sound-effects`의 결과 전달 여부는 미확인이다.
- 사용자나 웹사이트가 주지 않은 고객 수·매출·평점·후기·할인 문구는 지어내지 않으며, 이모지·과한 그림자·유리 질감(glassmorphism)·탄성 있는 easing(bouncy easing)은 금지한다.[](source:s-s1)[](source:s-rule)

@answer scope="video/Barty-Bart/explainer-default · 원본 파일 2개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=f53b74e8bae4a9f9a8a11d2d3d0dc2b980b855ed
@source s-fm title="frontmatter: name, description" path=video/Barty-Bart/explainer-default/SKILL.md lines=1:4
@source s-intro title="스킬 개요: 차분한 데모 영상과 단일 HTML 계약" path=video/Barty-Bart/explainer-default/SKILL.md lines=6:11
@source s-s1 title="Step 1: 한 번에 질문, 사실 날조 금지, 길이별 분량" path=video/Barty-Bart/explainer-default/SKILL.md lines=12:38
@source s-s2 title="Step 2: 대본·beat sheet와 7단계 장면 구조" path=video/Barty-Bart/explainer-default/SKILL.md lines=40:58
@source s-rule title="Step 2: 연출 규칙, 기본 팔레트, 음향 설계" path=video/Barty-Bart/explainer-default/SKILL.md lines=59:73
@source s-build title="단일 HTML 계약, 헬퍼 함수, buildAudio 규격" path=video/Barty-Bart/explainer-default/SKILL.md lines=74:130
@source s-s3 title="Step 3: 정지 화면 점검, 초안·최종 렌더, 전달" path=video/Barty-Bart/explainer-default/SKILL.md lines=131:139
@source s-rm title="render.mjs: Playwright·ffmpeg 모션 블러·LUFS 정규화" path=video/Barty-Bart/explainer-default/SKILL.md lines=140:238
@source s-readme title="README.md: Sister skills 비교 표" path=video/Barty-Bart/explainer-default/README.md lines=9:15
@source rel-sfx title="sound-effects의 적용 대상과 합성 금지 규칙" path=video/Barty-Bart/sound-effects/SKILL.md lines=3:28
@source rel-bang title="bang-motion description" path=video/bangtutorial/bang-motion/SKILL.md lines=1:4
@source rel-lemo title="lemo-opuscar description" path=video/lemomo-ai/lemo-opuscar/SKILL.md lines=1:4
@source rel-stm title="script-to-motion description과 render.py 안내" path=video/script-to-motion/SKILL.md lines=1:20

## 어떻게 동작하나 {#flow span=12}

길이 기본값은 60초(45~90초 범위)이며, 길이에 따라 기능 수(2~5개)와 선택 장면(실적·연동) 포함 여부가 달라진다.[](source:s-s1)

@workflow id=flow-diagram title="explainer-default 흐름"
| lane prep | 기획·설계 |
| lane code | HTML·오디오 구현 |
| lane render | 검증·렌더링·전달 |
| brief | 1. 요약 질문 | backend | prep | source:s-s1 |
| plan | 2. 대본 설계 | backend | prep | source:s-s2 |
| build | 2. HTML·오디오 작성 | backend | code | source:s-build |
| stills | 3. 스틸 점검 | backend | render | source:s-s3 |
| draft | 3. 초안 렌더 | backend | render | source:s-s3 |
| review | 수정 요청? | backend | render | source:s-s3 |
| final | 3. 최종 렌더 | backend | render | source:s-s3 |
| brief > plan | 확정 |
| plan > build | 설계 |
| build > stills | 준비 |
| stills > build | 수정 | dashed |
| stills > draft | 통과 |
| draft > review | 전달 |
| review > build | 재작업 | dashed |
| review > final | 승인 | emphasis |

@steps id=flow-steps
| s-brief | 1. 요약 질문 | **입력** 사용자 요청 · **출력** 제품·기억할 핵심·브랜드·화면비·길이·음악·연출 메모. **처리** 한 메시지에서 7개 항목을 묻고, URL이 있으면 웹에서 실제 문구·색상·폰트를 가져오며 빈 항목은 직접 정해 알린다.[](source:s-s1) | flow-diagram | brief |
| s-plan | 2. 대본 설계 | **입력** 제품 정보와 길이 예산 · **출력** 화면 문구·UI 순간·시간·소리를 적은 `beat sheet`(화면 문구·UI 순간·시간을 적은 표). **처리** Open부터 End card까지 7단계 구조로 문구 한 줄과 재구성한 UI 클로즈업 장면을 번갈아 배치한다.[](source:s-s2)[](source:s-rule) | flow-diagram | plan |
| s-build | 2. HTML·오디오 작성 | **입력** `beat sheet`와 브랜드 토큰 · **출력** 단일 `demo.html`과 `render.mjs`. **처리** `window.seek(t)` 순수 함수와 `window.buildAudio(ctx)`를 구현하고, 폰트는 base64 `@font-face`로 내장하며 이력 값은 로드시 `bake`(미리 계산해 저장)한다.[](source:s-build) | flow-diagram | build |
| s-stills | 3. 스틸 점검 | **입력** `demo.html` · **실행** `node render.mjs demo.html check.png --stills 0.5,1.2,…` · **출력** `check.png` 컨택트 시트(정지 화면 모음). **처리** `beat sheet` 행마다 정지 화면을 찍어 겹침·잘림·가독성·빈 프레임을 고친 뒤 다시 확인한다.[](source:s-s3) | flow-diagram | stills |
| s-draft | 3. 초안 렌더 | **입력** 점검된 `demo.html` · **실행** `node render.mjs demo.html draft.mp4 30 1 4` · **출력** `draft.mp4`. **처리** 모션 블러 없이 30fps로 빠르게 뽑은 검토본을 `demo.html`과 함께 사용자에게 보낸다.[](source:s-s3) | flow-diagram | draft |
| s-review | 수정 요청? | **입력** 사용자 검토 응답 · **출력** 수정 재작업 또는 최종 렌더 분기. **처리** 최종 렌더링 전에 바꿀 점을 묻고, 수정 요청이 오면 HTML을 고쳐 다시 뽑는다.[](source:s-s3) | flow-diagram | review |
| s-final | 3. 최종 렌더 | **입력** 확정된 `demo.html` · **실행** `node render.mjs demo.html demo.mp4 60 4 8` · **출력** `demo.mp4`·`demo_silent.mp4`·요약 노트. **처리** 60fps·서브프레임 4배 모션 블러와 `-16 LUFS` 정규화 음향을 입힌 뒤, 파일과 함께 자리표시 내역·다음 버전 대안 한 문장을 전한다.[](source:s-s3)[](source:s-rm) **다음** 노트북에서 20~60분 걸릴 수 있음을 시작 전에 알린다.[](source:s-s3) | flow-diagram | final |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 호출형(`description` 기반) 또는 `/explainer-default` 같은 사용자 호출. 호출 제한 필드 없음.[](source:s-fm) |
| 성격 | 절차형(3단계 제품 데모 제작·렌더링). 한 번의 질문으로 소재를 모은 뒤 단일 HTML과 60fps MP4를 만든다.[](source:s-s1)[](source:s-s3) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `sound-effects` {#rel-r04} | **이 스킬** | 결과 전달 | 미확인: `sound-effects`는 코드 음향 합성을 금지하지만 이 스킬은 자체 `buildAudio`로 음악·효과음을 합성하며 서로 부르지 않는다.[](source:s-s1)[](source:s-build)[](source:rel-sfx) |
| **이 스킬** {#rel-r06} | `explainer-engaging` | 대안 | `README.md`가 자매 스킬로 비교한다. 차분한 60초 데모 대신 영웅 요소 하나가 스테이션을 지나는 12초 원테이크 루프일 때 사용자가 고른다.[](source:s-readme) |
| **이 스킬** {#rel-r07} | `explainer-high-energy` | 대안 | `README.md`가 자매 스킬로 비교한다. 차분한 데모 대신 15초 박자 맞춤 쇼릴 스타일 홍보 영상일 때 사용자가 고른다.[](source:s-readme) |
| **이 스킬** {#rel-r11} | `bang-motion` | 대안 | 둘 다 HTML에서 설명·데모 영상을 렌더링하지만 직접 연결은 없고 스타일 선택 방식이 다르다.[](source:s-fm)[](source:rel-bang) |
| **이 스킬** {#rel-r13} | `lemo-opuscar` | 대안 | 둘 다 코드로 설명·홍보 영상을 만드나 `lemo-opuscar`는 외부 라이브러리의 이름 붙은 스타일을 고르는 방식이다.[](source:s-fm)[](source:rel-lemo) |
| `script-to-motion` {#rel-r19} | **이 스킬** | 대안 | 둘 다 코드로 설명 영상을 만들어 MP4로 내지만 직접 연결은 없고 TTS 녹음·`render.py` 흐름은 `script-to-motion`에만 있다.[](source:s-fm)[](source:rel-stm) |

@architecture id=relation-map title="explainer-default과 이어지는 스킬"
| sfx | sound-effects | backend |
| stm | script-to-motion | backend |
| self | explainer-default(이 스킬) | backend |
| eng | explainer-engaging | backend |
| high | explainer-high-energy | backend |
| bang | bang-motion | backend |
| lemo | lemo-opuscar | backend |
| sfx > self | 결과 전달(미확인) |
| stm > self | 대안 |
| self > eng | 대안 |
| self > high | 대안 |
| self > bang | 대안 |
| self > lemo | 대안 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 3단계 제작 절차, 7단계 장면 구조, 단일 HTML 계약, `render.mjs` 코드를 담은 본문 238줄 | 제품 데모·출시·기능 안내 영상을 요청받으면 읽는다 | 1. 요약 질문, 2. 대본 설계, 2. HTML·오디오 작성, 3. 스틸 점검, 3. 초안 렌더, 수정 요청?, 3. 최종 렌더 |
| `README.md` | 자매 스킬 3종 비교 표, 사용법, 사전 요구사항(Node 18+, ffmpeg, Playwright)을 적은 안내 문서 27줄 | 에이전트가 실행 중에 읽지 않음(사람용 안내 문서)[](source:s-readme) | - |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 사용자에게 질문할 때 | 첫 메시지 한 번에 모두 묻고, 제품만 필수이며 빈칸은 에이전트가 정해 알린다. | [](source:s-s1) |
| 수치·실적·후기를 넣을 때 | 사용자나 웹사이트가 주지 않은 통계·고객 수·평점·무료 혜택은 절대 지어내지 않고 상대 막대나 자리표시 선을 쓴다. | [](source:s-s1)[](source:s-rule) |
| 로고를 넣을 때 | 사용자가 파일을 주었거나 자기 제품에 요청한 경우에만 쓰고, 연동 로고도 미제공 시 이름만 적은 중립 타일로 대체한다. | [](source:s-s1) |
| 한 장면을 구성할 때 | 문구 한 줄과 UI 요소 하나를 동시에 두지 않고 교차 배치하며, 하드컷 없이 카메라 이동이나 0.3~0.4초 블러 디졸브만 쓴다. | [](source:s-s2)[](source:s-rule) |
| `seek(t)`와 오디오를 짤 때 | 순수 시간 함수로 작성해 CSS transition·`setTimeout`·`Math.random`을 금지하고, 폰트는 base64 `@font-face`로 내장한다. | [](source:s-build) |
| 초안(`draft.mp4`)을 만든 뒤 | 최종 렌더링으로 바로 가지 않고 HTML과 초안을 사용자에게 보내 수정 여부를 확인한다. | [](source:s-s3) |
| 최종(`demo.mp4`) 렌더를 시작하기 전 | 서브프레임 4배 모션 블러로 60초 영상이 노트북에서 20~60분 걸릴 수 있음을 먼저 알린다. | [](source:s-s3) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 7단계 장면 구성과 UI 클로즈업 연출 규칙 — 맡을 개요 항목: Step 2 대본·장면 설계 · Open·Problem·Feature·Proof·Integrations·Closer·End card별 세부 움직임과 25자/초 타이핑·팔레트 수치를 줄여 담았다.
- `render.mjs` Playwright·ffmpeg 파이프라인 — 맡을 개요 항목: Step 3 최종 렌더·전달 · 180도 셔터 서브프레임 분할과 워커 병렬 인코딩·`-16 LUFS` 정규화 구현을 요약해 두었다.

읽은 원본: 텍스트 파일 2개(`SKILL.md`, `README.md`). 제외: 없음.
