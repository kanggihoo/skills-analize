---
name: setup-pre-commit
description: 현재 저장소에 Husky pre-commit 훅을 lint-staged(Prettier), 타입 검사, 테스트와 함께 설정합니다. 사용자가 pre-commit 훅 추가, Husky 설정, lint-staged 구성, 커밋 시점의 포맷팅/타입 검사/테스트 추가를 원할 때 사용합니다.
---

# Pre-Commit 훅 설정

## 설정되는 항목

- **Husky** pre-commit 훅
- 모든 스테이징된 파일에 Prettier를 실행하는 **lint-staged**
- **Prettier** 설정(없는 경우)
- pre-commit 훅 안의 **typecheck** 및 **test** 스크립트

## 단계

### 1. 패키지 매니저 감지

`package-lock.json`(npm), `pnpm-lock.yaml`(pnpm), `yarn.lock`(yarn), `bun.lockb`(bun) 파일이 있는지 확인합니다. 존재하는 것을 사용하세요. 불분명하면 npm을 기본으로 합니다.

### 2. 의존성 설치

devDependencies로 설치합니다.

```
husky lint-staged prettier
```

### 3. Husky 초기화

```bash
npx husky init
```

이 명령은 `.husky/` 디렉터리를 만들고 package.json에 `prepare: "husky"`를 추가합니다.

### 4. `.husky/pre-commit` 생성

다음 내용으로 파일을 작성합니다(Husky v9 이상에서는 shebang이 필요 없습니다).

```
npx lint-staged
npm run typecheck
npm run test
```

**조정**: `npm`은 감지한 패키지 매니저로 바꿉니다. 저장소의 package.json에 `typecheck` 또는 `test` 스크립트가 없다면 해당 줄을 빼고 사용자에게 알려 주세요.

### 5. `.lintstagedrc` 생성

```json
{
  "*": "prettier --ignore-unknown --write"
}
```

### 6. `.prettierrc` 생성(없는 경우)

Prettier 설정이 없을 때만 만듭니다. 다음 기본값을 사용하세요.

```json
{
  "useTabs": false,
  "tabWidth": 2,
  "printWidth": 80,
  "singleQuote": false,
  "trailingComma": "es5",
  "semi": true,
  "arrowParens": "always"
}
```

### 7. 검증

- [ ] `.husky/pre-commit`이 존재하고 실행 가능한지
- [ ] `.lintstagedrc`가 존재하는지
- [ ] package.json의 `prepare` 스크립트가 `"husky"`인지
- [ ] `prettier` 설정이 존재하는지
- [ ] `npx lint-staged`를 실행해 동작하는지 확인

### 8. 커밋

변경되거나 생성된 파일을 모두 스테이징하고 다음 메시지로 커밋합니다: `Add pre-commit hooks (husky + lint-staged + prettier)`

새 pre-commit 훅이 실행되므로, 이것으로 모든 설정이 동작하는지 확인하는 간단한 스모크 테스트가 됩니다.

## 참고

- Husky v9 이상에서는 훅 파일에 shebang이 필요 없습니다.
- `prettier --ignore-unknown`은 Prettier가 파싱할 수 없는 파일(이미지 등)을 건너뜁니다.
- pre-commit은 먼저 lint-staged를 실행하고(빠르며 스테이징된 파일만 대상), 이후 전체 타입 검사와 테스트를 실행합니다.
