import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PageLoader({ onComplete }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      if (onComplete) onComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className="fixed inset-0 z-[100] bg-[#F0EBE1] flex flex-col items-center justify-center p-6 select-none border-b border-[#1A1512]/15"
        >
          <div className="flex items-center gap-1 font-display font-extrabold text-5xl uppercase tracking-tight text-[#1A1512] mb-4">
            <span>WEBREVE</span>
            <span className="w-3 h-3 bg-[#C1512F] inline-block mb-1" />
          </div>

          <div className="w-36 h-0.5 bg-[#1A1512]/10 overflow-hidden mx-auto">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
              className="h-full bg-[#C1512F]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
