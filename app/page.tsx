"use client";

import { Navbar, Footer, Hero, Features, HowItWorks } from "@/components/ui";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        
        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
            <div className="bg-gradient-to-r from-primary to-accent rounded-3xl p-12 md:p-20 text-white animate-fadeIn">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to create your first coloring book?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of creators who are already making beautiful coloring books with AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/new" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-200 hover:scale-[1.02]"
                >
                  Start Creating Now
                </a>
                <a 
                  href="#features" 
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all duration-200"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-6 text-center">
            <h3 className="text-2xl font-semibold mb-12 text-muted-fg">
              Trusted by creators worldwide
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
              {['Teachers', 'Parents', 'Publishers', 'Artists'].map((category, index) => (
                <div key={index} className="text-lg font-medium">{category}</div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}