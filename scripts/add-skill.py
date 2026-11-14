#!/usr/bin/env python3
"""GitHub 저장소의 스킬을 받아 새 컬렉션 폴더로 초기화한다.

사용법:
  scripts/add-skill.py <owner/repo> [컬렉션 이름]   # 이름을 생략하면 repo 이름
  scripts/add-skill.py --self-test

`npx skills add`는 에이전트 폴더(`.claude/skills/`)에만 쓰기 때문에 임시 폴더에서 실행하고,
받은 스킬을 `<컬렉션>/<스킬>/`로 옮긴 뒤 lock을 `<컬렉션>/skills-lock.json`으로 둔다.
컬렉션 폴더가 이미 있으면 멈춘다(기존 스킬 갱신은 update-skill.py).
"""
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip())


def collection_name(repo):
    return repo.rstrip("/").removesuffix(".git").split("/")[-1]


def main(repo, name):
    dest = ROOT / name
    if dest.exists():
        print(f"[중단] {name}/ 가 이미 있음. 갱신은 scripts/update-skill.py {name}/skills-lock.json")
        return 1
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        # ponytail: 에이전트를 claude-code로 고정. 다른 에이전트 폴더는 이 저장소에 필요 없음.
        subprocess.run(["npx", "-y", "skills", "add", repo, "--skill", "*", "-a", "claude-code", "-y"], cwd=tmp, check=True)
        skills = sorted(p for p in (tmp / ".claude" / "skills").iterdir() if (p / "SKILL.md").is_file())
        if not skills:
            print("[중단] 받은 스킬이 없음")
            return 1
        dest.mkdir()
        for s in skills:
            shutil.copytree(s, dest / s.name)
        lock = json.loads((tmp / "skills-lock.json").read_text())
        (dest / "skills-lock.json").write_text(json.dumps(lock, indent=2, ensure_ascii=False) + "\n")

    print(f"{name}/ 에 스킬 {len(skills)}개 + skills-lock.json 생성")
    for s in skills:
        print(f"  {s.name}")
    # 같은 이름의 스킬이 다른 컬렉션에 있으면 알린다.
    for s in skills:
        for p in ROOT.glob(f"*/**/{s.name}/SKILL.md"):
            rel = p.relative_to(ROOT)
            if rel.parts[0] not in {name, "skill-analysis", "document-skills-analysis", "skill-explainers", ".agents", ".claude"}:
                print(f"[동명 스킬] {s.name}: {rel.parent}")
    return 0


def self_test():
    assert collection_name("openai/codex-security") == "codex-security"
    assert collection_name("https://github.com/openai/codex-security.git") == "codex-security"
    print("self-test ok")


if __name__ == "__main__":
    if sys.argv[1:] == ["--self-test"]:
        self_test()
    elif len(sys.argv) in (2, 3):
        sys.exit(main(sys.argv[1], sys.argv[2] if len(sys.argv) == 3 else collection_name(sys.argv[1])))
    else:
        print(__doc__)
        sys.exit(2)
