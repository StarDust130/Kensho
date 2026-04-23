"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DashboardView from "@/app/components/dashboard-view";

export default function ReportPage() {
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // On mount, load data from session storage.
    const stored = sessionStorage.getItem("kenshoAnalysis");
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored analysis", e);
        router.push("/");
      }
    } else {
      // If no data is available (e.g., navigated directly), go back home to search.
      router.push("/");
    }
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-[#050505] text-slate-200 selection:bg-emerald-500/30"
    >
      <DashboardView
        data={data}
        repoId={data.repoId}
        onBack={() => router.push("/")}
      />
    </motion.main>
  );
}
