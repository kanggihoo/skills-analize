# sound-effects 스킬은 에이전트를 어떻게 바꾸나 {#sound-effects-skill}

`sound-effects`를 쓰면 에이전트는 소리를 귀로 판단하지 않고 측정으로 판단한다. 실제로 녹음된 효과음을 cue(소리를 넣을 시점)마다 하나씩 넣고, 내보낸 MP4의 음량을 재서 맞춘다. 마지막에는 사람이 헤드폰으로 들어 볼 5곳을 넘기고, "좋게 들린다"는 말은 하지 않는다.[](source:se-intro)

- 켜지는 때: 모션그래픽 영상에 효과음·음악을 넣어 달라는 요청이다. 호출 제한 필드는 없다.[](source:se-fm)
- 강제하는 것: 코드로 소리를 합성하지 않는다. 내보내기 전에 사용처와 소스별 약관을 확인하고, 알 수 없는 라이선스를 괜찮다고 하지 않는다.[](source:se-synth)[](source:se-s0head)
- 측정 목표: 내보낸 MP4에서 약 -16 LUFS(체감 음량 단위), true peak(샘플 사이까지 본 최대 음량) -4 dBFS 미만이다.[](source:se-mix)
- 쓰면 안 되는 때: 약관이 막는 사용처, 그리고 소리를 내 판단으로 "좋다"고 말하려는 때다.[](source:se-s0tab)[](source:se-intro)

@answer scope="video/Barty-Bart/sound-effects · 원본 텍스트 8개 132,327B · 커밋 23e8047 · 약관 확인일은 원문이 적은 2026-10-13 · 소리는 분석하지 않음 · 코드는 읽기만 하고 실행하지 않음 · 지시상 동작"
@meta locale=ko
@source se-fm title="video/Barty-Bart/sound-effects/SKILL.md · 13793B · 지시 본문과 frontmatter" path=video/Barty-Bart/sound-effects/SKILL.md lines=1:4
@source se-intro title="SKILL.md · 들을 수 없다는 전제와 크레딧" path=video/Barty-Bart/sound-effects/SKILL.md lines=6:10
@source se-kit title="SKILL.md · 기본 kit" path=video/Barty-Bart/sound-effects/SKILL.md lines=12:25
@source se-synth title="SKILL.md · 합성 금지" path=video/Barty-Bart/sound-effects/SKILL.md lines=28:28
@source se-lib title="SKILL.md · 라이브러리 우선과 런타임 소리" path=video/Barty-Bart/sound-effects/SKILL.md lines=29:30
@source se-music title="SKILL.md · 음악" path=video/Barty-Bart/sound-effects/SKILL.md lines=31:31
@source se-lic title="SKILL.md · 효과음 라이선스 규칙" path=video/Barty-Bart/sound-effects/SKILL.md lines=32:32
@source se-musiclic title="SKILL.md · 음악 라이선스 규칙" path=video/Barty-Bart/sound-effects/SKILL.md lines=33:33
@source se-credits title="SKILL.md · CREDITS.txt" path=video/Barty-Bart/sound-effects/SKILL.md lines=34:34
@source se-mp4 title="SKILL.md · 내보낸 MP4에서 측정(원문에 같은 줄이 두 번 있다)" path=video/Barty-Bart/sound-effects/SKILL.md lines=35:36
@source se-s0head title="SKILL.md · 0단계 머리말" path=video/Barty-Bart/sound-effects/SKILL.md lines=38:39
@source se-s0use title="SKILL.md · 0단계 1. 사용처" path=video/Barty-Bart/sound-effects/SKILL.md lines=41:41
@source se-s0src title="SKILL.md · 0단계 2. 소스별 확인" path=video/Barty-Bart/sound-effects/SKILL.md lines=42:42
@source se-s0rep title="SKILL.md · 0단계 3. 한 줄 보고와 교체" path=video/Barty-Bart/sound-effects/SKILL.md lines=43:43
@source se-s0tab title="SKILL.md · 소스별 약관 표(checked 13 Oct 2026)" path=video/Barty-Bart/sound-effects/SKILL.md lines=45:50
@source se-s0why title="SKILL.md · Mixkit을 저장하지 않는 이유" path=video/Barty-Bart/sound-effects/SKILL.md lines=52:52
@source se-setup title="SKILL.md · 1. 준비" path=video/Barty-Bart/sound-effects/SKILL.md lines=54:59
@source se-cue title="SKILL.md · 2. cue 목록" path=video/Barty-Bart/sound-effects/SKILL.md lines=61:63
@source se-cuetab title="SKILL.md · cue 종류와 카테고리 표" path=video/Barty-Bart/sound-effects/SKILL.md lines=65:79
@source se-cueone title="SKILL.md · cue 하나에 소리 하나" path=video/Barty-Bart/sound-effects/SKILL.md lines=81:81
@source se-beat title="SKILL.md · 3. beat grid" path=video/Barty-Bart/sound-effects/SKILL.md lines=83:84
@source se-align title="SKILL.md · 4. 큰 동작을 박자에" path=video/Barty-Bart/sound-effects/SKILL.md lines=86:87
@source se-mix title="SKILL.md · 5. 배치와 믹스" path=video/Barty-Bart/sound-effects/SKILL.md lines=89:95
@source se-prove title="SKILL.md · 6. 증명" path=video/Barty-Bart/sound-effects/SKILL.md lines=97:98
@source se-orig title="SKILL.md · 원본 품질 파일" path=video/Barty-Bart/sound-effects/SKILL.md lines=100:105
@source se-more title="SKILL.md · 소리를 더 찾을 때" path=video/Barty-Bart/sound-effects/SKILL.md lines=107:108
@source se-moretab title="SKILL.md · 검색 소스 표" path=video/Barty-Bart/sound-effects/SKILL.md lines=110:117
@source se-morerepo title="SKILL.md · 저장소에 넣을 수 있는 소리" path=video/Barty-Bart/sound-effects/SKILL.md lines=119:119
@source se-script title="SKILL.md · 스크립트 실행" path=video/Barty-Bart/sound-effects/SKILL.md lines=121:127
@source se-swap title="SKILL.md · 7. swap 보고서" path=video/Barty-Bart/sound-effects/SKILL.md lines=129:130
@source se-report title="SKILL.md · 사용자 보고" path=video/Barty-Bart/sound-effects/SKILL.md lines=132:133
@source rd-what title="video/Barty-Bart/sound-effects/README.md · 5494B · 소개와 라이선스 안내" path=video/Barty-Bart/sound-effects/README.md lines=9:19
@source rd-lib title="README.md · 라이브러리 규모" path=video/Barty-Bart/sound-effects/README.md lines=30:33
@source rd-lic title="README.md · 라이선스와 Content ID" path=video/Barty-Bart/sound-effects/README.md lines=44:47
@source mu-head title="video/Barty-Bart/sound-effects/MUSIC.md · 3311B · 추천 음악" path=video/Barty-Bart/sound-effects/MUSIC.md lines=3:10
@source mu-tab title="MUSIC.md · 느낌별 곡 표" path=video/Barty-Bart/sound-effects/MUSIC.md lines=12:38
@source mu-allow title="MUSIC.md · Mixkit 음악 약관 요약" path=video/Barty-Bart/sound-effects/MUSIC.md lines=42:46
@source mu-other title="MUSIC.md · 다른 음악 출처" path=video/Barty-Bart/sound-effects/MUSIC.md lines=48:52
@source tp-head title="video/Barty-Bart/sound-effects/TOP-PICKS.md · 4177B · 카테고리별 추천과 크레딧" path=video/Barty-Bart/sound-effects/TOP-PICKS.md lines=3:5
@source li-code title="video/Barty-Bart/sound-effects/LICENSES.md · 19850B · 파일별 출처와 라이선스" path=video/Barty-Bart/sound-effects/LICENSES.md lines=6:11
@source li-rt title="LICENSES.md · 런타임 전용 소스" path=video/Barty-Bart/sound-effects/LICENSES.md lines=126:127
@source li-nb title="LICENSES.md · 확인했지만 번들하지 않은 소스" path=video/Barty-Bart/sound-effects/LICENSES.md lines=129:133
@source mf-norm title="video/Barty-Bart/sound-effects/sfx/manifest.json · 68552B · 구조와 표본만 확인" path=video/Barty-Bart/sound-effects/sfx/manifest.json lines=1:5
@source mf-cmap title="manifest.json · category_map" path=video/Barty-Bart/sound-effects/sfx/manifest.json lines=6:18
@source mf-kit title="manifest.json · default_kit" path=video/Barty-Bart/sound-effects/sfx/manifest.json lines=1638:1720
@source mf-alt title="manifest.json · alt_categories" path=video/Barty-Bart/sound-effects/sfx/manifest.json lines=1721:1748
@source sp-args title="video/Barty-Bart/sound-effects/scripts/sound_pass.py · 14041B · 인자" path=video/Barty-Bart/sound-effects/scripts/sound_pass.py lines=12:20
@source sp-beat title="sound_pass.py · beat grid와 120 Hz 점검" path=video/Barty-Bart/sound-effects/scripts/sound_pass.py lines=27:42
@source sp-align title="sound_pass.py · 음악 시작 위치 탐색" path=video/Barty-Bart/sound-effects/scripts/sound_pass.py lines=43:51
@source sp-pick title="sound_pass.py · 소리 고르기와 swap" path=video/Barty-Bart/sound-effects/scripts/sound_pass.py lines=52:85
@source sp-place title="sound_pass.py · cue 배치와 gain" path=video/Barty-Bart/sound-effects/scripts/sound_pass.py lines=86:103
@source sp-music title="sound_pass.py · 음악 bed" path=video/Barty-Bart/sound-effects/scripts/sound_pass.py lines=104:108
@source sp-map title="sound_pass.py · 영상 오디오 대신 믹스를 입힌다" path=video/Barty-Bart/sound-effects/scripts/sound_pass.py lines=110:112
@source sp-loud title="sound_pass.py · 음량 측정 반복" path=video/Barty-Bart/sound-effects/scripts/sound_pass.py lines=113:123
@source sp-proof title="sound_pass.py · 프레임과 파형 증명" path=video/Barty-Bart/sound-effects/scripts/sound_pass.py lines=124:133
@source sp-lic title="sound_pass.py · 라이선스와 CREDITS.txt" path=video/Barty-Bart/sound-effects/scripts/sound_pass.py lines=134:155
@source sp-uc title="sound_pass.py · 사용처 충돌 검사" path=video/Barty-Bart/sound-effects/scripts/sound_pass.py lines=156:163
@source sp-ts title="sound_pass.py · 5개 timestamp와 SOUND.md" path=video/Barty-Bart/sound-effects/scripts/sound_pass.py lines=164:169
@source rp-all title="video/Barty-Bart/sound-effects/scripts/report.py · 3109B · swap 보고서 HTML" path=video/Barty-Bart/sound-effects/scripts/report.py lines=1:27
@source mb-plan title="video/Barty-Bart/motion-broll/SKILL.md · r03 확인용" path=video/Barty-Bart/motion-broll/SKILL.md lines=117:120
@source ed-audio title="video/Barty-Bart/explainer-default/SKILL.md · r04 확인용" path=video/Barty-Bart/explainer-default/SKILL.md lines=112:113

## 언제 켜지고, 어디서 사람이 개입하고, 언제 쓰면 안 되나 {#trigger}

@code source=se-fm language=yaml

이 스킬에는 호출 제한 필드가 없어서, 모델이 `description`을 참고해 켤 수 있다.[](source:se-fm) 판정: `description`은 판단용 설명이지, 특정 단어가 있으면 켜지는 목록이 아니다.

- 설명이 든 대상: Claude Code로 만든 모션그래픽 영상(HyperFrames, Remotion, GSAP, Claude Motion, `motion-broll`)이다.[](source:se-fm)
- 요청의 예: 효과음·사운드 디자인·음악 추가, 그리고 "AI 영상 소리가 싸구려 삑삑 소리 같다"는 불평이다.[](source:se-fm)

사람은 아래 지점에서 개입한다. 이 스킬은 사람이 답하거나 확인해야 다음으로 가는 곳을 따로 막아 두지 않고, 보고와 질문으로 넘긴다.

| 지점 | 에이전트가 하는 일 | 사람의 몫 |
| --- | --- | --- |
| 사용처 확인 | 게시할 곳을 묻는다. "my YouTube video"처럼 이미 분명하면 묻지 않는다[](source:se-s0use) | {caution:사용처를 답한다} |
| 음악 고르기 | 사용자에게 곡이 없으면 `MUSIC.md`에서 2~3곡을 제안한다[](source:se-music) | {caution:곡을 고른다} |
| 음악 라이선스 | 출처를 묻고 `--music-source`, `--music-license`로 넘긴다. 없으면 `LICENCE NOT CONFIRMED`로 표시하고 그대로 말한다[](source:se-musiclic) | {caution:출처와 라이선스를 알려 준다} |
| 약관이 바뀌었거나 사용처가 막힐 때 | 해당 소리나 트랙을 이름으로 짚고 이유를 말한 뒤, 내보내기 전에 바꾼다[](source:se-s0rep) | {bad:교체 결정} |
| 라이선스를 모르는 소리 | 소리 이름·라이선스·출처 링크를 대고, 확인하거나 바꿀 때까지 게시하지 말라고 알린다[](source:se-lic) | {bad:게시 보류} |
| 소리가 거칠 때 | 원본 파일을 받자고 한다. Freesound 원본은 무료 계정이 필요해서 사용자에게 내려받게 하거나, 사용자가 주는 API 키를 쓴다[](source:se-orig) | {caution:직접 내려받는다} |
| swap 선택 | `report.html`을 열어 준다. 사용자가 소리를 고르고 `swaps.json`을 내려받는다[](source:se-swap) | {caution:소리를 고른다} |
| 헤드폰 확인 | 가장 위험한 5곳의 timestamp를 준다[](source:se-prove) | {caution:직접 듣는다} |

**쓰면 안 되는 경우**는 원문이 직접 적은 금지와, 약관이 적은 금지로 나뉜다. 약관 표는 원문이 2026-10-13에 확인했다고 적은 내용이다. 지금도 같은지는 이 분석에서 확인하지 않았다.

| 금지된 것 | 근거 |
| --- | --- |
| 코드로 음악·효과음을 합성한다(oscillator, sine beep). 녹음된 실제 파일만 쓴다 {bad:금지} | 원문 규칙[](source:se-synth) |
| Mixkit 소리·음악을 스킬 폴더에 저장하거나 commit한다. 사용자 프로젝트에 런타임으로 내려받는다 {bad:금지} | 원문 규칙. Mixkit이 도구·템플릿 안 재배포를 막는다[](source:se-lib)[](source:se-s0why) |
| 중간 WAV에서 음량을 재고 끝낸다. 내보낸 MP4에서만 잰다 {bad:금지} | 원문 규칙. 원문에 같은 줄이 두 번 있다[](source:se-mp4) |
| 알 수 없는 라이선스를 "아마 괜찮다"고 말한다 {bad:금지} | 원문 규칙[](source:se-lic)[](source:se-s0rep) |
| "소리가 좋다"고 말한다 {bad:금지} | 원문 규칙[](source:se-intro)[](source:se-report) |
| Mixkit 음악을 CD/DVD, TV·라디오 방송, 비디오 게임에 쓰거나 리믹스하거나 Content ID에 등록한다 | 약관 표[](source:se-s0tab) |
| Mixkit 효과음을 단독이나 도구·템플릿 안에서 재배포하거나 권리 서비스에 등록한다 | 약관 표[](source:se-s0tab) |
| CC-BY-NC 소리를 상업적으로 쓴다. CC-BY는 크레딧이 필요하다 | 약관 표와 검색 표[](source:se-s0tab)[](source:se-moretab) |
| Pixabay·YouTube Audio Library·Sonniss를 저장소에 번들한다. Sonniss는 원본 재배포와 AI 학습도 막고 로컬 사용만 허용한다 | 검색 표와 `LICENSES.md`[](source:se-moretab)[](source:li-nb) |

원문이 이 스킬의 사용 자체를 막는 작업 유형은 `원문에 명시 없음`이다. 판정: 모션그래픽이 아닌 영상이나 이미 음성이 든 영상은 이 스킬의 대상이 아닐 가능성이 크다. 설명이 모션그래픽 영상을 대상으로 들고, 스크립트가 입력 영상의 오디오를 믹스로 바꿔 끼우기 때문이다.[](source:se-fm)[](source:sp-map) 자세한 내용은 맨 아래 감사 패널에 있다.

@callout level=open-question title="소리 품질은 이 분석이 판단하지 않는다"
이 스킬은 Claude가 소리를 들을 수 없다는 전제에서 출발한다.[](source:se-intro) 이 분석도 같다. 결과 음질이 좋은지, 기본 kit의 소리가 영상과 어울리는지는 평가하지 않았다. 스크립트를 실행해 실제 LUFS와 peak가 목표 안에 드는지도 확인하지 않았다.

## 무엇을 강제하나: 내보내기 전에 라이선스를 확인한다 {#licence-gate}

원문은 0단계를 "편집하는 동안, 내보내기 전에" 하라고 한다. 소스가 약관을 바꾸기도 하므로 이 영상이 실제로 쓰는 것을 기준으로, 매번 현재 약관을 확인한다.[](source:se-s0head)

@workflow id=licence-flow title="0단계 라이선스 확인"
| lf-use | 사용처 확인 | external |
| lf-src | 소스별 약관 열기 | backend |
| lf-ok | 약관과 사용처 허용? | backend |
| lf-say | 소스별 한 줄 보고 | backend |
| lf-swap | 소리·트랙 교체 | external |
| lf-export | 내보내기 | backend |
| lf-use > lf-src | |
| lf-src > lf-ok | |
| lf-ok > lf-say | 예 | emphasis |
| lf-ok > lf-swap | 아니오 |
| lf-swap > lf-export | 내보내기 전에 |
| lf-say > lf-export | |

@steps id=licence-steps
| lf-use | 사용처 확인 | 게시할 곳을 묻는다. 후보는 YouTube, Instagram, TikTok, 다른 소셜, 온라인 광고, 팟캐스트, 의뢰 작업, TV·라디오 방송, 비디오 게임, CD·DVD, 다른 사람용 템플릿·도구다. 답은 `--use-case "..."`로 넘겨 `SOUND.md`에 남긴다.[](source:se-s0use) | licence-flow | lf-use |
| lf-src | 소스별 약관 열기 | 이 영상이 쓴 소스마다(`CREDITS.txt`의 제공처와 음악) 현재 약관 페이지를 연다. 웹 fetch를 쓰고, 사이트가 막으면 사용자 브라우저를 쓴다. 두 가지를 본다. 약관이 아래 표와 같은가, 사용처가 허용되는가. Freesound는 쓴 소리마다 페이지를 열어 Creative Commons 0인지 다시 본다. 음악은 트랙 페이지를 연다.[](source:se-s0src) | licence-flow | lf-src |
| lf-ok | 약관과 사용처 허용? | 약관이 바뀌었거나 사용처를 허용하지 않으면 아니오다.[](source:se-s0rep) | licence-flow | lf-ok |
| lf-say | 소스별 한 줄 보고 | 소스마다 한 줄로 보고한다. 원문의 예: "Checked today: Mixkit Stock Music Free License, unchanged, YouTube allowed." 확인하지 않았거나 불분명한 라이선스를 괜찮다고 하지 않는다.[](source:se-s0rep) | licence-flow | lf-say |
| lf-swap | 소리·트랙 교체 | 바뀐 소스나 막힌 사용처는 해당 소리나 트랙 이름과 이유를 말하고, 내보내기 전에 바꾼다.[](source:se-s0rep) | licence-flow | lf-swap |
| lf-export | 내보내기 | 이 단계가 끝난 뒤에 최종 내보내기를 한다.[](source:se-s0head) | licence-flow | lf-export |

아래 약관 표는 원문이 "checked 13 Oct 2026"이라고 적은 시점의 내용이다.[](source:se-s0tab) 에이전트는 이 표를 믿고 넘어가지 않고, 위 단계로 현재 페이지를 다시 확인해야 한다.

| 소스 | 약관 페이지 | 허용 | 허용 안 함 |
| --- | --- | --- | --- |
| Freesound, CC0 | 그 소리의 페이지 | 모든 용도, 크레딧 불필요 | 없음. CC-BY는 크레딧이 필요하고 CC-BY-NC는 상업적으로 쓰지 않는다[](source:se-s0tab) |
| Kenney | kenney.nl의 팩 페이지 | 모든 용도(CC0) | 없음[](source:se-s0tab) |
| Mixkit 효과음 | `https://mixkit.co/license/#sfxFree` | 웹, 소셜, 팟캐스트, 게임, 영화, CD·DVD, TV·라디오 | 파일 단독 재배포, 도구·템플릿 안 재배포, 권리 서비스 등록[](source:se-s0tab) |
| Mixkit 음악 | `https://mixkit.co/license/#musicFree` | YouTube, 소셜, 온라인 광고, 팟캐스트, 교육 | CD·DVD, TV·라디오, 비디오 게임, 리믹스, Content ID 등록[](source:se-s0tab) |

라이선스와 크레딧에 관한 나머지 규칙은 이렇다.

- CC0와 Mixkit Free License만 "무료이고 안전"으로 친다. 스크립트가 배치한 소리를 모두 검사한다.[](source:se-lic)
- 소리를 하나씩 나열해 보고하지 않는다. 전부 알려진 라이선스면 한 번만 말한다: 소스가 CC0나 Mixkit Free License로 표시했고, 소스가 약관을 바꿀 수 있으니 소스 페이지를 가끔 확인하라는 내용이다.[](source:se-lic)
- 스크립트가 알 수 없는 라이선스를 보고하면 그 소리의 이름, 라이선스, 출처 링크를 대고, 확인하거나 바꾸기 전까지 게시하지 말라고 알린다.[](source:se-lic)
- 음악 라이선스를 확인하지 않은 채 실행하면 결과가 음악을 `LICENCE NOT CONFIRMED`로 표시한다. 에이전트는 이를 그대로 말한다.[](source:se-musiclic)
- 실행마다 `CREDITS.txt`가 생긴다. 에이전트는 한 번만 권한다. CC0는 크레딧이 필요 없지만, 이 목록은 YouTube·Instagram·TikTok 설명에 붙이거나 플랫폼이 소리를 신고할 때 출처 증거로 쓸 수 있다.[](source:se-credits)
- Mixkit이 도구·템플릿 안 재배포를 막기 때문에, 이 스킬은 Mixkit 소리와 음악을 저장하지 않고 사용자 프로젝트에 런타임으로 내려받는다.[](source:se-s0why)
- 접근법의 출처는 Vox(@Voxyz_ai)의 sound-pass 프롬프트(2026-10-11 게시)이고, 원문은 이 크레딧을 유지하라고 한다.[](source:se-intro)

스크립트가 대신하는 일과 하지 않는 일은 코드를 읽어 확인했다. 실행은 하지 않았다.

| 구분 | 내용 |
| --- | --- |
| 하는 일: 무료 판정 | 라이선스 문자열에 `CC0`가 있거나 `Mixkit`과 `Free License`가 있고 `Restricted`가 없으면 무료로 친다. 나머지는 알 수 없음으로 모아 `UNKNOWN LICENCES, do not publish until checked`로 출력한다.[](source:sp-lic) |
| 하는 일: 미확인 표시 | `--music-license`가 없으면 `LICENCE NOT CONFIRMED`를 쓴다. `--use-case`가 없으면 "NOT GIVEN. Ask the user"를 출력한다.[](source:sp-lic)[](source:sp-uc) |
| 하는 일: 사용처 충돌 | 사용처 문자열에 `tv`, `television`, `broadcast`, `radio`, `game`, `cd`, `dvd`가 있고 음악이 Mixkit이면 충돌로 적는다. 사용처에 `template`, `tool`, `asset pack`, `stock`이 있고 Mixkit 소리를 썼어도 충돌로 적는다.[](source:sp-uc) |
| 안 하는 일: 약관 열람 | 소스 페이지를 열어 현재 약관을 확인하지 않는다. 출력 문구가 "Claude still checks each source page"라고 에이전트에 넘긴다.[](source:sp-uc) |
| 안 하는 일: 음악 라이선스 검증 | `--music-license` 값이 맞는지 확인하지 않는다. 인자가 있으면 확인된 것으로 적는다.[](source:sp-lic) |
| 안 하는 일: 내보내기 중단 | 라이선스를 모르는 소리가 있어도 내보내기를 멈추지 않는다. 경고를 `SOUND.md`에 적을 뿐이다.[](source:sp-lic)[](source:sp-ts) |

판정: 약관 확인의 핵심은 스크립트가 아니라 에이전트가 소스 페이지를 열어 보는 단계에 있다. 사용처 검사는 위 키워드 목록에 있는 말만 잡는다. 근거는 코드의 키워드 비교다.[](source:sp-uc)

## 어떤 순서로 만들고 수치는 무엇인가 {#procedure}

@workflow id=sound-flow title="소리 넣기 절차"
| lane prep | 준비 |
| lane beat | 박자 |
| lane mix | 믹스 |
| lane prove | 증명 |
| pf-lic | 0 라이선스 확인 | external | prep |
| pf-setup | 1 환경 준비 | backend | prep |
| pf-cues | 2 cue 목록 | backend | prep |
| pf-beat | 3 beat grid 점검 | backend | beat |
| pf-align | 4 컷을 박자에 | backend | beat |
| pf-mix | 5 배치와 믹스 | backend | mix |
| pf-level | 음량이 목표 안인가? | backend | mix |
| pf-proof | 6 프레임·파형 증명 | backend | prove |
| pf-swap | 7 swap 선택 | external | prove |
| pf-report | 사용자 보고 | backend | prove |
| pf-human | 헤드폰 5곳 확인 | external | prove |
| pf-lic > pf-setup | |
| pf-setup > pf-cues | |
| pf-cues > pf-beat | |
| pf-beat > pf-align | |
| pf-align > pf-mix | |
| pf-mix > pf-level | export 후 측정 |
| pf-level > pf-mix | 아니오 |
| pf-level > pf-proof | 예 | emphasis |
| pf-proof > pf-report | |
| pf-report > pf-human | 5곳 전달 | emphasis |
| pf-proof > pf-swap | report.html |
| pf-swap > pf-mix | swaps.json |

@steps id=sound-steps
| pf-lic | 0 라이선스 확인 | 위 패널의 0단계다. 내보내기 전에 끝낸다.[](source:se-s0head) | sound-flow | pf-lic |
| pf-setup | 1 환경 준비 | ffmpeg과 Python 3.10+가 필요하다. 지울 수 있는 폴더에 venv를 만들고 librosa, soundfile, numpy, scipy, matplotlib을 설치하라고 적었다. 이 분석에서는 실행하지 않았다.[](source:se-setup) | sound-flow | pf-setup |
| pf-cues | 2 cue 목록 | `ffprobe`로 영상 길이와 fps를 읽는다. 구성 소스(HyperFrames·Remotion 타임라인, GSAP 라벨, `motion-broll`의 `plan.json`)에서 가져올 수 있으면 가져온다. 아니면 `select='gt(scene,0.3)'` 필터로 장면 전환을 찾는다. `cues.json`은 `t`, `type`, `desc`를 가지고, `typing`은 `dur`도 가진다.[](source:se-cue) | sound-flow | pf-cues |
| pf-beat | 3 beat grid 점검 | beat grid(박자 위치 격자)를 `librosa.beat.beat_track`으로 구한다. librosa가 박자 사이(off-beat)를 잡는 일이 있어서, 음악을 120 Hz 아래로 저역 통과하고 처음 4마디의 beat 선과 겹쳐 그려 킥(kick)이 선에 앉는지 본다. 안 맞으면 grid 전체를 중앙값 오프셋만큼 옮기고 다시 그린다. 사용자에게 `beatgrid.png`를 보여 준다.[](source:se-beat) | sound-flow | pf-beat |
| pf-align | 4 컷을 박자에 | hard cut(장면을 바로 자르는 컷)과 `reveal` cue는 박자에 닿아야 한다. 애니메이션 타이밍을 바꿀 수 있으면 바꾼다. 못 바꾸면 음악 시작 위치를 옮겨, 컷과 박자의 오차가 가장 작은 위치를 고른다. 컷마다 오차를 ms로 보고한다.[](source:se-align) | sound-flow | pf-align |
| pf-mix | 5 배치와 믹스 | 우선순위는 voiceover > SFX > music이다. 음악은 SFX보다 약 12 dB 낮게 깔고, 음성(voiceover)이 나오면 그 아래로 8 dB에서 12 dB 더 낮춘다(덕킹, ducking). 영상을 내보내 측정하고 gain을 고치거나 limiter를 더한 뒤 다시 내보내 측정한다.[](source:se-mix) | sound-flow | pf-mix |
| pf-level | 음량이 목표 안인가? | 약 -16 LUFS integrated이고 true peak가 -4 dBFS 미만이면 예다. 모노 다운믹스도 같은 방식으로 잰다.[](source:se-mix) | sound-flow | pf-level |
| pf-proof | 6 프레임·파형 증명 | cue마다 내보낸 MP4에서 cue 직전과 직후 프레임을 한 장씩 뽑고, 둘레의 파형을 `checks/cue-XX.png`로 그린다. 가장 위험한 5곳(박자 오차가 가장 큰 곳, `typing`·`riser` 같은 긴 소리, `reveal`)을 고른다.[](source:se-prove) | sound-flow | pf-proof |
| pf-swap | 7 swap 선택 | `report.html`은 cue마다 시각, 카테고리, 쓴 소리(재생 버튼), 출처 페이지, 라이선스, 크레딧, 대안과 "let model decide"를 보여 준다. 사용자가 고르고 **Download swaps.json**을 누르면 `--swaps swaps.json`으로 다시 돌린다. `"auto"`는 대안 중 다른 소리를 고르라는 뜻이고, 실행 사이에 cue 번호는 바꾸지 않는다.[](source:se-swap) | sound-flow | pf-swap |
| pf-report | 사용자 보고 | 아래 체크리스트를 보고한다. "좋게 들린다"고 말하지 않는다.[](source:se-report) | sound-flow | pf-report |
| pf-human | 헤드폰 5곳 확인 | 사용자가 5개 timestamp를 헤드폰으로 확인한다. 원문은 합격 기준을 정하지 않는다(`원문에 명시 없음`).[](source:se-prove) | sound-flow | pf-human |

cue 종류는 이 표의 카테고리로 연결되고, `category_map`과 같다(11개 항목 대조).[](source:se-cuetab)[](source:mf-cmap) 한 cue에 소리 하나를 쓰고, 같은 카테고리가 반복되면 테이크를 바꿔 기계적으로 들리지 않게 하라고 한다.[](source:se-cueone)

| cue 종류 | 카테고리 | 원문 규칙 |
| --- | --- | --- |
| `movement`(슬라이드, 카메라 이동) | whoosh | 2 프레임 먼저 시작한다. 이동 길이에 맞춰 길이를 고른다 |
| `scene_cut` | whoosh | 짧은 whoosh를 2 프레임 먼저 시작한다. `transition` 소리는 대안이다 |
| `appear` | pop | 그 프레임에 맞춘다 |
| `click` | click | 그 프레임에 맞춘다 |
| `typing` | typing | `dur`에 맞춰 반복하거나 자르고, 조용하게 쓴다 |
| `build_up` | riser | 다음 hit에서 끝나게 한다 |
| `reveal` | impact | 가장 큰 SFX다 |
| `success` | pop | `ding` 소리는 대안이다 |
| `error_or_tech` | glitch | 추가 규칙은 원문에 명시 없음 |
| `hover_or_small_ui` | tick | 아주 조용하게 쓴다. `ui-blip`, `click`은 대안이다 |
| `bed` | ambience | 모든 소리 아래에 까는 선택 항목이다 |

수치는 의무·권고·목표를 구분해서 읽는다. 아래는 `SKILL.md`가 적은 값이다.

| 값 | 성격 | 적용 조건과 보충 |
| --- | --- | --- |
| 약 -16 LUFS integrated | 목표(원문은 "about"). 5단계에서 수정 반복의 기준이다 | 내보낸 MP4에서 잰다. 중간 WAV는 안 된다[](source:se-mix)[](source:se-mp4) |
| true peak -4 dBFS 미만 | 목표(원문은 "below"). 넘으면 gain을 고치거나 limiter를 더한다 | AAC 압축 뒤나 폰 스피커에서 깨지지 않게 하려는 값이다[](source:se-mix) |
| 모노 다운믹스 | 측정해서 보고한다. 합격선은 `원문에 명시 없음` | `ffmpeg ... -ac 1` 명령이 적혀 있다[](source:se-mix)[](source:se-report) |
| 음악 약 -12 dB | 권고("around"). SFX 아래다 | 음악 bed 기준이다[](source:se-mix) |
| voiceover 덕킹 8 dB에서 12 dB | 권고. voiceover 아래에서 음악을 낮춘다 | 코드에서 구현을 확인하지 못했다(감사 패널)[](source:se-mix) |
| 2 프레임 먼저 | 규칙. `movement`, `scene_cut`에 적용한다 | cue 종류 표[](source:se-cuetab) |
| 120 Hz 아래 저역 통과 | 절차. 킥과 beat 선을 비교하는 용도다 | 처음 4마디를 그린다[](source:se-beat) |
| 5개 timestamp | 의무. 헤드폰 확인용으로 사용자에게 준다 | 박자 오차가 큰 곳, 긴 소리, `reveal`이 우선이다[](source:se-prove)[](source:se-report) |
| 컷별 박자 오차(ms) | 보고 의무. 합격선은 `원문에 명시 없음` | 오차가 가장 작은 음악 시작 위치를 고른다[](source:se-align) |
| 장면 전환 임계 0.3 | 예시 명령의 값. 구성 소스가 없을 때만 쓴다 | `select='gt(scene,0.3)'`[](source:se-cue) |

다음은 `SKILL.md`에 없고 코드에만 있는 기본값이다. 코드를 읽어 확인했고 실행하지 않았다.

| 값 | 코드에서 하는 일 |
| --- | --- |
| 목표 허용 오차 ±0.5 LU, 최대 10회 | 측정과 조정을 최대 10번 반복한다. 음량이 -16 LUFS에서 0.5 안이고 peak가 -4 미만이면 멈춘다. 10번 안에 못 맞추면 맞추지 못한 채 마지막 결과를 쓴다[](source:sp-loud) |
| 30 ms | 킥과 librosa grid의 중앙값 차이가 30 ms를 넘으면 grid 전체를 그만큼 옮긴다[](source:sp-beat) |
| 음악 시작 탐색 | 0초부터 beat 간격의 8배까지 5 ms씩 옮기며, `scene_cut`·`reveal` 컷과 beat 거리의 합이 가장 작은 위치를 고른다. 애니메이션 타이밍은 바꾸지 않는다[](source:sp-align) |
| 소리 gain | `movement`·`scene_cut`은 -4 dB, `typing`은 -8 dB, `build_up`은 -6 dB, `appear`·`click`·`hover_or_small_ui`는 -6 dB다. `reveal` 등은 0 dB다[](source:sp-place) |
| 음악 -12 dB | `--music-db` 기본 -12.0을 음악 트랙에 곱하고 끝 0.6초를 페이드한다[](source:sp-args)[](source:sp-music) |
| 증명 프레임 | cue 시각의 0.1초 전과 0.15초 뒤 프레임, 파형은 cue의 0.5초 전부터 0.8초 뒤까지다[](source:sp-proof) |
| 5곳 고르는 기준 | 박자 오차(초)에 10을 곱하고, `typing` 0.5, `build_up` 0.4, `reveal` 0.3, `scene_cut` 0.2를 더해 큰 순서로 5개를 고른 뒤 시간순으로 적는다[](source:sp-ts) |

`SKILL.md`의 "quiet"나 "very quiet"가 코드에서는 위 gain 값이다. 판정: 원문의 수치 표현은 방향만 주고, 실제 dB 값은 코드가 정한다. 근거는 `sound_pass.py`의 cue 처리 줄이다.[](source:sp-place)

사용자 보고에 들어갈 것은 다음과 같다.[](source:se-report)

- [ ] 라이선스 확인 결과: 모두 알려진 라이선스인지, 아니면 알 수 없는 소리의 이름
- [ ] 사용처와 허용 여부
- [ ] 음악의 출처와 라이선스, 또는 확인하지 못했다는 사실
- [ ] `CREDITS.txt`가 있다는 것
- [ ] beat grid 결과: 옮겼는지, 얼마나 옮겼는지
- [ ] 컷별 박자 오차(ms)
- [ ] 최종 LUFS와 true peak(스테레오와 모노)
- [ ] 헤드폰으로 확인할 5개 timestamp

## 무엇을 쓰고 무엇이 만들어지나 {#library}

기본 kit는 카테고리마다 하나씩 7개이고, 원문에 따르면 Bart가 2026-10-12에 귀로 골랐다. 사용자가 다른 것을 요구하지 않으면 기본 kit를 먼저 쓴다.[](source:se-kit) 6개는 `sfx/kit/`에 번들된 CC0 파일이고, typing 하나만 런타임에 내려받는다.[](source:se-kit)

| 카테고리 | 소리 | 출처 |
| --- | --- | --- |
| whoosh | "Whoosh" (qubodup) | 번들 `sfx/kit/whoosh.ogg`, CC0 |
| click | "Classic Click" (adh.dreaming) | 번들 `sfx/kit/click.ogg`, CC0 |
| pop | "POP SFX Neutral" (ethernel0) | 번들 `sfx/kit/pop.ogg`, CC0 |
| riser | "Cinematic Riser #3 subtle" | 번들 `sfx/kit/riser.ogg`, CC0 |
| impact | "soft_impact3" (peoplearehappy) | 번들 `sfx/kit/impact.ogg`, CC0 |
| tick | "Click / Tick" (Squirrel_404) | 번들 `sfx/kit/tick.ogg`, CC0 |
| typing | Mixkit "Fast laptop keyboard typing" (#1392) | 런타임에 `sound-effects-cache/`로 내려받는다. Mixkit 약관상 commit하지 않는다 |

기본 kit 밖의 나머지는 대안이다. `alt_categories`가 어떤 카테고리가 서로 대신할 수 있는지 적는다.[](source:se-kit)[](source:mf-alt) 예를 들어 `tick`은 `ui-blip`과 `click`, `pop`은 `ding`, `whoosh`는 `transition`을 대안으로 쓴다.[](source:mf-alt)

@facts
| 번들 CC0 대안 | 103개. `manifest.json`의 `bundled` 항목 수이고 라이선스 값은 모두 `CC0 1.0`이다[](source:rd-lib) |
| 런타임 전용 Mixkit | 40개. `runtime` 항목이다. 저장소에 없고 사용자 프로젝트로 내려받는다[](source:rd-lib) |
| 오디오 파일 | `sfx/` 아래 ogg 109개(번들 103 + kit 6)가 있다. 측정한 합계는 2,381,752B이고, README는 "about 2.7 MB"라고 적는다[](source:rd-lib) |
| 번들 가공 | 앞 무음 제거, 길이 4초 상한(riser 6초, ambience 20초), 한 번 울리는 소리는 -3 dBFS peak 정규화, ambience는 -35 LUFS, 48 kHz, OGG(q4, ambience q3)[](source:li-code)[](source:mf-norm) |
| 음악 추천 | `MUSIC.md`에 4개 느낌에 12곡. 모두 Mixkit Stock Music이고 저장하지 않고 런타임에 내려받는다[](source:mu-head)[](source:mu-tab) |

`manifest.json`은 필드 구조와 항목 수·라이선스 값 집계만 확인했고, 항목별 내용은 첫 항목과 마지막 항목 표본만 봤다.

스크립트가 만드는 산출물은 다음과 같다.[](source:se-script)

@tree id=output-layout title="--out 폴더에 생기는 것"
| out | out/ | - |
| after | after.mp4 | out | source:se-script |
| report | report.html | out | source:se-swap |
| sound | SOUND.md | out | source:sp-ts |
| credits | CREDITS.txt | out | source:sp-lic |
| beatgrid | beatgrid.png | out | source:sp-beat |
| checks | checks/cue-XX.png | out | source:sp-proof |
| mixraw | mix_raw.wav (코드에만 있음) | out | source:sp-music |
| cache | sound-effects-cache/ (런타임 소리) | out | source:sp-pick |

`SOUND.md`에는 라이선스 확인, 로그, cue별 사용 파일 표, LUFS와 peak 수치, 5개 timestamp가 들어간다.[](source:se-script) 위 트리의 `mix_raw.wav`와 `sound-effects-cache/`는 `SKILL.md`의 산출물 목록에 없고 코드에서만 확인했다.[](source:sp-music)[](source:sp-pick)

소리를 더 찾거나 원본을 받을 때의 규칙은 이렇다.

- 사용자가 더 많은 소리를 원하면 아래 소스에서 3~5개 후보를 링크, 제작자, 라이선스와 함께 제안하고 사용자가 고르게 한다. 쓰기 전에 그 페이지를 열어 오늘 표시된 라이선스를 확인하고 사용처 허용 여부를 본다(0단계). 고른 소리는 `CREDITS.txt`에 넣는다.[](source:se-more)
- 이 저장소의 `sfx/`에 넣을 수 있는 소리는 CC0뿐이다. 항목마다 `manifest.json` 항목과 `LICENSES.md` 행이 있어야 한다.[](source:se-morerepo)
- 번들 파일이 너무 거칠면 `source_url`의 원본을 받는다. 원본은 사용자 프로젝트(예: `sound-effects-cache/originals/`)에 저장하고 이 스킬 폴더에는 저장하지 않는다. 번들과 같은 자르는 길이와 음량 처리를 같게 한다.[](source:se-orig)
- Kenney 원본은 manifest의 `original_file`이 정확한 파일을 가리킨다. 예: `kenney_interface-sounds.zip → Audio/click_001.ogg`.[](source:se-orig)

| 소스 | 라이선스 메모(원문) |
| --- | --- |
| Freesound | CC0 필터를 쓴다. CC0는 번들할 수 있고 크레딧이 필요 없다. CC-BY는 영상 설명에 크레딧이 필요하다. CC-BY-NC는 번들하지 않고 상업적으로 쓰지 않는다[](source:se-moretab) |
| Kenney | 모두 CC0. 번들해도 된다[](source:se-moretab) |
| Mixkit | 영상에는 수익화해도 되지만 재배포는 안 된다. 사용자 프로젝트에만 내려받는다[](source:se-moretab) |
| Pixabay | 영상에 무료, 크레딧 불필요. 단독 재배포는 안 된다. 사용자가 브라우저로 내려받고 번들하지 않는다[](source:se-moretab) |
| Sonniss GDC | 영상에 로열티 없음. 원본 재배포와 AI 학습은 안 된다. 로컬 사용만 한다[](source:se-moretab) |
| YouTube Audio Library | YouTube 영상 전용이고 Studio 안에서만 쓸 수 있다. 번들하지 않는다[](source:se-moretab) |

README는 YouTube Content ID가 무료 소리를 잘못 신고하면 이의를 제기하고 그 소리의 출처 링크를 붙이라고 안내한다.[](source:rd-lic) `MUSIC.md`는 Mixkit 음악이 신고되면 team@mixkit.co로 전달해 달라는 Mixkit의 요청을 적는다.[](source:mu-allow)

## 흐름 속 위치 {#position}

@workflow id=sfx-position title="sound-effects 앞뒤"
| pos-broll | motion-broll | backend |
| pos-sfx | sound-effects | backend |
| pos-user | 사람 확인 | external |
| pos-broll > pos-sfx | plan.json | dashed |
| pos-sfx > pos-user | 5곳·swap | emphasis |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `motion-broll`(앞) | `plan.json`을 cue 소스 후보로 읽는다 | - | 방향 주의: 읽는 쪽이 `sound-effects`다. cue 목록을 만들 때 "구성 소스에서 가져올 수 있으면" 가져오는 곳 중 하나로 `plan.json`을 든다. 권고형이고 필수 순서가 아니다. `motion-broll`의 `SKILL.md`는 `plan.json`을 쓰라고 적을 뿐 `sound-effects`를 부르지 않는다[](source:se-cue)[](source:mb-plan) | r03 |
| explainer 3종 | - | - | `미확인`. `sound-effects`의 적용 대상은 Claude Code로 만든 모션그래픽 영상이다. explainer 3종은 자체 `buildAudio`로 합성 음악과 효과음을 넣고, `sound-effects`는 합성을 금지한다. 어느 쪽도 서로를 부르지 않아 후속 사용 여부는 확인되지 않았다[](source:se-fm)[](source:se-synth)[](source:ed-audio) | r04 |
| (뒤) | 이 스킬 뒤에 오는 스킬은 없다 | `after.mp4`, `report.html`, `SOUND.md`, `CREDITS.txt`, `beatgrid.png`, `checks/` | 받는 쪽은 스킬이 아니라 사람이다. 사용자가 5곳을 듣고 swap을 고른다[](source:se-script)[](source:se-prove)[](source:se-swap) | - |

그림은 r03만 점선으로 그렸다. r04는 `미확인`이라 그리지 않았고 표에만 남겼다. 이 묶음의 `object-separation`은 이 스킬과 연결이 원장에 없다.

전체 흐름은 `video/_group-talking-head-edit/talking-head-edit.html`에 있다. 관계 근거는 `video/relations.md`의 rel-id로 확인한다.

`motion-broll`의 `plan.json`이 `cues.json`의 `t`, `type`, `desc`와 어떻게 대응하는지는 이 분석에서 확인하지 않았다. 원문에도 변환 방법이 `원문에 명시 없음`이다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 8개, 합계 132,327B다. `SKILL.md` 13,793B, `README.md` 5,494B, `MUSIC.md` 3,311B, `TOP-PICKS.md` 4,177B, `LICENSES.md` 19,850B(전부), `sfx/manifest.json` 68,552B(구조와 표본만), `scripts/sound_pass.py` 14,041B, `scripts/report.py` 3,109B다.
- `TOP-PICKS.md`는 기본 kit 소리와 대안의 출처 표라서 본문에서는 머리말만 인용했다. 표 내용은 `LICENSES.md`·`manifest.json`과 같은 소리를 가리킨다는 것까지만 확인했다.[](source:tp-head)
- 제외한 파일: `sfx/` 아래 오디오 바이너리 109개(ogg, 합계 2,381,752B)는 읽거나 들었다고 하지 않는다. 바이너리이고, 이 분석은 소리를 분석할 수 없기 때문이다.
- 번역본은 이 폴더에 없다. 다른 컬렉션에 같은 이름의 스킬도 없다(`relations.md`).
- 원문 중복: Measure the exported MP4 규칙이 `SKILL.md`에 같은 문장으로 두 번 나온다(35줄, 36줄). 페이지에는 한 번만 썼다.[](source:se-mp4)
- 약관 확인일(2026-10-13)과 kit 선정일(2026-10-12), Vox 게시일(2026-10-11)은 모두 원문이 적은 날짜다. 이 분석에서 약관 페이지를 열지 않았다.
- 원문 대조 범위: 활성화 제한 1개(호출 제한 필드 없음), 금지 9행, 라이선스·크레딧 규칙 7개, `SKILL.md` 수치 10행과 코드 기본값 7행, 종료·멈춤 조건 5개(0단계 교체 후 내보내기, 음량 목표 달성, 알 수 없는 라이선스 보고 시 게시 보류, 5곳 전달, swap 재실행)를 모두 대조했다. 관계 행 r03, r04는 원장과 원문을 다시 대조했고 같다.
- 분석 중 바뀐 파일: 없음. `video/` 아래 작업 트리는 commit `23e8047` 그대로다.

`SKILL.md`의 설명을 코드(`sound_pass.py`, `report.py`)와 대조한 결과다. 코드는 읽기만 했고 실행하지 않았다.

| `SKILL.md` 설명 | 코드 | 판정 |
| --- | --- | --- |
| 3단계: librosa beat, 120 Hz 저역 통과, 중앙값 오프셋으로 grid 이동, `beatgrid.png` | 같은 방식이다. 이동 기준 30 ms는 코드에만 있다[](source:sp-beat) | 일치 |
| 4단계: 컷-박자 오차를 ms로 보고, 못 바꾸면 음악 시작 이동 | 음악 시작 탐색과 오차 로그를 한다. 애니메이션 타이밍 변경은 코드 밖이다[](source:sp-align) | 일치 |
| 5단계: 내보낸 MP4에서 측정하고 조정을 반복, 모노도 측정 | `after.mp4`를 재고 최대 10회 반복한다. 모노는 측정해 로그에 적을 뿐 통과 판정은 없다[](source:sp-loud) | 일치 |
| 음악 약 -12 dB, SFX 아래 | 음악 트랙에 `--music-db`(기본 -12.0)를 곱한다. SFX와 비교한 상대값은 아니다[](source:sp-music) | 부분 일치 |
| voiceover > SFX > music, 음악을 8~12 dB 덕킹 | 덕킹 코드가 없다. 영상의 오디오는 `-map 0:v -map 1:a`로 믹스에 바뀌어 voiceover가 들어가지 않는다[](source:sp-map) | 코드에 없음 |
| 6단계: 직전·직후 프레임, 파형, 5개 timestamp | 같은 산출물을 만들고, 5곳은 위험도 가중으로 고른다[](source:sp-proof)[](source:sp-ts) | 일치 |
| 산출물 `after.mp4`, `report.html`, `SOUND.md`, `CREDITS.txt`, `beatgrid.png`, `checks/` | 모두 쓴다. 추가로 `mix_raw.wav`를 남기고 `/tmp`에 임시 파일을 쓴다[](source:sp-music)[](source:sp-proof) | 일치(추가 있음) |
| 라이선스: CC0와 Mixkit Free License만 무료, 알 수 없음 목록, 음악 미확인, `CREDITS.txt` | 같다. 소스 페이지 확인은 에이전트 몫이다[](source:sp-lic)[](source:sp-uc) | 일치 |
| swap 보고서: 재생 버튼, 대안, "let model decide", `swaps.json` | `report.py`가 같은 구성이다. 대안은 cue마다 12개까지 보여 주고, `swaps.json`은 cue 번호를 키로 쓴다[](source:rp-all)[](source:sp-place) | 일치 |
| 원본 파일을 `--swaps`로 넘긴다 | `--swaps`는 manifest에 있는 `file`이나 `runtime_url`과 같은 값만 찾는다. 다른 경로는 조용히 무시하고 기본 kit 소리를 쓴다[](source:sp-pick) | 어긋남 |
| 같은 카테고리가 반복되면 테이크를 바꾼다 | 기본 kit가 있는 카테고리는 매번 같은 소리다. kit가 없는 카테고리(glitch 등)와 `auto` swap만 seed 7로 무작위 선택한다[](source:sp-pick) | 코드에 없음 |
| 음악이 없으면 `MUSIC.md`에서 제안 | `--music`이 필수 인자라서 음악 없이 돌리는 옵션이 없다[](source:sp-args) | 일치 |

@callout level=open-question title="코드 대조에서 확신하지 못한 곳"
- voiceover를 믹스에 넣는 경로가 코드에 없다. 사용자가 voiceover를 별도 파일로 처리하는지, 입력 `silent.mp4`에 voiceover가 없다고 전제하는지는 `원문에 명시 없음`이다. 원문의 영상 이름 예시는 `silent.mp4`다.[](source:se-script)[](source:sp-map)
- 음악이 영상보다 짧으면 음악 시작 탐색 범위가 비어 오류가 날 것으로 읽힌다. 실행해 확인하지 않았다.[](source:sp-align)
- `build_up`은 코드에서 `t + dur`(기본 0.8초)에 끝나게 배치된다. 다음 hit와 맞추려면 `cues.json`에 `dur`가 필요하다는 점이 `SKILL.md` 예시에는 typing에만 나온다.[](source:sp-place)[](source:se-cue)
- 기본 kit typing 항목의 `download_to`(`sound-effects-cache/typing.mp3`)와 코드가 실제로 쓰는 파일 이름(카테고리와 URL 끝 이름)이 다르다. 코드는 `download_to`를 읽지 않는다.[](source:mf-kit)[](source:sp-pick)
- README의 라이브러리 용량 "about 2.7 MB"와 측정한 ogg 합계 2,381,752B(약 2.4 MB)가 다르다. 어느 쪽이 맞는지 원문으로는 판단할 수 없다.[](source:rd-lib)
- 판정이 아니라 사실 질문: 이 스킬이 실제로 에이전트의 소리 판단을 얼마나 바꾸는지는 실행해 보지 않아 확인하지 못했다.
