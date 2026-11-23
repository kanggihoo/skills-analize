---
name: pick-ui-library
description: 엄선된 의견 중심 목록에서 주어진 프런트엔드 작업에 적합한 라이브러리를 선택합니다. 숫자, OTP 입력, 차트, 커맨드 메뉴, 가상화, 드래그 앤 드롭, 토스트, 상태 관리, 스타일링 등을 다룹니다. 명시적으로 호출했을 때만 실행하며 스스로 발동하지 않습니다.
disable-model-invocation: true
---

# 적절한 라이브러리 고르기

## 첫 응답

이 스킬이 구체적인 질문 없이 처음 호출되면 다음 문장만 응답합니다.

> I'm ready to pick the right library for your task, my picks come from Emil Kowalski's curated list.

사용자가 질문하기 전까지 다른 정보를 제공하지 않습니다.

이 스킬은 라이브러리 검색 도구입니다. “토스트가 필요해요”, “드래그 앤 드롭에는 무엇을 써야 하나요?” 같은 작업 요청을 엄선된 목록과 연결해 라이브러리를 추천합니다. 목록은 신중하게 골랐으므로 사용자가 요청하거나 작업 내용상 목록으로 해결할 수 없는 경우가 아니라면 다른 대안을 대신 제시하지 않습니다.

## 사용 방법

1. 사용자가 언급한 라이브러리가 아니라 **작업**을 파악합니다. “드롭다운을 보여 주고 싶다”는 UI 프리미티브 작업이며, 다른 라이브러리를 언급했더라도 우선 base-ui를 고려합니다.
2. 이미 설치된 항목을 확인합니다. 먼저 `package.json`을 봅니다. 프로젝트가 목록에 있는 라이브러리를 이미 사용한다면 그대로 활용합니다. 경쟁 라이브러리를 사용 중이면 권장안을 알려 주되 요청받지 않는 한 의존성을 바꾸지 않습니다.
3. 라이브러리 하나를 추천하고 한 문장으로 용도를 설명합니다. 요청에 설치와 연결까지 포함됐다면 해당 작업도 수행합니다. 목록에 명확한 답이 있다면 선택지를 늘어놓지 않습니다.
4. 목록에서 다루지 않는 작업이라면 그 사실을 명시하고, 자체 지식에서 대안을 추천합니다. 다만 엄선된 목록의 범위를 벗어난 선택임을 밝힙니다.

## 라이브러리 목록

### UI 컴포넌트와 프리미티브

| 작업 | 라이브러리 |
| --- | --- |
| 스타일 없는 접근성 UI 컴포넌트(대화상자, 팝오버, 메뉴, 선택 상자 등) | [base-ui](https://base-ui.com) |
| 커맨드 메뉴(⌘K 팔레트) | [cmdk](https://cmdk.paco.me) |
| 토스트 / 알림 | [Sonner](https://sonner.emilkowal.ski) |
| 일회용 비밀번호 / 인증 코드 입력 | [input-otp](https://input-otp.rodz.dev) |
| 사용자 지정 GUI / 컨트롤 패널 | [Leva](https://github.com/pmndrs/leva) — 대안은 [dialkit](https://joshpuckett.me/dialkit) |

### 모션과 비주얼

| 작업 | 라이브러리 |
| --- | --- |
| 범용 애니메이션(스프링, 레이아웃, 진입/퇴장) | [motion](https://motion.dev) (Framer Motion) |
| 숫자 애니메이션(카운터, 가격, 통계) | [NumberFlow](https://number-flow.barvian.me) |
| 애니메이션 텍스트 컴포넌트 | [torph](https://torph.lochie.me/) |
| 3D 지구본 | [Cobe](https://cobe.vercel.app) |
| 동적 OG 이미지(HTML/CSS → SVG/PNG) | [Satori](https://github.com/vercel/satori) |
| 구문 강조 | [shiki](https://shiki.style) |

스프링, 레이아웃 애니메이션, 퇴장 애니메이션, 제스처 기반 값을 다룰 때 motion을 선택합니다. 단순한 호버나 페이드에는 필요하지 않습니다. 이때는 일반 CSS 트랜지션이 적절합니다.

### 차트

| 작업 | 라이브러리 |
| --- | --- |
| 실시간 / 스트리밍 차트 | [Liveline](https://github.com/benjitaylor/liveline) |
| 일반 차트(정적 차트 또는 인터랙티브 대시보드) | [recharts](https://recharts.org) |

구분 기준: 데이터가 실시간으로 들어오고 시간에 따라 차트가 스크롤되면 Liveline을 사용합니다. 그 외에는 recharts를 사용합니다.

### 상호작용과 성능

| 작업 | 라이브러리 |
| --- | --- |
| 드래그 앤 드롭 | [dnd kit](https://dndkit.com) |
| 가상화(긴 목록, 큰 표) | [Virtuoso](https://virtuoso.dev) |

### 상태와 스타일링

| 작업 | 라이브러리 |
| --- | --- |
| 상태 관리 | [zustand](https://zustand.docs.pmnd.rs) |
| 조건에 따라 `className` 문자열 구성 | [clsx](https://github.com/lukeed/clsx) |
| Tailwind용 타입 안전 variant 스타일 | [cva](https://cva.style) |
| 테마 전환 / 다크 모드(로드 시 깜박임 없음) | [next-themes](https://github.com/pacocoursey/next-themes) |

스타일링 선택 기준: 임시로 조건부 클래스를 조합할 때는 clsx를, 컴포넌트에 타입이 지정된 API로 관리할 만한 실제 variant(크기, 의도, 상태)가 있을 때는 cva를 씁니다. 서로 조합할 수 있습니다. cva 내부에서 clsx와 비슷한 입력을 사용합니다.

## 흔히 잘못된 선택

- **직접 만들거나 모달 라이브러리로 토스트 구현** → 이 용도에는 Sonner가 있습니다.
- **직접 포커스를 관리하는 `<div>` 기반 드롭다운 / 대화상자** → 접근성, 포커스 트랩, 닫기 동작을 처리하는 base-ui를 사용합니다.
- **텍스트를 다시 렌더링해 숫자 애니메이션** → NumberFlow가 숫자 전환을 올바르게 처리합니다.
- **1,000행이 넘는 목록을 전부 직접 렌더링** → 페이지네이션 편법을 찾기 전에 Virtuoso를 고려합니다.
- **공유 상태를 props로 전달하는 컴포넌트마다 `useState`가 얽힌 구조** → zustand를 사용합니다.
- **세 단계로 중첩된 template literal `className` 삼항식** → clsx를 사용합니다(variant를 표현한다면 cva).
