# motion-showreel — 결정론적 웹 무대와 통합 타임라인으로 모션 그래픽 MP4를 만든다 {#overview}

에이전트는 요구사항과 스타일 프레임을 확인한 뒤, 시간 함수 기반의 결정론적 웹 페이지와 음향을 한 타임라인에 묶어 작업공간 미리보기 승인을 거쳐 최대 20분 분량의 MP4 영상과 소스로 만든다.[](source:fm)[](source:intro)[](source:dur)

- 제품 홍보 단편, 모션 포트폴리오, UI 변형, 동적 타이포그래피, 로고 인트로, 무한 루프, 녹음·TTS 기반 해설 영상(최대 1,200초)을 요청할 때 켜지며, 2분 초과 여부에 따라 단일 페이지 또는 장별 빌드로 갈린다.[](source:fm)[](source:dur)[](source:formats)
- 결과로 `out/editor-<task-id>.mp4`(또는 `out/final.mp4`), `out/poster.png`, 재사용 가능한 `brief.md`, 편집 가능한 웹·음향 소스(`index.html`, `timeline.js`, `score.mjs` 등), `qa/review_log.md`가 남는다.[](source:s8)
- 클릭 진행 발표와 원고 구술 변환은 `web-video-presentation`으로, 일반 웹페이지·프로토타입은 `web-design-engineer`로 보내며, `Remotion`·`HyperFrames`는 사용자가 직접 지목했을 때만 쓴다.[](source:scope-wvp)[](source:scope-wde)[](source:stack-alt)
- 실사 촬영·인물 생성·일반 영상 편집은 하지 않으며, 미리보기 승인 전 MP4 자동 출력이나 TTS 대본 대필·임의 절단을 금지한다.[](source:preview)[](source:scope-no)[](source:nar-guard)

@answer scope="design/garden-skills/motion-showreel · 원본 파일 115개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source fm title="frontmatter: name·description" path=design/garden-skills/motion-showreel/SKILL.md lines=1:4
@source intro title="결정론적 render(t), 미리보기 선행, 진행 공개 원칙" path=design/garden-skills/motion-showreel/SKILL.md lines=8:19
@source scope-wvp title="적용 범위표: web-video-presentation 분기" path=design/garden-skills/motion-showreel/SKILL.md lines=28:29
@source scope-wde title="적용 범위표: web-design-engineer 분기" path=design/garden-skills/motion-showreel/SKILL.md lines=30:30
@source scope-no title="적용 제외: 실사·인물·일반 편집" path=design/garden-skills/motion-showreel/SKILL.md lines=31:31
@source dur title="최대 20분 제한과 2분 초과 장별 분할 기준" path=design/garden-skills/motion-showreel/SKILL.md lines=33:33
@source s0 title="0단계: 환경 점검과 필수 시스템 도구" path=design/garden-skills/motion-showreel/SKILL.md lines=59:62
@source s1 title="1단계: 6개 필수 항목 확인과 소재·방임 모드" path=design/garden-skills/motion-showreel/SKILL.md lines=63:91
@source s2 title="2단계: 레퍼런스 대조와 brief.md·분경 작성" path=design/garden-skills/motion-showreel/SKILL.md lines=92:125
@source s3 title="3단계: 골격 생성과 스타일 프레임·3방향 확인" path=design/garden-skills/motion-showreel/SKILL.md lines=126:144
@source s4 title="4단계: 구술 시간축 우선 확정, 제작, 결정론 검사" path=design/garden-skills/motion-showreel/SKILL.md lines=145:167
@source s5 title="5단계: BGM·효과음·음성 믹싱과 오디오 수치 점검" path=design/garden-skills/motion-showreel/SKILL.md lines=168:184
@source s6 title="6단계: 작업공간 미리보기와 내보내기 승인" path=design/garden-skills/motion-showreel/SKILL.md lines=185:192
@source s7 title="7단계: MP4 인코딩, 기술 검수, 시사회 리뷰" path=design/garden-skills/motion-showreel/SKILL.md lines=193:213
@source s8 title="8단계: 최종 산출물과 저작권·기록 전달" path=design/garden-skills/motion-showreel/SKILL.md lines=214:225
@source preview title="기본 미리보기 선행과 저해상도 프록시 미생성 규칙" path=design/garden-skills/motion-showreel/SKILL.md lines=12:12
@source rules title="모든 스타일 공통 6대 마지노선" path=design/garden-skills/motion-showreel/SKILL.md lines=228:237
@source styles-cnt title="SKILL.md의 43종 스타일 표기" path=design/garden-skills/motion-showreel/SKILL.md lines=266:266
@source formats title="용도 10종(A~J)과 녹음·장편 조건" path=design/garden-skills/motion-showreel/references/formats.md lines=7:19
@source stack-alt title="기술 선택표와 Remotion·HyperFrames 조건" path=design/garden-skills/motion-showreel/references/stack.md lines=71:83
@source stack-det title="render(t) 페이지 계약과 결정론 금지 목록" path=design/garden-skills/motion-showreel/references/stack.md lines=7:69
@source nar-guard title="TTS 원고 사용자 제공 필수·미확정 시간축 금지" path=design/garden-skills/motion-showreel/references/narration.md lines=1:6
@source nar-mix title="독립 3트랙 믹싱, ducking(-16 dB), 1200초 검증" path=design/garden-skills/motion-showreel/references/narration.md lines=145:184
@source rev-qa title="기술 검수 PASS/FAIL 기준과 감성 리뷰 분리" path=design/garden-skills/motion-showreel/references/review.md lines=1:54
@source long-ref title="2분 초과 장편 chapters.json과 캐시 재빌드" path=design/garden-skills/motion-showreel/references/long-form.md lines=1:67
@source editor-ref title="편집 작업공간 기본 진입과 내보내기 규칙" path=design/garden-skills/motion-showreel/references/editor.md lines=1:62
@source prog-ref title="요청 시 단계별 진행 공개와 --confirm 규칙" path=design/garden-skills/motion-showreel/references/progress.md lines=1:45
@source js-build title="build.sh의 길이 충돌 거부·결정론·QA 강제" path=design/garden-skills/motion-showreel/assets/starter/build.sh lines=26:78
@source readme-cnt title="README의 40개 스타일 파일 표기" path=design/garden-skills/motion-showreel/README.md lines=166:168

## 어떻게 동작하나 {#flow span=12}

에이전트는 요구사항, 스타일 프레임, 작업공간 미리보기의 세 정지 지점을 거치며 결정론적 `render(t)` 페이지와 타임라인 기반 오디오를 구축해 기술 검수와 리뷰를 통과한 MP4만 전달한다.[](source:s1)[](source:s3)[](source:s6)[](source:s7)

@workflow id=flow-diagram title="motion-showreel 흐름"
| lane prep | 환경·요구 확인과 기획 |
| lane build | 장면·음향 제작 |
| lane ship | 미리보기·검수·전달 |
| env | 환경 점검과 범위 | external | prep | source:s0 |
| req | 6개 항목 확인 | security | prep | source:s1 |
| brief | brief.md 작성 | backend | prep | source:s2 |
| frames | 스타일 프레임 확인 | security | prep | source:s3 |
| make | 시간축·장면 제작 | backend | build | source:s4 |
| audio | BGM·효과음·믹싱 | backend | build | source:s5 |
| edit | 작업공간 미리보기 | security | ship | source:s6 |
| qa | 내보내기·기술 검수 | backend | ship | source:s7 |
| deliver | 최종본·기록 전달 | external | ship | source:s8 |
| env > req | |
| req > brief | 6개 항목 확정 | emphasis |
| brief > frames | |
| frames > make | 방향 승인 | emphasis |
| make > audio | |
| audio > edit | |
| edit > make | 수정 요청 | dashed |
| edit > qa | 내보내기 승인 | emphasis |
| qa > make | 실패·결함 수정 | dashed |
| qa > deliver | 전체 PASS·리뷰 | emphasis |

@steps id=flow-steps
| s-env | 환경 점검과 범위 | **입력** 사용자 요청 · **실행** `sh <skill>/scripts/setup.sh`, `node <skill>/scripts/check-env.mjs` · **출력** 실행 환경 확인과 진행 공개 여부. **처리** Node 18+·ffmpeg·Playwright를 확인하고, 클릭 발표나 웹앱 요청이면 다른 스킬로 안내한다.[](source:s0)[](source:scope-wvp)[](source:scope-wde) **다음** 과정 공개를 원하면 초기에 `editor.mjs <slug> --progress`를 연다.[](source:s1)[](source:prog-ref) | flow-diagram | env |
| s-req | 6개 항목 확인 | **입력** 주제·참고 영상·음원·음성 자료 · **실행** 참고 영상 시 `inspect.mjs grid`/`heat`, 곡 제공 시 `audio.mjs beats` · **출력** 확정된 요구 요약. **처리** 주제·길이(≤1,200초)·화면 비율·BGM·효과음·구술 방식을 묶어 묻고 사용자 확인까지 멈춘다.[](source:s1) **다음** TTS는 사용자 원고가 필수이며, "알아서 해줘" 식 표현으로 이 확인을 건너뛰지 않는다.[](source:s1) | flow-diagram | req |
| s-brief | brief.md 작성 | **입력** 확정된 요구 요약 · **참조** `references/formats.md`, `references/styles/INDEX.md`, `references/craft.md`, `references/brief-template.md` · **출력** 구조화 기획서 `brief.md`. **처리** 대조작 1~2편, 후보 구조 3안, 용도(`A`~`J`), 선택한 스타일 1~2개 신호, 사운드 방향, 분경표를 `brief.md`에 쓴다.[](source:s2) | flow-diagram | brief |
| s-frames | 스타일 프레임 확인 | **입력** `brief.md` · **실행** `sh <skill>/scripts/scaffold.sh <slug>`, `render.mjs <slug> --still ... --sheet` 또는 `--directions a,b,c` · **출력** 프로젝트 폴더와 스타일 시트(`qa/directions.png`). **처리** 스타일 지정 시 3개 시점 프레임을, 미지정 시 서로 다른 3개 방향을 실제 코드로 그려 선택을 기다린다.[](source:s3) **다음** 연속 동작 중심이면 6~10초 구간을 함께 보이며, 면제 명시 시에만 생략한다.[](source:s3) | flow-diagram | frames |
| s-make | 시간축·장면 제작 | **입력** 승인된 방향과(있다면) 음성 원고·녹음 · **참조** `references/stack.md`, `references/narration.md`, `references/long-form.md` · **실행** 구술 시 `narration.mjs tts`/`import`, 검사 시 `render.mjs <slug> --determinism` · **출력** `timeline.js`, `render(t)` 페이지, 컷별 정지화면 3장. **처리** 구술이 있으면 실제 음성과 문장 시간축을 먼저 확정한 뒤 장면을 짜고 결정론 검사를 통과시킨다.[](source:s4)[](source:nar-guard) **다음** 2분 초과 영상은 `long-form.md`에 따라 장별 폴더로 나눠 만든다.[](source:s4)[](source:long-ref) | flow-diagram | make |
| s-audio | BGM·효과음·믹싱 | **입력** `timeline.js`와 확정된 음향 소스 · **참조** `references/sound.md`, `references/narration.md` · **실행** `audio.mjs build`, 구술 시 `narration.mjs mix`, 점검 `audio.mjs check` · **출력** `audio/music.wav` 또는 `audio/final.wav`, 파형·스펙트럼 이미지. **처리** 내장 신스(`score.mjs`)·Tone.js(`score.tone.js`)·사용자 곡을 빌드하고 구술 구간 덕킹(`-16 dB`) 믹싱 뒤 `-14 LUFS`와 `DROPS` 호흡을 계측한다.[](source:s5)[](source:nar-mix) | flow-diagram | audio |
| s-edit | 작업공간 미리보기 | **입력** 장면 코드와 최종 오디오 · **참조** `references/editor.md` · **실행** `node <skill>/scripts/editor.mjs <slug> --size <WxH> --fps <fps>`(진행 모드 시 `progress.mjs --stage review --final`) · **출력** 로컬 미리보기 URL과 사용자 내보내기 승인. **처리** 무성·단편 포함 모든 작품을 편집 작업공간에서 재생·조정해 보여주고, 사용자가 내보내기를 누르거나 승인할 때까지 MP4를 만들지 않는다.[](source:s6)[](source:editor-ref) **다음** 미리보기 생략을 명시한 경우에만 즉시 다음 단계로 간다.[](source:s6) | flow-diagram | edit |
| s-qa | 내보내기·기술 검수 | **입력** 승인된 작업공간 세션 또는 `build.sh`/`chapters.json` · **실행** `render.mjs`, `sh <slug>/build.sh` 또는 `build-long.mjs`, `inspect.mjs qa`, `narration.mjs check` · **출력** `out/editor-<task-id>.mp4`(또는 `out/final.mp4`), `qa/text.json`, `qa/review_log.md`. **처리** 결정론·해상도·fps·길이·흑프레임·음량·루프 이음새를 프로그램으로 판정하고, 추출 시트·움직임·글자 겹침 보고를 에이전트(및 가능 시 별도 서브에이전트)가 점검한다.[](source:s7)[](source:rev-qa)[](source:js-build) **다음** `FAIL`이 하나라도 나면 전달하지 않고 문제 구간을 고쳐 재검증한다.[](source:s7) | flow-diagram | qa |
| s-deliver | 최종본·기록 전달 | **입력** 전체 PASS 결과와 리뷰 기록 · **실행** `render.mjs <slug> --poster <t>` · **출력** MP4·포스터·`brief.md`·`qa/review_log.md`·저작권 목록 안내. **처리** 실제 생성된 영상·표지 경로, 재빌드 명령, 구술 원고·장 목록, 미해결 사항과 외부 소재 라이선스를 정리해 사용자에게 직접 시청을 요청한다.[](source:s8) | flow-diagram | deliver |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자가 모션 그래픽·제품 홍보·UI 동적 시연·로고·타이포그래피·해설 영상 MP4 제작을 요청하면 모델이 `description`을 보고 켠다. 호출 제한 필드는 없다.[](source:fm) |
| 성격 | 웹 기술(Canvas·DOM/SVG·WebGL·Three.js·p5.js)과 내장/Tone.js 합성 오디오를 단일 `timeline.js`로 묶어 프레임 단위 MP4로 뽑는 코드 영상 파이프라인이다.[](source:intro)[](source:stack-alt) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#rel-r07} | web-video-presentation | 대안 | 클릭 진행·현장 발표·인터랙티브 웹 발표나 아티클→구술 대본 변환 요청이면 `web-video-presentation`으로 라우팅한다(사용자 개입 없음).[](source:scope-wvp) |
| **이 스킬** {#rel-r08} | web-design-engineer | 대안 | 일반 웹페이지·랜딩·인터랙티브 프로토타입·정적 시안은 적용 불가로 표시하고 `web-design-engineer`로 라우팅한다(사용자 개입 없음).[](source:scope-wde) |
| **이 스킬** {#rel-r09} | Remotion / HyperFrames | 대안 | 사용자가 이미 사용 중이거나 직접 지목한 다중 장면 장편일 때만 조건부로 허용하며, 에이전트가 먼저 도입하지 않는다(사용자 명시 필요).[](source:stack-alt) |

@architecture id=relation-map title="motion-showreel과 이어지는 스킬"
| self | motion-showreel(이 스킬) | backend |
| wvp | web-video-presentation | backend |
| wde | web-design-engineer | backend |
| rh | Remotion / HyperFrames | external |
| self > wvp | 대안 |
| self > wde | 대안 |
| self > rh | 대안 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 8단계 공정, 6대 마지노선, 6개 필수 확인 항목, 도구 요약표를 담는다 | 스킬이 켜지면 읽는다 | 모든 단계 |
| `scripts/setup.sh`, `check-env.mjs`, `scaffold.sh` | Playwright·Tone.js 설치, ffmpeg·WebGL 점검, 프로젝트 골격 생성을 맡는다 | 첫 환경 확인과 3단계 프로젝트 생성 시 실행한다 | 환경 점검과 범위 · 스타일 프레임 확인 |
| `references/formats.md`, `craft.md`, `brief-template.md`, `styles/`(45개) | 용도 10종, 연출 기법 11장, XML형 `brief.md` 틀, 43종 스타일 규칙을 담는다 | 2단계 기획 시 용도 1개와 선택한 스타일 1~2개만 읽는다 | brief.md 작성 |
| `references/stack.md`, `recipes.md`, `assets/starter/`(10개) | `render(t)` 계약, 결정론 금지 표, 15종 코드 패턴, `timeline.js`·`build.sh` 골격을 제공한다 | 4단계 제작 시작과 `build.sh` 재생성 시 읽는다 | 시간축·장면 제작 · 내보내기·기술 검수 |
| `references/sound.md`, `narration.md`, `scripts/audio.mjs`, `narration.mjs` | 내장 신스·Tone.js·박자 추출·구술 TTS/녹음 가져오기·3트랙 믹싱(`-16 dB` 덕킹)을 수행한다 | 음향 방향 설계, TTS/녹음 준비, 5단계 믹싱 시 읽고 실행한다 | 시간축·장면 제작 · BGM·효과음·믹싱 |
| `references/long-form.md`, `scripts/build-long.mjs` | 2분 초과 장편 `chapters.json` 검증, `.showreel-cache/` 재사용, 장별 무음·음향 결합을 실행한다 | 길이가 2분을 넘을 때 읽고 실행한다 | 시간축·장면 제작 · 내보내기·기술 검수 |
| `references/progress.md`, `editor.md`, `scripts/progress.mjs`, `editor.mjs`, `preview.mjs` | 과정 공개 상태 갱신, 다중 트랙 편집 웹 작업공간, 경량 디버그 미리보기를 제공한다 | 진행 공개 요청 시 초기에, 일반 제작 시 6단계 미리보기에서 실행한다 | 환경 점검과 범위 · 작업공간 미리보기 |
| `references/review.md`, `scripts/render.mjs`, `inspect.mjs` | 정지화면·방향 시트·글자 안전구역 검사·MP4 렌더·QA 기술 판정·시사회 체크표를 제공한다 | 3단계 프레임, 4단계 결정론, 7단계 검수·리뷰 시 실행한다 | 스타일 프레임 확인 · 시간축·장면 제작 · 내보내기·기술 검수 |
| `scripts/lib/`(12개), `scripts/test/`(13개), `assets/editor/`(6개) | 브라우저 제어, 신스/Tone 렌더, 프레임 차분, 편집기 UI와 회귀 테스트를 담는다 | 자가 테스트(`npm test`) 외에는 스크립트가 내부 호출한다 | 흐름 밖: 내부 모듈·UI·테스트 |
| `README.md`, `README.zh-CN.md`, `manifest.json` | 사람용 쇼케이스 안내와 패키지 메타데이터(`0.2.1`)를 담는다 | 에이전트 실행 흐름에서는 읽지 않는다 | 흐름 밖: 사용자 문서·메타 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 1단계 6개 필수 항목(주제·길이·화폭·BGM·효과음·구술) 확인 전 | 멈추고 누락 항목을 물어 요약을 확정한다. "최선을 다해줘" 식 위임으로도 건너뛰지 않는다 | [](source:s1) |
| 영상 길이 상한 또는 구술 시간과 충돌 | 최대 20분(1,200초)을 넘길 수 없으며, 충돌 시 임의 절단·배속·개작을 금지하고 멈춰서 확인한다([`build.sh` 코드 확인](source:js-build)) | [](source:dur)[](source:s1)[](source:js-build) |
| TTS 원고 및 미확정 음성 시간축 | 금지: TTS 대본은 반드시 사용자 제공 원고(`--source user`)만 쓰며 대필·윤문을 금지한다. 문장 타임스탬프가 없으면 `unresolved`로 두고 문장 동기 화면 제작을 시작하지 않는다 | [](source:s1)[](source:nar-guard) |
| 3단계 스타일 프레임과 6단계 미리보기 | 승인 지점: 명시적 면제가 없으면 스타일 프레임 선택과 작업공간 미리보기(`editor.mjs`) 승인 전 MP4를 출력하지 않는다. 저해상도 프록시 MP4도 기본 생성하지 않는다 | [](source:preview)[](source:s3)[](source:s6) |
| 결정론 페이지 계약 위반 | 금지: `Math.random()`, `Date.now()`, `requestAnimationFrame`, 타이머, CSS 애니메이션, 프레임 간 상태 유지를 금지하며 `--determinism`을 통과해야 한다 | [](source:s4)[](source:stack-det) |
| 기술 검수(`inspect.mjs qa`)와 리뷰 구분 | 강제: 해상도·fps·길이(±1.5프레임)·프레임 수(±2프레임)·흑프레임·음량(`-14 ± 1.5 LUFS`)·true peak(샘플 사이까지 본 최대 음량, `≤ -1 dBTP`)·루프 SSIM 중 하나라도 `FAIL`이거나 `NOT CHECKED`가 남으면 전달을 금지한다 | [](source:s7)[](source:rev-qa) |
| 에이전트 자체 판단의 한계 | `inspect.mjs qa`·`audio.mjs check` 통과가 청감·시청 확인을 대신할 수 없으며, 최종 확인은 사용자에게 넘긴다 | [](source:s5)[](source:s7)[](source:rev-qa) |
| 브랜드 로고·실제 제품 화면·사실 정보 | 실제 로고와 2× DPR 캡처를 쓰며 없으면 멈춰서 묻고, 모조 블록·허구 수치·미허가 폰트·원격 폰트 CDN을 쓰지 않는다 | [](source:rules)[](source:stack-det) |
| 스타일 수 표기 불일치 | `SKILL.md`는 43종, `README.md`와 `manifest.json`은 40종으로 적었으나 실제 `references/styles/`에는 스타일 파일 43개가 들어 있다 | [](source:styles-cnt)[](source:readme-cnt) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 결정론 `render(t)` 계약과 15종 모션 레시피 — `시간축·장면 제작` · `stack.md`의 Canvas/DOM/WebGL/Three.js/p5 규칙과 `recipes.md` 코드 패턴은 개요에서 뺐다.
- 음향 합성(`score.mjs`·`Tone.js`)과 구술 TTS·믹싱 파이프라인 — `BGM·효과음·믹싱` · 1·2단 신스 API, Gemini/MiniMax 어댑터, `DROPS` 호흡 계측, `-16 dB` ducking 매개변수가 개요 밖에 있다.
- 2분 초과 장편 `chapters.json` 빌드와 진행 공개(`--progress`) — `시간축·장면 제작`과 `작업공간 미리보기` · `.showreel-cache/` 해시 무효화와 컷별 독립 미리보기 규칙을 생략했다.
- 기술 검수 항목과 43종 스타일 카탈로그 — `brief.md 작성`과 `내보내기·기술 검수` · 43종 스타일 목록, `--text-check` 4종 판정, `qa/review_log.md` 서식이 개요 밖에 있다.

@callout level=open-question title="확인하지 못한 것"
| `references/styles/`의 43개 스타일 정의 파일과 `scripts/lib/` 12개, `scripts/test/` 13개, `assets/editor/` 6개, `assets/starter/` 나머지 7개 파일은 목록·구조만 확인하고 본문을 읽지 않았다. |
| 외부 실행 도구(Playwright, Chromium, ffmpeg, Gemini/MiniMax TTS API, `librosa`) 동작은 코드와 문서 지시 기준으로만 파악했다. |

읽은 원본: 텍스트 파일 115개 중 30개 전체 읽기(`SKILL.md`, `manifest.json`, `README.md`, `references/*.md` 11개, `references/styles/INDEX.md`·`_template.md`, `scripts/` 주요 CLI 11개, `assets/starter/` 3개; 외부 라우팅 대상 `web-video-presentation/SKILL.md` 일부 추가 대조). 구조 확인: `references/styles/` 43개, `scripts/lib/` 12개, `scripts/test/` 13개, `assets/editor/` 6개, `assets/starter/` 7개, `scripts/` 설정 3개. 제외: `README.zh-CN.md` 1개(`README.md`의 중국어판), `*.ko.md` 번역본.
