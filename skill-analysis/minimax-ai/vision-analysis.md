# vision-analysis 분석

## 원본

- 경로: `.agents/skills/vision-analysis/SKILL.md`
- 성격: MiniMax vision MCP 도구로 이미지 분석, OCR, UI 리뷰, 차트 데이터 추출을 수행하는 스킬
- 주요 도구: `MiniMax_understand_image` MCP tool

## 적용 조건

사용자 메시지에 `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.bmp`, `.svg` 경로/URL이 있거나, 이미지/스크린샷/다이어그램/차트/목업/사진을 분석, 설명, OCR, 리뷰, 해석해 달라고 할 때 사용한다.

## 동작 과정

1. 이미지 경로 또는 URL을 자동 감지한다.
   메시지에서 이미지 확장자를 가진 local path 또는 URL을 추출한다.

2. 분석 mode를 선택한다.
   일반 설명은 `describe`, 텍스트 추출은 `ocr`, UI 목업은 `ui-review`, 차트는 `chart-data`, 객체/활동 식별은 `object-detect`를 사용한다.

3. MiniMax MCP 도구를 호출한다.
   mode별 prompt를 만들어 `MiniMax_understand_image`에 전달한다.

4. 결과를 mode에 맞춰 표시한다.
   설명은 prose, OCR은 원문 구조 보존, UI review는 Strengths/Issues/Suggestions 구조, chart는 data point와 trend 중심으로 출력한다.

5. MCP가 없으면 설정을 안내한다.
   MiniMax Token Plan MCP guide를 확인하고, OpenCode/Claude Code/Cursor 환경별 설정 예시를 제공한다. 설정 후 앱 재시작과 `/mcp` 확인을 안내한다.

## 핵심 규칙

- MiniMax Token Plan subscription과 `MINIMAX_API_KEY`가 필요하다.
- 무료/다른 tier API key로는 `understand_image` 도구를 사용할 수 없다고 안내해야 한다.
- OCR은 보이는 텍스트를 구조와 함께 verbatim으로 보존한다.
- UI review는 강점, 문제, 구체적 개선안으로 나눈다.
- chart-data는 제목, 축 라벨, series/data point, trend를 추출한다.

## 산출물 특성

결과물은 이미지 내용 설명, OCR 텍스트, UI 디자인 리뷰, 차트 데이터 추출, 객체 목록 중 요청 목적에 맞는 구조화된 분석이다.

## 주의점

이 스킬은 실제 MiniMax MCP tool이 구성되어 있어야 완전하게 작동한다. 현재 환경에 해당 MCP 도구가 없으면 분석 대신 설정 안내가 우선이다.
