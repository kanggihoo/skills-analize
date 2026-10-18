---
name: opensource-pipeline
description: "오픈소스 파이프라인: 비공개 프로젝트를 fork하고, 시크릿을 제거하고, 안전한 공개 배포를 위해 패키징합니다. 3개의 에이전트(forker, sanitizer, packager)를 연결합니다. 트리거: '/opensource', 'open source this', 'make this public', 'prepare for open source'. 비공개 프로젝트를 fork하고, 시크릿을 제거하고, 공개 배포용으로 패키징해야 할 때 사용합니다."
metadata:
  origin: ECC
---

# 오픈소스 파이프라인 스킬

3단계 파이프라인을 통해 모든 프로젝트를 안전하게 오픈소스로 공개합니다: **Fork**(시크릿 제거) → **Sanitize**(깨끗함 검증) → **Package**(CLAUDE.md + setup.sh + README).

## 활성화 시점

- 사용자가 "open source this project" 또는 "make this public"이라고 말할 때
- 사용자가 비공개 저장소를 공개 배포용으로 준비하려 할 때
- 사용자가 GitHub에 push하기 전에 시크릿을 제거해야 할 때
- 사용자가 `/opensource fork`, `/opensource verify`, `/opensource package`를 호출할 때

## 명령어

| 명령어 | 동작 |
|---------|--------|
| `/opensource fork PROJECT` | 전체 파이프라인: fork + sanitize + package |
| `/opensource verify PROJECT` | 기존 저장소에 sanitizer 실행 |
| `/opensource package PROJECT` | CLAUDE.md + setup.sh + README 생성 |
| `/opensource list` | 스테이징된 모든 프로젝트 표시 |
| `/opensource status PROJECT` | 스테이징된 프로젝트의 리포트 표시 |

## 프로토콜

### /opensource fork PROJECT

**전체 파이프라인 — 핵심 워크플로우.**

#### 1단계: 매개변수 수집

프로젝트 경로를 확인합니다. PROJECT에 `/`가 포함되어 있으면 경로(절대 또는 상대)로 취급합니다. 그렇지 않으면 현재 작업 디렉터리, `$HOME/PROJECT` 순으로 확인하고, 없으면 사용자에게 묻습니다.

```
SOURCE_PATH="<resolved absolute path>"
STAGING_PATH="$HOME/opensource-staging/${PROJECT_NAME}"
```

사용자에게 묻습니다:
1. "어떤 프로젝트인가요?" (찾지 못한 경우)
2. "라이선스는 무엇인가요? (MIT / Apache-2.0 / GPL-3.0 / BSD-3-Clause)"
3. "GitHub 조직 또는 사용자 이름은 무엇인가요?" (기본값: `gh api user -q .login`으로 감지)
4. "GitHub 저장소 이름은 무엇인가요?" (기본값: 프로젝트 이름)
5. "README에 넣을 설명은 무엇인가요?" (프로젝트를 분석해 제안)

#### 2단계: 스테이징 디렉터리 생성

```bash
mkdir -p $HOME/opensource-staging/
```

#### 3단계: Forker 에이전트 실행

`opensource-forker` 에이전트를 호출합니다:

```
Agent(
  description="Fork {PROJECT} for open-source",
  subagent_type="opensource-forker",
  prompt="""
Fork project for open-source release.

Source: {SOURCE_PATH}
Target: {STAGING_PATH}
License: {chosen_license}

Follow the full forking protocol:
1. Copy files (exclude .git, node_modules, __pycache__, .venv)
2. Strip all secrets and credentials
3. Replace internal references with placeholders
4. Generate .env.example
5. Clean git history
6. Generate FORK_REPORT.md in {STAGING_PATH}/FORK_REPORT.md
"""
)
```

완료될 때까지 기다린 후 `{STAGING_PATH}/FORK_REPORT.md`를 읽습니다.

#### 4단계: Sanitizer 에이전트 실행

`opensource-sanitizer` 에이전트를 호출합니다:

```
Agent(
  description="Verify {PROJECT} sanitization",
  subagent_type="opensource-sanitizer",
  prompt="""
Verify sanitization of open-source fork.

Project: {STAGING_PATH}
Source (for reference): {SOURCE_PATH}

Run ALL scan categories:
1. Secrets scan (CRITICAL)
2. PII scan (CRITICAL)
3. Internal references scan (CRITICAL)
4. Dangerous files check (CRITICAL)
5. Configuration completeness (WARNING)
6. Git history audit

Generate SANITIZATION_REPORT.md inside {STAGING_PATH}/ with PASS/FAIL verdict.
"""
)
```

완료될 때까지 기다린 후 `{STAGING_PATH}/SANITIZATION_REPORT.md`를 읽습니다.

**FAIL인 경우:** 발견 사항을 사용자에게 보여줍니다. "이 문제들을 수정하고 다시 스캔할까요, 아니면 중단할까요?"라고 묻습니다.
- 수정하는 경우: 수정 사항을 적용하고 sanitizer를 다시 실행합니다(최대 3회 재시도 — 3회 연속 FAIL이면 모든 발견 사항을 제시하고 사용자에게 수동 수정을 요청합니다).
- 중단하는 경우: 스테이징 디렉터리를 정리합니다.

**PASS 또는 PASS WITH WARNINGS인 경우:** 5단계로 계속합니다.

#### 5단계: Packager 에이전트 실행

`opensource-packager` 에이전트를 호출합니다:

```
Agent(
  description="Package {PROJECT} for open-source",
  subagent_type="opensource-packager",
  prompt="""
Generate open-source packaging for project.

Project: {STAGING_PATH}
License: {chosen_license}
Project name: {PROJECT_NAME}
Description: {description}
GitHub repo: {github_repo}

Generate:
1. CLAUDE.md (commands, architecture, key files)
2. setup.sh (one-command bootstrap, make executable)
3. README.md (or enhance existing)
4. LICENSE
5. CONTRIBUTING.md
6. .github/ISSUE_TEMPLATE/ (bug_report.md, feature_request.md)
"""
)
```

#### 6단계: 최종 검토

사용자에게 다음을 보여줍니다:
```
Open-Source Fork Ready: {PROJECT_NAME}

Location: {STAGING_PATH}
License: {license}
Files generated:
  - CLAUDE.md
  - setup.sh (executable)
  - README.md
  - LICENSE
  - CONTRIBUTING.md
  - .env.example ({N} variables)

Sanitization: {sanitization_verdict}

Next steps:
  1. Review: cd {STAGING_PATH}
  2. Create repo: gh repo create {github_org}/{github_repo} --public
  3. Push: git remote add origin ... && git push -u origin main

Proceed with GitHub creation? (yes/no/review first)
```

#### 7단계: GitHub 게시 (사용자 승인 후)

```bash
cd "{STAGING_PATH}"
gh repo create "{github_org}/{github_repo}" --public --source=. --push --description "{description}"
```

---

### /opensource verify PROJECT

Sanitizer를 독립적으로 실행합니다. 경로 확인: PROJECT에 `/`가 포함되어 있으면 경로로 취급합니다. 그렇지 않으면 `$HOME/opensource-staging/PROJECT`, `$HOME/PROJECT`, 현재 디렉터리 순으로 확인합니다.

```
Agent(
  subagent_type="opensource-sanitizer",
  prompt="Verify sanitization of: {resolved_path}. Run all 6 scan categories and generate SANITIZATION_REPORT.md."
)
```

---

### /opensource package PROJECT

Packager를 독립적으로 실행합니다. "라이선스는?"과 "설명은?"을 묻고 나서 다음을 호출합니다:

```
Agent(
  subagent_type="opensource-packager",
  prompt="Package: {resolved_path} ..."
)
```

---

### /opensource list

```bash
ls -d $HOME/opensource-staging/*/
```

각 프로젝트의 파이프라인 진행 상황(FORK_REPORT.md, SANITIZATION_REPORT.md, CLAUDE.md 존재 여부)을 표시합니다.

---

### /opensource status PROJECT

```bash
cat $HOME/opensource-staging/${PROJECT}/SANITIZATION_REPORT.md
cat $HOME/opensource-staging/${PROJECT}/FORK_REPORT.md
```

## 스테이징 구조

```
$HOME/opensource-staging/
  my-project/
    FORK_REPORT.md           # forker 에이전트에서 생성
    SANITIZATION_REPORT.md   # sanitizer 에이전트에서 생성
    CLAUDE.md                # packager 에이전트에서 생성
    setup.sh                 # packager 에이전트에서 생성
    README.md                # packager 에이전트에서 생성
    .env.example             # forker 에이전트에서 생성
    ...                      # 정리된 프로젝트 파일
```

## 안티 패턴

- 사용자 승인 없이 GitHub에 push하는 것은 **절대** 하지 않습니다
- sanitizer를 건너뛰는 것은 **절대** 하지 않습니다 — 안전 게이트이기 때문입니다
- sanitizer가 FAIL한 뒤 치명적(critical) 발견 사항을 모두 수정하지 않고 진행하는 것은 **절대** 하지 않습니다
- 스테이징 디렉터리에 `.env`, `*.pem`, `credentials.json`을 남겨두는 것은 **절대** 하지 않습니다

## 모범 사례

- 새 릴리스에는 항상 전체 파이프라인(fork → sanitize → package)을 실행합니다
- 스테이징 디렉터리는 명시적으로 정리하기 전까지 유지되며, 검토용으로 사용합니다
- 수동 수정 후에는 게시 전에 sanitizer를 다시 실행합니다
- 시크릿은 삭제하기보다 매개변수화하여 프로젝트 기능을 보존합니다

## 관련 스킬

sanitizer가 사용하는 시크릿 탐지 패턴은 `security-review`를 참고하세요.
