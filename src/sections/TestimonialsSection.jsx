import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { testimonials, agencyStats } from '../data/testimonials';
import MarqueeLogos from '../components/MarqueeLogos';
import AnimatedStatCounter from '../components/AnimatedStatCounter';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const activeTestimonial = testimonials[currentIndex];

  return (
    <section id="testimonials" className="py-20 bg-[#F0EBE1] border-b border-[#1A1512]/15 relative z-10">
      
      {/* Client Marquee Strip */}
      <div className="mb-16">
        <div className="text-center mb-4">
          <span className="font-mono text-xs font-bold tracking-widest text-[#1A1512]/60 uppercase">
            SELECTED CLIENT ENGAGEMENTS & PARTNERSHIPS
          </span>
        </div>
        <MarqueeLogos />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
        
        {/* Section Header */}
        <div className="flex items-baseline justify-between border-b border-[#1A1512]/15 pb-4">
          <h2 className="text-5xl sm:text-7xl font-extrabold font-display uppercase tracking-tight text-[#1A1512]">
            CLIENT TESTIMONIALS
          </h2>
          <span className="font-mono text-xs font-bold tracking-widest text-[#1A1512]/60 uppercase">
            03 / PROOF
          </span>
        </div>

        {/* Testimonials Slider Box */}
        <div className="max-w-4xl mx-auto border border-[#1A1512] bg-[#F0EBE1] p-8 md:p-12 space-y-8 relative">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial.id}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-[#1A1512]/15 pb-4 font-mono text-xs font-bold tracking-widest">
                <span className="text-[#C1512F] uppercase">• {activeTestimonial.industry}</span>
                <span className="px-3 py-1 bg-[#1A1512] text-white uppercase">{activeTestimonial.impact}</span>
              </div>

              {/* Quote Body */}
              <p className="text-xl sm:text-2xl font-serif italic text-[#1A1512] leading-relaxed">
                "{activeTestimonial.quote}"
              </p>

              {/* Author Metadata */}
              <div className="pt-4 border-t border-[#1A1512]/15 font-mono text-xs">
                <div className="font-bold text-[#1A1512] uppercase">{activeTestimonial.author}</div>
                <div className="text-[#1A1512]/60 uppercase">{activeTestimonial.role} — {activeTestimonial.company}</div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-[#1A1512]/15 font-mono text-xs font-bold">
            <div className="text-[#1A1512]/60 tracking-widest">
              0{currentIndex + 1} / 0{testimonials.length}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-3 border border-[#1A1512] hover:bg-[#1A1512] hover:text-white transition-colors cursor-pointer"
                aria-label="Previous Testimonial"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-3 border border-[#1A1512] bg-[#1A1512] text-white hover:bg-[#C1512F] transition-colors cursor-pointer"
                aria-label="Next Testimonial"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Stats Grid */}
        <div className="pt-8 border-t border-[#1A1512]/15">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
