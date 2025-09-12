import Link from 'next/link';
import { ArrowRight, Star, Sparkles, Palette, Zap, Download } from 'lucide-react';

export function Navbar() {
  return (
    <header className="glass fixed top-0 left-0 right-0 z-50 border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">Coloring Studio</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-muted-fg hover:text-fg transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-muted-fg hover:text-fg transition-colors">How it works</Link>
            <Link href="#pricing" className="text-muted-fg hover:text-fg transition-colors">Pricing</Link>
            <Link href="/app" className="btn-primary">Get started</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-card border-t mt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl gradient-text">Coloring Studio</span>
            </div>
            <p className="text-muted-fg">Create beautiful coloring books from any idea using AI.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <div className="space-y-2 text-muted-fg">
              <Link href="/app" className="block hover:text-fg">Dashboard</Link>
              <Link href="#features" className="block hover:text-fg">Features</Link>
              <Link href="#pricing" className="block hover:text-fg">Pricing</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <div className="space-y-2 text-muted-fg">
              <Link href="/about" className="block hover:text-fg">About</Link>
              <Link href="/contact" className="block hover:text-fg">Contact</Link>
              <Link href="/privacy" className="block hover:text-fg">Privacy</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <div className="space-y-2 text-muted-fg">
              <Link href="/docs" className="block hover:text-fg">Documentation</Link>
              <Link href="/support" className="block hover:text-fg">Support</Link>
              <Link href="https://github.com/larbito/bulkimageenhancer" className="block hover:text-fg">GitHub</Link>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-muted-fg">
          © {new Date().getFullYear()} Coloring Studio. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'default',
  className = '', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'default' | 'lg';
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-glow hover:scale-[1.02]",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    ghost: "hover:bg-muted hover:text-fg",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
  };
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    default: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={`bg-card rounded-3xl border shadow-soft hover:shadow-glow transition-all duration-300 ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
}

export function FeatureCard({ icon: Icon, title, description }: { 
  icon: any; 
  title: string; 
  description: string; 
}) {
  return (
    <Card className="p-8 text-center group hover:scale-[1.02] transition-transform">
      <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-pulse-glow">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-muted-fg leading-relaxed">{description}</p>
    </Card>
  );
}

export function StepCard({ number, title, description }: { 
  number: number; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="flex gap-6 group">
      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white font-bold text-lg group-hover:animate-pulse-glow">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-fg leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="pt-32 pb-20">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto animate-slideUp">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Create <span className="gradient-text">Beautiful</span><br />
            Coloring Books with AI
          </h1>
          <p className="text-xl md:text-2xl text-muted-fg mb-12 leading-relaxed max-w-2xl mx-auto">
            Turn any idea into a complete, professional coloring book. 
            Choose your style, generate consistent pages, and export print-ready files.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="group">
              Start Creating
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="ghost" size="lg">
              Watch Demo
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 mt-8 text-muted-fg">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span>Loved by 10,000+ creators</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Features() {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Generation",
      description: "Advanced AI creates unique, consistent coloring pages that match your chosen style and theme perfectly."
    },
    {
      icon: Palette,
      title: "Style Consistency",
      description: "Lock in your preferred line weight, stroke style, and character design for cohesive books."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate complete coloring books in minutes, not hours. Perfect for creators on tight deadlines."
    },
    {
      icon: Download,
      title: "Print Ready",
      description: "Export high-resolution 300 DPI files sized perfectly for 8.5×11 inch printing."
    }
  ];

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fadeIn">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything you need to create
            <span className="gradient-text block">amazing coloring books</span>
          </h2>
          <p className="text-xl text-muted-fg max-w-2xl mx-auto">
            Professional tools powered by cutting-edge AI to bring your creative vision to life.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="animate-slideUp" style={{ animationDelay: `${index * 0.1}s` }}>
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      title: "Describe Your Idea",
      description: "Enter your theme and choose how many pages you want. Our AI will understand your vision."
    },
    {
      title: "Pick Your Style",
      description: "Choose from 5 AI-generated style samples with different line weights and artistic approaches."
    },
    {
      title: "Generate & Edit",
      description: "AI creates unique page ideas. Edit any page description to match your exact vision."
    },
    {
      title: "Export & Print",
      description: "Download high-resolution, print-ready files or get a convenient ZIP of your entire book."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            From idea to print in
            <span className="gradient-text block">4 simple steps</span>
          </h2>
          <p className="text-xl text-muted-fg max-w-2xl mx-auto">
            Our streamlined process makes creating professional coloring books effortless.
          </p>
        </div>
        <div className="max-w-3xl mx-auto space-y-12">
          {steps.map((step, index) => (
            <div key={index} className="animate-slideUp" style={{ animationDelay: `${index * 0.1}s` }}>
              <StepCard number={index + 1} {...step} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}