import React, { useState } from 'react';
import { Check, Shield, Clock, RefreshCw, ArrowRight, Plus, Minus, Info, Zap } from 'lucide-react';
import { PACKAGES, calculateMaintenanceCost, getPlanSummary } from '../data/pricingConfig';

export default function PricingSection() {
  const [selectedPlanId, setSelectedPlanId] = useState('dynamic'); // 'static' | 'dynamic' | 'care'
  const [extraMonths, setExtraMonths] = useState(0); // Extra maintenance months for selected plan

  const packages = PACKAGES;
  const currentPlan = packages.find((p) => p.id === selectedPlanId) || packages[1];
  const maintenanceCost = calculateMaintenanceCost(extraMonths);
  const totalPrice = currentPlan.basePrice + maintenanceCost;

  const handleSelectPlan = (planId) => {
    setSelectedPlanId(planId);
    setExtraMonths(0); // reset extra months when switching plan
    const summary = getPlanSummary(planId, 0);
    window.dispatchEvent(new CustomEvent('selectPlan', { detail: summary }));
  };

  const handleProceedToContact = (plan, extraM = extraMonths) => {
    const summary = getPlanSummary(plan.id, extraM);
    window.dispatchEvent(new CustomEvent('selectPlan', { detail: summary }));

    const contactEl = document.getElementById('contact');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
    }
  };


  return (
    <section id="pricing" className="py-20 px-6 md:px-12 bg-[#F0EBE1] border-b border-[#1A1512]/15 relative z-10">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#1A1512]/15 pb-4">
          <div>
            <h2 className="text-5xl sm:text-7xl font-extrabold font-display uppercase tracking-tight text-[#1A1512]">
              INVESTMENT & TIERS
            </h2>
            <p className="font-mono text-xs text-[#1A1512]/60 uppercase tracking-widest mt-1">
              TRANSPARENT VALUE-DRIVEN ENGINEERING PRICING
            </p>
          </div>
          <span className="font-mono text-xs font-bold tracking-widest text-[#1A1512]/60 uppercase">
            05 / PRICING
          </span>
        </div>

        {/* STEP 1: The 3 Core Package Cards */}
        <div className="pricing-cards-grid grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg) => {
            const isSelected = selectedPlanId === pkg.id;
            return (
              <div
                key={pkg.id}
                onClick={() => handleSelectPlan(pkg.id)}
                className={`pricing-card-subgrid p-8 border relative transition-all duration-300 cursor-pointer flex flex-col gap-6 lg:gap-0 ${
                  isSelected
                    ? 'border-2 border-[#1A1512] bg-[#E8E2D7] shadow-xl'
                    : 'border border-[#1A1512]/15 bg-[#F0EBE1] hover:border-[#1A1512]/40 hover:bg-[#E8E2D7]/20'
                }`}
              >
                {/* Popular Pill */}
                {pkg.popular && (
                  <div className="absolute -top-3.5 left-6 px-3.5 py-0.5 bg-[#C1512F] text-white font-mono text-[10px] font-bold tracking-widest uppercase shadow-sm z-10">
                    {pkg.popularLabel}
                  </div>
                )}

                {/* 1. Header: Title, Badge, Description */}
                <div className="flex flex-col justify-start">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-3xl font-extrabold font-display uppercase text-[#1A1512]">
                      {pkg.name}
                    </h3>
                    <span className="font-mono text-[10px] font-bold text-[#1A1512]/70 border border-[#1A1512]/20 px-2.5 py-0.5 uppercase whitespace-nowrap bg-[#1A1512]/5">
                      {pkg.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#1A1512]/80 mt-2.5 leading-relaxed font-sans">
                    {pkg.description}
                  </p>
                </div>

                {/* 2. Price Block */}
                <div className="pt-6 border-t border-[#1A1512]/15 flex flex-col justify-center">
                  <span className="font-mono text-[10px] text-[#1A1512]/60 uppercase block">STARTING AT</span>
                  <div className="text-4xl font-extrabold font-display text-[#1A1512] mt-0.5">
                    {pkg.priceDisplay} <span className="font-mono text-xs text-[#1A1512]/60 font-normal">/ PROJECT</span>
                  </div>
                </div>

                {/* 3. Structured Maintenance Box */}
                <div className="pt-4 pb-2">
                  <div className="p-3 bg-[#1A1512]/[0.03] border border-[#1A1512]/15 space-y-1.5">
                    <div className="font-mono text-[9px] uppercase tracking-wider text-[#1A1512]/50 font-bold">
                      Maintenance
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {pkg.id === 'static' ? (
                          <span className="w-2 h-2 border border-[#C1512F] flex-shrink-0 inline-block" />
                        ) : (
                          <span className="w-2 h-2 bg-[#C1512F] flex-shrink-0 inline-block" />
                        )}
                        <span className="font-sans font-semibold text-xs sm:text-sm text-[#1A1512] truncate">
                          {pkg.id === 'static'
                            ? 'Optional add-on'
                            : `${pkg.freeMaintenanceMonths} months free`}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-[#1A1512]/50 whitespace-nowrap flex-shrink-0">
                        {pkg.id === 'static' ? '₹499/mo' : 'then ₹499/mo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. What's Included Feature List */}
                <div className="space-y-3 font-sans flex flex-col justify-between pt-4">
                  <div className="space-y-2.5">
                    <span className="font-mono text-[10px] font-bold text-[#1A1512] uppercase block tracking-widest">
                      WHAT'S INCLUDED:
                    </span>
                    <ul className="space-y-2.5">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-[#1A1512]/90 leading-normal">
                          <Check className="w-3.5 h-3.5 text-[#C1512F] flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Note under the list */}
                  <div className="pt-3">
                    <p className="text-[11px] font-mono text-[#1A1512]/60 italic leading-relaxed border-t border-[#1A1512]/10 pt-2.5">
                      Note: {pkg.domainNote}
                    </p>
                  </div>
                </div>

                {/* 5. Card Action Button */}
                <div className="pt-6 border-t border-[#1A1512]/15 space-y-2 flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(pkg.id);
                    }}
                    className={`w-full py-3.5 font-mono text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1A1512] text-white hover:bg-[#C1512F]'
                        : 'border border-[#1A1512] text-[#1A1512] hover:bg-[#1A1512] hover:text-white'
                    }`}
                  >
                    <span>{isSelected ? `${pkg.buttonText} (Selected)` : pkg.buttonText}</span>
                    <span>→</span>
                  </button>
                  <div className="text-center">
                    <span className={`font-mono text-[10px] uppercase tracking-wider ${
                      isSelected ? 'text-[#C1512F] font-bold' : 'text-[#1A1512]/50'
                    }`}>
                      {isSelected ? '● CURRENTLY SELECTED' : 'CLICK TO SELECT & CONFIGURE'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* STEP 2: Interactive "Keep It Running" Maintenance Configurator */}
        <div className="border border-[#1A1512] bg-[#E8E2D7] p-6 sm:p-10 space-y-8">
          
          {/* Header with eyebrow, heading and aligned "Selected plan" badge */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#1A1512]/15 pb-5">
            <div>
              <span className="font-mono text-[10px] font-bold tracking-widest text-[#C1512F] uppercase block mb-[14px]">
                STEP 2 · POST-LAUNCH LONGEVITY
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold font-display uppercase text-[#1A1512]">
                KEEP IT RUNNING · MAINTENANCE & SUPPORT
              </h3>
            </div>
            <div className="sm:self-start font-mono text-[11px] font-bold text-[#1A1512] bg-[#F0EBE1] px-3.5 py-1.5 border border-[#1A1512]/15 uppercase whitespace-nowrap">
              SELECTED PLAN: <span className="text-[#C1512F]">{currentPlan.name}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Col: Stepper, Quick Picks, and Renewal Note */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2 font-mono text-xs">
                  <span className="font-bold text-[#1A1512] uppercase">
                    {currentPlan.id === 'static'
                      ? 'Add maintenance (optional)'
                      : `${currentPlan.freeMaintenanceMonths} months maintenance included`}
                  </span>
                  <span className="text-[#1A1512]/60">₹499 / month after free period</span>
                </div>

                <p className="font-sans text-base text-[#1A1512]/75 leading-relaxed">
                  {currentPlan.id === 'static'
                    ? 'A website needs occasional security patches and small tweaks. Add monthly maintenance as an optional retainer:'
                    : 'Extend beyond that with proactive uptime, security and monthly design updates:'}
                </p>

                {/* Quick Pick Buttons */}
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {(currentPlan.id === 'static'
                    ? [
                        { label: "0 months", value: 0 },
                        { label: "1 month", value: 1 },
                        { label: "3 months", value: 3 },
                        { label: "6 months", value: 6 },
                        { label: "+12 months · 2 free", value: 12, highlight: true }
                      ]
                    : [
                        { label: "+0 months", value: 0 },
                        { label: "+3 months", value: 3 },
                        { label: "+6 months", value: 6 },
                        { label: "+12 months · 2 free", value: 12, highlight: true }
                      ]
                  ).map((chip) => {
                    const isChipActive = extraMonths === chip.value;
                    return (
                      <button
                        key={chip.value}
                        type="button"
                        onClick={() => setExtraMonths(chip.value)}
                        className={`px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                          isChipActive
                            ? 'bg-[#1A1512] text-white border-[#1A1512] shadow-sm'
                            : chip.highlight
                            ? 'bg-[#C1512F]/10 border-[#C1512F] text-[#C1512F] hover:bg-[#C1512F] hover:text-white'
                            : 'bg-[#F0EBE1] border-[#1A1512]/20 text-[#1A1512] hover:border-[#1A1512]'
                        }`}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Duration Stepper */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <span className="font-mono text-xs text-[#1A1512]/70 uppercase font-bold">
                    CUSTOM DURATION:
                  </span>
                  <div className="flex items-center border border-[#1A1512] bg-[#F0EBE1]">
                    <button
                      type="button"
                      disabled={extraMonths === 0}
                      onClick={() => setExtraMonths((prev) => Math.max(0, prev - 1))}
                      className={`px-3.5 py-2 border-r border-[#1A1512] transition-colors ${
                        extraMonths === 0
                          ? 'opacity-30 cursor-not-allowed text-[#1A1512]'
                          : 'text-[#1A1512] hover:bg-[#1A1512] hover:text-[#F0EBE1] cursor-pointer'
                      }`}
                      title="Decrease months"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 py-2 font-sans font-bold text-base text-[#1A1512] text-center min-w-[120px] select-none">
                      {extraMonths} {extraMonths === 1 ? 'month' : 'months'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExtraMonths((prev) => prev + 1)}
                      className="px-3.5 py-2 border-l border-[#1A1512] text-[#1A1512] hover:bg-[#1A1512] hover:text-[#F0EBE1] transition-colors cursor-pointer"
                      title="Increase months"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {extraMonths === 12 && (
                    <span className="font-mono text-[10px] font-bold text-[#C1512F] bg-[#C1512F]/10 px-2 py-1 border border-[#C1512F]/30 uppercase">
                      ₹4,990 SPECIAL (2 MONTHS FREE)
                    </span>
                  )}
                </div>
              </div>

              {/* Renewal Note */}
              <div className="p-4 bg-[#F0EBE1] border border-[#1A1512]/15">
                <p className="flex items-start gap-2.5 font-sans text-base text-[#1A1512]/75 leading-relaxed">
                  <Info className="w-5 h-5 text-[#C1512F] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#1A1512] font-semibold">Renewal note:</strong> Domain and hosting renewals after the first year are billed at cost, separately from maintenance.
                  </span>
                </p>
              </div>

            </div>

            {/* Right Col: Live Total & Final CTA */}
            <div className="lg:col-span-5 p-6 bg-[#F0EBE1] border border-[#1A1512] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="font-mono text-[10px] font-bold tracking-widest text-[#1A1512]/60 uppercase block">
                  PROJECT INVESTMENT SUMMARY
                </span>

                <div className="space-y-3 font-mono text-xs border-b border-[#1A1512]/15 pb-4">
                  <div className="flex justify-between items-center text-[#1A1512]">
                    <span>{currentPlan.name} (Base Build)</span>
                    <span className="font-bold">{currentPlan.priceDisplay}</span>
                  </div>

                  <div className="flex justify-between items-center text-[#1A1512]">
                    <span>
                      {currentPlan.freeMaintenanceMonths > 0
                        ? `${currentPlan.freeMaintenanceMonths} months maintenance included`
                        : 'Free Support Period'}
                    </span>
                    <span className="font-bold text-[#C1512F]">FREE</span>
                  </div>

                  {extraMonths > 0 && (
                    <div className="flex justify-between items-center text-[#C1512F]">
                      <span>
                        {extraMonths === 12
                          ? 'Extra maintenance, 12 months (2 months free)'
                          : `Extra maintenance, ${extraMonths} ${extraMonths === 1 ? 'month' : 'months'} × ₹499`}
                      </span>
                      <span className="font-bold">+₹{maintenanceCost.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Total Calculation Output */}
                <div className="pt-1">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-[#1A1512]/60 uppercase block">
                        TOTAL ESTIMATED INVESTMENT
                      </span>
                      <div className="text-3xl sm:text-4xl font-extrabold font-display text-[#1A1512]">
                        ₹{totalPrice.toLocaleString()}
                      </div>
                    </div>
                    {extraMonths === 12 && (
                      <span className="font-mono text-[10px] font-bold text-[#C1512F] bg-[#C1512F]/10 px-2 py-1 border border-[#C1512F]/30">
                        SAVED ₹998
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-xs text-[#1A1512]/60 mt-1.5">
                    Then ₹499/month after the included period.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleProceedToContact(currentPlan, extraMonths, totalPrice)}
                className="w-full py-4 bg-[#1A1512] hover:bg-[#C1512F] text-white font-mono text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-none"
              >
                <span>PROCEED WITH {currentPlan.name.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* STEP 3: "What Maintenance Covers" & Fair-Use Limits */}
        <div className="space-y-8">
          <div className="border-b border-[#1A1512]/15 pb-4">
            <span className="font-mono text-[10px] font-bold tracking-widest text-[#C1512F] uppercase block mb-[14px]">
              Included in every maintenance plan
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold font-display uppercase text-[#1A1512]">
              WHAT MAINTENANCE COVERS
            </h3>
            <p className="font-sans text-base text-[#1A1512]/70 mt-2 leading-relaxed">
              Fixes, updates and monitoring after launch.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. Uptime Monitoring */}
            <div className="p-6 border border-[#1A1512]/15 bg-[#E8E2D7]/50 space-y-3">
              <div className="w-8 h-8 bg-[#1A1512] text-[#F0EBE1] flex items-center justify-center font-mono">
                <Zap className="w-4 h-4 text-[#C1512F]" />
              </div>
              <h4 className="font-display text-lg font-bold uppercase text-[#1A1512]">
                UPTIME & BUG FIXES
              </h4>
              <p className="text-xs text-[#1A1512]/80 leading-relaxed font-sans">
                Fixing failures and downtime immediately with continuous 24/7 automated uptime monitoring.
              </p>
            </div>

            {/* 2. Content & Design Changes */}
            <div className="p-6 border border-[#1A1512]/15 bg-[#E8E2D7]/50 space-y-3">
              <div className="w-8 h-8 bg-[#1A1512] text-[#F0EBE1] flex items-center justify-center font-mono">
                <RefreshCw className="w-4 h-4 text-[#C1512F]" />
              </div>
              <h4 className="font-display text-lg font-bold uppercase text-[#1A1512]">
                CONTENT & DESIGN TWEAKS
              </h4>
              <p className="text-xs text-[#1A1512]/80 leading-relaxed font-sans">
                Small content and design updates: modifying copy, product images, colour accents, and section text.
              </p>
            </div>

            {/* 3. Security & Backups */}
            <div className="p-6 border border-[#1A1512]/15 bg-[#E8E2D7]/50 space-y-3">
              <div className="w-8 h-8 bg-[#1A1512] text-[#F0EBE1] flex items-center justify-center font-mono">
                <Shield className="w-4 h-4 text-[#C1512F]" />
              </div>
              <h4 className="font-display text-lg font-bold uppercase text-[#1A1512]">
                SECURITY & BACKUPS
              </h4>
              <p className="text-xs text-[#1A1512]/80 leading-relaxed font-sans">
                Regular framework patches, dependency security updates, and automated database/asset backups.
              </p>
            </div>

            {/* 4. Monthly Check-in */}
            <div className="p-6 border border-[#1A1512]/15 bg-[#E8E2D7]/50 space-y-3">
              <div className="w-8 h-8 bg-[#1A1512] text-[#F0EBE1] flex items-center justify-center font-mono">
                <Clock className="w-4 h-4 text-[#C1512F]" />
              </div>
              <h4 className="font-display text-lg font-bold uppercase text-[#1A1512]">
                MONTHLY STATUS CHECK-IN
              </h4>
              <p className="text-xs text-[#1A1512]/80 leading-relaxed font-sans">
                A monthly check-in message with a concise health, performance and speed status report.
              </p>
            </div>

          </div>

          {/* Single line note under the cards */}
          <p className="font-sans text-xs sm:text-sm text-[#1A1512]/60 pt-1">
            ₹499/month after the included period. Renewals of domain and hosting are billed at cost.
          </p>
        </div>

        {/* STEP 4: Feature Comparison Matrix Table */}
        <div className="border border-[#1A1512]/15 bg-[#F0EBE1] overflow-hidden">
          <div className="p-6 md:p-8 border-b border-[#1A1512]/15 bg-[#E8E2D7]/40">
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display uppercase text-[#1A1512]">
              TIER COMPARISON MATRIX
            </h3>
            <p className="font-mono text-xs text-[#1A1512]/60 uppercase tracking-wider mt-1">
              SIDE-BY-SIDE FEATURE & SUPPORT BREAKDOWN
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse table-fixed min-w-[680px]">
              <colgroup>
                <col className="w-[34%]" />
                <col className={`w-[22%] transition-colors duration-200 ${selectedPlanId === 'static' ? 'bg-[#C1512F]/[0.08]' : ''}`} />
                <col className={`w-[22%] transition-colors duration-200 ${selectedPlanId === 'dynamic' ? 'bg-[#C1512F]/[0.08]' : ''}`} />
                <col className={`w-[22%] transition-colors duration-200 ${selectedPlanId === 'care' ? 'bg-[#C1512F]/[0.08]' : ''}`} />
              </colgroup>
              <thead>
                <tr className="border-b border-[#1A1512]/15 text-[#1A1512] font-bold uppercase tracking-widest text-[11px]">
                  <th className="py-4 px-6">PLAN SPECIFICATION</th>
                  <th
                    onClick={() => handleSelectPlan('static')}
                    className={`py-4 px-6 text-center transition-colors cursor-pointer ${
                      selectedPlanId === 'static' ? 'text-[#C1512F] font-bold' : 'hover:text-[#C1512F]'
                    }`}
                  >
                    STATIC LAUNCH
                  </th>
                  <th
                    onClick={() => handleSelectPlan('dynamic')}
                    className={`py-4 px-6 text-center transition-colors cursor-pointer ${
                      selectedPlanId === 'dynamic' ? 'text-[#C1512F] font-bold' : 'hover:text-[#C1512F]'
                    }`}
                  >
                    DYNAMIC BUILD (POPULAR)
                  </th>
                  <th
                    onClick={() => handleSelectPlan('care')}
                    className={`py-4 px-6 text-center transition-colors cursor-pointer ${
                      selectedPlanId === 'care' ? 'text-[#C1512F] font-bold' : 'hover:text-[#C1512F]'
                    }`}
                  >
                    DYNAMIC + CARE
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1512]/10 text-[#1A1512]">
                <tr>
                  <td className="py-3.5 px-6 font-bold uppercase">Base Project Price</td>
                  <td className={`py-3.5 px-6 text-center font-bold ${
                    selectedPlanId === 'static' ? 'text-[#C1512F]' : ''
                  }`}>
                    ₹5,000
                  </td>
                  <td className={`py-3.5 px-6 text-center font-bold ${
                    selectedPlanId === 'dynamic' ? 'text-[#C1512F]' : ''
                  }`}>
                    ₹10,000
                  </td>
                  <td className={`py-3.5 px-6 text-center font-bold ${
                    selectedPlanId === 'care' ? 'text-[#C1512F]' : ''
                  }`}>
                    ₹15,000
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-bold uppercase">Domain Connection</td>
                  <td className={`py-3.5 px-6 text-center ${
                    selectedPlanId === 'static' ? 'font-bold text-[#C1512F]' : 'text-[#1A1512]/60'
                  }`}>
                    Not included (BYO Domain)
                  </td>
                  <td className={`py-3.5 px-6 text-center ${
                    selectedPlanId === 'dynamic' ? 'font-bold text-[#C1512F]' : 'text-[#1A1512]'
                  }`}>
                    Included (First Year)
                  </td>
                  <td className={`py-3.5 px-6 text-center ${
                    selectedPlanId === 'care' ? 'font-bold text-[#C1512F]' : 'text-[#1A1512]'
                  }`}>
                    Included (First Year)
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-bold uppercase">Included Free Maintenance</td>
                  <td className={`py-3.5 px-6 text-center ${
                    selectedPlanId === 'static' ? 'font-bold text-[#C1512F]' : 'text-[#1A1512]/60'
                  }`}>
                    Optional add-on
                  </td>
                  <td className={`py-3.5 px-6 text-center ${
                    selectedPlanId === 'dynamic' ? 'font-bold text-[#C1512F]' : 'text-[#1A1512]'
                  }`}>
                    3 Months Free
                  </td>
                  <td className={`py-3.5 px-6 text-center ${
                    selectedPlanId === 'care' ? 'font-bold text-[#C1512F]' : 'text-[#1A1512]'
                  }`}>
                    12 Months (1 Year) Free
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-bold uppercase">After Free Period</td>
                  <td className={`py-3.5 px-6 text-center ${
                    selectedPlanId === 'static' ? 'font-bold text-[#C1512F]' : ''
                  }`}>
                    ₹499 / month
                  </td>
                  <td className={`py-3.5 px-6 text-center ${
                    selectedPlanId === 'dynamic' ? 'font-bold text-[#C1512F]' : ''
                  }`}>
                    ₹499 / month
                  </td>
                  <td className={`py-3.5 px-6 text-center ${
                    selectedPlanId === 'care' ? 'font-bold text-[#C1512F]' : ''
                  }`}>
                    ₹499 / month
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-bold uppercase">Database & Dynamic Storage</td>
                  <td className="py-3.5 px-6 text-center text-[#1A1512]/40">
                    —
                  </td>
                  <td className={`py-3.5 px-6 text-center ${
                    selectedPlanId === 'dynamic' ? 'text-[#C1512F] font-bold' : 'text-[#1A1512]'
                  }`}>
                    ✓ Included
                  </td>
                  <td className={`py-3.5 px-6 text-center ${
                    selectedPlanId === 'care' ? 'text-[#C1512F] font-bold' : 'text-[#1A1512]'
                  }`}>
                    ✓ Included
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-bold uppercase">Admin Panel Management</td>
                  <td className="py-3.5 px-6 text-center text-[#1A1512]/40">
                    —
                  </td>
                  <td className={`py-3.5 px-6 text-center ${
                    selectedPlanId === 'dynamic' ? 'text-[#C1512F] font-bold' : 'text-[#1A1512]'
                  }`}>
                    ✓ Included
                  </td>
                  <td className={`py-3.5 px-6 text-center ${
                    selectedPlanId === 'care' ? 'text-[#C1512F] font-bold' : 'text-[#1A1512]'
                  }`}>
                    ✓ Included
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-bold uppercase">Handover Walkthrough Call</td>
                  <td className="py-3.5 px-6 text-center text-[#1A1512]/40">
                    —
                  </td>
                  <td className={`py-3.5 px-6 text-center ${
                    selectedPlanId === 'dynamic' ? 'text-[#C1512F] font-bold' : 'text-[#1A1512]/60'
                  }`}>
                    Standard Docs
                  </td>
                  <td className={`py-3.5 px-6 text-center ${
                    selectedPlanId === 'care' ? 'text-[#C1512F] font-bold' : 'text-[#1A1512]'
                  }`}>
                    ✓ 1-on-1 Walkthrough
                  </td>
                </tr>
                <tr className="border-t border-[#1A1512]/15">
                  <td className="py-4 px-6 font-bold uppercase">Action</td>
                  <td className="py-4 px-6 text-center">
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(packages[0].id)}
                      className={`px-4 py-2 font-bold uppercase transition-colors cursor-pointer text-[10px] ${
                        selectedPlanId === 'static'
                          ? 'bg-[#1A1512] text-white hover:bg-[#C1512F]'
                          : 'border border-[#1A1512] hover:bg-[#1A1512] hover:text-white'
                      }`}
                    >
                      {selectedPlanId === 'static' ? 'SELECTED' : 'SELECT STATIC'}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(packages[1].id)}
                      className={`px-4 py-2 font-bold uppercase transition-colors cursor-pointer text-[10px] ${
                        selectedPlanId === 'dynamic'
                          ? 'bg-[#1A1512] text-white hover:bg-[#C1512F]'
                          : 'border border-[#1A1512] hover:bg-[#1A1512] hover:text-white'
                      }`}
                    >
                      {selectedPlanId === 'dynamic' ? 'SELECTED' : 'SELECT DYNAMIC'}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(packages[2].id)}
                      className={`px-4 py-2 font-bold uppercase transition-colors cursor-pointer text-[10px] ${
                        selectedPlanId === 'care'
                          ? 'bg-[#1A1512] text-white hover:bg-[#C1512F]'
                          : 'border border-[#1A1512] hover:bg-[#1A1512] hover:text-white'
                      }`}
                    >
                      {selectedPlanId === 'care' ? 'SELECTED' : 'SELECT CARE'}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Prompt */}
        <div className="text-center pt-2">
          <p className="font-mono text-xs text-[#1A1512]/70 uppercase">
            NEED A BESPOKE ENTERPRISE ARCHITECTURE OR CUSTOM RETENTION CONTRACT?{' '}
            <a href="#contact" className="text-[#C1512F] font-bold hover:underline">
              LET'S TALK DIRECTLY →
            </a>
          </p>
        </div>

      </div>
    </section>
  );
}

