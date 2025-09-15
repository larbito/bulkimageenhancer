"use client";

import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Calendar, Eye } from 'lucide-react';
import { Button, Card } from '@/components/ui';

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const projects = [
    {
      id: '1',
      title: 'Magical Forest Adventures',
      pages: 24,
      status: 'completed',
      thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=center',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '2', 
      title: 'Ocean Creatures',
      pages: 16,
      status: 'in_progress',
      thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&crop=center',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18'
    },
    {
      id: '3',
      title: 'Space Explorers',
      pages: 32,
      status: 'draft',
      thumbnail: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop&crop=center',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-12'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Your Projects</h1>
          <p className="text-muted-fg mt-2">Create and manage your coloring book projects</p>
        </div>
        <a href="/new">
          <Button size="lg" className="group">
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
            New Project
          </Button>
        </a>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-fg w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-muted rounded-2xl border-0 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            />
          </div>
          <Button variant="ghost" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <Card 
            key={project.id} 
            className="group hover:scale-[1.02] cursor-pointer overflow-hidden animate-slideUp"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
              <img 
                src={project.thumbnail} 
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute top-4 right-4">
                <button className="p-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              
              <p className="text-muted-fg text-sm mb-4">{project.pages} pages</p>
              
              <div className="flex items-center justify-between text-sm text-muted-fg">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(project.updatedAt).toLocaleDateString()}
                </div>
                <Button variant="ghost" size="sm" className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-4 h-4" />
                  View
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {/* Empty State / New Project Card */}
        <a href="/new">
          <Card className="group hover:scale-[1.02] cursor-pointer border-2 border-dashed border-muted-fg/30 hover:border-primary/50 transition-all duration-300 animate-slideUp" style={{ animationDelay: '0.3s' }}>
            <div className="aspect-[4/3] flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Create New Project</h3>
              <p className="text-sm text-muted-fg">Start your next coloring book</p>
            </div>
          </Card>
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {[
          { label: 'Total Projects', value: '12', change: '+2 this month' },
          { label: 'Pages Created', value: '284', change: '+24 this week' },
          { label: 'Downloads', value: '1.2k', change: '+156 today' }
        ].map((stat, index) => (
          <Card key={index} className="p-6 text-center animate-slideUp" style={{ animationDelay: `${0.4 + index * 0.1}s` }}>
            <div className="text-3xl font-bold gradient-text mb-2">{stat.value}</div>
            <div className="text-muted-fg font-medium mb-1">{stat.label}</div>
            <div className="text-sm text-green-600">{stat.change}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
