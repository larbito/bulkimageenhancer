## Bulk Image Enhancer (Replicate)

CLI tool to enhance/upscale images in bulk (up to 100 at a time) using Replicate models (default: Real-ESRGAN).

### Requirements
- Python 3.9+
- Replicate API token

### Setup
1. Create and activate a virtualenv (recommended)
2. Install dependencies:
```bash
pip install -r requirements.txt
```
3. Copy `.env.example` to `.env` and set your Replicate API token:
```bash
echo 'REPLICATE_API_TOKEN=your_token_here' > .env
```

### Usage
```bash
python -m src.cli --input ./input_images --output ./enhanced \
  --model nightmareai/real-esrgan --scale 2 --max-workers 8 --limit 100
```

Options:
- `--input` (folder): directory with images (.jpg, .jpeg, .png, .webp, .bmp, .tiff)
- `--output` (folder): destination directory
- `--model`: Replicate model slug to use (default `tencentarc/real-esrgan`)
- `--model-version`: specific version id if you want to pin
- `--scale`: upscaling factor 2-4
- `--no-face-enhance`: disable face enhancement if supported by the model
- `--max-workers`: concurrency level
- `--limit`: cap number of images (default 100)

### Notes
- Default model is Real-ESRGAN which is robust for upscaling. You can switch to another upscaling/enhancement model on Replicate if desired.
- The tool downloads the returned URL from Replicate and saves files with `_enhanced` suffix.

### Example
```bash
python -m src.cli --input ./samples --output ./out --limit 50
```

## Deploying

### Backend on Railway
1. Create a new Railway project and add a Python service from this repo root.
2. Set service start command to use `Procfile` (detected automatically) or `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`.
3. Add environment variables in Railway:
   - `REPLICATE_API_TOKEN`: your token (stored securely on Railway)
   - `ALLOWED_ORIGINS`: your Vercel domain, e.g. `https://your-app.vercel.app`
4. Deploy.

### Frontend on Vercel
1. Import the `frontend` folder as a new Vercel project.
2. Set environment variable:
   - `NEXT_PUBLIC_API_BASE`: your Railway service public URL, e.g. `https://your-railway-app.up.railway.app`
3. Build & deploy. The UI will POST to the Railway API and render result URLs.


