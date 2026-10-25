# 레트로 아카이브 / 에디토리얼 인포그래픽 포스터 템플릿

이 문서는 "역사적 인물 / 과학 개념 / 고전 이론을 1940년대 Bell Labs 기록물 / 오래된 신문 / 청사진 / 박물관 출판물 스타일로 표현"하는 레트로 인포그래픽 포스터를 만들 때 사용합니다.

대표적인 용도:

- 과학자 / 사상가 헌정 포스터(Shannon / Turing / Curie / 루쉰 등)
- 고전 이론 시각화(정보 이론 / 양자 역학 / 진화론)
- 강의 / 출판물 / 박물관 교육 포스터
- 지식 공유형 SNS / 소셜 피드 이미지
- 레트로 문화 상품 / 굿즈

기존 포스터 / 인포그래픽 템플릿과 다른 점:

| 템플릿 | 스타일 |
|---|---|
| `editorial-cover.md`(기존) | 현대 잡지 표지 |
| `infographics/legend-heavy-infographic.md`(기존) | 고밀도 과학 정보 이미지(현대적 또는 자연스러운 스타일) |
| `infographics/bento-grid-infographic.md`(기존) | 현대적인 벤토 그리드 모듈 |
| **이 템플릿**(신규) | **레트로 아카이브 / 청사진 / 오래된 신문 / 박물관 교육 포스터** |

**키워드**: 1940년대 스타일, 오래된 종이, 잉크 선화, 판화 초상, 남색 + 차콜, 치수 눈금, 수식, 아카이브 도장.

## 적용 범위

- 역사적 인물 + 사상 / 이론 헌정 포스터
- 레트로 청사진 / 오래된 신문 / 박물관 출판물 스타일 교육 이미지
- 수식 / 차트 / 타임라인을 포함한 과학 개념 시각화
- 문화 상품 / 교육 출판 / 학술 헌정물

## 사용 시점

- 사용자가 "레트로 인포그래픽 / 헌정 포스터 / 오래된 신문 스타일 / 청사진 스타일 / 박물관 포스터"를 언급할 때
- 포스터 주제가 역사적 인물 / 고전 이론일 때
- "높은 텍스트 밀도 + 레트로 질감"을 원할 때

다음에는 사용하지 마세요.

- 현대 평면 인포그래픽 → `infographics/legend-heavy-infographic.md` 사용
- 현대 벤토 그리드 → `infographics/bento-grid-infographic.md` 사용
- 일반 잡지 표지 → `editorial-cover.md` 사용
- 도교 / 신비주의 이미지 → 중국 고전 공필화 방식 사용(자연어로 작성하는 편을 권장하며 이 템플릿을 억지로 적용하지 않음)

## 누락 정보 확인 우선순위

1. 주제 인물 / 개념(Claude Shannon / Turing / 루쉰 등)
2. 핵심 이론 / 수식 / 모델(중앙 도식을 결정)
3. 시대와 아카이브 스타일(**1940년대 Bell Labs / 1900년대 신문 / 레트로 청사진 / 박물관 출판물 / 학술 필사본**)
4. 이론의 역사적 흐름을 보여 줄 타임라인이 필요한지 여부
5. 인물 초상화를 넣을지 여부(실제 얼굴이 허용되지 않으면 얼굴 가림 블록 / 판화 실루엣 사용)
6. 비율(**16:9 가로 전시 보드 / 3:4 세로 포스터**)
7. 기본 언어(영어 / 중국어 / 이중 언어)

## 기본 템플릿: 레트로 아카이브 인포그래픽 포스터(인물 + 모델 + 수식 + 타임라인)

📖 설명

넓은 포스터 안에 왼쪽 아카이브 사이드바 + 중앙 히어로 모델 + 오른쪽 수식 상자 + 중앙 아래 이론 구역 + 하단 타임라인을 둡니다. 인물 초상화와 여러 차트, 레트로 종이 질감을 포함합니다.

📝 프롬프트

```json
{
  "type": "레트로 에디토리얼 인포그래픽 포스터",
  "goal": "1940년대 출판물 스타일의 레트로 아카이브 교육 포스터를 생성합니다. 인물 / 이론 / 수식 / 응용 타임라인을 이미지 한 장에 밀도 있게 구성합니다.",
  "subject": "{argument name=\"subject\" default=\"Claude Shannon과 정보 이론\"}",
  "style": {
    "era": "{argument name=\"era\" default=\"1940년대 Bell Labs 아카이브 포스터\"}",
    "look": "{argument name=\"paper look\" default=\"오래된 크림색 종이, 청사진 제도 그리드, 가는 잉크 선화, 차분한 남색과 차콜 인쇄, 은은한 얼룩과 종이 마모, 신문 에디토리얼 디자인과 결합한 기술 일러스트\"}",
    "rendering": "판화풍 초상화, 과학 차트, 라벨이 붙은 패널, 손으로 그린 신호 그래픽이 있는 세밀한 도식 콜라주"
  },
  "poster": {
    "headline": "{argument name=\"headline\" default=\"Claude Shannon — 정보의 구조\"}",
    "subheadline": "{argument name=\"subheadline\" default=\"불확실성을 측정 가능하게 만들고, 통신을 공학으로 바꾼 과정.\"}",
    "topRightMeta": {
      "note": "{argument name=\"meta note\" default=\"개인 기록 제6713–2호\"}",
      "date": "{argument name=\"meta date\" default=\"1948년 5월\"}",
      "subject": "{argument name=\"meta subject\" default=\"통신의 수학적 이론\"}"
    }
  },
  "layout": {
    "sections": [
      {
        "title": "왼쪽 아카이브 사이드바",
        "position": "맨 왼쪽 세로 열",
        "count": 5,
        "labels": [
          "{argument name=\"sidebar 1\" default=\"BELL LABORATORIES MURRAY HILL, N.J.\"}",
          "{argument name=\"sidebar 2\" default=\"비가시적인 것을 공학으로 구현\"}",
          "{argument name=\"sidebar 3\" default=\"CLAUDE E. SHANNON 1916–2001\"}",
          "{argument name=\"sidebar 4\" default=\"정보 시대의 도구\"}",
          "{argument name=\"sidebar 5\" default=\"금속 활자 스타일 인용문 패널\"}"
        ]
      },
      {
        "title": "{argument name=\"model title\" default=\"통신 모델\"}",
        "position": "상단 중앙의 넓은 패널",
        "count": 5,
        "labels": ["1 정보원", "2 부호화기", "3 채널", "4 복호화기", "5 목적지"]
      },
      {
        "title": "{argument name=\"formula title\" default=\"엔트로피: 불확실성의 척도\"}",
        "position": "오른쪽 위 상자",
        "count": 4,
        "labels": [
          "{argument name=\"formula\" default=\"H(X) = −Σ p(x) log2 p(x)\"}",
          "확률 분포 p(x)",
          "더 균등할수록 → 불확실성이 최대에 가까움",
          "더 한쪽으로 치우칠수록 → 불확실성이 낮음"
        ]
      },
      {
        "title": "하단 이론 패널",
        "position": "중앙에서 하단으로 이어지는 띠",
        "count": 3,
        "labels": [
          "{argument name=\"theory A\" default=\"A 엔트로피 — 메시지를 알기 전의 불확실성\"}",
          "{argument name=\"theory B\" default=\"B 잡음 — 전송을 손상시키는 무작위성\"}",
          "{argument name=\"theory C\" default=\"C 중복성과 오류 정정 — 신호가 실패를 견디도록 더하는 구조\"}"
        ]
      },
      {
        "title": "{argument name=\"timeline title\" default=\"문명을 바꾼 이론\"}",
        "position": "하단 가로 타임라인",
        "count": 8,
        "labels": [
          "{argument name=\"era 1\" default=\"1840년대 전신\"}",
          "{argument name=\"era 2\" default=\"1876년 이후 전화망\"}",
          "{argument name=\"era 3\" default=\"1930~40년대 디지털 컴퓨터\"}",
          "{argument name=\"era 4\" default=\"1950~60년대 위성 통신\"}",
          "{argument name=\"era 5\" default=\"1970년대 인터넷 프로토콜\"}",
          "{argument name=\"era 6\" default=\"1980~90년대 데이터 압축\"}",
          "{argument name=\"era 7\" default=\"1990~2000년대 암호학\"}",
          "{argument name=\"era 8\" default=\"2010년대 이후 AI 및 정보 시스템\"}"
        ]
      }
    ],
    "centerpiece": "{argument name=\"centerpiece description\" default=\"통신 모델 뒤에 파랑과 회색 신호 잡음, 점, 선, 파형이 섞인 큰 추상 구름을 배치하고 화살표가 다섯 단계를 왼쪽에서 오른쪽으로 통과\"}"
  },
  "visualElements": {
    "portrait": {
      "subject": "{argument name=\"portrait subject\" default=\"Claude Shannon\"}",
      "placement": "왼쪽 중앙",
      "style": "{argument name=\"portrait style\" default=\"책상에 앉아 종이에 글을 쓰는 흑백 아카이브 초상. 얼굴은 옅은 사각형 가림 블록으로 의도적으로 가리고 정장과 넥타이 착용\"}"
    },
    "objectsLeft": [
      "{argument name=\"object 1\" default=\"책상 위의 다이얼 전화기\"}",
      "{argument name=\"object 2\" default=\"펼친 노트 또는 서류\"}",
      "{argument name=\"object 3\" default=\"초상 뒤의 CRT 화면과 다이얼이 있는 기술 콘솔\"}",
      "{argument name=\"object 4\" default=\"도구 아이콘 4개: 오실로스코프, 신호 측정기, 릴레이, 천공 테이프\"}"
    ],
    "centerModel": [
      "정보원 아래의 책과 기호",
      "부호화기 아래의 이진 숫자",
      "파형이 겹친 큰 잡음 채널 구름",
      "복호화기 아래의 이진 숫자와 해석",
      "목적지 아래의 전구 아이콘"
    ],
    "chartsAndDiagrams": [
      "엔트로피 확률 막대 차트",
      "엔트로피가 낮은 경우와 높은 경우를 비교한 미니 막대 차트 두 개",
      "트리 도식과 엔트로피 표기",
      "열 잡음 / 혼선 / 왜곡 라벨이 붙은 신호 왜곡 스케치",
      "원본 메시지에서 복구된 메시지까지의 오류 정정 이진 파이프라인"
    ],
    "bottomDecor": ["사인파, 디지털 신호, 잡음이 포함된 작은 파형 범례", "오른쪽 아래 아카이브 도장 또는 하단 표기"]
  },
  "color": {
    "background": "{argument name=\"paper color\" default=\"따뜻한 아이보리 종이\"}",
    "primaryInk": "{argument name=\"primary ink\" default=\"짙은 남색\"}",
    "secondaryInk": "{argument name=\"secondary ink\" default=\"차콜 그레이\"}",
    "accent": "{argument name=\"accent ink\" default=\"빛바랜 스틸 블루\"}"
  },
  "composition": "주석 상자가 밀도 높게 배치되고 테두리선이 가는 대칭형 와이드 포스터. 박물관 교육 인포그래픽 수준의 분위기",
  "textDensity": "정돈된 그리드 안에 작은 라벨, 수식, 캡션, 역사 메모가 많이 들어가는 매우 높은 정보 밀도",
  "aspectRatio": "{argument name=\"aspect ratio\" default=\"가로 16:9\"}",
  "constraints": {
    "must_keep": [
      "1940년대 인쇄 질감(오래된 종이 / 그리드 / 펜 선 / 잉크)",
      "수식 / 모델 / 타임라인 / 초상화 네 요소를 모두 포함하고 명확하게 읽을 수 있게 함",
      "전체 팔레트를 아이보리 + 기본 잉크색 하나 + 보조 잉크색 하나 + 강조색 하나로 제한",
      "실제 인물을 사용할 때는 얼굴 가림 블록 / 판화 실루엣 / 흐림 처리 적용"
    ],
    "avoid": [
      "현대 평면 아이콘 / 그라데이션 사용 → 레트로 질감이 즉시 무너짐",
      "수식을 틀리거나 생략(LaTeX 문자는 프롬프트에서 명확히 설명)",
      "타임라인이 8개 노드를 넘어 각 항목을 읽기 어려워짐",
      "초상화 영역이 지나치게 커져 정보 밀도를 무너뜨림(전체 면적의 25% 이하)",
      "네온 / 형광색 사용"
    ]
  }
}
```

### 매개변수 전략

- **반드시 질문**: subject, headline, 수식 / 모델 / 타임라인의 구체적인 내용
- **기본값 지정 가능**: 시대, 종이 질감, 초상화 스타일, 중앙 대표 이미지 설명
- **무작위 지정 가능**: 사이드바 5줄 문구, 하단 장식

### 자동 완성 전략

- 사용자가 주제 인물을 제시하면 핵심 모델 / 수식 / 타임라인을 자동으로 추론합니다.
- 초상화 처리를 지정하지 않으면 실제 얼굴 생성 실패를 방지하기 위해 가림 블록을 기본 사용합니다.
- 종이 / 잉크 색을 지정하지 않으면 아이보리 + 남색 + 차콜 + 스틸 블루 기본 팔레트를 사용합니다.

## 변형 1: 중국 학자 / 문인 헌정 버전(루쉰 / 첸쉐썬 / 선궈 등)

📝 프롬프트

```json
{
  "type": "레트로 에디토리얼 인포그래픽 포스터, 중국 학자 헌정 버전",
  "subject": "{argument name=\"chinese subject\" default=\"루쉰과 현대 백화문 운동\"}",
  "style_override": {
    "era": "1920년대 중국 신문화 운동기 출판물",
    "look": "오래된 황미색 선지와 목판 인쇄 효과, 붉은 인주 도장, 세로쓰기 번체 또는 간체 중국어와 영어 번역 주석 혼합",
    "ink": "먹색 + 주홍색 + 회청색"
  },
  "language_override": "중국어 중심 + 작은 영어 주석",
  "extra_elements": ["전통 인장", "세로쓰기 제목", "붓글씨 서명", "선장본 테두리 장식"]
}
```

### 이 변형을 선택할 때

- 중국 학자 / 문인 / 역사 인물
- 교육 / 출판 / 문화 헌정물
- "서양 아카이브 스타일"이 아닌 "동양 문인 스타일"을 원할 때

## 변형 2: 3:4 세로 고급 인쇄 포스터(인쇄 / 문화 상품 판매용)

📝 프롬프트

```json
{
  "type": "레트로 에디토리얼 인포그래픽 포스터, 세로 인쇄 버전",
  "aspectRatio_override": "3:4 세로 포스터",
  "layout_override": {
    "structure": "상단 히어로 초상화 + 중앙 이론 구역 + 하단 타임라인, 사이드바를 하단 띠로 이동",
    "headline_position": "맨 위에 큰 세리프체로 표시"
  },
  "use_case": "한정판 인쇄 포스터 / 문화 상품으로 사용"
}
```

### 이 변형을 선택할 때

- 문화 상품( A2 / A3 인쇄 포스터)
- 교육 기관 교실에 게시
- 벽에 걸 수 있는 완성품을 만들고 싶을 때

## 변형 3: 박물관 전시 패널(이중 언어, 교육용)

📝 프롬프트

```json
{
  "type": "박물관 전시 패널 인포그래픽",
  "language": "이중 언어(영어 + 기본 언어)",
  "extra_sections": ["감사의 말 / Acknowledgments", "더 읽을거리 / Further Reading", "QR 코드 상자(박물관 앱)"],
  "must_keep": ["모든 주석을 두 언어로 병기", "하단에 감사의 말 / 자료 출처 반드시 표시"]
}
```

### 이 변형을 선택할 때

- 실제 박물관 / 전시 출판물
- 교육 기관의 강의 전시 패널
- 학술 헌정 장면

## 피해야 할 사항

- ❌ 그라데이션 / 네온 / 현대 평면 아이콘 사용 → 레트로 분위기를 즉시 해침
- ❌ 인물을 지나치게 크게 그려 전체 면적의 50% 이상 차지 → 모델 / 수식 / 타임라인이 주이고 초상화는 보조여야 함
- ❌ 수식을 잘못 쓰거나 생략(핵심 이론은 읽을 수 있어야 함)
- ❌ 타임라인 노드가 10개 초과 → 읽기 어려우므로 6~8개로 제한
- ❌ 실제 사람 얼굴을 생성하도록 함 → 가림 블록 / 판화 / 흐림 처리 우선
- ❌ 글자 크기를 하나만 사용 → 레트로 포스터에는 위계 4~5단계 필요
- ❌ 현대 웹 글꼴 사용(세리프 / 금속 활자 / 판화체로 설명)
- ❌ 주제 인물 이름의 철자를 틀림(여러 번 나오는 이름은 프롬프트에 정확히 명시)
