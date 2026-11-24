# break — 컴포넌트 하나를 최악 시나리오로 임시 페이지에 그려 깨짐을 찾는다 {#overview}

`break`는 에이전트가 컴포넌트 하나를 선택해 실제 도달 가능한 최악 시나리오들을 임시 페이지 한 곳에 한꺼번에 렌더링하고, 눈으로 보이는 깨짐만 관찰해 보고하게 하는 스킬이다.[](source:bk-intro)

- 사용자가 컴포넌트를 지정해 스트레스 테스트를 직접 호출할 때만 켜지며, 요청이 여러 컴포넌트에 걸치면 후보를 나열해 하나를 고르게 한다.[](source:bk-fm)[](source:bk-oa)[](source:bk-s1)
- 결과는 시나리오별로 1열에 렌더링한 앱 내부 임시 페이지(브라우저 확인 시 깨짐 메모 포함)와 시나리오·관찰·소유 스킬 표다.[](source:bk-intro)[](source:bk-s3)[](source:bk-s5)
- 깨짐 보고 시 고칠 도메인 스킬(`better-typography` 등)에 결과를 귀속한다. `afk`·`state-machine`·`better-interface`·`interface-review`·`variant`·`break-ui`와는 대안 관계다.
- 예측 지적, 자체 판정, 무단 수정, 가짜 스타일·뷰포트 리사이즈는 모두 금지한다.[](source:bk-s3)[](source:bk-s4)[](source:bk-s5)

@answer scope="design/jakubkrehel/break · 원본 파일 3개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source bk-fm title="frontmatter: 이름, description, 모델 호출 차단" path=design/jakubkrehel/break/SKILL.md lines=1:5
@source bk-oa title="agents/openai.yaml: 암묵 호출 차단 정책" path=design/jakubkrehel/break/agents/openai.yaml lines=1:5
@source bk-intro title="목표, 역할 경계, 단일 패스 원칙" path=design/jakubkrehel/break/SKILL.md lines=7:15
@source bk-s1 title="1단계: 단일 컴포넌트 범위 지정" path=design/jakubkrehel/break/SKILL.md lines=17:21
@source bk-s2 title="2단계: 컴포넌트 기준 시나리오 추론" path=design/jakubkrehel/break/SKILL.md lines=23:29
@source bk-s3 title="3단계: 임시 harness 페이지 구현" path=design/jakubkrehel/break/SKILL.md lines=31:41
@source bk-s4 title="4단계: 한 번 관찰과 브라우저 분기" path=design/jakubkrehel/break/SKILL.md lines=43:49
@source bk-s5 title="5단계: 깨짐 표 보고 후 정지" path=design/jakubkrehel/break/SKILL.md lines=51:64
@source bk-s6 title="6단계: 페이지 유지와 요청 시 삭제" path=design/jakubkrehel/break/SKILL.md lines=66:68
@source bk-fin title="마감 전 3가지 오류 점검표" path=design/jakubkrehel/break/SKILL.md lines=70:76
@source bk-scen title="시나리오 6축, 단서와 owner 스킬 매핑" path=design/jakubkrehel/break/scenarios.md lines=1:78
@source bui-fm title="break-ui의 description" path=design/emilkowalski/break-ui/SKILL.md lines=1:4
@source afk-own title="afk의 역할 경계 안내" path=design/jakubkrehel/afk/SKILL.md lines=11:11
@source sm-own title="state-machine의 역할 경계 안내" path=design/jakubkrehel/state-machine/SKILL.md lines=11:11
@source var-own title="variant의 역할 경계 안내" path=design/jakubkrehel/variant/SKILL.md lines=11:11
@source bi-fm title="better-interface의 description" path=design/jakubkrehel/better-interface/SKILL.md lines=1:4
@source bt-fm title="better-typography의 description" path=design/jakubkrehel/better-typography/SKILL.md lines=1:4

## 어떻게 동작하나 {#flow span=12}

절차형이다. 컴포넌트 하나를 정해 시나리오를 추론하고 임시 페이지에 그린 뒤, 브라우저가 있으면 한 번 훑어보고 표로 보고하며, 브라우저가 없으면 관찰 없이 URL과 시나리오 목록만 넘긴다.[](source:bk-intro)[](source:bk-s4)

@workflow id=flow-diagram title="break 흐름"
| lane prep | 범위·시나리오 준비 |
| lane build | harness 페이지 구성 |
| lane check | 관찰·보고·정리 |
| scope | 컴포넌트 확정 | backend | prep | source:bk-s1 |
| infer | 시나리오 추론 | backend | prep | source:bk-s2 |
| harness | harness 작성 | backend | build | source:bk-s3 |
| browser | 브라우저 있나? | backend | check | source:bk-s4 |
| look | 한 번 관찰·표시 | backend | check | source:bk-s4 |
| report | 표 보고·정지 | backend | check | source:bk-s5 |
| urlonly | URL만 전달 | external | check | source:bk-s4 |
| cleanup | 유지·요청 시 삭제 | backend | check | source:bk-s6 |
| scope > infer | |
| infer > harness | |
| harness > browser | |
| browser > look | 예 |
| browser > urlonly | 아니오 |
| look > report | |
| report > cleanup | 완료 후 |
| urlonly > cleanup | 확인 후 |

@steps id=flow-steps
| s-scope | 컴포넌트 확정 | **입력** 사용자 요청과 대상 후보 · **출력** 컴포넌트 요약 한 문장. **처리** 에이전트가 컴포넌트 하나를 정해 입력·출력·위치를 한 문장으로 요약한다.[](source:bk-s1) **다음** 요청이 여러 컴포넌트에 걸치면 후보를 나열하고 사용자 선택까지 멈춘다.[](source:bk-s1) | flow-diagram | scope |
| s-infer | 시나리오 추론 | **입력** 컴포넌트의 props·슬롯·상태·데이터 · **참조** `scenarios.md` · **출력** 채택 시나리오·제외 축 목록. **처리** 6개 축의 단서(cue)를 대조해 도달 가능한 시나리오만 고른다.[](source:bk-s2)[](source:bk-scen) **다음** 구현 전 채택·제외 이유를 각 한 줄로 먼저 적는다.[](source:bk-s2) | flow-diagram | infer |
| s-harness | harness 작성 | **입력** 시나리오 목록과 실제 컴포넌트 · **출력** 앱 내부 임시 라우트와 fixture(`harness 페이지`). **처리** 원본 컴포넌트를 그대로 두고 시나리오마다 라벨을 달아 1열로 그린다.[](source:bk-s3) **다음** Next.js 등 서버 경계가 있으면 `"use client"` 페이지로 써서 fixture 데이터 유실을 막는다.[](source:bk-s3) | flow-diagram | harness |
| s-browser | 브라우저 있나? | **입력** 실행 중인 harness 페이지 URL · **출력** 관찰 진행 또는 건너뜀 결정. **처리** 이미 열려 있는 브라우저 도구가 있는지 확인하고, 새 브라우저 실행 없이 분기한다.[](source:bk-s4) | flow-diagram | browser |
| s-look | 한 번 관찰·표시 | **입력** 브라우저로 연 harness 페이지 · **출력** 깨짐 메모가 달린 harness 페이지. **처리** 페이지를 한 번 훑어 눈에 보인 깨짐만 한 번의 편집으로 라벨 아래에 적는다.[](source:bk-s4) **다음** 뷰포트 크기를 바꾸지 않고 고정 너비 컨테이너로 본다.[](source:bk-fin) | flow-diagram | look |
| s-report | 표 보고·정지 | **입력** 관찰된 깨짐 메모 · **출력** 시나리오·관찰·`owner` 표(또는 `"Everything survived"`). **처리** 깨진 시나리오 순 표에 담당 `owner` 스킬을 적어 보고하고 멈춘다.[](source:bk-s5) **다음** 무단 수정을 금지하며, 수정 요청 시에만 `owner` 규칙대로 고친 뒤 실패 시나리오를 재렌더링한다.[](source:bk-s5) | flow-diagram | report |
| s-urlonly | URL만 전달 | **입력** 임시 페이지 URL과 시나리오 목록 · **출력** URL·시나리오·수동 확인 안내. **처리** 브라우저가 없으면 관찰을 건너뛰고 깨짐 표나 메모 없이 URL과 시나리오만 넘긴다.[](source:bk-s4)[](source:bk-scen) | flow-diagram | urlonly |
| s-cleanup | 유지·요청 시 삭제 | **입력** 사용자의 완료 요청 · **출력** 임시 라우트·fixture 파일 삭제와 깨끗한 diff. **처리** 페이지를 유지하다가 사용자가 끝났다고 말하면 라우트와 fixture 파일을 지우고 잔여물을 검색한다.[](source:bk-s6) | flow-diagram | cleanup |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령(`/break`)으로만 켠다. `disable-model-invocation: true`와 `agents/openai.yaml`의 `allow_implicit_invocation: false`가 모델 자동 호출을 막는다.[](source:bk-fm)[](source:bk-oa) |
| 성격 | 컴포넌트 하나를 최악 시나리오 1열 임시 페이지에 격리 렌더링해 깨짐만 관찰·귀속하는 절차형 스킬. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `break-ui` {#rel-r44} | **이 스킬** | 대안 | 목적(최악 시나리오·데이터로 UI 스트레스 테스트)은 같으나 작성자와 구현 방식(대조 토글 vs 임시 1열 `harness 페이지`)이 다르며 직접 연결은 없다.[](source:bui-fm)[](source:bk-fm) |
| `afk` {#rel-r79} | **이 스킬** | 대안 | 역할 경계: 부재 중 자율 개선은 `afk`, 컴포넌트 스트레스 테스트는 이 스킬(`disable-model-invocation: true`, 수동 호출 필요)을 쓴다.[](source:afk-own) |
| `state-machine` {#rel-r90} | **이 스킬** | 대안 | 역할 경계: 컴포넌트의 제품 상태별 전환·작업은 `state-machine`, 최악 시나리오를 한 페이지에 쌓아 한 번에 보는 테스트는 이 스킬을 쓴다(사용자 선택).[](source:sm-own) |
| **이 스킬** {#rel-r80} | `better-interface` | 대안 | 역할 경계: 기준 대비 코드 리뷰는 `better-interface`와 `interface-review`를 쓴다(직접 호출 없이 사용자 선택).[](source:bk-intro)[](source:bi-fm) |
| **이 스킬** {#rel-r81} | `variant` | 대안 | 역할 경계: 디자인 대안 3종 탐색은 `variant`를 쓴다(사용자 선택).[](source:bk-intro)[](source:var-own) |
| **이 스킬** {#rel-r82} | `state-machine` | 대안 | 역할 경계: 제품 상태별 확인 워크벤치는 `state-machine`을 쓴다(사용자 선택).[](source:bk-intro)[](source:sm-own) |
| **이 스킬** {#rel-r83} | `better-typography` | 결과 전달 | 깨짐 보고 표의 `Owner` 열에 고칠 도메인 스킬(`better-typography` 등)을 적어 결과를 넘기며, 사용자가 수정을 요청할 때만 해당 도메인 스킬 규칙을 적용한다(수정 요청 필요).[](source:bk-s5)[](source:bk-scen)[](source:bt-fm) |

@architecture id=relation-map title="break와 이어지는 스킬"
| bui | break-ui | backend |
| afk | afk | backend |
| sm | state-machine | backend |
| self | break(이 스킬) | backend |
| bi | better-interface | backend |
| var | variant | backend |
| bt | better-typography | backend |
| bui > self | 대안 | dashed |
| afk > self | 대안 | dashed |
| sm > self | 대안 | dashed |
| self > bi | 대안 | dashed |
| self > var | 대안 | dashed |
| self > sm | 대안 | dashed |
| self > bt | 결과 전달 | |

@code source=bk-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 6단계 실행 절차, harness 페이지 제약, 보고 표 형식, 3개 오류 점검표를 담은 본문 | 사용자가 `/break`로 스킬을 켤 때 읽는다 | 컴포넌트 확정; 시나리오 추론; harness 작성; 브라우저 있나?; 한 번 관찰·표시; 표 보고·정지; URL만 전달; 유지·요청 시 삭제 |
| `scenarios.md` | 6개 시나리오 축(내용 길이·모양·수량·컨테이너·상태·환경), 단서(cue), `owner` 스킬 매핑표 | 2단계에서 컴포넌트에 맞는 시나리오를 고를 때 읽는다 | 시나리오 추론; URL만 전달; 표 보고·정지 |
| `agents/openai.yaml` | 호스트 UI 표시 정보와 `allow_implicit_invocation: false` 호출 정책 | 호스트가 호출 정책과 UI 표시 정보를 읽을 때 사용한다 | 원문에 명시 없음 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 요청이 여러 컴포넌트에 걸침(예: 페이지 전체) | 후보 목록을 나열해 사용자에게 하나를 고르게 한 뒤 멈춘다 | [](source:bk-s1) |
| 단서(cue)가 맞지 않는 시나리오 축 | 제외하고 이유를 구현 전 계획에 한 줄로 적는다 | [](source:bk-s2) [](source:bk-scen) |
| harness 페이지의 스타일·데이터·상태 격리 | 자체 폰트·스타일·테마 시뮬레이션·프로브·운영 상태 임포트를 금지한다. 프로덕션 코드도 harness 페이지를 임포트하지 않는다 | [](source:bk-s3) |
| 포커스·hover·다크 모드·브라우저 확대·모션 줄이기 | 페이지에 모의 구현하지 않고, 사용자가 직접 토글·Tab 이동해 보도록 보고서에 안내만 남긴다 | [](source:bk-scen) |
| 브라우저가 없음 | 새 브라우저를 띄우거나 디버깅하지 않고, 깨짐 표·메모 없이 URL과 시나리오 목록만 전달한다 | [](source:bk-s4) |
| 예측된 깨짐(직접 관찰하지 않은 실패) | 지적으로 보고 금지. 눈에 보인 깨짐만 보고한다 | [](source:bk-s4) |
| 도메인 규칙·통과/차단 판정·무단 수정 | 자체 규칙이나 판정을 내리지 않고, 요청 없이 수정하지 않는다 | [](source:bk-s5) |
| 임시 페이지 삭제 | 사용자가 끝났다고 말할 때만 삭제하며, 삭제 후 라우트·fixture 잔여물을 검색해 확인한다 | [](source:bk-s6) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 6개 시나리오 축과 단서(cue)·`owner` 스킬 매핑표 — 시나리오 추론 · 20개 세부 시나리오가 잡는 깨짐과 담당 도메인 스킬 귀속 규칙을 담았다.

읽은 원본: 텍스트 파일 3개. 제외: 없음.
