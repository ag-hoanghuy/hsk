"""End-of-level mock exams (questions drawn from every lesson test of the level)."""
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "mock_attempts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("level", sa.Integer(), nullable=False),
        sa.Column("correct", sa.Integer(), nullable=False),
        sa.Column("total", sa.Integer(), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("answers", postgresql.JSONB(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_mock_attempts_level", "mock_attempts", ["level"])


def downgrade() -> None:
    op.drop_table("mock_attempts")
