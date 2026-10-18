---
name: content-hash-cache-pattern
description: SHA-256 콘텐츠 해시를 사용해 비싼 파일 처리 결과를 캐시합니다. 경로와 무관하고, 내용이 바뀌면 자동으로 무효화되며, 서비스 계층이 분리되어 있습니다. 반복적인 파일 처리가 느리고, 결과를 경로가 아닌 내용 기준으로 캐시하고 무효화하고 싶을 때 사용합니다.
metadata:
  origin: ECC
---

# 콘텐츠 해시 파일 캐시 패턴

비용이 큰 파일 처리 결과(PDF 파싱, 텍스트 추출, 이미지 분석)를 SHA-256 콘텐츠 해시를 캐시 키로 사용해 저장합니다. 경로 기반 캐싱과 달리, 이 방식은 파일 이동이나 이름 변경 후에도 유지되며 내용이 바뀌면 자동으로 무효화됩니다.

## 활성화 시점

- 파일 처리 파이프라인(PDF, 이미지, 텍스트 추출)을 만들 때
- 처리 비용이 높고 같은 파일을 반복해서 처리할 때
- `--cache/--no-cache` CLI 옵션이 필요할 때
- 기존 순수 함수를 수정하지 않고 캐싱을 추가하고 싶을 때

## 핵심 패턴

### 1. 콘텐츠 해시 기반 캐시 키

경로가 아니라 파일 내용을 캐시 키로 사용합니다.

```python
import hashlib
from pathlib import Path

_HASH_CHUNK_SIZE = 65536  # 큰 파일을 위해 64KB 단위로 읽기

def compute_file_hash(path: Path) -> str:
    """파일 내용의 SHA-256 (큰 파일을 위해 청크 단위로 처리)."""
    if not path.is_file():
        raise FileNotFoundError(f"File not found: {path}")
    sha256 = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(_HASH_CHUNK_SIZE)
            if not chunk:
                break
            sha256.update(chunk)
    return sha256.hexdigest()
```

**왜 콘텐츠 해시인가?** 파일 이름 변경이나 이동은 캐시 적중이 됩니다. 내용이 바뀌면 자동으로 무효화됩니다. 별도의 인덱스 파일이 필요 없습니다.

### 2. 캐시 항목용 frozen dataclass

```python
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class CacheEntry:
    file_hash: str
    source_path: str
    document: ExtractedDocument  # 캐시된 결과
```

### 3. 파일 기반 캐시 저장소

각 캐시 항목은 `{hash}.json`으로 저장됩니다. 해시로 O(1) 조회가 가능하며, 인덱스 파일이 필요 없습니다.

```python
import json
from typing import Any

def write_cache(cache_dir: Path, entry: CacheEntry) -> None:
    cache_dir.mkdir(parents=True, exist_ok=True)
    cache_file = cache_dir / f"{entry.file_hash}.json"
    data = serialize_entry(entry)
    cache_file.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")

def read_cache(cache_dir: Path, file_hash: str) -> CacheEntry | None:
    cache_file = cache_dir / f"{file_hash}.json"
    if not cache_file.is_file():
        return None
    try:
        raw = cache_file.read_text(encoding="utf-8")
        data = json.loads(raw)
        return deserialize_entry(data)
    except (json.JSONDecodeError, ValueError, KeyError):
        return None  # 손상된 항목은 캐시 미스로 처리
```

### 4. 서비스 계층 래퍼 (SRP)

처리 함수는 순수하게 유지합니다. 캐싱은 별도의 서비스 계층으로 추가합니다.

```python
def extract_with_cache(
    file_path: Path,
    *,
    cache_enabled: bool = True,
    cache_dir: Path = Path(".cache"),
) -> ExtractedDocument:
    """서비스 계층: 캐시 확인 -> 추출 -> 캐시 기록."""
    if not cache_enabled:
        return extract_text(file_path)  # 순수 함수, 캐시를 모름

    file_hash = compute_file_hash(file_path)

    # 캐시 확인
    cached = read_cache(cache_dir, file_hash)
    if cached is not None:
        logger.info("Cache hit: %s (hash=%s)", file_path.name, file_hash[:12])
        return cached.document

    # 캐시 미스 -> 추출 -> 저장
    logger.info("Cache miss: %s (hash=%s)", file_path.name, file_hash[:12])
    doc = extract_text(file_path)
    entry = CacheEntry(file_hash=file_hash, source_path=str(file_path), document=doc)
    write_cache(cache_dir, entry)
    return doc
```

## 주요 설계 결정

| 결정 | 근거 |
|------|------|
| SHA-256 콘텐츠 해시 | 경로와 무관하며, 내용이 바뀌면 자동으로 무효화됨 |
| `{hash}.json` 파일 이름 | O(1) 조회, 인덱스 파일 불필요 |
| 서비스 계층 래퍼 | SRP: 추출은 순수하게 유지되고, 캐시는 별개의 관심사 |
| 수동 JSON 직렬화 | frozen dataclass 직렬화를 완전히 제어 |
| 손상 시 `None` 반환 | 우아한 성능 저하, 다음 실행에서 다시 처리 |
| `cache_dir.mkdir(parents=True)` | 첫 쓰기 시점에 디렉터리를 지연 생성 |

## 모범 사례

- **경로가 아니라 내용을 해시하십시오.** 경로는 바뀌지만 내용의 정체성은 그대로입니다.
- **큰 파일은 청크 단위로 해시하십시오.** 파일 전체를 메모리에 올리지 마십시오.
- **처리 함수는 순수하게 유지하십시오.** 캐싱에 대해 아무것도 알지 않아야 합니다.
- **캐시 적중/미스를 로그에 남기십시오.** 디버깅을 위해 해시는 줄여서 기록합니다.
- **손상을 우아하게 처리하십시오.** 잘못된 캐시 항목은 미스로 취급하고, 절대 충돌시키지 마십시오.

## 피해야 할 안티 패턴

```python
# 나쁨: 경로 기반 캐싱 (파일 이동/이름 변경 시 깨짐)
cache = {"/path/to/file.pdf": result}

# 나쁨: 처리 함수 내부에 캐시 로직 추가 (SRP 위반)
def extract_text(path, *, cache_enabled=False, cache_dir=None):
    if cache_enabled:  # 이제 이 함수는 두 가지 책임을 가짐
        ...

# 나쁨: 중첩된 frozen dataclass에 dataclasses.asdict() 사용
# (복잡한 중첩 타입에서 문제를 일으킬 수 있음)
data = dataclasses.asdict(entry)  # 대신 수동 직렬화를 사용하십시오
```

## 사용 시점

- 파일 처리 파이프라인(PDF 파싱, OCR, 텍스트 추출, 이미지 분석)
- `--cache/--no-cache` 옵션이 도움이 되는 CLI 도구
- 같은 파일이 여러 실행에 걸쳐 나타나는 배치 처리
- 기존 순수 함수를 수정하지 않고 캐싱을 추가할 때

## 사용하지 말아야 할 때

- 항상 최신이어야 하는 데이터(실시간 피드)
- 매우 큰 캐시 항목(대신 스트리밍을 고려하십시오)
- 파일 내용 이외의 파라미터에 의존하는 결과(예: 서로 다른 추출 설정)
