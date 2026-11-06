# Motion Showreel Skill

**코드로 모션 그래픽 영상을 만듭니다. 몇 초짜리 로고 연출부터 최대 20분 분량의 챕터형 영상까지 지원하며, 배경 음악, 효과음, 사용자 내레이션, TTS를 포함하고 MP4와 편집 가능한 소스 코드를 제공합니다.**

[English](./README.md) · [모음집 홈으로](../../README.zh-CN.md)

![Motion Showreel Skill](../../dist/imgs/covers/motion-showreel.webp)

---

## 이 스킬은 무엇인가요?

`motion-showreel`은 아이디어를 그래픽, 텍스트 또는 인터페이스 애니메이션을 중심으로 한 완성된 영상(MP4 + 편집 가능한 소스 코드)으로 만듭니다. Agent가 먼저 요구 사항과 스타일을 확인한 다음, “화면은 시간만으로 결정되는” 웹페이지를 작성해 프레임별로 렌더링합니다. 영상과 사운드는 같은 타임라인을 사용합니다. 내레이션이 있으면 실제 음성의 리듬을 먼저 정하고 화면을 제작합니다.

다음 작업에 적합합니다.

- 모션 그래픽 쇼릴
- 제품 홍보 영상, 출시 티저(사용자가 제공한 사실과 스크린샷만 사용)
- UI 모션 시연: 형태 변형 체인, 마이크로 인터랙션
- 키네틱 타이포그래피, 인용문을 비트에 맞춰 표시
- 로고 연출, 오프닝, 채널 범퍼
- 생성형 아트 루프, 데이터 시각화의 클라이맥스
- 시대별 회고: 챕터마다 매체 전환(픽셀 → 벡터 → 3D…)

짧은 영상은 보통 5–60초이며, 최대 **20분** 분량의 챕터형 영상과 사용자의 원고 또는 녹음에 기반한 내레이션 설명 영상도 지원합니다. 클릭해 넘기는 프레젠테이션이나 글을 내레이션 대본으로 바꾸는 작업은 [`web-video-presentation`](../web-video-presentation)을, 웹페이지와 프로토타입은 [`web-design-engineer`](../web-design-engineer)를 사용합니다. 사실적인 인물을 생성하거나 실제 영상을 촬영하지 않으며 일반적인 영상 편집도 담당하지 않습니다.

시작하기 전에 다음을 정해야 합니다. **핵심 주제와 내용, 영상 길이, 가로형 또는 세로형, BGM 출처, 효과음 출처, 내레이션 방식**. BGM과 효과음은 각각 AI 생성, 사용자 제공, 끄기 중 선택할 수 있습니다. 내레이션은 없음, TTS, 사용자 녹음 중 선택합니다. **TTS를 사용할 때는 사용자가 대본을 제공해야 합니다.** 해당 서비스 API도 설정해야 합니다(Gemini, MiniMax, 사용자 지정 어댑터 지원). 기존 설정을 재사용할 수 있습니다. 지정한 길이와 실제 내레이션이 맞지 않으면 먼저 확인합니다. 자동으로 자르거나 속도를 바꾸거나 대본을 수정하지 않습니다.

참고 자료, 대상과 플랫폼, 스타일은 선택 사항입니다. 사용자가 구체적인 내용을 알려 주고 AI 생성을 원하면 그 정보를 바탕으로 제작합니다. 정보가 부족하면 자료를 요청하거나 조사합니다. 내레이션 대본에 포함된 정보는 영상에서 그대로 사용합니다. 사실과 브랜드 자료는 정확해야 합니다. 스타일이 정해지지 않았다면 서로 구별되는 방향 세 가지를 제안합니다.

---

## 작품 소개

아래 작품은 각각 짧은 요청 한 문장을 바탕으로 Agent가 이 Skill을 사용해 만들었습니다. 대부분 스타일만 알려 주고 “나머지는 알아서 정해 달라”고 했습니다. 미리보기는 4초, 12fps 클립이며 원본은 1920×1080, 30fps, 오디오 포함입니다.

<table>
<tr>
<td width="50%" valign="top"><img src="../../dist/imgs/motion-showreel/promo.webp" alt="Motion Showreel 홍보 영상: 박자마다 바뀌는 매체" width="100%"><br/><strong>Motion Showreel 홍보 영상</strong> · 80초<br/><sub>Skill 자체의 홍보 영상입니다. 오렌지 점 하나가 매 박자마다 다른 매체로 다시 그려집니다(수묵, 종이 오리기, 리소그래프, CRT, 콜라주, 유리, 점토…). 마지막에는 22개 스타일이 동시에 움직이는 벽으로 폭발합니다. 합성 음악의 악기도 매체 변화에 맞춰 바뀝니다.</sub></td>
<td width="50%" valign="top"><img src="../../dist/imgs/motion-showreel/afterglow.webp" alt="AFTERGLOW 신스웨이브 네온 오프닝" width="100%"><br/><strong>AFTERGLOW</strong> · 19초 · <code>synthwave-neon</code><br/><sub>가상 앨범의 오프닝입니다. 카메라가 지면 가까이에서 네온 문을 연이어 통과합니다. 마지막 문을 지난 뒤 반 박자 동안 화면이 검게 비고, 드롭에 맞춰 크롬 제목이 지평선에서 튀어 오릅니다.</sub></td>
</tr>
<tr>
<td width="50%" valign="top"><img src="../../dist/imgs/motion-showreel/boink.webp" alt="boink 말랑한 3D 연쇄 반응" width="100%"><br/><strong>boink</strong> · 18초 · <code>soft-3d-toy</code><br/><sub>원테이크 연쇄 반응입니다(혼다 광고 「Cog」 참고). 도미노 블록마다 마림바 음 하나를 배정합니다. 젤리가 바닥에 떨어진 뒤 압축 충격파가 온 세상을 휩쓸고, 처음 등장한 작은 공은 마지막에 i 글자의 점이 됩니다.</sub></td>
<td width="50%" valign="top"><img src="../../dist/imgs/motion-showreel/last-stroke.webp" alt="마지막 획: 수묵 선 스틱맨 게임 티저" width="100%"><br/><strong>마지막 획 LAST STROKE</strong> · 30초 · 사용자 지정 “수묵 선 스틱맨” 스타일<br/><sub>가상 미니 게임의 티저입니다. 사용자가 그린 획이 모두 현실이 됩니다. 주인공이 한 획으로 적 40명을 가로지른 뒤 영상에서 유일하게 한 박자 완전히 무음이 됩니다. 이어 모든 적이 먹점으로 폭발하고 그 획이 제목으로 바뀝니다.</sub></td>
</tr>
<tr>
<td width="50%" valign="top"><img src="../../dist/imgs/motion-showreel/umbra.webp" alt="UMBRA 본영: 개기일식 영화 오프닝" width="100%"><br/><strong>UMBRA 本影</strong> · 27초 · <code>cinematic-title</code><br/><sub>가상 개기일식 영화의 오프닝이며 화면비는 2.39:1입니다. 완전히 무음인 한 박자 뒤 마지막 베일리의 구슬이 다이아몬드 링으로 폭발하고, 달의 검은 원 안에서 제목이 드러납니다. 피아노는 Salamander 샘플(2단계)을 사용하고 1단계에서 합성한 예고편 효과음(boom, braam)을 겹칩니다.</sub></td>
<td width="50%" valign="top"><br/><strong>각 영상의 결과물</strong><br/><sub>
<code>out/final.mp4</code> + <code>out/poster.png</code><br/>
<code>brief.md</code>: 재사용 가능한 구조화 프롬프트<br/>
<code>index.html</code> / <code>timeline.js</code> / <code>score.mjs</code>: 편집 가능한 소스 코드<br/>
<code>sh build.sh</code>: 전체 재생성 또는 특정 구간만 재렌더링<br/>
<code>qa/</code>: 프레임 샘플, 휴대폰 크기 검사, 샷별 모션 보고서, 텍스트 프레임 마킹, 파형과 스펙트럼<br/>
기술 검사 결과(모두 PASS) + 사실에 기반한 검토 기록
</sub></td>
</tr>
</table>

---

## 핵심 원칙

- **화면 = 시간의 함수:** 페이지는 결정적인 `window.render(t)`를 노출합니다(`Math.random`, 타이머, rAF, CSS 애니메이션은 사용하지 않음). Playwright가 프레임별 스크린샷을 찍고 ffmpeg가 MP4를 조립합니다. 모션 블러(`--subframes`), 슈퍼샘플링(`--dpr`), 필름 그레인(`--grain`)은 페이지 안에 구현하지 않고 렌더링 옵션으로 설정합니다.
- **화면과 소리는 같은 타임라인을 공유:** 모든 컷 포인트, 임팩트, 효과음은 `timeline.js`에 적고 화면과 음악이 함께 참조합니다. 비트 동기화는 프레임 단위로 맞춥니다.
- **먼저 레퍼런스를 찾고 구조 세 가지를 구상:** 제작 전에 참고 작품 1–2개를 선택하고 무엇을 참고할지, 무엇은 따르지 않을지 기록한 다음 가능한 구조 세 가지를 만듭니다. 가장 먼저 떠오른 생각은 그 스타일의 상투적인 표현일 때가 많습니다. 레퍼런스 영상은 측정할 수 있습니다. `inspect.mjs grid`로 컷 지점과 비트 격자를 확인하고, `heat`로 각 구간에서 움직이는 부분을 확인합니다.
- **스타일 라이브러리는 출발점이지 선택지 목록이 아님:** 43개 스타일 각각에 바꾸지 않을 규칙(질감, 색상, 글꼴, 움직임, 카메라 문법, 사운드 팔레트, 기본 기법, 함정)을 정리했습니다. 스타일마다 식별 신호 8–12개도 두어 주제에 맞는 2–3개를 고르게 합니다. 그 스타일의 가장 진부한 버전도 함께 적어 신스웨이브를 골랐다고 매번 격자와 석양으로 끝나지 않게 합니다. 그대로 쓰거나, 수정하거나, 조합하거나 템플릿으로 직접 만들 수 있습니다.
- **사운드 방향도 먼저 정함:** brief에서 사운드는 화면만큼 중요합니다. 레퍼런스, 리듬, 화성, 악기 구성, 극적 흐름을 기록한 뒤 사운드의 “기본 성격” 목록을 만듭니다. 그래야 여러 영상이 같은 곡처럼 들리지 않습니다.
- **두 번 확인한 뒤 자율 제작:** 먼저 필수 정보를 모아 요구 사항을 확인하고, 다음에 스타일 프레임을 확인합니다. 스타일이 정해지지 않았다면 서로 구별되는 방향 세 가지를 제안합니다. “놀라게 해 줘”는 창의적 자유를 뜻할 뿐 제작 규격을 임의로 정해도 된다는 뜻은 아닙니다.
- **내레이션 우선:** TTS에는 사용자가 제공한 원고를 쓰거나 사용자의 녹음과 실제 구간 타임스탬프를 가져옵니다. 화면은 말의 흐름을 따르고 말하는 동안 BGM과 효과음은 낮춥니다. 긴 영상은 챕터별로 만들고 캐시를 유지해 실패 후 이어서 작업할 수 있게 합니다.
- **연속되는 화면 구성:** 스토리보드에 물체의 이전 / 이후 상태와 공간 연결을 기록하고 카메라가 문장 사이를 이어지게 합니다. 키워드 이벤트에는 실제 단어 타이밍이나 수동 앵커를 사용합니다. 오디오 미리보기는 드래그와 프레임 단위 확인을 지원합니다. 움직임이 바탕이 되는 방향은 스타일 프레임과 함께 연속 샘플로 확인합니다.
- **기술 검증과 미적 판단을 분리:** 크기, 프레임률, 길이, 프레임 수, 검은 프레임, loudness, true peak, 루프 이음새, 결정성은 프로그램으로 검사하며 모두 PASS해야 합니다. 검토를 막지 않도록 샷별 움직임(갑작스러운 점프와 단일 프레임 플래시 포함), 텍스트 프레임 검사(글자 잘림, 겹침, 안전 영역 침범, 글자 크기 부족) 자료도 함께 제공합니다. 검토 기록은 사용자가 더 빨리 볼 수 있게 도울 뿐 직접 확인을 대신하지 않습니다.
- **맡김 모드:** 사용자가 “전력을 다해”, “놀라게 해 줘”라고 하면 최소 기준과 기술 파이프라인만 지킵니다. 나머지 스타일, 구조, 기법은 모델이 판단합니다.

---

## 작업 흐름

```text
0  环境检查（一次）
1  需求确认 ─────────── 补齐必要信息、汇总要求 → 🛑 等你确认
2  brief.md ─────────── 对标 → 用途 + 风格 → 分镜 + 声音计划
3  风格帧 ───────────── 已定风格：3 张帧；未定风格：3 个方向各 1 张 → 🛑 等你确认
4  制作 ─────────────── 有口播先确定真实音频时间轴 → 逐镜头 → 自检 → 正片
5  配乐与混音 ───────── BGM / 音效独立来源；人声优先
6  验收 ─────────────── 技术检查（必须 PASS）+ 审片（交给用户终审）
7  交付
```


내레이션과 별도 트랙 믹싱은 [`references/narration.md`](./references/narration.md)를, 2분을 넘는 챕터 구성과 캐시 및 검토는 [`references/long-form.md`](./references/long-form.md)를 참고합니다. 기존 짧은 영상의 스타일, 두 단계 음악, 비트 동기화, 루프, 렌더링 옵션은 그대로 유지됩니다.

---

## 스타일 라이브러리

그래픽 및 타이포그래피, UI 및 제품, 레트로 및 화면, 3D 및 소재, 생성형 및 추상, 일러스트 및 만화, 수공예, 시네마틱의 8개 그룹에 43개 스타일이 있습니다. 아래는 코드로 렌더링한 스타일 샘플입니다. 마지막 세 개는 각각 4초, 20fps의 매끄러운 반복 애니메이션입니다.

<table>
<tr>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-ukiyo-e.webp" alt="ukiyo-e" /><br /><sub><code>ukiyo-e</code> 우키요에 목판화</sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-glass-material.webp" alt="glass-material" /><br /><sub><code>glass-material</code> 유리 및 금속 소재</sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-kinetic-brutalist.webp" alt="kinetic-brutalist" /><br /><sub><code>kinetic-brutalist</code> 브루탈리즘 키네틱 타이포그래피</sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-swiss-editorial.webp" alt="swiss-editorial" /><br /><sub><code>swiss-editorial</code> 스위스 편집 디자인</sub></td>
</tr>
<tr>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-ink-wash.webp" alt="ink-wash" /><br /><sub><code>ink-wash</code> 수묵화</sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-risograph-print.webp" alt="risograph-print" /><br /><sub><code>risograph-print</code> 리소그래프 인쇄</sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-editorial-collage.webp" alt="editorial-collage" /><br /><sub><code>editorial-collage</code> 편집 디자인 콜라주</sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-isometric-infographic.webp" alt="isometric-infographic" /><br /><sub><code>isometric-infographic</code> 등각 투영 인포그래픽</sub></td>
</tr>
<tr>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-liquid-shader.webp" alt="liquid-shader" /><br /><sub><code>liquid-shader</code> 액체 셰이더</sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-data-motion.webp" alt="data-motion" /><br /><sub><code>data-motion</code> 데이터 모션</sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-generative-geometry.webp" alt="generative-geometry" /><br /><sub><code>generative-geometry</code> 생성형 기하학</sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-pixel-game.webp" alt="pixel-game" /><br /><sub><code>pixel-game</code> 픽셀 게임</sub></td>
</tr>
<tr>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-synthwave-neon.webp" alt="synthwave-neon" /><br /><sub><code>synthwave-neon</code> 신스웨이브 네온</sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-paper-cut.webp" alt="paper-cut" /><br /><sub><code>paper-cut</code> 종이 오리기</sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-minimal-ui.webp" alt="minimal-ui" /><br /><sub><code>minimal-ui</code> 미니멀 UI</sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-comic-pop.webp" alt="comic-pop" /><br /><sub><code>comic-pop</code> 만화 패널</sub></td>
</tr>
<tr>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-flat-vector.webp" alt="flat-vector" /><br /><sub><code>flat-vector</code> 플랫 벡터 일러스트</sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-guochao.webp" alt="guochao" /><br /><sub><code>guochao</code> 궈차오 문양</sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-painterly.webp" alt="painterly" /><br /><sub><code>painterly</code> 회화적 붓 터치</sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-glitch-digital.webp" alt="glitch-digital" /><br /><sub><code>glitch-digital</code> 디지털 글리치</sub></td>
</tr>
<tr>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-soft-organic.webp" alt="soft-organic" /><br /><sub><code>soft-organic</code> 부드러운 유기체</sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-hologram-hud.webp" alt="hologram-hud" /><br /><sub><code>hologram-hud</code> 홀로그램 공간 UI</sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-particle-field.webp" alt="particle-field" /><br /><sub><code>particle-field</code> 입자장</sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-art-deco.webp" alt="art-deco" /><br /><sub><code>art-deco</code> 아르데코</sub></td>
</tr>
</table>

<sub>그 밖의 스타일: <code>dark-keynote</code> · <code>soft-3d-toy</code> · <code>crt-vhs</code> · <code>terminal-ascii</code> · <code>crayon-storybook</code> · <code>copperplate-engraving</code> · <code>cinematic-title</code> · <code>mixed-media-era</code>. 전체 목록, 세 가지 방향 규칙, 혼합 방법은 <a href="./references/styles/INDEX.md"><code>references/styles/INDEX.md</code></a>를 참고하세요.</sub>

다른 스타일 규칙: [아르데코](./references/styles/art-deco.md), [원라인 드로잉](./references/styles/one-line.md), [청사진](./references/styles/blueprint.md), [홀로그램 HUD](./references/styles/hologram-hud.md), [스테인드글라스](./references/styles/stained-glass.md), [틸트 시프트 미니어처](./references/styles/tilt-shift-miniature.md), [픽셀 디오라마](./references/styles/pixel-diorama.md), [80년대 셀 애니메이션](./references/styles/cel-anime-80s.md), [러버 호스 애니메이션](./references/styles/rubber-hose.md), [그림자 인형극](./references/styles/shadow-puppet.md). 같은 템플릿을 사용해 소재, 모션 규칙, 선택 가능한 기술 방향을 정의합니다.

이 외에도 [화이트보드 해설](./references/styles/whiteboard-explainer.md), [수학 / 콘셉트 모핑](./references/styles/concept-morph.md), [채색 필사본](./references/styles/illuminated-manuscript.md)을 선택할 수 있습니다.

---

## 사운드

| 단계 | 엔진 | 적합한 경우 |
| --- | --- | --- |
| 1단계 · 내장 합성(기본값) | `score.mjs`, 의존성 없이 결정적으로 실행: 드럼과 핸드 퍼커션, 베이스, 패드, 플럭, 타악기(마림바 / 글로켄슈필 / 칼림바 / 스틸팬), 오르간, 보컬 패드, FM 차임, 앰비언트 바닥음(테이프, 바이닐, 바람, 비), swing / 스텝 리듬, 사이드체인, bitcrush, 테이프 워블 | 전자 음악, UI, 레트로, 추상, 수공예, lo-fi |
| 2단계 · Tone.js | `score.tone.js`, headless Chromium에서 오프라인 렌더링: 샘플 악기(Salamander 피아노, CC BY), 컨볼루션 리버브, 코러스 / 페이저 / 디스토션 | 시네마틱, 고급 제품, 실제 악기와 공간감이 필요한 영상 |
| 사용자 음악 | `audio.mjs beats`로 BPM, 박자, 강박, 드롭을 분석(가능하면 librosa 사용)한 뒤 효과음을 더함 | 사용자가 이미 음악을 제공한 경우 |

두 단계의 사운드를 겹쳐 쓸 수 있습니다. 아래에는 Tone.js 음악을 깔고, 위에는 합성 효과음을 얹은 다음 전체를 마스터링합니다. 모든 믹스는 −14 LUFS / −1 dBTP로 맞춥니다. 모델은 오디오를 들을 수 없으므로 `audio.mjs check`가 loudness, 주파수 균형, 무음 구간을 출력하고 선언한 각 드롭 전에 “숨 고르기”가 있는지 측정합니다. 파형과 스펙트럼도 모델이 볼 수 있게 그립니다.

---

## 디렉터리 구조

```text
skills/motion-showreel/
├── SKILL.md                 工作流 + 底线 + 工具速查
├── README.md / README.zh-CN.md
├── manifest.json
├── references/
│   ├── formats.md           用途（含口播讲解与分章长片）
│   ├── styles/              INDEX.md + _template.md + 40 个风格文件
│   ├── craft.md             节奏、运动、转场、镜头、排版、配色、质感、签名时刻、默认味清单
│   ├── sound.md             声音方向、合成 API、Tone.js、戏剧曲线、律动 / 和声词汇、混音、声音默认味
│   ├── narration.md         用户原稿 TTS、录音时间戳、关键词事件与人声优先混音
│   ├── long-form.md         最长 20 分钟、章节清单、缓存和断点重建
│   ├── stack.md             页面契约、确定性、各技术的坑、字体、多画幅、性能
│   ├── recipes.md           现成写法（遮罩逐字、形变链、粒子组字、无缝循环、WebGL 后期、Canvas 伪 3D……）
│   ├── brief-template.md    每支片子的结构化提示词模板
│   └── review.md            技术检查、审片表、独立审片、常见问题、交付清单
├── scripts/
│   ├── setup.sh · check-env.mjs · scaffold.sh
│   ├── render.mjs           静帧、拼图、三方向、封面、确定性、文字框景、小样、正片
│   ├── audio.mjs            build · check · beats · samples · mux
│   ├── narration.mjs        tts · import · mix · check
│   ├── preview.mjs          带声音播放、拖动、逐帧与预览倍速
│   ├── build-long.mjs       持久章节缓存、失败重试、拼接与验收
│   ├── inspect.mjs          qa · sheet · phone · strip · frames · motion · loop · grid · heat
│   ├── lib/                 合成器、Tone.js 渲染、FFT、浏览器、项目工具、帧分析、文字钩子
│   └── test/                回归测试（npm test）
└── assets/starter/          页面、motion/timeline/narration 工具、预览控件、配乐与 build.sh
```


---

## 빠른 시작

먼저 Skill을 설치합니다([모음집 홈](../../README.zh-CN.md#安装) 참고). 그다음 Skill 디렉터리에서 초기 설정을 한 번 실행합니다.

```bash
sh scripts/setup.sh        # 安装 Playwright + Chromium + Tone.js，再做环境检查
```


필수 항목은 **Node 18+**와 `PATH`에 등록된 **ffmpeg**입니다. 초기화 스크립트는 시스템 소프트웨어를 대신 설치하지 않습니다.

그다음 다음과 같이 요청하면 됩니다.

```text
给我们的发布会做一支 15 秒的动效视频，全力以赴。
给「Garden」做一个 Logo 动画，瑞士编辑风。
用这三张截图做一支 20 秒的产品宣传短片，要配乐。
做一个 6 秒的无缝循环生成艺术，不要声音。
```


Agent가 누락된 필수 정보를 질문하고 확인을 기다린 뒤 `<slug>/`를 만들고 스타일 프레임을 보여 줍니다. 두 번째 확인 뒤 제작, 음악, 검사, 납품을 자율적으로 진행합니다. 짧은 요청으로 시작할 수는 있지만 영상 길이, 화면 비율, BGM / 효과음 출처, 내레이션 방식이 빠져 있으면 기본값으로 조용히 채우지 않습니다. 나중에 다시 빌드하거나 조정하려면 다음 명령을 사용합니다.

```bash
sh <slug>/build.sh                                   # 按 build.sh 顶部的规格整片重建
node scripts/preview.mjs <slug> --size 1920x1080 --fps 30   # 随音频预览
node scripts/render.mjs <slug> --start 6 --duration 3 --out out/seg.mp4   # 只重渲一段
node scripts/build-long.mjs <slug>/chapters.json       # 长片按章构建，再次运行复用有效缓存
```


회귀 테스트도 포함되어 있습니다: `cd scripts && npm test`.
