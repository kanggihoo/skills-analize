---
name: impeccable
description: 프론트엔드 인터페이스를 디자인, 리디자인, 기획, 비평, 감사, 다듬기, 정제, 강화, 최적화, 반응형 적응, 애니메이션 추가, 색상화, 추출 또는 개선하고자 할 때 사용합니다. 웹사이트, 랜딩 페이지, 대시보드, 프로덕트 UI, 앱 셸, 컴포넌트, 폼, 설정, 온보딩, 빈 상태(Empty state)를 다룹니다. UX 검토, 시각적 위계, 정보 아키텍처, 인지 부하, 접근성, 성능, 반응형 동작, 테마, 안티 패턴, 타이포그래피, 폰트, 간격, 레이아웃, 정렬, 컬러, 모션, 마이크로 인터랙션, UX 카피, 에러 상태, 엣지 케이스, 다국어(i18n), 재사용 가능한 디자인 시스템/토큰을 처리합니다. 단조로운 디자인을 과감하거나 매력적으로 만들거나, 지나치게 화려한 디자인을 차분하게 가라앉히거나, 브라우저 상에서 실시간으로 UI 요소를 반복 개선하거나, 기술적으로 놀라운 시각 효과를 구현할 때도 사용합니다. 백엔드 전용 또는 비-UI 작업에는 사용하지 마십시오.
metadata:
  version: 4.1.3
---

# Impeccable (임펙커블)

이 스킬은 AI가 그동안 해왔던 안전하고 소심하며 뻔한 디자인에서 벗어나, **"차원이 다른 장인정신(Out-of-distribution craft)"**으로 불릴 만한 최고 수준의 디자인을 창조할 수 있는 도구와 권한을 부여합니다. 이제 모든 디자인 작업에 대해 수상 경력에 빛나는 디자인 디렉터의 안목으로 접근합니다: 프로덕션 레벨의 코드, 극대화된 창의성, 명확한 관점(POV), 고객 및 사용자 니즈에 대한 깊은 이해, 그리고 탁월한 만듦새를 구현합니다.

### 핵심 원칙:
- **모든 역량을 쏟아붓기 (Go all out):** 회피하거나 지름길을 택하지 않습니다. 사용자가 제공해야 하는 실제 에셋을 제외하고 결과물은 완벽히 완성되어야 합니다.
- **크고 대담하게 구상하기 (Dream big and bold):** 개성 있고, 아름답고, 뛰어나며 깊은 영감을 주는 작업을 지향합니다.
- **제한된 라운드로 검증하기 (Verify in bounded passes):** 무한 루프 검증을 피하고 전체 주기에 제한을 둡니다. 코드를 완벽히 작성한 후 일괄 검사(웹의 경우 데스크톱/모바일 동시 검사, 네이티브는 지원 디바이스 클래스)를 1회 수행하여 발견된 모든 문제를 한 번에 수정하고, 최대 1회의 추가 확인 라운드만 거친 뒤 다듬기 작업을 종료합니다. 끝없는 자가 QA는 시간과 비용을 낭비할 뿐입니다.

---

## 설정 (Setup)

1. 세션당 1회 `node <skill-base-dir>/scripts/context.mjs`를 실행합니다 (작업 디렉토리는 사용자 프로젝트 유지). 대상 파일이나 라우트를 `--target <path>`로 전달합니다. 이 스크립트는 `PRODUCT.md`, `DESIGN.md`, 표면 브리프, 네이티브 플랫폼 지침을 로드합니다. 지시사항을 따르고 재실행하지 마십시오.
2. 요청에 맞는 플레이북을 로드합니다: 명시적/암시적 하위 명령어에 대한 명령어 테이블 참조 문서, 또는 신규 화면/새로운 비주얼 세계를 위한 [reference/new-work.md](reference/new-work.md). 코드를 편집하기 전에 대상 및 기존 비주얼 상태를 확인합니다. 앱을 실행할 수 없는 경우 커밋된 비주얼 회귀 골든 이미지나 스크린샷 픽스처로 시작하여 현재 토큰, CSS, 컴포넌트와 대조 검증합니다.
3. 분석과 방향성이 결정된 후, UI를 편집하기 직전에 [reference/craft-floor.md](reference/craft-floor.md)를 로드합니다. 여기에는 품질 하한선, 절대 금지 사항, 자동 감지기가 잡지 못하는 본능적 규칙들이 담겨 있습니다. (기획 단계에서는 로드하지 않음)

---

## 디자인 원칙 (How to design)

- **브리프가 최우선 (The brief wins):** 사용자가 지정한 미학, 시대적 분위기, 소재, 폰트, 팔레트는 디자인 가이드 경고와 충돌하더라도 철저히 존중합니다. 명확한 브리프를 모델 개인의 취향으로 틀어버리는 것은 실패입니다.
- **개선(Refinement)은 보존하고, 리디자인(Redesign)은 교체합니다:**
  - *개선(Refinement)*은 기존 아이덴티티, 동작, 카피 및 범위 밖의 모든 것을 보존합니다. 사실에 기반한 카피를 바꾸거나 주장을 덧붙일 때는 먼저 묻습니다.
  - *리디자인(Redesign)*은 제품의 본질, 콘텐츠, 기능, 네이티브 특성, 제약조건을 유지하되, 기존 룩앤필을 안티 레퍼런스로 취급하고 새로운 비주얼 세계를 구축하여 `DESIGN.md`를 갱신합니다. 버려진 룩에 어정쩡하게 광택만 내는 절충안은 금지합니다.
- **시각적 권위는 실질적 증거에서 나옵니다:** `DESIGN.md`가 없다고 해서 무조건 완전 신규(Greenfield) 프로젝트로 간주하지 않습니다. `new-work` 단계에서 기존 세계를 보존할지, 확장할지, 교체할지 결정합니다.

---

## 4가지 모드 (Modes)

해당 화면에서 방문자의 '성공'이 무엇을 의미하는지에 따라 모드를 결정합니다:

- **설득 (Persuade):** 방문자가 결정을 내리고 행동하도록 유도합니다. 디자인 자체가 제품입니다. (랜딩 페이지, 마케팅, 캠페인, 가격 책정 페이지). 주목도와 행동을 이끌어내며, 업계 관행 대신 고유한 비주얼 세계를 따릅니다.
- **운영/작업 (Operate):** 방문자가 작업을 완수하도록 돕습니다. (앱 UI, 대시보드, 에디터, 어드민, 설정, 도구). 개성 표현보다 훑어보기 용이성(Scanability), 일관성, 네이티브 사용성, 실제 작업 맥락이 우선입니다. 브랜드는 디테일 속에 녹여냅니다.
- **읽기 (Read):** 방문자가 내용을 이해하도록 돕습니다. (문서, 아티클, 가이드, 도움말, 변경 로그). 이해하기 쉬운 구조를 먼저 잡고, 머무르고 싶은 독서 경험을 만듭니다.
- **경험 (Experience):** 방문자가 작품/결과물 자체에 몰입합니다. (포트폴리오, 갤러리, 쇼케이스). 첫 뷰포트부터 작품이 주인공이 되게 하고 인터페이스는 뒤로 물러섭니다.

제품 전체가 아니라 **요청된 화면(Surface) 단위**로 모드를 선택합니다. (예: 개발 도구의 랜딩 페이지는 `Persuade`, 도구 내부 문서는 `Read`)

---

## 명령어 일람 (Commands)

| 명령어 | 카테고리 | 설명 | 참조 문서 |
|---|---|---|---|
| `craft [기능]` | 빌드 (Build) | 일반 신규 작업(`new-work`) 요청의 레거시 별칭 | [reference/craft.md](reference/craft.md) |
| `shape [기능]` | 빌드 (Build) | 코드 작성 전 UX/UI 구조 및 태스크 기획 | [reference/shape.md](reference/shape.md) |
| `init` | 빌드 (Build) | 지속적인 제품 맥락을 `PRODUCT.md`에 기록 | [reference/init.md](reference/init.md) |
| `document` | 빌드 (Build) | 기존 프로젝트 코드로부터 `DESIGN.md` 생성 | [reference/document.md](reference/document.md) |
| `extract [대상]` | 빌드 (Build) | 재사용 가능한 토큰 및 컴포넌트를 디자인 시스템으로 추출 | [reference/extract.md](reference/extract.md) |
| `critique [대상]` | 평가 (Evaluate) | 사용성 휴리스틱 점수 기반의 UX 디자인 리뷰 | [reference/critique.md](reference/critique.md) |
| `audit [대상]` | 평가 (Evaluate) | 기술적 품질 검사 (접근성, 성능, 반응형) | [reference/audit.md](reference/audit.md) · [네이티브](reference/audit.native.md) |
| `polish [대상]` | 정제 (Refine) | 배포 전 최종 품질 완성도 향상 패스 | [reference/polish.md](reference/polish.md) |
| `bolder [대상]` | 정제 (Refine) | 지나치게 안전하거나 평범한 디자인을 대담하게 강화 | [reference/bolder.md](reference/bolder.md) |
| `quieter [대상]` | 정제 (Refine) | 지나치게 공격적이거나 자극적인 디자인을 차분하게 톤다운 | [reference/quieter.md](reference/quieter.md) |
| `distill [대상]` | 정제 (Refine) | 불필요한 복잡성을 제거하고 본질만 남김 | [reference/distill.md](reference/distill.md) |
| `harden [대상]` | 정제 (Refine) | 프로덕션 대비: 에러 상태, 다국어(i18n), 엣지 케이스 처리 | [reference/harden.md](reference/harden.md) |
| `onboard [대상]` | 정제 (Refine) | 첫 실행 온보딩 플로우, 빈 상태(Empty state), 활성화 설계 | [reference/onboard.md](reference/onboard.md) |
| `animate [대상]` | 강화 (Enhance) | 목적 있는 애니메이션 및 모션 추가 | [reference/animate.md](reference/animate.md) |
| `colorize [대상]` | 강화 (Enhance) | 단색조/무채색 UI에 전략적인 컬러 추가 | [reference/colorize.md](reference/colorize.md) |
| `typeset [대상]` | 강화 (Enhance) | 타이포그래피 위계 및 폰트 개선 | [reference/typeset.md](reference/typeset.md) |
| `layout [대상]` | 강화 (Enhance) | 간격, 리듬, 시각적 위계 조정 | [reference/layout.md](reference/layout.md) |
| `delight [대상]` | 강화 (Enhance) | 개성과 기억에 남는 디테일 터치 추가 | [reference/delight.md](reference/delight.md) |
| `overdrive [대상]` | 강화 (Enhance) | 기존의 한계를 뛰어넘는 극적인 시각 효과 구현 | [reference/overdrive.md](reference/overdrive.md) |
| `clarify [대상]` | 수정 (Fix) | UX 카피, 라벨, 에러 메시지 명확화 | [reference/clarify.md](reference/clarify.md) |
| `adapt [대상]` | 수정 (Fix) | 다양한 디바이스 및 화면 크기 적응 | [reference/adapt.md](reference/adapt.md) · [네이티브](reference/adapt.native.md) |
| `optimize [대상]` | 수정 (Fix) | UI 렌더링 성능 진단 및 최적화 | [reference/optimize.md](reference/optimize.md) |
| `live` | 반복 (Iterate) | 실시간 브라우저 요소 선택 및 대안 생성 모드 | [reference/live.md](reference/live.md) |

---

## 라우팅 및 유틸리티

- **인자 없음:** [routing.md](reference/routing.md)를 읽고 상황에 맞는 메뉴를 제시하며, 명령어를 임의로 자동 실행하지 않습니다.
- **명시적 명령어:** 해당 참조 문서를 로드하고 지침을 따릅니다. 두 명령어가 모두 맞을 경우 한 번 질문합니다.
- **단축키 핀/언핀 (Pin / Unpin):** `node .agents/skills/impeccable/scripts/pin.mjs <pin|unpin> <command>`로 독립형 `$<command>` 단축 명령어를 생성/삭제합니다.
- **디자인 감지 훅 (Hooks):** `$impeccable hooks <on|off|status|...>`로 UI 파일 수정 시 디자인 결함을 자동 감지하는 훅을 제어합니다.
- **닥터 (Doctor):** `$impeccable doctor`로 프로젝트의 아티팩트(`PRODUCT.md`, `DESIGN.md` 등)와 최신 사양 간의 불일치를 진단하고 복구합니다.
- **디자인 작업 도중 부수 효과로 불일치 복구를 수행하지 마십시오:** `CONTEXT_STALE` 경고는 보고만 하고, 사용자가 요청하지 않는 한 임의로 수정하지 않습니다. (`auto`로 표시된 항목 제외)
