"use client";
import Link from 'next/link';
import { Sun, Moon, Menu } from 'lucide-react';
import { useState } from 'react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  return (
    <div className={(dark ? 'dark ' : '') + 'min-h-screen bg-bg text-fg'}>
      <aside className="hidden lg:flex w-[280px] border-r border p-4 fixed inset-y-0 bg-card">
        <nav className="space-y-1 w-full">
          <Link href="/app" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted"><Menu className="h-4 w-4"/> <span>Projects</span></Link>
          <Link href="/app/account" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted">Account</Link>
        </nav>
      </aside>
      <div className="lg:pl-[280px]">
        <header className="h-16 border-b border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 flex items-center px-4">
          <div className="ml-auto flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-muted" aria-label="Toggle theme" onClick={() => setDark(v => !v)}>
              <Sun className="h-5 w-5 hidden dark:block"/>
              <Moon className="h-5 w-5 dark:hidden"/>
            </button>
          </div>
        </header>
        <main className="container py-6">{children}</main>
      </div>
    </div>
  );
}


