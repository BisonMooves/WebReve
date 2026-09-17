import React from 'react';
import { motion } from 'framer-motion';

export default function ProcessSection() {
  const processSteps = [
    {
      number: "01",
      title: "DISCOVERY & STRATEGY",
      subtitle: "DEEP AUDIT & FUNNEL MAPPING",
      description: "We analyze your target buyers, map conversion friction points, and craft a bespoke visual strategy before writing a single line of code.",
      timeframe: "WEEK 1"
    },
    {
      number: "02",
      title: "ART DIRECTION & UX",
      subtitle: "BESPOKE MOTION & INTERFACE",
      description: "Art-directed UI mockups, interactive prototypes, and editorial typography engineered to mesmerize decision-makers at first glance.",
      timeframe: "WEEKS 2–3"
    },
    {
      number: "03",
      title: "CREATIVE ENGINEERING",
      subtitle: "60FPS REACT ARCHITECTURE",
      description: "Clean, component-driven React builds with smooth Framer Motion micro-interactions, headless CMS, and 99+ PageSpeed scores.",
      timeframe: "WEEKS 4–5"
    },
    {
      number: "04",
      title: "LAUNCH & GROWTH",
      subtitle: "QA & CONVERSION AUDIT",
      description: "Cross-device QA, analytics configuration, instant deployment, and 90 days of active post-launch conversion performance monitoring.",
      timeframe: "WEEK 6 & BEYOND"
    }
  ];

  const differentiators = [
    {
      title: "GUARANTEED 4–6 WEEK SPRINTS",
      description: "No endless agency delays. We work in hyper-focused sprints with daily async updates and fixed milestone timelines.",
      highlight: "ON-TIME DELIVERY"
    },
    {
      title: "CORE WEB VITALS 99+ SPEED",
      description: "Speed is conversion. Every site we ship achieves sub-1s load times, 99+ Lighthouse speed, and semantic SEO out of the box.",
      highlight: "99+ SPEED SCORE"
    },
    {
      title: "90-DAY POST-LAUNCH WARRANTY",
      description: "We don't vanish after launch. We monitor live analytics, tune conversion funnels, and handle maintenance for 90 full days.",
      highlight: "RISK-FREE GUARANTEE"
    }
  ];

  return (
    <section id="why-us" className="py-20 px-6 md:px-12 bg-[#F0EBE1] border-b border-[#1A1512]/15 relative z-10">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="flex items-baseline justify-between border-b border-[#1A1512]/15 pb-4">
          <h2 className="text-5xl sm:text-7xl font-extrabold font-display uppercase tracking-tight text-[#1A1512]">
            OUR PROCESS
          </h2>
          <span className="font-mono text-xs font-bold tracking-widest text-[#1A1512]/60 uppercase">
            04 / EXECUTION
          </span>
        </div>

        {/* 4-Step Process Timeline Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {processSteps.map((step, idx) => (
            <div
              key={step.number}
              className="p-6 border border-[#1A1512]/15 bg-[#F0EBE1] space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between font-mono text-xs font-bold tracking-widest">
                  <span className="text-[#C1512F]">{step.number} — STEP</span>
                  <span className="px-2 py-0.5 border border-[#1A1512]/15 bg-[#E8E2D7] text-[#1A1512]">{step.timeframe}</span>
                </div>

                <h3 className="text-2xl font-extrabold font-display uppercase text-[#1A1512] leading-tight">
                  {step.title}
                </h3>

                <p className="text-xs text-[#1A1512]/75 font-sans leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#1A1512]/10 font-mono text-[10px] text-[#1A1512]/50 tracking-wider">
                {step.subtitle}
              </div>
            </div>
          ))}
        </div>

        {/* Differentiators */}
        <div className="pt-8 border-t border-[#1A1512]/15 space-y-8">
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold font-display uppercase text-[#1A1512]">WHY WEBREVE</h3>
            <span className="font-mono text-xs text-[#C1512F] font-bold tracking-widest">• THREE GUARANTEES</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {differentiators.map((diff, idx) => (
              <div key={idx} className="p-6 border border-[#1A1512]/15 bg-[#E8E2D7] space-y-3">
                <div className="font-mono text-[10px] font-bold tracking-widest text-[#C1512F] uppercase">
                  [{diff.highlight}]
                </div>
                <h4 className="text-xl font-extrabold font-display uppercase text-[#1A1512]">
                  {diff.title}
                </h4>
                <p className="text-xs text-[#1A1512]/80 font-sans leading-relaxed">
                  {diff.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
