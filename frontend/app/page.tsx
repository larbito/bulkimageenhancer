"use client";

import { useState } from "react";

export default function Page() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [urls, setUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) return;
    setLoading(true);
    setError(null);
    setUrls([]);
    try {
      const form = new FormData();
      Array.from(files)
        .slice(0, 100)
        .forEach((f) => form.append("files", f));
      form.append("scale", "2");
      form.append("face_enhance", "true");

      const apiBase = process.env.NEXT_PUBLIC_API_BASE || "/api";
      const res = await fetch(`${apiBase}/enhance`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setUrls((data.urls || []).filter((u: string) => !!u));
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Bulk Image Enhancer</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setFiles(e.target.files)}
        />
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading || !files}>
            {loading ? "Enhancing..." : "Enhance"}
          </button>
        </div>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
          marginTop: 24,
        }}
      >
        {urls.map((u, i) => (
          <div key={i}>
            <a href={u} target="_blank" rel="noreferrer">
              <img src={u} style={{ width: "100%", height: "auto" }} />
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}


