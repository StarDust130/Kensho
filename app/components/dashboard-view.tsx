"use client";

import { GitBranch, AlertTriangle } from "lucide-react";
import CodeGraph from "./CodeGraph";

export default function DashboardView({
  data,
  repoId,
}: {
  data: any;
  repoId: string;
}) {
  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8 font-sans text-slate-900 absolute inset-0 z-40 overflow-y-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between mt-6 mb-8 px-4">
        <h1 className="text-[32px] font-bold tracking-tight text-[#111111]">
          Analysis Report
        </h1>
        <p className="text-slate-500 font-mono text-[14px] bg-white px-4 py-1.5 rounded-full border border-black/5 shadow-sm mt-4 md:mt-0">
          {repoId}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Box 1: React Flow Map */}
        <div className="bg-white border border-slate-200/60 shadow-sm rounded-3xl p-4 md:p-6 col-span-1 lg:col-span-2 row-span-2 flex flex-col items-center justify-center min-h-[420px] text-slate-400/80">
          <div className="w-full h-[500px] md:h-[700px]">
            <CodeGraph nodes={data.nodes} edges={data.edges} />
          </div>
        </div>

        {/* Box 2: Infrastructure / Tech Stack */}
        <div className="bg-white border border-slate-200/60 shadow-sm rounded-3xl p-8 col-span-1 row-span-2">
          <h2 className="text-[20px] font-bold tracking-tight mb-8 text-[#111]">
            Infrastructure
          </h2>
          <div className="space-y-8">
            {Object.entries(data.infrastructure || {}).map(
              ([category, items]: [string, any]) => {
                if (!items || items.length === 0) return null;
                return (
                  <div key={category}>
                    <h3 className="text-[13px] font-semibold text-slate-400 uppercase tracking-widest mb-4">
                      {category}
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                      {items.map((item: string, i: number) => (
                        <span
                          key={i}
                          className="px-[14px] py-[6px] bg-[#f8f9fa] border border-black/5 text-[#333] rounded-[9px] text-[13px] font-semibold"
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
        <div className="bg-white border border-slate-200/60 shadow-sm rounded-3xl p-8 col-span-1 lg:col-span-1 flex flex-col justify-center">
          <h2 className="text-[20px] font-bold tracking-tight mb-6 text-[#111]">
            Metrics
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-[#f8f9fa] border border-black/5 rounded-[20px] hover:-translate-y-0.5 transition-transform">
              <p className="text-[13px] text-slate-500 font-semibold mb-2">
                Files
              </p>
              <p className="text-[34px] font-extrabold tracking-tight text-[#111]">
                {data.nodes?.length || 0}
              </p>
            </div>
            <div className="p-6 bg-[#f8f9fa] border border-black/5 rounded-[20px] hover:-translate-y-0.5 transition-transform">
              <p className="text-[13px] text-slate-500 font-semibold mb-2">
                Edges
              </p>
              <p className="text-[34px] font-extrabold tracking-tight text-[#111]">
                {data.edges?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Box 4: Risk Scanner */}
        <div className="bg-white border border-slate-200/60 shadow-sm rounded-3xl p-8 col-span-1 lg:col-span-2">
          <h2 className="text-[20px] font-bold tracking-tight mb-6 flex items-center gap-2.5 text-[#111]">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" strokeWidth={2.5} />
            </div>
            Risk Scanner
          </h2>
          <div className="space-y-4">
            {data.issues?.length > 0 ? (
              data.issues.map((issue: any, i: number) => (
                <div
                  key={i}
                  className="flex flex-col md:flex-row md:items-center justify-between p-[18px] bg-[#f8f9fa] border border-black/5 rounded-2xl gap-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex flex-col">
                    <p className="text-[15px] font-bold text-[#111] mb-1">
                      {issue.issueType}
                    </p>
                    <p className="text-[13px] text-slate-500 font-mono font-medium">
                      {issue.filePath}{" "}
                      {issue.lineNumber && `(L${issue.lineNumber})`}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-[5px] rounded-[8px] text-[11px] font-bold uppercase tracking-wider w-fit shrink-0 ${
                      issue.severity === "high"
                        ? "bg-red-100/80 text-red-700 border border-red-200/50"
                        : issue.severity === "medium"
                          ? "bg-amber-100/80 text-amber-700 border border-amber-200/50"
                          : "bg-blue-100/80 text-blue-700 border border-blue-200/50"
                    }`}
                  >
                    {issue.severity}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[14px] text-slate-500 font-medium bg-[#f8f9fa] p-4 rounded-xl border border-black/5">
                No issues detected across your architecture.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
