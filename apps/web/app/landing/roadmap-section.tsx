"use client";

import { motion } from "motion/react";
import { Rocket, CheckCircle2, ArrowRight } from "lucide-react";

const achieved = [
  "Dokumentenanalyse-Technologie entwickelt",
  "Datenbank-Architektur aufgebaut",
  "Rechtliche Prüfung (RDG-Konformität) abgeschlossen",
  "Erste Mandanten in Pilotphase",
];

const nextSteps = [
  "Fertigstellung der Web-Plattform",
  "Entwicklung der Mobile Apps",
  "Onboarding erster Partner-Anwälte",
  "Öffentlicher Launch Q1 2026",
];

export function RoadmapSection() {
  return (
    <section id="roadmap" className="py-24 bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Wo wir stehen
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-2xl p-8 mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <Rocket className="w-8 h-8 text-emerald-600" />
            <h3 className="text-2xl font-bold">Plattform in Entwicklung</h3>
          </div>
          <p className="text-slate-700 leading-relaxed">
            Unsere Technologie wird aktuell entwickelt und in einer bestehenden
            Rechtsanwaltskanzlei getestet. Die Kernfunktionalitäten sind bereits
            funktionsfähig.
          </p>
          <p className="text-sm text-slate-600 mt-3">
            Geplanter Launch: <strong>Q1 2026</strong>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white border-2 border-emerald-200 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              <h3 className="text-2xl font-bold text-emerald-700">
                Bereits erreicht
              </h3>
            </div>
            <ul className="space-y-4">
              {achieved.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white border-2 border-blue-200 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-3 mb-6">
              <ArrowRight className="w-8 h-8 text-blue-700" />
              <h3 className="text-2xl font-bold text-blue-800">
                Nächste Schritte
              </h3>
            </div>
            <ul className="space-y-4">
              {nextSteps.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-blue-700 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
