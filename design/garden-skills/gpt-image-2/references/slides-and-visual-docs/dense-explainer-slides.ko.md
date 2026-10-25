# 고밀도 설명형 슬라이드 템플릿

이 문서는 "한 페이지에서 주제를 명확하게 설명하는" 고밀도 슬라이드 시각물을 만들 때 사용합니다. 다음에서 영감을 얻었습니다.

- 일본 가스미가세키 스타일 정부 슬라이드
- Irasutoya의 간결하고 따뜻한 일러스트
- 경영 컨설팅사의 원페이지 요약
- 학술 포스터 한 페이지 레이아웃

특징:

- 정보 밀도가 매우 높음
- 제목 영역 + 여러 문단 + 여러 도표를 포함
- 절제된 색상(주색 3가지 이하)
- 텍스트 + 아이콘 + 작은 일러스트 조합

## 적용 범위

- 단일 페이지 설명 슬라이드
- 공개 강의 / 교육 / 발표용 단일 페이지 자료
- 소셜 미디어 장문 이미지의 첫 페이지
- 기업 원페이지 솔루션 개요

## 사용 시점

- 사용자가 "설명 슬라이드 / 고밀도 페이지 / 한 장으로 설명 / 정책 스타일 / Irasutoya 스타일"을 언급할 때
- 많은 텍스트와 일러스트를 함께 넣고 싶어 할 때
- 이미지 한 장으로 정보를 전달하고 싶을 때

다음에는 사용하지 마세요.

- 정책 공고 스타일을 원하는 경우(`policy-style-slide.md` 사용)
- 비즈니스 보고서를 원하는 경우(`visual-report-page.md` 사용)
- 교육용 도식 이미지를 원하는 경우(`educational-diagram-slide.md` 사용)

## 누락 정보 확인 우선순위

1. 주제
2. 스타일 방향: 따뜻한 일러스트 / 정부식 엄격함 / 학술 / 컨설팅
3. 정보 밀도(중간 / 높음 / 매우 높음)
4. 섹션 수(3~6개)
5. 영어 / 일본어 / 이중 언어가 필요한지 여부
6. 중앙 대표 이미지가 필요한지 여부

## 기본 템플릿: Irasutoya × 가스미가세키 스타일 혼합 슬라이드

📖 설명

한 페이지 슬라이드에 메인 제목 + 부제 + 여러 섹션 + 간결한 일러스트 + 필요한 도식을 담습니다.

📝 프롬프트

```json
{
  "type": "고밀도 설명형 슬라이드",
  "goal": "설명 강의 자료 / 공식 계정 장문 이미지 첫 장 / 교육용 단일 페이지로 쓸 수 있는 고밀도 슬라이드 생성",
  "style": {
    "format": "{argument name=\"format\" default=\"ponchi-e diagram\"}",
    "blend": "Irasutoya의 부드럽고 따뜻한 일러스트 + 가스미가세키 스타일 슬라이드의 높은 정보 밀도",
    "color_palette": "{argument name=\"color palette\" default=\"미색 바탕 + 주홍색 + 짙은 회색\"}"
  },
  "title_section": {
    "main_title": "{argument name=\"main title\" default=\"모모타로 이야기 전체 해설\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"이야기 한 편을 이미지 한 장으로 이해하기\"}",
    "language": "{argument name=\"language\" default=\"일본어\"}"
  },
  "centerpiece": {
    "enabled": "{argument name=\"centerpiece enabled\" default=\"true\"}",
    "description": "{argument name=\"centerpiece description\" default=\"화면 중앙에서 약간 위에 복숭아를 탄 모모타로를 두고 개, 원숭이, 꿩이 둘러쌈\"}"
  },
  "sections": {
    "count": "{argument name=\"section count\" default=\"5\"}",
    "items": [
      "{argument name=\"section 1\" default=\"탄생: 복숭아에서 태어남\"}",
      "{argument name=\"section 2\" default=\"성장: 용감하고 다정한 소년\"}",
      "{argument name=\"section 3\" default=\"출발: 도깨비 섬으로 향함\"}",
      "{argument name=\"section 4\" default=\"동료: 개 / 원숭이 / 꿩\"}",
      "{argument name=\"section 5\" default=\"승리: 도깨비를 물리치고 귀향\"}"
    ],
    "section_block_style": "각 섹션은 작은 일러스트 + 제목 + 설명 2~3문장으로 구성"
  },
  "annotations": {
    "style": "가는 연결선 + 작은 라벨",
    "rule": "주석선은 중앙 대상을 가로지르지 않음"
  },
  "footer": {
    "summary": "{argument name=\"summary\" default=\"다정함 + 용기 + 동료애가 이 이야기의 핵심\"}"
  },
  "constraints": {
    "must_keep": [
      "정보 밀도가 높으면서 읽기 순서가 분명함",
      "중앙 대상을 시각적 기준점으로 유지",
      "일러스트 스타일과 텍스트 스타일이 어울림",
      "색상 팔레트는 3가지 이하"
    ],
    "avoid": [
      "문단마다 글자 크기가 제각각임",
      "일러스트가 지나치게 정교해 전체 통일감을 해침",
      "여백 없이 글자가 가장자리까지 채워짐",
      "어색하게 영어가 섞임"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 주제, 섹션 수
- 기본값 지정 가능: 색상 팔레트, 부제, 하단 요약 문장
- 무작위 지정 가능: 섹션별 일러스트의 세부 형태

### 자동 완성 전략

- 사용자가 주제를 제시하면 섹션을 자동 분할합니다(4~6개 권장).
- 기본 스타일은 Irasutoya × 가스미가세키 혼합입니다.
- 주제에 맞춰 중앙 대표 이미지를 자동 선택합니다.

## 변형 1: 경영 컨설팅 원페이지

📝 프롬프트

```json
{
  "type": "경영 컨설팅 원페이지 슬라이드",
  "style": {
    "color_palette": "짙은 파랑 + 회색 + 흰색",
    "blend": "현대 컨설팅 회사 스타일 + 미니멀 아이콘"
  },
  "title_section": {
    "main_title": "{argument name=\"main title\" default=\"AI 시대의 제품 전략\"}",
    "subtitle": "전략적 사고를 한 페이지로 설명"
  },
  "sections": {
    "count": 4,
    "items": ["현황 진단", "핵심 기회", "전략 경로", "주요 이정표"]
  },
  "constraints": {
    "must_feel": "이성적이고 절제되며 신뢰할 수 있음"
  }
}
```

## 변형 2: 학술 포스터 한 페이지

📝 프롬프트

```json
{
  "type": "학술 포스터 한 페이지 슬라이드",
  "style": {
    "color_palette": "학술 블루 + 베이지 + 검정",
    "blend": "학술 포스터 + 논문 스타일 레이아웃"
  },
  "title_section": {
    "main_title": "{argument name=\"paper title\" default=\"다중 모달 신호 기반 이미지 품질 평가 방법\"}",
    "subtitle": "한 페이지 요약 그림"
  },
  "sections": {
    "items": ["연구 문제", "방법 개요", "실험 결과", "결론 및 향후 연구"]
  },
  "constraints": {
    "must_feel": "학술적이고 엄밀하며 투고 가능한 수준"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "고밀도 설명 슬라이드 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "사용자가 주제만 제시하면 스타일, 섹션, 색상 팔레트, 중앙 대상을 자동 선택",
  "constraints": {
    "must_feel": "출판물 수준"
  }
}
```

## 피해야 할 사항

- 본문 글자 크기가 제목보다 커지지 않게 합니다.
- 한 페이지 섹션 수를 6개 넘게 만들지 않습니다.
- 중앙 대표 이미지가 너무 커서 다른 문단을 덮지 않게 합니다.
- 주 스타일과 다른 출처의 일러스트를 섞지 않습니다.
- 한 페이지에 중국어 + 영어 + 일본어를 모두 섞지 않습니다.
