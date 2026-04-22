"use client";

import { useState, useEffect } from "react";
import { ArrowRight, GitBranch, Code2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardView from "./dashboard-view"; // We will create this
import LoadingView from "./loading-view"; // We will create this

// Keep our text messages consistent for the loader
const loadingTexts = [
  "Ingesting repository...",
  "Building AST Map...",
  "Extracting AI Tech Stack...",
];

export default function AppOrchestrator() {
  const [uiState, setUiState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const validateGithubUrl = (input: string) => {
    try {
      const urlObj = new URL(input);
      if (urlObj.hostname !== "github.com") return false;
      const parts = urlObj.pathname.split("/").filter(Boolean);
      return parts.length >= 2; // Needs owner and repo
    } catch {
      return false;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (!validateGithubUrl(url)) {
      setError(
        "Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo).",
      );
      setUiState("error");
      return;
    }

    setUiState("loading");
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(
          "Failed to analyze the repository. It might be private or invalid.",
        );
      }

      const result = await response.json();
      setData(result);
      setUiState("success");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred parsing the repo.");
      setUiState("error");
    }
  };

  if (uiState === "loading") {
    return <LoadingView loadingTexts={loadingTexts} />;
  }

  if (uiState === "success" && data) {
    return <DashboardView data={data} repoId={data.repoId} />;
  }

  // IDLE & ERROR VIEW
  return (
    <>
      <div className="relative min-h-[500px] md:min-h-[700px] flex flex-col items-center pt-16 md:pt-24 px-4 text-center font-sans z-10 w-full">
        {/* Large Typography */}
        <h1 className="text-[40px] md:text-[80px] font-bold tracking-tight text-[#111111] max-w-5xl leading-[1.1] md:leading-[1.05] mb-6 px-2">
          Understand Code <br className="hidden md:block" /> Without Reading It
        </h1>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 px-5 py-4 bg-red-50/90 backdrop-blur text-red-600 text-sm font-medium rounded-2xl border border-red-200/50 shadow-sm max-w-2xl w-full flex items-start gap-3 text-left"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <p leading-relaxed>{error}</p>
          </motion.div>
        )}

        {/* Startup Style Input Search Box */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          onSubmit={onSubmit}
          className="relative mt-8 md:mt-12 w-full max-w-[850px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] rounded-[16px] sm:rounded-t-[16px] sm:rounded-b-[24px] text-left font-sans ring-1 ring-black/5 bg-white group overflow-hidden"
        >
          {/* Top Bar inside Input */}
          <div className="flex flex-row items-center justify-between px-3 sm:px-6 py-3 sm:py-4 bg-[#000000] text-white rounded-t-[16px] border-b border-transparent relative z-10 transition-colors w-full">
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 hover:bg-white/10 transition-colors px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10 backdrop-blur-md cursor-default">
                <div className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500"></span>
                </div>
                <span className="text-[10px] sm:text-[12px] font-semibold text-white/90 tracking-wide">
                  0<span className="text-white/40 mx-[2px]">/</span>10
                  <span className="hidden sm:inline text-white/60 ml-1 font-medium">
                    credits
                  </span>
                </span>
              </div>
              <button
                type="button"
                className="group relative inline-flex items-center justify-center rounded-full bg-black px-2.5 sm:px-4 py-1 sm:py-1.5 text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-[#4ADE80] shadow-[inset_0_0_0_1px_rgba(74,222,128,0.3)] hover:shadow-[inset_0_0_0_1px_rgba(74,222,128,0.8),0_0_15px_rgba(74,222,128,0.2)] hover:bg-[#4ADE80]/10 transition-all duration-300"
              >
                <span className="relative z-10 scale-100 group-hover:scale-105 transition-transform duration-300">
                  Upgrade
                </span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#4ADE80]/0 via-[#4ADE80]/20 to-[#4ADE80]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"></div>
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[12px] font-medium text-white/50 tracking-wide shrink-0">
              <Code2 className="w-3 h-3 sm:w-4 sm:h-4 text-white/70" />
              <span className="hidden sm:inline">Powered by</span>
              <span className="text-white/90 font-semibold tracking-normal">
                Kenshō
              </span>
            </div>
          </div>

          {/* Middle Search Input Area */}
          <div className="relative pt-5 sm:pt-6 pb-16 sm:pb-20 px-4 sm:px-8 bg-white z-10">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter GitHub URL..."
              className="w-full pr-[50px] sm:pr-[60px] outline-none bg-transparent text-[#64748b] placeholder:text-[#94a3b8] font-medium text-[16px] sm:text-[24px] md:text-[28px] transition-all"
              required
            />

            {/* Action Button */}
            <button
              type="submit"
              className="absolute right-3 sm:right-8 top-3 sm:top-6 bg-black text-white w-10 h-10 sm:w-11 sm:h-11 rounded-full hover:bg-slate-800 transition-all flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 group/btn"
              title="Analyze Codebase"
            >
              <ArrowRight
                className="w-4 h-4 sm:w-5 sm:h-5 -rotate-45 group-hover/btn:rotate-0 transition-transform duration-300"
                strokeWidth={2.5}
              />
            </button>
          </div>

          {/* Bottom Attachments / Badges */}
          <div className="absolute bottom-3 sm:bottom-4 left-4 right-4 sm:left-6 sm:right-6 flex items-center justify-between z-10 select-none border-t border-slate-100 pt-3 sm:pt-4">
            <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar">
              <div className="flex flex-shrink-0 items-center gap-1 sm:gap-1.5 hover:text-slate-800 transition-colors text-[11px] sm:text-[13px] font-semibold text-slate-500 cursor-pointer">
                <GitBranch className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70" />{" "}
                Public Repo
              </div>
              <div className="flex flex-shrink-0 items-center gap-1 sm:gap-1.5 hover:text-slate-800 transition-colors text-[11px] sm:text-[13px] font-semibold text-slate-500 cursor-pointer">
                <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70" /> Full
                AST
              </div>
            </div>
            <div className="text-[11px] sm:text-[13px] font-medium text-slate-400 shrink-0">
              {url.length}/3,000
            </div>
          </div>
        </motion.form>
      </div>
    </>
  );
}
