import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FloatingAddButton({ onClick }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-40"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: isScrolled ? 0.9 : 1, opacity: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <button
        onClick={onClick}
        className="flex items-center gap-2 p-4 sm:p-5 rounded-full border-[3px] border-[#1E1E1E] shadow-[5px_5px_0px_#1E1E1E] transition-all font-black text-black"
        style={{
          backgroundColor: 'var(--color-lime)'
        }}
        aria-label="일정 추가"
      >
        <Plus className="w-7 h-7 stroke-[3.5]" />
        {!isScrolled && (
          <span className="text-sm font-extrabold pr-1 hidden sm:inline">일정 추가</span>
        )}
      </button>
    </motion.div>
  );
}
