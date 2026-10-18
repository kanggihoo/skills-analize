---
name: copilot-instructions-blueprint-generator
description: 기존 코드베이스 패턴을 분석하고 추측을 배제하여, 프로젝트 표준, 아키텍처 패턴 및 정확한 기술 버전에 부합하는 코드를 GitHub Copilot이 생성하도록 가이드하는 종합 copilot-instructions.md 파일을 작성하기 위한 기술 중립적 블루프린트 생성기입니다.
---

# Copilot Instructions 블루프린트 생성기 (Copilot Instructions Blueprint Generator)

## 설정 변수 (Configuration Variables)
${PROJECT_TYPE="Auto-detect|.NET|Java|JavaScript|TypeScript|React|Angular|Python|Multiple|Other"} <!-- 기본 주요 기술 -->
${ARCHITECTURE_STYLE="Layered|Microservices|Monolithic|Domain-Driven|Event-Driven|Serverless|Mixed"} <!-- 아키텍처 접근 방식 -->
${CODE_QUALITY_FOCUS="Maintainability|Performance|Security|Accessibility|Testability|All"} <!-- 코드 품질 우선순위 -->
${DOCUMENTATION_LEVEL="Minimal|Standard|Comprehensive"} <!-- 문서화 수준 요구사항 -->
${TESTING_REQUIREMENTS="Unit|Integration|E2E|TDD|BDD|All"} <!-- 테스트 접근 방식 -->
${VERSIONING="Semantic|CalVer|Custom"} <!-- 버전 관리 접근 방식 -->

## 생성된 프롬프트 (Generated Prompt)

"GitHub Copilot이 우리 프로젝트의 표준, 아키텍처 및 기술 버전과 일치하는 코드를 생성하도록 가이드하는 종합 copilot-instructions.md 파일을 생성하세요. 지시사항은 우리 코드베이스의 실제 코드 패턴에 엄격히 기반해야 하며 어떠한 추측도 하지 않아야 합니다. 다음 접근 방식을 따르세요:

### 1. 핵심 지침 구조 (Core Instruction Structure)

```markdown
# GitHub Copilot 지시사항 (GitHub Copilot Instructions)

## 우선순위 가이드라인 (Priority Guidelines)

이 리포지토리를 위한 코드를 생성할 때:

1. **버전 호환성**: 이 프로젝트에서 사용되는 언어, 프레임워크 및 라이브러리의 정확한 버전을 항상 감지하고 준수하세요.
2. **컨텍스트 파일**: .github/copilot 디렉토리에 정의된 패턴과 표준을 최우선으로 적용하세요.
3. **코드베이스 패턴**: 컨텍스트 파일이 특정 가이드를 제공하지 않을 경우, 코드베이스를 스캔하여 수립된 패턴을 따르세요.
4. **아키텍처 일관성**: 우리의 ${ARCHITECTURE_STYLE} 아키텍처 스타일과 수립된 경계를 유지하세요.
5. **코드 품질**: 모든 생성된 코드에서 ${CODE_QUALITY_FOCUS == "All" ? "유지보수성, 성능, 보안, 접근성 및 테스트 가능성" : CODE_QUALITY_FOCUS}을(를) 최우선으로 고려하세요.

## 기술 버전 감지 (Technology Version Detection)

코드를 생성하기 전에 코드베이스를 스캔하여 다음을 식별하세요:

1. **언어 버전**: 사용 중인 프로그래밍 언어의 정확한 버전을 감지하세요.
   - 프로젝트 파일, 설정 파일 및 패키지 관리자를 검사하세요.
   - 언어별 버전 지표를 확인하세요 (예: .NET 프로젝트의 <LangVersion>).
   - 감지된 버전을 초과하는 언어 기능은 절대 사용하지 마세요.

2. **프레임워크 버전**: 모든 프레임워크의 정확한 버전을 식별하세요.
   - package.json, .csproj, pom.xml, requirements.txt 등을 확인하세요.
   - 코드를 생성할 때 버전 제약 사항을 준수하세요.
   - 감지된 프레임워크 버전에서 사용할 수 없는 기능은 절대 제안하지 마세요.

3. **라이브러리 버전**: 핵심 라이브러리 및 의존성의 정확한 버전을 기록하세요.
   - 이러한 특정 버전과 호환되는 코드를 생성하세요.
   - 감지된 버전에서 사용할 수 없는 API나 기능은 절대 사용하지 마세요.

## 컨텍스트 파일 (Context Files)

.github/copilot 디렉토리에 있는 다음 파일들을 최우선으로 다루세요 (존재하는 경우):

- **architecture.md**: 시스템 아키텍처 가이드라인
- **tech-stack.md**: 기술 버전 및 프레임워크 세부사항
- **coding-standards.md**: 코드 스타일 및 포맷팅 표준
- **folder-structure.md**: 프로젝트 구조화 가이드라인
- **exemplars.md**: 따라야 할 모범 코드 패턴

## 코드베이스 스캔 지시사항 (Codebase Scanning Instructions)

컨텍스트 파일이 특정 가이드를 제공하지 않을 때:

1. 수정되거나 생성되는 파일과 유사한 파일을 식별하세요.
2. 다음 항목에 대한 패턴을 분석하세요:
   - 명명 규칙 (Naming conventions)
   - 코드 구조화 (Code organization)
   - 에러 처리 (Error handling)
   - 로깅 접근 방식 (Logging approaches)
   - 문서화 스타일 (Documentation style)
   - 테스트 패턴 (Testing patterns)
   
3. 코드베이스에서 발견된 가장 일관된 패턴을 따르세요.
4. 상충하는 패턴이 존재할 경우, 더 최신 파일이나 테스트 커버리지가 높은 파일의 패턴을 우선시하세요.
5. 기존 코드베이스에서 발견되지 않은 패턴은 절대 도입하지 마세요.

## 코드 품질 표준 (Code Quality Standards)

${CODE_QUALITY_FOCUS.includes("Maintainability") || CODE_QUALITY_FOCUS == "All" ? `### 유지보수성 (Maintainability)
- 명확한 이름을 통해 스스로 문서화되는 코드를 작성하세요.
- 코드베이스에서 명확히 드러나는 명명 및 구조화 규칙을 따르세요.
- 일관성을 위해 수립된 패턴을 준수하세요.
- 함수가 단일 책임에 집중하도록 유지하세요.
- 기존 패턴에 맞추어 함수의 복잡성과 길이를 제한하세요.` : ""}

${CODE_QUALITY_FOCUS.includes("Performance") || CODE_QUALITY_FOCUS == "All" ? `### 성능 (Performance)
- 메모리 및 리소스 관리에 대해 기존 패턴을 따르세요.
- 연산 비용이 큰 작업을 처리할 때 기존 패턴과 맞추세요.
- 비동기 작업에 대해 수립된 패턴을 준수하세요.
- 기존 패턴과 일관되게 캐싱을 적용하세요.
- 코드베이스에 명확한 패턴에 따라 최적화하세요.` : ""}

${CODE_QUALITY_FOCUS.includes("Security") || CODE_QUALITY_FOCUS == "All" ? `### 보안 (Security)
- 입력 유효성 검사에 대해 기존 패턴을 따르세요.
- 코드베이스에서 사용되는 것과 동일한 정제(sanitization) 기술을 적용하세요.
- 기존 패턴과 일치하는 파라미터화된 쿼리를 사용하세요.
- 수립된 인증 및 인가 패턴을 따르세요.
- 기존 패턴에 따라 민감한 데이터를 처리하세요.` : ""}

${CODE_QUALITY_FOCUS.includes("Accessibility") || CODE_QUALITY_FOCUS == "All" ? `### 접근성 (Accessibility)
- 코드베이스의 기존 접근성 패턴을 따르세요.
- ARIA 속성 사용을 기존 컴포넌트와 맞추세요.
- 기존 코드와 일관되게 키보드 탐색 지원을 유지하세요.
- 색상 및 대비에 대해 수립된 패턴을 따르세요.
- 코드베이스와 일관된 대체 텍스트 패턴을 적용하세요.` : ""}

${CODE_QUALITY_FOCUS.includes("Testability") || CODE_QUALITY_FOCUS == "All" ? `### 테스트 가능성 (Testability)
- 테스트 가능한 코드를 위해 수립된 패턴을 따르세요.
- 코드베이스에서 사용된 의존성 주입 접근 방식과 맞추세요.
- 의존성 관리를 위해 동일한 패턴을 적용하세요.
- 수립된 모킹(mocking) 및 테스트 더블 패턴을 따르세요.
- 기존 테스트에서 사용된 테스트 스타일과 맞추세요.` : ""}

## 문서화 요구사항 (Documentation Requirements)

${DOCUMENTATION_LEVEL == "Minimal" ? 
`- 기존 코드에서 발견되는 주석의 수준과 스타일에 맞추세요.
- 코드베이스에서 관찰된 패턴에 따라 문서화하세요.
- 명확하지 않은 동작을 문서화하기 위해 기존 패턴을 따르세요.
- 파라미터 설명에 기존 코드와 동일한 포맷을 사용하세요.` : ""}

${DOCUMENTATION_LEVEL == "Standard" ? 
`- 코드베이스에서 발견되는 정확한 문서화 포맷을 따르세요.
- 기존 주석의 XML/JSDoc 스타일 및 완성도와 맞추세요.
- 파라미터, 반환값 및 예외를 동일한 스타일로 문서화하세요.
- 사용 예시에 대해 기존 패턴을 따르세요.
- 클래스 수준 문서화 스타일 및 내용과 맞추세요.` : ""}

${DOCUMENTATION_LEVEL == "Comprehensive" ? 
`- 코드베이스에서 발견되는 가장 상세한 문서화 패턴을 따르세요.
- 가장 문서화가 잘된 코드의 스타일 및 완성도와 맞추세요.
- 가장 철저히 문서화된 파일과 정확히 동일하게 문서화하세요.
- 문서 링크 연결에 대해 기존 패턴을 따르세요.
- 설계 결정 설명의 상세 수준과 맞추세요.` : ""}

## 테스트 접근 방식 (Testing Approach)

${TESTING_REQUIREMENTS.includes("Unit") || TESTING_REQUIREMENTS == "All" ? 
`### 단위 테스트 (Unit Testing)
- 기존 단위 테스트의 정확한 구조 및 스타일과 맞추세요.
- 테스트 클래스 및 메서드에 대해 동일한 명명 규칙을 따르세요.
- 기존 테스트에서 발견되는 동일한 단정문(assertion) 패턴을 사용하세요.
- 코드베이스에서 사용된 동일한 모킹 접근 방식을 적용하세요.
- 테스트 격리를 위해 기존 패턴을 따르세요.` : ""}

${TESTING_REQUIREMENTS.includes("Integration") || TESTING_REQUIREMENTS == "All" ? 
`### 통합 테스트 (Integration Testing)
- 코드베이스에서 발견되는 동일한 통합 테스트 패턴을 따르세요.
- 테스트 데이터 설정(setup) 및 해제(teardown)에 대해 기존 패턴과 맞추세요.
- 컴포넌트 상호작용 테스트에 동일한 접근 방식을 사용하세요.
- 시스템 동작 검증에 대해 기존 패턴을 따르세요.` : ""}

${TESTING_REQUIREMENTS.includes("E2E") || TESTING_REQUIREMENTS == "All" ? 
`### E2E 테스트 (End-to-End Testing)
- 기존 E2E 테스트 구조 및 패턴과 맞추세요.
- UI 테스트를 위해 수립된 패턴을 따르세요.
- 사용자 여정 검증에 동일한 접근 방식을 적용하세요.` : ""}

${TESTING_REQUIREMENTS.includes("TDD") || TESTING_REQUIREMENTS == "All" ? 
`### 테스트 주도 개발 (TDD)
- 코드베이스에서 명확히 드러나는 TDD 패턴을 따르세요.
- 기존 코드에서 보이는 테스트 케이스 진행 방식과 맞추세요.
- 테스트 통과 후 동일한 리팩토링 패턴을 적용하세요.` : ""}

${TESTING_REQUIREMENTS.includes("BDD") || TESTING_REQUIREMENTS == "All" ? 
`### 행위 주도 개발 (BDD)
- 테스트에서 기존 Given-When-Then 구조와 맞추세요.
- 행위 설명에 대해 동일한 패턴을 따르세요.
- 테스트 케이스에서 동일한 수준의 비즈니스 초점을 적용하세요.` : ""}

## 기술별 가이드라인 (Technology-Specific Guidelines)

${PROJECT_TYPE == ".NET" || PROJECT_TYPE == "Auto-detect" || PROJECT_TYPE == "Multiple" ? `### .NET 가이드라인
- 사용 중인 특정 .NET 버전을 감지하고 엄격히 준수하세요.
- 감지된 버전과 호환되는 C# 언어 기능만 사용하세요.
- 코드베이스에 나타난 그대로 LINQ 사용 패턴을 정확히 따르세요.
- 기존 코드의 async/await 사용 패턴과 맞추세요.
- 코드베이스에서 사용된 동일한 의존성 주입 접근 방식을 적용하세요.
- 기존 코드에서 발견되는 동일한 컬렉션 타입 및 패턴을 사용하세요.` : ""}

${PROJECT_TYPE == "Java" || PROJECT_TYPE == "Auto-detect" || PROJECT_TYPE == "Multiple" ? `### Java 가이드라인
- 사용 중인 특정 Java 버전을 감지하고 준수하세요.
- 코드베이스에서 발견되는 정확히 동일한 디자인 패턴을 따르세요.
- 기존 코드의 예외 처리 패턴과 맞추세요.
- 코드베이스에서 발견되는 동일한 컬렉션 타입 및 접근 방식을 사용하세요.
- 기존 코드에서 명확히 드러나는 의존성 주입 패턴을 적용하세요.` : ""}

${PROJECT_TYPE == "JavaScript" || PROJECT_TYPE == "TypeScript" || PROJECT_TYPE == "Auto-detect" || PROJECT_TYPE == "Multiple" ? `### JavaScript/TypeScript 가이드라인
- 사용 중인 특정 ECMAScript/TypeScript 버전을 감지하고 준수하세요.
- 코드베이스에서 발견되는 동일한 모듈 import/export 패턴을 따르세요.
- TypeScript 타입 정의를 기존 패턴과 맞추세요.
- 기존 코드와 동일한 비동기 패턴(promise, async/await)을 사용하세요.
- 유사한 파일의 에러 처리 패턴을 따르세요.` : ""}

${PROJECT_TYPE == "React" || PROJECT_TYPE == "Auto-detect" || PROJECT_TYPE == "Multiple" ? `### React 가이드라인
- 사용 중인 특정 React 버전을 감지하고 준수하세요.
- 기존 컴포넌트의 컴포넌트 구조 패턴과 맞추세요.
- 코드베이스에서 발견되는 동일한 훅(hook) 및 라이프사이클 패턴을 따르세요.
- 기존 컴포넌트에서 사용된 동일한 상태 관리 접근 방식을 적용하세요.
- 기존 코드의 prop 타입 정의 및 유효성 검사 패턴과 맞추세요.` : ""}

${PROJECT_TYPE == "Angular" || PROJECT_TYPE == "Auto-detect" || PROJECT_TYPE == "Multiple" ? `### Angular 가이드라인
- 사용 중인 특정 Angular 버전을 감지하고 준수하세요.
- 코드베이스에서 발견되는 동일한 컴포넌트 및 모듈 패턴을 따르세요.
- 기존 코드에서 보이는 것과 정확히 동일하게 데코레이터 사용을 맞추세요.
- 코드베이스에서 발견되는 동일한 RxJS 패턴을 적용하세요.
- 컴포넌트 간 통신에 대해 기존 패턴을 따르세요.` : ""}

${PROJECT_TYPE == "Python" || PROJECT_TYPE == "Auto-detect" || PROJECT_TYPE == "Multiple" ? `### Python 가이드라인
- 사용 중인 특정 Python 버전을 감지하고 준수하세요.
- 기존 모듈에서 발견되는 동일한 import 정렬 방식을 따르세요.
- 코드베이스에서 사용 중인 경우 타입 힌팅 접근 방식을 맞추세요.
- 기존 코드에서 발견되는 동일한 에러 처리 패턴을 적용하세요.
- 동일한 모듈 구조화 패턴을 따르세요.` : ""}

## 버전 관리 가이드라인 (Version Control Guidelines)

${VERSIONING == "Semantic" ? 
`- 코드베이스에 적용된 유의적 버전 관리(Semantic Versioning) 패턴을 따르세요.
- 파괴적 변경(breaking changes) 문서화에 대해 기존 패턴과 맞추세요.
- 폐기(deprecation) 공지에 대해 동일한 접근 방식을 따르세요.` : ""}

${VERSIONING == "CalVer" ? 
`- 코드베이스에 적용된 캘린더 버전 관리(Calendar Versioning) 패턴을 따르세요.
- 변경 사항 문서화에 대해 기존 패턴과 맞추세요.
- 중요한 변경 사항 강조에 대해 동일한 접근 방식을 따르세요.` : ""}

${VERSIONING == "Custom" ? 
`- 코드베이스에서 관찰된 정확한 버전 관리 패턴과 맞추세요.
- 기존 문서에 사용된 동일한 체인지로그 포맷을 따르세요.
- 프로젝트에서 사용된 동일한 태깅 규칙을 적용하세요.` : ""}

## 일반 모범 사례 (General Best Practices)

- 명명 규칙을 기존 코드에 나타난 것과 정확히 동일하게 따르세요.
- 유사한 파일의 코드 구조화 패턴과 맞추세요.
- 기존 패턴과 일관되게 에러 처리를 적용하세요.
- 코드베이스에서 보이는 것과 동일한 테스트 접근 방식을 따르세요.
- 기존 코드의 로깅 패턴과 맞추세요.
- 코드베이스에서 보이는 것과 동일한 설정(configuration) 접근 방식을 사용하세요.

## 프로젝트 전용 가이던스 (Project-Specific Guidance)

- 코드를 생성하기 전에 코드베이스를 철저히 스캔하세요.
- 기존 아키텍처 경계를 예외 없이 준수하세요.
- 주변 코드의 스타일 및 패턴과 맞추세요.
- 의문이 생길 때는 외부 모범 사례보다 기존 코드와의 일관성을 최우선으로 하세요.
```

### 2. 코드베이스 분석 지시사항 (Codebase Analysis Instructions)

copilot-instructions.md 파일을 생성하려면 먼저 코드베이스를 분석하여 다음을 수행하세요:

1. **정확한 기술 버전 식별**:
   - ${PROJECT_TYPE == "Auto-detect" ? "파일 확장자 및 설정 파일을 스캔하여 모든 프로그래밍 언어, 프레임워크 및 라이브러리 감지" : `${PROJECT_TYPE} 기술에 집중`}
   - 프로젝트 파일, package.json, .csproj 등에서 정밀한 버전 정보 추출
   - 버전 제약 사항 및 호환성 요구사항 문서화

2. **아키텍처 이해**:
   - 폴더 구조 및 모듈 구조화 분석
   - 명확한 계층 경계 및 컴포넌트 관계 식별
   - 컴포넌트 간 통신 패턴 문서화

3. **코드 패턴 문서화**:
   - 다양한 코드 요소에 대한 명명 규칙 목록화
   - 문서화 스타일 및 완성도 정리
   - 에러 처리 패턴 문서화
   - 테스트 접근 방식 및 커버리지 매핑

4. **품질 표준 정리**:
   - 실제로 사용 중인 성능 최적화 기술 식별
   - 코드에 구현된 보안 관행 문서화
   - 적용된 접근성 기능 정리 (해당되는 경우)
   - 코드베이스에서 명확히 드러나는 코드 품질 패턴 문서화

### 3. 구현 노트 (Implementation Notes)

최종 copilot-instructions.md 파일은:
- .github/copilot 디렉토리에 위치해야 함
- 코드베이스에 실제로 존재하는 패턴과 표준만 참조해야 함
- 명시적인 버전 호환성 요구사항을 포함해야 함
- 코드에서 증명되지 않은 관행은 처방하지 않아야 함
- 코드베이스의 구체적인 예시를 제공해야 함
- Copilot이 효과적으로 활용할 수 있도록 종합적이면서도 간결해야 함

중요: 코드베이스에서 실제로 관찰된 패턴에 기반한 가이드만 포함하세요. Copilot에게 외부 모범 사례나 더 최신의 언어 기능보다 기존 코드와의 일관성을 최우선하도록 명시적으로 지시하세요.
"

## 예상 결과물 (Expected Output)

기존 기술 버전과 완벽히 호환되고 수립된 패턴과 아키텍처를 준수하는 코드를 GitHub Copilot이 작성하도록 가이드하는 종합 copilot-instructions.md 파일입니다.
