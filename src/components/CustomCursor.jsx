import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const onMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const onMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('cursor-pointer')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-[#C1512F] rounded-full pointer-events-none z-[999]"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
          scale: isHovered ? 0 : 1,
          opacity: isHovered ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 1000, damping: 50, mass: 0.1 }}
      />

      <motion.div
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[998] transition-colors duration-150 ${
          isHovered
            ? 'w-10 h-10 bg-[#C1512F]/20 border border-[#C1512F]'
            : 'w-6 h-6 border border-[#1A1512]/30 bg-transparent'
        }`}
        animate={{
          x: mousePosition.x - (isHovered ? 20 : 12),
          y: mousePosition.y - (isHovered ? 20 : 12),
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.2 }}
      />
    </>
  );
}
