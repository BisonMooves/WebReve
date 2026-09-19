import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAdminData } from '../context/AdminContext';
import { agencyInfo } from '../data/agencyInfo';
import { PACKAGES, getPlanSummary } from '../data/pricingConfig';
import { ChevronDown, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function ContactSection() {
  const { addInquiry } = useAdminData();
  const headingRef = useRef(null);
  
  // Selected package tracking (synchronized with PricingSection & pricing config)
  const [selectedPlan, setSelectedPlan] = useState(() => getPlanSummary('dynamic', 0));

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    message: ''
  });

  const [submittedData, setSubmittedData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const socialLinks = agencyInfo.contact.socials || [
    { name: "WhatsApp", href: "https://wa.me/919741780612" },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/aditya-singh-0604adi/" },
    { name: "GitHub", href: "https://github.com/aditya060414" },
    { name: "Instagram", href: "https://instagram.com/webreve_" },
    { name: "Twitter / X", href: "https://x.com/AdityaSingh446" }
  ];

  useEffect(() => {
    const onSelectPlan = (e) => {
      const detail = e.detail;
      if (detail) {
        setSelectedPlan({
          planId: detail.planId || 'dynamic',
          planName: detail.planName || 'Dynamic Build',
          basePrice: detail.basePrice || 10000,
          freeMaintenanceMonths: detail.freeMaintenanceMonths || 0,
          extraMonths: detail.extraMonths || 0,
          totalPrice: detail.totalPrice || 10000,
          summaryText: detail.summaryText || `${detail.planName || 'Dynamic Build'} · ₹${(detail.totalPrice || 10000).toLocaleString()}`
        });
      }
    };

    window.addEventListener('selectPlan', onSelectPlan);
    return () => window.removeEventListener('selectPlan', onSelectPlan);
  }, []);

  // Countdown timer for resubmit button
  useEffect(() => {
    let timer;
    if (isSubmitted && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSubmitted, countdown]);

  // Accessibility: Focus on heading when success state is revealed
  useEffect(() => {
    if (isSubmitted && headingRef.current) {
      headingRef.current.focus();
    }
  }, [isSubmitted]);

  const handleDropdownPlanChange = (val) => {
    if (val === 'not-sure') {
      setSelectedPlan(null);
    } else {
      setSelectedPlan(getPlanSummary(val, 0));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = "Please enter your name.";
    }
    if (!formData.email.trim()) {
      errs.email = "Please enter your email address.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!formData.whatsapp.trim()) {
      errs.whatsapp = "Please enter your WhatsApp number.";
    } else if (formData.whatsapp.trim().replace(/[^0-9]/g, '').length < 7) {
      errs.whatsapp = "Please enter a valid phone number (at least 7 digits).";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const summaryText = selectedPlan
        ? selectedPlan.summaryText
        : 'Custom Scope · TBD';

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        whatsapp: formData.whatsapp.trim(),
        message: formData.message.trim(),
        plan: selectedPlan?.planName || 'Not sure yet',
        extraMonths: selectedPlan?.extraMonths || 0,
        totalPrice: selectedPlan?.totalPrice || 0,
        projectType: summaryText,
        budget: selectedPlan?.totalPrice ? `₹${selectedPlan.totalPrice.toLocaleString()}` : 'TBD'
      };

      const res = await addInquiry(payload);
      
      const firstName = formData.name.trim().split(' ')[0] || 'there';
      const refCode = res?.reference || res?.inquiryId?.replace('inq-', 'WBR-2026-') || `WBR-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;

      setSubmittedData({
        name: formData.name.trim(),
        firstName,
        email: formData.email.trim(),
        whatsapp: formData.whatsapp.trim(),
        summaryText,
        referenceCode: refCode
      });

      setIsSubmitting(false);
      setIsSubmitted(true);
      setCountdown(30);
    } catch (err) {
      console.error('Submission error:', err);
      setIsSubmitting(false);
      setSubmitError("Failed to submit inquiry to server. Please try again or message us directly on WhatsApp.");
    }
  };

  return (
    <section id="contact" className="py-20 px-6 md:px-12 bg-[#F0EBE1] border-b border-[#1A1512]/15 relative z-10">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#1A1512]/15 pb-4">
          <div>
            <h2 className="text-5xl sm:text-7xl font-extrabold font-display uppercase tracking-tight text-[#1A1512]">
              START A CONVERSATION
            </h2>
            <p className="font-mono text-xs text-[#1A1512]/60 uppercase tracking-widest mt-1">
              DIRECT DISCOVERY & PROJECT ONBOARDING
            </p>
          </div>
          <span className="font-mono text-xs font-bold tracking-widest text-[#1A1512]/60 uppercase">
            06 / CONTACT
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Column Info Card */}
          <div className="lg:col-span-5 p-8 border border-[#1A1512]/15 bg-[#E8E2D7] flex flex-col justify-between space-y-8 h-full">
            <div className="space-y-6">
              <div>
                <span className="font-mono text-xs font-bold text-[#C1512F] tracking-widest uppercase block mb-[14px]">
                  • DIRECT REACH
                </span>
                <h3 className="text-3xl sm:text-4xl font-extrabold font-display uppercase text-[#1A1512]">
                  LET'S TALK BUSINESS
                </h3>
                <p className="text-sm text-[#1A1512]/80 leading-relaxed font-sans mt-3">
                  No spam. No hard sales pitch. Just a direct conversation about your goals, timeline, and how we can help.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-[#1A1512]/15 font-mono text-xs">
                <div>
                  <span className="text-[#1A1512]/50 uppercase block mb-1">DIRECT EMAIL</span>
                  <a href={`mailto:${agencyInfo.contact.email}`} className="font-bold text-[#1A1512] hover:text-[#C1512F] text-sm uppercase">
                    {agencyInfo.contact.email}
                  </a>
                </div>

                <div>
                  <span className="text-[#1A1512]/50 uppercase block mb-1">STUDIO HUBS</span>
                  <span className="font-bold text-[#1A1512] uppercase">{agencyInfo.contact.location}</span>
                </div>

                <div>
                  <span className="text-[#1A1512]/50 uppercase block mb-1">REPLY TIME</span>
                  <span className="font-bold text-[#1A1512] uppercase">WITHIN 24 HOURS ON WORKING DAYS</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#1A1512]/15 space-y-3 font-mono text-xs">
              <span className="text-[#1A1512]/50 uppercase block">CONNECT</span>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 border border-[#1A1512]/40 bg-[#F0EBE1] hover:bg-[#1A1512] hover:text-[#F0EBE1] hover:border-[#1A1512] transition-colors text-xs font-bold text-[#1A1512]"
                  >
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column Form Card */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full min-h-[580px]">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="p-8 border border-[#1A1512] bg-[#F0EBE1] flex flex-col justify-between h-full space-y-6">
                  
                  {/* Hidden Fields for Form Submission */}
                  <input type="hidden" name="plan" value={selectedPlan?.planName || 'Not sure yet'} />
                  <input type="hidden" name="extraMonths" value={selectedPlan?.extraMonths || 0} />
                  <input type="hidden" name="total" value={selectedPlan?.totalPrice || 0} />

                  {/* Form Header */}
                  <div className="space-y-1">
                    <h3 className="text-3xl font-extrabold font-display uppercase text-[#1A1512]">
                      PROJECT INQUIRY
                    </h3>
                    <p className="font-sans text-sm text-[#1A1512]/75 leading-relaxed">
                      Tell us about your project. We'll reply within 24 hours.
                    </p>
                  </div>

                  {/* Dynamic Selection Summary Block */}
                  {selectedPlan ? (
                    <div className="p-4 bg-[#E8E2D7] border border-[#1A1512]/20 flex items-center justify-between gap-4">
                      <div className="space-y-0.5 min-w-0">
                        <span className="font-mono text-[10px] font-bold text-[#1A1512]/60 uppercase block">
                          YOUR SELECTION
                        </span>
                        <div className="font-sans font-bold text-sm text-[#1A1512] truncate">
                          {selectedPlan.summaryText}
                        </div>
                      </div>
                      <a
                        href="#pricing"
                        className="font-mono text-xs font-bold text-[#C1512F] hover:underline uppercase whitespace-nowrap flex-shrink-0"
                      >
                        Change →
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="font-mono text-xs font-bold tracking-widest text-[#1A1512] uppercase block">
                        YOUR SELECTION
                      </label>
                      <div className="relative">
                        <select
                          value="not-sure"
                          onChange={(e) => handleDropdownPlanChange(e.target.value)}
                          className="w-full appearance-none px-4 py-3 bg-[#E8E2D7] border border-[#1A1512]/20 focus:border-[#1A1512] text-[#1A1512] text-sm font-sans focus:outline-none cursor-pointer pr-10"
                        >
                          {PACKAGES.map((pkg) => (
                            <option key={pkg.id} value={pkg.id}>
                              {pkg.name}
                            </option>
                          ))}
                          <option value="not-sure">Not sure yet</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-[#1A1512]/60 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  )}

                  {/* Name and Email Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="font-mono text-xs font-bold tracking-widest text-[#1A1512] uppercase block">
                        YOUR NAME <span className="text-[#C1512F]">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className={`w-full px-4 py-3 bg-[#E8E2D7] border ${
                          errors.name ? 'border-[#C1512F]' : 'border-[#1A1512]/20 focus:border-[#1A1512]'
                        } text-[#1A1512] placeholder-[#1A1512]/40 text-sm font-sans focus:outline-none`}
                      />
                      {errors.name && <p className="font-mono text-[10px] text-[#C1512F] font-bold pt-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-mono text-xs font-bold tracking-widest text-[#1A1512] uppercase block">
                        EMAIL <span className="text-[#C1512F]">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={`w-full px-4 py-3 bg-[#E8E2D7] border ${
                          errors.email ? 'border-[#C1512F]' : 'border-[#1A1512]/20 focus:border-[#1A1512]'
                        } text-[#1A1512] placeholder-[#1A1512]/40 text-sm font-sans focus:outline-none`}
                      />
                      {errors.email && <p className="font-mono text-[10px] text-[#C1512F] font-bold pt-1">{errors.email}</p>}
                    </div>
                  </div>

                  {/* WhatsApp Number (Mandatory) */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-xs font-bold tracking-widest text-[#1A1512] uppercase block">
                      WHATSAPP NUMBER <span className="text-[#C1512F]">*</span>
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className={`w-full px-4 py-3 bg-[#E8E2D7] border ${
                        errors.whatsapp ? 'border-[#C1512F]' : 'border-[#1A1512]/20 focus:border-[#1A1512]'
                      } text-[#1A1512] placeholder-[#1A1512]/40 text-sm font-sans focus:outline-none`}
                    />
                    {errors.whatsapp && <p className="font-mono text-[10px] text-[#C1512F] font-bold pt-1">{errors.whatsapp}</p>}
                  </div>

                  {/* Project Details */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-xs font-bold tracking-widest text-[#1A1512] uppercase block">
                      PROJECT DETAILS
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="What is your business, what should the website do, and when do you need it live?"
                      className="w-full px-4 py-3 bg-[#E8E2D7] border border-[#1A1512]/20 focus:border-[#1A1512] text-[#1A1512] placeholder-[#1A1512]/40 text-sm font-sans focus:outline-none resize-none"
                    />
                  </div>

                  {submitError && (
                    <div className="p-3 bg-[#C1512F]/10 border border-[#C1512F] flex items-center justify-between gap-2 text-xs font-sans text-[#C1512F]">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{submitError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="underline font-bold uppercase font-mono text-[10px] hover:text-[#1A1512] cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#1A1512] hover:bg-[#C1512F] disabled:bg-[#1A1512]/50 text-white font-mono text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>SENDING INQUIRY...</span>
                    ) : (
                      <span>SEND INQUIRY →</span>
                    )}
                  </button>
                </form>
              ) : submittedData && (
                <div
                  aria-live="polite"
                  className="p-8 sm:p-10 border border-[#1A1512] bg-[#E8E2D7] text-left space-y-6 flex flex-col justify-between h-full min-h-[580px]"
                >
                  <div className="space-y-6">
                    {/* Icon + Eyebrow */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1A1512] text-[#F0EBE1] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-[#C1512F]" />
                      </div>
                      <div>
                        <span className="font-mono text-xs font-bold text-[#C1512F] uppercase tracking-widest block">
                          INQUIRY RECEIVED
                        </span>
                      </div>
                    </div>

                    {/* Heading & Intro */}
                    <div>
                      <h3
                        ref={headingRef}
                        tabIndex="-1"
                        className="text-2xl sm:text-3xl font-extrabold font-display uppercase tracking-tight text-[#1A1512] focus:outline-none"
                      >
                        WE'VE GOT YOUR PROJECT DETAILS
                      </h3>
                      <p className="font-sans text-sm text-[#1A1512]/85 mt-2 leading-relaxed">
                        Thanks, {submittedData.firstName}. We'll reply to <strong>{submittedData.email}</strong> within 24 hours, Monday to Saturday.
                      </p>
                    </div>

                    {/* Specification Recap Block */}
                    <div className="p-4 bg-[#F0EBE1] border border-[#1A1512]/15 space-y-1.5">
                      <span className="font-mono text-[10px] text-[#1A1512]/60 uppercase font-bold block">
                        SUBMITTED SPECIFICATION
                      </span>
                      <div className="font-sans font-bold text-sm text-[#1A1512]">
                        {submittedData.summaryText}
                      </div>
                      <div className="font-mono text-[11px] text-[#1A1512]/65 pt-1.5 border-t border-[#1A1512]/10 mt-1 flex items-center justify-between">
                        <span>REFERENCE CODE:</span>
                        <span className="font-bold text-[#1A1512]">{submittedData.referenceCode}</span>
                      </div>
                    </div>

                    {/* What Happens Next Ordered Steps */}
                    <div className="space-y-2.5 pt-2 border-t border-[#1A1512]/15">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1A1512] block">
                        WHAT HAPPENS NEXT:
                      </span>
                      <div className="space-y-2.5 text-xs font-sans text-[#1A1512]/85">
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-xs font-bold text-[#C1512F] shrink-0">01</span>
                          <span>We read your brief and note any questions.</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-xs font-bold text-[#C1512F] shrink-0">02</span>
                          <span>You get a reply with a clear scope, price and timeline.</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-xs font-bold text-[#C1512F] shrink-0">03</span>
                          <span>Once you approve, we start and share a delivery date.</span>
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Quick Link */}
                    <div className="pt-2 text-xs font-sans text-[#1A1512]/80 flex flex-wrap items-center gap-1.5">
                      <span>Need to add something now?</span>
                      <a
                        href={agencyInfo.contact.whatsappLink || "https://wa.me/919741780612"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[#1A1512] hover:text-[#C1512F] underline inline-flex items-center gap-1"
                      >
                        <span>Message us on WhatsApp</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Actions & Resubmit Timer */}
                  <div className="pt-4 border-t border-[#1A1512]/15 flex flex-wrap items-center gap-3">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-6 py-3 bg-[#1A1512] hover:bg-[#C1512F] text-white font-mono text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer inline-block"
                    >
                      BACK TO HOME
                    </a>

                    <button
                      onClick={() => {
                        if (countdown === 0) {
                          setIsSubmitted(false);
                          setFormData({ name: '', email: '', whatsapp: '', message: '' });
                        }
                      }}
                      disabled={countdown > 0}
                      className={`px-4 py-3 border border-[#1A1512] bg-[#F0EBE1] font-mono text-xs font-bold uppercase transition-colors ${
                        countdown > 0
                          ? 'opacity-60 cursor-not-allowed text-[#1A1512]/70'
                          : 'hover:bg-[#1A1512] hover:text-white text-[#1A1512] cursor-pointer'
                      }`}
                    >
                      {countdown > 0 ? `SEND ANOTHER INQUIRY (${countdown}s)` : 'SEND ANOTHER INQUIRY'}
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
