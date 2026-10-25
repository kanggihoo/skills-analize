# 포즈 / 동작 참고표 N×N 템플릿

이 문서는 "한 인물 / 캐릭터가 N×N 그리드 안에서 서로 다른 자세 / 동작 / 전투 / 춤 포즈를 취하는" 순수 포즈 참고표 또는 동작 사전을 만들 때 사용합니다.

대표적인 용도:

- 춤 / 힙합 / 전투 동작 안무 참고
- 캐릭터 애니메이터 / 만화가용 포즈 빠른 참고표
- 피트니스 / 요가 / 무술 동작 사전
- 패션 촬영 포즈 아이디어 모음
- 게임 캐릭터 동작 참고표
- AI 동영상 및 후속 생성에 사용할 포즈 제어 참고 자료

기존 인물 템플릿과 다른 점:

| 템플릿 | 초점 |
|---|---|
| `character-sheet.md`(기존) | 캐릭터 하나의 "전체 설정"(삼면도 + 표정 + 의상 + 액세서리) |
| `avatars-and-profile/character-grid-portrait.md`(기존) | n×n 캐릭터 그리드(직업 / 왕조별 초상화) |
| **이 템플릿**(신규) | **같은 캐릭터의 서로 다른 포즈 / 동작 / 춤 자세로만 구성된 동작 사전** |

**핵심 차이**: 이 템플릿에서는 의상, 캐릭터, 스타일을 바꾸지 않고 자세만 바꿉니다. 각 칸의 차이는 전적으로 몸짓과 자세에서 나와야 합니다.

## 적용 범위

- 4×4 / 4×5 / 5×5 포즈 빠른 참고표
- 춤 / 전투 / 피트니스 / 패션 포즈 사전
- 애니메이터 / 만화가 / 코치 참고 자료
- AI 포즈 제어 데이터 세트의 소스 이미지

## 사용 시점

- 사용자가 "포즈 참고 / pose sheet / 동작 참고표 / 안무 / 피트니스 / 전투 동작"을 언급할 때
- 한 캐릭터의 서로 다른 포즈 N개가 필요할 때
- 교육 / 참고 / 후속 생성 입력 자료로 사용할 때

다음에는 사용하지 마세요.

- 캐릭터 전체 설정(삼면도 + 표정 + 의상) → `character-sheet.md` 사용
- 여러 직업 / 왕조별 초상화 → `avatars-and-profile/character-grid-portrait.md` 사용
- 만화 콘티 / 이야기 → `storyboards-and-sequences/four-panel-comic.md` 사용
- 실제 제품 / 상업 광고가 포함된 사진 콘티 → `storyboards-and-sequences/product-tvc-storyboard.md` 사용

## 누락 정보 확인 우선순위

1. 포즈 수(기본값 16, 흔히 9 / 12 / 16 / 20 / 25)
2. 캐릭터의 성별 + 체형 + 헤어스타일 + 의상(**고정 필수, 모든 패널에서 동일하게 사용**)
3. 렌더링 스타일(**실사 사진 / 회색조 3D 조형 / 애니메이션 선화 / 미니멀 평면**)
4. 포즈 주제(**힙합 / 전투 / 패션 / 요가 / 피트니스 / 일반 동작**)
5. 각 칸에 번호 / 라벨 / 방향 화살표를 표시할지 여부
6. 배경(기본값은 이음새 없는 흰색) + 조명(기본값은 부드러운 스튜디오 조명)
7. 비율(기본값 1:1 콘택트 시트 / 16:9 가로형)

## 기본 템플릿: 4×4 = 16칸 포즈 참고표(실사 사진 스타일)

📖 설명

깔끔한 스튜디오 콘택트 시트입니다. 배경 없이 전신을 프레임 안에 담고, 각 칸의 포즈는 독립적이면서 캐릭터 / 의상 / 카메라 거리는 엄격하게 동일합니다.

📝 프롬프트

```json
{
  "type": "포즈 참고 시트",
  "goal": "안무 / 애니메이션 / 피트니스 / AI 포즈 제어의 참고 자료로 쓸 수 있도록 동일 캐릭터의 서로 다른 포즈를 모은 동작 참고표를 생성",
  "subject": {
    "theme": "{argument name=\"pose theme\" default=\"힙합 춤과 전투에 대비하는 동작 차트\"}",
    "character": {
      "count": 1,
      "gender_presentation": "{argument name=\"gender\" default=\"여성\"}",
      "age_appearance": "{argument name=\"age\" default=\"젊은 성인\"}",
      "body_type": "{argument name=\"body type\" default=\"탄탄한 체형의 운동선수형 댄서\"}",
      "skin_tone": "{argument name=\"skin tone\" default=\"밝은 태닝 피부\"}",
      "hair": {
        "color": "{argument name=\"hair color\" default=\"검정\"}",
        "style": "{argument name=\"hair style\" default=\"잔머리가 자연스럽게 빠져나온 높은 포니테일\"}"
      },
      "outfit": {
        "count": 5,
        "items": [
          "{argument name=\"outfit top\" default=\"흰색 스포츠 브라 또는 크롭 운동 상의\"}",
          "{argument name=\"outfit bottom\" default=\"헐렁한 보라색 조거 팬츠\"}",
          "{argument name=\"outfit shoes\" default=\"두툼한 흰색 운동화\"}",
          "{argument name=\"outfit accessory 1\" default=\"양팔에 보라색 손목 밴드 또는 팔 밴드\"}",
          "{argument name=\"outfit accessory 2\" default=\"작은 링 귀걸이\"}"
        ]
      }
    }
  },
  "style": {
    "image_type": "{argument name=\"render style\" default=\"실사 스튜디오 포즈 시트\"}",
    "lighting": "{argument name=\"lighting\" default=\"깨끗하고 균일한 스튜디오 조명\"}",
    "background": "{argument name=\"background\" default=\"밝은 회색에서 흰색으로 이어지는 단순하고 이음새 없는 배경\"}",
    "camera": "{argument name=\"camera\" default=\"전신 구도, 정면 시점, 일정한 촬영 거리\"}",
    "rendering": "{argument name=\"rendering\" default=\"해부학적으로 정확하고 선명한 표현, 역동적인 움직임, 발 아래에 약한 그림자\"}",
    "face": "{argument name=\"face treatment\" default=\"의도적으로 흐리게 하거나 가림\"}"
  },
  "layout": {
    "grid": {
      "rows": "{argument name=\"rows\" default=\"4\"}",
      "columns": "{argument name=\"columns\" default=\"4\"}",
      "count": "{argument name=\"panel count\" default=\"16\"}"
    },
    "numbering": {
      "count": "{argument name=\"panel count\" default=\"16\"}",
      "labels": ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16"],
      "position": "각 칸의 왼쪽 위 모서리"
    },
    "cell_borders": "모든 패널 사이에 가는 검은색 구분선",
    "aspect_ratio": "{argument name=\"aspect ratio\" default=\"1:1\"}"
  },
  "poses": {
    "count": 16,
    "items": [
      { "label": "1", "description": "{argument name=\"pose 1\" default=\"무릎을 바깥으로 굽힌 낮고 넓은 스쿼트, 몸통은 약간 왼쪽으로 기울이고 양팔을 느슨하게 뻗은 방어적인 춤 자세\"}" },
      { "label": "2", "description": "{argument name=\"pose 2\" default=\"왼쪽으로 깊게 사이드 런지, 왼팔은 곧게 왼쪽을 가리키고 오른손은 머리 근처에 둔 역동적이고 방향성 있는 포즈\"}" },
      { "label": "3", "description": "{argument name=\"pose 3\" default=\"한 손으로 바닥을 짚는 낮은 웅크림, 한쪽 무릎은 몸 아래로 접고 반대쪽 팔은 수평으로 뻗음\"}" },
      { "label": "4", "description": "{argument name=\"pose 4\" default=\"한쪽 다리로 똑바로 균형을 잡고 왼쪽 무릎을 높이 들며 리듬과 균형을 위해 양팔을 바깥으로 펼침\"}" },
      { "label": "5", "description": "{argument name=\"pose 5\" default=\"한쪽 다리를 들고 다른 다리로 지지하는 비슷한 균형 자세, 팔을 바깥으로 뻗은 보다 가벼운 춤 동작\"}" },
      { "label": "6", "description": "{argument name=\"pose 6\" default=\"매우 넓고 낮게 앉은 스쿼트, 몸통을 앞으로 기울이고 한 손은 다리 사이 바닥을 향해 뻗으며 다른 팔은 뒤로 뻗음\"}" },
      { "label": "7", "description": "{argument name=\"pose 7\" default=\"가슴을 위로 들고 엉덩이를 앞으로 내민 극적인 선 자세의 등 젖히기, 양팔은 뒤와 옆으로 펼침\"}" },
      { "label": "8", "description": "{argument name=\"pose 8\" default=\"작게 점프하거나 공중에서 스쿼트 자세를 취함, 두 발이 바닥에서 떨어지고 무릎을 굽힌 채 양팔을 대칭으로 넓게 펼침\"}" },
      { "label": "9", "description": "{argument name=\"pose 9\" default=\"바닥에 기대 앉은 자세, 한 손은 뒤쪽 바닥을 짚고 한 팔은 대각선 위로 뻗으며 다리는 한쪽으로 굽힘\"}" },
      { "label": "10", "description": "{argument name=\"pose 10\" default=\"정면을 향해 균형을 잡고 한쪽 무릎을 엉덩이 높이로 듦. 한 팔은 방어 자세로 굽히고 다른 팔은 옆으로 뻗음\"}" },
      { "label": "11", "description": "{argument name=\"pose 11\" default=\"발을 넓게 벌리고 무릎을 굽힌 깊은 측면 자세, 전투 준비 자세처럼 어깨 근처에 손바닥을 펴서 올림\"}" },
      { "label": "12", "description": "{argument name=\"pose 12\" default=\"낮게 옆으로 벌린 런지, 한 손은 바닥을 짚고 다른 팔은 수직 위로 뻗으며 몸통은 위로 젖힘\"}" },
      { "label": "13", "description": "{argument name=\"pose 13\" default=\"무릎을 편하게 약간 굽히고 가슴을 편 채 서서 뒤로 기대며, 리듬을 타듯 양팔을 느슨하게 뒤로 늘어뜨림\"}" },
      { "label": "14", "description": "{argument name=\"pose 14\" default=\"몸을 비틀어 낮게 웅크린 자세, 굽힌 다리에 체중을 낮게 싣고 몸통을 회전하며 한 팔은 안으로 당기고 다른 팔은 바깥으로 뻗음\"}" },
      { "label": "15", "description": "{argument name=\"pose 15\" default=\"옆으로 매우 넓게 벌린 스트레칭 런지, 한 손은 앞쪽 발 가까이 바닥에 대고 반대 팔은 대각선 위로 뻗음\"}" },
      { "label": "16", "description": "{argument name=\"pose 16\" default=\"한쪽 무릎을 높이 들어 올린 자세, 한 손은 머리 뒤에 두고 다른 팔은 앞으로 뻗은 자신감 있는 마무리 포즈\"}" }
    ]
  },
  "composition": "16개 패널 모두 동일 인물, 동일 의상, 동일 배율을 사용하고 프레임 중앙에 배치합니다. 동작 라이브러리 또는 안무 참고 차트처럼 구성합니다.",
  "constraints": {
    "must_keep": [
      "16개 패널의 캐릭터가 완전히 동일(얼굴 / 체형 / 머리 모양 / 의상 / 신발)",
      "모든 칸에 전신이 들어오고 카메라 거리가 일정",
      "모든 포즈를 알아볼 수 있고 서로 분명히 다르게 표현",
      "각 칸 왼쪽 위의 번호 1~16을 선명하게 표시",
      "신체 비율이 정확하고 팔다리가 뒤틀리지 않음"
    ],
    "avoid": [
      "16개 포즈가 모두 서 있는 자세 → 스쿼트 / 런지 / 바닥 동작 / 점프 / 아라베스크 등을 혼합",
      "패널마다 의상 / 액세서리가 달라짐",
      "전신 구도에서 머리나 발이 잘림",
      "팔다리 왜곡 / 손이나 발이 여러 개로 나타남",
      "얼굴 표정이 지나치게 눈에 띔(표정이 아니라 포즈를 봐야 함)"
    ]
  }
}
```

### 매개변수 전략

- **반드시 질문**: 포즈 수, 캐릭터 설명(성별 + 체형 + 헤어스타일 + 의상), 렌더링 스타일
- **기본값 지정 가능**: 포즈 1~16의 구체적인 설명(주제에 맞는 다양한 자세로 자동 생성)
- **무작위 지정 가능**: 얼굴 처리 방식, 그림자 방향

### 자동 완성 전략

- 사용자가 "춤 포즈 16칸"만 요청하면 템플릿 기본 16개 조합을 사용합니다(스쿼트 / 런지 / 바닥 동작 / 균형 / 점프 / 백벤드 혼합).
- 사용자가 주제(힙합 / 전투 / 패션)를 주면 포즈 설명 스타일을 자동 조정합니다.
- 참고 인물을 제공하면 캐릭터 항목을 모두 참고 이미지의 세부 사항으로 채웁니다.

## 변형 1: 방향 화살표가 있는 4×4 회색조 3D 조형 스타일

한국 무용 안무 / 전투 동작 교육에 적합하며 Case 130 스타일에서 파생되었습니다.

📝 프롬프트

```text
[STYLE]
단색 회색조 일러스트, 3D 렌더 캐릭터, 깔끔한 교육용 참고 시트,
흰색 배경, 만화풍 셀 그리드 레이아웃, 기술 도면 미학

[LAYOUT]
총 16개 패널의 4x4 그리드, 각 패널은 가는 검은색 테두리로 구분,
1부터 16까지 번호가 매겨진 셀, 패널 크기 통일

[CHARACTER]
{argument name="character" default="운동선수 체형의 젊은 여성 댄서, 포니테일, 크롭 상의와 헐렁한 바지, 운동화"}, 모든 패널에서 동일한 캐릭터

[PANEL STRUCTURE - per cell]
왼쪽 위: 굵은 번호 배지 + {argument name="title" default="한국어 제목 텍스트"}
중앙: 전신 캐릭터 포즈 일러스트
왼쪽 아래: {argument name="description" default="한국어 설명(3~4줄)"}
오버레이: 움직임 방향을 나타내는 화살표

[ARROWS / MOTION INDICATORS]
곡선 화살표, 직선 화살표, 원형 회전 표시,
동작의 흐름과 방향을 보여 주도록 캐릭터 주위에 배치

[RENDERING STYLE]
세부 묘사가 높은 3D 조형 스타일, 부드러운 스튜디오 조명, 은은한 그림자,
색상 없이 회색조 명암, 깔끔한 선화, 게임 콘셉트 아트 수준

[NEGATIVE]
배경 풍경 없음, 색상 없음, 추가 캐릭터 없음,
복잡한 배경 없음
```

### 이 변형을 선택할 때

- "교육 매뉴얼" 같은 느낌을 원할 때
- 명확한 방향 화살표가 필요할 때
- 회색조 3D 조형 느낌을 원할 때(실사 사진 아님)

## 변형 2: 5×5 = 25칸 대형 동작 사전

📝 프롬프트

```json
{
  "type": "확장형 25패널 포즈 참고 시트",
  "layout": { "rows": 5, "columns": 5, "count": 25 },
  "must_keep": ["각 칸의 세부 묘사는 작아지더라도 포즈를 알아볼 수 있어야 함", "콘택트 시트 / 16:10 가로 화면에 적합"],
  "use_case": "애니메이터 / 안무가 / 포즈 AI 데이터 세트"
}
```

### 이 변형을 선택할 때

- 더 많은 포즈 샘플이 필요할 때
- 각 칸의 세부 묘사가 줄어드는 것을 감수할 수 있을 때
- 데이터 세트 / 라이브러리로 사용할 때

## 변형 3: 3×3 = 9칸 고정밀 대표 포즈 모음

각 칸의 세부 묘사를 더 높일 수 있습니다.

📝 프롬프트

```json
{
  "type": "9패널 대표 포즈 모음",
  "layout": { "rows": 3, "columns": 3, "count": 9 },
  "rendering_quality_per_panel": "패널 수가 적으므로 세부 묘사 강화",
  "use_case": "패션 사진 포즈 아이디어 / 모델 참고 / 포스터 대표 포즈 라이브러리"
}
```

### 이 변형을 선택할 때

- 패션 / 모델 촬영 포즈 아이디어로 사용할 때
- 각 칸의 완성도를 높이고 싶을 때
- 포즈 수가 많을 필요가 없을 때

## 피해야 할 사항

- ❌ 16개 패널에서 캐릭터 의상이 달라짐 → 치명적인 오류
- ❌ 포즈 16개가 모두 서 있거나 모두 스쿼트 → 동작의 다양성이 부족함
- ❌ 번호가 빠지거나 순서가 뒤섞임
- ❌ 전신 구도에서 신체 일부(머리 / 발)가 잘림
- ❌ 손 / 발이 여러 개로 나타나거나 관절이 뒤틀림
- ❌ 사실적인 포즈 참고표에 추상 배경을 추가함(매끄러운 단색 배경 유지)
- ❌ 얼굴 표정이 지나치게 눈에 띔(흐린 얼굴 / 중립적 얼굴 처리 권장)
- ❌ 기본 "힙합" 포즈 조합을 "요가" 주제에 그대로 사용(포즈 1~16 설명을 교체해야 함)
- ❌ 모델이 포즈 N개를 자유롭게 생성하게 둠(각 칸의 포즈 설명을 명시해야 함)
