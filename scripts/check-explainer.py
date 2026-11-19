#!/usr/bin/env python3
"""스킬 explainer와 번역본을 점검한다. archify finalize가 하지 않는 일만 맡는다.

사용법:
  scripts/check-explainer.py links <html ...>
      `page:` 링크(<a class="page-link">)가 같은 폴더의 실제 파일을 가리키는지 본다.
      archify는 파일 존재를 검사하지 않는다. 없는 대상이 있으면 종료 코드 1.

  scripts/check-explainer.py style <archify.md ...>
      한국어 문장에 섞인 영어 단어 + 조사를 찾아 `파일:행: 일치` 형식으로 경고한다.
      archify의 writing 검사는 영어·중국어 규칙만 있어 "subject를 고정한다"처럼
      한국어로 쓸 수 있는 말을 영어로 남긴 문장을 잡지 못한다. 코드 블록, 백틱 안,
      링크 대상은 제외한다. commit을, PR에서 같은 개발 용어는 그대로 두는 것이 맞으므로
      경고는 사람이 문맥으로 판단한다. 종료 코드는 항상 0.

  scripts/check-explainer.py ko-lines <원본.md ...>
      같은 폴더의 번역본(<이름>.KO.md 또는 <이름>.ko.md)이 원본과 줄 수가 같은지 본다.
      번역은 줄 단위로 대응해야 `@source lines=a:b`를 번역본에 그대로 쓸 수 있다.
      줄 수가 다른 번역본이 있으면 종료 코드 1.

  scripts/check-explainer.py ko-sources <archify.md ...>
      원고의 `@source ... path=<원본>.md`마다 줄 수가 같은 번역본이 있으면 path를
      번역본으로 바꿔 파일을 고쳐 쓴다. 번역본이 없거나 줄 수가 다르면 원본을 두고 보고한다.
      finalize는 commit된 파일을 읽으므로 commit되지 않은 번역본도 보고한다.
"""
import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent


def links(files):
    bad = 0
    for f in map(Path, files):
        for href in re.findall(r'class="page-link" href="([^"]+)"', f.read_text()):
            if not (f.parent / href).exists():
                print(f"MISSING {f} -> {href}")
                bad = 1
    return bad


PARTICLE = re.compile(r"[A-Za-z][A-Za-z -]{2,}(을|를|이|가|은|는|에|의|로|으로|와|과|에서|하는|한다|했다)(?=[\s.,)]|$)")


def style(files):
    for f in map(Path, files):
        text = re.sub(r"```.*?```", lambda m: "\n" * m[0].count("\n"), f.read_text(), flags=re.S)
        for i, line in enumerate(text.splitlines(), 1):
            line = re.sub(r"`[^`]*`", "", line)
            line = re.sub(r"\]\([^)]*\)", "]", line)
            hits = [m[0] for m in PARTICLE.finditer(line)]
            if hits:
                print(f"{f}:{i}: {' | '.join(hits)}")
    return 0


def translation(orig):
    """원본 옆의 번역본 경로. 없으면 None."""
    # 디렉터리 목록으로 정확한 이름을 찾는다. macOS는 대소문자를 구분하지 않아 exists()가
    # SKILL.ko.md를 SKILL.KO.md로도 찾아 주지만, git과 finalize는 실제 이름만 안다.
    names = set(p.name for p in orig.parent.iterdir())
    for suffix in (".KO.md", ".ko.md"):
        name = orig.name[: -len(".md")] + suffix
        if name in names:
            return orig.with_name(name)
    return None


def line_count(p):
    return len(p.read_text().splitlines())


def ko_lines(files):
    bad = 0
    for orig in map(Path, files):
        ko = translation(orig)
        if ko is None:
            print(f"번역본 없음 {orig}")
        elif line_count(ko) != line_count(orig):
            print(f"줄 수 다름 {ko}: 원본 {line_count(orig)}, 번역본 {line_count(ko)}")
            bad = 1
    return bad


def tracked(p):
    rel = p.resolve().relative_to(REPO)
    return subprocess.run(["git", "-C", str(REPO), "ls-files", "--error-unmatch", str(rel)],
                          capture_output=True).returncode == 0


def ko_sources(files):
    for f in map(Path, files):
        text = f.read_text()

        def swap(m):
            orig = REPO / m[2]
            if not orig.name.endswith(".md") or ".KO." in orig.name or ".ko." in orig.name:
                return m[0]
            ko = translation(orig) if orig.exists() else None
            if ko is None:
                return m[0]
            if line_count(ko) != line_count(orig):
                print(f"원본 유지(줄 수 다름) {m[2]}")
                return m[0]
            if not tracked(ko):
                print(f"commit되지 않음 {ko.relative_to(REPO)}: finalize 전에 commit해야 한다")
            return m[1] + ko.relative_to(REPO).as_posix()

        new = re.sub(r"^(@source .*?\bpath=)(\S+)", swap, text, flags=re.M)
        if new != text:
            f.write_text(new)
            print(f"바꿈 {f}")
    return 0


COMMANDS = {"links": links, "style": style, "ko-lines": ko_lines, "ko-sources": ko_sources}

if __name__ == "__main__":
    if len(sys.argv) < 3 or sys.argv[1] not in COMMANDS:
        sys.exit(__doc__)
    sys.exit(COMMANDS[sys.argv[1]](sys.argv[2:]))
