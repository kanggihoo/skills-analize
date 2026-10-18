# buddy-sings 분석

## 원본

- 경로: `.agents/skills/buddy-sings/SKILL.md`
- 성격: Claude Code pet 또는 buddy가 노래하도록 MiniMax 음악 생성을 연결하는 창작 스킬
- 주요 도구: `mmx` CLI, MiniMax Music API, 로컬 오디오 플레이어

## 적용 조건

사용자가 Claude Code buddy, pet, companion에게 노래를 부르게 해 달라고 요청할 때 사용한다. 노래, 음악, sing 같은 표현이 buddy/pet 개념과 결합되면 트리거된다. 다국어 요청도 같은 의미라면 적용한다.

## 동작 과정

1. 사용자 언어를 감지한다.
   세션 전체의 사용자-facing 메시지를 같은 언어로 제공한다. 단, MiniMax API에 보내는 prompt는 품질을 위해 영어로 작성한다.

2. pet 존재 여부를 확인한다.
   `~/.claude.json`에서 `companion` 필드를 읽고 `name`, `personality`를 추출한다. pet이 없으면 `/buddy`로 입양하라고 안내하고 중단한다.

3. vocal identity를 만든다.
   pet 이름과 성격을 해석해 timbre, singing style, mood를 정하고 영어 `prompt_fragment`를 만든다.

4. vocal identity를 캐시한다.
   `~/.claude/skills/buddy-sings/voices/<name>.json`에 저장한다. 같은 pet은 같은 목소리를 유지한다. personality가 달라지거나 사용자가 voice 재생성을 요청하면 캐시를 무효화한다.

5. 노래 주제를 파악한다.
   사용자가 오늘, 내 일, 우리 이야기처럼 개인 맥락을 요구하면 현재 대화, memory 파일, git history를 자동으로 훑는다. 명확한 장면 요청이면 바로 생성으로 간다.

6. 가사와 prompt를 준비한다.
   pet이 1인칭 화자가 되고, 사용자가 2인칭 대상이 되도록 가사를 쓴다. 목소리 prompt fragment가 항상 앞에 온다.

7. 생성 전 전체 preview를 보여준다.
   전체 가사와 localized prompt 설명을 생략 없이 보여주고 확인을 받는다.

8. `mmx music generate`를 실행한다.
   자동 가사는 `--lyrics-optimizer`, 직접 작성 가사는 `--lyrics`를 사용한다. 결과는 `~/Music/minimax-gen/`에 저장한다.

9. 재생과 피드백을 처리한다.
   `mpv`, `ffplay`, `afplay` 순서로 플레이어를 찾아 재생하고, 사용자의 피드백에 따라 스타일/가사/랜덤 테마를 다시 시도한다.

## 핵심 규칙

- pet이 없으면 생성하지 않는다.
- 같은 pet은 같은 목소리를 유지해야 한다.
- 가사는 pet 관점의 1인칭이어야 한다.
- API prompt는 영어, 사용자에게 보이는 설명은 사용자 언어로 제공한다.
- 전체 가사와 설명 preview를 생략하지 않는다.
- 저작권 있는 기존 가사를 재현하지 않는다.

## 산출물 특성

결과물은 pet 이름이 포함된 MP3 파일과 재생/피드백 흐름이다. 단순 음악 생성보다 pet의 성격과 사용자의 맥락을 반영하는 개인화된 노래 생성에 초점이 있다.

## 주의점

워크스페이스 밖의 `~/.claude.json`, `~/.claude/skills/...`, `~/Music/...`을 읽거나 쓰는 흐름이 포함된다. 실제 실행 시에는 파일 접근 권한과 `mmx` 인증 상태를 확인해야 한다.
