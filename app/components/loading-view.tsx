"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingView({
  loadingTexts,
}: {
  loadingTexts: string[];
}) {
  const [loadingIndex, setLoadingIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingIndex((current) => (current + 1) % loadingTexts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [loadingTexts.length]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans fixed inset-0 z-50">
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="w-24 h-24 bg-[#111111] rounded-[24px] shadow-xl flex items-center justify-center mb-8"
      >
        <div className="w-8 h-8 border-4 border-slate-50 border-t-transparent rounded-full animate-spin" />
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.p
          key={loadingIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-slate-600 text-lg font-medium tracking-tight"
        >
          {loadingTexts[loadingIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
