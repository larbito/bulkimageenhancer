"use client";
import { useState } from "react";

export function Uploader({ onUploaded }: { onUploaded: (urls: string[]) => void }) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      Array.from(files)
        .slice(0, 100)
        .forEach((f) => form.append("files", f));
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
      const res = await fetch(`${apiBase}/enhance`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      onUploaded((data.urls || []).filter((u: string) => !!u));
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} />
      <button type="submit" disabled={loading || !files}>
        {loading ? "Enhancing..." : "Enhance"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}


