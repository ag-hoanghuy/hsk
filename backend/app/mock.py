"""End-of-level mock exams. The browser draws the questions from the lesson tests and grades them (like lesson
tests); the server stores the attempt so the learner can review it and see her best score."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from .db import get_db
from .models import MockAttempt

router = APIRouter(prefix="/api/mock", tags=["mock"])


class MockAnswerIn(BaseModel):
    question_id: str
    lesson_id: int
    qtype: str
    tag: str = ""
    user_answer: Any = None
    is_correct: bool


class MockIn(BaseModel):
    level: int
    answers: list[MockAnswerIn]


def row(a: MockAttempt, with_answers: bool = False) -> dict:
    out = {"id": a.id, "level": a.level, "kind": "mock", "correct": a.correct, "total": a.total, "score": a.score,
           "extra": {}, "lesson_id": 0, "created_at": a.created_at.isoformat()}
    if with_answers:
        out["answers"] = a.answers
    return out


def recompute(a: MockAttempt) -> None:
    a.total = len(a.answers)
    a.correct = sum(1 for x in a.answers if x["is_correct"])
    a.score = round(100 * a.correct / a.total) if a.total else 0


@router.post("")
def create(body: MockIn, db: Session = Depends(get_db)):
    if body.level not in (3, 4):
        raise HTTPException(status_code=422, detail="level must be 3 or 4")
    if not body.answers:
        raise HTTPException(status_code=422, detail="answers must not be empty")
    a = MockAttempt(level=body.level, correct=0, total=0, score=0,
                    answers=[{**x.model_dump(), "overridden": False} for x in body.answers])
    recompute(a)
    db.add(a)
    db.commit()
    db.refresh(a)
    return row(a, with_answers=True)


@router.get("")
def list_attempts(level: int | None = None, limit: int = 20, db: Session = Depends(get_db)):
    stmt = select(MockAttempt).order_by(MockAttempt.created_at.desc(), MockAttempt.id.desc()).limit(limit)
    if level is not None:
        stmt = stmt.where(MockAttempt.level == level)
    return [row(a) for a in db.scalars(stmt)]


def load(db: Session, attempt_id: int) -> MockAttempt:
    a = db.get(MockAttempt, attempt_id)
    if a is None:
        raise HTTPException(status_code=404, detail="Attempt not found")
    return a


@router.get("/{attempt_id}")
def get(attempt_id: int, db: Session = Depends(get_db)):
    return row(load(db, attempt_id), with_answers=True)


@router.post("/{attempt_id}/answers/{question_id}/accept")
def accept(attempt_id: int, question_id: str, db: Session = Depends(get_db)):
    a = load(db, attempt_id)
    for x in a.answers:
        if x["question_id"] == question_id:
            x["is_correct"] = True
            x["overridden"] = True
            break
    else:
        raise HTTPException(status_code=404, detail="Answer not found")
    flag_modified(a, "answers")
    recompute(a)
    db.commit()
    db.refresh(a)
    return row(a, with_answers=True)
