---
name: ecc-guide
description: ECC에 대한 질문에 기억이 아니라 현재 저장소의 실제 파일(에이전트, 스킬, 명령, hook, 규칙, 설치 프로필, 문서)을 읽어 답합니다. 사용자가 ECC에 무엇이 포함되는지, 설치 또는 초기화 방법, 특정 작업에 맞는 스킬이나 명령, 프로젝트 온보딩 방식을 물을 때 사용합니다.
metadata:
  origin: community
---

# ECC 가이드

사용자가 ECC를 이해하고, 둘러보고, 설치하고, 일부 구성 요소를 고르는 데 도움이 필요할 때 이 스킬을 사용합니다.

## 사용 시점

사용자가 다음과 같이 요청할 때 이 스킬을 사용합니다.

- ECC에 무엇이 포함되는지 묻는 경우
- 스킬, 명령, 에이전트, hook, 규칙, 설치 프로필을 찾고 싶은 경우
- 저장소가 처음이라 안내된 경로가 필요한 경우
- "ECC로 X를 하려면 어떻게 하나요?"라고 묻는 경우
- 어떤 ECC 구성 요소가 프로젝트에 맞는지 묻는 경우
- 명령, 스킬, 에이전트, hook, 규칙이 서로 어떻게 연결되는지 가볍게 설명이 필요한 경우
- 설치 경로, 중복 설치, 초기화/제거, 선택적 설치 옵션에 혼란스러운 경우

## 핵심 원칙

기억이 아니라 현재 파일을 근거로 답합니다. ECC는 빠르게 변하므로 코드에 고정된 카탈로그 개수, 기능 목록, 설치 절차는 금방 낡습니다.

ECC 저장소를 사용할 수 있다면, 구체적인 답을 하기 전에 관련 파일을 확인합니다.

```bash
node scripts/ci/catalog.js --json
find skills -maxdepth 2 -name SKILL.md | sort
find commands -maxdepth 1 -name '*.md' | sort
find agents -maxdepth 1 -name '*.md' | sort
node scripts/install-plan.js --list-profiles
node scripts/install-plan.js --list-components --json
```

질문에 답하는 데 필요한 최소한의 파일만 읽습니다.

## 저장소 지도

- `README.md`: 설치 경로, 제거/초기화 안내, 공개 소개, FAQ
- `AGENTS.md`: 기여자 가이드와 프로젝트 구조
- `agent.yaml`: 내보낸 gitagent 표면과 명령 목록
- `commands/`: 유지 관리되는 슬래시 명령 호환 셔과(shim)
- `skills/*/SKILL.md`: 재사용 가능한 워크플로와 도메인 플레이북
- `agents/*.md`: 위임되는 하위 에이전트 역할 프롬프트
- `rules/`: 언어 및 하네스 규칙
- `hooks/README.md`, `hooks/hooks.json`, `scripts/hooks/`: hook 동작과 안전 게이트
- `manifests/install-*.json`: 선택적 설치 모듈, 구성 요소, 프로필, 대상 지원 정보
- `docs/`: 하네스 가이드, 아키텍처 노트, 번역 문서, 릴리스 문서

## 응답 스타일

결론을 먼저 말하고, 그다음 다음 행동을 제시합니다. 대부분의 사용자는 전체 카탈로그가 필요하지 않습니다.

좋은 첫 응답 형식은 다음과 같습니다.

1. 무엇을 사용할지
2. 왜 맞는지
3. 확인할 정확한 파일이나 명령
4. 다음 명령 또는 질문 하나

피해야 할 것:

- 기본적으로 모든 스킬이나 명령을 나열하기
- 큰 README 섹션을 반복하기
- 스킬 중심 경로가 있는데 폐기된 명령 셔임을 추천하기
- 파일 시스템을 확인하지 않고 구성 요소가 있다고 주장하기
- 관리형 설치 도구가 지원하는 대상인데 수동 복사 명령으로 설치 안내를 대체하기

## 자주 하는 작업

### 신규 사용자 온보딩

짧은 메뉴를 제시합니다.

- ECC 설치 또는 초기화
- 프로젝트에 맞는 스킬 고르기
- 명령과 스킬의 차이 이해하기
- hook과 안전 동작 살펴보기
- 하네스 감사 실행하기
- 특정 워크플로 찾기

설치와 초기화는 `README.md`를, 프로젝트별 온보딩은 `/project-init`을 안내합니다.

### 기능 찾기

"X에는 무엇을 써야 하나요?"라는 질문에는 다음 순서를 따릅니다.

1. `skills/`, `commands/`, `agents/`를 검색합니다.
2. 기본 워크플로 표면으로 스킬을 우선합니다.
3. 명령은 유지 관리되는 호환 셔임이거나 사용자가 명시적으로 슬래시 명령 동작을 원할 때만 사용합니다.
4. 위임이 유용하면 에이전트를 언급합니다.

유용한 검색 명령:

```bash
rg -n "<query>" skills commands agents docs
find skills -maxdepth 2 -name SKILL.md | sort
```

### 설치 안내

관리형 설치 경로를 사용합니다.

```bash
node scripts/install-plan.js --list-profiles
node scripts/install-plan.js --profile minimal --target claude --json
node scripts/install-apply.js --profile minimal --target claude --dry-run
```

특정 스킬만 설치하는 경우:

```bash
node scripts/install-plan.js --skills <skill-id> --target claude --json
node scripts/install-apply.js --skills <skill-id> --target claude --dry-run
```

의도적으로 중복 표면을 원하지 않는다면, 플러그인 설치와 전체 수동/프로필 설치를 겹쳐 쓰지 않도록 사용자에게 경고합니다.

### 프로젝트 온보딩

사용자가 대상 저장소에 ECC를 구성하고 싶을 때 `/project-init`을 사용합니다. 예상되는 순서는 다음과 같습니다.

1. 프로젝트 파일로 기술 스택을 감지합니다.
2. dry-run 설치 계획을 확인합니다.
3. 기존 `CLAUDE.md`와 설정 파일을 검토합니다.
4. 변경을 적용하기 전에 사용자에게 묻습니다.
5. 생성되는 지침은 최소한으로, 저장소에 맞게 유지합니다.

### 문제 해결

먼저 대상 하네스와 설치 경로를 묻고, 다음을 확인합니다.

- 플러그인 설치 메타데이터
- `.claude/`, `.cursor/`, `.codex/`, `.gemini/`, `.opencode/`, `.codebuddy/`, `.joycode/`, `.qwen/`
- `hooks/hooks.json`
- 설치 상태 파일
- 관련 명령 및 스킬 파일

저장소 상태를 점검하려면 다음을 제안합니다.

```bash
npm run harness:audit -- --format text
npm run observability:ready
npm test
```

## 출력 템플릿

### 짧은 추천

```text
<skill-or-command>를 사용하세요. <reason> 때문에 맞습니다.

정식 파일: <path>
검증 명령: <command>
다음: <one concrete action>
```

### 검색 결과

```text
가장 적합한 결과:
- <path>: <why it matters>
- <path>: <why it matters>

추천: <which one to use first and why>
```

### 설치 계획 요약

```text
감지됨: <stack evidence>
대상: <harness>
계획: <profile/modules/skills>
Dry run: <command>
변경 예정 경로: <paths>
적용 전 승인 필요: <yes/no>
```

## 관련 표면

- `/project-init`: 대상 저장소를 위한 스택 인식 온보딩 계획
- `/harness-audit`: 결정적 준비 상태 점수표
- `/skill-health`: 스킬 품질 검토
- `/skill-create`: 로컬 git 이력으로 새 스킬 생성
- `/security-scan`: Claude/OpenCode 설정 보안 점검
