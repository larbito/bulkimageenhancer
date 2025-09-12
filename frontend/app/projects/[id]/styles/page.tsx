"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw, Palette, Check, Sparkles, ArrowRight } from "lucide-react";
import { Button, Card } from "@/components/ui";
import type { StyleCandidate } from "@/lib/types";

export default function StyleChooserPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = useMemo(() => String(params?.id || ""), [params]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<StyleCandidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const loadStyles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy?path=projects/${projectId}/styles`, { 
        method: "POST", 
        headers: { "content-type": "application/json" }, 
        body: JSON.stringify({ n: 5 }) 
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setCandidates(data.candidates || []);
    } catch (e: any) {
      setError(e.message || "Failed to load styles");
    } finally {
      setLoading(false);
    }
  };

  const regenerateStyles = async () => {
    setRegenerating(true);
    await loadStyles();
    setRegenerating(false);
  };

  const selectStyle = async (id: string) => {
    setSelecting(id);
    try {
      const res = await fetch(`/api/proxy?path=projects/${projectId}/styles/select`, { 
        method: "POST", 
        headers: { "content-type": "application/json" }, 
        body: JSON.stringify({ id }) 
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setSelectedStyle(id);
      setTimeout(() => {
        router.push(`/projects/${projectId}/ideas`);
      }, 1000);
    } catch (e: any) {
      setError(e.message || "Failed to select style");
    } finally {
      setSelecting(null);
    }
  };

  useEffect(() => {
    if (projectId) loadStyles();
  }, [projectId]);

  const getStyleDetails = (index: number) => {
    const styles = [
      { thickness: "Thin", stroke: "Clean", framing: "Full Body" },
      { thickness: "Medium", stroke: "Clean", framing: "Half Body" },
      { thickness: "Thick", stroke: "Clean", framing: "Full Body" },
      { thickness: "Thin", stroke: "Sketchy", framing: "Half Body" },
      { thickness: "Medium", stroke: "Clean", framing: "Full Body" }
    ];
    return styles[index] || styles[0];
  };

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold">Choose Your Art Style</h1>
        </div>
        <p className="text-xl text-muted-fg max-w-2xl mx-auto">
          Select the artistic style that best matches your vision. This will be used consistently throughout your entire coloring book.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <span className="font-medium text-primary">Choose Style</span>
          </div>
          <div className="w-12 h-0.5 bg-muted"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-muted text-muted-fg rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <span className="text-muted-fg">Edit Ideas</span>
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
      <div className="flex justify-center mb-8">
        <Button 
          onClick={regenerateStyles} 
          disabled={loading || regenerating}
          variant="ghost"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
          {regenerating ? 'Generating...' : 'Regenerate Styles'}
        </Button>
      </div>

      {error && (
        <div className="max-w-md mx-auto mb-8">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-center">
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Style Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="aspect-[4/5] bg-muted"></div>
              <div className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {candidates.map((candidate, index) => {
            const details = getStyleDetails(index);
            const isSelected = selectedStyle === candidate.id;
            const isSelecting = selecting === candidate.id;
            
            return (
              <Card 
                key={candidate.id} 
                className={`overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02] animate-slideUp ${
                  isSelected ? 'ring-2 ring-primary shadow-glow' : 'hover:shadow-glow'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => !isSelecting && !selectedStyle && selectStyle(candidate.id)}
              >
                <div className="aspect-[4/5] bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                  <img 
                    src={candidate.thumbnailUrl} 
                    alt={`Style ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  
                  {/* Style badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                    <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full backdrop-blur-sm">
                      {details.thickness}
                    </span>
                    <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full backdrop-blur-sm">
                      {details.stroke}
                    </span>
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center animate-pulse-glow">
                        <Check className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Loading indicator */}
                  {isSelecting && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">Style {index + 1}</h3>
                    <span className="text-sm text-muted-fg">{details.framing}</span>
                  </div>
                  
                  <p className="text-sm text-muted-fg mb-4 line-clamp-2">
                    {candidate.promptText}
                  </p>
                  
                  <Button 
                    size="sm" 
                    className="w-full group"
                    disabled={isSelecting || !!selectedStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectStyle(candidate.id);
                    }}
                  >
                    {isSelecting ? (
                      'Selecting...'
                    ) : isSelected ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Selected
                      </>
                    ) : (
                      <>
                        Select Style
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tips */}
      <Card className="mt-12 p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">💡 Choosing the Right Style</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-fg">
              <div>
                <strong>Thin lines:</strong> Great for detailed, intricate designs. Perfect for older kids and adults.
              </div>
              <div>
                <strong>Thick lines:</strong> Easier for younger children to color within. More forgiving and bold.
              </div>
              <div>
                <strong>Clean strokes:</strong> Crisp, professional look. Works well for any subject matter.
              </div>
              <div>
                <strong>Sketchy strokes:</strong> More artistic, hand-drawn feel. Great for whimsical themes.
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}