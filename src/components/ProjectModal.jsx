import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function ProjectModal({ project, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#1A1512]/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-5xl bg-[#F0EBE1] border border-[#1A1512] shadow-2xl overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col rounded-none"
        >
          {/* Modal Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#F0EBE1] border-b border-[#1A1512]/15">
            <div className="flex items-center gap-3 font-mono text-xs font-bold tracking-widest text-[#1A1512]">
              <span className="px-3 py-1 bg-[#1A1512] text-white uppercase">{project.category}</span>
              <span>— {project.year}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 border border-[#1A1512] bg-[#F0EBE1] hover:bg-[#1A1512] hover:text-white transition-colors cursor-pointer"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 md:p-10 overflow-y-auto space-y-10 font-sans">
            {/* Title & Result */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#1A1512]/15 pb-4">
                <h2 className="text-4xl md:text-6xl font-extrabold font-display uppercase tracking-tight text-[#1A1512]">
                  {project.title}
                </h2>
                <span className="font-mono text-sm font-bold tracking-widest text-[#C1512F] uppercase">
                  {project.result}
                </span>
              </div>
              <p className="text-base text-[#1A1512]/80 leading-relaxed max-w-3xl">
                {project.tagline}
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-[#1A1512]/15 p-6 bg-[#F0EBE1]">
              {project.metrics.map((metric, i) => (
                <div key={i} className="space-y-1 border-b md:border-b-0 md:border-r border-[#1A1512]/15 last:border-none pr-4 pb-2 md:pb-0">
                  <span className="font-mono text-[10px] font-bold tracking-widest text-[#1A1512]/60 uppercase">{metric.label}</span>
                  <div className="text-3xl font-extrabold font-display uppercase text-[#1A1512]">
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Challenge & Solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[#1A1512]/15 pt-8">
              <div className="space-y-2">
                <span className="font-mono text-xs font-bold tracking-widest text-[#C1512F] uppercase">• THE CHALLENGE</span>
                <p className="text-sm text-[#1A1512]/80 leading-relaxed font-sans">
                  {project.problem}
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-mono text-xs font-bold tracking-widest text-[#1A1512] uppercase">• THE STRATEGY & BUILD</span>
                <p className="text-sm text-[#1A1512]/80 leading-relaxed font-sans">
                  {project.solution}
                </p>
              </div>
            </div>

            {/* Mockups Showcase */}
            <div className="space-y-4 pt-4 border-t border-[#1A1512]/15">
              <span className="font-mono text-xs font-bold tracking-widest text-[#1A1512] uppercase">INTERFACE GALLERY</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {project.mockups.map((imgUrl, i) => (
                  <div key={i} className="aspect-video md:aspect-square overflow-hidden border border-[#1A1512]/15 bg-[#1A1512]/5">
                    <img
                      src={imgUrl}
                      alt={`${project.title} preview ${i + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial Quote */}
            {project.quote && (
              <div className="p-6 border border-[#1A1512]/15 space-y-3 bg-[#E8E2D7]">
                <p className="text-sm italic text-[#1A1512] font-medium leading-relaxed">
                  "{project.quote.text}"
                </p>
                <div className="font-mono text-xs font-bold text-[#1A1512] tracking-wider uppercase">
                  — {project.quote.author}, {project.quote.title}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-[#F0EBE1] border-t border-[#1A1512]/15 flex items-center justify-between">
            <span className="font-mono text-xs text-[#1A1512]/60">WEBREVE CASE STUDY</span>
            <a
              href="#contact"
              onClick={onClose}
              className="px-5 py-2.5 bg-[#1A1512] hover:bg-[#C1512F] text-white font-mono text-xs font-bold tracking-widest uppercase transition-colors"
            >
              DISCUSS YOUR PROJECT →
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
