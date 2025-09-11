import os
import pathlib
import tempfile
from typing import List, Optional

import replicate
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type


class ServiceError(Exception):
    pass


def get_replicate_client() -> replicate.Client:
    token = os.getenv("REPLICATE_API_TOKEN")
    if not token:
        raise ServiceError("REPLICATE_API_TOKEN not configured")
    return replicate.Client(api_token=token)


@retry(
    reraise=True,
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((replicate.exceptions.ReplicateError, ServiceError)),
)
def enhance_image_bytes(
    data: bytes,
    filename: str,
    model: str,
    model_version: Optional[str],
    scale: int,
    face_enhance: bool,
) -> str:
    client = get_replicate_client()
    model_ref = model if not model_version else f"{model}:{model_version}"

    # write bytes to a temp file so we can pass a file handle to Replicate
    suffix = pathlib.Path(filename).suffix or ".png"
    with tempfile.NamedTemporaryFile(suffix=suffix) as tmp:
        tmp.write(data)
        tmp.flush()
        with open(tmp.name, "rb") as f:
            inputs = {
                "image": f,
                "scale": scale,
                "face_enhance": face_enhance,
            }
            output = client.run(model_ref, input=inputs)

    if isinstance(output, str):
        return output
    if isinstance(output, list) and output:
        return str(output[0])
    raise ServiceError("Unexpected output from model")

