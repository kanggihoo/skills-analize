# 템플릿: persistence-format

이 kind는 `docs/persistence-changes/historical-formats/vN.md`와 그 중국어 짝 파일에 사용한다. 각 기록은 명시적으로 선택된 과거 Session 형식 체크포인트 하나를, 선언된 타입 전체와 함께 설명한다. 형식 참고 자료이며 릴리스 기록이나 호환성 승인이 아니다. Checkout writer는 기존 현재 catalog를 사용한다.

## Frontmatter

```yaml
---
description: "The historical Session format, source checkpoint, and persistence types documented here."
kind: persistence-format
---
```

## 섹션

1. **Summary:** 형식을 식별하고, 그 형식을 구별하는 영속 필드를 적는다.
2. **Table of Contents:** 아래 섹션을 공유 이중 언어 앵커로 링크한다.
3. **Source evidence:** 태그 또는 PR을 적고, 소스 트리를 고르는 데 필요한 맥락을 충분히 제공한다. PR의 중간 트리를 최종 merge나 제품 릴리스인 것처럼 제시하면 안 된다. 과거 소스는 줄 번호 없이 파일 경로로 적고, 정확한 소스에 링크하지 않는 한 텍스트로 남긴다.
4. **Format characteristics:** header, 이벤트, 물리 인코딩의 차이를 설명한다. 선언된 타입 목록 밖의 동작은 codec 담당 파일을 링크한다.
5. **Declaration:** 언어별로 동일한 `yaml persistence-format` 블록을 하나씩 둔다. 블록에는 `schemaVersion: 1`, 숫자형 `sessionFormatVersion`, 정확히 하나의 `tag` 또는 숫자형 `pullRequest`만 담는 `source`, 모든 root key에서 캡처된 SHA-256 digest로 가는 `roots` 매핑이 들어간다. 짝 `vN.schema.json`을 링크한다.
6. **Complete schemas:** `persistence-format-schema:start` / `persistence-format-schema:end` 주석 영역을 하나 유지한다. 형식 검증기가 이 영역에 root digest와 도달 가능한 모든 정의를 렌더링한다.
7. **Verification and limitations:** 실제 추출 증거, 커버리지 한계, 오프라인 검증기를 밝힌다. 과거의 선택적 필드와 불투명한 선언을 보존한다. Codec 승인이나 마이그레이션 안전성은 주장하지 않는다.
8. **Dev Note:** 권위 없는 작업 맥락을 둔다. 없으면 `None.`이라고 쓴다.

[format index](../../../../docs/persistence-changes/historical-formats/README.md)가 커버리지와 유지보수를 담당한다. `pnpm run verify-persistence-formats --write`는 생성 영역과 짝 기록을 갱신하기 전에 스키마를 검증한다. 과거 증거를 만들거나 기계 데이터를 고칠 수는 없다. 현재 writer가 올라가도 과거의 정수 버전은 모두 문서로 남긴다. 현재 catalog를 과거 파일 이름 아래에 복제하지 않는다.
