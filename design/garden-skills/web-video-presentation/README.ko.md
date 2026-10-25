# Web Video Presentation Skill

**글이나 내레이션 원고를 클릭으로 진행되는 16:9 웹 프레젠테이션으로 바꾸고 화면 녹화로 영화 같은 영상을 만들도록 돕는 에이전트 Skill입니다.**

[영어 문서](./README.md) · [컬렉션 홈으로 돌아가기](../../README.zh-CN.md)

![Web Video Presentation Skill](../../dist/imgs/covers/web-video-presentation.webp)

---

## 이 Skill은 무엇인가요?

`web-video-presentation`은 에이전트가 일반 슬라이드 덱이 아니라 영상 제작 화면처럼 동작하는 Vite + React + TypeScript 프레젠테이션을 만들도록 돕습니다. 클릭할 때마다 내레이션의 한 박자가 진행되고 각 단계가 1920×1080 무대 전체를 사용하며, 진행 UI는 마우스를 올릴 때만 나타나 화면 녹화 결과를 깔끔하게 유지합니다.

적합한 작업:

- 글을 Bilibili / YouTube / 영상 채널 스타일의 내레이션 원고로 각색
- 기존 내레이션 원고를 리듬감 있는 웹 프레젠테이션으로 변환
- 제품 데모, 튜토리얼, 키노트 스타일 설명 영상, 시각적 토크
- 움직임과 리듬이 강한 “동적 PPT지만 PPT처럼 보이지 않는” 경험
- 시각 outline을 승인한 뒤 선택적으로 내레이션 오디오 합성

이 Skill은 주로 **방법론과 협업 워크플로**를 제공합니다. 스캐폴드는 토큰, 무대 기본 요소, 테마, 예제를 제공하지만 각 프로젝트는 주제에 맞는 시각 언어를 선택해야 합니다.

---

## 핵심 아이디어

- **고정된 16:9 무대**: 콘텐츠는 안정된 1920×1080 좌표계에서 작성하고 뷰포트에 맞춰 스케일합니다.
- **전역 step 커서 하나**: 클릭이나 키보드 입력으로 (chapter, step)을 진행하며 커서는 로컬에 저장됩니다.
- **한 단계에 아이디어 하나**: 글머리표를 계속 쌓지 않고 각 박자를 집중된 전체 화면 장면으로 만듭니다.
- **원고 박자가 구조를 결정**: 내레이션 리듬을 시각 단계에 직접 대응합니다.
- **숨겨진 chrome**: 진행 컨트롤은 hover 때만 나타나 녹화 결과를 깔끔하게 합니다.
- **움직임 우선**: 각 장면에는 움직이는 시각 기준점이 있어야 합니다. 정적인 문단은 나쁜 신호입니다.
- **테마 토큰**: 시각 결정은 의미 기반 토큰을 통과하므로 테마 변경이 전체 분위기를 바꿉니다.
- **교체 가능한 TTS**: provider에 독립적인 오디오 실행기에 기본 provider 두 개 (MiniMax mmx-cli + curl 기반 OpenAI TTS)가 포함됩니다. tts-providers/에 .sh 파일 하나를 추가하면 ElevenLabs / edge-tts / Azure / Google Cloud / macOS say / 자체 호스팅 TTS로 바꿀 수 있습니다.
- **필수 체크포인트**: 원고 / 테마 조정 후, outline 승인 후, 선택 오디오 합성 전에 멈춥니다.

---

## 워크플로

```text
Phase 1.1  사용자 입력 파악
Phase 1.2  글 -> 내레이션 원고
   |
Checkpoint A1  원고, 테마, 대략적인 에셋 계획
   |
Phase 1.3  원고 + 원문 -> outline.md
   |
Checkpoint A2  outline 승인 + 개발 방식 선택
   |
Phase 2    Vite / React / TS 프레젠테이션 제작
   |
Checkpoint B   오디오 합성 여부 확인
   |
Phase 3    선택적 오디오 합성
Phase 4    녹화 및 후반 작업
```

체크포인트는 Skill 계약의 일부입니다. 에이전트가 원문을 받아 완성 코드까지 아무 확인 없이 서두르면 안 됩니다. 테마 선택은 모션 디자인에 영향을 주며 outline 승인은 장별 리듬이 어긋나지 않게 합니다.

---

## 포함 내용

```text
skills/web-video-presentation/
├── SKILL.md
├── README.md / README.zh-CN.md
├── references/
│   ├── PRINCIPLES.md
│   ├── CHAPTER-CRAFT.md
│   ├── OUTLINE-FORMAT.md
│   ├── SCRIPT-STYLE.md
│   ├── THEMES.md
│   ├── AUDIO.md
│   └── RECORDING.md
├── scripts/
│   └── scaffold.sh
├── templates/
│   ├── index.html
│   ├── vite.config.ts
│   ├── scripts/
│   │   ├── extract-narrations.ts
│   │   ├── synthesize-audio.sh       # provider 불문 실행기
│   │   └── tts-providers/            # 파일 하나당 TTS 백엔드 하나
│   │       ├── README.md             # 세 함수 계약 + ElevenLabs / edge-tts / Azure / Google / say 예시
│   │       ├── minimax.sh            # 기본 provider (mmx-cli)
│   │       └── openai.sh             # 내장: OpenAI TTS (curl + OPENAI_API_KEY)
│   └── src/
└── themes/                    # 각자 디자인 시그니처가 있는 테마 23개
    ├── midnight-press/
    ├── warm-keynote/
    ├── newsroom/
    ├── bauhaus-bold/
    └── ...                     # 전체 목록은 references/THEMES.md
```

---

## 빠른 시작

에이전트가 스캔하는 디렉터리에 Skill을 복사한 뒤 글이나 내레이션 원고를 웹 영상 프레젠테이션으로 만들도록 요청합니다.

프로젝트 안에서 직접 스캐폴드를 만들려면:

```bash
bash skills/web-video-presentation/scripts/scaffold.sh ./presentation --theme=paper-press
```

사용 가능한 테마 목록:

```bash
bash skills/web-video-presentation/scripts/scaffold.sh --list-themes
```

생성된 presentation/은 일반 Vite + React + TypeScript 앱입니다. 다른 Vite 앱처럼 실행한 다음 화면 녹화 도구로 16:9 무대를 녹화합니다.

---

## 테마 갤러리

Skill에는 고유한 디자인 DNA를 가진 **테마 23개**가 포함되며 단순히 색상만 바꾼 것은 아닙니다. 캔버스의 명암별로 갤러리를 살펴보고 주제에 맞는 테마를 고르거나 원하는 타일을 새 테마의 출발점으로 사용할 수 있습니다. 미리보기를 클릭하면 1920×1080 전체 프레임을 엽니다.

> 모든 스크린샷은 실제 16:9 무대이며 라이브 데모 갤러리 [demo/web-video-presentation-demo](../../demo/web-video-presentation-demo/)에서 가져왔습니다.

### 어두운 테마 · 8개

> 집중, 극적 효과, 강한 대비의 스토리텔링에 적합한 시네마틱 다크 캔버스.

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/midnight-press.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/midnight-press.webp" alt="midnight-press 미리보기" /></a>
<br /><strong><code>midnight-press</code> · 미드나이트 프레스</strong>
<br /><sub>시네마틱 에디토리얼 다크 · 따뜻한 에스프레소색 바탕 + 강렬한 오렌지</sub>
<br /><sub><b>적합한 용도</b> · 개발자 튜토리얼 · AI / 도구 리뷰 · 기술 심층 설명</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/dark-botanical.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/dark-botanical.webp" alt="dark-botanical 미리보기" /></a>
<br /><strong><code>dark-botanical</code> · 다크 보태니컬</strong>
<br /><sub>프리미엄 에디토리얼 다크 · 테라코타 / 블러시 / 금빛 레이어</sub>
<br /><sub><b>적합한 용도</b> · 브랜드 스토리 · 패션 / 뷰티 · 고급 제품 출시</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/chalk-garden.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/chalk-garden.webp" alt="chalk-garden 미리보기" /></a>
<br /><strong><code>chalk-garden</code> · 분필 정원</strong>
<br /><sub>짙은 슬레이트 칠판 · 손글씨 Patrick Hand + 분필 노랑</sub>
<br /><sub><b>적합한 용도</b> · 설명 영상 · 교실 수업 · 초보자용 친근한 안내</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/blueprint.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/blueprint.webp" alt="blueprint 미리보기" /></a>
<br /><strong><code>blueprint</code> · 블루프린트</strong>
<br /><sub>제도판 · 짙은 네이비 + 제도 시안 + 60px 격자</sub>
<br /><sub><b>적합한 용도</b> · 기술 아키텍처 · 시스템 분석 · API / SDK 소개</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/terminal-green.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/terminal-green.webp" alt="terminal-green 미리보기" /></a>
<br /><strong><code>terminal-green</code> · 터미널 그린</strong>
<br /><sub>80년대 형광체 CRT · 모노스페이스 전용 + 스캔라인</sub>
<br /><sub><b>적합한 용도</b> · CLI 튜토리얼 · 해커 / 보안 주제 · 레트로 기술 오마주</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/neon-cyber.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/neon-cyber.webp" alt="neon-cyber 미리보기" /></a>
<br /><strong><code>neon-cyber</code> · 네온 사이버</strong>
<br /><sub>사이버펑크 미래 · 전기 시안 + 마젠타 이중 네온</sub>
<br /><sub><b>적합한 용도</b> · AI / 대형 언어 모델 리뷰 · web3 / 보안 · 미래주의 / 사이버펑크 주제</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/bold-signal.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/bold-signal.webp" alt="bold-signal 미리보기" /></a>
<br /><strong><code>bold-signal</code> · 볼드 시그널</strong>
<br /><sub>피치 덱 히어로 · 어두운 그라데이션 + 주황 초점 카드</sub>
<br /><sub><b>적합한 용도</b> · 피치 덱 / 투자 발표 · 제품 출시 · 브랜드 키노트 오프닝</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/creative-voltage.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/creative-voltage.webp" alt="creative-voltage 미리보기" /></a>
<br /><strong><code>creative-voltage</code> · 크리에이티브 볼티지</strong>
<br /><sub>채도 높은 전기 파랑 + 네온 노랑 하프톤</sub>
<br /><sub><b>적합한 용도</b> · 디자인 위크 · 스튜디오 쇼케이스 · 타이포그래피 / 시각 문화 발표</sub>
</td>
</tr>
</table>

### 밝은 테마 · 15개

> 명확함, 절제, 인쇄 종이의 따뜻함을 위한 밝은 에디토리얼 캔버스.

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/paper-press.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/paper-press.webp" alt="paper-press 미리보기" /></a>
<br /><strong><code>paper-press</code> · 페이퍼 프레스</strong>
<br /><sub>에디토리얼 종이 · 따뜻한 크림 + 강렬한 오렌지</sub>
<br /><sub><b>적합한 용도</b> · 매거진 콘텐츠 · 라이프스타일 · 일상 도구 리뷰</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/newsroom.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/newsroom.webp" alt="newsroom 미리보기" /></a>
<br /><strong><code>newsroom</code> · 뉴스룸</strong>
<br /><sub>NYT 대형 신문 · 신문용지 크림 + 머리기사 빨강</sub>
<br /><sub><b>적합한 용도</b> · 다큐멘터리 취재 · 심층 리뷰 · 시사 해설</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/monochrome-print.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/monochrome-print.webp" alt="monochrome-print 미리보기" /></a>
<br /><strong><code>monochrome-print</code> · 모노크롬 프린트</strong>
<br /><sub>세련되고 절제된 Monocle / Wallpaper 스타일</sub>
<br /><sub><b>적합한 용도</b> · 긴 글 각색 · 학술 / 사상 · 문화예술 비평</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/vintage-editorial.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/vintage-editorial.webp" alt="vintage-editorial 미리보기" /></a>
<br /><strong><code>vintage-editorial</code> · 빈티지 에디토리얼</strong>
<br /><sub>재치 있는 Fraunces + 기하학 오버레이 (원 / 선 / 점)</sub>
<br /><sub><b>적합한 용도</b> · 개인 에세이 / 논평 · 문화 산문 · 디자인 / 글꼴 이야기</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/sunset-zine.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/sunset-zine.webp" alt="sunset-zine 미리보기" /></a>
<br /><strong><code>sunset-zine</code> · 선셋 진</strong>
<br /><sub>리소그래프 콜라주 · 따뜻한 피치 + 마젠타 + 점선 오림 표시</sub>
<br /><sub><b>적합한 용도</b> · 라이프스타일 브이로그 · 창작 공유 · Xiaohongshu / Douyin 스타일</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/pastel-dream.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/pastel-dream.webp" alt="pastel-dream 미리보기" /></a>
<br /><strong><code>pastel-dream</code> · 파스텔 드림</strong>
<br /><sub>부드러운 파스텔 + 세이지 + 오른쪽 알약형 리본</sub>
<br /><sub><b>적합한 용도</b> · 제품 온보딩 · 친근한 튜토리얼 · 웰니스 및 육아</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/warm-keynote.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/warm-keynote.webp" alt="warm-keynote 미리보기" /></a>
<br /><strong><code>warm-keynote</code> · 웜 키노트</strong>
<br /><sub>현대 SaaS 키노트 · 유리 패널 + 청록 + 따뜻한 격자</sub>
<br /><sub><b>적합한 용도</b> · SaaS 키노트 · B2B 출시 · 팀 대상 보고</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/electric-studio.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/electric-studio.webp" alt="electric-studio 미리보기" /></a>
<br /><strong><code>electric-studio</code> · 일렉트릭 스튜디오</strong>
<br /><sub>기업형 명료함 · 선명한 흰색 + 바닥 전기 파랑 띠</sub>
<br /><sub><b>적합한 용도</b> · B2B 제품 발표 · 투자자 덱 · 분기 업데이트</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/bauhaus-bold.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/bauhaus-bold.webp" alt="bauhaus-bold 미리보기" /></a>
<br /><strong><code>bauhaus-bold</code> · 바우하우스 볼드</strong>
<br /><sub>선언형 모더니즘 · 반경 0 + 4px 두께 프레임</sub>
<br /><sub><b>적합한 용도</b> · 제품 출시 · 선언문 · 브랜드 메시지</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/swiss-ikb.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/swiss-ikb.webp" alt="swiss-ikb 미리보기" /></a>
<br /><strong><code>swiss-ikb</code> · 스위스 클라인 블루</strong>
<br /><sub>초경량 굵기 200 Helvetica + IKB + 1px 헤어라인 격자</sub>
<br /><sub><b>적합한 용도</b> · AI / 기술 출시 · 연간 데이터 보고 · 인포그래픽</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/dune.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/dune.webp" alt="dune 미리보기" /></a>
<br /><strong><code>dune</code> · 듄</strong>
<br /><sub>차콜 + 모래색 · 강조색 거의 없음 (건축 브로슈어)</sub>
<br /><sub><b>적합한 용도</b> · 건축 / 인테리어 · 미술 전시 · 고급 브랜드북</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/indigo-porcelain.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/indigo-porcelain.webp" alt="indigo-porcelain 미리보기" /></a>
<br /><strong><code>indigo-porcelain</code> · 인디고 포슬린</strong>
<br /><sub>인디고가 잉크색 (강조색 아님) + 도자기 흰색</sub>
<br /><sub><b>적합한 용도</b> · 학술 연구 · AI / 데이터 심층 분석 · 진중한 기술 브리핑</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/forest-ink.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/forest-ink.webp" alt="forest-ink 미리보기" /></a>
<br /><strong><code>forest-ink</code> · 포레스트 잉크</strong>
<br /><sub>숲 녹색이 잉크색 + 아이보리 (구판 National Geographic 스타일)</sub>
<br /><sub><b>적합한 용도</b> · 자연 / 지속 가능성 · 다큐멘터리 논픽션 · 슬로 라이프</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/kraft-paper.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/kraft-paper.webp" alt="kraft-paper 미리보기" /></a>
<br /><strong><code>kraft-paper</code> · 크라프트 페이퍼</strong>
<br /><sub>짙은 갈색 잉크 + 크라프트 베이지 + 구리색 강조</sub>
<br /><sub><b>적합한 용도</b> · 서평 · 역사와 향수 · 공예 및 음식 이야기</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/split-canvas.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/split-canvas.webp" alt="split-canvas 미리보기" /></a>
<br /><strong><code>split-canvas</code> · 스플릿 캔버스</strong>
<br /><sub>투톤 · 왼쪽 피치 + 오른쪽 라벤더</sub>
<br /><sub><b>적합한 용도</b> · A/B 비교 · 대화형 이야기 · 개념 대비 설명</sub>
</td>
<td align="center" width="50%" valign="middle">
<br />
<strong>+ 직접 파생 테마 만들기</strong>
<br /><sub>토큰 계약, 테마 시그니처, 스위스 스타일 노랑 / 초록 / 오렌지 변형은<br /><a href="./references/THEMES.md">THEMES.md</a>를 참고하세요.</sub>
<br /><br />
</td>
</tr>
</table>

---

## 참고 자료 안내

- [PRINCIPLES.md](./references/PRINCIPLES.md) — 영상 같은 웹 프레젠테이션의 핵심 규칙
- [CHAPTER-CRAFT.md](./references/CHAPTER-CRAFT.md) — 장 구현 규칙과 시각 체크리스트
- [OUTLINE-FORMAT.md](./references/OUTLINE-FORMAT.md) — 필수 outline 구조
- [SCRIPT-STYLE.md](./references/SCRIPT-STYLE.md) — 글을 내레이션 원고로 바꾸는 지침
- [PATTERNS.md](./references/PATTERNS.md) — 선택적인 시각 프리미티브 레시피
- [AUDIO.md](./references/AUDIO.md) — 선택적 내레이션 합성 워크플로 (provider 불문)
- [tts-providers/README.md](./templates/scripts/tts-providers/README.md) — TTS provider 계약 + 기본 2종 (minimax / openai) + ElevenLabs / edge-tts / Azure / Google Cloud / macOS say 코드 조각
- [RECORDING.md](./references/RECORDING.md) — 화면 녹화와 후반 작업 참고

---
