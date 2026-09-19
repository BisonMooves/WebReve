// Pricing Packages and Calculation Rules Configuration
export const MONTHLY_MAINTENANCE_PRICE = 499;

export const PACKAGES = [
  {
    id: "static",
    name: "Static Launch",
    badge: "1–2 weeks",
    popular: false,
    basePrice: 5000,
    priceDisplay: "₹5,000",
    description: "A fast, clean website for businesses that need to be online without the complexity. Designed, built and hosted for you.",
    domain: "Not included",
    domainNote: "Domain purchase and renewals are not included. You bring your own domain.",
    freeMaintenanceMonths: 0,
    maintenanceNote: `Maintenance available as an add-on, ₹${MONTHLY_MAINTENANCE_PRICE}/month.`,
    features: [
      "Custom-designed responsive website (React build)",
      "Hosting setup and live deployment",
      "Contact form or WhatsApp button",
      "Basic SEO and speed optimisation",
      "Mobile, tablet and desktop tested"
    ],
    buttonText: "Select Static Launch"
  },
  {
    id: "dynamic",
    name: "Dynamic Build",
    badge: "2–4 weeks",
    popular: true,
    popularLabel: "Most popular",
    basePrice: 10000,
    priceDisplay: "₹10,000",
    description: "A website that does more than display pages: logins, saved data and content you can manage yourself. Your domain is bought and connected for you.",
    domain: "Included (first year)",
    domainNote: "Domain and hosting renewals after the first year are billed at cost.",
    freeMaintenanceMonths: 3,
    maintenanceNote: `3 months of free maintenance. Extend anytime at ₹${MONTHLY_MAINTENANCE_PRICE}/month.`,
    features: [
      "Everything in Static Launch",
      "Dynamic features: database, forms that save data, admin panel",
      "Domain name purchased and connected (first year)",
      "Hosting and deployment for the backend",
      "Technical SEO setup"
    ],
    buttonText: "Start Dynamic Build"
  },
  {
    id: "care",
    name: "Dynamic + Care",
    badge: "2–4 weeks + 6 mos support",
    popular: false,
    basePrice: 15000,
    priceDisplay: "₹15,000",
    description: "The complete dynamic build with custom backend, plus 6 full months of free maintenance and priority support included.",
    domain: "Included (first year)",
    domainNote: "Domain and hosting renewals after the first year are billed at cost.",
    freeMaintenanceMonths: 6,
    maintenanceNote: "6 months of free maintenance included (₹0 for first 6 months).",
    features: [
      "Everything in Dynamic Build",
      "6 months of free maintenance & support",
      "Free bug fixes, framework updates & content tweaks",
      "24/7 Uptime monitoring & priority response SLA",
      "1-on-1 Admin panel walkthrough & training session"
    ],
    buttonText: "Start Dynamic + Care"
  }
];

export const calculateMaintenanceCost = (months) => {
  if (months <= 0) return 0;
  if (months === 12) return 4990; // Special 12-month deal (Save ₹998)
  if (months > 12 && months % 12 === 0) {
    return (months / 12) * 4990;
  }
  return months * MONTHLY_MAINTENANCE_PRICE;
};

export const getPlanSummary = (planId, extraMonths = 0) => {
  const plan = PACKAGES.find((p) => p.id === planId) || PACKAGES[1];
  const maintenanceCost = calculateMaintenanceCost(extraMonths);
  const total = plan.basePrice + maintenanceCost;

  let terms = '';
  if (plan.id === 'static') {
    terms = extraMonths > 0 ? `${extraMonths} extra months` : 'Base project';
  } else {
    terms = extraMonths > 0
      ? `${plan.freeMaintenanceMonths} included + ${extraMonths} extra months`
      : `${plan.freeMaintenanceMonths} months maintenance included`;
  }

  return {
    planId: plan.id,
    planName: plan.name,
    basePrice: plan.basePrice,
    freeMaintenanceMonths: plan.freeMaintenanceMonths,
    extraMonths,
    totalPrice: total,
    summaryText: `${plan.name} · ${terms} · ₹${total.toLocaleString()}`
  };
};

export const getSupportCommitmentText = () => {
  const dynamicPlan = PACKAGES.find((p) => p.id === 'dynamic') || { name: 'Dynamic Build', freeMaintenanceMonths: 3 };
  const carePlan = PACKAGES.find((p) => p.id === 'care') || { name: 'Dynamic + Care', freeMaintenanceMonths: 6 };
  return `${dynamicPlan.name} includes ${dynamicPlan.freeMaintenanceMonths} months of free maintenance and ${carePlan.name} includes ${carePlan.freeMaintenanceMonths}. After that it's ₹${MONTHLY_MAINTENANCE_PRICE} a month, and you can stop any time.`;
};
