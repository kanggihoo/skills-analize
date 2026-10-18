---
name: documentation-lookup
description: 학습 데이터 대신 Context7 MCP를 통해 최신 라이브러리 및 프레임워크 문서를 사용한다. 설정 질문, API 레퍼런스, 코드 예시가 필요하거나 사용자가 프레임워크(예: React, Next.js, Prisma)를 언급할 때 활성화.
metadata:
  origin: ECC
---

# 문서 조회 (Context7)

사용자가 라이브러리, 프레임워크, 또는 API에 대해 물으면, 학습 데이터에 의존하지 말고 Context7 MCP(도구 `resolve-library-id`와 `query-docs`)를 통해 최신 문서를 가져온다.

## 핵심 개념

- **Context7**: 실시간 문서를 노출하는 MCP 서버. 라이브러리와 API에 대해서는 학습 데이터 대신 이를 사용한다.
- **resolve-library-id**: 라이브러리 이름과 질의로부터 Context7 호환 라이브러리 ID(예: `/vercel/next.js`)를 반환한다.
- **query-docs**: 주어진 라이브러리 ID와 질문에 대한 문서와 코드 스니펫을 가져온다. 유효한 라이브러리 ID를 얻으려면 항상 resolve-library-id를 먼저 호출한다.

## 사용 시점

다음과 같을 때 활성화한다:

- 설정이나 구성 질문을 할 때 (예: "Next.js 미들웨어는 어떻게 구성하나요?")
- 라이브러리에 의존하는 코드를 요청할 때 ("Prisma 쿼리를 작성해 줘...")
- API나 레퍼런스 정보가 필요할 때 ("Supabase 인증 방법에는 무엇이 있나요?")
- 특정 프레임워크나 라이브러리(React, Vue, Svelte, Express, Tailwind, Prisma, Supabase 등)를 언급할 때

요청이 라이브러리, 프레임워크, 또는 API의 정확하고 최신인 동작에 의존할 때는 언제든 이 스킬을 사용한다. Context7 MCP가 구성된 하네스(예: Claude Code, Cursor, Codex)라면 어디서든 적용된다.

## 동작 방식

### 1단계: 라이브러리 ID 확인하기

**resolve-library-id** MCP 도구를 다음과 함께 호출한다:

- **libraryName**: 사용자의 질문에서 가져온 라이브러리 또는 제품 이름 (예: `Next.js`, `Prisma`, `Supabase`).
- **query**: 사용자의 전체 질문. 결과의 관련성 순위를 개선한다.

문서를 조회하기 전에 Context7 호환 라이브러리 ID(형식 `/org/project` 또는 `/org/project/version`)를 얻어야 한다. 이 단계에서 유효한 ID를 얻지 않고 query-docs를 호출하지 않는다.

### 2단계: 최선의 항목 선택하기

확인 결과에서 다음 기준으로 하나를 고른다:

- **이름 일치**: 사용자가 물은 것과 정확하거나 가장 가까운 것을 우선한다.
- **벤치마크 점수**: 점수가 높을수록 문서 품질이 좋다 (100이 최고).
- **출처 평판**: 가능하면 High 또는 Medium 평판을 우선한다.
- **버전**: 사용자가 버전을 지정했다면(예: "React 19", "Next.js 15"), 목록에 있으면 버전별 라이브러리 ID를 우선한다(예: `/org/project/v1.2.0`).

### 3단계: 문서 가져오기

**query-docs** MCP 도구를 다음과 함께 호출한다:

- **libraryId**: 2단계에서 고른 Context7 라이브러리 ID (예: `/vercel/next.js`).
- **query**: 사용자의 구체적인 질문이나 작업. 관련 스니펫을 얻도록 구체적으로 적는다.

한도: 질문 하나당 query-docs(또는 resolve-library-id)는 3회를 넘지 않는다. 3회 호출 후에도 답이 불분명하면 불확실성을 밝히고, 추측하지 말고 가진 최선의 정보를 사용한다.

### 4단계: 문서 활용하기

- 가져온 최신 정보를 사용해 사용자의 질문에 답한다.
- 도움이 된다면 문서에서 가져온 관련 코드 예시를 포함한다.
- 중요할 때는 라이브러리나 버전을 명시한다 (예: "Next.js 15에서는...").

## 예시

### 예시: Next.js 미들웨어

1. **resolve-library-id**를 `libraryName: "Next.js"`, `query: "Next.js 미들웨어는 어떻게 설정하나요?"`로 호출한다.
2. 결과에서 이름과 벤치마크 점수로 최선의 항목(예: `/vercel/next.js`)을 고른다.
3. **query-docs**를 `libraryId: "/vercel/next.js"`, `query: "Next.js 미들웨어는 어떻게 설정하나요?"`로 호출한다.
4. 반환된 스니펫과 텍스트로 답한다. 관련이 있으면 문서에서 가져온 최소한의 `middleware.ts` 예시를 포함한다.

### 예시: Prisma 쿼리

1. **resolve-library-id**를 `libraryName: "Prisma"`, `query: "관계를 포함해서 쿼리하려면 어떻게 하나요?"`로 호출한다.
2. 공식 Prisma 라이브러리 ID(예: `/prisma/prisma`)를 고른다.
3. 그 `libraryId`와 질의로 **query-docs**를 호출한다.
4. 문서에서 가져온 짧은 코드 스니펫과 함께 Prisma Client 패턴(예: `include` 또는 `select`)을 반환한다.

### 예시: Supabase 인증 방법

1. **resolve-library-id**를 `libraryName: "Supabase"`, `query: "인증 방법에는 무엇이 있나요?"`로 호출한다.
2. Supabase 문서 라이브러리 ID를 고른다.
3. **query-docs**를 호출하고, 가져온 문서에서 인증 방법을 요약하며 최소한의 예시를 보여준다.

## 모범 사례

- **구체적으로 쓴다**: 관련성을 높이기 위해 가능하면 사용자의 전체 질문을 질의로 사용한다.
- **버전 인지**: 사용자가 버전을 언급하면, 확인 단계에서 가능한 경우 버전별 라이브러리 ID를 사용한다.
- **공식 출처 선호**: 여러 후보가 있으면 커뮤니티 포크보다 공식 또는 1차 패키지를 우선한다.
- **민감한 데이터 제외**: Context7로 보내는 모든 질의에서 API 키, 비밀번호, 토큰, 기타 비밀 정보를 가린다. resolve-library-id나 query-docs에 넘기기 전에 사용자의 질문에 비밀 정보가 포함되어 있을 수 있다고 가정한다.
