# ponytail 관계 원장
분석 커밋: 835ad00af6ccb24e5ab01bbe0a91f878f95cc417

## 스킬
| 경로 ID | 한 줄 요약 | 조사 상태(완료/부분/미조사) | 원문 비교 | 소속 묶음 | 역할 |
|---|---|---|---|---|---|
| ponytail/ponytail | 영향 범위를 끝까지 고치면서 새 코드를 최소화한다 | 완료 | - | minimal-code | 단계 |
| ponytail/ponytail-review | diff와 연결 코드를 읽어 고칠 문제를 보고한다 | 완료 | - | minimal-code | 선택지 |
| ponytail/ponytail-audit | 저장소의 위험한 실행 경로를 감사해 문제를 우선순위로 보고한다 | 완료 | - | minimal-code | 선택지 |
| ponytail/ponytail-debt | 미룬 작업을 표시한 주석을 모아 한계와 재검토 조건을 보고한다 | 완료 | - | minimal-code | 단계 |
| ponytail/ponytail-gain | 공개 benchmark 수치를 보여 주고 현재 저장소의 절감량을 꾸며내지 못하게 한다 | 부분 | - | minimal-code | 안내 |
| ponytail/ponytail-help | 수준과 명령을 안내하고 모드나 파일은 바꾸지 않는다 | 완료 | - | minimal-code | 안내 |

## 관계
| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처(from 줄; to 줄) |
|---|---|---|---|---|---|---|---|---|---|
| R01 | ponytail/ponytail-help | ponytail/ponytail | 참고 | 명시-이름 | 명령 안내만 한다. 사용자가 별도로 호출한다 | 명령과 목적 | 호스트 에이전트 | 범위 내 | ponytail-help/SKILL.md:27:27; ponytail/SKILL.md:3:8 |
| R02 | ponytail/ponytail-help | ponytail/ponytail-review | 참고 | 명시-이름 | 명령 안내만 한다. 사용자가 별도로 호출한다 | 명령과 목적 | 호스트 에이전트 | 범위 내 | ponytail-help/SKILL.md:28:28; ponytail-review/SKILL.md:3:8 |
| R03 | ponytail/ponytail-help | ponytail/ponytail-audit | 참고 | 명시-이름 | 명령 안내만 한다. 사용자가 별도로 호출한다 | 명령과 목적 | 호스트 에이전트 | 범위 내 | ponytail-help/SKILL.md:29:29; ponytail-audit/SKILL.md:3:8 |
| R04 | ponytail/ponytail-help | ponytail/ponytail-debt | 참고 | 명시-이름 | 명령 안내만 한다. 사용자가 별도로 호출한다 | 명령과 목적 | 호스트 에이전트 | 범위 내 | ponytail-help/SKILL.md:30:30; ponytail-debt/SKILL.md:3:6 |
| R05 | ponytail/ponytail-help | ponytail/ponytail-gain | 참고 | 명시-이름 | 명령 안내만 한다. 사용자가 별도로 호출한다 | 명령과 목적 | 호스트 에이전트 | 범위 내 | ponytail-help/SKILL.md:31:31; ponytail-gain/SKILL.md:3:6 |
| R06 | ponytail/ponytail | ponytail/ponytail-debt | 산출물 호환 | 추론 | 한계가 있는 shortcut을 남긴 경우에 사용할 수 있다. 필수 후속 단계는 아니다 | shortcut: 주석 | 에이전트가 작성; debt가 읽음 | 범위 내 | ponytail/SKILL.md:42:42; ponytail-debt/SKILL.md:15:24 |
| R07 | ponytail/ponytail | ponytail/ponytail-review | 공유 상태 | 명시-역할 | 한계가 적힌 주석은 예상 부하가 한계를 넘을 때만 문제로 판정한다 | 소스 코드와 shortcut: 또는 구형 ponytail: 주석 | 작성 에이전트; 보고 에이전트 | 범위 내 | ponytail/SKILL.md:42:44; ponytail-review/SKILL.md:63:64 |
| R08 | ponytail/ponytail | ponytail/ponytail-audit | 공유 상태 | 명시-역할 | 한계가 적힌 주석은 예상 부하가 한계를 넘을 때만 문제로 판정한다 | 소스 코드와 shortcut: 또는 구형 ponytail: 주석 | 작성 에이전트; 보고 에이전트 | 범위 내 | ponytail/SKILL.md:42:44; ponytail-audit/SKILL.md:63:64 |
| R09 | ponytail/ponytail-review | ponytail/ponytail-audit | 같은 계열 | 추론 | 변경분을 볼지 저장소 전체를 볼지 선택한다. 실행 순서는 없다 | 같은 여섯 검토 기준 | 각 보고 에이전트 | 범위 내 | ponytail-review/SKILL.md:11:28; ponytail-audit/SKILL.md:11:28 |
| R10 | ponytail/ponytail-gain | ponytail/ponytail-debt | 넘김 | 명시-이름 | 현재 저장소에서 미룬 작업이 궁금할 때 안내한다. 자동 실행하지 않는다 | 집계할 주석의 위치 | 사용자가 호출; debt가 집계 | 범위 내 | ponytail-gain/SKILL.md:38:48; ponytail-debt/SKILL.md:15:24 |
| R11 | ponytail/ponytail-gain | ponytail/ponytail-audit | 넘김 | 명시-이름 | 현재 저장소에서 더 줄일 부분이 궁금할 때 안내한다. 자동 실행하지 않는다 | 감사할 저장소 | 사용자가 호출; audit가 보고 | 범위 내 | ponytail-gain/SKILL.md:38:39; ponytail-audit/SKILL.md:18:28 |
| R12 | ponytail/ponytail-gain | benchmarks/results/2026-10-07-agentic.md 및 README | 참고 | 명시-이름 | benchmark 수치의 출처로 지목한다. 컬렉션에는 두 자료가 없다 | benchmark 원자료 | 외부 저장소; 이 분석에서 미확인 | 범위 밖 | ponytail-gain/SKILL.md:14:20; to 줄 미확인 |
| R13 | ponytail/ponytail-help | https://github.com/DietrichGebert/ponytail | 참고 | 명시-이름 | 전체 문서와 예시 안내. 이 분석은 로컬 원문을 기준으로 한다 | 외부 문서 | 외부 저장소 | 범위 밖 | ponytail-help/SKILL.md:74:76; to 줄 미확인 |
| R14 | ponytail/ponytail-help | 호스트의 모드 설정과 band 및 plugin 명령 | 참고 | 명시-역할 | help는 설명만 한다. 설정 적용과 업데이트는 호스트가 담당한다 | 환경 변수; config.json; band 표시와 세션 기록 | 호스트와 plugin 구현; 이 컬렉션에는 구현 없음 | 범위 밖 | ponytail-help/SKILL.md:34:72; to 줄 미확인 |

## 묶음
| group-id | 작업 목표 | 구성 스킬과 역할 | 그림 |
|---|---|---|---|
| minimal-code | 불필요한 코드를 줄이고 남긴 한계와 위험을 점검한다 | ponytail: 구현; review/audit: 범위별 선택; debt: 미룬 작업 집계; gain/help: 안내 | 참고와 선택적 넘김은 workflow, 주석 호환은 별도 표 |

## 조사 메모
- SKILL.md 6개를 재귀적으로 찾았다. 이름이 같은 다른 컬렉션의 SKILL.md는 없었다. SHA-256 비교 대상이 없어 원문 비교는 -다. 이전 분석과 .agents는 제외했다.
- 형제 이름, slash 명령, 읽고 쓰는 경로, description을 모두 확인했다. 내부 위임이나 강제된 전체 실행 순서는 원문에 없다.
- gain이 지목한 benchmark 보고서와 README는 범위 밖이다. 부분 분석으로 표시한다. help의 호스트 구현은 문서상 안내까지만 분석했다.
- 공통 파일 skills-lock.json은 6개 항목의 source, skillPath, computedHash를 모두 읽었다. 실행 증거로 사용하지 않는다.
- 이 문서는 관계의 단일 원본이다. 그림에 없는 R06~R09와 범위 밖 R12~R14도 묶음 표에 남긴다.
- 작업 중 나타난 SKILL.ko.md 6개는 번역본으로 제외했다. 열거나 수정하지 않았다. 원본은 commit 835ad00의 파일을 유지했다.
