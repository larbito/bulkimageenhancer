## Coloring Studio - AI-Powered Coloring Book Generator

### Quick Start (Demo Mode)

The app works out of the box in demo mode! Just run:

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and start creating coloring books with sample images.

### Environment Configuration

Create `.env.local` for AI generation:

```bash
# OpenAI API Key for real coloring page generation
OPENAI_API_KEY=sk-your-openai-api-key-here

# Worker API for AI image generation (optional alternative)
WORKER_API_BASE=

# Future authentication setup
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Future database setup
DATABASE_URL=
```

### Get OpenAI API Key:
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `.env.local` file as `OPENAI_API_KEY=sk-...`
4. Restart your dev server

### Demo vs Production Mode

**Demo Mode (no API keys):**
- ✅ Complete workflow testing
- ✅ Style selection with sample images
- ✅ Page idea generation
- ✅ Simulated rendering process

**AI Mode (with OPENAI_API_KEY):**
- 🎨 **Real AI-generated coloring pages using DALL-E 3**
- 🖼️ **5 different style variations of user's exact idea**
- ✨ **Actual coloring book pages with different line thicknesses**
- 🎯 **Customized to user's specific concept**

**Production Mode (with WORKER_API_BASE):**
- ⚡ Custom AI pipeline integration
- 📦 High-volume processing
- 🔧 Advanced customization options

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


