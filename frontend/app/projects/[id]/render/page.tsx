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
    <main className="py-6">
      <h2 className="text-2xl font-semibold">Rendering</h2>
      <button onClick={start} className="mt-3 px-3 py-2 text-sm rounded-md bg-brand-600 text-white">Start render</button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      {job && (
        <div className="mt-3 text-sm">
          <div>Status: {job.status}</div>
          {job.errorText && <div className="text-red-600">Error: {job.errorText}</div>}
        </div>
      )}
    </main>
  );
}


