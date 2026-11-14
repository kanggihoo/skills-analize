> AI 번역본. 원본: beats.md. 분석 근거는 원본이다.

# 프로젝트 비트 그리드 생성

기존 HyperFrames 프로젝트의 음악 트랙에 맞는 Studio 호환 비트 파일이 필요할 때 `hyperframes beats`를 쓴다. 이것은 CLI 유틸리티이며, 완전한 영상 워크플로우가 아니다.

```bash
npx hyperframes beats
npx hyperframes beats ./my-video
npx hyperframes beats ./my-video --json
```

폴더 대신 오디오나 영상 파일을 주면(`npx hyperframes beats music.mp3 --json`), `beats`는 그 파일을 분석해 `{ ok, file, count, bpm, beatTimes }`를 출력한다. 아무것도 쓰지 않는다.

프로젝트에는 로컬 음악 `<audio>` 소스가 있어야 한다. `data-timeline-role="music"`으로 표시한다. id에 `music`, `bgm`, `soundtrack`이 들어간 경우도 인식한다. 명령은 그 파일을 ffmpeg로 디코딩하고, 비트를 추적한 뒤, `beats/<audio-relative-path>.json`을 쓴다.

트랙에 일정한 비트가 없으면 명령은 실패하고 아무것도 쓰지 않는다. ffmpeg가 없으면 `npx hyperframes doctor`를 실행한다.

음악 트랙에 맞춘 영상 전체를 만들려면 `/hyperframes` → `references/film.md`를 본다.
