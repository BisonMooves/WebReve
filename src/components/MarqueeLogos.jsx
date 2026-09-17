import React from 'react';
import { clientLogos } from '../data/testimonials';

export default function MarqueeLogos() {
  const marqueeItems = [...clientLogos, ...clientLogos, ...clientLogos];

  return (
    <div className="w-full py-4 border-y border-[#1A1512]/15 bg-[#F0EBE1] relative overflow-hidden group">
      <div className="flex items-center gap-12 w-max animate-marquee group-hover:[animation-play-state:paused]">
        {marqueeItems.map((logo, index) => (
          <div
            key={index}
            className="flex items-center gap-3 px-4 py-1.5 font-mono text-xs font-bold tracking-widest text-[#1A1512]/70 uppercase cursor-default select-none border border-[#1A1512]/10 bg-[#E8E2D7]"
          >
            <span className="text-[#C1512F]">{logo.symbol}</span>
            <span>{logo.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
