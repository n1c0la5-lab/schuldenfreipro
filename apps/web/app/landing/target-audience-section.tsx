"use client";

import { motion } from "motion/react";
import { Users, Scale, Handshake } from "lucide-react";

const audiences = [
  {
    icon: <Users className="w-12 h-12 text-purple-600" />,
    title: "Für Betroffene",
    description:
      "Menschen, die einen Weg aus der Überschuldung suchen und dabei professionelle Unterstützung benötigen.",
    benefits: [
      "Klarer Überblick über die Schuldensituation",
      "Anwaltliche Beratung und Begleitung",
      "Strukturierter Weg zur Schuldenfreiheit",
    ],
  },
  {
    icon: <Scale className="w-12 h-12 text-amber-500" />,
    title: "Für Anwälte",
    description:
      "Rechtsanwälte, die ihre Kanzlei aufbauen oder ihr Portfolio im Insolvenzrecht erweitern möchten.",
    benefits: [
      "Vorbereitete Mandate aus der Region",
      "Strukturierte Akten und Daten",
      "Effizientes Arbeiten mit digitalen Tools",
    ],
  },
  {
    icon: <Handshake className="w-12 h-12 text-amber-400" />,
    title: "Für Partner",
    description:
      "Investoren, Kooperationspartner und Medien, die an innovativen Lösungen im Bereich Legal-Tech interessiert sind.",
    benefits: [
      "Bewiesener Product-Market-Fit",
      "Erfahrenes, komplementäres Team",
      "Riesiger Markt mit gesellschaftlicher Relevanz",
    ],
  },
];

export function TargetAudienceSection() {
  return (
    <section id="fuer-wen" className="py-24 bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Für wen wir da sind
          </motion.h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {audiences.map((audience, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-white p-8 rounded-2xl border border-blue-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-center mb-6">
                {audience.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">
                {audience.title}
              </h3>
              <p className="text-slate-700 text-center mb-6 leading-relaxed">
                {audience.description}
              </p>
              <ul className="space-y-3">
                {audience.benefits.map((benefit, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <span className="text-green-500 mt-0.5">&#10003;</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
