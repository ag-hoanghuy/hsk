import json
import logging
import os
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Lesson

CONTENT_DIR = Path(os.environ.get("CONTENT_DIR", "/content"))
log = logging.getLogger("seed")


def _get_or_create(db: Session, level: int, number: int) -> Lesson:
    lesson = db.scalar(select(Lesson).where(Lesson.level == level, Lesson.number == number))
    if lesson is None:
        lesson = Lesson(level=level, number=number, title_zh="", title_vi="", content={})
        db.add(lesson)
    return lesson


def seed_lessons(db: Session) -> tuple[int, int]:
    """Upsert the curriculum (titles, grammar points) then the per-lesson content files.
    Returns (lessons in curriculum, lessons with content)."""
    curriculum = json.loads((CONTENT_DIR / "curriculum.json").read_text(encoding="utf-8"))
    for item in curriculum:
        lesson = _get_or_create(db, item["level"], item["number"])
        lesson.title_zh = item["title_zh"]
        lesson.title_vi = item["title_vi"]
        lesson.grammar_points = item.get("grammar_points", [])

    with_content = 0
    for path in sorted(CONTENT_DIR.glob("hsk*/lesson-*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc:  # a file being edited must not stop the app from starting
            log.warning("skipping %s: %s", path, exc)
            continue
        lesson = _get_or_create(db, data["level"], data["number"])
        lesson.summary = data.get("summary", "")
        lesson.content = data.get("content", {})
        with_content += 1
    db.commit()
    return len(curriculum), with_content
