# Databricks 분석 및 시스템 테이블

## 이 소스에 담긴 것

Databricks는 제품 분석, 데이터 파이프라인, 웨어하우스 텔레메트리 계층입니다. Datadog을 보완합니다. Datadog은 *인프라/런타임* 관점이고, Databricks는 *제품/데이터* 관점입니다(사용자가 무엇을 했는지, 어떤 실험이 돌았는지, 기능 사용이 어떻게 변해 왔는지, 임계값 상수가 어디서 왔는지).

- **제품 분석 이벤트.** `your_warehouse.events.analytics_track_event`(원본)과 `<your_analytics_db>.<schema>.<table>`에 있는 타입이 지정되고 중복이 제거된 이벤트별 dbt 모델. 사용자 행동: 기능 호출, 클릭, 수락/거절, 제출, 클라이언트가 보고한 에러.
- **사용량 및 과금 이벤트.** `your_warehouse.events.usage_event` / `<your_analytics_db>.<schema>.stg_usage_events`, `your_warehouse.events.raw_model_event` / `<your_analytics_db>.<schema>.stg_raw_model_events`. 비용이나 볼륨에 따른 결정에 사용합니다.
- **실험 / feature flag 데이터.** 노출(exposure) 및 결과 테이블. **스키마는 회사마다 다릅니다.** 이름을 가정하기 전에 `SHOW TABLES`로 살펴보십시오.
- **시스템 테이블.** `system.query.history`, `system.compute.warehouses`, `system.billing.*`, `system.access.audit`. "이 쿼리가 비쌌는가?", "누군가 이것을 얼마나 자주 실행했는가?", "웨어하우스 부하가 언제 치솟았는가?"에 답합니다.
- **dbt 계보(lineage).** `<your_analytics_db>.<schema>`의 모델은 어떤 파이프라인이 테이블/필드에 의존하는지 보여 줍니다. 상위 변경은 종종 하위 코드 변경의 동기가 됩니다.
- **Databricks 노트북.** 코드 변경 전에 엔지니어가 작성한 탐색 분석. **SQL MCP로는 조회할 수 없습니다.** 근거가 노트북에 있다고 의심된다면 공백으로 명시하십시오.

## 검색 방법

Databricks SQL MCP를 사용하십시오. 기본 도구는 `execute_sql_read_only`입니다. `statement_id`가 반환되면 다시 실행하지 말고 `poll_sql_result`로 폴링하십시오.

**쿼리 전에 방향을 잡으십시오.** 스키마는 회사마다 다릅니다. 테이블 이름을 믿기 전에 살펴보십시오.

```sql
SHOW TABLES IN <your_analytics_db>.<schema> LIKE '*<keyword>*';
DESCRIBE TABLE <your_analytics_db>.<schema>.stg_<event>;
```

**모든 쿼리의 시간을 제한하십시오.** 이 테이블들은 매우 크고, 제약 없는 스캔은 타임아웃됩니다. 출시일을 둘러싼 창으로 `_timestamp`(이벤트) 또는 `start_time`(`system.query.history`)으로 필터링하십시오. 보통 출시 전후 약 30일이며, 강한 이유가 있을 때만 넓히십시오.

**원본 테이블보다 타입이 지정된 dbt 모델을 선호하십시오.** `<your_analytics_db>.<schema>.<table>`은 중복이 제거되고, 타입이 지정되고, liquid clustering이 적용되어 있습니다. `your_warehouse.events.analytics_track_event`에는 중복이 있고 `properties_json`은 타입이 없습니다. 모델 이름 패턴은 `stg_<source>_<event_name_with_underscores>`이며, 여기서 `<source>`는 `app`, `backend`, `website`, `cli` 중 하나입니다. 패턴만으로 해결되지 않으면 `SHOW TABLES`로 정확한 모델 이름을 확인하십시오. 원본 테이블은 dbt 모델이 아직 없거나, dbt 새로 고침 지연 구간의 이벤트가 필요할 때만 사용하십시오.

**타입이 지정된 dbt 모델의 열 규칙**(알아 두면 `DESCRIBE` 왕복을 피할 수 있습니다):

- `_timestamp`, `_id`, `_auth_id`, `_request_id`, `event_name`. 모든 모델의 표준 열
- `properties_<name>`. 타입이 지정되고 밑줄 표기로 바뀐 이벤트 속성(`properties_entrypoint`, `properties_size_bytes`, …)
- `context_team_id`, `context_client_version`, `context_country`, `context_client_os`. 미리 추출된 클라이언트 맥락

### 자주 효과를 보는 조사 패턴

대상에 맞는 테이블 + 열 조합을 고르십시오.

1. **이벤트 사용 궤적.** PR 머지 전후 ±30일 창에서 관련 `stg_*` 모델의 일별 개수. 머지 후 하루나 이틀 안에 0에서 안정적인 볼륨으로 바뀌는 계단 함수는 PR이 기능을 출시했다는 강한 정황 증거입니다. 0으로 감소하면 폐기나 삭제를 시사합니다.
2. **가드레일 / 방어 검사의 기원.** PR 이전 14일 동안 관련 `properties_<name>` 열의 분포(중앙값 / p99 / 최댓값). 대상의 임계 상수와 맞는 p99는 그 숫자가 데이터에서 선택되었음을 시사합니다.
3. **실험 / feature flag 조회.** `SHOW TABLES ... LIKE '*experiment*'`로 노출 테이블을 찾고, PR 날짜 근처에서 관련 flag 키의 변형별 노출 개수를 가져오십시오.
4. **마이그레이션, 백필, 성능 재작성을 위한 쿼리 이력 증거.** 좁은 `start_time` 창으로 `statement_text ILIKE '%<table_or_symbol>%'`에 필터링한 `system.query.history`는 변경을 촉발했을 가능성이 있는 비싼 쿼리를 드러냅니다(`total_duration_ms`로 정렬하거나 `SUM(read_bytes)`, `COUNT(*)`를 집계).
5. **dbt 계보.** 대상이 `<your_analytics_db>.<schema>` 모델에서 읽거나 쓴다면, 그 모델의 자체 git 이력(이 저장소 안)이 종종 근거를 담고 있습니다. 그 단서는 직접 쫓지 말고 소스 컨트롤 investigator에게 넘기십시오.

## 좋은 증거의 모습

위의 패턴 형태 외에:

- 에러 분류 이벤트의 개수가 방어 코드 PR 이후 며칠 안에 거의 0으로 떨어짐. PR이 그 에러 종류를 해결했음을 시사
- 실험 노출 테이블 행이 출시일 무렵 "shipped" / "concluded" 결정과 함께 대상의 feature flag 키를 명시함

## 흔한 함정

- **계측됨 ≠ 원인.** 이벤트가 존재한다는 것은 누군가 그것을 기록할 만큼 신경 썼다는 뜻이지, 대상 코드가 그 때문에 존재한다는 뜻이 아닙니다. 인과를 주장하기 전에 소스 컨트롤 investigator의 PR/커밋 인용과 짝지으십시오.
- **조용한 계측 변경.** 이벤트 볼륨의 계단 함수는 사용자 행동이 바뀌었다는 뜻이 아니라 새 이벤트가 기록되기 시작했다는 뜻일 수 있습니다. 증가를 기능 출시 신호로 읽기 전에, 같은 창에 계측 PR이 있는지 확인하십시오.
- **스키마 드리프트.** 이벤트 속성은 진화합니다. 오늘 타입이 지정된 dbt 모델의 열은 대상이 작성되었을 때 존재하지 않았을 수 있습니다. 오래된 데이터는 속성을 원본 `properties_json` 안에만 담고 있을 수 있습니다.
- **dbt 새로 고침 지연.** `<your_analytics_db>.<schema>.*`은 일정(보통 시간별/일별)에 따라 다시 빌드됩니다. 최근 몇 시간의 이벤트는 `your_warehouse.events.*`로 대체하고 `_id`로 중복을 제거하십시오.
- **회사 고유 테이블.** 실험, feature flag, 과금, 사용량 테이블은 다양합니다. 존재를 확인하지 않은 테이블에서 결과를 보고하는 것은 전형적인 실패 모드입니다. 먼저 `SHOW TABLES` / `DESCRIBE TABLE`로 확인하십시오.
- **보존 절벽(Retention cliff).** 관련 창이 테이블의 보존 기간이나 dbt 모델 생성일보다 앞선다면, 그것은 null 결과가 아니라 *공백*입니다. synthesizer가 "결과 없음"을 "활동 없음"으로 읽지 않도록 명시적으로 이름 붙이십시오.
- **노트북은 조회할 수 없습니다.** SQL MCP는 Databricks 노트북을 볼 수 없습니다. 근거가 노트북에 있다고 의심되면 공백을 반환하십시오.

## 반환할 내용

관련 있는 발견마다:
- 유형(제품 이벤트 / 실험 노출 / 사용량 또는 과금 이벤트 / 시스템 테이블 행 / dbt 모델)
- 완전한 테이블 이름과 실행한 정확한 쿼리
- 조회한 시간 창
- 간결한 숫자 요약(개수, 백분위수, 최초/최종 관측 타임스탬프). **원시 행을 덤프하지 마십시오.**
- 대상의 출시일과의 시간적 상관(예: "첫 행 2024-08-15, PR #49074는 2024-08-14에 머지됨")
- 관련성 + 강도: 직접 / 정황 / 약함
