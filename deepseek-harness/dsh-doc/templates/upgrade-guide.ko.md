# 템플릿: upgrade-guide

이 kind는 `docs/upgrade-guide/v<version>/<item>/guide.md`와 그 중국어 짝 파일 `guide.zh.md`에 사용한다. 중국어 파일의 섹션은 `## 变更`과 `## 迁移`이다. 이 트리에는 폴더 색인이 없다. [dsh-create-upgrade-guide](../../dsh-create-upgrade-guide/SKILL.md)가 범위, 위치, 유지보수, 길이 규칙을 담당하고, `pnpm run verify-upgrade-guides`가 이를 강제한다.

## Frontmatter

```yaml
---
kind: upgrade-guide
description: "The externally perceptible surface that breaks and what replaces it."
---
```

## 골격

````markdown
# <구체적인 호환성 깨짐, 예: `--profile`이 `--preset`을 대체함>

English | [中文](guide.zh.md)

## Change

Surface의 이전 동작과 새 동작, 그리고 누가 이를 관찰하는지 적는다.

## Migration

1. 바꿀 정확한 파일, key, 명령, symbol을 적는다. 산문보다 짧으면 변경 전후 스니펫을 함께 넣는다.
2. 마이그레이션이 성공했는지 확인하는 방법을 적는다.
````
