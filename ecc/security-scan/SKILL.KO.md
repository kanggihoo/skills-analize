---
name: security-scan
description: AgentShield를 사용하여 Claude Code 구성(.claude/ 디렉터리)에서 보안 취약점, 잘못된 구성, 인젝션 위험을 스캔합니다. CLAUDE.md, settings.json, MCP 서버, 훅, 에이전트 정의를 검사합니다. .claude/ 디렉터리(CLAUDE.md, settings.json, MCP 서버, 훅, 에이전트 정의)를 감사할 때 사용하세요.
metadata:
  origin: ECC
---

# 보안 스캔 스킬

[AgentShield](https://github.com/affaan-m/agentshield)를 사용하여 Claude Code 구성의 보안 문제를 감사합니다.

## 활성화 시점

- 새 Claude Code 프로젝트를 설정할 때
- `.claude/settings.json`, `CLAUDE.md`, 또는 MCP 구성을 수정한 후
- 구성 변경을 커밋하기 전
- 기존 Claude Code 구성이 있는 새 저장소에 합류할 때
- 정기적인 보안 위생 점검

## 스캔 대상

| 파일 | 검사 항목 |
|------|--------|
| `CLAUDE.md` | 하드코딩된 시크릿, 자동 실행 지시, 프롬프트 인젝션 패턴 |
| `settings.json` | 지나치게 허용적인 allow 목록, deny 목록 누락, 위험한 우회 플래그 |
| `mcp.json` | 위험한 MCP 서버, 하드코딩된 env 시크릿, npx 공급망 위험 |
| `hooks/` | 보간을 통한 명령 인젝션, 데이터 유출, 조용한 오류 억제 |
| `agents/*.md` | 제한 없는 도구 접근, 프롬프트 인젝션 표면, 모델 사양 누락 |

## 사전 요구 사항

AgentShield가 설치되어 있어야 합니다. 필요하면 확인하고 설치하세요.

```bash
# Check if installed
npx ecc-agentshield --version

# Install globally (recommended)
npm install -g ecc-agentshield

# Or run directly via npx (no install needed)
npx ecc-agentshield scan .
```

## 사용법

### 기본 스캔

현재 프로젝트의 `.claude/` 디렉터리를 대상으로 실행합니다.

```bash
# Scan current project
npx ecc-agentshield scan

# Scan a specific path
npx ecc-agentshield scan --path /path/to/.claude

# Scan with minimum severity filter
npx ecc-agentshield scan --min-severity medium
```

### 출력 형식

```bash
# Terminal output (default) — colored report with grade
npx ecc-agentshield scan

# JSON — for CI/CD integration
npx ecc-agentshield scan --format json

# Markdown — for documentation
npx ecc-agentshield scan --format markdown

# HTML — self-contained dark-theme report
npx ecc-agentshield scan --format html > security-report.html
```

### 자동 수정

안전한 수정만 자동으로 적용합니다(자동 수정 가능으로 표시된 항목만).

```bash
npx ecc-agentshield scan --fix
```

이 명령은 다음을 수행합니다.
- 하드코딩된 시크릿을 환경 변수 참조로 교체
- 와일드카드 권한을 범위가 지정된 대안으로 축소
- 수동 전용 제안은 절대 수정하지 않음

### Opus 4.6 심층 분석

적대적 3-에이전트 파이프라인을 실행하여 더 깊이 분석합니다.

```bash
# Requires ANTHROPIC_API_KEY
export ANTHROPIC_API_KEY=your-key
npx ecc-agentshield scan --opus --stream
```

이 명령은 다음을 실행합니다.
1. **Attacker (Red Team)** — 공격 벡터를 찾음
2. **Defender (Blue Team)** — 강화 방안을 권장
3. **Auditor (Final Verdict)** — 두 관점을 종합하여 최종 판정

### 보안 구성 초기화

처음부터 새로운 안전한 `.claude/` 구성을 만듭니다.

```bash
npx ecc-agentshield init
```

다음을 생성합니다.
- 범위가 지정된 권한과 deny 목록이 있는 `settings.json`
- 보안 모범 사례가 담긴 `CLAUDE.md`
- `mcp.json` 플레이스홀더

### GitHub Action

CI 파이프라인에 추가합니다.

```yaml
- uses: affaan-m/agentshield@v1
  with:
    path: '.'
    min-severity: 'medium'
    fail-on-findings: true
```

## 심각도 수준

| 등급 | 점수 | 의미 |
|-------|-------|---------|
| A | 90-100 | 안전한 구성 |
| B | 75-89 | 사소한 문제 |
| C | 60-74 | 주의 필요 |
| D | 40-59 | 중대한 위험 |
| F | 0-39 | 치명적인 취약점 |

## 결과 해석

### 치명적 발견 (즉시 수정)
- 구성 파일에 하드코딩된 API 키 또는 토큰
- allow 목록의 `Bash(*)` (제한 없는 셸 접근)
- `${file}` 보간을 통한 훅의 명령 인젝션
- 셸을 실행하는 MCP 서버

### 높음 발견 (프로덕션 전에 수정)
- CLAUDE.md의 자동 실행 지시 (프롬프트 인젝션 벡터)
- 권한에 deny 목록 누락
- 불필요한 Bash 접근 권한을 가진 에이전트

### 중간 발견 (권장)
- 훅의 조용한 오류 억제 (`2>/dev/null`, `|| true`)
- PreToolUse 보안 훅 누락
- MCP 서버 구성의 `npx -y` 자동 설치

### 정보성 발견 (참고)
- MCP 서버에 설명 누락
- 금지 지시가 좋은 관행으로 올바르게 표시됨

## 링크

- **GitHub**: [github.com/affaan-m/agentshield](https://github.com/affaan-m/agentshield)
- **npm**: [npmjs.com/package/ecc-agentshield](https://www.npmjs.com/package/ecc-agentshield)
