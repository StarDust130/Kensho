"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const loadingStrings = [
  "Authenticating GitHub payload...",
  "Cloning repository structure...",
  "Parsing Abstract Syntax Tree...",
  "Detecting N+1 anomalies...",
  "LLM analyzing tech stack...",
];

export default function TerminalLoader() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, loadingStrings.length - 1));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-[400px] md:min-h-[500px] flex flex-col items-center justify-center pt-8 px-4 text-left font-sans z-10 w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900 rounded-xl shadow-2xl p-6 max-w-lg w-full mx-auto border border-slate-700"
      >
        {/* Mac-style window header */}
        <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-inner"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-inner"></div>
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-inner"></div>
          <div className="ml-2 text-slate-500 text-xs font-mono">
            bash -- kensho-cli
          </div>
        </div>

        {/* Terminal Body */}
        <div className="font-mono text-green-400 text-sm md:text-md min-h-[120px]">
          <div className="flex flex-col gap-2">
            {loadingStrings.slice(0, currentIndex).map((str, i) => (
              <div key={i} className="opacity-70">
                <span className="text-slate-500 mr-2">$</span>
                {str} <span className="text-emerald-300 ml-2">✓ Done</span>
              </div>
            ))}

            {currentIndex < loadingStrings.length && (
              <div className="flex items-start">
                <span className="text-slate-500 mr-2">$</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, display: "none" }}
                    transition={{ duration: 0.3 }}
                    className="mr-1"
                  >
                    {loadingStrings[currentIndex]}
                  </motion.span>
                </AnimatePresence>
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    ease: "linear",
                  }}
                  className="inline-block w-2.5 h-4 bg-green-400 align-middle shadow-[0_0_8px_rgba(74,222,128,0.6)]"
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
