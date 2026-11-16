# 메모리 안전성·바이너리·커널 보안 점검

#### 이 문서를 사용할 때

대상이 신뢰할 수 없는 byte를 메모리 안전성이 보장되지 않거나 권한이 높은 맥락에서 처리할 때 참고한다. C/C++/Objective-C, Rust `unsafe`, FFI, kernel module·driver, parser·decoder, network daemon, firmware, binary loader, 언어 runtime, JIT 등이 해당한다. protocol 권한 및 상태 머신은 `PROTOCOLS-RPC-AND-MESSAGING.md`, process 무결성·메모리 안전성·ABI 경계·loader 동작은 이 문서를 본다.

Phase 1에서 관련 유형을 고르고, 규모가 크면 parser, allocator·수명, FFI, 동시성, loader, runtime, 권한 인터페이스별로 나눈다.

## 기본 원칙 (모든 에이전트 프롬프트에 포함)

```
- 모든 경계와 수명을 공격자 제어 입력 및 모든 caller에서 다시 계산한다. 일반적인 테스트 입력이 아니라 수락 가능한 최악의 경우를 검증한다.
- 현실적인 신뢰할 수 없는 입력이 도달할 때만 panic, sanitizer 결과, crash가 결함의 근거가 된다. 표시만 보고 메모리 손상, 코드 실행, 공유 가용성 영향을 추정하지 않는다.
- sanitizer, 결정론적 동시성 테스트, 기존 fuzz target, debugger 기반 오류 분류를 이용해 로컬 harness에서 검증한다. 깨진 불변식과 관찰 가능한 영향을 확인하면 멈추고, 손상 이후의 악용 기법은 만들지 않는다.
- Assembly, JIT 코드, custom allocator, 객체 내부 접근, 외부 library는 sanitizer 검사 밖에 있을 수 있다. 관련 instruction 중 무엇이 계측되는지 확인한다.
- 소스 근거와 제한된 로컬 검증으로 결함과 결과를 확인해야 `confirmed`다. ABI, allocator, architecture, feature, 배포, 도달 가능성이 불명확하면 `needs_validation`을 쓴다.
```

## 경계·정수·표현 공격 유형 (`subagent_type: general`)

**범위 밖 읽기·쓰기**
길이, offset, index, terminator가 올바른 경계 확인 없이 고정·할당 buffer에 접근하는지 확인한다. prefix, alignment, padding, terminator 뒤 남는 공간을 다시 계산한다. source와 destination 용량을 모두 살피고 선언된 길이를 믿기 전에 짧은 입력을 읽는지도 확인한다.

**정수 overflow·underflow·절단·부호 혼동**
할당, 복사, loop, indexing, pointer 연산 전에 공격자 제어 산술을 살핀다. `b > a`인 `a - b`, `count * element_size`, 형식 최대값 근처의 덧셈, 음수의 unsigned 변환, 64-bit 길이를 32-bit 필드로 축소, `-1` sentinel이 큰 크기가 되는 경우가 자주 발생한다. 이후 실제로 쓰이는 검증된 표현이 무엇인지 확인한다.

**단위·pointer 깊이 혼동**
byte, element, code unit, page, word, wire 단위, 중첩 pointer element 크기를 섞어 쓰는지 본다. 파싱, 검증, 할당, API 경계, 복사에서 단위를 비교한다. 할당과 같은 잘못된 단위로 검사해도 경계 검사는 틀린 것이다.

**초기화되지 않거나 일부만 초기화된 데이터**
buffer, padding, struct field, vector capacity가 초기화되기 전에 반환·비교·hash·직렬화되거나 신뢰 경계를 넘는지 확인한다. 관찰 가능한 소비자와 현실적인 출력 길이를 입증해야 한다. stack 할당만으로 정보 노출이 성립하지 않는다.

## 수명·타입·동시성 공격 유형 (`subagent_type: general`)

**해제 후 사용·오래된 view·중복 해제**
callback, wait queue, timer, iterator, 빌린 slice, cache된 raw pointer가 계속 쓰는 동안 owner가 해제되는지 살핀다. 오류, 취소, 종료, 재할당 경로를 모두 본다. 내장 notification anchor는 모든 해제 경로가 observer를 비우거나 분리해야 한다.

**타입 혼동·잘못된 downcast**
tag, vtable, union discriminator, object 종류, 외부 handle 검사와 이후 읽는 표현이 서로 다른지 확인한다. 검사 없는 dynamic cast, 재사용 후 오래된 tag, 검증된 element와 실제 소비 element가 다른 직렬화 타입을 찾는다. 불변식 위반을 넘어서지 않고 로컬에서 잘못된 타입의 읽기·쓰기를 확인한다.

**Reference count·소유권 경쟁**
원자성이 없는 retain/release, 검사 뒤 lock 없이 사용, thread 간 소유권 불일치가 접근 중 객체를 해제하거나 변경하는지 확인한다. 빠른 경로, 오류, 종료, 호환성 경로의 lock·소유권 규칙을 비교한다.

**공유 상태 경쟁·TOCTOU**
동시 parser stream, 전역 cache, 지연 초기화, signal handler, 자원 해제가 앞서 확인한 경계·정책·pointer를 무효화하는지 살핀다. 반복 가능한 로컬 순서, barrier, thread sanitizer로 검증한다. 보안상 상태 변화가 없는 가정적 순서는 `needs_validation`이다.

**Lock 순서·교착·기아**
외부에서 호출 가능한 동작이 서로 다른 순서로 lock을 얻거나 callback·blocking I/O 중 lock을 유지하는지 본다. 제한된 입력으로 공유 작업이 멈출 때만 가용성 문제로 보고한다. 그렇지 않으면 동시성 결함으로 기록한다.

## FFI·ABI 공격 유형 (`subagent_type: general`)

**Pointer·길이·소유권 계약 불일치**
호출자와 피호출자가 buffer의 할당, 해제, 고정, 변경 주체, pointer 유효 기간, 길이 단위(byte 또는 element)를 다르게 이해하는지 확인한다. 모든 `extern`, CGo/JNI/Python/native binding, 생성 wrapper 양쪽을 추적한다. null, 길이 0, aliasing, callback 보존을 살핀다.

**Layout·alignment·enum 불일치**
architecture나 build flag에 따라 외부 코드가 받는 struct, bitfield, packed record, callback signature, 정수 폭, enum, calling convention이 달라지는지 확인한다. `repr`, packing, alignment, endianness, ABI별 타입을 검증한다. 저장소 안 선언 불일치는 로컬에서 확인 가능하지만 외부 구현이 불투명하면 `needs_validation`이다.

**Unwind·예외·thread affinity 위반**
unwind를 금지하는 ABI 경계를 예외·panic이 넘거나, 종료 후 callback이 실행되거나, 특정 runtime thread가 필요한 API가 다른 곳에서 호출되는지 살핀다. 오류 변환과 취소를 확인하고 영향을 정하기 전에 process 중단인지 상태 손상인지 검증한다.

## Binary loading·runtime 공격 유형 (`subagent_type: general`)

**Library·plugin·실행 파일 탐색 순서 신뢰**
권한 높은 process가 낮은 신뢰 주체가 쓸 수 있는 경로에서 library, plugin, runtime image, helper를 읽거나, 공격자 영향 working directory·환경에서 경로 없는 이름을 찾는지 확인한다. 의도된 설치 소유권과 fallback·호환성 탐색 경로를 비교한다. 사용자가 자기 process에 자기 plugin을 불러오는 것은 경계 위반이 아니다.

**Artifact ID·signature 결합 누락**
loader가 한 파일이나 metadata를 확인했지만 경로 해석, 파일 교체, architecture slice, 내장 resource가 검사에 결합되지 않아 다른 image를 mapping하는지 살핀다. 공급 경로의 진위는 `SUPPLY-CHAIN-AND-RELEASE.md`, 여기서는 로컬 검증과 mapping 사이의 불일치를 다룬다.

**잘못된 binary metadata·relocation 처리**
offset, 개수, section, relocation, symbol, bytecode, debug metadata를 범위·중첩·표현 검사 전에 신뢰하는지 확인한다. 제한된 로컬 fixture와 sanitizer로 parser를 시험한다. 메모리 손상과 안전하게 거부된 malformed 파일을 구별한다.

**JIT·생성 코드 일관성**
validator, interpreter, optimizer, 생성 코드가 타입, 경계, 부작용, 수명을 다르게 해석하는지 본다. 동일한 로컬 입력으로 최적화·비최적화 경로를 비교한다. process 무결성 영향이 있어야 한다. 언어 의미 안에서의 출력 차이는 취약점이 아니다.

**Unload·reload·종료 안전성**
살아 있는 function pointer, callback, worker thread, data view가 module unload나 runtime reset 뒤에도 남는지 확인한다. 시작 코드만큼 종료와 load 실패 정리도 자세히 본다.

## Kernel·권한 인터페이스 공격 유형 (`subagent_type: general`)

**User-copy 경계·반복 읽기**
syscall, ioctl, driver, kernel parser가 사용자 메모리에서 신뢰할 사실을 얻은 뒤 같은 변경 가능한 주소를 다시 읽는지 확인한다. 요청 전체를 한 번 복사하거나 나중 복사본을 재검증한다. 각 user-copy primitive의 크기, 방향, 접근 검사도 본다.

**권한 객체 수명주기·dispatch 일관성**
외부 접근 객체의 retain/release 불균형, observer를 정리하지 않는 teardown, 검사 없는 selector·table index, guard를 빠뜨린 중복 호환 경로를 찾는다. dispatch와 해제 경로를 나란히 비교한다.

**권한 확인이 부족한 강력한 인터페이스**
device node, admin socket, helper, 관리 API가 입력 형식만 확인하고 호출자의 리소스 권한은 검사하지 않는지 살핀다. 실제 인터페이스 소유권과 접근성을 확인한다. 저장소 밖 permission·sandbox 정책에 달렸다면 `needs_validation`이다.

## 공통 조사 방법

- 같은 source-to-sink 형태를 가진 수정 사항과 중복 경로를 점검한다. 한 caller, architecture, protocol 역할, feature flag, 호환 경로의 검사가 다른 경로까지 보호하지는 않는다.
- 모든 parser·FFI 경계에 대해 허용 길이·타입, 검사 표현, 할당 소유자, 소비자, thread, 종료 처리를 표로 만든다. 대부분 native 문제는 표 안의 불일치 하나로 드러난다.
- 기존 corpus와 작게 만든 경계 fixture를 사용한다. 정확한 sanitizer·runtime 출력과 이를 유발한 입력 속성을 남기고 대량 자원 소모나 실제 대상 실행은 피한다.

## 보고 전 검증 규칙

1. 현실적인 신뢰할 수 없는 진입점과 경계·타입·수명·ABI·동시성·loader·권한 불변식을 깨는 정확한 동작을 확인한다.
2. 잘못된 읽기·쓰기, 오래된 alias, 잘못된 object, 초기화되지 않은 출력, 권한 없는 image load, 교착, 안전한 process 종료 등 관찰된 효과를 분류한다. 관찰보다 강하게 주장하지 않는다.
3. 재현에 필요한 가장 좁은 로컬 harness, 기존 테스트, sanitizer, fuzzer를 사용한다. 오류 지점의 sanitizer 계측 여부와 architecture·build 조건을 기록한다.
4. 동시성은 결정론적 순서나 sanitizer trace를 쓴다. binary loading은 검사한 ID와 mapping한 ID가 다르고 낮은 신뢰 writer가 누구인지 입증한다.
5. 정확한 입력, 소스 경로, 관찰 결과가 있을 때만 `confirmed`다. 해결되지 않은 도달성·ABI·build·배포·runtime 사실과 필요한 제한 검사를 명시해 `needs_validation`으로 보고한다.
