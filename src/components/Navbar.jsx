import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'WORK', href: '#work' },
    { name: 'SERVICES', href: '#services' },
    { name: 'PROCESS', href: '#why-us' },
    { name: 'TESTIMONIALS', href: '#testimonials' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F0EBE1] border-b border-[#1A1512]/15">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          
          {/* Brand Wordmark */}
          <a href="#" className="flex items-center gap-1 group">
            <span className="font-display font-extrabold text-3xl tracking-tight text-[#1A1512]">
              WEBREVE
            </span>
            <span className="w-2.5 h-2.5 bg-[#C1512F] inline-block mb-1" />
          </a>

          {/* Center-Right Monospace Nav Links */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs font-mono font-bold tracking-widest text-[#1A1512]/70 hover:text-[#1A1512] transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Far-Right Solid Black Rectangle CTA Button */}
          <div className="hidden md:flex items-center">
            <a
              href="#contact"
              className="px-6 py-3 bg-[#1A1512] hover:bg-[#C1512F] text-white text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2 transition-colors duration-200"
            >
              <span>START A PROJECT</span>
              <span className="text-base font-sans font-semibold">→</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#1A1512] hover:text-[#C1512F] transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-40 bg-[#F0EBE1] pt-24 px-6 pb-12 flex flex-col justify-between md:hidden border-b border-[#1A1512]/15"
          >
            <div className="space-y-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-3xl font-display font-extrabold text-[#1A1512] hover:text-[#C1512F] transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="pt-8 border-t border-[#1A1512]/15 space-y-4">
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-4 bg-[#1A1512] text-white text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2"
              >
                <span>START A PROJECT</span>
                <span>→</span>
              </a>
              <div className="text-xs font-mono text-[#1A1512]/60 flex justify-between">
                <span>WEBREVE.DESIGN</span>
                <span>PARIS • NY</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
