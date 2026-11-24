# narrated-motion-video 묶음은 어떻게 이어지나 {#narrated-motion-video-group}

`script-to-motion`이 대본에서 나레이션 모션그래픽 영상 프로젝트를 끝까지 만들고, 5단계(스토리보드·장면 설계)에서 `cokacmotion`의 `aimotion` 기법 도서관을 불러 표현 기법을 찾는다(r16).[](source:nmv-stm-use)[](source:nmv-aim-rule)

- `script-to-motion`은 자체 `scripts/cokacmotion.mjs`로 외부 저장소(`kstost/cokacmotion`)를 `~/.cache/motion-video-cokacmotion`에 받아 `scripts/aimotion.mjs`를 실행한다.[](source:nmv-stm-use)
- `aimotion`은 166개 데모에서 기법 원리만 빌리고 소재·구도·색·9:16 틀은 절대 옮기지 말라고 못 박는다.[](source:nmv-aim-rule)
- 영상 프로젝트 규칙(비율·글꼴·소리·라이브러리)은 `script-to-motion`이 우선한다(r17).[](source:nmv-aim-order)

@answer scope="video/script-to-motion · video/cokacmotion/skills/aimotion · 커밋 f53b74e · 지시상 동작 · 외부 캐시·166개 데모 전체 미확인"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=f53b74e8bae4a9f9a8a11d2d3d0dc2b980b855ed
@source nmv-stm-use title="script-to-motion/SKILL.md · cokacmotion 기법 활용 규칙" path=video/script-to-motion/SKILL.md lines=476:480
@source nmv-aim-rule title="aimotion/SKILL.md · 기술만 가져간다 규칙" path=video/cokacmotion/skills/aimotion/SKILL.md lines=12:20
@source nmv-aim-order title="aimotion/SKILL.md · 영상 스킬 규칙 우선과 파일 비참조" path=video/cokacmotion/skills/aimotion/SKILL.md lines=55:62

## 대본 제작 중 표현 기법을 언제 찾나 {#flow span=12}

@workflow id=nmv-flow title="narrated-motion-video 호출 흐름"
| stm5 | script-to-motion 5단계 (장면·스토리보드) | backend |
| aim | aimotion 기법 찾기 (cokacmotion.mjs) | backend |
| stm6 | script-to-motion 6단계 (장면 코드 구현) | backend |
| stm5 > aim | beat별 기법 검색 |
| aim > stm6 | 기법 한 문장·데모 id 반환 | emphasis |

@steps id=nmv-steps
| stm5 | script-to-motion 5단계 (장면·스토리보드) | 대본과 오디오 길이에 맞춰 장면별 beat와 필요한 시각 표현을 정한다. | nmv-flow | stm5 |
| aim | aimotion 기법 찾기 (cokacmotion.mjs) | `cokacmotion.mjs`가 로컬 캐시에서 `aimotion.mjs`를 돌려 후보 데모의 원리와 `main.js` 기법을 찾는다. | nmv-flow | aim |
| stm6 | script-to-motion 6단계 (장면 코드 구현) | 스토리보드에 적은 기법 한 문장과 데모 id를 바탕으로 영상 규칙에 맞춰 코드를 새로 짠다. | nmv-flow | stm6 |

`script-to-motion`은 `aimotion`의 `SKILL.md`를 통째로 읽지 않고, `references/cokacmotion.md`와 셰이더 함정 절("영상에 옮길 때")만 참조한다.[](source:nmv-aim-order)

## 두 스킬은 무엇을 주고받고 어디에 쓰나 {#state}

| 파일·폴더 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `~/.cache/motion-video-cokacmotion` | `cokacmotion.mjs` (최초 약 70MB 내려받기 전 1줄 알림) | `aimotion.mjs` 실행기 |
| 스토리보드 References(기법 한 문장, 데모 id) | script-to-motion 5단계 | script-to-motion 6단계 |
| `licenses/cokacmotion-LICENSE.txt` | script-to-motion 6단계 (코드가 데모와 실질적으로 같을 때) | 사용자·배포 검사 |

## 그림에서 뺀 관계와 쓰면 안 될 때 {#omitted}

| rel-id | 종류 | 그림에 있나 | 내용 |
| --- | --- | --- | --- |
| r16 | 호출 | 있음 | `script-to-motion` 5단계에서 `aimotion` 기법 검색을 호출한다[](source:nmv-stm-use) |
| r17 | 참고 | 생략 | `aimotion`은 작업 중인 영상 스킬의 규칙이 먼저라고 적는다[](source:nmv-aim-order) |
| r18 | 대안 | 생략 | `bang-motion`과 HTML·CSS·GSAP 영상 제작 목적이 겹치지만 직접 연결은 없다 |
| r19 | 대안 | 생략 | `explainer-default`와 코드 기반 MP4 출력 목적이 겹치지만 직접 연결은 없다 |

@callout level=open-question title="확인하지 못한 것"
`aimotion` 166개 데모 전체와 런타임 외부 캐시(`~/.cache/motion-video-cokacmotion`) 다운로드·렌더 결과는 실행하지 않아 확인하지 못했다.
