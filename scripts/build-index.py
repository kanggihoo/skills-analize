#!/usr/bin/env python3
"""skill-explainers/ 아래 relations.md를 읽어 컬렉션 색인과 최상위 색인을 만든다.

사용법: scripts/build-index.py
끝에 색인 안의 상대 링크가 실제 파일을 가리키는지 확인하고, 깨진 링크가 있으면 종료 코드 1.
"""
import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "skill-explainers"
CSS = """
:root{--bg:#fff;--fg:#1d1d1f;--muted:#6e6e73;--line:#e5e5ea;--card:#f7f7f9;--link:#0a58ca}
@media (prefers-color-scheme:dark){:root{--bg:#141416;--fg:#ececef;--muted:#9a9aa1;--line:#2c2c31;--card:#1c1c20;--link:#7cb4ff}}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",sans-serif}
main{max-width:1100px;margin:0 auto;padding:32px 16px}
h1{font-size:26px;margin:0 0 4px}h2{font-size:19px;margin:32px 0 8px}
.muted{color:var(--muted)}a{color:var(--link)}code{font-size:13px}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px}
.card h3{margin:0 0 6px;font-size:16px}.card ul{margin:6px 0 0;padding-left:18px}
.wrap{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:14px}
th,td{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}
th{color:var(--muted);font-weight:600}
"""


def tables(md):
    """'## 제목' 아래의 마크다운 표들을 {제목: [행 dict...]}로 모은다."""
    out, section, header = {}, None, None
    for line in md.splitlines():
        if line.startswith("## "):
            section, header = line[3:].strip(), None
            continue
        if not line.startswith("|"):
            header = None
            continue
        cells = [c.strip() for c in re.split(r"(?<!\\)\|", line.strip())[1:-1]]
        if header is None:
            header = cells
        elif not set("".join(cells)) <= set("-: "):
            out.setdefault(section, []).append(dict(zip(header, cells)))
    return out


def page(title, body):
    return (f'<!doctype html><html lang="ko"><head><meta charset="utf-8">'
            f'<meta name="viewport" content="width=device-width,initial-scale=1">'
            f"<title>{html.escape(title)}</title><style>{CSS}</style></head>"
            f"<body><main>{body}</main></body></html>\n")


def esc(s):
    return html.escape(s).replace("`", "")


def skill_link(col_dir, path_id):
    rel = path_id.split("/", len(col_dir.relative_to(ROOT).parts))[-1]
    name = rel.rsplit("/", 1)[-1]
    target = col_dir / rel / f"{name}.html"
    return f"{rel}/{name}.html", target.exists(), name


def collection_index(ledger):
    col_dir = ledger.parent
    md = ledger.read_text()
    t = tables(md)
    commit = re.search(r"분석 커밋: (\S+)", md)
    skills = t.get("스킬", [])
    groups = t.get("묶음", [])
    # 관계 표는 ### 소제목마다 나뉘어 있어 '## 관계' 아래 모든 표를 다시 모은다.
    rel_block = md.split("## 관계", 1)[-1].split("\n## ", 1)[0]
    rels = [r for rows in tables("## 관계\n" + rel_block.replace("\n### ", "\n")).values() for r in rows if "rel-id" in r]

    summary = {s["경로 ID"]: s.get("한 줄 요약", "") for s in skills}

    def origin(path_id):
        """컬렉션과 스킬 이름 사이의 폴더(작성자 폴더). 없으면 빈 문자열."""
        mid = skill_link(col_dir, path_id)[0].split("/")[:-2]
        return "/".join(mid)

    def li(path_id):
        href, ok, name = skill_link(col_dir, path_id)
        link = f'<a href="{href}">{esc(name)}</a>' if ok else f'{esc(name)} <span class="muted">(페이지 없음)</span>'
        tip = f' <span class="muted">{esc(summary[path_id])}</span>' if summary.get(path_id) else ""
        return f"<li>{link}{tip}</li>"

    body = [f"<h1>{esc(col_dir.relative_to(ROOT).as_posix())} 스킬 분석</h1>",
            f'<p class="muted">스킬 {len(skills)}개 · 묶음 {len(groups)}개 · 분석 커밋 <code>{esc(commit[1][:7]) if commit else "?"}</code> · '
            f'<a href="{"../" * len(col_dir.relative_to(ROOT).parts)}index.html">전체 색인</a> · 관계 원장 <code>relations.md</code></p>']
    body.append('<h2>묶음</h2><div class="cards">')
    for g in groups:
        gid = g["group-id"]
        members = [s["경로 ID"] for s in skills if gid in [x.strip() for x in s.get("소속 묶음", "").split(",")]]
        gpage = col_dir / f"_group-{gid}" / f"{gid}.html"
        head = f'<a href="_group-{gid}/{gid}.html">{esc(gid)}</a>' if gpage.exists() else f"{esc(gid)} <span class='muted'>(묶음 페이지 없음)</span>"
        body.append(f'<div class="card"><h3>{head}</h3><div>{esc(g["작업 목표"])}</div><ul>{"".join(li(m) for m in members)}</ul></div>')
    body.append("</div>")
    alone = [s["경로 ID"] for s in skills if s.get("소속 묶음", "-") in ("-", "")]
    if alone:
        by_origin = {}
        for m in alone:
            by_origin.setdefault(origin(m), []).append(m)
        body.append('<h2>독립 스킬</h2><div class="cards">')
        for o, ms in by_origin.items():
            head = f"<h3>{esc(o)}</h3>" if o else ""
            body.append(f'<div class="card">{head}<ul>{"".join(li(m) for m in ms)}</ul></div>')
        body.append("</div>")
    has_origin = any(origin(s["경로 ID"]) for s in skills)
    cols = ["스킬"] + (["출처"] if has_origin else []) + ["한 줄 요약", "역할", "묶음", "원문 비교"]
    body.append('<h2>전체 스킬</h2><div class="wrap"><table><tr>' + "".join(f"<th>{c}</th>" for c in cols) + "</tr>")
    for s in skills:
        href, ok, name = skill_link(col_dir, s["경로 ID"])
        cells = [f'<a href="{href}">{esc(name)}</a>' if ok else esc(name)]
        cells += [esc(origin(s["경로 ID"]))] if has_origin else []
        cells += [esc(s.get(k, "")) for k in ("한 줄 요약", "역할", "소속 묶음", "원문 비교")]
        body.append("<tr>" + "".join(f"<td>{c}</td>" for c in cells) + "</tr>")
    body.append("</table></div>")
    for kind in ("같은 계열", "참고"):
        rows = [r for r in rels if r.get("종류") == kind]
        if not rows:
            continue
        body.append(f'<h2>{kind} 관계</h2><div class="wrap"><table><tr><th>rel-id</th><th>from</th><th>to</th><th>조건</th></tr>')
        for r in rows:
            cond = r.get("조건·강도·사용자 개입") or r.get("조건", "")
            body.append(f'<tr><td>{esc(r["rel-id"])}</td><td>{esc(r["from"])}</td><td>{esc(r["to"])}</td><td>{esc(cond)}</td></tr>')
        body.append("</table></div>")
    (col_dir / "index.html").write_text(page(f"{col_dir.name} 스킬 분석", "".join(body)))
    return col_dir, skills, groups


def main():
    cols = [collection_index(p) for p in sorted(ROOT.glob("**/relations.md"))]
    body = ["<h1>스킬 분석 색인</h1>", '<p class="muted">컬렉션마다 묶음 페이지와 스킬 페이지로 들어가는 입구다. 용어 기준은 <code>GLOSSARY.md</code>.</p>',
            '<h2>컬렉션</h2><div class="cards">']
    same = []
    for col_dir, skills, groups in cols:
        rel = col_dir.relative_to(ROOT).as_posix()
        body.append(f'<div class="card"><h3><a href="{rel}/index.html">{esc(rel)}</a></h3>스킬 {len(skills)}개 · 묶음 {len(groups)}개</div>')
        same += [(s["경로 ID"], s["원문 비교"]) for s in skills if s.get("원문 비교", "-") not in ("-", "")]
    body.append("</div>")
    if same:
        body.append('<h2>이름이 같은 스킬</h2><p class="muted">SKILL.md의 shasum 비교 결과다. 어느 쪽이 먼저인지는 근거가 있을 때만 원장에 적는다.</p>'
                    '<div class="wrap"><table><tr><th>분석한 경로</th><th>비교 결과</th></tr>')
        body += [f"<tr><td><code>{esc(p)}</code></td><td>{esc(c)}</td></tr>" for p, c in same]
        body.append("</table></div>")
    (ROOT / "index.html").write_text(page("스킬 분석 색인", "".join(body)))

    broken = []
    for idx in ROOT.glob("**/index.html"):
        for href in re.findall(r'href="([^"#:]+)"', idx.read_text()):
            if not (idx.parent / href).exists():
                broken.append(f"{idx.relative_to(ROOT)} -> {href}")
    print(f"색인 {len(cols) + 1}개 작성. 깨진 링크 {len(broken)}개")
    print("\n".join(broken))
    return 1 if broken else 0


if __name__ == "__main__":
    sys.exit(main())
