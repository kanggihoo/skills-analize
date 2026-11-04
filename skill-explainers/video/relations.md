# video 관계 원장
분석 커밋: 23e8047abc33a363aec7f43e75255b2a46281ff7

- 범위: `video/` 아래 `SKILL.md` 10개. 작성자 폴더 4개(`Barty-Bart`, `latent-spaces`, `bangtutorial`, `lemomo-ai`)에 나뉘어 있다. 원격 출처는 폴더마다 있는 `skills-lock.json`이다. `Barty-Bart`의 스킬 6개는 모두 `Barty-Bart/motion-graphics` 저장소의 `skills/<이름>/SKILL.md`다.
- **커밋 상태**: `video/`는 분석을 시작할 때 저장소에 한 번도 커밋되지 않은 상태(`?? video/`)였다. 출처 인용(`@source path=`)이 커밋된 원문을 요구해서, 사용자 승인을 받아 `video/`만 local commit(`23e8047`, 491개 파일)했다. 위 "분석 커밋"이 그 commit이다. push는 하지 않았다.
- 번역본: 이 컬렉션에는 없다. `bang-motion/references/opener-konsep.md`는 접미사 `-KO`가 아니라 인도네시아어 단어 `konsep`이 든 원본 파일이다. `bang-motion`은 SKILL.md 본문이 인도네시아어이며, 그것이 원본이다.
- 원문 비교: 이 10개와 이름이 같은 스킬은 다른 컬렉션에 없다(`find`로 확인). 같은 컬렉션 안에서 `brag/slim.md`와 `brag-slim/SKILL.md`는 `shasum`이 같다(`11c041fc…`).
- 번들 폴더: `brag/`에는 `slim.md`(= brag-slim 사본)가 들어 있다. `Barty-Bart/` 아래 스킬 폴더마다 `README.md`가 있고, 이 README는 SKILL.md가 아닌 안내 문서다.
- 이번에 대조하지 않은 것: `design/garden-skills/motion-showreel`, `web-video-presentation`은 영상 스킬이지만 다른 컬렉션이라 읽지 않았다. 관계를 적지 않는다.
- 조사 상태 표기: `부분`은 필수 자료 일부를 확인하지 못했다는 뜻이다. `brag`(Hyperframes 스킬 4개가 저장소에 없고, `uv.lock`·`sfx-analysis.json`·`music-cues.json`은 구조·표본만 확인), `lemo-opuscar`(내려받는 외부 라이브러리를 확인하지 못함)가 해당한다. `sound-effects`의 `sfx/manifest.json`도 구조·표본만 읽었다. 바이너리(mp3·ogg·wav·jpg·png·woff2)는 읽었다고 하지 않았다.
- 외부 의존: `brag`는 Hyperframes 스킬(`hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`)을 읽으라고 하지만 이 저장소에는 없다. `범위 밖`이다. `bang-motion`의 Higgsfield MCP(`ae_*`)도 `범위 밖`이다.

## 스킬

| 경로 ID | 한 줄 요약 | 조사 상태 | 원문 비교 | 소속 묶음 | 역할 |
|---|---|---|---|---|---|
| video/latent-spaces/brag | 프로젝트 코드를 읽고 Hyperframes로 15~25초 출시 영상을 만든다 | 부분 | - | launch-video | 단계 |
| video/latent-spaces/brag-slim | 프로젝트 폴더나 웹사이트 URL로 출시 영상을 모델이 혼자 끝까지 만든다 | 완료 | 원문 동일: video/latent-spaces/brag/slim.md | launch-video | 변형 |
| video/Barty-Bart/explainer-default | 제품 시연을 담은 45~90초 차분한 데모 영상을 코드에서 MP4로 렌더링한다 | 완료 | - | product-explainer | 선택지 |
| video/Barty-Bart/explainer-engaging | 주인공 요소 하나가 제품 흐름을 한 번에 지나가는 10~30초 원테이크 영상을 만든다 | 완료 | - | product-explainer | 선택지 |
| video/Barty-Bart/explainer-high-energy | 박자에 맞춘 빠른 장면 전환의 12~20초 홍보 영상을 만든다 | 완료 | - | product-explainer | 선택지 |
| video/Barty-Bart/motion-broll | 말하는 사람 영상과 자막을 받아 말에 맞춘 모션그래픽 B-roll 클립을 만든다 | 완료 | - | talking-head-edit | 단계 |
| video/Barty-Bart/object-separation | SAM 2로 영상 속 사람·제품·손을 배경에서 분리하고 마스크를 저장한다 | 완료 | - | talking-head-edit | 단계 |
| video/Barty-Bart/sound-effects | 모션그래픽 영상에 박자를 맞춘 효과음·음악을 넣고 음량을 측정해 검증한다 | 완료 | - | talking-head-edit | 단계 |
| video/bangtutorial/bang-motion | HTML·CSS·GSAP로 홍보 영상·오프너·설명 영상을 영화처럼 움직이게 만든다 | 완료 | - | - | 단계 |
| video/lemomo-ai/lemo-opuscar | 외부 Lemo-Opuscar 라이브러리를 내려받아 설치하고, 그 라이브러리의 스타일 중 하나로 단편 영상을 만들도록 넘기는 입구 스킬이다 | 부분 | - | - | 단계 |

## 관계

출처 표기는 `스킬폴더/파일:줄`이다. 파일을 생략하면 그 스킬의 `SKILL.md`다. 작업 트리 기준 줄 번호다.

### brag와 brag-slim

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r01 | brag | brag-slim | 넘김 | 명시-이름 | 모델이 Claude Opus 5.5이고, 호출이 전체 워크플로(`--full`, "use the full brag")나 음성 해설(`--voice`)을 요구하지 않을 때 `slim.md`를 읽고 "이번 실행의 나머지"를 그쪽 지시로 따른다(의무형). 모델이 다르거나 알 수 없으면 이 검사를 건너뛴다. 넘기기 전에 사용자에게 한 줄로 알리고, "use the full brag"라고 말하면 되돌릴 수 있다고 안내한다 | 사용자 입력, 다른 옵션(`--no-music`, `--title` 등)은 평문 지시로 전달 | - | 범위 내 | brag:12; brag-slim:3 |
| r02 | brag-slim | brag | 참고 | 명시-이름 | description에서 "`/brag`도 설치돼 있으면 해당 호출 문구는 `/brag`에 맡긴다. `/brag`가 Opus 5.5에서 여기로 넘긴다"고 밝힌다. 본문에서 `/brag`를 부르는 단계는 없다 | - | - | 범위 내 | brag-slim:3 |

### Barty-Bart 영상 스킬 사이

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r03 | sound-effects | motion-broll | 산출물 호환 | 명시-이름 | cue 목록을 만들 때 "구성 소스에서 가져올 수 있으면" 가져오는 곳으로 HyperFrames·Remotion 타임라인, GSAP 라벨과 함께 motion-broll의 `plan.json`을 든다. 권고형이며 필수 순서는 아니다. 적용 대상 설명에도 motion-broll이 들어 있다 | motion-broll `plan.json` → sound-effects `cues.json` | 파일 | 범위 내 | sound-effects:3,62; motion-broll:117-120 |
| r04 | sound-effects | explainer-default, explainer-engaging, explainer-high-energy | 산출물 호환 | 미확인 | sound-effects의 적용 대상은 "Claude Code로 만든 모션그래픽 영상"이다. explainer 3종은 자체 `buildAudio`로 합성 음악·효과음을 넣는데, sound-effects는 "코드로 음악·효과음을 합성하지 말라"고 한다. 어느 SKILL.md도 서로를 부르지 않는다. 후속 사용 여부는 원문에서 확인되지 않아 `미확인`으로 남긴다 | - | - | 불명 | sound-effects:3,28; explainer-default:21,112-113 |
| r05 | motion-broll | object-separation | 같은 계열 | 추론 | 두 스킬 모두 사용자가 가진 영상을 처리한다. motion-broll README는 "motion-broll, object-separation 또는 둘 다 설치"를 안내한다. 두 SKILL.md는 서로를 부르지 않는다. 파이프라인 연결은 `미확인` | - | - | 범위 내 | motion-broll/README.md:28; motion-broll:3; object-separation:3 |
| r06 | explainer-default | explainer-engaging | 같은 계열 | 명시-이름 | 각 README가 서로를 "Sister skills"로 부르고 길이와 연출 차이를 표로 비교한다. 고르는 방식이며 순서는 없다 | - | - | 범위 내 | explainer-default/README.md:9,13-15; explainer-engaging/README.md:9 |
| r07 | explainer-default | explainer-high-energy | 같은 계열 | 명시-이름 | r06과 같다 | - | - | 범위 내 | explainer-default/README.md:9,13-15; explainer-high-energy/README.md:9 |
| r08 | explainer-engaging | explainer-high-energy | 같은 계열 | 명시-이름 | r06과 같다 | - | - | 범위 내 | explainer-engaging/README.md:9; explainer-high-energy/README.md:9 |

### 컬렉션 밖 의존

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r09 | brag | hyperframes, hyperframes-cli, hyperframes-registry, media-use | 내부 위임 | 명시-이름 | 3단계에서 이 스킬들을 "Read"하라고 지시한다. 구성 구조·애니메이션 타이밍·렌더 워크플로는 Hyperframes가 맡고, brag는 제품 각도·스토리보드·톤·음악 선택을 맡는다. 단 Hyperframes의 `references/types/*`, `story.md`, `SPEC.md` 단계와 `usage`, `history`, `feedback`, REVIEW.md 단계는 건너뛴다(`check`가 brag의 통과 조건) | brag 계획·구성 지시문 | `npx hyperframes check` | 범위 밖 | brag:114,120-122 |
| r10 | bang-motion | Higgsfield MCP(`ae_*` bridge) | 참고 | 명시-이름 | After Effects가 열려 있고 `ae_*` MCP bridge가 연결돼 있으며 사용자가 AE에서 짓기를 요청한 세 조건이 모두 맞을 때 "bridge 명령으로 직접 짓는다"는 명령형이다. 안 맞으면 기본 경로는 브라우저 HTML이다. 종류는 `참고`로 두지만 강도는 조건부 의무에 가깝다. 참조 문서가 다루는 것은 카툰 무대 설명 영상뿐이다 | - | After Effects | 범위 밖 | bang-motion:3,514-518; bang-motion/references/ae-bridge-higgsfield.md:3-4 |
| r15 | bang-motion | Higgsfield MCP(이미지·영상 생성) | 참고 | 명시-이름 | 사진·영상 소재를 MCP로 생성하는 경로를 "bila disetujui(동의되면)" 조건으로 소개한다. 카툰 이미지 생성 쪽의 동의 문구는 `bang-motion` 페이지 감사 패널에서 `원문에 명시 없음`으로 남겼다 | - | Higgsfield MCP | 범위 밖 | bang-motion/references/opener-konsep.md:342; bang-motion/references/explainer.md:267 |

### 같은 계열

작성자가 달라도 목적이 같은 스킬이다. 근거는 두 description이다.

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r11 | explainer-default | bang-motion | 같은 계열 | 추론 | 둘 다 설명·데모 영상을 HTML로 만들어 렌더링한다. 직접 연결은 없다. 스타일 선택 방식이 다르다 | - | - | 범위 내 | explainer-default:3; bang-motion:3 |
| r12 | explainer-high-energy | bang-motion | 같은 계열 | 추론 | 둘 다 홍보 영상·티저·오프너를 코드로 만든다 | - | - | 범위 내 | explainer-high-energy:3; bang-motion:3 |
| r13 | explainer-default | lemo-opuscar | 같은 계열 | 추론 | 둘 다 "영상·홍보·설명"을 코드로 만든다. lemo-opuscar는 이름 붙은 스타일을 고르는 방식이다 | - | - | 범위 내 | explainer-default:3; lemo-opuscar:3 |
| r14 | brag | explainer-high-energy | 같은 계열 | 추론 | 둘 다 제품 홍보·출시 영상을 코드에서 만든다. brag는 프로젝트 코드를 읽어 소재를 얻고, explainer는 제품 설명을 질문으로 받는다 | - | - | 범위 내 | brag:3; explainer-high-energy:3 |

## 묶음

| group-id | 작업 목표 | 구성 스킬과 역할 | 그림 |
|---|---|---|---|
| launch-video | 내 프로젝트를 소개하는 출시 영상을 만든다 | brag(전체 워크플로, 기본), brag-slim(Opus 5.5 변형) | `@workflow`: brag 호출 → 모델·옵션 확인? → 예: brag-slim으로 넘김 / 아니오: brag 4단계(r01). r02는 표에만 |
| product-explainer | 제품 소개 영상의 연출 방식을 고른다 | explainer-default(차분한 데모), explainer-engaging(원테이크), explainer-high-energy(빠른 홍보) | `@workflow`: 결정 노드 하나에서 세 갈래(r06~r08, 서로 순서 없음). sound-effects와의 관계(r04)는 `미확인`이라 그리지 않고 표에 남긴다 |
| talking-head-edit | 말하는 사람 영상을 가공하고 소리를 입힌다 | motion-broll(B-roll 클립 제작), sound-effects(소리 입히기), object-separation(피사체 분리·같은 계열) | `@workflow`: motion-broll → sound-effects(r03, 권고). object-separation은 연결이 없어(r05 같은 계열) 선을 긋지 않고 표에 둔다 |

독립 스킬(묶음 없음): bang-motion(연결 없음, r11·r12는 같은 계열 표시), lemo-opuscar(r13은 같은 계열 표시).
