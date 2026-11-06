import os

from alembic import context
from sqlalchemy import create_engine, pool

import app.models  # noqa: F401  (registers tables on Base.metadata)
from app.db import Base

target_metadata = Base.metadata


def run_migrations_online() -> None:
    engine = create_engine(os.environ["DATABASE_URL"], poolclass=pool.NullPool)
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


run_migrations_online()
