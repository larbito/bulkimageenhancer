"use client";

import { useState } from 'react';
import { ArrowRight, Sparkles, Palette, Book, Star, Upload, Type, Wand2 } from 'lucide-react';
import { Button, Card } from '@/components/ui';

export default function NewProjectPage() {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    style: '',
    pages: 12,
    theme: ''
  });

  const styles = [
    { id: 'realistic', name: 'Realistic', description: 'Detailed, lifelike illustrations', icon: '🎨' },
    { id: 'cartoon', name: 'Cartoon', description: 'Fun, animated style perfect for kids', icon: '🎪' },
    { id: 'minimalist', name: 'Minimalist', description: 'Simple, clean lines and shapes', icon: '✨' },
    { id: 'fantasy', name: 'Fantasy', description: 'Magical creatures and worlds', icon: '🧚' },
    { id: 'nature', name: 'Nature', description: 'Animals, plants, and landscapes', icon: '🌿' },
    { id: 'geometric', name: 'Geometric', description: 'Patterns and abstract shapes', icon: '🔷' }
  ];

  const themes = [
    'Animals', 'Fairy Tales', 'Space Adventure', 'Ocean Life', 'Forest Friends', 
    'Dinosaurs', 'Princesses', 'Vehicles', 'Food & Treats', 'Seasons'
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreateProject = () => {
    // This would typically call an API to create the project
    console.log('Creating project:', projectData);
    // For now, redirect to projects page
    window.location.href = '/projects';
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
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step >= stepNum 
                    ? 'bg-primary text-white' 
                    : 'bg-muted text-muted-fg'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 h-1 mx-2 transition-all ${
                    step > stepNum ? 'bg-primary' : 'bg-muted'
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
                <h2 className="text-3xl font-bold mb-2">Project Details</h2>
                <p className="text-muted-fg">Tell us about your coloring book idea</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Magical Forest Adventures"
                    value={projectData.title}
                    onChange={(e) => setProjectData({...projectData, title: e.target.value})}
                    className="w-full px-4 py-3 bg-muted rounded-2xl border-0 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Number of Pages</label>
                  <select
                    value={projectData.pages}
                    onChange={(e) => setProjectData({...projectData, pages: parseInt(e.target.value)})}
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

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  placeholder="Describe your coloring book theme, characters, or story..."
                  value={projectData.description}
                  onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 bg-muted rounded-2xl border-0 focus:ring-2 focus:ring-primary focus:outline-none transition-all resize-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="text-center">
                <Palette className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Choose Your Style</h2>
                <p className="text-muted-fg">Select the artistic style for your coloring book</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {styles.map((style) => (
                  <Card 
                    key={style.id}
                    className={`p-6 cursor-pointer transition-all hover:scale-[1.02] ${
                      projectData.style === style.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => setProjectData({...projectData, style: style.id})}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">{style.icon}</div>
                      <h3 className="font-semibold text-lg mb-2">{style.name}</h3>
                      <p className="text-sm text-muted-fg">{style.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="text-center">
                <Wand2 className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Choose a Theme</h2>
                <p className="text-muted-fg">What should your coloring book be about?</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {themes.map((theme) => (
                  <Button
                    key={theme}
                    variant={projectData.theme === theme ? "primary" : "ghost"}
                    className={`h-auto py-4 px-6 text-center transition-all ${
                      projectData.theme === theme ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setProjectData({...projectData, theme})}
                  >
                    {theme}
                  </Button>
                ))}
              </div>

              {/* Project Summary */}
              <Card className="bg-gradient-to-r from-primary/10 to-accent/10 p-6">
                <h3 className="font-semibold text-lg mb-4">Project Summary</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Title:</strong> {projectData.title || 'Untitled Project'}</div>
                  <div><strong>Pages:</strong> {projectData.pages}</div>
                  <div><strong>Style:</strong> {styles.find(s => s.id === projectData.style)?.name || 'Not selected'}</div>
                  <div><strong>Theme:</strong> {projectData.theme || 'Not selected'}</div>
                </div>
                {projectData.description && (
                  <div className="mt-4">
                    <strong>Description:</strong> {projectData.description}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              disabled={step === 1}
              className="gap-2"
            >
              ← Back
            </Button>

            <div className="text-sm text-muted-fg">
              Step {step} of 3
            </div>

            {step < 3 ? (
              <Button 
                onClick={handleNext}
                disabled={
                  (step === 1 && !projectData.title) ||
                  (step === 2 && !projectData.style)
                }
                className="gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleCreateProject}
                disabled={!projectData.title || !projectData.style || !projectData.theme}
                className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Sparkles className="w-4 h-4" />
                Create Project
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
