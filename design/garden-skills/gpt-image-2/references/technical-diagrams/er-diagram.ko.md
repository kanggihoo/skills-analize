# ER 다이어그램 / 데이터 모델 다이어그램 템플릿

> ⚠️ **이 템플릿은 비트맵(PNG)을 생성합니다.** dbdiagram.io / draw.io에서 편집 가능한 ER 다이어그램이 아닙니다.
> 편집 가능한 다이어그램이 필요하면 dbdiagram.io / draw.io / DBeaver를 사용하세요.

이 문서는 "엔지니어링 스타일 ER 다이어그램 / 데이터 모델 다이어그램"을 만들 때 사용합니다.

- 데이터베이스 테이블 구조도(PG / MySQL / SQLite)
- 도메인 모델(DDD 엔티티 + 관계)
- 문서형 데이터베이스 스키마(MongoDB / DynamoDB)
- API 데이터 계약 스키마도
- 마이크로서비스 경계 + 데이터 소유권도

특징:

- 엔티티 상자는 둥근 사각형이며 위아래 두 영역으로 나뉩니다: 위쪽은 테이블 이름 / 아래쪽은 필드 목록
- 필드 행은 필드명 + 유형 + 기본 키 PK / 외래 키 FK 표시로 구성
- 관계선은 1:1 / 1:N / N:M을 나타냅니다(crow's foot 또는 UML 다중도 사용).
- 어두운 그리드 + 고정폭 글꼴(기존 기술 다이어그램 시각 시스템을 따름)

## 적용 범위

- 데이터베이스 테이블 구조
- 도메인 모델 / DDD 엔티티
- API 스키마 문서
- 데이터베이스 설계 검토
- 마이크로서비스 데이터 소유권도

## 사용 시점

- 사용자가 "ER 다이어그램 / Entity-Relationship / 데이터 모델 / DB 설계 / 스키마도 / 테이블 구조"를 언급할 때
- 엔티티 + 필드 + 관계를 표준 ER 다이어그램 스타일로 표현하길 원할 때
- 비트맵 형식을 수용할 때

다음에는 사용하지 마세요.

- 시스템 아키텍처를 원하는 경우 → `technical-diagrams/system-architecture.md` 사용
- 클래스 다이어그램 / UML 클래스 다이어그램(메서드 포함)을 원하는 경우 → 아직 전용 템플릿이 없으므로 이 템플릿에 메서드 행을 추가해 사용 가능
- 마인드맵을 원하는 경우 → `technical-diagrams/mind-map-tech.md` 사용

## 누락 정보 확인 우선순위

1. 데이터베이스 / 도메인 이름("전자상거래 데이터 모델 / SaaS 사용자 관리 스키마")
2. 엔티티 목록(4~12개 권장, 초과하면 하위 다이어그램으로 나누는 방안 검토)
3. 엔티티별 필드(필드명 + 유형 + PK/FK + nullable 여부)
4. 엔티티 간 관계(1:1 / 1:N / N:M, cascade 여부)
5. enum / index / constraint 포함 여부
6. 비율(기본값 4:3 또는 16:9)

## 기본 템플릿: 표준 ER 다이어그램(어두운 엔지니어링 스타일)

📖 설명

전체 이미지는 여러 엔티티 상자로 구성됩니다. 각 상자 위쪽에는 테이블 이름 + 엔티티 라벨(📦 entity), 아래쪽에는 유형 + PK/FK 표시가 붙은 필드를 나열합니다. 엔티티끼리 관계선으로 연결하고 선 끝의 crow's foot으로 1 / N을 표현합니다.

📝 프롬프트

```json
{
  "type": "엔지니어링 스타일 ER 다이어그램 / 데이터 모델 다이어그램",
  "goal": "데이터베이스 설계 문서 / API 스키마 / 도메인 모델 검토용 엔지니어링 스타일 ER 다이어그램 생성",
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect_ratio\" default=\"4:3\"}",
    "background": "32px 간격의 은은한 1px 그리드가 있는 짙은 슬레이트 #0F172A, #1E293B",
    "outer_padding": "60px"
  },
  "title_strip": {
    "title": "{argument name=\"title\" default=\"전자상거래 데이터 모델\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"핵심 엔티티 · v1.0\"}",
    "position": "왼쪽 위, JetBrains Mono / SF Mono, 연회색"
  },
  "entities": {
    "count": "{argument name=\"entity_count\" default=\"6\"}",
    "items": [
      {
        "id": "E1",
        "name": "users",
        "category": "user",
        "fields": [
          { "name": "id", "type": "uuid", "marker": "PK" },
          { "name": "email", "type": "varchar(255)", "marker": "UQ" },
          { "name": "password_hash", "type": "varchar(255)", "marker": "" },
          { "name": "created_at", "type": "timestamp", "marker": "" },
          { "name": "updated_at", "type": "timestamp", "marker": "" }
        ]
      },
      {
        "id": "E2",
        "name": "orders",
        "category": "transaction",
        "fields": [
          { "name": "id", "type": "uuid", "marker": "PK" },
          { "name": "user_id", "type": "uuid", "marker": "FK→users.id" },
          { "name": "status", "type": "enum", "marker": "" },
          { "name": "total_cents", "type": "bigint", "marker": "" },
          { "name": "created_at", "type": "timestamp", "marker": "" }
        ]
      },
      {
        "id": "E3",
        "name": "order_items",
        "category": "transaction",
        "fields": [
          { "name": "id", "type": "uuid", "marker": "PK" },
          { "name": "order_id", "type": "uuid", "marker": "FK→orders.id" },
          { "name": "product_id", "type": "uuid", "marker": "FK→products.id" },
          { "name": "quantity", "type": "int", "marker": "" },
          { "name": "unit_price_cents", "type": "bigint", "marker": "" }
        ]
      },
      {
        "id": "E4",
        "name": "products",
        "category": "catalog",
        "fields": [
          { "name": "id", "type": "uuid", "marker": "PK" },
          { "name": "sku", "type": "varchar(64)", "marker": "UQ" },
          { "name": "name", "type": "varchar(255)", "marker": "" },
          { "name": "price_cents", "type": "bigint", "marker": "" },
          { "name": "stock", "type": "int", "marker": "" }
        ]
      },
      {
        "id": "E5",
        "name": "categories",
        "category": "catalog",
        "fields": [
          { "name": "id", "type": "uuid", "marker": "PK" },
          { "name": "name", "type": "varchar(128)", "marker": "" },
          { "name": "parent_id", "type": "uuid", "marker": "FK→categories.id (self)" }
        ]
      },
      {
        "id": "E6",
        "name": "product_categories",
        "category": "join",
        "fields": [
          { "name": "product_id", "type": "uuid", "marker": "PK,FK→products.id" },
          { "name": "category_id", "type": "uuid", "marker": "PK,FK→categories.id" }
        ]
      }
    ]
  },
  "entity_style": {
    "shape": "모서리 반경 6px의 둥근 사각형",
    "fill": "카테고리 색상 × 불투명도 10%",
    "border": "카테고리 색상의 1.5px 실선",
    "header_strip": "상단 약 28px 높이를 카테고리 색상 × 불투명도 25%로 채움. 굵은 고정폭 12pt 테이블 이름 + 작은 아이콘 기호 포함",
    "field_row_style": "헤더 아래 필드 행을 고정폭 10pt로 표시: 'field_name : type [marker]', 읽기 쉽도록 행 배경색을 번갈아 적용",
    "marker_color": "PK = 굵은 호박색, FK = 파랑, UQ = 보라, NN = 은은한 회색"
  },
  "category_color_map": {
    "user": "시안 #22D3EE",
    "transaction": "에메랄드 #34D399",
    "catalog": "바이올렛 #A78BFA",
    "join": "슬레이트 #94A3B8",
    "system": "호박색 #FBBF24",
    "external": "로즈 #FB7185"
  },
  "relationships": {
    "items": [
      { "from": "E1", "to": "E2", "cardinality": "1:N", "label": "places" },
      { "from": "E2", "to": "E3", "cardinality": "1:N", "label": "contains" },
      { "from": "E4", "to": "E3", "cardinality": "1:N", "label": "appears_in" },
      { "from": "E4", "to": "E6", "cardinality": "1:N", "label": "" },
      { "from": "E5", "to": "E6", "cardinality": "1:N", "label": "" },
      { "from": "E5", "to": "E5", "cardinality": "0..1:N", "label": "parent_of (self)" }
    ],
    "line_style": {
      "default": "슬레이트 #94A3B8의 1.5px 실선",
      "endpoint_notation": "crow's foot 표기 사용: '1' = 수직 표시 하나, 'N' = 세 갈래 crow's foot, '0..1' = 빈 원 + 표시, '0..N' = 빈 원 + crow's foot",
      "label_format": "관계를 나타내는 동사를 선 중앙 근처에 고정폭 9pt로 배치(예: 'places' / 'contains')"
    },
    "rule_routing": "관계선이 엔티티를 가로지르지 않게 함. 직교 경로를 우선하고 자기 관계선은 옆으로 휘게 함"
  },
  "extras": {
    "indices_section": {
      "enabled": "{argument name=\"indices_enabled\" default=\"false\"}",
      "rule": "true인 경우 각 엔티티 아래에 인덱스 이름 목록(예: 'idx_users_email')을 적은 작은 'Indices' 영역 추가"
    },
    "color_legend": {
      "enabled": true,
      "position": "bottom-right",
      "content": "카테고리 색상과 역할 대응 + 마커 의미(PK / FK / UQ / NN) + 카디널리티 표기",
      "style": "반투명 배경의 작은 패널, 고정폭 10pt"
    }
  },
  "constraints": {
    "must_keep": [
      "엔티티 상자 모양을 통일(둥근 사각형 + 헤더 띠)",
      "필드 행에 고정폭 글꼴 사용, 유형은 오른쪽 정렬 또는 콜론으로 구분",
      "PK / FK / UQ 마커를 색상과 텍스트로 분명하게 표현",
      "관계선에 crow's foot 또는 UML 다중도로 1:1 / 1:N / N:M을 나타냄",
      "테이블 안 FK 필드에 FK→target_table.field 표시",
      "어두운 그리드 배경 + 고정폭 글꼴",
      "범례를 반드시 그림"
    ],
    "avoid": [
      "다이아몬드를 엔티티로 사용(의미가 틀림)",
      "필드 행에 비례 글꼴 사용(정렬이 무너짐)",
      "FK에 target을 표시하지 않아 관계 맥락이 사라짐",
      "관계선 끝에 카디널리티 표시가 없음",
      "엔티티 12개 초과(복잡해지므로 하위 도메인별로 분리)",
      "조인 테이블과 일반 테이블을 같은 색으로 표시(조인 테이블은 회색 'join'으로 구분)",
      "필드 마커를 이모지로 표시",
      "편집 가능한 SVG라고 주장"
    ]
  }
}
```

### 매개변수 전략

- **반드시 질문**: `title`, 엔티티 목록(필드 + PK/FK 마커 포함), 관계 목록(카디널리티 포함)
- **기본값 지정 가능**: `background`(다크 그리드), `category_color_map`, `indices_enabled`(false)
- **무작위 지정 가능**: 엔티티 위치(간선 교차를 줄이도록 자동 배치)

### 자동 완성 전략

- 사용자가 "전자상거래 스키마"를 말하면 기본 엔티티 6개를 사용합니다.
- 카디널리티를 지정하지 않으면 다시 질문합니다(관계 의미를 임의 추측하지 않음).
- 카테고리를 지정하지 않으면 테이블 이름을 바탕으로 자동 분류합니다(users → user, orders → transaction, products → catalog, *_join → join).
- 라이트 모드를 원하면 변형 1을 사용합니다.
- "인덱스 포함"을 요청하면 `indices_enabled`를 활성화합니다.

## 변형 1: 밝은 배경 ER 다이어그램

```json
{
  "modify": {
    "background": "은은한 그리드 #E2E8F0이 있는 따뜻한 미색 #F8FAFC",
    "entity_fill": "카테고리 색상 × 불투명도 8%",
    "entity_border": "흰 배경에서는 더 짙은 색조를 사용하는 1.5px 실선",
    "label_color": "짙은 슬레이트 #0F172A",
    "vibe": "흰 배경 문서 사이트에 적합"
  }
}
```

## 변형 2: DDD 도메인 모델(메서드 / 동작 포함)

```json
{
  "modify": {
    "entity_label_format": "테이블 이름 위에 <<entity / value object / aggregate root>> 스테레오타입 라벨 추가",
    "field_section_split": "엔티티 내부를 필드 영역과 메서드 영역으로 분리하고 '——' 구분선 사용. 메서드는 'methodName(args): returnType' 형식",
    "category_color_map_extra": "aggregate root = 호박색, entity = 에메랄드, value object = 바이올렛, domain service = 시안",
    "use_case": "DDD 전술 설계 검토, 도메인 모델링 워크숍"
  }
}
```

적합: DDD 프로젝트 도메인 모델링, UML 클래스 다이어그램, 비즈니스 모델링.

## 변형 3: 마이크로서비스 데이터 소유권도(bounded context)

```json
{
  "modify": {
    "extras": "같은 서비스에 속한 엔티티를 큰 점선 박스(bounded context)로 감싸고 'User Service' / 'Order Service' 등으로 라벨링",
    "cross_service_relations": "서비스 간 관계는 빨간 점선으로 표시(안티패턴 또는 명시적 서비스 경계 횡단을 암시)",
    "use_case": "마이크로서비스 분리, bounded context 설계, Conway 법칙 정렬"
  }
}
```

적합: 마이크로서비스 설계, bounded context 분할, 데이터 소유권 검토.

## 피해야 할 사항

- 필드 행에 비례 글꼴을 사용하면 유형 / 마커가 정렬되지 않습니다.
- FK 대상 테이블을 표시하지 않으면 관계 맥락이 사라집니다.
- 관계선에 카디널리티를 표시하지 않으면 ER 의미가 완전히 사라집니다.
- 엔티티가 12개를 넘으면 시각적으로 과도하게 복잡해지므로 분할합니다.
- 다이아몬드를 엔티티로 쓰면 의미가 잘못됩니다.
- 필드 표시를 이모지로 하지 않습니다.
- 조인 테이블을 일반 테이블과 같은 색으로 표시하지 않습니다.
- 편집 가능한 SVG라고 주장하지 않습니다.
- 시스템 아키텍처를 ER 다이어그램에 억지로 넣지 않습니다(해당 템플릿 사용).
- 필드 유형을 생략하지 않습니다(엔지니어링 가치를 잃습니다).
