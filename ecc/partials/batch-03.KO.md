# batch-03

### agent-self-evaluation

- **한 줄 요약**: 복잡한 작업을 끝낸 뒤 에이전트가 5개 축(accuracy, completeness, clarity, actionability, conciseness)으로 자기 산출물을 1~5점 채점하고 개선안을 내는 스킬.
- **설명**: 3개 파일 이상 코드 작성, 다단계 워크플로, 3회 이상 시도한 디버깅 등이 끝난 뒤(또는 Stop hook 연동 시) 사용한다. 원 요청, 최종 출력, 테스트/린트 같은 도구 출력, 사용자 피드백을 모은 뒤 각 축을 독립적으로 채점하고 템플릿 기반 리포트(한 줄 요약, 스코어카드, 평균, 개선 1~3개, "사용자가 동의할까?" 자기 점검)를 만든다. 3점 이하 축은 즉시 고치거나 재작업 방안을 명시한다. 보조 디렉터리(examples, references, scripts, templates)가 있다.
- **분류**: 검증 / 자기 평가(리플렉션)
- **관련도**: High
- **관련 축**: V, F
- **판단 근거**: 5점 미만에는 반드시 구체적 증거를 인용하는 "Evidence Rule", 축별 독립 채점, "Everything is a 5" 같은 안티패턴 명시 등 AI 출력의 자기 검증 절차가 핵심 목적이다. 단 pass/fail 게이트가 아닌 성찰 단계이며 채점자가 작업 수행자 본인이다.
- **관심 포인트**: 증거 없는 점수 금지 규칙, 평균을 먼저 정하고 역산하지 못하게 하는 독립 채점, 도구 출력(테스트·린트)을 증거로 쓰는 원칙, Stop hook 연계, 자기 채점의 과대평가 편향을 막는 안티패턴 목록. 한계: 자기 평가라 외부 검증을 대체하지 못한다.
- **확신도**: 중간

### configure-ecc

- **한 줄 요약**: 현재 하네스(Claude Code/Codex/Kimi) 안에서 ECC 설치의 범위와 hook 모드를 대화형으로 설정하고 미리보기-적용-검증하는 설치 마법사 스킬.
- **설명**: 설치 현황을 조회(inventory)한 뒤 Claude Code에서는 scope(user/project/local)와 hook 모드(off/minimal/standard/strict) 두 가지만 묻는다. `--dry-run --json`으로 미리보기를 보여 1회 확인을 받고, `--yes --json`으로 적용한 뒤 종료코드와 `claude plugin list --json`으로 독립 검증하고 성공 시에만 welcome을 렌더링한다. Codex는 네이티브 플러그인 수명주기, Kimi는 `./.kimi-code` 프로젝트 설치와 `ecc doctor`를 사용한다.
- **분류**: 인프라 / 설치·설정
- **관련도**: Low
- **관련 축**: F
- **판단 근거**: 본문 대부분이 ECC 설치 절차(플러그인 명령, 스코프 이동)다. 다만 dry-run 미리보기 후 1회 확인, 적용 뒤 독립 검증, 모호한 상태에서 추측 삭제 금지 같은 안전 패턴이 소량 있고, hook 프로파일 선택을 다루지만 hook 설계 자체가 아니라 설치 옵션 선택이다.
- **관심 포인트**: -
- **확신도**: 중간

### deep-research

- **한 줄 요약**: firecrawl/exa MCP로 다중 웹 소스를 검색·정독해 인라인 인용과 신뢰도가 붙은 리서치 보고서를 만드는 스킬.
- **설명**: 목표 확인, 3~5개 하위 질문 분해, 질문별 다중 검색(총 15~30 소스), 핵심 3~5개 소스 전문 정독, 보고서 작성(Executive Summary, 주제별 인용, Key Takeaways, Sources, Methodology), 전달 순으로 진행한다. 넓은 주제는 서브에이전트로 병렬화한다. "Untrusted Sources" 절은 수집 콘텐츠를 지시가 아닌 데이터로만 취급하고 출처 속 에이전트용 문구는 보고서에 표시하라고 규정한다.
- **분류**: 도메인-업무(리서치)
- **관련도**: Low
- **관련 축**: V, I
- **판단 근거**: 웹 리서치 자동화라 GUIDE 제외 대상(도메인 업무)이다. 다만 Quality Rules(모든 주장에 출처, 단일 출처는 unverified, 사실/추론 분리, 데이터 부족 시 "insufficient data")와 프롬프트 인젝션 방어 절이 AI 출력 검증·입력 신뢰 경계 패턴으로 참고할 만하다.
- **관심 포인트**: -
- **확신도**: 중간

### documentation-lookup

- **한 줄 요약**: 라이브러리/프레임워크 질문에 학습 데이터 대신 Context7 MCP로 최신 문서를 조회해 답하는 스킬.
- **설명**: resolve-library-id로 `/org/project` 형식 ID를 얻고(이름 일치, 벤치마크 점수, 평판, 버전으로 선택) query-docs로 문서를 가져와 답한다. 질문당 호출 3회 제한, 불명확하면 불확실성을 밝히고 추측하지 않으며, 쿼리에서 시크릿을 제거하라는 규칙이 있다. 산출물은 조회된 문서에 근거한 답과 코드 예시다.
- **분류**: 도구 사용법 / 문서 조회
- **관련도**: Low
- **관련 축**: V
- **판단 근거**: 본문은 Context7 MCP 호출 절차다. 학습 데이터 대신 현재 문서에 근거하게 해 환각을 줄이는 간접적 효과와 호출 횟수 제한, 시크릿 redaction 규칙만 통제 요소다.
- **관심 포인트**: -
- **확신도**: 높음

### eval-harness

- **한 줄 요약**: 구현 전에 capability/regression eval을 정의하고 code/model/rule/human grader로 채점하며 pass@k, pass^k로 신뢰도를 추적하는 eval 주도 개발(EDD) 프레임워크.
- **설명**: Define(코딩 전 eval 정의) → Implement → Evaluate → Report 4단계로 진행한다. Capability eval과 Regression eval(baseline SHA 대비) 포맷, 4종 grader, pass@1/pass@3/pass^3 지표와 권장 임계값(capability pass@3>=0.90, release-critical regression pass^3=1.00)을 제시한다. `.claude/evals/<feature>.md/.log`, baseline.json에 정의와 실행 이력을 저장하고 `/eval define|check|report`를 쓴다. 로컬 유틸(`scripts/lib/eval-harness`)은 hash-linked journal capsule, replay, receipt를 제공하나 후보 실행(gate run)은 OS 격리 백엔드가 없어 전부 거부(`gate.isolation_required`)한다.
- **분류**: 검증 / eval
- **관련도**: High
- **관련 축**: V, L, F
- **판단 근거**: AI 작업의 통과 기준을 사전에 정의하고 채점·회귀 추적하는 것이 핵심 목적이다. 해시 연결 journal과 receipt 오프라인 검증, 격리 없는 후보 실행 거부, "flaky grader를 릴리스 게이트에 쓰지 말 것" 등 구체 통제가 있다.
- **관심 포인트**: 코딩 전 eval 정의(테스트 선행과 유사), deterministic grader 우선·보안은 사람 검토, pass@k vs pass^k 구분, eval 이력/baseline의 버전 관리, fail-closed 설계와 "capsule receipt를 격리/승격 증거로 제시하지 말 것"이라는 과대주장 방지 문구, eval 오버피팅·비용/지연 드리프트 안티패턴.
- **확신도**: 높음

### orch-build-mvp

- **한 줄 요약**: 설계/스펙 문서(SDD/PRD)를 읽어 얇은 수직 슬라이스로 계획하고 GAN 하니스의 generator-evaluator 루프로 MVP를 빌드하는 오케스트레이션 래퍼.
- **설명**: 공유 엔진 `orch-pipeline`을 phase mask 0→1→2→3(scaffold)→4→5→6으로 실행한다. 스펙에서 범위, 확정 결정, 기능 목록을 추출해 수직 슬라이스 순으로 정렬하고, SDD를 `gan-harness/spec.md`와 `eval-rubric.md`로 변환해 `/gan-build --skip-planner`(max-iterations 15, pass-threshold 7.0, playwright 또는 code-only 평가)를 돌린다. 평가 피드백은 `feedback-NNN.md`로 남고 점수 통과 또는 정체까지 반복한다. Gate 1(슬라이스 계획)과 Gate 2(커밋 전)에서 멈추며 슬라이스마다 별도 `feat:` 커밋, 보안 트리거 시 security-reviewer를 추가한다.
- **분류**: 오케스트레이션
- **관련도**: High
- **관련 축**: F, V, I
- **판단 근거**: 단계(phase mask), 사람 승인 Gate 1/2, generator-evaluator 루프(임계 점수, 최대 반복, 정체 종료), 피드백 파일 기록으로 AI 빌드 흐름을 제어하는 것이 핵심이다. 상세 엔진 로직은 orch-pipeline에 있어 이 파일은 설정 래퍼 수준이다.
- **관심 포인트**: 스펙을 eval-rubric으로 변환해 평가 기준을 고정, 점수 임계값과 반복 상한 및 plateau 종료, 슬라이스 단위 게이트와 커밋 분리, 보안 트리거 시 리뷰어 추가, 기존 하니스 재사용 원칙.
- **확신도**: 중간

### orch-fix-defect

- **한 줄 요약**: 버그를 실패하는 회귀 테스트로 먼저 재현하고 green까지 고친 뒤 리뷰하고 게이트를 거쳐 커밋하는 오케스트레이션 래퍼.
- **설명**: `orch-pipeline` 엔진을 phase mask 0→(근본 원인이 불명확할 때만 경량 2)→4→5→6으로 실행하며 리서치(1)는 보통 생략한다. 첫 동작은 새 실패 테스트(regression test)로 버그를 재현하는 것으로, "버그 존재를 먼저 증명하는 것이 수정과 땜질을 가른다"고 명시한다. 원인이 불명확하면 code-explorer, 빌드 오류는 build-error-resolver로 에스컬레이션하고 Gate 2(커밋 전)에서 확인을 받으며 `fix:` 커밋을 만든다. 보안 민감 경로면 security-reviewer를 추가한다.
- **분류**: 오케스트레이션 / 검증
- **관련도**: High
- **관련 축**: F, V
- **판단 근거**: red-then-green 회귀 테스트 선행, 단계별 에이전트 위임, 커밋 전 사람 게이트로 AI 버그 수정 흐름을 통제한다. 본문이 짧은 래퍼라 세부 메커니즘은 orch-pipeline에 의존한다.
- **관심 포인트**: 실패 테스트로 재현 후 수정이라는 증명 순서, 크기(small)에 맞춰 phase를 생략하는 mask, 형제 스킬(change-feature/add-feature)과의 구분 기준, Gate 2 커밋 확인.
- **확신도**: 중간

### terminal-ops

- **한 줄 요약**: 저장소에서 명령 실행·CI 디버깅·좁은 수정을 할 때 실제 실행 증거와 정확한 상태 단어로 보고하게 하는 증거 우선 운영 워크플로.
- **설명**: 작업 표면(repo 경로, 브랜치, diff 상태, inspect/fix/verify/push 모드)을 확정하고, 수정 전에 실패 표면(에러, 파일, git 상태)을 먼저 읽고, 한 번에 하나의 지배적 실패를 가장 작은 증명 명령으로 고친다. 상태를 inspected / changed locally / verified locally / committed / pushed / blocked 정확한 용어로 보고하고 SURFACE-EVIDENCE-ACTION-STATUS 출력 형식을 쓴다. 증명 명령을 다시 돌리기 전엔 fixed라 하지 않고, 실제로 upstream이 이동하기 전엔 pushed라 하지 않는다. verification-loop, tdd-workflow, security-review 등과 조합한다.
- **분류**: 검증 / 운영 워크플로
- **관련도**: High
- **관련 축**: V, I, F
- **판단 근거**: "do not claim fixed until the proving command was rerun", "do not claim pushed unless the branch actually moved" 같은 주장-증거 일치 규칙과 상태 어휘 표준화, 읽기 전용 모드 준수, 파괴적 git 명령 금지 가드레일이 본문 핵심이다.
- **관심 포인트**: 완료 주장과 증거를 묶는 상태 단어 체계(local 검증 vs commit vs push 구분), 동일 실패 시그니처 반복 시 광범위 재시도 중단, 라이브 repo 상태를 기억 대신 읽기, 응답에 증명 명령/브랜치 명시를 요구하는 Verification 절.
- **확신도**: 높음
