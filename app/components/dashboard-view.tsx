"use client";

import {
  GitBranch,
  AlertTriangle,
  AlertCircle,
  Server,
  Activity,
  ShieldAlert,
  ChevronLeft,
  Layers,
} from "lucide-react";
import CodeGraph from "./CodeGraph";

export default function DashboardView({
  data,
  repoId,
  onBack,
}: {
  data: any;
  repoId: string;
  onBack?: () => void;
}) {
  return (
    <div className="w-full relative z-10 font-sans pb-24">
      {/* Background Base */}
      <div className="fixed inset-0 min-h-screen bg-[#0a0a0a] -z-20" />
      <div className="fixed inset-0 min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0a0a0a] to-[#0a0a0a] -z-10" />

      <div className="max-w-[1400px] mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-4 mb-8 md:mb-12 gap-4">
          <div className="flex flex-col gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-all w-fit font-medium text-sm px-4 py-2 bg-white/5 rounded-full border border-white/5 hover:bg-white/10 hover:-translate-x-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Search
              </button>
            )}
            <h1 className="text-3xl md:text-[42px] font-extrabold tracking-tight text-white flex items-center gap-3">
              <Layers className="w-8 h-8 text-emerald-400" />
              Analysis Report
            </h1>
          </div>
          <div className="flex items-center justify-between bg-emerald-500/10 text-emerald-400 px-5 py-2.5 rounded-full border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)] gap-3 mt-2 md:mt-0">
            <GitBranch className="w-4 h-4" />
            <span className="font-mono text-sm font-semibold tracking-wide">
              {repoId}
            </span>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          {/* Box 1: React Flow Map */}
          <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-3 md:p-5 lg:col-span-8 row-span-2 min-h-[550px] flex flex-col relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-purple-500/5 opacity-50 pointer-events-none" />
            <div className="p-3 flex items-center gap-3 text-white font-bold text-lg z-10">
              <p>Architecture Map</p>
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-emerald-300 border border-emerald-500/20">
                AST INTERACTIVE
              </span>
            </div>
            <div className="w-full flex-1 rounded-[1.25rem] overflow-hidden mt-1 z-10 relative border border-white/5 shadow-inner">
              <CodeGraph nodes={data.nodes} edges={data.edges} />
            </div>
          </div>

          {/* Box 2: Infrastructure / Tech Stack */}
          <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl p-6 md:p-8 lg:col-span-4 relative overflow-hidden">
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-blue-500/10 blur-[60px] pointer-events-none" />
            <h2 className="text-[20px] font-extrabold tracking-tight mb-6 text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-400" />
              Infrastructure
            </h2>
            <div className="space-y-6 relative z-10">
              {Object.entries(data.infrastructure || {}).map(
                ([category, items]: [string, any]) => {
                  if (!items || items.length === 0) return null;
                  return (
                    <div key={category}>
                      <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">
                        {category}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-lg text-xs font-semibold shadow-[0_2px_10px_rgba(59,130,246,0.05)] flex items-center"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          {/* Box 3: Metrics */}
          <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl p-6 md:p-8 lg:col-span-4 relative overflow-hidden flex flex-col justify-center">
            <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-purple-500/10 blur-[60px] pointer-events-none" />
            <h2 className="text-[20px] font-extrabold tracking-tight mb-6 text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Repository Scale
            </h2>
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  Parsed Files
                </p>
                <p className="text-[36px] font-black tracking-tight text-white leading-none">
                  {data.nodes?.length || 0}
                </p>
              </div>
              <div className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  Graph Edges
                </p>
                <p className="text-[36px] font-black tracking-tight text-white leading-none">
                  {data.edges?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Box 4: Risk Scanner */}
          <div className="bg-[#111111]/80 backdrop-blur-xl border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.06)] rounded-3xl p-6 md:p-8 lg:col-span-12 relative overflow-hidden transition-all hover:shadow-[0_0_60px_rgba(239,68,68,0.1)]">
            <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />
            <h2 className="text-[24px] font-extrabold tracking-tight mb-6 flex items-center gap-3 text-white relative z-10">
              <div className="w-11 h-11 rounded-[14px] bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                <ShieldAlert className="w-5 h-5" strokeWidth={2} />
              </div>
              Risk & Threat Scanner
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10 mt-8">
              {data.issues?.length > 0 ? (
                data.issues.map((issue: any, i: number) => (
                  <div
                    key={i}
                    className="flex flex-col justify-between p-5 bg-black/60 border border-white/5 hover:border-red-500/30 rounded-2xl transition-all group overflow-hidden relative shadow-md"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500/50 to-transparent" />
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                          <p className="text-[14px] font-bold text-slate-200">
                            {issue.issueType}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest shrink-0 ${
                            issue.severity === "high"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : issue.severity === "medium"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          }`}
                        >
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-400 font-mono font-medium leading-relaxed truncate">
                        {issue.filePath}
                        {issue.lineNumber && (
                          <span className="text-red-300 ml-2 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">
                            L{issue.lineNumber}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white/5 border border-white/5 rounded-2xl text-center shadow-inner">
                  <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-[16px] flex items-center justify-center mb-4 border border-emerald-500/20">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <p className="text-emerald-400 font-bold text-xl mb-2 tracking-tight">
                    Systems Nominal
                  </p>
                  <p className="text-slate-400 text-sm max-w-sm">
                    Deep inspection cleared without issues. No critical
                    structural bottlenecks or security vulnerabilities found
                    inside AST.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
