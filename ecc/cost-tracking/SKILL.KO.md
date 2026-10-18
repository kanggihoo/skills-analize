---
name: cost-tracking
description: ECC 비용 추적기의 로컬 메트릭 로그를 바탕으로 Claude Code 토큰 사용량, 지출, 예산을 추적하고 보고한다. 비용, 지출, 사용량, 토큰, 예산, 또는 모델·세션·날짜별 비용 내역을 사용자가 물을 때 사용.
metadata:
  origin: community
---

# 비용 추적

ECC의 `stop:cost-tracker` 훅이 기록하는 메트릭 로그를 바탕으로 Claude Code의 비용 및 사용량 이력을 분석할 때 이 스킬을 사용한다.

## 데이터 위치

추적기는 세션이 종료될 때마다 JSON 객체 한 줄을 `~/.claude/metrics/costs.jsonl`에 추가한다. 각 행은 **해당 세션의 누적 스냅샷**이므로, 총 지출을 구하려면 `session_id`별로 **가장 최신 행**을 취한 뒤 세션 간에 합산해야 한다 — 모든 행을 더하면 중복 계산된다.

ECC는 런타임 훅이 모든 이력을 다시 스캔하지 않고 현재 세션 합계를 읽을 수 있도록, `~/.claude/metrics/cost-snapshots/` 아래에 세션별 내부 파일도 관리한다. 이 파일들은 다시 만들 수 있는 캐시로 취급한다. 각 스냅샷은 바이트 커서를 저장하므로 새로 추가된 행만 스캔한다. 안정적인 읽기는 O(1)이고, 갱신은 새로 추가된 바이트 수에 비례한다(O(새 바이트)). 오래된 항목은 30일이 지나거나 디렉터리가 512개 세션을 넘으면 정리된다. 콜드 캐치업 작업은 훅 호출 한 번당 16 MiB로 제한되며, 종료되지 않은 1 MiB를 넘는 잘못된 행은 재개 가능한 커서와 함께 버려진다. 보고서와 내보내기는 계속 `costs.jsonl`을 사용해야 한다.

행 스키마:

| 필드 | 의미 |
| --- | --- |
| `timestamp` | 스냅샷의 ISO 타임스탬프 |
| `session_id` | Claude Code 세션 식별자 |
| `transcript_path` | 세션 트랜스크립트 경로 |
| `model` | 사용된 모델 |
| `input_tokens` / `output_tokens` | 토큰 수 |
| `cache_write_tokens` / `cache_read_tokens` | 프롬프트 캐시 토큰 수 |
| `estimated_cost_usd` | 세션의 사전 계산된 누적 비용(USD) |

직접 가격을 계산하기보다 `estimated_cost_usd`를 우선 사용한다 — 모델 가격과 캐시 가격은 바뀌며, 추적기가 정답의 출처다.

## 사용 시점

- 사용자가 "지금까지 얼마나 썼지?", "이 세션은 얼마나 들었지?", "토큰을 얼마나 썼지?"라고 물을 때
- 사용자가 예산, 지출 한도, 초과, 비용 통제를 언급할 때
- 사용자가 모델, 세션, 날짜별 비용 내역이나 CSV 내보내기를 원할 때

## 동작 방식

먼저 로그가 있는지 확인한다(추적기는 JSONL로 기록하므로 `sqlite3`이 아니라 `node`를 사용한다 — `node`는 크로스 플랫폼이다):

```bash
node -e 'const fs=require("fs"),os=require("os"),p=require("path");const f=p.join(os.homedir(),".claude","metrics","costs.jsonl");console.log(fs.existsSync(f)?"cost log found":"cost log not found: "+f)'
```

로그가 없으면 사용량 데이터를 지어내지 않는다. 비용 추적은 `stop:cost-tracker` 훅이 활성화된 상태에서 첫 세션이 끝나야 채워진다고 사용자에게 알린다.

## 예시 — 요약, 모델별, 최근 7일

```bash
node -e '
const fs=require("fs"),os=require("os"),path=require("path");
const f=path.join(os.homedir(),".claude","metrics","costs.jsonl");
if(!fs.existsSync(f)){console.log("cost log not found: "+f);process.exit(0);}
const rows=fs.readFileSync(f,"utf8").split(/\r?\n/).filter(Boolean).map(l=>{try{return JSON.parse(l)}catch{return null}}).filter(Boolean);
const bySession=new Map();
for(const r of rows){const k=r.session_id||r.transcript_path||r.timestamp;const p=bySession.get(k);if(!p||String(r.timestamp)>String(p.timestamp))bySession.set(k,r);}
const latest=[...bySession.values()];
const cost=r=>Number(r.estimated_cost_usd)||0, day=r=>String(r.timestamp||"").slice(0,10), sum=a=>a.reduce((s,r)=>s+cost(r),0), f4=n=>"$"+n.toFixed(4);
const today=new Date().toISOString().slice(0,10), yest=new Date(Date.now()-864e5).toISOString().slice(0,10);
console.log("today: "+f4(sum(latest.filter(r=>day(r)===today)))+" | yesterday: "+f4(sum(latest.filter(r=>day(r)===yest)))+" | total: "+f4(sum(latest))+" ("+latest.length+" sessions)");
const m=new Map();for(const r of latest){const k=r.model||"(unknown)";m.set(k,(m.get(k)||0)+cost(r));}
console.log("by model:");[...m.entries()].sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log("  "+f4(v)+"  "+k));
'
```

세션별 상세 조회나 CSV 내보내기는 같은 `latest` 집합을 순회하거나(CSV는 원시 행을 순회), 필요한 필드를 출력하면 된다.

## 보고 지침

비용 데이터를 제시할 때는 오늘 지출과 어제 지출의 비교, 모든 세션의 총액, 모델별 내역, 세션 수를 포함한다. 1달러 미만 금액은 소수점 넷째 자리까지, 그 이상은 소수점 둘째 자리까지 표시한다.

## 안티패턴

- 모든 행을 합산하지 않는다 — 행은 세션별 누적값이므로, 먼저 `session_id`별 최신 행으로 줄인다.
- `estimated_cost_usd`가 있는데 원시 토큰 수로 비용을 추정하지 않는다.
- 로그가 존재한다고 가정하지 말고 반드시 확인한다.
- 사용자에게 보여주는 답변에 현재 모델 가격을 하드코딩하지 않는다.
- 임의의 코드를 실행하는 검토되지 않은 훅이나 플러그인 설치를 권하지 않는다.

## 관련 항목

- `/cost-report` - 같은 메트릭 로그를 대상으로 하는 명령 형태의 보고서.
- `cost-aware-llm-pipeline` - 모델 라우팅 및 예산 설계 패턴.
- `token-budget-advisor` - 컨텍스트 및 토큰 예산 계획.
- `strategic-compact` - 반복되는 토큰 지출을 줄이기 위한 컨텍스트 압축.
