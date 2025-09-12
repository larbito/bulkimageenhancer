"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { StyleCandidate } from "@/lib/types";

export default function StyleChooserPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = useMemo(() => String(params?.id || ""), [params]);
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<StyleCandidate[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/styles`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ n: 5 }) });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setCandidates(data.candidates || []);
    } catch (e: any) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) void load();
  }, [projectId]);

  const select = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/styles/select`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      router.push(`/projects/${projectId}/ideas`);
    } catch (e: any) {
      setError(e.message || "Failed to select");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Pick a style</h2>
        <button onClick={load} disabled={loading} className="text-sm text-brand-600">
          {loading ? "Loading..." : "Regenerate"}
        </button>
      </div>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-4">
        {candidates.map((c) => (
          <div key={c.id} className="rounded-lg border overflow-hidden bg-white">
            <img src={c.thumbnailUrl} alt="style" className="w-full h-56 object-cover" />
            <div className="p-3">
              <div className="text-sm text-slate-600 h-16 overflow-auto">{c.promptText}</div>
              <button onClick={() => select(c.id)} className="mt-2 inline-flex px-3 py-2 text-sm rounded-md bg-brand-600 text-white">Select</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}


