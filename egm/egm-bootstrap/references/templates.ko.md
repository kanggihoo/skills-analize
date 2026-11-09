<!--
Copyright 2026 Google LLC.
SPDX-License-Identifier: Apache-2.0
-->

# egm-bootstrap README 템플릿

`egm-bootstrap`이 작성하는 계약 파일의 템플릿이다. `${target_filename}`은 설정된 계약 파일명이다(기본값 `README.md`).

## 📄 Component Package (Peanuts) README 템플릿

```markdown
# [Component Name]

## Overview
[Prose overview of the component's architectural role and goals]

## Interface
- [Public classes, functions, and symbols]
- [Subdirectories list and relative links to their contracts (e.g., `./subdir/README.md` or `./subdir/${target_filename}`)]

## Invariants
- [State and call invariants that must be preserved by developers/agents]

## Side Effects
- [State mutations, network calls, disk access, locks, or external side effects]

## Verification
- Run: `<test-command>`
```

## 📄 Repository Root (Blueprint / Hay) README 템플릿

```markdown
# [Repository Name] Blueprint

## System Overview
[High-altitude architectural overview of this subsystem]

[Optional section if the root directory contains direct source files]
## Local Interface & Invariants
- [Direct symbols, invariants, and side effects of files in the root folder]

## Subdirectories & System Boundaries
- [Subdirectory Name]: [Relative link to existing child contract file (e.g., `./subdir/README.md` or `./subdir/${target_filename}`) or `./subdir/SKILL.md`] - [Summary of child contract/role]

## Global Invariants
- [System-wide constraints that cross component boundaries]

## Global Side Effects
- [Shared resources, databases, or external integrations affected by this subsystem]

## System Verification
- Run: `<test-command>`
```

## 📄 Intermediate Blueprint README 템플릿

```markdown
# [Directory Name]

## Overview
[Factual overview of the subdirectories and systems grouped under this directory path]

## Subdirectories & Boundaries
- [Subdirectory Name]: [Relative link to existing child contract file (e.g., `./subdir/README.md` or `./subdir/${target_filename}`) or `./subdir/SKILL.md`] - [Summary of child contract/role]
```
