import React from 'react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const servicesList = [
    "01 — STRATEGY & IDENTITY",
    "02 — WEB & PRODUCT DESIGN",
    "03 — MOTION & BUILD"
  ];

  return (
    <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 md:px-12 bg-[#F0EBE1] border-b border-[#1A1512]/15 min-h-[85vh] flex flex-col justify-between">
      <div className="max-w-7xl mx-auto w-full space-y-8 sm:space-y-12">
        
        {/* Eyebrow Label with Accent Terracotta Bullet */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-[#1A1512]"
        >
          <span className="w-2 h-2 rounded-full bg-[#C1512F]" />
          <span>INDEPENDENT DIGITAL STUDIO</span>
        </motion.div>

        {/* Massive Multi-Line Condensed Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[9.5rem] xl:text-[10.5rem] font-extrabold font-display uppercase tracking-tight text-[#1A1512] leading-[0.9] sm:leading-[0.88] break-words">
            WE BUILD BRANDS THAT REFUSE TO BE{' '}
            <span className="text-[#C1512F]">IGNORED.</span>
          </h1>
        </motion.div>

        {/* Two-Column Bottom Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 pt-6 sm:pt-8 border-t border-[#1A1512]/15 items-start"
        >
          {/* Left Column: 3-4 lines of Body Copy (Humanist Sans) */}
          <div className="md:col-span-7">
            <p className="text-sm sm:text-base md:text-lg text-[#1A1512]/80 leading-relaxed font-sans max-w-xl">
              WebRêve is a design-led studio crafting identities, websites and digital products for ambitious teams. Every detail considered. Every experience built to convert.
            </p>
          </div>

          {/* Right Column: Numbered List (Monospace) */}
          <div className="md:col-span-5 space-y-2 sm:space-y-3 font-mono text-[11px] sm:text-xs font-bold tracking-widest text-[#1A1512]">
            {servicesList.map((service, idx) => (
              <div key={idx} className="flex items-center justify-between py-1 border-b border-[#1A1512]/10 md:border-none">
                <span>{service}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
