import os
from collections import defaultdict
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.concurrency import run_in_threadpool
from sqlalchemy import select
from sqlalchemy.orm import Session

from . import tts
from .db import get_db
from .models import Lesson, SpeakingAttempt
from .speech import assess
from .speech.asr import engine

router = APIRouter(prefix="/api/speaking", tags=["speaking"])

AUDIO_DIR = Path(os.environ.get("AUDIO_DIR", "/audio"))
RECORDINGS = AUDIO_DIR / "recordings"
MAX_UPLOAD = 8 * 1024 * 1024  # ~4 minutes of 16 kHz mono; the page records at most 20 s
MAX_TEXT = 120


def attempt_row(a: SpeakingAttempt) -> dict:
    return {"id": a.id, "lesson_id": a.lesson_id, "text": a.text, "overall": a.overall, "accuracy": a.accuracy,
            "fluency": a.fluency, "created_at": a.created_at.isoformat()}


@router.get("/status")
def status():
    engine.start()
    return engine.status()


@router.post("/assess")
async def assess_recording(
    request: Request,
    lesson_id: int,
    text: str = Query(min_length=1, max_length=MAX_TEXT),
    db: Session = Depends(get_db),
):
    """Body: a WAV recording of the learner reading `text`. Returns the assessment and stores the attempt."""
    if db.get(Lesson, lesson_id) is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    wav = await request.body()
    if not wav:
        raise HTTPException(status_code=422, detail="Chưa nhận được bản ghi âm.")
    if len(wav) > MAX_UPLOAD:
        raise HTTPException(status_code=413, detail="Bản ghi âm quá dài.")
    text = text.strip()
    if engine.state == "error":
        raise HTTPException(status_code=503, detail=f"Mô hình nhận dạng giọng nói chưa sẵn sàng ({engine.error}).")
    if not engine.wait(timeout=0.1):
        raise HTTPException(status_code=503, detail="Mô hình nhận dạng giọng nói đang tải lần đầu, thử lại sau ít phút.")
    try:
        sample = await tts.synthesize(text, with_words=True)
    except Exception as exc:  # no internet and the sample was never generated
        raise HTTPException(status_code=502, detail=f"Chưa có giọng mẫu cho câu này (cần mạng lần đầu): {exc}") from exc
    try:
        result = await run_in_threadpool(assess.run, text, wav, sample, tts.read_words(sample))
    except assess.AssessError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    row = SpeakingAttempt(
        lesson_id=lesson_id,
        text=text,
        overall=result["overall"],
        accuracy=result["accuracy"],
        fluency=result["fluency"],
        details=result,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    RECORDINGS.mkdir(parents=True, exist_ok=True)
    (RECORDINGS / f"{row.id}.wav").write_bytes(wav)
    row.audio_path = f"recordings/{row.id}.wav"
    db.commit()
    return {**result, "id": row.id, "lesson_id": lesson_id, "text": text, "created_at": row.created_at.isoformat()}


@router.get("/attempts")
def list_attempts(lesson_id: int | None = None, limit: int = 20, db: Session = Depends(get_db)):
    stmt = select(SpeakingAttempt).order_by(SpeakingAttempt.created_at.desc(), SpeakingAttempt.id.desc()).limit(limit)
    if lesson_id is not None:
        stmt = stmt.where(SpeakingAttempt.lesson_id == lesson_id)
    return [attempt_row(a) for a in db.scalars(stmt)]


@router.get("/best")
def best_scores(lesson_id: int, db: Session = Depends(get_db)):
    """Best overall score and number of tries for each sentence practised in a lesson."""
    best: dict[str, int] = defaultdict(int)
    tries: dict[str, int] = defaultdict(int)
    for text, overall in db.execute(select(SpeakingAttempt.text, SpeakingAttempt.overall).where(SpeakingAttempt.lesson_id == lesson_id)):
        best[text] = max(best[text], overall)
        tries[text] += 1
    return [{"text": t, "best": best[t], "tries": tries[t]} for t in best]
