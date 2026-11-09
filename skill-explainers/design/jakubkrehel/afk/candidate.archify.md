# afk 스킬은 에이전트를 어떻게 바꾸나 {#afk-skill}

`afk`를 부르면 에이전트는 사용자가 자리를 비운 몇 시간 동안 프로젝트 하나를 혼자 개선한다. 먼저 근거를 모으고, 아이디어를 15개 넘게 쓴 뒤, 가장 근거가 센 몇 개를 local branch에 commit으로 만든다. 마지막에는 돌아온 사람이 읽을 보고서를 한 편 남긴다.[](source:af-intro)[](source:af-s3)

- 켜지는 때: 사용자가 직접 `afk`를 부를 때만이다. 모델이 스스로 켜지 못하도록 `disable-model-invocation: true`가 걸려 있다.[](source:af-fm)[](source:af-yaml)
- 강제하는 것: `afk/<date>` branch에서 일하고, commit은 local에만 둔다. push, PR, merge, deploy, 메시지 발송은 이번 요청이 시킬 때만 한다. 연결된 서비스는 읽기만 한다.[](source:af-rev)
- 끝나는 때: 사용자가 말한 복귀 시각이 오거나, 모든 영역을 읽었고 작은 diff로 만들 근거 있는 아이디어가 남지 않았을 때다. 세 commit 만에 끝내면 실패로 본다.[](source:af-hours)
- 쓰면 안 되는 때: 한 화면의 리뷰(`better-interface`), diff 리뷰(`interface-review`), 한 컴포넌트의 대안 탐색(`variant`)이나 스트레스 테스트(`break`)가 목적일 때다. 원문이 그 일을 각 스킬의 몫으로 가른다.[](source:af-intro)

@answer scope="design/jakubkrehel/afk · 원본 텍스트 2개 8,179B · 커밋 0465878 · 관계 확인용으로 다른 스킬 frontmatter 4개 · 지시는 읽기만 하고 실행하지 않음 · 지시상 동작"
@meta locale=ko
@source af-fm title="design/jakubkrehel/afk/SKILL.md · 8025B · 지시 본문과 frontmatter" path=design/jakubkrehel/afk/SKILL.md lines=1:5
@source af-intro title="SKILL.md · 하는 일과 다른 스킬의 몫" path=design/jakubkrehel/afk/SKILL.md lines=9:11
@source af-hours title="SKILL.md · 몇 시간의 넓은 탐색과 종료 조건" path=design/jakubkrehel/afk/SKILL.md lines=13:19
@source af-better title="SKILL.md · 사용하는 사람에게 더 나아야 한다" path=design/jakubkrehel/afk/SKILL.md lines=21:25
@source af-wild title="SKILL.md · 가끔은 뜻밖의 아이디어" path=design/jakubkrehel/afk/SKILL.md lines=27:31
@source af-match title="SKILL.md · 저장소 관례를 따른다" path=design/jakubkrehel/afk/SKILL.md lines=33:43
@source af-rev title="SKILL.md · 되돌릴 수 있게 둔다" path=design/jakubkrehel/afk/SKILL.md lines=45:54
@source af-s1 title="SKILL.md · 1단계 프로젝트 파악" path=design/jakubkrehel/afk/SKILL.md lines=56:58
@source af-s2 title="SKILL.md · 2단계 근거 모으기" path=design/jakubkrehel/afk/SKILL.md lines=60:64
@source af-s3 title="SKILL.md · 3단계 넓게 생성" path=design/jakubkrehel/afk/SKILL.md lines=66:68
@source af-s4 title="SKILL.md · 4단계 가장 강한 몇 개 만들기" path=design/jakubkrehel/afk/SKILL.md lines=70:72
@source af-s5 title="SKILL.md · 5단계 동작 확인" path=design/jakubkrehel/afk/SKILL.md lines=74:76
@source af-s6 title="SKILL.md · 6단계 보고서 순서" path=design/jakubkrehel/afk/SKILL.md lines=78:88
@source af-check title="SKILL.md · 끝내기 전 점검 표" path=design/jakubkrehel/afk/SKILL.md lines=90:103
@source af-yaml title="design/jakubkrehel/afk/agents/openai.yaml · 154B · 표시 이름과 암시 호출 정책" path=design/jakubkrehel/afk/agents/openai.yaml lines=1:6
@source bi-fm title="design/jakubkrehel/better-interface/SKILL.md · 확인용 frontmatter" path=design/jakubkrehel/better-interface/SKILL.md lines=1:4
@source ir-fm title="design/jakubkrehel/interface-review/SKILL.md · 확인용 frontmatter" path=design/jakubkrehel/interface-review/SKILL.md lines=1:5
@source va-fm title="design/jakubkrehel/variant/SKILL.md · 확인용 frontmatter" path=design/jakubkrehel/variant/SKILL.md lines=1:5
@source br-fm title="design/jakubkrehel/break/SKILL.md · 확인용 frontmatter" path=design/jakubkrehel/break/SKILL.md lines=1:5

## 언제 켜지고, 언제 멈추나 {#trigger}

@code source=af-fm language=yaml

- `SKILL.md`: `disable-model-invocation: true`가 있다. 모델은 이 스킬을 스스로 고를 수 없고 사용자가 직접 불러야 한다.[](source:af-fm)
- `agents/openai.yaml`: `allow_implicit_invocation: false`가 있다. 같은 제한이 한 번 더 적혀 있다.[](source:af-yaml)

판정: 사용자가 모르는 사이에 몇 시간짜리 자율 작업이 시작되는 일은 두 파일 모두에서 막혀 있다. 근거는 위 두 줄이다.

원문은 한 번의 실행이 몇 시간 이어지는 것을 전제한다. 이 전제에서 에이전트의 판단 기준이 나온다.[](source:af-hours)

- 한 묶음을 만들고 검증하면 목록에서 다음 아이디어를 꺼낸다.
- 목록이 비면 아직 읽지 않은 영역을 찾아 근거 모으기로 돌아간다.
- 제품의 모든 영역을 읽는다. 가장 붐비는 페이지부터 설정, 문서, 도구까지 본다. 아이디어가 한 페이지나 한 파일에 몰리면 탐색이 일찍 멈췄다는 신호다.
- 한 변경을 "충분히 좋음" 이상으로 다듬지 않는다. 폭이 줄기 때문이다.

@facts
| 종료 조건 A | 사용자가 말한 복귀 시각이 온다[](source:af-hours) |
| 종료 조건 B | 모든 영역을 읽었고, 작은 diff로 만들 근거 있는 아이디어가 남지 않았다[](source:af-hours) |
| 실패 신호 | commit 세 개, 20분 만에 끝난 실행은 사용자가 비운 시간을 낭비한 것이다[](source:af-hours) |
| 복귀 시각 | 사용자가 말하지 않았을 때의 종료 방법은 `원문에 명시 없음`이다 |

아래 일은 다른 스킬의 몫이라고 원문이 이름을 들어 가른다.[](source:af-intro) 판정: 이 문장은 역할 구분이고 `afk`가 그 스킬을 실행하라는 지시가 아니다. 근거는 원문 11줄이 "~는 `X`다"로만 적혀 있다는 점이다.

| 하려는 일 | `afk` 대신 | 그 스킬의 호출 조건 |
| --- | --- | --- |
| 화면 하나의 인터페이스 리뷰 | `better-interface` {caution:범위 밖} | 호출 제한 필드 없음[](source:bi-fm) |
| diff(branch, PR, 변경) 리뷰 | `interface-review` {caution:범위 밖} | `disable-model-invocation: true`. 사용자가 직접 불러야 한다[](source:ir-fm) |
| 한 컴포넌트의 대안 탐색 | `variant` {caution:범위 밖} | `disable-model-invocation: true`[](source:va-fm) |
| 한 컴포넌트의 스트레스 테스트 | `break` {caution:범위 밖} | `disable-model-invocation: true`[](source:br-fm) |

## 어떤 순서로 일하고, 아이디어는 어떻게 고르나 {#workflow}

1~5단계에는 `Done when`(완료 조건)이 있고 6단계에는 보고서 순서가 있다. 단계 사이의 되돌아가기는 원문의 "다음 아이디어를 꺼낸다", "목록이 비면 근거 모으기로 돌아간다"에서 나온다.[](source:af-hours)

@workflow id=afk-flow title="afk 6단계"
| lane find | 찾기 |
| lane build | 만들고 확인 |
| lane report | 보고 |
| af-learn | 1 프로젝트 파악 | backend | find |
| af-gather | 2 근거 모으기 | backend | find |
| af-gen | 3 넓게 생성 | backend | find |
| af-build | 4 강한 몇 개 만들기 | backend | build |
| af-see | 5 동작 확인 | backend | build |
| af-more | 계속할 때인가? | backend | build |
| af-report | 6 보고서 | backend | report |
| af-learn > af-gather | |
| af-gather > af-gen | |
| af-gen > af-build | |
| af-build > af-see | |
| af-see > af-more | |
| af-more > af-build | 아이디어 남음 | dashed |
| af-more > af-gather | 목록 빔 | dashed |
| af-more > af-report | 종료 조건 | emphasis |

@steps id=afk-steps
| af-learn | 1 프로젝트 파악 | `AGENTS.md`나 `CLAUDE.md`, README, 최근 git log, 열린 branch와 PR, 저장된 memory를 읽는다. commit 형식, 주석 규칙, 컴포넌트 패턴처럼 사용자가 강제하는 관례를 적어 둔다. 완료 조건은 프로젝트의 목적과 stack, 리뷰어가 어기면 거절할 관례를 말할 수 있는 상태다.[](source:af-s1) | afk-flow | af-learn |
| af-gather | 2 근거 모으기 | 연결된 출처를 모두 읽는다. 웹 분석(상위 페이지, 404, referrer), 오류 추적과 런타임 로그, CI 결과, 열린 issue와 `TODO` 주석, 제품 문구와 문서(실제 동작과 대조), 가장 붐비는 페이지의 console이다. 사용자의 다른(sibling) 프로젝트에서 이미 푼 문제(검색 dialog, 컴포넌트, 워크플로)도 찾는다. 완료 조건은 출처마다 읽었거나 이유를 달아 제외한 상태다.[](source:af-s2) | afk-flow | af-gather |
| af-gen | 3 넓게 생성 | 고르기 전에 아이디어를 15개 이상 쓴다. 수정, 디자인 다듬기, 기능, 콘텐츠, 성능, 접근성, 사용자의 도구(스킬, 스크립트)를 다룬다. 3개 이상은 보이는 모양이 아니라 제품이 하는 일을 바꾸는 것이어야 한다. 아이디어마다 도움받는 사람, 근거, 대략의 크기, 위험을 적고, 사람을 못 대는 아이디어는 뺀다. 완료 조건은 모든 영역에 아이디어가 있고 하나 이상이 사용자를 놀라게 할 만한 상태다.[](source:af-s3) | afk-flow | af-gen |
| af-build | 4 강한 몇 개 만들기 | 근거가 가장 센 아이디어를 골라 각각 작은 commit 하나로 만든다. 순서는 실제 사용자 불편을 고치고, 기능을 만들고, 다듬는다. 저장소 관례대로 만들고 commit 전에 프로젝트의 check 명령을 돌린다. 완료 조건은 고른 아이디어가 모두 commit됐거나 버린 이유가 적힌 상태다.[](source:af-s4) | afk-flow | af-build |
| af-see | 5 동작 확인 | 변경마다 사람이 만날 자리에서 돌려 본다. 인터페이스는 browser, 경로와 redirect는 `curl`, AI 기능은 실제 endpoint를 쓴다. 눈에 보이는 변경은 light·dark 테마와 phone 폭에서 본다. 완료 조건은 변경마다 동작을 봤거나 `unverified`로 표시한 상태다.[](source:af-s5) | afk-flow | af-see |
| af-report | 6 보고서 | 사용자가 가장 먼저 읽을 메시지 하나로 끝낸다. 순서는 위치, 만든 것, 검증한 것, 사용자가 정할 것, 만들지 않은 아이디어다.[](source:af-s6) | afk-flow | af-report |

아이디어를 거르는 규칙은 둘이다.

첫째, 모든 아이디어는 "이 제품을 쓰는 사람이 정말 나아졌다고 느낄까"에 답해야 한다. 사람과 그 순간을 이름으로 대야 한다. 원문의 예는 죽은 링크에 도착한 독자, 글을 찾아 헤매는 방문자다. 코드만 깔끔해지거나 에이전트가 바빠 보이기만 하는 아이디어는 탈락한다.[](source:af-better)

둘째, 통과한 아이디어는 필요의 근거 순으로 줄 세운다. 실제 트래픽이 닿는 404, 운영 오류, 제품 문구가 지키지 않는 약속, 사용자가 이미 sibling 프로젝트에 배포한 수정이 근거다. 근거 없는 아이디어도 만들 수는 있지만 동점에서 항상 지고 diff도 작게 유지한다.[](source:af-better)

가끔은 뜻밖의 아이디어 하나를 넣는다. 예는 제품 콘텐츠가 가능하게 하는 기능, 새 탐색 방식, 사용자의 작업 방식을 바꾸는 도구다.[](source:af-wild)

- 위 시험을 통과하고 작은 diff에 들어가면 만든다.
- 아니면 만들어 볼 만한 이유와 함께 보고서에만 적는다.
- 안전한 수정만 있는 목록은 생성 단계가 일찍 끊긴 것이다.[](source:af-wild)

## 무엇을 강제하고 금지하나 {#rules}

사용자가 돌아와서 마주하는 것은 선택지이지 뒷정리가 아니어야 한다는 것이 원문의 기준이다.[](source:af-rev) 아래 표는 "되돌릴 수 있게 둔다" 여섯 항목이다.

| 영역 | 에이전트가 하는 일 | 하지 않는 일 |
| --- | --- | --- |
| branch | 기본 branch에서 새 `afk/<date>` branch를 만든다. 커밋 안 한 작업이 있으면 별도 `git worktree`에서 만들고 그 작업은 그대로 둔다 | {bad:사용자의 미커밋 작업 건드리기} |
| commit | local에 변경 하나당 commit 하나, 저장소의 commit 스타일로 쓴다 | {bad:push, PR, merge, deploy, 글 게시, 메시지 발송}(이번 요청이 시킨 경우만 예외) |
| 연결된 서비스 | 분석, 오류 추적, deploy 로그를 읽기만 한다 | 설정, 데이터, 연동을 바꾸지 않는다 |
| 사용자의 글 | 새 문구, changelog 항목, 글은 보고서에 초안으로 쓴다 | 발행된 글을 직접 고치지 않는다 |
| dependency | sibling 프로젝트가 같은 일에 이미 쓰는 것만 추가하고 보고서에 이름을 적는다 | 그 밖의 새 dependency |
| 테스트가 쓰는 파일 | 테스트 전에 snapshot을 뜨고 끝나면 복원한다 | 바뀐 채로 두기 |

변경은 "사용자가 직접 쓴 것처럼" 읽혀야 한다. 만들기 전에 저장소가 가장 가까운 문제를 어떻게 풀었는지 찾아 그대로 따른다.[](source:af-match)

- 컴포넌트, hook, 유틸을 재사용한다. 새 primitive는 기존 것으로 못 덮는 이유가 있어야 한다.
- 색, 간격, radius, 글꼴, 모션은 저장소의 design token을 쓴다. 값은 가장 가까운 기존 화면에서 가져오고 새 값을 만들지 않는다.
- 파일 배치, 이름 규칙, import 스타일, agent 문서의 규칙(주석을 쓰는 시기 포함)을 따른다.
- 인터페이스 문구는 제품이 쓰는 어조, 길이, 문장부호로 쓴다.
- 새 상태 라이브러리, 스타일링 방식, 데이터 계층은 보고서의 아이디어로만 적고 무인 실행 중에는 만들지 않는다.
- sibling 프로젝트가 같은 문제를 풀었으면 그 해법을 가져와 이 저장소의 token으로 다시 입힌다.

끝내기 전 점검 표는 열 줄이다. 에이전트는 이 중 하나에 걸리면 표의 처방대로 되돌아간다.[](source:af-check)

| 걸리는 패턴 | 처방 |
| --- | --- |
| commit 제목에 "and"가 필요하다 | commit 두 개로 나눈다 |
| 변경을 type check로만 확인했다 | 실행 중인 앱에서 돌려 보거나 `unverified`로 표시한다 |
| 보고서가 commit 제목을 나열한다 | 사용자가 지금 무엇을 보는지와 만든 이유를 쓴다 |
| diff가 사용자의 미커밋 파일을 건드린다 | 작업을 별도 worktree로 옮기고 사용자의 것을 복원한다 |
| 주석이 코드가 하는 일을 설명한다 | 코드가 틀려 보일 때가 아니면 지운다 |
| 아이디어 목록이 수정뿐이다 | 3단계로 돌아가 뜻밖의 아이디어를 쓴다 |
| 만든 아이디어가 사람을 못 댄다 | revert하고 보고서로 옮긴다 |
| diff에 새 색, 간격, 컴포넌트가 있다 | 저장소의 가장 가까운 기존 것으로 바꾼다 |
| 시간이 남았는데 아이디어를 안 만들고 멈췄다 | 근거 있는 다음 아이디어를 만든다 |
| 모든 아이디어와 commit이 한 영역에 있다 | 아직 안 읽은 영역에서 근거를 모은다 |

보고서의 마지막 줄은 "Stay reversible"에서 나온 초안(새 문구, changelog, 글)을 아이디어와 함께 붙여넣기 좋은 모양으로 둔다는 규칙이다.[](source:af-s6) 판정: 사람 개입은 실행 중에는 없고 실행 뒤 보고서의 "사용자가 정할 것" 항목에 몰려 있다. 실행 중에 묻는지는 `원문에 명시 없음`이다.

## 흐름 속 위치 {#position}

`afk`는 묶음에 속하지 않는다. 원장에 `afk`로 들어오는 관계도 없고, 나가는 관계는 모두 역할 구분 참고다(r125~r128).[](source:af-intro)

@workflow id=afk-position title="afk 앞뒤"
| ps-user | 사용자 직접 호출 | external |
| ps-afk | afk | backend |
| ps-back | 돌아온 사용자 | external |
| ps-user > ps-afk | 복귀 시각 | emphasis |
| ps-afk > ps-back | 보고서와 branch | emphasis |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| 사용자(앞) | 프로젝트와 (있다면) 복귀 시각 | - | 직접 호출만 받는다[](source:af-fm)[](source:af-yaml) | - |
| `better-interface` | - | - | 참고. 화면 리뷰는 그쪽 몫이다. `afk`가 실행한다는 문장은 없다[](source:af-intro) | r125 |
| `interface-review` | - | - | 참고. diff 리뷰는 그쪽 몫이다. 그 스킬은 명시 호출만 된다[](source:af-intro)[](source:ir-fm) | r126 |
| `variant` | - | - | 참고. 한 컴포넌트의 대안 탐색은 그쪽 몫이다. 명시 호출만 된다[](source:af-intro)[](source:va-fm) | r127 |
| `break` | - | - | 참고. 한 컴포넌트의 스트레스 테스트는 그쪽 몫이다. 명시 호출만 된다[](source:af-intro)[](source:br-fm) | r128 |
| (뒤) | - | `afk/<date>` branch, 보고서 | 받는 쪽은 사용자다. 에이전트가 대신 내린 결정을 되돌릴지 정한다[](source:af-rev)[](source:af-s6) | - |

그림에는 r125~r128을 그리지 않았다. 네 관계 모두 역할 구분 참고라서 순서가 없다. 판정: `afk`는 이 네 스킬로 일을 넘기지도, 실행하지도 않는다. 근거는 원문 11줄이 이름만 들어 "몫"이라고 가를 뿐이고 다른 줄에 호출 지시가 없다는 점이다.[](source:af-intro)

묶음 `interface-audit`(`design/_group-interface-audit/interface-audit.html`)와 `component-workbench`(`design/_group-component-workbench/component-workbench.html`)는 이 스킬이 역할을 가르는 대상이 속한 묶음이다. `afk` 자신은 두 묶음 어디에도 속하지 않는다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 2개, 합계 8,179B다. `SKILL.md` 8,025B와 `agents/openai.yaml` 154B를 끝까지 읽었다.
- 관계 확인용으로 `better-interface`, `interface-review`, `variant`, `break`의 `SKILL.md` frontmatter(각 4~5줄)만 읽었다. 위 개수에는 넣지 않았다.
- 구조·표본만 확인한 파일: 없음. 바이너리: 없음. 제외한 파일: 없음. 번역본은 없다.
- 다른 컬렉션에 이름이 같은 스킬은 없다(`design/relations.md`).
- 원문 대조 범위: 활성화 제한 2곳(`disable-model-invocation`, `allow_implicit_invocation`), 단계 6개, 완료 조건 5개(1~5단계), 보고서 5항목, 종료 조건 2개, "되돌릴 수 있게 둔다" 6항목, 저장소 관례 6항목, 끝내기 점검 10행, 수치(15개, 3개, 세 commit과 20분, 보고서 2분)를 대조했다. 관계 행 r125~r128은 원장과 원문 11줄이 같다.
- 분석 중 바뀐 파일: 없음. `design/` 작업 트리는 commit `0465878` 그대로다.

@callout level=open-question title="확인하지 못한 것"
- 이 스킬이 실제로 에이전트의 동작을 바꾸는지는 실행해 보지 않아 확인하지 않았다. 페이지의 모든 동작은 지시상 동작이다.
- 복귀 시각을 사용자가 말하지 않았을 때 어떻게 끝낼지는 `원문에 명시 없음`이다. 종료 조건 B만 남는지는 원문이 정하지 않았다.[](source:af-hours)
- "몇 시간"은 원문이 실행 길이의 기대로 쓴 표현이고, 시간 상한이나 하한을 수치로 정하지는 않는다. 20분과 commit 세 개는 실패 사례의 예다.[](source:af-hours)
- "보고서를 2분에 읽을 수 있게"는 의도로 적혀 있고, 그 길이를 검사하는 규칙은 `원문에 명시 없음`이다.[](source:af-intro)
- 프로젝트가 git 저장소가 아니거나 check 명령이 없을 때의 동작은 `원문에 명시 없음`이다.[](source:af-s4)
