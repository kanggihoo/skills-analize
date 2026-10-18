# cloudflare 컬렉션 종합 (OVERVIEW)

컬렉션은 스킬 1개(`security-audit`)다. 출처는 `skills-lock.json` 기준 `cloudflare/security-audit-skill` (`sourceType: github`, `skillPath: skills/security-audit/SKILL.md`). 상세 분석은 `security-audit.md`(664줄)를 본다. 이 문서는 컬렉션 단위 항목만 다룬다.

## 1. 총평
- SKILL.md 자기 규정: "Find vulnerabilities that violate a real trust boundary, then give owners the source evidence, safe reproduction, priority, and smallest effective fix. This is a defensive, source-first workflow." (`SKILL.md:8` 부근)
- 지침 문서만이 아니라 **JSON 스키마(`report-schema.json` 14,494 B)와 검증 스크립트 2종 + 테스트 2종**이 함께 들어 있는, 이번 세 컬렉션 중 유일하게 산출물을 코드로 검증하는 스킬이다.

## 2. 스킬 목록표
| 이름 | 성격 | 트리거 요약 | 게이트 | 외부 의존 | 산출물 |
|---|---|---|---|---|---|
| security-audit | 감사(audit) | "Security guidance and vulnerability review for codebases, APIs, services, CLI tools, libraries, and daemons"; 전체 워크플로우는 명시적 코드베이스 감사·펜테스트 요청에서만 | 6단계 순서 워크플로우, 검증 스크립트 통과(종료 코드 0/1) | Node(`node --test`), 서브에이전트 | 스키마를 따르는 findings JSON, 커버리지 원장, 보고서 |

## 3. 라우팅 맵
다른 스킬이 없어 스킬 간 참조는 원문에 명시 없음. 내부적으로는 `SKILL.md` 가 14개 주제 문서(RECONNAISSANCE, HUNTING, VALIDATION-AND-REPORTING 등)로 분기한다(개별 분석 1·5절).

## 4. 중복·충돌
단일 스킬이라 스킬 간 중복·충돌 없음. `SKILL.md` 와 스크립트·스키마 사이의 불일치는 개별 분석 5~7절에 사실로, 8절에 평가로 기록됨.

## 5. 커버리지 갭
요구사항→설계→구현→테스트→리뷰→배포→운영 중 이 컬렉션이 다루는 칸은 **리뷰(보안 감사)** 하나다. 나머지 단계는 없음.

## 6. 도입 순서 추천
스킬이 하나이므로 순서는 해당 없음. 질문·집중 리뷰에는 부분 사용, 전체 워크플로우는 명시적 감사 요청에만 쓰도록 스킬이 스스로 한정한다.

## 7. 이 컬렉션을 쓰면 안 되는 상황
- 소유자 승인 없는 대상에 대한 감사: 스킬은 "Universal execution safety" 절(`SKILL.md:31`)에서 실행 안전 규칙을 둔다(내용은 개별 분석 6절).
- 소규모 질문에 전체 워크플로우를 돌리는 경우: description 이 이를 배제.
- 고정 상한을 넘는 산출물: 두 검증기는 입력 5 MiB(`validate-findings.cjs:43`, `validate-coverage-ledger.cjs:14` 확인) 초과를 거부한다.

## 8. 읽은 파일 전체 목록
디렉터리 합계 314,961 바이트(`skills-lock.json` 291 포함), 20개 파일 + lock 1개.

| 파일 | 바이트 |
|---|---|
| SKILL.md | 22026 |
| HUNTING.md | 22446 |
| VALIDATION-AND-REPORTING.md | 17843 |
| RECONNAISSANCE.md | 15902 |
| ATTACK-CLASSES.md | 15695 |
| WEB-PROTOCOL-AND-AUTH.md | 12300 |
| AI-AND-LLM.md | 10617 |
| MEMORY-SAFETY-AND-BINARY.md | 10513 |
| DESKTOP-MOBILE-AND-LOCAL-IPC.md | 8739 |
| CLIENT-SIDE.md | 8594 |
| CLOUD-AND-DEPLOYMENT.md | 8291 |
| DATA-ISOLATION-AND-LIFECYCLE.md | 7798 |
| PROTOCOLS-RPC-AND-MESSAGING.md | 7483 |
| RESOURCE-EXHAUSTION-AND-AVAILABILITY.md | 7476 |
| SUPPLY-CHAIN-AND-RELEASE.md | 7258 |
| report-schema.json | 14494 |
| validate-coverage-ledger.cjs | 33522 |
| validate-coverage-ledger.test.cjs | 28483 |
| validate-findings.cjs | 28806 |
| validate-findings.test.cjs | 26384 |
| skills-lock.json (컬렉션 루트) | 291 |
