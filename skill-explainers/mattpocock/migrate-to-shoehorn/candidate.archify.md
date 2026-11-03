# migrate-to-shoehorn 스킬은 에이전트를 어떻게 바꾸나 {#migrate-to-shoehorn-skill}

`migrate-to-shoehorn`을 쓰면 에이전트는 테스트 파일의 `as` 타입 단언을 `@total-typescript/shoehorn` 함수로 바꾼다. 테스트에 일부 데이터만 넘겨도 타입 검사를 통과하게 하는 것이 목적이다.[](source:skill-why)

- `as Type`은 `fromPartial()`로, `as unknown as Type`은 `fromAny()`로 바꾼다.[](source:skill-workflow)
- 테스트 코드에만 쓴다. 제품 코드에는 절대 쓰지 않는다.[](source:skill-why)
- 시작 전에 사용자에게 세 가지를 묻는다. 끝나면 타입 검사로 확인한다.[](source:skill-workflow)

@answer scope="mattpocock/migrate-to-shoehorn · 원본 텍스트 파일 2개 · 커밋 0f0d1b0"
@meta locale=ko
@source skill-fm title="mattpocock/migrate-to-shoehorn/SKILL.md · 2795B · frontmatter" path=mattpocock/migrate-to-shoehorn/SKILL.md lines=1:4
@source skill-why title="SKILL.md · Why shoehorn" path=mattpocock/migrate-to-shoehorn/SKILL.md lines=8:18
@source skill-install title="SKILL.md · Install" path=mattpocock/migrate-to-shoehorn/SKILL.md lines=20:24
@source skill-large title="SKILL.md · 큰 객체 패턴" path=mattpocock/migrate-to-shoehorn/SKILL.md lines=28:63
@source skill-patterns title="SKILL.md · as 단언 치환 패턴" path=mattpocock/migrate-to-shoehorn/SKILL.md lines=65:95
@source skill-table title="SKILL.md · 함수별 쓰임" path=mattpocock/migrate-to-shoehorn/SKILL.md lines=97:103
@source skill-workflow title="SKILL.md · Workflow" path=mattpocock/migrate-to-shoehorn/SKILL.md lines=105:118
@source oa-yaml title="mattpocock/migrate-to-shoehorn/agents/openai.yaml · 110B · 표시 정보" path=mattpocock/migrate-to-shoehorn/agents/openai.yaml lines=1:3

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

frontmatter에 `disable-model-invocation`이 없다. 그래서 모델이 `description`을 보고 스스로 켤 수 있다.[](source:skill-fm) `agents/openai.yaml`에도 `policy` 블록이 없다.[](source:oa-yaml)

`description`이 그리는 상황은 사용자가 shoehorn을 언급할 때, 테스트의 `as`를 없애고 싶을 때, 테스트용 일부 데이터가 필요할 때다. 이 설명은 판단 참고용이다.

## 무엇을 무엇으로 바꾸나 {#patterns}

```diff title="SKILL.md의 치환 패턴 두 가지"
+import { fromPartial, fromAny } from "@total-typescript/shoehorn";
-getUser({ body: { id: "123" } } as Request);
+getUser(fromPartial({ body: { id: "123" } }));
-getUser({ body: { id: 123 } } as unknown as Request); // wrong type on purpose
+getUser(fromAny({ body: { id: 123 } }));
```

위 diff는 원문의 두 예시를 한데 모은 것이다.[](source:skill-patterns)

| 함수 | 쓰임 |
| --- | --- |
| `fromPartial()` | 일부만 채운 데이터를 타입 검사를 통과시키며 넘긴다[](source:skill-table) |
| `fromAny()` | 일부러 틀린 데이터를 넘긴다. 자동 완성은 유지된다[](source:skill-table) |
| `fromExact()` | 객체 전체를 강제한다. 나중에 `fromPartial`로 바꿔 끼울 수 있다[](source:skill-table) |

원문이 꼽는 `as`의 문제는 세 가지다. 쓰지 않도록 길들여져 있고, 대상 타입을 손으로 적어야 하고, 일부러 틀린 데이터에는 `as unknown as`를 겹쳐 써야 한다.[](source:skill-why) 속성이 20개 넘는 `Request`에서 `body.id`만 필요한 경우가 대표 예시다.[](source:skill-large)

## 어떤 순서로 진행하나 {#flow}

@workflow id=shoehorn-flow title="migrate-to-shoehorn 진행 흐름"
| ask | 요구 질문 | frontend |
| install | 설치 | backend |
| find | 대상 찾기 | backend |
| replace | 치환 | backend |
| check | 타입 검사 | backend |
| ask > install | | |
| install > find | | |
| find > replace | | |
| replace > check | | emphasis |

@steps id=shoehorn-steps
| s-ask | 요구 질문 | 사용자에게 묻는다. 문제를 일으키는 `as`가 어느 테스트 파일에 있나, 일부 속성만 중요한 큰 객체인가, 오류 시험용으로 일부러 틀린 데이터가 필요한가. | shoehorn-flow | ask |
| s-install | 설치 | `npm i @total-typescript/shoehorn`을 실행한다. | shoehorn-flow | install |
| s-find | 대상 찾기 | `grep -r " as [A-Z]" --include="*.test.ts" --include="*.spec.ts"`로 찾는다. | shoehorn-flow | find |
| s-replace | 치환 | `as Type`은 `fromPartial()`, `as unknown as Type`은 `fromAny()`로 바꾸고 import를 더한다. | shoehorn-flow | replace |
| s-check | 타입 검사 | 타입 검사를 돌려 확인한다. 이것이 완료 조건이다. | shoehorn-flow | check |

순서와 문구는 Workflow 절의 확인 목록을 따른다.[](source:skill-workflow) 타입 검사 명령은 원문에 명시 없음.

- 판정: 설치 명령에 `-D`가 없어서 테스트 전용 라이브러리가 일반 의존성으로 들어간다. 패키지 관리자도 npm으로 고정돼 있다.[](source:skill-install)
- 판정: 검색 패턴은 `*.test.ts`와 `*.spec.ts`만 본다. `.test.tsx` 파일이나 소문자로 시작하는 타입의 단언은 찾지 못한다.[](source:skill-workflow)
- 판정: `fromExact()`는 표에만 있고 언제 바꿔 넣으라는 치환 패턴은 없다.[](source:skill-table)

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `agents/openai.yaml`. 두 파일 모두 원본이다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준). 원장에 이 스킬의 관계 행은 없다.
- 실행하지 않았다. 질문·설치·치환은 모두 지시상 동작이다. shoehorn 라이브러리 자체의 동작은 확인하지 않았다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
사용자 답에 따라 범위를 어떻게 좁히는지, 타입 검사가 실패하면 되돌리는지는 원문에 명시 없음. 커밋 지시도 없다.
