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
    <main className="py-6">
      <h2 className="text-2xl font-semibold">Ideas</h2>
      <div className="flex flex-wrap items-center gap-3 mt-3">
        <button onClick={generate} disabled={loading} className="px-3 py-2 text-sm rounded-md border">Generate ideas</button>
        <label className="text-sm flex items-center gap-2">Page count
          <input type="number" min={4} max={60} value={count} onChange={(e) => setCount(parseInt(e.target.value || '10', 10))} className="border rounded-md px-2 py-1 w-24" />
        </label>
        <button onClick={save} disabled={loading} className="px-3 py-2 text-sm rounded-md bg-brand-600 text-white">Save and continue</button>
      </div>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      <ol className="mt-4 grid gap-2">
        {ideas.map((idea, idx) => (
          <li key={idea.id || idx} className="flex items-center gap-2">
            <span className="w-8 text-right">{idx + 1}.</span>
            <input value={idea.ideaText} onChange={(e) => setIdeas(prev => prev.map(p => p.id === idea.id ? { ...p, ideaText: e.target.value } : p))} className="border rounded-md px-3 py-2 flex-1" />
          </li>
        ))}
      </ol>
    </main>
  );
}


