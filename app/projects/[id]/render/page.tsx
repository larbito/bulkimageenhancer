"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Play, Pause, Download, Zap, Clock, CheckCircle2, XCircle, ArrowRight, Loader2, Image } from "lucide-react";
import { Button, Card } from "@/components/ui";

interface RenderPage {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'rendering' | 'completed' | 'error';
  originalUrl?: string;
  renderUrl?: string;
  upscaledUrl?: string;
  renderTime?: number;
}

export default function RenderPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = String(params?.id || "");
  
  const [pages, setPages] = useState<RenderPage[]>([]);
  const [renderingStatus, setRenderingStatus] = useState<'idle' | 'rendering' | 'upscaling' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demo - this would come from the previous step
  useEffect(() => {
    // Simulate loading page ideas from the previous step
    const mockPages: RenderPage[] = Array.from({length: 12}, (_, i) => ({
      id: i + 1,
      title: `Magical Forest Page ${i + 1}`,
      description: `A coloring page featuring magical forest elements`,
      status: 'pending'
    }));
    setPages(mockPages);
  }, []);

  const startRendering = async () => {
    setRenderingStatus('rendering');
    setError(null);
    setProgress(0);

    try {
      // Update all pages to rendering status
      setPages(prev => prev.map(page => ({ ...page, status: 'rendering' as const })));

      const response = await fetch('/api/render-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          pageIdeas: pages,
          style: { id: 1, name: 'Cartoon Style', stylePrompt: 'cartoon style, bold outlines' }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start rendering');
      }

      const data = await response.json();
      
      // Simulate progressive rendering
      for (let i = 0; i < pages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds per page
        
        setPages(prev => prev.map((page, index) => 
          index === i 
            ? { 
                ...page, 
                status: 'completed',
                renderUrl: `https://images.unsplash.com/photo-${1600000000 + i}?w=800&h=800&fit=crop`,
                renderTime: Math.floor(Math.random() * 30) + 10
              }
            : page
        ));
        
        setProgress(((i + 1) / pages.length) * 100);
      }

      setRenderingStatus('completed');
    } catch (error: any) {
      setError(error.message);
      setRenderingStatus('idle');
      setPages(prev => prev.map(page => ({ ...page, status: 'error' })));
    }
  };

  const startUpscaling = async () => {
    setRenderingStatus('upscaling');
    setProgress(0);

    try {
      const response = await fetch('/api/upscale-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          pageIds: 'all',
          upscaleFactor: 2
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start upscaling');
      }

      // Simulate upscaling progress
      for (let i = 0; i < pages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second per page
        
        setPages(prev => prev.map((page, index) => 
          index === i 
            ? { 
                ...page, 
                upscaledUrl: `https://images.unsplash.com/photo-${1600000000 + i}?w=1600&h=1600&fit=crop`
              }
            : page
        ));
        
        setProgress(((i + 1) / pages.length) * 100);
      }

      setRenderingStatus('completed');
    } catch (error: any) {
      setError(error.message);
      setRenderingStatus('idle');
    }
  };

  const downloadPage = async (pageId: number) => {
    try {
      const response = await fetch(`/api/download?projectId=${projectId}&pageId=${pageId}&format=single`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coloring_page_${pageId}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Download error:', error);
    }
  };

  const downloadAllPages = async () => {
    try {
      const response = await fetch(`/api/download?projectId=${projectId}&format=zip`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coloring_book_${projectId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Download error:', error);
    }
  };

  const completedPages = pages.filter(page => page.status === 'completed');
  const upscaledPages = pages.filter(page => page.upscaledUrl);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Render Pages</h1>
          <p className="text-muted-fg mt-2">Generate your coloring book pages with consistent style</p>
        </div>
        
        {renderingStatus === 'completed' && (
          <Button onClick={downloadAllPages} className="gap-2">
            <Download className="w-4 h-4" />
            Download All ({pages.length} pages)
          </Button>
        )}
      </div>

      {/* Progress Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Generation Progress</h3>
          <div className="text-sm text-muted-fg">
            {completedPages.length} of {pages.length} pages completed
          </div>
        </div>
        
        <div className="w-full bg-muted rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex gap-4">
          {renderingStatus === 'idle' && (
            <Button onClick={startRendering} className="gap-2">
              <Play className="w-4 h-4" />
              Start Rendering
            </Button>
          )}
          
          {renderingStatus === 'completed' && upscaledPages.length === 0 && (
            <Button onClick={startUpscaling} variant="secondary" className="gap-2">
              <Zap className="w-4 h-4" />
              Upscale Pages (2x)
            </Button>
          )}

          {renderingStatus === 'completed' && upscaledPages.length > 0 && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              All pages rendered and upscaled!
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <XCircle className="w-5 h-5" />
            {error}
          </div>
        )}
      </Card>

      {/* Pages Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {pages.map((page) => (
          <Card key={page.id} className="overflow-hidden">
            <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 relative">
              {page.renderUrl ? (
                <img 
                  src={page.upscaledUrl || page.renderUrl} 
                  alt={page.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {page.status === 'rendering' ? (
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  ) : (
                    <Image className="w-8 h-8 text-muted-fg" />
                  )}
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                {page.status === 'completed' && (
                  <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Done
                  </div>
                )}
                {page.status === 'rendering' && (
                  <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Rendering
                  </div>
                )}
                {page.status === 'error' && (
                  <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Error
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold mb-1 line-clamp-1">{page.title}</h3>
              <p className="text-sm text-muted-fg mb-3 line-clamp-2">{page.description}</p>
              
              {page.status === 'completed' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => downloadPage(page.id)}
                  className="w-full gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              )}
              
              {page.renderTime && (
                <div className="text-xs text-muted-fg mt-2">
                  Rendered in {page.renderTime}s
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Next Step */}
      {renderingStatus === 'completed' && (
        <Card className="p-8 text-center bg-gradient-to-r from-primary/10 to-accent/10">
          <h3 className="text-2xl font-bold mb-4">🎉 Your Coloring Book is Ready!</h3>
          <p className="text-muted-fg mb-6">
            All {pages.length} pages have been generated with consistent style and line weight.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={downloadAllPages} size="lg" className="gap-2">
              <Download className="w-5 h-5" />
              Download All Pages (ZIP)
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => router.push(`/projects/${projectId}/review`)}
              className="gap-2"
            >
              Review Project <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}