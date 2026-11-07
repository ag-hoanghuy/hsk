import os
from collections import defaultdict
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Literal

from alembic import command
from alembic.config import Config
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from . import mock, overview, speaking, strokes, tts
from .db import SessionLocal, get_db
from .models import Attempt, AttemptAnswer, Lesson, SectionProgress
from .seed import seed_lessons
from .speech.asr import engine as speech_engine

BACKEND_DIR = Path(__file__).resolve().parent.parent
AUDIO_DIR = Path(os.environ.get("AUDIO_DIR", "/audio"))
SECTIONS = {"vocab", "grammar", "dialogue", "practice", "quiz", "test", "listening", "reading", "speaking", "writing"}
AttemptKind = Literal["quiz_vocab", "quiz_grammar", "test", "listening", "reading"]


def run_migrations() -> None:
    cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND_DIR / "migrations"))
    command.upgrade(cfg, "head")


@asynccontextmanager
async def lifespan(app: FastAPI):
    run_migrations()
    with SessionLocal() as db:
        total, with_content = seed_lessons(db)
    print(f"Seeded {total} lessons ({with_content} with content)")
    speech_engine.start()  # loads (and the first time downloads) the speech model in the background
    yield


app = FastAPI(title="HSK Web API", lifespan=lifespan)
AUDIO_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/audio", StaticFiles(directory=AUDIO_DIR), name="audio")
app.include_router(speaking.router)
app.include_router(overview.router)
app.include_router(mock.router)
app.include_router(strokes.router)


def lesson_summary(lesson: Lesson) -> dict:
    return {
        "id": lesson.id,
        "level": lesson.level,
        "number": lesson.number,
        "title_zh": lesson.title_zh,
        "title_vi": lesson.title_vi,
        "summary": lesson.summary,
        "grammar_points": lesson.grammar_points or [],
        "available": bool((lesson.content or {}).get("vocab")),
        # Content sections that exist for this lesson (e.g. "reading"), so pages can list only usable lessons.
        "has": sorted(k for k, v in (lesson.content or {}).items() if v),
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/admin/reload-content")
def reload_content(db: Session = Depends(get_db)):
    """Re-read content/ into the database (after editing lesson files) without restarting the backend."""
    total, with_content = seed_lessons(db)
    return {"lessons": total, "with_content": with_content}


@app.get("/api/lessons")
def list_lessons(level: int | None = None, db: Session = Depends(get_db)):
    stmt = select(Lesson).order_by(Lesson.level, Lesson.number)
    if level is not None:
        stmt = stmt.where(Lesson.level == level)
    return [lesson_summary(lesson) for lesson in db.scalars(stmt)]


@app.get("/api/lessons/{lesson_id}")
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.get(Lesson, lesson_id)
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {**lesson_summary(lesson), "content": lesson.content}


# ---- section progress -------------------------------------------------------------------------


class ProgressIn(BaseModel):
    lesson_id: int
    section: str
    score: int | None = None


def progress_row(p: SectionProgress) -> dict:
    return {
        "lesson_id": p.lesson_id,
        "section": p.section,
        "best_score": p.best_score,
        "completed_at": p.completed_at.isoformat(),
    }


@app.get("/api/progress")
def list_progress(lesson_id: int | None = None, db: Session = Depends(get_db)):
    stmt = select(SectionProgress)
    if lesson_id is not None:
        stmt = stmt.where(SectionProgress.lesson_id == lesson_id)
    return [progress_row(p) for p in db.scalars(stmt)]


@app.post("/api/progress")
def save_progress(body: ProgressIn, db: Session = Depends(get_db)):
    if body.section not in SECTIONS:
        raise HTTPException(status_code=422, detail=f"section must be one of {sorted(SECTIONS)}")
    if db.get(Lesson, body.lesson_id) is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    row = db.scalar(
        select(SectionProgress).where(
            SectionProgress.lesson_id == body.lesson_id, SectionProgress.section == body.section
        )
    )
    if row is None:
        row = SectionProgress(lesson_id=body.lesson_id, section=body.section, best_score=body.score)
        db.add(row)
    elif body.score is not None:
        row.best_score = max(row.best_score or 0, body.score)
    db.commit()
    db.refresh(row)
    return progress_row(row)


# ---- quiz / test attempts ---------------------------------------------------------------------


class AnswerIn(BaseModel):
    question_id: str
    qtype: str
    tag: str = ""
    user_answer: Any = None
    is_correct: bool


class AttemptIn(BaseModel):
    lesson_id: int
    kind: AttemptKind
    answers: list[AnswerIn]
    points: int | None = None
    streak_max: int | None = None


def answer_row(a: AttemptAnswer) -> dict:
    return {
        "question_id": a.question_id,
        "qtype": a.qtype,
        "tag": a.tag,
        "user_answer": a.user_answer,
        "is_correct": a.is_correct,
        "overridden": a.overridden,
    }


def attempt_row(a: Attempt, with_answers: bool = False) -> dict:
    row = {
        "id": a.id,
        "lesson_id": a.lesson_id,
        "kind": a.kind,
        "correct": a.correct,
        "total": a.total,
        "score": a.score,
        "extra": a.extra or {},
        "created_at": a.created_at.isoformat(),
    }
    if with_answers:
        row["answers"] = [answer_row(x) for x in a.answers]
    return row


def recompute(a: Attempt) -> None:
    a.correct = sum(1 for x in a.answers if x.is_correct)
    a.total = len(a.answers)
    a.score = round(100 * a.correct / a.total) if a.total else 0


@app.post("/api/attempts")
def create_attempt(body: AttemptIn, db: Session = Depends(get_db)):
    if db.get(Lesson, body.lesson_id) is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    if not body.answers:
        raise HTTPException(status_code=422, detail="answers must not be empty")
    extra = {k: v for k, v in {"points": body.points, "streak_max": body.streak_max}.items() if v is not None}
    attempt = Attempt(lesson_id=body.lesson_id, kind=body.kind, correct=0, total=0, score=0, extra=extra)
    attempt.answers = [AttemptAnswer(**a.model_dump()) for a in body.answers]
    recompute(attempt)
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt_row(attempt, with_answers=True)


@app.get("/api/attempts")
def list_attempts(
    lesson_id: int | None = None, kind: AttemptKind | None = None, limit: int = 20, db: Session = Depends(get_db)
):
    stmt = select(Attempt).order_by(Attempt.created_at.desc(), Attempt.id.desc()).limit(limit)
    if lesson_id is not None:
        stmt = stmt.where(Attempt.lesson_id == lesson_id)
    if kind is not None:
        stmt = stmt.where(Attempt.kind == kind)
    return [attempt_row(a) for a in db.scalars(stmt)]


def load_attempt(db: Session, attempt_id: int) -> Attempt:
    attempt = db.scalar(select(Attempt).where(Attempt.id == attempt_id).options(selectinload(Attempt.answers)))
    if attempt is None:
        raise HTTPException(status_code=404, detail="Attempt not found")
    return attempt


@app.get("/api/attempts/{attempt_id}")
def get_attempt(attempt_id: int, db: Session = Depends(get_db)):
    return attempt_row(load_attempt(db, attempt_id), with_answers=True)


@app.post("/api/attempts/{attempt_id}/answers/{question_id}/accept")
def accept_answer(attempt_id: int, question_id: str, db: Session = Depends(get_db)):
    """Count a free-text answer as correct (the learner disagrees with the automatic grading)."""
    attempt = load_attempt(db, attempt_id)
    answer = next((x for x in attempt.answers if x.question_id == question_id), None)
    if answer is None:
        raise HTTPException(status_code=404, detail="Answer not found")
    answer.is_correct = True
    answer.overridden = True
    recompute(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt_row(attempt, with_answers=True)


@app.get("/api/stats/errors")
def error_stats(lesson_id: int | None = None, kind: AttemptKind | None = None, db: Session = Depends(get_db)):
    """Wrong-answer counts grouped by tag (vocab word / grammar point) and by question type."""
    stmt = select(Attempt).options(selectinload(Attempt.answers))
    if lesson_id is not None:
        stmt = stmt.where(Attempt.lesson_id == lesson_id)
    if kind is not None:
        stmt = stmt.where(Attempt.kind == kind)
    attempts = db.scalars(stmt).all()

    by_tag: dict[str, list[int]] = defaultdict(lambda: [0, 0])
    by_type: dict[str, list[int]] = defaultdict(lambda: [0, 0])
    for attempt in attempts:
        for a in attempt.answers:
            for table, key in ((by_tag, a.tag), (by_type, a.qtype)):
                if key:
                    table[key][0] += 1
                    table[key][1] += 0 if a.is_correct else 1

    def rows(table: dict[str, list[int]]) -> list[dict]:
        items = [{"key": k, "total": t, "wrong": w} for k, (t, w) in table.items()]
        return sorted(items, key=lambda r: (-r["wrong"], -r["total"], r["key"]))

    return {"attempts": len(attempts), "by_tag": rows(by_tag), "by_type": rows(by_type)}


# ---- text to speech ---------------------------------------------------------------------------


@app.get("/api/tts")
async def speak(text: str = Query(min_length=1, max_length=tts.MAX_CHARS), slow: bool = False):
    try:
        path = await tts.synthesize(text.strip(), slow)
    except Exception as exc:  # network failure / service rejection
        raise HTTPException(status_code=502, detail=f"TTS failed: {exc}") from exc
    return FileResponse(path, media_type="audio/mpeg", headers={"Cache-Control": "public, max-age=31536000"})
