# Excel 파일 읽기

> ⚠️ **이 문서를 사용하기 전에** 실제 Excel 파일을 처리하기 전에 읽어 올바른 pandas 읽기 방법을 확인하세요. `excel_analysis.md`도 함께 참고해야 합니다.

pandas를 사용해 Excel 파일을 읽는 핵심 방법입니다.

## 빠른 시작

**가장 흔한 읽기 방식**:

```python
import pandas as pd

# 첫 번째 워크시트 또는 지정한 워크시트 읽기
df = pd.read_excel("data.xlsx", sheet_name="Sheet1")

# 구조 확인을 위해 앞의 몇 행만 읽기
df_preview = pd.read_excel("data.xlsx", nrows=10)

# 필요한 열만 읽어 성능 향상
df = pd.read_excel("data.xlsx", usecols=["열1", "열2", "열3"])
```

## 워크시트 하나 읽기

```python
import pandas as pd

# 지정한 워크시트 읽기
df = pd.read_excel("data.xlsx", sheet_name="Sheet1")

# 처음 몇 행 보기
print(df.head())

# 기본 통계 정보
print(df.describe())
```

## 통합 문서의 모든 워크시트 읽기

```python
import pandas as pd

# 모든 워크시트 읽기
excel_file = pd.ExcelFile("workbook.xlsx")

for sheet_name in excel_file.sheet_names:
    df = pd.read_excel(excel_file, sheet_name=sheet_name)
    print(f"\n{sheet_name}:")
    print(df.head())
```

## 특정 열 읽기

```python
import pandas as pd

# 지정한 열만 읽어 성능 향상
df = pd.read_excel("data.xlsx", usecols=["column1", "column2", "column3"])
```

## 성능 최적화 옵션

- `usecols`를 사용해 필요한 열만 읽습니다.
- `dtype` 매개변수로 열 유형을 지정해 읽기 속도를 높입니다.
- 파일 형식에 맞는 엔진을 선택합니다: `engine='openpyxl'` 또는 `engine='xlrd'`.

## 대용량 파일 처리

매우 큰 Excel 파일은 한 번에 전부 읽지 않습니다.

- `nrows` 매개변수로 읽을 행 수를 제한합니다.
- 먼저 앞부분 몇 행을 읽어 데이터 구조를 파악합니다.
- 필요한 데이터만 나누어 처리합니다.
