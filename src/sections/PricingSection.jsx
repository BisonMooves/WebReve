import React from 'react';
import { Check } from 'lucide-react';

export default function PricingSection() {
  const packages = [
    {
      id: "starter",
      name: "SPRINT LAUNCH",
      badge: null,
      popular: false,
      startingPrice: "$4,800",
      description: "Ideal for fast-moving startups needing a high-impact, award-worthy web presence quickly.",
      timeframe: "3–4 WEEKS",
      features: [
        "Custom 1-Page High-Converting React Build",
        "Art-Directed Warm Editorial UI System",
        "Subtle Micro-Animations",
        "Core Web Vitals 99+ Speed Optimization",
        "Basic Analytics & Lead Form Integrations",
        "30-Day Post-Launch Warranty"
      ],
      ctaText: "SELECT SPRINT PACKAGE",
      ctaHref: "#contact"
    },
    {
      id: "growth",
      name: "GROWTH & SCALE",
      badge: "MOST POPULAR",
      popular: true,
      startingPrice: "$9,500",
      description: "Our signature package engineered to maximize conversion rates and enterprise authority.",
      timeframe: "4–6 WEEKS",
      features: [
        "Multi-Page Bespoke React / Next.js Architecture",
        "Advanced Interactive Motion & Editorial Layouts",
        "Conversion Funnel & Friction Optimization",
        "Headless CMS Integration (Sanity / Shopify)",
        "Technical SEO & Structured Schema Setup",
        "Custom Event Analytics & Funnel Tracking",
        "90-Day Post-Launch ROI Warranty & Tuning"
      ],
      ctaText: "START GROWTH PROJECT",
      ctaHref: "#contact"
    },
    {
      id: "enterprise",
      name: "ENTERPRISE & BESPOKE",
      badge: "BESPOKE",
      popular: false,
      startingPrice: "$18,000+",
      description: "For tier-1 brands, venture funds, and platforms requiring custom WebGL shaders and complex integrations.",
      timeframe: "CUSTOM ROADMAP",
      features: [
        "Fully Custom Interactive Graphics & Shaders",
        "Multi-Region Global Localization & Currency",
        "Full Brand Identity & Design System Library",
        "Bank-Grade Security & High-Throughput SLA",
        "Dedicated Senior Creative Director & Lead Dev",
        "Quarterly A/B Conversion Experiments",
        "6-Month Priority SLA Maintenance & Retainer"
      ],
      ctaText: "BOOK ENTERPRISE CALL",
      ctaHref: "#contact"
    }
  ];

  return (
    <section id="services" className="py-20 px-6 md:px-12 bg-[#F0EBE1] border-b border-[#1A1512]/15 relative z-10">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="flex items-baseline justify-between border-b border-[#1A1512]/15 pb-4">
          <h2 className="text-5xl sm:text-7xl font-extrabold font-display uppercase tracking-tight text-[#1A1512]">
            INVESTMENT TIK
          </h2>
          <span className="font-mono text-xs font-bold tracking-widest text-[#1A1512]/60 uppercase">
            05 / PRICING
          </span>
        </div>

        {/* 3 Package Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`p-8 border flex flex-col justify-between relative bg-[#F0EBE1] ${
                pkg.popular
                  ? 'border-2 border-[#1A1512] bg-[#E8E2D7]'
                  : 'border-[#1A1512]/15'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3.5 left-6 px-3 py-0.5 bg-[#C1512F] text-white font-mono text-[10px] font-bold tracking-widest uppercase">
                  {pkg.badge}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-3xl font-extrabold font-display uppercase text-[#1A1512]">{pkg.name}</h3>
                    <span className="font-mono text-[10px] font-bold text-[#1A1512]/60 border border-[#1A1512]/15 px-2 py-0.5 uppercase">
                      {pkg.timeframe}
                    </span>
                  </div>
                  <p className="text-xs text-[#1A1512]/75 mt-2 leading-relaxed font-sans">
                    {pkg.description}
                  </p>
                </div>

                <div className="py-4 border-y border-[#1A1512]/15">
                  <span className="font-mono text-[10px] text-[#1A1512]/60 uppercase block">STARTING AT</span>
                  <div className="text-4xl font-extrabold font-display text-[#1A1512] mt-0.5">
                    {pkg.startingPrice} <span className="font-mono text-xs text-[#1A1512]/60 font-normal">/ PROJECT</span>
                  </div>
                </div>

                <div className="space-y-3 font-sans">
                  <span className="font-mono text-[10px] font-bold text-[#1A1512] uppercase block tracking-widest">
                    WHAT'S INCLUDED:
                  </span>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[#1A1512]/90">
                        <span className="text-[#C1512F] font-mono font-bold">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-[#1A1512]/15">
                <a
                  href={pkg.ctaHref}
                  className={`w-full py-3.5 font-mono text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors ${
                    pkg.popular
                      ? 'bg-[#1A1512] text-white hover:bg-[#C1512F]'
                      : 'border border-[#1A1512] text-[#1A1512] hover:bg-[#1A1512] hover:text-white'
                  }`}
                >
                  <span>{pkg.ctaText}</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <p className="font-mono text-xs text-[#1A1512]/70 uppercase">
            NEED SOMETHING CUSTOM OR ENTERPRISE RETAINER?{' '}
            <a href="#contact" className="text-[#C1512F] font-bold hover:underline">
              LET'S TALK →
            </a>
          </p>
        </div>

      </div>
    </section>
  );
}
