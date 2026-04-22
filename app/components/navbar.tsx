"use client";

import { Cpu } from "lucide-react";

export default function Navbar() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 w-full">
      <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
        <div className="w-8 h-8 bg-slate-900 rounded-[10px] flex items-center justify-center text-white">
          <Cpu className="w-5 h-5" />
        </div>
        Kenshō
      </div>
      <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-slate-700">
        <button
          onClick={() => scrollTo("problem-we-solve")}
          className="hover:text-slate-900 transition-colors"
        >
          Problem It Solves
        </button>
        <button
          onClick={() => scrollTo("how-it-works")}
          className="hover:text-slate-900 transition-colors"
        >
          How It Works
        </button>
        <button
          onClick={() => scrollTo("who-created-it")}
          className="hover:text-slate-900 transition-colors"
        >
          Creator
        </button>
      </nav>
      {/* Spacer to keep center alignment since right buttons log in/signUp were removed */}
      <div className="hidden lg:block w-24"></div>
    </header>
  );
}
