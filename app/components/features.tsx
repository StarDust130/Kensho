"use client";

import { Brain, Zap, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 70, damping: 12 },
    },
  };

  return (
    <>
      <section
        id="problem-we-solve"
        className="py-24 px-6 relative z-10 max-w-7xl mx-auto font-sans"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16 pt-12"
        >
          <h2 className="text-[34px] md:text-[42px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Stop Guessing Where <br className="hidden md:block" /> The Bug Is
          </h2>
          <p className="mt-4 text-[19px] font-medium text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A real engineer doesn't poke around in the dark — they build systems
            that make the truth impossible to hide. We map your entire codebase
            architecture instantly.
          </p>
        </motion.div>
      </section>

      <section
        id="how-it-works"
        className="py-24 px-6 relative z-10 bg-slate-50 font-sans border-t border-slate-200/60 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-[30px] md:text-[38px] font-extrabold text-slate-900 tracking-tight leading-tight">
              How It Works
            </h2>
            <p className="mt-4 text-[17px] font-medium text-slate-600 max-w-2xl mx-auto leading-relaxed">
              We analyze the repository at the AST level to build a complete
              diagnostic model.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <motion.div
              variants={itemVariants}
              className="bg-white p-8 rounded-[24px] border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-150 duration-700" />
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-[16px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:bg-blue-600 group-hover:text-white shadow-sm group-hover:shadow-blue-200">
                <Brain className="w-7 h-7" strokeWidth={2} />
              </div>
              <h3 className="text-[22px] font-extrabold text-slate-900 mb-3 tracking-tight transition-colors">
                Codebase Brain
              </h3>
              <p className="text-[16px] text-slate-500 leading-relaxed font-medium">
                Generates a visual graph of files & connections. Automatically
                detects your frontend/backend architectural structure and
                extracts your tech stack infrastructure.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white p-8 rounded-[24px] border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-150 duration-700" />
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-[16px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:bg-amber-500 group-hover:text-white shadow-sm group-hover:shadow-amber-200">
                <Zap className="w-7 h-7" strokeWidth={2} />
              </div>
              <h3 className="text-[22px] font-extrabold text-slate-900 mb-3 tracking-tight transition-colors">
                Performance Analyzer
              </h3>
              <p className="text-[16px] text-slate-500 leading-relaxed font-medium">
                Detects slow architectural patterns and execution flow chains.
                Highlight and isolate structural bottlenecks directly across the
                AST dependency tree.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white p-8 rounded-[24px] border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-150 duration-700" />
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-[16px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:bg-red-500 group-hover:text-white shadow-sm group-hover:shadow-red-200">
                <ShieldAlert className="w-7 h-7" strokeWidth={2} />
              </div>
              <h3 className="text-[22px] font-extrabold text-slate-900 mb-3 tracking-tight transition-colors">
                Bug & Risk Scanner
              </h3>
              <p className="text-[16px] text-slate-500 leading-relaxed font-medium">
                Smart heuristic scanning runs over your repositories. Find
                missing try/catch blocks, unhandled promise rejections, and
                looping queries proactively.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
