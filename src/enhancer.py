import os
import pathlib
from dataclasses import dataclass
from typing import Optional, List

import replicate
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type


class ReplicatePredictError(Exception):
    pass


@dataclass
class EnhancementConfig:
    model: str = "nightmareai/real-esrgan"
    model_version: Optional[str] = None
    scale: int = 2  # commonly 2, 3, or 4 for Real-ESRGAN
    face_enhance: bool = True


def _get_replicate_client() -> replicate.Client:
    api_token = os.getenv("REPLICATE_API_TOKEN")
    if not api_token:
        raise RuntimeError("Missing REPLICATE_API_TOKEN. Set it in env or .env file.")
    return replicate.Client(api_token=api_token)


def _build_inputs(config: EnhancementConfig, image_file_handle) -> dict:
    # Inputs for popular Real-ESRGAN models on Replicate: image, scale, face_enhance
    return {
        "image": image_file_handle,
        "scale": config.scale,
        "face_enhance": config.face_enhance,
    }


@retry(
    reraise=True,
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((replicate.exceptions.ReplicateError, ReplicatePredictError)),
)
def enhance_single(
    input_path: str,
    output_dir: str,
    config: EnhancementConfig,
) -> str:
    client = _get_replicate_client()
    model_ref = config.model if not config.model_version else f"{config.model}:{config.model_version}"

    # Replicate accepts file handles. Ensure we close the file after the request.
    try:
        with open(input_path, "rb") as f:
            inputs = _build_inputs(config, f)
            output = client.run(model_ref, input=inputs)
    except Exception as exc:  # noqa: BLE001
        raise ReplicatePredictError(str(exc)) from exc

    # Many image models return a single URL string, or a list of URLs
    if isinstance(output, str):
        output_urls: List[str] = [output]
    elif isinstance(output, list):
        output_urls = [str(x) for x in output]
    else:
        raise ReplicatePredictError(f"Unexpected output type: {type(output)}")

    # Save the first output as the primary result
    primary_url = output_urls[0]

    # Determine output path
    input_name = pathlib.Path(input_path).stem
    input_ext = pathlib.Path(input_path).suffix or ".png"
    out_path = pathlib.Path(output_dir) / f"{input_name}_enhanced{input_ext}"

    # Stream download
    import requests

    response = requests.get(primary_url, timeout=60)
    response.raise_for_status()
    with open(out_path, "wb") as f:
        f.write(response.content)

    return str(out_path)

