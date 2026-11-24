# landing-page-design — 단일 오퍼·타깃·CTA 중심 랜딩 페이지의 기획과 구현 {#overview}

landing-page-design은 에이전트가 하나의 제안과 하나의 핵심 행동에 집중한 전환형 랜딩 페이지를 기획하고, 정해진 시각·콘텐츠 규칙에 맞춰 구역별로 구현하게 한다.[](source:scope)

- 랜딩 페이지·마케팅 사이트·웹 인터페이스·구역·컴포넌트·프로토타입을 만들거나 고치고 스타일·문구를 다듬거나 검토할 때 모델이 판단해 켠다. 기존 사이트 개선이면 동반 스킬을 안내한다.[](source:fm)[](source:scope)
- 결과로 코드 작성 전에 반환하는 7가지 페이지 기획안(새 제작일 때)과 구역별 코드, 6가지 상태 및 출시 점검을 마친 화면이 남는다.[](source:out)[](source:b9)[](source:b10)
- 다른 스킬과는 `design-taste-frontend`와 참고·대안 관계이고, `10k-websites` 및 범위 밖인 `redesign-existing-projects`와 대안 관계로 이어진다.
- 첫 화면 상단에 경쟁하는 행동 유도 버튼을 여러 개 두지 않으며, 가격·통계·추천사 같은 사실은 사용자나 실제 근거 없이 지어내지 않는다.[](source:a45)[](source:b8)

@answer scope="design/elayadesign/landing-page-design · 원본 파일 1개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source fm title="frontmatter: 이름과 description" path=design/elayadesign/landing-page-design/SKILL.md lines=1:4
@source scope title="핵심 원칙, 적용 범위, 규칙 우선순위, 동반 스킬" path=design/elayadesign/landing-page-design/SKILL.md lines=6:19
@source a1 title="A1: 사전 질문 수집과 무응답 시 진행 규칙" path=design/elayadesign/landing-page-design/SKILL.md lines=24:50
@source a23 title="A2~A3: 페이지 12개 구역 구조와 레이아웃 4종 선택" path=design/elayadesign/landing-page-design/SKILL.md lines=52:84
@source a45 title="A4~A5: 전환 규칙, 카피 공식, 문구 제약" path=design/elayadesign/landing-page-design/SKILL.md lines=85:115
@source a67 title="A6~A7: 구역별 구현 순서와 SEO/AEO 색인 기준" path=design/elayadesign/landing-page-design/SKILL.md lines=116:134
@source b1 title="B1: 타이포그래피, type scale, 명명 텍스트 스타일" path=design/elayadesign/landing-page-design/SKILL.md lines=150:238
@source b24 title="B2~B4: 간격 토큰, 모서리 반경 공식, 테두리와 배경색" path=design/elayadesign/landing-page-design/SKILL.md lines=239:285
@source b57 title="B5~B7: 히어로 텍스트 그라데이션, 아이콘, 모션 규칙" path=design/elayadesign/landing-page-design/SKILL.md lines=286:332
@source b8 title="B8: 콘텐츠 현실성과 사실 조작 금지" path=design/elayadesign/landing-page-design/SKILL.md lines=335:347
@source b9 title="B9: 인터랙티브 상태와 죽은 링크 금지" path=design/elayadesign/landing-page-design/SKILL.md lines=348:360
@source b10 title="B10: 출시 필수 요건과 390px 모바일 검사" path=design/elayadesign/landing-page-design/SKILL.md lines=361:376
@source b11 title="B11: 필수 태그라인 공개 섹션" path=design/elayadesign/landing-page-design/SKILL.md lines=377:395
@source out title="출력 형식: 새 페이지 생성 시 7단계 선행 출력" path=design/elayadesign/landing-page-design/SKILL.md lines=398:410
@source chk title="Quick checklist: 전략·시각·출시 점검표" path=design/elayadesign/landing-page-design/SKILL.md lines=414:444
@source credits title="Credits: taste-skill 차용·재작성 출처" path=design/elayadesign/landing-page-design/SKILL.md lines=447:452

## 어떻게 동작하나 {#flow span=12}

그림은 전략(Part A)을 먼저 풀고 구현(Part B)으로 넘어가는 기본 흐름을 보여 준다.[](source:scope) 기존 사이트 개선 요청이면 동반 스킬을 안내할 수 있고, 구현할 때는 매 반복마다 페이지 전체를 다시 쓰지 않고 구역 단위로 고친다.[](source:scope)[](source:a67) 타이포·간격·모션·카피의 세부 수치는 한계 패널에 적었다.

@workflow id=flow-diagram title="landing-page-design 흐름"
| lane prep | 전략 설계(Part A) |
| lane impl | 구현과 검증(Part B) |
| intake | 요구사항 수집 | backend | prep | source:a1 |
| strategy | 전략·레이아웃 정하기 | backend | prep | source:a23 |
| scratch | 처음부터 새 제작인가? | external | prep | source:out |
| outline | 7가지 개요 먼저 제시 | backend | prep | source:out |
| build | 구역별 UI·카피 구현 | backend | impl | source:a67 |
| check | 상태·체크리스트 점검 | backend | impl | source:b9 |
| intake > strategy | |
| strategy > scratch | |
| scratch > outline | 예 | emphasis |
| scratch > build | 아니오 |
| outline > build | |
| build > check | |

@steps id=flow-steps
| s-intake | 요구사항 수집 | **입력** 사용자 요청 · **참조** `SKILL.md`의 `A1` · **출력** 목적·대상·근거·제약 정리 또는 1줄 가정. **처리** 에이전트가 빠진 항목만 한꺼번에 묻고, 답이 없어도 멈추지 않고 합리적 가정을 1줄로 밝힌 뒤 진행한다.[](source:a1) **다음** 기존 사이트 개선 요청이면 동반 스킬 `redesign-existing-projects` 사용을 안내한다.[](source:scope) | flow-diagram | intake |
| s-strategy | 전략·레이아웃 정하기 | **입력** 수집한 요구사항 · **참조** `SKILL.md`의 `A2`~`A5`, `A7` · **출력** 단일 오퍼·대상·CTA(행동 유도 버튼)와 레이아웃 A~D 선택 근거. **처리** 에이전트가 레이아웃 4종 중 하나를 선택 이유와 함께 정하고, 12개 구역 구조와 전환·카피·색인 규칙을 맞춘다.[](source:a23)[](source:a45)[](source:a67) | flow-diagram | strategy |
| s-scratch | 처음부터 새 제작인가? | **입력** 작업 성격(신규 제작 vs 기존 구역·컴포넌트 수정) · **출력** 선행 개요 반환 여부. **처리** 랜딩 페이지를 처음부터 새로 만드는 작업인지 가른다.[](source:out) **다음** 부분 수정이나 검토라면 개요 반환을 건너뛰고 바로 시각 규칙 적용 단계로 간다. | flow-diagram | scratch |
| s-outline | 7가지 개요 먼저 제시 | **입력** 확정한 전략과 구조 · **참조** `SKILL.md`의 `Output format` · **출력** 7개 항목 기획 문서. **처리** 코드를 쓰기 전에 페이지 개요·히어로 카피·혜택 3~5개·작동 방식 3단계·FAQ 6~12개·SEO/AEO·레이아웃 추천을 순서대로 반환한다.[](source:out) | flow-diagram | outline |
| s-build | 구역별 UI·카피 구현 | **입력** 기획안 또는 수정 대상 UI · **참조** `SKILL.md`의 `A6`, `B1`~`B8`, `B11` · **출력** 구역별 HTML/CSS·실제 초안 카피. **처리** 히어로→혜택→작동 방식→사회적 증거→FAQ→최종 CTA 순으로 한 구역씩 시각·모션·태그라인 공개 규칙에 맞춰 작성한다.[](source:a67)[](source:b1)[](source:b11) **다음** 매 반복마다 페이지 전체를 다시 작성하지 않는다.[](source:a67) | flow-diagram | build |
| s-check | 상태·체크리스트 점검 | **입력** 구현된 페이지·컴포넌트 · **참조** `SKILL.md`의 `B9`, `B10`, `Quick checklist` · **출력** 검증 완료된 결과물. **처리** hover·active·focus·loading·empty·error 6가지 상태와 390px 너비 가로 넘침, 출시 요건 체크리스트를 확인한다.[](source:b9)[](source:b10)[](source:chk) | flow-diagram | check |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 호출 명령은 없으며 모델이 `description`을 보고 자동으로 켠다. 호출 제한 필드는 원문에 명시 없음.[](source:fm) |
| 성격 | 전환 전략 순서(Part A)와 변경 불가 시각·콘텐츠 기준(Part B)을 함께 지시하는 절차·원칙 혼합 스킬이다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#rel-r01} | design-taste-frontend | 참고 | 라이선스·출처 고지에 따라 재설계 감사 구조·콘텐츠 현실성·모션·내비게이션 아이디어를 `taste-skill`에서 차용해 재작성했다. 사용자 개입은 없다.[](source:credits) |
| **이 스킬** {#rel-r02} | redesign-existing-projects(범위 밖) | 대안 | 제안: 새 페이지 제작이 아니라 기존 사이트를 개선할 때 동반 스킬 사용을 안내한다. 사용자가 고른다.[](source:scope) |
| **이 스킬** {#rel-r03} | 10k-websites | 대안 | 추론: 랜딩·웹사이트를 제작하는 같은 목적이나 원문에 직접 연결은 없다.[](source:fm)[](source:scope) |
| **이 스킬** {#rel-r04} | design-taste-frontend | 대안 | 추론: 웹사이트를 제작하는 같은 목적이나 원문에 직접 연결은 없다.[](source:fm)[](source:scope) |

@architecture id=relation-map title="landing-page-design과 이어지는 스킬"
| self | landing-page-design(이 스킬) | backend |
| taste | design-taste-frontend | backend |
| site10k | 10k-websites | backend |
| redesign | redesign-existing-projects(범위 밖) | external |
| self > taste | 참고 · 대안 |
| self > site10k | 대안 |
| self > redesign | 대안 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 전환 전략(Part A), 시각·콘텐츠 규칙(Part B), 출력 형식, 체크리스트 | 스킬이 켜질 때 항상 읽는다 | 요구사항 수집; 전략·레이아웃 정하기; 처음부터 새 제작인가?; 7가지 개요 먼저 제시; 구역별 UI·카피 구현; 상태·체크리스트 점검 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 규칙이 프레임워크 기본값과 충돌한다 | 강제: 이 스킬의 규칙이 우선한다. 단 사용자 프롬프트가 명시적으로 충돌하면 사용자 지시가 우선한다 | [](source:scope) |
| 사전 질문(`A1`)에 사용자가 답하지 못한다 | 멈춤 금지: 한 번에 질문하되 답이 없으면 1줄 가정을 적고 빌드를 계속한다 | [](source:a1) |
| 첫 화면 상단·카피·SEO 구성 | 금지: 상단에 경쟁하는 CTA 배치 금지. 본문·제목·레이블 내 하이픈(`-`)과 금지 미사여구 사용 금지. 광고 전용·시한부 페이지는 `noindex` 처리 | [](source:a45)[](source:a67)[](source:b1)[](source:b8) |
| 폰트·크기·간격·반경·테두리·배경 | 강제·금지: `Geist`·`Manrope`·`Geist Mono`·`Poppins` 중 한 서체만 쓰고 이탤릭·900 굵기·`Inter` 계열 금지. 글자 크기는 Tailwind `type scale` 아래 단계로 맞추고 간격 13종·다크 배경 6색만 사용. 카드 한쪽만 테두리 주기와 배경 그라데이션 금지 | [](source:b1)[](source:b24) |
| 아이콘·모션·히어로·태그라인 섹션 | 강제·금지: `Phosphor`·`Solar`·`Iconamoon`만 쓰고 `Material` 금지. 기본 곡선 `cubic-bezier(0.22,1,0.36,1)`로 `transform`·`opacity`만 움직이며 비스로틀 `scroll` 리스너 금지. 히어로 최대 너비 680px, 2줄 이상 단어별 스크롤 태그라인 공개 섹션 필수 | [](source:b57)[](source:b11) |
| 가격·통계·추천사·고객 수 등 실제 사실 | 금지: 실제 근거 없는 수치나 후기를 지어내지 않고 이중 중괄호 자리표시(`price`, `testimonial` 형태)로 남긴다 | [](source:b8) |
| 인터랙티브 요소·경고창·죽은 링크 | 강제·금지: hover·active·focus·loading(스켈레톤)·empty·error 6가지 상태 모두 구현. `window.alert()`와 `#`으로만 연결된 죽은 버튼 금지 | [](source:b9) |
| 최종 출시 검증 | 강제: 390px 너비에서 가로 넘침 없고 첫 화면에 주요 CTA가 보여야 하며 법적 링크·404·`skip to content`·메타·대체 텍스트를 갖춘다 | [](source:b10) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 타이포·간격·색상 수치표 — 개요 항목 "구역별 UI·카피 구현" · Tailwind `type scale` 13단계, 명명 텍스트 스타일 26종, 간격 13종, 중첩 반경 공식(`gap < 32px`일 때), 다크 모드 6색은 세부 수치라 뺐다.
- 전략·카피·모션·출시 세부 규칙 — 개요 항목 "전략·레이아웃 정하기"와 "상태·체크리스트 점검" · 12개 구역 배치, 레이아웃 4종 비교, 내비게이션·스크롤 모션 수치, 금지 단어 목록과 체크리스트 전문은 개요에 넣지 않았다.

읽은 원본: 텍스트 파일 1개(`SKILL.md`). 제외: `SKILL.ko.md` 1개(번역본).
