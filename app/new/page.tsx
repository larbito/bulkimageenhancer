"use client";

import { useState } from 'react';
import { ArrowRight, Sparkles, Palette, Book, Star, Upload, Type, Wand2, RefreshCw, Loader2 } from 'lucide-react';
import { Button, Card } from '@/components/ui';

export default function NewProjectPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [projectData, setProjectData] = useState({
    idea: '',
    pageCount: 12,
    extractedIdeas: [] as any[],
    generatedPages: [] as any[],
    enhancedPrompt: '',
    originalPrompt: ''
  });

  // Sample generated styles (these would come from API)
  const sampleStyles = [
    { 
      id: 1, 
      name: 'Bold Cartoon Style', 
      description: 'Thick lines, simple shapes, kid-friendly',
      lineThickness: 'thick',
      complexity: 'simple',
      characterStyle: 'cartoon',
      coloringPageUrl: 'https://via.placeholder.com/400x400/ffffff/000000?text=Bold+Cartoon+Style',
      stylePrompt: 'cartoon style, thick black outlines, simple shapes, coloring book page'
    },
    { 
      id: 2, 
      name: 'Detailed Realistic', 
      description: 'Fine lines, intricate details, realistic proportions',
      lineThickness: 'fine',
      complexity: 'detailed',
      characterStyle: 'realistic',
      coloringPageUrl: 'https://via.placeholder.com/400x400/ffffff/000000?text=Detailed+Realistic',
      stylePrompt: 'realistic style, fine line art, detailed, intricate, coloring book page'
    },
    { 
      id: 3, 
      name: 'Medium Line Art', 
      description: 'Balanced lines, moderate detail, versatile',
      lineThickness: 'medium',
      complexity: 'moderate',
      characterStyle: 'semi-realistic',
      coloringPageUrl: 'https://via.placeholder.com/400x400/ffffff/000000?text=Medium+Line+Art',
      stylePrompt: 'medium line weight, balanced detail, coloring book page'
    },
    { 
      id: 4, 
      name: 'Whimsical Fantasy', 
      description: 'Flowing lines, magical elements, dreamy style',
      lineThickness: 'varied',
      complexity: 'moderate',
      characterStyle: 'fantasy',
      coloringPageUrl: 'https://via.placeholder.com/400x400/ffffff/000000?text=Whimsical+Fantasy',
      stylePrompt: 'whimsical fantasy style, flowing lines, magical elements, coloring book page'
    },
    { 
      id: 5, 
      name: 'Minimalist Clean', 
      description: 'Very thin lines, geometric, modern style',
      lineThickness: 'thin',
      complexity: 'simple',
      characterStyle: 'geometric',
      coloringPageUrl: 'https://via.placeholder.com/400x400/ffffff/000000?text=Minimalist+Clean',
      stylePrompt: 'minimalist style, thin lines, geometric shapes, modern, coloring book page'
    }
  ];

  const extractPageIdeas = async () => {
    setLoading(true);
    try {
      console.log('Extracting page ideas from:', projectData.idea);
      
      const response = await fetch('/api/extract-page-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          idea: projectData.idea,
          pageCount: projectData.pageCount 
        })
      });
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Extracted page ideas:', data);
      
      setProjectData({
        ...projectData, 
        extractedIdeas: data.pageIdeas || [],
        enhancedPrompt: data.enhancedPrompt || projectData.idea,
        originalPrompt: data.originalPrompt || projectData.idea
      });
      setStep(2);
    } catch (error) {
      console.error('Error extracting page ideas:', error);
      // Generate fallback page ideas
      const fallbackIdeas = Array.from({length: projectData.pageCount}, (_, i) => ({
        id: i + 1,
        pageNumber: i + 1,
        title: `Page ${i + 1}`,
        description: `A coloring page related to: ${projectData.idea}`,
        editable: true
      }));
      setProjectData({...projectData, extractedIdeas: fallbackIdeas});
      setStep(2);
    }
    setLoading(false);
  };

  const regenerateStyles = async () => {
    setLoading(true);
    try {
      console.log('Regenerating styles for:', projectData.idea);
      
      const response = await fetch('/api/generate-styles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          idea: projectData.idea,
          pageCount: projectData.pageCount,
          regenerate: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Regenerated styles data:', data);
      
      // Always use the API response
      setProjectData({
        ...projectData, 
        extractedIdeas: data.pageIdeas || [],
        enhancedPrompt: data.enhancedPrompt || projectData.idea,
        originalPrompt: data.originalPrompt || projectData.idea
      });
    } catch (error) {
      console.error('Error regenerating styles:', error);
      // Keep existing ideas or use samples if none exist
      if (projectData.extractedIdeas.length === 0) {
        const fallbackIdeas = Array.from({length: projectData.pageCount}, (_, i) => ({
          id: i + 1,
          pageNumber: i + 1,
          title: `Page ${i + 1}`,
          description: `A coloring page related to: ${projectData.idea}`,
          editable: true
        }));
        setProjectData({...projectData, extractedIdeas: fallbackIdeas});
      }
    }
    setLoading(false);
  };

  const selectStyle = (style: any) => {
    setProjectData({...projectData, selectedStyle: style});
    setStep(3);
  };

  const generatePageIdeas = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-page-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: projectData.idea,
          pageCount: projectData.pageCount,
          style: projectData.selectedStyle
        })
      });
      const data = await response.json();
      setProjectData({...projectData, pageIdeas: data.pageIdeas});
      setStep(4);
    } catch (error) {
      console.error('Error generating page ideas:', error);
      // For demo, generate sample page ideas
      const samplePageIdeas = Array.from({length: projectData.pageCount}, (_, i) => ({
        id: i + 1,
        title: `Page ${i + 1}`,
        description: `A coloring page featuring elements from your ${projectData.idea} theme`,
        thumbnail: `https://images.unsplash.com/photo-${1500000000 + i}?w=300&h=300&fit=crop`
      }));
      setProjectData({...projectData, pageIdeas: samplePageIdeas});
      setStep(4);
    }
    setLoading(false);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const proceedToRendering = () => {
    // Redirect to the project rendering page
    window.location.href = `/projects/new-project/render`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
            Create Your Coloring Book
          </h1>
          <p className="text-xl text-muted-fg max-w-2xl mx-auto">
            Transform your ideas into beautiful, AI-generated coloring pages in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[
              { num: 1, label: 'Describe Idea' },
              { num: 2, label: 'Edit Page Ideas' },
              { num: 3, label: 'Generate Pages' },
              { num: 4, label: 'Review & Download' }
            ].map((stepInfo, index) => (
              <div key={stepInfo.num} className="flex items-center">
                <div className="text-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step >= stepInfo.num 
                      ? 'bg-primary text-white' 
                      : 'bg-muted text-muted-fg'
                  }`}>
                    {stepInfo.num}
                  </div>
                  <div className="text-xs mt-1 text-muted-fg">{stepInfo.label}</div>
                </div>
                {index < 3 && (
                  <div className={`w-16 h-1 mx-2 transition-all ${
                    step > stepInfo.num ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="max-w-4xl mx-auto p-8">
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center">
                <Book className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Your Coloring Book Idea</h2>
                <p className="text-muted-fg">Tell us your idea and how many pages you want</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Idea</label>
                  <textarea
                    placeholder="e.g., Magical forest with friendly animals, underwater adventure with sea creatures, space exploration with aliens..."
                    value={projectData.idea}
                    onChange={(e) => setProjectData({...projectData, idea: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 bg-muted rounded-2xl border-0 focus:ring-2 focus:ring-primary focus:outline-none transition-all resize-none"
                  />
                  <p className="text-xs text-muted-fg mt-2">Be as descriptive as possible - this helps generate better styles and pages!</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Number of Pages</label>
                  <select
                    value={projectData.pageCount}
                    onChange={(e) => setProjectData({...projectData, pageCount: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-muted rounded-2xl border-0 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  >
                    <option value={8}>8 Pages</option>
                    <option value={12}>12 Pages</option>
                    <option value={16}>16 Pages</option>
                    <option value={24}>24 Pages</option>
                    <option value={32}>32 Pages</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="text-center">
                <Type className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Edit Your Page Ideas</h2>
                <p className="text-muted-fg">AI extracted {projectData.extractedIdeas.length} page ideas from your description. Edit any page before generating!</p>
              </div>

              {/* Enhanced Prompt Display */}
              {projectData.enhancedPrompt && projectData.enhancedPrompt !== projectData.originalPrompt && (
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-3 text-green-800">🧠 AI Understood Your Idea</h3>
                    <div className="space-y-3">
                      <div className="bg-white/70 rounded-lg p-3 border border-green-100">
                        <p className="text-sm text-gray-600 mb-1">Your description:</p>
                        <p className="text-gray-800 italic">"{projectData.originalPrompt}"</p>
                      </div>
                      <div className="text-green-600 font-medium">↓ Extracted theme ↓</div>
                      <div className="bg-green-100 rounded-lg p-3 border border-green-200">
                        <p className="text-sm text-green-600 mb-1">Main theme:</p>
                        <p className="text-green-800 font-semibold">"{projectData.enhancedPrompt}"</p>
                      </div>
                    </div>
                    <p className="text-xs text-green-600 mt-3">All pages will follow this consistent theme and character style!</p>
                  </div>
                </Card>
              )}

              {/* Page Ideas Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectData.extractedIdeas.map((pageIdea, index) => (
                  <Card key={pageIdea.id} className="p-4 hover:shadow-lg transition-all">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                          Page {pageIdea.pageNumber}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            // Regenerate this specific page idea
                            console.log('Regenerate page', pageIdea.id);
                          }}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Page Title</label>
                          <input
                            type="text"
                            value={pageIdea.title}
                            onChange={(e) => {
                              const updatedIdeas = projectData.extractedIdeas.map(p => 
                                p.id === pageIdea.id ? {...p, title: e.target.value} : p
                              );
                              setProjectData({...projectData, extractedIdeas: updatedIdeas});
                            }}
                            className="w-full px-3 py-2 bg-muted rounded-lg border-0 focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <textarea
                            value={pageIdea.description}
                            onChange={(e) => {
                              const updatedIdeas = projectData.extractedIdeas.map(p => 
                                p.id === pageIdea.id ? {...p, description: e.target.value} : p
                              );
                              setProjectData({...projectData, extractedIdeas: updatedIdeas});
                            }}
                            rows={3}
                            className="w-full px-3 py-2 bg-muted rounded-lg border-0 focus:ring-2 focus:ring-primary focus:outline-none text-sm resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Add/Remove Pages */}
              <div className="flex justify-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    const newPage = {
                      id: projectData.extractedIdeas.length + 1,
                      pageNumber: projectData.extractedIdeas.length + 1,
                      title: `Page ${projectData.extractedIdeas.length + 1}`,
                      description: `Another page about ${projectData.enhancedPrompt || projectData.idea}`,
                      editable: true
                    };
                    setProjectData({
                      ...projectData, 
                      extractedIdeas: [...projectData.extractedIdeas, newPage],
                      pageCount: projectData.extractedIdeas.length + 1
                    });
                  }}
                >
                  + Add Page
                </Button>
                
                {projectData.extractedIdeas.length > 1 && (
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      const updatedIdeas = projectData.extractedIdeas.slice(0, -1);
                      setProjectData({
                        ...projectData, 
                        extractedIdeas: updatedIdeas,
                        pageCount: updatedIdeas.length
                      });
                    }}
                  >
                    - Remove Page
                  </Button>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="text-center">
                <Wand2 className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Generate Page Ideas</h2>
                <p className="text-muted-fg">AI will create {projectData.pageCount} page ideas in your chosen style</p>
              </div>

              {/* Selected Style Preview */}
              <Card className="bg-gradient-to-r from-primary/10 to-accent/10 p-6">
                <h3 className="font-semibold text-lg mb-4">Selected Style</h3>
                <div className="flex items-center gap-4">
                  <img 
                    src={projectData.selectedStyle?.thumbnail} 
                    alt={projectData.selectedStyle?.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{projectData.selectedStyle?.name}</h4>
                    <p className="text-sm text-muted-fg">{projectData.selectedStyle?.description}</p>
                  </div>
                </div>
              </Card>

              <div className="text-center">
                <Button 
                  onClick={generatePageIdeas}
                  disabled={loading}
                  size="lg"
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Page Ideas...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate {projectData.pageCount} Page Ideas
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <div className="text-center">
                <Star className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Review & Edit Page Ideas</h2>
                <p className="text-muted-fg">Edit page ideas and adjust page count if needed</p>
              </div>

              {/* Page Count Adjuster */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <label className="font-medium">Page Count:</label>
                <select
                  value={projectData.pageCount}
                  onChange={(e) => {
                    const newCount = parseInt(e.target.value);
                    setProjectData({...projectData, pageCount: newCount});
                    // Would trigger re-generation of page ideas
                  }}
                  className="px-4 py-2 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value={8}>8 Pages</option>
                  <option value={12}>12 Pages</option>
                  <option value={16}>16 Pages</option>
                  <option value={24}>24 Pages</option>
                  <option value={32}>32 Pages</option>
                </select>
              </div>

              {/* Page Ideas Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectData.pageIdeas.map((page, index) => (
                  <Card key={page.id} className="p-4">
                    <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg mb-3 overflow-hidden">
                      <img 
                        src={page.thumbnail} 
                        alt={page.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <input
                      type="text"
                      value={page.title}
                      onChange={(e) => {
                        const updatedIdeas = projectData.pageIdeas.map(p => 
                          p.id === page.id ? {...p, title: e.target.value} : p
                        );
                        setProjectData({...projectData, pageIdeas: updatedIdeas});
                      }}
                      className="w-full font-semibold mb-2 bg-transparent border-0 focus:bg-muted rounded px-2 py-1 focus:outline-none"
                    />
                    <textarea
                      value={page.description}
                      onChange={(e) => {
                        const updatedIdeas = projectData.pageIdeas.map(p => 
                          p.id === page.id ? {...p, description: e.target.value} : p
                        );
                        setProjectData({...projectData, pageIdeas: updatedIdeas});
                      }}
                      rows={2}
                      className="w-full text-sm text-muted-fg bg-transparent border-0 focus:bg-muted rounded px-2 py-1 focus:outline-none resize-none"
                    />
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              disabled={step === 1 || loading}
              className="gap-2"
            >
              ← Back
            </Button>

            <div className="text-sm text-muted-fg">
              Step {step} of 4
            </div>

            {step === 1 && (
              <Button 
                onClick={extractPageIdeas}
                disabled={!projectData.idea || loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting Ideas...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Extract Page Ideas
                  </>
                )}
              </Button>
            )}

            {step === 2 && (
              <Button 
                onClick={() => setStep(3)}
                disabled={projectData.extractedIdeas.length === 0}
                className="gap-2"
              >
                <Wand2 className="w-4 h-4" />
                Generate All Pages ({projectData.extractedIdeas.length} pages)
              </Button>
            )}

            {step === 3 && (
              <div className="text-sm text-muted-fg">
                Click Generate to create page ideas
              </div>
            )}

            {step === 4 && (
              <Button 
                onClick={proceedToRendering}
                disabled={projectData.pageIdeas.length === 0}
                className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Wand2 className="w-4 h-4" />
                Render Pages
              </Button>
            )}
          </div>
        </Card>

        {/* Features Preview */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center mb-12">What happens next?</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: <Wand2 className="w-8 h-8 text-primary" />,
                title: "AI Generation",
                description: "Our AI creates unique coloring pages based on your specifications"
              },
              {
                icon: <Star className="w-8 h-8 text-primary" />,
                title: "Review & Edit", 
                description: "Preview and customize your pages before finalizing"
              },
              {
                icon: <Upload className="w-8 h-8 text-primary" />,
                title: "Download & Print",
                description: "Get high-quality PDF files ready for printing"
              }
            ].map((feature, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="mb-4">{feature.icon}</div>
                <h4 className="font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-fg">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
