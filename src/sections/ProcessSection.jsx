import React from 'react';
import { getSupportCommitmentText } from '../data/pricingConfig';

export default function ProcessSection() {
  const processSteps = [
    {
      number: "01",
      badge: "Days 1-2",
      title: "Discovery and scope",
      text: "We learn about your business, agree what the site needs to do, and fix the price and delivery date in writing.",
      footer: "Scope and price agreed"
    },
    {
      number: "02",
      badge: "Week 1",
      title: "Design",
      text: "You see your pages designed before anything is built, and we adjust until you're happy with the look.",
      footer: "Design approved by you"
    },
    {
      number: "03",
      badge: "Weeks 2-3",
      title: "Build",
      text: "We build the site, connect your domain and hosting, and add the forms, logins or admin features in your plan.",
      footer: "Working site to review"
    },
    {
      number: "04",
      badge: "Final week",
      title: "Launch and handover",
      text: "We test on phone and desktop, go live, and show you how to manage it. Free maintenance starts here if your plan includes it.",
      footer: "Live and handed over"
    }
  ];

  const commitments = [
    {
      title: "Live in 2 to 4 weeks",
      description: "We agree your delivery date in writing before we start. To keep it, we need your text, images and feedback within 2 days of each request."
    },
    {
      title: "Fast on every phone",
      description: "Every site is tested for speed on mobile and desktop before launch, and we fix anything slow before handing it over."
    },
    {
      title: "Support after launch",
      description: getSupportCommitmentText()
    }
  ];

  return (
    <section
      id="why-us"
      className="py-16 sm:py-20 px-4 sm:px-6 md:px-12 bg-[#F0EBE1] border-b border-[#1A1512]/15 relative z-10 w-full"
    >
      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16 w-full" style={{ marginInline: 'auto' }}>
        
        {/* Section Header */}
        <div className="border-b border-[#1A1512]/15 pb-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-display uppercase tracking-tight text-[#1A1512]">
              OUR PROCESS
            </h2>
            <span className="font-mono text-xs font-bold tracking-widest text-[#1A1512]/60 uppercase">
              04 / EXECUTION
            </span>
          </div>
          <p className="mt-3 text-base sm:text-lg text-[#1A1512]/80 font-sans">
            Most websites go live in 2 to 4 weeks.
          </p>
        </div>

        {/* 4-Step Process & Timeline */}
        <div className="space-y-6">
          {/* Timeline Bar */}
          <div className="space-y-2">
            <div className="grid grid-cols-4 border border-[#1A1512]/15 bg-[#E8E2D7] divide-x divide-[#1A1512]/15 text-center shadow-sm">
              {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, idx) => (
                <div key={idx} className="py-2 sm:py-2.5 px-1 sm:px-2">
                  <span className="font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#1A1512]">
                    {week}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <span className="font-mono text-[10px] sm:text-xs text-[#1A1512]/60 tracking-wide">
                * Timelines shorten for smaller sites
              </span>
            </div>
          </div>

          {/* 4 Step Cards - Stacked on screens under 760px */}
          <div className="grid grid-cols-1 min-[760px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {processSteps.map((step) => (
              <div
                key={step.number}
                className="p-5 sm:p-6 border border-[#1A1512]/15 bg-[#F0EBE1] space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between font-mono text-xs font-bold tracking-widest">
                    <span className="text-[#C1512F]">{step.number}</span>
                    <span className="px-2 py-0.5 border border-[#1A1512]/15 bg-[#E8E2D7] text-[#1A1512] text-[11px] font-mono">
                      {step.badge}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold font-display uppercase text-[#1A1512] leading-tight">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#1A1512]/75 font-sans leading-relaxed">
                    {step.text}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1A1512]/10 font-mono text-[11px] text-[#1A1512]/60 tracking-wider uppercase">
                  {step.footer}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Webreve / Our Commitments */}
        <div className="pt-8 border-t border-[#1A1512]/15 space-y-6 sm:space-y-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display uppercase text-[#1A1512]">
              WHY WEBREVE
            </h3>
            <span className="font-mono text-xs text-[#C1512F] font-bold tracking-widest uppercase">
              • OUR COMMITMENTS
            </span>
          </div>

          {/* Commitment Cards - Stacked on screens under 760px */}
          <div className="grid grid-cols-1 min-[760px]:grid-cols-3 gap-4 sm:gap-6">
            {commitments.map((item, idx) => (
              <div key={idx} className="p-5 sm:p-6 border border-[#1A1512]/15 bg-[#E8E2D7] space-y-3">
                <h4 className="text-lg sm:text-xl font-extrabold font-display uppercase text-[#1A1512]">
                  {item.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#1A1512]/80 font-sans leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
