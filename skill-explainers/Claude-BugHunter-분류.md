# Claude-BugHunter 스킬 분류

출처: https://github.com/elementalsouls/Claude-BugHunter (스킬 83개)
기준: 각 `SKILL.md`의 frontmatter `description`만 읽고 분류했다. 본문 분석은 아직 하지 않았다.

## 1. 오케스트레이션과 방법론 (5개)

| 스킬 | 용도 |
|---|---|
| `bb-methodology` | 버그바운티 세션 시작, 타겟 전환, 막혔을 때 쓰는 총괄 스킬. 5단계 비선형 사냥 워크플로우 |
| `bug-bounty` | recon, HackerOne scope, 취약점 테스트, 검증, 리포트까지 한 흐름으로 안내 |
| `bb-local-toolkit` | SecLists, ffuf, dalfox 등 도구와 wordlist의 로컬 경로 안내 |
| `hunt-dispatch` | `/hunt` 뒤에 타겟을 fingerprint하고 맞는 공격 스킬 세트를 로드 |
| `redteam-mindset` | 방어적 WAPT가 아닌 공격자 관점으로 테스트하도록 태도를 교정 |

## 2. Recon과 OSINT (5개)

| 스킬 | 용도 |
|---|---|
| `web2-recon` | subfinder, httpx, katana, ffuf로 subdomain, live host, URL, 디렉터리 수집 |
| `offensive-osint` | subdomain 열거, API 문서 탐색, dork, curl one-liner 모음 |
| `osint-methodology` | 승인된 레드팀의 OSINT 계획과 실행 방법 |
| `recon-scope-triage` | recon 결과에서 타겟 소유 자산과 브랜드명 우연 일치(노이즈)를 분리 |
| `supply-chain-attack-recon` | package 이름 선점, dependency confusion, GitHub Actions, container registry 노출 정찰 |

## 3. 취약점별 hunt 스킬 (약 50개)

| 묶음 | 스킬 |
|---|---|
| 인젝션 | `hunt-sqli`, `hunt-nosqli`, `hunt-ldap`, `hunt-ssti`, `hunt-xxe`, `hunt-html-injection` |
| XSS와 클라이언트 | `hunt-xss`, `hunt-dom`, `hunt-clickjacking`, `hunt-csrf`, `hunt-cors`, `hunt-websocket` |
| 서버 측 요청 | `hunt-ssrf`, `hunt-lfi`, `hunt-file-upload`, `hunt-rce`, `hunt-deserialization`, `hunt-http-smuggling`, `hunt-cache-poison`, `hunt-host-header` |
| 인증과 세션 | `hunt-auth-bypass`, `hunt-ato`, `hunt-oauth`, `hunt-saml`, `hunt-jwt-crypto`, `hunt-session`, `hunt-mfa-bypass`, `hunt-forgot-password`, `hunt-brute-force`, `hunt-captcha-bypass` |
| 접근 제어와 로직 | `hunt-idor`, `hunt-business-logic`, `hunt-race-condition`, `hunt-exceptional-conditions`, `hunt-open-redirect` |
| API | `hunt-api-misconfig`, `hunt-graphql`, `hunt-fintech-graphql`, `hunt-grpc`, `hunt-shadow-api`, `hunt-spa-api` |
| 프레임워크별 | `hunt-aspnet`, `hunt-laravel`, `hunt-nextjs`, `hunt-nodejs`, `hunt-springboot`, `hunt-sharepoint` |
| 인프라 | `hunt-cloud-misconfig`, `hunt-k8s`, `hunt-cicd`, `hunt-subdomain`, `hunt-tls-network`, `hunt-ntlm-info`, `hunt-source-leak` |
| AI | `hunt-llm-ai`(prompt injection), `hunt-rag-vector`(RAG 오염) |
| 기타 | `hunt-misc`: 다른 스킬에 맞지 않는 공개 리포트 225건 모음 |

## 4. 대상 특화 레드팀 (9개)

| 스킬 | 용도 |
|---|---|
| `apk-redteam-pipeline`, `ios-redteam-pipeline` | 모바일 앱 획득, 디컴파일, secret 추출 |
| `cloud-iam-deep` | AWS, Azure, GCP IAM 공격 체인 |
| `m365-entra-attack`, `okta-attack` | Microsoft 365/Entra, Okta 계정 공격 체인 |
| `enterprise-vpn-attack` | Cisco, Fortinet, Citrix 등 SSL VPN 장비 공격 |
| `vmware-vcenter-attack` | vCenter 외부 공격 CVE 체인 |
| `web3-audit`, `meme-coin-audit` | 스마트 컨트랙트, 밈코인 rug pull 감사 |

## 5. 검증과 리포트 (7개)

| 스킬 | 용도 |
|---|---|
| `triage-validation` | 리포트 전에 7-Question Gate로 유효한 finding인지 거름 |
| `evidence-hygiene` | PoC 증거에서 cookie, PII 마스킹 규칙 |
| `report-writing` | H1, Bugcrowd 등 플랫폼용 리포트 작성법 |
| `bugcrowd-reporting` | Bugcrowd VRT 분류와 severity 조정 전략 |
| `redteam-report-template` | 고객 전달용 레드팀 보고서 형식 |
| `mid-engagement-ir-detection` | 작업 중 상대 SOC의 패치와 방어 변화를 감지해 finding으로 전환 |
| `security-arsenal` | payload, bypass 표, 항상 reject되는 버그 목록 |

## 구조 메모

- 83개 중 `SKILL.md` 외 파일이 있는 스킬은 `offensive-osint`(21개)와 `osint-methodology`(1개)뿐이다. 나머지 81개는 `SKILL.md` 하나로 이루어진다.
- 3번 묶음은 `취약점 종류 + 공개 리포트 N건 + 탐지 패턴` 구조가 같아서, 대표 몇 개만 분석하면 나머지에 적용된다.
