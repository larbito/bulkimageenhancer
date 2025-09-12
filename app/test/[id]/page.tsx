export default function TestDynamicPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dynamic Route Test</h1>
      <p>ID: {params.id}</p>
      <p>This page should work if dynamic routing is working.</p>
    </div>
  );
}
