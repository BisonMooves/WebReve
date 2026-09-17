import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { agencyInfo } from '../data/agencyInfo';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'Bespoke Web Design & Dev',
    budget: '$10k - $25k',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = "PLEASE ENTER YOUR NAME.";
    }
    if (!formData.email.trim()) {
      errs.email = "PLEASE ENTER YOUR EMAIL ADDRESS.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "PLEASE ENTER A VALID EMAIL ADDRESS.";
    }
    if (!formData.message.trim()) {
      errs.message = "PLEASE SHARE A BRIEF NOTE ABOUT YOUR PROJECT GOALS.";
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  const projectTypes = [
    "Bespoke Web Design & Dev",
    "Headless E-Commerce",
    "SaaS Web App & Motion System",
    "Brand Identity & Design System",
    "Custom WebGL & Interactive Experience"
  ];

  const budgetRanges = [
    "$5k - $10k (Sprint)",
    "$10k - $25k (Growth)",
    "$25k - $50k (Enterprise)",
    "$50k+ (Bespoke Retainer)"
  ];

  const socialLinks = [
    { name: "TWITTER / X", href: "https://twitter.com" },
    { name: "LINKEDIN", href: "https://linkedin.com" },
    { name: "GITHUB", href: "https://github.com" },
    { name: "DRIBBBLE", href: "https://dribbble.com" },
    { name: "AWWWARDS", href: "https://awwwards.com" },
  ];

  return (
    <section id="contact" className="py-20 px-6 md:px-12 bg-[#F0EBE1] border-b border-[#1A1512]/15 relative z-10">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="flex items-baseline justify-between border-b border-[#1A1512]/15 pb-4">
          <h2 className="text-5xl sm:text-7xl font-extrabold font-display uppercase tracking-tight text-[#1A1512]">
            START A CONVERSATION
          </h2>
          <span className="font-mono text-xs font-bold tracking-widest text-[#1A1512]/60 uppercase">
            06 / CONTACT
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column Info */}
          <div className="lg:col-span-5 space-y-8 p-8 border border-[#1A1512]/15 bg-[#E8E2D7]">
            <div className="space-y-2">
              <span className="font-mono text-xs font-bold text-[#C1512F] tracking-widest uppercase">• DIRECT REACH</span>
              <h3 className="text-3xl font-extrabold font-display uppercase text-[#1A1512]">LET'S TALK BUSINESS</h3>
              <p className="text-xs text-[#1A1512]/80 leading-relaxed font-sans">
                No spam. No hard sales pitch. Just a direct conversation about your goals, timeline, and how we can help.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#1A1512]/15 font-mono text-xs">
              <div>
                <span className="text-[#1A1512]/50 uppercase block">DIRECT EMAIL</span>
                <a href={`mailto:${agencyInfo.contact.email}`} className="font-bold text-[#1A1512] hover:text-[#C1512F] text-sm uppercase">
                  {agencyInfo.contact.email}
                </a>
              </div>

              <div>
                <span className="text-[#1A1512]/50 uppercase block">STUDIO HUBS</span>
                <span className="font-bold text-[#1A1512] uppercase">{agencyInfo.contact.location}</span>
              </div>

              <div>
                <span className="text-[#1A1512]/50 uppercase block">RESPONSE GUARANTEE</span>
                <span className="font-bold text-[#1A1512] uppercase">WRITTEN PROPOSAL WITHIN 24 HOURS</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1A1512]/15 space-y-2 font-mono text-xs">
              <span className="text-[#1A1512]/50 uppercase block">CONNECT</span>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((s) => (
                  <a key={s.name} href={s.href} className="px-2.5 py-1 border border-[#1A1512]/20 bg-[#F0EBE1] hover:bg-[#1A1512] hover:text-white transition-colors text-[10px] font-bold">
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column Form */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="p-8 border border-[#1A1512] bg-[#F0EBE1] space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-extrabold font-display uppercase text-[#1A1512]">PROJECT INQUIRY</h3>
                    <p className="font-mono text-xs text-[#1A1512]/60 uppercase">FILL OUT THE BRIEF FIELDS BELOW TO KICK OFF DISCOVERY.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="font-mono text-xs font-bold tracking-widest text-[#1A1512] uppercase block">
                        YOUR NAME <span className="text-[#C1512F]">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Marc Dubois"
                        className={`w-full px-4 py-3 bg-[#E8E2D7] border ${
                          errors.name ? 'border-[#C1512F]' : 'border-[#1A1512]/20 focus:border-[#1A1512]'
                        } text-[#1A1512] placeholder-[#1A1512]/40 text-xs font-mono focus:outline-none`}
                      />
                      {errors.name && <p className="font-mono text-[10px] text-[#C1512F] font-bold pt-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-xs font-bold tracking-widest text-[#1A1512] uppercase block">
                        WORK EMAIL <span className="text-[#C1512F]">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@company.com"
                        className={`w-full px-4 py-3 bg-[#E8E2D7] border ${
                          errors.email ? 'border-[#C1512F]' : 'border-[#1A1512]/20 focus:border-[#1A1512]'
                        } text-[#1A1512] placeholder-[#1A1512]/40 text-xs font-mono focus:outline-none`}
                      />
                      {errors.email && <p className="font-mono text-[10px] text-[#C1512F] font-bold pt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="font-mono text-xs font-bold tracking-widest text-[#1A1512] uppercase block">
                        PROJECT SCOPE
                      </label>
                      <select
                        name="projectType"
                        value={formData.projectType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#E8E2D7] border border-[#1A1512]/20 focus:border-[#1A1512] text-[#1A1512] text-xs font-mono focus:outline-none cursor-pointer"
                      >
                        {projectTypes.map((type) => (
                          <option key={type} value={type} className="bg-[#F0EBE1] text-[#1A1512]">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-xs font-bold tracking-widest text-[#1A1512] uppercase block">
                        TARGET BUDGET
                      </label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#E8E2D7] border border-[#1A1512]/20 focus:border-[#1A1512] text-[#1A1512] text-xs font-mono focus:outline-none cursor-pointer"
                      >
                        {budgetRanges.map((range) => (
                          <option key={range} value={range} className="bg-[#F0EBE1] text-[#1A1512]">
                            {range}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-xs font-bold tracking-widest text-[#1A1512] uppercase block">
                      PROJECT GOALS & DETAILS <span className="text-[#C1512F]">*</span>
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your company, target launch timeframe, and key objectives..."
                      className={`w-full px-4 py-3 bg-[#E8E2D7] border ${
                        errors.message ? 'border-[#C1512F]' : 'border-[#1A1512]/20 focus:border-[#1A1512]'
                      } text-[#1A1512] placeholder-[#1A1512]/40 text-xs font-sans focus:outline-none resize-none`}
                    />
                    {errors.message && <p className="font-mono text-[10px] text-[#C1512F] font-bold pt-1">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#1A1512] hover:bg-[#C1512F] text-white font-mono text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>SENDING REQUEST...</span>
                    ) : (
                      <>
                        <span>SUBMIT PROJECT INQUIRY</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="p-10 border border-[#1A1512] bg-[#E8E2D7] text-center space-y-4">
                  <div className="font-mono text-xs font-bold text-[#C1512F] uppercase">[INQUIRY RECEIVED]</div>
                  <h3 className="text-4xl font-extrabold font-display uppercase text-[#1A1512]">WE'LL BE IN TOUCH IN 24 HOURS</h3>
                  <p className="text-xs text-[#1A1512]/80 font-sans max-w-md mx-auto">
                    Thank you <strong>{formData.name}</strong>. A confirmation email has been logged for {formData.email}.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({ name: '', email: '', projectType: 'Bespoke Web Design & Dev', budget: '$10k - $25k', message: '' });
                      }}
                      className="px-5 py-2 border border-[#1A1512] bg-[#F0EBE1] hover:bg-[#1A1512] hover:text-white font-mono text-xs font-bold uppercase transition-colors"
                    >
                      SEND ANOTHER INQUIRY
                    </button>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
