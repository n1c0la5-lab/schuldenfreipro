"use client";

import { motion } from "motion/react";
import { FileText, HeartHandshake, ShieldCheck } from "lucide-react";

const services = [
  {
    icon: <FileText className="w-10 h-10 text-emerald-500" />,
    title: "Digitale Analyse",
    description:
      "Unsere KI-gestützte Plattform analysiert Ihre finanzielle Situation in Sekundenschnelle und schafft sofortige Klarheit.",
  },
  {
    icon: <HeartHandshake className="w-10 h-10 text-blue-700" />,
    title: "Persönliche Beratung",
    description:
      "Echte Experten an Ihrer Seite. Wir kombinieren digitale Effizienz mit menschlicher Empathie und Fachwissen.",
  },
  {
    icon: <ShieldCheck className="w-10 h-10 text-emerald-600" />,
    title: "Rechtliche Sicherheit",
    description:
      "Von der außergerichtlichen Einigung bis zum Insolvenzverfahren – wir begleiten Sie rechtssicher durch jeden Schritt.",
  },
];

export function WhatWeDo() {
  return (
    <section className="py-24 bg-gradient-to-br from-emerald-50 via-slate-50 to-blue-50 text-slate-900 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-blue-700 bg-clip-text text-transparent"
          >
            Was wir tun
          </motion.h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Wir revolutionieren die Schuldnerberatung. Weg von verstaubten
            Aktenordnern, hin zu einer transparenten, digitalen Zukunft.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-white p-8 rounded-2xl border border-emerald-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">
                {service.title}
              </h3>
              <p className="text-slate-600 text-center leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
