# build-design — Figma나 시안 이미지를 기존 토큰·컴포넌트로 구현하고 비교한다 {#overview}

`build-design`은 에이전트가 디자인 파일이나 이미지를 원본에서 직접 읽고, 프로젝트에 이미 있는 토큰과 컴포넌트만으로 구현한 뒤, 완성 화면을 디자인과 요소별로 대조해 보고하게 하는 스킬이다.[](source:bd-intro)

- Figma 링크나 시안 이미지를 받아 기존 코드베이스에 UI를 구현할 때 켠다. 입력이 Figma인지 이미지인지에 따라 값 추출 도구와 정밀도(정확값 vs 추정 배율)가 갈린다.[](source:bd-fm)[](source:bd-s1)
- 결과는 시안에 맞춘 UI 코드, 요소별 `deviation(디자인과 다르게 만든 부분)` 표, `Unwired`·누락 상태·도메인 충돌 목록이다.[](source:bd-s3)[](source:bd-s5)
- 디자인이 도메인 규칙을 어길 때 `better-accessibility` 등 소유 스킬을 참고해 충돌을 보고하고, 구현 뒤 리뷰는 대안 관계인 `interface-review`를 안내한다.
- 임의 값·새 토큰·없는 상태 추가, 인접 파일 수정, 도구 없는 추측 구현, 비교 없는 일치 보고는 모두 금지한다.[](source:bd-s1)[](source:bd-s2)[](source:bd-s3)[](source:bd-s4)

@answer scope="design/jakubkrehel/build-design · 원본 파일 3개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source bd-fm title="frontmatter: 이름과 description" path=design/jakubkrehel/build-design/SKILL.md lines=1:4
@source bd-oa title="agents/openai.yaml: UI 표시 정보" path=design/jakubkrehel/build-design/agents/openai.yaml lines=1:3
@source bd-intro title="원본 기준, deviation 원칙, 도메인 스킬 경계" path=design/jakubkrehel/build-design/SKILL.md lines=6:12
@source bd-s1 title="1단계: Figma MCP 또는 이미지에서 디자인 읽기" path=design/jakubkrehel/build-design/SKILL.md lines=14:22
@source bd-s2 title="2단계: 프로젝트 토큰·컴포넌트 매핑과 반올림 중단 기준" path=design/jakubkrehel/build-design/SKILL.md lines=24:39
@source bd-s3 title="3단계: 디자인에 나온 범위·상태만 구현" path=design/jakubkrehel/build-design/SKILL.md lines=41:45
@source bd-s4 title="4단계: 너비별 렌더링 대조와 수정 반복" path=design/jakubkrehel/build-design/SKILL.md lines=47:53
@source bd-s5 title="5단계: 대조표·미연결·누락 상태·도메인 충돌 보고" path=design/jakubkrehel/build-design/SKILL.md lines=55:69
@source bd-fin title="마감 전 9개 오류 점검표" path=design/jakubkrehel/build-design/SKILL.md lines=71:83
@source bd-fig title="Figma 링크 파싱, MCP 호출, sparse 처리, 신뢰 우선순위" path=design/jakubkrehel/build-design/figma.md lines=1:29
@source ba-own title="better-accessibility의 도메인 경계" path=design/jakubkrehel/better-accessibility/SKILL.md lines=12:12
@source ir-fm title="interface-review의 description과 수동 호출 정책" path=design/jakubkrehel/interface-review/SKILL.md lines=1:5

## 어떻게 동작하나 {#flow span=12}

절차형이다. Figma MCP나 이미지 비율로 값을 추출해 기존 토큰·컴포넌트에 매핑하고, 브라우저로 너비별 차이를 없앨 때까지 비교·수정을 반복한다.[](source:bd-s1)[](source:bd-s2)[](source:bd-s4)

@workflow id=flow-diagram title="build-design 흐름"
| lane read | 디자인 읽기 |
| lane build | 매핑·구현 |
| lane verify | 대조·보고 |
| source | Figma 링크인가? | backend | read | source:bd-s1 |
| figma | Figma 값 읽기 | backend | read | source:bd-s1 |
| image | 이미지 배율 추정 | backend | read | source:bd-s1 |
| map | 토큰·컴포넌트 매핑 | backend | build | source:bd-s2 |
| impl | 시안 범위만 구현 | backend | build | source:bd-s3 |
| browser | 브라우저 있나? | backend | verify | source:bd-s4 |
| compare | 너비별 대조·수정 | backend | verify | source:bd-s4 |
| match | 수정할 차이 남았나? | backend | verify | source:bd-s4 |
| report | 대조표 보고·정지 | backend | verify | source:bd-s5 |
| source > figma | 예 |
| source > image | 아니오 |
| figma > map | |
| image > map | |
| map > impl | |
| impl > browser | |
| browser > compare | 예 |
| browser > report | 아니오 |
| compare > match | |
| match > compare | 예 |
| match > report | 아니오 |

@steps id=flow-steps
| s-source | Figma 링크인가? | **입력** 디자인 링크 또는 이미지 · **출력** 디자인 읽기 경로 결정. **처리** 입력이 Figma 링크인지 내보낸 이미지인지 가르고, 같은 화면의 다른 너비 프레임은 여러 브레이크포인트를 가진 하나로 묶는다.[](source:bd-s1) | flow-diagram | source |
| s-figma | Figma 값 읽기 | **입력** Figma URL(`fileKey`·`node-id`) · **참조** `figma.md` · **실행** `get_metadata`, `get_design_context`, `get_variable_defs`, `get_screenshot` · **출력** 프레임별 스크린샷과 정확한 수치·변수·컴포넌트. **처리** `figma` 도구와 동반 스킬을 먼저 확인하고, 변수·`Code Connect`·`auto layout` 기준으로 정확한 값을 읽는다.[](source:bd-s1)[](source:bd-fig) **다음** 미인증·도구 부재 시 멈추고 사용자에게 요청한다. `node-id`가 없으면 `get_metadata`로 프레임을 확인하고, `sparse` 응답이면 자식 노드를 병렬로 읽는다.[](source:bd-s1)[](source:bd-fig) | flow-diagram | figma |
| s-image | 이미지 배율 추정 | **입력** 스크린샷 또는 내보낸 이미지 · **출력** 가정한 배율과 비율 기반 추정치·대상 프레임 목록. **처리** 이미지에서 읽은 크기를 가정한 배율 기준의 추정치로 기록하고, Figma 링크가 있는지 사용자에게 묻는다.[](source:bd-s1) | flow-diagram | image |
| s-map | 토큰·컴포넌트 매핑 | **입력** 디자인 값·컴포넌트·프로젝트 토큰·컴포넌트 · **출력** 기존 토큰·컴포넌트 매핑안과 `Unwired` 범위. **처리** 프로젝트의 토큰·컴포넌트를 먼저 읽고 6가지 규칙으로 매핑하며, 백엔드가 없으면 props 기반 `Unwired` UI로 둔다.[](source:bd-s2)[](source:bd-fig) **다음** 새 토큰·임의 값 추가를 금지하며, 반올림 차이가 `2px` 초과거나 색 단계가 달라지면 멈추고 사용자에게 묻는다.[](source:bd-s2) | flow-diagram | map |
| s-impl | 시안 범위만 구현 | **입력** 매핑안과 대상 프레임·상태 · **출력** 디자인 범위로 제한된 코드 변경분. **처리** 시안의 프레임·브레이크포인트·상태만 구현하고, 미표기 상태와 인접 파일·문구·아이콘은 건드리지 않는다.[](source:bd-s3) **다음** 도메인 규칙 충돌 시에도 임의로 고치지 않고 시안대로 만든 뒤 충돌을 보고한다.[](source:bd-intro)[](source:bd-fin) | flow-diagram | impl |
| s-browser | 브라우저 있나? | **입력** 로컬 실행 주소와 대상 프레임 너비 목록 · **출력** 브라우저 비교 진행 또는 미검증 전달 결정. **처리** 열려 있는 브라우저 도구로 각 프레임 너비를 스크린샷으로 비교할 수 있는지 확인한다.[](source:bd-s4) | flow-diagram | browser |
| s-compare | 너비별 대조·수정 | **입력** 프레임별 너비로 렌더링한 화면 스크린샷과 디자인 스크린샷 · **출력** 요소별 수치 차이 목록과 수정된 코드. **처리** 각 프레임 너비에서 구현 화면을 디자인 스크린샷 옆에 두고 1단계에서 모은 속성(간격·크기·반경·색·글꼴·컴포넌트)을 요소별로 대조해 본인이 만든 불일치를 고친다.[](source:bd-s4) | flow-diagram | compare |
| s-match | 수정할 차이 남았나? | **입력** 재비교 결과 · **출력** 재비교 또는 보고 단계 이동 결정. **처리** 에이전트가 만든 불일치가 모두 사라지고 반올림이나 사용자에게 물을 사항만 남았는지 판정한다.[](source:bd-s4) | flow-diagram | match |
| s-report | 대조표 보고·정지 | **입력** 비교 결과, `Unwired`, 누락 상태, 도메인 충돌 · **출력** 4열 대조표와 요약 목록. **처리** `Matches`·`Rounded to token`·`Deviates` 표와 해당 목록, 실행 URL·비교 너비를 보고하고 멈춘다.[](source:bd-s5) **다음** 브라우저가 없었으면 비교를 미검증으로 밝히고 로컬 URL과 확인할 너비만 넘긴다.[](source:bd-s4) | flow-diagram | report |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령은 원문에 명시 없음. 모델이 `description`을 보고 켠다. 호출 제한 필드는 frontmatter와 `agents/openai.yaml`에 없다.[](source:bd-fm)[](source:bd-oa) |
| 성격 | Figma·디자인 이미지를 기존 프로젝트 토큰과 컴포넌트로 구현하고 대조 보고하는 절차형 스킬. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#rel-r84} | `better-accessibility` | 참고 | 디자인이 도메인 규칙(대비·포커스·시맨틱·타입·배치·색상·카피·표면·모션)과 충돌하면 시안대로 구현한 뒤 소유 스킬(`better-accessibility` 등)을 밝히고 충돌을 보고한다(사용자 개입 없음).[](source:bd-intro)[](source:bd-s5)[](source:ba-own) |
| **이 스킬** {#rel-r85} | `interface-review` | 대안 | 역할 경계: 구현 완료 후 변경분을 리뷰할 때는 수동 호출 스킬인 `interface-review`를 쓴다(사용자 호출 필요).[](source:bd-intro)[](source:ir-fm) |

@architecture id=relation-map title="build-design과 이어지는 스킬"
| self | build-design(이 스킬) | backend |
| ba | better-accessibility | backend |
| ir | interface-review | backend |
| self > ba | 참고 | |
| self > ir | 대안 | dashed |

@code source=bd-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 5단계 구현·대조 절차, 매핑표, 보고 형식, 9개 마감 점검표를 담은 본문 | 스킬이 켜질 때 읽는다 | Figma 링크인가?; Figma 값 읽기; 이미지 배율 추정; 토큰·컴포넌트 매핑; 시안 범위만 구현; 브라우저 있나?; 너비별 대조·수정; 수정할 차이 남았나?; 대조표 보고·정지 |
| `figma.md` | Figma URL·branch·`node-id` 규칙, 4개 MCP 도구 호출법, `sparse` 처리, 신뢰 우선순위 4종 | 1단계에서 입력이 Figma 링크일 때 읽는다 | Figma 값 읽기; 토큰·컴포넌트 매핑 |
| `agents/openai.yaml` | 호스트 UI 표시 이름(`Build Design`)과 짧은 설명 | 호스트가 UI 표시 정보를 읽을 때 사용한다 | 원문에 명시 없음 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| `figma` 도구 검색 결과 미인증 또는 도구 부재 | 인증 또는 연결을 사용자에게 요청하고 멈춘다. 기억이나 추측으로 구현하지 않는다 | [](source:bd-s1) [](source:bd-fin) |
| Figma 링크에 `node-id`가 없음 | `get_metadata`로 프레임 목록을 먼저 뽑아 어느 프레임을 구현할지 확인한 뒤 읽는다 | [](source:bd-fig) |
| 디자인 컨텍스트에 `sparse` 표시 | 요약으로 보고, 적힌 보이는 자식 노드를 병렬로 읽어 값을 채운다 | [](source:bd-fig) |
| Figma 에셋 URL과 스크린샷 | 만료되는 Figma URL은 코드에 남기지 말고 내려받아 저장한다. 비교용 스크린샷은 빌드 에셋으로 쓰지 않는다 | [](source:bd-fig) |
| 임의 값(`w-[343px]`, raw hex) 또는 새 토큰·변형·컴포넌트 파일 추가 | 금지. 기존 토큰·컴포넌트에 매핑하거나, 대응 컴포넌트가 없는 인스턴스·일회성 레이어는 일반 마크업으로 인라인한다 | [](source:bd-s2) [](source:bd-fin) |
| 토큰 반올림 차이가 간격·크기 `2px` 초과 또는 색 단계 변경 | 멈추고 사용자에게 어느 방향으로 갈지 묻는다 | [](source:bd-s2) |
| 시안에 없는 상태(호버·로딩·에러)와 인접 파일·카피·아이콘 | 새로 만들거나 고치지 않는다. 없는 상태는 기존 컴포넌트 기본값에 맡기고 `Missing states`로 보고한다 | [](source:bd-s3) [](source:bd-fin) |
| 디자인이 도메인 규칙과 충돌함 | 임의로 규칙을 우선해 시안을 바꾸지 말고, 디자인대로 둔 채 소유 스킬과 충돌을 보고한다 | [](source:bd-intro) [](source:bd-fin) |
| 브라우저 없음 | 비교를 실행하지 않고, 로컬 URL과 확인할 너비만 넘기며 미검증으로 보고한다 | [](source:bd-s4) [](source:bd-fin) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- Figma 링크·MCP 4종·신뢰 우선순위 규칙 — Figma 값 읽기 · `fileKey`·`branchKey`·`node-id` 변환과 `Code Connect`·`auto layout` 우선순위를 담았다.
- 6가지 디자인-코드 매핑 규칙과 9개 마감 점검표 — 토큰·컴포넌트 매핑 · 바운드 변수·원시값·컴포넌트 부재 처리 기준과 사후 점검 항목을 정리했다.

@callout level=open-question title="확인하지 못한 것"
| `SKILL.md` 12줄이 모션 소유 스킬로 언급한 `better-motion`은 저장소에 없어 확인하지 못했다(`범위 밖`). |
| Figma MCP 도구(`get_design_context`, `get_variable_defs`, `get_metadata`, `get_screenshot`)의 실제 서버 구현과 동반 Figma 스킬은 스킬 폴더 밖 도구라 확인하지 못했다. |

읽은 원본: 텍스트 파일 3개. 제외: 없음.
