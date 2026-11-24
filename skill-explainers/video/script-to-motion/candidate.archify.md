# script-to-motion — 대본·주제·기획서로 나레이션 모션그래픽 영상 프로젝트를 끝까지 만든다 {#overview}

`script-to-motion`은 에이전트가 대본·주제·기획서를 받아 브라우저(`file://`)에서 1× 속도로 재생되는 HTML·CSS·GSAP(선택적 Three.js·Blender 3D) 나레이션 모션그래픽 영상 프로젝트를 끝까지 만들고 검증한 뒤, 사용자 음성 녹음 승인만 남겨 전달하는 스킬이다.[](source:s-fm)[](source:s-intro)[](source:s-collab) **부분 분석**: 외부 캐시 `cokacmotion` 데모 전체와 런타임 실행 결과, 그리고 `references/`·`scripts/` 보조 파일 일부는 확인하지 못했다.

- 사용자가 대본·주제·기사·기획서로 설명·홍보·유튜브/쇼츠 영상을 요청하거나 기존 프로젝트 수정을 요청할 때 모델이 `description`으로 켠다. 실행 중에는 `PreToolUse` hook(`look_guard.py`)이 함께 동작한다.[](source:s-fm)
- 결과로 오프라인 실행 가능한 영상 프로젝트 폴더(`index.html`, `js/scenes.js`, `storyboard.md`, `script.json`, `script.txt`, `render.py`, `generated.json`, 필요 시 `research.md`·`provenance.json`)가 남으며, MP4 렌더링은 사용자가 `render.py`나 화면 녹화로 직접 수행한다.[](source:s-intro)[](source:s-deliver)
- 다른 스킬과의 관계: 5단계에서 `cokacmotion(aimotion)`을 호출해 표현 기법을 찾고, `bang-motion`·`explainer-default`와는 대안 관계다.[](source:s-s5)[](source:rel-bm)[](source:rel-ed)
- 사용자 승인 없이 Fish Audio 유료 녹음을 실행하거나, `render.py --screenshot` 외의 방법으로 화면을 캡처·열람하거나, 슬라이드형 박스·카드·비SIL OFL 1.1 폰트·외부 이미지/스톡 에셋을 쓰는 일을 금지한다.[](source:s-look)[](source:s-noslide)[](source:s-orig)[](source:s-fonts)

@answer scope="video/script-to-motion · 원본 파일 11개(외부 캐시 및 보조 문서 일부 미확인) · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=f53b74e8bae4a9f9a8a11d2d3d0dc2b980b855ed
@source s-fm title="frontmatter: name, description, PreToolUse hook" path=video/script-to-motion/SKILL.md lines=1:10
@source s-intro title="스킬 개요와 전달 원칙(코드+오디오, render.py)" path=video/script-to-motion/SKILL.md lines=12:24
@source s-deliver title="전달 폴더 구조와 file:// 오프라인 실행" path=video/script-to-motion/SKILL.md lines=72:113
@source s-collab title="사용자 협업 원칙과 녹음 대기 경계" path=video/script-to-motion/SKILL.md lines=115:164
@source s-look title="시각 확인 유일 경로(render.py --screenshot)와 차단 규칙" path=video/script-to-motion/SKILL.md lines=165:205
@source s-noslide title="슬라이드·박스 금지(모션 디자인 원칙)" path=video/script-to-motion/SKILL.md lines=206:236
@source s-world title="첫 빌드부터 영화적 세계(인포그래픽 금지)" path=video/script-to-motion/SKILL.md lines=237:284
@source s-listener title="첫 청취자 게이트 4단계와 주제 전환 쿠션" path=video/script-to-motion/SKILL.md lines=285:438
@source s-orig title="내용 우선·길이 무제한 및 100% 자체 제작·출처 추적" path=video/script-to-motion/SKILL.md lines=439:532
@source s-fonts title="SIL OFL 1.1 폰트 강제와 검증 도구" path=video/script-to-motion/SKILL.md lines=533:636
@source s-s1 title="1단계: 입력 읽기·기획과 화면 비율 결정" path=video/script-to-motion/SKILL.md lines=641:690
@source s-s2 title="2단계: new_project.mjs로 프로젝트 생성" path=video/script-to-motion/SKILL.md lines=691:703
@source s-s3 title="3단계: script.json 큐 작성과 게이트 통과" path=video/script-to-motion/SKILL.md lines=704:748
@source s-s4 title="4단계: Fish Audio drama-3 내레이션과 녹음 후 정밀 싱크" path=video/script-to-motion/SKILL.md lines=749:816
@source s-s5 title="5단계: world bible·look-dev·cokacmotion 기법·스토리보드" path=video/script-to-motion/SKILL.md lines=817:888
@source s-s6 title="6단계~6b: 장면 빌드와 선택적 Blender 3D·Shader FX" path=video/script-to-motion/SKILL.md lines=889:974
@source s-s7 title="7단계~7b: 자동 검증·render.py 시각 리뷰·art director 고도화" path=video/script-to-motion/SKILL.md lines=975:1048
@source s-s8 title="8단계 및 Revisions: 전달·녹음 승인 대기·수정 루프" path=video/script-to-motion/SKILL.md lines=1049:1131
@source r-cm title="cokacmotion.md: 기법 차용 원칙과 셰이더 함정 참조" path=video/script-to-motion/references/cokacmotion.md lines=24:66
@source r-el title="elevate.md: art director 절대 기준 1~5점 고도화 루프" path=video/script-to-motion/references/elevate.md lines=28:152
@source r-cl title="cinematic-look.md: world bible·look-dev·매번 다른 영화 규칙" path=video/script-to-motion/references/cinematic-look.md lines=42:183
@source r-sw title="script-writing.md: 주제 조사·기획서 요구사항 표·첫 청취자 게이트" path=video/script-to-motion/references/script-writing.md lines=34:98
@source sc-cm title="cokacmotion.mjs: 캐시 다운로드·aimotion.mjs 래퍼" path=video/script-to-motion/scripts/cokacmotion.mjs lines=66:112
@source sc-lg title="look_guard.py: 비시트 이미지 읽기·임의 캡처 차단 hook" path=video/script-to-motion/scripts/hooks/look_guard.py lines=1:20
@source sc-np title="new_project.mjs: 템플릿 복사·화면 비율 토큰·hook 설치" path=video/script-to-motion/scripts/new_project.mjs lines=1:58
@source sc-tts title="tts.mjs: placeholder 타이밍과 --approved Fish Audio 합성" path=video/script-to-motion/scripts/tts.mjs lines=1:55
@source sc-chk title="check.mjs: 정적 결정성·출처·폰트 검사" path=video/script-to-motion/scripts/check.mjs lines=1:50
@source sc-ren title="render.py: 프레임 단위 MP4·콘택트 시트 렌더러" path=video/script-to-motion/assets/template/render.py lines=1:45
@source rel-bm title="bang-motion description" path=video/bangtutorial/bang-motion/SKILL.md lines=1:11
@source rel-ed title="explainer-default description" path=video/Barty-Bart/explainer-default/SKILL.md lines=1:4

## 어떻게 동작하나 {#flow span=12}

에이전트는 초안 단계에서 사용자에게 묻고 멈추지 않고, 기획·대본·스토리보드·빌드·검증·고도화까지 한 번에 끝낸 뒤 무음 placeholder 상태로 전달한다.[](source:s-collab)[](source:s-s4) 사용자가 영상을 검토하고 녹음을 승인하면(`--approved`), 실제 Fish Audio 음성을 합성한 뒤 `wave.mjs` 수치로 무음 절단(`cut`)과 구절 싱크(`at`)를 맞추는 후속 루프가 돈다.[](source:s-s4)[](source:s-s8)

@workflow id=flow-diagram title="script-to-motion 흐름"
| lane prep | 기획·대본 |
| lane build | 세계·빌드 |
| lane verify | 검증·고도화 |
| lane ship | 전달·녹음 |
| brief | 1~2. 입력 분석·프로젝트 생성 | backend | prep | source:s-s1 |
| script | 3~4a. 대본 큐·placeholder 타이밍 | backend | prep | source:s-s3 |
| world | 5. world bible·look-dev·기법 찾기 | backend | build | source:s-s5 |
| build | 6~6b. 장면·3D·FX 빌드 | backend | build | source:s-s6 |
| check | 7. 자동 검사·시트 검증 | backend | verify | source:s-s7 |
| elevate | 7b. art director 점수 ≥ 4? | backend | verify | source:r-el |
| handoff | 8. 전달·녹음 승인? | backend | ship | source:s-s8 |
| record | 4b. --approved 녹음·wave 싱크 | backend | ship | source:s-s4 |
| brief > script | 템플릿·OFL 폰트·GSAP 준비 |
| script > world | 첫 청취자 게이트 통과 |
| world > build | look-dev 4점 이상 통과 |
| build > check | 구현 완료 |
| check > elevate | 정적·시각 결함 없음 |
| elevate > world | 4점 미만(최대 3회 재구축) | dashed |
| elevate > handoff | 전 챕터 4점 이상 | emphasis |
| handoff > record | 사용자 녹음 승인 |
| record > check | 새 take 길이로 재검증 | dashed |

@steps id=flow-steps
| s-brief | 1~2. 입력 분석·프로젝트 생성 | **입력** 대본·주제·기획서·영상 클립 · **참조** `references/script-writing.md` · **실행** `node scripts/new_project.mjs <dir> --title "<제목>"` · **출력** 프로젝트 골격, 기본 OFL 폰트·GSAP 캐시, `look_guard.py` hook, `research.md`(조사 시). **처리** 언어·비율·어조를 추론해 프로젝트 폴더를 생성하고, 주제나 기획서면 웹 조사와 요구사항 표를 먼저 세운다.[](source:s-s1)[](source:s-s2)[](source:r-sw)[](source:sc-np) | flow-diagram | brief |
| s-script | 3~4a. 대본 큐·placeholder 타이밍 | **입력** 대본 또는 조사 결과 · **실행** `node scripts/tts.mjs <dir>` · **출력** `script.json`, `script.txt`, 무음 placeholder `js/cues.js`. **처리** 완성 대본은 그대로 두고 직접 쓴 대본은 모든 주제 전환에 쿠션을 넣은 뒤 4단계 첫 청취자 게이트(콜드 리스너 서브에이전트 포함)를 통과시키고, API 호출 없이 추정 길이로 타임라인을 만든다.[](source:s-listener)[](source:s-s3)[](source:s-s4)[](source:sc-tts) **다음** 키·보이스가 없으면 `"narration": false` 무음 영상으로 진행한다.[](source:s-s4) | flow-diagram | script |
| s-world | 5. world bible·look-dev·기법 찾기 | **입력** `script.txt` · **참조** `references/cinematic-look.md`, `references/cokacmotion.md` · **실행** `node scripts/cokacmotion.mjs search`·`show` · **출력** `storyboard.md`(world bible·샷 리스트)와 1080p hero 프레임. **처리** 매번 새로운 세계·조명·재질·카메라 언어를 정하고 `cokacmotion`에서 기법 원리만 뽑아낸 뒤, 챕터당 1장의 hero 프레임이 art director 평가 4점에 도달할 때까지 다듬는다.[](source:s-world)[](source:s-s5)[](source:r-cm)[](source:r-cl)[](source:sc-cm) | flow-diagram | world |
| s-build | 6~6b. 장면·3D·FX 빌드 | **입력** 승인된 look-dev·스토리보드 · **실행** `node scripts/add_font.mjs`, `node scripts/enable_3d.mjs`, `node scripts/blender_mcp.mjs` (3D·FX 필요 시) · **출력** `index.html`, `css/style.css`, `js/scenes.js`, `js/art/*.js`, `models/*.glb.js`. **처리** `Video.define`과 `tl` 큐 라벨에 맞춰 모든 시각 요소를 `t`의 순수 함수로 직접 그리거나 3D·셰이더를 구축하며, 챕터가 길면 join contract로 병렬 빌드한다.[](source:s-orig)[](source:s-fonts)[](source:s-s6)[](source:r-cl) | flow-diagram | build |
| s-check | 7. 자동 검사·시트 검증 | **입력** 빌드된 프로젝트 · **실행** `node scripts/check.mjs`, `check_fonts.mjs`, `smoke.mjs`, `errscan.mjs`, `snapshot.mjs`, `python3 render.py <dir> --screenshot` · **출력** 정적·렌더·폰트·결정성(`--seekcheck`) 통과 결과와 콘택트 시트. **처리** 코드·폰트·라이선스·출처를 정적으로 검사하고 반드시 `render.py --screenshot` 시트로 프레임을 눈으로 확인한다.[](source:s-look)[](source:s-s7)[](source:sc-chk)[](source:sc-ren) | flow-diagram | check |
| s-elevate | 7b. art director 점수 ≥ 4? | **입력** 전체·챕터·전환·hero 시트 · **참조** `references/elevate.md` · **출력** 연출·그래픽 디자인·모션 점수표(1~5)와 개선 목록. **처리** 코드에 관여하지 않은 art director 서브에이전트가 절대 기준으로 채점하며, 한 축이라도 4점 미만이거나 바닥 기준을 어기면 world bible부터 최대 3회 재구축한다.[](source:s-s7)[](source:r-el) | flow-diagram | elevate |
| s-handoff | 8. 전달·녹음 승인? | **입력** 검증·고도화가 끝난 프로젝트 · **출력** 폴더 경로, `render.py`·화면 녹화 안내, 점수 변화, 녹음 승인 요청. **처리** 사용자가 `index.html`과 `script.txt`를 보고 실제 음성 녹음을 승인할지 결정하도록 안내하고 대기한다.[](source:s-s4)[](source:s-s8) **다음** 수정 요청이 오면 해당 큐·시각을 고치고 첫 청취자 게이트·검증을 다시 돈다.[](source:s-s8) | flow-diagram | handoff |
| s-record | 4b. --approved 녹음·wave 싱크 | **입력** 사용자 녹음 승인 또는 재녹음 지시 · **실행** `node scripts/tts.mjs <dir> --approved`, `node scripts/wave.mjs`, `node scripts/sync.mjs` · **출력** `audio/cues/*.wav`, `audio/narration.mp3`, 정밀 `cut`·`at` 싱크. **처리** Fish Audio `drama-3`로 사용자 음성을 합성한 뒤 `wave.mjs` 숫자 데이터로 0.4초 이상 무음을 자르고 `when()` 구절 시각을 맞춘다.[](source:s-s4)[](source:sc-tts) | flow-diagram | record |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 호출형. `description`이 대본·주제·기획서 기반 영상 제작과 기존 프로젝트 수정 요청에 켜도록 안내하며, 실행 중 `PreToolUse` hook(`look_guard.py`)을 자동 등록한다.[](source:s-fm)[](source:sc-lg) |
| 성격 | 절차형(기획·대본 게이트 → world bible·시트 기반 고도화 빌드 → 승인 후 TTS 정밀 싱크). |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#rel-r16} | `cokacmotion(aimotion)` | 호출 | 5단계에서 beat마다 기법을 찾는다(의무형). `cokacmotion.mjs`가 `~/.cache/motion-video-cokacmotion`에 받아 `aimotion.mjs`를 실행하며, `SKILL.md` 대신 셰이더 함정 절만 참조한다(첫 70 MB 다운로드 전 1줄 고지).[](source:s-s5)[](source:r-cm)[](source:sc-cm) |
| **이 스킬** {#rel-r18} | `bang-motion` | 대안 | 둘 다 HTML·CSS·GSAP로 브라우저 모션 영상을 만든다. 직접 연결은 없으며 나레이션 TTS·승인 녹음 흐름은 이 스킬에만 있다.[](source:s-fm)[](source:rel-bm) |
| **이 스킬** {#rel-r19} | `explainer-default` | 대안 | 둘 다 코드에서 설명 영상을 만들어 MP4로 낸다(이 스킬은 `render.py`를 사용자가 실행). 직접 연결은 없다.[](source:s-intro)[](source:rel-ed) |

@architecture id=relation-map title="script-to-motion과 이어지는 스킬"
| self | script-to-motion(이 스킬) | backend |
| aim | cokacmotion(aimotion) | backend |
| bm | bang-motion | backend |
| ed | explainer-default | backend |
| self > aim | 호출 |
| self > bm | 대안 |
| self > ed | 대안 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 절대 규칙 3종, 1~8단계 워크플로, 폰트·출처·hook 강제 규정 | 스킬이 켜질 때 읽는다 | 1~2. 입력 분석·프로젝트 생성, 3~4a. 대본 큐·placeholder 타이밍, 5. world bible·look-dev·기법 찾기, 6~6b. 장면·3D·FX 빌드, 7. 자동 검사·시트 검증, 7b. art director 점수 ≥ 4?, 8. 전달·녹음 승인?, 4b. --approved 녹음·wave 싱크 |
| `references/script-writing.md` | 주제 조사(`research.md`), 기획서 요구사항 표, 첫 청취자 게이트 상세 | 완성 대본 없이 주제·기획서를 받았을 때 읽는다[](source:s-s3)[](source:r-sw) | 1~2. 입력 분석·프로젝트 생성, 3~4a. 대본 큐·placeholder 타이밍 |
| `references/cinematic-look.md` | world bible 8요소, look-dev hero 프레임 검증, 재질·조명·깊이 제작법 | 5단계 스토리보드 전에 읽는다[](source:s-world)[](source:r-cl) | 5. world bible·look-dev·기법 찾기, 6~6b. 장면·3D·FX 빌드 |
| `references/cokacmotion.md` | `cokacmotion.mjs` 사용법, 기술 추출·이식 대응표, MIT 라이선스 표기 | 5~6단계에서 기법을 찾고 이식할 때 읽는다[](source:s-s5)[](source:r-cm) | 5. world bible·look-dev·기법 찾기, 6~6b. 장면·3D·FX 빌드 |
| `references/elevate.md` | art director 서브에이전트 채점 기준(연출·디자인·모션)과 3회 고도화 루프 | 7b단계 고도화 시 읽는다[](source:s-s7)[](source:r-el) | 7b. art director 점수 ≥ 4? |
| `scripts/new_project.mjs` | 템플릿 복사, 비율별 CSS 토큰 기록, 기본 폰트·GSAP 설치, hook 등록 | 2단계에서 새 영상 프로젝트 생성 시 실행[](source:s-s2)[](source:sc-np) | 1~2. 입력 분석·프로젝트 생성 |
| `scripts/tts.mjs` | placeholder 타이밍 생성 및 `--approved` 시 Fish Audio `drama-3` 합성 | 4단계 및 수정 시 실행[](source:s-s4)[](source:sc-tts) | 3~4a. 대본 큐·placeholder 타이밍, 4b. --approved 녹음·wave 싱크 |
| `scripts/cokacmotion.mjs` | 외부 `cokacmotion` 저장소를 캐시에 받아 `aimotion.mjs` 실행 | 5단계에서 기법 검색·열람 시 실행[](source:s-s5)[](source:sc-cm) | 5. world bible·look-dev·기법 찾기 |
| `scripts/check.mjs` | 정적 검사(구문, 미사용 큐, `playbackRate`/랜덤 금지, `provenance.json`, OFL 폰트) | 7단계 및 수정 후 반드시 실행[](source:s-collab)[](source:sc-chk) | 7. 자동 검사·시트 검증 |
| `scripts/hooks/look_guard.py` | 비시트 이미지 `Read`와 `render.py` 외 스크린샷 캡처 명령을 차단하는 hook | 세션 중 도구 호출마다 자동 실행[](source:s-fm)[](source:sc-lg) | 7. 자동 검사·시트 검증 |
| `assets/template/render.py` | 프레임 단위 MP4 렌더 및 `--screenshot` 콘택트 시트 생성기(프로젝트에 복사됨) | 7·7b단계 시각 확인 및 사용자가 MP4 생성 시 실행[](source:s-look)[](source:sc-ren) | 7. 자동 검사·시트 검증, 7b. art director 점수 ≥ 4?, 8. 전달·녹음 승인? |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 대본을 처음 쓰거나 한 줄이라도 수정할 때 | 첫 청취자 5질문, 주제 전환 쿠션, 내부 명칭 제거, 콜드 리스너 리뷰를 모두 통과하기 전에 녹음·전달하지 않는다. | [](source:s-listener) |
| 목표 길이·분량 압박이 있을 때 | 내용을 줄이거나 쿠션을 빼지 않으며, 사용자가 정한 길이를 넘기면 이유와 실제 길이를 그대로 보고한다. | [](source:s-orig) |
| 화면을 눈으로 확인하려 할 때 | `render.py --screenshot` 시트 외의 캡처·이미지 열람을 금지하며 `look_guard.py` hook이 이를 차단한다. | [](source:s-look)[](source:sc-lg) |
| 장면 구성을 설계할 때 | 제목 바·카드·글머리표·박스-화살표 등 슬라이드/문서 레이아웃과 인포그래픽 스타일을 금지하고 0점(바닥 위반)으로 재설계한다. | [](source:s-noslide)[](source:s-world) |
| 외부 이미지·아이콘·음악·폰트를 쓰려 할 때 | 사용자 제공(`provenance.json`)·자체 생성(`generated.json`)·SIL OFL 1.1 폰트 외의 모든 스톡·CDN·시스템 폰트를 차단한다. | [](source:s-orig)[](source:s-fonts) |
| 사용자가 녹음을 승인하기 전일 때 | Fish Audio API를 호출하지 않고 무음 placeholder와 자막 상태로 영상을 완성해 대기한다. | [](source:s-collab)[](source:s-s4) |
| 녹음된 음성(`take`)을 다룰 때 | 자동 무음 감지나 ASR 전사를 금지하며, 에이전트가 `wave.mjs` 숫자 출력으로 0.4초 이상 무음(`cut`)과 `at` 시각을 직접 결정한다. | [](source:s-s4) |
| 1× 재생 속도를 바꾸려 할 때 | 나레이션과 소리 있는 클립의 `playbackRate` 변경·TTS 속도 태그·타임 스트레치를 금지한다(`check.mjs` 오류). | [](source:s-collab) |
| 7b art director 고도화 점수가 4점 미만일 때 | 3개 축(연출·디자인·모션) 모두 4점 이상이 되거나 3라운드에 도달할 때까지 재구축한다. | [](source:s-s7)[](source:r-el) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 첫 청취자 11가지 실패 유형과 주제 전환 쿠션(seam pass) — 맡을 개요 항목: 3~4a. 대본 큐·placeholder 타이밍 · 구어체 비율(`~니다` 75%·`~요` 25%)과 콜드 리스너 리뷰 지시문을 뺐다.
- world bible 8요소와 look-dev·art director 채점 기준 — 맡을 개요 항목: 5. world bible·look-dev·기법 찾기 · 챕터당 30~40M px 캔버스 예산과 join contract 규격을 뺐다.
- SIL OFL 1.1 폰트·출처 검증(`check.mjs`·`check_fonts.mjs`)과 3D/Shader FX 파이프라인 — 맡을 개요 항목: 6~6b. 장면·3D·FX 빌드 · Blender MCP 명령과 StageFX/Classic three.js 분기를 뺐다.

@callout level=open-question title="확인하지 못한 것"
| `cokacmotion.mjs`가 런타임에 내려받는 `~/.cache/motion-video-cokacmotion`의 166개 데모 전체와 실제 실행 결과(렌더·음성 합성)는 확인하지 못했다. 또한 `references/` 나머지 19개 문서와 `scripts/`·`assets/template/` 보조 스크립트는 `SKILL.md`의 참조 지시만 확인하고 전수 열람하지 않았다. |

읽은 원본: 텍스트 파일 11개(`SKILL.md`, `references/cokacmotion.md`, `references/elevate.md`, `references/cinematic-look.md`, `references/script-writing.md`, `scripts/cokacmotion.mjs`, `scripts/hooks/look_guard.py`, `scripts/new_project.mjs`, `scripts/tts.mjs`, `scripts/check.mjs`, `assets/template/render.py`). 제외: `references/` 나머지 19개, `scripts/`·`assets/` 나머지 보조 파일, `evals/evals.json`, `README.md`, `LICENSE`.