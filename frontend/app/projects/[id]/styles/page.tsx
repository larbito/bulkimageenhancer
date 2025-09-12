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
    <main>
      <h2>Pick a style</h2>
      <button onClick={load} disabled={loading}>
        {loading ? "Loading..." : "Regenerate"}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginTop: 16 }}>
        {candidates.map((c) => (
          <div key={c.id} style={{ border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
            <img src={c.thumbnailUrl} alt="style" style={{ width: '100%', height: 220, objectFit: 'cover' }} />
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 14, color: '#555', height: 64, overflow: 'auto' }}>{c.promptText}</div>
              <button onClick={() => select(c.id)} style={{ marginTop: 8 }}>Select</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}


