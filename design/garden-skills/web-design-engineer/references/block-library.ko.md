# 블록 라이브러리 구현

새로운 구현을 고안하기 전에 이 색인을 사용하여 기존 작업 패턴에 도달하세요. 구현은 현재 `advanced-patterns.md`에 있습니다. 대상 섹션만 로드합니다.

| 필요 | 구현된 블록 | 소스 섹션 |
|---|---|---|
| 고정된 16:9 프레젠테이션 | 반응형 슬라이드 엔진 | `advanced-patterns.md#responsive-slide-engine` |
| 전화 또는 브라우저 프레이밍 | 장치 시뮬레이션 프레임 | `advanced-patterns.md#device-simulation-frames` |
| 실시간 시각적 제어 | 조정 패널 | `advanced-patterns.md#tweaks-panel-implementation` |
| 타임라인 기반 모션 | 애니메이션 타임라인 엔진 | `advanced-patterns.md#animation-timeline-engine` |
| 병렬 옵션 검토 | 디자인 캔버스 | `advanced-patterns.md#design-canvas` |
| 테마 전환 | 다크 모드 토글 | `advanced-patterns.md#dark-mode-toggle` |
| 차트 및 분석 보기 | 데이터 시각화 템플릿 | `advanced-patterns.md#data-visualization-templates` |

## 재사용 계약블록을 복사하기 전에:

1. 아티팩트, 스택 및 보정된 다이얼과 일치하는지 확인합니다.
2. 접근성과 반응성 동작을 유지합니다.
3. 선언된 디자인 시스템에 토큰을 적용합니다.
4. 요청을 처리하지 않는 기능을 제거합니다.
5. 무엇이든 가져오기 전에 종속성 가용성을 확인하세요.

## 새 블록 추가

실제 작업을 해결한 후에만 재사용 가능한 블록을 추가하세요. 문서:

- 언제 사용하고 언제 사용하지 않는가?
- 시각적 구조 및 소품/데이터 계약
- 최소한의 작업 구현
- 모바일/고정 캔버스 동작;
- 관련된 경우 상호작용 및 모션 변형;
- 움직임 감소 및 접근성 동작;
- 관련된 경우 어두운/밝은 테마 노트
- 일반적인 고장 및 수리.

코드가 없는 이름 카탈로그보다 하나의 구현된 블록을 선호합니다.