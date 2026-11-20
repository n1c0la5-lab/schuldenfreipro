"use client";

import { motion } from "motion/react";

// Oeffentliche Fassung: Namen und Lebenslaeufe des Gruenderteams entfernt,
// nur die Rollenaufteilung (Recht / Technik / Data Science) bleibt.
const teamMembers = [
  {
    name: "Legal Lead",
    role: "CEO & Legal Lead",
    roleColor: "text-pink-500",
    description:
      "Volljurist mit Erfahrung in Schulden- und Insolvenzberatung.",
  },
  {
    name: "Technik",
    role: "CTO & Co-Founder",
    roleColor: "text-purple-500",
    description:
      "Verantwortet Plattform, Automatisierung und Produktentwicklung.",
  },
  {
    name: "Data Science",
    role: "Data Science Lead & Co-Founder",
    roleColor: "text-purple-500",
    description:
      "Entwickelt die technische Infrastruktur und Datenanalyse-Systeme.",
  },
];

export function TeamSection() {
  return (
    <section id="team" className="py-24 bg-white text-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Unser Team
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 max-w-3xl mx-auto"
          >
            Gegründet von Experten mit komplementären Fähigkeiten: Recht,
            Technologie und Data Science
          </motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-blue-100"
            >
              <h3 className="text-xl font-bold mb-2">{member.name}</h3>
              <p className={`${member.roleColor} font-semibold mb-4 text-sm`}>
                {member.role}
              </p>
              <p className="text-slate-700 leading-relaxed">
                {member.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
