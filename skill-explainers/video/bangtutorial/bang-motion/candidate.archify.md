# bang-motion — HTML·CSS·GSAP로 영화처럼 움직이는 웹 모션 그래픽을 만든다 {#overview}

`bang-motion`은 에이전트가 홍보 영상·오프너·설명 영상·키네틱 타이포그래피를 파워포인트 슬라이드처럼 보이지 않게 HTML·CSS·GSAP(필요 시 Three.js) 단일 파일로 만들거나, 조건이 맞으면 Higgsfield MCP bridge로 After Effects에 직접 짓게 하는 스킬이다.[](source:s-fm)[](source:s-intro)

- 사용자가 홍보 영상·오프너·인트로·모션 그래픽·설명 영상(16:9 또는 9:16)·MP4 렌더·After Effects 직결 빌드를 요청하거나, 웹 애니메이션이 슬라이드 같다고 지적할 때 모델이 `description`으로 판단해 켠다.[](source:s-fm)
- 결과로 브라우저에서 더블클릭(`file://`)으로 바로 자동 재생·반복되는 단일 `index.html`(설명 영상이면 `vo-script.md` 포함)이 남으며, 요청 시 프레임별 PNG를 묶은 MP4나 After Effects 컴포지션을 낸다.[](source:s-wf6)[](source:s-wf7)[](source:s-ae)
- 다른 스킬과의 관계: `explainer-default`·`explainer-high-energy`·`script-to-motion`과 대안 관계이며, Higgsfield MCP(`ae_*` bridge 및 이미지·영상 생성)를 조건부로 참고한다.
- 시스템 시계(`Date.now()`)·무작위(`Math.random()`) 사용, 3개 이상 `<section>` fade 전환, 3단계 텍스트 쌓기, starter 기본 색상·폰트 방치, 참고 영상의 외형(팔레트·폰트·배치) 복제를 금지한다.[](source:s-ban)[](source:s-law2)[](source:s-law3)

@answer scope="video/bangtutorial/bang-motion · 원본 파일 17개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=f53b74e8bae4a9f9a8a11d2d3d0dc2b980b855ed
@source s-fm title="frontmatter: name, description, metadata" path=video/bangtutorial/bang-motion/SKILL.md lines=1:11
@source s-intro title="스킬 개요와 전제(브라우저·무플레이어)" path=video/bangtutorial/bang-motion/SKILL.md lines=13:57
@source s-ban title="구조적 금지 8가지(PPT 판별 기계 검사)" path=video/bangtutorial/bang-motion/SKILL.md lines=58:113
@source s-types title="작업 종류표와 설명 영상·캐릭터 분기" path=video/bangtutorial/bang-motion/SKILL.md lines=114:146
@source s-law1 title="법칙 1: 슬라이드가 아닌 영상(anti-ppt)" path=video/bangtutorial/bang-motion/SKILL.md lines=147:174
@source s-law2 title="법칙 2: 결정론(tl.time() 순수 함수)" path=video/bangtutorial/bang-motion/SKILL.md lines=175:183
@source s-law3 title="법칙 3: 주제에서 나온 스타일과 10가지 스타일 방향" path=video/bangtutorial/bang-motion/SKILL.md lines=184:290
@source s-law4 title="법칙 4: 살아있는 텍스트와 배경 대비" path=video/bangtutorial/bang-motion/SKILL.md lines=291:326
@source s-wf0 title="워크플로 0~0b: 종류 판별·질문·style brief" path=video/bangtutorial/bang-motion/SKILL.md lines=327:337
@source s-wf12 title="워크플로 1~2: 레퍼런스 리듬 흡수와 rundown 승인" path=video/bangtutorial/bang-motion/SKILL.md lines=337:348
@source s-wf34 title="워크플로 3~4: starter 복사와 장면 구현" path=video/bangtutorial/bang-motion/SKILL.md lines=348:362
@source s-wf5 title="워크플로 5: snap.mjs·?debug=1 시각 검증" path=video/bangtutorial/bang-motion/SKILL.md lines=362:371
@source s-wf6 title="워크플로 6: 단일 index.html 전달 및 선택적 MP4 내보내기" path=video/bangtutorial/bang-motion/SKILL.md lines=371:382
@source s-wf7 title="워크플로 7: 설명 영상 VO 대본 전달과 재동기화" path=video/bangtutorial/bang-motion/SKILL.md lines=383:387
@source s-ae title="After Effects Higgsfield MCP bridge 직결 빌드" path=video/bangtutorial/bang-motion/SKILL.md lines=514:526
@source r-exp0 title="explainer.md: 0단계 1회 질문과 6가지 설명 영상 스타일" path=video/bangtutorial/bang-motion/references/explainer.md lines=25:62
@source r-kp title="kartun-panggung.md: 카툰 무대 7대 법칙과 수동 관절 rig" path=video/bangtutorial/bang-motion/references/kartun-panggung.md lines=8:24
@source r-ok title="opener-konsep.md: 19가지 오프너 개념 메뉴와 사진 MCP" path=video/bangtutorial/bang-motion/references/opener-konsep.md lines=12:79
@source r-ok-photo title="opener-konsep.md: 오프너 사진 출처 질문과 MCP 생성" path=video/bangtutorial/bang-motion/references/opener-konsep.md lines=323:356
@source r-aeb title="ae-bridge-higgsfield.md: AE bridge 기능·제약과 6단계" path=video/bangtutorial/bang-motion/references/ae-bridge-higgsfield.md lines=10:41
@source r-tech title="techniques.md: 타이포·카메라·전환·배경 메뉴" path=video/bangtutorial/bang-motion/references/techniques.md lines=1:23
@source r-arch title="architecture.md: #world 카메라 rig와 단일 파일 이유" path=video/bangtutorial/bang-motion/references/architecture.md lines=38:55
@source r-ap title="anti-ppt.md: 슬라이드 판정 위반과 수정표" path=video/bangtutorial/bang-motion/references/anti-ppt.md lines=1:15
@source sc-kep title="kepala-ekspresi.py: 로컬 얼굴 표정·깜빡임 생성" path=video/bangtutorial/bang-motion/scripts/kepala-ekspresi.py lines=1:17
@source rel-ed title="explainer-default description" path=video/Barty-Bart/explainer-default/SKILL.md lines=1:4
@source rel-eh title="explainer-high-energy description" path=video/Barty-Bart/explainer-high-energy/SKILL.md lines=1:4
@source rel-stm title="script-to-motion description" path=video/script-to-motion/SKILL.md lines=1:4

## 어떻게 동작하나 {#flow span=12}

설명 영상일 때는 0단계에서 스타일(6종 중 추천 포함)·화면 비율·길이·소리 유무를 한 번의 질문으로 먼저 확정하고, 오프너일 때는 19가지 개념 메뉴에서 후보 3개를 골라 `style brief`(스타일 설계 메모)와 `rundown`(초 단위 장면표)에 사용자 승인을 받은 뒤에만 코드를 연다.[](source:s-wf0)[](source:s-wf12)[](source:r-exp0)[](source:r-ok) After Effects가 열려 있고 `ae_*` MCP bridge가 연결돼 있으며 사용자가 AE 빌드를 요청한 세 조건이 맞으면 브라우저 HTML 대신 AE 직결 경로로 분기한다.[](source:s-ae)[](source:r-aeb)

@workflow id=flow-diagram title="bang-motion 흐름"
| lane plan | 기획·승인 |
| lane build | 구현·제작 |
| lane ship | 검증·전달 |
| classify | 0. 종류 판별·질문 | backend | plan | source:s-wf0 |
| brief | 0b~2. brief·rundown 승인? | backend | plan | source:s-wf12 |
| route | AE bridge 조건? | backend | build | source:s-ae |
| scaffold | 3~4. starter 복사·구현 | backend | build | source:s-wf34 |
| aebuild | AE bridge 직결 빌드 | backend | build | source:r-aeb |
| verify | 5. 핵심 초 시각 검증 | backend | ship | source:s-wf5 |
| deliver | 6~7. 단일 파일·VO 전달 | backend | ship | source:s-wf6 |
| classify > brief | 스타일·비율·길이 확정 |
| brief > route | 사용자 승인 완료 | emphasis |
| brief > classify | 수정 요청 | dashed |
| route > scaffold | 브라우저 HTML(기본) |
| route > aebuild | AE 열림+bridge+요청 |
| scaffold > verify | 8가지 PPT 금지 점검 |
| aebuild > verify | contact sheet 생성 |
| verify > scaffold | 결함 발견·수정 | dashed |
| verify > deliver | 시각 통과 | emphasis |

@steps id=flow-steps
| s-classify | 0. 종류 판별·질문 | **입력** 사용자 요청·참고 영상 · **참조** `references/explainer.md`, `references/opener-konsep.md` · **출력** 작업 종류와 확정된 제작 조건(스타일·비율·길이·소리). **처리** 설명 영상이면 한 번의 질문으로 6가지 스타일·비율·길이·소리를 정하고, 그 외는 요청에서 추론할 수 없는 항목만 묻는다.[](source:s-types)[](source:s-wf0)[](source:r-exp0) | flow-diagram | classify |
| s-brief | 0b~2. brief·rundown 승인? | **입력** 브랜드 공식 자료·참고 영상 리듬 · **참조** `references/opener-konsep.md`, `references/anti-ppt.md` · **출력** `style brief`와 초 단위 `rundown`. **처리** 참고 영상의 리듬만 취하고 브랜드 색상·폰트·배경 언어·움직임 서명·구조 지문(후보 3개 중 1개 선택)을 작성해 사용자 승인을 받는다.[](source:s-law3)[](source:s-wf12)[](source:r-ok)[](source:r-ap) **다음** 사진이 필요하면 출처(사용자 제공·Higgsfield MCP 생성·라이선스 스톡)를 먼저 합의한다.[](source:r-ok-photo) | flow-diagram | brief |
| s-route | AE bridge 조건? | **입력** 확정된 `style brief`·`rundown` · **출력** 실행 경로 결정(브라우저 HTML 또는 After Effects). **처리** After Effects 실행 여부, Higgsfield `ae_*` MCP 연결, 사용자의 AE 빌드 요청 세 가지가 모두 참인지 확인한다.[](source:s-ae) | flow-diagram | route |
| s-scaffold | 3~4. starter 복사·구현 | **입력** `rundown`·브랜드 에셋 · **참조** `assets/starter-*.html`, `references/architecture.md`, `references/techniques.md`, `references/kartun-panggung.md` · **실행** `python scripts/serve.py`, `python scripts/kepala-ekspresi.py` · **출력** `#world` 카메라 rig와 `tl.time()` 순수 함수로 동작하는 웹 모션 코드. **처리** 목적에 맞는 `starter 파일`을 복사한 뒤 임시 회색·기본 폰트·WebGL을 즉시 걷어내고, 장면마다 효과와 수동 관절 rig를 구현한다.[](source:s-law2)[](source:s-wf34)[](source:r-arch)[](source:r-tech)[](source:r-kp)[](source:sc-kep) | flow-diagram | scaffold |
| s-aebuild | AE bridge 직결 빌드 | **입력** `rundown`·SVG 에셋 코드 · **참조** `references/ae-bridge-higgsfield.md` · **실행** `python scripts/ae/bridge/aset-svg.py`, `node scripts/ae/bridge/svg2png.cjs`, `python scripts/ae/bridge/rig-tokoh.py` · **출력** After Effects 마스터·무대 프리컴프. **처리** 소형 Lottie로 뼈대를 세운 뒤 뒤에서 앞 순서로 PNG 2배율 에셋과 관절 캐릭터를 `ae_batch`로 배치한다.[](source:s-ae)[](source:r-aeb) | flow-diagram | aebuild |
| s-verify | 5. 핵심 초 시각 검증 | **입력** 구현된 장면 또는 AE 컴프 · **실행** `node scripts/snap.mjs` · **출력** 핵심 시점(6~20장) 콘택트 시트와 통과 판정. **처리** 전체 프레임을 렌더하지 않고 핵심 시점만 찍어(`?debug=1` 수동 확인 가능) 텍스트 잘림·겹침·8가지 PPT 금지 위반을 눈으로 검수한다.[](source:s-ban)[](source:s-wf5) | flow-diagram | verify |
| s-deliver | 6~7. 단일 파일·VO 전달 | **입력** 검증된 코드 또는 AE 컴프 · **실행** `node scripts/export-frames.mjs` (MP4 요청 시), `scripts/vo-pauses.html` (음성 무음 구간 감지) · **출력** 더블클릭 가능한 단일 `index.html`(필요 시 `vo-script.md`·MP4). **처리** CSS와 인라인 module 스크립트를 한 파일에 묶어 서버 없이 열리게 전달하고, 설명 영상이면 VO 녹음 요청과 대본을 함께 남긴다.[](source:s-wf6)[](source:s-wf7) | flow-diagram | deliver |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 호출형. `description`이 홍보 영상·오프너·인트로·모션 그래픽·설명 영상·PPT 탈피·MP4 렌더·AE bridge 빌드를 폭넓게 잡는다.[](source:s-fm) |
| 성격 | 절차형(기획·승인 → 브라우저 HTML 또는 AE 직결 빌드 → 핵심 시점 시각 검증·전달). |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#rel-r10} | `Higgsfield MCP(ae_* bridge)` | 참고 | After Effects 열림·`ae_*` 연결·사용자 AE 요청 세 조건이 모두 맞을 때 bridge 명령으로 직접 짓는다(조건부 의무, 범위 밖).[](source:s-ae)[](source:r-aeb) |
| **이 스킬** {#rel-r15} | `Higgsfield MCP(이미지·영상 생성)` | 참고 | 오프너·설명 영상의 사진·영상 소재를 `bila disetujui`(동의되면) 조건으로 생성한다(카툰 머리 생성은 원문 동의 문구 미명시, 범위 밖).[](source:r-ok-photo)[](source:r-kp) |
| `explainer-default` {#rel-r11} | **이 스킬** | 대안 | 둘 다 코드 기반 HTML 설명·데모 영상을 만든다. 직접 연결은 없으며 스타일 선택과 렌더 방식이 다르다.[](source:s-fm)[](source:rel-ed) |
| `explainer-high-energy` {#rel-r12} | **이 스킬** | 대안 | 둘 다 코드 기반 홍보 영상·티저·오프너를 만든다. 직접 연결은 없다.[](source:s-fm)[](source:rel-eh) |
| `script-to-motion` {#rel-r18} | **이 스킬** | 대안 | 둘 다 HTML·CSS·GSAP로 브라우저 모션 영상을 만든다. 직접 연결은 없으며 나레이션 TTS·승인 녹음 흐름은 `script-to-motion`에만 있다.[](source:s-fm)[](source:rel-stm) |

@architecture id=relation-map title="bang-motion과 이어지는 스킬"
| ed | explainer-default | backend |
| eh | explainer-high-energy | backend |
| stm | script-to-motion | backend |
| self | bang-motion(이 스킬) | backend |
| hfae | Higgsfield MCP(ae_* bridge) | external |
| hfimg | Higgsfield MCP(이미지·영상 생성) | external |
| ed > self | 대안 |
| eh > self | 대안 |
| stm > self | 대안 |
| self > hfae | 참고 |
| self > hfimg | 참고 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 전체 워크플로, 8가지 PPT 금지, 4대 법칙, 10가지 스타일 방향 표, 최종 체크리스트 | 스킬이 켜질 때 읽는다 | 0. 종류 판별·질문, 0b~2. brief·rundown 승인?, AE bridge 조건?, 3~4. starter 복사·구현, 5. 핵심 초 시각 검증, 6~7. 단일 파일·VO 전달 |
| `references/explainer.md` | 설명 영상 0단계 1회 질문, 6가지 스타일 규격, VO 대본 전달·재동기화 규칙 | 설명 영상 작업일 때 읽는다[](source:s-wf0)[](source:r-exp0) | 0. 종류 판별·질문, 6~7. 단일 파일·VO 전달 |
| `references/opener-konsep.md` | 19가지 오프너 개념 메뉴, 구조 지문 규칙, 사진 MCP 조달·애니메이션 가이드 | 오프너·홍보·인트로·티저 작업일 때 읽는다[](source:s-types)[](source:r-ok) | 0. 종류 판별·질문, 0b~2. brief·rundown 승인? |
| `references/anti-ppt.md` | 슬라이드형 실패 사례와 수정 대응표, 화면 4가지 감각 점검 | 장면을 설계하기 전에 읽는다[](source:s-law1)[](source:r-ap) | 0b~2. brief·rundown 승인? |
| `references/architecture.md` | `#world` 카메라 rig, 절대 초 타임라인, CSS 초기 숨김, 단일 HTML 인라인 원칙 | 스캐폴딩·구현할 때 읽는다[](source:s-wf34)[](source:r-arch) | 3~4. starter 복사·구현 |
| `references/techniques.md` | 키네틱 타이포, 방향성 모션 블러, 샷 크기, 배경 표면·움직임, 푸티지 레이어 레시피 | 장면과 효과를 만들 때 읽는다[](source:s-wf34)[](source:r-tech) | 3~4. starter 복사·구현 |
| `references/kartun-panggung.md` | `카툰 무대` 7대 법칙(줌 ≥ 1.08, 수동 관절 proxy `J()`, 무자막, 플랫 팔레트) | 카툰 무대(스타일 6) 설명 영상일 때 읽는다[](source:s-types)[](source:r-kp) | 3~4. starter 복사·구현 |
| `references/ae-bridge-higgsfield.md` | After Effects bridge 제약, `CAM` null 규격, 6단계 빌드 순서, 컴프 검증·인계 | AE가 열려 있고 `ae_*` bridge로 빌드할 때 읽는다[](source:s-ae)[](source:r-aeb) | AE bridge 직결 빌드 |
| `references/roadmap.md` | 스킬 개발 로드맵과 안티패턴(스킬 확장 시 참고) | 스킬 자체를 개선할 때 읽는다 | 3~4. starter 복사·구현 |
| `scripts/serve.py` | `Cache-Control: no-store` 정적 개발 서버(Python 선택 사항) | 로컬 ES 모듈 개발 중 브라우저 캐시 방지가 필요할 때 실행 | 3~4. starter 복사·구현 |
| `scripts/kepala-ekspresi.py` | 생성된 캐릭터 머리 PNG에서 기쁨·불안·놀람·깜빡임 변형과 `kepala-meta.json` 생성 | 카툰 무대 캐릭터 머리를 로컬에서 가공할 때 실행[](source:sc-kep) | 3~4. starter 복사·구현 |
| `scripts/ae/bridge/aset-svg.py` | 코드 기반 SVG 일러스트와 AE 배치용 `manifest.json` 생성 | AE bridge 빌드 2단계에서 실행[](source:r-aeb) | AE bridge 직결 빌드 |
| `scripts/ae/bridge/svg2png.cjs` | 생성된 SVG들을 Puppeteer로 2배율 투명 PNG로 변환 | AE bridge 빌드 2단계에서 `aset-svg.py` 뒤 실행[](source:r-aeb) | AE bridge 직결 빌드 |
| `scripts/ae/bridge/rig-tokoh.py` | After Effects 네이티브 관절 캐릭터용 `ae_batch` 연산 JSON 생성 | AE bridge 빌드 4단계에서 실행[](source:r-aeb) | AE bridge 직결 빌드 |
| `scripts/snap.mjs` | Puppeteer로 `file://` 페이지를 열어 핵심 시점만 스크린샷 촬영 | Node·Puppeteer 환경에서 시각 검증 시 실행[](source:s-wf5) | 5. 핵심 초 시각 검증 |
| `scripts/export-frames.mjs` | 타임라인을 60fps 프레임별 PNG로 저장(이후 ffmpeg로 MP4 인코딩) | 사용자가 MP4 내보내기를 요청했을 때만 실행[](source:s-wf6) | 6~7. 단일 파일·VO 전달 |
| `scripts/vo-pauses.html` | ffmpeg 없이 브라우저 Web Audio로 VO 무음 구간·문장 시작점(`SEG`/`PARA`) 추출 | ffmpeg가 없을 때 VO 재동기화용으로 브라우저에서 연다[](source:s-intro) | 6~7. 단일 파일·VO 전달 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| `style brief`와 `rundown` 승인 전일 때 | 코드를 작성하거나 starter를 건드리지 않고 사용자 승인을 기다린다. | [](source:s-wf0)[](source:s-wf12) |
| 설명 영상(explainer) 요청을 처음 받았을 때 | 스타일·비율·길이·소리를 한 번의 질문으로 묻고 답을 기다린다. | [](source:r-exp0) |
| 사진이 필요한 오프너일 때 | 사용자 사진·Higgsfield MCP 생성·스톡 중 출처를 먼저 합의한다. | [](source:r-ok-photo) |
| 사용자가 참고 영상을 제시했을 때 | 리듬·전환만 취하고 팔레트·폰트·배치 복제를 거부하며 주제 기반 대안을 제안한다. | [](source:s-law3) |
| 8가지 구조적 PPT 금지 중 1개라도 위반할 때 | 사용자에게 보여 주기 전에 해당 장면을 전면 재설계한다. | [](source:s-ban) |
| 이전 오프너와 스타일·구조가 겹칠 때 | 팔레트·폰트·배경 언어·움직임 서명 4가지 중 최소 3가지와 구조 지문 5요소 중 3가지 이상을 바꾼다. | [](source:s-law3)[](source:r-ok) |
| 애니메이션·렌더 경로를 짤 때 | `Date.now()`·`Math.random()`·속도 누적 대신 `tl.time()` 순수 함수만 쓴다. | [](source:s-law2) |
| 최종 결과물을 전달할 때 | `npm install`이나 로컬 서버 없이 더블클릭(`file://`)으로 열리는 단일 `index.html`로 낸다. | [](source:s-intro)[](source:s-wf6) |
| 카툰 무대(스타일 6)를 구현할 때 | 카메라 줌을 1.08 미만으로 내리지 않고(미니어처 금지), 무대당 움직이는 요소 10개 이상·무자막·수동 `J()` 관절을 지킨다. | [](source:r-kp) |
| Higgsfield AE bridge로 빌드한 뒤 | bridge가 저장·렌더·레이어 순서 변경을 못 하므로 사용자에게 `Ctrl+S`, 테스트 컴프 삭제, `aerender.exe` 명령과 타협점을 알린다. | [](source:s-ae)[](source:r-aeb) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 8가지 PPT 금지 검사와 19가지 오프너 개념 메뉴 — 맡을 개요 항목: 0b~2. brief·rundown 승인? · 오프너 구조 지문 5요소와 정식 컴포넌트 상한(최대 2개) 세부 규정을 뺐다.
- 카툰 무대 7대 법칙과 수동 관절 proxy `J()` — 맡을 개요 항목: 3~4. starter 복사·구현 · GSAP `transformOrigin` 버그 회피와 29개 관절 좌표 수치를 뺐다.
- After Effects Higgsfield MCP bridge 함정과 6단계 — 맡을 개요 항목: AE bridge 직결 빌드 · `add_null_layer` 좌표 점프와 CloudFront relay 우회 상세를 뺐다.

읽은 원본: 텍스트 파일 17개(`SKILL.md`, `references/` 8개, `scripts/` 8개). 제외: `assets/starter-*.html` 7개(코드 템플릿), `README.md`·`CHANGELOG.md`·`LICENSE`·`package.json`·`.claude-plugin/*.json` 6개(안내·메타), `docs/gallery/*.jpg`·`icon.png`·`icon.svg`(이미지).