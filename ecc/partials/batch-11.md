# batch-11

### agent-sort

- **한 줄 요약**: 저장소의 grep 증거로 ECC 구성요소(skills/commands/rules/hooks 등)를 DAILY와 LIBRARY로 분류해 프로젝트별 설치 계획을 만드는 스킬.
- **설명**: 프로젝트가 ECC 전체 번들 대신 필요한 부분만 로드해야 할 때 쓴다. 파일 확장자, 패키지 매니저, CI/훅 설정 등 repo-local 증거를 모아 `경로 | 타입 | 버킷 | 증거 | 근거` 증거 표를 만들고, agents/skills/commands/rules/hooks/extras 6개 패스를 병렬 서브에이전트로 나눠 분류한다. 산출물은 DAILY/LIBRARY 목록, 설치 계획, 검증 리포트(DAILY·LIBRARY 개수, 제거된 stale 항목, 미해결 질문), 선택적 `skill-library` 라우터다.
- **분류**: 메타-스킬관리 / 컨텍스트 구성
- **관련도**: Medium
- **관련 축**: I, V
- **판단 근거**: "Every DAILY decision must cite concrete repo evidence", "Do not install hooks, rules, or scripts that the current repo cannot use" 규칙으로 AI에게 로드되는 지침 표면을 증거 기반으로 제한한다. 적용 후 DAILY 파일 존재, stale 규칙 잔존, 호환 불가 훅 설치 여부를 확인하는 verify 단계가 있다.
- **관심 포인트**: 어떤 규칙/훅을 항상 로드할지 근거(증거 표) 기반으로 정하는 방식, 삭제 대신 LIBRARY로 접근 가능하게 두는 원칙, 적용 후 계획과 실제 설치의 일치를 검증하는 단계.
- **확신도**: 중간

### competitive-report-structure

- **한 줄 요약**: 점수화된 경쟁사 프로파일 카드를 임원/이사회용 경쟁 분석 보고서(8개 섹션)로 조립하는 구성 가이드.
- **설명**: 경쟁 분석 파이프라인의 마지막 단계로, positioning brief(전략적 긴장, brand balance, differentiator, target quadrant)를 먼저 확정한 뒤 Executive summary, 시장 지도, 경쟁사 tier, 벤치마킹 heatmap 매트릭스, deep dive, white-space/위협, 전략 권고, 출처 부록 순으로 구성한다. 합산 점수 컬럼 금지, 방법론은 부록에만 두기 등 안티패턴과 팀 정렬 질문을 포함한다. 산출물은 비즈니스 리포트다.
- **분류**: 도메인-업무 / 경쟁 분석 리포트
- **관련도**: None
- **관련 축**: -
- **판단 근거**: 경쟁사 분석 보고서 작성이라는 마케팅/전략 도메인 업무이며, AI 작업의 통제·검증·기록과 무관하다. 부록의 asserted vs proven 검증 노트는 보고서 신뢰성용일 뿐이다.
- **관심 포인트**: -
- **확신도**: 높음

### ecc-recipes

- **한 줄 요약**: 설명된 워크플로에 맞는 ECC 커맨드 그룹과 실행 순서, 중단 조건을 안내하거나 전체 레시피 계열을 조회하는 읽기 전용 조언 스킬.
- **설명**: `commands/` 디렉터리를 매번 live read해 접두사(orch-*, multi-*, prp-*, epic-*, loop-*, gan-*, hookify-* 등)로 family를 분류한다. 설명이 없으면 catalog mode로 family 표를, 있으면 match mode로 Best fit, Run-order, STOP 조건, 문서 위치를 출력한다. 명령을 실행하지 않으며 개수·목록을 하드코딩하지 않는다.
- **분류**: 메타 / 커맨드 내비게이션
- **관련도**: Low
- **관련 축**: F
- **판단 근거**: 핵심은 커맨드 카탈로그 안내이지만, 모든 추천에 명시적 stop condition을 요구하고 자율 루프에는 max-iteration 백스톱과 구독 소진 경고를 붙이는 규칙이 있어 흐름 제어 개념을 약하게 담는다.
- **관심 포인트**: -
- **확신도**: 중간

### laravel-verification

- **한 줄 요약**: Laravel 프로젝트의 환경, lint, 정적분석, 테스트/커버리지, 보안, 마이그레이션, 배포 준비를 7단계로 순차 점검하는 검증 루프.
- **설명**: PR 전, 대규모 리팩터링 후, 배포 전에 실행한다. 환경과 Composer 검사가 실패하면 즉시 중단하고, pint/phpstan이 깨끗해야 테스트로 가며, 보안(`composer audit`)과 마이그레이션(`--pretend`) 검토는 테스트 이후, 캐시/큐/스케줄러 점검은 마지막 게이트로 둔다. 모든 내용은 PHP/Laravel artisan·composer 명령이며 CI 파이프라인 예시를 제공한다.
- **분류**: 언어-코딩지침 / 프레임워크 검증
- **관련도**: Low
- **관련 축**: V
- **판단 근거**: 순차 게이트 구조("any failure blocks release")는 있으나 본문이 Laravel 전용 명령 목록이다. 리포트 형식이나 AI 특화 메커니즘이 없어 언어/프레임워크 검증 섹션 기준(Medium까지만, 범용 메커니즘 있을 때만 High)에서 Low로 판단했다.
- **관심 포인트**: -
- **확신도**: 중간

### orch-refine-code

- **한 줄 요약**: 동작을 바꾸지 않는 리팩터링을 테스트 green 확인, 작은 단계 재구성, 리뷰, 게이트 승인 커밋으로 오케스트레이션하는 얇은 래퍼 스킬.
- **설명**: 공용 엔진 `orch-pipeline`에 설정을 얹는 wrapper다. Phase mask 0→2→4→5→6으로 새 행동 테스트 없이 기존 스위트를 안전망으로 삼고, 코드 수정 전에 관련 테스트가 green인지 확인하며 커버리지가 얇으면 characterization test를 먼저 추가한다. 작은 단계마다 테스트를 재실행하고, Gate 1(재구성 계획 승인)과 Gate 2(커밋 전 확인)에서 멈추며 `refactor:` 커밋의 diff는 behavior-neutral이어야 한다. 죽은 코드/중복 정리는 `refactor-cleaner` 에이전트에 위임한다.
- **분류**: 오케스트레이션 / 리팩터링 워크플로
- **관련도**: High
- **관련 축**: F, V, I
- **판단 근거**: 승인 게이트 2개, 수정 전 green 확인(사전 조건 검증), 단계별 테스트 재실행, 행동 불변 diff 요구가 스킬 본문의 핵심이다. 작업 흐름을 게이트로 제어하는 것이 목적이다. 다만 본문이 짧은 래퍼여서 세부 엔진은 orch-pipeline에 있다.
- **관심 포인트**: 행동 불변을 "기존 테스트가 안전망"으로 정의하고 테스트가 부족하면 characterization test부터 추가하는 방식, 계획 승인과 커밋 전 승인의 2단 게이트, 작은 단계마다 재검증하는 루프, 작업 종류별로 phase mask만 바꾸는 파이프라인 재사용 구조.
- **확신도**: 중간

### perl-patterns

- **한 줄 요약**: Perl 5.36+의 현대 관용구(signatures, 에러 처리, Moo OO, 정규식, 파일 I/O 등)를 정리한 코딩 지침.
- **설명**: `use v5.36`, subroutine signature, postfix dereference, `isa` 연산자, Try::Tiny와 네이티브 try/catch, Moo/Role, 5.38 `class`, named capture 정규식, 데이터 구조, 파일 I/O 같은 패턴을 Good/Bad 예시로 제시한다. 새 Perl 코드 작성이나 리뷰, 레거시 현대화에 쓰는 언어 레퍼런스다.
- **분류**: 언어-코딩지침
- **관련도**: None
- **관련 축**: -
- **판단 근거**: 본문이 Perl 언어 idiom 예시로만 구성되며 검증·지침 구조·기록·흐름 제어 메커니즘이 없다. 관심 밖인 특정 언어 코딩 지침이다.
- **관심 포인트**: -
- **확신도**: 높음

### rules-distill

- **한 줄 요약**: 설치된 스킬들을 교차 분석해 2개 이상의 스킬에 반복되는 원칙을 추출하고 rules 파일에 추가·수정·신규 작성하도록 제안하는 스킬.
- **설명**: Phase 1에서 스크립트로 skills/rules 인벤토리를 결정적으로 수집하고, Phase 2에서 주제별 클러스터로 나눈 서브에이전트가 전체 rules 텍스트와 대조해 후보별 JSON을 만든다(principle, evidence, violation_risk, verdict, confidence, draft). verdict는 Append/Revise/New Section/New File/Already Covered/Too Specific이고 배치 간 병합 시 2+ 스킬 요건을 재확인한다. Phase 3에서 요약 표를 사용자에게 제시해 번호별 Approve/Modify/Skip을 받고 결과를 `results.json`에 저장한다.
- **분류**: 메타-스킬관리 / 규칙 관리
- **관련도**: High
- **관련 축**: I, L, V
- **판단 근거**: 스킬에서 반복되는 원칙을 rules(지침)로 승격하는 것이 핵심 목적이다. "Never modify rules automatically. Always require user approval", 3중 필터(2+ 스킬 증거, 행동 가능성, violation risk), 후보별 status를 results.json에 남기는 기록 구조가 구체적이다.
- **관심 포인트**: 규칙 승격 기준(2+ 스킬 증거, "do X/don't do Y" 형태, 위반 시 위험 1문장, 중복 아님), "결정적 수집 + LLM 판단" 분리, 자동 변경 금지와 사람 승인, 근거 없는 verdict를 막는 Good/Bad 품질 예시, 후보별 승인/스킵 이력 기록.
- **확신도**: 높음

### skill-stocktake

- **한 줄 요약**: 전역·프로젝트 스킬을 체크리스트와 AI 종합 판단으로 감사해 Keep/Improve/Update/Retire/Merge 판정을 내리는 `/skill-stocktake` 스킬.
- **설명**: 마지막 결과(`results.json`)가 있으면 변경분만 보는 Quick Scan, 없으면 전체를 보는 Full Stocktake로 동작한다. Phase 1 인벤토리(scan.sh) → Phase 2 서브에이전트 배치 평가(약 20개씩, 중간 저장과 `in_progress` 재개) → Phase 3 요약 표 → Phase 4 통합(Retire/Merge 정당화, 영향 확인, MEMORY.md 100줄 초과 시 압축 제안) 순이다. 판정의 reason은 자기 완결적이어야 하며 "unchanged"나 "Superseded"만 쓰는 것을 금지하고 Good/Bad 예시를 둔다.
- **분류**: 메타-스킬관리 / 감사
- **관련도**: High
- **관련 축**: V, L, F
- **판단 근거**: 스킬(지침 자산)의 품질을 정형 체크리스트와 판정 스키마로 검증하는 것이 핵심이다. results.json에 mtime·verdict·reason·batch_progress를 기록하고, quick-diff로 증분 재평가하며, 삭제/아카이브는 반드시 사용자 확인을 요구한다.
- **관심 포인트**: 증분 평가(mtime diff)와 전체 평가 이원화, 청크 단위 저장과 resume 감지, 출처와 무관하게 같은 체크리스트를 적용하는 blind 평가, 판정 사유의 품질 요건(증거 재기술, 대체 수단 명시), 파괴적 조치 전 사용자 승인, 평가 시각을 실제 UTC로 기록하는 규칙.
- **확신도**: 높음
