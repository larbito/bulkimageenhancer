"use client";

import { useState } from 'react';
import { ArrowRight, Lightbulb, BookOpen, Palette } from 'lucide-react';
import { Button, Card } from '@/components/ui';

export default function NewProjectPage() {
  const [title, setTitle] = useState("");
  const [pages, setPages] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exampleIdeas = [
    "Magical Forest Adventures",
    "Ocean Creatures",
    "Space Explorers", 
    "Farm Animals",
    "Dinosaur Kingdom",
    "Fairy Tale Castle"
  ];

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/projects', { 
        method: 'POST', 
        headers: { 'content-type': 'application/json' }, 
        body: JSON.stringify({ title, pagesRequested: pages }) 
      });
      
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      
      const project = await res.json();
      window.location.href = `/projects/${project.id}/styles`;
    } catch (e: any) { 
      setError(e.message || 'Failed to create project'); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Create Your <span className="gradient-text">Coloring Book</span>
        </h1>
        <p className="text-xl text-muted-fg max-w-2xl mx-auto">
          Describe your idea and we'll generate a complete, consistent coloring book with AI
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Form */}
        <Card className="p-8">
          <form onSubmit={createProject} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Lightbulb className="w-5 h-5 text-primary" />
                What's your coloring book idea?
              </label>
              <input
                className="w-full px-4 py-4 bg-muted rounded-2xl border-0 focus:ring-2 focus:ring-primary focus:outline-none transition-all text-lg"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Magical Forest Adventures"
                required
                minLength={8}
                maxLength={120}
              />
              <p className="text-sm text-muted-fg mt-2">
                Be descriptive! This helps our AI understand your vision.
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-lg font-semibold mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
                How many pages?
              </label>
              <div className="flex items-center gap-4">
                <input
                  className="w-32 px-4 py-4 bg-muted rounded-2xl border-0 focus:ring-2 focus:ring-primary focus:outline-none transition-all text-lg text-center font-semibold"
                  type="number"
                  min={4}
                  max={60}
                  value={pages}
                  onChange={(e) => setPages(parseInt(e.target.value || '12', 10))}
                />
                <div className="text-muted-fg">
                  <p className="text-sm">Recommended: 8-24 pages</p>
                  <p className="text-xs">Perfect for printing and binding</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading || !title.trim()} 
              size="lg"
              className="w-full group"
            >
              {loading ? (
                <>Creating your project...</>
              ) : (
                <>
                  Create Project
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Preview & Tips */}
        <div className="space-y-8">
          {/* Example Ideas */}
          <Card className="p-6">
            <h3 className="flex items-center gap-2 font-semibold mb-4">
              <Palette className="w-5 h-5 text-primary" />
              Need inspiration?
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {exampleIdeas.map((idea, index) => (
                <button
                  key={index}
                  onClick={() => setTitle(idea)}
                  className="p-3 text-left text-sm bg-muted hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                >
                  {idea}
                </button>
              ))}
            </div>
          </Card>

          {/* Preview */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Your book will include:</h3>
            <div className="space-y-3 text-sm text-muted-fg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>{pages} unique coloring pages</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Consistent artistic style throughout</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>High-resolution 300 DPI files</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Ready for 8.5×11 inch printing</span>
              </div>
            </div>
          </Card>

          {/* Process Preview */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <h3 className="font-semibold mb-4">What happens next:</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <span>Choose from 5 AI-generated art styles</span>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <span>Review and edit page ideas</span>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <span>Generate and download your book</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}