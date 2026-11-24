# explainer-high-energy — 박자에 맞춘 빠른 장면 전환 홍보 영상을 만든다 {#overview}

`explainer-high-energy`는 에이전트가 한 차례 질문으로 제품 정보를 받은 뒤, 120~140 BPM 박자에 맞춰 도형이 다음 장면으로 이어지는 12~20초 쇼릴 스타일 홍보 영상을 단일 HTML과 MP4로 만드는 스킬이다.[](source:s-fm)[](source:s-intro)

- 사용자가 제품 홍보 영상, 티저, 출시 스팅, 쇼릴 스타일 프로모를 요청할 때 모델이 `description`을 보고 켜며, 제품 설명만 필수이고 나머지는 에이전트가 정한다.[](source:s-fm)[](source:s-s1)
- 결과로 브라우저에서 시간을 문질러 볼 수 있는 `demo.html`, 검토용 `draft.mp4`, 8배 모션 블러와 128 BPM 합성 음향이 합쳐진 최종 `demo.mp4`·`demo_silent.mp4`가 남는다.[](source:s-s3)[](source:s-rm)
- 다른 스킬과의 관계: `explainer-default`·`explainer-engaging`·`bang-motion`·`brag`와 대안 관계이고, `sound-effects`의 결과 전달 여부는 미확인이다.
- 날조된 수치·후기·이모지·스톡 템플릿 느낌·과한 발광(glow)·한 장면에 흑백 제외 4색 이상 사용·움직임 없는 정지 장면은 모두 금지한다.[](source:s-s1)[](source:s-rule)

@answer scope="video/Barty-Bart/explainer-high-energy · 원본 파일 2개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=f53b74e8bae4a9f9a8a11d2d3d0dc2b980b855ed
@source s-fm title="frontmatter: name, description" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=1:4
@source s-intro title="스킬 개요: 도형으로 잇는 쇼릴 스타일 홍보 영상" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=6:11
@source s-s1 title="Step 1: 한 번에 질문, 사실 날조 금지, 기본 15초 128 BPM" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=12:31
@source s-s2 title="Step 2: 120~140 BPM 격자와 8종 장면 구조" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=32:48
@source s-rule title="Step 2: 도형 전환, HUD 프레임, 텍스처, 128 BPM 음향" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=49:62
@source s-build title="단일 HTML 계약, 헬퍼 함수, buildAudio 규격" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=63:119
@source s-s3 title="Step 3: 정지 화면 점검, 초안·최종 렌더, 전달" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=120:128
@source s-rm title="render.mjs: Playwright·ffmpeg 서브프레임·LUFS 정규화" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=129:227
@source s-readme title="README.md: Sister skills 비교 표" path=video/Barty-Bart/explainer-high-energy/README.md lines=9:15
@source rel-sfx title="sound-effects의 적용 대상과 합성 금지 규칙" path=video/Barty-Bart/sound-effects/SKILL.md lines=3:28
@source rel-bang title="bang-motion description" path=video/bangtutorial/bang-motion/SKILL.md lines=1:4
@source rel-brag title="brag description" path=video/latent-spaces/brag/SKILL.md lines=1:4

## 어떻게 동작하나 {#flow span=12}

기본 길이는 15초(128 BPM, 8마디, 12~20초 범위)이며 8종 장면 유형 중 제품에 맞는 6~8개를 골라 장면마다 한 가지 아이디어만 담는다.[](source:s-s1)[](source:s-s2)

@workflow id=flow-diagram title="explainer-high-energy 흐름"
| lane prep | 장면·박자 설계 |
| lane code | HTML·오디오 구현 |
| lane render | 검증·렌더링·전달 |
| brief | 1. 요약 질문 | backend | prep | source:s-s1 |
| plan | 2. 장면 계획 | backend | prep | source:s-s2 |
| build | 2. HTML·HUD 작성 | backend | code | source:s-build |
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
| s-brief | 1. 요약 질문 | **입력** 사용자 요청 · **출력** 제품·기억할 핵심·브랜드·화면비·길이·음악·연출 메모. **처리** 한 메시지에서 7개 항목을 묻고, URL이 있으면 웹에서 실제 문구·색상·폰트를 가져오며 빈칸은 직접 정해 알린다.[](source:s-s1) | flow-diagram | brief |
| s-plan | 2. 장면 계획 | **입력** 제품 정보와 120~140 BPM 박자 · **출력** 장면·시작 시각·인계 도형·소리를 적은 `beat sheet`(화면 문구·UI 순간·시간을 적은 표). **처리** Spark open, Brand slam, Kinetic triplet, 3D·입자 시그니처 비주얼 등 6~8개 장면을 도형 전환으로 잇도록 배치한다.[](source:s-s2)[](source:s-rule) | flow-diagram | plan |
| s-build | 2. HTML·HUD 작성 | **입력** `beat sheet`와 브랜드 팔레트 · **출력** 단일 `demo.html`과 `render.mjs`. **처리** `window.seek(t)` 순수 함수와 모든 장면의 HUD(화면 위 정보 표시) 프레임·seeded 필름 그레인·128 BPM `buildAudio`를 구현한다.[](source:s-rule)[](source:s-build) | flow-diagram | build |
| s-stills | 3. 스틸 점검 | **입력** `demo.html` · **실행** `node render.mjs demo.html check.png --stills 0.5,1.2,…` · **출력** `check.png` 컨택트 시트(정지 화면 모음). **처리** `beat sheet` 행마다 정지 화면을 찍어 겹침·잘림·가독성·빈 프레임을 고친 뒤 다시 확인한다.[](source:s-s3) | flow-diagram | stills |
| s-draft | 3. 초안 렌더 | **입력** 점검된 `demo.html` · **실행** `node render.mjs demo.html draft.mp4 30 1 4` · **출력** `draft.mp4`. **처리** 모션 블러 없이 30fps로 빠르게 뽑은 검토본을 `demo.html`과 함께 사용자에게 보낸다.[](source:s-s3) | flow-diagram | draft |
| s-review | 수정 요청? | **입력** 사용자 검토 응답 · **출력** 수정 재작업 또는 최종 렌더 분기. **처리** 최종 렌더링 전에 바꿀 점을 묻고, 수정 요청이 오면 HTML을 고쳐 다시 뽑는다.[](source:s-s3) | flow-diagram | review |
| s-final | 3. 최종 렌더 | **입력** 확정된 `demo.html` · **실행** `node render.mjs demo.html demo.mp4 60 8 8` · **출력** `demo.mp4`·`demo_silent.mp4`·요약 노트. **처리** 60fps·서브프레임 8배 모션 블러와 `-16 LUFS` 정규화 음향을 입힌 뒤, 파일과 함께 자리표시 내역·다음 버전 대안 한 문장을 전한다.[](source:s-s3)[](source:s-rm) **다음** 시작 전에 모션 블러 렌더링에 오래 걸릴 수 있음을 알린다.[](source:s-s3) | flow-diagram | final |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 호출형(`description` 기반) 또는 사용자 직접 호출. 호출 제한 필드 없음.[](source:s-fm) |
| 성격 | 절차형(3단계 쇼릴 스타일 홍보 영상 제작). 128 BPM 박자 격자와 도형 전환으로 12~20초 영상을 만든다.[](source:s-s1)[](source:s-s2) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `sound-effects` {#rel-r04} | **이 스킬** | 결과 전달 | 미확인: `sound-effects`는 코드 음향 합성을 금지하지만 이 스킬은 자체 `buildAudio`로 128 BPM 음악·효과음을 합성하며 서로 부르지 않는다.[](source:s-rule)[](source:s-build)[](source:rel-sfx) |
| `explainer-default` {#rel-r07} | **이 스킬** | 대안 | `README.md`가 자매 스킬로 비교한다. 차분한 60초 데모 대신 빠른 15초 홍보 영상을 원할 때 사용자가 고른다.[](source:s-readme) |
| `explainer-engaging` {#rel-r08} | **이 스킬** | 대안 | `README.md`가 자매 스킬로 비교한다. 12초 원테이크 루프 대신 장면마다 아이디어가 바뀌는 쇼릴 영상을 원할 때 사용자가 고른다.[](source:s-readme) |
| **이 스킬** {#rel-r12} | `bang-motion` | 대안 | 둘 다 홍보·티저·오프너 영상을 코드로 만들지만 직접 연결은 없고 스타일·제작 방식이 다르다.[](source:s-fm)[](source:rel-bang) |
| `brag` {#rel-r14} | **이 스킬** | 대안 | 둘 다 제품 출시·홍보 영상을 코드에서 만들지만 `brag`는 저장소 코드를 읽고 이 스킬은 질문으로 제품 설명을 받는다.[](source:s-s1)[](source:rel-brag) |

@architecture id=relation-map title="explainer-high-energy과 이어지는 스킬"
| sfx | sound-effects | backend |
| def | explainer-default | backend |
| eng | explainer-engaging | backend |
| brag | brag | backend |
| self | explainer-high-energy(이 스킬) | backend |
| bang | bang-motion | backend |
| sfx > self | 결과 전달(미확인) |
| def > self | 대안 |
| eng > self | 대안 |
| brag > self | 대안 |
| self > bang | 대안 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 3단계 제작 절차, 8종 장면·도형 전환·HUD 규칙, 단일 HTML 계약, `render.mjs` 코드를 담은 본문 227줄 | 홍보 영상·티저·출시 스팅·쇼릴 스타일 프로모를 요청받으면 읽는다 | 1. 요약 질문, 2. 장면 계획, 2. HTML·HUD 작성, 3. 스틸 점검, 3. 초안 렌더, 수정 요청?, 3. 최종 렌더 |
| `README.md` | 자매 스킬 3종 비교 표, 사용법, 사전 요구사항을 적은 안내 문서 27줄 | 에이전트가 실행 중에 읽지 않음(사람용 안내 문서)[](source:s-readme) | - |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 사용자에게 질문할 때 | 첫 메시지 한 번에 모두 묻고, 제품만 필수이며 빈칸은 에이전트가 정해 알린다. | [](source:s-s1) |
| 수치·실적·로고를 다룰 때 | 없는 통계·후기·할인은 지어내지 않으며, 실적(Proof) 장면도 실제 수치가 있을 때만 넣고 없으면 기능 목록으로 바꾼다. | [](source:s-s1)[](source:s-s2) |
| 장면 전환을 설계할 때 | 모든 장면을 도형·선·점·글자로 이어 주며, 정박자 하드컷은 영상 전체에서 최대 2회까지만 허용한다. | [](source:s-rule) |
| 색상과 타이포·HUD를 고를 때 | 한 장면에 흑백 제외 3색 이하만 쓰고, 모든 장면에 모서리 브래킷·장면 번호·타임코드 HUD를 50% 투명도로 올린다. | [](source:s-rule) |
| `seek(t)`와 오디오를 짤 때 | 순수 시간 함수로 작성해 CSS transition·`setTimeout`·`Math.random`을 금지하고, 폰트는 base64 `@font-face`로 내장한다. | [](source:s-build) |
| 초안(`draft.mp4`)을 만든 뒤 | 최종 렌더링으로 바로 가지 않고 HTML과 초안을 사용자에게 보내 수정 여부를 확인한다. | [](source:s-s3) |
| 최종(`demo.mp4`) 렌더를 시작하기 전 | 서브프레임 8배 모션 블러가 적용되므로 렌더링이 오래 걸릴 수 있음을 먼저 알린다. | [](source:s-s3) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 8종 장면 구성과 도형 인계·HUD 규칙 — 맡을 개요 항목: Step 2 장면·박자 계획 · Spark open부터 End card까지 각 장면의 1/16박자 마스크·3D 큐브/입자 비주얼·overshoot(`z`≈0.6~0.7) 수치를 줄여 담았다.
- `render.mjs` 8배 서브프레임 렌더링 파이프라인 — 맡을 개요 항목: Step 3 최종 렌더·전달 · 180도 셔터 `tmix` 필터와 `-16 LUFS` 오디오 정규화 구현을 요약해 두었다.

읽은 원본: 텍스트 파일 2개(`SKILL.md`, `README.md`). 제외: 없음.
