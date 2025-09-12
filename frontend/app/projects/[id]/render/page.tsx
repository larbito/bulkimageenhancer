"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { Job } from "@/lib/types";

export default function RenderPage() {
  const params = useParams();
  const projectId = useMemo(() => String(params?.id || ""), [params]);
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setError(null);
    const res = await fetch(`/api/projects/${projectId}/pages`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}) });
    if (!res.ok) {
      setError(`Request failed: ${res.status}`);
      return;
    }
    const j = await res.json();
    setJob(j);
  };

  useEffect(() => {
    const t = setInterval(async () => {
      if (!job) return;
      const res = await fetch(`/api/jobs/${job.id}`);
      if (res.ok) setJob(await res.json());
    }, 1500);
    return () => clearInterval(t);
  }, [job]);

  return (
    <main>
      <h2>Rendering</h2>
      <button onClick={start}>Start render</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {job && (
        <div style={{ marginTop: 12 }}>
          <div>Status: {job.status}</div>
          {job.errorText && <div style={{ color: 'red' }}>Error: {job.errorText}</div>}
        </div>
      )}
    </main>
  );
}


