const express = require('express');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Worker is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/projects', (req, res) => {
  const project = {
    id: 'proj_' + Date.now(),
    title: req.body?.title || 'Test Project',
    pagesRequested: req.body?.pagesRequested || 10,
    status: 'draft'
  };
  res.json(project);
});

app.post('/api/projects/:id/styles', (req, res) => {
  const candidates = Array.from({length: 5}, (_, i) => ({
    id: `style_${i + 1}`,
    promptText: `Style ${i + 1}`,
    thumbnailUrl: `https://placehold.co/400x400?text=Style+${i + 1}`,
    selected: false
  }));
  res.json({ candidates });
});

app.post('/api/projects/:id/styles/select', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/projects/:id/ideas', (req, res) => {
  const ideas = Array.from({length: 5}, (_, i) => ({
    id: `idea_${i + 1}`,
    index: i + 1,
    ideaText: `Scene ${i + 1}`,
    status: 'draft'
  }));
  res.json({ ideas });
});

app.put('/api/projects/:id/ideas', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/projects/:id/pages', (req, res) => {
  const job = {
    id: 'job_' + Date.now(),
    type: 'page_gen',
    status: 'done',
    createdAt: new Date().toISOString()
  };
  res.json(job);
});

app.get('/api/jobs/:id', (req, res) => {
  res.json({
    id: req.params.id,
    status: 'done',
    type: 'page_gen'
  });
});

app.get('/api/projects/:id', (req, res) => {
  const project = {
    id: req.params.id,
    title: 'Demo Project',
    pagesRequested: 5,
    ideas: Array.from({length: 5}, (_, i) => ({
      id: `idea_${i + 1}`,
      index: i + 1,
      ideaText: `Scene ${i + 1}`,
      status: 'approved',
      images: [{
        id: `img_${i + 1}`,
        stage: 'upscaled',
        url: `https://placehold.co/2048x2048?text=Page+${i + 1}`,
        width: 2048,
        height: 2048
      }]
    }))
  };
  res.json(project);
});

app.post('/api/projects/:id/export', (req, res) => {
  res.json({ url: 'https://example.com/book.zip' });
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Worker listening on port ${port}`);
});