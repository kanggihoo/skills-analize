# Datadog 텔레메트리

## 이 소스에 담긴 것

Datadog은 런타임 기록을 담습니다. 계획되었거나 논의되었던 것이 아니라 프로덕션에서 실제로 일어난 일입니다.

- **메트릭.** 팀이 계측한 카운터, 게이지, 히스토그램. 메트릭이 *존재한다는 사실* 자체가 증거입니다. 누군가 이 숫자를 지켜볼 가치가 있다고 생각한 것입니다.
- **모니터와 알림.** 팀이 누군가를 깨울 만하다고 판단한 조건. `rate_limit_hit > 10/min`에서 울리는 모니터는 팀이 그 임계값을 걱정했다는 직접 증거입니다.
- **대시보드.** 큐레이션된 뷰. 차트는 팀이 한 서브시스템에서 무엇을 중요하게 여기는지 보여 줍니다.
- **APM 트레이스와 스팬.** 요청 단위의 런타임 데이터. "왜 이렇게 느린가" / "왜 여기에 타임아웃이 있는가" 질문에 유용합니다.
- **로그.** 대량의 이벤트 기록. 방어 코드를 동기 부여한 에러 조건이 종종 담겨 있습니다.
- **인시던트.** 타임라인과 연결된 사후 분석이 있는 공식 인시던트 기록.
- **노트북.** 탐색적 조사. 가설과 분석이 종종 담겨 있습니다.

Datadog은 "이 코드가 작성되었을 무렵의 프로덕션 현실은 무엇이었는가?"에 답하며, 이것이 종종 코드의 모양을 설명해 줍니다.

## 검색 방법

Datadog MCP를 사용하십시오. 넓게 시작해서 좁히십시오.

1. **담당 서비스를 식별하십시오.**

   ```
   search_datadog_services (filter by name or team)
   search_datadog_service_dependencies (see upstream/downstream)
   ```

2. **대시보드와 모니터를 먼저 보십시오. 팀이 무엇을 신경 쓰는지 알려 줍니다.**

   ```
   search_datadog_dashboards (query: feature name, service name, symbol)
   search_datadog_monitors   (same queries)
   ```

   대시보드나 모니터가 대상을 다루면 그 쿼리와 감시 임계값을 기록하십시오. 임계값은 "왜 N으로 clamp되어 있는가?"에 대한 답인 경우가 많습니다.

3. **대상 주변의 메트릭.**

   ```
   search_datadog_metrics (by name pattern, e.g., the feature or symbol)
   get_datadog_metric_context (metadata: description, units, tags)
   get_datadog_metric (timeseries; "was there a spike around the PR date?")
   ```

   메트릭의 추세를 대상의 추가/변경 날짜와 상관시키는 것은 강한 보조 증거입니다. 예: "`payment_timeout` 메트릭이 2023-11-03에 급증했고, 재시도 로직은 2023-11-06에 머지되었다."

4. **로그. 좁히고, 덤프하지 마십시오.**

   ```
   search_datadog_logs (raw log patterns near the target, set use_log_patterns=true)
   analyze_datadog_logs (SQL-style aggregations, only when you need counts)
   ```

   심볼, 에러 문자열, 기능 이름으로 검색하십시오. **시간을 제한한 쿼리를 강력히 선호하십시오**(예: 변경 전후 30일). 로그 볼륨은 엄청납니다. 제약 없는 검색은 시간을 낭비하고 타임아웃될 수 있습니다.

5. **APM 스팬과 트레이스.**

   ```
   aggregate_spans    (stats: "how often does this endpoint fail?")
   search_datadog_spans (inspect individual spans)
   get_datadog_trace  (a specific trace ID)
   ```

   타임아웃, 재시도, 느린 경로, 서비스 간 동작에 유용합니다.

6. **인시던트.**

   ```
   search_datadog_incidents (by title, team, date range)
   get_datadog_incident     (full detail for a specific incident)
   ```

   대상이 방어적으로 보이면 추가된 시점 무렵의 인시던트를 검색하십시오. 타임라인에 "X에 대한 방어 검사 추가"가 포함된 인시던트는 거의 직접 증거입니다.

## 좋은 증거의 모습

- 모니터의 쿼리와 임계값이 코드가 강제하는 제약과 일치함(코드는 100으로 clamp, 모니터는 요청이 100/min을 넘으면 알림)
- 대상의 작성자가 만든 대시보드이며, 위젯이 코드가 측정하거나 막는 것과 일치함
- 변경 직전에 프로덕션 급증을 보였고 그 이후 값이 안정된 메트릭
- 대상 코드, 같은 심볼, 또는 같은 에러 문자열을 참조하는 인시던트 기록
- 방어 코드가 막을 특정 에러 패턴을 보여 주며, 변경 이전 창에 타임스탬프가 찍힌 로그

## 흔한 함정

- **상관관계는 인과가 아닙니다.** PR 이전의 급증과 이후의 안정화는 시사적이지 결정적이지 않습니다. 같은 창에 다른 변경이 들어갔을 수 있습니다. 인접한 PR을 확인하십시오.
- **발견한 차트에 과적합하기.** Datadog 시각화는 사람이 *만든* 것이며 그 사람의 프레이밍을 반영합니다. "retry success rate"라는 차트는 팀이 재시도 성공에 관심이 있었다는 증거이지, 특정 코드 줄이 존재하는 이유라는 증거가 아닙니다.
- **사라진 텔레메트리.** 메트릭은 이름이 바뀌거나, 삭제되거나, 보존 기간이 짧을 수 있습니다. 관련 창의 데이터를 찾을 수 없다면 그것은 null 결과가 아니라 공백입니다.
- **규모에서의 노이즈.** 흔한 문자열로 로그를 검색하면 수천 건이 나옵니다. 서비스, 태그, 시간으로 공격적으로 좁히십시오. 원시 로그를 덤프하기보다 `analyze_datadog_logs`로 집계하십시오.
- **계측됨 != 원인.** 메트릭의 존재는 누군가 무언가를 측정할 만큼 신경 썼다는 뜻이지, 코드가 그 때문에 추가되었다는 뜻이 아닙니다. 커밋/PR 날짜와 교차 확인하십시오.

## 반환할 내용

관련 있는 항목마다:
- 유형(대시보드 / 모니터 / 메트릭 / 로그 패턴 / 트레이스 / 인시던트 / 노트북)
- 제목 또는 이름
- 링크 또는 식별자(대시보드 ID, 모니터 ID, 메트릭 이름, 인시던트 ID)
- 소유자/작성자와 생성/수정 날짜
- 질문과 관련된 특정 조건, 쿼리, 또는 인용(가능하면 원문 그대로)
- 관련성: 이것이 대상 코드에 대해 무엇을 시사하는지, 그리고 연결이 얼마나 강한지
