"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Minus, Shuffle, Edit3, Save, ArrowRight, Lightbulb, BookOpen } from "lucide-react";
import { Button, Card } from "@/components/ui";
import type { PageIdea } from "@/lib/types";

export default function IdeasPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = useMemo(() => String(params?.id || ""), [params]);
  const [ideas, setIdeas] = useState<PageIdea[]>([]);
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadIdeas = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      const list: PageIdea[] = data.ideas || [];
      setIdeas(list);
      setCount(data.pagesRequested || list.length || 10);
    } catch (e: any) {
      setError(e.message || 'Failed to load ideas');
    } finally {
      setLoading(false);
    }
  };

  const generateIdeas = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/ideas`, { method: 'POST' });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      await loadIdeas();
    } catch (e: any) {
      setError(e.message || 'Failed to generate ideas');
    } finally {
      setGenerating(false);
    }
  };

  const saveAndContinue = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/ideas`, { 
        method: 'PUT', 
        headers: { 'content-type': 'application/json' }, 
        body: JSON.stringify({ 
          count, 
          ideas: ideas.map(i => ({ id: i.id, ideaText: i.ideaText })) 
        }) 
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      router.push(`/projects/${projectId}/render`);
    } catch (e: any) {
      setError(e.message || 'Failed to save ideas');
    } finally {
      setSaving(false);
    }
  };

  const updateIdea = (id: string, text: string) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === id ? { ...idea, ideaText: text } : idea
    ));
  };

  const addIdea = () => {
    const newIdea: PageIdea = {
      id: `temp_${Date.now()}`,
      projectId,
      index: ideas.length + 1,
      ideaText: `New scene ${ideas.length + 1}`,
      status: 'draft'
    };
    setIdeas(prev => [...prev, newIdea]);
    setCount(prev => prev + 1);
  };

  const removeIdea = (id: string) => {
    setIdeas(prev => prev.filter(idea => idea.id !== id));
    setCount(prev => Math.max(1, prev - 1));
  };

  const shuffleIdeas = () => {
    const shuffled = [...ideas].sort(() => Math.random() - 0.5);
    setIdeas(shuffled.map((idea, index) => ({ ...idea, index: index + 1 })));
  };

  useEffect(() => {
    if (projectId) loadIdeas();
  }, [projectId]);

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-2xl flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold">Edit Your Page Ideas</h1>
        </div>
        <p className="text-xl text-muted-fg max-w-2xl mx-auto">
          Review and customize each page concept. Our AI generated these based on your theme, but feel free to make them your own.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
            <span className="text-primary font-medium">Style</span>
          </div>
          <div className="w-12 h-0.5 bg-primary"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <span className="font-medium text-primary">Edit Ideas</span>
          </div>
          <div className="w-12 h-0.5 bg-muted"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-muted text-muted-fg rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <span className="text-muted-fg">Generate</span>
          </div>
          <div className="w-12 h-0.5 bg-muted"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-muted text-muted-fg rounded-full flex items-center justify-center text-sm font-bold">4</div>
            <span className="text-muted-fg">Download</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <Button 
              onClick={generateIdeas} 
              disabled={generating || loading}
              variant="ghost"
              className="gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              {generating ? 'Generating...' : 'Generate New Ideas'}
            </Button>
            
            <Button 
              onClick={shuffleIdeas} 
              disabled={loading || ideas.length === 0}
              variant="ghost"
              className="gap-2"
            >
              <Shuffle className="w-4 h-4" />
              Shuffle
            </Button>

            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-fg" />
              <span className="text-sm text-muted-fg">Pages:</span>
              <input 
                type="number" 
                min={1} 
                max={60} 
                value={count} 
                onChange={(e) => setCount(parseInt(e.target.value || '10', 10))}
                className="w-16 px-2 py-1 bg-muted rounded-lg border-0 focus:ring-2 focus:ring-primary text-sm text-center"
              />
            </div>
          </div>

          <Button 
            onClick={saveAndContinue} 
            disabled={saving || loading || ideas.length === 0}
            className="gap-2 group"
          >
            {saving ? (
              'Saving...'
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save & Continue
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </Card>

      {error && (
        <div className="mb-8">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl">
            <p className="text-destructive text-center">{error}</p>
          </div>
        </div>
      )}

      {/* Ideas List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-muted rounded-xl"></div>
                <div className="flex-1 h-6 bg-muted rounded"></div>
                <div className="w-20 h-8 bg-muted rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {ideas.map((idea, index) => (
            <Card 
              key={idea.id} 
              className="p-6 group hover:shadow-glow transition-all duration-300 animate-slideUp"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                
                <div className="flex-1">
                  {editingId === idea.id ? (
                    <input
                      type="text"
                      value={idea.ideaText}
                      onChange={(e) => updateIdea(idea.id, e.target.value)}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditingId(null);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="w-full px-3 py-2 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-primary focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <div
                      onClick={() => setEditingId(idea.id)}
                      className="px-3 py-2 rounded-xl hover:bg-muted cursor-text transition-colors"
                    >
                      {idea.ideaText}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingId(idea.id)}
                    className="gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </Button>
                  
                  {ideas.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeIdea(idea.id)}
                      className="gap-1 text-destructive hover:text-destructive"
                    >
                      <Minus className="w-3 h-3" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {/* Add New Idea */}
          <Card className="p-6 border-2 border-dashed border-muted-fg/30 hover:border-primary/50 transition-all cursor-pointer group">
            <div 
              onClick={addIdea}
              className="flex items-center justify-center gap-3 text-muted-fg group-hover:text-primary transition-colors"
            >
              <div className="w-10 h-10 bg-muted group-hover:bg-primary/10 rounded-2xl flex items-center justify-center transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <span className="font-medium">Add another page idea</span>
            </div>
          </Card>
        </div>
      )}

      {/* Tips */}
      <Card className="mt-12 p-8 bg-gradient-to-br from-secondary/5 to-primary/5 border-secondary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-2xl flex items-center justify-center flex-shrink-0">
            <Edit3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">💡 Writing Great Page Ideas</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-fg">
              <div>
                <strong>Be specific:</strong> "A friendly dragon reading a book" is better than "a dragon"
              </div>
              <div>
                <strong>Include action:</strong> "Children playing in a garden" vs "children standing"
              </div>
              <div>
                <strong>Add details:</strong> "A cozy cottage with smoke from chimney" creates better scenes
              </div>
              <div>
                <strong>Stay consistent:</strong> Keep the same characters and theme throughout your book
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}