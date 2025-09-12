"use client";

import { useState } from "react";
import { Navbar, Footer, Button, Card } from "@/components/ui";

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
    <div>
      <Navbar />
      <main className="py-10">
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl font-semibold leading-tight">Generate a full coloring book from your idea</h1>
            <p className="mt-3 text-slate-600">Enter your theme and page count. Pick a style. We generate consistent pages, upscale, and let you download a print-ready PNG set.</p>
            <form onSubmit={handleCreate} className="mt-6 grid gap-3 max-w-md">
              <label className="text-sm">Idea</label>
              <input className="border rounded-md px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Horse Adventures" required />
              <label className="text-sm">Page count</label>
              <input className="border rounded-md px-3 py-2 w-32" type="number" min={4} max={60} value={pages} onChange={(e) => setPages(parseInt(e.target.value || '10', 10))} />
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create project"}
              </Button>
              {error && <p className="text-red-600 text-sm">{error}</p>}
            </form>
          </div>
          <Card className="p-6">
            <div className="grid grid-cols-3 gap-3">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="aspect-[3/4] bg-slate-100 rounded" />
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-600">Preview thumbnails of generated pages.</p>
          </Card>
        </section>
        <section className="mt-16 grid md:grid-cols-3 gap-6">
          {[{t:'Consistent Style',d:'Lock style prompt, params and seed for consistent line weight and character.'},{t:'Fast Preview',d:'Generate previews quickly before rendering print-size pages.'},{t:'Upscaled Finals',d:'Use Real-ESRGAN to upscale for crisp prints.'}].map((f,i)=>(
            <Card key={i} className="p-6">
              <h3 className="font-medium">{f.t}</h3>
              <p className="text-sm text-slate-600 mt-2">{f.d}</p>
            </Card>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}


