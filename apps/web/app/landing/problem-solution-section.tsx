"use client";

import { motion } from "motion/react";
import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export function ProblemSolutionSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold mb-4 text-center text-slate-900"
        >
          Ihr umfassender rechtlicher Begleiter
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-slate-600 text-center mb-20 max-w-3xl mx-auto"
        >
          Alles, was Sie für effiziente juristische Arbeit benötigen, auf einer
          leistungsstarken Plattform.
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              KI-Schulden-Chatbot
            </h3>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Chatten Sie mit unserem KI-Assistenten und erhalten Sie sofortige
              Antworten um einen SOS Schulden Notfallplan zu erstellen.
            </p>
            <div className="space-y-4 mb-8">
              {[
                "Sofortige Antworten zu ihrer Schuldenfreiheit",
                "Verifizierte Zitate aus echten Quellen",
                "24/7 Verfügbarkeit für rechtliche Beratung",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8CC63F] flex items-center justify-center mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-slate-700 text-lg">{item}</span>
                </div>
              ))}
            </div>
            <Link
              href="/login"
              className="bg-[#8CC63F] hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2 group"
            >
              KI-Chatbot Testen
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div
                role="img"
                aria-label="KI-Rechts-Chatbot Interface"
                className="w-full aspect-[16/9] flex items-center justify-center bg-slate-100 text-slate-400 text-sm"
              >
                Mockup (in der oeffentlichen Fassung entfernt)
              </div>
            </div>
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-200 rounded-full blur-3xl opacity-50 -z-10"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-emerald-200 rounded-full blur-3xl opacity-50 -z-10"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
