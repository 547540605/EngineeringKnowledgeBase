"""Fix unresolved links and MD source references in LearningLab HTML files."""

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEARNING_LAB = ROOT / "Engineering" / "Robotics" / "LearningLab"


def fix_archive_note_31():
    p = LEARNING_LAB / "archive" / "31-recursive-newton-euler-dynamics.html"
    if not p.exists():
        return
    text = p.read_text(encoding="utf-8")
    text = text.replace('href="index.html"', 'href="../00-progress.html"')
    text = text.replace('href="27-recursive-newton-euler-dynamics.html"', 'href="../27-recursive-newton-euler-dynamics.html"')
    text = text.replace('href="project-01-portable-4axis-robot.html"', 'href="../project-01-portable-4axis-robot.html"')
    p.write_text(text, encoding="utf-8")
    print("Fixed archive note 31 relative links.")


def fix_00_progress():
    p = LEARNING_LAB / "00-progress.html"
    if not p.exists():
        return
    text = p.read_text(encoding="utf-8")
    text = text.replace('href="ros2/04-13-engineering-roadmap.md"', 'href="ros2/04-13-engineering-roadmap/index.html"')
    text = text.replace('href="31-recursive-newton-euler-refactor-plan.md"', 'href="archive/31-recursive-newton-euler-refactor-plan/index.html"')
    p.write_text(text, encoding="utf-8")
    print("Fixed 00-progress.html links.")


def fix_ros2_pages():
    ros2_dir = LEARNING_LAB / "ros2"
    if not ros2_dir.exists():
        return
    
    # 00-progress.html
    p00 = ros2_dir / "00-progress.html"
    if p00.exists():
        text = p00.read_text(encoding="utf-8")
        text = text.replace('href="implementation-handoff.md"', 'href="implementation-handoff/index.html"')
        text = text.replace('href="04-13-engineering-roadmap.md"', 'href="04-13-engineering-roadmap/index.html"')
        text = text.replace('href="04-10-review-matrix.md"', 'href="04-10-review-matrix/index.html"')
        p00.write_text(text, encoding="utf-8")
        print("Fixed ros2/00-progress.html links.")

    # ros2 note files 04~20
    count = 0
    for f in ros2_dir.glob("*.html"):
        if f.name == "00-progress.html":
            continue
        text = f.read_text(encoding="utf-8")
        if "04-13-engineering-roadmap.md" in text:
            text = text.replace('href="04-13-engineering-roadmap.md"', 'href="04-13-engineering-roadmap/index.html"')
            f.write_text(text, encoding="utf-8")
            count += 1
    print(f"Fixed {count} ROS 2 note pages referencing 04-13-engineering-roadmap.md.")


def main():
    fix_archive_note_31()
    fix_00_progress()
    fix_ros2_pages()
    print("All link fixes applied successfully.")


if __name__ == "__main__":
    main()
