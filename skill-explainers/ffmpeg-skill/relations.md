# ffmpeg-skill 관계 원장
분석 커밋: 793ed72973f4b2118972d0159fe1c7b0b9185e11
조사 범위: ffmpeg-skill/ffmpeg-skill

- 범위: `ffmpeg-skill/ffmpeg-skill/SKILL.md` 및 `references/*.md` 10개. `ffmpeg-skill/skills-lock.json`에는 `ffmpeg-skill` 1개만 등록되어 있다. 저장소 내부 개발용 `.claude/skills/`는 배포 스킬이 아니므로 분석 범위에서 제외했다.
- 커밋 상태: 사용자 승인 후 `ffmpeg-skill/` 전체(499개 파일)를 local commit(`793ed72`)했다. push는 하지 않았다.
- 번역본: 생성하지 않음(사용자 요청).
- 원문 비교: 다른 컬렉션에 동명 스킬 없음. 단 `ffmpeg-skill/ffmpeg-skill/skills/ffmpeg-skill/SKILL.md`는 루트 `SKILL.md`와 해시가 다른 별도 사본(`7a012ffe...` vs `36ae0f66...`)이다.

## 스킬

| 경로 ID | 한 줄 요약 | 조사 상태 | 원문 비교 | 소속 묶음 | 묶음 내 역할 |
|---|---|---|---|---|---|
| ffmpeg-skill/ffmpeg-skill | 로컬 FFmpeg 6.1+와 42개 Python 스크립트로 영상·오디오를 측정·편집·검증한다 | 완료 | - | - | - |

## 관계

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r01 | color-grading-skill | ffmpeg-skill/ffmpeg-skill | 호출 | 명시-이름 | "영화 같은(cinematic)" 색보정 파라미터 판단은 외부 `color-grading-skill`이 맡고, 파라미터가 정해지면 이 스킬의 `color.py`를 호출한다 | 색보정 파라미터(LUT·노출·색온도) | - | 범위 밖 | SKILL.md:71-72; references/workflow.md:59 |

## 묶음

없음 (단일 스킬 컬렉션).
