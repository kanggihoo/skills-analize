# 네트워크 토폴로지 다이어그램 템플릿

> ⚠️ **이 템플릿은 비트맵(PNG)을 생성합니다.** NetBox / Cisco Packet Tracer / draw.io에서 편집 가능한 네트워크 토폴로지가 아닙니다.
> 편집 가능한 파일이 필요하면 NetBox / Lucidchart / draw.io / Cisco Packet Tracer를 사용하세요.

이 문서는 "엔지니어링 스타일 네트워크 토폴로지 다이어그램"을 만들 때 사용합니다.

- 기업 / 데이터센터 네트워크 토폴로지
- 여러 리전 / 존 배포 토폴로지
- 마이크로서비스 / 서비스 메시 토폴로지
- VPC / 서브넷 / 라우팅 테이블 토폴로지
- 엣지 / CDN / 멀티클라우드 연결 토폴로지

특징:

- 장비 노드는 유형별 기호 사용: 라우터(다이아몬드 안의 X) / 스위치(포트가 여러 개인 사각형) / 서버(방열 슬롯이 있는 소형 섀시) / 방화벽(벽돌 무늬) / 클라우드(구름) / DB(원기둥)
- 물리 연결은 굵은 선, 논리 연결은 점선
- 큰 점선 상자로 존 / VLAN / VPC를 둘러쌈
- 링크 위에 대역폭 / 프로토콜 표시(예: "10 Gbps" / "BGP" / "TLS 1.3")
- 어두운 그리드 + 고정폭 글꼴(기존 시각 시스템 재사용)

## 적용 범위

- 데이터센터 / 서버실 네트워크 토폴로지
- 클라우드 네트워크 아키텍처(VPC / subnet / NAT / IGW)
- 여러 리전 / 멀티클라우드 연결
- 서비스 메시 토폴로지
- 엣지 / CDN / 공용 인터넷 진입 토폴로지

## 사용 시점

- 사용자가 "네트워크 토폴로지 / network topology / 배포 토폴로지 / VPC / 서브넷 / 데이터센터 / 서버실 / 서비스 메시"를 언급할 때
- 네트워크 장비 기호 + 영역 그룹 + 링크 대역폭 라벨이 있는 표준 네트워크 다이어그램을 원할 때
- 비트맵 형식을 수용할 때

다음에는 사용하지 마세요.

- 애플리케이션 계층 시스템 아키텍처 → `technical-diagrams/system-architecture.md` 사용
- 업무 흐름 → `technical-diagrams/flowchart-decision.md` 사용
- 시퀀스 다이어그램 → `technical-diagrams/sequence-diagram.md` 사용

## 누락 정보 확인 우선순위

1. 토폴로지 이름("AWS VPC 토폴로지 / 기업 서버실 토폴로지 / 멀티리전 배포")
2. 주요 존 / 서브넷 / VPC(2~5개 영역 권장)
3. 각 영역의 장비 / 인스턴스(라우터 / 스위치 / 서버 / DB / 로드밸런서)
4. 영역 간 연결(VPN / Peering / IGW / Direct Connect)
5. 링크 프로토콜 / 대역폭(선택)
6. IP 대역 / CIDR을 표시할지 여부
7. 비율(기본값 가로 16:9)

## 기본 템플릿: 표준 클라우드 / 데이터센터 네트워크 토폴로지 다이어그램

📖 설명

전체 이미지를 존 / VPC 기준의 큰 점선 박스로 구분합니다. 각 영역 안에는 유형별 기호가 있는 장비 노드를 배치하고, 대역폭 / 프로토콜 라벨이 붙은 굵은 선으로 노드를 연결합니다. 영역 간 연결에는 전용 게이트웨이 / VPN 노드를 사용합니다. 전체적으로 어두운 그리드 배경의 엔지니어링 느낌을 줍니다.

📝 프롬프트

```json
{
  "type": "엔지니어링 스타일 네트워크 토폴로지 다이어그램",
  "goal": "배포 문서 / 네트워크 아키텍처 검토 / 교육 자료로 사용할 엔지니어링 스타일 네트워크 토폴로지 다이어그램 생성",
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect_ratio\" default=\"16:9\"}",
    "background": "32px 간격의 은은한 1px 그리드가 있는 짙은 슬레이트 #0F172A, #1E293B",
    "outer_padding": "60px"
  },
  "title_strip": {
    "title": "{argument name=\"title\" default=\"AWS 멀티 AZ VPC 토폴로지\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"프로덕션 · ap-northeast-1\"}",
    "position": "왼쪽 위, JetBrains Mono / SF Mono, 연회색"
  },
  "device_glyphs": {
    "rule": "모든 장비에 일관된 미니멀 기하학 기호를 사용하고 실제 제조사 로고는 피함",
    "types": [
      { "type": "router", "glyph": "안에 X 교차선이 있는 다이아몬드", "color": "호박색 #FBBF24" },
      { "type": "switch", "glyph": "아래 가장자리에 포트 점이 여러 개 있는 사각형", "color": "호박색 #FBBF24" },
      { "type": "firewall", "glyph": "2~3줄의 작은 사각형으로 표현한 벽돌 무늬", "color": "로즈 #FB7185" },
      { "type": "load_balancer", "glyph": "들어오는 선 3개와 나가는 선 1개가 있는 사다리꼴 깔때기", "color": "파랑 #60A5FA" },
      { "type": "server", "glyph": "가로 슬롯 3~4개가 있는 작은 랙 사각형", "color": "에메랄드 #34D399" },
      { "type": "container", "glyph": "돛 / 선적 컨테이너 기호가 있는 둥근 사각형", "color": "에메랄드 #34D399" },
      { "type": "database", "glyph": "원기둥(3D 느낌은 최소화)", "color": "바이올렛 #A78BFA" },
      { "type": "cloud_service", "glyph": "안에 약어(예: 'S3', 'CDN')가 있는 구름 윤곽", "color": "시안 #22D3EE" },
      { "type": "user", "glyph": "막대 인간", "color": "시안 #22D3EE" },
      { "type": "internet", "glyph": "위도 / 경도 선이 있는 지구본", "color": "슬레이트 #94A3B8" },
      { "type": "nat_gateway", "glyph": "'NAT' 라벨이 있는 작은 사각형", "color": "호박색 #FBBF24" },
      { "type": "vpn_gateway", "glyph": "열쇠 아이콘과 'VPN' 라벨이 있는 작은 사각형", "color": "로즈 #FB7185" }
    ]
  },
  "zones": {
    "count": "{argument name=\"zone_count\" default=\"4\"}",
    "items": [
      { "id": "Z1", "label": "공용 인터넷", "color_border": "슬레이트 #94A3B8 점선", "cidr": "0.0.0.0/0" },
      { "id": "Z2", "label": "VPC · ap-northeast-1\\n10.0.0.0/16", "color_border": "호박색 #FBBF24 점선", "cidr": "10.0.0.0/16" },
      { "id": "Z3", "label": "공용 서브넷 · 10.0.1.0/24 (AZ-a)", "color_border": "파랑 #60A5FA 점선", "parent": "Z2" },
      { "id": "Z4", "label": "프라이빗 서브넷 · 10.0.2.0/24 (AZ-a)", "color_border": "에메랄드 #34D399 점선", "parent": "Z2" }
    ],
    "zone_label_position": "각 존 상자의 왼쪽 위, 고정폭 11pt, 둘째 줄에 CIDR 표시"
  },
  "nodes": {
    "items": [
      { "id": "N1", "type": "user", "label": "최종 사용자", "zone": "Z1" },
      { "id": "N2", "type": "internet", "label": "인터넷", "zone": "Z1" },
      { "id": "N3", "type": "cloud_service", "label": "CloudFront\\n(CDN)", "zone": "Z1" },
      { "id": "N4", "type": "load_balancer", "label": "ALB", "zone": "Z3" },
      { "id": "N5", "type": "nat_gateway", "label": "NAT GW", "zone": "Z3" },
      { "id": "N6", "type": "container", "label": "ECS 작업\\n(인스턴스 2개)", "zone": "Z4" },
      { "id": "N7", "type": "database", "label": "RDS PostgreSQL\\n(Multi-AZ)", "zone": "Z4" },
      { "id": "N8", "type": "cloud_service", "label": "S3\\n(정적 자산)", "zone": "Z1" }
    ],
    "node_label_format": "장비 이름 + 선택적인 두 번째 줄 세부 정보(수량 / 클래스 / 역할). 기호 아래 고정폭 10pt로 표시"
  },
  "connections": {
    "items": [
      { "from": "N1", "to": "N2", "type": "physical", "label": "" },
      { "from": "N2", "to": "N3", "type": "physical", "label": "HTTPS / TLS 1.3" },
      { "from": "N3", "to": "N4", "type": "physical", "label": "Origin pull" },
      { "from": "N4", "to": "N6", "type": "physical", "label": "HTTP" },
      { "from": "N6", "to": "N7", "type": "physical", "label": "TCP 5432" },
      { "from": "N6", "to": "N5", "type": "physical", "label": "egress" },
      { "from": "N5", "to": "N2", "type": "physical", "label": "" },
      { "from": "N3", "to": "N8", "type": "physical", "label": "Origin pull" }
    ],
    "line_style": {
      "physical": "실제 트래픽을 나타내는 슬레이트 #94A3B8 2px 실선",
      "logical": "논리적 관계(예: 'IAM이 접근 허용')를 나타내는 슬레이트 #64748B 1.5px 점선",
      "redundant": "HA 이중화 연결을 나타내는 바이올렛 #A78BFA 이중선",
      "encrypted": "중앙에 작은 자물쇠 기호가 있는 에메랄드 #34D399 2px 실선"
    },
    "label_format": "프로토콜 + 선택적 대역폭(예: 'HTTPS / 443' / '10 Gbps' / 'BGP' / 'TLS 1.3'), 연결 중앙에 고정폭 9pt로 표시",
    "rule_routing": "주로 직교 경로를 사용하고 존 사이를 지날 때 존 경계선을 관통해 그림"
  },
  "annotations": {
    "ip_cidr_labels": {
      "enabled": "{argument name=\"ip_labels_enabled\" default=\"true\"}",
      "rule": "모든 존에 CIDR을 표시하고 주요 노드에 IP 또는 호스트 이름을 표시"
    },
    "az_labels": {
      "enabled": "{argument name=\"az_labels_enabled\" default=\"true\"}",
      "rule": "클라우드 환경에서는 가용 영역(AZ-a / AZ-b)을 표시"
    }
  },
  "legend": {
    "enabled": true,
    "position": "bottom-right",
    "content": "장비 기호 → 장비 유형, 선 스타일 → 연결 유형(물리 / 논리 / 이중화 / 암호화), 존 색상 → 존 유형",
    "style": "반투명 배경의 작은 패널, 고정폭 10pt"
  },
  "constraints": {
    "must_keep": [
      "장비 기호를 통일하고 혼용하지 않음",
      "존을 큰 점선 상자로 명확히 둘러쌈",
      "존 라벨에 CIDR / AZ(클라우드) 또는 VLAN ID(데이터센터) 포함",
      "연결선 굵기 / 색상으로 연결 유형 표현",
      "어두운 그리드 배경 + 고정폭 글꼴",
      "범례를 반드시 그림"
    ],
    "avoid": [
      "실제 제조사 로고(Cisco / AWS / Azure 아이콘) 사용 → 상표 문제와 시각 통일성 저해",
      "같은 장비 유형에 서로 다른 기호 사용",
      "장비 기호에 이모지 사용",
      "존 경계에 점선을 사용하지 않아 영역 구분이 사라짐",
      "링크에 프로토콜 라벨이 없어 엔지니어링 정보가 부족함",
      "노드가 15개 초과해 혼잡함(하위 다이어그램으로 분리)",
      "3D / 그라데이션 / 유리 질감 사용",
      "편집 가능한 SVG라고 주장"
    ]
  }
}
```

### 매개변수 전략

- **반드시 질문**: `title`, 존 목록(CIDR / 이름 포함), 노드 목록(type + zone 포함), 연결 목록(from / to 포함)
- **기본값 지정 가능**: `background`(어두운 그리드), `device_glyphs`(기본 전체 세트), `ip_labels_enabled`(true), `az_labels_enabled`(true)
- **무작위 지정 가능**: 존 내부 노드 위치(자동 배치)

### 자동 완성 전략

- 사용자가 "AWS 단일 AZ VPC + ALB + ECS + RDS"라고 하면 기본 토폴로지를 사용합니다.
- CIDR을 제공하지 않으면 질문합니다(IP 대역을 임의로 만들면 안 됨).
- "멀티 AZ HA 추가"라고 하면 프라이빗 서브넷을 AZ-b에 복제하고 이중화 연결을 표시합니다.
- "WAF / Shield 추가"라고 하면 ALB 앞에 방화벽 기호를 넣습니다.
- 라이트 모드를 원하면 변형 1을 사용합니다.

## 변형 1: 밝은 배경 네트워크 토폴로지

```json
{
  "modify": {
    "background": "은은한 그리드 #E2E8F0이 있는 따뜻한 미색 #F8FAFC",
    "node_glyph_fill": "장비 색상 × 불투명도 8%",
    "node_glyph_border": "흰 배경에 맞는 짙은 색조의 1.5px 실선",
    "label_color": "짙은 슬레이트 #0F172A",
    "zone_border_color": "더 짙은 색조",
    "vibe": "흰 배경 문서 / 인쇄용"
  }
}
```

## 변형 2: 서비스 메시 토폴로지

```json
{
  "modify": {
    "title_format": "서비스 메시 토폴로지",
    "node_emphasis": "각 서비스 노드 옆에 사이드카 프록시 기호를 작게 붙여 사이드카 패턴을 표현",
    "connections_emphasis": "서비스 간 연결은 모두 사이드카를 거치게 하고 mTLS 암호화를 표시",
    "extras": "오른쪽 위에 컨트롤 플레인 노드(Istio / Linkerd)를 추가하고 제어 흐름은 점선으로 표시 가능",
    "use_case": "Istio / Linkerd / Consul / Cilium 서비스 메시 문서"
  }
}
```

적합: 서비스 메시 아키텍처, 제로 트러스트 네트워크, SRE 교육 자료.

## 변형 3: 멀티클라우드 연결 토폴로지(하이브리드 클라우드)

```json
{
  "modify": {
    "zones": "여러 클라우드를 가로로 나란한 큰 상자에 배치: 'AWS Region' + 'GCP Region' + 'On-Prem DC'",
    "interconnect": "클라우드 간을 'Direct Connect' / 'Cloud Interconnect' / 'VPN' 굵은 선으로 연결하고 대역폭 / SLA 라벨 표시",
    "extras": "캔버스 중앙에 Transit Gateway / 중앙 라우팅 허브 추가 가능",
    "use_case": "하이브리드 / 멀티클라우드 아키텍처, 재해 복구 토폴로지, 마이그레이션 계획"
  }
}
```

적합: 하이브리드 클라우드, 멀티클라우드 배포, 재해 복구 / DR 토폴로지.

## 피해야 할 사항

- 실제 제조사 아이콘 사용(상표 문제 위험)
- 장비 기호가 일관되지 않음(같은 유형 장비에 다른 형태 사용)
- 장비 기호에 이모지 사용
- 존에 점선 테두리가 없어 영역 구분이 사라짐
- 연결선에 프로토콜 / 대역폭이 표시되지 않아 엔지니어링 정보가 부족함
- 노드가 15개를 초과해 시각적으로 과밀함
- 3D / 그라데이션 / 유리 질감 사용(엔지니어링 분위기를 해침)
- 중앙 허브 앤 스포크 구조인데 중심 노드의 역할이 라벨링되지 않음
- 애플리케이션 계층 컴포넌트를 네트워크 토폴로지에 넣음(`system-architecture` 템플릿 사용)
- 편집 가능한 SVG로 내보낼 수 있다고 가장함
- IP / CIDR 정보 누락(클라우드 네트워크도의 핵심 정보)
