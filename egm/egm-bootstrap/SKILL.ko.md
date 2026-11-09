---
name: egm-bootstrap
license: Apache-2.0
disable-model-invocation: true
description: 저장소 하위 트리 전체에 걸쳐 디렉터리별 README.md 파일을 부트스트랩한다.
---

# EGM Peanuts and Hay 부트스트랩 (`egm-bootstrap`)

Codex 또는 ChatGPT Work에서 실행할 때는 먼저 [Codex integration](../../docs/codex.md)을 읽는다.
Claude Code 또는 Cowork에서는 먼저 `${CLAUDE_PLUGIN_ROOT}/docs/claude.md`를 읽는다.

## 개요

이 스킬은 디렉터리 트리 전체에서 Elephant-and-Goldfish Model(EGM)을 따르는 `README.md` 파일의 생성, 수정, 서식 정리, 정확성 검증을 자동화한다. 사람 개발자와 AI 어시스턴트 모두를 위해 명확한 아키텍처 계약(인터페이스, 불변식, 부수 효과)을 세운다.

*   **Peanuts**: 파일별 구체적 계약을 담은 리프 수준 Component Package README다.
*   **Hay**: 하위 인터페이스 계약을 상위 수준 인덱스로 집계하는 부모 수준 Repository Blueprint다.

## 위임

Goldfish는 대화 이력이 없는 새 컨텍스트에서 실행된다. 하네스의 subagent 도구로 각 subagent를 생성한다(Antigravity: `invoke_subagent`, Claude Code: `Agent`, Codex: `spawn_agent`). 각 subagent는 `agents/<file>.md`에 정의되어 있으며, 하네스가 이름 있는 subagent를 등록하는 곳에서는 frontmatter의 `name`(예: `egm-zoom-out`)이 요청할 subagent 타입이다. 그렇지 않으면 general-purpose subagent를 생성하고 먼저 그 persona 파일을 읽으라고 지시한다. 프롬프트는 그대로 전달하고 보고를 기다린다. 하네스가 subagent 중첩을 지원하지 않으면 synthesizer 대신 direct dispatch를 사용한다. `docs/harnesses.md`를 참조한다. 하네스에 subagent 도구가 없으면 scout 단계를 인라인으로 실행한다.

## 입력

*   **`path`**: 부트스트랩할 대상 루트 디렉터리 경로다(필수).
*   **`is_worker`**: 내부 파라미터다. worker Sub-Orchestrator로 실행 중이면 `true`다(선택, 기본값: `false`).
*   **`sub_tree_root`**: 내부 파라미터다. 할당된 subtree 파티션의 루트 경로다(선택).
*   **`target_filename`**: 생성하거나 갱신할 대상 계약 파일명이다(선택, 기본값: `"README.md"`). 사람이 관리하는 기존 README를 수정하면 안 될 때는 `"EGM.md"` 같은 대체 blueprint 파일명을 지원한다.

## 실행 제약 (CRITICAL)

1.  **코드 생성 금지**: 문서 작성만 엄격히 허용된다. 기능 소스 코드를 작성하거나 리팩터링하지 않는다.
2.  **VCS 격리**: 버전 관리 커밋(`git commit`, `git add`)을 수행하지 않는다. 모든 파일 시스템 변경은 표준 파일 쓰기 도구로 로컬에 기록한다. 추적과 제출은 사람 사용자에게 맡긴다.
3.  **임시 파일 격리**: 각 worker는 status, checkpoint, log 파일을 워크스페이스 바깥의 자기 디렉터리(호스트 scratch 또는 `mktemp -d`)에 둔다. 고정된 공유 경로는 절대 쓰지 않는다. 둘 다 없으면 이 파일들은 생략한다.
4.  **도구 사용 (CRITICAL)**: 디렉터리 탐색과 계약/README 생성에는 셸, 파일 읽기, 파일 쓰기, 파일 편집 도구를 사용한다. 생성 중에 바로 깔끔한 Markdown 서식(표준 헤더, 표, 펜스드 코드 블록)을 지킨다. 저장소에 프로젝트 markdown formatter(예: `npx prettier --write`)가 명시적으로 설정되어 있으면 선택적으로 실행할 수 있다.
5.  **Subagent 위임**: sub-orchestrator worker들을 병렬로 생성한다.
6.  **필수 안전 게이트 (CRITICAL)**: 하위 디렉터리가 15개를 넘으면 전체 트리 실행이나 무제한 subagent 생성을 진행하기 전에 반드시 즉시 사용자 승인을 요청한다(하네스에 구조화된 질문 도구가 있으면 그것을, 없으면 일반 채팅을 사용한다).

---

## 워크플로

### Step 0: 생태계 및 검증 탐색

1.  저장소 루트에서 패키지/빌드 매니페스트를 확인한다:
    *   Node.js / TypeScript: `package.json` -> `npm test` (또는 `pnpm test` / `yarn test`)
    *   Rust: `Cargo.toml` -> `cargo test`
    *   Go: `go.mod` -> `go test ./...`
    *   Python: `pyproject.toml` / `pytest.ini` / `setup.py` -> `pytest`
    *   C/C++ / Make: `Makefile` -> `make test`
    *   Bazel: `BUILD` / `BUILD.bazel` -> `bazel test //...`
    *   아무것도 없으면: `<test-command>`
2.  `VerificationCommand`로 기록해 생성되는 README 계약을 채운다.

---

### Step 1: 시작 분기 제어

1.  `is_worker` 입력 파라미터를 확인한다.
2.  `is_worker`가 `true`이면 할당된 `sub_tree_root`를 처리하기 위해 바로 **Step 4: Sub-Orchestrator Worker
    Flow**로 넘어간다.
3.  `is_worker`가 `false`이거나 설정되지 않았으면 Root Orchestrator로서 **Step 2: Incremental Scoping & Safety Gate**로 진행한다.

---

### Step 2: 점진적 범위 설정 및 안전 게이트 (Root Orchestrator)

1.  **점진적 BFS 탐색**: 디렉터리 큐를 사용해 대상 `path` 트리를 레벨 단위(BFS)로 매핑하며, 한 번에 한 디렉터리 레벨만 나열한다. (CRITICAL: `find`나 `ls -R` 같은 재귀 검색은 절대 실행하지 않는다.)

    *   중간 폴더 노드를 보존한다.
    *   무한 재귀를 막기 위해 심볼릭 링크는 무시한다.
    *   숨김/시스템 디렉터리(`.git`, `.antigravity`, `node_modules`, `venv`, `dist`, `build`, `third_party`)는 무시한다.
    *   `.gitignore`와 `.egmignore`(있는 경우)를 읽고 일치하는 glob 패턴은 무시한다.
    *   패키지 및 빌드 매니페스트(`package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`, `Makefile`, `BUILD`)는 탐색 맵에 보존해 나중에 검증 대상을 추출할 수 있게 한다.

2.  **안전 게이트와 무제한 생성 승인 (CRITICAL)**: BFS 루프 중 발견된 디렉터리의 누적 개수가 **15**를 넘으면 탐색을 즉시 멈추고, 사용자에게 경고하며 전체 트리 실행 승인을 요청한다(하네스에 구조화된 질문 도구가 있으면 그것을, 없으면 일반 채팅을 사용한다):

    *   `question`: "The target directory tree contains more than 15
        subdirectories. This is a large execution scope. Do you want to proceed
        with full-tree bootstrapping?"
    *   `options`: `["Yes, proceed with full tree bootstrapping",
        "No, abort execution"]`
    *   (CRITICAL: 승인을 요청한 뒤에는 계속 진행하거나 worker를 생성하기 전에 반드시 사용자 응답을 기다린다.)
    *   사용자가 중단을 선택하면 즉시 실행을 종료한다.

3.  **상향식 사후 가지치기 패스**: 매핑이 끝나고(승인도 받은 뒤) 매핑된 트리를 아래에서 위로(리프에서 루트 방향) 순회한다. 코드가 아니거나 테스트 전용인 디렉터리를 걸러낸다:

    *   *Source Code Files*: 인식된 소스 코드, 스키마, 계약 확장자와 일치하는 파일:
        - 시스템 & 컴파일 언어: `.c`, `.cc`, `.cpp`, `.cxx`, `.h`, `.hh`, `.hpp`,
          `.rs`, `.go`, `.zig`, `.lean`
        - 관리형 & 엔터프라이즈: `.java`, `.kt`, `.scala`, `.cs`, `.fs`
        - 스크립팅 & 동적: `.py`, `.rb`, `.php`, `.lua`, `.sh`, `.bash`
        - 웹 & 모바일: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.swift`,
          `.m`, `.dart`
        - 데이터 & 스키마 / IDL: `.sql`, `.proto`, `.graphql`, `.gql`,
          `.thrift`, `.prisma`
        - 인프라 / 선언형 코드: `.tf`, `.hcl`, `.cue`
        (빌드 매니페스트, lockfile, 테스트 fixture, 문서, `.csv`, `.tsv`, `.parquet` 같은 일반 데이터 덤프는 제외한다.)
    *   *Test Directory Exclusion*: 테스트 코드만 들어 있는 디렉터리는 제외한다(예: 이름이 `tests`, `testing`, `testdata`이거나, `*_test.*`, `*Test.*`, `test_*.*`, `*.spec.*`와 일치하는 파일만 있는 경우).
    *   *Non-Code Filtering*: 소스 코드 파일이 없고 코드가 있는 하위 디렉터리도 없는 디렉터리는 모두 제외한다. 빈 중간 폴더는 코드를 담은 자식 디렉터리가 있을 때만 유지한다.

4.  가지치기된 디렉터리의 총 개수와 최대 깊이를 계산한다. **Step 3: Execution Strategy Selection**으로 진행한다.

---

### Step 3: 실행 전략 선택 (Root Orchestrator)

1.  **직접 실행 전략 (디렉터리 수 <= 5)**:

    *   가지치기 후 디렉터리 총 개수가 5개 이하이면 상향식 문서화를 현재 스레드에서 직접 실행한다.
    *   전체 `path`에 대한 worker로 Root Orchestrator를 취급하며 **Step 4: Sub-Orchestrator Worker Flow**로 넘어간 뒤, **Step 5: Root Compilation & Termination**으로 진행한다.

2.  **무제한 병렬 subagent 스웜 전략 (디렉터리 수 > 5)**:

    *   (CRITICAL: 디렉터리 수가 15를 넘으면 진행하기 전에 명시적 사용자 승인을 받았는지 반드시 확인한다. 아직 승인을 받지 않았다면 즉시 승인을 요청하고, worker를 생성하기 전에 사용자 응답을 기다린다).
    *   **Adaptive Depth Partitioning Algorithm**을 사용해 탐색 맵을 서로 독립적인 subtree 가지로 분할한다:
        1.  `depth = 1`로 설정한다.
        2.  현재 `depth`에 있는 디렉터리 노드를 탐색 맵에서 추출한다.
        3.  `depth`의 노드 수가 3~5개이면 이 노드들을 subtree 파티션 루트로 선택한다.
        4.  `depth`의 노드 수가 3개 미만이면 `depth`를 1 증가시키고(최대 3까지) 2단계를 반복한다.
        5.  `depth`의 노드 수가 5개를 넘으면 가장 큰 가지(중첩 폴더 총 개수 기준)를 3~4개의 독립 파티션으로 묶고, 남은 작은 가지는 하나의 fallback 파티션 subtree로 합친 뒤 이것들을 파티션 루트로 선택한다.
        6.  Fallback: `depth`가 3에 도달했는데도 개수가 여전히 3 미만이면 루트의 직계 자식을 선택한다(또는 순차 실행으로 전환한다).
    *   **무제한 Sub-Orchestrator 생성**: 각 파티션 subtree 루트마다 하네스의 subagent 도구로 병렬 worker를 생성한다:
        *   Subagent: `egm-bootstrap-orchestrator` (`agents/bootstrap_orchestrator.md`) (또는 general-purpose subagent)
        *   `Prompt`: "Run egm-bootstrap with path=`[path]`,
            is_worker=true, sub_tree_root=`[partition_root]`,
            target_filename=`[target_filename]`."
    *   **무제한 실행**: 안전 게이트에서 사용자가 승인한 대로, 인위적인 동시성 제한 없이 모든 Sub-Orchestrator를 병렬로 생성한다.
    *   대기 상태로 모든 worker subagent가 JSON subtree index payload를 반환할 때까지 기다린다. **Step 5: Root Compilation & Termination**으로 넘어간다.

---

### Step 4: Sub-Orchestrator Worker 흐름

1.  **Scout 등록**: 읽기 전용 `goldfish-explorer` scout를 사용한다. 하네스가 런타임에 subagent 정의를 지원하면 다음과 같이 등록한다:

    *   `name`: `goldfish-explorer`
    *   `description`: `Read-only codebase explorer scout.`
    *   `system_prompt`: >- 당신은 읽기 전용 코드베이스 탐색기다. 과업은 대상 디렉터리의
        소스 파일을 분석하고 간결하고 사실에 기반한 요약을 반환하는 것이다. 어떤 파일도
        쓰거나 수정하지 않는다. 디렉터리의 공개 심볼(interface), 불변식(invariants),
        부수 효과(side effects)를 담은 JSON 객체를 다음 스키마에 맞춰 반환한다:
        {"interface": [], "invariants": [], "side_effects": []}. 파일명이나 디렉터리명만
        보고 RPC 메서드, 라우트, 상태 enum, 불변식을 추측하지 않는다. 모든 항목에 정확한
        `[file:symbol_or_flag]`를 인용하며, 코드에 명시적인 불변식이나 부수 효과가 없으면
        `["None"]`을 출력한다.
    *   `enable_write_tools`: `false`
    *   `enable_subagent_tools`: `false`

2.  **후위 순회 (Post-Order Traversal)**: 할당된 `sub_tree_root`(또는 `path`)를 후위 순회(가장 깊은 리프부터)로 탐색한다. 각 디렉터리 `D`에 대해:

    *   **수정 정책 (Correction & Modification Policy)**: `D`에 `target_filename`(기본값: `README.md`)이 이미 있는지 확인한다.

        *   `target_filename`이 있으면 **전체를 덮어쓰지 않는다**. 대신 기존 내용을 읽는다.
        *   *Scout 스캔 요건*: `target_filename`이 있든 없든 `goldfish-explorer` scout로 `D`의 소스 코드를 **항상 스캔**해 실제 코드 심볼 경계를 모은다.
        *   *Legacy 추출 및 수정*: `target_filename`이 있으면 다음 프롬프트로 reasoning LLM을 호출한다: > "다음의 구조화되지 않은 문서 내용을 분석하라. 모든 공개 심볼 이름, 클래스, 인터페이스, 불변식, 부수 효과를 추출하라. 응답은 다음 스키마를 엄격히 따르는 JSON 객체로만 작성하라: {
            \"interface\": string[], \"invariants\": string[], \"side_effects\":
            string[] }." 추출된 심볼을 scout가 찾은 코드 심볼과 병합한다. 파일 편집 도구(또는 파일 쓰기 도구)를 사용해 기존 계약 파일을 EGM 준수 상태로 수정하고 갱신하되, 개발자 메모와 설명은 보존한다.

    *   **Scout 생성 및 제약**: `D`에 대해 `goldfish-explorer`를 생성한다.

        *   *Scout 제약*: 디렉터리별·파일별 바이트 상한은 없으며, `D`의 테스트가 아닌 모든 파일을 전체 읽는다. 대신 각 scout 호출은 소스 약 **1,500줄**로 제한한다. 검색 도구로 최상위 정의(class/func/def/route/flag 줄)를 나열하고, 디렉터리의 파일을 그 경계에서 청크로 나눈다(본문 중간에서 자르지 않으며, 작은 파일은 한 청크에 함께 넣는다). 청크마다 `goldfish-explorer`를 하나씩 병렬로 생성하고 그 JSON을 병합한다. 각 청크에는 파일의 import와 최상위 정의 목록을 함께 넘겨 가시성을 판단할 수 있게 한다. RPC 서비스, 스키마, 메시지 타입을 로컬 파일에 귀속시키기 전에 빌드 매니페스트 의존성과 `import` / `#include` 문을 확인한다. 테스트가 아닌 파일은 다음 순서로 읽는다:
            1.  계약, 스키마, 빌드 매니페스트(`.h`, `.hh`, `.hpp`, `.proto`, `.graphql`, `.gql`, `.thrift`, `.prisma`, `.sql` DDL, 인터페이스 클래스)를 먼저 읽는다. 정확한 DDL 테이블 이름과 export된 빌드 타겟을 추출한다.
            2.  모듈 진입점(`main.*`, `index.*`, `lib.*`, `mod.*`, `__init__.py`, 또는 디렉터리 이름과 일치하는 파일)을 읽고, 이어서 운영 소스/쿼리 파일을 알파벳 순으로 읽는다.
            3.  템플릿과 설정: 파일당 최대 200줄(설정만 있는 디렉터리는 800줄). `.css`/`.scss`는 제외한다.
            4.  테스트 파일(`*_test.*`, `*Test.*`, `test_*.*`, `*.spec.*`): 혼합 디렉터리에 있더라도 완전히 무시한다.
        *   *하위 결함 허용*: scout가 실패하거나 시간 초과되면 경고를 기록하고, placeholder 값 `["(Details pending/documentation failed)"]`을 사용해 실행을 계속한다.

    *   **부모 컨텍스트 전파 (Parent Context Propagation)**: 부모 디렉터리 `P`를 처리할 때 직계 자식 subdirectory들의 컴파일된 인터페이스 요약을 가져온다.

        *   *전파 휴리스틱*:
            1.  자식이 이번 실행에서 문서화되었으면 공개 인터페이스를 메모리 내 실행 캐시에서 바로 가져온다.
            2.  자식이 (수정 정책에 따라) 수정되었으면 병합된 legacy 추출 심볼을 사용한다.
        *   `P`의 explorer scout를 호출할 때 이 자식 심볼 블록을 프롬프트 컨텍스트로 넘긴다.

    *   **검증 명령 대상 조회**: 발견한 `VerificationCommand`로 Verification 섹션을 채운다.
        *   프로젝트가 Bazel/BUILD 파일을 쓰면: `D` 또는 가장 가까운 상위 디렉터리에 `BUILD` 파일이 있는지 확인한다. 유효한 타겟 패턴(`//[package_path]/...` 또는 `//[package_path]:all`, `//[package_path]...`나 `//[package_path]:...`는 절대 쓰지 않음)을 사용하는 `bazel test` / `bazel build`를 참조한다. 대화형 러너 타겟에는 `bazel run`을 사용한다.
        *   프로젝트가 다른 매니페스트(`package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`, `Makefile`)를 쓰면 해당 테스트 러너 명령으로 채운다.
        *   검증 명령을 찾지 못하면 생략하거나 placeholder를 사용한다.

    *   **디렉터리 분류 및 템플릿 생성**: `D`의 분류에 따라 파일 쓰기 도구 또는 파일 편집 도구로 `target_filename`을 생성하거나 수정한다.

        *   *Component Package (Peanut)*: `D`에 소스 코드 파일이 직접 들어 있다. **Component Package README Template**을 사용한다. (하위 subdirectory도 있으면 Interface 섹션에 그 계약으로 가는 상대 링크를 포함한다.)
        *   *Repository Blueprint (Hay)*: `D`에는 소스 코드 파일이 직접 없지만 코드 계약을 가진 subdirectory가 있다. **Intermediate Blueprint README Template**을 사용한다.
        *   *링크 서식 정책 (CRITICAL)*: 패키지 계약 파일은 이식성과 명확성의 균형을 맞추기 위해 혼합 링크 서식을 사용해야 한다:
            1.  **존재하는 파일에 대한 상대 링크만 사용**: 같은 코드베이스 서브시스템 안의 자식 계약과 형제 파일 참조에는 상대 경로(예: `./child/${target_filename}` 또는 `../sibling/${target_filename}`)를 사용한다. (CRITICAL: 가지치기된 `subtree_index`에 있고 실제 `${target_filename}`을 포함하는 자식 디렉터리에 대해서만 `[Child](./child/${target_filename})` 링크를 만든다. 자식 디렉터리에 `SKILL.md`나 다른 비계약 자산이 있으면 `./child/SKILL.md`로 직접 링크하거나 링크 없는 bullet 항목으로 쓴다. 존재하지 않는 계약 파일로 향하는 추측성 링크는 절대 출력하지 않는다.)
            2.  **절대 링크**: 패키지 서브시스템 바깥의 파일(예: 패키지 간 의존성)을 참조할 때는 표준 URL이나 저장소 경로를 사용한다.

    *   **Markdown 서식**: `D`에서 `target_filename`을 쓰거나 수정한 직후 깔끔한 markdown 서식(유효한 헤더, 표, 코드 펜스)을 확인한다. 저장소에 프로젝트 markdown formatter(예: `npx prettier --write`)가 설정되어 있으면 `target_filename`에 실행해도 된다.

3.  **Worker 보고**: 할당된 subtree 순회가 끝나면 처리한 모든 디렉터리의 `path`, `summary`, `interface`, `invariants`, `side_effects`를 담은 `subtree_index` 배열을 만든다.

4.  `is_worker`가 `true`이면 이 스킬 디렉터리 기준 [Worker Return Interface Schema](references/worker-return.schema.json)를 읽고, 그 스키마에 맞는 JSON payload를 Root Orchestrator에 반환한 뒤 종료한다. `is_worker`가 `false`(순차 모드)이면 바로 **Step 5: Root Compilation & Termination**으로 진행한다.

---

### Step 5: Root 컴파일 및 종료 (Root Orchestrator)

1.  **Worker payload 수신**: 모든 병렬 Sub-Orchestrator가 반환한 JSON `subtree_index` payload를 모은다.

    *   **Root 결함 허용**: 병렬 worker가 실패하거나 시간 초과되면 경고를 기록하고, root Blueprint의 subdirectory 인덱스에 placeholder 경고 링크(`[Subtree Root]
        (Documentation failed / Subagent execution timeout)`)를 넣은 뒤 나머지 컴파일을 마친다. (부분 파일을 남긴 worker 실패는 점진적 진행 기능으로 처리한다. 수정 정책에 따라 이후 실행에서 이어서 작업할 수 있다.)

2.  **중간 디렉터리 문서화**: root `path`와 파티션된 subtree 루트 사이에 있는 중간 디렉터리를 찾는다.

    *   이 중간 디렉터리들을 아래에서 위로 순차 처리한다.
    *   worker가 반환한 컴파일된 요약을 사용해 Intermediate Blueprint 계약 파일을 생성한다.
    *   각 Intermediate Blueprint 계약 파일의 서식을 깔끔하게 하고 상대 링크가 유효한지 확인한다.

3.  **Root 디렉터리 문서화**: 실행 대상 root `path`는 *항상* **Repository Root (Blueprint / Hay)**로 분류한다.

    *   `path`에 `target_filename`이 이미 있는지 확인한다. 있으면 **Correction & Modification Policy**를 적용해 root 계약 파일 상단의 기존 제목, 메타데이터, 아키텍처 개요를 읽고 유지한다.
    *   `path` 자체에 소스 파일이 직접 들어 있는지 확인한다. 있으면 `path`에 대해 `goldfish-explorer` scout를 생성해 로컬 심볼과 불변식을 추출하고, 선택 섹션 `## Local Interface & Invariants` 아래에 덧붙인다.
    *   **Repository Root Blueprint Template**을 사용해 최종 root `target_filename`을 컴파일하고, 최상위 subdirectory 경계를 모두 집계한다. root 아키텍처나 시퀀스 다이어그램이 있다면 자식 `subtree_index` payload의 동기/비동기 경계, 작업 이름, 스토리지 백엔드와 정확히 일치시키며, 검증되지 않은 노드는 만들어내지 않는다.
    *   파일 쓰기 도구로 root `target_filename`을 기록한다.

4.  **최종 정확성 검증 (CRITICAL)**: 작업을 마치기 전에 `subtree_index`의 생성되거나 수정된 **모든** 계약 파일(`pkg1/${target_filename}`, `pkg2/${target_filename}` 같은 자식 패키지 계약 포함)에 대해 최종 검증 패스를 반드시 수행한다. 생성되거나 수정된 계약 파일을 하나도 빠짐없이 명시적으로 읽어 내용을 검증한다. 자식 계약 파일은 하나도 건너뛰지 않는다. 다음을 검증한다:

    *   *EGM 준수 및 코드 근거*: `Interface`, `Invariants`, `Side Effects` 섹션이 존재하는지, scout 추출 결과의 실제 코드 심볼/플래그/테이블을 인용하는지, 추측성이거나 검증되지 않은 주장이 전혀 없는지 확인한다.
    *   *Markdown 문법*: 깔끔한 헤더, 유효한 표, 올바른 코드 블록 펜스를 확인한다.
    *   *유효하고 해석 가능한 링크 (CRITICAL)*: 모든 subdirectory 및 형제 링크가 유효한 상대 경로(`./subdir/${target_filename}` 또는 `./subdir/SKILL.md`)를 쓰는지 확인하고, 참조된 대상 파일이 파일 시스템에 실제로 존재하는지 명시적으로 검증한다. 깨진 상대 참조는 제거하거나 고친다.
    *   *유효한 타겟*: 검증 타겟이 프로젝트 테스트 설정과 맞고 유효한 타겟 문법을 쓰는지 확인한다(Bazel은 `/...` 또는 `:all`을 쓰고, `:...`는 절대 쓰지 않는다).

5.  **선택적 드리프트 검토 (CRITICAL)**: 검증 후 사용자에게 (구조화된 질문 도구가 있으면 그것을, 없으면 일반 채팅으로) 생성된 문서 갱신에 대해 드리프트 리포트 실행을 제안하고 묻는다:

    *   `question`: "Do you want to run the EGM Drift Report on the generated
        contract updates to check for consistency with the codebase?"
    *   `options`: `["(Recommended) Yes, run drift report on modified contracts",
        "No, skip drift review"]`
    *   사용자가 "Yes"를 선택하면 `egm-drift-report` 스킬을 실행해 수정된 계약을 대상으로, 코드 커버리지 누락과 문서-코드 간 환각을 모두 검증한다(문서에 적힌 모든 메서드, 라우트, enum, 데이터베이스 테이블, 불변식을 로컬 소스 파일과 대조하고, 불일치를 사람이 검토할 수 있도록 드리프트 리포트에 기록한다). (참고: `egm-drift-report`는 흔히 설계 문서에 쓰지만, 변형으로서 EGM 준수 계약에도 적용할 수 있다.)

6.  실행을 성공적으로 종료한다.

---

## 템플릿

계약 파일을 쓰기 전에 이 스킬 디렉터리 기준 [README templates](references/templates.md)를 읽는다. 여기에는 위에서 참조한 **Component Package (Peanuts)**, **Repository Root (Blueprint / Hay)**, **Intermediate Blueprint** README 템플릿이 정의되어 있다.
