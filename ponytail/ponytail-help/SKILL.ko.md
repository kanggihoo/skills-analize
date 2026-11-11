---
name: ponytail-help
description: >
  ponytail의 레벨, 스킬, 명령어를 빠르게 보는 참고 카드. 한 번 실행하는 표시 명령입니다. /ponytail-help, "ponytail help", "how do I use ponytail"에 씁니다.
---

> 원본: `SKILL.md`. 프런트매터 키와 트리거 문구, 명령어, 코드 블록은 원문 그대로 둡니다.

# Ponytail Help

호출되면 이 참고 카드를 보여 줍니다. 한 번 실행하는 명령이므로 모드를 바꾸거나, 플래그 파일을 쓰거나, 아무것도 저장하지 않습니다.

## 레벨

| 레벨 | 트리거 | 바뀌는 것 |
|-------|---------|-------------|
| **Lite** | `/ponytail lite` | 요청된 것만 만들고, 더 작은 선택지를 한 줄로 알려 줍니다. |
| **Full** | `/ponytail` | 가장 작은 완전한 변경, 로직이 필요로 할 때의 검증, 건너뛴 것과 위험을 밝히는 답변. 기본값입니다. |
| **Ultra** | `/ponytail ultra` | 요청 자체도 따지고, 만들기 전에 반론을 제기합니다. |

레벨은 바꾸거나 세션이 끝날 때까지 유지됩니다.

## 스킬

| 스킬 | 트리거 | 하는 일 |
|-------|---------|--------------|
| **ponytail** | `/ponytail` | 게으른 모드 자체: 새 코드를 가장 적게 쓰고, 건너뛴 작업과 위험을 명확하게 밝히는 답변. |
| **ponytail-review** | `/ponytail-review` | diff의 품질 리뷰: 버그, 보안, 부하, 테스트 누락, 속도, 잘라낼 부분. 각 발견 사항은 무엇이 잘못되는지와 고치는 방법을 말합니다. |
| **ponytail-audit** | `/ponytail-audit` | 같은 품질 리뷰를 저장소 전체에 적용하고, 순위를 매깁니다. |
| **ponytail-debt** | `/ponytail-debt` | `shortcut:` 주석을 추적 가능한 장부로 모읍니다. |
| **ponytail-gain** | `/ponytail-gain` | 측정된 효과의 점수표: 코드 감소, 비용 감소, 속도 향상. |
| **ponytail-help** | `/ponytail-help` | 이 카드. |

Codex CLI와 IDE 확장에서는 `$ponytail:ponytail`, `$ponytail:ponytail-review`, `$ponytail:ponytail-help`로 스킬을 호출합니다. Claude Code와 OpenCode에서는 위의 슬래시 명령 형식을 씁니다(OpenCode는 여섯 개를 모두 슬래시 명령으로 제공합니다).

## 비활성화

"stop ponytail" 또는 "normal mode"라고 말합니다. `/ponytail`로 언제든 다시 켤 수 있습니다. `/ponytail off`도 동작합니다.

## 밴드(Claude Code)

`/ponytail band`는 프롬프트 위의 band를 숨기고, 같은 명령으로 다시 보이게 합니다. `/ponytail band on`과 `/ponytail band off`는 직접 설정합니다. 레벨은 그대로 유지됩니다. `/ponytail band import`는 지난 Claude Code 세션의 비용, 에이전트 시간, 토큰을 보드에 더합니다.

## 기본 모드 설정

기본 모드는 `full`이며, 모든 세션에서 자동으로 켜집니다. 바꾸는 방법은 다음과 같습니다.

**환경 변수**(우선순위 가장 높음):
```bash
export PONYTAIL_DEFAULT_MODE=ultra
```

**설정 파일**(`~/.config/ponytail/config.json`, Windows에서는 `%APPDATA%\ponytail\config.json`):
```json
{ "defaultMode": "lite" }
```

세션 시작 시 자동 활성화를 끄려면 `"off"`로 설정합니다. 그러면 원할 때 `/ponytail`로 직접 켭니다.

우선순위: 환경 변수 > 설정 파일 > `full`.

## 업데이트

한 번만 자동 업데이트를 켭니다. `/plugin`을 열고, Marketplaces로 가서 ponytail을 고른 뒤 Enable auto-update를 선택합니다. 그러면 Claude Code가 시작할 때 새 버전을 받아 옵니다(알림이 뜨면 `/reload-plugins`를 실행합니다). 수동으로 갱신하려면 `/plugin marketplace update ponytail`을 실행한 뒤 `/reload-plugins`를 실행합니다.

`/plugin`을 인식하지 못하면 Claude Code 버전이 낡은 것입니다. `npm install -g @anthropic-ai/claude-code@latest` 또는 `brew upgrade claude-code`로 업데이트하고 다시 시작합니다. 다른 호스트는 각자의 업데이트 절차를 따릅니다.

## 더 보기

전체 문서와 예시: https://github.com/DietrichGebert/ponytail
