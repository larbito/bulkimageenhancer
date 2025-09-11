import os
from typing import List, Optional

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .enhance_service import enhance_image_bytes, ServiceError


app = FastAPI(title="Bulk Image Enhancer API")

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in allowed_origins.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EnhanceResponse(BaseModel):
    urls: List[str]


@app.post("/enhance", response_model=EnhanceResponse)
async def enhance(
    files: List[UploadFile] = File(..., description="Up to 100 images"),
    model: str = Form("nightmareai/real-esrgan"),
    model_version: Optional[str] = Form(None),
    scale: int = Form(2),
    face_enhance: bool = Form(True),
):
    if len(files) > 100:
        return {"urls": []}
    urls: List[str] = []
    for f in files:
        data = await f.read()
        try:
            url = enhance_image_bytes(
                data=data,
                filename=f.filename or "image.png",
                model=model,
                model_version=model_version,
                scale=scale,
                face_enhance=face_enhance,
            )
            urls.append(url)
        except ServiceError as e:  # noqa: PERF203
            urls.append("")
    return {"urls": urls}


@app.get("/")
def root():
    return {"status": "ok"}

