# 템플릿: package-group

이 템플릿은 `packages/README.md`와 모든 `packages/<group>/README.md`에 사용한다. 이 페이지는 지도다. 기능 계열을 안내하고, 직접 속한 패키지를 한 줄 역할과 함께 나열하며, 패키지가 담당하는 세부 내용으로 링크한다. 패키지의 계약을 다시 서술하지 않는다.

## Frontmatter

```yaml
---
description: "The <group> package group: what the packages under packages/<group>/ own, for readers choosing or navigating the family."
kind: "package-group"
---
```

## 골격

```markdown
# <group>/ — <one-line subject>

English | [中文](README.zh.md)

## Summary

Three to five sentences and at most 100 `wc -w`-style words: what the family provides, what a reader can DO with it, which package owns which half, and the main boundary. Apply the [Summary voice rules](../SKILL.md#voice-rules).

## Table of Contents

- [Packages](#packages)
- [Related documentation](#related-documentation)
- [Dev Note](#dev-note)

-----

<a id="packages"></a>
## Packages

짧은 안내 문장 하나, 그다음 패키지 지도:

| Package | Role |
|---|---|
| [`<pkg>`](<pkg>/README.md) | One-line role: what it contributes |

<a id="related-documentation"></a>
## Related documentation

- [Adjacent owner](../../<path>.md) — 이 계열에 무엇을 더하는지 설명하는 짧은 구문.

<a id="dev-note"></a>
## Dev Note

None.
```

## 규칙

- 직접 속한 패키지마다 한 행만 둔다. 역할 문구에는 패키지가 기여하는 바를 적고, 내부 구현은 적지 않는다.
- `ctx key`, 패키지 형태, npm 이름 열은 독자가 직접 속한 패키지들 중에서 고르는 데 도움이 될 때만 추가한다.
- 관련 문서는 인접 담당 문서(그룹 맵, 하위 시스템 페이지, Agent Note)를 링크하고, 링크마다 짧은 구문을 붙인다.
- Model Experience나 Known Limitations 섹션은 추가하지 않는다. 그룹 맵은 런타임 동작을 담당하지 않는다.
- 짝 파일을 수정한 뒤에는 `pnpm run verify-translation-pairing --write packages/<group>/README.md`를 다시 실행한다.
