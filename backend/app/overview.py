"""Progress overview: streak, activity calendar, per-lesson progress, spaced-repetition reviews, common mistakes."""

import json
import os
from collections import defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from .db import get_db
from .models import Attempt, Lesson, MockAttempt, SectionProgress, SpeakingAttempt

router = APIRouter(prefix="/api", tags=["overview"])

CONTENT_DIR = Path(os.environ.get("CONTENT_DIR", "/content"))
TZ = ZoneInfo(os.environ.get("APP_TZ", "Asia/Ho_Chi_Minh"))
REVIEW_DAYS = [1, 3, 7, 14, 30]  # after the lesson test is first finished
LESSON_SECTIONS = ["vocab", "grammar", "dialogue", "practice", "quiz", "test"]


def local_day(ts: datetime) -> date:
    return ts.astimezone(TZ).date()


def today() -> date:
    return datetime.now(TZ).date()


def review_schedule(learned: date, activity: list[date], now: date) -> list[dict]:
    """Each review step is due REVIEW_DAYS[i] days after `learned`; it counts as done by the first activity on that
    lesson on or after its due date (and after the previous step was done)."""
    steps = []
    after = learned
    for i, offset in enumerate(REVIEW_DAYS):
        due = learned + timedelta(days=offset)
        done_on = next((d for d in activity if d >= due and d > after), None)
        if done_on is None:
            steps.append({"step": i + 1, "due": due.isoformat(), "done_on": None, "status": "due" if due <= now else "upcoming"})
            break
        steps.append({"step": i + 1, "due": due.isoformat(), "done_on": done_on.isoformat(), "status": "done"})
        after = done_on
    return steps


def streak(days: set[date], now: date) -> int:
    start = now if now in days else now - timedelta(days=1)
    n = 0
    while start - timedelta(days=n) in days:
        n += 1
    return n


@router.get("/curriculum")
def curriculum(db: Session = Depends(get_db)):
    """The 40-lesson roadmap: curriculum.json plus how much content each lesson has."""
    items = json.loads((CONTENT_DIR / "curriculum.json").read_text(encoding="utf-8"))
    lessons = {(l.level, l.number): l for l in db.scalars(select(Lesson))}
    out = []
    for item in items:
        lesson = lessons.get((item["level"], item["number"]))
        c = (lesson.content or {}) if lesson else {}
        out.append({
            **item,
            "id": lesson.id if lesson else None,
            "available": bool(c.get("vocab")),
            "vocab_count": len(c.get("vocab", [])),
            "extra_count": len(c.get("extra_vocab", [])),
            "objectives": c.get("objectives", []),
        })
    return out


@router.get("/overview")
def overview(db: Session = Depends(get_db)):
    now = today()
    lessons = db.scalars(select(Lesson).order_by(Lesson.level, Lesson.number)).all()
    progress = db.scalars(select(SectionProgress)).all()
    attempts = db.scalars(select(Attempt).options(selectinload(Attempt.answers))).all()
    speaking = db.scalars(select(SpeakingAttempt)).all()
    mocks = db.scalars(select(MockAttempt)).all()

    activity: dict[int, set[date]] = defaultdict(set)
    calendar: dict[date, int] = defaultdict(int)
    for p in progress:
        activity[p.lesson_id].add(local_day(p.completed_at))
        calendar[local_day(p.completed_at)] += 1
    for a in attempts:
        activity[a.lesson_id].add(local_day(a.created_at))
        calendar[local_day(a.created_at)] += 1
    for s in speaking:
        activity[s.lesson_id].add(local_day(s.created_at))
        calendar[local_day(s.created_at)] += 1
    for m in mocks:
        calendar[local_day(m.created_at)] += 1

    by_lesson_progress: dict[int, dict[str, SectionProgress]] = defaultdict(dict)
    for p in progress:
        by_lesson_progress[p.lesson_id][p.section] = p
    best_speaking: dict[int, int] = {}
    for s in speaking:
        best_speaking[s.lesson_id] = max(best_speaking.get(s.lesson_id, 0), s.overall)

    rows, reviews_due, upcoming = [], [], []
    words_learned = 0
    for lesson in lessons:
        c = lesson.content or {}
        secs = by_lesson_progress.get(lesson.id, {})
        days = sorted(activity.get(lesson.id, set()))
        test = secs.get("test")
        learned = local_day(test.completed_at) if test else None
        schedule = review_schedule(learned, days, now) if learned else []
        if "vocab" in secs:
            words_learned += len(c.get("vocab", []))
        row = {
            "id": lesson.id,
            "level": lesson.level,
            "number": lesson.number,
            "title_zh": lesson.title_zh,
            "title_vi": lesson.title_vi,
            "available": bool(c.get("vocab")),
            "done": [s for s in LESSON_SECTIONS if s in secs],
            "scores": {k: v.best_score for k, v in secs.items() if v.best_score is not None},
            "speaking_best": best_speaking.get(lesson.id),
            "last_activity": days[-1].isoformat() if days else None,
            "learned_on": learned.isoformat() if learned else None,
            "reviews": schedule,
        }
        rows.append(row)
        pending = next((s for s in schedule if s["status"] != "done"), None)
        if pending:
            item = {"lesson_id": lesson.id, "level": lesson.level, "number": lesson.number, "title_zh": lesson.title_zh,
                    "title_vi": lesson.title_vi, **pending}
            if pending["status"] == "due":
                item["overdue_days"] = (now - date.fromisoformat(pending["due"])).days
                reviews_due.append(item)
            elif date.fromisoformat(pending["due"]) <= now + timedelta(days=7):
                upcoming.append(item)

    wrong: dict[tuple[int, str], list[int]] = defaultdict(lambda: [0, 0])
    for a in attempts:
        for ans in a.answers:
            if ans.tag and ans.tag not in ("vocab", "reading", "listening"):
                wrong[(a.lesson_id, ans.tag)][0] += 1
                wrong[(a.lesson_id, ans.tag)][1] += 0 if ans.is_correct else 1
    titles = {l.id: (l.level, l.number) for l in lessons}
    mistakes = sorted(
        ({"lesson_id": lid, "level": titles[lid][0], "number": titles[lid][1], "tag": tag, "total": t, "wrong": w}
         for (lid, tag), (t, w) in wrong.items() if w > 0 and lid in titles),
        key=lambda r: (-r["wrong"], -r["total"]),
    )[:10]

    test_scores = [r["scores"]["test"] for r in rows if "test" in r["scores"]]
    all_days = set(calendar)
    return {
        "today": now.isoformat(),
        "streak": streak(all_days, now),
        "active_days": len(all_days),
        "calendar": [{"date": (now - timedelta(days=i)).isoformat(), "count": calendar.get(now - timedelta(days=i), 0)} for i in range(34, -1, -1)],
        "totals": {
            "lessons_available": sum(1 for r in rows if r["available"]),
            "lessons_started": sum(1 for r in rows if r["done"] or r["last_activity"]),
            "lessons_finished": sum(1 for r in rows if len(r["done"]) == len(LESSON_SECTIONS)),
            "words_learned": words_learned,
            "tests_taken": sum(1 for a in attempts if a.kind == "test"),
            "avg_test": round(sum(test_scores) / len(test_scores)) if test_scores else None,
            "speaking_attempts": len(speaking),
            "mock_best": {str(lv): max((m.score for m in mocks if m.level == lv), default=None) for lv in (3, 4)},
        },
        "lessons": rows,
        "reviews_due": sorted(reviews_due, key=lambda r: -r["overdue_days"]),
        "reviews_upcoming": sorted(upcoming, key=lambda r: r["due"]),
        "mistakes": mistakes,
    }
