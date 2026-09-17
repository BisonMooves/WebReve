import React, { useState } from 'react';
import PageLoader from './components/PageLoader';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import HeroSection from './sections/HeroSection';
import PortfolioSection from './sections/PortfolioSection';
import TestimonialsSection from './sections/TestimonialsSection';
import ProcessSection from './sections/ProcessSection';
import PricingSection from './sections/PricingSection';
import ContactSection from './sections/ContactSection';
import Footer from './components/Footer';

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-[#08080C] text-[#F8FAFC] font-sans selection:bg-[#6366F1] selection:text-white overflow-x-hidden relative">
      {/* 1. Initial Entrance Page Loader */}
      <PageLoader onComplete={() => setIsLoaded(true)} />

      {/* 2. Desktop Custom Follower Cursor */}
      <CustomCursor />

      {/* 3. Sticky Navigation Bar */}
      <Navbar />

      {/* Main Single Page Application Sections */}
      <main className={`transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Hero Section */}
        <HeroSection />

        {/* Selected Work & Case Studies */}
        <PortfolioSection />

        {/* Social Proof, Marquee & Testimonials */}
        <TestimonialsSection />

        {/* How We Work Process & Differentiators */}
        <ProcessSection />

        {/* Pricing & Investment Packages */}
        <PricingSection />

        {/* Final Conversion Contact Form */}
        <ContactSection />
      </main>

      {/* Agency Footer */}
      <Footer />
    </div>
  );
}
