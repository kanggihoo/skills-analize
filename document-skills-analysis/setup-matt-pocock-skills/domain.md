# 도메인 문서 (Domain Docs)

엔지니어링 스킬들이 코드베이스를 탐색할 때 이 리포지토리의 도메인 문서를 소비하는 방식입니다.

## 탐색 전 읽어야 할 문서 (Before exploring, read these)

- 리포지토리 루트의 **`CONTEXT.md`**, 또는
- 존재 시 리포지토리 루트의 **`CONTEXT-MAP.md`** — 컨텍스트당 하나씩 `CONTEXT.md`를 가리킵니다. 주제와 관련된 문서를 읽으세요.
- **`docs/adr/`** — 작업하려는 영역과 관련된 ADR을 읽으세요. 다중 컨텍스트 리포지토리에서는 `src/<context>/docs/adr/`의 컨텍스트 스코프 결정사항도 확인하세요.

이 파일 중 어느 것도 존재하지 않는 경우 **조용히 진행하세요**. 파일의 부재를 표시하거나 사전에 작성을 제안하지 마세요. 용어나 결정이 실제로 정립될 때 `/domain-modeling` 스킬(`/grill-with-docs` 및 `/improve-codebase-architecture`를 통해 호출됨)이 지연 생성(lazily create) 방식으로 작성합니다.

## 파일 구조 (File structure)

단일 컨텍스트 리포지토리 (대부분의 리포지토리):

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

다중 컨텍스트 리포지토리 (루트에 `CONTEXT-MAP.md` 존재):

```
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← 시스템 전반의 결정사항
└── src/
    ├── ordering/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← 컨텍스트 전용 결정사항
    └── billing/
        ├── CONTEXT.md
        └── docs/adr/
```

## 용어집 어휘 사용 (Use the glossary's vocabulary)

출력물에서 도메인 개념을 언급할 때(이슈 제목, 리팩토링 제안서, 가설, 테스트 명칭 등), `CONTEXT.md`에 정의된 용어를 사용하세요. 용어집에서 명시적으로 피하는 유의어로 이탈하지 마세요.

필요한 개념이 아직 용어집에 없다면 신호입니다 — 프로젝트에서 사용하지 않는 언어를 만들어내고 있거나(재검토 필요), 실제 공백이 존재함( `/domain-modeling`을 위해 기록해 둠)을 의미합니다.

## ADR 충돌 알림 (Flag ADR conflicts)

출력물이 기존 ADR과 충돌하는 경우, 암묵적으로 덮어쓰지 말고 명시적으로 표면화하세요:

> _ADR-0007(이벤트 소스 주문)과 충돌함 — 그러나 다음과 같은 이유로 재검토할 가치가 있음..._
