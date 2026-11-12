# aimotion은 언제 켜지고, 데모에서 무엇을 가져가게 하나 {#aimotion-page}

`aimotion`(저장소 이름 cokacmotion)은 영상 장면에 더 풍부한 표현이 필요할 때 켜지는 **기법 참고서**다. 에이전트는 데모 166편에서 효과를 만드는 **기술만** 배우고, 데모의 소재·장면·문구·색·9:16 형식은 하나도 가져가지 않는다.[](source:am-rule)

- `description`이 모션그래픽·영상 장면, 잉크·수채·셰이더·타이포 같은 표현 영역, "표현력 향상" 요청을 가리킨다.[](source:am-desc)
- 이 스킬은 아무것도 만들지 않는다. 찾기 스크립트는 이 폴더의 파일만 읽고 네트워크를 쓰지 않는다.[](source:am-script)
- 영상은 aimotion 파일을 불러오지 않는다. 원리를 이해한 뒤 영상 프로젝트의 코드로 다시 쓴다.[](source:am-port)
- 영상을 본 사람이 데모의 장면을 알아보면 실패다. 그러면 대본에서 다시 시작한다.[](source:am-rule)

@answer scope="aimotion · 커밋 f415191 · 지시상 동작 · 데모는 표본만 확인"
@meta locale=ko
@source am-desc title="video/cokacmotion/skills/aimotion/SKILL.md · 9031B · frontmatter" path=video/cokacmotion/skills/aimotion/SKILL.md lines=2:3
@source am-intro title="aimotion/SKILL.md · 소개" path=video/cokacmotion/skills/aimotion/SKILL.md lines=6:10
@source am-rule title="aimotion/SKILL.md · 가장 중요한 규칙" path=video/cokacmotion/skills/aimotion/SKILL.md lines=12:35
@source am-usage title="aimotion/SKILL.md · 쓰는 법 7단계" path=video/cokacmotion/skills/aimotion/SKILL.md lines=37:53
@source am-port title="aimotion/SKILL.md · 영상에 옮길 때" path=video/cokacmotion/skills/aimotion/SKILL.md lines=55:77
@source am-script title="aimotion/scripts/aimotion.mjs · 5526B · 찾기 스크립트" path=video/cokacmotion/skills/aimotion/scripts/aimotion.mjs lines=1:10
@source am-readme-use title="cokacmotion/README.md · 75322B · 쓰는 법" path=video/cokacmotion/README.md lines=32:36
@source am-readme-install title="cokacmotion/README.md · 설치" path=video/cokacmotion/README.md lines=11:30
@source am-index title="aimotion/index.json · 170837B · 데모 목록(구조·표본만)" path=video/cokacmotion/skills/aimotion/index.json
@source am-notes title="aimotion/demos/03-coral-growth/NOTES.md · 8603B · 표본 1편" path=video/cokacmotion/skills/aimotion/demos/03-coral-growth/NOTES.md
@source am-indexmd title="aimotion/INDEX.md · 134623B · 분류별 목록(앞부분만)" path=video/cokacmotion/skills/aimotion/INDEX.md lines=1:20
@source am-plugin title="cokacmotion/.claude-plugin/plugin.json · 580B · 플러그인 정의" path=video/cokacmotion/.claude-plugin/plugin.json
@source am-market title="cokacmotion/.claude-plugin/marketplace.json · 504B" path=video/cokacmotion/.claude-plugin/marketplace.json
@source am-license title="cokacmotion/LICENSE · 1063B · MIT" path=video/cokacmotion/LICENSE lines=1:3
@source am-gitignore title="cokacmotion/.gitignore · 31B" path=video/cokacmotion/.gitignore
@source st-ref title="script-to-motion/references/cokacmotion.md · 12393B · 연결 문서" path=video/script-to-motion/references/cokacmotion.md lines=8:15
@source st-tool title="script-to-motion/scripts/cokacmotion.mjs · 머리말" path=video/script-to-motion/scripts/cokacmotion.mjs lines=3:22

## 언제 켜지나 {#activation}

켜짐 여부는 모델이 `description`을 보고 판단한다. 정확히 일치해야 켜지는 사전이 아니다. 호출을 막는 필드(`disable-model-invocation` 등)는 원문에 명시 없음이다.[](source:am-desc)

@code id=am-desc-code source=am-desc language=yaml

README는 설치하면 장면에 표현 기법이 필요할 때 Claude가 스스로 이 스킬을 꺼내 쓴다고 적는다.[](source:am-readme-use)

| 상황(설명용 예시) | 켜질까 | 이유 |
| --- | --- | --- |
| 대본이 "잉크가 번지는 전환"을 요구한다 | {good:켜질 만함} | `description`이 잉크·수채·판화 질감과 장면 전환을 든다[](source:am-desc) |
| "자막을 더 살아 있게", "표현력 업그레이드" | {good:켜질 만함} | 같은 `description`이 표현력 향상·그래픽 업그레이드 요청을 든다[](source:am-desc) |
| 영상 없이 웹 UI 버튼 스타일만 고친다 | {caution:판단 불가} | 영상이 아닌 작업에 쓰는지는 원문에 명시 없음 |
| 데모와 똑같은 장면을 만들어 달라는 요청 | {bad:쓰면 안 됨} | 데모의 소재·구도를 옮기는 일을 규칙이 금지한다[](source:am-rule) |

## 에이전트는 어떤 순서로 쓰나 {#steps-panel}

@workflow id=aimotion-flow title="기법 하나를 영상으로 옮기는 순서"
| need | 대본에서 표현 정하기 | external |
| find | 기법 찾기 | backend |
| look | 그림으로 보기 | backend |
| read | 노트와 소스 읽기 | backend |
| write | 기술 한 문장 적기 | backend |
| port | 영상 코드로 옮기기 | backend |
| same | 데모 장면이 알아보이나? | backend |
| need > find | |
| find > look | |
| look > read | |
| read > write | |
| write > port | |
| port > same | |
| same > need | 예, 다시 | emphasis |

@steps id=aimotion-steps
| need | 대본에서 표현 정하기 | 마음에 드는 데모를 먼저 고르지 않는다. 대본이 요구하는 장면과 소재를 먼저 정하고 그 말로 찾는다.[](source:am-rule) | aimotion-flow | need |
| find | 기법 찾기 | `node $S search 잉크 번짐`처럼 제목·기법·배울 점·라이브러리·분류에서 찾아 순위대로 본다. | aimotion-flow | find |
| look | 그림으로 보기 | `out/poster.jpg`(절정 한 장)와 `out/sheet.jpg`(1초마다 한 장)를 이미지로 연다. 기법이 보이는 모양만 확인한다. | aimotion-flow | look |
| read | 노트와 소스 읽기 | `NOTES.md`를 끝까지, 노트가 가리키는 `main.js:줄`을 모두 읽는다. 첫 절 "화면"은 가져가지 않는다. | aimotion-flow | read |
| write | 기술 한 문장 적기 | 데모의 소재를 뺀 한 문장으로 적는다. | aimotion-flow | write |
| port | 영상 코드로 옮기기 | 그 기술을 영상의 소재로 다시 짠다. 시계·결정성·무게 규칙을 따른다. | aimotion-flow | port |
| same | 데모 장면이 알아보이나? | 데모를 본 사람이 알아보면 다시 짠다. | aimotion-flow | same |

이 순서는 `SKILL.md`의 일곱 단계다.[](source:am-usage) 예를 들어 03번(바닷속 산호) 노트는 "끌개 점을 향해 가지를 키우는 space colonization을 미리 굽고, 태어난 순서의 앞부분만 t에 맞춰 그린다"로 적는다. 대본이 퍼지는 연결망을 말하면 연결망이 자라고, 산호·바다를 그리면 데모를 옮긴 것이다.[](source:am-rule)

찾기 스크립트의 명령은 `search`, `list`, `show <id> [--notes|--code]`, `path <id>`, `common` 다섯 개다. `<id>`는 폴더 이름(`03-coral-growth`)이나 번호(`3`)다.[](source:am-script)

## 무엇을 강제하고 무엇을 금지하나 {#rules}

| 구분 | 내용 |
| --- | --- |
| 가져간다 | 알고리즘, 수식, 셰이더 구조, 합성·빛의 모델, 질감 만드는 방법, 이징 구조, 미리 굽고 t로 읽기, 성능 요령[](source:am-rule) |
| 가져가지 않는다 | 소재(사물·인물·로고·지명·데이터), 장면·구도·카메라 동선, 문구·색·팔레트[](source:am-rule) |
| 형식도 가져가지 않는다 | 데모는 모두 세로 9:16(1080×1920), 8–10초, 화면 아래 자막이다. 비율·길이·자막은 작업 중인 영상을 따른다[](source:am-rule) |
| 영상 스킬이 먼저다 | 라이브러리·글꼴·소리·데이터·네트워크는 작업 중인 영상 스킬의 규칙을 따른다. 그 규칙에 없는 라이브러리를 쓴 데모는 원리만 가져와 Canvas 2D·SVG·WebGL로 직접 쓴다[](source:am-port) |
| 결정성 | 그림은 t의 순수 함수다. `Math.random`·`Date`·타이머·CSS transition을 쓰지 않는다[](source:am-port) |

@callout level=warning title="색이나 문구만 바꿔서는 통과하지 못한다"
데모의 장면을 영상에 옮기면 색, 크기, 문구를 바꿔도 실패다. 이 규칙은 다른 모든 안내보다 먼저라고 원문이 적는다.

@facts id=aimotion-facts
| 데모 수 | 166편, 12개 분류. `index.json`의 분류별 합이 166이다[](source:am-index) |
| 영상 주의가 붙은 데모 | 105편(`index.json`의 `cautions`가 비어 있지 않은 항목 수)[](source:am-index) |
| 무게 기준 | 목록의 "CPU 검증 프레임당"이 1초를 넘는 기법은 해상도를 낮추거나 미리 굽는다(지시)[](source:am-port) |
| 요구 환경 | Node 18 이상, 의존성 없음[](source:am-usage) |
| 셰이더 함정 | 음수 밑의 `pow`는 GPU에서 NaN이다. 제곱은 `x * x`, 밑은 `max(x, 0.0)`으로 막는다[](source:am-port) |

옮길 때 데모의 `setup()` 굽기는 영상의 프레임 전 한 번으로, `frame(t)`는 영상의 프레임 함수로, `rand(seed)`는 영상의 시드 난수로 바꾼다. 코드 안의 1080·1920 같은 좌표는 데모 무대 값이라 영상 무대 크기로 다시 계산한다.[](source:am-port)

판정: 이 스킬은 사람에게 묻는 지점이 없다. 사람 승인 지점은 원문에 명시 없음이다. 가져간 결과가 데모와 닮았는지는 에이전트가 스스로 판단한다.

## 어떤 흐름 속에 놓이나 {#position}

묶음 `narrated-motion-video`에 속한다. 전체 흐름은 `video/_group-narrated-motion-video/narrated-motion-video.html`에 있다. 이 스킬 자체에는 앞 단계도 뒤 단계도 없다.

@workflow id=aimotion-position title="script-to-motion 안에서의 위치"
| story | script-to-motion 5단계 스토리보드 | backend |
| lib | aimotion 기법 찾기 | backend | emphasis |
| build | script-to-motion 6단계 빌드 | backend |
| story > lib | 기법이 필요한 beat |
| lib > build | 기술 한 문장 | emphasis |

| rel-id | 받는 것 / 넘기는 것 | 조건·강도 |
| --- | --- | --- |
| r16 | script-to-motion이 `cokacmotion.mjs`로 이 저장소를 받아 `scripts/aimotion.mjs`를 돌린다[](source:st-tool). 이 스킬의 `SKILL.md`는 셰이더 함정 절 하나만 참조한다(`cokacmotion.md:123-125`) | 스토리보드의 beat마다 찾는다(의무형)[](source:st-ref) |
| r17 | 이 스킬은 "작업 중인 영상 스킬의 규칙이 먼저"라고만 적는다[](source:am-port) | 어느 영상 스킬인지는 원문에 명시 없음(`불명`) |

@callout level=open-question title="확인하지 못한 것"
이 스킬을 실행하지 않았다. 기법을 옮긴 영상이 실제로 데모와 구별되는지는 확인하지 못했다.
읽은 텍스트 파일은 11개다(출처 목록 참고): `SKILL.md`, `aimotion.mjs`, `README.md`(앞 140줄과 끝 30줄, 데모 표는 표본), `INDEX.md`(앞부분), `index.json`(구조와 집계), `03-coral-growth/NOTES.md` 1편, `plugin.json`, `marketplace.json`, `LICENSE`, `.gitignore`.
부분 읽음: 나머지 데모 165편의 `NOTES.md`·소스(`main.js` 등)와 `demos/_lib/`, `demos/_tools/`는 구조·표본만 확인(전부 읽지 않음)이다. 이 스킬은 데모 폴더를 읽게 하는 스킬이라, 개별 기법의 정확성은 이 페이지가 보증하지 않는다. 그래서 부분 분석이다.
바이너리: `out/poster.jpg`·`out/sheet.jpg` 등 jpg 264개를 읽었다고 하지 않는다(커밋된 cokacmotion 파일 954개 중).
분석 중 `video/cokacmotion/.git`(저장소 내부 git)을 사용자 승인으로 지우고 commit했다. 원본 저장소는 `github.com/kstost/cokacmotion`이다.[](source:am-readme-install)
