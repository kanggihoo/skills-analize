# fullstack-dev 분석

## 원본

- 경로: `.agents/skills/fullstack-dev/SKILL.md`
- 성격: 백엔드 아키텍처와 프론트엔드-백엔드 통합을 다루는 full-stack 개발 가이드
- 주요 영역: API, service layer, auth, config, DB, logging, real-time, file upload, production hardening

## 적용 조건

백엔드와 프론트엔드를 함께 만드는 앱, REST API, CRUD 앱, 채팅/실시간 앱, Express + React, Next API, Node/Python/Go backend, API client, auth flow, 파일 업로드, SSE/WebSocket을 구현할 때 사용한다. 순수 UI나 CSS 작업에는 적용하지 않는다.

## 동작 과정

1. 요구사항을 수집한다.
   stack, service type, database, integration 방식, real-time 필요 여부, auth 방식을 명확히 한다. 이미 주어졌다면 질문하지 않고 진행한다.

2. 아키텍처 결정을 먼저 말한다.
   feature-first 구조, API client 접근, auth strategy, real-time 방식, error handling 방식을 선택하고 각 선택을 한 문장으로 설명한다.

3. 체크리스트 기반으로 scaffold한다.
   backend service라면 config validation, typed errors, global error handler, structured logging, migrations, input validation, health checks, CORS, security headers, `.env.example` 등을 갖춘다.

4. 계층 구조를 지킨다.
   Controller는 HTTP 처리, Service는 비즈니스 로직, Repository는 데이터 접근을 담당한다. Controller에 비즈니스 로직이나 DB query를 넣지 않는다.

5. config와 error handling을 중앙화한다.
   환경변수는 시작 시 검증하고 fail-fast한다. 모든 error는 typed hierarchy와 global handler를 통해 일관된 응답이 되게 한다.

6. 데이터베이스와 외부 통합을 안전하게 만든다.
   migrations, transactions, connection pooling, N+1 방지, caching TTL, background job idempotency를 적용한다.

7. frontend API client를 구성한다.
   typed fetch, React Query, tRPC, OpenAPI codegen 중 상황에 맞게 선택하고, auth token, refresh, user-facing error mapping을 구현한다.

8. 검증한다.
   backend/frontend build, health endpoint, 핵심 API smoke test, CORS/API base URL/auth 연결, real-time 동기화를 확인한다.

9. handoff summary를 제공한다.
   구현 기능, endpoint, 실행 명령, 누락/다음 단계, key files를 요약한다.

## 핵심 규칙

- feature-first 구조를 권장한다.
- controller에는 비즈니스 로직을 넣지 않는다.
- service는 HTTP req/res 타입을 import하지 않는다.
- 모든 config는 env var에서 읽고 시작 시 검증한다.
- 모든 input은 boundary에서 검증한다.
- 로그는 request ID가 포함된 structured JSON으로 남긴다.
- JWT를 localStorage에 저장하지 않는다.
- 대용량 파일은 API 서버 경유보다 presigned URL을 선호한다.
- real-time은 polling, SSE, WebSocket을 요구에 맞게 선택한다.

## 산출물 특성

이 스킬은 full-stack 프로젝트를 "돌아가는 예제"가 아니라 운영 가능한 서비스 구조로 만드는 데 초점을 둔다. 계층, 에러, 인증, 환경, 로깅, 검증까지 함께 다루는 절차형 스킬이다.

## 주의점

작업 전 요구사항 수집과 아키텍처 결정을 강제한다. 사용자가 이미 충분한 정보를 줬다면 질문을 생략할 수 있지만, stack/auth/database 같은 핵심이 비어 있으면 먼저 좁혀야 한다.
