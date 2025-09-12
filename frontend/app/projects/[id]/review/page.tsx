"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Download, Package, Eye, Grid3X3, List, Filter, Search, Star } from "lucide-react";
import { Button, Card } from "@/components/ui";
import type { PageImage } from "@/lib/types";

export default function ReviewPage() {
  const params = useParams();
  const projectId = useMemo(() => String(params?.id || ""), [params]);
  const [finals, setFinals] = useState<PageImage[]>([]);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [buildingZip, setBuildingZip] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const loadProject = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proxy?path=projects/${projectId}`);
      if (!res.ok) return;
      const data = await res.json();
      const images: PageImage[] = (data.ideas || [])
        .flatMap((i: any) => (i.images || []))
        .filter((im: PageImage) => im.stage === 'upscaled');
      setFinals(images);
    } catch (e) {
      console.error('Failed to load project:', e);
    } finally {
      setLoading(false);
    }
  };

  const buildZip = async () => {
    setBuildingZip(true);
    try {
      const res = await fetch(`/api/proxy?path=projects/${projectId}/export`, { method: 'POST' });
      if (!res.ok) return;
      const data = await res.json();
      setZipUrl(data.url);
    } catch (e) {
      console.error('Failed to build ZIP:', e);
    } finally {
      setBuildingZip(false);
    }
  };

  const togglePageSelection = (pageId: string) => {
    const newSelection = new Set(selectedPages);
    if (newSelection.has(pageId)) {
      newSelection.delete(pageId);
    } else {
      newSelection.add(pageId);
    }
    setSelectedPages(newSelection);
  };

  const selectAllPages = () => {
    setSelectedPages(new Set(finals.map(img => img.id)));
  };

  const clearSelection = () => {
    setSelectedPages(new Set());
  };

  useEffect(() => {
    if (projectId) loadProject();
  }, [projectId]);

  const filteredPages = finals.filter(img => 
    searchQuery === '' || 
    img.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-primary rounded-2xl flex items-center justify-center">
            <Star className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold">Your Coloring Book is Ready!</h1>
        </div>
        <p className="text-xl text-muted-fg max-w-2xl mx-auto">
          Review your generated pages and download individual files or get everything as a ZIP package.
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
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
            <span className="text-primary font-medium">Ideas</span>
          </div>
          <div className="w-12 h-0.5 bg-primary"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
            <span className="text-primary font-medium">Generate</span>
          </div>
          <div className="w-12 h-0.5 bg-primary"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
            <span className="font-medium text-primary">Download</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left side - Search and filters */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-fg w-4 h-4" />
              <input
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-primary focus:outline-none w-64"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-fg">
              {selectedPages.size > 0 ? `${selectedPages.size} selected` : `${finals.length} pages`}
            </div>
            
            {selectedPages.size > 0 && (
              <>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download Selected
                </Button>
              </>
            )}
            
            <Button variant="ghost" size="sm" onClick={selectAllPages}>
              Select All
            </Button>
            
            <Button 
              onClick={buildZip} 
              disabled={buildingZip}
              className="gap-2"
            >
              <Package className="w-4 h-4" />
              {buildingZip ? 'Building ZIP...' : 'Download All as ZIP'}
            </Button>
          </div>
        </div>

        {zipUrl && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">ZIP package ready!</span>
              </div>
              <a 
                href={zipUrl} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download ZIP
              </a>
            </div>
          </div>
        )}
      </Card>

      {/* Pages Grid/List */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6' : 'space-y-4'}>
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className={viewMode === 'grid' ? 'aspect-[4/5] bg-muted' : 'h-24 bg-muted'}></div>
              {viewMode === 'grid' && (
                <div className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredPages.map((img, index) => (
            <Card 
              key={img.id} 
              className={`overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02] animate-slideUp ${
                selectedPages.has(img.id) ? 'ring-2 ring-primary shadow-glow' : 'hover:shadow-glow'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => togglePageSelection(img.id)}
            >
              <div className="aspect-[4/5] bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                <img 
                  src={img.url} 
                  alt={`Page ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {/* Selection indicator */}
                {selectedPages.has(img.id) && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="bg-white/20 text-white hover:bg-white/30">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="bg-white/20 text-white hover:bg-white/30">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Page {index + 1}</h3>
                  <span className="text-xs text-muted-fg">
                    {img.width} × {img.height}
                  </span>
                </div>
                <p className="text-sm text-muted-fg mt-1">300 DPI • Print Ready</p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPages.map((img, index) => (
            <Card 
              key={img.id}
              className={`p-6 group cursor-pointer transition-all hover:shadow-glow animate-slideUp ${
                selectedPages.has(img.id) ? 'ring-2 ring-primary shadow-glow' : ''
              }`}
              style={{ animationDelay: `${index * 0.02}s` }}
              onClick={() => togglePageSelection(img.id)}
            >
              <div className="flex items-center gap-6">
                <div className="w-20 h-24 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src={img.url} 
                    alt={`Page ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Page {index + 1}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-fg">
                    <div>
                      <span className="font-medium">Size:</span> {img.width} × {img.height}
                    </div>
                    <div>
                      <span className="font-medium">DPI:</span> 300
                    </div>
                    <div>
                      <span className="font-medium">Format:</span> PNG
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> Ready
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Success Message */}
      <Card className="mt-12 p-8 bg-gradient-to-br from-green-50 to-primary/5 border-green-200 dark:from-green-900/20 dark:border-green-800">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Congratulations! 🎉</h2>
          <p className="text-muted-fg mb-6">
            Your coloring book has been successfully generated with consistent styling and high-quality artwork. 
            All pages are print-ready at 300 DPI resolution for crisp, professional results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={buildZip} className="gap-2">
              <Package className="w-5 h-5" />
              Download Complete Book
            </Button>
            <Button size="lg" variant="ghost" onClick={() => window.location.href = '/app/new'}>
              Create Another Book
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}