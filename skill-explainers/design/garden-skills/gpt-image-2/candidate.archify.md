# gpt-image-2 — 실행 환경을 판별해 GPT Image 2 프롬프트와 이미지를 생성·편집한다 {#overview}

에이전트는 먼저 로컬 API 실행 가능 여부를 판별한 뒤, 17개 분야의 구조화 템플릿으로 프롬프트를 채워 직접 이미지를 생성·편집하거나 호스트 도구·사용자에게 넘긴다.[](source:fm)[](source:wf)

- 이미지 생성·편집 요청 시 켜지며, 환경 변수 유무에 따라 로컬 API 실행(`Mode A`), 호스트 도구 위임(`Mode B`), `Advisor 모드`(`Mode C`) 세 갈래로 갈린다.[](source:modes)[](source:wf)
- 결과로 모든 모드(B는 선택)에서 `garden-gpt-image-2/prompt/` 아래 프롬프트 파일이 남고, `Mode A`에서만 `garden-gpt-image-2/image/`에 PNG 이미지가 저장된다.[](source:out)[](source:psave)
- `web-design-engineer`가 이미지 우선 시각 탐색 단계에서 가용 시 이 스킬의 호출을 지시한다.[](source:wde-call)
- `Mode B`와 `Mode C`에서는 로컬 API 스크립트를 부르지 않으며, `Mode C`에서 이미지가 생성된 것처럼 답하지 않는다.[](source:modeB)[](source:modeC)

@answer scope="design/garden-skills/gpt-image-2 · 원본 파일 103개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source fm title="frontmatter: name·description" path=design/garden-skills/gpt-image-2/SKILL.md lines=1:4
@source modes title="check-mode.js와 Mode A·B·C 판정 규칙" path=design/garden-skills/gpt-image-2/SKILL.md lines=20:82
@source modeB title="Mode B 호스트 에이전트 도구 위임 규칙" path=design/garden-skills/gpt-image-2/SKILL.md lines=42:58
@source modeC title="Mode C Advisor 모드 프롬프트 출력 규칙" path=design/garden-skills/gpt-image-2/SKILL.md lines=59:69
@source env title="환경 변수 탐색 순서와 기본값" path=design/garden-skills/gpt-image-2/SKILL.md lines=100:118
@source out title="기본 출력 디렉터리와 파일명 규칙" path=design/garden-skills/gpt-image-2/SKILL.md lines=119:148
@source psave title="모드별 프롬프트·이미지 저장 규칙" path=design/garden-skills/gpt-image-2/SKILL.md lines=149:171
@source idx title="템플릿 색인과 기술 다이어그램 비트맵 주의" path=design/garden-skills/gpt-image-2/SKILL.md lines=249:454
@source wf title="8단계 모드 인식 프롬프트 작업 흐름" path=design/garden-skills/gpt-image-2/SKILL.md lines=455:473
@source rules title="공통·Mode A 제약과 질문 조건" path=design/garden-skills/gpt-image-2/SKILL.md lines=474:499
@source js-chk title="check-mode.js truthy 판정 구현" path=design/garden-skills/gpt-image-2/scripts/check-mode.js lines=7:35
@source js-gen title="generate.js generations 호출과 저장" path=design/garden-skills/gpt-image-2/scripts/generate.js lines=134:185
@source js-edit title="edit.js multipart edits 호출과 마스크 처리" path=design/garden-skills/gpt-image-2/scripts/edit.js lines=162:219
@source js-shared title="환경 파일 병합과 ASCII slugify 구현" path=design/garden-skills/gpt-image-2/scripts/shared.js lines=32:95
@source pw-ref title="JSON 템플릿 작성 규범과 사례 출처 언급" path=design/garden-skills/gpt-image-2/references/prompt-writing.md lines=15:40
@source pw-src title="참조 사례 파일 경로(미포함)" path=design/garden-skills/gpt-image-2/references/prompt-writing.md lines=711:713
@source readme-cnt title="README의 18개 분류·79개 템플릿 표기" path=design/garden-skills/gpt-image-2/README.md lines=17:20
@source wde-call title="web-design-engineer의 gpt-image-2 호출 조건" path=design/garden-skills/web-design-engineer/references/design-calibration.md lines=132:132

## 어떻게 동작하나 {#flow span=12}

에이전트는 먼저 환경 탐지 스크립트로 실행 모드를 판별한 뒤, 작업 분류에 맞는 단일 템플릿만 읽어 변수를 채우고 모드별 경로로 실행한다.[](source:modes)[](source:wf)

@workflow id=flow-diagram title="gpt-image-2 흐름"
| lane detect | 모드 판별 |
| lane select | 템플릿·변수 확인 |
| lane prompt | 프롬프트 조립 |
| lane deliver | 모드별 실행 |
| lane out | 결과 보고 |
| chkmode | 실행 모드 판별 | external | detect | source:modes |
| askkey | 키 입력·전환 질문 | security | detect | source:modes |
| clarify | 생성·편집과 변수 확인 | backend | select | source:wf |
| render | 템플릿 변수 채우기 | backend | prompt | source:wf |
| runA | Mode A API 실행 | backend | deliver | source:wf |
| runB | Mode B 호스트 위임 | backend | deliver | source:modeB |
| runC | Mode C 프롬프트 | backend | deliver | source:modeC |
| report | 모드·경로 보고 | external | out | source:wf |
| chkmode > askkey | 키 없음 | dashed |
| askkey > clarify | 전환 | dashed |
| chkmode > clarify | 확정 | emphasis |
| clarify > render | |
| render > runA | Mode A | emphasis |
| render > runB | Mode B |
| render > runC | Mode C |
| runA > runB | 실패 | dashed |
| runA > runC | 실패 | dashed |
| runA > report | | emphasis |
| runB > report | |
| runC > report | |

@steps id=flow-steps
| s-chkmode | 실행 모드 판별 | **입력** 현재 환경 변수와 도구 목록 · **실행** `node skills/gpt-image-2/scripts/check-mode.js` · **출력** `A`, `A?`, `B-or-C` 판정. **처리** 가장 먼저 탐지 스크립트를 실행하고, `B-or-C`이면 호스트 에이전트 도구 유무로 `Mode B`와 `Mode C`를 가른다.[](source:modes)[](source:js-chk) **다음** `B`인지 `C`인지 불분명하면 추측하지 않고 사용자에게 물어본다.[](source:modes) | flow-diagram | chkmode |
| s-askkey | 키 입력·전환 질문 | **입력** `mode = A?` 결과 · **출력** API 키 요청 또는 `Mode B`·`Mode C` 전환 확인. **처리** `ENABLE_GARDEN_IMAGEGEN`은 켜졌으나 `OPENAI_API_KEY`가 없으면 먼저 키를 묻거나 하위 모드로 내릴지 확인한다.[](source:modes)[](source:js-chk) | flow-diagram | askkey |
| s-clarify | 생성·편집과 변수 확인 | **입력** 사용자 요청과 선택된 분류 · **참조** `references/<category>/<template>.md` · **출력** 단일 템플릿과 확정된 핵심 입력. **처리** 생성·편집 구분 후 색인에서 가장 맞는 템플릿 하나만 읽고, 목표·원본 이미지·핵심 문구 등 누락 변수를 콕 집어 묻는다.[](source:idx)[](source:wf)[](source:rules) **다음** `references/` 전체를 한꺼번에 읽지 않는다.[](source:idx)[](source:wf) | flow-diagram | clarify |
| s-render | 템플릿 변수 채우기 | **입력** 템플릿 파일과 사용자 답변 · **참조** `references/prompt-writing.md` · **출력** 평탄화된 JSON 또는 구조화 자연어 프롬프트 문자열. **처리** `{argument ...}` 자리에 사용자 값이나 `default` 값을 넣고, 허용 시 부차 요소를 보완한다.[](source:wf) **다음** 사용자가 요구하지 않으면 `SKILL.md`의 모드 설명을 프롬프트에 넣지 않는다.[](source:rules) | flow-diagram | render |
| s-runA | Mode A API 실행 | **입력** 완성된 프롬프트(편집 시 원본·마스크 경로 포함) · **실행** `node skills/gpt-image-2/scripts/generate.js` 또는 `node skills/gpt-image-2/scripts/edit.js` · **출력** `garden-gpt-image-2/prompt/*.md`와 `garden-gpt-image-2/image/*.png`. **처리** 프롬프트를 저장한 뒤 OpenAI 호환 `/images/generations`(JSON) 또는 `/images/edits`(multipart)를 호출해 이미지를 저장한다.[](source:wf)[](source:js-gen)[](source:js-edit) **다음** 401·네트워크·할당량 오류로 실패하면 오류를 알리고 `Mode B`나 `Mode C`로 전환할지 묻는다.[](source:modes) | flow-diagram | runA |
| s-runB | Mode B 호스트 위임 | **입력** 완성된 프롬프트 · **출력** 호스트 이미지 도구 호출 결과와 선택적 프롬프트 파일. **처리** 로컬 스크립트를 부르지 않고 호스트 에이전트가 가진 `image_generation`·`dalle`·이미지 MCP 등에 프롬프트를 넘긴다.[](source:modeB)[](source:wf) **다음** 재사용을 위해 `garden-gpt-image-2/prompt/` 저장을 권장하되 사용자가 사양하면 건너뛴다.[](source:psave) | flow-diagram | runB |
| s-runC | Mode C 프롬프트 | **입력** 완성된 프롬프트 · **출력** `garden-gpt-image-2/prompt/<task-slug>-<timestamp>.md`와 대화 출력문. **처리** 프롬프트를 반드시 파일로 남기고 전문을 채팅에 출력한 뒤, 실행 가능한 외부 이미지 도구 안내를 덧붙인다.[](source:modeC)[](source:psave) | flow-diagram | runC |
| s-report | 모드·경로 보고 | **입력** 실행 결과 · **출력** 한 문장 요약. **처리** 현재 적용된 모드, 프롬프트 저장 위치, 생성 이미지 경로(있는 경우)를 한 문장으로 알린다.[](source:wf) | flow-diagram | report |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자가 포스터·UI 시안·제품 사진·인포그래픽·학술 도표·기술 다이어그램 생성이나 이미지 편집을 요청하면 모델이 `description`을 보고 켠다. 호출 제한 필드는 없다.[](source:fm) |
| 성격 | 17개 분야 93개 템플릿(문서상 80+·79개)을 바탕으로 프롬프트를 구조화하고, 실행 환경에 맞춰 직접 호출·호스트 위임·프롬프트 제공을 가르는 분기형 이미지 생성 스킬이다.[](source:fm)[](source:modes)[](source:readme-cnt) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| web-design-engineer {#rel-r10} | **이 스킬** | 호출 | `web-design-engineer`가 새 그린필드·리뉴얼 시각 탐색에서 선택적 이미지 우선 분기를 탈 때, 이 스킬이 가용하면 구조화된 이미지 생성에 사용한다(사용자 개입 없음). 기다리거나 강제하지는 않는다.[](source:wde-call) |

@architecture id=relation-map title="gpt-image-2와 이어지는 스킬"
| wde | web-design-engineer | backend |
| self | gpt-image-2(이 스킬) | backend |
| wde > self | 호출 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 모드 3종 분기, 환경 변수, 저장·명명 규칙, 18개 항목 색인을 담는다 | 스킬이 켜지면 읽는다 | 모든 단계 |
| `scripts/check-mode.js` | 환경 변수와 키를 읽어 `A`·`A?`·`B-or-C`를 판정한다 | 모든 작업의 첫 단계에서 실행한다[](source:modes) | 실행 모드 판별 |
| `scripts/generate.js` | 프롬프트를 저장하고 `/images/generations` JSON 요청으로 PNG를 만든다 | `Mode A`에서 텍스트 생성 시 실행한다[](source:wf)[](source:js-gen) | Mode A API 실행 |
| `scripts/edit.js` | 원본·선택 마스크 이미지를 multipart로 `/images/edits`에 보내 편집한다 | `Mode A`에서 이미지 편집 시 실행한다[](source:wf)[](source:js-edit) | Mode A API 실행 |
| `scripts/shared.js`, `scripts/package.json` | `.env`·`.gateway.env` 병합, HTTP 호출, `slugify`, 타임스탬프 저장을 담당한다 | `check-mode.js`·`generate.js`·`edit.js`가 내부 임포트한다 | 실행 모드 판별 · Mode A API 실행 |
| `references/prompt-writing.md` | JSON 골격, `{argument}` 문법, 핵심·기본·무작위 변수 분류 규범을 담는다 | 새 템플릿 설계나 필드 전략 판단이 필요할 때 읽는다[](source:idx)[](source:pw-ref) | 템플릿 변수 채우기 |
| `references/<17개 분야>/<93개 템플릿>.md` | 분야별 메인·변형 프롬프트 JSON과 질문 우선순위를 제공한다 | 작업 분류에 맞는 단일 템플릿 파일 1개만 읽는다[](source:idx)[](source:wf) | 생성·편집과 변수 확인 · 템플릿 변수 채우기 |
| `README.md`, `README.zh-CN.md`, `manifest.json` | 사람용 케이스 갤러리 안내와 패키지 메타데이터(`1.0.4`)를 담는다 | 에이전트 실행 흐름에서는 읽지 않는다 | 흐름 밖: 사용자 문서·메타 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 작업을 시작할 때 | 강제: 먼저 `check-mode.js`를 실행해 모드를 확인하며, `B`와 `C` 구분이 안 되면 사용자에게 질문한다 | [](source:modes)[](source:wf) |
| `Mode B`·`Mode C` 실행 시 | 금지: `generate.js`와 `edit.js` 호출을 금지하며, `Mode C`에서는 이미지가 나온 것처럼 보고하지 않는다 | [](source:modeB)[](source:modeC) |
| 템플릿 탐색 시 | 금지: `references/` 전체를 한꺼번에 읽지 않고 색인에서 가장 맞는 파일 1개만 읽는다 | [](source:idx)[](source:wf) |
| 핵심 정보 누락(목표·원본 이미지·핵심 문구·충돌 목표) | 멈추고 템플릿 필드 단위로 구체 질문을 하며, 부차 요소는 기본값이나 합리적 보완으로 채운다 | [](source:rules) |
| 프롬프트 생성 및 저장 규칙 | `SKILL.md` 모드 안내 문구 복사를 금지한다. `Mode A`·`Mode C`는 프롬프트 파일 저장이 필수이며 `Mode B`는 권장이다 | [](source:psave)[](source:rules) |
| 학술·기술 다이어그램 템플릿 사용 시 | `academic-figures/`는 수치·등고선·공식 임의 지어내기를 엄격히 금지한다. `technical-diagrams/`는 편집 가능한 SVG가 아니라 PNG 비트맵을 낸다 | [](source:idx) |
| 환경 변수 읽기와 진릿값 판정 | CLI 인수 → `process.env` → `.env` → `.gateway.env` → `~/.gateway.env` 순으로 읽되 기존 설정을 덮어쓰지 않는다. 코드는 `SKILL.md`의 `1`/`true`/`yes`/`on` 외에 `y`도 참으로 본다 | [](source:env)[](source:js-chk)[](source:js-shared) |
| 비ASCII 프롬프트의 자동 파일명 생성 | `slugify()`가 영숫자 외 문자를 지우므로 한글·중국어 프롬프트는 `--prompt-output`·`--image`·`--output`을 안 주면 `generated-image` 같은 기본 이름으로 떨어진다(코드 확인) | [](source:js-shared) |
| 문서 표기 불일치 | `SKILL.md`는 `80+`개·18대분류, `README.md`는 79개로 적지만 실제 `references/`에는 하위 폴더 17개(방법론 문서 포함 18항목)와 템플릿 93개가 있다. `prompt-writing.md`가 가리키는 원천 파일은 저장소에 없다 | [](source:fm)[](source:readme-cnt)[](source:pw-src) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 17개 분야 93개 템플릿 카탈로그 — `생성과 변수 확인` · 분야별 템플릿 목록, JSON 스키마 5.1~5.9, 분야별 질문 예시를 개요에서 뺐다.
- `generate.js`·`edit.js` CLI 플래그와 API 규격 — `Mode A API 실행` · `--size`, `--quality`, `--background`, `--input-fidelity`, `--output-format` 등 전체 옵션과 `b64_json`/`url` 파싱 구현이 개요 밖에 있다.

@callout level=open-question title="확인하지 못한 것"
| `references/` 하위 17개 폴더의 93개 템플릿 중 3개(`background-replacement.md`, `live-commerce-ui.md`, `system-architecture.md`)만 전문을 읽고 나머지 90개는 구조·개수만 확인했다. |
| `prompt-writing.md` 713줄이 언급한 `skills/gpt-image-2/100+GPT-Image2提示词.md` 파일은 이 저장소에 포함되지 않았다. |

읽은 원본: 텍스트 파일 103개 중 12개 전체 읽기(`SKILL.md`, `manifest.json`, `README.md`, `scripts/` 5개, `references/prompt-writing.md`, 표본 템플릿 3개; 외부 참조 `web-design-engineer/references/design-calibration.md` 추가 대조). 표본 확인: `references/` 하위 템플릿 90개(93개 중 3개 읽기). 제외: `README.zh-CN.md` 1개(`README.md`의 중국어판), `*.ko.md` 번역본.
