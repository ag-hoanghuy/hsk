"""Quiz and test attempts with per-question answers (used for scores and error statistics)."""
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "attempts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("lesson_id", sa.Integer(), sa.ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False),
        sa.Column("kind", sa.String(20), nullable=False),
        sa.Column("correct", sa.Integer(), nullable=False),
        sa.Column("total", sa.Integer(), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("extra", postgresql.JSONB(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_attempts_lesson_id", "attempts", ["lesson_id"])

    op.create_table(
        "attempt_answers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("attempt_id", sa.Integer(), sa.ForeignKey("attempts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("question_id", sa.String(80), nullable=False),
        sa.Column("qtype", sa.String(30), nullable=False),
        sa.Column("tag", sa.String(120), nullable=False),
        sa.Column("user_answer", postgresql.JSONB(), nullable=True),
        sa.Column("is_correct", sa.Boolean(), nullable=False),
        sa.Column("overridden", sa.Boolean(), server_default=sa.false(), nullable=False),
    )
    op.create_index("ix_attempt_answers_attempt_id", "attempt_answers", ["attempt_id"])


def downgrade() -> None:
    op.drop_table("attempt_answers")
    op.drop_table("attempts")
