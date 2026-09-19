import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminData } from '../context/AdminContext';
import { agencyStats } from '../data/testimonials';
import MarqueeLogos from '../components/MarqueeLogos';
import AnimatedStatCounter from '../components/AnimatedStatCounter';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function TestimonialsSection() {
  const { testimonials } = useAdminData();
  const [currentIndex, setCurrentIndex] = useState(0);

  const safeIndex = testimonials.length > 0 ? currentIndex % testimonials.length : 0;

  const handleNext = () => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const activeTestimonial = testimonials[safeIndex] || {
    quote: "WebRêve engineered an exceptional platform for our team.",
    author: "Elena Vance",
    role: "Founder",
    company: "Aether Paris",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop",
    impact: "€2.4M Sales"
  };

  return (
    <section id="testimonials" className="py-16 sm:py-20 bg-[#F0EBE1] border-b border-[#1A1512]/15 relative z-10">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 space-y-12 sm:space-y-16">
        
        {/* Section Header */}
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#1A1512]/15 pb-4">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-display uppercase tracking-tight text-[#1A1512]">
            CLIENT TESTIMONIALS
          </h2>
          <span className="font-mono text-xs font-bold tracking-widest text-[#1A1512]/60 uppercase">
            03 / PROOF
          </span>
        </div>

        {/* Testimonials Slider Box */}
        <div className="max-w-4xl mx-auto border border-[#1A1512] bg-[#F0EBE1] p-5 sm:p-8 md:p-12 space-y-6 sm:space-y-8 relative">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial.id}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Header Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A1512]/15 pb-3 sm:pb-4 font-mono text-[11px] sm:text-xs font-bold tracking-widest">
                <span className="text-[#C1512F] uppercase">• {activeTestimonial.industry || 'CLIENT IMPACT'}</span>
                <span className="px-2.5 sm:px-3 py-1 bg-[#1A1512] text-white uppercase text-[10px] sm:text-xs">{activeTestimonial.impact}</span>
              </div>

              {/* Quote Body */}
              <p className="text-lg sm:text-2xl font-serif italic text-[#1A1512] leading-relaxed">
                "{activeTestimonial.quote}"
              </p>

              {/* Author Metadata */}
              <div className="pt-3 sm:pt-4 border-t border-[#1A1512]/15 font-mono text-xs">
                <div className="font-bold text-[#1A1512] uppercase">{activeTestimonial.author}</div>
                <div className="text-[#1A1512]/60 uppercase text-[10px] sm:text-xs">{activeTestimonial.role} — {activeTestimonial.company}</div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-[#1A1512]/15 font-mono text-xs font-bold">
            <div className="text-[#1A1512]/60 tracking-widest text-[10px] sm:text-xs">
              0{safeIndex + 1} / 0{testimonials.length || 1}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2 sm:p-3 border border-[#1A1512] hover:bg-[#1A1512] hover:text-white transition-colors cursor-pointer"
                aria-label="Previous Testimonial"
              >
                <ArrowLeft className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 sm:p-3 border border-[#1A1512] bg-[#1A1512] text-white hover:bg-[#C1512F] transition-colors cursor-pointer"
                aria-label="Next Testimonial"
              >
                <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Stats Grid */}
        <div className="pt-8 border-t border-[#1A1512]/15">
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {agencyStats.map((stat) => (
              <AnimatedStatCounter
                key={stat.id}
                numericValue={stat.numericValue}
                prefix={stat.prefix}
                suffix={stat.suffix}
                label={stat.label}
                subtext={stat.subtext}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
