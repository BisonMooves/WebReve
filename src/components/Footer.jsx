import React from 'react';
import { agencyInfo } from '../data/agencyInfo';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { name: 'WORK', href: '#work' },
    { name: 'SERVICES', href: '#services' },
    { name: 'PROCESS', href: '#why-us' },
    { name: 'TESTIMONIALS', href: '#testimonials' },
    { name: 'CONTACT', href: '#contact' },
  ];

  return (
    <footer className="bg-[#F0EBE1] text-[#1A1512] border-t border-[#1A1512]/15 py-12 px-6 md:px-12 font-mono text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-baseline justify-between gap-6">
        
        <div className="space-y-2">
          <a href="#" className="flex items-center gap-1 font-display font-extrabold text-2xl tracking-tight text-[#1A1512]">
            <span>WEBREVE</span>
            <span className="w-2 h-2 bg-[#C1512F] inline-block mb-1" />
          </a>
          <p className="text-[11px] text-[#1A1512]/60 uppercase tracking-widest">
            {agencyInfo.tagline} • PARIS • NEW YORK
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 font-bold tracking-widest text-[#1A1512]">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="hover:text-[#C1512F] transition-colors">
              {link.name}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[#1A1512]/50 text-[10px]">© {new Date().getFullYear()} WEBREVE STUDIO</span>
          <button
            onClick={scrollToTop}
            className="px-3 py-1.5 border border-[#1A1512] bg-[#1A1512] text-white hover:bg-[#C1512F] transition-colors text-[10px] font-bold tracking-widest cursor-pointer"
          >
            TOP ↑
          </button>
        </div>

      </div>
    </footer>
  );
}
