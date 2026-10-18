### Orchestrate

**프로그램은 소유하되 코드는 소유하지 않는다. 브리프를 작성하고, 큐를 비우고, 프론티어를 green으로 유지하고, 결정한다.** 하나의 독립 coordinator 채팅에 맡겨진 프로젝트 전체를 다루는 경우에 쓴다. 여러 날에 걸쳐 진행되고, 쌓인 PR이 많으며, subagent가 수십에서 수백 개에 이르고, 사람은 5분마다가 아니라 하루 두 번 확인하는 작업이다. 하나의 작업을 조건(predicate)까지 몰아가는 것은 Autonomous run이다. 특수한 워크플로가 필요한 야심 찬 한 번의 실행은 figure-it-out이다. 작업이 어떤 단일 agent의 수명보다 길어질 때 이 playbook으로 라우팅한다. 세션 예산 안에서 agent 하나가 끝낼 수 있는 작업은 프로그램이 아니다.

의식(ceremony)은 프로그램 규모에 맞춰야 한다. 비용이 싸고 거의 동일한 unit이 많다면, 각 section의 지시에 따라 의식을 줄인다.

핵심 규칙은 세 가지다.

- 완료 보고는 interrupt가 아니라 queue 이벤트다.
- 모든 spawn과 모든 resume에는 standing orders가 한 글자도 바꾸지 않고 그대로 들어간다.
- 브리프가 제품이다. 대충 쓴 브리프는 조용히 실패한다. worker는 질문할 수 없기 때문이다.

#### 역할과 배치

- **Coordinator (이 채팅).** 로컬에서 실행된다. 프레이밍, 브리프 작성, inbox 비우기, 사람에게 보고하는 일, 판단을 맡는다. 코드를 작성하거나 편집하지 않는다. 충돌 merge, restack, 코드 변경은 항상 task로 넘긴다. 검증된 unit을 기계적으로 착지시키는 일(worker 커밋을 fast-forward하거나 깔끔하게 cherry-pick한 뒤 push)은 로컬 git이 가벼운 repo에서는 coordinator가 직접 할 수 있는 bookkeeping이다. 끝난 작업을 놀고 있는 stacker 뒤에 줄 세우면 마감 시점에 아무것도 거두지 못한다. 루프는 처음부터 끝까지 agent적으로 돈다. Agent는 Task tool을 통해서만 spawn, resume, drain된다. 상태 읽기와 쓰기는 drain 시점에 `scripts/orch/orch.ts`를 거치며, 명령 하나를 넣으면 한 줄이 나온다. CLI는 아무것도 spawn하거나 기다리거나 깨우지 않는다.
- **Sub-coordinator.** 항상 로컬에서, 지속적으로, track마다 하나씩 둔다. 프로그램이 coordinator 하나의 drain으로 감당할 수 있는 수준을 넘을 때만 둔다. coordinator가 직접 drain할 수 있는 track에는 중간 계층이 필요 없다. 중첩된 계층마다 전체 오리엔테이션 preamble을 다시 치르게 되고, 블로킹하는 sub-coordinator는 자식들을 가리고 부모는 놀게 만든다. 자기 track의 unit과 보드를 소유하고, 자기 worker의 브리프를 작성하며, 자기 worker와 verifier를 spawn한다(중첩은 깊이 3까지 가능하며, 중첩된 spawn도 `environment`를 포함한 전체 Task 스키마를 갖는다). wave 경계에서 집계를 올린다. 자식의 원본 보고를 그대로 전달하지 않는다. 동시에 살아 있는 자식 수는 drain 하나가 처리할 수 있는 양, 대략 열 개 정도로 제한하고, 이를 롤링 윈도우로 운용한다. 블로킹 배치로는 절대 운용하지 않는다. 배치마다 가장 느린 자식의 시간을 치르게 되기 때문이다.
- **Worker / verifier.** 작업이 이 머신을 필요로 하는 경우가 아니라면 항상 `environment: "cloud"`로 둔다. 이 머신이 필요한 경우란 `cursor-team-kit`의 `control-ui` 또는 `control-cli` 런타임 검증, `agent-transcripts/` 아래 로컬 transcript 읽기, 시뮬레이터와 로컬 IDE 상태, 이 머신에만 있는 인증이 필요한 경우다. Cloud agent는 로컬 저장소를 읽을 수 없으므로, 브리프에 필요한 내용을 직접 넣거나 repo 경로를 가리켜야 한다. 더 적지만 더 넓은 worker를 선호한다. worktree나 branch마다 writer는 한 명만 둔다(principle-separate-before-serializing-shared-state). unit의 verifier는 worker와 다른 모델 계열에서 실행한다.

깊이는 coordinator, track, worker 세 단계에서 멈춘다. track 분해는 프로젝트마다 작성한다(build, landing, verification은 흔히 쓰는 분할 기준이지 필수 형태는 아니다). 하드코딩된 swarm 트리는 시도했다가 너무 경직되어 보류했다.

#### 저장소 레이아웃

현재 agent의 저장소(시스템 프롬프트에 경로가 있다)에 `orchestrate/<project-slug>/`를 만든다. 모든 파일은 writer가 정확히 하나다. 소유자는 사실을 발행하고, 독자는 읽는 시점에 집계한다. 장부 관리는 `bun scripts/orch/orch.ts`를 사용하며, 아래에서는 `orch`라고 쓴다. 다만 정규 형식인 평문 TSV와 JSON은 CLI 없이도 읽을 수 있어야 한다.

- `preferences.md`는 standing orders 등록부다. 번호가 붙은 한 줄짜리 제약 목록이며, 줄마다 제약 하나를 담는다(모델 정책, stack 형태와 개수, 검증 기준, 금지 경로, 에스컬레이션 정책). 모든 spawn과 모든 resume에 그대로 붙여 넣는다. 지시는 resume 과정에서 흐려지고, 빠진 지시 하나마다 사람이 한 턴을 더 써야 한다. 지시를 다시 말하고 있는 자신을 발견하면, 행동하기 전에 그 줄을 추가한다(principle-encode-lessons-in-structure).
- `overview.md`는 지속되는 PR과 issue DB다. 추가만 한다. 이벤트마다 통째로 다시 쓰지 않는다.
- `units.tsv`는 unit당 한 행이다. id, track, state, branch, PR, head SHA, brief 경로를 담는다. 행은 제자리에서 갱신한다.
- `frontier.json`은 Stack safety에 따라 계산된 merge 프론티어다.
- `ledger.tsv`는 Verification에 따른 검증 장부다.
- `inbox/`에는 완료 포인터가 들어간다. `gates.md`에는 사람에게 넘기는 게이트를 보류해 둔다(질문, 선택지, 응답이 없을 때의 기본값).
- `decisions.tsv`는 show-me-your-work skill을 통한 기록이다.
- `status.md`는 매 drain마다 `units.tsv`와 `ledger.tsv`에서 파생된다. 손으로 관리하지 않는다. 이벤트를 서술해서 적지 말고, 표에서 다시 생성한다.

#### 브리프

agent에게 주는 프롬프트가 유일한 산출물이다. 대충 쓴 브리프는 트리 전체에 걸쳐 쌓여 슬롭이 된다. 모든 spawn에는 아래 항목이 전부 들어간다. 채울 수 없는 필드가 있다면, 그 unit은 아직 범위가 정해지지 않은 것이다.

```
GOAL         one sentence, the outcome, executable by a stranger with no chat access
SCOPE        paths this unit may write; paths it may not; its exclusive worktree or branch
CONTEXT      pointers to files and PRs; upstream reports pasted in full when this unit
             depends on them, because workers cannot see siblings
ACCEPTANCE   checkable criteria, one per line
VERIFY       exact commands or the control-skill path, plus known gotchas
TIMEBOX      rough cap on runtime; on expiry, return partial findings and stop rather than run on
FORBIDDEN    no gt, no rebase, no force-push, no fixes outside scope, plus unit-specific bans
REPORT       status, branch, head SHA, PRs, verdict, what you actually ran, deviations,
             suggested follow-ups
STANDING     <preferences.md pasted verbatim>
```

브리프의 크기는 unit에 맞춘다. 명령 하나짜리 unit에는 템플릿을 목표, 범위, 검증 명령, 보고 형식을 담은 문단 하나로 줄여 쓴다. 두 줄짜리 수정 주변에 4KB짜리 틀을 두르면 그 수정보다 쓰고 따르는 데 드는 비용이 더 크다. 로컬 spawn에서는 저장소 경로로 standing orders 파일을 참조해도 된다. 그대로 붙여 넣는 방식은 cloud spawn과 모든 resume에만 쓴다.

sub-coordinator 브리프에는 track 경계와 unit 목록, cloud 기본값과 로컬 예외 목록을 포함한 spawn 예산, drain 프로토콜, 집계 형식(자식별로 이름, 상태, PR, head SHA, verdict, 한 줄 요약, 그리고 track 상태와 프론티어 변화량)이 추가된다.

의존성은 순서 정하기가 아니라 맥락 전달이다. 드러나지 않은 상류 맥락은 worker가 추측하게 만든다. 빠진 필드는 spawn을 거부해야 하는 조건이다. sub-coordinator마다 wave당 샘플링한 worker 브리프 하나를 감사하되, 감사는 그 wave와 병행해서 진행하며 wave 앞을 막는 게이트로 두지 않는다. 감사에 실패한 브리프는 그 track을 멈추고, worker만이 아니라 sub-coordinator의 지시를 고친다. 브리프 품질은 실행이 후반으로 갈수록 떨어지기 때문이다. 브리프를 resume으로 계속 잇지 않는다. 정리된 범위로 새로 spawn한다.

#### 단계

1. **Frame.** 완료 조건을 셀 수 있는 형태로 말한다(예: "126개 unit 전부 merge되었고, 각각 ledger에서 `unit-test-verified` 이상으로 검증됨"). 범위를 수치화한다. unit 수, 대략적인 노력, 예상 stack 수, 벽시계 시간 예산. 단일 agent가 그 예산 안에 끝낼 수 있다면 여기서 멈추고 Autonomous run을 실행한다. 의식을 줄이는 것은 다른 문서가 있는지에 의존하지 않아야 한다. 이는 이 세션에서 직접 작업하고, 필요하면 평범한 worker를 쓰고, 검증은 인라인으로 하고, 진행하면서 착지시키며, 아래의 저장소, 등록부, 파일럿 장치는 전혀 쓰지 않는 것을 뜻한다. 착지 시점은 예산에 맞춰 잡는다. 예산의 약 70 %가 지나면 새로운 spawn을 멈추고 검증된 것을 착지시킨다. 프로젝트마다 track 이름을 정한다. 논쟁이 있는 분해나 되돌릴 수 없는 결정은 파일럿 전에 arena skill을 거친다. 프레이밍은 한 번만 제시한다. 되돌릴 수 있는 준비 작업은 기다리지 않고 진행한다.
2. **런타임 설치.** `orch init`을 실행한다. show-me-your-work skill을 통해 기록을 열고, 어떤 spawn보다 먼저 standing orders를 쓰며, `orch frontier set --repo <repo-dir>`로 기존 PR에서 `frontier.json`을 채운다.
3. **파일럿.** unit 하나를 전체 경로에 통과시킨다. 브리프, worker, 검증, stack 항목, ledger 행, merge까지. 파일럿의 목적은 agent 50개가 아니라 1개의 비용으로 브리프 템플릿, 검증 레시피, unit 크기를 반증해 보는 데 있다. 팬아웃 전에 파일럿 증거로 계약을 고정한다. 파일럿의 규모는 unit에 맞춘다. 거의 동일하고 값싼 unit이 많은 프로그램에서는 첫 unit이 파일럿이며, 검증 명령을 인라인으로 둔 평범한 unit으로 실행한다. 그 unit이 착지하는 순간 팬아웃을 시작한다. 전용 파일럿 파이프라인(별도 verifier agent, 감사 게이트)은 비싸거나 새로운 unit 형태를 위한 것이지, 직렬화된 파일럿이 반증할 것이 없는 복제형 unit을 위한 것이 아니다.
4. **확장.** 동시 실행 상한까지 롤링 윈도우로 worker를 spawn하고, 자식이 끝날 때마다 채운다. 블로킹 배치는 배치마다 가장 느린 자식의 시간을 치른다. track sub-coordinator는 Roles에 나온 한 drain 기준을 넘을 때만 spawn한다. 매 drain 뒤에 준비된 작업을 다시 계산한다. 상류 보고를 하류 브리프에 전달한다. 형제 간 통신은 위로만 올라가게 한다. 샘플링한 브리프 감사는 샘플링한 wave와 병행해서 돌리며, 실패하면 현재 wave가 아니라 다음 보충을 멈춘다.
5. **Drain.** 아래 큐 규율을 모든 drain 시점에 적용한다.
6. **Land.** 착지는 연속적으로 이루어지며, 끝 단계로 몰아두지 않는다. 첫 번째 검증된 unit부터 통합을 시작하고, 나머지 wave와 병행해서 진행한다. 무거운 저장소에서는 stacker를 첫 wave부터 상시 역할로 두고, 검증되는 대로 통합한다. 로컬 git이 가벼운 저장소에서는 Roles에 따라 coordinator가 검증된 unit을 직접 착지시킨다. 상위 stack 작업 전에 프론티어를 green으로 유지한다. Stack safety가 우선한다. `frontier.json`은 merge나 보고된 새 head SHA가 있을 때만 전진시킨다.
7. **Close.** 마지막 inbox를 비우고, 생성된 모든 agent를 종료 행(done, abandoned, zombie-reconciled)으로 정리하고, 실제 산출물에서 완료 조건을 확인하고, 모든 착지 PR이 현재 head SHA에 대한 verdict를 가졌는지 확인하고, show-me-your-work에 따라 교차 모델 리뷰를 포함해 기록을 감사하고, 반복되는 교정 사항을 `preferences.md`나 브리프 템플릿에 인코딩한다. 저장소는 그대로 둔다. 사후 분석(postmortem)이 되기 때문이다.

#### Queue와 drain

- 완료 알림이 오면 `orch inbox push <agent> <unit> <status> [--report PATH]`를 실행하고 하던 일로 돌아간다. 인라인으로 깊이 리뷰하지 않는다. 리뷰가 필요한 완료는 verifier unit이 된다. drain 안에서 diff를 리뷰하지 않는다.
- drain은 네 지점에서 배치로 실행한다. 치명적인 구간이 끝날 때, track 집계 시점, 프론티어 watcher가 깨어날 때(loop skill로 설정하고, 긴 heartbeat를 대비책으로 둔다), 사람에게 보고하기 전이다. 각 배치는 `orch inbox drain`으로 시작한다. drain 도중에 도착한 항목은 다음 drain을 기다린다.
- 먼저 끝내는 치명적 구간: 브리프 작성, stack 작업, 충돌 결정, 게이트 작성, ledger나 frontier 갱신.
- 각 drain은 모든 포인터를 분류한다(landed, needs-verify, failed, zombie, noise). 결과 행은 `orch unit add`, `orch unit set`, `orch ledger record`로 쓰고, `orch status`를 실행한 뒤, 한 메시지에서 다음 wave를 spawn한다.
- spawn한 모든 자식은 track 집계 시점에 확인한다. 도착했는지, 다시 spawn했는지, 아니면 범위가 명시적으로 흡수되었는지. 빠진 자식의 일을 조용히 다시 하면 낭비된 비용과 그 결과가 메우려던 커버리지 공백이 둘 다 숨겨진다.
- drain 턴은 `orch status`의 세 줄로 끝낸다. 상태별 개수, 바뀐 것, 열린 게이트. 자세한 내용은 `status.md`에 있다. 전체 응답 규약은 체크포인트와 close에서 적용한다.

#### Stack safety

- 프론티어는 계산된 객체이며, 서술로 다루지 않는다. 모든 merge와 stack 변경 뒤에 `gt`에서 `frontier.json`을 다시 계산한다. GitHub base ref는 restack 중에 어긋날 수 있지만 gt 추적이 권위를 가지기 때문이다. 순서가 있는 PR 목록, branch 이름, head SHA, 세대 번호, 가장 낮은 미merge PR을 담는다. gt가 stack을 아는 곳(보통 stacker의 클론)에서 해석한다. gt 메타데이터가 submit을 본 적 없는 checkout은 PR이 없다고 보고하며, 추측하지 않고 명령이 오류를 낸다.
- stack마다 `gt`를 실행할 수 있는 stacker는 정확히 하나만 두며, 그 stack 안에서는 직렬로 실행한다. 보유자는 standing orders에 기록한다. restack은 cloud에서 실행한다. 이 규모에서 로컬 restack은 노트북을 쓰러뜨린다.
- worker는 절대 rebase하지 않고 `gt`를 실행하지 않는다. babysitter는 `playbooks/babysit.md`를 따르며, stack마다 하나씩 두고, 하나의 불변 프론티어 세대에 범위를 묶는다. 충돌은 직접 restack하지 말고 stacker에게 보고한다.
- PR 닫기와 base 재지정은 stacker를 통해서만 한다. base PR을 닫으면 그 위의 모든 체인이 고아가 된다. merge와 stack 수술은 다른 작업과 똑같이 브리프가 있는 unit이다.
- 리트로 watcher 하나가 merge된 PR을 따라가며 revert, merge 후 CI 실패, 고아가 된 후속 작업을 찾는다.

#### 검증

검증은 unit에 맞춘다. VERIFY가 비용이 싼 명령 하나라면, worker가 그것을 실행하고 출력을 보고하며, coordinator는 영수증(receipt)을 표본 점검한다. 다른 모델 계열의 전용 verifier agent는 검증 비용이 크거나, 판단이 많이 필요하거나, 영향 범위가 큰 unit에만 쓴다. 명령 하나를 다시 실행하는 것이 전부인 verifier agent는 검증이 아니라 의식이다.

ledger 행은 `orch ledger record`로 쓴다. 현재 PR과 head SHA는 `orch ledger check`로 확인한다. `ledger.tsv`는 verdict당 한 행이며, PR 번호와 head SHA를 키로 쓴다. 값은 `live-ui-verified | unit-test-verified | type-check-only | verifier-blocked | verifier-failed` 중 하나다. CI green은 verdict의 입력일 뿐 verdict가 아니다. 동작에 관한 작업은 `type-check-only`보다 나은 결과가 필요하다. `verifier-blocked`는 통과가 아니다. 환경이 회복되면 다시 spawn한다. `verifier-failed`에는 재검증이 아니라 수정 unit을 준다. worker는 자기 결과를 스스로 보고할 수 있다. verifier는 같은 키에 대해 그것을 덮어쓴다. 새 head SHA는 행을 무효화하므로, restack 뒤에는 다시 검증한다. ledger는 "검증되었는가"에 답하며, 기억이나 transcript에 답하지 않는다.

unit은 산출물이 착지하는 순간 바깥으로 빼내기 전까지는 끝난 것이 아니다. 실행 끝까지 모아두지 않는다. worker는 branch를 push하고, verifier는 ledger 행을 쓰고, 영수증은 저장소에 남는다. VM이 죽는 순간 한 VM에만 있던 작업은 한 번도 끝난 적이 없는 것이다.

#### 생존과 실패

- 상태를 확인하려고 agent를 resume하지 않는다. resume은 유휴 agent를 다시 시작시킨다. 읽기 전용으로 조사한다. ledger, `units.tsv`, `gh`, push된 branch, Cursor 대시보드의 cloud agent 상태를 본다. transcript의 mtime은 생존의 증거가 아니다.
- 조용히 죽은 agent는 inbox에 합성 사후 분석 행(unit, 실패 모드, 마지막 증거, 선택지)을 넣는다. 증거가 도착하는 대로 증거에 근거해 다시 계획한다. 완전한 정지 상태를 기다리지 않는다.
- 모드별로 재시도한다. cap-hit나 oom이면 범위를 줄여 다시 spawn한다. network-drop이면 그대로 재시도한다. tool-error면 다른 모델로 재시도한다. 알 수 없으면 한 번 재시도한다. 두 번 재시도한 뒤에도 안 되면 그 unit을 버리고 주변을 재계획한다.
- 몇 시간 늦게 돌아온 zombie는 무엇이든 받아들이기 전에 현재 프론티어와 ledger에 대조해 정리한다. 고유한 발견은 새 unit을 통해 구제하며, 맹목적으로 merge하지 않는다.
- 계속 spawn하면 트리 전체가 쓰레기를 만들 상황(상류 산출물이 잘못되었거나, 인수 기준이 깨졌거나, 인프라가 죽은 경우)에는 standing orders 맨 위에 stop line을 쓰고, 진행 중인 작업이 끝나도록 두고, 원인을 고친 뒤 그 줄을 지운다.
- 자신의 인프라 재시도도 자식의 재시도와 같은 방식으로 제한한다. 도구 중단이 연속으로 몇 번 일어나면 재시도를 멈춘다. 지속 상태에 종료 인계를 쓴다(무엇이 끝났는지, 어디에 있는지, 다시 시작하는 정확한 명령)하고 실행을 끝낸다.
- Cursor를 재시작한 뒤에는 로컬 agent는 죽었고 cloud 작업은 살아 있다. standing orders와 `units.tsv`를 다시 읽고, 프론티어를 다시 계산하고, cloud 작업은 agent id가 아니라 PR과 branch로 다시 연결하고, track마다 sub-coordinator 하나를 저장된 브리프와 현재 상태로 다시 spawn하고, drain하고, 재개한다. 죽은 세션의 저장소 잠금은 다음 쓰기 때 스스로 풀린다. `orch`는 holder pid가 사라진 잠금을 대체한다.

#### 에스컬레이션

사람에게 가는 것은 항목별로 보내지 않고 상태 페이지에 묶어서 보낸다. 되돌릴 수 없는 작업(공유 branch에 대한 force-push, 배포, 삭제, 다른 사람의 PR 닫기), 어떤 실험으로도 정리되지 않는 제품이나 선호에 관한 결정, 관찰된 현실과 모순되는 standing order, 재계획을 거치고도 살아남은 프로그램 수준의 막다른 길. 사람에게 묻기 전에 각각을 `gates.md` 항목으로 보류하고, 작업은 그 주변으로 돌린다.

사람에게 가지 않는 것: 프론티어 독촉, restack 기계 작업, 재시도, CI flake 분류, 리뷰 스레드 분류, 포맷 수정, 브리프가 이미 금지한 범위(거절하고 계속 진행), "계속해야 할까요?". 의심스러우면 행동하고 기록한다.

중간에 발견된 사항은 프론티어를 막는 것만 고친다. 그 밖의 것은 후속 작업으로 보관한다. 이 정도의 팬아웃에서는 작은 범위 누수도 아무도 요청하지 않은 PR로 불어난다.

**응답:** 체크포인트와 close 시점에는 다음을 보고한다. 완료 조건과 `units.tsv` 및 `ledger.tsv`에서 가져온 그에 대한 개수, track과 각 track이 착지시킨 것, 프론티어(PR 목록과 SHA), verdict 요약, 버린 작업과 그 이유, 사람의 응답을 기다리는 게이트(사람에게 하는 유일한 요청), 저장소 경로, 기록 경로. 수치는 서술이 아니라 표에서 가져온다. PR 링크를 포함한다.
