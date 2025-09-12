"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Play, Pause, Square, RotateCcw, Zap, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Button, Card } from "@/components/ui";
import type { Job } from "@/lib/types";

export default function RenderPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = useMemo(() => String(params?.id || ""), [params]);
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const startRender = async () => {
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/pages`, { 
        method: 'POST', 
        headers: { 'content-type': 'application/json' }, 
        body: JSON.stringify({}) 
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const newJob = await res.json();
      setJob(newJob);
    } catch (e: any) {
      setError(e.message || 'Failed to start render');
    }
  };

  const pollJobStatus = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      if (res.ok) {
        const updatedJob = await res.json();
        setJob(updatedJob);
        
        // Simulate progress based on status
        if (updatedJob.status === 'queued') setProgress(10);
        else if (updatedJob.status === 'running') setProgress(50 + Math.random() * 30);
        else if (updatedJob.status === 'done') {
          setProgress(100);
          setTimeout(() => {
            router.push(`/projects/${projectId}/review`);
          }, 2000);
        }
        else if (updatedJob.status === 'error') setProgress(0);
      }
    } catch (e) {
      console.error('Failed to poll job status:', e);
    }
  };

  useEffect(() => {
    if (!job) return;
    
    const interval = setInterval(() => {
      if (job.status === 'queued' || job.status === 'running') {
        pollJobStatus(job.id);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [job]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'running': return <Zap className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'done': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'running': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'done': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const renderStages = [
    { name: 'Style Analysis', description: 'Analyzing your chosen art style' },
    { name: 'Base Generation', description: 'Creating initial page layouts' },
    { name: 'Detail Enhancement', description: 'Adding fine details and consistency' },
    { name: 'Upscaling', description: 'Enhancing to print resolution' },
    { name: 'Final Processing', description: 'Preparing files for download' }
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold">Generate Your Coloring Book</h1>
        </div>
        <p className="text-xl text-muted-fg max-w-2xl mx-auto">
          Time to bring your ideas to life! Our AI will create consistent, beautiful coloring pages ready for printing.
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
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <span className="font-medium text-primary">Generate</span>
          </div>
          <div className="w-12 h-0.5 bg-muted"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-muted text-muted-fg rounded-full flex items-center justify-center text-sm font-bold">4</div>
            <span className="text-muted-fg">Download</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {!job ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-accent to-secondary rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Play className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Ready to Generate</h2>
            <p className="text-muted-fg mb-8">
              Click the button below to start generating your coloring book pages. This process typically takes 2-5 minutes.
            </p>
            <Button size="lg" onClick={startRender} className="group">
              <Play className="w-5 h-5 mr-2" />
              Start Generation
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Status Card */}
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {getStatusIcon(job.status)}
                <div>
                  <h2 className="text-xl font-bold">Generation {job.status === 'done' ? 'Complete!' : 'In Progress'}</h2>
                  <p className="text-muted-fg">
                    {job.status === 'queued' && 'Your job is queued and will start shortly...'}
                    {job.status === 'running' && 'Creating your coloring book pages...'}
                    {job.status === 'done' && 'All pages have been generated successfully!'}
                    {job.status === 'error' && 'Something went wrong. Please try again.'}
                  </p>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-fg mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  {job.status === 'running' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>

            {job.status === 'error' && job.errorText && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl mb-6">
                <p className="text-destructive text-sm">{job.errorText}</p>
              </div>
            )}

            {job.status === 'done' && (
              <div className="text-center">
                <Button size="lg" onClick={() => router.push(`/projects/${projectId}/review`)} className="group">
                  View Your Coloring Book
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            )}
          </Card>

          {/* Process Stages */}
          <Card className="p-8">
            <h3 className="text-xl font-semibold mb-6">Generation Process</h3>
            <div className="space-y-4">
              {renderStages.map((stage, index) => {
                const isActive = job.status === 'running' && index <= Math.floor(progress / 20);
                const isComplete = job.status === 'done' || (job.status === 'running' && index < Math.floor(progress / 20));
                
                return (
                  <div 
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      isActive ? 'bg-primary/10 border border-primary/20' : 
                      isComplete ? 'bg-green-50 border border-green-200' : 
                      'bg-muted/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isComplete ? 'bg-green-500 text-white' :
                      isActive ? 'bg-primary text-white animate-pulse' :
                      'bg-muted text-muted-fg'
                    }`}>
                      {isComplete ? '✓' : index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{stage.name}</h4>
                      <p className="text-sm text-muted-fg">{stage.description}</p>
                    </div>
                    {isActive && (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {error && (
        <div className="mt-8">
          <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-2xl text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Generation Failed</h3>
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={startRender} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}