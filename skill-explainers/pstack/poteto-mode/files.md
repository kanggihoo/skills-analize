# pstack/poteto-mode 읽은 파일 목록

분석 커밋: 5760176b35b502da0f3c9da759c48b4f2fb553c9
원본 텍스트 파일 44개, 합계 326,154B. 모두 끝까지 읽었다. 스크립트는 실행하지 않았다.

| 경로 | 바이트 | 역할 |
|---|---:|---|
| `pstack/poteto-mode/SKILL.md` | 20559 | 본문. frontmatter, Non-negotiables, Principles, Autonomy, Subagents, 답변 작성 규칙, 플레이북 목록 |
| `pstack/poteto-mode/playbooks/investigation.md` | 928 | 플레이북. 읽기 전용 질문에 근거 있는 답 |
| `pstack/poteto-mode/playbooks/bug-fix.md` | 2255 | 플레이북. 재현, 원인 이분 탐색, 수정, 같은 표면에서 검증 |
| `pstack/poteto-mode/playbooks/perf-issue.md` | 1446 | 플레이북. 기준 트레이스 대비 일회성 성능 수정. 성능 만트라 7단계 |
| `pstack/poteto-mode/playbooks/hillclimb.md` | 4403 | 플레이북. 지표 하나를 반복 실험으로 개선. `decision.tsv` |
| `pstack/poteto-mode/playbooks/runtime-forensics.md` | 1210 | 플레이북. 살아 있는 프로세스를 계측해 진단만 |
| `pstack/poteto-mode/playbooks/trace-forensics.md` | 1865 | 플레이북. 이미 캡처된 프로파일 파일로 진단만 |
| `pstack/poteto-mode/playbooks/feature.md` | 2766 | 플레이북. 새 동작. 처리량 점검 4항목, arena 위임 의무 |
| `pstack/poteto-mode/playbooks/refactoring.md` | 3211 | 플레이북. 동작 계약을 고정하고 구조만 바꿈 |
| `pstack/poteto-mode/playbooks/prototype.md` | 2161 | 플레이북. 결정용 버리는 스케치 |
| `pstack/poteto-mode/playbooks/visual-parity.md` | 1197 | 플레이북. 이미지 diff 0을 목표로 UI 이전 |
| `pstack/poteto-mode/playbooks/authoring-a-skill.md` | 831 | 플레이북. SKILL.md 작성·수정 |
| `pstack/poteto-mode/playbooks/eval.md` | 2524 | 플레이북. 블라인드 후보·심사로 스킬 변경 효과 측정 |
| `pstack/poteto-mode/playbooks/babysit.md` | 8289 | 플레이북. PR·스택을 merge-ready까지. 모드 4종, `watch-pr` 사용 |
| `pstack/poteto-mode/playbooks/shipping.md` | 5439 | 플레이북. 독립 검증 후 아래부터 연속 구간만 병합 |
| `pstack/poteto-mode/playbooks/autonomous-run.md` | 1878 | 플레이북. 완료 조건 하나까지 멈추지 않고 진행 |
| `pstack/poteto-mode/playbooks/orchestrate.md` | 16779 | 플레이북. 여러 날 이어지는 프로그램 조정. `orch` 사용 |
| `pstack/poteto-mode/playbooks/autopilot-full.md` | 9431 | 플레이북. 독립 PR 큐, PR별 소유자가 병합까지 |
| `pstack/poteto-mode/playbooks/autopilot-stack.md` | 5031 | 플레이북. 검증된 선형 스택을 만들어 운영자에게 넘김 |
| `pstack/poteto-mode/playbooks/session-pickup.md` | 1678 | 플레이북. 이전 에이전트 작업 이어받기 |
| `pstack/poteto-mode/playbooks/pause-safely.md` | 1135 | 플레이북. 재개 가능하게 멈추기 |
| `pstack/poteto-mode/playbooks/multi-phase-plan.md` | 12977 | 플레이북. 여러 PR 계획서 작성. 계획서 뼈대, `check-plan.mjs` 사용 |
| `pstack/poteto-mode/playbooks/worktree-cleanup.md` | 2932 | 플레이북. 워크트리·시뮬레이터 정리. `worktree-audit.sh` 사용 |
| `pstack/poteto-mode/playbooks/opening-a-pr.md` | 6142 | 플레이북. 모든 플레이북 끝에서 PR 열기 규칙 |
| `pstack/poteto-mode/references/bugbot-triage.md` | 9629 | 참조. Bugbot 댓글 fix/dismiss/ask 분류 기준과 학습 패턴 |
| `pstack/poteto-mode/scripts/package.json` | 352 | 스크립트 의존성(`commander` 14.0.0)과 test·typecheck 명령 |
| `pstack/poteto-mode/scripts/bootstrap.ts` | 1737 | 의존성 설치 확인 후 같은 명령 재실행 |
| `pstack/poteto-mode/scripts/check-plan.mjs` | 7594 | 계획서 구조 검사기 |
| `pstack/poteto-mode/scripts/worktree-audit.sh` | 3984 | 워크트리 읽기 전용 감사표 |
| `pstack/poteto-mode/scripts/orch/orch.ts` | 15511 | `orch` CLI 명령 정의 |
| `pstack/poteto-mode/scripts/orch/store.ts` | 42927 | `orch` 저장소 읽기·쓰기, 잠금, Graphite frontier 계산 |
| `pstack/poteto-mode/scripts/orch/orch.test.ts` | 18424 | `orch` 테스트 |
| `pstack/poteto-mode/scripts/watch-pr/watch-pr` | 211 | `watch-pr` 실행 진입점(bun) |
| `pstack/poteto-mode/scripts/watch-pr/cli.ts` | 6983 | `watch-pr` 옵션과 기본값, 실행 분기 |
| `pstack/poteto-mode/scripts/watch-pr/github.ts` | 24072 | `gh` 호출, 체크·리뷰 스레드·Bugbot 판정, 스택 찾기 |
| `pstack/poteto-mode/scripts/watch-pr/policy.ts` | 25132 | 차단 요인 분류, 대기·재시도, queued-stack 상태 기계 |
| `pstack/poteto-mode/scripts/watch-pr/render.ts` | 7083 | JSON·사람용 출력, 4열 상태표 |
| `pstack/poteto-mode/scripts/watch-pr/types.ts` | 12359 | 판정 종류와 종료 코드 타입 |
| `pstack/poteto-mode/scripts/watch-pr/types.compile.ts` | 2258 | 타입 계약 컴파일 검사 |
| `pstack/poteto-mode/scripts/watch-pr/tsconfig.json` | 270 | TypeScript 설정 |
| `pstack/poteto-mode/scripts/watch-pr/cli.test.ts` | 6161 | CLI 테스트 |
| `pstack/poteto-mode/scripts/watch-pr/github.test.ts` | 9059 | GitHub 읽기 테스트 |
| `pstack/poteto-mode/scripts/watch-pr/policy.test.ts` | 12397 | 판정 정책 테스트 |
| `pstack/poteto-mode/scripts/watch-pr/fakes.test-helper.ts` | 2944 | 테스트용 가짜 GitHub 읽기 |

## 제외한 파일

| 경로 | 이유 |
|---|---|
| `pstack/poteto-mode/scripts/bun.lock` (6679B) | 의존성 잠금 파일. 지시 내용이 없다. `bootstrap.ts`가 해시 입력으로 쓴다는 사실만 확인 |
| `pstack/poteto-mode/**/*.KO.md` 25개 (155,260B) | 원본이 같은 폴더에 있는 번역본 |
