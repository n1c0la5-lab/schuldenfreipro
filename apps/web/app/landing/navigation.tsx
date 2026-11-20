"use client";

import { motion } from "motion/react";
import { useState } from "react";
import Link from "next/link";

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4"
    >
      <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/50 px-6 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/landing/logo.png"
              alt="schulden.PRO"
              className="h-10 w-auto"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            <a
              href="#funktionen"
              className="flex items-center gap-1 px-4 py-2 text-slate-700 hover:text-emerald-600 transition-colors rounded-lg hover:bg-emerald-50"
            >
              <span>Funktionen</span>
            </a>
            <a
              href="#fuer-wen"
              className="flex items-center gap-1 px-4 py-2 text-slate-700 hover:text-emerald-600 transition-colors rounded-lg hover:bg-emerald-50"
            >
              <span>Für Wen</span>
            </a>
            <a
              href="#team"
              className="flex items-center gap-1 px-4 py-2 text-slate-700 hover:text-emerald-600 transition-colors rounded-lg hover:bg-emerald-50"
            >
              <span>Team</span>
            </a>
            <a
              href="#roadmap"
              className="px-4 py-2 text-slate-700 hover:text-emerald-600 transition-colors rounded-lg hover:bg-emerald-50"
            >
              Roadmap
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="bg-[rgb(140,198,63)] hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg font-medium text-sm"
            >
              Kostenlos starten
            </Link>

            <button
              className="lg:hidden flex items-center justify-center w-10 h-10 text-slate-700 rounded-lg hover:bg-slate-50"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-slate-200 pt-4 flex flex-col gap-2">
            <a
              href="#funktionen"
              className="px-4 py-2 text-slate-700 hover:text-emerald-600 rounded-lg hover:bg-emerald-50"
            >
              Funktionen
            </a>
            <a
              href="#fuer-wen"
              className="px-4 py-2 text-slate-700 hover:text-emerald-600 rounded-lg hover:bg-emerald-50"
            >
              Für Wen
            </a>
            <a
              href="#team"
              className="px-4 py-2 text-slate-700 hover:text-emerald-600 rounded-lg hover:bg-emerald-50"
            >
              Team
            </a>
            <a
              href="#roadmap"
              className="px-4 py-2 text-slate-700 hover:text-emerald-600 rounded-lg hover:bg-emerald-50"
            >
              Roadmap
            </a>
          </div>
        )}
      </div>
    </motion.nav>
  );
}
