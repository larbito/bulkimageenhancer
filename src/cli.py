import os
import sys
import pathlib
import concurrent.futures as futures
from typing import List, Optional

import click
from dotenv import load_dotenv
from tqdm import tqdm

from .enhancer import enhance_single, EnhancementConfig


SUPPORTED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}


def _collect_images(input_dir: str) -> List[str]:
    paths: List[str] = []
    for path in pathlib.Path(input_dir).glob("**/*"):
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTS:
            paths.append(str(path))
    return paths


@click.command()
@click.option("--input", "input_dir", required=True, type=click.Path(exists=True, file_okay=False), help="Input directory containing images")
@click.option("--output", "output_dir", required=True, type=click.Path(file_okay=False), help="Directory to write enhanced images")
@click.option("--model", default="nightmareai/real-esrgan", show_default=True, help="Replicate model slug")
@click.option("--model-version", default=None, help="Optional explicit model version id")
@click.option("--scale", default=2, show_default=True, type=click.IntRange(2, 4), help="Upscale factor (2-4)")
@click.option("--no-face-enhance", is_flag=True, default=False, help="Disable face enhancement if supported")
@click.option("--max-workers", default=8, show_default=True, help="Max concurrent workers")
@click.option("--limit", default=100, show_default=True, help="Max number of images to process")
def main(
    input_dir: str,
    output_dir: str,
    model: str,
    model_version: Optional[str],
    scale: int,
    no_face_enhance: bool,
    max_workers: int,
    limit: int,
) -> None:
    load_dotenv()

    os.makedirs(output_dir, exist_ok=True)

    images = _collect_images(input_dir)
    if not images:
        click.echo("No images found in input directory", err=True)
        sys.exit(1)

    images = images[:limit]

    config = EnhancementConfig(
        model=model,
        model_version=model_version,
        scale=scale,
        face_enhance=not no_face_enhance,
    )

    results = []
    errors = []

    with futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_path = {
            executor.submit(enhance_single, path, output_dir, config): path for path in images
        }
        for future in tqdm(futures.as_completed(future_to_path), total=len(future_to_path), desc="Enhancing"):
            src = future_to_path[future]
            try:
                out_path = future.result()
                results.append((src, out_path))
            except Exception as exc:  # noqa: BLE001
                errors.append((src, str(exc)))

    for src, outp in results:
        click.echo(f"OK  {src} -> {outp}")
    if errors:
        click.echo("\nSome files failed:", err=True)
        for src, msg in errors:
            click.echo(f"ERR {src}: {msg}", err=True)

    if errors:
        sys.exit(2)


if __name__ == "__main__":
    main()


