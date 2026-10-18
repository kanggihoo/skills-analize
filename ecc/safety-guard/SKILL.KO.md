---
name: safety-guard
description: "세 가지 모드로 파괴적인 작업을 방지합니다. Careful 모드는 위험한 명령(rm -rf, git push --force, DROP TABLE)을 가로채 확인을 요청하고, Freeze 모드는 쓰기를 한 디렉터리로 잠그며, Guard 모드는 두 기능을 PreToolUse 훅으로 결합합니다. 프로덕션 시스템 작업, 에이전트의 자율 실행, 특정 디렉터리로 편집 범위 제한, 마이그레이션·배포·데이터 변경 중에 사용하세요."
metadata:
  origin: ECC
---

# Safety Guard — 파괴적 작업 방지

## 사용 시점

- 프로덕션 시스템에서 작업할 때
- 에이전트가 자율적으로(full-auto 모드) 실행될 때
- 편집을 특정 디렉터리로 제한하고 싶을 때
- 민감한 작업 중(마이그레이션, 배포, 데이터 변경)

## 동작 방식

세 가지 보호 모드가 있습니다.

### 모드 1: Careful 모드

실행 전에 파괴적인 명령을 가로채고 경고합니다.

```
Watched patterns:
- rm -rf (especially /, ~, or project root)
- git push --force
- git reset --hard
- git checkout . (discard all changes)
- DROP TABLE / DROP DATABASE
- docker system prune
- kubectl delete
- chmod 777
- sudo rm
- npm publish (accidental publishes)
- Any command with --no-verify
```

감지되면 해당 명령이 무엇을 하는지 보여주고, 확인을 요청하며, 더 안전한 대안을 제안합니다.

### 모드 2: Freeze 모드

파일 편집을 특정 디렉터리 트리로 잠급니다.

```
/safety-guard freeze src/components/
```

`src/components/` 밖에서 일어나는 모든 Write/Edit는 이유와 함께 차단됩니다. 에이전트가 관련 없는 코드를 건드리지 않고 한 영역에만 집중하게 하고 싶을 때 유용합니다.

### 모드 3: Guard 모드 (Careful + Freeze 결합)

두 보호 기능을 모두 활성화합니다. 자율 에이전트를 위한 최고 수준의 안전 설정입니다.

```
/safety-guard guard --dir src/api/ --allow-read-all
```

에이전트는 모든 것을 읽을 수 있지만 `src/api/`에만 쓸 수 있습니다. 파괴적인 명령은 어디서든 차단됩니다.

### 잠금 해제

```
/safety-guard off
```

## 구현

PreToolUse 훅을 사용하여 Bash, Write, Edit, MultiEdit 도구 호출을 가로챕니다. 실행을 허용하기 전에 명령이나 경로를 활성 규칙과 대조합니다.

## 통합

- `codex -a never` 세션에서 기본으로 활성화
- ECC 2.0의 관찰 가능성 위험 점수 기능과 함께 사용
- 차단된 모든 작업을 `~/.claude/safety-guard.log`에 기록
