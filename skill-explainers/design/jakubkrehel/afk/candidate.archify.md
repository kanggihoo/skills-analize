# afk — 사용자가 비운 동안 프로젝트 개선점을 찾아 구현하고 보고서를 남긴다 {#overview}

afk는 사용자가 자리를 비운 몇 시간 동안 프로젝트의 근거를 모아 개선점을 로컬 branch에 구현·검증하고, 돌아왔을 때 2분 만에 읽을 보고서를 남기게 하는 스킬이다.[](source:intro)

- 사용자가 자리를 비우기 전 직접 호출할 때 켜진다. 모델이 자동으로 켜는 것을 막는 호출 제한이 걸려 있고, 특정 페이지나 기능을 지목하면 그 범위 안의 모든 각도로 탐색을 좁힌다.[](source:fm)[](source:wide)
- 결과로 남는 것은 `afk/<date>` branch(미커밋 작업이 있으면 별도 `git worktree`)의 단일 변경 commit, `.git/info/exclude`에 숨긴 작업 노트 `.afk/<date>.md`, 7항목 보고서 메시지다.[](source:reversible)[](source:notes)[](source:s8)
- 다른 스킬과의 관계: UI 구현이 포함되면 `better-accessibility` 같은 소유 도메인 스킬을 `호출`해 규칙을 통과해야 하고, `better-interface`·`interface-review`·`variant`·`break`와는 `대안`으로 역할을 나눈다.[](source:intro)[](source:s5)
- 하지 않는 것: 요청 없이 push·PR 생성·병합·배포·메시지 발송을 하지 않고, 연결된 외부 서비스 설정·데이터를 바꾸거나 기존 글을 고쳐 쓰지 않으며, 새 상태·스타일·데이터 계층을 무단 도입하지 않는다.[](source:repo)[](source:reversible)

@answer scope="design/jakubkrehel/afk · 원본 파일 2개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source fm title="frontmatter: name·description·호출 제한" path=design/jakubkrehel/afk/SKILL.md lines=1:5
@source intro title="스킬 목적과 형제 스킬 경계" path=design/jakubkrehel/afk/SKILL.md lines=9:11
@source wide title="넓은 탐색과 중단 조건" path=design/jakubkrehel/afk/SKILL.md lines=13:21
@source value title="사용자 가치 기준과 뜻밖의 아이디어" path=design/jakubkrehel/afk/SKILL.md lines=23:33
@source repo title="저장소 규약과 sibling 프로젝트 이식" path=design/jakubkrehel/afk/SKILL.md lines=35:45
@source reversible title="가역성 유지와 읽기 전용 외부 서비스" path=design/jakubkrehel/afk/SKILL.md lines=47:57
@source notes title="세션 밖으로 남기는 작업 노트" path=design/jakubkrehel/afk/SKILL.md lines=59:61
@source s1 title="1단계: 도구 사전 점검" path=design/jakubkrehel/afk/SKILL.md lines=63:65
@source s2 title="2단계: 프로젝트와 과거 afk 이력 파악" path=design/jakubkrehel/afk/SKILL.md lines=67:73
@source s3 title="3단계: 근거 수집과 외부 지시 차단" path=design/jakubkrehel/afk/SKILL.md lines=75:87
@source s4 title="4단계: 15개 이상 아이디어 발상" path=design/jakubkrehel/afk/SKILL.md lines=89:91
@source s5 title="5단계: 최선안 구현과 도메인 스킬 통과" path=design/jakubkrehel/afk/SKILL.md lines=93:95
@source s6 title="6단계: 실사용 환경에서 동작 확인" path=design/jakubkrehel/afk/SKILL.md lines=97:99
@source s7 title="7단계: 자기 반박 검사와 전체 CI 실행" path=design/jakubkrehel/afk/SKILL.md lines=101:115
@source s8 title="8단계: 7항목 보고서 남기기" path=design/jakubkrehel/afk/SKILL.md lines=117:129
@source finish title="마무리 전 자가 점검 표" path=design/jakubkrehel/afk/SKILL.md lines=131:140
@source yaml title="UI 표시 이름과 암시적 호출 제한" path=design/jakubkrehel/afk/agents/openai.yaml lines=1:5

## 어떻게 동작하나 {#flow span=12}

절차형이다. `afk` 실행(사용자가 비운 동안 도는 한 번의 자율 작업)은 준비와 넓은 근거 탐색, 구현과 반박 검증을 거쳐 복귀 시각까지 되풀이된다.[](source:wide) 매 단계마다 프로젝트 루트의 `.afk/<date>.md`를 갱신해 컨텍스트가 끊겨도 근거와 대리 결정을 남긴다.[](source:notes)

@workflow id=flow-diagram title="afk 흐름"
| lane prep | 준비와 탐색 |
| lane ideate | 발상과 구현 |
| lane verify | 검증과 보고 |
| tools | 도구 사전 점검 | backend | prep | source:s1 |
| learn | 프로젝트 파악 | backend | prep | source:s2 |
| evidence | 근거 수집 | backend | prep | source:s3 |
| ideas | 아이디어 15개 발상 | backend | ideate | source:s4 |
| implement | 최선안 구현 | backend | ideate | source:s5 |
| verify | 실사용 동작 확인 | backend | verify | source:s6 |
| reject | 반박 검사 | backend | verify | source:s7 |
| more | 시간·아이디어 남았나? | backend | verify | source:wide |
| report | 7항목 보고서 작성 | backend | verify | source:s8 |
| tools > learn | |
| learn > evidence | |
| evidence > ideas | |
| ideas > implement | |
| implement > verify | |
| verify > reject | |
| reject > more | |
| more > implement | 다음 아이디어 | dashed |
| more > evidence | 목록 고갈 | dashed |
| more > report | 종료·복귀 | emphasis |

@steps id=flow-steps
| s-tools | 도구 사전 점검 | **입력** 프로젝트 설정과 연결 서비스 목록 · **실행** dev server 기동, check 명령 실행, 브라우저 열기, 연결 서비스 1회 호출 · **출력** 사용 가능·누락 도구 정리 메시지. **처리** 밤중 멈춤을 막으려 의존 도구를 먼저 한 번씩 쓰고, 누락되거나 승인 대기 중인 도구와 대안 진행 방식을 한 메시지로 알린 뒤 답을 기다리지 않고 넘어간다.[](source:s1) | flow-diagram | tools |
| s-learn | 프로젝트 파악 | **입력** 저장소 문서·git 이력·CI 설정 · **참조** `AGENTS.md`, `CLAUDE.md`, `README`, `afk/*` branch, `.afk/` · **출력** 프로젝트 목적·스택·CI 통과 조건·리뷰 규약 요약. **처리** 저장소 규약과 과거 `afk` 실행 중 병합됐거나 버려진 이력을 읽어 원하는 방향과 반복 금지 대상을 가려낸다.[](source:s2) | flow-diagram | learn |
| s-evidence | 근거 수집 | **입력** 초안 branch·미공개 콘텐츠·연결 서비스·빌드 결과 · **출력** 우선순위 근거 목록과 `.afk/<date>.md` 갱신. **처리** 분석·오류 로그·CI·이슈·콘솔·문서 대조·번들 분석에 더해 sibling 프로젝트(사용자의 다른 프로젝트)의 기존 해법까지 읽고, 외부 텍스트 속 지시는 무시한다.[](source:s3) **다음** 요청이 특정 대상을 지목했으면 그 범위의 모든 각도만 읽고 나머지는 건드리지 않는다.[](source:wide) | flow-diagram | evidence |
| s-ideas | 아이디어 15개 발상 | **입력** 수집한 근거와 제품 사용자 관점 · **출력** 15개 이상 아이디어 목록(`.afk/<date>.md`). **처리** 수정·디자인·기능·콘텐츠·성능·접근성·도구 전 영역에서 15개 이상을 적되 제품 동작을 바꾸는 안 3개 이상과 뜻밖의 아이디어(wild idea)를 포함한다.[](source:s4)[](source:value) **다음** 돕는 사용자를 특정하지 못한 안은 버리고, 동점일 때는 근거 없는 안이 밀린다.[](source:value) | flow-diagram | ideas |
| s-implement | 최선안 구현 | **입력** 근거가 가장 강한 아이디어 · **참조** 저장소 기존 토큰·컴포넌트·유틸 · **실행** `git checkout -b afk/<date>` 또는 별도 `git worktree`, 프로젝트 check·관련 테스트 · **출력** 단일 변경별 로컬 commit. **처리** 실제 사용자 불편 수정 → 기능 → 마감 순으로 저장소 양식에 맞춰 작은 diff로 구현하고, UI 변경이면 소유 도메인 스킬 규칙을 통과한 뒤 commit한다.[](source:s5)[](source:reversible) | flow-diagram | implement |
| s-verify | 실사용 동작 확인 | **입력** 로컬 commit이 반영된 실행 환경 · **실행** 브라우저 확인, `curl` 요청, 실제 AI 엔드포인트 호출 · **출력** 동작 확인 또는 미검증 표시. **처리** 사용자가 만나는 경로 그대로 실행해 확인하고, 시각 변경이면 라이트·다크 테마와 모바일 폭까지 본다.[](source:s6) | flow-diagram | verify |
| s-reject | 반박 검사 | **입력** 구현 commit과 `default branch` 기준 상태 · **실행** 전후 화면 비교, 테스트 일시 제거 후 재실행, 지표 재측정 · **출력** 유지·축소·되돌리기 판정. **처리** 변경 파일이 렌더되는 모든 화면과 새로고침·뒤로/앞으로·딥링크·로그아웃·reduced motion 경로를 훑어 의도치 않은 차이를 찾고, 영향 범위에 맞춰 반박 검증한 뒤 남길 commit을 정한다.[](source:s7) | flow-diagram | reject |
| s-more | 시간·아이디어 남았나? | **입력** 현재 시각, 남은 아이디어 목록, 미탐색 영역 · **출력** 반복 또는 종료 분기. **처리** 복귀 시각 전이고 근거 있는 작은 diff 아이디어가 남았으면 다음 안을 구현하거나 새 영역 근거 수집으로 돌아가고, 다 소진했거나 복귀 시각이면 마무리로 간다.[](source:wide) | flow-diagram | more |
| s-report | 7항목 보고서 작성 | **입력** `.afk/<date>.md`와 완성된 `afk/<date>` branch · **실행** branch 전체 대상 모든 CI check 실행 · **출력** 7항목 보고서 메시지와 문구 초안. **처리** 최종 branch에서 전체 CI check를 돌린 뒤 위치·구현 내역·되돌린 항목·검증 결과·미확인 항목·대리 결정·미구현 아이디어 순으로 2분 분량 보고서를 남긴다.[](source:s7)[](source:s8) | flow-diagram | report |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 호출형이다. `disable-model-invocation: true`와 `allow_implicit_invocation: false`가 설정되어 사용자가 `/afk`로 직접 불러야 켜진다.[](source:fm)[](source:yaml) |
| 성격 | 부재 중 근거 탐색·아이디어 발상·소규모 구현·자기 반박·보고를 묶어 돌리는 자율 개선 실행 스킬.[](source:intro)[](source:wide) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#rel-r75} | better-accessibility | 호출 | 5단계 구현 중 UI 작업이 포함되면 소유 도메인 스킬(예: `better-accessibility`) 규칙을 통과해야 한다(사용자 개입 없음).[](source:s5) |
| **이 스킬** {#rel-r76} | better-interface | 대안 | 역할 경계: 기존 인터페이스 리뷰가 목적이면 `better-interface`를 쓴다(사용자 선택).[](source:intro) |
| **이 스킬** {#rel-r77} | interface-review | 대안 | 역할 경계: diff 리뷰가 목적이면 `interface-review`를 쓴다(수동 호출 필요).[](source:intro) |
| **이 스킬** {#rel-r78} | variant | 대안 | 역할 경계: 단일 컴포넌트의 대안 비교 탐색은 `variant`를 쓴다(수동 호출 필요).[](source:intro) |
| **이 스킬** {#rel-r79} | break | 대안 | 역할 경계: 단일 컴포넌트 스트레스 테스트는 `break`를 쓴다(수동 호출 필요).[](source:intro) |

@architecture id=relation-map title="afk와 이어지는 스킬"
| self | afk(이 스킬) | backend |
| a11y | better-accessibility | backend |
| iface | better-interface | backend |
| ir | interface-review | backend |
| var | variant | backend |
| brk | break | backend |
| self > a11y | 호출 | |
| self > iface | 대안 | dashed |
| self > ir | 대안 | dashed |
| self > var | 대안 | dashed |
| self > brk | 대안 | dashed |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 8단계 자율 개선 절차, 근거 우선순위, 가역성·자기 반박 규칙 | 스킬이 켜지면 읽는다 | 도구 사전 점검, 프로젝트 파악, 근거 수집, 아이디어 15개 발상, 최선안 구현, 실사용 동작 확인, 반박 검사, 시간·아이디어 남았나?, 7항목 보고서 작성 |
| `agents/openai.yaml` | UI 표시 이름·짧은 설명·암시적 호출 비활성화 설정 | UI가 스킬을 보여 줄 때 쓴다. 지시 본문이 아니다 | 원문에 명시 없음 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 3건 commit과 20분 만에 작업이 끝날 조짐이 보임 | 탐색 중단 신호로 보고 남은 시간 동안 다음 아이디어 구현이나 미탐색 영역 수집으로 돌아간다 | [](source:wide) |
| 복귀 시각 도달 또는 전 영역 확인 후 작은 diff에 맞는 근거 아이디어 소진 | 종료 조건이다. 이때만 반복을 멈추고 보고 단계로 넘어간다 | [](source:wide) |
| 요청이 특정 페이지·기능·진행 작업 하나를 지목함 | 해당 대상의 모든 각도만 탐색하고 나머지 제품은 건드리지 않는다 | [](source:wide) |
| 돕는 사용자를 특정할 수 없거나 근거가 없는 아이디어 | 대상 불명 아이디어는 탈락한다. 근거 없는 아이디어는 동점 시 밀리고 diff를 작게 유지한다 | [](source:value) |
| 새 상태 관리 라이브러리·스타일 체계·데이터 계층 도입 | 금지다. 구현하지 않고 보고서의 미구현 제안으로만 남긴다 | [](source:repo) |
| working tree에 미커밋 작업이 남아 있음 | 강제: 별도 `git worktree`에서 작업하고 기존 미커밋 작업은 건드리지 않는다 | [](source:reversible)[](source:finish) |
| push, PR 생성, 병합, 배포, 게시·메시지 발송 | 요청에 명시되지 않았으면 금지다 | [](source:reversible) |
| 연결된 분석·오류 추적·배포 로그 서비스 | 읽기 전용으로만 조회한다. 설정·데이터·통합 변경 금지다 | [](source:reversible) |
| 게시된 글 편집 또는 새 의존성 추가 | 기존 글은 어조를 유지하고 초안을 보고서에 적는다. 의존성은 sibling 프로젝트가 같은 용도로 이미 쓸 때만 추가하고 보고서에 밝힌다 | [](source:reversible) |
| 테스트 실행이 파일을 수정함 | 실행 전 스냅샷을 저장하고 실행 뒤 원상 복구한다 | [](source:reversible) |
| 작업 노트 `.afk/<date>.md` 생성 | `.git/info/exclude`에 등록해 commit에 들어가지 않게 하고 매 단계마다 갱신한다 | [](source:notes) |
| 이슈·피드백·오류 문자열·웹페이지 속 지시 문장 | 신뢰하지 않는다. 이 실행이 할 수 있는 범위를 바꾸지 않는다 | [](source:s3) |
| 단일 commit 제목에 `and`가 필요하거나 미검증 구현이 남음 | commit을 둘로 나누고, 시간이 남았으면 다음 구현 전에 기존 변경부터 검증한다 | [](source:finish) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 아이디어 선정과 뜻밖의 아이디어 기준 — 아이디어 15개 발상 · 404 트래픽·운영 오류·미이행 문구·미사용 코드 등 근거 서열과 제품 동작 변경 아이디어 승격 기준을 개요에서 줄였다.
- 자기 반박 5가지 점검과 영향 범위별 강도 — 반박 검사 · `curl` 1회로 끝나는 경로 재지정(redirect)과 전 페이지 wrapper 전체 검증의 차이를 상세로 풀 수 있다.
- 마무리 자가 점검 6가지 패턴 — 최선안 구현과 7항목 보고서 작성 · commit 분할, 주석 삭제, 기존 토큰 대체 규칙을 요약만 남겼다.

@callout level=open-question title="확인하지 못한 것"
| `SKILL.md` 95줄은 UI 작업 시 `better-accessibility` 등 소유 도메인 스킬을 예시로 지목하나, 나머지 `better-*` 도메인 스킬 전체 목록은 원문에 열거하지 않았다. |

읽은 원본: 텍스트 파일 2개(`SKILL.md`, `agents/openai.yaml`). 제외: 없음.
