---
name: continuous-learning-v2
description: 훅을 통해 세션을 관찰하고, 신뢰도 점수가 붙은 원자적 instinct를 만들며, 이를 스킬/명령/에이전트로 발전시키는 instinct 기반 학습 시스템입니다. v2.1은 프로젝트 범위 instinct를 추가해 프로젝트 간 오염을 막습니다. 세션에서 얻은 교훈을 포착하거나, instinct를 관리하거나, 스킬, 명령, 에이전트로 승격할 때 사용합니다.
metadata:
  version: 2.1.0
  origin: ECC
---

# 지속적 학습 v2.1 - Instinct
-기반 아키텍처

Claude Code 세션을 "instinct"라는 원자적 지식(신뢰도 점수가 붙은 작은 학습 행동)을 통해 재사용 가능한 지식으로 바꾸는 고급 학습 시스템입니다.

**v2.1**은 **프로젝트 범위 instinct**를 추가합니다. React 패턴은 React 프로젝트에, Python 관례는 Python 프로젝트에 머무르고, "항상 입력을 검증하라" 같은 보편적 패턴은 전역으로 공유됩니다.

## 활성화 시점

- Claude Code 세션에서 자동 학습을 설정할 때
- 훅을 통해 instinct 기반 행동 추출을 구성할 때
- 학습된 행동의 신뢰도 임계값을 조정할 때
- instinct 라이브러리를 검토, 내보내기, 가져오기 할 때
- instinct를 완전한 스킬, 명령, 에이전트로 발전시킬 때
- 프로젝트 범위와 전역 instinct를 관리할 때
- instinct를 프로젝트 범위에서 전역 범위로 승격할 때

## v2.1의 새로운 점

| 기능 | v2.0 | v2.1 |
|------|------|------|
| 저장소 | 전역(`~/.claude/homunculus/`) | 프로젝트 범위(`${XDG_DATA_HOME:-~/.local/share}/ecc-homunculus/projects/<hash>/`) |
| 범위 | 모든 instinct가 어디서나 적용됨 | 프로젝트 범위 + 전역 |
| 감지 | 없음 | git remote URL / 저장소 경로 |
| 승격 | 해당 없음 | 2개 이상의 프로젝트에서 보이면 프로젝트 → 전역 |
| 명령 | 4개 (status/evolve/export/import) | 6개 (+promote/projects) |
| 프로젝트 간 | 오염 위험 | 기본적으로 격리됨 |

## v2(v1 대비)의 새로운 점

| 기능 | v1 | v2 |
|------|----|----|
| 관찰 | Stop 훅(세션 종료) | PreToolUse/PostToolUse (100% 신뢰 가능) |
| 분석 | 메인 컨텍스트 | 백그라운드 에이전트(Haiku) |
| 세분성 | 전체 스킬 | 원자적 "instinct" |
| 신뢰도 | 없음 | 0.3-0.9 가중치 |
| 발전 | 스킬로 직행 | Instinct → 군집 → 스킬/명령/에이전트 |
| 공유 | 없음 | instinct 내보내기/가져오기 |

## Instinct 모델

instinct는 작은 학습 행동입니다.

```yaml
---
id: prefer-functional-style
trigger: "when writing new functions"
confidence: 0.7
domain: "code-style"
source: "session-observation"
scope: project
project_id: "a1b2c3d4e5f6"
project_name: "my-react-app"
---

# 함수형 스타일 선호

## Action
Use functional patterns over classes when appropriate.

## Evidence
- Observed 5 instances of functional pattern preference
- User corrected class-based approach to functional on 2025-01-15
```

**속성:**
- **원자적** -- trigger 하나, action 하나
- **신뢰도 가중** -- 0.3 = 잠정적, 0.9 = 거의 확실
- **도메인 태그** -- code-style, testing, git, debugging, workflow 등
- **근거 기반** -- 어떤 관찰이 이것을 만들었는지 추적
- **범위 인식** -- `project`(기본값) 또는 `global`

## 작동 방식

```
Session Activity (in a git repo)
      |
      | Hooks capture prompts + tool use (100% reliable)
      | + detect project context (git remote / repo path)
      v
+---------------------------------------------+
|  projects/<project-hash>/observations.jsonl  |
|   (prompts, tool calls, outcomes, project)   |
+---------------------------------------------+
      |
      | Observer agent reads (background, Haiku)
      v
+---------------------------------------------+
|          PATTERN DETECTION                   |
|   * User corrections -> instinct             |
|   * Error resolutions -> instinct            |
|   * Repeated workflows -> instinct           |
|   * Scope decision: project or global?       |
+---------------------------------------------+
      |
      | Creates/updates
      v
+---------------------------------------------+
|  projects/<project-hash>/instincts/personal/ |
|   * prefer-functional.yaml (0.7) [project]   |
|   * use-react-hooks.yaml (0.9) [project]     |
+---------------------------------------------+
|  instincts/personal/  (GLOBAL)               |
|   * always-validate-input.yaml (0.85) [global]|
|   * grep-before-edit.yaml (0.6) [global]     |
+---------------------------------------------+
      |
      | /evolve clusters + /promote
      v
+---------------------------------------------+
|  projects/<hash>/evolved/ (project-scoped)   |
|  evolved/ (global)                           |
|   * commands/new-feature.md                  |
|   * skills/testing-workflow.md               |
|   * agents/refactor-specialist.md            |
+---------------------------------------------+
```

## 프로젝트 감지

시스템은 현재 프로젝트를 자동으로 감지합니다.

1. **`CLAUDE_PROJECT_DIR` 환경 변수**(가장 높은 우선순위) -- 디렉터리가 git 저장소가 아니더라도 명시적 재정의로 존중됨(절대 경로로 해시)
2. **`git remote get-url origin`** -- 이식 가능한 프로젝트 ID를 만들기 위해 해시됨(다른 기기에서도 같은 저장소면 같은 ID)
3. **`git rev-parse --show-toplevel`** -- 저장소 경로를 쓰는 대체 수단(기기별로 다름)
4. **전역 대체** -- 프로젝트가 감지되지 않으면 instinct는 전역 범위로 갑니다.

각 프로젝트는 12자 해시 ID를 받습니다(예: `a1b2c3d4e5f6`). `${XDG_DATA_HOME:-~/.local/share}/ecc-homunculus/projects.json` 레지스트리 파일이 ID를 사람이 읽을 수 있는 이름에 매핑합니다.

### 데이터 디렉터리

continuous-learning-v2는 관찰 데이터를 `~/.claude` 바깥에 저장합니다. 그래야 Claude Code의 민감 경로 보호가 백그라운드 instinct 쓰기를 막지 않습니다.

1. 절대 경로로 설정된 `CLV2_HOMUNCULUS_DIR`
2. `$XDG_DATA_HOME/ecc-homunculus`
3. `$HOME/.local/share/ecc-homunculus`

`~/.claude/homunculus`에 데이터가 있는 기존 사용자는 한 번 마이그레이션할 수 있습니다.

```bash
bash skills/continuous-learning-v2/scripts/migrate-homunculus.sh
```

## 빠른 시작

### 1. 관찰 훅 활성화

**플러그인으로 설치한 경우** (권장):

별도의 `settings.json` 훅 블록은 필요 없습니다. Claude Code v2.1 이상은 플러그인의 `hooks/hooks.json`을 자동으로 로드하며, `observe.sh`는 이미 그곳에 등록되어 있습니다.

이전에 `observe.sh`를 `~/.claude/settings.json`에 복사했다면, 그 중복된 `PreToolUse` / `PostToolUse` 블록을 제거하십시오. 플러그인 훅과 중복되면 두 번 실행되고, `${CLAUDE_PLUGIN_ROOT}` 해석 오류가 생깁니다. 이 변수는 플러그인이 관리하는 `hooks/hooks.json` 항목 안에서만 사용할 수 있기 때문입니다.

**`~/.claude/skills`에 수동으로 설치한 경우**, `~/.claude/settings.json`에 다음을 추가하십시오.

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh"
      }]
    }],
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh"
      }]
    }]
  }
}
```

### 2. 디렉터리 구조 초기화

시스템은 첫 사용 시 디렉터리를 자동으로 만들지만, 직접 만들 수도 있습니다.

```bash
# 전역 디렉터리
mkdir -p "${XDG_DATA_HOME:-$HOME/.local/share}/ecc-homunculus"/{instincts/{personal,inherited},evolved/{agents,skills,commands},projects}

# 프로젝트 디렉터리는 git 저장소에서 훅이 처음 실행될 때 자동으로 만들어집니다
```

### 3. instinct 명령 사용

```bash
/instinct-status     # 학습된 instinct 표시 (프로젝트 + 전역)
/evolve              # 관련 instinct를 스킬/명령으로 군집화
/instinct-export     # instinct를 파일로 내보내기
/instinct-import     # 다른 사람의 instinct 가져오기
/promote             # 프로젝트 instinct를 전역 범위로 승격
/projects            # 알려진 모든 프로젝트와 instinct 개수 나열
```

## 명령

| 명령 | 설명 |
|------|------|
| `/instinct-status` | 신뢰도와 함께 모든 instinct(프로젝트 범위 + 전역)를 표시 |
| `/evolve` | 관련 instinct를 스킬/명령으로 군집화하고 승격 후보를 제안 |
| `/instinct-export` | instinct 내보내기(범위/도메인으로 필터링 가능) |
| `/instinct-import <file>` | 범위 제어와 함께 instinct 가져오기 |
| `/promote [id]` | 프로젝트 instinct를 전역 범위로 승격 |
| `/projects` | 알려진 모든 프로젝트와 instinct 개수 나열 |

## 설정

백그라운드 관찰자를 제어하려면 `config.json`을 편집하십시오.

```json
{
  "version": "2.1",
  "observer": {
    "enabled": false,
    "run_interval_minutes": 5,
    "min_observations_to_analyze": 20
  }
}
```

| 키 | 기본값 | 설명 |
|----|--------|------|
| `observer.enabled` | `false` | 백그라운드 관찰자 에이전트 활성화 |
| `observer.run_interval_minutes` | `5` | 관찰자가 관찰 내용을 분석하는 주기 |
| `observer.min_observations_to_analyze` | `20` | 분석을 실행하기 전 최소 관찰 수 |

그 밖의 동작(관찰 포착, instinct 임계값, 프로젝트 범위 설정, 승격 기준)은 `instinct-cli.py`와 `observe.sh`의 코드 기본값으로 설정됩니다.

### 관찰자 플랫폼 지원

백그라운드 관찰자는 WSL2, Linux, macOS에서 필요합니다. 네이티브 Windows(Git Bash / MSYS2)에서는 시작되었다고 보고하지만, 이를 실행한 훅이 끝나고 Job Object가 닫히면 프로세스가 종료되어 분석이 전혀 실행되지 않습니다. 따라서 그곳에서 `observer.enabled: true`를 설정하는 것은 사실상 아무 효과가 없습니다(issue #2489 참고).

`observe.sh`는 다음 훅 호출에서 이를 감지하고, 관찰자가 연속으로 여러 번 살아남지 못하면 `observer-start.log`에 설명 경고를 기록합니다.

| 환경 변수 | 기본값 | 설명 |
|-----------|--------|------|
| `ECC_OBSERVER_NOSURVIVE_WARN_AFTER` | `3` | 경고를 기록하기 전 연속으로 살아남지 못한 횟수 |

## 파일 구조

```
${XDG_DATA_HOME:-~/.local/share}/ecc-homunculus/
+-- identity.json           # 프로필, 기술 수준
+-- projects.json           # 레지스트리: 프로젝트 해시 -> 이름/경로/remote
+-- observations.jsonl      # 전역 관찰(대체 경로)
+-- instincts/
|   +-- personal/           # 전역 자동 학습 instinct
|   +-- inherited/          # 전역 가져온 instinct
+-- evolved/
|   +-- agents/             # 전역 생성 에이전트
|   +-- skills/             # 전역 생성 스킬
|   +-- commands/           # 전역 생성 명령
+-- projects/
    +-- a1b2c3d4e5f6/       # 프로젝트 해시 (git remote URL 기준)
    |   +-- project.json    # 프로젝트별 메타데이터 사본 (id/name/root/remote)
    |   +-- observations.jsonl
    |   +-- observations.archive/
    |   +-- instincts/
    |   |   +-- personal/   # 프로젝트 전용 자동 학습
    |   |   +-- inherited/  # 프로젝트 전용 가져온 것
    |   +-- evolved/
    |       +-- skills/
    |       +-- commands/
    |       +-- agents/
    +-- f6e5d4c3b2a1/       # 다른 프로젝트
        +-- ...
```

## 범위 결정 가이드

| 패턴 유형 | 범위 | 예시 |
|----------|------|------|
| 언어/프레임워크 관례 | **project** | "Use React hooks", "Follow Django REST patterns" |
| 파일 구조 선호 | **project** | "Tests in `__tests__`/", "Components in src/components/" |
| 코드 스타일 | **project** | "Use functional style", "Prefer dataclasses" |
| 오류 처리 전략 | **project** | "Use Result type for errors" |
| 보안 관행 | **global** | "Validate user input", "Sanitize SQL" |
| 일반 모범 사례 | **global** | "Write tests first", "Always handle errors" |
| 도구 워크플로 선호 | **global** | "Grep before Edit", "Read before Write" |
| Git 관행 | **global** | "Conventional commits", "Small focused commits" |

## Instinct 승격 (프로젝트 -> 전역)

같은 instinct가 높은 신뢰도로 여러 프로젝트에 나타나면, 전역 범위로 승격할 후보가 됩니다.

**자동 승격 기준:**
- 같은 instinct ID가 2개 이상의 프로젝트에 있음
- 평균 신뢰도 >= 0.8

**승격 방법:**

```bash
# 특정 instinct 승격
python3 instinct-cli.py promote prefer-explicit-errors

# 조건을 만족하는 모든 instinct 자동 승격
python3 instinct-cli.py promote

# 변경 없이 미리보기
python3 instinct-cli.py promote --dry-run
```

`/evolve` 명령도 승격 후보를 제안합니다.

## 신뢰도 점수

신뢰도는 시간이 지나면서 바뀝니다.

| 점수 | 의미 | 동작 |
|------|------|------|
| 0.3 | 잠정적 | 제안되지만 강제되지 않음 |
| 0.5 | 보통 | 관련 있을 때 적용됨 |
| 0.7 | 강함 | 적용을 자동 승인함 |
| 0.9 | 거의 확실 | 핵심 행동 |

**신뢰도가 올라가는 경우:**
- 패턴이 반복해서 관찰됨
- 사용자가 제안된 행동을 정정하지 않음
- 다른 출처의 비슷한 instinct가 일치함

**신뢰도가 내려가는 경우:**
- 사용자가 행동을 명시적으로 정정함
- 패턴이 오랫동안 관찰되지 않음
- 모순되는 근거가 나타남

## 관찰에 왜 스킬이 아니라 훅을 쓰는가?

> "v1 relied on skills to observe. Skills are probabilistic -- they fire ~50-80% of the time based on Claude's judgment."

훅은 **100% 확률로**, 결정적으로 실행됩니다. 이는 다음을 의미합니다.
- 모든 도구 호출이 관찰됨
- 어떤 패턴도 놓치지 않음
- 학습이 포괄적임

## 하위 호환성

v2.1은 v2.0 및 v1과 완전히 호환됩니다.
- 기존 전역 instinct는 `scripts/migrate-homunculus.sh`로 `~/.claude/homunculus/instincts/`에서 마이그레이션할 수 있습니다.
- v1의 기존 `~/.claude/skills/learned/` 스킬은 여전히 동작합니다.
- Stop 훅도 계속 실행되며, 이제 v2에도 데이터를 보냅니다.
- 점진적 마이그레이션: 두 방식을 병행 실행할 수 있습니다.

## 개인정보

- 관찰 내용은 사용자의 기기에 **로컬로** 남습니다.
- 프로젝트 범위 instinct는 프로젝트별로 격리됩니다.
- **instinct**(패턴)만 내보낼 수 있으며, 원시 관찰 내용은 내보낼 수 없습니다.
- 실제 코드나 대화 내용은 공유되지 않습니다.
- 무엇을 내보내고 승격할지는 사용자가 통제합니다.

## 관련 항목

- [ECC-Tools GitHub App](https://github.com/apps/ecc-tools) - 저장소 이력에서 instinct 생성
- Homunculus - v2 instinct 기반 아키텍처에 영감을 준 커뮤니티 프로젝트(원자적 관찰, 신뢰도 점수, instinct 발전 파이프라인)
- [The Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352) - 지속적 학습 섹션

---

*Instinct 기반 학습: 프로젝트마다 Claude에게 당신의 패턴을 가르치십시오.*
