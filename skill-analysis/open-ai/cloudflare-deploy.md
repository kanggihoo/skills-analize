# cloudflare-deploy 분석

## 원본

- 원본 경로: `.agents/skills/cloudflare-deploy/`
- 핵심 파일: `SKILL.md`
- 보조 파일: `agents/openai.yaml`, `assets/`, `references/`
- 확인한 규모: 312개 파일, 63개 디렉토리, 약 46,464줄
- 성격: Cloudflare 전체 플랫폼 배포와 제품 선택을 안내하는 대형 인덱스형 스킬

## 적용 조건

이 스킬은 사용자가 Cloudflare에 앱, Worker, Pages, 인프라, 데이터 저장소, AI 기능, 네트워크 기능, 보안 기능 등을 배포하거나 설정해 달라고 할 때 동작한다.

대표 요청은 다음과 같다.

- Cloudflare Workers로 배포
- Cloudflare Pages로 웹앱 호스팅
- D1, KV, R2, Queues, Vectorize 같은 Cloudflare 저장소 구성
- Workers AI, AI Gateway, Agents SDK 같은 AI 기능 연결
- Tunnel, WAF, Turnstile, Stream 같은 Cloudflare 제품 설정

## 전체 구조

`SKILL.md`는 직접 모든 세부 절차를 담기보다, 먼저 사용자의 의도를 판별하고 맞는 Cloudflare 제품 reference를 로드하도록 설계되어 있다.

주요 구조는 다음과 같다.

- 사전 조건: 배포 네트워크 호출이 sandbox에 막히면 권한 상승으로 재실행
- 인증 확인: 배포 전 `npx wrangler whoami`로 Cloudflare 인증 상태 확인
- 의사결정 트리: 실행 코드, 저장소, AI/ML, 네트워킹, 보안, 미디어, IaC 요구를 제품군으로 분류
- 제품 인덱스: 각 Cloudflare 제품을 `references/<product>/` 디렉토리로 연결
- 문제 해결: 네트워크 오류나 인증 문제 시 사용자에게 권한 상승 또는 인증 절차 안내

## 동작 과정

1. 사용자의 배포 목표를 해석한다.
   예를 들어 “웹앱 배포”는 Pages 또는 Workers, “API 실행”은 Workers, “SQLite DB”는 D1, “파일 저장”은 R2로 분류한다.

2. Cloudflare 인증이 필요한 작업인지 확인한다.
   `wrangler deploy`, `wrangler pages deploy`, `npm run deploy` 같은 실제 배포 전에는 `npx wrangler whoami`를 통해 계정 인증 여부를 확인해야 한다.

3. 인증이 없으면 reference 문서의 `wrangler/auth.md` 흐름으로 전환한다.
   로컬 대화형 작업은 `wrangler login`, CI/CD는 `CLOUDFLARE_API_TOKEN` 환경 변수를 안내한다.

4. 사용 목적별 decision tree를 탄다.
   코드 실행, 데이터 저장, AI, 네트워킹, 보안, 미디어, IaC 중 어느 축인지 먼저 정하고 제품 reference를 선택한다.

5. 선택된 product reference를 추가로 읽어 세부 설정을 수행한다.
   예를 들어 Workers면 `references/workers/`, Pages면 `references/pages/`, D1이면 `references/d1/`을 참조한다.

6. 실제 배포나 설정 명령을 실행한다.
   명령이 네트워크 오류, DNS 오류, timeout, connection reset 등으로 실패하면 sandbox 문제일 수 있으므로 `sandbox_permissions=require_escalated`로 재실행한다.

7. 배포 결과 URL, 필요한 설정, 환경 변수, 후속 확인 사항을 사용자에게 보고한다.

## reference 구성

이 스킬의 대부분은 `references/` 아래의 Cloudflare 제품별 문서다. 각 제품 디렉토리는 대체로 다음 파일 패턴을 가진다.

- `README.md`: 제품 개요, 언제 쓸지, 빠른 시작, 읽기 순서
- `api.md`: API나 CLI 사용 표면
- `configuration.md`: 설정 파일, binding, dashboard, env 설정
- `patterns.md`: 권장 구현 패턴
- `gotchas.md`: 제한, 흔한 실수, 주의점

확인된 주요 제품군은 다음과 같다.

- Compute & Runtime: Workers, Pages, Pages Functions, Durable Objects, Workflows, Containers, Workers for Platforms, Cron Triggers, Tail Workers, Snippets, Smart Placement
- Storage & Data: KV, D1, R2, Queues, Hyperdrive, Durable Objects Storage, Secrets Store, Pipelines, R2 Data Catalog, R2 SQL
- AI & ML: Workers AI, Vectorize, Agents SDK, AI Gateway, AI Search
- Networking: Tunnel, Spectrum, TURN, Network Interconnect, Argo Smart Routing, Workers VPC
- Security: WAF, DDoS, Bot Management, API Shield, Turnstile
- Media: Images, Stream, Browser Rendering, Zaraz
- Developer Tools: Wrangler, Miniflare, C3, Observability, Analytics Engine, Web Analytics, Sandbox, Workerd, Workers Playground
- IaC: Pulumi, Terraform, Cloudflare REST API
- 기타: Email Routing, Email Workers, Static Assets, Bindings, Cache Reserve

## 핵심 규칙

- Cloudflare 배포 전 인증 확인이 필수다.
- 제품 선택은 사용자가 말한 구현 수단보다 실제 요구사항을 우선한다.
  예를 들어 “DB 붙여줘”라고 했을 때 relational SQL이면 D1 또는 Hyperdrive, key-value면 KV로 나눠야 한다.
- `wrangler` 명령이나 배포 명령은 시간이 걸릴 수 있으므로 충분한 timeout이 필요하다.
- 네트워크 sandbox 실패는 일반 실패로 단정하지 않고 권한 상승 재실행을 고려한다.
- 사용자가 Cloudflare 제품을 명시하지 않아도, Cloudflare 배포/호스팅/인프라 문맥이면 이 스킬이 제품을 고르는 역할을 한다.

## 산출물 특성

스킬이 정상적으로 적용되면 결과물은 보통 다음 중 하나다.

- Cloudflare 배포 URL
- `wrangler.toml` 또는 `wrangler.jsonc` 설정
- Cloudflare binding 설정
- Worker, Pages Functions, Durable Object, Queue consumer 등 실행 코드
- 필요한 환경 변수와 Cloudflare API token 범위 안내
- 선택한 Cloudflare 제품과 그 이유

## 주의점

- 이 스킬은 Cloudflare 전체 제품군을 다루므로, 항상 `SKILL.md`만으로 끝내지 않고 필요한 reference를 추가로 읽는 구조다.
- Cloudflare 제품은 서로 겹치는 영역이 많다. Pages와 Workers, D1과 Hyperdrive, Vectorize와 AI Search 같은 선택 지점에서 decision tree를 먼저 통과해야 한다.
- 실제 배포는 외부 네트워크와 계정 인증에 의존한다. 인증 누락과 sandbox 네트워크 차단을 분리해서 판단해야 한다.
- `agents/openai.yaml`은 표시 이름, 설명, 아이콘, 기본 prompt를 제공하는 UI 메타데이터이며, 실제 배포 로직은 `SKILL.md`와 references가 담당한다.
