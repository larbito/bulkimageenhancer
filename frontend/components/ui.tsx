import Link from 'next/link';

export function Navbar() {
  return (
    <header className="flex items-center justify-between py-4">
      <Link href="/" className="font-semibold text-lg">Coloring Book Studio</Link>
      <nav className="flex items-center gap-4">
        <Link href="/account" className="text-sm text-slate-600 hover:text-slate-900">Account</Link>
        <a href="https://github.com/larbito/bulkimageenhancer" className="text-sm text-slate-600 hover:text-slate-900" target="_blank" rel="noreferrer">GitHub</a>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t pt-6 text-sm text-slate-500">© {new Date().getFullYear()} Coloring Book Studio</footer>
  );
}

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = '', ...rest } = props;
  return (
    <button
      {...rest}
      className={"inline-flex items-center justify-center rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700 transition " + className}
    />
  );
}

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = '', ...rest } = props;
  return <div {...rest} className={"rounded-lg border border-slate-200 bg-white shadow-sm " + className} />;
}


