"use client";

import Link from 'next/link';
import { Sun, Moon, Home, Plus, User, Settings, Palette, BookOpen } from 'lucide-react';
import { useState } from 'react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  
  const navItems = [
    { href: '/app', icon: Home, label: 'Projects', active: true },
    { href: '/app/new', icon: Plus, label: 'New Project' },
    { href: '/app/account', icon: User, label: 'Account' },
    { href: '/app/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className={(dark ? 'dark ' : '') + 'min-h-screen bg-gradient-to-br from-bg to-muted'}>
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-72 bg-card/80 backdrop-blur-xl border-r border-border/50 z-40 hidden lg:block">
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-glow">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">Coloring Studio</span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                  item.active 
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-glow' 
                    : 'hover:bg-muted text-muted-fg hover:text-fg'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="border-t border-border/50 pt-6">
            <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">Creator</p>
                <p className="text-sm text-muted-fg">Free Plan</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setDark(!dark)}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                <Sun className="h-5 w-5 hidden dark:block" />
                <Moon className="h-5 w-5 dark:hidden" />
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}