"""Baseline: lessons and section_progress.

Databases created before Alembic was introduced already have these tables, so each
create is guarded; Alembic then simply records the revision.
"""
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())

    if not inspector.has_table("lessons"):
        op.create_table(
            "lessons",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("level", sa.Integer(), nullable=False),
            sa.Column("number", sa.Integer(), nullable=False),
            sa.Column("title_zh", sa.String(200), nullable=False),
            sa.Column("title_vi", sa.String(200), nullable=False),
            sa.Column("summary", sa.Text(), nullable=False),
            sa.Column("grammar_points", postgresql.JSONB(), nullable=False),
            sa.Column("content", postgresql.JSONB(), nullable=False),
            sa.UniqueConstraint("level", "number", name="uq_lesson_level_number"),
        )
        op.create_index("ix_lessons_level", "lessons", ["level"])

    if not inspector.has_table("section_progress"):
        op.create_table(
            "section_progress",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("lesson_id", sa.Integer(), sa.ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False),
            sa.Column("section", sa.String(30), nullable=False),
            sa.Column("best_score", sa.Integer(), nullable=True),
            sa.Column("completed_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.UniqueConstraint("lesson_id", "section", name="uq_progress_lesson_section"),
        )
        op.create_index("ix_section_progress_lesson_id", "section_progress", ["lesson_id"])


def downgrade() -> None:
    op.drop_table("section_progress")
    op.drop_table("lessons")
