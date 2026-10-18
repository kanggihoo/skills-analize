# 응답 템플릿

최종 응답을 아래 템플릿에 따라 GitHub flavored markdown으로 작성하세요. 이 응답이 PR 본문이 됩니다.

---

## React 컴포넌트 Prop 축소 완료

### 요약

**N**개 컴포넌트의 prop을 축소했습니다.

### 변경 사항

| 컴포넌트 | 파일 | 변경 | 근거 |
|-----------|------|--------|-----------|
| `ComponentName` | `path/to/file.tsx` | `onAction`을 필수로 변경 | 모든 라이브 호출 지점이 이를 전달함. 핸들러가 없으면 메뉴 항목이 동작하지 않음 |
| `ComponentName` | `path/to/file.tsx` | `defaultItems` prop 제거 | 라이브 호출 지점에서 사용하지 않음. Storybook용으로만 존재했음 |
| `ChildComponent` | `path/to/child.tsx` | `handler`를 필수로 변경 | 축소 이후 부모가 항상 전달함 |

### 확인한 라이브 호출 지점

| 호출 지점 | 파일 | 관찰 내용 |
|-----------|------|-----------|
| `ParentComponent` | `apps/app/src/Parent.tsx` | 항상 `onAction`과 `items`를 전달함 |
| `AnotherParent` | `apps/app/src/Another.tsx` | 항상 `onAction`을 전달하고 `legacyProp`은 생략함 |

### 업데이트한 지원 코드

- `ComponentName.stories.tsx`: 모든 스토리에 필수 `onAction` 핸들러를 추가함
- `ComponentName.test.tsx`: 필수 prop을 제공하도록 테스트 fixture를 업데이트함

### 검증

- [x] 타입 체크 통과 (`bun run typecheck --filter <package>`)
- [x] 품질 검사 통과 (`bun run quality`)

### 위험 평가

- **위험도**: 낮음
- **사유**: 모든 변경은 라이브 호출 지점 분석에서 도출됨. 동작 변경은 예상되지 않음

---

## 가이드라인

1. **요약을 먼저 제시** - 몇 개의 컴포넌트를 축소했는지
2. **변경 사항을 구체적으로** - 어떤 prop이 왜 바뀌었는지
3. **근거를 보여주기** - 각 축소를 정당화하는 라이브 호출 지점을 나열
4. **지원 코드 업데이트 명시** - 업데이트가 필요했던 스토리/테스트
5. **검증 결과 포함** - 타입 체크와 품질 검사가 통과했는지 확인
6. **위험도 평가** - 리뷰어가 검토 우선순위를 정할 수 있도록 도움
