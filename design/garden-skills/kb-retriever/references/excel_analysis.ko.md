# Excel 데이터 분석

> ⚠️ **이 문서를 사용하기 전에** 실제 Excel 데이터를 분석하기 전에 읽어 올바른 pandas 분석 방법을 확인하세요. 데이터를 읽는 방법은 먼저 `excel_reading.md`에서 확인합니다.

pandas를 사용한 일반적인 Excel 데이터 분석 작업입니다.

## 빠른 참조

| 작업 | 일반적인 방법 | 코드 예시 |
|---|---|---|
| 조건으로 필터링 | 불리언 인덱싱 | `df[df['sales'] > 10000]` |
| 그룹별 집계 | groupby | `df.groupby('region')['sales'].sum()` |
| 정렬 | sort_values | `df.sort_values('sales', ascending=False)` |
| 새 열 계산 | 직접 할당 | `df['profit'] = df['revenue'] - df['cost']` |
| 통계 요약 | describe | `df.describe()` |

## 그룹별 집계(GroupBy)

```python
import pandas as pd

df = pd.read_excel("sales.xlsx")

# 열별로 그룹화하고 집계
sales_by_region = df.groupby("region")["sales"].sum()
print(sales_by_region)

# 여러 열로 그룹화하고 여러 통계 집계
result = df.groupby(["region", "product"]).agg({
    "sales": "sum",
    "quantity": "count",
    "price": "mean"
})
```

## 데이터 필터링

```python
# 조건에 맞는 행 필터링
high_sales = df[df["sales"] > 10000]

# 여러 조건으로 필터링
filtered = df[(df["sales"] > 10000) & (df["region"] == "North")]

# isin을 사용한 필터링
selected = df[df["product"].isin(["A", "B", "C"])]
```

## 파생 지표 계산

```python
# 새 열 계산
df["profit_margin"] = (df["revenue"] - df["cost"]) / df["revenue"]

# 백분율 계산
df["growth_rate"] = (df["current"] - df["previous"]) / df["previous"] * 100

# 누적 합계
df["cumulative_sales"] = df["sales"].cumsum()
```

## 정렬

```python
# 단일 열로 정렬
df_sorted = df.sort_values("sales", ascending=False)

# 여러 열로 정렬
df_sorted = df.sort_values(["region", "sales"], ascending=[True, False])
```

## 피벗 테이블

```python
# 피벗 테이블 생성
pivot = pd.pivot_table(
    df,
    values="sales",
    index="region",
    columns="product",
    aggfunc="sum",
    fill_value=0
)

print(pivot)
```

## 통계 분석

```python
# 기본 통계
print(df.describe())

# 특정 열 통계
print(df["sales"].mean())
print(df["sales"].median())
print(df["sales"].std())

# 빈도 집계
print(df["category"].value_counts())
```

## 데이터 병합

```python
# DataFrame 여러 개를 세로로 병합
combined = pd.concat([df1, df2], ignore_index=True)

# 공통 열을 기준으로 병합(SQL JOIN과 유사)
merged = pd.merge(sales, customers, on="customer_id", how="left")
```

## 데이터 정리

```python
# 중복 행 제거
df = df.drop_duplicates()

# 결측값 처리
df = df.fillna(0)  # 0으로 채움
df = df.dropna()   # 결측값이 포함된 행 제거

# 공백 제거
df["name"] = df["name"].str.strip()

# 자료형 변환
df["date"] = pd.to_datetime(df["date"])
df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
```
