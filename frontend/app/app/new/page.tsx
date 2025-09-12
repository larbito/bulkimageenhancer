"use client";
import { useState } from 'react';

export default function NewProject() {
  const [title, setTitle] = useState("");
  const [pages, setPages] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/projects', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title, pagesRequested: pages }) });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const p = await res.json();
      window.location.href = `/projects/${p.id}/styles`;
    } catch (e: any) { setError(e.message || 'Failed'); } finally { setLoading(false); }
  };
  return (
    <form onSubmit={createProject} className="max-w-md space-y-3">
      <h1 className="text-2xl font-semibold">New Project</h1>
      <label className="text-sm">Idea</label>
      <input className="border rounded-xl px-3 py-2 w-full" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Horse Adventures" required minLength={8} maxLength={120} />
      <label className="text-sm">Pages</label>
      <input className="border rounded-xl px-3 py-2 w-32" type="number" min={1} max={60} value={pages} onChange={(e) => setPages(parseInt(e.target.value || '10', 10))} />
      <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground" disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}


