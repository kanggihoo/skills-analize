#!/usr/bin/env python3
"""lock 파일에 기록된 스킬을 최신본으로 가져와 저장소의 원래 폴더에 덮어쓴다.

사용법:
  scripts/update-skill.py <skills-lock.json> [스킬 이름 ...]   # 이름을 생략하면 lock 안의 스킬 전부
  scripts/update-skill.py --self-test

`npx skills update`는 에이전트 폴더(`.agents/skills/`)에만 쓰기 때문에 임시 폴더에서 실행하고,
받은 최신본을 이 저장소의 `<컬렉션>/<스킬>/`로 옮긴다. 비교는 끝에 출력하는 `git diff --stat`으로 한다.
원본이 바뀐 번역본(`*.KO.md` 등)은 지우지 않고 `*.stale.md`로 이름을 바꾼다.
"""
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip())
PRUNE = {".git", ".agents", ".claude", "node_modules", "skill-analysis", "skill-explainers", ".herdr-discuss"}
TRANSLATION = re.compile(r"^(?P<stem>.+?)(?P<suffix>[.-](?:KO|ko))(?P<stale>\.stale)?\.md$")


def is_translation(name):
    return TRANSLATION.match(name) is not None


def translations_of(path):
    """원본 파일 하나에 대응하는, 아직 stale 표시가 없는 번역본 경로들."""
    stem = path.name[: -len(".md")] if path.name.endswith(".md") else None
    if stem is None or not path.parent.is_dir():
        return []
    out = []
    for sibling in path.parent.iterdir():
        m = TRANSLATION.match(sibling.name)
        if m and m["stem"] == stem and not m["stale"]:
            out.append(sibling)
    return out


def stale_name(name):
    m = TRANSLATION.match(name)
    return f"{m['stem']}{m['suffix']}.stale.md"


def find_dest(lock_dir, name):
    hits = []
    for p in lock_dir.rglob("SKILL.md"):
        rel = p.relative_to(lock_dir).parts
        if p.parent.name == name and not PRUNE.intersection(rel):
            hits.append(p.parent)
    return hits


def files_of(folder):
    return {p.relative_to(folder): p for p in folder.rglob("*") if p.is_file()}


def sync(src, dest):
    """dest를 src와 같게 만든다(번역본은 보존). 바뀌거나 사라진 원본 파일 경로를 돌려준다."""
    new, old = files_of(src), files_of(dest)
    changed = []
    for rel, p in old.items():
        if rel not in new and not is_translation(p.name):
            p.unlink()
            changed.append(dest / rel)
    for rel, p in new.items():
        target = dest / rel
        if not target.exists() or target.read_bytes() != p.read_bytes():
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(p, target)
            changed.append(target)
    return changed


def main(lock_path, names):
    sys.stdout.reconfigure(line_buffering=True)
    lock_path = lock_path.resolve()
    lock_dir = lock_path.parent
    lock = json.loads(lock_path.read_text())
    entries = lock["skills"]
    names = names or list(entries)

    plan = {}
    for name in names:
        if name not in entries:
            print(f"[건너뜀] {name}: lock에 없음")
            continue
        hits = find_dest(lock_dir, name)
        if len(hits) != 1:
            where = ", ".join(str(h.relative_to(ROOT)) for h in hits) or "없음"
            print(f"[건너뜀] {name}: 스킬 폴더 후보 {len(hits)}개 ({where}). lock 항목이 낡았거나 위치가 모호함")
            continue
        plan[name] = hits[0]
    if not plan:
        return 1

    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        # 해시를 비워 두어 항상 원격 최신본을 내려받게 한다. 실제 변화 여부는 git diff가 판정한다.
        fake = {n: {**entries[n], "computedHash": "0"} for n in plan}
        (tmp / "skills-lock.json").write_text(json.dumps({"version": lock.get("version", 1), "skills": fake}))
        subprocess.run(["npx", "-y", "skills", "update", "-p", "-y"], cwd=tmp, check=False)
        fresh_lock = json.loads((tmp / "skills-lock.json").read_text())["skills"]

        stale, refreshed = [], []
        for name, dest in plan.items():
            src = next((p.parent for p in tmp.glob(f".*/skills/{name}/SKILL.md")), None)
            if src is None or fresh_lock.get(name, {}).get("computedHash") in (None, "0"):
                print(f"[실패] {name}: 최신본을 받지 못함")
                continue
            for path in sync(src, dest):
                for t in translations_of(path):
                    t.rename(t.with_name(stale_name(t.name)))
                    stale.append(t)
            entries[name]["computedHash"] = fresh_lock[name]["computedHash"]
            refreshed.append(dest)

    lock_path.write_text(json.dumps(lock, indent=2, ensure_ascii=False) + "\n")

    rels = [str(d.relative_to(ROOT)) for d in refreshed]
    print("\n== 기존 커밋과 비교 (git diff --stat)")
    subprocess.run(["git", "--no-pager", "diff", "--stat", "--", *rels, str(lock_path.relative_to(ROOT))], cwd=ROOT)
    status = subprocess.check_output(["git", "status", "--porcelain", "-uall", "--", *rels], cwd=ROOT, text=True)
    added = [line[3:] for line in status.splitlines() if line.startswith("??")]
    if added:
        print("새 파일:\n" + "\n".join(f"  {a}" for a in added))
    if stale:
        print("\n== 낡은 번역본으로 이름 변경")
        for t in stale:
            print(f"  {t.relative_to(ROOT)} -> {stale_name(t.name)}")

    changed = [line[3:] for line in status.splitlines()]
    touched = sorted({r for r in rels if any(c.startswith(r + "/") for c in changed)})
    redo = []
    for r in touched:
        if (ROOT / "skill-explainers" / r).exists():
            redo.append(f"skill-explainers/{r}/")
        for ledger in (ROOT / "skill-explainers").glob("**/relations.md"):
            if r in ledger.read_text():
                redo.append(f"{ledger.relative_to(ROOT)} (관계 재확인)")
    if redo:
        print("\n== 다시 만들어야 할 분석")
        for line in sorted(set(redo)):
            print(f"  {line}")
    print(f"\n바뀐 스킬 {len(touched)}개 / 확인한 스킬 {len(refreshed)}개. 커밋 여부는 diff를 보고 정한다.")
    return 0


def self_test():
    assert is_translation("SKILL.KO.md") and is_translation("README.ko.md") and is_translation("SKILL-KO.md")
    assert is_translation("SKILL.KO.stale.md") and not is_translation("SKILL.md") and not is_translation("ko.md")
    assert stale_name("SKILL.KO.md") == "SKILL.KO.stale.md"
    assert stale_name("SKILL-KO.md") == "SKILL-KO.stale.md"
    with tempfile.TemporaryDirectory() as d:
        d = Path(d)
        for n in ["SKILL.md", "SKILL.KO.md", "SKILL.KO.stale.md", "GUIDE.ko.md"]:
            (d / n).write_text("x")
        assert [p.name for p in translations_of(d / "SKILL.md")] == ["SKILL.KO.md"]
        src, dest = d / "src", d / "dest"
        (src / "references").mkdir(parents=True)
        dest.mkdir()
        (src / "SKILL.md").write_text("new")
        (src / "references" / "a.md").write_text("a")
        (dest / "SKILL.md").write_text("old")
        (dest / "SKILL.KO.md").write_text("번역")
        (dest / "gone.md").write_text("g")
        changed = {p.name for p in sync(src, dest)}
        assert changed == {"SKILL.md", "a.md", "gone.md"}, changed
        assert (dest / "SKILL.KO.md").exists() and not (dest / "gone.md").exists()
    print("self-test ok")


if __name__ == "__main__":
    if sys.argv[1:] == ["--self-test"]:
        self_test()
    elif len(sys.argv) >= 2:
        sys.exit(main(Path(sys.argv[1]), sys.argv[2:]))
    else:
        print(__doc__)
        sys.exit(2)
