"""Add legacy robotics URL redirects after MkDocs has built its navigation."""

from __future__ import annotations

import json
from html import escape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
TOPIC_URL = "https://547540605.github.io/robotics-notes-site/force-control-and-compliant-assembly/"
REDIRECTS = {
    "index.html": "",
    "NISTIR-7901-Force-Control-Algorithms/index.html": "nistir-7901.html",
    "Robot-Force-Control-and-Compliant-Assembly-Learning-Path/index.html": "learning-path.html",
    "PI-Force-Control-Simulation.html": "PI-Force-Control-Simulation.html",
}


def main() -> None:
    if not (SITE / "Engineering" / "Robotics" / "index.html").is_file():
        raise SystemExit("Build the MkDocs site before adding legacy redirects.")

    legacy_dir = SITE / "Engineering" / "Robotics" / "Force-Control-and-Compliant-Assembly"
    for old_path, new_path in REDIRECTS.items():
        url = TOPIC_URL + new_path
        target = legacy_dir / old_path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(
            "<!doctype html>\n<html lang=\"zh-CN\"><head><meta charset=\"utf-8\">\n"
            f'<meta http-equiv="refresh" content="0; url={escape(url, quote=True)}">\n'
            f'<link rel="canonical" href="{escape(url, quote=True)}">\n'
            f"<script>window.location.replace({json.dumps(url)});</script>\n"
            "<title>内容已迁移</title></head><body>\n"
            f'<p>内容已迁至<a href="{escape(url, quote=True)}">机器人学专题</a>。</p>\n'
            "</body></html>\n",
            encoding="utf-8",
        )


if __name__ == "__main__":
    main()
