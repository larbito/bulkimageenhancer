## Coloring Studio - AI-Powered Coloring Book Generator

### Quick Start (Demo Mode)

The app works out of the box in demo mode! Just run:

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and start creating coloring books with sample images.

### Environment Configuration

Create `.env.local` for full functionality:

```bash
# Worker API for AI image generation (optional)
# Without this, app runs in demo mode with sample images
WORKER_API_BASE=

# Future authentication setup
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Future database setup
DATABASE_URL=
```

### Demo vs Production Mode

**Demo Mode (current):**
- ✅ Complete workflow testing
- ✅ Style selection with sample images
- ✅ Page idea generation
- ✅ Simulated rendering process
- ✅ Perfect for development & testing

**Production Mode (with WORKER_API_BASE):**
- 🎨 Real AI-generated coloring pages
- 🖼️ Custom style samples based on user ideas  
- ⚡ Live rendering with actual AI models
- 📦 High-quality downloadable files

### Setting up AI Generation

To enable real AI image generation, you need a worker API that supports:
- `POST /api/generate-styles` - Generate 5 style samples
- `POST /api/generate-page-ideas` - Create page concepts
- `POST /api/render-pages` - Generate actual coloring pages
- `POST /api/upscale-pages` - Enhance image quality

Set your worker API URL in `.env.local`:
```bash
WORKER_API_BASE=https://your-worker-api.com
```


