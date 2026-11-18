# 감사 설정과 실행 안전 — 전체 감사를 시작하기 전에 정해 두는 것 {#detail-setup}

[개요](page:security-audit.html)의 `모드 판단?`, `안내 답변`, `감사 설정` 노드를 자세히 본다. 시작 입력은 사용자 요청과 target 경로이고 끝 출력은 출력 폴더와 `run-metadata.json`이다. 이후 개요의 `정찰`로 간다. 안내 모드는 `안내 답변`에서 끝난다.[](source:skm-setup)

- 스킬을 불러와도 전체 감사는 시작되지 않는다. 에이전트가 요청을 읽고 안내 모드와 전체 감사 모드 중 하나를 고른다.[](source:skm-modes)
- 샌드박스 통제를 하나라도 걸 수 없으면 대상 코드를 실행하지 않는다.[](source:skm-safety)
- 공유 파일 일곱 개는 parent만 쓰고, hunter와 verifier는 자기 `scratch/`에만 쓴다.[](source:skm-iso-files)

@answer scope="cloudflare/security-audit · SKILL.md 10~86줄 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source skm-modes title="운영 모드 선택" path=cloudflare/security-audit/SKILL.ko.md lines=10:17
@source skm-safety title="실행 안전 규칙" path=cloudflare/security-audit/SKILL.ko.md lines=31:42
@source skm-setup title="전체 감사 설정값" path=cloudflare/security-audit/SKILL.ko.md lines=44:52
@source skm-iso-files title="공유 파일과 agent별 폴더" path=cloudflare/security-audit/SKILL.ko.md lines=54:66
@source skm-iso-prep title="승격 준비" path=cloudflare/security-audit/SKILL.ko.md lines=68:68
@source skm-promote title="승격 절차 열한 단계" path=cloudflare/security-audit/SKILL.ko.md lines=70:80
@source skm-ident title="hunter·verifier 지시문에 같은 블록을 싣는다" path=cloudflare/security-audit/SKILL.ko.md lines=82:82
@source skm-repro title="재현 기록" path=cloudflare/security-audit/SKILL.ko.md lines=84:84
@source skm-meta title="run-metadata.json 작성" path=cloudflare/security-audit/SKILL.ko.md lines=86:86

## 어떻게 동작하나 {#detail span=12}

**어떤 요청에 어떤 모드가 켜지나**

스킬을 불러와도 전체 감사가 시작되지 않는다. 에이전트가 요청을 읽고 두 모드 중 하나를 고른다.[](source:skm-modes)

| 항목 | 안내 모드 | 전체 감사 모드 |
| --- | --- | --- |
| 이런 요청에 | 보안 질문, 집중 리뷰, 방법론, triage, 특정 지적 조사[](source:skm-modes) | codebase audit·pen-test, 전체·종합·end-to-end 보안 리뷰, 보고서 산출물 요청[](source:skm-modes) |
| 진행 | 요청과 관련된 부분만 쓰고 6단계를 자동으로 돌리지 않는다 | 6단계를 모두 돌리고 정해진 파일을 쓴다 |
| 파일 | 출력 폴더와 감사 산출물을 만들지 않는다 | 출력 폴더에 공유 파일과 agent별 폴더를 쓴다[](source:skm-iso-files) |
| 하위 agent | 도움이 되면 집중 agent를 띄울 수 있다. 결과는 현재 작업에 돌아온다 | 단계마다 `research`·`general` agent를 쓴다 |
| 모호할 때 | 파일을 만들거나 워크플로를 시작하기 전에 질문을 하나 한다 | 같음 |

**전체 감사 전에 무엇을 정하고 기록하나**

전체 감사 모드는 정찰 전에 다섯 값을 정한다.[](source:skm-setup)

@facts id=setup-values
| Skill directory | 이 `SKILL.md`가 있는 절대 경로 디렉터리 |
| Target | 검토 대상 저장소 루트의 절대 경로 |
| Repo name | 디렉터리 이름이나 로컬 Git remote에서 얻는 안정적인 저장소 식별자 |
| Output directory | target 밖의 새 쓰기 가능 폴더. 기본값은 `~/security-audit-skill/<repo-name>/run-<N>`이고 `<N>`은 다음 미사용 정수다 |
| Source ref | 검토한 commit과 worktree가 dirty인지 여부. 검토하지 않은 생성·수정 파일을 다른 revision으로 치지 않는다 |

출력 폴더를 target 안에 둘 수 있는 경우는 사용자가 명시적으로 고르고 parent가 version control이 폴더 전체를 ignore함을 확인했을 때뿐이다. 그렇지 않으면 멈추고 외부 경로를 요청한다.[](source:skm-setup)

위임을 시작하기 전에 parent가 `run-metadata.json`을 쓴다. 최소 필드는 다음과 같다.[](source:skm-meta)

- `run_id`, `repo`, `target`, `source_ref`, `profile`, `scope_paths`
- `budget`(설정하지 않았으면 null)
- `execution_policy: "sandboxed-source-and-local-only"`
- 선택한 companion 파일, 이전 실행 경로, 공유 파일 소유자
- `run_status: "in_progress"`

이 파일은 위 사실이 바뀔 때만 고친다. 후보의 상태는 coverage ledger와 `findings.json`에 둔다.[](source:skm-meta)

**누가 어디에 쓰고, 어떻게 artifact를 승격하나**

parent가 공유 파일 일곱 개를 만들고 혼자 쓴다.[](source:skm-iso-files)

| 공유 파일 | 쓰는 주체 |
| --- | --- |
| `run-metadata.json`, `architecture.md`, `coverage-ledger.json` | parent만 |
| `findings.json`, `REPORT.md`, `FINDINGS-DETAIL.md`, `NEEDS-VALIDATION.md` | parent만 |

hunter와 verifier는 각자 `<output-dir>/agents/<agent-id>/` 아래 `scratch/`와 `artifacts/`를 받는다. agent ID는 `^[a-z0-9][a-z0-9_-]{0,63}$`와 일치해야 하고 `con`, `prn`, `aux`, `nul`, `com1`~`com9`, `lpt1`~`lpt9` 같은 Windows 장치 이름과 같으면 안 된다. 소문자 ID는 대소문자 접기로 생기는 충돌을 막는다.[](source:skm-iso-files)

agent와 target 쓰기 process는 `scratch/`에만 쓴다. `artifacts/`는 parent 소유이고 샌드박스에 노출되지 않으며, 신뢰할 수 있는 parent 쪽 승격 코드만 쓴다. agent는 공유 파일, target 소스, 보관 artifact, 다른 agent의 폴더를 바꿀 수 없고, `/tmp`나 host 홈을 쓰기 대체 경로로 쓰지 않는다.[](source:skm-iso-files)

실행 전에 parent는 `scratch/`와 `artifacts/` 루트의 신뢰된 non-inheritable 디렉터리 descriptor를 열어 두고, 승격할 scratch 상대 경로 허용 목록과 파일별·누적 byte 상한을 기록한다. 이 descriptor는 agent나 샌드박스에 넘기지 않는다.[](source:skm-iso-prep) 샌드박스와 그 process가 모두 끝난 뒤, parent 쪽 코드가 허용 목록의 파일을 하나씩 승격한다.[](source:skm-promote)

@list id=promotion-steps ordered=true
| 선언한 상대 경로가 절대 경로, 빈 값, `.`, `..`, symlink 구성요소면 거부한다.[](source:skm-promote) |
| scratch 루트 descriptor에서 no-follow 디렉터리 기준 연산으로 각 부모를 내려가고, 경로로 다시 열지 않는다.[](source:skm-promote) |
| leaf를 no-follow, nonblocking으로 연다.[](source:skm-promote) |
| `fstat`으로 일반 파일, link count 정확히 1, 파일별·누적 상한 이내인지 확인한다.[](source:skm-promote) |
| 같은 상한을 descriptor에서 읽는 동안에도 다시 적용한다.[](source:skm-promote) |
| 검증한 크기만큼만 복사하고 `fstat`을 반복해 identity, type, link count, size가 바뀌었으면 거부한다.[](source:skm-promote) |
| 목적지는 artifacts 루트 descriptor에서 no-follow로 내려가며, 기존 구성요소는 실제 디렉터리여야 하고 없는 디렉터리는 배타적으로 만든 뒤 다시 열어 확인한다.[](source:skm-promote) |
| 목적지 leaf를 링크를 따라가지 않고 배타적으로 만들어 일반 파일·link count 1을 확인하고, 검증한 원본 descriptor에서 복사한다.[](source:skm-promote) |
| 비 POSIX 시스템에서는 동등한 race-safe API를 쓴다.[](source:skm-promote) |
| scratch를 재귀 복사하거나 glob하지 않고, archive를 artifacts에 풀지 않으며, symlink·FIFO·socket·device·디렉터리·hard link 파일·변하는 파일·상한 초과 파일을 열거나 승격하지 않는다.[](source:skm-promote) |
| 확인이 하나라도 불가능하거나 실패하면 그 scratch 항목을 버린다. 결정적 증거라면 정확한 승격 blocker와 함께 `needs_validation`으로 남긴다.[](source:skm-promote) |

이 절차는 `HUNTING.md`와 `VALIDATION-AND-REPORTING.md`가 hunter와 verifier 지시문용으로 같은 코드 블록 하나로 싣는다. 이 목록과 같은 규칙을 같은 순서로 말한다.[](source:skm-ident)

## 무엇을 지키고 언제 멈추나 {#limits span=12}

소스를 읽는 일은 읽기 전용이다. 대상이 통제하는 build, test, process, browser, emulator, fuzzer, fixture 처리는 OS가 강제하는 샌드박스 안에서만 돌린다.[](source:skm-safety)

@callout level=warning title="통제를 하나라도 못 걸면 대상 코드를 실행하지 않는다"
| 샌드박스는 네 가지를 모두 제공해야 한다. 외부 네트워크 차단(로컬 client·server 통신이 필요하면 격리된 loopback만), 명시한 허용 목록으로 채운 빈 환경(`HOME`·임시 폴더·cache는 `scratch/` 안), 읽기 전용 target과 toolchain(대상 process는 자기 `scratch/`에만 쓰기), 낮은 CPU·메모리·process·파일 크기·디스크·실행 시간 상한이다.[](source:skm-safety) |
| 하나라도 강제할 수 없으면 대상 코드를 실행하지 않는다. 빠진 샌드박스 기능을 `needs_validation` blocker로 보고하고 안전한 검증 계획을 준다.[](source:skm-safety) |

이 규칙 아래에서 에이전트가 하지 않는 일은 이렇다.[](source:skm-safety)

- 배포된 endpoint, 외부 서비스, 공유 인프라, 운영 계정, 다른 사용자 데이터, live control plane을 건드린다.
- 의존성을 설치하거나 build가 내려받게 둔다. 이미 로컬에 있는 도구와 의존성만 쓴다.
- live 또는 공유 process에서 availability를 시험한다. release를 바꾸거나 artifact를 publish한다. 유료 API quota를 쓴다.
- 결함을 세우는 데 필요한 최소 local 효과를 넘어 계속한다.
- 보관용 출력 폴더, 다른 agent의 폴더, host 홈 디렉터리, credential, socket, 공유 서비스를 target 코드에 노출한다.

결정적인 사실이 소스나 샌드박스 fixture 밖에 있으면 `needs_validation`으로 보고한다.[](source:skm-safety) 재현한 check는 명령, 정확한 test 입력, 샌드박스 상한, 허용 목록에 있는 환경 변수 이름과 안전한 값만 적는다. 주변 환경이나 credential 값은 복사하지 않고, 환경을 나중에 지우는 대신 빈 환경에서 시작한다.[](source:skm-repro)

## 다른 페이지 {#pages span=12}

- [개요](page:security-audit.html)
- [감사 계획](page:security-audit.planning.html)
- [정찰과 coverage ledger](page:security-audit.recon.html)
