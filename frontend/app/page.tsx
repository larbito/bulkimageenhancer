"use client";

import { useState } from "react";

export default function Page() {
  const [title, setTitle] = useState("");
  const [pages, setPages] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, pagesRequested: pages }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const project = await res.json();
      window.location.href = `/projects/${project.id}/styles`;
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Coloring Book Studio</h1>
      <p>Create a full coloring book from your idea.</p>
      <form onSubmit={handleCreate} style={{ display: 'grid', gap: 12, maxWidth: 540 }}>
        <label>
          Idea
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Horse Adventures"
            required
            style={{ width: '100%', padding: 8 }}
          />
        </label>
        <label>
          Page count
          <input
            type="number"
            min={4}
            max={60}
            value={pages}
            onChange={(e) => setPages(parseInt(e.target.value || '10', 10))}
            style={{ width: 120, padding: 8 }}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create project"}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  );
}


