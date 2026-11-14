> AI 번역본. 원본: storyboard-format.md. 분석 근거는 원본이다.

# 스토리보드 형식 — `STORYBOARD.md` + 파싱된 매니페스트

스토리보드의 **기본 데이터 형식**만 정의한다. `STORYBOARD.md` 파일 구조와 그것이 파싱되는 `StoryboardManifest`가 여기 해당한다. 영상 기획 자체는 [story.md](story.md)에 있다. 선택 사항인 내레이션/TTS 파일(`SCRIPT.md`)은 별개의 주제이므로 여기서 다루지 않는다.

스토리보드는 영상의 **기획 레이어**다. 하나의 markdown 파일 안에 순서가 정해진 **프레임**(핵심 순간) 목록이 들어간다. 파서는 `@hyperframes/core/storyboard`이며, 결과물은 `StoryboardManifest`다.

## Frontmatter (전체 방향)

파일 맨 위의 YAML 블록이다. 알 수 없는 키는 `globals.extra` 아래에 보존된다.

| 키         | 의미                                                         | 예시                                      |
| ---------- | ------------------------------------------------------------ | ----------------------------------------- |
| `format`   | 캔버스 크기                                                  | `1920x1080`                               |
| `duration` | 사용자가 요청한 길이(참고용이며, 엄격한 제한은 아니다)       | `22s`                                     |
| `message`  | 한 줄 요약 주제                                              | `Ship a launch video in an afternoon`     |
| `arc`      | 내러티브 아크                                                | `Hook → Problem → Solution → Proof → CTA` |
| `audience` | 대상 독자                                                    | `indie devs on X`                         |
| `mode`     | 상호작용 모드(기본값은 collaborative)                        | `autonomous`                              |

스토리보드를 처음 쓸 때 `duration`을 정한다. 이 값은 기대치이지 게이트가 아니다. 실제로 컷이 끝나는 지점과 비교하고, 그 차이가 영상에 도움이 되는지 판단한다. 의도한 길이가 실제로 바뀔 때만 값을 업데이트한다.

## 프레임별 섹션

프레임마다 `## Frame N — Title` 제목 하나를 쓴다(H2/H3에서는 `Frame` / `Beat` / `Scene`도 허용). 메타데이터는 `- key: value` 불릿으로 쓴다. 그 아래부터 다음 제목 전까지의 모든 내용이 자유 형식의 **내러티브**다.

| 키              | 의미                                                                                                                 |
| --------------- | -------------------------------------------------------------------------------------------------------------------- |
| `status`        | `outline` → `built` → `animated` (기본값은 `outline`)                                                                 |
| `src`           | 프레임 HTML 서브 컴포지션의 프로젝트 기준 상대 경로(타일 포스터가 이것으로 렌더링한다)                               |
| `duration`      | 예: `4s`                                                                                                             |
| `transition_in` | `crossfade` / `cut` / `wipe` … (별칭 `transition`). 메모일 뿐이며, 직접 만들어야 한다(크로스페이드는 클립을 겹친다) |
| `scene`         | 한 줄짜리 콘택트 시트 캡션(별칭 `description` / `summary` / `caption`)                                               |
| `voiceover`     | 프레임 내레이션의 _가이드_(별칭 `vo` / `voice_over` / `narration`)                                                   |
| `poster`        | 타일 포스터를 뽑을 시점(초). 인트로 애니메이션이 지난 뒤여야 한다                                                    |
| _그 밖의 키_    | `extra` 아래에 그대로 보존된다. 프레임별 자체 데이터(효과, 에셋 등)를 여기에 둔다                                     |

모든 영상 기획에 들어가는 `extra` 키 두 개. 빌드와 리뷰가 같은 것을 확인하도록 둔다:

| 키      | 의미                                                                                                                                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reads` | 이 프레임에서 시청자가 이해해야 하는 것을 순서대로, 각각 시간 구간과 함께 적는다. 예: `the cursor finds the button (0.4-1.2s); "Export" lands (1.2-2.6s)`. 구간은 겹치지 않으며, 각 구간은 그 안의 단어를 읽기에 충분히 길어야 한다(`story.md` §6) |
| `sound` | 베드, 눈에 보이는 동작에 붙은 효과, 또는 무음을 적는다. 예: `bed enters strong; click on Export; whoosh on the cut`                                                                                                                  |

## 파싱된 매니페스트

파서는 **관대하다**. 예외를 던지지 않으며, 이상한 부분은 모두 `warning`으로 기록한다.

```
StoryboardManifest {
  globals: { format?, message?, arc?, audience?, extra: {…} }
  frames: Array<{
    index, number?, title?,
    status,                       // "outline" | "built" | "animated"
    src?, duration? / durationSeconds?, transitionIn?,
    scene?, voiceover?, poster?,
    narrative,                    // markdown below the metadata
    extra: {…}                    // unknown keys, preserved
  }>
  warnings: Array<{ message, line?, frameIndex? }>
}
```

## `SCRIPT.md` (여기서 다루지 않는다)

선택 사항이며 자유 형식이다. **매니페스트로 파싱되지 않는다**. TTS를 구동하는 고정된 내레이션 파일이며, 내레이션/TTS가 없는 영상에는 없다. 위의 프레임별 `voiceover`가 스토리보드 자체의 내레이션 가이드다.

## 예시

```markdown
---
format: 1920x1080
message: "Ship a launch video in an afternoon"
arc: Hook → Problem → Solution → Proof → CTA
audience: indie devs on X
---

## Frame 1 — Hook

- scene: Big type punches in on the beat
- duration: 3s
- poster: 2s
- transition_in: cut
- status: animated
- voiceover: "Ship a launch video in an afternoon."
- reads: "Ship a launch video" lands (0.3-1.6s); "in an afternoon" (1.6-3.0s)
- sound: bed enters on its strongest bar; impact on "afternoon"
- src: compositions/frames/01-hook.html

Open cold on the promise. This is the thesis — everything after pays it off.

## Frame 2 — The problem

- scene: A 20-minute timer spins on a stack of rejected takes
- duration: 4s
- transition_in: crossfade
- status: built
- voiceover: "The old way? Prompt, wait twenty minutes, get something that misses."
- src: compositions/frames/02-problem.html

The old way: prompt, wait, get something that misses. Establish the pain we remove.
```

## 참고

- `status: outline`이고 빌드된 `src`가 없는 프레임은 아웃라인 플레이스홀더로 렌더링된다.
- `built`은 중간 단계다. 프레임의 HTML이 존재하고, **레이아웃이 확인된 상태**다(와이어프레임 스케치 이상). 모션은 아직 추가되지 않았다. 승인된 레이아웃 바깥에는 아직 아무것도 그려지지 않았다.
- 여러 줄로 된 `voiceover` 값은 저장할 때 한 줄로 합쳐진다.
