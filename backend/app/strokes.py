"""Stroke-order data for the handwriting practice (hanzi-writer format), fetched once from the public
hanzi-writer-data package and cached on disk, like the TTS audio."""

import asyncio
import os
from pathlib import Path

import aiohttp
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(prefix="/api/strokes", tags=["strokes"])

AUDIO_DIR = Path(os.environ.get("AUDIO_DIR", "/audio"))
STROKES_DIR = AUDIO_DIR / "strokes"
SOURCE = "https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/{}.json"
_locks: dict[str, asyncio.Lock] = {}


@router.get("/{char}")
async def strokes(char: str):
    if len(char) != 1 or not "一" <= char <= "鿿":
        raise HTTPException(status_code=422, detail="one Chinese character expected")
    path = STROKES_DIR / f"{ord(char):x}.json"
    if not path.exists():
        STROKES_DIR.mkdir(parents=True, exist_ok=True)
        async with _locks.setdefault(char, asyncio.Lock()):
            if not path.exists():
                try:
                    async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=15)) as session:
                        async with session.get(SOURCE.format(char)) as resp:
                            if resp.status == 404:
                                raise HTTPException(status_code=404, detail="no stroke data for this character")
                            resp.raise_for_status()
                            body = await resp.read()
                except HTTPException:
                    raise
                except Exception as exc:  # offline the first time
                    raise HTTPException(status_code=502, detail=f"could not download stroke data: {exc}") from exc
                tmp = path.with_suffix(".tmp")
                tmp.write_bytes(body)
                tmp.replace(path)
    return FileResponse(path, media_type="application/json", headers={"Cache-Control": "public, max-age=31536000"})
