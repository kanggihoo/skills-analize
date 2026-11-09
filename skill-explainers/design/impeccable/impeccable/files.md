# impeccable 분석에서 읽은 파일

분석 커밋: `4e3fc895a4a5c4dd6c1e09e21a14bb2d1255ba9d`. 경로는 `design/impeccable/impeccable/` 기준이다. 모든 스크립트는 읽기만 하고 실행하지 않았다.

## 전부 읽은 텍스트 파일 (57개, 537,328B)

| 파일 | 바이트 | 역할 |
|---|---:|---|
| `SKILL.md` | 11,762 | 진입점. Setup, 디자인 원칙, 방문자 모드, 명령 표, Routing |
| `agents/impeccable_asset_producer.toml` | 8,429 | 서브에이전트 정의: plate·결정 comp 생성 |
| `agents/impeccable_documenter.toml` | 3,562 | 서브에이전트 정의: 빌드 뒤 DESIGN.md 기록 |
| `agents/impeccable_finish_reviewer.toml` | 15,731 | 서브에이전트 정의: 마무리 리뷰와 disposition |
| `agents/impeccable_manual_edit_applier.toml` | 7,472 | 서브에이전트 정의: live 수동 문구 편집 반영 |
| `agents/openai.yaml` | 236 | Codex UI 표시 이름과 기본 프롬프트 |
| `reference/adapt.md` | 11,313 | adapt 명령(웹) |
| `reference/adapt.native.md` | 3,910 | adapt 명령(native) |
| `reference/android.md` | 4,203 | Android 플랫폼 규칙 |
| `reference/animate.md` | 5,236 | animate 명령 |
| `reference/audit.md` | 9,584 | audit 명령(웹) |
| `reference/audit.native.md` | 8,326 | audit 명령(native) |
| `reference/bolder.md` | 3,566 | bolder 명령 |
| `reference/clarify.md` | 4,590 | clarify 명령 |
| `reference/colorize.md` | 4,537 | colorize 명령 |
| `reference/component-review.md` | 8,017 | comp-led 플랜·에셋·첫 화면 리뷰 |
| `reference/craft-floor.md` | 5,532 | UI 편집 전 품질 하한과 금지 목록 |
| `reference/craft.md` | 555 | craft 별칭 |
| `reference/critique.md` | 48,958 | critique 명령과 휴리스틱·persona 참고 |
| `reference/degraded/asset-producer.md` | 8,630 | 서브에이전트 없을 때 asset producer 대행 |
| `reference/degraded/documenter.md` | 3,733 | 서브에이전트 없을 때 documenter 대행 |
| `reference/degraded/finish-reviewer.md` | 15,880 | 서브에이전트 없을 때 finish reviewer 대행 |
| `reference/degraded/manual-edit-applier.md` | 7,685 | 서브에이전트 없을 때 manual edit applier 대행 |
| `reference/delight.md` | 3,716 | delight 명령 |
| `reference/distill.md` | 5,598 | distill 명령 |
| `reference/doctor.md` | 5,617 | doctor 명령 |
| `reference/document.md` | 27,526 | document 명령과 DESIGN.md 형식 |
| `reference/extract.md` | 3,406 | extract 명령 |
| `reference/generate.md` | 13,221 | generate 명령 |
| `reference/harden.md` | 10,748 | harden 명령 |
| `reference/hooks.md` | 17,337 | hooks 명령과 hook 동작 |
| `reference/init.md` | 12,229 | init 명령과 PRODUCT.md 형식 |
| `reference/ios.md` | 3,812 | iOS 플랫폼 규칙 |
| `reference/layout.md` | 5,161 | layout 명령 |
| `reference/live-setup.md` | 8,186 | live 최초 설정과 CSP 동의 |
| `reference/live.md` | 37,579 | live 명령 |
| `reference/mode-operate.md` | 4,716 | Operate 모드 규칙 |
| `reference/mode-persuade.md` | 3,638 | Persuade·Experience 모드 규칙 |
| `reference/mode-read.md` | 4,396 | Read 모드 규칙 |
| `reference/new-work.md` | 63,005 | 새 화면·세계 교체 흐름 |
| `reference/onboard.md` | 7,688 | onboard 명령 |
| `reference/operate.md` | 4,145 | Operate·Read 심화 |
| `reference/optimize.md` | 7,577 | optimize 명령 |
| `reference/overdrive.md` | 9,079 | overdrive 명령 |
| `reference/polish.md` | 6,646 | polish 명령 |
| `reference/quieter.md` | 5,020 | quieter 명령 |
| `reference/region-map.md` | 3,361 | comp 영역 지도 |
| `reference/routing.md` | 3,336 | 인자 없는 호출 메뉴와 워크플로 질문 |
| `reference/shape.md` | 3,547 | shape 명령 |
| `reference/typeset.md` | 6,263 | typeset 명령 |
| `reference/visualize.md` | 13,956 | comp 3개와 승인, plate·provenance |
| `scripts/VERSION` | 7 | 고정한 엔진 버전 0.1.18 |
| `scripts/command-metadata.json` | 8,318 | 명령 24개의 설명과 인자 힌트 |
| `scripts/data/font-index-failures.json` | 2,437 | 색인에 실패한 글꼴 17개 목록 |
| `scripts/engine-checksums.txt` | 787 | 엔진 0.1.18 플랫폼별 sha256 |
| `scripts/impeccable` | 11,320 | sh launcher: 엔진 탐색, 다운로드, 해시 확인 |
| `scripts/impeccable.cmd` | 12,503 | Windows launcher: 같은 순서, certutil로 해시 확인 |

## 구조·표본만 확인(전부 읽지 않음) (6개, 1,721,055B)

| 파일 | 바이트 | 확인한 범위 |
|---|---:|---|
| `scripts/data/font-index.json` | 1,100,013 | Google Fonts 지문 색인. 키(schema, text, textCaps, sizes, features, categories, entries)와 첫 항목, 항목 수 3,076개만 확인 |
| `scripts/live-browser-dom.js` | 12,283 | live 모드 DOM 도우미. 머리 주석과 앞부분만 확인 |
| `scripts/live-browser-ignores.js` | 10,423 | live overlay의 detector 예외 해석. 머리 주석만 확인 |
| `scripts/live-browser-session.js` | 5,838 | live 세션 복구 도우미. 머리 주석과 앞부분만 확인 |
| `scripts/live-browser.js` | 563,208 | live overlay UI 브라우저 번들. 머리 주석과 함수 이름 목록만 확인 |
| `scripts/modern-screenshot.umd.js` | 29,290 | 압축된 외부 스크린샷 라이브러리. 첫 줄만 확인 |

## 제외한 파일

- 번역본 46개, 556,048B. 원본이 같은 폴더에 있어 열지 않았다. 그중 `.ko.stale.md` 9개는 이번 최신화로 원본이 바뀐 낡은 번역본이다: `SKILL.ko.stale.md`, `reference/degraded/asset-producer.ko.stale.md`, `reference/degraded/documenter.ko.stale.md`, `reference/degraded/finish-reviewer.ko.stale.md`, `reference/degraded/manual-edit-applier.ko.stale.md`, `reference/hooks.ko.stale.md`, `reference/init.ko.stale.md`, `reference/live.ko.stale.md`, `reference/new-work.ko.stale.md`.
- 바이너리 파일: 없음.
- 엔진 바이너리(`scripts/bin/<os>-<arch>/impeccable`): 저장소에 없다. launcher 주석에 따르면 gitignore 대상이고, 없으면 GitHub releases에서 내려받는다.
- 비교 패널을 위해 다른 스킬 4개의 `SKILL.md` description 줄만 읽었다(`design/elayadesign/landing-page-design`, `design/taste/design-taste-frontend`, `design/garden-skills/web-design-engineer`, `design/emilkowalski/animate`). 위 개수에 넣지 않았다.
