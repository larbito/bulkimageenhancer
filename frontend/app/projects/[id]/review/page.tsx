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
    <main className="py-6">
      <h2 className="text-2xl font-semibold">Review and export</h2>
      <div className="mb-3 flex items-center gap-3">
        <button onClick={buildZip} className="px-3 py-2 text-sm rounded-md border">Build ZIP</button>
        {zipUrl && (
          <a href={zipUrl} className="text-brand-600 text-sm" target="_blank" rel="noreferrer">Download ZIP</a>
        )}
      </div>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {finals.map((img) => (
          <a key={img.id} href={img.url} target="_blank" rel="noreferrer">
            <img src={img.url} className="w-full h-auto bg-white" />
          </a>
        ))}
      </div>
    </main>
  );
}


