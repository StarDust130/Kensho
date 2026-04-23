"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/navbar";
import Features from "./components/features";
import AppOrchestrator from "./components/orchestrator";

const backgroundImages = [
  "/bg.png",
  "/bg-2.png",
  "/bg-3.png",
  "/bg-4.png",
  "/bg-5.png",
];

export default function Home() {
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="font-sans min-h-screen relative overflow-x-hidden bg-slate-100">
      <div className="relative min-h-[95vh] flex flex-col w-full">
        {/* Animated Background Container */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence>
            <motion.div
              key={bgIndex}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-cover bg-center w-full h-full"
              style={{ backgroundImage: `url(${backgroundImages[bgIndex]})` }}
            />
          </AnimatePresence>
          {/* Aesthetic Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-slate-100 pointer-events-none" />
          <motion.div
            initial={{ opacity: 0.2, scale: 0.95 }}
            animate={{ opacity: 0.35, scale: 1.05 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
            className="absolute -top-16 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-cyan-300/25 to-blue-500/5 blur-3xl pointer-events-none"
          />
          <motion.div
            initial={{ opacity: 0.15, scale: 1.05 }}
            animate={{ opacity: 0.3, scale: 0.95 }}
            transition={{
              duration: 9,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
            className="absolute -bottom-20 -right-16 w-80 h-80 rounded-full bg-gradient-to-tr from-emerald-400/20 to-sky-500/5 blur-3xl pointer-events-none"
          />
        </div>

        {/* Foreground wrapper */}
        <div className="relative z-10 w-full flex flex-col h-full">
          <div className="w-full absolute top-0 pt-2">
            <Navbar />
          </div>
          <div className="flex-1 flex flex-col items-center pt-[100px] md:pt-[120px]">
            <AppOrchestrator />
          </div>
        </div>
      </div>

      <Features />

      <section
        id="who-created-it"
        className="py-24 px-6 bg-slate-900 text-white text-center"
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
            Meet the Creator
          </h2>
          <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
            Built by StarDust130. A passion project aiming to redefine how
            developers interact with complex codebases. No magic, just solid AST
            parsing and visualization.
          </p>
          <div className="inline-flex items-center justify-center p-[2px] rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
            <a
              href="https://github.com/StarDust130"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-3 bg-slate-900 rounded-full font-bold hover:bg-slate-800 transition-colors"
            >
              View GitHub Profile
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
