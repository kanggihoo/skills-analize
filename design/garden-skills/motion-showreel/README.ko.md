# Motion Showreel 스킬

**코드로 렌더링하는 모션 영상. 로고 스팅부터 최대 20분 분량의 챕터 기반 영상까지 다룬다. BGM과 SFX는 각각 독립된 소스를 쓰고, 사용자 나레이션 또는 TTS를 지원하며, 편집 가능한 소스를 제공한다.**

[중국어 문서](./README.zh-CN.md) · [컬렉션 루트로 돌아가기](../../README.md)

![Motion Showreel Skill](../../dist/imgs/covers/motion-showreel.webp)

---

## 이 스킬은 무엇인가?

`motion-showreel`은 아이디어를 완성된 영상(MP4와 편집 가능한 소스)으로 바꾼다. 주로 그래픽, 타이포그래피, 인터페이스 애니메이션을 다룬다. 요구사항과 스타일 프레임을 확정한 뒤, 에이전트가 결정적(deterministic) 웹 페이지를 프레임 단위로 렌더링한다. 화면과 소리는 하나의 타임라인을 공유하며, 나레이션이 있는 영상은 실제 음성 타이밍을 따른다.

다음 용도에 맞게 설계되었다.

- 모션 쇼릴과 포트폴리오 작품
- 제품 티저와 런칭 영상(사용자가 제공한 사실과 스크린샷 기반)
- UI 모션 데모: morph chain, 마이크로 인터랙션
- 키네틱 타이포그래피와 비트에 맞춘 인용 카드
- 로고 스팅, 타이틀 시퀀스, 채널 범퍼
- 제너레이티브 아트 루프와 데이터 "number drop"
- 매체가 바뀌는 시대별 회고 영상(픽셀 → 벡터 → 3D …)

짧은 작품은 보통 5~60초이며, 챕터 기반 영상은 나레이션 유무와 관계없이 최대 **20분**까지 만들 수 있다. 클릭으로 진행하는 발표나 기사를 스크립트로 바꾸는 작업은 [`web-video-presentation`](../web-video-presentation)을, 웹사이트와 프로토타입은 [`web-design-engineer`](../web-design-engineer)를 쓴다. 실사 인물 연기, 실제 촬영, 일반적인 영상 편집은 이 스킬의 범위 밖이다.

제작 전에 **주제/내용, 길이, 가로 또는 세로, BGM 소스, SFX 소스, 나레이션 방식**이 반드시 필요하다. BGM과 SFX는 각각 AI 합성, 사용자 파일, 명시적인 끔(off) 중에서 독립적으로 고른다. 나레이션은 없음, 사용자 오디오, TTS 중 하나이며, **TTS는 사용자가 제공한 스크립트를 읽어야 한다**. 설정된 API(Gemini, MiniMax 또는 사용자 정의 어댑터)가 필요하다. 길이가 맞지 않으면 확인을 받아야 하며, 음성은 임의로 잘리거나 빨라지거나 다시 쓰이지 않는다.

참고 자료, 대상 독자와 플랫폼, 스타일은 선택 사항이다. 사용자의 구체적인 지시나 제공된 스크립트가 내용의 근거가 되며, 없으면 구체적인 자료를 요청하거나 주제를 조사하면서 사실의 출처를 남긴다. 스타일이 지정되지 않으면 서로 뚜렷이 다른 세 가지 방향을 제안한다.

---

## 쇼케이스

아래 클립은 모두 이 스킬을 쓴 에이전트가 짧은 요청으로 만든 것이다. 대부분은 요청이 스타일 하나와 "나머지는 알아서"뿐이었다. 이 미리보기는 4초, 12fps 발췌본이며, 실제 렌더는 1920×1080, 30fps, 소리 포함이다.

<table>
<tr>
<td width="50%" valign="top"><img src="../../dist/imgs/motion-showreel/promo.webp" alt="Motion Showreel 예고편: 비트마다 새로운 매체" width="100%"><br/><strong>Motion Showreel 예고편</strong> · 80초<br/><sub>스킬 자체의 예고편이다. 주황색 점 하나가 비트마다 새로운 매체(잉크, 종이, 리소그래프, CRT, 콜라주, 유리, 점토 …)로 다시 그려지고, 이후 22개의 실시간 스타일로 이루어진 벽으로 터져 나온다. 합성 스코어는 매체에 맞춰 악기를 바꾼다.</sub></td>
<td width="50%" valign="top"><img src="../../dist/imgs/motion-showreel/afterglow.webp" alt="AFTERGLOW 신스웨이브 타이틀" width="100%"><br/><strong>AFTERGLOW</strong> · 19초 · <code>synthwave-neon</code><br/><sub>가상의 앨범을 위한 타이틀 시퀀스다. 카메라가 네온 게이트를 통과해 달리고, 마지막 게이트 뒤에는 반 박자의 암전이 있다. 그다음 드롭에서 크롬 타이틀이 지평선에서 튀어 오른다.</sub></td>
</tr>
<tr>
<td width="50%" valign="top"><img src="../../dist/imgs/motion-showreel/boink.webp" alt="boink 부드러운 3D 연쇄 반응" width="100%"><br/><strong>boink</strong> · 18초 · <code>soft-3d-toy</code><br/><sub>원테이크 연쇄 반응이다(Honda의 "Cog"를 참고했다). 도미노 하나하나가 마림바 음을 연주하고, 젤리가 부딪치며 세계 전체에 찌그러짐 파동을 보내며, 처음 공은 <i>i</i>의 점으로 떨어진다.</sub></td>
<td width="50%" valign="top"><img src="../../dist/imgs/motion-showreel/last-stroke.webp" alt="LAST STROKE 잉크 막대 인간 게임 예고편" width="100%"><br/><strong>LAST STROKE</strong> · 30초 · 사용자 정의 "stick ink" 스타일<br/><sub>그린 선이 모두 현실이 되는 가상 게임의 예고편이다. 적 40명을 관통하는 단 한 번의 획 뒤에 영상에서 유일한 완전한 침묵의 비트가 온다. 이어서 적들이 잉크로 터지고, 그 획이 타이틀이 된다.</sub></td>
</tr>
<tr>
<td width="50%" valign="top"><img src="../../dist/imgs/motion-showreel/umbra.webp" alt="UMBRA 시네마틱 일식 타이틀" width="100%"><br/><strong>UMBRA</strong> · 27초 · <code>cinematic-title</code><br/><sub>개기일식을 다룬 가상 영화의 오프닝 타이틀이며, 2.39:1 레터박스로 제작했다. 절대 침묵의 비트 뒤에 마지막 베일리 비드가 번쩍이며 다이아몬드 반지가 되고, 타이틀이 달 안에서 펼쳐진다. 피아노는 샘플링된 Salamander 그랜드(2단계)이며, 그 위에 합성한 예고편 사운드 디자인(booms, braam)을 겹쳤다.</sub></td>
<td width="50%" valign="top"><br/><strong>작품마다 받는 결과물</strong><br/><sub>
워크스페이스에서 내보낸 MP4(<code>out/editor-&lt;task-id&gt;.mp4</code>) + <code>out/poster.png</code><br/>
<code>brief.md</code>: 재사용 가능한 구조화 프롬프트<br/>
<code>index.html</code> / <code>timeline.js</code> / <code>score.mjs</code>: 편집 가능한 소스<br/>
<code>sh build.sh</code>: 전체 또는 한 구간만 다시 빌드<br/>
<code>qa/</code>: 접촉 시트, 휴대폰 크기 검사, 샷별 모션, 텍스트 프레이밍 표시, 파형과 스펙트럼<br/>
기술 검사(모두 PASS)와 솔직한 검토 기록
</sub></td>
</tr>
</table>

---

## 핵심 아이디어

- **화면 = 시간의 함수.** 페이지는 결정적인 `window.render(t)`를 노출한다(`Math.random`, 타이머, rAF, CSS 애니메이션을 쓰지 않는다). Playwright가 모든 프레임을 캡처하고 ffmpeg가 MP4로 인코딩한다. 모션 블러(`--subframes`), 슈퍼샘플링(`--dpr`), 필름 그레인(`--grain`)은 페이지 코드가 아니라 렌더 플래그다.
- **화면과 소리를 위한 하나의 타임라인.** `timeline.js`가 모든 컷, 히트, 큐를 담는다. 페이지와 스코어가 모두 이를 import하므로 히트가 정확한 프레임에 맞는다.
- **벤치마크를 먼저, 그다음 세 가지 구조.** 무엇이든 그리기 전에 에이전트는 레퍼런스 작품 1~2개를 고르고(무엇을 배울지, 무엇을 베끼지 않을지), 후보 구조 세 가지를 적는다. 레퍼런스 영상은 측정할 수 있다. `inspect.mjs grid`는 컷과 그 컷이 놓인 비트 그리드를 찾고, `heat`는 각 구간에서 어디가 움직이는지 보여 준다. 처음 떠오른 아이디어는 대개 그 스타일의 클리셰다.
- **출발점이지 메뉴가 아닌 스타일 라이브러리.** 43개 스타일 각각에 룩, 팔레트, 타입, 모션, 카메라 문법, 사운드 팔레트, 고유 동작, 함정에 대한 고정 규칙이 있다. 모든 스타일은 2~3개를 고를 수 있도록 8~12개의 식별 신호를 나열하고, 자신의 클리셰도 구체적으로 적는다. 그래서 "synthwave"를 골랐다고 매번 같은 격자와 노을이 나오지는 않는다. 하나를 그대로 쓰거나, 각색하거나, 두 개를 섞거나, 템플릿에서 직접 정의할 수 있다.
- **소리에도 고유한 방향이 있다.** 브리프는 사운드도 다룬다. 레퍼런스, 그루브, 화성, 팔레트, 드라마 아크를 정한다. 오디오 기본값 목록은 모든 작품이 같은 노래로 끝나는 일을 막는다.
- **요청하면 제작 과정을 지켜본다.** 초기 피드백에서 진행 상황을 보고 싶다고 하면, 에이전트는 이른 시점에 안정적인 진행 페이지를 열고 검사를 마친 스타일 프레임, 음성 샘플, 씬, 믹스를 발행한다. 최종 미리보기와 내보내기도 같은 페이지에서 기존 제작 및 승인 검사와 함께 이루어진다. 자세한 내용은 [`references/progress.md`](./references/progress.md)를 참고한다.
- **요구사항, 스타일, 완성 미리보기를 승인받는다.** 완료된 요구사항과 스타일 프레임을 확인받은 뒤, MP4를 내보내기 전에 워크스페이스에서 완성된 씬을 검토한다. 스타일이 지정되지 않으면 서로 다른 세 방향을 제안한다. 창작의 자유가 누락된 제작 사양을 조용히 정하지는 않는다.
- **음성 주도 타이밍과 챕터 빌드.** TTS는 사용자의 스크립트를 읽고, 가져온 녹음은 실제 세그먼트 타임스탬프를 쓴다. 화면은 음성을 따르고, 음악과 효과음은 나레이션 중에 양보하며, 긴 빌드는 실패 후에도 영구 챕터 캐시를 재사용한다.
- **연속적인 씬.** 스토리보드는 문장을 가로질러 오브젝트 상태와 공간적 연속성을 추적한다. 키워드 이벤트는 측정된 단어 타임스탬프나 수동 앵커를 쓰고, 오디오 미리보기는 스크러빙과 프레임 단위 이동을 지원한다. 방향이 움직임에 달려 있으면 스타일 확인 시 대표 모션 샘플을 함께 보여 준다.
- **기술 검수는 취향 검수와 분리된다.** 프로그램 검사(크기, fps, 길이, 프레임 수, 검은 프레임, 라우드니스, 트루 피크, 루프 이음새, 결정성)는 모두 통과해야 한다. 측정된 검토 자료는 그 옆에 놓이되 아무것도 막지 않는다. 샷별 모션(갑작스러운 점프와 한 프레임 플래시 포함), 텍스트 프레이밍 검사(프레임에 잘린 텍스트, 겹침, 안전 영역 밖, 너무 작음)가 여기에 든다. 에이전트의 검토 메모는 사용자가 더 빠르게 볼 수 있게 도울 뿐, 사용자의 직접 시청을 대신하지 않는다.
- **자유 모드.** "go all out" 또는 "surprise me"라고 말하면, 에이전트는 기본 규칙과 기술 파이프라인만 유지한다. 스타일, 구조, 기법은 모델의 판단에 맡긴다.

---

## 워크플로

```text
0  Environment check (once)
1  Requirements ─────── fill missing required choices, summarize; 🛑 wait for confirmation
2  brief.md ─────────── benchmark → format + style → Reel Read → shot list + audio plan
3  Style frames ─────── style given → 3 frames; no style → 3 directions × 1 frame; 🛑 wait for confirmation
4  Create ───────────── prepare real narration timings if used → timeline → shots → web checks
5  Music / SFX / mix ── independent sources; voice has priority
6  Workspace preview ─ open the editor, review and revise; 🛑 wait for export approval
7  Export / acceptance  encode MP4 → technical checks (must PASS) + final review
8  Delivery
```

워크스페이스 기본 검토 및 내보내기 승인은 [`references/editor.md`](./references/editor.md), TTS, 녹음 타임스탬프, 독립 트랙 믹싱은 [`references/narration.md`](./references/narration.md), 2분을 넘는 챕터 캐싱, 복구, 오디오 준비는 [`references/long-form.md`](./references/long-form.md)를 참고한다. 기존 스타일, 오디오 엔진, 비트 도구, 루프, 렌더링 제어는 모두 그대로 사용할 수 있다.

---

## 스타일 라이브러리

8개 그룹에 걸쳐 43개 스타일이 있다. 그래픽과 타입, 인터페이스와 제품, 레트로와 스크린, 3D와 머티리얼, 제너레이티브와 추상, 일러스트와 만화, 핸드메이드, 시네마틱이다. 렌더링된 스타일 미리보기는 다음과 같다(마지막 세 개는 20fps의 4초짜리 끊김 없는 루프다).

<table>
<tr>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-ukiyo-e.webp" alt="ukiyo-e" /><br /><sub><code>ukiyo-e</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-glass-material.webp" alt="glass-material" /><br /><sub><code>glass-material</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-kinetic-brutalist.webp" alt="kinetic-brutalist" /><br /><sub><code>kinetic-brutalist</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-swiss-editorial.webp" alt="swiss-editorial" /><br /><sub><code>swiss-editorial</code></sub></td>
</tr>
<tr>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-ink-wash.webp" alt="ink-wash" /><br /><sub><code>ink-wash</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-risograph-print.webp" alt="risograph-print" /><br /><sub><code>risograph-print</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-editorial-collage.webp" alt="editorial-collage" /><br /><sub><code>editorial-collage</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-isometric-infographic.webp" alt="isometric-infographic" /><br /><sub><code>isometric-infographic</code></sub></td>
</tr>
<tr>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-liquid-shader.webp" alt="liquid-shader" /><br /><sub><code>liquid-shader</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-data-motion.webp" alt="data-motion" /><br /><sub><code>data-motion</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-generative-geometry.webp" alt="generative-geometry" /><br /><sub><code>generative-geometry</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-pixel-game.webp" alt="pixel-game" /><br /><sub><code>pixel-game</code></sub></td>
</tr>
<tr>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-synthwave-neon.webp" alt="synthwave-neon" /><br /><sub><code>synthwave-neon</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-paper-cut.webp" alt="paper-cut" /><br /><sub><code>paper-cut</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-minimal-ui.webp" alt="minimal-ui" /><br /><sub><code>minimal-ui</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-comic-pop.webp" alt="comic-pop" /><br /><sub><code>comic-pop</code></sub></td>
</tr>
<tr>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-flat-vector.webp" alt="flat-vector" /><br /><sub><code>flat-vector</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-guochao.webp" alt="guochao" /><br /><sub><code>guochao</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-painterly.webp" alt="painterly" /><br /><sub><code>painterly</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-glitch-digital.webp" alt="glitch-digital" /><br /><sub><code>glitch-digital</code></sub></td>
</tr>
<tr>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-soft-organic.webp" alt="soft-organic" /><br /><sub><code>soft-organic</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-hologram-hud.webp" alt="hologram-hud" /><br /><sub><code>hologram-hud</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-particle-field.webp" alt="particle-field" /><br /><sub><code>particle-field</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-art-deco.webp" alt="art-deco" /><br /><sub><code>art-deco</code></sub></td>
</tr>
</table>

<sub>라이브러리에 함께 있는 스타일: <code>dark-keynote</code> · <code>soft-3d-toy</code> · <code>crt-vhs</code> · <code>terminal-ascii</code> · <code>crayon-storybook</code> · <code>copperplate-engraving</code> · <code>cinematic-title</code> · <code>mixed-media-era</code>. 디렉터리, 세 방향 규칙, 스타일 혼합 방법은 <a href="./references/styles/INDEX.md"><code>references/styles/INDEX.md</code></a>를 참고한다.</sub>

추가 스타일 가이드: [Art Deco](./references/styles/art-deco.md), [One-Line](./references/styles/one-line.md), [Blueprint](./references/styles/blueprint.md), [Hologram HUD](./references/styles/hologram-hud.md), [Stained Glass](./references/styles/stained-glass.md), [Tilt-Shift Miniature](./references/styles/tilt-shift-miniature.md), [Pixel Diorama](./references/styles/pixel-diorama.md), [80s Cel Animation](./references/styles/cel-anime-80s.md), [Rubber Hose](./references/styles/rubber-hose.md), [Shadow Puppet](./references/styles/shadow-puppet.md). 모두 같은 템플릿을 따르며, 재질과 모션 규칙, 선택적 구현 방향을 담는다.

함께 쓸 수 있는 스타일: [Whiteboard Explainer](./references/styles/whiteboard-explainer.md), [Math / Concept Morph](./references/styles/concept-morph.md), [Illuminated Manuscript](./references/styles/illuminated-manuscript.md).

---

## Sound

| 단계 | 엔진 | 적합한 용도 |
|---|---|---|
| 1 · 내장 synth(기본) | `score.mjs`. 의존성이 없고 완전히 결정적이다. 드럼과 핸드 퍼커션, 베이스, 패드, 플럭, 멜릿(마림바 / 글로켄슈필 / 칼림바 / 스틸 팬), 오르간, 포먼트 코러스, FM 벨, 앰비언스 베드(테이프, 바이닐, 바람, 비), 스윙 / 스텝 리듬, 사이드체인, 비트크러시와 테이프 wow | 일렉트로닉, UI, 레트로, 추상, 핸드메이드, lo-fi |
| 2 · Tone.js | `score.tone.js`. 헤드리스 Chromium에서 오프라인으로 렌더링된다. 샘플링 악기(Salamander 그랜드 피아노, CC BY), 컨볼루션 리버브, 코러스 / 페이저 / 디스토션 | 시네마틱, 프리미엄 제품, 실제 악기와 공간감이 필요한 모든 것 |
| 내 트랙 | `audio.mjs beats`가 BPM, 비트, 다운비트, 드롭을 감지한다(librosa가 있으면 사용). 효과음은 그 위에 얹는다 | 기존 음악 |

두 단계는 겹쳐 쓸 수 있다(Tone.js 음악을 깔고, 합성한 효과음을 위에 얹고, 한 번에 마스터링). 모든 믹스는 −14 LUFS / −1 dBTP로 마스터링된다. 에이전트는 들을 수 없으므로, `audio.mjs check`가 라우드니스, 대역 균형, 무음을 보고하고, 선언된 각 드롭 앞의 "브레스"를 측정하며, 에이전트가 살펴볼 수 있도록 파형과 스펙트럼을 그린다.

---

## What It Ships

```text
skills/motion-showreel/
├── SKILL.md                 workflow, baseline rules, tool cheat sheet
├── README.md / README.zh-CN.md
├── manifest.json
├── references/
│   ├── formats.md           Formats, including narration and chapter-based films
│   ├── styles/              INDEX.md + _template.md + 40 style files
│   ├── craft.md             rhythm, motion, transitions, camera, type, colour, texture, signature moments, default-look blocklist
│   ├── sound.md             sound direction, synth API, Tone.js, arcs, groove / harmony vocabulary, mixing, audio defaults
│   ├── narration.md         user-script TTS, recording timestamps, keyword events and voice-first mixing
│   ├── long-form.md         up to 20 minutes, chapter manifests, caching and recovery
│   ├── stack.md             page contract, determinism, per-tech pitfalls, fonts, multi-format, performance
│   ├── recipes.md           ready-made snippets (masked type, morph chains, particle type, seamless loops, WebGL post, canvas pseudo-3-D …)
│   ├── brief-template.md    the structured prompt every piece starts from
│   └── review.md            technical checks, review sheet, independent review, common problems, delivery checklist
├── scripts/
│   ├── setup.sh · check-env.mjs · scaffold.sh
│   ├── render.mjs           stills, sheets, three directions, poster, determinism, text framing, proxy, master
│   ├── audio.mjs            build · check · beats · samples · mux
│   ├── narration.mjs        tts · import · mix · check
│   ├── progress.mjs         Optional stage updates, image/audio artifacts and stable previews
│   ├── editor.mjs           default review workspace, track edits, saves and approved exports
│   ├── preview.mjs          lightweight audio playback, scrubbing, frame stepping and speed
│   ├── build-long.mjs       Persistent chapter cache, retry, assembly and acceptance
│   ├── inspect.mjs          qa · sheet · phone · strip · frames · motion · loop · grid · heat
│   ├── lib/                 synth, Tone.js renderer, FFT, browser, project, frame analysis, text hook
│   └── test/                regression tests (npm test)
└── assets/starter/          page, motion/timeline/narration helpers, preview controls, scores and build.sh
```

---

## Quick Start

[컬렉션 README](../../README.md#install)의 설치 방법에 따라 스킬을 설치한 뒤, 스킬 폴더에서 일회성 설정을 실행한다.

```bash
sh scripts/setup.sh        # Playwright + Chromium + Tone.js, then an environment check
```

요구사항: **Node 18+**와 `PATH`에 있는 **ffmpeg**. 설정 스크립트는 시스템 소프트웨어를 대신 설치하지 않는다.

그다음 이렇게 요청하면 된다.

```text
Make a 15-second motion piece for our launch. Go all out.
Make a logo sting for "Garden", swiss-editorial style.
Turn these three screenshots into a 20-second product teaser, with music.
A 6-second seamless generative loop, no sound.
```

에이전트는 먼저 완료된 요구사항을 확인한 뒤, `<slug>/` 프로젝트를 만들고 스타일 프레임을 보여 준다. 스타일을 승인받으면 씬과 소리를 만들고, 기본값으로 편집 워크스페이스를 연다. MP4 렌더링은 Export를 클릭하거나 채팅에서 현재 미리보기를 승인한 뒤에야 시작된다. 무음 작품과 루프도 같은 순서를 따르며, 여러 페이지로 된 영상은 챕터별로 미리본다. 위의 짧은 요청은 대화를 시작하는 것이며, 빠진 제작 선택지는 조용히 기본값으로 채우지 않고 질문한다. 나중에 다시 빌드하거나 수정하려면 다음을 쓴다.

```bash
node scripts/editor.mjs <slug> --size 1920x1080 --fps 30   # default: review in the workspace before Export
sh <slug>/build.sh                                   # approved rebuild; does not apply workspace audio edits
node scripts/preview.mjs <slug> --size 1920x1080 --fps 30   # lightweight debugging
node scripts/render.mjs <slug> --start 6 --duration 3 --out out/seg.mp4   # re-render one segment
node scripts/build-long.mjs <slug>/chapters.json       # persistent chapter rebuild
```

도구에 포함된 회귀 테스트는 `cd scripts && npm test`로 실행한다.
