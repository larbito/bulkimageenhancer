"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { PageIdea } from "@/lib/types";

export default function IdeasPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = useMemo(() => String(params?.id || ""), [params]);
  const [ideas, setIdeas] = useState<PageIdea[]>([]);
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIdeas = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      const list: PageIdea[] = data.ideas || [];
      setIdeas(list);
      setCount(data.pagesRequested || list.length || 10);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/ideas`, { method: 'POST' });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      await loadIdeas();
    } catch (e: any) {
      setError(e.message || 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/ideas`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ count, ideas: ideas.map(i => ({ id: i.id, ideaText: i.ideaText })) }) });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      router.push(`/projects/${projectId}/render`);
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (projectId) void loadIdeas(); }, [projectId]);

  return (
    <main>
      <h2>Ideas</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button onClick={generate} disabled={loading}>Generate ideas</button>
        <label>
          Page count
          <input type="number" min={4} max={60} value={count} onChange={(e) => setCount(parseInt(e.target.value || '10', 10))} style={{ marginLeft: 8, width: 100 }} />
        </label>
        <button onClick={save} disabled={loading}>Save and continue</button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ol style={{ marginTop: 16, display: 'grid', gap: 8 }}>
        {ideas.map((idea, idx) => (
          <li key={idea.id || idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 28, textAlign: 'right' }}>{idx + 1}.</span>
            <input value={idea.ideaText} onChange={(e) => setIdeas(prev => prev.map(p => p.id === idea.id ? { ...p, ideaText: e.target.value } : p))} style={{ flex: 1, padding: 8 }} />
          </li>
        ))}
      </ol>
    </main>
  );
}


