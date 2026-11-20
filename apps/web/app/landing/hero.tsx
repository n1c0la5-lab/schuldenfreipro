"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Navigation } from "./navigation";

export function Hero() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Hintergrundfoto in der oeffentlichen Fassung entfernt (Bildrechte ungeklaert). */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-white/80 via-white/70 to-white/60" />
      <div className="absolute inset-0 z-[11] bg-gradient-to-br from-emerald-50/40 via-transparent to-blue-50/30" />

      <Navigation />

      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center px-4 md:px-8 max-w-4xl mx-auto pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
        >
          <span className="w-2 h-2 bg-emerald-700 rounded-full"></span>
          App Launch Q1 2026
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 text-slate-900 leading-tight"
        >
          Endlich Schuldenfrei{" "}
          <span className="bg-gradient-to-r from-[#8CC63F] via-emerald-500 to-[#003265] bg-clip-text text-transparent">
            sicher &amp; digital
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl text-slate-600 max-w-2xl mb-12 leading-relaxed"
        >
          Unsere KI prüft Ihre Unterlagen in Minuten – ein echter Rechtsanwalt
          erstellt Ihren persönlichen, verbindlichen Plan zur Schuldenfreiheit.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-12"
        >
          <Link
            href="/login"
            className="bg-[rgb(140,198,63)] text-white px-8 py-4 rounded-xl hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl font-medium"
          >
            Kostenlos starten
          </Link>
          <a
            href="#funktionen"
            className="bg-white text-slate-900 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all border border-slate-200 shadow-md hover:shadow-lg font-medium"
          >
            Mehr erfahren
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <svg
              className="w-5 h-5 text-emerald-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Vertraut von über <strong>1.000+ Betroffenen</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <svg
              className="w-5 h-5 text-blue-700"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Geprüft durch <strong>zugelassene Rechtsanwälte</strong>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
