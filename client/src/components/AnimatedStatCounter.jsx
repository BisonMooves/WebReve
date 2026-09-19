import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

export default function AnimatedStatCounter({ numericValue, prefix = "", suffix = "", label, subtext }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = numericValue;
    const duration = 1800;
    const steps = 50;
    const increment = (end - start) / steps;
    const stepTime = duration / steps;

    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, numericValue]);

  const displayCount = numericValue % 1 !== 0 
    ? count.toFixed(1) 
    : Math.floor(count);

  return (
    <div ref={ref} className="p-6 border border-[#1A1512]/15 bg-[#F0EBE1] space-y-2">
      <div className="text-5xl font-extrabold font-display uppercase tracking-tight text-[#1A1512] leading-none">
        <span className="text-[#C1512F]">{prefix}</span>
        <span>{displayCount}</span>
        <span className="text-[#1A1512]">{suffix}</span>
      </div>
      
      <div className="font-mono text-xs font-bold tracking-widest uppercase text-[#1A1512]">
        {label}
      </div>

      <p className="text-xs text-[#1A1512]/70 font-sans leading-relaxed">
        {subtext}
      </p>
    </div>
  );
}
