# minimax-music-playlist 분석

## 원본

- 경로: `.agents/skills/minimax-music-playlist/SKILL.md`
- 성격: 사용자의 음악 취향을 분석해 개인화 플레이리스트와 앨범 커버를 생성하는 스킬
- 주요 도구: `mmx` CLI, Python stdlib 스크립트, AppleScript, MusicBrainz API

## 적용 조건

플레이리스트 생성, 음악 취향 프로파일링, 개인화 음악 추천/생성 요청에 사용한다. 단순히 한 곡 생성은 `minimax-music-gen`에 더 가깝고, 이 스킬은 여러 곡과 커버/메타데이터까지 만든다.

## 동작 과정

1. 사용자 언어를 감지한다.
   모든 사용자-facing 텍스트는 사용자 언어로 제공한다. mmx prompt는 영어로 작성한다.

2. 음악 청취 데이터를 수집한다.
   Apple Music은 `osascript`, Spotify는 사용자가 내보낸 JSON/ZIP, 또는 수동 입력을 사용한다. raw track list는 사용자에게 그대로 보여주지 않고 집계만 보여준다.

3. 취향 프로필을 만든다.
   genre distribution, mood tendencies, vocal preference, tempo, language, top artists를 계산한다.

4. artist genre 정보를 보강한다.
   로컬 `artist_genre_map.json`을 먼저 보고, 없으면 MusicBrainz API를 rate limit을 지키며 조회해 cache한다.

5. 프로필을 캐시한다.
   `<SKILL_DIR>/data/taste_profile.json`에 저장하고 7일 이내면 재사용한다.

6. playlist theme을 정한다.
   사용자에게 한 번만 theme/scene을 묻는다. 이미 주어졌으면 생략한다.

7. playlist plan을 보여준다.
   각 곡의 genre, mood, vocal/language, 짧은 설명을 사용자 언어로 표시한다. 이 plan은 승인용이 아니라 투명성용이며 바로 생성으로 이어진다.

8. 곡들을 병렬 생성한다.
   최대 5개까지 `mmx music generate`를 병렬로 실행한다. 실패한 곡은 한 번 재시도하고, 계속 실패하면 건너뛰고 로그를 남긴다.

9. 앨범 커버를 병렬 생성한다.
   곡 생성과 동시에 `mmx image generate`로 1:1 커버 이미지를 만든다. 이미지 prompt에는 텍스트를 넣지 않는다.

10. 재생, 저장, 피드백을 처리한다.
   playlist 디렉토리에 `playlist.json`을 저장하고, 피드백을 taste profile에 반영한다.

## 핵심 규칙

- Spotify는 로컬 데이터가 없으므로 export 파일이 필요하다.
- 민감한 raw data는 보여주거나 저장하지 않는다.
- per-song lyrics language는 사용자 UI 언어가 아니라 genre에 따른다.
- 생성 prompt는 영어로 작성한다.
- scanning/analysis 스크립트는 필요할 때 직접 작성하되 Python stdlib만 쓴다.
- playlist 디렉토리에 이전 파일이 있으면 이번 세션 생성 파일만 재생한다.

## 산출물 특성

결과물은 `~/Music/minimax-gen/playlists/<playlist_name>/` 아래의 여러 MP3, 커버 이미지, `playlist.json`이다. 단순 추천이 아니라 사용자 취향 기반으로 실제 음악 파일을 생성하는 workflow다.

## 주의점

Apple Music 접근은 macOS와 Music.app 상태에 의존하고, Spotify는 export 파일 준비 시간이 필요할 수 있다. MusicBrainz 조회는 rate limit과 network 상태를 고려해야 한다.
