---
name: skill-scout
description: 새 스킬을 만들기 전에 로컬, 마켓플레이스, GitHub, 웹의 기존 스킬 소스를 검색합니다. 사용자가 워크플로를 위한 스킬을 만들고, 빌드하고, 포크하고, 찾고 싶을 때 사용합니다.
metadata:
  origin: community
---

# Skill Scout

새 스킬을 만들기 전에 이 스킬을 사용하십시오. 목표는 기존 커뮤니티 또는 마켓플레이스 작업과 중복되는 것을 피하는 동시에, 채택하기 전에 외부 자료를 검증하는 것입니다.

출처: 오래된 커뮤니티 PR #1232(`redminwang`)에서 되살린 스킬입니다.

## 사용 시점

- 사용자가 "create a skill", "build a skill", "make a skill", 또는 "new skill"이라고 말할 때.
- 사용자가 "X를 위한 스킬이 있나?" 또는 "Y를 하는 스킬이 존재하나?"라고 물을 때.
- 사용자가 워크플로를 설명했고, 새 스킬을 만들자고 제안하려고 할 때.
- 사용자가 기존 스킬을 포크하거나 확장하고 싶을 때.

사용자가 검색을 건너뛰라고 하거나 처음부터 만들라고 명시적으로 말하는 경우, 이를 인정하고 요청된 생성 워크플로를 진행하십시오.

## 동작 방식

### 1단계 - 의도 파악

다음을 추출합니다:

- 스킬이 수행해야 할 작업.
- 스킬을 사용하는 트리거 조건.
- 관련된 도메인, 도구, 프레임워크, 데이터 소스.
- 3~5개의 검색 키워드와 유용한 동의어.

### 2단계 - 로컬 소스 검색

설치된 스킬과 마켓플레이스 스킬의 이름을 먼저 검색합니다. 로컬 소스는 이미 사용자 환경의 일부이므로 우선합니다.

```bash
find ~/.claude/skills -maxdepth 2 -name SKILL.md 2>/dev/null | grep -iE "keyword|synonym"
find ~/.claude/plugins/marketplaces -path '*/skills/*/SKILL.md' 2>/dev/null | grep -iE "keyword|synonym"
```

그다음 frontmatter의 description을 검색합니다:

```bash
grep -RilE "keyword|synonym" ~/.claude/skills ~/.claude/plugins/marketplaces 2>/dev/null
```

### 3단계 - 원격 소스 검색

사용 가능한 GitHub 및 웹 검색 도구를 사용합니다. 간결한 쿼리를 선호하십시오:

```bash
gh search repos "claude code skill keyword" --limit 10 --sort stars
gh search code "name: keyword" --filename SKILL.md --limit 10
```

웹 검색은 다음과 같이 최대 3개의 목표 쿼리만 사용하십시오:

```text
"claude code skill" keyword
"SKILL.md" keyword
"affaan-m/ECC" keyword
```

### 4단계 - 외부 후보 검증

외부 스킬을 채택하거나 포크하도록 추천하기 전에:

- `SKILL.md`의 frontmatter와 지침을 읽으십시오.
- 예상치 못한 셸 명령, 파일 쓰기, 네트워크 호출, 자격 증명 처리, 패키지 설치가 있는지 확인하십시오.
- 저장소가 유지 관리되고 있는지 확인하십시오.
- 마켓플레이스 원본을 편집하기보다는, 새 로컬 브랜치에 복사한 뒤 diff를 검토하는 것을 선호하십시오.

### 5단계 - 결과 순위 매기기

후보를 다음 기준으로 순위를 매깁니다:

1. 스킬 이름에 정확한 키워드가 일치.
2. description에 키워드 또는 동의어가 일치.
3. 로컬에 설치되었거나 마켓플레이스 소스.
4. 최근 활동이 있는 유지 관리 중인 GitHub 소스.
5. 웹에서만 언급됨.

최종 목록은 10개로 제한하십시오.

### 6단계 - 결정 옵션 제시

사용자에게 짧은 표를 제시하십시오:

| 옵션 | 의미 |
| --- | --- |
| 기존 사용 | 일치하는 스킬을 그대로 호출하거나 설치. |
| 포크 또는 확장 | 가장 가까운 스킬을 복사하고 수정. |
| 새로 만들기 | 가까운 일치가 없음을 확인한 후 새 스킬을 빌드. |

사용자가 해당 경로를 선택했거나, 검색 결과 가까운 일치가 없을 때에만 새 스킬을 만드십시오.

## 예시

### 결과 표

```markdown
| # | Skill | Source | Why it matches | Gap |
| --- | --- | --- | --- | --- |
| 1 | article-writing | Local ECC | Drafts articles and guides | Not focused on release notes |
| 2 | content-engine | Local ECC | Multi-format content workflow | Heavier than needed |
| 3 | blog-writer | GitHub | Blog writing skill with recent commits | Needs security review |
```

### 사용자에게 보여주는 요약

```markdown
I found two close local matches and one external candidate. The closest fit is
`article-writing`; it covers drafting and revision, but it does not include the
release-note checklist you asked for. I can either use it as-is, fork it into a
release-note variant, or create a fresh skill.
```

## 안티 패턴

- 검색이 합리적인 상황에서 바로 새 스킬 생성으로 넘어가지 마십시오.
- 읽지 않고 외부 스킬을 설치하지 마십시오.
- 약한 일치 항목의 긴 순위 없는 목록을 제시하지 마십시오.
- 웹에서만 언급된 것을 신뢰할 수 있는 소스로 취급하지 마십시오.
- 설치된 마켓플레이스 원본을 제자리에서 편집하지 마십시오.

## 관련

- `search-first` - 일반적인 만들기 전 검색 워크플로.
- `skill-stocktake` - 설치된 스킬의 상태, 중복, 공백을 감사.
- `agent-sort` - 기존 에이전트와 스킬을 분류하고 정리.
