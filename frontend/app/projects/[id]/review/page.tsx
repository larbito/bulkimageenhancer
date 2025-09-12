"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { PageImage } from "@/lib/types";

export default function ReviewPage() {
  const params = useParams();
  const projectId = useMemo(() => String(params?.id || ""), [params]);
  const [finals, setFinals] = useState<PageImage[]>([]);
  const [zipUrl, setZipUrl] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch(`/api/projects/${projectId}`);
    if (!res.ok) return;
    const data = await res.json();
    const images: PageImage[] = (data.ideas || []).flatMap((i: any) => (i.images || [])).filter((im: PageImage) => im.stage === 'upscaled');
    setFinals(images);
  };

  const buildZip = async () => {
    const res = await fetch(`/api/projects/${projectId}/export`, { method: 'POST' });
    if (!res.ok) return;
    const data = await res.json();
    setZipUrl(data.url);
  };

  useEffect(() => { if (projectId) void load(); }, [projectId]);

  return (
    <main>
      <h2>Review and export</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={buildZip}>Build ZIP</button>
        {zipUrl && (
          <a href={zipUrl} style={{ marginLeft: 12 }} target="_blank" rel="noreferrer">Download ZIP</a>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {finals.map((img) => (
          <a key={img.id} href={img.url} target="_blank" rel="noreferrer">
            <img src={img.url} style={{ width: '100%', height: 'auto', background: '#fff' }} />
          </a>
        ))}
      </div>
    </main>
  );
}


