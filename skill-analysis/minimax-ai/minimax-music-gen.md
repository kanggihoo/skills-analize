# minimax-music-gen 분석

## 원본

- 경로: `.agents/skills/minimax-music-gen/SKILL.md`
- 성격: MiniMax Music API로 노래, 배경음악, 커버를 생성하는 음악 생성 스킬
- 주요 도구: `mmx music generate`, `mmx music cover`, 로컬 오디오 플레이어

## 적용 조건

음악 생성, 노래 만들기, 가사 생성, 사용자가 제공한 가사를 노래로 만들기, 특정 분위기/장면의 BGM 생성, 커버 제작 요청에 사용한다. 기존 음악 재생, 음악 이론 질문, 추천만 하는 작업에는 사용하지 않는다.

## 동작 과정

1. 사용자 언어를 감지한다.
   사용자에게 보이는 모든 메시지는 사용자 언어로 쓰고, API prompt는 영어로 작성한다.

2. 의도를 감지한다.
   vocal, instrumental, cover 중 무엇인지 판단하고, casual one-liner면 Basic Mode, 세부 요구가 있으면 Advanced Control Mode로 간다.

3. Basic Mode에서는 설명을 풍부한 prompt로 확장한다.
   mood, genre, vocal, narrative, atmosphere, instruments를 포함한 영어 prompt를 만들고, 사용자에게는 localized 설명만 보여준다.

4. Advanced Mode에서는 lyrics와 prompt를 단계적으로 조정한다.
   사용자가 제공한 가사를 section marker와 함께 표시하고, prompt tag, 구조, BPM, reference style, vocal character를 조정할 수 있게 한다.

5. 최종 확인 후 `mmx`를 실행한다.
   vocal 자동 가사는 `--lyrics-optimizer`, 직접 가사는 `--lyrics`, instrumental은 `--instrumental`, cover는 `mmx music cover`를 사용한다.

6. 결과 파일을 저장한다.
   `~/Music/minimax-gen/YYYYMMDD_HHMMSS_<slug>.mp3` 형식으로 저장한다.

7. 재생한다.
   `mpv`, `ffplay`, `afplay` 순서로 사용 가능한 플레이어를 찾고, 없으면 파일 경로만 안내한다.

8. 피드백을 받아 반복한다.
   만족하면 종료하고, 수정이 필요하면 prompt/lyrics/style을 바꿔 재생성한다. 기존 파일은 버전 비교가 가능하게 보존한다.

## 핵심 규칙

- agent 실행 시 `--quiet --non-interactive`를 붙인다.
- prompt는 structured flags를 적극 사용한다.
- section marker `[verse]`, `[chorus]`, `[bridge]` 등을 가사에 포함한다.
- 저작권 있는 가사를 재현하지 않는다.
- 특정 언어 가사는 vocal/genre 설명에 자연스럽게 녹인다.
- content filter, quota, auth, timeout 등 mmx 오류를 분기 처리한다.

## 산출물 특성

결과물은 MP3 파일과 generation parameter/피드백 흐름이다. Basic은 빠른 생성, Advanced는 가사와 스타일을 세밀하게 통제하는 방식이다.

## 주의점

생성에는 `mmx` 설치와 인증이 필요하고, 결과는 홈 디렉토리의 Music 폴더에 저장된다. 실제 작업 시 권한과 네트워크/API quota가 영향을 준다.
