## Coloring Book Studio

Full-stack app to generate full coloring books from a user idea.

### Tech

- Next.js App Router on Vercel (UI + API proxy)
- Node Worker on Railway (owns keys, long-running jobs)
- Postgres on Neon (via Prisma)
- Storage on Vercel Blob or S3 compatible
- Queue via Upstash Redis or Postgres job table
- OpenAI Images for base renders, Replicate Real-ESRGAN for upscaling

### Local dev

Frontend:
```bash
cd frontend
npm i
npm run dev
```

Worker:
```bash
cd worker
npm i
npm run dev
```

### Env vars

Frontend (Vercel):
- WORKER_API_BASE: URL of Railway worker (e.g. https://your-worker.up.railway.app)
- NEXTAUTH_SECRET, NEXTAUTH_URL (if using auth)
- DATABASE_URL
- Storage keys (Vercel Blob or S3)

Worker (Railway):
- OPENAI_API_KEY
- REPLICATE_API_TOKEN
- DATABASE_URL
- Storage keys

### Deploy

1. Push this repo to GitHub
2. Import the repo in Vercel (UI in /frontend)
3. Deploy worker to Railway from /worker
4. Set WORKER_API_BASE in Vercel to your Railway URL

### API surface (proxied)

UI -> /api/* -> Railway worker

- POST /api/projects
- POST /api/projects/{id}/styles
- POST /api/projects/{id}/styles/select
- POST /api/projects/{id}/ideas
- PUT  /api/projects/{id}/ideas
- POST /api/projects/{id}/pages
- POST /api/projects/{id}/export
- GET  /api/jobs/{id}
- GET  /api/projects/{id}


