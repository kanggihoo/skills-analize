# 템플릿: persistence-release

이 kind는 `docs/persistence-changes/releases/dsh-v<version>.md`와 그 중국어 짝 파일에 사용한다. 이 기록은 태그된 persistence 타입을 사람이 비교하고 형식을 검증하도록 재구성한 것이다. 관찰 기록이며 호환성 승인이 아니다. 현재 소스 기록 체인에는 참여하지 않는다.

## Frontmatter

```yaml
---
description: "The tagged persistence types and adjacent-release differences recorded here."
kind: persistence-release
---
```

## 섹션

1. **Summary:** 바로 앞의 사용 가능한 태그와 비교한 구체적인 타입 차이 또는 차이가 없다는 사실을 설명한다. 관련이 있으면 Session writer 버전도 적는다.
2. **Table of Contents:** 아래 섹션을 공유 이중 언어 앵커로 링크한다.
3. **Release evidence:** 소스 태그와 태그된 소스 경로를 적는다. 그다음 바로 앞 기록과 스키마 짝 파일을 상대 경로로 링크한다. 재구성의 한계를 밝힌다.
4. **Declaration:** `yaml persistence-release` 블록을 정확히 하나 포함한다. 블록에는 `schemaVersion: 1`, `tag`, `previous`, `sessionFormatVersion`, `changes`가 들어간다. 각 change는 `root`, `before`, `after`를 적는다. 부재는 null로 나타낸다. 두 언어의 기계 블록은 동일하다.
5. **Structural changes:** 기계적으로 감지된 경로와 종류를 나열한다. 현재 규칙에 따른 분류는 참고용이다. 과거 릴리스의 안전성을 증명하지 않으며, 관찰된 writer 버전이 올랐다는 뜻도 아니다.
6. **Verification:** 실행한 재구성과 검증 증거를 밝힌다. `pnpm run verify-persistence-releases`는 소스 checkout, Git, 네트워크 접근 없이 커밋된 아카이브를 검증한다.
7. **Dev Note:** 권위 없는 작업 맥락만 이 섹션에 둔다. 없으면 `None.`이라고 쓴다.

## Snapshot과 history 규칙

[archive reference](../../../../docs/persistence-changes/releases/README.md)가 고정된 릴리스 manifest와 추출 한계를 담당한다. 첫 기록에는 추출된 모든 root가 들어간다. 이후 스키마 짝 파일에는 여전히 존재하는 변경 root와 도달 가능한 모든 타입 정의만 들어간다. 변경이 없는 경우 빈 changes와 snapshot으로 타입이 바뀌지 않은 릴리스를 보존한다. 각 기록은 바로 앞 manifest 항목을 참조한다.

색인 표, 인벤토리 셀, 구조 변경 사실은 `persistence-release-index`, `persistence-release-inventory`, `persistence-release-changes`의 start/end 주석 마커를 사용한다. 사람이 쓴 설명은 이 생성 영역 밖에 둔다. `pnpm run verify-persistence-releases --write`는 기계 데이터를 모두 검증한 뒤 사실 영역과 짝 기록을 갱신한다. 작성된 산문, 기계 선언, 스키마 파일은 보존한다. 기본 검증은 오래된 생성 사실과 누락된 고정 색인 파일을 거부한다.

원본 소스의 `number` 선언과 과거의 선택적 필드는 그대로 둔다. 실제 writer 버전 상수는 따로 보고한다. 과거 파싱은 surface 이벤트에 선택적 `surfaceOp`을 허용한다. 실시간 persistence parser와 승인 규칙은 계속 엄격하다. 이 회고 기록을 현재 소스 승인 체인에 넣지 않는다. 과거 릴리스를 맞추려고 커밋된 기준선을 다시 쓰지 않는다.
