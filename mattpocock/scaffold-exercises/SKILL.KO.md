---
name: scaffold-exercises
description: 섹션, 문제, 해설, 설명 자료를 갖추고 린트를 통과하는 연습문제 디렉터리 구조를 만듭니다. 사용자가 연습문제 스캐폴딩, 연습문제 스텁 생성, 새 강의 섹션 설정을 원할 때 사용합니다.
---

# 연습문제 스캐폴딩

`pnpm ai-hero-cli internal lint`를 통과하는 연습문제 디렉터리 구조를 만든 다음, `git commit`으로 커밋합니다.

## 디렉터리 이름 규칙

- **섹션**: `exercises/` 안의 `XX-section-name/` (예: `01-retrieval-skill-building`)
- **연습문제**: 섹션 안의 `XX.YY-exercise-name/` (예: `01.03-retrieval-with-bm25`)
- 섹션 번호 = `XX`, 연습문제 번호 = `XX.YY`
- 이름은 dash-case(소문자, 하이픈)를 사용합니다.

## 연습문제 변형

각 연습문제에는 다음 하위 폴더 중 최소 하나가 있어야 합니다.

- `problem/` - 학습자 작업 공간(TODO 포함)
- `solution/` - 참고 구현
- `explainer/` - 개념 자료, TODO 없음

스텁을 만들 때는 계획에 별도 지정이 없으면 기본적으로 `explainer/`를 사용합니다.

## 필수 파일

각 하위 폴더(`problem/`, `solution/`, `explainer/`)에는 다음 조건을 만족하는 `readme.md`가 필요합니다.

- **비어 있지 않아야 함**(실제 내용이 있어야 하며, 제목 한 줄이라도 괜찮음)
- 깨진 링크가 없어야 함

스텁을 만들 때는 제목과 설명이 있는 최소한의 readme를 만듭니다.

```md
# Exercise Title

Description here
```

하위 폴더에 코드가 있다면 `main.ts`(1줄 초과)도 필요합니다. 하지만 스텁의 경우 readme만 있는 연습문제도 괜찮습니다.

## 작업 순서

1. **계획 파싱** - 섹션 이름, 연습문제 이름, 변형 유형을 추출합니다.
2. **디렉터리 생성** - 각 경로에 대해 `mkdir -p`를 실행합니다.
3. **스텁 readme 생성** - 변형 폴더마다 제목이 있는 `readme.md`를 하나씩 만듭니다.
4. **린트 실행** - `pnpm ai-hero-cli internal lint`로 검증합니다.
5. **오류 수정** - 린트가 통과할 때까지 반복합니다.

## 린트 규칙 요약

린터(`pnpm ai-hero-cli internal lint`)는 다음을 검사합니다.

- 각 연습문제에 하위 폴더(`problem/`, `solution/`, `explainer/`)가 있는지
- `problem/`, `explainer/`, `explainer.1/` 중 최소 하나가 존재하는지
- 기본 하위 폴더에 `readme.md`가 있고 비어 있지 않은지
- `.gitkeep` 파일이 없는지
- `speaker-notes.md` 파일이 없는지
- readme에 깨진 링크가 없는지
- readme에 `pnpm run exercise` 명령이 없는지
- readme만 있는 경우를 제외하고 하위 폴더마다 `main.ts`가 필요한지

## 이동 및 이름 변경

연습문제의 번호를 다시 매기거나 이동할 때는 다음을 따르세요.

1. 디렉터리 이름을 바꿀 때 `mv`가 아니라 `git mv`를 사용합니다. git 히스토리가 보존됩니다.
2. 순서를 유지하도록 숫자 접두사를 갱신합니다.
3. 이동 후 린트를 다시 실행합니다.

예시:

```bash
git mv exercises/01-retrieval/01.03-embeddings exercises/01-retrieval/01.04-embeddings
```

## 예시: 계획에서 스텁 만들기

다음과 같은 계획이 있다고 가정합니다.

```
Section 05: Memory Skill Building
- 05.01 Introduction to Memory
- 05.02 Short-term Memory (explainer + problem + solution)
- 05.03 Long-term Memory
```

다음을 만듭니다.

```bash
mkdir -p exercises/05-memory-skill-building/05.01-introduction-to-memory/explainer
mkdir -p exercises/05-memory-skill-building/05.02-short-term-memory/{explainer,problem,solution}
mkdir -p exercises/05-memory-skill-building/05.03-long-term-memory/explainer
```

그다음 readme 스텁을 만듭니다.

```
exercises/05-memory-skill-building/05.01-introduction-to-memory/explainer/readme.md -> "# Introduction to Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/explainer/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/problem/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/solution/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.03-long-term-memory/explainer/readme.md -> "# Long-term Memory"
```
