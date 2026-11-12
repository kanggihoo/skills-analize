# narrated-motion-video 묶음은 어떻게 이어지나 {#narrated-motion-video-group}

`script-to-motion`이 영상을 만들고, `aimotion`은 그 도중에 장면마다 쓸 표현 기법을 찾아 주는 참고서다. `script-to-motion`은 5단계 스토리보드에서 beat마다 `cokacmotion.mjs`로 기법을 찾고, 6단계 빌드에서 그 기술만 프로젝트 코드로 다시 짠다(r16).[](source:nm-st-board)[](source:nm-cokac-ref)

- 연결은 한 방향이다. `aimotion`의 `SKILL.md`는 "작업 중인 영상 스킬의 규칙이 먼저"라고만 적고 `script-to-motion`을 부르지 않는다(r17).[](source:nm-am-port)
- `script-to-motion`은 자체 도구로 저장소를 받아 그 안의 `scripts/aimotion.mjs`를 실행한다.[](source:nm-cokac-run) `aimotion`의 `SKILL.md`는 셰이더 함정 절 "영상에 옮길 때"를 참고하라고 한 곳에서만 가리킨다.[](source:nm-cokac-shader)
- 두 스킬 모두 데모의 장면을 옮기지 않는다는 같은 규칙을 적는다. 기술만 가져간다.[](source:nm-am-rule)[](source:nm-cokac-rule)

@answer scope="video 묶음 · 커밋 f415191 · 지시상 동작 · 실행하지 않음"
@meta locale=ko
@source nm-st-board title="video/script-to-motion/SKILL.md · 5단계 기법 찾기" path=video/script-to-motion/SKILL.md lines=840:849
@source nm-st-build title="script-to-motion/SKILL.md · 6단계 기법 옮기기" path=video/script-to-motion/SKILL.md lines=905:907
@source nm-st-orig title="script-to-motion/SKILL.md · 원본 소재 규칙의 기법 항목" path=video/script-to-motion/SKILL.md lines=476:482
@source nm-st-hand title="script-to-motion/SKILL.md · 인수 보고의 출처 보고" path=video/script-to-motion/SKILL.md lines=1084:1085
@source nm-cokac-ref title="script-to-motion/references/cokacmotion.md · 쓰는 때" path=video/script-to-motion/references/cokacmotion.md lines=8:15
@source nm-cokac-rule title="script-to-motion/references/cokacmotion.md · 기술만 가져간다" path=video/script-to-motion/references/cokacmotion.md lines=24:41
@source nm-cokac-dl title="script-to-motion/references/cokacmotion.md · 내려받기" path=video/script-to-motion/references/cokacmotion.md lines=57:65
@source nm-cokac-lic title="script-to-motion/references/cokacmotion.md · 코드와 라이선스" path=video/script-to-motion/references/cokacmotion.md lines=147:153
@source nm-cokac-note title="script-to-motion/references/cokacmotion.md · 프로젝트 기록" path=video/script-to-motion/references/cokacmotion.md lines=160:164
@source nm-cokac-shader title="script-to-motion/references/cokacmotion.md · 셰이더 함정은 aimotion SKILL.md 참조" path=video/script-to-motion/references/cokacmotion.md lines=123:125
@source nm-cokac-cmd title="script-to-motion/references/cokacmotion.md · 도구 명령" path=video/script-to-motion/references/cokacmotion.md lines=45:55
@source nm-cokac-intro title="script-to-motion/references/cokacmotion.md · 도서관 소개" path=video/script-to-motion/references/cokacmotion.md lines=3:6
@source nm-cokac-lib title="script-to-motion/references/cokacmotion.md · 라이브러리 추가는 승인" path=video/script-to-motion/references/cokacmotion.md lines=115:117
@source nm-cokac-run title="script-to-motion/scripts/cokacmotion.mjs · 받은 스크립트 실행" path=video/script-to-motion/scripts/cokacmotion.mjs lines=179:183
@source nm-am-rule title="video/cokacmotion/skills/aimotion/SKILL.md · 기술만 가져간다" path=video/cokacmotion/skills/aimotion/SKILL.md lines=12:35
@source nm-am-port title="aimotion/SKILL.md · 영상에 옮길 때" path=video/cokacmotion/skills/aimotion/SKILL.md lines=55:62
@source nm-am-script title="aimotion/scripts/aimotion.mjs · 명령" path=video/cokacmotion/skills/aimotion/scripts/aimotion.mjs lines=1:10
@source nm-am-desc title="aimotion/SKILL.md · frontmatter" path=video/cokacmotion/skills/aimotion/SKILL.md lines=2:3

## 두 스킬은 어떤 순서로 이어지나 {#flow}

@workflow id=nm-flow title="기법 하나를 찾아 옮기는 길"
| story | 5단계 스토리보드 | backend |
| need | beat의 효과 정하기 | backend |
| find | 기법 찾기 | external |
| read | 노트·소스 읽기 | external |
| port | 6단계에서 옮기기 | backend |
| story > need | |
| need > find | 대본이 먼저 | emphasis |
| find > read | |
| read > port | 기술 한 문장 | emphasis |

@steps id=nm-steps
| story | 5단계 스토리보드 | `script-to-motion`이 세계관 문서를 쓰고 beat마다 내용과 효과를 정한다.[](source:nm-st-board) | nm-flow | story |
| need | beat의 효과 정하기 | 마음에 드는 데모를 먼저 고르지 않는다. 대본에서 효과를 정한 뒤 찾는다.[](source:nm-cokac-rule) | nm-flow | need |
| find | 기법 찾기 | `cokacmotion.mjs search`가 `aimotion.mjs search`를 돌려 순위대로 보여 준다. 첫 사용에는 저장소를 받는다.[](source:nm-cokac-dl) | nm-flow | find |
| read | 노트·소스 읽기 | `NOTES.md`와 `main.js:줄`을 읽고 데모의 소재를 뺀 기술 한 문장을 적는다.[](source:nm-am-rule) | nm-flow | read |
| port | 6단계에서 옮기기 | 프로젝트 코드로 다시 짠다. 데모 파일은 불러오지 않는다.[](source:nm-st-build) | nm-flow | port |

`find`와 `read` 두 노드는 `aimotion`의 스크립트와 파일이 하는 일이라 외부로 그렸다. 일곱 단계 전체와 결정성·무게 규칙은 `video/cokacmotion/skills/aimotion/aimotion.html`에 있다.

판정: 찾기는 의무형이다. `script-to-motion`은 beat의 주 효과와 영웅 글자, 시그니처 전환, 충격 beat마다 기법을 찾으라고 적는다.[](source:nm-st-board)

## 어떤 도구가 같은 일을 하나 {#tools}

| 기준 | `script-to-motion`의 `cokacmotion.mjs` | `aimotion`의 `aimotion.mjs` |
| --- | --- | --- |
| 위치 | `script-to-motion/scripts/`. 저장소를 `~/.cache/motion-video-cokacmotion`에 받는다[](source:nm-cokac-dl) | `aimotion/scripts/`. 스킬 폴더 안의 `demos/`를 읽는다[](source:nm-am-script) |
| 명령 | `search`, `list`, `show`, `path`, `common`에 더해 `where`, `update`가 있다[](source:nm-cokac-cmd) | `search`, `list`, `show`, `path`, `common`[](source:nm-am-script) |
| 네트워크 | 첫 사용에 약 70MB를 받는다. 하루 한 번 갱신한다. 오프라인이면 캐시를 쓴다[](source:nm-cokac-dl) | 쓰지 않는다. 이 폴더의 파일만 읽는다[](source:nm-am-script) |
| 받은 코드 | 받은 `aimotion.mjs`를 `node`로 실행한다[](source:nm-cokac-run) | 해당 없음 |

판정: 두 도구의 `search` 결과는 같은 스크립트가 만들지만, `script-to-motion`이 받는 저장소 판본과 `aimotion` 폴더의 판본이 같은 commit인지는 원문에 명시 없음이다. 이 저장소에 있는 `aimotion` 복사본은 166편이고, `references/cokacmotion.md`도 166편이라 적는다.[](source:nm-cokac-intro)

## 두 스킬이 주고받는 것은 무엇인가 {#state}

| 파일·폴더 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `~/.cache/motion-video-cokacmotion/`(저장소 복사본) | `script-to-motion`의 `cokacmotion.mjs`[](source:nm-cokac-dl) | 같은 도구. `aimotion`이 읽는다는 말은 원문에 명시 없음 |
| `storyboard.md`의 References | `script-to-motion`(데모 id, 기술 한 문장, 이 영상이 대신 그린 것, `where`가 알려 주는 commit)[](source:nm-cokac-note) | 같은 스킬의 빌드 단계 |
| `진행상황.md` | `script-to-motion`(옮긴 기법마다 한 줄)[](source:nm-cokac-note) | 사용자 |
| `licenses/cokacmotion-LICENSE.txt` | `script-to-motion`. 코드 블록이 데모 코드와 실질적으로 같을 때만 복사한다[](source:nm-cokac-lic) | 사용자 |
| 프로젝트 안 `js/*.js` | `script-to-motion`(기법을 다시 짠 코드. 위에 `technique: cokacmotion <id>` 주석을 한 줄 단다)[](source:nm-cokac-lic) | 영상 재생 |

데모의 `poster.jpg`·`sheet.jpg`는 보기만 하고 프로젝트에 넣지 않는다.[](source:nm-cokac-lic) `aimotion` 쪽에서 쓰는 상태 파일은 없다. 이 스킬은 아무것도 만들지 않는다.[](source:nm-am-script)

## 그림에서 뺀 관계와 쓰면 안 될 때 {#omitted}

| rel-id | 종류 | 그림에 있나 | 내용 |
| --- | --- | --- | --- |
| r16 | 내부 위임 | 있음 | 위 흐름 |
| r17 | 참고 | 생략 | `aimotion`은 "영상 스킬의 규칙이 먼저"라고만 적는다. 어느 영상 스킬인지는 원문에 명시 없음(`불명`)[](source:nm-am-port) |
| r18 | 같은 계열 | 생략 | `bang-motion`과 목적이 비슷하다. 연결은 없다 |
| r19 | 같은 계열 | 생략 | `explainer-default`와 목적이 비슷하다. 연결은 없다 |

- `aimotion`을 `script-to-motion` 없이 쓸 때는 `description`에 따라 영상 장면에 표현 기법이 필요한 어떤 요청에도 켜진다.[](source:nm-am-desc)
- 데모의 소재·장면·색·9:16 형식을 영상에 옮기는 일은 두 스킬이 모두 금지한다.[](source:nm-am-rule)[](source:nm-cokac-rule)
- `script-to-motion`의 `assets/vendor/catalog.json`에 새 라이브러리를 더하는 일은 사용자 승인이 필요하다.[](source:nm-cokac-lib)

@callout level=open-question title="확인하지 못한 것"
두 스킬을 실행하지 않았다. `script-to-motion`이 받는 저장소 판본과 이 저장소의 `aimotion` 복사본이 같은 commit인지는 확인하지 못했다.
`script-to-motion`은 받은 코드를 고정 해시 없이 실행하는 구조로 보인다(`cokacmotion.mjs:85-95,179-183`). 이 판정은 두 구간을 읽은 결과이고, 다른 곳에 검증이 있는지는 `script-to-motion/scripts/lib/` 전체를 대조하지 않았다.

@callout level=note title="이 묶음의 읽은 원문"
`script-to-motion/SKILL.md`, `references/cokacmotion.md`, `scripts/cokacmotion.mjs`, `aimotion/SKILL.md`, `aimotion/scripts/aimotion.mjs`를 다시 읽고 줄 번호를 확인했다. 각 스킬의 내부 규칙과 수치는 `video/script-to-motion/script-to-motion.html`, `video/cokacmotion/skills/aimotion/aimotion.html`에 있다.
