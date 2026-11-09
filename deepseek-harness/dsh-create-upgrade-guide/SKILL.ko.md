---
name: dsh-create-upgrade-guide
description: deepseek-harness 변경이 외부에서 관찰 가능한 surface(CLI, profiles, cordis.yml 또는 settings 키, persisted user data, SDK 또는 wire API, 공개된 package entry point)를 깨뜨릴 때, 또는 아직 릴리스되지 않은 upgrade guide가 이미 다루는 surface를 바꿀 때, docs/upgrade-guide/v<version>/<item>/guide.md를 작성하거나 갱신하는 데 사용한다.
---

# DSH Create Upgrade Guide

Upgrade guide는 릴리스 vT를 실행하는 독자가 다음 릴리스를 실행하려면 무엇을 바꿔야 하는지 알려 준다. 호환성을 깨는 변경을 인식한 순간, 그 변경과 같은 change에 작성한다. 릴리스 준비 단계로 미루지 않는다.

## 범위

저장소 밖의 사람이 업그레이드 후 관찰할 수 있는 호환성 깨짐에만 guide를 작성한다.

- `dsh` 명령, 플래그, profile 이름;
- `cordis.yml`, patch, overlay, settings 키 또는 허용되는 값;
- persisted user data: Session 로그, SQLite 저장소, 사용자 데이터 디렉터리;
- TypeScript 및 Python SDK export, JSON-RPC, HTTP, ACP 메시지;
- 공개된 package 이름과 entry point.

소비자가 모두 같은 change에서 갱신되는 stable 이전 내부 API에는 guide가 필요 없다. Session 형식 변경은 여전히 [type acknowledgements](../../../docs/cookbook/reviewing-persistence-type-changes.md)를 따른다. 이 경우 guide에는 독자가 해야 할 행동만 적고, 해당 기록을 링크한다.

## 위치

`docs/upgrade-guide/v<version>/<item>/guide.md`

- `<version>`은 guide를 작성할 때 루트 `package.json`의 `version` 필드다. 예: `v0.1.7-rc.2`. Guide는 그 릴리스에서 다음 릴리스로의 업그레이드를 설명한다.
- `<item>`은 바뀐 surface를 나타내는 kebab-case 이름이다. 예: `profile-flag-rename`.
- 각 item 디렉터리에는 정확히 `guide.md`, 중국어 짝 파일 `guide.zh.md`, 짝 기록 `guide.i18n.yaml`만 둔다. 색인이나 첨부 파일은 두지 않는다.

## 유지보수

루트 version이 바뀌지 않는 동안, 현재 version 디렉터리는 vT에서 현재 `master`까지의 차이를 설명한다. 이후 변경이 그 디렉터리의 guide가 다루는 surface에 닿으면, 같은 change에서 해당 guide를 갱신한다. 변경이 되돌려지면 guide를 삭제한다. Version bump 이후 이전 version 디렉터리의 guide는 동결된다. 새로운 break는 새 version 디렉터리에 작성한다. 하나의 guide가 둘 이상의 릴리스에 걸치면 안 된다.

## 형식

[upgrade-guide template](../dsh-doc/templates/upgrade-guide.md)에서 시작한다. `verify-upgrade-guides`는 다음을 강제한다.

- 정확히 `kind: upgrade-guide`를 가진 frontmatter와, 무엇이 깨지는지 이름 붙인 한 문장짜리 `description`. Key는 게이트 검사와 함께만 추가하고, 그 뒤 모든 guide에 backfill한다;
- `#` 제목 하나, 그다음 `guide.md`에는 `## Change`와 `## Migration`, `guide.zh.md`에는 `## 变更`과 `## 迁移`이 이 순서로만 온다;
- `guide.md`는 frontmatter를 포함해 500단어 이하다.

`Change`는 surface의 이전 동작과 새 동작, 그리고 누가 영향을 받는지 설명한다. `Migration`은 정확한 파일, key, 명령, symbol을 이름으로 적은 순서 있는 단계를 나열하고, 마이그레이션이 성공했는지 확인하는 방법을 설명한다.

Guide가 500단어를 넘어야 하면 초과분은 다른 곳에 둔다. 코드를 다시 쓰는 대신 소스 파일이나 symbol을 링크한다. 근거는 [Agent Note](../../notes/README.md)로 옮긴다. 반복되는 기계적 단계는 guide가 호출하는 스크립트나 `dsh` 명령으로 바꾼다.

[dsh-prose-standard](../dsh-prose-standard/SKILL.md)를 따른다. 같은 change에서 [bilingual pairing rules](../../../docs/AGENTS.md)에 따라 중국어 짝 파일을 작성하고, `pnpm run verify-translation-pairing --write docs/upgrade-guide/v<version>/<item>/guide.md`로 짝을 기록한다.

## 검증

```sh
pnpm run verify-upgrade-guides
pnpm run verify-translation-pairing docs/upgrade-guide/v<version>/<item>/guide.md
pnpm run verify-md-links
```
