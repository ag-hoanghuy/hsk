from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, false, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base

JsonType = JSON().with_variant(JSONB, "postgresql")


class Lesson(Base):
    """One textbook lesson. Titles and grammar points come from content/curriculum.json;
    vocab / grammar / dialogue / exercises live in `content` (content/hsk<level>/lesson-NN.json)."""

    __tablename__ = "lessons"
    __table_args__ = (UniqueConstraint("level", "number", name="uq_lesson_level_number"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    level: Mapped[int] = mapped_column(Integer, index=True)
    number: Mapped[int] = mapped_column(Integer)
    title_zh: Mapped[str] = mapped_column(String(200))
    title_vi: Mapped[str] = mapped_column(String(200))
    summary: Mapped[str] = mapped_column(Text, default="")
    grammar_points: Mapped[list] = mapped_column(JsonType, default=list)
    content: Mapped[dict] = mapped_column(JsonType, default=dict)


class SectionProgress(Base):
    """A learner finished a section of a lesson (vocab, grammar, dialogue, practice)."""

    __tablename__ = "section_progress"
    __table_args__ = (UniqueConstraint("lesson_id", "section", name="uq_progress_lesson_section"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"), index=True)
    section: Mapped[str] = mapped_column(String(30))
    best_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Attempt(Base):
    """One run of a quiz (kind quiz_vocab / quiz_grammar) or of the end-of-lesson test (kind test)."""

    __tablename__ = "attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"), index=True)
    kind: Mapped[str] = mapped_column(String(20))
    correct: Mapped[int] = mapped_column(Integer)
    total: Mapped[int] = mapped_column(Integer)
    score: Mapped[int] = mapped_column(Integer)  # percent
    extra: Mapped[dict] = mapped_column(JsonType, default=dict)  # quiz: points, streak_max
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    answers: Mapped[list["AttemptAnswer"]] = relationship(
        order_by="AttemptAnswer.id", cascade="all, delete-orphan", passive_deletes=True
    )


class SpeakingAttempt(Base):
    """One recording of a sentence and its assessment. `details` holds the per-syllable verdicts and chart data."""

    __tablename__ = "speaking_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"), index=True)
    text: Mapped[str] = mapped_column(Text)
    overall: Mapped[int] = mapped_column(Integer)
    accuracy: Mapped[int] = mapped_column(Integer)
    fluency: Mapped[int] = mapped_column(Integer)
    details: Mapped[dict] = mapped_column(JsonType, default=dict)
    audio_path: Mapped[str | None] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AttemptAnswer(Base):
    """The learner's answer to one question. `tag` names the vocab word / grammar point it tests."""

    __tablename__ = "attempt_answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    attempt_id: Mapped[int] = mapped_column(ForeignKey("attempts.id", ondelete="CASCADE"), index=True)
    question_id: Mapped[str] = mapped_column(String(80))
    qtype: Mapped[str] = mapped_column(String(30))
    tag: Mapped[str] = mapped_column(String(120), default="")
    user_answer: Mapped[object | None] = mapped_column(JsonType, nullable=True)
    is_correct: Mapped[bool] = mapped_column(Boolean)
    overridden: Mapped[bool] = mapped_column(Boolean, default=False, server_default=false())
