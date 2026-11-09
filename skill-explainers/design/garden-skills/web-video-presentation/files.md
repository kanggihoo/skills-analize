# web-video-presentation 읽은 파일 목록

대상: `design/garden-skills/web-video-presentation` (커밋 `4e3fc89`, `manifest.json` 기준 v1.2.2). `SKILL.md`는 중국어 본문이고 그것이 원본이다. 원본 텍스트 94개(합계 337,456B) 중 41개(206,600B)는 끝까지 읽었고, 53개(130,856B)는 구조·표본만 확인했다(전부 읽지 않음). 번역본 15개(204,042B)는 열지 않았다. 바이너리는 이 폴더에 없다.

스크립트(`scaffold.sh`, `synthesize-audio.sh`, `extract-narrations.ts`, TTS provider 2개)는 읽기만 했고 실행하지 않았다. 오디오 합성 provider는 호출하지 않았다.

## 끝까지 읽은 텍스트 파일 41개

| # | 바이트 | 경로 | 역할 |
|---|---|---|---|
| 1 | 23239 | `SKILL.md` | 스킬 본문(중국어 원본). frontmatter, 작업 흐름, 자체 검사 규약, Checkpoint Plan, Phase 2~4, 열 가지 원칙 |
| 2 | 17939 | `README.md` | 영어 안내. 작업 흐름(옛 Checkpoint A1/A2/B 표기), 파일 구성, 테마 갤러리, 참조 지도 |
| 3 | 629 | `manifest.json` | 이름, 버전 1.2.2, 호환 호스트 6개 |
| 4 | 11126 | `references/AUDIO.md` | 오디오 합성 흐름, 내장 provider 2개, 대체 경로, 런타임 모드, 문제 해결 |
| 5 | 10676 | `references/CHAPTER-CRAFT.md` | 장 제작 지침과 완료 자체 검사 목록 |
| 6 | 8523 | `references/OUTLINE-FORMAT.md` | `outline.md` 형식, 정보 풀, 장 나누기 경험칙, 자체 검사 |
| 7 | 2988 | `references/RECORDING.md` | Auto 모드 한 번에 녹화, 수동 녹화, 모드 표 |
| 8 | 17950 | `references/SCRIPT-STYLE.md` | 글 → 구어 원고 규칙: 정보 보존 60%, 8원칙, AI 티 다섯 유형, 플랫폼 변형, 3층 자체 검사 |
| 9 | 23359 | `references/THEMES.md` | 테마 23개, token 계약, 새 테마 만들기, 반패턴 |
| 10 | 5155 | `references/EXAMPLES/README.md` | 예제는 구조 참고이고 베끼는 틀이 아니라는 안내 |
| 11 | 2917 | `references/EXAMPLES/case-tech-review/README.md` | 테크 리뷰 사례. 애니메이션 기술은 옛 판이라고 명시 |
| 12 | 6516 | `references/EXAMPLES/case-tech-review/outline-snippet.md` | 옛 형식 outline 앞 2장 발췌 |
| 13 | 3863 | `references/EXAMPLES/hook-chapter/README.md` | 훅형 도입 장 구조 |
| 14 | 4529 | `references/EXAMPLES/hook-chapter/chapter.tsx` | 훅형 장 예제 코드 |
| 15 | 3660 | `references/EXAMPLES/list-reveal/README.md` | 열거형 장 구조 |
| 16 | 3549 | `references/EXAMPLES/list-reveal/chapter.tsx` | 열거형 장 예제 코드 |
| 17 | 9537 | `scripts/scaffold.sh` | Vite + React + TS 골격 생성 스크립트 |
| 18 | 302 | `templates/index.html` | 진입 HTML |
| 19 | 196 | `templates/vite.config.ts` | dev server 포트 5174 |
| 20 | 4717 | `templates/scripts/extract-narrations.ts` | `narrations.ts` → `audio-segments.json` |
| 21 | 5119 | `templates/scripts/synthesize-audio.sh` | provider 무관 TTS runner |
| 22 | 1771 | `templates/scripts/tts-providers/minimax.sh` | 기본 provider(`mmx` CLI) |
| 23 | 2636 | `templates/scripts/tts-providers/openai.sh` | OpenAI TTS provider(curl) |
| 24 | 2487 | `templates/src/App.tsx` | 무대, 진행 바, 모드, 오디오 연결 |
| 25 | 209 | `templates/src/main.tsx` | React 진입점 |
| 26 | 833 | `templates/src/registry/chapters.ts` | 장 등록 |
| 27 | 704 | `templates/src/registry/types.ts` | `ChapterDef`, `Narration` 타입 |
| 28 | 3768 | `templates/src/hooks/useAudioPlayer.ts` | step별 오디오 재생과 자동 진행 |
| 29 | 2473 | `templates/src/hooks/useAutoMode.ts` | manual / audio / auto 모드와 `M`·`Space` 키 |
| 30 | 843 | `templates/src/hooks/useStageScale.ts` | 1920×1080 무대 축척 |
| 31 | 5192 | `templates/src/hooks/useStepper.ts` | 전역 step 커서, `STORAGE_KEY`, 키보드 |
| 32 | 1507 | `templates/src/components/Stage.tsx` | 16:9 무대와 클릭 진행 |
| 33 | 797 | `templates/src/components/MaskReveal.tsx` | clip-path 글자 드러내기 |
| 34 | 1014 | `templates/src/components/AutoStartGate.tsx` | Auto 시작 오버레이 |
| 35 | 898 | `templates/src/components/AutoToggle.tsx` | 숨은 모드 전환 버튼 |
| 36 | 3837 | `templates/src/components/ProgressBar.tsx` | 숨은 진행 바와 GitHub 링크 |
| 37 | 1209 | `templates/src/components/AutoStartGate.css` | 오버레이 스타일 |
| 38 | 3878 | `templates/src/chapters/01-example/Example.tsx` | 예제 장(masthead 포함) |
| 39 | 1280 | `templates/src/chapters/01-example/narrations.ts` | 예제 장 narration 3개 |
| 40 | 2320 | `templates/src/styles/animations.css` | 공용 애니메이션 어휘 |
| 41 | 2455 | `themes/midnight-press/tokens.css` | 기본 테마 token(표본으로 끝까지 읽음) |

합계: 41개, 206,600B.

## 구조·표본만 확인한 파일 53개(전부 읽지 않음)

| 종류 | 개수 | 바이트 | 확인한 범위 |
|---|---|---|---|
| `templates/scripts/tts-providers/README.md` | 1 | 11950 | 1~120줄(사용법, 내장 provider, 세 함수 계약)과 290~324줄(설계 요점, 디버깅)을 읽었다. ElevenLabs, edge-tts, macOS `say`, Azure, Google Cloud 코드 조각은 제목과 주석만 봤다 |
| 템플릿 CSS 5개 | 5 | 22,953 | `base.css`(15271B)는 선택자와 `--t-*`·`--space-*` 값만, `fonts.css`(2129B)는 앞 20줄, `ProgressBar.css`(2501B)는 앞 25줄, `AutoToggle.css`(1062B)는 앞부분, `Example.css`(1990B)는 하드코딩 색·글꼴 grep만 |
| 예제 장 CSS 2개 | 2 | 8,390 | `hook-chapter/chapter.css`(4882B) 앞 40줄과 `@keyframes`·hex grep, `list-reveal/chapter.css`(3508B) 같은 grep |
| `themes/*/theme.json` | 23 | 19,230 | 각 파일의 `id`, `nameZh`, `mood`, `bestFor` 필드만 뽑아 봤다 |
| `themes/*/tokens.css`(midnight-press 제외) | 22 | 68,333 | 필수 token 16개(`--shell`~`--font-mono`)가 모두 정의돼 있는지 grep으로만 확인했다. 23개 모두 16개를 정의한다 |

합계: 53개, 130,856B.

## 열지 않은 번역본 15개

같은 폴더에 원본이 있는 다른 언어판이다. 합계 204,042B.

| 종류 | 개수 | 경로 |
|---|---|---|
| 한국어 번역(`*.ko.md`) | 14 | `SKILL.ko.md`, `README.ko.md`, `references/*.ko.md` 6개, `references/EXAMPLES/**/*.ko.md` 5개, `templates/scripts/tts-providers/README.ko.md` |
| 중국어 README(`README.zh-CN.md`) | 1 | 영어 `README.md`가 같은 폴더에 있어 번역본으로 본다. `SKILL.md`가 중국어 원본이라는 점과는 별개다 |

## 제외한 바이너리

없음. README가 가리키는 커버 이미지(`../../dist/imgs/covers/web-video-presentation.webp`), 갤러리 이미지(jsDelivr URL), 데모 폴더(`demo/web-video-presentation-demo`)는 이 저장소에 없거나 스킬 폴더 밖이라 보지 않았다.
