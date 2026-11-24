# explainer-engaging — 영웅 요소 하나가 제품 흐름을 지나는 원테이크 영상을 만든다 {#overview}

`explainer-engaging`은 에이전트가 한 차례 질문으로 제품 흐름을 받은 뒤, 단일 영웅(hero) 요소가 큰 캔버스 위 제품 UI 스테이션들을 컷 없이 통과하고 마지막에 전체 경로를 한눈에 비추는 10~30초 루프 영상을 HTML과 MP4로 만드는 스킬이다.[](source:s-fm)[](source:s-intro)

- 사용자가 스토리 중심의 원테이크 설명 영상이나 루프형 제품 애니메이션을 요청할 때 모델이 `description`을 보고 켜며, 제품 설명만 필수이고 나머지는 에이전트가 정한다.[](source:s-fm)[](source:s-s1)
- 결과로 브라우저에서 시간을 문질러 볼 수 있는 `demo.html`, 검토용 `draft.mp4`, 모션 블러와 접촉음이 합쳐진 60fps 루프 `demo.mp4`·`demo_silent.mp4`가 남는다.[](source:s-s3)[](source:s-rm)
- 다른 스킬과의 관계: `explainer-default`·`explainer-high-energy`와 자매 대안 관계이고, `sound-effects`의 결과 전달 여부는 미확인이다.
- 컷 전환·검은 화면 페이드·설명용 자막 오버레이·영웅 2개 이상 사용·반응 없는 스테이션·날조된 제품 수치는 모두 금지한다.[](source:s-s1)[](source:s-look)

@answer scope="video/Barty-Bart/explainer-engaging · 원본 파일 2개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=f53b74e8bae4a9f9a8a11d2d3d0dc2b980b855ed
@source s-fm title="frontmatter: name, description" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=1:4
@source s-intro title="스킬 개요: 원테이크 영웅·스테이션 스토리" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=6:13
@source s-s1 title="Step 1: 한 번에 질문, 사실 날조 금지, 12초 루프" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=14:35
@source s-course title="Step 2: 영웅·8종 스테이션·3배 캔버스·물리 경로·루프 이음매" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=36:74
@source s-look title="Step 2: 카메라 추적·3D 리빌·다크 팔레트·접촉음" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=75:95
@source s-build title="단일 HTML 계약, 루프 시간 모듈로, 헬퍼 함수, buildAudio" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=96:152
@source s-s3 title="Step 3: 정지 화면 점검, 초안·최종 렌더, 전달" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=153:161
@source s-rm title="render.mjs: Playwright·ffmpeg 서브프레임·LUFS 정규화" path=video/Barty-Bart/explainer-engaging/SKILL.md lines=162:260
@source s-readme title="README.md: Sister skills 비교 표" path=video/Barty-Bart/explainer-engaging/README.md lines=9:15
@source rel-sfx title="sound-effects의 적용 대상과 합성 금지 규칙" path=video/Barty-Bart/sound-effects/SKILL.md lines=3:28

## 어떻게 동작하나 {#flow span=12}

기본 길이는 12초 심리스 루프(10~30초 범위)이며, 길이가 늘어나도 스테이션 속도를 늦추지 않고 스테이션 수를 늘린다.[](source:s-s1)

@workflow id=flow-diagram title="explainer-engaging 흐름"
| lane prep | 코스·경로 설계 |
| lane code | HTML·오디오 구현 |
| lane render | 검증·렌더링·전달 |
| brief | 1. 요약 질문 | backend | prep | source:s-s1 |
| course | 2. 코스 설계 | backend | prep | source:s-course |
| build | 2. HTML·카메라 작성 | backend | code | source:s-build |
| stills | 3. 스틸 점검 | backend | render | source:s-s3 |
| draft | 3. 초안 렌더 | backend | render | source:s-s3 |
| review | 수정 요청? | backend | render | source:s-s3 |
| final | 3. 최종 렌더 | backend | render | source:s-s3 |
| brief > course | 확정 |
| course > build | 설계 |
| build > stills | 준비 |
| stills > build | 수정 | dashed |
| stills > draft | 통과 |
| draft > review | 전달 |
| review > build | 재작업 | dashed |
| review > final | 승인 | emphasis |

@steps id=flow-steps
| s-brief | 1. 요약 질문 | **입력** 사용자 요청 · **출력** 제품·핵심 메시지·브랜드·화면비·길이·음악·3~6단계 흐름 메모. **처리** 한 메시지에서 7개 항목과 선택 워크플로를 묻고, URL이 있으면 웹에서 실제 문구·색상·폰트를 가져오며 빈칸은 직접 정해 알린다.[](source:s-s1) | flow-diagram | brief |
| s-course | 2. 코스 설계 | **입력** 3~6단계 제품 흐름 · **출력** 영웅 종류, 3배 크기 캔버스 위 스테이션 배치, 접촉 박자표. **처리** 토글·슬라이더·알림 계단·키보드 등 반응하는 스테이션을 지그재그로 놓고, 포물선 낙하와 마지막 슬로우모션 발사·역방향 초기화로 루프 이음매를 맞춘다.[](source:s-course) | flow-diagram | course |
| s-build | 2. HTML·카메라 작성 | **입력** 코스·접촉 박자표 · **출력** 단일 `demo.html`과 `render.mjs`. **처리** `seek(t % duration)` 순수 함수와 1/240초 간격으로 `bake`(미리 계산해 저장)한 카메라 추적·0.3배 3D 틸트 리빌·접촉음 `buildAudio`를 구현한다.[](source:s-look)[](source:s-build) | flow-diagram | build |
| s-stills | 3. 스틸 점검 | **입력** `demo.html` · **실행** `node render.mjs demo.html check.png --stills 0.5,1.2,…` · **출력** `check.png` 컨택트 시트(정지 화면 모음). **처리** 박자표 순간마다 정지 화면을 찍어 영웅 잘림·스테이션 겹침·프레이밍 오류를 고친 뒤 다시 확인한다.[](source:s-s3) | flow-diagram | stills |
| s-draft | 3. 초안 렌더 | **입력** 점검된 `demo.html` · **실행** `node render.mjs demo.html draft.mp4 30 1 4` · **출력** `draft.mp4`. **처리** 모션 블러 없이 30fps로 빠르게 뽑은 검토본을 `demo.html`과 함께 사용자에게 보낸다.[](source:s-s3) | flow-diagram | draft |
| s-review | 수정 요청? | **입력** 사용자 검토 응답 · **출력** 수정 재작업 또는 최종 렌더 분기. **처리** 최종 렌더링 전에 바꿀 점을 묻고, 수정 요청이 오면 HTML을 고쳐 다시 뽑는다.[](source:s-s3) | flow-diagram | review |
| s-final | 3. 최종 렌더 | **입력** 확정된 `demo.html` · **실행** `node render.mjs demo.html demo.mp4 60 8 8` · **출력** `demo.mp4`·`demo_silent.mp4`·요약 노트. **처리** 60fps·서브프레임 8배 모션 블러와 `-16 LUFS` 정규화 음향을 입힌 뒤, 파일과 함께 자리표시 내역·다음 버전 대안 한 문장을 전한다.[](source:s-s3)[](source:s-rm) **다음** 시작 전에 모션 블러 렌더링에 20~60분 걸릴 수 있음을 알린다.[](source:s-s3) | flow-diagram | final |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 호출형(`description` 기반) 또는 사용자 직접 호출. 호출 제한 필드 없음.[](source:s-fm) |
| 성격 | 절차형(3단계 원테이크 루프 영상 제작). 단일 영웅이 제품 스테이션을 지나고 전체 코스를 비춘 뒤 첫 스테이션으로 돌아오는 HTML·MP4를 만든다.[](source:s-intro)[](source:s-course) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `sound-effects` {#rel-r04} | **이 스킬** | 결과 전달 | 미확인: `sound-effects`는 코드 음향 합성을 금지하지만 이 스킬은 자체 `buildAudio`로 접촉음·그루브를 합성하며 서로 부르지 않는다.[](source:s-look)[](source:s-build)[](source:rel-sfx) |
| `explainer-default` {#rel-r06} | **이 스킬** | 대안 | `README.md`가 자매 스킬로 비교한다. 차분한 60초 UI 클로즈업 데모 대신 원테이크 루프 스토리를 원할 때 사용자가 고른다.[](source:s-readme) |
| **이 스킬** {#rel-r08} | `explainer-high-energy` | 대안 | `README.md`가 자매 스킬로 비교한다. 연속 원테이크 대신 15초 빠른 쇼릴 스타일 홍보 영상일 때 사용자가 고른다.[](source:s-readme) |

@architecture id=relation-map title="explainer-engaging과 이어지는 스킬"
| sfx | sound-effects | backend |
| def | explainer-default | backend |
| self | explainer-engaging(이 스킬) | backend |
| high | explainer-high-energy | backend |
| sfx > self | 결과 전달(미확인) |
| def > self | 대안 |
| self > high | 대안 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 3단계 제작 절차, 8종 스테이션·물리·카메라 규칙, 단일 HTML 계약, `render.mjs` 코드를 담은 본문 260줄 | 원테이크·루프형 제품 설명 영상을 요청받으면 읽는다 | 1. 요약 질문, 2. 코스 설계, 2. HTML·카메라 작성, 3. 스틸 점검, 3. 초안 렌더, 수정 요청?, 3. 최종 렌더 |
| `README.md` | 자매 스킬 3종 비교 표, 사용법, 사전 요구사항을 적은 안내 문서 27줄 | 에이전트가 실행 중에 읽지 않음(사람용 안내 문서)[](source:s-readme) | - |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 사용자에게 질문할 때 | 첫 메시지 한 번에 모두 묻고, 제품만 필수이며 빈칸은 에이전트가 정해 알린다. | [](source:s-s1) |
| 수치·로고·사실을 다룰 때 | 없는 통계·후기·할인은 지어내지 않으며, 로고도 미제공 시 브랜드 폰트 텍스트나 중립 타일로 대신한다. | [](source:s-s1) |
| 영웅과 스테이션을 구성할 때 | 영웅은 영상 끝까지 하나만 쓰고 사라지지 않게 하며, 설명 자막 오버레이 없이 스테이션 자체 라벨만 쓴다. | [](source:s-course)[](source:s-look) |
| 카메라와 루프 이음매를 짤 때 | 컷 전환·검은 페이드를 금지하고, `seek(duration)`이 `seek(0)`과 정확히 같도록 이음매 양끝에 착지 스쿼시와 잔향을 겹쳐 넣는다. | [](source:s-course)[](source:s-look)[](source:s-build) |
| `seek(t)`와 오디오를 짤 때 | 순수 시간 함수로 작성해 CSS transition·`setTimeout`·`Math.random`을 금지하고, 카메라 스무딩은 로드 시 1/240초 단위로 `bake`한다. | [](source:s-look)[](source:s-build) |
| 초안(`draft.mp4`)을 만든 뒤 | 최종 렌더링으로 바로 가지 않고 HTML과 초안을 사용자에게 보내 수정 여부를 확인한다. | [](source:s-s3) |
| 최종(`demo.mp4`) 렌더를 시작하기 전 | 서브프레임 8배 모션 블러가 적용되므로 렌더링이 오래 걸릴 수 있음을 먼저 알린다. | [](source:s-s3) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 스테이션 물리·슬로우모션 발사·카메라 스프링 설계 — 맡을 개요 항목: Step 2 코스·물리 설계 · 8종 스테이션 반응표, 스쿼시·스트레치 비율, `bake` 가중치(0.7·0.15·0.85)와 3D 틸트 리빌 수치를 줄여 담았다.
- `render.mjs` 8배 서브프레임 렌더링 파이프라인 — 맡을 개요 항목: Step 3 최종 렌더·전달 · 180도 셔터 `tmix` 필터와 `-16 LUFS` 오디오 정규화 구현을 요약해 두었다.

읽은 원본: 텍스트 파일 2개(`SKILL.md`, `README.md`). 제외: 없음.
