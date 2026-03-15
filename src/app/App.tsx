import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Heart, Share2, Plus } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeatureGrid } from './components/FeatureGrid';
import { CanvasMockup } from './components/CanvasMockup';
import { Footer } from './components/Footer';
import { InfiniteCanvas } from './components/InfiniteCanvas';

const CommunityShowcase = () => {
  const works = [
    { id: 1, title: 'Cyberpunk Tokyo', creator: '@neon_dreamer', likes: '1.2k', image: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=600&h=800&fit=crop' },
    { id: 2, title: 'Ethereal Silk', creator: '@jessie_qin', likes: '3.4k', image: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=600&h=800&fit=crop' },
    { id: 3, title: 'Future Ads', creator: '@creative_ai', likes: '890', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&h=800&fit=crop' },
    { id: 4, title: 'Nature Reimagined', creator: '@eco_artist', likes: '2.1k', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&h=800&fit=crop' },
  ];

  return (
    <section className="py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">TapNow Community</h2>
            <p className="text-white/60">
              Explore a massive library of high-quality works. Clone professional templates, analyze the logic, and remix them to jumpstart your own creation.
            </p>
          </div>
          <button className="px-8 py-3 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm font-bold tracking-widest uppercase text-white">
            Explore All Works
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {works.map((work, index) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/5"
            >
              <img 
                src={work.image} 
                alt={work.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                <h3 className="text-lg font-bold mb-1 text-white">{work.title}</h3>
                <p className="text-xs text-white/60 mb-4">{work.creator}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1 text-[10px] font-bold text-white/80">
                      <Heart size={14} /> {work.likes}
                    </button>
                    <button className="flex items-center gap-1 text-[10px] font-bold text-white/80">
                      <Share2 size={14} />
                    </button>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play size={16} fill="white" className="text-white" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function App() {
  const [view, setView] = useState<'landing' | 'canvas'>('canvas'); // Default to canvas based on the user's prompt context

  return (
    <div className="min-h-screen selection:bg-white selection:text-black bg-[#0a0a0a] text-white">
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Navbar />
            <main>
              <Hero onStart={() => setView('canvas')} />
              <FeatureGrid />
              <CanvasMockup />
              <CommunityShowcase />
              
              <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 -z-10" />
                <div className="max-w-4xl mx-auto px-6 text-center">
                  <h2 className="text-4xl md:text-7xl font-bold mb-8 tracking-tighter text-white">
                    Ready to orchestrate <br />
                    the future?
                  </h2>
                  <p className="text-white/60 text-lg mb-12 max-w-xl mx-auto">
                    Join thousands of creators building the next generation of AI-native visuals.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                      onClick={() => setView('canvas')}
                      className="w-full sm:w-auto bg-white text-black font-bold px-10 py-4 rounded-full hover:scale-105 transition-transform tracking-widest text-sm"
                    >
                      GET STARTED FOR FREE
                    </button>
                    <button className="w-full sm:w-auto px-10 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors tracking-widest text-sm font-bold text-white">
                      CONTACT SALES
                    </button>
                  </div>
                </div>
              </section>
            </main>
            <Footer />
          </motion.div>
        ) : (
          <motion.div
            key="canvas"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-screen relative"
          >
            <InfiniteCanvas />
            {/* Back to landing button (for demo purposes) */}
            <button 
              onClick={() => setView('landing')}
              className="absolute top-4 left-4 z-[60] w-8 h-8 bg-white rounded flex items-center justify-center text-black font-bold hover:scale-110 transition-transform shadow-lg"
              title="Back to Landing Page"
            >
              H
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}