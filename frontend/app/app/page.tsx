export default function ProjectsHome() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <a href="/app/new" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground">New Project</a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_,i)=> (
          <article key={i} className="rounded-2xl border shadow-soft overflow-hidden">
            <div className="aspect-[4/3] bg-muted"/>
            <div className="p-3">
              <div className="font-medium">Demo Project {i+1}</div>
              <div className="text-sm text-slate-600">Draft • 10 pages</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}


