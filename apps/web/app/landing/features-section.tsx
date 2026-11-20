"use client";

import { motion } from "motion/react";
import { Upload, Scale, CheckCircle } from "lucide-react";

const features = [
  {
    number: "01",
    icon: <Upload className="w-8 h-8 text-emerald-600" />,
    title: "Dokumente hochladen",
    description:
      "Lade deine Unterlagen hoch – unsere KI strukturiert alles in Minuten und gibt dir einen ersten Überblick.",
  },
  {
    number: "02",
    icon: <Scale className="w-8 h-8 text-blue-700" />,
    title: "Anwaltliche Prüfung",
    description:
      "Ein zugelassener Rechtsanwalt prüft deinen Fall und erstellt einen verbindlichen, rechtssicheren Plan.",
  },
  {
    number: "03",
    icon: <CheckCircle className="w-8 h-8 text-emerald-600" />,
    title: "Weg zur Schuldenfreiheit",
    description:
      "Du erhältst Klarheit, Sicherheit und einen konkreten Fahrplan – digital und mit persönlicher Betreuung.",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="funktionen"
      className="py-24 bg-gradient-to-br from-emerald-50 via-slate-50 to-blue-100 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 right-20 w-64 h-64 bg-emerald-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
          >
            So funktioniert es
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto"
          >
            Erhalten Sie rechtliche Unterstützung in 3 einfachen Schritten
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative group"
            >
              <div className="relative bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                <div className="absolute top-4 right-4 text-[120px] font-bold text-slate-200/30 leading-none select-none">
                  {feature.number}
                </div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 shadow-md">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-blue-900 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
