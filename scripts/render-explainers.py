#!/usr/bin/env python3
"""explainer 원고(*.archify.md)를 HTML로 만든다. HTML은 git에 넣지 않으므로 clone한 뒤나 원고를 고친 뒤 이것을 돌린다.

사용법: scripts/render-explainers.py [경로 ...]
  경로는 폴더나 원고 파일이다. 생략하면 skill-explainers/ 전체.
  원고 이름에서 출력 이름을 정한다.
    <폴더>/candidate.archify.md       → <폴더>/<폴더 이름>.html   (_group-<id> 폴더는 <id>.html)
    <폴더>/detail-<id>.archify.md     → <폴더>/<폴더 이름>.<id>.html
  archify CLI는 ARCHIFY_BIN 환경 변수, 없으면 ~/.agents/skills/archify/bin/archify.mjs.
  원고의 `@meta repo_revision`이 고정한 commit에서 원문을 읽으므로 같은 원고는 같은 인용을 낸다.
  끝나면 색인은 scripts/build-index.py로 따로 만든다. 실패한 원고가 있으면 종료 코드 1.
"""
import json
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
ARCHIFY = os.environ.get("ARCHIFY_BIN", str(Path.home() / ".agents/skills/archify/bin/archify.mjs"))


def output_for(md):
    name = md.parent.name.removeprefix("_group-")
    if md.name == "candidate.archify.md":
        return md.parent / f"{name}.html"
    return md.parent / f"{name}.{md.name[len('detail-'):-len('.archify.md')]}.html"


def render(md):
    r = subprocess.run(["node", ARCHIFY, "finalize", "explainer", str(md), str(output_for(md)),
                        "--repo-root", str(REPO), "--json"], capture_output=True, text=True)
    try:
        d = json.loads(r.stdout)
        ok = d.get("status") == "pass"
        why = "; ".join(x.get("message", "") for x in d.get("diagnostics", []))[:300]
    except json.JSONDecodeError:
        ok, why = False, (r.stderr or r.stdout)[:300]
    return md, ok, why


def main(args):
    roots = [Path(a).resolve() for a in args] or [REPO / "skill-explainers"]
    drafts = sorted({p for r in roots for p in ([r] if r.is_file() else r.glob("**/*.archify.md"))
                     if p.name == "candidate.archify.md" or p.name.startswith("detail-")})
    # 같은 폴더의 원고를 동시에 렌더하면 archify delivery lock이 충돌한다. 폴더끼리만 병렬로 돌린다.
    folders = {}
    for md in drafts:
        folders.setdefault(md.parent, []).append(md)
    failed = []
    with ThreadPoolExecutor(max_workers=os.cpu_count() or 4) as pool:
        for results in pool.map(lambda mds: [render(m) for m in mds], folders.values()):
            for md, ok, why in results:
                if not ok:
                    failed.append(md)
                    print(f"FAIL {md}: {why}")
    print(f"원고 {len(drafts)}개 중 {len(drafts) - len(failed)}개 통과")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
